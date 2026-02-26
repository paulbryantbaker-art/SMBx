/**
 * Working Capital Analysis Generator
 *
 * Calculates net working capital, peg, and surplus/deficit.
 * Critical for deal structuring — determines price adjustments at closing.
 * All financial values in CENTS.
 */

export interface WorkingCapitalInput {
  business_name?: string;
  revenue: number;                    // cents — trailing 12 months
  current_assets: {
    cash?: number;                    // cents
    accounts_receivable?: number;     // cents
    inventory?: number;              // cents
    prepaid_expenses?: number;       // cents
    other_current_assets?: number;   // cents
  };
  current_liabilities: {
    accounts_payable?: number;       // cents
    accrued_expenses?: number;       // cents
    deferred_revenue?: number;       // cents
    current_debt?: number;           // cents
    other_current_liabilities?: number; // cents
  };
  // Optional: historical data for trend analysis
  historical_nwc?: Array<{
    period: string;
    net_working_capital: number;     // cents
  }>;
  industry?: string;
  league?: string;
}

export interface WorkingCapitalReport {
  type: 'working_capital_analysis';
  business_name: string;
  current_assets_total: number;      // cents
  current_liabilities_total: number; // cents
  net_working_capital: number;       // cents
  nwc_as_pct_revenue: number;        // percentage
  peg: {
    method: string;
    amount: number;                  // cents
    description: string;
  };
  surplus_deficit: {
    amount: number;                  // cents (positive = surplus)
    impact: string;
    price_adjustment: string;
  };
  ratios: {
    current_ratio: number;
    quick_ratio: number;
    days_receivable: number;
    days_payable: number;
    days_inventory: number;
    cash_conversion_cycle: number;
  };
  components: {
    current_assets: Array<{ name: string; amount: number; pct_of_total: number }>;
    current_liabilities: Array<{ name: string; amount: number; pct_of_total: number }>;
  };
  trend?: {
    periods: string[];
    values: number[];
    direction: 'improving' | 'declining' | 'stable';
    avg_nwc: number;
  };
  recommendations: string[];
  generated_at: string;
}

