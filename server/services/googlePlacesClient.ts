/**
 * Google Places API Client — Field-mask-enforced wrapper.
 *
 * BILLING SAFETY: Each function enforces a specific field mask tier.
 * You physically cannot request Pro fields through the Essentials function.
 *
 * Pricing (as of 2025):
 *   - Text Search (ID Only):  FREE, unlimited
 *   - Place Details Essentials: $5 per 1,000 (10K free/month)
 *   - Place Details Pro:       $17 per 1,000 (5K free/month)
 *   - Place Details Enterprise: $40 per 1,000 (DO NOT USE)
 *
 * Google Places ToS:
 *   - Store Place IDs indefinitely ✓
 *   - Cache Place Details for 24 hours max
 *   - Re-fetch on demand for fresh data
 *   - Display Google attribution on all results
 */

import { sql } from '../db.js';

const API_BASE = 'https://places.googleapis.com/v1';

// ─── Field Masks (billing tier enforcement) ─────────────────────────

const FIELD_MASKS = {
  /** FREE — returns only Place IDs, no billing */
  idOnly: 'places.id',

  /** Essentials ($5/1K, 10K free) — basic business info */
  tier1: [
    'places.id',
    'places.displayName',
    'places.formattedAddress',
    'places.shortFormattedAddress',
    'places.location',
    'places.nationalPhoneNumber',
    'places.businessStatus',
    'places.types',
    'places.addressComponents',
  ].join(','),

  /** Pro ($17/1K, 5K free) — adds rating, reviews, website */
  tier2: [
    'places.id',
    'places.displayName',
    'places.formattedAddress',
    'places.shortFormattedAddress',
    'places.location',
    'places.nationalPhoneNumber',
    'places.businessStatus',
    'places.types',
    'places.addressComponents',
    'places.rating',
    'places.userRatingCount',
    'places.websiteUri',
    'places.priceLevel',
  ].join(','),
} as const;

// ─── Types ──────────────────────────────────────────────────────────

export interface PlaceIdResult {
  id: string;
}

export interface PlaceEssentials {
  id: string;
  displayName?: { text: string; languageCode: string };
  formattedAddress?: string;
  shortFormattedAddress?: string;
  location?: { latitude: number; longitude: number };
  nationalPhoneNumber?: string;
  businessStatus?: string;
  types?: string[];
  addressComponents?: Array<{
    longText: string;
    shortText: string;
    types: string[];
  }>;
}

export interface PlacePro extends PlaceEssentials {
  rating?: number;
  userRatingCount?: number;
  websiteUri?: string;
  priceLevel?: string;
}

// ─── Usage Tracking ─────────────────────────────────────────────────

interface UsageLimits {
  essentialsLimit: number;  // default 10000 (free tier)
  proLimit: number;         // default 5000 (free tier)
}

const DEFAULT_LIMITS: UsageLimits = {
  essentialsLimit: 9500,  // leave buffer under 10K free
  proLimit: 4500,         // leave buffer under 5K free
};

async function getMonthlyUsage(tier: 'essentials' | 'pro'): Promise<number> {
  const cacheKey = `google_places_usage_${tier}_${new Date().toISOString().slice(0, 7)}`;
  try {
    const [row] = await sql`
      SELECT data FROM market_data_cache
      WHERE source = 'google_places_usage' AND cache_key = ${cacheKey}
    `;
    return row ? (row.data as any).count || 0 : 0;
  } catch {
    return 0;
  }
}

async function incrementUsage(tier: 'essentials' | 'pro', count: number): Promise<void> {
  const cacheKey = `google_places_usage_${tier}_${new Date().toISOString().slice(0, 7)}`;
  try {
    await sql`
      INSERT INTO market_data_cache (source, cache_key, data, fetched_at, expires_at)
      VALUES ('google_places_usage', ${cacheKey},
              ${JSON.stringify({ count })}::jsonb,
              NOW(), NOW() + INTERVAL '35 days')
      ON CONFLICT (source, cache_key) DO UPDATE
      SET data = jsonb_set(market_data_cache.data, '{count}',
        to_jsonb((COALESCE((market_data_cache.data->>'count')::int, 0) + ${count}))),
        fetched_at = NOW()
    `;
  } catch {
    // Non-critical — don't fail the pipeline for usage tracking
  }
}

async function checkUsageLimit(tier: 'essentials' | 'pro', requestCount: number): Promise<boolean> {
  const limit = tier === 'essentials' ? DEFAULT_LIMITS.essentialsLimit : DEFAULT_LIMITS.proLimit;
  const current = await getMonthlyUsage(tier);
  return (current + requestCount) <= limit;
}

// ─── API Functions ──────────────────────────────────────────────────

function getApiKey(): string {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) throw new Error('GOOGLE_PLACES_API_KEY not set');
  return key;
}

/**
 * Text Search (ID Only) — FREE, unlimited.
 * Returns only Place IDs. Use to cast the widest net.
 */
