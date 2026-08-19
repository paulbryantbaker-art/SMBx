/**
 * "I ask three questions at day four" — the FIRST figure-layout one-pager.
 *
 * ── v1, 2026-08-18 ─────────────────────────────────────────────────────────
 * The artifact Paul iterated to through six mocks in one sitting (v2 wrap →
 * v3 golden section → v4 bigger+ladder → v5 dark ladder → v6 straightened),
 * approved as: figure layout, dark bloom ground, full-axis-corrected cutout,
 * bright-white CTA. The geometry is the BUILDER's law now (FORMATS §2.0), so
 * this spec carries only copy — which is the whole point of the conversion.
 *
 * COPY PROVENANCE. Every figure here is P-2 · Dead Deal Economics copy from
 * `content/studio/CAMPAIGN_2026-08-18.md` (the content of record): the ~47%
 * Axial share, its 75-transaction member-reported basis, and the interest
 * disclosure. The three questions are P-2 page 9 verbatim in shortened form.
 * No new figure was introduced for this post.
 *
 * CALENDAR NOTE, for the queue log. This post is NOT on the 30-day calendar —
 * it is a bonus artifact born of the format work. It shares its material with
 * P-2, which posts Thursday Aug 20 as the flagship carousel. If both run this
 * week the one-pager CLOSES on a question the carousel answers, which reads
 * as a teaser rather than a repeat — but posting order and spacing are Paul's
 * call, and parking this until after Thursday is the conservative move.
 *
 * Render (Mac, from the studio root — resolves the default figure asset):
 *   npx tsx ../scripts/studio/build-onepager.mts \
 *     markets/home-services/specs/day-four-questions.post.mts \
 *     --out markets/home-services/collateral/day-four-questions/$(date +%F)
 */
export const post = {
  slug: 'day-four-questions',
  /* no `layout`, no `image` → figure layout, brand/founder-standing.png */
  kicker: 'HOW I UNDERWRITE',
  hook: 'I ask three questions at day four.',
  body: 'About 47% of broken post-LOI deals now die on diligence findings — and the findings were almost always visible before anybody signed.',
  points: [
    { k: 'Do the add-backs survive a QoE?', v: 'Not “are they explained”. Do they survive somebody hostile with the ledger open.' },
    { k: 'Does revenue survive the owner’s exit?', v: 'Name the accounts that leave in the same car, and price the deal without them.' },
    { k: 'Is the peg built on actuals?', v: 'A peg assembled from the seller’s normalisation is a number you renegotiate at close, from the weaker position.' },
  ],
  note: 'Source: Axial Dead Deal Report, 75 transactions, 2025 — member-reported; Axial sells access to the channel it measures.',
  cta: 'smbx.ai  →',
  caption: [
    'Deals used to die at the price. Now they die in diligence — about 47% of broken post-LOI deals in the lower middle market, per Axial’s dead-deal data (75 transactions, member-reported — and Axial sells access to the channel it measures, so weigh accordingly).',
    '',
    'What that number changed about how I work: the findings that kill deals in exclusivity are almost always visible before the LOI. So I ask three questions at day four, not day sixty.',
    '',
    'Do the add-backs survive a QoE — not “are they explained,” but do they survive somebody hostile with the general ledger open.',
    '',
    'Does the revenue survive the owner’s exit — name the accounts that leave in the same car, and price the deal without them.',
    '',
    'Is the working capital peg built on actuals — because a peg built on the seller’s normalisation is a number you renegotiate at close, from the weaker position.',
    '',
    'None of the three needs a data room. All three are cheaper at day four than at day sixty, and the expensive version isn’t the dead deal — it’s the one that closes anyway, with the finding moved to the integration budget.',
    '',
    'What’s the question you wish you’d asked at day four on your last deal?',
    '',
    '#MergersAndAcquisitions #PrivateEquity #CorporateDevelopment #DueDiligence',
  ].join('\n'),
};
