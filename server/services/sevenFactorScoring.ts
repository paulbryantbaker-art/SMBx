/**
 * Seven-Factor Scoring — Scores businesses on the 7 factors that
 * separate a 2× from a 4× multiple on identical cash flow.
 * Uses Claude Haiku for qualitative scoring when enough data exists.
 */
import Anthropic from '@anthropic-ai/sdk';

const HAIKU_MODEL = 'claude-haiku-4-5-20251001';

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export interface SevenFactorScores {
  recurring_revenue: number;      // 1-10
  customer_concentration: number; // 1-10 (lower concentration = higher score)
  owner_dependency: number;       // 1-10 (less dependency = higher score)
  growth_rate: number;            // 1-10
  margin_quality: number;         // 1-10
  financial_cleanliness: number;  // 1-10
  industry_timing: number;        // 1-10
}

export function calculateCompositeScore(scores: Partial<SevenFactorScores>): number {
  return Object.values(scores).reduce((sum: number, v) => sum + (typeof v === 'number' ? v : 0), 0);
}

export function scoredFactorCount(scores: Partial<SevenFactorScores>): number {
  return Object.values(scores).filter(v => typeof v === 'number' && v > 0).length;
}

export function compositeToMultipleAdjustment(composite: number): string {
  if (composite >= 56) return 'top_of_range';
  if (composite >= 42) return 'above_average';
  if (composite >= 28) return 'average';
  if (composite >= 14) return 'below_average';
  return 'bottom_of_range';
}

const SCORING_PROMPT = `You are a business valuation analyst. Given the deal information below, score each of the seven valuation factors on a 1-10 scale. Only score factors where you have enough data. Return JSON only.

Scoring guide:
- recurring_revenue: >60% recurring = 8-10, 30-60% = 5-7, <30% = 1-4
- customer_concentration: top client <10% revenue = 8-10, 10-25% = 5-7, >25% = 1-4
- owner_dependency: absentee owner = 9-10, manager-run with owner oversight = 6-8, owner-operator doing daily work = 1-5
- growth_rate: >15% YoY = 8-10, 5-15% = 5-7, flat/declining = 1-4
- margin_quality: above industry average = 8-10, at average = 5-7, below average = 1-4
- financial_cleanliness: reviewed/audited financials = 8-10, reasonable bookkeeping = 5-7, messy/cash-based = 1-4
- industry_timing: strong PE/consolidation tailwinds = 8-10, stable = 5-7, headwinds/declining = 1-4

Respond with ONLY valid JSON. Only include factors you have enough data to score. Example:
{"recurring_revenue": 7, "customer_concentration": 8, "industry_timing": 9}`;

export async function scoreSevenFactors(
  dealFields: Record<string, any>,
): Promise<Partial<SevenFactorScores> | null> {
  // Need at minimum industry + revenue + one qualitative data point
  if (!dealFields.industry || !dealFields.revenue) return null;

  const qualitativeKeys = [
    'employee_count', 'owner_salary', 'sde', 'ebitda',
    'recurring_revenue_pct', 'customer_concentration_pct',
    'owner_dependency', 'growth_rate', 'financial_cleanliness',
  ];
  const hasQualitative = qualitativeKeys.some(k => dealFields[k] !== null && dealFields[k] !== undefined);
  if (!hasQualitative) return null;

  try {
    const dealSummary = Object.entries(dealFields)
      .filter(([, v]) => v !== null && v !== undefined)
      .map(([k, v]) => {
        // Format cents back to dollars for readability
        if (typeof v === 'number' && k.endsWith('_cents')) {
          return `${k.replace(/_cents$/, '')}: $${(v / 100).toLocaleString()}`;
        }
        if (typeof v === 'number' && ['revenue', 'sde', 'ebitda', 'asking_price', 'owner_salary'].includes(k)) {
          return `${k}: $${(v / 100).toLocaleString()}`;
        }
        return `${k}: ${v}`;
      })
      .join('\n');

    const response = await getClient().messages.create({
      model: HAIKU_MODEL,
      max_tokens: 300,
      temperature: 0,
      system: SCORING_PROMPT,
      messages: [{ role: 'user', content: dealSummary }],
    });

    const text = response.content
      .filter(b => b.type === 'text')
      .map(b => (b as any).text)
      .join('');

    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    // Validate scores are 1-10
    const validKeys = [
      'recurring_revenue', 'customer_concentration', 'owner_dependency',
      'growth_rate', 'margin_quality', 'financial_cleanliness', 'industry_timing',
    ];

    const result: Partial<SevenFactorScores> = {};
    for (const key of validKeys) {
      const val = parsed[key];
      if (typeof val === 'number' && val >= 1 && val <= 10) {
        (result as any)[key] = Math.round(val);
      }
    }

    return Object.keys(result).length > 0 ? result : null;
  } catch (err: any) {
    console.error('Seven-factor scoring error:', err.message);
    return null;
  }
}
