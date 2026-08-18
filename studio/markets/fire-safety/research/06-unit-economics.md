# 06 — UNIT ECONOMICS: the operating model a buyer would underwrite

**Stream:** Unit economics (revenue/technician, margin by tier, ITM-vs-install mix, recurring share, route density, contract length and churn, labour constraint, working capital and capex)
**Compiled:** 2026-07-29
**Method note:** `WebSearch` quota for this session was exhausted (200/200) part-way through; all evidence below was obtained by direct URL retrieval (SEC EDGAR `Archives` and `efts` full-text search, BLS OEWS year-archive pages, NICET candidate handbooks, company IR pages and vendor pricing pages). Bash outbound network was proxy-blocked entirely. Where a line of enquiry died because a URL could not be guessed without search, it is listed in `## What I could not verify` rather than filled with an estimate.

**Basis labels used throughout:** `Disclosed` (a named party, filing or standard says it) · `Press-derived` (a named publication reports it) · `Estimated` (I computed it — arithmetic in `## Derivations`).

**Cross-stream note:** anchors supplied by parallel streams were re-verified independently where possible. Results of that re-verification are flagged inline. Two supplied anchors could **not** be independently verified and are carried as `Unverified — parallel stream` (CertaSite $90M; ORR $169M).

---

# 0. THE ONE-PAGE MODEL (each input stated once, sourced, changeable)

| Input | Value | Population it measures | Basis |
|---|---|---|---|
| Revenue per employee, diversified life-safety roll-up | **$272,793** | APi Group, FY2025, 29,000 team members, global, all segments | Estimated (D1) |
| Revenue per employee, global fire/HVAC/security OEM+service | **$271,218** | Johnson Controls, FY2025 (FYE 2025-09-30), 87,000 employees worldwide | Estimated (D17) |
| Revenue per employee, route-based product/service | **$214,082** | Cintas, FY2025 (FYE 2025-05-31), 48,300 employee-partners | Estimated (D13) |
| Revenue per employee, alarm/monitoring | **$420,378** | ADT Inc., FY2025, 12,200 employees | Estimated (D8) |
| **Technicians as a share of headcount** | **25.4%** | ADT Inc., 3,100 of 12,200, 2025-12-31 | Estimated (D8) from Disclosed components |
| Segment earnings margin, Safety Services | **16.8%** (FY2025), 15.9% (FY2024) | APi Safety Services segment, $5,456M revenue | Disclosed |
| Operating margin, route-based fire+direct-sale | **16.72%** | Cintas "All Other" segment, $1,146.0M revenue, FY2025 | Estimated (D15) from Disclosed |
| Consolidated adj. EBITDA margin | **13.2%** (FY2025) | APi Group consolidated, $7,911M | Disclosed |
| ISM (inspection, service, monitoring) share of revenue | **54%** (FY2025) → **60%+** target 2028 | APi Group consolidated | 54% Press-derived; 60%+ Disclosed |
| Service vs product gross-margin differential | **+568 bps** FY2025 (+677 FY2024, +1,005 FY2023) | Johnson Controls consolidated | Estimated (D16) from Disclosed |
| Inspection pull-through | **$1 inspection → $3–4 service** | APi Group, management framing | Press-derived |
| Gross customer revenue attrition (monitoring) | **13.1%** TTM FY2025; 12.7% FY2024 | ADT Inc., 6.1M subscribers | Disclosed |
| Monitoring contract initial term | **2, 3 or 5 years**, auto-renew 30-day (resi) / annual (small business) | ADT Inc. | Disclosed |
| DSO (AR only) | **72.1 days**; **94.5 days** incl. contract assets | APi Group FY2025 | Estimated (D3) |
| Retentions receivable | **$187M** = 2.36% of revenue, 12.0% of AR; 25.7% not collectible within 1 year | APi Group at 2025-12-31 | Disclosed / Estimated (D5) |
| Capex intensity | **1.21%** of revenue; **$3,310** per team member | APi Group FY2025 ($96M capex) | Estimated (D6) |
| Median wage, Security & Fire Alarm Systems Installers (49-2098) | **$60,070/yr, $28.88/hr** | US national, BLS 2025 wage data, 85,900 employed (2024) | Disclosed (BLS via O*NET) |
| Median wage, Plumbers/Pipefitters/Steamfitters (47-2152, *includes sprinkler fitters*) | **$63,800/yr, $30.67/hr** | US national, BLS 2025 wage data, 504,500 employed (2024) | Disclosed (BLS via O*NET) |
| Minimum experience, NICET ITM Level III (water-based) | **5 years**, ≥3 yrs direct inspection/testing | NICET ITWBS candidate handbook | Disclosed |
| Inspection-reporting software | **$59 / $99 / $159 per technician per month** (annual billing), unlimited office users | ServiceTrade published price list | Disclosed |

---

# 1. REVENUE PER TECHNICIAN / PER FIELD EMPLOYEE

## 1.1 The denominator problem, stated once

**Total headcount is not technician headcount, and the only US life-safety filer that splits it says technicians are about a quarter of the payroll.**

> ADT Inc., FY2025 Form 10-K: *"As of December 31, 2025, we employed approximately 12,200 people, including approximately 1,600 direct field solution advisors; 3,100 installation and service technicians; 4,000 customer care professionals; and 700 phone sales representatives."*
> `Basis: Disclosed` — SEC 10-K filed 2026-03-02.

3,100 / 12,200 = **25.4%** technicians (D8). Field-facing (technicians + field solution advisors) = 4,700 = **38.5%**. Every "revenue per employee" figure below that uses a total-headcount denominator is therefore **not** revenue per technician, and is labelled as such. For an alarm/monitoring business the gap is extreme because the monitoring annuity is delivered by central-station and customer-care staff, not by trucks.

APi Group's 10-K does **not** break 29,000 team members into technicians; neither do Cintas (48,300), JCI (87,000) or Pye-Barker (9,000+). **No fire-protection contracting platform in this study discloses a technician count.**

## 1.2 Sub-vertical 1 — fire protection contracting (sprinkler/suppression install + ITM)

| Company | Revenue | Headcount | Revenue per employee | Basis |
|---|---|---|---|---|
| **APi Group Corp** consolidated FY2025 | **$7,911M** | **≈29,000 team members** | **$272,793** | Revenue and headcount Disclosed (10-K, 2026-02-25); ratio Estimated (D1) |
| APi **Safety Services** segment FY2025 | **$5,456M** (68.97% of consolidated) | not disclosed separately | **cannot be computed** | Revenue Disclosed; segment headcount not disclosed |
| **Johnson Controls International** FY2025 (FYE 2025-09-30) | **$23,596M** | **≈87,000** worldwide (≈31,000 US, ≈56,000 non-US; ≈18,000 under CBA/works council) | **$271,218** | Disclosed / Estimated (D17) |
| **Pye-Barker Fire & Safety** | not disclosed | **9,000+ team members, 47 states, 250+ locations, 200+ companies acquired** | **cannot be computed** | Headcount/footprint Disclosed (company press release 2026-05-27) |
| **ORR Protection** | **$169M** `Unverified — parallel stream` | not disclosed | — | Company site discloses **15 branches**, **"more than 8,000 sites"** protected annually, **"over 40 percent of the Fortune 100"** as customers |

**Underwriting read.** APi and JCI land within **$1,575 of each other** on revenue per employee ($272,793 vs $271,218) despite completely different business mixes, geographies and segment structures. That convergence is worth noting but should not be over-read: both are heavily weighted to installation/project work, both consolidate large non-US workforces with lower wages and lower revenue per head, and neither denominator is a technician count. **I would underwrite a US fire-protection contracting platform at a revenue-per-*field*-employee well above $272,793** — because the $272,793 denominator includes back-office, and because the US portion of APi's Safety Services revenue ($2,725M of $5,456M in FY2025) sits on a US-weighted cost base. I do not have the data to state the US-only figure and I am not inventing it.

**Pye-Barker sensitivity (not a revenue estimate).** 9,000 team members × the three observed revenue-per-employee anchors gives $1,927M (Cintas basis), $2,441M (JCI basis), $2,455M (APi basis) — see D19. This is a *sensitivity band on an assumption*, not a figure I would put in a model without a disclosed Pye-Barker revenue number. **No Pye-Barker revenue figure is asserted in this document.**

## 1.3 Sub-vertical 2 — alarm, detection and monitoring

| Metric | Value | Basis |
|---|---|---|
| ADT FY2025 total revenue | **$5,128,607 thousand** | Disclosed (10-K R52) |
| — Monitoring and related services | **$4,354,087k** (84.9% of revenue) | Disclosed |
| — of which recurring monthly revenue | **$4,216,374k** | Disclosed |
| — Security installation, product and other | **$774,520k** | Disclosed |
| — of which installation revenue | **$416,107k** | Disclosed |
| — of which amortisation of deferred subscriber acquisition revenue | **$358,413k** | Disclosed |
| Revenue per **total** employee | **$420,378** | Estimated (D8) |
| **Installation/product revenue per installation-and-service technician** | **$249,845** | Estimated (D8) — this is the only defensible per-technician figure in the alarm sub-vertical, because monitoring revenue is not technician-produced |

**This is the single most important line in the section.** In monitoring, revenue per technician is a *misleading* metric: 84.9% of ADT's revenue is produced by a central station and a billing system, not by a truck. Underwrite the alarm sub-vertical on RMR, attrition and revenue payback (§6), not on technician productivity. Underwrite fire protection contracting on technician productivity, because there is no annuity that runs without a technician.

## 1.4 Sub-vertical 3 — extinguisher, kitchen and special hazard (route-based)

**Cintas Corporation is the only public filer that separately discloses a US fire-protection route business.**

| Cintas FY2025 (FYE 2025-05-31) | Value | Basis |
|---|---|---|
| **Fire Protection Services revenue** | **$817,463 thousand** (7.9% of total revenue) | **Disclosed** — 10-K revenue disaggregation (R49) |
| Fire Protection Services FY2024 | $728,610k (7.6%) | Disclosed |
| Fire Protection Services FY2023 | $627,747k (7.1%) | Disclosed |
| FY2025 growth / FY2024 growth / 2-yr CAGR | **+12.19% / +16.07% / +14.11%** | Estimated (D14) |
| Total employee-partners | **≈48,300** (≈900 union-represented) | Disclosed |
| **Local delivery routes** | **≈12,100** | Disclosed |
| Operational facilities / distribution centres | **478 / 12** | Disclosed |
| Revenue per route (all segments) | **$854,560 per route per year** | Estimated (D12) |
| Employee-partners per route | **3.99** | Estimated (D12) |

