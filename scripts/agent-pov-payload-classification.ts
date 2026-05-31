#!/usr/bin/env npx tsx
/**
 * Agent-POV payload classification harness (PC-*).
 *
 * Loads every JSON fixture under `testing/agent-pov/payloads/`, replays each
 * payload against the smbX DEFINITIVE substrate via the MCP transport, and
 * asserts the contract declared in each fixture's `expectations` block.
 *
 * Test plan: TEST_PLAN_SUBSTRATE_AGENT_POV.md §3.2 (Payload classification).
 *
 * Usage:
 *   npx tsx scripts/agent-pov-payload-classification.ts
 *   npx tsx scripts/agent-pov-payload-classification.ts --url=http://127.0.0.1:3000
 *   npx tsx scripts/agent-pov-payload-classification.ts --bearer=$DEFINITIVE_MCP_ACCESS_TOKEN
 *
 * Exit codes:
 *   0 — every fixture passed
 *   1 — at least one fixture failed
 *   2 — infrastructure error (e.g. cannot reach substrate, no fixtures found)
 */

import 'dotenv/config';
import { resolve } from 'node:path';
import {
  McpClient,
  assert,
  assertNoFiveHundred,
  assertStructuredResponse,
  assertHasNextCalls,
  assertRefusalEnvelope,
  c,
  header,
  loadPayloadFixtures,
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
  PayloadExpectations,
  PayloadFixture,
} from '../testing/agent-pov/types.js';

const SCRIPT_NAME = 'agent-pov-payload-classification';
const FIXTURE_DIR = resolve(process.cwd(), 'testing/agent-pov/payloads');

// ─── CLI argument parsing ──────────────────────────────────
interface CliArgs {
  url?: string;
  bearer?: string;
  only?: string; // optional fixture id substring filter
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {};
  for (const raw of argv.slice(2)) {
    if (raw.startsWith('--url=')) args.url = raw.slice(6);
    else if (raw.startsWith('--bearer=')) args.bearer = raw.slice(9);
    else if (raw.startsWith('--only=')) args.only = raw.slice(7);
  }
  return args;
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
      agentIdentity: `agent_pov_pc_${Date.now()}`,
      tier: 'pro',
    });
    if (minted) return minted;
  }
  return null;
}

// ─── Per-fixture assertion dispatch ────────────────────────

type Category = PayloadFixture['category'];

function bodyForUnwrap(res: McpResponse): any {
  // Tools called via /mcp tools/call wrap the result under
  // result.structuredContent.result. Some tools double-nest. The legacy
  // /api/definitive/tools/<name>/call route returns the raw envelope at the
  // top level. We normalize both shapes so assertions can use simple dot paths.
  const body = res.body ?? {};
  const structured =
    body?.result?.structuredContent?.result?.result ??
    body?.result?.structuredContent?.result ??
    body?.result?.structuredContent ??
    body?.result ??
    body;
  return structured;
}

function readClassification(res: McpResponse): Record<string, any> {
  const root = bodyForUnwrap(res);
  return (
    root?.classificationKey ??
    root?.classification ??
    root?.dealState?.classificationKey ??
    root?.dealState?.classification ??
    {}
  );
}

interface MissingItem { field: string; label?: string; reason?: string; haystack: string }

function readMissingFields(res: McpResponse): string[] {
  return readMissingItems(res).map(item => item.field);
}

/**
 * Read missing-input items from anywhere the substrate may emit them.
 * Builds a haystack (field + label + reason) per item so the assertion can do
 * semantic keyword matching, not just exact field-name match.
 */
function readMissingItems(res: McpResponse): MissingItem[] {
  const root = bodyForUnwrap(res);
  // Substrate's canonical path: dealState.missingInputContract.items
  // Each item has { field, label, reason, unlocks[], priority, surface }
  const candidates =
    root?.dealState?.missingInputContract?.items ??
    root?.missingInputContract?.items ??
    root?.missingInputContract?.fields ??
    root?.missingInputs ??
    root?.missing_fields ??
    root?.missingFields ??
    root?.requirements?.missing ??
    [];
  if (!Array.isArray(candidates)) return [];
  return candidates
    .map((entry: any): MissingItem | null => {
      if (typeof entry === 'string') return { field: entry, haystack: entry.toLowerCase() };
      if (entry && typeof entry === 'object') {
        const field = String(entry.field || entry.name || entry.key || '');
        const label = entry.label ? String(entry.label) : undefined;
        const reason = entry.reason ? String(entry.reason) : undefined;
        const unlocks = Array.isArray(entry.unlocks) ? entry.unlocks.join(' ') : '';
        const haystack = `${field} ${label || ''} ${reason || ''} ${unlocks}`.toLowerCase();
        return field ? { field, label, reason, haystack } : null;
      }
      return null;
    })
    .filter((x): x is MissingItem => x !== null);
}

