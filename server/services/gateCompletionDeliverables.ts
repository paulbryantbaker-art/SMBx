/**
 * Gate Completion Deliverables — authed-side bridge.
 *
 * UX-05 fix. The anonymous chat path (`server/routes/chat.ts:477+`) generates
 * a free completion deliverable inline whenever a gate advances. The authed
 * path didn't — it relied on Yulia voluntarily calling generate_free_deliverable
 * herself, which she rarely did at the moment of advance. Net effect: the deal
 * advanced silently in the database with no artifact for the user to see.
 *
 * This helper closes the gap. After `checkAndAutoAdvance` succeeds on the authed
 * path, the route calls `enqueueGateCompletionDeliverable(deal, fromGate)`. We
 * insert a `deliverables` row immediately (status='generating') so the SSE
 * event can include `completionDeliverableId` and the V6 listener opens the
 * placeholder tab right away. The generator runs off-thread (`setImmediate`)
 * and updates the row when content lands.
 *
 * Chat-first: the deliverable IS the artifact of the gate advance. Yulia
 * doesn't need a separate "generate VRR for me?" prompt — completing the gate
 * is the trigger.
 */
import postgres from 'postgres';
import { generateValueReadinessReport, type VRRInput } from './generators/valueReadinessReport.js';
import { generateThesisDocument, type ThesisInput } from './generators/thesisDocument.js';
import { generateSdeAnalysis, type SdeAnalysisInput } from './generators/sdeAnalysis.js';

const sql = postgres(process.env.DATABASE_URL!, {
  ssl: 'require',
  prepare: false,
});

export type GateCompletionDeliverableType =
  | 'value_readiness_report'  // S0 → S1
  | 'thesis_document'         // B0 → B1
  | 'sde_analysis';           // S1 → S2

export interface GateCompletionResult {
  deliverableId: number;
  deliverableType: GateCompletionDeliverableType;
  title: string;
  status: 'generating' | 'complete' | 'failed';
}

/**
 * Map: gate that just COMPLETED → completion deliverable type.
 * Mirrors `gateService.GATE_COMPLETION_DELIVERABLES` (anonymous path) so the
 * authed and anon experiences emit the same artifact at the same moments.
 */
const GATE_COMPLETION_MAP: Record<string, GateCompletionDeliverableType> = {
  S0: 'value_readiness_report',
  B0: 'thesis_document',
  S1: 'sde_analysis',
};

const TYPE_TITLES: Record<GateCompletionDeliverableType, string> = {
  value_readiness_report: 'Value Readiness Report',
  thesis_document: 'Investment Thesis',
  sde_analysis: 'SDE Analysis',
};

/**
 * After a gate advances on the authed path, insert a pending deliverable row
 * and kick off generation off-thread. Returns the new row's id + type so the
 * SSE `gate_advance` event can carry them and V6 opens the matching tab.
 *
 * Returns null if the just-completed gate has no mapped deliverable (in which
 * case the caller emits the gate_advance event without deliverable fields).
 */
export async function enqueueGateCompletionDeliverable(
  deal: Record<string, any>,
  fromGate: string,
): Promise<GateCompletionResult | null> {
  const deliverableType = GATE_COMPLETION_MAP[fromGate];
  if (!deliverableType) return null;

  // Insert a pending row immediately so we have an id for the SSE payload.
  // status='generating' lets the client render a "still generating" placeholder.
  // content can be null per migration 018 (NULL is the sentinel for in-progress).
  const [row] = await sql`
    INSERT INTO deliverables (deal_id, user_id, type, status, content, price_charged_cents)
    VALUES (${deal.id}, ${deal.user_id}, ${deliverableType}, 'generating', NULL, 0)
    RETURNING id
  `;

  // Fire-and-forget generation. When it completes, the row is updated to
  // status='complete' with content. The client polls `/api/deliverables/:id`
  // (or B1.4's chat card opens the tab once the user sees the gate_advance
  // notification — by then generation usually has landed).
  setImmediate(async () => {
    try {
      const content = await runGenerator(deliverableType, deal);
      await sql`
        UPDATE deliverables
        SET status = 'complete',
            content = ${JSON.stringify({ markdown: content, generated_at: new Date().toISOString() })}::jsonb,
            completed_at = NOW()
        WHERE id = ${row.id}
      `;
      console.log(`[gate-completion] ${deliverableType} ready for deliverable ${row.id} (deal ${deal.id})`);
    } catch (e: any) {
      console.error(`[gate-completion] ${deliverableType} generation failed for deliverable ${row.id}:`, e.message);
      await sql`
        UPDATE deliverables
        SET status = 'failed',
            content = ${JSON.stringify({ error: e.message })}::jsonb
        WHERE id = ${row.id}
      `.catch(() => {});
    }
  });

  return {
    deliverableId: row.id,
    deliverableType,
    title: TYPE_TITLES[deliverableType],
    status: 'generating',
  };
}

async function runGenerator(
  type: GateCompletionDeliverableType,
  deal: Record<string, any>,
): Promise<string> {
  // Deal financials may be a parsed object or a JSON string depending on the
  // postgres driver. Normalize first.
  const financials: Record<string, any> = typeof deal.financials === 'string'
    ? JSON.parse(deal.financials)
    : (deal.financials || {});

  if (type === 'value_readiness_report') {
    const input: VRRInput = {
      business_name: deal.business_name ?? undefined,
      industry: deal.industry ?? undefined,
      location: deal.location ?? undefined,
      revenue: deal.revenue ?? undefined,
      sde: deal.sde ?? undefined,
      ebitda: deal.ebitda ?? undefined,
      owner_compensation: financials.owner_compensation,
      owner_salary: financials.owner_salary,
      employee_count: financials.employee_count,
      years_in_business: financials.years_in_business,
      exit_motivation: financials.exit_motivation,
      timeline_preference: financials.timeline_preference,
      league: deal.league || 'L1',
      naics_code: financials.naics_code,
      location_state: financials.location_state,
      exit_type: financials.exit_type,
    };
    return generateValueReadinessReport(input);
  }

  if (type === 'thesis_document') {
    const input: ThesisInput = {
      buyer_type: financials.buyer_type,
      target_industry: financials.target_industry,
      target_geography: financials.target_geography,
      capital_available: financials.capital_available,
      financing_approach: financials.financing_approach,
      target_size_range: financials.target_size_range,
      league: deal.league || 'L1',
      prefers_sba: !!(financials.financing_approach as string)?.toLowerCase()?.includes('sba'),
      session_id: `deal-${deal.id}`,
    };
    return generateThesisDocument(input);
  }

  if (type === 'sde_analysis') {
    const input: SdeAnalysisInput = {
      business_name: deal.business_name ?? undefined,
      industry: deal.industry ?? undefined,
      location: deal.location ?? undefined,
      revenue: deal.revenue ?? undefined,
      sde: deal.sde ?? undefined,
      ebitda: deal.ebitda ?? undefined,
      owner_compensation: financials.owner_compensation,
      owner_salary: financials.owner_salary,
      net_income: financials.net_income,
      league: deal.league || 'L1',
      add_backs: financials.add_backs,
    };
    return generateSdeAnalysis(input);
  }

  throw new Error(`Unhandled completion deliverable type: ${type}`);
}
