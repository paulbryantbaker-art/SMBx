/**
 * Aggregator Monitor Service — Scans BizBuySell and other listing aggregators.
 *
 * Daily job: fetches new listings from BizBuySell (via Apify or direct scrape),
 * matches against active buyer theses, and creates notifications for matches.
 *
 * Also handles listing ingestion and dedup via listingIngestionService.
 */
import { sql } from '../db.js';
import { ingestBatch, type RawListing, flagStaleListings, archiveStaleListings } from './listingIngestionService.js';

export interface AggregatorScanResult {
  source: string;
  listingsScanned: number;
  newListings: number;
  matchedTheses: number;
  notificationsSent: number;
}

// ─── State code mapping for BizBuySell URL construction ─────

const STATE_SLUGS: Record<string, string> = {
  AL: 'alabama', AK: 'alaska', AZ: 'arizona', AR: 'arkansas', CA: 'california',
  CO: 'colorado', CT: 'connecticut', DE: 'delaware', FL: 'florida', GA: 'georgia',
  HI: 'hawaii', ID: 'idaho', IL: 'illinois', IN: 'indiana', IA: 'iowa',
  KS: 'kansas', KY: 'kentucky', LA: 'louisiana', ME: 'maine', MD: 'maryland',
  MA: 'massachusetts', MI: 'michigan', MN: 'minnesota', MS: 'mississippi',
  MO: 'missouri', MT: 'montana', NE: 'nebraska', NV: 'nevada', NH: 'new-hampshire',
  NJ: 'new-jersey', NM: 'new-mexico', NY: 'new-york', NC: 'north-carolina',
  ND: 'north-dakota', OH: 'ohio', OK: 'oklahoma', OR: 'oregon', PA: 'pennsylvania',
  RI: 'rhode-island', SC: 'south-carolina', SD: 'south-dakota', TN: 'tennessee',
  TX: 'texas', UT: 'utah', VT: 'vermont', VA: 'virginia', WA: 'washington',
  WV: 'west-virginia', WI: 'wisconsin', WY: 'wyoming',
};

// ─── Industry category slugs for BizBuySell ─────────────────

const INDUSTRY_SLUGS: Record<string, string> = {
  'hvac': 'heating-and-air-conditioning',
  'dental': 'dental-practices',
  'veterinary': 'veterinary-practices',
  'restaurant': 'restaurants',
  'auto repair': 'automotive',
  'landscaping': 'landscaping',
  'pest control': 'pest-control',
  'insurance': 'insurance',
  'accounting': 'accounting-and-tax',
  'manufacturing': 'manufacturing',
  'construction': 'construction',
  'staffing': 'staffing-and-recruiting',
  'fitness': 'fitness-and-gym',
  'cleaning': 'cleaning',
  'plumbing': 'plumbing',
  'electrical': 'electrical',
  'salon': 'beauty-and-personal-care',
  'healthcare': 'healthcare',
  'ecommerce': 'ecommerce-and-internet',
  'saas': 'ecommerce-and-internet',
  'it': 'technology',
  'msp': 'technology',
};

/**
 * Run a full aggregator scan across all active buyer theses.
 * Called by worker.ts on a daily schedule.
 */
