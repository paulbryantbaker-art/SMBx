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

export interface DefinitiveCatalogPageOptions {
  limit?: unknown;
  cursor?: unknown;
}

export function buildDefinitiveModelCatalogSurface(options: DefinitiveCatalogPageOptions = {}) {
  const catalog = listDefinitiveDealMechanicsCatalog();
  const routeMap = buildDefinitiveDealRouteMap();
  const routeBySlot = new Map(routeMap.map(route => [route.slotId, route]));
  const page = normalizePage(options, catalog.length, 50, 50);
  const pagedCatalog = catalog.slice(page.offset, page.offset + page.limit);

  return {
    schema: DEFINITIVE_MODEL_CATALOG_SURFACE_VERSION,
    summary: getDefinitiveDealMechanicsSummary(),
    mappingCoverage: getDefinitiveDealMappingCoverage(),
    routeMapSummary: getDefinitiveDealRouteMapSummary(),
    queryHints: {
      bySlotEndpoint: '/api/definitive/model-catalog/{slotId}',
      byDealMechanicsEndpoint: '/api/definitive/deal-mechanics/models/{slotId}',
      slotExamples: ['M109', 'M148', 'M200', 'M206', 'M221'],
      pagination: 'Use limit and cursor query parameters. Default and maximum page size are 50 model slots.',
      agentUse: 'Use this compact catalog when selecting methodology slots. Use compose_model_stack or introspect_capabilities for deal-specific routing.',
    },
    pagination: {
      total: catalog.length,
      limit: page.limit,
      offset: page.offset,
      nextCursor: page.offset + page.limit < catalog.length ? String(page.offset + page.limit) : null,
      previousCursor: page.offset > 0 ? String(Math.max(0, page.offset - page.limit)) : null,
    },
    models: pagedCatalog.map(model => {
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

function normalizePage(
  options: DefinitiveCatalogPageOptions,
  total: number,
  defaultLimit: number,
  maxLimit: number,
) {
  const rawLimit = Number(options.limit);
  const rawOffset = Number(options.cursor);
  const limit = Number.isFinite(rawLimit)
    ? Math.max(1, Math.min(maxLimit, Math.floor(rawLimit)))
    : defaultLimit;
  const offset = Number.isFinite(rawOffset)
    ? Math.max(0, Math.min(Math.floor(rawOffset), Math.max(0, total - 1)))
    : 0;
  return { limit, offset };
}
