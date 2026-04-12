/**
 * Next Actions API — surfaces 2-5 actionable next steps for the logged-in user.
 * Reads active deals, gate readiness, pending reviews, and recent activity
 * to produce a ranked list of "what to do next."
 *
 * GET /api/user/next-actions
 * Returns: { actions: NextAction[] }
 */

import { Router } from 'express';
import { sql } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

export const nextActionsRouter = Router();
nextActionsRouter.use(requireAuth);

interface NextAction {
  id: string;
  dealId: number | null;
  dealName: string;
  journeyType: string | null;
  currentGate: string | null;
  icon: string;
  title: string;
  description: string;
  cta: string;
  priority: number; // lower = more urgent
  prefill?: string; // pre-fill text for chat input
}

nextActionsRouter.get('/user/next-actions', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const actions: NextAction[] = [];

    // 1. Get all active deals (owned + participated)
    const ownedDeals = await sql`
      SELECT id, business_name, journey_type, current_gate, league,
             industry, revenue, sde, ebitda, financials, created_at, updated_at
      FROM deals
      WHERE user_id = ${userId} AND status = 'active'
      ORDER BY updated_at DESC
      LIMIT 10
    `;

    const participatedDeals = await sql`
      SELECT d.id, d.business_name, d.journey_type, d.current_gate, d.league,
             d.industry, d.revenue, d.sde, d.ebitda, d.financials,
             d.created_at, d.updated_at, dp.role as participant_role
      FROM deals d
      JOIN deal_participants dp ON dp.deal_id = d.id
      WHERE dp.user_id = ${userId} AND dp.accepted_at IS NOT NULL AND d.status = 'active'
      ORDER BY d.updated_at DESC
      LIMIT 10
    `;

    // Deduplicate
    const seenDealIds = new Set<number>();
    const allDeals = [...ownedDeals, ...participatedDeals].filter((d: any) => {
      if (seenDealIds.has(d.id)) return false;
      seenDealIds.add(d.id);
      return true;
    });

    // 2. For each deal, determine the next action
    for (const deal of allDeals as any[]) {
      const name = deal.business_name || deal.industry || 'Untitled deal';
      const journey = deal.journey_type;
      const gate = deal.current_gate;
      const financials = deal.financials || {};

      // Check what's missing for gate advancement
      const missing = getMissingForGate(gate, deal, financials);

      if (missing.length > 0) {
        // There are blocking items — surface the most important one
        const topMissing = missing[0];
        actions.push({
          id: `deal-${deal.id}-gate`,
          dealId: deal.id,
          dealName: name,
          journeyType: journey,
          currentGate: gate,
          icon: journeyIcon(journey),
          title: `${name} — ${gateLabel(gate)}`,
          description: `${topMissing.label}${missing.length > 1 ? ` (+${missing.length - 1} more)` : ''}`,
          cta: topMissing.cta,
          priority: gatePriority(gate),
          prefill: topMissing.prefill,
        });
      } else {
        // Gate is ready to advance
        actions.push({
          id: `deal-${deal.id}-advance`,
          dealId: deal.id,
          dealName: name,
          journeyType: journey,
          currentGate: gate,
          icon: 'arrow_circle_right',
          title: `${name} — ready to advance`,
          description: `${gateLabel(gate)} is complete. Ready to move to ${nextGateLabel(gate)}.`,
          cta: 'Continue',
          priority: 1, // Urgent — user can advance right now
          prefill: `Let's advance my ${name} deal to the next stage.`,
        });
      }
    }

    // 3. Pending review requests (where THIS user is the reviewer)
    const pendingReviews = await sql`
      SELECT rr.id, rr.deal_id, rr.reviewer_role, rr.focus_areas,
             rr.created_at,
             req.display_name as requester_name,
             COALESCE(m.name, d2.name) as doc_name,
             dl.business_name as deal_name
      FROM review_requests rr
      JOIN users req ON req.id = rr.requested_by
      LEFT JOIN deliverables del ON del.id = rr.deliverable_id
      LEFT JOIN menu_items m ON m.id = del.menu_item_id
      LEFT JOIN data_room_documents d2 ON d2.id = rr.document_id
      LEFT JOIN deals dl ON dl.id = rr.deal_id
      WHERE rr.reviewer_id = ${userId} AND rr.status IN ('pending', 'reviewing')
      ORDER BY rr.created_at ASC
      LIMIT 5
    `;

    for (const review of pendingReviews as any[]) {
      actions.push({
        id: `review-${review.id}`,
        dealId: review.deal_id,
        dealName: review.deal_name || 'Deal',
        journeyType: null,
        currentGate: null,
        icon: 'rate_review',
        title: `Review: ${review.doc_name || 'Document'}`,
        description: `${review.requester_name || 'Someone'} needs your ${review.reviewer_role || ''} review.${review.focus_areas ? ` Focus: ${review.focus_areas.substring(0, 80)}` : ''}`,
        cta: 'Review now',
        priority: 0, // Reviews are the most urgent — they block other people
      });
    }

    // 4. If no deals at all, suggest starting one
    if (allDeals.length === 0 && pendingReviews.length === 0) {
      actions.push({
        id: 'start-sell',
        dealId: null,
        dealName: '',
        journeyType: 'sell',
        currentGate: null,
        icon: 'sell',
        title: 'Sell a business',
        description: 'Get your Baseline — Yulia finds what your business is actually worth.',
        cta: 'Start',
        priority: 10,
        prefill: 'I want to sell my business — ',
      });
      actions.push({
        id: 'start-buy',
        dealId: null,
        dealName: '',
        journeyType: 'buy',
        currentGate: null,
        icon: 'shopping_cart',
        title: 'Buy a business',
        description: 'Run The Rundown on any deal — score it in 8 seconds.',
        cta: 'Start',
        priority: 10,
        prefill: 'I want to buy a business — ',
      });
      actions.push({
        id: 'start-raise',
        dealId: null,
        dealName: '',
        journeyType: 'raise',
        currentGate: null,
        icon: 'savings',
        title: 'Raise capital',
        description: 'Model every stack — senior, mezz, equity — see what you keep.',
        cta: 'Start',
        priority: 10,
        prefill: 'I need to raise capital — ',
      });
    }

    // 5. Sort by priority (lower = more urgent) and return top 5
    actions.sort((a, b) => a.priority - b.priority);
    return res.json({ actions: actions.slice(0, 5) });

  } catch (err: any) {
    console.error('Next actions error:', err.message);
    return res.status(500).json({ error: 'Failed to get next actions' });
  }
});

