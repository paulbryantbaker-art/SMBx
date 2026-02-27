/**
 * Ownership Detection Service — Determines company ownership type.
 * Checks: SEC EDGAR (public) → listing description AI parse → default (family).
 */
import { sql } from '../db.js';

export interface OwnershipResult {
  ownershipType: 'public' | 'pe_held' | 'vc_backed' | 'franchise' | 'family' | 'unknown';
  confidence: number; // 0-100
  source: string;
  details: Record<string, any>;
}

const EDGAR_SEARCH_URL = 'https://efts.sec.gov/LATEST/search-index';

/**
 * Detect ownership type for a company.
 * Uses tiered approach: EDGAR → description parsing → default.
 */
export async function detectOwnership(companyName: string, state?: string, description?: string): Promise<OwnershipResult> {
  // Check cache first
  const [cached] = await sql`
    SELECT ownership_type, ownership_details, confidence_score
    FROM company_profiles
    WHERE LOWER(name) = LOWER(${companyName}) AND ownership_type IS NOT NULL AND ownership_type != 'unknown'
    LIMIT 1
  `.catch(() => [null]);

  if (cached) {
    return {
      ownershipType: cached.ownership_type,
      confidence: cached.confidence_score || 50,
      source: 'cache',
      details: cached.ownership_details || {},
    };
  }

  // 1. Check SEC EDGAR for public companies
  try {
    const edgarResult = await checkEdgar(companyName);
    if (edgarResult) {
      await cacheOwnership(companyName, state, edgarResult);
      return edgarResult;
    }
  } catch (err: any) {
    console.error('EDGAR lookup error:', err.message);
  }

  // 2. Parse listing description for ownership signals
  if (description) {
    const descResult = parseDescriptionForOwnership(description);
    if (descResult) {
      await cacheOwnership(companyName, state, descResult);
      return descResult;
    }
  }

  // 3. Default: family/founder-owned (most common for SMB)
  const defaultResult: OwnershipResult = {
    ownershipType: 'family',
    confidence: 30,
    source: 'default',
    details: { reason: 'No public/PE/VC signals found — default for SMB' },
  };
  await cacheOwnership(companyName, state, defaultResult);
  return defaultResult;
}

/** Check SEC EDGAR full-text search for public company */
async function checkEdgar(companyName: string): Promise<OwnershipResult | null> {
  try {
    const searchUrl = `https://efts.sec.gov/LATEST/search-index?q=${encodeURIComponent(`"${companyName}"`)}&dateRange=custom&startdt=2020-01-01&forms=10-K,10-Q&from=0&size=3`;
    const res = await fetch(searchUrl, {
      headers: { 'User-Agent': 'SMBX-Intelligence contact@smbx.ai' },
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (data.hits?.total?.value > 0) {
      const firstHit = data.hits.hits[0]._source;
      return {
        ownershipType: 'public',
        confidence: 95,
        source: 'sec_edgar',
        details: {
          entityName: firstHit.entity_name || companyName,
          cik: firstHit.file_num,
          formType: firstHit.form_type,
          filingDate: firstHit.file_date,
        },
      };
    }
  } catch {
    // EDGAR may be unreachable — continue to next check
  }

  return null;
}

/** Parse listing description for ownership signals */
function parseDescriptionForOwnership(description: string): OwnershipResult | null {
  const lower = description.toLowerCase();

  // Franchise signals
  const franchiseSignals = ['franchise', 'franchisee', 'franchisor', 'franchise agreement'];
  if (franchiseSignals.some(s => lower.includes(s))) {
    return {
      ownershipType: 'franchise',
      confidence: 75,
      source: 'description_parse',
      details: { signal: 'franchise-related keywords in description' },
    };
  }

  // PE/portfolio signals
  const peSignals = ['portfolio company', 'private equity', 'backed by', 'acquired by', 'platform acquisition'];
  if (peSignals.some(s => lower.includes(s))) {
    return {
      ownershipType: 'pe_held',
      confidence: 70,
      source: 'description_parse',
      details: { signal: 'PE/portfolio keywords in description' },
    };
  }

  // Family/founder signals (strong)
  const familySignals = ['owner retiring', 'family owned', 'family-owned', 'founder retiring', 'owner-operated', 'owner operated', 'years of ownership'];
  if (familySignals.some(s => lower.includes(s))) {
    return {
      ownershipType: 'family',
      confidence: 80,
      source: 'description_parse',
      details: { signal: 'family/owner-operated keywords in description' },
    };
  }

  return null;
}

/** Cache ownership result in company_profiles */
async function cacheOwnership(name: string, state: string | undefined, result: OwnershipResult): Promise<void> {
  await sql`
    INSERT INTO company_profiles (name, location_state, ownership_type, ownership_details, confidence_score, data_sources)
    VALUES (${name}, ${state || null}, ${result.ownershipType}, ${JSON.stringify(result.details)}, ${result.confidence}, ${[result.source]})
    ON CONFLICT DO NOTHING
  `.catch(() => {});
}
