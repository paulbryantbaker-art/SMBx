/**
 * Discovery Service — Off-Market Discovery Pipeline
 * Session 13: Google Places + BizBuySell integration
 *
 * Orchestrates discovery scanning for buyer theses.
 * Uses Google Places API for off-market businesses and
 * can integrate with BizBuySell via Apify for listed deals.
 */
import { sql } from '../db.js';

// ─── NAICS → Google Places search queries ─────────────
const NAICS_SEARCH_QUERIES: Record<string, string[]> = {
  '2382': ['hvac company', 'air conditioning contractor', 'heating contractor'],
  '5612': ['pest control company', 'exterminator'],
  '5617': ['landscaping company', 'lawn care service'],
  '8111': ['auto repair shop', 'mechanic shop'],
  '6211': ['medical practice', "doctor's office"],
  '7225': ['restaurant', 'food service'],
  '5411': ['law firm', 'legal services'],
  '5412': ['accounting firm', 'cpa firm'],
  '2389': ['general contractor', 'construction company'],
  '4441': ['hardware store', 'building supply'],
  '8121': ['hair salon', 'barber shop', 'beauty salon'],
  '4451': ['grocery store', 'supermarket'],
  '5613': ['staffing agency', 'employment agency'],
  '4411': ['car dealership', 'auto dealer'],
  '5242': ['insurance agency'],
  '5312': ['property management company'],
  '6213': ['dental practice', 'dentist office'],
  '5415': ['IT company', 'managed service provider', 'computer services'],
  '5416': ['consulting firm', 'management consulting'],
  '4529': ['retail store'],
};

interface ThesisCriteria {
  industries: string[];
  geographies: string[];
  revenue_min?: number;
  revenue_max?: number;
}

/**
 * Run a full discovery scan for a thesis.
 * Searches Google Places and optionally BizBuySell.
 */
export async function runDiscoveryScan(thesisId: number): Promise<void> {
  console.log(`[discovery] Starting scan for thesis ${thesisId}`);

  const [thesis] = await sql`SELECT * FROM theses WHERE id = ${thesisId}`;
  if (!thesis) throw new Error(`Thesis ${thesisId} not found`);

  const criteria: ThesisCriteria = {
    industries: thesis.industries || [],
    geographies: thesis.geographies || [],
    revenue_min: thesis.revenue_min,
    revenue_max: thesis.revenue_max,
  };

  // Run Google Places search if API key available
  if (process.env.GOOGLE_PLACES_API_KEY) {
    await searchGooglePlaces(thesisId, criteria);
  }

  // Run BizBuySell via Apify if token available
  if (process.env.APIFY_API_TOKEN) {
    await searchBizBuySell(thesisId, criteria);
  }

  // Run internal matching (existing company profiles)
  await matchInternalProfiles(thesisId, criteria);

  // Update thesis match count
  const [count] = await sql`
    SELECT COUNT(*)::int as cnt FROM discovery_targets
    WHERE thesis_id = ${thesisId} AND buyer_status != 'passed'
  `;
  await sql`
    UPDATE theses SET internal_match_count = ${count.cnt}, last_match_scan_at = NOW()
    WHERE id = ${thesisId}
  `;

  console.log(`[discovery] Scan complete for thesis ${thesisId}: ${count.cnt} targets`);
}

/**
 * Search Google Places API for businesses matching thesis criteria.
 */
async function searchGooglePlaces(thesisId: number, criteria: ThesisCriteria): Promise<void> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return;

  // Build search queries from industry criteria
  const searchQueries: string[] = [];
  for (const industry of criteria.industries) {
    // Try NAICS code match
    const naicsPrefix = String(industry).substring(0, 4);
    const queries = NAICS_SEARCH_QUERIES[naicsPrefix];
    if (queries) {
      searchQueries.push(...queries);
    } else {
      // Use industry name directly
      searchQueries.push(String(industry));
    }
  }

  if (searchQueries.length === 0) return;

  // Search each geography × query combination
  for (const geo of criteria.geographies) {
    for (const query of searchQueries.slice(0, 3)) { // Limit to 3 queries per geo
      try {
        const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.websiteUri,places.nationalPhoneNumber,places.rating,places.userRatingCount,places.businessStatus',
          },
          body: JSON.stringify({
            textQuery: `${query} in ${geo}`,
            maxResultCount: 20,
          }),
        });

        if (!response.ok) continue;
        const data = await response.json();

        for (const place of (data.places || [])) {
          if (place.businessStatus !== 'OPERATIONAL') continue;

          await upsertDiscoveryTarget(thesisId, {
            name: place.displayName?.text || 'Unknown',
            address: place.formattedAddress || '',
            website: place.websiteUri || null,
            phone: place.nationalPhoneNumber || null,
            rating: place.rating || null,
            reviewCount: place.userRatingCount || null,
            source: 'google_places',
            sourceId: place.id,
            industry: query,
            state: extractState(place.formattedAddress || ''),
          });
        }
      } catch (err: any) {
        console.error(`[discovery] Google Places error for "${query} in ${geo}":`, err.message);
      }
    }
  }
}

