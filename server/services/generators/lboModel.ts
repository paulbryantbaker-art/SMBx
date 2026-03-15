/**
 * LBO Model Generator
 *
 * Deterministic leveraged buyout model with IRR, MOIC, and cash-on-cash analysis.
 * Used for PE-style acquisition analysis at L3+ leagues.
 * All financial values in CENTS.
 */

export interface LBOModelInput {
  business_name?: string;
  industry?: string;
  league: string;
  revenue: number;           // cents
  ebitda?: number;           // cents
  sde?: number;              // cents
  purchase_price?: number;   // cents (asking price)
  growth_rate?: number;      // annual %
  margin_improvement?: number; // basis points per year
  capex_pct?: number;        // % of revenue
  tax_rate?: number;         // %
  exit_multiple?: number;    // exit EV/EBITDA multiple
  hold_period?: number;      // years (default 5)
  // Financing structure
  senior_debt_multiple?: number;   // x EBITDA
  senior_debt_rate?: number;       // annual %
  mezzanine_pct?: number;         // % of purchase price
  mezzanine_rate?: number;        // annual %
  equity_pct?: number;            // % of purchase price (remainder)
  financials?: Record<string, any>;
}

interface YearProjection {
  year: number;
  revenue: number;
  ebitda: number;
  margin: number;
  capex: number;
  free_cash_flow: number;
  debt_balance: number;
  debt_service: number;
  equity_value: number;
}

export function generateLBOModel(input: LBOModelInput): Record<string, any> {
  const earnings = input.ebitda || input.sde || 0;
  const metric = input.ebitda ? 'EBITDA' : 'SDE';
  const purchasePrice = input.purchase_price || (earnings > 0 ? earnings * 5 : input.revenue * 0.5);
  const holdPeriod = input.hold_period || 5;
  const growthRate = (input.growth_rate || 5) / 100;
  const marginImprovement = (input.margin_improvement || 50) / 10000; // bps to decimal
  const capexPct = (input.capex_pct || 3) / 100;
  const taxRate = (input.tax_rate || 25) / 100;
  const exitMultiple = input.exit_multiple || estimateExitMultiple(input.league, earnings);

  // Financing structure
  const seniorDebtMultiple = input.senior_debt_multiple || estimateSeniorDebt(input.league);
  const seniorDebtRate = (input.senior_debt_rate || estimateSeniorRate(input.league)) / 100;
  const seniorDebt = Math.min(earnings * seniorDebtMultiple, purchasePrice * 0.7);
  const mezzPct = (input.mezzanine_pct || 0) / 100;
  const mezzDebt = purchasePrice * mezzPct;
  const mezzRate = (input.mezzanine_rate || 12) / 100;
  const equity = purchasePrice - seniorDebt - mezzDebt;

  // Sources & Uses
  const sources = {
    senior_debt: seniorDebt,
    mezzanine: mezzDebt,
    equity: equity,
    total: purchasePrice,
  };

  const uses = {
    purchase_price: purchasePrice,
    transaction_costs: Math.round(purchasePrice * 0.03),
    working_capital: 0,
    total: purchasePrice + Math.round(purchasePrice * 0.03),
  };

  // Year-by-year projections
  const projections: YearProjection[] = [];
  let currentRevenue = input.revenue;
  let currentMargin = earnings > 0 && input.revenue > 0 ? earnings / input.revenue : 0.20;
  let debtBalance = seniorDebt + mezzDebt;
  let cumulativeFCF = 0;

  for (let year = 1; year <= holdPeriod; year++) {
    currentRevenue = Math.round(currentRevenue * (1 + growthRate));
    currentMargin = Math.min(currentMargin + marginImprovement, 0.50); // cap at 50%
    const yearEbitda = Math.round(currentRevenue * currentMargin);
    const capex = Math.round(currentRevenue * capexPct);
    const taxes = Math.round(Math.max(0, yearEbitda - capex) * taxRate);

    // Debt service (interest + mandatory amortization)
    const seniorBalance = Math.max(0, seniorDebt - (seniorDebt / (holdPeriod + 2)) * year);
    const mezzBalance = mezzDebt; // PIK or bullet
    const interest = Math.round(seniorBalance * seniorDebtRate + mezzBalance * mezzRate);
    const amortization = Math.round(seniorDebt / (holdPeriod + 2));
    const debtService = interest + amortization;

    const fcf = yearEbitda - capex - taxes - debtService;
    cumulativeFCF += fcf;
    debtBalance = Math.max(0, debtBalance - amortization);

    const evAtExit = yearEbitda * exitMultiple;
    const equityValue = evAtExit - debtBalance;

    projections.push({
      year,
      revenue: currentRevenue,
      ebitda: yearEbitda,
      margin: Math.round(currentMargin * 10000) / 100,
      capex,
      free_cash_flow: fcf,
      debt_balance: debtBalance,
      debt_service: debtService,
      equity_value: equityValue,
    });
  }

  // Exit analysis
  const exitYear = projections[holdPeriod - 1];
  const exitEV = exitYear.ebitda * exitMultiple;
  const exitEquity = exitEV - exitYear.debt_balance;
  const totalReturn = exitEquity + cumulativeFCF;
  const moic = equity > 0 ? Math.round((totalReturn / equity) * 100) / 100 : 0;
  const irr = equity > 0 ? calculateIRR(equity, projections.map(p => p.free_cash_flow), exitEquity) : 0;
  const cashOnCash = equity > 0 ? Math.round((cumulativeFCF / equity) * 10000) / 100 : 0;

  // Return metrics
  const returnMetrics = {
    irr: Math.round(irr * 10000) / 100,
    moic,
    cash_on_cash: cashOnCash,
    total_return: totalReturn,
    exit_ev: exitEV,
    exit_equity: exitEquity,
    cumulative_fcf: cumulativeFCF,
  };

  // Format for display
  const fmt = (cents: number) => `$${(cents / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

  const markdown = buildMarkdown(input, sources, uses, projections, returnMetrics, {
    metric, purchasePrice, equity, seniorDebt, mezzDebt,
    exitMultiple, holdPeriod, growthRate, taxRate, fmt,
  });

  return {
    type: 'lbo_model',
    markdown,
    sources,
    uses,
    projections,
    return_metrics: returnMetrics,
    assumptions: {
      purchase_price: purchasePrice,
      growth_rate: growthRate * 100,
      margin_improvement_bps: (input.margin_improvement || 50),
      capex_pct: capexPct * 100,
      tax_rate: taxRate * 100,
      exit_multiple: exitMultiple,
      hold_period: holdPeriod,
      senior_debt_rate: seniorDebtRate * 100,
      mezzanine_rate: mezzRate * 100,
    },
    generated_at: new Date().toISOString(),
  };
}

function buildMarkdown(
  input: LBOModelInput, sources: any, uses: any,
  projections: YearProjection[], returns: any, ctx: any,
): string {
  const { fmt, metric, exitMultiple, holdPeriod } = ctx;
  const lines: string[] = [];

  lines.push(`# LBO Model — ${input.business_name || 'Target Company'}`);
  lines.push('');
  lines.push('## Sources & Uses');
  lines.push('| Sources | Amount | | Uses | Amount |');
  lines.push('|---------|--------|---|------|--------|');
  lines.push(`| Senior Debt | ${fmt(sources.senior_debt)} | | Purchase Price | ${fmt(uses.purchase_price)} |`);
  if (sources.mezzanine > 0) {
    lines.push(`| Mezzanine | ${fmt(sources.mezzanine)} | | Transaction Costs | ${fmt(uses.transaction_costs)} |`);
  }
  lines.push(`| Equity | ${fmt(sources.equity)} | | | |`);
  lines.push(`| **Total** | **${fmt(sources.total)}** | | **Total** | **${fmt(uses.total)}** |`);
  lines.push('');

  lines.push('## Projected Performance');
  lines.push(`| Year | Revenue | ${metric} | Margin | FCF | Debt Balance |`);
  lines.push('|------|---------|--------|--------|-----|--------------|');
  for (const p of projections) {
    lines.push(`| ${p.year} | ${fmt(p.revenue)} | ${fmt(p.ebitda)} | ${p.margin}% | ${fmt(p.free_cash_flow)} | ${fmt(p.debt_balance)} |`);
  }
  lines.push('');

  lines.push('## Return Analysis');
  lines.push(`| Metric | Value |`);
  lines.push('|--------|-------|');
  lines.push(`| IRR | **${returns.irr}%** |`);
  lines.push(`| MOIC | **${returns.moic}x** |`);
  lines.push(`| Cash-on-Cash | ${returns.cash_on_cash}% |`);
  lines.push(`| Exit EV (${exitMultiple}x ${metric}) | ${fmt(returns.exit_ev)} |`);
  lines.push(`| Exit Equity | ${fmt(returns.exit_equity)} |`);
  lines.push(`| Cumulative FCF | ${fmt(returns.cumulative_fcf)} |`);
  lines.push(`| Total Return | ${fmt(returns.total_return)} |`);
  lines.push('');

  lines.push('## Key Assumptions');
  lines.push(`- Hold period: ${holdPeriod} years`);
  lines.push(`- Revenue growth: ${(ctx.growthRate * 100).toFixed(1)}% annually`);
  lines.push(`- Exit multiple: ${exitMultiple}x ${metric}`);
  lines.push(`- Tax rate: ${(ctx.taxRate * 100).toFixed(0)}%`);
  lines.push('');
  lines.push('*This model is for illustrative purposes. Actual returns will vary based on operational execution, market conditions, and final deal terms.*');

  return lines.join('\n');
}

