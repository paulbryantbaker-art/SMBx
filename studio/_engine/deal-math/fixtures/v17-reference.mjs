// METHODOLOGY_V17 §5.0 — reference implementations.
// These are NOT the engine. They exist to parity-check the vendored engine.
// Formulas transcribed verbatim from V17 canon; anything not spelled out in
// V17 is marked STANDARD (textbook definition) and must be reconciled against
// the engine at vendoring time.

// §5.1 SDE (L1/L2)
export function sde({ net_income, owner_salary = 0, depreciation = 0, amortization = 0, interest = 0, one_time_expenses = 0, verified_addbacks = 0 }) {
  return net_income + owner_salary + depreciation + amortization + interest + one_time_expenses + verified_addbacks;
}

// §5.2 Adjusted EBITDA (L3-L6)
export function adjustedEbitda({ net_income, depreciation = 0, amortization = 0, interest = 0, taxes = 0, verified_addbacks = 0, non_recurring_income = 0 }) {
  return net_income + depreciation + amortization + interest + taxes + verified_addbacks - non_recurring_income;
}

// §4.5.4 mortgage amortization: Monthly = P × [r(1+r)^n] / [(1+r)^n − 1]
export function monthlyPayment(principal, annualRate, termYears) {
  if (principal === 0) return 0;
  const r = annualRate / 12, n = termYears * 12;
  if (r === 0) return principal / n;
  const f = Math.pow(1 + r, n);
  return principal * (r * f) / (f - 1);
}

export function annualDebtService(loans) {
  // loans: [{principal, rate, termYears}]
  return loans.reduce((s, l) => s + monthlyPayment(l.principal, l.rate, l.termYears) * 12, 0);
}

// §5.3 DSCR = EBITDA / Annual_Debt_Service
export function dscr(ebitda, annualDebt) {
  return annualDebt === 0 ? Infinity : ebitda / annualDebt;
}
export const SBA_DSCR_MIN = 1.25;
export const CONVENTIONAL_DSCR_MIN = 1.5;

// §4.5.4 risk scoring matrix (DSCR × LTV)
export function riskScore(d, ltv) {
  if (d >= 1.5 && ltv <= 0.7) return { score: "LOW", recommendation: "Approve" };
  if (d >= 1.25 && ltv <= 0.8) return { score: "MEDIUM", recommendation: "Approve with conditions" };
  if (d >= 1.15 && ltv <= 0.9) return { score: "HIGH", recommendation: "Enhanced review required" };
  return { score: "CRITICAL", recommendation: "Decline" };
}

// §5.4 Arbitrage spread (L5)
export function arbitrageSpread(exitMultiple, entryMultiple, ebitda) {
  return (exitMultiple - entryMultiple) * ebitda;
}

// Valuation range = earnings basis × [low, high] multiple. STANDARD.
export function valuationRange(basisAmount, multLow, multHigh) {
  return { low: basisAmount * multLow, high: basisAmount * multHigh, mid: basisAmount * (multLow + multHigh) / 2 };
}

// MOIC = total distributions / invested equity. STANDARD.
export function moic(totalDistributions, investedEquity) {
  return investedEquity === 0 ? Infinity : totalDistributions / investedEquity;
}

// IRR on annual cash flows (cf[0] typically negative). STANDARD — bisection, robust.
export function irr(cashflows, lo = -0.9999, hi = 10) {
  const npv = (r) => cashflows.reduce((s, cf, t) => s + cf / Math.pow(1 + r, t), 0);
  let fLo = npv(lo), fHi = npv(hi);
  if (fLo * fHi > 0) return NaN;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2, fMid = npv(mid);
    if (Math.abs(fMid) < 1e-9) return mid;
    if (fLo * fMid < 0) { hi = mid; fHi = fMid; } else { lo = mid; fLo = fMid; }
  }
  return (lo + hi) / 2;
}

// Amortization schedule (annual rollup). STANDARD, derived from monthlyPayment.
export function amortizationSchedule(principal, annualRate, termYears) {
  const pmt = monthlyPayment(principal, annualRate, termYears);
  const rows = [];
  let bal = principal;
  for (let y = 1; y <= termYears; y++) {
    let int = 0, prin = 0;
    for (let m = 0; m < 12; m++) {
      const i = bal * annualRate / 12;
      const p = Math.min(pmt - i, bal);
      int += i; prin += p; bal -= p;
    }
    rows.push({ year: y, interest: int, principal: prin, balance: Math.max(bal, 0) });
  }
  return { monthlyPayment: pmt, rows };
}

// Earnout expected value = base + Σ amount × probability. STANDARD.
export function earnoutExpectedValue(basePrice, tranches) {
  const expected = tranches.reduce((s, t) => s + t.amount * t.probability, 0);
  const max = tranches.reduce((s, t) => s + t.amount, 0);
  return { base: basePrice, expectedEarnout: expected, expectedTotal: basePrice + expected, maxTotal: basePrice + max };
}
