/**
 * TARGETS — the deal funnel's pre-IoI half (CRM_WORKFLOW_SPEC.md §3.1;
 * migration 131; Paul, 2026-08-16: "All of this needs to be running in app
 * properly" — adopting the spec's target pipeline and the IoI promotion).
 *
 * A target is a `crm_accounts` row with kind='target': a company being
 * originated toward an IoI decision, FOR a client (client_account_id; null
 * means the house mandate — the spec's rule that the model never needs a
 * null client is satisfied by letting null MEAN house).
 *
 * ── THE SEAM, KEPT NARROW ───────────────────────────────────────────────
 * Enumeration, enrichment, screening and pre-IoI MATH stay in Cowork
 * (`house/screen.ts`, the workbench) — targets ARRIVE here via push-crm or
 * are added by hand, they are not found here. What lives here is
 * RELATIONSHIP state: which stage, which wave, who said what. Workbench
 * numbers land as stamped activity notes, never as live models.
 *
 * ── THE PROMOTION (the spec's four-step migration law) ──────────────────
 * At target_stage='ioi_decision', POST /promote runs the defined event:
 * a Deal is created for the client (gate B2 — the IoI is its first job),
 * the receipt is written into the target's activity, and the target
 * FREEZES: promoted_deal_id is both the pointer and the read-only flag,
 * and every write path here refuses a frozen row. One target, one deal,
 * one direction.
 *
 * ── AGING SHARES THE COLUMN ─────────────────────────────────────────────
 * `stage_entered_at` (migration 130) serves target_stage here exactly as it
 * serves the client stage on client rows — an account is in ONE funnel, so
 * the clock cannot be claimed twice.
 */
import { Router } from 'express';
import { sql } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { TARGET_STAGES } from './crm.js';

export const targetsRouter = Router();
targetsRouter.use(requireAuth);

function frozen(row: any): boolean {
  return row?.promoted_deal_id != null;
}

/** GET /api/crm/targets?client=<accountId>|house|all — the origination board. */
targetsRouter.get('/crm/targets', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const client = String(req.query.client ?? 'all');
    const clientId = Number(client);

    const rows = await sql`
      SELECT a.id, a.firm, a.domain, a.hq_city, a.hq_state, a.trades, a.notes,
             a.target_stage, a.client_account_id, a.promoted_deal_id,
             a.stage_entered_at, a.disqualified, a.tier, a.score,
             c.firm AS client_firm,
             (SELECT MAX(v.occurred_at) FROM crm_activity v WHERE v.account_id = a.id) AS last_touch_at,
             (SELECT w.name
                FROM crm_touches t
                JOIN crm_sequence_steps s ON s.id = t.step_id
                JOIN crm_waves w ON w.id = s.wave_id
               WHERE t.account_id = a.id
               ORDER BY t.created_at DESC LIMIT 1) AS wave_name,
             (SELECT COUNT(*)::int FROM crm_touches t
               WHERE t.account_id = a.id AND t.status = 'pending') AS touches_pending
      FROM crm_accounts a
      LEFT JOIN crm_accounts c ON c.id = a.client_account_id
      WHERE a.user_id = ${userId} AND a.kind = 'target' AND a.archived = FALSE
        ${Number.isInteger(clientId) && clientId > 0 ? sql`AND a.client_account_id = ${clientId}` : sql``}
        ${client === 'house' ? sql`AND a.client_account_id IS NULL` : sql``}
      ORDER BY a.promoted_deal_id IS NOT NULL, (a.disqualified IS NOT NULL),
               a.stage_entered_at ASC NULLS LAST, a.firm ASC
    `;
    return res.json({ targets: rows, stages: TARGET_STAGES });
  } catch (err: any) {
    console.error('targets list error:', err.message);
    return res.status(500).json({ error: 'Failed to list targets' });
  }
});

/** POST /api/crm/targets — add one by hand (the rare path; push-crm is the
 *  usual arrival). Refuses without a firm name — never invent one. */
targetsRouter.post('/crm/targets', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const firm = String(req.body?.firm ?? '').trim();
    if (!firm) return res.status(400).json({ error: 'firm (the target company) is required' });

    const clientId = Number(req.body?.client_account_id);
    if (Number.isInteger(clientId) && clientId > 0) {
      const [owner] = await sql`
        SELECT id FROM crm_accounts WHERE id = ${clientId} AND user_id = ${userId}
      `;
      if (!owner) return res.status(404).json({ error: 'Client account not found' });
    }

    const [row] = await sql`
      INSERT INTO crm_accounts
        (user_id, firm, kind, target_stage, client_account_id, stage_entered_at, notes)
      VALUES
        (${userId}, ${firm.slice(0, 200)}, 'target', 'sourced',
         ${Number.isInteger(clientId) && clientId > 0 ? clientId : null}, NOW(),
         ${typeof req.body?.notes === 'string' ? req.body.notes.slice(0, 2000) : null})
      RETURNING *
    `;
    return res.json(row);
  } catch (err: any) {
    console.error('target create error:', err.message);
    return res.status(500).json({ error: 'Failed to add the target' });
  }
});

