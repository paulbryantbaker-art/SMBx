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
  /** CLIENT › DEAL › ACTION (2026-07-31). Paul: "the needs-you page is going to
   *  be Yulia reading my deals and understanding what needs my attention…
   *  Client > Deal > Action." So a row states WHOSE work it is, on WHAT, and
   *  what to do — in that order. `client` is null when nothing is assigned yet,
   *  which is itself an action worth surfacing. */
  client: string | null;
  clientId: number | null;
  /** The client's CRM tier (A–D from house/leads.ts, materialised on the
   *  account row). Breaks ties WITHIN a priority band — see the sort. Null
   *  when the row has no client (orphan deals, reviews, empty states). */
  clientTier: string | null;
  /** The imperative, on its own, so the UI can render the hierarchy rather than
   *  a sentence with the deal name buried in it. */
  action: string;
  /** Why this is on the list, traceable to a record — never a generated claim. */
  because: string;
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
      SELECT d.id, d.business_name, d.journey_type, d.current_gate, d.league,
             d.industry, d.revenue, d.sde, d.ebitda, d.financials,
             d.created_at, d.updated_at,
             -- Client › Deal › Action: a gate row should name whose deal it is.
             a.id AS client_id, a.firm AS client_firm, a.tier AS client_tier
      FROM deals d
      LEFT JOIN crm_accounts a ON a.id = d.crm_account_id
      WHERE d.user_id = ${userId} AND d.status = 'active' AND d.archived = FALSE
      ORDER BY d.updated_at DESC
      LIMIT 10
    `;

    const participatedDeals = await sql`
      SELECT d.id, d.business_name, d.journey_type, d.current_gate, d.league,
             d.industry, d.revenue, d.sde, d.ebitda, d.financials,
             d.created_at, d.updated_at, dp.role as participant_role
      FROM deals d
      JOIN deal_participants dp ON dp.deal_id = d.id
      WHERE dp.user_id = ${userId} AND dp.accepted_at IS NOT NULL AND d.status = 'active' AND d.archived = FALSE
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

    // 2. Load chapter summaries for all active deals (for smarter action descriptions)
    const dealIds = allDeals.map((d: any) => d.id);
    let chapterMap = new Map<number, { title: string; summary: string; gate_label: string }[]>();
    if (dealIds.length > 0) {
      try {
        const chapters = await sql`
          SELECT deal_id, title, summary, gate_label
          FROM conversations
          WHERE deal_id = ANY(${dealIds}) AND gate_status = 'completed' AND summary IS NOT NULL
          ORDER BY updated_at ASC
        `;
        for (const ch of chapters as any[]) {
          if (!chapterMap.has(ch.deal_id)) chapterMap.set(ch.deal_id, []);
          chapterMap.get(ch.deal_id)!.push({ title: ch.title, summary: ch.summary, gate_label: ch.gate_label });
        }
      } catch { /* non-critical */ }
    }

    // 2b. Load active conversation info (last message time, message count)
    let activeConvMap = new Map<number, { id: number; title: string; message_count: number; updated_at: string }>();
    if (dealIds.length > 0) {
      try {
        const activeConvs = await sql`
          SELECT deal_id, id, title, COALESCE(message_count, 0) as message_count, updated_at
          FROM conversations
          WHERE deal_id = ANY(${dealIds}) AND gate_status = 'active' AND is_archived = false
          ORDER BY updated_at DESC
        `;
        for (const c of activeConvs as any[]) {
          if (!activeConvMap.has(c.deal_id)) {
            activeConvMap.set(c.deal_id, { id: c.id, title: c.title, message_count: Number(c.message_count), updated_at: c.updated_at });
          }
        }
      } catch { /* non-critical */ }
    }

    // 3. For each deal, determine the next action using deal state + chapter context
    for (const deal of allDeals as any[]) {
      const name = deal.business_name || deal.industry || 'Untitled deal';
      const journey = deal.journey_type;
      const gate = deal.current_gate;
      const financials = deal.financials || {};
      const chapters = chapterMap.get(deal.id) || [];
      const activeConv = activeConvMap.get(deal.id);

      // Check what's missing for gate advancement
      const missing = getMissingForGate(gate, deal, financials);

      // Build context-aware description using chapter summaries
      const lastChapter = chapters.length > 0 ? chapters[chapters.length - 1] : null;
      const chapterContext = lastChapter
        ? ` Last completed: ${lastChapter.title?.replace(' ✓', '')}.`
        : '';

      // Stale deal detection: if last activity was >7 days ago, nudge
      const lastActivity = activeConv?.updated_at ? new Date(activeConv.updated_at) : new Date(deal.updated_at);
      const daysSinceActivity = Math.floor((Date.now() - lastActivity.getTime()) / 86400000);
      const isStale = daysSinceActivity > 7;

      if (isStale && missing.length > 0) {
        // Stale deal with pending items — higher urgency nudge
        actions.push({
          id: `deal-${deal.id}-stale`,
          dealId: deal.id,
          dealName: name,
          client: deal.client_firm ?? null,
          clientId: deal.client_id ?? null,
          clientTier: deal.client_tier ?? null,
          action: missing[0].label,
          because: `${daysSinceActivity} days since last activity`,
          journeyType: journey,
          currentGate: gate,
          icon: 'schedule',
          title: `${name} — pick up where you left off`,
          description: `${daysSinceActivity} days since last activity.${chapterContext} ${missing[0].label}.`,
          cta: 'Resume',
          priority: 3,
          prefill: missing[0].prefill,
        });
      } else if (missing.length > 0) {
        const topMissing = missing[0];
        actions.push({
          id: `deal-${deal.id}-gate`,
          dealId: deal.id,
          dealName: name,
          client: deal.client_firm ?? null,
          clientId: deal.client_id ?? null,
          clientTier: deal.client_tier ?? null,
          action: topMissing.label,
          because: `${gateLabel(gate)} is waiting on it`,
          journeyType: journey,
          currentGate: gate,
          icon: journeyIcon(journey),
          title: `${name} — ${gateLabel(gate)}`,
          description: `${topMissing.label}${missing.length > 1 ? ` (+${missing.length - 1} more)` : ''}${chapterContext}`,
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
          client: deal.client_firm ?? null,
          clientId: deal.client_id ?? null,
          clientTier: deal.client_tier ?? null,
          action: `Move past ${gateLabel(gate)}`,
          because: 'Everything this gate needs is in',
          journeyType: journey,
          currentGate: gate,
          icon: 'arrow_circle_right',
          title: `${name} — ready to advance`,
          description: `${gateLabel(gate)} is complete.${chapterContext} Move to ${nextGateLabel(gate)}.`,
          cta: 'Continue',
          priority: 1,
          prefill: `Let's advance my ${name} deal to the next stage.`,
        });
      }
    }

    /* ── WHAT IS ACTUALLY OWED (2026-07-31) ────────────────────────────────
     * Client › Deal › Action, from real rows. DELIBERATELY DETERMINISTIC: every
     * line below cites a record — a task with a due date, a next action someone
     * typed, an unassigned deal. Nothing here is generated prose, so nothing here
     * can invent a commitment that was never made. It also costs no API call, so
     * opening Today does not spend money.
     *
     * Ordered by what breaks first: an overdue promise to a third party outranks
     * an internal note, which outranks a gate that merely could advance.
     */

    // 3a. A deal action we owe a third party — a CPA, counsel, a lender.
    try {
      const owed = await sql`
        SELECT t.id, t.title, t.due_on, t.status, t.notified_at, t.assignee_name,
               t.assignee_email, d.id AS deal_id, d.business_name, d.name AS deal_name,
               a.id AS client_id, a.firm, a.tier AS client_tier
        FROM deal_tasks t
        JOIN deals d ON d.id = t.deal_id AND d.archived = FALSE
        LEFT JOIN crm_accounts a ON a.id = d.crm_account_id
        WHERE d.user_id = ${userId}
          AND t.status IN ('open', 'waiting')
          AND t.due_on IS NOT NULL AND t.due_on <= CURRENT_DATE
        ORDER BY t.due_on ASC
        LIMIT 6
      `;
      for (const t of owed) {
        const who = t.assignee_name || t.assignee_email || 'someone';
        const asked = t.status === 'waiting';
        actions.push({
          id: `task-${t.id}`,
          dealId: t.deal_id,
          dealName: t.business_name || t.deal_name || 'a deal',
          client: t.firm ?? null,
          clientId: t.client_id ?? null,
          clientTier: t.client_tier ?? null,
          action: asked ? `Chase ${who} — ${t.title}` : `Ask ${who} — ${t.title}`,
          because: asked
            ? `Asked ${t.notified_at ? 'already' : 'not yet'}, due ${String(t.due_on).slice(0, 10)}`
            : `Due ${String(t.due_on).slice(0, 10)}, not sent yet`,
          journeyType: 'buy', currentGate: null, icon: 'schedule',
          title: t.title,
          description: `${t.business_name || t.deal_name || 'Deal'} — ${asked ? 'waiting on' : 'needs'} ${who}.`,
          cta: asked ? 'Chase' : 'Ask',
          priority: 0,
        });
      }
    } catch (e: any) {
      // Migration 115 may not have run. A missing table must not blank Today.
      console.warn('[next-actions] deal_tasks unavailable:', e?.message);
    }

    // 3b. A next action WE committed to, on a deal or on a client.
    try {
      const dueDeals = await sql`
        SELECT d.id, d.business_name, d.name, d.next_action, d.next_action_on,
               a.id AS client_id, a.firm, a.tier AS client_tier
        FROM deals d
        LEFT JOIN crm_accounts a ON a.id = d.crm_account_id
        WHERE d.user_id = ${userId} AND d.archived = FALSE
          AND d.next_action IS NOT NULL
          AND d.next_action_on IS NOT NULL AND d.next_action_on <= CURRENT_DATE
        ORDER BY d.next_action_on ASC
        LIMIT 6
      `;
      for (const d of dueDeals) {
        actions.push({
          id: `dealnext-${d.id}`,
          dealId: d.id,
          dealName: d.business_name || d.name || 'a deal',
          client: d.firm ?? null,
          clientId: d.client_id ?? null,
          clientTier: d.client_tier ?? null,
          action: d.next_action,
          because: `You set this for ${String(d.next_action_on).slice(0, 10)}`,
          journeyType: 'buy', currentGate: null, icon: 'flag',
          title: d.next_action,
          description: `${d.business_name || d.name} — your next step is due.`,
          cta: 'Open', priority: 1,
        });
      }

      const dueClients = await sql`
        SELECT id, firm, next_action, next_action_on, tier
        FROM crm_accounts
        WHERE user_id = ${userId} AND archived = FALSE
          AND next_action IS NOT NULL
          AND next_action_on IS NOT NULL AND next_action_on <= CURRENT_DATE
        ORDER BY next_action_on ASC
        LIMIT 6
      `;
      for (const c of dueClients) {
        actions.push({
          id: `clientnext-${c.id}`,
          dealId: null, dealName: '',
          client: c.firm, clientId: c.id, clientTier: c.tier ?? null,
          action: c.next_action,
          because: `You set this for ${String(c.next_action_on).slice(0, 10)}`,
          journeyType: 'buy', currentGate: null, icon: 'group',
          title: c.next_action,
          description: `${c.firm} — your next step is due.`,
          cta: 'Open', priority: 1,
        });
      }

      // 3c. A live deal nobody owns. Until a deal names its client, the
      //     one-buyer-per-target check has nothing to compare, so this is a
      //     THE LINE gap and not just untidy data.
      const orphans = await sql`
        SELECT id, business_name, name FROM deals
        WHERE user_id = ${userId} AND archived = FALSE
          AND crm_account_id IS NULL
          AND COALESCE(status, 'active') = 'active'
        ORDER BY updated_at DESC LIMIT 3
      `;
      for (const d of orphans) {
        actions.push({
          id: `orphan-${d.id}`,
          dealId: d.id,
          dealName: d.business_name || d.name || 'a deal',
          client: null, clientId: null, clientTier: null,
          action: 'Assign the client this is run for',
          because: 'One buyer per target cannot be checked without it',
          journeyType: 'buy', currentGate: null, icon: 'link',
          title: 'Assign a client',
          description: `${d.business_name || d.name} is not attached to a client yet.`,
          cta: 'Assign', priority: 2,
        });
      }

      // 3d. A client worth calling that we cannot call.
      const noContact = await sql`
        SELECT a.id, a.firm, a.tier FROM crm_accounts a
        WHERE a.user_id = ${userId} AND a.archived = FALSE
          AND COALESCE(a.kind, 'acquirer') = 'acquirer'
          AND a.tier IN ('A', 'B')
          AND NOT EXISTS (
            SELECT 1 FROM crm_contacts c
            WHERE c.account_id = a.id AND c.email IS NOT NULL AND c.email <> ''
          )
        ORDER BY a.score DESC NULLS LAST LIMIT 3
      `;
      for (const c of noContact) {
        actions.push({
          id: `nocontact-${c.id}`,
          dealId: null, dealName: '',
          client: c.firm, clientId: c.id, clientTier: c.tier ?? null,
          action: 'Find the named contact',
          because: `Tier ${c.tier} with nobody to email`,
          journeyType: 'buy', currentGate: null, icon: 'person_search',
          title: 'Find a contact',
          description: `${c.firm} ranks well but has no email on file.`,
          cta: 'Open', priority: 4,
        });
      }
    } catch (e: any) {
      // Migrations 113–115 may not have run yet.
      console.warn('[next-actions] crm signals unavailable:', e?.message);
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
        // A review is someone else's request, so the person is the "client" of
        // this row — it is who is blocked, which is the point of the hierarchy.
        client: null,
        clientId: null,
        clientTier: null,
        action: `Review ${review.doc_name || 'the document'}`,
        because: `${review.requester_name || 'Someone'} is blocked on it`,
        journeyType: null,
        currentGate: null,
        icon: 'rate_review',
        title: `Review: ${review.doc_name || 'Document'}`,
        description: `${review.requester_name || 'Someone'} needs your ${review.reviewer_role || ''} review.${review.focus_areas ? ` Focus: ${review.focus_areas.substring(0, 80)}` : ''}`,
        cta: 'Review now',
        priority: 0, // Reviews are the most urgent — they block other people
      });
    }

    // 4. Nothing to do yet. The old block here offered "Sell a business" and
    //    "Raise capital" — product-era cards for journeys THE LINE forbids, and
    //    they reappeared the moment the deals were archived. One honest row
    //    instead, pointing at the actual first step of the practice.
    if (actions.length === 0) {
      const [anyClient] = await sql`
        SELECT COUNT(*)::int AS n FROM crm_accounts
        WHERE user_id = ${userId} AND archived = FALSE
      `;
      actions.push(
        anyClient?.n
          ? {
              id: 'start-search',
              dealId: null, dealName: '',
              client: null, clientId: null, clientTier: null,
              action: 'Set up a buy-box for a client',
              because: 'No search is running yet',
              journeyType: 'buy', currentGate: null, icon: 'search',
              title: 'Start a search',
              description: 'Pick a client, set the buy-box, and Sourcing does the hunting.',
              cta: 'Open Sourcing', priority: 9,
            }
          : {
              id: 'start-clients',
              dealId: null, dealName: '',
              client: null, clientId: null, clientTier: null,
              action: 'Import your buy-side register',
              because: 'No clients on the board yet',
              journeyType: 'buy', currentGate: null, icon: 'group',
              title: 'Add your clients',
              description: 'Import the register and every firm is ranked on the way in.',
              cta: 'Open Clients', priority: 9,
            },
      );
    }

    // 5. Sort and return top 5. PRIORITY BAND FIRST, ALWAYS — an overdue
    //    promise on a C-tier client still beats a gate nudge on an A-tier one;
    //    what breaks first is not negotiable. WITHIN a band, the client's CRM
    //    tier (A-D from house/leads.ts) orders the work — a tier-A mandate's
    //    item outranks a same-urgency item for an unassigned or D-tier row.
    //    Untiered/clientless rows sort last in their band. JS sort is stable,
    //    so the existing date/insertion order survives as the final tiebreak.
    const TIER_RANK: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
    const tierRank = (t: string | null) => TIER_RANK[(t || '').toUpperCase()] ?? 4;
    actions.sort((a, b) =>
      (a.priority - b.priority) || (tierRank(a.clientTier) - tierRank(b.clientTier)));
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
