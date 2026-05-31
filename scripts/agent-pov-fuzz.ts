#!/usr/bin/env npx tsx
/**
 * Agent-POV payload fuzz harness (PC-FUZZ-*).
 *
 * Generates ~200 randomized payloads by mutating axis values defined in
 * `testing/agent-pov/types.ts` (Journey, SubJourney, League, DistressPosture,
 * AssetClass, TaxClassification, plus random scalar/object fields) and replays
 * each through `ingest_deal_payload` against the smbX DEFINITIVE substrate via
 * the MCP transport.
 *
 * Test plan: TEST_PLAN_SUBSTRATE_AGENT_POV.md §3.2 (PC-FUZZ-*).
 *
 * The fuzz harness does NOT assert classification correctness — that is the
 * job of the curated PC-* fixtures. Fuzz only asserts the three properties
 * that must hold for any payload, no matter how malformed:
 *   1. The substrate never returns 5xx (no crash).
 *   2. The substrate always returns a structured response (status + JSON body).
 *   3. Every response is either a classification, refusal, or structured
 *      error — never a silent default, never empty.
 *
 * Usage:
 *   npx tsx scripts/agent-pov-fuzz.ts
 *   npx tsx scripts/agent-pov-fuzz.ts --url=http://127.0.0.1:3000 --count=200
 *   npx tsx scripts/agent-pov-fuzz.ts --bearer=$DEFINITIVE_MCP_ACCESS_TOKEN --seed=1337
 *
 * Exit codes:
 *   0 — every fuzz payload returned a structured response with no 5xx
 *   1 — at least one fuzz payload failed (5xx, non-structured, or silent default)
 *   2 — infrastructure error
 */

import 'dotenv/config';
import { randomBytes } from 'node:crypto';
import {
  McpClient,
  assert,
  assertNoFiveHundred,
  assertStructuredResponse,
  c,
  header,
  mintLocalAgentToken,
  note,
  printSummary,
  readEnv,
  runScenario,
  writeRunSummary,
} from '../testing/agent-pov/runner-helpers.js';
import type { McpResponse } from '../testing/agent-pov/runner-helpers.js';
import type {
  AssertionResult,
  AssetClass,
  DistressPosture,
  Journey,
  League,
  SubJourney,
  TaxClassification,
} from '../testing/agent-pov/types.js';

const SCRIPT_NAME = 'agent-pov-fuzz';

// ─── CLI argument parsing ──────────────────────────────────
interface CliArgs {
  url?: string;
  bearer?: string;
  count: number;
  batchSize: number;
  seed?: number;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { count: 200, batchSize: 50 };
  for (const raw of argv.slice(2)) {
    if (raw.startsWith('--url=')) args.url = raw.slice(6);
    else if (raw.startsWith('--bearer=')) args.bearer = raw.slice(9);
    else if (raw.startsWith('--count=')) args.count = Number(raw.slice(8)) || args.count;
    else if (raw.startsWith('--batch=')) args.batchSize = Number(raw.slice(8)) || args.batchSize;
    else if (raw.startsWith('--seed=')) args.seed = Number(raw.slice(7));
  }
  return args;
}

// ─── Deterministic-ish PRNG (mulberry32) ───────────────────
function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), 1 | t);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Axes (mirror types.ts) ────────────────────────────────
const JOURNEYS: Journey[] = ['buy', 'sell', 'raise', 'pmi'];
const SUB_JOURNEYS: SubJourney[] = [
  'healthy_buy_side', 'distressed_buy_side', 'strategic_tuck_in',
  'principal_seller', 'owner_rep', 'banker_led', 'broken_auction',
  'early_stage_raise', 'growth_raise', 'debt_raise', 'secondary_raise',
  'pmi_day_0', 'pmi_stabilization', 'pmi_assessment', 'pmi_optimization',
];
const LEAGUES: League[] = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9', 'L10'];
const DISTRESS: DistressPosture[] = ['healthy', 'partial_distress', 'full_distress', 'unknown'];
const ASSET_CLASS: AssetClass[] = ['operating_co', 'real_estate', 'ip_heavy', 'mixed', 'unknown'];
const TAX_CLASS: TaxClassification[] = ['c_corp', 's_corp', 'llc_partnership', 'pass_through', 'foreign_entity', 'unknown'];
const JURISDICTIONS = ['US-TX', 'US-CA', 'US-NY', 'US-FL', 'US-DE', 'US-IL', 'US-OH', 'US-WA', 'CA-ON', 'GB', 'DE', 'unknown', '', '???'];
const INDUSTRIES = [
  'B2B services', 'HVAC services', 'vertical SaaS', 'specialty manufacturing',
  'field services', 'logistics', 'home services', 'professional services',
  'food & beverage', 'retail', 'healthcare services', 'unknown', 'a;klsjdf', '',
];
const SCALAR_KEYS = [
  'target_revenue', 'target_ebitda', 'target_sde', 'purchase_price', 'asking_price',
  'cash_runway_days', 'fccr', 'naics', 'closing_date', 'rollover', 'earnout',
  'foo', 'bar', 'baz', '🚀', 'weird key with spaces', 'sql; DROP TABLE deals;--',
];
const TOOL_NAMES = [
  'ingest_deal_payload', 'ingest_deal_payload', 'ingest_deal_payload',
  'ingest_deal_payload', 'ingest_deal_payload', 'ingest_deal_payload',
  // Occasionally fuzz other entry points too.
  'update_deal_payload', 'compose_model_stack', 'fetch_market_data',
];

