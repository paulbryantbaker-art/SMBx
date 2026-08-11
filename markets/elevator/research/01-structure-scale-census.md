<!-- run: 01 | hunt: B | date: 2026-08-11
     query: NAICS 238290 "Other Building Equipment Contractors" definition elevator escalator installation; 2022 Economic Census NAICS 238290 receipts establishments employment EC2223BASIC; "238290" 2022 economic census construction "value of construction work" establishments Census Bureau table; BLS OEWS "47-4021" "Elevator and Escalator Installers and Repairers" employment May 2024 national estimates; National Elevator Industry Inc NEII number of elevators escalators in United States installed base; "1 million elevators" OR "1.03 million elevators" United States source NEII fact sheet 2024 escalators 35000; Elevator Escalator Safety Foundation statistics "900,000 elevators" OR "35,000 escalators" United States origin; Otis investor day installed base elevators units North America Americas service portfolio units 2025; Otis 10-K 2025 "maintenance portfolio" units Americas segment net sales service new equipment; "OTIS REPORTS FOURTH QUARTER AND FULL YEAR 2025 RESULTS" Americas segment net sales maintenance portfolio units growth; Elevator World "number of elevators" United States installed base statistics escalators count survey; US elevator escalator market size 2024 2025 billion Grand View Research Mordor IBISWorld service maintenance modernization; IBISWorld "Elevator Installation" service industry United States market size revenue businesses 2025; KONE annual report 2025 "installed base" million units elevators escalators global maintenance base modernization market; "average age" elevators United States installed base "20 years" OR "25 years" modernization percentage older than; state elevator inspection program number of registered elevators conveyances California Washington New York annual report
     tool: web search + fetch -->

# Pass 1 — Structure and Scale: US Elevator & Escalator
## Research source file. Not a synthesis. Figures as published.

---

## 0. How to read this file

**Basis labels used on every figure:**

| Label | Meaning |
|---|---|
| `Disclosed` | Regulator, Census/BLS published table, or company SEC filing / audited annual report |
| `Press-derived` | Trade press or company press release reporting a number (including a company reporting its own number outside a filing) |
| `Estimated` | A vendor's model, an association's compilation with no method, or my own arithmetic — arithmetic is shown |

**A note on retrieval method, because it matters for trust.** Every Census figure below was pulled from the keyless `data.census.gov/api/access/data/table` endpoint, which returns a JSON array-of-arrays. The header row and the data row were transcribed verbatim and then **zipped positionally in local Python**, not read off by eye or by a summariser. The 238290 alignment was independently validated by an accounting identity in the data itself:

```
RCPCWRK (41,542,433) − CSTSCNT (1,765,919) = RCPNCW (39,776,514)   ✓ exact
```

That identity would not hold under a column misalignment. Two earlier attempts to have a model read the values out of the JSON directly returned **different and wrong** answers (one gave ESTAB = 105,477, which is actually EMPQ1CW). Those were discarded. Where a source could not be verified this way, it is flagged.

**Hosts that were unreachable from this container** (these define several of the gaps in §A.5): `api.census.gov` (requires an API key), `www2.census.gov` (robots-disallowed to the fetch tool), `data.bls.gov` (robots-disallowed), `api.bls.gov` (robots-disallowed). `curl` egress was blocked at the gateway for `*.census.gov` entirely. All Census retrieval therefore ran through the one keyless endpoint above, which has a hard response-truncation limit — see §A.4.

---

# A. The NAICS container problem

## ⚠️ THE CONTAINER WARNING — read this before using any number in section A

**There is no NAICS code for the elevator and escalator industry.** Elevator and escalator installation, service and modernisation sits inside **NAICS 238290 — Other Building Equipment Contractors**, which is a residual "everything else" bucket in the specialty-trade sector.

**Every 238290 figure in this section is a CONTAINER figure, not an elevator figure.** The container's own employment data says elevator and escalator mechanics are roughly **one seventh** of it:

> **BLS OEWS, May 2022, NAICS 238290: total industry employment 148,470; SOC 47-4021 Elevator and Escalator Installers and Repairers 20,640 — 13.90% of industry employment.**
> **BLS OEWS, May 2023, NAICS 238290: total industry employment 153,170; SOC 47-4021 21,300 — 13.90% of industry employment.**

Anyone who quotes "the elevator industry has $42 billion of revenue and 7,725 establishments" from Census 238290 is quoting a bucket that is ~86% other trades by headcount. Do not do it, and flag anyone who does.

---

## A.1 What 238290 actually contains

**Official 2022 NAICS description** (OMB/Census NAICS 2022) — `Disclosed`:

> "This industry comprises establishments primarily engaged in installing or servicing building equipment (except electrical, plumbing, heating, cooling, or ventilation equipment)."
> — https://www.naics.com/naics-code-description/?code=238290 (quoting the NAICS manual)

The scope statement adds that the work performed "may include new work, additions, alterations, maintenance, and repairs," and the industry includes "repair and maintenance of miscellaneous building equipment."

**Illustrative examples and index entries listed under 238290** (the other trades folded in alongside elevator work). Sources: https://www.naics.com/naics-code-description/?code=238290 and https://naicslist.com/naics/238290 — `Disclosed` (index is published in the NAICS manual):

- Elevator installation and servicing
- Escalator installation
- Moving sidewalk installation
- Dumbwaiter installation
- **Boiler and pipe insulation / mechanical insulation contractors**
- **Water pipe insulation**
- Conveyor system installation
- **Machine rigging; millwright work; dismantling large-scale machinery**
- Automated and revolving door installation
- Commercial / overhead / garage door installation
- Automatic gate installation
- Lightning protection equipment and lightning rod installation
- Satellite dish and antenna installation
- Vacuum cleaning system (central vacuum) installation
- Service station gasoline pump installation
- ATM installation *(added in 2022 NAICS)*
- Power generation / generator equipment installation *(added in 2022 NAICS)*
- Commercial kitchen equipment installation
- Bowling alley equipment installation
- Church bell installation
- Hoisting apparatus installation
- Incinerator installation
- Pneumatic tube system installation
- Safe and vault installation
- Vehicle lift installation
- Vending machine installation

