/**
 * WHO LOOKED AT THE SITE — the count, and the morning email that carries it.
 *
 * (Paul, 2026-08-18: "i want an email every morning like the others that
 * tells me how many unique MAC addresses viewed the site, so i can tell how
 * many people besides me looked at it.")
 *
 * A website never sees a MAC address; what it can count is unique visitors —
 * one IP + browser on one day — which is what every analytics product means
 * by the word. Migration 137 holds the rows; this file is the three parts:
 *
 *   1. `siteVisitMiddleware` — records one row per HTML page view on the
 *      public site. Fire-and-forget: it never delays a response and never
 *      throws into one. The IP is hashed, never stored.
 *   2. `noteTeamIp` — called by requireAuth on every authenticated API call,
 *      so an IP that used the app that day is "the team" for that day and is
 *      excluded from "besides you". Deduped in memory; one insert per IP per
 *      day at most.
 *   3. `sendDailyDigest` — the 7am Central email: unique visitors besides the
 *      team, page views, top pages, referrers, bots named separately, and the
 *      last seven days for context. Idempotent per day (site_visit_digests).
 *
 * The pure parts — bot classification, UA family, referer host, the Central
 * day, and the email's text — take no db and are the tested surface
 * (server/services/__tests__/siteVisits.test.mts).
 */
import { createHash } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';

/* ── pure ─────────────────────────────────────────────────────────────── */

const BOT_RE = /bot|crawl|spider|slurp|preview|facebookexternalhit|linkedin|twitterbot|whatsapp|telegram|slackbot|discordbot|embedly|pinterest|quora|vkshare|w3c_validator|headless|lighthouse|pingdom|uptime|monitor|curl\/|wget\/|python-requests|go-http-client|okhttp|java\/|axios\/|node-fetch|scrapy|httpclient|semrush|ahrefs|mj12|dotbot|petalbot|bytespider|gptbot|claudebot|anthropic|ccbot|applebot|bingpreview|yandex|baiduspider|duckduckbot/i;

/** Is this user agent a crawler, a link-preview fetcher, or a script? */
export function isBotUa(ua: string | undefined | null): boolean {
  if (!ua) return true;               // no UA at all is a script, not a person
  return BOT_RE.test(ua);
}

/** "Chrome · Mac", "Safari · iPhone", "LinkedInBot" — enough to read, no fingerprinting. */
export function uaFamily(ua: string | undefined | null): string {
  if (!ua) return 'unknown';
  const u = ua;
  const named = /LinkedInBot|Slackbot|Twitterbot|facebookexternalhit|WhatsApp|TelegramBot|Discordbot|Googlebot|bingbot|Applebot|GPTBot|ClaudeBot|PerplexityBot|DuckDuckBot|YandexBot|Baiduspider|AhrefsBot|SemrushBot|PetalBot|Bytespider|MJ12bot|DotBot/i.exec(u);
  if (named) return named[0];
  if (isBotUa(u)) return 'bot';
  const os =
    /iPhone/.test(u) ? 'iPhone' :
    /iPad/.test(u) ? 'iPad' :
    /Android/.test(u) ? 'Android' :
    /Macintosh|Mac OS X/.test(u) ? 'Mac' :
    /Windows/.test(u) ? 'Windows' :
    /Linux/.test(u) ? 'Linux' : 'other';
  const browser =
    /Edg\//.test(u) ? 'Edge' :
    /OPR\/|Opera/.test(u) ? 'Opera' :
    /Chrome\//.test(u) && !/Chromium/.test(u) ? 'Chrome' :
    /Firefox\//.test(u) ? 'Firefox' :
    /Safari\//.test(u) ? 'Safari' : 'browser';
  return `${browser} · ${os}`;
}

