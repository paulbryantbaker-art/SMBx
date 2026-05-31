#!/usr/bin/env npx tsx
/**
 * Agent-POV caller parity harness (CV-*).
 *
 * Calls the same substrate tool with the same input through three caller
 * profiles — raw MCP, Claude Connector simulator, ChatGPT GPT Actions
 * simulator — and asserts identical output_hash (excluding caller-specific
 * metadata fields like timestamp, audit_id, agent_id). Hash divergence
 * indicates the substrate is leaking caller behavior, violating the
 * "any agent" promise.
 *
 * Test plan: TEST_PLAN_SUBSTRATE_AGENT_POV.md §4.9 CV-PARITY.
 *
 * Usage:
 *   npx tsx scripts/agent-pov-caller-parity.ts
 *   npx tsx scripts/agent-pov-caller-parity.ts --url=http://127.0.0.1:3000
 *   npx tsx scripts/agent-pov-caller-parity.ts --bearer=$DEFINITIVE_MCP_ACCESS_TOKEN
 *
 * Exit: 0 all-pass / 1 any-fail / 2 infra error.
 */

import 'dotenv/config';
import {
  McpClient,
  assert,
  assertNoFiveHundred,
  c,
  header,
  mintLocalAgentToken,
  note,
  printSummary,
  readEnv,
  runScenario,
  sha256,
  skip,
  writeRunSummary,
} from '../testing/agent-pov/runner-helpers.js';
import type { McpResponse } from '../testing/agent-pov/runner-helpers.js';
import type { AssertionResult } from '../testing/agent-pov/types.js';

const SCRIPT_NAME = 'agent-pov-caller-parity';

interface CliArgs { url?: string; bearer?: string; gptBearer?: string; }
function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {};
  for (const raw of argv.slice(2)) {
    if (raw.startsWith('--url=')) args.url = raw.slice(6);
    else if (raw.startsWith('--bearer=')) args.bearer = raw.slice(9);
    else if (raw.startsWith('--gpt-bearer=')) args.gptBearer = raw.slice(13);
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
      agentIdentity: `agent_pov_cv_${Date.now()}`,
      tier: 'pro',
    });
    if (minted) return minted;
  }
  return null;
}

function unwrap(res: McpResponse): any {
  const body = res.body ?? {};
  // Walk deepest-first. Each caller transport wraps the substrate body
  // differently:
  //   - Raw MCP: body.result.structuredContent.<substrate>.result (where
  //     <substrate>.result is the tool's inner result for DealState tools)
  //   - GPT Actions facade: body = <substrate> directly (no JSON-RPC wrap),
  //     so body.result.result is the tool's inner result
  //   - Claude Custom Connector: same shape as raw MCP
  // The chain below normalizes all three to the innermost tool-result
  // payload so parity-hash comparisons see the same structure.
  return (
    body?.result?.structuredContent?.result?.result ??
    body?.result?.structuredContent?.result ??
    body?.result?.structuredContent ??
    body?.result?.result ??
    body?.result ??
    body
  );
}

function isToolError(res: McpResponse): boolean {
  return Boolean(res.body?.result?.isError) || Boolean(res.body?.error);
}

/** Strip caller-specific + nondeterministic fields and return canonical JSON. */
const NONDETERMINISTIC_FIELDS = new Set([
  'timestamp',
  'createdAt',
  'created_at',
  'finishedAt',
  'startedAt',
  'executedAt',
  'executed_at',
  'modelExecutionId',
  'model_execution_id',
  // Credit-usage counters are state-dependent (each call increments) so they
  // never match across two sequential invocations. Strip the whole usage
  // block from the canonical output.
  'v19Usage',
  'v19_usage',
  'usage',
  // Per-call counters that change as the entitlement meter ticks.
  'used',
  'creditsUsed',
  'credits_used',
  'creditBalance',
  'credit_balance',
  'remainingCredits',
  'remaining_credits',
  'auditId',
  'audit_id',
  'auditTrailId',
  'audit_trail_id',
  'requestId',
  'idempotencyKey',
  'idempotency_key',
  'agentId',
  'agent_id',
  'agentPlatformId',
  'agent_platform_id',
  'sessionId',
  'session_id',
  'mandateId',
  'mandate_id',
  'beneficialCustomerId',
  'beneficial_customer_id',
  'persistence',
  'generatedAt',
  'signedAt',
  'cid', // content addresses derived include caller mandate
  'dealStateCid',
  'packageCid',
  'parentCid',
  'parent_cid',
]);

function canonicalize(value: any): any {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(canonicalize);
  if (typeof value !== 'object') return value;
  const out: Record<string, any> = {};
  for (const k of Object.keys(value).sort()) {
    if (NONDETERMINISTIC_FIELDS.has(k)) continue;
    out[k] = canonicalize(value[k]);
  }
  return out;
}

function computeOutputHash(res: McpResponse): string {
  const canon = canonicalize(unwrap(res));
  return sha256(JSON.stringify(canon));
}

// ─── Caller profiles ──────────────────────────────────────

interface CallerProfile {
  id: string;
  label: string;
  call(client: McpClient, bearer: string | null, toolName: string, input: any): Promise<McpResponse>;
}

const rawMcpProfile: CallerProfile = {
  id: 'raw_mcp',
  label: 'Raw MCP client',
  async call(client, bearer, toolName, input) {
    return client.mcpCall(
      'tools/call',
      { name: toolName, arguments: input },
      { bearer: bearer ?? undefined },
    );
  },
};

