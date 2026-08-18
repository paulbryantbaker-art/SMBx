/**
 * Home services lane teardown — six trades, buy-side framing.
 *
 * THE MESSAGE, in one line: the fragmentation is the thesis, not the market
 * size — and most of the numbers quoted around this sector do not survive being
 * looked up.
 *
 * ── v3, 2026-08-03 ────────────────────────────────────────────────────────
 * Rewritten for plain language against `voice-check.mts` (Paul: plain language
 * on every surface, always). Twenty findings in v2: `ARR`, `auto-charge
 * penetration`, `re-rate`, `roll-up`, `bolt-ons`, `LOI`, `dry powder`, six
 * semicolons in display copy, three caption sentences over 38 words, and no
 * stated message. Every figure is unchanged.
 *
 * TWO CLAIMS WERE ALSO WRONG, and neither is a copy problem. Both are cases of
 * "a derived artifact does not follow its master" (CLAUDE.md): the master was
 * corrected on 2026-07-28, this spec was rebuilt on 2026-08-01, and it carried
 * the retired readings anyway because `verify-spec.mts` checks figures, not the
 * sentences around them.
 *
 *   1. Page 3 said GF Data has "platforms and add-ons both averaging ~7.2x".
 *      A.0.3 §D: GF Data publishes only a BLENDED figure. The platform/add-on
 *      split is subscriber-only and its own Q1 2026 commentary points the other
 *      way. Corrected to what GF Data actually publishes.
 *   2. Page 11's numeral was "39/77". A.0.3 §D DOWNGRADED that figure — it
 *      traces only to an aggregator citing "Capstone data cited by S&P Global",
 *      neither original retrievable, and a second aggregator dates the same 77
 *      to mid-2025. The page now leads on Capstone's direct 47 of 92.
 *
 * ── v4, 2026-08-12 — SOURCE-LINE PASS ────────────────────────────────────
 * `sourcing-protection.mts` returned eight findings against the cards. The
 * corpus was fine; the LABELS threw it away, which is the fault a sister deck
 * was publicly called slop for. What changed:
 *
 *   · Pages 4, 5, 6, 8, 9, 10 now name a terminal instrument the reader can
 *     retrieve — the Economic Census table id, the SUSB series and NAICS code,
 *     the BLS producer-price series, the BLS occupational codes — instead of a
 *     vendor's brand name. The vendors stay where the figure is genuinely
 *     theirs, and are described as what they are.
 *   · Page 5 no longer cites IBISWorld twice. The $121.5B is ServiceTitan's
 *     restatement and matches no current IBISWorld value; the card now says so
 *     rather than calling it "a different IBISWorld cut."
 *   · Page 9's "45–70% of data-center construction cost" is GONE. Nothing in
 *     the corpus sources it, and the old line credited it to Goldman, which
 *     published the power-demand projection and not that share. The page now
 *     leads on the one electrical figure with a federal table under it.
 *   · Page 8 loses "KKR turned C.H.I. Overhead Doors into a 9.8x return."
 *     It is asserted in the master with no citation anywhere in the corpus.
 *   · Page 11 keeps Capstone and now says on the card what Capstone is.
 *
 * THREE CLAIMS WERE WRONG INDEPENDENT OF THEIR CITATIONS, and none of them is
 * a sourcing fault:
 *
 *   1. Page 1 and the caption said "three quarters of critical-trade OPERATORS
 *      are still independent." A.0.3 §D: McKinsey's 76% is a share of MARKET,
 *      not a count of companies — that restatement is exactly how the error
 *      entered the literature, and this deck was carrying it.
 *   2. Page 1's "roughly 111,000 businesses" is the VantaInsights "111,200
 *      establishments" that A.0.2 retired along with its $392B. The Economic
 *      Census figure is 112,088 firms.
 *   3. Page 6's "most fragmented trade on federal record" is contradicted by
 *      this master's own CRS table — remodelers 97.8%, flooring 96.1% and
 *      painting 95.6% all sit above roofing's 90.8%.
 *
 * TWO CARDS COULD NOT BE FIXED and are left flagged on purpose: page 3 and
 * page 11. No government table, filed exhibit or docket prices a private
 * transaction or counts private M&A in this sector. The only named datasets
 * are a subscription data provider and an advisory that sells M&A into the
 * trade it is measuring. Both are now described as what they are on the card,
 * which is the honest option; dressing either as an instrument is not.
 *
 * BUILT OFF THE CORRECTED MASTER. Every figure traces to
 * `markets/home-services/master.md`.
 *
 * Images: the recurring lane set in ./assets/trades/ (referenced as
 * 'trades/<name>.png' — the resolver joins the whole ref onto ./media then
 * ./assets). Pest control runs text-only — no art exists for it, and a stock
 * photo would break house law.
 */
