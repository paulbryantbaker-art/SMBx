/**
 * Multi-Year Analysis Service
 *
 * Compares 2-3 years of financial data side-by-side for:
 * - Year-over-year trend analysis (revenue growth, margin trends)
 * - P&L vs tax return cross-validation (discrepancy flagging)
 * - Add-back consistency verification
 * - SDE/EBITDA normalization across years
 */
import type { ExtractedFinancials } from './documentExtractor.js';

export interface YearOverYearTrend {
  metric: string;
  years: { year: number; value: number; formattedValue: string }[];
  trend: 'growing' | 'declining' | 'stable' | 'volatile';
  cagr?: number; // compound annual growth rate as decimal
  note?: string;
}

export interface Discrepancy {
  field: string;
  label: string;
  source1: { type: string; value: number; formatted: string };
  source2: { type: string; value: number; formatted: string };
  variance: number; // absolute difference in cents
  variancePercent: number; // as decimal (0.05 = 5%)
  severity: 'low' | 'medium' | 'high';
  explanation: string;
}

export interface MultiYearComparison {
  years: number[];
  trends: YearOverYearTrend[];
  discrepancies: Discrepancy[];
  summary: string;
  normalizedSDE: { year: number; value: number; formatted: string }[];
  normalizedEBITDA: { year: number; value: number; formatted: string }[];
}

const fmt = (cents: number) => `$${(cents / 100).toLocaleString()}`;

/**
 * Generate a multi-year comparison from multiple extracted documents.
 */
export function generateMultiYearComparison(
  extractions: ExtractedFinancials[],
): MultiYearComparison {
  // Group by year
  const byYear = new Map<number, ExtractedFinancials>();
  for (const ext of extractions) {
    if (ext.tax_year) {
      // Keep the most detailed extraction per year
      const existing = byYear.get(ext.tax_year);
      if (!existing || (ext.confidence === 'high' && existing.confidence !== 'high')) {
        byYear.set(ext.tax_year, ext);
      }
    }
  }

  const years = [...byYear.keys()].sort();
  const yearData = years.map(y => byYear.get(y)!);

  // Generate trends for key metrics
  const trends: YearOverYearTrend[] = [];
  const metrics: { key: keyof ExtractedFinancials; label: string }[] = [
    { key: 'revenue', label: 'Revenue' },
    { key: 'gross_profit', label: 'Gross Profit' },
    { key: 'net_income', label: 'Net Income' },
    { key: 'owner_salary', label: 'Owner Compensation' },
    { key: 'operating_expenses', label: 'Operating Expenses' },
  ];

  for (const { key, label } of metrics) {
    const yearValues = yearData
      .map((d, i) => ({ year: years[i], value: (d[key] as number) || 0 }))
      .filter(v => v.value > 0);

    if (yearValues.length < 2) continue;

    const first = yearValues[0].value;
    const last = yearValues[yearValues.length - 1].value;
    const numYears = yearValues.length - 1;

    const cagr = numYears > 0 ? Math.pow(last / first, 1 / numYears) - 1 : 0;

    let trend: 'growing' | 'declining' | 'stable' | 'volatile' = 'stable';
    if (Math.abs(cagr) < 0.02) trend = 'stable';
    else if (cagr > 0) trend = 'growing';
    else trend = 'declining';

    // Check for volatility (direction changes)
    let directionChanges = 0;
    for (let i = 1; i < yearValues.length; i++) {
      const prevGrowth = i >= 2 ? yearValues[i - 1].value - yearValues[i - 2].value : 0;
      const curGrowth = yearValues[i].value - yearValues[i - 1].value;
      if (prevGrowth !== 0 && curGrowth !== 0 && Math.sign(prevGrowth) !== Math.sign(curGrowth)) {
        directionChanges++;
      }
    }
    if (directionChanges > 0 && yearValues.length > 2) trend = 'volatile';

    trends.push({
      metric: label,
      years: yearValues.map(v => ({ ...v, formattedValue: fmt(v.value) })),
      trend,
      cagr,
      note: trend === 'growing'
        ? `${label} growing at ${(cagr * 100).toFixed(1)}% CAGR`
        : trend === 'declining'
        ? `${label} declining at ${(Math.abs(cagr) * 100).toFixed(1)}% annual rate`
        : trend === 'volatile'
        ? `${label} shows inconsistent year-over-year changes`
        : `${label} relatively stable`,
    });
  }

  // Calculate normalized SDE and EBITDA per year
  const normalizedSDE = yearData.map((d, i) => {
    const netIncome = (d.net_income || 0);
    const ownerSalary = (d.owner_salary || 0);
    const depreciation = (d.depreciation || 0);
    const amortization = (d.amortization || 0);
    const interest = (d.interest_expense || 0);
    const sde = netIncome + ownerSalary + depreciation + amortization + interest;
    return { year: years[i], value: sde, formatted: fmt(sde) };
  });

  const normalizedEBITDA = yearData.map((d, i) => {
    const netIncome = (d.net_income || 0);
    const depreciation = (d.depreciation || 0);
    const amortization = (d.amortization || 0);
    const interest = (d.interest_expense || 0);
    const taxes = (d.taxes || 0);
    const ebitda = netIncome + depreciation + amortization + interest + taxes;
    return { year: years[i], value: ebitda, formatted: fmt(ebitda) };
  });

  // Generate summary
  const revTrend = trends.find(t => t.metric === 'Revenue');
  const summary = years.length >= 2
    ? `${years.length}-year analysis (${years[0]}–${years[years.length - 1]}). ` +
      (revTrend ? `Revenue is ${revTrend.trend} with ${revTrend.cagr ? ((revTrend.cagr * 100).toFixed(1) + '% CAGR') : 'minimal change'}. ` : '') +
      `Normalized SDE ranges from ${fmt(Math.min(...normalizedSDE.map(s => s.value)))} to ${fmt(Math.max(...normalizedSDE.map(s => s.value)))}.`
    : 'Single year of data available. Upload additional years for trend analysis.';

  return {
    years,
    trends,
    discrepancies: [], // populated by crossValidate below
    summary,
    normalizedSDE,
    normalizedEBITDA,
  };
}

