/**
 * Pipeline Routes — Deal listing, velocity tracking, deal summary
 */
import { Router } from 'express';
import { sql } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

export const pipelineRouter = Router();
pipelineRouter.use(requireAuth);

// ─── Portfolio summary aggregations (B2.8) ───────────────────
//
// Returns an aggregated rollup of the user's deals — weighted EV,
// counts by gate, expected close-window distribution. Powers the V6
// PortfolioOverviewCard on the home page (desktop) and the Pipeline
// header (mobile). See architecture_portfolio_overview_card.md.

pipelineRouter.get('/portfolio/summary', async (req, res) => {
  try {
    const userId = (req as any).userId;

    const deals = await sql`
      SELECT d.id, d.journey_type, d.current_gate, d.status, d.league,
             d.revenue, d.sde, d.ebitda, d.asking_price,
             d.seven_factor_composite, d.financials,
             d.created_at, d.updated_at
      FROM deals d
      WHERE d.user_id = ${userId} AND d.status = 'active'
    `;

    // Weighted EV: sum of (asking_price OR derived value) × probability.
    // Probability = seven_factor_composite / 100 (default 0.5 when missing).
    let weightedEvCents = 0;
    let totalEvCents = 0;
    for (const d of deals) {
      const value = d.asking_price ?? deriveEvCents(d);
      const prob = typeof d.seven_factor_composite === 'number' && d.seven_factor_composite > 0
        ? d.seven_factor_composite / 100
        : 0.5;
      weightedEvCents += value * prob;
      totalEvCents += value;
    }

    // Counts by gate
    const byGate: Record<string, number> = {};
    for (const d of deals) {
      const g = d.current_gate || 'UNKNOWN';
      byGate[g] = (byGate[g] || 0) + 1;
    }
    const byGateArray = Object.entries(byGate)
      .map(([gate, count]) => ({ gate, count }))
      .sort((a, b) => a.gate.localeCompare(b.gate));

    // Close-window: rough heuristic based on current gate.
    // 4-5 gates = "this month/quarter", 2-3 = "next quarter", 0-1 = "6+ months"
    let thisQuarter = 0;
    let nextQuarter = 0;
    let beyond = 0;
    for (const d of deals) {
      const gate = d.current_gate || '';
      const num = parseInt(gate.replace(/[^0-9]/g, ''), 10);
      if (num >= 4) thisQuarter++;
      else if (num >= 2) nextQuarter++;
      else beyond++;
    }

    return res.json({
      totalActive: deals.length,
      weightedEvCents: Math.round(weightedEvCents),
      totalEvCents,
      byGate: byGateArray,
      byCloseWindow: [
        { window: 'this_quarter', label: 'This quarter', count: thisQuarter },
        { window: 'next_quarter', label: 'Next quarter', count: nextQuarter },
        { window: 'beyond',       label: '6+ months',    count: beyond },
      ],
    });
  } catch (err: any) {
    console.error('Portfolio summary error:', err.message);
    return res.status(500).json({ error: 'Failed to compute portfolio summary' });
  }
});

function deriveEvCents(d: any): number {
  // Fall back to a multiple-based estimate when asking_price isn't on the deal.
  const ebitda = d.ebitda ?? d.sde ?? 0;
  const mult = d.financials?.multiple ?? 5;
  return Math.round(ebitda * mult);
}

// ─── List all deals for user ─────────────────────────────────

pipelineRouter.get('/deals', async (req, res) => {
  try {
    const userId = (req as any).userId;

    const deals = await sql`
      SELECT d.id, d.journey_type, d.current_gate, d.status, d.league,
             d.business_name, d.industry, d.revenue, d.sde, d.ebitda,
             d.asking_price, d.location, d.financials,
             d.seven_factor_composite,
             d.created_at, d.updated_at,
             (SELECT COUNT(*) FROM deliverables del WHERE del.deal_id = d.id AND del.status = 'complete') as deliverable_count,
             (SELECT COUNT(*) FROM data_room_documents doc WHERE doc.deal_id = d.id) as document_count,
             (SELECT c.id FROM conversations c WHERE c.deal_id = d.id ORDER BY c.updated_at DESC LIMIT 1) as conversation_id
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
