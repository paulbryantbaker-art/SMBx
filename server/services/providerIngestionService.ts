/**
 * Provider Ingestion Service — Normalizes and imports service providers.
 */
import { sql } from '../db.js';

interface RawProvider {
  type: string;
  name: string;
  firmName?: string;
  email?: string;
  phone?: string;
  website?: string;
  locationState?: string;
  locationCity?: string;
  locationZip?: string;
  serviceRadiusMiles?: number;
  credentials?: string[];
  practiceAreas?: string[];
  dealSizeMin?: number;
  dealSizeMax?: number;
  industries?: string[];
  financingExperience?: string[];
  feeStructure?: string;
  typicalFeeMin?: number;
  typicalFeeMax?: number;
}

const VALID_TYPES = ['attorney', 'cpa', 'appraiser', 're_agent', 'insurance', 'consultant'];

/**
 * Ingest a single provider record.
 */
export async function ingestProvider(raw: RawProvider): Promise<{ id: number; isNew: boolean } | null> {
  if (!raw.name || !raw.type) return null;
  if (!VALID_TYPES.includes(raw.type)) return null;

  // Dedup by name + type + state
  const [existing] = await sql`
    SELECT id FROM service_providers
    WHERE LOWER(name) = LOWER(${raw.name}) AND type = ${raw.type}
      AND (location_state = ${raw.locationState || null} OR (location_state IS NULL AND ${raw.locationState || null} IS NULL))
    LIMIT 1
  `;

  if (existing) return { id: existing.id, isNew: false };

  const [provider] = await sql`
    INSERT INTO service_providers (
      type, name, firm_name, email, phone, website,
      location_state, location_city, location_zip, service_radius_miles,
      credentials, practice_areas, deal_size_min, deal_size_max,
      industries, financing_experience, fee_structure, typical_fee_min, typical_fee_max,
      data_sources
    ) VALUES (
      ${raw.type}, ${raw.name}, ${raw.firmName || null}, ${raw.email || null}, ${raw.phone || null}, ${raw.website || null},
      ${raw.locationState || null}, ${raw.locationCity || null}, ${raw.locationZip || null}, ${raw.serviceRadiusMiles || null},
      ${raw.credentials || []}, ${raw.practiceAreas || []}, ${raw.dealSizeMin || null}, ${raw.dealSizeMax || null},
      ${raw.industries || []}, ${raw.financingExperience || []}, ${raw.feeStructure || null}, ${raw.typicalFeeMin || null}, ${raw.typicalFeeMax || null},
      ${'{"manual_import"}'}
    )
    RETURNING id
  `;

  return { id: provider.id, isNew: true };
}

/**
 * Batch import providers from array.
 */
export async function ingestProviderBatch(providers: RawProvider[]): Promise<{ ingested: number; duplicates: number; errors: number }> {
  let ingested = 0;
  let duplicates = 0;
  let errors = 0;

  for (const raw of providers) {
    try {
      const result = await ingestProvider(raw);
      if (!result) { errors++; continue; }
      if (result.isNew) ingested++;
      else duplicates++;
    } catch {
      errors++;
    }
  }

  return { ingested, duplicates, errors };
}
