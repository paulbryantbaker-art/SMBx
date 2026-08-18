# 07 — Valuation and the Deal Record (US Fire & Life Safety)

**Stream:** 07 of 8 · buy-side corporate-development market study
**Compiled:** 2026-07-29
**Coverage window:** 2019-01-01 → 2026-07-29
**Basis vocabulary:** `Disclosed` = stated by a party to the transaction or in an SEC filing · `Press-derived` = stated by a third party (outlet, data vendor, advisory firm) · `Estimated` = my arithmetic, shown in `## Derivations`

---

## 0. Method note and tool constraints (read this before using any figure)

The general WebSearch budget for this session was already exhausted (200/200 calls) when this stream began. **Every figure below was obtained by direct document retrieval**, not by search-result summary. Retrieval paths that worked: SEC EDGAR full-text search (`efts.sec.gov`) and `sec.gov/Archives`, PR Newswire keyword search, issuer IR sites, `stockanalysis.com`, `securityinfowatch.com` article pages, `sentinelpartners.com`, `leonardgreen.com`, `aifire.com`.

Retrieval paths that were **blocked or unavailable**, and which therefore bound the completeness of this file:

| Path | Failure |
|---|---|
| Google / Bing / DuckDuckGo / Ecosia / Startpage / searx | robots-disallowed or bot-challenge |
| `sdmmag.com/search`, `securitysystemsnews.com/search`, `securityinfowatch.com/search` | robots-disallowed or JS-rendered, no results in HTML |
| `pehub.com` search results | JS-rendered, zero article data in HTML |
| `web.archive.org/cdx` | proxy 403 |
| `encorefp.com`, `kiddeglobal.com` | robots.txt unreachable |
| `convergint.com/news`, `convergint.com/newsroom` | 404 |
| `gtcr.com/news` | HTTP 429 |
| `capstonepartners.com` fire/life-safety report, `hl.com/insights/industry-reports` | 404 / not present at guessed paths |
| direct `curl` | egress policy 403 (all hosts) |

**Consequence:** the four anchors I could *not* independently verify are all ones whose only reported home is trade press or paywalled PE media (Pye-Barker, AI Fire, Encore, Convergint). See `## What I could not verify`. I did not substitute, round, or reconstruct any of them.

---

## 1. The population taxonomy — five non-comparable multiple populations

A multiple in this industry is meaningless without its population. These five are reported separately throughout this file and are **never** combined into a range.

| # | Population | Definition used here | Verified observations in this file |
|---|---|---|---|
| **P1** | **Platform / carve-out** | Business with roughly $50M+ EBITDA bought by a sponsor or strategic, usually with its own management, brand and P&L | 3 with a disclosed or derivable EBITDA multiple |
| **P2** | **Bolt-on / tuck-in** | $1–5M EBITDA independent bought by an existing platform | 0 with any per-deal disclosed multiple; 1 disclosed programme-level threshold (APi, `<6x`) |
| **P3** | **RMR multiple** | Multiple of *monthly* recurring revenue, the alarm/monitoring convention | 2 verified populations (Barnes size-banded averages; one disclosed bulk-account transaction) |
| **P4** | **Public trading comparables** | Listed acquirers and adjacents, EV/EBITDA and EV/Revenue at an observation date | 9 tickers, observed 2026-07-24 → 2026-07-29 |
| **P5** | **Product / OEM adjacency** | Fire detection, suppression and gas-detection *manufacturers*, not services | 3 transactions; 1 with a derivable EBITDA multiple |

P5 is added because two of the largest 2024–2026 "fire" transactions (Spectrum Safety Solutions, Kidde Global Solutions) and the single most recent EBITDA-derivable deal (Autronica) are **manufacturers**, not service contractors. Reading them as fire-services comps is the most common category error available in this dataset.

---

## 2. P4 — Public trading comparables

All rows from `stockanalysis.com` statistics pages, which attribute the underlying data to S&P Global Market Intelligence. **Basis: Press-derived** (third-party vendor computation, not issuer-disclosed). EV/EBITDA here is a trailing figure as computed by the vendor; I did not verify the vendor's EBITDA definition against each issuer's own Adjusted EBITDA.

| Ticker | Company | Market cap | Enterprise value | EV/EBITDA | EV/Sales | Observed | Relevance |
|---|---|---|---|---|---|---|---|
| APG | APi Group | $17.04B | $19.41B | **21.47** | 2.37 | 2026-07-28 | Pure-play life-safety services consolidator |
| JCI | Johnson Controls | $85.59B | $94.41B | **26.36** | 3.86 | 2026-07-29 | Fire (Tyco/Simplex/Ansul) + BMS |
| FIX | Comfort Systems USA | $53.06B | $55.61B | **27.74** | 4.95 | 2026-07-29 | Mechanical/electrical contractor incl. fire protection |
| EME | EMCOR Group | $31.37B | $30.97B | **15.52** | 1.74 | 2026-07-29 | Mechanical/electrical contractor |
| ADT | ADT Inc. | $5.36B | $12.94B | **7.62** | 2.52 | 2026-07-29 | Residential monitoring post-Commercial divestiture |
| CARR | Carrier Global | $52.46B | $63.51B | **22.59** | 2.87 | 2026-07-28 | Former owner of both divested fire businesses |
| MSA | MSA Safety | $6.80B | $7.28B | **15.80** | 3.80 | 2026-07-24 | Buyer of Autronica; safety/detection products |
| CNM | Core & Main | $8.15B | $10.81B | **11.76** | 1.41 | 2026-07-29 | Waterworks + fire-protection *distribution* |
| HLMA.L | Halma plc (GBP) | £17.61B | £18.25B | **30.46** | 7.57 | **2026-06-07** | UK safety/detection products group |

**Observation-date conflict, preserved:** Halma's page was last updated 2026-06-07, seven-plus weeks before the US names. A 2026-06-07 multiple and a 2026-07-29 multiple are two different observations and are not shown as one set. Halma is also GBP-denominated and not currency-converted here.

**Reading for a buy-side thesis, without opinion on any target:**
- The two pure services contractors sit far apart — EME at 15.52x versus FIX at 27.74x — so "listed contractor comps" is not a single population either.
- ADT at 7.62x EV/EBITDA is the cheapest name on the board and is the *only* one that is now a pure monitoring/RMR business. That is the market's price for residential RMR in a listed wrapper, and it sits well below any RMR-implied private multiple in §5.
- APG at 21.47x against its own disclosed bolt-on threshold of `<6x` is the arithmetic centre of the roll-up thesis (§6).

---

## 3. Transaction record

Sub-verticals reported separately. Every row carries a date, both parties, the sponsor where identified, a Basis label and a retrievable source. Rows with no EV say so rather than estimating one. **Every pre-2023 multiple is flagged `PRE-2023 RATE ENVIRONMENT`.**

### 3.1 Sub-vertical 1 — Fire protection contracting (sprinkler / suppression install + ITM)

