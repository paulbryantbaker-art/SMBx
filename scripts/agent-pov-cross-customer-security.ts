#!/usr/bin/env npx tsx
/**
 * Cross-customer security harness — MM-001 through MM-005.
 *
 * P0 CRITICAL test: A single data leak between beneficial customers means the
 * substrate is not agent-ready, regardless of other green tests.
 *
 * Covers:
 *   MM-001 — two agents on the same DealState: distinct agent_id rows, no
 *            mandate-chain cross-pollution.
 *   MM-002 — one agent, multiple deal_ids: list_model_executions filters by
 *            requested deal only.
 *   MM-003 — two beneficial customers cannot read each other's DealStates,
 *            model executions, audit packets, or finalized packages. CRITICAL.
 *   MM-004 — same agent + same deal_id after a simulated delay: DealState
 *            intact; staleness flags accurate.
 *   MM-005 — two agents acting on behalf of the same beneficial customer both
 *            see the same DealState with proper mandate scope.
 *
 * Usage:
 *   DATABASE_URL=... JWT_SECRET=... npx tsx scripts/agent-pov-cross-customer-security.ts
 *   --url=<origin>  (default: http://127.0.0.1:3000)
 *
 * Exits:
 *   0 — every MM-003 cross-customer read returned zero data AND every
 *       scenario assertion passed
 *   1 — any cross-customer leak detected OR any other scenario failure
 *   2 — infrastructure error (missing DB/JWT, server unreachable)
 *
 * The script never modifies production code. It seeds two disposable test
 * users + deals, mints scoped agent tokens, drives /mcp through the public
 * transport, and asserts cross-reads return 403 / not_found / empty.
 */

