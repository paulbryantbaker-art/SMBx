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
  earningsMultipleApplies, bandFor, type DealType, type Method,
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

console.log(`\n${pass}/${total} correct`);
process.exit(pass === total ? 0 : 1);
