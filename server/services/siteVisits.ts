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
 *      throws into one. The IP is never stored — only a KEYED hash of it (see
 *      `sha` below), which cannot be reversed without the server's secret.
 *   2. `noteTeamIp` — called by requireAuth on every authenticated API call,
 *      so an IP that used the app that day is "the team" for that day and is
 *      excluded from "besides you". Deduped in memory; one insert per IP per
 *      day at most.
 *   3. `sendDailyDigest` — the 7am Central email: unique visitors besides the
 *      team, page loads, top pages, referrers, bots named separately, and the
 *      last seven days for context. Idempotent per day (site_visit_digests).
 *
 * The pure parts — bot classification, UA family, referer host, the Central
 * day, and the email's text — take no db and are the tested surface
 * (server/services/__tests__/siteVisits.test.mts).
 */
import { createHmac } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';

/* ── pure ─────────────────────────────────────────────────────────────── */

/**
 * BRAND NAMES MUST BE THE FETCHER'S NAME, NEVER THE BARE BRAND.
 *
 * The first cut of this list carried a bare `linkedin`, and LinkedIn's iOS and
 * Android in-app browsers append `[LinkedInApp]` to an otherwise ordinary
 * Safari/Chrome user agent. So every person who tapped a link IN THE LINKEDIN
 * APP — which is how most of this practice's readers arrive — was classified a
 * bot and dropped from the count. The email would have reported "0 visitors
 * besides you" on precisely the mornings after a post worked, which is worse
 * than sending nothing. Same trap for `whatsapp`, `telegram`, `pinterest` and
 * `quora`: each is a real crawler name AND a substring of a real in-app
 * browser. Every entry below is therefore the crawler's own token
 * (`linkedinbot`, `whatsapp/`), never the company.
 */
const BOT_RE = /bot\b|crawler|crawling|spider|slurp|facebookexternalhit|linkedinbot|twitterbot|whatsapp\/|telegrambot|slackbot|discordbot|embedly|pinterestbot|quorabot|vkshare|w3c_validator|headless|lighthouse|pingdom|uptime|curl\/|wget\/|python-requests|go-http-client|okhttp|java\/|axios\/|node-fetch|scrapy|httpclient|semrush|ahrefs|mj12|dotbot|petalbot|bytespider|gptbot|claudebot|anthropic|ccbot|applebot|bingpreview|yandex|baiduspider|duckduckbot/i;

/** Is this user agent a crawler, a link-preview fetcher, or a script? */
export function isBotUa(ua: string | undefined | null): boolean {
  if (!ua) return true;               // no UA at all is a script, not a person
  return BOT_RE.test(ua);
}

