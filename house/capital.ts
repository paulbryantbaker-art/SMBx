/**
 * house/capital.ts — THE CAPITAL STACK AND THE COST OF CAPITAL, PURE
 *
 * Paul, 2026-08-15: *"we want the client to tell us their capital stack and
 * borrow costs so we can update WACC and we should update the prime rate /
 * What about in the LBO model?"*
 *
 * WHY THIS FILE EXISTS. The cost of capital is currently stated in FIVE places
 * in this repo and no two of them agree. Measured, not remembered:
 *
 *   1. `server/services/capitalStackEngine.ts`  `PRIME_RATE = 7.50`, a bare
 *      const with the comment "update periodically". It builds a stack and
 *      renders each layer's rate as a STRING ("9.75% (Prime + 2.25%)"), so
 *      nothing downstream can do arithmetic with it.
 *   2. `server/services/marketDataService.ts`   fetches FRED `PRIME`, falls
 *      back to **8.5**. That is 100bp away from (1), in the same codebase,
 *      and neither file knows the other exists.
 *   3. `server/services/deterministicAnalysisEngine.ts:397`  the DCF discounts
 *      at `wacc_pct ?? 0.14` — a house guess, wholly disconnected from how the
 *      deal is actually being financed.
 *   4. `client/src/components/models/DCFModel.tsx:124`  the canvas DCF defaults
 *      the same concept to **0.10**. 400bp from (3), on the same deal.
 *   5. `house/deal.ts` `lbo()`  takes `seniorRate` and `mezRate` as free
 *      inputs, defaulted in the canvas to 0.08 and nothing.
 *
 * So one deal can carry four different discount rates depending on which
 * surface you opened, and the DCF's rate has no relationship to the financing
 * the client actually has. Paul's instruction fixes the root cause rather than
 * the symptoms: **the client tells us the stack, and WACC becomes an OUTPUT of
 * that stack instead of a number somebody typed.**
 *
 * WHAT THIS FILE REFUSES TO DO — and this is the whole design.
 * It never invents a rate. Every function that cannot compute returns
 * `{ ok: false, missing: [...] }` naming exactly what is absent, the same
 * posture `bandFor` takes in `house/valuation.ts` and `figuresNotIn` takes in
 * `house/audit.ts`. A defaulted discount rate is the most expensive invented
 * number in this practice: it does not look invented, it moves enterprise
 * value by tens of percent, and it reaches a client inside a document that
 * claims every figure is sourced.
 *
 * WACC AND THE LBO'S RATES ARE DIFFERENT NUMBERS FROM ONE SOURCE.
 * The obvious reading of Paul's question is "make the LBO use WACC too." That
 * would be a real modelling error, so it is worth stating plainly:
 *
 *   · WACC discounts UNLEVERED free cash flow to enterprise value. It blends
 *     debt and equity and it takes the tax shield on the debt leg. It is a
 *     valuation input.
 *   · The LBO's `seniorRate` / `mezRate` are the ACTUAL COUPONS on the actual
 *     tranches. They size debt service, which drives DSCR and paydown. They
 *     are cash mechanics.
 *   · An LBO does not use WACC at all. It solves for equity IRR, and equity
 *     cash flows are already levered — discounting them at WACC would
 *     double-count the leverage.
 *
 * They are the same SOURCE (the client's stack) and different USES. So
 * `wacc()` and `lboRatesFrom()` both read one `Stack` and produce different
 * things from it. That is the consolidation Paul is asking for, done without
 * collapsing two concepts into one.
 *
 * PURE by house doctrine: no db, no API key, no env, no filesystem, NO CLOCK,
 * no Math.random. Staleness therefore takes `today` as an argument — a rate
 * index that reads the wall clock could not be tested and could not be run
 * identically by the app and a Cowork session.
 *
 * MONEY IS CENTS (integers). RATES ARE DECIMALS (0.0975 = 9.75%).
 */

/* ─── What a layer is ───────────────────────────────────────────────── */

/**
 * The sources this practice actually sees, IoI to close. Deliberately not a
 * free string: `isDebt` reads this, and a caller who could tag preferred
 * equity as debt would silently claim a tax shield that does not exist.
 */
export type SourceKind =
  | 'sba-7a'
  | 'sba-504'
  | 'senior-bank'
  | 'unitranche'
  | 'abl-revolver'
  | 'mezzanine'
  | 'seller-note'
  | 'earnout'
  | 'preferred'
  | 'sponsor-equity'
  | 'buyer-equity'
  | 'rollover-equity';