naicslist.com states the official index contains **47 classified activities** for this code, "consistent across NAICS 2007–2022 versions (with ATM and power generator installation added in 2022)." — `Disclosed`, though the count of 47 is that site's tally, not a Census statement.

**Cross-references (what is excluded):** manufacturers of industrial equipment that install incidentally → Sector 31-33 Manufacturing; commercial refrigeration and production-equipment repair → NAICS 811310; prefabricated window and door installation → NAICS 238350.

**Load-bearing implication for the buy-box:** the second-largest occupation in the container is not elevator-adjacent at all. In OEWS May 2022, **Insulation Workers, Mechanical (47-2132) numbered 14,810 in 238290** — 72% as many people as the elevator mechanics. Mechanical insulation is a separate consolidation story sharing the same NAICS code.

---

## A.2 2022 Economic Census — NAICS 238290

**Table ID: `EC2223BASIC` — "Construction: Summary Statistics for the U.S.: 2022"**
Dataset: `ECNBASIC2022`. Table list source: https://www.census.gov/data/tables/2022/econ/economic-census/naics-sector-23.html (page last revised December 4, 2025).
Table landing page: https://data.census.gov/table/ECNBASIC2022.EC2223BASIC?q=EC2223BASIC
Data retrieved from: https://data.census.gov/api/access/data/table?id=ECNBASIC2022.EC2223BASIC&g=010XX00US (GEO_ID `0100000US`, YEAR 2022, SECTOR 23, INDLEVEL 6)

All figures below are **as reported by the table**, in the table's own units. Dollar fields in the Economic Census construction tables are reported in **$1,000**. Basis: `Disclosed`.

| Field | Value as published | Reading |
|---|---|---|
| `NAICS2022` | 238290 | Other Building Equipment Contractors |
| `ESTAB` | **7,725** | establishments |
| `FIRM` | **6,611** | firms |
| `RCPTOT` | **42,421,304** | value of business done, $1,000 → **$42.421 billion** |
| `RCPCWRK` | **41,542,433** | value of construction work, $1,000 → $41.542bn |
| `CSTSCNT` | **1,765,919** | cost of construction work subcontracted out, $1,000 |
| `RCPNCW` | **39,776,514** | net value of construction work, $1,000 |
| `EMP` | **141,908** | employees |
| `EMPQ1CW` | **105,477** | construction workers, Q1 pay period |
| `PAYANN` | **11,853,912** | annual payroll, $1,000 → **$11.854 billion** |
| `PAYANCW` | **8,656,113** | annual payroll, construction workers, $1,000 |
| `PAYANOC` | **3,197,799** | annual payroll, other employees, $1,000 |
| `PAYQTR1` | **2,782,643** | Q1 payroll, $1,000 |
| `BENEFIT` | **4,084,001** | fringe benefits, $1,000 |
| `VALADD` | **30,343,545** | value added, $1,000 → $30.344bn |
| `CSTMPRT` | **9,606,101** | cost of materials, parts, supplies, $1,000 |
| `HOURS` | **224,645** | hours worked (thousands, per table convention) |
| `RPTOT` | **721,926** | total rental payments, $1,000 |

**Universe caveat, stated by the programme:** the Economic Census construction sector covers **establishments with paid employees**. Sole proprietors and other nonemployer businesses are outside it. There is a separate Nonemployer Statistics programme (see §A.5 — not retrieved).

### Sector context from the same table (Construction, NAICS 23, INDLEVEL 2) — `Disclosed`

| Field | Construction total, 2022 |
|---|---|
| `ESTAB` | 803,120 |
| `FIRM` | 785,917 |
| `RCPTOT` | 2,920,771,250 ($1,000) → $2.921 trillion |
| `EMP` | 7,485,385 |
| `PAYANN` | 529,751,969 ($1,000) → $529.75bn |

### Derived ratios — `Estimated` (my arithmetic on the Disclosed figures above)

- Employees per establishment, 238290: 141,908 ÷ 7,725 = **18.37** (Construction overall: 7,485,385 ÷ 803,120 = **9.32**). The container is roughly **twice as employee-dense as construction generally** — this matters in §A.4.
- Establishments per firm: 7,725 ÷ 6,611 = **1.169**
- Revenue per establishment: $42,421,304k ÷ 7,725 = **$5.491 million**
- Revenue per employee: $42,421,304k ÷ 141,908 = **$298.9 thousand**
- Average annual pay: $11,853,912k ÷ 141,908 = **$83,532**
- Value added as % of business done: 30,343,545 ÷ 42,421,304 = **71.5%**
- Construction-worker payroll as % of total payroll: 8,656,113 ÷ 11,853,912 = **73.0%**
- 238290 as share of the construction sector: **1.452% of receipts, 0.962% of establishments, 1.896% of employment**

---

## A.3 Quantifying the contamination

This is the most useful thing in Pass 1: BLS publishes occupation mix **inside** NAICS 238290, which lets us bound the elevator share of the container from the employment side.

### BLS OEWS, industry-specific estimates for NAICS 238290 — `Disclosed`

**May 2022** — https://www.bls.gov/oes/2022/may/naics5_238290.htm

| Occupation | Employment | % of industry employment | Hourly mean | Annual mean |
|---|---|---|---|---|
| All occupations (00-0000) | **148,470** | 100% | — | — |
| **Elevator and Escalator Installers and Repairers (47-4021)** | **20,640** | **13.90%** | **$46.64** | **$97,010** |
| Insulation Workers, Mechanical (47-2132) | 14,810 | — | — | — |
| First-Line Supervisors of Construction Trades (47-1011) | 7,790 | — | — | — |
| Construction Laborers (47-2061) | 5,970 | — | — | — |
| Office Clerks, General (43-9061) | 4,300 | — | — | — |
| Carpenters (47-2031) | 3,560 | — | — | — |
| Secretaries and Admin Assistants (43-6014) | 2,660 | — | — | — |
| *(major group)* Construction and Extraction (47-0000) | 68,240 | — | — | — |
| *(major group)* Installation, Maintenance, and Repair (49-0000) | 30,870 | — | — | — |

