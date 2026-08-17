/**
 * house/engagement.ts — THE FEE SCHEDULE'S ARITHMETIC, PURE
 *
 * FRONT_END_REBUILD.md §3: *"THERE IS NO ENGAGEMENT OBJECT… the published fee
 * schedule ($5K a month, banded success fee, every retainer dollar credited
 * at close) is arithmetic that currently lives nowhere."* This file is where
 * it lives now — migration 129's `engagements` table stores what happened,
 * and this computes what the schedule says about it.
 *
 * ── THE SCHEDULE IS LAW, NOT AN INPUT ───────────────────────────────────
 * The numbers below are Paul's published schedule (CLAUDE.md, 2026-08-05/06,
 * MONTHLY retainer 2026-08-17): ONE schedule, every client, no negotiated
 * pricing — the no-negotiation posture is itself a loyalty statement. So the
 * bands are CONSTANTS here, not parameters. A `successFee(ev, rates)` that
 * took rates as an argument would be the negotiation the schedule forbids,
 * wearing a function signature.
 *
 * ── THE CADENCE MOVED; THE RATE DID NOT ─────────────────────────────────
 * 2026-08-17, Paul: *"I want the monthly fee to be 5k per month in addition
 * to the scale. All credit towards close just like we have it."* The schedule
 * billed $15,000 a QUARTER up front from 2026-08-06 — the same $5K a month in
 * dollars-per-month terms, but a quarter of committed retainer at a time. It
 * now bills MONTHLY at $5,000. The bands, the $100K floor and every credit
 * rule are untouched; what changed is the billing unit, and with it the
 * minimum commitment (a month, not a quarter). Migration 133 carries existing
 * rows across by dividing the papered quarterly rate by three, so nobody's
 * dollars-per-month moved.
 *
 * ── THE LINE ────────────────────────────────────────────────────────────
 * This is the practice's own book-keeping of a schedule papered by the
 * ENGAGEMENT LETTER. It computes; it does not paper, and nothing here is
 * customer-facing copy. Yulia and the intake never quote fees, no figure from
 * this file reaches the public site, and the one-time §15(b)(13)/state-
 * registration counsel confirmation the schedule awaits is unchanged by code
 * existing that can add the bands up.
 *
 * ── PURE, BY HOUSE DOCTRINE ─────────────────────────────────────────────
 * No db, no env, no clock, no model. All money in integer CENTS. Where an
 * input is missing the function refuses and names it — the `wacc()` /
 * `bandFor` posture — because a defaulted enterprise value inside a fee
 * computation is an invented number with a dollar sign on it.
 */

/* ── the published schedule, in cents ─────────────────────────────────── */

/** $5,000 per month, paid up front. The first month IS the engagement. */
export const MONTH_RETAINER_CENTS = 500_000;

/** The success-fee floor: $100,000. */
export const FEE_FLOOR_CENTS = 10_000_000;

/**
 * The bands, tax-bracket style — each dollar of enterprise value is priced in
 * its own band, no cliffs. `uptoCents: null` is the open top band.
 */
export const FEE_BANDS: readonly { uptoCents: number | null; rateBps: number }[] = [
  { uptoCents: 100_000_000, rateBps: 500 },   // 5% of the first $1M
  { uptoCents: 500_000_000, rateBps: 400 },   // 4% of $1M–$5M
  { uptoCents: 1_000_000_000, rateBps: 300 }, // 3% of $5M–$10M
  { uptoCents: null, rateBps: 200 },          // 2% above $10M
];

/**
 * The EV at which the floor stops binding: solve 5%·$1M + 4%·(EV−$1M) = $100K
 * → EV = $2.25M. Exported so a UI can say "the floor binds below $2.25M"
 * without re-deriving it, and asserted in the tests rather than trusted.
 */
export const FLOOR_BINDS_BELOW_CENTS = 225_000_000;

/* ── the success fee ──────────────────────────────────────────────────── */

export interface FeeBandLine {
  /** Human description of the band — "5% of the first $1M". */
  band: string;
  rateBps: number;
  appliedToCents: number;
  feeCents: number;
}

export interface SuccessFee {
  feeCents: number;
  /** True when the $100K floor lifted the banded total. At exactly $2.25M the
   *  banded total EQUALS the floor and this is false — nothing was lifted. */
  floorApplied: boolean;
  bandedTotalCents: number;
  lines: FeeBandLine[];
  workings: string[];
}

/**
 * The success fee for an enterprise value, or a refusal naming why.
 *
 * Anchors from the published schedule, reproduced by the tests:
 *   $1.8M  → $100K (floor)      $5M  → $210K
 *   $3.46M → $148.4K            $10M → $360K
 * (The doc prints "$3.46M → $148K" — display rounding of the same arithmetic.)
 */
