/**
 * Advisor Mandates — multi-mandate roll-up (advisor sell-side, Phase 3).
 *
 * GET /api/advisor/mandates aggregates the buyer-funnel (deal_buyers) and offer
 * health (deal_offers) across ALL of the signed-in user's OWN active sell-side
 * deals, so an advisor running many mandates sees portfolio-wide funnel + offer
 * activity at a glance. One DB query: two GROUPed subqueries LEFT JOINed onto
 * deals (no N+1, no buyer×offer cross-join that would corrupt counts).
 *
 * Ownership = deals.user_id === userId (no per-deal hasDealAccess loop). SELL-side
 * uses the Cockpit's looser rule (journey_type ILIKE '%sell%' OR current_gate
 * LIKE 'S%'), not sellerDashboard's stricter journey_type='sell'.
 *
 * THE LINE: every field is a factual count / max / soonest-date — operational
 * signals only. NO recommended/priority mandate, NO ranking, NO "best offer";
 * the default order is recency, the UI renders countdowns, the user decides what
 * to work on. Money is integer cents (BIGINT → coerced to number here).
 */
import { Router } from 'express';
import { sql } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

export const advisorMandatesRouter = Router();
advisorMandatesRouter.use(requireAuth);

// Buyer funnel order (matches deal_buyers stages + BUYER_STAGES in useDealBuyers;
// 'passed' is a side bucket). NOTE: the furthest_stage_rank CASE in the SQL below
// (identified=0 … loi=5) must stay in lockstep with this array — a new stage must
// be added to BOTH or furthestStage mislabels.
const STAGE_ORDER = ['identified', 'contacted', 'nda', 'cim', 'ioi', 'loi'] as const;
const OFFER_STATUSES = [
  'received', 'under_review', 'countered', 'accepted', 'declined', 'expired', 'withdrawn',
] as const;

