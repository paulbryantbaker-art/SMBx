#!/usr/bin/env npx tsx
/**
 * Authenticated DEFINITIVE route smoke.
 *
 * This validates the protected API path that external/internal agents will use:
 * JWT -> /api/definitive/tools/* -> mandate chain -> governed tool -> route map.
 *
 * Run with the API server running:
 *   npm run dev:api
 *   npm run test:definitive-auth-route
 */

import 'dotenv/config';
import jwt from 'jsonwebtoken';
import { sql } from '../server/db.js';
import {
  DEFINITIVE_METHODOLOGY_URI,
  DEFINITIVE_SPEC_VERSION,
} from '../server/constants/definitive.js';

const BASE_URL = process.env.DEFINITIVE_TEST_BASE_URL || 'http://localhost:3000';
const FIXTURE_EMAIL = 'definitive-auth-route@smbx.test';
const FIXTURE_KEY = 'definitive-auth-route-smoke';

let passed = 0;
let failed = 0;

console.log('\nDEFINITIVE authenticated route smoke');
console.log(`Target: ${BASE_URL}`);

try {
  const fixture = await ensureFixture();
  const token = jwt.sign(
    { userId: fixture.userId },
    process.env.JWT_SECRET || process.env.SESSION_SECRET || 'dev-secret-change-me',
    { expiresIn: '30m' },
  );

  await test('Unauthenticated tool list is rejected', async () => {
    const response = await fetch(`${BASE_URL}/api/definitive/tools/list`);
    assertEqual(response.status, 401, 'unauthenticated status');
  });

  await test('Authenticated tool inventory is available', async () => {
    const body = await authedJson('/api/definitive/tools/list', token);
    assertEqual(body.status, 'internal_v0_1', 'tool inventory status');
    assert(body.tools.some((tool: any) => tool.name === 'compose_model_stack'), 'compose_model_stack is advertised');
  });

  await test('Unsupported spec version is refused before execution', async () => {
    const response = await postJson('/api/definitive/tools/validate_conformance/call', token, {
      specVersion: 'DEFINITIVE.v0.9',
      input: {},
    });
    assertEqual(response.status, 400, 'unsupported version status');
    assertEqual(response.body.error, 'unsupported_version', 'unsupported version error');
    assertEqual(response.body.expected, DEFINITIVE_SPEC_VERSION, 'unsupported version expected pin');
  });

  await test('Authenticated compose_model_stack returns live route map', async () => {
    const response = await postJson('/api/definitive/tools/call', token, {
      toolName: 'compose_model_stack',
      specVersion: DEFINITIVE_SPEC_VERSION,
      methodologyUri: DEFINITIVE_METHODOLOGY_URI,
      sourceAgent: 'definitive-auth-route-smoke',
      agentId: 'agent:definitive-auth-route-smoke',
      agentPlatformId: 'codex-local',
      requestedScopes: ['model-stack:compose', 'deal:read'],
      input: {
        dealId: fixture.dealId,
        journey: 'buy',
        league: 'L4',
        dealType: 'distressed real estate asset purchase with exchange offer',
        signals: {
          cashRunwayDays: 45,
          fccr: 0.82,
          securedDebtTradingPriceCents: 55,
          exchangeOffer: true,
          realEstatePercentOfEv: 42,
        },
      },
    });

    assertEqual(response.status, 200, 'compose status');
    assertEqual(response.body.ok, true, 'compose ok');
    assertEqual(response.body.toolName, 'compose_model_stack', 'compose tool name');
    assertEqual(response.body.specVersion, DEFINITIVE_SPEC_VERSION, 'compose spec version');
    assertEqual(response.body.mandateChain.principal.userId, fixture.userId, 'mandate user');
    assertEqual(response.body.mandateChain.agent.agentId, 'agent:definitive-auth-route-smoke', 'mandate agent');

    const stack = response.body.result?.stack;
    assert(stack, 'compose stack exists');
    const definitive = stack.definitive;
    assert(definitive, 'DEFINITIVE stack metadata exists');
    assertDeepEqual(definitive.triggeredOverlayGates, ['G28', 'G29', 'G30'], 'triggered overlay gates');
    assert(definitive.applicableMechanicsSummary.total > 0, 'applicable mechanics selected');
    assert(definitive.applicableMechanics.some((item: any) => item.slotId === 'M151'), 'G28 mechanics included');
    assert(definitive.applicableMechanics.some((item: any) => item.slotId === 'M160'), 'G29 mechanics included');
    assert(definitive.applicableMechanics.some((item: any) => item.slotId === 'M187'), 'G30 mechanics included');
    assert(definitive.yuliaMechanicsBrief.some((line: string) => line.includes('applicable DEFINITIVE mechanics')), 'Yulia brief included');
  });
} finally {
  await sql.end({ timeout: 5 }).catch(() => undefined);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);

