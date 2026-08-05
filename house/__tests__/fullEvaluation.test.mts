/** Tests for house/fullEvaluation.ts — run with `npm run test:fulleval`. */
import {
  SECTIONS, ALL_QUESTIONS, computeFullEvaluation,
  answeredCount, parkedList, questionState, sectionStatus,
  TRANSACTION_COSTS_PCT, ESCROW_PCT,
  narrowBand, bandBasisFor, READINESS_THRESHOLD_SOURCE,
  mapDraftAnswers,
  type EvalAnswers, type EvalAnswer, type NarrowBandModels,
} from '../fullEvaluation';
import { DISCLAIMER, type EvaluationResult } from '../evaluate';

let pass = 0, fail = 0;
function ok(cond: boolean, name: string) {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`FAIL  ${name}`); }
}

const A = (value: number | string): EvalAnswer => ({ state: 'answered', value });

/** A complete commercial-MEP profile (tuned like the Acme sample: the bridge
 *  must sum, the readiness must score upper third under the live engine). */
function fullAnswers(): EvalAnswers {
  return {
    companyName: A('Test Mechanical Group'), yearFounded: A(2004), employees: A(178),
    statesServed: A(22), timeline: A('ready-12mo'),
    ttmRevenueUsd: A(35_200_000), serviceRevenueUsd: A(13_376_000), projectRevenueUsd: A(21_824_000),
    otherRevenueUsd: A(0), serviceGmPct: A(34), projectGmPct: A(20),
    pretaxIncomeUsd: A(2_120_000), interestUsd: A(410_000), daUsd: A(1_290_000),
    ownerCompUsd: A(750_000), addBackOneTimeUsd: A(352_000), addBackPersonalUsd: A(88_000),
    addBackFamilyUsd: A(165_000),
    fy1RevenueUsd: A(32_000_000), fy1EbitdaUsd: A(4_000_000), fy1ServiceMixPct: A(35),
    fy2RevenueUsd: A(28_000_000), fy2EbitdaUsd: A(3_400_000), fy2ServiceMixPct: A(33),
    arUsd: A(5_800_000), wipOverUnderUsd: A(1_100_000), fundedDebtUsd: A(3_200_000),
    cashUsd: A(1_400_000), workingCapitalUsd: A(4_100_000),
    backlogUsd: A(28_400_000), backlogContractedPct: A(80),
    suretySingleUsd: A(15_000_000), suretyAggregateUsd: A(40_000_000),
    recurringPct: A(38), topCustomerPct: A(14), ownerDependence: A('manager-in-place'),
    managersStay: A('yes'), booksQuality: A('reviewed'), newConstructionPct: A(62),
    realEstate: A('owned'), reHolder: A('related-entity'),
    rentPaidUsd: A(180_000), marketRentUsd: A(340_000),
    targetServiceMixPct: A(45),
    // growthPct deliberately open — the default-below-achieved path.
  };
}
const LANE = 'commercial-mechanical';

// ── the question set is well-formed ───────────────────────────────────────
{
  ok(SECTIONS.length === 9, 'nine sections');
  ok(ALL_QUESTIONS.length === 45, `45 questions (got ${ALL_QUESTIONS.length})`);
  const keys = ALL_QUESTIONS.map(q => q.key);
  ok(new Set(keys).size === keys.length, 'question keys are unique');
  ok(ALL_QUESTIONS.every(q => q.ask.length >= 10), 'every question has a real ask');
  ok(ALL_QUESTIONS.every(q => q.whereToFind.length >= 10), 'every question has an honest whereToFind hint');
  ok(ALL_QUESTIONS.every(q => q.feeds.length > 0), 'every question names what it feeds');
  ok(ALL_QUESTIONS.every(q => ['money', 'pct', 'int', 'text', 'choice'].includes(q.kind)), 'kinds are typed');
  ok(ALL_QUESTIONS.filter(q => q.kind === 'choice').every(q => (q.choices?.length ?? 0) >= 2),
    'every choice question carries its choices');
  ok(SECTIONS.every(s => s.intro.length > 20 && s.title.length > 3), 'every section has a title + intro');
}

// ── the ledger: answered / skipped / parked / open ────────────────────────
{
  const a = fullAnswers();
  const c = answeredCount(a);
  ok(c.answered === 44 && c.open === 1 && c.skipped === 0 && c.parked === 0 && c.total === 45,
    `full profile counts 44 answered / 1 open (got ${JSON.stringify(c)})`);
  a.arUsd = { state: 'parked', note: 'need the AR aging from the bookkeeper' };
  a.statesServed = { state: 'skipped', note: 'not sure it matters' };
  const c2 = answeredCount(a);
  ok(c2.answered === 42 && c2.parked === 1 && c2.skipped === 1 && c2.open === 1, 'park + skip move the counts');
  const p = parkedList(a);
  ok(p.length === 1 && p[0].key === 'arUsd', 'parkedList carries the parked question');
  ok(/aging/i.test(p[0].whereToFind), 'parked item carries the go-get hint');
  ok(p[0].sectionKey === 'balance-sheet' && p[0].note === 'need the AR aging from the bookkeeper',
    'parked item carries section + the owner\'s own note');
  ok(questionState(a, 'arUsd') === 'parked' && questionState(a, 'growthPct') === 'open'
    && questionState(a, 'companyName') === 'answered', 'questionState reads all three states + open');
}

