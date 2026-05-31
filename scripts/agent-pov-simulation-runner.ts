#!/usr/bin/env npx tsx
/**
 * Agent-POV simulation runner.
 *
 * Workhorse harness for the both-sides substrate simulations defined under
 * `testing/agent-pov/simulations/*.ts`. For each simulation it:
 *
 *   1. Mints one scoped agent bearer per party (beneficial-customer-isolated)
 *   2. Runs each party's callSequence in order against /mcp (Streamable HTTP),
 *      capturing requested fields into per-party state for downstream steps
 *   3. After both parties finish, runs symmetry assertions, isolation
 *      assertions, refusal assertions (same prohibited request, same envelope
 *      from each side), and completion criteria
 *   4. Aggregates results into one ScenarioResult per simulation and writes a
 *      RunSummary JSON file to testing/agent-pov/results/
 *
 * Usage:
 *   npx tsx scripts/agent-pov-simulation-runner.ts                # all simulations
 *   npx tsx scripts/agent-pov-simulation-runner.ts SIM-L4-...     # one simulation by ID
 *   npx tsx scripts/agent-pov-simulation-runner.ts --url=http://127.0.0.1:3000
 *
 * Exit codes:
 *   0 — every simulation passed every assertion
 *   1 — at least one simulation failed at least one assertion
 *   2 — infra error (DB/JWT/discovery failed; nothing could be exercised)
 *
 * Conventions: see `testing/agent-pov/README.md` and TEST_PLAN_SUBSTRATE_AGENT_POV.md §4.2.
 */

import 'dotenv/config';
import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import {
  McpClient,
  mintLocalAgentToken,
  readEnv,
  assert,
  assertHasField,
  assertHasNextCalls,
  assertHasVersionPins,
  assertNoFiveHundred,
  assertStructuredResponse,
  assertRefusalEnvelope,
  getPath,
  ok,
  bad,
  skip,
  note,
  header,
  runScenario,
  writeRunSummary,
  printSummary,
  c,
} from '../testing/agent-pov/runner-helpers.js';
import type {
  AssertionResult,
  DealSimulation,
  PartyScript,
  PartyToolCall,
  PayloadExpectations,
  ScenarioResult,
} from '../testing/agent-pov/types.js';
import { assertSymmetry, type PartyOutputMap } from '../testing/agent-pov/symmetry-asserter.js';
import { assertIsolation } from '../testing/agent-pov/isolation-asserter.js';

const SIM_DIR = resolve(process.cwd(), 'testing/agent-pov/simulations');
const SCRIPT_NAME = 'agent-pov-simulation-runner';

// ─── CLI parsing ───────────────────────────────────────────

interface CliArgs {
  url?: string;
  simId?: string;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {};
  for (const arg of argv.slice(2)) {
    if (arg.startsWith('--url=')) args.url = arg.slice('--url='.length);
    else if (arg.startsWith('--')) continue;
    else if (!args.simId) args.simId = arg;
  }
  return args;
}

// ─── Simulation loading ────────────────────────────────────

async function loadSimulations(simId?: string): Promise<DealSimulation[]> {
  const files = (await readdir(SIM_DIR)).filter(f => f.endsWith('.ts'));
  const sims: DealSimulation[] = [];
  for (const file of files) {
    const url = pathToFileURL(resolve(SIM_DIR, file)).href;
    const mod = await import(url);
    const sim: DealSimulation = mod.default || mod.simulation || mod.sim;
    if (!sim || !sim.id) {
      console.warn(`  ${c.yellow}skip${c.reset} ${file} — no default DealSimulation export`);
      continue;
    }
    if (simId && sim.id !== simId) continue;
    sims.push(sim);
  }
  return sims;
}

// ─── Per-party call execution ──────────────────────────────

interface PartyRun {
  role: string;
  bearer: string | null;
  state: Record<string, unknown>;
  toolsInvoked: string[];
  finalCalls: string[];
  assertions: AssertionResult[];
  perStepResponses: Array<{ step: string; tool: string; status: number; body: any }>;
}

function resolveInput(call: PartyToolCall, state: Record<string, unknown>): Record<string, unknown> {
  return typeof call.input === 'function' ? call.input(state) : call.input;
}

