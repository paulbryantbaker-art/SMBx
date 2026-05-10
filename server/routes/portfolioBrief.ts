import { Router } from 'express';
import { sql } from '../db.js';
import { getDealBriefForUser, getPortfolioBriefForUser } from '../services/yuliaBriefingService.js';

export const portfolioBriefRouter = Router();

type Tone = 'gold' | 'cactus' | 'oat' | 'plum' | 'charcoal';

portfolioBriefRouter.get('/agency/deals/:dealId/brief', async (req, res) => {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });
    const dealId = parseInt(req.params.dealId, 10);
    if (!dealId) return res.status(400).json({ error: 'Invalid deal ID' });
    const forceRefresh = req.query.refresh === '1' || req.query.refresh === 'true';
    return res.json(await getDealBriefForUser(userId, dealId, forceRefresh));
  } catch (err: any) {
    console.error('Yulia deal brief error:', err.message);
    return res.status(500).json({ error: 'Failed to build deal intelligence brief' });
  }
});

interface DealRow {
  id: number;
  business_name: string | null;
  industry: string | null;
  location: string | null;
  journey_type: string | null;
  current_gate: string | null;
  league: string | null;
  status: string;
  revenue: number | null;
  sde: number | null;
  ebitda: number | null;
  asking_price: number | null;
  financials: Record<string, any> | null;
  seven_factor_composite: number | null;
  updated_at: string;
  deliverable_count?: number | string;
  document_count?: number | string;
}

interface DeliverableRow {
  id: number;
  deal_id: number | null;
  status: string;
  created_at: string;
  completed_at: string | null;
  is_stale?: boolean | null;
  stale_reason?: string | null;
  slug: string | null;
  name: string | null;
  deliverable_type: string | null;
  deal_name: string | null;
}

interface ReviewRow {
  id: number;
  deal_id: number | null;
  status: string;
  reviewer_role: string | null;
  focus_areas: string | null;
  created_at: string;
  requester_name: string | null;
  doc_name: string | null;
  deal_name: string | null;
}

interface StagedActionRow {
  id: number;
  tool_name: string;
  action_label: string | null;
  risk_level: string | null;
  input: Record<string, any> | null;
  created_at: string;
}

