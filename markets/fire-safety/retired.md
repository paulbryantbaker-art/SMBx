# Retired figures — fire & life safety

**The denylist.** Every figure below was retired, corrected, re-attributed or
bounded by a named pass in this market's master, or is one the master says may
never be stated without its basis attached. Nothing here may appear in a spec, a
caption or a rendered document in the form given.

This file exists because `audit.mts` cannot catch these. The audit proves a
figure is *traceable*. Most of what follows is perfectly traceable — to a
superseded draft, to a press summary of a slide nobody can retrieve, or to an
aggregator page whose methodology reference resolves back into its own domain —
and still wrong. §6.6 is the whole argument in one section: a range with four
apparent publishers, one ancestor, and no transaction behind it. A figure
carried faithfully out of that chain audits green every time.

**This register is being written before the collateral, on purpose.** Fire and
life safety has produced no specs, decks or reports yet. Home services got its
denylist after three retired figures were already live on LinkedIn. It is
cheaper to have the guard than to sweep behind it, and a market with zero
artifacts is the only moment at which a register can be complete for free.

**Maintained by hand, on purpose.** The master records retirements in tables
*and* in prose. A.0.1 and A.0.2 are tables; the retirement of the 17x–20x range
is a whole section of argument (§6.6), the Census container traps are prose
(§2.1, §2.6), the compliance figures are prose (§1.5), and the two rules that
matter most in Part VII — "neither may be quoted as EBITDA under any
circumstances" and "the mid-teens segment margin must not travel down-market" —
are sentences, not rows. A parser that reads only the tables finds about half of
this list and misses the rest, which produces a guard that reports clean. So:
**when you write an `A.0.x` entry into the master, add the retirement here in
the same session.**

Read by `scripts/studio/retired-check.mjs`. Format is fixed — each entry is a
`###` heading followed by the four fields, in order.

- `pattern` — a literal string, matched case-insensitively. Every dash form
  (`-` `–` `—` `‑`) is folded to one before matching, so write whichever you
  like and do **not** add a second entry for the other dash — it will fire twice
  on the same line and the duplicate teaches you to skim.
- `requires` — pipe-separated words; at least one must appear within about a
  sentence of the pattern. Nearly every entry here carries one, because this
  market's retired figures are ordinary numbers — `77%`, `90%`, `20 states` —
  that are wrong only in a particular use. Omitted only where the figure is
  distinctive enough to stand alone.
- `ledger` — the pass or the section that retired it
- `verdict` — what to do when it is found

---

## The §6.6 chain — one assertion, counted four times

### R-FS-001 · the 17x–20x fire-platform range
- pattern: 17x
- requires: fire|platform|multiple|valuation|EBITDA
- ledger: A.0.1 / 6.6
- verdict: RETIRED as a valuation input. One origin describing prospective bids on a business that did not sell (PE Hub via SDM, 2024-07-15), in the conditional, on unnamed sources. Two onward attributions do not survive a check of the cited houses' own figures — Capstone publishes 11.8x, Breakwater a 7x–10x ceiling. Retained in §6.6 only as a traced chain, never as a number.

### R-FS-002 · the range's upper bound, quoted alone
- pattern: 20x
- requires: fire|platform|scaled|recurring|EBITDA
- ledger: A.0.1 / 6.6
- verdict: RETIRED. As R-FS-001. "Scaled platforms with strong recurring revenue are transacting at 17x to 20x EBITDA" is an operator's resource page citing an aggregator page citing PE Hub. Same 2024 assertion, second route.

### R-FS-003 · the predicted Pye-Barker deal value
- pattern: 6 billion
- requires: Pye-Barker|listing|valuation|bids
- ledger: 6.6
- verdict: RETIRED. "Potential deal value exceeding $6 billion" is the same single conditional assertion as R-FS-001 and is arithmetically derived from it (V12), not independently observed. No sale and no listing has been announced as of the master's cut-off; January 2025 resolved into an undisclosed-value minority recapitalisation.

### R-FS-004 · the $350M EBITDA denominator
- pattern: $350
- requires: Pye-Barker|EBITDA|PE Hub
- ledger: 6.6
- verdict: RETIRED. Attributed to PE Hub and never confirmed by the company. It is the denominator of the retired range, not a disclosed earnings figure, and it must not be carried as one.

