/**
 * house/projections.ts — THE LENDER PROJECTION SET, PURE
 *
 * (2026-08-17, Paul: "What about model - 3 statements, sensitivity, etc, in
 * addition to valuation? It does not hurt to make sure we have enough?")
 *
 * The audit that answered him: sensitivity, scenarios, DCF and LBO were
 * already engine modules; comps are deliberately league bands; the ONE genuine
 * gap in the modelling territory was the integrated projection — the thing an
 * SBA lender actually asks for. Monthly year-1 cash flow plus annual
 * five-year projections, tied to the REAL amortization schedule (not the
 * linear paydown `lbo()` carries for parity) and to the working-capital
 * pattern. Every piece existed in `house/deal.ts`; this module assembles
 * them into one internally consistent set, which is what "three-statement"
 * actually buys at SMB scale: not a balance sheet for its own sake, but the
 * discipline that the same drivers produce every row and an identity check
 * catches the inconsistency a hand-built spreadsheet hides.
 *
 * THE REFUSAL POSTURE (same as `wacc()` in house/capital.ts): missing drivers
 * return `{ ok: false, missing: [...] }` naming exactly what is absent. A
 * defaulted growth rate or an assumed contribution margin is an invented
 * number wearing a model's clothes, and it reaches a lender inside a package
 * that claims every figure is sourced.
 *
 * THE BEAR-FLOOR DISCIPLINE IS STRUCTURAL HERE: earnings are computed from
 * the fixed/variable split (revenue × contribution margin − fixed costs),
 * never from a margin percentage. That is what makes operating leverage
 * visible — a 20% revenue drop takes a trades business's earnings down
 * 35–50%, and a margin-haircut model cannot say so.
 *
 * TWO COVERAGE DEFINITIONS, BOTH EMITTED, NEITHER SILENT:
 *   dscrEbitda = EBITDA / debt service            (the house `dscr()` basis)
 *   dscrCash   = (EBITDA − capex − ΔWC) / debt service
 * Lenders read the first; the second is the one that predicts a covenant
 * breach in a growth year, because growth EATS cash through working capital.
 *
 * Money is CENTS (integers), rates are DECIMALS. No LLM in the math path.
 */

import { amortize, monthlyPayment, type AmortizationRow } from './deal.js';

/* ─── Drivers ───────────────────────────────────────────────────────── */

export interface ProjectionDrivers {
  /** Projected year-1 revenue, cents. */
  year1RevenueCents: number | null;
  /** Contribution margin after variable costs (direct labor, materials, fuel), decimal in (0, 1]. */
  contributionMargin: number | null;
  /** Annual fixed cost base (shop rent, office payroll, trucks, insurance, replacement-manager wage), cents. */
  fixedCostsAnnualCents: number | null;
  /** Revenue growth, decimal, applied years 2–5. A plan, not a forecast — say so on screen. */
  revenueGrowthRate: number | null;
  /** Maintenance / equipment-replacement capex per year, cents. */
  maintenanceCapexAnnualCents: number | null;
  /** Working capital as a fraction of REVENUE CHANGE, decimal ≥ 0. Growth eats cash; this is how much. */
  wcPctOfRevenue: number | null;

  /** SBA (or senior) loan. */
  loanAmountCents: number | null;
  annualRate: number | null;
  termMonths: number | null;

  /** Seller note — optional, but if an amount is given its terms are REQUIRED. */
  sellerNoteCents?: number;
  sellerNoteRate?: number;
  sellerNoteTermMonths?: number;
  /** Full-standby months (no payments), the SBA equity-injection shape. Amortizes over its term after standby ends. */
  sellerNoteStandbyMonths?: number;

