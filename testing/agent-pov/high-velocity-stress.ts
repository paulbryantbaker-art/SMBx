#!/usr/bin/env npx tsx
/**
 * High-Velocity Multi-Agent Substrate Stress Harness
 *
 * Spawns N beneficial customers × M agents each, then hammers /mcp with a
 * randomized mix of scenarios drawn from the substrate's full contract
 * surface. Validates that gating, refusals, cross-customer isolation, and
 * audit attribution all hold under realistic concurrent load.
 *
 * Live terminal UI shows throughput, per-scenario pass rate, latency
 * percentiles, per-customer agent activity, and a tape of recent calls.
 * Post-flight pass queries agency_usage_events to confirm every audit row
 * is attributed to the calling agent (no cross-pollination from races).
 *
 * Config via env:
 *   HVT_CUSTOMERS     (default 10)
 *   HVT_AGENTS_PER    (default 3)
 *   HVT_CONCURRENCY   (default 20)
 *   HVT_DURATION      (default 30 seconds)
 *
 * Usage:
 *   TEST_MODE=true npx tsx testing/agent-pov/high-velocity-stress.ts
 *   HVT_CUSTOMERS=20 HVT_DURATION=60 npx tsx testing/agent-pov/high-velocity-stress.ts
 */

import 'dotenv/config';
import { randomBytes } from 'node:crypto';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import jwt from 'jsonwebtoken';
import postgres from 'postgres';
import { McpClient, readEnv } from './runner-helpers.js';

// ─── Config ────────────────────────────────────────────────────────────────

const NUM_CUSTOMERS = Number(process.env.HVT_CUSTOMERS || 10);
const AGENTS_PER_CUSTOMER = Number(process.env.HVT_AGENTS_PER || 3);
const CONCURRENCY = Number(process.env.HVT_CONCURRENCY || 20);
const DURATION_SEC = Number(process.env.HVT_DURATION || 30);
const RUN_ID = randomBytes(4).toString('hex');

// Canonical full-agent scope set (mirrors cross-customer-security harness).
// Anything narrower trips a 403 insufficient_scope on common tools.
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
];

// ─── Types ─────────────────────────────────────────────────────────────────

interface Customer {
  customerId: string;
  userId: number;
  agents: Agent[];
  primaryDealStateCid: string | null;
  primaryDealId: number | null;
}

interface Agent {
  customer: Customer;
  agentLabel: string;
  agentId: string;
  mandateId: string;
  bearer: string;
  inFlight: boolean;
}

interface ScenarioResult {
  customerId: string;
  agentLabel: string;
  scenario: string;
  tool: string;
  durMs: number;
  status: number;
  outcome: string;
  pass: boolean;
  expected: string;
}

// ─── Setup ─────────────────────────────────────────────────────────────────

async function seedCustomers(sql: ReturnType<typeof postgres>, env: ReturnType<typeof readEnv>): Promise<Customer[]> {
  const customers: Customer[] = [];
  const origin = env.origin.replace(/\/+$/, '');
  for (let i = 0; i < NUM_CUSTOMERS; i++) {
    const customerId = `hvt:${RUN_ID}:c${String(i + 1).padStart(2, '0')}`;
    const email = `hvt-${RUN_ID}-c${i + 1}@smbx.test`;
    const trialEnd = new Date(Date.now() + 7 * 86400_000).toISOString();
    const [user] = await sql`
      INSERT INTO users (email, display_name, role, is_advisor, league, plan, trial_ends_at, created_at, updated_at)
      VALUES (${email}, ${`HVT ${customerId}`}, 'user', true, 'L4', 'enterprise', ${trialEnd}, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET plan = 'enterprise', updated_at = NOW()
      RETURNING id
    `;
    const userId = Number(user.id);

    const agents: Agent[] = [];
    for (let j = 0; j < AGENTS_PER_CUSTOMER; j++) {
      const agentId = `agent:${customerId}:a${j + 1}`;
      const mandateId = `mandate:${customerId}:a${j + 1}`;
      const bearer = jwt.sign(
        {
          userId,
          tokenUse: 'definitive_agent',
          scopes: FULL_AGENT_SCOPES,
          agentId,
          agentPlatformId: 'hvt-orchestrator',
          mandateId,
          beneficialCustomerId: customerId,
        },
        env.jwtSecret!,
        { expiresIn: '1h', audience: `${origin}/mcp`, issuer: origin },
      );
      agents.push({
        customer: null as any,
        agentLabel: `C${String(i + 1).padStart(2, '0')}/A${j + 1}`,
        agentId,
        mandateId,
        bearer,
        inFlight: false,
      });
    }

    const customer: Customer = {
      customerId,
      userId,
      agents,
      primaryDealStateCid: null,
      primaryDealId: null,
    };
    for (const a of agents) a.customer = customer;
    customers.push(customer);
  }
  return customers;
}

