import crypto from 'crypto';
import { sql } from '../db.js';
import { callClaudeWithModel } from './aiService.js';
import { getMarketHeat } from './marketHeatService.js';

type Tone = 'gold' | 'cactus' | 'oat' | 'plum' | 'charcoal';
type PortfolioPriorityActionId =
  | 'run_market_intelligence'
  | 'run_tax_legal_structure'
  | 'run_working_capital_analysis'
  | 'run_recast_analysis'
  | 'run_buyer_fit_analysis'
  | 'run_valuation_analysis'
  | 'run_comps_analysis'
  | 'run_capital_structure_model'
  | 'run_sba_analysis'
  | 'run_red_flags_analysis'
  | 'run_qoe_analysis'
  | 'run_lbo_analysis'
  | 'run_dcf_analysis'
  | 'run_sensitivity_analysis'
  | 'run_earnout_analysis'
  | 'run_tax_impact_analysis'
  | 'run_purchase_price_allocation'
  | 'run_cap_table_analysis'
  | 'run_covenant_analysis'
  | 'optimize_scenario'
  | 'compare_deals'
  | 'generate_primary_deliverable'
  | 'generate_loi'
  | 'open_deal'
  | 'open_document'
  | 'open_pipeline'
  | 'open_search'
  | 'open_files_all'
  | 'open_files_data_room'
  | 'open_files_shared'
  | 'open_files_needing_action'
  | 'ask_yulia';

const PORTFOLIO_PRIORITY_ACTION_IDS = new Set<string>([
  'run_market_intelligence',
  'run_tax_legal_structure',
  'run_working_capital_analysis',
  'run_recast_analysis',
  'run_buyer_fit_analysis',
  'run_valuation_analysis',
  'run_comps_analysis',
  'run_capital_structure_model',
  'run_sba_analysis',
  'run_red_flags_analysis',
  'run_qoe_analysis',
  'run_lbo_analysis',
  'run_dcf_analysis',
  'run_sensitivity_analysis',
  'run_earnout_analysis',
  'run_tax_impact_analysis',
  'run_purchase_price_allocation',
  'run_cap_table_analysis',
  'run_covenant_analysis',
  'optimize_scenario',
  'compare_deals',
  'generate_primary_deliverable',
  'generate_loi',
  'open_deal',
  'open_document',
  'open_pipeline',
  'open_search',
  'open_files_all',
  'open_files_data_room',
  'open_files_shared',
  'open_files_needing_action',
  'ask_yulia',
]);

const TONES = new Set<string>(['gold', 'cactus', 'oat', 'plum', 'charcoal']);

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

interface IntelligenceReportRow {
  id: number;
  deal_id: number | null;
  report_type: string;
  naics_code: string | null;
  geography: string | null;
  status: string;
  content: Record<string, any> | null;
  completed_at: string | null;
  created_at: string;
}

interface SourcingBriefRow {
  id: number;
  thesis_id: number;
  thesis_name: string | null;
  industry: string | null;
  geography: string | null;
  status: string;
  market_density: Record<string, any> | null;
  deal_economics: Record<string, any> | null;
  acquisition_signals: Record<string, any> | null;
  competitive_landscape: Record<string, any> | null;
  key_risks: Record<string, any> | null;
  recommended_params: Record<string, any> | null;
  narrative_markdown: string | null;
  updated_at: string;
}

export interface PortfolioBriefResponse {
  source: 'live' | 'sample';
  generatedAt: string;
  modelUsed?: string;
  intelligenceMode?: 'llm_cached' | 'deterministic_fallback';
  marketIntelligence: {
    eyebrow: string;
    headline: string;
    subhead: string;
    bullets: string[];
    sourceCount: number;
    confidence: string;
  };
  hero: {
    title: string;
    lede: string;
    primaryLabel: string;
    primaryPrompt?: string;
    secondaryLabel: string;
    secondaryDealId?: string;
    notes: { label: string; text: string }[];
  };
  liveDesk: Array<{
    eyebrow: string;
    title: string;
    sub: string;
    pct: number;
    tone: Tone;
    prompt?: string;
  }>;
  priorities: Array<{
    kicker: string;
    title: string;
    sub: string;
    cta: string;
    tone: Tone;
    actionId?: PortfolioPriorityActionId;
    dealId?: string;
    dealTitle?: string;
    docId?: string;
    docTitle?: string;
    prompt?: string;
    tabKind?: string;
  }>;
  files: Array<{
    kind: 'doc' | 'chart';
    title: string;
    sub: string;
    status: string;
    tone: Tone;
    id?: string;
  }>;
  dealStats: Record<string, number>;
  deals: Array<{
    id: string;
    title: string;
    meta: string;
    thesis: string;
    status: string;
    fit: number;
    sde: string;
    multiple: string;
    tone: Tone;
  }>;
}

const MODEL = 'claude-sonnet-4-6';
// Deal briefs are the LIGHT read (one deal, strict JSON) — they run on Haiku
// for speed; the heavier portfolio synthesis stays on Sonnet.
const DEAL_BRIEF_MODEL = 'claude-haiku-4-5-20251001';

// Hard ceiling on the brief AI call. A normal Sonnet brief lands in ~10-18s;
// past this we stop waiting and serve the deterministic brief instead.
const BRIEF_AI_TIMEOUT_MS = Number(process.env.BRIEF_AI_TIMEOUT_MS) || 22000;

/**
 * STALE-WHILE-REVALIDATE: the page never waits for a model call when ANY
 * prior brief exists. A stale brief (data changed or TTL lapsed) is served
 * instantly with `stale: true`, and ONE background regeneration is kicked
 * per key (deduped here) — the next visit gets the fresh read. Users only
 * ever block on the very first brief for a deal, and that now runs on Haiku.
 */
const briefRefreshInFlight = new Set<string>();

function refreshInBackground(key: string, task: () => Promise<unknown>): void {
  if (briefRefreshInFlight.has(key)) return;
  briefRefreshInFlight.add(key);
  void task()
    .catch(err => console.error(`[brief-refresh] ${key}:`, err?.message || err))
    .finally(() => briefRefreshInFlight.delete(key));
}

/**
 * Races a promise against a timer that REJECTS. A bare `await` on a slow/stuck
 * AI call hangs the whole HTTP request forever — and a try/catch can't catch a
 * hang, only a rejection. Wrapping the call converts "hangs forever" into
 * "throws after ms", which the existing catch turns into the deterministic
 * fallback brief. This is why portfolio-brief could return HTTP 000 (timeout)
 * for large accounts: the AI call never settled and nothing reclaimed it.
 */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer)) as Promise<T>;
}