/**
 * Search BizBuySell via Apify actor.
 */
async function searchBizBuySell(thesisId: number, criteria: ThesisCriteria): Promise<void> {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) return;

  // BizBuySell integration via Apify
  // This is a placeholder — actual Apify actor ID would be configured
  console.log(`[discovery] BizBuySell search skipped — configure Apify actor ID`);
}

/**
 * Match thesis against existing company profiles in the database.
 */
async function matchInternalProfiles(thesisId: number, criteria: ThesisCriteria): Promise<void> {
  // Build WHERE conditions
  let profiles = await sql`
    SELECT id, name, industry, naics_code, location_state, city,
           revenue_reported, sde_reported, ebitda_reported,
           revenue_estimated_low, revenue_estimated_high,
           deal_status, sale_readiness_score
    FROM company_profiles
    WHERE deal_status != 'private'
    ORDER BY updated_at DESC
    LIMIT 500
  `;

  for (const profile of profiles as any[]) {
    // Score the match
    const score = scoreMatch(profile, criteria);
    if (score < 20) continue; // Skip low-scoring matches

    // Check if target already exists
    const [existing] = await sql`
      SELECT id FROM discovery_targets
      WHERE thesis_id = ${thesisId} AND company_profile_id = ${profile.id}
    `;

    if (existing) {
      await sql`
        UPDATE discovery_targets
        SET thesis_fit_score = ${score}, overall_score = ${score}, updated_at = NOW()
        WHERE id = ${existing.id}
      `;
    } else {
      await sql`
        INSERT INTO discovery_targets (thesis_id, company_profile_id, source, thesis_fit_score, overall_score, enrichment_status)
        VALUES (${thesisId}, ${profile.id}, 'internal_match', ${score}, ${score}, 'complete')
        ON CONFLICT DO NOTHING
      `;
    }
  }
}

/**
 * Score a company profile against thesis criteria.
 */
function scoreMatch(profile: any, criteria: ThesisCriteria): number {
  let score = 0;

  // Industry match (30 pts)
  if (criteria.industries.length > 0) {
    const profileIndustry = (profile.industry || '').toLowerCase();
    const profileNaics = profile.naics_code || '';
    for (const ind of criteria.industries) {
      const indLower = String(ind).toLowerCase();
      if (profileIndustry.includes(indLower) || indLower.includes(profileIndustry)) {
        score += 30;
        break;
      }
      if (profileNaics && profileNaics.startsWith(String(ind).substring(0, 4))) {
        score += 30;
        break;
      }
    }
  } else {
    score += 15; // No industry filter = partial match
  }

  // Geography match (25 pts)
  if (criteria.geographies.length > 0) {
    const profileState = (profile.location_state || '').toLowerCase();
    const profileCity = (profile.city || '').toLowerCase();
    for (const geo of criteria.geographies) {
      const geoLower = String(geo).toLowerCase();
      if (profileState.includes(geoLower) || geoLower.includes(profileState) ||
          profileCity.includes(geoLower)) {
        score += 25;
        break;
      }
    }
  } else {
    score += 12; // No geo filter = partial match
  }

  // Revenue range match (25 pts)
  const revenue = profile.revenue_reported || profile.revenue_estimated_low || 0;
  if (revenue > 0 && (criteria.revenue_min || criteria.revenue_max)) {
    const min = criteria.revenue_min || 0;
    const max = criteria.revenue_max || Number.MAX_SAFE_INTEGER;
    if (revenue >= min && revenue <= max) {
      score += 25;
    } else if (revenue >= min * 0.7 && revenue <= max * 1.3) {
      score += 12; // Near-miss
    }
  } else {
    score += 10; // No revenue data = partial
  }

  // Sale readiness (20 pts)
  if (profile.deal_status === 'listed') score += 20;
  else if (profile.deal_status === 'exploring') score += 15;
  else if ((profile.sale_readiness_score || 0) > 60) score += 10;

  return score;
}

/**
 * Upsert a discovery target from an external source.
 */