function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function randomScalar(rng: () => number): unknown {
  const kind = Math.floor(rng() * 8);
  switch (kind) {
    case 0: return Math.floor(rng() * 100_000_000_00); // cents-like int
    case 1: return rng() * 1000;
    case 2: return rng() < 0.5;
    case 3: return null;
    case 4: return randomBytes(4).toString('hex');
    case 5: return Array.from({ length: Math.floor(rng() * 4) }, () => randomBytes(2).toString('hex'));
    case 6: return { nested: randomBytes(3).toString('hex') };
    case 7: return undefined; // dropped by JSON serialization
    default: return 'fuzz';
  }
}

function randomPayload(rng: () => number): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  // Anchor: sometimes include a journey, sometimes not (forces classification edge cases).
  if (rng() < 0.7) payload.journey = pick(rng, JOURNEYS);
  if (rng() < 0.4) payload.subJourney = pick(rng, SUB_JOURNEYS);
  if (rng() < 0.5) payload.league = pick(rng, LEAGUES);
  if (rng() < 0.3) payload.distressPosture = pick(rng, DISTRESS);
  if (rng() < 0.3) payload.assetClass = pick(rng, ASSET_CLASS);
  if (rng() < 0.3) payload.taxClassification = pick(rng, TAX_CLASS);
  if (rng() < 0.5) payload.target_jurisdiction = pick(rng, JURISDICTIONS);
  if (rng() < 0.5) payload.target_industry = pick(rng, INDUSTRIES);

  // Sprinkle random additional fields (some legit, some garbage).
  const extraCount = Math.floor(rng() * 6);
  for (let i = 0; i < extraCount; i++) {
    const k = pick(rng, SCALAR_KEYS);
    payload[k] = randomScalar(rng);
  }

  // Occasionally inject a deeply nested object so the parser sees structure.
  if (rng() < 0.2) {
    payload.documents = Array.from({ length: Math.floor(rng() * 3) }, (_, i) => ({
      id: `fuzz-doc-${i}`,
      name: randomBytes(3).toString('hex'),
      category: pick(rng, ['financials', 'legal', 'tax', 'commercial', 'unknown']),
    }));
  }

  // Occasionally inject a totally bogus type for a known field.
  if (rng() < 0.15) {
    payload.journey = { not: 'a string' };
  }
  if (rng() < 0.1) {
    payload.target_revenue = 'fifteen million dollars';
  }
  if (rng() < 0.05) {
    payload.purchase_price = -1;
  }

  // ~3% pure garbage: empty payload, or random bytes as the whole payload.
  if (rng() < 0.03) return {};
  if (rng() < 0.03) return { '__raw__': randomBytes(32).toString('hex') };

  return payload;
}

// ─── Response shape classification ─────────────────────────

type ResponseShape =
  | 'classification'
  | 'classification_with_missing_inputs'
  | 'refusal'
  | 'structured_error'
  | 'silent_default'
  | 'unstructured';

function classifyShape(res: McpResponse): ResponseShape {
  const body = res.body ?? {};
  if (typeof body !== 'object' || body === null) return 'unstructured';

  // MCP envelopes wrap structured content under result.structuredContent.
  const envelope = body?.result?.structuredContent ?? null;
  const inner =
    envelope?.result?.result ??
    envelope?.result ??
    envelope ??
    body;

  const isToolError = Boolean(body?.result?.isError) || Boolean(body?.error);
  const lineStatus =
    inner?.lineStatus ||
    envelope?.lineStatus ||
    inner?.line_status ||
    body?.line_status;

  // Refusal: explicit error code, or lineStatus signaling a refusal type.
  if (isToolError) {
    // Distinguish LINE / governance refusals from generic structured errors:
    // refusal envelopes typically carry a known refusal code or tollgate.
    const errCode =
      body?.error?.code ||
      body?.error?.data?.code ||
      body?.result?.structuredContent?.result?.error ||
      inner?.error ||
      inner?.tollgate?.code;
    const refusalCodes = new Set([
      'LINE_VIOLATION', 'human_approval_required', 'counsel_review_required',
      'enterprise_scope_required', 'credit_budget_required',
      'unsupported_version', 'missing_required_scope', 'malformed_payload',
    ]);
    if (errCode && refusalCodes.has(String(errCode))) return 'refusal';
    if (lineStatus && String(lineStatus).toUpperCase() !== 'GREEN') return 'refusal';
    if (res.status >= 400 && res.status < 500) return 'structured_error';
    return 'structured_error';
  }

  // Non-error path: must include some sign of classification work.
  const classification =
    inner?.classificationKey ||
    inner?.classification ||
    inner?.dealState?.classificationKey ||
    inner?.dealState?.classification;
  const missing =
    inner?.missingInputContract?.fields ||
    inner?.missingInputs ||
    inner?.missingFields;

  if (missing && Array.isArray(missing) && missing.length > 0) {
    return 'classification_with_missing_inputs';
  }
  if (classification && Object.keys(classification).length > 0) {
    return 'classification';
  }

  // 4xx without isError → still treated as structured error.
  if (res.status >= 400 && res.status < 500) return 'structured_error';

  // 200 with no classification AND no missing-inputs AND no error → silent default. BAD.
  return 'silent_default';
}

