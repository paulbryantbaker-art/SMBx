/**
 * LEADS — the LinkedIn stage (SMBX_CRM_V2_SPEC.md §2.1/§3; migration 132).
 *
 * The conversation happens IN LinkedIn; the TRACKING happens here. A lead is
 * a person Paul found and is working manually — no scraper, no automation,
 * no sends (standing prohibition: the account already absorbed one
 * throttling). This router is a follow-up queue, nothing more.
 *
 * ── THE LADDER'S DEFAULTS ARE PROMPTS ───────────────────────────────────
 * identified → +2d (send the invite) · invited → +7d · connected → +3d ·
 * in_thread → +4d · ready → today (convert now). A create or status move
 * that names no date gets the default; Paul's own date always wins. Every
 * OPEN lead therefore carries a date, which is the whole reason Today works.
 *
 * ── ONE-TAP TOUCHES ─────────────────────────────────────────────────────
 * invited / messaged / commented / replied write a crm_activity row (the one
 * timeline) and stamp last_touch_at. Two advance the status when it lags
 * behind reality — logging 'invited' from identified, or 'replied' from
 * invited/connected — because the touch IS the evidence of the move, and
 * asking for a second tap to say the same thing is how logging dies.
 *
 * A drop requires its reason, same law as a lost pursuit.
 */
import { Router } from 'express';
import { sql } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

export const leadsRouter = Router();
leadsRouter.use(requireAuth);

export const LEAD_STATUSES = [
  'identified', 'invited', 'connected', 'in_thread', 'ready', 'dropped', 'converted',
] as const;

export const LEAD_TOUCHES = ['invited', 'messaged', 'commented', 'replied'] as const;

export const DROP_REASONS = [
  'no_response_x3', 'wrong_person', 'org_disqualified', 'other',
] as const;

/** Default follow-up offset in days, per status — prompts, not automation. */
export const FOLLOW_UP_DEFAULT_DAYS: Record<string, number> = {
  identified: 2, invited: 7, connected: 3, in_thread: 4, ready: 0,
};

function plusDays(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function dateOrNull(v: unknown): string | null {
  const s = String(v ?? '').trim().slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && Number.isFinite(Date.parse(s)) ? s : null;
}

const OPEN = sql`status NOT IN ('dropped', 'converted')`;

/** GET /api/leads?due=1&all=1 — the queue. Default: open leads, soonest first. */
leadsRouter.get('/leads', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const rows = await sql`
      SELECT l.*, a.firm AS account_firm, a.tier AS account_tier
      FROM crm_leads l
      LEFT JOIN crm_accounts a ON a.id = l.account_id
      WHERE l.user_id = ${userId}
        ${req.query.all ? sql`` : sql`AND ${OPEN}`}
        ${req.query.due ? sql`AND l.next_follow_up_on IS NOT NULL AND l.next_follow_up_on <= CURRENT_DATE AND ${OPEN}` : sql``}
      ORDER BY l.next_follow_up_on ASC NULLS LAST, l.updated_at DESC
    `;
    return res.json({ leads: rows });
  } catch (err: any) {
    console.error('leads list error:', err.message);
    return res.status(500).json({ error: 'Failed to list leads' });
  }
});

/** GET /api/leads/:id — the thin record: the row + its timeline. */
leadsRouter.get('/leads/:id', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Bad id' });
    const [lead] = await sql`
      SELECT l.*, a.firm AS account_firm FROM crm_leads l
      LEFT JOIN crm_accounts a ON a.id = l.account_id
      WHERE l.id = ${id} AND l.user_id = ${userId}
    `;
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    const activity = await sql`
      SELECT * FROM crm_activity WHERE lead_id = ${id} ORDER BY occurred_at DESC LIMIT 100
    `;
    return res.json({ lead, activity });
  } catch (err: any) {
    console.error('lead get error:', err.message);
    return res.status(500).json({ error: 'Failed to load the lead' });
  }
});

/**
 * POST /api/leads — quick-add. Name is the only requirement (≤15 seconds is
 * the whole design). Org resolves against the pushed universe by name;
 * unresolved org text is KEPT, resolvable later, never a blocker.
 */
leadsRouter.post('/leads', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const name = String(req.body?.name ?? '').trim();
    if (!name) return res.status(400).json({ error: 'name is required' });

    const status = (LEAD_STATUSES as readonly string[]).includes(req.body?.status)
      && req.body.status !== 'dropped' && req.body.status !== 'converted'
      ? req.body.status : 'identified';

    const orgText = String(req.body?.org ?? '').trim();
    let accountId: number | null = null;
    if (orgText) {
      const [acc] = await sql`
        SELECT id FROM crm_accounts
        WHERE user_id = ${userId} AND LOWER(firm) = ${orgText.toLowerCase()} AND archived = FALSE
        LIMIT 1
      `;
      accountId = acc?.id ?? null;
    }

    const nextOn = dateOrNull(req.body?.next_follow_up_on)
      ?? plusDays(FOLLOW_UP_DEFAULT_DAYS[status] ?? 2);

    const [row] = await sql`
      INSERT INTO crm_leads
        (user_id, name, account_id, org_text, linkedin_url, status, next_follow_up_on, source, notes)
      VALUES
        (${userId}, ${name.slice(0, 200)}, ${accountId}, ${orgText || null},
         ${String(req.body?.linkedin_url ?? '').trim() || null}, ${status}, ${nextOn},
         ${String(req.body?.source ?? '').trim() || null},
         ${String(req.body?.notes ?? '').trim() || null})
      RETURNING *
    `;
    return res.json(row);
  } catch (err: any) {
    console.error('lead create error:', err.message);
    return res.status(500).json({ error: 'Failed to add the lead' });
  }
});