Cintas does **not** split routes by segment, so $854,560 per route is a *company-wide* figure dominated by uniform rental, not a fire-protection route figure. It is nonetheless the only disclosed revenue-per-route number in the adjacent route-services universe and is the right order-of-magnitude prior for a mature, high-density route business.

---

# 2. EBITDA MARGIN BY SCALE TIER AND SUB-VERTICAL

## 2.1 Tier A — public roll-up, consolidated

| Company | Metric | FY2025 | FY2024 | Basis |
|---|---|---|---|---|
| **APi Group** | Adjusted EBITDA / margin | **$1,041M / 13.2%** | $893M / 12.7% | Disclosed (press release 2026-02-25); +50 bps |
| APi Group | Adjusted free cash flow conversion | 80% of adj. EBITDA | — | Disclosed |
| APi Group | Net leverage | 1.6x | — | Disclosed |
| **Cintas** | Uniform Rental operating margin | **23.49%** | — | Estimated (D15) from Disclosed segment table |
| Cintas | First Aid & Safety operating margin | **24.20%** | — | Estimated (D15) |

## 2.2 Tier B — segment / platform level

| Segment | Revenue | Segment earnings | Margin | Basis |
|---|---|---|---|---|
| **APi Safety Services FY2025** | **$5,456M** | **$916M** | **16.79%** | Disclosed (margin stated as 16.8%, +90 bps) |
| APi Safety Services FY2024 | $4,797M | $765M | 15.95% (stated 15.9%) | Disclosed |
| APi Safety Services adj. gross margin | — | — | **37.3%** FY2025 vs 36.4% FY2024 | Disclosed |
| APi Specialty Services FY2025 | $2,460M | $264M | 10.7% (−70 bps) | Disclosed |
| APi Specialty Services adj. gross margin | — | — | 18.9% vs 19.7% | Disclosed |
| **Cintas "All Other"** (Fire Protection Services **+** Uniform Direct Sale) FY2025 | **$1,146.0M** | Gross profit $542.4M; operating income **$191.6M** | **GM 47.33% / OM 16.72%** | Estimated (D15) from Disclosed |
| Cintas "All Other" FY2024 | $1,064.1M | $170.0M | OM 15.97% | Estimated (D15) |
| Cintas "All Other" FY2023 | $967.1M | $143.2M | OM 14.81% | Estimated (D15) |

**Two independent scale operators put a route/branch-based fire-and-safety business at an operating or segment margin of roughly 16.7%–16.8% in FY2025.** APi Safety Services segment earnings margin 16.79%; Cintas All Other operating margin 16.72%. These are *different* measures (segment earnings vs segment operating income) on *different* populations (a $5.46B global fire/security/elevator segment vs a $1.15B US route business of which fire is 71.33%), and their near-identity is coincidence, not corroboration. But it does mean a buyer arguing that a scaled US fire platform clears the mid-teens at the segment line has two named public data points, not zero.

**The 16.8% must not travel down-market.** It is a segment figure on a **$5,456M** business inside a **$7,911M** filer with a 1.6x-levered balance sheet, centralised procurement, a captive insurance function and no owner compensation add-back. It is not what a $6M sprinkler contractor earns.

## 2.3 Tier C — the small independent. What I actually have, and what I refuse to invent

**I could not find a survey-based or association-based EBITDA benchmark for small US fire-protection contractors.** AFSA (>1,000 member companies), NFSA, NAFED and CFMA were all checked; none publishes an EBITDA benchmark on a publicly retrievable page. See `## What I could not verify`.

What I can give instead is a **hard, government-sourced cost-structure ceiling** for the container industry that fire-sprinkler contracting sits inside, from the 2022 Economic Census (`Basis: Disclosed` for the components, `Estimated` for the ratios, D26). Population: **114,427 US employer establishments in NAICS 238220** (Plumbing, Heating and Air-Conditioning Contractors, which is where fire-sprinkler installation contractors are classified) — of which fire sprinkler work is a small minority (parallel stream 01 puts fire sprinkler at ≈4% of 238220 receipts).

| 2022 Economic Census, NAICS 238220, US employer establishments | $ thousand | % of total receipts |
|---|---|---|
| Total receipts (`RCPTOT`) | 297,608,835 | 100.00% |
| Annual payroll (`PAYANN`) | 80,351,785 | **27.00%** |
| Cost of materials, parts, supplies (`CSTMPRT`) | 93,671,679 | **31.47%** |
| Payments to subcontractors (`RCPCWRK` − `RCPNCW`) | 21,205,813 | **7.13%** |
| **Residual before all non-payroll SG&A, rent, insurance, fleet running cost, bad debt, D&A and owner distributions** | 102,379,558 | **34.40%** |
| Value added (`VALADD`) less annual payroll | 95,566,027 | **32.11%** |

> **This 32–34% band is NOT EBITDA and must never be quoted as EBITDA.** It excludes every non-payroll operating cost a contractor actually bears — facilities rent, general liability and auto insurance, fuel and fleet maintenance, software, licensing and bond costs, sales and marketing, professional fees, and bad debt. It is a **hard upper bound**: true small-contractor EBITDA sits materially below it. Its only underwriting use is to falsify claims — a broker asserting a 40% EBITDA margin for a sprinkler contractor is asserting something the Census cost structure for the whole trade cannot support.

Two further Census facts relevant to the small end (`Basis: Disclosed`, computed ratios `Estimated`, D26):
- **Construction-worker payroll per Q1 construction worker: $66,225. "Other employee" (office/supervisory) payroll per Q1 other employee: $75,164.** Office headcount is *more* expensive per head than field headcount in 238220 — which is why back-office consolidation is the first synergy a roll-up reaches for, and why per-branch licensing rules (§7.4) that block it are economically material.
- Establishment size distribution (from parallel stream 01, 2022 Economic Census `EC2223LOCCONS`): **74.16% of entire-year 238220 establishments have fewer than 10 employees; 1.58% have 100 or more.** The acquirable population is overwhelmingly sub-10-employee.

---

# 3. ITM VS INSTALL MIX, AND THE MARGIN DIFFERENTIAL

## 3.1 Disclosed mix

| Company | Metric | Value | Basis |
|---|---|---|---|
| **APi Group** | Inspection, Service & Monitoring share of total net revenues, FY2025 | **54%** | **Press-derived** — Investing.com summary of APi's Q4 2025 slide deck, published 2026-02-25 |
| APi Group | 2028 target: *"60%+ of net revenues from inspection, service and monitoring"* | **60%+** | **Disclosed** — APi IR press release, 2025-05-21 |
| APi Group | Other 2028 targets: *"$10+ billion in net revenues"*, *"16%+ adjusted EBITDA margin"*, *"$3.0+ billion in cumulative adjusted free cash flow through 2028"* | — | Disclosed, same release |
| **Johnson Controls** | *"In fiscal 2025, products and systems accounted for approximately 68% of sales from continuing operations and services accounted for 32% of sales from continuing operations."* | **68 / 32** | **Disclosed** — JCI FY2025 10-K, filed 2025-11-14 |
| **ADT Inc.** | Monitoring and related services share of revenue FY2025 | **84.9%** | Estimated (D9) from Disclosed revenue lines |
| **Cintas** | Fire Protection Services as % of total revenue FY2025 | **7.9%** | Disclosed |

**The 54% could not be confirmed from an APi primary document.** I retrieved APi's FY2025 10-K (Item 1) and the Q4 2025 earnings release exhibit in full and neither states a percentage. APi's 10-K states the concept without a number: *"Inspection, service, and monitoring revenue is less cyclical and reasonably recurring due to the consistent renewal rates and deep customer relationships"* and *"Our go-to-market strategy in life safety is inspection-first, because we estimate that every dollar sold can lead to subsequent service work"* and *"In most cases, our inspection work is required by statutory or insurance obligations."* (`Basis: Disclosed`, 10-K filed 2026-02-25.) **I would underwrite on the 60%+ target as a Disclosed management commitment and treat the 54% as Press-derived**, because it comes from a secondary summary of a slide deck I could not retrieve, and because the gap between them (D28: **$1,728M of ISM revenue to add by 2028** on the $10B revenue target) is the whole strategic thesis and deserves a primary source before it is modelled.

## 3.2 The margin differential — hard, disclosed, from a named filer

**Johnson Controls splits net sales and cost of sales between "Products and systems" and "Services" on the face of its income statement.** This is the cleanest publicly disclosed install-versus-service gross-margin differential available in the fire/security/building-systems universe (`Basis: Disclosed` for all inputs, `Estimated` for the margins, D16). Population: JCI consolidated, global, HVAC + fire + security + controls — **not** a pure fire-protection contractor.

| JCI fiscal year | Products & systems net sales / COS / GM% | Services net sales / COS / GM% | **Differential** | Service share of sales |
|---|---|---|---|---|
| **FY2025** | $16,124M / $10,543M / **34.61%** | $7,472M / $4,461M / **40.30%** | **+568 bps** | 31.7% |
| FY2024 | $15,967M / $10,677M / **33.13%** | $6,985M / $4,198M / **39.90%** | **+677 bps** | 30.4% |
| FY2023 | $15,789M / $10,736M / **32.00%** | $6,542M / $3,791M / **42.05%** | **+1,005 bps** | 29.3% |

**Note the direction of travel: the differential has compressed from 1,005 bps to 568 bps in two years**, because product/system gross margin rose 261 bps while service gross margin *fell* 175 bps. A buyer paying a service-mix premium should ask whether the differential they are underwriting is the FY2023 differential or the FY2025 one. **I would underwrite on the FY2025 568 bps** as the current-cycle number, and treat 1,005 bps as a cyclical peak achieved when product margins were depressed — not as a structural constant.

**Corroborating direction, different measure:** APi Safety Services (ISM-heavy) adjusted gross margin **37.3%** vs APi Specialty Services (project-heavy infrastructure/utility/specialty contracting) adjusted gross margin **18.9%** in FY2025 — a **1,840 bps** spread. `Basis: Disclosed`. That spread is *not* an ITM-vs-install differential (it is a different-businesses differential) and should not be used as one, but it establishes that the service-weighted segment carries roughly twice the gross margin of the project-weighted segment inside the same filer.

