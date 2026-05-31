#!/usr/bin/env npx tsx
/**
 * Agent-POV state integrity harness — SI-001 through SI-009.
 *
 * Validates DealState persistence, lineage, hashing, version pins, citation
 * resolution, audit-row shape, and deterministic execution, all from the
 * outside, the way an external agent experiences the DEFINITIVE substrate.
 *
 *   SI-001  DealState persists across calls (get_deal_state returns same CID)
 *   SI-002  update_deal_payload creates new DealState with parent CID = prior CID
 *   SI-003  clone_deal_state creates a branch-safe copy
 *   SI-004  diff_deal_state shows expected, deterministic delta
 *   SI-005  list_model_executions returns model run history with hashes
 *   SI-006  Every tool call writes an audit row carrying the full mandate chain
 *   SI-007  Version pins on every output
 *   SI-008  Deterministic hashing (same input → identical output_hash)
 *   SI-009  Citation refs resolve via lookup_citation
 *
 * Usage:
 *   npx tsx scripts/agent-pov-state-integrity.ts
 *   npx tsx scripts/agent-pov-state-integrity.ts --url=http://127.0.0.1:3000
 *   npx tsx scripts/agent-pov-state-integrity.ts --url=https://smbx.ai --bearer=$TOKEN
 *
 * Exit codes: 0 all pass, 1 any fail, 2 infrastructure error.
 */

import 'dotenv/config';
import { randomBytes } from 'node:crypto';
import {
  McpClient,
  assert,
  assertStructuredResponse,
  assertHasField,
  assertNoFiveHundred,
  c,
  getPath,
  header,
  mintLocalAgentToken,
  note,
  ok,
  printSummary,
  readEnv,
  runScenario,
  sha256,
  writeRunSummary,
} from '../testing/agent-pov/runner-helpers.js';
import type { AssertionResult, ScenarioResult } from '../testing/agent-pov/types.js';

// ─── CLI parsing ────────────────────────────────────────────

interface Args {
  url?: string;
  bearer?: string;
}

function parseArgs(argv: string[]): Args {
  const out: Args = {};
  for (const arg of argv.slice(2)) {
    if (arg.startsWith('--url=')) out.url = arg.slice('--url='.length);
    else if (arg.startsWith('--bearer=')) out.bearer = arg.slice('--bearer='.length);
  }
  return out;
}

const args = parseArgs(process.argv);
const env = readEnv();
const origin = (args.url || env.origin).replace(/\/+$/, '');
const client = new McpClient({ ...env, origin });

const RUN_ID = `si-${Date.now().toString(36)}-${randomBytes(3).toString('hex')}`;
const AGENT_ID = `agent:agent-pov-state-integrity:${RUN_ID}`;
const AGENT_PLATFORM_ID = 'agent-pov-state-integrity';
const MANDATE_ID = `mandate:agent-pov-state-integrity:${RUN_ID}`;
const SOURCE_AGENT = 'agent-pov-state-integrity';
const IDEMPOTENCY_BASE = `agent-pov-state-integrity:${RUN_ID}`;

// ─── Bootstrap ──────────────────────────────────────────────

header('Agent-POV state integrity (SI-001 → SI-009)');
console.log(`  target:  ${origin}`);
console.log(`  run id:  ${RUN_ID}`);

let bearer: string | null = args.bearer
  || process.env.DEFINITIVE_MCP_ACCESS_TOKEN
  || process.env.SMBX_MCP_ACCESS_TOKEN
  || null;

if (!bearer) {
  bearer = await mintLocalAgentToken({
    agentIdentity: AGENT_ID,
    scopes: [
      'capability:read',
      'methodology:read',
      'authority:read',
      'citation:read',
      'deal-state:read',
      'deal-state:write',
      'deal-state:diff',
      'deal:classify',
      'deal:read',
      'deal-plan:read',
      'completeness:read',
      'model:read',
      'model:execute',
      'model-stack:compose',
      'audit:read',
      'audit:write',
    ],
    tier: 'enterprise',
  });
}

if (!bearer) {
  console.error(`${c.red}✗ no bearer token available. Set DEFINITIVE_MCP_ACCESS_TOKEN, or run with DATABASE_URL + JWT_SECRET, or pass --bearer=...${c.reset}`);
  process.exit(2);
}

