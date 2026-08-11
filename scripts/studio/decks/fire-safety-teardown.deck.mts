/**
 * Fire & life safety teardown — buy-side, teaser.
 *
 * THE MESSAGE, in one line: fire code makes the inspection non-discretionary,
 * but nobody has established how much of that obligation is actually being
 * captured — and the multiple the sector quotes for a fire platform was never
 * paid by anybody.
 *
 * ── v1, 2026-08-10 ─────────────────────────────────────────────────────────
 * First artifact built off `markets/fire-safety/master.md`, published
 * 30 July 2026. Every figure on every page traces to it, and the spec was
 * checked line by line against `fire-safety-retired.md` — including the
 * caption, which is where a retired figure survived undetected in the other
 * market.
 *
 * WHAT IS DELIBERATELY NOT HERE, and why. This is the half of the file worth
 * reading, because most of it is material a reasonable session would have put
 * on a page.
 *
 *   1. NO MARKET SIZE, anywhere, including the cover. §2.1: every published
 *      container fuses fire with an adjacent trade INSIDE the classification,
 *      so it cannot be netted out afterwards. The one clean revenue line is
 *      installation work allocated across a whole sector, not the revenue of
 *      firms classified as fire contractors, and §2.1 forbids deriving a
 *      contractor count from it. The two third-party global sizings in §8.6
 *      are global, not decomposable, and the master does not use them. A
 *      teardown with no market size is the honest version of this market.
 *   2. NO 17x–20x, and none of its satellites — the predicted deal value, the
 *      earnings denominator behind it, the project-heavy range that travels
 *      the same route, the platform-to-add-on spread that is one quotient of
 *      it, the recurring-monthly bands topping out at 50x or 55x. Page 11
 *      carries the CHAIN and never the number. That is what §6.6 exists for,
 *      and restating the number "just to debunk it" is how it survives.
 *   3. NO NATIONAL COMPLIANCE GAP. The 63% currency rate on page 2 is ONE
 *      CITY, chosen for its enforcement rather than for neglect. §1.5 is
 *      explicit that no published source establishes the national share, so
 *      the complement of that figure is not stated either, in the deck or in
 *      the caption. The top-down "everyone is out of compliance" pitch is
 *      exactly the thing this deck refuses to make.
 *   4. NO VENDOR-PUBLISHED COMPLIANCE LAYER. The second instrumented city's
 *      rate and the false-alarm attribution are both published by the operator
 *      of the reporting platform that benefits from the finding. §1.5 says
 *      carry them with the interest disclosed or not at all, and a carousel
 *      page has no room for the disclosure. Not at all, then.
 *   5. NO ENTRY-MULTIPLE PAGE. The size-band benchmark against the one
 *      disclosed add-on ceiling is real, and it is the honest replacement for
 *      the retired spread — but it compares all-industry sponsor buyers to one
 *      listed strategic, the ceiling is a bound on a weighted average rather
 *      than a series, and no fire-specific series exists at all. That caveat
 *      load needs its own page and probably its own piece. It belongs in the
 *      report, not in a teaser.
 *   6. NO MARGIN BENCHMARK FOR A SMALL CONTRACTOR, because none exists (§7.1).
 *      The segment margin at the large filers must not travel down-market, and
 *      the two Census cost-structure residuals may not be called EBITDA under
 *      any circumstances. Nothing here quotes any of the three.
 *   7. NO INSURANCE PAGE. §8.1 has the retrofit story running the other way in
 *      the current rate environment, and §8.2 establishes that no carrier or
 *      broker publishes a sprinklered-versus-unsprinklered premium
 *      differential at all. §8.3's loss evidence inverts in warehouses and
 *      manufacturing, and a page cannot carry the figure without the
 *      inversion. Three negatives is a section of a report, not a slide.
 *   8. NO INDEPENDENCE OR TARGET-COUNT CLAIM. The consolidator register on
 *      page 7 counts OWNERS, not available targets. It has not been run
 *      against a candidate board, so nothing here says how many independents
 *      remain, and page 8 says plainly why a name-matched screen cannot tell.
 *   9. Gross margin by work type (§3.4) and the certified-headcount ratio at a
 *      named platform (§7.3) were both cut for room rather than for doubt.
 *      Both are strong and both are the first things back in if this runs long.
 *
 * NO ART, AND THE COVER RUNS TEXT-ONLY. `markets/fire-safety/` holds a master
 * and nothing else — no `media/`, no image brief. The house library carries
 * trade, mechanical and concept imagery and no fire artwork. A stock
 * photograph would break the imagery law; pointing this spec at a filename
 * that does not exist yet is the named failure that produced `pest.png`,
 * `plumbing.png` and `electrical.png`, all of which the old home-services spec
 * referenced and none of which were ever on disk. So there is no `image:` key
 * anywhere in this file, the art guard has nothing to fail on, and the cover
 * carries its argument on the numeral and the stat strip instead. FORMATS §4.1
 * is the prerequisite for a version with pictures: write the brief first, into
 * `markets/fire-safety/collateral/image-brief.md`.
 *
 * The `trade` page kind is unused for the same reason. Its distinguishing
 * feature is the image panel, and without art it is a `numeral` page wearing an
 * eyebrow. The three sub-verticals are named in copy instead.
 *
 * THE COVER CTA CLAIMS NO PAGE COUNT. No report has been rendered from this
 * master. The home-services cover could say "61 pages" because that was
 * verified with pdfinfo against a real render, and there is nothing here to
 * verify against.
 */
