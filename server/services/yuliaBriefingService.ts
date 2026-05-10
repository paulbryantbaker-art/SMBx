import crypto from 'crypto';
import { sql } from '../db.js';
import { callClaudeWithModel } from './aiService.js';
import { getMarketHeat } from './marketHeatService.js';

type Tone = 'gold' | 'cactus' | 'oat' | 'plum' | 'charcoal';

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

export async function getPortfolioBriefForUser(userId: number, forceRefresh = false): Promise<PortfolioBriefResponse> {
  const snapshot = await buildPortfolioSnapshot(userId);
  const fingerprint = fingerprintOf(snapshot.fingerprintBasis);

  if (!forceRefresh) {
    const [cached] = await sql`
      SELECT brief, model_used, generated_at, expires_at, source_fingerprint
      FROM yulia_portfolio_briefs
      WHERE user_id = ${userId}
      LIMIT 1
    `;
    if (
      cached?.brief &&
      cached.source_fingerprint === fingerprint &&
      new Date(cached.expires_at).getTime() > Date.now()
    ) {
      return normalizePortfolioBrief(cached.brief, snapshot, 'llm_cached', cached.model_used || MODEL);
    }
  }

  const fallback = buildDeterministicPortfolioBrief(snapshot);
  let generated = fallback;
  let status = 'complete';
  let errorMessage: string | null = null;

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      generated = await generatePortfolioBrief(snapshot, fallback);
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

  if (!forceRefresh) {
    const [cached] = await sql`
      SELECT brief, model_used, generated_at, expires_at, source_fingerprint
      FROM yulia_deal_briefs
      WHERE user_id = ${userId} AND deal_id = ${dealId}
      LIMIT 1
    `;
    if (
      cached?.brief &&
      cached.source_fingerprint === fingerprint &&
      new Date(cached.expires_at).getTime() > Date.now()
    ) {
      return { ...cached.brief, generatedAt: cached.generated_at, intelligenceMode: 'llm_cached' };
    }
  }

  const fallback = buildDeterministicDealBrief(snapshot);
  let generated = fallback;
  let status = 'complete';
  let errorMessage: string | null = null;

  if (process.env.ANTHROPIC_API_KEY && snapshot.deal) {
    try {
      generated = await generateDealBrief(snapshot, fallback);
    } catch (err: any) {
      status = 'failed';
      errorMessage = err.message || 'Deal brief generation failed';
      generated = { ...fallback, intelligenceMode: 'deterministic_fallback' };
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
      ${MODEL}, ${status}, ${errorMessage}, NOW(), NOW() + INTERVAL '6 hours', NOW()
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
  "priorities": [{"kicker":string,"title":string,"sub":string,"cta":string,"tone":"gold|cactus|oat|plum|charcoal","dealId":string|null,"dealTitle":string|null,"docId":string|null,"docTitle":string|null,"prompt":string|null,"tabKind":string|null}],
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
  "verdict": {"label":"PURSUE|WATCH|PASS|NEEDS DATA","score":number,"text":string},
  "marketRead": {"headline":string,"bullets":[string,string,string],"sourceSignals":[string],"researchNeeded":[string]},
  "taxLegal": {"tax":string,"legal":string,"signoffFlags":[string]},
  "nextMoves": [{"title":string,"why":string,"prompt":string}],
  "filesFocus": [{"title":string,"why":string,"id":string|null}]
}

Rules:
- This is the current deal read. Market intelligence, tax, and legal issue spotting must be obvious.
- Do not give legal or tax advice. Surface options, facts, and sign-off requirements.
- Use actual source data only; put gaps in researchNeeded.

Fallback shape you may improve:
${JSON.stringify(fallback)}

Deal source snapshot:
${JSON.stringify(snapshot.sourcePayload).slice(0, 32000)}`;

  const text = await callClaudeWithModel(MODEL, 'You produce strict JSON for SMBx Yulia deal intelligence briefs.', [{ role: 'user', content: prompt }], 3072);
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
`.trim();

function buildDeterministicPortfolioBrief(snapshot: Awaited<ReturnType<typeof buildPortfolioSnapshot>>): PortfolioBriefResponse {
  const deals = [...snapshot.deals].sort((a, b) => fitScore(b) - fitScore(a));
  const lead = deals[0] ?? null;
  const inProgress = snapshot.deliverables.filter(d => ['queued', 'pending', 'generating'].includes(d.status));
  const stale = snapshot.deliverables.filter(d => d.is_stale);
  const complete = snapshot.deliverables.filter(d => d.status === 'complete');
  const dataRoomCount = deals.reduce((sum, d) => sum + Number(d.document_count ?? 0), 0);
  const sourceCount = snapshot.reports.length + snapshot.sourcingBriefs.length + snapshot.marketHeat.length;
  const marketHeadline = lead
    ? `${dealName(lead)} is being read against ${lead.industry || 'its market'}, financing climate, diligence state, and live work product.`
    : 'Yulia is waiting for the first deal or thesis to build a live market read.';

  return {
    source: 'live',
    generatedAt: new Date().toISOString(),
    modelUsed: MODEL,
    intelligenceMode: 'deterministic_fallback',
    marketIntelligence: {
      eyebrow: 'MARKET INTELLIGENCE LIVE',
      headline: marketHeadline,
      subhead: sourceCount > 0
        ? `${sourceCount} intelligence source${sourceCount === 1 ? '' : 's'} are attached to this workspace.`
        : 'No dedicated market reports are attached yet. Yulia can generate the first market intelligence read from the deal thesis.',
      bullets: [
        lead?.industry ? `${lead.industry}: ${snapshot.marketHeat[0]?.label || 'market heat pending'}.` : 'Add industry and geography to unlock local density, comps, and buyer universe.',
        snapshot.sourcingBriefs[0]?.narrative_markdown ? `Latest sourcing brief: ${clip(snapshot.sourcingBriefs[0].narrative_markdown, 130)}` : 'Sourcing briefs will feed buyer/target market context here.',
        'Tax and legal implications are surfaced as issue spotting; CPA and counsel sign off before execution.',
      ],
      sourceCount,
      confidence: sourceCount > 0 ? 'Live sources attached' : 'Needs source data',
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
      { title: 'Generate market intelligence read', why: 'The deal should never rely on generic industry context.', prompt: `Generate the market intelligence read for ${dealName(deal)}.` },
      { title: 'Run tax/legal issue spotting', why: 'Structure implications need to be visible before documents move.', prompt: `Spot the tax and legal issues for ${dealName(deal)}.` },
      { title: 'Open files that need action', why: 'Work products and data-room items are the execution layer.', prompt: `Show files needing action for ${dealName(deal)}.` },
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
  return [
    {
      eyebrow: 'INTELLIGENCE',
      title: sourceCount > 0 ? `${sourceCount} live sources` : 'Market read needed',
      sub: sourceCount > 0 ? 'Market reports, sourcing briefs, and deal data are feeding Yulia.' : 'Generate the first market intelligence brief for this workspace.',
      pct: sourceCount > 0 ? Math.min(100, 30 + sourceCount * 10) : 12,
      tone: 'cactus' as Tone,
      prompt: 'Show me the market intelligence behind today’s read.',
    },
    {
      eyebrow: latestWork && inProgress.length > 0 ? 'DRAFTING' : 'WORKSPACE',
      title: latestWork ? displayDeliverableName(latestWork) : `${snapshot.deliverables.length} files`,
      sub: latestWork ? `${latestWork.deal_name || 'Deal'} · ${statusLabel(latestWork.status)}` : 'No generated work products yet',
      pct: latestWork ? progressForStatus(latestWork.status) : 0,
      tone: 'gold' as Tone,
      prompt: latestWork ? `What changed on ${displayDeliverableName(latestWork)}?` : 'What should I create first?',
    },
    {
      eyebrow: 'PORTFOLIO',
      title: `${snapshot.deals.length} active deals`,
      sub: `${pursue} pursue · ${snapshot.reviews.length + snapshot.stagedActions.length} reviews/approvals waiting`,
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
      docTitle: review.doc_name || 'Review request',
    });
  }
  for (const doc of stale.slice(0, 2)) {
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
  if (inProgress[0]) {
    priorities.push({
      kicker: 'WORKING',
      title: `${displayDeliverableName(inProgress[0])} is in motion`,
      sub: `${inProgress[0].deal_name || 'Deal'} · ${statusLabel(inProgress[0].status)}`,
      cta: 'Open',
      tone: 'gold',
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

function normalizePortfolioBrief(raw: any, snapshot: Awaited<ReturnType<typeof buildPortfolioSnapshot>>, mode: PortfolioBriefResponse['intelligenceMode'], modelUsed: string): PortfolioBriefResponse {
  const fallback = buildDeterministicPortfolioBrief(snapshot);
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
    priorities: Array.isArray(raw?.priorities) && raw.priorities.length ? raw.priorities.slice(0, 3) : fallback.priorities,
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
