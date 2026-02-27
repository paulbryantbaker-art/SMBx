/**
 * Franchise Matching Service — Matches buyers with franchise opportunities.
 * Scores on budget fit, model preference, health score, and geography.
 */
import { sql } from '../db.js';

interface FranchiseSearchParams {
  budget?: number;           // total investment budget in cents
  liquidCapital?: number;    // liquid capital available in cents
  modelType?: string;        // owner_operator, semi_absentee, absentee, executive
  category?: string;         // QSR, fitness, home_services, etc.
  state?: string;            // for registered states filter
  homeBased?: boolean;
  limit?: number;
}

interface FranchiseMatch {
  id: number;
  tradeName: string;
  legalName: string;
  category: string | null;
  modelType: string | null;
  investmentRange: string;
  franchiseFee: string | null;
  royaltyRate: number | null;
  avgRevenue: string | null;
  avgCashFlow: string | null;
  unitsOpen: number | null;
  healthScore: number | null;
  matchScore: number;
  matchBreakdown: Record<string, number>;
}

/**
 * Search and rank franchise brands matching buyer criteria.
 */
export async function matchFranchises(params: FranchiseSearchParams): Promise<FranchiseMatch[]> {
  const { budget, liquidCapital, modelType, category, state, homeBased, limit = 10 } = params;

  const conditions: string[] = [];
  const values: any[] = [];
  let paramIdx = 1;

  if (budget) {
    conditions.push(`(total_investment_min_cents IS NULL OR total_investment_min_cents <= $${paramIdx})`);
    values.push(budget);
    paramIdx++;
  }
  if (liquidCapital) {
    conditions.push(`(liquid_capital_required_cents IS NULL OR liquid_capital_required_cents <= $${paramIdx})`);
    values.push(liquidCapital);
    paramIdx++;
  }
  if (modelType) {
    conditions.push(`(model_type = $${paramIdx} OR model_type IS NULL)`);
    values.push(modelType);
    paramIdx++;
  }
  if (category) {
    conditions.push(`(category = $${paramIdx} OR LOWER(industry) LIKE '%' || LOWER($${paramIdx}) || '%')`);
    values.push(category);
    paramIdx++;
  }
  if (state) {
    conditions.push(`($${paramIdx} = ANY(states_registered) OR cardinality(states_registered) = 0)`);
    values.push(state);
    paramIdx++;
  }
  if (homeBased !== undefined) {
    conditions.push(`home_based = $${paramIdx}`);
    values.push(homeBased);
    paramIdx++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const brands = await sql.unsafe(
    `SELECT * FROM franchise_brands ${whereClause}
     ORDER BY franchise_health_score DESC NULLS LAST, units_open DESC NULLS LAST
     LIMIT $${paramIdx}`,
    [...values, limit],
  );

  return brands.map((b: any) => {
    const { total: matchScore, breakdown: matchBreakdown } = scoreFranchiseMatch(params, b);
    return {
      id: b.id,
      tradeName: b.trade_name || b.legal_name,
      legalName: b.legal_name,
      category: b.category,
      modelType: b.model_type,
      investmentRange: formatRange(b.total_investment_min_cents, b.total_investment_max_cents),
      franchiseFee: b.franchise_fee_cents ? formatCents(b.franchise_fee_cents) : null,
      royaltyRate: b.royalty_rate ? parseFloat(b.royalty_rate) : null,
      avgRevenue: b.avg_unit_revenue_cents ? formatCents(b.avg_unit_revenue_cents) : null,
      avgCashFlow: b.avg_owner_cash_flow_cents ? formatCents(b.avg_owner_cash_flow_cents) : null,
      unitsOpen: b.units_open,
      healthScore: b.franchise_health_score,
      matchScore,
      matchBreakdown,
    };
  }).sort((a: FranchiseMatch, b: FranchiseMatch) => b.matchScore - a.matchScore);
}

/**
 * Score a franchise match: budget fit 30%, model fit 25%, health 25%, geography 20%.
 */
function scoreFranchiseMatch(
  buyerProfile: FranchiseSearchParams,
  brand: any,
): { total: number; breakdown: Record<string, number> } {
  const breakdown: Record<string, number> = {};
  let totalWeight = 0;
  let totalScore = 0;

  // Budget fit (weight: 30)
  if (buyerProfile.budget && brand.total_investment_min_cents) {
    const weight = 30;
    totalWeight += weight;
    const maxInvest = brand.total_investment_max_cents || brand.total_investment_min_cents * 2;
    if (buyerProfile.budget >= brand.total_investment_min_cents && buyerProfile.budget <= maxInvest) {
      breakdown.budget = 100;
    } else if (buyerProfile.budget >= brand.total_investment_min_cents) {
      breakdown.budget = 80; // over-budget is less bad than under
    } else {
      const ratio = buyerProfile.budget / brand.total_investment_min_cents;
      breakdown.budget = Math.max(0, Math.round(ratio * 100));
    }
    totalScore += breakdown.budget * weight;
  }

  // Model fit (weight: 25)
  if (buyerProfile.modelType && brand.model_type) {
    const weight = 25;
    totalWeight += weight;
    breakdown.model = buyerProfile.modelType === brand.model_type ? 100 : 30;
    totalScore += breakdown.model * weight;
  }

  // Health score (weight: 25)
  if (brand.franchise_health_score) {
    const weight = 25;
    totalWeight += weight;
    breakdown.health = brand.franchise_health_score;
    totalScore += breakdown.health * weight;
  }

  // Geography (weight: 20)
  if (buyerProfile.state && brand.states_registered?.length > 0) {
    const weight = 20;
    totalWeight += weight;
    breakdown.geography = brand.states_registered.includes(buyerProfile.state) ? 100 : 20;
    totalScore += breakdown.geography * weight;
  }

  const total = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 50;
  return { total, breakdown };
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

function formatRange(minCents: number | null, maxCents: number | null): string {
  if (!minCents && !maxCents) return 'Not disclosed';
  if (minCents && maxCents) return `${formatCents(minCents)} - ${formatCents(maxCents)}`;
  if (minCents) return `From ${formatCents(minCents)}`;
  return `Up to ${formatCents(maxCents!)}`;
}
