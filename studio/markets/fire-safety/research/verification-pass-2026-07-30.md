# Verification pass — 2026-07-30

Primary-source verification of the load-bearing figures in
`markets/fire-safety/master.md` v1. Four parallel passes: government statistical
instruments, SEC filings and issuer disclosures, codes and municipal
instruments, and market/valuation publications.

Every figure below was checked by opening the issuing body's own document.
Verdicts: **CONFIRMED** · **DIFFERS** · **SCOPE PROBLEM** (value right, scope or
period misstated) · **UNREACHABLE** · **VENDOR CLAIM, UNCORROBORATED** ·
**PAYWALLED**.

**Retrieval constraint that qualifies this whole pass.** Direct HTTPS was
refused by egress policy (403 on CONNECT) for census.gov, api.census.gov,
eia.gov, bls.gov, dol.gov, nces.ed.gov, aha.org, kff.org, every SEC host,
data.sec.gov and the issuer IR CDNs. All retrieval therefore ran through a
fetch tool that converts documents to markdown via a summarising layer. That
layer was caught misassigning fields three times (reporting `EMP` values as
`ESTAB`, returning NAICS 238120 when asked for 238210, and returning fabricated
accession numbers from `data.sec.gov`). Mitigation: values were never placed in
a retrieval prompt, so the extractor could not echo them; every load-bearing
figure was re-queried blind and cross-checked against a second independent
document. Character-level fidelity of quotations cannot be certified.

---

## 1. What was wrong

Twelve findings that change the document. Ranked by consequence.

### 1.1 The only disclosed carve-out multiple in the sector was struck on the wrong denominator

**Was:** 11.2x on LTM Commercial Adjusted EBITDA of $158M.

ADT's own exhibit, twelve months ended 2023-06-30, prints both multiples and
both denominators:

> "Purchase Price (EV) $ 1,613"
> "Commercial Adjusted EBITDA $ 158"
> "Estimated allocation of corporate costs (14)"
> "Commercial Adjusted EBITDA including estimated corporate costs $ 144"
> "EV/Commercial Adjusted EBITDA 10.2x"
> "Impact from the estimated allocation of corporate costs 1x"
> "EV/Commercial Adjusted EBITDA including estimated corporate costs 11.2x"

So **11.2x = $1,613M ÷ $144M**, post-corporate-cost allocation. On $158M the
release itself prints **10.2x**. The master paired the higher multiple with the
higher earnings figure — a combination ADT never published, overstating the
sector's only disclosed carve-out multiple by a full turn.

The three value variants are not competing estimates. **$1,613M** is the
purchase price and the figure both multiples are struck on. **$1.6B** is the
rounded headline. **$1,563M is net cash proceeds** — "the portion of the $1,563
million net cash proceeds from the Commercial Divestiture" — and belongs nowhere
near a multiple.

Source: ADT Inc. 8-K EX-99.1, accession 0001193125-23-205548, 2023-08-08 —
https://www.sec.gov/Archives/edgar/data/1703056/000119312523205548/d531854dex991.htm
Pro forma variant: 8-K EX-99.2, accession 0001703056-23-000168, 2023-10-02 —
https://www.sec.gov/Archives/edgar/data/1703056/000170305623000168/commercialproforma-ex992.htm

### 1.2 Everon disclosed nothing — the discloser, the book and the date were all wrong

**Was:** "≈91% customer retention, ≈10-year customer life, ≈30% recurring share
(Everon investor deck, April 2022)."

The document is **ADT Inc.'s** "Business Overview and Financial Modeling", April
2022, covering all three ADT segments. The word Everon does not appear in it.
The figures are ADT's **Commercial segment** — blended commercial security plus
fire and life safety — with the defining footnotes:

> "All metrics as of 12/31/2021"
> "Approximate average Customer Life is based on trailing twelve month attrition as of 12/31/2021."

Deck p.10, Commercial "Key Unit Economics": "~91% customer retention". Deck p.9
segment table, Commercial column: "Customer Life ~10 years"; "Recurring Revenue
(as a % of Segment Total Revenue) ~30%". The same table gives the consumer
segment "~87%" / "~8 years" / "~90%".