/** int8/BIGINT counts arrive as strings from postgres-js — coerce to a number. */
function num(v: any): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
/** Money cents (nullable): null stays null so the UI renders "—". */
function cents(v: any): number | null {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

advisorMandatesRouter.get('/advisor/mandates', async (req, res) => {
  const userId = (req as any).userId;
  try {
    const rows = await sql`
      SELECT
        d.id AS deal_id,
        COALESCE(d.business_name, d.industry) AS name,
        d.journey_type, d.current_gate, d.league, d.updated_at,
        COALESCE(b.total_buyers, 0)    AS total_buyers,
        COALESCE(b.identified, 0)      AS buyers_identified,
        COALESCE(b.contacted, 0)       AS buyers_contacted,
        COALESCE(b.nda, 0)             AS buyers_nda,
        COALESCE(b.cim, 0)             AS buyers_cim,
        COALESCE(b.ioi, 0)             AS buyers_ioi,
        COALESCE(b.loi, 0)             AS buyers_loi,
        COALESCE(b.passed, 0)          AS buyers_passed,
        b.furthest_stage_rank,
        COALESCE(o.total_offers, 0)    AS total_offers,
        COALESCE(o.received, 0)        AS offers_received,
        COALESCE(o.under_review, 0)    AS offers_under_review,
        COALESCE(o.countered, 0)       AS offers_countered,
        COALESCE(o.accepted, 0)        AS offers_accepted,
        COALESCE(o.declined, 0)        AS offers_declined,
        COALESCE(o.expired, 0)         AS offers_expired,
        COALESCE(o.withdrawn, 0)       AS offers_withdrawn,
        COALESCE(o.live_offers, 0)     AS live_offers,
        o.highest_offer_cents,
        o.latest_offer_at,
        o.soonest_offer_expires_at,
        o.soonest_exclusivity_expires_at
      FROM deals d
      LEFT JOIN (
        SELECT deal_id,
          COUNT(*)                                       AS total_buyers,
          COUNT(*) FILTER (WHERE stage = 'identified')   AS identified,
          COUNT(*) FILTER (WHERE stage = 'contacted')    AS contacted,
          COUNT(*) FILTER (WHERE stage = 'nda')          AS nda,
          COUNT(*) FILTER (WHERE stage = 'cim')          AS cim,
          COUNT(*) FILTER (WHERE stage = 'ioi')          AS ioi,
          COUNT(*) FILTER (WHERE stage = 'loi')          AS loi,
          COUNT(*) FILTER (WHERE stage = 'passed')       AS passed,
          MAX(CASE stage WHEN 'identified' THEN 0 WHEN 'contacted' THEN 1 WHEN 'nda' THEN 2
                         WHEN 'cim' THEN 3 WHEN 'ioi' THEN 4 WHEN 'loi' THEN 5 ELSE -1 END)
            FILTER (WHERE stage <> 'passed')             AS furthest_stage_rank
        FROM deal_buyers GROUP BY deal_id
      ) b ON b.deal_id = d.id
      LEFT JOIN (
        SELECT deal_id,
          COUNT(*)                                          AS total_offers,
          COUNT(*) FILTER (WHERE status = 'received')       AS received,
          COUNT(*) FILTER (WHERE status = 'under_review')   AS under_review,
          COUNT(*) FILTER (WHERE status = 'countered')      AS countered,
          COUNT(*) FILTER (WHERE status = 'accepted')       AS accepted,
          COUNT(*) FILTER (WHERE status = 'declined')       AS declined,
          COUNT(*) FILTER (WHERE status = 'expired')        AS expired,
          COUNT(*) FILTER (WHERE status = 'withdrawn')      AS withdrawn,
          COUNT(*) FILTER (WHERE status IN ('received','under_review','countered')) AS live_offers,
          MAX(total_price_cents) FILTER (WHERE status IN ('received','under_review','countered')) AS highest_offer_cents,
          MAX(COALESCE(submitted_at, created_at))           AS latest_offer_at,
          MIN(expires_at) FILTER (WHERE expires_at >= NOW() AND status IN ('received','under_review','countered')) AS soonest_offer_expires_at,
          MIN(COALESCE(submitted_at, created_at) + make_interval(days => exclusivity_days))
            FILTER (WHERE exclusivity_days IS NOT NULL
                    AND COALESCE(submitted_at, created_at) + make_interval(days => exclusivity_days) >= NOW()
                    AND status IN ('received','under_review','countered')) AS soonest_exclusivity_expires_at
        FROM deal_offers GROUP BY deal_id
      ) o ON o.deal_id = d.id
      WHERE d.user_id = ${userId}
        AND d.status = 'active'
        AND (d.journey_type ILIKE '%sell%' OR d.current_gate LIKE 'S%')
      ORDER BY d.updated_at DESC NULLS LAST`;

    const mandates = rows.map((r: any) => {
      const rank = r.furthest_stage_rank;
      const furthestStage = rank == null || num(rank) < 0 ? null : STAGE_ORDER[num(rank)] ?? null;
      return {
        dealId: num(r.deal_id),
        name: r.name || `Deal #${num(r.deal_id)}`,
        journeyType: r.journey_type ?? null,
        currentGate: r.current_gate ?? null,
        league: r.league ?? null,
        updatedAt: r.updated_at ?? null,
        buyers: {
          total: num(r.total_buyers),
          byStage: {
            identified: num(r.buyers_identified),
            contacted: num(r.buyers_contacted),
            nda: num(r.buyers_nda),
            cim: num(r.buyers_cim),
            ioi: num(r.buyers_ioi),
            loi: num(r.buyers_loi),
            passed: num(r.buyers_passed),
          },
          furthestStage,
        },
        offers: {
          total: num(r.total_offers),
          live: num(r.live_offers),
          byStatus: {
            received: num(r.offers_received),
            under_review: num(r.offers_under_review),
            countered: num(r.offers_countered),
            accepted: num(r.offers_accepted),
            declined: num(r.offers_declined),
            expired: num(r.offers_expired),
            withdrawn: num(r.offers_withdrawn),
          },
          highestOfferCents: cents(r.highest_offer_cents),
          latestOfferAt: r.latest_offer_at ?? null,
          soonestOfferExpiresAt: r.soonest_offer_expires_at ?? null,
          soonestExclusivityExpiresAt: r.soonest_exclusivity_expires_at ?? null,
        },
      };
    });

    // Portfolio totals — pure sums over the already-fetched rows (small N). No
    // ranking/priority; just aggregate facts. buyersInPlay excludes 'passed'.
    const buyersByStage = Object.fromEntries(
      STAGE_ORDER.map((s) => [s, mandates.reduce((a, m) => a + m.buyers.byStage[s], 0)]),
    ) as Record<(typeof STAGE_ORDER)[number], number>;
    const offersByStatus = Object.fromEntries(
      OFFER_STATUSES.map((s) => [s, mandates.reduce((a, m) => a + (m.offers.byStatus as any)[s], 0)]),
    ) as Record<(typeof OFFER_STATUSES)[number], number>;
    const totals = {
      activeMandates: mandates.length,
      buyersInPlay: STAGE_ORDER.reduce((a, s) => a + buyersByStage[s], 0),
      buyersByStage,
      liveOffers: mandates.reduce((a, m) => a + m.offers.live, 0),
      offersByStatus,
    };

    return res.json({ mandates, totals });
  } catch (err: any) {
    console.error('[advisor-mandates] failed:', err.message);
    return res.status(500).json({ error: 'Failed to load mandates' });
  }
});
