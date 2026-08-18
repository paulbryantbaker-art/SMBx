// Canon tests: hand-computed expected values for METHODOLOGY_V17 §5.0.
// Run: node fixtures/canon-tests.mjs
// parity-test.mjs runs the SAME cases through the vendored engine.
import * as R from "./v17-reference.mjs";

const approx = (a, b, tol = 1e-6) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
let pass = 0, fail = 0;
function check(name, actual, expected, tol) {
  const ok = typeof expected === "string" ? actual === expected : approx(actual, expected, tol);
  ok ? pass++ : (fail++, console.error(`FAIL ${name}: got ${actual}, expected ${expected}`));
}

// §5.1 SDE — pest-control style L1 case
check("SDE basic", R.sde({ net_income: 180000, owner_salary: 90000, depreciation: 22000, amortization: 3000, interest: 8000, one_time_expenses: 12000, verified_addbacks: 15000 }), 330000);
check("SDE no addbacks", R.sde({ net_income: 100000 }), 100000);

// §5.2 Adjusted EBITDA — L3 case with non-recurring income backed out
check("EBITDA", R.adjustedEbitda({ net_income: 900000, depreciation: 150000, amortization: 50000, interest: 120000, taxes: 280000, verified_addbacks: 60000, non_recurring_income: 40000 }), 1520000);

// §4.5.4 monthly payment — $1,000,000 @ 10.5%, 10yr: r=0.00875, n=120
// P×r(1+r)^n/((1+r)^n−1) = 13,493.499... (computed independently below)
{
  const r = 0.105 / 12, n = 120, f = Math.pow(1 + r, n);
  const expected = 1000000 * (r * f) / (f - 1);
  check("monthlyPayment closed form", R.monthlyPayment(1000000, 0.105, 10), expected);
  check("monthlyPayment magnitude", Math.round(R.monthlyPayment(1000000, 0.105, 10)), 13493, 1e-3);
}
check("monthlyPayment zero rate", R.monthlyPayment(120000, 0, 10), 1000);

// §5.3 DSCR — EBITDA 400k, debt service 320k → 1.25 exactly (SBA threshold)
check("DSCR at SBA threshold", R.dscr(400000, 320000), 1.25);
check("DSCR sba pass", R.dscr(400000, 320000) >= R.SBA_DSCR_MIN ? "pass" : "fail", "pass");
check("DSCR conventional fail", R.dscr(400000, 320000) >= R.CONVENTIONAL_DSCR_MIN ? "pass" : "fail", "fail");

// §4.5.4 risk matrix — all four bands
check("risk LOW", R.riskScore(1.6, 0.65).score, "LOW");
check("risk MEDIUM", R.riskScore(1.3, 0.75).score, "MEDIUM");
check("risk HIGH", R.riskScore(1.2, 0.85).score, "HIGH");
check("risk CRITICAL", R.riskScore(1.1, 0.95).score, "CRITICAL");

// §5.4 arbitrage spread — (8−5.5)×2M = 5M
check("arbitrage spread", R.arbitrageSpread(8, 5.5, 2000000), 5000000);

// valuation range — SDE 330k × 2.8–3.4x
{
  const v = R.valuationRange(330000, 2.8, 3.4);
  check("valuation low", v.low, 924000);
  check("valuation high", v.high, 1122000);
  check("valuation mid", v.mid, 1023000);
}

// MOIC — 2.4M back on 1M in → 2.4x
check("MOIC", R.moic(2400000, 1000000), 2.4);

// IRR — invest 1000, receive 1200 in 1 year → 20%
check("IRR one period", R.irr([-1000, 1200]), 0.2, 1e-6);
// IRR — invest 1000, 5 years of 0 then 2000 → (2)^(1/5)−1 = 14.87%
check("IRR terminal only", R.irr([-1000, 0, 0, 0, 0, 2000]), Math.pow(2, 1 / 5) - 1, 1e-6);

// amortization — schedule fully pays down
{
  const s = R.amortizationSchedule(500000, 0.105, 10);
  check("amort final balance", s.rows[9].balance, 0, 1e-6);
  const totalPrin = s.rows.reduce((x, r) => x + r.principal, 0);
  check("amort principal sums to loan", totalPrin, 500000, 1e-6);
}

// earnout — base 1M + tranches 300k@60% + 200k@30% → expected 1.24M, max 1.5M
{
  const e = R.earnoutExpectedValue(1000000, [{ amount: 300000, probability: 0.6 }, { amount: 200000, probability: 0.3 }]);
  check("earnout expected", e.expectedTotal, 1240000);
  check("earnout max", e.maxTotal, 1500000);
}

console.log(`canon-tests: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
