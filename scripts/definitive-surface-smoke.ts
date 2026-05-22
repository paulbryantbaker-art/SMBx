#!/usr/bin/env npx tsx
/**
 * Smoke test for the DB-free DEFINITIVE discovery surface.
 *
 * This catches accidental drift in the agent card, MCP inventory, version
 * envelope, and THE LINE inventory before we wire external-agent clients.
 *
 * Run: npm run test:definitive-surface
 */

import {
  DEFINITIVE_METHODOLOGY_URI,
  DEFINITIVE_SPEC_URI,
  DEFINITIVE_SPEC_VERSION,
} from '../server/constants/definitive.js';
import { listDefinitiveLineInventory } from '../server/services/agencyActionRegistry.js';
import { buildAgentCard } from '../server/services/agentCard.js';
import {
  DEFINITIVE_CONFORMANCE_DEAL_ROUTE_CASE_COUNT,
  DEFINITIVE_CONFORMANCE_MODEL_STACK_CASE_COUNT,
  DEFINITIVE_CONFORMANCE_MODEL_RUNTIME_CASE_COUNT,
  DEFINITIVE_CONFORMANCE_PROMPT_META_CASE_COUNT,
  DEFINITIVE_CONFORMANCE_ROUTE_TRIGGER_CASE_COUNT,
  DEFINITIVE_CONFORMANCE_TOTAL_CASE_COUNT,
} from '../server/services/definitiveConformanceStatus.js';
import {
  buildDefinitiveDealRouteMap,
  buildDefinitiveSurfaceMechanicsSummary,
  buildDefinitiveYuliaMechanicsBrief,
  composeDefinitiveApplicableMechanics,
  findDefinitiveDealRoutes,
  getDefinitiveDealRouteMapSummary,
  summarizeDefinitiveApplicableMechanics,
} from '../server/services/definitiveDealRouteMap.js';
import {
  DEFINITIVE_DEAL_MECHANICS_AUTHORITY_TARGET,
  DEFINITIVE_DEAL_MECHANICS_GATE_COUNT,
  DEFINITIVE_DEAL_MECHANICS_MODEL_SLOT_COUNT,
  DEFINITIVE_DEAL_MECHANICS_VERSION,
  getDefinitiveDealMappingCoverage,
  getDefinitivePassThroughSurface,
  listDefinitiveDealMechanicsCatalog,
} from '../server/services/definitiveDealMechanicsCatalog.js';
import { getDefinitiveAuthoritySeedPlan } from '../server/services/definitiveAuthoritySeedPlan.js';
import { getDefinitiveSubstrateArchitecturePlan } from '../server/services/definitiveSubstrateArchitecturePlan.js';
import {
  listDefinitiveCorpusObservationTypes,
  sanitizeCorpusObservation,
} from '../server/services/definitiveCorpusService.js';
import {
  buildDefinitiveMcpServerCard,
  buildDefinitiveMcpWellKnownManifest,
} from '../server/services/definitiveMcpDiscovery.js';
import { buildDefinitiveSchemaRegistry } from '../server/services/definitiveSchemas.js';
import { buildDefinitiveSpecManifest } from '../server/services/definitiveSpecManifest.js';
import { evaluateDefinitiveStackOverlays } from '../server/services/definitiveStackOverlays.js';
import { executeDefinitiveMcpTool, listDefinitiveMcpTools } from '../server/services/definitiveMcp.js';

const expectedTools = [
  'ingest_deal_payload',
  'update_deal_payload',
  'check_completeness',
  'get_definition_of_done',
  'compose_deal_plan',
  'diff_deal_state',
  'compose_deal_package',
  'resume_deal',
  'compose_data_room_index',
  'disclose_subset',
  'compose_document_draft',
  'lookup_citation',
  'fetch_market_data',
  'defer_to_counsel',
  'compose_model_stack',
  'execute_model',
  'record_corpus_observation',
  'validate_conformance',
  'close_deal',
  'update_tax_position',
  'query_admin_data',
];

let passed = 0;
let failed = 0;

console.log('\nDEFINITIVE surface smoke');

await test('MCP inventory advertises the v0.1 tool surface', async () => {
  const inventory = listDefinitiveMcpTools();
  assertEqual(inventory.specVersion, DEFINITIVE_SPEC_VERSION, 'spec version');
  assertEqual(inventory.specUri, DEFINITIVE_SPEC_URI, 'spec uri');
  assertEqual(inventory.methodologyUri, DEFINITIVE_METHODOLOGY_URI, 'methodology uri');
  assertDeepEqual(inventory.tools.map(tool => tool.name), expectedTools, 'tool names');
  assert(inventory.tools.every(tool => tool.requiredScopes.length > 0), 'each tool exposes scopes');
  assert(inventory.tools.find(tool => tool.name === 'defer_to_counsel')?.lineStatus === 'counsel_review_required', 'defer_to_counsel routes to counsel');
});

