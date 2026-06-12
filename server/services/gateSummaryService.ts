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

/** Human-readable gate titles for conversation naming */
export const GATE_TITLES: Record<string, string> = {
  S0: 'Getting Started', S1: 'Financial Deep-Dive', S2: 'Valuation & Positioning',
  S3: 'Deal Materials & Packaging', S4: 'Buyer Matching & Outreach', S5: 'Closing & Transition',
  B0: 'Thesis & Readiness', B1: 'Deal Screening', B2: 'Valuation & Modeling',
  B3: 'Due Diligence', B4: 'Deal Structure & Terms', B5: 'Closing & Integration',
  R0: 'Readiness Assessment', R1: 'Financial Package', R2: 'Investor Materials',
  R3: 'Investor Outreach', R4: 'Term Negotiation', R5: 'Closing the Raise',
  PMI0: 'Day Zero', PMI1: 'Stabilization', PMI2: 'Assessment', PMI3: 'Optimization',
};

/**
 * Summarize a conversation into a compact running memory.
 *
 * PROGRESSIVE: pass the conversation's existing summary as `previousSummary`
 * and it is folded in — durable facts from earlier in the thread survive even
 * though only the last 30 messages are read. Without this, anything said more
 * than 30 messages ago would be unrepresentable in any future prompt.
 *
 * FAILURE-SAFE: on any error (or empty thread) the PREVIOUS summary is
 * returned, never null-over-data — callers can write the result back without
 * risking erasure of memory they already had.
 */
export async function summarizeGateConversation(
  conversationId: number,
  gateName: string,
  previousSummary?: string | null,
  windowSize: number = 30,
): Promise<string | null> {
  const prior = previousSummary?.trim() || null;
  const window = Math.min(60, Math.max(30, Math.floor(windowSize) || 30));
  try {
    const messages = await sql`
      SELECT role, content FROM messages
      WHERE conversation_id = ${conversationId}
      ORDER BY created_at DESC, id DESC LIMIT ${window}
    `;
    if (messages.length === 0) return prior;

    // Reverse to chronological order
    const chronological = messages.reverse();
    const transcript = chronological
      .map((m: any) => `${m.role === 'user' ? 'User' : 'Yulia'}: ${(m.content || '').substring(0, 500)}`)
      .join('\n');

    const label = GATE_LABELS[gateName] || gateName;
    const resp = await getClient().messages.create({
      model: HAIKU_MODEL,
      max_tokens: 350,
      system: prior
        ? `You maintain the running summary of an M&A deal conversation. Merge the prior summary with the latest exchanges into 4-6 sentences capturing: key facts learned, decisions made, numbers and terms agreed, and current status. Keep durable facts from the prior summary unless the latest exchanges contradict them. No preamble.`
        : `You summarize M&A deal conversations concisely. Output 3-4 sentences capturing: key facts learned, decisions made, and current status. No preamble.`,
      messages: [{
        role: 'user',
        content: prior
          ? `Prior summary:\n${prior}\n\nLatest exchanges in this ${gateName} (${label}) gate conversation:\n\n${transcript}`
          : `Summarize this ${gateName} (${label}) gate conversation:\n\n${transcript}`,
      }],
    });

    const text = resp.content[0]?.type === 'text' ? resp.content[0].text : null;
    return text?.trim() || prior;
  } catch (e: any) {
    console.error('[gateSummary] Error summarizing conversation:', e.message);
    return prior;
  }
}

/**
 * Generate a formatted title for a completed gate conversation.
 */
export function gateCompletionTitle(gateName: string, businessName?: string | null): string {
  const title = GATE_TITLES[gateName] || GATE_LABELS[gateName] || gateName;
  return `${title} \u2713`;
}