export function generateWorkingCapitalAnalysis(input: WorkingCapitalInput): WorkingCapitalReport {
  const ca = input.current_assets;
  const cl = input.current_liabilities;

  // Sum current assets
  const cash = ca.cash || 0;
  const ar = ca.accounts_receivable || 0;
  const inventory = ca.inventory || 0;
  const prepaid = ca.prepaid_expenses || 0;
  const otherCA = ca.other_current_assets || 0;
  const totalCA = cash + ar + inventory + prepaid + otherCA;

  // Sum current liabilities
  const ap = cl.accounts_payable || 0;
  const accrued = cl.accrued_expenses || 0;
  const deferred = cl.deferred_revenue || 0;
  const currentDebt = cl.current_debt || 0;
  const otherCL = cl.other_current_liabilities || 0;
  const totalCL = ap + accrued + deferred + currentDebt + otherCL;

  // Net working capital
  const nwc = totalCA - totalCL;
  const nwcPctRevenue = input.revenue > 0 ? Math.round((nwc / input.revenue) * 10000) / 100 : 0;

  // NWC Peg — typically trailing 12-month average or % of revenue
  let pegAmount: number;
  let pegMethod: string;
  let pegDescription: string;

  if (input.historical_nwc && input.historical_nwc.length >= 3) {
    // Use trailing average
    const avg = Math.round(
      input.historical_nwc.reduce((sum, h) => sum + h.net_working_capital, 0) / input.historical_nwc.length
    );
    pegAmount = avg;
    pegMethod = 'Trailing Average';
    pegDescription = `Average NWC over ${input.historical_nwc.length} periods: $${(avg / 100).toLocaleString()}`;
  } else {
    // Industry standard: 10-15% of revenue
    pegAmount = Math.round(input.revenue * 0.10);
    pegMethod = 'Percentage of Revenue (10%)';
    pegDescription = `Standard NWC peg at 10% of revenue: $${(pegAmount / 100).toLocaleString()}`;
  }

  // Surplus / deficit
  const surplusDeficit = nwc - pegAmount;
  let impact: string;
  let priceAdj: string;

  if (surplusDeficit > 0) {
    impact = `Working capital exceeds the peg by $${(surplusDeficit / 100).toLocaleString()} — seller may retain the excess or it may increase the purchase price.`;
    priceAdj = `Potential upward price adjustment of $${(surplusDeficit / 100).toLocaleString()}`;
  } else if (surplusDeficit < 0) {
    impact = `Working capital is $${(Math.abs(surplusDeficit) / 100).toLocaleString()} below the peg — buyer should negotiate a price reduction or require seller to fund the deficit at closing.`;
    priceAdj = `Potential downward price adjustment of $${(Math.abs(surplusDeficit) / 100).toLocaleString()}`;
  } else {
    impact = 'Working capital is at the peg — no price adjustment needed.';
    priceAdj = 'None';
  }

  // Ratios
  const currentRatio = totalCL > 0 ? Math.round((totalCA / totalCL) * 100) / 100 : 0;
  const quickAssets = totalCA - inventory - prepaid;
  const quickRatio = totalCL > 0 ? Math.round((quickAssets / totalCL) * 100) / 100 : 0;

  const dailyRevenue = input.revenue / 365;
  const daysReceivable = dailyRevenue > 0 ? Math.round(ar / dailyRevenue) : 0;
  const daysPayable = dailyRevenue > 0 ? Math.round(ap / dailyRevenue) : 0;
  const daysInventory = dailyRevenue > 0 ? Math.round(inventory / dailyRevenue) : 0;
  const cashConversionCycle = daysReceivable + daysInventory - daysPayable;

  // Component breakdown
  const caComponents = [
    { name: 'Cash & Equivalents', amount: cash, pct_of_total: totalCA > 0 ? Math.round((cash / totalCA) * 100) : 0 },
    { name: 'Accounts Receivable', amount: ar, pct_of_total: totalCA > 0 ? Math.round((ar / totalCA) * 100) : 0 },
    { name: 'Inventory', amount: inventory, pct_of_total: totalCA > 0 ? Math.round((inventory / totalCA) * 100) : 0 },
    { name: 'Prepaid Expenses', amount: prepaid, pct_of_total: totalCA > 0 ? Math.round((prepaid / totalCA) * 100) : 0 },
    { name: 'Other Current Assets', amount: otherCA, pct_of_total: totalCA > 0 ? Math.round((otherCA / totalCA) * 100) : 0 },
  ].filter(c => c.amount > 0);

  const clComponents = [
    { name: 'Accounts Payable', amount: ap, pct_of_total: totalCL > 0 ? Math.round((ap / totalCL) * 100) : 0 },
    { name: 'Accrued Expenses', amount: accrued, pct_of_total: totalCL > 0 ? Math.round((accrued / totalCL) * 100) : 0 },
    { name: 'Deferred Revenue', amount: deferred, pct_of_total: totalCL > 0 ? Math.round((deferred / totalCL) * 100) : 0 },
    { name: 'Current Debt', amount: currentDebt, pct_of_total: totalCL > 0 ? Math.round((currentDebt / totalCL) * 100) : 0 },
    { name: 'Other Current Liabilities', amount: otherCL, pct_of_total: totalCL > 0 ? Math.round((otherCL / totalCL) * 100) : 0 },
  ].filter(c => c.amount > 0);

  // Trend analysis
  let trend: WorkingCapitalReport['trend'] | undefined;
  if (input.historical_nwc && input.historical_nwc.length >= 2) {
    const values = input.historical_nwc.map(h => h.net_working_capital);
    const periods = input.historical_nwc.map(h => h.period);
    const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    const first = values[0];
    const last = values[values.length - 1];
    const changePct = first !== 0 ? Math.round(((last - first) / Math.abs(first)) * 100) : 0;

    let direction: 'improving' | 'declining' | 'stable';
    if (changePct > 10) direction = 'improving';
    else if (changePct < -10) direction = 'declining';
    else direction = 'stable';

    trend = { periods, values, direction, avg_nwc: avg };
  }

  // Recommendations
  const recs: string[] = [];

  if (currentRatio < 1.0) {
    recs.push('Current ratio below 1.0 — business may struggle to meet short-term obligations. Negotiate price reduction.');
  } else if (currentRatio > 2.5) {
    recs.push('High current ratio (>2.5) — excess working capital may be inflating the effective purchase price.');
  }

  if (daysReceivable > 45) {
    recs.push(`Days receivable of ${daysReceivable} is elevated — review collection practices and AR quality.`);
  }

  if (daysPayable > 60) {
    recs.push(`Days payable of ${daysPayable} suggests the business may be stretching vendor payments — check for strained vendor relationships.`);
  }

  if (cashConversionCycle > 60) {
    recs.push(`Cash conversion cycle of ${cashConversionCycle} days is long — buyer will need additional working capital to operate.`);
  }

  if (surplusDeficit < 0) {
    recs.push('Negotiate a working capital adjustment mechanism in the purchase agreement with a true-up at closing.');
  }

  if (recs.length === 0) {
    recs.push('Working capital position appears healthy — standard closing adjustment should suffice.');
  }

  return {
    type: 'working_capital_analysis',
    business_name: input.business_name || 'Business',
    current_assets_total: totalCA,
    current_liabilities_total: totalCL,
    net_working_capital: nwc,
    nwc_as_pct_revenue: nwcPctRevenue,
    peg: {
      method: pegMethod,
      amount: pegAmount,
      description: pegDescription,
    },
    surplus_deficit: {
      amount: surplusDeficit,
      impact,
      price_adjustment: priceAdj,
    },
    ratios: {
      current_ratio: currentRatio,
      quick_ratio: quickRatio,
      days_receivable: daysReceivable,
      days_payable: daysPayable,
      days_inventory: daysInventory,
      cash_conversion_cycle: cashConversionCycle,
    },
    components: {
      current_assets: caComponents,
      current_liabilities: clComponents,
    },
    trend,
    recommendations: recs,
    generated_at: new Date().toISOString(),
  };
}