function estimateExitMultiple(league: string, earnings: number): number {
  switch (league) {
    case 'L1': return 3.0;
    case 'L2': return 4.0;
    case 'L3': return 5.5;
    case 'L4': return 7.0;
    case 'L5': return 9.0;
    case 'L6': return 11.0;
    default: return 5.0;
  }
}

function estimateSeniorDebt(league: string): number {
  switch (league) {
    case 'L1': return 2.5;
    case 'L2': return 3.0;
    case 'L3': return 3.5;
    case 'L4': return 4.0;
    case 'L5': return 4.5;
    case 'L6': return 5.0;
    default: return 3.5;
  }
}

function estimateSeniorRate(league: string): number {
  switch (league) {
    case 'L1': case 'L2': return 8.5;  // SBA rates
    case 'L3': case 'L4': return 7.0;
    case 'L5': case 'L6': return 5.5;
    default: return 7.0;
  }
}

function calculateIRR(equity: number, cashFlows: number[], exitValue: number): number {
  // Newton's method for IRR
  const flows = [-equity, ...cashFlows.slice(0, -1), cashFlows[cashFlows.length - 1] + exitValue];
  let rate = 0.15; // initial guess

  for (let i = 0; i < 50; i++) {
    let npv = 0;
    let dnpv = 0;
    for (let t = 0; t < flows.length; t++) {
      npv += flows[t] / Math.pow(1 + rate, t);
      dnpv -= t * flows[t] / Math.pow(1 + rate, t + 1);
    }
    if (Math.abs(npv) < 0.01) break;
    if (dnpv === 0) break;
    rate = rate - npv / dnpv;
    if (rate < -0.99) rate = -0.5;
    if (rate > 10) rate = 5;
  }

  return rate;
}
