/**
 * Buy-side lead model — behaviour suite.
 *
 * Run: npx tsx house/__tests__/leads.test.mts
 *
 * Why this file exists: `rankLeads` decides which acquirer Paul calls first.
 * A wrong order is not a rounding error, it is a wasted week. The cases that
 * matter most are the ones that stop a CONFIDENT WRONG ANSWER — a thinly
 * evidenced firm floating to the top, a competitor scoring like a client, or a
 * firm with no closed deal outranking one with a live cadence.
 */
import {
  normSegment, normMoment, normDfw, normGrade, normProductFit, normTrades,
  touchesTrade, monthsBetween, scoreLead, rankLeads, parseLeadCsv, picture,
  type LeadRow, type LeadBox,
} from '../leads.js';

let pass = 0, total = 0;
function is(name: string, got: unknown, want: unknown) {
  total++;
  const ok = JSON.stringify(got) === JSON.stringify(want);
  pass += ok ? 1 : 0;
  console.log(`${ok ? '  ok  ' : ' FAIL '}${name}`);
  if (!ok) console.log(`        got ${JSON.stringify(got)}\n        want ${JSON.stringify(want)}`);
}
function ok(name: string, cond: boolean) { is(name, cond, true); }

/* ── normalisation ────────────────────────────────────────────────────── */

is('segment: independent sponsor', normSegment('Independent sponsor'), 'independent_sponsor');
is('segment: family office', normSegment('Family office'), 'family_office');
is('segment: permanent capital', normSegment('Permanent capital'), 'permanent_capital');
is('segment: holdco', normSegment('Holdco'), 'holdco');
is('segment: PE fund', normSegment('PE fund'), 'pe_fund');
is('segment: platform', normSegment('Platform'), 'platform');
is('segment: strategic', normSegment('Strategic'), 'strategic');
is('segment: blank is unknown, never guessed', normSegment(''), 'unknown');
// "Family office" must not fall through to pe_fund on the word "fund".
is('a family office is not a PE fund', normSegment('Family office fund'), 'family_office');

is('moment passes the three known values', [
  normMoment('has_both'), normMoment('thesis_no_flow'), normMoment('capital_no_thesis'),
], ['has_both', 'thesis_no_flow', 'capital_no_thesis']);
is('an unrecognised moment is unknown, not has_both', normMoment('warm'), 'unknown');

is('dfw values', [normDfw('yes'), normDfw('adjacent'), normDfw('no'), normDfw('')],
  ['yes', 'adjacent', 'no', 'unknown']);
is('grade values', [normGrade('primary'), normGrade('trade'), normGrade('directory')],
  ['primary', 'trade', 'directory']);
is('product fit values', [normProductFit('origination'), normProductFit('conviction'), normProductFit('')],
  ['origination', 'conviction', 'unknown']);

/* ── trades ───────────────────────────────────────────────────────────── */

is('trades split on commas', normTrades('HVAC, Plumbing'), ['hvac', 'plumbing']);
is('& normalises to "and" so both spellings compare',
  normTrades('Fire & life safety'), ['fire and life safety']);
// The register writes "Fire & life safety (stated)" when only a directory claims
// it. The qualifier is what `grade` records — it is not a different trade.
is('a parenthetical qualifier is not a different trade',
  normTrades('Fire & life safety (stated)'), ['fire and life safety']);
is('"(none in scope)" yields no trades — Permanent Equity is deliberately empty',
  normTrades('(none in scope)'), []);
is('a slash separates trades too', normTrades('Landscaping / tree care'),
  ['landscaping', 'tree care']);

ok('a target trade matches the register spelling',
  touchesTrade(normTrades('Fire & life safety'), ['fire and life safety']));
ok('substring works in the other direction too',
  touchesTrade(normTrades('HVAC (commercial)'), ['hvac']));
ok('no overlap is honestly no match',
  !touchesTrade(normTrades('Pest control'), ['fire and life safety']));
ok('no configured trades cannot claim a match',
  !touchesTrade(normTrades('HVAC'), []));

/* ── months ───────────────────────────────────────────────────────────── */

