export type MarketMultipleStatus = 'resolved' | 'needs_market_intelligence' | 'needs_inputs';

export type MarketMultipleSourceType =
  | 'agent_supplied'
  | 'market_packet'
  | 'scenario_assumption';

export interface MarketMultipleAssumption {
  key: string;
  metric: 'sde' | 'ebitda' | 'revenue' | 'unknown';
  value: number;
  sourceType: MarketMultipleSourceType;
  sourceLabel: string;
  citations: string[];
  asOfDate: string | null;
  confidence: 'high' | 'medium' | 'low';
  warning: string | null;
}

export interface MarketMultipleResolution {
  schema: 'MarketMultipleResolution.v0.1';
  status: MarketMultipleStatus;
  calculation: string;
  assumptions: MarketMultipleAssumption[];
  requiredInputs: string[];
  sourceGaps: Array<{ label: string; detail: string; priority: 'high' | 'medium' | 'low' }>;
  next_suggested_calls: Array<{ toolName: string; reason: string; priority: 'P0' | 'P1' | 'P2' }>;
  lineBoundary: string;
}

export interface ResolveMarketMultipleInput {
  calculation: string;
  payload?: Record<string, any> | null;
  marketPacket?: Record<string, any> | null;
}

export interface MarketMultiplePacketInput {
  calculation?: string | null;
  industry?: string | null;
  naicsCode?: string | null;
  geography?: string | null;
  jurisdiction?: string | null;
  league?: string | null;
  metric?: string | null;
  asOfDate?: string | null;
}

export interface MarketBenchmarkSource {
  naicsCode?: string | null;
  naicsLabel?: string | null;
  state?: string | null;
  sdeMultipleLow?: number | string | null;
  sdeMultipleMid?: number | string | null;
  sdeMultipleHigh?: number | string | null;
  ebitdaMultipleLow?: number | string | null;
  ebitdaMultipleMid?: number | string | null;
  ebitdaMultipleHigh?: number | string | null;
  revenueMultipleLow?: number | string | null;
  revenueMultipleMid?: number | string | null;
  revenueMultipleHigh?: number | string | null;
  dataYear?: number | string | null;
  source?: string | null;
  dataSources?: string[] | null;
  notes?: string | null;
  updatedAt?: string | Date | null;
}

export interface ClosedDealMultipleStats {
  dealCount?: number | string | null;
  lowSdeMultiple?: number | string | null;
  medianSdeMultiple?: number | string | null;
  highSdeMultiple?: number | string | null;
  avgSdeMultiple?: number | string | null;
  lowEbitdaMultiple?: number | string | null;
  medianEbitdaMultiple?: number | string | null;
  highEbitdaMultiple?: number | string | null;
  avgEbitdaMultiple?: number | string | null;
  latestClosedYear?: number | string | null;
  league?: string | null;
}

export interface MarketMultiplePacket {
  schema: 'MarketMultiplePacket.v0.1';
  status: 'resolved' | 'needs_market_intelligence' | 'needs_inputs';
  title: string;
  industry: string | null;
  naicsCode: string | null;
  geography: string | null;
  league: string | null;
  metric: 'sde' | 'ebitda' | 'revenue' | 'unknown';
  lowMultiple: number | null;
  midMultiple: number | null;
  highMultiple: number | null;
  exitMultipleBase: number | null;
  sourceCount: number;
  confidence: 'high' | 'medium' | 'low';
  asOfDate: string | null;
  citations: string[];
  observations: Array<Record<string, unknown>>;
  sourceGaps: Array<{ label: string; detail: string; priority: 'high' | 'medium' | 'low' }>;
  lineBoundary: string;
}

export interface ResolveModelMarketMultipleInput {
  modelId: string;
  input?: Record<string, any> | null;
  payload?: Record<string, any> | null;
  marketPacket?: Record<string, any> | null;
}

export interface ModelMarketMultipleInputResolution {
  schema: 'ModelMarketMultipleInputResolution.v0.1';
  status: 'ready' | 'needs_market_intelligence' | 'needs_inputs';
  modelId: string;
  calculation: string | null;
  input: Record<string, any>;
  marketMultipleResolution: MarketMultipleResolution | null;
  lineBoundary: string;
}

