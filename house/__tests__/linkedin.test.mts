/**
 * house/linkedin.ts — tests.
 *
 * The parser proposes, the human confirms — so the cases that matter are the
 * REFUSALS (garbage names nothing, and says what it could not find) and the
 * noise the real page drags into a copy: chrome rows, degree markers inline
 * on the name, duplicate name lines, "· Contact info" glued to the location.
 */
import { parseLinkedInPaste, parseLinkedInCompany } from '../linkedin.js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));

let pass = 0;
const fails: string[] = [];
function ok(name: string, cond: boolean, detail = '') {
  if (cond) { pass++; return; }
  fails.push(`${name}${detail ? ` — ${detail}` : ''}`);
}
function eq(name: string, actual: unknown, expected: unknown) {
  ok(name, JSON.stringify(actual) === JSON.stringify(expected),
    `got ${JSON.stringify(actual)}, want ${JSON.stringify(expected)}`);
}

/* ── the clean top-card copy — the common case ──────────────────────── */
{
  const p = parseLinkedInPaste(
    'Jane Smith\nManaging Partner at Cedar Ridge Capital\nDallas, Texas, United States · Contact info\n500+ connections\n',
  );
  eq('top card: name', p.name, 'Jane Smith');
  eq('top card: headline', p.headline, 'Managing Partner at Cedar Ridge Capital');
  eq('top card: title split', p.title, 'Managing Partner');
  eq('top card: company split', p.company, 'Cedar Ridge Capital');
  eq('top card: location, Contact info stripped', p.location, 'Dallas, Texas, United States');
  ok('top card: url honestly missing', p.missing.includes('linkedin url'));
}

/* ── the full-page copy with chrome, dup name, inline degree ────────── */
{
  const p = parseLinkedInPaste([
    'Skip to main content', 'Home', 'My Network', 'Jobs', 'Messaging', 'Me',
    'Jane Smith', 'Jane Smith · 3rd', 'Managing Partner at Cedar Ridge Capital',
    'Dallas-Fort Worth Metroplex Area', 'Connect', 'Message', 'More',
    'About', 'Jane leads a lower-middle-market…',
  ].join('\n'));
  eq('full page: name survives chrome + dedupe + degree strip', p.name, 'Jane Smith');
  eq('full page: headline', p.headline, 'Managing Partner at Cedar Ridge Capital');
  eq('full page: Area location', p.location, 'Dallas-Fort Worth Metroplex Area');
}
{
  /* Everything below the first section header is NOT top-card material —
     an Experience entry must never be read as a headline. */
  const p = parseLinkedInPaste('Experience\nPartner\nSome Fund · Full-time\n');
  eq('section stop: nothing invented', p.name, null);
  ok('section stop: missing names name', p.missing.includes('name'));
}

/* ── the tab-title anchor ───────────────────────────────────────────── */
{
  const p = parseLinkedInPaste('(2) Bob Q. Jones III | LinkedIn\nBob Q. Jones III\nOperating Partner @ Foundry Holdings\nFort Worth, Texas\n');
  eq('tab title wins the name', p.name, 'Bob Q. Jones III');
  eq('@ joiner splits too', p.company, 'Foundry Holdings');
  eq('tab title anchors location', p.location, 'Fort Worth, Texas');
}

/* ── the URL, wherever it sits ──────────────────────────────────────── */
{
  eq('bare url normalised',
    parseLinkedInPaste('linkedin.com/in/jane-smith-123').linkedinUrl,
    'https://www.linkedin.com/in/jane-smith-123');
  eq('full url kept',
    parseLinkedInPaste('https://www.linkedin.com/in/jsmith').linkedinUrl,
    'https://www.linkedin.com/in/jsmith');
}

/* ── refusals: never invent ─────────────────────────────────────────── */
{
  const p = parseLinkedInPaste('');
  eq('empty: everything missing', p.missing.length, 4);
  const q = parseLinkedInPaste('9481 12,001 44 2026');
  eq('digit soup names nothing', q.name, null);
  /* A headline with no explicit joiner keeps title=headline, company null —
     guessing which noun is the firm is how a fabricated employer is born. */
  const r = parseLinkedInPaste('Jane Smith\nInvestor and operator\n');
  eq('no joiner: title is the headline', r.title, 'Investor and operator');
  eq('no joiner: company stays null', r.company, null);
}