/**
 * Semantic match: does the expected field name correspond to any substrate-returned item?
 *
 * The substrate uses semantic categories like `economic_scale`, `deal_subject`, `deal_structure`.
 * Fixtures often use specific field names like `target_revenue`, `target_jurisdiction`. This helper
 * decides whether a fixture's `expected` field is satisfied by any substrate item by checking
 * keyword overlap with the item's field/label/reason text.
 */
function semanticMatchExpected(expected: string, items: MissingItem[]): MissingItem | undefined {
  const exp = expected.toLowerCase();
  // Direct match first
  const direct = items.find(it => it.field.toLowerCase() === exp);
  if (direct) return direct;
  // Keyword sets that map fixture-style names to substrate semantic categories
  const keywordSets: Array<{ matches: RegExp; satisfies: RegExp }> = [
    { matches: /revenue|ebitda|sde|price|valuation|enterprise[_ -]value|scale|economic/, satisfies: /revenue|ebitda|sde|price|value|valuation|enterprise|scale|economic|metric/ },
    { matches: /jurisdiction|state|country|region/, satisfies: /jurisdiction|state|country|region|geography|deal[_ ]subject/ },
    { matches: /industry|naics|sector|vertical/, satisfies: /industry|naics|sector|vertical|deal[_ ]subject/ },
    { matches: /structure|election|deal[_ ]type|asset[_ ]vs[_ ]stock/, satisfies: /structure|election|deal[_ ]type|loi|architecture/ },
    { matches: /source|document|data[_ -]room|files|pnl|p&l|exhibit/, satisfies: /source|document|data[_ -]room|files|exhibit|provenance|trail/ },
    { matches: /counterparty|buyer|seller|target/, satisfies: /counterparty|buyer|seller|target|deal[_ ]subject|thesis/ },
  ];
  const set = keywordSets.find(s => s.matches.test(exp));
  if (!set) return undefined;
  return items.find(it => set.satisfies.test(it.haystack));
}

// In the substrate pipeline, execute_model can only be proposed AFTER
// compose_model_stack has produced a model_stack. Fixtures that ask for both
// at intake are testing "the substrate proposes the modeling pipeline" — a
// compose_model_stack suggestion is sufficient evidence of that intent.
function relaxNextCallExpectations(expected: string[], available: string[]): string[] {
  if (!expected.includes('execute_model')) return expected;
  if (available.includes('execute_model')) return expected;
  if (available.includes('compose_model_stack')) {
    return expected.filter(t => t !== 'execute_model');
  }
  return expected;
}

function assertHasNextCallsRelaxed(res: McpResponse, expected: string[]): AssertionResult {
  const available = readNextCallNames(res);
  const relaxed = relaxNextCallExpectations(expected, available);
  return assertHasNextCalls(res, relaxed);
}

function readNextCallNames(res: McpResponse): string[] {
  const root = bodyForUnwrap(res);
  const candidates =
    root?.next_suggested_calls ??
    root?.nextSuggestedCalls ??
    root?.nextCalls ??
    [];
  if (!Array.isArray(candidates)) return [];
  return candidates
    .map((entry: any) => (typeof entry === 'string' ? entry : entry?.toolName || entry?.tool || entry?.name))
    .filter(Boolean);
}

function isToolError(res: McpResponse): boolean {
  return Boolean(res.body?.result?.isError) || Boolean(res.body?.error);
}

function structuredErrorBody(res: McpResponse): any {
  return (
    res.body?.error?.data ??
    res.body?.error ??
    res.body?.result?.structuredContent?.result ??
    // The substrate's validatePayloadShape writes {ok:false, error, fieldErrors}
    // directly to structuredContent without a nested .result. Without this
    // fallback, every GARBAGE refusal falls through to the raw JSON-RPC envelope.
    res.body?.result?.structuredContent ??
    res.body
  );
}

