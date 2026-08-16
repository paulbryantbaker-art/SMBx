/**
 * house/linkedin.ts — tests.
 *
 * The parser proposes, the human confirms — so the cases that matter are the
 * REFUSALS (garbage names nothing, and says what it could not find) and the
 * noise the real page drags into a copy: chrome rows, degree markers inline
 * on the name, duplicate name lines, "· Contact info" glued to the location.
 */
import { parseLinkedInPaste } from '../linkedin.js';
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
