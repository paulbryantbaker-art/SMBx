/**
 * Verified-email access to the research PDFs (2026-07-29).
 *
 * Paul: "anybody can go to the site and read the blog obviously but they must
 * provide an email if they want to download it." PROVIDE, not verify — so the
 * file is released on submit rather than after an inbox round trip. (Practice
 * mode restricts real accounts to the team allowlist, so a literal login would
 * have meant nobody but the team could ever download.)
 *
 * The flow:
 *   1. Reader gives an address → `issueAccess` stores a token, saves the lead,
 *      and mails a copy of the link. The route mints a signed HttpOnly reader
 *      cookie (180 days) in the SAME response, so the download starts at once.
 *   2. That cookie releases the file from `/api/practice/reports/:slug/file`
 *      for that report and every later one — give an address once, not per
 *      report.
 *   3. The mailed link still works (`verifyToken` → same cookie), which is how
 *      they open the report on another device. Mail failure never blocks the
 *      download; a bounce simply tells Paul the address was junk.
 *
 * The PDFs live in `content/reports/`, deliberately OUTSIDE `client/public`:
 * anything under public is served statically by Express, so the old
 * `/reports/<slug>.pdf` URL let anyone skip the gate by typing it.
 *
 * Team members holding a normal app JWT are let straight through — Paul should
 * never have to email himself a link to open his own research.
 */
import { existsSync } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { createSql } from '../dbConfig.js';
import { sendEmail } from './emailService.js';
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

  const link = `${input.appUrl.replace(/\/$/, '')}/reports/${report.slug}/unlock?t=${token}`;
  const emailed = await sendEmail({
    to: email,
    subject: `Your copy of ${report.shortTitle}`,
    html: unlockEmailHtml(report.shortTitle, report.kicker, link),
  });

  // The lead is worth keeping whether or not they ever click.
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
  } catch {
    /* the file matters more than the counter */
  } finally {
    await sql.end();
  }
}

/** Persist through the existing practice-lead rail so report leads land in the
 *  same table as intake leads, tagged by report. */
async function recordLead(email: string, slug: string): Promise<void> {
  try {
    const sql = createSql();
    try {
      await sql`
        INSERT INTO practice_leads (persona, thesis, size_geo, email, source)
        VALUES (NULL, NULL, NULL, ${email}, ${`report:${slug}`})
      `;
    } finally {
      await sql.end();
    }
  } catch (err: any) {
    console.error('[report-access] lead save failed:', err?.message);
  }
}

/* ── the email ──────────────────────────────────────────────────────────── */

function unlockEmailHtml(title: string, kicker: string, link: string): string {
  const esc = (v: string) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<div style="font-family:-apple-system,'Segoe UI',sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#14181C">
  <div style="font-size:12px;letter-spacing:.11em;text-transform:uppercase;color:#B08637;font-weight:600">${esc(kicker)}</div>
  <h1 style="margin:12px 0 16px;font-size:24px;line-height:1.25;font-weight:600;color:#14181C">${esc(title)}</h1>
  <p style="margin:0 0 24px;font-size:15px;line-height:1.65;color:#3F464C">
    Here's your copy, as promised. The link below opens the full PDF on any device — every figure attributed to its source.
  </p>
  <p style="margin:0 0 28px">
    <a href="${esc(link)}" style="display:inline-block;background:#16624C;color:#fff;text-decoration:none;padding:14px 28px;border-radius:999px;font-size:15px;font-weight:600">Download the report</a>
  </p>
  <p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#8A9099">
    The link works for ${LINK_TTL_HOURS} hours. If the button doesn't open, paste this into your browser:<br>
    <span style="color:#5C6670;word-break:break-all">${esc(link)}</span>
  </p>
  <hr style="border:0;border-top:1px solid #E4E1D9;margin:28px 0 16px">
  <p style="margin:0;font-size:13px;line-height:1.6;color:#8A9099">
    Paul Baker · smbX.ai — buy-side corporate development.<br>
    You got this because you downloaded the report at smbx.ai. Nothing else will arrive.
  </p>
</div>`;
}