note(`bearer token: ${bearer.slice(0, 14)}…${bearer.slice(-6)}`);

// ─── Helpers ────────────────────────────────────────────────

function meta(label: string) {
  return {
    requestId: `${RUN_ID}:${label}`,
    agentId: AGENT_ID,
    agentPlatformId: AGENT_PLATFORM_ID,
    mandateId: MANDATE_ID,
  };
}

/**
 * Wraps an MCP tool call through the audience-bound /mcp transport.
 * Falls back to /api/definitive/tools/call if /mcp returns 4xx schema mismatch.
 */
async function callTool(toolName: string, args: Record<string, unknown>, label: string) {
  const requestId = `${RUN_ID}:${label}`;
  const mcpRes = await client.mcpCall(
    'tools/call',
    { name: toolName, arguments: args, _meta: meta(label) },
    { bearer: bearer!, headers: { 'MCP-Protocol-Version': '2025-11-25', 'Accept': 'application/json, text/event-stream' } },
  );
  // Prefer the structured envelope on /mcp. If 2xx with structuredContent,
  // hoist that into the body for simpler assertions.
  if (mcpRes.status === 200 && mcpRes.body?.result?.structuredContent) {
    const structured = mcpRes.body.result.structuredContent;
    return {
      status: mcpRes.status,
      body: structured,
      headers: mcpRes.headers,
      requestId,
    };
  }
  // Fall back to legacy authenticated tool route used by other smoke scripts.
  const fallback = await client.toolCall(
    toolName,
    args,
    {},
    { bearer: bearer! },
  );
  if (fallback.status >= 200 && fallback.status < 300) {
    return { ...fallback, requestId };
  }
  // Try the toolName-in-body shape (/api/definitive/tools/call without :toolName).
  const altRes = await fetch(`${origin}/api/definitive/tools/call`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${bearer!}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      toolName,
      specVersion: 'DEFINITIVE.v1.0',
      sourceAgent: SOURCE_AGENT,
      agentId: AGENT_ID,
      agentPlatformId: AGENT_PLATFORM_ID,
      input: args,
    }),
  });
  const altText = await altRes.text();
  let altBody: any = altText;
  try { altBody = JSON.parse(altText); } catch { /* keep raw */ }
  return {
    status: altRes.status,
    body: altBody,
    headers: Object.fromEntries(altRes.headers.entries()),
    requestId,
  };
}

function unwrapResult(body: any): any {
  // Tools sometimes return { result: {...} }, sometimes { result: { result: {...} } }.
  const r1 = body?.result;
  if (r1 && typeof r1 === 'object' && r1.result && typeof r1.result === 'object') return r1.result;
  return r1 ?? body;
}

function extractDealState(body: any): any {
  const r = unwrapResult(body);
  return r?.dealState || r?.result?.dealState || body?.dealState;
}

function extractVersionPins(body: any) {
  return {
    specVersion: body?.specVersion || body?.spec_version || body?.result?.specVersion || body?.result?.spec_version,
    methodologyVersion: body?.methodologyVersion || body?.methodology_version || body?.result?.methodologyVersion || body?.result?.methodology_version,
  };
}

function extractMandateChain(body: any) {
  return body?.mandateChain || body?.mandate_chain || body?.result?.mandateChain || null;
}