is('months between two dates', monthsBetween('2026-01-31', '2026-07-31'), 5);
is('an unreadable date is null, never 0', monthsBetween('last spring', '2026-07-31'), null);
is('a missing date is null', monthsBetween(undefined, '2026-07-31'), null);

/* ── scoring ──────────────────────────────────────────────────────────── */

const BOX: LeadBox = { trades: ['fire and life safety', 'hvac', 'plumbing'], metro: 'Dallas', asOf: '2026-07-31' };

/** MRE Capital, the register's own "BEST-FIT NAME ON THE LIST". */
const MRE: LeadRow = {
  firm: 'MRE Capital', segment: 'Family office', website: 'https://www.mre-capital.com',
  hq_state: 'MD', trades: 'Fire & life safety', dfw: 'no', grade: 'primary',
  buyer_moment: 'thesis_no_flow', product_fit: 'origination',
  key_person: 'David Williams', key_person_title: 'Founder, Chairman and CEO',
};

/** Sundog Capital: directory-only, parked website, no principals, nothing since 2022. */
const SUNDOG: LeadRow = {
  firm: 'Sundog Capital', segment: 'Independent sponsor', hq_state: 'GA',
  trades: 'Electrical', dfw: 'no', grade: 'directory',
  buyer_moment: 'has_both', product_fit: 'origination',
};

const mre = scoreLead(MRE, BOX);
const sundog = scoreLead(SUNDOG, BOX);

is('the register\'s best-fit name lands in tier A', mre.tier, 'A');
is('the weakest directory-only row lands in tier D', sundog.tier, 'D');
ok('…and it is not close', mre.score - sundog.score > 40);
is('the pitch comes straight off product_fit', mre.pitch, 'origination');

// The core claim of the model: a flow-constrained buyer outranks one that
// already has thesis AND flow, all else equal.
const flowGap = scoreLead({ ...MRE, buyer_moment: 'thesis_no_flow' }, BOX);
const hasBoth = scoreLead({ ...MRE, buyer_moment: 'has_both' }, BOX);
ok('thesis_no_flow outranks has_both, all else equal', flowGap.score > hasBoth.score);
is('…by the full need spread', flowGap.score - hasBoth.score, 25);

// Evidence quality DISCOUNTS. It must never lift a row.
const primary = scoreLead({ ...MRE, grade: 'primary' }, BOX);
const directory = scoreLead({ ...MRE, grade: 'directory' }, BOX);
ok('a directory-only version of the same firm scores LOWER', directory.score < primary.score);
ok('the discount is stated in the detail', directory.detail.includes('×0.80'));
// Regression: an early cut scored grade as a bonus, which floated a firm whose
// only evidence was an Axial listing above firms with their own disclosures.
ok('grade never appears as a positive scale', !primary.detail.includes('grade 1'));

// Geography.
const inDfw = scoreLead({ ...MRE, dfw: 'yes' }, BOX);
const adjacent = scoreLead({ ...MRE, dfw: 'adjacent' }, BOX);
ok('DFW beats adjacent beats absent', inDfw.score > adjacent.score && adjacent.score > mre.score);

// Reachability — a firm with no named contact is a research task first.
const noContact = scoreLead({ ...MRE, key_person: '', key_person_title: '' }, BOX);
ok('no named contact costs reach', noContact.score < mre.score);
ok('…and says so, so the gap is actionable', noContact.detail.includes('no named contact'));

// Structure — the less corp-dev bench they have, the more we are worth.
const sponsor = scoreLead({ ...MRE, segment: 'Independent sponsor' }, BOX);
const strategic = scoreLead({ ...MRE, segment: 'Strategic' }, BOX);
ok('an independent sponsor outranks a strategic', sponsor.score > strategic.score);

// Trade relevance is against OUR verified markets, not the register's opinion.
const offTrade = scoreLead({ ...MRE, trades: 'Pest control' }, BOX);
ok('a trade we have no master for scores no lane credit', offTrade.score < mre.score);

/* ── activity: the known hole, handled honestly ───────────────────────── */

// Homestead Service Partners: "No completed acquisition and no portfolio company
// named anywhere on the site" — yet every scoring column reads well. The model
// cannot see this, so absent activity must be neutral-low and LABELLED, never
// full marks.
const noDate = scoreLead(MRE, BOX);
ok('no dated deal evidence is stated outright', noDate.detail.includes('no dated deal evidence'));

