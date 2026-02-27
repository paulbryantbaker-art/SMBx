/**
 * Market Data Service — Fetches and caches data from government APIs
 * Sources: Census CBP, BLS QCEW, FRED
 */
import { sql } from '../db.js';

const CENSUS_CBP_BASE = 'https://api.census.gov/data/2021/cbp';
const FRED_BASE = 'https://api.stlouisfed.org/fred/series/observations';
const BLS_BASE = 'https://api.bls.gov/publicAPI/v2/timeseries/data/';

// ─── Cache Layer ─────────────────────────────────────────────

async function getCached(source: string, cacheKey: string): Promise<any | null> {
  const [cached] = await sql`
    SELECT data FROM market_data_cache
    WHERE source = ${source} AND cache_key = ${cacheKey} AND expires_at > NOW()
    LIMIT 1
  `;
  return cached?.data || null;
}

async function setCache(source: string, cacheKey: string, data: any, ttlDays = 7): Promise<void> {
  await sql`
    INSERT INTO market_data_cache (source, cache_key, data, expires_at)
    VALUES (${source}, ${cacheKey}, ${JSON.stringify(data)}, NOW() + ${ttlDays + ' days'}::interval)
    ON CONFLICT (source, cache_key) DO UPDATE SET
      data = ${JSON.stringify(data)}, fetched_at = NOW(), expires_at = NOW() + ${ttlDays + ' days'}::interval
  `;
}

// ─── Census CBP (County Business Patterns) ───────────────────

export interface CBPData {
  naicsCode: string;
  geography: string;
  establishments: number;
  employees: number;
  annualPayroll: number;
  payrollPerEmployee: number;
  sizeDistribution: Record<string, number>;
}

/**
 * Fetch Census County Business Patterns data
 * @param naicsCode - 2-6 digit NAICS code
 * @param stateCode - 2-digit FIPS state code (e.g., "48" for Texas)
 * @param countyCode - 3-digit FIPS county code (optional)
 */
export async function fetchCBPData(naicsCode: string, stateCode: string, countyCode?: string): Promise<CBPData | null> {
  const geo = countyCode ? `${stateCode}:${countyCode}` : stateCode;
  const cacheKey = `${naicsCode}:${geo}`;

  const cached = await getCached('census_cbp', cacheKey);
  if (cached) return cached as CBPData;

  try {
    const geoParam = countyCode
      ? `for=county:${countyCode}&in=state:${stateCode}`
      : `for=state:${stateCode}`;

    const url = `${CENSUS_CBP_BASE}?get=NAICS2017,ESTAB,EMP,PAYANN&${geoParam}&NAICS2017=${naicsCode}`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const json = await res.json();
    if (!json || json.length < 2) return null;

    const headers = json[0] as string[];
    const row = json[1] as string[];

    const estabIdx = headers.indexOf('ESTAB');
    const empIdx = headers.indexOf('EMP');
    const payIdx = headers.indexOf('PAYANN');

    const establishments = parseInt(row[estabIdx], 10) || 0;
    const employees = parseInt(row[empIdx], 10) || 0;
    const annualPayroll = parseInt(row[payIdx], 10) || 0; // in $1000s

    const data: CBPData = {
      naicsCode,
      geography: geo,
      establishments,
      employees,
      annualPayroll: annualPayroll * 1000,
      payrollPerEmployee: employees > 0 ? Math.round((annualPayroll * 1000) / employees) : 0,
      sizeDistribution: {},
    };

    await setCache('census_cbp', cacheKey, data);
    return data;
  } catch (err: any) {
    console.error('Census CBP fetch error:', err.message);
    return null;
  }
}

// ─── FRED (Federal Reserve Economic Data) ────────────────────

export interface FREDData {
  seriesId: string;
  title: string;
  latestValue: number;
  latestDate: string;
  previousValue: number;
  previousDate: string;
  changePct: number;
}

