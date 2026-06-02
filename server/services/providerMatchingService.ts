/**
 * Provider Matching Service — neutral service-provider DIRECTORY results.
 *
 * THE LINE (product law): smbX does not recommend, rank, endorse, contact, or
 * receive any fee from providers. This service only (a) detects which provider
 * TYPES are commonly needed at a deal's gate, and (b) returns a neutral,
 * UNRANKED directory list the user chooses from. No quality scoring, no
 * preference ordering, no referral-fee or pay-to-rank logic. See THE_LINE_POLICY.md.
 *
 * Directory sources: the local `service_providers` table (self-listed / claimed)
 * and, when local coverage is sparse for a location, raw Google Places results
 * (third-party public data the user evaluates). Places results carry NO rating
 * and are NOT ranked — they are merged in neutral order only, never preferred.
 */
import { sql } from '../db.js';
import { searchPlacesIdOnly, getPlaceDetailsTier1, type PlaceEssentials } from './googlePlacesClient.js';

interface ProviderSearchParams {
  type?: string;
  state?: string;
  city?: string;           // optional city to scope a Google Places top-up
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
  source: 'smbx' | 'google_places'; // where the listing came from (raw provenance, not a quality signal)
  placeId: string | null;        // Google Place ID for google_places results; null for local
  phone: string | null;          // contact phone when available (Places national phone / local listing)
  inviteable: boolean;           // true ONLY when an email exists to send an in-app invite to.
                                  // Places Tier-1 returns NO email → google_places results are always false.
}

/** Provider type → a natural search phrase a person would actually type to find
 *  this kind of professional. Used to build Google Places text queries. */
const PROVIDER_TYPE_QUERY: Record<string, string> = {
  attorney: 'business attorney',
  cpa: 'CPA accountant',
  appraiser: 'business appraiser',
  re_agent: 'commercial real estate agent',
  insurance: 'business insurance agent',
  consultant: 'business consultant',
  escrow: 'escrow company',
  title: 'title company',
};

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
 *
 * When the local table is sparse for a location, results are TOPPED UP with raw
 * Google Places listings so users in thin-coverage areas still get options. The
 * Places top-up is cost-guarded (only when local is short AND a location exists)
 * and is appended in neutral order — never ranked above or interleaved by quality.
 */
