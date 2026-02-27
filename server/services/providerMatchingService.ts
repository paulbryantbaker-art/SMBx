/**
 * Provider Matching Service — Matches service providers to deals.
 * Contextual recommendations based on deal journey, gate, geography, and size.
 */
import { sql } from '../db.js';

interface ProviderSearchParams {
  type?: string;
  state?: string;
  dealSize?: number;       // in cents
  naicsCode?: string;
  financingType?: string;  // SBA_7a, SBA_504, conventional, seller
  limit?: number;
}

interface ProviderResult {
  id: number;
  type: string;
  name: string;
  firmName: string | null;
  locationState: string | null;
  locationCity: string | null;
  credentials: string[];
  practiceAreas: string[];
  clientRating: number | null;
  feeStructure: string | null;
  relevanceScore: number;
}

/** Provider types needed at each gate */
const GATE_PROVIDER_NEEDS: Record<string, string[]> = {
  S2: ['appraiser', 'cpa'],               // Valuation stage
  S3: ['attorney', 'cpa'],                 // Packaging for sale
  S4: ['attorney', 're_agent'],            // Market matching
  S5: ['attorney', 'cpa', 'insurance'],    // Closing
  B2: ['appraiser', 'cpa'],               // Buyer valuation
  B3: ['attorney', 'cpa', 'consultant'],   // Due diligence
  B4: ['attorney', 'insurance'],           // Structuring
  B5: ['attorney', 'cpa', 'insurance'],    // Closing
  R1: ['cpa'],                             // Financial package
  R3: ['attorney', 'consultant'],          // Outreach
  R5: ['attorney'],                        // Closing
  PMI1: ['cpa', 'consultant'],             // Stabilization
};

/**
 * Search for service providers matching criteria.
 */
export async function findProviders(params: ProviderSearchParams): Promise<ProviderResult[]> {
  const { type, state, dealSize, financingType, limit = 10 } = params;

  const conditions: string[] = [];
  const values: any[] = [];
  let paramIdx = 1;

  if (type) {
    conditions.push(`type = $${paramIdx++}`);
    values.push(type);
  }
  if (state) {
    conditions.push(`location_state = $${paramIdx++}`);
    values.push(state);
  }
  if (dealSize) {
    conditions.push(`(deal_size_min IS NULL OR deal_size_min <= $${paramIdx})`);
    values.push(dealSize);
    paramIdx++;
    conditions.push(`(deal_size_max IS NULL OR deal_size_max >= $${paramIdx})`);
    values.push(dealSize);
    paramIdx++;
  }
  if (financingType) {
    conditions.push(`$${paramIdx++} = ANY(financing_experience)`);
    values.push(financingType);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const providers = await sql.unsafe(
    `SELECT * FROM service_providers ${whereClause}
     ORDER BY client_rating DESC NULLS LAST, smbx_deals_closed DESC, created_at DESC
     LIMIT $${paramIdx}`,
    [...values, limit],
  );

  return providers.map((p: any) => ({
    id: p.id,
    type: p.type,
    name: p.name,
    firmName: p.firm_name,
    locationState: p.location_state,
    locationCity: p.location_city,
    credentials: p.credentials || [],
    practiceAreas: p.practice_areas || [],
    clientRating: p.client_rating ? parseFloat(p.client_rating) : null,
    feeStructure: p.fee_structure,
    relevanceScore: computeRelevanceScore(p, params),
  }));
}

/**
 * Given a deal's context, determine which provider types are needed NOW
 * and return top recommendations per type.
 */
export async function generateProviderRecommendation(dealId: number): Promise<{
  neededTypes: string[];
  recommendations: Record<string, ProviderResult[]>;
  context: string;
}> {
  const [deal] = await sql`SELECT * FROM deals WHERE id = ${dealId}`;
  if (!deal) return { neededTypes: [], recommendations: {}, context: 'Deal not found' };

  const gate = deal.current_gate || 'S0';
  const neededTypes = GATE_PROVIDER_NEEDS[gate] || [];
  const state = deal.location?.split(',').pop()?.trim() || null;
  const dealSize = deal.asking_price || deal.revenue || null;

  const recommendations: Record<string, ProviderResult[]> = {};

  for (const type of neededTypes) {
    recommendations[type] = await findProviders({
      type,
      state: state || undefined,
      dealSize: dealSize || undefined,
      limit: 3,
    });
  }

  const journeyName = deal.journey_type === 'sell' ? 'sell-side' : deal.journey_type === 'buy' ? 'buy-side' : deal.journey_type;
  const context = neededTypes.length > 0
    ? `At gate ${gate} of your ${journeyName} journey, you'll typically need: ${neededTypes.join(', ')}.`
    : `No specific provider recommendations for gate ${gate} at this time.`;

  return { neededTypes, recommendations, context };
}

/**
 * Track a referral sent to a provider.
 */
export async function trackReferral(
  dealId: number,
  providerId: number,
  userId: number,
  context: string,
): Promise<number> {
  const [referral] = await sql`
    INSERT INTO service_referrals (deal_id, provider_id, user_id, referral_context)
    VALUES (${dealId}, ${providerId}, ${userId}, ${context})
    RETURNING id
  `;

  // Increment provider referral count
  await sql`UPDATE service_providers SET smbx_referrals_sent = smbx_referrals_sent + 1 WHERE id = ${providerId}`;

  return referral.id;
}

/** Compute a relevance score for ranking */
function computeRelevanceScore(provider: any, params: ProviderSearchParams): number {
  let score = 50; // base

  // Location match
  if (params.state && provider.location_state === params.state) score += 20;

  // Deal size fit
  if (params.dealSize && provider.deal_size_min && provider.deal_size_max) {
    if (params.dealSize >= provider.deal_size_min && params.dealSize <= provider.deal_size_max) {
      score += 15;
    }
  }

  // Client rating bonus
  if (provider.client_rating) score += Math.min(15, Math.round(provider.client_rating * 3));

  // Platform track record
  if (provider.smbx_deals_closed > 0) score += Math.min(10, provider.smbx_deals_closed * 2);

  return Math.min(100, score);
}
