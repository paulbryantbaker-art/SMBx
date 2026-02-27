/**
 * Buyer Sourcing Service — Connects sellers with potential buyers.
 * Matches seller deals against active buyer theses to estimate demand.
 */
import { sql } from '../db.js';

interface BuyerTypeAnalysis {
  type: string;          // individual, search_fund, pe_addon, strategic
  likelihood: number;    // 0-100
  description: string;
}

interface BuyerDemandResult {
  matchingThesesCount: number;
  anonymizedMatches: Array<{
    industry: string | null;
    geography: string | null;
    priceRange: string;
    score: number;
  }>;
  buyerTypes: BuyerTypeAnalysis[];
  demandSignal: 'high' | 'moderate' | 'low';
  summary: string;
}

/**
 * Match active buyer theses against a seller's deal to estimate demand.
 */
export async function matchBuyersForSeller(dealId: number): Promise<BuyerDemandResult> {
  const [deal] = await sql`SELECT * FROM deals WHERE id = ${dealId}`;
  if (!deal) return emptyResult('Deal not found');

  const theses = await sql`SELECT * FROM buyer_theses WHERE is_active = true`;
  const matches: BuyerDemandResult['anonymizedMatches'] = [];

  for (const thesis of theses) {
    // Skip theses owned by the seller
    if (thesis.user_id === deal.user_id) continue;

    const score = scoreThesisAgainstDeal(thesis, deal);
    if (score < 40) continue;

    matches.push({
      industry: thesis.industry || null,
      geography: thesis.geography || null,
      priceRange: formatPriceRange(thesis.price_min, thesis.price_max),
      score,
    });
  }

  // Sort by score descending
  matches.sort((a, b) => b.score - a.score);

  const buyerTypes = identifyBuyerTypes(deal);
  const demandSignal = matches.length >= 5 ? 'high' : matches.length >= 2 ? 'moderate' : 'low';

  const summary = matches.length > 0
    ? `${matches.length} active buyer${matches.length > 1 ? 's' : ''} on the platform match${matches.length === 1 ? 'es' : ''} your criteria. ${buyerTypes[0]?.description || ''}`
    : 'No active buyers currently match your exact criteria, but your business profile fits common buyer patterns.';

  return {
    matchingThesesCount: matches.length,
    anonymizedMatches: matches.slice(0, 10), // Cap at 10 for display
    buyerTypes,
    demandSignal,
    summary,
  };
}

/**
 * Classify which buyer types are likely for this deal size + industry.
 */
export function identifyBuyerTypes(deal: any): BuyerTypeAnalysis[] {
  const revenue = deal.revenue ? deal.revenue / 100 : 0;
  const sde = deal.sde ? deal.sde / 100 : 0;
  const ebitda = deal.ebitda ? deal.ebitda / 100 : 0;
  const askingPrice = deal.asking_price ? deal.asking_price / 100 : 0;
  const industry = (deal.industry || '').toLowerCase();

  const types: BuyerTypeAnalysis[] = [];

  // Individual buyer (most common for <$2M asking price)
  if (askingPrice < 2000000 || revenue < 3000000) {
    types.push({
      type: 'individual',
      likelihood: askingPrice < 1000000 ? 85 : 65,
      description: 'Individual buyers using SBA loans are the most common acquirers at this size.',
    });
  }

  // Search fund
  if (sde >= 200000 && sde <= 2000000) {
    types.push({
      type: 'search_fund',
      likelihood: sde >= 500000 ? 70 : 40,
      description: 'Search fund entrepreneurs target businesses with $500K-$2M SDE and strong management potential.',
    });
  }

  // PE add-on / platform
  const rollUpIndustries = ['hvac', 'plumbing', 'pest control', 'dental', 'veterinary', 'msp', 'landscaping', 'roofing'];
  const isRollUpTarget = rollUpIndustries.some(ri => industry.includes(ri));
  if (isRollUpTarget || ebitda >= 1000000) {
    types.push({
      type: 'pe_addon',
      likelihood: isRollUpTarget ? 75 : (ebitda >= 2000000 ? 80 : 50),
      description: isRollUpTarget
        ? `${deal.industry} is an active PE roll-up sector. Platform buyers and add-on acquirers are actively seeking targets.`
        : 'Private equity firms may consider this as a platform or add-on acquisition.',
    });
  }

  // Strategic acquirer
  if (revenue >= 2000000) {
    types.push({
      type: 'strategic',
      likelihood: revenue >= 5000000 ? 60 : 35,
      description: 'Strategic acquirers (competitors, adjacent businesses) may value synergies and customer overlap.',
    });
  }

  // Ensure at least one type
  if (types.length === 0) {
    types.push({
      type: 'individual',
      likelihood: 50,
      description: 'Individual buyers are the most likely acquirer profile for this business.',
    });
  }

  // Sort by likelihood
  types.sort((a, b) => b.likelihood - a.likelihood);
  return types;
}

