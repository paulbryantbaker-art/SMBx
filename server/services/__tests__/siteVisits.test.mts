/**
 * siteVisits — the pure half (no db): what counts as a page view, who is a
 * bot, how a UA reads, the Central day, the digest arithmetic, and the email.
 *
 *   npx tsx server/services/__tests__/siteVisits.test.mts
 */
import assert from 'node:assert/strict';
import {
  isBotUa, uaFamily, refererHost, centralDay, centralYesterday, isPageView,
  normalisePath,
  summarise, digestSubject, digestHtml, type DigestRow,
} from '../siteVisits.js';

let pass = 0, total = 0;
const T = (name: string, fn: () => unknown, want: unknown) => {
  total++;
  let got: unknown;
  try { got = fn(); } catch (e: any) { got = `THREW: ${e.message}`; }
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) pass++;
  console.log(`${ok ? '✓' : '✗'} ${name}${ok ? '' : `\n    got  ${JSON.stringify(got)}\n    want ${JSON.stringify(want)}`}`);
};

const CHROME_MAC = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';
const SAFARI_IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const LINKEDIN = 'LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com)';
const OPERA_MAC = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36 OPR/113.0.0.0';

console.log('WHAT COUNTS AS A PAGE VIEW');
T('a GET for HTML on a public path counts', () => isPageView('GET', '/research/hvac-2026-read', 'text/html,application/xhtml+xml'), true);
T('the landing page counts', () => isPageView('GET', '/', 'text/html'), true);
T('an API call does not', () => isPageView('GET', '/api/health', 'text/html'), false);
T('an asset does not', () => isPageView('GET', '/assets/index-abc.js', '*/*'), false);
T('a collateral PDF does not (it is a download, counted nowhere here)', () => isPageView('GET', '/collateral/x/2026-08-20/x.pdf', 'text/html'), false);
T('a file by extension does not', () => isPageView('GET', '/logo-lockup.png', 'image/webp,*/*'), false);
T('a fetch without Accept text/html does not', () => isPageView('GET', '/', 'application/json'), false);
T('POST does not', () => isPageView('POST', '/', 'text/html'), false);
/* Written after the 2026-08-18 review: the SPA catch-all answers 200 for ANY
   unmatched path, so without an allowlist a scanner is a "visitor" and a
   password-reset token gets written to the table and printed in the email. */
T('a vulnerability probe is not a visitor', () => [isPageView('GET', '/wp-admin', 'text/html'), isPageView('GET', '/phpmyadmin/index', 'text/html')], [false, false]);
T('a password-reset link is NEVER recorded — the path is a live credential', () => isPageView('GET', '/reset-password/eyJhbGciOiJIUzI1NiJ9.abc', 'text/html'), false);
T('a share token is never recorded', () => [isPageView('GET', '/shared/tok123', 'text/html'), isPageView('GET', '/shared/doc/tok123', 'text/html'), isPageView('GET', '/biz/tok', 'text/html')], [false, false, false]);
T('the report-unlock hop is not double-counted with the page it redirects to', () => isPageView('GET', '/reports/fire-safety/unlock', 'text/html'), false);
T('the real pages still count', () => ['/', '/about', '/industries', '/track-record', '/research/hvac-2026-read', '/buyers/private-equity', '/legal/privacy'].every(p => isPageView('GET', p, 'text/html')), true);

/* THESE FIVE EXIST BECAUSE THE EMAIL REPORTED A PAGE THAT DOES NOT EXIST.
   On 2026-08-20 the digest listed `/feed` among nine visitors. `/feed` is not
   a route on this site — it is the WordPress RSS probe. It got in through the
   doubled slash: PUBLIC_PAGES must hold '' for the landing page, and
   '//feed'.split('/')[1] is also '', so the allowlist admitted it. The
   single-slash probe test three lines above passed the entire time, which is
   the lesson — a guard tested only on the tidy input is not tested. */