portfolioBriefRouter.get('/agency/portfolio-brief', async (req, res) => {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });
    const forceRefresh = req.query.refresh === '1' || req.query.refresh === 'true';
    return res.json(await getPortfolioBriefForUser(userId, forceRefresh));
  } catch (err: any) {
    console.error('Yulia portfolio brief error, falling back:', err.message);
  }

  try {
    const userId = (req as any).userId;
    const ownedDeals = await sql<DealRow[]>`
      SELECT d.id, d.business_name, d.industry, d.location, d.journey_type,
             d.current_gate, d.league, d.status, d.revenue, d.sde, d.ebitda,
             d.asking_price, d.financials, d.seven_factor_composite,
             d.updated_at,
             (SELECT COUNT(*) FROM deliverables del WHERE del.deal_id = d.id AND del.status = 'complete') as deliverable_count,
             (SELECT COUNT(*) FROM data_room_documents doc WHERE doc.deal_id = d.id) as document_count
      FROM deals d
      WHERE d.user_id = ${userId} AND d.status = 'active'
      ORDER BY d.updated_at DESC
      LIMIT 25
    `;

    const participatedDeals = await sql<DealRow[]>`
      SELECT d.id, d.business_name, d.industry, d.location, d.journey_type,
             d.current_gate, d.league, d.status, d.revenue, d.sde, d.ebitda,
             d.asking_price, d.financials, d.seven_factor_composite,
             d.updated_at,
             (SELECT COUNT(*) FROM deliverables del WHERE del.deal_id = d.id AND del.status = 'complete') as deliverable_count,
             (SELECT COUNT(*) FROM data_room_documents doc WHERE doc.deal_id = d.id) as document_count
      FROM deals d
      JOIN deal_participants dp ON dp.deal_id = d.id
      WHERE dp.user_id = ${userId} AND dp.accepted_at IS NOT NULL AND d.status = 'active'
      ORDER BY d.updated_at DESC
      LIMIT 25
    `;

    const deals = dedupeDeals([...ownedDeals, ...participatedDeals]);
    const dealIds = deals.map(deal => deal.id);

    const deliverables = dealIds.length > 0
      ? await sql<DeliverableRow[]>`
          SELECT d.id, d.deal_id, d.status, d.created_at, d.completed_at,
                 d.is_stale, d.stale_reason,
                 m.slug, m.name, m.deliverable_type,
                 dl.business_name as deal_name
          FROM deliverables d
          JOIN menu_items m ON m.id = d.menu_item_id
          LEFT JOIN deals dl ON dl.id = d.deal_id
          WHERE d.user_id = ${userId}
            AND d.deal_id = ANY(${dealIds})
          ORDER BY COALESCE(d.completed_at, d.created_at) DESC
          LIMIT 40
        `
      : [];

    const pendingReviews = dealIds.length > 0
      ? await sql<ReviewRow[]>`
          SELECT rr.id, rr.deal_id, rr.status, rr.reviewer_role, rr.focus_areas,
                 rr.created_at,
                 req.display_name as requester_name,
                 COALESCE(m.name, doc.name) as doc_name,
                 dl.business_name as deal_name
          FROM review_requests rr
          JOIN users req ON req.id = rr.requested_by
          LEFT JOIN deliverables del ON del.id = rr.deliverable_id
          LEFT JOIN menu_items m ON m.id = del.menu_item_id
          LEFT JOIN data_room_documents doc ON doc.id = rr.document_id
          LEFT JOIN deals dl ON dl.id = rr.deal_id
          WHERE (rr.requested_by = ${userId} OR rr.reviewer_id = ${userId})
            AND rr.status IN ('pending', 'reviewing')
          ORDER BY rr.created_at ASC
          LIMIT 20
        `
      : [];

    let stagedActions: StagedActionRow[] = [];
    try {
      stagedActions = await sql<StagedActionRow[]>`
        SELECT id, tool_name, action_label, risk_level, input, created_at
        FROM agency_staged_actions
        WHERE user_id = ${userId} AND status = 'pending'
        ORDER BY created_at DESC
        LIMIT 10
      `;
    } catch (err: any) {
      console.warn('[portfolio brief] staged actions unavailable:', err.message);
    }

    const rankedDeals = [...deals].sort((a, b) => fitScore(b) - fitScore(a));
    const lead = rankedDeals[0] ?? deals[0] ?? null;
    const inProgress = deliverables.filter(d => ['queued', 'pending', 'generating'].includes(d.status));
    const stale = deliverables.filter(d => d.is_stale);
    const complete = deliverables.filter(d => d.status === 'complete');
    const dataRoomCount = deals.reduce((sum, d) => sum + Number(d.document_count ?? 0), 0);

    return res.json({
      source: 'live',
      generatedAt: new Date().toISOString(),
      hero: buildHero(lead, { deals, deliverables, pendingReviews, stagedActions, stale }),
      liveDesk: buildLiveDesk({ deals, deliverables, inProgress, pendingReviews, stagedActions }),
      priorities: buildPriorities({ lead, deals: rankedDeals, pendingReviews, stagedActions, stale, inProgress }),
      files: buildFiles(deliverables),
      dealStats: {
        activeDeals: deals.length,
        completedDeliverables: complete.length,
        inProgressDeliverables: inProgress.length,
        pendingReviews: pendingReviews.length,
        stagedActions: stagedActions.length,
        dataRoomItems: dataRoomCount,
      },
      deals: rankedDeals.slice(0, 5).map((deal, index) => dealToBriefDeal(deal, index)),
    });
  } catch (err: any) {
    console.error('Portfolio brief error:', err.message);
    return res.status(500).json({ error: 'Failed to build portfolio brief' });
  }
});

function dedupeDeals(deals: DealRow[]): DealRow[] {
  const seen = new Set<number>();
  return deals.filter(deal => {
    if (seen.has(deal.id)) return false;
    seen.add(deal.id);
    return true;
  });
}

