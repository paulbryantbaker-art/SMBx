import {
  DEFINITIVE_DEAL_MECHANICS_MODEL_SLOT_COUNT,
  getDefinitivePassThroughSurface,
  listDefinitiveDealMechanicsCatalog,
  type DefinitiveModelCatalogEntry,
} from './definitiveDealMechanicsCatalog.js';

export type DefinitiveJourney = 'sell' | 'buy' | 'raise' | 'pmi';

export type DefinitiveRouteReadiness =
  | 'executable'
  | 'planning_only'
  | 'professional_handoff'
  | 'research_only'
  | 'pass_through_required'
  | 'reserved';

export type DefinitiveToolSurface =
  | 'yulia_chat'
  | 'today'
  | 'pipeline'
  | 'files'
  | 'studio'
  | 'mcp'
  | 'model_runner'
  | 'pass_through_catalog';

export interface DefinitiveLeagueRange {
  min: string;
  max: string;
}

export interface DefinitiveDealRouteMapEntry {
  slotId: string;
  uri: string;
  name: string;
  gates: string[];
  dealTypes: string[];
  journeys: DefinitiveJourney[];
  leagueRange: DefinitiveLeagueRange;
  readiness: DefinitiveRouteReadiness;
  toolSurfaces: DefinitiveToolSurface[];
  implementedRuntimeModelId: string | null;
  lineCategory: string;
  status: string;
  appliesWhen: string;
  boundary: string;
}

export interface DefinitiveDealRouteMatchInput {
  journey?: DefinitiveJourney | null;
  gate?: string | null;
  dealType?: string | null;
  league?: string | null;
  includePlanningOnly?: boolean;
}

export interface DefinitiveApplicableMechanicsInput {
  journey?: DefinitiveJourney | null;
  league?: string | null;
  dealType?: string | null;
  industry?: string | null;
  jurisdiction?: string | null;
  triggeredGates?: string[] | null;
  includeResearchOnly?: boolean;
  limit?: number;
}

export interface DefinitiveApplicableMechanic {
  slotId: string;
  name: string;
  gates: string[];
  dealTypes: string[];
  journeys: DefinitiveJourney[];
  leagueRange: DefinitiveLeagueRange;
  readiness: DefinitiveRouteReadiness;
  toolSurfaces: DefinitiveToolSurface[];
  implementedRuntimeModelId: string | null;
  lineCategory: string;
  status: string;
  appliesWhen: string;
  boundary: string;
}

export interface DefinitiveApplicableMechanicsSummary {
  total: number;
  executable: number;
  planningOnly: number;
  professionalHandoff: number;
  researchOnly: number;
  passThroughRequired: number;
  reserved: number;
}

const PASS_THROUGH_MODEL_SLOTS = new Set(getDefinitivePassThroughSurface().dependentModelSlots);
const ROUTE_PROFILE_STOPWORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'buy',
  'deal',
  'for',
  'from',
  'in',
  'is',
  'it',
  'm',
  'ma',
  'of',
  'on',
  'or',
  'raise',
  'sale',
  'sell',
  'the',
  'to',
  'with',
]);

export function buildDefinitiveDealRouteMap(): DefinitiveDealRouteMapEntry[] {
  return listDefinitiveDealMechanicsCatalog().map(model => buildRouteEntry(model));
}

export function getDefinitiveDealRouteMapSummary() {
  const routeMap = buildDefinitiveDealRouteMap();
  const active = routeMap.filter(route => route.readiness !== 'reserved');
  const missing = active.filter(route => (
    route.journeys.length === 0 ||
    route.gates.length === 0 ||
    route.dealTypes.length === 0 ||
    route.toolSurfaces.length === 0
  ));
  const readinessCounts = countBy(routeMap, route => route.readiness);
  const journeyCounts = countBy(
    active.flatMap(route => route.journeys.map(journey => ({ journey }))),
    item => item.journey,
  );
  const toolSurfaceCounts = countBy(
    active.flatMap(route => route.toolSurfaces.map(toolSurface => ({ toolSurface }))),
    item => item.toolSurface,
  );

  return {
    totalModelSlots: DEFINITIVE_DEAL_MECHANICS_MODEL_SLOT_COUNT,
    routeMapEntries: routeMap.length,
    activeRouteEntries: active.length,
    completeActiveRouteEntries: active.length - missing.length,
    missingRouteEntries: missing.length,
    missingRouteModelIds: missing.map(route => route.slotId),
    readinessCounts,
    journeyCounts,
    toolSurfaceCounts,
    status: missing.length === 0 ? 'complete' : 'needs_mapping',
  };
}