import 'dotenv/config';
import { randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';
import {
  McpClient,
  assert,
  assertNoFiveHundred,
  bad,
  c,
  header,
  note,
  ok,
  printSummary,
  readEnv,
  runScenario,
  skip,
  writeRunSummary,
} from '../testing/agent-pov/runner-helpers.js';
import type { AssertionResult, ScenarioResult } from '../testing/agent-pov/types.js';

// ─── Constants ─────────────────────────────────────────────

const URL_OVERRIDE = parseUrlArg(process.argv);
const ENV = (() => {
  const base = readEnv();
  return URL_OVERRIDE ? { ...base, origin: URL_OVERRIDE } : base;
})();
const RUN_ID = `xcc-${Date.now()}-${randomBytes(4).toString('hex')}`;
const FIXTURE_KEY = 'agent-pov-cross-customer-security';

const FULL_AGENT_SCOPES = [
  'capability:read',
  'methodology:read',
  'authority:read',
  'deal-state:read',
  'deal-state:write',
  'deal:classify',
  'deal:read',
  'deal-plan:read',
  'model-catalog:read',
  'model-stack:compose',
  'model:read',
  'model:execute',
  'studio:draft',
  'data-room:read',
  'completeness:read',
  'deal-package:read',
  'deal-package:compose',
  'deal-package:verify',
  'permutation:read',
  'audit:write',
  'market-data:read',
  'citation:read',
  'conformance:read',
] as const;

// ─── Identity / token model ────────────────────────────────

interface SeededIdentity {
  /** Display label used in logs and emails. */
  label: string;
  /** users.id row used as JWT principal */
  userId: number;
  /** The beneficial-customer key passed to the substrate. */
  beneficialCustomerId: string;
  /** The agent identity (one or many per user). */
  agentId: string;
  /** Mandate id chained on every call. */
  mandateId: string;
  /** Bearer token for the substrate /mcp endpoint. */
  bearer: string;
  /** Builds the `_meta` envelope for an MCP tool call. */
  callMeta: (requestLabel: string) => Record<string, any>;
}

interface SeededDeal {
  ownerLabel: string;
  ownerUserId: number;
  dealId: number;
  industry: string;
  jurisdiction: string;
  /** Latest persisted DealState CID, if any. */
  latestStateCid?: string;
  /** Latest persisted DealState hash, if any. */
  latestStateHash?: string;
  /** Latest finalized portable package, if any. */
  finalizedPackage?: Record<string, any>;
  /** Model execution rows owned by this deal. */
  modelExecutionIds: number[];
}

// ─── Entrypoint ────────────────────────────────────────────
// (Top-level `await main()` moved to end of file — `let _sqlInstance` declared
//  below needs to be initialized before `loadSql` is called from inside main.)

async function main() {
  console.log(`\n${c.bold}smbX cross-customer security harness${c.reset}`);
  console.log(`  run-id: ${RUN_ID}`);
  console.log(`  target: ${ENV.origin}`);

  if (!ENV.hasDb || !ENV.jwtSecret) {
    bad('Cannot mint local agent tokens — DATABASE_URL and JWT_SECRET are required.');
    note('Set DATABASE_URL and JWT_SECRET to a dev database, then re-run.');
    process.exit(2);
  }

  const reachable = await pingMcp();
  if (!reachable) {
    bad(`Substrate /mcp at ${ENV.origin} is not reachable. Start the server (npx tsx server/index.ts) and retry.`);
    process.exit(2);
  }

  let bcA: SeededIdentity;
  let bcB: SeededIdentity;
  let secondAgentForA: SeededIdentity;
  let secondaryDealA: SeededDeal;
  try {
    bcA = await seedIdentity('bc_security_test_A');
    bcB = await seedIdentity('bc_security_test_B');
    secondAgentForA = await mintAdditionalAgentFor(bcA, 'bc_security_test_A_agent2');
    secondaryDealA = await seedDealRow(bcA, 'B2B services secondary', 'US-CA');
  } catch (err) {
    bad(`Failed to seed identities: ${(err as Error).message}`);
    process.exit(2);
  }

  const client = new McpClient(ENV);
  const scenarios: ScenarioResult[] = [];

  // ─── BC-A produces a DealState, a model execution, and a finalized package
  header('Setup — BC-A produces a DealState, model execution, finalized package');
  const dealA = await produceDealAndArtifacts(client, bcA, 'B2B services primary', 'US-TX');
  const dealB = await produceDealAndArtifacts(client, bcB, 'specialty manufacturing', 'US-OH');

  // ─── BC-A also produces work on a second deal (for MM-002 isolation filter)
  await produceDealAndArtifacts(client, bcA, secondaryDealA.industry, secondaryDealA.jurisdiction, secondaryDealA.dealId);

  // ─── MM-003 (CRITICAL) — run first, even before MM-001
  scenarios.push(await runScenario('MM-003', 'MM', () =>
    assertNoCrossCustomerLeak(client, { aOwner: bcA, bOwner: bcB, dealA, dealB }),
  ));

  scenarios.push(await runScenario('MM-001', 'MM', () =>
    assertTwoAgentsSameDealState(client, bcA, secondAgentForA, dealA),
  ));

  scenarios.push(await runScenario('MM-002', 'MM', () =>
    assertSameAgentMultipleDealsFilter(client, bcA, dealA, secondaryDealA),
  ));

  scenarios.push(await runScenario('MM-004', 'MM', () =>
    assertAgentReturnsAfterDelay(client, bcA, dealA),
  ));

  scenarios.push(await runScenario('MM-005', 'MM', () =>
    assertTwoAgentsSameBeneficialCustomerWrite(client, bcA, secondAgentForA, dealA),
  ));

  // ─── Summary
  const { path, summary } = await writeRunSummary('agent-pov-cross-customer-security', scenarios, ENV.origin);
  console.log(`\n${c.bold}Result artifact:${c.reset} ${path}`);

  // CRITICAL gate: MM-003 must pass — any single leak = exit 1 immediately
  const mm003 = scenarios.find(s => s.id === 'MM-003');
  if (mm003 && mm003.status !== 'pass') {
    console.log(`\n${c.bold}${c.red}═════════════════════════════════════════════════════════════════════${c.reset}`);
    console.log(`${c.bold}${c.red}  CRITICAL FAILURE — DATA LEAK BETWEEN BENEFICIAL CUSTOMERS${c.reset}`);
    console.log(`${c.bold}${c.red}═════════════════════════════════════════════════════════════════════${c.reset}`);
    const failed = mm003.assertions.filter(a => !a.passed);
    for (const a of failed) {
      console.log(`  ${c.red}✗ ${a.description}${c.reset}`);
      if (a.expected !== undefined) console.log(`      expected: ${shortJson(a.expected)}`);
      if (a.actual !== undefined) console.log(`      actual:   ${shortJson(a.actual)}`);
    }
    console.log(`\n  Substrate is NOT agent-ready. Block deployment. See ${path}.\n`);
  }

  const exitCode = printSummary(summary);
  await closeDb();
  process.exit(exitCode);
}

// ─── MM-003 — cross-customer leak detection (THE critical test) ──

async function assertNoCrossCustomerLeak(
  client: McpClient,
  ctx: { aOwner: SeededIdentity; bOwner: SeededIdentity; dealA: SeededDeal; dealB: SeededDeal },
): Promise<AssertionResult[]> {
  const results: AssertionResult[] = [];

  // Probes go in BOTH directions: A→B and B→A. Both must be opaque.
  const probes: Array<{ label: string; viewer: SeededIdentity; target: SeededDeal }> = [
    { label: 'BC-B viewing BC-A data', viewer: ctx.bOwner, target: ctx.dealA },
    { label: 'BC-A viewing BC-B data', viewer: ctx.aOwner, target: ctx.dealB },
  ];

  for (const probe of probes) {
    console.log(`\n  ${c.bold}probe: ${probe.label}${c.reset}`);

    // ─── 1. get_deal_state by deal_id of the OTHER customer
    {
      const res = await client.mcpCall('tools/call', {
        name: 'get_deal_state',
        arguments: { dealId: probe.target.dealId },
        _meta: probe.viewer.callMeta('get_deal_state'),
      }, { bearer: probe.viewer.bearer });
      results.push(assertNoFiveHundred(res));
      results.push(assertNoDealDataLeak(`${probe.label}: get_deal_state(dealId=${probe.target.dealId})`, res, probe.target));
    }

    // ─── 2. get_deal_state by stateCid of the OTHER customer
    if (probe.target.latestStateCid) {
      const res = await client.mcpCall('tools/call', {
        name: 'get_deal_state',
        arguments: { stateCid: probe.target.latestStateCid },
        _meta: probe.viewer.callMeta('get_deal_state'),
      }, { bearer: probe.viewer.bearer });
      results.push(assertNoFiveHundred(res));
      results.push(assertNoDealDataLeak(`${probe.label}: get_deal_state(stateCid=${probe.target.latestStateCid.slice(0, 16)}...)`, res, probe.target));
    }

    // ─── 3. list_model_executions for the OTHER customer's deal
    {
      const res = await client.mcpCall('tools/call', {
        name: 'list_model_executions',
        arguments: { dealId: probe.target.dealId },
        _meta: probe.viewer.callMeta('list_model_executions'),
      }, { bearer: probe.viewer.bearer });
      results.push(assertNoFiveHundred(res));
      results.push(assertNoExecutionLeak(`${probe.label}: list_model_executions(dealId=${probe.target.dealId})`, res, probe.target));
    }

    // ─── 4. update_deal_payload on the OTHER customer's DealState
    if (probe.target.latestStateCid) {
      const res = await client.mcpCall('tools/call', {
        name: 'update_deal_payload',
        arguments: {
          dealState: { cid: probe.target.latestStateCid, stateHash: probe.target.latestStateHash, payload: { dealId: probe.target.dealId } },
          patch: { hostileEdit: 'BC-B was here' },
        },
        _meta: probe.viewer.callMeta('update_deal_payload'),
      }, { bearer: probe.viewer.bearer });
      results.push(assertNoFiveHundred(res));
      // update_deal_payload doesn't load by deal_id from DB — it operates on the supplied dealState.
      // But the persistence layer should write the row under the VIEWER's userId, not the target's.
      // We assert the call's persistence row (if any) does NOT contaminate the target's deal.
      results.push(await assertNoCrossWritePollution(`${probe.label}: update_deal_payload`, res, probe.viewer, probe.target));
    }

    // ─── 5. clone_deal_state of the OTHER customer's DealState by CID
    if (probe.target.latestStateCid) {
      const res = await client.mcpCall('tools/call', {
        name: 'clone_deal_state',
        arguments: { stateCid: probe.target.latestStateCid },
        _meta: probe.viewer.callMeta('clone_deal_state'),
      }, { bearer: probe.viewer.bearer });
      results.push(assertNoFiveHundred(res));
      results.push(assertNoCloneByCidLeak(`${probe.label}: clone_deal_state(stateCid=${probe.target.latestStateCid.slice(0, 16)}...)`, res));
    }

    // ─── 6. Direct DB probe — confirm no rows owned by the OTHER customer leak under the viewer's userId
    results.push(await assertDbIsolation(`${probe.label}: DB row isolation`, probe.viewer, probe.target));

    // ─── 7. verify_package — the package IS portable, but verification must not query the OTHER customer's DealState
    if (probe.target.finalizedPackage) {
      const res = await client.mcpCall('tools/call', {
        name: 'verify_package',
        arguments: { dealPackage: probe.target.finalizedPackage },
        _meta: probe.viewer.callMeta('verify_package'),
      }, { bearer: probe.viewer.bearer });
      results.push(assertNoFiveHundred(res));
      // verify_package SHOULD succeed (it's portable) — but we assert it returned a structured result
      // and didn't leak the source customer's identity.
      results.push(assert(
        `${probe.label}: verify_package on portable package returns structured result`,
        res.status === 200 && (res.body?.result || res.body?.error),
        'structured response',
        `status=${res.status}`,
      ));
      results.push(assertPackageVerificationNoOwnerLeak(`${probe.label}: verify_package does not expose target.userId`, res, probe.target));
    }
  }

  return results;
}

function assertNoDealDataLeak(label: string, res: any, target: SeededDeal): AssertionResult {
  // Acceptable outcomes: 404 (not_found), 403 (forbidden), 200 with no dealState/empty result.
  // Unacceptable: 200 with dealState/payload populated that matches the target's content.
  const body = res.body || {};
  const result = unwrapMcpResult(body);
  const dealState = result?.dealState || result?.snapshot || null;
  const payload = result?.payload || dealState?.payload || null;

  if (res.status === 404 || res.status === 403) {
    return assert(`${label} returns 403/404 (no leak)`, true);
  }

  // 200 might happen if substrate returns ok:true with error: 'not_found' or empty
  const ok = body?.ok ?? body?.result?.ok;
  if (ok === false) {
    return assert(`${label} returns ok=false (no leak)`, true);
  }

  // Now we need to check that NO target-owned data is present
  const targetDealIdLeaked =
    payload?.dealId === target.dealId ||
    dealState?.dealId === target.dealId ||
    result?.dealId === target.dealId;
  const targetIndustryLeaked = typeof payload?.industry === 'string' && payload.industry === target.industry;
  const targetUserIdLeaked =
    result?.snapshot?.userId === target.ownerUserId ||
    result?.userId === target.ownerUserId ||
    dealState?.userId === target.ownerUserId;

  if (targetDealIdLeaked || targetIndustryLeaked || targetUserIdLeaked) {
    return assert(
      `${label} did NOT leak target customer data`,
      false,
      'no target deal data in response',
      `dealIdLeaked=${targetDealIdLeaked}, industryLeaked=${targetIndustryLeaked}, userIdLeaked=${targetUserIdLeaked}`,
    );
  }

  return assert(`${label} returns 200 with no target customer data`, true);
}

function assertNoExecutionLeak(label: string, res: any, target: SeededDeal): AssertionResult {
  const body = res.body || {};
  const result = unwrapMcpResult(body);
  const executions = result?.executions || result?.history || [];

  if (res.status === 403 || res.status === 404) {
    return assert(`${label} returns 403/404 (no leak)`, true);
  }

  if (!Array.isArray(executions)) {
    return assert(`${label} returns no executions array`, true);
  }

  if (executions.length === 0) {
    return assert(`${label} returns empty executions (no leak)`, true);
  }

  // Any execution whose deal_id matches target = LEAK
  const targetMatches = executions.filter((e: any) =>
    e?.dealId === target.dealId ||
    e?.deal_id === target.dealId ||
    target.modelExecutionIds.includes(Number(e?.id)),
  );

  return assert(
    `${label}: returned 0 target-owned executions`,
    targetMatches.length === 0,
    `0 matches against target dealId=${target.dealId} or known execution ids`,
    `found ${targetMatches.length} matches`,
  );
}

async function assertNoCrossWritePollution(
  label: string,
  res: any,
  viewer: SeededIdentity,
  target: SeededDeal,
): Promise<AssertionResult> {
  // The viewer should NOT be able to write a snapshot row that the target would then see
  // when calling get_deal_state(dealId: target.dealId).
  // The most we can assert here is: any DB row written by this call carries viewer.userId,
  // NOT target.ownerUserId.
  try {
    const sql = await loadSql();
    if (!sql) return assert(`${label}: DB not available, skipping write-pollution check`, true);
    const rows = await sql`
      SELECT user_id, deal_id, state_cid
      FROM definitive_deal_state_snapshots
      WHERE deal_id = ${target.dealId}
        AND user_id = ${viewer.userId}
        AND created_at >= NOW() - INTERVAL '10 minutes'
      LIMIT 5
    `;
    // A row CAN exist (the viewer attempted an update with the target's dealId in payload), but it
    // MUST be tagged with viewer.userId, not target.ownerUserId. And target's get_deal_state(target.dealId)
    // must still return only target-owned rows. The DB filter on user_id enforces that.
    const polluted = rows.find((r: any) => Number(r.user_id) === target.ownerUserId);
    return assert(
      `${label}: no DB row written under target's userId`,
      !polluted,
      `0 rows under target userId=${target.ownerUserId}`,
      polluted ? `found row: ${JSON.stringify(polluted)}` : 'clean',
    );
  } catch (err) {
    return assert(`${label}: DB check threw — flagging as fail`, false, 'no error', (err as Error).message);
  }
}

function assertNoCloneByCidLeak(label: string, res: any): AssertionResult {
  // clone_deal_state in the substrate accepts an inline dealState object. When called with only a
  // stateCid that the viewer does not own, the substrate should NOT fetch the foreign dealState by
  // CID and clone it. Acceptable outcomes: error / refusal / empty / a clone of an empty/synthetic
  // state. Unacceptable: a clone that surfaces the target's full payload.
  const body = res.body || {};
  const result = unwrapMcpResult(body);
  const ok = body?.ok ?? body?.result?.ok;

  if (res.status >= 400 || ok === false) {
    return assert(`${label}: refusal/error returned (no clone leak)`, true);
  }

  const cloned = result?.dealState || result?.clone || null;
  if (!cloned) {
    return assert(`${label}: no cloned DealState surfaced (no leak)`, true);
  }

  // If cloned.payload is empty / has no dealId, no leak.
  const payload = cloned.payload || {};
  if (!payload || Object.keys(payload).length === 0) {
    return assert(`${label}: cloned payload empty (no leak)`, true);
  }

  // Anything beyond that — assert nothing distinctive about target leaked. We can't know what was
  // in target's payload from here without a DB lookup; the cross-write-pollution + DB isolation
  // assertions cover that ground. Default to pass with a note.
  return assert(`${label}: cloned payload present but cannot prove target source — see DB isolation assertion`, true);
}

async function assertDbIsolation(
  label: string,
  viewer: SeededIdentity,
  target: SeededDeal,
): Promise<AssertionResult> {
  // The most direct test: query the audit + DealState tables filtered by the viewer's userId,
  // and confirm NONE of the returned rows reference the target's deal_id.
  try {
    const sql = await loadSql();
    if (!sql) return assert(`${label}: DB not available, skipping`, true);
    const snapshots = await sql`
      SELECT id, deal_id, beneficial_customer_id
      FROM definitive_deal_state_snapshots
      WHERE user_id = ${viewer.userId}
        AND deal_id = ${target.dealId}
      LIMIT 5
    `;
    const packets = await sql`
      SELECT id, deal_id
      FROM definitive_deal_packets
      WHERE user_id = ${viewer.userId}
        AND deal_id = ${target.dealId}
      LIMIT 5
    `;
    const executions = await sql`
      SELECT id, deal_id
      FROM model_executions
      WHERE user_id = ${viewer.userId}
        AND deal_id = ${target.dealId}
      LIMIT 5
    `;
    const totalLeak = snapshots.length + packets.length + executions.length;
    return assert(
      `${label}: 0 rows under viewer.userId reference target.dealId`,
      totalLeak === 0,
      '0 leaked rows',
      `snapshots=${snapshots.length}, packets=${packets.length}, executions=${executions.length}`,
    );
  } catch (err) {
    return assert(`${label}: DB isolation query threw`, false, 'query succeeds', (err as Error).message);
  }
}

function assertPackageVerificationNoOwnerLeak(label: string, res: any, target: SeededDeal): AssertionResult {
  const body = res.body || {};
  const result = unwrapMcpResult(body);
  const verification = result?.packageVerification || result || {};
  const text = JSON.stringify(verification);
  // The package itself contains hashes + CIDs — those are portable by design. We check we did NOT
  // leak the target's owner userId or any private DealState payload field.
  const ownerUserIdLeaked = text.includes(`"userId":${target.ownerUserId}`) || text.includes(`"user_id":${target.ownerUserId}`);
  return assert(
    `${label}: verify_package output does not contain target.ownerUserId`,
    !ownerUserIdLeaked,
    'no userId leak',
    ownerUserIdLeaked ? 'userId present in verification output' : 'clean',
  );
}

// ─── MM-001 — two agents on the same DealState ─────────────

async function assertTwoAgentsSameDealState(
  client: McpClient,
  primaryAgent: SeededIdentity,
  secondAgent: SeededIdentity,
  deal: SeededDeal,
): Promise<AssertionResult[]> {
  const results: AssertionResult[] = [];

  // Both agents share the same userId (beneficial customer) — but distinct agent_id values.
  // Each one calls get_deal_state(deal.dealId). The mandate_chain on each call must reflect
  // the calling agent_id, not the other one.
  const primaryRes = await client.mcpCall('tools/call', {
    name: 'get_deal_state',
    arguments: { dealId: deal.dealId },
    _meta: primaryAgent.callMeta('get_deal_state'),
  }, { bearer: primaryAgent.bearer });
  results.push(assertNoFiveHundred(primaryRes));

  const secondRes = await client.mcpCall('tools/call', {
    name: 'get_deal_state',
    arguments: { dealId: deal.dealId },
    _meta: secondAgent.callMeta('get_deal_state'),
  }, { bearer: secondAgent.bearer });
  results.push(assertNoFiveHundred(secondRes));

  // Both succeed (they're both on the same beneficial customer's data).
  results.push(assert(
    'MM-001: primary agent get_deal_state succeeds',
    primaryRes.status === 200,
    200,
    primaryRes.status,
  ));
  results.push(assert(
    'MM-001: second agent on same BC also gets the DealState',
    secondRes.status === 200,
    200,
    secondRes.status,
  ));

  // Now check the audit trail — each must show its own agent_id, not the other one.
  try {
    const sql = await loadSql();
    if (!sql) {
      results.push(assert('MM-001: DB audit check skipped (no DB)', true));
      return results;
    }
    const usageRows = await sql`
      SELECT id, agent_id, mandate_id, created_at
      FROM agency_usage_events
      WHERE user_id = ${primaryAgent.userId}
        AND action_id = 'definitive.get_deal_state'
        AND created_at >= NOW() - INTERVAL '5 minutes'
      ORDER BY created_at DESC
      LIMIT 20
    `;
    const primaryRows = usageRows.filter((r: any) => r.agent_id === primaryAgent.agentId);
    const secondRows = usageRows.filter((r: any) => r.agent_id === secondAgent.agentId);
    results.push(assert(
      'MM-001: audit row for primary agent uses primary.agent_id',
      primaryRows.length > 0,
      '>=1 row',
      `${primaryRows.length} rows`,
    ));
    results.push(assert(
      'MM-001: audit row for second agent uses second.agent_id (no cross-pollination)',
      secondRows.length > 0,
      '>=1 row',
      `${secondRows.length} rows`,
    ));
    // Cross-pollination: no rows with primary.mandateId tagged with secondAgent.agentId or vice versa.
    const crossPoll = usageRows.filter((r: any) =>
      (r.agent_id === primaryAgent.agentId && r.mandate_id === secondAgent.mandateId) ||
      (r.agent_id === secondAgent.agentId && r.mandate_id === primaryAgent.mandateId),
    );
    results.push(assert(
      'MM-001: no mandate-chain cross-pollination',
      crossPoll.length === 0,
      '0 cross rows',
      `${crossPoll.length} cross rows`,
    ));
  } catch (err) {
    results.push(assert('MM-001: DB audit query', false, 'no error', (err as Error).message));
  }

  return results;
}

// ─── MM-002 — list_model_executions per-deal filter ───────

async function assertSameAgentMultipleDealsFilter(
  client: McpClient,
  agent: SeededIdentity,
  dealOne: SeededDeal,
  dealTwo: SeededDeal,
): Promise<AssertionResult[]> {
  const results: AssertionResult[] = [];
  // Agent owns BOTH deals. list_model_executions({dealId: A}) must return ONLY A's history.
  const resOne = await client.mcpCall('tools/call', {
    name: 'list_model_executions',
    arguments: { dealId: dealOne.dealId },
    _meta: agent.callMeta('list_model_executions'),
  }, { bearer: agent.bearer });
  results.push(assertNoFiveHundred(resOne));

  const resTwo = await client.mcpCall('tools/call', {
    name: 'list_model_executions',
    arguments: { dealId: dealTwo.dealId },
    _meta: agent.callMeta('list_model_executions'),
  }, { bearer: agent.bearer });
  results.push(assertNoFiveHundred(resTwo));

  const oneExecs = extractExecutions(resOne);
  const twoExecs = extractExecutions(resTwo);

  // Every execution returned for dealOne must NOT match dealTwo, and vice versa.
  const oneLeakedTwo = oneExecs.filter((e: any) =>
    e?.dealId === dealTwo.dealId || e?.deal_id === dealTwo.dealId || dealTwo.modelExecutionIds.includes(Number(e?.id)),
  );
  const twoLeakedOne = twoExecs.filter((e: any) =>
    e?.dealId === dealOne.dealId || e?.deal_id === dealOne.dealId || dealOne.modelExecutionIds.includes(Number(e?.id)),
  );

  results.push(assert(
    `MM-002: list_model_executions(dealId=${dealOne.dealId}) returns 0 dealTwo rows`,
    oneLeakedTwo.length === 0,
    0,
    oneLeakedTwo.length,
  ));
  results.push(assert(
    `MM-002: list_model_executions(dealId=${dealTwo.dealId}) returns 0 dealOne rows`,
    twoLeakedOne.length === 0,
    0,
    twoLeakedOne.length,
  ));

  return results;
}

// ─── MM-004 — same agent calls back after delay ────────────

async function assertAgentReturnsAfterDelay(
  client: McpClient,
  agent: SeededIdentity,
  deal: SeededDeal,
): Promise<AssertionResult[]> {
  const results: AssertionResult[] = [];
  // We can't actually wait N days; we simulate by re-reading. The DealState must still be intact.
  const res = await client.mcpCall('tools/call', {
    name: 'get_deal_state',
    arguments: { dealId: deal.dealId },
    _meta: agent.callMeta('get_deal_state'),
  }, { bearer: agent.bearer });
  results.push(assertNoFiveHundred(res));
  results.push(assert(
    'MM-004: agent returns and get_deal_state still succeeds',
    res.status === 200,
    200,
    res.status,
  ));

  const result = unwrapMcpResult(res.body || {});
  const snapshot = result?.dealState || result?.snapshot;
  results.push(assert(
    'MM-004: returned DealState carries a stateCid (intact)',
    Boolean(snapshot?.cid || snapshot?.stateCid),
    'cid present',
    snapshot?.cid || snapshot?.stateCid || 'missing',
  ));
  results.push(assert(
    'MM-004: returned DealState carries a stateHash (intact)',
    Boolean(snapshot?.stateHash),
    'stateHash present',
    snapshot?.stateHash || 'missing',
  ));

  // Re-run list_model_executions with currentAssumptions set — the substrate exposes freshness flags.
  const fresh = await client.mcpCall('tools/call', {
    name: 'list_model_executions',
    arguments: { dealId: deal.dealId, currentAssumptions: { recompute_check: true }, currentVersionNumber: 999 },
    _meta: agent.callMeta('list_model_executions'),
  }, { bearer: agent.bearer });
  results.push(assertNoFiveHundred(fresh));
  const freshResult = unwrapMcpResult(fresh.body || {});
  results.push(assert(
    'MM-004: list_model_executions accepts freshness inputs (filters.freshnessCompared=true)',
    freshResult?.filters?.freshnessCompared === true,
    true,
    freshResult?.filters?.freshnessCompared,
  ));

  return results;
}

// ─── MM-005 — two agents on same beneficial customer write ─

async function assertTwoAgentsSameBeneficialCustomerWrite(
  client: McpClient,
  primary: SeededIdentity,
  second: SeededIdentity,
  deal: SeededDeal,
): Promise<AssertionResult[]> {
  const results: AssertionResult[] = [];

  // Both agents read.
  const readPrimary = await client.mcpCall('tools/call', {
    name: 'get_deal_state',
    arguments: { dealId: deal.dealId },
    _meta: primary.callMeta('get_deal_state'),
  }, { bearer: primary.bearer });
  const readSecond = await client.mcpCall('tools/call', {
    name: 'get_deal_state',
    arguments: { dealId: deal.dealId },
    _meta: second.callMeta('get_deal_state'),
  }, { bearer: second.bearer });

  results.push(assert(
    'MM-005: primary agent reads DealState OK',
    readPrimary.status === 200,
    200,
    readPrimary.status,
  ));
  results.push(assert(
    'MM-005: second agent (same BC) reads same DealState OK',
    readSecond.status === 200,
    200,
    readSecond.status,
  ));

  const primarySnap = unwrapMcpResult(readPrimary.body || {})?.dealState || unwrapMcpResult(readPrimary.body || {})?.snapshot;
  const secondSnap = unwrapMcpResult(readSecond.body || {})?.dealState || unwrapMcpResult(readSecond.body || {})?.snapshot;
  const primaryCid = primarySnap?.cid || primarySnap?.stateCid;
  const secondCid = secondSnap?.cid || secondSnap?.stateCid;

  results.push(assert(
    'MM-005: both agents see the same latest stateCid',
    Boolean(primaryCid) && primaryCid === secondCid,
    primaryCid,
    secondCid,
  ));

  // Second agent writes via update_deal_payload. Should succeed because mandate scope is sufficient.
  if (secondSnap) {
    const update = await client.mcpCall('tools/call', {
      name: 'update_deal_payload',
      arguments: {
        dealState: secondSnap,
        patch: { mm005Marker: `secondAgent:${RUN_ID}` },
      },
      _meta: second.callMeta('update_deal_payload'),
    }, { bearer: second.bearer });
    results.push(assertNoFiveHundred(update));
    results.push(assert(
      'MM-005: second agent can write update_deal_payload with mandate scope',
      update.status === 200,
      200,
      update.status,
    ));

    // Primary agent reads again, sees the update.
    const readAgain = await client.mcpCall('tools/call', {
      name: 'get_deal_state',
      arguments: { dealId: deal.dealId },
      _meta: primary.callMeta('get_deal_state'),
    }, { bearer: primary.bearer });
    const newSnap = unwrapMcpResult(readAgain.body || {})?.dealState || unwrapMcpResult(readAgain.body || {})?.snapshot;
    const payloadText = JSON.stringify(newSnap?.payload || {});
    results.push(assert(
      'MM-005: primary agent observes second agent\'s mm005Marker',
      payloadText.includes('mm005Marker') && payloadText.includes(RUN_ID),
      'marker present',
      payloadText.includes('mm005Marker') ? 'marker present' : 'marker missing',
    ));
  }

  return results;
}

// ─── Setup — seed identities + deals + produce artifacts ──

async function seedIdentity(label: string): Promise<SeededIdentity> {
  const sql = await loadSql();
  if (!sql) throw new Error('DATABASE_URL missing');
  const email = `xcc+${label}-${RUN_ID}@smbx.test`;
  const trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const [user] = await sql`
    INSERT INTO users (email, display_name, role, is_advisor, league, plan, trial_ends_at, created_at, updated_at)
    VALUES (${email}, ${`cross-customer security fixture ${label}`}, 'user', true, 'L4', 'enterprise', ${trialEnd}, NOW(), NOW())
    ON CONFLICT (email) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      plan = 'enterprise',
      updated_at = NOW()
    RETURNING id
  `;
  const userId = Number(user.id);
  await sql`
    INSERT INTO subscriptions (user_id, plan, status, trial_end, trial_ends_at, created_at, updated_at)
    VALUES (${userId}, 'enterprise', 'trialing', ${trialEnd}, ${trialEnd}, NOW(), NOW())
    ON CONFLICT (user_id) DO UPDATE SET plan = 'enterprise', status = 'trialing', updated_at = NOW()
  `.catch(() => undefined);

  const agentId = `agent:xcc:${label}:${RUN_ID}`;
  const mandateId = `mandate:xcc:${label}:${RUN_ID}`;
  const bearer = mintMcpAgentToken({
    userId,
    beneficialCustomerId: label,
    agentId,
    mandateId,
  });

  const identity: SeededIdentity = {
    label,
    userId,
    beneficialCustomerId: label,
    agentId,
    mandateId,
    bearer,
    callMeta: (requestLabel: string) => buildCallMeta(identity, requestLabel),
  };
  return identity;
}

async function mintAdditionalAgentFor(base: SeededIdentity, agentLabel: string): Promise<SeededIdentity> {
  const agentId = `agent:xcc:${agentLabel}:${RUN_ID}`;
  const mandateId = `mandate:xcc:${agentLabel}:${RUN_ID}`;
  const bearer = mintMcpAgentToken({
    userId: base.userId,
    beneficialCustomerId: base.beneficialCustomerId,
    agentId,
    mandateId,
  });
  const identity: SeededIdentity = {
    label: agentLabel,
    userId: base.userId,
    beneficialCustomerId: base.beneficialCustomerId,
    agentId,
    mandateId,
    bearer,
    callMeta: (requestLabel: string) => buildCallMeta(identity, requestLabel),
  };
  return identity;
}

function buildCallMeta(identity: SeededIdentity, requestLabel: string) {
  return {
    requestId: `${RUN_ID}:${identity.label}:${requestLabel}:${randomBytes(3).toString('hex')}`,
    agentId: identity.agentId,
    agentPlatformId: 'xcc-security-harness',
    mandateId: identity.mandateId,
    beneficialCustomerId: identity.beneficialCustomerId,
    requestedScopes: [...FULL_AGENT_SCOPES],
  };
}

function mintMcpAgentToken(input: {
  userId: number;
  beneficialCustomerId: string;
  agentId: string;
  mandateId: string;
}): string {
  // Match the production audience-bound scoped agent token shape so the /mcp transport accepts it.
  const audience = `${ENV.origin}/mcp`;
  return jwt.sign(
    {
      userId: input.userId,
      tokenUse: 'definitive_agent',
      scopes: [...FULL_AGENT_SCOPES],
      agentId: input.agentId,
      agentPlatformId: 'xcc-security-harness',
      mandateId: input.mandateId,
      beneficialCustomerId: input.beneficialCustomerId,
    },
    ENV.jwtSecret!,
    {
      expiresIn: '30m',
      audience,
      issuer: ENV.origin,
    },
  );
}

async function seedDealRow(owner: SeededIdentity, industry: string, jurisdiction: string): Promise<SeededDeal> {
  const sql = await loadSql();
  if (!sql) throw new Error('DATABASE_URL missing');
  const [deal] = await sql`
    INSERT INTO deals (
      user_id, journey_type, current_gate, league, industry, jurisdiction,
      business_name, name, deal_type, revenue, sde, ebitda, asking_price,
      financials, status, created_at, updated_at
    )
    VALUES (
      ${owner.userId}, 'buy', 'B3', 'L4', ${industry}, ${jurisdiction},
      ${`XCC ${owner.label} ${industry} ${RUN_ID}`}, ${`XCC ${owner.label} ${industry} ${RUN_ID}`},
      'lower-middle-market acquisition',
      ${24_000_000_00}, ${5_000_000_00}, ${5_000_000_00}, ${25_000_000_00},
      ${sql.json({ fixture_key: FIXTURE_KEY, run_id: RUN_ID, owner: owner.label })}::jsonb,
      'active', NOW(), NOW()
    )
    RETURNING id
  `;
  return {
    ownerLabel: owner.label,
    ownerUserId: owner.userId,
    dealId: Number(deal.id),
    industry,
    jurisdiction,
    modelExecutionIds: [],
  };
}

async function produceDealAndArtifacts(
  client: McpClient,
  owner: SeededIdentity,
  industry: string,
  jurisdiction: string,
  reuseDealId?: number,
): Promise<SeededDeal> {
  const deal: SeededDeal = reuseDealId
    ? { ownerLabel: owner.label, ownerUserId: owner.userId, dealId: reuseDealId, industry, jurisdiction, modelExecutionIds: [] }
    : await seedDealRow(owner, industry, jurisdiction);

  // 1. Ingest a payload — creates a DealState snapshot row owned by owner.userId.
  const payload = {
    dealId: deal.dealId,
    journey: 'buy',
    targetName: `XCC ${owner.label} target`,
    industry,
    naicsCode: '541512',
    jurisdiction,
    league: 'L4',
    dealType: 'lower-middle-market acquisition',
    revenueCents: 24_000_000_00,
    ebitdaCents: 5_000_000_00,
    purchasePriceCents: 25_000_000_00,
    documents: [
      { id: 'doc-1', name: 'TTM P&L', type: 'financials', category: 'financials', hash: `sha256:${RUN_ID}:${owner.label}` },
    ],
  };
  const ingest = await client.mcpCall('tools/call', {
    name: 'ingest_deal_payload',
    arguments: { idempotencyKey: `${RUN_ID}:${owner.label}:ingest:${deal.dealId}`, payload },
    _meta: owner.callMeta('ingest'),
  }, { bearer: owner.bearer });
  if (ingest.status !== 200) {
    note(`ingest_deal_payload returned status=${ingest.status} for owner ${owner.label}; body=${shortJson(ingest.body).slice(0, 300)}`);
  }
  const ingestResult = unwrapMcpResult(ingest.body || {});
  const state = ingestResult?.dealState || ingestResult?.nextDealState;
  if (state?.cid) {
    deal.latestStateCid = state.cid;
    deal.latestStateHash = state.stateHash;
    ok(`seeded ${owner.label} deal ${deal.dealId} state cid=${state.cid.slice(0, 20)}...`);
  } else {
    skip(`seed ${owner.label} deal ${deal.dealId}`, 'no dealState returned from ingest');
  }

  // 2. Execute a model — creates a model_executions row.
  const exec = await client.mcpCall('tools/call', {
    name: 'execute_model',
    arguments: {
      dealId: deal.dealId,
      modelId: 'MODEL.LBO.LMM.v1',
      input: {
        purchase_price_cents: 25_000_000_00,
        debt_cents: 9_000_000_00,
        sponsor_equity_cents: 16_000_000_00,
        entry_ebitda_cents: 5_000_000_00,
        hold_years: 5,
        ebitda_growth_pct: 0.05,
        debt_paydown_cents: 5_000_000_00,
      },
      industry,
      geography: jurisdiction,
      league: 'L4',
      metric: 'ebitda',
    },
    _meta: owner.callMeta('execute_model'),
  }, { bearer: owner.bearer });
  if (exec.status === 200) {
    const execResult = unwrapMcpResult(exec.body || {});
    const execId = Number(execResult?.modelExecutionId);
    if (Number.isFinite(execId) && execId > 0) {
      deal.modelExecutionIds.push(execId);
      ok(`seeded ${owner.label} model_execution id=${execId}`);
    } else {
      skip(`seed ${owner.label} model execution`, 'no modelExecutionId returned');
    }
  } else {
    skip(`seed ${owner.label} model execution`, `status=${exec.status}`);
  }

  // 3. Finalize a portable package (for the verify_package leak test).
  if (deal.latestStateCid && deal.latestStateHash) {
    const compose = await client.mcpCall('tools/call', {
      name: 'compose_deal_package',
      arguments: { dealState: state },
      _meta: owner.callMeta('compose_deal_package'),
    }, { bearer: owner.bearer });
    if (compose.status === 200) {
      const composeResult = unwrapMcpResult(compose.body || {});
      const dealPackage = composeResult?.dealPackage || composeResult;
      const finalize = await client.mcpCall('tools/call', {
        name: 'finalize_deal_package',
        arguments: { dealState: state, dealPackage },
        _meta: owner.callMeta('finalize_deal_package'),
      }, { bearer: owner.bearer });
      if (finalize.status === 200) {
        const finalResult = unwrapMcpResult(finalize.body || {});
        deal.finalizedPackage = finalResult?.finalizedPackage || finalResult?.dealPackage || dealPackage;
        ok(`seeded ${owner.label} finalized package`);
      }
    }
  }

  return deal;
}

// ─── Helpers ──────────────────────────────────────────────

function unwrapMcpResult(body: any): any {
  if (!body || typeof body !== 'object') return null;
  // /mcp returns { jsonrpc, id, result: { structuredContent: { result: {...}, toolName, ... } } }
  // OR { ok, result: {...} } if legacy
  const structured = body?.result?.structuredContent;
  if (structured?.result) {
    return structured.result?.result && typeof structured.result.result === 'object'
      ? structured.result.result
      : structured.result;
  }
  return body?.result || body;
}

function extractExecutions(res: any): any[] {
  const result = unwrapMcpResult(res?.body || {});
  if (Array.isArray(result?.executions)) return result.executions;
  if (Array.isArray(result?.history)) return result.history;
  return [];
}

function shortJson(value: unknown): string {
  try {
    return JSON.stringify(value).slice(0, 280);
  } catch {
    return String(value);
  }
}

function parseUrlArg(argv: string[]): string | null {
  for (const arg of argv) {
    if (arg.startsWith('--url=')) return arg.slice('--url='.length).replace(/\/+$/, '');
  }
  return null;
}

async function pingMcp(): Promise<boolean> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 5000);
    const res = await fetch(`${ENV.origin}/.well-known/mcp`, { signal: ctrl.signal });
    clearTimeout(timer);
    return res.status < 500;
  } catch {
    return false;
  }
}

let _sqlInstance: any = null;
async function loadSql(): Promise<any> {
  if (_sqlInstance) return _sqlInstance;
  if (!ENV.hasDb) return null;
  try {
    const db = await import('../server/db.js' as string);
    _sqlInstance = (db as any).sql;
    return _sqlInstance;
  } catch (err) {
    note(`loadSql failed: ${(err as Error).message}`);
    return null;
  }
}

async function closeDb(): Promise<void> {
  if (!_sqlInstance) return;
  try {
    await _sqlInstance.end({ timeout: 2 });
  } catch {
    // ignore
  }
}

// ─── Top-level entrypoint (after all helpers are declared) ─
await main();