const MULTIPLE_KEYS = {
  valuationLow: ['low_multiple', 'lowMultiple', 'valuationLowMultiple', 'multipleLow'],
  valuationHigh: ['high_multiple', 'highMultiple', 'valuationHighMultiple', 'multipleHigh'],
  valuationBase: ['base_multiple', 'baseMultiple', 'valuationMultiple', 'multiple'],
  exit: ['exit_multiple', 'exitMultiple', 'exitMultipleBase'],
};

const INDUSTRY_TO_NAICS: Record<string, string> = {
  hvac: '238220',
  heating: '238220',
  plumbing: '238110',
  electrical: '238210',
  roofing: '238160',
  landscaping: '561730',
  'pest control': '561210',
  cleaning: '561720',
  'commercial cleaning': '561720',
  'auto repair': '811111',
  dental: '621210',
  veterinary: '541940',
  accounting: '541211',
  cpa: '541211',
  insurance: '524210',
  msp: '541519',
  software: '511210',
  saas: '511210',
  ecommerce: '454110',
  manufacturing: '332000',
  restaurant: '722511',
  distribution: '423000',
};

export function inferMarketMultipleNaicsCode(industry?: string | null): string | null {
  const normalized = String(industry || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!normalized) return null;
  if (INDUSTRY_TO_NAICS[normalized]) return INDUSTRY_TO_NAICS[normalized];
  for (const [key, code] of Object.entries(INDUSTRY_TO_NAICS)) {
    if (normalized.includes(key) || key.includes(normalized)) return code;
  }
  return null;
}

export function buildMarketMultiplePacketFromSources(
  input: MarketMultiplePacketInput,
  sources: {
    benchmark?: MarketBenchmarkSource | null;
    closedDeals?: ClosedDealMultipleStats | null;
  },
): MarketMultiplePacket {
  const industry = cleanString(input.industry || sources.benchmark?.naicsLabel);
  const naicsCode = cleanString(input.naicsCode || sources.benchmark?.naicsCode);
  const geography = cleanString(input.geography || input.jurisdiction || sources.benchmark?.state);
  const league = cleanString(input.league || sources.closedDeals?.league);
  const metric = inferMarketPacketMetric(input, sources);
  const asOfDate = cleanString(input.asOfDate)
    || cleanString(sources.benchmark?.updatedAt instanceof Date ? sources.benchmark.updatedAt.toISOString() : sources.benchmark?.updatedAt)
    || yearToDate(sources.benchmark?.dataYear)
    || yearToDate(sources.closedDeals?.latestClosedYear);

  const benchmarkRange = rangeFromBenchmark(sources.benchmark || null, metric);
  const closedDealRange = rangeFromClosedDeals(sources.closedDeals || null, metric);
  const selectedRange = closedDealRange || benchmarkRange;
  const observations: Array<Record<string, unknown>> = [];
  const citations: string[] = [];

  if (benchmarkRange && sources.benchmark) {
    citations.push(`NAICS_BENCHMARK:${sources.benchmark.naicsCode || naicsCode || 'UNKNOWN'}`);
    observations.push({
      sourceType: 'naics_benchmark',
      naicsCode: sources.benchmark.naicsCode || naicsCode,
      label: sources.benchmark.naicsLabel || industry,
      metric,
      lowMultiple: benchmarkRange.low,
      midMultiple: benchmarkRange.mid,
      highMultiple: benchmarkRange.high,
      dataYear: numberOrNull(sources.benchmark.dataYear),
      source: sources.benchmark.source || null,
      dataSources: sources.benchmark.dataSources || [],
      notes: sources.benchmark.notes || null,
    });
  }

  const closedDealCount = numberOrNull(sources.closedDeals?.dealCount);
  if (closedDealRange && closedDealCount && closedDealCount > 0) {
    citations.push(`CLOSED_DEALS:${naicsCode || 'UNKNOWN'}:${league || 'ALL'}`);
    observations.push({
      sourceType: 'closed_deal_stats',
      naicsCode,
      league,
      metric,
      dealCount: closedDealCount,
      lowMultiple: closedDealRange.low,
      midMultiple: closedDealRange.mid,
      highMultiple: closedDealRange.high,
      latestClosedYear: numberOrNull(sources.closedDeals?.latestClosedYear),
    });
  }

  const sourceGaps: MarketMultiplePacket['sourceGaps'] = [];
  if (!industry && !naicsCode) {
    sourceGaps.push({
      label: 'Industry or NAICS missing',
      detail: 'Industry classification is required before the substrate can identify relevant multiple benchmarks.',
      priority: 'high',
    });
  }
  if (!selectedRange) {
    sourceGaps.push({
      label: 'No market multiple source found',
      detail: 'No benchmark or closed-deal multiple range was available for this industry, metric, and league.',
      priority: 'high',
    });
  }
  if (!closedDealRange) {
    sourceGaps.push({
      label: 'Recent comparable transactions missing',
      detail: 'Benchmark multiples can support a directional range, but recent deal-comps should be attached before high-reliance output.',
      priority: 'medium',
    });
  }

  const status = !industry && !naicsCode
    ? 'needs_inputs'
    : selectedRange
      ? 'resolved'
      : 'needs_market_intelligence';
  const confidence: MarketMultiplePacket['confidence'] = closedDealRange && benchmarkRange
    ? 'high'
    : selectedRange
      ? 'medium'
      : 'low';

  return {
    schema: 'MarketMultiplePacket.v0.1',
    status,
    title: `${industry || naicsCode || 'Market'} ${metric.toUpperCase()} multiple packet`,
    industry,
    naicsCode,
    geography,
    league,
    metric,
    lowMultiple: selectedRange?.low ?? null,
    midMultiple: selectedRange?.mid ?? null,
    highMultiple: selectedRange?.high ?? null,
    exitMultipleBase: selectedRange?.mid ?? null,
    sourceCount: observations.length,
    confidence,
    asOfDate,
    citations,
    observations,
    sourceGaps,
    lineBoundary,
  };
}