## 3.3 Why ITM drives value — the pull-through ratio

> *"For each $1 in inspection service they earn, they generate $3-4 in service revenue."*
> `Basis: Press-derived` — Speedwell Research, "APi Group: 2Q25 Business Update", published 2025-08-01, describing APi's model.

Same source: *"Inspection revenues grew double digits for [the] 20th straight quarter"* as of Q2 2025 (`Basis: Press-derived`). And: APi Q2 2025 adjusted EBITDA margin 13.7%; GAAP gross margin 31.4% (down 50 bps YoY); record **"$4bn+"** backlog; **6 acquisitions completed in Q2 2025**; stated M&A programme of **"$250mn a year in bolt-on M&A at mid-single digit EBITDA multiples"**; leverage 2.2x at Q2 2025.

**ServiceTrade's own benchmark corroborates the pull-through mechanism with a different metric:** *"For top performers, 19.5% of all work orders were pull-through in nature."* `Basis: Disclosed` (ServiceTrade Fire and Life Safety Industry Benchmark Report 2024, page published 2024-10-29). Population: ServiceTrade's commercial-contractor customer base; **sample size not disclosed on the public page.** Same source: *"Top performers grew YoY revenue by 33.2%"*; *"Top performers completed 85.6% of jobs on time"*; *"Top performers invoice customers within 1.6 days"*; and a whole-population observation that *"YoY, commercial contractors are billing 20% slower."*

> **Conflict worth preserving.** ServiceTrade's "top performers invoice within 1.6 days" sits against its own whole-population finding that contractors are "billing 20% slower" year over year. Both are from the same page. The 1.6-day figure is a *top-decile* figure and must not be used as an industry DSO input; the APi disclosed 72.1-day DSO (D3) is the figure to underwrite (§8).

## 3.4 Why install is structurally different

From APi's FY2025 10-K revenue note (`Basis: Disclosed`, R60/R62):
- Typical contract period **"less than 6 months"**, maximum **"5 years"**.
- Payment terms: minimum **7 days**, standard **30 days**, maximum **90 days**.
- Aggregate transaction price allocated to unsatisfied performance obligations: **$3,605M** at 2025-12-31, of which **74%** is expected to be recognised in the next 12 months.
- Contract assets **$484M**; contract liabilities **$694M**; **retentions receivable $187M** (2024: $160M), of which **$48M** may not be collected within one year.

Contract liabilities exceeding contract assets ($694M vs $484M) means APi is, in aggregate, **billing ahead of cost** — a favourable working-capital position that a smaller install-heavy contractor without the same customer mix will not replicate. Retainage of 12.0% of AR with a quarter of it beyond one year (D5) is the install-side working-capital drag in its purest disclosed form.

---

# 4. RECURRING SHARE — AND WHAT "RECURRING" ACTUALLY MEANS

## 4.1 The denominator conflict in the RMR-to-revenue ratio

The parallel stream established a ladder: ADT 98.9% → Everon 32.1% → Pye-Barker 30.2% → ORR 8.9% → Security 101 6.1%. **Independent re-derivation from ADT's own filings changes ADT's number materially depending on the denominator** (D9):

| ADT annualised-RMR-to-revenue | Value | Denominator used |
|---|---|---|
| $359M RMR × 12 = **$4,308M** ÷ **$4,354.087M** monitoring and related services revenue | **98.94%** | Monitoring revenue only |
| $4,308M ÷ **$5,128.607M** total revenue | **84.00%** | Total revenue |

`Basis: Estimated` (D9); components Disclosed — RMR $359M at 2025-12-31 (flat YoY) from ADT's Q4 2025 earnings release, revenue lines from the 10-K revenue note.

**Both are true; they measure different things.** The 98.9% figure says "essentially all of ADT's monitoring revenue is contracted RMR." The 84.0% figure says "84% of everything ADT bills is contracted RMR." **I would underwrite on the total-revenue denominator (84.0%)** when comparing across companies, because for every other company in the ladder the denominator is total revenue — comparing ADT-on-monitoring-revenue against Pye-Barker-on-total-revenue overstates ADT's recurring share by ≈1,500 bps and flatters the top of the ladder. The ladder should be rebuilt on a single denominator before it is used in a valuation bridge.

## 4.2 What is contractually committed versus habitually renewed

This is the substantive question the ratio hides. The evidence:

| Claim | Evidence | Basis |
|---|---|---|
| **Monitoring RMR is contractually committed and term-dated.** | ADT 10-K: *"The standard contract terms are two, three, or five years, with automatic renewals for successive 30-day periods for residential security customers and annual periods for small business customers, unless canceled by either party."* | Disclosed |
| **Monitoring RMR is measurable, so its decay is measurable.** | ADT discloses TTM gross customer revenue attrition of **13.1%** (FY2025) and **12.7%** (FY2024) and a **revenue payback of 2.3 years** (FY2024: 2.2 years). | Disclosed |
| **ITM revenue is code-compelled but the contract behind it may be nothing more than an annual PO.** | APi 10-K: *"In most cases, our inspection work is required by statutory or insurance obligations"* — the *obligation* is on the building owner, not on the owner to use a particular contractor. APi describes the revenue as *"reasonably recurring due to the consistent renewal rates and deep customer relationships"* — the language of habit, not of contract. | Disclosed |
| **APi's typical contract period is under 6 months.** | APi 10-K revenue note: typical contract period *"less than 6 months"*, maximum 5 years. | Disclosed |
| **No US fire-protection contracting platform discloses an ITM contract-renewal or attrition rate.** | Checked APi 10-K, APi earnings release, Cintas 10-K, JCI 10-K. None discloses one. | — |

**Underwriting conclusion.** For sub-vertical 2, "recurring" means an assignable, term-dated, attrition-measurable monitoring contract whose decay rate is 13.1% a year and whose acquisition cost pays back in 2.3 years — a bankable asset that can be priced on an RMR multiple. For sub-vertical 1, "recurring" means a **code-mandated obligation attached to a building**, serviced under a contract APi itself characterises as typically under six months. **The annuity belongs to the building, not to the contractor.** What a buyer assigns in a fire-protection contracting transaction is a *site list and a relationship*, defended by switching friction (the incumbent holds the inspection history, the deficiency backlog and the AHJ-facing records required by NFPA 72 §14.6.2.4 — see parallel stream 02) rather than by a contract term.

This is why the parallel stream's ≈10% threshold is the right cut. Above it, you are buying contracts. Below it, you are buying a route list and a habit — and the diligence question changes from "what is attrition?" to "what share of the site list renews, who holds the inspection records, and does the state licence transfer?" (§7.4).

## 4.3 The one recurring-quality metric a fire contractor *can* be held to

APi's disclosed remaining performance obligations of **$3,605M** with **74% expected within 12 months** (`Basis: Disclosed`) is the closest thing to a contracted-backlog measure in the sub-vertical, and it covers install as well as ITM. Speedwell reports a record **"$4bn+"** backlog at Q2 2025 (`Basis: Press-derived`). Against $7,911M of FY2025 revenue, $3,605M of RPO is 45.6% of a year's revenue — **that is a project backlog, not an annuity.**

---

# 5. ROUTE DENSITY

**This is the weakest-evidenced section in the brief and I am saying so rather than filling it.** No stops-per-technician-per-day figure, no drive-time-share figure and no minimum-viable-metro-density figure could be sourced from a named company, filing, survey or association. See `## What I could not verify`.

What is disclosed, and what it does and does not support:

| Anchor | Value | Population | Basis |
|---|---|---|---|
| **Cintas local delivery routes** | **≈12,100** at 2025-05-31 | Cintas company-wide (all segments) | Disclosed |
| Cintas revenue per route | **$854,560 / route / year** | Company-wide, dominated by uniform rental | Estimated (D12) |
| Cintas employee-partners per route | **3.99** | Company-wide, includes plants and DCs | Estimated (D12) |
| Cintas operational facilities | **478** plus 12 distribution centres | Company-wide | Disclosed |
| **ORR Protection sites serviced annually** | **"more than 8,000 sites"** across **15 branches** | Single platform, special-hazard/mission-critical weighted | Disclosed (company site) |
| ORR sites per branch | **533** | Same | Estimated (D21) |
| ORR revenue per site | **$21,125** *if* revenue is $169M | Same; **revenue figure unverified** | Estimated (D21), `Unverified — parallel stream` input |
| **Pye-Barker** | **9,000+ team members / 250+ locations / 47 states** | Single platform, national | Disclosed (company release 2026-05-27) |
| Pye-Barker team members per location | **36.0** | Same | Estimated (D18) |
| Pye-Barker locations per state | **5.32** | Same | Estimated (D18) |

**What these actually tell a buyer.** ORR's 533 sites per branch is a *special-hazard* density — high-value, low-frequency, engineer-heavy sites where a technician may service one or two per day. Pye-Barker's 36 team members per location is a *branch* density, and at 5.32 locations per state it is a genuinely clustered footprint rather than a scattered one. Cintas's 3.99 employee-partners per route and $854,560 revenue per route is a *high-frequency consumables route* — the opposite end of the spectrum from ORR, and the closest available analogue to what an extinguisher/kitchen-hood route looks like at maturity.

**The clustering logic that a platform's margin depends on is real but is not quantified in any source I could reach.** Two disclosed facts bear on it indirectly: (a) Cintas "All Other" operating margin rose from **14.81% (FY2023) → 15.97% (FY2024) → 16.72% (FY2025)** on revenue growth from $967.1M → $1,064.1M → $1,146.0M — 191 bps of margin expansion on 18.5% revenue growth over two years, consistent with (but not proof of) density leverage; (b) APi Safety Services segment margin rose 90 bps to 16.8% on 13.7% revenue growth. `Basis: Estimated` (D15) / `Disclosed`.

---

# 6. CONTRACT LENGTH AND CHURN/ATTRITION

## 6.1 Monitoring — the numbers exist and are disclosed

