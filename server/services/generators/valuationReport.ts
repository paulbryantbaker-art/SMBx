/**
 * Business Valuation Report Generator
 *
 * Deterministic calculations + AI narrative.
 * Uses league-specific methodology (SDE for L1/L2, EBITDA for L3+).
 * All financial values in CENTS.
 */
import { callClaude } from '../aiService.js';
import { getLeagueMultipleRange } from '../leagueClassifier.js';

export interface ValuationInput {
  business_name?: string;
  industry?: string;
  location?: string;
  revenue: number;           // cents
  sde?: number;              // cents
  ebitda?: number;           // cents
  league: string;
  owner_salary?: number;     // cents
  growth_rate?: number;      // percentage
  recurring_revenue_pct?: number;
  customer_concentration?: number; // top customer % of revenue
  owner_dependency?: number; // 1-10
  asking_price?: number;     // cents
  seven_factor_scores?: Record<string, number>;
  financials?: Record<string, any>;
}

export interface ValuationReport {
  type: 'valuation_report';
  summary: {
    business_name: string;
    industry: string;
    league: string;
    metric: string;
    adjusted_earnings: number; // cents
    valuation_low: number;     // cents
    valuation_mid: number;     // cents
    valuation_high: number;    // cents
    base_multiple: number;
    adjusted_multiple_low: number;
    adjusted_multiple_high: number;
  };
  methodology: {
    metric_used: string;
    base_range: { min: number; max: number };
    adjustments: Array<{
      factor: string;
      impact: number; // multiple adjustment
      direction: 'premium' | 'discount';
      reason: string;
    }>;
  };
  price_gap_analysis?: {
    asking_price: number;
    gap_percentage: number;
    assessment: string;
  };
  probability_of_sale: {
    score: number; // 0-100
    factors: Record<string, number>;
    recommendation: string;
  };
  narrative: string; // AI-generated narrative
  generated_at: string;
}