/** Host of the referer, or null for direct / same-site. */
export function refererHost(ref: string | undefined | null, ownHost = 'smbx.ai'): string | null {
  if (!ref) return null;
  try {
    const h = new URL(ref).hostname.replace(/^www\./, '').toLowerCase();
    if (!h || h === ownHost || h.endsWith(`.${ownHost}`) || h === 'localhost') return null;
    return h;
  } catch { return null; }
}

/** The calendar day in Central time, as YYYY-MM-DD. The email is a Central-day
 *  email; UTC would split an evening of readers across two days. */
export function centralDay(d: Date = new Date()): string {
  return d.toLocaleDateString('en-CA', { timeZone: 'America/Chicago' });
}

/** Yesterday, Central. */
export function centralYesterday(d: Date = new Date()): string {
  const t = new Date(d.getTime() - 24 * 3600 * 1000);
  return centralDay(t);
}

/** A page view worth counting: a GET for an HTML document on the public site. */
export function isPageView(method: string, path: string, accept: string | undefined): boolean {
  if (method !== 'GET') return false;
  if (!accept || !/text\/html/.test(accept)) return false;
  if (/^\/(api|assets|collateral|reports|textures|mcp|\.well-known)(\/|$)/.test(path)) return false;
  if (/\.[a-z0-9]{2,5}$/i.test(path)) return false;      // a file, not a page
  return true;
}

const sha = (s: string) => createHash('sha256').update(s).digest('hex').slice(0, 32);

export interface DigestRow { path: string; visitor: string; is_bot: boolean; ua_family: string | null; referer_host: string | null }

export interface Digest {
  day: string;
  visitors: number;          // uniques besides the team
  views: number;             // page views besides the team
  topPages: [string, number][];
  referrers: [string, number][];
  bots: number;              // bot / preview fetches (rows)
  botNames: [string, number][];
  teamViews: number;         // Paul's own, for the record
  week: { day: string; visitors: number }[];   // last 7 days incl. this one
}

/** Pure: fold a day's rows (already split team/non-team) into the digest numbers. */
export function summarise(day: string, human: DigestRow[], team: DigestRow[], week: { day: string; visitors: number }[]): Digest {
  const people = human.filter(r => !r.is_bot);
  const bots = human.filter(r => r.is_bot);
  const count = <T>(xs: T[], key: (x: T) => string | null) => {
    const m = new Map<string, number>();
    for (const x of xs) { const k = key(x); if (!k) continue; m.set(k, (m.get(k) ?? 0) + 1); }
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  };
  return {
    day,
    visitors: new Set(people.map(r => r.visitor)).size,
    views: people.length,
    topPages: count(people, r => r.path).slice(0, 8),
    referrers: count(people, r => r.referer_host).slice(0, 6),
    bots: bots.length,
    botNames: count(bots, r => r.ua_family ?? 'bot').slice(0, 6),
    teamViews: team.length,
    week,
  };
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const dayLabel = (iso: string) =>
  new Date(iso + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });

/** Pure: the subject line — the answer first. */
export function digestSubject(d: Digest): string {
  const v = d.visitors;
  return `smbx.ai ${dayLabel(d.day)}: ${v} visitor${v === 1 ? '' : 's'} besides you · ${d.views} page view${d.views === 1 ? '' : 's'}`;
}

