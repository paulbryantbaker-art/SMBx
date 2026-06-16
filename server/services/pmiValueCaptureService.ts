/**
 * PMI Value Capture Service — the real 100-day post-merger integration plan.
 *
 * Clone of the SELL-side optimizationPlanService pattern, adapted for PMI:
 *   - deterministic SEED from the deal row (revenue×3% revenue synergy, ×2% cost
 *     synergy + a Day-0→100 workstream skeleton — mirrors buildPmiAnalysis), then
 *   - one Claude enrich pass into richer per-deal workstreams + value levers,
 *     with a deterministic fallback so it never returns empty.
 *
 * HONESTY (Critical Rule #10 + THE LINE / Rule #12):
 *   - Value levers carry an ILLUSTRATIVE *target* only. There is NO captured/
 *     realized $ — verified actuals need a finance/GL connector we don't have.
 *     We track EXECUTION (workstream status / %), never a fabricated capture number.
 *   - Plan & implications only; no recommendation on regulated decisions.
 *   - All money is integer cents.
 */
import { sql } from '../db.js';
import Anthropic from '@anthropic-ai/sdk';

let anthropicClient: Anthropic | null = null;
function getClient(): Anthropic {
  if (!anthropicClient) anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  return anthropicClient;
}

export type LeverCategory = 'cost_synergy' | 'revenue_synergy' | 'operational' | 'integration_risk' | 'working_capital' | 'one_time_cost';
export type Confidence = 'high' | 'medium' | 'low';
export interface ValueLever { name: string; category: LeverCategory; target_value_cents: number | null; confidence: Confidence; }
export interface PlanWorkstream { title: string; detail: string; owner: string | null; first_move: string | null; evidence_link: string | null; }
export interface GeneratedPlan { summary: string; horizonDays: number; targetValueCents: number; valueLevers: ValueLever[]; workstreams: PlanWorkstream[]; }

export interface PmiDealInput {
  dealId: number; userId: number;
  business_name?: string; industry?: string; league?: string;
  revenueCents?: number | null; ebitdaCents?: number | null;
}

/* status → presentation (the read layer hands the UI a ready kind+label) */
const STATUS_META: Record<string, { kind: 'ok' | 'warn' | 'neutral'; label: string }> = {
  not_started: { kind: 'neutral', label: 'Not started' },
  in_progress: { kind: 'neutral', label: 'In progress' },
  on_track: { kind: 'ok', label: 'On track' },
  at_risk: { kind: 'warn', label: 'At risk' },
  complete: { kind: 'ok', label: 'Complete' },
};
const VALID_STATUS = Object.keys(STATUS_META);

const fmt = (c: number | null | undefined) => (c == null ? 'an unquantified amount' : `$${Math.round(c / 100).toLocaleString()}`);

/* ---- deterministic seed (free, from the deal row; mirrors buildPmiAnalysis) ---- */
function seedPlan(deal: PmiDealInput): GeneratedPlan {
  const rev = deal.revenueCents || 0;
  const revenueSynergy = rev ? Math.round(rev * 0.03) : null;
  const costSynergy = rev ? Math.round(rev * 0.02) : null;
  const valueLevers: ValueLever[] = [
    { name: 'Revenue synergies', category: 'revenue_synergy', target_value_cents: revenueSynergy, confidence: 'low' },
    { name: 'Cost synergies', category: 'cost_synergy', target_value_cents: costSynergy, confidence: 'low' },
  ];
  const workstreams: PlanWorkstream[] = [
    { title: 'Day-0 communications', detail: 'Notify employees, customers, and vendors on a controlled, sequenced plan.', owner: 'Integration lead', first_move: 'Lock the Day-0 comms plan and sequencing.', evidence_link: 'Integration playbook' },
    { title: 'Finance & systems', detail: 'Stand up weekly cash and working-capital cadence; plan the systems cutover.', owner: 'CFO / Finance', first_move: 'Lock weekly cash and working-capital cadence.', evidence_link: 'Financial model / data room' },
    { title: 'Customers', detail: 'Protect the top-account relationships through transition.', owner: 'Commercial lead', first_move: 'Brief and protect the top revenue accounts.', evidence_link: 'Customer concentration schedule' },
    { title: 'People & org', detail: 'Confirm key-employee retention and incentive structures.', owner: 'HR / People', first_move: 'Confirm key-employee retention and incentives.', evidence_link: 'Org chart / employment docs' },
    { title: 'Synergy capture', detail: 'Sequence the cost and revenue synergy levers into 100-day moves.', owner: 'Integration lead', first_move: 'Sequence the synergy levers and assign owners.', evidence_link: 'Value-creation model' },
  ];
  const targetValueCents = valueLevers.reduce((s, l) => s + (l.target_value_cents || 0), 0);
  return {
    summary: `${deal.business_name || 'This deal'} post-close plan turns diligence findings into Day-0 controls, 100-day moves, and owner-visible value capture. Synergy figures are illustrative until tracked against the books.`,
    horizonDays: 100,
    targetValueCents,
    valueLevers,
    workstreams,
  };
}