// ── the quick leg reuses evaluate(): bridge + band, basis exact ───────────
{
  const r = computeFullEvaluation(fullAnswers(), LANE);
  ok(r.quick !== null && r.quick.laneSupported, 'complete answers → the band leg runs');
  if (r.quick?.laneSupported) {
    ok(r.quick.basisType === 'Adjusted EBITDA', '$35.2M revenue → EBITDA basis');
    ok(r.quick.basisUsd === 4_265_000, `basis = EBITDA + add-backs − rent restatement (got ${r.quick.basisUsd})`);
    ok(r.quick.readiness.position === 'upper third', 'sample-tuned profile scores upper third');
    ok(r.quick.rangeUsd.marketLow === 34_120_000 && r.quick.rangeUsd.marketHigh === 46_915_000,
      'range = basis × published band endpoints');
    ok(!!r.quick.realEstateNote && /separate asset/i.test(r.quick.realEstateNote),
      'owned RE carries the separate-asset note through');
  }
}

// ── the full bridge: interest/D&A split, subtotal, exact sum ──────────────
{
  const r = computeFullEvaluation(fullAnswers(), LANE);
  ok(r.bridge !== null, 'bridge renders when normalization is complete');
  if (r.bridge) {
    const sub = r.bridge.find(l => l.kind === 'subtotal');
    const tot = r.bridge.find(l => l.kind === 'total');
    ok(sub?.amountUsd === 3_820_000, 'EBITDA subtotal = pre-tax + interest + D&A');
    ok(tot?.amountUsd === 4_265_000, 'total = the engine\'s own basis');
    const walkSum = r.bridge.filter(l => l.kind === 'start' || l.kind === 'line')
      .reduce((s, l) => s + l.amountUsd, 0);
    ok(walkSum === tot?.amountUsd, 'bridge lines sum exactly to the total (no orphaned dollars)');
    ok(r.bridge.some(l => /interest/i.test(l.label)) && r.bridge.some(l => /depreciation/i.test(l.label)),
      'interest and D&A print as their own lines');
    ok(r.bridge.some(l => /market rent/i.test(l.label) && l.amountUsd === -160_000),
      'the rent restatement carries into the full bridge');
    ok(!!sub?.note && /% of revenue/.test(sub.note), 'subtotal carries its margin note');
  }
}

// ── SDE tier: sub-$3M folds owner comp back in, via the same engine ───────
{
  const a = fullAnswers();
  a.ttmRevenueUsd = A(2_400_000); a.serviceRevenueUsd = A(800_000); a.projectRevenueUsd = A(1_600_000);
  a.pretaxIncomeUsd = A(300_000); a.interestUsd = A(20_000); a.daUsd = A(80_000); a.ownerCompUsd = A(150_000);
  a.addBackOneTimeUsd = A(0); a.addBackPersonalUsd = A(0); a.addBackFamilyUsd = A(0);
  a.realEstate = A('leased'); delete a.rentPaidUsd; delete a.marketRentUsd;
  const r = computeFullEvaluation(a, 'hvac');
  ok(r.quick?.laneSupported === true && r.quick.basisType === 'SDE', 'sub-$3M revenue → SDE basis');
  ok(r.quick?.laneSupported === true && r.quick.basisUsd === 550_000, 'SDE = EBITDA + owner comp');
  ok(r.bridge !== null && r.bridge.some(l => /owner/i.test(l.label) && l.amountUsd === 150_000),
    'owner comp prints as a bridge line on the SDE walk');
  ok(r.bridge !== null && r.bridge.filter(l => l.kind === 'start' || l.kind === 'line')
    .reduce((s, l) => s + l.amountUsd, 0) === 550_000, 'SDE bridge sums exactly');
}

// ── three-year trend arithmetic ───────────────────────────────────────────
{
  const r = computeFullEvaluation(fullAnswers(), LANE);
  ok(r.trend !== null, 'trend renders when both prior years land');
  if (r.trend) {
    ok(r.trend.rows.length === 3 && r.trend.rows[0].period === 'FY-2' && r.trend.rows[2].period === 'TTM',
      'trend rows run FY-2 → FY-1 → TTM');
    ok(r.trend.rows[1].growthPct === 14.3, 'FY-1 growth = 32/28 − 1 → 14.3%');
    ok(r.trend.rows[2].growthPct === 10, 'TTM growth = 35.2/32 − 1 → 10%');
    ok(r.trend.rows[2].ebitdaUsd === 3_820_000, 'TTM EBITDA row = the reported split, pre-add-backs');
    const expectCagr = Math.round((Math.sqrt(35_200_000 / 28_000_000) - 1) * 1000) / 10;
    ok(r.trend.achievedCagrPct === expectCagr, `achieved CAGR = two-year compound rate (${expectCagr}%)`);
    ok(/as reported/i.test(r.trend.note), 'trend note names its own basis honestly');
  }
}