export function findDefinitiveDealRoutes(input: DefinitiveDealRouteMatchInput): DefinitiveDealRouteMapEntry[] {
  const dealTypeText = normalizeText(input.dealType);
  return buildDefinitiveDealRouteMap().filter(route => {
    if (route.readiness === 'reserved') return false;
    if (!input.includePlanningOnly && route.readiness === 'research_only') return false;
    if (input.journey && !route.journeys.includes(input.journey)) return false;
    if (input.gate && !route.gates.includes(input.gate)) return false;
    if (input.league && !leagueFallsInRange(input.league, route.leagueRange)) return false;
    if (dealTypeText && !matchesDealTypeText(route, dealTypeText)) return false;
    return true;
  });
}

export function composeDefinitiveApplicableMechanics(
  input: DefinitiveApplicableMechanicsInput,
): DefinitiveApplicableMechanic[] {
  const routeMap = buildDefinitiveDealRouteMap();
  const matches = new Map<string, { route: DefinitiveDealRouteMapEntry; score: number }>();
  const queryTokens = tokenizeRouteProfile([
    input.dealType,
    input.industry,
    input.jurisdiction,
  ].filter(Boolean).join(' '));
  const triggeredGates = [...new Set((input.triggeredGates || []).filter(Boolean).map(gate => gate.toUpperCase()))];
  const limit = Number.isFinite(input.limit) && Number(input.limit) > 0 ? Number(input.limit) : 36;

  for (const route of routeMap) {
    if (!routeMatchesBase(route, input)) continue;
    if (queryTokens.length === 0) continue;
    const queryScore = scoreRouteForProfile(route, queryTokens);
    if (queryScore > 0) addRouteMatch(matches, route, 200 + queryScore);
  }

  for (const gate of triggeredGates) {
    for (const route of routeMap) {
      if (!routeMatchesBase(route, input)) continue;
      if (!route.gates.includes(gate)) continue;
      addRouteMatch(matches, route, 100 + route.gates.length);
    }
  }

  return [...matches.values()]
    .sort(compareScoredRoutes)
    .slice(0, limit)
    .map(item => toApplicableMechanic(item.route));
}

export function summarizeDefinitiveApplicableMechanics(
  mechanics: DefinitiveApplicableMechanic[],
): DefinitiveApplicableMechanicsSummary {
  return mechanics.reduce<DefinitiveApplicableMechanicsSummary>((acc, mechanic) => {
    acc.total += 1;
    if (mechanic.readiness === 'executable') acc.executable += 1;
    if (mechanic.readiness === 'planning_only') acc.planningOnly += 1;
    if (mechanic.readiness === 'professional_handoff') acc.professionalHandoff += 1;
    if (mechanic.readiness === 'research_only') acc.researchOnly += 1;
    if (mechanic.readiness === 'pass_through_required') acc.passThroughRequired += 1;
    if (mechanic.readiness === 'reserved') acc.reserved += 1;
    return acc;
  }, {
    total: 0,
    executable: 0,
    planningOnly: 0,
    professionalHandoff: 0,
    researchOnly: 0,
    passThroughRequired: 0,
    reserved: 0,
  });
}

export function buildDefinitiveYuliaMechanicsBrief(
  mechanics: DefinitiveApplicableMechanic[],
  summary = summarizeDefinitiveApplicableMechanics(mechanics),
): string[] {
  if (mechanics.length === 0) {
    return [
      'No profile-specific DEFINITIVE mechanics have been selected yet. Ask for journey, league, deal type, industry, jurisdiction, and G28/G29/G30 signals before representing model coverage.',
    ];
  }

  const lineLoad = summary.professionalHandoff + summary.passThroughRequired + summary.researchOnly;
  const topMechanics = mechanics.slice(0, 6).map(mechanic => (
    `${mechanic.slotId} ${mechanic.name}: ${readinessLabel(mechanic.readiness)}.`
  ));

  return [
    `${summary.total} applicable DEFINITIVE mechanics surfaced for this deal profile; ${summary.executable} are executable runtime models and ${lineLoad} carry THE LINE professional handoff, pass-through, or research-only boundaries.`,
    ...topMechanics,
  ];
}

