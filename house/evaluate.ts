/**
 * house/evaluate.ts — the free owner evaluation engine
 * (SELLER_EVALUATION_PLAN.md §4, 2026-08-04).
 *
 * PURE by law: no db, no API key, no env, no model call. Chat collects, this
 * computes, the renderer presents — the calculator is never the conversation.
 * Mirrors the app's own basis grammar (client/src/lib/calculations/core.ts):
 * SDE for owner-operated businesses under $3M revenue, adjusted EBITDA above.
 *
 * THE LINE guardrails live HERE, not in copy review:
 *  • The output type has NO single point-estimate field — a range and a
 *    position-in-band are all that exist to render.
 *  • Every figure the narrative can state traces to the inputs, the cited
 *    band, or arithmetic between them.
 *  • The standing disclaimer is part of the result, so no renderer can
 *    forget it.
 */

import { laneBand, LaneBand, SIZE_TIERS, SIZE_TIER_SOURCE } from './laneBenchmarks';

export type OwnerDependence = 'runs-daily' | 'manager-in-place' | 'absentee';
export type BooksQuality = 'cash' | 'accrual' | 'reviewed';
export type RealEstate = 'owned' | 'leased';

export interface EvaluationInput {
  lane: string;
  /** Trailing-twelve-month revenue, USD. */
  revenueUsd: number;
  /** Pre-add-back profit (what the tax return shows), USD. */
  earningsUsd: number;
  /** Owner's total compensation taken from the business, USD. */
  ownerCompUsd: number;
  /** ITEMIZED add-backs (2026-08-04, Paul: "thorough with real estate,
   *  add-backs etc. not fluff") — buyers rebuild these line by line in
   *  diligence, so the evaluation walks them the same way instead of taking
   *  one lump number on faith. Each defaults to 0. */
  /** One-time, non-recurring costs (a lawsuit, a flood repair, a one-off equipment buy). */
  addBackOneTimeUsd?: number;
  /** Personal expenses run through the business (vehicles, phones, travel). */
  addBackPersonalUsd?: number;
  /** Compensation of family on payroll who don't work in the business. */
  addBackFamilyUsd?: number;
  /** Real estate posture. 'owned' triggers the market-rent normalization —
   *  the single most common distortion in owner-operator P&Ls: rent paid to
   *  yourself (or no rent at all) is not a market cost, so earnings are
   *  restated as if a stranger-landlord charged market rent. */
  realEstate?: RealEstate;
  /** Annual rent the business currently expenses for its space (owned case; 0 if none). */
  rentPaidUsd?: number;
  /** Owner's estimate of annual market rent for the space (owned case). */
  marketRentUsd?: number;
  /** Share of revenue that recurs (maintenance plans, contracts), 0–100. */
  recurringPct: number;
  ownerDependence: OwnerDependence;
  /** Largest single customer's share of revenue, 0–100. */
  topCustomerPct: number;
  booksQuality: BooksQuality;
  /** New-construction / GC-dependent share of revenue, 0–100. */
  newConstructionPct: number;
}

/** One line of the normalized-earnings bridge — the report prints these
 *  verbatim, so every amount must be an input or arithmetic between inputs. */
export interface BridgeLine { label: string; amountUsd: number }

export interface ReadinessDriver {
  key: string;
  label: string;
  status: 'strength' | 'watch' | 'fix';
  /** What this means to a buyer — sourced language, no invention. */
  note: string;
}

export interface EvaluationResult {
  laneSupported: true;
  band: LaneBand;
  basisType: 'SDE' | 'Adjusted EBITDA';
  basisUsd: number;
  /** The normalized-earnings walk, reported profit → basis. Zero-amount
   *  adjustments are omitted — the report prints what actually moved. */
  bridge: BridgeLine[];
  /** Owned real estate is a SEPARATE ASSET from the operating business —
   *  this note carries that treatment (and the market-rent restatement)
   *  into every renderer. null when the business leases from a third party. */
  realEstateNote: string | null;
  /** The market range: basis × band endpoints. A RANGE, never a number. */
  rangeUsd: { low: number; marketLow: number; marketHigh: number; high: number };
  sizeTier: { label: string; low: number; high: number; basis: string; source: string };
  readiness: {
    score: number; // 0–100
    position: 'lower third' | 'middle of the band' | 'upper third';
    drivers: ReadinessDriver[];
  };
  disclaimer: string;
}

export interface UnsupportedLane {
  laneSupported: false;
  lane: string;
  message: string;
}