export const SOURCE_KINDS: readonly SourceKind[] = [
  'sba-7a', 'sba-504', 'senior-bank', 'unitranche', 'abl-revolver',
  'mezzanine', 'seller-note', 'earnout', 'preferred',
  'sponsor-equity', 'buyer-equity', 'rollover-equity',
];

/**
 * Debt or equity, by kind. Three of these are worth their own sentence:
 *
 *  · `preferred` is EQUITY. It walks like debt (a coupon, a liquidation
 *    preference) and the coupon is a dividend, not interest, so it carries no
 *    tax shield. Treating it as debt overstates the shield and understates
 *    WACC — a flattering error, which is the kind that survives review.
 *  · `earnout` is DEBT-SHAPED contingent consideration. It sits here because
 *    it is a claim on the business ahead of equity, but see `EARNOUT_NOTE` —
 *    its inclusion in WACC is a judgement, not a fact.
 *  · `rollover-equity` is equity and it is the SELLER'S. Its cost is the same
 *    cost of equity the buyer's carries; it is not free money because nobody
 *    wrote a cheque for it.
 */
const KIND_CLASS: Record<SourceKind, 'debt' | 'equity'> = {
  'sba-7a': 'debt',
  'sba-504': 'debt',
  'senior-bank': 'debt',
  'unitranche': 'debt',
  'abl-revolver': 'debt',
  'mezzanine': 'debt',
  'seller-note': 'debt',
  'earnout': 'debt',
  'preferred': 'equity',
  'sponsor-equity': 'equity',
  'buyer-equity': 'equity',
  'rollover-equity': 'equity',
};

export function isDebt(kind: SourceKind): boolean {
  return KIND_CLASS[kind] === 'debt';
}

export const EARNOUT_NOTE =
  'An earnout is contingent and probability-weighted, so putting its full face '
  + 'amount in the stack overstates the capital committed. Include it only at '
  + 'the expected value the deal model uses, and say so in the workings.';

export const SOURCE_LABEL: Record<SourceKind, string> = {
  'sba-7a': 'SBA 7(a)',
  'sba-504': 'SBA 504',
  'senior-bank': 'Senior bank debt',
  'unitranche': 'Unitranche',
  'abl-revolver': 'ABL revolver',
  'mezzanine': 'Mezzanine',
  'seller-note': 'Seller note',
  'earnout': 'Earnout (expected value)',
  'preferred': 'Preferred equity',
  'sponsor-equity': 'Sponsor equity',
  'buyer-equity': 'Buyer equity',
  'rollover-equity': 'Rollover equity',
};

/** A floating layer prices off an index, so a prime move reprices it. */
export interface Floating {
  index: IndexName;
  /** decimal, e.g. 0.0275 for Prime + 2.75% */
  spreadPct: number;
}

export interface StackLayer {
  kind: SourceKind;
  /** Optional override for the display name — "Regions Bank term loan". */
  label?: string;
  amountCents: number;
  /**
   * The all-in rate the client quotes, as a decimal. On a floating layer this
   * may be omitted and `floating` used instead; if BOTH are present the fixed
   * `ratePct` wins and the resolution says so, because a signed term sheet
   * beats an index arithmetic we did ourselves.
   */
  ratePct?: number;
  floating?: Floating;
  termMonths?: number;
  /** Free note that travels into the workings — "standby, no P&I for 24mo". */
  note?: string;
}

export interface Stack {
  layers: StackLayer[];
  /**
   * What the stack is funding, in cents. Required: a stack that does not foot
   * to the price is the single most common data-entry error here, and it is
   * invisible in a WACC because WACC normalises by the total either way.
   */
  purchasePriceCents: number;
}

/* ─── The rate index, and why it is loud about provenance ───────────── */

export type IndexName = 'prime' | 'sofr';

export interface RateIndexValue {
  /** decimal, or null when this practice is not carrying a value at all. */
  pct: number | null;
  /** ISO date the value was verified against its source. null = never. */
  asOf: string | null;
  /** Where it came from. null = unknown provenance. */
  source: string | null;
}

