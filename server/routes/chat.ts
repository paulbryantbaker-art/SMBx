import { Router } from 'express';
import postgres from 'postgres';
import { requireAuth } from '../middleware/auth.js';
import { buildSystemPrompt } from '../services/promptBuilder.js';
import { streamAgenticResponse } from '../services/aiService.js';
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages';

const sql = postgres(process.env.DATABASE_URL!, {
  ssl: 'require',
  prepare: false,
});

export const chatRouter = Router();

// All chat routes require auth
chatRouter.use(requireAuth);

// ─── Create conversation ────────────────────────────────────

chatRouter.post('/conversations', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const title = req.body.title || 'New conversation';

    const [conv] = await sql`
      INSERT INTO conversations (user_id, title)
      VALUES (${userId}, ${title})
      RETURNING id, user_id, title, is_archived, created_at, updated_at
    `;

    return res.status(201).json(conv);
  } catch (err: any) {
    console.error('Create conversation error:', err.message);
    return res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// ─── List conversations ─────────────────────────────────────

chatRouter.get('/conversations', async (req, res) => {
  try {
    const userId = (req as any).userId;

    const convos = await sql`
      SELECT id, title, is_archived, created_at, updated_at
      FROM conversations
      WHERE user_id = ${userId} AND is_archived = false
      ORDER BY updated_at DESC
    `;

    return res.json(convos);
  } catch (err: any) {
    console.error('List conversations error:', err.message);
    return res.status(500).json({ error: 'Failed to list conversations' });
  }
});

// ─── Get messages ───────────────────────────────────────────

chatRouter.get('/conversations/:id/messages', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const convId = parseInt(req.params.id, 10);

    const [conv] = await sql`
      SELECT id FROM conversations WHERE id = ${convId} AND user_id = ${userId} LIMIT 1
    `;
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });

    const msgs = await sql`
      SELECT id, role, content, metadata, created_at
      FROM messages
      WHERE conversation_id = ${convId}
      ORDER BY created_at ASC
    `;

    return res.json(msgs);
  } catch (err: any) {
    console.error('Get messages error:', err.message);
    return res.status(500).json({ error: 'Failed to get messages' });
  }
});

// ─── Send message + get AI response via SSE ─────────────────

chatRouter.post('/conversations/:id/messages', async (req, res) => {
  const userId = (req as any).userId;
  const convId = parseInt(req.params.id, 10);
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Message content is required' });
  }

  try {
    // Verify ownership
    const [conv] = await sql`
      SELECT id, title, deal_id FROM conversations
      WHERE id = ${convId} AND user_id = ${userId} LIMIT 1
    `;
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });

    // Save user message
    const [userMsg] = await sql`
      INSERT INTO messages (conversation_id, role, content)
      VALUES (${convId}, 'user', ${content.trim()})
      RETURNING id, role, content, metadata, created_at
    `;

    // Auto-title on first message
    if (conv.title === 'New conversation') {
      const shortTitle = content.trim().substring(0, 60) + (content.trim().length > 60 ? '...' : '');
      await sql`UPDATE conversations SET title = ${shortTitle}, updated_at = NOW() WHERE id = ${convId}`;
    }

    // Load context
    const [user] = await sql`SELECT id, email, display_name, league FROM users WHERE id = ${userId} LIMIT 1`;

    // Load deal if linked
    let deal = null;
    if (conv.deal_id) {
      const [d] = await sql`SELECT * FROM deals WHERE id = ${conv.deal_id} AND user_id = ${userId} LIMIT 1`;
      deal = d || null;
    }

    // Also check for any active deal for this user (if conversation isn't linked yet)
    if (!deal) {
      const [activeDeal] = await sql`
        SELECT * FROM deals WHERE user_id = ${userId} AND status = 'active'
        ORDER BY updated_at DESC LIMIT 1
      `;
      if (activeDeal) {
        deal = activeDeal;
        // Link conversation to deal
        await sql`UPDATE conversations SET deal_id = ${activeDeal.id} WHERE id = ${convId}`;
      }
    }

    // Build system prompt
    const systemPrompt = buildSystemPrompt(user, deal, convId);

    // Load conversation history (last 50 messages max)
    const history = await sql`
      SELECT role, content FROM messages
      WHERE conversation_id = ${convId}
      ORDER BY created_at ASC
      LIMIT 50
    `;

    const messages: MessageParam[] = history.map((m: any) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-User-Message-Id', String(userMsg.id));

    // Send user message confirmation
    res.write(`data: ${JSON.stringify({ type: 'user_message', message: userMsg })}\n\n`);

    // Run agentic loop and stream response
    const assistantText = await streamAgenticResponse(
      { userId, conversationId: convId, systemPrompt, messages },
      res,
    );

    // Save assistant message to DB
    if (assistantText) {
      const [assistantMsg] = await sql`
        INSERT INTO messages (conversation_id, role, content)
        VALUES (${convId}, 'assistant', ${assistantText})
        RETURNING id, role, content, metadata, created_at
      `;

      // Update conversation timestamp
      await sql`UPDATE conversations SET updated_at = NOW() WHERE id = ${convId}`;

      // Send completion event
      res.write(`data: ${JSON.stringify({ type: 'done', message: assistantMsg })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err: any) {
    console.error('Chat error:', err.message, err.stack);

    // If headers already sent (SSE started), send error event
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ type: 'error', error: 'Something went wrong. Please try again.' })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    } else {
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
  }
});
