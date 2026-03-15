/**
 * Optimization Plan Service — Seller Value Enhancement Engine
 *
 * Generates personalized improvement plans with:
 * - Industry benchmark comparison
 * - Specific action items with timeline and dollar impact
 * - Priority ordering (quick wins → high-impact → strategic)
 * - Progress tracking via optimization_milestones
 *
 * Data sources: YULIA_INDUSTRY_PROFILES.md, transaction_benchmarks table,
 * company_profiles, and deal financials.
 */
import { sql } from '../db.js';
import Anthropic from '@anthropic-ai/sdk';

let anthropicClient: Anthropic | null = null;
function getClient(): Anthropic {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  }
  return anthropicClient;
}

export interface OptimizationAction {
  title: string;
  description: string;
  category: 'revenue' | 'cost_reduction' | 'operational' | 'risk_reduction' | 'documentation' | 'presentation';
  ebitda_impact_cents: number | null;
  valuation_impact_cents: number | null;
  difficulty: 'easy' | 'medium' | 'hard';
  timeline_days: number;
  priority: number; // 1 = highest
}

export interface OptimizationPlan {
  actions: OptimizationAction[];
  summary: string;
  currentValuationLow: number; // cents
  currentValuationHigh: number; // cents
  potentialValuationLow: number; // cents
  potentialValuationHigh: number; // cents
  totalPotentialImpact: number; // cents
  estimatedMonthsToReady: number;
}

interface DealFinancials {
  dealId: number;
  userId: number;
  business_name?: string;
  industry?: string;
  naics_code?: string;
  revenue?: number; // cents
  sde?: number; // cents
  ebitda?: number; // cents
  owner_salary?: number; // cents
  employee_count?: number;
  years_in_business?: number;
  gross_margin?: number; // decimal (0.45 = 45%)
  growth_rate?: number; // decimal
  league: string;
  exit_type?: string;
  financials?: Record<string, any>;
}

/**
 * Generate a comprehensive optimization plan for a seller.
 * Uses Claude to create personalized, industry-specific recommendations.
 */