export function resolveModelMarketMultipleInputs(input: ResolveModelMarketMultipleInput): ModelMarketMultipleInputResolution {
  const modelInput = input.input || {};
  const calculation = calculationForModel(input.modelId);
  if (!calculation) {
    return {
      schema: 'ModelMarketMultipleInputResolution.v0.1',
      status: 'ready',
      modelId: input.modelId,
      calculation: null,
      input: modelInput,
      marketMultipleResolution: null,
      lineBoundary,
    };
  }

  const payload = {
    ...(input.payload || {}),
    ...modelInput,
  };
  const marketMultipleResolution = resolveMarketMultipleAssumptions({
    calculation,
    payload,
    marketPacket: input.marketPacket || {},
  });

  if (marketMultipleResolution.status !== 'resolved') {
    return {
      schema: 'ModelMarketMultipleInputResolution.v0.1',
      status: marketMultipleResolution.status,
      modelId: input.modelId,
      calculation,
      input: modelInput,
      marketMultipleResolution,
      lineBoundary,
    };
  }

  return {
    schema: 'ModelMarketMultipleInputResolution.v0.1',
    status: 'ready',
    modelId: input.modelId,
    calculation,
    input: applyAssumptionsToModelInput(modelInput, marketMultipleResolution.assumptions),
    marketMultipleResolution,
    lineBoundary,
  };
}