function buildHero(
  lead: DealRow | null,
  context: {
    deals: DealRow[];
    deliverables: DeliverableRow[];
    pendingReviews: ReviewRow[];
    stagedActions: StagedActionRow[];
    stale: DeliverableRow[];
  },
) {
  if (!lead) {
    return {
      title: 'Yulia is ready when your first deal lands.',
      lede: 'No private workspace data is attached to this account yet. Start with a chat, source file, target, buyer pool, or deal thesis and Yulia will build the right surfaces around it.',
      primaryLabel: 'Start with Yulia',
      primaryPrompt: 'Help me start my first SMBx deal workspace.',
      secondaryLabel: 'Open pipeline',
      notes: [
        { label: 'First step', text: 'Tell Yulia the situation in plain English. She handles the software setup.' },
        { label: 'Sources', text: 'Drop in a CIM, teaser, financials, LOI, NDA, or even rough notes.' },
        { label: 'Output', text: 'Yulia can create the deal, organize files, and prepare the first analysis.' },
      ],
    };
  }

  const name = dealName(lead);
  const nextMove = context.stagedActions.length > 0
    ? 'the next approval'
    : context.pendingReviews.length > 0
      ? 'review queue'
      : context.stale.length > 0
        ? 'the next refresh'
        : 'the next move';

  return {
    title: `Yulia's read: ${name} needs your eye before ${nextMove}.`,
    lede: leadLede(lead, context),
    primaryLabel: primaryLabel(context),
    primaryPrompt: primaryPrompt(lead, context),
    secondaryLabel: 'Open deal',
    secondaryDealId: String(lead.id),
    notes: [
      { label: 'Why now', text: whyNow(lead, context) },
      { label: 'Risk', text: riskNote(lead, context) },
      { label: 'Move', text: moveNote(lead, context) },
    ],
  };
}

function buildLiveDesk(context: {
  deals: DealRow[];
  deliverables: DeliverableRow[];
  inProgress: DeliverableRow[];
  pendingReviews: ReviewRow[];
  stagedActions: StagedActionRow[];
}) {
  const latestWork = context.inProgress[0] ?? context.deliverables[0] ?? null;
  const pursue = context.deals.filter(deal => fitScore(deal) >= 80).length;
  const watch = Math.max(context.deals.length - pursue, 0);
  const decisionCount = context.pendingReviews.length + context.stagedActions.length;

  return [
    {
      eyebrow: latestWork && context.inProgress.length > 0 ? 'DRAFTING' : 'WORKSPACE',
      title: latestWork ? displayDeliverableName(latestWork) : `${context.deliverables.length} files`,
      sub: latestWork
        ? `${latestWork.deal_name || 'Deal'} · ${statusLabel(latestWork.status)}`
        : 'No generated work products yet',
      pct: latestWork ? progressForStatus(latestWork.status) : 0,
      tone: 'gold' as Tone,
      prompt: latestWork
        ? `What changed on ${displayDeliverableName(latestWork)}?`
        : 'What should I create first?',
    },
    {
      eyebrow: 'WATCHING',
      title: `${context.deals.length} active deals`,
      sub: `${pursue} pursue · ${watch} watch across the portfolio`,
      pct: context.deals.length > 0 ? Math.min(100, Math.max(18, pursue * 18 + watch * 8)) : 0,
      tone: 'plum' as Tone,
      prompt: 'What changed across my active deals?',
    },
    {
      eyebrow: 'DECISIONS',
      title: decisionCount > 0 ? `${decisionCount} waiting` : 'No blockers',
      sub: decisionCount > 0
        ? `${context.pendingReviews.length} reviews · ${context.stagedActions.length} approvals`
        : 'No review or approval blockers are open',
      pct: decisionCount > 0 ? Math.min(100, 38 + decisionCount * 12) : 12,
      tone: decisionCount > 0 ? 'cactus' as Tone : 'oat' as Tone,
      prompt: 'Show me every approval or review waiting on me.',
    },
  ];
}

