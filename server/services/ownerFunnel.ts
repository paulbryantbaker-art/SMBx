/**
 * server/services/ownerFunnel.ts — the free owner evaluation
 * (SELLER_EVALUATION_PLAN.md, 2026-08-04).
 *
 * The seller-facing lead magnet: chat collects on the client, THIS runs the
 * pure engine (house/evaluate.ts), renders the report, mails it, and files
 * the registry row. Three laws are load-bearing here:
 *
 *  • FINANCIALS ARE EPHEMERAL. The figures arrive in the request, feed
 *    `evaluate()`, appear inside the rendered PDF, and are never written
 *    anywhere else — seller_registry has no columns for them (migration 117),
 *    and this file must never log a request body.
 *  • THE OWNER IDENTITY IS A FUNNEL PASS, NOT AN ACCOUNT. Google's GIS
 *    credential (the same verifyIdToken flow the team login uses — no new
 *    redirect URI) or a magic link mints an `smbx_owner` JWT with aud
 *    'smbx-owner'. It never touches `users`, so practiceMode's allowlist and
 *    the perimeter need no carve-out.
 *  • RANGE, NEVER A NUMBER. The engine's result type has no point-estimate
 *    field; the renderer keeps it that way and the disclaimer prints on the
 *    page, in the email, and on the PDF.
 */

import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import type { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { createSql } from '../dbConfig.js';
import { sendEmail, brandedEmail } from './emailService.js';
import { newRenderPage } from './premiumPdfRenderer.js';
import { fontFaceCss } from './fontEmbeds.js';
import { evaluate, revenueBandLabel, type EvaluationInput, type EvaluationResult } from '../../house/evaluate.js';
import { laneBand, supportedLanes } from '../../house/laneBenchmarks.js';
import { laneConflict } from './practiceIntake.js';
import { LEDGER } from '../../house/tokens.js';

const sql = createSql();
const OWNER_AUD = 'smbx-owner';
const OWNER_COOKIE = 'smbx_owner';
const OWNER_TTL_DAYS = 180;
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const secret = () => process.env.JWT_SECRET || 'dev-secret';
const appUrl = () => process.env.APP_URL || process.env.BASE_URL || 'https://smbx.ai';

/* ── identity ────────────────────────────────────────────────────────────── */

interface OwnerClaims { sub: string; email: string; name?: string; aud: string }

function mintOwnerCookie(res: Response, email: string, name?: string, googleSub?: string) {
  const token = jwt.sign(
    { sub: googleSub || `email:${email.toLowerCase()}`, email: email.toLowerCase(), name },
    secret(),
    { audience: OWNER_AUD, expiresIn: `${OWNER_TTL_DAYS}d` },
  );
  res.cookie(OWNER_COOKIE, token, {
    httpOnly: true, secure: true, sameSite: 'lax',
    maxAge: OWNER_TTL_DAYS * 24 * 3600 * 1000, path: '/',
  });
}

export function readOwner(req: Request): OwnerClaims | null {
  // No cookie-parser in this app — cookies are read off the header by hand
  // (the reportAccess reader cookie does the same).
  const header = req.headers.cookie || '';
  const m = header.split(/;\s*/).find(c => c.startsWith(`${OWNER_COOKIE}=`));
  if (!m) return null;
  try {
    return jwt.verify(decodeURIComponent(m.slice(OWNER_COOKIE.length + 1)), secret(), {
      audience: OWNER_AUD,
    }) as unknown as OwnerClaims;
  } catch { return null; }
}

/** POST /api/owners/google — GIS credential in, owner cookie out. */
export async function ownerGoogle(req: Request, res: Response) {
  const { credential } = req.body || {};
  if (!credential) return res.status(400).json({ error: 'credential required' });
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential, audience: process.env.GOOGLE_CLIENT_ID,
    });
    const p = ticket.getPayload();
    if (!p?.email) return res.status(400).json({ error: 'no email on credential' });
    mintOwnerCookie(res, p.email, p.name || undefined, p.sub);
    res.json({ ok: true, email: p.email, name: p.name || null });
  } catch {
    res.status(401).json({ error: 'credential verification failed' });
  }
}

/** POST /api/owners/magic — the no-Google fallback: emails a sign-in link. */
export async function ownerMagicRequest(req: Request, res: Response) {
  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: 'valid email required' });
  const t = jwt.sign({ email }, secret(), { audience: `${OWNER_AUD}-magic`, expiresIn: '30m' });
  const url = `${appUrl()}/api/owners/verify?t=${encodeURIComponent(t)}`;
  const mailed = await sendEmail({
    to: email,
    subject: 'Your smbX evaluation — sign-in link',
    html: brandedEmail({
      headline: 'Continue your free evaluation',
      body: 'Tap the button below to verify your email and pick up your evaluation where you left off. The link is good for 30 minutes.',
      ctaLabel: 'Continue my evaluation',
      ctaUrl: url,
    }),
  });
  res.json({ ok: true, mailed: mailed !== false });
}

