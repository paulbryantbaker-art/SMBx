/**
 * Lender projections — behaviour suite.
 *
 * Run: npx tsx house/__tests__/projections.test.mts   (npm run test:projections)
 *
 * What is pinned here and why:
 *  - THE REFUSAL: missing/invalid drivers name themselves; nothing defaults.
 *  - THE TIE: month-12 cash === year-1 cash for ANY seasonality — the identity
 *    a hand-built spreadsheet silently breaks. Two cases: flat and heavily
 *    seasonal (marked WHY-THIS-EXISTS: the first cut used month-over-month
 *    ΔWC and the tie held only when weights were flat).
 *  - OPERATING LEVERAGE: the bear-floor discipline is structural — a revenue
 *    drop takes earnings down MORE than proportionally, and a margin-haircut
 *    model cannot say so.
 *  - REAL AMORTIZATION: year-1 debt service equals the amortize() schedule
 *    exactly, and the closing loan balance is the schedule's, never linear.
 *  - SELLER-NOTE STANDBY: no payments through standby, balance flat, payments
 *    begin the month after — the SBA equity-injection shape.
 *  - TWO COVERAGE BASES: dscrCash <= dscrEbitda whenever capex + ΔWC ≥ 0, and
 *    strictly less in a growth year — growth eats cash.
 *  - CHECKS: floor breach years, first negative-cash month, no-boundary flag
 *    on the sensitivity breakpoints helper.
 */
import { lenderProjections, type ProjectionDrivers } from '../projections.js';
import { amortize, monthlyPayment, sensitivityMatrix, sensitivityBreakpoints, sbaFinancing, type LBOAssumptions } from '../deal.js';
import { calculateSBAFinancing } from '../../client/src/lib/calculations/core.js';

let pass = 0, total = 0;
function is(name: string, got: unknown, want: unknown) {
  total++;
  const ok = JSON.stringify(got) === JSON.stringify(want);
  pass += ok ? 1 : 0;
  console.log(`${ok ? '  ok  ' : ' FAIL '}${name}`);
  if (!ok) console.log(`        got  ${JSON.stringify(got)}\n        want ${JSON.stringify(want)}`);
}
function ok(name: string, cond: boolean) { is(name, cond, true); }

/* A $1.5M HVAC deal, SBA-shaped. Cents. */
const BASE: ProjectionDrivers = {
  year1RevenueCents: 400_000_000,      // $4.0M
  contributionMargin: 0.38,
  fixedCostsAnnualCents: 100_000_000,  // $1.0M → EBITDA $520k
  revenueGrowthRate: 0.05,
  maintenanceCapexAnnualCents: 8_000_000,
  wcPctOfRevenue: 0.10,
  loanAmountCents: 120_000_000,        // $1.2M
  annualRate: 0.105,
  termMonths: 120,
  openingCashCents: 15_000_000,
  baselineMonthlyRevenueCents: Math.round(400_000_000 / 12),
};

console.log('\n── The refusal ──');
{
  const r = lenderProjections({ ...BASE, contributionMargin: null, loanAmountCents: null });
  ok('missing drivers refuse rather than default', r.ok === false);
  if (!r.ok) {
    is('every missing driver is named', r.missing, ['contributionMargin', 'loanAmountCents']);
  }
  const bad = lenderProjections({ ...BASE, contributionMargin: 1.4 });
  ok('an out-of-range driver refuses with the reason', !bad.ok && bad.missing[0].startsWith('contributionMargin ('));
  const noteNoTerms = lenderProjections({ ...BASE, sellerNoteCents: 15_000_000 });
  ok('a seller note amount without terms is a refusal, not a default', !noteNoTerms.ok && noteNoTerms.missing.includes('sellerNoteRate') && noteNoTerms.missing.includes('sellerNoteTermMonths'));
  const badWeights = lenderProjections({ ...BASE, monthlyRevenueWeights: [0.5, 0.5] });
  ok('twelve weights summing to 1 are required when supplied', !badWeights.ok && badWeights.missing[0].startsWith('monthlyRevenueWeights'));
}

