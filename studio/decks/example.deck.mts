/**
 * WORKED EXAMPLE + FIELD REFERENCE — D02 "Elevator Teardown Nº1".
 * This is the shape every deck spec takes. To make a new slot: copy this
 * file, change the copy, point `cover.image` / `headshot` at your images
 * (a Google-Drive download or a path under content/media/), then:
 *
 *   npx tsx scripts/studio/build-deck.mts scripts/studio/decks/<name>.deck.mts
 *
 * Page kinds available in `pages` (all light; cover + closer are dark and
 * auto-added as the bookends):
 *   { kind:'numeral',   numeral, unit?, head, body?, source? }   giant figure + brass bar
 *   { kind:'statement', tag, tagColor?:'green'|'brass', head, body?, source? }
 *   { kind:'diagram',   tag, head, body?, source?, connector?, bars:[{label,sub,style:'ink'|'green',h}] }
 *   { kind:'trade',     name, image?, imagePos?, numeral?, unit?, head, body?, source? }
 *
 * IMAGES: `trade` is the ONLY body page with an image slot (404×604, object-fit
 * cover — request 3:4 from Gemini and keep the subject centred). An `image:` key
 * on any other page kind is silently dropped: the build succeeds and the picture
 * simply is not there. The cover has its own slot (476×1102, request 9:16).
 * Full slot table and the imagery brief: content/studio/FORMATS.md.
 *
 * LAW: every number/source must be VERIFIED (zero hallucination). Keep the
 * headline copy tight; the deck carries the depth, the caption hooks.
 */
export const deck = {
  slug: 'elevator-teardown-1',
  kicker: 'LANE TEARDOWN Nº1',
  // A real slot points cover.image at your artwork (Gemini export in Drive,
  // or content/media/…). This example uses a repo photo so it renders anywhere.
  cover: {
    hook: 'The buyer math on independent elevator service',
    sub: "Where the consolidation actually is — and the two traps in the book you'd be buying.",
    image: '../../../client/public/founder-walking.webp',
    imagePos: '50% 30%',
  },
  pages: [
    { kind: 'numeral', numeral: '~10', unit: '%', head: 'of U.S. units are maintained by PE-backed platforms — early, not hot.', body: 'OEMs hold ~60%. Independents still hold ~30%. The lane has started moving; it has not moved.', source: 'elevatorworld.com · Dec 2025' },
    { kind: 'numeral', numeral: '40', head: 'deals at the 2021 peak — and 10+ transactions every year since.', body: 'Steady volume, not a spike. PE has outpaced the OEMs on both count and acquired revenue.', source: 'elevatorworld.com · Dec 2025' },
    { kind: 'statement', tag: 'THE REVENUE ENGINE', head: 'Maintenance contracts.', body: 'Recurring, sticky, priced below the majors. Customer retention on the platform books typically exceeds 90% — the contract base is the asset; install work is just how it grows.', source: 'elevatorworld.com · Dec 2025' },
    { kind: 'diagram', tag: 'ROUTE DENSITY', head: 'Route density is the margin.', body: 'Same payroll, three more stops. Density is why the dense-metro book earns more than the scattered one.', connector: 'vs', bars: [
      { label: '5', sub: '5 stops / route', style: 'ink', h: 200 },
      { label: '8', sub: '8 stops / route', style: 'green', h: 320 },
    ] },
    { kind: 'statement', tag: 'THE MOAT', head: 'Licensed technicians are scarce.', body: 'Whoever holds the techs holds the market. The U.S. runs 1.03M+ elevators; the IUEC roster is roughly 30,000 constructors — and that covers the U.S. and Canada. Headcount is the constraint every buyer is really bidding on.', source: 'nationalelevatorindustry.org · iuec.org' },
    { kind: 'statement', tag: 'TRAP Nº1 — ASSIGNABILITY', tagColor: 'brass', head: "Change-of-control clauses can vaporize the book you're buying.", body: 'The maintenance contracts are the asset. Read every one before you price them — some walk away at closing.' },
    { kind: 'statement', tag: 'TRAP Nº2 — DEFERRED MAINTENANCE', tagColor: 'brass', head: 'The P&L hides what the route sheets show.', body: "Skipped visits inflate this year's margin and next year's callbacks. Diligence the route sheets, not just the statements." },
  ],
  closer: {
    tag: 'FOR THE ACQUIRER',
    head: 'Early lane. Sticky revenue. Scarce techs. Own a city, then the region.',
    body: 'Follow for weekly lane maps. Next Tuesday: fire & life safety.',
  },
  // headshot: '../../../client/public/founder-portrait.jpg' is the default.
  caption: [
    'Elevator service companies look boring. The buyer math is anything but.',
    '',
    "PE-backed platforms now maintain roughly 1 in 10 U.S. elevators — OEMs still hold ~60%, independents ~30%.",
    '',
    "That's not a hot lane. It's an EARLY lane. Different things entirely.",
    '',
    'Full teardown in the carousel →',
    '',
    'Which lane should I map next?',
    '',
    '#MergersAndAcquisitions #PrivateEquity #CorporateDevelopment #LowerMiddleMarket',
  ].join('\n'),
};
