/**
 * Search Service — Full-text + faceted search over listings and company profiles.
 */
import { sql } from '../db.js';

export interface ListingSearchParams {
  query?: string;
  naicsCode?: string;
  state?: string;
  city?: string;
  priceMin?: number;
  priceMax?: number;
  revenueMin?: number;
  revenueMax?: number;
  sbaEligible?: boolean;
  status?: string;
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'date' | 'quality';
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  listings: any[];
  total: number;
  facets?: Record<string, any>;
}

/** Search listings with full-text + faceted filtering */
export async function searchListings(params: ListingSearchParams): Promise<SearchResult> {
  const {
    query, naicsCode, state, city,
    priceMin, priceMax, revenueMin, revenueMax,
    sbaEligible, status = 'active',
    sortBy = 'relevance', limit = 20, offset = 0,
  } = params;

  // Build dynamic WHERE conditions
  const conditions: string[] = ['l.status = $1'];
  const values: any[] = [status];
  let paramIndex = 2;

  if (query) {
    conditions.push(`l.search_vector @@ plainto_tsquery('english', $${paramIndex})`);
    values.push(query);
    paramIndex++;
  }

  if (naicsCode) {
    conditions.push(`l.naics_code LIKE $${paramIndex}`);
    values.push(naicsCode + '%');
    paramIndex++;
  }

  if (state) {
    conditions.push(`l.location_state = $${paramIndex}`);
    values.push(state);
    paramIndex++;
  }

  if (city) {
    conditions.push(`LOWER(l.location_city) = LOWER($${paramIndex})`);
    values.push(city);
    paramIndex++;
  }

  if (priceMin !== undefined) {
    conditions.push(`l.asking_price_cents >= $${paramIndex}`);
    values.push(priceMin);
    paramIndex++;
  }

  if (priceMax !== undefined) {
    conditions.push(`l.asking_price_cents <= $${paramIndex}`);
    values.push(priceMax);
    paramIndex++;
  }

  if (revenueMin !== undefined) {
    conditions.push(`l.revenue_cents >= $${paramIndex}`);
    values.push(revenueMin);
    paramIndex++;
  }

  if (revenueMax !== undefined) {
    conditions.push(`l.revenue_cents <= $${paramIndex}`);
    values.push(revenueMax);
    paramIndex++;
  }

  if (sbaEligible !== undefined) {
    conditions.push(`l.sba_eligible = $${paramIndex}`);
    values.push(sbaEligible);
    paramIndex++;
  }

  const whereClause = conditions.join(' AND ');

  // Sort order
  let orderClause = 'l.created_at DESC';
  if (sortBy === 'relevance' && query) {
    orderClause = `ts_rank(l.search_vector, plainto_tsquery('english', '${query.replace(/'/g, "''")}')) DESC`;
  } else if (sortBy === 'price_asc') {
    orderClause = 'l.asking_price_cents ASC NULLS LAST';
  } else if (sortBy === 'price_desc') {
    orderClause = 'l.asking_price_cents DESC NULLS LAST';
  } else if (sortBy === 'quality') {
    orderClause = 'l.deal_quality_score DESC NULLS LAST';
  }

  // Use postgres-js tagged template for safety
  // Since we need dynamic conditions, use a simpler approach
  const listings = await sql.unsafe(
    `SELECT l.id, l.source, l.title, l.description, l.industry, l.naics_code,
            l.location_state, l.location_city, l.asking_price_cents, l.revenue_cents,
            l.sde_cents, l.ebitda_cents, l.employees, l.implied_multiple,
            l.deal_quality_score, l.sba_eligible, l.ownership_type,
            l.listing_url, l.status, l.last_verified_at, l.created_at
     FROM listings l
     WHERE ${whereClause}
     ORDER BY ${orderClause}
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...values, limit, offset],
  );

  const [countResult] = await sql.unsafe(
    `SELECT COUNT(*) as total FROM listings l WHERE ${whereClause}`,
    values,
  );

  return {
    listings,
    total: parseInt(countResult?.total || '0', 10),
  };
}

/** Search company profiles */
export async function searchCompanyProfiles(params: {
  query?: string;
  naicsCode?: string;
  state?: string;
  ownershipType?: string;
  limit?: number;
  offset?: number;
}): Promise<{ profiles: any[]; total: number }> {
  const { query, naicsCode, state, ownershipType, limit = 20, offset = 0 } = params;

  let profiles;
  if (query) {
    profiles = await sql`
      SELECT * FROM company_profiles
      WHERE (LOWER(name) LIKE ${'%' + query.toLowerCase() + '%'} OR LOWER(industry) LIKE ${'%' + query.toLowerCase() + '%'})
        AND (${naicsCode || null} IS NULL OR naics_code LIKE ${(naicsCode || '') + '%'})
        AND (${state || null} IS NULL OR location_state = ${state || ''})
        AND (${ownershipType || null} IS NULL OR ownership_type = ${ownershipType || ''})
      ORDER BY confidence_score DESC, updated_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  } else {
    profiles = await sql`
      SELECT * FROM company_profiles
      WHERE (${naicsCode || null} IS NULL OR naics_code LIKE ${(naicsCode || '') + '%'})
        AND (${state || null} IS NULL OR location_state = ${state || ''})
        AND (${ownershipType || null} IS NULL OR ownership_type = ${ownershipType || ''})
      ORDER BY updated_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  }

  const [countResult] = await sql`SELECT COUNT(*) as total FROM company_profiles`;

  return {
    profiles,
    total: parseInt(countResult?.total || '0', 10),
  };
}

/** Get search statistics */
export async function getSearchStats(): Promise<Record<string, any>> {
  const [listingStats] = await sql`
    SELECT
      COUNT(*) as total_listings,
      COUNT(*) FILTER (WHERE status = 'active') as active_listings,
      COUNT(DISTINCT naics_code) as industries,
      COUNT(DISTINCT location_state) as states,
      ROUND(AVG(asking_price_cents) FILTER (WHERE asking_price_cents > 0)::numeric / 100, 0) as avg_asking_price,
      COUNT(*) FILTER (WHERE sba_eligible = true) as sba_eligible_count
    FROM listings
  `;

  const [profileStats] = await sql`
    SELECT COUNT(*) as total_profiles FROM company_profiles
  `;

  return {
    listings: listingStats,
    profiles: { total: parseInt(profileStats?.total_profiles || '0', 10) },
  };
}
