/**
 * OUTREACH — the campaign machine (migration 120).
 *
 * The plan (waves → steps → templates → events) and the queue (crm_touches)
 * that the 2026-08-05 seed expands the plan into. The register lives in
 * crm.ts; this file is the WORK: what is due, rendered and ready, one press
 * from sent.
 *
 * THE LINE, load-bearing here more than anywhere in the CRM: the machine
 * assembles, personalises and stages — a HUMAN releases. There is no
 * endpoint that sends more than one message, no endpoint that sends without
 * a practitioner-supplied final draft, and the send gate refuses a body that
 * still carries an unresolved {merge_field} — auto-blanking a research field
 * would mail "congratulations on ." to a Tier A fund manager. Unsubscribed
 * contacts and disqualified (do-not-pitch) accounts are excluded when the
 * queue is built AND re-checked at send time, because the seed can be re-run
 * and a human can unsubscribe someone between the two moments.
 *
 * Rendering lives in house/outreach.ts (pure, tested) so a local Cowork
 * session and the app produce byte-identical drafts from the same template.
 */
import { Router } from 'express';
import { sql } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { sendEmail, letterheadEmail } from '../services/emailService.js';
import { mergeContext, renderTemplate, hasUnresolved } from '../../house/outreach.js';

export const outreachRouter = Router();
outreachRouter.use(requireAuth);

const TOUCH_STATUSES = ['pending', 'done', 'skipped', 'replied'] as const;
const STEP_STATUSES = ['pending', 'in_progress', 'done', 'skipped'] as const;

/** Whether this touch's channel can go out as an email from the app. The
 *  plan's channel strings are prose ("LinkedIn DM / email", "Email",
 *  "LinkedIn + email") — anything naming email qualifies; LinkedIn-only,
 *  Web and Phone touches are tasks the queue tracks, not messages it sends. */