/** PATCH /api/crm/targets/:id — stage, disqualification, client link.
 *  A promoted target is READ-ONLY: the deal is where the work lives now. */
targetsRouter.patch('/crm/targets/:id', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Bad id' });

    const [row] = await sql`
      SELECT * FROM crm_accounts WHERE id = ${id} AND user_id = ${userId} AND kind = 'target'
    `;
    if (!row) return res.status(404).json({ error: 'Target not found' });
    if (frozen(row)) {
      return res.status(409).json({
        error: `Promoted targets are read-only — this one became deal #${row.promoted_deal_id}. Work it there.`,
      });
    }

    const b = req.body ?? {};
    const updates: Record<string, unknown> = {};

    if (typeof b.target_stage === 'string') {
      if (!(TARGET_STAGES as readonly string[]).includes(b.target_stage)) {
        return res.status(400).json({ error: `Invalid target_stage (${TARGET_STAGES.join(' | ')})` });
      }
      if (b.target_stage !== row.target_stage) updates.stage_entered_at = new Date();
      updates.target_stage = b.target_stage;
    }
    if ('disqualified' in b) updates.disqualified = String(b.disqualified ?? '').trim() || null;
    if ('client_account_id' in b) {
      const cid = Number(b.client_account_id);
      updates.client_account_id = Number.isInteger(cid) && cid > 0 ? cid : null;
    }
    if (typeof b.notes === 'string') updates.notes = b.notes;
    if (typeof b.next_action === 'string') updates.next_action = b.next_action.trim().slice(0, 400) || null;
    if ('next_action_on' in b) {
      const d = String(b.next_action_on ?? '').slice(0, 10);
      updates.next_action_on = /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null;
    }

    if (!Object.keys(updates).length) return res.json(row);
    updates.updated_at = new Date();
    const [saved] = await sql`
      UPDATE crm_accounts SET ${sql(updates)} WHERE id = ${id} RETURNING *
    `;
    return res.json(saved);
  } catch (err: any) {
    console.error('target patch error:', err.message);
    return res.status(500).json({ error: 'Failed to update the target' });
  }
});

/** POST /api/crm/targets/:id/promote — THE SEAM. IoI decision = go. */
targetsRouter.post('/crm/targets/:id/promote', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Bad id' });

    const [t] = await sql`
      SELECT * FROM crm_accounts WHERE id = ${id} AND user_id = ${userId} AND kind = 'target'
    `;
    if (!t) return res.status(404).json({ error: 'Target not found' });
    if (frozen(t)) {
      return res.status(409).json({ error: `Already promoted — deal #${t.promoted_deal_id}.` });
    }
    if (t.target_stage !== 'ioi_decision') {
      return res.status(400).json({
        error: 'Promotion happens at the IoI decision. Move the target to "IoI decision" first — the stage IS the checklist gate.',
      });
    }
    if (t.disqualified) {
      return res.status(400).json({ error: `This target is disqualified (${t.disqualified}) — clear that first if the decision has changed.` });
    }

    // The deal starts at B2: the IoI is its first piece of work, and the
    // valuation basis behind it arrived as stamped workbench notes.
    const [deal] = await sql`
      INSERT INTO deals
        (user_id, journey_type, current_gate, status, business_name, name,
         industry, location, crm_account_id, next_action)
      VALUES
        (${userId}, 'buy', 'B2', 'active', ${t.firm}, ${t.firm},
         ${t.trades ?? null},
         ${[t.hq_city, t.hq_state].filter(Boolean).join(', ') || null},
         ${t.client_account_id ?? null}, 'Issue the IoI')
      RETURNING id, business_name, current_gate
    `;

    await sql`
      UPDATE crm_accounts SET promoted_deal_id = ${deal.id}, updated_at = NOW() WHERE id = ${id}
    `;
    // The receipt, on the record that froze — the spec's migration law.
    await sql`
      INSERT INTO crm_activity (account_id, user_id, kind, subject, body)
      VALUES (${id}, ${userId}, 'stage_change', 'Promoted to deal',
              ${'IoI decision: go. This target is now deal #' + deal.id + ' and this record is read-only.'})
    `;
    return res.json({ dealId: deal.id, businessName: deal.business_name, gate: deal.current_gate });
  } catch (err: any) {
    console.error('target promote error:', err.message);
    return res.status(500).json({ error: 'Promotion failed — nothing was frozen' });
  }
});
