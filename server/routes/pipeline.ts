/**
 * Pipeline Routes — Deal listing, velocity tracking, deal summary
 */
import { Router } from 'express';
import { sql } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

export const pipelineRouter = Router();
pipelineRouter.use(requireAuth);

// ─── List all deals for user ─────────────────────────────────

pipelineRouter.get('/deals', async (req, res) => {
  try {
    const userId = (req as any).userId;

    const deals = await sql`
      SELECT d.id, d.journey_type, d.current_gate, d.status, d.league,
             d.business_name, d.industry, d.revenue, d.sde, d.ebitda,
             d.asking_price, d.location, d.created_at, d.updated_at,
             (SELECT COUNT(*) FROM deliverables del WHERE del.deal_id = d.id AND del.status = 'complete') as deliverable_count,
             (SELECT COUNT(*) FROM data_room_documents doc WHERE doc.deal_id = d.id) as document_count
      FROM deals d
      WHERE d.user_id = ${userId}
      ORDER BY d.updated_at DESC
    `;

    return res.json(deals);
  } catch (err: any) {
    console.error('List deals error:', err.message);
    return res.status(500).json({ error: 'Failed to list deals' });
  }
});

// ─── Get deal detail with velocity data ──────────────────────

pipelineRouter.get('/deals/:dealId', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const dealId = parseInt(req.params.dealId, 10);

    const [deal] = await sql`
      SELECT * FROM deals WHERE id = ${dealId} AND user_id = ${userId}
    `;
    if (!deal) return res.status(404).json({ error: 'Deal not found' });

    // Gate progress
    const gates = await sql`
      SELECT gate, status, completed_at
      FROM gate_progress
      WHERE deal_id = ${dealId}
      ORDER BY gate
    `;

    // Gate events for velocity
    const events = await sql`
      SELECT from_gate, to_gate, event_type, created_at
      FROM gate_events
      WHERE deal_id = ${dealId}
      ORDER BY created_at ASC
    `;

    // Calculate time in each gate
    const velocity: Record<string, number> = {};
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const prevTime = i > 0 ? new Date(events[i - 1].created_at).getTime() : new Date(deal.created_at).getTime();
      const thisTime = new Date(event.created_at).getTime();
      const durationMs = thisTime - prevTime;
      velocity[event.from_gate] = durationMs;
    }

    // Deliverables count
    const [deliverableStats] = await sql`
      SELECT COUNT(*) as total,
             COUNT(*) FILTER (WHERE status = 'complete') as completed,
             COUNT(*) FILTER (WHERE status = 'generating' OR status = 'queued') as in_progress
      FROM deliverables
      WHERE deal_id = ${dealId}
    `;

    return res.json({
      deal,
      gates,
      events,
      velocity,
      deliverableStats: deliverableStats || { total: 0, completed: 0, in_progress: 0 },
    });
  } catch (err: any) {
    console.error('Get deal detail error:', err.message);
    return res.status(500).json({ error: 'Failed to get deal details' });
  }
});