### R-FS-005 · the 3x–5x project-heavy range, written out
- pattern: 3x to 5x
- requires: fire|project|EBITDA|multiple
- ledger: 6.6
- verdict: RETIRED. Travels the same route as R-FS-001 and has the same single ancestry. No named population, no sample, no publisher that holds up.

### R-FS-006 · the 3x–5x project-heavy range, dash form
- pattern: 3-5x
- requires: fire|project|EBITDA|multiple|platform
- ledger: 6.6
- verdict: RETIRED. As R-FS-005.

### R-FS-007 · RMR ranges topping out at 50x or 55x
- pattern: 55x
- requires: RMR|recurring monthly|multiple
- ledger: 6.6
- verdict: TRACE BEFORE USE — §6.6 names an RMR upper bound of 50x or 55x as the signature of the unsourced aggregator chain. The same applies to `50x`. Where the trail ends at a page whose methodology reference resolves back into its own domain, the figure has no independent existence.

### R-FS-008 · the platform-to-tuck-in spread
- pattern: 2.8-3.3x
- ledger: 6.5 / 10.3
- verdict: RETIRED AS STATED. It is 17÷6 and 20÷6 (V9) — the retired trade-press range divided by one company's disclosed ceiling on its own bolt-on programme. Both quotients are upper bounds because the denominator is a ceiling. If carried at all, the only permitted notation is "under 2.83x to under 3.33x, cross-population, numerator unsourced".

---

## A.0.1 — synthesis adjudication, 2026-07-30

### R-FS-009 · Summit / SFP Holding's sponsor
- pattern: BlackRock
- requires: Summit|SFP
- ledger: A.0.1
- verdict: SUPERSEDED as the current owner. BDT & MSD Partners acquired the majority from BlackRock Long Term Private Capital, announced 2025-08-04. BlackRock LTPC may appear only as the named prior owner.

### R-FS-010 · Sciens division count
- pattern: 27
- requires: Sciens
- ledger: A.0.1
- verdict: CORRECTED to 31, counted from the published division table rather than the summary sentence. All 31 trade as "Sciens \<Legacy\> Division"; a list carrying them as independents is wrong 31 times from one platform.

### R-FS-011 · Encore brand-partner count
- pattern: 77
- requires: Encore|brand partner|affiliated
- ledger: A.0.1
- verdict: CORRECTED to 75, counted from the published partner table. Note the company's own site separately claims "over 60 successful partnerships integrated" and the sponsor page 70+; the counted figure is 75.

### R-FS-012 · Encore footprint
- pattern: 17 states
- requires: Encore
- ledger: A.0.1
- verdict: CORRECTED to 13 states. The 17-state figure is a sponsor-page claim and may appear only labelled as such, alongside the verifiable 13-state footprint.

### R-FS-013 · entities trading as "Guardian"
- pattern: four
- requires: Guardian
- ledger: A.0.1
- verdict: CORRECTED to five. Five unrelated entities trade as Guardian in US fire and life safety, and one publishes on two domains (`guardianfireprotection.com` and `ars-guardian.com`). Match on domain only; this is the maximum-severity name collision in the market.

### R-FS-014 · the APi mix-shift, attributed to a slide deck
- pattern: 54%
- requires: inspection|40%|net revenues
- ledger: A.0.1
- verdict: ATTRIBUTION RETIRED, figures stand. 40% (2021) to 54% (2025) must be cited verbatim to the APi Group Q4 2025 earnings call, 2026-02-25 — not to a press summary of an unretrievable slide deck. Do not blend it with the older 20% (2008) to 41% (2020) series: different businesses, different denominators.

### R-FS-015 · the pull-through ratio
- pattern: $3-$4
- requires: inspection|pull-through|service work
- ledger: A.0.1 / A.0.2 / 3.1
- verdict: BASIS REQUIRED. Attribution is APi's own record (Investor Day 2025-05-21 slide 19; Q4 2025 call 2026-02-25), not a research outlet's note — that attribution does not hold. The slide's footnote must travel with the figure: a leadership estimate for US inspection revenues that **excludes purely route-based service revenue, primarily portable fire extinguishers**, so it does not transfer to sub-vertical 3. It is the wider definition and is the ceiling, not the base case.