**Everon did not exist in April 2022.** ADT Commercial announced the rebrand at
the GTCR close: "ADT Commercial … announced today that it will move forward as a
standalone organization and rebrand as Everon", dateline BOCA RATON FL,
2023-10-02. The master's separate claim of a January 2024 rebrand is wrong by
about three months.

Source: ADT Inc. investor materials, April 2022 —
https://s201.q4cdn.com/833622905/files/doc_downloads/featured_materials_docs/ADT-Business-Overview-and-Financial-Modeling-April-2022.pdf
Rebrand: https://www.everonsolutions.com/insights/newsroom/press-release/adt-commercial-establishes-standalone-organization-rebrands-company
Close: GTCR, 2023-10-02 — https://www.prnewswire.com/news-releases/gtcr-completes-acquisition-of-adts-commercial-fire-and-security-segment-301944792.html

### 1.3 Maryland did not delete its high-rise retrofit requirement — it re-timed it

**Was:** "Recent amendments … have eliminated the requirement to retrofit
existing high-rise residential buildings with automatic fire sprinkler systems",
carried from a trade-association statement dated 2025-07-10.

Maryland's own regulation, effective 2025-06-23, retains the mandate and changes
its clock. Two amendments do it:

> COMAR 29.06.01.07 **LLL**: "Amend Paragraph 31.3.5.9.1 to replace 'by January 1, 2033' with 'within 12 years of the date of the original violation notice issued by the fire authority having jurisdiction.'"

> COMAR 29.06.01.08 **BBB**: "Delete Subparagraph 13.3.2.24.2 and replace with the following: 13.3.2.24.2 * Existing high-rise buildings, other than those meeting 13.3.2.24.2.1 or 13.3.2.24.2.2, shall be protected throughout by an approved automatic sprinkler system…"
> "13.3.2.24.2.5 * The entire building shall be required to be protected by an approved automatic sprinkler system within 12 years of the date of the original violation notice issued by the fire authority having jurisdiction."

The replacement text also imposes a 180-day intent-to-comply filing and
mandatory signage reading "WARNING: THIS HIGH-RISE BUILDING IS NOT PROTECTED
THROUGHOUT WITH AN AUTOMATIC FIRE SPRINKLER SYSTEM".

Maryland's own record contradicts the deletion framing. The State Fire
Prevention Commission's FY2025 report: "The Commission continues to believe that
unsprinklered residential high-rise buildings are an inimical hazard to both
occupants and firefighters and it will continue to pursue options to have fire
sprinkler systems installed."

**The correct finding is different, and more interesting than deletion.** The
compliance clock no longer runs from a statutory date; it runs from an authority
having jurisdiction issuing a violation notice. No clock starts until an AHJ
acts. That defers the obligation indefinitely without removing it — which is a
statement about enforcement capacity, not about the mandate.

Source: COMAR 29.06.01.07 — https://regs.maryland.gov/us/md/exec/comar/29.06.01.07
COMAR 29.06.01.08, marked "[Effective 6/23/2025]" — https://www.law.cornell.edu/regulations/maryland/Md-Code-Regs-29.06.01.08

### 1.4 Marsh does isolate a US property rate

**Was:** "The US composite declined, though the index does not isolate a US
property percentage."

Marsh's own release does isolate it:

> "double-digit decreases were recorded in five regions: IMEA (19%); Pacific (15%); LAC (14%); the US (13%); and the UK (11%)"

**US commercial property rates fell 13% in Q2 2026.** Also confirmed verbatim:

> "Property rates declined by 12% globally, following 9% decreases in Q1 2026 and Q4 2025"
> "Casualty rates increased 2% globally, down from a 3% increase in Q1"

A separate caution on the regional set: Canada −7%, Pacific −13%, UK −8%, Europe
−6% and IMEA −16% are Marsh's **composite** all-lines regional rates, not
property. Marsh's property regionals are materially larger. The master does not
carry the composite set; the research file labels them correctly.