/** GET /api/owners/verify?t= — magic link lands here, sets cookie, returns to chat. */
export async function ownerMagicVerify(req: Request, res: Response) {
  try {
    const claims = jwt.verify(String(req.query.t || ''), secret(), { audience: `${OWNER_AUD}-magic` }) as { email: string };
    mintOwnerCookie(res, claims.email);
    res.redirect('/owners?verified=1');
  } catch {
    res.redirect('/owners?verified=expired');
  }
}

/** GET /api/owners/me */
export function ownerMe(req: Request, res: Response) {
  const o = readOwner(req);
  if (!o) return res.status(401).json({ error: 'not verified' });
  res.json({ email: o.email, name: o.name || null });
}

/* ── the lane read (Stage A's free taste — public, no financials) ────────── */

export function ownerLaneRead(req: Request, res: Response) {
  const key = String(req.query.lane || '');
  const geography = String(req.query.geography || '');
  const band = laneBand(key);
  const engaged = laneConflict(`${key.replace(/-/g, ' ')} ${geography}`);
  if (!band) {
    return res.json({
      supported: false,
      lanes: supportedLanes().map(b => b.key),
      message: "We haven't published a sourced multiple band for this lane yet — we don't guess. Leave your email and you'll get your lane's read the day it exists.",
      engaged,
    });
  }
  res.json({
    supported: true,
    band: {
      low: band.low, marketLow: band.marketLow, marketHigh: band.marketHigh, high: band.high,
      label: band.label, source: band.source, scopeNote: band.scopeNote, basisNote: band.basisNote,
    },
    engaged,
  });
}

/* ── the evaluation itself ───────────────────────────────────────────────── */

interface EvaluatePayload {
  lane: string; geography: string; situation: string;
  financials: Omit<EvaluationInput, 'lane'>;
  consentFirstCall: boolean; consentStorage: boolean;
}

const money = (n: number) => '$' + Math.round(n).toLocaleString('en-US');