function buildRouteEntry(model: DefinitiveModelCatalogEntry): DefinitiveDealRouteMapEntry {
  const readiness = getReadiness(model);
  const journeys = readiness === 'reserved' ? [] : inferJourneys(model);
  const leagueRange = readiness === 'reserved' ? { min: 'reserved', max: 'reserved' } : inferLeagueRange(model);
  const toolSurfaces = readiness === 'reserved' ? [] : inferToolSurfaces(model, readiness);

  return {
    slotId: model.slotId,
    uri: model.uri,
    name: model.name,
    gates: model.gates,
    dealTypes: model.dealTypes,
    journeys,
    leagueRange,
    readiness,
    toolSurfaces,
    implementedRuntimeModelId: model.implementedRuntimeModelId || null,
    lineCategory: model.lineCategory,
    status: model.status,
    appliesWhen: buildAppliesWhen(model, journeys),
    boundary: buildBoundary(model, readiness),
  };
}

function getReadiness(model: DefinitiveModelCatalogEntry): DefinitiveRouteReadiness {
  if (model.status === 'reserved' || model.lineCategory === 'reserved') return 'reserved';
  if (model.status.includes('research') || model.lineCategory === 'research_only') return 'research_only';
  if (model.implementedRuntimeModelId) return 'executable';
  if (PASS_THROUGH_MODEL_SLOTS.has(model.slotId)) return 'pass_through_required';
  if (model.lineCategory === 'professional_handoff') return 'professional_handoff';
  return 'planning_only';
}

function inferJourneys(model: DefinitiveModelCatalogEntry): DefinitiveJourney[] {
  const text = modelText(model);
  const journeys = new Set<DefinitiveJourney>();

  if (hasAny(text, ['pmi', 'post-close', 'integration'])) journeys.add('pmi');
  if (hasAny(text, ['sell', 'seller', 'founder', 'sale', 'divestiture', 'carve-out', 'earnout', 'break-up fee', 'termination', 'escrow', 'indemnification', 'survival', 'transaction tax', 'after-tax proceeds', 'joint venture'])) journeys.add('sell');
  if (hasAny(text, ['buy', 'buyer', 'purchase', 'acquisition', 'diligence', 'tender', 'merger', 'target', 'rwi', 'closing', 'ip', 'real estate', 'lease', 'title', 'survey', 'transaction tax', 'buyer basis', 'joint venture', 'crypto', 'stablecoin', 'digital-asset'])) journeys.add('buy');
  if (hasAny(text, ['raise', 'financing', 'debt', 'convertible', 'safe', 'venture', 'nav', 'up-c', 'unitranche', 'abl', 'capital', 'pipe', 'recap', 'dip', 'make-whole', 'call protection', 'high-yield bonds', 'term loans', 'stablecoin'])) journeys.add('raise');

  if (hasAny(text, ['bankruptcy', 'chapter 11', 'chapter 7', '363', 'restructuring', 'distressed', 'lme', 'exchange offer', 'liability management', 'claims trading', 'article 9'])) {
    journeys.add('sell');
    journeys.add('buy');
    journeys.add('raise');
  }

  if (journeys.size === 0) {
    journeys.add('sell');
    journeys.add('buy');
  }

  return sortJourneys([...journeys]);
}

function inferLeagueRange(model: DefinitiveModelCatalogEntry): DefinitiveLeagueRange {
  const text = modelText(model);

  if (hasAny(text, ['sba', 'smb', 'subchapter v', 'search fund'])) return { min: 'L1', max: 'L4' };
  if (hasAny(text, ['esop', 'independent sponsor'])) return { min: 'L1', max: 'L5' };
  if (hasAny(text, ['public', 'tender', '251(h)', 'pipe', 'fairness', 'controller', 'mfw', 'international', 'uk', 'eu', 'eumr', 'take-private'])) return { min: 'L5', max: 'L10' };
  if (hasAny(text, ['lme', 'uptier', 'drop-down', 'double-dip', 'pari-plus', 'project finance', 'crypto', 'stablecoin', 'reit', 'nav facility'])) return { min: 'L4', max: 'L10' };
  if (hasAny(text, ['bankruptcy', 'chapter 11', 'chapter 7', '363', 'dip'])) return { min: 'L2', max: 'L10' };
  if (hasAny(text, ['real estate', 'ground lease', 'title', 'survey', 'pca', 'firpta', '1031', 'opco', 'propco'])) return { min: 'L2', max: 'L10' };
  if (hasAny(text, ['ip', 'software', 'oss', 'source-code', 'domain', 'trademark'])) return { min: 'L2', max: 'L10' };
  if (hasAny(text, ['continuation fund', 'lp secondary', 'gp-led'])) return { min: 'L4', max: 'L10' };

  return { min: 'L1', max: 'L10' };
}

