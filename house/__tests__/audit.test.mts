/**
 * The citation audit — behaviour suite.
 *
 * Run: npx tsx house/__tests__/audit.test.mts
 *
 * Why this file exists: on 2026-08-11 it was found that `FIG_RE` had `%` inside
 * a word-boundary group — `%\b` — which requires a LETTER immediately after the
 * percent sign. That never occurs in prose, so **the audit had never checked a
 * single percentage, on any master, ever.** Measured across the three masters on
 * disk that day: home-services 407 → 568 figures, fire-safety 378 → 588,
 * elevator 48 → 120. Every one of those extra figures is a percentage that had
 * been silently exempt from the one check this practice relies on.
 *
 * It went unnoticed because the failure is invisible from outside: a master with
 * unchecked percentages prints exactly the same "✓ CLEAN" as one without. The
 * practice's own rules already name this class of danger — "a clean audit on
 * unverified research is a false green light… because it feels like the check
 * was done." This was that, one layer further down.
 *
 * So the unit vocabulary is pinned here, one assertion per form, and the
 * percentage cases are pinned hardest. A regex is one character from being
 * blind, and nothing else in the codebase would tell you.
 */
import { auditCitations, figuresNotIn } from '../audit.js';

let pass = 0, total = 0;
function is(name: string, got: unknown, want: unknown) {
  total++;
  const ok = JSON.stringify(got) === JSON.stringify(want);
  pass += ok ? 1 : 0;
  console.log(`${ok ? '  ok  ' : ' FAIL '}${name}`);
  if (!ok) console.log(`        got ${JSON.stringify(got)}\n        want ${JSON.stringify(want)}`);
}

/** Figures the doc carries that the source does not. Empty source ⇒ everything. */
const figs = (doc: string) => figuresNotIn(doc, '');

/* ── THE REGRESSION: percentages are figures ──────────────────────────── */
/* Each of these returned NOTHING before 2026-08-11. Every trailing character
   below is one that really appears in the masters — the bug was that only a
   letter after "%" would match, and a letter never follows a percent sign. */

is('percent followed by a full stop', figs('Independents hold ~30%.'), ['30%']);
is('percent followed by a comma', figs('OEMs hold ~60%, the rest is open.'), ['60%']);
is('percent followed by a space', figs('retention exceeds 90% today'), ['90%']);
is('percent at end of input', figs('the margin is 25.1%'), ['25.1%']);
is('percent followed by a paren', figs('Americas (29.4%) fell'), ['29.4%']);
is('decimal percent', figs('13.90% of employment'), ['13.90%']);
is('percent with a thousands separator', figs('1,024% growth'), ['1,024%']);
is('three in one sentence — the case that exposed it',
  figs('OEMs hold ~60%. Independents hold ~30%, and retention exceeds 90% today.'),
  ['60%', '30%', '90%']);

/* A letter after "%" was the ONLY thing the old pattern matched. Keep it
   working so the fix is a widening, never a swap. */
is('percent followed by a letter still matches', figs('a 40%APR deal'), ['40%']);

/* ── the rest of the unit vocabulary, so the fix did not narrow anything ── */

is('bare dollars', figs('a $59 lead'), ['$59']);
is('dollars with a magnitude suffix', figs('$1.2T of dry powder'), ['$1.2T']);
is('spelled-out magnitude', figs('$230.78 billion of work'), ['$230.78 billion']);
is('millions', figs('revenue of $9,442 million'), ['$9,442 million']);

/* Matching normalises (case, commas, bn→b, million→m); the RETURNED string is
   the raw one, so a reader sees the figure as it was actually written. Pinned
   because it is easy to assume otherwise and write a passing-looking test. */
is('the reported figure is the raw form, not the normalised one',
  figs('a $1,858M line'), ['$1,858M']);
is('bn and billion match each other', figuresNotIn('$14bn', 'the filing says $14 billion'), []);
is('case does not matter when matching', figuresNotIn('$1.2T', 'the source says $1.2t'), []);
is('thousands', figs('median wage $102k'), ['$102k']);
is('a multiple', figs('trading at 16.34x earnings'), ['16.34x']);
is('a bare integer is NOT a figure', figs('the 27 platforms we verified'), []);
is('a bare decimal is NOT a figure', figs('a ratio of 5.23 between them'), []);

/* The trailing \b on the magnitude group stops "$50 buyers" reading as
   50 billion. That guard predates this fix and must survive it. */
is('a word starting with a unit letter does not become a magnitude',
  figs('$50 buyers attended'), ['$50']);

/* ── a rounded figure is a different figure ───────────────────────────── */

is('$835B does not satisfy $835.5B', figuresNotIn('we cite $835.5B', 'source says $835B'), ['$835.5B']);
is('restating the unit makes a new figure',
  figuresNotIn('CHF 10,947m', 'the table says 10,947'), ['10,947m']);
