/**
 * DEAL KEY DATES — the calendar commitments on a deal (CRM_WORKFLOW_SPEC.md
 * build order §2; migration 131; Paul, 2026-08-16: "All of this needs to be
 * running in app properly").
 *
 * Five DATE columns on `deals`, two kinds of fact:
 *   · RECORDS — ioi_sent_on, loi_signed_on. They date the file. Nothing
 *     counts down to a thing that already happened.
 *   · DEADLINES — exclusivity_expires_on, financing_commitment_on,
 *     target_close_on. These drive Today's countdown, and a PAST deadline
 *     still binds — an expired exclusivity is the loudest fact on the board,
 *     so the feed includes overdue dates rather than hiding them.
 *
 *   GET   /api/deals/:dealId/dates     the five dates for one deal
 *   PATCH /api/deals/:dealId/dates     any subset; YYYY-MM-DD or null
 *   GET   /api/deals/key-dates         the countdown feed across active deals
 *
 * ── THIS ROUTE CALLS NO MODEL ───────────────────────────────────────────
 * Dates in, dates out, day arithmetic in SQL. THE SPLIT's app-side shape:
 * forms and SQL, zero spend however often Today polls it.
 *
 * ── MISSING ≠ ZERO ──────────────────────────────────────────────────────
 * A deal with no dates set contributes nothing to the feed and renders as
 * five empty cells — never a fabricated "0 days" or a defaulted today.
 */
import { Router } from 'express';
import { sql } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

export const dealDatesRouter = Router();
dealDatesRouter.use(requireAuth);

/** The five, in file order. Mirrors KEY_DATE fields in KeyDatesCard.tsx. */
const DATE_KEYS = [
  'ioi_sent_on', 'loi_signed_on', 'exclusivity_expires_on',
  'financing_commitment_on', 'target_close_on',
] as const;
type DateKey = (typeof DATE_KEYS)[number];

const LABEL: Record<DateKey, string> = {
  ioi_sent_on: 'IoI sent',
  loi_signed_on: 'LOI signed',
  exclusivity_expires_on: 'Exclusivity expires',
  financing_commitment_on: 'Financing commitment',
  target_close_on: 'Target close',
};

/** A well-formed calendar date. The regex catches shape; the Date round-trip
 *  catches 2026-02-31, which matches the regex and is not a day. */
function validDate(v: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  return Number.isFinite(Date.parse(`${v}T00:00:00Z`));
}

/** GET /api/deals/key-dates?within=14 — the countdown feed.
 *
 *  One row per (deal, deadline) across the user's ACTIVE, non-archived deals
 *  where the date is set and ≤ `within` days away — INCLUDING overdue.
 *  Records (IoI, LOI) are excluded by construction: the LATERAL below simply
 *  never lists them. Ordered soonest first, so the most-overdue row leads.
 *
 *  Declared BEFORE /:dealId/dates for clarity, though the paths cannot
 *  collide — the param route only matches with the /dates suffix. */
