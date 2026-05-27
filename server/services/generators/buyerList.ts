/**
 * Buyer Universe Generator
 *
 * AI-generated categorized buyer-universe map matched to the business profile.
 * Adapts buyer types by league and industry.
 */
import Anthropic from '@anthropic-ai/sdk';

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  return client;
}

export interface BuyerListInput {
  business_name?: string;
  industry?: string;
  location?: string;
  league: string;
  revenue: number;       // cents
  sde?: number;          // cents
  ebitda?: number;       // cents
  asking_price?: number; // cents
  employee_count?: number;
  growth_rate?: number;
  recurring_revenue_pct?: number;
  competitive_advantages?: string;
  products_services?: string;
  financials?: Record<string, any>;
}

export async function generateBuyerList(input: BuyerListInput): Promise<string> {
  const anthropic = getClient();
  const fmt = (cents: number) => `$${(cents / 100).toLocaleString()}`;
  const earnings = input.ebitda || input.sde || 0;
  const metric = input.ebitda ? 'EBITDA' : 'SDE';
  const isMainStreet = ['L1', 'L2'].includes(input.league);

  const buyerCategories = isMainStreet
    ? 'Individual Operators, Search Fund Entrepreneurs, Existing Small Business Owners (bolt-on), Industry Veterans'
    : 'Private Equity Platforms, Strategic Acquirers, Family Offices, Public Company Corporate Development, International Buyers';

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    system: `You are an M&A deal-intelligence specialist generating a qualified buyer-universe map. Output clean markdown. Be specific about buyer categories and what makes each a good fit. Do NOT invent specific company names — use descriptive profiles instead. Do not contact buyers, choose a buyer for the user, or imply transaction-based compensation.`,
    messages: [{
      role: 'user',
      content: `Generate a Qualified Buyer Universe Map for this business:

Business: ${input.business_name || 'Target Company'}
Industry: ${input.industry || 'General'}
Location: ${input.location || 'United States'}
League: ${input.league} (${isMainStreet ? 'Main Street' : 'Middle Market'})
Revenue: ${fmt(input.revenue)}
${metric}: ${fmt(earnings)}
${input.asking_price ? `Asking Price: ${fmt(input.asking_price)}` : ''}
${input.employee_count ? `Employees: ${input.employee_count}` : ''}
${input.growth_rate !== undefined ? `Growth: ${input.growth_rate}%` : ''}
${input.recurring_revenue_pct ? `Recurring Revenue: ${input.recurring_revenue_pct}%` : ''}
${input.competitive_advantages ? `Strengths: ${input.competitive_advantages}` : ''}
${input.products_services ? `Products/Services: ${input.products_services}` : ''}

Buyer categories to include: ${buyerCategories}

Structure as:

# Qualified Buyer Universe — [Business Name]

## Buyer Profile Summary
Brief overview of the ideal buyer profile and why this business is attractive.

## Category 1: [Buyer Type]
**Why they buy this**: Strategic rationale
**Typical profile**: Description of the ideal buyer in this category
**Estimated universe**: How many potential buyers exist
**User-controlled approach option**: How the user could reach them
**Fit score**: High / Medium / Low

(Repeat for each category — at minimum 4 categories)

## Buyer Comparison Matrix
| Category | Fit Score | Likely Price Range | Timeline | Financing |
|----------|-----------|-------------------|----------|-----------|
(Fill with data for each category)

## Outreach Priority Options
Ranked buyer-category options for user review, with why each category may fit.

## Disqualification Criteria
Red flags that indicate a buyer is not serious or not qualified.`,
    }],
  });

  return response.content[0].type === 'text' ? response.content[0].text : '';
}
