/**
 * Verified-email access to the research PDFs (2026-07-29).
 *
 * Paul: "enter the email and have a button 'get the PDF', and the PDF is
 * delivered to that email — that solves both problems." It does, and it's the
 * neatest form of the thing: **delivery IS the verification.** The report is
 * open to everyone on the page; the PDF goes to an inbox, so a fake address
 * simply never receives it. No separate confirm-your-address hurdle, and the
 * addresses that reach Paul are ones that actually work.
 *
 * The flow:
 *   1. Reader gives an address and presses Get the PDF → `issueAccess` stores a
 *      token, saves the lead, and MAILS THE REPORT: the PDF as an attachment,
 *      plus a link in the body for anyone whose gateway strips attachments.
 *      Nothing is released to the browser.
 *   2. Opening that link marks the address confirmed and sets a signed,
 *      HttpOnly reader cookie (180 days), then redirects to `?dl=1` so the
 *      download also starts in the browser.
 *   3. That cookie releases the file from `/api/practice/reports/:slug/file`
 *      for that report and every later one — so a reader who has already had a
 *      report delivered gets the next one in one click.
 *
 * Mail is therefore load-bearing: `issueAccess` reports whether it actually
 * sent, and the UI refuses to point at an inbox that will stay empty.
 * (Practice mode restricts real accounts to the team allowlist, so a literal
 * login would have meant nobody but the team could ever download; this is the
 * equivalent that works for an outside acquirer.)
 *
 * The PDFs live in `content/reports/`, deliberately OUTSIDE `client/public`:
 * anything under public is served statically by Express, so the old
 * `/reports/<slug>.pdf` URL let anyone skip the gate by typing it.
 *
 * Team members holding a normal app JWT are let straight through — Paul should
 * never have to email himself a link to open his own research.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { createSql } from '../dbConfig.js';
import { sendEmail, signatureHtml } from './emailService.js';
import { findReport } from '../../shared/reports.js';

/** How long a mailed link stays good. Long enough to survive an inbox triage,
 *  short enough that a forwarded email isn't a permanent key. */
const LINK_TTL_HOURS = 48;
/** How long a verified reader stays verified. */
const READER_TTL_DAYS = 180;

export const READER_COOKIE = 'smbx_reader';
/** Readable companion so the page can render the unlocked state without a
 *  round trip. It grants nothing — the HttpOnly cookie above is the credential. */
export const READER_HINT_COOKIE = 'smbx_reader_ok';

const secret = () => process.env.JWT_SECRET || process.env.SESSION_SECRET || 'dev';

/* ── the PDF on disk ────────────────────────────────────────────────────── */

/** Resolve `content/reports/` in both `npx tsx server/index.ts` (repo root) and
 *  the container (WORKDIR /app, bundle at /app/dist/server). */
export function reportPdfPath(slug: string): string | null {
  if (!/^[a-z0-9-]+$/i.test(slug)) return null; // no traversal, ever
  const candidates = [
    path.join(process.cwd(), 'content/reports', `${slug}.pdf`),
    path.resolve(new URL('.', import.meta.url).pathname, '../../content/reports', `${slug}.pdf`),
    path.resolve(process.cwd(), '../content/reports', `${slug}.pdf`),
  ];
  return candidates.find(existsSync) || null;
}

/* ── the reader credential ──────────────────────────────────────────────── */

export function mintReaderToken(email: string): string {
  return jwt.sign({ rdr: email.toLowerCase() }, secret(), { expiresIn: `${READER_TTL_DAYS}d` });
}

/** The verified reader's email, or null. */
export function readerFromCookie(cookieHeader?: string): string | null {
  const raw = parseCookie(cookieHeader)[READER_COOKIE];
  if (!raw) return null;
  try {
    const decoded = jwt.verify(raw, secret()) as { rdr?: string };
    return decoded.rdr || null;
  } catch {
    return null; // expired or tampered — ask again
  }
}

/** Minimal cookie-header parser: one credential, not worth a dependency. */
export function parseCookie(header?: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq < 0) continue;
    const k = part.slice(0, eq).trim();
    if (k) out[k] = decodeURIComponent(part.slice(eq + 1).trim());
  }
  return out;
}

