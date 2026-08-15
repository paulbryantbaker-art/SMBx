/**
 * Buy-side deal math — behaviour suite AND the parity gate.
 *
 * Run: npx tsx house/__tests__/deal.test.mts   (npm run test:deal)
 *
 * Why this file exists, and why it imports the app's own engine:
 *
 * `house/deal.ts` was ported out of `client/src/lib/calculations/core.ts` so a
 * local Cowork session and the app compute the same answer. A port is a
 * promise, and a promise nobody checks rots — `dealexplorer.html` promised
 * exactly this ("mirrors the workbench; re-sync at vendoring") and had no way
 * to notice when it stopped being true.
 *
 * So the first section below runs BOTH ENGINES on the same inputs and asserts
 * they agree. The day someone edits one and not the other, this goes red. That
 * is the whole point: two engines that disagree about what a deal is worth is
 * the worst failure available here, because both look authoritative and one of
 * them reaches a client.
 *
 * The remaining sections pin the behaviour that a client document depends on —
 * the thresholds, the range-not-point law, the honesty flags — including three
 * cases that exist because the naive expectation is wrong (marked WRONG-FIRST).
 */
import {
  sde, ebitda, valuation, blendedValuation, LEAGUE_MULTIPLES,
  monthlyPayment, amortize, dscr, dscrFull, sbaFinancing,
  irr, moic, lbo, sensitivityMatrix,
  fcf, fcfConversion, workingCapitalPeg, covenantCompliance,
  earnout, dcf, money, pct, mult, derivations,
  type AddBack, type LBOAssumptions,
} from '../deal.js';

import {
  calculateSDE, calculateEBITDA, calculateValuation, calculateBlendedValuation,
  calculateMonthlyPayment, calculateAmortization, calculateDSCR, calculateDSCRFull,
  calculateSBAFinancing, calculateIRR, calculateMOIC, calculateLBO,
  buildSensitivityMatrix, calculateFCF, calculateWorkingCapitalPeg,
  calculateCovenantCompliance, calculateEarnout, calculateDCF,
} from '../../client/src/lib/calculations/core.js';

let pass = 0, total = 0;
function is(name: string, got: unknown, want: unknown) {
  total++;
  const ok = JSON.stringify(got) === JSON.stringify(want);
  pass += ok ? 1 : 0;
  console.log(`${ok ? '  ok  ' : ' FAIL '}${name}`);
  if (!ok) console.log(`        got  ${JSON.stringify(got)}\n        want ${JSON.stringify(want)}`);
}
function ok(name: string, cond: boolean) { is(name, cond, true); }

/* A realistic lower-middle-market deal, in CENTS. $3.1M revenue, $400k EBITDA,
   $1.5M price, SBA-shaped capital stack. Same shape as the Deal Explorer's
   sample so the two can be compared by eye. */
const ADD_BACKS: AddBack[] = [
  { label: 'Owner health insurance', amount: 1_800_000, verified: true,  category: 'owner_comp' },
  { label: 'Personal vehicle',       amount:   900_000, verified: false, category: 'discretionary' },
  { label: 'One-time legal',         amount:   450_000, verified: true,  category: 'one_time' },
];

const DEAL: LBOAssumptions = {
  purchasePrice: 150_000_000,
  ebitda: 40_000_000,
  revenueGrowthRate: 0.05,
  ebitdaMargin: 0.129,
  exitMultiple: 4.0,
  holdPeriod: 5,
  seniorDebtPct: 0.70,
  seniorRate: 0.105,
  seniorTerm: 120,
  mezDebtPct: 0.10,
  mezRate: 0.14,
  mezTerm: 84,
  revenue: 310_000_000,
};

/* ═══ 1. PARITY — the two engines must agree ═══════════════════════════ */

is('sde matches the canvas',
  sde(20_000_000, 12_000_000, ADD_BACKS),
  calculateSDE(20_000_000, 12_000_000, ADD_BACKS));

is('ebitda matches the canvas (verified add-backs only)',
  ebitda(20_000_000, 6_000_000, 1_000_000, 3_000_000, 5_000_000, ADD_BACKS, 2_000_000),
  calculateEBITDA(20_000_000, 6_000_000, 1_000_000, 3_000_000, 5_000_000, ADD_BACKS, 2_000_000));

