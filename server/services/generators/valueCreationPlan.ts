/**
 * Value Creation Plan Generator
 *
 * AI-generated PMI value creation plan with EBITDA bridge,
 * synergy tracking, add-on targets, and exit timeline.
 * Used by PE buyers and sophisticated operators.
 */
import Anthropic from '@anthropic-ai/sdk';

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  return client;
}

export interface ValueCreationPlanInput {
  business_name?: string;
  industry?: string;
  league: string;
  revenue: number;       // cents
  ebitda?: number;       // cents
  sde?: number;          // cents
  purchase_price?: number;
  growth_rate?: number;
  gross_margin?: number;
  employee_count?: number;
  years_in_business?: number;
  customer_concentration?: number;
  recurring_revenue_pct?: number;
  competitive_advantages?: string;
  deal_structure?: string;
  buyer_type?: string;   // 'pe', 'strategic', 'individual', 'search_fund'
  financials?: Record<string, any>;
}

export async function generateValueCreationPlan(input: ValueCreationPlanInput): Promise<string> {
  const anthropic = getClient();
  const fmt = (cents: number) => `$${(cents / 100).toLocaleString()}`;
  const earnings = input.ebitda || input.sde || 0;
  const metric = input.ebitda ? 'EBITDA' : 'SDE';
  const isPE = input.buyer_type === 'pe' || ['L4', 'L5', 'L6'].includes(input.league);

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4500,
    system: `You are a PE operating partner writing a value creation plan for a recently acquired business. Be specific, quantitative where possible, and organized. Output clean markdown. Only reference financial data that was provided — never invent numbers.`,
    messages: [{
      role: 'user',
      content: `Create a Value Creation Plan for this acquisition:

Business: ${input.business_name || 'Target Company'}
Industry: ${input.industry || 'General'}
League: ${input.league}
Revenue: ${fmt(input.revenue)}
${metric}: ${fmt(earnings)}
${input.purchase_price ? `Purchase Price: ${fmt(input.purchase_price)}` : ''}
${input.growth_rate !== undefined ? `Growth Rate: ${input.growth_rate}%` : ''}
${input.gross_margin ? `Gross Margin: ${input.gross_margin}%` : ''}
${input.employee_count ? `Employees: ${input.employee_count}` : ''}
${input.recurring_revenue_pct ? `Recurring Revenue: ${input.recurring_revenue_pct}%` : ''}
${input.customer_concentration ? `Top Customer Concentration: ${input.customer_concentration}%` : ''}
${input.competitive_advantages ? `Strengths: ${input.competitive_advantages}` : ''}
Buyer Type: ${input.buyer_type || (isPE ? 'PE platform' : 'operator')}

Structure the plan as:

# Value Creation Plan — [Business Name]

## Executive Summary
2-3 sentence overview of the value creation thesis.

## EBITDA Bridge (Current → Year 3 Target)
Table showing current ${metric}, each value creation lever, and projected Year 3 ${metric}. Example levers:
- Revenue growth (organic)
- Pricing optimization
- Cost reduction
- Operational efficiency
- Margin improvement

Format as a bridge table with estimated dollar impact for each lever.

## Revenue Growth Initiatives
3-5 specific initiatives with:
- Description
- Expected revenue impact (% or range)
- Timeline to implement
- Investment required
- Confidence level (High/Medium/Low)

## Margin Improvement Levers
3-5 specific cost reduction or efficiency improvements. For each:
- Current state vs target
- Expected EBITDA impact
- Implementation timeline
- Risks

## Operational Excellence
Key operational improvements: systems, processes, technology, team upgrades.

${isPE ? `## Add-On Acquisition Targets
2-3 types of add-on acquisitions that could accelerate growth:
- Target profile (size, geography, capability)
- Strategic rationale
- Expected multiple (lower than platform)
- Integration complexity

## Exit Strategy
- Target exit timeline (Year 3-5)
- Expected exit multiple vs entry multiple
- Potential exit paths (strategic sale, secondary buyout, IPO)
- Target MOIC and IRR` : `## Growth Roadmap
12-month priority roadmap with quarterly milestones.`}

## KPI Dashboard
Key metrics to track weekly/monthly:
| KPI | Current | Year 1 Target | Year 3 Target |
(Include 8-10 operational and financial KPIs)

## Risk Factors
Top 3-5 risks to the value creation plan with mitigation strategies.`,
    }],
  });

  return response.content[0].type === 'text' ? response.content[0].text : '';
}