function buildPriorities(context: {
  lead: DealRow | null;
  deals: DealRow[];
  pendingReviews: ReviewRow[];
  stagedActions: StagedActionRow[];
  stale: DeliverableRow[];
  inProgress: DeliverableRow[];
}) {
  const priorities: any[] = [];

  for (const action of context.stagedActions.slice(0, 2)) {
    priorities.push({
      kicker: 'APPROVAL',
      title: action.action_label || action.tool_name,
      sub: `Yulia staged this action. Confirm or cancel before anything changes.`,
      cta: 'Review',
      tone: action.risk_level === 'high' ? 'gold' : 'plum',
      prompt: `Review the staged action: ${action.action_label || action.tool_name}.`,
    });
  }

  for (const review of context.pendingReviews.slice(0, 2)) {
    priorities.push({
      kicker: 'WAITING ON YOU',
      title: `Review ${review.doc_name || 'document'}`,
      sub: `${review.deal_name || 'Deal'} · ${review.reviewer_role || 'review'} requested`,
      cta: 'Review',
      tone: 'plum',
      docTitle: review.doc_name || 'Review request',
    });
  }

  for (const doc of context.stale.slice(0, 2)) {
    priorities.push({
      kicker: 'REFRESH',
      title: `Refresh ${displayDeliverableName(doc)}`,
      sub: `${doc.deal_name || 'Deal'} · ${doc.stale_reason || 'source data changed'}`,
      cta: 'Refresh',
      tone: 'gold',
      docId: String(doc.id),
      docTitle: displayDeliverableName(doc),
    });
  }

  if (context.lead) {
    priorities.push({
      kicker: 'PIPELINE',
      title: `${dealName(context.lead)} is the lead focus`,
      sub: `${fmtCents(context.lead.revenue)} revenue · ${fitScore(context.lead)} fit · ${gateLabel(context.lead.current_gate)}`,
      cta: 'Open deal',
      tone: toneForDeal(context.lead),
      dealId: String(context.lead.id),
      dealTitle: dealName(context.lead),
    });
  }

  const nextDeal = context.deals.find(deal => context.lead && deal.id !== context.lead.id);
  if (nextDeal) {
    priorities.push({
      kicker: 'NEXT READ',
      title: `${dealName(nextDeal)} moved into view`,
      sub: `${gateLabel(nextDeal.current_gate)} · ${fmtCents(nextDeal.ebitda ?? nextDeal.sde)} earnings proxy`,
      cta: 'Open deal',
      tone: toneForDeal(nextDeal),
      dealId: String(nextDeal.id),
      dealTitle: dealName(nextDeal),
    });
  }

  if (priorities.length === 0) {
    priorities.push(
      {
        kicker: 'START',
        title: 'Create your first deal workspace',
        sub: 'Tell Yulia what you are buying, selling, raising, or evaluating. She will build the working surface around it.',
        cta: 'Start',
        tone: 'cactus',
        prompt: 'Help me start my first SMBx deal workspace.',
      },
      {
        kicker: 'IMPORT',
        title: 'Bring in source material',
        sub: 'Upload or describe a CIM, teaser, financials, or target profile so Yulia can organize the first analysis.',
        cta: 'Ask Yulia',
        tone: 'plum',
        prompt: 'Help me import source materials for a new deal.',
      },
      {
        kicker: 'SEARCH',
        title: 'Find buyers, targets, or advisors',
        sub: 'Start with a thesis and let Yulia assemble the search surface.',
        cta: 'Search',
        tone: 'gold',
        tabKind: 'search',
      },
    );
  }

  return priorities.slice(0, 3);
}