/**
 * THE INDEX VALUES, WITH THEIR PROVENANCE ATTACHED.
 *
 * Paul asked to "update the prime rate", and the honest first step is to say
 * what is actually known. The repo carries two prime rates — 7.50 in
 * `capitalStackEngine.ts` and an 8.5 fallback in `marketDataService.ts` — with
 * no date and no source on either. Neither can be verified from inside this
 * codebase, and writing a plausible number here with a plausible date would be
 * exactly the fabrication the citation law exists to stop.
 *
 * So `prime` carries 7.50 forward as the value the engine has been using, with
 * `asOf: null` and `source: null` — MARKED UNVERIFIED. Everything downstream
 * reports that: `indexStatus()` returns `'unverified'`, and any WACC that
 * consumed it puts the flag in its own workings. The number keeps working; it
 * just stops pretending to be sourced.
 *
 * `sofr` carries no value at all, because inventing one would be worse than
 * having none. A layer that floats off SOFR resolves to `missing` until
 * someone supplies it.
 *
 * TO UPDATE: set `pct`, `asOf` (the date you looked) and `source` (FRED
 * DPRIME / the WSJ print / the client's own term sheet) in one edit. The
 * client's term sheet is the best source of the three, and when the client has
 * given their actual rate the index is not consulted at all.
 */
export const RATE_INDEX: Record<IndexName, RateIndexValue> = {
  prime: { pct: 0.0750, asOf: null, source: null },
  sofr: { pct: null, asOf: null, source: null },
};

export type IndexStatus = 'unverified' | 'fresh' | 'aging' | 'stale' | 'absent';

/** Past this many days a verified index is `aging`; past the second, `stale`. */
export const INDEX_AGING_DAYS = 45;
export const INDEX_STALE_DAYS = 120;

/**
 * How much to trust an index value. `today` is an argument because this file
 * has no clock — see the header. Pass an ISO date.
 *
 * The states are deliberately not a boolean. "Unverified" and "stale" are
 * different problems: the first has never been checked, the second was right
 * once. A caller that collapsed them would report a number carried over from
 * an unknown date as merely old.
 */
export function indexStatus(v: RateIndexValue, today: string): {
  status: IndexStatus; days: number | null; note: string;
} {
  if (v.pct == null) {
    return {
      status: 'absent', days: null,
      note: 'No value carried for this index. Supply it, or price the layer off the client’s own quoted rate.',
    };
  }
  if (!v.asOf) {
    return {
      status: 'unverified', days: null,
      note: 'Carried forward with no date and no source. Usable as an indication; never quote it to a client as the market rate.',
    };
  }
  const days = daysBetween(v.asOf, today);
  if (days == null) {
    return { status: 'unverified', days: null, note: 'asOf is not a readable ISO date.' };
  }
  if (days >= INDEX_STALE_DAYS) {
    return { status: 'stale', days, note: `Verified ${days} days ago. Re-check before this reaches a document.` };
  }
  if (days >= INDEX_AGING_DAYS) {
    return { status: 'aging', days, note: `Verified ${days} days ago.` };
  }
  return { status: 'fresh', days, note: `Verified ${days} days ago.` };
}

/** Whole days from `a` to `b`, both ISO. null if either is unreadable. */
export function daysBetween(a: string, b: string): number | null {
  const t1 = Date.parse(`${a}T00:00:00Z`);
  const t2 = Date.parse(`${b}T00:00:00Z`);
  if (Number.isNaN(t1) || Number.isNaN(t2)) return null;
  return Math.round((t2 - t1) / 86_400_000);
}

/* ─── Resolving one layer's rate ────────────────────────────────────── */

export interface ResolvedRate {
  ratePct: number;
  /** How we got it, in a sentence that can go straight into the workings. */
  basis: string;
  /** True when an unverified or stale index was involved. */
  flagged: boolean;
}

/**
 * The rate on a layer, or null with the reason.
 *
 * ORDER MATTERS AND IT IS DELIBERATE: a fixed `ratePct` the client gave us
 * beats an index computation, always. The client's term sheet is primary
 * evidence; our index arithmetic is a derivation. When both are present the
 * basis string says which won so the reader is never guessing.
 */
export function resolveRate(
  layer: StackLayer,
  index: Record<IndexName, RateIndexValue> = RATE_INDEX,
  today?: string,
): { ok: true; rate: ResolvedRate } | { ok: false; why: string } {
  if (typeof layer.ratePct === 'number' && Number.isFinite(layer.ratePct)) {
    const basis = layer.floating
      ? `${pct(layer.ratePct)} as quoted by the client (a ${layer.floating.index.toUpperCase()} + ${pct(layer.floating.spreadPct)} structure is on file; the quoted all-in rate is used)`
      : `${pct(layer.ratePct)} as quoted by the client`;
    return { ok: true, rate: { ratePct: layer.ratePct, basis, flagged: false } };
  }

  if (layer.floating) {
    const v = index[layer.floating.index];
    if (!v || v.pct == null) {
      return {
        ok: false,
        why: `${label(layer)} floats off ${layer.floating.index.toUpperCase()}, and no value is carried for that index. Supply the index, or enter the client’s all-in rate.`,
      };
    }
    const st = today ? indexStatus(v, today) : { status: v.asOf ? 'fresh' : 'unverified' as IndexStatus, days: null, note: '' };
    const flagged = st.status !== 'fresh';
    const stamp = v.asOf ? `verified ${v.asOf}` : 'UNVERIFIED, no source on file';
    return {
      ok: true,
      rate: {
        ratePct: v.pct + layer.floating.spreadPct,
        basis: `${layer.floating.index.toUpperCase()} ${pct(v.pct)} (${stamp}) + ${pct(layer.floating.spreadPct)} spread = ${pct(v.pct + layer.floating.spreadPct)}`,
        flagged,
      },
    };
  }

  return {
    ok: false,
    why: `${label(layer)} has no rate. Ask the client for the coupon, or give it an index and a spread.`,
  };
}