export async function runDailyAggregatorScan(): Promise<AggregatorScanResult> {
  const result: AggregatorScanResult = {
    source: 'bizbuysell',
    listingsScanned: 0,
    newListings: 0,
    matchedTheses: 0,
    notificationsSent: 0,
  };

  // 1. Get all active buyer theses with their criteria
  const theses = await sql`
    SELECT bt.id, bt.user_id, bt.industries, bt.geographies,
           bt.revenue_min, bt.revenue_max, bt.target_description,
           d.business_name
    FROM buyer_theses bt
    LEFT JOIN deals d ON d.id = bt.deal_id
    WHERE bt.status = 'active'
    ORDER BY bt.updated_at DESC
    LIMIT 50
  `.catch(() => []);

  if ((theses as any[]).length === 0) {
    console.log('[aggregator] No active theses to scan');
    return result;
  }

  // 2. Build unique industry × geography pairs to scan
  const scanPairs = new Set<string>();
  for (const thesis of theses as any[]) {
    const industries: string[] = thesis.industries || [];
    const geos: string[] = thesis.geographies || [];

    for (const ind of industries.slice(0, 3)) {
      if (geos.length > 0) {
        for (const geo of geos.slice(0, 3)) {
          scanPairs.add(`${ind.toLowerCase()}|${geo.toUpperCase()}`);
        }
      } else {
        scanPairs.add(`${ind.toLowerCase()}|`);
      }
    }
  }

  // 3. Scan each pair via Apify (if configured) or skip
  const apifyToken = process.env.APIFY_API_TOKEN;
  const allNewListings: RawListing[] = [];

  if (apifyToken) {
    for (const pair of scanPairs) {
      const [industry, state] = pair.split('|');
      const listings = await scanBizBuySellViaApify(apifyToken, industry, state || undefined);
      allNewListings.push(...listings);
      result.listingsScanned += listings.length;

      // Rate limit between scans
      await new Promise(r => setTimeout(r, 2000));
    }
  } else {
    console.log('[aggregator] No APIFY_API_TOKEN — using simulated scan');
    // In production, Apify would be configured. For now, just do maintenance.
  }

  // 4. Ingest new listings
  if (allNewListings.length > 0) {
    const ingestResult = await ingestBatch(allNewListings);
    result.newListings = ingestResult.ingested;
  }

  // 5. Match new listings against theses
  const recentListings = await sql`
    SELECT id, title, industry, naics_code, location_state, location_city,
           asking_price_cents, revenue_cents, sde_cents, ebitda_cents
    FROM listings
    WHERE status = 'active' AND created_at > NOW() - INTERVAL '2 days'
    ORDER BY created_at DESC
    LIMIT 100
  `.catch(() => []);

  for (const listing of recentListings as any[]) {
    for (const thesis of theses as any[]) {
      if (matchesThesis(listing, thesis)) {
        result.matchedTheses++;

        // Check if notification already exists
        const [existing] = await sql`
          SELECT id FROM notifications
          WHERE user_id = ${thesis.user_id} AND type = 'listing_match'
            AND body ILIKE ${`%${listing.title.substring(0, 40)}%`}
            AND created_at > NOW() - INTERVAL '7 days'
        `.catch(() => [null]);

        if (!existing) {
          await sql`
            INSERT INTO notifications (user_id, deal_id, type, title, body, action_url, created_at)
            VALUES (
              ${thesis.user_id}, NULL, 'listing_match',
              'New listing matches your thesis',
              ${'A new listing was found: "' + listing.title.substring(0, 80) + '" in ' + (listing.location_state || 'unknown state') + (listing.asking_price_cents ? ' — asking $' + (listing.asking_price_cents / 100).toLocaleString() : '') + '.'},
              '/chat', NOW()
            )
          `.catch(() => {});
          result.notificationsSent++;
        }
      }
    }
  }

  // 6. Maintenance: flag stale + archive very stale
  const flagged = await flagStaleListings().catch(() => 0);
  const archived = await archiveStaleListings().catch(() => 0);
  if (flagged || archived) {
    console.log(`[aggregator] Maintenance: ${flagged} flagged stale, ${archived} archived`);
  }

  return result;
}

/**
 * Scan BizBuySell via Apify actor.
 */
