/**
 * Executive Summary Generator
 *
 * AI-generated 2-page executive summary for targeted buyer/investor outreach.
 * Concise, professional, and league-adaptive.
 */
import Anthropic from '@anthropic-ai/sdk';

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  return client;
}

export interface ExecutiveSummaryInput {
  business_name?: string;
  industry?: string;
  location?: string;
  league: string;
  revenue: number;       // cents
  sde?: number;          // cents
  ebitda?: number;       // cents
  asking_price?: number; // cents
  owner_salary?: number;
  growth_rate?: number;
  years_in_business?: number;
  employee_count?: number;
  recurring_revenue_pct?: number;
  gross_margin?: number;
  competitive_advantages?: string;
  growth_opportunities?: string;
  reason_for_selling?: string;
  products_services?: string;
  customer_profile?: string;
  financials?: Record<string, any>;
}

export async function generateExecutiveSummary(input: ExecutiveSummaryInput): Promise<string> {
  const anthropic = getClient();
  const earnings = input.ebitda || input.sde || 0;
  const metric = input.ebitda ? 'EBITDA' : 'SDE';
  const fmt = (cents: number) => `$${(cents / 100).toLocaleString()}`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3000,
    system: `You are a senior M&A advisor writing a concise executive summary for a business sale. Write exactly 2 pages worth of content — professional, factual, compelling. Output clean markdown. Do NOT invent financial numbers — use only what is provided.`,
    messages: [{
      role: 'user',
      content: `Write an Executive Summary for this business:

Business: ${input.business_name || 'Target Company'}
Industry: ${input.industry || 'General'}
Location: ${input.location || 'United States'}
League: ${input.league}
Revenue: ${fmt(input.revenue)}
${metric}: ${fmt(earnings)}
${input.asking_price ? `Asking Price: ${fmt(input.asking_price)}` : ''}
${input.growth_rate !== undefined ? `Growth Rate: ${input.growth_rate}%` : ''}
${input.years_in_business ? `Years in Business: ${input.years_in_business}` : ''}
${input.employee_count ? `Employees: ${input.employee_count}` : ''}
${input.recurring_revenue_pct ? `Recurring Revenue: ${input.recurring_revenue_pct}%` : ''}
${input.gross_margin ? `Gross Margin: ${input.gross_margin}%` : ''}
${input.competitive_advantages ? `Competitive Advantages: ${input.competitive_advantages}` : ''}
${input.growth_opportunities ? `Growth Opportunities: ${input.growth_opportunities}` : ''}
${input.reason_for_selling ? `Reason for Sale: ${input.reason_for_selling}` : ''}
${input.products_services ? `Products/Services: ${input.products_services}` : ''}
${input.customer_profile ? `Customer Profile: ${input.customer_profile}` : ''}

Structure the executive summary with these sections:

# Executive Summary — [Business Name]

## Investment Opportunity
Brief overview of the opportunity and why it's compelling.

## Business Overview
What the business does, how long it's operated, its market position.

## Financial Highlights
Key financial metrics in a concise table or bullet format. Use ONLY the numbers provided.

## Growth Potential
2-3 concrete growth opportunities.

## Transaction Overview
Deal size, preferred structure, timeline expectations.

## Next Steps
How interested parties should proceed.

Keep it concise and professional. ${input.league >= 'L3' ? 'This is a middle-market deal — use institutional-quality language.' : 'This is a Main Street deal — keep it accessible but professional.'}`,
    }],
  });

  return response.content[0].type === 'text' ? response.content[0].text : '';
}