  /** Twelve monthly revenue weights summing to 1. Omitted = flat, and the notes say so. */
  monthlyRevenueWeights?: number[];
  /** Cash at close after the equity injection, cents. Omitted = 0, and the notes say so. */
  openingCashCents?: number;
  /**
   * Trailing monthly revenue before close, cents — the baseline the first
   * month's working-capital swing is measured against. Omitted = year-1
   * average (flat baseline), and the notes say so.
   */
  baselineMonthlyRevenueCents?: number;
}

/* ─── Output rows ───────────────────────────────────────────────────── */

export interface MonthRow {
  month: number;              // 1–12
  revenue: number;
  ebitda: number;             // revenue × CM − fixed/12
  capex: number;
  wcChange: number;           // + means cash absorbed
  debtService: number;        // SBA + seller note actually payable this month
  fcfAfterDebtService: number;
  closingCash: number;
}

export interface YearRow {
  year: number;               // 1–5
  revenue: number;
  ebitda: number;
  capex: number;
  wcChange: number;
  debtService: number;
  dscrEbitda: number;         // EBITDA / DS — the house dscr() basis
  dscrCash: number;           // (EBITDA − capex − ΔWC) / DS
  fcfAfterDebtService: number;
  closingCash: number;
  closingLoanBalance: number; // from the real amortization schedule
  closingSellerNoteBalance: number;
}

export interface ProjectionChecks {
  /** Years whose EBITDA-basis DSCR sits under the 1.25 SBA floor. */
  dscrFloorBreachYears: number[];
  /** First month closing cash goes negative, or null. The month the deal runs out of money. */
  firstNegativeCashMonth: number | null;
  /** Minimum monthly closing cash across year 1 and the month it lands. */
  minMonthlyCash: { month: number; cash: number };
  /**
   * The identity a hand-built spreadsheet silently breaks: year-1 closing cash
   * from the annual roll must equal month-12 closing cash from the monthly
   * roll. Always true here by construction — emitted so a reader can SEE it
   * held, and so any future edit that breaks it fails a test, not a lender.
   */
  monthlyAnnualTie: boolean;
}

export interface ProjectionSet {
  ok: true;
  monthly: MonthRow[];        // 12 rows, year 1
  annual: YearRow[];          // 5 rows
  checks: ProjectionChecks;
  /** Every convention and default in force, stated. Print them with the tables. */
  notes: string[];
}

export interface ProjectionRefusal {
  ok: false;
  /** Exactly what is absent or unusable, named. Fix the inputs; do not guess. */
  missing: string[];
}

/* ─── The build ─────────────────────────────────────────────────────── */

const FLOOR = 1.25;

function need(v: number | null | undefined, name: string, missing: string[], test?: (n: number) => boolean, why?: string): number {
  if (typeof v !== 'number' || !Number.isFinite(v)) { missing.push(name); return 0; }
  if (test && !test(v)) { missing.push(`${name} (${why})`); return 0; }
  return v;
}

