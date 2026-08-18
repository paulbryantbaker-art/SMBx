/**
 * THE BUY-BOX — what a buyer settles before the first call, and why the number
 * underneath it is softer than the market treats it.
 *
 * BUILT DELIBERATELY NARROW. The obvious version of this deck carries §10.1's
 * anchor-then-cluster price bands ($3–8M EBITDA anchors, 4–6x tuck-ins, 7–11x
 * for a qualifying platform) and §1.6's worked re-rate ("a $4M-EBITDA shop at
 * 60% recurring trades 8–9x versus 5–6x at 20%"). Those are NOT here.
 *
 * Checked 2026-08-03 with `figuresNotIn` against markets/home-services/research/:
 *   §1.6 re-rate example      ✗ $4M, 9x, 6x  untraceable
 *   §10.1 anchor-then-cluster ✗ $3M, 6x, 8x  untraceable
 *   §10.1 metro-leader bands  ✗ 8x           untraceable
 * They live in the master because the three commissioned workstreams were never
 * landed in research/ as source files. `verify-spec` passes them — it checks the
 * spec against the MASTER, and they are in the master — so the guard rail would
 * not have caught this. Page 7 says out loud that they are missing.
 *
 * Every figure that IS here was named at primary source in
 * research/verification-pass-2026-07-28.md or is Part XI's own primary-source work.
 *
 * THE MESSAGE, in one line: a buy-box is what you wrote down before you got
 * excited — and the number most buy-boxes rest on is softer than the market
 * treats it.
 *
 * Bookends are auto-added. Do not author a cover or closer page.
 */
const CAPTION = [
  'Everyone has a thesis. Almost nobody has a buy-box.',
  '',
  'A thesis is a story about a market. A buy-box is what you decided before you got excited \u2014 written down, before the first call.',
  '',
  'Here is the one I would hand a buyer in residential home services, including the part most decks leave out. Commercial MEP is a different market and gets compared to different companies — that is a separate deck.',
  '',
  'The criterion that moves price most is recurring revenue:',
  '',
  '\u2022 Below 10% is a discount.',
  '\u2022 15\u201330% is the market.',
  '\u2022 40%+ is the premium \u2014 where you are underwritten as a platform instead of a book of jobs.',
  '',
  'Now the uncomfortable part.',
  '',
  'That same threshold is quoted by the same broker, on a single page, as 35\u201350% of platform revenue at scale, as 40\u201360%, and as 50%+. Its own multiples report says market penetration is 15\u201330% and premium is 40%+.',
  '',
  'Four numbers. One threshold. One publisher.',
  '',
  'We underwrite to 40%+ \u2014 and we say which of the four we took. That is most of the difference between a teaser and a map.',
  '',
  'Same discipline on multiples. Three sets are in circulation, and each one measures a different group of companies:',
  '',
  '\u2022 Capstone tracks HVAC services including upmarket and strategic deals: 9.5x across 2024\u2013YTD 2026, against 13.3x in 2021\u201323.',
  '\u2022 GF Data covers PE-sponsored lower middle market: 7.2x blended, with no platform-versus-add-on split published.',
  '\u2022 CT Acquisitions covers sub-$25M owner-operators.',
  '',
  'Do not average them. A blended figure built from those three describes no market that exists.',
  '',
  'And one thing you will not find in this deck: a going price, either for the first business you buy in a market or for the smaller ones you fold in afterwards. Those numbers trace, in my own files, to research I can no longer show you. So they are not on the page.',
  '',
  'What is missing on purpose is usually the more useful half of a buy-box.',
  '',
  'If you are underwriting home services right now \u2014 what is actually in your buy-box, and when did you last write it down? \ud83d\udc47',
  '',
  '(Link in the comments for the full assessment.)',
  '',
  '#MergersAndAcquisitions #PrivateEquity #HVAC #CorporateDevelopment #LowerMiddleMarket',
].join('\n');