---

## A.0.2 — primary-source verification pass, 2026-07-30

### R-FS-016 · the carve-out multiple paired with the wrong EBITDA
- pattern: 11.2x
- requires: 158
- ledger: A.0.2 / 6.3
- verdict: WRONG PAIRING. Both multiples are printed in the same exhibit on an EV of $1,613M: **10.2x on $158M before the corporate-cost allocation, 11.2x on $144M after it** (ADT Inc. 8-K EX-99.1, 2023-08-08). A carve-out EBITDA quoted before corporate-cost allocation is not the EBITDA the multiple was struck on.

### R-FS-017 · the headline-pair carve-out multiple
- pattern: 10.13x
- ledger: 6.3
- verdict: NOT A DISCLOSED MULTIPLE. It is the artefact of building a comparable from the headline pair — $1.6B against $158M — and books the transaction roughly a full turn below what the seller disclosed (V6).

### R-FS-018 · the ≈91% retention figure
- pattern: 91%
- requires: Everon|retention|customer life|attrition
- ledger: A.0.2 / 3.3
- verdict: ATTRIBUTION CORRECTED and BASIS REQUIRED. It is ADT Inc., *Business Overview and Financial Modeling*, April 2022, measuring ADT's **Commercial** segment as of 2021-12-31 — not an "Everon investor deck"; Everon did not exist until the rebrand at the GTCR close, 2023-10-02. It is a blended commercial security-plus-fire book with no published definition (logo, revenue or RMR retention is unstated), and must be labelled a proxy every time it is used. Never place it on the same axis as the 13.1% residential RMR attrition rate.

### R-FS-019 · the Maryland high-rise retrofit deadline
- pattern: 2033
- requires: Maryland|high-rise|retrofit|sprinkler
- ledger: A.0.2 / 1.8
- verdict: SUPERSEDED. "By January 1, 2033" was replaced with "within 12 years of the date of the original violation notice issued by the fire authority having jurisdiction", plus a 180-day intent-to-comply filing and mandatory signage (COMAR 29.06.01.07 and 29.06.01.08, effective 2025-06-23). The clock is rolling and per-building, not a statutory date.

### R-FS-020 · the Maryland mandate described as eliminated
- pattern: eliminated
- requires: Maryland|high-rise|retrofit|sprinkler
- ledger: A.0.2 / 1.8
- verdict: RETIRED. The obligation was **retained and re-timed**, not eliminated. The re-timing is the finding; a deletion would have been less instructive.

### R-FS-021 · the single-sprinkler statistic
- pattern: 77%
- requires: single sprinkler|sprinkler head|one operated|controlled
- ledger: A.0.2 / 8.3
- verdict: RESTATE. Not "77% of fires controlled by a single sprinkler head". The source says: "In 77 percent of the structure fires **where sprinklers operated**, only one operated" (Ahrens, *US Experience with Sprinklers*, NFPA, October 2021). A conditional share, and operation rather than control. Note §8.3's own table label still carries the retired wording.

### R-FS-022 · the CMS extension language, object dropped
- pattern: authority to allow extensions
- ledger: A.0.2 / 1.4
- verdict: OBJECT REQUIRED. CMS stated it has no authority to allow extensions **of the August 13, 2013 deadline** (CMS S&C-13-55-LSC, 2013-08-16). The unqualified form — "CMS does not have authority to allow extensions" — overstates the source.

### R-FS-023 · the CMS citation level, hedge dropped
- pattern: D, E or F
- requires: CMS|deficienc|citation|Life Safety Code
- ledger: A.0.2 / 1.4
- verdict: HEDGE REQUIRED. Deficiencies are **usually** cited at that scope and severity level. An unhedged "citation at D, E or F minimum" is retired.