function label(l: StackLayer): string {
  return l.label || SOURCE_LABEL[l.kind];
}

/* ─── Cost of equity ────────────────────────────────────────────────── */

/**
 * A BUILD-UP, NOT CAPM. There is no observable beta for a $6M HVAC company,
 * and levering a public-comp beta down to a business with one owner and three
 * trucks produces a number with four decimal places and no meaning. The
 * build-up is what appraisers actually use at this size, and every component
 * is a number somebody has to state and defend.
 *
 * EVERY FIELD IS REQUIRED. There is no house default, on purpose: a defaulted
 * equity premium is the single largest silent lever on enterprise value in
 * this whole engine.
 */
export interface CostOfEquityInputs {
  /** Long-bond yield, decimal. */
  riskFreePct: number;
  /** Broad equity risk premium, decimal. */
  equityRiskPremiumPct: number;
  /** Size premium for a business this small, decimal. */
  sizePremiumPct: number;
  /**
   * Company-specific risk — customer concentration, owner dependence, a
   * single-location footprint, a licence held personally. Decimal.
   * This is the one the practitioner actually argues about; it is separate
   * from the size premium so it can be argued about on its own.
   */
  specificRiskPct: number;
  /** Where the first three came from. Required, and it travels into workings. */
  sourceNote: string;
}

export function costOfEquity(i: CostOfEquityInputs): {
  ok: true; pct: number; workings: string[];
} | { ok: false; missing: string[] } {
  const missing: string[] = [];
  const need: [keyof CostOfEquityInputs, string][] = [
    ['riskFreePct', 'risk-free rate'],
    ['equityRiskPremiumPct', 'equity risk premium'],
    ['sizePremiumPct', 'size premium'],
    ['specificRiskPct', 'company-specific risk premium'],
  ];
  for (const [k, name] of need) {
    const v = i[k];
    if (typeof v !== 'number' || !Number.isFinite(v)) missing.push(name);
  }
  if (!i.sourceNote || !i.sourceNote.trim()) missing.push('a source note for the build-up');
  if (missing.length) return { ok: false, missing };

  const total = i.riskFreePct + i.equityRiskPremiumPct + i.sizePremiumPct + i.specificRiskPct;
  return {
    ok: true,
    pct: total,
    workings: [
      `Risk-free ${pct(i.riskFreePct)}`,
      `+ equity risk premium ${pct(i.equityRiskPremiumPct)}`,
      `+ size premium ${pct(i.sizePremiumPct)}`,
      `+ company-specific risk ${pct(i.specificRiskPct)}`,
      `= cost of equity ${pct(total)}`,
      `Source: ${i.sourceNote.trim()}`,
    ],
  };
}

/* ─── WACC ──────────────────────────────────────────────────────────── */

export interface WaccInputs {
  stack: Stack;
  equity: CostOfEquityInputs;
  /**
   * Marginal tax rate used for the interest shield, decimal.
   *
   * THE LINE: this is an ASSUMPTION THE CLIENT SUPPLIES, not a tax opinion we
   * form. `house/deal.ts` deliberately carries no tax block for exactly this
   * reason. Ask the client's CPA for the marginal rate, put their answer here,
   * and cite them — the same rule the rest of the practice runs on. Required,
   * because a defaulted 21% quietly moves WACC.
   */
  marginalTaxRatePct: number;
  /** Where the tax rate came from. Required. */
  taxRateSource: string;
  index?: Record<IndexName, RateIndexValue>;
  /** ISO date, for index staleness. Optional; omit and staleness is not judged. */
  today?: string;
}

export interface WaccLayerLine {
  label: string;
  kind: SourceKind;
  class: 'debt' | 'equity';
  amountCents: number;
  weight: number;
  ratePct: number;
  afterTaxRatePct: number;
  contributionPct: number;
  basis: string;
  flagged: boolean;
}

