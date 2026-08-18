/**
 * house/deal.ts — BUY-SIDE DEAL MATH, PURE
 *
 * (2026-08-14, Paul: "I don't see anyway but to move everything to Cowork that
 * is not front end and marketing.")
 *
 * WHY THIS FILE EXISTS. Every capability that successfully moved to the disk
 * workspace got a pure shared layer FIRST — `house/audit.ts` for the citation
 * check, `house/screen.ts` for the target screen, `house/leads.ts` for the
 * buyer ranking — so that the app and a local Cowork session compute IDENTICAL
 * answers and there is never a question of which one is right. Deal math was
 * the one thing that never got that treatment: it lived only in
 * `client/src/lib/calculations/core.ts` (the canvas models) and
 * `server/services/v19ModelRuntime.ts`, both unreachable from a local CLI.
 *
 * The cost of that gap is on the record. `dealexplorer.html` (2026-08-14)
 * reimplemented `monthlyPayment`, `amort`, `dscr` and `irr` in browser JS and
 * said so in its own header — "Engine: v17-reference (mirrors the workbench;
 * re-sync at vendoring)". A mirror that must be re-synced by hand is a second
 * engine, and two engines that disagree about what a deal is worth is the worst
 * failure this practice has: the numbers differ, both look authoritative, and
 * one of them reaches a client.
 *
 * So this is the ONE engine. `core.ts` is the canonical source it was ported
 * from, and `house/__tests__/deal.test.mts` cross-checks the two so the day
 * they diverge is the day a test goes red, not the day a client notices.
 *
 * PARITY IS THE CONTRACT, WHICH MEANS BUGS PORT TOO.
 * Two shortcuts in the original are reproduced here deliberately, and neither
 * is fixed in place:
 *
 *  1. `lbo()` amortizes debt LINEARLY for paydown tracking — `debt / years`,
 *     ignoring the interest/principal split — even though `amortize()` sits
 *     right beside it doing the real schedule. It is marked in the original as
 *     "Simplified". Correcting it here would make the local engine and the
 *     app's canvas disagree about exit equity, which is exactly the drift this
 *     file exists to prevent. If it should be fixed, fix it in BOTH, in one
 *     commit, with the test updated in the same change.
 *  2. `irr()` is Newton-Raphson and can fail to converge on cash-flow shapes
 *     with a sign change mid-stream. The original returns the last iterate
 *     regardless — a silently wrong rate. The numeric behaviour is preserved
 *     byte for byte, but the result is now a `{rate, converged}` pair so a
 *     caller can REFUSE to print a rate that never converged. That is added
 *     information, not a changed answer.
 *
 * WHAT IS DELIBERATELY NOT HERE: the tax block. `core.ts` carries
 * `FEDERAL_RATES`, the QSBS tiers, §168(k)/(n), §163(j), §174A, SALT, §453A and
 * the asset/stock-sale calculators. Those are jurisdictional, they move with
 * legislation, and THE LINE is explicit that tax opinions are out of lane —
 * coordinate the specialist. A local CLI that could print an after-tax number
 * into a client document is a compliance problem wearing a convenience
 * costume. Model the DEAL here; route the tax question to the CPA and cite
 * their answer.
 *
 * PURE by house doctrine: no db, no API key, no env, no filesystem, no clock,
 * no Math.random. Same inputs, same outputs, forever.
 *
 * MONEY IS CENTS (integers) and RATES ARE DECIMALS (0.105 = 10.5%), matching
 * CLAUDE.md rule 10. A float dollar anywhere in this file is a bug.
 */

/* ─── Earnings ──────────────────────────────────────────────────────── */

export interface AddBack {
  label: string;
  amount: number; // cents
  verified: boolean;
  category:
    | 'owner_comp' | 'depreciation' | 'amortization' | 'interest'
    | 'one_time' | 'discretionary' | 'other';
}

export interface Breakdown { label: string; amount: number }

/**
 * SDE — seller's discretionary earnings. Takes ALL add-backs, verified or not,
 * matching the canvas. `ebitda()` below takes only verified ones; that
 * asymmetry is in the original and is preserved.
 */