await test('Agent card exposes DEFINITIVE endpoints and tools', async () => {
  const card = buildAgentCard();
  assertEqual(card.version, 'DEFINITIVE.v1.0', 'agent card version');
  assertEqual(card.definitive.specManifestEndpoint, '/.well-known/definitive.json', 'spec manifest endpoint');
  assertEqual(card.definitive.mcpDiscoveryEndpoint, '/.well-known/mcp', 'MCP discovery endpoint');
  assertEqual(card.definitive.mcpServerCardEndpoint, '/.well-known/mcp/server-card.json', 'MCP server-card endpoint');
  assertEqual(card.definitive.schemaRegistryEndpoint, '/api/definitive/schemas', 'schema registry endpoint');
  assertEqual(card.definitive.wellKnownSchemaRegistryEndpoint, '/.well-known/definitive-schemas.json', 'well-known schema registry endpoint');
  assertEqual(card.definitive.toolsEndpoint, '/api/definitive/tools/list', 'tools endpoint');
  assertEqual(card.definitive.auditPacketEndpoint, '/api/definitive/audit-packets/{auditTrailId}', 'audit packet endpoint');
  assertEqual(card.definitive.corpusObservationTypesEndpoint, '/api/definitive/corpus/observation-types', 'corpus observation endpoint');
  assertEqual(card.definitive.passThroughCatalogEndpoint, '/api/definitive/pass-through-catalog', 'pass-through catalog endpoint');
  assertEqual(card.definitive.authoritySeedPlanEndpoint, '/api/definitive/authority-seed-plan', 'authority seed plan endpoint');
  assertEqual(card.definitive.substrateArchitectureEndpoint, '/api/definitive/substrate-architecture', 'substrate architecture endpoint');
  assertEqual(card.definitive.dealMechanicsVersion, DEFINITIVE_DEAL_MECHANICS_VERSION, 'deal mechanics version');
  assertEqual(card.definitive.dealMechanicsModelSlots, DEFINITIVE_DEAL_MECHANICS_MODEL_SLOT_COUNT, 'deal mechanics model slots');
  assertEqual(card.definitive.dealMechanicsGates, DEFINITIVE_DEAL_MECHANICS_GATE_COUNT, 'deal mechanics gate count');
  assertEqual(card.definitive.authorityRegisterTarget, DEFINITIVE_DEAL_MECHANICS_AUTHORITY_TARGET, 'agent card authority target');
  assert(card.definitive.authoritySeedPlanEntries >= DEFINITIVE_DEAL_MECHANICS_AUTHORITY_TARGET, 'agent card authority seed plan meets target');
  assertEqual(card.definitive.authoritySeedPlanStatus, 'ready_for_800_plus_seeding', 'agent card authority seed plan status');
  assertEqual(card.definitive.substratePrimitiveCount, 8, 'agent card substrate primitive count');
  assertEqual(card.definitive.substrateNewMcpToolCount, 30, 'agent card substrate tool count');
  assert(card.definitive.schemaRegistryNames.includes('DealPayload'), 'agent card exposes DealPayload schema');
  assert(card.definitive.schemaRegistryNames.includes('DealState'), 'agent card exposes DealState schema');
  assert(card.definitive.schemaRegistryNames.includes('DealStateDiff'), 'agent card exposes DealStateDiff schema');
  assert(card.definitive.dealOsDoctrine.includes('Deal OS'), 'agent card exposes Deal OS doctrine');
  assert(card.definitive.agentHomeContract.includes('data rooms'), 'agent card exposes agent home data-room contract');
  assert(card.definitive.agentNoRejectionContract.includes('MissingInputContract'), 'agent card exposes no-rejection contract');
  assert(card.definitive.agentTakeBackArtifacts.includes('DealStateDiff'), 'agent card exposes portable take-back artifacts');
  assertEqual(card.definitive.publishedStandard, 'The Diligence Standard', 'agent card exposes published standard');
  assertEqual(card.definitive.toolMetadataNamingConvention, 'diligence_<phase>_<artifact>', 'agent card exposes tool metadata doctrine');
  assert(card.definitive.agentDiscoverabilityLayers.includes('well_known_discovery'), 'agent card exposes well-known discovery layer');
  assert(card.definitive.agentDesirabilitySignals.includes('semantic_tool_metadata'), 'agent card exposes semantic metadata signal');
  assertEqual(card.definitive.dealMappingStatus, 'complete', 'agent card deal mapping status');
  assertEqual(card.definitive.dealRouteMapStatus, 'complete', 'agent card route map status');
  assert(card.definitive.passThroughPricingRule.includes('cost-plus-fixed'), 'agent card exposes pass-through pricing rule');
  assert(card.publicEndpoints.includes('/.well-known/definitive.json'), 'definitive manifest endpoint is public');
  assert(card.publicEndpoints.includes('/.well-known/mcp'), 'MCP discovery endpoint is public');
  assert(card.publicEndpoints.includes('/.well-known/mcp/server-card.json'), 'MCP server-card endpoint is public');
  assert(card.publicEndpoints.includes('/.well-known/definitive-schemas.json'), 'well-known schema registry endpoint is public');
  assert(card.publicEndpoints.includes('/api/definitive/schemas'), 'schema registry endpoint is public');
  assert(card.publicEndpoints.includes('/api/definitive/pass-through-catalog'), 'pass-through catalog endpoint is public discovery');
  assert(card.publicEndpoints.includes('/api/definitive/authority-seed-plan'), 'authority seed plan endpoint is public discovery');
  assert(card.publicEndpoints.includes('/api/definitive/substrate-architecture'), 'substrate architecture endpoint is public discovery');
  assert(!card.publicEndpoints.includes('/api/definitive/tools/{toolName}/call'), 'tool execution is not public');
  assert(card.authenticatedEndpoints.includes('/api/definitive/line/inventory'), 'line inventory endpoint is authenticated');
  assert(card.authenticatedEndpoints.includes('/api/definitive/corpus/observation-types'), 'corpus observation endpoint is authenticated');
  assert(card.authenticatedEndpoints.includes('/api/definitive/audit-packets/{auditTrailId}'), 'audit packet endpoint is authenticated');
  assertEqual(card.endpointAccess.executionRequiresGovernedToolContract, true, 'execution requires governed tool contracts');
  const mcpCapability = card.capabilities.find((item: any) => item.id === 'definitive_mcp_v0_1') as any;
  assert(mcpCapability, 'mcp capability exists');
  assertDeepEqual(mcpCapability.tools.map((tool: any) => tool.name), expectedTools, 'agent-card tool names');
  const conformanceCapability = card.capabilities.find((item: any) => item.id === 'definitive_conformance_status') as any;
  assert(conformanceCapability, 'conformance capability exists');
  assertEqual(conformanceCapability.caseCount, DEFINITIVE_CONFORMANCE_TOTAL_CASE_COUNT, 'agent-card conformance case count');
  const mechanicsCapability = card.capabilities.find((item: any) => item.id === 'definitive_deal_mechanics_v1_1') as any;
  assert(mechanicsCapability, 'deal mechanics capability exists');
  assertEqual(mechanicsCapability.modelSlots, DEFINITIVE_DEAL_MECHANICS_MODEL_SLOT_COUNT, 'deal mechanics capability model count');
  assertEqual(mechanicsCapability.gates, DEFINITIVE_DEAL_MECHANICS_GATE_COUNT, 'deal mechanics capability gate count');
  assertDeepEqual(mechanicsCapability.newGates, ['G28', 'G29', 'G30'], 'deal mechanics new gates');
  assertEqual(mechanicsCapability.authorityRegisterTarget, DEFINITIVE_DEAL_MECHANICS_AUTHORITY_TARGET, 'deal mechanics authority target');
  assert(mechanicsCapability.surfaces.some((item: any) => item.surface === 'pipeline' && item.totalMechanics > 0), 'agent card exposes pipeline mechanics surface');
  const authorityCapability = card.capabilities.find((item: any) => item.id === 'definitive_authority_seed_plan') as any;
  assert(authorityCapability, 'authority seed plan capability exists');
  assertEqual(authorityCapability.targetEntries, DEFINITIVE_DEAL_MECHANICS_AUTHORITY_TARGET, 'authority capability target');
  assert(authorityCapability.plannedEntries >= DEFINITIVE_DEAL_MECHANICS_AUTHORITY_TARGET, 'authority capability planned entries meet target');
  assertEqual(authorityCapability.requiredCoverageSatisfied, true, 'authority capability required coverage');
  const substrateCapability = card.capabilities.find((item: any) => item.id === 'definitive_substrate_architecture') as any;
  assert(substrateCapability, 'substrate architecture capability exists');
  assertEqual(substrateCapability.primitiveCount, 8, 'substrate capability primitive count');
  assertEqual(substrateCapability.newMcpToolCount, 30, 'substrate capability tool count');
  assert(substrateCapability.agentOperatingDoctrine.noRejectionContract.includes('Agents are not rejected'), 'substrate capability blocks incomplete-payload rejection');
  assert(substrateCapability.lifecycleStages.includes('ioi'), 'substrate capability exposes IOI stage');
  assert(substrateCapability.lifecycleStages.includes('close_pmi'), 'substrate capability exposes close/PMI stage');
  assert(substrateCapability.workSurfaces.includes('data_room'), 'substrate capability exposes data room surface');
  assert(substrateCapability.workSurfaces.includes('studio'), 'substrate capability exposes Studio document surface');
  assert(substrateCapability.takeBackArtifacts.includes('DocumentDraft'), 'substrate capability exposes document take-back artifact');
  assert(substrateCapability.discoverabilityLayers.includes('enterprise_allow_lists'), 'substrate capability exposes enterprise allow-list layer');
  assert(substrateCapability.desirabilitySignals.includes('structured_outputs'), 'substrate capability exposes structured output signal');
  assert(substrateCapability.toolMetadataDoctrine.semanticKeywords.includes('working capital peg'), 'substrate capability exposes query-aligned tool metadata');
  assertEqual(substrateCapability.publishedStandardDoctrine.name, 'The Diligence Standard', 'substrate capability exposes standard doctrine');
  assert(substrateCapability.routingAxes.includes('distress_posture'), 'substrate capability exposes routing axes');
});

