/**
 * house/scenarios.ts — SCENARIO ANALYSIS, PURE
 *
 * (2026-08-16, Paul: "we need to put extra focus on deal valuation and model
 * and scenario analysis." The where doc already settled WHERE it lives —
 * `house/where.ts` 'valuation': "in-app scenario modeling is going to be much
 * more advantageous than a Google Sheet — plus that is where the data room and
 * financial docs will be housed." This file is the judgement layer that makes
 * the in-app surface possible without putting arithmetic in a React file.)
 *
 * WHAT A SCENARIO IS HERE. One set of LBO assumptions, stressed along two
 * named axes — revenue growth and exit multiple — because those are the two
 * assumptions a practitioner argues about at a board. Everything else (the
 * client's borrowing costs, the price, the margin) is held constant across
 * scenarios ON PURPOSE: a stress test that moves five things at once cannot
 * say which one moved the answer.
 *
 * ── THE THREE CONTRACTS THIS FILE HONOURS ────────────────────────────────
 *
 * 1. REFUSE, DON'T DEFAULT — the `wacc()` posture. `assemble()` returns
 *    `{ok: false, missing: [...]}` naming what is absent. The expensive
 *    invented numbers here are the MARGIN (lbo() would silently fall back to
 *    `ebitda * 5` revenue — a 20% margin nobody chose) and the RATES (a house
 *    guess where the client's actual term sheet should be). Both refuse.
 *
 * 2. RATES COME FROM THE CLIENT'S STACK. The `rates` input is
 *    `lboRatesFrom()`'s mapping — the same stack that produces the WACC. A
 *    scenario run on invented debt costs is a different deal wearing this
 *    one's name.
 *
 * 3. AN UNCONVERGED IRR DOES NOT PRINT. `irrLabel()` returns null when
 *    Newton-Raphson never converged, and the delta helpers refuse when either
 *    endpoint is unprintable. house/deal.ts added the `converged` flag for
 *    exactly this; a UI that ignored it would print a silently wrong rate.
 *
 * ── WHAT IS DERIVED VS. WHAT IS A CONVENTION ─────────────────────────────
 * Derived (from real inputs, basis stated): margin = EBITDA / revenue; base
 * exit multiple = entry multiple (no multiple expansion — you exit at what
 * you paid unless you argue otherwise). Conventions (stated constants, not
 * forecasts): the 5-year hold, the ±2pp growth / ±1.0x exit stress width.
 * REQUIRED FROM THE PRACTITIONER (no default of any kind): the growth plan.
 * Zero growth is a real position; it must be typed, not assumed.
 *
 * PURE by house doctrine: no db, no API key, no env, no fs, no clock, no
 * Math.random. MONEY IS CENTS (integers), RATES ARE DECIMALS.
 */

import { lbo, type LBOAssumptions, type LBOResult } from './deal.js';
import type { LboRateMapping } from './capital.js';

/* ─── The stress conventions ────────────────────────────────────────── */

/** House modelling horizon. A convention, not a forecast — say so on screen. */
export const HOLD_YEARS_DEFAULT = 5;

/** Stress width on the growth plan, in decimal (±2 percentage points). */
export const GROWTH_STRESS = 0.02;

/** Stress width on the exit multiple (±1.0x). */
export const EXIT_STRESS = 1.0;

export type ScenarioId = 'conservative' | 'base' | 'stretch';

export interface ScenarioDef {
  id: ScenarioId;
  label: string;
  /** Added to the growth plan (decimal). */
  growthDelta: number;
  /** Added to the base exit multiple. */
  exitDelta: number;
  note: string;
}

/**
 * The set is symmetric and NAMED so no scenario can pretend to be a forecast.
 * The width is a house convention; the note travels to the screen verbatim.
 */
export const SCENARIOS: readonly ScenarioDef[] = [
  {
    id: 'conservative', label: 'Conservative',
    growthDelta: -GROWTH_STRESS, exitDelta: -EXIT_STRESS,
    note: 'Growth 2pp under plan · exit 1.0x under base',
  },
  {
    id: 'base', label: 'Base',
    growthDelta: 0, exitDelta: 0,
    note: 'The plan as entered',
  },
  {
    id: 'stretch', label: 'Stretch',
    growthDelta: GROWTH_STRESS, exitDelta: EXIT_STRESS,
    note: 'Growth 2pp over plan · exit 1.0x over base',
  },
];

/* ─── Assembly — inputs to a base case, or a named refusal ──────────── */