/**
 * Estimate demand: count active theses matching, count recent listings in category.
 */
export async function estimateDemand(naicsCode: string, state: string): Promise<{
  activeTheses: number;
  recentListings: number;
  supplyDemandRatio: number;
}> {
  const [thesisCount] = await sql`
    SELECT COUNT(*)::int as count FROM buyer_theses
    WHERE is_active = true
      AND (${naicsCode} = ANY(naics_codes) OR naics_codes IS NULL OR cardinality(naics_codes) = 0)
      AND (${state} = ANY(state_codes) OR state_codes IS NULL OR cardinality(state_codes) = 0)
  `.catch(() => [{ count: 0 }]);

  const [listingCount] = await sql`
    SELECT COUNT(*)::int as count FROM listings
    WHERE status = 'active'
      AND (naics_code = ${naicsCode} OR naics_code IS NULL)
      AND (location_state = ${state} OR location_state IS NULL)
      AND created_at > NOW() - INTERVAL '90 days'
  `.catch(() => [{ count: 0 }]);

  const activeTheses = thesisCount?.count || 0;
  const recentListings = listingCount?.count || 0;
  const supplyDemandRatio = recentListings > 0 ? Math.round((activeTheses / recentListings) * 100) / 100 : activeTheses > 0 ? 999 : 0;

  return { activeTheses, recentListings, supplyDemandRatio };
}

/** Score a thesis against a deal (inverse of scoring a listing against thesis) */
function scoreThesisAgainstDeal(thesis: any, deal: any): number {
  let totalWeight = 0;
  let totalScore = 0;

  // Revenue match
  if (deal.revenue) {
    const weight = 25;
    totalWeight += weight;
    const inRange = (!thesis.revenue_min || deal.revenue >= thesis.revenue_min) &&
                   (!thesis.revenue_max || deal.revenue <= thesis.revenue_max);
    totalScore += (inRange ? 100 : 30) * weight;
  }

  // Price match
  if (deal.asking_price) {
    const weight = 25;
    totalWeight += weight;
    const inRange = (!thesis.price_min || deal.asking_price >= thesis.price_min) &&
                   (!thesis.price_max || deal.asking_price <= thesis.price_max);
    totalScore += (inRange ? 100 : 30) * weight;
  }

  // Industry match
  if (deal.industry && thesis.industry) {
    const weight = 30;
    totalWeight += weight;
    const match = deal.industry.toLowerCase().includes(thesis.industry.toLowerCase()) ||
                 thesis.industry.toLowerCase().includes(deal.industry.toLowerCase());
    totalScore += (match ? 100 : 20) * weight;
  }

  // Location match
  if (deal.location && thesis.geography) {
    const weight = 20;
    totalWeight += weight;
    const match = deal.location.toLowerCase().includes(thesis.geography.toLowerCase()) ||
                 thesis.geography.toLowerCase().includes(deal.location.toLowerCase());
    totalScore += (match ? 100 : 30) * weight;
  }

  return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 50;
}

function formatPriceRange(min: number | null, max: number | null): string {
  const fmt = (cents: number) => {
    const dollars = cents / 100;
    if (dollars >= 1000000) return `$${(dollars / 1000000).toFixed(1)}M`;
    if (dollars >= 1000) return `$${(dollars / 1000).toFixed(0)}K`;
    return `$${dollars.toLocaleString()}`;
  };
  if (min && max) return `${fmt(min)} - ${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  if (max) return `Up to ${fmt(max)}`;
  return 'Not specified';
}

function emptyResult(summary: string): BuyerDemandResult {
  return {
    matchingThesesCount: 0,
    anonymizedMatches: [],
    buyerTypes: [],
    demandSignal: 'low',
    summary,
  };
}