export async function searchPlacesIdOnly(
  textQuery: string,
  maxResults = 20,
): Promise<string[]> {
  const apiKey = getApiKey();

  try {
    const res = await fetch(`${API_BASE}/places:searchText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': FIELD_MASKS.idOnly,
      },
      body: JSON.stringify({
        textQuery,
        maxResultCount: Math.min(maxResults, 20),
        languageCode: 'en',
      }),
    });

    if (!res.ok) {
      const err = await res.text().catch(() => '');
      console.error(`[googlePlaces] Text search failed (${res.status}): ${err}`);
      return [];
    }

    const data = await res.json();
    return (data.places || []).map((p: PlaceIdResult) => p.id);
  } catch (err: any) {
    console.error(`[googlePlaces] Text search error: ${err.message}`);
    return [];
  }
}

/**
 * Place Details — Essentials tier ($5/1K, 10K free/month).
 * Returns: name, address, phone, hours, status, types.
 * NEVER requests Pro or Enterprise fields.
 */
export async function getPlaceDetailsTier1(
  placeIds: string[],
): Promise<PlaceEssentials[]> {
  if (placeIds.length === 0) return [];
  const apiKey = getApiKey();

  // Check usage limit
  const withinLimit = await checkUsageLimit('essentials', placeIds.length);
  if (!withinLimit) {
    console.warn(`[googlePlaces] Essentials quota would be exceeded. Skipping ${placeIds.length} requests.`);
    return [];
  }

  const results: PlaceEssentials[] = [];

  // Process in batches of 50 with rate limiting
  for (let i = 0; i < placeIds.length; i += 50) {
    const batch = placeIds.slice(i, i + 50);
    const batchResults = await Promise.all(
      batch.map(id => fetchPlaceDetail(id, FIELD_MASKS.tier1, apiKey)),
    );
    results.push(...batchResults.filter(Boolean) as PlaceEssentials[]);

    // Rate limit: 200ms between batches
    if (i + 50 < placeIds.length) {
      await sleep(200);
    }
  }

  await incrementUsage('essentials', results.length);
  return results;
}

/**
 * Place Details — Pro tier ($17/1K, 5K free/month).
 * Returns: everything in Essentials + rating, reviews, website, price level.
 * NEVER requests Enterprise fields (reviews text, photos).
 */
export async function getPlaceDetailsTier2(
  placeIds: string[],
): Promise<PlacePro[]> {
  if (placeIds.length === 0) return [];
  const apiKey = getApiKey();

  // Check usage limit
  const withinLimit = await checkUsageLimit('pro', placeIds.length);
  if (!withinLimit) {
    console.warn(`[googlePlaces] Pro quota would be exceeded. Skipping ${placeIds.length} requests.`);
    return [];
  }

  const results: PlacePro[] = [];

  for (let i = 0; i < placeIds.length; i += 50) {
    const batch = placeIds.slice(i, i + 50);
    const batchResults = await Promise.all(
      batch.map(id => fetchPlaceDetail(id, FIELD_MASKS.tier2, apiKey)),
    );
    results.push(...batchResults.filter(Boolean) as PlacePro[]);

    if (i + 50 < placeIds.length) {
      await sleep(200);
    }
  }

  await incrementUsage('pro', results.length);
  return results;
}

/**
 * Batch text search — runs multiple queries in parallel batches.
 * Returns deduplicated Place IDs across all queries.
 */
export async function batchTextSearch(
  queries: string[],
  batchSize = 10,
  delayMs = 200,
): Promise<string[]> {
  const allIds = new Set<string>();

  for (let i = 0; i < queries.length; i += batchSize) {
    const batch = queries.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(q => searchPlacesIdOnly(q)),
    );
    for (const ids of results) {
      for (const id of ids) {
        allIds.add(id);
      }
    }

    // Rate limit between batches
    if (i + batchSize < queries.length) {
      await sleep(delayMs);
    }
  }

  return [...allIds];
}

// ─── Helpers ────────────────────────────────────────────────────────

async function fetchPlaceDetail(
  placeId: string,
  fieldMask: string,
  apiKey: string,
): Promise<PlaceEssentials | PlacePro | null> {
  try {
    const res = await fetch(`${API_BASE}/${placeId}`, {
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': fieldMask.replace(/places\./g, ''),
      },
    });

    if (!res.ok) {
      if (res.status === 429) {
        // Rate limited — wait and retry once
        await sleep(1000);
        const retry = await fetch(`${API_BASE}/${placeId}`, {
          headers: {
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': fieldMask.replace(/places\./g, ''),
          },
        });
        if (!retry.ok) return null;
        return await retry.json();
      }
      return null;
    }

    return await res.json();
  } catch {
    return null;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Extract city and state from Google Places addressComponents.
 */
export function extractCityState(place: PlaceEssentials): { city: string | null; state: string | null; zip: string | null } {
  const components = place.addressComponents || [];
  let city: string | null = null;
  let state: string | null = null;
  let zip: string | null = null;

  for (const c of components) {
    if (c.types.includes('locality')) city = c.longText;
    if (c.types.includes('administrative_area_level_1')) state = c.shortText;
    if (c.types.includes('postal_code')) zip = c.longText;
  }

  return { city, state, zip };
}