function buildFiles(deliverables: DeliverableRow[]) {
  return deliverables.slice(0, 5).map((doc): any => {
    const title = displayDeliverableName(doc);
    const analysis = /model|valuation|analysis|sba|comp|risk|tax|financial|score/i.test(`${doc.slug || ''} ${title}`);
    return {
      kind: analysis ? 'chart' : 'doc',
      title,
      sub: `${doc.deal_name || 'Deal'} · ${statusLabel(doc.status)}`,
      status: doc.is_stale ? 'Refresh' : doc.status === 'complete' ? 'Open' : statusLabel(doc.status),
      tone: doc.is_stale ? 'gold' : doc.status === 'complete' ? 'plum' : doc.status === 'failed' ? 'charcoal' : 'gold',
      id: String(doc.id),
    };
  });
}

function dealToBriefDeal(deal: DealRow, index: number) {
  const tones: Tone[] = ['cactus', 'gold', 'oat', 'plum', 'charcoal'];
  const status = fitScore(deal) >= 80 ? 'Pursue' : 'Watch';
  return {
    id: String(deal.id),
    title: dealName(deal),
    meta: `${fmtCents(deal.revenue)} · ${deal.location || deal.industry || 'active deal'}`,
    thesis: deal.financials?.notes || `${fmtCents(deal.sde)} SDE · ${gateLabel(deal.current_gate)}`,
    status,
    fit: fitScore(deal),
    sde: fmtCents(deal.sde),
    multiple: typeof deal.financials?.multiple === 'number' ? `${deal.financials.multiple.toFixed(1)}x` : '--',
    tone: tones[index % tones.length],
  };
}

function leadLede(
  lead: DealRow,
  context: { pendingReviews: ReviewRow[]; stagedActions: StagedActionRow[]; stale: DeliverableRow[]; deliverables: DeliverableRow[] },
) {
  if (context.stagedActions.length > 0) {
    return `${context.stagedActions.length} Yulia action${context.stagedActions.length === 1 ? '' : 's'} need approval before execution. ${dealName(lead)} is still the highest-fit active deal.`;
  }
  if (context.pendingReviews.length > 0) {
    return `${context.pendingReviews.length} review item${context.pendingReviews.length === 1 ? '' : 's'} are waiting across the workspace. Clear the review queue before pushing the next external touch.`;
  }
  if (context.stale.length > 0) {
    return `${context.stale.length} work product${context.stale.length === 1 ? '' : 's'} need refreshed against newer deal data. Start there before relying on old analysis.`;
  }
  if (context.deliverables.length > 0) {
    return `${dealName(lead)} is the strongest live read by fit score. Review the latest work product, then let Yulia prepare the next move.`;
  }
  return `${dealName(lead)} is the strongest live read by fit score. Ask Yulia to run the first analysis or draft the next document.`;
}

function whyNow(
  lead: DealRow,
  context: { pendingReviews: ReviewRow[]; stagedActions: StagedActionRow[]; stale: DeliverableRow[] },
) {
  if (context.stagedActions.length > 0) return 'A staged action is waiting on user approval, so execution is paused on purpose.';
  if (context.pendingReviews.length > 0) return 'Someone is waiting on review, signature, or a decision before the deal can keep moving.';
  if (context.stale.length > 0) return 'Inputs changed after the last work product, so the deck and docs need a clean refresh.';
  return `${dealName(lead)} has the highest current fit score in the portfolio.`;
}

function riskNote(
  lead: DealRow,
  context: { pendingReviews: ReviewRow[]; stagedActions: StagedActionRow[]; stale: DeliverableRow[] },
) {
  if (context.stagedActions.length > 0) return 'Do not let Yulia execute external or material changes without a human confirmation.';
  if (context.pendingReviews.length > 0) return 'Review debt creates timing risk; it blocks clean next steps and external follow-up.';
  if (context.stale.length > 0) return 'Stale analysis can create false precision if the economics changed underneath it.';
  if ((lead.revenue ?? 0) > 0 && (lead.ebitda ?? lead.sde ?? 0) > 0) {
    return `${fmtCents(lead.ebitda ?? lead.sde)} earnings proxy against ${fmtCents(lead.revenue)} revenue.`;
  }
  return 'Deal data is still incomplete; ask Yulia to request the missing economics before leaning on the score.';
}