| Metric | FY2025 | FY2024 | Basis |
|---|---|---|---|
| **ADT gross customer revenue attrition (TTM)** | **13.1%** (+40 bps YoY) | **12.7%** | **Disclosed** — ADT Q4 2025 earnings release, filed as 8-K EX-99.1 on 2026-03-02 |
| ADT revenue payback | **2.3 years** | 2.2 years | Disclosed, same release |
| ADT end-of-period RMR | **$359M** | $359M (flat, 0% change) | Disclosed, same release |
| ADT subscribers | **≈6.1 million** security monitoring service subscribers at 2025-12-31 | — | Disclosed (10-K) |
| Implied average customer life at 13.1% | **7.63 years** | 7.87 years at 12.7% | Estimated (D10) |
| **Contract terms** | *"two, three, or five years, with automatic renewals for successive 30-day periods for residential security customers and annual periods for small business customers, unless canceled by either party"* | — | **Disclosed** (10-K) |

**Read this pair together: RMR was flat YoY at $359M while attrition rose 40 bps and revenue payback lengthened from 2.2 to 2.3 years.** That is a book being replaced, not grown, at a slightly worsening cost. For an acquirer, gross attrition of 13.1% against a 2.3-year payback means roughly the first third of a customer's life is spent recovering acquisition cost.

**Directional cross-reference (different population):** Everon's CEO Don Young on the ADT B2B multifamily acquisition (announced 2025-09-15, closed 2025-10-01): *"This agreement marks a natural progression in the growth of our business and expands our reach in a valuable market with a traditionally low attrition rate."* `Basis: Disclosed` (Everon release, via parallel stream 04). Multifamily commercial monitoring is asserted by a named operator to be lower-attrition than the residential book that produces ADT's 13.1% — **no figure is attached to that assertion and none is asserted here.**

## 6.2 ITM and fire-protection service — the numbers do not exist publicly

**No US fire-protection contracting company or filer discloses an ITM agreement term, a renewal rate or a customer-attrition rate.** Checked: APi Group FY2025 10-K and Q4 2025 earnings release; Cintas FY2025 10-K; JCI FY2025 10-K; Pye-Barker public site and press releases; ORR Protection public site. The only quantitative statements available are qualitative-with-a-number-attached:

- APi 10-K: revenue is *"reasonably recurring due to the consistent renewal rates"* — **no rate given**. `Basis: Disclosed` (that the rate is not given).
- APi 10-K revenue note: typical contract period **"less than 6 months"**, maximum **5 years**. `Basis: Disclosed`.
- ADT small-business monitoring auto-renews in **annual** periods (vs 30-day for residential). `Basis: Disclosed` — the nearest disclosed analogue to a commercial-account renewal cadence.

**Underwriting instruction.** Treat any ITM renewal rate presented in a CIM as an unaudited management figure until it is tested against the target's own site-level invoice history across three consecutive inspection cycles. There is no public benchmark to check it against, and the parallel-stream code work (stream 02: **11 contractor-performed scheduled site events per year** for a single-tenant commercial building, before any 3-, 5- or 6-year event and before deficiency repairs) means the *obligation* recurs 11 times a year regardless of who performs it. Retention is a competitive outcome, not a contractual one.

---

# 7. LABOUR AS THE BINDING CONSTRAINT

## 7.1 NICET — the certification ladder, with the experience gates that make it a moat

NICET (National Institute for Certification in Engineering Technologies) runs six Fire Protection / Building Systems programmes: **Fire Alarm Systems (FAS)**; **Inspection and Testing of Fire Alarm Systems (ITFAS)**; **Water-Based Systems Layout (WBSL)**; **Inspection and Testing of Water-Based Systems (ITWBS)**; **Special Hazards Systems**; **In-Building Public Safety Communications**. `Basis: Disclosed` (nicet.org programme index).

### Fire Alarm Systems (FAS) — four levels
`Basis: Disclosed` — NICET FAS Candidate Handbook (PDF) and programme page.

| Level | **Minimum work experience** | Exam | Recommendations |
|---|---|---|---|
| I | *"A minimum of 6 months\* of experience with fire detection and signaling systems"* | 85 questions / 110 min | Not required |
| II | *"A minimum of 2 years\* of fire detection and signaling systems experience, which MUST include: At least 12 months of fire alarm systems experience"* | 110 questions / 155 min | Not required |
| III | *"A minimum of 5 years\* … At least 45 months required for FAS Level III"* | 115 questions / 170 min | **Required** |
| IV | *"A minimum of 10 years\* … At least 105 months of fire alarm systems experience"* | 120 questions / 290 min (incl. 30-min break) | **Required** |

Programme scope: *"system layout (plan preparation), system equipment selection, system installation, system acceptance testing, system troubleshooting, system servicing, and system technical sales."*

### Inspection and Testing of Water-Based Systems (ITWBS) — the ITM certification, three levels
`Basis: Disclosed` — NICET ITWBS Candidate Handbook (PDF) and programme page.

| Level | **Minimum work experience** | Role description (verbatim) | Exam |
|---|---|---|---|
| I | *"A minimum of 6 months\* of involvement with water-based fire protection systems inspection, testing, repair and maintenance activities"* | *"technicians who perform limited job tasks under direct supervision"* | 115 questions / 125 min |
| II | *"A minimum of 2 years\* of work experience in the inspection and periodic testing of water-based fire protection systems"*, ≥1 year direct inspection/testing | *"technicians who perform routine inspection and testing tasks under limited supervision"* | 168 questions / 185 min |
| III | *"A minimum of 5 years\* of work experience in the inspection and periodic testing of existing water-based fire protection systems"*, ≥3 years direct inspection/testing | *"technicians who can work independently to perform complex system inspection and testing jobs"* | 145 questions / 155 min |

Scope: *"inspection and testing of existing water-based fire protection systems, including identifying and addressing emergency and pre-planned impairments"*, covering *"applicable codes and standards, primarily NFPA 25."*

### Water-Based Systems Layout (WBSL) — the design/plan-prep certification, four levels
`Basis: Disclosed`.
- Level I: *"trainees and entry-level technicians who perform limited job tasks under frequent supervision"*
- Level II: *"technicians who perform routine tasks under general daily supervision"*
- **Level III: *"technicians who can work independently with standards, plans, and specifications to produce complete plans for typical/standard systems for approval"*** — Level III is split into two exams: **General Plan Prep** (70 q / 175 min) and **Hydraulics** (60 q / 240 min incl. 15-min break)
- Level IV: *"senior-level technicians whose work includes complex or specialized systems and supervision of others"* (80 q / 240 min)

Scope: *"layout and detailing of water-based systems"*, including *"plan and submittal preparation"*.

### Inspection and Testing of Fire Alarm Systems (ITFAS) — two levels
`Basis: Disclosed`. Level I 85 q / 110 min; Level II 80 q / 110 min. The certification *"qualifies holders to perform maintenance/periodic fire alarm inspections"* and *"serves as evidence of qualification for Authority Having Jurisdiction (AHJ) acceptance."*

### Cross-cutting requirements
- **Recertification every three years**, requiring **90 CPD points per certification, drawn from at least two categories**. `Basis: Disclosed` (FAS and ITWBS handbooks).
- **Work history must be verified by a supervisor** who is *"in a position and ha[s] the authority to directly supervise, inspect, and/or approve"* the applicant's work; verifiers *"must be technically competent and cannot be peers or subordinates."* `Basis: Disclosed`.
- Levels III and IV additionally require **personal recommendations** from licensed PEs, NICET Level IV technicians, registered surveyors, architects, fire marshals or code officials; **recommenders cannot be current or former verifiers.** `Basis: Disclosed`.

**Underwriting consequence — this is the moat and the constraint in one.** A **Level III ITWBS technician cannot be created in under five years**, of which three must be direct inspection and testing. A Level III cannot be hired away from a competitor without the competitor noticing, and cannot be manufactured by training spend. **The binding constraint on how fast an ITM platform can grow organically is the number of Level II technicians it began the five-year clock with.** The 90-CPD/3-year recertification also means the certified base decays if a platform stops funding CPD — an integration risk in a cost-cut scenario.

**Certification counts: I could not verify any.** NICET publishes no count on its public pages. A third-party page indexing state-by-state NICET counts *"Data as of July 1, 2024"* exists but its numeric body did not render on retrieval (the same failure parallel stream 01 recorded). **No NICET certification count is asserted in this document.**

**The one named certified-headcount disclosure I found:** ORR Protection states **42 NICET-certified and 4 NAFED-certified associates** across 15 branches. `Basis: Disclosed` (orrprotection.com). That is **2.8 NICET-certified individuals per branch** at a special-hazard platform servicing 8,000 sites a year (D21) — a usable order-of-magnitude prior for how thin the certified layer is even at a national platform.

## 7.2 Sprinkler fitters — UA Road Sprinkler Fitters Local 669