await test('DEFINITIVE manifest is a single stable discovery document', async () => {
  const manifest = buildDefinitiveSpecManifest();
  assertEqual(manifest.version, DEFINITIVE_SPEC_VERSION, 'manifest version');
  assertEqual(manifest.endpoints.specManifest, '/.well-known/definitive.json', 'manifest endpoint');
  assertEqual(manifest.endpoints.agentCard, '/.well-known/agent-card.json', 'manifest agent-card endpoint');
  assertEqual(manifest.endpoints.mcpDiscovery, '/.well-known/mcp', 'manifest MCP discovery endpoint');
  assertEqual(manifest.endpoints.mcpServerCard, '/.well-known/mcp/server-card.json', 'manifest MCP server-card endpoint');
  assertEqual(manifest.endpoints.schemaRegistry, '/api/definitive/schemas', 'manifest schema registry endpoint');
  assertEqual(manifest.endpoints.wellKnownSchemaRegistry, '/.well-known/definitive-schemas.json', 'manifest well-known schema registry endpoint');
  assertEqual(manifest.endpoints.passThroughCatalog, '/api/definitive/pass-through-catalog', 'manifest pass-through catalog endpoint');
  assertEqual(manifest.endpoints.authoritySeedPlan, '/api/definitive/authority-seed-plan', 'manifest authority seed plan endpoint');
  assertEqual(manifest.endpoints.substrateArchitecture, '/api/definitive/substrate-architecture', 'manifest substrate architecture endpoint');
  assert(manifest.access.publicDiscovery.includes('/api/definitive/spec'), 'manifest spec API is public discovery');
  assert(manifest.access.publicDiscovery.includes('/.well-known/mcp'), 'manifest MCP discovery is public');
  assert(manifest.access.publicDiscovery.includes('/.well-known/mcp/server-card.json'), 'manifest MCP server-card is public');
  assert(manifest.access.publicDiscovery.includes('/.well-known/definitive-schemas.json'), 'manifest schema well-known is public');
  assert(manifest.access.publicDiscovery.includes('/api/definitive/schemas'), 'manifest schema registry is public');
  assert(manifest.access.publicDiscovery.includes('/api/definitive/pass-through-catalog'), 'manifest pass-through catalog is public discovery');
  assert(manifest.access.publicDiscovery.includes('/api/definitive/authority-seed-plan'), 'manifest authority seed plan is public discovery');
  assert(manifest.access.publicDiscovery.includes('/api/definitive/substrate-architecture'), 'manifest substrate architecture is public discovery');
  assert(manifest.access.authenticatedDiscovery.includes('/api/definitive/tools/list'), 'manifest tools list is authenticated discovery');
  assert(manifest.access.authenticatedExecution.includes('/api/definitive/tools/{toolName}/call'), 'manifest tool call is authenticated execution');
  assertDeepEqual(manifest.toolSurface.tools.map(tool => tool.name), expectedTools, 'manifest tool names');
  assertEqual(manifest.corpusSurface.rawDocumentTextAllowed, false, 'manifest disallows raw corpus text');
  assertEqual(manifest.corpusSurface.partyIdentifiersAllowed, false, 'manifest disallows party identifiers');
  assertEqual(manifest.conformanceSurface.modelRuntimeCases, DEFINITIVE_CONFORMANCE_MODEL_RUNTIME_CASE_COUNT, 'manifest conformance case count');
  assertEqual(manifest.conformanceSurface.dealMechanicsRouteCases, DEFINITIVE_CONFORMANCE_DEAL_ROUTE_CASE_COUNT, 'manifest route conformance case count');
  assertEqual(manifest.conformanceSurface.promptMetaCases, DEFINITIVE_CONFORMANCE_PROMPT_META_CASE_COUNT, 'manifest prompt/meta conformance case count');
  assertEqual(manifest.conformanceSurface.routeTriggerCases, DEFINITIVE_CONFORMANCE_ROUTE_TRIGGER_CASE_COUNT, 'manifest route-trigger conformance case count');
  assertEqual(manifest.conformanceSurface.modelStackCases, DEFINITIVE_CONFORMANCE_MODEL_STACK_CASE_COUNT, 'manifest model-stack conformance case count');
  assertEqual(manifest.conformanceSurface.totalCases, DEFINITIVE_CONFORMANCE_TOTAL_CASE_COUNT, 'manifest total conformance case count');
  assertEqual(manifest.dealMechanicsSurface.summary.totalModelSlots, DEFINITIVE_DEAL_MECHANICS_MODEL_SLOT_COUNT, 'manifest deal mechanics model count');
  assertEqual(manifest.dealMechanicsSurface.summary.catalogedModelSlots, DEFINITIVE_DEAL_MECHANICS_MODEL_SLOT_COUNT, 'manifest cataloged model count');
  assertEqual(manifest.dealMechanicsSurface.summary.reservedModelSlots, 2, 'manifest reserved model slots');
  assertEqual(manifest.dealMechanicsSurface.summary.totalGates, DEFINITIVE_DEAL_MECHANICS_GATE_COUNT, 'manifest deal mechanics gate count');
  assertEqual(manifest.dealMechanicsSurface.summary.authorityRegisterTarget, DEFINITIVE_DEAL_MECHANICS_AUTHORITY_TARGET, 'manifest authority target');
  assertEqual(manifest.authoritySurface.targetEntries, DEFINITIVE_DEAL_MECHANICS_AUTHORITY_TARGET, 'manifest authority surface target');
  assert(manifest.authoritySurface.plannedEntries >= DEFINITIVE_DEAL_MECHANICS_AUTHORITY_TARGET, 'manifest authority surface planned entries meet target');
  assertEqual(manifest.authoritySurface.requiredCoverageSatisfied, true, 'manifest authority surface required coverage');
  assertEqual(manifest.authoritySurface.status, 'ready_for_800_plus_seeding', 'manifest authority surface status');
  assert(manifest.authoritySurface.categoryIds.includes('bankruptcy_code'), 'manifest authority surface includes bankruptcy');
  assert(manifest.authoritySurface.categoryIds.includes('agreement_architecture'), 'manifest authority surface includes agreement architecture');
  assert(manifest.authoritySurface.categoryIds.includes('ip_authorities'), 'manifest authority surface includes IP');
  assert(manifest.authoritySurface.categoryIds.includes('pass_through_pricing_boundary'), 'manifest authority surface includes THE LINE pricing boundary');
  assertEqual(manifest.substrateArchitectureSurface.primitiveCount, 8, 'manifest substrate primitive count');
  assertEqual(manifest.substrateArchitectureSurface.newMcpToolCount, 30, 'manifest substrate tool count');
  assert(manifest.substrateArchitectureSurface.agentOperatingDoctrine.productDoctrine.includes('Deal OS'), 'manifest substrate Deal OS doctrine');
  assert(manifest.substrateArchitectureSurface.agentOperatingDoctrine.noRejectionContract.includes('MissingInputContract'), 'manifest substrate no-rejection contract');
  assert(manifest.substrateArchitectureSurface.agentOperatingDoctrine.homeContract.includes('data rooms'), 'manifest substrate agent home contract includes data rooms');
  assert(manifest.substrateArchitectureSurface.agentOperatingDoctrine.bidirectionalHandoff.includes('portable information'), 'manifest substrate bidirectional handoff');
  assert(manifest.substrateArchitectureSurface.dealOsLifecycleStages.some(stage => stage.id === 'ioi'), 'manifest substrate lifecycle includes IOI');
  assert(manifest.substrateArchitectureSurface.dealOsLifecycleStages.some(stage => stage.id === 'model_negotiation'), 'manifest substrate lifecycle includes modeling and negotiation prep');
  assert(manifest.substrateArchitectureSurface.dealOsWorkSurfaces.some(surface => surface.id === 'data_room'), 'manifest substrate exposes data room work surface');
  assert(manifest.substrateArchitectureSurface.agentTakeBackArtifacts.includes('DataRoomIndex'), 'manifest substrate exposes data-room take-back artifact');
  assert(manifest.substrateArchitectureSurface.agentTakeBackArtifacts.includes('DisclosureSubset'), 'manifest substrate exposes disclosure-subset take-back artifact');
  assert(manifest.substrateArchitectureSurface.agentDiscoverabilityLayers.some(layer => layer.id === 'well_known_discovery'), 'manifest substrate exposes well-known discovery layer');
  assert(manifest.substrateArchitectureSurface.agentDiscoverabilityLayers.some(layer => layer.id === 'enterprise_allow_lists'), 'manifest substrate exposes enterprise allow-list layer');
  assert(manifest.substrateArchitectureSurface.agentDesirabilitySignals.some(signal => signal.id === 'citation_provenance'), 'manifest substrate exposes citation desirability signal');
  assertEqual(manifest.substrateArchitectureSurface.toolMetadataDoctrine.namingConvention, 'diligence_<phase>_<artifact>', 'manifest substrate tool metadata doctrine');
  assertEqual(manifest.substrateArchitectureSurface.publishedStandardDoctrine.name, 'The Diligence Standard', 'manifest substrate standard doctrine');
  assert(manifest.substrateArchitectureSurface.routingAxes.includes('tax_classification'), 'manifest substrate routing axes');
  assert(manifest.substrateArchitectureSurface.universalResponseFields.includes('next_suggested_calls'), 'manifest substrate next call hints');
  assertEqual(manifest.substrateArchitectureSurface.schemaRegistry.endpoint, '/api/definitive/schemas', 'manifest substrate schema endpoint');
  assert(manifest.substrateArchitectureSurface.schemaRegistry.schemaNames.includes('MissingInputContract'), 'manifest substrate schema registry exposes MissingInputContract');
  assert(manifest.substrateArchitectureSurface.schemaRegistry.toolSchemaMap.ingest_deal_payload.output.includes('DealState'), 'manifest substrate schema map connects ingest to DealState');
  assertEqual(manifest.dealMechanicsSurface.mappingCoverage.status, 'complete', 'manifest deal mapping coverage status');
  assertEqual(manifest.dealMechanicsSurface.mappingCoverage.unmappedModelSlots, 0, 'manifest has no unmapped active model slots');
  assertEqual(manifest.dealMechanicsSurface.routeMap.summary.status, 'complete', 'manifest route map coverage status');
  assertEqual(manifest.dealMechanicsSurface.routeMap.entries.length, DEFINITIVE_DEAL_MECHANICS_MODEL_SLOT_COUNT, 'manifest route map entry count');
  assert(manifest.dealMechanicsSurface.surfaceMechanics.some(item => item.surface === 'today'), 'manifest exposes Today mechanics summary');
  assert(manifest.dealMechanicsSurface.surfaceMechanics.some(item => item.surface === 'pipeline'), 'manifest exposes Pipeline mechanics summary');
  assert(manifest.dealMechanicsSurface.surfaceMechanics.some(item => item.surface === 'files'), 'manifest exposes Files mechanics summary');
  assert(manifest.dealMechanicsSurface.surfaceMechanics.some(item => item.surface === 'studio'), 'manifest exposes Studio mechanics summary');
  assertDeepEqual(manifest.dealMechanicsSurface.summary.newGates, ['G28', 'G29', 'G30'], 'manifest new gates');
  assert(manifest.dealMechanicsSurface.gateExpansions.some(gate => gate.gateId === 'G28'), 'manifest includes G28');
  assert(manifest.dealMechanicsSurface.gateExpansions.some(gate => gate.gateId === 'G29'), 'manifest includes G29');
  assert(manifest.dealMechanicsSurface.gateExpansions.some(gate => gate.gateId === 'G30'), 'manifest includes G30');
  assert(manifest.passThroughSurface.pricingRule.includes('per call'), 'manifest pass-through surface is exposed');
  assert(manifest.passThroughSurface.catalog.length >= 8, 'manifest pass-through catalog has priced substrates');
  assert(manifest.passThroughSurface.catalog.every(item => item.humanReferralCompensationAllowed === false), 'pass-through catalog prohibits paid human referrals');
  assert(manifest.passThroughSurface.catalog.every(item => item.chargedRegardlessOfOutcome === true), 'pass-through catalog is outcome-independent');
});