async function scanBizBuySellViaApify(token: string, industry: string, stateCode?: string): Promise<RawListing[]> {
  const industrySlug = INDUSTRY_SLUGS[industry] || industry.replace(/\s+/g, '-').toLowerCase();
  const stateSlug = stateCode ? STATE_SLUGS[stateCode] : undefined;

  // Build BizBuySell search URL for Apify web scraper
  let searchUrl = `https://www.bizbuysell.com/${industrySlug}-businesses-for-sale`;
  if (stateSlug) searchUrl += `/${stateSlug}`;

  try {
    // Start Apify actor run
    const actorId = process.env.APIFY_BBS_ACTOR_ID || 'apify/web-scraper';
    const runRes = await fetch(`https://api.apify.com/v2/acts/${actorId}/runs?token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startUrls: [{ url: searchUrl }],
        maxPagesPerCrawl: 3,
        maxRequestsPerCrawl: 30,
      }),
    });

    if (!runRes.ok) return [];
    const runData = await runRes.json();
    const runId = runData.data?.id;
    if (!runId) return [];

    // Wait for completion (max 60s)
    let attempts = 0;
    while (attempts < 12) {
      await new Promise(r => setTimeout(r, 5000));
      const statusRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${token}`);
      const statusData = await statusRes.json();
      if (statusData.data?.status === 'SUCCEEDED') break;
      if (statusData.data?.status === 'FAILED' || statusData.data?.status === 'ABORTED') return [];
      attempts++;
    }

    // Fetch results
    const resultsRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${token}`);
    if (!resultsRes.ok) return [];
    const items = await resultsRes.json();

    // Map to RawListing format
    return (items || []).map((item: any) => ({
      source: 'bizbuysell',
      sourceId: item.url || item.id,
      title: item.title || item.name || 'Unknown',
      description: item.description || item.snippet || undefined,
      industry: industry,
      locationState: stateCode,
      locationCity: item.city || item.location || undefined,
      askingPriceCents: item.askingPrice ? Math.round(parseFloat(String(item.askingPrice).replace(/[^0-9.]/g, '')) * 100) : undefined,
      revenueCents: item.revenue ? Math.round(parseFloat(String(item.revenue).replace(/[^0-9.]/g, '')) * 100) : undefined,
      sdeCents: item.cashFlow ? Math.round(parseFloat(String(item.cashFlow).replace(/[^0-9.]/g, '')) * 100) : undefined,
      listingUrl: item.url || undefined,
    })).filter((l: RawListing) => l.title && l.title !== 'Unknown');
  } catch (err: any) {
    console.error(`[aggregator] Apify scan error for ${industry}/${stateCode}:`, err.message);
    return [];
  }
}

/**
 * Check if a listing matches a buyer thesis.
 */
function matchesThesis(listing: any, thesis: any): boolean {
  let matchScore = 0;
  let totalChecks = 0;

  // Industry match
  const thesisIndustries: string[] = (thesis.industries || []).map((i: string) => i.toLowerCase());
  if (thesisIndustries.length > 0) {
    totalChecks++;
    const listingIndustry = (listing.industry || listing.title || '').toLowerCase();
    if (thesisIndustries.some((ti: string) => listingIndustry.includes(ti) || ti.includes(listingIndustry))) {
      matchScore++;
    }
  }

  // Geography match
  const thesisGeos: string[] = (thesis.geographies || []).map((g: string) => g.toUpperCase());
  if (thesisGeos.length > 0 && listing.location_state) {
    totalChecks++;
    if (thesisGeos.includes(listing.location_state.toUpperCase())) {
      matchScore++;
    }
  }

  // Revenue range match
  if (thesis.revenue_min || thesis.revenue_max) {
    const rev = listing.revenue_cents || 0;
    if (rev > 0) {
      totalChecks++;
      const min = thesis.revenue_min || 0;
      const max = thesis.revenue_max || Number.MAX_SAFE_INTEGER;
      if (rev >= min * 0.7 && rev <= max * 1.3) matchScore++;
    }
  }

  // Need at least 50% match rate with at least 1 check passed
  return totalChecks > 0 && matchScore > 0 && (matchScore / totalChecks) >= 0.5;
}

/**
 * Get summary of recent aggregator activity for a thesis.
 */
export async function getThesisAggregatorSummary(thesisId: number): Promise<{
  recentMatches: number;
  lastScanAt: string | null;
  topListings: any[];
}> {
  const [thesis] = await sql`
    SELECT last_match_scan_at FROM buyer_theses WHERE id = ${thesisId}
  `.catch(() => [null]);

  const matches = await sql`
    SELECT l.title, l.location_state, l.asking_price_cents, l.revenue_cents, l.listing_url
    FROM discovery_targets dt
    JOIN company_profiles cp ON cp.id = dt.company_profile_id
    LEFT JOIN listings l ON l.id = cp.listing_id
    WHERE dt.thesis_id = ${thesisId} AND dt.source = 'aggregator'
      AND dt.created_at > NOW() - INTERVAL '30 days'
    ORDER BY dt.created_at DESC
    LIMIT 5
  `.catch(() => []);

  return {
    recentMatches: (matches as any[]).length,
    lastScanAt: thesis?.last_match_scan_at?.toISOString() || null,
    topListings: (matches as any[]).map(m => ({
      title: m.title,
      state: m.location_state,
      askingPrice: m.asking_price_cents ? `$${(m.asking_price_cents / 100).toLocaleString()}` : null,
      revenue: m.revenue_cents ? `$${(m.revenue_cents / 100).toLocaleString()}` : null,
      url: m.listing_url,
    })),
  };
}
