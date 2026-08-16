/**
 * house/scenarios.ts — tests.
 *
 * The valuable assertions are the REFUSALS and the PRINTING RULES: every
 * missing input comes back named, and an IRR that never converged can never
 * reach a screen as a number. The arithmetic itself is `lbo()`'s, already
 * cross-checked against the canvas in deal.test.mts — here we assert the
 * scenarios drive it honestly, not that compound growth compounds.
 */
import {
  assemble, runScenarios, sensitivityGrid,
  irrLabel, irrDeltaLabel, moicLabel, minDscr,
  SCENARIOS, HOLD_YEARS_DEFAULT, GROWTH_STRESS, EXIT_STRESS, SCENARIO_ORDERING,
  type AssembleInputs,
} from '../scenarios.js';
import { lbo } from '../deal.js';
import type { LboRateMapping } from '../capital.js';
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
  ok(name, Object.is(actual, expected) || JSON.stringify(actual) === JSON.stringify(expected),
    `got ${JSON.stringify(actual)}, want ${JSON.stringify(expected)}`);
}

/* ── fixtures ───────────────────────────────────────────────────────── */

/** The capital.test.mts deal: $840K at 6x $140K EBITDA, 70/10/20. */
const RATES: LboRateMapping = {
  seniorDebtPct: 0.70, seniorRate: 0.0975, seniorTerm: 120,
  mezDebtPct: 0.10, mezRate: 0.06, mezTerm: 60,
  unmapped: [], notes: [],
};

const FULL: AssembleInputs = {
  purchasePriceCents: 840_000_00,
  ebitdaCents: 140_000_00,
  revenueCents: 700_000_00,
  growthPct: 0.03,
  rates: RATES,
};

/* ── assembly refusals — each absence NAMED ─────────────────────────── */

{
  const r = assemble({ ...FULL, purchasePriceCents: null });
  ok('no price refuses', !r.ok);
  ok('no price named', !r.ok && r.missing.some(m => m.includes('purchase price')));
}
{
  const r = assemble({ ...FULL, ebitdaCents: null });
  ok('no ebitda refuses', !r.ok && r.missing.some(m => m.includes('EBITDA')));
}
{
  const r = assemble({ ...FULL, revenueCents: null });
  ok('no revenue refuses', !r.ok);
  ok('no revenue names the margin stake', !r.ok && r.missing.some(m => m.includes('margin')),
    'the refusal must say WHY revenue matters — the invented-margin fallback');
}
{
  const r = assemble({ ...FULL, growthPct: null });
  ok('no growth plan refuses', !r.ok && r.missing.some(m => m.includes('growth')));
  const r0 = assemble({ ...FULL, growthPct: 0 });
  ok('zero growth is a REAL plan, not a missing one', r0.ok,
    'flat must be typable — 0 is a position, null is an absence');
}
{
  const r = assemble({ ...FULL, rates: null });
  ok('no stack refuses', !r.ok);
  ok('no stack points at Capital stack', !r.ok && r.missing.some(m => m.includes('Capital stack')));
}
{
  /* WHY-THIS-EXISTS: EBITDA above revenue is a data error that would project a
     >100% margin forever. It must refuse, not model. */
  const r = assemble({ ...FULL, ebitdaCents: 800_000_00, revenueCents: 700_000_00 });
  ok('EBITDA > revenue refuses', !r.ok && r.missing.some(m => m.includes('exceeds revenue')));
}
{
  const r = assemble({ ...FULL, purchasePriceCents: null, ebitdaCents: null, rates: null });
  ok('multiple absences all named', !r.ok && r.missing.length >= 3);
}

/* ── assembly derivations ───────────────────────────────────────────── */

const asm = assemble(FULL);
ok('full inputs assemble', asm.ok);
if (asm.ok) {
  const a = asm.base.assumptions;
  eq('margin derived', a.ebitdaMargin, 140_000_00 / 700_000_00);
  eq('exit defaults to entry', a.exitMultiple, 840_000_00 / 140_000_00);
  eq('hold defaults to house convention', a.holdPeriod, HOLD_YEARS_DEFAULT);
  eq('rates pass through', [a.seniorDebtPct, a.seniorRate, a.mezDebtPct], [0.70, 0.0975, 0.10]);
  eq('revenue passes through (no ebitda*5 fallback path)', a.revenue, 700_000_00);
  ok('basis states exit-at-entry', asm.base.basis.some(b => b.includes('no multiple expansion')));
  ok('basis states margin derivation', asm.base.basis.some(b => b.includes('derived')));
  ok('basis credits the client stack', asm.base.basis.some(b => b.includes("client's stack")));
}
{
  const r = assemble({ ...FULL, exitMultiple: 7.5, holdYears: 7 });
  ok('overrides honoured', r.ok && r.base.assumptions.exitMultiple === 7.5 && r.base.assumptions.holdPeriod === 7);
  ok('override basis says so', r.ok && r.base.basis.some(b => b.includes('your override')));
}

/* ── the scenario set ───────────────────────────────────────────────── */

eq('three scenarios, conservative first', SCENARIOS.map(s => s.id), ['conservative', 'base', 'stretch']);
eq('symmetric growth stress', [SCENARIOS[0].growthDelta, SCENARIOS[2].growthDelta], [-GROWTH_STRESS, GROWTH_STRESS]);
eq('symmetric exit stress', [SCENARIOS[0].exitDelta, SCENARIOS[2].exitDelta], [-EXIT_STRESS, EXIT_STRESS]);