Source: Marsh, Global Insurance Market Index Q2 2026, 2026-07-22 —
https://corporate.marsh.com/news-events/2026/july/global-commercial-insurance-falls-6-percent-q2-2026.html

### 1.5 The commercial building survey does measure a fire-adjacent retrofit

**Was:** no source measures fire retrofit activity; the survey asks nothing
about sprinkler retrofit.

CBECS 2018 publishes a renovation category **"Fire, safety, or security
upgrade"**: 19,985 million square feet of floorspace (Table B10) and 570
thousand buildings (Table B6).

The defensible claim is narrower, and it is the same fusion problem that defeats
the other instruments: CBECS has **no sprinkler-specific question and no
equipment-presence question**, and its one fire-adjacent variable is a retrofit
indicator **fused with safety and security**. The sprinklered share of the stock
remains unestablished.

Source: EIA CBECS 2018 Table B10 — https://www.eia.gov/consumption/commercial/data/2018/bc/html/b10.php
Table B6 — https://www.eia.gov/consumption/commercial/data/2018/bc/html/b6.php

### 1.6 The one clean fire-specific figure measures work, not contractors

**Value CONFIRMED exactly.** `RCPTOT` = `12018607` for `CONKB` `8221` "Building
sprinkler system installation contractor", NAICS2022 23, GEO_ID 0100000US, year
2022; at NAICS 238 = `12014511`. The distinct lawn-sprinkler code `8222` =
`1776660` is confirmed. `RCPTOT` label: "Sales, value of shipments, or revenue
($1,000)". The dataset variable list contains **no `ESTAB`**.

**But `CONKB` is not an establishment classification.** Item 23 of the 2022
construction questionnaire asks respondents to "report the percent of the total
represented by the following construction and non-construction business
activities. The sum of these percentages should equal 100%." So $12,018,607
thousand is the **value of building-sprinkler-installation work allocated across
all sector-23 establishments** — not the revenue of establishments classified as
sprinkler contractors. The presence of total codes (`001`, `6000`, `8000`,
`9900`) in the code list corroborates this, and it explains the absence of any
establishment count: establishments are never assigned to a `CONKB` code.

Consequence: any derivation of implied establishment counts from this revenue
line rests on a category error, not merely a heavy caveat.

The fire-and-security fusion in `CONKB` `8212` is confirmed from the code's own
label — "Fire and security systems installation and service contractor", one
code — and the full 96-code list contains **no fire-only alarm code and no
extinguisher or kitchen-suppression code**.

Source: EC2223KOB via https://data.census.gov/api/access/data/table?id=ECNKOB2022.EC2223KOB&g=010XX00US&y=2022
Variable list — https://api.census.gov/data/2022/ecnkob/variables.html
Questionnaire CC-23820 Item 23 — https://bhs.econ.census.gov/ombpdfs2022/export/2022_CC-23820_mu.pdf

### 1.7 The size bands are entire-year establishments, not firms

Digits all confirmed: 238220 under 5 employees = `49926`, 500 or more = `95`;
238210 under 5 = `35717`, 500 or more = `130`. Variable is `ESTAB`; the table
publishes **no receipts** by size band.

Two scope errors. The dimension `EMPSZFE` is labelled "Employment size of
**establishments** code", not firm. And every band is restricted to
establishments **operated the entire year** — the exact labels are
"Establishments operated entire year with less than 5 employees" and "…with 500
employees or more". `EMPSZFE` carries separate codes for `001` "All
establishments", `100` "Establishments operated for the entire year" and `500`
"Establishments not operated for the entire year". So the bands do not sum to
the 114,427 total, and any share computed against all establishments is
understated by the part-year population.

Source: EC2223LOCCONS — https://data.census.gov/api/access/data/table?id=ECNLOCCONS2022.EC2223LOCCONS&g=010XX00US&y=2022
Variables — https://api.census.gov/data/2022/ecnloccons/variables.html

### 1.8 The single-sprinkler statistic is a conditional share, relabelled twice

**Was:** "77% of fires controlled by a single sprinkler head."