export async function getPortfolioBriefForUser(userId: number, forceRefresh = false): Promise<PortfolioBriefResponse> {
  const snapshot = await buildPortfolioSnapshot(userId);
  const fingerprint = fingerprintOf(snapshot.fingerprintBasis);

  const [cached] = await sql`
    SELECT brief, model_used, generated_at, expires_at, source_fingerprint
    FROM yulia_portfolio_briefs
    WHERE user_id = ${userId}
    LIMIT 1
  `;

  if (!forceRefresh && cached?.brief) {
    const fresh =
      cached.source_fingerprint === fingerprint &&
      new Date(cached.expires_at).getTime() > Date.now();
    if (fresh) {
      return normalizePortfolioBrief(cached.brief, snapshot, 'llm_cached', cached.model_used || MODEL);
    }
    // Stale-while-revalidate: serve the last brief instantly, refresh behind
    // the response. The page never blocks on Sonnet once a brief exists.
    refreshInBackground(`portfolio:${userId}`, () =>
      regeneratePortfolioBrief(userId, snapshot, fingerprint),
    );
    return {
      ...normalizePortfolioBrief(cached.brief, snapshot, 'llm_cached', cached.model_used || MODEL),
      stale: true,
    } as PortfolioBriefResponse;
  }

  return regeneratePortfolioBrief(userId, snapshot, fingerprint);
}

async function regeneratePortfolioBrief(
  userId: number,
  snapshot: Awaited<ReturnType<typeof buildPortfolioSnapshot>>,
  fingerprint: string,
): Promise<PortfolioBriefResponse> {
  const fallback = buildDeterministicPortfolioBrief(snapshot);
  let generated = fallback;
  let status = 'complete';
  let errorMessage: string | null = null;

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      generated = await withTimeout(generatePortfolioBrief(snapshot, fallback), BRIEF_AI_TIMEOUT_MS, 'portfolio-brief');
    } catch (err: any) {
      status = 'failed';
      errorMessage = err.message || 'Brief generation failed';
      generated = { ...fallback, intelligenceMode: 'deterministic_fallback' };
    }
  } else {
    status = 'failed';
    errorMessage = 'ANTHROPIC_API_KEY is not set';
  }

  await sql`
    INSERT INTO yulia_portfolio_briefs (
      user_id, source_fingerprint, source_payload, brief, narrative_markdown,
      model_used, status, error_message, generated_at, expires_at, updated_at
    )
    VALUES (
      ${userId}, ${fingerprint}, ${JSON.stringify(snapshot.sourcePayload)}::jsonb,
      ${JSON.stringify(generated)}::jsonb, ${generated.hero?.lede || null},
      ${MODEL}, ${status}, ${errorMessage}, NOW(), NOW() + INTERVAL '6 hours', NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      source_fingerprint = EXCLUDED.source_fingerprint,
      source_payload = EXCLUDED.source_payload,
      brief = EXCLUDED.brief,
      narrative_markdown = EXCLUDED.narrative_markdown,
      model_used = EXCLUDED.model_used,
      status = EXCLUDED.status,
      error_message = EXCLUDED.error_message,
      generated_at = EXCLUDED.generated_at,
      expires_at = EXCLUDED.expires_at,
      updated_at = NOW()
  `;

  return normalizePortfolioBrief(generated, snapshot, status === 'complete' ? 'llm_cached' : 'deterministic_fallback', MODEL);
}

export async function getDealBriefForUser(userId: number, dealId: number, forceRefresh = false) {
  const snapshot = await buildDealSnapshot(userId, dealId);
  const fingerprint = fingerprintOf(snapshot.fingerprintBasis);

  const [cached] = await sql`
    SELECT brief, model_used, generated_at, expires_at, source_fingerprint
    FROM yulia_deal_briefs
    WHERE user_id = ${userId} AND deal_id = ${dealId}
    LIMIT 1
  `;

  // An empty cached brief (blank read — the old no-merge bug, or a failed gen) must
  // NOT be served; fall through to a synchronous regenerate so it self-heals into a
  // populated read instead of showing "—" until the 72h TTL lapses.
  if (!forceRefresh && cached?.brief && briefHasContent(cached.brief)) {
    const fresh =
      cached.source_fingerprint === fingerprint &&
      new Date(cached.expires_at).getTime() > Date.now();
    if (fresh) {
      return { ...cached.brief, generatedAt: cached.generated_at, intelligenceMode: 'llm_cached' };
    }
    // Stale-while-revalidate: Yulia's last read renders instantly (marked
    // stale) while the refresh runs behind the response — opening a deal tab
    // never blocks on a model call once a brief exists.
    refreshInBackground(`deal:${userId}:${dealId}`, () =>
      regenerateDealBrief(userId, dealId, snapshot, fingerprint),
    );
    return { ...cached.brief, generatedAt: cached.generated_at, intelligenceMode: 'llm_cached', stale: true };
  }

  return regenerateDealBrief(userId, dealId, snapshot, fingerprint);
}

async function regenerateDealBrief(
  userId: number,
  dealId: number,
  snapshot: Awaited<ReturnType<typeof buildDealSnapshot>>,
  fingerprint: string,
) {
  const fallback = buildDeterministicDealBrief(snapshot);
  let generated = fallback;
  let status = 'complete';
  let errorMessage: string | null = null;

  if (process.env.ANTHROPIC_API_KEY && snapshot.deal) {
    try {
      const raw = await withTimeout(generateDealBrief(snapshot, fallback), BRIEF_AI_TIMEOUT_MS, 'deal-brief');
      // MERGE the model output OVER the deterministic fallback (the portfolio brief
      // already does this; the deal brief used to store raw LLM output verbatim, so a
      // partial/empty model JSON — a missing marketRead or blank headline — produced an
      // empty read ("—") with no next moves. Now any field the model leaves empty falls
      // back to the always-populated deterministic read.
      generated = mergeDealBrief(fallback, raw);
    } catch (err: any) {
      status = 'failed';
      errorMessage = err.message || 'Deal brief generation failed';
      generated = { ...fallback, intelligenceMode: 'deterministic_fallback' } as typeof fallback;
    }
  } else if (!process.env.ANTHROPIC_API_KEY) {
    status = 'failed';
    errorMessage = 'ANTHROPIC_API_KEY is not set';
  }

  await sql`
    INSERT INTO yulia_deal_briefs (
      user_id, deal_id, source_fingerprint, source_payload, brief, narrative_markdown,
      model_used, status, error_message, generated_at, expires_at, updated_at
    )
    VALUES (
      ${userId}, ${dealId}, ${fingerprint}, ${JSON.stringify(snapshot.sourcePayload)}::jsonb,
      ${JSON.stringify(generated)}::jsonb, ${generated.marketRead?.headline || null},
      ${DEAL_BRIEF_MODEL}, ${status}, ${errorMessage}, NOW(), NOW() + INTERVAL '72 hours', NOW()
    )
    ON CONFLICT (user_id, deal_id) DO UPDATE SET
      source_fingerprint = EXCLUDED.source_fingerprint,
      source_payload = EXCLUDED.source_payload,
      brief = EXCLUDED.brief,
      narrative_markdown = EXCLUDED.narrative_markdown,
      model_used = EXCLUDED.model_used,
      status = EXCLUDED.status,
      error_message = EXCLUDED.error_message,
      generated_at = EXCLUDED.generated_at,
      expires_at = EXCLUDED.expires_at,
      updated_at = NOW()
  `;

  return { ...generated, generatedAt: new Date().toISOString(), intelligenceMode: status === 'complete' ? 'llm_cached' : 'deterministic_fallback' };
}

