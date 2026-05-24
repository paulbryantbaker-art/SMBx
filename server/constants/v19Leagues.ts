// V19 League Classification - extended L1-L10.
// Source: methodology/METHODOLOGY_V19.md section 3.1.

export type League =
  | 'L1'
  | 'L2'
  | 'L3'
  | 'L4'
  | 'L5'
  | 'L6'
  | 'L7'
  | 'L8'
  | 'L9'
  | 'L10';

export type ModelStackComplexity =
  | 'LIGHT'
  | 'LIGHT_MED'
  | 'MEDIUM'
  | 'MEDIUM_HEAVY'
  | 'HEAVY'
  | 'MEGA'
  | 'MEGA_PLUS'
  | 'MEGA_PLUS_PLUS'
  | 'MEGA_PLUS_PLUS_PLUS';

export interface LeagueSpec {
  code: League;
  ebitdaMin: number;
  ebitdaMax: number;
  sdeMin: number;
  sdeMax: number;
  revMin: number;
  revMax: number;
  multipleFloor: number;
  multipleCeil: number;
  primaryMetric: 'SDE' | 'EBITDA';
  buyerProfile: string;
  financing: string;
  modelStackComplexity: ModelStackComplexity;
}

export const LEAGUES: Record<League, LeagueSpec> = {
  L1: { code: 'L1', ebitdaMin: -1, ebitdaMax: -1, sdeMin: 0, sdeMax: 300_000, revMin: 0, revMax: 1_000_000, multipleFloor: 1.8, multipleCeil: 3.5, primaryMetric: 'SDE', buyerProfile: 'Individual operator', financing: 'SBA 7(a) Small Loan + seller note', modelStackComplexity: 'LIGHT' },
  L2: { code: 'L2', ebitdaMin: -1, ebitdaMax: -1, sdeMin: 300_000, sdeMax: 1_000_000, revMin: 1_000_000, revMax: 5_000_000, multipleFloor: 2.5, multipleCeil: 4.5, primaryMetric: 'SDE', buyerProfile: 'Searcher, individual', financing: 'SBA 7(a) up to $5M + seller note', modelStackComplexity: 'LIGHT_MED' },
  L3: { code: 'L3', ebitdaMin: 1_000_000, ebitdaMax: 5_000_000, sdeMin: -1, sdeMax: -1, revMin: 5_000_000, revMax: 25_000_000, multipleFloor: 4.0, multipleCeil: 6.5, primaryMetric: 'EBITDA', buyerProfile: 'Independent sponsor, search fund', financing: 'SBA + mezz + sponsor equity', modelStackComplexity: 'MEDIUM' },
  L4: { code: 'L4', ebitdaMin: 5_000_000, ebitdaMax: 25_000_000, sdeMin: -1, sdeMax: -1, revMin: 25_000_000, revMax: 100_000_000, multipleFloor: 5.5, multipleCeil: 8.5, primaryMetric: 'EBITDA', buyerProfile: 'Lower-middle-market PE', financing: 'Unitranche + sponsor + rollover', modelStackComplexity: 'MEDIUM_HEAVY' },
  L5: { code: 'L5', ebitdaMin: 25_000_000, ebitdaMax: 100_000_000, sdeMin: -1, sdeMax: -1, revMin: 100_000_000, revMax: 500_000_000, multipleFloor: 7.0, multipleCeil: 10.5, primaryMetric: 'EBITDA', buyerProfile: 'Middle-market PE', financing: 'TLB + 2L/mezz + sponsor + rollover', modelStackComplexity: 'HEAVY' },
  L6: { code: 'L6', ebitdaMin: 100_000_000, ebitdaMax: 250_000_000, sdeMin: -1, sdeMax: -1, revMin: 500_000_000, revMax: 2_000_000_000, multipleFloor: 8.5, multipleCeil: 12.5, primaryMetric: 'EBITDA', buyerProfile: 'Upper-middle-market PE', financing: 'Syndicated TLB + 2L + sponsor + cov-lite', modelStackComplexity: 'HEAVY' },
  L7: { code: 'L7', ebitdaMin: 250_000_000, ebitdaMax: 1_000_000_000, sdeMin: -1, sdeMax: -1, revMin: 2_000_000_000, revMax: 10_000_000_000, multipleFloor: 9.5, multipleCeil: 14.0, primaryMetric: 'EBITDA', buyerProfile: 'Mega-fund PE, strategic', financing: 'Syndicated TLB + HY + mezz + sponsor', modelStackComplexity: 'MEGA' },
  L8: { code: 'L8', ebitdaMin: 1_000_000_000, ebitdaMax: 5_000_000_000, sdeMin: -1, sdeMax: -1, revMin: 10_000_000_000, revMax: 50_000_000_000, multipleFloor: 10.5, multipleCeil: 15.5, primaryMetric: 'EBITDA', buyerProfile: 'Mega-cap PE consortium, strategic', financing: 'Mega TLB + HY + 2L + jumbo sponsor equity', modelStackComplexity: 'MEGA_PLUS' },
  L9: { code: 'L9', ebitdaMin: 5_000_000_000, ebitdaMax: 25_000_000_000, sdeMin: -1, sdeMax: -1, revMin: 50_000_000_000, revMax: 250_000_000_000, multipleFloor: 11.5, multipleCeil: 18.0, primaryMetric: 'EBITDA', buyerProfile: 'Mega consortium, strategic mega-merger', financing: 'Multi-tranche HY+TLB+bridge', modelStackComplexity: 'MEGA_PLUS_PLUS' },
  L10: { code: 'L10', ebitdaMin: 25_000_000_000, ebitdaMax: Number.POSITIVE_INFINITY, sdeMin: -1, sdeMax: -1, revMin: 250_000_000_000, revMax: Number.POSITIVE_INFINITY, multipleFloor: 12.0, multipleCeil: 20.0, primaryMetric: 'EBITDA', buyerProfile: 'Mega strategic, hostile / public M&A', financing: 'Bridge + permanent debt + equity + spin', modelStackComplexity: 'MEGA_PLUS_PLUS_PLUS' },
};