// ─── Helpers ───────────────────────────────────────────────

interface MissingItem {
  label: string;
  cta: string;
  prefill: string;
}

function getMissingForGate(gate: string | null, deal: any, financials: any): MissingItem[] {
  if (!gate) return [];
  const missing: MissingItem[] = [];
  const name = deal.business_name || 'your business';

  switch (gate) {
    case 'S0':
      if (!deal.industry) missing.push({ label: 'Tell Yulia what industry you\'re in', cta: 'Add details', prefill: `My business is in the [industry] space — ` });
      if (!deal.revenue && !deal.sde && !deal.ebitda) missing.push({ label: 'Share your revenue or EBITDA', cta: 'Add financials', prefill: `${name} does about $X in annual revenue — ` });
      break;
    case 'S1':
      if (!financials.sde_verified && !financials.ebitda_verified) missing.push({ label: 'Verify your SDE/EBITDA with Yulia', cta: 'Verify now', prefill: `Let's verify the financials for ${name}. Here are the details — ` });
      if (!financials.add_backs_documented) missing.push({ label: 'Document your add-backs (Blind Equity)', cta: 'Find add-backs', prefill: `Walk me through the add-backs for ${name} — ` });
      break;
    case 'S2':
      if (!financials.valuation_generated) missing.push({ label: 'Generate your Baseline valuation', cta: 'Run Baseline', prefill: `Generate the Baseline valuation for ${name} — ` });
      break;
    case 'B0':
      if (!financials.target_industry) missing.push({ label: 'Define your acquisition thesis', cta: 'Set thesis', prefill: `I'm looking to buy a business in [industry] — ` });
      if (!financials.capital_available) missing.push({ label: 'Share your capital budget', cta: 'Add budget', prefill: `I have about $X available for an acquisition — ` });
      break;
    case 'B1':
      missing.push({ label: 'Screen targets with The Rundown', cta: 'Score deals', prefill: `Run The Rundown on this target: ` });
      break;
    case 'B2':
      if (!financials.valuation_generated) missing.push({ label: 'Build the acquisition model', cta: 'Model it', prefill: `Model the capital stack for ${name} — ` });
      break;
    case 'R0':
      if (!financials.capital_need) missing.push({ label: 'Define how much capital you need', cta: 'Set amount', prefill: `I need to raise about $X for — ` });
      break;
    default:
      // Generic: encourage continuing the conversation
      missing.push({ label: `Continue working on ${gateLabel(gate)}`, cta: 'Continue', prefill: `Let's keep working on ${name} — ` });
      break;
  }

  return missing;
}

function gateLabel(gate: string | null): string {
  const labels: Record<string, string> = {
    S0: 'Intake', S1: 'Financials', S2: 'Valuation', S3: 'Packaging', S4: 'Market', S5: 'Closing',
    B0: 'Thesis', B1: 'Sourcing', B2: 'Underwriting', B3: 'Due Diligence', B4: 'Structuring', B5: 'Closing',
    R0: 'Capital Need', R1: 'Structure', R2: 'Materials', R3: 'Outreach', R4: 'Terms', R5: 'Closing',
    PMI0: 'Day Zero', PMI1: 'Stabilization', PMI2: 'Assessment', PMI3: 'Optimization',
  };
  return labels[gate || ''] || gate || 'Unknown';
}

function nextGateLabel(gate: string | null): string {
  if (!gate) return 'next stage';
  const parts = gate.match(/^([A-Z]+)(\d+)$/);
  if (!parts) return 'next stage';
  const nextNum = parseInt(parts[2], 10) + 1;
  return gateLabel(`${parts[1]}${nextNum}`);
}

function journeyIcon(journey: string | null): string {
  switch (journey) {
    case 'sell': return 'sell';
    case 'buy': return 'shopping_cart';
    case 'raise': return 'savings';
    case 'pmi': return 'merge';
    default: return 'auto_awesome';
  }
}

function gatePriority(gate: string | null): number {
  // Earlier gates = higher priority (get them moving)
  if (!gate) return 5;
  const num = parseInt(gate.replace(/[^0-9]/g, ''), 10);
  return Math.max(2, 5 - num); // S0=5, S1=4, S2=3, S3+=2
}
