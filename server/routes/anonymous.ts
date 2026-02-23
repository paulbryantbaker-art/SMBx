import { Router } from 'express';
import crypto from 'crypto';
import postgres from 'postgres';
import { buildAnonymousPrompt } from '../services/promptBuilder.js';
import { streamAnonymousResponse } from '../services/aiService.js';
import { signToken } from '../middleware/auth.js';
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages';

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require', prepare: false });

export const anonymousRouter = Router();

// ─── In-memory session store ────────────────────────────────

interface AnonSession {
  id: string;
  ip: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
  createdAt: number;
  context?: string;
}

const sessions = new Map<string, AnonSession>();
const ipCounts = new Map<string, { count: number; resetAt: number }>();

const MAX_MESSAGES = 10;
const MAX_SESSIONS_PER_IP = 3;
const SESSION_TTL = 7 * 24 * 60 * 60 * 1000;

// Cleanup expired sessions every hour
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (now - session.createdAt > SESSION_TTL) sessions.delete(id);
  }
  for (const [ip, data] of ipCounts) {
    if (now > data.resetAt) ipCounts.delete(ip);
  }
}, 60 * 60 * 1000);

function getClientIp(req: any): string {
  return req.ip || req.connection?.remoteAddress || 'unknown';
}

// ─── Create anonymous session ───────────────────────────────

anonymousRouter.post('/', (req, res) => {
  const ip = getClientIp(req);
  const now = Date.now();

  // Rate limit check
  const ipData = ipCounts.get(ip);
  if (ipData && now < ipData.resetAt && ipData.count >= MAX_SESSIONS_PER_IP) {
    return res.status(429).json({
      error: 'Session limit reached. Sign up for unlimited access.',
    });
  }

  const sessionId = crypto.randomUUID();
  sessions.set(sessionId, {
    id: sessionId,
    ip,
    messages: [],
    createdAt: now,
    context: req.body.context || undefined,
  });

  // Update IP counter
  if (!ipData || now > ipData.resetAt) {
    ipCounts.set(ip, { count: 1, resetAt: now + 24 * 60 * 60 * 1000 });
  } else {
    ipData.count++;
  }

  return res.status(201).json({ sessionId, messagesRemaining: MAX_MESSAGES });
});

// ─── Send message in anonymous session ──────────────────────

anonymousRouter.post('/:sessionId/messages', async (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found or expired' });
  }

  const userMsgCount = session.messages.filter(m => m.role === 'user').length;
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

  // Add user message
  session.messages.push({ role: 'user', content: content.trim() });

  // Build prompt with optional page context
  const systemPrompt = buildAnonymousPrompt(session.context);
  const messages: MessageParam[] = session.messages.map(m => ({
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
    const assistantText = await streamAnonymousResponse(systemPrompt, messages, res);

    if (assistantText) {
      session.messages.push({ role: 'assistant', content: assistantText });
    }

    const remaining = MAX_MESSAGES - session.messages.filter(m => m.role === 'user').length;
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
});

// ─── Convert anonymous session to authenticated user ────────

anonymousRouter.post('/:sessionId/convert', async (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found or expired' });
  }

  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    // Create a conversation for the user
    const [conv] = await sql`
      INSERT INTO conversations (user_id, title)
      VALUES (${userId}, ${session.messages[0]?.content?.substring(0, 60) || 'Continued from preview'})
      RETURNING id
    `;

    // Copy all messages to the conversation
    for (const msg of session.messages) {
      await sql`
        INSERT INTO messages (conversation_id, role, content)
        VALUES (${conv.id}, ${msg.role}, ${msg.content})
      `;
    }

    // Clean up session
    sessions.delete(session.id);

    return res.json({ success: true, conversationId: conv.id });
  } catch (err: any) {
    console.error('Session convert error:', err.message);
    return res.status(500).json({ error: 'Failed to convert session' });
  }
});