export async function generateValuationReport(input: ValuationInput): Promise<ValuationReport> {
  const range = getLeagueMultipleRange(input.league);
  const earnings = input.ebitda || input.sde || 0;
  const earningsDollars = earnings / 100;
  const metric = range.metric;

  // ─── Deterministic: Calculate multiples ──────────────────
  const adjustments: ValuationReport['methodology']['adjustments'] = [];

  // Growth premium
  if (input.growth_rate && input.growth_rate > 10) {
    const premium = Math.min((input.growth_rate - 10) * 0.05, 0.75);
    adjustments.push({
      factor: 'Revenue Growth',
      impact: premium,
      direction: 'premium',
      reason: `${input.growth_rate}% growth rate exceeds 10% threshold`,
    });
  } else if (input.growth_rate && input.growth_rate < 0) {
    adjustments.push({
      factor: 'Revenue Decline',
      impact: -0.5,
      direction: 'discount',
      reason: `${input.growth_rate}% decline puts downward pressure on multiple`,
    });
  }

  // Recurring revenue premium
  if (input.recurring_revenue_pct && input.recurring_revenue_pct > 50) {
    const premium = Math.min((input.recurring_revenue_pct - 50) * 0.02, 1.0);
    adjustments.push({
      factor: 'Recurring Revenue',
      impact: premium,
      direction: 'premium',
      reason: `${input.recurring_revenue_pct}% recurring revenue adds predictability`,
    });
  }

  // Customer concentration discount
  if (input.customer_concentration && input.customer_concentration > 25) {
    const discount = -Math.min((input.customer_concentration - 25) * 0.03, 0.75);
    adjustments.push({
      factor: 'Customer Concentration',
      impact: discount,
      direction: 'discount',
      reason: `Top customer at ${input.customer_concentration}% of revenue creates risk`,
    });
  }

  // Owner dependency discount
  if (input.owner_dependency && input.owner_dependency >= 7) {
    const discount = -Math.min((input.owner_dependency - 5) * 0.2, 1.0);
    adjustments.push({
      factor: 'Owner Dependency',
      impact: discount,
      direction: 'discount',
      reason: `High owner dependency (${input.owner_dependency}/10) reduces transferability`,
    });
  }

  // Seven-factor adjustments
  if (input.seven_factor_scores) {
    const composite = Object.values(input.seven_factor_scores).reduce((a, b) => a + b, 0);
    const maxComposite = Object.keys(input.seven_factor_scores).length * 10;
    const pct = composite / maxComposite;
    if (pct > 0.7) {
      adjustments.push({
        factor: 'Seven-Factor Quality Score',
        impact: 0.25,
        direction: 'premium',
        reason: `Above-average quality score (${composite}/${maxComposite})`,
      });
    } else if (pct < 0.4) {
      adjustments.push({
        factor: 'Seven-Factor Quality Score',
        impact: -0.25,
        direction: 'discount',
        reason: `Below-average quality score (${composite}/${maxComposite})`,
      });
    }
  }

  // Calculate adjusted multiples
  const totalAdj = adjustments.reduce((sum, a) => sum + a.impact, 0);
  const adjLow = Math.max(range.min + totalAdj - 0.5, range.min * 0.7);
  const adjHigh = (range.max || range.min * 1.5) + totalAdj + 0.5;
  const adjMid = (adjLow + adjHigh) / 2;

  // Valuations
  const valLow = Math.round(earnings * adjLow);
  const valMid = Math.round(earnings * adjMid);
  const valHigh = Math.round(earnings * adjHigh);

  // Price gap analysis
  let priceGap: ValuationReport['price_gap_analysis'] | undefined;
  if (input.asking_price) {
    const gapPct = Math.round(((input.asking_price - valMid) / valMid) * 100);
    let assessment: string;
    if (Math.abs(gapPct) < 10) {
      assessment = 'Your target price is well-aligned with market reality.';
    } else if (gapPct > 0 && gapPct <= 25) {
      assessment = 'Your target is above our mid-range estimate — aggressive but not unreasonable.';
    } else if (gapPct > 25) {
      assessment = 'Significant gap between your target and market data. Consider adjusting expectations or improving the business first.';
    } else {
      assessment = 'Your target is below market — you may be leaving value on the table.';
    }
    priceGap = {
      asking_price: input.asking_price,
      gap_percentage: gapPct,
      assessment,
    };
  }

  // Probability of sale
  const probFactors: Record<string, number> = {
    financial_health: Math.min(100, earningsDollars > 0 ? 70 : 20),
    market_demand: 60, // default mid
    price_alignment: priceGap ? Math.max(0, 100 - Math.abs(priceGap.gap_percentage) * 2) : 70,
    business_quality: input.seven_factor_scores
      ? Math.round((Object.values(input.seven_factor_scores).reduce((a, b) => a + b, 0) / (Object.keys(input.seven_factor_scores).length * 10)) * 100)
      : 60,
  };
  const probScore = Math.round(
    probFactors.financial_health * 0.30 +
    probFactors.market_demand * 0.25 +
    probFactors.price_alignment * 0.25 +
    probFactors.business_quality * 0.20
  );

  let recommendation: string;
  if (probScore >= 70) recommendation = 'GO — Strong position for a successful sale.';
  else if (probScore >= 50) recommendation = 'GO WITH CAVEATS — Proceed but address identified weaknesses.';
  else recommendation = 'CONSIDER WAITING — Improve the business before going to market.';

  // ─── AI: Generate narrative ──────────────────────────────
  const narrativePrompt = `Write a 3-paragraph valuation narrative for this business:
Business: ${input.business_name || input.industry} in ${input.location || 'undisclosed location'}
${metric}: $${earningsDollars.toLocaleString()}
Revenue: $${(input.revenue / 100).toLocaleString()}
League: ${input.league}
Valuation Range: $${(valLow / 100).toLocaleString()} to $${(valHigh / 100).toLocaleString()} (${adjLow.toFixed(1)}x to ${adjHigh.toFixed(1)}x)
Key Adjustments: ${adjustments.map(a => `${a.factor}: ${a.impact > 0 ? '+' : ''}${a.impact.toFixed(2)}x (${a.reason})`).join('; ')}
Probability of Sale: ${probScore}/100

Write as Yulia, the M&A advisor. Be direct, specific, and reference the actual numbers. No fluff.`;

  const narrative = await callClaude(
    'You are Yulia, an M&A advisor writing a valuation summary. Be concise, data-driven, and direct.',
    [{ role: 'user', content: narrativePrompt }],
  );

  return {
    type: 'valuation_report',
    summary: {
      business_name: input.business_name || 'Business',
      industry: input.industry || 'Not specified',
      league: input.league,
      metric,
      adjusted_earnings: earnings,
      valuation_low: valLow,
      valuation_mid: valMid,
      valuation_high: valHigh,
      base_multiple: (range.min + (range.max || range.min)) / 2,
      adjusted_multiple_low: Math.round(adjLow * 100) / 100,
      adjusted_multiple_high: Math.round(adjHigh * 100) / 100,
    },
    methodology: {
      metric_used: metric,
      base_range: { min: range.min, max: range.max || range.min * 1.5 },
      adjustments,
    },
    price_gap_analysis: priceGap,
    probability_of_sale: {
      score: probScore,
      factors: probFactors,
      recommendation,
    },
    narrative,
    generated_at: new Date().toISOString(),
  };
}