// ─── Token resolution ──────────────────────────────────────
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
      agentIdentity: `agent_pov_fuzz_${Date.now()}`,
      tier: 'pro',
    });
    if (minted) return minted;
  }
  return null;
}

// ─── Main ──────────────────────────────────────────────────

async function main(): Promise<number> {
  const cli = parseArgs(process.argv);
  const env = readEnv();
  if (cli.url) env.origin = cli.url.replace(/\/+$/, '');
  const seed = cli.seed ?? Math.floor(Math.random() * 0xffff_ffff);
  const rng = makeRng(seed);

  header(`smbX agent-POV fuzz (target=${env.origin}, count=${cli.count}, seed=${seed})`);

  const bearer = await resolveBearer(env, cli);
  if (!bearer) {
    note('no bearer token — calls will be anonymous (substrate must still return structured responses)');
  } else {
    note('bearer token resolved');
  }

  const client = new McpClient(env);
  const shapes: Record<ResponseShape, number> = {
    classification: 0,
    classification_with_missing_inputs: 0,
    refusal: 0,
    structured_error: 0,
    silent_default: 0,
    unstructured: 0,
  };
  const tools: Record<string, number> = {};

  const scenarios = [];
  const batchCount = Math.ceil(cli.count / cli.batchSize);

  let runIndex = 0;
  for (let batch = 0; batch < batchCount; batch++) {
    const batchId = `PC-FUZZ-BATCH-${String(batch + 1).padStart(3, '0')}`;
    const remaining = cli.count - batch * cli.batchSize;
    const thisBatch = Math.min(cli.batchSize, remaining);

    const scenario = await runScenario(batchId, 'PC', async () => {
      const assertions: AssertionResult[] = [];
      for (let i = 0; i < thisBatch; i++) {
        runIndex++;
        const tool = pick(rng, TOOL_NAMES);
        tools[tool] = (tools[tool] || 0) + 1;
        const payload = randomPayload(rng);
        let res: McpResponse;
        try {
          res = await client.mcpCall('tools/call', {
            name: tool,
            arguments: payload,
          }, { bearer: bearer ?? undefined, timeoutMs: 15_000 });
        } catch (err) {
          assertions.push(assert(
            `fuzz #${runIndex} (${tool}) network/transport ok`,
            false,
            'no throw',
            (err as Error).message,
          ));
          continue;
        }

        // Property 1: never 5xx
        assertions.push(assertNoFiveHundred(res));
        // Property 2: structured response
        assertions.push(assertStructuredResponse(res));
        // Property 3: classification | refusal | structured_error (never silent_default / unstructured)
        const shape = classifyShape(res);
        shapes[shape] = (shapes[shape] || 0) + 1;
        assertions.push(assert(
          `fuzz #${runIndex} (${tool}) returns classification | refusal | structured_error (got=${shape})`,
          shape !== 'silent_default' && shape !== 'unstructured',
          'classification | refusal | structured_error',
          shape,
        ));
      }
      return assertions;
    });
    scenarios.push(scenario);
  }

  // ─── Histogram ────────────────────────────────────────────
  header('Response shape histogram');
  const total = Object.values(shapes).reduce((a, b) => a + b, 0);
  for (const [shape, count] of Object.entries(shapes)) {
    const pct = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
    const color =
      shape === 'silent_default' || shape === 'unstructured'
        ? c.red
        : shape === 'classification' || shape === 'classification_with_missing_inputs'
          ? c.green
          : c.yellow;
    const bar = '█'.repeat(Math.min(40, Math.round((count / Math.max(1, total)) * 40)));
    console.log(`  ${color}${shape.padEnd(38)}${c.reset} ${String(count).padStart(4)} (${pct.padStart(5)}%)  ${bar}`);
  }

  header('Tool dispatch counts');
  for (const [tool, count] of Object.entries(tools)) {
    console.log(`  ${tool.padEnd(28)} ${count}`);
  }

  const structuredRate = total > 0
    ? ((total - (shapes.silent_default + shapes.unstructured)) / total) * 100
    : 0;
  console.log(`\n  ${c.bold}Structured-response rate: ${structuredRate.toFixed(2)}%${c.reset} (target: 100%)`);

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