// Inputs are dollar values. Use classifyV19LeagueFromCents for database money fields.
export function classifyV19League(params: {
  ebitda?: number | null;
  sde?: number | null;
  revenue?: number | null;
}): League {
  const ebitda = params.ebitda ?? null;
  const sde = params.sde ?? null;
  const revenue = params.revenue ?? null;

  if (ebitda !== null && ebitda >= 1_000_000) {
    for (const code of ['L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9', 'L10'] as League[]) {
      const spec = LEAGUES[code];
      if (ebitda >= spec.ebitdaMin && ebitda < spec.ebitdaMax) return code;
    }
    return 'L10';
  }

  if (sde !== null) {
    if (sde < 300_000) return 'L1';
    if (sde < 1_000_000) return 'L2';
  }

  if (revenue !== null) {
    if (revenue < 1_000_000) return 'L1';
    if (revenue < 5_000_000) return 'L2';
    if (revenue < 25_000_000) return 'L3';
    if (revenue < 100_000_000) return 'L4';
    if (revenue < 500_000_000) return 'L5';
    if (revenue < 2_000_000_000) return 'L6';
    if (revenue < 10_000_000_000) return 'L7';
    if (revenue < 50_000_000_000) return 'L8';
    if (revenue < 250_000_000_000) return 'L9';
    return 'L10';
  }

  return 'L2';
}

export function classifyV19LeagueFromCents(params: {
  ebitdaCents?: number | null;
  sdeCents?: number | null;
  revenueCents?: number | null;
}): League {
  return classifyV19League({
    ebitda: params.ebitdaCents == null ? null : params.ebitdaCents / 100,
    sde: params.sdeCents == null ? null : params.sdeCents / 100,
    revenue: params.revenueCents == null ? null : params.revenueCents / 100,
  });
}

// Enterprise value is often the only reliable first fact an outside agent or
// buyer has. These bands intentionally classify model depth from deal scale
// without pretending EV is a substitute for EBITDA, SDE, or revenue.
export function classifyV19LeagueFromEnterpriseValueCents(evCents?: number | null): League {
  if (evCents == null || !Number.isFinite(evCents)) return 'L2';
  const ev = evCents / 100;
  if (ev < 1_000_000) return 'L1';
  if (ev < 5_000_000) return 'L2';
  if (ev < 25_000_000) return 'L3';
  if (ev < 175_000_000) return 'L4';
  if (ev < 1_000_000_000) return 'L5';
  if (ev < 3_125_000_000) return 'L6';
  if (ev < 14_000_000_000) return 'L7';
  if (ev < 77_500_000_000) return 'L8';
  if (ev < 450_000_000_000) return 'L9';
  return 'L10';
}