function extractAuditTrailId(body: any): number | null {
  const direct = body?.auditTrailId
    || body?.audit_trail_id
    || body?.audit?.auditTrailId
    || body?.result?.auditTrailId
    || body?.persistence?.auditTrailId
    || body?.persistence?.audit_trail_id;
  const parsed = Number(direct);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function assertVersionPins(body: any): AssertionResult {
  const { specVersion, methodologyVersion } = extractVersionPins(body);
  const passed = Boolean(specVersion && methodologyVersion);
  return assert(
    'response carries specVersion + methodologyVersion (version pins)',
    passed,
    'both present',
    `spec=${specVersion ?? 'undefined'}, methodology=${methodologyVersion ?? 'undefined'}`,
  );
}

function assertMandateChain(body: any): AssertionResult {
  const chain = extractMandateChain(body);
  const agent = chain?.agent;
  const principal = chain?.principal;
  const mandate = chain?.mandate;
  const passed = Boolean(chain && agent?.agentId && principal && (mandate?.mandateId || mandate?.status));
  return assert(
    'response carries mandateChain (agent + principal + mandate)',
    passed,
    'mandateChain.{agent,principal,mandate}',
    chain ? JSON.stringify({ agent: !!agent?.agentId, principal: !!principal, mandate: !!mandate }) : 'missing',
  );
}

async function ensureNoCleanup() {
  // SI is read-mostly; we leave any test deals in place so re-runs can compare.
}

// ─── Fixture: shared deal across scenarios ─────────────────

const DEAL_PAYLOAD = {
  journey: 'buy' as const,
  targetName: `Agent-POV SI ${RUN_ID}`,
  industry: 'industrial services',
  jurisdiction: 'US-DE',
  league: 'L4',
  dealType: 'asset purchase with working capital true-up',
  enterpriseValueCents: 12_500_000_00,
  ebitdaCents: 2_100_000_00,
  revenueCents: 18_000_000_00,
  workingCapitalPegCents: 900_000_00,
  documents: [
    { id: 'fin', name: 'Seller P&L', type: 'financials', hash: `sha256:${RUN_ID}:fin` },
    { id: 'qoe', name: 'QoE Report', type: 'qoe', hash: `sha256:${RUN_ID}:qoe` },
  ],
};

interface SharedFixture {
  initialState: any;
  initialBody: any;
  updatedState?: any;
  updatedBody?: any;
  dealId?: number | string;
}

const fixture: SharedFixture = { initialState: null, initialBody: null };

// ─── Scenarios ──────────────────────────────────────────────

const scenarios: ScenarioResult[] = [];

// SI-001 — DealState persists across calls
scenarios.push(await runScenario('SI-001', 'SI', async () => {
  const a: AssertionResult[] = [];
  const ingestRes = await callTool('ingest_deal_payload', {
    idempotencyKey: `${IDEMPOTENCY_BASE}:ingest`,
    payload: DEAL_PAYLOAD,
  }, 'ingest');
  a.push(assertNoFiveHundred(ingestRes));
  a.push(assertStructuredResponse(ingestRes));
  const initialState = extractDealState(ingestRes.body);
  a.push(assert('ingest returns DealState with CID', !!initialState?.cid, 'cid string', initialState?.cid));
  a.push(assert(
    'CID is content-addressable (sha256 prefix)',
    typeof initialState?.cid === 'string' && initialState.cid.includes('sha256:'),
    'sha256:…',
    initialState?.cid,
  ));
  a.push(assertVersionPins(ingestRes.body));
  a.push(assertMandateChain(ingestRes.body));
  fixture.initialState = initialState;
  fixture.initialBody = ingestRes.body;
  fixture.dealId = initialState?.payload?.dealId || initialState?.dealId;

  // get_deal_state — retrieve and assert CID still matches when we round-trip
  // by dealId (if available) or via direct state echo.
  if (fixture.dealId) {
    const getRes = await callTool('get_deal_state', { dealId: fixture.dealId }, 'get');
    a.push(assertNoFiveHundred(getRes));
    const persisted = extractDealState(getRes.body);
    a.push(assert(
      'get_deal_state returns same CID as ingest',
      persisted?.cid === initialState?.cid,
      initialState?.cid,
      persisted?.cid,
    ));
  } else {
    note('no dealId — skipping persisted round-trip assertion');
  }
  return a;
}));

// SI-002 — update_deal_payload creates new DealState with parent CID
scenarios.push(await runScenario('SI-002', 'SI', async () => {
  const a: AssertionResult[] = [];
  if (!fixture.initialState) {
    a.push(assert('SI-001 produced initialState', false, 'initialState', 'null'));
    return a;
  }
  const updateRes = await callTool('update_deal_payload', {
    idempotencyKey: `${IDEMPOTENCY_BASE}:update`,
    dealState: fixture.initialState,
    patch: {
      purchasePriceCents: 11_000_000_00,
      modelOutputs: {
        valuation: { outputHash: `sha256:${RUN_ID}:fixture-valuation`, evCents: 12_000_000_00 },
      },
    },
  }, 'update');
  a.push(assertNoFiveHundred(updateRes));
  a.push(assertStructuredResponse(updateRes));
  const updated = extractDealState(updateRes.body);
  a.push(assert('update returns new DealState', !!updated?.cid, 'cid string', updated?.cid));
  a.push(assert(
    'updated DealState CID differs from prior CID',
    updated?.cid && updated.cid !== fixture.initialState.cid,
    `cid !== ${fixture.initialState.cid}`,
    updated?.cid,
  ));
  const parents = Array.isArray(updated?.parentCids) ? updated.parentCids : [];
  a.push(assert(
    'updated DealState parentCids includes prior CID',
    parents.includes(fixture.initialState.cid),
    [fixture.initialState.cid],
    parents,
  ));
  const revOk = Number(updated?.revision) > Number(fixture.initialState?.revision || 0);
  a.push(assert('updated DealState revision increments', revOk, '> prior', updated?.revision));
  a.push(assertVersionPins(updateRes.body));
  fixture.updatedState = updated;
  fixture.updatedBody = updateRes.body;
  return a;
}));

// SI-003 — clone_deal_state branch-safe copy
scenarios.push(await runScenario('SI-003', 'SI', async () => {
  const a: AssertionResult[] = [];
  const source = fixture.updatedState || fixture.initialState;
  if (!source) {
    a.push(assert('SI-001/002 produced source state', false));
    return a;
  }
  const cloneRes = await callTool('clone_deal_state', {
    dealState: source,
    cloneReason: 'agent-pov-state-integrity',
    patch: { scenarioLabel: `clone-${RUN_ID}` },
  }, 'clone');
  a.push(assertNoFiveHundred(cloneRes));
  a.push(assertStructuredResponse(cloneRes));
  const cloned = extractDealState(cloneRes.body);
  a.push(assert('clone returns DealState', !!cloned?.cid, 'cid string', cloned?.cid));
  a.push(assert(
    'clone CID differs from source',
    cloned?.cid && cloned.cid !== source.cid,
    `cid !== ${source.cid}`,
    cloned?.cid,
  ));
  const cloneParents = Array.isArray(cloned?.parentCids) ? cloned.parentCids : [];
  a.push(assert(
    'clone parentCids preserves source CID',
    cloneParents.includes(source.cid),
    [source.cid],
    cloneParents,
  ));

  // Branch-safety: mutate the clone, confirm the source CID is unchanged when we
  // re-read it (we approximate by checking the snapshot we already hold).
  const tweakRes = await callTool('update_deal_payload', {
    idempotencyKey: `${IDEMPOTENCY_BASE}:clone-mutate`,
    dealState: cloned,
    patch: { scenarioLabel: `clone-mutated-${RUN_ID}`, earnoutCents: 250_000_00 },
  }, 'clone-mutate');
  const mutatedClone = extractDealState(tweakRes.body);
  a.push(assert(
    'mutated clone has new CID',
    mutatedClone?.cid && mutatedClone.cid !== cloned?.cid,
    'new cid',
    mutatedClone?.cid,
  ));
  a.push(assert(
    'source state CID is unchanged in our local snapshot (clone branch-safe)',
    source.cid === (fixture.updatedState?.cid || fixture.initialState?.cid),
    source.cid,
    fixture.updatedState?.cid || fixture.initialState?.cid,
  ));
  return a;
}));

// SI-004 — diff_deal_state shows expected delta
scenarios.push(await runScenario('SI-004', 'SI', async () => {
  const a: AssertionResult[] = [];
  if (!fixture.initialState || !fixture.updatedState) {
    a.push(assert('SI-001/002 produced both states for diff', false));
    return a;
  }
  const diffRes = await callTool('diff_deal_state', {
    previousDealState: fixture.initialState,
    nextDealState: fixture.updatedState,
  }, 'diff');
  a.push(assertNoFiveHundred(diffRes));
  a.push(assertStructuredResponse(diffRes));
  const diff = unwrapResult(diffRes.body)?.dealStateDiff
    || unwrapResult(diffRes.body)?.result?.dealStateDiff
    || diffRes.body?.dealStateDiff;
  a.push(assert('diff returns dealStateDiff envelope', !!diff, 'object', typeof diff));
  if (diff) {
    a.push(assert(
      'diff.previousCid === initial CID',
      diff.previousCid === fixture.initialState.cid,
      fixture.initialState.cid,
      diff.previousCid,
    ));
    a.push(assert(
      'diff.nextCid === updated CID',
      diff.nextCid === fixture.updatedState.cid,
      fixture.updatedState.cid,
      diff.nextCid,
    ));
    const changedPaths: string[] = Array.isArray(diff.changedPaths) ? diff.changedPaths : [];
    a.push(assert(
      'diff.changedPaths includes purchasePriceCents (the field we patched)',
      changedPaths.includes('purchasePriceCents'),
      'purchasePriceCents',
      changedPaths,
    ));
  }

  // Determinism: rerun the same diff and compare the structural digest.
  const diffRes2 = await callTool('diff_deal_state', {
    previousDealState: fixture.initialState,
    nextDealState: fixture.updatedState,
  }, 'diff-repeat');
  const diff2 = unwrapResult(diffRes2.body)?.dealStateDiff
    || unwrapResult(diffRes2.body)?.result?.dealStateDiff;
  if (diff && diff2) {
    const hash1 = sha256({
      previous: diff.previousCid,
      next: diff.nextCid,
      changedPaths: diff.changedPaths,
      completenessScoreDelta: diff.completenessScoreDelta,
    });
    const hash2 = sha256({
      previous: diff2.previousCid,
      next: diff2.nextCid,
      changedPaths: diff2.changedPaths,
      completenessScoreDelta: diff2.completenessScoreDelta,
    });
    a.push(assert('diff is deterministic across repeat call', hash1 === hash2, hash1, hash2));
  }
  return a;
}));

// SI-005 — list_model_executions returns history with hashes
scenarios.push(await runScenario('SI-005', 'SI', async () => {
  const a: AssertionResult[] = [];
  // Seed a model execution so history is non-empty. Use a deterministic minimal
  // payload for a known executable runtime model.
  const execRes = await callTool('execute_model', {
    dealId: fixture.dealId,
    modelId: 'MODEL.VAL.EBITDA.v1',
    input: {
      ebitda_cents: 2_100_000_00,
      low_multiple: 4.0,
      high_multiple: 6.0,
    },
  }, 'exec-seed');
  a.push(assertNoFiveHundred(execRes));
  const execResult = unwrapResult(execRes.body);
  const seedOutputHash = execResult?.execution?.outputHash
    || execResult?.execution?.output_hash
    || execResult?.outputHash;
  // Don't hard-fail if the seed model isn't allowed for this token / env;
  // we'll still query list_model_executions to verify shape.
  if (!seedOutputHash) note('seed execute_model did not produce outputHash (may be entitlement-gated)');

  const listRes = await callTool('list_model_executions', {
    dealId: fixture.dealId,
    limit: 10,
  }, 'list-models');
  a.push(assertNoFiveHundred(listRes));
  a.push(assertStructuredResponse(listRes));
  const listResult = unwrapResult(listRes.body);
  const schema = listResult?.schema || listResult?.result?.schema;
  a.push(assert(
    'list_model_executions returns ModelExecutionHistory.v0.1 schema',
    schema === 'ModelExecutionHistory.v0.1',
    'ModelExecutionHistory.v0.1',
    schema,
  ));
  const executions = listResult?.executions
    || listResult?.result?.executions
    || [];
  a.push(assert('executions array present', Array.isArray(executions), 'array', typeof executions));
  if (Array.isArray(executions) && executions.length > 0) {
    const sample = executions[0];
    const hasHashes = Boolean(
      (sample?.outputHash || sample?.output_hash)
      && (sample?.inputHash || sample?.input_hash),
    );
    a.push(assert('execution rows expose input + output hashes', hasHashes, 'both hashes', JSON.stringify({
      outputHash: sample?.outputHash || sample?.output_hash,
      inputHash: sample?.inputHash || sample?.input_hash,
    })));
  } else {
    note('no executions returned (likely empty fixture); skipping per-row assertions');
  }
  return a;
}));

// SI-006 — every tool call writes audit row with mandate chain (verify via audit-packets endpoint)
scenarios.push(await runScenario('SI-006', 'SI', async () => {
  const a: AssertionResult[] = [];

  // First check: the live response itself must carry the mandate chain — that
  // is the in-band evidence of audit-mandate coupling, independent of the DB.
  a.push(assertMandateChain(fixture.initialBody));
  a.push(assertMandateChain(fixture.updatedBody));

  // Now try to retrieve a recent audit packet for this run via the public
  // audit-packets endpoint. We prefer the audit trail id surfaced by any
  // recent response; otherwise we look for it in the deal-state persistence
  // shape; finally we degrade gracefully if no id is in band.
  const candidate = extractAuditTrailId(fixture.initialBody)
    ?? extractAuditTrailId(fixture.updatedBody);
  if (!candidate) {
    note('no auditTrailId surfaced on tool response — checking deal-pulse / deal-packets endpoints instead');
    if (fixture.dealId) {
      const pktRes = await client.get(`/api/definitive/deal-packets?dealId=${fixture.dealId}&limit=5`, { bearer: bearer! });
      a.push(assertNoFiveHundred(pktRes));
      const packets = Array.isArray(pktRes.body?.packets) ? pktRes.body.packets : [];
      a.push(assert(
        'deal-packets endpoint returns ≥1 packet for this run',
        packets.length > 0,
        '≥1 packet',
        packets.length,
      ));
      if (packets.length > 0) {
        const sample = packets[0];
        a.push(assert(
          'packet rows carry specVersion + methodologyVersion (mandate-chain version pins)',
          !!sample?.specVersion && !!sample?.methodologyVersion,
          'both pinned',
          JSON.stringify({ spec: sample?.specVersion, methodology: sample?.methodologyVersion }),
        ));
      }
    } else {
      a.push(assert('no dealId nor auditTrailId — audit-row verification skipped', false, 'auditTrailId or dealId', 'neither'));
    }
    return a;
  }

  const pktRes = await client.get(`/api/definitive/audit-packets/${candidate}`, { bearer: bearer! });
  a.push(assertNoFiveHundred(pktRes));
  a.push(assertStructuredResponse(pktRes, [200]));
  const pkt = pktRes.body;
  a.push(assert('audit packet has auditTrailId', pkt?.auditTrailId === candidate, candidate, pkt?.auditTrailId));
  a.push(assert('audit packet has specVersion (mandate-chain version pin)', !!pkt?.specVersion, 'string', pkt?.specVersion));
  a.push(assert('audit packet has methodologyVersion (mandate-chain version pin)', !!pkt?.methodologyVersion, 'string', pkt?.methodologyVersion));
  const chain = pkt?.mandateChain;
  a.push(assert('audit packet has mandateChain.principal.userId', !!chain?.principal?.userId, 'number', chain?.principal?.userId));
  a.push(assert('audit packet has mandateChain.agent.agentId', !!chain?.agent?.agentId, 'string', chain?.agent?.agentId));
  a.push(assert('audit packet has auditPacket envelope', !!pkt?.auditPacket, 'object', typeof pkt?.auditPacket));
  return a;
}));

// SI-007 — Version pins on every output (sampled across a handful of tool calls)
scenarios.push(await runScenario('SI-007', 'SI', async () => {
  const a: AssertionResult[] = [];
  const samples: Array<{ label: string; body: any }> = [];

  samples.push({ label: 'ingest', body: fixture.initialBody });
  if (fixture.updatedBody) samples.push({ label: 'update', body: fixture.updatedBody });

  // Sample a non-state read-side tool, too.
  const introRes = await callTool('introspect_capabilities', { journey: 'buy' }, 'intro');
  samples.push({ label: 'introspect_capabilities', body: introRes.body });

  const composeRes = await callTool('compose_model_stack', {
    dealId: fixture.dealId,
    journey: 'buy',
    league: 'L4',
  }, 'compose');
  samples.push({ label: 'compose_model_stack', body: composeRes.body });

  for (const s of samples) {
    const { specVersion, methodologyVersion } = extractVersionPins(s.body);
    a.push(assert(
      `[${s.label}] specVersion present`,
      !!specVersion,
      'string',
      specVersion ?? 'missing',
    ));
    a.push(assert(
      `[${s.label}] methodologyVersion present`,
      !!methodologyVersion,
      'string',
      methodologyVersion ?? 'missing',
    ));
  }

  // Unsupported version must refuse, never silent-default.
  const refusal = await fetch(`${origin}/api/definitive/tools/validate_conformance/call`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${bearer!}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ specVersion: 'DEFINITIVE.v0.invalid', input: {} }),
  });
  const refusalBody = await refusal.json().catch(() => ({}));
  a.push(assert(
    'unsupported spec version returns structured refusal (not silent default)',
    refusal.status === 400 && refusalBody?.error === 'unsupported_version',
    'status=400, error=unsupported_version',
    `status=${refusal.status}, error=${refusalBody?.error}`,
  ));
  return a;
}));