### R-FS-024 · transactions in the sector-dedicated update
- pattern: 110
- requires: Meridian|transaction|edition
- ledger: A.0.2
- verdict: CORRECTED to 133 — 73 in Winter 2025 and 60 in Summer 2025 (Meridian Capital). Deal tempo is edition-specific and the two editions differ; do not merge them into a single "110-plus" claim. The finding that survives is that not one of the 133 carries a value.

### R-FS-025 · the fire-retrofit floorspace category
- pattern: 19,985
- requires: retrofit|upgrade|renovation
- ledger: A.0.2 / 8.4
- verdict: BASIS REQUIRED. The EIA CBECS 2018 category is "Fire, safety, **or security** upgrade" (19,985 million sq ft, 570 thousand buildings, Tables B10 and B6). It fuses fire with safety and security and does not license a fire retrofit market size. The sprinklered share of US commercial stock remains unestablished, and §10.3 says plainly: do not size a retrofit market.

### R-FS-026 · APi's bolt-on ceiling
- pattern: under 6x
- requires: bolt-on|bolt on|tuck-in|multiple
- ledger: A.0.2 / 6.5
- verdict: BASIS REQUIRED. `<6x` is an investor-relations disclosure appearing in **no SEC filing**, and it is a bound on a weighted average rather than a series. No per-year multiple is sourced to it — "the programme paid 5.4x in 2023" is not a disclosure. No verifiable time series of bolt-on entry multiples exists in US fire and life safety.

### R-FS-027 · the US commercial property rate move
- pattern: 12%
- requires: us commercial property|u.s. commercial property|us property rates
- ledger: A.0.2 / 8.1
- verdict: SCOPE ERROR. −12% in Q2 2026 is the **global** commercial property figure. The US figure is **−13%**, one of five regions posting a double-digit property decline (Marsh, Global Insurance Market Index Q2 2026, 2026-07-22).

### R-FS-028 · the sprinkler revenue line, mischaracterised
- pattern: 12.0186
- requires: establishment|contractor count|firm count|market size|revenue of
- ledger: A.0.2 / 2.1
- verdict: BASIS REQUIRED. `CONKB` 8221 is the **value of building-sprinkler-installation work allocated across all of sector 23**, not the revenue of establishments classified as sprinkler contractors. `CONKB` is not an establishment classification, which is why the table carries no establishment count and why **no contractor count may be derived from it**. Same rule applies to the thousands form, 12,018,607. It is *installation* only and excludes non-employer firms.

---

## A.1 — conflicts carried, never averaged, never asserted alone

### R-FS-029 · APi FY2025 revenue, aggregator value
- pattern: $7.0
- requires: APi Group|FY2025|revenue
- ledger: A.1
- verdict: RETIRED. "Approximately $7.0bn" is an aggregator figure and is the **prior year mislabelled**. The issuer figure is $7,911M.

### R-FS-030 · Pye-Barker's 2025 acquisition count
- pattern: 57
- requires: Pye-Barker|acquisition|add-on|closings
- ledger: A.0.2 / A.1
- verdict: BOTH STAND. 57 (Pye-Barker, 2026-03-17) against 41 (Capstone, 2026-02-02) for the same company and period. **Neither publication states a cut-off date or a counting rule**, so the 16-deal difference has no established cause and must not be explained away. Never present either figure without naming the other.

### R-FS-031 · Local 669 membership
- pattern: 17,000
- requires: 669|sprinkler fitter|membership|union
- ledger: A.1 / 2.2
- verdict: SECONDARY. "Over 17,000" is the union's own claim. The primary instrument is the 2025 US DOL LM filing at **16,631**, a 2.22% gap. Both carried; the filing leads and the union figure is named alongside it.

### R-FS-032 · Rockville systems found compliant
- pattern: 90%
- requires: Rockville|found compliant
- ledger: A.1 / 1.5
- verdict: BOTH CARRIED. The city states 90%; its own counts give 1,933 ÷ 2,083 = **92.80%**. Neither is the figure the argument leans on — that is the **63% currency** on annual inspections, which reconciles exactly and is a different metric.

### R-FS-033 · US office vacancy
- pattern: 20.2%
- requires: vacancy|office
- ledger: A.1 / 8.5
- verdict: BOTH CARRIED. 20.2% (Cushman & Wakefield, Q1 2026) against 17.7% (CommercialCafe, June 2026). A definitional gap, not a data error; neither may be asserted alone as "US office vacancy".

