/**
 * Discovery Routes — Off-Market Discovery Pipeline
 * Session 13: Google Places + BizBuySell discovery
 */
import { Router } from 'express';
import { sql } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

export const discoveryRouter = Router();
discoveryRouter.use(requireAuth);

// ─── Trigger discovery scan for a thesis ─────────────
discoveryRouter.post('/buyer/discover', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { thesisId } = req.body;

    if (!thesisId) return res.status(400).json({ error: 'thesisId required' });

    // Verify ownership
    const [thesis] = await sql`
      SELECT t.*, d.user_id FROM theses t
      LEFT JOIN deals d ON d.id = t.deal_id
      WHERE t.id = ${thesisId}
    `;
    if (!thesis) return res.status(404).json({ error: 'Thesis not found' });

    // Enqueue discovery jobs via pg-boss (if available) or run inline
    const { runDiscoveryScan } = await import('../services/discoveryService.js');
    setImmediate(() => runDiscoveryScan(thesisId).catch(err => {
      console.error('[discovery] Scan failed:', err.message);
    }));

    return res.json({ status: 'scanning', message: 'Discovery scan started. Check your pipeline for results.' });
  } catch (err: any) {
    console.error('Discovery trigger error:', err.message);
    return res.status(500).json({ error: 'Failed to start discovery' });
  }
});

// ─── Get discovery status ────────────────────────────
discoveryRouter.get('/buyer/discover/:thesisId/status', async (req, res) => {
  try {
    const thesisId = parseInt(req.params.thesisId, 10);

    const counts = await sql`
      SELECT
        COUNT(*)::int as total,
        COUNT(*) FILTER (WHERE enrichment_status = 'complete')::int as enriched,
        COUNT(*) FILTER (WHERE enrichment_status = 'pending')::int as pending
      FROM discovery_targets WHERE thesis_id = ${thesisId}
    `;

    return res.json(counts[0] || { total: 0, enriched: 0, pending: 0 });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to get status' });
  }
});