/**
 * Fetch latest FRED series data
 */
export async function fetchFREDData(seriesId: string): Promise<FREDData | null> {
  const cacheKey = seriesId;
  const cached = await getCached('fred', cacheKey);
  if (cached) return cached as FREDData;

  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) {
    // Return cached DB data if no API key
    const [indicator] = await sql`SELECT * FROM fred_indicators WHERE series_id = ${seriesId}`;
    if (indicator && indicator.latest_value) {
      return {
        seriesId,
        title: indicator.title,
        latestValue: parseFloat(indicator.latest_value),
        latestDate: indicator.latest_date?.toISOString()?.split('T')[0] || '',
        previousValue: parseFloat(indicator.previous_value || '0'),
        previousDate: indicator.previous_date?.toISOString()?.split('T')[0] || '',
        changePct: parseFloat(indicator.change_pct || '0'),
      };
    }
    return null;
  }

  try {
    const url = `${FRED_BASE}?series_id=${seriesId}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=2`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const json = await res.json();
    const obs = json.observations;
    if (!obs || obs.length < 1) return null;

    const latest = obs[0];
    const previous = obs.length > 1 ? obs[1] : latest;
    const latestVal = parseFloat(latest.value);
    const prevVal = parseFloat(previous.value);

    const data: FREDData = {
      seriesId,
      title: '', // Will be filled from DB
      latestValue: latestVal,
      latestDate: latest.date,
      previousValue: prevVal,
      previousDate: previous.date,
      changePct: prevVal ? ((latestVal - prevVal) / prevVal) * 100 : 0,
    };

    // Update DB cache
    await sql`
      UPDATE fred_indicators SET
        latest_value = ${latestVal}, latest_date = ${latest.date},
        previous_value = ${prevVal}, previous_date = ${previous.date},
        change_pct = ${data.changePct}, updated_at = NOW()
      WHERE series_id = ${seriesId}
    `;

    // Get title from DB
    const [indicator] = await sql`SELECT title FROM fred_indicators WHERE series_id = ${seriesId}`;
    data.title = indicator?.title || seriesId;

    await setCache('fred', cacheKey, data, 1); // 1 day TTL for economic data
    return data;
  } catch (err: any) {
    console.error('FRED fetch error:', err.message);
    return null;
  }
}

// ─── SBA Bankability Calculator ──────────────────────────────

export interface SBAAnalysis {
  eligible: boolean;
  loanAmount: number;
  interestRate: number;
  monthlyPayment: number;
  annualDebtService: number;
  dscr: number;
  dscrPasses: boolean;
  ltv: number;
  ltvPasses: boolean;
  reasoning: string[];
}

/**
 * Calculate SBA loan eligibility and terms
 */
export async function calculateSBABankability(params: {
  purchasePrice: number;
  ebitdaOrSde: number;
  downPaymentPct?: number;
  loanTermYears?: number;
}): Promise<SBAAnalysis> {
  const downPct = params.downPaymentPct || 0.10; // SBA typically 10-20%
  const termYears = params.loanTermYears || 10;
  const loanAmount = params.purchasePrice * (1 - downPct);

  // Try to get current SBA rate from FRED (Prime + 2.75% for SBA 7(a))
  let primeRate = 8.5; // fallback
  const primeData = await fetchFREDData('PRIME');
  if (primeData) primeRate = primeData.latestValue;

  const sbaSpread = 2.75; // typical SBA 7(a) spread
  const interestRate = primeRate + sbaSpread;
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = termYears * 12;

  const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  const annualDebtService = monthlyPayment * 12;
  const dscr = params.ebitdaOrSde / annualDebtService;
  const ltv = loanAmount / params.purchasePrice;

  const reasoning: string[] = [];
  const dscrPasses = dscr >= 1.25;
  const ltvPasses = ltv <= 0.90;

  if (dscrPasses) reasoning.push(`DSCR of ${dscr.toFixed(2)}x exceeds SBA minimum of 1.25x`);
  else reasoning.push(`DSCR of ${dscr.toFixed(2)}x is below SBA minimum of 1.25x — consider larger down payment or negotiate lower price`);

  if (ltvPasses) reasoning.push(`LTV of ${(ltv * 100).toFixed(0)}% within SBA limits`);
  else reasoning.push(`LTV of ${(ltv * 100).toFixed(0)}% exceeds typical SBA 90% limit`);

  if (params.purchasePrice > 5000000) reasoning.push('SBA 7(a) max is $5M — consider SBA 504 or conventional for larger deals');

  return {
    eligible: dscrPasses && ltvPasses && params.purchasePrice <= 5000000,
    loanAmount: Math.round(loanAmount),
    interestRate: Math.round(interestRate * 100) / 100,
    monthlyPayment: Math.round(monthlyPayment),
    annualDebtService: Math.round(annualDebtService),
    dscr: Math.round(dscr * 100) / 100,
    dscrPasses,
    ltv: Math.round(ltv * 100) / 100,
    ltvPasses,
    reasoning,
  };
}