// ── buyer's ratios: arithmetic + testing notes, no invented benchmarks ────
{
  const r = computeFullEvaluation(fullAnswers(), LANE);
  const g = (k: string) => r.ratios.find(x => x.key === k)!;
  ok(r.ratios.length === 7, 'seven buyer ratios');
  ok(g('dso').value === 60, 'DSO = AR ÷ (revenue/365) → 60 days');
  ok(g('wip').value === 1_100_000 && /overbilled/.test(g('wip').display), 'WIP position reads net overbilled');
  ok(g('debtToEbitda').display === '0.8x', 'debt/EBITDA = 3.2M / 4.265M → 0.8x');
  ok(g('netDebtToEbitda').display === '0.4x', 'net debt nets the cash → 0.4x');
  ok(g('backlogCoverage').value === 15.6, 'backlog coverage = backlog ÷ monthly project revenue → 15.6 months');
  ok(g('revenuePerEmployee').value === Math.round(35_200_000 / 178), 'revenue per employee is exact division');
  ok(g('workingCapitalPct').value === 11.6, 'working capital = 11.6% of revenue');
  ok(r.ratios.every(x => x.testing.length > 40), 'every ratio carries a real testing note');
  ok(r.ratios.every(x => !/\d+(\.\d+)?%?\s*(is|being)?\s*(typical|average|industry|benchmark)/i.test(x.testing)),
    'testing notes carry no invented industry-average figures');
  // Underbilled reads the other way.
  const a2 = fullAnswers(); a2.wipOverUnderUsd = A(-500_000);
  const r2 = computeFullEvaluation(a2, LANE);
  ok(/underbilled \$500,000/.test(r2.ratios.find(x => x.key === 'wip')!.display), 'negative WIP reads net underbilled');
}

// ── what moves the number: growth defaults BELOW the achieved rate ────────
{
  const r = computeFullEvaluation(fullAnswers(), LANE);
  ok(r.whatMoves !== null, 'what-moves renders with a target mix + supported band');
  if (r.whatMoves && r.trend) {
    const achieved = r.trend.achievedCagrPct!;
    ok(r.whatMoves.achievedCagrPct === achieved, 'what-moves carries the achieved rate');
    ok(r.whatMoves.growthPctUsed > 0 && r.whatMoves.growthPctUsed < achieved,
      `default growth (${r.whatMoves.growthPctUsed}%) sits BELOW achieved (${achieved}%)`);
    ok(r.whatMoves.growthPctUsed === Math.max(0, Math.round(achieved / 2 * 10) / 10),
      'default is exactly half the achieved rate');
    ok(/half your achieved/i.test(r.whatMoves.growthNote), 'the note names the default\'s arithmetic');
    const gg = r.whatMoves.growthPctUsed / 100;
    ok(r.whatMoves.revenueAt24moUsd === Math.round(35_200_000 * (1 + gg) * (1 + gg)),
      '24-month revenue = two years of compounding, nothing else');
    ok(r.whatMoves.serviceMix.serviceRevenueAt24moUsd === Math.round(r.whatMoves.revenueAt24moUsd * 45 / 100),
      'service revenue target = projected revenue × target mix');
    ok(r.whatMoves.serviceMix.serviceRevenueGapUsd ===
      r.whatMoves.serviceMix.serviceRevenueAt24moUsd - 13_376_000,
      'the gap = target service revenue − today\'s service book');
    ok(r.whatMoves.perTurnUsd === 4_265_000, 'one turn of the band = 1 × today\'s basis (pure arithmetic)');
    const b24 = r.whatMoves.rangeAt24moUsd;
    ok(b24.low <= b24.marketLow && b24.marketLow <= b24.marketHigh && b24.marketHigh <= b24.high
      && b24.low < b24.high,
      '24-month output is an ordered RANGE (band endpoints, never one number)');
    ok(/not a forecast/i.test(r.whatMoves.note), 'the note says arithmetic, not forecast');
  }
  // An explicit growth answer is respected verbatim.
  const a2 = fullAnswers(); a2.growthPct = A(15);
  const r2 = computeFullEvaluation(a2, LANE);
  ok(r2.whatMoves?.growthPctUsed === 15 && /your assumption/i.test(r2.whatMoves.growthNote),
    'an entered growth rate overrides the default');
  // No trend → no invented growth: flat, and the note says why.
  const a3 = fullAnswers(); delete a3.fy1RevenueUsd; delete a3.fy2RevenueUsd;
  delete a3.fy1EbitdaUsd; delete a3.fy2EbitdaUsd;
  const r3 = computeFullEvaluation(a3, LANE);
  ok(r3.whatMoves?.growthPctUsed === 0 && /no growth assumed/i.test(r3.whatMoves.growthNote),
    'without prior years the projection holds revenue flat rather than invent a rate');
}