/** "Chrome · Mac", "Safari · iPhone", "LinkedIn app", "LinkedInBot" — enough to read, no fingerprinting. */
export function uaFamily(ua: string | undefined | null): string {
  if (!ua) return 'unknown';
  const u = ua;
  /* In-app browsers first: these are PEOPLE, and knowing they came through the
     LinkedIn app is the most useful thing the line can say on this account. */
  if (/\[LinkedInApp\]/i.test(u)) return 'LinkedIn app';
  if (/FBAN\/|FBAV\/|FB_IAB/i.test(u)) return 'Facebook app';
  if (/Instagram /i.test(u)) return 'Instagram app';
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

/**
 * The public pages this site actually serves — the FIRST path segment, plus ''
 * for the landing. Anything else is not counted.
 *
 * WHY AN ALLOWLIST AND NOT A DENYLIST. `app.get('*')` answers index.html with
 * HTTP 200 for every unmatched path, so a vulnerability scanner probing
 * /wp-admin, /.env or /phpmyadmin looks exactly like a reader — and on a site
 * whose honest answer is often "2 people", a handful of probes doubles the
 * headline. An allowlist fails CLOSED: a new page is under-counted until this
 * line is updated, which is the safe direction for a number Paul is going to
 * trust.
 */
const PUBLIC_PAGES = new Set([
  '', 'about', 'industries', 'track-record', 'research', 'reports', 'buyers',
  'legal', 'owners', 'how-it-works', 'pricing', 'advise', 'brokers',
  'buy', 'sell', 'raise', 'integrate', 'connectors', 'standard',
]);

/**
 * TOKEN ROUTES ARE NEVER RECORDED — they carry live secrets in the path.
 * `/reset-password/<token>` is a working credential; `/shared/<token>`,
 * `/shared/doc/<token>`, `/biz/<token>`, `/invite/<token>` and
 * `/day-pass/<token>` are bearer links. All are extensionless GETs the SPA
 * answers with 200, so without this they would be written to site_visits with
 * no expiry AND could surface in the morning email's "pages" list.
 */
const SECRET_PATHS = /^\/(shared|invite|day-pass|valuelens|biz|reset-password|verify-email|forgot-password|login|signup|admin)(\/|$)/;

/**
 * COLLAPSE REPEATED SLASHES BEFORE ANY CHECK — and it is the allowlist itself
 * that makes this load-bearing rather than tidy.
 *
 * `PUBLIC_PAGES` MUST contain `''`, because that is what the landing page's
 * first segment is: `'/'.split('/')[1] === ''`. But `'//feed'.split('/')[1]` is
 * ALSO `''` — so any path wearing a doubled leading slash is on the allowlist
 * by construction. `//feed`, `//wp-admin`, `//phpmyadmin` all walked straight
 * past the guard written to stop exactly them, were recorded as visitors, and
 * showed up in the morning email's "Pages they landed on" under their own
 * literal path. The single-slash test on line 40 of the test file passed the
 * whole time.
 *
 * Doubled slashes are not exotic. They are what naive URL joining emits
 * (`base + '/' + path` where base already ends in one), which is how feed
 * fetchers and vulnerability scanners are written — `//feed` is the WordPress
 * RSS probe, and it is the one that arrived.
 *
 * Trailing slashes are stripped in the same pass, which quietly fixes three
 * more escapes: `/logo.png/` dodged the file-extension test, `/x/unlock/`
 * dodged the unlock test, and `/about` vs `/about/` could occupy two separate
 * lines in an email reporting eight visitors.
 */
export function normalisePath(path: string): string {
  const collapsed = (path || '/').replace(/\/{2,}/g, '/');
  const trimmed = collapsed.length > 1 ? collapsed.replace(/\/+$/, '') : collapsed;
  return trimmed || '/';
}

/**
 * A REAL PAGE PATH, CHARACTER BY CHARACTER — because the allowlist only ever
 * inspects the FIRST segment, and everything after it was taken on trust.
 * `/research/../wp-admin` and `/buyers/..%2fwp-admin` both lead with a genuine
 * page, so both were recorded as visitors and both printed their literal probe
 * string into the morning email's page list.
 *
 * Every public path on this site is kebab-case ASCII — `fire-safety`,
 * `dfw-home-services`, `private-equity`, `track-record` — so the shape can
 * simply be required: no percent-encoding, no dot segments, no backslashes, no
 * control characters. It fails CLOSED in the same direction the allowlist
 * does: an exotic new slug is under-counted until this line is updated, which
 * is the safe way to be wrong about a number Paul is going to trust.
 */
const PAGE_SHAPE = /^\/(?:[A-Za-z0-9][A-Za-z0-9._-]*(?:\/[A-Za-z0-9][A-Za-z0-9._-]*)*)?$/;

/** A page view worth counting: a GET for an HTML document on a real public page. */
export function isPageView(method: string, rawPath: string, accept: string | undefined): boolean {
  if (method !== 'GET') return false;
  if (!accept || !/text\/html/.test(accept)) return false;
  const path = normalisePath(rawPath);
  if (!PAGE_SHAPE.test(path)) return false;
  if (SECRET_PATHS.test(path)) return false;
  if (/^\/(api|assets|collateral|textures|mcp|\.well-known)(\/|$)/.test(path)) return false;
  if (/\.[a-z0-9]{2,5}$/i.test(path)) return false;      // a file, not a page
  if (/\/unlock$/.test(path)) return false;              // the report-unlock hop redirects to the page itself — one read, not two
  return PUBLIC_PAGES.has(path.split('/')[1] ?? '');
}

/**
 * A KEYED hash, not a bare one. `sha256(ip)` sounds anonymising and is not:
 * the whole IPv4 space is 2^32, so an unkeyed digest is a lookup table anyone
 * with the database can build in minutes — the comments claiming "the IP is
 * never stored" would have been an overclaim, which is the one thing this
 * practice's own law forbids in a document. Keyed with the server secret AND
 * the day, so a hash is meaningless without the key and does not link a
 * visitor across days. Every consumer only ever compares hashes WITHIN one day
 * (the team-exclusion join is `t.day = v.day AND t.ip_hash = v.ip_hash`), so
 * per-day keying costs nothing.
 */
const VISIT_KEY = () => process.env.SITE_VISIT_SALT || process.env.JWT_SECRET || 'smbx-site-visits';
const sha = (day: string, s: string) =>
  createHmac('sha256', `${VISIT_KEY()}|${day}`).update(s).digest('hex').slice(0, 32);

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
/* `iso.slice(0, 10)`: generate_series over two dates resolves to TIMESTAMPTZ, so a
   row can arrive as '2026-08-12 00:00:00+00'. `new Date('2026-08-12 00:00:00+00T12:00:00Z')`
   is unparseable and prints the literal "Invalid Date" — which is what every cell of
   the seven-day strip did before the SELECT below was cast to ::date. Belt and braces:
   the query is fixed AND this tolerates any date-ish string. */
const dayLabel = (iso: string) =>
  new Date(iso.slice(0, 10) + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });

