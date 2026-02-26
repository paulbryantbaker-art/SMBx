/**
 * League Classifier — Deterministic league detection from financial data.
 * Source: METHODOLOGY_V17.md + YULIA_PROMPTS_V2.md
 *
 * League determines: financial metric (SDE vs EBITDA), multiple ranges,
 * deliverable pricing, Yulia persona, document complexity.
 */

export interface LeagueInfo {
  league: string;            // 'L1' through 'L6'
  metric: 'SDE' | 'EBITDA';
  multipleMin: number;
  multipleMax: number | null;
  multiplier: number;        // pricing multiplier
  label: string;             // human-readable
  rollUpOverride: boolean;   // true if league was bumped by industry
}

const ROLL_UP_INDUSTRIES = [
  'veterinary', 'vet', 'dental', 'dentist', 'dentistry',
  'hvac', 'heating', 'cooling', 'air conditioning',
  'msp', 'managed services', 'managed service provider', 'it services',
  'pest control', 'pest', 'exterminator', 'extermin',
];

/**
 * Check if an industry qualifies for the roll-up override.
 * Roll-up industries get bumped to L3 (EBITDA metric) when revenue > $1.5M.
 */
function isRollUpIndustry(industry: string): boolean {
  const lower = industry.toLowerCase();
  return ROLL_UP_INDUSTRIES.some(term => lower.includes(term));
}

/**
 * Classify league from financial data.
 *
 * For SELLERS: uses SDE or EBITDA (the earnings metric).
 * For BUYERS: uses capital available + target deal size.
 *
 * All financial values are in CENTS (integers).
 */
export function classifyLeague(params: {
  journey: 'sell' | 'buy' | 'raise' | 'pmi';
  revenue?: number | null;       // cents
  sde?: number | null;           // cents
  ebitda?: number | null;        // cents
  industry?: string | null;
  capitalAvailable?: number | null; // cents (buyer only)
  targetDealSize?: number | null;   // cents (buyer only)
}): LeagueInfo | null {
  const { journey, revenue, sde, ebitda, industry } = params;

  if (journey === 'buy') {
    return classifyBuyerLeague(params.capitalAvailable, params.targetDealSize);
  }

  // For sell/raise/pmi: use earnings metric
  // Convert cents to dollars for threshold comparison
  const sdeDollars = sde ? sde / 100 : null;
  const ebitdaDollars = ebitda ? ebitda / 100 : null;
  const revenueDollars = revenue ? revenue / 100 : null;

  // Check roll-up override: specific industries with revenue > $1.5M → L3 minimum
  const rollUp = industry ? isRollUpIndustry(industry) : false;
  const rollUpApplies = rollUp && revenueDollars && revenueDollars > 1_500_000;

  // Determine primary metric value
  // Use EBITDA if available and appropriate, otherwise SDE, otherwise estimate from revenue
  let earningsValue: number | null = null;
  let usingMetric: 'SDE' | 'EBITDA' = 'SDE';

  if (ebitdaDollars) {
    earningsValue = ebitdaDollars;
    usingMetric = 'EBITDA';
  } else if (sdeDollars) {
    earningsValue = sdeDollars;
    usingMetric = 'SDE';
  } else if (revenueDollars) {
    // Rough estimate: assume 15-20% SDE margin for classification only
    earningsValue = revenueDollars * 0.175;
    usingMetric = 'SDE';
  }

  if (!earningsValue) return null;

  // Classify based on earnings
  let league: LeagueInfo;

  if (usingMetric === 'EBITDA' || earningsValue >= 2_000_000) {
    // EBITDA-based classification
    if (earningsValue >= 50_000_000) {
      league = { league: 'L6', metric: 'EBITDA', multipleMin: 10.0, multipleMax: null, multiplier: 10.0, label: '$50M+ EBITDA', rollUpOverride: false };
    } else if (earningsValue >= 10_000_000) {
      league = { league: 'L5', metric: 'EBITDA', multipleMin: 8.0, multipleMax: 12.0, multiplier: 6.0, label: '$10M–$50M EBITDA', rollUpOverride: false };
    } else if (earningsValue >= 5_000_000) {
      league = { league: 'L4', metric: 'EBITDA', multipleMin: 6.0, multipleMax: 8.0, multiplier: 3.5, label: '$5M–$10M EBITDA', rollUpOverride: false };
    } else if (earningsValue >= 2_000_000) {
      league = { league: 'L3', metric: 'EBITDA', multipleMin: 4.0, multipleMax: 6.0, multiplier: 2.0, label: '$2M–$5M EBITDA', rollUpOverride: false };
    } else {
      // EBITDA provided but below L3 threshold — fall through to SDE-based
      league = classifySDE(earningsValue);
    }
  } else {
    league = classifySDE(earningsValue);
  }

  // Apply roll-up override: bump to at least L3
  if (rollUpApplies && ['L1', 'L2'].includes(league.league)) {
    league = {
      league: 'L3',
      metric: 'EBITDA',
      multipleMin: 4.0,
      multipleMax: 6.0,
      multiplier: 2.0,
      label: '$2M–$5M EBITDA (Roll-Up Override)',
      rollUpOverride: true,
    };
  }

  return league;
}