await test('MCP well-known discovery is generated from DEFINITIVE manifest data', async () => {
  const origin = 'https://example.smbx.ai';
  const serverCard = buildDefinitiveMcpServerCard(origin);
  const mcpManifest = buildDefinitiveMcpWellKnownManifest(origin);

  assertEqual(serverCard.name, 'smbx-ai/diligence', 'MCP server namespace');
  assertEqual(serverCard.version, DEFINITIVE_SPEC_VERSION, 'MCP server-card version');
  assertEqual(serverCard.serverInfo.canonicalStandard, 'The Diligence Standard', 'MCP server-card standard');
  assertEqual(serverCard.transport.endpoints.serverCard, `${origin}/.well-known/mcp/server-card.json`, 'MCP server-card endpoint URL');
  assertEqual(serverCard.transport.endpoints.schemaRegistry, `${origin}/api/definitive/schemas`, 'MCP server-card schema registry URL');
  assertDeepEqual(serverCard.tools.map((tool: any) => tool.name), expectedTools, 'MCP server-card tools');
  assert(serverCard.tools.every((tool: any) => tool.outputSchema?.properties?.specVersion), 'MCP tools expose output schemas');
  assert(serverCard.tools.find((tool: any) => tool.name === 'ingest_deal_payload')?.structuredContentSchemas?.output.includes('DealState'), 'MCP ingest tool maps to DealState schema');
  assert(serverCard.tools.every((tool: any) => typeof tool.annotations?.readOnlyHint === 'boolean'), 'MCP tools expose annotations');
  assert(serverCard.definitive.toolMetadataDoctrine.semanticKeywords.includes('working capital peg'), 'MCP server-card exposes semantic keywords');
  assertEqual(serverCard.definitive.publishedStandardDoctrine.name, 'The Diligence Standard', 'MCP server-card exposes published standard');
  assertEqual(serverCard.security.noSuccessFees, true, 'MCP server-card blocks success fees');
  assertEqual(serverCard.security.noReferralCompensation, true, 'MCP server-card blocks referral compensation');

  assertEqual(mcpManifest.mcp_version, '2025-12-11', 'MCP manifest version');
  assertEqual(mcpManifest.server_card, `${origin}/.well-known/mcp/server-card.json`, 'MCP manifest server-card URL');
  assert(mcpManifest.endpoints.some((endpoint: any) => endpoint.type === 'definitive-manifest' && endpoint.auth === 'none'), 'MCP manifest points to public DEFINITIVE manifest');
  assert(mcpManifest.endpoints.some((endpoint: any) => endpoint.type === 'definitive-schema-registry' && endpoint.auth === 'none'), 'MCP manifest points to public schema registry');
  assertEqual(mcpManifest.capabilities.outputSchema, true, 'MCP manifest declares output schemas');
  assertEqual(mcpManifest.capabilities.auditTrail, true, 'MCP manifest declares audit trail support');
  assertEqual(mcpManifest.doctrine.standard, 'The Diligence Standard', 'MCP manifest standard doctrine');
  assertEqual(mcpManifest.doctrine.namingConvention, 'diligence_<phase>_<artifact>', 'MCP manifest naming convention');
});

