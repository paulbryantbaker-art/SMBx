/**
 * conversationNamer.ts
 *
 * Generates concise, meaningful conversation titles using Claude Haiku.
 * Called at the end of each agentic loop (fire-and-forget) to replace
 * the placeholder "first 60 chars" title with something like:
 *   "Selling HVAC company valuation"
 *   "SBA loan for dental practice"
 *   "Buy-side due diligence checklist"
 *
 * Rules:
 *   - 3-8 words, no quotes, no punctuation at end
 *   - Captures the topic, not the tone
 *   - Only runs when title is still placeholder-ish (first 60 chars of user msg)
 *   - Fails silently — never blocks the response
 */
import Anthropic from '@anthropic-ai/sdk';

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  }
  return client;
}

/**
 * Generate a conversation title from the messages exchanged so far.
 * Returns null if naming fails (caller keeps existing title).
 */
export async function generateConversationTitle(
  messages: { role: string; content: string }[],
  dealContext?: { business_name?: string; journey_type?: string; industry?: string } | null,
): Promise<string | null> {
  try {
    // Take last 6 messages max to keep token usage low
    const recent = messages.slice(-6);
    const transcript = recent
      .map(m => `${m.role === 'user' ? 'User' : 'Yulia'}: ${m.content.substring(0, 300)}`)
      .join('\n');

    const dealHint = dealContext
      ? `Deal context: ${[dealContext.business_name, dealContext.journey_type, dealContext.industry].filter(Boolean).join(', ')}`
      : '';

    const resp = await getClient().messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 30,
      messages: [{
        role: 'user',
        content: `Generate a short conversation title (3-8 words) for this M&A advisory chat. No quotes, no ending punctuation. Capture the specific topic, not generic "M&A discussion". ${dealHint}\n\nTranscript:\n${transcript}\n\nTitle:`,
      }],
    });

    const text = resp.content[0]?.type === 'text' ? resp.content[0].text.trim() : null;
    if (!text) return null;

    // Clean: remove quotes, trailing punctuation, limit length
    const cleaned = text
      .replace(/^["']+|["']+$/g, '')
      .replace(/[.!?]+$/, '')
      .substring(0, 80);

    return cleaned || null;
  } catch (err: any) {
    // Silent failure — conversation keeps its existing title
    console.error('Auto-name error:', err.message?.substring(0, 100));
    return null;
  }
}
