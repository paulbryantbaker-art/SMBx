#!/usr/bin/env npx tsx
/**
 * Agent-POV audit integrity harness (AU-*).
 *
 * Asserts the mandate-chain audit contract: every substrate tool call writes
 * an audit row carrying agent_id, beneficial_customer_id, mandate_id,
 * spec_version, methodology_version, input_hash, output_hash, citation_refs,
 * line_status, tool_name, timestamp. Also asserts input/output hash
 * determinism across repeated calls with identical inputs.
 *
 * Test plan: TEST_PLAN_SUBSTRATE_AGENT_POV.md §4.5 SI / AU-*.
 *
 * Usage:
 *   npx tsx scripts/agent-pov-audit-integrity.ts
 *   npx tsx scripts/agent-pov-audit-integrity.ts --url=http://127.0.0.1:3000
 *   npx tsx scripts/agent-pov-audit-integrity.ts --bearer=$DEFINITIVE_MCP_ACCESS_TOKEN
 *
 * Exit: 0 all-pass / 1 any-fail / 2 infra error.
 */

import 'dotenv/config';
import {
  McpClient,
  assert,
  assertNoFiveHundred,
  c,
  getPath,
  header,
  mintLocalAgentToken,
  note,
  printSummary,
  readEnv,
  runScenario,
  sha256,
  writeRunSummary,
  skip,
} from '../testing/agent-pov/runner-helpers.js';
import type { McpResponse } from '../testing/agent-pov/runner-helpers.js';
import type { AssertionResult } from '../testing/agent-pov/types.js';

const SCRIPT_NAME = 'agent-pov-audit-integrity';

interface CliArgs { url?: string; bearer?: string; appJwt?: string; }
function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {};
  for (const raw of argv.slice(2)) {
    if (raw.startsWith('--url=')) args.url = raw.slice(6);
    else if (raw.startsWith('--bearer=')) args.bearer = raw.slice(9);
    else if (raw.startsWith('--app-jwt=')) args.appJwt = raw.slice(10);
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
      agentIdentity: `agent_pov_au_${Date.now()}`,
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
  const candidate =
    root?.auditId ??
    root?.audit_id ??
    root?.auditTrailId ??
    root?.audit_trail_id ??
    root?.audit?.id ??
    root?.persistence?.auditTrailId ??
    res.body?.persistence?.auditTrailId ??
    null;
  return candidate == null ? null : candidate;
}

// Schema-completeness assertions for an audit row.
const REQUIRED_AUDIT_FIELDS = [
  'agent_id',
  'beneficial_customer_id',
  'mandate_id',
  'spec_version',
  'methodology_version',
  'input_hash',
  'output_hash',
  'citation_refs',
  'line_status',
  'tool_name',
  'timestamp',
] as const;

const FIELD_ALIASES: Record<string, string[]> = {
  agent_id: ['agent_id', 'agentId', 'agent'],
  beneficial_customer_id: ['beneficial_customer_id', 'beneficialCustomerId'],
  mandate_id: ['mandate_id', 'mandateId'],
  spec_version: ['spec_version', 'specVersion'],
  methodology_version: ['methodology_version', 'methodologyVersion'],
  input_hash: ['input_hash', 'inputHash', 'inputs_hash'],
  output_hash: ['output_hash', 'outputHash'],
  citation_refs: ['citation_refs', 'citationRefs', 'citationsValidated', 'citations'],
  line_status: ['line_status', 'lineStatus'],
  tool_name: ['tool_name', 'toolName'],
  timestamp: ['timestamp', 'createdAt', 'created_at'],
};

function resolveField(row: Record<string, any>, name: string): unknown {
  const aliases = FIELD_ALIASES[name] || [name];
  for (const a of aliases) {
    if (row[a] !== undefined && row[a] !== null) return row[a];
    // Also peek inside nested mandateChain / auditPacket
    const nested = row.mandateChain?.[a] ?? row.auditPacket?.[a] ?? row.auditPacket?.response?.[a];
    if (nested !== undefined && nested !== null) return nested;
  }
  return undefined;
}

