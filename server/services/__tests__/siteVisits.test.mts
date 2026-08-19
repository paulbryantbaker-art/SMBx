/**
 * siteVisits — the pure half (no db): what counts as a page view, who is a
 * bot, how a UA reads, the Central day, the digest arithmetic, and the email.
 *
 *   npx tsx server/services/__tests__/siteVisits.test.mts
 */
import assert from 'node:assert/strict';
import {
  isBotUa, uaFamily, refererHost, centralDay, centralYesterday, isPageView,
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
T('the subject answers first', () => digestSubject(d), 'smbx.ai Mon, Aug 17: 3 visitors besides you · 4 page views');
T('singular reads right', () => digestSubject(summarise('2026-08-17', [row({ visitor: 'z' })], [], week)), 'smbx.ai Mon, Aug 17: 1 visitor besides you · 1 page view');
const html = digestHtml(d, '2026-08-11');
T('the email says what a visitor is and what is excluded', () => /cannot see MAC addresses/.test(html) && /Your own browsers/.test(html) && /Counting since/.test(html), true);
T('the email carries the numbers and the week', () => /3 <span/.test(html) && /linkedin\.com/.test(html) && /LinkedInBot/.test(html) && (html.match(/<td /g) ?? []).length === 7, true);
T('an empty day still reads as a sentence, not a hole', () => { const e = summarise('2026-08-17', [], [], week); const h = digestHtml(e, null); return /0 <span/.test(h) && /No pages read by anyone but you/.test(h); }, true);

console.log(`\n${pass}/${total} passed`);
process.exit(pass === total ? 0 : 1);
