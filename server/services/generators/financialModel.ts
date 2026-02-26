/**
 * Financial Model Generator
 *
 * Deterministic 5-year projection model with scenario analysis.
 * All financial values in CENTS.
 */

export interface FinancialModelInput {
  business_name?: string;
  revenue: number;               // cents — trailing 12 months
  cogs?: number;                 // cents
  operating_expenses?: number;   // cents
  sde?: number;                  // cents
  ebitda?: number;               // cents
  owner_salary?: number;         // cents
  growth_rate?: number;          // percentage
  gross_margin?: number;         // percentage
  operating_margin?: number;     // percentage
  capex_annual?: number;         // cents
  working_capital_pct?: number;  // percentage of revenue
  debt_service_annual?: number;  // cents
  tax_rate?: number;             // percentage
  league?: string;
}

export interface ProjectionYear {
  year: number;
  revenue: number;
  cogs: number;
  gross_profit: number;
  gross_margin_pct: number;
  operating_expenses: number;
  ebitda: number;
  ebitda_margin_pct: number;
  capex: number;
  free_cash_flow: number;
  debt_service: number;
  net_cash_flow: number;
  cumulative_cash_flow: number;
}

export interface FinancialModelReport {
  type: 'financial_model';
  business_name: string;
  base_case: ProjectionYear[];
  optimistic_case: ProjectionYear[];
  conservative_case: ProjectionYear[];
  assumptions: {
    base: ScenarioAssumptions;
    optimistic: ScenarioAssumptions;
    conservative: ScenarioAssumptions;
  };
  breakeven_analysis: {
    monthly_breakeven_revenue: number;  // cents
    current_above_breakeven_pct: number;
  };
  key_metrics: {
    irr_estimate: number;              // percentage
    payback_period_years: number;
    total_5yr_cash_flow: number;       // cents
    avg_annual_cash_flow: number;      // cents
    revenue_cagr: number;             // percentage
  };
  generated_at: string;
}

interface ScenarioAssumptions {
  revenue_growth_rate: number;
  gross_margin: number;
  opex_growth_rate: number;
  capex_pct_revenue: number;
  tax_rate: number;
}