export async function findProviders(params: ProviderSearchParams): Promise<ProviderResult[]> {
  const { type, state, limit = 10 } = params;

  // 1) Local listings first (full param set incl. dealSize/financingType handled there).
  const local = await findLocalProviders(params);

  // 2) Cost guard: only reach out to Google Places when local coverage is sparse
  //    (fewer than the requested limit) AND we have a location to scope the query
  //    AND a concrete provider type to map to a search phrase. No location → no
  //    third-party call (avoids both wasted spend and over-broad nationwide pulls).
  const city = params.city;
  const hasLocation = !!(state || city);
  if (type && hasLocation && local.length < limit) {
    const need = limit - local.length;
    // Pull a couple extra so dedupe against local doesn't leave us short, capped at 10.
    const placesResults = await searchPlacesProviders(type, state, city, Math.min(need + 2, 10));

    // Dedupe against local by lowercased name + city (Places listings often
    // mirror a firm already self-listed locally; keep the local one).
    const seen = new Set(
      local.map(p => `${p.name.toLowerCase().trim()}|${(p.locationCity || '').toLowerCase().trim()}`),
    );
    for (const pr of placesResults) {
      const key = `${pr.name.toLowerCase().trim()}|${(pr.locationCity || '').toLowerCase().trim()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      local.push(pr);
      if (local.length >= limit) break;
    }
  }

  // Final order is NEUTRAL per THE LINE: local listings (already city/name sorted)
  // first, then any Places top-up (name sorted). This is provenance grouping, NOT
  // a ranking — smbX expresses no preference and no quality ordering of any kind.
  return local.slice(0, limit);
}

/**
 * Local-only directory query against the `service_providers` table. UNRANKED —
 * ordered neutrally (city, then name). Split out so the merge layer can run it
 * first and decide whether a Places top-up is warranted.
 */
async function findLocalProviders(params: ProviderSearchParams): Promise<ProviderResult[]> {
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
    source: 'smbx' as const,
    placeId: null,
    phone: p.phone || null,
    // Inviteable only when we hold an email to send the in-app invite to.
    inviteable: !!p.email,
  }));
}

/**
 * Raw Google Places provider listings for a type + location. THIRD-PARTY DATA the
 * user evaluates — smbX does not rank, score, or endorse them. Returns `[]` on any
 * failure / missing API key / empty result so the local directory always still works.
 *
 * Tier-1 (Essentials) details return NO email, so every Places result is
 * `inviteable:false` and `clientRating:null` (we never request rating here).
 */
export async function searchPlacesProviders(
  type: string,
  state?: string,
  city?: string,
  limit = 10,
): Promise<ProviderResult[]> {
  try {
    const phrase = PROVIDER_TYPE_QUERY[type];
    if (!phrase) return []; // unknown type → no sensible search phrase

    const where = city && state ? `${city}, ${state}` : (city || state || '');
    if (!where) return []; // never run an unscoped nationwide query

    const query = `${phrase} in ${where}`;

    // FREE id-only search first (cap the net), then ONE paid Tier-1 details batch.
    const ids = (await searchPlacesIdOnly(query, 20)).slice(0, Math.min(limit, 10));
    if (ids.length === 0) return [];

    const details = await getPlaceDetailsTier1(ids);

    return details
      .filter(d => d.businessStatus !== 'CLOSED_PERMANENTLY')
      .map((d: PlaceEssentials): ProviderResult => {
        const { city: parsedCity, state: parsedState } = parseCityState(d, state);
        return {
          id: 0, // Places results are not local rows; UI keys off placeId/source instead
          type,
          name: d.displayName?.text || 'Unnamed provider',
          firmName: null,
          locationState: parsedState,
          locationCity: parsedCity,
          credentials: [],
          practiceAreas: [],
          clientRating: null, // Tier-1: rating not requested → no rating, no ranking signal
          feeStructure: null,
          servesYourState: false, // neutral flags off — not asserting a match for raw listings
          servesYourDealSize: false,
          source: 'google_places' as const,
          placeId: d.id,
          phone: d.nationalPhoneNumber || null,
          inviteable: false, // no email from Places → cannot invite
        };
      });
  } catch (err: any) {
    // Never throw — local results must survive a Places outage / quota / missing key.
    console.error(`[providerMatching] Places top-up failed: ${err?.message || err}`);
    return [];
  }
}

/**
 * Parse city/state from a Places listing. Prefers structured addressComponents
 * (set by Tier-1's field mask); falls back to a light formattedAddress parse, then
 * to the requested state. Best-effort only — returns null when it can't tell.
 */
function parseCityState(
  place: PlaceEssentials,
  fallbackState?: string,
): { city: string | null; state: string | null } {
  let city: string | null = null;
  let state: string | null = null;

  for (const c of place.addressComponents || []) {
    if (c.types?.includes('locality')) city = c.longText;
    if (c.types?.includes('administrative_area_level_1')) state = c.shortText;
  }

  // Fallback: "..., City, ST 12345, USA" → grab "City" and 2-letter state.
  if ((!city || !state) && place.formattedAddress) {
    const parts = place.formattedAddress.split(',').map(s => s.trim());
    const stIdx = parts.findIndex(p => /^[A-Z]{2}(\s+\d{5})?$/.test(p));
    if (stIdx > 0) {
      if (!state) state = parts[stIdx].slice(0, 2);
      if (!city) city = parts[stIdx - 1] || null;
    }
  }

  return { city, state: state || fallbackState || null };
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
  // deal.location is typically "City, ST" — last segment is the state, the one
  // before it (when present) is the city. Both scope the Google Places top-up.
  const locParts = (deal.location || '').split(',').map((s: string) => s.trim()).filter(Boolean);
  const state = locParts.length ? locParts[locParts.length - 1] : null;
  const city = locParts.length >= 2 ? locParts[locParts.length - 2] : null;
  const dealSize = deal.asking_price || deal.revenue || null;

  const byType: Record<string, ProviderResult[]> = {};
  for (const type of neededTypes) {
    byType[type] = await findProviders({
      type,
      state: state || undefined,
      city: city || undefined,
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
