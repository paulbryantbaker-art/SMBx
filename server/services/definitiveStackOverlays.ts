import {
  DEFINITIVE_DEAL_MECHANICS_URI,
  DEFINITIVE_DEAL_MECHANICS_VERSION,
  listDefinitiveDealMechanicsCatalog,
  listDefinitiveGateExpansions,
} from './definitiveDealMechanicsCatalog.js';

export interface DefinitiveStackSignals {
  cashRunwayDays?: number | null;
  fccr?: number | null;
  securedDebtTradingPriceCents?: number | null;
  maintenanceCovenantBreachWithinQuarters?: number | null;
  realEstatePercentOfEv?: number | null;
  digitalAssetsPercentOfEv?: number | null;
  solvencyProngFailed?: boolean | null;
  bankruptcyFilingPending?: boolean | null;
  rsaInMarket?: boolean | null;
  forbearanceExecuted?: boolean | null;
  capitalStructureAction?: boolean | null;
  liabilityManagementExercise?: boolean | null;
  recapitalization?: boolean | null;
  exchangeOffer?: boolean | null;
  covenantAmendment?: boolean | null;
}

export interface DefinitiveStackOverlay {
  gateId: 'G28' | 'G29' | 'G30';
  name: string;
  triggered: boolean;
  reasons: string[];
  catalogModels: string[];
  executableRuntimeModels: string[];
  lineNotes: string;
  status: 'runtime_partial' | 'planning_only';
}

export interface DefinitiveStackOverlayInput {
  dealType?: string | null;
  industry?: string | null;
  jurisdiction?: string | null;
  signals?: DefinitiveStackSignals | null;
}

export function normalizeDefinitiveStackSignals(input: unknown): DefinitiveStackSignals | null {
  if (!input || typeof input !== 'object') return null;
  const source = input as Record<string, unknown>;
  const signals: DefinitiveStackSignals = {};

  setNumber(signals, 'cashRunwayDays', source.cashRunwayDays);
  setNumber(signals, 'fccr', source.fccr);
  setNumber(signals, 'securedDebtTradingPriceCents', source.securedDebtTradingPriceCents);
  setNumber(signals, 'maintenanceCovenantBreachWithinQuarters', source.maintenanceCovenantBreachWithinQuarters);
  setNumber(signals, 'realEstatePercentOfEv', source.realEstatePercentOfEv);
  setNumber(signals, 'digitalAssetsPercentOfEv', source.digitalAssetsPercentOfEv);

  setBoolean(signals, 'solvencyProngFailed', source.solvencyProngFailed);
  setBoolean(signals, 'bankruptcyFilingPending', source.bankruptcyFilingPending);
  setBoolean(signals, 'rsaInMarket', source.rsaInMarket);
  setBoolean(signals, 'forbearanceExecuted', source.forbearanceExecuted);
  setBoolean(signals, 'capitalStructureAction', source.capitalStructureAction);
  setBoolean(signals, 'liabilityManagementExercise', source.liabilityManagementExercise);
  setBoolean(signals, 'recapitalization', source.recapitalization);
  setBoolean(signals, 'exchangeOffer', source.exchangeOffer);
  setBoolean(signals, 'covenantAmendment', source.covenantAmendment);

  return Object.keys(signals).length > 0 ? signals : null;
}

export function evaluateDefinitiveStackOverlays(input: DefinitiveStackOverlayInput): DefinitiveStackOverlay[] {
  const text = [input.dealType, input.industry, input.jurisdiction]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  const signals = input.signals || {};
  const catalog = new Map(listDefinitiveDealMechanicsCatalog().map(model => [model.slotId, model]));
  const gateById = new Map(listDefinitiveGateExpansions().map(gate => [gate.gateId, gate]));

  const g28Reasons: string[] = [];
  const g29Reasons: string[] = [];
  const g30Reasons: string[] = [];

  if (signals.solvencyProngFailed) g28Reasons.push('M148 solvency signal failed at least one prong');
  if (isBelow(signals.cashRunwayDays, 90)) g28Reasons.push('cash runway is below 90 days');
  if (isBelow(signals.fccr, 1)) g28Reasons.push('FCCR is below 1.0x');
  const tradingPrice = normalizeTradingPriceCents(signals.securedDebtTradingPriceCents);
  if (tradingPrice != null && tradingPrice < 60) g28Reasons.push('secured debt is trading below 60 cents');
  if (signals.bankruptcyFilingPending) g28Reasons.push('bankruptcy filing is pending');
  if (signals.rsaInMarket) g28Reasons.push('RSA is in market');
  if (signals.forbearanceExecuted) g28Reasons.push('forbearance has been executed');
  if (hasAny(text, ['bankruptcy', 'chapter 11', 'chapter 7', '363', 'dip', 'rsa', 'forbearance', 'distressed', 'restructuring', 'liquidating trustee', 'stalking horse'])) {
    g28Reasons.push('deal text indicates distressed or restructuring process');
  }

  if (signals.maintenanceCovenantBreachWithinQuarters != null && signals.maintenanceCovenantBreachWithinQuarters <= 4) {
    g29Reasons.push('maintenance covenant breach is projected within four quarters');
  }
  if (tradingPrice != null && tradingPrice < 80) g29Reasons.push('secured debt is trading below 80 cents');
  if (signals.capitalStructureAction) g29Reasons.push('capital-structure action is indicated');
  if (signals.liabilityManagementExercise) g29Reasons.push('liability-management exercise is indicated');
  if (signals.recapitalization) g29Reasons.push('recapitalization is indicated');
  if (signals.exchangeOffer) g29Reasons.push('exchange offer is indicated');
  if (signals.covenantAmendment) g29Reasons.push('covenant amendment is indicated');
  if (hasAny(text, ['lme', 'uptier', 'drop-down', 'dropdown', 'double-dip', 'pari-plus', 'exchange offer', 'distressed debt exchange', 'recap', 'recapitalization', 'covenant amendment', 'convertible', 'safe', 'abl', 'make-whole'])) {
    g29Reasons.push('deal text indicates capital-structure or liability-management mechanics');
  }

  if (signals.realEstatePercentOfEv != null && signals.realEstatePercentOfEv >= 25) {
    g30Reasons.push('real estate equals or exceeds 25 percent of enterprise value');
  }
  if (signals.digitalAssetsPercentOfEv != null && signals.digitalAssetsPercentOfEv >= 10) {
    g30Reasons.push('digital assets equal or exceed 10 percent of enterprise value');
  }
  if (hasAny(text, [
    'real estate',
    'reit',
    'propco',
    'opco',
    'sale-leaseback',
    '1031',
    'firpta',
    'infrastructure',
    'project finance',
    'crypto',
    'digital asset',
    'stablecoin',
    'lp secondary',
    'gp secondary',
    'nav facility',
    'strip sale',
    'title',
    'survey',
    'lease',
    'rent roll',
    'noi',
    'cap rate',
    'cam',
    'citt',
    'transfer tax',
    'ground lease',
    'pca',
    'alta',
  ])) {
    g30Reasons.push('deal text indicates real estate, asset-class, or regulated-asset overlay');
  }

  return [
    buildOverlay('G28', g28Reasons, gateById, catalog),
    buildOverlay('G29', g29Reasons, gateById, catalog),
    buildOverlay('G30', g30Reasons, gateById, catalog),
  ];
}

