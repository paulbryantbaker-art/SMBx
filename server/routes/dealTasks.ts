/**
 * DEAL TASKS — an action a deal needs from someone, including someone outside
 * the practice (migration 115).
 *
 * Paul: "if the deal needs an action from a CPA it needs to send the CPA an
 * email to say hey you have an action dude or whoever it might be."
 *
 * The assignee may be a CPA, an attorney, a lender — anyone in the address book,
 * or a bare email address. They NEVER get an account: CLAUDE.md's rule is that
 * third parties are corresponded with, never onboarded. They get an email, and
 * where a document is involved, a token share link.
 *
 * ── THE LINE ────────────────────────────────────────────────────────────
 * The notification is a REQUEST FOR WORK from the practitioner to a professional
 * they have engaged. So the email:
 *   - is sent only when a human presses send; nothing here fires on a schedule
 *   - identifies the practice and names Paul as the reply-to
 *   - states the action, the deal, and the date, and nothing else
 *   - never negotiates, never quotes or discusses a fee, never asks the
 *     professional for an opinion the practice would then present as its own
 * `taskEmailHtml` is deliberately plain and hard to drift: no template
 * variables beyond the task's own fields.
 *
 * ── MAIL IS LOAD-BEARING ────────────────────────────────────────────────
 * `sendEmail` returns false when RESEND_API_KEY is unset (it logs to console
 * instead). `notified_at` is set ONLY on a true return, and the route reports
 * `sent: false` with the reason, so the UI can never claim an inbox that will
 * stay empty. Same rule reportAccess.ts follows.
 */
import { Router } from 'express';
import { sql } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { sendEmail } from '../services/emailService.js';

export const dealTasksRouter = Router();
dealTasksRouter.use(requireAuth);

export const TASK_STATUSES = ['open', 'waiting', 'done', 'cancelled'] as const;

/** Roles that decide who gets which email. Free text is accepted — a register of
 *  professions can never be complete — but these are the ones the UI offers. */
export const CONTACT_ROLES = [
  'principal', 'cpa', 'attorney', 'lender', 'broker', 'banker',
  'insurance', 'appraiser', 'operator', 'other',
] as const;

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function dateOrNull(v: unknown): string | null {
  const s = String(v ?? '').trim().slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && Number.isFinite(Date.parse(s)) ? s : null;
}

async function ownsDeal(userId: number, dealId: number) {
  const [d] = await sql`
    SELECT id, business_name, name FROM deals WHERE id = ${dealId} AND user_id = ${userId}
  `;
  return d ?? null;
}

/**
 * The notification body. Plain on purpose — a professional wants the ask, the
 * deal, and the date. No branding flourish, no marketing footer, and NO
 * unsubscribe link: this is transactional correspondence on a live engagement,
 * not a campaign, and offering to unsubscribe someone from their own engagement
 * would be nonsense. Campaign mail is a separate path with its own footer.
 */
function taskEmailHtml(opts: {
  assigneeName: string | null;
  title: string;
  detail: string | null;
  dealLabel: string;
  dueOn: string | null;
  fromName: string;
  fromEmail: string;
}): string {
  const greeting = opts.assigneeName ? `Hi ${esc(opts.assigneeName)},` : 'Hi,';
  const due = opts.dueOn
    ? `<p style="margin:0 0 14px;"><strong>Needed by:</strong> ${esc(opts.dueOn)}</p>`
    : '';
  const detail = opts.detail
    ? `<p style="margin:0 0 14px;white-space:pre-wrap;">${esc(opts.detail)}</p>`
    : '';
  return `<!doctype html>
<html><body style="margin:0;padding:24px;background:#FFFFFF;font:15px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#16181A;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid rgba(20,24,28,0.10);border-radius:14px;padding:28px;">
    <p style="margin:0 0 14px;">${greeting}</p>
    <p style="margin:0 0 14px;">There's an item outstanding on <strong>${esc(opts.dealLabel)}</strong>:</p>
    <p style="margin:0 0 14px;padding:12px 14px;background:#DFF5EC;border-radius:10px;"><strong>${esc(opts.title)}</strong></p>
    ${detail}
    ${due}
    <p style="margin:0 0 14px;">Reply to this email and it comes straight to me.</p>
    <p style="margin:0;">${esc(opts.fromName)}<br>
      <a href="mailto:${esc(opts.fromEmail)}" style="color:#0A7A58;">${esc(opts.fromEmail)}</a><br>
      <span style="color:#5A6169;">smbX — buy-side corporate development</span>
    </p>
  </div>
</body></html>`;
}

/* ── read ─────────────────────────────────────────────────────────────── */

