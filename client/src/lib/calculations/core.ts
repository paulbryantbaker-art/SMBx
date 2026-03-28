/**
 * Core Financial Calculations — Pure functions, no API calls.
 * All money values in CENTS (integers). All rates as decimals (0.10 = 10%).
 * Same inputs always produce same outputs. <16ms execution.
 */

// ─── SDE / EBITDA ───────────────────────────────────────────────────

export interface AddBack {
  label: string;
  amount: number; // cents
  verified: boolean;
  category: 'owner_comp' | 'depreciation' | 'amortization' | 'interest' | 'one_time' | 'discretionary' | 'other';
}

export function calculateSDE(
  netIncome: number,
  ownerSalary: number,
  addBacks: AddBack[],
): { sde: number; breakdown: { label: string; amount: number }[] } {
  const breakdown = [
    { label: 'Net Income', amount: netIncome },
    { label: "Owner's Salary", amount: ownerSalary },
    ...addBacks.map(ab => ({ label: ab.label, amount: ab.amount })),
  ];
  const sde = breakdown.reduce((sum, item) => sum + item.amount, 0);
  return { sde, breakdown };
}

export function calculateEBITDA(
  netIncome: number,
  depreciation: number,
  amortization: number,
  interest: number,
  taxes: number,
  addBacks: AddBack[],
  nonRecurringIncome: number = 0,
): { ebitda: number; breakdown: { label: string; amount: number }[] } {
  const verifiedAddBacks = addBacks.filter(ab => ab.verified);
  const breakdown = [
    { label: 'Net Income', amount: netIncome },
    { label: 'Depreciation', amount: depreciation },
    { label: 'Amortization', amount: amortization },
    { label: 'Interest', amount: interest },
    { label: 'Taxes', amount: taxes },
    ...verifiedAddBacks.map(ab => ({ label: ab.label, amount: ab.amount })),
    ...(nonRecurringIncome > 0 ? [{ label: 'Less: Non-Recurring Income', amount: -nonRecurringIncome }] : []),
  ];
  const ebitda = breakdown.reduce((sum, item) => sum + item.amount, 0);
  return { ebitda, breakdown };
}

// ─── Valuation ──────────────────────────────────────────────────────

export const LEAGUE_MULTIPLES: Record<string, { metric: 'SDE' | 'EBITDA'; min: number; max: number }> = {
  L1: { metric: 'SDE', min: 2.0, max: 3.5 },
  L2: { metric: 'SDE', min: 3.0, max: 5.0 },
  L3: { metric: 'EBITDA', min: 4.0, max: 6.0 },
  L4: { metric: 'EBITDA', min: 6.0, max: 8.0 },
  L5: { metric: 'EBITDA', min: 8.0, max: 12.0 },
  L6: { metric: 'EBITDA', min: 10.0, max: 15.0 },
};

export interface ValuationResult {
  low: number;   // cents
  mid: number;   // cents
  high: number;  // cents
  metric: 'SDE' | 'EBITDA';
  earnings: number;
  multipleMin: number;
  multipleMid: number;
  multipleMax: number;
  league: string;
}

export function calculateValuation(
  earnings: number,
  league: string,
  multipleOverride?: { min: number; max: number },
): ValuationResult {
  const leagueData = LEAGUE_MULTIPLES[league] || LEAGUE_MULTIPLES.L1;
  const min = multipleOverride?.min ?? leagueData.min;
  const max = multipleOverride?.max ?? leagueData.max;
  const mid = (min + max) / 2;

  return {
    low: Math.round(earnings * min),
    mid: Math.round(earnings * mid),
    high: Math.round(earnings * max),
    metric: leagueData.metric,
    earnings,
    multipleMin: min,
    multipleMid: mid,
    multipleMax: max,
    league,
  };
}

export function calculateBlendedValuation(
  methods: { label: string; value: number; weight: number }[],
): { blended: number; methods: typeof methods } {
  const totalWeight = methods.reduce((sum, m) => sum + m.weight, 0);
  if (totalWeight === 0) return { blended: 0, methods };
  const blended = Math.round(methods.reduce((sum, m) => sum + m.value * (m.weight / totalWeight), 0));
  return { blended, methods };
}