function classifySDE(sdeDollars: number): LeagueInfo {
  if (sdeDollars >= 1_000_000) {
    // High SDE but below EBITDA thresholds → L2 top
    return { league: 'L2', metric: 'SDE', multipleMin: 3.0, multipleMax: 5.0, multiplier: 1.25, label: '$500K–$2M SDE', rollUpOverride: false };
  } else if (sdeDollars >= 500_000) {
    return { league: 'L2', metric: 'SDE', multipleMin: 3.0, multipleMax: 5.0, multiplier: 1.25, label: '$500K–$2M SDE', rollUpOverride: false };
  } else {
    return { league: 'L1', metric: 'SDE', multipleMin: 2.0, multipleMax: 3.5, multiplier: 1.0, label: 'Under $500K SDE', rollUpOverride: false };
  }
}

function classifyBuyerLeague(
  capitalAvailable?: number | null,
  targetDealSize?: number | null,
): LeagueInfo | null {
  // Use capital available as primary signal, target deal size as secondary
  const capDollars = capitalAvailable ? capitalAvailable / 100 : null;
  const dealDollars = targetDealSize ? targetDealSize / 100 : null;
  const signal = capDollars || (dealDollars ? dealDollars * 0.2 : null); // assume 20% equity

  if (!signal) return null;

  if (signal >= 10_000_000) {
    return { league: 'L5', metric: 'EBITDA', multipleMin: 8.0, multipleMax: 12.0, multiplier: 6.0, label: '$10M+ capital', rollUpOverride: false };
  } else if (signal >= 2_000_000) {
    return { league: 'L4', metric: 'EBITDA', multipleMin: 6.0, multipleMax: 8.0, multiplier: 3.5, label: '$2M–$10M capital', rollUpOverride: false };
  } else if (signal >= 500_000) {
    return { league: 'L2', metric: 'SDE', multipleMin: 3.0, multipleMax: 5.0, multiplier: 1.25, label: '$500K–$2M capital', rollUpOverride: false };
  } else {
    return { league: 'L1', metric: 'SDE', multipleMin: 2.0, multipleMax: 3.5, multiplier: 1.0, label: 'Under $500K capital', rollUpOverride: false };
  }
}

/** Get league multiplier for pricing */
export function getLeagueMultiplier(league: string): number {
  const multipliers: Record<string, number> = {
    L1: 1.0,
    L2: 1.25,
    L3: 2.0,
    L4: 3.5,
    L5: 6.0,
    L6: 10.0,
  };
  return multipliers[league] ?? 1.0;
}

/** Get multiple range for a league */
export function getLeagueMultipleRange(league: string): { metric: string; min: number; max: number | null } {
  const ranges: Record<string, { metric: string; min: number; max: number | null }> = {
    L1: { metric: 'SDE', min: 2.0, max: 3.5 },
    L2: { metric: 'SDE', min: 3.0, max: 5.0 },
    L3: { metric: 'EBITDA', min: 4.0, max: 6.0 },
    L4: { metric: 'EBITDA', min: 6.0, max: 8.0 },
    L5: { metric: 'EBITDA', min: 8.0, max: 12.0 },
    L6: { metric: 'EBITDA', min: 10.0, max: null },
  };
  return ranges[league] ?? { metric: 'SDE', min: 2.0, max: 3.5 };
}