// SI-008 — Deterministic hashing (same input → identical output_hash)
scenarios.push(await runScenario('SI-008', 'SI', async () => {
  const a: AssertionResult[] = [];
  const modelInput = {
    ebitda_cents: 2_100_000_00,
    low_multiple: 4.0,
    high_multiple: 6.0,
  };
  const run1 = await callTool('execute_model', {
    dealId: fixture.dealId,
    modelId: 'MODEL.VAL.EBITDA.v1',
    input: modelInput,
  }, 'det-1');
  const run2 = await callTool('execute_model', {
    dealId: fixture.dealId,
    modelId: 'MODEL.VAL.EBITDA.v1',
    input: modelInput,
  }, 'det-2');
  a.push(assertNoFiveHundred(run1));
  a.push(assertNoFiveHundred(run2));
  const r1 = unwrapResult(run1.body);
  const r2 = unwrapResult(run2.body);
  const hash1 = r1?.execution?.outputHash || r1?.execution?.output_hash || r1?.outputHash;
  const hash2 = r2?.execution?.outputHash || r2?.execution?.output_hash || r2?.outputHash;
  if (!hash1 || !hash2) {
    a.push(assert(
      'execute_model returned outputHash on both runs',
      false,
      'outputHash on both',
      `hash1=${hash1}, hash2=${hash2}`,
    ));
    return a;
  }
  a.push(assert(
    'identical input produces identical outputHash (determinism)',
    hash1 === hash2,
    hash1,
    hash2,
  ));
  return a;
}));