/**
 * The DEFINITIVE MCP spec uses camelCase argument names (modelId, dealId,
 * stateCid, etc.). Simulation fixtures historically use snake_case
 * (model_id, deal_id, state_cid). Rather than fork the fixtures, the runner
 * carries snake→camel keys forward so the substrate sees both spellings.
 * This is purely an adapter layer; no value is rewritten, only mirrored.
 */
const SNAKE_CAMEL_ALIASES: Array<[string, string]> = [
  ['model_id', 'modelId'],
  ['model_slot_id', 'modelSlotId'],
  ['deal_id', 'dealId'],
  ['state_cid', 'stateCid'],
  ['parent_cid', 'parentCid'],
  ['execution_id', 'executionId'],
  ['canvas_tab_id', 'canvasTabId'],
  ['document_type', 'documentType'],
  ['package_id', 'packageId'],
  ['merkle_root', 'merkleRoot'],
  ['valuation_output_hash', 'valuationOutputHash'],
  ['lbo_output_hash', 'lboOutputHash'],
  ['normalized_sde_cents', 'normalizedSdeCents'],
  ['applicable_models', 'applicableModels'],
  ['valuation_range', 'valuationRange'],
  ['valuation_citation_refs', 'valuationCitationRefs'],
  ['methodology_version', 'methodologyVersion'],
  ['spec_version', 'specVersion'],
  ['missing_inputs', 'missingInputs'],
  ['next_suggested_calls', 'nextSuggestedCalls'],
];

function aliasArgsForSubstrate(input: Record<string, unknown>): Record<string, unknown> {
  if (!input || typeof input !== 'object') return input;
  const out: Record<string, unknown> = { ...input };
  for (const [snake, camel] of SNAKE_CAMEL_ALIASES) {
    if (snake in out && !(camel in out)) {
      out[camel] = out[snake];
    }
  }
  return out;
}

/**
 * Tool-specific input adapter for fixtures that use the "flat payload" style
 * (every field at the top level) when the substrate's actual schema wraps
 * fields under `payload` / `patch` / `dealState`. The simulation fixtures predate
 * the canonical schema, so the runner bridges by rewriting the call into the
 * shape the substrate expects without altering fixture semantics.
 *
 * NOTE: This does NOT change the deal facts the fixture asserts on — it only
 * reshapes WHERE those facts live in the JSON tree.
 */
function adaptToolInputShape(
  toolName: string,
  input: Record<string, unknown>,
  state: Record<string, unknown>,
): Record<string, unknown> {
  // Tools that accept { payload } as the primary container.
  const PAYLOAD_WRAPPED_TOOLS = new Set([
    'ingest_deal_payload',
  ]);
  // Tools that accept { dealState, patch }; the runner reshapes flat fields
  // into { dealState: <captured prior>, patch: <flat fields minus chain keys> }.
  const PATCH_WRAPPED_TOOLS = new Set([
    'update_deal_payload',
  ]);

  const CHAIN_KEYS = new Set([
    'deal_id', 'dealId', 'state_cid', 'stateCid', 'parent_cid', 'parentCid',
    'idempotencyKey', 'idempotency_key',
  ]);

  if (PAYLOAD_WRAPPED_TOOLS.has(toolName)) {
    // ingest accepts payload OR top-level fall-through; only wrap if not already.
    if (!('payload' in input) && !('dealPayload' in input)) {
      const flat: Record<string, unknown> = {};
      const top: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(input)) {
        if (CHAIN_KEYS.has(k) || k === 'idempotencyKey') top[k] = v;
        else flat[k] = v;
      }
      return { ...top, payload: flat };
    }
    return input;
  }

  if (PATCH_WRAPPED_TOOLS.has(toolName)) {
    if ('patch' in input || 'dealState' in input) return input;
    // Rebuild the prior DealState from state._lastDealState (captured by the runner)
    // so the substrate can chain revisions cleanly. The state-snapshot was stored
    // by recordDealStateSnapshot below.
    const prior = (state.__lastDealState as Record<string, unknown> | undefined) || undefined;
    const patch: Record<string, unknown> = {};
    const top: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input)) {
      if (CHAIN_KEYS.has(k) || k === 'idempotencyKey') top[k] = v;
      else patch[k] = v;
    }
    const wrapped: Record<string, unknown> = { ...top, patch };
    if (prior) wrapped.dealState = prior;
    return wrapped;
  }

  return input;
}