await test('DEFINITIVE schema registry publishes portable agent contracts', async () => {
  const registry = buildDefinitiveSchemaRegistry();
  assertEqual(registry.version, 'DEFINITIVE.schemas.v0.1', 'schema registry version');
  assert(registry.schemaNames.includes('DealPayload'), 'schema registry exposes DealPayload');
  assert(registry.schemaNames.includes('DealState'), 'schema registry exposes DealState');
  assert(registry.schemaNames.includes('MissingInputContract'), 'schema registry exposes MissingInputContract');
  assert(registry.schemaNames.includes('CompletenessReport'), 'schema registry exposes CompletenessReport');
  assert(registry.schemaNames.includes('DealPlan'), 'schema registry exposes DealPlan');
  assert(registry.schemaNames.includes('DealStateDiff'), 'schema registry exposes DealStateDiff');
  assert(registry.schemaNames.includes('DealPackage'), 'schema registry exposes DealPackage');
  assert(registry.schemaNames.includes('DataRoomIndex'), 'schema registry exposes DataRoomIndex');
  assert(registry.schemaNames.includes('DisclosureSubset'), 'schema registry exposes DisclosureSubset');
  assert(registry.schemaNames.includes('DocumentDraft'), 'schema registry exposes DocumentDraft');
  assertEqual(registry.schemas.DealPayload.properties.revenueCents.type, 'integer', 'money is cents integer');
  assert(registry.toolSchemaMap.ingest_deal_payload.output.includes('MissingInputContract'), 'ingest output maps missing input contract');
  assert(registry.toolSchemaMap.diff_deal_state.takeBack.includes('DealStateDiff'), 'diff take-back maps DealStateDiff');
  assert(registry.toolSchemaMap.compose_deal_package.takeBack.includes('DealPackage'), 'package take-back maps DealPackage');
  assert(registry.toolSchemaMap.resume_deal.takeBack.includes('DealPackage'), 'resume take-back maps DealPackage');
  assert(registry.toolSchemaMap.compose_data_room_index.takeBack.includes('DataRoomIndex'), 'data room take-back maps DataRoomIndex');
  assert(registry.toolSchemaMap.disclose_subset.takeBack.includes('DisclosureSubset'), 'disclosure subset maps DisclosureSubset');
  assert(registry.toolSchemaMap.compose_document_draft.takeBack.includes('DocumentDraft'), 'document draft maps DocumentDraft');
  assert(registry.noRejectionContract.includes('DealPayload may be incomplete'), 'schema registry states no-rejection contract');
});

await test('DEFINITIVE catalog includes the M187-M223 closing-gap expansion', async () => {
  const catalog = listDefinitiveDealMechanicsCatalog();
  const mapping = getDefinitiveDealMappingCoverage();
  const passThrough = getDefinitivePassThroughSurface();
  assertEqual(catalog.length, DEFINITIVE_DEAL_MECHANICS_MODEL_SLOT_COUNT, 'catalog length matches target slot count');
  assertEqual(mapping.unmappedModelSlots, 0, 'active catalog slots have gate/deal-type mappings');
  assert(catalog.some(model => model.slotId === 'M187'), 'catalog includes real estate expansion');
  assert(catalog.some(model => model.slotId === 'M200'), 'catalog includes connected transaction tax engine');
  assert(catalog.some(model => model.slotId === 'M206'), 'catalog includes legal/agreement architecture engine');
  assert(catalog.some(model => model.slotId === 'M223'), 'catalog includes IP/domain transfer closing model');
  assert(passThrough.allowed.some(item => item.includes('Data/software API')), 'pass-through allows data/software API calls');
  assert(passThrough.prohibited.some(item => item.includes('Success fee')), 'pass-through prohibits success-fee human routing');
  assertEqual(passThrough.marginPolicy.dealOutcomeTied, false, 'pass-through margin is not outcome tied');
  assertEqual(passThrough.marginPolicy.humanReferralCompensationAllowed, false, 'human referral compensation is blocked');
  assert(passThrough.catalog.some(item => item.id === 'PASS.IP.SCA_SCAN' && item.dependentModelSlots.includes('M221')), 'SCA scan catalog maps to OSS model');
  assert(passThrough.catalog.some(item => item.id === 'PASS.RE.TITLE_SURVEY' && item.dependentModelSlots.includes('M196')), 'title catalog maps to title/survey model');
  assert(passThrough.catalog.some(item => item.id === 'PASS.HUMAN_SPECIALIST_DIRECTORY' && item.pricingMode === 'free_editorial_directory'), 'free specialist directory is explicit');
});

await test('Authority Register seed plan is explicit and above 800 planned entries', async () => {
  const seedPlan = getDefinitiveAuthoritySeedPlan();
  assertEqual(seedPlan.targetEntries, DEFINITIVE_DEAL_MECHANICS_AUTHORITY_TARGET, 'authority seed target');
  assert(seedPlan.plannedEntries >= DEFINITIVE_DEAL_MECHANICS_AUTHORITY_TARGET, 'authority seed planned entries meet target');
  assertEqual(seedPlan.status, 'ready_for_800_plus_seeding', 'authority seed status');
  assertEqual(seedPlan.requiredCoverageSatisfied, true, 'authority seed required coverage');
  assert(seedPlan.categories.length >= 13, 'authority seed has enough categories');
  assert(seedPlan.categoryIds.includes('bankruptcy_code'), 'authority seed includes bankruptcy code');
  assert(seedPlan.categoryIds.includes('treasury_regulations'), 'authority seed includes Treasury regulations');
  assert(seedPlan.categoryIds.includes('real_estate'), 'authority seed includes real estate');
  assert(seedPlan.categoryIds.includes('connected_tax'), 'authority seed includes connected tax');
  assert(seedPlan.categoryIds.includes('agreement_architecture'), 'authority seed includes agreement architecture');
  assert(seedPlan.categoryIds.includes('ip_authorities'), 'authority seed includes IP');
  assert(seedPlan.categoryIds.includes('regulated_industries'), 'authority seed includes regulated industries');
  assert(seedPlan.categories.every(category => category.freshnessPolicy.length > 0), 'each authority category has freshness policy');
  assert(seedPlan.categories.every(category => category.lineBoundary.length > 0), 'each authority category has a boundary statement');
});

