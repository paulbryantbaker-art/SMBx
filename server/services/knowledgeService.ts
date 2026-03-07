/**
 * Knowledge Service — intelligent context injection for Yulia's prompts.
 *
 * Caches knowledge files in memory at startup, queries DB for live
 * benchmark and comparable transaction data, and selects the right
 * knowledge slices based on gate/journey/industry context.
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import postgres from 'postgres';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..', '..');

// ─── File cache ──────────────────────────────────────────────────

const fileCache = new Map<string, string>();

function getKnowledge(filename: string): string {
  if (fileCache.has(filename)) return fileCache.get(filename)!;
  try {
    const content = readFileSync(resolve(PROJECT_ROOT, filename), 'utf-8');
    fileCache.set(filename, content);
    return content;
  } catch {
    return '';
  }
}

// ─── Industry profile extraction ─────────────────────────────────

/** NAICS code → industry name fragment for matching profile sections */
const NAICS_PROFILE_MAP: Record<string, string> = {
  '238220': 'HVAC',
  '561710': 'Pest Control',
  '561730': 'Landscaping',
  '238220P': 'Plumbing',      // Plumbing shares NAICS with HVAC — use P suffix
  '238210': 'Plumbing',
  '238210E': 'Electrical',
  '238210C': 'Electrical',
  '561720': 'Commercial Cleaning',
  '561710R': 'Residential Cleaning',
  '238160': 'Roofing',
  '561790': 'Pool Service',
  '811111': 'Auto Repair',
  '811192': 'Car Wash',
  '531130': 'Self-Storage',
  '812310': 'Laundromat',
  '621210': 'Dental',
  '621320': 'Optometry',
  '541940': 'Veterinary',
  '621340': 'Physical Therapy',
  '621610': 'Home Healthcare',
  '446110': 'Pharmacy',
  '812111': 'Hair Salon',
  '713940': 'Fitness',
  '541211': 'CPA',
  '561320': 'Staffing',
  '541512': 'IT Services',
  '541810': 'Marketing',
  '524210': 'Insurance',
  '332710': 'Contract Manufacturing',
  '311999': 'Food Manufacturing',
  '484110': 'Trucking',
  '493110': 'Logistics',
  '511210': 'SaaS',
  '454110': 'eCommerce',
  '812210': 'Funeral',
  '624410': 'Childcare',
  '999999': 'Franchise',
};

/**
 * Extract the specific industry profile section from YULIA_INDUSTRY_PROFILES.md.
 * Returns just the ~60-80 lines for the matching industry, not all 35.
 */
function getIndustryProfile(naicsCode: string | null): string | null {
  if (!naicsCode) return null;

  const profileContent = getKnowledge('YULIA_INDUSTRY_PROFILES.md');
  if (!profileContent) return null;

  // Try direct NAICS match first, then fuzzy match on industry name
  const industryName = NAICS_PROFILE_MAP[naicsCode];
  if (!industryName) return null;

  const lines = profileContent.split('\n');
  let startLine = -1;
  let endLine = lines.length;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('## ') && line.includes(industryName)) {
      startLine = i;
    } else if (startLine >= 0 && line.startsWith('## ') && i > startLine) {
      endLine = i;
      break;
    }
  }

  if (startLine < 0) return null;
  return lines.slice(startLine, endLine).join('\n');
}

// ─── Database queries ────────────────────────────────────────────

let _sql: ReturnType<typeof postgres> | null = null;

function getSql(): ReturnType<typeof postgres> {
  if (!_sql) {
    _sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });
  }
  return _sql;
}

/**
 * Get NAICS benchmark data for a specific industry.
 * Returns formatted text block for prompt injection.
 */
