/**
 * Gate Conversation Lifecycle Service
 * Shared by both advanceGate paths (tools.ts agentic + dealService auto-advance).
 *
 * On gate transition:
 * 1. Summarize + archive old conversation
 * 2. Create new conversation for the next gate
 */
import { sql } from '../db.js';
import { summarizeGateConversation, gateCompletionTitle, GATE_TITLES } from './gateSummaryService.js';

interface GateTransitionResult {
  newConversationId: number;
  summary: string | null;
}

/**
 * Handle gate transition: archive current conversation, create new one.
 *
 * @param dealId - The deal advancing gates
 * @param userId - Owner of the deal
 * @param fromGate - Gate being completed
 * @param toGate - Gate being entered
 * @param conversationId - Optional specific conversation to archive (otherwise finds active one)
 */
export async function handleGateTransition(
  dealId: number,
  userId: number,
  fromGate: string,
  toGate: string,
  conversationId?: number,
): Promise<GateTransitionResult> {
  // 1. Find the active conversation for this deal
  let convoId = conversationId;
  if (!convoId) {
    const [active] = await sql`
      SELECT id FROM conversations
      WHERE deal_id = ${dealId} AND gate_status = 'active'
      ORDER BY updated_at DESC LIMIT 1
    `;
    convoId = active?.id;
  }

  // 2. Summarize the old conversation (non-blocking failure)
  let summary: string | null = null;
  if (convoId) {
    summary = await summarizeGateConversation(convoId, fromGate).catch(() => null);

    // 3. Archive it: mark completed, set title, store summary
    const [deal] = await sql`SELECT business_name FROM deals WHERE id = ${dealId}`;
    const title = gateCompletionTitle(fromGate, deal?.business_name);

    await sql`
      UPDATE conversations
      SET gate_status = 'completed',
          title = ${title},
          gate_label = ${fromGate},
          summary = ${summary},
          updated_at = NOW()
      WHERE id = ${convoId}
    `;
  }

  // 4. Create new conversation for the next gate
  const nextTitle = GATE_TITLES[toGate] || toGate;
  const [newConvo] = await sql`
    INSERT INTO conversations (user_id, title, deal_id, gate_status, gate_label, created_at, updated_at)
    VALUES (${userId}, ${nextTitle}, ${dealId}, 'active', ${toGate}, NOW(), NOW())
    RETURNING id
  `;

  return {
    newConversationId: newConvo.id,
    summary,
  };
}