export function readerCookieOptions(): { httpOnly: boolean; sameSite: 'lax'; secure: boolean; maxAge: number; path: string } {
  return {
    httpOnly: true,
    // Lax so the cookie is set on the top-level navigation from the email link.
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: READER_TTL_DAYS * 24 * 60 * 60 * 1000,
    path: '/',
  };
}

/* ── issue + verify ─────────────────────────────────────────────────────── */

const VALID_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export interface IssueResult { ok: boolean; reason?: string; emailed?: boolean }

/** Store a token and mail the unlock link. */
export async function issueAccess(input: {
  email: string; slug: string; appUrl: string; ip?: string | null;
}): Promise<IssueResult> {
  const email = String(input.email || '').trim().toLowerCase().slice(0, 320);
  if (!VALID_EMAIL.test(email)) return { ok: false, reason: 'invalid_email' };

  const report = findReport(input.slug);
  if (!report) return { ok: false, reason: 'unknown_report' };

  const token = crypto.randomBytes(32).toString('base64url');
  const expires = new Date(Date.now() + LINK_TTL_HOURS * 60 * 60 * 1000);

  const sql = createSql();
  try {
    await sql`
      INSERT INTO report_access (email, slug, token, expires_at, ip)
      VALUES (${email}, ${report.slug}, ${token}, ${expires}, ${input.ip || null})
    `;
  } finally {
    await sql.end();
  }

  // New mail points at /research. The server still answers /reports/:slug/unlock
  // for every link already sitting in an inbox — see the handler in index.ts.
  const link = `${input.appUrl.replace(/\/$/, '')}/research/${report.slug}/unlock?t=${token}`;

  // Attach the report itself — the point of the flow is that the PDF ARRIVES,
  // not that the reader is sent on an errand. The link in the body covers the
  // case where a corporate gateway strips attachments, and sendEmail retries
  // without the file rather than losing the message.
  const file = reportPdfPath(report.slug);
  const attachments = file
    ? [{ filename: `smbX-${report.slug}.pdf`, content: readFileSync(file) }]
    : undefined;
  if (!file) console.error(`[report-access] PDF missing on disk for ${report.slug}; mailing link only`);

  const emailed = await sendEmail({
    to: email,
    subject: `Your copy of ${report.shortTitle}`,
    html: deliveryEmailHtml(report.shortTitle, report.kicker, link, !!attachments,
      unsubscribeLink(input.appUrl, email)),
    attachments,
  });

  // The lead is worth keeping whether or not the mail lands.
  void recordLead(email, report.slug);

  return { ok: true, emailed };
}

export interface VerifyResult { ok: boolean; email?: string; slug?: string; reason?: string }

/** Confirm a mailed token. Reusable inside its window — people click twice. */
export async function verifyToken(token: string): Promise<VerifyResult> {
  if (!token || token.length > 200) return { ok: false, reason: 'bad_token' };
  const sql = createSql();
  try {
    const rows = await sql`
      SELECT id, email, slug, expires_at FROM report_access
      WHERE token = ${token} LIMIT 1
    `;
    const row = rows[0];
    if (!row) return { ok: false, reason: 'bad_token' };
    if (new Date(row.expires_at).getTime() < Date.now()) return { ok: false, reason: 'expired' };

    await sql`
      UPDATE report_access SET verified_at = COALESCE(verified_at, NOW()) WHERE id = ${row.id}
    `;
    return { ok: true, email: row.email, slug: row.slug };
  } finally {
    await sql.end();
  }
}