export const deck = {
  slug: 'hs-buybox',
  kicker: 'HOME SERVICES BUY-BOX',   // named on the surface, 2026-08-03: every figure in this deck is a RESIDENTIAL home-services figure. Commercial MEP has its own deck and its own comp set.
  cover: {
    hook: 'Everyone has a thesis. Almost nobody has a buy-box.',
    sub: 'What a residential home-services buyer settles before the first call — and why the number underneath it is softer than the market treats it.',
    image: 'trades/service-van-dark.png', imagePos: '50% 50%',
    /* 61 pages, verified with pdfinfo against the 2026-08-03 render. */
    cta: 'Read the full 61-page Home Services\nMarket Assessment, August 2026\nsmbx.ai/research',
    numeral: '40', unit: '%',
    numeralLabel: 'recurring revenue\nis the line',
    /* Each stat is cited on a body page: 9.5x and 13.3x on page 4, 7.2x on page 5. */
    stats: [
      { value: '9.5x', label: 'HVAC services, 2024–YTD 2026' },
      { value: '13.3x', label: 'the same trade, 2021–23' },
      { value: '7.2x', label: 'GF Data blended, no split published' },
    ],
  },
  pages: [
    { kind: 'numeral', numeral: '40%', head: 'recurring revenue is where a contractor stops being a contractor.',
      body: 'Below 10% is a discount. 15–30% is the market. 40%+ is where the premium sits, and where a buyer underwrites you as a platform rather than a book of jobs. Of everything in a buy-box it is the criterion that moves price most — and the only one a seller can still change.',
      source: 'CT Acquisitions Multiples Report, April 2026' },

    { kind: 'statement', tag: 'THE ASSET', head: "The asset isn't the truck. It's the service agreement.",
      body: 'Big buyers look at a maintenance book the way a software buyer looks at subscriptions. How many agreements are actually live. How many customers leave, and how soon. Whether the contracts survive a change of owner. How many people pay automatically rather than by invoice. None of that is on the profit-and-loss statement, and all of it happens before anyone argues about price.' },

    { kind: 'statement', tagColor: 'brass', tag: 'THE NUMBER IS SOFT', head: 'One publisher. One page. Three different numbers.',
      body: 'The whole idea that repeat revenue lifts the price rests on one threshold. The same broker quotes it three ways on a single page: 35–50% of revenue at scale, 40–60%, and 50%+. Its own report on multiples then says the market sits at 15–30% and the premium starts at 40%+. Four numbers for one line. We use 40%+, and we say which of the four we took.',
      source: 'CT Acquisitions, April 2026' },

    { kind: 'diagram', tag: 'THE SECTOR GOT CHEAPER', head: 'Roughly four turns cheaper than it was three years ago.',
      body: 'Two period averages on the same tracked universe. The publisher reports the averages, not the difference.',
      connector: 'vs',
      /* Bar heights are the ratio: 9.5 ÷ 13.3 = 0.714, and 340 × 0.714 = 243. */
      bars: [
        { label: '13.3x', sub: '2021–2023', style: 'ink', h: 340 },
        { label: '9.5x', sub: '2024–YTD 2026', style: 'green', h: 243 },
      ],
      source: 'Capstone Partners, 27 July 2026' },

    { kind: 'statement', tagColor: 'brass', tag: 'DO NOT AVERAGE THEM', head: 'Three multiple sets. Three different populations.',
      body: 'Capstone tracks HVAC services including upmarket and strategic deals. GF Data covers PE-sponsored lower-middle-market transactions and publishes 7.2x blended, with no platform-versus-add-on split. CT Acquisitions covers sub-$25M owner-operators. They are not comparable, and a blended figure built from them describes no market that exists.',
      source: 'Capstone; GF Data H1 2025; CT Acquisitions' },

    { kind: 'trade', name: 'DALLAS–FORT WORTH', image: 'trades/hvac-ac.png', imagePos: '50% 55%',
      numeral: '18', head: 'The register said four.',
      body: 'A parent-by-parent check of all 34 consolidator-register entries against their own published rosters found eighteen holding a verified DFW location. And roughly 280 establishments in the 10–249 employee band match no consolidator at all. Saturated at the platform level, with several hundred businesses underneath it.',
      source: 'Census CBP 2023; owner-published rosters' },

    { kind: 'statement', tag: 'WHAT IS NOT ON THESE PAGES', head: 'No entry multiple we cannot source.',
      body: 'People quote going prices for both: the first business you buy in a market, and the smaller ones you fold in afterwards. In our own files, both trace back to research we can no longer show you. So they are not here. Everything above survived a check against a named source. What did not is missing on purpose. That is usually the more useful half.' },
  ],
  closer: {
    tag: 'THE BUY-BOX',
    head: 'A buy-box is what you decided before you got excited.',
    body: 'Recurring mix, EBITDA band, owner dependence, a cap on new-construction revenue, and the metros where the rule bites. Written down before the first call — so the deal you walk away from is a decision rather than a mood.',
  },
  caption: CAPTION,
};