**May 2023** — https://www.bls.gov/oes/2023/may/naics5_238290.htm

| Occupation | Employment | % of industry employment | Hourly mean | Annual mean |
|---|---|---|---|---|
| All occupations | **153,170** | 100% | — | — |
| **Elevator and Escalator Installers and Repairers (47-4021)** | **21,300** | **13.90%** | **$49.24** | **$102,410** |
| Insulation Workers, Mechanical (47-2132) | 12,150 | 7.93% | $29.72 | $61,820 |

Check: 20,640 ÷ 148,470 = 13.902% ✓ and 21,300 ÷ 153,170 = 13.906% ✓ — the published percentages reconcile exactly.

### Cross-check on the occupation itself — `Disclosed`

**BLS Occupational Outlook Handbook, "Elevator and Escalator Installers and Repairers"** (page last modified **August 28, 2025**) — https://www.bls.gov/ooh/construction-and-extraction/elevator-installers-and-repairers.htm

- Number of jobs, **2024: 24,200** (all industries)
- 2024 median pay: **$106,580 per year / $51.24 per hour**
- Job outlook 2024–34: **5% (faster than average)**; employment change 2024–34: **+1,200**; projected 2034 employment **25,400**
- Employment by industry, 2024: **Building equipment contractors 84%**; Government (excl. state/local education and hospitals) 1%; Educational services (state, local and private) 1%
- Typical entry-level education: high school diploma or equivalent; on-the-job training: apprenticeship

### Two same-year employment counts that disagree — record both, do not average

| Source | Vintage | 238290 employment |
|---|---|---|
| 2022 Economic Census, `EC2223BASIC`, `EMP` | 2022 (annual) | **141,908** |
| BLS OEWS, industry-specific, NAICS 238290 | May 2022 (point-in-time) | **148,470** |

Difference: **6,562, or 4.62%**. These are different programmes with different universes and reference periods (Economic Census = employer establishments, annual; OEWS = May reference period, survey-based). Both are `Disclosed`. Keep both.

### What this does and does not license us to say

