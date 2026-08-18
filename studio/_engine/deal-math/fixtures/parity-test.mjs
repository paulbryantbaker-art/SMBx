// Parity: the engine the adapter resolves (vendored engine once present,
// reference until then) must satisfy the V17 canon cases.
// Run at every vendoring: node fixtures/parity-test.mjs
import { engine as E, ENGINE_LABEL } from "../harness/engine-adapter.mjs";

console.log(`engine under test: ${ENGINE_LABEL}`);
const approx = (a, b, tol = 1e-6) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
let pass = 0, fail = 0;
const check = (name, actual, expected, tol) => {
  const ok = typeof expected === "string" ? actual === expected : approx(actual, expected, tol);
  ok ? pass++ : (fail++, console.error(`FAIL ${name}: got ${actual}, expected ${expected}`));
};

check("SDE", E.sde({ net_income: 180000, owner_salary: 90000, depreciation: 22000, amortization: 3000, interest: 8000, one_time_expenses: 12000, verified_addbacks: 15000 }), 330000);
check("EBITDA", E.adjustedEbitda({ net_income: 900000, depreciation: 150000, amortization: 50000, interest: 120000, taxes: 280000, verified_addbacks: 60000, non_recurring_income: 40000 }), 1520000);
check("DSCR", E.dscr(400000, 320000), 1.25);
check("monthly payment", Math.round(E.monthlyPayment(1000000, 0.105, 10)), 13493, 1e-3);
check("risk LOW", E.riskScore(1.6, 0.65).score, "LOW");
check("risk CRITICAL", E.riskScore(1.1, 0.95).score, "CRITICAL");
check("arbitrage", E.arbitrageSpread(8, 5.5, 2000000), 5000000);
check("MOIC", E.moic(2400000, 1000000), 2.4);
check("IRR", E.irr([-1000, 1200]), 0.2, 1e-6);
{
  const v = E.valuationRange(330000, 2.8, 3.4);
  check("valuation", v.high - v.low, 198000);
}

console.log(`parity-test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
