/**
 * Canvas Tabs Persistence — survives refresh, navigation, reconnects.
 * Tabs are scoped to a conversation. When a user reopens a conversation,
 * their canvas tabs come back with the same state.
 */
import { Router } from 'express';
import { sql } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

export const canvasTabsRouter = Router();
canvasTabsRouter.use(requireAuth);

/** Verify the user owns the conversation */
async function ownsConversation(userId: number, convId: number): Promise<boolean> {
  const [c] = await sql`SELECT user_id FROM conversations WHERE id = ${convId} LIMIT 1`;
  return !!c && c.user_id === userId;
}

// ─── List tabs for a conversation ──────────────────────────
canvasTabsRouter.get('/conversations/:conversationId/canvas-tabs', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const convId = parseInt(req.params.conversationId, 10);
    if (!Number.isFinite(convId)) return res.status(400).json({ error: 'Invalid conversation id' });
    if (!(await ownsConversation(userId, convId))) return res.status(403).json({ error: 'Forbidden' });

    const tabs = await sql`
      SELECT id, tab_id, type, label, props, position, is_active
      FROM canvas_tabs
      WHERE conversation_id = ${convId}
      ORDER BY position ASC, id ASC
    `;
    return res.json({ tabs });
  } catch (err: any) {
    console.error('[canvas-tabs] list error:', err.message);
    return res.status(500).json({ error: 'Failed to load tabs' });
  }
});

// ─── Create or update a tab (idempotent by tab_id) ─────────
canvasTabsRouter.post('/conversations/:conversationId/canvas-tabs', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const convId = parseInt(req.params.conversationId, 10);
    if (!Number.isFinite(convId)) return res.status(400).json({ error: 'Invalid conversation id' });
    if (!(await ownsConversation(userId, convId))) return res.status(403).json({ error: 'Forbidden' });

    const { tabId, type, label, props = {}, position = 0, isActive = false } = req.body;
    if (!tabId || !type || !label) return res.status(400).json({ error: 'tabId, type, label required' });

    const [tab] = await sql`
      INSERT INTO canvas_tabs (conversation_id, tab_id, type, label, props, position, is_active)
      VALUES (${convId}, ${tabId}, ${type}, ${label}, ${sql.json(props)}, ${position}, ${isActive})
      ON CONFLICT (conversation_id, tab_id) DO UPDATE SET
        label = EXCLUDED.label,
        props = EXCLUDED.props,
        position = EXCLUDED.position,
        is_active = EXCLUDED.is_active,
        updated_at = NOW()
      RETURNING id, tab_id, type, label, props, position, is_active
    `;
    return res.json({ tab });
  } catch (err: any) {
    console.error('[canvas-tabs] upsert error:', err.message);
    return res.status(500).json({ error: 'Failed to save tab' });
  }
});

// ─── Set active tab ────────────────────────────────────────
canvasTabsRouter.patch('/conversations/:conversationId/canvas-tabs/active', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const convId = parseInt(req.params.conversationId, 10);
    if (!Number.isFinite(convId)) return res.status(400).json({ error: 'Invalid conversation id' });
    if (!(await ownsConversation(userId, convId))) return res.status(403).json({ error: 'Forbidden' });

    const { tabId } = req.body; // can be null to deactivate all
    await sql`UPDATE canvas_tabs SET is_active = false WHERE conversation_id = ${convId}`;
    if (tabId) {
      await sql`UPDATE canvas_tabs SET is_active = true WHERE conversation_id = ${convId} AND tab_id = ${tabId}`;
    }
    return res.json({ ok: true });
  } catch (err: any) {
    console.error('[canvas-tabs] set active error:', err.message);
    return res.status(500).json({ error: 'Failed to set active tab' });
  }
});

// ─── Delete a tab ──────────────────────────────────────────
canvasTabsRouter.delete('/conversations/:conversationId/canvas-tabs/:tabId', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const convId = parseInt(req.params.conversationId, 10);
    if (!Number.isFinite(convId)) return res.status(400).json({ error: 'Invalid conversation id' });
    if (!(await ownsConversation(userId, convId))) return res.status(403).json({ error: 'Forbidden' });

    await sql`
      DELETE FROM canvas_tabs
      WHERE conversation_id = ${convId} AND tab_id = ${req.params.tabId}
    `;
    return res.json({ ok: true });
  } catch (err: any) {
    console.error('[canvas-tabs] delete error:', err.message);
    return res.status(500).json({ error: 'Failed to delete tab' });
  }
});
