/**
 * Knowledge Graph Service — Upserts company profiles and buyer theses
 * from anonymous conversation data. Also queries buyer demand signals
 * to inject into seller conversations.
 */
import crypto from 'crypto';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!, {
  ssl: 'require',
  prepare: false,
});

// ─── Types ───────────────────────────────────────────────────

export interface CompanyProfileData {
  business_name?: string;
  industry?: string;
  industry_label?: string;
  location?: string;       // raw "Dallas, TX" — parsed into state + city
  naics_code?: string;
  revenue?: number;        // cents
  sde?: number;            // cents
  ebitda?: number;         // cents
  employee_count?: number;
  exit_type?: string;
}

export interface BuyerThesisData {
  buyer_type?: string;
  target_industry?: string;
  target_geography?: string;
  capital_available?: number;     // cents
  financing_approach?: string;
  target_size_range?: string;
  revenue_min?: number;           // cents
  revenue_max?: number;           // cents
}

export interface BuyerDemandSignal {
  strongMatches: number;
  industryMatches: number;
  totalActiveBuyers: number;
  demandText: string;
}

// ─── Helpers ─────────────────────────────────────────────────

function parseLocation(raw: string): { state: string | null; city: string | null } {
  if (!raw) return { state: null, city: null };
  // Handle "Dallas, TX" or "Dallas, Texas" or "TX" or "Texas"
  const parts = raw.split(',').map(p => p.trim());

  const STATE_ABBREVS: Record<string, string> = {
    AL: 'AL', AK: 'AK', AZ: 'AZ', AR: 'AR', CA: 'CA', CO: 'CO', CT: 'CT', DE: 'DE',
    FL: 'FL', GA: 'GA', HI: 'HI', ID: 'ID', IL: 'IL', IN: 'IN', IA: 'IA', KS: 'KS',
    KY: 'KY', LA: 'LA', ME: 'ME', MD: 'MD', MA: 'MA', MI: 'MI', MN: 'MN', MS: 'MS',
    MO: 'MO', MT: 'MT', NE: 'NE', NV: 'NV', NH: 'NH', NJ: 'NJ', NM: 'NM', NY: 'NY',
    NC: 'NC', ND: 'ND', OH: 'OH', OK: 'OK', OR: 'OR', PA: 'PA', RI: 'RI', SC: 'SC',
    SD: 'SD', TN: 'TN', TX: 'TX', UT: 'UT', VT: 'VT', VA: 'VA', WA: 'WA', WV: 'WV',
    WI: 'WI', WY: 'WY', DC: 'DC',
  };

  const STATE_NAMES: Record<string, string> = {
    alabama: 'AL', alaska: 'AK', arizona: 'AZ', arkansas: 'AR', california: 'CA',
    colorado: 'CO', connecticut: 'CT', delaware: 'DE', florida: 'FL', georgia: 'GA',
    hawaii: 'HI', idaho: 'ID', illinois: 'IL', indiana: 'IN', iowa: 'IA', kansas: 'KS',
    kentucky: 'KY', louisiana: 'LA', maine: 'ME', maryland: 'MD', massachusetts: 'MA',
    michigan: 'MI', minnesota: 'MN', mississippi: 'MS', missouri: 'MO', montana: 'MT',
    nebraska: 'NE', nevada: 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
    'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND',
    ohio: 'OH', oklahoma: 'OK', oregon: 'OR', pennsylvania: 'PA', 'rhode island': 'RI',
    'south carolina': 'SC', 'south dakota': 'SD', tennessee: 'TN', texas: 'TX',
    utah: 'UT', vermont: 'VT', virginia: 'VA', washington: 'WA', 'west virginia': 'WV',
    wisconsin: 'WI', wyoming: 'WY', 'district of columbia': 'DC',
  };

  if (parts.length >= 2) {
    const city = parts[0];
    const stateRaw = parts[parts.length - 1].trim().toUpperCase();
    const state = STATE_ABBREVS[stateRaw] || STATE_NAMES[parts[parts.length - 1].trim().toLowerCase()] || stateRaw;
    return { state, city };
  }

  // Single part — check if it's a state
  const upper = parts[0].toUpperCase();
  if (STATE_ABBREVS[upper]) return { state: upper, city: null };
  const lower = parts[0].toLowerCase();
  if (STATE_NAMES[lower]) return { state: STATE_NAMES[lower], city: null };

  // Assume it's a city
  return { state: null, city: parts[0] };
}

function detectPrefersSba(financing?: string): boolean {
  if (!financing) return false;
  const lower = financing.toLowerCase();
  return lower.includes('sba') || lower.includes('7(a)') || lower.includes('7a');
}

// ─── upsertCompanyProfile ────────────────────────────────────

