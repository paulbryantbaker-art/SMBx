/**
 * Sector Analysis Generator — Weekly shared sector briefs per NAICS code.
 * Cached for 7 days, shared across all users (50-80% cost reduction).
 */
import { sql } from '../../db.js';
import { fetchCBPData, fetchFREDData } from '../marketDataService.js';
import { callClaude } from '../aiService.js';

interface SectorBrief {
  naicsCode: string;
  title: string;
  generatedAt: string;
  summary: string;
  keyMetrics: Record<string, any>;
  outlook: string;
  risks: string[];
  opportunities: string[];
}

/**
 * Get or generate a sector analysis brief for a NAICS code.
 * Returns cached version if available and fresh (< 7 days).
 */
export async function getSectorAnalysis(naicsCode: string): Promise<SectorBrief | null> {
  // Check cache
  const [cached] = await sql`
    SELECT data FROM market_data_cache
    WHERE source = 'sector_analysis' AND cache_key = ${naicsCode} AND expires_at > NOW()
    LIMIT 1
  `.catch(() => [null]);

  if (cached?.data) return cached.data as SectorBrief;

  // Generate fresh analysis
  try {
    // Gather data for the sector
    const fredKeys = ['FEDFUNDS', 'PRIME', 'UNRATE', 'CPIAUCSL'];
    const fredData: Record<string, any> = {};
    for (const key of fredKeys) {
      fredData[key] = await fetchFREDData(key);
    }

    // Get national-level CBP data (stateCode '*' doesn't work, skip if no data)
    const [benchmarks] = await sql`
      SELECT
        COUNT(*) as sample_size,
        ROUND(AVG(multiple)::numeric, 2) as avg_multiple,
        ROUND(AVG(days_to_close)::numeric, 0) as avg_days_to_close,
        ROUND((COUNT(*) FILTER (WHERE sba_financed = true))::numeric / NULLIF(COUNT(*), 0) * 100, 1) as pct_sba
      FROM transaction_benchmarks WHERE naics_code = ${naicsCode}
    `.catch(() => [null]);

    // Get NAICS title
    const [naicsRow] = await sql`SELECT title FROM naics_codes WHERE code = ${naicsCode}`.catch(() => [null]);
    const sectorName = naicsRow?.title || `NAICS ${naicsCode}`;

    const context = { naicsCode, sectorName, fredData, benchmarks };

    const raw = await callClaude(
      `You are a market analyst. Generate a concise sector brief (500 words max) as JSON. Use ONLY provided data.

DATA:
${JSON.stringify(context, null, 2)}

Output JSON with keys: title, summary (2-3 sentences), keyMetrics (object), outlook (1 paragraph), risks (array of 3 strings), opportunities (array of 3 strings). No markdown fences.`,
      [{ role: 'user', content: 'Generate sector brief.' }],
    );

    const cleaned = raw.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    const brief: SectorBrief = {
      naicsCode,
      title: parsed.title || sectorName,
      generatedAt: new Date().toISOString(),
      summary: parsed.summary || '',
      keyMetrics: parsed.keyMetrics || {},
      outlook: parsed.outlook || '',
      risks: parsed.risks || [],
      opportunities: parsed.opportunities || [],
    };

    // Cache for 7 days
    await sql`
      INSERT INTO market_data_cache (source, cache_key, data, expires_at)
      VALUES ('sector_analysis', ${naicsCode}, ${JSON.stringify(brief)}, NOW() + INTERVAL '7 days')
      ON CONFLICT (source, cache_key) DO UPDATE SET
        data = ${JSON.stringify(brief)}, fetched_at = NOW(), expires_at = NOW() + INTERVAL '7 days'
    `.catch(() => {});

    return brief;
  } catch (err: any) {
    console.error('Sector analysis generation error:', err.message);
    return null;
  }
}