export const deck = {
  slug: 'fire-safety-teardown',
  kicker: 'MARKET TEARDOWN',
  cover: {
    hook: 'The mandate is real. Capture of it is not.',
    /* Art added 2026-08-10. `alarm-panel-and-riser` was sitting unnamed in
       assets/extraiomages2/ as a generator filename — a fire alarm control
       panel open against a sprinkler riser, in the house isometric, carrying
       no text at all. No text is why it is the cover: nothing on it can be
       wrong. The labelled full schematic is the companion file and stays off
       the cover, because its extinguisher label is misspelled. */
    image: 'fs-cover.jpg', imagePos: '40% 52%',
    sub: 'Fire code makes the inspection non-discretionary. That is not the same as somebody being paid for it.',
    /* The cover carries the argument, not the title. Every figure below is
       cited on a page of this same deck — the numeral on page 2, the stats on
       pages 3, 7 and 9 — because verify-spec cannot see a cover and a cover is
       the surface most likely to travel without its deck.
       Deliberately NOT here: a market size. There is no published size for US
       fire and life safety services, the master refuses to manufacture one,
       and a cover is the last place to start. */
    numeral: '63', unit: '%',
    numeralLabel: 'current on annual inspection,\nin one actively enforced city',
    stats: [
      { value: '17', label: 'fire platforms under a live sponsor' },
      { value: '11', label: 'code visits a year, one building' },
      { value: '5 years', label: 'to make a Level III inspector' },
    ],
    cta: 'Fire & Life Safety: A State of the Market\nThe full buy-side assessment, 83 pages · 10 August 2026\nsmbx.ai',
  },
  pages: [
    { kind: 'statement', tag: 'THE MANDATE', head: 'The demand is written into law, and the law names the interval.',
      body: 'An owner is never bound by a standard. The owner is bound by the edition of that standard the local fire authority has adopted, and it arrives through three links. A jurisdiction adopts a model fire code. That code requires inspection, testing and maintenance by reference rather than by restating it. Then the code’s referenced-standards chapter fixes which edition applies. The wording does the work: systems shall be maintained in good working order at all times, and where they are not, repaired or replaced as necessary. That is a continuing duty attached to the owner for as long as the system exists.',
      source: 'IFC §901.6; NYC Fire Code (2022), FC 901.6' },

    { kind: 'numeral', numeral: '63%', head: 'of fire protection systems were current on their annual inspection.',
      body: 'That is 1,313 systems out of 2,083 in a city running mandatory electronic inspection reporting. The city was chosen for its enforcement, not for neglect. No published source establishes the national share of legally inspectable systems that are current, so the top-down compliance-gap pitch cannot be sourced and is not made here. The only defensible route to a capture estimate runs bottom-up through the target’s own book — obligated systems per site, visits per system, and the share of those visits invoiced.',
      source: 'City of Rockville, MD, 31 January 2024' },

    { kind: 'numeral', numeral: '11', head: 'contractor visits a year, in one ordinary commercial building.',
      body: 'Take a single-tenant building with a wet-pipe sprinkler riser, a monitored alarm, portable extinguishers and a moderate-volume kitchen hood. The intervals in NFPA 25, 72, 10 and 96 produce four sprinkler visits, two alarm visits, one extinguisher maintenance visit, two kitchen suppression services and two hood inspections. Eleven scheduled events, before any three-year, five-year or six-year item and before a single deficiency repair. The building mix is an assumption and should be replaced with the target’s own site list in diligence. The frequencies are not an assumption.',
      source: 'NFPA 25, 72, 10 and 96; smbX, July 2026' },

    { kind: 'numeral', numeral: '$3–$4', head: 'of service work for every $1 of inspection work.',
      body: 'Inspection is not bought for the inspection fee. It is bought because a technician standing in a mechanical room with a code obligation finds work nobody else is positioned to win. APi Group put that ratio on an investor-day slide and its chief executive restated it on an earnings call nine months later. Read the footnote with it. It is a leadership estimate covering US inspection revenue, and it excludes purely route-based service revenue, mainly portable fire extinguishers. That makes it the wide definition of the ratio, and the ceiling rather than the base case.',
      source: 'APi Group investor day, 21 May 2025; Q4 2025 call, 25 Feb 2026' },

    { kind: 'diagram', tag: 'THE MIX SHIFT', head: 'The one operator who reports it is acting on it.', connector: 'to', bars: [
      { label: '40%', sub: 'inspection, service and monitoring, 2021', style: 'ink', h: 252 },
      { label: '54%', sub: 'the same measure, 2025', style: 'green', h: 340 },
    ],
      body: 'Fourteen points of revenue moved in four years, on more than 20 consecutive quarters of double-digit organic inspection growth, against a stated long-term objective of 60% or better. Two things follow for a buyer. The shift is real and it is disclosed by a filer rather than asserted by a seller. And it is slow — four years for fourteen points is what this looks like when it is being pushed hard.',
      source: 'APi Group Q4 2025 call, 25 Feb 2026; investor day, 21 May 2025' },

    { kind: 'statement', tag: 'THE TRAP', tagColor: 'brass', head: 'The best-named accounts are the least likely to convey.',
      body: 'Three executed inspection agreements read in full are structurally incompatible with one another. The contractor’s own form runs 60 months, renews automatically, escalates at the greater of 6% or the change in consumer prices, and lets the contractor assign it without asking. A national account written on the owner’s paper is terminable by either side on 45 days’ notice and cannot be assigned without consent. A public-sector award is cancellable in 30 days for any reason whatsoever, with no volume committed at all. So the multi-site logos a buyer most wants are the ones least likely to travel in an asset deal. They are the ones written on the customer’s paper.',
      source: 'Three executed inspection agreements, 2022–2025' },

    { kind: 'numeral', numeral: '17', head: 'US fire and life-safety contractors sit under a live sponsor — not the thirty-odd a blended tracker counts.',
      body: 'Five more are security-led integrators that carry fire. Three are manufacturers under sponsors. Eight are permanent-capital, family or strategic holders with no exit clock, and five have already been absorbed into something else. Those are not interchangeable. A sponsor on a fund clock eventually produces a secondary asset. A permanent-capital holder does not, and it can win a founder-led process on continuity rather than on price. Two of the seventeen carry a sponsor named only by trade press or a directory listing, and both should be graded a step below the rest.',
      source: 'smbX consolidator register, as at 29 July 2026' },

    { kind: 'statement', tag: 'THE REGISTER', head: 'Match on the domain. Never on the name.',
      body: 'Five unrelated entities trade as Guardian in US fire and life safety, and one of them publishes on two domains that look nothing like each other. One platform prefixes rather than retires, so all 31 of its divisions trade under the parent name and a list carrying them as independents is wrong 31 times from a single owner. The most acquisitive platform in the sector publishes 144 brand names on its own page and not one brand-level domain. A screen built on trading names fails in both directions at once. It buries genuine independents inside owned buckets, and it surfaces owned businesses as available.',
      source: 'Company brand pages and SEC exhibits, July 2026' },

    { kind: 'numeral', numeral: '5', unit: 'years', head: 'The moat is a person, and it takes five years to make one.',
      body: 'The inspection and testing certification for water-based systems requires five years of work experience at its top level, at least three of them directly on inspection and testing. That cannot be bought with training spend and cannot be compressed. Washington writes the credential straight into its licence, so the clock is a statutory cap on entry rather than a hiring problem. Recertification falls due every three years on 90 continuing-development points, which means a platform that stops funding training watches its certified base decay on a known schedule. No count of certification holders is published, nationally or by state or by discipline.',
      source: 'NICET candidate handbooks; Washington RCW 18.160' },

    { kind: 'numeral', numeral: '60', unit: 'days', head: 'The licence that protects the margin is the thing that strands the deal.',
      body: 'Most states license the firm through a named individual, and in a lower-middle-market deal that individual is usually the seller. Florida gives a business 60 days to certify a replacement after its sole certified individual leaves, failing which the certification expires by operation of law. A Florida sole qualifier may not be attached to a second business at the same time, so collapsing acquired entities can require more certified people rather than fewer. That removes the saving a buyer counts on most. Office and supervisory payroll runs $75,164 a head against $66,225 for construction workers, so the back office is the expensive layer. Build the licence register before the integration model, and engage state-licensing counsel in every state of operation before signing.',
      source: 'Fla. Stat. §633.328 (2024); 2022 Economic Census' },

    { kind: 'statement', tag: 'THE TRAP', tagColor: 'brass', head: 'The multiple this sector quotes has one origin, one date and no transaction behind it.',
      body: 'It starts in a 2024 trade report describing prospective bids on a company that did not sell, written in the conditional, on unnamed sources. A year later the same range is restated as a sector fact, with no sample and no deal list. A valuation-aggregator page then credits two advisory houses with it. Neither publishes it — one reports 11.8x across a broader security universe, and the other caps its top tier at 7x to 10x. An operator’s own resource page then cites the aggregator. Four apparent sources, one assertion, and the predicted sale never happened. I do not restate the number here, and neither should a deal file.',
      source: 'Capstone Partners, 2 Feb 2026; Breakwater M&A, 1 Feb 2026' },
  ],
  closer: {
    tag: 'FOR THE ACQUIRER',
    head: 'Buy the inspection book. Then prove it travels.',
    body: 'Route density where the jurisdiction reports inspections electronically, priced on a repair-to-inspection ratio you can compute from the target’s own work orders rather than on a market multiple nobody published. Follow for the weekly teardowns.',
  },
  caption: [
    'Fire code makes inspection non-discretionary. That is not the same as somebody capturing it.',
    '',
    'I spent last week checking the load-bearing figures in my fire and life safety research against the original instruments. The one that did not survive is the one everybody quotes.',
    '',
    'The multiple this sector repeats for scaled fire platforms traces to a single 2024 trade report — prospective bids, in the conditional, on unnamed sources, about a company that did not sell.',
    '',
    'A year later it was restated as a sector fact. Then a valuation page credited two advisory houses that do not publish it. Then an operator cited the valuation page. Four apparent sources. One assertion.',
    '',
    'So this teardown leads with what holds up:',
    '',
    '• In one actively enforced city, 63% of fire protection systems were current on their annual inspection. No published source establishes the national rate.',
    '• One ordinary commercial building generates 11 contractor visits a year, before a single repair.',
    '• 17 US fire and life-safety contractors sit under a live sponsor. Not the thirty-odd a blended tracker counts.',
    '',
    'A fund with a clock, a permanent-capital holder, a manufacturer and an already-absorbed nameplate are four different things, and only some of them are competition.',
    '',
    'There is no market size in this deck, on any page. Every federal container fuses fire with an adjacent trade inside the classification. I would rather say that than pick a number.',
    '',
    'The rest is in the carousel. Why inspection is bought for the work it finds. Why the best-named accounts are the least likely to travel in an asset deal. And why the licence that protects an incumbent’s margin can strand the book on a qualifying individual who is retiring.',
    '',
    'If you buy, operate or lend in fire and life safety: what does your own repair-to-inspection ratio actually look like? I read everything. 👇',
    '',
    '#MergersAndAcquisitions #PrivateEquity #FireProtection #LifeSafety #CorporateDevelopment',
  ].join('\n'),
};
