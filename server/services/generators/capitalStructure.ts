/**
 * Capital Structure Analysis Generator
 *
 * Uses the capital stack engine for deterministic modeling,
 * adds sensitivity analysis and scenario comparison.
 * All financial values in CENTS.
 */
import { buildCapitalStack, formatCapitalStack, type CapitalStackResult } from '../capitalStackEngine.js';

export interface CapStructInput {
  deal_size: number;          // cents
  ebitda?: number;            // cents
  sde?: number;               // cents
  buyer_equity?: number;      // cents
  buyer_credit_score?: number;
  is_us_citizen?: boolean;
  has_real_estate?: boolean;
  seller_financing?: boolean;
  seller_standby?: boolean;
  industry?: string;
  league?: string;
  business_name?: string;
}

export interface CapStructReport {
  type: 'capital_structure_analysis';
  primary_structure: CapitalStackResult;
  scenarios: Array<{
    name: string;
    description: string;
    structure: CapitalStackResult;
  }>;
  sensitivity: {
    rate_change_impact: Array<{
      rate_change_bps: number;
      new_monthly_payment: number;
      new_dscr: number | null;
    }>;
    price_sensitivity: Array<{
      price_change_pct: number;
      new_deal_size: number;
      new_dscr: number | null;
    }>;
  };
  five_year_projection: {
    years: number[];
    annual_debt_service: number[];
    cumulative_equity_paid: number[];
    estimated_equity_value: number[];
  };
  recommendations: string[];
  generated_at: string;
}

export function generateCapitalStructureAnalysis(input: CapStructInput): CapStructReport {
  const earnings = input.ebitda || input.sde || 0;

  // ─── Primary structure ───────────────────────────────────
  const primary = buildCapitalStack({
    dealSize: input.deal_size,
    ebitda: input.ebitda,
    sde: input.sde,
    buyerEquity: input.buyer_equity,
    buyerCreditScore: input.buyer_credit_score,
    isUSCitizen: input.is_us_citizen,
    hasRealEstate: input.has_real_estate,
    sellerFinancingAvailable: input.seller_financing,
    sellerStandbyWilling: input.seller_standby,
    industry: input.industry,
    league: input.league,
  });

  // ─── Alternative scenarios ───────────────────────────────
  const scenarios: CapStructReport['scenarios'] = [];

  // Scenario: 10% lower price
  const lowerPrice = Math.round(input.deal_size * 0.9);
  scenarios.push({
    name: '10% Lower Purchase Price',
    description: `What if you negotiate the price down to $${(lowerPrice / 100).toLocaleString()}?`,
    structure: buildCapitalStack({
      ...input, dealSize: lowerPrice,
      sellerFinancingAvailable: input.seller_financing,
      sellerStandbyWilling: input.seller_standby,
      isUSCitizen: input.is_us_citizen,
      hasRealEstate: input.has_real_estate,
      buyerEquity: input.buyer_equity,
      buyerCreditScore: input.buyer_credit_score,
    }),
  });

  // Scenario: More equity (20% instead of default)
  const moreEquity = input.buyer_equity ? Math.round(input.buyer_equity * 1.5) : Math.round(input.deal_size * 0.20);
  scenarios.push({
    name: 'Increased Equity Injection',
    description: `What if you inject $${(moreEquity / 100).toLocaleString()} in equity?`,
    structure: buildCapitalStack({
      ...input,
      buyerEquity: moreEquity,
      sellerFinancingAvailable: input.seller_financing,
      sellerStandbyWilling: input.seller_standby,
      isUSCitizen: input.is_us_citizen,
      hasRealEstate: input.has_real_estate,
      buyerCreditScore: input.buyer_credit_score,
    }),
  });

  // Scenario: With seller financing on standby
  if (!input.seller_standby) {
    scenarios.push({
      name: 'With Seller Note (Full Standby)',
      description: 'What if the seller agrees to a 10% note on full standby?',
      structure: buildCapitalStack({
        ...input,
        sellerFinancingAvailable: true,
        sellerStandbyWilling: true,
        isUSCitizen: input.is_us_citizen,
        hasRealEstate: input.has_real_estate,
        buyerEquity: input.buyer_equity,
        buyerCreditScore: input.buyer_credit_score,
      }),
    });
  }

  // ─── Sensitivity analysis ────────────────────────────────
  const rateChanges = [-100, -50, 0, 50, 100, 200]; // basis points
  const rateImpact = rateChanges.map(bps => {
    const adjustedPayment = adjustPaymentForRate(primary, bps);
    return {
      rate_change_bps: bps,
      new_monthly_payment: adjustedPayment,
      new_dscr: earnings > 0 ? Math.round((earnings / (adjustedPayment * 12)) * 100) / 100 : null,
    };
  });

  const priceChanges = [-20, -10, -5, 0, 5, 10, 20]; // percent
  const priceSensitivity = priceChanges.map(pct => {
    const newSize = Math.round(input.deal_size * (1 + pct / 100));
    const struct = buildCapitalStack({
      ...input, dealSize: newSize,
      sellerFinancingAvailable: input.seller_financing,
      sellerStandbyWilling: input.seller_standby,
      isUSCitizen: input.is_us_citizen,
      hasRealEstate: input.has_real_estate,
      buyerEquity: input.buyer_equity,
      buyerCreditScore: input.buyer_credit_score,
    });
    return {
      price_change_pct: pct,
      new_deal_size: newSize,
      new_dscr: struct.dscr,
    };
  });

  // ─── 5-year projection ──────────────────────────────────
  const years = [1, 2, 3, 4, 5];
  const annualDS = years.map(() => primary.totalDebtService);
  const cumulativeEquity = years.map((_, i) => primary.totalDebtService * (i + 1));

  // Estimate equity value growth (assume 3% annual appreciation)
  const equityInvested = primary.layers.find(l => l.name.includes('Equity'))?.amount || 0;
  const estimatedValues = years.map((_, i) => {
    const appreciation = Math.pow(1.03, i + 1);
    return Math.round(equityInvested * appreciation + cumulativeEquity[i] * 0.3);
  });

  // ─── Recommendations ────────────────────────────────────
  const recs: string[] = [];

  if (primary.dscr !== null && primary.dscr < 1.25) {
    recs.push('DSCR below threshold — negotiate purchase price down or increase equity injection');
  }
  if (primary.dscr !== null && primary.dscr >= 1.5) {
    recs.push('Strong DSCR — well-positioned for favorable lending terms');
  }
  if (!input.seller_standby && input.seller_financing) {
    recs.push('Negotiate full standby on seller note — counts as equity injection under 2025 SBA rules');
  }
  if (primary.sbaEligible) {
    recs.push('SBA 7(a) eligible — this is typically the lowest-cost financing for deals under $5M');
  }
  if (primary.tier >= 4) {
    recs.push('At this deal size, engage an investment bank for financing syndication');
  }

  return {
    type: 'capital_structure_analysis',
    primary_structure: primary,
    scenarios,
    sensitivity: {
      rate_change_impact: rateImpact,
      price_sensitivity: priceSensitivity,
    },
    five_year_projection: {
      years,
      annual_debt_service: annualDS,
      cumulative_equity_paid: cumulativeEquity,
      estimated_equity_value: estimatedValues,
    },
    recommendations: recs,
    generated_at: new Date().toISOString(),
  };
}

function adjustPaymentForRate(primary: CapitalStackResult, bpsChange: number): number {
  // Approximate: for every 100bps, monthly payment changes ~5-8%
  const pctChange = (bpsChange / 100) * 0.065; // ~6.5% per 100bps
  return Math.round(primary.monthlyPayment * (1 + pctChange));
}
