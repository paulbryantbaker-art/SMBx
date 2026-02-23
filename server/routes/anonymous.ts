import { Router } from 'express';
import crypto from 'crypto';
import { sql } from '../db.js';
import { buildAnonymousPrompt } from '../services/promptBuilder.js';
import { streamAnonymousResponse } from '../services/aiService.js';
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages';

export const anonymousRouter = Router();

const MAX_MESSAGES = 20;
const MAX_SESSIONS_PER_IP = 3;
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getClientIp(req: any): string {
  return req.ip || req.connection?.remoteAddress || 'unknown';
}

// ─── Create anonymous session ───────────────────────────────

anonymousRouter.post('/', async (req, res) => {
  const ip = getClientIp(req);

  try {
    // Rate limit: max sessions per IP in last 24h
    const [{ count }] = await sql`
      SELECT COUNT(*)::int as count FROM anonymous_sessions
      WHERE ip = ${ip} AND created_at > NOW() - INTERVAL '24 hours'
    `;

    if (count >= MAX_SESSIONS_PER_IP) {
      return res.status(429).json({
        error: 'Session limit reached. Sign up for unlimited access.',
      });
    }

    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

    await sql`
      INSERT INTO anonymous_sessions (session_id, ip, source_page, messages, message_count, expires_at)
      VALUES (${sessionId}, ${ip}, ${req.body.context || null}, '[]'::jsonb, 0, ${expiresAt})
    `;

    return res.status(201).json({ sessionId, messagesRemaining: MAX_MESSAGES });
  } catch (err: any) {
    console.error('Create anonymous session error:', err.message);
    return res.status(500).json({ error: 'Failed to create session' });
  }
});

// ─── Get anonymous session (for restore) ─────────────────────

anonymousRouter.get('/:sessionId', async (req, res) => {
  try {
    const [session] = await sql`
      SELECT session_id, source_page, messages, message_count, expires_at
      FROM anonymous_sessions
      WHERE session_id = ${req.params.sessionId}
        AND expires_at > NOW()
        AND converted_to_user_id IS NULL
    `;

    if (!session) {
      return res.status(404).json({ error: 'Session not found or expired' });
    }

    const userMsgCount = (session.messages as any[]).filter((m: any) => m.role === 'user').length;

    return res.json({
      sessionId: session.session_id,
      sourcePage: session.source_page,
      messages: session.messages,
      messagesRemaining: MAX_MESSAGES - userMsgCount,
      limitReached: userMsgCount >= MAX_MESSAGES,
    });
  } catch (err: any) {
    console.error('Get anonymous session error:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve session' });
  }
});

// ─── Send message in anonymous session ──────────────────────

anonymousRouter.post('/:sessionId/messages', async (req, res) => {
  try {
    const [session] = await sql`
      SELECT id, session_id, source_page, messages, message_count, expires_at
      FROM anonymous_sessions
      WHERE session_id = ${req.params.sessionId}
        AND expires_at > NOW()
        AND converted_to_user_id IS NULL
    `;

    if (!session) {
      return res.status(404).json({ error: 'Session not found or expired' });
    }

    const msgs = (session.messages as any[]) || [];
    const userMsgCount = msgs.filter((m: any) => m.role === 'user').length;

    if (userMsgCount >= MAX_MESSAGES) {
      return res.status(403).json({
        error: 'Message limit reached',
        action: 'signup',
        message: 'Create a free account to continue chatting with Yulia.',
      });
    }

    const { content } = req.body;
    if (!content?.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Add user message to array
    const updatedMsgs = [...msgs, { role: 'user', content: content.trim() }];

    // Persist user message immediately
    await sql`
      UPDATE anonymous_sessions
      SET messages = ${JSON.stringify(updatedMsgs)}::jsonb,
          message_count = ${updatedMsgs.length},
          last_active_at = NOW()
      WHERE id = ${session.id}
    `;

    // Build prompt with page context
    const systemPrompt = buildAnonymousPrompt(session.source_page || undefined);
    const apiMessages: MessageParam[] = updatedMsgs.map((m: any) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    // SSE setup
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send user message confirmation
    res.write(`data: ${JSON.stringify({ type: 'user_message', content: content.trim() })}\n\n`);

    try {
      const assistantText = await streamAnonymousResponse(systemPrompt, apiMessages, res);

      if (assistantText) {
        const finalMsgs = [...updatedMsgs, { role: 'assistant', content: assistantText }];

        // Persist assistant response
        await sql`
          UPDATE anonymous_sessions
          SET messages = ${JSON.stringify(finalMsgs)}::jsonb,
              message_count = ${finalMsgs.length},
              last_active_at = NOW()
          WHERE id = ${session.id}
        `;
      }

      const remaining = MAX_MESSAGES - (userMsgCount + 1);
      res.write(`data: ${JSON.stringify({ type: 'done', messagesRemaining: remaining })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (err: any) {
      console.error('Anonymous chat error:', err.message);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ type: 'error', error: 'Something went wrong. Please try again.' })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
      } else {
        res.status(500).json({ error: 'Something went wrong.' });
      }
    }
  } catch (err: any) {
    console.error('Anonymous message error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to process message' });
    }
  }
});

// ─── Convert anonymous session to authenticated user ────────

anonymousRouter.post('/:sessionId/convert', async (req, res) => {
  try {
    const [session] = await sql`
      SELECT id, messages FROM anonymous_sessions
      WHERE session_id = ${req.params.sessionId}
        AND expires_at > NOW()
        AND converted_to_user_id IS NULL
    `;

    if (!session) {
      return res.status(404).json({ error: 'Session not found or expired' });
    }

    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const msgs = (session.messages as any[]) || [];

    // Create a conversation for the user
    const [conv] = await sql`
      INSERT INTO conversations (user_id, title)
      VALUES (${userId}, ${msgs[0]?.content?.substring(0, 60) || 'Continued from preview'})
      RETURNING id
    `;

    // Copy all messages to the conversation
    for (const msg of msgs) {
      await sql`
        INSERT INTO messages (conversation_id, role, content)
        VALUES (${conv.id}, ${msg.role}, ${msg.content})
      `;
    }

    // Mark session as converted
    await sql`
      UPDATE anonymous_sessions
      SET converted_to_user_id = ${userId}
      WHERE id = ${session.id}
    `;

    return res.json({ success: true, conversationId: conv.id });
  } catch (err: any) {
    console.error('Session convert error:', err.message);
    return res.status(500).json({ error: 'Failed to convert session' });
  }
});