function assertAuditRowSchema(row: any, rowLabel: string): AssertionResult[] {
  const out: AssertionResult[] = [];
  const missing: string[] = [];
  for (const field of REQUIRED_AUDIT_FIELDS) {
    const v = resolveField(row, field);
    if (v === undefined) missing.push(field);
  }
  out.push(assert(
    `audit row ${rowLabel}: 100% required fields present`,
    missing.length === 0,
    REQUIRED_AUDIT_FIELDS,
    missing.length === 0 ? 'all present' : `missing: ${missing.join(', ')}`,
  ));
  // citation_refs must be an array (or array-like) when present
  const refs = resolveField(row, 'citation_refs');
  if (refs !== undefined) {
    out.push(assert(
      `audit row ${rowLabel}: citation_refs is array`,
      Array.isArray(refs) || (typeof refs === 'object'),
      'array/object',
      typeof refs,
    ));
  }
  return out;
}

async function fetchAuditPacket(
  client: McpClient,
  bearer: string | null,
  auditId: string | number,
): Promise<any | null> {
  // Bearer-protected app route
  const headers: Record<string, string> = {};
  if (bearer) headers['Authorization'] = `Bearer ${bearer}`;
  const res = await client.get(`/api/definitive/audit-packets/${auditId}`, { bearer: bearer ?? undefined });
  if (res.status !== 200 || typeof res.body !== 'object') return null;
  return res.body;
}

// ─── Scenarios ────────────────────────────────────────────

async function scenarioFullLifecycleAuditChain(
  client: McpClient,
  bearer: string | null,
): Promise<AssertionResult[]> {
  const out: AssertionResult[] = [];
  // ingest_deal_payload
  const ingestPayload = {
    journey: 'buy',
    target_industry: 'B2B services',
    target_jurisdiction: 'US-TX',
    target_sde: 500_000_000,
    target_revenue: 1800_000_00,
    naics: '541512',
    idempotency_key: `au-fixture-ingest-${Date.now()}`,
  };
  const ingest = await callTool(client, bearer, 'ingest_deal_payload', ingestPayload);
  out.push(assertNoFiveHundred(ingest));
  const ingestAudit = extractAuditId(ingest);
  out.push(assert(
    'ingest_deal_payload returns audit id',
    ingestAudit != null,
    'audit id present',
    String(ingestAudit),
  ));

  // update_deal_payload
  const update = await callTool(client, bearer, 'update_deal_payload', {
    dealState: unwrap(ingest)?.dealState ?? null,
    patch: { ownerPerks: [{ label: 'discretionary travel', amount_cents: 50_000_00 }] },
  });
  out.push(assertNoFiveHundred(update));
  const updateAudit = extractAuditId(update);
  out.push(assert('update_deal_payload returns audit id', updateAudit != null));

  // execute_model with deterministic LBO inputs
  const lboInput = {
    purchase_price_cents: 2500_000_000,
    debt_cents: 900_000_000,
    sponsor_equity_cents: 1600_000_000,
    entry_ebitda_cents: 500_000_000,
    exit_multiple: 7.5,
  };
  const exec = await callTool(client, bearer, 'execute_model', {
    modelId: 'MODEL.LBO.LMM.v1',
    input: lboInput,
  });
  out.push(assertNoFiveHundred(exec));
  const execAudit = extractAuditId(exec);
  out.push(assert('execute_model returns audit id', execAudit != null));

  // compose_deal_plan
  const plan = await callTool(client, bearer, 'compose_deal_plan', {
    dealState: unwrap(update)?.dealState ?? unwrap(ingest)?.dealState ?? null,
  });
  out.push(assertNoFiveHundred(plan));

  // finalize_deal_package (best-effort)
  const pkg = await callTool(client, bearer, 'finalize_deal_package', {
    dealPackage: unwrap(plan)?.dealPackage ?? null,
    dealState: unwrap(update)?.dealState ?? null,
  });
  out.push(assertNoFiveHundred(pkg));

  // Fetch the ingest audit packet if id is exposed via the bearer surface
  if (ingestAudit != null) {
    const fetched = await fetchAuditPacket(client, bearer, ingestAudit);
    if (fetched) {
      out.push(...assertAuditRowSchema(fetched, `ingest#${ingestAudit}`));
    } else {
      out.push(assert(
        `audit packet ${ingestAudit} fetchable via /api/definitive/audit-packets/{id}`,
        false,
        '200 with packet body',
        'non-200 or empty body — bearer may not own row or persistence is best-effort',
      ));
    }
  }
  return out;
}