console.log('\n── The tie: monthly and annual rolls land on the same year-1 cash ──');
{
  const flat = lenderProjections(BASE);
  ok('flat seasonality builds', flat.ok);
  if (flat.ok) {
    ok('flat: month-12 cash ties to year-1 cash', flat.checks.monthlyAnnualTie);
    ok('flat: the two figures agree within rounding', Math.abs(flat.monthly[11].closingCash - flat.annual[0].closingCash) <= 36);
    ok('12 monthly rows, 5 annual rows', flat.monthly.length === 12 && flat.annual.length === 5);
  }
  // WHY-THIS-EXISTS: heavy HVAC seasonality — summer-loaded. The first cut
  // computed ΔWC month-over-month, whose twelve deltas telescope to
  // rev_12 − baseline, NOT annualRev − 12×baseline, so the tie broke on any
  // non-flat weights. TTM-basis ΔWC fixes it for every weight vector.
  const w = [0.05, 0.05, 0.06, 0.08, 0.10, 0.13, 0.14, 0.13, 0.10, 0.07, 0.05, 0.04];
  const seasonal = lenderProjections({ ...BASE, monthlyRevenueWeights: w });
  ok('seasonal weights build', seasonal.ok);
  if (seasonal.ok) {
    ok('WHY-THIS-EXISTS seasonal: month-12 cash still ties to year-1 cash', seasonal.checks.monthlyAnnualTie);
    const mSum = seasonal.monthly.reduce((a, r) => a + r.wcChange, 0);
    ok('seasonal: twelve monthly ΔWC sum to the annual ΔWC (within rounding)', Math.abs(mSum - seasonal.annual[0].wcChange) <= 12);
    ok('seasonal: revenue is not flat', seasonal.monthly[6].revenue > seasonal.monthly[0].revenue * 2);
    ok('a note says seasonality was supplied is absent from notes', !seasonal.notes.some(n => n.startsWith('Seasonality: FLAT')));
  }
  if (flat.ok) ok('flat run carries the FLAT seasonality warning', flat.notes.some(n => n.startsWith('Seasonality: FLAT')));
}

console.log('\n── Operating leverage — the bear floor is structural ──');
{
  const base = lenderProjections(BASE);
  const bear = lenderProjections({ ...BASE, year1RevenueCents: Math.round(400_000_000 * 0.8) });
  ok('both build', base.ok && bear.ok);
  if (base.ok && bear.ok) {
    const e0 = base.annual[0].ebitda, e1 = bear.annual[0].ebitda;
    const drop = 1 - e1 / e0;
    ok('a 20% revenue drop takes EBITDA down MORE than 20%', drop > 0.20);
    // $4.0M×0.38−$1.0M = $520k; $3.2M×0.38−$1.0M = $216k → 58% drop.
    ok('…here 58%, because the fixed base does not move', Math.abs(drop - (1 - 21_600_000 / 52_000_000)) < 0.001);
    ok('the bear year-1 breaches the 1.25 floor', bear.checks.dscrFloorBreachYears.includes(1));
    ok('the base year-1 clears it', !base.checks.dscrFloorBreachYears.includes(1));
  }
  // Leverage runs both ways: on a fixed base, growth compounds EBITDA faster
  // than revenue. A deal breaching year 1 can clear by year 4 on 5% growth.
  const climb = lenderProjections({ ...BASE, openingCashCents: 0, fixedCostsAnnualCents: 145_000_000 });
  if (climb.ok) {
    ok('upward leverage: year-1 breach, cleared by year 4 on 5% growth', climb.checks.dscrFloorBreachYears.includes(1) && !climb.checks.dscrFloorBreachYears.includes(4));
    ok('…because EBITDA more than quintuples while revenue rises 22%', climb.annual[4].ebitda > climb.annual[0].ebitda * 5);
  }
}