export async function generateOptimizationPlan(deal: DealFinancials): Promise<OptimizationPlan> {
  // 1. Fetch industry benchmarks if available
  let benchmarks: any = null;
  if (deal.naics_code) {
    const rows = await sql`
      SELECT * FROM transaction_benchmarks
      WHERE naics_code = ${deal.naics_code}
      LIMIT 1
    `;
    benchmarks = rows[0] || null;
  }

  // 2. Calculate current valuation range
  const metric = deal.league >= 'L3' ? 'EBITDA' : 'SDE';
  const earningsCents = metric === 'EBITDA' ? (deal.ebitda || 0) : (deal.sde || 0);
  const earningsDollars = earningsCents / 100;

  const multipleRanges: Record<string, { min: number; max: number }> = {
    L1: { min: 2.0, max: 3.5 },
    L2: { min: 3.0, max: 5.0 },
    L3: { min: 4.0, max: 6.0 },
    L4: { min: 6.0, max: 8.0 },
    L5: { min: 8.0, max: 12.0 },
    L6: { min: 10.0, max: 15.0 },
  };

  const range = multipleRanges[deal.league] || multipleRanges.L1;
  const currentValLow = Math.round(earningsCents * range.min);
  const currentValHigh = Math.round(earningsCents * range.max);

  // 3. Generate optimization plan via Claude
  const client = getClient();
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: `You are an M&A advisor generating a seller value optimization plan. Return ONLY valid JSON.`,
    messages: [{
      role: 'user',
      content: `Generate a value optimization plan for this business:

Business: ${deal.business_name || 'Unknown'}
Industry: ${deal.industry || 'Unknown'}
Revenue: $${((deal.revenue || 0) / 100).toLocaleString()}
${metric}: $${earningsDollars.toLocaleString()}
Employees: ${deal.employee_count || 'Unknown'}
Years in business: ${deal.years_in_business || 'Unknown'}
Gross margin: ${deal.gross_margin ? (deal.gross_margin * 100).toFixed(1) + '%' : 'Unknown'}
Growth rate: ${deal.growth_rate ? (deal.growth_rate * 100).toFixed(1) + '%' : 'Unknown'}
League: ${deal.league}
Exit type: ${deal.exit_type || 'Full sale'}

${benchmarks ? `Industry benchmarks:
- Median multiple: ${benchmarks.median_multiple || 'N/A'}x
- Median margin: ${benchmarks.median_margin ? (benchmarks.median_margin * 100).toFixed(1) + '%' : 'N/A'}
- Median growth: ${benchmarks.median_growth ? (benchmarks.median_growth * 100).toFixed(1) + '%' : 'N/A'}` : ''}

Generate 6-10 specific improvement actions. Each action MUST include:
- A clear, actionable title (imperative verb)
- Specific description with concrete steps
- Category: one of "revenue", "cost_reduction", "operational", "risk_reduction", "documentation", "presentation"
- ebitda_impact_dollars: estimated annual EBITDA improvement in dollars (null if not directly quantifiable)
- valuation_impact_dollars: estimated one-time valuation impact in dollars
- difficulty: "easy", "medium", or "hard"
- timeline_days: estimated days to complete
- priority: 1 (highest) to 10 (lowest)

Order by: quick wins first (easy + high impact), then strategic improvements.

Return JSON in this exact format:
{
  "summary": "2-3 sentence overview of the optimization opportunity",
  "actions": [{ "title": "...", "description": "...", "category": "...", "ebitda_impact_dollars": 0, "valuation_impact_dollars": 0, "difficulty": "...", "timeline_days": 0, "priority": 0 }],
  "estimated_months_to_ready": 0
}`,
    }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  let parsed: any;
  try {
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
  } catch {
    // Fallback: generate basic plan
    parsed = generateFallbackPlan(deal, earningsDollars, metric);
  }

  // 4. Convert dollars to cents and build plan
  const actions: OptimizationAction[] = (parsed.actions || []).map((a: any) => ({
    title: a.title,
    description: a.description,
    category: a.category || 'operational',
    ebitda_impact_cents: a.ebitda_impact_dollars ? Math.round(a.ebitda_impact_dollars * 100) : null,
    valuation_impact_cents: a.valuation_impact_dollars ? Math.round(a.valuation_impact_dollars * 100) : null,
    difficulty: a.difficulty || 'medium',
    timeline_days: a.timeline_days || 90,
    priority: a.priority || 5,
  }));

  const totalImpact = actions.reduce(
    (sum, a) => sum + (a.valuation_impact_cents || 0), 0,
  );

  return {
    actions,
    summary: parsed.summary || 'Optimization plan generated.',
    currentValuationLow: currentValLow,
    currentValuationHigh: currentValHigh,
    potentialValuationLow: currentValLow + Math.round(totalImpact * 0.5),
    potentialValuationHigh: currentValHigh + totalImpact,
    totalPotentialImpact: totalImpact,
    estimatedMonthsToReady: parsed.estimated_months_to_ready || 6,
  };
}

/**
 * Save optimization plan actions to the database.
 */
export async function saveOptimizationPlan(
  companyProfileId: number,
  plan: OptimizationPlan,
): Promise<number[]> {
  const ids: number[] = [];

  for (const action of plan.actions) {
    const [row] = await sql`
      INSERT INTO improvement_actions (
        company_profile_id, title, description, category,
        ebitda_impact_cents, valuation_impact_cents,
        difficulty, timeline_days, status
      ) VALUES (
        ${companyProfileId}, ${action.title}, ${action.description},
        ${action.category}, ${action.ebitda_impact_cents},
        ${action.valuation_impact_cents}, ${action.difficulty},
        ${action.timeline_days}, 'not_started'
      )
      ON CONFLICT DO NOTHING
      RETURNING id
    `;
    if (row) ids.push(row.id as number);
  }

  return ids;
}

/**
 * Create optimization milestones for tracking progress over time.
 */
export async function createOptimizationMilestone(
  dealId: number,
  data: {
    milestone_type: 'plan_created' | 'action_completed' | 'valuation_refresh' | 'quarterly_review';
    description: string;
    valuation_snapshot_low?: number;
    valuation_snapshot_high?: number;
    actions_completed?: number;
    actions_total?: number;
  },
): Promise<void> {
  await sql`
    INSERT INTO optimization_milestones (
      deal_id, milestone_type, description,
      valuation_snapshot_low, valuation_snapshot_high,
      actions_completed, actions_total
    ) VALUES (
      ${dealId}, ${data.milestone_type}, ${data.description},
      ${data.valuation_snapshot_low || null}, ${data.valuation_snapshot_high || null},
      ${data.actions_completed || null}, ${data.actions_total || null}
    )
  `;
}

/**
 * Get optimization timeline (all milestones for a deal).
 */
export async function getOptimizationTimeline(dealId: number) {
  return sql`
    SELECT * FROM optimization_milestones
    WHERE deal_id = ${dealId}
    ORDER BY created_at ASC
  `;
}

/**
 * Check if re-engagement is needed (no activity in N days).
 */
export async function checkReEngagement(dealId: number): Promise<{
  needsReEngagement: boolean;
  daysSinceLastActivity: number;
  suggestion?: string;
}> {
  const [latest] = await sql`
    SELECT created_at FROM optimization_milestones
    WHERE deal_id = ${dealId}
    ORDER BY created_at DESC LIMIT 1
  `;

  if (!latest) {
    return { needsReEngagement: false, daysSinceLastActivity: 0 };
  }

  const daysSince = Math.floor(
    (Date.now() - new Date(latest.created_at as string).getTime()) / (1000 * 60 * 60 * 24),
  );

  if (daysSince >= 90) {
    return {
      needsReEngagement: true,
      daysSinceLastActivity: daysSince,
      suggestion: 'It\'s been 3 months since your last optimization update. Let\'s review your progress and refresh your valuation.',
    };
  } else if (daysSince >= 30) {
    return {
      needsReEngagement: true,
      daysSinceLastActivity: daysSince,
      suggestion: 'You have improvement actions in progress. Let\'s check in on your progress and see how they\'re impacting your valuation.',
    };
  } else if (daysSince >= 7) {
    return {
      needsReEngagement: true,
      daysSinceLastActivity: daysSince,
      suggestion: 'Have you made progress on any of your improvement actions this week?',
    };
  }

  return { needsReEngagement: false, daysSinceLastActivity: daysSince };
}

// Fallback plan when AI generation fails
function generateFallbackPlan(deal: DealFinancials, earnings: number, metric: string) {
  const actions = [
    {
      title: 'Document all recurring revenue streams',
      description: 'Create a detailed schedule of all recurring/repeat revenue with contract terms, renewal rates, and customer concentration analysis.',
      category: 'documentation',
      ebitda_impact_dollars: null,
      valuation_impact_dollars: Math.round(earnings * 0.15),
      difficulty: 'easy',
      timeline_days: 14,
      priority: 1,
    },
    {
      title: 'Normalize owner compensation to market rate',
      description: `Review owner compensation vs market salary for the role. Any excess compensation above market becomes an add-back to ${metric}, directly increasing valuation.`,
      category: 'presentation',
      ebitda_impact_dollars: Math.round(earnings * 0.05),
      valuation_impact_dollars: Math.round(earnings * 0.15),
      difficulty: 'easy',
      timeline_days: 7,
      priority: 2,
    },
    {
      title: 'Identify and document all valid add-backs',
      description: 'Review all expenses for legitimate add-backs: one-time expenses, above-market rent (related party), personal expenses, non-recurring professional fees.',
      category: 'documentation',
      ebitda_impact_dollars: Math.round(earnings * 0.08),
      valuation_impact_dollars: Math.round(earnings * 0.25),
      difficulty: 'easy',
      timeline_days: 21,
      priority: 3,
    },
    {
      title: 'Reduce customer concentration risk',
      description: 'If any single customer represents >15% of revenue, develop a plan to diversify. Document specific initiatives to reduce concentration.',
      category: 'risk_reduction',
      ebitda_impact_dollars: null,
      valuation_impact_dollars: Math.round(earnings * 0.20),
      difficulty: 'hard',
      timeline_days: 180,
      priority: 4,
    },
    {
      title: 'Implement management operating system',
      description: 'Document SOPs, KPIs, and management dashboards. A business that runs without the owner commands a 0.5-1.0x higher multiple.',
      category: 'operational',
      ebitda_impact_dollars: null,
      valuation_impact_dollars: Math.round(earnings * 0.50),
      difficulty: 'hard',
      timeline_days: 120,
      priority: 5,
    },
    {
      title: 'Clean up financial statements',
      description: 'Ensure 3 years of clean P&L, balance sheet, and tax returns. Reconcile any discrepancies. Consider reviewed or compiled statements.',
      category: 'documentation',
      ebitda_impact_dollars: null,
      valuation_impact_dollars: Math.round(earnings * 0.10),
      difficulty: 'medium',
      timeline_days: 30,
      priority: 6,
    },
  ];

  return {
    summary: `Based on your ${metric} of $${earnings.toLocaleString()}, we've identified ${actions.length} improvement areas that could increase your valuation by 15-40% over the next 6-12 months.`,
    actions,
    estimated_months_to_ready: 6,
  };
}