export interface WaccResult {
  waccPct: number;
  /** Pre-tax weighted cost of the debt layers only. */
  costOfDebtPct: number;
  afterTaxCostOfDebtPct: number;
  costOfEquityPct: number;
  debtWeight: number;
  equityWeight: number;
  totalCents: number;
  lines: WaccLayerLine[];
  /** Everything a reader needs to reproduce the number, in order. */
  workings: string[];
  /** Non-fatal problems: unverified index, stack that does not foot, etc. */
  warnings: string[];
}

/**
 * WACC from the client's own stack.
 *
 * Weights are BOOK weights — the actual dollars in each layer of this deal's
 * financing. That is right for a private acquisition and it is worth saying
 * why: the textbook prescription is market-value weights, which requires a
 * market value of equity, which is the thing the DCF is trying to compute.
 * Using the deal's own capital structure avoids the circularity and describes
 * the transaction actually being done.
 */
export function wacc(i: WaccInputs): { ok: true; result: WaccResult } | { ok: false; missing: string[] } {
  const missing: string[] = [];
  const warnings: string[] = [];

  const layers = i.stack?.layers ?? [];
  if (!layers.length) missing.push('at least one capital stack layer');

  if (typeof i.marginalTaxRatePct !== 'number' || !Number.isFinite(i.marginalTaxRatePct)) {
    missing.push('marginal tax rate (from the client’s CPA — we do not form the view)');
  }
  if (!i.taxRateSource || !i.taxRateSource.trim()) {
    missing.push('a source for the marginal tax rate');
  }

  const coe = costOfEquity(i.equity);
  if (!coe.ok) missing.push(...coe.missing);

  const index = i.index ?? RATE_INDEX;
  const resolved: { layer: StackLayer; rate: ResolvedRate }[] = [];
  for (const layer of layers) {
    if (typeof layer.amountCents !== 'number' || !Number.isFinite(layer.amountCents) || layer.amountCents < 0) {
      missing.push(`a valid amount for ${label(layer)}`);
      continue;
    }
    if (!isDebt(layer.kind)) {
      // Equity layers price off the build-up, not off a quoted coupon — with
      // one exception worth its own branch: preferred carries a stated
      // dividend, and when the client gives it we use it rather than the
      // build-up, because a 12% preferred is a known number and the build-up
      // is an estimate.
      continue;
    }
    const r = resolveRate(layer, index, i.today);
    if (!r.ok) { missing.push(r.why); continue; }
    resolved.push({ layer, rate: r.rate });
  }

  if (missing.length || !coe.ok) return { ok: false, missing: dedupe(missing) };

  const total = layers.reduce((s, l) => s + l.amountCents, 0);
  if (total <= 0) return { ok: false, missing: ['a stack that totals more than zero'] };

  // Does it foot? WACC normalises by the total either way, so a stack that
  // does not fund the price produces a perfectly reasonable-looking rate for
  // a deal that cannot be done. Warn loudly rather than fail.
  const price = i.stack.purchasePriceCents;
  if (typeof price === 'number' && Number.isFinite(price) && price > 0) {
    const gap = total - price;
    if (Math.abs(gap) > 100) {
      warnings.push(
        gap > 0
          ? `The stack is over-funded by ${cents(gap)} — ${cents(total)} of capital against a ${cents(price)} price.`
          : `The stack is short by ${cents(-gap)} — ${cents(total)} of capital against a ${cents(price)} price.`,
      );
    }
  } else {
    warnings.push('No purchase price on the stack, so it was not checked against one.');
  }

  const taxRate = i.marginalTaxRatePct;
  const lines: WaccLayerLine[] = [];
  let debtCents = 0;
  let debtWeightedRate = 0;
  let debtWeightedAfterTax = 0;

  for (const { layer, rate } of resolved) {
    const weight = layer.amountCents / total;
    const afterTax = rate.ratePct * (1 - taxRate);
    debtCents += layer.amountCents;
    debtWeightedRate += rate.ratePct * layer.amountCents;
    debtWeightedAfterTax += afterTax * layer.amountCents;
    if (rate.flagged) {
      warnings.push(`${label(layer)} priced off an index that is not currently verified.`);
    }
    lines.push({
      label: label(layer), kind: layer.kind, class: 'debt',
      amountCents: layer.amountCents, weight,
      ratePct: rate.ratePct, afterTaxRatePct: afterTax,
      contributionPct: weight * afterTax,
      basis: rate.basis + (layer.note ? ` — ${layer.note}` : ''),
      flagged: rate.flagged,
    });
  }

  const coePct = coe.pct;
  for (const layer of layers) {
    if (isDebt(layer.kind)) continue;
    const weight = layer.amountCents / total;
    // A stated preferred dividend beats the build-up (see the branch above).
    const stated = layer.kind === 'preferred'
      && typeof layer.ratePct === 'number' && Number.isFinite(layer.ratePct)
      ? layer.ratePct : null;
    const r = stated ?? coePct;
    lines.push({
      label: label(layer), kind: layer.kind, class: 'equity',
      amountCents: layer.amountCents, weight,
      ratePct: r,
      // No shield on equity. Preferred dividends are dividends, not interest.
      afterTaxRatePct: r,
      contributionPct: weight * r,
      basis: stated != null
        ? `${pct(stated)} stated preferred dividend — a dividend, so no interest deduction`
        : `${pct(coePct)} from the build-up`,
      flagged: false,
    });
  }

  const equityCents = total - debtCents;
  const costOfDebtPct = debtCents > 0 ? debtWeightedRate / debtCents : 0;
  const afterTaxCostOfDebtPct = debtCents > 0 ? debtWeightedAfterTax / debtCents : 0;
  const waccPct = lines.reduce((s, l) => s + l.contributionPct, 0);

  const workings: string[] = [
    `Stack totals ${cents(total)} across ${lines.length} layer${lines.length === 1 ? '' : 's'}.`,
    ...lines.map(l =>
      `${l.label}: ${cents(l.amountCents)} (${pct(l.weight)} of the stack) at ${pct(l.ratePct)}`
      + (l.class === 'debt' ? `, ${pct(l.afterTaxRatePct)} after tax` : '')
      + ` → ${pct(l.contributionPct)}. ${l.basis}.`),
    `Weighted cost of debt ${pct(costOfDebtPct)} pre-tax, ${pct(afterTaxCostOfDebtPct)} after a ${pct(taxRate)} marginal rate (${i.taxRateSource.trim()}).`,
    ...coe.workings,
    `WACC = ${pct(waccPct)}.`,
  ];

  return {
    ok: true,
    result: {
      waccPct, costOfDebtPct, afterTaxCostOfDebtPct, costOfEquityPct: coePct,
      debtWeight: debtCents / total, equityWeight: equityCents / total,
      totalCents: total, lines, workings, warnings,
    },
  };
}