for (const league of Object.keys(LEAGUE_MULTIPLES)) {
  is(`valuation matches the canvas — ${league}`,
    valuation(40_000_000, league),
    calculateValuation(40_000_000, league));
}

is('blended valuation matches the canvas',
  blendedValuation([
    { label: 'Multiple of EBITDA', value: 160_000_000, weight: 2 },
    { label: 'DCF',                value: 142_000_000, weight: 1 },
  ]),
  calculateBlendedValuation([
    { label: 'Multiple of EBITDA', value: 160_000_000, weight: 2 },
    { label: 'DCF',                value: 142_000_000, weight: 1 },
  ]));

is('monthlyPayment matches the canvas',
  monthlyPayment(105_000_000, 0.105, 120),
  calculateMonthlyPayment(105_000_000, 0.105, 120));

is('…and at a zero rate, where the formula divides by zero',
  monthlyPayment(105_000_000, 0, 120),
  calculateMonthlyPayment(105_000_000, 0, 120));

is('the full amortization schedule matches, month for month',
  amortize(105_000_000, 0.105, 120),
  calculateAmortization(105_000_000, 0.105, 120));

is('dscr matches the canvas', dscr(40_000_000, 16_800_000), calculateDSCR(40_000_000, 16_800_000));

is('dscrFull matches the canvas',
  dscrFull(40_000_000, 105_000_000, 0.105, 120),
  calculateDSCRFull(40_000_000, 105_000_000, 0.105, 120));

is('sbaFinancing matches the canvas',
  sbaFinancing(150_000_000, 40_000_000, 0.10, 0.105, 120, 0.10, 5_000_000),
  calculateSBAFinancing(150_000_000, 40_000_000, 0.10, 0.105, 120, 0.10, 5_000_000));

const FLOWS = [-30_000_000, 8_000_000, 9_000_000, 10_000_000, 11_000_000, 62_000_000];
is('irr matches the canvas to the last iterate', irr(FLOWS).rate, calculateIRR(FLOWS));
is('moic matches the canvas', moic(95_000_000, 30_000_000), calculateMOIC(95_000_000, 30_000_000));

/* The LBO is the one most likely to drift, because it is the one with the
   deliberate shortcut in it. Compare the WHOLE result, pro forma included —
   `irrConverged` is the only field house/deal.ts adds. */
const mine = lbo(DEAL);
const theirs = calculateLBO(DEAL);
const { irrConverged, ...mineComparable } = mine;
is('lbo matches the canvas in full — every year of the pro forma', mineComparable, theirs);
ok('…and the linear-paydown shortcut is preserved, not quietly corrected',
  mine.proForma[0].debtBalance === theirs.proForma[0].debtBalance);

is('the sensitivity matrix matches the canvas',
  sensitivityMatrix(DEAL, 'revenueGrowthRate', [0.01, 0.05, 0.09], 'exitMultiple', [3, 4, 5], 'irr').matrix,
  buildSensitivityMatrix(DEAL, 'revenueGrowthRate', [0.01, 0.05, 0.09], 'exitMultiple', [3, 4, 5], 'irr').matrix);

is('fcf matches the canvas',
  fcf(40_000_000, 8_000_000, 3_100_000, 1_200_000),
  calculateFCF(40_000_000, 8_000_000, 3_100_000, 1_200_000));

const WC = [
  { month: '2026-01', currentAssets: 52_000_000, currentLiabilities: 31_000_000 },
  { month: '2026-02', currentAssets: 49_000_000, currentLiabilities: 33_000_000 },
  { month: '2026-03', currentAssets: 61_000_000, currentLiabilities: 30_000_000 },
];
is('the working-capital peg matches the canvas',
  workingCapitalPeg(WC), calculateWorkingCapitalPeg(WC));

const COV = { minDscr: 1.25, maxDebtToEbitda: 3.5, maxLtv: 0.80 };
is('covenant compliance matches the canvas — including the warning strings',
  covenantCompliance(40_000_000, 16_800_000, 120_000_000, 150_000_000, COV),
  calculateCovenantCompliance(40_000_000, 16_800_000, 120_000_000, 150_000_000, COV));