/**
 * Cross-validate P&L data against tax return data for the same year.
 * Flags discrepancies that may indicate errors or need investigation.
 */
export function crossValidate(
  taxReturn: ExtractedFinancials,
  pnl: ExtractedFinancials,
): Discrepancy[] {
  const discrepancies: Discrepancy[] = [];

  const checks: { field: keyof ExtractedFinancials; label: string; threshold: number }[] = [
    { field: 'revenue', label: 'Revenue', threshold: 0.05 },
    { field: 'net_income', label: 'Net Income', threshold: 0.10 },
    { field: 'cogs', label: 'Cost of Goods Sold', threshold: 0.05 },
    { field: 'gross_profit', label: 'Gross Profit', threshold: 0.08 },
    { field: 'operating_expenses', label: 'Operating Expenses', threshold: 0.10 },
    { field: 'depreciation', label: 'Depreciation', threshold: 0.15 },
    { field: 'interest_expense', label: 'Interest Expense', threshold: 0.10 },
    { field: 'owner_salary', label: 'Owner Compensation', threshold: 0.10 },
  ];

  for (const check of checks) {
    const taxVal = (taxReturn[check.field] as number) || 0;
    const pnlVal = (pnl[check.field] as number) || 0;

    if (taxVal === 0 && pnlVal === 0) continue;
    if (taxVal === 0 || pnlVal === 0) {
      // One source has data, other doesn't — that's a notable gap but not necessarily a discrepancy
      continue;
    }

    const base = Math.max(taxVal, pnlVal);
    const variance = Math.abs(taxVal - pnlVal);
    const variancePercent = base > 0 ? variance / base : 0;

    if (variancePercent > check.threshold) {
      let severity: 'low' | 'medium' | 'high' = 'low';
      if (variancePercent > 0.25) severity = 'high';
      else if (variancePercent > 0.10) severity = 'medium';

      let explanation = '';
      if (check.field === 'revenue' && severity === 'high') {
        explanation = 'Revenue discrepancy above 25% between P&L and tax return is a red flag. Common causes: timing differences, accrual vs cash basis, or unreported income.';
      } else if (check.field === 'owner_salary') {
        explanation = 'Owner compensation differences may reflect distributions vs salary, guaranteed payments, or personal expense classifications.';
      } else {
        explanation = `${check.label} differs by ${(variancePercent * 100).toFixed(1)}% between sources. Verify accounting methods and timing.`;
      }

      discrepancies.push({
        field: check.field,
        label: check.label,
        source1: { type: 'Tax Return', value: taxVal, formatted: fmt(taxVal) },
        source2: { type: 'P&L', value: pnlVal, formatted: fmt(pnlVal) },
        variance,
        variancePercent,
        severity,
        explanation,
      });
    }
  }

  return discrepancies.sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}