| # | Date | Target | Acquirer | Sponsor behind acquirer | EV | Revenue | EBITDA | Multiple | Basis | Source |
|---|---|---|---|---|---|---|---|---|---|---|
| T1 | Announced 2021-07-26/27; closed **2022-01-03** | **Chubb Fire & Security Group** (carve-out from Carrier) | **APi Group** (NYSE: APG) | none — listed strategic | **$3.1B** ("comprised of $2.9 billion cash and approximately $200 million of assumed liabilities") | 2020A ≈$2.2B; 9M-2021 net sales **$1,621,825k** | not stated; Adj. EBITDA margin ≈9.6% (2020A) | **"\~13.3x LTM Adjusted EBITDA including synergies"** — `PRE-2023 RATE ENVIRONMENT` | **Disclosed** | APi 8-K 2021-07-30 EX-99.2 investor deck; Carrier 8-K 2021-07-27 EX-99.1; APi 8-K 2022-01-03 EX-99.1 & EX-99.2 |
| T2 | Announced 2025-12-10; closed **2026-02-02** | **CertaSite, LLC** | **APi Group** | none — listed strategic | **$271M** total consideration ("cash paid at closing of $268 and cash deposited in escrow of $3"); goodwill $156M, intangibles $98M | **≈$90M** FY2025 ("expected to deliver full year 2025 revenue of approximately $90 million") | not disclosed | **EV/Revenue ≈3.01x** (D3); no EBITDA multiple obtainable | **Disclosed** (price, revenue); **Estimated** (revenue multiple) | APi 10-Q for Q1-2026 (`apg-20260331.htm`), Business Combinations note; APi PR 2025-12-10 |
| T3 | Announced 2026-04-23; closed **2026-06-08** | **Onyx-Fire Protection Services, Inc.** (Canada) | **APi Group** | none — listed strategic | not disclosed separately | **≈$190M** annual ("Onyx-Fire is expected to contribute approximately $190 million in annual revenue") | not disclosed; implied incremental Adj. EBITDA margin **15.0%** (D5) | not disclosed | **Disclosed** (revenue); **Estimated** (margin) | APi 8-K 2026-06-09 EX-99.1 |
| T4 | Announced 2026-04-17; closed **2026-07-01** | **WTech Fire Group** (Ireland) | **APi Group** | none — listed strategic | not disclosed separately | **≈$175M** annual ("WTech is expected to contribute approximately $175 million in annual revenue") | not disclosed; implied incremental Adj. EBITDA margin **14.1%** (D5) | not disclosed | **Disclosed** (revenue); **Estimated** (margin) | APi 8-K 2026-07-02 EX-99.1 |
| T5 | Q1-2026 | four unnamed "individually immaterial acquisitions" | **APi Group** | none | **$25M** aggregate ("$19" cash at closing + "$6 million" accrued); goodwill $15M, intangibles $8M | not disclosed | not disclosed | not disclosed | **Disclosed** | APi 10-Q Q1-2026 |
| T6 | Announced 2025-08-12; closed **2025-08-21** | **Performance Systems Integration** (PSI, Portland OR) | **Summit Fire & Security LLC** (subsidiary of SFP Holding, Inc. / Summit Companies) | sponsor not named in release | not disclosed | not disclosed | not disclosed | not disclosed | **Disclosed** (fact of deal only) | PR Newswire 2025-08-27 |
| T7 | 2026-03-18 | **LaMarco Systems Inc.** | **Fortis Fire & Safety Inc.** (founded 2021; CA/FL/IL/NC) | sponsor not named in release | not disclosed | not disclosed | not disclosed | not disclosed | **Disclosed** (fact of deal only) | PR Newswire 2026-03-18 |
| T8 | 2025 full year | **57 unnamed targets** | **Pye-Barker Fire & Safety** | **Leonard Green & Partners** (buyout, "Current Investment") | none disclosed | none disclosed | none disclosed | none disclosed | **Disclosed** (deal count and scale only) | PR Newswire 2026-03-17; leonardgreen.com portfolio page |

**APi bolt-on programme, disclosed series** (APi Investor Update, 2025-02-27, page 12, headline "Strong Adjusted Free Cash Flow Generation Reinvested Through Attractive M&A"):

| Year | # bolt-ons | Aggregate purchase price | Avg. price / deal (D9) | Implied *minimum* EBITDA acquired at the `<6x` cap (D9) |
|---|---|---|---|---|
| 2019 | 3 | $9M | $3.0M | >$1.5M total |
| 2020 | 7 | $42M | $6.0M | >$7.0M total |
| 2021 | 12 | $114M | $9.5M | >$19.0M total |
| 2022 | 1 | $5M | $5.0M | >$0.8M total |
| 2023 | 7 | $98M | $14.0M | >$16.3M total |
| 2024 | 12 | $250M | $20.8M | >$41.7M total |
| **2025** | **14** | **$232M (Estimated, D8)** | **$16.6M (Estimated)** | **>$38.7M total (Estimated)** |
| 2026 plan | n/d | "approximately $250 million in bolt-on M&A at attractive multiples this year" | — | — |

Footnote as printed on the slide: **"Excludes SKG in 2020, Chubb in 2022, Elevated in 2024 and non-material customer account purchases."**

**Critical precision point on the APi `<6x` figure.** The deck's exact subheading is **"Weighted Average Adjusted EBITDA Multiple for Bolt-on Acquisitions <6x in Each Year"**. APi discloses a *threshold that each year cleared*, not a per-year number. There is **no disclosed 2019 multiple, no disclosed 2024 multiple, and no disclosed series of six annual multiples**. Any statement of the form "APi paid 5.4x in 2023" is not sourced to this deck and I found no other APi source that gives one. The correct underwriting statement is: *the weighted average was below 6x in each of 2019–2024, on a base that excludes SKG, Chubb, Elevated and customer-account purchases.*

### 3.2 Sub-vertical 2 — Alarm, detection and monitoring

| # | Date | Target | Acquirer | Sponsor | EV | Revenue | EBITDA | Multiple | Basis | Source |
|---|---|---|---|---|---|---|---|---|---|---|
| T9 | Announced **2023-08-08**; closed **2023-10-02** | **ADT Commercial** (commercial security, fire and life safety business unit of ADT Inc.) → renamed **Everon** | **GTCR** | GTCR (PE) | **$1,613M** in ADT's own reconciliation ("$1.6 billion" in the headline); net cash proceeds **$1,563M**; pre-tax gain $661M on carrying value $925M | Commercial segment revenue **FY2022 $1,227M**; **H1-2023 $683M** | **Commercial Adjusted EBITDA $158M** for the twelve months ended 2023-06-30, **less $(14)M estimated corporate cost allocation = $144M** | **"approximately 11.2X"** EV/Commercial Adjusted EBITDA **including estimated corporate costs** — i.e. struck on **$144M**, not $158M | **Disclosed** | ADT PR via GlobeNewswire 2023-08-08 and newsroom PDF; ADT 8-K 2023-10-02 EX-99.1 and EX-99.2 pro forma |
| T10 | Announced **2025-09-15**; expected close end Q3-2025 | **ADT multifamily business** (asset/bulk-account sale) | **Everon, LLC** | GTCR | **"approximately $55,000,000 in cash, subject to certain customary adjustments"** | — | — | **≈21.15x RMR** (D7); ≈$275 per unit | **Disclosed** (price, units, RMR); **Estimated** (multiple) | ADT 8-K filed 2025-09-15 (`adt-20250912.htm`), Item 8.01 |
| T11 | 2026-05-01 | **IntelliTech Fire & Security, Inc.** | **Gardiner** | not named | not disclosed | not disclosed | not disclosed | not disclosed | **Disclosed** (fact only) | PR Newswire 2026-05-01 |
| T12 | 2026-06-16 | **SprinkGuard** | **Space Age Electronics** | **DelCam Capital** | not disclosed | not disclosed | not disclosed | not disclosed | **Disclosed** (fact only) | PR Newswire 2026-06-16 |
| T13 | Announced **2025-09-15** | **SimpliSafe** (residential DIY monitoring — adjacent, not fire) | **GTCR** | GTCR | not verified | not verified | not verified | not verified | **Disclosed** (fact only) | PR Newswire 2025-09-15 |

**T9 wording, verbatim, because it is the single load-bearing multiple in the whole file:**
> "ADT has entered into a definitive agreement to sell its commercial security, fire and life safety business unit to GTCR, a leading private equity firm, for a purchase price of $1.6 billion"
> "Represents an attractive EV/Commercial Adjusted EBITDA multiple of approximately 11.2X<sup>1</sup> including the estimated allocation of corporate costs"
> footnote 1: "EV/Commercial Adjusted EBITDA is a non-GAAP measure. Refer to the reconciliations that follow for the presentation of the most comparable GAAP measure along with the GAAP to non-GAAP reconciliation."