await test('Substrate architecture plan exposes the terminal orchestration primitives', async () => {
  const architecture = getDefinitiveSubstrateArchitecturePlan();
  assertEqual(architecture.primitiveCount, 8, 'substrate architecture primitive count');
  assertEqual(architecture.newMcpToolCount, 30, 'substrate architecture tool count');
  assert(architecture.agentOperatingDoctrine.productDoctrine.includes('Deal OS'), 'substrate plan is Deal OS');
  assert(architecture.agentOperatingDoctrine.noRejectionContract.includes('Agents are not rejected'), 'substrate plan accepts incomplete agent payloads');
  assert(architecture.agentOperatingDoctrine.homeContract.includes('documents'), 'substrate plan includes document creation surface');
  assert(architecture.agentTakeBackArtifacts.includes('AuditPacket'), 'substrate plan exposes audit packet take-back artifact');
  assert(architecture.dealOsWorkSurfaces.some(surface => surface.id === 'files'), 'substrate plan includes Files work surface');
  assert(architecture.dealOsWorkSurfaces.some(surface => surface.id === 'data_room'), 'substrate plan includes Data Room work surface');
  assert(architecture.dealOsLifecycleStages.some(stage => stage.id === 'loi'), 'substrate plan includes LOI stage');
  assert(architecture.routingAxes.includes('distress_posture'), 'routing axes include distress posture');
  assert(architecture.routingAxes.includes('tax_classification'), 'routing axes include tax classification');
  assert(architecture.universalResponseFields.includes('next_suggested_calls'), 'response envelope includes next suggested calls');
  assert(architecture.workstreams.some(item => item.id === 'WS1' && item.mcpTools.includes('ingest_deal_payload')), 'payload ingest workstream exists');
  assert(architecture.workstreams.some(item => item.id === 'WS4' && item.mcpTools.includes('compose_deal_package')), 'compose package workstream exists');
  assert(architecture.workstreams.some(item => item.id === 'WS4' && item.mcpTools.includes('finalize_deal_package')), 'package workstream exists');
  assert(architecture.workstreams.some(item => item.id === 'WS6' && item.mcpTools.includes('compose_data_room_index')), 'data room workstream exists');
  assert(architecture.workstreams.some(item => item.id === 'WS6' && item.mcpTools.includes('compose_document_draft')), 'document draft workstream exists');
  assert(architecture.workstreams.some(item => item.id === 'WS5' && item.mcpTools.includes('compute_best_vehicle')), 'best vehicle workstream exists');
  assert(architecture.lineDoctrine.includes('does not advise'), 'THE LINE invariant is explicit');
});

await test('DEFINITIVE route map makes every active M-slot usable by Yulia', async () => {
  const routeMap = buildDefinitiveDealRouteMap();
  const summary = getDefinitiveDealRouteMapSummary();
  const surfaceSummary = buildDefinitiveSurfaceMechanicsSummary();
  assertEqual(routeMap.length, DEFINITIVE_DEAL_MECHANICS_MODEL_SLOT_COUNT, 'route map covers every slot');
  assertEqual(summary.status, 'complete', 'route map summary is complete');
  assertEqual(summary.missingRouteEntries, 0, 'no active route entries are missing route metadata');
  assert(routeMap.find(route => route.slotId === 'M200')?.journeys.includes('sell'), 'M200 routes to sell journey');
  assert(routeMap.find(route => route.slotId === 'M200')?.journeys.includes('buy'), 'M200 routes to buy journey');
  assert(routeMap.find(route => route.slotId === 'M206')?.toolSurfaces.includes('studio'), 'M206 routes to Studio');
  assert(routeMap.find(route => route.slotId === 'M214')?.toolSurfaces.includes('pass_through_catalog'), 'M214 routes to pass-through catalog');
  const realEstateRoutes = findDefinitiveDealRoutes({
    journey: 'buy',
    gate: 'G30',
    dealType: 'title survey rent roll',
    league: 'L4',
    includePlanningOnly: true,
  });
  assert(realEstateRoutes.some(route => route.slotId === 'M189'), 'route search finds rent-roll model');
  assert(realEstateRoutes.some(route => route.slotId === 'M196'), 'route search finds title and survey checklist');
  const applicableMechanics = composeDefinitiveApplicableMechanics({
    journey: 'buy',
    league: 'L4',
    dealType: 'real estate sale-leaseback title survey rent roll',
    industry: 'property services',
    triggeredGates: ['G30'],
  });
  const applicableSummary = summarizeDefinitiveApplicableMechanics(applicableMechanics);
  const yuliaBrief = buildDefinitiveYuliaMechanicsBrief(applicableMechanics, applicableSummary);
  assert(applicableMechanics.some(route => route.slotId === 'M189'), 'applicable mechanics include rent-roll model');
  assert(applicableMechanics.some(route => route.slotId === 'M196'), 'applicable mechanics include title and survey checklist');
  assert(applicableSummary.total > 0, 'applicable mechanics summary counts routes');
  assert(applicableSummary.executable > 0, 'applicable mechanics exposes executable model-backed routes');
  assert(applicableMechanics.some(route => route.toolSurfaces.includes('pass_through_catalog')), 'applicable mechanics exposes pass-through catalog surfaces');
  assert(yuliaBrief.some(line => line.includes('THE LINE')), 'Yulia mechanics brief calls out THE LINE boundaries');
  assert(surfaceSummary.find(item => item.surface === 'today')?.yuliaGuidance.some(line => line.includes('next action')), 'Today summary tells Yulia how to prioritize');
  assert(surfaceSummary.find(item => item.surface === 'pipeline')?.needs.professionalHandoff.length, 'Pipeline summary exposes handoff needs');
  assert(surfaceSummary.find(item => item.surface === 'files')?.needs.passThrough.length, 'Files summary exposes pass-through needs');
  assert(surfaceSummary.find(item => item.surface === 'studio')?.visibleModelSlots.includes('M206'), 'Studio summary includes agreement mechanics');
});

await test('THE LINE inventory includes explicit blocking states', async () => {
  const inventory = listDefinitiveLineInventory();
  const summary = inventory.reduce<Record<string, number>>((acc, contract) => {
    acc[contract.lineStatus] = (acc[contract.lineStatus] || 0) + 1;
    return acc;
  }, {});
  assert((summary.ok || 0) > 0, 'line inventory has allowed actions');
  assert((summary.human_approval_required || 0) > 0, 'line inventory has human approval gates');
  assert((summary.counsel_review_required || 0) > 0, 'line inventory has counsel gates');
  assert((summary.enterprise_scope_required || 0) > 0, 'line inventory has enterprise gates');
});

await test('MCP executor refuses unsupported versions before DB work', async () => {
  const response = await executeDefinitiveMcpTool({
    userId: 1,
    toolName: 'lookup_citation',
    input: { query: 'HSR' },
    envelope: { specVersion: 'DEFINITIVE.v0.9' },
  });
  assertEqual(response.status, 400, 'unsupported version status');
  assertEqual(response.body.error, 'unsupported_version', 'unsupported version error');
});

await test('MCP executor refuses unknown tools before DB work', async () => {
  const response = await executeDefinitiveMcpTool({
    userId: 1,
    toolName: 'wire_money',
    input: {},
    envelope: {},
  });
  assertEqual(response.status, 404, 'unknown tool status');
  assert(response.body.supportedTools.includes('execute_model'), 'supported tool list is returned');
});

await test('DealPayload ingest accepts partial agent payloads and returns recursive DealState guidance', async () => {
  const response = await executeDefinitiveMcpTool({
    userId: 1,
    toolName: 'ingest_deal_payload',
    input: {
      idempotencyKey: 'smoke-agent-payload-001',
      payload: {
        intent: 'buy an HVAC services target with material real estate',
        targetName: 'Big Fake Deal',
        industry: 'HVAC services',
        jurisdiction: 'US-TX',
        revenueCents: 4_200_000_00,
        documents: [{ name: 'seller P&L', type: 'financials', hash: 'sha256:demo' }],
        signals: { realEstatePercentOfEv: 30 },
      },
    },
    envelope: {},
  });
  assertEqual(response.status, 200, 'deal payload ingest status');
  assertEqual(response.body.ok, true, 'deal payload ingest ok');
  const toolResult = response.body.result;
  const dealState = toolResult.result.dealState;
  assertEqual(toolResult.action, 'ingest_deal_payload', 'deal payload action');
  assert(dealState.cid.startsWith('definitive:deal-state:sha256:'), 'deal state is content addressed');
  assertEqual(dealState.classificationKey.journey, 'buy', 'journey inferred');
  assertEqual(dealState.classificationKey.industry, 'HVAC services', 'industry carried through');
  assert(dealState.classificationKey.triggeredOverlayGates.includes('G30'), 'G30 overlay triggered');
  assert(toolResult.result.next_suggested_calls.some((call: any) => call.toolName === 'compose_model_stack'), 'next calls include model-stack composition');
  assert(toolResult.result.portableTakeBackArtifacts.includes('MissingInputContract'), 'take-back artifacts include missing-input contract');
  assert(typeof toolResult.state_hash_after === 'string' && toolResult.state_hash_after.length === 64, 'state hash returned');
});

