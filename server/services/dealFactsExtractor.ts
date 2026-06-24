/**
 * Deal Facts Extractor — pulls DURABLE facts out of a deal conversation and
 * upserts them into deal_facts, so Yulia returns to a deal already knowing
 * what's established (cross-conversation memory) instead of re-deriving it.
 *
 * Mirrors gateSummaryService: Haiku, fire-and-forget, failure-safe (never throws
 * to the caller). Dedup by a normalized md5 hash; memory capped per deal.
 */
import Anthropic from '@anthropic-ai/sdk';
import crypto from 'crypto';
import { sql } from '../db.js';

const HAIKU_MODEL = 'claude-haiku-4-5-20251001';
const MAX_FACTS_PER_DEAL = 60;

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

const ALLOWED_CATEGORIES = new Set([
  'financial',
  'operational',
  'market',
  'deal_terms',
  'people',
  'legal_tax',
  'general',
]);

interface ExtractedFact {
  category: string;
  fact: string;
}

/**
 * Extract durable facts from the recent window of a deal conversation and upsert
 * them. Returns the number upserted. FAILURE-SAFE: any error → 0, no throw.
 */
export async function extractDealFacts(
  conversationId: number,
  dealId: number,
  userId: number,
  windowSize: number = 40,
): Promise<number> {
  const window = Math.min(60, Math.max(20, Math.floor(windowSize) || 40));
  try {
    const messages = await sql`
      SELECT role, content FROM messages
      WHERE conversation_id = ${conversationId}
      ORDER BY created_at DESC, id DESC LIMIT ${window}
    `;
    if (messages.length === 0) return 0;

    const transcript = (messages.reverse() as any[])
      .map((m) => `${m.role === 'user' ? 'User' : 'Yulia'}: ${(m.content || '').substring(0, 600)}`)
      .join('\n');

    const resp = await getClient().messages.create({
      model: HAIKU_MODEL,
      max_tokens: 600,
      system:
        `You extract DURABLE FACTS about an M&A deal from a conversation — the kind worth remembering long-term so they are NEVER re-asked: confirmed numbers (revenue, EBITDA, multiple, headcount), agreed terms (earnout, seller financing, structure), established context (industry dynamics, customer concentration, reason for sale), and firm decisions. ` +
        `Do NOT include chit-chat, open questions, speculation, or anything not actually established. ` +
        `Output ONLY a JSON array of objects {"category","fact"} where category is one of: financial, operational, market, deal_terms, people, legal_tax, general. ` +
        `Each fact is ONE short standalone sentence. Max 8. If nothing durable was established, output [].`,
      messages: [{ role: 'user', content: `Extract durable facts from this deal conversation:\n\n${transcript}` }],
    });

    const text = resp.content[0]?.type === 'text' ? resp.content[0].text : '';
    const facts = parseFacts(text);
    if (facts.length === 0) return 0;

    let upserted = 0;
    for (const f of facts) {
      const fact = f.fact.trim().substring(0, 400);
      if (!fact) continue;
      const category = ALLOWED_CATEGORIES.has(f.category) ? f.category : 'general';
      const hash = crypto.createHash('md5').update(fact.toLowerCase().replace(/\s+/g, ' ').trim()).digest('hex');
      await sql`
        INSERT INTO deal_facts (deal_id, user_id, category, fact, fact_hash, source_conversation_id)
        VALUES (${dealId}, ${userId}, ${category}, ${fact}, ${hash}, ${conversationId})
        ON CONFLICT (deal_id, fact_hash) DO UPDATE SET
          updated_at = NOW(),
          category = EXCLUDED.category,
          source_conversation_id = EXCLUDED.source_conversation_id
      `;
      upserted++;
    }

    // Cap memory: keep the most-recent facts per deal, prune older ones.
    await sql`
      DELETE FROM deal_facts WHERE deal_id = ${dealId} AND id NOT IN (
        SELECT id FROM deal_facts WHERE deal_id = ${dealId} ORDER BY updated_at DESC LIMIT ${MAX_FACTS_PER_DEAL}
      )
    `;
    return upserted;
  } catch (e: any) {
    console.error('[dealFacts] extract error:', e.message);
    return 0;
  }
}

/** Pull the first JSON array out of the model output, tolerate prose around it. */
function parseFacts(text: string): ExtractedFact[] {
  try {
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    if (start === -1 || end === -1 || end < start) return [];
    const arr = JSON.parse(text.substring(start, end + 1));
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((x) => x && typeof x.fact === 'string' && x.fact.trim())
      .map((x) => ({ category: typeof x.category === 'string' ? x.category : 'general', fact: x.fact }));
  } catch {
    return [];
  }
}
