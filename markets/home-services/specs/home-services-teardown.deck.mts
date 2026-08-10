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
      { value: '15-20x', label: 'what a platform recapitalizes at' },
      { value: '2.1M', label: 'trades jobs unfilled by 2030' },
    ],
  },
  pages: [
    { kind: 'numeral', numeral: '89%', head: 'of plumbing and HVAC shops have fewer than twenty employees.',
      body: 'Roughly 111,000 businesses sit under one federal code, and about nine in ten of them are that small. Three quarters of critical-trade operators are still independent. In plumbing, no company holds even 2% of the country. That is the whole thesis — not the size of the market, the shape of it.',
      source: '2022 Economic Census, NAICS 238220; McKinsey' },

    { kind: 'statement', tag: 'THE ANNUITY', head: "The asset isn't the truck. It's the service agreement.",
      body: 'Buyers look at a maintenance book the way a software buyer looks at subscriptions. How many agreements are live. How many customers leave, and how soon. Whether the contracts survive a change of owner, and how many people pay automatically rather than by invoice. Push repeat revenue high enough and the business gets valued as a platform rather than a contractor. Published penetration benchmarks scatter widely and mostly come from vendors, so underwrite the book in front of you rather than a threshold.' },

    { kind: 'diagram', tag: 'THE SAME CASH FLOW, REPRICED', head: 'Same cash flow. Three times the multiple.', connector: 'vs', bars: [
      { label: '4–8x', sub: 'what an independent sells for', style: 'ink', h: 176 },
      { label: '16–20x', sub: 'what a platform recapitalizes at', style: 'green', h: 340 },
    ],
      body: 'A $2M-EBITDA independent trades at 4–6x. Absorbed into a platform valued at 15–20x, the same cash flow is marked at $30–40M. Nothing about the business changed. One caution the headlines skip. GF Data publishes a single blended figure of about 7.2x for lower-middle-market deals, and publishes no split between platforms and smaller add-on purchases at all. The big spread is a trophy-tier phenomenon, not a universal one.',
      source: 'GF Data, H1 2025; reported platform recaps' },

    { kind: 'trade', name: 'HVAC', image: 'trades/hvac-ac.png', imagePos: '50% 55%', numeral: '$158.4B', head: 'The blueprint — and the proving ground.',
      body: 'The most consolidated of the trades and the one that reset the ceiling. Apollo reportedly took a minority position in Apex at a $10 billion valuation including debt in May 2026, per Reuters citing sources familiar. Terms were not disclosed in the official announcement. Install revenue plus service plans, with the maintenance agreement as the annuity underneath the unit.',
      source: 'IBISWorld 2025; Reuters, 28 May 2026' },

    { kind: 'trade', name: 'PLUMBING', image: 'trades/plumbing-van.png', imagePos: '50% 52%', numeral: '$191.4B', head: 'Bigger than HVAC — and nobody owns 2% of it.',
      body: 'Emergencies and code-mandated work that do not wait for the economy. Read the sizing carefully. IBISWorld’s plumbers report says $191.4B for 2026, and a different IBISWorld cut quoted by ServiceTitan says $121.5B. The gap is definitional — how much new construction and commercial work you fold in. Underwrite the range, never a point.',
      source: 'IBISWorld 2026; ServiceTitan citing IBISWorld' },

    { kind: 'trade', name: 'ROOFING', image: 'trades/roofing.png', imagePos: '50% 46%', numeral: '$92.5B', head: 'The most fragmented trade on federal record.',
      body: '90.8% of 24,044 employer firms are under twenty employees, and roughly 64% are under four. The catch is that the revenue does not repeat. It is storm-driven replacement work with no service agreement underneath it. Buy it because the market is in pieces, and price it for the weather rather than for the story.',
      source: 'IBISWorld 2026; U.S. Census SUSB' },

    { kind: 'trade', name: 'PEST CONTROL', numeral: '85.4%', head: 'of residential service revenue recurs. Highest in home services.',
      body: 'Subscriptions, not projects — which is why independents clear 6–10x while the mechanical trades sit lower. Rollins did 26 acquisitions in 2025 on $3.761 billion of revenue. Rentokil and EQT-backed Anticimex are working the same long tail of about 33,000 operators. Note the scope on that number: residential service revenue, not all pest revenue.',
      source: 'Specialty Consultants via NPMA, 2025; Rollins FY2025 10-K' },

    { kind: 'trade', name: 'GARAGE DOORS', image: 'trades/garage-doors.png', imagePos: '50% 50%', numeral: '$16B', head: 'Small market. Institutional appetite.',
      body: 'Demand arrives when something breaks, and a torsion spring is not a weekend project. Oak Hill acquired Guild Garage in March 2026 for "more than $800 million" per Reuters, citing four people familiar. PitchBook puts the value at $800M on a 16x multiple. KKR had already turned C.H.I. Overhead Doors into a 9.8x return.',
      source: 'FMI; Reuters, 6 Mar 2026; PitchBook' },

    { kind: 'trade', name: 'ELECTRICAL', image: 'trades/electrical-ev.png', imagePos: '50% 48%', numeral: '45–70%', head: 'of data-center construction cost is electrical. I will not quote you a market size.',
      body: 'Every published figure I could verify measures the wrong thing. The widely cited $347.5B includes low-voltage, data cabling and telecom — not a trades number. A cleaner series runs $237.59B for 2023. So the demand case stands on its own: EV, heat pumps, solar, grid, and data centers where electrical is nearly half the build. The dollar figure waits until I can source it.',
      source: 'IBISWorld; Arizton; Goldman data-center demand' },

    { kind: 'numeral', numeral: '2.1M', head: 'skilled-trades jobs could go unfilled by 2030.',
      body: 'JLL’s count across electricians, HVAC techs, plumbers, pipefitters and equipment operators. A separate study puts the plumbing shortfall alone at roughly 550,000 by 2027. Whoever holds the licensed technicians holds the market. In diligence, a roster that transfers is the asset. An owner’s personal relationships are a discount.',
      source: 'JLL, Apr 2026; John Dunham & Assoc. for LIXIL, 2024' },

    /* v2 led this page on "39/77". A.0.3 §D downgraded that figure — it traces
       only to an aggregator citing "Capstone data cited by S&P Global", neither
       original retrievable, and a second aggregator dates the same 77 to
       mid-2025. Capstone's direct count is what the page carries now. */
    { kind: 'numeral', numeral: '47/92', head: 'tracked HVAC deals went to private equity this year.',
      body: 'Capstone counted 92 announced or completed transactions year to date, down 4.2% on last year, with financial buyers taking 47. Of those, 38 were businesses folded into something the buyer already owned and only 9 were a first purchase in a new market, down from 10. A tidier "8% to 50%" trend gets quoted around this sector. It splices two different datasets and mis-dates one by a year.',
      source: 'Capstone Partners, 27 July 2026' },

    { kind: 'statement', tag: 'THE TRAP', tagColor: 'brass', head: 'The technicians and the book can walk at closing.',
      body: 'Customers are loyal to the technician, not the logo. Service agreements can carry clauses that let a customer leave when the business changes hands. Members leave when integration changes what they were sold. Map technician retention and read the recurring contracts one by one before you sign a letter of intent. A buy-and-hold owner has no way out if the book walks after close.' },
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
    'One was a "$1.2 trillion of money raised and waiting, hunting essential services" line. It turns out to be an all-sector total that somebody relabelled. Another was a market size credited to the Census that is not in the Census.',
    '',
    'So this teardown leads with what actually holds up:',
    '',
    '• About 89% of plumbing and HVAC shops have fewer than twenty employees.',
    '• Three quarters of critical-trade operators are still independent.',
    '• In plumbing, nobody owns 2% of the country.',
    '',
    'The fragmentation was always the thesis. The total market size was never doing the work.',
    '',
    'The rest is in the carousel, six trades at a time. The jump from 4–8x to 16–20x, and who actually gets it. The 40% repeat-revenue line where a contractor starts being valued as a platform. The 2.1 million unfilled trades jobs by 2030. And the trap where the technicians walk at closing.',
    '',
    'One page has no number on it at all. Electrical. Every published figure I could find measures the wrong thing, so I say that instead of picking one.',
    '',
    'If you are buying in one of these trades, or operating in one, what are you seeing on the ground? I read everything. 👇',
    '',
    '#MergersAndAcquisitions #PrivateEquity #HomeServices #CorporateDevelopment',
  ].join('\n'),
};