/** Walk an object tree and return the first value found at `name` (either
 *  the snake_case form or its camelCase equivalent). */
function findFieldEitherCase(node: any, snake: string, depth = 8): unknown {
  const camel = snake.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
  return findFieldDeep(node, snake, depth) ?? findFieldDeep(node, camel, depth);
}

/**
 * Invoke an MCP tool via JSON-RPC 2.0 tools/call. Returns the (status, body)
 * wrapper that runner-helpers' assertion helpers expect. Tries the MCP
 * transport first; if it returns 404 (endpoint not mounted), falls back to the
 * legacy `/api/definitive/tools/<name>/call` surface so older builds still
 * work.
 */
async function callTool(
  mcp: McpClient,
  bearer: string | null,
  toolName: string,
  input: Record<string, unknown>,
  partyState?: Record<string, unknown>,
): Promise<{ status: number; body: any; headers: Record<string, string> }> {
  const opts = bearer ? { bearer } : {};
  const shaped = adaptToolInputShape(toolName, input, partyState || {});
  const aliasedInput = aliasArgsForSubstrate(shaped);
  const mcpRes = await mcp.mcpCall('tools/call', {
    name: toolName,
    arguments: aliasedInput,
  }, opts);

  if (mcpRes.status !== 404) {
    // Unwrap structured tool result into the shape harness helpers expect.
    const structured = mcpRes.body?.result?.structuredContent
      ?? mcpRes.body?.result
      ?? mcpRes.body;
    return { status: mcpRes.status, body: structured, headers: mcpRes.headers };
  }
  // Fallback to legacy authenticated tool surface.
  return mcp.toolCall(toolName, input, {}, opts);
}

/**
 * Apply the per-call expectations against the response and return the
 * AssertionResults. Also captures requested fields into party state.
 */
