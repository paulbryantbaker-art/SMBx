import { listRegisteredModels } from './modelRegistry.js';
import { listDefinitiveMcpTools } from './definitiveMcp.js';
import { listV19ResourceContract } from './v19ResourceContract.js';
import { listDefinitiveLineInventory } from './agencyActionRegistry.js';
import { listDefinitiveCorpusObservationTypes } from './definitiveCorpusService.js';
import { buildDefinitiveConformanceStatus } from './definitiveConformanceStatus.js';
import { getDefinitiveDealRouteMapSummary } from './definitiveDealRouteMap.js';
import {
  getDefinitiveDealMappingCoverage,
  getDefinitiveDealMechanicsSummary,
  getDefinitivePassThroughSurface,
} from './definitiveDealMechanicsCatalog.js';

export function buildAgentCard() {
  const models = listRegisteredModels();
  const resourceContract = listV19ResourceContract();
  const definitiveTools = listDefinitiveMcpTools();
  const lineInventory = listDefinitiveLineInventory();
  const corpusContract = listDefinitiveCorpusObservationTypes();
  const conformance = buildDefinitiveConformanceStatus();
  const dealMechanics = getDefinitiveDealMechanicsSummary();
  const dealMappingCoverage = getDefinitiveDealMappingCoverage();
  const dealRouteMap = getDefinitiveDealRouteMapSummary();
  const passThroughSurface = getDefinitivePassThroughSurface();
  const lineSummary = lineInventory.reduce<Record<string, number>>((acc, contract) => {
    acc[contract.lineStatus] = (acc[contract.lineStatus] || 0) + 1;
    return acc;
  }, {});
  return {
    name: 'smbx.ai Yulia Deal Desk',
    version: 'DEFINITIVE.v1.0',
    description: 'Agent-ready M&A diligence substrate for model-backed analysis, citation validation, governed tool calls, and Yulia canvas actions.',
    definitive: {
      protocol: definitiveTools.protocol,
      status: definitiveTools.status,
      specVersion: definitiveTools.specVersion,
      specUri: definitiveTools.specUri,
      methodologyVersion: definitiveTools.methodologyVersion,
      methodologyUri: definitiveTools.methodologyUri,
      specManifestEndpoint: '/.well-known/definitive.json',
      toolsEndpoint: '/api/definitive/tools/list',
      callEndpoint: '/api/definitive/tools/{toolName}/call',
      lineInventoryEndpoint: '/api/definitive/line/inventory',
      auditPacketEndpoint: '/api/definitive/audit-packets/{auditTrailId}',
      corpusObservationTypesEndpoint: '/api/definitive/corpus/observation-types',
      corpusRightsEndpoint: '/api/definitive/corpus/rights',
      passThroughCatalogEndpoint: '/api/definitive/pass-through-catalog',
      dealMechanicsVersion: dealMechanics.version,
      dealMechanicsUri: dealMechanics.uri,
      dealMechanicsModelSlots: dealMechanics.totalModelSlots,
      dealMechanicsGates: dealMechanics.totalGates,
      dealMappingStatus: dealMappingCoverage.status,
      dealRouteMapStatus: dealRouteMap.status,
      passThroughPricingRule: passThroughSurface.pricingRule,
    },
    pricing: {
      free: '$0',
      solo: '$79/mo',
      pro: '$199/mo',
      team: '$499/mo',
      enterprise: '$2,500+/mo',
    },
    boundaries: [
      'Yulia provides deal intelligence, modeling, drafting, and orchestration.',
      'Licensed legal, tax, accounting, investment, and brokerage decisions remain with qualified professionals and the user.',
      'Financial values must be sourced from user documents, data-room facts, or registered market citations.',
    ],
    capabilities: [
      {
        id: 'model_registry',
        label: 'Registered V19 model catalog',
        status: 'available',
        count: models.length,
      },
      {
        id: 'citation_validation',
        label: 'Citation registry validation',
        status: 'available',
        requiredFor: ['regulatory thresholds', 'market data', 'tax/legal constants', 'model outputs using external facts'],
      },
      {
        id: 'model_stack_composition',
        label: 'Journey/league-aware model stack composer',
        status: 'available',
        journeys: ['sell', 'buy', 'raise', 'pmi'],
        leagues: ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9', 'L10'],
      },
      {
        id: 'canvas_awareness',
        label: 'Yulia canvas awareness',
        status: 'available',
        note: 'Chat and canvas are two control surfaces over the same deal state.',
      },
      {
        id: 'v19_resource_contract',
        label: 'V19 artifact/resource contract',
        status: 'internal',
        resources: resourceContract.resourceTemplates.map(resource => resource.uriTemplate),
        tools: resourceContract.toolContracts,
      },
      {
        id: 'definitive_mcp_v0_1',
        label: 'DEFINITIVE MCP/API v0.1 tools',
        status: 'internal',
        protocol: definitiveTools.protocol,
        tools: definitiveTools.tools.map(tool => ({
          name: tool.name,
          lineStatus: tool.lineStatus,
          requiredScopes: tool.requiredScopes,
        })),
      },
      {
        id: 'definitive_line_inventory',
        label: 'THE LINE action inventory',
        status: 'internal',
        summary: lineSummary,
        endpoint: '/api/definitive/line/inventory',
      },
      {
        id: 'definitive_corpus_foundation',
        label: 'Data-rights gated anonymized corpus observations',
        status: 'internal',
        grantType: corpusContract.grantType,
        observationTypes: corpusContract.observationTypes.map(item => item.type),
        rawDocumentTextAllowed: false,
        partyIdentifiersAllowed: false,
      },
      {
        id: 'definitive_conformance_status',
        label: 'DB-free DEFINITIVE conformance status',
        status: conformance.status,
        suite: conformance.suite,
        caseCount: conformance.cases.total,
        nextTarget: conformance.nextTarget,
      },
      {
        id: 'definitive_deal_mechanics_v1_1',
        label: 'DEFINITIVE v1.1 deal-mechanics catalog',
        status: 'target',
        version: dealMechanics.version,
        modelSlots: dealMechanics.totalModelSlots,
        activeModelSlots: dealMechanics.activeModelSlots,
        gates: dealMechanics.totalGates,
        newGates: dealMechanics.newGates,
        authorityRegisterTarget: dealMechanics.authorityRegisterTarget,
        lineCategoryCounts: dealMechanics.lineCategoryCounts,
        mappingStatus: dealMappingCoverage.status,
        unmappedModelSlots: dealMappingCoverage.unmappedModelSlots,
        routeMapStatus: dealRouteMap.status,
        routeMapEntries: dealRouteMap.routeMapEntries,
        routeReadinessCounts: dealRouteMap.readinessCounts,
      },
      {
        id: 'definitive_pass_through_surface',
        label: 'THE LINE-safe pass-through substrate',
        status: 'target',
        pricingRule: passThroughSurface.pricingRule,
        priceListStatus: passThroughSurface.priceListStatus,
        catalogCount: passThroughSurface.catalog.length,
        dependentModelSlots: passThroughSurface.dependentModelSlots,
        prohibited: passThroughSurface.prohibited,
      },
    ],
    resourceContract,
    models: models.map(model => ({
      modelId: model.modelId,
      version: model.version,
      name: model.name,
      phase: model.phase,
      hash: model.hash,
      requiredInputs: model.requiredInputs,
      citationTags: model.citationTags,
      leagueFloor: model.leagueFloor ?? null,
      leagueCeiling: model.leagueCeiling ?? null,
    })),
    publicEndpoints: [
      '/.well-known/agent-card.json',
      '/.well-known/definitive.json',
      '/api/agent-card',
      '/api/definitive/spec',
      '/api/definitive/pass-through-catalog',
    ],
    authenticatedEndpoints: [
      '/api/definitive/tools/list',
      '/api/definitive/line/inventory',
      '/api/definitive/corpus/observation-types',
      '/api/definitive/corpus/rights',
      '/api/definitive/audit-packets/{auditTrailId}',
      '/api/definitive/tools/{toolName}/call',
      '/api/definitive/tools/call',
      '/api/definitive/corpus/rights/grants',
      '/api/definitive/corpus/rights/grants/{grantId}/revoke',
      '/api/definitive/corpus/observations',
    ],
    endpointAccess: {
      discoveryIsPublic: true,
      executionRequiresAuthentication: true,
      executionRequiresGovernedToolContract: true,
      corpusWritesRequireDataRightsGrant: true,
      auditPacketsRequireOwningUserOrOrgScope: true,
    },
    generatedAt: new Date().toISOString(),
  };
}