// ── proceeds waterfall: EV range − debt − labeled norms → cash range ──────
{
  const r = computeFullEvaluation(fullAnswers(), LANE);
  ok(r.waterfall !== null, 'waterfall renders with a range + funded debt');
  if (r.waterfall) {
    const evLow = 34_120_000, evHigh = 46_915_000, debt = 3_200_000;
    const costsLow = Math.round(evLow * TRANSACTION_COSTS_PCT / 100);
    const costsHigh = Math.round(evHigh * TRANSACTION_COSTS_PCT / 100);
    const escrowLow = Math.round(evLow * ESCROW_PCT / 100);
    const escrowHigh = Math.round(evHigh * ESCROW_PCT / 100);
    ok(r.waterfall.cashAtCloseUsd.low === evLow - debt - costsLow - escrowLow,
      `cash at close (low) = EV − debt − ${TRANSACTION_COSTS_PCT}% − ${ESCROW_PCT}% exactly`);
    ok(r.waterfall.cashAtCloseUsd.high === evHigh - debt - costsHigh - escrowHigh,
      'cash at close (high) = the same walk on the high endpoint');
    ok(r.waterfall.cashAtCloseUsd.low < r.waterfall.cashAtCloseUsd.high, 'cash at close is a RANGE');
    ok(r.waterfall.lines.length === 4 && r.waterfall.lines[0].lowUsd === evLow, 'the walk prints all four lines');
    ok(/practice norm/i.test(r.waterfall.lines[2].label) && /practice.*norm/i.test(r.waterfall.costsNote),
      'the 4% costs line is LABELED a practice norm, in the line and the note');
    ok(new RegExp(`${ESCROW_PCT}%`).test(r.waterfall.lines[3].label) && /released/i.test(r.waterfall.escrowNote),
      'the escrow line names its 10% and the note says held-not-lost');
    ok(r.waterfall.shortfallNote === null, 'no shortfall note when the low leg clears');
  }
  // Debt bigger than the low end → floors at zero with the note, never negative.
  const a2 = fullAnswers(); a2.fundedDebtUsd = A(40_000_000);
  const r2 = computeFullEvaluation(a2, LANE);
  ok(r2.waterfall !== null && r2.waterfall.cashAtCloseUsd.low === 0 && r2.waterfall.shortfallNote !== null,
    'a low-end shortfall floors at zero and says so');
  ok(r2.waterfall !== null && r2.waterfall.cashAtCloseUsd.high > 0, 'the high leg still computes');
}

// ── gating: incomplete sections withhold their pages and NAME the gaps ────
{
  const a = fullAnswers();
  delete a.fy1RevenueUsd;
  a.fy2EbitdaUsd = { state: 'parked', note: 'CPA has the schedule' };
  const r = computeFullEvaluation(a, LANE);
  ok(r.trend === null, 'missing prior-year figures → trend page withheld');
  const trendGap = r.gaps.find(g => /trend/i.test(g));
  ok(!!trendGap && /line 1a/i.test(trendGap), 'the gap names the question AND where to find it');
  const st = r.sections.find(s => s.key === 'trend')!;
  ok(!st.complete && st.missing.some(m => m.key === 'fy1RevenueUsd' && m.state === 'open')
    && st.missing.some(m => m.key === 'fy2EbitdaUsd' && m.state === 'parked'),
    'section status distinguishes open from parked');
  ok(r.quick !== null && r.bridge !== null && r.waterfall !== null,
    'the legs whose inputs ARE complete still render (partial draft, not all-or-nothing)');
}
{
  const a = fullAnswers();
  a.pretaxIncomeUsd = { state: 'skipped', note: 'rather not say yet' };
  const r = computeFullEvaluation(a, LANE);
  ok(r.quick === null && r.bridge === null, 'a skipped required earnings figure withholds the valuation leg');
  ok(r.gaps.some(g => /bridge|valuation/i.test(g) && /1120-S|1065/i.test(g)),
    'the gap sentence carries the tax-return hint');
  ok(r.ratios.find(x => x.key === 'dso')!.value === 60, 'ratios that don\'t need earnings still compute');
  ok(r.ratios.find(x => x.key === 'debtToEbitda')!.value === null
    && r.ratios.find(x => x.key === 'debtToEbitda')!.missing.length > 0,
    'ratios that DO need the basis go null and name what\'s missing');
}

// ── requiredIf: rent questions bind only when the property is owned ───────
{
  const a = fullAnswers();
  delete a.marketRentUsd;
  const r = computeFullEvaluation(a, LANE);
  const st = r.sections.find(s => s.key === 'real-estate')!;
  ok(!st.complete && st.missing.some(m => m.key === 'marketRentUsd'),
    'owned + no market rent → real-estate section incomplete');
  ok(r.quick === null, 'the range is withheld rather than restated against a rent we don\'t have');
  ok(r.gaps.some(g => /market rent/i.test(g)), 'the gap names the market-rent question');
  const b = fullAnswers();
  b.realEstate = A('leased'); delete b.rentPaidUsd; delete b.marketRentUsd;
  const r2 = computeFullEvaluation(b, LANE);
  ok(r2.sections.find(s => s.key === 'real-estate')!.complete === true,
    'leased → the rent questions stop being required');
  ok(r2.quick?.laneSupported === true && r2.quick.realEstateNote === null,
    'leased profile evaluates with no restatement and no RE note');
}