await test('DealState update improves completeness and preserves prior state link', async () => {
  const initial = await executeDefinitiveMcpTool({
    userId: 1,
    toolName: 'ingest_deal_payload',
    input: { payload: { intent: 'sell a founder-owned software company' } },
    envelope: {},
  });
  const priorState = initial.body.result.result.dealState;
  const updated = await executeDefinitiveMcpTool({
    userId: 1,
    toolName: 'update_deal_payload',
    input: {
      dealState: priorState,
      patch: {
        companyName: 'Sample Software LLC',
        industry: 'software',
        jurisdiction: 'US-DE',
        ebitdaCents: 1_800_000_00,
        dealStructure: 'asset sale with rollover discussion',
        documents: [{ name: 'TTM financials', type: 'financials', hash: 'sha256:ttm' }],
      },
    },
    envelope: {},
  });
  assertEqual(updated.status, 200, 'deal state update status');
  const updatedState = updated.body.result.result.dealState;
  assert(updatedState.parentCids.includes(priorState.cid), 'updated state links to prior cid');
  assert(updated.body.result.completeness_contribution_delta > 0, 'update improves completeness');
  assert(updatedState.completenessReport.score > priorState.completenessReport.score, 'updated score is higher');
});

await test('Completeness and definition-of-done tools are DB-free Deal OS control-plane calls', async () => {
  const completeness = await executeDefinitiveMcpTool({
    userId: 1,
    toolName: 'check_completeness',
    input: { payload: { intent: 'evaluate IOI for a target', targetName: 'Pipeline Target' } },
    envelope: {},
  });
  assertEqual(completeness.status, 200, 'completeness status');
  assertEqual(completeness.body.result.action, 'check_completeness', 'completeness action');
  assertEqual(completeness.body.result.result.completenessReport.canProceedWithPartialState, true, 'partial state can proceed');
  assert(completeness.body.result.result.missingInputContract.items.length > 0, 'missing input contract returned');

  const dod = await executeDefinitiveMcpTool({
    userId: 1,
    toolName: 'get_definition_of_done',
    input: { objective: 'loi' },
    envelope: {},
  });
  assertEqual(dod.status, 200, 'definition of done status');
  assert(dod.body.result.result.definitionOfDone.lifecycle.includes('IOI'), 'definition of done exposes lifecycle');
  assert(dod.body.result.result.noRejectionContract.includes('partial payload is accepted'), 'definition of done exposes no-rejection contract');
});

await test('DealPlan and DealStateDiff make recursive agent work portable', async () => {
  const plan = await executeDefinitiveMcpTool({
    userId: 1,
    toolName: 'compose_deal_plan',
    input: {
      payload: {
        journey: 'buy',
        targetName: 'Recursive Target',
        industry: 'industrial services',
        jurisdiction: 'US-DE',
        ebitdaCents: 2_400_000_00,
        documents: [{ name: 'CIM', type: 'cim', hash: 'sha256:cim' }],
      },
    },
    envelope: {},
  });
  assertEqual(plan.status, 200, 'deal plan status');
  const dealPlan = plan.body.result.result.dealPlan;
  assert(dealPlan.lifecycle.includes('IOI -> LOI -> diligence -> model'), 'deal plan shows lifecycle');
  assert(dealPlan.workSurfaces.includes('data_room'), 'deal plan includes data room surface');
  assert(dealPlan.stages.some((stage: any) => stage.id === 'loi'), 'deal plan includes LOI stage');
  assert(plan.body.result.result.portableTakeBackArtifacts.includes('DealPlan'), 'deal plan is portable');

  const diff = await executeDefinitiveMcpTool({
    userId: 1,
    toolName: 'diff_deal_state',
    input: {
      previousPayload: { journey: 'buy', targetName: 'Recursive Target' },
      nextPayload: {
        journey: 'buy',
        targetName: 'Recursive Target',
        industry: 'industrial services',
        jurisdiction: 'US-DE',
        ebitdaCents: 2_400_000_00,
      },
    },
    envelope: {},
  });
  assertEqual(diff.status, 200, 'deal state diff status');
  const dealStateDiff = diff.body.result.result.dealStateDiff;
  assert(dealStateDiff.changedPaths.includes('ebitdaCents'), 'diff tracks changed economic fact');
  assert(dealStateDiff.completenessScoreDelta > 0, 'diff tracks completeness gain');
  assert(diff.body.result.result.portableTakeBackArtifacts.includes('DealStateDiff'), 'diff is portable');
});

await test('DealPackage gives agents a complete take-back packet', async () => {
  const response = await executeDefinitiveMcpTool({
    userId: 1,
    toolName: 'compose_deal_package',
    input: {
      payload: {
        journey: 'buy',
        targetName: 'Package Target',
        industry: 'business services',
        jurisdiction: 'US-TX',
        ebitdaCents: 3_100_000_00,
        dealStructure: 'asset purchase with rollover',
        documents: [{ name: 'QoE draft', type: 'qoe', hash: 'sha256:qoe' }],
      },
    },
    envelope: {},
  });
  assertEqual(response.status, 200, 'deal package status');
  const dealPackage = response.body.result.result.dealPackage;
  assert(dealPackage.packageCid.startsWith('definitive:deal-package:sha256:'), 'deal package is content addressed');
  assert(dealPackage.takeBackArtifacts.includes('DealPackage'), 'package includes itself as take-back artifact');
  assert(dealPackage.next_suggested_calls.some((call: any) => call.toolName === 'compose_model_stack'), 'package includes next calls');
  assertEqual(dealPackage.classificationKey.journey, 'buy', 'package preserves classification');
});

await test('Resume deal returns current lifecycle position and next calls', async () => {
  const response = await executeDefinitiveMcpTool({
    userId: 1,
    toolName: 'resume_deal',
    input: {
      payload: {
        journey: 'buy',
        targetName: 'Resume Target',
        industry: 'software',
        jurisdiction: 'US-DE',
        ebitdaCents: 1_900_000_00,
        dealStructure: 'asset purchase',
        documents: [{ name: 'CIM', type: 'cim', hash: 'sha256:resume-cim' }],
      },
    },
    envelope: {},
  });
  assertEqual(response.status, 200, 'resume deal status');
  const result = response.body.result.result;
  assert(result.currentStage, 'resume exposes current stage');
  assert(result.dealPlan.lifecycle.includes('information -> IOI -> LOI'), 'resume preserves lifecycle');
  assert(result.dealPackage.takeBackArtifacts.includes('DealPackage'), 'resume includes deal package');
  assert(result.resumeContract.recursiveLoop.includes('update_deal_payload'), 'resume explains recursive loop');
  assert(result.next_suggested_calls.length > 0, 'resume includes next calls');
});

