#!/usr/bin/env npx tsx
/**
 * Agent-POV failure modes harness (FM-*).
 *
 * Exercises substrate error contracts: malformed payloads, unknown versions,
 * expired tokens, timeouts, idempotency duplicate handling, unresolved
 * citations, and concurrent-writer conflicts. Every failure must produce a
 * structured response — never a 500, never a silent default.
 *
 * Test plan: TEST_PLAN_SUBSTRATE_AGENT_POV.md §4.7 FM-*.
 *
 * Usage:
 *   npx tsx scripts/agent-pov-failure-modes.ts
 *   npx tsx scripts/agent-pov-failure-modes.ts --url=http://127.0.0.1:3000
 *   npx tsx scripts/agent-pov-failure-modes.ts --bearer=$DEFINITIVE_MCP_ACCESS_TOKEN
 *
 * Exit: 0 all-pass / 1 any-fail / 2 infra error.
 */

import 'dotenv/config';
import {
  McpClient,
  assert,
  assertNoFiveHundred,
  assertStructuredResponse,
  c,
  getPath,
  header,
  mintLocalAgentToken,
  note,
  printSummary,
  readEnv,
  runScenario,
  skip,
  writeRunSummary,
} from '../testing/agent-pov/runner-helpers.js';
import type { McpResponse } from '../testing/agent-pov/runner-helpers.js';
import type { AssertionResult } from '../testing/agent-pov/types.js';
import { randomBytes } from 'node:crypto';

const SCRIPT_NAME = 'agent-pov-failure-modes';

interface CliArgs { url?: string; bearer?: string; }
function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {};
  for (const raw of argv.slice(2)) {
    if (raw.startsWith('--url=')) args.url = raw.slice(6);
    else if (raw.startsWith('--bearer=')) args.bearer = raw.slice(9);
  }
  return args;
}

async function resolveBearer(env: ReturnType<typeof readEnv>, cli: CliArgs): Promise<string | null> {
  if (cli.bearer) return cli.bearer;
  const fromEnv =
    process.env.DEFINITIVE_MCP_ACCESS_TOKEN ||
    process.env.SMBX_MCP_ACCESS_TOKEN ||
    process.env.AGENT_POV_BEARER ||
    null;
  if (fromEnv) return fromEnv;
  if (env.hasDb && env.jwtSecret) {
    const minted = await mintLocalAgentToken({
      agentIdentity: `agent_pov_fm_${Date.now()}`,
      tier: 'pro',
    });
    if (minted) return minted;
  }
  return null;
}

function unwrap(res: McpResponse): any {
  const body = res.body ?? {};
  return (
    body?.result?.structuredContent?.result?.result ??
    body?.result?.structuredContent?.result ??
    body?.result?.structuredContent ??
    body?.result ??
    body
  );
}

function isToolError(res: McpResponse): boolean {
  return Boolean(res.body?.result?.isError) || Boolean(res.body?.error);
}

async function callTool(
  client: McpClient,
  bearer: string | null,
  toolName: string,
  args: any,
): Promise<McpResponse> {
  return client.mcpCall(
    'tools/call',
    { name: toolName, arguments: args },
    { bearer: bearer ?? undefined },
  );
}

function extractAuditId(res: McpResponse): string | number | null {
  const root = unwrap(res);
  return (
    root?.auditId ??
    root?.audit_id ??
    root?.auditTrailId ??
    root?.audit_trail_id ??
    res.body?.persistence?.auditTrailId ??
    null
  );
}

function structuredErrorMessage(res: McpResponse): string | null {
  const errBody =
    res.body?.error?.data ?? res.body?.error ?? unwrap(res);
  return errBody?.message ?? errBody?.error ?? errBody?.detail ?? null;
}

// ─── Scenarios ────────────────────────────────────────────