export function sde(
  netIncome: number,
  ownerSalary: number,
  addBacks: AddBack[],
): { sde: number; breakdown: Breakdown[] } {
  const breakdown: Breakdown[] = [
    { label: 'Net Income', amount: netIncome },
    { label: "Owner's Salary", amount: ownerSalary },
    ...addBacks.map(ab => ({ label: ab.label, amount: ab.amount })),
  ];
  return { sde: breakdown.reduce((s, i) => s + i.amount, 0), breakdown };
}

/** EBITDA — VERIFIED add-backs only. An unverified add-back is a claim, not a figure. */
export function ebitda(
  netIncome: number,
  depreciation: number,
  amortization: number,
  interest: number,
  taxes: number,
  addBacks: AddBack[],
  nonRecurringIncome: number = 0,
): { ebitda: number; breakdown: Breakdown[] } {
  const verified = addBacks.filter(ab => ab.verified);
  const breakdown: Breakdown[] = [
    { label: 'Net Income', amount: netIncome },
    { label: 'Depreciation', amount: depreciation },
    { label: 'Amortization', amount: amortization },
    { label: 'Interest', amount: interest },
    { label: 'Taxes', amount: taxes },
    ...verified.map(ab => ({ label: ab.label, amount: ab.amount })),
    ...(nonRecurringIncome > 0
      ? [{ label: 'Less: Non-Recurring Income', amount: -nonRecurringIncome }]
      : []),
  ];
  return { ebitda: breakdown.reduce((s, i) => s + i.amount, 0), breakdown };
}

/* ─── Valuation ─────────────────────────────────────────────────────── */

/**
 * League multiple bands. These are the app's V19 league constants — a HOUSE
 * ASSUMPTION, not a market observation, and the CLI labels them as such.
 * Never print one into a client document as though it were a comp.
 */
export const LEAGUE_MULTIPLES: Record<string, { metric: 'SDE' | 'EBITDA'; min: number; max: number }> = {
  L1: { metric: 'SDE',    min: 2.0,  max: 3.5 },
  L2: { metric: 'SDE',    min: 3.0,  max: 5.0 },
  L3: { metric: 'EBITDA', min: 4.0,  max: 6.0 },
  L4: { metric: 'EBITDA', min: 6.0,  max: 8.0 },
  L5: { metric: 'EBITDA', min: 8.0,  max: 12.0 },
  L6: { metric: 'EBITDA', min: 10.0, max: 15.0 },
};

export interface ValuationResult {
  low: number; mid: number; high: number;
  metric: 'SDE' | 'EBITDA';
  earnings: number;
  multipleMin: number; multipleMid: number; multipleMax: number;
  league: string;
}

/** A RANGE, never a point — the same law the owner evaluation runs on. */
export function valuation(
  earnings: number,
  league: string,
  multipleOverride?: { min: number; max: number },
): ValuationResult {
  const band = LEAGUE_MULTIPLES[league] || LEAGUE_MULTIPLES.L1;
  const min = multipleOverride?.min ?? band.min;
  const max = multipleOverride?.max ?? band.max;
  const mid = (min + max) / 2;
  return {
    low: Math.round(earnings * min),
    mid: Math.round(earnings * mid),
    high: Math.round(earnings * max),
    metric: band.metric,
    earnings,
    multipleMin: min, multipleMid: mid, multipleMax: max,
    league,
  };
}

export function blendedValuation(
  methods: { label: string; value: number; weight: number }[],
): { blended: number; methods: { label: string; value: number; weight: number }[] } {
  const totalWeight = methods.reduce((s, m) => s + m.weight, 0);
  if (totalWeight === 0) return { blended: 0, methods };
  const blended = Math.round(
    methods.reduce((s, m) => s + m.value * (m.weight / totalWeight), 0),
  );
  return { blended, methods };
}

/* ─── Debt service ──────────────────────────────────────────────────── */