NFPA's own words:

> "In 77 percent of the structure fires where sprinklers operated, only one operated. In 97 percent, five or fewer operated. In 99 percent, 10 or fewer operated."

The denominator is fires **where sprinklers operated**, and the predicate is
"only one operated" — not "controlled by". Two shifts in one sentence.

Source: Ahrens, *US Experience with Sprinklers*, NFPA, October 2021.

### 1.9 A management estimate was carried as a measured ratio, and its exclusion matters

The pull-through ratio is confirmed on APi's own record, both legs. Investor Day
p.19: "$3 – $4 of incremental service work generated annually for every $1 of
inspection work(1)". Q4 2025 call, Becker: "we generate someplace between $3 and
$4 worth of service work for every dollar of inspection revenue that we
generate."

**The footnote the master did not carry is the important part:**

> "(1) Based on leadership estimate for U.S. inspection revenues, excludes purely route based service revenues (primarily portable fire extinguishers)."

So the sector's most load-bearing operating claim is a leadership estimate,
US-only, **with the portable-extinguisher route book carved out** — which is
precisely the sub-vertical the master reaches for when it discusses route
economics. APi's 10-K declines to quantify the ratio at all: "our go-to-market
strategy in life safety is inspection-first, because we estimate that every
dollar sold can lead to subsequent service work."

Note also the call version omits "annually".

Source: APi Group Investor Day, 2025-05-21, p.19 —
https://s201.q4cdn.com/155847588/files/doc_presentations/2025/May/21/APG-Investor-Day-FINAL.pdf

### 1.10 The bolt-on ceiling is in an investor deck, not a filing

"Weighted Average Adjusted EBITDA Multiple for Bolt-on Acquisitions <6x in Each
Year", with footnote "(1) Excludes SKG in 2020, Chubb in 2022, Elevated in 2024
and customer account purchases", across columns 2019 through 2024.

Two confirmations that matter. It is a **bound on a weighted average**, printed
as "<6x in Each Year", not a point estimate. And **no per-year multiple is
disclosed** — the deck gives only per-year deal counts (3, 7, 12, 1, 7, 12) and
aggregate purchase prices ($9M, $42M, $114M, $5M, $98M, $250M). EDGAR full-text
search returns **zero** hits for "6x" or "under 6x" across every APi filing, so
this is an investor-relations disclosure and must be cited as one.

Source: APi Group Investor Day, 2025-05-21, p.45 — same URL as 1.9.

### 1.11 GF Data does publish a specialty-trade breakout

**Was:** "GF Data carries no fire, construction-services or specialty-trade
category."

True of the edition consulted, which pools all industries into eight buckets —
Manufacturing, Business Services, Healthcare Services, Retail, Distribution,
Media & Telecom, Technology, Other. But GF Data's own products document carries
a valuation table headed **"Specialty Trade Contractors—NAICS Code: 238"** — the
NAICS family containing fire sprinkler and fire alarm contracting — alongside
"GF Data Quarterly Industry Drilldown Reports". The 2024 predecessor carries the
same construction for NAICS 524.

The defensible statement is narrower: the edition consulted pools all industries
into eight buckets, none of them fire or specialty trade, and GF Data separately
publishes NAICS-level breakouts including Specialty Trade Contractors (NAICS
238), which was not obtained. **If that report carries the size bands, the claim
that no benchmark closer than all-industries exists is wrong.** This is the one
open item that could move a conclusion.

All GF Data figures in the master are confirmed verbatim: "10–25 … 6.4 (YTD
2025) … 5.9 (Total) … 2084"; "Total … 7.3 … 5669"; "3–5 … 6.7 … 1503"; ">10 …
8.3 … 1238". Population: "More than 330 North American private equity
firms—including funded and independent sponsors, family offices and mezzanine
firms"; "private-equity backed deals valued between $10 million and $500
million"; "from 2021 through the third quarter of 2025".