const MILES = [
  { label: 'Yr1 revenue > $3.4M', year: 1, metric: 'revenue', target: 340_000_000, payout: 10_000_000, probability: 0.7 },
  { label: 'Yr2 EBITDA > $500k',  year: 2, metric: 'ebitda',  target: 50_000_000,  payout: 15_000_000, probability: 0.45 },
];
is('earnout matches the canvas', earnout(MILES, 0.12), calculateEarnout(MILES, 0.12));

const PROJ = [22_000_000, 24_000_000, 26_500_000, 29_000_000, 31_500_000];
is('dcf matches the canvas', dcf(PROJ, 0.02, 0.22), calculateDCF(PROJ, 0.02, 0.22));

/* ═══ 2. THRESHOLDS — the numbers a lender actually gates on ═══════════ */

/* A $1.2M interest-free note over 12 months costs $1.2M a year to service, so
   coverage is just earnings ÷ 1.2M. Round numbers, no amortization to reason
   about — the thresholds are the subject here, not the payment formula. */
const SERVICE = 120_000_000;                       // $1.2M annual debt service
const at = (x: number) => dscrFull(Math.round(SERVICE * x), SERVICE, 0, 12);

is('DSCR 1.25 is SBA-eligible, exactly at the line',
  [at(1.25).eligible, Number(at(1.25).dscr.toFixed(2))], [true, 1.25]);
ok('DSCR just under 1.25 is not', !at(1.2499).eligible);
ok('DSCR 1.50 clears conventional', at(1.50).conventional);
ok('…and 1.49 does not', !at(1.49).conventional);

/* WRONG-FIRST. `rating` is RISK, so the polarity inverts: a HEALTHY 1.6x
   coverage rates 'LOW' and a dangerous 1.1x rates 'CRITICAL'. Reading it as a
   quality grade gets it exactly backwards, which is why it is pinned. */
is('a strong 1.60x coverage is rating LOW — low RISK, not low quality', at(1.60).rating, 'LOW');
is('a thin 1.10x coverage is CRITICAL', at(1.10).rating, 'CRITICAL');

ok('a $6M price is SBA-ineligible however good the coverage — the 7(a) cap binds',
  !sbaFinancing(600_000_000, 400_000_000, 0.10, 0.105, 120).eligible);

ok('zero debt service is infinite coverage, not a divide-by-zero',
  dscr(40_000_000, 0) === Infinity);

/* ═══ 3. HONESTY — what the engine refuses to assert ═══════════════════ */

/* WRONG-FIRST. Newton-Raphson does not always converge, and the canvas returns
   its last iterate with no signal. All-positive flows have no root at all: the
   rate returned is meaningless, and only the flag says so. */
const NO_ROOT = irr([10_000, 20_000, 30_000]);
ok('an all-positive stream has no IRR, and the flag says so', !NO_ROOT.converged);
ok('a normal stream converges', irr(FLOWS).converged);
ok('a converged rate is still byte-identical to the canvas', irr(FLOWS).rate === calculateIRR(FLOWS));

/* WRONG-FIRST. Gordon growth is undefined when g >= r. The naive expectation is
   a big number or a throw; it returns 0, and a caller printing "$0 terminal
   value" without noticing has a broken assumption, not a cheap business. */
is('terminal value is 0 when growth meets the discount rate — the formula is undefined',
  dcf([10_000_000], 0.10, 0.10).terminalValue, 0);
ok('and when growth exceeds it', dcf([10_000_000], 0.15, 0.10).terminalValue === 0);

is('valuation is always a RANGE — never a single point',
  Object.keys(valuation(40_000_000, 'L3')).filter(k => ['low', 'mid', 'high'].includes(k)).sort(),
  ['high', 'low', 'mid']);

ok('the peg reports variance, so a swingy series argues for a collar',
  workingCapitalPeg(WC).variance > 0);

is('covenant breaches are NAMED, not just counted',
  covenantCompliance(40_000_000, 40_000_000, 200_000_000, 150_000_000, COV).warnings.length, 3);

/* ═══ 4. CENTS DISCIPLINE — CLAUDE.md rule 10 ══════════════════════════ */

const intish = (n: number) => Number.isInteger(n);
ok('every amortization row is whole cents',
  amortize(105_000_000, 0.105, 120).every(r =>
    intish(r.payment) && intish(r.principal) && intish(r.interest) && intish(r.balance)));
