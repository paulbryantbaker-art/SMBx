/**
 * REPORTS — the four fixed reads (CRM_WORKFLOW_SPEC.md build item 6:
 * "the four fixed reports (loss-reason histogram first — it tests the P4
 * hypothesis)").
 *
 * OPINIONATED, NOT A BUILDER. Each endpoint answers one standing question the
 * practice actually asks; there is no query surface, no saved-report table,
 * no model call anywhere in this file. Everything is a read-only aggregate
 * over rows the practitioner already owns.
 *
 * ::int ON EVERY COUNT AND AVG. postgres-js returns int8/numeric as STRINGS
 * to protect precision, and "0" is truthy — the bug that silently disarmed
 * Clients.tsx's no-contact flag (see the comment in routes/crm.ts). Nothing
 * numeric leaves this file uncast.
 */
import { Router } from 'express';
import { sql } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

export const reportsRouter = Router();
reportsRouter.use(requireAuth);

/**
 * GET /api/reports/funnel — the CLIENT funnel's shape.
 *   stages:    per-stage count + average days the current residents have sat
 *              there (from stage_entered_at, migration 130 — never updated_at,
 *              which moves on every note).
 *   losses:    the loss-reason histogram. This is the P4-hypothesis evidence —
 *              whether "internal BD owns origination" is the pattern that
 *              beats us.
 */
reportsRouter.get('/reports/funnel', async (req, res) => {
  try {
    const userId = (req as any).userId;

    const stages = await sql`
      SELECT stage, COUNT(*)::int AS n,
             -- NULL when no resident carries a stamp (pre-130 rows before
             -- their first move) — the client prints "Not available", never 0.
             ROUND(AVG(EXTRACT(EPOCH FROM (NOW() - stage_entered_at)) / 86400))::int AS avg_days
      FROM crm_accounts
      WHERE user_id = ${userId} AND archived = FALSE
        AND COALESCE(kind, 'acquirer') = 'acquirer'
      GROUP BY stage
    `;

    // Archived losses stay in the histogram on purpose: archiving a dead
    // pursuit is filing, and filing must not erase the evidence of WHY it died.
    const losses = await sql`
      SELECT loss_reason, COUNT(*)::int AS n
      FROM crm_accounts
      WHERE user_id = ${userId} AND COALESCE(kind, 'acquirer') = 'acquirer'
        AND stage = 'lost'
      GROUP BY loss_reason
      ORDER BY n DESC, loss_reason ASC NULLS LAST
    `;
    const lossTotal = losses.reduce((sum, r) => sum + (r.n ?? 0), 0);

    return res.json({ stages, losses, lossTotal });
  } catch (err: any) {
    console.error('reports funnel error:', err.message);
    return res.status(500).json({ error: 'Failed to build the funnel report' });
  }
});

/**
 * GET /api/reports/outreach — per wave, what the campaign machine owes and
 * what it has produced. Touches reach a wave through their step (migration
 * 120: crm_touches → crm_sequence_steps → crm_waves).
 */
reportsRouter.get('/reports/outreach', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const waves = await sql`
      SELECT w.id, w.wave_key, w.name, w.status, w.start_on, w.end_on,
             COUNT(t.id)::int AS total,
             COUNT(t.id) FILTER (WHERE t.status = 'sent')::int    AS sent,
             COUNT(t.id) FILTER (WHERE t.status = 'done')::int    AS done,
             COUNT(t.id) FILTER (WHERE t.status = 'pending')::int AS pending,
             COUNT(t.id) FILTER (WHERE t.status = 'skipped')::int AS skipped,
             COUNT(t.id) FILTER (WHERE t.status = 'replied')::int AS replied
      FROM crm_waves w
      LEFT JOIN crm_sequence_steps s ON s.wave_id = w.id
      LEFT JOIN crm_touches t ON t.step_id = s.id
      WHERE w.user_id = ${userId}
      GROUP BY w.id
      ORDER BY w.start_on ASC NULLS LAST, w.wave_key ASC
    `;
    return res.json({ waves });
  } catch (err: any) {
    console.error('reports outreach error:', err.message);
    return res.status(500).json({ error: 'Failed to build the outreach report' });
  }
});

/**
 * GET /api/reports/activity — touches logged per ISO week for the last 12
 * weeks, plus the deal-task ledger. The series is generated server-side so a
 * quiet week arrives as an explicit 0 — a week with no logged touches is a
 * REAL zero (we counted and found none), unlike a missing figure.
 */
reportsRouter.get('/reports/activity', async (req, res) => {
  try {
    const userId = (req as any).userId;

    const weeks = await sql`
      SELECT to_char(g.week, 'YYYY-MM-DD') AS week_start,
             COALESCE(a.n, 0)::int AS n
      FROM generate_series(
             date_trunc('week', NOW()) - interval '11 weeks',
             date_trunc('week', NOW()),
             interval '1 week'
           ) AS g(week)
      LEFT JOIN (
        SELECT date_trunc('week', occurred_at) AS wk, COUNT(*)::int AS n
        FROM crm_activity
        WHERE user_id = ${userId}
          AND occurred_at >= date_trunc('week', NOW()) - interval '11 weeks'
        GROUP BY 1
      ) a ON a.wk = g.week
      ORDER BY g.week ASC
    `;

    // Statuses reported separately — "waiting on them" is not the same fact
    // as "to ask", and folding them together would hide the chase list.
    const [tasks] = await sql`
      SELECT COUNT(*) FILTER (WHERE status = 'open')::int      AS open,
             COUNT(*) FILTER (WHERE status = 'waiting')::int   AS waiting,
             COUNT(*) FILTER (WHERE status = 'done')::int      AS done,
             COUNT(*) FILTER (WHERE status = 'cancelled')::int AS cancelled
      FROM deal_tasks
      WHERE user_id = ${userId}
    `;

    return res.json({
      weeks,
      tasks: tasks ?? { open: 0, waiting: 0, done: 0, cancelled: 0 },
    });
  } catch (err: any) {
    console.error('reports activity error:', err.message);
    return res.status(500).json({ error: 'Failed to build the activity report' });
  }
});