- **Licensed:** elevator and escalator mechanics were **13.90% of NAICS 238290 employment** in both May 2022 and May 2023 (BLS's own figure, not derived).
- **NOT licensed:** any statement about the elevator **revenue** share of the container. Elevator mechanics are paid far above the container average ($97,010 mean annual in 238290 in May 2022 vs $83,532 average pay across the whole container from the Economic Census), so the revenue share is almost certainly higher than 13.9% — but **BLS does not publish revenue by occupation and I did not find a published revenue split.** This slot is empty. See §"What we don't know yet".

---

## A.4 Fragmentation: establishment counts by employment-size band

**This is the table the buy-box needs, and I could not get it for 238290. Read this section carefully — I have the parent group, not the code itself.**

### The right table exists and I identified it

**Table ID: `EC2223LOCCONS` — "Construction: Location of Construction Establishments by Employment Size for the U.S. and States: 2022"**, dataset `ECNLOCCONS2022`.
Table landing page: https://data.census.gov/table/ECNLOCCONS2022.EC2223LOCCONS?q=EC2223LOCCONS
Fields: `NAICS2022`, `EMPSZFE` (employment size of establishment), `EMPSZFE_LABEL`, `ESTAB`.
Size bands published: **<5, 5–9, 10–19, 20–49, 50–99, 100–249, 250–499, 500+**, plus "all establishments", "operated for the entire year", and "not operated for the entire year".

### Why the 238290 rows could not be retrieved

The keyless endpoint `data.census.gov/api/access/data/table` returns the **entire** US table (1,000+ rows) and **ignores every industry-filter parameter** I tried: `n=238290`, `n=N0600.00238290`, `n=2382`, `nkd=NAICS2022:238290` (both raw and URL-encoded `%3A`), `NAICS2017=238290`, `format=csv`. `page=2`, `offset=`, `sort=` and `order=` return HTTP 403. The fetch tool truncates the response, and **the truncation lands consistently at NAICS 238210 (Electrical Contractors)** — 238220 and 238290 are just past the cut, every time, across six attempts. `api.census.gov`, which does accept a NAICS filter, requires an API key. `www2.census.gov` (raw CBP/SUSB files) and `data.bls.gov` are robots-disallowed to the fetch tool.

**A warning about what happens if you don't check.** On two of those attempts the summarising model, unable to find a 238290 row, **fabricated one** — once returning "122,152 establishments" with the correct 238290 label attached, once "94,178" labelled "Other Specialty Trade Contractors." Both are internally arithmetically consistent (the size bands summed correctly), which is exactly what makes them dangerous. Neither is 238290: the Economic Census `ESTAB` for 238290 is **7,725**, and 122,152 is in the range of NAICS 238220 (Plumbing/HVAC). **Those numbers are not recorded anywhere in this file as findings and must not enter the model.**

### What I DID retrieve: NAICS 2382 — Building Equipment Contractors (the parent 4-digit group)

Source: `EC2223LOCCONS`, US (`0100000US`), 2022 — `Disclosed`. Verbatim from the API response.

| Employment size band | Establishments | % of full-year establishments | % of all establishments |
|---|---|---|---|
| All establishments | **203,401** | — | 100% |
| Operated for the entire year | **167,779** | 100% | 82.49% |
| — less than 5 employees | **88,238** | **52.59%** | 43.38% |
| — 5 to 9 employees | **34,457** | **20.54%** | 16.94% |
| — 10 to 19 employees | **22,690** | **13.52%** | 11.16% |
| — 20 to 49 employees | **14,755** | **8.79%** | 7.25% |
| — 50 to 99 employees | **4,586** | **2.73%** | 2.25% |
| — 100 to 249 employees | **2,318** | **1.38%** | 1.14% |
| — 250 to 499 employees | **496** | **0.30%** | 0.24% |
| — 500 employees or more | **239** | **0.14%** | 0.12% |
| Not operated for the entire year | **35,622** | — | 17.51% |

Sum check: 88,238 + 34,457 + 22,690 + 14,755 + 4,586 + 2,318 + 496 + 239 = **167,779** ✓ exactly matches the published "operated for the entire year" total. 167,779 + 35,622 = 203,401 ✓.

Cumulative (`Estimated`, my arithmetic): **under 20 employees = 86.65%** of full-year establishments; **under 50 employees = 95.45%**.

Sector reference from the same table — Construction (NAICS 23) total: all establishments **803,120**; operated entire year **628,833**; <5 employees **372,428**; 5–9 **112,684**; 10–19 **72,338**. (Bands above 19 for sector 23 were within the truncated portion.)

### ⚠️ Do not substitute 2382 for 238290

NAICS 2382 = 238210 Electrical + 238220 Plumbing/HVAC + 238290 Other. Electrical (81,249 establishments, `Disclosed`, same table) and Plumbing/HVAC dominate it, and both are far more fragmented than 238290:

- 238290 averages **18.37 employees per establishment**; Construction overall averages **9.32**. The container is about **twice as employee-dense** as the sector, so its size distribution is materially shifted toward larger establishments than the 2382 distribution shown above.
- 238290 is only **7,725 of the 203,401** establishments in 2382 — **3.8%**. The 2382 distribution is essentially the electrical-and-plumbing distribution.

**The 238290 size-band table remains an unfilled slot.** See §"What we don't know yet" for exactly what would fill it.

Also verified from the same table (`Disclosed`, useful for the sector map): 238210 Electrical Contractors and Other Wiring Installation Contractors, all establishments = **81,249**; NAICS 238 Specialty Trade Contractors, all establishments = **515,720**; NAICS 236 Construction of Buildings = **249,607**; NAICS 237 Heavy and Civil Engineering = **37,793**.

---

## A.5 County Business Patterns and BLS QCEW — NOT RETRIEVED

**Both slots are empty. I am not going to fill them with a number I could not verify.**

- **County Business Patterns (CBP), NAICS 238290** — establishments, firms, employment, payroll, by vintage: **not retrieved.** The `data.census.gov` keyless table endpoint returns CBP table `CB2200CBP` at **2-digit sector level only** by default (verified: the only NAICS values present in the response are 00, 11, 21, 22, 23, 31-33, 42) and ignores drill-down parameters. `api.census.gov/data/2022/cbp` requires an API key. `www2.census.gov/programs-surveys/cbp/datasets/` is robots-disallowed.
- **IMPORTANT STANDING NOTE regardless:** **CBP publishes establishments, firms, employment and payroll — it does NOT publish receipts or revenue.** Any source attributing a revenue figure to County Business Patterns is wrong on its face and should be treated as a tell that the source has not read the programme documentation.
- **BLS QCEW, NAICS 238290** — establishments and employment, by vintage: **not retrieved.** `data.bls.gov` (the QCEW open-data CSV API) and `api.bls.gov` are both robots-disallowed to the available fetch tool.
- **Nonemployer Statistics (NES), NAICS 238290:** **not retrieved.** The `NONEMP2022.NS2200NONEMP` table returns 2-digit sectors only through this endpoint (verified: 352 rows, last NAICS visible "81"). This matters — the Economic Census universe excludes nonemployers entirely, so the true count of *businesses* calling themselves elevator contractors is higher than 7,725 by an unknown amount.

---

# B. The installed base

## B.1 The circulating figures, and where they actually come from

Every widely-repeated US elevator count traces to **one source: National Elevator Industry, Inc. (NEII), the OEM trade association.** No government agency publishes a national count. Here is the trace.

### NEII Fact Sheet (the 2019-dated file) — `Estimated` (association compilation, no method published)
https://nationalelevatorindustry.org/wp-content/uploads/2019/02/Fact-Sheet.pdf

> "There are 900,000 elevators in the United States (1,000,000 when you add elevators in Canada)."
> "Elevators in the United States make 18 billion passenger trips per year."
> "In 2017, the population in the U.S. was 325.7 million people, meaning there is 1 elevator per 362 riders."
> Escalators: "35,000 units in United States (44,000 in the U.S. and Canada)"
> "the number of people carried per escalator per year = 3 million"
> "In the U.S. people travel 2.55 billion miles on elevators and escalators each year."

**And, critically:**

> **"A majority of this data was compiled in 2007."**

**That is the origin.** The "900,000 elevators in the US" and "35,000 escalators in the US" figures that appear in trade press, law-firm marketing, vendor reports and news coverage are an **NEII compilation whose majority was assembled in 2007**, with no published methodology and no stated survey instrument. Anyone citing it in 2026 is citing a ~19-year-old unmethodologised association number.

### NEII Fact Sheet 2020 — `Estimated` (same publisher, revised, still no method)
https://nationalelevatorindustry.org/wp-content/uploads/2020/07/NEII-Fact-Sheet-2020.pdf

> "There are more than 1.03 million elevators in the United States, which is up from 900,000 in 2007."
> "There are 56,000 escalators in North America."
> "Elevators in the United States make 20.6 billion passenger trips per year."
> "105 billion passengers ride escalators each year in the United States."
> "California has the most elevators at over 145,000."
> "Globally, 590,000 elevators were installed in 2016; 40,000 of those were in North America."

The fact sheet cites **no sources** for any of these.

### NEII Press/Media Kit (current, undated) — `Estimated` / `Press-derived`
https://nationalelevatorindustry.org/press-media-kit/

> "There are over 1 million Elevators in the US & Canada"
> "NEII members employ more than 25,000 people in the U.S."
> "We represent 85 percent of the total hours worked within the industry"
> "By 2050 the number of daily riders is expected to triple"

### ⚠️ CONFLICTS WITHIN THE SINGLE SOURCE — keep both, do not midpoint

| Metric | NEII 2019 sheet | NEII 2020 sheet | Gap |
|---|---|---|---|
| US elevators | **900,000** | **>1,030,000** | +14.4% |
| Escalators | **35,000 US** / **44,000 US+Canada** | **56,000 North America** | +27% on the US+Canada basis, with no explanation |
| US elevator passenger trips/yr | **18 billion** | **20.6 billion** | +14.4% |
| US+Canada elevators | **1,000,000** | *(press kit)* "over 1 million" | consistent |

The escalator conflict is the sharper one: 44,000 (US+Canada, 2019 sheet) versus 56,000 (North America, 2020 sheet) is a 12,000-unit jump inside roughly one year, against a global new-install base that NEII itself puts at 40,000 elevators/yr for all of North America. **A current, separately-published US-only escalator count was not found.**

### Corroboration from an OEM — `Press-derived`
Otis Worldwide press release, **February 25, 2026** (launch of North America modernisation packages):
https://www.stocktitan.net/news/OTIS/otis-launches-flexible-elevator-modernization-packages-for-north-7v58r2vqb8bg.html

> "There are more than 1 million elevators in use across the U.S. and Canada" — attributed to Otis Worldwide Corporation
> "including many that are at least 20 years old"

Note this is Otis's own assertion in a marketing release, matching NEII's figure. It is corroboration of *circulation*, not of *measurement*.

### Press repetition, for the record — `Press-derived`
Axios, **January 5, 2025**, "Elevator outages tormenting American buildings": https://www.axios.com/2025/01/05/elevators-escalators-regulations-buildings-construction

> "The U.S. has about 1 million elevators" — source cited: National Elevator Industry trade association
> "Americans traveling about 2.55 billion miles a year altogether on elevators and escalators" — source cited: National Elevator Industry

Both are NEII figures, i.e. the same 2007-rooted compilation. Axios adds no independent measurement.

## B.2 The one bottom-up, regulator-published anchor found

**City of Los Angeles, Office of the Controller — "Elevating Safety: Audit of the Department of Building Safety's Elevator Inspection Program," report dated January 24, 2018** — `Disclosed` (municipal regulator/auditor)
https://controller.lacity.gov/audits/elevating-safety-audit-of-the-department-of-building-safetys-elevator-inspection-program

> "LADBS' 24 elevator inspectors oversee **23,700 permitted conveyances**, with **20,406 (86%)** being either hydraulic or cabled elevators."
> Devices are "located at **12,155 unique addresses** throughout the City," with approximately 4,000 addresses containing multiple conveyances.
> "As of October 30, 2017, there were **4,637 elevators overdue for the annual re-inspection**, which represents **19%** of LADBS' total permitted conveyances that are required to receive a re-inspection."
> "Los Angeles residents and visitors ride some 23,000 elevators, escalators and other types of people-moving conveyances on a daily basis."

**Why this matters:** it is the only count in this file produced by a body that actually has to enumerate the devices to do its job. It also gives the elevator-vs-other-conveyance split (86% elevators) from an actual permit register. Every state and large city with an elevator programme holds an equivalent register — that is the route to a verifiable national denominator, and it has not been walked. See §"What we don't know yet."

## B.3 Age of the installed base — global only, no US-specific published figure found

### Otis Worldwide, 2025 Annual Report — `Disclosed`
https://www.otis.com/documents/d/otis-2/otis-annual-report

- **Global installed base: 23 million units at end of 2025.**
- **"the global installed base of aging elevators ready for modernization is anticipated to increase from 9 million at year-end to approximately 13 million by 2030."**
- Maintenance portfolio: **"approximately 2.5 million units under contract"** at year-end 2025, **fourth consecutive year of 4% growth**.
- Segment net sales 2025: **New Equipment $4,989 million; Service $9,442 million** (sum $14,431M ≈ the stated $14.4 billion total).
- **"About 71% of net sales came from international markets"** (2025).
- Otis 10-K FY2025: New Equipment "35% of net sales and 9% of segment operating profit"; Service "65% of net sales and 91% of segment operating profit"; global workforce ~72,000 including **37,000 service mechanics**; **~1.1 million units connected** to Otis ONE as of December 31, 2025. https://www.stocktitan.net/sec-filings/OTIS/10-k-otis-worldwide-corp-files-annual-report-4c553cfd534b.html
- Otis Factsheet (© 2026): 2025 net sales **$14.4B**; **45K** colleagues; **>200 countries and territories**; **~2.5M customer units maintained**; moves **2.5 billion people every day**; **>1,400 branches and offices**. https://www.otis.com/documents/d/otis-2/otis-factsheet-2025
  - ⚠️ Conflict inside Otis's own materials: the Factsheet says **45K** colleagues, the 10-K says **~72,000**. Record both; do not reconcile. (Plausibly employees vs. total workforce including field/JV, but Otis does not say so in the fetched text.)

**Derived, `Estimated`:** 9 million ÷ 23 million = **39.1% of the global installed base is "ready for modernization"** on Otis's own definition.

### KONE Capital Markets Day 2024, CEO presentation ("KONE's strategy 2025-2030", Philippe Delorme) — `Disclosed` (investor material); figures read from presentation slides, so treat the precision as approximate
https://www.kone.com/en/Images/2024%20KONE%20CMD%20CEO_tcm17-132495.pdf

- **"Total market: >EUR 80bn"**, low-single-digit growth
- Market composition: **~40% Service, ~20% Modernization, ~25% New Building Solutions (Rest of World), ~15% New Building Solutions (Greater China)**
- **"Total installed base <25 mn units"**
- **"~10 mn units 15+ years old"**
- Industry modernises approximately **300,000 units annually**
- **Americas new elevator and escalator market: approximately 30,000 units in 2023, ~55% residential**

**Derived, `Estimated`:** ~10 million ÷ <25 million = **>40% of the global installed base is 15+ years old** on KONE's definition. This is broadly consistent with Otis's 39.1% "ready for modernization," using a different threshold — two OEMs, two definitions, same order of magnitude.

**⚠️ There is no US-specific age distribution in any source found.** Otis's "many that are at least 20 years old" (Feb 2026 press release) is the closest thing, and it is a qualitative claim.

## B.4 New installation volume vs installed base — the replacement ratio

### Published unit volumes

| Figure | Value | Basis | Source |
|---|---|---|---|
| Elevators installed globally, 2016 | 590,000 | `Estimated` (NEII, no method) | NEII Fact Sheet 2020 |
| Of which North America, 2016 | **40,000** | `Estimated` (NEII, no method) | NEII Fact Sheet 2020 |
| Americas new E&E market, 2023 | **~30,000 units** (~55% residential) | `Disclosed` (KONE investor slide) | KONE CMD 2024 |
| **US** new installations, 2024 | **37,026 units** (also given as "37.02 thousand") | `Estimated` (Arizton model) | Arizton / ResearchAndMarkets, June 2025 |
| **US** new installations, 2030F | **43,321 units** | `Estimated` (Arizton model) | Arizton / ResearchAndMarkets, June 2025 |
| Global units modernised annually | ~300,000 | `Disclosed` (KONE investor slide) | KONE CMD 2024 |

**⚠️ CONFLICT:** KONE puts the **Americas** (a superset of the US) at **~30,000 new units in 2023**. Arizton puts the **US alone** at **37,026 new units in 2024**. The smaller geography has the larger number. These cannot both be right on any plausible one-year growth. Gap: **+23%** for a strictly smaller territory. Record both; do not reconcile. KONE's is a slide read; Arizton's is a vendor model with unpublished method. Neither is a census.

### Replacement / modernisation ratio arithmetic — `Estimated` (my arithmetic, shown)

Using Arizton's own two figures (same publisher, same model, so internally comparable):

```
New installations 2024              =    37,026 units
Installed base 2024                 = 1,093,300 units
New installs ÷ installed base       = 37,026 / 1,093,300 = 3.387% per year
Implied gross replacement life      = 1 / 0.03387          = 29.5 years
```

Using NEII's own two figures (2016 North America installs against the ~1.03m US base):

```
40,000 / 1,030,000 = 3.88% per year   → implied life 25.8 years
```
(Caution: numerator is North America, denominator is US — this ratio is inflated by an unknown amount and is shown only because both numbers come from the same NEII sheet.)

**Mechanics per unit — `Estimated`:**
```
24,200 elevator & escalator mechanics (BLS OOH, 2024)  ÷  ~1,030,000 US elevators (NEII)
= 1 mechanic per ~42.6 elevators
```
Mixing a BLS occupational count with an NEII association count; both vintages differ. Directional only.

---

# C. Market sizing — and whether it can be built at all

## C.1 The published figures, side by side

| Publisher | Scope | Base year | Figure as published | Basis |
|---|---|---|---|---|
| **US Census Bureau**, `EC2223BASIC` | NAICS 238290 **container** (elevator + ~46 other trades), employer establishments, US | 2022 | **$42,421,304 thousand = $42.421bn** value of business done | `Disclosed` |
| **IBISWorld**, "Elevator Installation & Service in the US" (entid 208) | US, elevator-specific per its own title | 2025 | **$54.9bn** (2024: **$53.8bn**) | `Estimated` (vendor; method not published on the public page) |
| **Arizton** (also sold via ResearchAndMarkets), "U.S. Elevator & Escalator Market" | US | 2024 | **No total USD market size published**; units only, plus modernization **USD 3.23bn by 2030** | `Estimated` |
| **Technavio**, "Elevator and Escalator Market in US" | US | 2023 | **"USD 2.82 billion"** at **6.36% CAGR 2023-2028** | `Estimated`; **scope of the $2.82bn is ambiguous** — see C.4 |
| **KONE** (CMD 2024) | **Global**, all segments | 2024 | **">EUR 80bn"** | `Disclosed` (investor material) |
| **Otis** (2025 AR / 10-K) | Company, global | 2025 | **$14.4bn** net sales; ~71% international | `Disclosed` |

## C.2 IBISWorld — figures, and two reconciliation failures

**IBISWorld, "Elevator Installation & Service in the US Market Size," last updated May 2025** — `Estimated`
https://www.ibisworld.com/united-states/market-size/elevator-installation-service/208/

Verbatim:
> "**$54.9bn** Elevator Installation & Service in the US Market Size in 2025"
> "**2.0%** Elevator Installation & Service in the US Market Size Growth in 2025"
> "**1.6%** Elevator Installation & Service in the US Market Size CAGR 2020-2025"
> "The market size of the Elevator Installation & Service in the US was **$53.8bn in 2024**."
> "The market size of the Elevator Installation & Service in the US increased **5.0%** in 2024."
> "The market size of the Elevator Installation & Service in the US has grown at a **5.0% CAGR between 2019 and 2024**."

**No methodology is published on the public page.** I attempted to retrieve IBISWorld's industry definition and NAICS mapping (https://www.ibisworld.com/united-states/industry/elevator-installation-service/208/ and the static mirror) — both return HTTP 405. **The definition slot is empty**, which is exactly the problem below.

### ⚠️ Reconciliation failure #1 — the vendor's elevator-only US market is LARGER than the entire Census container that supposedly holds it

```
IBISWorld, elevator installation & service only, US, 2024   = $53.8bn
2022 Economic Census, NAICS 238290 TOTAL (all ~47 trades)   = $42.4bn
Ratio                                                        = 1.268
```
For both to be true, NAICS 238290 would have to have grown **>27% between 2022 and 2024 AND consist of 100% elevator work** — when BLS says elevator mechanics are 13.9% of its headcount. They cannot both be measuring the same thing. The most likely explanation is that IBISWorld's industry boundary includes activity outside 238290 (equipment manufacture and sale, and/or elevator work performed by establishments classified in other NAICS such as 811310 or the OEMs' own manufacturing entities). **But IBISWorld does not publish the boundary on the public page, so this is a hypothesis, not a finding.** Treat $54.9bn as un-tied to any national accounting frame until the definition is obtained.