Source: GF Data, *Middle-Market M&A ESOP Advisor Special Report*, Q3 2025 —
https://gfdata.com/wp-content/uploads/Q3-25_GFData_ESOP_Report.pdf
Products document — https://middlemarketgrowth.org/wp-content/uploads/2025/04/GF-Data-4th-Quarter-Highlights-and-Products.pdf

### 1.12 Meridian's transaction count and margin list were both short

The sector-dedicated update is confirmed, and so is the absence of values: both
editions carry columns "Date | Target | Acquirer / Investor | Target
Description", no value column, no dollar figure in any cell, and no multiple
anywhere. Counts: **73** transactions in the Winter 2025 edition and **60** in
Summer 2025 — **133**, not "110+".

The margin list omits one band Meridian publishes:

> "Test & Inspection (T&I): 50%+; Repair & Maintenance (R&M): 40% - 50%; **Monitoring: 50%+**; New Construction: 25% - 35%; Retrofit: 35% - 45%+"

And the tempo figure is edition-specific: "an average of 38 transactions
announced per quarter since 2020" is the Winter edition, while Summer 2025 says
"an average of nearly 50 transactions per quarter since the beginning of 2024".
Quoting 38 as the current tempo understates it by about a quarter.

Source: Meridian Capital, *Fire & Life Safety M&A Market Update*, Winter 2025 —
https://www.meridianib.com/wp-content/uploads/Fire-Life-Safety-Services-MA-Market-Update_vF.pdf

---

## 2. Wording that overstated what the source says

Seven items where the figure is right and the sentence is not.

| Item | Master says | Source says | Fix |
|---|---|---|---|
| CMS extensions | "CMS does not have authority to allow extensions" | "CMS does not have authority to allow extensions **of the August 13, 2013 deadline**." | Restore the object. A bounded statement was rendered as a standing rule. |
| CMS scope and severity | cited at D, E or F minimum | "Sprinkler deficiencies will **usually** be cited at the 'potential for harm' scope and severity (S/S) level of D, E, or F, at a minimum." | Restore "usually". |
| Cintas segment scope | the Fire Protection Services line spans extinguishers, sprinkler systems and alarm testing, i.e. all three sub-verticals | Cintas **never defines** the line. The phrase comes from a company-wide sentence that also lists "uniforms, mats, mops, shop towels, restroom supplies, workplace water services, first aid and safety products, eye-wash stations, safety training". | Present as a reasonable inference that cannot be cited to Cintas. The filing gives no basis for allocating $817,463 thousand across the three. |
| APi ISM mix | 40% (2021) to 54% (2025) | Accurate as what Becker said; appears in **no** APi document. The issuer's own written figure is a forecast: "~40%" (2021) → "~55%" (2025F). No ISM-versus-project split exists anywhere in the financial statements. | Label as an unaudited management metric asserted orally. |
| CertaSite revenue | ≈$90M FY2025 revenue | "CertaSite is expected to deliver full year 2025 revenue of approximately $90 million" — an expectation stated by the acquirer at announcement. Consideration transferred was **$271M**. | Label as an expectation, and carry the consideration. |
| Altas ownership | "Altas retained majority" | "LGP invested significant new capital into the Company while **Altas retained the majority of its ownership interest**." | The majority of its own stake, not majority control of the company. |
| Pye-Barker 57 vs 41 | "both stand, on different cut-offs and counting rules" | Neither publisher states a cut-off date or a counting rule. | "Both stand; the source of the 16-deal difference is not established in either publication." |

Two further precision notes. **Breakwater's 7x–10x should be labelled an
EBITDA ceiling** — the same page's largest figure is "35x to 45x MRR", a
different denominator, and a reader checking it will otherwise think the master
missed a 45x. **The extinguisher siting table is the Class A table of one
state**: Cal. Code Regs. tit. 19, § 568 is titled "Fire Extinguisher Size and
Placement for Class A Hazards", with Classes B and C in §§ 569–571. Extrapolating
it to a national all-hazard-class installed base is a wider claim than the
instrument supports.

---

## 3. Confirmed exactly as written

