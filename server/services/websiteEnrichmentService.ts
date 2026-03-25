/**
 * Website Enrichment Service — Extracts structured business data from websites.
 *
 * Uses Claude Haiku to analyze scraped website content and extract:
 * - Years in business / founding date
 * - Services offered
 * - Team size indicators
 * - Location details
 * - Succession / sale readiness signals
 * - Technology stack (for tech businesses)
 */
import Anthropic from '@anthropic-ai/sdk';
import { sql } from '../db.js';

const anthropic = new Anthropic();

export interface WebsiteEnrichment {
  url: string;
  companyName: string | null;
  yearFounded: number | null;
  yearsInBusiness: number | null;
  services: string[];
  teamSizeEstimate: string | null; // "1-5", "6-20", "21-50", "50+"
  locations: string[];
  successionSignals: string[];
  technologyStack: string[];
  keyFindings: string[];
  rawExcerpts: string[];
  confidence: 'high' | 'medium' | 'low';
}

const ENRICHMENT_PROMPT = `You are a business analyst extracting structured data from a company's website for M&A deal evaluation.

Analyze the website content below and extract:

1. **Company Name**: The business name
2. **Year Founded**: If mentioned (look for "since 19XX", "established in", "XX years of experience")
3. **Services**: List of services or products offered
4. **Team Size**: Any indicators of team size (employee count, team page, "our team of X")
5. **Locations**: Physical locations mentioned
6. **Succession Signals**: Any hints the business might be for sale or owner is retiring:
   - Owner age/retirement mentions
   - "looking for partners" or "growth opportunity"
   - Outdated website (copyright years old)
   - Legacy technology or branding
   - "family-owned" + long history
7. **Technology**: Any tech stack or software mentioned
8. **Key Findings**: 2-3 bullet points most relevant for acquisition analysis

Respond in JSON format:
{
  "companyName": "string or null",
  "yearFounded": "number or null",
  "services": ["string"],
  "teamSizeEstimate": "1-5 | 6-20 | 21-50 | 50+ | null",
  "locations": ["string"],
  "successionSignals": ["string"],
  "technologyStack": ["string"],
  "keyFindings": ["string"],
  "confidence": "high | medium | low"
}`;

/**
 * Fetch and analyze a company website for enrichment data.
 */
export async function enrichCompanyWebsite(
  websiteUrl: string,
  companyProfileId?: number,
): Promise<WebsiteEnrichment | null> {
  // Check cache first
  if (companyProfileId) {
    const [profile] = await sql`
      SELECT enrichment_data, enriched_at FROM company_profiles
      WHERE id = ${companyProfileId} AND enriched_at > NOW() - INTERVAL '30 days'
    `.catch(() => [null]);

    if (profile?.enrichment_data) {
      return profile.enrichment_data as WebsiteEnrichment;
    }
  }

  // Fetch the website
  let pageContent: string;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(websiteUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SMBxBot/1.0; +https://smbx.ai)',
        'Accept': 'text/html',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return null;

    const html = await res.text();
    // Strip HTML tags, scripts, styles — keep text content
    pageContent = stripHtml(html);

    if (pageContent.length < 50) return null; // Too little content
    // Cap at ~8000 chars to keep Haiku cost low
    if (pageContent.length > 8000) pageContent = pageContent.substring(0, 8000);
  } catch {
    return null;
  }

  // Analyze with Claude Haiku
  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `${ENRICHMENT_PROMPT}\n\n---\nWEBSITE URL: ${websiteUrl}\n\nWEBSITE CONTENT:\n${pageContent}`,
        },
      ],
    });

    const text = response.content[0]?.type === 'text' ? response.content[0].text : '';
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);

    const currentYear = new Date().getFullYear();
    const enrichment: WebsiteEnrichment = {
      url: websiteUrl,
      companyName: parsed.companyName || null,
      yearFounded: parsed.yearFounded || null,
      yearsInBusiness: parsed.yearFounded ? currentYear - parsed.yearFounded : null,
      services: parsed.services || [],
      teamSizeEstimate: parsed.teamSizeEstimate || null,
      locations: parsed.locations || [],
      successionSignals: parsed.successionSignals || [],
      technologyStack: parsed.technologyStack || [],
      keyFindings: parsed.keyFindings || [],
      rawExcerpts: [],
      confidence: parsed.confidence || 'low',
    };

    // Cache on company profile
    if (companyProfileId) {
      await sql`
        UPDATE company_profiles
        SET enrichment_data = ${JSON.stringify(enrichment)}::jsonb, enriched_at = NOW()
        WHERE id = ${companyProfileId}
      `.catch(() => {});
    }

    return enrichment;
  } catch (err: any) {
    console.error('[enrichment] Claude analysis error:', err.message);
    return null;
  }
}

/**
 * Strip HTML to plain text for analysis.
 */
function stripHtml(html: string): string {
  return html
    // Remove scripts, styles, and their content
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    // Remove all HTML tags
    .replace(/<[^>]+>/g, ' ')
    // Decode common entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, '')
    // Collapse whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Batch enrich multiple discovery targets.
 * Used by worker for background enrichment.
 */
export async function batchEnrichTargets(limit = 10): Promise<{ enriched: number; failed: number }> {
  const targets = await sql`
    SELECT dt.id, dt.company_profile_id, cp.website
    FROM discovery_targets dt
    JOIN company_profiles cp ON cp.id = dt.company_profile_id
    WHERE dt.enrichment_status = 'pending'
      AND cp.website IS NOT NULL
      AND cp.enriched_at IS NULL
    ORDER BY dt.created_at ASC
    LIMIT ${limit}
  `.catch(() => []);

  let enriched = 0;
  let failed = 0;

  for (const target of targets as any[]) {
    const result = await enrichCompanyWebsite(target.website, target.company_profile_id);
    if (result) {
      await sql`UPDATE discovery_targets SET enrichment_status = 'complete' WHERE id = ${target.id}`.catch(() => {});
      enriched++;
    } else {
      await sql`UPDATE discovery_targets SET enrichment_status = 'failed' WHERE id = ${target.id}`.catch(() => {});
      failed++;
    }

    // Rate limit: 1 second between requests
    await new Promise(r => setTimeout(r, 1000));
  }

  return { enriched, failed };
}