export async function upsertCompanyProfile(
  convId: number,
  sessionId: string,
  data: CompanyProfileData,
): Promise<number | null> {
  try {
    const { state, city } = parseLocation(data.location || '');
    const name = data.business_name || data.industry || 'Unnamed Business';

    // Check for existing profile linked to this session
    const [existing] = await sql`
      SELECT id FROM company_profiles WHERE session_id = ${sessionId} LIMIT 1
    `;

    let profileId: number;

    if (existing) {
      // UPDATE only non-null incoming fields
      profileId = existing.id;
      const updates: Record<string, any> = {};
      if (data.business_name) updates.name = data.business_name;
      if (data.industry) updates.industry = data.industry;
      if (data.industry || data.industry_label) updates.industry_label = data.industry_label || data.industry;
      if (state) updates.location_state = state;
      if (city) updates.city = city;
      if (data.naics_code) updates.naics_code = data.naics_code;
      if (data.revenue) updates.revenue_reported = data.revenue;
      if (data.sde) updates.sde_reported = data.sde;
      if (data.ebitda) updates.ebitda_reported = data.ebitda;
      if (data.employee_count) updates.employee_count = data.employee_count;
      if (data.exit_type) updates.exit_type = data.exit_type;

      if (Object.keys(updates).length > 0) {
        // Build dynamic update — postgres-js doesn't support dynamic column names,
        // so we construct it with known safe columns
        const setClauses: string[] = [];
        const vals: any[] = [];
        for (const [col, val] of Object.entries(updates)) {
          setClauses.push(`${col} = $${vals.length + 1}`);
          vals.push(val);
        }
        vals.push(profileId);
        await sql.unsafe(
          `UPDATE company_profiles SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = $${vals.length}`,
          vals,
        );
      }
    } else {
      // INSERT new profile with share token for Bizestimate
      const shareToken = crypto.randomBytes(16).toString('hex');
      const [row] = await sql`
        INSERT INTO company_profiles (
          name, session_id, industry, industry_label, naics_code,
          location_state, city,
          revenue_reported, sde_reported, ebitda_reported, employee_count,
          exit_type, share_token
        ) VALUES (
          ${name}, ${sessionId}, ${data.industry || null}, ${data.industry_label || data.industry || null},
          ${data.naics_code || null}, ${state}, ${city},
          ${data.revenue || null}, ${data.sde || null}, ${data.ebitda || null},
          ${data.employee_count || null},
          ${data.exit_type || null}, ${shareToken}
        )
        RETURNING id, share_token
      `;
      profileId = row.id;
    }

    // Link to conversation
    await sql`
      UPDATE conversations SET company_profile_id = ${profileId} WHERE id = ${convId}
    `;

    return profileId;
  } catch (err: any) {
    console.error('upsertCompanyProfile error:', err.message);
    return null;
  }
}

// ─── upsertBuyerThesis ───────────────────────────────────────

export async function upsertBuyerThesis(
  convId: number,
  sessionId: string,
  data: BuyerThesisData,
): Promise<number | null> {
  try {
    const [existing] = await sql`
      SELECT id FROM theses WHERE session_id = ${sessionId} AND is_active = true LIMIT 1
    `;

    const industries = data.target_industry ? [data.target_industry] : [];
    const geographies = data.target_geography ? [data.target_geography] : [];
    const prefersSba = detectPrefersSba(data.financing_approach);

    let thesisId: number;

    if (existing) {
      thesisId = existing.id;
      const updates: Record<string, any> = {};
      if (data.buyer_type) updates.buyer_type = data.buyer_type;
      if (industries.length > 0) updates.industries = JSON.stringify(industries);
      if (geographies.length > 0) updates.geographies = JSON.stringify(geographies);
      if (data.capital_available) updates.equity_available = data.capital_available;
      if (data.financing_approach) updates.prefers_sba = prefersSba;

      if (Object.keys(updates).length > 0) {
        const setClauses: string[] = [];
        const vals: any[] = [];
        for (const [col, val] of Object.entries(updates)) {
          setClauses.push(`${col} = $${vals.length + 1}`);
          vals.push(val);
        }
        vals.push(thesisId);
        await sql.unsafe(
          `UPDATE theses SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = $${vals.length}`,
          vals,
        );
      }
    } else {
      // INSERT new thesis
      const [row] = await sql`
        INSERT INTO theses (
          session_id, buyer_type, industries, geographies,
          equity_available, prefers_sba
        ) VALUES (
          ${sessionId}, ${data.buyer_type || null},
          ${JSON.stringify(industries)}::jsonb, ${JSON.stringify(geographies)}::jsonb,
          ${data.capital_available || null}, ${prefersSba}
        )
        RETURNING id
      `;
      thesisId = row.id;
    }

    // Link to conversation
    await sql`
      UPDATE conversations SET thesis_id = ${thesisId} WHERE id = ${convId}
    `;

    return thesisId;
  } catch (err: any) {
    console.error('upsertBuyerThesis error:', err.message);
    return null;
  }
}

