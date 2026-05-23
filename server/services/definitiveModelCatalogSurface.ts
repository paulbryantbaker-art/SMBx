import {
  getDefinitiveDealMappingCoverage,
  getDefinitiveDealMechanicsSummary,
  listDefinitiveDealMechanicsCatalog,
} from './definitiveDealMechanicsCatalog.js';
import {
  buildDefinitiveDealRouteMap,
  getDefinitiveDealRouteMapSummary,
} from './definitiveDealRouteMap.js';

export const DEFINITIVE_MODEL_CATALOG_SURFACE_VERSION = 'DEFINITIVE.model-catalog-surface.v0.1';

export function buildDefinitiveModelCatalogSurface() {
  const catalog = listDefinitiveDealMechanicsCatalog();
  const routeMap = buildDefinitiveDealRouteMap();
  const routeBySlot = new Map(routeMap.map(route => [route.slotId, route]));

  return {
    schema: DEFINITIVE_MODEL_CATALOG_SURFACE_VERSION,
    summary: getDefinitiveDealMechanicsSummary(),
    mappingCoverage: getDefinitiveDealMappingCoverage(),
    routeMapSummary: getDefinitiveDealRouteMapSummary(),
    queryHints: {
      bySlotEndpoint: '/api/definitive/model-catalog/{slotId}',
      byDealMechanicsEndpoint: '/api/definitive/deal-mechanics/models/{slotId}',
      slotExamples: ['M109', 'M148', 'M200', 'M206', 'M221'],
      agentUse: 'Use this compact catalog when selecting methodology slots. Use compose_model_stack or introspect_capabilities for deal-specific routing.',
    },
    models: catalog.map(model => {
      const route = routeBySlot.get(model.slotId);
      return {
        slotId: model.slotId,
        uri: model.uri,
        name: model.name,
        status: model.status,
        lineCategory: model.lineCategory,
        gates: model.gates,
        dealTypes: model.dealTypes,
        authorityAnchors: model.authorityAnchors,
        deterministicComputation: model.deterministicComputation,
        implementedRuntimeModelId: model.implementedRuntimeModelId || null,
        readiness: route?.readiness || 'reserved',
        toolSurfaces: route?.toolSurfaces || [],
        journeys: route?.journeys || [],
        boundary: route?.boundary || 'Reserved slot; intentionally not routed.',
      };
    }),
    lineInvariant:
      'Model slots describe deterministic computation, professional handoffs, research-only scaffolds, or pass-through dependencies. They do not advise, recommend, negotiate, represent, guarantee, or receive transaction-based compensation.',
  };
}

export function getDefinitiveModelSlotSurface(slotId: string) {
  const normalized = normalizeSlotId(slotId);
  const catalog = listDefinitiveDealMechanicsCatalog();
  const model = catalog.find(entry => entry.slotId === normalized);
  if (!model) return null;

  const route = buildDefinitiveDealRouteMap().find(entry => entry.slotId === normalized) || null;
  return {
    schema: 'DEFINITIVE.model-slot.v0.1',
    slotId: model.slotId,
    uri: model.uri,
    name: model.name,
    status: model.status,
    lineCategory: model.lineCategory,
    gates: model.gates,
    dealTypes: model.dealTypes,
    authorityAnchors: model.authorityAnchors,
    deterministicComputation: model.deterministicComputation,
    notes: model.notes || null,
    implementedRuntimeModelId: model.implementedRuntimeModelId || null,
    route: route
      ? {
        readiness: route.readiness,
        toolSurfaces: route.toolSurfaces,
        journeys: route.journeys,
        leagueRange: route.leagueRange,
        appliesWhen: route.appliesWhen,
        boundary: route.boundary,
      }
      : null,
    next_suggested_calls: [
      {
        toolName: 'introspect_capabilities',
        priority: 'P1',
        reason: 'Ask for the deal-specific subset of mechanics before executing or drafting.',
        inputHint: { dealType: model.dealTypes[0] || model.name, triggeredGates: model.gates },
      },
      model.implementedRuntimeModelId
        ? {
          toolName: 'execute_model',
          priority: 'P1',
          reason: 'This model slot has an executable deterministic runtime model.',
          inputHint: { modelId: model.implementedRuntimeModelId, input: '<model inputs in cents/typed fields>' },
        }
        : {
          toolName: 'compose_model_stack',
          priority: 'P2',
          reason: 'This model slot is routable but may need planning, pass-through input, research-only labeling, or professional handoff before execution.',
          inputHint: { dealType: model.dealTypes[0] || model.name, signals: {} },
        },
    ],
    the_line_invariant:
      'DEFINITIVE computes and routes the model slot. Users, counsel, advisors, specialists, or courts own professional determinations where the boundary says so.',
  };
}

function normalizeSlotId(slotId: string) {
  return String(slotId || '').trim().toUpperCase();
}