### ⚠️ Reconciliation failure #2 — IBISWorld's own two CAGRs do not describe a possible series

```
Stated: 2024 = $53.8bn, 5.0% CAGR 2019-2024
  → implied 2019 = 53.8 / 1.05^5 = 53.8 / 1.27628 = $42.154bn

Stated: 2025 = $54.9bn, 1.6% CAGR 2020-2025
  → implied 2020 = 54.9 / 1.016^5 = 54.9 / 1.08250 = $50.711bn

Implied 2019 → 2020 growth = 50.711 / 42.154 − 1 = +20.3%
```
A **+20.3% single-year jump in 2020** — the year of the COVID construction shutdown — is not credible. One of the two stated CAGRs is inconsistent with the levels, or the historical series was rebased between the two statements without saying so.

(The one thing that *does* reconcile: $53.8bn × 1.02 = **$54.876bn ≈ $54.9bn** ✓ — the 2024→2025 step is internally consistent.)

## C.3 Arizton — precision without method, and an installed-base series that implies no retirements

**Arizton, "U.S. Elevator and Escalator Market — Size & Growth Forecast 2025-2030," published June 2025, base year 2024, forecast period 2025-2030** — `Estimated`
https://www.arizton.com/market-reports/united-states-elevator-and-escalator-market
https://www.researchandmarkets.com/reports/6091375/u-s-elevator-escalator-market-size-and-growth
Press release: https://www.barchart.com/story/news/32496707/us-elevator-and-escalator-market-to-witness-installation-of-4332-thousand-new-units-by-2030-arizton (May 20, 2025)