export async function formatLatestYuliaBriefsForPrompt(userId: number, dealId?: number | null): Promise<string> {
  const lines: string[] = [];

  try {
    const [portfolio] = await sql`
      SELECT brief, generated_at, status
      FROM yulia_portfolio_briefs
      WHERE user_id = ${userId}
      LIMIT 1
    `;
    if (portfolio?.brief) {
      const brief = portfolio.brief as any;
      lines.push(`Portfolio read (${portfolio.status}, generated ${portfolio.generated_at}):`);
      lines.push(`- Market intelligence: ${brief.marketIntelligence?.headline || 'not available'}`);
      lines.push(`- Today read: ${brief.hero?.title || 'not available'}`);
      if (Array.isArray(brief.priorities)) {
        lines.push(`- Priority queue: ${brief.priorities.slice(0, 3).map((p: any) => p.title).join('; ')}`);
      }
    }
  } catch { /* non-critical */ }

  if (dealId) {
    try {
      const [dealBrief] = await sql`
        SELECT brief, generated_at, status
        FROM yulia_deal_briefs
        WHERE user_id = ${userId} AND deal_id = ${dealId}
        LIMIT 1
      `;
      if (dealBrief?.brief) {
        const brief = dealBrief.brief as any;
        lines.push(`Deal intelligence read (${dealBrief.status}, generated ${dealBrief.generated_at}):`);
        lines.push(`- Verdict: ${brief.verdict?.label || 'not available'} — ${brief.verdict?.text || ''}`);
        lines.push(`- Market read: ${brief.marketRead?.headline || 'not available'}`);
        if (Array.isArray(brief.nextMoves)) {
          lines.push(`- Next moves: ${brief.nextMoves.slice(0, 3).map((m: any) => m.title || m).join('; ')}`);
        }
      }
    } catch { /* non-critical */ }
  }

  if (lines.length === 0) return '';

  return `
## LATEST YULIA INTELLIGENCE BRIEFS
These are cached analyst reads generated from the user's live deal data, market intelligence, sourcing briefs, document/workflow state, and guardrails. Treat them as the current desk view unless the user gives newer facts.

${lines.join('\n')}

Use these briefs to answer quickly and consistently. If the user asks for legal, tax, valuation, or deal-structure conclusions, frame options and evidence, then identify where attorney/CPA/user sign-off is required.
`.trim();
}

async function buildPortfolioSnapshot(userId: number) {
  const deals = await loadActiveDeals(userId);
  const dealIds = deals.map(deal => deal.id);
  const [deliverables, reviews, stagedActions, reports, sourcingBriefs] = await Promise.all([
    loadDeliverables(userId, dealIds),
    loadReviews(userId, dealIds),
    loadStagedActions(userId),
    loadIntelligenceReports(userId, dealIds),
    loadSourcingBriefs(userId),
  ]);
  const marketHeat = await loadMarketHeat(deals.map(deal => deal.industry).filter(Boolean) as string[]);

  const sourcePayload = {
    deals: deals.slice(0, 12),
    deliverables: deliverables.slice(0, 16),
    reviews,
    stagedActions,
    intelligenceReports: summarizeReports(reports),
    sourcingBriefs: summarizeSourcingBriefs(sourcingBriefs),
    marketHeat,
  };

  return {
    deals,
    deliverables,
    reviews,
    stagedActions,
    reports,
    sourcingBriefs,
    marketHeat,
    sourcePayload,
    fingerprintBasis: {
      deals: deals.map(d => [d.id, d.updated_at, d.seven_factor_composite, d.current_gate, d.document_count, d.deliverable_count]),
      deliverables: deliverables.map(d => [d.id, d.status, d.completed_at, d.is_stale, d.stale_reason]),
      reviews: reviews.map(r => [r.id, r.status, r.created_at]),
      stagedActions: stagedActions.map(a => [a.id, a.risk_level, a.created_at]),
      reports: reports.map(r => [r.id, r.status, r.completed_at]),
      sourcingBriefs: sourcingBriefs.map(b => [b.id, b.status, b.updated_at]),
    },
  };
}

async function buildDealSnapshot(userId: number, dealId: number) {
  const [deal] = await sql<DealRow[]>`
    SELECT d.id, d.business_name, d.industry, d.location, d.journey_type,
           d.current_gate, d.league, d.status, d.revenue, d.sde, d.ebitda,
           d.asking_price, d.financials, d.seven_factor_composite,
           d.updated_at,
           (SELECT COUNT(*) FROM deliverables del WHERE del.deal_id = d.id AND del.status = 'complete') as deliverable_count,
           (SELECT COUNT(*) FROM data_room_documents doc WHERE doc.deal_id = d.id) as document_count
    FROM deals d
    WHERE d.user_id = ${userId} AND d.id = ${dealId}
    LIMIT 1
  `;

  const [deliverables, reviews, reports, sourcingBriefs] = await Promise.all([
    loadDeliverables(userId, deal ? [deal.id] : []),
    loadReviews(userId, deal ? [deal.id] : []),
    loadIntelligenceReports(userId, deal ? [deal.id] : []),
    loadSourcingBriefs(userId),
  ]);
  const marketHeat = await loadMarketHeat(deal?.industry ? [deal.industry] : []);

  const sourcePayload = {
    deal,
    deliverables: deliverables.slice(0, 16),
    reviews,
    intelligenceReports: summarizeReports(reports),
    sourcingBriefs: summarizeSourcingBriefs(
      sourcingBriefs.filter(brief => !deal?.industry || !brief.industry || sameLoose(brief.industry, deal.industry)),
    ),
    marketHeat,
  };

  return {
    deal,
    deliverables,
    reviews,
    reports,
    sourcingBriefs,
    marketHeat,
    sourcePayload,
    fingerprintBasis: {
      deal: deal ? [deal.id, deal.updated_at, deal.seven_factor_composite, deal.current_gate, deal.document_count, deal.deliverable_count] : null,
      deliverables: deliverables.map(d => [d.id, d.status, d.completed_at, d.is_stale, d.stale_reason]),
      reviews: reviews.map(r => [r.id, r.status, r.created_at]),
      reports: reports.map(r => [r.id, r.status, r.completed_at]),
      sourcingBriefs: sourcingBriefs.map(b => [b.id, b.status, b.updated_at]),
    },
  };
}