/** GET /api/deals/:dealId/tasks */
dealTasksRouter.get('/deals/:dealId/tasks', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const dealId = Number(req.params.dealId);
    if (!Number.isInteger(dealId) || !(await ownsDeal(userId, dealId))) {
      return res.status(404).json({ error: 'Deal not found' });
    }
    const rows = await sql`
      SELECT t.*, c.name AS contact_name, c.email AS contact_email, c.role AS contact_role
      FROM deal_tasks t
      LEFT JOIN crm_contacts c ON c.id = t.assignee_contact_id
      WHERE t.deal_id = ${dealId}
      ORDER BY
        CASE t.status WHEN 'open' THEN 0 WHEN 'waiting' THEN 1 ELSE 2 END,
        t.due_on NULLS LAST, t.created_at DESC
    `;
    return res.json(rows);
  } catch (err: any) {
    console.error('Deal tasks list error:', err.message);
    return res.status(500).json({ error: 'Failed to list tasks' });
  }
});

/**
 * GET /api/tasks — everything outstanding with a third party, across every deal.
 * The question that makes this a management tool: "who am I waiting on."
 */
dealTasksRouter.get('/tasks', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const dueOnly = req.query.due === '1' || req.query.due === 'true';
    const rows = await sql`
      SELECT t.*, d.business_name, d.name AS deal_name,
             c.name AS contact_name, c.email AS contact_email
      FROM deal_tasks t
      JOIN deals d ON d.id = t.deal_id AND d.archived = FALSE
      LEFT JOIN crm_contacts c ON c.id = t.assignee_contact_id
      WHERE d.user_id = ${userId}
        AND t.status IN ('open', 'waiting')
        ${dueOnly ? sql`AND t.due_on IS NOT NULL AND t.due_on <= CURRENT_DATE` : sql``}
      ORDER BY t.due_on NULLS LAST, t.created_at DESC
      LIMIT 200
    `;
    return res.json(rows);
  } catch (err: any) {
    console.error('Task list error:', err.message);
    return res.status(500).json({ error: 'Failed to list tasks' });
  }
});

/* ── write ────────────────────────────────────────────────────────────── */

/**
 * POST /api/deals/:dealId/tasks
 * { title, detail?, assignee_contact_id? | assignee_email?, due_on?, notify? }
 *
 * `notify: true` sends the email in the same request. Default FALSE — creating
 * the record and telling somebody are different decisions, and a task typed to
 * think out loud must not mail a CPA on the way in.
 */
dealTasksRouter.post('/deals/:dealId/tasks', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const dealId = Number(req.params.dealId);
    const deal = Number.isInteger(dealId) ? await ownsDeal(userId, dealId) : null;
    if (!deal) return res.status(404).json({ error: 'Deal not found' });

    const b = req.body ?? {};
    const title = String(b.title ?? '').trim();
    if (!title) return res.status(400).json({ error: 'title is required' });

    // Resolve the assignee: a contact from the address book, or a bare email.
    let contactId: number | null = null;
    let email: string | null = null;
    let name: string | null = null;
    let role: string | null = null;

    if (b.assignee_contact_id != null && b.assignee_contact_id !== '') {
      const id = Number(b.assignee_contact_id);
      if (!Number.isInteger(id)) return res.status(400).json({ error: 'Bad assignee_contact_id' });
      // Ownership through the account — a task must not be able to name a
      // contact belonging to somebody else.
      const [c] = await sql`
        SELECT c.id, c.name, c.email, c.role
        FROM crm_contacts c
        JOIN crm_accounts a ON a.id = c.account_id
        WHERE c.id = ${id} AND a.user_id = ${userId}
      `;
      if (!c) return res.status(404).json({ error: 'Contact not found' });
      contactId = c.id; email = c.email; name = c.name; role = c.role;
    }
    if (typeof b.assignee_email === 'string' && b.assignee_email.trim()) {
      email = b.assignee_email.trim().slice(0, 200);
    }
    if (typeof b.assignee_name === 'string' && b.assignee_name.trim()) {
      name = b.assignee_name.trim().slice(0, 200);
    }

    const [row] = await sql`
      INSERT INTO deal_tasks
        (deal_id, user_id, title, detail, assignee_contact_id, assignee_email,
         assignee_name, assignee_role, due_on, status)
      VALUES
        (${dealId}, ${userId}, ${title.slice(0, 300)},
         ${typeof b.detail === 'string' ? b.detail.slice(0, 4000) : null},
         ${contactId}, ${email}, ${name}, ${role}, ${dateOrNull(b.due_on)}, 'open')
      RETURNING *
    `;

    if (b.notify === true) {
      const result = await notifyTask(userId, row.id);
      return res.json({ ...row, ...result });
    }
    return res.json(row);
  } catch (err: any) {
    console.error('Create task error:', err.message);
    return res.status(500).json({ error: `Failed to create task: ${err.message}` });
  }
});