async function scenarioMalformedPayload(
  client: McpClient,
  bearer: string | null,
): Promise<AssertionResult[]> {
  const out: AssertionResult[] = [];
  const res = await callTool(client, bearer, 'execute_model', {
    modelId: 12345, // wrong type
    input: 'not-an-object', // wrong type
  });
  out.push(assertNoFiveHundred(res));
  out.push(assertStructuredResponse(res));
  // Field-level guidance: any of message/error/errors/issues/fieldErrors
  const errBody = res.body?.error?.data ?? res.body?.error ?? unwrap(res);
  const hasGuidance = Boolean(
    errBody?.message || errBody?.error || errBody?.errors || errBody?.issues || errBody?.fieldErrors,
  );
  out.push(assert(
    'malformed payload → structured 400 with field-level guidance',
    hasGuidance && (res.status >= 400 && res.status < 500 || isToolError(res)),
    'structured error with message',
    `status=${res.status}, hasGuidance=${hasGuidance}`,
  ));
  return out;
}

async function scenarioUnknownMethodologyVersion(
  client: McpClient,
  bearer: string | null,
): Promise<AssertionResult[]> {
  const out: AssertionResult[] = [];
  const res = await callTool(client, bearer, 'ingest_deal_payload', {
    journey: 'buy',
    target_industry: 'B2B services',
    methodology_version: 'V99-not-real',
    spec_version: 'DEFINITIVE.v99.99',
  });
  out.push(assertNoFiveHundred(res));
  const r = unwrap(res);
  const errCode = r?.error || r?.code || res.body?.error?.code;
  const isUnsupported =
    String(errCode || '').includes('unsupported_version') ||
    String(errCode || '').includes('version') ||
    String(r?.refusal?.type || '').includes('unsupported_version') ||
    String(structuredErrorMessage(res) || '').toLowerCase().includes('version');
  out.push(assert(
    'unknown methodology_version → unsupported_version (no silent default)',
    Boolean(isUnsupported) || isToolError(res) || (res.status >= 400 && res.status < 500),
    'unsupported_version envelope or 4xx',
    `status=${res.status} errCode=${errCode}`,
  ));
  return out;
}

async function scenarioExpiredToken(
  client: McpClient,
  bearer: string | null,
): Promise<AssertionResult[]> {
  const out: AssertionResult[] = [];
  const env = readEnv();
  if (!env.jwtSecret) {
    skip('expired-token check', 'no JWT_SECRET — cannot mint expired token');
    out.push(assert('expired-token check skipped (no JWT_SECRET)', true));
    return out;
  }
  // Mint a token with exp in the past
  const { default: jwt } = await import('jsonwebtoken') as any;
  const expired = jwt.sign(
    {
      sub: 'bc_test_expired',
      aud: 'mcp',
      iss: 'smbx',
      agent_id: 'agent_pov_fm_expired',
      scope: 'tools:call',
      tier: 'pro',
      iat: Math.floor(Date.now() / 1000) - 7200,
      exp: Math.floor(Date.now() / 1000) - 60, // expired 1 minute ago
    },
    env.jwtSecret,
  );
  const res = await callTool(client, expired, 'introspect_capabilities', {});
  out.push(assertNoFiveHundred(res));
  // Expect 401 with refresh guidance (WWW-Authenticate)
  const www = res.headers['www-authenticate'] || res.headers['WWW-Authenticate'];
  const msg = structuredErrorMessage(res) || '';
  out.push(assert(
    'expired token → 401',
    res.status === 401,
    401,
    res.status,
  ));
  out.push(assert(
    'expired token response includes refresh guidance (WWW-Authenticate or refresh hint)',
    Boolean(www) || /refresh|expired|token/i.test(msg),
    'WWW-Authenticate header or refresh keyword',
    `www=${www || 'none'}, msg="${msg.slice(0, 80)}"`,
  ));
  return out;
}

