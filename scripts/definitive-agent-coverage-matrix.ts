#!/usr/bin/env npx tsx
/**
 * Agent coverage matrix.
 *
 * Tests the core substrate promise from an agent's point of view: at ANY stage
 * of ANY deal, an agent can come and get (a) the ANALYSIS it needs (the
 * applicable model stack, with executable models) and (b) the DOCUMENT it needs
 * for that stage — with no dead-end (every artifact returns next_suggested_calls)
 * and THE LINE intact.
 *
 * Data-driven from the methodology itself: the stages come from
 * getDefinitiveDealRunbook(journey).stages, so the matrix covers "any stage of
 * any deal" by construction and auto-covers any stage added later.
 *
 * DB-free (no OAuth, no Stripe, no Postgres) — runs anywhere, like the
 * conformance and surface smokes.
 *
 * Run: npm run test:definitive-agent-coverage
 */
import {
  executeDefinitiveDealStateTool,
  type DefinitiveDealState,
} from '../server/services/definitiveDealState.js';
import {
  composeDefinitiveApplicableMechanics,
  summarizeDefinitiveApplicableMechanics,
  type DefinitiveJourney,
} from '../server/services/definitiveDealRouteMap.js';
import { getDefinitiveDealRunbook } from '../server/services/definitiveDealRunbooks.js';

const JOURNEYS: DefinitiveJourney[] = ['buy', 'sell', 'raise', 'pmi'];

// Representative facts so ingest classifies the journey and the model stack routes.
const JOURNEY_PAYLOADS: Record<DefinitiveJourney, Record<string, any>> = {
  buy: { journey: 'buy', targetName: 'Atlas HVAC', industry: 'HVAC services', jurisdiction: 'US-TX', revenueCents: 800_000_000, ebitdaCents: 160_000_000, thesis: 'platform acquisition', dealType: 'stock_purchase' },
  sell: { journey: 'sell', businessName: 'Northstar Plumbing', industry: 'plumbing services', jurisdiction: 'US-FL', revenueCents: 500_000_000, ebitdaCents: 100_000_000, sdeCents: 120_000_000 },
  raise: { journey: 'raise', companyName: 'Cloudbridge', industry: 'B2B SaaS', jurisdiction: 'US-DE', revenueCents: 1_200_000_000, ebitdaCents: 150_000_000, dealType: 'growth_equity' },
  pmi: { journey: 'pmi', businessName: 'Atlas HVAC', industry: 'HVAC services', jurisdiction: 'US-TX', revenueCents: 800_000_000, ebitdaCents: 160_000_000, closingDate: '2026-01-15' },
};

// DB-free tools that produce a take-back work-product (a "doc").
const DOC_TOOLS = new Set([
  'prepare_ioi_packet', 'prepare_loi_packet', 'compose_data_room_index', 'prepare_diligence_request',
  'disclose_subset', 'compose_document_draft', 'prepare_negotiation_brief', 'compose_close_readiness',
  'generate_funds_flow', 'compose_pmi_plan', 'compose_deal_plan', 'compose_lifecycle_trace',
]);

// Fallback documentType for compose_document_draft when a stage's primaryTools
// carry no dedicated doc builder (e.g. intake).
const STAGE_DOC_TYPE: Record<string, string> = {
  intake: 'deal_brief', ioi: 'ioi', deeper_diligence: 'diligence_request', loi: 'loi_outline',
  confirmatory_diligence: 'diligence_request', model_negotiation: 'negotiation_brief', close_pmi: 'close_readiness',
};

function docInputFor(tool: string, stageId: string): Record<string, any> {
  if (tool === 'compose_document_draft') return { documentType: STAGE_DOC_TYPE[stageId] || 'deal_brief' };
  if (tool === 'disclose_subset') return { categories: ['financials', 'legal'] };
  if (tool === 'prepare_diligence_request') return { categories: ['financials', 'legal', 'tax'] };
  return {};
}

function docToolsForStage(stage: any): string[] {
  const docTools = (stage.primaryTools as string[]).filter(tool => DOC_TOOLS.has(tool));
  return docTools.length ? docTools : ['compose_document_draft'];
}

const LINE_RE = /the[_ ]?line|line.?invariant|DEFINITIVE computes|does not advise/i;

/** A doc result is "usable" when the tool succeeded, returned a real artifact
 *  payload (not just metadata), and offered next_suggested_calls (no dead-end). */
function validateDocResult(res: any): { ok: boolean; reason: string; line: boolean } {
  const line = LINE_RE.test(JSON.stringify(res || {}));
  if (!res || res.ok !== true) return { ok: false, reason: 'tool not ok', line };
  const result = res.result || {};
  const meta = new Set([
    'next_suggested_calls', 'portableTakeBackArtifacts', 'the_line_invariant', 'methodology_version',
    'state_hash_after', 'completeness_contribution_delta', 'mandateChain',
  ]);
  const artifactKeys = Object.keys(result).filter(key => !meta.has(key));
  if (artifactKeys.length === 0) return { ok: false, reason: 'no artifact payload', line };
  if (!Array.isArray(result.next_suggested_calls)) return { ok: false, reason: 'no next_suggested_calls (dead-end)', line };
  return { ok: true, reason: '', line };
}