async function loadActiveDeals(userId: number): Promise<DealRow[]> {
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
    LIMIT 40
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
    LIMIT 40
  `;

  return dedupeDeals([...ownedDeals, ...participatedDeals]);
}

async function loadDeliverables(userId: number, dealIds: number[]): Promise<DeliverableRow[]> {
  if (dealIds.length === 0) return [];
  return sql<DeliverableRow[]>`
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
    LIMIT 60
  `;
}

async function loadReviews(userId: number, dealIds: number[]): Promise<ReviewRow[]> {
  if (dealIds.length === 0) return [];
  return sql<ReviewRow[]>`
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
      AND rr.deal_id = ANY(${dealIds})
      AND rr.status IN ('pending', 'reviewing')
    ORDER BY rr.created_at ASC
    LIMIT 30
  `;
}

async function loadStagedActions(userId: number): Promise<StagedActionRow[]> {
  try {
    return await sql<StagedActionRow[]>`
      SELECT id, tool_name, action_label, risk_level, input, created_at
      FROM agency_staged_actions
      WHERE user_id = ${userId} AND status = 'pending'
      ORDER BY created_at DESC
      LIMIT 20
    `;
  } catch {
    return [];
  }
}

async function loadIntelligenceReports(userId: number, dealIds: number[]): Promise<IntelligenceReportRow[]> {
  if (dealIds.length === 0) return [];
  return sql<IntelligenceReportRow[]>`
    SELECT id, deal_id, report_type, naics_code, geography, status, content, completed_at, created_at
    FROM intelligence_reports
    WHERE user_id = ${userId}
      AND (deal_id = ANY(${dealIds}) OR deal_id IS NULL)
    ORDER BY COALESCE(completed_at, created_at) DESC
    LIMIT 30
  `;
}

async function loadSourcingBriefs(userId: number): Promise<SourcingBriefRow[]> {
  try {
    return await sql<SourcingBriefRow[]>`
      SELECT b.id, b.thesis_id, t.name as thesis_name, t.industry, t.geography,
             b.status, b.market_density, b.deal_economics, b.acquisition_signals,
             b.competitive_landscape, b.key_risks, b.recommended_params,
             b.narrative_markdown, b.updated_at
      FROM sourcing_briefs b
      JOIN buyer_theses t ON t.id = b.thesis_id
      WHERE b.user_id = ${userId}
      ORDER BY b.updated_at DESC
      LIMIT 20
    `;
  } catch {
    return [];
  }
}

async function loadMarketHeat(industries: string[]) {
  const unique = Array.from(new Set(industries.map(i => i.trim()).filter(Boolean))).slice(0, 6);
  const entries = [];
  for (const industry of unique) {
    try {
      entries.push({ industry, ...(await getMarketHeat(industry)) });
    } catch {
      entries.push({ industry, score: 0, label: 'Unknown', drivers: [] });
    }
  }
  return entries;
}

async function generatePortfolioBrief(snapshot: Awaited<ReturnType<typeof buildPortfolioSnapshot>>, fallback: PortfolioBriefResponse): Promise<PortfolioBriefResponse> {
  const prompt = `${BRIEFING_SYSTEM_PROMPT}

Return JSON only, matching this TypeScript-ish shape:
{
  "marketIntelligence": {"eyebrow":"MARKET INTELLIGENCE LIVE","headline":string,"subhead":string,"bullets":[string,string,string],"sourceCount":number,"confidence":string},
  "hero": {"title":string,"lede":string,"primaryLabel":string,"primaryPrompt":string,"secondaryLabel":string,"secondaryDealId":string|null,"notes":[{"label":string,"text":string},{"label":string,"text":string},{"label":string,"text":string}]},
  "liveDesk": [{"eyebrow":string,"title":string,"sub":string,"pct":number,"tone":"gold|cactus|oat|plum|charcoal","prompt":string}],
  "priorities": [{"kicker":string,"title":string,"sub":string,"cta":string,"tone":"gold|cactus|oat|plum|charcoal","actionId":"run_market_intelligence|run_tax_legal_structure|run_working_capital_analysis|run_recast_analysis|run_buyer_fit_analysis|run_valuation_analysis|run_comps_analysis|run_capital_structure_model|run_sba_analysis|run_red_flags_analysis|run_qoe_analysis|run_lbo_analysis|run_dcf_analysis|run_sensitivity_analysis|run_earnout_analysis|run_tax_impact_analysis|run_purchase_price_allocation|run_cap_table_analysis|run_covenant_analysis|optimize_scenario|compare_deals|generate_primary_deliverable|generate_loi|open_deal|open_document|open_pipeline|open_search|open_files_all|open_files_data_room|open_files_shared|open_files_needing_action|ask_yulia","dealId":string|null,"dealTitle":string|null,"docId":string|null,"docTitle":string|null,"prompt":string|null,"tabKind":string|null}],
  "files": [{"kind":"doc|chart","title":string,"sub":string,"status":string,"tone":"gold|cactus|oat|plum|charcoal","id":string|null}],
  "deals": [{"id":string,"title":string,"meta":string,"thesis":string,"status":string,"fit":number,"sde":string,"multiple":string,"tone":"gold|cactus|oat|plum|charcoal"}]
}

Rules:
- This is an in-app executive intelligence desk. Put market intelligence front and center.
- Use the user's actual data only. If a claim requires outside research not in the snapshot, say "Research needed:" inside a bullet.
- Use legal/tax language as issue spotting and options, not advice. Name attorney/CPA sign-off moments.
- Keep UI copy tight. No hype words. No generic SaaS copy.
- Preserve existing IDs exactly when provided.
- Return exactly 3 hero notes, 3 liveDesk items, 3 priorities, up to 5 files, up to 5 deals.
- Pick an actionId for every priority. Cards render Yulia's read; they do not invent the action.
- Every priority, warning, ranking, suggested next move, and file/workflow option is from Yulia's analysis of the source snapshot. Never write generic card-authored advice.
- Prefer canvas-producing actionIds for analysis or modeling options. Use optimize_scenario when Yulia already has a saved model/scenario and the next move is to compare strongest risk-adjusted paths. Do not use open_files_* when the needed work is really to run analysis.
- Use open_files_* only when Yulia's actual next-move option is to inspect files, data-room items, shared items, or action queues.

Fallback shape you may improve:
${JSON.stringify(fallback)}

Live source snapshot:
${JSON.stringify(snapshot.sourcePayload).slice(0, 36000)}`;

  const text = await callClaudeWithModel(MODEL, 'You produce strict JSON for SMBx Yulia product surfaces.', [{ role: 'user', content: prompt }], 4096);
  return normalizePortfolioBrief(parseJsonObject(text), snapshot, 'llm_cached', MODEL);
}

async function generateDealBrief(snapshot: Awaited<ReturnType<typeof buildDealSnapshot>>, fallback: any) {
  const prompt = `${BRIEFING_SYSTEM_PROMPT}

Return JSON only:
{
  "verdict": {"label":"STRONG FIT|WATCH|HIGH RISK|NEEDS DATA","score":number,"text":string},
  "marketRead": {"headline":string,"bullets":[string,string,string],"sourceSignals":[string],"researchNeeded":[string]},
  "taxLegal": {"tax":string,"legal":string,"signoffFlags":[string]},
  "nextMoves": [{"title":string,"why":string,"prompt":string,"actionId":"run_market_intelligence|run_tax_legal_structure|run_working_capital_analysis|run_recast_analysis|run_buyer_fit_analysis|run_valuation_analysis|run_comps_analysis|run_capital_structure_model|run_sba_analysis|run_red_flags_analysis|run_qoe_analysis|run_lbo_analysis|run_dcf_analysis|run_sensitivity_analysis|run_earnout_analysis|run_tax_impact_analysis|run_purchase_price_allocation|run_cap_table_analysis|run_covenant_analysis|optimize_scenario|generate_primary_deliverable|generate_loi|open_files_all|open_files_data_room|open_files_shared|open_files_needing_action|ask_yulia"}],
  "filesFocus": [{"title":string,"why":string,"id":string|null}]
}

Rules:
- This is the current deal read. Market intelligence, tax, and legal issue spotting must be obvious.
- Do not give legal or tax advice. Surface options, facts, and sign-off requirements.
- Use actual source data only; put gaps in researchNeeded.
- Pick an actionId for every nextMove. This is execution metadata for the app; users do not see or type these command names.
- Every nextMove is Yulia's own deal read rendered into a surface action. Do not produce generic card copy or fallback navigation when the right answer is analysis, modeling, generation, review, or a missing-evidence prompt.
- Prefer canvas-producing actionIds for analysis asks. Use optimize_scenario when Yulia already has model/scenario evidence and the intended work is comparing the strongest risk-adjusted paths. Do not use open_files_* when the intended work is analysis or modeling.

Fallback shape you may improve:
${JSON.stringify(fallback)}

Deal source snapshot:
${JSON.stringify(snapshot.sourcePayload).slice(0, 32000)}`;

  const text = await callClaudeWithModel(DEAL_BRIEF_MODEL, 'You produce strict JSON for SMBx Yulia deal intelligence briefs.', [{ role: 'user', content: prompt }], 3072);
  return parseJsonObject(text);
}

const BRIEFING_SYSTEM_PROMPT = `
You are Yulia's intelligence briefing layer for SMBx.

Product ambition:
- SMBx should be the user's go-to source for M&A strategy.
- SMBx should be the user's go-to source for M&A tax implications, while never replacing CPA/tax-attorney sign-off.
- SMBx should be the user's go-to source for M&A legal implications, while never replacing attorney sign-off.
- The user should not have to leave the app to google generic industry insight. If runtime research is required, say exactly what must be researched and why.

Posture:
- You are advisor-shaped, not a licensed advisor. Present facts, math, market context, options, and consequences. The user decides. Licensed professionals sign.
- Be precise, sourced, current, and skeptical. Never invent market facts, comps, statutes, or financial figures.
- For tax/legal, surface implications and handoff questions. Do not opine that a structure is legally/tax-valid for the user's facts.
- Any next-move option visible on a product surface must come from your current portfolio/deal/file/model context. The UI only renders it.
`.trim();

function buildDeterministicPortfolioBrief(snapshot: Awaited<ReturnType<typeof buildPortfolioSnapshot>>): PortfolioBriefResponse {
  const deals = [...snapshot.deals].sort((a, b) => fitScore(b) - fitScore(a));
  const lead = deals[0] ?? null;
  const inProgress = snapshot.deliverables.filter(d => ['queued', 'pending', 'generating'].includes(d.status));
  const stale = snapshot.deliverables.filter(d => d.is_stale);
  const complete = snapshot.deliverables.filter(d => d.status === 'complete');
  const dataRoomCount = deals.reduce((sum, d) => sum + Number(d.document_count ?? 0), 0);
  // Real per-industry market heat (getMarketHeat: curated PE roll-up verticals
  // + live active buyer-thesis counts). Each bullet pairs an industry with ITS
  // OWN heat — never the lead's name glued to a different industry's label.
  // Cool/Cold are kept (honest: "limited PE activity" is real intelligence);
  // only score-0 / Unknown (compute errors) are dropped.
  const hotHeat = [...snapshot.marketHeat]
    .filter((h: any) => h && typeof h.score === 'number' && h.score > 0 && h.label && h.label !== 'Unknown')
    .sort((a: any, b: any) => b.score - a.score);
  const heatBullets = hotHeat.slice(0, 3).map((h: any) => {
    const dir = h.multipleDirection ? `, ${h.multipleDirection} multiples` : '';
    return `${h.industry} — ${h.label} (${h.score}/5${dir}): ${h.peActivity || (h.signals?.[0] ?? 'see signals')}.`;
  });
  const briefBullet = snapshot.sourcingBriefs[0]?.narrative_markdown
    ? `Latest sourcing brief: ${clip(snapshot.sourcingBriefs[0].narrative_markdown, 130)}`
    : null;
  const bullets = [...heatBullets];
  if (briefBullet) bullets.push(briefBullet);
  if (bullets.length === 0) {
    bullets.push(lead?.industry
      ? `${lead.industry}: no PE-consolidation signal or active buyer thesis on platform yet — Yulia can research the buyer universe on request.`
      : 'Add a deal industry and Yulia will compute live market heat from PE activity and buyer-thesis demand.');
  }

  const scoredCount = hotHeat.length;
  // sourceCount = genuinely attached/computed reads (reports + sourcing briefs
  // + scored industries). Heat reads ARE computed intelligence, not "attached
  // sources", so the subhead/confidence describe them as such — no overclaim.
  const sourceCount = snapshot.reports.length + snapshot.sourcingBriefs.length + scoredCount;
  const marketHeadline = lead
    ? scoredCount > 0
      ? `Your portfolio reads hottest in ${hotHeat[0].industry} — ranked by live PE consolidation activity and active buyer theses.`
      : `${dealName(lead)} — Yulia is computing live market heat for ${lead.industry || 'this market'}.`
    : 'Add a deal or thesis and Yulia will build a live market-heat read from PE activity and buyer demand.';

  return {
    source: 'live',
    generatedAt: new Date().toISOString(),
    modelUsed: MODEL,
    intelligenceMode: 'deterministic_fallback',
    marketIntelligence: {
      eyebrow: '',
      headline: marketHeadline,
      subhead: scoredCount > 0
        ? `${scoredCount} industr${scoredCount === 1 ? 'y' : 'ies'} scored on live PE activity and buyer-thesis demand.`
        : 'No market-heat signal yet — add deal industries to compute live PE activity and buyer demand.',
      bullets,
      sourceCount,
      confidence: scoredCount > 0 ? 'Computed from live PE activity + buyer theses' : 'Needs deal industry',
    },
    hero: buildHero(lead, snapshot, stale),
    liveDesk: buildLiveDesk(snapshot, inProgress),
    priorities: buildPriorities(snapshot, deals, stale, inProgress),
    files: buildFiles(snapshot.deliverables),
    dealStats: {
      activeDeals: deals.length,
      completedDeliverables: complete.length,
      inProgressDeliverables: inProgress.length,
      pendingReviews: snapshot.reviews.length,
      stagedActions: snapshot.stagedActions.length,
      dataRoomItems: dataRoomCount,
      intelligenceSources: sourceCount,
    },
    deals: deals.slice(0, 5).map((deal, index) => dealToBriefDeal(deal, index)),
  };
}

/** True when a brief actually has a read (a non-empty marketRead headline). */
function briefHasContent(brief: any): boolean {
  const h = brief?.marketRead?.headline;
  return typeof h === 'string' && h.trim().length > 0;
}

/** Merge a model brief OVER the deterministic fallback: each model field wins only
 *  when it is genuinely present (non-empty string / non-empty array), otherwise the
 *  always-populated fallback value is kept. Guarantees a populated read + next moves. */
function mergeDealBrief(fallback: any, raw: any): any {
  if (!raw || typeof raw !== 'object') return fallback;
  const str = (v: any, f: any) => (typeof v === 'string' && v.trim().length > 0 ? v : f);
  const arr = (v: any, f: any) => (Array.isArray(v) && v.length > 0 ? v : f);
  const num = (v: any, f: any) => (typeof v === 'number' && Number.isFinite(v) ? v : f);
  const fb = fallback || {};
  return {
    ...fb,
    ...raw,
    verdict: {
      label: str(raw?.verdict?.label, fb.verdict?.label),
      score: num(raw?.verdict?.score, fb.verdict?.score),
      text: str(raw?.verdict?.text, fb.verdict?.text),
    },
    marketRead: {
      headline: str(raw?.marketRead?.headline, fb.marketRead?.headline),
      bullets: arr(raw?.marketRead?.bullets, fb.marketRead?.bullets),
      sourceSignals: arr(raw?.marketRead?.sourceSignals, fb.marketRead?.sourceSignals),
      researchNeeded: arr(raw?.marketRead?.researchNeeded, fb.marketRead?.researchNeeded),
    },
    taxLegal: {
      tax: str(raw?.taxLegal?.tax, fb.taxLegal?.tax),
      legal: str(raw?.taxLegal?.legal, fb.taxLegal?.legal),
      signoffFlags: arr(raw?.taxLegal?.signoffFlags, fb.taxLegal?.signoffFlags),
    },
    nextMoves: arr(raw?.nextMoves, fb.nextMoves),
    filesFocus: arr(raw?.filesFocus, fb.filesFocus),
  };
}

function buildDeterministicDealBrief(snapshot: Awaited<ReturnType<typeof buildDealSnapshot>>) {
  const deal = snapshot.deal;
  if (!deal) {
    return {
      verdict: { label: 'NEEDS DATA', score: 0, text: 'Deal not found or not available to this user.' },
      marketRead: { headline: 'No deal data available.', bullets: [], sourceSignals: [], researchNeeded: ['Confirm the deal exists and belongs to the user.'] },
      taxLegal: { tax: 'No tax analysis without deal facts.', legal: 'No legal analysis without deal facts.', signoffFlags: [] },
      nextMoves: [],
      filesFocus: [],
    };
  }
  const score = fitScore(deal);
  return {
    verdict: {
      label: score >= 84 ? 'PURSUE' : score >= 70 ? 'WATCH' : 'PASS',
      score,
      text: `${dealName(deal)} is currently driven by ${fmtCents(deal.ebitda ?? deal.sde)} earnings proxy, ${fmtCents(deal.revenue)} revenue, and ${gateLabel(deal.current_gate)} stage.`,
    },
    marketRead: {
      headline: `${dealName(deal)} needs a market read tied to ${deal.industry || 'industry'}, ${deal.location || 'geography'}, buyer universe, and financing climate.`,
      bullets: [
        snapshot.marketHeat[0]?.label ? `Market heat: ${snapshot.marketHeat[0].label}.` : 'Market heat source not attached yet.',
        snapshot.reports[0] ? `Latest intelligence report: ${snapshot.reports[0].report_type} (${snapshot.reports[0].status}).` : 'No dedicated intelligence report attached yet.',
        snapshot.sourcingBriefs[0] ? `Sourcing brief available: ${snapshot.sourcingBriefs[0].thesis_name || 'active thesis'}.` : 'No buyer/target sourcing brief attached yet.',
      ],
      sourceSignals: summarizeReports(snapshot.reports).slice(0, 3).map(r => `${r.type} · ${r.status}`),
      researchNeeded: snapshot.reports.length === 0 ? ['Generate a market intelligence report for this deal.'] : [],
    },
    taxLegal: {
      tax: 'Spot transaction form, purchase-price allocation, rollover/earnout/seller-note timing, state tax, and entity-type traps before LOI.',
      legal: 'Spot diligence scope, data-room permissions, draft/review/execute status, third-party approvals, and counsel sign-off needs before external sharing.',
      signoffFlags: ['CPA/tax attorney signs off tax positions.', 'M&A counsel signs off legal instruments and executed documents.'],
    },
    nextMoves: [
      {
        title: 'Generate market intelligence read',
        why: 'The deal should never rely on generic industry context.',
        prompt: `Generate the market intelligence read for ${dealName(deal)}.`,
        actionId: 'run_market_intelligence',
      },
      {
        title: 'Run tax/legal issue spotting',
        why: 'Structure implications need to be visible before documents move.',
        prompt: `Spot the tax and legal issues for ${dealName(deal)}.`,
        actionId: 'run_tax_legal_structure',
      },
        {
          title: 'Model the decision scenarios',
          why: 'Price, structure, downside case, and professional sign-off should be visible before the next move.',
          prompt: `Open an interactive sensitivity model for ${dealName(deal)} and show the cases I should review.`,
          actionId: 'run_sensitivity_analysis',
        },
    ],
    filesFocus: snapshot.deliverables.slice(0, 5).map(doc => ({ title: displayDeliverableName(doc), why: statusLabel(doc.status), id: String(doc.id) })),
  };
}

function buildHero(lead: DealRow | null, snapshot: Awaited<ReturnType<typeof buildPortfolioSnapshot>>, stale: DeliverableRow[]) {
  if (!lead) {
    return {
      title: 'Yulia turns a blank workspace into an M&A intelligence desk.',
      lede: 'Start with a deal, thesis, document, or target. Yulia will build the market read, tax/legal issue map, files, and next moves around it.',
      primaryLabel: 'Start with Yulia',
      primaryPrompt: 'Help me start my first SMBx deal workspace.',
      secondaryLabel: 'Open pipeline',
      notes: [
        { label: 'Market', text: 'Industry, geography, buyer universe, comps, and financing climate belong inside the app.' },
        { label: 'Tax/legal', text: 'Yulia frames implications and handoff questions before CPA/counsel sign-off.' },
        { label: 'Action', text: 'Every read points to the next document, analysis, review, or approval.' },
      ],
    };
  }

  const name = dealName(lead);
  const nextMove = snapshot.stagedActions.length > 0
    ? 'the next approval'
    : snapshot.reviews.length > 0
      ? 'review queue'
      : stale.length > 0
        ? 'the next refresh'
        : 'the next market move';

  return {
    title: `Yulia's market read: ${name} needs your eye before ${nextMove}.`,
    lede: snapshot.reports.length > 0 || snapshot.sourcingBriefs.length > 0
      ? `${name} is being read against live workspace intelligence, active work product, and the current deal stage.`
      : `${name} has deal data but needs a dedicated market intelligence run so the read is not generic.`,
    primaryLabel: snapshot.stagedActions.length > 0 ? 'Review action' : snapshot.reviews.length > 0 ? 'Review queue' : 'Ask Yulia',
    primaryPrompt: snapshot.stagedActions.length > 0
      ? 'Show me the staged actions waiting for approval.'
      : snapshot.reviews.length > 0
        ? 'Show me everything waiting on review or signature.'
        : `What does the market intelligence say about ${name}?`,
    secondaryLabel: 'Open deal',
    secondaryDealId: String(lead.id),
    notes: [
      { label: 'Market', text: lead.industry ? `${lead.industry} · ${lead.location || 'geography pending'} · ${snapshot.marketHeat[0]?.label || 'market heat pending'}.` : 'Industry is missing; Yulia needs it for a serious market read.' },
      { label: 'Structure', text: 'Tax and legal implications are part of the deal read, with CPA/counsel sign-off called out at the execution line.' },
      { label: 'Move', text: snapshot.reviews.length > 0 ? 'Clear the review queue before external touchpoints.' : 'Use the market read to choose the next document or analysis.' },
    ],
  };
}