dealDatesRouter.get('/deals/key-dates', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const raw = Number(req.query.within);
    // Bad or missing `within` falls back to 14 rather than erroring — the
    // window is presentation, not data, and clamping keeps a typo'd 1400
    // from turning the queue into a calendar dump.
    const within = Number.isFinite(raw) ? Math.min(Math.max(Math.round(raw), 0), 365) : 14;

    /* daysLeft in SQL: (date - CURRENT_DATE) is already an integer of days
       for DATE operands, but postgres-js hands int8/COUNT back as strings,
       so ::int keeps the wire honest. `on` is a reserved word — quoted. */
    const rows = await sql`
      SELECT d.id            AS deal_id,
             d.business_name AS business_name,
             c.firm          AS client_firm,
             k.kind          AS kind,
             k."on"::text    AS on_date,
             (k."on" - CURRENT_DATE)::int AS days_left
      FROM deals d
      LEFT JOIN crm_accounts c ON c.id = d.crm_account_id
      CROSS JOIN LATERAL (VALUES
        ('exclusivity_expires_on',  d.exclusivity_expires_on),
        ('financing_commitment_on', d.financing_commitment_on),
        ('target_close_on',         d.target_close_on)
      ) AS k(kind, "on")
      WHERE d.user_id = ${userId}
        AND d.status = 'active' AND d.archived = FALSE
        AND k."on" IS NOT NULL
        AND (k."on" - CURRENT_DATE) <= ${within}
      ORDER BY (k."on" - CURRENT_DATE) ASC, d.business_name ASC, k.kind ASC
    `;

    return res.json({
      items: rows.map((r: any) => ({
        dealId: r.deal_id,
        businessName: r.business_name,
        clientFirm: r.client_firm ?? null,
        kind: r.kind,
        label: LABEL[r.kind as DateKey],
        on: r.on_date,
        daysLeft: r.days_left,
      })),
    });
  } catch (err: any) {
    console.error('key-dates feed error:', err.message);
    return res.status(500).json({ error: 'Failed to load the countdown' });
  }
});

/** GET /api/deals/:dealId/dates — all five, records and deadlines alike. */
dealDatesRouter.get('/deals/:dealId/dates', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const dealId = Number(req.params.dealId);
    if (!Number.isInteger(dealId)) return res.status(400).json({ error: 'Bad deal id' });

    /* ::text so the wire carries plain YYYY-MM-DD — postgres-js would
       otherwise hand back Date objects that serialise with a timezone. */
    const [row] = await sql`
      SELECT ioi_sent_on::text, loi_signed_on::text, exclusivity_expires_on::text,
             financing_commitment_on::text, target_close_on::text
      FROM deals WHERE id = ${dealId} AND user_id = ${userId}
    `;
    if (!row) return res.status(404).json({ error: 'Deal not found' });
    return res.json({ dates: row });
  } catch (err: any) {
    console.error('deal dates read error:', err.message);
    return res.status(500).json({ error: 'Failed to load the key dates' });
  }
});

/** PATCH /api/deals/:dealId/dates — any subset of the five. A null CLEARS
 *  the date (legal — a walked-back LOI un-dates the file); anything that is
 *  not YYYY-MM-DD or null is refused naming the field. Returns the saved
 *  five, same shape as the GET. */
dealDatesRouter.patch('/deals/:dealId/dates', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const dealId = Number(req.params.dealId);
    if (!Number.isInteger(dealId)) return res.status(400).json({ error: 'Bad deal id' });

    const [deal] = await sql`
      SELECT id FROM deals WHERE id = ${dealId} AND user_id = ${userId}
    `;
    if (!deal) return res.status(404).json({ error: 'Deal not found' });

    const b = (req.body ?? {}) as Record<string, unknown>;
    const updates: Record<string, string | null> = {};
    for (const key of DATE_KEYS) {
      if (!(key in b)) continue;
      const v = b[key];
      if (v === null || v === '') { updates[key] = null; continue; }
      if (typeof v === 'string' && validDate(v)) { updates[key] = v; continue; }
      return res.status(400).json({
        error: `${key} must be a YYYY-MM-DD date or null, got ${JSON.stringify(v)}`,
      });
    }
    if (!Object.keys(updates).length) {
      return res.status(400).json({
        error: `Nothing to save — send any of: ${DATE_KEYS.join(', ')}`,
      });
    }

    const [saved] = await sql`
      UPDATE deals SET ${sql(updates)}
      WHERE id = ${dealId} AND user_id = ${userId}
      RETURNING ioi_sent_on::text, loi_signed_on::text, exclusivity_expires_on::text,
                financing_commitment_on::text, target_close_on::text
    `;
    return res.json({ dates: saved });
  } catch (err: any) {
    console.error('deal dates patch error:', err.message);
    return res.status(500).json({ error: 'Failed to save the key dates' });
  }
});
