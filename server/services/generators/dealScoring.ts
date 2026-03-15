/**
 * Deal Scoring Generator
 *
 * Deterministic scoring (0-100) across multiple factors + AI narrative.
 * Used for buy-side deal evaluation against acquisition thesis.
 * All financial values in CENTS.
 */
import Anthropic from '@anthropic-ai/sdk';

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  return client;
}

export interface DealScoringInput {
  business_name?: string;
  industry?: string;
  location?: string;
  league: string;
  revenue: number;
  sde?: number;
  ebitda?: number;
  asking_price?: number;
  growth_rate?: number;
  gross_margin?: number;
  recurring_revenue_pct?: number;
  customer_concentration?: number;
  owner_dependency?: string;
  years_in_business?: number;
  employee_count?: number;
  financials?: Record<string, any>;
}

interface ScoreFactor {
  name: string;
  score: number;
  weight: number;
  rationale: string;
}

export async function generateDealScoring(input: DealScoringInput): Promise<Record<string, any>> {
  const factors = scoreFactors(input);
  const weightedTotal = factors.reduce((sum, f) => sum + f.score * f.weight, 0);
  const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0);
  const overallScore = Math.round(weightedTotal / totalWeight);

  const verdict = overallScore >= 80 ? 'Strong Buy' :
                  overallScore >= 65 ? 'Attractive' :
                  overallScore >= 50 ? 'Moderate' :
                  overallScore >= 35 ? 'Below Average' : 'Pass';

  // AI narrative for the summary
  const narrative = await generateNarrative(input, factors, overallScore, verdict);

  return {
    type: 'deal_scoring',
    overall_score: overallScore,
    verdict,
    factors: factors.map(f => ({
      name: f.name,
      score: f.score,
      weight: Math.round(f.weight * 100),
      rationale: f.rationale,
    })),
    narrative,
    generated_at: new Date().toISOString(),
  };
}

function scoreFactors(input: DealScoringInput): ScoreFactor[] {
  const factors: ScoreFactor[] = [];

  // 1. Valuation / Price (weight: 0.20)
  const earnings = input.ebitda || input.sde || 0;
  if (input.asking_price && earnings > 0) {
    const multiple = input.asking_price / earnings;
    const score = multiple <= 2.5 ? 95 : multiple <= 3.5 ? 80 : multiple <= 5 ? 65 : multiple <= 7 ? 45 : 25;
    factors.push({ name: 'Valuation', score, weight: 0.20, rationale: `${multiple.toFixed(1)}x ${input.ebitda ? 'EBITDA' : 'SDE'} multiple` });
  } else {
    factors.push({ name: 'Valuation', score: 50, weight: 0.20, rationale: 'Insufficient data to evaluate' });
  }

  // 2. Revenue Quality (weight: 0.15)
  const recurringScore = (input.recurring_revenue_pct || 0) >= 70 ? 90 :
                          (input.recurring_revenue_pct || 0) >= 40 ? 70 :
                          (input.recurring_revenue_pct || 0) >= 20 ? 50 : 35;
  factors.push({ name: 'Revenue Quality', score: recurringScore, weight: 0.15,
    rationale: input.recurring_revenue_pct ? `${input.recurring_revenue_pct}% recurring revenue` : 'Recurring revenue data not available' });

  // 3. Growth (weight: 0.15)
  const growthScore = (input.growth_rate || 0) >= 20 ? 90 :
                      (input.growth_rate || 0) >= 10 ? 75 :
                      (input.growth_rate || 0) >= 5 ? 60 :
                      (input.growth_rate || 0) >= 0 ? 45 : 25;
  factors.push({ name: 'Growth', score: growthScore, weight: 0.15,
    rationale: input.growth_rate !== undefined ? `${input.growth_rate}% annual growth` : 'Growth data not available' });

  // 4. Margins (weight: 0.15)
  const marginScore = (input.gross_margin || 0) >= 60 ? 90 :
                      (input.gross_margin || 0) >= 45 ? 75 :
                      (input.gross_margin || 0) >= 30 ? 55 : 35;
  factors.push({ name: 'Margins', score: marginScore, weight: 0.15,
    rationale: input.gross_margin ? `${input.gross_margin}% gross margin` : 'Margin data not available' });

  // 5. Customer Concentration (weight: 0.10)
  const concScore = (input.customer_concentration || 0) <= 10 ? 90 :
                    (input.customer_concentration || 0) <= 25 ? 70 :
                    (input.customer_concentration || 0) <= 40 ? 50 : 25;
  factors.push({ name: 'Customer Concentration', score: concScore, weight: 0.10,
    rationale: input.customer_concentration ? `Top customer = ${input.customer_concentration}% of revenue` : 'Concentration data not available' });

  // 6. Owner Dependency (weight: 0.10)
  const depScore = input.owner_dependency === 'low' ? 90 :
                   input.owner_dependency === 'medium' ? 60 :
                   input.owner_dependency === 'high' ? 30 : 55;
  factors.push({ name: 'Owner Dependency', score: depScore, weight: 0.10,
    rationale: input.owner_dependency ? `${input.owner_dependency} dependency` : 'Dependency data not available' });

  // 7. Track Record (weight: 0.10)
  const yearsScore = (input.years_in_business || 0) >= 15 ? 90 :
                     (input.years_in_business || 0) >= 8 ? 75 :
                     (input.years_in_business || 0) >= 3 ? 55 : 30;
  factors.push({ name: 'Track Record', score: yearsScore, weight: 0.10,
    rationale: input.years_in_business ? `${input.years_in_business} years in business` : 'Years data not available' });

  // 8. Team & Scalability (weight: 0.05)
  const teamScore = (input.employee_count || 0) >= 20 ? 85 :
                    (input.employee_count || 0) >= 5 ? 70 :
                    (input.employee_count || 0) >= 2 ? 50 : 35;
  factors.push({ name: 'Team & Scalability', score: teamScore, weight: 0.05,
    rationale: input.employee_count ? `${input.employee_count} employees` : 'Team size not available' });

  return factors;
}

async function generateNarrative(
  input: DealScoringInput, factors: ScoreFactor[], score: number, verdict: string,
): Promise<string> {
  const anthropic = getClient();
  const fmt = (cents: number) => `$${(cents / 100).toLocaleString()}`;

  const factorSummary = factors.map(f => `- ${f.name}: ${f.score}/100 (${f.rationale})`).join('\n');

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    system: 'You are an M&A analyst writing a concise deal scoring narrative. Be direct, factual, and actionable. 3-4 paragraphs max.',
    messages: [{
      role: 'user',
      content: `Write a brief narrative for this deal scorecard:

Business: ${input.business_name || 'Target'}
Industry: ${input.industry || 'General'}
Overall Score: ${score}/100 — ${verdict}

Factor Scores:
${factorSummary}

Revenue: ${fmt(input.revenue)}
${input.ebitda ? `EBITDA: ${fmt(input.ebitda)}` : ''}
${input.sde ? `SDE: ${fmt(input.sde)}` : ''}
${input.asking_price ? `Asking Price: ${fmt(input.asking_price)}` : ''}

Write:
1. One-paragraph summary of the opportunity
2. Key strengths (top 2-3 scoring factors)
3. Key risks (bottom 2-3 scoring factors)
4. Recommendation (proceed / negotiate / pass)`,
    }],
  });

  return response.content[0].type === 'text' ? response.content[0].text : '';
}
