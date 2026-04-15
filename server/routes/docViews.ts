/**
 * Doc Views — records when a user opens a document canvas tab, so the
 * mobile home's Recent Documents section can surface engagement-centric
 * recency ("what I'm actually working on") rather than creation-centric.
 *
 * Writes: POST /api/doc-views (UPSERT on user+doc_type+doc_id)
 * Reads:  GET  /api/doc-views/recent  (top N by opened_at DESC)
 */
import { Router } from 'express';
import { sql } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

export const docViewsRouter = Router();
docViewsRouter.use(requireAuth);

const DOC_TYPES = new Set(['deliverable', 'markdown', 'model', 'deal-messages', 'comparison']);

// ─── Record a view (upsert opened_at) ─────────────────────
docViewsRouter.post('/doc-views', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { docType, docId, label, dealId } = req.body as {
      docType?: string; docId?: string; label?: string; dealId?: number | null;
    };
    if (!docType || !DOC_TYPES.has(docType)) return res.status(400).json({ error: 'Invalid docType' });
    if (!docId || typeof docId !== 'string' || docId.length > 256) return res.status(400).json({ error: 'Invalid docId' });

    await sql`
      INSERT INTO user_doc_views (user_id, doc_type, doc_id, label, deal_id, opened_at)
      VALUES (${userId}, ${docType}, ${docId}, ${label || null}, ${dealId ?? null}, NOW())
      ON CONFLICT (user_id, doc_type, doc_id)
      DO UPDATE SET
        opened_at = NOW(),
        label = COALESCE(EXCLUDED.label, user_doc_views.label),
        deal_id = COALESCE(EXCLUDED.deal_id, user_doc_views.deal_id)
    `;
    return res.json({ ok: true });
  } catch (err: any) {
    console.error('[doc-views] record error:', err.message);
    return res.status(500).json({ error: 'Failed to record view' });
  }
});

// ─── Fetch recent views (ORDER BY opened_at DESC, LIMIT N) ─
docViewsRouter.get('/doc-views/recent', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const limit = Math.min(20, Math.max(1, parseInt(String(req.query.limit || '8'), 10) || 8));
    const rows = await sql`
      SELECT doc_type, doc_id, label, deal_id, opened_at
      FROM user_doc_views
      WHERE user_id = ${userId}
      ORDER BY opened_at DESC
      LIMIT ${limit}
    `;
    return res.json({ views: rows });
  } catch (err: any) {
    console.error('[doc-views] list error:', err.message);
    return res.status(500).json({ error: 'Failed to load recent views' });
  }
});

// ─── Remove a view (when a doc is deleted or closed forever) ─
docViewsRouter.delete('/doc-views', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { docType, docId } = req.body as { docType?: string; docId?: string };
    if (!docType || !docId) return res.status(400).json({ error: 'Missing docType/docId' });
    await sql`
      DELETE FROM user_doc_views
      WHERE user_id = ${userId} AND doc_type = ${docType} AND doc_id = ${docId}
    `;
    return res.json({ ok: true });
  } catch (err: any) {
    console.error('[doc-views] delete error:', err.message);
    return res.status(500).json({ error: 'Failed to delete view' });
  }
});
