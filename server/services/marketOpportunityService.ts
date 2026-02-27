/**
 * Market Opportunity Service — Finds underserved markets using Census CBP data.
 */
import { sql } from '../db.js';
import { fetchCBPData } from './marketDataService.js';

interface MarketOpportunity {
  stateCode: string;
  establishments: number;
  employees: number;
  payrollPerEmployee: number;
  opportunityScore: number; // Higher = more underserved
  reasoning: string;
}

/** US state FIPS codes for top 20 states by population */
const TOP_STATES = [
  { fips: '06', name: 'California' }, { fips: '48', name: 'Texas' },
  { fips: '12', name: 'Florida' }, { fips: '36', name: 'New York' },
  { fips: '42', name: 'Pennsylvania' }, { fips: '17', name: 'Illinois' },
  { fips: '39', name: 'Ohio' }, { fips: '13', name: 'Georgia' },
  { fips: '37', name: 'North Carolina' }, { fips: '26', name: 'Michigan' },
  { fips: '34', name: 'New Jersey' }, { fips: '51', name: 'Virginia' },
  { fips: '53', name: 'Washington' }, { fips: '04', name: 'Arizona' },
  { fips: '25', name: 'Massachusetts' }, { fips: '47', name: 'Tennessee' },
  { fips: '18', name: 'Indiana' }, { fips: '29', name: 'Missouri' },
  { fips: '24', name: 'Maryland' }, { fips: '55', name: 'Wisconsin' },
];

/**
 * Find underserved markets for a given NAICS code.
 * Compares establishment density across states.
 */
export async function findUnderservedMarkets(naicsCode: string): Promise<MarketOpportunity[]> {
  // Check cache first
  const [cached] = await sql`
    SELECT data FROM market_data_cache
    WHERE source = 'market_opportunity' AND cache_key = ${naicsCode} AND expires_at > NOW()
    LIMIT 1
  `.catch(() => [null]);

  if (cached?.data) return cached.data as MarketOpportunity[];

  const results: MarketOpportunity[] = [];

  // Fetch CBP data for each top state
  for (const state of TOP_STATES) {
    try {
      const data = await fetchCBPData(naicsCode, state.fips);
      if (data) {
        results.push({
          stateCode: state.fips,
          establishments: data.establishments,
          employees: data.employees,
          payrollPerEmployee: data.payrollPerEmployee,
          opportunityScore: 0, // Computed below
          reasoning: '',
        });
      }
    } catch {
      // Skip states where Census data unavailable
    }
  }

  if (results.length === 0) return [];

  // Calculate opportunity scores — lower density = higher opportunity
  const avgEstablishments = results.reduce((s, r) => s + r.establishments, 0) / results.length;
  const avgPayroll = results.reduce((s, r) => s + r.payrollPerEmployee, 0) / results.length;

  for (const r of results) {
    // Opportunity score: inverse of establishment density, weighted by payroll potential
    const densityRatio = avgEstablishments > 0 ? r.establishments / avgEstablishments : 1;
    const payrollRatio = avgPayroll > 0 ? r.payrollPerEmployee / avgPayroll : 1;

    // Lower density + higher payroll = higher opportunity (underserved + profitable)
    r.opportunityScore = Math.round((1 / Math.max(densityRatio, 0.1)) * payrollRatio * 50);
    r.opportunityScore = Math.min(100, r.opportunityScore);

    const stateName = TOP_STATES.find(s => s.fips === r.stateCode)?.name || r.stateCode;
    if (densityRatio < 0.5) {
      r.reasoning = `${stateName} has ${Math.round((1 - densityRatio) * 100)}% fewer establishments than average — potential underserved market`;
    } else if (densityRatio > 1.5) {
      r.reasoning = `${stateName} is a saturated market with ${Math.round((densityRatio - 1) * 100)}% more establishments than average`;
    } else {
      r.reasoning = `${stateName} has typical market density for this industry`;
    }
  }

  // Sort by opportunity score descending
  results.sort((a, b) => b.opportunityScore - a.opportunityScore);

  // Cache for 30 days
  await sql`
    INSERT INTO market_data_cache (source, cache_key, data, expires_at)
    VALUES ('market_opportunity', ${naicsCode}, ${JSON.stringify(results)}, NOW() + INTERVAL '30 days')
    ON CONFLICT (source, cache_key) DO UPDATE SET
      data = ${JSON.stringify(results)}, fetched_at = NOW(), expires_at = NOW() + INTERVAL '30 days'
  `.catch(() => {});

  return results;
}