ADT's own reconciliation table, as filed: Commercial Adjusted EBITDA **$158M** for the twelve months ended 2023-06-30 · estimated corporate cost allocation **$(14)M** · "Commercial Adjusted EBITDA including estimated corporate costs" **$144M** · purchase price **$1,613M** · "EV/Commercial Adjusted EBITDA including estimated corporate costs **11.2x**".

> **CORRECTION TO A CARRIED-IN ANCHOR.** The framing carried into this stream — *"$1.6B on $158M LTM Adj. EBITDA = 11.2x"* — **does not compute**: $1,600M ÷ $158M = 10.13x, and $1,613M ÷ $158M = **10.21x**. The disclosed 11.2x is struck on **$144M**, after deducting $14M of estimated allocated corporate costs, and on an EV of **$1,613M** rather than the headline $1.6B (D6). The 11.2x figure itself is correct as ADT published it; the *denominator attributed to it* was wrong. Anyone rebuilding a comp set from "$1.6B ÷ $158M" will book this deal ≈1.0 turn cheaper than ADT disclosed it. **The buy-side lesson generalises: a carve-out EBITDA quoted before corporate-cost allocation is not the EBITDA the multiple was struck on**, and this seller disclosed the bridge only in a reconciliation table beneath the headline.

**Testing the prior stream's flag on T9.** The claim carried in was that 11.2x "sits *below* the 17–20x being talked about for fire platforms." I can confirm the 11.2x half of that comparison from primary documents. I could **not** verify the 17–20x half at all (see §7 and `## What I could not verify`), so the comparison as stated is a comparison between one audited disclosure and one unverifiable number, and should not be carried further in that form. What *can* be said from verified data is narrower and more useful:

- 11.2x (2023-08) is below APi's Chubb 13.3x incl. synergies (2021-07), below the ≈17.3x derivable on MSA/Autronica (2026-05), and below APG's own 21.47x trading multiple (2026-07-28).
- But T9 is **not** a fire-services platform. Its revenue base is commercial *security* plus fire and life safety, at an implied Adjusted EBITDA margin of ≈10.5% after corporate-cost allocation, or ≈11.6% before it, on annualised H1-2023 revenue (D6), and it was sold by a levered public seller under explicit deleveraging pressure ("Proceeds from the sale...will be used to reduce debt by $1.5 billion"). A forced-deleveraging carve-out of a mixed security/fire asset is its own population of one. It does not price the ITM-heavy services roll-up, and it does not disprove a higher number for one either.

### 3.3 Sub-vertical 3 — Extinguisher, kitchen and special hazard (and the P5 product/OEM adjacency)

| # | Date | Target | Acquirer | Sponsor | EV | Revenue | EBITDA | Multiple | Basis | Source |
|---|---|---|---|---|---|---|---|---|---|---|
| T14 | Closed **2024-07-01 / 2024-07-02** (see conflict) | **Carrier Industrial Fire** → **Spectrum Safety Solutions** (brands: **Autronica, Det-Tronics, Fireye, Marioff**; ≈1,400 employees) | **Sentinel Capital Partners** | Sentinel (PE) | **$1.425B** enterprise value | not disclosed | not disclosed | **none obtainable** | **Disclosed** (EV only) | Sentinel PR 2024-07-02; Carrier FY2024 10-K |
| T15 | Closed **2024-12-02** | **Carrier Commercial & Residential Fire** → **Kidde Global Solutions** | **Lone Star Funds** | Lone Star (PE) | **$3B** enterprise value | not disclosed standalone | not disclosed | **none obtainable** | **Disclosed** (EV only) | Carrier 8-K 2024-12-02 EX-99.1; Carrier FY2024 10-K |
| T16 | Announced **2026-03-31** | **Marioff** (HI-FOG water mist; ≈660 employees; 70+ countries) | **Inflexion** | Inflexion (PE); seller Sentinel/Spectrum | **not disclosed** | **not disclosed** | not disclosed | **none** | **Disclosed** (fact only) | Sentinel PR via PR Newswire 2026-03-31 |
| T17 | Announced **2026-05-05**; closed **2026-07-09** | **Autronica Fire and Security** (Trondheim; ≈500 employees) | **MSA Safety** (NYSE: MSA) | none — listed strategic; seller Sentinel/Spectrum | **"approximately $555 million"** | **"approximately $160 million in sales"** in 2025 | not stated; **"adjusted EBITDA margin of approximately 20%"** | **≈17.3x** implied EV/2025 Adj. EBITDA; **≈3.47x** EV/Revenue (D1) | **Disclosed** (price, revenue, margin); **Estimated** (multiples) | MSA PR via PR Newswire 2026-05-05 and 2026-07-09; MSA 8-K 2026-05-05 EX-99.1 |
| T18 | Closed **2024-06-03** | **Carrier Global Access Solutions** (access control — adjacent, included for portfolio context) | **Honeywell** | none — listed strategic | **$4.95B** enterprise value; expected net proceeds ≈$4B | not disclosed | not disclosed | none obtainable | **Disclosed** (EV only) | Carrier 8-K 2024-06-03 EX-99 |

**T17 is the most important new price point in this file.** It is the only 2026 transaction anywhere in my record with a disclosed price, a disclosed revenue base and a disclosed margin, and therefore the only one where a post-2023-rate-environment EBITDA multiple can be derived at all. Its verbatim terms:
> "Transaction valued at approximately $555 million"
> "In 2025, the company recorded approximately $160 million in sales with an adjusted EBITDA margin of approximately 20%"

Every one of those three inputs carries the word "approximately", so the derived ≈17.3x is soft in both directions; see D1 for the sensitivity band.

**T17 is P5, not P1 or P3.** Autronica is a fire and gas *detection and alarm systems manufacturer* with a ≈20% product margin, sold to a listed safety-products strategic that itself trades at 15.80x. It is not a comp for a US sprinkler ITM contractor or for a monitoring book.

**No transaction in sub-vertical 3 as strictly defined — portable extinguisher, kitchen suppression, clean agent, special hazard *services* — carries a disclosed EV, revenue or multiple anywhere in this record.** That is a finding, not an omission. The named service consolidators active there (Pye-Barker, Marmic, AI Fire/Academy Fire, Summit) do not disclose deal values, and no carve-out of a pure special-hazard service business occurred in the window. Every disclosed sub-vertical-3 value in the table above is a *manufacturer*.

### 3.4 Ownership chains verified (no price attached)