console.log('\n── Real amortization, never linear ──');
{
  const r = lenderProjections(BASE);
  if (r.ok) {
    const sched = amortize(120_000_000, 0.105, 120);
    const y1ds = Math.round(sched.slice(0, 12).reduce((a, m) => a + m.payment, 0));
    ok('year-1 debt service equals the amortize() schedule', r.annual[0].debtService === y1ds);
    ok('year-1 closing loan balance is the schedule\'s month-12 balance', r.annual[0].closingLoanBalance === sched[11].balance);
    const linear = 120_000_000 - 120_000_000 / 10;
    ok('…and NOT the linear-paydown figure lbo() carries for parity', r.annual[0].closingLoanBalance !== linear && r.annual[0].closingLoanBalance > linear);
    // WRONG-FIRST: the naive expectation is "halfway through a 10-year loan,
    // half is paid." A 10.5% amortizing loan pays mostly INTEREST early — at
    // month 60 the balance is still ~63% of principal. That is the truth the
    // linear paydown hides, and it is exactly the schedule's own figure.
    ok('WRONG-FIRST year-5 balance is amortize()\'s month-60 balance (~63% of principal, not half)', r.annual[4].closingLoanBalance === sched[59].balance && r.annual[4].closingLoanBalance > 60_000_000);
  }
}

console.log('\n── Seller note on full standby ──');
{
  const r = lenderProjections({ ...BASE, sellerNoteCents: 15_000_000, sellerNoteRate: 0.06, sellerNoteTermMonths: 60, sellerNoteStandbyMonths: 24 });
  ok('builds', r.ok);
  if (r.ok) {
    const sbaOnly = lenderProjections(BASE);
    if (sbaOnly.ok) {
      ok('year-1 debt service is SBA only during standby', r.annual[0].debtService === sbaOnly.annual[0].debtService);
      ok('year-2 debt service is SBA only during standby', r.annual[1].debtService === sbaOnly.annual[1].debtService);
      ok('year-3 debt service is higher — the note starts paying', r.annual[2].debtService > sbaOnly.annual[2].debtService);
    }
    ok('note balance is flat through standby', r.annual[0].closingSellerNoteBalance === 15_000_000 && r.annual[1].closingSellerNoteBalance === 15_000_000);
    ok('note balance falls once amortizing', r.annual[2].closingSellerNoteBalance < 15_000_000);
    const notePmt = monthlyPayment(15_000_000, 0.06, 60);
    ok('year-3 debt service = SBA + 12 note payments', Math.abs(r.annual[2].debtService - (sbaOnly.ok ? sbaOnly.annual[2].debtService : 0) - Math.round(notePmt * 12)) <= 12);
    ok('the standby note carries its own caveat', r.notes.some(n => n.includes('standby')));
  }
}

console.log('\n── Two coverage bases ──');
{
  const r = lenderProjections(BASE);
  if (r.ok) {
    ok('dscrCash ≤ dscrEbitda every year (capex + ΔWC ≥ 0)', r.annual.every(y => y.dscrCash <= y.dscrEbitda));
    ok('in a growth year dscrCash is STRICTLY lower — growth eats cash', r.annual.slice(1).every(y => y.dscrCash < y.dscrEbitda));
    const y1 = r.annual[0];
    is('year-1 EBITDA is revenue × CM − fixed', y1.ebitda, 52_000_000);
    ok('year-1 dscrEbitda is EBITDA ÷ debt service', Math.abs(y1.dscrEbitda - y1.ebitda / y1.debtService) < 1e-9);
  }
}