/** Note an actual retrieval against the reader's most recent request. */
export async function recordDownload(email: string, slug: string): Promise<void> {
  const sql = createSql();
  try {
    await sql`
      UPDATE report_access
      SET download_count = download_count + 1, last_download_at = NOW()
      WHERE id = (
        SELECT id FROM report_access
        WHERE LOWER(email) = ${email.toLowerCase()} AND slug = ${slug}
        ORDER BY created_at DESC LIMIT 1
      )
    `;

    // Paul, 2026-07-29: tell him when someone confirms and takes a report.
    // ONCE per person per report — a second read of the same file is not news,
    // and a notification that cries wolf gets filtered within a week. Their
    // FULL history rides along, because the buying signal isn't one download,
    // it's an acquirer who has now taken three.
    const [row] = await sql`
      SELECT COALESCE(SUM(download_count), 0)::int AS downloads
      FROM report_access
      WHERE LOWER(email) = ${email.toLowerCase()} AND slug = ${slug}
    `;
    if (Number(row?.downloads) === 1) {
      const history = await sql`
        SELECT slug, MIN(created_at) AS first_asked, SUM(download_count)::int AS downloads
        FROM report_access
        WHERE LOWER(email) = ${email.toLowerCase()}
        GROUP BY slug ORDER BY MIN(created_at)
      `;
      void notifyDownload(email, slug, history as any[]);
    }
  } catch {
    /* the file matters more than the counter */
  } finally {
    await sql.end();
  }
}

/** Tell the practitioner. Best-effort: a failed notification must never cost
 *  the reader their download. */
async function notifyDownload(
  email: string,
  slug: string,
  history: { slug: string; first_asked: Date; downloads: number }[],
): Promise<void> {
  try {
    const { teamAllowlist } = await import('./practiceMode.js');
    const to = teamAllowlist()[0];
    if (!to) return;

    const report = findReport(slug);
    const esc = (v: string) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const returning = history.length > 1;
    const rows = history.map(h => {
      const r = findReport(h.slug);
      return `<tr>
        <td style="padding:6px 16px 6px 0;font-size:14px;color:#14181C">${esc(r?.shortTitle || h.slug)}</td>
        <td style="padding:6px 0;font-size:13px;color:#8A9099;white-space:nowrap">${new Date(h.first_asked).toISOString().slice(0, 10)}</td>
      </tr>`;
    }).join('');

    await sendEmail({
      to,
      subject: `${returning ? 'Returning reader' : 'Report download'}: ${email}`,
      html: `<div style="font-family:-apple-system,'Segoe UI',sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#14181C">
  <div style="font-size:12px;letter-spacing:.11em;text-transform:uppercase;color:#B08637;font-weight:600">${returning ? 'Came back' : 'New reader'}</div>
  <h1 style="margin:10px 0 4px;font-size:22px;line-height:1.3;font-weight:600">${esc(email)}</h1>
  <p style="margin:0 0 22px;font-size:15px;line-height:1.6;color:#3F464C">
    Confirmed their address and took <strong>${esc(report?.shortTitle || slug)}</strong>.
  </p>
  <table style="border-collapse:collapse;margin:0 0 22px">
    <tr><td colspan="2" style="padding-bottom:8px;font-size:11px;letter-spacing:.09em;text-transform:uppercase;color:#8A9099">Everything they've taken</td></tr>
    ${rows}
  </table>
  <p style="margin:0;font-size:13px;line-height:1.6;color:#8A9099">
    They agreed to occasional research, so they're on the campaign list unless they unsubscribe.
  </p>
</div>`,
    });
  } catch (err: any) {
    console.error('[report-access] download notification failed:', err?.message);
  }
}

/**
 * The exact notice shown beneath the email field, stored verbatim with every
 * lead. If this wording changes, existing rows keep the version THEY were
 * shown — the only version that matters if anyone ever asks what they agreed
 * to. Keep it in sync with DownloadCard's fine print.
 */
export const REPORT_CONSENT_NOTICE =
  "We'll send the PDF straight to that address, and occasional research after that. Unsubscribe any time.";

/** Persist through the existing practice-lead rail so report leads land in the
 *  same table as intake leads, tagged by report — now carrying the consent
 *  record that makes a later campaign legitimate. Someone who previously
 *  unsubscribed stays unsubscribed: asking for a report is a request for that
 *  report, not a reversal of an opt-out. */