**Government instruments.** `CONKB` 8221 = `12018607` and 8222 = `1776660`
(values; see 1.6 for scope). `CONKB` 8212 = `18514295`, fire fused with security
in the code's own label. NAICS 561621 `RCPTOT` = `31313513`, `ESTAB` = `7462`;
group 56162 publishes only 561621 and 561622 "Locksmiths", so no fire/burglar
split is published. Container receipts and establishments, all eight figures:
238220 `297608835` / `114427`; 238210 `249247389` / `81249`; 811310 `54640745` /
`23925`; 561990 `29678192` / `12269`. Restaurant establishments 722511 =
`254201`, 722513 = `271243`, 722514 = `4590`. Public schools **99,297** (NCES
CCD Table 2, SY 2023-24). Private schools **30,492** (NCES Digest dt22_105.50,
SY 2019-20). Hospitals **6,100** ("There are 6,100 hospitals in the United
States… from the 2024 AHA Annual Survey"). Nursing facilities **14,742** —
confirmed as a KFF figure, source line "KFF analysis of Nursing Home Compare",
not a CMS-published total. CBECS 2018: **5,918** thousand buildings, **96,423**
million sq ft; renovation floorspace 45,165 / 43,832 / 7,426 and 29,098 /
27,575 / 20,862, which sum-check to the floorspace total.

**Issuer disclosures.** APi FY2025 net revenues **$7,911M**, and the
aggregator's "approximately $7.0 billion" is confirmed as APi's **FY2024**
figure ($7,018M) mislabelled. CertaSite closed 2026-02-02, consideration $271M.
Onyx-Fire "approximately $190 million in annual revenue", "in Canada", closed
2026-06-08. WTech "approximately $175 million in annual revenue", "across
Europe", closed 2026-07-01. The FY2025 EX-21 omits Western States Fire
Protection Company, Grunau Company, Delta Fire Systems, Landmark Sprinkler and
Olsen Fire Protection, all five present in the 2020 S-4 exhibit, with no
"significant subsidiaries only" limiting note; exhibit row counts are
approximate (repeat reads returned 136 and 137). Cintas Fire Protection Services
**$817,463** / **$728,610** / **$627,747** against total revenue **$10,340,181**
thousand, fire share 7.90% / 7.60% / 7.10%; fire sits inside "All Other";
"The primary markets served by each of the Cintas operating segments are local
in nature and highly fragmented" — note this covers each segment collectively,
not fire specifically; "businesses may decide to perform certain services
in-house instead of outsourcing these services". No fire market size, share,
route count, customer count or facility count is disclosed.

**Codes and municipal.** Rockville, all three figures verbatim, including that
the city does state 90%. 42 CFR 482.41(b)(1)(i) with TIA 12-1 through 12-4 and
NFPA 101 "2012 edition, issued August 11, 2011". 42 CFR 483.90(a)(6)(i) sprinkler
by "August 13, 2013" per "the 1999 edition of NFPA 13"; (a)(6)(ii) ITM per "the
1998 edition of NFPA 25"; (a)(8) evacuation or fire watch when shut down "for
more than 10 hours". CMS DPNA at three months and termination at six. NFPA
sprinkler data: present in 10% of structure fires, operated in 92% and effective
in 96% of those, civilian death rate 89% lower, average overall loss 11% lower
with health care 73%, stores or offices 70%, public assembly 63% and homes 62% —
and the inversion, quoted in full: "The average loss per fire was higher in
sprinklered warehouses and manufacturing properties than in those with no AES."
NYC FC 901.6 and Table 901.6.1 routing all four system classes as stated. IFC
2024 from ICC's own Digital Codes. Cal. Code Regs. tit. 19 § 568 Table 2 values,
including 11,250 sq ft in all three columns.

**Market and valuation.** Every GF Data figure. Marsh property −12% Q2 2026
after −9% in each of the two prior quarters, casualty +2%. CIAB all-accounts
−1.2%, large −2.7%, medium −1.9%, small **+1.1%**. Summit: "BDT & MSD Partners …
has entered into a definitive agreement to acquire a majority stake" from
BlackRock LTPC, "SFP Holding, Inc. ("Summit Companies")", terms not disclosed,
2025-08-04 — an **announcement**, not a confirmed completion. Pye-Barker 57
acquisitions in 2025 (SDM, 2026-03-17) and 41 (Capstone, 2026-02-02). GTCR
closed the ADT Commercial purchase 2023-10-02.

---

## 4. The 17x–20x chain — every link holds

The master's central valuation finding survives adversarial checking, on the
publishers' own words.

**Origin.** SDM Magazine, 2024-07-15, relaying PE Hub: "The joint PE sponsors
**could receive bids** valuing the company at 17x to 20x its $350 million
EBITDA, resulting in a potential deal value exceeding $6 billion, according to
PE Hub, **citing unnamed sources**." And: "When contacted by *SDM*, a Pye-Barker
spokesperson **declined to comment** on the report." The article describes a
prospective marketing process, not a sale. Two qualifiers the master should add:
PE Hub was itself citing unnamed sources, and the verb is conditional.

**What actually happened.** 2025-01-10: ADIA and GIC "have completed the
acquisition of **minority** stakes in Pye-Barker"; "Financial terms were not
disclosed." No change of control, no clearing price.

**Capstone.** "Deal multiples have displayed relative health and resilience
since 2021, averaging a robust EV/EBITDA multiple of **11.8x** and EV/Revenue
multiple of 2.2x over the five-year period." Fire & Life Safety appears only as
a segment name, never broken out. The only other multiples on the page are 2.2x
and one deal at 0.9x EV/Revenue. **17x and 20x appear nowhere.**

**Breakwater.** Top tier of a five-rung EBITDA ladder: "Platform-ready (high
RMR, low attrition, scalable ops)" at "**7x to 10x**", over 3x–4x, 4x–5x,
5x–6.5x and 6x–8x. **17x and 20x appear nowhere.**