/* ---- Claude enrich (richer, per-deal; falls back to the seed) ---- */
export async function generateIntegrationPlan(deal: PmiDealInput): Promise<GeneratedPlan> {
  const seed = seedPlan(deal);
  if (!process.env.ANTHROPIC_API_KEY) return seed;
  try {
    const client = getClient();
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: 'You are an M&A deal-intelligence operator drafting a post-merger integration (PMI) 100-day value-capture plan. Return ONLY valid JSON. Present workstreams, owners, and value-lever options with implications. Do NOT recommend regulated transaction, legal, or tax decisions. Synergy figures are illustrative targets, not guarantees.',
      messages: [{
        role: 'user',
        content: `Draft a 100-day integration plan for this just-closed acquisition:

Business: ${deal.business_name || 'Unknown'}
Industry: ${deal.industry || 'Unknown'}
Revenue: ${fmt(deal.revenueCents)}
EBITDA: ${fmt(deal.ebitdaCents)}
League: ${deal.league || 'Unknown'}

Illustrative starting synergy targets (3% revenue / 2% cost of revenue): revenue ${fmt(seed.valueLevers[0].target_value_cents)}, cost ${fmt(seed.valueLevers[1].target_value_cents)}.

Produce 5-7 integration workstreams (e.g. Day-0 communications, Finance & systems, Customers, People & org, Operations, Synergy capture, Risk & controls). Each workstream MUST include:
- title (short)
- detail (one concrete sentence)
- owner (a role, e.g. "CFO / Finance")
- first_move (the headline next action, imperative)
- evidence_link (where the supporting evidence lives, e.g. "Data room / financial model")

Also produce 3-6 value levers. Each lever MUST include:
- name
- category: one of "cost_synergy", "revenue_synergy", "operational", "integration_risk", "working_capital", "one_time_cost"
- target_value_dollars: illustrative ANNUAL run-rate target in dollars (number)
- confidence: "high", "medium", or "low"

Return JSON in EXACTLY this format:
{
  "summary": "2-3 sentence overview of the value-capture opportunity (note targets are illustrative)",
  "target_value_dollars": 0,
  "value_levers": [{ "name": "...", "category": "...", "target_value_dollars": 0, "confidence": "..." }],
  "workstreams": [{ "title": "...", "detail": "...", "owner": "...", "first_move": "...", "evidence_link": "..." }]
}`,
      }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);

    const validCats: LeverCategory[] = ['cost_synergy', 'revenue_synergy', 'operational', 'integration_risk', 'working_capital', 'one_time_cost'];
    const validConf: Confidence[] = ['high', 'medium', 'low'];
    const valueLevers: ValueLever[] = (parsed.value_levers || []).map((l: any) => ({
      name: String(l.name || 'Value lever'),
      category: (validCats.includes(l.category) ? l.category : 'operational') as LeverCategory,
      target_value_cents: typeof l.target_value_dollars === 'number' && l.target_value_dollars > 0 ? Math.round(l.target_value_dollars * 100) : null,
      confidence: (validConf.includes(l.confidence) ? l.confidence : 'low') as Confidence,
    })).filter((l: ValueLever) => l.name);
    const workstreams: PlanWorkstream[] = (parsed.workstreams || []).map((w: any) => ({
      title: String(w.title || 'Workstream'),
      detail: String(w.detail || ''),
      owner: w.owner ? String(w.owner) : null,
      first_move: w.first_move ? String(w.first_move) : null,
      evidence_link: w.evidence_link ? String(w.evidence_link) : null,
    })).filter((w: PlanWorkstream) => w.title);

    if (workstreams.length === 0) return seed; // malformed → safe fallback

    const targetFromLevers = valueLevers.reduce((s, l) => s + (l.target_value_cents || 0), 0);
    const targetValueCents = typeof parsed.target_value_dollars === 'number' && parsed.target_value_dollars > 0
      ? Math.round(parsed.target_value_dollars * 100) : targetFromLevers;

    return {
      summary: String(parsed.summary || seed.summary),
      horizonDays: 100,
      targetValueCents,
      valueLevers: valueLevers.length ? valueLevers : seed.valueLevers,
      workstreams,
    };
  } catch {
    return seed; // LLM/parse failure → deterministic plan, never empty
  }
}