export function generateFinancialModel(input: FinancialModelInput): FinancialModelReport {
  const revenue = input.revenue;
  const grossMargin = input.gross_margin || (input.cogs ? Math.round((1 - input.cogs / revenue) * 100) : 60);
  const growthRate = input.growth_rate || 5;
  const taxRate = input.tax_rate || 25;
  const capexPct = input.capex_annual ? Math.round((input.capex_annual / revenue) * 100) : 3;
  const debtService = input.debt_service_annual || 0;

  const cogs = input.cogs || Math.round(revenue * (1 - grossMargin / 100));
  const opex = input.operating_expenses || Math.round(revenue * 0.25);
  const ebitda = input.ebitda || input.sde || (revenue - cogs - opex);

  // Base assumptions
  const baseAssumptions: ScenarioAssumptions = {
    revenue_growth_rate: growthRate,
    gross_margin: grossMargin,
    opex_growth_rate: Math.max(growthRate - 1, 2),
    capex_pct_revenue: capexPct,
    tax_rate: taxRate,
  };

  const optimisticAssumptions: ScenarioAssumptions = {
    revenue_growth_rate: growthRate * 1.5,
    gross_margin: Math.min(grossMargin + 3, 95),
    opex_growth_rate: Math.max(growthRate - 2, 1),
    capex_pct_revenue: capexPct,
    tax_rate: taxRate,
  };

  const conservativeAssumptions: ScenarioAssumptions = {
    revenue_growth_rate: Math.max(growthRate * 0.5, 0),
    gross_margin: Math.max(grossMargin - 3, 20),
    opex_growth_rate: growthRate + 1,
    capex_pct_revenue: capexPct + 1,
    tax_rate: taxRate,
  };

  // Build projections
  const baseCase = buildProjection(revenue, cogs, opex, debtService, baseAssumptions);
  const optimisticCase = buildProjection(revenue, cogs, opex, debtService, optimisticAssumptions);
  const conservativeCase = buildProjection(revenue, cogs, opex, debtService, conservativeAssumptions);

  // Breakeven analysis
  const fixedCosts = opex + debtService;
  const contributionMarginPct = grossMargin / 100;
  const monthlyBreakeven = contributionMarginPct > 0
    ? Math.round(fixedCosts / contributionMarginPct / 12)
    : 0;
  const monthlyRevenue = Math.round(revenue / 12);
  const aboveBreakevenPct = monthlyBreakeven > 0
    ? Math.round(((monthlyRevenue - monthlyBreakeven) / monthlyBreakeven) * 100)
    : 0;

  // Key metrics
  const total5yrCashFlow = baseCase.reduce((sum, y) => sum + y.net_cash_flow, 0);
  const avgAnnualCashFlow = Math.round(total5yrCashFlow / 5);
  const year5Revenue = baseCase[4].revenue;
  const revenueCAGR = Math.round((Math.pow(year5Revenue / revenue, 1 / 5) - 1) * 10000) / 100;

  // Simple IRR estimate (based on cash flows relative to initial investment)
  const initialInvestment = ebitda * 4; // rough proxy
  const irrEstimate = initialInvestment > 0
    ? Math.round((avgAnnualCashFlow / initialInvestment) * 10000) / 100
    : 0;

  // Payback period
  let paybackYears = 5;
  let cumulativeCF = 0;
  for (let i = 0; i < baseCase.length; i++) {
    cumulativeCF += baseCase[i].net_cash_flow;
    if (cumulativeCF >= initialInvestment) {
      paybackYears = i + 1;
      break;
    }
  }

  return {
    type: 'financial_model',
    business_name: input.business_name || 'Business',
    base_case: baseCase,
    optimistic_case: optimisticCase,
    conservative_case: conservativeCase,
    assumptions: {
      base: baseAssumptions,
      optimistic: optimisticAssumptions,
      conservative: conservativeAssumptions,
    },
    breakeven_analysis: {
      monthly_breakeven_revenue: monthlyBreakeven,
      current_above_breakeven_pct: aboveBreakevenPct,
    },
    key_metrics: {
      irr_estimate: irrEstimate,
      payback_period_years: paybackYears,
      total_5yr_cash_flow: total5yrCashFlow,
      avg_annual_cash_flow: avgAnnualCashFlow,
      revenue_cagr: revenueCAGR,
    },
    generated_at: new Date().toISOString(),
  };
}

function buildProjection(
  baseRevenue: number,
  baseCogs: number,
  baseOpex: number,
  debtService: number,
  assumptions: ScenarioAssumptions,
): ProjectionYear[] {
  const years: ProjectionYear[] = [];
  let cumCashFlow = 0;

  for (let i = 1; i <= 5; i++) {
    const revGrowth = Math.pow(1 + assumptions.revenue_growth_rate / 100, i);
    const opexGrowth = Math.pow(1 + assumptions.opex_growth_rate / 100, i);

    const rev = Math.round(baseRevenue * revGrowth);
    const cogs = Math.round(rev * (1 - assumptions.gross_margin / 100));
    const grossProfit = rev - cogs;
    const opex = Math.round(baseOpex * opexGrowth);
    const ebitda = grossProfit - opex;
    const capex = Math.round(rev * assumptions.capex_pct_revenue / 100);
    const fcf = ebitda - capex;
    const netCF = fcf - debtService;
    cumCashFlow += netCF;

    years.push({
      year: i,
      revenue: rev,
      cogs,
      gross_profit: grossProfit,
      gross_margin_pct: rev > 0 ? Math.round((grossProfit / rev) * 10000) / 100 : 0,
      operating_expenses: opex,
      ebitda,
      ebitda_margin_pct: rev > 0 ? Math.round((ebitda / rev) * 10000) / 100 : 0,
      capex,
      free_cash_flow: fcf,
      debt_service: debtService,
      net_cash_flow: netCF,
      cumulative_cash_flow: cumCashFlow,
    });
  }

  return years;
}