**The laundering.** ctacquisitions.com, last modified 2026-07-11: "scaled
platforms transacting as high as **17x-20x**", sourced to "Breakwater M&A Fire
Alarm & Life Safety Valuation Multiples 2026; Capstone Partners Security
Solutions M&A Update" — neither of which contains it. Both cited documents were
opened and every "x" on each page enumerated.

**The re-citation.** Zeus Fire and Security, 2026-07-15: "Scaled platforms with
strong recurring revenue are transacting at **17x to 20x EBITDA**", footnoting
CT Acquisitions. A second break in the chain of custody: Zeus dates the guide
"May 2026" while the guide's own stamp is 2026-07-11.

One assertion, counted four times.

Sources: https://www.sdmmag.com/articles/103337-pye-barker-could-be-eyeing-6b-market-listing-this-year-report-says
https://www.prnewswire.com/news-releases/pye-barker-fire--safety-announces-minority-investments-from-adia-and-gic-to-fuel-new-growth-302347964.html
https://www.capstonepartners.com/insights/article-security-ma-update/
https://www.breakwaterma.com/blog/fire-alarm-life-safety-company-valuation-multiples-2026
https://www.ctacquisitions.com/guides/private-equity-fire-life-safety-2026/
https://www.zeusfireandsecurity.com/resources/fire-and-security-mergers-and-acquisitions-trends

---

## 5. Unverified after this pass — do not treat as sourced

- **Road Sprinkler Fitters Local 669 membership, 16,631, 2025 filing.** The DOL
  OLMS disclosure room is a single-page application serving no data in HTML; the
  legacy report viewer needs a known report ID, and the search is POST-only. The
  LM-2 was never opened. The union's own site states "Local 669 is over 17,000
  members strong throughout the United States." Either open the filing or carry
  the figure explicitly as a third-party republication of a DOL filing.
- **SOC 49-2098 employment 85,900 (2024) and 9,400 projected annual openings.**
  Every BLS host returned 403 or resolved to a program homepage; the projections
  table is available only as a binary workbook. The figures trace to O\*NET
  attributing BLS — the laundered-citation shape. The occupation title is
  confirmed as "Security and Fire Alarm Systems Installers", so the
  fire-and-security fusion holds. The pairing of a 2024 employment level with
  projected annual openings indicates the Employment Projections program rather
  than the wage survey, so 2024 would be a projections base year.