### R-FS-034 · AI Fire footprint
- pattern: 20 states
- requires: AI Fire|Impact Fire
- ledger: A.1
- verdict: UNRESOLVED CONFLICT. 20 states on the company timeline against 18 states on the sponsor release. Both carried; neither stated alone.

### R-FS-035 · the RMR market bands
- pattern: 46x
- requires: RMR|recurring monthly|band
- ledger: A.1 / 6.4
- verdict: BASIS REQUIRED. The 36x and 46x bands are market aggregates attributed to **no named transaction**, and the vintage behind them is given as 2024 in one account and as a 2025 average in another — both carried. Never read them against the one disclosed RMR multiple (R-FS-036).

---

## Populations that must not be blended

### R-FS-036 · the disclosed RMR multiple
- pattern: 21.15x
- ledger: 6.4
- verdict: ONE POPULATION ONLY. ≈21.15x RMR at ≈$275 per unit is a **bulk account and asset purchase** in residential multifamily — no branches, no technicians, no backlog — sold by a seller that had already sold its commercial arm to the buyer's sponsor (ADT 8-K, 2025-09-15). It must not be read against the 36x/46x bands, and it is a data point for bulk residential multifamily accounts and for nothing else.

### R-FS-037 · the Autronica multiple as a fire-services comparable
- pattern: 17.3x
- requires: Autronica|MSA|manufacturer|fire
- ledger: 6.1 / 6.3
- verdict: WRONG POPULATION. Autronica is P5 — product and OEM adjacency, a manufacturer, not a service contractor. Reading the three manufacturer transactions (Autronica, Spectrum, Kidde) as fire-services comparables is named in §6.1 as "the most available category error in the record".

### R-FS-038 · the Chubb multiple without its regime label
- pattern: 13.3x
- requires: Chubb|carve-out|PRE-2023
- ledger: 6.3
- verdict: LABEL REQUIRED. ≈13.3x LTM Adjusted EBITDA is **including synergies** and is marked `PRE-2023` because it was struck in a different rate regime. It is not comparable to any post-2022-03 multiple and may not appear on a chart with one.

### R-FS-039 · the Convergint vehicle size read as an enterprise value
- pattern: 850
- requires: Convergint
- ledger: 6.3
- verdict: NOT AN ENTERPRISE VALUE. ≈$850M is total commitments to a single-asset continuation vehicle. The two are not interchangeable, and a continuation vehicle is a valuation event without a competitive clearing price.

### R-FS-040 · the Encore transaction value
- pattern: $1.8
- requires: Encore|Permira|Levine
- ledger: 6.3
- verdict: NOT A DISCLOSURE. A press figure citing unnamed sources (Bloomberg, 2025-02-06); the sponsors' and the adviser's own releases state terms were not disclosed. Public is not the same as disclosed — name the outlet, carry no derived multiple.

### R-FS-041 · the AI Fire transaction value
- pattern: $1.1
- requires: AI Fire|Impact Fire|TruArc|Blackstone
- ledger: 6.3
- verdict: NOT A DISCLOSURE. As R-FS-040 (Bloomberg, 2025-02-07); the seller's release names neither buyer nor price.

---

## Containers, ceilings and floors — §2.1, §2.3, §2.4, §2.6

### R-FS-042 · the 238220 establishment count as a fire count
- pattern: 114,427
- requires: fire|sprinkler|protection|life safety
- ledger: 2.1 / 2.6
- verdict: CONTAINER COUNT. It is NAICS 238220 — plumbing, heating and air-conditioning contractors. Reporting it as a fire-protection establishment count **overstates the sub-vertical by more than an order of magnitude**. No federal instrument publishes a fire-specific establishment count, and none can be derived from the one clean revenue line (R-FS-028).

### R-FS-043 · the sub-five share as a fire size distribution
- pattern: 53%
- requires: fire|size distribution|fragmentation|sub-five|less than 5
- ledger: 2.6 / A.2
- verdict: CONTAINER DISTRIBUTION. 53.44% under five employees describes the plumbing, HVAC and fire-sprinkler trade together. A fire-protection contractor running a 20-employee ITM crew is structurally closer to the 20-to-49 band. It supports a statement about how the containing trades are structured; it licenses nothing about fire contractors specifically.

