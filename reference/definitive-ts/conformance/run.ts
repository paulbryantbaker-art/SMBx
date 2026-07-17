#!/usr/bin/env node
/**
 * DEFINITIVE conformance harness (TypeScript reference implementation).
 *
 * Runs the PUBLISHED conformance suite and the boundary-refusal suite against
 * the independent reference implementation in `spec-models.ts`. An external
 * developer runs `npm install && npm test` and watches the published suite
 * pass — with no access to any private smbX code.
 *
 * Contract asserted per case:
 *   1. status matches (`complete` | `needs_inputs`)
 *   2. every field in expect.outputs deep-equals the reference output (subset,
 *      exact values — monetary integer cents; rates half-even to 4 decimals)
 *   3. every name in expect.missingInputsIncludes appears in missingInputs
 * Boundary-refusal cases additionally assert the model ROUTES (defer_to_counsel
 * true) rather than answering — REQ-DTC.
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execute, COVERED_MODELS } from './spec-models.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Slot id (what the reference impl dispatches on) → runtime binding id (what
 *  the published cases carry). Public spec data — each model page §10. */
const BINDING: Record<string, string> = {
  M109: 'MODEL.STRUCT.NWC.PEG.v1',
  M119: 'MODEL.LBO.SBA.v1',
  M128: 'MODEL.HSR.TRIAGE.v1',
  M186: 'MODEL.TAX.382.NOL_LIMIT.v1',
  M232: 'MODEL.RE.CITT_REASSESSMENT_SCREEN.v1',
};
const SLOT_OF = new Map(Object.entries(BINDING).map(([slot, id]) => [id, slot]));

interface PublishedCase { id: string; modelId: string; title?: string; input: Record<string, any>; expect: { status: string; outputs?: Record<string, any>; missingInputsIncludes?: string[] } }
interface BoundaryCase { id: string; req: string; slot: string; title: string; input: Record<string, any>; expect: Record<string, any> }

function resolveCasesFile(): string {
  // Emitted (external) package ships cases locally; repo dev reads the source suite.
  const local = path.resolve(__dirname, 'cases', 'model-runtime.cases.json');
  if (existsSync(local)) return local;
  const repo = path.resolve(__dirname, '../../../testing/definitive/conformance/v1/model-runtime.cases.json');
  if (existsSync(repo)) return repo;
  throw new Error('cannot locate model-runtime.cases.json (looked in ./cases and the repo suite)');
}

const eq = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
let passed = 0, failed = 0;
const fail = (id: string, msg: string) => { failed++; console.error(`FAIL ${id}: ${msg}`); };
const pass = (id: string) => { passed++; console.log(`PASS ${id}`); };

console.log('\nDEFINITIVE — TypeScript reference conformance');
console.log(`Reference implementation covers ${COVERED_MODELS.length} model(s): ${COVERED_MODELS.join(', ')}`);

/* ── Published model-runtime suite (filtered to covered models) ────────── */
const allCases: PublishedCase[] = JSON.parse(readFileSync(resolveCasesFile(), 'utf8'));
const covered = allCases.filter(c => SLOT_OF.has(c.modelId) && COVERED_MODELS.includes(SLOT_OF.get(c.modelId)!));
console.log(`\nPublished suite: ${covered.length} case(s) target covered models (of ${allCases.length} total).`);
for (const c of covered) {
  const slot = SLOT_OF.get(c.modelId)!;
  try {
    const r = execute(slot, c.input);
    if (r.status !== c.expect.status) { fail(c.id, `status ${r.status} != ${c.expect.status}`); continue; }
    let ok = true;
    for (const [k, v] of Object.entries(c.expect.outputs ?? {})) {
      if (!eq(r.outputs[k], v)) { fail(c.id, `output ${k}: expected ${JSON.stringify(v)}, got ${JSON.stringify(r.outputs[k])}`); ok = false; break; }
    }
    if (!ok) continue;
    for (const m of c.expect.missingInputsIncludes ?? []) {
      if (!r.missingInputs.includes(m)) { fail(c.id, `missingInputs should include ${m}, got ${JSON.stringify(r.missingInputs)}`); ok = false; break; }
    }
    if (ok) pass(c.id);
  } catch (e) { fail(c.id, e instanceof Error ? e.message : String(e)); }
}

/* ── Boundary-refusal suite (REQ-DTC — route, do not answer) ───────────── */
// The published suite ships boundary cases for every model-backed DTC category;
// this reference implementation runs the ones whose model it covers (coverage
// extends model-by-model, exactly like the model-runtime suite above).
const boundaryFile = path.resolve(__dirname, 'boundary-refusal.cases.json');
const allBoundary: BoundaryCase[] = JSON.parse(readFileSync(boundaryFile, 'utf8'));
const boundaryCases = allBoundary.filter(c => COVERED_MODELS.includes(c.slot));
console.log(`\nBoundary-refusal suite: ${boundaryCases.length} of ${allBoundary.length} case(s) target covered models — a conforming implementation MUST route, not answer.`);
for (const c of boundaryCases) {
  try {
    const r = execute(c.slot, c.input);
    let ok = true;
    for (const [k, v] of Object.entries(c.expect)) {
      if (!eq(r.outputs[k], v)) { fail(c.id, `[${c.req}] ${k}: expected ${JSON.stringify(v)}, got ${JSON.stringify(r.outputs[k])}`); ok = false; break; }
    }
    if (ok) pass(`${c.id} (${c.req})`);
  } catch (e) { fail(c.id, e instanceof Error ? e.message : String(e)); }
}

console.log(`\nConformance: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
console.log('An independent implementation reproduced the published suite from the specification alone.');