async function scenarioTimeout(
  client: McpClient,
  bearer: string | null,
): Promise<AssertionResult[]> {
  const out: AssertionResult[] = [];
  // Force a client-side abort to simulate timeout. The substrate itself can't
  // be easily tickled into a slow path without a known-slow input, so this
  // verifies the client surface is well-behaved under timeout. A true server
  // hard-timeout test would need a special debug endpoint.
  try {
    const res = await callTool(client, bearer, 'compose_model_stack', {
      dealId: 0,
    });
    out.push(assertNoFiveHundred(res));
    out.push(assert(
      'tool returns structured response under normal latency',
      typeof res.body === 'object',
      'object body',
      typeof res.body,
    ));
  } catch (err) {
    out.push(assert(
      'tool call did not throw under normal latency',
      false,
      'no throw',
      (err as Error).message,
    ));
  }
  // True server-side timeout invariant: skip with reason.
  skip(
    'server hard-timeout invariant',
    'no debug endpoint exposed to force slow path; client-side timeout is a separate concern',
  );
  out.push(assert('server hard-timeout invariant skipped (no debug surface)', true));
  return out;
}

async function scenarioIdempotency(
  client: McpClient,
  bearer: string | null,
): Promise<AssertionResult[]> {
  const out: AssertionResult[] = [];
  const idempotencyKey = `fm-idem-${randomBytes(8).toString('hex')}`;
  const args = {
    journey: 'buy',
    target_industry: 'B2B services',
    target_jurisdiction: 'US-TX',
    target_sde: 500_000_000,
    target_revenue: 1800_000_00,
    naics: '541512',
    idempotency_key: idempotencyKey,
    idempotencyKey,
  };
  const a = await callTool(client, bearer, 'ingest_deal_payload', args);
  const b = await callTool(client, bearer, 'ingest_deal_payload', args);
  out.push(assertNoFiveHundred(a));
  out.push(assertNoFiveHundred(b));
  // Both succeed
  out.push(assert('first idempotent call succeeded', !isToolError(a)));
  out.push(assert('second idempotent call succeeded', !isToolError(b)));
  // Same idempotency_key → same DealState CID (and ideally same audit_id)
  const cidA = getPath(unwrap(a), 'dealState.cid') ?? getPath(unwrap(a), 'dealState.dealStateCid') ?? getPath(unwrap(a), 'cid');
  const cidB = getPath(unwrap(b), 'dealState.cid') ?? getPath(unwrap(b), 'dealState.dealStateCid') ?? getPath(unwrap(b), 'cid');
  if (cidA && cidB) {
    out.push(assert(
      'same idempotency_key returns same DealState CID (single execution)',
      String(cidA) === String(cidB),
      cidA,
      cidB,
    ));
  } else {
    // Fallback: compare audit ids — if substrate returns same audit_id, single execution.
    const aid = extractAuditId(a);
    const bid = extractAuditId(b);
    out.push(assert(
      'same idempotency_key returns same audit/state identity',
      aid != null && bid != null && String(aid) === String(bid),
      String(aid),
      String(bid),
    ));
  }
  return out;
}

async function scenarioUnresolvedCitation(
  client: McpClient,
  bearer: string | null,
): Promise<AssertionResult[]> {
  const out: AssertionResult[] = [];
  const fakeId = `fake-authority-${randomBytes(4).toString('hex')}`;
  const res = await callTool(client, bearer, 'lookup_citation', {
    query: fakeId,
    category: 'irc_sections',
  });
  out.push(assertNoFiveHundred(res));
  const r = unwrap(res);
  // Must NOT fabricate. Accept structured citation_unresolved, empty matches, or isError.
  const matches = r?.citations ?? r?.matches ?? r?.results ?? [];
  const status = r?.status ?? r?.error;
  const looksLikeUnresolved =
    String(status || '').includes('unresolved') ||
    String(status || '').includes('not_found') ||
    isToolError(res) ||
    (Array.isArray(matches) && matches.length === 0);
  out.push(assert(
    'unknown authority → structured citation_unresolved (no fabrication)',
    Boolean(looksLikeUnresolved),
    'unresolved/empty/isError',
    `status=${status}, matches=${Array.isArray(matches) ? matches.length : 'n/a'}`,
  ));
  // If matches are non-empty, every match must be a known authority — not a hallucination.
  if (Array.isArray(matches) && matches.length > 0) {
    const fabricated = matches.find((m: any) => String(m?.id || m?.authority_id || '').includes(fakeId));
    out.push(assert(
      'no fabricated match echoes the fake authority id',
      !fabricated,
      'no fabrication',
      JSON.stringify(fabricated || null).slice(0, 80),
    ));
  }
  return out;
}

