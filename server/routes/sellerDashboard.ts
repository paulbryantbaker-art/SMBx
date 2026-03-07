/**
 * Seller Dashboard Routes — Living Valuation + Value Roadmap Tracker
 * Session 11: Seller OS
 */
import { Router } from 'express';
import { sql } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { estimateMonthsToReady, getJourneyPhase } from '../services/knowledgeGraphService.js';

export const sellerDashboardRouter = Router();
sellerDashboardRouter.use(requireAuth);

// ─── Get seller dashboard data ────────────────────────
sellerDashboardRouter.get('/seller/dashboard', async (req, res) => {
  try {
    const userId = (req as any).userId;

    // Get the user's active sell deal
    const [deal] = await sql`
      SELECT d.id, d.journey_type, d.current_gate, d.business_name,
             d.revenue, d.sde, d.ebitda, d.league
      FROM deals d WHERE d.user_id = ${userId} AND d.journey_type = 'sell'
      ORDER BY d.updated_at DESC LIMIT 1
    `;

    if (!deal) return res.json({ hasDeal: false });

    // Get company profile
    const [profile] = await sql`
      SELECT * FROM company_profiles WHERE deal_id = ${deal.id} LIMIT 1
    `;

    // Get improvement actions
    const actions = profile ? await sql`
      SELECT * FROM improvement_actions
      WHERE company_profile_id = ${profile.id}
      ORDER BY
        CASE status
          WHEN 'in_progress' THEN 0
          WHEN 'not_started' THEN 1
          WHEN 'complete' THEN 2
        END,
        CASE difficulty
          WHEN 'easy' THEN 0
          WHEN 'medium' THEN 1
          WHEN 'hard' THEN 2
        END
    ` : [];

    // Calculate stats
    const completedActions = (actions as any[]).filter(a => a.status === 'complete');
    const totalImpact = completedActions.reduce((sum: number, a: any) => sum + (a.valuation_impact_cents || 0), 0);

    // Calculate journey phase and timeline
    const readinessScore = profile?.sale_readiness_score || 0;
    const exitType = profile?.exit_type || deal?.exit_type || null;
    const journeyPhase = getJourneyPhase(deal.current_gate, readinessScore);
    const estimatedMonths = estimateMonthsToReady(
      readinessScore,
      (actions as any[]).map((a: any) => ({
        status: a.status,
        difficulty: a.difficulty,
        timeline_days: a.timeline_days,
      })),
      exitType,
    );

    return res.json({
      hasDeal: true,
      deal,
      profile,
      actions,
      stats: {
        totalActions: actions.length,
        completedCount: completedActions.length,
        inProgressCount: (actions as any[]).filter(a => a.status === 'in_progress').length,
        totalValuationImpact: totalImpact,
        valuationLow: profile?.valuation_low || null,
        valuationHigh: profile?.valuation_high || null,
        valuationUpdatedAt: profile?.valuation_updated_at || null,
      },
      timeline: {
        journeyPhase,
        estimatedMonths,
        exitType,
      },
    });
  } catch (err: any) {
    console.error('Seller dashboard error:', err.message);
    return res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

// ─── Update improvement action status ─────────────────
sellerDashboardRouter.patch('/seller/actions/:actionId', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const actionId = parseInt(req.params.actionId, 10);
    const { status, completion_note } = req.body;

    const validStatuses = ['not_started', 'in_progress', 'complete'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Verify ownership: action → company_profile → deal → user
    const [action] = await sql`
      SELECT ia.id, ia.company_profile_id, ia.valuation_impact_cents, ia.title,
             cp.deal_id, cp.valuation_low, cp.valuation_high
      FROM improvement_actions ia
      JOIN company_profiles cp ON cp.id = ia.company_profile_id
      WHERE ia.id = ${actionId}
    `;
    if (!action) return res.status(404).json({ error: 'Action not found' });

    const [deal] = await sql`
      SELECT id FROM deals WHERE id = ${action.deal_id} AND user_id = ${userId}
    `;
    if (!deal) return res.status(403).json({ error: 'Access denied' });

    // Update action
    const completedAt = status === 'complete' ? new Date().toISOString() : null;
    const [updated] = await sql`
      UPDATE improvement_actions
      SET status = ${status},
          completed_at = ${completedAt},
          completion_note = ${completion_note || null},
          updated_at = NOW()
      WHERE id = ${actionId}
      RETURNING *
    `;

    // If completing, update valuation range on company profile
    if (status === 'complete' && action.valuation_impact_cents) {
      const impactCents = action.valuation_impact_cents;
      await sql`
        UPDATE company_profiles
        SET valuation_low = COALESCE(valuation_low, 0) + ${Math.round(impactCents * 0.8)},
            valuation_high = COALESCE(valuation_high, 0) + ${impactCents},
            valuation_updated_at = NOW(),
            updated_at = NOW()
        WHERE id = ${action.company_profile_id}
      `;
    }

    return res.json(updated);
  } catch (err: any) {
    console.error('Update action error:', err.message);
    return res.status(500).json({ error: 'Failed to update action' });
  }
});

// ─── Seed improvement actions from VRR content ────────
sellerDashboardRouter.post('/seller/actions/seed', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { companyProfileId, actions } = req.body;

    if (!companyProfileId || !Array.isArray(actions)) {
      return res.status(400).json({ error: 'companyProfileId and actions array required' });
    }

    // Verify ownership
    const [profile] = await sql`
      SELECT cp.id FROM company_profiles cp
      JOIN deals d ON d.id = cp.deal_id
      WHERE cp.id = ${companyProfileId} AND d.user_id = ${userId}
    `;
    if (!profile) return res.status(403).json({ error: 'Access denied' });

    const inserted = [];
    for (const action of actions) {
      const [row] = await sql`
        INSERT INTO improvement_actions (
          company_profile_id, title, description, category,
          ebitda_impact_cents, valuation_impact_cents, difficulty, timeline_days
        ) VALUES (
          ${companyProfileId}, ${action.title}, ${action.description || null},
          ${action.category || null}, ${action.ebitda_impact_cents || null},
          ${action.valuation_impact_cents || null}, ${action.difficulty || 'medium'},
          ${action.timeline_days || null}
        )
        ON CONFLICT DO NOTHING
        RETURNING *
      `;
      if (row) inserted.push(row);
    }

    return res.json({ inserted: inserted.length });
  } catch (err: any) {
    console.error('Seed actions error:', err.message);
    return res.status(500).json({ error: 'Failed to seed actions' });
  }
});