// ── validators: deterministic cross-checks, gentle messages ───────────────
{
  const q = (k: string) => ALL_QUESTIONS.find(x => x.key === k)!;
  const a = fullAnswers();
  a.serviceRevenueUsd = A(10_000_000); // lines now sum to 31.824M vs 35.2M
  const msg = q('projectRevenueUsd').validate!(a);
  ok(msg !== null && /sum to/i.test(msg), 'revenue lines that don\'t reconcile draw the mix check');
  ok(q('projectRevenueUsd').validate!(fullAnswers()) === null, 'reconciled lines pass the mix check');
  const b = fullAnswers();
  b.fy2RevenueUsd = A(100_000); // 352x two-year move
  const msg2 = q('fy2RevenueUsd').validate!(b);
  ok(msg2 !== null && /double-check/i.test(msg2), 'an implausible trend swing draws the sanity check');
  ok(q('fy2RevenueUsd').validate!(fullAnswers()) === null, 'a real trend passes the sanity check');
}

// ── unsupported lane refuses the band leg, keeps the arithmetic ───────────
{
  const r = computeFullEvaluation(fullAnswers(), 'garage-doors');
  ok(r.quick !== null && r.quick.laneSupported === false, 'no published band → the band leg refuses');
  ok(r.bridge === null && r.waterfall === null && r.whatMoves === null,
    'valuation-derived pages are withheld, not guessed');
  ok(r.gaps.some(g => /don't guess/i.test(g)), 'the refusal reaches the gaps ledger in the engine\'s own words');
  ok(r.ratios.find(x => x.key === 'dso')!.value === 60 && r.trend !== null,
    'pure-arithmetic pages (ratios, trend) still render');
}

// ── THE LINE: no point estimate anywhere in the report model ──────────────
{
  const r = computeFullEvaluation(fullAnswers(), LANE);
  const keys: string[] = [];
  const walk = (o: unknown) => {
    if (Array.isArray(o)) { o.forEach(walk); return; }
    if (o && typeof o === 'object') {
      for (const [k, v] of Object.entries(o as Record<string, unknown>)) { keys.push(k); walk(v); }
    }
  };
  walk(r);
  ok(!keys.some(k => /midpoint|pointEstimate|estimate|fairValue|apprais/i.test(k)),
    'no field in the whole report model is a point estimate');
  ok(typeof r.waterfall?.cashAtCloseUsd.low === 'number' && typeof r.waterfall?.cashAtCloseUsd.high === 'number',
    'cash at close is low/high, never one number');
  ok('low' in r.whatMoves!.rangeAt24moUsd && 'high' in r.whatMoves!.rangeAt24moUsd,
    'the 24-month projection is a band, never one number');
  ok(r.disclaimer === DISCLAIMER, 'the not-an-appraisal disclaimer travels inside the result');
}

// ── revenue-lines assembly ────────────────────────────────────────────────
{
  const r = computeFullEvaluation(fullAnswers(), LANE);
  ok(r.revenueLines !== null, 'revenue lines render when the section is complete');
  if (r.revenueLines) {
    ok(r.revenueLines.serviceMixPct === 38, 'service mix = service ÷ total → 38%');
    ok(r.revenueLines.blendedGmPct === 25.3, 'blended GM = Σ(line GP) ÷ Σ(line revenue) → 25.3%');
    ok(r.revenueLines.lines[0].grossProfitUsd === Math.round(13_376_000 * 0.34),
      'per-line gross profit is exact arithmetic');
  }
  ok(r.profile.suretyLine !== null && /\$15,000,000 single/.test(r.profile.suretyLine!),
    'surety renders as the single/aggregate line buyers read');
}

// ── sectionStatus is the single gate all readers share ────────────────────
{
  const empty: EvalAnswers = {};
  const st = sectionStatus(empty);
  ok(st.length === 9 && st.every(s => !s.complete), 'empty answers → every section incomplete');
  const req = st.flatMap(s => s.missing).length;
  ok(req === ALL_QUESTIONS.filter(q => !q.optional && !q.requiredIf).length,
    'missing lists exactly the unconditionally-required questions when nothing is answered');
  const full = sectionStatus(fullAnswers());
  ok(full.every(s => s.complete), 'the complete profile completes every section');
}

// ══ THE NARROWED BAND ══════════════════════════════════════════════════════
// The published tier is the STARTING band; evidence narrows it, every step
// cited; parked/unanswered drivers leave their width IN and say so.

/** The quick leg for the complete profile — band 8–11x, basis $4,265,000. */
const quickOf = (a: EvalAnswers): EvaluationResult => {
  const r = computeFullEvaluation(a, LANE);
  if (!r.quick || !r.quick.laneSupported) throw new Error('expected a supported quick leg');
  return r.quick;
};
const QUICK = quickOf(fullAnswers());

// ── the starting band: nothing verified → the full published tier ─────────
{
  const nb = narrowBand(QUICK, {});
  ok(nb.lowX === 8 && nb.highX === 11, `empty answers start at the published tier (got ${nb.lowX}–${nb.highX})`);
  ok(nb.steps.length === 0, 'nothing verified → no narrowing steps');
  ok(nb.widthNotes.length === 4, `all four drivers unanswered → four width notes (got ${nb.widthNotes.length})`);
  ok(nb.widthNotes.every(w => /unanswered/.test(w)), 'every note says the driver is unanswered');
  ok(nb.widthNotes.some(w => /wider because/i.test(w)), 'notes carry the "wider because" grammar');
  ok(nb.lowUsd === 34_100_000 && nb.highUsd === 46_900_000,
    `USD endpoints = band × basis to $100k (got ${nb.lowUsd}–${nb.highUsd})`);
}

// ── clean complete profile: monotonic walk to ≤ ~1.2x of width ────────────
{
  const a = fullAnswers();
  a.recurringPct = A(45); // clears the published ≈40% re-rate threshold
  const nb = narrowBand(quickOf(a), a);
  ok(nb.steps.length === 4, `mix + owner + books + concentration-hold = 4 steps (got ${nb.steps.length})`);
  ok(nb.lowX === 9.9 && nb.highX === 11,
    `clean profile narrows 8–11x to 9.9–11.0x (got ${nb.lowX}–${nb.highX})`);
  ok(nb.highX - nb.lowX <= 1.2 + 1e-9, `clean complete profile is ≤ ~1.2x wide (got ${(nb.highX - nb.lowX).toFixed(1)}x)`);
  ok(nb.widthNotes.length === 0, 'a complete clean profile leaves no width notes');
  ok(nb.lowUsd === 42_200_000 && nb.highUsd === 46_900_000,
    `USD endpoints follow the narrowed multiples (got ${nb.lowUsd}–${nb.highUsd})`);
  // Attribution on EVERY step, and every source is a published register.
  ok(nb.steps.every(s => s.source.length > 10), 'every step carries a source');
  ok(nb.steps.every(s => /smbX|SBA SOP/i.test(s.source)), 'every source names a published register');
  // Monotonic: floor only rises, ceiling only falls, band never inverts.
  let f = 8, c = 11;
  let monotonic = true;
  for (const s of nb.steps) {
    if (s.moved === 'floor') { if (s.toX < s.fromX || s.fromX < f - 1e-9) monotonic = false; f = s.toX; }
    else { if (s.toX > s.fromX || s.fromX > c + 1e-9) monotonic = false; c = s.toX; }
    if (f > c + 1e-9) monotonic = false;
  }
  ok(monotonic, 'steps are monotonic: floor never falls, ceiling never rises, floor ≤ ceiling throughout');
  // Endpoint quantization law: 0.1x / $100k.
  ok(Math.round(nb.lowX * 10) === nb.lowX * 10 && Math.round(nb.highX * 10) === nb.highX * 10,
    'x endpoints land on 0.1x');
  ok(nb.lowUsd % 100_000 === 0 && nb.highUsd % 100_000 === 0, 'USD endpoints land on $100k');
  // The specific evidence prints on the steps.
  ok(/≈40%/.test(nb.steps[0].label) && nb.steps[0].source === READINESS_THRESHOLD_SOURCE,
    'the mix step cites the published ≈40% re-rate threshold');
  ok(/20–30% owner-dependency/.test(nb.steps[1].label), 'the owner step cites the published 20–30% discount');
  ok(/5–15%/.test(nb.steps[2].label), 'the books step cites the published QofE haircut range');
  ok(/15–20%/.test(nb.steps[3].label) && nb.steps[3].fromX === nb.steps[3].toX && nb.steps[3].moved === 'ceiling',
    'concentration inside the published line HOLDS the ceiling (a hold, not a move)');
}

// ── the MEP service-mix spread moves the floor on the band's own source ───
{
  const a = fullAnswers();
  delete a.recurringPct; // the recurring threshold is out of the picture
  a.serviceRevenueUsd = A(16_500_000); // 46.9% of $35.2M — a real service book
  const nb = narrowBand(QUICK, a);
  const mix = nb.steps.find(s => /service & maintenance book/i.test(s.label));
  ok(!!mix && mix.moved === 'floor' && mix.toX === 9.5,
    'service mix ≥45% lifts the floor into the upper half of the tier');
  ok(!!mix && /Commercial Mechanical/i.test(mix.source),
    'the mix-spread step cites the lane band\'s own published source');
  ok(!nb.widthNotes.some(w => /recurring/i.test(w)),
    'with the mix spread verified, no recurring width note is emitted');
}

// ── the weaker 30% line lifts by the conservative single turn ─────────────
{
  const a = fullAnswers();
  a.recurringPct = A(35); // above 30, below 40; service mix stays 38%
  const nb = narrowBand(QUICK, a);
  const mix = nb.steps.find(s => /1–2 turn/.test(s.label));
  ok(!!mix && mix.fromX === 8 && mix.toX === 9,
    '30–39% recurring lifts the floor by exactly the conservative single turn (8→9)');
}

// ── monotonic narrowing: more verified answers never widen the band ───────
{
  const a0: EvalAnswers = {};
  const a1 = { recurringPct: A(45) };
  const a2 = { ...a1, ownerDependence: A('manager-in-place') };
  const a3 = { ...a2, booksQuality: A('reviewed') };
  const a4 = { ...a3, topCustomerPct: A(10) };
  const widths = [a0, a1, a2, a3, a4].map(x => {
    const nb = narrowBand(QUICK, x);
    return nb.highX - nb.lowX;
  });
  ok(widths.every((w, i) => i === 0 || w <= widths[i - 1] + 1e-9),
    `each verified driver narrows or holds, never widens (${widths.map(w => w.toFixed(1)).join(' → ')})`);
  ok(widths[4] < widths[0], 'the complete walk is strictly narrower than the empty one');
}

// ── parked leaves the width IN, and the note says so ──────────────────────
{
  const a = fullAnswers();
  a.recurringPct = { state: 'parked', note: 'need the agreement report' };
  a.serviceRevenueUsd = A(13_376_000); // mix 38% — below the mix spread
  const nb = narrowBand(quickOf(fullAnswers()), a);
  ok(!nb.steps.some(s => /recurring|service & maintenance book/i.test(s.label)),
    'a parked recurring answer moves nothing');
  const note = nb.widthNotes.find(w => /recurring/i.test(w));
  ok(!!note && /parked on your go-get list/.test(note), 'the width note names the parked state');
  ok(!!note && /wider/.test(note), 'the note says the band is wider for it');
  // Skipped reads as skipped, not parked.
  const b = fullAnswers();
  b.ownerDependence = { state: 'skipped', note: 'rather not say' };
  const nb2 = narrowBand(quickOf(fullAnswers()), b);
  const note2 = nb2.widthNotes.find(w => /owner dependence/i.test(w));
  ok(!!note2 && /skipped/.test(note2), 'a skipped driver\'s note says skipped');
}

// ── the financing ceiling caps the top — arithmetic, SBA-cited ────────────
{
  const a = fullAnswers();
  a.recurringPct = A(45);
  const q = quickOf(a);
  const SBA_SRC = 'SBA SOP 50 10 8 (effective 2025-06-01) — 1.25x lender DSCR standard';
  const capping: NarrowBandModels = {
    financing: { baseDscr: 1.16, lenderFloor: 1.25, pricedAtX: 11, loanWithin7aCap: true, source: SBA_SRC },
  };
  const nb = narrowBand(q, a, capping);
  // capX = 11 × 1.16 / 1.25 = 10.208 → 10.2
  const cap = nb.steps.find(s => /financing ceiling/i.test(s.label));
  ok(!!cap && cap.moved === 'ceiling' && cap.fromX === 11 && cap.toX === 10.2,
    `DSCR below the floor at the top caps the ceiling at the financeable multiple (got ${cap?.toX})`);
  ok(!!cap && /SBA SOP/.test(cap.source), 'the cap cites SBA SOP 50 10 8');
  ok(nb.highX === 10.2 && nb.lowX === 9.9, 'the band closes from both ends');

  // Outside the 7(a) program (the loan the arithmetic prices could not be
  // written) the cap does not bind — the equity-buyer band stands.
  const outOfProgram: NarrowBandModels = {
    financing: { baseDscr: 0.64, lenderFloor: 1.25, pricedAtX: 11, loanWithin7aCap: false, source: SBA_SRC },
  };
  const nb2 = narrowBand(q, a, outOfProgram);
  ok(nb2.highX === 11 && !nb2.steps.some(s => /financing/i.test(s.label)),
    'a loan beyond the 7(a) maximum caps nothing — the published band stands');

  // Earnings that clear the standard at the top: the ceiling HOLDS, on the
  // record, as a step.
  const clears: NarrowBandModels = {
    financing: { baseDscr: 1.5, lenderFloor: 1.25, pricedAtX: 11, loanWithin7aCap: true, source: SBA_SRC },
  };
  const nb3 = narrowBand(q, a, clears);
  const hold = nb3.steps.find(s => /financing test/i.test(s.label));
  ok(!!hold && hold.fromX === hold.toX && hold.toX === 11, 'a clearing DSCR holds the ceiling, recorded as a step');

  // A cap below the profile floor never inverts the band — floor wins,
  // and the step says where the structure story lives.
  const crush: NarrowBandModels = {
    financing: { baseDscr: 0.6, lenderFloor: 1.25, pricedAtX: 11, loanWithin7aCap: true, source: SBA_SRC },
  };
  const nb4 = narrowBand(q, a, crush);
  ok(nb4.lowX < nb4.highX, 'ALWAYS a range — even a crushing cap never produces a point');
  const crushStep = nb4.steps.find(s => /financing ceiling/i.test(s.label));
  ok(!!crushStep && /profile floor/.test(crushStep.label), 'a below-floor cap is held at the floor and says so');
}

// ── the draft leg: bandBasisFor computes band+basis without the drivers ───
{
  const a = fullAnswers();
  a.recurringPct = { state: 'parked', note: 'need the agreement report' };
  a.topCustomerPct = { state: 'parked' };
  const r = computeFullEvaluation(a, LANE);
  ok(r.quick === null, 'parked drivers withhold the quick (readiness) leg');
  const bb = bandBasisFor(a, LANE);
  ok(bb !== null && bb.basisUsd === 4_265_000 && bb.basisType === 'Adjusted EBITDA',
    'bandBasisFor still computes the exact basis (drivers untouched by the bridge)');
  const nb = narrowBand(bb!, a);
  ok(nb.steps.length === 2 && nb.lowX === 8.7 && nb.highX === 11,
    `the answered drivers still narrow (owner + books), the parked ones don't (got ${nb.lowX}–${nb.highX}, ${nb.steps.length} steps)`);
  ok(nb.widthNotes.length === 2 && nb.widthNotes.every(w => /parked on your go-get list/.test(w)),
    'both parked drivers leave their width in, named as parked');
  ok(nb.band.key === 'commercial-mechanical' && nb.basisUsd === 4_265_000,
    'the narrowed band travels self-contained: band + basis ride inside it');
  const b = fullAnswers(); delete b.pretaxIncomeUsd;
  ok(bandBasisFor(b, LANE) === null, 'no basis without the normalization walk');
  const c = fullAnswers(); delete c.marketRentUsd;
  ok(bandBasisFor(c, LANE) === null,
    'owned real estate without market rent withholds the basis (a wrong basis is not a draft)');
  ok(bandBasisFor(fullAnswers(), 'garage-doors') === null, 'unsupported lane → null, never a guess');
}

// ── range law: never a number, endpoints always ordered ───────────────────
{
  const configs: Array<[EvalAnswers, NarrowBandModels | undefined]> = [
    [{}, undefined],
    [fullAnswers(), undefined],
    [{ ...fullAnswers(), recurringPct: A(45) }, undefined],
    [{ ...fullAnswers(), recurringPct: A(45) },
      { financing: { baseDscr: 0.5, lenderFloor: 1.25, pricedAtX: 11, loanWithin7aCap: true, source: 'SBA SOP 50 10 8' } }],
  ];
  ok(configs.every(([ans, m]) => {
    const nb = narrowBand(QUICK, ans, m);
    return nb.lowX < nb.highX && nb.lowUsd < nb.highUsd;
  }), 'every configuration yields floor < ceiling in x AND dollars');
}

// ── the draft carry-over: mapDraftAnswers seeds the walk, nothing re-asked ─
{
  // A complete first sitting, exactly as OwnerChat's fin ref holds it.
  const fin: Record<string, number | string> = {
    revenueUsd: 2_400_000, earningsUsd: 380_000, ownerCompUsd: 160_000,
    addBackOneTimeUsd: 25_000, addBackPersonalUsd: 12_000, addBackFamilyUsd: 0,
    realEstate: 'owned', rentPaidUsd: 0, marketRentUsd: 60_000,
    recurringPct: 35, ownerDependence: 'manager-in-place', topCustomerPct: 10,
    booksQuality: 'accrual', newConstructionPct: 20,
  };
  const seeded = mapDraftAnswers(fin, { lane: 'hvac', geo: 'Dallas', revBand: '$1M–$3M', situation: 'Ready in the next 12 months' });
  ok(seeded['ttmRevenueUsd']?.state === 'answered' && seeded['ttmRevenueUsd'].value === 2_400_000,
    'revenueUsd carries over as ttmRevenueUsd');
  ok(seeded['pretaxIncomeUsd']?.state === 'answered' && seeded['pretaxIncomeUsd'].value === 380_000,
    'earningsUsd (the bottom line before adjustments) carries as pretaxIncomeUsd');
  ok(seeded['timeline']?.value === 'ready-12mo', 'the situation label maps to the timeline choice value');
  ok(seeded['realEstate']?.value === 'owned' && seeded['booksQuality']?.value === 'accrual'
    && seeded['ownerDependence']?.value === 'manager-in-place',
    'choice answers carry with the questions\' own values');
  ok(seeded['recurringPct']?.value === 35 && seeded['marketRentUsd']?.value === 60_000
    && seeded['addBackFamilyUsd']?.value === 0,
    'numeric drivers, rent figures and zero-valued add-backs all carry');
  ok(seeded['interestUsd'] === undefined && seeded['daUsd'] === undefined,
    'the interest/D&A split the first sitting never asked stays open — the walk asks it');
  ok(Object.keys(seeded).every(k => ALL_QUESTIONS.some(q => q.key === k)),
    'every seeded key is a real question key (the server sanitizer would accept the whole patch)');
  ok(Object.values(seeded).every(a => a.state === 'answered'),
    'carry-over only ever seeds answered — never parked or skipped on the owner\'s behalf');

  // The walk opens past what carried: no seeded question should be re-asked.
  const status = sectionStatus(seeded);
  const customers = status.find(s => s.key === 'customers');
  ok(customers !== undefined && customers.complete,
    'the concentration & management section is complete from the first sitting alone');
  const realEstateSec = status.find(s => s.key === 'real-estate');
  ok(realEstateSec !== undefined && realEstateSec.complete,
    'the real-estate section (owned, both rents) is complete from the first sitting alone');

  // Bad values drop silently — the walk simply asks.
  const junk = mapDraftAnswers(
    { revenueUsd: Number.NaN, realEstate: 'castle', ownerDependence: 42, earningsUsd: 100_000 },
    { situation: 'no idea' },
  );
  ok(junk['ttmRevenueUsd'] === undefined, 'a non-finite number never seeds');
  ok(junk['realEstate'] === undefined && junk['ownerDependence'] === undefined,
    'a value outside the question\'s own choices never seeds');
  ok(junk['timeline'] === undefined, 'an unknown situation label never seeds');
  ok(junk['pretaxIncomeUsd']?.value === 100_000, 'the good keys still carry');

  // Empty in, empty out — a lost session carries nothing and breaks nothing.
  ok(Object.keys(mapDraftAnswers({}, {})).length === 0, 'empty first sitting → empty seed');
}

console.log(`\n${pass}/${pass + fail} passed`);
if (fail > 0) process.exit(1);