function buildLiveDesk(snapshot: Awaited<ReturnType<typeof buildPortfolioSnapshot>>, inProgress: DeliverableRow[]) {
  const latestWork = inProgress[0] ?? snapshot.deliverables[0] ?? null;
  const pursue = snapshot.deals.filter(deal => fitScore(deal) >= 80).length;
  const sourceCount = snapshot.reports.length + snapshot.sourcingBriefs.length + snapshot.marketHeat.length;
  const lead = [...snapshot.deals].sort((a, b) => fitScore(b) - fitScore(a))[0] ?? null;
  const leadName = lead ? dealName(lead) : 'the current portfolio';
  return [
    {
      eyebrow: 'MARKET',
      title: lead?.industry ? `${lead.industry} read` : sourceCount > 0 ? `${sourceCount} live sources` : 'Market read needed',
      sub: sourceCount > 0
        ? `Yulia is tying market reports, sourcing briefs, and deal data back to ${leadName}.`
        : `Generate the first market intelligence read so ${leadName} is not being judged from generic context.`,
      pct: sourceCount > 0 ? Math.min(100, 30 + sourceCount * 10) : 12,
      tone: 'cactus' as Tone,
      prompt: 'Show me the market intelligence behind today’s read.',
    },
    {
      eyebrow: 'STRUCTURE',
      title: snapshot.reviews.length > 0 ? `${snapshot.reviews.length} review item${snapshot.reviews.length === 1 ? '' : 's'}` : 'Tax/legal issue map',
      sub: snapshot.reviews.length > 0
        ? 'Counsel, CPA, and user sign-off moments are being pulled into the deal read.'
        : 'Yulia should surface structure, tax, legal, and sign-off questions before documents move.',
      pct: snapshot.reviews.length > 0 ? Math.min(96, 52 + snapshot.reviews.length * 12) : latestWork ? progressForStatus(latestWork.status) : 34,
      tone: 'gold' as Tone,
      prompt: `Show me the tax, legal, and structure implications across ${leadName}.`,
    },
    {
      eyebrow: 'PORTFOLIO',
      title: snapshot.deals.length === 1 ? `${leadName} is the portfolio` : `${snapshot.deals.length} active deals`,
      sub: `${pursue} pursue · ${snapshot.stagedActions.length} approvals · ${snapshot.deliverables.length} work products attached`,
      pct: snapshot.deals.length > 0 ? Math.min(100, Math.max(18, pursue * 18)) : 0,
      tone: 'plum' as Tone,
      prompt: 'What changed across my active deals?',
    },
  ];
}