function reportHtml(r: EvaluationResult, meta: { name?: string; geography: string }): string {
  const L = LEDGER;
  const statusColor = { strength: L.green, watch: L.brass, fix: '#B4552D' } as const;
  const drivers = r.readiness.drivers.map(d => `
    <tr>
      <td class="dl">${d.label}</td>
      <td class="ds" style="color:${statusColor[d.status]}">${d.status === 'fix' ? 'Fix before sale' : d.status === 'watch' ? 'Watch' : 'Strength'}</td>
      <td class="dn">${d.note}</td>
    </tr>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    ${fontFaceCss()}
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Inter',sans-serif; color:${L.ink}; background:${L.bone}; }
    .cover { background:${L.dark}; color:${L.ivory}; padding:56px 54px 40px; }
    .eyebrow { font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:.18em; color:${L.honey}; }
    h1 { font-family:'Fraunces',serif; font-weight:560; font-size:34px; margin:14px 0 6px; }
    .sub { font-size:14px; color:${L.ivory}; opacity:.85; }
    .rule { width:64px; height:3px; background:${L.honey}; margin:18px 0 0; }
    .body { padding:38px 54px; }
    h2 { font-family:'Fraunces',serif; font-weight:560; font-size:21px; margin:26px 0 10px; }
    p, li { font-size:13.5px; line-height:1.65; color:#3F464C; }
    .range { display:flex; gap:26px; margin:16px 0 4px; }
    .rr { border:1px solid ${L.hair}; border-radius:12px; padding:16px 20px; background:#fff; }
    .rr .n { font-family:'Fraunces',serif; font-size:26px; color:${L.green}; font-variant-numeric:tabular-nums; }
    .rr .l { font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.12em; color:${L.muted}; text-transform:uppercase; margin-top:6px; }
    .src { font-size:11px; color:${L.muted}; margin-top:10px; }
    table { width:100%; border-collapse:collapse; margin-top:12px; }
    td { border-top:1px solid ${L.hair}; padding:10px 8px; font-size:12.5px; vertical-align:top; }
    .dl { font-weight:600; width:150px; } .ds { width:110px; font-weight:600; } .dn { color:#3F464C; }
    .disc { margin-top:30px; border:1px solid ${L.hair}; border-left:3px solid ${L.brass}; background:#fff; padding:14px 18px; font-size:12px; color:#3F464C; }
    .foot { padding:0 54px 40px; font-family:'IBM Plex Mono',monospace; font-size:10px; color:${L.muted}; }
  </style></head><body>
    <div class="cover">
      <div class="eyebrow">OWNER EVALUATION · CONFIDENTIAL</div>
      <h1>${r.band.label} — your market read</h1>
      <div class="sub">${meta.name ? meta.name + ' · ' : ''}${meta.geography} · prepared by smbX.ai, buy-side corporate development</div>
      <div class="rule"></div>
    </div>
    <div class="body">
      <h2>What buyers are paying in your lane</h2>
      <p>${r.band.label} businesses in the published data trade between <b>${r.band.low}x and ${r.band.high}x</b>,
      with the market's middle at <b>${r.band.marketLow}x–${r.band.marketHigh}x</b> (${r.band.basisNote}).
      Applied to your ${r.basisType} of ${money(r.basisUsd)}:</p>
      <div class="range">
        <div class="rr"><div class="n">${money(r.rangeUsd.low)} – ${money(r.rangeUsd.high)}</div><div class="l">Full published band</div></div>
        <div class="rr"><div class="n">${money(r.rangeUsd.marketLow)} – ${money(r.rangeUsd.marketHigh)}</div><div class="l">Where the market clears</div></div>
      </div>
      <div class="src">Band: ${r.band.source} — ${r.band.scopeNote}. Size context: ${r.sizeTier.label} typically ${r.sizeTier.low}–${r.sizeTier.high}x (${r.sizeTier.source}).</div>
      <h2>Where your business sits, and why</h2>
      <p>On the readiness drivers buyers actually price, your profile reads in the <b>${r.readiness.position}</b> of that band.</p>
      <table>${drivers}</table>
      <div class="disc"><b>How to read this:</b> ${r.disclaimer}</div>
    </div>
    <div class="foot">smbX.ai · buy-side corporate development · we work for buyers, never for a fee from an owner</div>
  </body></html>`;
}

export async function ownerEvaluate(req: Request, res: Response) {
  const owner = readOwner(req);
  if (!owner) return res.status(401).json({ error: 'verify first' });

  const p = req.body as EvaluatePayload;
  if (!p?.lane || !p?.financials) return res.status(400).json({ error: 'lane and financials required' });
  if (!p.consentStorage) return res.status(400).json({ error: 'storage acknowledgment required' });

  const input: EvaluationInput = { lane: p.lane, ...p.financials };
  const result = evaluate(input);
  if (!result.laneSupported) return res.status(422).json({ error: result.message });

  // Render the PDF (the only artifact the figures ever land in).
  let pdf: Buffer;
  const page = await newRenderPage();
  try {
    await page.setContent(reportHtml(result, { name: owner.name, geography: p.geography || '' }), { waitUntil: 'networkidle0' });
    pdf = Buffer.from(await page.pdf({ format: 'letter', printBackground: true }));
  } finally {
    await page.close().catch(() => { /* fine */ });
  }

  const mailed = await sendEmail({
    to: owner.email,
    subject: `Your ${result.band.label} market evaluation — smbX`,
    html: brandedEmail({
      headline: 'Your evaluation is attached',
      body:
        `Your ${result.band.label} market read is attached as a PDF — the published multiple band for your lane, applied to the figures you provided, plus the readiness drivers buyers actually price. ` +
        `Keep it for your banker, your CPA, or your own planning. ${result.disclaimer}`,
      footnote: 'We work for buyers. We never take a fee from an owner.',
    }),
    attachments: [{ filename: 'smbX-owner-evaluation.pdf', content: pdf }],
  });

  // Persist ONLY what the schema allows — no financial columns exist.
  const band = revenueBandLabel(input.revenueUsd);
  const engaged = laneConflict(`${p.lane.replace(/-/g, ' ')} ${p.geography || ''}`);
  await sql`
    INSERT INTO seller_registry
      (email, name, google_sub, lane, geography, situation, revenue_band,
       readiness_score, readiness_position, consent_first_call, consent_storage,
       report_pdf, report_generated_at, updated_at)
    VALUES
      (${owner.email}, ${owner.name || null}, ${owner.sub.startsWith('email:') ? null : owner.sub},
       ${p.lane}, ${p.geography || null}, ${p.situation || null}, ${band},
       ${result.readiness.score}, ${result.readiness.position},
       ${!!p.consentFirstCall}, ${!!p.consentStorage},
       ${pdf}, now(), now())
    ON CONFLICT (LOWER(email), lane) DO UPDATE SET
      name = EXCLUDED.name, geography = EXCLUDED.geography, situation = EXCLUDED.situation,
      revenue_band = EXCLUDED.revenue_band, readiness_score = EXCLUDED.readiness_score,
      readiness_position = EXCLUDED.readiness_position,
      consent_first_call = EXCLUDED.consent_first_call, consent_storage = EXCLUDED.consent_storage,
      report_pdf = EXCLUDED.report_pdf, report_generated_at = now(), updated_at = now()
  `;

  res.json({
    ok: true,
    mailed: mailed !== false,
    engaged,
    position: result.readiness.position,
    close: engaged
      ? 'We have an active buyer engagement in your lane today — with your permission, expect a call.'
      : "You're on the first-call list: when a buyer engages us in your lane, registered owners hear before anyone else.",
  });
}

/** POST /api/owners/lead — capture for unsupported lanes (no financials involved). */
export async function ownerLead(req: Request, res: Response) {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const lane = String(req.body?.lane || '').trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !lane) return res.status(400).json({ error: 'email and lane required' });
  await sql`
    INSERT INTO seller_registry (email, lane, geography, situation, consent_first_call, consent_storage, updated_at)
    VALUES (${email}, ${lane}, ${String(req.body?.geography || '') || null}, ${'lane-waitlist'}, true, true, now())
    ON CONFLICT (LOWER(email), lane) DO UPDATE SET updated_at = now()
  `;
  res.json({ ok: true });
}
