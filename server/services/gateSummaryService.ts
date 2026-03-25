/**
 * Gate Summary Service — Summarizes gate conversations for context carry-forward.
 * Uses Claude Haiku for fast, cheap summaries.
 */
import Anthropic from '@anthropic-ai/sdk';
import { sql } from '../db.js';

const HAIKU_MODEL = 'claude-haiku-4-5-20251001';

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

export const GATE_LABELS: Record<string, string> = {
  S0: 'Intake', S1: 'Financials', S2: 'Valuation', S3: 'Packaging', S4: 'Market Matching', S5: 'Closing',
  B0: 'Thesis', B1: 'Sourcing', B2: 'Valuation', B3: 'Due Diligence', B4: 'Structuring', B5: 'Closing',
  R0: 'Intake', R1: 'Financial Package', R2: 'Investor Materials', R3: 'Outreach', R4: 'Terms', R5: 'Closing',
  PMI0: 'Day 0', PMI1: 'Stabilization', PMI2: 'Assessment', PMI3: 'Optimization',
};

/**
 * Summarize the last 20 messages of a gate conversation into 3-4 sentences.
 * Returns null on failure (non-critical).
 */
export async function summarizeGateConversation(conversationId: number, gateName: string): Promise<string | null> {
  try {
    const messages = await sql`
      SELECT role, content FROM messages
      WHERE conversation_id = ${conversationId}
      ORDER BY created_at DESC LIMIT 20
    `;
    if (messages.length === 0) return null;

    // Reverse to chronological order
    const chronological = messages.reverse();
    const transcript = chronological
      .map((m: any) => `${m.role === 'user' ? 'User' : 'Yulia'}: ${(m.content || '').substring(0, 500)}`)
      .join('\n');

    const label = GATE_LABELS[gateName] || gateName;
    const resp = await getClient().messages.create({
      model: HAIKU_MODEL,
      max_tokens: 256,
      system: `You summarize M&A deal conversations concisely. Output 3-4 sentences capturing: key facts learned, decisions made, and current status. No preamble.`,
      messages: [{
        role: 'user',
        content: `Summarize this ${gateName} (${label}) gate conversation:\n\n${transcript}`,
      }],
    });

    const text = resp.content[0]?.type === 'text' ? resp.content[0].text : null;
    return text?.trim() || null;
  } catch (e: any) {
    console.error('[gateSummary] Error summarizing conversation:', e.message);
    return null;
  }
}

/**
 * Generate a formatted title for a completed gate conversation.
 */
export function gateCompletionTitle(gateName: string, businessName?: string | null): string {
  const label = GATE_LABELS[gateName] || gateName;
  const name = businessName || 'Deal';
  return `${gateName} — ${label} — ${name}`;
}