function buildPriorities(
  snapshot: Awaited<ReturnType<typeof buildPortfolioSnapshot>>,
  deals: DealRow[],
  stale: DeliverableRow[],
  inProgress: DeliverableRow[],
) {
  const priorities: any[] = [];
  if (snapshot.reports.length === 0 && snapshot.sourcingBriefs.length === 0 && deals[0]) {
    priorities.push({
      kicker: 'MARKET INTEL',
      title: `Generate ${dealName(deals[0])}'s market read`,
      sub: 'No user should have to google industry context outside the app.',
      cta: 'Run read',
      tone: 'cactus',
      actionId: 'run_market_intelligence',
      dealId: String(deals[0].id),
      dealTitle: dealName(deals[0]),
      prompt: `Generate the full market intelligence read for ${dealName(deals[0])}.`,
    });
  }
  for (const action of snapshot.stagedActions.slice(0, 2)) {
    priorities.push({
      kicker: 'APPROVAL',
      title: action.action_label || action.tool_name,
      sub: 'Yulia staged this action. Confirm or cancel before anything changes.',
      cta: 'Review',
      tone: action.risk_level === 'high' ? 'gold' : 'plum',
      actionId: 'ask_yulia',
      prompt: `Review the staged action: ${action.action_label || action.tool_name}.`,
    });
  }
  for (const review of snapshot.reviews.slice(0, 2)) {
    priorities.push({
      kicker: 'WAITING ON YOU',
      title: `Review ${review.doc_name || 'document'}`,
      sub: `${review.deal_name || 'Deal'} · ${review.reviewer_role || 'review'} requested`,
      cta: 'Review',
      tone: 'plum',
      actionId: review.doc_name ? 'open_document' : 'ask_yulia',
      dealId: review.deal_id ? String(review.deal_id) : undefined,
      dealTitle: review.deal_name || undefined,
      docTitle: review.doc_name || 'Review request',
      prompt: `Review ${review.doc_name || 'the pending review request'} for ${review.deal_name || 'this deal'} and tell me what needs a decision.`,
    });
  }
  for (const doc of stale.slice(0, 2)) {
    priorities.push({
      kicker: 'REFRESH',
      title: `Refresh ${displayDeliverableName(doc)}`,
      sub: `${doc.deal_name || 'Deal'} · ${doc.stale_reason || 'source data changed'}`,
      cta: 'Refresh',
      tone: 'gold',
      actionId: 'open_document',
      dealId: doc.deal_id ? String(doc.deal_id) : undefined,
      dealTitle: doc.deal_name || undefined,
      docId: String(doc.id),
      docTitle: displayDeliverableName(doc),
      prompt: `Refresh ${displayDeliverableName(doc)} using the changed source data, then reopen it as a canvas/document.`,
    });
  }
  if (inProgress[0]) {
    priorities.push({
      kicker: 'WORKING',
      title: `${displayDeliverableName(inProgress[0])} is in motion`,
      sub: `${inProgress[0].deal_name || 'Deal'} · ${statusLabel(inProgress[0].status)}`,
      cta: 'Open',
      tone: 'gold',
      actionId: 'open_document',
      dealId: inProgress[0].deal_id ? String(inProgress[0].deal_id) : undefined,
      dealTitle: inProgress[0].deal_name || undefined,
      docId: String(inProgress[0].id),
      docTitle: displayDeliverableName(inProgress[0]),
    });
  }
  if (deals[0]) {
    priorities.push({
      kicker: 'PIPELINE',
      title: `${dealName(deals[0])} is the lead focus`,
      sub: `${fmtCents(deals[0].revenue)} revenue · ${fitScore(deals[0])} fit · ${gateLabel(deals[0].current_gate)}`,
      cta: 'Open deal',
      tone: toneForDeal(deals[0]),
      actionId: 'open_deal',
      dealId: String(deals[0].id),
      dealTitle: dealName(deals[0]),
    });
  }
  return priorities.slice(0, 3);
}

