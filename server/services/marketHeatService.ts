/**
 * Market Heat Service — scores industries on a 1-5 heat scale.
 *
 * Sources:
 * - Industry knowledge profiles (PE activity from YULIA_INDUSTRY_PROFILES.md)
 * - Active buyer thesis count for the industry
 * - Known consolidation verticals
 */
import { sql } from '../db.js';

export interface MarketHeat {
  score: number;        // 1-5
  label: string;        // "Super-Hot", "Hot", etc.
  peActivity: string;   // description of PE interest
  multipleDirection: 'expanding' | 'stable' | 'contracting';
  signals: string[];    // specific market signals
}

const HEAT_LABELS: Record<number, string> = {
  1: 'Cold',
  2: 'Cool',
  3: 'Warm',
  4: 'Hot',
  5: 'Super-Hot',
};

// Known hot verticals with PE roll-up activity (curated from methodology)
const PE_ROLL_UP_VERTICALS: Record<string, { baseScore: number; peActivity: string; direction: 'expanding' | 'stable' | 'contracting' }> = {
  'hvac': { baseScore: 5, peActivity: '14+ PE platforms actively acquiring', direction: 'expanding' },
  'plumbing': { baseScore: 4, peActivity: 'Multiple PE platforms consolidating', direction: 'expanding' },
  'electrical': { baseScore: 4, peActivity: 'Growing PE consolidation wave', direction: 'expanding' },
  'pest control': { baseScore: 5, peActivity: 'Anticimex, Rentokil, Rollins all acquiring', direction: 'expanding' },
  'veterinary': { baseScore: 5, peActivity: 'Mars, NVA, VCA driving aggressive consolidation', direction: 'expanding' },
  'dental': { baseScore: 5, peActivity: 'DSO consolidation accelerating — 100+ active buyers', direction: 'expanding' },
  'optometry': { baseScore: 4, peActivity: 'PE-backed optometry groups expanding', direction: 'expanding' },
  'msp': { baseScore: 4, peActivity: 'IT managed services consolidation active', direction: 'stable' },
  'landscaping': { baseScore: 3, peActivity: 'Emerging PE interest in home services', direction: 'expanding' },
  'home services': { baseScore: 3, peActivity: 'Broad home services consolidation', direction: 'expanding' },
  'insurance': { baseScore: 4, peActivity: 'Insurance brokerage roll-ups dominant', direction: 'stable' },
  'accounting': { baseScore: 3, peActivity: 'PE entering CPA firm consolidation', direction: 'expanding' },
  'saas': { baseScore: 4, peActivity: 'Strong PE demand for recurring revenue', direction: 'stable' },
  'software': { baseScore: 4, peActivity: 'Vertical SaaS and B2B software in demand', direction: 'stable' },
  'manufacturing': { baseScore: 3, peActivity: 'Selective PE interest in specialized manufacturing', direction: 'stable' },
  'construction': { baseScore: 2, peActivity: 'Limited PE activity, individual buyers dominate', direction: 'stable' },
  'restaurant': { baseScore: 2, peActivity: 'Multi-unit operators attract interest', direction: 'stable' },
  'coffee': { baseScore: 2, peActivity: 'Limited institutional demand', direction: 'stable' },
  'ecommerce': { baseScore: 3, peActivity: 'Aggregators active for FBA/DTC brands', direction: 'contracting' },
  'staffing': { baseScore: 3, peActivity: 'Staffing consolidation ongoing', direction: 'stable' },
  'auto repair': { baseScore: 3, peActivity: 'Emerging consolidation in auto services', direction: 'expanding' },
  'fitness': { baseScore: 3, peActivity: 'Franchise fitness models attract PE', direction: 'stable' },
  'healthcare': { baseScore: 4, peActivity: 'Healthcare services broadly in demand', direction: 'expanding' },
  'physical therapy': { baseScore: 4, peActivity: 'PT clinic consolidation active', direction: 'expanding' },
};

/**
 * Normalize an industry string to match our lookup keys.
 */