function emailChannel(channel: string | null | undefined): boolean {
  return /email/i.test(channel || '');
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** A personal note, not a marketing blast: system font, no branding, no
 *  stripe, pre-wrap so the draft's line breaks survive verbatim. The reader
 *  should see an email a person wrote — because a person approved it. */
function personalHtml(body: string): string {
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:15px;line-height:1.65;color:#1A1C1E;white-space:pre-wrap;max-width:640px;">${esc(body)}</div>`;
}

/* ── the machine, read whole ──────────────────────────────────────────── */

/** GET /api/outreach — waves with their steps (touch tallies included),
 *  events, templates, and the queue's headline numbers. One request paints
 *  the whole Outreach surface. */
outreachRouter.get('/outreach', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const [waves, steps, tallies, events, templates, [queue]] = await Promise.all([
      sql`SELECT * FROM crm_waves WHERE user_id = ${userId} ORDER BY wave_key`,
      sql`SELECT * FROM crm_sequence_steps WHERE user_id = ${userId} ORDER BY step_key`,
      sql`SELECT step_id, status, COUNT(*)::int AS n FROM crm_touches WHERE user_id = ${userId} GROUP BY step_id, status`,
      sql`SELECT * FROM crm_events WHERE user_id = ${userId} ORDER BY event_key`,
      sql`SELECT * FROM crm_templates WHERE user_id = ${userId} AND NOT archived ORDER BY template_key`,
      sql`
        SELECT COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
               COUNT(*) FILTER (WHERE status = 'pending' AND due_on <= CURRENT_DATE)::int AS due,
               COUNT(*) FILTER (WHERE status = 'sent')::int AS sent,
               COUNT(*) FILTER (WHERE status = 'replied')::int AS replied
        FROM crm_touches WHERE user_id = ${userId}
      `,
    ]);
    const byStep = new Map<number, Record<string, number>>();
    for (const t of tallies) {
      const m = byStep.get(t.step_id) ?? {};
      m[t.status] = t.n;
      byStep.set(t.step_id, m);
    }
    const stepsOut = steps.map(s => ({ ...s, touches: byStep.get(s.id) ?? {} })) as any[];
    return res.json({
      waves: waves.map(w => ({ ...w, steps: stepsOut.filter(s => s.wave_id === w.id) })),
      unwavedSteps: stepsOut.filter(s => !s.wave_id),
      events,
      templates,
      queue,
    });
  } catch (err: any) {
    console.error('Outreach read error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

/* ── the queue ────────────────────────────────────────────────────────── */

/**
 * GET /api/outreach/queue
 *   ?status=pending (default) | sent | done | skipped | replied | all
 *   ?due=1  only touches due today or earlier
 * Each row arrives RENDERED (house/outreach.ts) with its unresolved merge
 * fields named, so the client can show a draft and the send gate can be
 * honest without a second request.
 */
outreachRouter.get('/outreach/queue', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const status = String(req.query.status || 'pending');
    const dueOnly = req.query.due === '1';
    const rows = await sql`
      SELECT
        t.id, t.status, t.due_on, t.channel, t.sent_at, t.subject_sent, t.body_sent, t.last_send_error,
        s.id AS step_id, s.step_key, s.action AS step_action, s.week_of, s.objective AS step_objective,
        w.wave_key, w.name AS wave_name,
        a.id AS account_id, a.firm, a.stage, a.segment AS account_segment, a.hq_city, a.hq_state,
        a.trades AS account_trades, a.disqualified, a.archived AS account_archived,
        c.id AS contact_id, c.name AS contact_name, c.title AS contact_title,
        c.email AS contact_email, c.unsubscribed_at,
        e.id AS event_id, e.event_key, e.name AS event_name, e.date_text AS event_date,
        e.registration_status, e.prep_deadline,
        tp.id AS template_id, tp.template_key, tp.subject AS template_subject,
        tp.body AS template_body, tp.cta AS template_cta, tp.guardrails AS template_guardrails
      FROM crm_touches t
      JOIN crm_sequence_steps s ON s.id = t.step_id
      LEFT JOIN crm_waves w ON w.id = s.wave_id
      LEFT JOIN crm_accounts a ON a.id = t.account_id
      LEFT JOIN crm_contacts c ON c.id = t.contact_id
      LEFT JOIN crm_events e ON e.id = t.event_id
      LEFT JOIN crm_templates tp ON tp.id = t.template_id
      WHERE t.user_id = ${userId}
        AND (${status} = 'all' OR t.status = ${status})
        AND (${!dueOnly} OR (t.due_on IS NOT NULL AND t.due_on <= CURRENT_DATE))
      ORDER BY t.due_on ASC NULLS LAST, s.step_key ASC, a.firm ASC NULLS LAST
      LIMIT 500
    `;
    const out = rows.map(r => {
      let draft: { subject: string; body: string; unresolved: string[] } | null = null;
      if (r.template_body && r.account_id) {
        draft = renderTemplate(
          r.template_subject || '',
          r.template_body,
          mergeContext(
            { firm: r.firm, hq_city: r.hq_city, hq_state: r.hq_state, segment: r.account_segment, trades: r.account_trades },
            r.contact_id ? { name: r.contact_name, title: r.contact_title } : null,
          ),
        );
      }
      const blocked =
        r.account_archived ? 'account archived'
        : r.disqualified ? 'do-not-pitch'
        : (r.contact_id && r.unsubscribed_at) ? 'unsubscribed'
        : null;
      return {
        ...r,
        draft,
        blocked,
        canEmail: !blocked && !!r.contact_email && emailChannel(r.channel) && r.status === 'pending',
      };
    });
    return res.json({ touches: out });
  } catch (err: any) {
    console.error('Outreach queue error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

/* ── the send — one message, one press, one human ─────────────────────── */

/**
 * POST /api/outreach/touches/:id/send   { subject, body, style? }
 * The subject/body are the practitioner's FINAL draft (usually the rendered
 * template, edited). Refused while any {merge_field} survives. sent_at is
 * stamped only when the mail service actually accepted the message — the
 * honest-send law (deal_tasks.notified_at set the precedent).
 *
 * `style` is the practitioner's per-message voice (2026-08-07, Paul):
 * 'personal' (default) = bare note, how a cold first touch reads best;
 * 'letterhead' = the same words on the site's Aurora chrome, for the reader
 * who already knows the name. The audit trail stores the raw TEXT either
 * way — the wrapper is presentation, not content.
 */
outreachRouter.post('/outreach/touches/:id/send', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const id = Number(req.params.id);
    const subject = String(req.body?.subject || '').trim();
    const body = String(req.body?.body || '').trim();
    const style = req.body?.style === 'letterhead' ? 'letterhead' : 'personal';
    if (!subject || !body) return res.status(400).json({ error: 'subject and body are required' });
    if (hasUnresolved(subject) || hasUnresolved(body)) {
      return res.status(400).json({ error: 'The draft still carries {merge_fields} — fill them before sending.' });
    }

    const [t] = await sql`
      SELECT t.id, t.status, t.channel, t.account_id, t.contact_id,
             a.firm, a.disqualified, a.archived AS account_archived,
             c.name AS contact_name, c.email AS contact_email, c.unsubscribed_at
      FROM crm_touches t
      LEFT JOIN crm_accounts a ON a.id = t.account_id
      LEFT JOIN crm_contacts c ON c.id = t.contact_id
      WHERE t.id = ${id} AND t.user_id = ${userId}
    `;
    if (!t) return res.status(404).json({ error: 'No such touch' });
    if (t.status !== 'pending') return res.status(409).json({ error: `Touch is ${t.status}, not pending` });
    if (!t.contact_id || !t.contact_email) return res.status(400).json({ error: 'No contact email on this touch — name the person first.' });
    if (t.unsubscribed_at) return res.status(403).json({ error: 'This contact unsubscribed. The machine never mails them again.' });
    if (t.disqualified) return res.status(403).json({ error: 'This account is do-not-pitch.' });
    if (t.account_archived) return res.status(403).json({ error: 'This account is archived.' });
    if (!emailChannel(t.channel)) return res.status(400).json({ error: `Channel "${t.channel}" is not an email channel — mark the touch done once you have made it.` });

    const html = style === 'letterhead'
      ? letterheadEmail({ body, signatureName: 'Paul Baker', signatureRole: 'Founder · smbX.ai — buy-side corporate development' })
      : personalHtml(body);
    const delivered = await sendEmail({ to: t.contact_email, subject, html });
    if (!delivered) {
      await sql`
        UPDATE crm_touches SET last_send_error = 'Email service declined or is not configured (RESEND_API_KEY / EMAIL_FROM)', updated_at = NOW()
        WHERE id = ${id}
      `;
      return res.status(502).json({ error: 'The email service refused the message — nothing was sent, the touch is still pending.' });
    }

    const [act] = await sql`
      INSERT INTO crm_activity (account_id, contact_id, user_id, kind, direction, subject, body)
      VALUES (${t.account_id}, ${t.contact_id}, ${userId}, 'email', 'out', ${subject}, ${body})
      RETURNING id
    `;
    const [updated] = await sql`
      UPDATE crm_touches SET
        status = 'sent', sent_at = NOW(), subject_sent = ${subject}, body_sent = ${body},
        last_send_error = NULL, activity_id = ${act.id}, updated_at = NOW()
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `;
    return res.json({ touch: updated });
  } catch (err: any) {
    console.error('Outreach send error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

/** PATCH /api/outreach/touches/:id  { status }
 *  done (a LinkedIn/call/web touch made by hand) · skipped · replied ·
 *  pending (undo). 'sent' is NOT settable here — that word is reserved for
 *  the send endpoint's audit trail. */
outreachRouter.patch('/outreach/touches/:id', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const id = Number(req.params.id);
    const status = String(req.body?.status || '');
    if (!TOUCH_STATUSES.includes(status as any)) {
      return res.status(400).json({ error: `status must be one of ${TOUCH_STATUSES.join(', ')}` });
    }
    const [updated] = await sql`
      UPDATE crm_touches SET status = ${status}, updated_at = NOW()
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `;
    if (!updated) return res.status(404).json({ error: 'No such touch' });
    return res.json({ touch: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/** PATCH /api/outreach/steps/:id  { status } — the step-level checklist. */
outreachRouter.patch('/outreach/steps/:id', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const id = Number(req.params.id);
    const status = String(req.body?.status || '');
    if (!STEP_STATUSES.includes(status as any)) {
      return res.status(400).json({ error: `status must be one of ${STEP_STATUSES.join(', ')}` });
    }
    const [updated] = await sql`
      UPDATE crm_sequence_steps SET status = ${status}, updated_at = NOW()
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `;
    if (!updated) return res.status(404).json({ error: 'No such step' });
    return res.json({ step: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