export async function getNaicsBenchmarkContext(naicsCode: string): Promise<string | null> {
  try {
    const db = getSql();
    const rows = await db`
      SELECT naics_label, sde_multiple_low, sde_multiple_mid, sde_multiple_high,
             ebitda_multiple_low, ebitda_multiple_mid, ebitda_multiple_high,
             revenue_multiple_low, revenue_multiple_high,
             typical_sde_margin_low, typical_sde_margin_high,
             consolidation_level, sba_approval_rate, buyer_competition,
             boomer_ownership_pct
      FROM naics_benchmarks
      WHERE naics_code = ${naicsCode} AND state IS NULL
      LIMIT 1
    `;
    if (rows.length === 0) return null;

    const b = rows[0];
    const lines = [
      `## LIVE BENCHMARK DATA — ${b.naics_label || naicsCode}`,
      `SDE Multiple Range: ${b.sde_multiple_low}x – ${b.sde_multiple_mid}x – ${b.sde_multiple_high}x (low/mid/high)`,
      `EBITDA Multiple Range: ${b.ebitda_multiple_low}x – ${b.ebitda_multiple_mid}x – ${b.ebitda_multiple_high}x`,
      `Revenue Multiple Range: ${b.revenue_multiple_low}x – ${b.revenue_multiple_high}x`,
      `Typical SDE Margin: ${b.typical_sde_margin_low}% – ${b.typical_sde_margin_high}%`,
      `Consolidation Level: ${b.consolidation_level || 'Unknown'}`,
      `SBA Approval Rate: ${b.sba_approval_rate || 'Unknown'}`,
      `Buyer Competition: ${b.buyer_competition || 'Unknown'}`,
      b.boomer_ownership_pct ? `Baby Boomer Ownership: ${b.boomer_ownership_pct}%` : null,
    ].filter(Boolean);

    return lines.join('\n');
  } catch {
    return null;
  }
}

/**
 * Get comparable closed deal statistics for a NAICS/league combination.
 * Returns formatted summary of deal patterns since 2022.
 */
export async function getClosedDealContext(
  naicsCode: string,
  league?: string | null,
): Promise<string | null> {
  try {
    const db = getSql();

    // Get aggregate stats for matching deals since 2022
    const stats = await db`
      SELECT
        COUNT(*)::int as deal_count,
        ROUND(AVG(sde_multiple), 2) as avg_sde_multiple,
        ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY sde_multiple), 2) as median_sde_multiple,
        ROUND(AVG(ebitda_multiple), 2) as avg_ebitda_multiple,
        ROUND(AVG(cash_at_close_pct), 0) as avg_cash_pct,
        ROUND(AVG(seller_note_pct), 0) as avg_note_pct,
        ROUND(AVG(earnout_pct), 0) as avg_earnout_pct,
        ROUND(AVG(time_on_market_days), 0) as avg_dom,
        ROUND(AVG(price_vs_ask_pct), 0) as avg_price_vs_ask,
        SUM(CASE WHEN sba_financed THEN 1 ELSE 0 END)::int as sba_count,
        SUM(CASE WHEN competitive_process THEN 1 ELSE 0 END)::int as competitive_count
      FROM closed_deals
      WHERE naics_code = ${naicsCode}
        AND closed_year >= 2022
        ${league ? db`AND deal_size_league = ${league}` : db``}
    `;

    if (stats.length === 0 || stats[0].deal_count === 0) return null;

    const s = stats[0];
    const lines = [
      `## COMPARABLE TRANSACTIONS — ${s.deal_count} deals since 2022${league ? ` (${league})` : ''}`,
      `Median SDE Multiple: ${s.median_sde_multiple}x (avg ${s.avg_sde_multiple}x)`,
      `Avg EBITDA Multiple: ${s.avg_ebitda_multiple}x`,
      `Typical Structure: ${s.avg_cash_pct}% cash / ${s.avg_note_pct}% seller note / ${s.avg_earnout_pct}% earnout`,
      `Avg Days on Market: ${s.avg_dom}`,
      `Avg Price vs Ask: ${s.avg_price_vs_ask}%`,
      `SBA Financed: ${s.sba_count} of ${s.deal_count} (${Math.round((s.sba_count / s.deal_count) * 100)}%)`,
      `Competitive Process: ${s.competitive_count} of ${s.deal_count} (${Math.round((s.competitive_count / s.deal_count) * 100)}%)`,
    ];

    return lines.join('\n');
  } catch {
    return null;
  }
}

// ─── Smart knowledge context builder ─────────────────────────────

/** Gates where valuation knowledge should be injected */
const VALUATION_GATES = new Set([
  'S0', 'S1', 'S2', 'S3', 'S4',
  'B0', 'B1', 'B2', 'B3', 'B4',
]);