// ─── DSCR & Debt Service ────────────────────────────────────────────

export function calculateMonthlyPayment(principal: number, annualRate: number, termMonths: number): number {
  if (annualRate === 0) return Math.round(principal / termMonths);
  const r = annualRate / 12;
  const n = termMonths;
  return Math.round(principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
}

export function calculateDSCR(annualEarnings: number, annualDebtService: number): number {
  if (annualDebtService === 0) return Infinity;
  return annualEarnings / annualDebtService;
}

export interface DSCRResult {
  dscr: number;
  monthlyPayment: number;
  annualDebtService: number;
  eligible: boolean;     // SBA threshold 1.25
  conventional: boolean; // conventional threshold 1.50
  rating: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export function calculateDSCRFull(
  ebitda: number,
  loanAmount: number,
  annualRate: number,
  termMonths: number,
): DSCRResult {
  const monthlyPayment = calculateMonthlyPayment(loanAmount, annualRate, termMonths);
  const annualDebtService = monthlyPayment * 12;
  const dscr = calculateDSCR(ebitda, annualDebtService);

  let rating: DSCRResult['rating'] = 'CRITICAL';
  if (dscr >= 1.50) rating = 'LOW';
  else if (dscr >= 1.25) rating = 'MEDIUM';
  else if (dscr >= 1.15) rating = 'HIGH';

  return {
    dscr,
    monthlyPayment,
    annualDebtService,
    eligible: dscr >= 1.25,
    conventional: dscr >= 1.50,
    rating,
  };
}

// ─── SBA Financing ──────────────────────────────────────────────────

export interface SBAResult {
  loanAmount: number;
  downPayment: number;
  sellerNote: number;
  equityRequired: number;
  monthlyPayment: number;
  annualDebtService: number;
  dscr: number;
  eligible: boolean;
  maxLoanCapacity: number;
  ltv: number;
  totalProjectCost: number;
  amortization: AmortizationRow[];
}

export interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export function calculateSBAFinancing(
  purchasePrice: number,
  earnings: number,
  downPaymentPct: number,
  interestRate: number,
  termMonths: number,
  sellerNotePct: number = 0,
  workingCapital: number = 0,
): SBAResult {
  const totalProjectCost = purchasePrice + workingCapital;
  const downPayment = Math.round(totalProjectCost * downPaymentPct);
  const sellerNote = Math.round(purchasePrice * sellerNotePct);
  const loanAmount = totalProjectCost - downPayment - sellerNote;
  const equityRequired = downPayment;

  const monthlyPayment = calculateMonthlyPayment(loanAmount, interestRate, termMonths);
  const annualDebtService = monthlyPayment * 12;
  const dscr = calculateDSCR(earnings, annualDebtService);
  const maxLoanCapacity = Math.round((earnings / 1.25) * (termMonths / 12));
  const ltv = totalProjectCost > 0 ? loanAmount / totalProjectCost : 0;

  const amortization = calculateAmortization(loanAmount, interestRate, termMonths);

  return {
    loanAmount, downPayment, sellerNote, equityRequired,
    monthlyPayment, annualDebtService, dscr,
    eligible: dscr >= 1.25 && purchasePrice <= 500000000, // $5M cap in cents
    maxLoanCapacity, ltv, totalProjectCost, amortization,
  };
}

export function calculateAmortization(principal: number, annualRate: number, termMonths: number): AmortizationRow[] {
  const rows: AmortizationRow[] = [];
  let balance = principal;
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, termMonths);
  const r = annualRate / 12;

  for (let m = 1; m <= termMonths && balance > 0; m++) {
    const interest = Math.round(balance * r);
    const principalPaid = Math.min(monthlyPayment - interest, balance);
    balance = Math.max(0, balance - principalPaid);
    rows.push({ month: m, payment: monthlyPayment, principal: principalPaid, interest, balance });
  }
  return rows;
}

// ─── IRR / MOIC (LBO) ──────────────────────────────────────────────

export function calculateIRR(cashFlows: number[], guess: number = 0.1): number {
  // Newton-Raphson method
  let rate = guess;
  for (let i = 0; i < 100; i++) {
    let npv = 0;
    let dnpv = 0;
    for (let t = 0; t < cashFlows.length; t++) {
      const pv = cashFlows[t] / Math.pow(1 + rate, t);
      npv += pv;
      dnpv -= t * cashFlows[t] / Math.pow(1 + rate, t + 1);
    }
    if (Math.abs(npv) < 0.01) return rate;
    if (dnpv === 0) break;
    rate -= npv / dnpv;
  }
  return rate;
}

export function calculateMOIC(exitEquity: number, initialEquity: number): number {
  if (initialEquity === 0) return 0;
  return exitEquity / initialEquity;
}

// ─── LBO / Pro Forma ────────────────────────────────────────────────

export interface LBOAssumptions {
  purchasePrice: number;     // cents (enterprise value)
  ebitda: number;            // cents (Year 0)
  revenueGrowthRate: number; // decimal
  ebitdaMargin: number;      // decimal (or margin expansion rate)
  exitMultiple: number;
  holdPeriod: number;        // years
  seniorDebtPct: number;     // % of EV
  seniorRate: number;
  seniorTerm: number;        // months
  mezDebtPct: number;
  mezRate: number;
  mezTerm: number;           // months
  revenue?: number;          // cents (Year 0)
}

export interface LBOResult {
  entryMultiple: number;
  exitValue: number;
  equityInvested: number;
  exitEquity: number;
  irr: number;
  moic: number;
  cashOnCash: number;
  paybackYears: number;
  dscrByYear: number[];
  proForma: ProFormaYear[];
  sourcesUses: { sources: { label: string; amount: number }[]; uses: { label: string; amount: number }[] };
}

export interface ProFormaYear {
  year: number;
  revenue: number;
  ebitda: number;
  debtService: number;
  fcf: number;
  debtBalance: number;
  cumulativeFcf: number;
}

export function calculateLBO(a: LBOAssumptions): LBOResult {
  const entryMultiple = a.ebitda > 0 ? a.purchasePrice / a.ebitda : 0;
  const seniorDebt = Math.round(a.purchasePrice * a.seniorDebtPct);
  const mezDebt = Math.round(a.purchasePrice * a.mezDebtPct);
  const equityInvested = a.purchasePrice - seniorDebt - mezDebt;
  const revenue0 = a.revenue || (a.ebitdaMargin > 0 ? Math.round(a.ebitda / a.ebitdaMargin) : a.ebitda * 5);

  const seniorMonthly = calculateMonthlyPayment(seniorDebt, a.seniorRate, a.seniorTerm);
  const mezMonthly = a.mezDebtPct > 0 ? calculateMonthlyPayment(mezDebt, a.mezRate, a.mezTerm) : 0;
  const totalAnnualDebt = (seniorMonthly + mezMonthly) * 12;

  const proForma: ProFormaYear[] = [];
  const dscrByYear: number[] = [];
  let cumulativeFcf = 0;
  let paybackYears = a.holdPeriod;
  let seniorBalance = seniorDebt;
  let mezBalance = mezDebt;

  for (let y = 1; y <= a.holdPeriod; y++) {
    const revenue = Math.round(revenue0 * Math.pow(1 + a.revenueGrowthRate, y));
    const ebitda = Math.round(revenue * a.ebitdaMargin);

    // Simplified: amortize debt linearly for paydown tracking
    const seniorPrincipal = a.seniorTerm > 0 ? Math.round(seniorDebt / (a.seniorTerm / 12)) : 0;
    const mezPrincipal = a.mezTerm > 0 ? Math.round(mezDebt / (a.mezTerm / 12)) : 0;
    seniorBalance = Math.max(0, seniorBalance - seniorPrincipal);
    mezBalance = Math.max(0, mezBalance - mezPrincipal);
    const debtBalance = seniorBalance + mezBalance;

    const debtService = totalAnnualDebt;
    const fcf = ebitda - debtService;
    cumulativeFcf += fcf;

    if (cumulativeFcf >= equityInvested && paybackYears === a.holdPeriod) {
      paybackYears = y;
    }

    const dscr = debtService > 0 ? ebitda / debtService : Infinity;
    dscrByYear.push(dscr);

    proForma.push({ year: y, revenue, ebitda, debtService, fcf, debtBalance, cumulativeFcf });
  }

  // Exit
  const exitEbitda = proForma[proForma.length - 1]?.ebitda || a.ebitda;
  const exitValue = Math.round(exitEbitda * a.exitMultiple);
  const remainingDebt = proForma[proForma.length - 1]?.debtBalance || 0;
  const exitEquity = exitValue - remainingDebt + cumulativeFcf;

  // Cash flows for IRR: initial equity out, then FCF each year, exit equity at end
  const cashFlows = [-equityInvested];
  for (let y = 0; y < a.holdPeriod - 1; y++) {
    cashFlows.push(proForma[y]?.fcf || 0);
  }
  cashFlows.push((proForma[proForma.length - 1]?.fcf || 0) + exitValue - remainingDebt);

  const irr = calculateIRR(cashFlows);
  const moic = calculateMOIC(exitEquity, equityInvested);
  const cashOnCash = equityInvested > 0 ? cumulativeFcf / equityInvested : 0;

  return {
    entryMultiple, exitValue, equityInvested, exitEquity,
    irr, moic, cashOnCash, paybackYears, dscrByYear, proForma,
    sourcesUses: {
      sources: [
        { label: 'Senior Debt', amount: seniorDebt },
        ...(mezDebt > 0 ? [{ label: 'Mezzanine Debt', amount: mezDebt }] : []),
        { label: 'Equity', amount: equityInvested },
      ],
      uses: [
        { label: 'Enterprise Value', amount: a.purchasePrice },
      ],
    },
  };
}

// ─── Sensitivity Matrix ─────────────────────────────────────────────

export function buildSensitivityMatrix(
  baseAssumptions: LBOAssumptions,
  var1Key: keyof LBOAssumptions,
  var1Values: number[],
  var2Key: keyof LBOAssumptions,
  var2Values: number[],
  outputMetric: 'irr' | 'moic' | 'dscr',
): { matrix: number[][]; var1Values: number[]; var2Values: number[]; var1Key: string; var2Key: string } {
  const matrix: number[][] = [];

  for (const v1 of var1Values) {
    const row: number[] = [];
    for (const v2 of var2Values) {
      const assumptions = { ...baseAssumptions, [var1Key]: v1, [var2Key]: v2 };
      const result = calculateLBO(assumptions);
      if (outputMetric === 'irr') row.push(result.irr);
      else if (outputMetric === 'moic') row.push(result.moic);
      else row.push(result.dscrByYear[0] || 0);
    }
    matrix.push(row);
  }

  return { matrix, var1Values, var2Values, var1Key: String(var1Key), var2Key: String(var2Key) };
}

// ─── Free Cash Flow ─────────────────────────────────────────────────

export function calculateFCF(
  ebitda: number,
  taxes: number,
  capex: number,
  workingCapitalChange: number,
): { fcf: number; breakdown: { label: string; amount: number }[] } {
  const breakdown = [
    { label: 'EBITDA', amount: ebitda },
    { label: 'Less: Taxes', amount: -taxes },
    { label: 'Less: CapEx', amount: -capex },
    { label: 'Less: ΔWorking Capital', amount: -workingCapitalChange },
  ];
  const fcf = ebitda - taxes - capex - workingCapitalChange;
  return { fcf, breakdown };
}

export function calculateFCFConversion(fcf: number, ebitda: number): number {
  return ebitda > 0 ? fcf / ebitda : 0;
}

// ─── Working Capital ────────────────────────────────────────────────

export function calculateWorkingCapitalPeg(
  monthlyData: { month: string; currentAssets: number; currentLiabilities: number }[],
): { peg: number; average: number; monthlyWC: { month: string; wc: number }[]; variance: number } {
  const monthlyWC = monthlyData.map(m => ({
    month: m.month,
    wc: m.currentAssets - m.currentLiabilities,
  }));
  const total = monthlyWC.reduce((sum, m) => sum + m.wc, 0);
  const average = monthlyWC.length > 0 ? Math.round(total / monthlyWC.length) : 0;
  const peg = average; // Typically trailing 12-month average

  const variance = monthlyWC.length > 0
    ? Math.round(Math.sqrt(monthlyWC.reduce((sum, m) => sum + Math.pow(m.wc - average, 2), 0) / monthlyWC.length))
    : 0;

  return { peg, average, monthlyWC, variance };
}

// ─── Covenant Compliance ────────────────────────────────────────────

export interface CovenantResult {
  dscrHeadroom: number;   // actual - required
  debtToEbitda: number;
  debtToEbitdaHeadroom: number;
  ltv: number;
  ltvHeadroom: number;
  compliant: boolean;
  warnings: string[];
}

export function calculateCovenantCompliance(
  ebitda: number,
  annualDebtService: number,
  totalDebt: number,
  assetValue: number,
  covenants: { minDscr: number; maxDebtToEbitda: number; maxLtv: number },
): CovenantResult {
  const dscr = calculateDSCR(ebitda, annualDebtService);
  const debtToEbitda = ebitda > 0 ? totalDebt / ebitda : Infinity;
  const ltv = assetValue > 0 ? totalDebt / assetValue : Infinity;

  const warnings: string[] = [];
  if (dscr < covenants.minDscr) warnings.push(`DSCR ${dscr.toFixed(2)} below ${covenants.minDscr} covenant`);
  if (debtToEbitda > covenants.maxDebtToEbitda) warnings.push(`Debt/EBITDA ${debtToEbitda.toFixed(1)}x exceeds ${covenants.maxDebtToEbitda}x limit`);
  if (ltv > covenants.maxLtv) warnings.push(`LTV ${(ltv * 100).toFixed(0)}% exceeds ${(covenants.maxLtv * 100).toFixed(0)}% limit`);

  return {
    dscrHeadroom: dscr - covenants.minDscr,
    debtToEbitda,
    debtToEbitdaHeadroom: covenants.maxDebtToEbitda - debtToEbitda,
    ltv,
    ltvHeadroom: covenants.maxLtv - ltv,
    compliant: warnings.length === 0,
    warnings,
  };
}

// ─── Tax Impact ─────────────────────────────────────────────────────

export const FEDERAL_RATES = {
  longTermCapGains: 0.20,
  niit: 0.038,       // Net Investment Income Tax
  effectiveCapGains: 0.238, // 20% + 3.8%
  ordinaryMax: 0.37,
  corporate: 0.21,
  deprecRecapture: 0.25, // §1245 max
  section197: 15,     // years for goodwill amortization
} as const;

export interface TaxAssetClass {
  class: string;
  label: string;
  allocated: number; // cents
  basis: number;     // cents
  sellerRate: number;
  buyerBenefit: string;
}

export function calculateAssetSaleTax(
  allocations: TaxAssetClass[],
  stateTaxRate: number = 0,
): { totalFederalTax: number; totalStateTax: number; netProceeds: number; byClass: (TaxAssetClass & { tax: number })[] } {
  let totalFederalTax = 0;
  const byClass = allocations.map(a => {
    const gain = Math.max(0, a.allocated - a.basis);
    const tax = Math.round(gain * a.sellerRate);
    totalFederalTax += tax;
    return { ...a, tax };
  });

  const totalAllocated = allocations.reduce((sum, a) => sum + a.allocated, 0);
  const totalStateTax = Math.round(totalAllocated * stateTaxRate);
  const netProceeds = totalAllocated - totalFederalTax - totalStateTax;

  return { totalFederalTax, totalStateTax, netProceeds, byClass };
}

export function calculateStockSaleTax(
  salePrice: number,
  sellerBasis: number,
  stateTaxRate: number = 0,
): { capitalGain: number; federalTax: number; stateTax: number; netProceeds: number } {
  const capitalGain = Math.max(0, salePrice - sellerBasis);
  const federalTax = Math.round(capitalGain * FEDERAL_RATES.effectiveCapGains);
  const stateTax = Math.round(capitalGain * stateTaxRate);
  const netProceeds = salePrice - federalTax - stateTax;
  return { capitalGain, federalTax, stateTax, netProceeds };
}

export function calculateGoodwillAmortization(goodwill: number, marginalRate: number): {
  annualDeduction: number; annualTaxSavings: number; totalSavings: number;
} {
  const annualDeduction = Math.round(goodwill / 15);
  const annualTaxSavings = Math.round(annualDeduction * marginalRate);
  return { annualDeduction, annualTaxSavings, totalSavings: annualTaxSavings * 15 };
}

// ─── Cap Table / Dilution ───────────────────────────────────────────

export interface CapTableRound {
  label: string;
  investment: number;  // cents
  preMoneyVal: number; // cents
  optionPoolPct: number; // decimal
  liquidationPref: number; // 1.0 = 1x
  participating: boolean;
}

export interface OwnershipRow {
  stakeholder: string;
  shares: number;
  ownership: number; // decimal
  invested: number;  // cents
}

export function calculateDilution(
  foundersShares: number,
  rounds: CapTableRound[],
): { rows: OwnershipRow[]; postMoneyVal: number; totalShares: number } {
  let totalShares = foundersShares;
  const rows: OwnershipRow[] = [
    { stakeholder: 'Founders', shares: foundersShares, ownership: 1.0, invested: 0 },
  ];
  let postMoneyVal = 0;

  for (const round of rounds) {
    // Option pool expansion (pre-money)
    if (round.optionPoolPct > 0) {
      const poolShares = Math.round(totalShares * round.optionPoolPct / (1 - round.optionPoolPct));
      totalShares += poolShares;
      rows.push({ stakeholder: `Option Pool (${round.label})`, shares: poolShares, ownership: 0, invested: 0 });
    }

    // New investor shares
    postMoneyVal = round.preMoneyVal + round.investment;
    const pricePerShare = round.preMoneyVal / totalShares;
    const newShares = pricePerShare > 0 ? Math.round(round.investment / pricePerShare) : 0;
    totalShares += newShares;

    rows.push({
      stakeholder: `${round.label} Investor`,
      shares: newShares,
      ownership: 0,
      invested: round.investment,
    });
  }

  // Recalculate ownership percentages
  for (const row of rows) {
    row.ownership = totalShares > 0 ? row.shares / totalShares : 0;
  }

  return { rows, postMoneyVal, totalShares };
}

export function calculateExitWaterfall(
  capTable: OwnershipRow[],
  rounds: CapTableRound[],
  exitValue: number,
): { distributions: { stakeholder: string; amount: number; moic: number }[] } {
  // Simplified waterfall: liquidation preferences first, then pro-rata
  let remaining = exitValue;
  const distributions = capTable.map(row => ({ stakeholder: row.stakeholder, amount: 0, moic: 0 }));

  // 1. Liquidation preferences (investors only, in reverse order)
  for (let i = rounds.length - 1; i >= 0; i--) {
    const round = rounds[i];
    const investorIdx = capTable.findIndex(r => r.stakeholder.includes(round.label) && r.stakeholder.includes('Investor'));
    if (investorIdx === -1) continue;

    const prefAmount = Math.round(round.investment * round.liquidationPref);
    const distributed = Math.min(prefAmount, remaining);
    distributions[investorIdx].amount = distributed;
    remaining -= distributed;
  }

  // 2. Remaining distributed pro-rata to all (or just common if non-participating)
  if (remaining > 0) {
    const totalShares = capTable.reduce((sum, r) => sum + r.shares, 0);
    for (let i = 0; i < capTable.length; i++) {
      const proRata = totalShares > 0 ? Math.round(remaining * (capTable[i].shares / totalShares)) : 0;
      distributions[i].amount += proRata;
    }
  }

  // Calculate MOIC
  for (let i = 0; i < distributions.length; i++) {
    const invested = capTable[i].invested;
    distributions[i].moic = invested > 0 ? distributions[i].amount / invested : 0;
  }

  return { distributions };
}

// ─── Earnout ────────────────────────────────────────────────────────

export interface EarnoutMilestone {
  year: number;
  target: number;      // cents (revenue or EBITDA target)
  payout: number;       // cents
  probability: number;  // decimal
}

export function calculateEarnout(
  milestones: EarnoutMilestone[],
  discountRate: number,
): { expectedValue: number; maxPayout: number; pvExpected: number; byMilestone: (EarnoutMilestone & { pv: number; ev: number })[] } {
  let expectedValue = 0;
  let maxPayout = 0;
  let pvExpected = 0;

  const byMilestone = milestones.map(m => {
    const ev = Math.round(m.payout * m.probability);
    const pv = Math.round(ev / Math.pow(1 + discountRate, m.year));
    expectedValue += ev;
    maxPayout += m.payout;
    pvExpected += pv;
    return { ...m, ev, pv };
  });

  return { expectedValue, maxPayout, pvExpected, byMilestone };
}

// ─── Installment Sale (§453) ────────────────────────────────────────

export function calculateInstallmentSale(
  sellingPrice: number,
  adjustedBasis: number,
  downPayment: number,
  annualPayments: number,
  numYears: number,
  capGainsRate: number = FEDERAL_RATES.effectiveCapGains,
): { grossProfitRatio: number; yearlyTax: { year: number; payment: number; taxableGain: number; tax: number }[] } {
  const grossProfit = sellingPrice - adjustedBasis;
  const grossProfitRatio = sellingPrice > 0 ? grossProfit / sellingPrice : 0;

  const yearlyTax = [];

  // Year 0: down payment
  const dpTaxable = Math.round(downPayment * grossProfitRatio);
  yearlyTax.push({ year: 0, payment: downPayment, taxableGain: dpTaxable, tax: Math.round(dpTaxable * capGainsRate) });

  // Years 1-N: installments
  for (let y = 1; y <= numYears; y++) {
    const taxable = Math.round(annualPayments * grossProfitRatio);
    yearlyTax.push({ year: y, payment: annualPayments, taxableGain: taxable, tax: Math.round(taxable * capGainsRate) });
  }

  return { grossProfitRatio, yearlyTax };
}

// ─── DCF ────────────────────────────────────────────────────────────

export function calculateDCF(
  projectedFCF: number[], // cents per year
  terminalGrowthRate: number,
  discountRate: number,
): { enterpriseValue: number; pvFCF: number[]; terminalValue: number; pvTerminal: number } {
  const pvFCF = projectedFCF.map((fcf, i) =>
    Math.round(fcf / Math.pow(1 + discountRate, i + 1))
  );

  const lastFCF = projectedFCF[projectedFCF.length - 1] || 0;
  const terminalValue = discountRate > terminalGrowthRate
    ? Math.round(lastFCF * (1 + terminalGrowthRate) / (discountRate - terminalGrowthRate))
    : 0;

  const pvTerminal = Math.round(terminalValue / Math.pow(1 + discountRate, projectedFCF.length));
  const enterpriseValue = pvFCF.reduce((sum, pv) => sum + pv, 0) + pvTerminal;

  return { enterpriseValue, pvFCF, terminalValue, pvTerminal };
}

// ─── Formatting helpers ─────────────────────────────────────────────

export function centsToDisplay(cents: number): string {
  const d = Math.abs(cents) / 100;
  const sign = cents < 0 ? '-' : '';
  if (d >= 1_000_000) return `${sign}$${(d / 1_000_000).toFixed(1)}M`;
  if (d >= 1_000) return `${sign}$${Math.round(d / 1_000).toLocaleString()}K`;
  return `${sign}$${d.toLocaleString()}`;
}

export function pctDisplay(decimal: number, decimals: number = 1): string {
  return `${(decimal * 100).toFixed(decimals)}%`;
}

export function multDisplay(n: number): string {
  return `${n.toFixed(1)}x`;
}