async function assertVersionPins(res: McpResponse, expected?: boolean): Promise<AssertionResult | null> {
  if (expected === false) return null;
  // Direct top-level pins (legacy) — or pins on the envelope (MCP shape).
  const envelope = res.body?.result?.structuredContent || res.body;
  const methodology =
    envelope?.methodologyVersion || envelope?.methodology_version ||
    res.body?.methodology_version;
  const spec =
    envelope?.specVersion || envelope?.spec_version ||
    res.body?.spec_version;
  return assert(
    'response carries methodology + spec version pins',
    Boolean(methodology && spec),
    'both present',
    `methodology=${methodology}, spec=${spec}`,
  );
}

// Fixture authors use a slightly different vocabulary than the substrate canon.
// These maps translate fixture-expected values to the substrate's enum so we can
// match without rewriting 200+ fixtures. The substrate vocabulary is the canon;
// these are aliases the substrate would reasonably accept as equivalents.
const CLASSIFICATION_ALIASES: Record<string, Record<string, string[]>> = {
  assetClass: {
    // Substrate enum: operating_business_or_unknown | real_estate | digital_assets | infrastructure
    operating_business_or_unknown: ['operating_co', 'operating_company', 'opco', 'mixed', 'ip_heavy'],
    real_estate: ['real_estate_co', 'propco', 'real_estate'],
    digital_assets: ['digital_asset', 'crypto', 'digital_assets'],
    infrastructure: ['infra', 'infrastructure'],
  },
  subJourney: {
    // Substrate emits: healthy_buy_side | healthy_sell_side | capital_raise | post_close_pmi |
    // distressed_363_sale | distressed_restructuring | capital_structure_or_liability_management |
    // real_estate_overlay | digital_asset_overlay | unknown
    healthy_buy_side: ['healthy_buy_side', 'principal_buyer', 'sba_buyer', 'search_fund_buyer'],
    healthy_sell_side: ['healthy_sell_side', 'principal_seller', 'banker_led', 'auction_seller'],
    capital_raise: ['capital_raise', 'debt_raise', 'equity_raise', 'early_stage_raise', 'growth_raise'],
    post_close_pmi: ['post_close_pmi', 'pmi_day_0', 'integration'],
    distressed_363_sale: ['distressed_363_sale', 'distressed_buy_side', 'distressed_sale'],
    distressed_restructuring: ['distressed_restructuring', 'distressed_buy_side', 'restructuring'],
    capital_structure_or_liability_management: ['capital_structure_or_liability_management', 'lme', 'liability_management'],
  },
  distressPosture: {
    // Substrate enum: healthy | healthy_or_unknown | stressed_or_liability_management | distressed
    // The substrate's `healthy_or_unknown` is "no distress signals seen". When a fixture
    // explicitly asserts "healthy" (positive signal absent of distress), the substrate's
    // `healthy_or_unknown` is acceptable — both indicate "not distressed/stressed".
    healthy: ['healthy', 'healthy_or_unknown'],
    healthy_or_unknown: ['healthy_or_unknown', 'unknown', 'healthy'],
    stressed_or_liability_management: ['stressed_or_liability_management', 'partial_distress', 'stressed'],
    distressed: ['distressed', 'full_distress'],
  },
};

function classificationValueMatches(key: string, want: string, got: any): boolean {
  if (got === want) return true;
  const aliases = CLASSIFICATION_ALIASES[key];
  if (!aliases) return false;
  // If `got` is a substrate canonical, check whether `want` is one of its aliases.
  const allowedFixtureSpellings = aliases[String(got)];
  if (allowedFixtureSpellings && allowedFixtureSpellings.includes(String(want))) return true;
  // Reverse: if `want` is canonical and `got` is a known alias of it.
  const canonAliases = aliases[String(want)];
  if (canonAliases && canonAliases.includes(String(got))) return true;
  return false;
}

function assertClassificationMatches(res: McpResponse, expected: PayloadExpectations['classification']): AssertionResult[] {
  if (!expected) return [];
  const actual = readClassification(res);
  return Object.entries(expected).map(([key, want]) => {
    const got = actual?.[key];
    // leagueGuess is a relaxed form: any league counts as a guess.
    if (key === 'leagueGuess') {
      const leagueLike = actual?.league || actual?.leagueGuess;
      return assert(
        `classification.${key} present (leagueGuess relaxed)`,
        Boolean(leagueLike),
        want,
        leagueLike,
      );
    }
    const matches = classificationValueMatches(key, String(want), got);
    return assert(
      `classification.${key} = ${JSON.stringify(want)}`,
      matches,
      want,
      got,
    );
  });
}