/** PATCH /api/leads/:id — status, date, notes, org, url. Drop needs a reason. */
leadsRouter.patch('/leads/:id', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Bad id' });
    const [owned] = await sql`SELECT * FROM crm_leads WHERE id = ${id} AND user_id = ${userId}`;
    if (!owned) return res.status(404).json({ error: 'Lead not found' });

    const b = req.body ?? {};
    const updates: Record<string, unknown> = {};

    if (typeof b.status === 'string') {
      if (!(LEAD_STATUSES as readonly string[]).includes(b.status)) {
        return res.status(400).json({ error: `Invalid status (${LEAD_STATUSES.join(' | ')})` });
      }
      if (b.status === 'dropped') {
        const reason = String(b.dropped_reason ?? '').trim();
        if (!(DROP_REASONS as readonly string[]).includes(reason)) {
          return res.status(400).json({ error: `Dropping a lead needs a reason (${DROP_REASONS.join(' | ')})` });
        }
        updates.dropped_reason = reason;
      }
      updates.status = b.status;
      // The no-dateless-lead law: a status move without a date gets the
      // ladder's default; dropped/converted need none.
      if (b.status !== 'dropped' && b.status !== 'converted' && !dateOrNull(b.next_follow_up_on)) {
        updates.next_follow_up_on = plusDays(FOLLOW_UP_DEFAULT_DAYS[b.status] ?? 2);
      }
    }
    if ('next_follow_up_on' in b) {
      const d = dateOrNull(b.next_follow_up_on);
      if (d) updates.next_follow_up_on = d;
    }
    if (typeof b.notes === 'string') updates.notes = b.notes;
    if (typeof b.linkedin_url === 'string') updates.linkedin_url = b.linkedin_url.trim() || null;
    if (typeof b.source === 'string') updates.source = b.source.trim() || null;
    if (typeof b.org === 'string') {
      const orgText = b.org.trim();
      updates.org_text = orgText || null;
      const [acc] = orgText ? await sql`
        SELECT id FROM crm_accounts
        WHERE user_id = ${userId} AND LOWER(firm) = ${orgText.toLowerCase()} AND archived = FALSE LIMIT 1
      ` : [null as any];
      updates.account_id = acc?.id ?? null;
    }

    if (!Object.keys(updates).length) return res.json(owned);
    updates.updated_at = new Date();
    const [row] = await sql`UPDATE crm_leads SET ${sql(updates)} WHERE id = ${id} RETURNING *`;
    return res.json(row);
  } catch (err: any) {
    console.error('lead patch error:', err.message);
    return res.status(500).json({ error: 'Failed to update the lead' });
  }
});

/** POST /api/leads/:id/touch {kind, next_follow_up_on?} — one tap, one row. */
leadsRouter.post('/leads/:id/touch', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Bad id' });
    const [lead] = await sql`SELECT * FROM crm_leads WHERE id = ${id} AND user_id = ${userId}`;
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    const kind = String(req.body?.kind ?? '');
    if (!(LEAD_TOUCHES as readonly string[]).includes(kind)) {
      return res.status(400).json({ error: `Invalid touch (${LEAD_TOUCHES.join(' | ')})` });
    }

    await sql`
      INSERT INTO crm_activity (lead_id, account_id, user_id, kind, direction, subject)
      VALUES (${id}, ${lead.account_id}, ${userId}, 'note',
              ${kind === 'replied' ? 'in' : 'out'}, ${'linkedin: ' + kind})
    `;

    // The touch IS the evidence of the move — advance a lagging status
    // rather than asking for a second tap to say the same thing.
    let status = lead.status;
    if (kind === 'invited' && status === 'identified') status = 'invited';
    if (kind === 'replied' && (status === 'invited' || status === 'connected')) status = 'in_thread';

    const nextOn = dateOrNull(req.body?.next_follow_up_on)
      ?? plusDays(FOLLOW_UP_DEFAULT_DAYS[status] ?? 4);

    const [row] = await sql`
      UPDATE crm_leads
      SET last_touch_at = NOW(), status = ${status}, next_follow_up_on = ${nextOn}, updated_at = NOW()
      WHERE id = ${id} RETURNING *
    `;
    return res.json(row);
  } catch (err: any) {
    console.error('lead touch error:', err.message);
    return res.status(500).json({ error: 'Failed to log the touch' });
  }
});