function buildFiles(deliverables: DeliverableRow[]) {
  return deliverables.slice(0, 5).map(doc => {
    const title = displayDeliverableName(doc);
    const analysis = /model|valuation|analysis|sba|comp|risk|tax|financial|score|market|intelligence/i.test(`${doc.slug || ''} ${title}`);
    return {
      kind: analysis ? 'chart' as const : 'doc' as const,
      title,
      sub: `${doc.deal_name || 'Deal'} · ${statusLabel(doc.status)}`,
      status: doc.is_stale ? 'Refresh' : doc.status === 'complete' ? 'Open' : statusLabel(doc.status),
      tone: doc.is_stale ? 'gold' as Tone : doc.status === 'complete' ? 'plum' as Tone : doc.status === 'failed' ? 'charcoal' as Tone : 'gold' as Tone,
      id: String(doc.id),
    };
  });
}

function normalizeTone(value: unknown, fallback: Tone = 'plum'): Tone {
  return typeof value === 'string' && TONES.has(value) ? value as Tone : fallback;
}

function normalizePriorityActionId(priority: any): PortfolioPriorityActionId {
  if (PORTFOLIO_PRIORITY_ACTION_IDS.has(priority?.actionId)) {
    return priority.actionId as PortfolioPriorityActionId;
  }

    const text = `${priority?.kicker || ''} ${priority?.title || ''} ${priority?.sub || ''} ${priority?.cta || ''}`.toLowerCase();
    if (/market|industry|buyer universe|source gap|sourcing/.test(text)) return 'run_market_intelligence';
    if (/purchase.?price allocation|ppa|allocation/.test(text)) return 'run_purchase_price_allocation';
    if (/tax impact|installment|qsbs|338|state tax/.test(text)) return 'run_tax_impact_analysis';
    if (/tax|legal|structure|counsel|attorney|cpa/.test(text)) return 'run_tax_legal_structure';
    if (/qoe|quality of earnings|add.?back|addback/.test(text)) return 'run_qoe_analysis';
    if (/working.?cap|peg|a\/r|inventory/.test(text)) return 'run_working_capital_analysis';
    if (/lbo|irr|moic|sponsor return/.test(text)) return 'run_lbo_analysis';
    if (/dcf|discount|wacc|terminal value/.test(text)) return 'run_dcf_analysis';
    if (/optimi[sz]e|best path|best case|risk-adjusted|risk adjusted|negotiation path/.test(text)) return 'optimize_scenario';
    if (/sensitivity|scenario|downside|upside/.test(text)) return 'run_sensitivity_analysis';
    if (/earnout|contingent/.test(text)) return 'run_earnout_analysis';
    if (/cap table|dilution|pre.?money|post.?money/.test(text)) return 'run_cap_table_analysis';
    if (/covenant|dscr|debt.?to.?ebitda|ltv/.test(text)) return 'run_covenant_analysis';
    if (/valuation|multiple|price/.test(text)) return 'run_valuation_analysis';
  if (/comp|benchmark/.test(text)) return 'run_comps_analysis';
  if (/capital|sba|debt|lender|financing/.test(text)) return /sba/.test(text) ? 'run_sba_analysis' : 'run_capital_structure_model';
  if (/red.?flag|risk|diligence gap/.test(text)) return 'run_red_flags_analysis';
  if (priority?.docId || priority?.docTitle) return 'open_document';
  if (priority?.dealId || priority?.dealTitle) return 'open_deal';
  if (priority?.tabKind === 'search') return 'open_search';
  return 'ask_yulia';
}

