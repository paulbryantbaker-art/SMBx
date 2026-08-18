# Primary-Source Verification Pass — Home Services Master

**Date:** 2026-07-27
**Scope:** every load-bearing figure in `home-services-master-assessment.md`, checked against live primary sources.
**Rule applied:** zero hallucination. A figure survives only if a named source reports it. Conflicting sources keep BOTH values — never an invented midpoint. Rounded restatements count as different figures.

This document is the evidence trail for the corrections registered in the master's `## A.0.2` section. It is a source document, not a narrative — figures below are quoted as the source states them.

---

## 1. Dry powder

- Private-equity dry powder held a record of **$2.62 trillion**, as of H1 2024, covering private equity *and* venture capital. Published by S&P Global Market Intelligence, 2024-07-12; firm list dated 2024-07-01.
  https://www.spglobal.com/market-intelligence/en/news-insights/articles/2024/7/private-equity-dry-powder-growth-accelerated-in-h1-2024-82385822
- Bain & Company, Global Private Equity Report 2025 (2025-03-03): the buyout industry's stockpile of unspent capital **fell slightly from $1.3 trillion to $1.2 trillion**.
  https://www.bain.com/insights/outlook-is-a-recovery-starting-to-take-shape-global-private-equity-report-2025/
- Bain midyear 2025: global buyout dry powder reached **$1.2 trillion** as of mid-2025. All sectors.
  https://www.abfjournal.com/1-2t-in-pe-dry-powder-why-deployment-pressure-is-reshaping-middle-market-deal-terms/

**Finding:** no source segments dry powder to "essential services" or to home services. The claim "$1.2 trillion actively hunting essential-services assets" is the all-sector buyout total relabeled. NOT PUBLISHABLE.

---

## 2. U.S. Census — NAICS 238220 (plumbing, heating & air-conditioning contractors)

Table **EC2223BASIC** ("Construction: Summary Statistics for the U.S., States, and Selected Geographies: 2022") does publish receipts for construction NAICS codes; the Census API variable metadata confirms `RCPTOT` = "Sales, value of shipments, or revenue ($1,000)" is published in this group.
https://www.census.gov/data/tables/2022/econ/economic-census/naics-sector-23.html
https://api.census.gov/data/2022/ecnbasic/variables/RCPTOT.json

Values pulled from the Census data API for the 238220 row:

- **$267.1 billion** — receipts for construction work (`RCPCWRK`).
- **$297.6 billion** — total revenue (`RCPTOT`).

The $267.1B column was validated by exact parent-child summation at three levels:

| Level | Components | Sum |
|---|---|---|
| Building Equipment Contractors | Electrical **$230.78 billion** + Plumbing/HVAC **$267.13 billion** + Other Building Equipment **$39.78 billion** | **$537.68 billion** exactly |
| Specialty Trade Contractors | Building Equipment Contractors + siblings | **$1131.22 billion** exactly |
| Construction (sector total) | Specialty Trade + siblings | **$2239.54 billion** exactly |

Establishment and employment columns did not reproduce the claimed values: the 238220 row returned **112,088** on a firm-count basis and **1,690,333** on the employment column.

**Finding:** the "~$392B / 111,200 establishments / 1.21M workers" triple is NOT in this table. It appears verbatim on VantaInsights, a commercial aggregator citing "Census Bureau" with no table ID and no year.
https://vantainsights.com/reports/238220-plumbing-heating-air-conditioning

---

## 3. Trade market sizes

| Trade | Figure as the source states it | Source |
|---|---|---|
| HVAC contractors | **$158.4bn in 2025** (+1.5%); $159.4bn in 2026 | IBISWorld — https://www.ibisworld.com/united-states/market-size/heating-air-conditioning-contractors/1945/ |
| Plumbing | **$191.4bn in 2026** | IBISWorld "Plumbers in the US" — https://www.ibisworld.com/united-states/market-size/plumbers/1946 |
| Plumbing (conflicting) | **$121.5 billion** | ServiceTitan citing IBISWorld, page dated 2025-04-07 — https://www.servicetitan.com/blog/plumbing-industry-statistics |
| Roofing | **$92.5bn in 2026** | IBISWorld — https://www.ibisworld.com/united-states/market-size/roofing-contractors/198/ |
| Garage doors | **$16 billion**, reaching **$19.6 billion by 2030** | FMI, cited in PitchBook coverage — https://finance.yahoo.com/markets/stocks/articles/pe-hopes-garage-door-roll-193930270.html |
| Pest control | **$29.7 billion in 2026** | IBISWorld — https://www.ibisworld.com/united-states/market-size/pest-control/1495 |
| Pest control (conflicting) | **$13.416 billion** 2025 U.S. structural pest control service revenue, +6% from 2024's **$12.654 billion** | Specialty Consultants LLC via NPMA, 2026-04-01 — https://www.npmapestworld.org/your-business/latest-news/us-pest-control-industry-sustains-steady-growth-with-6-increase-in-2025/ |
| Electrical | **$347.5 billion in 2026** — but the report's own definition includes low-voltage, data cabling, telecom and fire/security | IBISWorld "Electricians" — https://www.ibisworld.com/united-states/industry/electricians/189/ |
| Electrical (alternative series) | **$237.59 billion (2023)** growing to **$256.65 billion (2029)** | Arizton, U.S. electrical contractors market — https://www.arizton.com/market-reports/us-electrical-contractors-market |

