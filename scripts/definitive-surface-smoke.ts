#!/usr/bin/env npx tsx
/**
 * Smoke test for the DB-free DEFINITIVE discovery surface.
 *
 * This catches accidental drift in the agent card, MCP inventory, version
 * envelope, and THE LINE inventory before we wire external-agent clients.
 *
 * Run: npm run test:definitive-surface
 */

import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
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
import {
  buildDefinitiveEnterpriseAllowListTemplates,
  buildDefinitiveRegistryPackage,
} from '../server/services/definitiveRegistryPackage.js';
import {
  buildDefinitiveModelCatalogSurface,
  getDefinitiveModelSlotSurface,
} from '../server/services/definitiveModelCatalogSurface.js';
import {
  buildDefinitiveDealRunbooksSurface,
  getDefinitiveDealRunbook,
} from '../server/services/definitiveDealRunbooks.js';
import { buildDefinitiveSchemaRegistry } from '../server/services/definitiveSchemas.js';
import { buildDefinitiveSpecManifest } from '../server/services/definitiveSpecManifest.js';
import { evaluateDefinitiveStackOverlays } from '../server/services/definitiveStackOverlays.js';
import { executeDefinitiveMcpTool, listDefinitiveMcpTools } from '../server/services/definitiveMcp.js';

