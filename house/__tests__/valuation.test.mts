/**
 * Valuation routing by deal type.
 *
 * Run: npx tsx house/__tests__/valuation.test.mts   (npm run test:valuation)
 *
 * The arithmetic is `house/deal.ts`'s and is tested there. What this file
 * protects is the ROUTING — which method applies to which situation — because
 * the failures it prevents all look like successes:
 *
 *   · an EBITDA multiple on a distressed business produces a confident number
 *     from a base that does not support one;
 *   · a going-concern value on an OpCo/PropCo hides which of two assets you
 *     are paying for;
 *   · an opinion of value on an ESOP sale is a regulated appraisal we have no
 *     standing to produce.
 *
 * None of those throw. All three print.
 */
import {
  DEAL_TYPES, DEAL_TYPE_SPECS, specFor, methodsToRun, whyNot, referrals,
  earningsMultipleApplies, bandFor, leagueFor, earningsBase, type DealType, type Method,
} from '../valuation.js';
import { valuation, LEAGUE_MULTIPLES } from '../deal.js';

let pass = 0, total = 0;
function is(name: string, got: unknown, want: unknown) {
  total++;
  const ok = JSON.stringify(got) === JSON.stringify(want);
  pass += ok ? 1 : 0;
  console.log(`${ok ? '  ok  ' : ' FAIL '}${name}`);
  if (!ok) console.log(`        got  ${JSON.stringify(got)}\n        want ${JSON.stringify(want)}`);
}
function ok(name: string, cond: boolean) { is(name, cond, true); }

/* ── the table is complete ────────────────────────────────────────────── */

is('every declared type has a spec', DEAL_TYPES.length, DEAL_TYPE_SPECS.length);
ok('…and they are the same set',
  DEAL_TYPES.every(t => DEAL_TYPE_SPECS.some(s => s.type === t)));

/* EVERY TYPE RULES ON EVERY METHOD. This is the assertion that makes the table
   useful: a method missing from a type is indistinguishable, at the call site,
   from a method that does not apply — and the whole design is that "does not
   apply" comes with a reason. Silence is the failure mode. */
const ALL_METHODS: Method[] = [
  'sde-multiple', 'ebitda-multiple', 'dcf', 'asset-floor',
  'sotp', 'lbo-afford', 'synergy-adjusted', 'appraisal',
];
for (const s of DEAL_TYPE_SPECS) {
  is(`${s.type} rules on all ${ALL_METHODS.length} methods`,
    ALL_METHODS.filter(m => !s.methods.some(v => v.method === m)), []);
}

ok('every verdict carries a reason', DEAL_TYPE_SPECS.every(s => s.methods.every(m => m.why.length > 20)));
ok('every type says what must be established first',
  DEAL_TYPE_SPECS.every(s => s.mustEstablish.length >= 2));
ok('every type has a tell a practitioner would recognise',
  DEAL_TYPE_SPECS.every(s => s.tell.length > 30));

/* ── the three failures this exists to prevent ────────────────────────── */

/* DISTRESSED. The reflex is a multiple, and the reflex is wrong: no multiple
   repairs a base that does not support a value. */
is('distressed refuses an EBITDA multiple',
  specFor('distressed').methods.find(m => m.method === 'ebitda-multiple')?.status, 'n/a');
is('…and an SDE multiple',
  specFor('distressed').methods.find(m => m.method === 'sde-multiple')?.status, 'n/a');
is('…and leads with the asset floor',
  specFor('distressed').methods.find(m => m.method === 'asset-floor')?.status, 'primary');
ok('…and says why the multiple is the dangerous one, not merely absent',
  /looks like a valuation and is not/.test(whyNot('distressed', 'ebitda-multiple') ?? ''));

/* OPCO/PROPCO. The error is one blended number. */
is('opco-propco leads with sum-of-the-parts',
  specFor('opco-propco').methods.find(m => m.method === 'sotp')?.status, 'primary');
ok('…and charges the OpCo a market rent before any multiple',
  /market rent/i.test(specFor('opco-propco').methods.find(m => m.method === 'ebitda-multiple')?.why ?? ''));
ok('…and treats the asset value as an answer, not a floor',
  specFor('opco-propco').methods.find(m => m.method === 'asset-floor')?.status === 'primary');

/* ESOP. The one where producing a number at all is the error. */
is('ESOP refers the appraisal rather than running one',
  specFor('esop').methods.find(m => m.method === 'appraisal')?.status, 'refer');
