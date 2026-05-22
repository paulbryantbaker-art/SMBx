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
import { executeGovernedTool } from '../server/services/governedToolExecutor.js';

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
    assert(body.tools.some((tool: any) => tool.name === 'compose_deal_package'), 'compose_deal_package is advertised');
    assert(body.tools.some((tool: any) => tool.name === 'resume_deal'), 'resume_deal is advertised');
    assert(body.tools.some((tool: any) => tool.name === 'compose_lifecycle_trace'), 'compose_lifecycle_trace is advertised');
    assert(body.tools.some((tool: any) => tool.name === 'prepare_ioi_packet'), 'prepare_ioi_packet is advertised');
    assert(body.tools.some((tool: any) => tool.name === 'prepare_loi_packet'), 'prepare_loi_packet is advertised');
    assert(body.tools.some((tool: any) => tool.name === 'compose_data_room_index'), 'compose_data_room_index is advertised');
    assert(body.tools.some((tool: any) => tool.name === 'prepare_diligence_request'), 'prepare_diligence_request is advertised');
    assert(body.tools.some((tool: any) => tool.name === 'disclose_subset'), 'disclose_subset is advertised');
    assert(body.tools.some((tool: any) => tool.name === 'compose_document_draft'), 'compose_document_draft is advertised');
    assert(body.tools.some((tool: any) => tool.name === 'prepare_negotiation_brief'), 'prepare_negotiation_brief is advertised');
    assert(body.tools.some((tool: any) => tool.name === 'compose_pmi_plan'), 'compose_pmi_plan is advertised');
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

  await test('THE LINE refuses unapproved human-approval actions', async () => {
    const response = await postJson('/api/definitive/tools/close_deal/call', token, {
      specVersion: DEFINITIVE_SPEC_VERSION,
      sourceAgent: 'definitive-auth-route-smoke',
      agentId: 'agent:definitive-auth-route-smoke',
      agentPlatformId: 'codex-local',
      input: {
        dealId: fixture.dealId,
        closedDate: '2026-05-21',
        finalPrice: 13_500_000_00,
      },
    });

    assertEqual(response.status, 428, 'human approval status');
    assertEqual(response.body.error, 'human_approval_required', 'human approval error');
    assertEqual(response.body.lineStatus, 'human_approval_required', 'human approval line status');
    assertEqual(response.body.refusalBehavior, 'stage_for_approval', 'human approval refusal behavior');
    assertEqual(response.body.tollgate.code, 'human_approval_required', 'human approval tollgate code');
  });

  await test('THE LINE refuses uncleared counsel-review actions', async () => {
    const response = await postJson('/api/definitive/tools/update_tax_position/call', token, {
      specVersion: DEFINITIVE_SPEC_VERSION,
      sourceAgent: 'definitive-auth-route-smoke',
      agentId: 'agent:definitive-auth-route-smoke',
      agentPlatformId: 'codex-local',
      input: {
        dealId: fixture.dealId,
        taxPosition: '338(h)(10) gross-up',
        facts: { sellerEntity: 'S-corp' },
      },
    });

    assertEqual(response.status, 428, 'counsel review status');
    assertEqual(response.body.error, 'counsel_review_required', 'counsel review error');
    assertEqual(response.body.lineStatus, 'counsel_review_required', 'counsel review line status');
    assertEqual(response.body.refusalBehavior, 'route_to_counsel', 'counsel review refusal behavior');
    assertEqual(response.body.tollgate.code, 'counsel_review_required', 'counsel review tollgate code');
  });

  await test('THE LINE refuses non-enterprise administrative scope', async () => {
    const response = await postJson('/api/definitive/tools/query_admin_data/call', token, {
      specVersion: DEFINITIVE_SPEC_VERSION,
      sourceAgent: 'definitive-auth-route-smoke',
      agentId: 'agent:definitive-auth-route-smoke',
      agentPlatformId: 'codex-local',
      input: {
        query: 'list operator-only workspace state',
      },
    });

    assertEqual(response.status, 403, 'enterprise scope status');
    assertEqual(response.body.error, 'enterprise_scope_required', 'enterprise scope error');
    assertEqual(response.body.lineStatus, 'enterprise_scope_required', 'enterprise scope line status');
    assertEqual(response.body.refusalBehavior, 'require_enterprise_scope', 'enterprise scope refusal behavior');
    assertEqual(response.body.tollgate.code, 'enterprise_scope_required', 'enterprise scope tollgate code');
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

  await test('Authenticated compose_deal_package returns portable DealPackage', async () => {
    const response = await postJson('/api/definitive/tools/call', token, {
      toolName: 'compose_deal_package',
      specVersion: DEFINITIVE_SPEC_VERSION,
      methodologyUri: DEFINITIVE_METHODOLOGY_URI,
      sourceAgent: 'definitive-auth-route-smoke',
      agentId: 'agent:definitive-auth-route-smoke',
      agentPlatformId: 'codex-local',
      requestedScopes: ['deal-state:read', 'deal-package:read'],
      input: {
        payload: {
          journey: 'buy',
          targetName: 'DEFINITIVE Route Fixture Deal',
          industry: 'industrial services / real estate',
          jurisdiction: 'US-DE',
          ebitdaCents: 2_100_000_00,
          dealStructure: 'distressed real estate asset purchase',
          signals: {
            cashRunwayDays: 45,
            securedDebtTradingPriceCents: 55,
            realEstatePercentOfEv: 42,
          },
          documents: [{ name: 'fixture QoE', type: 'qoe', hash: 'sha256:fixture-qoe' }],
        },
      },
    });

    assertEqual(response.status, 200, 'deal package route status');
    assertEqual(response.body.ok, true, 'deal package route ok');
    assertEqual(response.body.toolName, 'compose_deal_package', 'deal package tool name');
    assert(response.body.requiredScopes.includes('deal-package:read'), 'deal package scope is exposed');
    const dealPackage = response.body.result?.result?.dealPackage;
    assert(dealPackage, 'DealPackage exists');
    assert(dealPackage.packageCid.startsWith('definitive:deal-package:sha256:'), 'DealPackage is content addressed');
    assert(dealPackage.takeBackArtifacts.includes('DealPackage'), 'DealPackage is a take-back artifact');
    assert(dealPackage.excludedOrDeferred.some((item: any) => item.category === 'distressed_or_restructuring'), 'G28 package deferral is preserved');
    assert(dealPackage.excludedOrDeferred.some((item: any) => item.category === 'capital_structure_or_lme'), 'G29 package deferral is preserved');
  });

  await test('Authenticated resume_deal returns current stage and next calls', async () => {
    const response = await postJson('/api/definitive/tools/call', token, {
      toolName: 'resume_deal',
      specVersion: DEFINITIVE_SPEC_VERSION,
      methodologyUri: DEFINITIVE_METHODOLOGY_URI,
      sourceAgent: 'definitive-auth-route-smoke',
      agentId: 'agent:definitive-auth-route-smoke',
      agentPlatformId: 'codex-local',
      requestedScopes: ['deal-state:read', 'deal-plan:read', 'deal-package:read'],
      input: {
        payload: {
          journey: 'buy',
          targetName: 'DEFINITIVE Route Fixture Deal',
          industry: 'industrial services',
          jurisdiction: 'US-DE',
          ebitdaCents: 2_100_000_00,
          documents: [{ name: 'fixture CIM', type: 'cim', hash: 'sha256:fixture-cim' }],
        },
      },
    });

    assertEqual(response.status, 200, 'resume route status');
    assertEqual(response.body.ok, true, 'resume route ok');
    assertEqual(response.body.toolName, 'resume_deal', 'resume tool name');
    const result = response.body.result?.result;
    assert(result.currentStage, 'resume current stage exists');
    assert(result.resumeContract.recursiveLoop.includes('check_completeness'), 'resume recursive loop is exposed');
    assert(result.dealPackage.packageCid.startsWith('definitive:deal-package:sha256:'), 'resume package is content addressed');
    assert(result.next_suggested_calls.length > 0, 'resume next calls are exposed');
  });

  await test('Authenticated compose_lifecycle_trace returns iterative history packet', async () => {
    const response = await postJson('/api/definitive/tools/call', token, {
      toolName: 'compose_lifecycle_trace',
      specVersion: DEFINITIVE_SPEC_VERSION,
      methodologyUri: DEFINITIVE_METHODOLOGY_URI,
      sourceAgent: 'definitive-auth-route-smoke',
      agentId: 'agent:definitive-auth-route-smoke',
      agentPlatformId: 'codex-local',
      requestedScopes: ['deal-state:read', 'deal-plan:read'],
      input: {
        payload: {
          journey: 'buy',
          targetName: 'DEFINITIVE Route Fixture Deal',
          industry: 'software',
          jurisdiction: 'US-DE',
          ebitdaCents: 2_100_000_00,
          dealEvents: [
            { id: 'evt-ioi', eventType: 'ioi', label: 'IOI drafted', stage: 'ioi' },
            { id: 'evt-qoe', eventType: 'diligence', label: 'QoE uploaded', stage: 'diligence' },
          ],
          documents: [{ id: 'qoe', name: 'QoE report', type: 'qoe', hash: 'sha256:fixture-qoe' }],
        },
      },
    });

    assertEqual(response.status, 200, 'lifecycle trace route status');
    assertEqual(response.body.ok, true, 'lifecycle trace route ok');
    assertEqual(response.body.toolName, 'compose_lifecycle_trace', 'lifecycle trace tool name');
    const trace = response.body.result?.result?.lifecycleTrace;
    assertEqual(trace.schema, 'LifecycleTrace.v0.1', 'lifecycle trace schema');
    assert(trace.events.some((event: any) => event.id === 'evt-ioi'), 'lifecycle trace preserves event');
    assert(trace.loopContract.recursiveLoop.includes('update_deal_payload'), 'lifecycle recursive loop exposed');
    assert(trace.takeBackArtifacts.includes('LifecycleTrace'), 'lifecycle trace take-back exposed');
  });

  await test('Authenticated prepare_ioi_packet returns indication packet', async () => {
    const response = await postJson('/api/definitive/tools/call', token, {
      toolName: 'prepare_ioi_packet',
      specVersion: DEFINITIVE_SPEC_VERSION,
      methodologyUri: DEFINITIVE_METHODOLOGY_URI,
      sourceAgent: 'definitive-auth-route-smoke',
      agentId: 'agent:definitive-auth-route-smoke',
      agentPlatformId: 'codex-local',
      requestedScopes: ['deal-state:read', 'studio:draft', 'model-stack:compose'],
      input: {
        payload: {
          journey: 'buy',
          targetName: 'DEFINITIVE Route Fixture Deal',
          industry: 'software',
          jurisdiction: 'US-DE',
          revenueCents: 8_000_000_00,
          ebitdaCents: 2_100_000_00,
          documents: [
            { id: 'financials', name: 'Seller P&L', type: 'financials', hash: 'sha256:fixture-financials' },
            { id: 'customers', name: 'Customer export', type: 'commercial', hash: 'sha256:fixture-customers' },
          ],
        },
      },
    });

    assertEqual(response.status, 200, 'IOI packet route status');
    assertEqual(response.body.ok, true, 'IOI packet route ok');
    assertEqual(response.body.toolName, 'prepare_ioi_packet', 'IOI packet tool name');
    const packet = response.body.result?.result?.ioiPacket;
    assertEqual(packet.schema, 'IOIPacket.v0.1', 'IOI packet schema');
    assert(packet.knownFacts.some((fact: any) => fact.id === 'deal_subject'), 'IOI packet deal subject present');
    assertEqual(packet.indicationBoundary.noOfferAuthority, true, 'IOI packet does not make offer');
    assert(packet.takeBackArtifacts.includes('IOIPacket'), 'IOI packet take-back exposed');
  });

  await test('Authenticated prepare_loi_packet returns LOI architecture packet', async () => {
    const response = await postJson('/api/definitive/tools/call', token, {
      toolName: 'prepare_loi_packet',
      specVersion: DEFINITIVE_SPEC_VERSION,
      methodologyUri: DEFINITIVE_METHODOLOGY_URI,
      sourceAgent: 'definitive-auth-route-smoke',
      agentId: 'agent:definitive-auth-route-smoke',
      agentPlatformId: 'codex-local',
      requestedScopes: ['deal-state:read', 'studio:draft', 'model-stack:compose'],
      input: {
        payload: {
          journey: 'buy',
          targetName: 'DEFINITIVE Route Fixture Deal',
          industry: 'software',
          jurisdiction: 'US-DE',
          revenueCents: 8_000_000_00,
          ebitdaCents: 2_100_000_00,
          purchasePriceCents: 11_000_000_00,
          dealStructure: 'stock purchase with working capital true-up',
          workingCapitalPegCents: 900_000_00,
          closingConditions: { diligence: true, financing: true },
          documents: [
            { id: 'financials', name: 'Seller P&L', type: 'financials', hash: 'sha256:fixture-financials' },
            { id: 'loi', name: 'LOI issue list', type: 'legal', hash: 'sha256:fixture-loi' },
            { id: 'tax', name: 'Tax return summary', type: 'tax', hash: 'sha256:fixture-tax' },
            { id: 'customers', name: 'Customer export', type: 'commercial', hash: 'sha256:fixture-customers' },
          ],
        },
      },
    });

    assertEqual(response.status, 200, 'LOI packet route status');
    assertEqual(response.body.ok, true, 'LOI packet route ok');
    assertEqual(response.body.toolName, 'prepare_loi_packet', 'LOI packet tool name');
    const packet = response.body.result?.result?.loiPacket;
    assertEqual(packet.schema, 'LOIPacket.v0.1', 'LOI packet schema');
    assert(packet.dealArchitecture.some((term: any) => term.id === 'structure'), 'LOI packet deal structure present');
    assertEqual(packet.loiBoundary.noBindingOffer, true, 'LOI packet does not bind offer');
    assertEqual(packet.loiBoundary.noClauseDrafting, true, 'LOI packet does not draft clauses');
    assert(packet.takeBackArtifacts.includes('LOIPacket'), 'LOI packet take-back exposed');
  });

  await test('Authenticated compose_data_room_index returns source gaps', async () => {
    const response = await postJson('/api/definitive/tools/call', token, {
      toolName: 'compose_data_room_index',
      specVersion: DEFINITIVE_SPEC_VERSION,
      methodologyUri: DEFINITIVE_METHODOLOGY_URI,
      sourceAgent: 'definitive-auth-route-smoke',
      agentId: 'agent:definitive-auth-route-smoke',
      agentPlatformId: 'codex-local',
      requestedScopes: ['deal-state:read', 'data-room:read'],
      input: {
        payload: {
          journey: 'buy',
          targetName: 'DEFINITIVE Route Fixture Deal',
          industry: 'software',
          jurisdiction: 'US-DE',
          documents: [
            { name: 'QoE report', type: 'qoe', hash: 'sha256:fixture-qoe' },
            { name: 'Customer export', type: 'commercial', hash: 'sha256:fixture-customer' },
          ],
        },
      },
    });

    assertEqual(response.status, 200, 'data room index route status');
    assertEqual(response.body.ok, true, 'data room index route ok');
    assertEqual(response.body.toolName, 'compose_data_room_index', 'data room index tool name');
    const index = response.body.result?.result?.dataRoomIndex;
    assert(index.categories.some((category: any) => category.id === 'financials' && category.status === 'present'), 'financial source bucket present');
    assert(index.sourceGaps.some((gap: any) => gap.category === 'legal'), 'legal gap is exposed');
    assert(index.takeBackArtifacts.includes('DataRoomIndex'), 'DataRoomIndex take-back artifact is exposed');
  });

  await test('Authenticated prepare_diligence_request returns request packet', async () => {
    const response = await postJson('/api/definitive/tools/call', token, {
      toolName: 'prepare_diligence_request',
      specVersion: DEFINITIVE_SPEC_VERSION,
      methodologyUri: DEFINITIVE_METHODOLOGY_URI,
      sourceAgent: 'definitive-auth-route-smoke',
      agentId: 'agent:definitive-auth-route-smoke',
      agentPlatformId: 'codex-local',
      requestedScopes: ['deal-state:read', 'data-room:read', 'studio:draft'],
      input: {
        categories: ['financials', 'ip'],
        payload: {
          journey: 'buy',
          targetName: 'DEFINITIVE Route Fixture Deal',
          industry: 'software',
          jurisdiction: 'US-DE',
          ebitdaCents: 2_100_000_00,
          documents: [
            { id: 'qoe', name: 'QoE report', type: 'qoe', hash: 'sha256:fixture-qoe' },
            { id: 'ip', name: 'IP schedule', type: 'ip', hash: 'sha256:fixture-ip' },
          ],
        },
      },
    });

    assertEqual(response.status, 200, 'diligence request route status');
    assertEqual(response.body.ok, true, 'diligence request route ok');
    assertEqual(response.body.toolName, 'prepare_diligence_request', 'diligence request tool name');
    const request = response.body.result?.result?.diligenceRequest;
    assertEqual(request.schema, 'DiligenceRequest.v0.1', 'diligence request schema');
    assert(request.requestGroups.some((group: any) => group.id === 'financials' && group.status === 'source_ready'), 'financial diligence group present');
    assertEqual(request.requestBoundary.noExternalTransmission, true, 'diligence request is compose-only');
    assert(request.takeBackArtifacts.includes('DiligenceRequest'), 'diligence request take-back exposed');
  });

  await test('Authenticated disclose_subset composes selective proof without sharing', async () => {
    const response = await postJson('/api/definitive/tools/call', token, {
      toolName: 'disclose_subset',
      specVersion: DEFINITIVE_SPEC_VERSION,
      methodologyUri: DEFINITIVE_METHODOLOGY_URI,
      sourceAgent: 'definitive-auth-route-smoke',
      agentId: 'agent:definitive-auth-route-smoke',
      agentPlatformId: 'codex-local',
      requestedScopes: ['deal-state:read', 'data-room:read', 'deal-package:compose'],
      input: {
        categories: ['financials'],
        audience: 'external_agent',
        payload: {
          journey: 'buy',
          targetName: 'DEFINITIVE Route Fixture Deal',
          industry: 'software',
          jurisdiction: 'US-DE',
          documents: [
            { id: 'qoe', name: 'QoE report', type: 'qoe', hash: 'sha256:fixture-qoe' },
            { id: 'customer', name: 'Customer export', type: 'commercial', hash: 'sha256:fixture-customer' },
          ],
        },
      },
    });

    assertEqual(response.status, 200, 'disclosure subset route status');
    assertEqual(response.body.ok, true, 'disclosure subset route ok');
    assertEqual(response.body.toolName, 'disclose_subset', 'disclosure subset tool name');
    const subset = response.body.result?.result?.disclosureSubset;
    assertEqual(subset.schema, 'DisclosureSubset.v0.1', 'disclosure subset schema');
    assert(subset.sources.some((source: any) => source.category === 'financials'), 'financial source selected');
    assertEqual(subset.disclosureBoundary.noExternalTransmission, true, 'subset is compose-only');
    assert(subset.takeBackArtifacts.includes('SelectiveDisclosureProof'), 'selective disclosure proof exposed');
  });

  await test('Authenticated compose_document_draft returns Studio scaffold', async () => {
    const response = await postJson('/api/definitive/tools/call', token, {
      toolName: 'compose_document_draft',
      specVersion: DEFINITIVE_SPEC_VERSION,
      methodologyUri: DEFINITIVE_METHODOLOGY_URI,
      sourceAgent: 'definitive-auth-route-smoke',
      agentId: 'agent:definitive-auth-route-smoke',
      agentPlatformId: 'codex-local',
      requestedScopes: ['deal-state:read', 'studio:draft'],
      input: {
        documentType: 'loi_outline',
        payload: {
          journey: 'buy',
          targetName: 'DEFINITIVE Route Fixture Deal',
          industry: 'software',
          jurisdiction: 'US-DE',
          ebitdaCents: 2_100_000_00,
          documents: [
            { id: 'qoe', name: 'QoE report', type: 'qoe', hash: 'sha256:fixture-qoe' },
            { id: 'legal', name: 'Draft LOI', type: 'loi', hash: 'sha256:fixture-loi' },
          ],
        },
      },
    });

    assertEqual(response.status, 200, 'document draft route status');
    assertEqual(response.body.ok, true, 'document draft route ok');
    assertEqual(response.body.toolName, 'compose_document_draft', 'document draft tool name');
    const draft = response.body.result?.result?.documentDraft;
    assertEqual(draft.schema, 'DocumentDraft.v0.1', 'document draft schema');
    assertEqual(draft.documentType, 'loi_outline', 'document draft type');
    assert(draft.sections.some((section: any) => section.id === 'economic_terms'), 'LOI draft has economic terms section');
    assertEqual(draft.exportBoundary.noExternalTransmission, true, 'document draft is compose-only');
    assert(draft.takeBackArtifacts.includes('DocumentDraft'), 'document draft take-back exposed');
  });

  await test('Authenticated prepare_negotiation_brief returns control packet', async () => {
    const response = await postJson('/api/definitive/tools/call', token, {
      toolName: 'prepare_negotiation_brief',
      specVersion: DEFINITIVE_SPEC_VERSION,
      methodologyUri: DEFINITIVE_METHODOLOGY_URI,
      sourceAgent: 'definitive-auth-route-smoke',
      agentId: 'agent:definitive-auth-route-smoke',
      agentPlatformId: 'codex-local',
      requestedScopes: ['deal-state:read', 'studio:draft', 'model-stack:compose'],
      input: {
        payload: {
          journey: 'buy',
          targetName: 'DEFINITIVE Route Fixture Deal',
          industry: 'software',
          jurisdiction: 'US-DE',
          ebitdaCents: 2_100_000_00,
          purchasePriceCents: 16_000_000_00,
          dealStructure: 'asset purchase',
          documents: [
            { id: 'qoe', name: 'QoE report', type: 'qoe', hash: 'sha256:fixture-qoe' },
            { id: 'loi', name: 'LOI markup', type: 'loi', hash: 'sha256:fixture-loi' },
          ],
        },
      },
    });

    assertEqual(response.status, 200, 'negotiation brief route status');
    assertEqual(response.body.ok, true, 'negotiation brief route ok');
    assertEqual(response.body.toolName, 'prepare_negotiation_brief', 'negotiation brief tool name');
    const brief = response.body.result?.result?.negotiationBrief;
    assertEqual(brief.schema, 'NegotiationBrief.v0.1', 'negotiation brief schema');
    assert(brief.openTerms.some((term: any) => term.id === 'purchase_price'), 'purchase price term exists');
    assertEqual(brief.negotiationBoundary.noRecommendation, true, 'negotiation brief does not recommend');
    assert(brief.takeBackArtifacts.includes('NegotiationBrief'), 'negotiation brief take-back exposed');
  });

  await test('Authenticated compose_pmi_plan returns post-close plan packet', async () => {
    const response = await postJson('/api/definitive/tools/call', token, {
      toolName: 'compose_pmi_plan',
      specVersion: DEFINITIVE_SPEC_VERSION,
      methodologyUri: DEFINITIVE_METHODOLOGY_URI,
      sourceAgent: 'definitive-auth-route-smoke',
      agentId: 'agent:definitive-auth-route-smoke',
      agentPlatformId: 'codex-local',
      requestedScopes: ['deal-state:read', 'studio:draft', 'model-stack:compose'],
      input: {
        payload: {
          journey: 'pmi',
          targetName: 'DEFINITIVE Route Fixture Deal',
          industry: 'software',
          jurisdiction: 'US-DE',
          closedDate: '2026-05-20',
          dayZero: { banking: true, adminAccess: true },
          valueLevers: ['pricing cleanup', 'support workflow'],
          documents: [
            { id: 'ops', name: 'Operations handoff', type: 'operations', hash: 'sha256:fixture-ops' },
            { id: 'qoe', name: 'Closing QoE', type: 'qoe', hash: 'sha256:fixture-qoe' },
            { id: 'customers', name: 'Customer export', type: 'commercial', hash: 'sha256:fixture-customers' },
            { id: 'hr', name: 'Employee roster', type: 'hr', hash: 'sha256:fixture-hr' },
          ],
        },
      },
    });

    assertEqual(response.status, 200, 'PMI plan route status');
    assertEqual(response.body.ok, true, 'PMI plan route ok');
    assertEqual(response.body.toolName, 'compose_pmi_plan', 'PMI plan tool name');
    const plan = response.body.result?.result?.pmiPlan;
    assertEqual(plan.schema, 'PMIPlan.v0.1', 'PMI plan schema');
    assert(plan.workstreams.some((workstream: any) => workstream.id === 'PMI0'), 'PMI plan includes Day 0');
    assertEqual(plan.pmiBoundary.noOperatingAuthority, true, 'PMI plan does not operate');
    assert(plan.takeBackArtifacts.includes('PMIPlan'), 'PMI plan take-back exposed');
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
    assertEqual(body.auditPacket.schemaVersion, 'model-backed-chat-audit-v1', 'model-backed packet schema');
    assertEqual(body.auditPacket.line, 'compute_only', 'audit packet THE LINE marker');
    assert(body.modelStack.triggeredOverlayGates.includes('G28'), 'audit packet carries route map');
  });

  await test('Studio export audit packet routes return pinned export payloads', async () => {
    const { bookId, exportId } = await ensureStudioExportFixture(fixture.userId, fixture.dealId);
    const latest = await authedJson(`/api/studio/pitch-books/${bookId}/exports/latest/audit-packet`, token);
    const direct = await authedJson(`/api/studio/pitch-books/${bookId}/exports/${exportId}/audit-packet`, token);

    for (const body of [latest, direct]) {
      assertEqual(body.exportId, exportId, 'studio export id');
      assertEqual(body.bookId, bookId, 'studio book id');
      assertEqual(body.specVersion, DEFINITIVE_SPEC_VERSION, 'studio export spec');
      assertEqual(body.methodologyUri, DEFINITIVE_METHODOLOGY_URI, 'studio export methodology uri');
      assertEqual(body.auditPacket.schemaVersion, 'studio-export-audit-v1', 'studio audit packet schema');
      assertEqual(body.auditPacket.export.outputHash, 'fixture-studio-output-hash', 'studio audit output hash');
      assertEqual(body.auditPacket.book.dealId, fixture.dealId, 'studio audit deal id');
    }
  });

  await test('Staged agency action routes expose and cancel confirmation holds', async () => {
    await cancelFixtureStagedActions(fixture.userId);
    const conversationId = await ensureConversationFixture(fixture.userId, fixture.dealId);
    const stagedText = await executeGovernedTool(
      'advance_gate',
      {
        dealId: fixture.dealId,
        currentGate: 'B3',
        nextGate: 'B4',
        sourceSurface: FIXTURE_KEY,
      },
      fixture.userId,
      conversationId,
      {
        actorType: 'external_agent',
        actorId: 'agent:definitive-auth-route-smoke',
        actingOnBehalfOfUserId: fixture.userId,
        sourceSurface: 'external_agent',
        sourceAgent: 'definitive-auth-route-smoke',
      },
    );
    const staged = JSON.parse(stagedText);
    const stagedId = Number(staged.staged_action?.id);

    assertEqual(staged.staged, true, 'action staged');
    assertEqual(staged.requires_confirmation, true, 'action requires confirmation');
    assert(Number.isFinite(stagedId) && stagedId > 0, 'staged action id exists');

    const list = await authedJson('/api/agency/actions', token);
    assert(list.actions.some((action: any) => Number(action.id) === stagedId), 'staged action is listed');

    const canceled = await postJson(`/api/agency/actions/${stagedId}/cancel`, token, {
      reason: 'route smoke cleanup',
    });
    assertEqual(canceled.status, 200, 'staged cancel status');
    assertEqual(canceled.body.status, 'canceled', 'staged cancel body status');

    const after = await authedJson('/api/agency/actions', token);
    assert(!after.actions.some((action: any) => Number(action.id) === stagedId), 'canceled staged action leaves pending list');
  });
} finally {
  await sql.end({ timeout: 5 }).catch(() => undefined);
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);

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

async function ensureConversationFixture(userId: number, dealId: number): Promise<number> {
  const [existing] = await sql`
    SELECT id
    FROM conversations
    WHERE user_id = ${userId}
      AND title = 'DEFINITIVE Route Fixture Conversation'
    LIMIT 1
  `;
  if (existing?.id) {
    await sql`
      UPDATE conversations
      SET deal_id = ${dealId},
          journey = 'buy',
          current_gate = 'B3',
          league = 'L4',
          updated_at = NOW()
      WHERE id = ${Number(existing.id)}
    `;
    return Number(existing.id);
  }

  const [conversation] = await sql`
    INSERT INTO conversations (
      user_id, title, deal_id, journey, current_gate, league, gate_status, gate_label,
      created_at, updated_at
    )
    VALUES (
      ${userId},
      'DEFINITIVE Route Fixture Conversation',
      ${dealId},
      'buy',
      'B3',
      'L4',
      'active',
      'B3',
      NOW(),
      NOW()
    )
    RETURNING id
  `;
  return Number(conversation.id);
}

async function cancelFixtureStagedActions(userId: number) {
  await sql`
    UPDATE agency_staged_actions
    SET status = 'canceled',
        canceled_at = NOW(),
        updated_at = NOW()
    WHERE user_id = ${userId}
      AND tool_name = 'advance_gate'
      AND input->>'sourceSurface' = ${FIXTURE_KEY}
      AND status = 'pending'
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
          schemaVersion: 'model-backed-chat-audit-v1',
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

async function ensureStudioExportFixture(userId: number, dealId: number): Promise<{ bookId: number; exportId: number }> {
  await sql`
    DELETE FROM studio_books
    WHERE user_id = ${userId}
      AND title = 'DEFINITIVE Route Fixture Book'
  `;

  const [book] = await sql`
    INSERT INTO studio_books (user_id, deal_id, title, format, status, brief, created_at, updated_at)
    VALUES (
      ${userId},
      ${dealId},
      'DEFINITIVE Route Fixture Book',
      'qoe_preview',
      'draft',
      'Route-smoke fixture for Studio export audit packet retrieval.',
      NOW(),
      NOW()
    )
    RETURNING id
  `;
  const bookId = Number(book.id);

  const slides = [
    {
      id: 'fixture-slide-1',
      title: 'DEFINITIVE Fixture',
      subtitle: 'Route smoke',
      body: 'Fixture slide used only to prove audit packet retrieval.',
      bullets: ['Version pinned', 'Audit packet readable'],
      provenance: {
        factsUsed: ['fixture-fact'],
        modelOutputsUsed: ['MODEL.QOE.LITE.v1'],
        citationsUsed: ['methodology://v19'],
        uncheckedClaims: [],
      },
      warningState: 'clean',
    },
  ];

  const [version] = await sql`
    INSERT INTO studio_book_versions (
      book_id, version, title, outline, slides, assumptions, model_outputs, provenance, audit,
      speaker_notes, created_by, spec_version, spec_uri, methodology_version, methodology_uri, created_at
    )
    VALUES (
      ${bookId},
      1,
      'DEFINITIVE Route Fixture Book',
      ${sql.json([{ title: 'DEFINITIVE Fixture', kind: 'summary' }])}::jsonb,
      ${sql.json(slides)}::jsonb,
      ${sql.json([])}::jsonb,
      ${sql.json([])}::jsonb,
      ${sql.json({ source: 'definitive-auth-route-smoke' })}::jsonb,
      ${sql.json({ fixture: true })}::jsonb,
      ${sql.json([])}::jsonb,
      'route-smoke',
      ${DEFINITIVE_SPEC_VERSION},
      ${DEFINITIVE_SPEC_URI},
      ${DEFINITIVE_METHODOLOGY_VERSION},
      ${DEFINITIVE_METHODOLOGY_URI},
      NOW()
    )
    RETURNING id
  `;
  const versionId = Number(version.id);

  await sql`
    UPDATE studio_books
    SET current_version_id = ${versionId},
        updated_at = NOW()
    WHERE id = ${bookId}
  `;

  const auditPacket = {
    schemaVersion: 'studio-export-audit-v1',
    specVersion: DEFINITIVE_SPEC_VERSION,
    specUri: DEFINITIVE_SPEC_URI,
    methodologyVersion: DEFINITIVE_METHODOLOGY_VERSION,
    methodologyUri: DEFINITIVE_METHODOLOGY_URI,
    book: {
      id: bookId,
      dealId,
      versionId,
      version: 1,
      title: 'DEFINITIVE Route Fixture Book',
      format: 'qoe_preview',
      status: 'draft',
    },
    export: {
      format: 'pdf',
      status: 'ready',
      outputHash: 'fixture-studio-output-hash',
      inputHash: 'fixture-studio-input-hash',
    },
    counts: {
      slides: 1,
      sources: 0,
      assumptions: 0,
      modelOutputs: 0,
      warnings: 0,
    },
    slideProvenance: [
      {
        slideId: 'fixture-slide-1',
        slideNumber: 1,
        title: 'DEFINITIVE Fixture',
        warningState: 'clean',
        factsUsed: ['fixture-fact'],
        modelOutputsUsed: ['MODEL.QOE.LITE.v1'],
        citationsUsed: ['methodology://v19'],
        uncheckedClaims: [],
      },
    ],
    sourceManifest: [],
    modelManifest: [],
    citationValidation: { valid: true, missing: [] },
    warnings: [],
    auditPacketHash: 'fixture-studio-audit-packet-hash',
    generatedAt: '2026-05-21T00:00:00.000Z',
  };

  const [exportRow] = await sql`
    INSERT INTO studio_exports (
      book_id, version_id, format, status, output_hash, metadata,
      spec_version, spec_uri, methodology_version, methodology_uri, created_at
    )
    VALUES (
      ${bookId},
      ${versionId},
      'pdf',
      'ready',
      'fixture-studio-output-hash',
      ${sql.json({
        title: 'DEFINITIVE Route Fixture Book',
        slideCount: 1,
        exportedAt: '2026-05-21T00:00:00.000Z',
        citationValidation: { valid: true, missing: [] },
        warnings: [],
        auditPacket,
        specVersion: DEFINITIVE_SPEC_VERSION,
        specUri: DEFINITIVE_SPEC_URI,
        methodologyVersion: DEFINITIVE_METHODOLOGY_VERSION,
        methodologyUri: DEFINITIVE_METHODOLOGY_URI,
      })}::jsonb,
      ${DEFINITIVE_SPEC_VERSION},
      ${DEFINITIVE_SPEC_URI},
      ${DEFINITIVE_METHODOLOGY_VERSION},
      ${DEFINITIVE_METHODOLOGY_URI},
      NOW()
    )
    RETURNING id
  `;

  return { bookId, exportId: Number(exportRow.id) };
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