function normalizeIndustry(industry: string): string {
  return industry.toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Find the best matching vertical for a given industry.
 */
function matchVertical(industry: string): string | null {
  const normalized = normalizeIndustry(industry);
  // Direct match
  if (PE_ROLL_UP_VERTICALS[normalized]) return normalized;
  // Substring match
  for (const key of Object.keys(PE_ROLL_UP_VERTICALS)) {
    if (normalized.includes(key) || key.includes(normalized)) return key;
  }
  // Keyword match
  const keywords: Record<string, string[]> = {
    'hvac': ['heating', 'cooling', 'air conditioning', 'furnace'],
    'dental': ['dentist', 'orthodont'],
    'veterinary': ['vet', 'animal hospital', 'pet clinic'],
    'msp': ['managed service', 'it services', 'it support'],
    'pest control': ['exterminator', 'termite'],
    'saas': ['subscription software', 'cloud software'],
    'ecommerce': ['online store', 'amazon', 'shopify', 'dtc', 'fba'],
    'restaurant': ['food service', 'dining', 'cafe'],
    'construction': ['general contractor', 'builder', 'roofing', 'siding'],
    'healthcare': ['medical', 'clinic', 'health'],
    'physical therapy': ['pt clinic', 'rehab'],
    'insurance': ['insurance agency', 'insurance broker'],
  };
  for (const [vertical, kws] of Object.entries(keywords)) {
    if (kws.some(kw => normalized.includes(kw))) return vertical;
  }
  return null;
}

/**
 * Get market heat score for an industry.
 */
export async function getMarketHeat(industry: string): Promise<MarketHeat> {
  const vertical = matchVertical(industry);
  const signals: string[] = [];

  let baseScore = 2; // Default: Cool
  let peActivity = 'Limited institutional buyer activity';
  let direction: 'expanding' | 'stable' | 'contracting' = 'stable';

  if (vertical && PE_ROLL_UP_VERTICALS[vertical]) {
    const v = PE_ROLL_UP_VERTICALS[vertical];
    baseScore = v.baseScore;
    peActivity = v.peActivity;
    direction = v.direction;
    signals.push(`Known PE consolidation vertical: ${vertical}`);
  }

  // Check active buyer theses for this industry
  try {
    const thesisCount = await sql`
      SELECT COUNT(*) as cnt FROM buyer_theses
      WHERE status = 'active'
        AND (
          industries::text ILIKE ${`%${industry}%`}
          OR target_description ILIKE ${`%${industry}%`}
        )
    `;
    const cnt = parseInt(thesisCount[0]?.cnt || '0');
    if (cnt >= 5) {
      baseScore = Math.min(baseScore + 1, 5);
      signals.push(`${cnt} active buyer theses targeting this industry`);
    } else if (cnt >= 2) {
      signals.push(`${cnt} active buyer theses in this space`);
    } else if (cnt === 0) {
      signals.push('No active buyer theses for this industry on platform');
    }
  } catch { /* table may not exist */ }

  // Cap score at 5
  const score = Math.max(1, Math.min(5, baseScore));

  return {
    score,
    label: HEAT_LABELS[score] || 'Unknown',
    peActivity,
    multipleDirection: direction,
    signals,
  };
}

/**
 * Format market heat for prompt injection.
 */
export function formatMarketHeatForPrompt(heat: MarketHeat, industry: string): string {
  const lines = [
    `\n## MARKET HEAT — ${industry.toUpperCase()}`,
    `Heat Score: ${heat.score}/5 (${heat.label})`,
    `PE Activity: ${heat.peActivity}`,
    `Multiple Direction: ${heat.multipleDirection}`,
  ];
  if (heat.signals.length > 0) {
    lines.push('Signals:');
    for (const s of heat.signals) lines.push(`- ${s}`);
  }
  lines.push('Use this market context when discussing valuations, buyer pools, and deal timelines. Reference specific signals naturally in conversation.');
  return lines.join('\n');
}
