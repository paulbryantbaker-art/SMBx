/**
 * Pitch Deck Generator — Investor Presentation (Raise Journey R2)
 *
 * Generates a 10-15 slide pitch deck outline with content for each slide.
 * Output is structured JSON that can be rendered in the canvas or exported.
 */
import Anthropic from '@anthropic-ai/sdk';

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  return client;
}

interface PitchDeckInput {
  business_name?: string;
  industry?: string;
  location?: string;
  revenue?: number; // cents
  ebitda?: number; // cents
  sde?: number; // cents
  growth_rate?: number; // decimal
  employee_count?: number;
  years_in_business?: number;
  league: string;
  raise_amount?: number; // cents
  raise_purpose?: string;
  valuation?: number; // cents
  equity_offered?: number; // percent
  use_of_funds?: string;
  competitive_advantages?: string;
  customer_profile?: string;
  tam_sam_som?: string;
  team_highlights?: string;
  financials?: Record<string, any>;
}

export async function generatePitchDeck(input: PitchDeckInput): Promise<Record<string, any>> {
  const anthropic = getClient();
  const revenue = (input.revenue || 0) / 100;
  const raiseAmount = (input.raise_amount || 0) / 100;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 6000,
    system: `You are an investment banker creating a pitch deck for capital raising. Return ONLY valid JSON with a "slides" array. Each slide has: title, subtitle (optional), content (markdown string), speaker_notes (string), slide_type (one of: cover, problem, solution, market, traction, business_model, financials, team, ask, appendix).`,
    messages: [{
      role: 'user',
      content: `Create a 12-slide pitch deck for:

Company: ${input.business_name || 'Company'}
Industry: ${input.industry || 'Not specified'}
Location: ${input.location || 'United States'}
Revenue: $${revenue.toLocaleString()}
${input.ebitda ? `EBITDA: $${(input.ebitda / 100).toLocaleString()}` : input.sde ? `SDE: $${(input.sde / 100).toLocaleString()}` : ''}
Growth Rate: ${input.growth_rate ? `${(input.growth_rate * 100).toFixed(1)}%` : 'Not specified'}
Employees: ${input.employee_count || 'Not specified'}
Years in Business: ${input.years_in_business || 'Not specified'}
Raise Amount: ${raiseAmount ? `$${raiseAmount.toLocaleString()}` : 'TBD'}
Raise Purpose: ${input.raise_purpose || 'Growth capital'}
${input.use_of_funds ? `Use of Funds: ${input.use_of_funds}` : ''}
${input.competitive_advantages ? `Competitive Advantages: ${input.competitive_advantages}` : ''}
${input.tam_sam_som ? `Market Size: ${input.tam_sam_som}` : ''}

Include these slides:
1. Cover slide (company name, tagline, date)
2. Executive Summary
3. Problem / Market Opportunity
4. Solution / Value Proposition
5. Business Model & Revenue
6. Market Size (TAM/SAM/SOM)
7. Traction & Growth
8. Competitive Landscape
9. Financial Overview (3-year projections)
10. Team
11. The Ask (raise amount, use of funds, terms)
12. Appendix / Contact

Return JSON: { "slides": [...], "executive_summary": "..." }`,
    }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : text);
  } catch {
    return {
      markdown: text,
      slides: [],
      executive_summary: 'Pitch deck generated — see content.',
    };
  }
}