/** PATCH /api/deals/:dealId/tasks/:taskId — status, due date, wording. */
dealTasksRouter.patch('/deals/:dealId/tasks/:taskId', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const dealId = Number(req.params.dealId);
    const taskId = Number(req.params.taskId);
    if (!Number.isInteger(dealId) || !Number.isInteger(taskId)) {
      return res.status(400).json({ error: 'Bad id' });
    }
    if (!(await ownsDeal(userId, dealId))) return res.status(404).json({ error: 'Deal not found' });

    const b = req.body ?? {};
    const updates: Record<string, unknown> = {};
    if (typeof b.title === 'string' && b.title.trim()) updates.title = b.title.trim().slice(0, 300);
    if (typeof b.detail === 'string') updates.detail = b.detail.slice(0, 4000) || null;
    if ('due_on' in b) updates.due_on = dateOrNull(b.due_on);
    if (typeof b.status === 'string') {
      if (!TASK_STATUSES.includes(b.status as never)) {
        return res.status(400).json({ error: `Invalid status (${TASK_STATUSES.join(' | ')})` });
      }
      updates.status = b.status;
      // Stamp the completion so "how long did that take" is answerable later.
      updates.completed_at = b.status === 'done' ? new Date() : null;
    }
    if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No updatable fields' });
    updates.updated_at = new Date();

    const [row] = await sql`
      UPDATE deal_tasks SET ${sql(updates)}
      WHERE id = ${taskId} AND deal_id = ${dealId}
      RETURNING *
    `;
    if (!row) return res.status(404).json({ error: 'Task not found' });
    return res.json(row);
  } catch (err: any) {
    console.error('Update task error:', err.message);
    return res.status(500).json({ error: 'Failed to update task' });
  }
});

/**
 * The send. Separated from the routes so create-with-notify and the explicit
 * "remind them" button run identical code.
 *
 * Moves the task to `waiting` on a successful send — the state means "asked, not
 * yet delivered", which is different from `open` ("we know it's needed") and is
 * the distinction that makes a chase list possible.
 */
async function notifyTask(userId: number, taskId: number): Promise<{
  sent: boolean; reason?: string;
}> {
  const [task] = await sql`
    SELECT t.*, d.business_name, d.name AS deal_name
    FROM deal_tasks t
    JOIN deals d ON d.id = t.deal_id
    WHERE t.id = ${taskId} AND d.user_id = ${userId}
  `;
  if (!task) return { sent: false, reason: 'Task not found' };

  const to = (task.assignee_email ?? '').trim();
  if (!to) {
    return { sent: false, reason: 'No email address on this assignee — add one first.' };
  }

  const [me] = await sql`SELECT email, display_name FROM users WHERE id = ${userId}`;
  const fromEmail = (me?.email ?? '').trim();
  const fromName = (me?.display_name ?? '').trim() || fromEmail || 'smbX';

  const html = taskEmailHtml({
    assigneeName: task.assignee_name ?? null,
    title: task.title,
    detail: task.detail ?? null,
    dealLabel: task.business_name || task.deal_name || 'a live deal',
    dueOn: task.due_on ? String(task.due_on).slice(0, 10) : null,
    fromName,
    fromEmail,
  });

  const ok = await sendEmail({
    to,
    subject: `Action needed — ${task.title}`.slice(0, 180),
    html,
  });

  if (!ok) {
    await sql`
      UPDATE deal_tasks
      SET last_notify_error = 'Mail not sent — RESEND_API_KEY / EMAIL_FROM not configured',
          updated_at = NOW()
      WHERE id = ${taskId}
    `;
    return {
      sent: false,
      reason: 'Mail is not configured (RESEND_API_KEY / EMAIL_FROM), so nothing was sent.',
    };
  }

  await sql`
    UPDATE deal_tasks
    SET notified_at = NOW(), notify_count = notify_count + 1,
        last_notify_error = NULL,
        status = CASE WHEN status = 'open' THEN 'waiting' ELSE status END,
        updated_at = NOW()
    WHERE id = ${taskId}
  `;

  // Log it against the client's history when the assignee is in the address
  // book, so a firm's record shows every time we asked them for something.
  if (task.assignee_contact_id) {
    try {
      await sql`
        INSERT INTO crm_activity (account_id, contact_id, user_id, kind, direction, subject, body)
        SELECT c.account_id, c.id, ${userId}, 'email', 'out',
               ${`Action requested — ${task.title}`.slice(0, 300)}, ${task.detail ?? null}
        FROM crm_contacts c WHERE c.id = ${task.assignee_contact_id}
      `;
    } catch (e: any) {
      // The mail went. Failing to log it must not report a failed send.
      console.warn('[tasks] activity log failed:', e?.message);
    }
  }
  return { sent: true };
}

/** POST /api/deals/:dealId/tasks/:taskId/notify — send, or send again. */
dealTasksRouter.post('/deals/:dealId/tasks/:taskId/notify', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const dealId = Number(req.params.dealId);
    const taskId = Number(req.params.taskId);
    if (!Number.isInteger(dealId) || !Number.isInteger(taskId)) {
      return res.status(400).json({ error: 'Bad id' });
    }
    if (!(await ownsDeal(userId, dealId))) return res.status(404).json({ error: 'Deal not found' });

    const result = await notifyTask(userId, taskId);
    // 200 with sent:false — the caller needs the reason, and a 500 would read as
    // a server fault when the real answer is "no key" or "no email address".
    return res.json(result);
  } catch (err: any) {
    console.error('Notify task error:', err.message);
    return res.status(500).json({ error: 'Failed to send' });
  }
});
