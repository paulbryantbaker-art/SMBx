/**
 * Outreach Strategy Generator
 *
 * AI-generated multi-channel outreach plan for seller-side buyer targeting.
 * Includes messaging templates, timeline, and channel recommendations.
 */
import Anthropic from '@anthropic-ai/sdk';

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  return client;
}

export interface OutreachStrategyInput {
  business_name?: string;
  industry?: string;
  location?: string;
  league: string;
  revenue: number;       // cents
  sde?: number;          // cents
  ebitda?: number;       // cents
  asking_price?: number; // cents
  growth_rate?: number;
  employee_count?: number;
  competitive_advantages?: string;
  buyer_types?: string;  // e.g. "strategic, PE, individual"
  financials?: Record<string, any>;
}

export async function generateOutreachStrategy(input: OutreachStrategyInput): Promise<string> {
  const anthropic = getClient();
  const fmt = (cents: number) => `$${(cents / 100).toLocaleString()}`;
  const earnings = input.ebitda || input.sde || 0;
  const metric = input.ebitda ? 'EBITDA' : 'SDE';

  const isMainStreet = ['L1', 'L2'].includes(input.league);

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3500,
    system: `You are a senior M&A advisor creating a buyer outreach strategy. Output clean markdown. Be specific and actionable — no generic advice. Tailor recommendations to the deal size and industry.`,
    messages: [{
      role: 'user',
      content: `Create a Buyer Outreach Strategy for this business:

Business: ${input.business_name || 'Target Company'}
Industry: ${input.industry || 'General'}
Location: ${input.location || 'United States'}
League: ${input.league} (${isMainStreet ? 'Main Street' : 'Middle Market'})
Revenue: ${fmt(input.revenue)}
${metric}: ${fmt(earnings)}
${input.asking_price ? `Asking Price: ${fmt(input.asking_price)}` : ''}
${input.growth_rate !== undefined ? `Growth Rate: ${input.growth_rate}%` : ''}
${input.employee_count ? `Employees: ${input.employee_count}` : ''}
${input.competitive_advantages ? `Key Strengths: ${input.competitive_advantages}` : ''}
${input.buyer_types ? `Target Buyer Types: ${input.buyer_types}` : ''}

Structure the strategy as:

# Outreach Strategy — [Business Name]

## Target Buyer Profiles
3-4 specific buyer types most likely to acquire this business (e.g., strategic acquirers in adjacent industries, PE-backed platforms, individual operators, search funds). For each: why they'd buy, estimated interest level, typical deal structure preference.

## Outreach Channels
${isMainStreet ? 'Focus on: business-for-sale marketplaces, broker networks, local business communities, SBA lender referrals, industry associations.' : 'Focus on: targeted direct outreach, PE databases, investment banker networks, strategic corporate development contacts, industry conferences.'}

For each channel: what to do, expected response rate, timeline.

## Messaging Templates
Provide 2-3 actual email/message templates:
1. Initial cold outreach (blind — no business name)
2. Follow-up after NDA (revealing business details)
3. Meeting request for qualified buyers

## Outreach Timeline
Week-by-week timeline for the first 60 days of outreach.

## Qualification Criteria
How to screen inbound buyer interest — financial capability, strategic fit, timeline, experience.

## Key Metrics to Track
What to measure: response rates, NDAs signed, meetings held, LOIs received.`,
    }],
  });

  return response.content[0].type === 'text' ? response.content[0].text : '';
}
