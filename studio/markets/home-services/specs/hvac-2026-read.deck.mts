/**
 * The 2026 HVAC read — P-5, Thu 27 Aug 2026.
 *
 * THE MESSAGE, in one line: every cost shock the market underwrote in 2025 has
 * either ended or reversed, the regulatory forcing function behind the
 * replacement thesis is gone, and the sector is roughly four turns cheaper
 * than it was — so a 2026 HVAC deal priced off a 2025 fear set is priced off
 * a world that no longer exists.
 *
 * ── v2, 2026-08-18 · REWRITTEN FROM THE MASTER ────────────────────────────
 * v1 of this file transposed the copy in `content/studio/CAMPAIGN_2026-08-18.md`
 * §3 · P-5. `verify-spec` refused it, and it was right to. Three of that copy's
 * load-bearing claims are dead in `markets/home-services/master.md`:
 *
 *   1. "32 add-ons, up 88% from 17 (S&P Global)" is in the master's §C, NO
 *      SOURCE — RETIRED: not found in any S&P or secondary source, and
 *      contradicted by Capstone's actual count of 38 add-ons against 36, which
 *      is +2 deals rather than +88%. The retired figure is the entire basis of
 *      the "deal market is booming" half of the v1 argument.
 *   2. "an R-454B cylinder ran ~$345 in 2021; by 2025, north of $2,000" is
 *      superseded in §B. The peak was "upwards of $900"; the $2,000 was a spot
 *      report; HARDI declared the crisis OVER in October 2025; and the cylinder
 *      is now $449–499 and FALLING. v1 drew a bar chart rising to $2,000.
 *   3. "the transition itself is regulatory fact" was true when written and is
 *      not now. EPA's reconsideration rule took effect 27 July 2026 and removed
 *      the R-410A installation deadline. No mechanical check could have caught
 *      this one — it is a framing error, not a figure, which is the standing
 *      caveat that the audit checks NUMBERS and not PROSE.
 *
 * The v1 thesis was "costs are shocking upward and the deal market is
 * booming". Per Paul's own master, both halves are backwards. So this version
 * does not patch two pages — it argues the read the evidence actually
 * supports, which is the stronger post and the more contrarian one: the panic
 * is over, the tailwind is contested, and the price came down.
 *
 * EVERY FIGURE BELOW TRACES TO `markets/home-services/master.md`. That is the
 * point of the rewrite and the reason this deck can be verified at all — the
 * v1 figures came from a campaign document with no master behind it, which is
 * why verify-spec reported ten UNEXPLAINED figures it had no way to adjudicate.
 *
 * THIS IS THE PRE-DEALSOURCE ARTIFACT. Live on the profile before the room
 * fills on 3 September, so it is what a new contact finds that evening. It is
 * the deck in this window least able to afford a loose figure, which is
 * precisely why the retired one was worth catching.
 *
 * WHAT IS DELIBERATELY NOT HERE, and why.
 *
 *   1. NO 149-TRANSACTION COUNT. It is real — Capstone, 2025-12-05, +12.9% —
 *      and the master states plainly that it was measured to a different
 *      cutoff and DOES NOT CHAIN to the 92 YTD 2026. Two counts from one
 *      publisher that do not chain is exactly how a trend gets manufactured.
 *   2. NO AVERAGING OF THE VALUATION POPULATIONS. The master forbids it by
 *      name: Capstone's HVAC set includes upmarket and strategic deals, GF
 *      Data covers PE-sponsored LMM, broker ranges sit lower still. Page 1
 *      uses the Capstone series alone and says which series it is.
 *   3. NO TROPHY MULTIPLES. The 16–20x recap band is in the master and is
 *      deliberately off this deck: two of the five transactions behind it are
 *      not confirmed closed, and a headline multiple that travels without that
 *      caveat is the fire-safety failure repeating in another market.
 *   4. NO NAMED TARGET, NO NAMED LIVE PROCESS. ARS/Rescue Rooter and USA
 *      Hometown Experts are both in the master as live processes. THE LINE:
 *      no valuation on a named target, and a live process is not deck copy.
 *   5. NO IMAGE. Every asset in `markets/home-services/media/` fails
 *      `carta-guard`'s ground check — band-hvac.jpg drifts to (245,250,244)
 *      on 73% of its border where the guard wants white. This is the one deck
 *      in the window with matching art on disk, which is what makes the
 *      temptation worth naming: a failing asset is still off-language at
 *      300dpi. Regenerate against the Carta ground per FORMATS §4.1 and this
 *      deck earns a `trade` page. Until then the cover carries the argument.
 *
 * BAR HEIGHTS ARE THE RATIO OF THE NUMBERS in both diagrams — 9.5/13.3 →
 * 243/340, and 449/900 → 170/340. Every label is inside the six-glyph ceiling.
 */
