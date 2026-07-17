/**
 * DEFINITIVE reference implementation — conformance edition.
 *
 * An INDEPENDENT implementation of the published (snake_case) model contract,
 * derived from each model's authored specification (algorithm + Conventions),
 * NOT from the private runtime. It shares no code with the smbX application.
 * A conforming implementation exposes exactly this shape:
 *
 *     execute(modelId, input) -> { status, outputs, missingInputs }
 *
 * The conformance harness runs the published cases and the boundary-refusal
 * cases against it. Two independent implementations (this one and the smbX
 * runtime that generated the expected values) agreeing is what proves the
 * specification is unambiguous.
 *
 * License: MIT. Money is integer cents. Precision follows the Conventions
 * chapter: rates/ratios round half-to-even to 4 decimals at the output
 * boundary; monetary means round to the nearest cent.
 */

export type Status = 'complete' | 'needs_inputs';
export interface ExecuteResult { status: Status; outputs: Record<string, unknown>; missingInputs: string[] }

/* ── Conventions: numeric precision ───────────────────────────────────── */
export function roundHalfEven(value: number, places: number): number {
  const factor = 10 ** places;
  const scaled = value * factor;
  const floor = Math.floor(scaled);
  const diff = scaled - floor;
  const EPS = 1e-9;
  let r: number;
  if (Math.abs(diff - 0.5) < EPS) r = floor % 2 === 0 ? floor : floor + 1;
  else r = Math.round(scaled);
  return r / factor;
}
const cents = (n: number) => Math.round(n); // monetary mean → nearest cent
const num = (v: unknown): number | null => {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const bool = (v: unknown): boolean | null => {
  if (typeof v === 'boolean') return v;
  if (v === null || v === undefined || v === '') return null;
  const s = String(v).trim().toLowerCase();
  if (['true', 'yes', '1', 'y'].includes(s)) return true;
  if (['false', 'no', '0', 'n'].includes(s)) return false;
  return null;
};
const needs = (fields: Record<string, unknown>): string[] =>
  Object.entries(fields).filter(([, v]) => v === null || v === undefined || Number.isNaN(v)).map(([k]) => k);

/* ── Published constants (Conventions §Constants; all public spec data) ── */
const HSR_SIZE_OF_TRANSACTION_CENTS = 133_900_000 * 100; // $133.9M (FTC 2026, eff. 2026-02-17)
const HSR_AUTO_REPORTABLE_CENTS = 535_500_000 * 100;     // $535.5M
const SBA_7A_MAX_LOAN_CENTS = 5_000_000 * 100;           // $5M
const SBA_EQUITY_INJECTION_FLOOR = 0.10;                 // SBA SOP 50 10 8
const SBA_DSCR_FLOOR = 1.15;
/** M232 transfer-tax regime table (anchor states; public spec data). */
const TRANSFER_TAX_REGIMES: Record<string, { controllingInterestTax: boolean; thresholdPct: number | null; aggregationYears: number | null; reassessmentOnControlChange: boolean }> = {
  NY: { controllingInterestTax: true, thresholdPct: 50, aggregationYears: 3, reassessmentOnControlChange: false },
  CA: { controllingInterestTax: true, thresholdPct: 50, aggregationYears: null, reassessmentOnControlChange: true },
  DE: { controllingInterestTax: false, thresholdPct: null, aggregationYears: null, reassessmentOnControlChange: false },
  TX: { controllingInterestTax: false, thresholdPct: null, aggregationYears: null, reassessmentOnControlChange: false },
};

/* ── Models (independent implementations of the published contract) ────── */

/** M109 — Working-capital peg (MODEL.STRUCT.NWC.PEG.v1). */
function m109(input: Record<string, any>): ExecuteResult {
  const monthly = Array.isArray(input.monthly_nwc_cents)
    ? input.monthly_nwc_cents.map(num).filter((n): n is number => n !== null).map(cents)
    : [];
  if (!monthly.length) return { status: 'needs_inputs', outputs: {}, missingInputs: ['monthly_nwc_cents'] };
  const sum = monthly.reduce((a, b) => a + b, 0);
  return {
    status: 'complete',
    outputs: {
      peg_cents: cents(sum / monthly.length),
      observed_months: monthly.length,
      low_cents: Math.min(...monthly),
      high_cents: Math.max(...monthly),
    },
    missingInputs: [],
  };
}

/** M119 — SBA 7(a) financing screen (MODEL.LBO.SBA.v1). */
function m119(input: Record<string, any>): ExecuteResult {
  const price = num(input.purchase_price_cents), cf = num(input.cash_flow_cents), eq = num(input.buyer_equity_cents), ds = num(input.annual_debt_service_cents);
  const missing = needs({ purchase_price_cents: price, cash_flow_cents: cf, buyer_equity_cents: eq, annual_debt_service_cents: ds });
  if (missing.length) return { status: 'needs_inputs', outputs: {}, missingInputs: missing };
  const equityPct = eq! / price!;
  const dscr = cf! / ds!;
  return {
    status: 'complete',
    outputs: {
      buyer_equity_pct: roundHalfEven(equityPct, 4),
      dscr: roundHalfEven(dscr, 4),
      meets_sba_equity_floor: equityPct >= SBA_EQUITY_INJECTION_FLOOR,
      meets_sba_dscr_floor: dscr >= SBA_DSCR_FLOOR,
      max_7a_loan_cents: SBA_7A_MAX_LOAN_CENTS,
    },
    missingInputs: [],
  };
}

/** M128 — HSR size screen (MODEL.HSR.TRIAGE.v1). */
function m128(input: Record<string, any>): ExecuteResult {
  const ev = num(input.enterprise_value_cents);
  if (ev === null) return { status: 'needs_inputs', outputs: {}, missingInputs: ['enterprise_value_cents'] };
  const evc = cents(ev);
  return {
    status: 'complete',
    outputs: {
      size_of_transaction_cents: evc,
      threshold_cents: HSR_SIZE_OF_TRANSACTION_CENTS,
      hsr_size_triggered: evc >= HSR_SIZE_OF_TRANSACTION_CENTS,
      auto_reportable_cents: HSR_AUTO_REPORTABLE_CENTS,
    },
    missingInputs: [],
  };
}

/** M186 — §382 NOL limitation (MODEL.TAX.382.NOL_LIMIT.v1). */
function m186(input: Record<string, any>): ExecuteResult {
  const value = num(input.loss_corporation_value_cents), rate = num(input.long_term_tax_exempt_rate), nol = num(input.nol_carryforward_cents);
  const missing = needs({ loss_corporation_value_cents: value, long_term_tax_exempt_rate: rate });
  if (missing.length) return { status: 'needs_inputs', outputs: {}, missingInputs: missing };
  const annualLimit = cents(value! * rate!);
  return {
    status: 'complete',
    outputs: {
      loss_corporation_value_cents: cents(value!),
      long_term_tax_exempt_rate: roundHalfEven(rate!, 4),
      annual_section_382_limitation_cents: annualLimit,
      nol_carryforward_cents: nol === null ? null : cents(nol),
      estimated_years_to_use_nol: nol === null || annualLimit <= 0 ? null : Math.ceil(nol / annualLimit),
    },
    missingInputs: [],
  };
}

/** M232 — Controlling-interest transfer-tax & reassessment screen
 *  (MODEL.RE.CITT_REASSESSMENT_SCREEN.v1). Boundary-refusal model: routes the
 *  taxability conclusion to counsel (defer_to_counsel) on a positive screen. */
function m232(input: Record<string, any>): ExecuteResult {
  const state = String(input.state ?? '').toUpperCase();
  const isEntity = bool(input.is_entity_transfer);
  const transferPct = num(input.transfer_pct);
  const missing = needs({ state: state || null, is_entity_transfer: isEntity, transfer_pct: transferPct });
  if (missing.length) return { status: 'needs_inputs', outputs: {}, missingInputs: missing };
  const cumulative = num(input.cumulative_related_transfers_pct) ?? transferPct ?? 0;
  const mereChange = bool(input.mere_change_exemption_claimed) ?? false;
  const relatedSteps = bool(input.related_steps_planned) ?? false;
  const regime = TRANSFER_TAX_REGIMES[state];
  if (!regime) {
    return { status: 'complete', outputs: { state, regime_known: false, defer_to_counsel: true }, missingInputs: [] };
  }
  const threshold = regime.thresholdPct;
  const cittTriggered = !!(regime.controllingInterestTax && isEntity && threshold !== null && Math.max(transferPct!, cumulative) >= threshold);
  const reassessmentTriggered = !!(regime.reassessmentOnControlChange && isEntity && (transferPct! > 50 || cumulative > 50));
  const stepTransactionRisk = mereChange && relatedSteps;
  return {
    status: 'complete',
    outputs: {
      state,
      regime_known: true,
      controlling_interest_threshold_pct: threshold,
      citt_screen_triggered: cittTriggered,
      reassessment_screen_triggered: reassessmentTriggered,
      aggregation_years: regime.aggregationYears,
      step_transaction_risk: stepTransactionRisk,
      defer_to_counsel: cittTriggered || reassessmentTriggered || stepTransactionRisk,
    },
    missingInputs: [],
  };
}

/* ── Registry + dispatch ──────────────────────────────────────────────── */
const MODELS: Record<string, (input: Record<string, any>) => ExecuteResult> = {
  M109: m109, M119: m119, M128: m128, M186: m186, M232: m232,
};
export const COVERED_MODELS = Object.keys(MODELS);

/** The conformance entry point. `modelId` is a DEFINITIVE slot id (M###). */
export function execute(modelId: string, input: Record<string, any>): ExecuteResult {
  const fn = MODELS[modelId];
  if (!fn) throw new Error(`reference implementation does not cover ${modelId}`);
  return fn(input ?? {});
}