export function lenderProjections(d: ProjectionDrivers): ProjectionSet | ProjectionRefusal {
  const missing: string[] = [];
  const notes: string[] = [];

  const year1Revenue = need(d.year1RevenueCents, 'year1RevenueCents', missing, n => n > 0, 'must be positive');
  const cm = need(d.contributionMargin, 'contributionMargin', missing, n => n > 0 && n <= 1, 'a decimal in (0, 1]');
  const fixed = need(d.fixedCostsAnnualCents, 'fixedCostsAnnualCents', missing, n => n >= 0, 'must be ≥ 0');
  const growth = need(d.revenueGrowthRate, 'revenueGrowthRate', missing, n => n > -1, 'must be > −100%');
  const capexAnnual = need(d.maintenanceCapexAnnualCents, 'maintenanceCapexAnnualCents', missing, n => n >= 0, 'must be ≥ 0');
  const wcPct = need(d.wcPctOfRevenue, 'wcPctOfRevenue', missing, n => n >= 0, 'must be ≥ 0');
  const loan = need(d.loanAmountCents, 'loanAmountCents', missing, n => n > 0, 'must be positive');
  const rate = need(d.annualRate, 'annualRate', missing, n => n > 0 && n < 1, 'a decimal, e.g. 0.105');
  const term = need(d.termMonths, 'termMonths', missing, n => Number.isInteger(n) && n > 0, 'whole months');

  // Seller note: optional, but an amount without terms is a refusal, not a default.
  const noteAmt = d.sellerNoteCents ?? 0;
  let noteRate = 0, noteTerm = 0, standby = 0;
  if (noteAmt > 0) {
    noteRate = need(d.sellerNoteRate, 'sellerNoteRate', missing, n => n > 0 && n < 1, 'a decimal');
    noteTerm = need(d.sellerNoteTermMonths, 'sellerNoteTermMonths', missing, n => Number.isInteger(n) && n > 0, 'whole months');
    standby = d.sellerNoteStandbyMonths ?? 0;
    if (!Number.isInteger(standby) || standby < 0) missing.push('sellerNoteStandbyMonths (whole months ≥ 0)');
  }

  // Seasonality: twelve weights summing to 1, or flat with a note.
  let weights = d.monthlyRevenueWeights;
  if (weights !== undefined) {
    const sum = weights.reduce((a, b) => a + b, 0);
    if (weights.length !== 12 || Math.abs(sum - 1) > 0.001 || weights.some(w => w < 0)) {
      missing.push(`monthlyRevenueWeights (12 non-negative weights summing to 1 — got ${weights.length} summing to ${sum.toFixed(3)})`);
    }
  } else {
    weights = Array(12).fill(1 / 12);
    notes.push('Seasonality: FLAT (no monthly weights supplied). A trades business is rarely flat — supply real weights before this reaches a lender.');
  }

  if (missing.length) return { ok: false, missing };

  const openingCash = d.openingCashCents ?? 0;
  if (d.openingCashCents === undefined) {
    notes.push('Opening cash: $0 assumed (none supplied). The minimum-cash month below moves dollar-for-dollar with this.');
  }
  const baselineMonthly = d.baselineMonthlyRevenueCents ?? Math.round(year1Revenue / 12);
  if (d.baselineMonthlyRevenueCents === undefined) {
    notes.push('Working-capital baseline: year-1 average monthly revenue (no trailing figure supplied), so month-1 absorbs no step-change.');
  }
  notes.push(`Growth ${(growth * 100).toFixed(1)}% is the PLAN as entered — a convention for the lender set, not a forecast.`);
  notes.push('Coverage is emitted on two bases: dscrEbitda (EBITDA ÷ debt service, the SBA read) and dscrCash ((EBITDA − capex − ΔWC) ÷ debt service, the one that predicts a breach in a growth year).');
  notes.push('Working capital follows TRAILING-TWELVE-MONTH revenue (the %-of-revenue convention), so the monthly and annual rolls reconcile exactly. Intra-year seasonal WC swings need AR/AP-days modeling this set deliberately does not include — model them separately before a seasonal deal reaches a lender.');

  /* Debt service off the REAL schedules — never linear paydown. */
  const loanSched = amortize(loan, rate, term);
  const notePmt = noteAmt > 0 ? monthlyPayment(noteAmt, noteRate, noteTerm) : 0;
  const noteSched: AmortizationRow[] = noteAmt > 0 ? amortize(noteAmt, noteRate, noteTerm) : [];

  const loanDS = (m: number) => (m <= term ? loanSched[m - 1].payment : 0);
  // Standby months: no payment, no amortization — the schedule starts after standby.
  const noteDS = (m: number) => (noteAmt > 0 && m > standby && m - standby <= noteTerm ? notePmt : 0);
  const loanBal = (m: number) => (m <= 0 ? loan : m <= term ? loanSched[m - 1].balance : 0);
  const noteBal = (m: number) => {
    if (noteAmt <= 0) return 0;
    if (m <= standby) return noteAmt;                       // interest-free full standby, the SBA shape
    const k = m - standby;
    return k <= noteTerm ? noteSched[k - 1].balance : 0;
  };
  if (noteAmt > 0 && standby > 0) {
    notes.push(`Seller note: full standby ${standby} months (no payments, no accrual modeled) — confirm the note's actual accrual terms; an accruing standby note is a larger balloon than this shows.`);
  }

  /* Monthly year 1. WC follows TTM revenue: month m replaces one baseline
     month with rev_m in the trailing twelve, so ΔWC_m = wcPct × (rev_m −
     baseline). The twelve deltas sum to wcPct × (annualRev − 12 × baseline) —
     the annual roll's own year-1 ΔWC — which is what makes the tie exact for
     ANY seasonality weights, not just flat ones. */
  const monthly: MonthRow[] = [];
  let cash = openingCash;
  for (let m = 1; m <= 12; m++) {
    const revenue = Math.round(year1Revenue * weights[m - 1]);
    const ebitda = Math.round(revenue * cm - fixed / 12);
    const capex = Math.round(capexAnnual / 12);
    const wcChange = Math.round(wcPct * (revenue - baselineMonthly));
    const debtService = Math.round(loanDS(m) + noteDS(m));
    const fcfAfterDebtService = ebitda - capex - wcChange - debtService;
    cash += fcfAfterDebtService;
    monthly.push({ month: m, revenue, ebitda, capex, wcChange, debtService, fcfAfterDebtService, closingCash: cash });
  }

  /* Annual years 1–5, same drivers, real schedules. */
  const annual: YearRow[] = [];
  let annualCash = openingCash;
  let prevYearRev = baselineMonthly * 12;
  for (let y = 1; y <= 5; y++) {
    const revenue = Math.round(year1Revenue * Math.pow(1 + growth, y - 1));
    const ebitda = Math.round(revenue * cm - fixed);
    const capex = capexAnnual;
    const wcChange = Math.round(wcPct * (revenue - prevYearRev));
    let debtService = 0;
    for (let m = (y - 1) * 12 + 1; m <= y * 12; m++) debtService += loanDS(m) + noteDS(m);
    debtService = Math.round(debtService);
    const dscrEbitda = debtService > 0 ? ebitda / debtService : Infinity;
    const dscrCash = debtService > 0 ? (ebitda - capex - wcChange) / debtService : Infinity;
    const fcfAfterDebtService = ebitda - capex - wcChange - debtService;
    annualCash += fcfAfterDebtService;
    annual.push({
      year: y, revenue, ebitda, capex, wcChange, debtService,
      dscrEbitda, dscrCash, fcfAfterDebtService, closingCash: annualCash,
      closingLoanBalance: loanBal(y * 12), closingSellerNoteBalance: noteBal(y * 12),
    });
    prevYearRev = revenue;
  }

  /* Checks — the identities and floors a lender will find if we do not. */
  const dscrFloorBreachYears = annual.filter(r => Number.isFinite(r.dscrEbitda) && r.dscrEbitda < FLOOR).map(r => r.year);
  const firstNeg = monthly.find(r => r.closingCash < 0);
  const minRow = monthly.reduce((a, b) => (b.closingCash < a.closingCash ? b : a), monthly[0]);
  // Year-1 tie: the monthly roll and the annual roll must land on the same cash.
  // They share drivers but round independently (weights vs the annual line), so
  // the tie is asserted within the rounding budget of 12 monthly roundings.
  const tieDelta = Math.abs(monthly[11].closingCash - annual[0].closingCash);
  const monthlyAnnualTie = tieDelta <= 12 * 3; // ≤ 3 cents of rounding per monthly row

  return {
    ok: true, monthly, annual,
    checks: {
      dscrFloorBreachYears,
      firstNegativeCashMonth: firstNeg ? firstNeg.month : null,
      minMonthlyCash: { month: minRow.month, cash: minRow.closingCash },
      monthlyAnnualTie,
    },
    notes,
  };
}