async function seedPrimaryDeals(sql: ReturnType<typeof postgres>, client: McpClient, customers: Customer[]) {
  // (1) Insert a deals row per customer so cross-customer get_deal_state has a target.
  // (2) Have the primary agent call ingest_deal_payload to populate a DealState snapshot.
  for (const c of customers) {
    const [dealRow] = await sql`
      INSERT INTO deals (
        user_id, journey_type, current_gate, league, industry, jurisdiction,
        business_name, name, deal_type, revenue, sde, ebitda, asking_price,
        financials, status, created_at, updated_at
      ) VALUES (
        ${c.userId}, 'buy', 'B1', 'L4', 'B2B services', 'US-TX',
        ${`HVT ${c.customerId} primary`}, ${`HVT ${c.customerId} primary`},
        'lower-middle-market acquisition',
        8000000, 2500000, 2200000, 12000000,
        ${sql.json({ source: 'hvt-stress', runId: RUN_ID })}::jsonb,
        'active', NOW(), NOW()
      )
      RETURNING id
    `;
    c.primaryDealId = Number(dealRow.id);

    const res = await client.mcpCall('tools/call', {
      name: 'ingest_deal_payload',
      arguments: {
        journey: 'buy',
        target_industry: 'B2B services',
        target_jurisdiction: 'US-TX',
        target_sde: 2_500_000_00,
        target_revenue: 8_000_000_00,
        dealId: c.primaryDealId,
      },
    }, { bearer: c.agents[0].bearer });
    const body: any = res.body;
    const sc = body?.result?.structuredContent;
    c.primaryDealStateCid = sc?.result?.result?.dealState?.cid
      ?? sc?.result?.dealState?.cid
      ?? null;
  }
}

// ─── Scenario library ──────────────────────────────────────────────────────

interface Scenario {
  name: string;
  tool: string;
  weight: number;
  expected: string;
  build: (ctx: { customer: Customer; agent: Agent; victim?: Customer }) => Record<string, any>;
}