// ─── Market Overview Generator ───────────────────────────────

export interface MarketOverview {
  naicsCode: string;
  industry: string;
  geography: string;
  cbpData: CBPData | null;
  fredData: Record<string, FREDData | null>;
  sbaAnalysis?: SBAAnalysis;
  summary: string;
}

/**
 * Generate a market overview for a given industry and geography
 */
export async function generateMarketOverview(
  naicsCode: string,
  stateCode: string,
  countyCode?: string,
  dealParams?: { purchasePrice?: number; ebitda?: number; sde?: number }
): Promise<MarketOverview> {
  const cbpData = await fetchCBPData(naicsCode, stateCode, countyCode);

  // Fetch key economic indicators
  const fredKeys = ['FEDFUNDS', 'PRIME', 'UNRATE', 'CPIAUCSL'];
  const fredResults: Record<string, FREDData | null> = {};
  for (const key of fredKeys) {
    fredResults[key] = await fetchFREDData(key);
  }

  let sbaAnalysis: SBAAnalysis | undefined;
  if (dealParams?.purchasePrice && (dealParams?.ebitda || dealParams?.sde)) {
    sbaAnalysis = await calculateSBABankability({
      purchasePrice: dealParams.purchasePrice,
      ebitdaOrSde: dealParams.ebitda || dealParams.sde || 0,
    });
  }

  // Build summary
  const parts: string[] = [];
  if (cbpData) {
    parts.push(`There are ${cbpData.establishments.toLocaleString()} establishments in this industry in the selected geography.`);
    if (cbpData.employees) parts.push(`Total employment: ${cbpData.employees.toLocaleString()} workers.`);
    if (cbpData.payrollPerEmployee) parts.push(`Average payroll per employee: $${cbpData.payrollPerEmployee.toLocaleString()}.`);
  }
  if (fredResults.PRIME) {
    parts.push(`Current prime rate: ${fredResults.PRIME.latestValue}%.`);
  }
  if (sbaAnalysis) {
    parts.push(`SBA 7(a) eligibility: ${sbaAnalysis.eligible ? 'Likely eligible' : 'May not qualify'}. DSCR: ${sbaAnalysis.dscr}x.`);
  }

  // Get industry name from NAICS
  const [naicsRow] = await sql`SELECT title FROM naics_codes WHERE code = ${naicsCode}`.catch(() => [null]);

  return {
    naicsCode,
    industry: naicsRow?.title || `NAICS ${naicsCode}`,
    geography: countyCode ? `State ${stateCode}, County ${countyCode}` : `State ${stateCode}`,
    cbpData,
    fredData: fredResults,
    sbaAnalysis,
    summary: parts.join(' ') || 'Market data not yet available for this industry and geography.',
  };
}