console.log('\n── Checks ──');
{
  // Growth held FLAT here on purpose: at 5% growth this deal climbs out of
  // the breach by year 4 (fixed base + rising revenue = leverage upward,
  // $70k → $398k EBITDA), which is correct and is the point of the module —
  // but this check wants a deal that never recovers.
  const tight = lenderProjections({ ...BASE, openingCashCents: 0, fixedCostsAnnualCents: 145_000_000, revenueGrowthRate: 0 }); // EBITDA $70k, cannot carry the loan
  ok('builds', tight.ok);
  if (tight.ok) {
    ok('firstNegativeCashMonth is named when cash goes negative', tight.checks.firstNegativeCashMonth === 1);
    ok('minMonthlyCash is the lowest closing cash', tight.checks.minMonthlyCash.cash === Math.min(...tight.monthly.map(m => m.closingCash)));
    ok('every year breaches the floor', tight.checks.dscrFloorBreachYears.length === 5);
  }
  const fine = lenderProjections(BASE);
  if (fine.ok) ok('healthy deal: no negative-cash month', fine.checks.firstNegativeCashMonth === null);
}

console.log('\n── Sensitivity breakpoints (house/deal.ts) ──');
{
  const lboBase: LBOAssumptions = {
    purchasePrice: 150_000_000, ebitda: 40_000_000, revenue: 400_000_000,
    seniorDebt: 100_000_000, seniorRate: 0.105, seniorTermMonths: 120,
    mezDebt: 0, mezRate: 0, sellerNote: 15_000_000, sellerNoteRate: 0.06,
    equity: 35_000_000, revenueGrowthRate: 0.05, ebitdaMargin: 0.10,
    exitMultiple: 4.0, holdYears: 5, taxRate: 0.25, capexPct: 0.02, nwcPct: 0.10,
  } as unknown as LBOAssumptions;
  const grid = sensitivityMatrix(lboBase, 'revenueGrowthRate', [-0.10, 0.0, 0.05, 0.10], 'exitMultiple', [2.5, 3.5, 4.5], 'dscr');
  const bp = sensitivityBreakpoints(grid, 1.25);
  is('breakpoint carries the metric and threshold', [bp.metric, bp.threshold], ['dscr', 1.25]);
  ok('failing count matches a manual scan', bp.failingCount === grid.matrix.flat().filter(v => v < 1.25).length);
  ok('totalCells is rows × cols', bp.totalCells === 12);
  ok('each failing cell reports its driver values', bp.failing.every(f => f.var1 === grid.var1Values[f.row] && f.var2 === grid.var2Values[f.col]));
  const allPass = sensitivityBreakpoints(grid, -1);
  ok('a grid where every cell passes is flagged noBoundary', allPass.noBoundary && allPass.failingCount === 0);
  const allFail = sensitivityBreakpoints(grid, 1e9);
  ok('a grid where every cell fails is flagged noBoundary', allFail.noBoundary && allFail.failingCount === 12);
}

console.log('\n── sbaFinancing transactionFees — parity + behaviour ──');
{
  const h = sbaFinancing(150_000_000, 40_000_000, 0.10, 0.105, 120, 0.10, 5_000_000, 6_000_000);
  const c = calculateSBAFinancing(150_000_000, 40_000_000, 0.10, 0.105, 120, 0.10, 5_000_000, 6_000_000);
  is('house and canvas agree with fees supplied', h, c);
  const noFee = sbaFinancing(150_000_000, 40_000_000, 0.10, 0.105, 120, 0.10, 5_000_000);
  is('omitting fees is byte-identical to the pre-change behaviour', noFee, sbaFinancing(150_000_000, 40_000_000, 0.10, 0.105, 120, 0.10, 5_000_000, 0));
  ok('fees raise total project cost by exactly the fee', h.totalProjectCost - noFee.totalProjectCost === 6_000_000);
  ok('fees raise the loan (net of the larger down payment) and therefore debt service', h.loanAmount > noFee.loanAmount && h.annualDebtService > noFee.annualDebtService);
  ok('…and lower DSCR — the understatement the S&U check exists to catch', h.dscr < noFee.dscr);
  ok('the equity injection is checked against total project cost INCLUDING fees', h.downPayment === Math.round((150_000_000 + 5_000_000 + 6_000_000) * 0.10));
}

console.log(`\n${pass}/${total} passed`);
if (pass !== total) process.exit(1);