const SCENARIOS: Scenario[] = [
  {
    name: 'happy_classify',
    tool: 'ingest_deal_payload',
    weight: 25,
    expected: 'ok',
    build: () => {
      const journey = ['buy', 'sell', 'raise'][Math.floor(Math.random() * 3)];
      const industry = ['B2B services', 'healthcare', 'manufacturing', 'logistics', 'specialty chemicals'][Math.floor(Math.random() * 5)];
      const jurisdiction = 'US-' + ['TX', 'CA', 'NY', 'FL', 'IL'][Math.floor(Math.random() * 5)];
      return {
        journey,
        target_industry: industry,
        target_jurisdiction: jurisdiction,
        target_sde: Math.floor(Math.random() * 5_000_000_00) + 500_000_00,
        target_revenue: Math.floor(Math.random() * 20_000_000_00) + 1_000_000_00,
      };
    },
  },
  {
    name: 'happy_lookup_citation',
    tool: 'lookup_citation',
    weight: 10,
    expected: 'ok',
    build: () => ({
      category: ['irc_sections', 'treasury_regulations', 'bankruptcy_code', 'tax_guidance_and_rates'][Math.floor(Math.random() * 4)],
      query: ['fair market value', '§1060', 'goodwill', 'allocation', 'restructuring'][Math.floor(Math.random() * 5)],
    }),
  },
  {
    name: 'happy_compose_stack',
    tool: 'compose_model_stack',
    weight: 10,
    expected: 'ok',
    build: (ctx) => ({
      dealId: ctx.customer.primaryDealId || 0,
      journey: 'buy',
      league: 'L4',
      signals: {},
    }),
  },
  {
    name: 'happy_get_own_deal',
    tool: 'get_deal_state',
    weight: 15,
    expected: 'ok',
    // Read by stateCid (content address) — that's the canonical lookup path.
    // dealId lookup only works when the DealState was persisted with an
    // explicit deal_id linkage, which is a separate write path.
    build: (ctx) => ({ stateCid: ctx.customer.primaryDealStateCid }),
  },
  {
    name: 'line_violation_negotiate',
    tool: 'execute_model',
    weight: 5,
    expected: 'LINE_VIOLATION',
    build: () => ({
      model_id: 'NEGOTIATION.PRICE.v1',
      inputs: { current_offer_cents: 5_000_000_00 },
    }),
  },
  {
    name: 'counsel_review_fairness',
    tool: 'execute_model',
    weight: 5,
    expected: 'counsel_review_required',
    build: (ctx) => ({
      deal_id: ctx.customer.primaryDealId,
      ask: 'issue a fairness opinion that the $42M consideration is fair to minority shareholders',
    }),
  },
  {
    name: 'counsel_review_appraisal',
    tool: 'execute_model',
    weight: 5,
    expected: 'counsel_review_required',
    build: (ctx) => ({
      deal_id: ctx.customer.primaryDealId,
      ask: 'give me the fair-market-value appraisal of this business for the §170 charitable-contribution claim',
    }),
  },
  {
    name: 'version_pin_mismatch',
    tool: 'ingest_deal_payload',
    weight: 5,
    expected: 'unsupported_version',
    build: () => ({
      journey: 'buy',
      methodology_version: 'V99',
      target_industry: 'B2B services',
      target_jurisdiction: 'US-TX',
    }),
  },
  {
    name: 'credit_budget_simulate',
    tool: 'execute_model',
    weight: 5,
    expected: 'credit_budget_required',
    build: (ctx) => ({
      deal_id: ctx.customer.primaryDealId,
      model_id: 'MODEL.VALUATION_DCF.v1',
      simulate_over_budget: true,
    }),
  },
  {
    name: 'human_approval_finalize',
    tool: 'finalize_deal_package',
    weight: 5,
    expected: 'human_approval_required',
    build: (ctx) => ({
      dealPackage: { packageCid: 'definitive:deal-package:sha256:fake', schema: 'DealPackage.v0.1' },
      dealState: { cid: ctx.customer.primaryDealStateCid || 'definitive:deal-state:sha256:fake' },
    }),
  },
  {
    name: 'cross_customer_get_deal',
    tool: 'get_deal_state',
    weight: 10,
    expected: 'not_found',
    build: (ctx) => ({ dealId: ctx.victim?.primaryDealId ?? 999_999_999 }),
  },
];

const TOTAL_WEIGHT = SCENARIOS.reduce((s, x) => s + x.weight, 0);
function pickScenario(): Scenario {
  let r = Math.random() * TOTAL_WEIGHT;
  for (const s of SCENARIOS) {
    r -= s.weight;
    if (r <= 0) return s;
  }
  return SCENARIOS[0];
}

// ─── Worker ────────────────────────────────────────────────────────────────

