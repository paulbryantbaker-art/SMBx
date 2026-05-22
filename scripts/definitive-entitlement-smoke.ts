#!/usr/bin/env npx tsx
/**
 * DEFINITIVE entitlement smoke.
 *
 * Local dev grants enterprise access through TEST_MODE / DEV_NO_PAYWALL so the
 * live API route intentionally cannot prove plan and credit-budget tollgates.
 * This direct service smoke disables that bypass inside the process and tests
 * the entitlement branch with a stable DB fixture.
 *
 * Run: npm run test:definitive-entitlements
 */

import 'dotenv/config';
import { sql } from '../server/db.js';
import {
  checkV19Entitlement,
  readV19UsageMeter,
} from '../server/services/v19EntitlementService.js';

const PRO_FIXTURE_EMAIL = 'definitive-entitlement-pro@smbx.test';
const FREE_FIXTURE_EMAIL = 'definitive-entitlement-free@smbx.test';
const FIXTURE_KEY = 'definitive-entitlement-smoke';

let passed = 0;
let failed = 0;

const originalTestMode = process.env.TEST_MODE;
const originalDevNoPaywall = process.env.DEV_NO_PAYWALL;
process.env.TEST_MODE = 'false';
process.env.DEV_NO_PAYWALL = 'false';

console.log('\nDEFINITIVE entitlement smoke');

try {
  const proUserId = await ensureUser(PRO_FIXTURE_EMAIL, 'pro');
  const freeUserId = await ensureUser(FREE_FIXTURE_EMAIL, 'free');
  await clearFixtureUsage(proUserId);

  await test('Pro fixture resolves to the real Pro entitlement outside dev bypass', async () => {
    const meter = await readV19UsageMeter(proUserId);
    assertEqual(meter.plan, 'pro', 'meter plan');
    assertEqual(meter.entitlements.monthlyApiCalls, 2500, 'pro api allowance');
    assertEqual(meter.entitlements.monthlyCreditBudget, 2500, 'pro credit allowance');
  });

  await test('Pro API call is allowed before the allowance is exhausted', async () => {
    const check = await checkV19Entitlement(proUserId, 'api_call', {
      actionId: 'definitive.execute_model',
      toolName: 'execute_model',
      sourceSurface: 'mcp',
    });
    assertEqual(check.allowed, true, 'pro api allowed');
    assertEqual(check.tollgate, null, 'pro api no tollgate');
  });

  await test('Pro API call returns a credit-budget tollgate after allowance exhaustion', async () => {
    await seedApiUsage(proUserId, 2500);
    const check = await checkV19Entitlement(proUserId, 'api_call', {
      actionId: 'definitive.execute_model',
      toolName: 'execute_model',
      sourceSurface: 'mcp',
    });
    assertEqual(check.allowed, false, 'budget check allowed');
    assertEqual(check.tollgate?.code, 'credit_budget_required', 'budget tollgate code');
    assertEqual(check.tollgate?.state, 'credit_budget_required', 'budget tollgate state');
    assertEqual(check.tollgate?.currentPlan, 'pro', 'budget current plan');
    assertEqual(check.tollgate?.usage?.used, 2500, 'budget usage used');
    assertEqual(check.tollgate?.usage?.requested, 1, 'budget usage requested');
    assertEqual(check.tollgate?.usage?.limit, 2500, 'budget usage limit');
  });

  await test('Free API access returns a plan-scope tollgate outside dev bypass', async () => {
    const check = await checkV19Entitlement(freeUserId, 'api_call', {
      actionId: 'definitive.compose_model_stack',
      toolName: 'compose_model_stack',
      sourceSurface: 'mcp',
    });
    assertEqual(check.allowed, false, 'free api allowed');
    assertEqual(check.tollgate?.code, 'enterprise_scope_required', 'free api tollgate code');
    assertEqual(check.tollgate?.currentPlan, 'free', 'free api current plan');
    assertEqual(check.tollgate?.requiredPlan, 'pro', 'free api required plan');
  });
} finally {
  if (originalTestMode === undefined) delete process.env.TEST_MODE;
  else process.env.TEST_MODE = originalTestMode;
  if (originalDevNoPaywall === undefined) delete process.env.DEV_NO_PAYWALL;
  else process.env.DEV_NO_PAYWALL = originalDevNoPaywall;
  await sql.end({ timeout: 5 }).catch(() => undefined);
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);

async function ensureUser(email: string, plan: 'free' | 'pro'): Promise<number> {
  const trialEnd = plan === 'pro' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null;
  const [user] = await sql`
    INSERT INTO users (email, display_name, role, is_advisor, league, plan, trial_ends_at, created_at, updated_at)
    VALUES (${email}, ${`DEFINITIVE ${plan.toUpperCase()} Entitlement Fixture`}, 'user', true, 'L4', ${plan}, ${trialEnd}, NOW(), NOW())
    ON CONFLICT (email) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      is_advisor = true,
      league = 'L4',
      plan = ${plan},
      trial_ends_at = EXCLUDED.trial_ends_at,
      updated_at = NOW()
    RETURNING id
  `;
  const userId = Number(user.id);

  await sql`
    INSERT INTO subscriptions (user_id, plan, status, trial_end, trial_ends_at, created_at, updated_at)
    VALUES (${userId}, ${plan}, 'trialing', ${trialEnd}, ${trialEnd}, NOW(), NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      plan = ${plan},
      status = 'trialing',
      trial_end = EXCLUDED.trial_end,
      trial_ends_at = EXCLUDED.trial_ends_at,
      updated_at = NOW()
  `.catch(() => undefined);

  return userId;
}

async function clearFixtureUsage(userId: number) {
  await sql`
    DELETE FROM agency_usage_events
    WHERE user_id = ${userId}
      AND metadata->>'fixture_key' = ${FIXTURE_KEY}
  `;
}

async function seedApiUsage(userId: number, quantity: number) {
  await clearFixtureUsage(userId);
  await sql`
    INSERT INTO agency_usage_events (
      user_id, action_id, tool_name, event_type, credit_cost, quantity, plan_key,
      billing_period_key, source_surface, actor_type, agent_id, agent_platform_id,
      mandate_id, mandate_chain, metadata, created_at
    )
    VALUES (
      ${userId},
      'fixture.api.limit',
      'execute_model',
      'v19.api_call',
      1,
      ${quantity},
      'pro',
      ${currentBillingPeriodKey()},
      'mcp',
      'agent',
      'agent:definitive-entitlement-smoke',
      'codex-local',
      'mandate:definitive-entitlement-smoke',
      ${sql.json({
        source: 'definitive-entitlement-smoke',
        principal: { userId },
        agent: {
          agentId: 'agent:definitive-entitlement-smoke',
          agentPlatformId: 'codex-local',
        },
        mandate: {
          mandateId: 'mandate:definitive-entitlement-smoke',
          requestedScopes: ['model:execute', 'audit:write'],
        },
      })}::jsonb,
      ${sql.json({ fixture_key: FIXTURE_KEY, source: 'definitive-entitlement-smoke' })}::jsonb,
      NOW()
    )
  `;
}

function currentBillingPeriodKey(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (error: any) {
    console.log(`  ✗ ${name} - ${error.message}`);
    failed++;
  }
}

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) {
    throw new Error(`${message}. Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}