/* ---- persist (upsert header + replace workstreams + milestone) ---- */
export async function saveIntegrationPlan(deal: PmiDealInput, plan: GeneratedPlan, sourceAnalysisRunId?: number | null): Promise<number> {
  const [header] = await sql`
    INSERT INTO pmi_value_capture_plans (deal_id, user_id, horizon_days, summary, target_value_cents, value_levers, source_analysis_run_id, status, updated_at)
    VALUES (${deal.dealId}, ${deal.userId}, ${plan.horizonDays}, ${plan.summary}, ${plan.targetValueCents}, ${sql.json(plan.valueLevers as any)}::jsonb, ${sourceAnalysisRunId ?? null}, 'active', NOW())
    ON CONFLICT (deal_id) DO UPDATE SET
      summary = EXCLUDED.summary,
      target_value_cents = EXCLUDED.target_value_cents,
      value_levers = EXCLUDED.value_levers,
      horizon_days = EXCLUDED.horizon_days,
      source_analysis_run_id = EXCLUDED.source_analysis_run_id,
      status = 'active',
      updated_at = NOW()
    RETURNING id
  `;
  const planId = header.id as number;

  // regenerate replaces the workstream set (real idempotency — no dupes)
  await sql`DELETE FROM pmi_workstreams WHERE plan_id = ${planId}`;
  let order = 0;
  for (const w of plan.workstreams) {
    await sql`
      INSERT INTO pmi_workstreams (plan_id, deal_id, title, detail, owner, first_move, evidence_link, status, pct, sort_order)
      VALUES (${planId}, ${deal.dealId}, ${w.title}, ${w.detail || null}, ${w.owner || null}, ${w.first_move || null}, ${w.evidence_link || null}, 'not_started', 0, ${order++})
    `;
  }

  await sql`
    INSERT INTO pmi_value_capture_milestones (deal_id, plan_id, milestone_type, description, target_value_cents, workstreams_complete, workstreams_total)
    VALUES (${deal.dealId}, ${planId}, 'plan_created', ${`100-day plan created — ${plan.workstreams.length} workstreams, ${fmt(plan.targetValueCents)} illustrative target.`}, ${plan.targetValueCents}, 0, ${plan.workstreams.length})
  `;
  return planId;
}

/* ---- read (plan + workstreams[kind,label derived] + milestones); honest-empty = null ---- */
export async function getIntegrationPlan(dealId: number) {
  const [plan] = await sql`SELECT * FROM pmi_value_capture_plans WHERE deal_id = ${dealId} AND status = 'active' LIMIT 1`;
  if (!plan) return null;
  const wsRows = await sql`SELECT * FROM pmi_workstreams WHERE plan_id = ${plan.id} ORDER BY sort_order ASC, id ASC`;
  const milestones = await sql`SELECT * FROM pmi_value_capture_milestones WHERE plan_id = ${plan.id} ORDER BY created_at ASC`;
  const workstreams = wsRows.map((w: any) => {
    const meta = STATUS_META[w.status] || STATUS_META.not_started;
    return {
      id: w.id, title: w.title, detail: w.detail, owner: w.owner, first_move: w.first_move, evidence_link: w.evidence_link,
      status: w.status, pct: w.pct, kind: meta.kind, label: meta.label,
    };
  });
  return {
    plan: {
      id: plan.id, dealId: plan.deal_id, horizonDays: plan.horizon_days, summary: plan.summary,
      targetValueCents: plan.target_value_cents == null ? null : Number(plan.target_value_cents),
      valueLevers: Array.isArray(plan.value_levers) ? plan.value_levers : [],
      createdAt: plan.created_at, updatedAt: plan.updated_at,
    },
    workstreams,
    milestones,
  };
}

/* ---- update a workstream (self-reported execution progress) ---- */
export async function updateWorkstream(workstreamId: number, dealId: number, patch: { status?: string; pct?: number }) {
  const status = patch.status && VALID_STATUS.includes(patch.status) ? patch.status : undefined;
  const pct = typeof patch.pct === 'number' ? Math.max(0, Math.min(100, Math.round(patch.pct))) : undefined;
  // a completed workstream is 100%; if pct hits 100 with no status, mark complete
  const effStatus = status || (pct === 100 ? 'complete' : undefined);
  const effPct = effStatus === 'complete' ? 100 : pct;

  const [row] = await sql`
    UPDATE pmi_workstreams
    SET status = COALESCE(${effStatus ?? null}, status),
        pct = COALESCE(${effPct ?? null}, pct),
        updated_at = NOW()
    WHERE id = ${workstreamId} AND deal_id = ${dealId}
    RETURNING *
  `;
  if (!row) return null;

  // snapshot completion progress
  const [counts] = await sql`
    SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE status = 'complete')::int AS complete
    FROM pmi_workstreams WHERE plan_id = ${row.plan_id}
  `;
  if (effStatus === 'complete') {
    await sql`
      INSERT INTO pmi_value_capture_milestones (deal_id, plan_id, milestone_type, description, workstreams_complete, workstreams_total)
      VALUES (${dealId}, ${row.plan_id}, 'workstream_completed', ${`Workstream complete: ${row.title}`}, ${counts.complete}, ${counts.total})
    `;
  }
  const meta = STATUS_META[row.status] || STATUS_META.not_started;
  return { id: row.id, title: row.title, status: row.status, pct: row.pct, kind: meta.kind, label: meta.label };
}