/* ─── The LBO's rates, from the same stack ──────────────────────────── */

/**
 * `house/deal.ts` `lbo()` holds exactly two debt tranches, senior and mezz,
 * each as a percentage of enterprise value with one rate and one term. A real
 * client stack has more shapes than that. Rather than silently squeezing five
 * layers into two slots, this maps what fits and NAMES what does not.
 *
 * THE MAPPING, and it is a judgement each way:
 *   senior  ← sba-7a, sba-504, senior-bank, unitranche, abl-revolver
 *   mezz    ← mezzanine, preferred, seller-note
 *
 * The seller note sits in the mezz slot because that is where it sits in the
 * waterfall and in the debt service, even though it is usually cheaper than
 * true mezzanine. The blend makes the mezz rate look low; the `notes` say so.
 *
 * Preferred is EQUITY for WACC and MEZZ-SHAPED for the LBO, and that is not a
 * contradiction: WACC asks what the capital costs, and preferred costs equity
 * money with no shield; the LBO asks what has to be serviced ahead of the
 * common, and preferred does. Same layer, two correct answers, because the two
 * models are asking different questions.
 *
 * `earnout` is mapped NOWHERE. It is contingent, it does not amortize, and
 * putting it in a debt tranche would put a payment in year one that may never
 * be owed. It shows up in `unmapped` so the practitioner handles it as
 * consideration, which is what it is.
 */
export interface LboRateMapping {
  seniorDebtPct: number;
  seniorRate: number;
  seniorTerm: number; // months
  mezDebtPct: number;
  mezRate: number;
  mezTerm: number; // months
  /** Layers that could not be represented, with the reason. */
  unmapped: { label: string; kind: SourceKind; amountCents: number; why: string }[];
  notes: string[];
}

const SENIOR_KINDS: readonly SourceKind[] = ['sba-7a', 'sba-504', 'senior-bank', 'unitranche', 'abl-revolver'];
const MEZZ_KINDS: readonly SourceKind[] = ['mezzanine', 'preferred', 'seller-note'];