async function runScenario(
  client: McpClient,
  customer: Customer,
  agent: Agent,
  scenario: Scenario,
  allCustomers: Customer[],
): Promise<ScenarioResult> {
  let victim: Customer | undefined;
  if (scenario.name === 'cross_customer_get_deal') {
    const others = allCustomers.filter(c => c !== customer);
    if (others.length > 0) victim = others[Math.floor(Math.random() * others.length)];
  }
  const args = scenario.build({ customer, agent, victim });
  agent.inFlight = true;
  const t0 = Date.now();
  let res: any;
  try {
    res = await client.mcpCall('tools/call', { name: scenario.tool, arguments: args }, { bearer: agent.bearer });
  } catch (err: any) {
    agent.inFlight = false;
    return {
      customerId: customer.customerId,
      agentLabel: agent.agentLabel,
      scenario: scenario.name,
      tool: scenario.tool,
      durMs: Date.now() - t0,
      status: 0,
      outcome: `network_error`,
      pass: false,
      expected: scenario.expected,
    };
  }
  agent.inFlight = false;
  const durMs = Date.now() - t0;
  const sc = res.body?.result?.structuredContent;
  const inner = sc?.result;
  // Known structured refusal codes — these take priority over free-text
  // error messages so we match the substrate's contract code (e.g.
  // `credit_budget_required`) instead of its human message (e.g.
  // "Credit budget exhausted for the current billing period").
  const REFUSAL_CODES = new Set([
    'LINE_VIOLATION', 'counsel_review_required', 'credit_budget_required',
    'human_approval_required', 'enterprise_scope_required',
    'unsupported_version', 'not_found', 'unauthorized', 'insufficient_scope',
  ]);
  let outcome: string;
  const innerLine = inner?.lineStatus;
  const scLine = sc?.lineStatus;
  const innerErr = inner?.error;
  const scErr = sc?.error;
  if (REFUSAL_CODES.has(innerLine)) outcome = innerLine;
  else if (REFUSAL_CODES.has(scLine)) outcome = scLine;
  else if (REFUSAL_CODES.has(innerErr)) outcome = innerErr;
  else if (REFUSAL_CODES.has(scErr)) outcome = scErr;
  else if (typeof innerErr === 'string' && innerErr.length > 0) outcome = innerErr;
  else if (typeof scErr === 'string' && scErr.length > 0) outcome = scErr;
  else if (res.status === 404) outcome = 'not_found';
  else if (res.status >= 500) outcome = 'server_error';
  else if (innerLine && innerLine !== 'ok') outcome = innerLine;
  else if (scLine && scLine !== 'ok') outcome = scLine;
  else outcome = 'ok';
  // Pass check.
  let pass = false;
  if (scenario.expected === 'ok') {
    pass = res.status === 200 && outcome === 'ok';
  } else if (scenario.expected === 'not_found') {
    // Cross-customer: substrate must NOT return the victim's deal.
    // Acceptable outcomes: 404 not_found, OR a 200 with ok=true but the
    // returned state is the caller's primary (because dealId fell through).
    // The CRITICAL invariant is that we never see the victim's state.
    const returnedCid = inner?.result?.dealState?.cid || inner?.dealState?.cid;
    const victimCid = victim?.primaryDealStateCid;
    if (outcome === 'not_found' || res.status === 404) {
      pass = true;
    } else if (returnedCid && victimCid && returnedCid === victimCid) {
      pass = false; // LEAK
    } else {
      pass = true; // not 404 but also didn't leak the victim's state
    }
  } else {
    pass = String(outcome) === scenario.expected;
  }
  return {
    customerId: customer.customerId,
    agentLabel: agent.agentLabel,
    scenario: scenario.name,
    tool: scenario.tool,
    durMs,
    status: res.status,
    outcome: String(outcome).slice(0, 28),
    pass,
    expected: scenario.expected,
  };
}

// ─── TUI ───────────────────────────────────────────────────────────────────

const C = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m',
  blue: '\x1b[34m', magenta: '\x1b[35m', cyan: '\x1b[36m',
  hideCursor: '\x1b[?25l', showCursor: '\x1b[?25h',
  clear: '\x1b[2J\x1b[H', home: '\x1b[H',
};