export interface AssembleInputs {
  /** Agreed or asking price, cents. */
  purchasePriceCents: number | null;
  /** Cents. The projection base. */
  ebitdaCents: number | null;
  /** Cents. Needed to DERIVE the margin; refuse rather than invent one. */
  revenueCents: number | null;
  /**
   * The practitioner's revenue growth plan, decimal. REQUIRED — null refuses.
   * Flat (0) is a legitimate plan, but it has to be typed.
   */
  growthPct: number | null;
  /** Override for the derived exit-at-entry base. */
  exitMultiple?: number | null;
  /** Override for the house 5-year hold. */
  holdYears?: number | null;
  /** `lboRatesFrom()` output — the client's actual stack — or null. */
  rates: LboRateMapping | null;
}

export interface AssembledBase {
  assumptions: LBOAssumptions;
  /** One line per input, saying where it came from — the workings. */
  basis: string[];
}

export function assemble(
  i: AssembleInputs,
): { ok: true; base: AssembledBase } | { ok: false; missing: string[] } {
  const missing: string[] = [];

  const price = i.purchasePriceCents;
  if (!isPos(price)) {
    missing.push('a purchase price — the agreed number, or the asking price until there is one');
  }
  const ebitda = i.ebitdaCents;
  if (!isPos(ebitda)) {
    missing.push('EBITDA on the deal — the projection base');
  }
  const revenue = i.revenueCents;
  if (!isPos(revenue)) {
    missing.push('revenue on the deal — it derives the EBITDA margin that projects the pro forma; without it the model would invent a margin');
  }
  if (typeof i.growthPct !== 'number' || !Number.isFinite(i.growthPct)) {
    missing.push('a revenue growth plan — flat (0%) is a real plan, but it has to be yours, not a default');
  }
  if (!i.rates) {
    missing.push("the client's capital stack — scenario debt service runs on their actual borrowing costs, not house guesses (add it under Capital stack)");
  }

  /* Margin sanity rides on both being present. EBITDA above revenue is a data
     error, not a modelling choice — refuse rather than project it. */
  if (isPos(ebitda) && isPos(revenue) && (ebitda as number) > (revenue as number)) {
    missing.push('a consistent EBITDA and revenue — EBITDA on file exceeds revenue, which projects a margin over 100%');
  }

  if (missing.length) return { ok: false, missing };

  const p = price as number;
  const e = ebitda as number;
  const r = revenue as number;
  const growth = i.growthPct as number;
  const rates = i.rates as LboRateMapping;

  const margin = e / r;
  const entry = p / e;
  const exitMult = isPos(i.exitMultiple) ? (i.exitMultiple as number) : entry;
  const hold = isPos(i.holdYears) ? Math.round(i.holdYears as number) : HOLD_YEARS_DEFAULT;

  const basis = [
    `EBITDA margin ${(margin * 100).toFixed(1)}% — derived from the deal's EBITDA / revenue.`,
    isPos(i.exitMultiple)
      ? `Exit multiple ${exitMult.toFixed(2)}x — your override.`
      : `Exit multiple ${exitMult.toFixed(2)}x — exit at entry; no multiple expansion assumed.`,
    isPos(i.holdYears)
      ? `${hold}-year hold — your override.`
      : `${hold}-year hold — house convention.`,
    `Growth ${(growth * 100).toFixed(1)}% — your plan.`,
    `Senior ${(rates.seniorDebtPct * 100).toFixed(1)}% of EV at ${(rates.seniorRate * 100).toFixed(2)}%, mezz ${(rates.mezDebtPct * 100).toFixed(1)}% at ${(rates.mezRate * 100).toFixed(2)}% — from the client's stack.`,
  ];

  return {
    ok: true,
    base: {
      assumptions: {
        purchasePrice: p,
        ebitda: e,
        revenue: r,
        revenueGrowthRate: growth,
        ebitdaMargin: margin,
        exitMultiple: exitMult,
        holdPeriod: hold,
        seniorDebtPct: rates.seniorDebtPct,
        seniorRate: rates.seniorRate,
        seniorTerm: rates.seniorTerm,
        mezDebtPct: rates.mezDebtPct,
        mezRate: rates.mezRate,
        mezTerm: rates.mezTerm,
      },
      basis,
    },
  };
}

/* ─── Running the set ───────────────────────────────────────────────── */

export interface ScenarioRun {
  def: ScenarioDef;
  assumptions: LBOAssumptions;
  /** Null when the stressed exit multiple fell to zero or below. */
  result: LBOResult | null;
  /** Why `result` is null, when it is. */
  blocked: string | null;
}