const expectedTools = [
  'ingest_deal_payload',
  'update_deal_payload',
  'check_completeness',
  'get_definition_of_done',
  'introspect_capabilities',
  'describe_methodology',
  'estimate_deal_cost',
  'get_deal_runbook',
  'lookup_model_slot',
  'compose_deal_plan',
  'diff_deal_state',
  'compose_deal_package',
  'resume_deal',
  'compose_lifecycle_trace',
  'prepare_ioi_packet',
  'prepare_loi_packet',
  'compose_data_room_index',
  'prepare_diligence_request',
  'disclose_subset',
  'compose_document_draft',
  'prepare_negotiation_brief',
  'compose_close_readiness',
  'generate_funds_flow',
  'compose_pmi_plan',
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
  assertEqual(card.definitive.latestDealStateEndpoint, '/api/definitive/deal-state/latest', 'latest deal-state endpoint');
  assertEqual(card.definitive.dealPacketsEndpoint, '/api/definitive/deal-packets', 'deal packets endpoint');
  assertEqual(card.definitive.auditPacketEndpoint, '/api/definitive/audit-packets/{auditTrailId}', 'audit packet endpoint');
  assertEqual(card.definitive.corpusObservationTypesEndpoint, '/api/definitive/corpus/observation-types', 'corpus observation endpoint');
  assertEqual(card.definitive.passThroughCatalogEndpoint, '/api/definitive/pass-through-catalog', 'pass-through catalog endpoint');
  assertEqual(card.definitive.authoritySeedPlanEndpoint, '/api/definitive/authority-seed-plan', 'authority seed plan endpoint');
  assertEqual(card.definitive.substrateArchitectureEndpoint, '/api/definitive/substrate-architecture', 'substrate architecture endpoint');
  assertEqual(card.definitive.dealRunbooksEndpoint, '/api/definitive/deal-runbooks', 'deal runbooks endpoint');
  assertEqual(card.definitive.dealRunbookEndpoint, '/api/definitive/deal-runbooks/{journey}', 'deal runbook endpoint');
  assertEqual(card.definitive.modelCatalogEndpoint, '/api/definitive/model-catalog', 'model catalog endpoint');
  assertEqual(card.definitive.modelSlotEndpoint, '/api/definitive/model-catalog/{slotId}', 'model slot endpoint');
  assertEqual(card.definitive.dealMechanicsModelSlotEndpoint, '/api/definitive/deal-mechanics/models/{slotId}', 'deal mechanics model slot endpoint');
  assertEqual(card.definitive.registryPackageEndpoint, '/api/definitive/registry-package', 'registry package endpoint');
  assertEqual(card.definitive.enterpriseAllowListsEndpoint, '/api/definitive/enterprise-allow-lists', 'enterprise allow-list endpoint');
  assertEqual(card.definitive.dealMechanicsVersion, DEFINITIVE_DEAL_MECHANICS_VERSION, 'deal mechanics version');
  assertEqual(card.definitive.dealMechanicsModelSlots, DEFINITIVE_DEAL_MECHANICS_MODEL_SLOT_COUNT, 'deal mechanics model slots');
  assertEqual(card.definitive.dealMechanicsGates, DEFINITIVE_DEAL_MECHANICS_GATE_COUNT, 'deal mechanics gate count');
  assertEqual(card.definitive.authorityRegisterTarget, DEFINITIVE_DEAL_MECHANICS_AUTHORITY_TARGET, 'agent card authority target');
  assert(card.definitive.authoritySeedPlanEntries >= DEFINITIVE_DEAL_MECHANICS_AUTHORITY_TARGET, 'agent card authority seed plan meets target');
  assertEqual(card.definitive.authoritySeedPlanStatus, 'ready_for_800_plus_seeding', 'agent card authority seed plan status');
  assertEqual(card.definitive.substratePrimitiveCount, 8, 'agent card substrate primitive count');
  assertEqual(card.definitive.substrateNewMcpToolCount, 33, 'agent card substrate tool count');
  assert(card.definitive.schemaRegistryNames.includes('DealPayload'), 'agent card exposes DealPayload schema');
  assert(card.definitive.schemaRegistryNames.includes('DealState'), 'agent card exposes DealState schema');
  assert(card.definitive.schemaRegistryNames.includes('DealStateDiff'), 'agent card exposes DealStateDiff schema');
  assert(card.definitive.dealOsDoctrine.includes('Deal OS'), 'agent card exposes Deal OS doctrine');
  assertDeepEqual(card.definitive.dealRunbookJourneys, ['buy', 'sell', 'raise', 'pmi'], 'agent card exposes deal runbook journeys');
  assert(card.definitive.dealRunbookLoopContract.includes('ingest_or_resume'), 'agent card exposes recursive runbook loop');
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
  assert(card.publicEndpoints.includes('/api/definitive/deal-runbooks'), 'deal runbooks endpoint is public discovery');
  assert(card.publicEndpoints.includes('/api/definitive/deal-runbooks/{journey}'), 'deal runbook endpoint is public discovery');
  assert(card.publicEndpoints.includes('/api/definitive/model-catalog'), 'model catalog endpoint is public discovery');
  assert(card.publicEndpoints.includes('/api/definitive/model-catalog/{slotId}'), 'model slot endpoint is public discovery');
  assert(card.publicEndpoints.includes('/api/definitive/deal-mechanics/models/{slotId}'), 'deal mechanics model slot endpoint is public discovery');
  assert(card.publicEndpoints.includes('/api/definitive/registry-package'), 'registry package endpoint is public discovery');
  assert(card.publicEndpoints.includes('/api/definitive/enterprise-allow-lists'), 'enterprise allow-list endpoint is public discovery');
  assert(!card.publicEndpoints.includes('/api/definitive/tools/{toolName}/call'), 'tool execution is not public');
  assert(card.authenticatedEndpoints.includes('/api/definitive/line/inventory'), 'line inventory endpoint is authenticated');
  assert(card.authenticatedEndpoints.includes('/api/definitive/corpus/observation-types'), 'corpus observation endpoint is authenticated');
  assert(card.authenticatedEndpoints.includes('/api/definitive/deal-state/latest'), 'latest deal-state endpoint is authenticated');
  assert(card.authenticatedEndpoints.includes('/api/definitive/deal-packets'), 'deal packets endpoint is authenticated');
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
  assertEqual(substrateCapability.newMcpToolCount, 33, 'substrate capability tool count');
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
  assertEqual(manifest.endpoints.registryPackage, '/api/definitive/registry-package', 'manifest registry package endpoint');
  assertEqual(manifest.endpoints.enterpriseAllowLists, '/api/definitive/enterprise-allow-lists', 'manifest enterprise allow-list endpoint');
  assertEqual(manifest.endpoints.latestDealState, '/api/definitive/deal-state/latest', 'manifest latest deal-state endpoint');
  assertEqual(manifest.endpoints.dealPackets, '/api/definitive/deal-packets', 'manifest deal packets endpoint');
  assert(manifest.access.publicDiscovery.includes('/api/definitive/spec'), 'manifest spec API is public discovery');
  assert(manifest.access.publicDiscovery.includes('/.well-known/mcp'), 'manifest MCP discovery is public');
  assert(manifest.access.publicDiscovery.includes('/.well-known/mcp/server-card.json'), 'manifest MCP server-card is public');
  assert(manifest.access.publicDiscovery.includes('/.well-known/definitive-schemas.json'), 'manifest schema well-known is public');
  assert(manifest.access.publicDiscovery.includes('/api/definitive/schemas'), 'manifest schema registry is public');
  assert(manifest.access.publicDiscovery.includes('/api/definitive/pass-through-catalog'), 'manifest pass-through catalog is public discovery');
  assert(manifest.access.publicDiscovery.includes('/api/definitive/authority-seed-plan'), 'manifest authority seed plan is public discovery');
  assert(manifest.access.publicDiscovery.includes('/api/definitive/substrate-architecture'), 'manifest substrate architecture is public discovery');
  assert(manifest.access.publicDiscovery.includes('/api/definitive/registry-package'), 'manifest registry package is public discovery');
  assert(manifest.access.publicDiscovery.includes('/api/definitive/enterprise-allow-lists'), 'manifest enterprise allow-list is public discovery');
  assert(manifest.access.authenticatedDiscovery.includes('/api/definitive/tools/list'), 'manifest tools list is authenticated discovery');
  assert(manifest.access.authenticatedExecution.includes('/api/definitive/tools/{toolName}/call'), 'manifest tool call is authenticated execution');
  assert(manifest.access.authenticatedExecution.includes('/api/definitive/deal-state/latest'), 'manifest latest deal-state is authenticated execution');
  assert(manifest.access.authenticatedExecution.includes('/api/definitive/deal-packets'), 'manifest deal packets is authenticated execution');
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
  assertEqual(manifest.substrateArchitectureSurface.newMcpToolCount, 33, 'manifest substrate tool count');
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
  assertEqual(manifest.endpoints.dealRunbooks, '/api/definitive/deal-runbooks', 'manifest deal runbooks endpoint');
  assertEqual(manifest.endpoints.dealRunbook, '/api/definitive/deal-runbooks/{journey}', 'manifest deal runbook endpoint');
  assert(manifest.access.publicDiscovery.includes('/api/definitive/deal-runbooks'), 'manifest public discovery includes deal runbooks');
  assert(manifest.access.publicDiscovery.includes('/api/definitive/deal-runbooks/{journey}'), 'manifest public discovery includes deal runbook endpoint');
  assertEqual(manifest.dealRunbooksSurface.summary.journeyCount, 4, 'manifest deal runbooks journey count');
  assert(manifest.dealRunbooksSurface.summary.loopContract.includes('package_take_back'), 'manifest runbook surface exposes loop contract');
  assert(manifest.dealRunbooksSurface.journeys.includes('buy'), 'manifest runbook surface includes buy journey');
  assert(manifest.dealRunbooksSurface.universalTakeBackArtifacts.includes('DealPackage'), 'manifest runbook surface exposes take-back artifacts');
  assertEqual(manifest.endpoints.modelCatalog, '/api/definitive/model-catalog', 'manifest model catalog endpoint');
  assertEqual(manifest.endpoints.modelSlot, '/api/definitive/model-catalog/{slotId}', 'manifest model slot endpoint');
  assertEqual(manifest.endpoints.dealMechanicsModelSlot, '/api/definitive/deal-mechanics/models/{slotId}', 'manifest deal mechanics model slot endpoint');
  assert(manifest.access.publicDiscovery.includes('/api/definitive/model-catalog'), 'manifest public discovery includes model catalog');
  assert(manifest.access.publicDiscovery.includes('/api/definitive/model-catalog/{slotId}'), 'manifest public discovery includes model slot endpoint');
  assert(manifest.access.publicDiscovery.includes('/api/definitive/deal-mechanics/models/{slotId}'), 'manifest public discovery includes deal mechanics slot endpoint');
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
  assertEqual(serverCard.definitive.dealRunbooks, `${origin}/api/definitive/deal-runbooks`, 'MCP server-card exposes deal runbooks URL');
  assertEqual(serverCard.definitive.dealRunbook, `${origin}/api/definitive/deal-runbooks/{journey}`, 'MCP server-card exposes deal runbook URL');
  assertEqual(serverCard.definitive.modelCatalog, `${origin}/api/definitive/model-catalog`, 'MCP server-card exposes model catalog URL');
  assertEqual(serverCard.definitive.modelSlot, `${origin}/api/definitive/model-catalog/{slotId}`, 'MCP server-card exposes model slot URL');
  assertEqual(serverCard.definitive.dealMechanicsModelSlot, `${origin}/api/definitive/deal-mechanics/models/{slotId}`, 'MCP server-card exposes deal mechanics model slot URL');
  assertEqual(serverCard.definitive.registryPackage, `${origin}/api/definitive/registry-package`, 'MCP server-card exposes registry package URL');
  assertEqual(serverCard.definitive.enterpriseAllowLists, `${origin}/api/definitive/enterprise-allow-lists`, 'MCP server-card exposes enterprise allow-list URL');
  assertEqual(serverCard.security.noSuccessFees, true, 'MCP server-card blocks success fees');
  assertEqual(serverCard.security.noReferralCompensation, true, 'MCP server-card blocks referral compensation');

  assertEqual(mcpManifest.mcp_version, '2025-12-11', 'MCP manifest version');
  assertEqual(mcpManifest.server_card, `${origin}/.well-known/mcp/server-card.json`, 'MCP manifest server-card URL');
  assert(mcpManifest.endpoints.some((endpoint: any) => endpoint.type === 'definitive-manifest' && endpoint.auth === 'none'), 'MCP manifest points to public DEFINITIVE manifest');
  assert(mcpManifest.endpoints.some((endpoint: any) => endpoint.type === 'definitive-schema-registry' && endpoint.auth === 'none'), 'MCP manifest points to public schema registry');
  assert(mcpManifest.endpoints.some((endpoint: any) => endpoint.type === 'definitive-deal-runbooks' && endpoint.auth === 'none'), 'MCP manifest points to public deal runbooks');
  assert(mcpManifest.endpoints.some((endpoint: any) => endpoint.type === 'definitive-model-catalog' && endpoint.auth === 'none'), 'MCP manifest points to public model catalog');
  assertEqual(mcpManifest.capabilities.outputSchema, true, 'MCP manifest declares output schemas');
  assertEqual(mcpManifest.capabilities.auditTrail, true, 'MCP manifest declares audit trail support');
  assertEqual(mcpManifest.doctrine.standard, 'The Diligence Standard', 'MCP manifest standard doctrine');
  assertEqual(mcpManifest.doctrine.namingConvention, 'diligence_<phase>_<artifact>', 'MCP manifest naming convention');
});