**Findings:**
- No source reports electrical at $265–280B for 2026. That figure is unsourced.
- NECA's 2024 Profile publishes no aggregate industry revenue.
- Pest control recurring share: the sourced figure is **85.4% of U.S. residential pest service revenue in 2025**, up from **85.2% in 2024** (Specialty Consultants/NPMA, same release as above). No source was found for the "74%" previously carried.

---

## 4. Platform transactions — all anonymous-source trade press

Every figure in this section was reported by trade press citing unnamed sources, with financials described as confidential and no party disclosing terms. Each requires "reportedly" framing with the outlet named.

**Apex Service Partners / Apollo.** Reuters, 2026-05-28: valuation of **"$10 billion, including debt"**; Apollo investment **$2 billion**; **"more than $3 billion in annual revenue"**; EBITDA **"over $500 million"**; **"more than 7,800 tradespeople."** Attributed to "a source familiar with the matter" and "another source familiar with the matter." Company and trade reports separately state **"more than 13,000"** people, 150+ locations, 75 brands, 46 states. Terms were not disclosed in the official May 28 2026 announcement; close expected Q4 2026. No source states a multiple.
https://www.sahmcapital.com/news/content/update-1-apex-service-sells-minority-stake-to-apollo-at-10-bln-valuation-source-says-2026-05-28
https://www.mdm.com/news/top-distributor-sectors/contractor/hvac-electrical-plumbing-service-platform-apex-nets-2b-investment-from-apollo/

**Champions Group / Blackstone.** Announced 2026-02-17: **~$2.5 billion** on **~$140 million** annualized EBITDA, **~18.5x**. Attributed to "people familiar with the matter, who requested anonymity as the financials are confidential." Valuation metrics not disclosed by either party. The BXPE vehicle is not named in any source found.
https://homepros.news/champions-group-strikes-2-5-billion-blackstone-deal/

**Sila Services / Goldman Sachs Alternatives.** 2024-11-06: **$1.7 billion** enterprise value, **~17x** on trailing EBITDA of "just under $100 million" — and **~20x excluding pending acquisitions**. Attributed to "a few people familiar with the matter." Official releases disclosed no terms.
https://homepros.news/goldman-sachs-private-equity-arm-to-acquire-sila-services/

**Redwood Services / Altas Partners.** 2025-05-08: **$1.1 billion**, **17x EBITDA**, TTM EBITDA **~$65 million**. Attributed to "people familiar with the matter, requesting anonymity as the financials are confidential." The official Businesswire release discloses no terms.
https://homepros.news/redwood-services-to-land-majority-investment-in-1-1-billion-deal/
https://www.businesswire.com/news/home/20250508241827/en/Redwood-Services-Announces-Strategic-Investment-from-Altas-Partners

**Guild Garage Group / Oak Hill.** Reuters, 2026-03-06 (Abigail Summerville): **"more than $800 million"**, per "four people familiar with the matter." Reuters gives no EBITDA and no multiple. PitchBook, 2026-04-17: "The transaction valued the Orlando business at **$800 million**" at a **16x EBITDA multiple, according to PitchBook data**.
https://www.tradingview.com/news/reuters.com,2026:newsml_L6N3ZT1HO:0-oak-hill-capital-to-acquire-guild-garage-group-in-800-million-plus-deal-sources-say/
https://finance.yahoo.com/markets/stocks/articles/pe-hopes-garage-door-roll-193930270.html

**Service Logic / Bain Capital + Mubadala.** Bloomberg, 2025-11-04: Bain lined up **$3.1 billion in debt financing** from private credit firms to acquire Service Logic, per "people with knowledge of the matter" — Blackstone leading the unitranche at 4.5pp over benchmark, with Apollo, Antares, HPS, KKR and Oak Hill Advisors also lending. **This is a loan package, not an enterprise value.** Deal closed 2025-12-16 with no terms disclosed by Bain, Mubadala, Leonard Green, Ropes & Gray or Harris Williams. Public operating metrics only: 140+ locations, 5,000+ technicians, **$2.2 billion+ 2024 revenue**. No source reports a $4.1 billion figure.
https://news.bloomberglaw.com/private-equity/bain-lines-up-3-1-billion-private-loan-for-service-logic-buy
https://www.baincapital.com/news/bain-capital-completes-acquisition-service-logic