/** Default term when a layer has none, by tranche. Stated, not hidden. */
export const DEFAULT_SENIOR_TERM_MONTHS = 120;
export const DEFAULT_MEZZ_TERM_MONTHS = 60;

export function lboRatesFrom(
  stack: Stack,
  index: Record<IndexName, RateIndexValue> = RATE_INDEX,
  today?: string,
): { ok: true; mapping: LboRateMapping } | { ok: false; missing: string[] } {
  const missing: string[] = [];
  const notes: string[] = [];
  const unmapped: LboRateMapping['unmapped'] = [];

  const price = stack?.purchasePriceCents;
  if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0) {
    return { ok: false, missing: ['a purchase price on the stack — the LBO states debt as a share of enterprise value'] };
  }

  let seniorCents = 0, seniorRateWeighted = 0, seniorTermWeighted = 0;
  let mezCents = 0, mezRateWeighted = 0, mezTermWeighted = 0;
  let sellerNoteSeen = false;
  let preferredSeen = false;

  for (const layer of stack.layers ?? []) {
    const amt = layer.amountCents;
    if (typeof amt !== 'number' || !Number.isFinite(amt) || amt < 0) {
      missing.push(`a valid amount for ${label(layer)}`);
      continue;
    }
    if (layer.kind === 'earnout') {
      unmapped.push({
        label: label(layer), kind: layer.kind, amountCents: amt,
        why: 'Contingent consideration. It does not amortize and may never be owed, so it is not a debt tranche. Model it as consideration.',
      });
      continue;
    }
    const senior = SENIOR_KINDS.includes(layer.kind);
    const mezz = MEZZ_KINDS.includes(layer.kind);
    if (!senior && !mezz) continue; // ordinary equity — the LBO derives it as the plug

    const r = resolveRate(layer, index, today);
    if (!r.ok) { missing.push(r.why); continue; }
    const term = layer.termMonths && layer.termMonths > 0
      ? layer.termMonths
      : (senior ? DEFAULT_SENIOR_TERM_MONTHS : DEFAULT_MEZZ_TERM_MONTHS);
    if (!layer.termMonths) {
      notes.push(`${label(layer)} has no term on file; assumed ${term} months.`);
    }

    if (senior) {
      seniorCents += amt;
      seniorRateWeighted += r.rate.ratePct * amt;
      seniorTermWeighted += term * amt;
    } else {
      if (layer.kind === 'seller-note') sellerNoteSeen = true;
      if (layer.kind === 'preferred') preferredSeen = true;
      mezCents += amt;
      mezRateWeighted += r.rate.ratePct * amt;
      mezTermWeighted += term * amt;
    }
  }

  if (missing.length) return { ok: false, missing: dedupe(missing) };

  if (sellerNoteSeen) {
    notes.push('A seller note is blended into the mezzanine tranche — same waterfall position, but usually cheaper than true mezzanine, so the blended mezz rate reads low.');
  }
  if (preferredSeen) {
    notes.push('Preferred equity is blended into the mezzanine tranche because it is serviced ahead of the common. It is still EQUITY in the WACC, where it carries no interest deduction.');
  }

  return {
    ok: true,
    mapping: {
      seniorDebtPct: seniorCents / price,
      seniorRate: seniorCents > 0 ? seniorRateWeighted / seniorCents : 0,
      seniorTerm: seniorCents > 0 ? Math.round(seniorTermWeighted / seniorCents) : 0,
      mezDebtPct: mezCents / price,
      mezRate: mezCents > 0 ? mezRateWeighted / mezCents : 0,
      mezTerm: mezCents > 0 ? Math.round(mezTermWeighted / mezCents) : 0,
      unmapped, notes,
    },
  };
}

/* ─── The doctrine, exported so a UI can print it ───────────────────── */

export const WACC_VS_LBO =
  'WACC and the LBO’s coupons come from the same stack and do different jobs. '
  + 'WACC discounts UNLEVERED free cash flow to enterprise value and takes the tax '
  + 'shield on the debt leg. The LBO’s senior and mezzanine rates are the actual '
  + 'coupons that size debt service, DSCR and paydown. An LBO never discounts at '
  + 'WACC — it solves for equity IRR, and equity cash flows are already levered, '
  + 'so discounting them at WACC would count the leverage twice.';

export const CLIENT_SUPPLIED_RULE =
  'The client’s own term sheets are primary evidence and beat every house '
  + 'assumption in this file. Where the client has given a rate, that rate is used '
  + 'and the index is not consulted. Where they have not, the number is either an '
  + 'index plus a spread with its provenance stamped, or it is missing — never a '
  + 'default.';

/* ─── SBA feasibility, arithmetic only ──────────────────────────────── */

