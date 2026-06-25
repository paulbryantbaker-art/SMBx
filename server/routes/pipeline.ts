/**
 * Pipeline Routes — Deal listing, velocity tracking, deal summary
 */
import { Router } from 'express';
import { sql } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

export const pipelineRouter = Router();
pipelineRouter.use(requireAuth);

// ─── Portfolio summary aggregations (Phase C.1) ──────────────
//
// Returns an aggregated rollup of the user's deals — weighted EV,
// counts by gate, expected close-window distribution. The data layer
// for the V6 PortfolioOverviewCard. The card UI itself is deferred
// until CD specs the design (per the rolled-back baseline at fd1c6b4),
// but shipping the endpoint now means CD can wire to a real backend.

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
      // postgres-js returns numeric columns as STRINGS — coerce before summing,
      // or `totalEvCents += value` concatenates instead of adding (weightedEv
      // only worked because `value * prob` coerces).
      const raw = d.asking_price ?? deriveEvCents(d);
      const value = typeof raw === 'number' ? raw : (Number(raw) || 0);
      const composite = Number(d.seven_factor_composite);
      const prob = Number.isFinite(composite) && composite > 0 ? composite / 100 : 0.5;
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
    // 4-5 gates = "this quarter", 2-3 = "next quarter", 0-1 = "6+ months".
    // A real expected-close-date computation lands in Phase 4.
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
  const userId = (req as any).userId;
  try {
    const deals = await sql`
      SELECT d.id, d.journey_type, d.current_gate, d.status, d.league,
             d.business_name, d.name, d.is_favorite, d.disposition,
             d.industry, d.revenue, d.sde, d.ebitda,
             d.asking_price, d.location, d.financials,
             d.seven_factor_composite,
             d.created_at, d.updated_at,
             (SELECT COUNT(*) FROM deliverables del WHERE del.deal_id = d.id AND del.status = 'complete') as deliverable_count,
             (SELECT COUNT(*) FROM data_room_documents doc WHERE doc.deal_id = d.id) as document_count,
             (SELECT c.id FROM conversations c WHERE c.deal_id = d.id ORDER BY c.updated_at DESC LIMIT 1) as conversation_id
      FROM deals d
      WHERE d.user_id = ${userId}
      ORDER BY d.is_favorite DESC, d.updated_at DESC
    `;
    return res.json(deals);
  } catch (err: any) {
    // RESILIENCE: the preferred query references OPTIONAL columns (name, is_favorite,
    // disposition — added by late base-schema edits / migration 095) and three
    // correlated subqueries. If it fails for ANY reason, fall back to a BULLETPROOF
    // query that touches ONLY original base-schema `deals` columns + literal defaults
    // for everything optional. It cannot fail on a missing column or subquery table,
    // so the Deals board NEVER blanks. (Was the prod HTTP 500: d.name didn't exist and
    // the old fallback still selected it.) `name` is omitted here → the client's
    // nameOf() falls back to business_name. deliverable/document counts the mobile
    // board doesn't render, so 0/NULL is safe.
    console.warn('[deals] preferred query failed — bulletproof fallback:', err?.message);
    try {
      const deals = await sql`
        SELECT d.id, d.journey_type, d.current_gate, d.status, d.league,
               d.business_name, NULL as name, FALSE as is_favorite, 'active' as disposition,
               d.industry, d.revenue, d.sde, d.ebitda,
               d.asking_price, d.location, d.financials,
               d.seven_factor_composite,
               d.created_at, d.updated_at,
               0 as deliverable_count, 0 as document_count, NULL as conversation_id
        FROM deals d
        WHERE d.user_id = ${userId}
        ORDER BY d.updated_at DESC
      `;
      return res.json(deals);
    } catch (e2: any) {
      console.error('List deals error (both queries failed):', e2.message);
      return res.status(500).json({ error: 'Failed to list deals' });
    }
  }
});

// ─── Update deal metadata (rename / favorite / disposition) ──
// Rename → deals.name; star → is_favorite; defer → disposition='deferred'
// (Yulia then does no background reading). updated_at is NOT bumped: these are
// metadata, not analysis-source changes, so they don't trigger a brief regen.
pipelineRouter.patch('/deals/:dealId', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const dealId = parseInt(req.params.dealId, 10);
    if (!Number.isFinite(dealId)) return res.status(400).json({ error: 'Bad deal id' });

    const [owned] = await sql`SELECT id FROM deals WHERE id = ${dealId} AND user_id = ${userId}`;
    if (!owned) return res.status(404).json({ error: 'Deal not found' });

    const body = (req.body ?? {}) as { name?: unknown; is_favorite?: unknown; disposition?: unknown };
    const updates: Record<string, unknown> = {};
    if (typeof body.name === 'string') updates.name = body.name.trim().slice(0, 200) || null;
    if (typeof body.is_favorite === 'boolean') updates.is_favorite = body.is_favorite;
    if (typeof body.disposition === 'string') {
      if (!['active', 'deferred'].includes(body.disposition)) {
        return res.status(400).json({ error: 'Invalid disposition (active | deferred)' });
      }
      updates.disposition = body.disposition;
    }
    if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No updatable fields' });

    const [updated] = await sql`
      UPDATE deals SET ${sql(updates)}
      WHERE id = ${dealId} AND user_id = ${userId}
      RETURNING id, business_name, name, is_favorite, disposition, status
    `;
    return res.json(updated);
  } catch (err: any) {
    console.error('Update deal error:', err.message);
    return res.status(500).json({ error: 'Failed to update deal' });
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