export function runScenarios(base: LBOAssumptions): ScenarioRun[] {
  return SCENARIOS.map(def => {
    const exitMultiple = base.exitMultiple + def.exitDelta;
    if (exitMultiple <= 0) {
      return {
        def,
        assumptions: base,
        result: null,
        blocked: `The −${EXIT_STRESS.toFixed(1)}x stress takes the exit multiple to ${exitMultiple.toFixed(2)}x — the convention does not fit a deal priced under ${EXIT_STRESS.toFixed(1)}x earnings.`,
      };
    }
    const assumptions: LBOAssumptions = {
      ...base,
      revenueGrowthRate: base.revenueGrowthRate + def.growthDelta,
      exitMultiple,
    };
    return { def, assumptions, result: lbo(assumptions), blocked: null };
  });
}

/* ─── Printing rules ────────────────────────────────────────────────── */

/** The IRR as a string, or null when it never converged — never a wrong rate. */
export function irrLabel(r: LBOResult | null): string | null {
  if (!r || !r.irrConverged || !Number.isFinite(r.irr)) return null;
  return `${(r.irr * 100).toFixed(1)}%`;
}

/**
 * The delta against base in basis points, as a signed string. Null when
 * either endpoint is unprintable — a delta between a real number and a
 * non-converged one is not a number.
 */
export function irrDeltaLabel(baseRun: LBOResult | null, run: LBOResult | null): string | null {
  if (!baseRun?.irrConverged || !run?.irrConverged) return null;
  if (!Number.isFinite(baseRun.irr) || !Number.isFinite(run.irr)) return null;
  const bp = Math.round((run.irr - baseRun.irr) * 10000);
  if (bp === 0) return 'no change';
  return `${bp > 0 ? '+' : '−'}${Math.abs(bp).toLocaleString('en-US')}bp`;
}

export function moicLabel(r: LBOResult | null): string | null {
  if (!r || !Number.isFinite(r.moic)) return null;
  return `${r.moic.toFixed(2)}x`;
}

/** Worst-year coverage — the number a lender reads first. Null when no years. */
export function minDscr(r: LBOResult | null): number | null {
  if (!r || r.dscrByYear.length === 0) return null;
  const finite = r.dscrByYear.filter(d => Number.isFinite(d));
  if (finite.length === 0) return null;
  return Math.min(...finite);
}

/* ─── The sensitivity grid ──────────────────────────────────────────── */

/**
 * Rows are growth (plan ±2pp, 1pp steps), columns are exit multiple
 * (base ±1.0x, 0.5x steps) — the same two axes the scenarios stress, so the
 * grid is the scenarios' neighbourhood, not a different model.
 *
 * Cells keep the `converged` flag; `house/deal.ts.sensitivityMatrix()` is NOT
 * used here because it flattens the IRR to a bare number and a non-converged
 * cell would print as real. That function stays as-is (canvas parity).
 */
export interface SensitivityCell {
  irr: number;
  converged: boolean;
}

export interface SensitivityGrid {
  /** Decimal growth rates, ascending. */
  rows: number[];
  /** Exit multiples, ascending. Stress columns ≤0 are dropped, and `dropped` says so. */
  cols: number[];
  /** `cells[rowIdx][colIdx]`. */
  cells: SensitivityCell[][];
  /** Index of the base case in rows/cols. */
  baseRow: number;
  baseCol: number;
  /** Present when low-multiple columns were dropped as impossible. */
  dropped: string | null;
}

export function sensitivityGrid(base: LBOAssumptions): SensitivityGrid {
  const rows = [-2, -1, 0, 1, 2].map(s => base.revenueGrowthRate + s * 0.01);
  const allCols = [-2, -1, 0, 1, 2].map(s => base.exitMultiple + s * 0.5);
  const cols = allCols.filter(m => m > 0);
  const droppedCount = allCols.length - cols.length;

  const cells = rows.map(g =>
    cols.map(m => {
      const r = lbo({ ...base, revenueGrowthRate: g, exitMultiple: m });
      return { irr: r.irr, converged: r.irrConverged };
    }),
  );

  return {
    rows, cols, cells,
    baseRow: 2,
    baseCol: cols.indexOf(base.exitMultiple),
    dropped: droppedCount > 0
      ? `${droppedCount} column${droppedCount === 1 ? '' : 's'} below a 0x exit multiple dropped — not a scenario, an impossibility.`
      : null,
  };
}

/* ─── The honest footer, exported so the screen prints the same words ── */

export const SCENARIO_ORDERING =
  'Three cases stress the two assumptions argued about most — revenue growth (±2pp) and ' +
  'exit multiple (±1.0x) — and hold everything else constant, so a moved answer names its mover. ' +
  'The widths are house conventions, not forecasts. Debt service runs on the client’s own ' +
  'stack; an IRR that failed to converge shows as unavailable rather than as a number.';

/* ─── util ──────────────────────────────────────────────────────────── */

function isPos(v: number | null | undefined): boolean {
  return typeof v === 'number' && Number.isFinite(v) && v > 0;
}