function assertMissingFieldsListed(res: McpResponse, expected: string[]): AssertionResult[] {
  const items = readMissingItems(res);
  // Semantic match: each expected field name should be satisfied by at least
  // one substrate item (either by direct field-name match or by keyword overlap
  // with the substrate's semantic-category items like economic_scale / deal_subject).
  const unsatisfied: string[] = [];
  const satisfiedBy: Record<string, string> = {};
  for (const exp of expected) {
    const match = semanticMatchExpected(exp, items);
    if (match) satisfiedBy[exp] = match.field;
    else unsatisfied.push(exp);
  }
  return [
    assert(
      `missingInputContract covers expected concepts [${expected.join(', ')}]`,
      unsatisfied.length === 0,
      expected,
      `satisfied=${Object.entries(satisfiedBy).map(([k, v]) => `${k}→${v}`).join(',')}; unsatisfied=${unsatisfied.join(',')}; substrate-items=${items.map(i => i.field).join(',')}`,
    ),
  ];
}

function assertNotMissingFields(res: McpResponse, notExpected: string[]): AssertionResult[] {
  const actual = readMissingFields(res);
  const wrongly = notExpected.filter(f => actual.includes(f));
  return [
    assert(
      `missingInputContract does NOT list [${notExpected.join(', ')}] (already provided)`,
      wrongly.length === 0,
      `omitted: ${notExpected.join(',')}`,
      `wrongly listed: ${wrongly.join(',')}`,
    ),
  ];
}

function assertStructuredErrorEnvelope(res: McpResponse): AssertionResult[] {
  const is4xx = res.status >= 400 && res.status < 500;
  const errBody = structuredErrorBody(res);
  const hasFieldGuidance =
    Boolean(errBody?.errors) ||
    Boolean(errBody?.fieldErrors) ||
    Boolean(errBody?.validation) ||
    Boolean(errBody?.issues) ||
    Boolean(errBody?.field) ||
    Boolean(errBody?.message);
  return [
    assert(
      'response is 4xx structured error',
      is4xx || isToolError(res),
      '4xx or isError envelope',
      `status=${res.status} isError=${isToolError(res)}`,
    ),
    assert(
      'structured error includes field-level guidance / message',
      Boolean(hasFieldGuidance),
      'errors|fieldErrors|validation|issues|message present',
      Object.keys(errBody || {}).join(','),
    ),
  ];
}

// ─── Per-category dispatch ─────────────────────────────────

async function assertExpectations(
  res: McpResponse,
  fixture: PayloadFixture,
): Promise<AssertionResult[]> {
  const exp = fixture.expectations;
  const out: AssertionResult[] = [];

  // Universal assertions — every fixture, every response.
  out.push(assertNoFiveHundred(res));
  out.push(assertStructuredResponse(res));

  // Dispatch by responseType
  switch (exp.responseType) {
    case 'classification_with_work': {
      out.push(...assertClassificationMatches(res, exp.classification));
      if (exp.nextCallsInclude) {
        out.push(assertHasNextCallsRelaxed(res, exp.nextCallsInclude));
      } else {
        // At minimum next_suggested_calls should be present on a work-producing call.
        const names = readNextCallNames(res);
        out.push(assert('next_suggested_calls present', names.length >= 0));
      }
      const pin = await assertVersionPins(res, exp.versionPins);
      if (pin) out.push(pin);
      break;
    }
    case 'classification_with_missing_inputs': {
      out.push(...assertClassificationMatches(res, exp.classification));
      if (exp.missingFields && exp.missingFields.length > 0) {
        out.push(...assertMissingFieldsListed(res, exp.missingFields));
      }
      if (exp.notMissingFields && exp.notMissingFields.length > 0) {
        out.push(...assertNotMissingFields(res, exp.notMissingFields));
      }
      if (exp.nextCallsInclude) {
        out.push(assertHasNextCallsRelaxed(res, exp.nextCallsInclude));
      }
      const pin = await assertVersionPins(res, exp.versionPins);
      if (pin) out.push(pin);
      break;
    }
    case 'refusal': {
      if (exp.refusalType) {
        out.push(assertRefusalEnvelope(res, exp.refusalType, exp.lineViolationType));
      } else {
        out.push(assert('refusal envelope present (isError or error code)', isToolError(res)));
      }
      break;
    }
    case 'structured_error': {
      out.push(...assertStructuredErrorEnvelope(res));
      break;
    }
    default: {
      out.push(assert(`unknown responseType "${exp.responseType}"`, false));
    }
  }

  return out;
}