export const DISCLAIMER =
  'Market context from published transaction data applied to figures you provided — ' +
  'not an appraisal or opinion of value. Actual transactions are priced in diligence.';

const round1k = (n: number) => Math.round(n / 1000) * 1000;

export function evaluate(input: EvaluationInput): EvaluationResult | UnsupportedLane {
  const band = laneBand(input.lane);
  if (!band) {
    return {
      laneSupported: false,
      lane: input.lane,
      message:
        "We haven't published sourced valuation data for this trade yet — we don't guess. " +
        "Your trade's read is being built; registered owners get it first.",
    };
  }

  // Basis, mirroring core.ts: SDE folds owner comp back in; EBITDA does not.
  // Built as an explicit BRIDGE so the report shows the same walk a buyer's
  // QofE will run — reported profit, each adjustment named, the total.
  const sdeBasis = input.revenueUsd < 3_000_000;
  const oneTime = input.addBackOneTimeUsd || 0;
  const personal = input.addBackPersonalUsd || 0;
  const family = input.addBackFamilyUsd || 0;
  const owned = input.realEstate === 'owned';
  // Market-rent normalization (owned only): strip the rent actually expensed
  // (often zero, or a number set for tax reasons) and charge market instead.
  // Positive when the business over-pays its owner-landlord, negative when it
  // under-pays — under-payment is the common case, and it means the P&L
  // overstates what a buyer will earn paying real rent.
  const rentNorm = owned ? (input.rentPaidUsd || 0) - (input.marketRentUsd || 0) : 0;

  const bridge: BridgeLine[] = [
    { label: `Reported profit (per tax return)`, amountUsd: input.earningsUsd },
  ];
  if (sdeBasis) bridge.push({ label: "Owner's total compensation (added back for SDE)", amountUsd: input.ownerCompUsd });
  if (oneTime) bridge.push({ label: 'One-time, non-recurring costs', amountUsd: oneTime });
  if (personal) bridge.push({ label: 'Personal expenses run through the business', amountUsd: personal });
  if (family) bridge.push({ label: 'Non-working family payroll', amountUsd: family });
  if (owned && rentNorm !== 0) bridge.push({ label: 'Occupancy restated to market rent', amountUsd: rentNorm });

  const basisUsd = bridge.reduce((s, l) => s + l.amountUsd, 0);

  const realEstateNote = owned
    ? 'The business occupies real estate you own, so two things hold. First, the range below values the OPERATING BUSINESS ' +
      'on a market-rent basis — earnings were restated as if the business paid market rent to a third-party landlord' +
      ((input.rentPaidUsd || 0) < (input.marketRentUsd || 0)
        ? ', because rent currently expensed is below market and the P&L otherwise overstates what a buyer earns'
        : '') +
      '. Second, the property itself is a separate asset with its own value: buyers typically either lease it from you at market ' +
      'rate (a lease often negotiated as part of the deal) or purchase it separately. Its value comes from a licensed real ' +
      'estate appraiser — it is not included in the range below and we do not estimate it.'
    : null;

  // Readiness — each driver is a published buyer behavior, not our opinion.
  const drivers: ReadinessDriver[] = [];
  let score = 50;

  if (input.recurringPct >= 40) {
    score += 20;
    drivers.push({
      key: 'recurring', label: 'Recurring revenue', status: 'strength',
      note: `${input.recurringPct}% recurring — at or above the ≈40% threshold where buyers re-rate a contractor toward platform pricing.`,
    });
  } else if (input.recurringPct >= 30) {
    score += 12;
    drivers.push({
      key: 'recurring', label: 'Recurring revenue', status: 'strength',
      note: `${input.recurringPct}% recurring — books above 30% command a 1–2 turn premium over peers under 15%.`,
    });
  } else if (input.recurringPct >= 15) {
    score += 4;
    drivers.push({
      key: 'recurring', label: 'Recurring revenue', status: 'watch',
      note: `${input.recurringPct}% recurring — below the 30% mark buyers pay up for; growing the maintenance book is the single biggest multiple lever (a ±3–4 turn swing at the extremes).`,
    });
  } else {
    score -= 10;
    drivers.push({
      key: 'recurring', label: 'Recurring revenue', status: 'fix',
      note: `${input.recurringPct}% recurring — under 15%, buyers price the business as project work. This is the most valuable thing to fix before a sale.`,
    });
  }

  if (input.ownerDependence === 'absentee') {
    score += 15;
    drivers.push({
      key: 'owner', label: 'Owner dependence', status: 'strength',
      note: 'Runs without the owner — removes the 20–30% owner-dependency discount (or heavy earnout) buyers otherwise apply.',
    });
  } else if (input.ownerDependence === 'manager-in-place') {
    score += 8;
    drivers.push({
      key: 'owner', label: 'Owner dependence', status: 'watch',
      note: 'A manager is in place; buyers will test whether the business truly transfers without you.',
    });
  } else {
    score -= 12;
    drivers.push({
      key: 'owner', label: 'Owner dependence', status: 'fix',
      note: 'Owner-run day to day — buyers apply a 20–30% discount or shift value into an earnout when the business cannot function without the founder.',
    });
  }

  if (input.topCustomerPct > 20) {
    score -= 10;
    drivers.push({
      key: 'concentration', label: 'Customer concentration', status: 'fix',
      note: `Top customer at ${input.topCustomerPct}% — concentration above 15–20% discounts hard in diligence.`,
    });
  } else if (input.topCustomerPct > 12) {
    drivers.push({
      key: 'concentration', label: 'Customer concentration', status: 'watch',
      note: `Top customer at ${input.topCustomerPct}% — inside the range buyers accept, but close to the 15–20% line they price against.`,
    });
  } else {
    score += 6;
    drivers.push({
      key: 'concentration', label: 'Customer concentration', status: 'strength',
      note: 'Granular customer base — no single relationship moves the valuation.',
    });
  }

  if (input.booksQuality === 'reviewed') {
    score += 10;
    drivers.push({
      key: 'books', label: 'Financial records', status: 'strength',
      note: 'Accrual books with outside review — defends the multiple in quality-of-earnings.',
    });
  } else if (input.booksQuality === 'accrual') {
    score += 5;
    drivers.push({
      key: 'books', label: 'Financial records', status: 'watch',
      note: 'Accrual books help; sellers with undocumented add-backs still typically lose 5–15% of headline earnings in QofE.',
    });
  } else {
    score -= 10;
    drivers.push({
      key: 'books', label: 'Financial records', status: 'fix',
      note: 'Cash-basis books drive 20–40% price chips in diligence; converting to accrual with departmental P&Ls is a 1–3 year arc that pays for itself.',
    });
  }

  if (input.newConstructionPct > 20) {
    score -= 8;
    drivers.push({
      key: 'newcon', label: 'New-construction exposure', status: 'fix',
      note: `${input.newConstructionPct}% new-construction/GC revenue — most buyers cap this at 20% of a target or price it as an add-on.`,
    });
  } else {
    score += 4;
    drivers.push({
      key: 'newcon', label: 'New-construction exposure', status: 'strength',
      note: 'Service-and-replacement weighted — the profile buyers pay up for.',
    });
  }

  score = Math.max(5, Math.min(95, score));
  const position: EvaluationResult['readiness']['position'] =
    score >= 67 ? 'upper third' : score >= 45 ? 'middle of the band' : 'lower third';

  const tier = SIZE_TIERS.find(t => basisUsd <= t.max) ?? SIZE_TIERS[SIZE_TIERS.length - 1];

  return {
    laneSupported: true,
    band,
    basisType: sdeBasis ? 'SDE' : 'Adjusted EBITDA',
    basisUsd,
    bridge,
    realEstateNote,
    // Floor at 0: a basis at or below zero after normalization means the
    // multiples don't apply — the renderer says so instead of printing a
    // negative dollar range.
    rangeUsd: {
      low: Math.max(0, round1k(basisUsd * band.low)),
      marketLow: Math.max(0, round1k(basisUsd * band.marketLow)),
      marketHigh: Math.max(0, round1k(basisUsd * band.marketHigh)),
      high: Math.max(0, round1k(basisUsd * band.high)),
    },
    sizeTier: { label: tier.label, low: tier.low, high: tier.high, basis: tier.basis, source: SIZE_TIER_SOURCE },
    readiness: { score, position, drivers },
    disclaimer: DISCLAIMER,
  };
}

/** Coarse band label — the ONLY size signal that may ever be persisted
 *  (the schema enforces it; this keeps the labels consistent). */
export function revenueBandLabel(revenueUsd: number): string {
  if (revenueUsd < 1_000_000) return 'Under $1M';
  if (revenueUsd < 3_000_000) return '$1M–$3M';
  if (revenueUsd < 10_000_000) return '$3M–$10M';
  return '$10M+';
}