/** Pure: the email body. Plain, in his words, honest about what a "visitor" is. */
export function digestHtml(d: Digest, trackingSince: string | null): string {
  const li = (xs: [string, number][], empty: string) =>
    xs.length ? `<ul style="margin:4px 0 0;padding-left:18px">${xs.map(([k, n]) => `<li>${esc(k)} <span style="color:#7C8187">· ${n}</span></li>`).join('')}</ul>` : `<div style="color:#7C8187">${empty}</div>`;
  const week = d.week.map(w => `<td style="padding:2px 8px;text-align:center;border-bottom:1px solid #E4DFD3"><div style="font-family:ui-monospace,Menlo,monospace;font-size:16px;font-weight:700">${w.visitors}</div><div style="color:#7C8187;font-size:11px">${esc(dayLabel(w.day).replace(/,.*$/, ''))}</div></td>`).join('');
  return `<div style="font-family:system-ui,-apple-system,sans-serif;font-size:14px;line-height:1.6;color:#16181A;max-width:560px">
  <div style="font-size:12px;color:#7C8187;letter-spacing:.02em">smbx.ai · ${esc(dayLabel(d.day))} (Central)</div>
  <div style="font-size:30px;font-weight:700;margin:6px 0 2px">${d.visitors} <span style="font-size:15px;font-weight:600;color:#4A4F54">visitor${d.visitors === 1 ? '' : 's'} besides you</span></div>
  <div style="color:#4A4F54">${d.views} page view${d.views === 1 ? '' : 's'}${d.teamViews ? ` · your own ${d.teamViews} view${d.teamViews === 1 ? '' : 's'} not counted` : ''}</div>

  <div style="margin-top:16px;font-weight:700">Pages they read</div>
  ${li(d.topPages, 'No pages read by anyone but you.')}

  <div style="margin-top:14px;font-weight:700">Where they came from</div>
  ${li(d.referrers, d.visitors ? 'Direct — no referrer (typed, bookmarked, or an app that strips it, e.g. LinkedIn’s).' : '—')}

  <div style="margin-top:14px;font-weight:700">Link previews &amp; crawlers <span style="font-weight:400;color:#7C8187">— not counted above</span></div>
  ${li(d.botNames, 'None.')}

  <div style="margin-top:16px;font-weight:700">Last 7 days · visitors besides you</div>
  <table style="border-collapse:collapse;margin-top:4px"><tr>${week}</tr></table>

  <div style="margin-top:18px;padding-top:10px;border-top:1px solid #E4DFD3;font-size:12px;color:#7C8187;line-height:1.55">
    A visitor is one IP address + browser on one day — a website cannot see MAC addresses, and this is what every analytics tool means by “unique visitor”. Your own browsers (any that have signed in to the app) and any IP that used the app that day are excluded. Crawlers and link-preview fetchers are listed separately, never counted as readers.${trackingSince ? ` Counting since ${esc(dayLabel(trackingSince))}.` : ''}
  </div>
</div>`;
}

/* ── the middleware ────────────────────────────────────────────────────── */

type Sql = any;
let sqlRef: Sql | null = null;
async function db(): Promise<Sql> {
  if (!sqlRef) sqlRef = (await import('../db.js')).sql;
  return sqlRef;
}

