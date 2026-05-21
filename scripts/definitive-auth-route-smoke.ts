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
  DEFINITIVE_METHODOLOGY_VERSION,
  DEFINITIVE_SPEC_URI,
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

  await test('THE LINE inventory is available to authenticated agents', async () => {
    const body = await authedJson('/api/definitive/line/inventory', token);
    assertEqual(body.spec, DEFINITIVE_SPEC_VERSION, 'line inventory spec');
    assertEqual(body.status, 'internal_inventory', 'line inventory status');
    assert(body.summary.ok > 0, 'line inventory has ok actions');
    assert(body.inventory.some((item: any) => item.toolName === 'record_corpus_observation'), 'corpus action is in THE LINE inventory');
    assert(body.inventory.every((item: any) => Array.isArray(item.requiredScopes)), 'inventory exposes required scopes');
  });

  await test('Corpus observation types publish structured-only rules', async () => {
    const body = await authedJson('/api/definitive/corpus/observation-types', token);
    assertEqual(body.specVersion, DEFINITIVE_SPEC_VERSION, 'observation types spec');
    assertEqual(body.grantType, 'anonymized_benchmark_observations', 'observation grant type');
    assert(body.observationTypes.some((item: any) => item.type === 'escrow'), 'escrow observation type is supported');
    assert(body.observationTypes.every((item: any) => item.structuredOnly === true), 'all observation types are structured only');
    assert(body.observationTypes.every((item: any) => item.rawDocumentTextAllowed === false), 'raw document text is disallowed');
    assert(body.observationTypes.every((item: any) => item.partyIdentifiersAllowed === false), 'party identifiers are disallowed');
  });

  await test('Corpus rights can be read and granted through authenticated routes', async () => {
    await revokeFixtureDataRights(fixture.userId);

    const before = await authedJson('/api/definitive/corpus/rights', token);
    assertEqual(before.specVersion, DEFINITIVE_SPEC_VERSION, 'rights state spec');
    assertEqual(before.active, false, 'fixture starts without active benchmark grant');
    assertEqual(before.mandateChain.principal.userId, fixture.userId, 'rights mandate user');

    const grantResponse = await postJson('/api/definitive/corpus/rights/grants', token, {
      grantType: 'anonymized_benchmark_observations',
      source: 'test',
      sourceReference: FIXTURE_KEY,
      metadata: { fixture: true, source: 'definitive-auth-route-smoke' },
    });
    assertEqual(grantResponse.status, 200, 'grant status');
    assertEqual(grantResponse.body.ok, true, 'grant ok');
    assertEqual(grantResponse.body.grant.status, 'active', 'grant active');
    assertEqual(grantResponse.body.grant.grantType, 'anonymized_benchmark_observations', 'grant type');

    const after = await authedJson('/api/definitive/corpus/rights', token);
    assertEqual(after.active, true, 'rights active after grant');
    assert(after.grants.some((grant: any) => grant.sourceReference === FIXTURE_KEY && grant.status === 'active'), 'fixture grant is readable');
  });

  await test('Corpus observation route strips identifiers and records safe structured data', async () => {
    const response = await postJson('/api/definitive/corpus/observations', token, {
      dealId: fixture.dealId,
      observationType: 'escrow',
      observation: {
        escrowPercent: 10,
        ppaEscrowPercent: 1,
        rwi: false,
        sellerName: 'Sensitive Seller LLC',
        rawText: 'Do not store raw document language.',
        note: 'Median general indemnity escrow input from structured testing.',
      },
      anonymizationBucket: {
        industry: 'industrial services',
        league: 'L4',
        dealType: 'distressed real estate asset purchase',
        year: 2026,
        sellerName: 'Should not survive',
      },
      sourceArtifactType: 'route_smoke',
      sourceArtifactId: FIXTURE_KEY,
      minReleaseCount: 10,
      metadata: { fixture: true },
    });

    assertEqual(response.status, 200, 'corpus observation status');
    assertEqual(response.body.ok, true, 'corpus observation ok');
    assertEqual(response.body.observation.observationType, 'escrow', 'corpus observation type');
    assertEqual(response.body.releaseControl.rawDocumentTextAllowed, false, 'raw text remains disallowed');
    assertEqual(response.body.releaseControl.partyIdentifiersAllowed, false, 'party identifiers remain disallowed');
    assert(response.body.redactions.includes('sellerName'), 'seller name key was redacted');
    assert(response.body.redactions.includes('rawText'), 'raw text key was redacted');
    assert(!('sellerName' in response.body.observation.anonymizationBucket), 'bucket rejects identifying key');
    assertEqual(response.body.specVersion, DEFINITIVE_SPEC_VERSION, 'corpus observation spec');
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

  await test('Audit packet route returns pinned reproducibility payload', async () => {
    const auditTrailId = await ensureAuditTrailFixture(fixture.userId, fixture.dealId);
    const body = await authedJson(`/api/definitive/audit-packets/${auditTrailId}`, token);

    assertEqual(body.auditTrailId, auditTrailId, 'audit packet id');
    assertEqual(body.dealId, fixture.dealId, 'audit packet deal');
    assertEqual(body.specVersion, DEFINITIVE_SPEC_VERSION, 'audit packet spec');
    assertEqual(body.specUri, DEFINITIVE_SPEC_URI, 'audit packet spec uri');
    assertEqual(body.methodologyVersion, DEFINITIVE_METHODOLOGY_VERSION, 'audit packet methodology version');
    assertEqual(body.methodologyUri, DEFINITIVE_METHODOLOGY_URI, 'audit packet methodology uri');
    assertEqual(body.mandateChain.principal.userId, fixture.userId, 'audit packet mandate user');
    assertEqual(body.auditPacket.line, 'compute_only', 'audit packet THE LINE marker');
    assert(body.modelStack.triggeredOverlayGates.includes('G28'), 'audit packet carries route map');
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

async function revokeFixtureDataRights(userId: number) {
  await sql`
    UPDATE definitive_data_rights_grants
    SET status = 'revoked',
        revoked_at = NOW(),
        updated_at = NOW()
    WHERE user_id = ${userId}
      AND source = 'test'
      AND source_reference = ${FIXTURE_KEY}
      AND status = 'active'
  `;
}

async function ensureAuditTrailFixture(userId: number, dealId: number): Promise<number> {
  await sql`
    DELETE FROM audit_trail
    WHERE user_id = ${userId}
      AND session_id = ${FIXTURE_KEY}
      AND turn_id = 'audit-packet-route-smoke'
  `;

  const mandateChain = {
    spec: DEFINITIVE_SPEC_VERSION,
    principal: {
      userId,
      beneficialCustomerId: null,
      organizationId: null,
      billingOrgId: null,
    },
    agent: {
      agentId: 'agent:definitive-auth-route-smoke',
      agentPlatformId: 'codex-local',
      sourceAgent: 'definitive-auth-route-smoke',
    },
    mandate: {
      mandateId: 'mandate:definitive-auth-route-smoke',
      status: 'route_smoke',
      scope: ['audit:read'],
      requestedScopes: ['audit:read'],
      expiresAt: null,
      spendCapCredits: null,
    },
    sourceSurface: 'mcp',
  };

  const [row] = await sql`
    INSERT INTO audit_trail (
      session_id, deal_id, user_id, conversation_id, turn_id, journey, league, deal_type,
      model_stack, inputs_used, live_data_snapshots, citations_validated, mode_2_triggers, output_hash,
      spec_version, spec_uri, methodology_version, methodology_uri,
      beneficial_customer_id, billing_org_id, mandate_id, agent_id, agent_platform_id, mandate_chain
    )
    VALUES (
      ${FIXTURE_KEY},
      ${dealId},
      ${userId},
      NULL,
      'audit-packet-route-smoke',
      'buy',
      'L4',
      'distressed real estate asset purchase',
      ${sql.json({
        triggeredOverlayGates: ['G28', 'G29', 'G30'],
        applicableMechanics: ['M151', 'M160', 'M187'],
      })}::jsonb,
      ${sql.json({
        auditPacket: {
          line: 'compute_only',
          source: 'definitive-auth-route-smoke',
          inputsHash: 'fixture-inputs-hash',
          outputHash: 'fixture-output-hash',
        },
      })}::jsonb,
      ${sql.json({
        SOFR: {
          source: 'fixture',
          asOf: '2026-05-21',
          value: 0.036,
        },
      })}::jsonb,
      ${sql.json({
        authorities: ['methodology://v19', 'definitive://v1'],
        count: 2,
      })}::jsonb,
      ${sql.json([])}::jsonb,
      'fixture-output-hash',
      ${DEFINITIVE_SPEC_VERSION},
      ${DEFINITIVE_SPEC_URI},
      ${DEFINITIVE_METHODOLOGY_VERSION},
      ${DEFINITIVE_METHODOLOGY_URI},
      NULL,
      NULL,
      'mandate:definitive-auth-route-smoke',
      'agent:definitive-auth-route-smoke',
      'codex-local',
      ${sql.json(mandateChain)}::jsonb
    )
    RETURNING id
  `;
  return Number(row.id);
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