---

## 5. Deal-flow share

- **Axial**, 2025-08-01: "In 2023, private equity firms accounted for just **8%** of HVAC deals **within Axial**; by 2024, that number rose to **23%**." This is Axial's own marketplace, not the market.
  https://www.axial.net/forum/hvac-private-equity/
- **Capstone Partners data cited by S&P Global:** private equity firms accounted for **39 of 77** HVAC sector M&A transactions tracked **through early June 2026**.
  https://www.thehardwirenews.com/pe-firms-took-39-of-77-hvac-m-a-deals-through-mid-2026-as-commercial-sector-consolidation-accelerates/
- **Capstone Partners**, 2026-07-17 update: **92 transactions YTD 2026, 47 to private equity.**
- **Capstone Partners**, HVAC Services Market Update, 2025-12-05: "**149 transactions** announced or completed, a **12.9%** increase year-over-year (YOY)" — stated as year-to-date at that publication date.
  https://www.capstonepartners.com/insights/report-hvac-services-market-update/

**Findings:** the "39 of 77 / H1 2025" attribution mis-dates the figure by a full year. Splicing Axial's 8% marketplace baseline to Capstone's tracked-universe percentage creates a trend no single dataset supports. The claim that broader industrial M&A "fell 24.6%" could not be found in any Capstone or S&P publication — Capstone's own page says only that Industrials M&A "has declined during the same period." It appears solely in a trade blog (HVAC Know It All, 2026-06-01).

---

## 6. Labor

- **BLS Occupational Outlook Handbook, HVAC mechanics and installers:** **425,200** jobs (2024); median pay **$59,810** per year (May 2024); about **40,100 openings** projected each year; employment +8% 2024–34.
  https://www.bls.gov/ooh/installation-maintenance-and-repair/heating-air-conditioning-and-refrigeration-mechanics-and-installers.htm
- **BLS OOH, plumbers, pipefitters and steamfitters:** **504,500** jobs in 2024; about **44,000 openings** each year; +4% 2024–34; median pay **$62,970** (May 2024).
  https://www.bls.gov/ooh/construction-and-extraction/plumbers-pipefitters-and-steamfitters.htm
- **JLL**, 2026-04-21: "by 2030, an estimated **2.1 million** skilled trades positions for electricians, HVAC technicians, plumbers, pipefitters, construction equipment operators, general maintenance workers and more could go unfilled." The accompanying **$1 trillion** loss figure is attributed by JLL to the **U.S. Department of Education**, not to JLL.
  https://www.jll.com/en-us/newsroom/critical-skilled-trades-shortage-threatens-economic-losses
- **LIXIL / John Dunham & Associates** with economist Michael Flaherty, published in the *Journal of Applied Business and Economics* Vol. 26(3) 2024; press release 2026-03-11: "projected to be approximately **550,000 unfilled plumbing positions by 2027**"; **$1.27 billion annually** in potential savings.
  https://www.globenewswire.com/news-release/2026/03/11/3254093/0/en/LIXIL-Releases-Study-on-the-Economic-Consequences-of-America-s-Skilled-Labor-Shortage.html

---

## 7. Pest-control public comparables

- **Rollins Inc.** FY2025 revenue **$3,761,050** thousand (= **$3.761 billion**); the press release rounds to "$3.8 billion, an increase of 11.0%." **26 acquisitions in 2025**; **$310 million** invested in acquisitions. 10-K filed 2026-02-12; earnings release 2026-02-11.
  https://www.prnewswire.com/news-releases/rollins-inc-reports-fourth-quarter-and-full-year-2025-financial-results-302685636.html
- **Rentokil Initial**, 2025 Preliminary Results, 2026-03-05: "Revenue was up 3.8 per cent to **$6.9 billion**"; North America "revenue grew 3.2 per cent to **$4.3 billion**."
  https://www.rentokil-initial.com/~/media/Files/R/Rentokil/documents/2025-prelims-transcript.pdf

**Finding:** the "~$6.8B" previously carried for Rentokil/Terminix is off. If the intent was the Terminix / North America business specifically, the figure is $4.3 billion.

---

## Summary — figures that must not ship

1. **"$1.2 trillion actively hunting essential services"** — no source; all-sector buyout dry powder relabeled.
2. **"$392B" for NAICS 238220** — not in the cited Census table; traces to a commercial aggregator.
3. **"74% of pest control revenue is recurring"** — no source; the real figure is 85.4% and applies only to residential service revenue.
4. **Electrical "$265–280B (2026)"** — no source.
5. **"Broader industrial M&A fell 24.6%"** — no source.
6. **Service Logic "$4.1B" enterprise value** — no source; and "$3.1B" is a debt package, not an EV.

Consequently a combined six-trade revenue total cannot be stated, because its electrical component has no defensible value.
