/**
 * THE MESSAGE. Check whose controllers are in the route book and who pays for the callbacks before you look at the revenue line.
 *
 * Elevator service reads as a boring maintenance business. The money is in the service
 * contract, the contract is required by law, and the two things that decide whether a
 * book is worth owning appear on neither the profit statement nor the balance sheet.
 *
 * REBUILD, 2026-08-11. This replaces the originally posted Nº1. Five figures on that
 * version were retired by correction ledgers A.0.1 and A.0.3 in
 * markets/elevator/master.md — four of them rested on one trade article nobody in
 * this practice had read, and one bar chart carried no source at all. Every figure
 * below comes from a filing, a government table, a code, or a public registry, and
 * every one survived primary-source verification on 2026-08-11.
 */
export const deck = {
  slug: 'elevator-teardown-1',
  kicker: 'LANE TEARDOWN Nº1',

  cover: {
    hook: 'The buyer math on independent elevator service.',
    sub: 'Where the money actually is — and the two things that decide whether a route book is worth owning.',
    image: 'elevator-teardown-1-cover.png',
    imagePos: '50% 40%',
  },

  pages: [
    {
      kind: 'numeral',
      numeral: '25.1',
      unit: '%',
      head: 'is what the manufacturers earn servicing elevators. They earn 4.8% selling them.',
      body: 'Otis reported both in the same filing. Service is 35% of its sales and 91% of its segment operating profit. Nobody in this trade is really in the equipment business.',
      source: 'Otis Worldwide FY2025 10-K · 31 Dec 2025',
    },
    {
      kind: 'statement',
      tag: 'WHY IT RECURS',
      head: 'The maintenance contract is not a sale. It is a legal obligation.',
      body: 'A building cannot lawfully run an elevator without a written maintenance plan for that specific unit — tasks, procedures, tests, wiring diagrams. Then the code sets the clock: a full inspection every year, a heavier test every five. Revenue a code requires behaves nothing like revenue a customer renews.',
      source: 'ASME A17.1 §8.6.1.2 · Florida 61C-5.0015',
    },
    {
      kind: 'diagram',
      tag: 'ROUTE DENSITY',
      head: 'Two books. Same unit count. Different business.',
      body: 'In New York most buildings have a single elevator — and together they hold barely a quarter of the city’s devices. A small group of buildings holds a third of them, five and more at a time. A mechanic working the second group barely gets in the van.',
      source: 'NYC Open Data · DOB NOW · 11 Aug 2026',
      connector: 'vs',
      bars: [
        { label: '27.8%', sub: 'of devices, in the 59.7% of buildings holding one', style: 'ink', h: 200 },
        { label: '34.5%', sub: 'of devices, in the 7.1% holding five or more', style: 'green', h: 248 },
      ],
    },
    {
      kind: 'numeral',
      numeral: '1.79',
      unit: '×',
      head: 'what an elevator mechanic earns against a heating and cooling technician.',
      body: 'The median is $102,420 — within one percent of what a plumber earns at the ninetieth percentile. The trade is unionised, and the ratio of apprentices to mechanics is capped on every job. You cannot hire your way into capacity here. You buy it.',
      source: 'BLS OEWS · May 2023 · SOC 47-4021',
    },
    {
      kind: 'statement',
      tag: 'TRAP Nº1 — WHOSE CONTROLLER',
      tagColor: 'brass',
      head: 'Some route books cannot be serviced by you at any price.',
      body: 'A federal appeals court described the mechanism in 2007. Manufacturers declining to sell competitors the parts, tools, software and diagrams. Control systems that only their own handhelds talk to. Then it dismissed the case. It is documented, and it is lawful. Which units you can actually work on depends on what controllers sit in the book, and nobody publishes that. Ask for the asset register. A seller who cannot produce one has told you something.',
      source: 'In re Elevator Antitrust Litigation · 2d Cir. · 4 Sep 2007',
    },
    {
      kind: 'statement',
      tag: 'TRAP Nº2 — WHO EATS THE CALLBACK',
      tagColor: 'brass',
      head: 'The cheap contract is not the cheap contract.',
      body: 'Every tier does the same code-required work. What differs is who absorbs parts and emergency callbacks. Run four callbacks a year against a loaded California wage and a double-time overtime rule, and at the bottom of real published contract pricing the callbacks alone eat most of the revenue. That is why cheap contracts exclude parts, and why one of them limits service to weekday daytime. Read the tier mix before you read the revenue line.',
      source: 'Wisconsin contract 19-5971 · CA DIR SC-62-X-999-2023-1',
    },
  ],

  closer: {
    tag: 'FOR THE ACQUIRER',
    head: 'Required revenue. Scarce mechanics. A moat you have to check unit by unit.',
    body: 'Follow for weekly lane maps. Nº2 goes deeper on the mandate — and on the one deal that could put real density on the market.',
  },

  caption: [
    'Elevator service companies look boring. The buyer math is anything but.',
    '',
    'Otis earns 25.1% servicing elevators and 4.8% selling them. Service is 35% of its sales and 91% of its segment operating profit.',
    '',
    'That gap exists because the revenue is required. A building cannot lawfully run an elevator without a written maintenance plan for that unit, and the code sets the inspection clock — every year, and a heavier test every five.',
    '',
    'Two things decide whether a route book is worth owning, and neither shows up on a P&L:',
    '',
    '1. Whose controllers are in it. A federal appeals court described manufacturers declining to sell competitors the parts, tools and software — in 2007 — and dismissed the case. Some books you cannot service at any price.',
    '',
    '2. Who eats the callback. Every contract tier does the same code-required work. They differ on who pays when the phone rings at 2am.',
    '',
    'Full teardown in the carousel →',
    '',
    'Which lane should I map next?',
    '',
    '#MergersAndAcquisitions #PrivateEquity #CorporateDevelopment #LowerMiddleMarket',
  ].join('\n'),
};