/** Gates where negotiation knowledge should be injected */
const NEGOTIATION_GATES = new Set([
  'S3', 'S4', 'S5',
  'B3', 'B4', 'B5',
]);

/** Gates/journeys where industry intelligence should be injected */
const INDUSTRY_INTEL_GATES = new Set(['B0', 'B1']);

export interface KnowledgeContext {
  /** Valuation methodology knowledge */
  valuationMastery: string | null;
  /** Specific industry profile */
  industryProfile: string | null;
  /** Industry intelligence (what to buy, market conditions) */
  industryIntelligence: string | null;
  /** Negotiation playbook */
  negotiationPlaybook: string | null;
  /** Live NAICS benchmark data from DB */
  naicsBenchmark: string | null;
  /** Comparable transaction data from DB */
  closedDeals: string | null;
}

/**
 * Build the knowledge context for a conversation based on gate/journey/industry.
 * This is the brain — it decides what Yulia knows right now.
 */
export async function getKnowledgeForContext(opts: {
  gate: string | null;
  journey: string | null;
  naicsCode: string | null;
  league: string | null;
}): Promise<KnowledgeContext> {
  const { gate, journey, naicsCode, league } = opts;

  const ctx: KnowledgeContext = {
    valuationMastery: null,
    industryProfile: null,
    industryIntelligence: null,
    negotiationPlaybook: null,
    naicsBenchmark: null,
    closedDeals: null,
  };

  // Valuation mastery at valuation-relevant gates
  if (gate && VALUATION_GATES.has(gate)) {
    ctx.valuationMastery = getKnowledge('YULIA_VALUATION_MASTERY.md') || null;
  }

  // Industry profile when we know the NAICS code
  if (naicsCode) {
    ctx.industryProfile = getIndustryProfile(naicsCode);
  }

  // Industry intelligence for buy journey or thesis-forming gates
  if (journey === 'buy' || (gate && INDUSTRY_INTEL_GATES.has(gate))) {
    ctx.industryIntelligence = getKnowledge('YULIA_INDUSTRY_INTELLIGENCE.md') || null;
  }

  // Negotiation playbook at negotiation gates
  if (gate && NEGOTIATION_GATES.has(gate)) {
    ctx.negotiationPlaybook = getKnowledge('YULIA_NEGOTIATION_PLAYBOOK.md') || null;
  }

  // Live DB data when NAICS is known
  if (naicsCode) {
    const [benchmark, deals] = await Promise.all([
      getNaicsBenchmarkContext(naicsCode),
      getClosedDealContext(naicsCode, league),
    ]);
    ctx.naicsBenchmark = benchmark;
    ctx.closedDeals = deals;
  }

  return ctx;
}

/**
 * Format the knowledge context into prompt-ready text blocks.
 * Returns a string to append to the system prompt.
 */
export function formatKnowledgeForPrompt(ctx: KnowledgeContext): string {
  const sections: string[] = [];

  if (ctx.valuationMastery) {
    sections.push(`\n\n---\n# YULIA KNOWLEDGE: VALUATION METHODOLOGY\n${ctx.valuationMastery}`);
  }

  if (ctx.industryProfile) {
    sections.push(`\n\n---\n# YULIA KNOWLEDGE: INDUSTRY PROFILE\n${ctx.industryProfile}`);
  }

  if (ctx.industryIntelligence) {
    sections.push(`\n\n---\n# YULIA KNOWLEDGE: INDUSTRY INTELLIGENCE\n${ctx.industryIntelligence}`);
  }

  if (ctx.negotiationPlaybook) {
    sections.push(`\n\n---\n# YULIA KNOWLEDGE: NEGOTIATION PLAYBOOK\n${ctx.negotiationPlaybook}`);
  }

  if (ctx.naicsBenchmark) {
    sections.push(`\n\n---\n${ctx.naicsBenchmark}`);
  }

  if (ctx.closedDeals) {
    sections.push(`\n\n---\n${ctx.closedDeals}`);
  }

  if (sections.length > 0) {
    sections.unshift(`\n\n---\n# DEEP KNOWLEDGE INJECTION\nThe following knowledge sections are contextually relevant to this conversation. Use this data to give specific, data-driven advice — never generic platitudes. Reference specific multiples, deal structures, and market patterns from this data.`);
  }

  return sections.join('');
}