is('ESOP runs NO valuation method itself', methodsToRun('esop'), []);
ok('…and says it is standing, not arithmetic, that stops us',
  /no standing/.test(whyNot('esop', 'ebitda-multiple') ?? ''));
ok('…and every type that tests THE LINE says so',
  ['opco-propco', 'distressed', 'esop'].every(t => !!specFor(t as DealType).line));

/* ── the guards ───────────────────────────────────────────────────────── */

is('an earnings multiple applies to the ordinary case', earningsMultipleApplies('going-concern'), true);
is('…and not to distressed', earningsMultipleApplies('distressed'), false);
is('…and not to an ESOP', earningsMultipleApplies('esop'), false);

/* bandFor is the guard that matters, because `valuation()` on its own is
   perfectly happy to price a distressed business. Both halves asserted: the
   refusal, AND that the refusal carries the reason rather than a bare false. */
{
  const good = bandFor('going-concern', 800_000, 'L2');
  ok('bandFor allows the ordinary case', good.ok === true);
  const bad = bandFor('distressed', 800_000, 'L2');
  ok('bandFor refuses distressed', bad.ok === false);
  ok('…with the reason attached', bad.ok === false && bad.why.length > 20);

  /* WRONG-FIRST, kept: the first cut of bandFor returned a boolean. A caller
     that gets `false` has to invent its own message, and the message is the
     entire value of the table. */
  ok('the refusal is never a bare boolean', typeof (bad as any).why === 'string');
}

/* Calling deal.ts directly still works and still does NOT know about deal
   types — asserted so nobody "fixes" that by teaching the arithmetic about
   routing. The split is deliberate: deal.ts computes, valuation.ts decides. */
{
  const v = valuation(800_000, 'L2');
  ok('deal.ts still prices anything it is handed', v.mid > 0);
  ok('…and knows nothing about deal type',
    !Object.keys(v).some(k => /type/i.test(k)));
}

/* ── whyNot is the UI contract ────────────────────────────────────────── */

/* The Trainline cue: the row still appears, with the reason in place of the
   number, so a reader learns the option exists and why it is closed. That only
   works if whyNot returns null exactly when a number IS coming. */
for (const t of DEAL_TYPES) {
  const running = new Set(methodsToRun(t));
  const wrong = ALL_METHODS.filter(m => (whyNot(t, m) === null) !== running.has(m));
  is(`${t}: whyNot is null exactly for the methods that run`, wrong, []);
}

ok('an unknown method is reported, not silently null',
  typeof whyNot('going-concern', 'not-a-method' as Method) === 'string');

/* ── referrals ────────────────────────────────────────────────────────── */

ok('every type routes the appraisal to a licensed specialist',
  DEAL_TYPES.every(t => referrals(t).some(r => r.method === 'appraisal')));
ok('ESOP refers exactly one thing — the appraisal that IS the transaction',
  referrals('esop').length === 1);

/* ── add-on: the overpayment trap ─────────────────────────────────────── */

/* Not a THE LINE issue and not an arithmetic error — a judgement one, and the
   most common way an add-on gets overpaid for. Pinned because it lives only in
   prose and prose is what rots. */
ok('add-on leads with the synergy-adjusted view',
  specFor('add-on').methods.find(m => m.method === 'synergy-adjusted')?.status === 'primary');
ok('…while still establishing the standalone floor first',
  specFor('add-on').methods.find(m => m.method === 'ebitda-multiple')?.status === 'primary');
ok('…and warns whose synergies they are',
  specFor('add-on').mustEstablish.some(s => /belong to the buyer/.test(s)));

/* ── carve-out: the dis-synergy trap ──────────────────────────────────── */

ok('carve-out puts dis-synergies first, before any method',
  /DIS-SYNERGIES/.test(specFor('carve-out').mustEstablish[0]));
is('carve-out has no SDE, because it has no owner-operator',
  specFor('carve-out').methods.find(m => m.method === 'sde-multiple')?.status, 'n/a');

/* ── it stays in step with the league bands ───────────────────────────── */

ok('the league bands it routes to are the ones deal.ts holds',
  Object.keys(LEAGUE_MULTIPLES).length === 6 && !!LEAGUE_MULTIPLES.L1);

/* ── league derivation, in parity with the server ─────────────────────── */