is('a percentage must match exactly too',
  figuresNotIn('margin of 25.1%', 'the filing says 25%'), ['25.1%']);
is('an exact match is satisfied', figuresNotIn('margin of 25.1%', 'the filing says 25.1%'), []);
is('commas and case are ignored when matching',
  figuresNotIn('$1,858M', 'the segment earned $1858m'), []);

/* ── conflicting sources: both endpoints, never an invented midpoint ───── */
/* Paul, 2026-07-24: "one source says it's 700 million, the other says 600
   million… we could say between 600 and 700 million and cite both." */

const TWO_SOURCES = 'One filing states $600 million. Another states $700 million.';
is('a range citing both endpoints passes',
  figuresNotIn('between $600 and $700 million', TWO_SOURCES), []);
is('an invented midpoint does NOT pass',
  figuresNotIn('roughly $650 million', TWO_SOURCES), ['$650 million']);
is('a percentage range expands to both endpoints too',
  figuresNotIn('between 8 and 9%', 'sources give 8% and 9%'), []);

/* ── the Sources register ─────────────────────────────────────────────── */
/* Found 2026-08-11: section() took the FIRST heading matching
   /sources|references|method/i. A body heading — "## 8.7 Two method flags for
   whoever reproduces this" — silently hijacked the register, and every source
   reported as unacknowledged. The mirror of that is worse: had the hijacked
   section happened to contain the label words, a document with NO register at
   all would have passed. So an explicit Sources heading now wins. */

const WITH_DECOY = [
  '# A market',
  '## 8.7 Two method flags for whoever reproduces this',
  'The API undercounted; we cross-footed.',
  '## Sources',
  '- 01-structure-scale-census.md',
  '- 02-regulatory-inspection-mandate.md',
].join('\n');

const decoyAudit = auditCitations(WITH_DECOY, ['irrelevant text'],
  ['01-structure-scale-census.md', '02-regulatory-inspection-mandate.md']);
is('an explicit "## Sources" beats an earlier heading containing "method"',
  decoyAudit.sourcesMissing, []);
is('…and the register is still detected', decoyAudit.hasSourceRegister, true);

const noReg = auditCitations('# A market\n\nJust a body, no register.', ['x'], ['01-structure.md']);
is('no register at all ⇒ the source is missing', noReg.sourcesMissing, ['01-structure.md']);
is('…and hasSourceRegister is false', noReg.hasSourceRegister, false);

const bodyOnly = auditCitations(
  '# Structure and scale\n\nA long body about structure and scale.\n\n## Sources\n\n- nothing named here',
  ['x'], ['01-structure-scale-census.md']);
is('naming a source only in the BODY does not acknowledge it',
  bodyOnly.sourcesMissing, ['01-structure-scale-census.md']);

/* ── the Derivations register ─────────────────────────────────────────── */

const DERIVED = [
  '# A market', 'Service margin ran 25.1% against 4.8%, a gap of 20.3pp.',
  '## Derivations', '**D-2.** 25.1% − 4.8% = **20.3pp**.',
].join('\n');
const dAudit = auditCitations(DERIVED, ['the filing gives 25.1% and 4.8%'], []);
is('a percentage registered under Derivations is explained', dAudit.unexplained, []);
is('…and the register is detected', dAudit.hasDerivationRegister, true);
is('an unregistered derived percentage IS flagged',
  auditCitations('Margin rose by 21.6% year on year.', ['no figures here'], []).unexplained,
  ['21.6%']);

/* ── URLs must survive into the master ────────────────────────────────── */

const u = auditCitations('# M\n\n## Sources\n- https://www.bls.gov/oes/current/oes474021.htm',
  ['see https://www.bls.gov/oes/current/oes474021.htm and https://www.census.gov/x'], []);
is('a URL carried through is not dropped',
  u.urlsDropped.includes('https://www.bls.gov/oes/current/oes474021.htm'), false);
is('a URL left behind is reported', u.urlsDropped.length, 1);
is('a trailing slash is not a different URL',
  auditCitations('## Sources\n- https://example.com/a/', ['https://example.com/a'], []).urlsDropped, []);

/* ── the overall verdict ──────────────────────────────────────────────── */

const clean = auditCitations(
  '# M\n\nRetention was 92.4%.\n\n## Sources\n- 01-notes.md\n- https://x.test/a',
  ['Otis reported 92.4% retention. https://x.test/a'], ['01-notes.md']);
is('a fully traceable document is ok', clean.ok, true);
is('…with nothing unexplained', clean.unexplainedCount, 0);

const dirty = auditCitations(
  '# M\n\nRetention was 92.4% and margin 25.1%.\n\n## Sources\n- 01-notes.md',
  ['Otis reported 92.4% retention.'], ['01-notes.md']);
is('one unsourced percentage is enough to fail', dirty.ok, false);
is('…and it is named', dirty.unexplained, ['25.1%']);

console.log(`\n${pass}/${total} correct`);
process.exit(pass === total ? 0 : 1);