function visibleLen(s: string): number {
  return s.replace(/\x1b\[[0-9;]*m/g, '').length;
}
function padRightVisible(s: string, width: number): string {
  const need = width - visibleLen(s);
  return s + ' '.repeat(Math.max(0, need));
}

function renderTUI(state: {
  startMs: number;
  customers: Customer[];
  results: ScenarioResult[];
  tape: ScenarioResult[];
}) {
  const elapsed = (Date.now() - state.startMs) / 1000;
  const total = state.results.length;
  const passes = state.results.filter(r => r.pass).length;
  const fails = total - passes;
  const rate = total / Math.max(elapsed, 0.001);
  const passPct = total > 0 ? (passes * 100 / total) : 0;
  const passColor = fails === 0 ? C.green : (passPct >= 99 ? C.yellow : C.red);

  const byScenario = new Map<string, { pass: number; fail: number; total: number }>();
  for (const r of state.results) {
    const slot = byScenario.get(r.scenario) || { pass: 0, fail: 0, total: 0 };
    slot.total += 1;
    if (r.pass) slot.pass += 1; else slot.fail += 1;
    byScenario.set(r.scenario, slot);
  }
  const latencies = state.results.map(r => r.durMs).sort((a, b) => a - b);
  const p = (q: number) => latencies[Math.min(latencies.length - 1, Math.floor(latencies.length * q))] || 0;

  const lines: string[] = [];
  const HR = '━'.repeat(82);
  lines.push(`${C.bold}${C.cyan}${HR}${C.reset}`);
  lines.push(`  ${C.bold}smbX DEFINITIVE — High-Velocity Multi-Agent Substrate Stress Test${C.reset}`);
  lines.push(`  Elapsed: ${C.bold}${elapsed.toFixed(1)}s${C.reset} / ${DURATION_SEC}s  •  Customers: ${C.bold}${state.customers.length}${C.reset}  •  Agents: ${C.bold}${state.customers.length * AGENTS_PER_CUSTOMER}${C.reset}  •  Concurrency: ${CONCURRENCY}`);
  lines.push(`${C.bold}${C.cyan}${HR}${C.reset}`);
  lines.push('');

  // Throughput
  lines.push(`┌─ Throughput ${'─'.repeat(67)}┐`);
  const tpLine = `  Calls: ${C.bold}${total}${C.reset}   Rate: ${C.bold}${rate.toFixed(1)}/s${C.reset}   Pass: ${passColor}${passes}${C.reset}   Fail: ${fails > 0 ? C.red : C.dim}${fails}${C.reset}   ${passColor}${passPct.toFixed(2)}%${C.reset}`;
  lines.push(`│${padRightVisible(tpLine, 80)}│`);
  lines.push(`└${'─'.repeat(80)}┘`);
  lines.push('');

  // Scenario mix
  lines.push(`┌─ Scenario mix ${'─'.repeat(65)}┐`);
  const sortedScenarios = SCENARIOS.map(s => [s.name, byScenario.get(s.name) || { pass: 0, fail: 0, total: 0 }] as const);
  for (const [name, slot] of sortedScenarios) {
    const rate = slot.total > 0 ? (slot.pass * 100 / slot.total) : 0;
    const barLen = Math.floor(rate / 5);
    const bar = '█'.repeat(barLen) + '░'.repeat(20 - barLen);
    const col = slot.total === 0 ? C.dim : rate === 100 ? C.green : rate >= 95 ? C.yellow : C.red;
    const line = `  ${name.padEnd(26)} ${col}${bar}${C.reset}  ${String(slot.pass).padStart(4)}/${String(slot.total).padStart(4)}  ${col}${rate.toFixed(1).padStart(5)}%${C.reset}`;
    lines.push(`│${padRightVisible(line, 80)}│`);
  }
  lines.push(`└${'─'.repeat(80)}┘`);
  lines.push('');

  // Latency
  lines.push(`┌─ Latency (ms) ${'─'.repeat(65)}┐`);
  const lat = `  p50: ${C.bold}${p(0.5)}${C.reset}    p95: ${C.bold}${p(0.95)}${C.reset}    p99: ${C.bold}${p(0.99)}${C.reset}    max: ${C.bold}${latencies[latencies.length - 1] || 0}${C.reset}`;
  lines.push(`│${padRightVisible(lat, 80)}│`);
  lines.push(`└${'─'.repeat(80)}┘`);
  lines.push('');

  // Agent grid (5 customers per row)
  lines.push(`┌─ Agents (${C.green}●${C.reset} = in flight, ${C.dim}○${C.reset} = idle) ${'─'.repeat(50)}┐`);
  for (let row = 0; row < state.customers.length; row += 5) {
    const cells: string[] = [];
    for (let i = row; i < Math.min(row + 5, state.customers.length); i++) {
      const c = state.customers[i];
      const dots = c.agents.map(a => a.inFlight ? `${C.green}●${C.reset}` : `${C.dim}○${C.reset}`).join('');
      cells.push(`C${String(i + 1).padStart(2, '0')} ${dots}`);
    }
    const line = '  ' + cells.join('   ');
    lines.push(`│${padRightVisible(line, 80)}│`);
  }
  lines.push(`└${'─'.repeat(80)}┘`);
  lines.push('');

  // Live tape
  lines.push(`┌─ Live tape (last 10) ${'─'.repeat(58)}┐`);
  const tape = state.tape.slice(-10);
  for (const r of tape) {
    const mark = r.pass ? `${C.green}✓${C.reset}` : `${C.red}✗${C.reset}`;
    const stat = r.status === 0 ? 'ERR ' : String(r.status).padEnd(4);
    const line = `  ${mark} ${r.agentLabel.padEnd(8)} ${r.tool.padEnd(24)} ${stat} ${r.outcome.padEnd(26)} ${String(r.durMs).padStart(4)}ms`;
    lines.push(`│${padRightVisible(line, 80)}│`);
  }
  for (let i = tape.length; i < 10; i++) {
    lines.push(`│${' '.repeat(80)}│`);
  }
  lines.push(`└${'─'.repeat(80)}┘`);

  process.stdout.write(C.home + lines.join('\n') + '\n');
}

// ─── Orchestrator ──────────────────────────────────────────────────────────

async function main() {
  const env = readEnv();
  if (!env.jwtSecret) {
    console.error('JWT_SECRET not set — cannot mint agent tokens.');
    process.exit(2);
  }
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set.');
    process.exit(2);
  }

  console.log(`[hvt:${RUN_ID}] Seeding ${NUM_CUSTOMERS} customers × ${AGENTS_PER_CUSTOMER} agents...`);
  const sql = postgres(process.env.DATABASE_URL!, { onnotice: () => {} });
  const customers = await seedCustomers(sql, env);
  const client = new McpClient(env);
  console.log(`[hvt:${RUN_ID}] Bootstrapping primary deals...`);
  await seedPrimaryDeals(sql, client, customers);
  console.log(`[hvt:${RUN_ID}] Starting stress test (${DURATION_SEC}s @ concurrency ${CONCURRENCY})...`);
  await new Promise(r => setTimeout(r, 800));

  const results: ScenarioResult[] = [];
  const tape: ScenarioResult[] = [];
  const startMs = Date.now();
  const endMs = startMs + DURATION_SEC * 1000;

  process.stdout.write(C.hideCursor + C.clear);
  let tuiTimer: NodeJS.Timeout | null = setInterval(() => {
    renderTUI({ startMs, customers, results, tape });
  }, 250);

  const inFlight = new Set<Promise<void>>();
  while (Date.now() < endMs) {
    while (inFlight.size < CONCURRENCY && Date.now() < endMs) {
      const c = customers[Math.floor(Math.random() * customers.length)];
      const a = c.agents[Math.floor(Math.random() * c.agents.length)];
      const s = pickScenario();
      const p = runScenario(client, c, a, s, customers).then(r => {
        results.push(r);
        tape.push(r);
        if (tape.length > 50) tape.shift();
      });
      const wrapped = p.finally(() => inFlight.delete(wrapped));
      inFlight.add(wrapped);
    }
    if (inFlight.size > 0) {
      await Promise.race(Array.from(inFlight));
    }
  }
  await Promise.all(inFlight);

  if (tuiTimer) clearInterval(tuiTimer);
  renderTUI({ startMs, customers, results, tape });
  process.stdout.write(C.showCursor);

  // Post-flight verifier
  console.log('\n\n' + C.bold + '━━ POST-FLIGHT AUDIT VERIFICATION ━━' + C.reset + '\n');
  const startedAt = new Date(startMs - 5000);
  let crossPollination = 0;
  let totalAuditRows = 0;
  for (const c of customers) {
    const rows = await sql`
      SELECT id, agent_id, mandate_id, tool_name
      FROM agency_usage_events
      WHERE user_id = ${c.userId} AND created_at >= ${startedAt}
    `;
    totalAuditRows += rows.length;
    const customerAgentIds = new Set(c.agents.map(a => a.agentId));
    const wrongAgent = rows.filter((r: any) => r.agent_id && !customerAgentIds.has(r.agent_id));
    if (wrongAgent.length > 0) {
      console.log(`  ${C.red}✗${C.reset} ${c.customerId}  ${wrongAgent.length} rows with foreign agent_id`);
      crossPollination += wrongAgent.length;
    } else {
      console.log(`  ${C.green}✓${C.reset} ${c.customerId}  ${rows.length.toString().padStart(4)} rows, all correctly attributed`);
    }
  }
  console.log(`\n  Total audit rows written: ${C.bold}${totalAuditRows}${C.reset}`);
  console.log(`  Cross-pollination issues: ${crossPollination === 0 ? C.green : C.red}${crossPollination}${C.reset}`);

  // Final summary
  const passes = results.filter(r => r.pass).length;
  const fails = results.length - passes;
  console.log('\n' + C.bold + '━━ FINAL SUMMARY ━━' + C.reset);
  console.log(`  Total calls:           ${results.length}`);
  console.log(`  Pass:                  ${C.green}${passes}${C.reset}  (${(passes * 100 / Math.max(1, results.length)).toFixed(2)}%)`);
  console.log(`  Fail:                  ${fails > 0 ? C.red : C.dim}${fails}${C.reset}`);
  console.log(`  Cross-pollination:     ${crossPollination === 0 ? C.green : C.red}${crossPollination}${C.reset}`);
  console.log(`  Throughput:            ${(results.length / ((Date.now() - startMs) / 1000)).toFixed(1)} calls/sec`);
  const lat = results.map(r => r.durMs).sort((a, b) => a - b);
  const pct = (q: number) => lat[Math.min(lat.length - 1, Math.floor(lat.length * q))] || 0;
  console.log(`  Latency p50/p95/p99:   ${pct(0.5)}ms / ${pct(0.95)}ms / ${pct(0.99)}ms`);

  // Artifact
  const resultsDir = 'testing/agent-pov/results';
  if (!existsSync(resultsDir)) mkdirSync(resultsDir, { recursive: true });
  const artifactPath = `${resultsDir}/high-velocity-${RUN_ID}.json`;
  writeFileSync(artifactPath, JSON.stringify({
    runId: RUN_ID,
    config: { customers: NUM_CUSTOMERS, agentsPerCustomer: AGENTS_PER_CUSTOMER, concurrency: CONCURRENCY, durationSec: DURATION_SEC },
    summary: {
      totalCalls: results.length,
      passes,
      fails,
      crossPollinationIssues: crossPollination,
      totalAuditRows,
      throughputCallsPerSec: results.length / ((Date.now() - startMs) / 1000),
      latencyP50Ms: pct(0.5),
      latencyP95Ms: pct(0.95),
      latencyP99Ms: pct(0.99),
    },
    perScenario: SCENARIOS.map(s => {
      const slot = results.filter(r => r.scenario === s.name);
      return {
        scenario: s.name,
        tool: s.tool,
        expected: s.expected,
        total: slot.length,
        passes: slot.filter(r => r.pass).length,
        fails: slot.filter(r => !r.pass).length,
      };
    }),
    last200: results.slice(-200),
  }, null, 2));
  console.log(`\n  Results: ${artifactPath}\n`);

  await sql.end();
  const exitCode = fails > 0 || crossPollination > 0 ? 1 : 0;
  process.exit(exitCode);
}

main().catch(err => {
  process.stdout.write(C.showCursor);
  console.error('\n[hvt] fatal:', err.stack || err.message || err);
  process.exit(2);
});
