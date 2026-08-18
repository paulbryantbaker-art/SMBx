/**
 * Dead Deal Economics — P-2, Thu 20 Aug 2026.
 *
 * THE MESSAGE, in one line: the constraint on closing moved from money to
 * findings, and the four findings that kill a deal in exclusivity are the same
 * four that wreck the integration when the deal closes anyway.
 *
 * ── v1, 2026-08-18 ─────────────────────────────────────────────────────────
 * Built from the copy authored in `content/studio/CAMPAIGN_2026-08-18.md`
 * §3 · P-2, which is the content of record for `campaign-2026-08-18.json`.
 * Every page below is that copy transposed into the slot vocabulary; no
 * figure was added to it and none was rounded.
 *
 * THE SOURCE-INTEREST LAW IS DOING REAL WORK IN THIS DECK. Axial sells access
 * to the intermediated channel it measures, and QoE providers publish
 * broken-deal costs to sell QoE. POST_QUEUE.md law 2 requires the interest
 * disclosed INLINE, in the post — not in a footnote and not in the caption
 * only. So every page carrying an Axial figure names Axial and says what it
 * sells, and page 4 says the same about the QoE shops. For this audience that
 * is the differentiator, not a hedge: a competitor posting the same 47% will
 * not do it.
 *
 * WHAT IS DELIBERATELY NOT HERE, and why.
 *
 *   1. NO "ONE-THIRD OF LOIs NEVER CLOSE". It is on the campaign's own
 *      could-not-verify list and the law check for this post names it as not
 *      used. It is the most quotable line available and it is not sourced.
 *   2. NO CAUSAL CLAIM FOR PRE-LOI SCREENING. Page 8 exists to REFUSE it.
 *      Vendors assert it; no causal study exists. Under the three laws that
 *      grades THIN, and a THIN figure gets an argument, not a number. This is
 *      the page that makes the rest of the deck believable, so it is not the
 *      page to cut for room.
 *   3. NO SELF-REFERENCE AND NO FEE CONTENT. The pillar is Dead Deal
 *      Economics; the referral-safety note on the sibling post (P-6) applies
 *      here too — the funnel is described as arithmetic and cost, never as
 *      "I can find you deals". Page 9 asks three questions and sells nothing.
 *   4. NO IMAGE, ANYWHERE. `markets/home-services/media/` holds fifteen band
 *      photographs and every one of them fails `carta-guard`'s ground check
 *      (they carry a bone or green-tinted border rather than white). An
 *      artifact built on a failing asset is off-language at 300dpi, and the
 *      named failure mode from the old home-services spec was pointing at
 *      filenames — pest.png, plumbing.png, electrical.png — that were never
 *      on disk at all. So there is no `image:` key in this file, the `trade`
 *      page kind is unused for want of art, and the cover carries its
 *      argument on the numeral and the stat strip. FORMATS §4.1 is the
 *      prerequisite for a version with pictures: write the brief first.
 *   5. NO PAGE-COUNT CTA. No report has been rendered behind this deck, and
 *      the home-services cover could once say "61 pages" only because that
 *      was verified with pdfinfo against a real render.
 *
 * PAGE 5 IS A DIAGRAM OF TWO OF THE FOUR BUYER TYPES, not all four. The bar
 * kind takes exactly two, the ratio between the heights is the ratio between
 * the numbers (37/129 = 0.287, so 98/340), and the other two buyer types are
 * named in the body where they cost nothing to state honestly. Four bars
 * eyeballed onto a two-bar kind is a chart that lies.
 */
