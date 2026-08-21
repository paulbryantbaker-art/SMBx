/**
 * "You are not paying for potential" — Monolith one page, 2026-08-20.
 *
 * The card that goes with Paul's post on the volume/value paradox: M&A
 * volume down, headline value up, and a widening spread between what large
 * and small platforms clear.
 *
 * ── THE FIGURE, VERIFIED ───────────────────────────────────────────────────
 * The post attributes 2.8 turns to GF Data. Checked before it went on a card,
 * and it holds. The CARD states it as 40% more per dollar of earnings — the
 * same fact without the trade vocabulary (see the numeral comment) — and
 * carries a vintage and a framing the post leaves loose, because a figure a
 * reader cannot grade is a figure they cannot trust:
 *
 *   GF Data, platform buyouts, FIRST NINE MONTHS OF 2025. Large platforms
 *   ($100–500M TEV) averaged 9.8x TTM EBITDA; sub-$100M platforms 7.0x. The
 *   gap is 2.8x — up from 2.4x at the half, against a long-run average of
 *   2.6x. GF Data's contributors attribute the widening to a preference for
 *   scale and creditworthy assets under tighter lending.
 *
 * TWO PRECISIONS THE CARD KEEPS AND THE POST DOES NOT:
 *   1. The spread is measured by SIZE, not by quality. "A-tier vs the rest"
 *      is a reading of it, not what the series reports — so the card says
 *      large and small, and the argument does the interpreting out loud.
 *   2. GF Data sells the database it reports from. Named on the card, per the
 *      standing rule that every source's commercial interest appears on the
 *      page its figure appears on.
 *
 * THE $1.2 TRILLION IS DELIBERATELY NOT HERE. It checks out but is narrower
 * than the post implies — US M&A value over the FIRST FIVE MONTHS of 2026,
 * with volume down 4% — and a one-page card carries one idea. Putting a
 * second figure on it would need a second source line and would split the
 * argument. It stays in the post copy, where the framing has room.
 *
 * THE LINE. The post speaks to sponsors and, in one passage, to sellers about
 * closing the gap. The card is buy-side throughout: it reads from the
 * acquirer's seat, prices risk, and never advises a seller on positioning.
 *
 * THE PROCESS THAT PRODUCED THIS is now FORMATS.md §2.3, and
 * studio/specs/_template.post.mts is that section as a fillable spec. Start
 * there rather than from this file.
 *
 * Render (Mac):
 *   npx tsx ../scripts/studio/build-onepager.mts specs/valuation-gap.post.mts \
 *     --out collateral/valuation-gap/$(date +%F)
 * Sandbox (no Chromium):
 *   python3 scripts/studio/figure-deck.py studio/specs/valuation-gap.post.mts \
 *     --card --ground monolith-dark --out <dir>
 */
export const post = {
  slug: 'valuation-gap',
  ground: 'monolith-dark',
  kicker: 'THE VALUATION GAP',
  /* 40% IS DERIVED, AND HERE IS THE WORKING (a card has no Derivations
     section, so it is registered in the spec and in BUILD.txt): 9.8 / 7.0 =
     1.40, so a dollar of EBITDA costs 40% more at the top of the range than
     at the bottom. Nothing is rounded — both multiples are GF Data's own.

     WHY NOT "2.8 TURNS" (Paul, 2026-08-20: "people may not know what that
     means"). Turns are trade language. A percentage on a dollar of profit
     needs no glossary and says the same thing.

     WHY NOT A DOLLAR FIGURE. "$28M on $10M of EBITDA" is more visceral and
     it is a trap: GF Data's bands are defined by ENTERPRISE VALUE, and $10M
     of EBITDA at 9.8x is $98M — inside the SUB-$100M band, not the large one.
     The illustration would quietly contradict the series it cites. The ratio
     carries no such assumption. */
  numeral: '40%',
  /* ONE LINE, ~15 characters — the plate label sits beside the figure's head
     and anything that wraps runs into the face. */
  numeralLabel: 'more per dollar',
  hook: 'You are paying for the day after close.',
  body: 'Large platforms clear 9.8x. Sub-$100M platforms, 7.0x. Same earnings, two prices.',
  points: [
    { k: 'Scale reads as creditworthy.', v: '' },
    { k: 'Mess is priced as a cost.', v: '' },
    { k: 'You buy execution certainty.', v: '' },
  ],
  note: 'GF Data, platform buyouts, first nine months of 2025. GF Data sells the database it reports from.',
  cta: 'smbx.ai  →',
};
