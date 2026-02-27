/**
 * Thesis Matching Service — Automated matching of buyer theses against listings.
 */
import { sql } from '../db.js';
import { searchListings } from './searchService.js';
import { createNotification } from '../routes/notifications.js';
import { sendThesisMatchAlert } from './emailService.js';

/** Score a listing against a thesis (mirrors scoring logic from sourcing.ts) */
function scoreListingAgainstThesis(
  thesis: any,
  listing: { revenue_cents?: number; sde_cents?: number; ebitda_cents?: number; asking_price_cents?: number; industry?: string; location_state?: string; location_city?: string },
): { total: number; breakdown: Record<string, number> } {
  const breakdown: Record<string, number> = {};
  let totalWeight = 0;
  let totalScore = 0;

  // Revenue score (weight: 25)
  if (thesis.revenue_min || thesis.revenue_max) {
    const weight = 25;
    totalWeight += weight;
    const rev = listing.revenue_cents;
    if (rev) {
      const inRange = (!thesis.revenue_min || rev >= thesis.revenue_min) && (!thesis.revenue_max || rev <= thesis.revenue_max);
      breakdown.revenue = inRange ? 100 : 30;
    } else {
      breakdown.revenue = 50;
    }
    totalScore += breakdown.revenue * weight;
  }

  // Price score (weight: 25)
  if (thesis.price_min || thesis.price_max) {
    const weight = 25;
    totalWeight += weight;
    const price = listing.asking_price_cents;
    if (price) {
      const inRange = (!thesis.price_min || price >= thesis.price_min) && (!thesis.price_max || price <= thesis.price_max);
      breakdown.price = inRange ? 100 : 30;
    } else {
      breakdown.price = 50;
    }
    totalScore += breakdown.price * weight;
  }

  // Industry score (weight: 30)
  if (thesis.industry) {
    const weight = 30;
    totalWeight += weight;
    if (listing.industry) {
      const match = listing.industry.toLowerCase().includes(thesis.industry.toLowerCase()) ||
                   thesis.industry.toLowerCase().includes(listing.industry.toLowerCase());
      breakdown.industry = match ? 100 : 20;
    } else {
      breakdown.industry = 50;
    }
    totalScore += breakdown.industry * weight;
  }

  // Location score (weight: 20)
  if (thesis.geography || thesis.state_codes) {
    const weight = 20;
    totalWeight += weight;
    if (listing.location_state) {
      const geoMatch = thesis.geography?.toLowerCase().includes(listing.location_state.toLowerCase()) ||
                       listing.location_state.toLowerCase().includes(thesis.geography?.toLowerCase() || '');
      const stateMatch = thesis.state_codes?.includes(listing.location_state);
      breakdown.location = (geoMatch || stateMatch) ? 100 : 30;
    } else {
      breakdown.location = 50;
    }
    totalScore += breakdown.location * weight;
  }

  const total = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 50;
  return { total, breakdown };
}

/** Run thesis match scan for a single thesis */
export async function runThesisMatch(thesisId: number): Promise<{ newMatches: number; total: number }> {
  const [thesis] = await sql`SELECT * FROM buyer_theses WHERE id = ${thesisId}`;
  if (!thesis) return { newMatches: 0, total: 0 };

  // Build search params from thesis criteria
  const searchResult = await searchListings({
    naicsCode: thesis.naics_codes?.[0],
    state: thesis.state_codes?.[0],
    priceMin: thesis.price_min || undefined,
    priceMax: thesis.price_max || undefined,
    revenueMin: thesis.revenue_min || undefined,
    revenueMax: thesis.revenue_max || undefined,
    limit: 50,
  });

  let newMatches = 0;

  for (const listing of searchResult.listings) {
    const score = scoreListingAgainstThesis(thesis, listing);
    if (score.total < 40) continue; // Skip low matches

    // Check if match already exists
    const [existing] = await sql`
      SELECT id FROM thesis_matches
      WHERE thesis_id = ${thesisId} AND listing_url = ${listing.listing_url || `listing:${listing.id}`}
    `.catch(() => [null]);

    if (existing) continue;

    await sql`
      INSERT INTO thesis_matches (
        thesis_id, user_id, source, title, description, industry, location,
        asking_price, revenue, ebitda, sde, listing_url, score, score_breakdown
      ) VALUES (
        ${thesisId}, ${thesis.user_id}, 'core_db', ${listing.title}, ${listing.description || null},
        ${listing.industry || null}, ${[listing.location_city, listing.location_state].filter(Boolean).join(', ') || null},
        ${listing.asking_price_cents || null}, ${listing.revenue_cents || null},
        ${listing.ebitda_cents || null}, ${listing.sde_cents || null},
        ${listing.listing_url || `listing:${listing.id}`},
        ${score.total}, ${JSON.stringify(score.breakdown)}
      )
    `.catch(() => {}); // Ignore duplicates

    newMatches++;
  }

  return { newMatches, total: searchResult.total };
}

/** Run all active theses (called by daily pg-boss job) */
export async function runAllActiveTheses(): Promise<{ thesesScanned: number; totalNewMatches: number }> {
  const theses = await sql`SELECT id, user_id FROM buyer_theses WHERE is_active = true`;

  let totalNewMatches = 0;
  for (const thesis of theses) {
    const result = await runThesisMatch(thesis.id);
    totalNewMatches += result.newMatches;

    // Notify user if new matches found
    if (result.newMatches > 0) {
      await createNotification({
        userId: thesis.user_id,
        type: 'thesis_match',
        title: `${result.newMatches} new listing${result.newMatches > 1 ? 's' : ''} match your thesis`,
        body: 'Check your sourcing pipeline for new opportunities.',
        actionUrl: '/chat',
      });
      // Send email alert (non-blocking)
      sendThesisMatchAlert(thesis.user_id, result.newMatches).catch(() => {});
    }
  }

  return { thesesScanned: theses.length, totalNewMatches };
}

/** Check a newly ingested listing against all active theses */
export async function detectNewListingMatches(listingId: number): Promise<number> {
  const [listing] = await sql`SELECT * FROM listings WHERE id = ${listingId}`;
  if (!listing) return 0;

  const theses = await sql`SELECT * FROM buyer_theses WHERE is_active = true`;
  let matchCount = 0;

  for (const thesis of theses) {
    const score = scoreListingAgainstThesis(thesis, listing);
    if (score.total < 50) continue; // Only notify for decent matches

    await sql`
      INSERT INTO thesis_matches (
        thesis_id, user_id, source, title, industry, location,
        asking_price, revenue, ebitda, sde, listing_url, score, score_breakdown
      ) VALUES (
        ${thesis.id}, ${thesis.user_id}, 'new_listing', ${listing.title},
        ${listing.industry || null}, ${[listing.location_city, listing.location_state].filter(Boolean).join(', ') || null},
        ${listing.asking_price_cents || null}, ${listing.revenue_cents || null},
        ${listing.ebitda_cents || null}, ${listing.sde_cents || null},
        ${listing.listing_url || `listing:${listing.id}`},
        ${score.total}, ${JSON.stringify(score.breakdown)}
      )
    `.catch(() => {});

    matchCount++;

    await createNotification({
      userId: thesis.user_id,
      type: 'new_listing_match',
      title: 'New listing matches your thesis',
      body: `"${listing.title}" scored ${score.total}/100 against your criteria.`,
      actionUrl: '/chat',
    });
  }

  return matchCount;
}