function moveNote(
  lead: DealRow,
  context: { pendingReviews: ReviewRow[]; stagedActions: StagedActionRow[]; stale: DeliverableRow[] },
) {
  if (context.stagedActions.length > 0) return 'Open the staged action, confirm what is safe, and keep the audit trail clean.';
  if (context.pendingReviews.length > 0) return 'Open the pending review and decide whether it needs changes, counsel, or approval.';
  if (context.stale.length > 0) return 'Regenerate the stale work product, then use the fresh version for the next touch.';
  return `Open ${dealName(lead)} and ask Yulia for the next document or analysis tied to ${gateLabel(lead.current_gate)}.`;
}

function primaryLabel(context: { pendingReviews: ReviewRow[]; stagedActions: StagedActionRow[]; stale: DeliverableRow[] }) {
  if (context.stagedActions.length > 0) return 'Review action';
  if (context.pendingReviews.length > 0) return 'Review queue';
  if (context.stale.length > 0) return 'Refresh docs';
  return 'Ask Yulia';
}

function primaryPrompt(
  lead: DealRow,
  context: { pendingReviews: ReviewRow[]; stagedActions: StagedActionRow[]; stale: DeliverableRow[] },
) {
  if (context.stagedActions.length > 0) return 'Show me the staged actions waiting for approval.';
  if (context.pendingReviews.length > 0) return 'Show me everything waiting on review or signature.';
  if (context.stale.length > 0) return 'Refresh the stale work products that depend on changed deal data.';
  return `What is the best next action for ${dealName(lead)}?`;
}

function dealName(deal: DealRow) {
  return deal.business_name || deal.industry || `Deal #${deal.id}`;
}

function displayDeliverableName(doc: DeliverableRow) {
  if (doc.name) return doc.name;
  if (doc.slug) return doc.slug.replace(/[-_]/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  return `Document #${doc.id}`;
}

function statusLabel(status: string | null | undefined) {
  if (!status) return 'unknown';
  return status.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}

function fmtCents(cents: number | null | undefined): string {
  if (!cents) return '--';
  const dollars = Number(cents) / 100;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(2).replace(/\.?0+$/, '')}M`;
  if (dollars >= 1_000) return `$${Math.round(dollars / 1_000)}K`;
  return `$${Math.round(dollars).toLocaleString()}`;
}

function fitScore(deal: DealRow): number {
  if (typeof deal.seven_factor_composite === 'number' && deal.seven_factor_composite > 0) {
    return Math.max(1, Math.min(99, Math.round(deal.seven_factor_composite)));
  }
  const ebitda = Number(deal.ebitda ?? deal.sde ?? 0) / 100_000_000;
  if (ebitda >= 5) return 92;
  if (ebitda >= 3) return 86;
  if (ebitda >= 2) return 80;
  if (ebitda >= 1) return 74;
  return 68;
}

function toneForDeal(deal: DealRow): Tone {
  const fit = fitScore(deal);
  if (fit >= 86) return 'cactus';
  if (fit >= 78) return 'gold';
  if (fit >= 70) return 'oat';
  return 'plum';
}

function progressForStatus(status: string) {
  if (status === 'complete') return 100;
  if (status === 'generating') return 76;
  if (status === 'queued') return 28;
  if (status === 'pending') return 18;
  if (status === 'failed') return 6;
  return 42;
}

function gateLabel(gate: string | null | undefined): string {
  const labels: Record<string, string> = {
    S0: 'Intake', S1: 'Financials', S2: 'Valuation', S3: 'Packaging', S4: 'Market', S5: 'Closing',
    B0: 'Thesis', B1: 'Sourcing', B2: 'Underwriting', B3: 'Due diligence', B4: 'Structuring', B5: 'Closing',
    R0: 'Capital need', R1: 'Structure', R2: 'Materials', R3: 'Outreach', R4: 'Terms', R5: 'Closing',
    PMI0: 'Day zero', PMI1: 'Stabilization', PMI2: 'Assessment', PMI3: 'Optimization',
  };
  return labels[gate || ''] || gate || 'Active deal';
}