export function resolveMarketMultipleAssumptions(input: ResolveMarketMultipleInput): MarketMultipleResolution {
  const calculation = String(input.calculation || 'unknown');
  const calc = calculation.toLowerCase();
  const payload = input.payload || {};
  const marketPacket = input.marketPacket || {};
  const metric = inferMetric(payload, marketPacket);
  const assumptions: MarketMultipleAssumption[] = [];

  if (calc.includes('lbo')) {
    const suppliedExit = firstNumber(payload, MULTIPLE_KEYS.exit);
    if (suppliedExit != null) {
      assumptions.push(assumption('exit_multiple', metric, suppliedExit, 'agent_supplied', 'Agent supplied exit multiple', [], null, 'medium', 'Exit multiple is treated as a caller assumption unless source support is attached.'));
      return resolved(calculation, assumptions);
    }

    const marketExit = firstNumber(marketPacket, ['exit_multiple', 'exitMultiple', 'exitMultipleBase', 'exitMultipleMid', 'baseExitMultiple']);
    if (marketExit != null) {
      assumptions.push(assumption(
        'exit_multiple',
        metric,
        marketExit,
        'market_packet',
        String(marketPacket.title || marketPacket.profileKey || 'Market intelligence packet'),
        citationsFrom(marketPacket),
        stringOrNull(marketPacket.asOfDate || marketPacket.lastResearchedAt),
        confidenceFrom(marketPacket),
        'Exit multiple remains a base-case assumption, but it is supported by the attached market packet.',
      ));
      return resolved(calculation, assumptions);
    }

    return needsMarketIntelligence(calculation, payload, ['exit_multiple']);
  }

  if (calc.includes('valuation') || calc.includes('triangulation') || calc.includes('comps')) {
    const low = firstNumber(payload, MULTIPLE_KEYS.valuationLow);
    const high = firstNumber(payload, MULTIPLE_KEYS.valuationHigh);
    if (low != null && high != null) {
      assumptions.push(assumption('low_multiple', metric, low, 'agent_supplied', 'Agent supplied low multiple', [], null, 'medium', 'Caller-supplied valuation range; cite or confirm before relying externally.'));
      assumptions.push(assumption('high_multiple', metric, high, 'agent_supplied', 'Agent supplied high multiple', [], null, 'medium', 'Caller-supplied valuation range; cite or confirm before relying externally.'));
      return resolved(calculation, assumptions);
    }

    const marketLow = firstNumber(marketPacket, ['low_multiple', 'lowMultiple', 'multipleLow', 'valuationLowMultiple']);
    const marketHigh = firstNumber(marketPacket, ['high_multiple', 'highMultiple', 'multipleHigh', 'valuationHighMultiple']);
    if (marketLow != null && marketHigh != null) {
      assumptions.push(assumption('low_multiple', metric, marketLow, 'market_packet', String(marketPacket.title || marketPacket.profileKey || 'Market intelligence packet'), citationsFrom(marketPacket), stringOrNull(marketPacket.asOfDate || marketPacket.lastResearchedAt), confidenceFrom(marketPacket), null));
      assumptions.push(assumption('high_multiple', metric, marketHigh, 'market_packet', String(marketPacket.title || marketPacket.profileKey || 'Market intelligence packet'), citationsFrom(marketPacket), stringOrNull(marketPacket.asOfDate || marketPacket.lastResearchedAt), confidenceFrom(marketPacket), null));
      return resolved(calculation, assumptions);
    }

    const base = firstNumber(payload, MULTIPLE_KEYS.valuationBase);
    if (base != null) {
      assumptions.push(assumption('base_multiple', metric, base, 'agent_supplied', 'Agent supplied base multiple', [], null, 'medium', 'Single-point valuation multiple; run sensitivity or attach a sourced range before relying externally.'));
      return resolved(calculation, assumptions);
    }

    return needsMarketIntelligence(calculation, payload, ['low_multiple', 'high_multiple']);
  }

  return {
    schema: 'MarketMultipleResolution.v0.1',
    status: 'resolved',
    calculation,
    assumptions,
    requiredInputs: [],
    sourceGaps: [],
    next_suggested_calls: [],
    lineBoundary,
  };
}

function calculationForModel(modelId: string): string | null {
  const normalized = String(modelId || '').toUpperCase();
  if (normalized.includes('MODEL.LBO.LMM')) return 'lbo';
  if (normalized.includes('MODEL.VAL.TRIANGULATION')) return 'valuation';
  return null;
}

function applyAssumptionsToModelInput(
  input: Record<string, any>,
  assumptions: MarketMultipleAssumption[],
): Record<string, any> {
  const next = { ...input };
  for (const item of assumptions) {
    if (item.key === 'exit_multiple' && firstNumber(next, ['exit_multiple', 'exitMultiple']) == null) {
      next.exit_multiple = item.value;
    }
    if (item.key === 'low_multiple' && firstNumber(next, ['low_multiple', 'lowMultiple']) == null) {
      next.low_multiple = item.value;
    }
    if (item.key === 'high_multiple' && firstNumber(next, ['high_multiple', 'highMultiple']) == null) {
      next.high_multiple = item.value;
    }
    if (item.key === 'base_multiple' && firstNumber(next, ['base_multiple', 'baseMultiple']) == null) {
      next.base_multiple = item.value;
    }
  }
  return next;
}