await test('Registry package gives enterprise admins allow-list templates', async () => {
  const origin = 'https://example.smbx.ai';
  const registryPackage = buildDefinitiveRegistryPackage(origin);
  const allowLists = buildDefinitiveEnterpriseAllowListTemplates(origin);

  assertEqual(registryPackage.schema, 'DEFINITIVE.registry-package.v0.1', 'registry package schema');
  assertEqual(registryPackage.registryEntry.namespace, 'smbx-ai/diligence', 'registry package namespace');
  assertEqual(registryPackage.registryEntry.serverCardUrl, `${origin}/.well-known/mcp/server-card.json`, 'registry package server-card URL');
  assert(registryPackage.registryEntry.tags.includes('working capital peg'), 'registry package has semantic tags');
  assertEqual(registryPackage.registryEntry.trustSignals.noSuccessFees, true, 'registry package blocks success fees');
  assertEqual(registryPackage.registryEntry.trustSignals.noReferralCompensation, true, 'registry package blocks referral compensation');
  assertEqual(registryPackage.server.dealRunbooksUrl, `${origin}/api/definitive/deal-runbooks`, 'registry package exposes deal runbooks URL');
  assertEqual(registryPackage.enterpriseAllowListTemplates.schema, 'DEFINITIVE.enterprise-allow-lists.v0.1', 'registry package embeds allow-list templates');
  assertEqual(registryPackage.registrySubmissionPackages.canonicalNamespace, 'smbx-ai/diligence', 'registry submissions preserve canonical namespace');
  assertEqual(registryPackage.registrySubmissionPackages.canonicalMcpRegistry.serverCardUrl, `${origin}/.well-known/mcp/server-card.json`, 'canonical registry package has server card');
  assert(registryPackage.registrySubmissionPackages.thirdPartyDirectories.some((surface: any) => surface.surfaceId === 'pulsemcp'), 'registry package includes PulseMCP submission surface');
  assert(registryPackage.registrySubmissionPackages.thirdPartyDirectories.some((surface: any) => surface.surfaceId === 'glama'), 'registry package includes Glama submission surface');
  assert(registryPackage.registrySubmissionPackages.thirdPartyDirectories.some((surface: any) => surface.surfaceId === 'smithery'), 'registry package includes Smithery submission surface');
  assert(registryPackage.registrySubmissionPackages.thirdPartyDirectories.some((surface: any) => surface.surfaceId === 'docker_mcp_catalog'), 'registry package includes Docker MCP Catalog surface');
  assert(registryPackage.registrySubmissionPackages.clientStorePackages.some((surface: any) => surface.surfaceId === 'claude_connector_directory'), 'registry package includes Claude connector candidate');
  assert(registryPackage.registrySubmissionPackages.clientStorePackages.some((surface: any) => surface.surfaceId === 'chatgpt_apps_directory'), 'registry package includes ChatGPT app candidate');
  assert(registryPackage.registrySubmissionPackages.clientStorePackages.some((surface: any) => surface.surfaceId === 'salesforce_agentexchange'), 'registry package includes Salesforce AgentExchange candidate');
  assert(registryPackage.registrySubmissionPackages.clientStorePackages.some((surface: any) => surface.surfaceId === 'google_agent_gallery'), 'registry package includes Google Agent Gallery candidate');
  assert(registryPackage.registrySubmissionPackages.semanticToolMetadataChecklist.some((item: string) => item.includes('outputSchema')), 'registry package checks outputSchema metadata');
  assert(registryPackage.registrySubmissionPackages.semanticToolMetadataChecklist.some((item: string) => item.includes('recurring Deal OS')), 'registry package keeps Deal OS discoverability');

  assertEqual(allowLists.githubCopilotRegistry.policyMode, 'registry_only', 'GitHub Copilot registry-only posture');
  assertEqual(allowLists.githubCopilotRegistry.registry.servers[0].id, 'smbx-ai/diligence', 'GitHub registry server id');
  assert(allowLists.githubCopilotRegistry.registry.servers[0].allowedTools.includes('introspect_capabilities'), 'allow-list includes capability introspection');
  assert(allowLists.kiroAwsQRegistry.servers[0].allowTools.includes('describe_methodology'), 'Kiro/AWS registry includes methodology tool');
  assert(allowLists.azureApiCenterBlueprint.endpoints.toolCall.endsWith('/api/definitive/tools/call'), 'Azure blueprint exposes tool call');
  assert(allowLists.bedrockAgentCoreCedarPolicyTemplate.policy.includes('requestedToolLineStatus != "LINE_VIOLATION"'), 'Cedar policy preserves THE LINE');
  assert(allowLists.microsoftEntraAgentIdTemplate.claimsRequired.includes('beneficial_customer_id'), 'Entra template requires beneficial customer claim');
});