| Platform | Chain | Basis | Source |
|---|---|---|---|
| **AI Fire** (op-cos Academy Fire, Impact Fire) | Founded 2009 as Impact Fire → **Caltius Equity Partners 2012** → **Audax 2017** → **TruArc Partners 2021** → **"acquired by Blackstone, Inc."** as of 2025 | **Disclosed** (company's own site) | aifire.com/about |
| **Pye-Barker Fire & Safety** | Current sponsor **Leonard Green & Partners**, listed as a current "Buyout" investment; described as "route-based fire protection services, including monitoring, inspection, maintenance and repair of fire detection and suppression products" | **Disclosed** | leonardgreen.com portfolio |
| **Spectrum Safety Solutions** | Carve-out from Carrier 2024 (Sentinel) → Marioff sold to Inflexion 2026-03 → Autronica sold to MSA 2026-07 → residual = **Det-Tronics + Fireye** | **Disclosed** | Sentinel PRs |
| **Jensen Hughes** (fire protection engineering / consulting — adjacent) | Backed by **Gryphon Investors**; acquired Professional Loss Control (2025-09-24), Safety Management Services (2025-12-09), HiLT (2026-07-06) | **Disclosed** (fact only, no values) | PR Newswire |
| **Summit Companies / SFP Holding, Inc.** | Parent of Summit Fire & Security LLC; 126 locations in 37 states after the PSI merger (2025-08-21) | **Disclosed** | PR Newswire 2025-08-27 |

---

## 4. Conflicts preserved (not averaged, not reconciled)

| Subject | Figure A | Figure B | Why they differ / status |
|---|---|---|---|
| Carrier CRF proceeds (T15) | Carrier press release 2024-12-02: **"approximately $2.2 billion"** net proceeds | Carrier FY2024 10-K: **"cash proceeds of $2.9 billion"**, "net gain on the sale of $1.4 billion" | Almost certainly gross cash vs. after-tax-and-fees net. Carrier does not reconcile them in either document. **Both stand.** |
| Carrier Industrial Fire close date (T14) | Carrier FY2024 10-K: sold **July 1, 2024** | Sentinel PR issued **July 2, 2024** announcing the acquisition | One-day announcement lag or genuine differing close convention. **Both stand.** |
| ADT Commercial value (T9) | Headline purchase price **"$1.6 billion"** | ADT's own reconciliation table uses **$1,613M**; net cash proceeds at close were **$1,563M** ("approximately $1.5 billion") | Headline rounding vs. reconciliation figure vs. net-of-adjustments proceeds. The 11.2x is struck on **$1,613M**. **All three stand.** A rounded figure is a different figure: $1,600M ÷ $144M = 11.11x, not 11.2x. |
| ADT Commercial EBITDA denominator (T9) | **$158M** Commercial Adjusted EBITDA, twelve months ended 2023-06-30 | **$144M** "Commercial Adjusted EBITDA including estimated corporate costs" after a **$(14)M** allocation | The disclosed 11.2x uses **$144M**. Using $158M gives 10.2x. **Both EBITDA figures stand; only one produces the disclosed multiple.** See the correction box in §3.2. |
| APi/Chubb multiple (T1) | APi's own deck: **"\~13.3x LTM Adjusted EBITDA including synergies"** | Arithmetic on APi's own disclosed inputs (2020A revenue ≈$2.2B × ≈9.6% margin) gives **≈14.7x** pre-synergy (D2) | Synergy-inclusive vs. synergy-exclusive denominator. **Both stand; do not average.** The gap implies ≈$22M of credited synergies (D2). |
| Large-commercial RMR multiple | **Barnes Associates (ESX 2025):** sellers above $500k RMR "averaged 46 times monthly revenue" | **CT Acquisitions (excluded source):** "Large commercial fire/burglar: 40 to 55x"; "Integrated fire/security: 45 to 55x" | The excluded source's range is *wider and higher* than the only methodologically attributed source. See §7. **Barnes stands alone as usable.** |

---

## 5. P3 — RMR multiples

### 5.1 The one attributed market series

**Michael Barnes, Founding Partner, Barnes Associates** — closing keynote, Electronic Security Expo (ESX) 2025, Cobb County, Georgia. Reported by **Paul Rothman, SecurityInfoWatch, published 2025-08-18**. **Basis: Press-derived.**

| Seller size band | Multiple | Verbatim |
|---|---|---|
| Under **$50,000 RMR** | **36x** | "averaging 36 times monthly revenue" |
| Above **$500,000 RMR** | **46x** | "averaged 46 times monthly revenue" |

Same keynote, same article, supporting figures (all Press-derived): US security alarm integrator market "a substantial $78 billion industry"; "6-7% growth in 2025"; national companies ≈48% share by RMR, regional ≈12%, local ≈23%; small players' share fell from roughly 50% to 35% over the past decade; price increases of "3-4% ... report minimal attrition impact"; video surveillance at "16%-plus growth".

**The size premium is 10 turns of RMR, or a 1.28x ratio** (46/36, D10). That is the cleanest scale-premium datum in the entire file, and it is *within* one population and one methodology, which is exactly why it is usable. It is also a **2025 observation** and should not be carried into 2026 without a note.

### 5.2 The one disclosed RMR transaction

**T10 — ADT LLC → Everon, LLC (GTCR), announced 2025-09-15.** From ADT's own 8-K, verbatim:
> "the purchase price to be paid in connection with the Transaction is approximately $55,000,000 in cash"
> "approximately 200,000 multifamily business customer units representing approximately $2.6 million of recurring monthly revenue"

Derived (D7): **≈21.15x RMR**; ≈$275 per unit; ≈$13.00 monthly RMR per unit.

**This is a different population from Barnes' 36x/46x and must not be read against it.** It is (a) a *bulk account/asset purchase*, not a company purchase — no branch infrastructure, no technicians, no backlog transferred; (b) *residential multifamily*, the lowest-RMR-per-unit and historically highest-attrition segment; (c) a *carve-out from a distressed-seller context*, ADT having already sold its commercial arm to the same buyer's sponsor two years earlier; and (d) sold with a non-compete running only "through October 2, 2028". Barnes' own framework in the same source distinguishes bulk-account transactions from company transactions. The 21.15x is a legitimate, fully disclosed RMR data point **for bulk residential multifamily accounts** and for nothing else.

### 5.3 RMR → EBITDA conversion (illustrative only)

An RMR multiple is a multiple of *monthly* recurring revenue. Dividing by 12 gives a multiple of annual recurring revenue; converting to an EBITDA multiple then requires a margin assumption **that no source in this file supplies**. The arithmetic is in D11 and is labelled **Estimated**. Its only legitimate use is to show *how wide the answer is*, not to produce one:

| RMR multiple | ×(1/12) → ARR multiple | At 30% EBITDA margin | At 40% | At 50% |
|---|---|---|---|---|
| 21.15x (T10, disclosed) | 1.76x | 5.9x | 4.4x | 3.5x |
| 36x (Barnes, <$50k RMR) | 3.00x | 10.0x | 7.5x | 6.0x |
| 46x (Barnes, >$500k RMR) | 3.83x | 12.8x | 9.6x | 7.7x |

**Do not lift a cell out of this table.** The margin column headings are unsourced assumptions I chose to span a plausible range; the conversion also silently assumes the target has no material non-recurring revenue, which is false for essentially every fire alarm business (install and ITM revenue sit outside RMR entirely). The honest conclusion is: **RMR multiples and EBITDA multiples are not interconvertible without a margin disclosure, and no source in this file discloses one.**

---

## 6. The platform-vs-tuck-in spread — what is actually verifiable

The brief carried in a spread of "≈2.8–3.3x" from a parallel stream, to be verified independently. **I could not reproduce it, and the figure is ambiguous between two readings.**

Verified endpoints, each with its date and population:

| Endpoint | Multiple | Date | Population |
|---|---|---|---|
| APi disclosed bolt-on ceiling | **<6x** weighted average | each of 2019–2024 | P2 |
| ADT Commercial → GTCR | **11.2x** (on $144M post-corporate-allocation EBITDA; **10.2x** on the un-allocated $158M) | 2023-08 | P1 (mixed security/fire carve-out) |
| APi → Chubb, incl. synergies | **13.3x** | 2021-07 `PRE-2023` | P1 (global carve-out) |
| APi → Chubb, pre-synergy (Estimated) | **≈14.7x** | 2021-07 `PRE-2023` | P1 |
| MSA → Autronica (Estimated) | **≈17.3x** | 2026-05 | P5 (manufacturer) |
| APG public trading | **21.47x** | 2026-07-28 | P4 |

Spreads against the `<6x` cap, computed both ways (D12) — **turns and ratio give materially different answers, which is why the carried-in "2.8–3.3x" cannot be checked as stated:**

| Against | Spread in **turns** | Spread as **ratio** |
|---|---|---|
| ADT Commercial 11.2x (2023) | **>5.2 turns** | **<1.87x** |
| Chubb 13.3x (2021) | **>7.3 turns** | **<2.22x** |
| Chubb ≈14.7x pre-synergy (2021) | **>8.7 turns** | **<2.45x** |
| Autronica ≈17.3x (2026) | **>11.3 turns** | **<2.88x** |
| APG trading 21.47x (2026) | **>15.5 turns** | **<3.58x** |

Every spread here is a **bound, not a point**, because `<6x` is a ceiling: the true bolt-on multiple is unknown and lower, so every spread is wider than shown. Under the *ratio* reading, "2.8–3.3x" is reachable only by comparing the bolt-on cap to a 2026 manufacturer multiple or to APG's own share price — not to either verified 2021/2023 platform trade. Under the *turns* reading it is far too small for any pairing. **Verdict: not verified, do not carry.**

**What the spread means for a buy-side thesis, stated without opinion on any named target:**

1. **The arbitrage is real and it is disclosed, not inferred.** APi has publicly committed, six years running, that its weighted-average bolt-on entry is under 6x, while the market has priced APi itself at 21.47x. That is the entire mechanic. It is one of the few roll-up arbitrages in US services where the buy-side leg is a company-disclosed number rather than a banker's assertion.

2. **The arbitrage is a floor claim, and floors get tested.** `<6x` is a cap on a *weighted* average, which a small number of very cheap deals can hold down while the marginal deal drifts up. APi's average bolt-on price per deal went $3.0M (2019) → $9.5M (2021) → $20.8M (2024) → ≈$16.6M (2025 Estimated). A 7x rise in average deal size over five years while the disclosed multiple cap never moves is the single thing to interrogate: either APi is buying materially larger EBITDA per deal at a constant multiple, or the mix that keeps the weighted average under 6x is thinning.

3. **The spread is not the return.** Multiple arbitrage is realised only on exit or on a re-rating, and both ends of this spread are moving in the same direction as rates. The 2021 Chubb print (13.3x) and the 2026 Autronica print (≈17.3x) are separated by the entire rate cycle — the later one is *higher*, not lower, which cuts against a simple "rates up, multiples down" narrative and is worth flagging rather than smoothing.

4. **The competitive risk sits at the bottom of the spread, not the top.** Pye-Barker executed **57 acquisitions in 2025** against APi's **14**. If two or more well-capitalised consolidators compete for the same sub-$5M-EBITDA sellers, the `<6x` floor is where the erosion shows up first, and neither firm's per-deal pricing is disclosed. There is no verified series anywhere in this file tracking bolt-on entry multiples over time. That absence is the study's biggest evidentiary hole (§ *What I could not verify*).

---

## 7. Excluded sources and the "orphan" pattern

Per the standing exclusion carried into this brief, **`ctacquisitions.com` and `dealseam.com` are excluded** and no figure in this file is sourced to either.

I encountered `ctacquisitions.com` unavoidably: it occupied **four of the top six** organic results for the Barnes/RMR-multiple query and further results for the APi bolt-on multiple query. I retrieved one page **solely to document the exclusion**, not to source anything:

- **Page:** `ctacquisitions.com/alarm-company-sale-or-acquisition/` · author given as **Christoph Totter, Managing Partner, CT Acquisitions** · published 2026-05-25, last modified 2026-07-14.
- **Claims made, verbatim:** residential monitoring **"35 to 50x"** RMR; small commercial **"32 to 45x"**; large commercial fire/burglar **"40 to 55x"**; wholesale monitoring **"20 to 30x"**; integrated fire/security **"45 to 55x"**; bulk account sales **"20 to 35x"**.
- **Sourcing:** none. No dataset, no sample size, no period, no transaction list, no citation. A footer line states "The sourcing methodology behind this discussion is covered in sponsor pipeline build" and hyperlinks to another page on the same domain — i.e. the methodology reference resolves back into the same site.

**The orphan pattern, stated precisely.** These ranges are not merely unsourced; they are **systematically above the only methodologically attributed series that exists**. Barnes' attributed 2025 averages are 36x (sub-$50k RMR) and 46x (>$500k RMR). CT Acquisitions' band for large commercial fire/burglar starts at 40x and runs to 55x — its *floor* is above Barnes' small-seller average and its *ceiling* is 9 turns above Barnes' large-seller average. A seller-facing lead-generation page that quotes only numbers flattering to sellers, cites nothing, and self-references for methodology is the archetype of a figure that will be repeated by third parties until it acquires the appearance of a market fact.

**Practical instruction for the rest of the study:** if any downstream stream encounters an RMR range whose upper bound is 50x or 55x, or an EBITDA range for fire services quoted without a named population, **trace it before using it**. If the trail ends at either excluded domain, drop the figure. I flag as a *candidate* orphan — unproven, because I could not retrieve the intermediate outlets — the Pye-Barker "17–20x" figure discussed below, which shares every diagnostic feature: no named methodology, no denominator, no confirming party.

---

## 8. Rate-environment stratification

Multiples in this file were struck across three distinct regimes and are labelled accordingly. They are **not one range**.

| Regime | Window | Verified prints |
|---|---|---|
| **Pre-tightening** | 2019 → 2022-02 | Chubb 13.3x incl. synergies (2021-07); APi bolt-ons at $3.0–9.5M average price (2019–2021) |
| **Tightening / trough** | 2022-03 → 2024 | ADT Commercial 11.2x (2023-08); Spectrum $1.425B and Kidde $3B, both with no denominator (2024); APi bolt-on average price peaks at $20.8M (2024) |
| **Post-peak-rates** | 2025 → 2026-07 | Autronica ≈17.3x (2026-05); ADT multifamily 21.15x RMR (2025-09); CertaSite 3.01x revenue (2026-02); Barnes 36x/46x RMR (2025) |

**The single most important cross-regime observation:** the two derivable EBITDA multiples on carve-outs, 11.2x in 2023 and ≈17.3x in 2026, move in the *opposite* direction to the rate cycle. I am not asserting a mechanism — the assets differ (mixed security services vs. detection manufacturing), the sellers differ (deleveraging public issuer vs. sponsor at natural exit), and n=2. But any model that assumes fire-safety multiples compressed with rates and have not recovered is contradicted by the only two comparable prints available.

---

## Derivations

Every number in this section is **Estimated** — it is my arithmetic on figures sourced above. Inputs carrying "approximately" in the original are marked ≈ and propagate their imprecision.

**D1 — MSA Safety / Autronica (T17)**
Inputs (all Disclosed, all "approximately"): price $555,000,000; 2025 sales $160,000,000; adjusted EBITDA margin 20%.
Implied 2025 Adj. EBITDA = $160,000,000 × 0.20 = **$32,000,000**.
EV/Adj. EBITDA = $555,000,000 ÷ $32,000,000 = **17.34x**.
EV/Revenue = $555,000,000 ÷ $160,000,000 = **3.469x**.
Sensitivity, because all three inputs are approximate: at an 18% margin the multiple is $555M ÷ $28.8M = 19.27x; at 22% it is $555M ÷ $35.2M = 15.77x. **Band ≈15.8x–19.3x on a ±2pt margin swing alone.**

**D2 — APi / Chubb pre-synergy (T1)** `PRE-2023`
Inputs (Disclosed): EV $3.1B; 2020A revenue ≈$2.2B; Adj. EBITDA margin ≈9.6%.
Implied 2020A Adj. EBITDA = $2,200M × 0.096 = **$211.2M**.
Pre-synergy EV/Adj. EBITDA = $3,100M ÷ $211.2M = **14.68x**.
Reconciliation to the disclosed 13.3x: $3,100M ÷ 13.3 = $233.1M implied synergy-inclusive EBITDA; $233.1M − $211.2M = **≈$21.9M of credited synergies**. APi did not disclose a synergy dollar target, so this is inference from two APi figures, not an APi statement.
EV/2020A revenue = $3,100M ÷ $2,200M = **1.409x**.
EV/annualised 9M-2021 revenue = $3,100M ÷ ($1,621.825M × 4/3 = $2,162.4M) = **1.434x**.

**D3 — APi / CertaSite (T2)**
Inputs (Disclosed): total consideration $271M; FY2025 revenue ≈$90M.
EV/Revenue = $271M ÷ $90M = **3.011x**.
Note the numerator is *total consideration transferred* per the 10-Q ($268M cash + $3M escrow), not an enterprise value struck on a debt-free basis; if CertaSite carried debt retired at close the true EV is higher and this ratio is a floor.

**D4 — The "$1 billion across three acquisitions" split**
Input (Disclosed, Q1-2026 call, Russell Becker): "In total, these 3 acquisitions represent an investment of more than $1 billion".
CertaSite is Disclosed at $271M (D3). Residual for Onyx-Fire + WTech = $1,000M − $271M = **≥$729M**.
Combined Onyx + WTech disclosed annual revenue = $190M + $175M = **$365M**.
Residual EV/Revenue = $729M ÷ $365M = **≥1.997x**.
Blended across all three = $1,000M ÷ ($90M + $190M + $175M = $455M) = **≥2.198x**.
**All three are floors**, because "more than $1 billion" is a floor. **Do not divide $1B by CertaSite's revenue** — that produces 11.1x revenue and is wrong by a factor of ≈3.7.

**D5 — Implied incremental Adj. EBITDA margins from APi guidance raises**
Onyx-Fire (8-K 2026-06-09): revenue guidance midpoint moved from ($8,475+$8,675)/2 = $8,575M to ($8,575+$8,775)/2 = $8,675M, a **+$100M** raise. Adj. EBITDA midpoint moved from ($1,150+$1,210)/2 = $1,180M to ($1,165+$1,225)/2 = $1,195M, a **+$15M** raise. Implied incremental margin = 15 ÷ 100 = **15.0%**.
WTech (8-K 2026-07-02): revenue midpoint $8,675M → ($8,660+$8,860)/2 = $8,760M, a **+$85M** raise. Adj. EBITDA midpoint $1,195M → ($1,177+$1,237)/2 = $1,207M, a **+$12M** raise. Implied incremental margin = 12 ÷ 85 = **14.1%**.
Stub-period sanity check: Onyx closed 2026-06-08, leaving ≈6.75 months = 0.5625 of the year; $190M × 0.5625 = $107M against a $100M raise. WTech closed 2026-07-01, leaving 6 months; $175M × 0.5 = $87.5M against an $85M raise. **Both consistent**, which supports reading the raises as acquisition contribution rather than organic revisions.
Extrapolated full-year Adj. EBITDA: Onyx $190M × 15.0% = **$28.5M**; WTech $175M × 14.1% = **$24.7M**; combined **$53.2M**.
Combined with D4: $729M ÷ $53.2M = **≥13.70x**.
**Caveats that make this the softest number in the file:** the guidance raises could bundle FX, organic revisions, purchase-accounting effects or expected synergies; the margins are incremental-to-guidance, not the targets' standalone margins; and $729M is a floor while $53.2M is a point estimate, so the quotient's direction of error is not symmetric. Use it as an order-of-magnitude check on whether APi's larger 2026 deals are priced like bolt-ons (they are not — 13.70x versus `<6x`) and for nothing more precise than that.

**D6 — ADT Commercial (T9)**
Inputs (all Disclosed, from ADT's own reconciliation table): purchase price / EV **$1,613M** (headline "$1.6 billion"); Commercial Adj. EBITDA **$158M** LTM to 2023-06-30; estimated corporate cost allocation **$(14)M**; Commercial Adj. EBITDA including estimated corporate costs **$144M**; Commercial revenue FY2022 $1,227M and H1-2023 $683M.
Reconciliation of the disclosed multiple: $158M − $14M = **$144M**; $1,613M ÷ $144M = **11.201x**, which is ADT's "approximately 11.2X". **The reconciliation closes exactly.**
Multiple on the *un-allocated* EBITDA, for anyone building comps off the headline pair: $1,613M ÷ $158M = **10.209x**; $1,600M ÷ $158M = **10.127x**. Neither is 11.2x.
EV/FY2022 revenue = $1,613M ÷ $1,227M = **1.315x**. (Period mismatch: the EBITDA multiple uses LTM to 2023-06-30, this uses FY2022.)
Annualised H1-2023 revenue = $683M × 2 = **$1,366M**. EV/annualised revenue = $1,613M ÷ $1,366M = **1.181x**.
Implied Adj. EBITDA margin **before** corporate allocation = $158M ÷ $1,366M = **11.57%**; **after** allocation = $144M ÷ $1,366M = **10.54%**. The second is the margin that the 11.2x was struck against and is the one to carry.

**D7 — ADT multifamily → Everon (T10)**
Inputs (Disclosed): price ≈$55,000,000; ≈200,000 units; ≈$2,600,000 recurring monthly revenue.
RMR multiple = $55,000,000 ÷ $2,600,000 = **21.15x**.
Price per unit = $55,000,000 ÷ 200,000 = **$275.00**.
RMR per unit = $2,600,000 ÷ 200,000 = **$13.00 per month**.
Implied annual recurring revenue = $2,600,000 × 12 = $31,200,000; EV/ARR = $55M ÷ $31.2M = **1.763x**.

**D8 — APi 2025 bolt-on spend and count**
Inputs (Disclosed): Q4-2025 call, "$580 million deployed across 33 bolt-on acquisitions from 2023 through 2025"; deck series 2023 = $98M / 7 deals and 2024 = $250M / 12 deals; Becker, "Fourteen acquisitions completed in 2025".
2025 spend = $580M − $98M − $250M = **$232M**. 2025 count = 33 − 7 − 12 = **14**, which matches the independently stated count and validates the deck's year-to-series mapping.

**D9 — APi bolt-on average price and implied EBITDA floor**
Average price per deal = aggregate ÷ count: 2019 $9M/3 = **$3.0M**; 2020 $42M/7 = **$6.0M**; 2021 $114M/12 = **$9.5M**; 2022 $5M/1 = **$5.0M**; 2023 $98M/7 = **$14.0M**; 2024 $250M/12 = **$20.8M**; 2025 $232M/14 = **$16.6M** (using D8).
Implied *minimum* aggregate EBITDA acquired, given a weighted-average multiple strictly below 6x, is aggregate price ÷ 6: 2019 **>$1.5M**; 2020 **>$7.0M**; 2021 **>$19.0M**; 2022 **>$0.8M**; 2023 **>$16.3M**; 2024 **>$41.7M**; 2025 **>$38.7M**.
Implied minimum average EBITDA per target: 2024 $41.7M ÷ 12 = **>$3.47M**; 2023 $16.3M ÷ 7 = **>$2.33M**; 2021 $19.0M ÷ 12 = **>$1.58M**. This is the arithmetic showing APi's typical bolt-on target moved from roughly $1.5M of EBITDA to roughly $3.5M of EBITDA between 2021 and 2024.

**D10 — Barnes RMR size premium**
46x ÷ 36x = **1.278x**; 46 − 36 = **10 turns of RMR**. Both within one source, one method, one year (2025).

**D11 — RMR → EBITDA conversion (illustrative, margin assumption unsourced)**
Annual-recurring-revenue multiple = RMR multiple ÷ 12. EBITDA multiple = (RMR multiple ÷ 12) ÷ assumed EBITDA margin on recurring revenue.
21.15x ÷ 12 = 1.763x ARR → ÷0.30 = **5.9x**; ÷0.40 = **4.4x**; ÷0.50 = **3.5x**.
36x ÷ 12 = 3.000x ARR → ÷0.30 = **10.0x**; ÷0.40 = **7.5x**; ÷0.50 = **6.0x**.
46x ÷ 12 = 3.833x ARR → ÷0.30 = **12.8x**; ÷0.40 = **9.6x**; ÷0.50 = **7.7x**.
**The 30/40/50% margins are my assumptions and are supported by no source in this file.** The conversion also assumes zero non-recurring revenue, which is wrong for any fire alarm business carrying install and ITM work. Presented only to show the width of the answer.

**D12 — Platform-vs-bolt-on spread, both readings**
Turns = platform multiple − 6.0 (a lower bound, since the bolt-on figure is a ceiling): 11.2 − 6.0 = **>5.2**; 13.3 − 6.0 = **>7.3**; 14.68 − 6.0 = **>8.68**; 17.34 − 6.0 = **>11.34**; 21.47 − 6.0 = **>15.47**.
Ratio = platform multiple ÷ 6.0 (an upper bound, since the denominator is a ceiling): 11.2/6 = **<1.87x**; 13.3/6 = **<2.22x**; 14.68/6 = **<2.45x**; 17.34/6 = **<2.88x**; 21.47/6 = **<3.58x**.

---

## Sources

**SEC filings (primary)**
- ADT Inc. 8-K filed 2025-09-15, `adt-20250912.htm`, Item 8.01 — multifamily sale to Everon: https://www.sec.gov/Archives/edgar/data/1703056/000170305625000145/adt-20250912.htm
- ADT Inc. 8-K filed 2023-10-02, EX-99.1 press release and EX-99.2 pro forma: https://www.sec.gov/Archives/edgar/data/1703056/000170305623000168/commercialpressrelease-ex9.htm · https://www.sec.gov/Archives/edgar/data/1703056/000170305623000168/commercialproforma-ex992.htm
- APi Group Corp 10-Q for Q1-2026, filed 2026-04-30, `apg-20260331.htm` — CertaSite consideration: https://www.sec.gov/Archives/edgar/data/1796209/000162828026028658/apg-20260331.htm
- APi Group Corp 8-K filed 2026-06-09, EX-99.1 — Onyx-Fire close: https://www.sec.gov/Archives/edgar/data/1796209/000162828026041818/apg-20260609xexx991.htm
- APi Group Corp 8-K filed 2026-07-02, EX-99.1 — WTech close: https://www.sec.gov/Archives/edgar/data/1796209/000162828026046698/apg-20260702xexx991.htm
- APi Group Corp 8-K filed 2021-07-30, EX-99.2 — Chubb acquisition investor deck: https://www.sec.gov/Archives/edgar/data/1796209/000119312521230264/d146150dex992.htm
- APi Group Corp 8-K filed 2022-01-03, EX-99.1 and EX-99.2 — Chubb close and Chubb carve-out financials: https://www.sec.gov/Archives/edgar/data/1796209/000119312522000650/d251823dex991.htm · https://www.sec.gov/Archives/edgar/data/1796209/000119312522000650/d251823dex992.htm
- Carrier Global Corp 8-K filed 2021-07-27, EX-99.1 — Chubb sale to APi: https://www.sec.gov/Archives/edgar/data/1783180/000095014221002448/eh210172127_ex9901.htm
- Carrier Global Corp 8-K filed 2024-06-03, EX-99 — Access Solutions close: https://www.sec.gov/Archives/edgar/data/1783180/000095014224001538/eh240490043_ex99.htm
- Carrier Global Corp 8-K filed 2024-12-02, EX-99.1 — CRF close to Lone Star: https://www.sec.gov/Archives/edgar/data/1783180/000095014224002865/eh240559253_ex9901.htm
- Carrier Global Corp 10-K FY2024, filed 2025-02-11, `carr-20241231.htm` and R120.htm (Divestitures — disposal groups detail): https://www.sec.gov/Archives/edgar/data/1783180/000178318025000008/carr-20241231.htm · https://www.sec.gov/Archives/edgar/data/1783180/000178318025000008/R120.htm
- MSA Safety Inc 8-K filed 2026-05-05, EX-99.1 — Autronica agreement: https://www.sec.gov/Archives/edgar/data/66570/000114036126019007/ny20072200x1_ex99-1.htm

**Issuer press releases and investor materials**
- ADT, "ADT Announces Sale of Commercial Business for $1.6 Billion", GlobeNewswire, 2023-08-08: https://www.globenewswire.com/news-release/2023/08/08/2720406/0/en/ADT-Announces-Sale-of-Commercial-Business-for-1-6-Billion.html
- ADT newsroom PDF of the same release, carrying the full non-GAAP reconciliation table ($158M → $(14)M → $144M → 11.2x on $1,613M), 2023-08-08: https://newsroom.adt.com/uploads/2023/08/ADT-announces-sale-of-commercial-business.pdf
- APi Group Investor Update, 2025-02-27, page 12: https://s201.q4cdn.com/155847588/files/doc_presentations/2025/Feb/27/v2/APG-Investor-Presentation-vFINAL-2-27-Update.pdf
- APi Group, "APi Group Announces Acquisition of CertaSite and Provides Full-Year 2025 Update", 2025-12-10: https://ir.apigroupcorp.com/News/press-releases/news-details/2025/APi-Group-Announces-Acquisition-of-CertaSite-and-Provides-Full-Year-2025-Update/default.aspx
- Sentinel Capital Partners, "Sentinel Capital Partners carves out industrial fire business from Carrier", 2024-07-02: https://www.sentinelpartners.com/sentinel-capital-partners-carves-out-industrial-fire-business-from-carrier/
- Sentinel Capital Partners, "Sentinel Capital Partners to Sell Spectrum Safety Solutions' Marioff Division", PR Newswire, 2026-03-31: https://www.prnewswire.com/news-releases/sentinel-capital-partners-to-sell-spectrum-safety-solutions-marioff-division-302729353.html
- Sentinel Capital Partners, "Sentinel Closes Sale of Spectrum Safety Solutions' Autronica Unit", PR Newswire, 2026-07-09: https://www.prnewswire.com/news-releases/sentinel-closes-sale-of-spectrum-safety-solutions-autronica-unit-302822309.html
- MSA Safety, "MSA Safety to Acquire Autronica Fire and Security...", PR Newswire, 2026-05-05: https://www.prnewswire.com/news-releases/msa-safety-to-acquire-autronica-fire-and-security-a-leading-provider-of-fire-and-gas-detection-and-alarm-systems-302762547.html
- MSA Safety, "MSA Safety Completes Acquisition of Autronica...", PR Newswire, 2026-07-09: https://www.prnewswire.com/news-releases/msa-safety-completes-acquisition-of-autronica-fire-and-security-a-leading-provider-of-fire-and-gas-detection-and-alarm-systems-302822266.html
- Everon, "Everon signs agreement to acquire multifamily business from ADT", PR Newswire, 2025-09-15: https://www.prnewswire.com/news-releases/everon-signs-agreement-to-acquire-multifamily-business-from-adt-302555882.html
- Summit Fire & Security, "Performance Systems Integration Completes Merger with Summit Fire & Security", PR Newswire, 2025-08-27: https://www.prnewswire.com/news-releases/performance-systems-integration-completes-merger-with-summit-fire--security-302540379.html
- Pye-Barker, "Pye-Barker Fire & Safety Accelerates Growth Strategy with 57 Acquisitions in 2025", PR Newswire, 2026-03-17: https://www.prnewswire.com/news-releases/pye-barker-fire--safety-accelerates-growth-strategy-with-57-acquisitions-in-2025-302716032.html
- Fortis Fire & Safety / LaMarco Systems, PR Newswire, 2026-03-18: https://www.prnewswire.com/news-releases/fortis-fire--safety-expands-into-midwest-with-acquisition-of-lamarco-systems-302717545.html
- DelCam Capital / Space Age Electronics / SprinkGuard, PR Newswire, 2026-06-16: https://www.prnewswire.com/news-releases/delcam-capital-expands-space-age-electronics-fire--life-safety-platform-with-acquisition-of-sprinkguard-302801769.html
- Gardiner / IntelliTech Fire & Security, PR Newswire, 2026-05-01: https://www.prnewswire.com/news-releases/gardiner-acquires-intellitech-fire--security-inc-302759929.html
- Jensen Hughes / HiLT, PR Newswire, 2026-07-06: https://www.prnewswire.com/news-releases/jensen-hughes-expands-southeast-asia-presence-with-acquisition-of-hilt-302815874.html
- Leonard Green & Partners portfolio page (Pye-Barker): https://www.leonardgreen.com/portfolio/
- AI Fire company history page: https://www.aifire.com/about/

**Trade press and transcripts**
- Paul Rothman, "Alarm Industry Players Overcoming Headwinds", SecurityInfoWatch, **2025-08-18** — Barnes Associates ESX 2025 keynote: https://www.securityinfowatch.com/integrators/article/55306317/alarm-industry-players-overcoming-headwinds
- Security Systems News, "ADT sells commercial business for $1.6 billion to private equity firm GTCR", 2023-08: https://www.securitysystemsnews.com/article/adt-announces-sale-of-commercial-business-for-1-6-billion-to-private-equity-firm-gtcr
- APi Group Q1-2026 earnings call transcript, The Motley Fool, 2026-06-02: https://www.fool.com/earnings/call-transcripts/2026/06/02/api-group-apg-q1-2026-earnings-transcript/
- APi Group Q4-2025 earnings call transcript, The Motley Fool, 2026-02-25: https://www.fool.com/earnings/call-transcripts/2026/02/25/api-group-apg-q4-2025-earnings-call-transcript/

**Market data**
- stockanalysis.com statistics pages for APG, JCI, FIX, EME, ADT, CARR, MSA, CNM and LON:HLMA, retrieved 2026-07-29, page-stated update dates 2026-06-07 to 2026-07-29, data attributed to S&P Global Market Intelligence. Example: https://stockanalysis.com/stocks/apg/statistics/

**Documented for exclusion only, not used as a source for any figure**
- ctacquisitions.com/alarm-company-sale-or-acquisition/ (Christoph Totter, CT Acquisitions; published 2026-05-25, modified 2026-07-14)

---

## What I could not verify

Listed as gaps, not as soft findings. **No figure below appears anywhere else in this file.**

**1. Pye-Barker "17–20x" and "$6B" — not verified, and not underwritable.**
What I *can* establish: Pye-Barker is a current Leonard Green & Partners buyout portfolio company; it completed 57 acquisitions in 2025; it has "9,000 team members across 47 states" and "over 250 locations"; it is ranked #4 on the SDM 100 and #849 on the Inc. 5000. **No sale has been announced** — there is no completion or agreement release on PR Newswire, where Pye-Barker issues all of its ≈25 most recent releases including every tuck-in.
What I could **not** establish: the existence, wording, date, author or attribution of the PE Hub report; whether "17–20x" was framed as an ask, a bid, an adviser's marketing range or a reported bid; what EBITDA denominator produced "$6B"; or whether a process was ever formally launched. `pehub.com` search results are JS-rendered with zero article data in the HTML, `sdmmag.com/search` is robots-disallowed, and the general web-search budget was exhausted. **The figure has no denominator, no named source, a company that declined comment, and no transaction. It cannot be used to price anything.** It also matches every diagnostic of the §7 orphan pattern, though I could not trace it to a specific origin and therefore do not assert that it is one.

**2. AI Fire ≈$1.1B and Encore Fire Protection ≈$1.8B — not verified.**
Both were carried in as Bloomberg "said to" reports citing unnamed sources with no revenue or EBITDA denominator. I confirmed AI Fire's *ownership chain* from the company's own site (Caltius 2012 → Audax 2017 → TruArc 2021 → **Blackstone 2025**) but found **no Blackstone press release** mentioning AI Fire, Academy Fire, Impact Fire or fire protection on blackstone.com/news/press, and no PR Newswire release under "AI Fire". `encorefp.com` is unreachable (robots.txt connection timeout), so I could confirm neither Encore's sponsor nor any transaction. **What is missing in both cases is the same thing: a denominator.** An enterprise value with no revenue and no EBITDA attached is not a multiple and cannot be converted into one.

**3. Convergint $850M continuation vehicle (2026-03-02) — not verified.**
`convergint.com/news` and `/newsroom` both 404; PR Newswire returns only third-party mentions of Convergint as a systems integrator, none about ownership; `gtcr.com/news` returned HTTP 429. I could confirm neither the $850M, the date, the sponsor(s) involved, nor the assertion that a continuation vehicle was "chosen over a sale". **Note the structural point that survives regardless:** a continuation vehicle is a *valuation event without a market clearing price*, priced by a lead secondary buyer and an NAV reference, not by a competitive auction. Even if verified, it would be a sixth population and not comparable to any trade sale in §3.

**4. Standalone revenue or EBITDA for Carrier's two fire divestitures — not obtainable.**
Carrier reports the divested units inside a single "Fire & Security Businesses" disposal group: net sales **$3,133M (2022)**, **$3,147M (2023)**, **$2,323M (2024, partial year)**. That group **also contains Access Solutions**, sold separately to Honeywell for $4.95B. Carrier does not break out Commercial & Residential Fire or Industrial Fire. **Therefore neither the $3B Kidde deal nor the $1.425B Spectrum deal can be converted into any multiple**, and I have not attempted one. Partial triangulation exists for Spectrum only: Autronica, one of its four brands, had ≈$160M of 2025 sales — but the other three brands' revenue is unknown and the 2024 EV cannot be set against 2025 revenue in any case.

**5. Any per-year numeric bolt-on multiple, from any consolidator.**
APi discloses a threshold (`<6x`), not a series. Pye-Barker, Summit, Marmic, AI Fire, VSC, Firetrol and Fortis disclose no deal values at all. **There is no verifiable time series of bolt-on entry multiples in US fire and life safety.** Given that the entire roll-up thesis rests on the durability of the bottom of the spread (§6.4), this is the single most consequential evidentiary gap in the study, and no amount of platform-deal reporting substitutes for it.

**6. Investment-bank sector reports with fire-specific multiples — none retrieved.**
I found no accessible Capstone Partners, Houlihan Lokey, Lincoln International, Harris Williams, William Blair, FMI or Baird publication carrying fire-and-life-safety multiples. Capstone's insights index surfaced only a generic "Middle Market M&A Valuations Index" (2026-04-15) whose own page 404'd; `hl.com/insights/industry-reports` 404'd. **Every banker range that a downstream stream may encounter is therefore unverified by this stream** and should be treated as Press-derived at best until the underlying publication is retrieved.

**7. CertaSite, Onyx-Fire and WTech EBITDA; individual prices for Onyx and WTech.**
APi disclosed CertaSite's consideration ($271M) and all three targets' revenue, but no target-level EBITDA and no individual price for Onyx or WTech. D5 infers margins from guidance movements; that inference is explicitly flagged as the softest arithmetic in the file.

**8. Any disclosed value in the extinguisher / kitchen suppression / clean agent *services* sub-vertical.**
Zero transactions in the 2019–2026 window carry a disclosed EV, revenue or multiple for a pure portable-extinguisher, kitchen-suppression or special-hazard **service** business. The disclosed values that exist in that sub-vertical are all **manufacturers** (Kidde Global Solutions, Spectrum, Autronica). Underwriting sub-vertical 3 on those prints would be a category error.

**9. 2019–2020 transactions.**
I found no fire and life safety transaction announced in 2019 or 2020 with a disclosed enterprise value or multiple. The earliest disclosed multiple in this record is APi/Chubb, announced 2021-07-26. The J2 Acquisition / APi Group 2019 combination was not verified in this stream and no figure for it is carried.

**10. Everon's own acquisition programme under GTCR** beyond the ADT multifamily transaction, and **GTCR's SimpliSafe terms** (2025-09-15) — neither retrieved.