function inferToolSurfaces(model: DefinitiveModelCatalogEntry, readiness: DefinitiveRouteReadiness): DefinitiveToolSurface[] {
  const text = modelText(model);
  const surfaces = new Set<DefinitiveToolSurface>(['yulia_chat', 'today', 'mcp']);

  if (readiness === 'executable') surfaces.add('model_runner');
  if (readiness === 'pass_through_required' || PASS_THROUGH_MODEL_SLOTS.has(model.slotId)) surfaces.add('pass_through_catalog');
  if (readiness === 'professional_handoff' || readiness === 'pass_through_required' || PASS_THROUGH_MODEL_SLOTS.has(model.slotId) || hasAny(text, ['diligence', 'ip', 'title', 'survey', 'pca', 'oss', 'source-code', 'privacy', 'cyber', 'sanctions'])) surfaces.add('files');
  if (model.gates.some(gate => ['G6', 'G7', 'G8', 'G9', 'G10', 'G15', 'G28', 'G29', 'G30'].includes(gate))) surfaces.add('pipeline');
  if (hasAny(text, ['studio', 'book', 'export', 'purchase agreement', 'indemnification', 'escrow', 'earnout', 'closing statement', 'conditions', 'termination', 'rwi', 'fairness'])) surfaces.add('studio');

  return sortToolSurfaces([...surfaces]);
}

function buildAppliesWhen(model: DefinitiveModelCatalogEntry, journeys: DefinitiveJourney[]): string {
  const journeyText = journeys.length ? journeys.join('/') : 'reserved';
  const gateText = model.gates.length ? model.gates.join(', ') : 'no gate';
  const dealTypeText = model.dealTypes.length ? model.dealTypes.join(', ') : 'reserved';
  return `${model.slotId} applies on ${journeyText} journeys when ${dealTypeText} reaches ${gateText}.`;
}

function buildBoundary(model: DefinitiveModelCatalogEntry, readiness: DefinitiveRouteReadiness): string {
  if (readiness === 'executable') {
    return `Executable via ${model.implementedRuntimeModelId}; return deterministic output, citations, hashes, and audit payload.`;
  }
  if (readiness === 'pass_through_required') {
    return 'Requires pass-through data/software input billed per call at cost or cost-plus-fixed margin; professional conclusions remain outside DEFINITIVE.';
  }
  if (readiness === 'professional_handoff') {
    return 'DEFINITIVE computes or structures the mechanics; user, counsel, advisor, specialist, or court owns the professional determination.';
  }
  if (readiness === 'research_only') {
    return 'Research/planning only until authority, jurisdiction, or counsel-reviewed template is stable enough for production execution.';
  }
  if (readiness === 'planning_only') {
    return 'Cataloged and routable, but not executable until deterministic function, schemas, citations, and conformance cases land.';
  }
  return 'Reserved slot; intentionally not routed.';
}

function matchesDealTypeText(route: DefinitiveDealRouteMapEntry, dealTypeText: string): boolean {
  const routeText = normalizeText([
    route.name,
    ...route.dealTypes,
    ...route.gates,
    route.appliesWhen,
  ].join(' '));
  return dealTypeText.split(/\s+/).filter(Boolean).some(token => routeText.includes(token));
}

function routeMatchesBase(
  route: DefinitiveDealRouteMapEntry,
  input: DefinitiveApplicableMechanicsInput,
): boolean {
  if (route.readiness === 'reserved') return false;
  if (route.readiness === 'research_only' && input.includeResearchOnly === false) return false;
  if (input.journey && !route.journeys.includes(input.journey)) return false;
  if (input.league && !leagueFallsInRange(input.league, route.leagueRange)) return false;
  return true;
}

function addRouteMatch(
  matches: Map<string, { route: DefinitiveDealRouteMapEntry; score: number }>,
  route: DefinitiveDealRouteMapEntry,
  score: number,
): void {
  const existing = matches.get(route.slotId);
  if (!existing || score > existing.score) {
    matches.set(route.slotId, { route, score });
  }
}