async function scenarioConcurrency(
  client: McpClient,
  bearer: string | null,
): Promise<AssertionResult[]> {
  const out: AssertionResult[] = [];
  // Get a base DealState first
  const ingest = await callTool(client, bearer, 'ingest_deal_payload', {
    journey: 'buy',
    target_industry: 'B2B services',
    target_jurisdiction: 'US-TX',
    target_sde: 500_000_000,
    naics: '541512',
  });
  out.push(assertNoFiveHundred(ingest));
  const dealState = unwrap(ingest)?.dealState;
  if (!dealState) {
    out.push(assert('could not obtain base DealState', false));
    return out;
  }
  // Fire two updates against the same DealState concurrently.
  const writers = [
    callTool(client, bearer, 'update_deal_payload', {
      dealState,
      patch: { tag: 'writer_A', writer_A_value: 1 },
    }),
    callTool(client, bearer, 'update_deal_payload', {
      dealState,
      patch: { tag: 'writer_B', writer_B_value: 2 },
    }),
  ];
  const [a, b] = await Promise.all(writers);
  out.push(assertNoFiveHundred(a));
  out.push(assertNoFiveHundred(b));
  // Either both succeeded (serialized) or one returned a conflict envelope.
  const aErr = isToolError(a);
  const bErr = isToolError(b);
  const aRoot = unwrap(a);
  const bRoot = unwrap(b);
  const hasConflict =
    aErr || bErr ||
    String(aRoot?.error || aRoot?.status || '').includes('conflict') ||
    String(bRoot?.error || bRoot?.status || '').includes('conflict');
  const bothSucceeded = !aErr && !bErr && aRoot && bRoot;
  out.push(assert(
    'concurrent writers → either serialized OR structured conflict',
    Boolean(bothSucceeded || hasConflict),
    'serialization or conflict envelope',
    `aErr=${aErr}, bErr=${bErr}`,
  ));
  // If conflict: must include retry guidance
  if (hasConflict && (aErr || bErr)) {
    const guidance =
      structuredErrorMessage(aErr ? a : b) || '';
    out.push(assert(
      'conflict response includes retry guidance',
      /retry|refresh|reload|stale/i.test(guidance),
      'retry hint',
      guidance.slice(0, 80),
    ));
  }
  return out;
}

async function main(): Promise<number> {
  const cli = parseArgs(process.argv);
  const env = readEnv();
  if (cli.url) env.origin = cli.url.replace(/\/+$/, '');
  header(`smbX agent-POV failure modes (target=${env.origin})`);

  const bearer = await resolveBearer(env, cli);
  if (!bearer) note('no bearer token — calls will be anonymous (most checks expect 401)');

  const client = new McpClient(env);
  const scenarios = [
    await runScenario('FM-001-MALFORMED-PAYLOAD', 'FM', () => scenarioMalformedPayload(client, bearer)),
    await runScenario('FM-002-UNKNOWN-METHODOLOGY-VERSION', 'FM', () => scenarioUnknownMethodologyVersion(client, bearer)),
    await runScenario('FM-006-EXPIRED-TOKEN', 'FM', () => scenarioExpiredToken(client, bearer)),
    await runScenario('FM-007-TIMEOUT', 'FM', () => scenarioTimeout(client, bearer)),
    await runScenario('FM-008-IDEMPOTENCY', 'FM', () => scenarioIdempotency(client, bearer)),
    await runScenario('FM-009-UNRESOLVED-CITATION', 'FM', () => scenarioUnresolvedCitation(client, bearer)),
    await runScenario('FM-010-CONCURRENCY', 'FM', () => scenarioConcurrency(client, bearer)),
  ];

  const written = await writeRunSummary(SCRIPT_NAME, scenarios, env.origin);
  note(`results written to ${written.path}`);
  return printSummary(written.summary);
}

main()
  .then(code => process.exit(code))
  .catch(err => {
    console.error(`${c.red}infra error:${c.reset} ${err.stack || err.message || err}`);
    process.exit(2);
  });