function needsMarketIntelligence(
  calculation: string,
  payload: Record<string, any>,
  requiredInputs: string[],
): MarketMultipleResolution {
  const hasIndustry = Boolean(payload.industry || payload.naicsCode || payload.naics_code);
  const hasGeography = Boolean(payload.jurisdiction || payload.geography || payload.location || payload.state);
  const sourceGaps: MarketMultipleResolution['sourceGaps'] = [];

  if (!hasIndustry) {
    sourceGaps.push({
      label: 'Industry or NAICS missing',
      detail: 'The substrate needs industry classification before it can resolve relevant transaction multiples.',
      priority: 'high',
    });
  }
  if (!hasGeography) {
    sourceGaps.push({
      label: 'Geography missing',
      detail: 'The substrate needs geography to distinguish national benchmarks from local market evidence.',
      priority: 'medium',
    });
  }
  sourceGaps.push({
    label: 'Market multiple support required',
    detail: 'No supplied or cited market multiple was attached. Do not infer a single target or exit multiple.',
    priority: 'high',
  });

  return {
    schema: 'MarketMultipleResolution.v0.1',
    status: hasIndustry ? 'needs_market_intelligence' : 'needs_inputs',
    calculation,
    assumptions: [],
    requiredInputs,
    sourceGaps,
    next_suggested_calls: hasIndustry
      ? [
          { toolName: 'fetch_market_data', reason: 'Fetch timestamped benchmark, market, rate, or authority data for the deal context.', priority: 'P0' },
          { toolName: 'lookup_citation', reason: 'Resolve source tags before relying on market multiple claims.', priority: 'P1' },
        ]
      : [
          { toolName: 'update_deal_payload', reason: 'Collect industry/NAICS and geography before resolving multiples.', priority: 'P0' },
        ],
    lineBoundary,
  };
}

function resolved(calculation: string, assumptions: MarketMultipleAssumption[]): MarketMultipleResolution {
  return {
    schema: 'MarketMultipleResolution.v0.1',
    status: 'resolved',
    calculation,
    assumptions,
    requiredInputs: [],
    sourceGaps: assumptions.some(item => item.sourceType === 'market_packet' && item.citations.length > 0)
      ? []
      : [{
          label: 'Citation support recommended',
          detail: 'A supplied multiple can be modeled, but external reliance should show source support or user confirmation.',
          priority: 'medium',
        }],
    next_suggested_calls: [],
    lineBoundary,
  };
}

function assumption(
  key: string,
  metric: MarketMultipleAssumption['metric'],
  value: number,
  sourceType: MarketMultipleSourceType,
  sourceLabel: string,
  citations: string[],
  asOfDate: string | null,
  confidence: MarketMultipleAssumption['confidence'],
  warning: string | null,
): MarketMultipleAssumption {
  return {
    key,
    metric,
    value,
    sourceType,
    sourceLabel,
    citations,
    asOfDate,
    confidence,
    warning,
  };
}

function inferMetric(payload: Record<string, any>, marketPacket: Record<string, any>): MarketMultipleAssumption['metric'] {
  const metric = String(payload.metric || marketPacket.metric || marketPacket.multipleMetric || '').toLowerCase();
  if (metric.includes('sde')) return 'sde';
  if (metric.includes('revenue')) return 'revenue';
  if (metric.includes('ebitda')) return 'ebitda';
  if (payload.sdeCents || payload.sde_cents || payload.normalized_sde_cents) return 'sde';
  if (payload.revenueCents || payload.revenue_cents) return 'revenue';
  if (payload.ebitdaCents || payload.ebitda_cents || payload.adjusted_ebitda_cents) return 'ebitda';
  return 'unknown';
}