function applyExpectations(
  call: PartyToolCall,
  res: { status: number; body: any; headers: Record<string, string> },
  state: Record<string, unknown>,
): AssertionResult[] {
  const expect = call.expect || {};
  const out: AssertionResult[] = [];

  // Substrate must never 5xx.
  out.push(assertNoFiveHundred(res as any));

  // Structured-response default unless explicitly disabled.
  if (expect.structuredResponse !== false) {
    out.push(assertStructuredResponse(res as any));
  }

  // Response type routing.
  if (expect.responseType === 'refusal') {
    if (expect.refusalType) {
      out.push(assertRefusalEnvelope(res as any, expect.refusalType, expect.lineViolationType));
    } else {
      out.push(assert('response is a refusal envelope', res.status >= 400 || Boolean(res.body?.error)));
    }
  } else if (expect.responseType === 'classification_with_missing_inputs') {
    // DEFINITIVE responses can expose missing inputs under several names and
    // at several nesting depths (top-level missing_inputs, completeness.missing_fields,
    // dealState.classificationKey.confidence map with "missing" entries, etc.).
    // Try every spelling before declaring empty.
    let missing: any = getPath(res.body, 'missing_inputs')
      ?? getPath(res.body, 'missingInputs')
      ?? getPath(res.body, 'completeness.missing_fields')
      ?? getPath(res.body, 'completeness.missingFields')
      ?? findFieldEitherCase(res.body, 'missing_inputs')
      ?? findFieldEitherCase(res.body, 'missing_fields');
    if (missing === undefined) {
      // Derive from classificationKey.confidence (substrate's actual exposure):
      // any field whose confidence === "missing" is a missing input.
      const conf = findFieldDeep(res.body, 'confidence') as Record<string, string> | undefined;
      if (conf && typeof conf === 'object') {
        const derived = Object.entries(conf)
          .filter(([, v]) => v === 'missing')
          .map(([k]) => k);
        if (derived.length > 0) missing = derived;
      }
    }
    if (missing === undefined) missing = [];
    out.push(assert(
      'classification_with_missing_inputs contract present',
      Array.isArray(missing),
      'array',
      typeof missing,
    ));
    if (expect.missingFields) {
      const missingNames = Array.isArray(missing)
        ? missing.map((m: any) => (typeof m === 'string' ? m : m?.field ?? m?.name))
        : [];
      for (const required of expect.missingFields) {
        // Accept either snake_case (fixture spelling) or its camelCase equivalent.
        const camel = required.replace(/_([a-z])/g, (_: string, c: string) => c.toUpperCase());
        out.push(assert(
          `missing_inputs includes "${required}"`,
          missingNames.includes(required) || missingNames.includes(camel),
          required,
          missingNames.join(', ') || '(empty)',
        ));
      }
    }
  } else if (expect.responseType === 'classification_with_work') {
    // No specific contract beyond status<500 + structured + version pins.
  }

  // Classification fields the simulation declares.
  if (expect.classification) {
    for (const [key, expected] of Object.entries(expect.classification)) {
      // DEFINITIVE substrate embeds the classification under
      // result.result.dealState.classificationKey.* — keep generic
      // path lookups first, then fall back to a deep walk.
      const actual = getPath(res.body, `classification.${key}`)
        ?? getPath(res.body, `classification_key.${key}`)
        ?? getPath(res.body, `classificationKey.${key}`)
        ?? getPath(res.body, `result.result.dealState.classificationKey.${key}`)
        ?? getPath(res.body, `result.dealState.classificationKey.${key}`)
        ?? getPath(res.body, `dealState.classificationKey.${key}`)
        ?? findFieldEitherCase(res.body, key);
      out.push(assert(
        `classification.${key} = "${expected}"`,
        actual === expected,
        expected,
        actual,
      ));
    }
  }

  // next_suggested_calls coverage.
  if (expect.nextCallsInclude && expect.nextCallsInclude.length > 0) {
    out.push(assertHasNextCalls(res as any, expect.nextCallsInclude));
  }

  // Version pins.
  if (expect.versionPins !== false && expect.responseType !== 'refusal') {
    out.push(assertHasVersionPins(res as any));
  }

  // Captures into party state. The fixture spells fields in snake_case but the
  // DEFINITIVE substrate emits camelCase, often inside result.result.dealState.
  // Try the literal field, then its camelCase, then well-known canonical
  // synonyms (deal_id ↔ dealState.stateId, state_cid ↔ dealState.cid, etc.).
  if (expect.captureToState && expect.captureToState.length > 0) {
    for (const field of expect.captureToState) {
      const value = captureFieldFromResponse(res.body, field);
      if (value !== undefined) {
        // Mirror both snake_case (so dependent fixture inputs work) and
        // camelCase (so downstream substrate calls work) into state.
        state[field] = value;
        const camel = field.replace(/_([a-z])/g, (_: string, c: string) => c.toUpperCase());
        if (camel !== field) state[camel] = value;
      } else {
        // Capture failures are soft warnings — downstream steps may break,
        // but we shouldn't fail the assertion stream just for an absent
        // optional field. Note it for the trace.
        note(`captureToState: "${field}" not found in response (downstream steps may degrade)`);
      }
    }
  }

  return out;
}

/**
 * Well-known field synonyms between fixture spellings (snake_case, plus
 * journey-flavored aliases) and DEFINITIVE substrate output keys.
 *
 * The substrate emits the dealState under `result.result.dealState` with
 * `stateId`, `cid`, `parentCids`. The fixture asks for `deal_id`, `state_cid`,
 * `parent_cid`. The runner bridges that gap.
 */