/* The same contract house/deal.ts has with the canvas calculators: import BOTH
   and run them on the same inputs. A letter is easier to disagree about than a
   ratio and just as damaging — L3 and L4 are 4–6x and 6–8x, so one step is a
   third of the price. */
{
  const { classifyLeague } = await import('../../server/services/leagueClassifier.js');
  const CASES: Array<[number, 'SDE' | 'EBITDA']> = [
    [30_000_000, 'SDE'],        // $300K  → L1
    [50_000_000, 'SDE'],        // $500K  → L2
    [150_000_000, 'SDE'],       // $1.5M  → L2
    [250_000_000, 'EBITDA'],    // $2.5M  → L3
    [600_000_000, 'EBITDA'],    // $6M    → L4
    [1_200_000_000, 'EBITDA'],  // $12M   → L5
    [6_000_000_000, 'EBITDA'],  // $60M   → L6
    [80_000_000, 'EBITDA'],     // $800K EBITDA — below the L3 floor, falls to the SDE ladder
  ];
  for (const [cents, metric] of CASES) {
    const mine = leagueFor(cents, metric);
    const theirs = classifyLeague({
      journey: 'sell',
      [metric === 'EBITDA' ? 'ebitda' : 'sde']: cents,
    } as any);
    is(`league parity at ${metric} $${(cents / 100 / 1e6).toFixed(2)}M`,
      mine?.league, theirs?.league);
  }

  is('no earnings means no league, rather than a guess', leagueFor(null, 'SDE'), null);
  is('zero earnings is not L1 by accident', leagueFor(0, 'SDE'), null);

  /* WRONG-FIRST guard, kept: leagueFor takes CENTS. Passing dollars silently
     lands three leagues low — $6M passed as 6_000_000 reads as $60K. This is
     the same units mistake my first demo of this module made, and nothing
     about it throws. */
  ok('dollars-instead-of-cents lands in a different league, so the units matter',
    leagueFor(6_000_000, 'EBITDA')?.league !== leagueFor(600_000_000, 'EBITDA')?.league);
}

/* ── the earnings base ────────────────────────────────────────────────── */

is('EBITDA wins when both are present',
  earningsBase({ sde: 100, ebitda: 200 })?.metric, 'EBITDA');
is('…SDE when it is all there is', earningsBase({ sde: 100 })?.metric, 'SDE');
is('…and null when neither is recorded, rather than zero',
  earningsBase({ sde: null, ebitda: null }), null);

/* ── the UI renders the table; it does not re-decide ──────────────────── */

/* The architectural guard, and the one most likely to be broken by someone
   being helpful. A React component that hard-codes "distressed cannot use a
   multiple" is a SECOND copy of the routing — correct on the day, and exactly
   the drift this repo spent a week removing from the collateral builders.

   Checked by source, because there is no other way to assert a negative about
   a file's reasoning. Comments stripped: the panel legitimately EXPLAINS the
   distressed and ESOP cases in its header, and reading an explanation as the
   behaviour is a mistake this suite has now made four times. */
{
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const pathMod = await import('node:path');
  const root = pathMod.resolve(pathMod.dirname(fileURLToPath(import.meta.url)), '../..');
  const panel = readFileSync(
    pathMod.join(root, 'client/src/components/v6/desktop/screens/ValuationPanel.tsx'), 'utf8');
  const code = panel.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

  ok('the panel imports the routing rather than restating it',
    /house\/valuation/.test(code));
  ok('…and the arithmetic too', /house\/deal/.test(code));

  /* No deal type may appear in the component's LOGIC. The <option> list is
     generated from DEAL_TYPES, so a literal is a branch. `going-concern` is
     the one permitted literal: it is the fallback when a draft holds a value
     no longer in the taxonomy. */
  const named = ['distressed', 'esop', 'opco-propco', 'carve-out', 'minority-recap', 'platform', 'add-on']
    .filter(t => new RegExp(`['"\`]${t}['"\`]`).test(code));
  is('no deal type is hard-coded in the panel', named, []);

  ok('availability comes from whyNot(), not a local condition', /whyNot\(/.test(code));
  ok('the refusal comes from bandFor(), not a local condition', /bandFor\(/.test(code));
  ok('the method verdicts are read from the spec, not authored',
    /spec\.methods\.find/.test(code));
}

console.log(`\n${pass}/${total} correct`);
process.exit(pass === total ? 0 : 1);