function inferMarketPacketMetric(
  input: MarketMultiplePacketInput,
  sources: { benchmark?: MarketBenchmarkSource | null; closedDeals?: ClosedDealMultipleStats | null },
): MarketMultipleAssumption['metric'] {
  const metric = String(input.metric || '').toLowerCase();
  if (metric.includes('sde')) return 'sde';
  if (metric.includes('revenue')) return 'revenue';
  if (metric.includes('ebitda')) return 'ebitda';
  const calc = String(input.calculation || '').toLowerCase();
  if (calc.includes('lbo') || calc.includes('ebitda')) return 'ebitda';
  if (numberOrNull(sources.benchmark?.ebitdaMultipleMid) != null || numberOrNull(sources.closedDeals?.medianEbitdaMultiple) != null) return 'ebitda';
  if (numberOrNull(sources.benchmark?.sdeMultipleMid) != null || numberOrNull(sources.closedDeals?.medianSdeMultiple) != null) return 'sde';
  if (numberOrNull(sources.benchmark?.revenueMultipleLow) != null) return 'revenue';
  return 'unknown';
}

function rangeFromBenchmark(
  benchmark: MarketBenchmarkSource | null,
  metric: MarketMultipleAssumption['metric'],
): { low: number; mid: number; high: number } | null {
  if (!benchmark) return null;
  if (metric === 'ebitda') {
    return completeRange(
      numberOrNull(benchmark.ebitdaMultipleLow),
      numberOrNull(benchmark.ebitdaMultipleMid),
      numberOrNull(benchmark.ebitdaMultipleHigh),
    );
  }
  if (metric === 'sde') {
    return completeRange(
      numberOrNull(benchmark.sdeMultipleLow),
      numberOrNull(benchmark.sdeMultipleMid),
      numberOrNull(benchmark.sdeMultipleHigh),
    );
  }
  if (metric === 'revenue') {
    return completeRange(
      numberOrNull(benchmark.revenueMultipleLow),
      numberOrNull(benchmark.revenueMultipleMid),
      numberOrNull(benchmark.revenueMultipleHigh),
    );
  }
  return null;
}

function rangeFromClosedDeals(
  stats: ClosedDealMultipleStats | null,
  metric: MarketMultipleAssumption['metric'],
): { low: number; mid: number; high: number } | null {
  if (!stats) return null;
  if (metric === 'ebitda') {
    return completeRange(
      numberOrNull(stats.lowEbitdaMultiple),
      numberOrNull(stats.medianEbitdaMultiple) ?? numberOrNull(stats.avgEbitdaMultiple),
      numberOrNull(stats.highEbitdaMultiple),
    );
  }
  if (metric === 'sde') {
    return completeRange(
      numberOrNull(stats.lowSdeMultiple),
      numberOrNull(stats.medianSdeMultiple) ?? numberOrNull(stats.avgSdeMultiple),
      numberOrNull(stats.highSdeMultiple),
    );
  }
  return null;
}

function completeRange(low: number | null, mid: number | null, high: number | null): { low: number; mid: number; high: number } | null {
  if (mid == null && low != null && high != null) mid = round((low + high) / 2);
  if (low == null && mid != null) low = round(mid * 0.85);
  if (high == null && mid != null) high = round(mid * 1.15);
  if (low == null || mid == null || high == null) return null;
  return {
    low: round(low),
    mid: round(mid),
    high: round(high),
  };
}

function firstNumber(record: Record<string, any>, keys: string[]): number | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return null;
}

function numberOrNull(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function cleanString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function yearToDate(value: unknown): string | null {
  const year = numberOrNull(value);
  if (!year) return null;
  return `${Math.trunc(year)}-12-31`;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function citationsFrom(record: Record<string, any>): string[] {
  const raw = record.citations || record.citationTags || record.sourceRefs || [];
  if (!Array.isArray(raw)) return [];
  return raw.map(item => {
    if (typeof item === 'string') return item;
    if (item && typeof item === 'object') return String(item.id || item.citationTag || item.title || '');
    return '';
  }).filter(Boolean);
}

function confidenceFrom(record: Record<string, any>): MarketMultipleAssumption['confidence'] {
  const confidence = typeof record.confidence === 'string'
    ? record.confidence.toLowerCase()
    : typeof record.confidence === 'number'
      ? record.confidence >= 0.75 ? 'high' : record.confidence >= 0.5 ? 'medium' : 'low'
      : '';
  if (confidence === 'high' || confidence === 'medium' || confidence === 'low') return confidence;
  return citationsFrom(record).length ? 'medium' : 'low';
}

function stringOrNull(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value;
  return null;
}

const lineBoundary = 'Market multiples are inputs with provenance. The substrate may model supplied or sourced assumptions, but it must not invent target, entry, or exit multiples.';