### R-FS-044 · the alarm bound presented as a size
- pattern: 49,827,808
- ledger: 2.3 / A.2
- verdict: CEILING, NOT A SIZE. It is the sum of two differently-scoped containers (`CONKB` 8212 and NAICS 561621) that **both fuse fire with burglar at the definitional level**. The fire share is unknown and unknowable from published Census. Alarm, detection and monitoring has a ceiling and no size, and the master says so rather than filling the gap.

### R-FS-045 · the alarm-installer headcount as a fire headcount
- pattern: 85,900
- requires: installer|alarm|technician|employment|headcount
- ledger: 2.3
- verdict: CONTAINER COUNT. SOC 49-2098 is "Security **and** Fire Alarm Systems Installers". The occupation title carries the same fusion as the two revenue instruments and is not a fire-only headcount.

### R-FS-046 · the sub-vertical 3 floor
- pattern: 1.1-2.6
- ledger: 2.4 / A.2
- verdict: FLOOR, NOT AN ESTIMATE. A bottom-up service-revenue floor that omits equipment, installation and two whole service lines, and that the arithmetic itself indicates is low. **Do not present it alongside §2.2 as "$12.0186B versus $1.1–2.6B"** — different measures — and do not sum it with anything. No combined market total appears anywhere in the master and one must not be constructed from its parts.

---

## Capture, compliance and the vendor-published layer — §1.5

### R-FS-047 · the national compliance gap
- pattern: 37%
- requires: not current|currency|uncaptured|latent|compliance gap
- ledger: 1.5
- verdict: SINGLE JURISDICTION. 37% is the complement of Rockville's 63% currency rate — one city, chosen for enforcement rather than neglect. **No published source establishes the national share of legally inspectable systems that are current**, so the top-down compliance-gap pitch cannot be sourced and must not be extrapolated. The only defensible route to a capture estimate runs bottom-up through a target's own book.

### R-FS-048 · the Burlington compliance rate
- pattern: 89%
- requires: Burlington|BRYCER|full compliance
- ledger: 1.5
- verdict: VENDOR CLAIM, label required. 686 systems actively tracked in one city, published by the reporting platform's own operator. Carry it as a vendor claim with the interest disclosed, or not at all. (Note 89% is also the NFPA civilian-death-rate reduction in §8.3 — different figure, different source; check which one a hit is.)

### R-FS-049 · the false-alarm attribution
- pattern: 32%
- requires: false alarm
- ledger: 1.5
- verdict: VENDOR CLAIM, label required. Attributed by the reporting operator (BRYCER) to systems non-compliant with ITM requirements. Vendor-published, interest disclosed, no methodology.

---

## Third-party market sizing — §8.6, not used anywhere

### R-FS-050 · the Grand View base-year size
- pattern: 88,945
- ledger: 8.6 / A.1
- verdict: NOT USED. Global, not US. Not decomposable into the three sub-verticals. Six significant figures on a global estimate with no traceable public methodology, and a CAGR label whose window and arithmetic describe different periods (N6). The forecast figure 130,369.2 carries the same bar.

### R-FS-051 · the MarketsandMarkets base-year size
- pattern: 85.06
- ledger: 8.6 / A.1
- verdict: NOT USED. As R-FS-050 — global, not decomposable. It sits $9,755m (11.47%) below the other publisher's roll-forward for the same year. Both stand; no midpoint is taken and neither appears in any sizing. The 118.14 forecast carries the same bar.

### R-FS-052 · the roll-forward comparison figure
- pattern: 94.8
- requires: market|global
- ledger: 8.6
- verdict: DERIVATION ONLY. ≈$94.8bn exists solely to quantify the gap between the two vendor sizings (N8). It is not a market size, it is not published by anyone, and it must never be presented as either.

---

## Operating economics — figures that are wrong only down-market