Verbatim:
- New installations 2024: **"37.02 Thousand Units"** / **"37,026 units"**
- New installations 2030: **"43.32 Thousand Units"** / **"43,321 units"**
- CAGR: **"2.65%"**
- Installed base 2024: **"approximately 1,093.3 thousand units"**
- Installed base 2030: **"1,329.9 Thousand Units"**
- Elevators alone, installed base 2030: **"1,265.8 thousand units"** / **"1.26 million units"**
- Escalators, installed base 2030: **"64.1 thousand units"**
- Modernization market 2030: **"USD 3.23 Billion"**
- **No total USD market size for the US is published** in any of the three public pages.

Stated methodology: *"a mix of primary and secondary research"* including company websites, financial reports, SEC filings, and *"primary research involves email interactions with the industry participants across major geographies."* No sampling frame, no model, no unit-of-analysis definition.

### ✓ The CAGR does reconcile
```
37.026 × 1.0265^6 = 43.317  vs stated 43.321   → agrees to 0.01%
```
Credit where due: unlike IBISWorld, Arizton's headline growth rate and endpoints are arithmetically consistent.

### ⚠️ But the installed-base series implies essentially zero retirements
```
Installed base 2024 (stated)                        = 1,093.3 thousand
New installs 2025-2030 at 2.65% CAGR from 37.026:
  38.007 + 39.014 + 40.048 + 41.110 + 42.199 + 43.317 = 243.696 thousand
1,093.3 + 243.696                                    = 1,336.996 thousand
Installed base 2030 (stated)                         = 1,329.9 thousand
Implied cumulative retirements 2025-2030             =     7.096 thousand
                                                     =     1,183 units per year
                                                     =     0.108% of the 2024 base per year
Implied average service life at that retirement rate =    ~924 years
```
An elevator fleet does not have a 924-year service life. Either the two series were modelled independently and never cross-checked, or "installed base" and "new installations" are not on the same unit definition. **Either way the installed-base series should not be used as a denominator without a caveat.**

