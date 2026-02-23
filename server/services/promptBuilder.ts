import { MASTER_PROMPT } from '../prompts/masterPrompt.js';
import { PERSONAS } from '../prompts/personas.js';
import { JOURNEY_DETECTION_PROMPT } from '../prompts/journeyDetection.js';
import { GATE_PROMPTS } from '../prompts/gatePrompts.js';
import { BRANCHING_LOGIC } from '../prompts/branchingLogic.js';

interface UserContext {
  id: number;
  email: string;
  display_name: string | null;
  league: string | null;
}

interface DealContext {
  id: number;
  journey_type: string;
  current_gate: string;
  league: string | null;
  industry: string | null;
  location: string | null;
  business_name: string | null;
  revenue: number | null;
  sde: number | null;
  ebitda: number | null;
  asking_price: number | null;
  financials: Record<string, any> | null;
  status: string;
}

function formatDealContext(deal: DealContext): string {
  const fields: string[] = [];
  if (deal.business_name) fields.push(`Business Name: ${deal.business_name}`);
  fields.push(`Journey: ${deal.journey_type.toUpperCase()}`);
  fields.push(`Current Gate: ${deal.current_gate}`);
  if (deal.league) fields.push(`League: ${deal.league}`);
  if (deal.industry) fields.push(`Industry: ${deal.industry}`);
  if (deal.location) fields.push(`Location: ${deal.location}`);
  if (deal.revenue) fields.push(`Revenue: $${(deal.revenue / 100).toLocaleString()}`);
  if (deal.sde) fields.push(`SDE: $${(deal.sde / 100).toLocaleString()}`);
  if (deal.ebitda) fields.push(`EBITDA: $${(deal.ebitda / 100).toLocaleString()}`);
  if (deal.asking_price) fields.push(`Asking Price: $${(deal.asking_price / 100).toLocaleString()}`);

  // Include extended fields from financials jsonb
  if (deal.financials && typeof deal.financials === 'object') {
    for (const [key, value] of Object.entries(deal.financials)) {
      if (value !== null && value !== undefined) {
        const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        fields.push(`${label}: ${value}`);
      }
    }
  }

  return fields.join('\n');
}

/**
 * Build a lightweight system prompt for anonymous (unauthenticated) chat.
 * No tools, no deal context — just Yulia having a helpful first conversation.
 */
export function buildAnonymousPrompt(context?: string): string {
  const layers: string[] = [];

  layers.push(`You are Yulia, the M&A advisor for smbx.ai. You are having a free introductory conversation with a potential client on the public website.

## YOUR IDENTITY
- Name: Yulia
- Role: Senior M&A advisor at smbx.ai
- You speak as someone who has closed hundreds of deals
- You never say "As an AI" or break character
- You are warm, direct, and confident

## THIS IS A PUBLIC PREVIEW CONVERSATION
- The user has NOT signed up yet — this is their first taste of working with you
- Be helpful and substantive — give real insight, not generic marketing speak
- Show your expertise by asking smart follow-up questions
- When you have enough context, give a concrete insight (e.g. "businesses like yours typically trade at 3-4x SDE")
- Keep responses concise — 2-3 short paragraphs max
- After a few exchanges, naturally suggest they sign up to get a full analysis: "If you'd like, I can run a proper valuation — just create an account and we'll pick up right where we left off."

## HARD RAILS
- ZERO hallucination on financial data — only use numbers the user provides
- Never provide legal advice
- Never promise specific outcomes or valuations without data
- Keep it professional but approachable`);

  if (context) {
    layers.push(`\n## PAGE CONTEXT\nThe user started this conversation from the "${context}" page on smbx.ai. Tailor your opening awareness to this context, but follow their lead.`);
  }

  return layers.join('\n\n');
}

export function buildSystemPrompt(
  user: UserContext,
  deal: DealContext | null,
  conversationId: number,
): string {
  const layers: string[] = [];

  // Layer 1: ALWAYS — master prompt with agentic behavior
  layers.push(MASTER_PROMPT);

  // Layer 2: User context
  const userName = user.display_name || user.email.split('@')[0];
  layers.push(`\n## CURRENT USER\nName: ${userName}\nEmail: ${user.email}\nLeague: ${user.league || 'Not yet classified'}`);

  // Layer 3: Journey detection or deal context
  if (!deal) {
    layers.push(JOURNEY_DETECTION_PROMPT);
  } else {
    // Layer 3a: Deal context summary
    layers.push(`\n## CURRENT DEAL (ID: ${deal.id})\n${formatDealContext(deal)}`);

    // Layer 3b: League persona
    const league = deal.league || user.league;
    if (league && PERSONAS[league]) {
      layers.push(PERSONAS[league]);
    }

    // Layer 3c: Gate-specific prompt
    if (GATE_PROMPTS[deal.current_gate]) {
      layers.push(GATE_PROMPTS[deal.current_gate]);
    }
  }

  // Layer 4: Branching logic
  layers.push(BRANCHING_LOGIC);

  return layers.join('\n\n');
}