/* ── Sales Navigator hardening ──────────────────────────────────────────
   WHY-THIS-EXISTS: the first live paste was a Sales Nav page and the
   register gained a primary contact named "Actions List" — the button bar.
   Two capitalised words are indistinguishable from a name by shape, so
   every known Sales Nav control is chrome now. */
{
  const p = parseLinkedInPaste([
    'Actions List', 'Referrals', 'Ashwin Kalsekar', 'Principal at Mergely Capital',
    'Dallas-Fort Worth Metroplex Area', 'Save', 'View profile', 'Get intro',
  ].join('\n'));
  eq('sales nav: the button bar is not a person', p.name, 'Ashwin Kalsekar');
  eq('sales nav: company still splits', p.company, 'Mergely Capital');
}
{
  const p = parseLinkedInPaste('Jane Smith | Sales\nJane Smith\nPartner at Foundry Holdings\n');
  eq('sales nav tab title read', p.name, 'Jane Smith');
  const q = parseLinkedInPaste('linkedin.com/sales/lead/ACwAAA123,NAME,x');
  ok('sales nav lead url kept', (q.linkedinUrl ?? '').includes('/sales/lead/ACwAAA123'));
}

/* ── the company parser (step 1 of the two-step add) ────────────────── */
{
  const c = parseLinkedInCompany(
    'Mergely Capital | Sales\nMergely Capital\nLower-middle-market investing\nFinancial Services · Dallas, Texas · 1K followers\n',
  );
  eq('company: name from tab', c.name, 'Mergely Capital');
  eq('company: industry from meta', c.industry, 'Financial Services');
  eq('company: location from meta', c.location, 'Dallas, Texas');
}
{
  const c = parseLinkedInCompany('Acme Fire Protection\nSecurity & Investigations · 51-200 employees · Fort Worth, Texas\nhttps://www.linkedin.com/company/acme-fire\n');
  eq('company: headcount segment skipped', c.industry, 'Security & Investigations');
  eq('company: url normalised', c.linkedinUrl, 'https://www.linkedin.com/company/acme-fire');
  eq('company: location found', c.location, 'Fort Worth, Texas');
}
{
  const c = parseLinkedInCompany('');
  eq('company: empty names everything missing', c.missing.length, 4);
  const d = parseLinkedInCompany('Save\nLists\nActions List\n');
  eq('company: pure chrome names nothing', d.name, null);
}

/* ── toast + counter noise (Paul's SECOND real paste, 2026-08-16) ───────
   His copy of a Sales Nav account page carried "0 notifications total",
   "Chat with us" and the save toast "Cambridge Pacific has been saved" —
   and "Chat with us" is exactly the shape the name heuristic eats. */
{
  const c = parseLinkedInCompany('0 notifications total\nChat with us\nCambridge Pacific has been saved\n');
  eq('toast NAMES the company', c.name, 'Cambridge Pacific');
  const p = parseLinkedInPaste('0 notifications total\nChat with us\nPerry J. Pound\nManaging Director at Cambridge Pacific\n');
  eq('person: chat-with-us is not a person', p.name, 'Perry J. Pound');
  eq('person: company splits through the noise', p.company, 'Cambridge Pacific');
}

/* ── the most recent role wins (Paul, 2026-08-16: person-only import,
      "take the most recent role as their company") ───────────────────── */
{
  const p = parseLinkedInPaste([
    'Perry J. Pound', 'Investor and operator', 'Dallas, Texas',
    'Experience', 'Cambridge Pacific logo', 'Managing Director',
    'Cambridge Pacific · Full-time', 'Jan 2021 - Present · 5 yrs',
  ].join('\n'));
  eq('experience beats a joiner-less headline: company', p.company, 'Cambridge Pacific');
  eq('experience beats a joiner-less headline: title', p.title, 'Managing Director');
  eq('headline itself is preserved', p.headline, 'Investor and operator');
}
{
  /* And it beats the headline even when the headline HAS a joiner — the
     headline is a self-description, the first Experience entry is the job. */
  const p = parseLinkedInPaste([
    'Jane Smith', 'Board member at Various', 'Experience',
    'Operating Partner', 'Foundry Holdings', 'Mar 2024 - Present',
  ].join('\n'));
  eq('most recent role overrides headline company', p.company, 'Foundry Holdings');
}
{
  const p = parseLinkedInPaste('Bob Jones\nCurrent: Principal at Mergely Capital\n');
  eq('Sales Nav Current line: company', p.company, 'Mergely Capital');
  eq('Sales Nav Current line: title', p.title, 'Principal');
}
{
  /* An Experience section with only a title (entry cut off) must not invent
     a company from a date line. */
  const p = parseLinkedInPaste('Ann Ray\nCFO at Acme Fire\nExperience\nCFO\nJan 2020 - Present\n');
  eq('truncated experience entry: headline split still stands', p.company, 'Acme Fire');
}

/* ── purity ─────────────────────────────────────────────────────────── */
{
  const src = readFileSync(join(HERE, '..', 'linkedin.ts'), 'utf8');
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  for (const banned of ['fetch(', 'Date.now', 'new Date', 'Math.random', 'process.env', "from 'node:"]) {
    ok(`pure: no ${banned}`, !code.includes(banned));
  }
}

if (fails.length) {
  console.error(`linkedin: ${fails.length} FAILED, ${pass} passed`);
  for (const f of fails) console.error(`  ✕ ${f}`);
  process.exit(1);
}
console.log(`linkedin: all ${pass} cases passed`);
