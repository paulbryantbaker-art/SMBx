/**
 * house/engagement.ts — tests.
 *
 * The published schedule's own worked anchors ARE the test cases: a fee
 * engine that cannot reproduce the numbers the practice publishes is wrong
 * whatever else it does. One anchor disagrees with the schedule's own bands
 * by $100 and the test says so out loud rather than quietly matching either.
 */
import {
  successFee, retainerCredit, SCHEDULE_SUMMARY,
  QUARTER_RETAINER_CENTS, FEE_FLOOR_CENTS, FLOOR_BINDS_BELOW_CENTS, FEE_BANDS,
} from '../engagement.js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

let pass = 0;
const fails: string[] = [];
function ok(name: string, cond: boolean, detail = '') {
  if (cond) { pass++; return; }
  fails.push(`${name}${detail ? ` — ${detail}` : ''}`);
}
function eq(name: string, got: unknown, want: unknown) {
  ok(name, JSON.stringify(got) === JSON.stringify(want), `got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
}

const M = (dollarsM: number) => Math.round(dollarsM * 100_000_000); // $M → cents
const fee = (evCents: number) => {
  const r = successFee(evCents);
  if (!r.ok) throw new Error(r.why);
  return r.fee;
};

/* ── the schedule's constants ── */
eq('the retainer is $15,000 a quarter, in cents', QUARTER_RETAINER_CENTS, 1_500_000);
eq('the floor is $100,000, in cents', FEE_FLOOR_CENTS, 10_000_000);
eq('four bands', FEE_BANDS.length, 4);
eq('band rates are 5/4/3/2', FEE_BANDS.map(b => b.rateBps), [500, 400, 300, 200]);

/* ── the published worked anchors ── */
eq('$1.8M → $100K, the floor', fee(M(1.8)).feeCents, 10_000_000);
ok('…and the floor is marked applied', fee(M(1.8)).floorApplied);
eq('…over a banded total of $82K', fee(M(1.8)).bandedTotalCents, 8_200_000);

/* The schedule prints "$3.46M → $148K"; the bands give $148,400 exactly
   (5%·$1M + 4%·$2.46M = $50,000 + $98,400). The printed anchor is display
   rounding of this same arithmetic, so the test asserts the exact figure. */
eq('$3.46M → $148,400 exact', fee(M(3.46)).feeCents, 14_840_000);

eq('$5M → $210K exact', fee(M(5)).feeCents, 21_000_000);
eq('$10M → $360K exact', fee(M(10)).feeCents, 36_000_000);

/* THE ANCHOR THAT DISAGREES WITH ITS OWN FORMULA. The schedule prints
   "$32.58M → $811.5K (= fixed $360K + 2% over $10M)". Its own parenthetical
   gives $360K + 2%·$22.58M = $360K + $451.6K = $811.6K — a $100 discrepancy
   in the printed anchor, not in the bands. This engine follows the BAND
   DEFINITION, which the same document states as the law and which reproduces
   every other anchor exactly. Flagged here rather than silently matched:
   quietly reproducing a typo would be the zero-hallucination failure in
   reverse. */
eq('$32.58M → $811.6K by the bands (the doc prints $811.5K — its own $100 slip)',
  fee(M(32.58)).feeCents, 81_160_000);

/* ── band boundaries, no cliffs ── */
eq('$1M exactly: 5% throughout', fee(M(1)).feeCents, FEE_FLOOR_CENTS); // $50K banded → floor
eq('…banded total at $1M is $50K', fee(M(1)).bandedTotalCents, 5_000_000);
eq('one dollar over $1M adds 4 cents, not a cliff',
  fee(M(1) + 100).bandedTotalCents - fee(M(1)).bandedTotalCents, 4);

/* The floor boundary: at exactly $2.25M the banded total EQUALS the floor.
   floorApplied must be FALSE there — nothing was lifted — and TRUE one cent
   below. Conflating "at the floor" with "lifted to the floor" is how a fee
   summary misstates which rule produced the number. */
eq('the exported boundary is $2.25M', FLOOR_BINDS_BELOW_CENTS, 225_000_000);
eq('at exactly $2.25M the bands give exactly the floor', fee(225_000_000).bandedTotalCents, FEE_FLOOR_CENTS);
ok('…and floorApplied is false there', !fee(225_000_000).floorApplied);
ok('…and true one cent below', fee(225_000_000 - 100).floorApplied);

/* ── refusals ── */
ok('zero EV refuses', !successFee(0).ok);
ok('negative EV refuses', !successFee(-5).ok);
ok('a float refuses, naming house rule 10', (() => {
  const r = successFee(1234.56);
  return !r.ok && /rule 10/.test(r.why);
})());
ok('NaN refuses', !successFee(NaN).ok);

/* ── workings reconstruct the number ── */
{
  const f = fee(M(10));
  const sum = f.lines.reduce((s, l) => s + l.feeCents, 0);
  eq('band lines sum to the banded total', sum, f.bandedTotalCents);
  ok('workings end on the fee', /\$360K\.$/.test(f.workings[f.workings.length - 1]));
}

/* ── retainer credit ── */
{
  const r = retainerCredit({ retainerPaidCents: 3 * QUARTER_RETAINER_CENTS, feeCents: 21_000_000, closed: true });
  ok('a closed deal credits', r.ok);
  if (r.ok) {
    eq('three quarters credit in full', r.credit.creditCents, 4_500_000);
    eq('due at close is fee minus credit', r.credit.dueAtCloseCents, 16_500_000);
    eq('nothing forfeited', r.credit.excessForfeitedCents, 0);
  }
}
{
  /* The long mandate on a floor deal: 8 quarters = $120K paid, $100K fee.
     Credit caps at the fee, $0 due, $20K forfeited AND PRINTED. */
  const r = retainerCredit({ retainerPaidCents: 8 * QUARTER_RETAINER_CENTS, feeCents: FEE_FLOOR_CENTS, closed: true });
  ok('credit caps at the fee', r.ok && r.credit.creditCents === FEE_FLOOR_CENTS);
  ok('nothing due at close', r.ok && r.credit.dueAtCloseCents === 0);
  eq('the excess is named, not zeroed', r.ok ? r.credit.excessForfeitedCents : -1, 2_000_000);
  ok('and the workings say it is not refunded', r.ok && r.credit.workings.some(w => /not refunded/.test(w)));
}
{
  const r = retainerCredit({ retainerPaidCents: 4_500_000, feeCents: 21_000_000, closed: false });
  ok('no close, no credit', r.ok && r.credit.creditCents === 0);
  ok('…with the rule stated', r.ok && /No close, no credit/.test(r.credit.workings[0]));
  ok('…and the full fee still due', r.ok && r.credit.dueAtCloseCents === 21_000_000);
}
ok('negative retainer refuses', !retainerCredit({ retainerPaidCents: -1, feeCents: 1, closed: true }).ok);

/* ── doctrine ── */
ok('the summary states no-negotiation', /no negotiated pricing/.test(SCHEDULE_SUMMARY));
ok('…and no-close-no-credit', /no close, no credit/.test(SCHEDULE_SUMMARY));

/* ── purity (comments stripped first — the header EXPLAINS the bans) ── */
const SRC = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'engagement.ts'), 'utf8');
const CODE = SRC.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
ok('no database', !/\bfrom ['"]postgres|\bsql`/.test(CODE));
ok('no env', !/process\.env/.test(CODE));
ok('no clock', !/Date\.now\(\)|new Date\(\s*\)/.test(CODE));
ok('no model, no fetch', !/anthropic|fetch\(/i.test(CODE));
/* The schedule is law, not a parameter: no function takes rates or bands. */
ok('no function accepts a rate — the schedule is constants',
  !/function \w+\([^)]*rate|function \w+\([^)]*band/i.test(CODE));

if (fails.length) {
  console.error(`\nengagement.test: ${pass} passed, ${fails.length} FAILED\n`);
  for (const f of fails) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log(`${pass}/${pass} correct`);