export function successFee(evCents: number): { ok: true; fee: SuccessFee } | { ok: false; why: string } {
  if (typeof evCents !== 'number' || !Number.isFinite(evCents)) {
    return { ok: false, why: 'Enterprise value is not a number. The fee is a function of EV; there is no default EV.' };
  }
  if (!Number.isInteger(evCents)) {
    return { ok: false, why: 'Enterprise value must be integer cents (house rule 10) — a float dollar amount reached the fee computation.' };
  }
  if (evCents <= 0) {
    return { ok: false, why: 'Enterprise value must be positive. A zero or negative EV has no fee; it has a different problem.' };
  }

  const lines: FeeBandLine[] = [];
  let remaining = evCents;
  let floorOfBand = 0;
  let banded = 0;

  for (const b of FEE_BANDS) {
    const width = b.uptoCents === null ? remaining : Math.min(remaining, b.uptoCents - floorOfBand);
    if (width <= 0) break;
    const fee = Math.round((width * b.rateBps) / 10_000);
    lines.push({
      band: b.uptoCents === null
        ? `${b.rateBps / 100}% above ${money(floorOfBand)}`
        : `${b.rateBps / 100}% of ${money(floorOfBand)}–${money(b.uptoCents)}`,
      rateBps: b.rateBps,
      appliedToCents: width,
      feeCents: fee,
    });
    banded += fee;
    remaining -= width;
    if (b.uptoCents !== null) floorOfBand = b.uptoCents;
    if (remaining <= 0) break;
  }

  const floorApplied = banded < FEE_FLOOR_CENTS;
  const feeCents = Math.max(banded, FEE_FLOOR_CENTS);

  return {
    ok: true,
    fee: {
      feeCents,
      floorApplied,
      bandedTotalCents: banded,
      lines,
      workings: [
        `Enterprise value ${money(evCents)}.`,
        ...lines.map(l => `${l.band}: ${money(l.appliedToCents)} × ${l.rateBps / 100}% = ${money(l.feeCents)}.`),
        `Banded total ${money(banded)}.`,
        floorApplied
          ? `Below the ${money(FEE_FLOOR_CENTS)} minimum — the floor applies: fee ${money(feeCents)}.`
          : `Fee ${money(feeCents)}.`,
      ],
    },
  };
}

/* ── the retainer credit ──────────────────────────────────────────────── */

export interface RetainerCredit {
  creditCents: number;
  dueAtCloseCents: number;
  /** Retainer beyond the fee. Forfeited by the schedule ("prepayment, not a
   *  refundable deposit; excess NOT refunded"), and printed rather than
   *  silently zeroed so a long mandate on a floor deal shows where the money
   *  went. */
  excessForfeitedCents: number;
  workings: string[];
}

/**
 * What the retainer is worth against a success fee.
 *
 * TWO RULES, both the schedule's, both enforced here rather than remembered:
 *   · credit caps at the fee — a long mandate on a floor deal owes $0 at
 *     close and the excess is NOT refunded;
 *   · NO CLOSE, NO CREDIT — retainers are earned as the work runs. A caller
 *     asking for credit on an unclosed deal gets zero with the rule stated,
 *     not an error: "what would the credit be if this closed" is the previous
 *     question, `successFee`, applied to a hypothetical EV the caller owns.
 */
export function retainerCredit(input: {
  retainerPaidCents: number;
  feeCents: number;
  closed: boolean;
}): { ok: true; credit: RetainerCredit } | { ok: false; why: string } {
  const { retainerPaidCents, feeCents, closed } = input;
  for (const [v, name] of [[retainerPaidCents, 'retainer paid'], [feeCents, 'success fee']] as const) {
    if (typeof v !== 'number' || !Number.isInteger(v) || v < 0) {
      return { ok: false, why: `The ${name} must be non-negative integer cents.` };
    }
  }
  if (!closed) {
    return {
      ok: true,
      credit: {
        creditCents: 0,
        dueAtCloseCents: feeCents,
        excessForfeitedCents: 0,
        workings: [
          'No close, no credit — retainers are earned as the work runs. The credit exists only at a close.',
          `If this deal closes at the fee shown, the retainer paid to date (${money(retainerPaidCents)}) credits then, capped at the fee.`,
        ],
      },
    };
  }
  const creditCents = Math.min(retainerPaidCents, feeCents);
  const dueAtCloseCents = feeCents - creditCents;
  const excessForfeitedCents = Math.max(0, retainerPaidCents - feeCents);
  return {
    ok: true,
    credit: {
      creditCents,
      dueAtCloseCents,
      excessForfeitedCents,
      workings: [
        `Retainer paid ${money(retainerPaidCents)}; success fee ${money(feeCents)}.`,
        `Credit = min(retainer, fee) = ${money(creditCents)}.`,
        `Due at close ${money(dueAtCloseCents)}.`,
        ...(excessForfeitedCents > 0
          ? [`${money(excessForfeitedCents)} of retainer exceeds the fee — prepayment, not a refundable deposit; it is not refunded.`]
          : []),
      ],
    },
  };
}

/* ── the engagement, summarised ───────────────────────────────────────── */

export const SCHEDULE_SUMMARY =
  `One schedule, every client, no negotiated pricing. ${money(MONTH_RETAINER_CENTS)} per month, ` +
  `paid up front — the first month IS the engagement, and each renewal is another month up front. ` +
  `Success fee banded like tax brackets: 5% of the first $1M, 4% of $1–5M, 3% of $5–10M, 2% above $10M, ` +
  `${money(FEE_FLOOR_CENTS)} minimum. Every retainer dollar credits against the success fee at close; ` +
  `credit caps at the fee; no close, no credit. Premium adds no second formula — the retainer simply ` +
  `continues through integration, and add-on acquisitions run the same schedule.`;

/* ── formatting (local, dependency-free) ──────────────────────────────── */

function money(cents: number): string {
  const d = cents / 100;
  if (Math.abs(d) >= 1_000_000) {
    const m = d / 1_000_000;
    return `$${(Math.round(m * 100) / 100).toString().replace(/\.0+$/, '')}M`;
  }
  if (Math.abs(d) >= 1_000) return `$${Math.round(d / 1_000)}K`;
  return `$${Math.round(d)}`;
}