export function monthlyPayment(principal: number, annualRate: number, termMonths: number): number {
  if (annualRate === 0) return Math.round(principal / termMonths);
  const r = annualRate / 12;
  const n = termMonths;
  return Math.round(principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
}

export function dscr(annualEarnings: number, annualDebtService: number): number {
  if (annualDebtService === 0) return Infinity;
  return annualEarnings / annualDebtService;
}

export interface AmortizationRow {
  month: number; payment: number; principal: number; interest: number; balance: number;
}

/** The REAL schedule — interest on the declining balance, month by month. */
export function amortize(principal: number, annualRate: number, termMonths: number): AmortizationRow[] {
  const rows: AmortizationRow[] = [];
  let balance = principal;
  const pmt = monthlyPayment(principal, annualRate, termMonths);
  const r = annualRate / 12;
  for (let m = 1; m <= termMonths && balance > 0; m++) {
    const interest = Math.round(balance * r);
    const principalPaid = Math.min(pmt - interest, balance);
    balance = Math.max(0, balance - principalPaid);
    rows.push({ month: m, payment: pmt, principal: principalPaid, interest, balance });
  }
  return rows;
}

export interface DSCRResult {
  dscr: number;
  monthlyPayment: number;
  annualDebtService: number;
  eligible: boolean;      // SBA threshold 1.25
  conventional: boolean;  // conventional threshold 1.50
  rating: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

/**
 * `rating` is RISK, so the polarity reads backwards at a glance and is worth
 * stating: a HEALTHY 1.60x coverage is rating 'LOW' (low risk), and a
 * dangerous 1.10x is 'CRITICAL'. Ported as-is from the canvas.
 */
export function dscrFull(
  annualEarnings: number,
  loanAmount: number,
  annualRate: number,
  termMonths: number,
): DSCRResult {
  const pmt = monthlyPayment(loanAmount, annualRate, termMonths);
  const annualDebtService = pmt * 12;
  const ratio = dscr(annualEarnings, annualDebtService);
  let rating: DSCRResult['rating'] = 'CRITICAL';
  if (ratio >= 1.50) rating = 'LOW';
  else if (ratio >= 1.25) rating = 'MEDIUM';
  else if (ratio >= 1.15) rating = 'HIGH';
  return {
    dscr: ratio, monthlyPayment: pmt, annualDebtService,
    eligible: ratio >= 1.25, conventional: ratio >= 1.50, rating,
  };
}

/* ─── SBA financing ─────────────────────────────────────────────────── */

export interface SBAResult {
  loanAmount: number; downPayment: number; sellerNote: number; equityRequired: number;
  monthlyPayment: number; annualDebtService: number; dscr: number;
  eligible: boolean; maxLoanCapacity: number; ltv: number; totalProjectCost: number;
  amortization: AmortizationRow[];
}

/** `eligible` carries the $5M 7(a) cap as 500_000_000 cents. */
export function sbaFinancing(
  purchasePrice: number,
  earnings: number,
  downPaymentPct: number,
  interestRate: number,
  termMonths: number,
  sellerNotePct: number = 0,
  workingCapital: number = 0,
  transactionFees: number = 0,
): SBAResult {
  // Fees (SBA guaranty ~3%, lender/packaging, legal, QoE) are EXPLICIT inputs,
  // never assumed absorbed: a DSCR computed on a loan that omits them
  // understates debt service, and the equity injection is checked against
  // TOTAL PROJECT COST — price + working capital + fees (2026-08-17).
  const totalProjectCost = purchasePrice + workingCapital + transactionFees;
  const downPayment = Math.round(totalProjectCost * downPaymentPct);
  const sellerNote = Math.round(purchasePrice * sellerNotePct);
  const loanAmount = totalProjectCost - downPayment - sellerNote;
  const pmt = monthlyPayment(loanAmount, interestRate, termMonths);
  const annualDebtService = pmt * 12;
  const ratio = dscr(earnings, annualDebtService);
  return {
    loanAmount, downPayment, sellerNote,
    equityRequired: downPayment,
    monthlyPayment: pmt, annualDebtService, dscr: ratio,
    eligible: ratio >= 1.25 && purchasePrice <= 500_000_000,
    maxLoanCapacity: Math.round((earnings / 1.25) * (termMonths / 12)),
    ltv: totalProjectCost > 0 ? loanAmount / totalProjectCost : 0,
    totalProjectCost,
    amortization: amortize(loanAmount, interestRate, termMonths),
  };
}

/* ─── Returns ───────────────────────────────────────────────────────── */

export interface IRRResult {
  /** Byte-identical to the canvas `calculateIRR`, converged or not. */
  rate: number;
  /**
   * FALSE when Newton-Raphson ran out its 100 iterations, or the derivative
   * went flat, without |NPV| dropping under a cent. The canvas returns the
   * last iterate either way; this flag is the addition, and the CLI refuses to
   * print a rate carrying `converged: false`. An IRR nobody can verify is
   * worse than no IRR.
   */
  converged: boolean;
}

export function irr(cashFlows: number[], guess: number = 0.1): IRRResult {
  let rate = guess;
  for (let i = 0; i < 100; i++) {
    let npv = 0;
    let dnpv = 0;
    for (let t = 0; t < cashFlows.length; t++) {
      npv += cashFlows[t] / Math.pow(1 + rate, t);
      dnpv -= (t * cashFlows[t]) / Math.pow(1 + rate, t + 1);
    }
    if (Math.abs(npv) < 0.01) return { rate, converged: true };
    if (dnpv === 0) break;
    rate -= npv / dnpv;
  }
  return { rate, converged: false };
}

export function moic(exitEquity: number, initialEquity: number): number {
  if (initialEquity === 0) return 0;
  return exitEquity / initialEquity;
}

/* ─── LBO / pro forma ───────────────────────────────────────────────── */

export interface LBOAssumptions {
  purchasePrice: number;      // cents, enterprise value
  ebitda: number;             // cents, year 0
  revenueGrowthRate: number;  // decimal
  ebitdaMargin: number;       // decimal
  exitMultiple: number;
  holdPeriod: number;         // years
  seniorDebtPct: number;      // share of EV
  seniorRate: number;
  seniorTerm: number;         // months
  mezDebtPct: number;
  mezRate: number;
  mezTerm: number;            // months
  revenue?: number;           // cents, year 0
}

export interface ProFormaYear {
  year: number; revenue: number; ebitda: number;
  debtService: number; fcf: number; debtBalance: number; cumulativeFcf: number;
}

export interface LBOResult {
  entryMultiple: number; exitValue: number;
  equityInvested: number; exitEquity: number;
  irr: number; irrConverged: boolean; moic: number;
  cashOnCash: number; paybackYears: number;
  dscrByYear: number[]; proForma: ProFormaYear[];
  sourcesUses: {
    sources: { label: string; amount: number }[];
    uses: { label: string; amount: number }[];
  };
}

/**
 * PORTED AS-IS, SHORTCUT INCLUDED. Debt paydown is LINEAR here
 * (`debt / (termMonths / 12)` a year), not the real amortization schedule
 * `amortize()` produces — the original marks it "Simplified". It understates
 * early-year balances and therefore overstates exit equity on a long
 * amortization. Do not fix it in this file alone; see the header.
 */
export function lbo(a: LBOAssumptions): LBOResult {
  const entryMultiple = a.ebitda > 0 ? a.purchasePrice / a.ebitda : 0;
  const seniorDebt = Math.round(a.purchasePrice * a.seniorDebtPct);
  const mezDebt = Math.round(a.purchasePrice * a.mezDebtPct);
  const equityInvested = a.purchasePrice - seniorDebt - mezDebt;
  const revenue0 = a.revenue
    || (a.ebitdaMargin > 0 ? Math.round(a.ebitda / a.ebitdaMargin) : a.ebitda * 5);

  const seniorMonthly = monthlyPayment(seniorDebt, a.seniorRate, a.seniorTerm);
  const mezMonthly = a.mezDebtPct > 0 ? monthlyPayment(mezDebt, a.mezRate, a.mezTerm) : 0;
  const totalAnnualDebt = (seniorMonthly + mezMonthly) * 12;

  const proForma: ProFormaYear[] = [];
  const dscrByYear: number[] = [];
  let cumulativeFcf = 0;
  let paybackYears = a.holdPeriod;
  let seniorBalance = seniorDebt;
  let mezBalance = mezDebt;

  for (let y = 1; y <= a.holdPeriod; y++) {
    const revenue = Math.round(revenue0 * Math.pow(1 + a.revenueGrowthRate, y));
    const yearEbitda = Math.round(revenue * a.ebitdaMargin);

    const seniorPrincipal = a.seniorTerm > 0 ? Math.round(seniorDebt / (a.seniorTerm / 12)) : 0;
    const mezPrincipal = a.mezTerm > 0 ? Math.round(mezDebt / (a.mezTerm / 12)) : 0;
    seniorBalance = Math.max(0, seniorBalance - seniorPrincipal);
    mezBalance = Math.max(0, mezBalance - mezPrincipal);

    const debtService = totalAnnualDebt;
    const fcfYear = yearEbitda - debtService;
    cumulativeFcf += fcfYear;
    if (cumulativeFcf >= equityInvested && paybackYears === a.holdPeriod) paybackYears = y;
    dscrByYear.push(debtService > 0 ? yearEbitda / debtService : Infinity);

    proForma.push({
      year: y, revenue, ebitda: yearEbitda, debtService,
      fcf: fcfYear, debtBalance: seniorBalance + mezBalance, cumulativeFcf,
    });
  }

  const last = proForma[proForma.length - 1];
  const exitEbitda = last?.ebitda || a.ebitda;
  const exitValue = Math.round(exitEbitda * a.exitMultiple);
  const remainingDebt = last?.debtBalance || 0;
  const exitEquity = exitValue - remainingDebt + cumulativeFcf;

  const cashFlows = [-equityInvested];
  for (let y = 0; y < a.holdPeriod - 1; y++) cashFlows.push(proForma[y]?.fcf || 0);
  cashFlows.push((last?.fcf || 0) + exitValue - remainingDebt);

  const r = irr(cashFlows);
  return {
    entryMultiple, exitValue, equityInvested, exitEquity,
    irr: r.rate, irrConverged: r.converged,
    moic: moic(exitEquity, equityInvested),
    cashOnCash: equityInvested > 0 ? cumulativeFcf / equityInvested : 0,
    paybackYears, dscrByYear, proForma,
    sourcesUses: {
      sources: [
        { label: 'Senior Debt', amount: seniorDebt },
        ...(mezDebt > 0 ? [{ label: 'Mezzanine Debt', amount: mezDebt }] : []),
        { label: 'Equity', amount: equityInvested },
      ],
      uses: [{ label: 'Enterprise Value', amount: a.purchasePrice }],
    },
  };
}

/* ─── Sensitivity ───────────────────────────────────────────────────── */

export interface SensitivityMatrix {
  matrix: number[][];
  var1Values: number[]; var2Values: number[];
  var1Key: string; var2Key: string;
  metric: 'irr' | 'moic' | 'dscr';
}

/** Rows are var1, columns are var2. `dscr` reads YEAR ONE only. */
export function sensitivityMatrix(
  base: LBOAssumptions,
  var1Key: keyof LBOAssumptions, var1Values: number[],
  var2Key: keyof LBOAssumptions, var2Values: number[],
  metric: 'irr' | 'moic' | 'dscr',
): SensitivityMatrix {
  const matrix = var1Values.map(v1 =>
    var2Values.map(v2 => {
      const result = lbo({ ...base, [var1Key]: v1, [var2Key]: v2 });
      if (metric === 'irr') return result.irr;
      if (metric === 'moic') return result.moic;
      return result.dscrByYear[0] || 0;
    }),
  );
  return {
    matrix, var1Values, var2Values,
    var1Key: String(var1Key), var2Key: String(var2Key), metric,
  };
}

/**
 * Breakpoint read on a finished sensitivity grid — where the deal BREAKS,
 * not just what the numbers are (2026-08-17, from the IB sensitivity set's
 * one good atom). Additive on purpose: `SensitivityMatrix` is printed by the
 * CLI and consumed as-is; this annotates without changing its shape. Below
 * the threshold is failing for every supported metric (irr/moic/dscr all
 * read "higher is better").
 */
export interface SensitivityBreakpoints {
  threshold: number;
  metric: 'irr' | 'moic' | 'dscr';
  /** Cells strictly under the threshold, with the driver values that produce them. */
  failing: { row: number; col: number; var1: number; var2: number; value: number }[];
  failingCount: number;
  totalCells: number;
  /** True when every cell fails or every cell passes — a grid with no boundary teaches nothing; widen the ranges. */
  noBoundary: boolean;
}

export function sensitivityBreakpoints(m: SensitivityMatrix, threshold: number): SensitivityBreakpoints {
  const failing: SensitivityBreakpoints['failing'] = [];
  m.matrix.forEach((row, i) => row.forEach((value, j) => {
    if (value < threshold) failing.push({ row: i, col: j, var1: m.var1Values[i], var2: m.var2Values[j], value });
  }));
  const totalCells = m.matrix.length * (m.matrix[0]?.length ?? 0);
  return {
    threshold, metric: m.metric, failing, failingCount: failing.length, totalCells,
    noBoundary: failing.length === 0 || failing.length === totalCells,
  };
}

/* ─── Cash flow ─────────────────────────────────────────────────────── */

export function fcf(
  ebitdaValue: number, taxes: number, capex: number, workingCapitalChange: number,
): { fcf: number; breakdown: Breakdown[] } {
  return {
    fcf: ebitdaValue - taxes - capex - workingCapitalChange,
    breakdown: [
      { label: 'EBITDA', amount: ebitdaValue },
      { label: 'Less: Taxes', amount: -taxes },
      { label: 'Less: CapEx', amount: -capex },
      { label: 'Less: ΔWorking Capital', amount: -workingCapitalChange },
    ],
  };
}

export function fcfConversion(fcfValue: number, ebitdaValue: number): number {
  return ebitdaValue > 0 ? fcfValue / ebitdaValue : 0;
}

/**
 * The working-capital peg — a trailing average of (current assets − current
 * liabilities). `variance` is the POPULATION standard deviation, and it is the
 * number that matters in a negotiation: a peg set at the average of a swingy
 * series is a number the seller will beat in a good month, so a high variance
 * against the peg is an argument for a collar, not a footnote.
 */
export function workingCapitalPeg(
  monthly: { month: string; currentAssets: number; currentLiabilities: number }[],
): { peg: number; average: number; monthlyWC: { month: string; wc: number }[]; variance: number } {
  const monthlyWC = monthly.map(m => ({
    month: m.month,
    wc: m.currentAssets - m.currentLiabilities,
  }));
  const total = monthlyWC.reduce((s, m) => s + m.wc, 0);
  const average = monthlyWC.length > 0 ? Math.round(total / monthlyWC.length) : 0;
  const variance = monthlyWC.length > 0
    ? Math.round(Math.sqrt(
        monthlyWC.reduce((s, m) => s + Math.pow(m.wc - average, 2), 0) / monthlyWC.length,
      ))
    : 0;
  return { peg: average, average, monthlyWC, variance };
}

/* ─── Covenants ─────────────────────────────────────────────────────── */

export interface CovenantResult {
  dscrHeadroom: number;
  debtToEbitda: number; debtToEbitdaHeadroom: number;
  ltv: number; ltvHeadroom: number;
  compliant: boolean; warnings: string[];
}

export function covenantCompliance(
  ebitdaValue: number,
  annualDebtService: number,
  totalDebt: number,
  assetValue: number,
  covenants: { minDscr: number; maxDebtToEbitda: number; maxLtv: number },
): CovenantResult {
  const ratio = dscr(ebitdaValue, annualDebtService);
  const debtToEbitda = ebitdaValue > 0 ? totalDebt / ebitdaValue : Infinity;
  const ltv = assetValue > 0 ? totalDebt / assetValue : Infinity;

  const warnings: string[] = [];
  if (ratio < covenants.minDscr) {
    warnings.push(`DSCR ${ratio.toFixed(2)} below ${covenants.minDscr} covenant`);
  }
  if (debtToEbitda > covenants.maxDebtToEbitda) {
    warnings.push(`Debt/EBITDA ${debtToEbitda.toFixed(1)}x exceeds ${covenants.maxDebtToEbitda}x limit`);
  }
  if (ltv > covenants.maxLtv) {
    warnings.push(`LTV ${(ltv * 100).toFixed(0)}% exceeds ${(covenants.maxLtv * 100).toFixed(0)}% limit`);
  }

  return {
    dscrHeadroom: ratio - covenants.minDscr,
    debtToEbitda,
    debtToEbitdaHeadroom: covenants.maxDebtToEbitda - debtToEbitda,
    ltv,
    ltvHeadroom: covenants.maxLtv - ltv,
    compliant: warnings.length === 0,
    warnings,
  };
}

/* ─── Earnout ───────────────────────────────────────────────────────── */

export interface EarnoutMilestone {
  label: string;
  year: number;
  metric: string;
  target: number;
  payout: number;      // cents
  probability: number; // decimal
}

/**
 * `probability` is A JUDGEMENT, not an observation. Nothing here can source it,
 * so a document quoting `expectedValue` has to say whose estimate it is — the
 * citation law applies to a probability exactly as it applies to a multiple.
 */
export function earnout(
  milestones: EarnoutMilestone[],
  discountRate: number,
): {
  expectedValue: number; maxPayout: number; pvExpected: number;
  byMilestone: (EarnoutMilestone & { pv: number; ev: number })[];
} {
  let expectedValue = 0, maxPayout = 0, pvExpected = 0;
  const byMilestone = milestones.map(m => {
    const ev = Math.round(m.payout * m.probability);
    const pv = Math.round(ev / Math.pow(1 + discountRate, m.year));
    expectedValue += ev; maxPayout += m.payout; pvExpected += pv;
    return { ...m, ev, pv };
  });
  return { expectedValue, maxPayout, pvExpected, byMilestone };
}

/* ─── DCF ───────────────────────────────────────────────────────────── */

/**
 * Gordon-growth terminal value. Returns terminalValue 0 when the discount rate
 * does not exceed terminal growth — the formula is undefined there and a
 * negative or explosive TV is not a result, it is a broken assumption.
 */
export function dcf(
  projectedFCF: number[],
  terminalGrowthRate: number,
  discountRate: number,
): { enterpriseValue: number; pvFCF: number[]; terminalValue: number; pvTerminal: number } {
  const pvFCF = projectedFCF.map((f, i) => Math.round(f / Math.pow(1 + discountRate, i + 1)));
  const lastFCF = projectedFCF[projectedFCF.length - 1] || 0;
  const terminalValue = discountRate > terminalGrowthRate
    ? Math.round((lastFCF * (1 + terminalGrowthRate)) / (discountRate - terminalGrowthRate))
    : 0;
  const pvTerminal = Math.round(terminalValue / Math.pow(1 + discountRate, projectedFCF.length));
  return {
    enterpriseValue: pvFCF.reduce((s, pv) => s + pv, 0) + pvTerminal,
    pvFCF, terminalValue, pvTerminal,
  };
}

/* ─── Display ───────────────────────────────────────────────────────── */

export function money(cents: number): string {
  if (!Number.isFinite(cents)) return '—';
  const d = Math.abs(cents) / 100;
  const s = d >= 1_000_000
    ? `$${(d / 1_000_000).toFixed(2)}M`
    : `$${Math.round(d).toLocaleString('en-US')}`;
  return cents < 0 ? `(${s})` : s;
}

export function pct(decimal: number, places = 1): string {
  return Number.isFinite(decimal) ? `${(decimal * 100).toFixed(places)}%` : '—';
}

export function mult(n: number): string {
  return Number.isFinite(n) ? `${n.toFixed(2)}x` : '—';
}

/* ─── Derivations ───────────────────────────────────────────────────── */

/**
 * Every figure this engine produces is DERIVED, not sourced, so the citation
 * law treats it the way it treats any inferred number: it needs its working
 * shown. This emits the `## Derivations` block that `house/audit.ts` looks
 * for — the same contract `screen.ts` honours with `revenue_basis`.
 *
 * A model output pasted into a client document WITHOUT this block will fail
 * the audit, and that is the intended behaviour, not an inconvenience.
 */
export function derivations(entries: { figure: string; from: string; assumption?: string }[]): string {
  const lines = entries.map(e =>
    `- **${e.figure}** — ${e.from}${e.assumption ? ` Assumption: ${e.assumption}` : ''}`,
  );
  return [
    '## Derivations',
    '',
    'Every figure below is computed, not observed. Inputs come from the deal file;',
    'assumptions are named so a reader can disagree with them specifically.',
    '',
    ...lines,
  ].join('\n');
}