export const deck = {
  slug: 'home-services-teardown',
  kicker: 'LANE TEARDOWN',
  cover: {
    hook: 'The buyer math on home services',
    sub: 'Six trades, one playbook — and the number that matters is not the market size.',
    image: 'trades/homes.png', imagePos: '50% 50%',
    /* The cover carries the argument, not just the title (2026-08-01).
       Every figure below is cited on a page of this same deck — the numeral on
       page 2, the multiples on page 4, the labour count on page 11. A cover
       figure survives the same audit as a body figure.
       Deliberately NOT here: any "six trades combined" total. The rows do not
       sum — vintages, publishers and scopes differ — and the $700B opener was
       cut from this spec for exactly that reason. */
    /* The cover CTA names the document, not just the site (Paul, 2026-08-03).
       61 pages, verified with pdfinfo against the 2026-08-03 render — the
       report's own last footer reads "Page 61 / 61". */
    cta: 'Read the full 61-page Home Services\nMarket Assessment, August 2026\nsmbx.ai/research',
    numeral: '89', unit: '%',
    numeralLabel: 'of shops have fewer\nthan twenty employees',
    stats: [
      { value: '4-8x', label: 'what an independent sells for' },
      { value: '16-20x', label: 'what a platform recapitalizes at' },
      { value: '2.1M', label: 'trades jobs unfilled by 2030' },
    ],
  },
  pages: [
    { kind: 'numeral', numeral: '89%', head: 'of plumbing and HVAC shops have fewer than twenty employees.',
      body: 'The federal census counts 112,088 firms under a single code — plumbing and heating together — and about nine in ten of them are that small. Independents still hold about three quarters of the market in critical, hard-to-find services. That is a share of the market, not a count of the companies. In plumbing, no company holds much above 2% of the country. That is the whole thesis — not the size of the market, the shape of it.',
      source: '2022 Economic Census, table EC2223BASIC (NAICS 238220); Census SUSB 2022; McKinsey, 25 Feb 2026' },

    { kind: 'statement', tag: 'THE ANNUITY', head: "The asset isn't the truck. It's the service agreement.",
      body: 'Buyers look at a maintenance book the way a software buyer looks at subscriptions. How many agreements are live. How many customers leave, and how soon. Whether the contracts survive a change of owner, and how many people pay automatically rather than by invoice. Push repeat revenue high enough and the business gets valued as a platform rather than a contractor. Published penetration benchmarks scatter widely and mostly come from vendors, so underwrite the book in front of you rather than a threshold.' },

    { kind: 'diagram', tag: 'THE SAME CASH FLOW, REPRICED', head: 'Same cash flow. Three times the multiple.', connector: 'vs', bars: [
      { label: '4–8x', sub: 'what an independent sells for', style: 'ink', h: 176 },
      { label: '16–20x', sub: 'what a platform recapitalizes at', style: 'green', h: 340 },
    ],
      body: 'A $2M-EBITDA independent trades at 4–6x. Fold the same cash flow into a consolidator whose own aggregate earnings are valued at 15–20x, and that $2M is marked at $30–40M. Nothing about the business changed. One caution the headlines skip: GF Data publishes a single blended figure of about 7.2x across lower-middle-market deals, and nothing finer than that. The wide spread belongs to the trophy tier, not to the market.',
      source: 'GF Data via ACG, FY2025 report (a subscription data provider, sponsor-backed lower-middle-market deals); Reuters, 28 May 2026' },

    { kind: 'trade', name: 'HVAC', image: 'trades/hvac-ac.png', imagePos: '50% 55%', numeral: '$158.4B', head: 'The blueprint — and the proving ground.',
      body: 'The most consolidated of the trades and the one that reset the ceiling. Apollo reportedly took a minority position in Apex at a $10 billion valuation including debt in May 2026, per Reuters citing sources familiar. Terms were not disclosed in the official announcement. Read the size with care. Heating and plumbing share one federal code, and the census measures the two together at $297.6B for 2022. The trade estimate is a different ruler, not a piece of that one.',
      source: '2022 Economic Census, table EC2223BASIC (NAICS 238220); IBISWorld HVAC contractors, 2025 figure, page updated Jan 2026; Reuters, 28 May 2026' },

    { kind: 'trade', name: 'PLUMBING', image: 'trades/plumbing-van.png', imagePos: '50% 52%', numeral: '$191.4B', head: 'Bigger than HVAC — and nobody holds more than about 2% of it.',
      body: 'Emergencies and code-mandated work that do not wait for the economy. The lead over HVAC is a total-market lead, commercial and institutional work included. On residential alone, HVAC is at least as large. IBISWorld’s plumbers report says $191.4B for 2026. The $121.5B you see everywhere is ServiceTitan’s restatement of it, and it matches no current IBISWorld plumbing value. Underwrite the range, never a point. Fixture and material costs, meanwhile, are up 35.4% since January 2020 on the federal price index.',
      source: 'IBISWorld plumbers report, 2026; ServiceTitan, 7 Apr 2025 (field-software vendor, citing IBISWorld); BLS producer price index, series WPU1054' },

    { kind: 'trade', name: 'ROOFING', image: 'trades/roofing.png', imagePos: '50% 46%', numeral: '$92.5B', head: 'Nine in ten of these firms have fewer than twenty employees.',
      body: 'That is 90.8% of 24,044 employer firms on the federal record, with roughly 64% of them under four people. The catch is that the revenue does not repeat. It is storm-driven replacement work with no service agreement underneath it. Buy it because the market is in pieces, and price it for the weather rather than for the story.',
      source: 'Census SUSB 2022, NAICS 238160; IBISWorld roofing contractors, 2026' },

    { kind: 'trade', name: 'PEST CONTROL', numeral: '85.4%', head: 'of residential pest service revenue recurs — the only repeat-revenue share here with a survey behind it.',
      body: 'Subscriptions, not projects, which is why independents there trade at 6–10x. Rollins did 26 acquisitions in 2025 on $3.8 billion of revenue, putting $310M into them. Rentokil and EQT-backed Anticimex are working the same long tail of about 33,000 operators. Note the scope: that is residential service revenue in the trade association’s own survey, not all pest revenue.',
      source: 'Specialty Consultants for NPMA, 26th ed., 1 Apr 2026; Rollins FY2025 10-K, filed 12 Feb 2026' },

    { kind: 'trade', name: 'GARAGE DOORS', image: 'trades/garage-doors.png', imagePos: '50% 50%', numeral: '$16B', head: 'Small market. Institutional appetite.',
      body: 'Demand arrives when something breaks, and a torsion spring is not a weekend project. There is no federal code for garage doors. The census files these firms under finish carpentry, so the $16B is a consultancy estimate, from a brief whose readers are the buyers it describes. Oak Hill bought Guild Garage in March 2026 for "more than $800 million", per Reuters citing four people familiar. PitchBook puts the value at $800M on a 16x multiple.',
      source: 'FMI Corp, Private Equity Sector Brief on overhead and garage doors, Mar 2026; Reuters, 6 Mar 2026; PitchBook, 17 Apr 2026; 2022 Economic Census, NAICS 238350' },

    { kind: 'trade', name: 'ELECTRICAL', image: 'trades/electrical-ev.png', imagePos: '50% 48%', numeral: '$249.25B', head: 'is the federal census measure — four years old, and the only figure here with a table under it.',
      body: 'Every 2026 estimate of this trade measures something different. The widely quoted $347.5B counts low-voltage work, data cabling and telecom, so it is not a trades number, and the nearest alternative series folds in telecom and highway work too. So I will not quote you a current market size. The demand case stands without one: electric vehicles, heat pumps, solar, the grid and data centers. And the concentration is commercial, which leaves residential electrical less picked over than the aggregate implies.',
      source: '2022 Economic Census, table EC2223BASIC (NAICS 238210); IBISWorld electricians, 2026; Arizton US electrical contractors market report, updated Aug 2025' },

    { kind: 'numeral', numeral: '2.1M', head: 'skilled-trades jobs could go unfilled by 2030.',
      body: 'JLL’s count across electricians, HVAC techs, plumbers, pipefitters and equipment operators. The federal series is narrower and steadier: the Bureau of Labor Statistics projects about 40,100 heating-and-cooling and 44,000 plumbing openings a year through 2034. A study for LIXIL, the plumbing-products maker, puts the plumbing shortfall alone at roughly 550,000 by 2027. Whoever holds the licensed technicians holds the market. In diligence, a roster that transfers is the asset. An owner’s personal relationships are a discount.',
      source: 'JLL, 21 Apr 2026; BLS Occupational Outlook Handbook, SOC 49-9021 and 47-2152; John Dunham & Assoc. for LIXIL, 11 Mar 2026' },

    /* v2 led this page on "39/77". A.0.3 §D downgraded that figure — it traces
       only to an aggregator citing "Capstone data cited by S&P Global", neither
       original retrievable, and a second aggregator dates the same 77 to
       mid-2025. Capstone's direct count is what the page carries now. */
    { kind: 'numeral', numeral: '47/92', head: 'tracked HVAC deals went to private equity this year.',
      body: 'Capstone counted 92 announced or completed transactions year to date, down 4.2% on last year, with financial buyers taking 47. Of those, 38 were businesses folded into something the buyer already owned and only 9 were a first purchase in a new market, down from 10. A tidier "8% to 50%" trend gets quoted around this sector. It splices two different datasets and mis-dates one by a year. Read the count knowing who publishes it — an M&A advisory that sells into the sector it is measuring. No public table counts these deals.',
      source: 'Capstone Partners HVAC Services M&A Update, 27 July 2026 (an M&A advisory that sells into this sector)' },

    { kind: 'statement', tag: 'THE TRAP', tagColor: 'brass', head: 'The technicians and the book can walk at closing.',
      body: 'Customers are loyal to the technician, not the logo. Service agreements can carry clauses that let a customer leave when the business changes hands. They leave when integration changes what they were sold. Map technician retention and read the recurring contracts one by one before you sign a letter of intent. A buy-and-hold owner has no way out if the book walks after close.' },
  ],
  closer: {
    tag: 'FOR THE ACQUIRER',
    head: 'Buy where revenue recurs. Hold where it compounds.',
    body: 'Dense-metro service books with real repeat revenue, bought at an honest multiple and built on with smaller businesses folded in over time. Follow for the weekly teardowns.',
  },
  caption: [
    'Everyone sees the home-services consolidation. Fewer read the buyer math underneath it.',
    '',
    'I spent this week checking every number in my own home-services research against the original sources. Six of them did not survive.',
    '',
    'One was a line about trillions of dollars raised and waiting, hunting essential services. It turns out to be an all-sector total that somebody relabelled. Another was a market size credited to the Census that is not in the Census. A third was a share of the market that had been restated as a share of the companies — and I was carrying that one myself until this week.',
    '',
    'So this teardown leads with what actually holds up:',
    '',
    '• About 89% of plumbing and HVAC shops have fewer than twenty employees.',
    '• Independents still hold about three quarters of the market in critical, hard-to-find services.',
    '• In plumbing, nobody holds much above 2% of the country.',
    '',
    'The fragmentation was always the thesis. The total market size was never doing the work.',
    '',
    'The rest is in the carousel, six trades at a time. The jump from 4–8x to 16–20x, and who actually gets it. The 2.1 million unfilled trades jobs by 2030. And the trap where the technicians walk at closing.',
    '',
    'On electrical I still will not quote you a current market size. Every 2026 estimate measures something different, so the card carries the federal figure and says out loud how old it is.',
    '',
    'If you are buying in one of these trades, or operating in one, what are you seeing on the ground? I read everything. 👇',
    '',
    '#MergersAndAcquisitions #PrivateEquity #HomeServices #CorporateDevelopment',
  ].join('\n'),
};