const claudeConnectorProfile: CallerProfile = {
  id: 'claude_connector',
  label: 'Claude Custom Connector simulator',
  async call(client, bearer, toolName, input) {
    return client.mcpCall(
      'tools/call',
      { name: toolName, arguments: input },
      {
        bearer: bearer ?? undefined,
        headers: {
          'User-Agent': 'claude-connector/1.0 (anthropic; smbx-test)',
          'X-MCP-Client': 'claude-custom-connector',
          'X-Agent-Platform-Id': 'claude_custom_connector',
        },
      },
    );
  },
};

const gptActionsProfile: CallerProfile = {
  id: 'gpt_actions',
  label: 'ChatGPT GPT Actions simulator',
  async call(client, bearer, toolName, input) {
    // GPT Actions route is path-based (not /mcp). It expects an `input` body
    // and infers caller metadata server-side. We pass the same bearer; in
    // production a confidential-client bearer is used.
    return client.toolCall(
      toolName,
      input,
      {},
      {
        bearer: bearer ?? undefined,
        url: `${client.env.origin}/api/definitive/gpt-actions/${toolName}`,
        headers: {
          'User-Agent': 'openai-gpt-actions/1.0',
          'X-Agent-Platform-Id': 'chatgpt_gpt_actions',
        },
      },
    );
  },
};

const PROFILES: CallerProfile[] = [rawMcpProfile, claudeConnectorProfile, gptActionsProfile];

// ─── Representative tool calls ────────────────────────────

interface RepCall {
  id: string;
  toolName: string;
  input: any;
  /** Some tools are NOT in the GPT Actions allowlist — skip GPT call gracefully. */
  gptAllowlisted: boolean;
}

const REP_CALLS: RepCall[] = [
  {
    id: 'CV-INGEST',
    toolName: 'ingest_deal_payload',
    input: {
      journey: 'buy',
      target_industry: 'B2B services',
      target_jurisdiction: 'US-TX',
      target_sde: 500_000_000,
      target_revenue: 1800_000_00,
      naics: '541512',
    },
    gptAllowlisted: true,
  },
  {
    id: 'CV-EXECUTE-LBO',
    toolName: 'execute_model',
    input: {
      modelId: 'MODEL.LBO.LMM.v1',
      input: {
        purchase_price_cents: 2500_000_000,
        debt_cents: 900_000_000,
        sponsor_equity_cents: 1600_000_000,
        entry_ebitda_cents: 500_000_000,
        exit_multiple: 7.5,
      },
    },
    gptAllowlisted: false,
  },
  {
    id: 'CV-COMPOSE-STACK',
    toolName: 'compose_model_stack',
    input: { dealId: 0, journey: 'buy', league: 'L4', signals: {} },
    gptAllowlisted: true,
  },
  {
    id: 'CV-FINALIZE-PACKAGE',
    toolName: 'finalize_deal_package',
    input: { dealPackage: {}, dealState: {} },
    gptAllowlisted: false,
  },
  {
    id: 'CV-LOOKUP-CITATION',
    toolName: 'lookup_citation',
    input: { query: 'IRC 1060', category: 'irc_sections' },
    gptAllowlisted: false,
  },
];

async function compareAcrossProfiles(
  client: McpClient,
  bearer: string | null,
  rep: RepCall,
): Promise<AssertionResult[]> {
  const out: AssertionResult[] = [];
  const results: Array<{ profile: CallerProfile; res: McpResponse; hash: string }> = [];
  for (const profile of PROFILES) {
    if (profile.id === 'gpt_actions' && !rep.gptAllowlisted) {
      skip(`${profile.label} for ${rep.toolName}`, 'tool not in GPT Actions allowlist');
      continue;
    }
    let res: McpResponse;
    try {
      res = await profile.call(client, bearer, rep.toolName, rep.input);
    } catch (err) {
      out.push(assert(`${profile.label} call did not throw`, false, 'no throw', (err as Error).message));
      continue;
    }
    out.push(assertNoFiveHundred(res));
    if (isToolError(res) && res.status >= 400) {
      // Profile returned a structured error — record but don't compare hash
      note(`${profile.label} returned status=${res.status} (isError=${isToolError(res)})`);
    }
    const hash = computeOutputHash(res);
    results.push({ profile, res, hash });
  }
  if (results.length < 2) {
    out.push(assert('at least 2 caller profiles produced a comparable response', false, '≥2', String(results.length)));
    return out;
  }
  const reference = results[0];
  for (let i = 1; i < results.length; i += 1) {
    const cur = results[i];
    const match = cur.hash === reference.hash;
    out.push(assert(
      `${rep.id}: ${cur.profile.label} output_hash == ${reference.profile.label}`,
      match,
      reference.hash.slice(0, 16) + '…',
      cur.hash.slice(0, 16) + '…',
    ));
    if (!match) {
      // dump first 200 chars of each canonical body for triage
      note(`${reference.profile.label}: ${JSON.stringify(canonicalize(unwrap(reference.res))).slice(0, 200)}`);
      note(`${cur.profile.label}: ${JSON.stringify(canonicalize(unwrap(cur.res))).slice(0, 200)}`);
    }
  }
  return out;
}

async function main(): Promise<number> {
  const cli = parseArgs(process.argv);
  const env = readEnv();
  if (cli.url) env.origin = cli.url.replace(/\/+$/, '');
  header(`smbX agent-POV caller parity (target=${env.origin})`);

  const bearer = await resolveBearer(env, cli);
  if (!bearer) note('no bearer token — calls will be anonymous (expect 401 across all profiles)');

  const client = new McpClient(env);
  const scenarios: any[] = [];
  for (const rep of REP_CALLS) {
    scenarios.push(await runScenario(rep.id, 'CV', () => compareAcrossProfiles(client, bearer, rep)));
  }

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