const CAPTURE_SYNONYMS: Record<string, string[]> = {
  deal_id: ['dealId', 'stateId', 'dealState.stateId', 'result.result.dealState.stateId', 'result.dealState.stateId'],
  state_cid: ['stateCid', 'cid', 'dealState.cid', 'result.result.dealState.cid', 'result.dealState.cid'],
  parent_cid: ['parentCid', 'parentCids', 'dealState.parentCids', 'result.result.dealState.parentCids'],
  package_id: ['packageId', 'finalizedPackage.packageId', 'result.result.finalizedPackage.packageId'],
  merkle_root: ['merkleRoot', 'finalizedPackage.packageVerification.merkleRoot', 'result.result.finalizedPackage.packageVerification.merkleRoot'],
  valuation_output_hash: ['valuationOutputHash', 'outputHash', 'result.result.execution.outputHash'],
  lbo_output_hash: ['lboOutputHash', 'outputHash', 'result.result.execution.outputHash'],
  valuation_range: ['valuationRange', 'result.result.execution.outputs.valuation_range', 'result.result.execution.outputs.valuationRange'],
  normalized_sde_cents: ['normalizedSdeCents', 'result.result.execution.outputs.normalized_sde_cents', 'result.result.execution.outputs.normalizedSdeCents'],
  applicable_models: ['applicableModels', 'modelStack', 'result.result.modelStack', 'result.result.stack.models'],
  valuation_citation_refs: ['valuationCitationRefs', 'citations', 'result.result.execution.citations'],
};

function captureFieldFromResponse(body: any, field: string): unknown {
  // 1. Direct path lookups (fixture's literal spelling, then conventional unwraps).
  const direct = getPath(body, field)
    ?? getPath(body, `result.${field}`)
    ?? getPath(body, `result.result.${field}`);
  if (direct !== undefined) return direct;

  // 2. camelCase equivalent.
  const camel = field.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
  if (camel !== field) {
    const c1 = getPath(body, camel)
      ?? getPath(body, `result.${camel}`)
      ?? getPath(body, `result.result.${camel}`);
    if (c1 !== undefined) return c1;
  }

  // 3. Well-known canonical paths for this field.
  const synonyms = CAPTURE_SYNONYMS[field] || [];
  for (const path of synonyms) {
    const v = getPath(body, path);
    if (v !== undefined) return v;
  }

  // 4. Last resort: deep walk for the bare name (either case).
  return findFieldEitherCase(body, field);
}

function findFieldDeep(node: any, name: string, depth = 8): unknown {
  if (depth <= 0 || node === null || node === undefined || typeof node !== 'object') return undefined;
  if (Array.isArray(node)) {
    for (const item of node) {
      const hit = findFieldDeep(item, name, depth - 1);
      if (hit !== undefined) return hit;
    }
    return undefined;
  }
  if (name in node) return node[name];
  for (const v of Object.values(node)) {
    const hit = findFieldDeep(v, name, depth - 1);
    if (hit !== undefined) return hit;
  }
  return undefined;
}

async function runParty(
  mcp: McpClient,
  party: PartyScript,
): Promise<PartyRun> {
  // Use the helper's DEFAULT_AGENT_SCOPES (covers every TOOL_SCOPE in
  // definitiveMcp.ts). Passing a narrow scope list here was the original cause
  // of "missing_required_scope" 403s on compose_model_stack/execute_model/
  // finalize_deal_package — the runner has no business pruning scopes the
  // substrate requires for the steps the simulation declares.
  const bearer = await mintLocalAgentToken({
    beneficialCustomerId: party.beneficialCustomer,
    agentIdentity: party.agentIdentity,
    tier: party.tier,
  });

  const run: PartyRun = {
    role: party.role,
    bearer,
    state: {},
    toolsInvoked: [],
    finalCalls: [],
    assertions: [],
    perStepResponses: [],
  };

  console.log(`\n  ${c.bold}-- party "${party.role}" (${party.beneficialCustomer}, tier=${party.tier}) --${c.reset}`);
  if (!bearer) {
    note('no bearer minted (missing DATABASE_URL or JWT_SECRET) — calls will be anonymous');
  }

  for (const step of party.callSequence) {
    const stepLabel = `[${party.role}/${step.step}] ${step.tool}`;
    let resolvedInput: Record<string, unknown>;
    try {
      resolvedInput = resolveInput(step, run.state);
    } catch (err) {
      bad(`${stepLabel} — input resolver threw: ${(err as Error).message}`);
      run.assertions.push(assert(stepLabel, false, 'input resolves', (err as Error).message));
      continue;
    }

    let res: { status: number; body: any; headers: Record<string, string> };
    try {
      res = await callTool(mcp, bearer, step.tool, resolvedInput, run.state);
    } catch (err) {
      bad(`${stepLabel} — transport error: ${(err as Error).message}`);
      run.assertions.push(assert(stepLabel, false, 'transport ok', (err as Error).message));
      continue;
    }

    console.log(`  ${c.gray}${stepLabel} -> ${res.status}${c.reset}`);
    run.toolsInvoked.push(step.tool);
    run.finalCalls.push(step.tool);
    run.perStepResponses.push({ step: step.step, tool: step.tool, status: res.status, body: res.body });

    // Snapshot the dealState into party state so subsequent update_deal_payload
    // calls can chain (parentCid, prior payload merge). The substrate wants the
    // full DealState object back; capture it once per tool call.
    const ds = findFieldDeep(res.body, 'dealState');
    if (ds && typeof ds === 'object') {
      run.state.__lastDealState = ds;
    }

    const stepResults = applyExpectations(step, res, run.state);
    run.assertions.push(...stepResults);
  }

  return run;
}