/** Pure: the subject line — the answer first. */
export function digestSubject(d: Digest): string {
  const v = d.visitors;
  return `smbx.ai ${dayLabel(d.day)}: ${v} visitor${v === 1 ? '' : 's'} besides you · ${d.views} page load${d.views === 1 ? '' : 's'}`;
}

/** Pure: the email body. Plain, in his words, honest about what a "visitor" is. */
export function digestHtml(d: Digest, trackingSince: string | null): string {
  const li = (xs: [string, number][], empty: string) =>
    xs.length ? `<ul style="margin:4px 0 0;padding-left:18px">${xs.map(([k, n]) => `<li>${esc(k)} <span style="color:#7C8187">· ${n}</span></li>`).join('')}</ul>` : `<div style="color:#7C8187">${empty}</div>`;
  /* A day BEFORE counting started is unknown, not zero. The SQL COALESCEs a
     missing day to 0, which would draw a flat line of zeroes across the first
     week and read as "nobody came" when the truth is "we were not counting".
     Missing renders as missing — the house rule. */
  const week = d.week.map(w => {
    const known = !trackingSince || w.day.slice(0, 10) >= trackingSince.slice(0, 10);
    return `<td style="padding:2px 8px;text-align:center;border-bottom:1px solid #E4DFD3"><div style="font-family:ui-monospace,Menlo,monospace;font-size:16px;font-weight:700;color:${known ? '#16181A' : '#B9B3A6'}">${known ? w.visitors : '–'}</div><div style="color:#7C8187;font-size:11px">${esc(dayLabel(w.day).replace(/,.*$/, ''))}</div></td>`;
  }).join('');
  return `<div style="font-family:system-ui,-apple-system,sans-serif;font-size:14px;line-height:1.6;color:#16181A;max-width:560px">
  <div style="font-size:12px;color:#7C8187;letter-spacing:.02em">smbx.ai · ${esc(dayLabel(d.day))} (Central)</div>
  <div style="font-size:30px;font-weight:700;margin:6px 0 2px">${d.visitors} <span style="font-size:15px;font-weight:600;color:#4A4F54">visitor${d.visitors === 1 ? '' : 's'} besides you</span></div>
  <div style="color:#4A4F54">${d.views} page load${d.views === 1 ? '' : 's'}${d.teamViews ? ` · your own ${d.teamViews} view${d.teamViews === 1 ? '' : 's'} not counted` : ''}</div>

  <div style="margin-top:16px;font-weight:700">Pages they landed on</div>
  ${li(d.topPages, 'No page loaded by anyone but you.')}

  <div style="margin-top:14px;font-weight:700">Where they came from</div>
  ${li(d.referrers, d.visitors ? 'Direct — no referrer (typed, bookmarked, or an app that strips it, e.g. LinkedIn’s).' : '—')}

  <div style="margin-top:14px;font-weight:700">Link previews &amp; crawlers <span style="font-weight:400;color:#7C8187">— not counted above</span></div>
  ${li(d.botNames, 'None.')}

  <div style="margin-top:16px;font-weight:700">Last 7 days · visitors besides you</div>
  <table style="border-collapse:collapse;margin-top:4px"><tr>${week}</tr></table>

  <div style="margin-top:18px;padding-top:10px;border-top:1px solid #E4DFD3;font-size:12px;color:#7C8187;line-height:1.55">
    A visitor is one IP address + browser on one day — a website cannot see MAC addresses, and this is what every analytics tool means by “unique visitor”. The address itself is never stored: it is kept as a keyed hash that cannot be reversed without this server's secret, and rows are deleted after 180 days. Your own browsers (any that have signed in to the app) and any IP that used the app that day are excluded. Crawlers and link-preview fetchers are listed separately, never counted as readers. Counts are page LOADS: the site navigates in the browser, so moving between sections after landing is not a second load.${trackingSince ? ` Counting since ${esc(dayLabel(trackingSince))}.` : ''}
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

/**
 * Records a page view. Never blocks, never throws into the response.
 *
 * THE FACTS ARE CAPTURED BEFORE `next()`, and that is not a style choice.
 * Express REWRITES `req.url`/`req.path` while a request is inside a mounted
 * router — `/api/shared/x` reads as `/shared/x` under `app.use('/api', …)` —
 * and restores it only when that router unwinds. Every real handler here is
 * async, so `next()` returns while the request is still inside the router and
 * the path is still trimmed. Reading `req.path` after `next()` therefore saw
 * the WRONG path and silently defeated the `/api` exclusion. `originalUrl` is
 * the one Express never rewrites; the rest are read up front.
 */
export function siteVisitMiddleware(req: Request, _res: Response, next: NextFunction) {
  const method = req.method;
  /* Normalised here too, not just inside isPageView: this is the value that
     gets STORED, and an email should never print `//feed` at a reader. */
  const path = normalisePath((req.originalUrl || req.url || '/').split('?')[0]);
  const accept = req.headers.accept;
  const uaNow = req.headers['user-agent'] || '';
  const ipNow = clientIp(req);
  const cookie = req.headers.cookie || '';
  const referer = req.headers.referer as string | undefined;
  next();
  try {
    if (!isPageView(method, path, accept)) return;
    const ua = uaNow;
    const ip = ipNow;
    const day = centralDay();
    const row = {
      day,
      path: path.length > 200 ? path.slice(0, 200) : path,
      visitor: sha(day, `${ip}|${ua}`),
      ip_hash: sha(day, ip),
      ua_family: uaFamily(ua),
      referer_host: refererHost(referer),
      is_bot: isBotUa(ua),
      is_team: /(^|;\s*)smbx_team=1(;|$)/.test(cookie),
    };
    db().then(sql => sql`INSERT INTO site_visits ${sql(row)}`).catch(() => { /* never a user-facing failure */ });
  } catch { /* same */ }
}