T('a doubled slash does NOT smuggle a probe past the allowlist', () => [isPageView('GET', '//feed', 'text/html'), isPageView('GET', '//wp-admin', 'text/html'), isPageView('GET', '///feed', 'text/html'), isPageView('GET', '//anything/at/all', 'text/html')], [false, false, false, false]);
T('…and `//` is still just the landing page', () => isPageView('GET', '//', 'text/html'), true);
T('a trailing slash cannot dodge the extension or unlock tests either', () => [isPageView('GET', '/logo-lockup.png/', 'text/html'), isPageView('GET', '/reports/fire-safety/unlock/', 'text/html')], [false, false]);
T('a protocol-relative redirect target is not a visitor', () => isPageView('GET', '//evil.example.com/x', 'text/html'), false);
T('normalisePath collapses and trims without ever returning empty', () => ['//feed', '///a//b///', '/', '//', '/about/', ''].map(normalisePath), ['/feed', '/a/b', '/', '/', '/about', '/']);

/* Same defect one segment deeper: the allowlist only reads the FIRST segment,
   so anything riding behind a real page name was admitted verbatim. */
T('a traversal probe behind a real page is not a visitor', () => ['/research/../wp-admin', '/about/../../etc/passwd', '/buyers/..%2fwp-admin', '/research/%00'].map(p => isPageView('GET', p, 'text/html')), [false, false, false, false]);
T('…but every real slug still counts', () => ['/research/fire-safety', '/research/commercial-mep', '/research/home-services', '/research/dfw-home-services', '/buyers/private-equity', '/legal/privacy', '/track-record'].every(p => isPageView('GET', p, 'text/html')), true);
console.log('\nBOTS AND BROWSERS');
T('LinkedIn preview fetcher is a bot', () => isBotUa(LINKEDIN), true);
T('…and is named', () => uaFamily(LINKEDIN), 'LinkedInBot');
T('no user agent is a script, not a person', () => isBotUa(''), true);
T('Chrome on a Mac is a person', () => isBotUa(CHROME_MAC), false);
T('…and reads as Chrome · Mac', () => uaFamily(CHROME_MAC), 'Chrome · Mac');
T('Safari on an iPhone', () => uaFamily(SAFARI_IPHONE), 'Safari · iPhone');
T('Opera is not mistaken for Chrome', () => uaFamily(OPERA_MAC), 'Opera · Mac');
T('curl is a bot', () => isBotUa('curl/8.4.0'), true);
T('GPTBot is a bot and named', () => [isBotUa('Mozilla/5.0 (compatible; GPTBot/1.2)'), uaFamily('Mozilla/5.0 (compatible; GPTBot/1.2)')], [true, 'GPTBot']);
/* THE ONE THAT MATTERS ON THIS ACCOUNT. LinkedIn's in-app browser appends
   [LinkedInApp] to an ordinary Safari UA. The first cut of BOT_RE carried a
   bare `linkedin`, so every reader who tapped a link inside the LinkedIn app —
   most of this practice's traffic — was counted as a bot, and the email would
   have said "0 visitors besides you" on the mornings after a post worked. */
const LI_APP = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [LinkedInApp]/9.29.1234';
T('a reader in the LinkedIn app is a PERSON, not a bot', () => isBotUa(LI_APP), false);
T('…and reads as the LinkedIn app', () => uaFamily(LI_APP), 'LinkedIn app');
T('LinkedIn’s crawler is still a bot', () => isBotUa(LINKEDIN), true);
T('the Facebook in-app browser is a person', () => isBotUa('Mozilla/5.0 (iPhone) AppleWebKit/605.1.15 [FBAN/FBIOS;FBAV/470.0]'), false);
T('WhatsApp’s preview fetcher is a bot, its in-app browser is not', () => [isBotUa('WhatsApp/2.23.20'), isBotUa('Mozilla/5.0 (Linux; Android 14) Chrome/120 Mobile WhatsApp Browser')], [true, false]);

console.log('\nREFERRERS');
T('a LinkedIn referer reads as its host', () => refererHost('https://www.linkedin.com/feed/'), 'linkedin.com');
T('same-site is direct', () => refererHost('https://smbx.ai/research'), null);
T('a subdomain of the site is direct', () => refererHost('https://www.smbx.ai/'), null);
T('garbage is direct', () => refererHost('not a url'), null);
T('missing is direct', () => refererHost(undefined), null);