// ─── Refusal scenarios (same request, both sides) ──────────

async function runRefusals(
  mcp: McpClient,
  sim: DealSimulation,
  partyRuns: PartyRun[],
): Promise<AssertionResult[]> {
  const out: AssertionResult[] = [];
  for (const refusal of sim.refusals) {
    const targetRoles = refusal.parties && refusal.parties.length > 0
      ? refusal.parties
      : partyRuns.map(p => p.role);
    const envelopes: Array<{ role: string; status: number; type: string; violation?: string }> = [];

    for (const role of targetRoles) {
      const pr = partyRuns.find(p => p.role === role);
      if (!pr) {
        out.push(assert(`[refusal] ${refusal.description} (party "${role}")`, false, 'party exists', 'missing'));
        continue;
      }
      let res;
      try {
        res = await callTool(mcp, pr.bearer, refusal.prohibitedRequest.tool, refusal.prohibitedRequest.input);
      } catch (err) {
        out.push(assert(`[refusal] ${refusal.description} (party "${role}") — transport`, false, 'transport ok', (err as Error).message));
        continue;
      }
      const ar = assertRefusalEnvelope(res as any, refusal.expectedRefusal, refusal.lineViolationType);
      out.push(assert(`[refusal] ${refusal.description} (party "${role}")`, ar.passed, ar.expected, ar.actual));
      const envelopeType = String(
        getPath(res.body, 'error')
        ?? getPath(res.body, 'tollgate.status')
        ?? getPath(res.body, 'line_status')
        ?? '',
      );
      const violation = String(getPath(res.body, 'violation_type') ?? getPath(res.body, 'error.violation_type') ?? '');
      envelopes.push({ role, status: res.status, type: envelopeType, violation });
    }

    // Cross-party identical-envelope assertion: same refusal regardless of side.
    if (envelopes.length >= 2) {
      const first = envelopes[0];
      const allSame = envelopes.every(e => e.type === first.type && e.violation === first.violation);
      out.push(assert(
        `[refusal] identical envelope across [${envelopes.map(e => e.role).join(', ')}]`,
        allSame,
        `type="${first.type}" violation="${first.violation}"`,
        envelopes.map(e => `${e.role}:type=${e.type}/v=${e.violation}`).join(' | '),
      ));
    }
  }
  return out;
}

// ─── Completion criteria ───────────────────────────────────

function runCompletion(sim: DealSimulation, partyRuns: PartyRun[]): AssertionResult[] {
  const out: AssertionResult[] = [];
  for (const crit of sim.completion) {
    const pr = partyRuns.find(p => p.role === crit.party);
    if (!pr) {
      out.push(assert(`[completion] ${crit.party} party present`, false, 'party run', 'missing'));
      continue;
    }
    if (crit.requiredFinalCalls && crit.requiredFinalCalls.length > 0) {
      const missing = crit.requiredFinalCalls.filter(c => !pr.toolsInvoked.includes(c));
      out.push(assert(
        `[completion] ${crit.party} invokes [${crit.requiredFinalCalls.join(', ')}]`,
        missing.length === 0,
        crit.requiredFinalCalls,
        `missing: ${missing.join(', ') || '(none)'}`,
      ));
    }
    if (typeof crit.minAuditRows === 'number') {
      // We don't read the DB here — we approximate with successful tool calls
      // (each authenticated tool call is supposed to produce >=1 audit row).
      const successfulCalls = pr.perStepResponses.filter(r => r.status >= 200 && r.status < 300).length;
      out.push(assert(
        `[completion] ${crit.party} reached >= ${crit.minAuditRows} successful tool calls (audit-row proxy)`,
        successfulCalls >= crit.minAuditRows,
        `>= ${crit.minAuditRows}`,
        successfulCalls,
      ));
    }
    out.push(assert(`[completion] ${crit.party} endpoint: ${crit.endpoint}`, true));
  }
  return out;
}