/**
 * The three SBA 7(a) constraints that are pure arithmetic on a stack. Ported
 * from `capitalStackEngine.ts` so the app and a Cowork session agree, and
 * deliberately limited to the checks that are arithmetic: eligibility also
 * turns on citizenship, credit and franchise-agreement review, none of which
 * this file can see and none of which it should guess at.
 */
export const SBA_MAX_CENTS = 500_000_000;
export const SBA_EQUITY_MIN = 0.10;
export const SBA_DSCR_MIN = 1.25;

/**
 * The 7(a) maximum spreads over prime, as decimals, by loan size. Lifted here
 * from `capitalStackEngine.ts` so there is ONE statement of them — that file
 * and `marketDataService.ts` each carried their own, and the second one had
 * only the standard tier, so an $800K loan priced 50bp high there and correct
 * in the other.
 *
 * These are programme CAPS, not quotes. A lender may come in under them, and
 * when the client hands over a term sheet its rate is what gets used —
 * `resolveRate` puts the client's quoted number ahead of any of this.
 */
export const SBA_SPREAD_SMALL_PCT = 0.0475;    // loans under $50K
export const SBA_SPREAD_STANDARD_PCT = 0.0275; // $50K–$350K
export const SBA_SPREAD_LARGE_PCT = 0.0225;    // over $350K
export const SBA_SPREAD_LARGE_THRESHOLD_CENTS = 35_000_000;  // $350K
export const SBA_SPREAD_SMALL_THRESHOLD_CENTS = 5_000_000;   // $50K

/** The maximum spread this loan size may carry, as a decimal. */
export function sbaSpreadFor(loanCents: number): number {
  if (loanCents > SBA_SPREAD_LARGE_THRESHOLD_CENTS) return SBA_SPREAD_LARGE_PCT;
  if (loanCents < SBA_SPREAD_SMALL_THRESHOLD_CENTS) return SBA_SPREAD_SMALL_PCT;
  return SBA_SPREAD_STANDARD_PCT;
}

export function sbaChecks(stack: Stack, annualDebtServiceCents?: number, annualEarningsCents?: number): {
  passes: string[]; fails: string[]; unknown: string[];
} {
  const passes: string[] = [], fails: string[] = [], unknown: string[] = [];
  const layers = stack?.layers ?? [];
  const total = layers.reduce((s, l) => s + (l.amountCents || 0), 0);
  const sba = layers.filter(l => l.kind === 'sba-7a').reduce((s, l) => s + (l.amountCents || 0), 0);
  if (sba === 0) return { passes, fails, unknown: ['No SBA 7(a) layer in this stack, so the SBA tests do not apply.'] };

  (sba <= SBA_MAX_CENTS ? passes : fails).push(
    `SBA 7(a) loan of ${cents(sba)} against the ${cents(SBA_MAX_CENTS)} programme maximum.`);

  const equity = layers.filter(l => !isDebt(l.kind)).reduce((s, l) => s + (l.amountCents || 0), 0);
  const equityPct = total > 0 ? equity / total : 0;
  (equityPct >= SBA_EQUITY_MIN ? passes : fails).push(
    `Equity injection ${pct(equityPct)} against the ${pct(SBA_EQUITY_MIN)} minimum.`);

  if (typeof annualDebtServiceCents === 'number' && annualDebtServiceCents > 0
    && typeof annualEarningsCents === 'number') {
    const d = annualEarningsCents / annualDebtServiceCents;
    (d >= SBA_DSCR_MIN ? passes : fails).push(
      `DSCR ${d.toFixed(2)}x against the ${SBA_DSCR_MIN.toFixed(2)}x minimum.`);
  } else {
    unknown.push('DSCR not tested — pass annual debt service and annual earnings to test it.');
  }

  unknown.push('Citizenship, credit and any franchise agreement are eligibility questions this check cannot see. Confirm with the lender.');
  return { passes, fails, unknown };
}

/* ─── formatting helpers (local, so this file stays dependency-free) ── */

function pct(v: number): string {
  return `${(v * 100).toFixed(2).replace(/\.00$/, '')}%`;
}

function cents(v: number): string {
  const d = v / 100;
  if (Math.abs(d) >= 1_000_000) return `$${(d / 1_000_000).toFixed(2).replace(/\.?0+$/, '')}M`;
  if (Math.abs(d) >= 1_000) return `$${(d / 1_000).toFixed(0)}K`;
  return `$${d.toFixed(0)}`;
}

function dedupe(a: string[]): string[] {
  return Array.from(new Set(a));
}
