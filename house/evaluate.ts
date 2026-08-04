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

export interface EvaluationInput {
  lane: string;
  /** Trailing-twelve-month revenue, USD. */
  revenueUsd: number;
  /** Pre-add-back profit (what the tax return shows), USD. */
  earningsUsd: number;
  /** Owner's total compensation taken from the business, USD. */
  ownerCompUsd: number;
  /** One-time / personal expenses run through the business, USD. */
  addBacksUsd: number;
  /** Share of revenue that recurs (maintenance plans, contracts), 0–100. */
  recurringPct: number;
  ownerDependence: OwnerDependence;
  /** Largest single customer's share of revenue, 0–100. */
  topCustomerPct: number;
  booksQuality: BooksQuality;
  /** New-construction / GC-dependent share of revenue, 0–100. */
  newConstructionPct: number;
}

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
        "We haven't published a sourced multiple band for this lane yet — we don't guess. " +
        'Your read is being built; registered owners get it first.',
    };
  }

  // Basis, mirroring core.ts: SDE folds owner comp back in; EBITDA does not.
  const sdeBasis = input.revenueUsd < 3_000_000;
  const basisUsd = sdeBasis
    ? input.earningsUsd + input.ownerCompUsd + input.addBacksUsd
    : input.earningsUsd + input.addBacksUsd;

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
    rangeUsd: {
      low: round1k(basisUsd * band.low),
      marketLow: round1k(basisUsd * band.marketLow),
      marketHigh: round1k(basisUsd * band.marketHigh),
      high: round1k(basisUsd * band.high),
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