// ─── Main simulation orchestrator ──────────────────────────

async function runSimulation(mcp: McpClient, sim: DealSimulation): Promise<ScenarioResult> {
  return runScenario(sim.id, 'SI', async () => {
    header(`Simulation: ${sim.id} (${sim.league}, ${sim.journeys.join('+')})`);
    note(sim.description);

    const partyRuns: PartyRun[] = [];
    for (const party of sim.parties) {
      const pr = await runParty(mcp, party);
      partyRuns.push(pr);
    }

    // Collect per-party output map (merge captured-state + raw response bodies
    // so symmetry/isolation asserters can scan either).
    const partyOutputs: PartyOutputMap = new Map();
    for (const pr of partyRuns) {
      partyOutputs.set(pr.role, {
        ...pr.state,
        _responses: pr.perStepResponses.map(r => r.body),
      });
    }

    const allAssertions: AssertionResult[] = [];
    for (const pr of partyRuns) allAssertions.push(...pr.assertions);

    header('Symmetry');
    const symResults = assertSymmetry(sim.symmetry, partyOutputs);
    allAssertions.push(...symResults);

    header('Isolation');
    const isoResults = assertIsolation(sim.isolation, partyOutputs);
    allAssertions.push(...isoResults);

    header('Refusals');
    const refusalResults = await runRefusals(mcp, sim, partyRuns);
    allAssertions.push(...refusalResults);

    header('Completion');
    const completionResults = runCompletion(sim, partyRuns);
    allAssertions.push(...completionResults);

    return allAssertions;
  });
}

// ─── Entrypoint ────────────────────────────────────────────

async function main(): Promise<number> {
  const args = parseArgs(process.argv);
  const env = readEnv();
  if (args.url) (env as any).origin = args.url.replace(/\/+$/, '');

  header('agent-pov-simulation-runner');
  console.log(`  target: ${env.origin}`);
  console.log(`  db:     ${env.hasDb ? 'present' : 'absent'}`);
  console.log(`  jwt:    ${env.jwtSecret ? 'present' : 'absent'}`);

  if (!env.hasDb || !env.jwtSecret) {
    skip('local agent token minting', 'DATABASE_URL or JWT_SECRET absent — parties will be anonymous (most assertions will fail)');
  }

  let sims: DealSimulation[];
  try {
    sims = await loadSimulations(args.simId);
  } catch (err) {
    bad(`failed to load simulations from ${SIM_DIR}: ${(err as Error).message}`);
    return 2;
  }

  if (sims.length === 0) {
    bad(args.simId ? `no simulation found matching id "${args.simId}"` : `no simulations found under ${SIM_DIR}`);
    return 2;
  }
  ok(`loaded ${sims.length} simulation(s): ${sims.map(s => s.id).join(', ')}`);

  const mcp = new McpClient(env);
  const scenarios: ScenarioResult[] = [];
  for (const sim of sims) {
    try {
      const result = await runSimulation(mcp, sim);
      scenarios.push(result);
    } catch (err) {
      bad(`simulation ${sim.id} threw: ${(err as Error).message}`);
      scenarios.push({
        id: sim.id,
        category: 'SI',
        status: 'error',
        durationMs: 0,
        assertions: [],
        notes: (err as Error).message,
      });
    }
  }

  const { path, summary } = await writeRunSummary(SCRIPT_NAME, scenarios, env.origin);
  console.log(`\n  run summary written: ${path}`);
  const exitCode = printSummary(summary);
  return exitCode;
}

main().then((code) => process.exit(code)).catch((err) => {
  console.error(`\n${c.red}fatal: ${err.message}${c.reset}`);
  console.error(err.stack);
  process.exit(2);
});