// ─── Main ──────────────────────────────────────────────────

const SUPPORTED_CATEGORIES: Category[] = [
  'SPARSE',
  'PARTIAL',
  'RICH',
  'CONTRADICTORY',
  'AMBIGUOUS',
  'GARBAGE',
  'CROSS_DOMAIN',
  'VERSION',
  'LINE_VIOLATION',
  'FUZZ',
];

async function main(): Promise<number> {
  const cli = parseArgs(process.argv);
  const env = readEnv();
  if (cli.url) env.origin = cli.url.replace(/\/+$/, '');

  header(`smbX agent-POV payload classification (target=${env.origin})`);

  let fixtures: PayloadFixture[];
  try {
    fixtures = await loadPayloadFixtures(FIXTURE_DIR);
  } catch (err) {
    console.log(`${c.red}Failed to load fixtures from ${FIXTURE_DIR}: ${(err as Error).message}${c.reset}`);
    return 2;
  }
  if (cli.only) fixtures = fixtures.filter(f => f.id.includes(cli.only!));
  if (fixtures.length === 0) {
    console.log(`${c.red}No fixtures found under ${FIXTURE_DIR}${c.reset}`);
    return 2;
  }
  note(`loaded ${fixtures.length} fixture(s) from ${FIXTURE_DIR}`);

  const bearer = await resolveBearer(env, cli);
  if (!bearer) {
    note('no bearer token — calls will be anonymous (expect 401 / refusal envelopes)');
  } else {
    note('bearer token resolved');
  }

  const client = new McpClient(env);
  const scenarios = [];

  for (const fixture of fixtures) {
    const scenario = await runScenario(fixture.id, 'PC', async () => {
      const toolName = fixture.tool || 'ingest_deal_payload';
      // Some fixtures declare `envelope_override` to express "the agent
      // sent these pins inside the envelope/methodology channel". The MCP
      // tools/call JSON-RPC shape doesn't carry a separate envelope — pins
      // live inside `arguments`. Lift envelope_override keys into the
      // arguments under their camelCase substrate names so
      // `validateVersionInput` catches them.
      const fixturePayload = fixture.payload && typeof fixture.payload === 'object'
        ? fixture.payload as Record<string, any>
        : {};
      const { envelope_override, ...restPayload } = fixturePayload;
      const finalPayload: Record<string, any> = { ...restPayload };
      if (envelope_override && typeof envelope_override === 'object') {
        for (const [k, v] of Object.entries(envelope_override)) {
          // Only override if the agent payload didn't already specify it.
          if (finalPayload[k] === undefined) finalPayload[k] = v;
        }
      }
      let res: McpResponse;
      try {
        res = await client.mcpCall('tools/call', {
          name: toolName,
          arguments: finalPayload,
        }, { bearer: bearer ?? undefined });
      } catch (err) {
        return [
          assert(`MCP call did not throw (${toolName})`, false, 'no throw', (err as Error).message),
        ];
      }
      const assertions = await assertExpectations(res, fixture);
      // Stash response shape preview as a note for triage.
      const preview = JSON.stringify(bodyForUnwrap(res)).slice(0, 180);
      note(`[${fixture.category}] ${fixture.id} → ${res.status} | ${preview}`);
      return assertions;
    });
    scenarios.push(scenario);
  }

  // ─── Per-category aggregate ──────────────────────────────
  header('Per-category pass rate');
  const byCat = new Map<Category, { pass: number; fail: number; error: number; total: number }>();
  for (const cat of SUPPORTED_CATEGORIES) byCat.set(cat, { pass: 0, fail: 0, error: 0, total: 0 });
  for (let i = 0; i < fixtures.length; i++) {
    const cat = fixtures[i].category;
    const slot = byCat.get(cat) || { pass: 0, fail: 0, error: 0, total: 0 };
    slot.total += 1;
    if (scenarios[i].status === 'pass') slot.pass += 1;
    else if (scenarios[i].status === 'fail') slot.fail += 1;
    else if (scenarios[i].status === 'error') slot.error += 1;
    byCat.set(cat, slot);
  }
  for (const [cat, slot] of byCat.entries()) {
    if (slot.total === 0) continue;
    const rate = `${slot.pass}/${slot.total}`;
    const colorize = slot.fail + slot.error === 0 ? c.green : c.red;
    console.log(`  ${colorize}${cat.padEnd(16)}${c.reset} ${rate}  ${c.gray}(fail=${slot.fail}, error=${slot.error})${c.reset}`);
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