// ─── getBuyerDemandSignals ───────────────────────────────────

export async function getBuyerDemandSignals(profile: {
  industry?: string | null;
  location_state?: string | null;
  revenue_reported?: number | null;
}): Promise<BuyerDemandSignal | null> {
  try {
    if (!profile.industry) return null;

    // Count total active buyers
    const [totalRow] = await sql`
      SELECT COUNT(*)::int as count FROM theses WHERE is_active = true
    `;
    const totalActiveBuyers = totalRow?.count || 0;
    if (totalActiveBuyers === 0) return null;

    // Industry matches: theses whose industries array contains this industry (case-insensitive)
    const industryLower = profile.industry.toLowerCase();
    const [industryRow] = await sql`
      SELECT COUNT(*)::int as count FROM theses
      WHERE is_active = true
        AND EXISTS (
          SELECT 1 FROM jsonb_array_elements_text(industries) AS ind
          WHERE LOWER(ind) = ${industryLower}
        )
    `;
    const industryMatches = industryRow?.count || 0;

    // Strong matches: industry + geography + revenue in range
    let strongMatches = 0;
    if (profile.location_state && profile.revenue_reported) {
      const [strongRow] = await sql`
        SELECT COUNT(*)::int as count FROM theses
        WHERE is_active = true
          AND EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(industries) AS ind
            WHERE LOWER(ind) = ${industryLower}
          )
          AND EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(geographies) AS geo
            WHERE LOWER(geo) = ${profile.location_state.toLowerCase()}
              OR LOWER(geo) = 'national'
          )
          AND (revenue_min IS NULL OR revenue_min <= ${profile.revenue_reported})
          AND (revenue_max IS NULL OR revenue_max >= ${profile.revenue_reported})
      `;
      strongMatches = strongRow?.count || 0;
    }

    if (industryMatches === 0 && strongMatches === 0) return null;

    // Build demand text for prompt injection
    const parts: string[] = [];
    if (strongMatches > 0) {
      parts.push(`${strongMatches} active buyer${strongMatches > 1 ? 's' : ''} matching this exact profile (industry, geography, and size)`);
    }
    if (industryMatches > strongMatches) {
      parts.push(`${industryMatches} buyer${industryMatches > 1 ? 's' : ''} actively looking in this industry`);
    }
    parts.push(`${totalActiveBuyers} total active buyer${totalActiveBuyers > 1 ? 's' : ''} on the platform`);

    const demandText = `BUYER DEMAND INTELLIGENCE (for natural mention in conversation):\n- ${parts.join('\n- ')}`;

    return { strongMatches, industryMatches, totalActiveBuyers, demandText };
  } catch (err: any) {
    console.error('getBuyerDemandSignals error:', err.message);
    return null;
  }
}

// ─── Timeline Estimation ────────────────────────────────────

export interface ImprovementAction {
  status: string;
  difficulty: string | null;
  timeline_days: number | null;
}

/**
 * Estimate months until seller is ready to go to market.
 * Based on value readiness score, pending actions, and exit type.
 */
export function estimateMonthsToReady(
  valueReadinessScore: number,
  pendingActions: ImprovementAction[],
  exitType: string | null,
): number {
  // Base estimate from score
  let months = valueReadinessScore >= 80 ? 2
    : valueReadinessScore >= 60 ? 5
    : valueReadinessScore >= 40 ? 9
    : 14;

  // Adjust for pending action timelines
  const highImpactPending = pendingActions
    .filter(a => a.status !== 'complete' && a.difficulty === 'hard')
    .reduce((max, a) => Math.max(max, (a.timeline_days ?? 90) / 30), 0);

  months = Math.max(months, highImpactPending);

  // Exit type minimums
  if (exitType === 'esop') months = Math.max(months, 12);
  if (exitType === 'capital_raise') months = Math.max(months, 4);
  if (exitType === 'partner_buyout') months = Math.max(months, 2);

  return Math.round(months);
}

/**
 * Determine the seller's journey phase based on gate and readiness.
 */
export function getJourneyPhase(
  currentGate: string | null,
  valueReadinessScore: number | null,
): string {
  if (!currentGate) return 'assessing';
  const gate = currentGate.toUpperCase();
  if (gate === 'S5' || gate === 'CLOSED') return 'closed';
  if (gate === 'S4') return 'in_market';
  if (gate === 'S3') return 'ready';
  if ((valueReadinessScore || 0) >= 60) return 'optimizing';
  return 'assessing';
}