export function buildDefinitiveStackOverlayMetadata(overlays: DefinitiveStackOverlay[]) {
  return {
    dealMechanicsVersion: DEFINITIVE_DEAL_MECHANICS_VERSION,
    dealMechanicsUri: DEFINITIVE_DEAL_MECHANICS_URI,
    triggeredOverlayGates: overlays.filter(overlay => overlay.triggered).map(overlay => overlay.gateId),
    overlays,
    lineDoctrine: 'DEFINITIVE computes deterministic mechanics and surfaces inputs, citations, and flags. The user, counsel, advisor, or court makes legal, fairness, feasibility, solvency, and litigation determinations.',
  };
}

function buildOverlay(
  gateId: 'G28' | 'G29' | 'G30',
  reasons: string[],
  gateById: Map<'G28' | 'G29' | 'G30', { name: string; primaryModels: string[]; lineNotes: string }>,
  catalog: Map<string, { implementedRuntimeModelId?: string | null }>,
): DefinitiveStackOverlay {
  const gate = gateById.get(gateId);
  const catalogModels = gate?.primaryModels || [];
  const executableRuntimeModels = [
    ...new Set(
      catalogModels
        .map(modelId => catalog.get(modelId)?.implementedRuntimeModelId || null)
        .filter((modelId): modelId is string => Boolean(modelId)),
    ),
  ];

  return {
    gateId,
    name: gate?.name || gateId,
    triggered: reasons.length > 0,
    reasons,
    catalogModels,
    executableRuntimeModels,
    lineNotes: gate?.lineNotes || '',
    status: executableRuntimeModels.length > 0 ? 'runtime_partial' : 'planning_only',
  };
}

function setNumber(target: DefinitiveStackSignals, key: keyof DefinitiveStackSignals, value: unknown): void {
  if (value == null || value === '') return;
  const numberValue = Number(value);
  if (Number.isFinite(numberValue)) {
    (target as Record<string, number | boolean | null | undefined>)[String(key)] = numberValue;
  }
}

function setBoolean(target: DefinitiveStackSignals, key: keyof DefinitiveStackSignals, value: unknown): void {
  if (value == null || value === '') return;
  if (typeof value === 'boolean') {
    (target as Record<string, number | boolean | null | undefined>)[String(key)] = value;
    return;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'y'].includes(normalized)) {
      (target as Record<string, number | boolean | null | undefined>)[String(key)] = true;
    }
    if (['false', '0', 'no', 'n'].includes(normalized)) {
      (target as Record<string, number | boolean | null | undefined>)[String(key)] = false;
    }
  }
}

function normalizeTradingPriceCents(value: number | null | undefined): number | null {
  if (value == null || !Number.isFinite(value)) return null;
  return value <= 1 ? value * 100 : value;
}

function isBelow(value: number | null | undefined, threshold: number): boolean {
  return value != null && Number.isFinite(value) && value < threshold;
}

function hasAny(text: string, needles: string[]): boolean {
  return needles.some(needle => matchesTerm(text, needle));
}

function matchesTerm(text: string, needle: string): boolean {
  const escaped = escapeRegExp(needle);
  if (['abl', 'dip', 'safe'].includes(needle)) {
    return new RegExp(`(^|[\\s,.;:/()])${escaped}(?=$|[\\s,.;:/()])`).test(text);
  }
  return new RegExp(`(^|[^a-z0-9])${escaped}(?=$|[^a-z0-9])`).test(text);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