async function recordLead(email: string, slug: string): Promise<void> {
  try {
    const sql = createSql();
    try {
      const prior = await sql`
        SELECT 1 FROM practice_leads
        WHERE LOWER(email) = ${email.toLowerCase()} AND unsubscribed_at IS NOT NULL
        LIMIT 1
      `;
      const optedOut = prior.length > 0;
      await sql`
        INSERT INTO practice_leads
          (persona, thesis, size_geo, email, source,
           marketing_consent, consent_text, consent_at, unsubscribed_at)
        VALUES
          (NULL, NULL, NULL, ${email}, ${`report:${slug}`},
           ${!optedOut}, ${REPORT_CONSENT_NOTICE}, NOW(),
           ${optedOut ? new Date() : null})
      `;
    } finally {
      await sql.end();
    }
  } catch (err: any) {
    console.error('[report-access] lead save failed:', err?.message);
  }
}

/* ── unsubscribe ────────────────────────────────────────────────────────── */

/** Stable per-address token, derived not stored — one link works for every row
 *  that address ever created, and old emails keep working forever. */
export function unsubscribeToken(email: string): string {
  return crypto.createHmac('sha256', secret())
    .update(`unsub:${email.toLowerCase()}`)
    .digest('base64url');
}

export function unsubscribeLink(appUrl: string, email: string): string {
  return `${appUrl.replace(/\/$/, '')}/unsubscribe?e=${encodeURIComponent(email)}&t=${unsubscribeToken(email)}`;
}

/** Honour an opt-out across every row for that address. */
export async function unsubscribeEmail(email: string, token: string): Promise<boolean> {
  const clean = String(email || '').trim().toLowerCase();
  if (!VALID_EMAIL.test(clean)) return false;
  // Timing-safe compare so the token can't be probed byte by byte.
  const expected = Buffer.from(unsubscribeToken(clean));
  const given = Buffer.from(String(token || ''));
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) return false;

  const sql = createSql();
  try {
    await sql`
      UPDATE practice_leads
      SET unsubscribed_at = NOW(), marketing_consent = FALSE
      WHERE LOWER(email) = ${clean} AND unsubscribed_at IS NULL
    `;
    return true;
  } finally {
    await sql.end();
  }
}

/* ── the email ──────────────────────────────────────────────────────────── */

function deliveryEmailHtml(title: string, kicker: string, link: string, attached: boolean, unsub: string): string {
  const esc = (v: string) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  // The explicit white background is load-bearing, not decoration: Apple Mail
  // in dark mode inverts a message that declares none, which would turn the
  // signature's near-black wordmark invisible against its own background.
  return `<div bgcolor="#FFFFFF" style="font-family:-apple-system,'Segoe UI',sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#FFFFFF;color:#14181C">
  <div style="font-size:12px;letter-spacing:.11em;text-transform:uppercase;color:#B08637;font-weight:600">${esc(kicker)}</div>
  <h1 style="margin:12px 0 16px;font-size:24px;line-height:1.25;font-weight:600;color:#14181C">${esc(title)}</h1>
  <p style="margin:0 0 24px;font-size:15px;line-height:1.65;color:#3F464C">
    ${attached
      ? 'Your copy is attached — the full assessment, every figure attributed to its source. You can also open it in the browser:'
      : 'Here\'s your copy — the full assessment, every figure attributed to its source:'}
  </p>
  <p style="margin:0 0 28px">
    <a href="${esc(link)}" style="display:inline-block;background:#16624C;color:#fff;text-decoration:none;padding:14px 28px;border-radius:999px;font-size:15px;font-weight:600">Open the report</a>
  </p>
  <p style="margin:0 0 32px;font-size:13px;line-height:1.6;color:#8A9099">
    The link works for ${LINK_TTL_HOURS} hours. If the button doesn't open, paste this into your browser:<br>
    <span style="color:#5C6670;word-break:break-all">${esc(link)}</span>
  </p>
  ${signatureHtml()}
  <p style="margin:36px 0 0;padding-top:16px;border-top:1px solid #E4E1D9;font-size:12px;line-height:1.6;color:#9BA1A8">
    You got this because someone asked for the report at smbx.ai. We'll send occasional research after this —
    <a href="${esc(unsub)}" style="color:#9BA1A8">unsubscribe</a> any time.
  </p>
</div>`;
}