console.log('\nTHE CENTRAL DAY');
// 2026-08-19 01:30 UTC is still 2026-08-18 in Chicago (UTC-5 in August)
T('an evening view is the Central day, not the UTC one', () => centralDay(new Date('2026-08-19T01:30:00Z')), '2026-08-18');
T('yesterday, Central', () => centralYesterday(new Date('2026-08-19T13:00:00Z')), '2026-08-18');

console.log('\nTHE DIGEST');
const row = (o: Partial<DigestRow>): DigestRow => ({ path: '/', visitor: 'v1', is_bot: false, ua_family: 'Chrome · Mac', referer_host: null, ...o });
const human: DigestRow[] = [
  row({ visitor: 'a', path: '/' }), row({ visitor: 'a', path: '/research/hvac-2026-read', referer_host: 'linkedin.com' }),
  row({ visitor: 'b', path: '/', referer_host: 'linkedin.com' }),
  row({ visitor: 'c', path: '/about' }),
  row({ visitor: 'bot1', path: '/', is_bot: true, ua_family: 'LinkedInBot' }),
  row({ visitor: 'bot2', path: '/', is_bot: true, ua_family: 'LinkedInBot' }),
];
const team: DigestRow[] = [row({ visitor: 'paul', path: '/' }), row({ visitor: 'paul', path: '/research' })];
const week = [1, 2, 3, 4, 5, 6, 7].map(i => ({ day: `2026-08-1${i}`, visitors: i === 7 ? 3 : 0 }));
const d = summarise('2026-08-17', human, team, week);
T('unique visitors besides the team — people, not rows, not bots', () => d.visitors, 3);
T('page views besides the team — people rows only', () => d.views, 4);
T('the team’s own views are counted separately', () => d.teamViews, 2);
T('bots are counted separately and named', () => [d.bots, d.botNames], [2, [['LinkedInBot', 2]]]);
T('top pages, most read first', () => d.topPages, [['/', 2], ['/research/hvac-2026-read', 1], ['/about', 1]]);
T('referrers exclude direct', () => d.referrers, [['linkedin.com', 2]]);
T('the subject answers first', () => digestSubject(d), 'smbx.ai Mon, Aug 17: 3 visitors besides you · 4 page loads');
T('singular reads right', () => digestSubject(summarise('2026-08-17', [row({ visitor: 'z' })], [], week)), 'smbx.ai Mon, Aug 17: 1 visitor besides you · 1 page load');
const html = digestHtml(d, '2026-08-11');
T('the email says what a visitor is and what is excluded', () => /cannot see MAC addresses/.test(html) && /Your own browsers/.test(html) && /Counting since/.test(html), true);
T('…and claims only what the code does — keyed hash, 180-day deletion, loads not views', () => /keyed hash/.test(html) && /180 days/.test(html) && /page LOADS/i.test(html), true);
/* generate_series over two dates resolves to timestamptz, so a week row can
   arrive as '2026-08-12 00:00:00+00'. Before the ::date cast + slice, every
   cell of the strip printed the literal "Invalid Date", every morning. */
T('a timestamptz-shaped week row still labels correctly', () => { const h = digestHtml(summarise('2026-08-17', human, team, [{ day: '2026-08-11 00:00:00+00', visitors: 2 }]), null); return !/Invalid Date/.test(h) && />Tue</.test(h); }, true);
T('days before counting began read as – , not 0', () => { const h = digestHtml(summarise('2026-08-17', human, team, [{ day: '2026-08-10', visitors: 0 }, { day: '2026-08-17', visitors: 3 }]), '2026-08-15'); return /–/.test(h); }, true);
T('the email carries the numbers and the week', () => /3 <span/.test(html) && /linkedin\.com/.test(html) && /LinkedInBot/.test(html) && (html.match(/<td /g) ?? []).length === 7, true);
T('an empty day still reads as a sentence, not a hole', () => { const e = summarise('2026-08-17', [], [], week); const h = digestHtml(e, null); return /0 <span/.test(h) && /No page loaded by anyone but you/.test(h); }, true);

console.log(`\n${pass}/${total} passed`);
process.exit(pass === total ? 0 : 1);