const clientIp = (req: Request): string =>
  (req.ip || (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || '0.0.0.0');

/** Records a page view. Never blocks, never throws into the response. */
export function siteVisitMiddleware(req: Request, _res: Response, next: NextFunction) {
  next();
  try {
    if (!isPageView(req.method, req.path, req.headers.accept)) return;
    const ua = req.headers['user-agent'] || '';
    const ip = clientIp(req);
    const day = centralDay();
    const row = {
      day,
      path: req.path.length > 200 ? req.path.slice(0, 200) : req.path,
      visitor: sha(`${day}|${ip}|${ua}`),
      ip_hash: sha(ip),
      ua_family: uaFamily(ua),
      referer_host: refererHost(req.headers.referer as string | undefined),
      is_bot: isBotUa(ua),
      is_team: /(^|;\s*)smbx_team=1(;|$)/.test(req.headers.cookie || ''),
    };
    db().then(sql => sql`INSERT INTO site_visits ${sql(row)}`).catch(() => { /* never a user-facing failure */ });
  } catch { /* same */ }
}

/* ── the team-IP note (called from requireAuth) ────────────────────────── */

const seenTeam = new Set<string>();   // `${day}|${ip_hash}` — one insert per IP per day per process
export function noteTeamIp(req: Request): void {
  try {
    const day = centralDay();
    const h = sha(clientIp(req));
    const key = `${day}|${h}`;
    if (seenTeam.has(key)) return;
    seenTeam.add(key);
    if (seenTeam.size > 5000) seenTeam.clear();   // a bounded memory, not a leak
    db().then(sql => sql`INSERT INTO site_team_ips (day, ip_hash) VALUES (${day}, ${h}) ON CONFLICT DO NOTHING`).catch(() => {});
  } catch { /* never */ }
}

/* ── the digest ────────────────────────────────────────────────────────── */

/**
 * Compute a day's digest from the tables. Team rows are those carrying the
 * cookie OR whose IP used the app that day.
 */
export async function computeDigest(sql: Sql, day: string): Promise<Digest> {
  const rows: (DigestRow & { is_team: boolean; ip_hash: string })[] = await sql`
    SELECT v.path, v.visitor, v.is_bot, v.ua_family, v.referer_host,
           (v.is_team OR t.ip_hash IS NOT NULL) AS is_team, v.ip_hash
    FROM site_visits v
    LEFT JOIN site_team_ips t ON t.day = v.day AND t.ip_hash = v.ip_hash
    WHERE v.day = ${day}`;
  const human = rows.filter(r => !r.is_team);
  const team = rows.filter(r => r.is_team);
  const weekRows: { day: string; visitors: number }[] = await sql`
    SELECT d.day::text AS day, COALESCE(u.n, 0)::int AS visitors
    FROM generate_series(${day}::date - 6, ${day}::date, '1 day') AS d(day)
    LEFT JOIN (
      SELECT v.day, COUNT(DISTINCT v.visitor) AS n
      FROM site_visits v
      LEFT JOIN site_team_ips t ON t.day = v.day AND t.ip_hash = v.ip_hash
      WHERE v.day BETWEEN ${day}::date - 6 AND ${day}::date
        AND NOT v.is_bot AND NOT v.is_team AND t.ip_hash IS NULL
      GROUP BY v.day
    ) u ON u.day = d.day
    ORDER BY d.day`;
  return summarise(day, human, team, weekRows);
}

/**
 * Send the digest for a day (default: yesterday, Central) to the practitioner.
 * Idempotent: a day already in site_visit_digests is not sent again unless
 * `force`. Returns what happened, for the worker log and the on-demand route.
 */
export async function sendDailyDigest(opts: { day?: string; force?: boolean } = {}): Promise<{ day: string; sent: boolean; skipped?: string; to?: string; visitors?: number; views?: number }> {
  const sql = await db();
  const day = opts.day ?? centralYesterday();
  if (!opts.force) {
    const [done] = await sql`SELECT sent FROM site_visit_digests WHERE day = ${day}`;
    if (done?.sent) return { day, sent: false, skipped: 'already sent' };
  }
  const { teamAllowlist } = await import('./practiceMode.js');
  const to = teamAllowlist()[0];
  if (!to) return { day, sent: false, skipped: 'no team email (TEAM_ALLOWLIST)' };

  const digest = await computeDigest(sql, day);
  const [first] = await sql`SELECT MIN(day)::text AS d FROM site_visits`;
  const { sendEmail } = await import('./emailService.js');
  const ok = await sendEmail({ to, subject: digestSubject(digest), html: digestHtml(digest, first?.d ?? null) });
  await sql`
    INSERT INTO site_visit_digests (day, to_email, visitors, views, sent)
    VALUES (${day}, ${to}, ${digest.visitors}, ${digest.views}, ${ok})
    ON CONFLICT (day) DO UPDATE SET sent_at = NOW(), to_email = EXCLUDED.to_email,
      visitors = EXCLUDED.visitors, views = EXCLUDED.views, sent = EXCLUDED.sent`;
  return { day, sent: ok, to, visitors: digest.visitors, views: digest.views, ...(ok ? {} : { skipped: 'mail did not send (RESEND_API_KEY / EMAIL_FROM)' }) };
}