export const deck = {
  slug: 'hvac-2026-read',
  kicker: 'SECTOR READ · HVAC',
  cover: {
    hook: 'The crisis everyone underwrote is over. The sector got four turns cheaper.',
    sub: 'Every cost shock priced into a 2025 HVAC thesis has ended or reversed — and the regulation the replacement case rested on was withdrawn last month.',
    /* Cited on pages of this deck: the numeral on page 1, the stats on pages
       2, 6 and 7. */
    numeral: '9.5', unit: 'x',
    numeralLabel: 'EV/EBITDA across 2024–YTD 2026,\nagainst 13.3x across 2021–23',
    stats: [
      { value: '$449', label: 'a cylinder, down from a peak above $900' },
      { value: '−4.2%', label: 'sector deal volume, year over year' },
      { value: '40,100', label: 'HVAC openings a year — the one thing unchanged' },
    ],
  },
  pages: [
    { kind: 'diagram', tag: 'THE RE-RATE', head: 'Roughly four turns came out of the sector.', connector: 'to',
      bars: [
        { label: '13.3x', sub: 'EV/EBITDA, 2021–23', style: 'ink', h: 340 },
        { label: '9.5x', sub: 'EV/EBITDA, 2024–YTD 2026', style: 'green', h: 243 },
      ],
      body: 'Broader HVAC ran 11.4x against 13.4x on the same split, and EV/revenue 2.0x against 2.3x. One caution that matters more than the number: this is Capstone’s HVAC set, which includes upmarket and strategic transactions. Do not average it against GF Data’s lower-middle-market blend or against broker-published owner-operator ranges — those are three different populations and the mean of them describes no deal anybody could actually do.',
      source: 'Capstone Partners HVAC Services M&A Update, 27 July 2026' },

    { kind: 'numeral', numeral: '$449',
      head: 'a 20-lb cylinder of R-454B, where the crisis peak ran above $900 a year ago.',
      body: 'HARDI called it in October 2025: availability turned in late August and September, and the trade body’s director of government affairs said that if you wanted to be really specific, the crisis was over. The root cause was never the chemical. It was a shortage of DOT-approved A2L cylinders with a single domestic manufacturer, and no 2026 source shows an ongoing constraint. Anyone still underwriting refrigerant inflation as a forward cost is underwriting a supply problem that resolved ten months ago.',
      source: 'HARDI via ACHR News, 13 Oct 2025; pricing checked 28 July 2026' },

    { kind: 'statement', tag: 'THE INVERSION', head: 'The refrigerant that is spiking now is the old one.',
      body: 'R-410A has roughly doubled, from about $6–10 a pound at distributor level in 2024 to $12–18 by early 2026, while the A2Ls that caused the panic normalise. Production is stepping down at the same time as the extended install window keeps legacy equipment in service and demanding charges. The underwriting consequence runs opposite to the 2025 assumption: the cost exposure is not in the new equipment a target installs, it is in the service book on the old equipment a target maintains. Ask which refrigerant the recurring work actually runs on.',
      source: 'Distributor pricing, 2024 against early 2026' },

    { kind: 'statement', tag: 'THE TARIFF STACK', head: 'The import-duty case that shaped 2025 underwriting no longer exists.',
      body: 'The Supreme Court struck the IEEPA tariffs 6–3 on 20 February 2026, and the Court of International Trade invalidated the Section 122 route on 7 May. Section 232 survives — 50% on primary metals, 15% on metal-intensive equipment — but residential HVAC duties were cut from 25% to 15% effective 8 June 2026. Equipment inflation has not stopped; it now arrives through manufacturer pricing rather than through the border, which is a different thing to model and a different thing to negotiate.',
      source: 'SCOTUS, 20 Feb 2026; CIT, 7 May 2026; Section 232 schedule, 8 June 2026' },

    { kind: 'statement', tag: 'THE TRAP', tagColor: 'brass', head: 'The deadline the replacement thesis rested on was withdrawn last month.',
      body: 'EPA’s reconsideration rule took effect on 27 July 2026 and removed the installation deadline for R-410A equipment manufactured or imported before 1 January 2025 — pre-2025 stock may now be installed until supplies deplete. The 700 GWP limit itself is unchanged. It is under D.C. Circuit challenge from 19 state attorneys general, the NRDC and five industry bodies, and New York codified the original deadline regardless. So the mandated-replacement tailwind is contested rather than given, and it should be underwritten as a binary. Service-heavy books are insulated. Install-heavy books carry the risk.',
      source: 'EPA reconsideration rule, effective 27 July 2026' },

    { kind: 'numeral', numeral: '92',
      head: 'HVAC services transactions year to date — down 4.2%, not up.',
      body: 'Sponsors took 47 of them, up one. Beneath a flat total the mix is where the information is: 38 of the sponsor deals were add-ons against 36 a year earlier, while platform creations fell from 10 to 9 and private strategics dropped from 45 to 34. Public strategics more than doubled, 5 to 11. That is not a booming market and it is not a collapsing one — it is a maturing consolidation cycle, where the platforms are already formed and the volume has moved to tucking businesses into them.',
      source: 'Capstone Partners HVAC Services M&A Update, 27 July 2026' },

    { kind: 'numeral', numeral: '40,100',
      head: 'HVAC openings a year through 2034 — the one constraint that did not ease.',
      body: 'Plumbing runs about 44,000 a year on the same projection, against a separately modeled 550,000 unfilled plumbing positions by 2027. Three of the four things a 2025 thesis worried about have resolved in the buyer’s favor: refrigerant, tariffs, and the deadline. Labor did not, and labor is the one that cannot be fixed with a purchase order. That is what makes a technician pipeline the asset in this cycle rather than a line in the diligence checklist — the constraint outlasts the holding period.',
      source: 'BLS projections to 2034; LIXIL / John Dunham & Associates' },

    { kind: 'statement', tag: 'WHERE THE OPENING IS', head: 'Demand is softening beneath the pricing, and the good metros are taken.',
      body: 'Equipment shipments fell 20% in 2025 and are down a further 3.5% year to date. Across the listed comparables the pattern is consistent: one grew second-quarter revenue 7.9% but adjusted EBITDA only 2.2%; another’s segment revenue was flat year on year; a third posted 5% price and 1% volume on a flat member count. Meanwhile DFW, Houston, Phoenix, Atlanta, Tampa and Southern California each host four or more platforms. The opening is platform formation in the under-consolidated metros — Mountain West, secondary Pacific Northwest, northern New England, the upper Midwest, second-tier Sun Belt — and tuck-in density everywhere else.',
      source: 'Company filings and shipment data, 2025–YTD 2026' },
  ],
  closer: {
    tag: 'FOR THE ACQUIRER',
    head: 'Re-run the 2025 thesis without the 2025 fear set.',
    body: 'Three of its four cost assumptions have expired and the price came down four turns. What is left is a labor constraint and a service book — which is what you were buying anyway. Follow for the weekly sector reads.',
  },
  caption: [
    'Every HVAC thesis written in 2025 priced in four things. Three of them have since expired.',
    '',
    'The refrigerant crisis is over — HARDI said so in October 2025. R-454B peaked above $900 a cylinder and now runs $449–499, falling. The tariff stack is gone: SCOTUS struck the IEEPA duties 6–3 in February, and residential HVAC Section 232 was cut from 25% to 15% in June. And the R-410A installation deadline the whole mandated-replacement case rested on was withdrawn by EPA on 27 July.',
    '',
    'The one that did not ease is labor. About 40,100 HVAC openings a year through 2034, and no purchase order fixes it.',
    '',
    'Meanwhile the price came down. Capstone puts HVAC services at 9.5x EV/EBITDA across 2024–YTD 2026 against 13.3x across 2021–23. Roughly four turns.',
    '',
    'A correction I owe this feed, since it is the kind that matters. I had a figure staged for this post claiming PE add-ons had nearly doubled year over year, attributed to S&P. I could not stand it up at that source or any other. Capstone’s actual count is 38 add-ons against 36 — two deals — and sector volume is down 4.2%. I am not going to restate the number I could not verify, because a figure repeated in order to knock it down is still a figure being repeated. The booming-deal-market version of this post was wrong, and it is not the one I am posting.',
    '',
    'What is actually happening is duller and more useful: platform formation has slowed, add-ons carry the volume, and the good metros are taken. The opening is where the platforms have not formed yet.',
    '',
    'If you are underwriting HVAC right now — have you re-run the model without the deadline in it?',
  ].join('\n'),
};
