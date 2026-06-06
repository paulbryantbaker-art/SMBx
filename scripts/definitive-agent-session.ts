#!/usr/bin/env npx tsx
/**
 * Agent session walkthrough — "be the agent, see the outputs."
 *
 * Drives a full end-to-end agent session against the DEFINITIVE substrate and
 * PRINTS the real artifacts the agent receives at each step: discovery, the two
 * usage modes, orientation, a one-time analysis (a real computed model output),
 * and the extended-methodology loop (ingest -> completeness -> model stack ->
 * IOI -> advance -> LOI -> take-back package).
 *
 * DB-free (no OAuth / Stripe / Postgres). Real model math via executeV19Model
 * with known-good inputs from the conformance fixtures. Each step also asserts
 * success so this doubles as a test (exit 1 on any failure).
 *
 * Run: npm run test:definitive-agent-session
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildAgentCard } from '../server/services/agentCard.js';
import { listDefinitiveMcpTools, buildAgentEntryAssessment } from '../server/services/definitiveMcp.js';
import {
  executeDefinitiveDealStateTool,
  type DefinitiveDealState,
} from '../server/services/definitiveDealState.js';
import {
  composeDefinitiveApplicableMechanics,
  summarizeDefinitiveApplicableMechanics,
} from '../server/services/definitiveDealRouteMap.js';
import { executeV19Model } from '../server/services/v19ModelRuntime.js';

// ── pretty printing ──
let failed = 0;
function must(cond: unknown, label: string) {
  if (!cond) { failed++; console.log(`   ✗ FAILED: ${label}`); }
}
function hr(title: string) {
  console.log('\n' + '═'.repeat(78));
  console.log('  ' + title);
  console.log('═'.repeat(78));
}
function step(n: string, title: string) {
  console.log(`\n▸ ${n}  ${title}`);
}
function show(label: string, value: unknown) {
  const json = JSON.stringify(value, (_k, v) => {
    if (typeof v === 'string' && v.length > 240) return v.slice(0, 237) + '…';
    if (Array.isArray(v) && v.length > 8) return [...v.slice(0, 8), `…(+${v.length - 8} more)`];
    return v;
  }, 2);
  console.log(`   ${label}:`);
  console.log(json.split('\n').map(l => '     ' + l).join('\n'));
}
const callsBrief = (calls: any[] = []) =>
  calls.map(c => `${c.priority || '–'} ${c.toolName}${c.advancesGate ? ` →${c.advancesGate}` : ''}`);

console.log('\n   smbX DEFINITIVE — full agent session (substrate-only, real outputs)');

// ════════════════════════════════════════════════════════════════════════════
hr('1 · DISCOVERY — what an agent reads at the front door');
const card: any = buildAgentCard();
const inventory = listDefinitiveMcpTools();
console.log(`\n   Agent card version ${card.version} · ${inventory.tools.length} tools advertised`);
show('value modes (how an agent gets value)', {
  summary: card.definitive.usageModes.summary,
  oneTimeAnalysis: card.definitive.usageModes.oneTimeAnalysis.carryBack,
  extendedMethodology: card.definitive.usageModes.extendedMethodology.carryBack,
});
const exModel: any = inventory.tools.find(t => t.name === 'execute_model');
show('a sample tool card (execute_model)', {
  title: exModel.title, requires: exModel.guide.requires,
  whenToUse: exModel.guide.whenToUse[0], whenNotToUse: exModel.guide.whenNotToUse[0],
  produces: exModel.guide.produces, typicalNext: exModel.guide.typicalNext,
});
must(card.definitive.usageModes && exModel.guide, 'discovery exposes modes + tool cards');

// ════════════════════════════════════════════════════════════════════════════
hr('2 · ORIENT — assess_deal_entry decides the path');

step('2a', 'Agent handed ONE task: "run a working-capital model"');
const narrow: any = buildAgentEntryAssessment({ objective: 'run a working capital / QoE model on this target' });
show('taskLane', { detected: narrow.taskLane.detected, intent: narrow.taskLane.taskIntent, lane: narrow.taskLane.lane.map((s: any) => `${s.step}.${s.toolName}(${s.requires})`) });
must(narrow.taskLane.detected, 'narrow task routed to a focused lane');

step('2b', 'Agent working the whole deal: "help me buy this HVAC company"');
const full: any = buildAgentEntryAssessment({ objective: 'help me buy this HVAC company', journey: 'buy', payload: { industry: 'HVAC services', revenueCents: 800_000_000, ebitdaCents: 160_000_000 } });
show('entry', { journey: full.entryClassification.journey, stage: full.entryClassification.stageLabel, taskLaneDetected: full.taskLane.detected, next_suggested_calls: callsBrief(full.next_suggested_calls), loopContract: full.loopContract.steps.map((s: string) => s.split(' — ')[0]) });
must(!full.taskLane.detected && full.next_suggested_calls.length > 0, 'full journey routed to the iterative loop');

// ════════════════════════════════════════════════════════════════════════════
hr('3 · ONE-TIME ANALYSIS — execute real models, carry back the outputs');
const fixtures: any[] = JSON.parse(readFileSync(resolve(process.cwd(), 'testing/definitive/conformance/v1/model-runtime.cases.json'), 'utf8'));
const pickCase = (modelId: string) =>
  fixtures.find(c => c.modelId === modelId && c.expect?.outputs && Object.keys(c.expect.outputs).length > 0);
const featured = ['MODEL.VAL.EBITDA.v1', 'MODEL.VAL.SDE.v1', 'MODEL.STRUCT.NWC.PEG.v1', 'MODEL.SOURCES.USES.v1']
  .map(pickCase).filter(Boolean);
let lastRun: any = null;
for (const c of featured) {
  step('3', `execute_model — ${c.modelId}  (${c.title})`);
  show('input the agent sends', c.input);
  const r: any = await executeV19Model({ modelId: c.modelId, input: c.input });
  lastRun = r;
  show('ModelOutput the agent carries back', {
    status: r.status,
    outputs: r.outputs,
    citations: (r.citations || []).map((x: any) => x.authority || x.source || x.id || x).slice(0, 5),
    outputHash: r.outputHash,
    methodology: r.auditPayload?.methodologyUri,
  });
  must(['ok', 'complete'].includes(r.status) && r.outputHash?.length === 64, `${c.modelId} executed with an audited output hash`);
}

// ════════════════════════════════════════════════════════════════════════════
hr('4 · EXTENDED METHODOLOGY — work the buy-side deal through the loop');
const buyPayload = { journey: 'buy', targetName: 'Atlas HVAC', industry: 'HVAC services', jurisdiction: 'US-TX', revenueCents: 800_000_000, ebitdaCents: 160_000_000, thesis: 'platform acquisition', dealType: 'stock_purchase' };

step('4a', 'ingest_deal_payload — hand over partial facts, get a classified DealState');
const ingest: any = executeDefinitiveDealStateTool('ingest_deal_payload', { idempotencyKey: 'session-buy', payload: buyPayload });
const state = ingest.result.dealState as DefinitiveDealState;
show('DealState', { journey: state.classificationKey.journey, league: state.classificationKey.league, completeness: state.completenessReport.score, level: state.completenessReport.level, nextGate: state.completenessReport.nextGate, missingNext: state.missingInputContract.minimalNextInputSet });
show('next_suggested_calls', callsBrief(ingest.result.next_suggested_calls));
must(ingest.ok && state.classificationKey.journey === 'buy', 'ingest classified the deal, no rejection');

step('4b', 'compose_model_stack — the analysis available for this deal');
const mechanics = composeDefinitiveApplicableMechanics({ journey: 'buy', dealType: 'stock_purchase', industry: 'HVAC services', jurisdiction: 'US-TX', triggeredGates: state.classificationKey.triggeredOverlayGates });
const sum = summarizeDefinitiveApplicableMechanics(mechanics);
show('applicable models (top 6)', mechanics.slice(0, 6).map((m: any) => `${m.slotId} ${m.name} [${m.readiness}]`));
console.log(`     total ${sum.total} models · ${mechanics.filter((m: any) => m.readiness === 'executable').length} executable`);
must(sum.total > 0, 'analysis stack routed');

step('4c', 'prepare_ioi_packet — the document for the IOI stage');
const ioi: any = executeDefinitiveDealStateTool('prepare_ioi_packet', { dealState: state });
const ioiKey = Object.keys(ioi.result).find(k => /packet|ioi/i.test(k)) || 'ioiPacket';
show('IOIPacket (excerpt)', { artifact: ioiKey, takeBack: ioi.result.portableTakeBackArtifacts, next_suggested_calls: callsBrief(ioi.result.next_suggested_calls) });
must(ioi.ok, 'IOI document produced');

step('4d', 'update_deal_payload — agent brings new facts, deal advances');
const updated: any = executeDefinitiveDealStateTool('update_deal_payload', { dealState: state, patch: { purchasePriceCents: 1_200_000_000, structure: 'stock_purchase', keyTerms: { escrowPct: 10, earnout: true } } });
const state2 = updated.result.dealState as DefinitiveDealState;
console.log(`     completeness ${state.completenessReport.score} → ${state2.completenessReport.score}  ·  gate ${state.completenessReport.nextGate} → ${state2.completenessReport.nextGate}`);
must(updated.ok, 'deal advanced on new facts');

step('4e', 'prepare_loi_packet — the document for the LOI stage');
const loi: any = executeDefinitiveDealStateTool('prepare_loi_packet', { dealState: state2 });
show('LOIPacket (excerpt)', { takeBack: loi.result.portableTakeBackArtifacts, next_suggested_calls: callsBrief(loi.result.next_suggested_calls) });
must(loi.ok, 'LOI document produced');

step('4f', 'compose_deal_package — close the loop, carry the whole deal back');
const pkg: any = executeDefinitiveDealStateTool('compose_deal_package', { dealState: state2 });
show('DealPackage (the portable take-back)', { packageCid: pkg.result.dealPackage.packageCid, takeBackArtifacts: pkg.result.dealPackage.takeBackArtifacts, next_suggested_calls: callsBrief(pkg.result.next_suggested_calls) });
must(pkg.ok && String(pkg.result.dealPackage.packageCid).includes('sha256:'), 'portable package produced');

// ════════════════════════════════════════════════════════════════════════════
hr('SESSION COMPLETE');
console.log(`\n   The agent: discovered the value → oriented → ran ${featured.length} one-time analyses`);
console.log(`   (real outputs, last hash ${String(lastRun?.outputHash).slice(0, 12)}…) → worked the buy-side`);
console.log(`   deal through IOI and LOI → carried back a portable DealPackage.`);
console.log(failed ? `\n   ✗ ${failed} step(s) failed.\n` : `\n   ✓ Every step returned a usable artifact with a next step. End to end.\n`);
if (failed) process.exit(1);