### R-FS-053 · the cost-structure residual quoted as EBITDA
- pattern: 34.40%
- requires: EBITDA|margin|profit
- ledger: 7.1
- verdict: NEVER AS EBITDA — the master's words are "under any circumstances". It is receipts less payroll, materials and subcontractors for the whole 238220 container, before facilities, insurance, fleet, software, licensing, bonds, sales, professional fees and bad debt. It is a hard upper bound whose only legitimate use is falsification.

### R-FS-054 · value added less payroll quoted as EBITDA
- pattern: 32.11%
- requires: EBITDA|margin|profit
- ledger: 7.1
- verdict: NEVER AS EBITDA. As R-FS-053.

### R-FS-055 · the mid-teens segment margin, travelling down-market
- pattern: mid-teens
- requires: margin|EBITDA|independent|target|contractor
- ledger: 7.1
- verdict: SEGMENT FIGURE ONLY. It sits inside multi-billion-dollar filers with centralised procurement, captive functions and no owner compensation add-back. It is not what a single-branch sprinkler contractor earns, and using it as an exit-margin assumption for a small independent embeds a synergy that has not been named, costed or timed. **No EBITDA benchmark for small US fire contractors exists in the public record.**

### R-FS-056 · the 20%-plus margin threshold as a benchmark
- pattern: in excess of 20%
- ledger: 7.1
- verdict: NOT A BENCHMARK. "Margins in excess of 20% [EBITDA] indicative of strong labor and operational efficiency" (Meridian Capital, Winter 2025) is a sell-side threshold characterisation, not a distribution and not a survey. It may not stand in for the benchmark that does not exist.

### R-FS-057 · remaining performance obligations as recurring revenue
- pattern: 74%
- requires: performance obligation|backlog|recurring|twelve months
- ledger: 7.2
- verdict: PROJECT BACKLOG. $3,605M of remaining performance obligations at 2025-12-31, 74% expected within twelve months, equals 45.57% of a year's revenue (E7). It is a project backlog and **should never be presented as contracted recurring revenue** — typical install contract period is under six months.

### R-FS-058 · the segment gross-margin spread as a work-type differential
- pattern: 1,840
- requires: basis points|margin|spread
- ledger: 3.4
- verdict: WRONG COMPARISON. The Safety Services versus Specialty Services spread is a difference between **two different businesses**, not a service-versus-install differential inside one, and it must not be used as the latter. What it establishes is that the service-weighted segment carries roughly twice the gross margin of the project-weighted segment under one management.

### R-FS-059 · the pipefitter wage as a sprinkler-fitter wage
- pattern: 63,800
- requires: sprinkler
- ledger: 7.3
- verdict: WRONG DENOMINATOR. That is the SOC 47-2152 container median across 504,500 plumbers, pipefitters and steamfitters, whose aggregate wage is set by residential plumbing. **There is no reliable published wage-inflation series for sprinkler fitters, and the 47-2152 series must not be used as a proxy for one.** The 49-2098 series is usable directly for alarm and detection only.

---

## Insurance — §8.2, §8.3

### R-FS-060 · the sprinkler insurance discount
- pattern: 35%
- requires: discount|premium|insurer|carrier|credit
- ledger: 8.2
- verdict: RESIDENTIAL, AND WEAKLY ATTRIBUTED. "Discounts as high as 35%" is for homes with sprinklers, four years old, from a poll of unnamed insurers with no published methodology (Home Fire Sprinkler Coalition, last modified 2022-05-18). **No carrier or broker publication establishes a quantified premium differential for sprinklered versus unsprinklered commercial risk** — the industry's most-repeated commercial claim has no traceable public source. A model that capitalises insurance-driven retrofit demand is capitalising an unquantified premium.

### R-FS-061 · the sprinkler loss-reduction case without its inversion
- pattern: 62%
- requires: average loss|loss per fire|loss reduction
- ledger: 8.3
- verdict: OCCUPANCY REQUIRED. 62% lower average loss per fire is **homes**; all structures is 11% lower; and in **warehouses and manufacturing the average loss is HIGHER in sprinklered properties** (Ahrens, NFPA, October 2021). The life-safety case holds across every occupancy; the property-loss case fails in exactly the two classes where the largest industrial accounts sit. Never present the loss-reduction figures without the inversion.
