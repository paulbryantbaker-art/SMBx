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
  DEFINITIVE_CONFORMANCE_MODEL_RUNTIME_CASE_COUNT,
  DEFINITIVE_CONFORMANCE_TOTAL_CASE_COUNT,
} from '../server/services/definitiveConformanceStatus.js';
import {
  buildDefinitiveDealRouteMap,
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
import {
  listDefinitiveCorpusObservationTypes,
  sanitizeCorpusObservation,
} from '../server/services/definitiveCorpusService.js';
import { buildDefinitiveSpecManifest } from '../server/services/definitiveSpecManifest.js';
import { evaluateDefinitiveStackOverlays } from '../server/services/definitiveStackOverlays.js';
import { executeDefinitiveMcpTool, listDefinitiveMcpTools } from '../server/services/definitiveMcp.js';

const expectedTools = [
  'lookup_citation',
  'fetch_market_data',
  'defer_to_counsel',
  'compose_model_stack',
  'execute_model',
  'record_corpus_observation',
  'validate_conformance',
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
  assertEqual(card.definitive.toolsEndpoint, '/api/definitive/tools/list', 'tools endpoint');
  assertEqual(card.definitive.auditPacketEndpoint, '/api/definitive/audit-packets/{auditTrailId}', 'audit packet endpoint');
  assertEqual(card.definitive.corpusObservationTypesEndpoint, '/api/definitive/corpus/observation-types', 'corpus observation endpoint');
  assertEqual(card.definitive.dealMechanicsVersion, DEFINITIVE_DEAL_MECHANICS_VERSION, 'deal mechanics version');
  assertEqual(card.definitive.dealMechanicsModelSlots, DEFINITIVE_DEAL_MECHANICS_MODEL_SLOT_COUNT, 'deal mechanics model slots');
  assertEqual(card.definitive.dealMechanicsGates, DEFINITIVE_DEAL_MECHANICS_GATE_COUNT, 'deal mechanics gate count');
  assertEqual(card.definitive.dealMappingStatus, 'complete', 'agent card deal mapping status');
  assertEqual(card.definitive.dealRouteMapStatus, 'complete', 'agent card route map status');
  assert(card.definitive.passThroughPricingRule.includes('cost-plus-fixed'), 'agent card exposes pass-through pricing rule');
  assert(card.publicEndpoints.includes('/.well-known/definitive.json'), 'definitive manifest endpoint is public');
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
});

await test('DEFINITIVE manifest is a single stable discovery document', async () => {
  const manifest = buildDefinitiveSpecManifest();
  assertEqual(manifest.version, DEFINITIVE_SPEC_VERSION, 'manifest version');
  assertEqual(manifest.endpoints.specManifest, '/.well-known/definitive.json', 'manifest endpoint');
  assertEqual(manifest.endpoints.agentCard, '/.well-known/agent-card.json', 'manifest agent-card endpoint');
  assert(manifest.access.publicDiscovery.includes('/api/definitive/spec'), 'manifest spec API is public discovery');
  assert(manifest.access.authenticatedDiscovery.includes('/api/definitive/tools/list'), 'manifest tools list is authenticated discovery');
  assert(manifest.access.authenticatedExecution.includes('/api/definitive/tools/{toolName}/call'), 'manifest tool call is authenticated execution');
  assertDeepEqual(manifest.toolSurface.tools.map(tool => tool.name), expectedTools, 'manifest tool names');
  assertEqual(manifest.corpusSurface.rawDocumentTextAllowed, false, 'manifest disallows raw corpus text');
  assertEqual(manifest.corpusSurface.partyIdentifiersAllowed, false, 'manifest disallows party identifiers');
  assertEqual(manifest.conformanceSurface.modelRuntimeCases, DEFINITIVE_CONFORMANCE_MODEL_RUNTIME_CASE_COUNT, 'manifest conformance case count');
  assertEqual(manifest.conformanceSurface.dealMechanicsRouteCases, DEFINITIVE_CONFORMANCE_DEAL_ROUTE_CASE_COUNT, 'manifest route conformance case count');
  assertEqual(manifest.conformanceSurface.totalCases, DEFINITIVE_CONFORMANCE_TOTAL_CASE_COUNT, 'manifest total conformance case count');
  assertEqual(manifest.dealMechanicsSurface.summary.totalModelSlots, DEFINITIVE_DEAL_MECHANICS_MODEL_SLOT_COUNT, 'manifest deal mechanics model count');
  assertEqual(manifest.dealMechanicsSurface.summary.catalogedModelSlots, DEFINITIVE_DEAL_MECHANICS_MODEL_SLOT_COUNT, 'manifest cataloged model count');
  assertEqual(manifest.dealMechanicsSurface.summary.reservedModelSlots, 2, 'manifest reserved model slots');
  assertEqual(manifest.dealMechanicsSurface.summary.totalGates, DEFINITIVE_DEAL_MECHANICS_GATE_COUNT, 'manifest deal mechanics gate count');
  assertEqual(manifest.dealMechanicsSurface.summary.authorityRegisterTarget, DEFINITIVE_DEAL_MECHANICS_AUTHORITY_TARGET, 'manifest authority target');
  assertEqual(manifest.dealMechanicsSurface.mappingCoverage.status, 'complete', 'manifest deal mapping coverage status');
  assertEqual(manifest.dealMechanicsSurface.mappingCoverage.unmappedModelSlots, 0, 'manifest has no unmapped active model slots');
  assertEqual(manifest.dealMechanicsSurface.routeMap.summary.status, 'complete', 'manifest route map coverage status');
  assertEqual(manifest.dealMechanicsSurface.routeMap.entries.length, DEFINITIVE_DEAL_MECHANICS_MODEL_SLOT_COUNT, 'manifest route map entry count');
  assertDeepEqual(manifest.dealMechanicsSurface.summary.newGates, ['G28', 'G29', 'G30'], 'manifest new gates');
  assert(manifest.dealMechanicsSurface.gateExpansions.some(gate => gate.gateId === 'G28'), 'manifest includes G28');
  assert(manifest.dealMechanicsSurface.gateExpansions.some(gate => gate.gateId === 'G29'), 'manifest includes G29');
  assert(manifest.dealMechanicsSurface.gateExpansions.some(gate => gate.gateId === 'G30'), 'manifest includes G30');
  assert(manifest.passThroughSurface.pricingRule.includes('per call'), 'manifest pass-through surface is exposed');
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
});

await test('DEFINITIVE route map makes every active M-slot usable by Yulia', async () => {
  const routeMap = buildDefinitiveDealRouteMap();
  const summary = getDefinitiveDealRouteMapSummary();
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