async function upsertDiscoveryTarget(thesisId: number, data: {
  name: string;
  address: string;
  website?: string | null;
  phone?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  source: string;
  sourceId: string;
  industry?: string;
  state?: string;
}): Promise<void> {
  // Check for existing company profile
  let [profile] = await sql`
    SELECT id FROM company_profiles
    WHERE name ILIKE ${data.name} AND location_state = ${data.state || null}
    LIMIT 1
  `;

  if (!profile) {
    // Create new company profile
    [profile] = await sql`
      INSERT INTO company_profiles (name, location_state, industry, website, deal_status, data_sources)
      VALUES (${data.name}, ${data.state || null}, ${data.industry || null}, ${data.website || null},
              'unknown', ${sql.array([data.source])})
      RETURNING id
    `;
  }

  if (!profile) return;

  // Check if discovery target already exists
  const [existing] = await sql`
    SELECT id FROM discovery_targets
    WHERE thesis_id = ${thesisId} AND company_profile_id = ${profile.id}
  `;

  if (!existing) {
    await sql`
      INSERT INTO discovery_targets (thesis_id, company_profile_id, source, source_id, enrichment_status, raw_data)
      VALUES (${thesisId}, ${profile.id}, ${data.source}, ${data.sourceId}, 'pending',
              ${JSON.stringify({ rating: data.rating, reviewCount: data.reviewCount, phone: data.phone })}::jsonb)
      ON CONFLICT DO NOTHING
    `;
  }
}

/**
 * Extract US state from an address string.
 */
function extractState(address: string): string | null {
  const statePattern = /\b([A-Z]{2})\s+\d{5}/;
  const match = address.match(statePattern);
  return match ? match[1] : null;
}

// ─── Conviction Check ────────────────────────────────────────

export interface ConvictionCheck {
  checks: Array<{ label: string; pass: boolean | null; reason: string | null }>;
  verdict: 'pursue' | 'pass' | 'investigate';
}

/**
 * Compute a quick conviction check for a discovery target.
 * Returns structured go/no-go assessment per target.
 */
export function computeConvictionCheck(
  profile: any,
  thesis: any,
): ConvictionCheck {
  const checks: Array<{ label: string; pass: boolean | null; reason: string | null }> = [];

  // 1. Industry match
  const thesisIndustries: string[] = thesis.industries || [];
  const profileIndustry = (profile.industry || '').toLowerCase();
  const profileNaics = profile.naics_code || '';
  let industryMatch = false;
  for (const ind of thesisIndustries) {
    const indLower = String(ind).toLowerCase();
    if (profileIndustry.includes(indLower) || indLower.includes(profileIndustry)) {
      industryMatch = true;
      break;
    }
    if (profileNaics && profileNaics.startsWith(String(ind).substring(0, 4))) {
      industryMatch = true;
      break;
    }
  }
  checks.push({
    label: 'Industry matches your criteria',
    pass: thesisIndustries.length === 0 ? null : industryMatch,
    reason: industryMatch ? null : thesisIndustries.length === 0 ? 'No industry criteria set' : 'Outside your target industries',
  });

  // 2. SBA financeable
  const revenue = profile.revenue_reported || profile.revenue_estimated_high || 0;
  const sde = profile.sde_reported || 0;
  const equityAvailable = thesis.equity_available || 0;

  if (revenue > 0 && equityAvailable > 0) {
    const estimatedDealValue = sde > 0 ? sde * 3 : revenue * 0.15;
    const loanAmount = estimatedDealValue * 0.9;
    const annualDebtService = loanAmount * 0.13; // approx SBA rate + amortization
    const dscr = sde > 0 ? sde / annualDebtService : null;

    const sbaOk = dscr ? dscr >= 1.25 : null;
    checks.push({
      label: 'SBA financeable at estimated price',
      pass: sbaOk,
      reason: sbaOk === false ? `Est. DSCR ${dscr?.toFixed(2)} below 1.25x minimum`
             : sbaOk === null ? 'Insufficient data to estimate'
             : `Est. DSCR ${dscr?.toFixed(2)}`,
    });
  }

  // 3. Revenue diversification (unknown until DD)
  checks.push({
    label: 'Revenue appears diversified',
    pass: null,
    reason: 'Verify customer concentration in due diligence',
  });

  // Verdict
  const hardFails = checks.filter(c => c.pass === false).length;
  const verdict: 'pursue' | 'pass' | 'investigate' = hardFails >= 2 ? 'pass'
    : hardFails === 1 ? 'investigate'
    : 'pursue';

  return { checks, verdict };
}
