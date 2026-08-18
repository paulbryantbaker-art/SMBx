# 11 — Multiples Gap-Fill: Bank Reports, the Platform-vs-Tuck-In Spread, and Four Floating Figures

**Stream:** 11 · buy-side corporate-development market study, US fire & life safety
**Compiled:** 2026-07-29
**Purpose:** close the valuation gap left by stream 07, which reached zero investment-bank sector reports and could not reproduce the platform-vs-tuck-in spread
**Basis vocabulary:** `Disclosed` = stated by a party to the transaction or in an SEC filing · `Press-derived` = stated by a third party (outlet, data vendor, advisory firm) · `Estimated` = my arithmetic, shown in `## Derivations`

**Standing exclusion, carried forward and enforced:** no figure in this file is sourced to `ctacquisitions.com` or `dealseam.com`. Both appear below **only** in §5, which documents a laundering chain and is itself a finding.

---

## 0. What changed versus stream 07

| Question | Stream 07 status | Status now |
|---|---|---|
| Investment-bank / advisory sector reports reached | **0** | **13 publications from 8 houses** (§1) |
| Multiples by target-size tier | none | **GF Data full size-band table, N=5,669** (§1.2) |
| Tuck-in end of the spread | APi `<6x` threshold only, a ceiling | **GF Data 6.4x / 6.7x with sample sizes, plus APi `<6x` as a cross-check** (§2) |
| Platform end of the spread | 2 disclosed carve-out multiples | **5 anchors across 4 named populations** (§2) |
| Platform-vs-tuck-in spread | "not reproducible" | **Reproducible as a bounded cross-population construction** (§2.3) — see the caveat, it is not one population |
| Provenance of the carried-in "2.8–3.3x" | unknown | **Identified: it is 17x÷6x to 20x÷6x** (§2.4) |
| Pye-Barker "17–20x / $6B" | unverifiable | **Source, date, author, denominator and actual outcome all established** (§4.1) |
| AI Fire ≈$1.1B | unverifiable | **Date, outlet, headline confirmed; still no denominator** (§4.2) |
| Encore ≈$1.8B | unverifiable | **Date, outlet, buyer, seller and adviser confirmed; parties disclosed no terms** (§4.3) |
| Convergint $850M CV | unverifiable | **Confirmed from Leonard Green's own release** (§4.4) |
| Laundered figure identified | suspected | **Chain documented end to end, with two false attributions proven** (§5) |

**Retrieval note.** Direct `curl` remains blocked by egress policy (exit 56 on every host). Everything below was retrieved through the fetch tool. Two paths that stream 07 recorded as dead are in fact live and should be used by any later stream: **`efts.sec.gov/LATEST/search-index?q=…`** returns EDGAR full-text search results as structured output, and **`cdn.hl.com/pdf/<year>/<slug>.pdf`** serves Houlihan Lokey sector PDFs directly even though `hl.com/insights/industry-reports` 404s.

---

## 1. Priority 1 — investment-bank and advisory sector reports

### 1.1 What was reached, and the honest headline

**Thirteen publications from eight houses were retrieved in full.** The headline finding is uncomfortable and needs stating before the table:

> **No investment bank publishes fire-and-life-safety EBITDA multiples broken out by target size tier.** The one house that publishes a *sector-dedicated* fire & life safety report — Meridian Capital, twice a year — publishes **no multiples at all**. The one house that publishes multiples over a population that *contains* fire & life safety — Capstone Partners — does **not** break fire out from security. The size-tier data that exists (GF Data) is **industry-agnostic**. Every fire-specific multiple in circulation therefore comes from either a trade-press assertion or an unsourced aggregator, and §5 shows what happens to it in transit.

### 1.2 The reports, with populations

**Sample-size and population discipline: each row below measures a different thing. Nothing in this table may be averaged with anything else in it.**

| # | Publisher | Publication | Date | Multiple(s) | **Population measured** | Sample |
|---|---|---|---|---|---|---|
| **B1** | **GF Data** (an ACG company) | Middle-Market M&A ESOP Advisor Special Report | Q3 2025 (data through 2025-09-30) | **TEV/EBITDA by deal size band — see §1.3** | North American **private-equity-backed transactions, $10M–$500M enterprise value**, contributed blind and confidentially by **330+ NA PE firms** incl. funded and independent sponsors, family offices, mezzanine | **N=5,669** deals (size table); **N=4,531** (EBITDA table) |
| **B2** | **GF Data** | Q3 2025 quarterly summary | 2025-11-18 | **7.5x** Q3 2025; **6.9x** Q2 2025 | Same population as B1, quarterly average purchase-price multiple on **trailing-12-month adjusted EBITDA** | not stated in the summary |
| **B3** | **Capstone Partners** | Security Solutions M&A Update | **2026-02-02** | **11.8x EV/EBITDA**; **2.2x EV/Revenue** | Verbatim: *"Deal multiples have displayed relative health and resilience since 2021, averaging a robust EV/EBITDA multiple of 11.8x and EV/Revenue multiple of 2.2x over the five-year period."* Population = **Capstone's Security Solutions M&A universe, 2021→2026, five-year average**. Segments inside that universe: Physical Security, **Fire & Life Safety**, Uniformed Guard, Access Control, Metal Detection, Tactical Products, School Safety. **Capstone does not break Fire & Life Safety out separately.** Whether the average covers all deals or only those with disclosed multiples is **not stated** | not stated |
| **B4** | **Capstone Partners** | Middle Market M&A Valuations Index | **2026-04-15** | **9.8x** (2025) · **9.4x** (2024) · **9.0x** (2023) | US **middle-market M&A, all industries**, full-year average EV/EBITDA on **disclosed multiples** | not stated; 40.7% of 2025 disclosed multiples fell in the "low double-digit" range vs 31.6% in 2024 |
| **B5** | **Capstone Partners** | Middle Market M&A Valuations Index — forward survey | 2026-04-15 | **6.8x "typical"** · **9.8x "premium"**, expected 2026 | **Survey of investment bankers**, not transactions. Verbatim: *"Across all investment bankers surveyed, the average typical and premium M&A EBITDA multiples are expected to reach 6.8x and 9.8x, respectively."* | sample size **not disclosed** |
| **B6** | **Capstone Partners** | M&A Outlook 2026 | **2025-12-17** | **PE sponsors 12.0x · private strategic 9.8x · public strategic 8.6x** | **US middle market, Q3 2025, split by buyer type.** This is the only buyer-type split reached anywhere. Also: PE ≈45% of middle-market volume through Q3 2025; average sponsor transaction EV **$83.9M** in Q3 2025 (+23.5% QoQ) | not stated |
| **B7** | **Lincoln International** | Private Market Perspectives, Valuations & Opinions Group | **May 2026** (Q1 2026 data) | **11.7x EV/LTM Adjusted EBITDA** | **≈7,100 US private operating companies held by private funds and valued by Lincoln**, median company size **$60.6M LTM Adjusted EBITDA**. This is a **portfolio-mark** population, not a transaction population | ≈7,100 companies |
| **B8** | **Lincoln International** | same | May 2026 | **12.7x TEV/LTM EBITDA** YTD 2026; **12.9x** FY2025 | **New third-party M&A transactions** observed by Lincoln | **469 deals / $310.4B** (YTD 2026); 466 deals / $250.3B (FY2025) |
| **B9** | **Houlihan Lokey** | Engineering, Industrial & Infrastructure Services Market Update, Q2 2025 | data as of **2025-06-30** | LTM EV/EBITDA: **Engineering Services 17.0x · Industrial Services 15.7x · Infrastructure Services 13.0x**; EV/Revenue 1.6x / 1.4x / 0.8x | **Public company trading comps**, "a diversified set of 37 companies" across three subsectors. Median LTM EBITDA margins 8.2% / 6.5% / 5.6%. **No fire protection or life safety mention anywhere in the document** | 37 public companies |
| **B10** | **Houlihan Lokey** | same, Q4 2025 edition | market data as of **2025-12-31**; trading multiples as of **2026-02-02** | 2025A EV/EBITDA: **Engineering & Design 14.8x · Industrial Services 17.2x · Infrastructure Services 12.7x**; 2026E: 12.9x / 14.8x / 9.8x | Same public-comp construction as B9. Median 2025A EBITDA margins 10.7% / 9.0% / 11.2%. Sample size not restated. **No fire or life safety mention** | not stated |
| **B11** | **Meridian Capital** | **Fire & Life Safety Services M&A Market Update, Summer 2025** | Summer 2025 | **none — zero multiples published** | Sector-dedicated. Lists **60+ transactions Dec-2024→Jun-2025** with target, acquirer and description, and **no value on any of them**. Investor universe named (Pye-Barker, Summit, AI Fire, Encore, Agellus, RapidFire) with **no deal counts attributed** | 60+ deals, all valueless |
| **B12** | **Meridian Capital** | **Fire & Life Safety Services M&A Market Update, Winter 2025** | Winter 2025 | **none — zero multiples published** | Same. 50+ deals listed with no values. PE-backed acquirer counts shown but **names redacted** behind *"[Please contact Meridian Capital for additional information]"*, counts spanning 4 to 100+. **Public strategics named: APi Group, Cintas, FirstService, EMCOR, with counts of 20 to 55+** | 50+ deals, all valueless |
| **B13** | **Chesapeake Corporate Advisors** | AEC Industry Update, Q1 2026 | as of **2026-03-31** | EV/EBITDA mean/median: **Engineering & Professional Services 13.3x / 13.6x** (9 cos) · **Diversified Industrial Services 23.0x / 18.9x** (10 cos) · **Construction Services 17.8x / 16.0x** (12 cos) | **Public company trading comps**, 31-company set. Individual TTM: Quanta 35.3x, Comfort Systems 32.9x, MasTec 25.4x, Argan 49.0x. Fire protection appears only inside target *descriptions* (RGD Consulting, Rock Brook "MEP/FP"), **not as a valuation tier** | 31 public companies |
| **B14** | **Grant Thornton UK** | UK Fire and Security Sector M&A Review 2025 | 2025 (day not stated) | **none — zero multiples published** | **UK built-environment / facilities services**, 184 deals in 2025; fire & security = **23% of all deals**; **70% of fire & security deals involved PE-backed corporates** in 2025 vs 57% in 2024; hard/technical services = 80% of facilities-services M&A. Authors Usman B Malik, Retief Swart | 184 deals |
| **B15** | **Deloitte** | 2026 Engineering & Construction Industry Outlook | **2025-11-13** | **none** | No M&A multiples, no deal counts, no fire or life safety mention. Data-centre demand is the only quantified driver | — |

