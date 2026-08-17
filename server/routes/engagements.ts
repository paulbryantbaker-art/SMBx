/**
 * ENGAGEMENTS + LEAD CONVERSION — the CRM's spine, over HTTP.
 *
 * Function 1's two missing objects (FRONT_END_REBUILD.md §3), now routed:
 *
 *   GET    /api/crm/accounts/:accountId/engagements
 *   POST   /api/crm/accounts/:accountId/engagements
 *   PATCH  /api/crm/engagements/:id
 *
 *   GET    /api/crm/leads              the unworked funnel leads
 *   POST   /api/crm/leads/:id/convert  lead → crm_accounts row, recorded
 *   POST   /api/crm/leads/:id/dismiss
 *
 * ── CALLS NO MODEL ──────────────────────────────────────────────────────
 * Forms and SQL, plus house/engagement.ts arithmetic on read. THE SPLIT's
 * whole point: a CRM spends nothing.
 *
 * ── FACTS IN, ARITHMETIC OUT ────────────────────────────────────────────
 * The table stores what HAPPENED — dates, cents received, status. The fee
 * schedule's consequences (months covered, what the retainer is worth at a
 * close) are computed by house/engagement.ts on every read and never stored,
 * so a stored fee can never drift from the schedule that defines it.
 *
 * ── THE LINE ────────────────────────────────────────────────────────────
 * Converting a lead creates an ACCOUNT — a row the practice works. It sends
 * nothing. The lead gave their email to the practice's own funnel; the first
 * human touch still goes through the outreach machine's one-touch-one-press
 * rule, and nothing here contacts anybody.
 */
import { Router } from 'express';
import { sql } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import {
  successFee, retainerCredit, MONTH_RETAINER_CENTS, SCHEDULE_SUMMARY,
} from '../../house/engagement.js';

export const engagementsRouter = Router();
engagementsRouter.use(requireAuth);