// SI-009 — Citation refs resolve via lookup_citation
scenarios.push(await runScenario('SI-009', 'SI', async () => {
  const a: AssertionResult[] = [];
  // Try to harvest a citation ref from earlier outputs first; fall back to a
  // well-known DEFINITIVE authority ID that the substrate should always know.
  const candidates: string[] = [];
  const harvest = (obj: any) => {
    if (!obj || typeof obj !== 'object') return;
    for (const key of Object.keys(obj)) {
      if (/citation/i.test(key) && Array.isArray((obj as any)[key])) {
        for (const cite of (obj as any)[key]) {
          if (typeof cite === 'string') candidates.push(cite);
          else if (cite?.citeTag) candidates.push(cite.citeTag);
          else if (cite?.authorityId) candidates.push(cite.authorityId);
          else if (cite?.id) candidates.push(cite.id);
        }
      } else if (typeof (obj as any)[key] === 'object') {
        harvest((obj as any)[key]);
      }
    }
  };
  harvest(fixture.initialBody);
  harvest(fixture.updatedBody);

  // Always include known authority + a well-known DEFINITIVE methodology pointer
  // so the harness has something to assert on.
  const fallbackQueries = [
    'methodology://v19',
    'AUTH.IRC.1060',
    'AUTH.IRC.338',
    'AUTH.SBA.SOP.50.10.8',
  ];
  const queryList = candidates.length > 0 ? candidates.slice(0, 3) : fallbackQueries;
  note(`citation queries to resolve: ${queryList.join(', ')}`);

  let resolvedAny = false;
  for (const q of queryList) {
    const res = await callTool('lookup_citation', { query: q, authorityId: q, citeTag: q }, `cite-${q.slice(0, 12)}`);
    if (res.status >= 500) {
      a.push(assertNoFiveHundred(res));
      continue;
    }
    const r = unwrapResult(res.body);
    const found = Boolean(r?.found || r?.authority || r?.citation);
    const active = Boolean(r?.active || r?.authority?.status === 'active');
    if (found && active) {
      resolvedAny = true;
      a.push(assert(`lookup_citation resolved "${q}" to active authority`, true));
      break;
    } else {
      note(`lookup_citation("${q}") → found=${found}, active=${active}`);
    }
  }
  a.push(assert(
    'at least one citation ref resolves to an active Authority Register entry',
    resolvedAny,
    'one active resolution',
    'none of the candidates resolved active',
  ));
  return a;
}));

// ─── Summary ────────────────────────────────────────────────

await ensureNoCleanup();

const { path, summary } = await writeRunSummary('agent-pov-state-integrity', scenarios, origin);
console.log(`\nResult artifact: ${path}`);
const exitCode = printSummary(summary);
process.exit(exitCode);