| Fact | Value | Basis |
|---|---|---|
| Full name | *"UA Local Union 669 Road Sprinkler Fitters, AFL-CIO"* | Disclosed (ua669 / sprinklerfitters669.org) |
| Jurisdiction | **Nationwide** — a single national local with jurisdiction over sprinkler fitting across the United States; members can seek work anywhere in the country | Disclosed |
| Membership (union's own statement) | **"Over 17,000 members"**, of which **"more than 13,000 active journeypeople"** and **"over 4,000 apprentices"** | Disclosed |
| Membership (DOL LM filing, via UnionFacts) | **16,631 members, 2025 filing** | Press-derived — carried from parallel stream 01 |
| Apprentice share | **30.77%** of journeypeople; **23.53%** of total membership | Estimated (D31) |
| HQ | 7050 Oakland Mills Road, Suite 200, Columbia, MD 21046 | Disclosed |

> **CONFLICT preserved.** The union states *"over 17,000"*; the DOL LM filing (as republished by UnionFacts, page last updated 2026-04-23) shows **16,631**. **I would underwrite on 16,631** — it is the number filed under penalty with the Office of Labor-Management Standards, whereas the website figure is unsourced and rounded upward. The gap is ≈2.2% and does not change any conclusion. **No midpoint is taken.**

**Why the single-national-local structure matters commercially:** because Local 669 has nationwide jurisdiction, a union sprinkler contractor's labour cost is set by a national agreement structure rather than by a metro-by-metro local, and a union platform can move manpower across state lines without renegotiating jurisdiction. An open-shop platform cannot access that pool. **The union/non-union split therefore changes the cost structure and the manpower-mobility optionality simultaneously**, and the two effects run in opposite directions.

**Open-shop training counterpart:** AFSA (American Fire Sprinkler Association) — *"more than 1,000 member companies"* (`Basis: Disclosed`, firesprinkler.org/about, retrieved 2026-07-29) — runs a **four-level Fire Sprinkler Fitter Apprentice Training** programme plus Designer, Foremanship, Residential Installation, NFPA 25 and ASSE 15010 courses. **AFSA's apprenticeship hours, program length and cost per apprentice could not be retrieved** (the apprenticeship page returned HTTP 403). **The apprenticeship length for neither the union nor the open-shop programme is asserted here.**

**Union density context, adjacent filers:** JCI discloses *"Approximately 18,000 employees are covered by collective bargaining agreements or works councils"* out of ≈87,000 = **20.69%** (`Estimated`, D17). APi's 10-K states only that *"a large portion of our workforce is covered by collective bargaining agreements"* and refers to a *"significant union labor force in the U.S."* — **no percentage disclosed**. Cintas discloses **≈900 of 48,300 = 1.86%** union-represented (`Estimated`), which is what a pure open-shop route business looks like.

## 7.3 Wage data and wage inflation

### SOC 49-2098 — Security and Fire Alarm Systems Installers
Population: **US national, all industries, BLS Occupational Employment and Wage Statistics.** Note the occupation title **fuses security with fire**; it is not a fire-only headcount.

| Survey vintage | Employment | Mean hourly | Mean annual | **Median annual** | 10th pct annual | 90th pct annual | Basis |
|---|---|---|---|---|---|---|---|
| **May 2019** | 71,600 | $24.14 | $50,210 | **$48,970** | $31,180 | $73,920 | Disclosed (bls.gov/oes/2019/may/oes492098.htm) |
| **May 2021** | 77,420 | $25.08 | $52,170 | **$48,320** | $30,490 | $76,240 | Disclosed (bls.gov/oes/2021/may/oes492098.htm) |
| **May 2022** | 80,720 | $26.10 | $54,280 | **$50,130** | $34,840 | $77,980 | Disclosed (bls.gov/oes/2022/may/oes492098.htm) |
| **May 2023** | 83,540 | $27.59 | $57,400 | **$56,430** | $36,790 | $79,650 | Disclosed (bls.gov/oes/2023/may/oes492098.htm) |
| **2025 wage data** (median only available) | 85,900 (2024) | $28.88 | — | **$60,070** | — | — | Disclosed (BLS, via O\*NET OnLine 49-2098.00) |

Wage inflation (`Estimated`, D22):
- **Median annual, May 2021 → 2025: +24.32%, CAGR 5.59%.**
- Median annual, May 2022 → May 2023: **+12.57% in a single survey year** — the sharpest step in the series.
- Median annual, May 2023 → 2025: +6.45% (CAGR 3.18%) — deceleration, but still above general CPI.
- Mean annual, May 2019 → May 2023: +14.32% (CAGR 3.40%).
- Employment, May 2019 → May 2023: **+16.68%** (71,600 → 83,540). The occupation grew and got more expensive at the same time.
- **Projected 2024–2034: growth "Much faster than average (7% or higher)", 9,400 projected annual openings.** `Basis: Disclosed` (BLS employment projections via O\*NET).

### SOC 47-2152 — Plumbers, Pipefitters, and Steamfitters (**"Includes sprinkler fitters"**)
Population: US national, all industries. O\*NET's reported job titles for this SOC include *"Fire Sprinkler Service Technician"* and *"Sprinkler Fitter"*; registered apprenticeship titles include *"Pipe Fitter - Sprinkler Fitter"*. There is **no separate BLS series for sprinkler fitters**.

| Survey vintage | Employment | Mean hourly | Mean annual | **Median annual** | Basis |
|---|---|---|---|---|---|
| **May 2021** | 417,620 | $30.46 | $63,350 | **$59,880** | Disclosed (bls.gov/oes/2021/may/oes472152.htm) |
| **May 2023** | 436,160 | $32.62 | $67,840 | **$61,550** | Disclosed (bls.gov/oes/2023/may/oes472152.htm) |
| **2025 wage data** | 504,500 (2024) | $30.67 | — | **$63,800** | Disclosed (BLS, via O\*NET 47-2152.00) |

Wage inflation (`Estimated`, D23): **median annual May 2021 → 2025: +6.55%, CAGR 1.60%.** Projected 2024–2034 growth 5–6%, **44,000 projected annual openings**.

> **CONFLICT / ASYMMETRY worth carrying into the model.** Over the same 2021→2025 window, the **alarm-installer occupation inflated at 5.59% CAGR while the pipefitter container inflated at 1.60% CAGR** — a 399 bps annual divergence. That is not noise. Two readings are available and I would carry both: (a) the low-voltage life-safety labour pool is genuinely tighter than the mechanical trades pool, so sub-vertical 2's labour cost is escalating faster; or (b) 47-2152 is a 504,500-person container in which sprinkler fitters are a small minority, so its aggregate wage is dominated by residential plumbing and is simply not measuring sprinkler-fitter wages at all. **I would underwrite on (b) as the more likely explanation and treat the 47-2152 series as unusable for sprinkler-fitter wage inflation**, while using 49-2098 directly for the alarm sub-vertical, where the occupation actually matches the work. The practical consequence: **there is no reliable published wage-inflation series for sprinkler fitters.**

### The technician cost-per-head figure I am not giving
A fully-loaded technician cost (wage × burden × utilisation) is the input a buyer most wants. **No source I could reach discloses a burden multiplier or a billable-utilisation rate for fire-protection technicians.** I have left it out. The disclosed inputs above ($60,070 median for 49-2098; Census 238220 construction-worker payroll of $66,225 per Q1 construction worker, D26) bracket the *wage* line only.

## 7.4 Licensing as a moat and as an integration constraint

The general principle established by parallel stream 02 is that most states license the **firm** through a **named individual** — a Responsible Managing Employee (RME) or qualifying agent. Two named, verified instances of the binding constraint:

**Florida — Fla. Stat. § 633.328** (`Basis: Disclosed`, flsenate.gov, 2024 statutes):
> *"At least one member or supervising employee of the business organization as designated to the State Fire Marshal by such organization shall be certified under this chapter in order for the business organization to hold a current certificate as a contractor."*
> *"A certified individual who is the sole contractor on behalf of a business organization may not affiliate simultaneously with another business organization."*
> If the sole certified individual departs, the organisation has *"a grace period of 60 days from the date of termination in which to certify another person under the provisions of this chapter, failing which the certification of the business organization shall expire without further operation of law."*

**Florida — Fla. Stat. § 633.318**, experience gates behind the qualifying certificate (`Basis: Disclosed`):
- Contractor I & II: *"4 years' proven experience in the employment of a fire protection system Contractor I or a combination of equivalent education and experience in water-based and chemical fire suppression systems"*
- Contractor III: *"4 years of verifiable employment experience … in chemical fire suppression systems"*
- Contractor IV: must be *"licensed as a certified plumbing contractor under chapter 489"* plus *"successfully complete a training program acceptable to the State Fire Marshal of not less than 40 contact hours regarding the applicable installation standard used by the Contractor IV as described in NFPA 13D"*
- Contractor V: must have been *"licensed as a certified underground utility and excavation contractor or certified plumbing contractor"*

**Iowa** (carried from parallel stream 02, `Basis: Disclosed` — Iowa Code ch. 100C/100D, 481 IAC ch. 265/266): contractor licence **plus** technician licence **plus** technician-trainee licence, with endorsements by system type, and *"Contractor must name a **responsible managing employee (RME)** with a current qualifying certification."*

**Washington** (carried from parallel stream 02, `Basis: Disclosed` — RCW 18.160, WAC 212-80): four contractor levels; **Level U requires NICET ASSL Level III** — a direct statutory link from a state licence to a NICET level, which is exactly the mechanism that converts the five-year NICET clock in §7.1 into a hard cap on market entry.

**California** (carried from parallel stream 01, `Basis: Disclosed` — CSLB Industry Bulletin 24-02, issued 2024-05-10): a **Fire Sprinkler Fitter Certification** is required for C-16 qualifiers and journey-level personnel installing or repairing water-based systems for commercial or multi-family dwellings; apprentices need a Fire Sprinkler Fitter Registration; one- and two-family dwellings excluded.

### Where this actually binds on a roll-up

1. **You cannot fire the qualifier.** Florida's 60-day cliff means the qualifying individual of an acquired Florida entity holds a licence-extinction option over that entity for two months after any termination. Retention agreements for qualifiers are not a nicety; they are a condition of the licence surviving close.
2. **You cannot always collapse legal entities.** Because a Florida qualifier *"may not affiliate simultaneously with another business organization"* when acting as sole contractor, an acquirer running several Florida-licensed entities needs a distinct qualified individual for each. Entity consolidation to save back-office cost can require *more* certified people, not fewer.
3. **Back-office consolidation is the expensive synergy to lose.** Census 238220 shows office/supervisory payroll at **$75,164** per head versus **$66,225** for construction workers (D26) — the back office is the *more* expensive per-head layer, so a licensing regime that forces a qualified individual to remain attached to each branch or entity destroys the highest-value-per-head synergy in the deal model.
4. **Diligence instruction:** build the licence register before the synergy model. For every acquired entity, in every state: which licence class, which named individual qualifies it, is that individual an owner (i.e. leaving at close), what is the statutory grace period, and does the state permit one individual to qualify multiple entities.

---

# 8. WORKING CAPITAL AND CAPEX

## 8.1 Receivables, retainage and contract balances — APi Group FY2025

Population: **APi Group Corp consolidated**, $7,911M revenue, global, install-and-service mix. `Basis: Disclosed` for all balances (10-K revenue note, R60/R62, filed 2026-02-25); ratios `Estimated` (D3–D5).

| Item | 2025-12-31 | 2024-12-31 | 2023-12-31 |
|---|---|---|---|
| Accounts receivable, net of allowances | **$1,563M** | $1,444M | $1,395M |
| Contract assets | **$484M** | $453M | $436M |
| Contract liabilities | **$694M** | $590M | $526M |
| **Retentions receivable** | **$187M** | $160M | — |
| — of which may not be collected within one year | **$48M** | — | — |

| Derived | Value |
|---|---|
| **DSO on AR alone** | **72.11 days** |
| **DSO including contract assets** | **94.45 days** |
| Contract liabilities as % of revenue | 8.77% |
| **Net contract working capital (AR + CA − CL)** | **$1,353M = 17.10% of revenue** |
| Retentions as % of revenue / as % of AR | **2.36% / 11.96%** |
| Share of retentions beyond one year | **25.67%** |

**Payment terms disclosed:** minimum **7 days**, standard **30 days**, maximum **90 days**. `Basis: Disclosed`.

**Underwriting read.** A buyer modelling a fire-protection contracting platform should carry **≈72 days DSO on AR and ≈94 days once contract assets are included**, and should treat **17.1% of revenue as permanently tied up in contract working capital**. Retainage is the install-side tax: **$187M, a quarter of it beyond a year**. An ITM-only book has materially less of both — which is a second, working-capital reason (beyond margin) that ITM mix drives value. **ServiceTrade's "top performers invoice within 1.6 days" is a billing-cycle-time metric, not a DSO, and must not be substituted for the 72-day figure.**

## 8.2 Capex and fleet

| Item | Value | Basis |
|---|---|---|
| APi FY2025 operating cash flow / capex | **$759M / $96M** | Disclosed |
| APi adjusted free cash flow FY2025 | **$836M** (up $168M YoY); Q4 alone $402M | Press-derived (Investing.com summary of Q4 2025 slides, 2026-02-25) — the primary release states 80% adjusted FCF conversion |
| **Capex as % of revenue** | **1.21%** | Estimated (D6) |
| **Capex per team member** | **$3,310** | Estimated (D6) |
| APi PP&E "Autos and trucks", gross cost | **$138M** (2024: $113M) | Disclosed (10-K R74) |
| **Autos and trucks gross cost per team member** | **$4,759** | Estimated (D7) |
| APi total PP&E gross / accumulated depreciation / net | **$738M / $341M / $397M** | Disclosed |
| APi finance-lease PP&E, net | $8M (2024: $11M) | Disclosed |
| APi weighted-average remaining lease term / discount rate | Operating **4 yrs 6 mths / 5.60%**; finance 2 yrs 10.8 mths / 4.70% | Disclosed |
| APi lease terms by asset class | Buildings 1–12 yrs; equipment 1–7 yrs; **autos and trucks 1–7 yrs** | Disclosed |

> **Do not read $4,759 as truck capex per technician.** Three reasons, all disclosed: (a) the denominator is **total** team members, not technicians, and technicians are a minority of headcount (§1.1); (b) it is **gross historical cost**, not replacement cost; (c) **APi leases autos and trucks on 1–7 year operating leases**, so an unknown share of the fleet never appears in PP&E at all. The correct statement is: **APi's owned truck fleet carries a gross book cost equal to 1.74% of annual revenue** ($138M / $7,911M), and total capex runs at **1.21% of revenue**. Fire-protection contracting is a low-capex, high-working-capital business — the balance-sheet burden is receivables and retainage, not trucks.

## 8.3 The software stack — the only fully published price list in the sector

| Vendor | Published pricing | Basis |
|---|---|---|
| **ServiceTrade** | **Select $59** / **Premium $99** / **Enterprise $159** — each *"per month • per technician • billed annually"*; **"Unlimited office users"** on all tiers. Select: minimum 5 technicians; Premium: recommended 10–20 technicians; Enterprise: recommended 20+ technicians. Premium adds recurring contract invoices, geographical regions, multiple brands, integration library, business analytics, 24/7 emergency support. Enterprise adds the certification program as standard. | **Disclosed** — servicetrade.com/pricing |
| **BuildOps** | **No published price.** *"BuildOps pricing is built around your crew size, your trades, and what your team actually needs, so your investment fits the way your shop runs."* Priced on *"the number of field and office users on your account."* *"BuildOps includes implementation and onboarding support with every plan."* Subcontractors do not require separate licences. | Disclosed (that it is not published) — buildops.com/pricing |
| **Inspect Point** | **No published price.** Only threshold disclosed: *"Have 30 or more technicians? Contact us today to learn more about our customized enterprise plan."* | Disclosed (that it is not published) — inspectpoint.com/pricing |
| **BRYCER — The Compliance Engine** | **Could not retrieve** (brycer.com returned a robots/connection failure). **No BRYCER pricing, jurisdiction count or throughput figure is asserted in this document.** | — |

**Cost per technician per year (`Estimated`, D25):** Select **$708**, Premium **$1,188**, Enterprise **$1,908**. Against a revenue-per-technician assumption of $250,000 (roughly the ADT installation-revenue-per-technician figure, D8), the Enterprise tier is **0.76% of revenue per technician**. **The pricing model itself is the finding: ServiceTrade charges per *technician* and gives office users away free.** That is a vendor with an accurate model of where the value is created in this industry, and it means software cost scales with the exact headcount that licensing and NICET constrain (§7) — it does not scale with the back office a roll-up is trying to consolidate.

---

# ## Derivations

All arithmetic below; each line names its inputs and their basis.

**D1 — APi revenue per team member.** $7,911M ÷ 29,000 = **$272,793**. Inputs: net revenues $7,911M (Disclosed, FY2025 results release 2026-02-25); *"approximately 29,000 team members"* (Disclosed, FY2025 10-K). Denominator is **total** headcount including all back-office, all segments, all geographies. Safety Services share of revenue = 5,456 ÷ 7,911 = **68.97%**; segment headcount is not disclosed so no Safety-Services-only figure is computed.

**D2 — APi segment margins.** Safety Services FY2025 916 ÷ 5,456 = **16.79%** (company states 16.8%); FY2024 765 ÷ 4,797 = **15.95%** (company states 15.9%). Consolidated adjusted EBITDA margin 1,041 ÷ 7,911 = **13.16%** (company states 13.2%). All inputs Disclosed. Reconciliation confirms my revenue figures match the company's stated growth rates (5,456 ÷ 1.137 = 4,798 ≈ the disclosed 4,797).

**D3 — APi DSO.** AR only: 1,563 ÷ 7,911 × 365 = **72.11 days**. Including contract assets: (1,563 + 484) ÷ 7,911 × 365 = **94.45 days**. Inputs Disclosed. Uses year-end AR, not average AR; average-balance DSO would differ.

**D4 — APi contract working capital.** AR + contract assets − contract liabilities = 1,563 + 484 − 694 = **$1,353M** = 1,353 ÷ 7,911 = **17.10%** of revenue. Contract liabilities alone = 694 ÷ 7,911 = **8.77%** of revenue.

**D5 — APi retainage.** 187 ÷ 7,911 = **2.36%** of revenue; 187 ÷ 1,563 = **11.96%** of AR; 48 ÷ 187 = **25.67%** beyond one year. Inputs Disclosed (R60).

**D6 — APi capex.** 96 ÷ 7,911 = **1.21%** of revenue. $96,000,000 ÷ 29,000 = **$3,310** per team member.

**D7 — APi fleet.** Autos and trucks gross cost $138,000,000 ÷ 29,000 = **$4,759** per team member; $138M ÷ $7,911M = **1.74%** of revenue. Caveats in §8.2.

**D8 — ADT per-head.** Revenue per total employee: $5,128,607k ÷ 12,200 = **$420,378**. Technician share: 3,100 ÷ 12,200 = **25.41%**. Field-facing share: (3,100 + 1,600) ÷ 12,200 = **38.52%**. **Installation/product revenue per installation-and-service technician:** $774,520k ÷ 3,100 = **$249,845**. All inputs Disclosed (10-K filed 2026-03-02; revenue note R52).

**D9 — ADT recurring share.** Monitoring and related services ÷ total revenue = 4,354,087 ÷ 5,128,607 = **84.90%**. Annualised RMR = $359M × 12 = **$4,308M**. Annualised RMR ÷ **total** revenue = 4,308 ÷ 5,128.607 = **84.00%**. Annualised RMR ÷ **monitoring** revenue = 4,308 ÷ 4,354.087 = **98.94%**. The 98.94% reconciles to the parallel stream's ADT figure of 98.9%, confirming that figure uses monitoring revenue, not total revenue, as its denominator.

**D10 — ADT implied customer life.** 1 ÷ 0.131 = **7.63 years** at FY2025 gross attrition; 1 ÷ 0.127 = **7.87 years** at FY2024. This is a simple reciprocal and assumes constant-hazard attrition, which real books do not exhibit (early-life attrition is higher). Treat as an upper-bound-style approximation, not a cohort life.

**D11 — Cintas fire protection growth.** 817.463 ÷ 728.610 − 1 = **+12.19%** (FY2025); 728.610 ÷ 627.747 − 1 = **+16.07%** (FY2024); (817.463 ÷ 627.747)^0.5 − 1 = **+14.11%** two-year CAGR. Fire Protection Services as a share of "All Other": 817.463 ÷ 1,146.018 = **71.33%**. Inputs Disclosed (Cintas FY2025 10-K, R49, filed 2025-07-28).

**D12 — Cintas route economics.** Revenue per route: $10,340,181k ÷ 12,100 = **$854,560**. Employee-partners per route: 48,300 ÷ 12,100 = **3.99**. Company-wide, not fire-specific.

**D13 — Cintas revenue per employee-partner.** $10,340,181k ÷ 48,300 = **$214,082**.

**D14 — Cintas segment margins.** All Other: gross 542,369 ÷ 1,146,018 = **47.33%**; operating 191,608 ÷ 1,146,018 = **16.72%**. FY2024 operating 169,979 ÷ 1,064,082 = **15.97%**; FY2023 143,217 ÷ 967,143 = **14.81%**. First Aid & Safety: gross **57.19%**, operating 294,728 ÷ 1,218,090 = **24.20%**. Uniform Rental operating 1,873,390 ÷ 7,976,073 = **23.49%**. Inputs Disclosed (R86).

**D15 — see D14** (Cintas segment margins).

**D16 — JCI install-vs-service gross margin.** From the FY2025 10-K consolidated statements of income (R3), $ millions:
- FY2025: Products & systems GP = 16,124 − 10,543 = 5,581 → 5,581 ÷ 16,124 = **34.61%**. Services GP = 7,472 − 4,461 = 3,011 → 3,011 ÷ 7,472 = **40.30%**. Differential **+568 bps**. Service share of sales 7,472 ÷ 23,596 = **31.67%** (company states ≈32%).
- FY2024: 15,967 − 10,677 = 5,290 → **33.13%**; 6,985 − 4,198 = 2,787 → **39.90%**; differential **+677 bps**.
- FY2023: 15,789 − 10,736 = 5,053 → **32.00%**; 6,542 − 3,791 = 2,751 → **42.05%**; differential **+1,005 bps**.
Cross-check: 10,543 + 4,461 = 15,004 = disclosed consolidated cost of sales; 16,124 + 7,472 = 23,596 = disclosed net sales. Reconciles exactly.

**D17 — JCI per-head.** $23,596M ÷ 87,000 = **$271,218**. US share of headcount 31,000 ÷ 87,000 = **35.63%**. CBA/works-council share 18,000 ÷ 87,000 = **20.69%**.

**D18 — Pye-Barker footprint density.** 9,000 ÷ 250 = **36.0** team members per location; 250 ÷ 47 = **5.32** locations per state. Inputs Disclosed (Pye-Barker press release 2026-05-27: *"9,000+ team members"*, *"operations across 47 states"*, *"250+ locations"*, *"more than 200 companies"* acquired). Both inputs are "+" figures so both ratios are upper bounds on the per-location figure and lower bounds on the count.

**D19 — Pye-Barker revenue sensitivity (NOT a revenue estimate).** 9,000 × $272,793 (APi basis) = **$2,455M**; 9,000 × $271,218 (JCI basis) = **$2,441M**; 9,000 × $214,082 (Cintas basis) = **$1,927M**. This is presented only to show the width of the band an assumption choice produces. **No Pye-Barker revenue figure is asserted anywhere in this document.**

**D20 — APi ISM revenue and the gap to target.** 54% × $7,911M = **$4,272M** ISM revenue FY2025 (`Estimated` on a `Press-derived` percentage). 60% × $10,000M (the low end of the "$10+ billion by 2028" target) = **$6,000M**. Gap = **$1,728M** of ISM revenue to be added by 2028.

**D21 — ORR density.** 8,000 sites ÷ 15 branches = **533 sites per branch** (both inputs Disclosed, orrprotection.com). $169,000,000 ÷ 8,000 sites = **$21,125 revenue per site per year** — **the $169M input is `Unverified — parallel stream`, so this figure carries that flag.** NICET density: 42 certified ÷ 15 branches = **2.80 NICET-certified individuals per branch**.

**D22 — 49-2098 wage inflation.** Median annual: 2021 $48,320 → 2025 $60,070 = **+24.32%**; CAGR = (60,070 ÷ 48,320)^(1/4) − 1 = **5.59%**. 2022 $50,130 → 2023 $56,430 = **+12.57%**. 2023 → 2025 = **+6.45%** (CAGR 3.18%). Mean annual 2019 $50,210 → 2023 $57,400 = **+14.32%** (CAGR 3.40%). Employment 2019 71,600 → 2023 83,540 = **+16.68%**. Note the 2025 median comes from a different retrieval path (O\*NET restating BLS 2025 wage data) than the 2019–2023 medians (BLS OEWS year-archive pages); the series is therefore not strictly like-for-like at the last step.

**D23 — 47-2152 wage inflation.** Median annual 2021 $59,880 → 2025 $63,800 = **+6.55%**; CAGR **1.60%**. 2023 $61,550 → 2025 $63,800 = **+3.66%**.

**D24 — deliberately omitted.** A fully-loaded technician cost figure would require a burden multiplier and a billable-utilisation rate. Neither is disclosed by any source reached. **No fully-loaded cost figure is asserted.**

**D25 — software cost per technician.** ServiceTrade: $59 × 12 = **$708/yr**; $99 × 12 = **$1,188/yr**; $159 × 12 = **$1,908/yr**. Enterprise as a share of a $250,000 revenue-per-technician assumption = 1,908 ÷ 250,000 = **0.76%**.

**D26 — Census 238220 cost structure (2022 Economic Census, US employer establishments, $ thousand).** Inputs Disclosed via parallel stream 01's retrieval of the Census API. RCPTOT 297,608,835; PAYANN 80,351,785; CSTMPRT 93,671,679; RCPCWRK 288,331,268; RCPNCW 267,125,455; VALADD 175,917,812; PAYANCW 56,060,961; EMPQ1CW 846,519; PAYANOC 24,290,824; EMPQ1OC 323,173.
- Payroll ÷ receipts = **27.00%**. Materials ÷ receipts = **31.47%**.
- Subcontract payments = 288,331,268 − 267,125,455 = **21,205,813** = **7.13%** of receipts.
- Residual = (297,608,835 − 80,351,785 − 93,671,679 − 21,205,813) ÷ 297,608,835 = **34.40%**.
- Value added less payroll = 175,917,812 − 80,351,785 = 95,566,027 = **32.11%** of receipts.
- Construction-worker payroll per Q1 construction worker = $56,060,961,000 ÷ 846,519 = **$66,225**. Other payroll per Q1 other employee = $24,290,824,000 ÷ 323,173 = **$75,164**. **Both mix an annual payroll numerator with a Q1 employment denominator — that is how the Census publishes these variables, and the figures are therefore indicative of relative cost per head, not exact annual compensation.**
- **Neither 34.40% nor 32.11% is EBITDA.** See the warning in §2.3.

**D27 — Local 669 apprentice ratio.** 4,000 ÷ 13,000 = **30.77%** of journeypeople; 4,000 ÷ 17,000 = **23.53%** of total membership. Inputs Disclosed (union site). Union self-reported total (>17,000) vs DOL LM filing (16,631) differ by 2.22%; **no midpoint taken**.

---

# ## Sources

**SEC filings (all retrieved 2026-07-29 from sec.gov/Archives)**
1. APi Group Corp, Form 10-K for FY2025 — https://www.sec.gov/Archives/edgar/data/1796209/000162828026011620/apg-20251231.htm — filed **2026-02-25**. (Item 1 Business/Human Capital; revenue note details via R60, R61, R62; PP&E via R74; leases via R76, R79.)
2. APi Group Corp, Form 8-K Exhibit 99.1, Q4 and full-year 2025 earnings release — https://www.sec.gov/Archives/edgar/data/1796209/000162828026011397/apg-20251231xexx991.htm — filed **2026-02-25**.
3. APi Group Corp, "APi Group Reports Record Fourth Quarter and Full Year 2025 Financial Results" — https://ir.apigroupcorp.com/News/press-releases/news-details/2026/APi-Group-Reports-Record-Fourth-Quarter-and-Full-Year-2025-Financial-Results/default.aspx — **2026-02-25**.
4. APi Group Corp, "APi Group Announces New Long-Term Financial Targets" — https://ir.apigroupcorp.com/News/press-releases/news-details/2025/APi-Group-Announces-New-Long-Term-Financial-Targets/default.aspx — **2025-05-21**.
5. ADT Inc., Form 10-K for FY2025 — https://www.sec.gov/Archives/edgar/data/1703056/000170305626000022/adt-20251231.htm — filed **2026-03-02**. (Human capital; revenue disaggregation via R52.)
6. ADT Inc., Form 8-K Exhibit 99.1, Q4 2025 earnings release — https://www.sec.gov/Archives/edgar/data/1703056/000170305626000013/q42025adtearningsrelease-e.htm — filed **2026-03-02**.
7. Cintas Corporation, Form 10-K for FY2025 (FYE 2025-05-31) — https://www.sec.gov/Archives/edgar/data/723254/000072325425000017/ctas-20250531.htm — filed **2025-07-28**. (Employee-partners, routes, facilities; revenue disaggregation via R49; segment detail via R86.)
8. Johnson Controls International plc, Form 10-K for FY2025 (FYE 2025-09-30) — https://www.sec.gov/Archives/edgar/data/833444/000083344425000097/jci-20250930.htm — filed **2025-11-14**. (Employees; product/service mix; backlog; income statement via R3.)

**Bureau of Labor Statistics — Occupational Employment and Wage Statistics**
9. BLS OEWS 49-2098 Security and Fire Alarm Systems Installers, May 2019 — https://www.bls.gov/oes/2019/may/oes492098.htm — survey reference **May 2019**.
10. BLS OEWS 49-2098, May 2021 — https://www.bls.gov/oes/2021/may/oes492098.htm — **May 2021**.
11. BLS OEWS 49-2098, May 2022 — https://www.bls.gov/oes/2022/may/oes492098.htm — **May 2022**.
12. BLS OEWS 49-2098, May 2023 — https://www.bls.gov/oes/2023/may/oes492098.htm — **May 2023**.
13. BLS OEWS 47-2152 Plumbers, Pipefitters, and Steamfitters, May 2021 — https://www.bls.gov/oes/2021/may/oes472152.htm — **May 2021**.
14. BLS OEWS 47-2152, May 2023 — https://www.bls.gov/oes/2023/may/oes472152.htm — **May 2023**.
15. O\*NET OnLine, 49-2098.00 Security and Fire Alarm Systems Installers — https://www.onetonline.org/link/summary/49-2098.00 — restates **BLS 2025 wage data and 2024–2034 employment projections**; retrieved 2026-07-29.
16. O\*NET OnLine, 47-2152.00 Plumbers, Pipefitters, and Steamfitters — https://www.onetonline.org/link/summary/47-2152.00 — restates **BLS 2025 wage data and 2024–2034 employment projections**; retrieved 2026-07-29.
17. BLS OEWS data tables index (used to establish that May 2025 is the current vintage and that per-occupation HTML profiles are not published after May 2023) — https://www.bls.gov/oes/tables.htm — retrieved 2026-07-29.

**NICET**
18. NICET, Fire Alarm Systems programme page — https://www.nicet.org/main-navigation-tree/certification-programs/fire-protection-building-systems/fire-alarm-systems/ — retrieved 2026-07-29, no publication date shown.
19. NICET, **Fire Alarm Systems Candidate Handbook (PDF)** — https://www.nicet.org/nicetorg/assets/File/public/CandidateHandbook-FAS.pdf — retrieved 2026-07-29, no publication date shown.
20. NICET, Inspection and Testing of Water-Based Systems programme page — https://www.nicet.org/main-navigation-tree/certification-programs/fire-protection-building-systems/inspection-and-testing-of-water-based-systems/ — retrieved 2026-07-29.
21. NICET, **ITWBS Candidate Handbook (PDF)** — https://www.nicet.org/nicetorg/assets/File/public/candidatehandbookitwbs.pdf — retrieved 2026-07-29.
22. NICET, Water-Based Systems Layout programme page — https://www.nicet.org/main-navigation-tree/certification-programs/fire-protection-building-systems/water-based-systems-layout/ — retrieved 2026-07-29.
23. NICET, Inspection and Testing of Fire Alarm Systems programme page — https://www.nicet.org/main-navigation-tree/certification-programs/fire-protection-building-systems/inspection-and-testing-of-fire-alarm-systems/ — retrieved 2026-07-29.
24. NICET, certification programmes index — https://www.nicet.org/main-navigation-tree/certification-programs/ — retrieved 2026-07-29.

**Labour organisations and trade associations**
25. UA Local Union 669 Road Sprinkler Fitters, AFL-CIO — https://www.sprinklerfitters669.org/ — retrieved 2026-07-29; membership figures shown without a publication date.
26. American Fire Sprinkler Association, About — https://firesprinkler.org/about/ — retrieved 2026-07-29, no publication date shown.
27. National Fire Sprinkler Association — https://www.nfsa.org/ — retrieved 2026-07-29 (no membership count or benchmark published on the pages reached).
28. National Association of Fire Equipment Distributors — https://www.nafed.org/ — retrieved 2026-07-29 (no member count or benchmark published on the pages reached).

**Statutes**
29. Florida Statutes § 633.328, Certificates; issuance to individuals and business organizations — https://www.flsenate.gov/Laws/Statutes/2024/633.328 — **2024 statutes**.
30. Florida Statutes § 633.318, Fire protection system contractors; certification — https://www.flsenate.gov/Laws/Statutes/2024/633.318 — **2024 statutes**.

**Company sites**
31. Pye-Barker Fire & Safety, "Pye-Barker Celebrates Its 80 Year Legacy, Community Impact and Innovation in 2026" — https://pyebarkerfs.com/news/pye-barker-celebrates-its-80-year-legacy-community-impact-and-innovation-in-2026/ — **2026-05-27**.
32. Pye-Barker Fire & Safety, About/Overview — https://pyebarkerfs.com/about-us/overview/ — retrieved 2026-07-29.
33. ORR Protection, home and Who We Are — https://www.orrprotection.com/ and https://orrprotection.com/who-we-are/ — retrieved 2026-07-29, no publication date shown.

**Software vendors**
34. ServiceTrade, Pricing — https://www.servicetrade.com/pricing/ — retrieved 2026-07-29 (prices shown without a publication date).
35. ServiceTrade, **Fire and Life Safety Industry Benchmark Report 2024** landing page — https://servicetrade.com/resources/reports/fire-industry-benchmark-report/ — page published **2024-10-29**; sample size not disclosed on the public page.
36. ServiceTrade, 2026 Technician Insights Report landing page — https://servicetrade.com/resources/reports/technician-insights-report/ — published **2026-02-11**, last updated 2026-07-24; **800+ technicians surveyed**.
37. BuildOps, Pricing — https://www.buildops.com/pricing/ — retrieved 2026-07-29.
38. Inspect Point, Pricing — https://www.inspectpoint.com/pricing — retrieved 2026-07-29.

**Secondary / press**
39. Investing.com, "APi Group Q4 2025 slides: earnings beat, margins hit record highs" — https://www.investing.com/news/company-news/api-group-q4-2025-slides-earnings-beat-margins-hit-record-highs-93CH-4524826 — **2026-02-25**. (Source of the 54% ISM figure — `Press-derived`.)
40. Speedwell Research, "APi Group: 2Q25 Business Update" — https://www.speedwellmemos.com/p/api-group-2q25-business-update — **2025-08-01**. (Source of the $1 inspection → $3–4 service pull-through ratio — `Press-derived`.)

**Parallel-stream files relied on for cross-reference (not re-derived here)**
41. `/root/fire-safety/research/01-government-sizing.md` — 2022 Economic Census container totals for NAICS 238220/238210/561621/811310/561990; establishment size bands; Local 669 DOL LM membership figure; CSLB Industry Bulletin 24-02.
42. `/root/fire-safety/research/02-codes-and-mandate.md` — NFPA 25/72/10 inspection cadence; Iowa RME requirement; Washington RCW 18.160 / NICET ASSL Level III link; the 11-scheduled-site-events-per-year derivation.
43. `/root/fire-safety/research/04-consolidators-b.md` — SDM 100 RMR figures; Everon/ADT B2B multifamily transaction and the Don Young attrition quote.

---

# ## What I could not verify

**Method constraint that caused most of these gaps:** the session's WebSearch quota (200 calls) was exhausted before this stream's research began in earnest, and bash outbound network was fully proxy-blocked. Every source above was reached by constructing a URL directly. Where I could not guess a URL, the line of enquiry ended. That is the honest cause of most of the following.

1. **Route density — stops per technician per day, drive time as a share of the day, minimum viable metro density.** **No figure from any named company, filing, survey or association was obtained.** Searched/attempted: NAFED (nafed.org), ServiceTrade blog and reports index, ServiceTrade Fire & Life Safety Benchmark Report landing page, ServiceTrade 2026 Technician Insights Report landing page, Cintas 10-K (routes disclosed company-wide but not by segment and not with stops-per-day), BuildOps, Inspect Point. **The section is built entirely from derived proxies (Cintas revenue per route, ORR sites per branch, Pye-Barker team members per location) and says so.** This is the largest hole in the brief.

2. **A survey-based or association-based EBITDA benchmark for small independent fire-protection contractors.** Attempted: Capstone Partners insights index and two guessed article slugs (404); CFMA Financial Benchmarker (404); AFSA About page (no benchmark); NFSA (no benchmark); NAFED (no benchmark); Sica|Fletcher index and market-intelligence pages (the firm has pivoted to insurance brokerage and its published multiples are insurance, not alarm/fire); Barnes Associates (no published statistics on the public site). **The Tier C section therefore reports a Census-derived cost-structure ceiling and explicitly refuses to call it EBITDA.**

3. **ITM agreement contract length, renewal rate and attrition for the fire-protection contracting sub-vertical.** No US operator discloses one. Attempted: APi 10-K and earnings release (full text), Cintas 10-K, JCI 10-K, Pye-Barker terms pages (404), Summit Companies terms page (404), Everon about page (404). **No ITM renewal or attrition rate is asserted in this document.**

4. **NICET certification-holder counts, nationally or by state or by discipline.** NICET publishes none on its public site. The third-party state-by-state index dated *"Data as of July 1, 2024"* (firecertacademy.com) returned only metadata — its numeric body did not render, replicating parallel stream 01's failure. **No NICET count is asserted.** The only certified-headcount datum in this document is ORR Protection's self-reported 42 NICET / 4 NAFED associates.

5. **Sprinkler-fitter apprenticeship length and hours, union and open-shop.** Local 669's site references a JATC governing all training but states no program length or hour requirement; the sprinklerfitters669.org apprenticeship sub-page 404'd; sprinklerfittersjatc.org did not resolve; ua.org's Local 669 page was robots-blocked; AFSA's apprenticeship page returned HTTP 403. **No apprenticeship length is asserted.**

6. **BLS OEWS May 2024 and May 2025 full percentile tables for 49-2098 and 47-2152.** BLS discontinued per-occupation static HTML profiles after the May 2023 vintage; the May 2024 and May 2025 equivalents redirect to the OEWS homepage, the national tables page returns structure without data rows, the ocwage.t01 news-release table truncated before the installation/maintenance block, and the .xlsx bulk files sit on a host that the proxy blocks for direct download. **Only the median wage is carried for the 2025 vintage, via O\*NET's restatement of BLS data.** Mean, percentile and RSE figures for May 2024/2025 are not asserted.

7. **A primary-source confirmation of APi's 54% ISM share of FY2025 revenue.** APi's 10-K and its Q4 2025 earnings release were both retrieved in full and neither states a percentage; the figure originates in a third-party summary of a slide deck I could not retrieve. It is labelled `Press-derived` throughout and the `Disclosed` 60%+ 2028 target is offered as the figure to underwrite.

8. **Segment-level or technician-level headcount for any fire-protection contracting platform.** APi (29,000), Pye-Barker (9,000+), Cintas (48,300) and JCI (87,000) all disclose totals only. **Every revenue-per-employee figure in §1 is therefore a total-headcount figure, and no revenue-per-technician figure is asserted for sub-verticals 1 or 3.** The only revenue-per-technician figure in this document is ADT's installation/product revenue per installation-and-service technician (sub-vertical 2), because ADT is the only filer that discloses a technician count.

9. **CertaSite FY2025 revenue of ≈$90M and ORR Protection revenue of $169M.** Both were supplied as parallel-stream anchors. certasite.com resolved to an unrelated company (Certa Tower Services) on every path tried, and ORR's own site discloses branches, sites and Fortune-100 penetration but no revenue. **Both are carried as `Unverified — parallel stream`, and the one derived figure that depends on the ORR number (revenue per site, D21) carries that flag.**

10. **Convergint headcount and revenue.** convergint.com/about-us states only *"thousands of colleagues"* and *"hundreds of Convergint Technology Centers worldwide"*; the our-story and newsroom sub-pages 404'd. **The parallel-stream anchor of 11,000+ employees is not confirmed here and no Convergint per-head figure is computed.**

11. **BRYCER / The Compliance Engine.** brycer.com failed to resolve through the fetch tool. **No pricing, jurisdiction count, contractor count or inspection-report throughput figure is asserted.** This matters because The Compliance Engine is the AHJ-side data layer that determines how enforceable an ITM obligation actually is in a given jurisdiction, and its absence is a real gap in the software-stack section.

12. **A fully-loaded technician cost (wage × burden × billable utilisation).** No source reached discloses a burden multiplier or a utilisation rate for fire-protection technicians. **Deliberately omitted rather than assumed** (D24).

13. **APi FY2024 headcount**, which would have allowed a revenue-per-employee trend rather than a point estimate. The FY2024 10-K accession returned by the EDGAR submissions API appeared malformed and was not chased further.