*(Capstone's 2026 Industrials M&A report, released 2026-05-06, was retrieved and carries no multiples in the free release; it is not tabulated.)*

### 1.3 GF Data — the size-tier table, reproduced in full

**This is the single most important table in this file.** It is the only reachable source that prices deals *by the size of the thing being bought*, which is the axis the entire roll-up thesis turns on. **Population, restated because it governs every use of these numbers:** North American transactions, **$10M–$500M total enterprise value**, buyers are **private equity firms, independent sponsors, family offices and mezzanine funds** (330+ contributors), data submitted blind and confidentially, **all industries pooled**. It is **not** fire-specific and must never be presented as such.

**TEV/EBITDA by deal size (TEV, $M):**

| TEV band | 2003–2020 `PRE-2023` | 2021 `PRE-2023` | 2022 `PRE-2023` | 2023 | 2024 | YTD 2025 | All-period | **N** |
|---|---|---|---|---|---|---|---|---|
| **$10–25M** | 5.8 | 6.1 | 6.4 | 5.9 | 6.4 | **6.4** | 5.9 | **2,084** |
| **$25–50M** | 6.5 | 7.2 | 7.1 | 6.9 | 6.8 | **6.8** | 6.7 | **1,671** |
| **$50–100M** | 7.5 | 8.3 | 8.5 | 8.1 | 8.1 | **8.3** | 7.7 | **1,156** |
| **$100–250M** | 8.3 | 9.3 | 9.2 | 9.5 | 8.5 | **10.3** | 8.6 | **654** |
| **$250–500M** | 9.1 | 10.9 | 9.7 | 10.2 | 9.8 | **8.5** | 9.7 | **104** |
| **Total** | 6.7 | 7.6 | 7.6 | 7.2 | 7.2 | **7.3** | 6.9 | **5,669** |

**TEV/EBITDA by target EBITDA size ($M):**

| EBITDA band | 2003–2020 `PRE-2023` | 2021 `PRE-2023` | 2022 `PRE-2023` | 2023 | 2024 | YTD 2025 | All-period | **N** |
|---|---|---|---|---|---|---|---|---|
| **$3–5M** | 6.1 | 7.1 | 7.0 | 6.7 | 6.5 | **6.7** | 6.4 | **1,503** |
| **$5–8M** | 6.6 | 7.2 | 7.5 | 7.3 | 7.2 | **7.4** | 6.8 | **1,312** |
| **$8–10M** | 6.8 | 8.2 | 8.5 | 6.9 | 6.8 | **6.8** | 7.0 | **478** |
| **>$10M** | 7.1 | 8.5 | 8.1 | 8.2 | 7.7 | **8.3** | 7.4 | **1,238** |
| **Total** | 6.6 | 7.7 | 7.6 | 7.3 | 7.1 | **7.3** | 6.9 | **4,531** |

**TEV/EBITDA by industry — the two rows a fire-services target could plausibly sit in:**

| Industry | 2023 | 2024 | YTD 2025 | All-period | **N** |
|---|---|---|---|---|---|
| **Business Services** | 7.2 | 7.2 | **7.5** | 7.0 | **1,333** |
| Distribution | 7.1 | 6.9 | **7.2** | 6.8 | 601 |
| Manufacturing | 6.5 | 7.0 | 6.7 | 6.4 | 2,197 |
| Healthcare Services | 9.2 | 7.7 | 8.5 | 7.7 | 489 |

**Reading this correctly.** GF Data has **no fire, construction-services or specialty-trade category**; a fire ITM contractor would be classified by the contributor, most plausibly into **Business Services**. The `$10–25M` TEV row and the `$3–5M` EBITDA row are the bands a fire-services tuck-in actually falls in, and both sit at **6.4x–6.7x in YTD 2025**. The size gradient inside one consistent methodology is **6.4x → 10.3x from the $10–25M band to the $100–250M band in YTD 2025**, or **6.4x → 8.5x** if the top band is used instead — note the $250–500M row **inverts** in YTD 2025 on only 104 lifetime observations and should not be leaned on.

---

## 2. Priority 2 — the platform-vs-tuck-in spread, rebuilt

### 2.1 The tuck-in end, now with three independent readings

| Anchor | Multiple | Date | **Population** | Basis |
|---|---|---|---|---|
| **GF Data, TEV $10–25M** | **6.4x** | YTD 2025 | NA PE-backed deals $10–25M TEV, all industries, N=2,084 all-period | Press-derived |
| **GF Data, EBITDA $3–5M** | **6.7x** | YTD 2025 | NA PE-backed deals with $3–5M target EBITDA, all industries, N=1,503 all-period | Press-derived |
| **GF Data, Business Services** | **7.5x** | YTD 2025 | NA PE-backed Business Services deals $10–500M TEV, N=1,333 all-period | Press-derived |
| **Capstone banker survey, "typical"** | **6.8x** | expected 2026 | Survey of investment bankers, US middle market, all industries | Press-derived |
| **APi Group, bolt-on programme** | **`<6x` weighted average** | **each year 2019–2024** | APi's own bolt-on acquisitions, excluding SKG, Chubb, Elevated and customer-account purchases. **A threshold, not a series** | **Disclosed** |

**The most consequential new observation in this file:** APi's disclosed bolt-on ceiling of **`<6x`** sits **below** the broad market's clearing price for identically sized transactions. GF Data's YTD-2025 average for the $10–25M TEV band is **6.4x** and for the $3–5M EBITDA band is **6.7x**; APi's 2025 programme averaged **$16.6M per deal** (D-A), squarely inside GF Data's $10–25M band. Stream 07 could only say the `<6x` was "a cap on a weighted average". It can now be said more usefully: **APi is buying its bolt-ons at least 0.4 to 0.7 turns cheaper than the average PE buyer pays for the same-sized business, and the gap is measured against a 2,084-observation benchmark rather than an assertion.** That is the roll-up's proprietary edge stated as a number, and it is also the number that competitive entry would erode first.

**Two cautions on that comparison, both material.** GF Data's population is *PE-sponsor buyers*, while APi is a *listed strategic*, and GF Data pools all industries while APi buys fire and life safety. The comparison is directionally sound and is the best available, but it is a cross-population comparison and is labelled as such.

### 2.2 The platform end, five anchors across four populations

| Anchor | Multiple | Date | **Population** | Basis |
|---|---|---|---|---|
| **ADT Commercial → GTCR** | **11.2x** (on $144M post-corporate-allocation EBITDA) | 2023-08 | Single disclosed carve-out, mixed commercial security + fire, levered seller deleveraging | **Disclosed** (stream 07) |
| **Capstone, Security Solutions universe** | **11.8x EV/EBITDA**, 2.2x EV/Revenue | five-year avg **2021→2026** | Capstone's whole security-solutions M&A universe, fire & life safety included but **not broken out** | Press-derived |
| **Capstone, PE-sponsor buyers** | **12.0x** | Q3 2025 | US middle-market deals with a **PE sponsor** as buyer, all industries | Press-derived |
| **MSA → Autronica** | **≈17.3x** | 2026-05 | Single deal, fire & gas **detection manufacturer**, ≈20% margin, Norway | Disclosed inputs, Estimated multiple (stream 07) |
| **PE Hub, fire safety platforms** | **17x–20x** | stated **2025-04-15**, covering "the past year" | Verbatim: *"PE-backed fire safety platforms have ignited strong valuations over the past year, with sizable mid- to large-cap deals trading at 17x to 20x EBITDA multiples."* Population = **PE-backed fire safety platforms, sizable mid- to large-cap, ≈Apr-2024→Apr-2025**. Named author Michael Schoeck. **No sample size, no deal list, no denominator disclosed** | Press-derived |

`PRE-2023` anchor available from stream 07 and excluded from the 2023+ construction below: APi/Chubb **13.3x incl. synergies**, 2021-07.

### 2.3 The spread, computed — and it is now reproducible

**It is reproducible as a bounded cross-population construction, not as a single-population series.** No source measures both ends. Every row below states which two populations it bridges.

| Platform anchor | Tuck-in anchor | **Spread, turns** | **Spread, ratio** | Populations bridged |
|---|---|---|---|---|
| ADT Commercial **11.2x** (2023) | GF Data $10–25M **6.4x** (YTD 2025) | **4.8** | **1.75x** | one disclosed US carve-out ÷ NA PE-backed LMM, all industries |
| Capstone security **11.8x** (2021–26) | GF Data $10–25M **6.4x** (YTD 2025) | **5.4** | **1.84x** | security-sector 5-yr avg ÷ NA PE-backed LMM, all industries |
| Capstone PE buyers **12.0x** (Q3-25) | GF Data $10–25M **6.4x** (YTD 2025) | **5.6** | **1.88x** | US mid-market PE buyers ÷ NA PE-backed LMM — **closest to one methodology** |
| MSA/Autronica **≈17.3x** (2026) | GF Data $3–5M **6.7x** (YTD 2025) | **10.6** | **2.58x** | one detection **manufacturer** ÷ NA PE-backed LMM |
| PE Hub **17x–20x** (2025-04) | GF Data $10–25M **6.4x** (YTD 2025) | **10.6 – 13.6** | **2.66x – 3.13x** | fire-safety large-cap assertion ÷ NA PE-backed LMM |
| PE Hub **17x–20x** (2025-04) | APi **`<6x`** (2019–24) | **>11.0 – >14.0** | **<2.83x – <3.33x** | fire-safety large-cap assertion ÷ **one company's disclosed ceiling** |

**The single best-supported statement the study can now make**, because it bridges the two most methodologically comparable populations and both ends carry a sample size or a disclosure:

> Across US mid-market M&A in 2025, a PE-sponsor buyer paid an average of **12.0x** (Capstone, Q3 2025), while transactions in the **$10–25M enterprise value** band — the band a fire-services tuck-in falls in — cleared at an average of **6.4x** (GF Data, YTD 2025, N=2,084 all-period). That is a spread of **5.6 turns, or 1.88x**, and it is an *all-industry* spread, not a fire-specific one. APi's disclosed fire-and-life-safety bolt-on programme runs **below** the small end of that spread, at a weighted average under **6x** in each of 2019–2024.

**The most aggressive defensible statement**, which must always carry its caveats, is the PE Hub row: **≈2.7x to 3.1x** against GF Data, or **under 2.83x to 3.33x** against APi's ceiling. Both PE Hub figures are a **named journalist's unsourced assertion** with no sample and no deal list, and the APi denominator is a **ceiling**, which makes every ratio against it an **upper bound**.

### 2.4 Provenance of the carried-in "2.8–3.3x" — solved

Stream 07 recorded a spread of "≈2.8–3.3x" carried in from a parallel stream and could not check it. **It is arithmetically identical to 17÷6 and 20÷6** (D-C): `17.0 ÷ 6.0 = 2.833` and `20.0 ÷ 6.0 = 3.333`. The figure is therefore **PE Hub's 17x–20x divided by APi's `<6x` bolt-on threshold**, presented as though it were a measured spread.

**Why that construction is not underwritable as stated.** It divides (a) an unsourced trade-press range for *large-cap fire safety platforms* by (b) *one listed company's disclosed ceiling* on its *own* bolt-on programme, which excludes SKG, Chubb, Elevated and customer-account purchases. The numerator has no sample size; the denominator is a bound, so the true ratio is **lower** than 2.83x–3.33x, not centred on it. It should be reported as **"<2.83x to <3.33x, cross-population, numerator unsourced"** or replaced with the 1.88x construction in §2.3.

### 2.5 New per-deal and per-programme observations from filings

| Ref | Observation | Figures | Basis | Source |
|---|---|---|---|---|
| **F1** | **APi Group FY2025 acquisitions**, all "individually immaterial" | **14 businesses**; total net consideration **$233M** (cash at closing $186M + escrow $17M + accrued $30M); goodwill **$126M**; intangibles **$86M**; acquired AR $25M, cash $15M, PP&E $3M, AP $(8)M, contract liabilities $(6)M | **Disclosed** | APi FY2025 10-K, `R55.htm` / `R13.htm` |
| **F2** | **APi Group FY2024 acquisitions**, reconciled | **9 businesses** individually immaterial at **$77M** total ($63M cash + $14M accrued), **plus three individually disclosed**: **A24 $33M**, **B24 $101M**, **C24 $33M**, **plus Elevated at $578M** (separately excluded from the bolt-on series) | **Disclosed** | same |
| **F3** | **Independent confirmation of stream 07's D8 estimate** | Stream 07 derived APi's 2025 bolt-on spend at **$232M** by subtraction from call commentary. The FY2025 10-K states **$233M** across **14** businesses. The derivation was correct to within $1M and the deal count matches exactly | **Disclosed** confirms **Estimated** | same |
| **F4** | **Reconciliation of APi's 2024 deck row to its 10-K** | Deck: **12 bolt-ons, $250M**. 10-K: 9 + 3 = **12 businesses**, $77M + $33M + $101M + $33M = **$244M** (D-B). A **$6M** gap remains, direction unexplained | **Disclosed** both sides | deck 2025-02-27 p.12; FY2025 10-K |
| **F5** | **Cintas discloses no per-deal fire-protection values** | *"Cash paid for acquisitions of businesses, net of cash acquired, was $232.9 million and $186.8 million for fiscal 2025 and fiscal 2024, respectively"*; *"The acquisitions in both fiscal 2025 and 2024 occurred in our Uniform Rental and Facility Services reportable operating segment, our First Aid and Safety Services reportable operating segment and our Fire Protection operating segment."* **No allocation to Fire Protection is given, and no deal count.** Fire Protection revenue is not separately reported — it sits inside "All Other" with Uniform Direct Sales: **$1,146.0M** FY2025, **$1,064.1M** FY2024, **$967.1M** FY2023 | **Disclosed** | Cintas FY2025 10-K, `ctas-20250531.htm` |
| **F6** | **Pye-Barker's actual 2025 liquidity event** | **Minority** stakes sold to **ADIA** and **GIC**, announced **2025-01-10**. *"LGP invested significant new capital into the Company while Altas retained the majority of its ownership interest."* **"Financial terms were not disclosed."** Advisers: Harris Williams (lead), BofA, Deutsche Bank, Goldman Sachs, Jefferies, Piper Sandler; Latham (LGP), Kirkland (Pye-Barker/Altas), Dechert (GIC), Cleary (ADIA) | **Disclosed** | Pye-Barker PR 2025-01-10; Kirkland & Ellis release |
| **F7** | **Convergint continuation vehicle** | **≈$850M in total commitments**, closed **2026-03-02**. Ares Management as sponsor of the vehicle, **led by Leonard Green & Partners**, with **Harvest Partners** and **Vintage Strategies at Goldman Sachs Alternatives**. Advisers **William Blair** and **Jefferies**; Kirkland and Weil legal. *"the Company has approximately quadrupled Adjusted EBITDA"* since Ares' 2018 investment; 40+ acquisitions; 11,000+ colleagues; 220+ technology centres | **Disclosed** | Leonard Green release 2026-03-02 |

**F5 is a negative finding worth carrying.** The brief expected Cintas to disclose fire-protection acquisitions at deal level. It does not: it discloses one consolidated acquisition cash number spanning three segments and buries Fire Protection revenue inside an "All Other" line with an unrelated business. **No US public filer discloses a per-deal fire-services tuck-in purchase price against a target EBITDA.** APi comes closest, with aggregate consideration and a deal count but no EBITDA (F1).

---

## 3. Priority 3 — public trading comparables, dated

All rows retrieved from `stockanalysis.com` statistics pages on **2026-07-29**, which attribute underlying data to S&P Global Market Intelligence. **Basis: Press-derived** — these are a third-party vendor's computations, not issuer-disclosed, and I did not reconcile the vendor's EBITDA definition to each issuer's own Adjusted EBITDA. Each row carries the vendor's own stated data date, which is **not** uniform.

| Ticker | Company | Market cap | Enterprise value | **EV/EBITDA** | **EV/Revenue** | EV/EBIT | **Vendor data date** | Relevance |
|---|---|---|---|---|---|---|---|---|
| **APG** | APi Group | $17.04B | $19.41B | **21.47** | **2.37** | 33.88 | 2026-07-28 | Pure-play life-safety services consolidator |
| **JCI** | Johnson Controls | $85.59B | $94.41B | **26.36** | **3.86** | 33.99 | 2026-07-29 | Fire (Tyco/Simplex/Ansul) + BMS |
| **FIX** | Comfort Systems USA | $53.06B | $55.61B | **27.74** | **4.95** | 30.07 | 2026-07-29 | Mechanical/electrical contractor incl. fire protection |
| **EME** | EMCOR Group | $31.37B | $30.97B | **15.52** | **1.74** | 17.22 | 2026-07-29 | Mechanical/electrical contractor |
| **ADT** | ADT Inc. | $5.36B | $12.94B | **7.62** | **2.52** | 39.75 | 2026-07-29 | Residential monitoring, post-Commercial divestiture |
| **CARR** | Carrier Global | $52.46B | $63.51B | **22.59** | **2.87** | 41.56 | 2026-07-28 | Former owner of both divested fire businesses |
| **MSA** | MSA Safety | $6.80B | $7.28B | **15.80** | **3.80** | 18.81 | **2026-07-24** | Buyer of Autronica; safety/detection products |
| **CTAS** | **Cintas** | **$87.44B** | **$89.71B** | **28.76** | **7.96** | 34.42 | 2026-07-29 | Uniform/facility services with a Fire Protection operating segment |
| **HLMA.L** | Halma plc (**GBP**) | £17.61B | £18.25B | **30.46** | **7.57** | 37.30 | **2026-06-07** | UK safety/detection products group |

**Observation-date conflicts, preserved rather than smoothed.** MSA's page carries a **2026-07-24** data date and Halma's a **2026-06-07** date, five days and seven-plus weeks stale respectively against the rest of the panel. Halma is **GBP-denominated and not currency-converted**. These are not one simultaneous observation and are not presented as one.

**Cross-check on stream 07.** APG, JCI, FIX, EME, ADT, CARR, MSA and HLMA were re-observed independently on 2026-07-29 and returned **identical** values to stream 07's panel, which validates that set. **CTAS is new to the panel** and is the highest EV/Revenue name on the board at 7.96x, on a business where fire protection is a minority operating segment inside a uniform-rental company — it prices Cintas's route density, not fire protection, and should not be read as a fire comp.

**What the panel does and does not anchor.** The spread between EME at **15.52x** and FIX at **27.74x** — two mechanical/electrical contractors — is 12.2 turns, so "listed contractor comps" remains not a single population. Houlihan Lokey's independently constructed Industrial Services comp set sits at **17.2x on 2025A** and **14.8x on 2026E** (B10), and Chesapeake's Construction Services set at **17.8x mean / 16.0x median** as of 2026-03-31 (B13); those three constructions of roughly the same idea span **14.8x to 27.7x**, which is the honest width of "what the listed comps say".

---

## 4. Priority 4 — the four floating figures, resolved

### 4.1 Pye-Barker "17–20x / $6B" — **source established, dated, and superseded by events. Recommend: retain only as a dated 2024 press report, never as a price.**

**What was actually reported, and by whom.** *SDM Magazine*, article ID 103337, headlined **"Pye-Barker Could Be Eyeing $6B Market Listing This Year, Report Says"**, by **Rodney Bosch**, published **2024-07-15**. Verbatim:

> "The joint PE sponsors could receive bids valuing the company at 17x to 20x its $350 million EBITDA, resulting in a potential deal value exceeding $6 billion, according to PE Hub"

and

> "When contacted by *SDM*, a Pye-Barker spokesperson declined to comment on the report."

**Five corrections to how this figure has been carried.**

1. **It is a 2024 figure, not a 2026 one.** The date is **2024-07-15**. Stream 07 carried it undated. Two full years of rate and deal-market movement separate it from anything current.
2. **It does have a denominator, and stream 07's note that it had none is wrong.** The stated denominator is **$350M of EBITDA**, attributed to PE Hub. That denominator is itself unsourced and unconfirmed by Pye-Barker.
3. **It was a prospective bid range, not a transacted price.** The wording is *"could receive bids valuing"* — a forecast of what a process might attract, reported before any process concluded.
4. **The headline and the body disagree with each other.** SDM's headline says **"Market Listing"**, implying an IPO; the body describes **bids from sponsors**. Both stand as printed; the disagreement is SDM's, not mine.
5. **No sale occurred, and what did occur is disclosed.** In **January 2025**, six months after the report, Pye-Barker instead sold **minority stakes** to **ADIA** and **GIC**, with LGP injecting new capital and **Altas Partners retaining majority ownership**, and **"Financial terms were not disclosed"** (F6). As of 2026-07-29 there is no announced sale or listing. A predicted $6B exit that resolved into an undisclosed-value minority recap is **not** evidence of a $6B valuation.

**Internal consistency check (D-D):** $350M × 17 = **$5.95B**; × 20 = **$7.0B**; and $6.0B ÷ $350M = **17.14x**. The three reported figures are arithmetically consistent with each other, which tells us the reporting was internally coherent — it tells us nothing about whether $350M or 17–20x was right.

### 4.2 AI Fire ≈$1.1B — **outlet, date and headline confirmed; still no denominator. Recommend: usable as a dated EV only, never as a multiple.**

Bloomberg, **2025-02-07**, headline **"Blackstone Said to Buy AI Fire From TruArc in $1.1 Billion Deal"**. Republished same day by *The Middle Market* (Cassidy Cavanagh) and by Bloomberg Law. Secondary coverage describes the figure as **"about $1.1 billion including debt"**. The primary Bloomberg article is paywalled and its unnamed sourcing could not be inspected. **No revenue and no EBITDA figure for AI Fire exists in any retrievable source**, so the $1.1B cannot be converted into any multiple, and I have not attempted one. Stream 07's independently verified ownership chain stands: Impact Fire 2009 → Caltius 2012 → Audax 2017 → TruArc 2021 → Blackstone 2025.

### 4.3 Encore Fire Protection ≈$1.8B — **buyer, seller, adviser and date confirmed; the parties themselves disclosed no terms. Recommend: usable as a dated press-derived EV only.**

Bloomberg, **2025-02-06**, headline **"Permira to Buy Encore Fire Protection for $1.8 Billion"** (a corrected version also ran under Bloomberg Government). The counterparties are now named and confirmed from non-Bloomberg sources: seller **Levine Leichtman Capital Partners (LLCP)**, buyer **Permira**, closing **March 2025**, with **Baird** as financial adviser to Encore. **Baird's own deal record states: "Terms of the transaction were not disclosed."** So the $1.8B is a Bloomberg report that **neither the buyer, the seller nor the adviser has confirmed**, and there is no revenue or EBITDA denominator anywhere. Separately, Capstone records that **Signet sold its fire alarm division to Encore Fire Protection** during the 2025 period, with no value.

### 4.4 Convergint $850M continuation vehicle — **CONFIRMED from the sponsor's own release. The date carried in was correct.**

**Leonard Green & Partners**, release dated **2026-03-02**: *"Ares Closes $850 Million Single-Asset Continuation Vehicle for Convergint Led by Leonard Green & Partners."* Approximately **$850 million in total commitments**. Participants: **Ares Management**, **Leonard Green & Partners** (lead), **Harvest Partners**, and **Vintage Strategies at Goldman Sachs Alternatives**. Financial advisers **William Blair** and **Jefferies**; legal **Kirkland & Ellis** and **Weil, Gotshal & Manges**. Also confirmed by Weil's own release and by Ares' distribution through Yahoo Finance, Barchart and the National Law Review.

**No valuation, EBITDA or multiple is disclosed.** The only performance figure given is *"the Company has approximately quadrupled Adjusted EBITDA"* since Ares' 2018 investment, with no base and no absolute value, so **nothing about Convergint's price can be derived**. Stream 07's structural caution stands and is reinforced: a continuation vehicle is a valuation event **without a competitive clearing price** — it is priced by a lead secondary buyer against an NAV reference — and it belongs to its own population. The $850M is the **size of the vehicle**, not the enterprise value of Convergint, and conflating the two would be a serious error.

---

## 5. A laundered figure, traced end to end — first-class finding

Stream 07 flagged the Pye-Barker "17–20x" as a *candidate* orphan but could not trace it. **It can now be traced, and the trace produces something worse than an orphan: two provably false attributions.**

### 5.1 The chain

| Layer | Who | Date | What it says | What it cites |
|---|---|---|---|---|
| **L0 — origin** | **PE Hub**, Rodney Bosch relaying it in *SDM* | **2024-07-15** | Pye-Barker bids at **"17x to 20x its $350 million EBITDA"** | unnamed sources; company declined comment |
| **L0b — origin, restated as a sector fact** | **PE Hub**, **Michael Schoeck** | **2025-04-15** | **"sizable mid- to large-cap deals trading at 17x to 20x EBITDA multiples"** | nothing — no sample, no deal list, no denominator |
| **L1 — the excluded domain** | **`ctacquisitions.com`**, "Private Equity Fire & Life Safety (2026)", CT Strategic Partners LLC, last modified **2026-07-11** | 2026 | **"17-20x"** for "scaled platforms"; also 4-5x project-only, 6-9x recurring-mix, 8-12x+ PE-ready, 30x-50x RMR | attributes the **17-20x** to **"Breakwater M&A Fire Alarm & Life Safety Valuation Multiples 2026"** and **"Capstone Partners Security Solutions M&A Update"** |
| **L2 — a real operator republishes it** | **`zeusfireandsecurity.com`**, "Fire & Security M&A Trends: Premium Valuations Explained", **2026-07-15** | 2026-07-15 | **"Scaled platforms with strong recurring revenue are transacting at 17x to 20x EBITDA"** and **"project-heavy businesses with limited inspection or monitoring revenue are typically valued between 3x and 5x EBITDA"** | cites **CT Acquisitions, "Private Equity in Fire & Life Safety and Security 2026"** |

### 5.2 The two false attributions, proven against the cited documents

I retrieved both documents CT Acquisitions names as the authority for its 17-20x. **Neither contains that figure, and both publish materially lower numbers.**

| CT Acquisitions attributes 17-20x to… | What that publication **actually** says | Gap |
|---|---|---|
| **Capstone Partners, Security Solutions M&A Update** | *"averaging a robust EV/EBITDA multiple of 11.8x and EV/Revenue multiple of 2.2x over the five-year period"* (2026-02-02) | Capstone's figure is **11.8x**. The attributed range starts **5.2 turns higher** and runs **8.2 turns higher** |
| **Breakwater M&A, Fire Alarm & Life Safety Valuation Multiples 2026** | Breakwater's **highest** tier — "Platform-ready (high RMR, low attrition, scalable ops)" — is **"7x to 10x"** (Morgan Tate, 2026-02-01) | Breakwater's **ceiling is 10x**. The attributed range starts **7 turns above Breakwater's own top of range** |

**Stated plainly: `ctacquisitions.com` presents a 17-20x range as if it were sourced to two named advisory publications, and neither publication contains it.** The figure's only genuine ancestor is **PE Hub**, which CT Acquisitions does list among its general sources but does not attach to this number.

### 5.3 Why this matters to a buy-side reader

**Zeus Fire and Security is not a content farm.** It is an operating, PE-backed fire and security consolidator, and its resource page is dated **2026-07-15**, two weeks before this file. A reader encountering "17x to 20x EBITDA" on an operator's own site would reasonably treat it as industry corroboration of the PE Hub number. **It is not corroboration. It is the same 2024 assertion, re-laundered through an excluded domain that attached false authority to it on the way through.** The apparent multiplicity of sources for 17-20x — PE Hub, CT Acquisitions, Zeus, and every aggregator that repeats them — is **one unsourced assertion counted four times**.

**Also carried into Zeus's page from the same excluded source is a "3x to 5x EBITDA" figure for project-heavy fire businesses.** It has the identical provenance and is likewise excluded. No figure from either layer L1 or L2 appears anywhere else in this file.

### 5.4 Two further sources examined and set aside — not excluded, but not usable

Neither of these is on the exclusion list and I make no claim that either is laundering anything. Both nonetheless fail the study's sourcing test and **no figure from either is used**.

- **Breakwater M&A**, "Fire Alarm & Life Safety Company Valuation Multiples 2026", Morgan Tate, **2026-02-01**. Presents a genuine-looking size-and-mix-tiered table running from **3x-4x** (under $1M revenue, minimal recurring) through **7x-10x** (platform-ready), plus **35x-45x MRR** for monitoring contracts and 2x-3.5x ARR for inspection contracts. It attributes these to "SDM Top 100 transaction data" and to the acquisition activity of Pye-Barker, APi Group and Sciens Building Solutions, but **presents no transaction list, no sample size and no hyperlink to any dataset.** Its 35x-45x MRR band sits just below the Barnes Associates attributed figures of **36x / 46x**, which is suggestive but not traceable.
- **Morgan Business Sales**, "Detailed 2026 Fire Protection Services M&A Overview", Dru Morgan, **2026-05-01**. Publishes an eight-row multiple grid by revenue mix and by EBITDA size (from **2.5x-4.0x** for sub-$800K EBITDA owner-operated up to **5.5x-8.0x** for predominantly-service and government/defence specialists). **It is an Australian document** — its market sizing cites IBISWorld Australia at **$4.2B for FY2025-26** across 2,888 businesses, and Grand View's Australia fire-suppression outlook. Its citations to Meridian Capital and Grant Thornton UK are real and correctly linked, but **the multiples themselves are the author's own framework with no dataset**, and **the market is not the United States.** Importing this grid into a US study would be a jurisdiction error on top of a sourcing one. It ranked **first** on a plain-language search for 2026 US fire-protection M&A multiples.

### 5.5 The search-surface finding

Across seven distinct queries for fire, life-safety and mid-market multiples, the organic result sets were dominated by unsourced valuation-aggregator pages: **`ctacquisitions.com` returned in every single query, frequently occupying four to seven of the top eight results**, alongside `dealseam.com`-shaped peers including `praxisrock.com`, `fisart.com`, `capitalpad.com`, `tradesindex.org`, `thedealsheet.co`, `quantpillar.com`, `dealflowagent.com`, `palmstone-capital.com`, `adastraequity.com` and `auxocapitaladvisors.com`. **The genuine bank publications — Capstone, Houlihan Lokey, Lincoln, GF Data, Meridian — were reachable only by naming the house in the query.** Any downstream stream that searches by topic rather than by publisher will retrieve almost exclusively unsourced material. **Search by publisher.**

---

## Derivations

Every figure here is **Estimated** — my arithmetic on the sourced inputs above.

**D-A — APi Group FY2025 bolt-on programme, per-deal**
Inputs (**Disclosed**, APi FY2025 10-K `R55.htm`): 14 businesses; total net consideration $233M.
Average consideration per deal = $233M ÷ 14 = **$16.64M**.
Implied **minimum** aggregate EBITDA acquired, given a weighted-average multiple strictly below 6.0x = $233M ÷ 6.0 = **>$38.83M**.
Implied **minimum** average EBITDA per target = $38.83M ÷ 14 = **>$2.77M**.
Placement against GF Data: $16.64M average consideration falls inside GF Data's **$10–25M TEV** band, and >$2.77M average target EBITDA falls just below the bottom of GF Data's **$3–5M EBITDA** band. Both bands averaged **6.4x** and **6.7x** respectively in YTD 2025. Because APi's figure is a ceiling, the true gap is **wider** than 0.4–0.7 turns.

**D-B — Reconciling APi's 2024 investor-deck row to its FY2025 10-K**
Deck (2025-02-27, p.12): 2024 = **12 bolt-ons, $250M**, excluding SKG, Chubb, Elevated and customer-account purchases.
10-K: 9 individually immaterial businesses at **$77M**, plus **A24 $33M**, **B24 $101M**, **C24 $33M**; Elevated shown separately at $578M.
Count: 9 + 3 = **12** — matches the deck exactly.
Value: $77M + $33M + $101M + $33M = **$244M** against the deck's **$250M**, a **$6M** difference.
**Both stand; I do not reconcile them.** Plausible causes include rounding in the deck, a fourth immaterial deal counted differently, or working-capital true-ups booked between the two documents. **The count matching exactly while the value differs by $6M is itself the useful signal:** the deck's deal counts are reliable and its dollar totals are approximate.

**D-C — Provenance arithmetic on the carried-in "2.8–3.3x"**
17.0 ÷ 6.0 = **2.8333**; 20.0 ÷ 6.0 = **3.3333**. Rounded, **2.8x–3.3x**.
This reproduces the carried-in figure to two significant figures from PE Hub's 17x–20x over APi's `<6x`. Because 6.0x is a **ceiling**, both quotients are **upper bounds** and the correct notation is **<2.83x** and **<3.33x**.

**D-D — Internal consistency of the Pye-Barker report**
$350M × 17 = **$5,950M**; $350M × 20 = **$7,000M**; the reported "exceeding $6 billion" sits inside that band.
$6,000M ÷ $350M = **17.14x**, i.e. the $6B headline corresponds to the **bottom** of the reported range, not its midpoint.
This confirms only that PE Hub's three numbers are mutually consistent. It confirms nothing about their accuracy, and **no transaction occurred at any of them** (§4.1).

**D-E — Spread table arithmetic (§2.3)**
Turns = platform multiple − tuck-in multiple. Ratio = platform multiple ÷ tuck-in multiple.
11.2 − 6.4 = **4.8**; 11.2 ÷ 6.4 = **1.750**.
11.8 − 6.4 = **5.4**; 11.8 ÷ 6.4 = **1.844**.
12.0 − 6.4 = **5.6**; 12.0 ÷ 6.4 = **1.875**.
17.34 − 6.7 = **10.64**; 17.34 ÷ 6.7 = **2.588**.
17.0 − 6.4 = **10.6** and 20.0 − 6.4 = **13.6**; 17.0 ÷ 6.4 = **2.656** and 20.0 ÷ 6.4 = **3.125**.
17.0 − 6.0 = **>11.0** and 20.0 − 6.0 = **>14.0**; ratios per D-C.
**Every row bridges two different populations. None is a within-population spread, because no source measures both ends.**

**D-F — GF Data size gradient within one methodology, YTD 2025**
$10–25M band 6.4x → $100–250M band 10.3x: difference **3.9 turns**, ratio **1.609x**.
$10–25M band 6.4x → $50–100M band 8.3x: difference **1.9 turns**, ratio **1.297x**.
$3–5M EBITDA 6.7x → >$10M EBITDA 8.3x: difference **1.6 turns**, ratio **1.239x**.
**This is the only size premium in the file measured inside a single dataset, single method and single period**, and it is far smaller than any cross-population spread in §2.3. That divergence is the most important caveat in this file: **when one methodology measures both ends, the size premium is ≈1.24x–1.61x, not 1.88x–3.33x.**

**D-G — Houlihan Lokey subsector movement, Q2 2025 → Q4 2025**
Engineering: LTM 17.0x (as of 2025-06-30) → 2025A 14.8x (as of 2026-02-02), **−2.2 turns**.
Industrial Services: LTM 15.7x → 2025A 17.2x, **+1.5 turns**.
Infrastructure Services: LTM 13.0x → 2025A 12.7x, **−0.3 turns**.
**Caution: the two editions label their periods differently** ("LTM June 2025" versus "2025A"), and sample composition is restated in one and not the other, so these differences mix a genuine price move with a definitional change. They are shown to demonstrate the instability of even a professionally maintained comp set, not to assert a trend.

**D-H — Cintas fire-protection acquisition allocation**
**Not derivable, and deliberately not attempted.** Cintas discloses $232.9M (FY2025) and $186.8M (FY2024) of acquisition cash spanning **three** segments — Uniform Rental and Facility Services, First Aid and Safety Services, and Fire Protection — with **no allocation and no deal count**. Any split would be invention. Similarly, Fire Protection revenue cannot be isolated from the **$1,146.0M** FY2025 "All Other" line because that line also contains Uniform Direct Sales.

---

## Sources

**Investment-bank and advisory sector reports**
- Capstone Partners, "Security Solutions M&A Update", 2026-02-02: https://www.capstonepartners.com/insights/article-security-ma-update/
- Capstone Partners, "Middle Market M&A Valuations Index", 2026-04-15: https://www.capstonepartners.com/insights/report-capstone-partners-middle-market-mergers-and-acquisitions-valuations-index/
- Capstone Partners valuations-index release via PR Newswire, 2026-04-15: https://www.prnewswire.com/news-releases/capstone-partners-reports-middle-market-ma-valuations-prove-resilient-despite-macroeconomic-disruption-as-confidence-builds-entering-2026-302743325.html
- Capstone Partners, "Merger and Acquisition Outlook 2026", 2025-12-17: https://www.capstonepartners.com/insights/merger-and-acquisition-outlook-2026/
- Capstone Partners 2026 Industrials M&A report release, 2026-05-06: https://www.stocktitan.net/news/HBAN/capstone-partners-reports-industrials-industry-undergoes-structural-wo1zkg0prbyl.html
- GF Data (an ACG company), "Middle-Market M&A ESOP Advisor Special Report", Q3 2025: https://gfdata.com/wp-content/uploads/Q3-25_GFData_ESOP_Report.pdf
- GF Data, "Q3 Reports: Middle-Market M&A Slows, Valuation Multiples Rise", 2025-11-18: https://gfdata.com/gf-data-report-2025-q3-middle-market-ma-slows/
- GF Data reports index: https://gfdata.com/about/reports/
- Lincoln International, "Private Market Perspectives: U.S. Edition", Valuations & Opinions Group, May 2026: https://www.lincolninternational.com/wp-content/uploads/Lincoln-VOG-Private-Market-Perspectives_Q1-2026_Final.pdf
- Houlihan Lokey, "Q2 2025 Engineering, Industrial, and Infrastructure Services Market Update": http://cdn.hl.com/pdf/2025/bus-engineering-q2-2025.pdf
- Houlihan Lokey, "Q4 2025 Engineering, Industrial, and Infrastructure Services Market Update": http://cdn.hl.com/pdf/2026/engineering-industrial-infrastructure-market-update-q4-2025.pdf
- Meridian Capital, "Fire & Life Safety Services M&A Market Update, Summer 2025": https://meridianib.com/wp-content/uploads/Fire-Life-Safety-Services-MA-Market-Update-Summer-2025_vWEBSITE.pdf
- Meridian Capital, "Fire & Life Safety Services M&A Market Update, Winter 2025": https://meridianib.com/wp-content/uploads/Fire-Life-Safety-Services-MA-Market-Update_vF.pdf
- Chesapeake Corporate Advisors, "Industry Update Q1 2026 — Architecture, Engineering & Construction": https://ccabalt.com/wp-content/uploads/2026/05/CCA_AEC_Market-Update_Q1-2026.pdf
- Grant Thornton UK, "UK fire and security sector M&A review 2025", Usman B Malik and Retief Swart: https://www.grantthornton.co.uk/insights/uk-fire-and-security-sector-ma-review-2025/
- Deloitte, "2026 Engineering and Construction Industry Outlook", 2025-11-13: https://www.deloitte.com/us/en/insights/industry/engineering-and-construction/engineering-and-construction-industry-outlook.html

**SEC filings (primary)**
- APi Group Corp FY2025 10-K, filed 2026-02-25, accession 0001628280-26-011620 — BUSINESS COMBINATIONS note and narrative details: https://www.sec.gov/Archives/edgar/data/1796209/000162828026011620/R13.htm · https://www.sec.gov/Archives/edgar/data/1796209/000162828026011620/R55.htm · filing summary: https://www.sec.gov/Archives/edgar/data/1796209/000162828026011620/FilingSummary.xml
- Cintas Corp FY2025 10-K, filed 2025-07-28, accession 0000723254-25-000017, `ctas-20250531.htm`: https://www.sec.gov/Archives/edgar/data/723254/000072325425000017/ctas-20250531.htm
- EDGAR full-text search endpoint used throughout: https://efts.sec.gov/LATEST/search-index

**Sponsor, issuer and adviser releases**
- Leonard Green & Partners, "Ares Closes $850 Million Single-Asset Continuation Vehicle for Convergint Led by Leonard Green & Partners", 2026-03-02: https://www.leonardgreen.com/ares-closes-850-million-single-asset-continuation-vehicle-for-convergint-led-by-leonard-green-partners/
- Weil, Gotshal & Manges, "Weil Advised Leonard Green & Partners in Closing of Ares' $850M Single-Asset Continuation Vehicle for Convergint Technologies": https://www.weil.com/articles/weil-advised-leonard-green-partners-in-closing-of-ares-850m-singleasset-continuation-vehicle
- Ares release redistributed, National Law Review: https://natlawreview.com/press-releases/ares-closes-850-million-single-asset-continuation-vehicle-convergint-led
- Pye-Barker Fire & Safety, "Announces Minority Investments from ADIA and GIC to Fuel New Growth", PR Newswire, 2025-01-10: https://www.prnewswire.com/news-releases/pye-barker-fire--safety-announces-minority-investments-from-adia-and-gic-to-fuel-new-growth-302347964.html
- Kirkland & Ellis, "Kirkland Advises Pye-Barker and Altas on Sale of Minority Stakes", January 2025: https://www.kirkland.com/news/press-release/2025/01/kirkland-advises-pye-barker-and-altas-on-sale-of-minority-stakes
- Robert W. Baird, transaction record — "Encore Is Acquired by Permira", March 2025, terms not disclosed: https://www.rwbaird.com/transactions/investment-banking/dealcard/6486/
- Levine Leichtman Capital Partners, "Levine Leichtman Capital Partners Sells Encore Fire Protection": https://www.llcp.com/levine-leichtman-capital-partners-sells-encore-fire-protection/ *(JavaScript-gated; content not retrievable)*

**Trade press**
- Rodney Bosch, "Pye-Barker Could Be Eyeing $6B Market Listing This Year, Report Says", SDM Magazine, **2024-07-15**: https://www.sdmmag.com/articles/103337-pye-barker-could-be-eyeing-6b-market-listing-this-year-report-says
- Michael Schoeck, "On the block: Three more fire safety providers expected to hit the market", PE Hub, **2025-04-15** *(paywalled beyond the lead)*: https://www.pehub.com/on-the-block-three-more-fire-safety-providers-expected-to-hit-the-market/
- Iris Dorbian, "Private equity finds recurring demand for fire safety: 8 notable deals", PE Hub, 2025-03-07 *(paywalled)*: https://www.pehub.com/private-equity-finds-recurring-demand-8-notable-deals-in-the-fire-safety-sector/
- Bloomberg, "Blackstone Said to Buy AI Fire From TruArc in $1.1 Billion Deal", **2025-02-07** *(paywalled)*: https://www.bloomberg.com/news/articles/2025-02-07/blackstone-said-to-buy-ai-fire-from-truarc-in-1-1-billion-deal
- Cassidy Cavanagh, "Blackstone Reportedly Purchases TruArc Partners-Backed AI Fire", The Middle Market, 2025-02-07 *(paywalled)*: https://www.themiddlemarket.com/latest-news/blackstone-reportedly-purchases-truarc-partners-backed-ai-fire
- Bloomberg, "Permira to Buy Encore Fire Protection for $1.8 Billion", **2025-02-06** *(paywalled)*: https://www.bloomberg.com/news/articles/2025-02-06/permira-said-to-buy-encore-fire-protection-in-1-8-billion-deal
- Bloomberg Government corrected version: https://news.bgov.com/private-equity/permira-said-to-buy-encore-fire-protection-in-1-8-billion-deal
- Paul Rothman, "ESX 2026: Texas-Sized RMR", SecurityInfoWatch, 2026-04-30 — event preview, contains **no** multiples: https://www.securityinfowatch.com/integrators/article/55373411/esx-2026-texas-sized-rmr

**Market data**
- stockanalysis.com statistics pages for APG, JCI, FIX, EME, ADT, CARR, MSA, CTAS and LON:HLMA, all retrieved **2026-07-29**; page-stated data dates 2026-06-07 to 2026-07-29; underlying data attributed to S&P Global Market Intelligence. Example: https://stockanalysis.com/stocks/ctas/statistics/

**Documented for exclusion or set-aside only — not used as a source for any figure in this file**
- `ctacquisitions.com/guides/private-equity-fire-life-safety-2026/` (CT Strategic Partners LLC; last modified 2026-07-11) — **excluded**, and the subject of §5
- `zeusfireandsecurity.com/resources/fire-and-security-mergers-and-acquisitions-trends` (2026-07-15) — **figures excluded** because their sole citation is the excluded domain
- Breakwater M&A, Morgan Tate, "Fire Alarm & Life Safety Company Valuation Multiples 2026", 2026-02-01 — **set aside**, no dataset or sample: https://www.breakwaterma.com/blog/fire-alarm-life-safety-company-valuation-multiples-2026
- Morgan Business Sales, Dru Morgan, "Detailed 2026 Fire Protection Services M&A Overview", 2026-05-01 — **set aside**, Australian market and no dataset: https://morganbusinesssales.com/2026-fire-protection-services-ma-overview/

---

## What I could not verify

Listed as gaps, not as soft findings. **No figure below appears anywhere else in this file.**

**1. A fire-and-life-safety-specific multiple by target size tier, from any bank. Does not exist in reachable literature.**
Thirteen publications from eight houses were retrieved. **Not one** breaks fire or life safety out by target size band. Meridian Capital, the only house publishing a sector-dedicated fire & life safety update, publishes **zero** multiples in either of its 2025 editions and lists 110+ transactions across the two with **no value on any of them**. Capstone publishes a security-wide 11.8x that includes fire & life safety but does not separate it. **The study should stop expecting this document to exist and should say so.** The GF Data table (§1.3) is the closest available substitute and is industry-agnostic.

**2. The sample size, deal list or denominator behind PE Hub's 17x–20x.**
Both PE Hub statements — the 2024 Pye-Barker report and the 2025 sector assertion — are paywalled beyond the lead paragraph. **The 2025-04-15 article's three named "fire safety providers expected to hit the market" could not be identified**, and PE Hub gives no sample size, deal list or methodology for the range in the visible text. This is the numerator of the widest spread in §2.3 and it rests on a paywalled, unsourced sentence.

**3. Any per-deal fire-services tuck-in price against a target EBITDA, from any filer.**
Cintas discloses one acquisition cash figure across three segments with no allocation and no deal count (F5). APi discloses aggregate consideration and deal counts but **no target EBITDA and no revenue contributed** (F1, F2). ADT, Carrier, JCI and MSA disclose only platform-scale transactions. **The tuck-in end of the spread still has no single observed transaction anywhere in US fire and life safety** — it has only a benchmark (GF Data), a threshold (APi `<6x`) and a survey (Capstone 6.8x). Stream 07 named this the study's biggest evidentiary hole; it is narrower now but **not closed**.

**4. Revenue or earnings contributed by APi's 2025 acquisitions.**
The FY2025 10-K narrative details page discloses consideration, goodwill and intangibles but **no revenue or net income contributed since acquisition and no pro forma figures** for the 14 businesses. Without a revenue line, the $233M cannot be converted into an EV/Revenue multiple for the bolt-on population.

**5. The $6M gap between APi's 2024 deck total ($250M) and its 10-K total ($244M).**
Both stand (D-B). Neither document reconciles to the other.

**6. Whether Capstone's 11.8x covers all security-sector deals or only those with disclosed multiples.**
Capstone does not state it. This materially affects the figure's meaning — a disclosed-multiple-only average is biased toward larger, better-advised transactions. **Treat 11.8x as an upper-leaning estimate of the sector average until Capstone's methodology note is obtained.**

**7. GF Data's 2026 figures.**
The most recent GF Data document retrieved carries data **through 2025-09-30**, with a February 2026 commentary noting year-end volume at a multi-year low. **The size-band table in §1.3 is a YTD-2025 observation and is labelled as such.** Any 2026 movement in the $10–25M band is unknown, and it is the single band the tuck-in thesis depends on.

**8. Barnes Associates' 2026 RMR figures.**
The ESX 2026 keynote was scheduled for **2026-06-04** and SecurityInfoWatch's preview (2026-04-30) contains no data. **No 2026 post-event write-up carrying updated RMR multiples was found.** The verified anchors therefore remain the **2025** figures: 36x under $50k RMR and 46x above $500k RMR (Barnes via Rothman, 2025-08-18), plus the disclosed ADT multifamily bulk-account transaction at 21.15x RMR, which is a different population. **These are RMR multiples — multiples of monthly recurring revenue — and are not comparable to any EBITDA multiple in this file.**

**9. Terms of Encore/Permira and AI Fire/Blackstone from any party.**
Baird states terms were not disclosed; LLCP's release is JavaScript-gated and unreadable; both Bloomberg articles are paywalled. **The $1.8B and $1.1B are single-outlet reports with unnamed sources and no denominators, uncorroborated by any counterparty**, and cannot be converted into multiples.

**10. Convergint's enterprise value.**
The $850M is the **size of the continuation vehicle**, not Convergint's EV. The only performance disclosure is "approximately quadrupled Adjusted EBITDA" since 2018 with no base. **No Convergint multiple is derivable and none is offered.**

**11. Conflicts preserved, not reconciled.**
- **Pye-Barker 2025 deal count:** Pye-Barker's own PR (2026-03-17) says **57 acquisitions in 2025**; Capstone's Security Solutions update (2026-02-02) says **41**. Different cut-off dates and different counting rules are the likely cause. **Both stand.**
- **Pye-Barker scale:** January 2025 PR gives "over 250 locations across 45 states, nearly 8,000 team members, **No. 8 on SDM 100**"; the March 2026 PR carried into stream 07 gives "9,000 team members across 47 states" and stream 07 recorded **#4 on SDM 100**. The growth is consistent with 57 acquisitions; the SDM 100 rank change is not verified in either direction. **Both stand.**
- **SDM's Pye-Barker headline versus its body:** headline says "$6B Market Listing", body describes sponsor bids. **Both stand as printed.**
