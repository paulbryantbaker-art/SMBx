import { Router } from 'express';
import postgres from 'postgres';
import { requireAuth } from '../middleware/auth.js';

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

// ─── Get messages for a conversation ────────────────────────

chatRouter.get('/conversations/:id/messages', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const convId = parseInt(req.params.id, 10);

    // Verify ownership
    const [conv] = await sql`
      SELECT id FROM conversations WHERE id = ${convId} AND user_id = ${userId} LIMIT 1
    `;
    if (!conv) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

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

// ─── Send message (echo back for now — no AI yet) ──────────

chatRouter.post('/conversations/:id/messages', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const convId = parseInt(req.params.id, 10);
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Verify ownership
    const [conv] = await sql`
      SELECT id, title FROM conversations WHERE id = ${convId} AND user_id = ${userId} LIMIT 1
    `;
    if (!conv) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Save user message
    const [userMsg] = await sql`
      INSERT INTO messages (conversation_id, role, content)
      VALUES (${convId}, ${'user'}, ${content.trim()})
      RETURNING id, role, content, metadata, created_at
    `;

    // Auto-title on first message
    if (conv.title === 'New conversation') {
      const shortTitle = content.trim().substring(0, 60) + (content.trim().length > 60 ? '...' : '');
      await sql`UPDATE conversations SET title = ${shortTitle}, updated_at = NOW() WHERE id = ${convId}`;
    } else {
      await sql`UPDATE conversations SET updated_at = NOW() WHERE id = ${convId}`;
    }

    // Echo response (placeholder until AI is wired up)
    const echoContent = `I'm Yulia, your M&A advisor. I received your message: "${content.trim().substring(0, 100)}"\n\nAI responses will be connected soon. For now, I'm echoing to prove the chat pipeline works end-to-end.`;

    const [assistantMsg] = await sql`
      INSERT INTO messages (conversation_id, role, content)
      VALUES (${convId}, ${'assistant'}, ${echoContent})
      RETURNING id, role, content, metadata, created_at
    `;

    return res.json({ userMessage: userMsg, assistantMessage: assistantMsg });
  } catch (err: any) {
    console.error('Send message error:', err.message);
    return res.status(500).json({ error: 'Failed to send message' });
  }
});