export const deck = {
  slug: 'dead-deal-economics',
  kicker: 'DEAL MECHANICS',
  cover: {
    hook: 'Deals don’t die at price anymore. They die in diligence.',
    sub: 'Ten pages on what that costs — and on what it predicts about the integration you are about to inherit.',
    /* Every figure on this cover is cited on a page of this same deck: the
       numeral on page 2, the stats on pages 3, 4 and 5. verify-spec cannot
       see a cover, and a cover is the surface most likely to travel without
       its deck. */
    numeral: '47', unit: '%',
    numeralLabel: 'of broken post-LOI deals died on\ndiligence findings in 2025',
    stats: [
      { value: '2x', label: 'rise in QoE-driven breaks since 2023' },
      { value: '$25–50K', label: 'of QoE before a deal dies' },
      { value: '37 days', label: 'family offices, LOI to walking away' },
    ],
  },
  pages: [
    { kind: 'numeral', numeral: '47%',
      head: 'of broken post-LOI deals died on diligence findings.',
      body: 'That is 75 transactions in the lower middle market, reported by the members of a marketplace rather than observed independently — and the marketplace sells access to the intermediated channel it is measuring, so the number should be read as the channel describing itself. It is also the only recent series anybody publishes on why lower-middle-market deals break after exclusivity, which is why it opens the argument rather than being left out of it. Treat it as the shape of the problem and not as a national rate.',
      source: 'Axial Dead Deal Report, 75 transactions, 2025' },

    { kind: 'diagram', tag: 'THE KILLER MOVED', head: 'Quality of earnings overtook financing as the cause of death.', connector: 'to',
      bars: [
        { label: '10.6%', sub: 'QoE discrepancies as cause of break, 2023', style: 'ink', h: 169 },
        { label: '21.3%', sub: 'the same measure, 2025', style: 'green', h: 340 },
      ],
      body: 'Over exactly the same period the movement ran the other way on money: financing-driven breaks fell from 21.3% to 10.7%. The two lines crossed. Whatever else is true about this market, the binding constraint on getting a deal closed is no longer whether the capital shows up — it is what the capital finds when it looks. Same publisher as the figure above, same member-reported sample, same commercial interest.',
      source: 'Axial Dead Deal Report, 2023–2025' },

    { kind: 'statement', tag: 'THE BILL', head: 'A dead deal costs $25–50K before it is dead.',
      body: 'That is quality of earnings alone at lower-middle-market sizes, with legal on top and the ranges varying by provider — and the shops publishing these figures are the shops selling the work, which is worth knowing before the range is treated as a benchmark. The sting is in what the spend buys when it works: one sponsor, reporting through the same marketplace, had a QoE surface an EBITDA gap of between $265K and $594K. They found it after paying for it. That is the good outcome. The bad one is paying for the QoE and closing anyway.',
      source: 'Axial member reporting; QoE provider pricing, 2025' },

    { kind: 'diagram', tag: 'TIME UNDER EXCLUSIVITY', head: 'How long each buyer sits before a deal dies.', connector: 'vs',
      bars: [
        { label: '37', sub: 'days · family offices', style: 'green', h: 98 },
        { label: '129', sub: 'days · independent sponsors', style: 'ink', h: 340 },
      ],
      body: 'The two not drawn here sit between them: corporates at 125 days and private equity funds at 106. The spread is not a discipline story and it should not be read as one. A family office walking at 37 days has somewhere else to put the money and nobody to answer to about the quarter; an independent sponsor at 129 has neither, and the cost of walking is the cost of starting the search again. Bench depth sets the clock.',
      source: 'Axial Dead Deal Report, 2025' },

    { kind: 'statement', tag: 'THE UNCOMFORTABLE PART', head: 'The findings were there before the LOI.',
      body: 'Owner dependence. Customer concentration. Add-backs that do not survive scrutiny. A working capital peg built on the broker’s normalisation instead of on actuals. None of the four is exotic, none of them requires a data room to suspect, and all four are routinely priced as though they were discovered rather than as though they were always going to be there. What exclusivity buys is confirmation. What it is often spent on is discovery.',
      source: 'smbX, from the four findings named across the Axial breaks' },

    { kind: 'statement', tag: 'THE SEAM', tagColor: 'brass', head: 'A finding you didn’t price doesn’t disappear at close. It moves.',
      body: 'This is the part that makes dead-deal data worth reading even when your deal closes. The same four findings that kill a transaction in exclusivity are the four that wreck an integration when the transaction goes through anyway. Owner dependence becomes a retention problem in month three. Concentration becomes a revenue cliff at renewal. Unsupported add-backs become a gross-margin miss. A peg built on normalised numbers becomes a working-capital call. The finding does not go away because you decided to proceed — it changes which budget it lands in.',
      source: 'smbX, 2026' },

    { kind: 'statement', tag: 'THE HONEST PAGE', head: 'Does pre-LOI screening actually reduce break rates? Nobody has shown it.',
      body: 'The vendors selling screening say yes, and they would. No causal study exists — not a controlled one, not a longitudinal one, not one at all. So the defensible position is narrower than the one being marketed to you: screening is cheap relative to a dead deal, and its payout is unproven. That is the truthful state of the evidence and it is the reason this page is in the deck rather than quietly left out. A claim this convenient should be the one you interrogate hardest.',
      source: 'smbX evidence review, 2026 — no causal study located' },

    { kind: 'statement', tag: 'BEFORE THE LOI', head: 'Three questions, asked at day four instead of day sixty.',
      body: 'Do the add-backs survive a quality of earnings? Not "are they explained" — do they survive somebody hostile with the general ledger open. Does the revenue survive the owner’s exit? Name the accounts that leave with them and price the deal without those accounts. Is the working capital peg built on actuals? A peg assembled from the seller’s normalised presentation is a number you will renegotiate at close, from the weaker position, with the money already spent.',
      source: 'smbX, 2026' },
  ],
  closer: {
    tag: 'FOR THE ACQUIRER',
    head: 'The price is set at close. What you actually paid is settled later.',
    body: 'For those who have had a deal die in exclusivity: which finding killed it — and could you have seen it at day four? I read everything.',
  },
  caption: [
    'Three years ago, deals died on financing. Now they die on findings.',
    '',
    'Axial’s dead-deal data (75 broken lower-middle-market transactions, member-reported — and Axial sells the channel it measures) puts diligence findings behind ~47% of post-LOI breaks in 2025. QoE discrepancies as the killer more than doubled in two years while financing breaks fell by half.',
    '',
    'The carousel covers what a dead deal costs, how long each buyer type sits in exclusivity before walking, and the part that interests me most: the four findings that kill deals are the same four that wreck integrations when the deal closes anyway.',
    '',
    'A finding you didn’t price doesn’t disappear at close. It moves to the integration budget.',
    '',
    'One page in there refuses a claim rather than making it. Does pre-LOI screening actually reduce break rates? The vendors say yes. No causal study exists. Cheap insurance with an unproven payout is the honest version, so that is what the page says.',
    '',
    'Which finding killed your last dead deal — and could you have seen it at day 4?',
    '',
    '#MergersAndAcquisitions #PrivateEquity #CorporateDevelopment #DueDiligence',
  ].join('\n'),
};