await test('DataRoomIndex groups files and names source gaps', async () => {
  const response = await executeDefinitiveMcpTool({
    userId: 1,
    toolName: 'compose_data_room_index',
    input: {
      payload: {
        journey: 'buy',
        targetName: 'Files Target',
        industry: 'software',
        jurisdiction: 'US-CA',
        documents: [
          { name: 'QoE report', type: 'qoe', hash: 'sha256:qoe' },
          { name: 'Patent assignment schedule', type: 'ip', hash: 'sha256:ip' },
          { name: 'Customer concentration export', type: 'commercial', hash: 'sha256:customer' },
        ],
      },
    },
    envelope: {},
  });
  assertEqual(response.status, 200, 'data room index status');
  const index = response.body.result.result.dataRoomIndex;
  assertEqual(index.schema, 'DataRoomIndex.v0.1', 'data room schema');
  assert(index.categories.some((category: any) => category.id === 'financials' && category.status === 'present'), 'financial files are present');
  assert(index.categories.some((category: any) => category.id === 'ip' && category.status === 'present'), 'IP files are present');
  assert(index.sourceGaps.some((gap: any) => gap.category === 'legal'), 'legal source gap is named');
  assert(index.takeBackArtifacts.includes('DataRoomIndex'), 'data room index is portable');
});

await test('DisclosureSubset scopes data-room sources without external transmission', async () => {
  const response = await executeDefinitiveMcpTool({
    userId: 1,
    toolName: 'disclose_subset',
    input: {
      categories: ['financials', 'ip'],
      audience: 'external_agent',
      payload: {
        journey: 'buy',
        targetName: 'Subset Target',
        industry: 'software',
        jurisdiction: 'US-DE',
        documents: [
          { id: 'qoe', name: 'QoE report', type: 'qoe', hash: 'sha256:qoe' },
          { id: 'ip-schedule', name: 'Patent assignment schedule', type: 'ip', hash: 'sha256:ip' },
          { id: 'customer-list', name: 'Customer concentration export', type: 'commercial', hash: 'sha256:customer' },
        ],
      },
    },
    envelope: {},
  });
  assertEqual(response.status, 200, 'disclosure subset status');
  const subset = response.body.result.result.disclosureSubset;
  assertEqual(subset.schema, 'DisclosureSubset.v0.1', 'disclosure subset schema');
  assert(subset.sources.some((source: any) => source.category === 'financials'), 'financial source is selected');
  assert(subset.sources.some((source: any) => source.category === 'ip'), 'IP source is selected');
  assert(!subset.sources.some((source: any) => source.category === 'commercial'), 'commercial source is excluded from scoped subset');
  assertEqual(subset.disclosureBoundary.noExternalTransmission, true, 'subset does not transmit externally');
  assert(subset.takeBackArtifacts.includes('SelectiveDisclosureProof'), 'subset includes selective proof take-back');
});

await test('DocumentDraft creates a source-aware Studio scaffold', async () => {
  const response = await executeDefinitiveMcpTool({
    userId: 1,
    toolName: 'compose_document_draft',
    input: {
      documentType: 'ic_memo',
      payload: {
        journey: 'buy',
        targetName: 'Studio Target',
        industry: 'manufacturing',
        jurisdiction: 'US-DE',
        ebitdaCents: 2_200_000_00,
        documents: [
          { id: 'qoe', name: 'QoE report', type: 'qoe', hash: 'sha256:qoe' },
          { id: 'customers', name: 'Customer list', type: 'commercial', hash: 'sha256:customer' },
        ],
      },
    },
    envelope: {},
  });
  assertEqual(response.status, 200, 'document draft status');
  const draft = response.body.result.result.documentDraft;
  assertEqual(draft.schema, 'DocumentDraft.v0.1', 'document draft schema');
  assertEqual(draft.documentType, 'ic_memo', 'document draft type');
  assert(draft.sections.some((section: any) => section.id === 'financial_model'), 'IC memo has financial model section');
  assert(draft.sections.some((section: any) => section.status === 'needs_source'), 'draft marks source gaps by section');
  assertEqual(draft.exportBoundary.noExternalTransmission, true, 'draft does not export externally');
  assert(draft.takeBackArtifacts.includes('DocumentDraft'), 'document draft is portable');
});

await test('Corpus discovery and sanitizer block raw identifiers without DB work', async () => {
  const types = listDefinitiveCorpusObservationTypes();
  assert(types.observationTypes.some(item => item.type === 'nwc_peg'), 'nwc observation type is advertised');
  assert(types.observationTypes.every(item => item.rawDocumentTextAllowed === false), 'raw text is disallowed');

  const sanitized = sanitizeCorpusObservation({
    companyName: 'Acme Industrial LLC',
    pegAmountCents: 42500000,
    buyerEmail: 'buyer@example.com',
    terms: {
      methodology: 'average monthly working capital',
      rawText: 'verbatim document text should not leave the workspace',
    },
  });
  assertEqual(sanitized.sanitized.companyName, undefined, 'company name is removed');
  assertEqual(sanitized.sanitized.buyerEmail, undefined, 'email key is removed');
  assertEqual(sanitized.sanitized.pegAmountCents, 42500000, 'structured number survives');
  assertEqual(sanitized.sanitized.terms.methodology, 'average monthly working capital', 'structured term survives');
  assert(sanitized.redactions.includes('companyName'), 'companyName redaction is tracked');
  assert(sanitized.redactions.includes('buyerEmail'), 'buyerEmail redaction is tracked');
  assert(sanitized.redactions.includes('terms.rawText'), 'rawText redaction is tracked');
});

await test('Conformance status tool is DB-free and version pinned', async () => {
  const response = await executeDefinitiveMcpTool({
    userId: 1,
    toolName: 'validate_conformance',
    input: {},
    envelope: {},
  });
  assertEqual(response.status, 200, 'conformance tool status');
  assertEqual(response.body.ok, true, 'conformance tool ok');
  assertEqual(response.body.result.cases.modelRuntime, DEFINITIVE_CONFORMANCE_MODEL_RUNTIME_CASE_COUNT, 'conformance case count');
  assert(response.body.result.categories.includes('working_capital'), 'working capital category included');
});

await test('V20 overlay routing detects G28/G29/G30 without executing unbuilt models', async () => {
  const distressed = evaluateDefinitiveStackOverlays({
    dealType: 'Chapter 11 plan with DIP financing',
    industry: 'industrial services',
    jurisdiction: 'US-DE',
    signals: { cashRunwayDays: 45 },
  });
  const capitalStructure = evaluateDefinitiveStackOverlays({
    dealType: 'uptier exchange offer and covenant amendment',
    industry: 'consumer products',
    jurisdiction: 'US-NY',
    signals: { securedDebtTradingPriceCents: 75 },
  });
  const realEstate = evaluateDefinitiveStackOverlays({
    dealType: 'real estate sale-leaseback with title, survey, rent roll, NOI, and 1031 exchange',
    industry: 'property services',
    jurisdiction: 'US',
    signals: { realEstatePercentOfEv: 30 },
  });

  assert(distressed.find(item => item.gateId === 'G28')?.triggered, 'G28 distressed overlay triggers');
  assert(capitalStructure.find(item => item.gateId === 'G29')?.triggered, 'G29 capital-structure overlay triggers');
  assert(realEstate.find(item => item.gateId === 'G30')?.triggered, 'G30 asset-class overlay triggers');
  assert(distressed.every(item => Array.isArray(item.executableRuntimeModels)), 'overlays expose executable runtime model arrays');
  assert(distressed.find(item => item.gateId === 'G28')?.catalogModels.includes('M151'), 'G28 exposes restructuring catalog models');
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);

async function test(name: string, fn: () => Promise<void> | void) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (error: any) {
    console.log(`  ✗ ${name} - ${error.message}`);
    failed++;
  }
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) {
    throw new Error(`${message}. Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertDeepEqual<T>(actual: T, expected: T, message: string) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}. Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}
