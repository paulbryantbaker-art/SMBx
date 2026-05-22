import {
  DEFINITIVE_METHODOLOGY_URI,
  DEFINITIVE_METHODOLOGY_VERSION,
  DEFINITIVE_SPEC_URI,
  DEFINITIVE_SPEC_VERSION,
} from '../constants/definitive.js';
import { listDefinitiveLineInventory } from './agencyActionRegistry.js';
import { buildDefinitiveConformanceStatus } from './definitiveConformanceStatus.js';
import { listDefinitiveCorpusObservationTypes } from './definitiveCorpusService.js';
import {
  buildDefinitiveDealRouteMap,
  buildDefinitiveSurfaceMechanicsSummary,
  getDefinitiveDealRouteMapSummary,
} from './definitiveDealRouteMap.js';
import {
  getDefinitiveDealMappingCoverage,
  getDefinitiveDealMechanicsSummary,
  getDefinitivePassThroughSurface,
  listDefinitiveGateExpansions,
} from './definitiveDealMechanicsCatalog.js';
import { listDefinitiveMcpTools } from './definitiveMcp.js';

export function buildDefinitiveSpecManifest() {
  const tools = listDefinitiveMcpTools();
  const lineInventory = listDefinitiveLineInventory();
  const corpus = listDefinitiveCorpusObservationTypes();
  const conformance = buildDefinitiveConformanceStatus();
  const dealMechanics = getDefinitiveDealMechanicsSummary();
  const mappingCoverage = getDefinitiveDealMappingCoverage();
  const routeMapSummary = getDefinitiveDealRouteMapSummary();
  const routeMap = buildDefinitiveDealRouteMap();
  const surfaceMechanics = buildDefinitiveSurfaceMechanicsSummary();
  const gateExpansions = listDefinitiveGateExpansions();
  const passThroughSurface = getDefinitivePassThroughSurface();
  const lineSummary = lineInventory.reduce<Record<string, number>>((acc, contract) => {
    acc[contract.lineStatus] = (acc[contract.lineStatus] || 0) + 1;
    return acc;
  }, {});

  return {
    name: 'DEFINITIVE',
    version: DEFINITIVE_SPEC_VERSION,
    uri: DEFINITIVE_SPEC_URI,
    methodology: {
      version: DEFINITIVE_METHODOLOGY_VERSION,
      uri: DEFINITIVE_METHODOLOGY_URI,
      baseline: 'V19',
    },
    doctrine: {
      substrate: 'smbX is the M&A diligence substrate. Yulia is the human reference surface.',
      mathPath: 'Deterministic first: serious numbers come from models, source files, or timestamped market data.',
      citationPath: 'Material claims resolve to an authority/source or remain explicitly unsupported.',
      dataRights: 'Corpus writes require an active data-rights grant and structured anonymized observations only.',
      pricing: 'Subscriptions, credits, fixed software deliverables, and enterprise platform fees only. No wallet or success fees.',
    },
    endpoints: {
      agentCard: '/.well-known/agent-card.json',
      specManifest: '/.well-known/definitive.json',
      specApi: '/api/definitive/spec',
      passThroughCatalog: '/api/definitive/pass-through-catalog',
      toolsList: '/api/definitive/tools/list',
      toolCall: '/api/definitive/tools/{toolName}/call',
      lineInventory: '/api/definitive/line/inventory',
      auditPacket: '/api/definitive/audit-packets/{auditTrailId}',
      corpusObservationTypes: '/api/definitive/corpus/observation-types',
      corpusRights: '/api/definitive/corpus/rights',
      corpusObservationWrite: '/api/definitive/corpus/observations',
    },
    access: {
      publicDiscovery: [
        '/.well-known/agent-card.json',
        '/.well-known/definitive.json',
        '/api/agent-card',
        '/api/definitive/spec',
        '/api/definitive/pass-through-catalog',
      ],
      authenticatedDiscovery: [
        '/api/definitive/tools/list',
        '/api/definitive/line/inventory',
        '/api/definitive/corpus/observation-types',
      ],
      authenticatedExecution: [
        '/api/definitive/tools/call',
        '/api/definitive/tools/{toolName}/call',
        '/api/definitive/audit-packets/{auditTrailId}',
        '/api/definitive/corpus/rights',
        '/api/definitive/corpus/rights/grants',
        '/api/definitive/corpus/rights/grants/{grantId}/revoke',
        '/api/definitive/corpus/observations',
      ],
    },
    transport: {
      current: 'Public well-known discovery plus JWT-authenticated internal API/MCP-shaped calls',
      target: 'OAuth 2.1 + PKCE + audience-bound scoped tokens',
    },
    toolSurface: {
      protocol: tools.protocol,
      status: tools.status,
      tools: tools.tools.map(tool => ({
        name: tool.name,
        requiredScopes: tool.requiredScopes,
        lineStatus: tool.lineStatus,
        refusalBehavior: tool.refusalBehavior,
      })),
    },
    lineSurface: {
      summary: lineSummary,
      statuses: ['ok', 'human_approval_required', 'counsel_review_required', 'enterprise_scope_required', 'credit_budget_required', 'LINE_VIOLATION'],
    },
    corpusSurface: {
      grantType: corpus.grantType,
      observationTypes: corpus.observationTypes.map(type => type.type),
      rawDocumentTextAllowed: false,
      partyIdentifiersAllowed: false,
      minimumReleaseCount: 10,
    },
    conformanceSurface: {
      suite: conformance.suite,
      status: conformance.status,
      modelRuntimeCases: conformance.cases.modelRuntime,
      dealMechanicsRouteCases: conformance.cases.dealMechanicsRoute,
      promptMetaCases: conformance.cases.promptMeta,
      routeTriggerCases: conformance.cases.routeTrigger,
      totalCases: conformance.cases.total,
      nextTarget: conformance.nextTarget,
      categories: conformance.categories,
      command: conformance.command,
    },
    dealMechanicsSurface: {
      summary: dealMechanics,
      mappingCoverage,
      routeMap: {
        summary: routeMapSummary,
        entries: routeMap.map(route => ({
          slotId: route.slotId,
          name: route.name,
          gates: route.gates,
          dealTypes: route.dealTypes,
          journeys: route.journeys,
          leagueRange: route.leagueRange,
          readiness: route.readiness,
          toolSurfaces: route.toolSurfaces,
          implementedRuntimeModelId: route.implementedRuntimeModelId,
          boundary: route.boundary,
        })),
      },
      surfaceMechanics,
      catalogVersion: dealMechanics.version,
      catalogUri: dealMechanics.uri,
      gateExpansions: gateExpansions.map(gate => ({
        gateId: gate.gateId,
        name: gate.name,
        primaryModels: gate.primaryModels,
        triggerSummary: gate.triggerSummary,
        lineNotes: gate.lineNotes,
      })),
      lineDoctrine: 'THE LINE is descriptive per model: DEFINITIVE computes deterministic figures and presents inputs; users, professionals, or courts make advice/opinion/legal determinations.',
    },
    passThroughSurface,
    generatedAt: new Date().toISOString(),
  };
}