ok('the pro forma carries whole cents',
  lbo(DEAL).proForma.every(y =>
    intish(y.revenue) && intish(y.ebitda) && intish(y.debtService) && intish(y.debtBalance)));
ok('valuation bounds are whole cents',
  [valuation(40_000_000, 'L3')].every(v => intish(v.low) && intish(v.mid) && intish(v.high)));
/* WRONG-FIRST, and worth knowing before a schedule goes to a lender. The
   naive expectation is that the balance lands on exactly zero. It does not:
   `Math.round(balance * r)` runs every month against a rounded payment, and
   the drift accumulates — a $1.05M loan at 10.5% over 120 months finishes
   with 96 CENTS outstanding, and a 60-month note finishes with 5.
   Financially nothing; presentationally not nothing, because "balance $0.96"
   at maturity reads as a broken model to whoever is underwriting it.
   Pinned rather than corrected: the residual is shared with the app's canvas,
   so removing it here alone would break parity. A renderer should snap a
   sub-dollar final balance to zero at DISPLAY time, and the tolerance below
   is what makes a regression that grows the drift show up as a failure. */
for (const [p, r, t] of [
  [105_000_000, 0.105, 120], [105_000_000, 0.08, 120], [50_000_000, 0.06, 60],
] as [number, number, number][]) {
  const rows = amortize(p, r, t);
  ok(`the schedule runs its full term — ${t}mo @ ${pct(r)}`, rows.length === t);
  ok(`…and closes within a dollar of zero (rounding drift, not an error)`,
    rows[rows.length - 1].balance >= 0 && rows[rows.length - 1].balance < 100);
}
ok('a zero-rate note retires exactly, having no interest to round',
  amortize(105_000_000, 0, 120).slice(-1)[0].balance === 0);

/* ═══ 5. THE BOUNDARY — what this engine must never grow ═══════════════ */

/* Tax is jurisdictional and out of lane under THE LINE: coordinate the
   specialist. If someone ports the FEDERAL_RATES / QSBS / §453 block across to
   make a CLI more convenient, this fails and asks them to reconsider. */
const dealModule = await import('../deal.js');
const TAX_NAMES = [
  'FEDERAL_RATES', 'QSBS_TIERED_EXCLUSION', 'QSBS_OBBBA_BREAKPOINT',
  'STATE_QSBS_DECOUPLED', 'SECTION_168K', 'SECTION_168N', 'SECTION_163J',
  'SECTION_174A', 'SALT_CAP', 'INTERNATIONAL_RATES', 'SECTION_453A',
  'calculateAssetSaleTax', 'calculateStockSaleTax', 'calculateInstallmentSale',
  'calculateGoodwillAmortization',
];
is('no tax surface leaked into the local engine — that is the CPA\'s lane',
  TAX_NAMES.filter(n => n in dealModule), []);

/* ═══ 6. DISPLAY + DERIVATIONS ═════════════════════════════════════════ */

is('money renders millions compactly', money(150_000_000), '$1.50M');
is('money renders sub-million in full', money(45_000_00), '$45,000');
is('negatives are parenthesised, the accounting convention', money(-150_000_000), '($1.50M)');
is('a non-finite figure is an em dash, never NaN in a document', money(Infinity), '—');
is('pct renders', pct(0.2237), '22.4%');
is('mult renders', mult(4.0), '4.00x');
is('an infinite multiple is an em dash', mult(Infinity), '—');

const D = derivations([
  { figure: 'Entry multiple 3.75x', from: 'purchase price $1.50M ÷ adj. EBITDA $400k.', assumption: 'EBITDA per the QoE dated 2026-07-02.' },
  { figure: 'Year-1 DSCR 2.38x',    from: 'EBITDA $400k ÷ annual debt service $168k.' },
]);
ok('derivations emits the heading house/audit.ts looks for', D.startsWith('## Derivations'));
ok('…names every figure', D.includes('Entry multiple 3.75x') && D.includes('Year-1 DSCR 2.38x'));
ok('…and surfaces the assumption where one was given', D.includes('Assumption: EBITDA per the QoE'));

console.log(`\n${pass}/${total} correct`);
process.exit(pass === total ? 0 : 1);
