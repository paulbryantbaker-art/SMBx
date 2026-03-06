/**
 * Buyer Pipeline Routes — Thesis Management + Internal Matching + Pipeline View
 * Session 12: Buyer OS
 */
import { Router } from 'express';
import { sql } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

export const buyerPipelineRouter = Router();
buyerPipelineRouter.use(requireAuth);

// ─── Get buyer pipeline ──────────────────────────────
buyerPipelineRouter.get('/buyer/pipeline', async (req, res) => {
  try {
    const userId = (req as any).userId;

    // Get active thesis (prefer new theses table, fall back to buyer_theses)
    const [deal] = await sql`
      SELECT id, journey_type, current_gate FROM deals
      WHERE user_id = ${userId} AND journey_type = 'buy'
      ORDER BY updated_at DESC LIMIT 1
    `;

    // Try new theses table first
    let thesis = null;
    if (deal) {
      [thesis] = await sql`
        SELECT * FROM theses WHERE deal_id = ${deal.id} AND is_active = true LIMIT 1
      `.catch(() => [null]);
    }

    // Fall back to buyer_theses
    if (!thesis) {
      [thesis] = await sql`
        SELECT * FROM buyer_theses WHERE user_id = ${userId} AND is_active = true
        ORDER BY updated_at DESC LIMIT 1
      `.catch(() => [null]);
    }

    if (!thesis) {
      return res.json({ hasThesis: false, targets: [], matchCount: 0 });
    }

    // Get discovery targets for this thesis
    const targets = await sql`
      SELECT dt.*, cp.name as company_name, cp.industry, cp.location_state,
             cp.revenue_reported, cp.sde_reported, cp.ebitda_reported,
             cp.revenue_estimated_low, cp.revenue_estimated_high,
             cp.sale_readiness_score, cp.sale_readiness_signals,
             cp.valuation_low, cp.valuation_high
      FROM discovery_targets dt
      JOIN company_profiles cp ON cp.id = dt.company_profile_id
      WHERE dt.thesis_id = ${thesis.id}
        AND dt.buyer_status != 'passed'
      ORDER BY
        CASE dt.buyer_status
          WHEN 'pursuing' THEN 0
          WHEN 'reviewing' THEN 1
          WHEN 'flagged' THEN 2
        END,
        dt.overall_score DESC NULLS LAST
    `.catch(() => []);

    return res.json({
      hasThesis: true,
      thesis,
      deal,
      targets,
      matchCount: targets.length,
      stats: {
        pursuing: (targets as any[]).filter(t => t.buyer_status === 'pursuing').length,
        reviewing: (targets as any[]).filter(t => t.buyer_status === 'reviewing').length,
        flagged: (targets as any[]).filter(t => t.buyer_status === 'flagged').length,
      },
    });
  } catch (err: any) {
    console.error('Buyer pipeline error:', err.message);
    return res.status(500).json({ error: 'Failed to load pipeline' });
  }
});

// ─── Update target status ────────────────────────────
buyerPipelineRouter.patch('/buyer/targets/:targetId', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const targetId = parseInt(req.params.targetId, 10);
    const { buyer_status, buyer_notes } = req.body;

    const validStatuses = ['flagged', 'reviewing', 'pursuing', 'passed'];
    if (buyer_status && !validStatuses.includes(buyer_status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Verify ownership via thesis → deal → user
    const [target] = await sql`
      SELECT dt.id, t.deal_id FROM discovery_targets dt
      JOIN theses t ON t.id = dt.thesis_id
      WHERE dt.id = ${targetId}
    `;
    if (!target) return res.status(404).json({ error: 'Target not found' });

    if (target.deal_id) {
      const [deal] = await sql`SELECT id FROM deals WHERE id = ${target.deal_id} AND user_id = ${userId}`;
      if (!deal) return res.status(403).json({ error: 'Access denied' });
    }

    const [updated] = await sql`
      UPDATE discovery_targets
      SET buyer_status = COALESCE(${buyer_status || null}, buyer_status),
          buyer_notes = COALESCE(${buyer_notes || null}, buyer_notes),
          buyer_actioned_at = NOW(),
          updated_at = NOW()
      WHERE id = ${targetId}
      RETURNING *
    `;

    return res.json(updated);
  } catch (err: any) {
    console.error('Update target error:', err.message);
    return res.status(500).json({ error: 'Failed to update target' });
  }
});

// ─── Update thesis criteria ──────────────────────────
buyerPipelineRouter.patch('/buyer/thesis/:thesisId', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const thesisId = parseInt(req.params.thesisId, 10);
    const { industries, geographies, revenue_min, revenue_max, sde_min, sde_max } = req.body;

    // Verify ownership
    const [thesis] = await sql`
      SELECT t.id, t.deal_id FROM theses t WHERE t.id = ${thesisId}
    `;
    if (!thesis) return res.status(404).json({ error: 'Thesis not found' });

    if (thesis.deal_id) {
      const [deal] = await sql`SELECT id FROM deals WHERE id = ${thesis.deal_id} AND user_id = ${userId}`;
      if (!deal) return res.status(403).json({ error: 'Access denied' });
    }

    const [updated] = await sql`
      UPDATE theses SET
        industries = COALESCE(${industries ? JSON.stringify(industries) : null}::jsonb, industries),
        geographies = COALESCE(${geographies ? JSON.stringify(geographies) : null}::jsonb, geographies),
        revenue_min = COALESCE(${revenue_min || null}, revenue_min),
        revenue_max = COALESCE(${revenue_max || null}, revenue_max),
        sde_min = COALESCE(${sde_min || null}, sde_min),
        sde_max = COALESCE(${sde_max || null}, sde_max),
        updated_at = NOW()
      WHERE id = ${thesisId}
      RETURNING *
    `;

    // Re-run matching
    const { runThesisMatch } = await import('../services/thesisMatchingService.js');
    setImmediate(() => runThesisMatch(thesisId).catch(() => {}));

    return res.json(updated);
  } catch (err: any) {
    console.error('Update thesis error:', err.message);
    return res.status(500).json({ error: 'Failed to update thesis' });
  }
});