// ── tiny harness ──
let passed = 0;
let failed = 0;
const failures: string[] = [];
function check(cond: boolean, label: string) {
  if (cond) passed++;
  else { failed++; failures.push(label); }
}

console.log('\nsmbX DEFINITIVE agent coverage matrix');
console.log('Q: at ANY stage of ANY deal, can an agent get the analysis + the doc it needs?');
console.log('Mode: substrate-only — no OAuth, no Stripe, no Postgres\n');

type Row = { journey: string; stage: string; analysis: string; docs: string; ok: boolean };
const rows: Row[] = [];

for (const journey of JOURNEYS) {
  const runbook = getDefinitiveDealRunbook(journey);
  check(Boolean(runbook && runbook.stages.length), `${journey}: runbook exposes stages`);
  if (!runbook) continue;

  // DealState for this journey (DB-free ingest).
  const ingest = executeDefinitiveDealStateTool('ingest_deal_payload', {
    idempotencyKey: `coverage-${journey}`, payload: JOURNEY_PAYLOADS[journey],
  }) as any;
  check(ingest.ok === true, `${journey}: ingest ok (no rejection)`);
  const state = ingest?.result?.dealState as DefinitiveDealState;
  check(Boolean(state), `${journey}: DealState returned`);
  if (!state) continue;
  check(state.classificationKey.journey === journey, `${journey}: classified as ${journey}`);

  // ANALYSIS availability — the applicable model stack, reachable at every stage.
  const mechanics = composeDefinitiveApplicableMechanics({
    journey,
    league: state.classificationKey.league === 'unknown' ? undefined : state.classificationKey.league,
    dealType: String(state.payload.dealType || state.payload.structure || state.classificationKey.subJourney || ''),
    industry: state.classificationKey.industry === 'unknown' ? undefined : state.classificationKey.industry,
    jurisdiction: state.classificationKey.jurisdiction === 'unknown' ? undefined : state.classificationKey.jurisdiction,
    triggeredGates: state.classificationKey.triggeredOverlayGates,
  });
  const summary = summarizeDefinitiveApplicableMechanics(mechanics);
  const executable = mechanics.filter((route: any) => route.readiness === 'executable').length;
  const mcp = mechanics.some((route: any) => route.toolSurfaces.includes('mcp'));
  check(summary.total > 0, `${journey}: analysis stack is non-empty`);
  check(executable >= 1, `${journey}: at least one executable model is reachable`);
  check(mcp, `${journey}: analysis is exposed on the MCP surface`);
  const analysisCell = `${executable}/${summary.total}`;

  // DOC availability — the document(s) each stage needs.
  for (const stage of runbook.stages) {
    const tools = docToolsForStage(stage);
    const okTools: string[] = [];
    let cellOk = true;
    for (const tool of tools) {
      const res = executeDefinitiveDealStateTool(tool, { dealState: state, ...docInputFor(tool, stage.stageId) }) as any;
      const verdict = validateDocResult(res);
      check(verdict.ok, `${journey}/${stage.stageId}: ${tool} returns a usable doc${verdict.reason ? ` (${verdict.reason})` : ''}`);
      check(verdict.line, `${journey}/${stage.stageId}: ${tool} carries THE LINE`);
      if (verdict.ok) okTools.push(tool);
      else cellOk = false;
    }
    rows.push({ journey, stage: stage.stageId, analysis: analysisCell, docs: okTools.join(', ') || '(none)', ok: cellOk && summary.total > 0 });
  }
}

// ── coverage grid ──
console.log('     JOURNEY  STAGE                   ANALYSIS  DOC TOOL(S) THAT RETURNED A USABLE ARTIFACT');
console.log('  ' + '-'.repeat(96));
for (const row of rows) {
  console.log(`  ${row.ok ? '✓' : '✗'}  ${row.journey.padEnd(6)} ${row.stage.padEnd(22)} ${row.analysis.padEnd(8)} ${row.docs}`);
}
console.log('  ' + '-'.repeat(96));
console.log(`  ANALYSIS column = executable / total applicable models reachable for that journey.\n`);
console.log(`Cells: ${rows.length} (journey × stage)  ·  assertions: ${passed} passed, ${failed} failed`);

if (failed) {
  console.log('\nFailures:');
  for (const failure of failures) console.log('  ✗ ' + failure);
  process.exit(1);
}
console.log('\n✓ Every stage of every deal yields an analysis stack + a usable document. Agent coverage complete.');
