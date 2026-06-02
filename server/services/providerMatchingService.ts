/**
 * Provider Matching Service — neutral service-provider DIRECTORY results.
 *
 * THE LINE (product law): smbX does not recommend, rank, endorse, contact, or
 * receive any fee from providers. This service only (a) detects which provider
 * TYPES are commonly needed at a deal's gate, and (b) returns a neutral,
 * UNRANKED directory list the user chooses from. No quality scoring, no
 * preference ordering, no referral-fee or pay-to-rank logic. See THE_LINE_POLICY.md.
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
  clientRating: number | null;   // provider's own market rating (e.g. Google) shown as raw data — NOT an smbX score
  feeStructure: string | null;
  servesYourState: boolean;      // factual match flags (neutral) — NOT a ranking
  servesYourDealSize: boolean;
}

/** Provider types commonly needed at each gate — drives "you may need X" prompts,
 *  never a recommendation of a specific provider. */
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
 * Search the provider directory. Results are returned UNRANKED — ordered
 * neutrally (by city, then name). smbX expresses no preference among providers.
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

  // Neutral order ONLY (geographic grouping + alphabetical). No rating / platform
  // track-record / pay-to-rank ordering — that would be ranking, which THE LINE forbids.
  const providers = await sql.unsafe(
    `SELECT * FROM service_providers ${whereClause}
     ORDER BY location_city ASC NULLS LAST, name ASC
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
    servesYourState: !!(params.state && p.location_state === params.state),
    servesYourDealSize: !!(
      params.dealSize && p.deal_size_min && p.deal_size_max &&
      params.dealSize >= p.deal_size_min && params.dealSize <= p.deal_size_max
    ),
  }));
}

/**
 * Given a deal's context, determine which provider TYPES are commonly needed now
 * and return a neutral, unranked directory list per type. This is "you may need
 * an attorney" + a directory to choose from — never a recommendation of a
 * specific provider.
 */
export async function getProviderDirectoryForDeal(dealId: number): Promise<{
  neededTypes: string[];
  byType: Record<string, ProviderResult[]>;
  context: string;
}> {
  const [deal] = await sql`SELECT * FROM deals WHERE id = ${dealId}`;
  if (!deal) return { neededTypes: [], byType: {}, context: 'Deal not found' };

  const gate = deal.current_gate || 'S0';
  const neededTypes = GATE_PROVIDER_NEEDS[gate] || [];
  const state = deal.location?.split(',').pop()?.trim() || null;
  const dealSize = deal.asking_price || deal.revenue || null;

  const byType: Record<string, ProviderResult[]> = {};
  for (const type of neededTypes) {
    byType[type] = await findProviders({
      type,
      state: state || undefined,
      dealSize: dealSize || undefined,
      limit: 5,
    });
  }

  const journeyName = deal.journey_type === 'sell' ? 'sell-side' : deal.journey_type === 'buy' ? 'buy-side' : deal.journey_type;
  const context = neededTypes.length > 0
    ? `At gate ${gate} of your ${journeyName} journey you may want: ${neededTypes.join(', ')}. These are unranked directory results — smbX does not choose or endorse a provider; you decide who to contact.`
    : `No specific provider types are commonly flagged for gate ${gate}.`;

  return { neededTypes, byType, context };
}

/**
 * Audit-log a user-initiated decision to contact a provider. Activity record
 * ONLY — no compensation, no referral fee, no ranking signal. smbX never charges
 * or is charged for an introduction (THE_LINE_POLICY.md: no provider referral-fee rail).
 */
export async function logProviderContact(
  dealId: number,
  providerId: number,
  userId: number,
  context: string,
): Promise<number> {
  const [row] = await sql`
    INSERT INTO service_referrals (deal_id, provider_id, user_id, referral_context)
    VALUES (${dealId}, ${providerId}, ${userId}, ${context})
    RETURNING id
  `;
  return row.id;
}