/* ── the team-IP note (called from requireAuth) ────────────────────────── */

const seenTeam = new Set<string>();   // `${day}|${ip_hash}` — one insert per IP per day per process
export function noteTeamIp(req: Request): void {
  try {
    const day = centralDay();
    const h = sha(day, clientIp(req));
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
    SELECT d.day::date::text AS day, COALESCE(u.n, 0)::int AS visitors
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
  const { teamAllowlist } = await import('./practiceMode.js');
  const to = teamAllowlist()[0];
  if (!to) return { day, sent: false, skipped: 'no team email (TEAM_ALLOWLIST)' };

  /* CLAIM THE DAY BEFORE SENDING, not after. Read-then-send-then-write leaves
     the whole duration of an SMTP call as a window in which a second worker —
     or the same one after a Railway restart — reads "not sent" and mails the
     same digest again. The INSERT is the lock: whoever wins the row sends, and
     `ON CONFLICT DO NOTHING` returns nothing to everyone else. `force` (the
     manual press) deliberately bypasses it. */
  if (!opts.force) {
    const claimed = await sql`
      INSERT INTO site_visit_digests (day, to_email, sent) VALUES (${day}, ${to}, false)
      ON CONFLICT (day) DO NOTHING RETURNING day`;
    if (!claimed.length) {
      const [done] = await sql`SELECT sent FROM site_visit_digests WHERE day = ${day}`;
      // A row that exists but never sent (a crash mid-send, or no mail key at
      // the time) is worth retrying; one that sent is not.
      if (done?.sent) return { day, sent: false, skipped: 'already sent' };
    }
  }

  const digest = await computeDigest(sql, day);
  const [first] = await sql`SELECT MIN(day)::text AS d FROM site_visits`;
  const { sendEmail } = await import('./emailService.js');
  const ok = await sendEmail({ to, subject: digestSubject(digest), html: digestHtml(digest, first?.d ?? null) });
  await sql`
    INSERT INTO site_visit_digests (day, to_email, visitors, views, sent)
    VALUES (${day}, ${to}, ${digest.visitors}, ${digest.views}, ${ok})
    ON CONFLICT (day) DO UPDATE SET sent_at = NOW(), to_email = EXCLUDED.to_email,
      visitors = EXCLUDED.visitors, views = EXCLUDED.views, sent = EXCLUDED.sent`;

  /* RETENTION. Nothing else prunes these tables and a crawler can write
     thousands of rows a day, so the daily job that reads them also ages them
     out. 180 days keeps a year-over-nothing comparison possible while the
     footer's promise ("deleted after 180 days") stays true. */
  try {
    await sql`DELETE FROM site_visits WHERE day < CURRENT_DATE - 180`;
    await sql`DELETE FROM site_team_ips WHERE day < CURRENT_DATE - 180`;
  } catch (err: any) {
    console.warn('[site-visits] retention sweep failed (non-fatal):', err?.message);
  }

  return { day, sent: ok, to, visitors: digest.visitors, views: digest.views, ...(ok ? {} : { skipped: 'mail did not send (RESEND_API_KEY / EMAIL_FROM)' }) };
}