async function ensureFixture(): Promise<{ userId: number; dealId: number }> {
  const trialEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const [user] = await sql`
    INSERT INTO users (email, display_name, role, is_advisor, league, plan, trial_ends_at, created_at, updated_at)
    VALUES (${FIXTURE_EMAIL}, 'DEFINITIVE Route Fixture', 'user', true, 'L4', 'enterprise', ${trialEnd}, NOW(), NOW())
    ON CONFLICT (email) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      is_advisor = true,
      league = 'L4',
      plan = 'enterprise',
      trial_ends_at = EXCLUDED.trial_ends_at,
      updated_at = NOW()
    RETURNING id
  `;
  const userId = Number(user.id);

  await sql`
    INSERT INTO subscriptions (user_id, plan, status, trial_end, trial_ends_at, created_at, updated_at)
    VALUES (${userId}, 'enterprise', 'trialing', ${trialEnd}, ${trialEnd}, NOW(), NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      plan = 'enterprise',
      status = 'trialing',
      trial_end = EXCLUDED.trial_end,
      trial_ends_at = EXCLUDED.trial_ends_at,
      updated_at = NOW()
  `.catch(() => undefined);

  const existing = await sql`
    SELECT id
    FROM deals
    WHERE user_id = ${userId}
      AND financials->>'fixture_key' = ${FIXTURE_KEY}
    LIMIT 1
  `;

  if (existing[0]?.id) {
    const dealId = Number(existing[0].id);
    await sql`
      UPDATE deals
      SET journey_type = 'buy',
          current_gate = 'B3',
          league = 'L4',
          industry = 'industrial services / real estate',
          jurisdiction = 'US-DE',
          business_name = 'DEFINITIVE Route Fixture Deal',
          name = 'DEFINITIVE Route Fixture Deal',
          deal_type = 'distressed real estate asset purchase',
          revenue = ${18_000_000_00},
          sde = ${2_500_000_00},
          ebitda = ${2_100_000_00},
          asking_price = ${13_500_000_00},
          financials = ${sql.json({ fixture_key: FIXTURE_KEY, real_estate_percent_of_ev: 42, source: 'definitive-auth-route-smoke' })}::jsonb,
          status = 'active',
          updated_at = NOW()
      WHERE id = ${dealId}
    `;
    return { userId, dealId };
  }

  const [deal] = await sql`
    INSERT INTO deals (
      user_id, journey_type, current_gate, league, industry, jurisdiction,
      business_name, name, deal_type, revenue, sde, ebitda, asking_price,
      financials, status, created_at, updated_at
    )
    VALUES (
      ${userId}, 'buy', 'B3', 'L4', 'industrial services / real estate', 'US-DE',
      'DEFINITIVE Route Fixture Deal', 'DEFINITIVE Route Fixture Deal',
      'distressed real estate asset purchase',
      ${18_000_000_00}, ${2_500_000_00}, ${2_100_000_00}, ${13_500_000_00},
      ${sql.json({ fixture_key: FIXTURE_KEY, real_estate_percent_of_ev: 42, source: 'definitive-auth-route-smoke' })}::jsonb,
      'active', NOW(), NOW()
    )
    RETURNING id
  `;
  return { userId, dealId: Number(deal.id) };
}

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err: any) {
    console.log(`  ✗ ${name} - ${err.message}`);
    failed++;
  }
}

async function authedJson(path: string, token: string) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await response.json().catch(() => ({}));
  assert(response.ok, `${path} expected ok status, got ${response.status}: ${JSON.stringify(body)}`);
  return body;
}

async function postJson(path: string, token: string, body: Record<string, any>) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return {
    status: response.status,
    body: await response.json().catch(() => ({})),
  };
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) {
    throw new Error(`${message}. Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertDeepEqual(actual: unknown, expected: unknown, message: string) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}. Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}