Separately: the stated installed-base CAGR is **(1,329.9 / 1,093.3)^(1/6) − 1 = 3.32%/yr**, which is *faster* than the new-installation growth rate of 2.65% — again only possible if retirements are near zero.

### ⚠️ Precision beyond method
"**37,026** units" and "**1,093.3** thousand units" are five- and four-significant-figure claims produced by "email interactions with industry participants." Nothing in the stated method supports resolution finer than the nearest thousand units. Round mentally to 37k and ~1.1m and treat both as order-of-magnitude.

## C.4 Technavio — a headline that cannot be read at face value

**Technavio, "Elevator and Escalator Market in US," published February 2024, base year 2023, forecast 2024-2028, historical 2018-2022** — `Estimated`
https://www.technavio.com/report/elevator-and-escalator-market-in-us-industry-analysis

Verbatim figures retrieved: **"USD 2.82 billion"**; CAGR **"6.36%"** (2023-2028); year-over-year growth 2023-2024 **"5.44%"**. Stated method: mixed primary/secondary with "triangulation with data models."

**⚠️ Scope flag.** Technavio's house convention is to headline the *incremental* growth over the forecast period ("the market is forecast to grow by USD X"), not the total market size. The fetched page rendered it as a "market opportunity." **I could not confirm from the page which it is.** Both readings are recorded:

- **If $2.82bn is incremental growth over 5 years at 6.36%:**
  `base = 2.82 / (1.0636^5 − 1) = 2.82 / 0.36105 = $7.81bn (2023)`
- **If incremental over 4 years:**
  `base = 2.82 / (1.0636^4 − 1) = 2.82 / 0.27972 = $10.08bn (2023)`
- **If $2.82bn is the total US market:** it is roughly **one nineteenth** of IBISWorld's $53.8bn and **one fifteenth** of the Census 238290 container.

Under every reading, Technavio's implied US market ($2.8bn–$10.1bn) and IBISWorld's ($53.8bn) are **an order of magnitude apart.** These two vendors are not measuring the same thing, and neither says what it is measuring.

## C.5 A sanity frame from company disclosure

Otis is the only pure-play with US-ish disclosure:

```
Otis 2025 net sales                    = $14.4bn        (Disclosed)
"About 71% of net sales came from international markets"  (Disclosed)
→ implied US net sales = 0.29 × 14,400 = ~$4,176 million ≈ $4.2bn   (Estimated — my arithmetic)
```
Caveat: "international" is Otis's own term and I have not confirmed it means "non-US" rather than "non-Americas." If it means non-Americas, $4.2bn is the Americas figure and the US number is lower.

Otis is one of four global majors (Otis, KONE, Schindler, TK Elevator) plus a long tail of independents. **The US revenue of KONE, Schindler and TK Elevator was not retrieved** — until it is, no bottom-up total can be built. What can be said: a single major at ~$4bn US is compatible with a total US market anywhere from the mid-teens of billions upward once the other three majors and the independent base are added — which sits **between** Technavio and IBISWorld and offers no support for either. **This is an observation about ranges, not a number, and it is not a market size.**

## C.6 Verdict on buildability of a US market size in Pass 1

**A defensible US elevator-services market size cannot be constructed from what is on the public record.** Specifically:

1. The only `Disclosed` national revenue figure ($42.421bn, 2022) is for a **container** that is ~86% non-elevator by headcount, and no published split lets you carve the elevator share of that revenue.
2. The two vendors with US-specific dollar figures disagree by roughly **an order of magnitude**, neither publishes a definition, and one of them ($53.8bn) is **larger than the whole container it should sit inside**.
3. The only publisher with reconciling arithmetic (Arizton) publishes **no total USD market size at all** — only unit counts and a single 2030 modernization number.
4. Segment splits (new install / service / modernisation) exist only at the **global** level, from KONE (~40% service, ~20% modernisation, ~40% new equipment).

The honest Pass-1 position is: **the US installed base is somewhere around 1.0–1.1 million elevators on a single association's unmethodologised count, and the revenue attached to servicing them is not established.** Pass 2 should attack the denominator through state regulator registries, not through vendor reports.

---

# What we don't know yet

Every slot below is **empty** — nothing has been substituted, estimated in, or smoothed over.

### Section A — the container

1. **NAICS 238290 establishment counts by employment-size band (1-4, 5-9, 10-19, 20-49, 50-99, 100+).** The single most important buy-box table. Table `EC2223LOCCONS` contains it and I confirmed the field names (`EMPSZFE`, `ESTAB`) and the band structure, but the 238290 rows sit past the response-truncation point of the only reachable endpoint. **What would fill it:** a Census API key for `api.census.gov/data/2022/ecnloccons` (a single filtered call), OR unblocking `www2.census.gov` for the SUSB file `us_state_6digitnaics_2022.xlsx`, OR opening `data.census.gov/table/ECNLOCCONS2022.EC2223LOCCONS?n=238290` in a JavaScript-capable browser.
2. **County Business Patterns 238290** — establishments, firms, employment, payroll, and vintage. **What would fill it:** a Census API key, or `www2.census.gov/programs-surveys/cbp/datasets/2023/cbp23us.txt`. (Reminder: CBP has no receipts field — do not expect one.)
3. **BLS QCEW 238290** — establishment and employment counts by vintage, and QCEW's Q1 size-class table. **What would fill it:** `data.bls.gov/cew/data/api/2024/a/industry/238290.csv` from a client not bound by the robots rule.
4. **Nonemployer Statistics for 238290** — the count of non-employer elevator/building-equipment businesses, which the Economic Census universe excludes entirely. Without it, "7,725 establishments" understates the number of *businesses* by an unknown amount.
5. **The elevator REVENUE share of 238290.** We have the headcount share (13.90%, BLS). No published source splits 238290 receipts by activity. **What would fill it:** the 2022 Economic Census "kind of business" detail — table `EC2223KOB` exists (dataset `ECNKOB2022`, field `CONKB`/`CONKB_LABEL`) but its US release is published only down to 3-digit NAICS (23/236/237/238), so it does not carve 238290. A special tabulation, or the 2022 `EC2223VALCON` table by type of construction, may.
6. **2017 Economic Census 238290 comparison** (establishments, receipts, employment) — needed to establish the growth trend and to check whether 2022's 7,725 establishments is a break in series.
7. **IBISWorld's industry definition and NAICS mapping for "Elevator Installation & Service in the US" (entid 208)**, plus its business count and employment. Public pages return HTTP 405. Without the definition, the $54.9bn cannot be placed against any national frame — see reconciliation failure #1.
8. **State-level 238290 detail** — establishment and receipts by state, to locate density.

### Section B — the installed base

9. **A verifiable US elevator count that is not NEII's.** Everything in circulation is one association's compilation whose "majority was compiled in 2007." **What would fill it:** state elevator-programme registries. The programmes known to exist and hold enumerable permit registers include Cal/OSHA Elevator Unit (California), Washington L&I, New York City DOB, LADBS (Los Angeles — already gives 23,700 conveyances / 20,406 elevators as of the Jan 2018 audit). Building a 6-10 state register sample and grossing up on a published building-stock denominator is the only path to a defensible national number.
10. **A current, US-only escalator count from any source.** NEII's own two sheets give 35,000 (US, 2019 sheet, 2007 data) and 56,000 (North America, 2020 sheet) — a 27% conflict on the US+Canada basis. Arizton's 64.1 thousand is a **2030 forecast**, not a current count.
11. **Age distribution of the US installed base.** Only global figures exist: Otis's 9 of 23 million "ready for modernization," KONE's ~10 of <25 million "15+ years old." Otis's US-specific claim is the qualitative "many that are at least 20 years old."
12. **US annual new-unit installations from a non-vendor source.** KONE (Americas ~30,000 in 2023) and Arizton (US 37,026 in 2024) conflict in the wrong direction. Census `EC2223VALCON` (value of construction work by type) may carry an elevator line; not yet checked.
13. **US units retired / removed from service per year** — the missing term that makes Arizton's installed-base series impossible.
14. **The number of independent (non-OEM) elevator service companies in the US.** NAEC (National Association of Elevator Contractors) publishes a membership count; https://www.naec.org/about-naec returned HTTP 429. NEII's "we represent 85 percent of the total hours worked within the industry" implies the independents are ~15% of hours — that single sentence, if sourced, would be a load-bearing fragmentation datapoint.
15. **IUEC (International Union of Elevator Constructors) membership**, as a cross-check on BLS's 24,200 mechanics and on the union/non-union split of the service base.

### Section C — market sizing

16. **US-only revenue for KONE, Schindler and TK Elevator.** Otis is the only one with a usable disclosure ratio. Without the other three there is no bottom-up total.
17. **Otis Americas / US segment net sales as disclosed** (rather than derived from the 71% international ratio). The 10-K's revenue disaggregation note carries it; the fetched summary did not.
18. **Confirmation of whether Technavio's "USD 2.82 billion" is total market size or incremental forecast growth.** This single ambiguity is the difference between a $2.8bn and a $10bn read of the same report.
19. **Any published US split of elevator revenue across new installation / maintenance contract / repair / modernisation.** Only KONE's global split (~40/20/40) was found.
20. **Reconciliation of Otis's own headcount disclosure**: Factsheet "45K colleagues" vs 10-K "about 72,000 colleagues."
