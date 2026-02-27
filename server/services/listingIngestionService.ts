/**
 * Listing Ingestion Service — Normalize, dedup, and enrich business listings.
 */
import crypto from 'crypto';
import { sql } from '../db.js';

export interface RawListing {
  source: string;
  sourceId?: string;
  title: string;
  description?: string;
  industry?: string;
  naicsCode?: string;
  locationState?: string;
  locationCity?: string;
  locationZip?: string;
  askingPriceCents?: number;
  revenueCents?: number;
  sdeCents?: number;
  ebitdaCents?: number;
  employees?: number;
  listingUrl?: string;
}

/** Compute dedup fingerprint from normalized fields */
export function computeFingerprint(title: string, state?: string, priceCents?: number, revCents?: number): string {
  const normTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 60);
  const priceBand = priceCents ? Math.floor(priceCents / 10000000).toString() : '0'; // $100K bands
  const revBand = revCents ? Math.floor(revCents / 10000000).toString() : '0';
  const raw = `${normTitle}|${(state || '').toLowerCase()}|${priceBand}|${revBand}`;
  return crypto.createHash('sha256').update(raw).digest('hex').substring(0, 32);
}

/** Compute implied multiple from asking price and earnings */
function computeImpliedMultiple(priceCents?: number, sdeCents?: number, ebitdaCents?: number): number | null {
  const earnings = sdeCents || ebitdaCents;
  if (!priceCents || !earnings || earnings <= 0) return null;
  return Math.round((priceCents / earnings) * 100) / 100;
}

/** Ingest a single listing — normalize, dedup, insert */
export async function ingestListing(raw: RawListing): Promise<{ id: number; isNew: boolean } | null> {
  const fingerprint = computeFingerprint(raw.title, raw.locationState, raw.askingPriceCents, raw.revenueCents);
  const impliedMultiple = computeImpliedMultiple(raw.askingPriceCents, raw.sdeCents, raw.ebitdaCents);

  try {
    const [existing] = await sql`SELECT id FROM listings WHERE fingerprint = ${fingerprint}`;
    if (existing) {
      // Update existing listing's last_verified timestamp
      await sql`UPDATE listings SET last_verified_at = NOW(), updated_at = NOW() WHERE id = ${existing.id}`;
      return { id: existing.id, isNew: false };
    }

    const [inserted] = await sql`
      INSERT INTO listings (
        source, source_id, title, description, industry, naics_code,
        location_state, location_city, location_zip,
        asking_price_cents, revenue_cents, sde_cents, ebitda_cents, employees,
        implied_multiple, listing_url, fingerprint
      ) VALUES (
        ${raw.source}, ${raw.sourceId || null}, ${raw.title}, ${raw.description || null},
        ${raw.industry || null}, ${raw.naicsCode || null},
        ${raw.locationState || null}, ${raw.locationCity || null}, ${raw.locationZip || null},
        ${raw.askingPriceCents || null}, ${raw.revenueCents || null},
        ${raw.sdeCents || null}, ${raw.ebitdaCents || null}, ${raw.employees || null},
        ${impliedMultiple}, ${raw.listingUrl || null}, ${fingerprint}
      )
      RETURNING id
    `;

    return { id: inserted.id, isNew: true };
  } catch (err: any) {
    if (err.message?.includes('duplicate key')) {
      return null; // Race condition dedup
    }
    throw err;
  }
}

/** Batch ingest listings */
export async function ingestBatch(listings: RawListing[]): Promise<{ ingested: number; duplicates: number; errors: number }> {
  let ingested = 0;
  let duplicates = 0;
  let errors = 0;

  for (const raw of listings) {
    try {
      const result = await ingestListing(raw);
      if (!result) duplicates++;
      else if (result.isNew) ingested++;
      else duplicates++;
    } catch {
      errors++;
    }
  }

  return { ingested, duplicates, errors };
}

/** Archive stale listings (>180 days without verification) */
export async function archiveStaleListings(): Promise<number> {
  const result = await sql`
    UPDATE listings SET status = 'archived', updated_at = NOW()
    WHERE status = 'active' AND last_verified_at < NOW() - INTERVAL '180 days'
    RETURNING id
  `;
  return result.length;
}

/** Flag stale listings (>90 days without verification) */
export async function flagStaleListings(): Promise<number> {
  const result = await sql`
    UPDATE listings SET status = 'stale', updated_at = NOW()
    WHERE status = 'active' AND last_verified_at < NOW() - INTERVAL '90 days'
    RETURNING id
  `;
  return result.length;
}