await test('DEFINITIVE schema registry publishes portable agent contracts', async () => {
  const registry = buildDefinitiveSchemaRegistry();
  assertEqual(registry.version, 'DEFINITIVE.schemas.v0.1', 'schema registry version');
  assert(registry.schemaNames.includes('DealPayload'), 'schema registry exposes DealPayload');
  assert(registry.schemaNames.includes('ClassificationKey'), 'schema registry exposes ClassificationKey');
  assert(registry.schemaNames.includes('DealState'), 'schema registry exposes DealState');
  assert(registry.schemaNames.includes('MissingInputContract'), 'schema registry exposes MissingInputContract');
  assert(registry.schemaNames.includes('CompletenessSpec'), 'schema registry exposes CompletenessSpec');
  assert(registry.schemaNames.includes('DealReadinessLevel'), 'schema registry exposes DealReadinessLevel');
  assert(registry.schemaNames.includes('CompletenessReport'), 'schema registry exposes CompletenessReport');
  assert(registry.schemaNames.includes('DealPlan'), 'schema registry exposes DealPlan');
  assert(registry.schemaNames.includes('GateState'), 'schema registry exposes GateState');
  assert(registry.schemaNames.includes('PipelineStageDelta'), 'schema registry exposes PipelineStageDelta');
  assert(registry.schemaNames.includes('DealStateDiff'), 'schema registry exposes DealStateDiff');
  assert(registry.schemaNames.includes('CapabilityCatalog'), 'schema registry exposes CapabilityCatalog');
  assert(registry.schemaNames.includes('MethodologyDescription'), 'schema registry exposes MethodologyDescription');
  assert(registry.schemaNames.includes('DealCostEstimate'), 'schema registry exposes DealCostEstimate');
  assert(registry.schemaNames.includes('ModelOutput'), 'schema registry exposes ModelOutput');
  assert(registry.schemaNames.includes('SourceIndex'), 'schema registry exposes SourceIndex');
  assert(registry.schemaNames.includes('SourceGapList'), 'schema registry exposes SourceGapList');
  assert(registry.schemaNames.includes('SelectiveDisclosureProof'), 'schema registry exposes SelectiveDisclosureProof');
  assert(registry.schemaNames.includes('AssumptionLog'), 'schema registry exposes AssumptionLog');
  assert(registry.schemaNames.includes('OutputHash'), 'schema registry exposes OutputHash');
  assert(registry.schemaNames.includes('AuditPacket'), 'schema registry exposes AuditPacket');
  assert(registry.schemaNames.includes('MerkleInclusionProof'), 'schema registry exposes MerkleInclusionProof');
  assert(registry.schemaNames.includes('DealPackage'), 'schema registry exposes DealPackage');
  assert(registry.schemaNames.includes('LifecycleTrace'), 'schema registry exposes LifecycleTrace');
  assert(registry.schemaNames.includes('IOIPacket'), 'schema registry exposes IOIPacket');
  assert(registry.schemaNames.includes('LOIPacket'), 'schema registry exposes LOIPacket');
  assert(registry.schemaNames.includes('DataRoomIndex'), 'schema registry exposes DataRoomIndex');
  assert(registry.schemaNames.includes('DiligenceRequest'), 'schema registry exposes DiligenceRequest');
  assert(registry.schemaNames.includes('DisclosureSubset'), 'schema registry exposes DisclosureSubset');
  assert(registry.schemaNames.includes('DocumentDraft'), 'schema registry exposes DocumentDraft');
  assert(registry.schemaNames.includes('NegotiationBrief'), 'schema registry exposes NegotiationBrief');
  assert(registry.schemaNames.includes('CloseReadiness'), 'schema registry exposes CloseReadiness');
  assert(registry.schemaNames.includes('FundsFlow'), 'schema registry exposes FundsFlow');
  assert(registry.schemaNames.includes('PMIPlan'), 'schema registry exposes PMIPlan');
  assert(registry.terminalSubstrateSchemas.includes('CompletenessSpec'), 'schema registry publishes terminal substrate schema list');
  assert(registry.portableTakeBackSchemas.includes('ModelOutput'), 'schema registry publishes portable take-back schema list');
  const referencedSchemas = new Set<string>();
  Object.values(registry.toolSchemaMap).forEach((mapping: any) => {
    [...mapping.input, ...mapping.output, ...mapping.takeBack].forEach((schemaName: string) => referencedSchemas.add(schemaName));
  });
  const danglingSchemas = [...referencedSchemas].filter(schemaName => !registry.schemaNames.includes(schemaName));
  assertEqual(danglingSchemas.join(', '), '', 'all tool schema map refs resolve to published schemas');
  assertEqual(registry.schemas.DealPayload.properties.revenueCents.type, 'integer', 'money is cents integer');
  assertEqual(registry.schemas.ModelOutput.properties.modelId.pattern, '^M[0-9]{3}$', 'ModelOutput pins deterministic M-slot identifiers');
  assertEqual(registry.schemas.SelectiveDisclosureProof.required.includes('proofHash'), true, 'SelectiveDisclosureProof requires proof hash');
  assert(registry.toolSchemaMap.ingest_deal_payload.output.includes('MissingInputContract'), 'ingest output maps missing input contract');
  assert(registry.toolSchemaMap.introspect_capabilities.takeBack.includes('CapabilityCatalog'), 'capability introspection maps CapabilityCatalog');
  assert(registry.toolSchemaMap.describe_methodology.takeBack.includes('MethodologyDescription'), 'methodology description maps MethodologyDescription');
  assert(registry.toolSchemaMap.estimate_deal_cost.takeBack.includes('DealCostEstimate'), 'cost estimate maps DealCostEstimate');
  assert(registry.toolSchemaMap.get_deal_runbook.takeBack.includes('DealPlan'), 'deal runbook maps DealPlan');
  assert(registry.toolSchemaMap.lookup_model_slot.takeBack.includes('ModelOutput'), 'model slot lookup maps ModelOutput');
  assert(registry.toolSchemaMap.diff_deal_state.takeBack.includes('DealStateDiff'), 'diff take-back maps DealStateDiff');
  assert(registry.toolSchemaMap.compose_deal_package.takeBack.includes('DealPackage'), 'package take-back maps DealPackage');
  assert(registry.toolSchemaMap.resume_deal.takeBack.includes('DealPackage'), 'resume take-back maps DealPackage');
  assert(registry.toolSchemaMap.compose_lifecycle_trace.takeBack.includes('LifecycleTrace'), 'lifecycle trace maps LifecycleTrace');
  assert(registry.toolSchemaMap.prepare_ioi_packet.takeBack.includes('IOIPacket'), 'IOI packet maps IOIPacket');
  assert(registry.toolSchemaMap.prepare_loi_packet.takeBack.includes('LOIPacket'), 'LOI packet maps LOIPacket');
  assert(registry.toolSchemaMap.compose_data_room_index.takeBack.includes('DataRoomIndex'), 'data room take-back maps DataRoomIndex');
  assert(registry.toolSchemaMap.prepare_diligence_request.takeBack.includes('DiligenceRequest'), 'diligence request maps DiligenceRequest');
  assert(registry.toolSchemaMap.disclose_subset.takeBack.includes('DisclosureSubset'), 'disclosure subset maps DisclosureSubset');
  assert(registry.toolSchemaMap.compose_document_draft.takeBack.includes('DocumentDraft'), 'document draft maps DocumentDraft');
  assert(registry.toolSchemaMap.prepare_negotiation_brief.takeBack.includes('NegotiationBrief'), 'negotiation brief maps NegotiationBrief');
  assert(registry.toolSchemaMap.compose_close_readiness.takeBack.includes('CloseReadiness'), 'close readiness maps CloseReadiness');
  assert(registry.toolSchemaMap.generate_funds_flow.takeBack.includes('FundsFlow'), 'funds flow maps FundsFlow');
  assert(registry.toolSchemaMap.compose_pmi_plan.takeBack.includes('PMIPlan'), 'PMI plan maps PMIPlan');
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

await test('Model catalog surface gives agents stable M-slot lookups', async () => {
  const surface = buildDefinitiveModelCatalogSurface();
  const laterSurface = buildDefinitiveModelCatalogSurface({ limit: 50, cursor: 100 });
  const m200 = getDefinitiveModelSlotSurface('m200') as any;
  const m206 = getDefinitiveModelSlotSurface('M206') as any;
  const missing = getDefinitiveModelSlotSurface('M999');

  assertEqual(surface.schema, 'DEFINITIVE.model-catalog-surface.v0.1', 'model catalog surface schema');
  assertEqual(surface.summary.totalModelSlots, DEFINITIVE_DEAL_MECHANICS_MODEL_SLOT_COUNT, 'model catalog surface total slots');
  assertEqual(surface.mappingCoverage.status, 'complete', 'model catalog surface mapping coverage');
  assertEqual(surface.routeMapSummary.status, 'complete', 'model catalog route map status');
  assertEqual(surface.models.length, 50, 'model catalog surface defaults to bounded model page');
  assertEqual(surface.pagination.total, DEFINITIVE_DEAL_MECHANICS_MODEL_SLOT_COUNT, 'model catalog pagination preserves total');
  assertEqual(surface.pagination.nextCursor, '50', 'model catalog pagination exposes next cursor');
  assertEqual(surface.queryHints.bySlotEndpoint, '/api/definitive/model-catalog/{slotId}', 'model catalog slot lookup hint');
  assertEqual(surface.queryHints.byDealMechanicsEndpoint, '/api/definitive/deal-mechanics/models/{slotId}', 'deal mechanics slot lookup hint');
  assert(surface.models.some(model => model.slotId === 'M109'), 'model catalog first page exposes core mechanics');
  assert(laterSurface.models.some(model => model.slotId === 'M206' && model.toolSurfaces.includes('studio')), 'model catalog paged lookup exposes M206 Studio surface');
  assert(surface.lineInvariant.includes('do not advise'), 'model catalog preserves THE LINE');

  assertEqual(m200.schema, 'DEFINITIVE.model-slot.v0.1', 'model slot surface schema');
  assertEqual(m200.slotId, 'M200', 'model slot normalizes lowercase input');
  assertEqual(m200.implementedRuntimeModelId, 'MODEL.TAX.TRANSACTION.MASTER.v1', 'model slot exposes runtime model id');
  assert(m200.next_suggested_calls.some((call: any) => call.toolName === 'execute_model'), 'runtime-backed model slot points to execute_model');
  assert(m200.the_line_invariant.includes('Users, counsel, advisors'), 'model slot keeps professional determination boundary');
  assertEqual(m206.slotId, 'M206', 'agreement architecture model slot resolves');
  assert(m206.route.toolSurfaces.includes('studio'), 'agreement architecture model routes to Studio');
  assertEqual(missing, null, 'unknown model slot returns null');
});

await test('Authority Register seed plan is explicit and above 800 planned entries', async () => {
  const seedPlan = getDefinitiveAuthoritySeedPlan();
  const stagedSeedRows = countAuthorityRegisterSeedRows();
  assertEqual(seedPlan.targetEntries, DEFINITIVE_DEAL_MECHANICS_AUTHORITY_TARGET, 'authority seed target');
  assert(seedPlan.plannedEntries >= DEFINITIVE_DEAL_MECHANICS_AUTHORITY_TARGET, 'authority seed planned entries meet target');
  assert(stagedSeedRows >= 180, 'authority register staged migration seed rows meet 180-row baseline');
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
  assertEqual(architecture.newMcpToolCount, 33, 'substrate architecture tool count');
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
  assert(architecture.workstreams.some(item => item.id === 'WS7' && item.mcpTools.includes('get_deal_runbook')), 'capability workstream includes deal runbook lookup');
  assert(architecture.workstreams.some(item => item.id === 'WS7' && item.mcpTools.includes('lookup_model_slot')), 'capability workstream includes model slot lookup');
  assert(architecture.lineDoctrine.includes('does not advise'), 'THE LINE invariant is explicit');
});

await test('Deal runbooks show agents how to run the full iterative Deal OS lifecycle', async () => {
  const surface = buildDefinitiveDealRunbooksSurface();
  const buyRunbook = getDefinitiveDealRunbook('buy') as any;
  const sellRunbook = getDefinitiveDealRunbook('SELL') as any;
  const pmiRunbook = getDefinitiveDealRunbook('pmi') as any;
  const missing = getDefinitiveDealRunbook('brokerage');

  assertEqual(surface.schema, 'DEFINITIVE.deal-runbooks.v0.1', 'deal runbooks surface schema');
  assert(surface.doctrine.includes('Deal OS'), 'deal runbooks identify smbX as Deal OS');
  assertEqual(surface.summary.journeyCount, 4, 'deal runbooks expose four journeys');
  assert(surface.summary.loopContract.includes('ingest_or_resume'), 'deal runbooks expose recursive loop');
  assert(surface.universalEntryTools.includes('resume_deal'), 'deal runbooks expose resume entry tool');
  assert(surface.universalTakeBackArtifacts.includes('DealPackage'), 'deal runbooks expose package take-back artifact');
  assert(surface.lineInvariant.includes('do not advise'), 'deal runbooks preserve THE LINE');

  assertEqual(buyRunbook.schema, 'DEFINITIVE.deal-runbook.v0.1', 'single runbook schema');
  assertEqual(buyRunbook.journey, 'buy', 'buy runbook resolves');
  assert(buyRunbook.stages.some((stage: any) => stage.stageId === 'ioi' && stage.primaryTools.includes('prepare_ioi_packet')), 'buy runbook includes IOI packet step');
  assert(buyRunbook.stages.some((stage: any) => stage.stageId === 'loi' && stage.primaryTools.includes('prepare_loi_packet')), 'buy runbook includes LOI packet step');
  assert(buyRunbook.stages.some((stage: any) => stage.stageId === 'deeper_diligence' && stage.workSurfaces.includes('data_room')), 'buy runbook includes data-room diligence');
  assert(buyRunbook.next_suggested_calls.some((call: any) => call.toolName === 'resume_deal'), 'buy runbook points returning agents to resume_deal');
  assert(buyRunbook.representativeModelSlots.some((slot: any) => slot.slotId === 'M109'), 'buy runbook exposes working capital mechanics');
  assertEqual(buyRunbook.representativeModelSlotsPagination.limit, 24, 'runbook representative slots are bounded by default');
  assert(buyRunbook.representativeModelSlotsPagination.total >= buyRunbook.representativeModelSlotCount, 'runbook pagination preserves total');
  assertEqual(sellRunbook.journey, 'sell', 'uppercase sell journey normalizes');
  assert(pmiRunbook.stages.some((stage: any) => stage.stageId === 'close_pmi' && stage.primaryTools.includes('compose_pmi_plan')), 'PMI runbook includes PMI plan tool');
  assertEqual(missing, null, 'unknown runbook returns null');
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
  assertEqual(dod.body.result.result.completenessSpec.version, 'DEFINITIVE.completeness-spec.v0.1', 'definition of done returns completeness spec');
  assert(dod.body.result.result.completenessSpec.levels.some((level: any) => level.id === 'DRL2_INDICATION_READY'), 'completeness spec publishes readiness levels');
  assert(dod.body.result.result.completenessSpec.checks.some((check: any) => check.id === 'source_trail_present'), 'completeness spec publishes source checks');
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

await test('LifecycleTrace preserves iterative deal history for agent take-back', async () => {
  const response = await executeDefinitiveMcpTool({
    userId: 1,
    toolName: 'compose_lifecycle_trace',
    input: {
      payload: {
        journey: 'buy',
        targetName: 'Lifecycle Target',
        industry: 'software',
        jurisdiction: 'US-DE',
        ebitdaCents: 2_000_000_00,
        dealStructure: 'asset purchase',
        dealEvents: [
          { id: 'evt-ioi', eventType: 'ioi', label: 'IOI drafted', stage: 'ioi' },
          { id: 'evt-qoe', eventType: 'diligence', label: 'QoE uploaded', stage: 'diligence', sourceRefs: ['qoe'] },
        ],
        documents: [
          { id: 'qoe', name: 'QoE report', type: 'qoe', hash: 'sha256:qoe' },
        ],
      },
    },
    envelope: {},
  });
  assertEqual(response.status, 200, 'lifecycle trace status');
  const trace = response.body.result.result.lifecycleTrace;
  assertEqual(trace.schema, 'LifecycleTrace.v0.1', 'lifecycle trace schema');
  assert(trace.events.some((event: any) => event.id === 'evt-ioi'), 'trace preserves supplied event');
  assert(trace.stageTrace.some((stage: any) => stage.id === 'diligence'), 'trace includes staged lifecycle');
  assert(trace.loopContract.recursiveLoop.includes('update_deal_payload'), 'trace explains recursive loop');
  assert(trace.next_suggested_calls.some((call: any) => call.toolName === 'compose_deal_package'), 'trace can be packaged for take-back');
  assert(trace.takeBackArtifacts.includes('LifecycleTrace'), 'lifecycle trace is portable');
});

await test('IOIPacket organizes pre-LOI indication work without making an offer', async () => {
  const response = await executeDefinitiveMcpTool({
    userId: 1,
    toolName: 'prepare_ioi_packet',
    input: {
      payload: {
        journey: 'buy',
        targetName: 'IOI Target',
        industry: 'industrial services',
        jurisdiction: 'US-TX',
        revenueCents: 8_000_000_00,
        ebitdaCents: 1_200_000_00,
        documents: [
          { id: 'financials', name: 'Seller P&L', type: 'financials', hash: 'sha256:financials' },
          { id: 'customers', name: 'Customer export', type: 'commercial', hash: 'sha256:customers' },
        ],
      },
    },
    envelope: {},
  });
  assertEqual(response.status, 200, 'IOI packet status');
  const packet = response.body.result.result.ioiPacket;
  assertEqual(packet.schema, 'IOIPacket.v0.1', 'IOI packet schema');
  assert(packet.knownFacts.some((fact: any) => fact.id === 'deal_subject'), 'IOI packet names deal subject');
  assert(packet.preliminaryEconomics.some((fact: any) => fact.id === 'ebitdaCents'), 'IOI packet carries EBITDA fact');
  assertEqual(packet.indicationBoundary.noOfferAuthority, true, 'IOI packet does not make an offer');
  assert(packet.next_suggested_calls.some((call: any) => call.toolName === 'compose_document_draft'), 'IOI packet can become Studio draft');
  assert(packet.takeBackArtifacts.includes('IOIPacket'), 'IOI packet is portable');
});

await test('LOIPacket organizes LOI architecture without drafting clauses', async () => {
  const response = await executeDefinitiveMcpTool({
    userId: 1,
    toolName: 'prepare_loi_packet',
    input: {
      payload: {
        journey: 'buy',
        targetName: 'LOI Target',
        industry: 'industrial services',
        jurisdiction: 'US-TX',
        revenueCents: 8_000_000_00,
        ebitdaCents: 1_200_000_00,
        purchasePriceCents: 6_500_000_00,
        dealStructure: 'asset purchase with seller note and rollover discussion',
        sellerNoteCents: 900_000_00,
        workingCapitalPegCents: 650_000_00,
        closingConditions: { diligence: true, financing: true },
        documents: [
          { id: 'qoe', name: 'QoE report', type: 'qoe', hash: 'sha256:qoe' },
          { id: 'loi', name: 'Prior LOI draft', type: 'legal', hash: 'sha256:loi' },
          { id: 'tax', name: 'Tax return summary', type: 'tax', hash: 'sha256:tax' },
          { id: 'customers', name: 'Customer export', type: 'commercial', hash: 'sha256:customers' },
        ],
      },
    },
    envelope: {},
  });
  assertEqual(response.status, 200, 'LOI packet status');
  const packet = response.body.result.result.loiPacket;
  assertEqual(packet.schema, 'LOIPacket.v0.1', 'LOI packet schema');
  assert(packet.dealArchitecture.some((term: any) => term.id === 'structure'), 'LOI packet names structure');
  assert(packet.economicTerms.some((term: any) => term.id === 'purchase_price' && term.valueCents === 6_500_000_00), 'LOI packet carries purchase price fact');
  assertEqual(packet.loiBoundary.noBindingOffer, true, 'LOI packet does not make binding offer');
  assertEqual(packet.loiBoundary.noClauseDrafting, true, 'LOI packet does not draft clauses');
  assert(packet.next_suggested_calls.some((call: any) => call.toolName === 'compose_document_draft'), 'LOI packet can become Studio draft');
  assert(packet.takeBackArtifacts.includes('LOIPacket'), 'LOI packet is portable');
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

await test('DiligenceRequest organizes iterative asks without sending externally', async () => {
  const response = await executeDefinitiveMcpTool({
    userId: 1,
    toolName: 'prepare_diligence_request',
    input: {
      categories: ['financials', 'ip'],
      payload: {
        journey: 'buy',
        targetName: 'Diligence Target',
        industry: 'software',
        jurisdiction: 'US-DE',
        ebitdaCents: 2_300_000_00,
        documents: [
          { id: 'qoe', name: 'QoE report', type: 'qoe', hash: 'sha256:qoe' },
          { id: 'ip-schedule', name: 'Patent assignment schedule', type: 'ip', hash: 'sha256:ip' },
        ],
      },
    },
    envelope: {},
  });
  assertEqual(response.status, 200, 'diligence request status');
  const request = response.body.result.result.diligenceRequest;
  assertEqual(request.schema, 'DiligenceRequest.v0.1', 'diligence request schema');
  assert(request.requestGroups.some((group: any) => group.id === 'financials' && group.status === 'source_ready'), 'financial diligence group uses indexed source');
  assert(request.requestGroups.some((group: any) => group.id === 'legal' && group.status === 'needs_source'), 'legal diligence group names source gap');
  assertEqual(request.requestBoundary.noExternalTransmission, true, 'diligence request does not send externally');
  assert(request.next_suggested_calls.some((call: any) => call.toolName === 'compose_document_draft'), 'diligence request can become Studio draft');
  assert(request.takeBackArtifacts.includes('DiligenceRequest'), 'diligence request is portable');
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

await test('NegotiationBrief organizes open terms without negotiating', async () => {
  const response = await executeDefinitiveMcpTool({
    userId: 1,
    toolName: 'prepare_negotiation_brief',
    input: {
      payload: {
        journey: 'buy',
        targetName: 'Negotiation Target',
        industry: 'software',
        jurisdiction: 'US-DE',
        ebitdaCents: 2_400_000_00,
        purchasePriceCents: 18_000_000_00,
        dealStructure: 'asset purchase with seller note',
        documents: [
          { id: 'qoe', name: 'QoE report', type: 'qoe', hash: 'sha256:qoe' },
          { id: 'loi', name: 'LOI markup', type: 'loi', hash: 'sha256:loi' },
        ],
      },
    },
    envelope: {},
  });
  assertEqual(response.status, 200, 'negotiation brief status');
  const brief = response.body.result.result.negotiationBrief;
  assertEqual(brief.schema, 'NegotiationBrief.v0.1', 'negotiation brief schema');
  assert(brief.openTerms.some((term: any) => term.id === 'purchase_price'), 'brief includes purchase price term');
  assert(brief.modelBackedRanges.some((range: any) => range.id === 'purchasePriceCents'), 'brief carries deterministic payload range');
  assertEqual(brief.negotiationBoundary.noNegotiationAuthority, true, 'brief does not negotiate');
  assert(brief.next_suggested_calls.some((call: any) => call.toolName === 'compose_model_stack'), 'brief asks for model stack when missing');
  assert(brief.takeBackArtifacts.includes('NegotiationBrief'), 'negotiation brief is portable');
});

await test('FundsFlow organizes closing arithmetic without moving money', async () => {
  const response = await executeDefinitiveMcpTool({
    userId: 1,
    toolName: 'generate_funds_flow',
    input: {
      payload: {
        journey: 'buy',
        targetName: 'Closing Target',
        industry: 'industrial services',
        jurisdiction: 'US-TX',
        purchasePriceCents: 9_000_000_00,
        equityContributionCents: 4_000_000_00,
        seniorDebtCents: 6_000_000_00,
        sellerNoteCents: 1_000_000_00,
        escrowCents: 500_000_00,
        transactionExpensesCents: 500_000_00,
        documents: [
          { id: 'qoe', name: 'Closing QoE', type: 'qoe', hash: 'sha256:qoe' },
          { id: 'credit', name: 'Debt commitment', type: 'credit agreement', hash: 'sha256:credit' },
          { id: 'closing', name: 'Closing checklist', type: 'legal', hash: 'sha256:closing' },
          { id: 'tax', name: 'Tax allocation memo', type: 'tax', hash: 'sha256:tax' },
        ],
      },
    },
    envelope: {},
  });
  assertEqual(response.status, 200, 'funds flow status');
  const flow = response.body.result.result.fundsFlow;
  assertEqual(flow.schema, 'FundsFlow.v0.1', 'funds flow schema');
  assert(flow.sourceRows.some((row: any) => row.id === 'equity_contribution' && row.amountCents === 4_000_000_00), 'funds flow carries equity source');
  assert(flow.useRows.some((row: any) => row.id === 'purchase_price' && row.amountCents === 9_000_000_00), 'funds flow carries purchase price use');
  assertEqual(flow.reconciliation.status, 'balanced', 'funds flow reconciles supplied cash rows');
  assertEqual(flow.fundsFlowBoundary.noMoneyMovement, true, 'funds flow does not move money');
  assertEqual(flow.fundsFlowBoundary.noWireInstructions, true, 'funds flow does not issue wire instructions');
  assert(flow.next_suggested_calls.some((call: any) => call.toolName === 'compose_document_draft'), 'funds flow can become Studio draft');
  assert(flow.takeBackArtifacts.includes('FundsFlow'), 'funds flow is portable');
});

await test('CloseReadiness stages blockers without authorizing close', async () => {
  const response = await executeDefinitiveMcpTool({
    userId: 1,
    toolName: 'compose_close_readiness',
    input: {
      payload: {
        journey: 'buy',
        dealName: 'Closing Target',
        targetName: 'Closing Target LLC',
        industry: 'commercial services',
        jurisdiction: 'US-DE',
        revenueCents: 24_000_000_00,
        purchasePriceCents: 9_000_000_00,
        equityContributionCents: 4_000_000_00,
        seniorDebtCents: 6_000_000_00,
        escrowCents: 500_000_00,
        transactionExpensesCents: 500_000_00,
        structure: 'asset purchase',
        keyTerms: { indemnity: 'escrow and RWI under review' },
        closingConditions: { diligence: true, financing: true, thirdPartyConsents: true },
        modelOutputs: { sourcesUses: 'balanced' },
        counselClearance: true,
        documents: [
          { id: 'qoe', name: 'QoE report', type: 'financial', hash: 'sha256:qoe' },
          { id: 'credit', name: 'Credit agreement', type: 'financing', hash: 'sha256:credit' },
          { id: 'legal', name: 'Closing checklist', type: 'legal', hash: 'sha256:legal' },
          { id: 'tax', name: 'Tax memo', type: 'tax', hash: 'sha256:tax' },
        ],
      },
    },
    envelope: {},
  });
  assertEqual(response.status, 200, 'close readiness status');
  const readiness = response.body.result.result.closeReadiness;
  assertEqual(readiness.schema, 'CloseReadiness.v0.1', 'close readiness schema');
  assertEqual(readiness.readinessStatus, 'ready_to_stage_for_human_approval', 'close readiness staged status');
  assertEqual(readiness.closeReadinessBoundary.noClosingAuthority, true, 'close readiness does not authorize close');
  assertEqual(readiness.closeReadinessBoundary.noMoneyMovement, true, 'close readiness does not move money');
  assert(readiness.approvalMatrix.some((item: any) => item.requiredTool === 'close_deal'), 'close approval matrix surfaces close_deal');
  assert(readiness.next_suggested_calls.some((call: any) => call.toolName === 'close_deal'), 'close_deal is only staged as a next call');
  assert(readiness.takeBackArtifacts.includes('CloseReadiness'), 'close readiness is portable');
});

await test('PMIPlan organizes post-close work without operating authority', async () => {
  const response = await executeDefinitiveMcpTool({
    userId: 1,
    toolName: 'compose_pmi_plan',
    input: {
      payload: {
        journey: 'pmi',
        targetName: 'PMI Target',
        industry: 'healthcare services',
        jurisdiction: 'US-TX',
        closedDate: '2026-05-20',
        ebitdaCents: 1_800_000_00,
        dayZero: { banking: true, payroll: true },
        stabilization: { weeklyCadence: true },
        valueLevers: ['revenue cycle cleanup', 'vendor consolidation'],
        documents: [
          { id: 'ops', name: 'Operations handoff', type: 'operations', hash: 'sha256:ops' },
          { id: 'qoe', name: 'Closing QoE', type: 'qoe', hash: 'sha256:qoe' },
          { id: 'customers', name: 'Customer handoff list', type: 'commercial', hash: 'sha256:customers' },
          { id: 'hr', name: 'Employee roster', type: 'hr', hash: 'sha256:hr' },
        ],
      },
    },
    envelope: {},
  });
  assertEqual(response.status, 200, 'PMI plan status');
  const plan = response.body.result.result.pmiPlan;
  assertEqual(plan.schema, 'PMIPlan.v0.1', 'PMI plan schema');
  assert(plan.workstreams.some((workstream: any) => workstream.id === 'PMI0'), 'PMI plan includes Day 0 controls');
  assert(plan.workstreams.some((workstream: any) => workstream.id === 'PMI3'), 'PMI plan includes optimization');
  assert(plan.milestones.some((milestone: any) => milestone.id === 'day_100' && milestone.targetDate === '2026-08-28'), 'PMI plan computes Day 100 target');
  assertEqual(plan.pmiBoundary.noOperatingAuthority, true, 'PMI plan does not operate the business');
  assert(plan.next_suggested_calls.some((call: any) => call.toolName === 'compose_document_draft'), 'PMI plan can become Studio draft');
  assert(plan.takeBackArtifacts.includes('PMIPlan'), 'PMI plan is portable');
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

await test('Agent capability, methodology, cost, runbook, and model-slot tools are DB-free Deal OS entrypoints', async () => {
  const capabilities = await executeDefinitiveMcpTool({
    userId: 1,
    toolName: 'introspect_capabilities',
    input: {
      objective: 'prepare LOI for a real estate-heavy buy-side acquisition',
      journey: 'buy',
      league: 'L4',
      dealType: 'real estate asset purchase with IP and indemnification',
      jurisdiction: 'US-DE',
      triggeredGates: ['G30'],
      includeTools: true,
    },
    envelope: {},
  });
  assertEqual(capabilities.status, 200, 'capabilities tool status');
  assertEqual(capabilities.body.result.schema, 'CapabilityCatalog.v0.1', 'capabilities schema');
  assert(capabilities.body.result.lifecycleStages.some((stage: any) => stage.id === 'loi'), 'capabilities expose LOI lifecycle');
  assert(capabilities.body.result.workSurfaces.some((surface: any) => surface.id === 'data_room'), 'capabilities expose data room surface');
  assert(capabilities.body.result.relevantMechanics.length > 0, 'capabilities surface relevant mechanics');
  assert(capabilities.body.result.next_suggested_calls.some((call: any) => call.toolName === 'ingest_deal_payload'), 'capabilities tell agent to ingest partial state');

  const methodology = await executeDefinitiveMcpTool({
    userId: 1,
    toolName: 'describe_methodology',
    input: { section: 'overview', includeModelCatalog: true, includeAuthorityPlan: true },
    envelope: {},
  });
  assertEqual(methodology.status, 200, 'methodology tool status');
  assertEqual(methodology.body.result.schema, 'MethodologyDescription.v0.1', 'methodology schema');
  assertEqual(methodology.body.result.standard.name, 'The Diligence Standard', 'methodology exposes published standard');
  assertEqual(methodology.body.result.modelCatalog.summary.totalModelSlots, DEFINITIVE_DEAL_MECHANICS_MODEL_SLOT_COUNT, 'methodology exposes full model count');
  assertEqual(methodology.body.result.modelCatalog.mappingCoverage.status, 'complete', 'methodology exposes route coverage');
  assert(methodology.body.result.doctrine.noRejection.includes('MissingInputContract'), 'methodology exposes no-rejection contract');

  const cost = await executeDefinitiveMcpTool({
    userId: 1,
    toolName: 'estimate_deal_cost',
    input: {
      monthlyModelRuns: 24,
      monthlyApiCalls: 300,
      monthlyStudioBooks: 2,
      monthlyStudioExports: 4,
      teamSeats: 1,
      needsApiMcp: true,
      passThroughCalls: [{ id: 'PASS.OSS_SCA', quantity: 2 }],
    },
    envelope: {},
  });
  assertEqual(cost.status, 200, 'cost tool status');
  assertEqual(cost.body.result.schema, 'DealCostEstimate.v0.1', 'cost schema');
  assertEqual(cost.body.result.recommendedPlan.id, 'pro', 'API/MCP deal work recommends Pro');
  assert(cost.body.result.pricingDoctrine.includes('No wallet'), 'cost tool preserves no-wallet doctrine');
  assertEqual(cost.body.result.passThrough.requestedCalls[0].humanReferralCompensationAllowed, false, 'pass-through blocks referral compensation');

  const runbook = await executeDefinitiveMcpTool({
    userId: 1,
    toolName: 'get_deal_runbook',
    input: { journey: 'buy', limit: 5 },
    envelope: { requestId: 'smoke-request-runbook-001' },
  });
  assertEqual(runbook.status, 200, 'deal runbook tool status');
  assertEqual(runbook.body.requestId, 'smoke-request-runbook-001', 'deal runbook response echoes request id');
  assertEqual(runbook.body.result.schema, 'DEFINITIVE.deal-runbook.v0.1', 'deal runbook tool schema');
  assert(runbook.body.result.stages.some((stage: any) => stage.stageId === 'loi'), 'deal runbook tool exposes LOI stage');
  assertEqual(runbook.body.result.representativeModelSlotsPagination.limit, 5, 'deal runbook tool honors bounded limit');
  assert(runbook.body.result.next_suggested_calls.some((call: any) => call.toolName === 'resume_deal'), 'deal runbook tool helps agents resume work');

  const modelSlot = await executeDefinitiveMcpTool({
    userId: 1,
    toolName: 'lookup_model_slot',
    input: { slotId: 'm200' },
    envelope: { requestId: 'smoke-request-modelslot-001' },
  });
  assertEqual(modelSlot.status, 200, 'model slot tool status');
  assertEqual(modelSlot.body.requestId, 'smoke-request-modelslot-001', 'model slot response echoes request id');
  assertEqual(modelSlot.body.result.schema, 'DEFINITIVE.model-slot.v0.1', 'model slot tool schema');
  assertEqual(modelSlot.body.result.slotId, 'M200', 'model slot lookup normalizes id');
  assertEqual(modelSlot.body.result.implementedRuntimeModelId, 'MODEL.TAX.TRANSACTION.MASTER.v1', 'model slot lookup returns runtime model');

  const scopeBlocked = await executeDefinitiveMcpTool({
    userId: 1,
    toolName: 'lookup_model_slot',
    input: { slotId: 'M200' },
    envelope: { requestId: 'smoke-request-missing-scope-001', requestedScopes: ['methodology:read'] },
  });
  assertEqual(scopeBlocked.status, 403, 'missing required explicit scope is blocked');
  assertEqual(scopeBlocked.body.error, 'missing_required_scope', 'missing scope error code');
  assertEqual(scopeBlocked.body.requestId, 'smoke-request-missing-scope-001', 'scope error echoes request id');
  assert(scopeBlocked.body.missingScopes.includes('model-catalog:read'), 'scope error names missing model-catalog scope');
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

function countAuthorityRegisterSeedRows() {
  const migrationDir = resolve(process.cwd(), 'server/migrations');
  return readdirSync(migrationDir)
    .filter(file => file.endsWith('.sql'))
    .reduce((total, file) => {
      const sql = readFileSync(resolve(migrationDir, file), 'utf8');
      return total + [...sql.matchAll(/^\s*\('AUTH\./gm)].length;
    }, 0);
}