- **NFPA current editions for 25, 72, 96, 10 and 855.** Every nfpa.org page
  returns metadata and navigation only. IFC 2024 is confirmed; the five NFPA
  editions are not. The one hard datum found is that NFPA's own TIA file is
  headed "NFPA 25-P2026 Edition", a *proposed* edition with a comment close of
  2025-09-17 — which establishes that the 2026 designation exists, not that it
  is the issued current edition.
- **CMS's own nursing-facility total.** 14,742 is KFF's count from Nursing Home
  Compare; the CMS file itself was not opened.
- **NAICS 2022 prose definitions.** The manual truncates before sector 56, the
  detail pages are JavaScript shells, and the descriptions workbook is binary.
  The fire/burglar fusion claims rest on published table structure rather than
  on definition text.
- **The no-S-1 claim is supported, not established.** EDGAR full-text search
  covers 2001 onward and foreign issuers register on F-1, so a universal
  negative cannot be proven by search. One counterexample surfaced and is not a
  services company: China Yuan Hong Fire Control Group Holdings Ltd, CIK
  1497652, SIC 3569, a Chinese fire-equipment manufacturer, S-1 plus five
  amendments, 2010-08-13 onward.
- **Rockville's internal arithmetic.** The city states 90% while 1,933 ÷ 2,083 =
  92.80%, and an earlier city release (2022-11-01) reports the same 90% against a
  completely different denominator of 656 premises — which suggests the
  percentage may be carried forward rather than recomputed. Cite it as the city's
  stated figure, not as a derived rate.
- **The Burlington and false-alarm figures are vendor claims with no
  corroboration.** "Burlington is actively tracking 686 systems, with 89% in full
  compliance" and "32% of false alarms are caused by systems that are not
  compliant with inspection, testing, and maintenance requirements" appear on the
  vendor's own undated site and nowhere else located. The 32% carries no study,
  author, date, methodology or jurisdiction. Note also that the same vendor
  carries Rockville as a customer testimonial, so the two jurisdictions are not
  independent evidence of the vendor's effect.
- **Exact EX-21 row counts** (136 versus 137 on repeat reads; 92 for the 2020
  S-4 from a single read). The present/absent finding for the five named entities
  is solid on two independent methods; the counts are not.
- **The CIAB quotation.** The composed sentence "survey respondents reported an
  average decrease in premiums across all account sizes, at −1.2% — a decisive
  sign of a softened market" is stitched from two separate CIAB clauses, and the
  inserted phrase contradicts CIAB's own small-account figure of +1.1%. CIAB's
  text is "for the first time since Q3 2017, survey respondents reported an
  average decrease in premiums" and, separately, "a decisive sign of a softened
  market". Quote only the short fragment.
- **NYC FC 901.6.2.1 and 901.6.3 exact wording.** Substance confirmed;
  quotations came back as paraphrase. On 901.6.2.1 the posted item near the main
  water supply control valve appears to be an approved **card** showing
  inspection dates and the certificate-of-fitness holder's signature, with the
  monthly detailed report a separate document to be completed — narrower than
  "monthly reports posted". Re-check against printed text before relying on it.
- **The GF Data specialty-trade report** (see 1.11). The single highest-value
  open item, because it could overturn a conclusion.

---

## 6. Method note

Four passes ran in parallel, each restricted to a source family and each
instructed to prefer the issuing body, to report unreachability rather than
substitute, and never to repair a broken figure with a second unsourced one.
Two passes independently reported the same extraction-layer unreliability, and
both adopted the same mitigation of value-free prompting plus second-document
cross-checks.

**What this pass did not do.** It did not verify the consolidator register at
brand level — roughly 490 company-page and subsidiary-exhibit URLs in the
research corpus feed the target screen rather than the master, and those belong
with `screen/consolidators.md`. It did not attempt the regional or metro
coverage claims, which rest on company location pages rather than on primary
instruments. And it did not re-verify figures that appear only in Derivations.