function compareScoredRoutes(
  left: { route: DefinitiveDealRouteMapEntry; score: number },
  right: { route: DefinitiveDealRouteMapEntry; score: number },
): number {
  if (left.score !== right.score) return right.score - left.score;
  const readinessDelta = readinessRank(left.route.readiness) - readinessRank(right.route.readiness);
  if (readinessDelta !== 0) return readinessDelta;
  return modelSlotNumber(left.route.slotId) - modelSlotNumber(right.route.slotId);
}

function toApplicableMechanic(route: DefinitiveDealRouteMapEntry): DefinitiveApplicableMechanic {
  return {
    slotId: route.slotId,
    name: route.name,
    gates: route.gates,
    dealTypes: route.dealTypes,
    journeys: route.journeys,
    leagueRange: route.leagueRange,
    readiness: route.readiness,
    toolSurfaces: route.toolSurfaces,
    implementedRuntimeModelId: route.implementedRuntimeModelId,
    lineCategory: route.lineCategory,
    status: route.status,
    appliesWhen: route.appliesWhen,
    boundary: route.boundary,
  };
}

function scoreRouteForProfile(route: DefinitiveDealRouteMapEntry, queryTokens: string[]): number {
  const routeTokens = tokenizeRouteProfile([
    route.slotId,
    route.name,
    ...route.dealTypes,
    ...route.gates,
    route.appliesWhen,
  ].join(' '));
  const routeTokenSet = new Set(routeTokens);
  return queryTokens.reduce((score, token) => score + (routeTokenSet.has(token) ? 1 : 0), 0);
}

function tokenizeRouteProfile(value: string): string[] {
  const tokens = normalizeText(value)
    .replace(/[^a-z0-9]+/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 1 && !ROUTE_PROFILE_STOPWORDS.has(token));
  return [...new Set(tokens)];
}

function readinessRank(readiness: DefinitiveRouteReadiness): number {
  const order: DefinitiveRouteReadiness[] = [
    'executable',
    'pass_through_required',
    'professional_handoff',
    'planning_only',
    'research_only',
    'reserved',
  ];
  return order.indexOf(readiness);
}

function readinessLabel(readiness: DefinitiveRouteReadiness): string {
  if (readiness === 'executable') return 'executable with deterministic output, citations, hashes, and audit payload';
  if (readiness === 'pass_through_required') return 'requires a pass-through data/software input before computation';
  if (readiness === 'professional_handoff') return 'computes mechanics while the professional conclusion stays with counsel, advisor, specialist, or court';
  if (readiness === 'research_only') return 'research-only until authority or counsel-reviewed templates stabilize';
  if (readiness === 'planning_only') return 'routable planning coverage, not yet an executable model';
  return 'reserved';
}

function modelSlotNumber(slotId: string): number {
  const match = slotId.match(/^M(\d+)$/);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

function leagueFallsInRange(league: string, range: DefinitiveLeagueRange): boolean {
  const actual = leagueNumber(league);
  const min = leagueNumber(range.min);
  const max = leagueNumber(range.max);
  if (actual == null || min == null || max == null) return false;
  return actual >= min && actual <= max;
}

function leagueNumber(value: string): number | null {
  const match = value.toUpperCase().match(/^L(\d+)$/);
  return match ? Number(match[1]) : null;
}

function modelText(model: DefinitiveModelCatalogEntry): string {
  return normalizeText([
    model.slotId,
    model.name,
    ...model.gates,
    ...model.dealTypes,
    ...model.authorityAnchors,
    model.deterministicComputation,
  ].join(' '));
}

function normalizeText(value: string | null | undefined): string {
  return String(value || '').toLowerCase();
}

function hasAny(text: string, needles: string[]): boolean {
  return needles.some(needle => text.includes(needle));
}

function countBy<T>(items: T[], getKey: (item: T) => string): Record<string, number> {
  return items.reduce<Record<string, number>>((acc, item) => {
    const key = getKey(item);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function sortJourneys(journeys: DefinitiveJourney[]): DefinitiveJourney[] {
  const order: DefinitiveJourney[] = ['sell', 'buy', 'raise', 'pmi'];
  return journeys.sort((left, right) => order.indexOf(left) - order.indexOf(right));
}

function sortToolSurfaces(surfaces: DefinitiveToolSurface[]): DefinitiveToolSurface[] {
  const order: DefinitiveToolSurface[] = ['yulia_chat', 'today', 'pipeline', 'files', 'studio', 'mcp', 'model_runner', 'pass_through_catalog'];
  return surfaces.sort((left, right) => order.indexOf(left) - order.indexOf(right));
}
