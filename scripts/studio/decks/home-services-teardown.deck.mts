/**
 * Home-services lane teardown — buy-and-hold framing, six trades + geography + labor.
 * Numbers are AVERAGED across our sweep + Paul's Gemini deep-research (his call);
 * (est.) = M&A-advisory. Public deals named only where widely reported (Apex/Apollo,
 * Blackstone/Champions, Oak Hill/Guild, KKR/CHI). Images: Paul's Gemini art in ./media.
 */
export const deck = {
  slug: 'home-services-teardown',
  kicker: 'LANE TEARDOWN',
  cover: {
    hook: 'The buyer math on home services',
    sub: 'Six trades, one playbook — why the long-money buys the recurring cash flow and holds it.',
    image: 'homes.png', imagePos: '50% 50%',
  },
  pages: [
    { kind: 'statement', tag: 'THE ANNUITY', head: "The asset isn't the truck. It's the service agreement.", body: "Recurring maintenance and monitoring contracts — sticky, renewing, priced into every season. Cross about 40% recurring revenue and a business re-rates from 'contractor' to 'platform.' That annuity is what a holder is really buying." },
    { kind: 'diagram', tag: 'THE RE-RATE', head: 'Same cash flow. Triple the multiple.', connector: 'vs', bars: [
      { label: '4–8x', sub: 'what an independent sells for', style: 'ink', h: 176 },
      { label: '15–20x', sub: 'what a platform recapitalizes at', style: 'green', h: 340 },
    ], body: 'Independents change hands at 4–8x; scaled platforms recapitalize at 15–20x. Oak Hill paid ~16x for a garage-door roll-up, Blackstone ~18.5x for an HVAC platform, Apollo ~20x for the biggest. Same cash flow — and a buy-and-hold owner keeps the spread instead of flipping it.', source: 'PitchBook; industry M&A reports (est.)' },
    { kind: 'numeral', numeral: '$700B', head: 'across six home-services trades — and no one owns 20% of any of them.', body: 'HVAC, plumbing, electrical, roofing, garage doors, pest control — hundreds of thousands of mostly owner-run shops. The top of each trade is consolidating fast; the base is still wide open.', source: 'IBISWorld / U.S. Census / industry reports (avg.)' },

    { kind: 'trade', name: 'HVAC', image: 'ac.png', imagePos: '50% 55%', numeral: '$158B', head: 'The big ticket — and the blueprint.', body: 'The most-consolidated trade, and proof of the model: Apollo just put ~$10B on one platform. Install revenue plus service plans, with the maintenance agreement as the annuity underneath the unit. Proof, not ceiling.', source: 'IBISWorld / PitchBook 2026' },
    { kind: 'trade', name: 'PLUMBING', image: 'plumbing.png', imagePos: '50% 52%', numeral: '~$180B', head: 'Bigger than HVAC — and no one owns 5% of it.', body: 'Non-discretionary demand: emergencies and code-mandated work that does not wait for the economy. One of the most fragmented trades in the country — a wide-open book for a patient buyer.', source: 'IBISWorld (avg.)' },
    { kind: 'trade', name: 'ROOFING', image: 'roofing.png', imagePos: '50% 46%', numeral: '$92B', head: 'The most fragmented trade on federal record.', body: 'Two of every three firms have four or fewer employees. The catch: it is storm-cyclical replacement work, not recurring — no service-agreement annuity. Underwrite it as a fragmentation play and price it for the cycle.', source: 'U.S. Census; IBISWorld' },
    { kind: 'trade', name: 'PEST CONTROL', image: 'pest.png', imagePos: '50% 52%', numeral: '74%', head: 'recurring revenue — the highest in home services.', body: 'Subscriptions, not projects. That is why independents sell at 6–10x, richer than the mechanical trades. Rollins, Rentokil and Anticimex are consolidating a long tail of 33,000+ operators.', source: 'industry data 2025' },
    { kind: 'trade', name: 'GARAGE DOORS', numeral: '$16B', head: "‘PE’s next HVAC.’", body: 'Non-cyclical repair — a spring breaks, it gets fixed. Oak Hill paid ~$800M / ~16x for Guild Garage in 2026; KKR earlier turned C.H.I. Overhead Doors into a ~9.8x return. Small market, institutional appetite.', source: 'PitchBook (est.)' },
    { kind: 'trade', name: 'ELECTRICAL', image: 'electrical.png', imagePos: '50% 48%', numeral: '~$250B', head: 'The tailwind trade — and the biggest.', body: 'EV chargers, heat pumps, solar, the grid — and AI data centers, where electrical is 45–70% of the build. Demand is a multi-year backlog; platforms clear 9–13x, more for data-center capability.', source: 'GMInsights / industry (avg.)' },

    { kind: 'numeral', numeral: '38%', head: 'of HVAC private-equity deals landed in one region — the Southeast.', body: 'The Sun Belt is the crowded corridor: Florida, Georgia, the Carolinas, Tennessee, then Texas (Houston and Dallas each 15+ platform deals). Year-round cooling, growing metros, cheaper entry. The edge for a patient buyer is the lane the platforms have not saturated yet.', source: 'industry M&A data 2024–25 (est.)' },
    { kind: 'numeral', numeral: '2.1M', head: 'skilled-trades jobs could go unfilled by 2030.', body: 'The average technician is over 50 and retiring faster than schools can replace him. Whoever holds the licensed techs holds the market — it is the moat and the ceiling at once. For a buy-and-hold owner, retention is not HR; it is the asset.', source: 'JLL; U.S. BLS (est.)' },
    { kind: 'numeral', numeral: '$1.2T', head: 'in private-equity dry powder is hunting essential services.', body: 'Apollo (Apex), Blackstone (Champions), Goldman (Sila), Bain (Service Logic) and Leonard Green (Wrench) in the mechanical trades; Oak Hill in garage doors; Rollins and Rentokil in pest. When this much long-money arrives, it does not come to flip.', source: 'Bain & Company 2025; PitchBook' },
    { kind: 'statement', tag: 'THE THESIS', head: 'Buy the recurring book. Hold it. Let it pay you.', body: 'Dense-metro service books with real recurring revenue, bought at an honest multiple and compounded with bolt-ons. Across any of these trades the play is the same: own the annuity, keep the technicians, let the cash flow pay you — no exit required.' },
    { kind: 'statement', tag: 'THE TRAP', tagColor: 'brass', head: 'The techs and the book can walk at closing — and a holder has no flip to fix it.', body: 'Customers follow the technician, not the logo, and service agreements can carry change-of-control surprises. Map retention and read the recurring revenue by contract before the LOI — because you are keeping this one.' },
  ],
  closer: {
    tag: 'FOR THE ACQUIRER',
    head: 'Six trades, one playbook: buy where revenue recurs, hold where it compounds.',
    body: 'This is how I read any trade for a buyer. Follow for the weekly teardowns.',
  },
  caption: [
    'Everyone sees the home-services roll-up. Fewer read the buyer math underneath it.',
    '',
    'Six trades — HVAC, plumbing, electrical, roofing, garage doors, pest control — worth roughly $700 billion combined, and no one owns 20% of any of them. Private equity has noticed: about $1.2 trillion in dry powder is hunting essential services, and platforms are recapitalizing at 15–20x EBITDA (Apollo just put ~$10B on one).',
    '',
    "Here's the part a buy-and-hold acquirer reads differently: the 20x isn't the thesis — the recurring service book is. Pest control runs 74% recurring; HVAC and plumbing turn service plans into the same annuity. Buy that cash flow at 4–8x, hold it, compound it. Most of the market is still independent — and outside the crowded Sun Belt, most of the map is still open.",
    '',
    'Full teardown in the carousel →',
    '',
    "Work in one of these trades, or buying into it? Tell me what you're seeing — I read everything.",
    '',
    '#MergersAndAcquisitions #PrivateEquity #HomeServices #SearchFund',
  ].join('\n'),
};