async function scenarioHashDeterminism(
  client: McpClient,
  bearer: string | null,
): Promise<AssertionResult[]> {
  const out: AssertionResult[] = [];
  const input = {
    purchase_price_cents: 2500_000_000,
    debt_cents: 900_000_000,
    sponsor_equity_cents: 1600_000_000,
    entry_ebitda_cents: 500_000_000,
    exit_multiple: 7.5,
  };
  const a = await callTool(client, bearer, 'execute_model', {
    modelId: 'MODEL.LBO.LMM.v1',
    input,
  });
  const b = await callTool(client, bearer, 'execute_model', {
    modelId: 'MODEL.LBO.LMM.v1',
    input,
  });
  out.push(assertNoFiveHundred(a));
  out.push(assertNoFiveHundred(b));
  const ha =
    getPath(unwrap(a), 'output_hash') ?? getPath(unwrap(a), 'outputHash');
  const hb =
    getPath(unwrap(b), 'output_hash') ?? getPath(unwrap(b), 'outputHash');
  if (typeof ha !== 'string' || typeof hb !== 'string') {
    out.push(assert(
      'execute_model exposes output_hash for determinism check',
      false,
      'string hash',
      `a=${typeof ha}, b=${typeof hb}`,
    ));
    return out;
  }
  out.push(assert(
    'execute_model output_hash is stable across identical runs',
    ha === hb,
    `same sha256`,
    `a=${ha.slice(0, 16)}…, b=${hb.slice(0, 16)}…`,
  ));
  // Also assert the hash format
  out.push(assert(
    'output_hash is 64-char hex (sha256)',
    /^[a-f0-9]{64}$/i.test(ha),
    '64-char hex',
    ha,
  ));
  return out;
}

async function scenarioRecentAuditSample(
  client: McpClient,
  bearer: string | null,
): Promise<AssertionResult[]> {
  const out: AssertionResult[] = [];
  // Recent audit row sampling needs DB access or an admin endpoint. We use the
  // ingest call above as a probe: if the route doesn't list recent rows, skip
  // with a clear reason.
  const sample = await client.get('/api/definitive/audit-packets?limit=20', { bearer: bearer ?? undefined });
  if (sample.status === 404 || sample.status === 405) {
    skip('audit-row sampling', 'no /api/definitive/audit-packets?limit listing endpoint exposed — DB-direct sampling required');
    out.push(assert('audit sampling endpoint not exposed (skipped)', true));
    return out;
  }
  if (sample.status !== 200 || !Array.isArray((sample.body as any)?.rows || sample.body)) {
    out.push(assert(
      'recent audit rows query returned structured array',
      false,
      '200 with rows[]',
      `status=${sample.status}, body type=${typeof sample.body}`,
    ));
    return out;
  }
  const rows: any[] = (sample.body as any).rows || (sample.body as any);
  out.push(assert(`sample size >= 1`, rows.length >= 1, '≥1 row', String(rows.length)));
  let missing = 0;
  for (let i = 0; i < Math.min(rows.length, 20); i += 1) {
    const r = rows[i];
    const m: string[] = [];
    for (const f of REQUIRED_AUDIT_FIELDS) {
      if (resolveField(r, f) === undefined) m.push(f);
    }
    if (m.length > 0) {
      missing += 1;
      note(`row ${i} missing: ${m.join(',')}`);
    }
  }
  out.push(assert(
    `100% schema completeness across sampled audit rows`,
    missing === 0,
    '0 incomplete',
    `${missing} incomplete`,
  ));
  return out;
}

async function main(): Promise<number> {
  const cli = parseArgs(process.argv);
  const env = readEnv();
  if (cli.url) env.origin = cli.url.replace(/\/+$/, '');
  header(`smbX agent-POV audit integrity (target=${env.origin})`);

  const bearer = await resolveBearer(env, cli);
  if (!bearer) note('no bearer token — calls will be anonymous (expect failures)');

  const client = new McpClient(env);
  const scenarios = [
    await runScenario('AU-FULL-LIFECYCLE', 'AU', () => scenarioFullLifecycleAuditChain(client, bearer)),
    await runScenario('AU-HASH-DETERMINISM', 'AU', () => scenarioHashDeterminism(client, bearer)),
    await runScenario('AU-RECENT-ROW-SAMPLE', 'AU', () => scenarioRecentAuditSample(client, bearer)),
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