const recent = scoreLead({ ...MRE, last_deal_on: '2026-06-01' }, BOX);
const stale = scoreLead({ ...MRE, last_deal_on: '2022-04-01' }, BOX);
ok('a recent evidenced deal outranks no evidence', recent.score > noDate.score);
ok('a four-year-old deal ranks BELOW no evidence at all', stale.score < noDate.score);
// A future date is bad data, not a hot lead — it must not buy the top slot.
const future = scoreLead({ ...MRE, last_deal_on: '2027-01-01' }, BOX);
is('a future deal date scores as unknown, not as maximally recent',
  future.score, noDate.score);
ok('…and flags itself for checking', future.detail.includes('future'));

/* ── disqualification is a human act ─────────────────────────────────── */

// The register marks APi Group "Not a client; competitive context" in prose.
// The model must NOT read that — parsing intent out of notes is how a
// placeholder ends up ranked first (the screen.ts consolidator lesson).
const apiGroup: LeadRow = {
  firm: 'APi Group', segment: 'Strategic', website: 'https://www.apigroupcorp.com',
  trades: 'Fire & life safety', dfw: 'unknown', grade: 'primary',
  buyer_moment: 'has_both', product_fit: 'origination',
  key_person: 'Russ Becker', key_person_title: 'President and CEO',
  notes: 'THE MOST ACTIVE PUBLIC CONSOLIDATOR IN FLS. Not a client; competitive context.',
};
const scored = scoreLead(apiGroup, BOX);
ok('a competitor in the notes is NOT auto-zeroed from prose', scored.score > 0);
ok('…but the formula keeps it out of tier A on its own', scored.tier !== 'A');

const flagged = scoreLead({ ...apiGroup, disqualified: 'competitive context' }, BOX);
is('an explicit human flag zeroes it', [flagged.score, flagged.tier], [0, 'D']);
ok('…with the reason carried', flagged.detail.includes('competitive context'));
// "no" must not read as a disqualification — a Sheet column filled in with "no"
// on every row would otherwise wipe the entire register.
is('disqualified="no" is not a disqualification',
  scoreLead({ ...apiGroup, disqualified: 'no' }, BOX).score, scored.score);

/* ── ranking + the picture ────────────────────────────────────────────── */

const ranked = rankLeads([SUNDOG, MRE, apiGroup], BOX);
is('best first', ranked[0].firm, 'MRE Capital');
is('worst last', ranked[2].firm, 'Sundog Capital');
is('the score rides along for export', typeof ranked[0].score, 'number');

// Stability: equal scores must not reshuffle between runs, or a list cannot be
// worked from the top.
const tieA: LeadRow = { ...MRE, firm: 'Zebra Capital' };
const tieB: LeadRow = { ...MRE, firm: 'Acme Capital' };
is('ties break on firm name, so the order is stable',
  rankLeads([tieA, tieB], BOX).map(r => r.firm), ['Acme Capital', 'Zebra Capital']);

const pic = picture(ranked);
is('picture counts every row', pic.total, 3);
is('…tallies tiers', pic.byTier.A, 1);
is('…counts rows needing a contact before outreach', pic.needContact, 1);
is('…counts directory-only rows', pic.directoryOnly, 1);

/* ── CSV ──────────────────────────────────────────────────────────────── */

const CSV = `firm,segment,dfw,grade,buyer_moment,product_fit,notes
Amalgam Capital,Independent sponsor,no,primary,has_both,origination,"Third deal, per Axial"
,,,,,,
Cascata Capital,Independent sponsor,yes,primary,has_both,origination,DALLAS HQ
`;
const rows = parseLeadCsv(CSV);
is('two real rows, the blank line dropped', rows.length, 2);
is('a quoted note keeps its comma', rows[0].notes, 'Third deal, per Axial');
is('a row with no firm name is not a lead', rows.map(r => r.firm), ['Amalgam Capital', 'Cascata Capital']);

console.log(`\n${pass}/${total} correct`);
process.exit(pass === total ? 0 : 1);
