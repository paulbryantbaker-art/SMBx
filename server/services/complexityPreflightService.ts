/**
 * Complexity Preflight Service — "Wagyu Rule"
 *
 * Detects deal complexity factors that warrant a surcharge on deliverable pricing.
 * The surcharge reflects the additional analytical depth required for complex deals:
 * multi-entity structures, cross-border elements, regulated industries,
 * real estate components, franchise systems, etc.
 *
 * Formula: Final Price = Base Price × League Multiplier × (1 + Wagyu Surcharge)
 * Surcharge is 0% for simple deals, up to 50% for highly complex ones.
 */

export interface ComplexityFactor {
  id: string;
  label: string;
  surcharge: number; // decimal (0.10 = 10%)
  detected: boolean;
  reason?: string;
}

export interface ComplexityResult {
  totalSurcharge: number; // capped decimal (e.g. 0.35 = 35%)
  factors: ComplexityFactor[];
  isWagyu: boolean; // true if any surcharge applies
  label: string; // "Standard" | "Complex" | "Wagyu"
}

interface DealContext {
  industry?: string | null;
  naics_code?: string | null;
  revenue?: number | null; // cents
  entity_count?: number | null;
  has_real_estate?: boolean | null;
  is_franchise?: boolean | null;
  is_cross_border?: boolean | null;
  employee_count?: number | null;
  years_in_business?: number | null;
  has_inventory?: boolean | null;
  has_ip?: boolean | null;
  exit_type?: string | null;
  financials?: Record<string, any> | null;
}

// Industries requiring specialized regulatory analysis
const REGULATED_INDUSTRIES = new Set([
  'healthcare', 'medical', 'dental', 'pharmacy', 'nursing',
  'financial services', 'insurance', 'banking',
  'cannabis', 'marijuana',
  'alcohol', 'liquor', 'brewery', 'distillery',
  'trucking', 'transportation', 'freight',
  'childcare', 'daycare',
  'environmental', 'waste management',
  'defense', 'government contracting',
  'telecom', 'telecommunications',
]);

// Industries with known franchise complexity
const FRANCHISE_INDUSTRIES = new Set([
  'restaurant', 'fast food', 'food service',
  'fitness', 'gym',
  'hotel', 'hospitality',
  'automotive repair', 'auto',
  'cleaning', 'janitorial',
  'home services',
]);

/**
 * Analyze a deal for complexity factors and calculate the Wagyu surcharge.
 * Returns 0 surcharge for straightforward deals.
 */
export function assessComplexity(deal: DealContext): ComplexityResult {
  const factors: ComplexityFactor[] = [];
  const industry = (deal.industry || '').toLowerCase();

  // 1. Multi-entity structure (+15%)
  factors.push({
    id: 'multi_entity',
    label: 'Multi-entity structure',
    surcharge: 0.15,
    detected: (deal.entity_count || 1) > 1,
    reason: deal.entity_count ? `${deal.entity_count} entities detected` : undefined,
  });

  // 2. Real estate component (+10%)
  factors.push({
    id: 'real_estate',
    label: 'Real estate included in deal',
    surcharge: 0.10,
    detected: !!deal.has_real_estate,
    reason: 'Requires separate real estate valuation',
  });

  // 3. Franchise system (+10%)
  const isFranchise = deal.is_franchise || FRANCHISE_INDUSTRIES.has(industry);
  factors.push({
    id: 'franchise',
    label: 'Franchise system',
    surcharge: 0.10,
    detected: !!isFranchise,
    reason: 'FDD review, transfer approval, royalty analysis required',
  });

  // 4. Regulated industry (+10%)
  const isRegulated = [...REGULATED_INDUSTRIES].some(r => industry.includes(r));
  factors.push({
    id: 'regulated',
    label: 'Regulated industry',
    surcharge: 0.10,
    detected: isRegulated,
    reason: `${deal.industry} requires regulatory compliance analysis`,
  });

  // 5. Cross-border / international (+15%)
  factors.push({
    id: 'cross_border',
    label: 'Cross-border transaction',
    surcharge: 0.15,
    detected: !!deal.is_cross_border,
    reason: 'Multi-jurisdiction tax and regulatory analysis',
  });

  // 6. Large workforce / union considerations (+5%)
  factors.push({
    id: 'large_workforce',
    label: 'Large workforce (50+ employees)',
    surcharge: 0.05,
    detected: (deal.employee_count || 0) >= 50,
    reason: deal.employee_count ? `${deal.employee_count} employees — HR integration complexity` : undefined,
  });

  // 7. Intellectual property (+5%)
  factors.push({
    id: 'ip_assets',
    label: 'Intellectual property assets',
    surcharge: 0.05,
    detected: !!deal.has_ip,
    reason: 'Patent, trademark, or proprietary tech valuation required',
  });

  // 8. Complex exit type: partial sale, management buyout, ESOP (+10%)
  const complexExits = ['partial_sale', 'management_buyout', 'mbo', 'esop', 'recapitalization'];
  const isComplexExit = deal.exit_type ? complexExits.includes(deal.exit_type.toLowerCase()) : false;
  factors.push({
    id: 'complex_exit',
    label: 'Complex exit structure',
    surcharge: 0.10,
    detected: isComplexExit,
    reason: deal.exit_type ? `${deal.exit_type} requires specialized structuring` : undefined,
  });

  // Calculate total surcharge (capped at 50%)
  const detectedFactors = factors.filter(f => f.detected);
  const rawSurcharge = detectedFactors.reduce((sum, f) => sum + f.surcharge, 0);
  const totalSurcharge = Math.min(rawSurcharge, 0.50);

  // Classify
  let label = 'Standard';
  if (totalSurcharge > 0.20) label = 'Wagyu';
  else if (totalSurcharge > 0) label = 'Complex';

  return {
    totalSurcharge,
    factors,
    isWagyu: totalSurcharge > 0,
    label,
  };
}

/**
 * Apply Wagyu surcharge to a base price that already has the league multiplier.
 * Returns the final price in cents.
 */
export function applyWagyuSurcharge(priceAfterMultiplier: number, deal: DealContext): {
  finalPrice: number;
  complexity: ComplexityResult;
} {
  const complexity = assessComplexity(deal);
  const finalPrice = Math.round(priceAfterMultiplier * (1 + complexity.totalSurcharge));
  return { finalPrice, complexity };
}