function normalizePortfolioPriority(priority: any): PortfolioBriefResponse['priorities'][number] {
  const title = String(priority?.title || 'Ask Yulia for the current read');
  return {
    kicker: String(priority?.kicker || 'YULIA READ').toUpperCase().slice(0, 36),
    title: clip(title, 96),
    sub: clip(String(priority?.sub || 'Yulia needs more live context before surfacing the next action options.'), 180),
    cta: clip(String(priority?.cta || 'Ask Yulia'), 32),
    tone: normalizeTone(priority?.tone),
    actionId: normalizePriorityActionId(priority),
    dealId: priority?.dealId != null ? String(priority.dealId) : undefined,
    dealTitle: priority?.dealTitle ? String(priority.dealTitle) : undefined,
    docId: priority?.docId != null ? String(priority.docId) : undefined,
    docTitle: priority?.docTitle ? String(priority.docTitle) : undefined,
    prompt: priority?.prompt ? String(priority.prompt) : undefined,
    tabKind: priority?.tabKind ? String(priority.tabKind) : undefined,
  };
}

function normalizePortfolioBrief(raw: any, snapshot: Awaited<ReturnType<typeof buildPortfolioSnapshot>>, mode: PortfolioBriefResponse['intelligenceMode'], modelUsed: string): PortfolioBriefResponse {
  const fallback = buildDeterministicPortfolioBrief(snapshot);
  const normalizedPriorities = Array.isArray(raw?.priorities) && raw.priorities.length
    ? raw.priorities.slice(0, 3).map(normalizePortfolioPriority)
    : fallback.priorities.map(normalizePortfolioPriority);
  const merged: PortfolioBriefResponse = {
    ...fallback,
    ...raw,
    source: 'live',
    generatedAt: raw?.generatedAt || new Date().toISOString(),
    modelUsed,
    intelligenceMode: mode,
    marketIntelligence: { ...fallback.marketIntelligence, ...(raw?.marketIntelligence || {}) },
    hero: { ...fallback.hero, ...(raw?.hero || {}) },
    liveDesk: Array.isArray(raw?.liveDesk) && raw.liveDesk.length ? raw.liveDesk.slice(0, 3) : fallback.liveDesk,
    priorities: normalizedPriorities,
    files: Array.isArray(raw?.files) && raw.files.length ? raw.files.slice(0, 5) : fallback.files,
    deals: Array.isArray(raw?.deals) && raw.deals.length ? raw.deals.slice(0, 5) : fallback.deals,
  };
  merged.hero.notes = Array.isArray(merged.hero.notes) && merged.hero.notes.length >= 3
    ? merged.hero.notes.slice(0, 3)
    : fallback.hero.notes;
  merged.marketIntelligence.bullets = Array.isArray(merged.marketIntelligence.bullets)
    ? merged.marketIntelligence.bullets.slice(0, 4)
    : fallback.marketIntelligence.bullets;
  return merged;
}

function summarizeReports(reports: IntelligenceReportRow[]) {
  return reports.slice(0, 8).map(report => ({
    id: report.id,
    dealId: report.deal_id,
    type: report.report_type,
    naics: report.naics_code,
    geography: report.geography,
    status: report.status,
    completedAt: report.completed_at,
    summary: clip(JSON.stringify(report.content || {}).replace(/[{}"]/g, ' '), 420),
  }));
}

function summarizeSourcingBriefs(briefs: SourcingBriefRow[]) {
  return briefs.slice(0, 8).map(brief => ({
    id: brief.id,
    thesis: brief.thesis_name,
    industry: brief.industry,
    geography: brief.geography,
    status: brief.status,
    narrative: clip(brief.narrative_markdown || '', 520),
    risks: brief.key_risks,
    economics: brief.deal_economics,
    acquisitionSignals: brief.acquisition_signals,
  }));
}

function parseJsonObject(text: string): any {
  const trimmed = text.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Model did not return JSON');
    return JSON.parse(match[0]);
  }
}

function dedupeDeals(deals: DealRow[]): DealRow[] {
  const seen = new Set<number>();
  return deals.filter(deal => {
    if (seen.has(deal.id)) return false;
    seen.add(deal.id);
    return true;
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

function fingerprintOf(value: unknown): string {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
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

function sameLoose(a: string, b: string) {
  return a.toLowerCase().includes(b.toLowerCase()) || b.toLowerCase().includes(a.toLowerCase());
}

function clip(text: string, max: number) {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trim()}…`;
}