if (asm.ok) {
  const runs = runScenarios(asm.base.assumptions);
  eq('three runs', runs.length, 3);
  const [cons, base, stretch] = runs;

  ok('base run IS lbo() untouched', JSON.stringify(base.result) === JSON.stringify(lbo(asm.base.assumptions)),
    'the base scenario must be the plan, not a copy with drift');
  ok('conservative stressed down', cons.result !== null
    && cons.assumptions.revenueGrowthRate < asm.base.assumptions.revenueGrowthRate
    && cons.assumptions.exitMultiple < asm.base.assumptions.exitMultiple);
  ok('stretch stressed up', stretch.result !== null
    && stretch.assumptions.exitMultiple === asm.base.assumptions.exitMultiple + EXIT_STRESS);
  ok('ordering holds: conservative ≤ base ≤ stretch on MOIC',
    cons.result!.moic <= base.result!.moic && base.result!.moic <= stretch.result!.moic);
  ok('everything else held constant', cons.assumptions.ebitdaMargin === asm.base.assumptions.ebitdaMargin
    && cons.assumptions.seniorRate === asm.base.assumptions.seniorRate
    && cons.assumptions.holdPeriod === asm.base.assumptions.holdPeriod);
}

/* WHY-THIS-EXISTS: a deal priced under 1x earnings takes the −1.0x stress to a
   non-positive exit multiple. That scenario must BLOCK with a reason, not run
   arithmetic on an impossibility. */
{
  const cheap = assemble({ ...FULL, purchasePriceCents: 112_000_00 }); // 0.8x entry
  ok('sub-1x deal assembles', cheap.ok);
  if (cheap.ok) {
    const runs = runScenarios(cheap.base.assumptions);
    ok('conservative blocked on sub-1x entry', runs[0].result === null && runs[0].blocked !== null);
    ok('blocked reason names the convention', (runs[0].blocked ?? '').includes('stress'));
    ok('base still runs', runs[1].result !== null);
  }
}

/* ── printing rules ─────────────────────────────────────────────────── */

{
  const fake = (irr: number, converged: boolean) =>
    ({ ...lbo((asm as { ok: true; base: { assumptions: Parameters<typeof lbo>[0] } }).base.assumptions), irr, irrConverged: converged });
  eq('irrLabel prints a converged rate', irrLabel(fake(0.234, true)), '23.4%');
  eq('irrLabel refuses unconverged', irrLabel(fake(0.234, false)), null);
  eq('irrLabel refuses null', irrLabel(null), null);
  eq('delta positive', irrDeltaLabel(fake(0.20, true), fake(0.234, true)), '+340bp');
  eq('delta negative uses a real minus', irrDeltaLabel(fake(0.20, true), fake(0.188, true)), '−120bp');
  eq('delta zero says no change', irrDeltaLabel(fake(0.20, true), fake(0.20, true)), 'no change');
  eq('delta refuses when base unconverged', irrDeltaLabel(fake(0.20, false), fake(0.234, true)), null);
  eq('delta refuses when run unconverged', irrDeltaLabel(fake(0.20, true), fake(0.234, false)), null);
  eq('moicLabel', moicLabel(fake(0.2, true)) !== null, true);
  eq('moicLabel refuses null', moicLabel(null), null);
  eq('minDscr null on null', minDscr(null), null);
}

/* ── the sensitivity grid ───────────────────────────────────────────── */

if (asm.ok) {
  const g = sensitivityGrid(asm.base.assumptions);
  eq('5 growth rows', g.rows.length, 5);
  eq('5 exit cols on a 6x deal', g.cols.length, 5);
  eq('base cell indexed', [g.baseRow, g.baseCol], [2, 2]);
  ok('base cell matches the base run',
    g.cells[g.baseRow][g.baseCol].irr === lbo(asm.base.assumptions).irr);
  ok('rows ascend', g.rows.every((v, i) => i === 0 || v > g.rows[i - 1]));
  ok('cols ascend', g.cols.every((v, i) => i === 0 || v > g.cols[i - 1]));
  ok('cells carry convergence', g.cells.every(row => row.every(c => typeof c.converged === 'boolean')));
  eq('nothing dropped on a 6x deal', g.dropped, null);

  /* Low-multiple columns are dropped, and the drop is SAID. */
  const cheap = sensitivityGrid({ ...asm.base.assumptions, exitMultiple: 0.8 });
  ok('impossible cols dropped', cheap.cols.length < 5 && cheap.cols.every(c => c > 0));
  ok('drop is announced', (cheap.dropped ?? '').includes('dropped'));
  ok('base col still found after drop', cheap.cols[cheap.baseCol] === 0.8);
}

ok('ordering footer states both axes and the refusal rule',
  SCENARIO_ORDERING.includes('growth') && SCENARIO_ORDERING.includes('exit multiple')
  && SCENARIO_ORDERING.includes('converge'));

/* ── purity ─────────────────────────────────────────────────────────── */

{
  const src = readFileSync(join(HERE, '..', 'scenarios.ts'), 'utf8');
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  for (const banned of ['Date.now', 'new Date', 'Math.random', 'process.env', 'require(', 'fetch(', "from 'node:"]) {
    ok(`pure: no ${banned}`, !code.includes(banned));
  }
  ok('imports only house modules', /from '\.\/deal\.js'/.test(code) && /from '\.\/capital\.js'/.test(code));
}

/* ── report ─────────────────────────────────────────────────────────── */

if (fails.length) {
  console.error(`scenarios: ${fails.length} FAILED, ${pass} passed`);
  for (const f of fails) console.error(`  ✕ ${f}`);
  process.exit(1);
}
console.log(`scenarios: all ${pass} cases passed`);