/* One engagement row + everything the schedule says about it. */
function view(row: any) {
  const paid = Number(row.retainer_paid_cents ?? 0);
  const rate = Number(row.month_rate_cents ?? MONTH_RETAINER_CENTS);
  /* Whole months the money on hand covers — floor, not round: a month is
     paid up front or it is not covered. */
  const monthsCovered = rate > 0 ? Math.floor(paid / rate) : 0;
  const credit = retainerCredit({
    retainerPaidCents: paid,
    /* The fee needs an EV, which an engagement does not have until a deal
       closes under it — so the standing view carries the credit RULES against
       a zero fee (closed: false), which house/engagement.ts renders as the
       honest "no close, no credit" statement. A close computes the real thing
       with the real EV. */
    feeCents: 0,
    closed: false,
  });
  return {
    id: row.id,
    crmAccountId: row.crm_account_id,
    status: row.status,
    letterSignedOn: row.letter_signed_on,
    startedOn: row.started_on,
    monthRateCents: rate,
    retainerPaidCents: paid,
    premium: row.premium,
    notes: row.notes,
    monthsCovered,
    creditRule: credit.ok ? credit.credit.workings[0] : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

engagementsRouter.get('/crm/accounts/:accountId/engagements', async (req, res) => {
  const userId = (req as any).user?.id as number;
  const accountId = Number(req.params.accountId);
  if (!Number.isFinite(accountId)) return res.status(400).json({ error: 'Bad account id' });
  const rows = await sql`
    SELECT * FROM engagements
    WHERE crm_account_id = ${accountId} AND user_id = ${userId}
    ORDER BY created_at DESC
  `;
  res.json({ engagements: rows.map(view), schedule: SCHEDULE_SUMMARY });
});

engagementsRouter.post('/crm/accounts/:accountId/engagements', async (req, res) => {
  const userId = (req as any).user?.id as number;
  const accountId = Number(req.params.accountId);
  if (!Number.isFinite(accountId)) return res.status(400).json({ error: 'Bad account id' });

  const [account] = await sql`
    SELECT id FROM crm_accounts WHERE id = ${accountId} AND user_id = ${userId}
  `;
  if (!account) return res.status(404).json({ error: 'Account not found' });

  const b = req.body ?? {};
  const startedOn = typeof b.startedOn === 'string' && b.startedOn ? b.startedOn : null;
  const letterSignedOn = typeof b.letterSignedOn === 'string' && b.letterSignedOn ? b.letterSignedOn : null;
  const premium = b.premium === true;
  const notes = typeof b.notes === 'string' ? b.notes.slice(0, 2000) : null;

  const [row] = await sql`
    INSERT INTO engagements (user_id, crm_account_id, status, letter_signed_on, started_on, premium, notes)
    VALUES (${userId}, ${accountId}, ${letterSignedOn ? 'active' : 'draft'}, ${letterSignedOn}, ${startedOn}, ${premium}, ${notes})
    RETURNING *
  `;
  res.json({ engagement: view(row) });
});

const PATCHABLE_STATUS = new Set(['draft', 'active', 'paused', 'ended', 'closed']);

engagementsRouter.patch('/crm/engagements/:id', async (req, res) => {
  const userId = (req as any).user?.id as number;
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Bad engagement id' });

  const [row] = await sql`SELECT * FROM engagements WHERE id = ${id} AND user_id = ${userId}`;
  if (!row) return res.status(404).json({ error: 'Engagement not found' });

  const b = req.body ?? {};
  const next: Record<string, unknown> = {};
  if (typeof b.status === 'string') {
    if (!PATCHABLE_STATUS.has(b.status)) {
      return res.status(400).json({ error: `Unknown status "${b.status}". Known: ${[...PATCHABLE_STATUS].join(', ')}.` });
    }
    next.status = b.status;
  }
  if (b.retainerPaidCents !== undefined) {
    const v = Number(b.retainerPaidCents);
    /* Integer cents, non-negative, and it only moves FORWARD by default:
       retainer received is a running fact, and a typo that shrinks it is more
       likely a mistake than a refund (the schedule has no refunds). An
       explicit `allowDecrease: true` overrides for the correction case. */
    if (!Number.isInteger(v) || v < 0) {
      return res.status(400).json({ error: 'retainerPaidCents must be non-negative integer cents.' });
    }
    if (v < Number(row.retainer_paid_cents) && b.allowDecrease !== true) {
      return res.status(400).json({
        error: `retainerPaidCents would DECREASE from ${row.retainer_paid_cents} to ${v}. The schedule has no refunds, so this is probably a typo — pass allowDecrease: true if it is a deliberate correction.`,
      });
    }
    next.retainer_paid_cents = v;
  }
  if (typeof b.letterSignedOn === 'string' && b.letterSignedOn) next.letter_signed_on = b.letterSignedOn;
  if (typeof b.startedOn === 'string' && b.startedOn) next.started_on = b.startedOn;
  if (b.premium !== undefined) next.premium = b.premium === true;
  if (typeof b.notes === 'string') next.notes = b.notes.slice(0, 2000);

  if (Object.keys(next).length === 0) return res.json({ engagement: view(row) });

  const [updated] = await sql`
    UPDATE engagements SET ${sql(next)}, updated_at = NOW()
    WHERE id = ${id} AND user_id = ${userId}
    RETURNING *
  `;
  res.json({ engagement: view(updated) });
});

/* ── the close: the one place the fee arithmetic runs with a real EV ───── */

engagementsRouter.post('/crm/engagements/:id/close-preview', async (req, res) => {
  const userId = (req as any).user?.id as number;
  const id = Number(req.params.id);
  const [row] = await sql`SELECT * FROM engagements WHERE id = ${id} AND user_id = ${userId}`;
  if (!row) return res.status(404).json({ error: 'Engagement not found' });

  const evCents = Number(req.body?.evCents);
  const f = successFee(evCents);
  if (!f.ok) return res.status(400).json({ error: f.why });
  const credit = retainerCredit({
    retainerPaidCents: Number(row.retainer_paid_cents ?? 0),
    feeCents: f.fee.feeCents,
    closed: true,
  });
  if (!credit.ok) return res.status(400).json({ error: credit.why });
  /* A PREVIEW writes nothing — the practitioner is doing arithmetic, not
     closing. Setting status='closed' is the explicit PATCH above, taken
     deliberately after the letter's own close mechanics run. */
  res.json({ fee: f.fee, credit: credit.credit });
});

/* ── leads: the funnel finally reaches the CRM ─────────────────────────── */

engagementsRouter.get('/crm/leads', async (_req, res) => {
  /* practice_leads has no user_id — it is the practice's shared public-funnel
     inbox (single-practice by law, so every team member sees the same
     worklist). Unconverted and undismissed only; history stays queryable. */
  const rows = await sql`
    SELECT id, persona, thesis, size_geo, email, source, created_at
    FROM practice_leads
    WHERE converted_account_id IS NULL AND dismissed_at IS NULL
    ORDER BY created_at DESC
    LIMIT 100
  `;
  res.json({ leads: rows });
});

engagementsRouter.post('/crm/leads/:id/convert', async (req, res) => {
  const userId = (req as any).user?.id as number;
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Bad lead id' });

  const [lead] = await sql`SELECT * FROM practice_leads WHERE id = ${id}`;
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  if (lead.converted_account_id) {
    return res.status(409).json({ error: `Already converted to account ${lead.converted_account_id}.` });
  }

  /* The firm name is the practitioner's to supply — the funnel captures a
     persona and an email, not a company, and inventing a firm name from an
     email domain is exactly the fabricated-CRM-contact failure the workspace
     laws warn about (a fabricated contact gets EMAILED). Refuse without it. */
  const firm = typeof req.body?.firm === 'string' ? req.body.firm.trim() : '';
  if (!firm) {
    return res.status(400).json({ error: 'A firm name is required to convert — the funnel does not capture one, and it will not be invented from the email domain.' });
  }

  const notes = [
    `Converted from a practice-site lead (${lead.created_at?.toISOString?.().slice(0, 10) ?? 'date unknown'}).`,
    lead.persona ? `Persona: ${lead.persona}.` : null,
    lead.thesis ? `Thesis, in their words: ${lead.thesis}` : null,
    lead.size_geo ? `Size / geography: ${lead.size_geo}` : null,
  ].filter(Boolean).join('\n');

  const [account] = await sql`
    INSERT INTO crm_accounts (user_id, firm, kind, stage, source_url, notes)
    VALUES (${userId}, ${firm}, 'acquirer', 'lead', 'practice-site lead', ${notes})
    RETURNING id, firm
  `;

  /* The email travels as a CONTACT — nameless, honestly: the funnel never
     asked for a name, and the CRM's own doctrine is that a firm with no named
     contact is a research task before it is a lead. */
  if (lead.email) {
    await sql`
      INSERT INTO crm_contacts (account_id, name, email, is_primary, notes)
      VALUES (${account.id}, ${'(name not captured by the funnel)'}, ${lead.email}, TRUE, 'From the practice-site intake — confirm the person before any outreach.')
    `;
  }

  await sql`
    UPDATE practice_leads SET converted_account_id = ${account.id}, converted_at = NOW()
    WHERE id = ${id}
  `;
  res.json({ accountId: account.id, firm: account.firm });
});

engagementsRouter.post('/crm/leads/:id/dismiss', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Bad lead id' });
  const [lead] = await sql`
    UPDATE practice_leads SET dismissed_at = NOW()
    WHERE id = ${id} AND converted_account_id IS NULL
    RETURNING id
  `;
  if (!lead) return res.status(404).json({ error: 'Lead not found (or already converted — a converted lead cannot be dismissed).' });
  res.json({ ok: true });
});
