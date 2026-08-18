# 01 — Government Sizing: US Fire & Life Safety Services

**Stream:** Government/statistical sizing (Census CBP, SUSB, Economic Census; BLS QCEW/OEWS; state licence registries; trade associations)
**Compiled:** 2026-07-29
**Geography unless stated:** United States, national total
**Basis labels used:** `Disclosed` (a party or filing said it) · `Press-derived` (trade/secondary coverage) · `Estimated` (computed here; arithmetic in `## Derivations`)

---

## 0. Environment constraint that shaped this stream — read first

All direct outbound HTTP from this session was blocked at the egress proxy (403 on CONNECT to `api.census.gov`, `www.census.gov`, `www2.census.gov`, `www.bls.gov`, `data.bls.gov`). Retrieval was possible **only** through a fetch tool. Within that:

- **`api.census.gov` data queries now require an API key.** Every data request returned the Census error page: *"A valid \*key\* must be included with each data API request."* No key was available in this environment. `api.census.gov` **metadata** endpoints (`/variables.json`, `/groups.html`) remained keyless and were used to identify variables.
- **`data.census.gov/api/access/data/table` works without a key** and was the retrieval path for all Economic Census figures below. Its `n=` (NAICS) filter is silently ignored; its `nkd=<DIM>~<VALUE>` filter for **non-key** dimensions (`EMPSZFE`, `EMPSZES`, `LFO`, `CONKB`) does work and was used.
- **CBP 6-digit NAICS could not be retrieved.** Through `data.census.gov`, table `CB2200CBP` returns only 2-digit sector rows at US geography (last NAICS present: `99`, "Industries not classified"), even with `nkd=EMPSZES~001,LFO~001`. **No CBP figure for 238220, 238210, 561621, 811310 or 561990 appears in this document.**
- **SUSB could not be retrieved.** SUSB is published as `.xlsx` on `www2.census.gov`, which is proxy-blocked and not parseable by the fetch tool. **No SUSB figure appears in this document.** Firm-vs-establishment is instead taken from the 2022 Economic Census `FIRM` and `ESTAB` variables (§6), which is a different concept from SUSB's firm definition.
- **BLS QCEW and OEWS could not be retrieved.** `data.bls.gov/cew/data/api/...` and `api.bls.gov` are disallowed by robots for the fetch tool; `www.bls.gov/oes/...` and `www.bls.gov/ooh/...` returned redirects to index pages or HTTP 403. **No QCEW figure appears in this document.** One BLS occupational figure is carried at second hand via O\*NET (§7), labelled accordingly.

Every Economic Census figure below was **arithmetically validated** before being written down (component sums reconciled to published totals). The validations are shown in `## Derivations`.

---

## 1. Instrument inventory — what each table can and cannot do

| Table ID | Title (verbatim) | Dataset path | Key variables | What it resolves | Sub-vertical reach |
|---|---|---|---|---|---|
| **EC2223KOB** | "Construction: Value of Business Done for Kind-of-Business for the U.S., Regions, and States: 2022" | `2022/ecnkob` | `CONKB`, `CONKB_LABEL`, `RCPTOT` ($1,000), `NAICS2022`, `INDLEVEL` | **The fire-specific split.** `CONKB` is a kind-of-business classification independent of NAICS and contains fire-specific lines | 1 and 2 (see §3) |
| **EC2223BASIC** | "Construction: Summary Statistics for the U.S.: 2022" | `2022/ecnbasic` | `ESTAB`, `FIRM`, `EMP`, `PAYANN`, `PAYQTR1`, `RCPTOT`, `RCPCWRK`, `RCPNCW`, `VALADD`, `EMPQ1CW`, `EMPQ1OC`, `PAYANCW`, `PAYANOC` | Container totals for 238220 / 238210 | container only |
| **EC2223LOCCONS** | "Construction: Location of Construction Establishments by Employment Size for the U.S. and States: 2022" | `2022/ecnloccons` | `EMPSZFE`, `EMPSZFE_LABEL`, `ESTAB` | **Establishment counts by employment size band** for 238220 / 238210 | container only |
| **EC2256BASIC** | "Administrative and Support and Waste Management and Remediation Services: Summary Statistics for the U.S., States, and Selected Geographies: 2022" | `2022/ecnbasic` | as EC2223BASIC (27 variables) | Container totals for 561621, 561990 | container only |
| **EC2281BASIC** | "Other Services (except Public Administration): Summary Statistics …: 2022" | `2022/ecnbasic` | as above, plus `TAXSTAT` | Container totals for 811310 | container only |
| **EC2223VALCON** | "Construction: Value of Construction Work for Location of Construction Work for the U.S. and States: 2022" | `2022/ecnvalcon` | `CONSTA`, `RCPCWRK` | Splits by **state where the work was performed**, not by type of work. **Not** a fire instrument |
| **EC2200SIZEEMPEST** | "Selected Sectors: Employment Size of Establishments for the U.S.: 2022" | `2022/ecnsize` | `EMPSZFE`, `ESTAB`, `FIRM`, `RCPTOT`, `EMP`, `PAYANN` | Would give size bands for 561621 / 811310 — **but returns sector-level rows only via the accessible endpoint** (last NAICS reachable: `81`). Unresolved |
| **EC2200NAPCSPRDIND** | "Selected Sectors: Products by Industry for the U.S.: 2022" | `2022/ecnnapcsprd` | `NAPCS2022`, `NAPCS2022_LABEL`, `NAPCSDOL`, `ESTAB` | Would be the product-line split for 561621 / 811310; response truncates in the manufacturing NAPCS range before reaching services. Unresolved. Note construction (sector 23) is **not** covered by NAPCS product tables — it uses `CONKB` instead |
| **CB2200CBP** | "2022 County Business Patterns" | `2022/cbp` | `EMPSZES`, `LFO`, `ESTAB`, `EMP`, `PAYANN`, `PAYQTR1` | Requested by brief; **not retrievable at 6-digit NAICS in this environment** (see §0) |

### NAICS container definitions confirmed against the Census variable dictionaries

- `238220` = **Plumbing, Heating, and Air-Conditioning Contractors** (`NAICS2022_LABEL`, EC2223BASIC). Fire sprinkler installation sits inside this label. `Basis: Disclosed`
- `238210` = **Electrical Contractors and Other Wiring Installation Contractors**. `Basis: Disclosed`
- `561621` = **Security Systems Services (except Locksmiths)**. `Basis: Disclosed`
- `561990` = **All Other Support Services**. `Basis: Disclosed`
- `811310` = **Commercial and Industrial Machinery and Equipment (except Automotive and Electronic) Repair and Maintenance**. `Basis: Disclosed`

**None of these is a fire code.** Any count on them is a container count and is labelled as such throughout.

---

## 2. The container problem, quantified

Sector 23 total value of business done, 2022: **$2,920,771,250 thousand** (EC2223KOB, `CONKB` = 001 "Total", `NAICS2022` = 23). `Basis: Disclosed`

Against that, the two fire-relevant kind-of-business lines (§3) are **0.4115%** and **0.6339%** of all construction. `Basis: Estimated` — see `## Derivations` D3.

Put concretely: **238220's 114,427 establishments are overwhelmingly plumbers and HVAC contractors.** The kind-of-business evidence in §3 implies fire sprinkler work is on the order of 4% of 238220's receipts (`Basis: Estimated`, D4). Reporting 114,427 as a fire-protection establishment count would overstate the sub-vertical by more than an order of magnitude.

---

## 3. HEADLINE — the fire-specific split that Census does publish

**Instrument: table `EC2223KOB`, variable `CONKB` (Kind-of-business Construction code), measure `RCPTOT` "Value of business done ($1,000)", reference year 2022, geography United States (`GEO_ID` 0100000US).**

The `CONKB` code list contains two fire-relevant lines, and — critically — separates fire sprinkler from **lawn** sprinkler:

| CONKB | CONKB_LABEL (verbatim) | Value of business done, NAICS 23 ($1,000) | Same, NAICS 238 ($1,000) | Basis |
|---|---|---|---|---|
| **8221** | "Building sprinkler system installation contractor" | **12,018,607** | 12,014,511 | Disclosed |
| **8212** | "Fire and security systems installation and service contractor" | **18,514,295** | 18,508,938 | Disclosed |
| 8222 | "Lawn sprinkler installation contractor" | 1,776,660 | 1,728,134 | Disclosed |
| 8220 | "Heating, ventilation and air-conditioning contractor (HVAC)" | 123,488,876 | 123,465,608 | Disclosed |
| 8224 | "Plumbing contractor" | 76,125,406 | 76,100,456 | Disclosed |
| 8223 | "Mechanical contractor" | 57,276,095 | 57,246,652 | Disclosed |
| 8226 | "Steam and pipe fitting contractor" | 4,878,492 | 4,858,117 | Disclosed |
| 8210 | "Electric power installation and service contractor, including lighting" | 178,844,538 | 178,362,969 | Disclosed |
| 8211 | "Electronic and environmental control systems installation and service contractor" | 14,241,159 | 14,230,819 | Disclosed |
| 8213 | "Highway, street, or bridge lighting and signal installation and service contractor" | 11,127,065 | 8,761,078 | Disclosed |
| 001 | "Total" | 2,920,771,250 | 1,281,526,572 | Disclosed |
| 8000 | "Special trade contractors, total" | 1,198,309,008 | 1,165,801,524 | Disclosed |

**Reading these for the buy-side, sub-vertical by sub-vertical:**

- **Sub-vertical 1 (sprinkler / suppression install + ITM):** CONKB 8221 = **$12.0186 billion** of value of business done in 2022. `Basis: Disclosed`. Caveats that must travel with this number: (a) the label says *installation* — the Economic Census construction form classifies an establishment by its largest kind of business, so an establishment doing install plus ITM is captured whole, but a pure-ITM inspection company that does no installation may classify elsewhere or fall outside sector 23 entirely; (b) it excludes non-employer firms; (c) "building sprinkler system" is not further split between wet/dry, standpipe or special hazard.
- **Sub-vertical 2 (alarm, detection, monitoring):** CONKB 8212 = **$18.5143 billion**. `Basis: Disclosed`. **This line fuses fire alarm with burglar/security by construction**, exactly as NAICS 561621 does. It is a ceiling for the construction-side fire-alarm contracting layer, not a fire figure.
- **Sub-vertical 3 (extinguisher, kitchen, special hazard):** **the `CONKB` list contains no extinguisher, clean-agent or kitchen-suppression line.** There is nothing between 8221 and 8299 ("Miscellaneous building equipment installation contractor") that names portable extinguishers or special hazard. This sub-vertical is **not separable from published Census** by any instrument found.

Combined fire-relevant construction kind-of-business, 2022: **$30,532,902 thousand** (8221 + 8212). `Basis: Estimated` (D5). This is a **ceiling** for sub-verticals 1+2 on the construction side, because 8212 includes burglar/security.

**Limitation to state plainly:** `EC2223KOB` publishes **only** `RCPTOT`. There is **no establishment count, no employment and no payroll by `CONKB`**. The variable list is exactly `SECTOR, RCPTOT_F, CONKB, NAICS2022_LABEL, NAICS2022, NAME, GEO_ID, INDLEVEL, NAICS2022_F, YEAR, CONKB_LABEL, RCPTOT, GEO_ID_F`. So this instrument gives fire-specific **revenue** and nothing else. `Basis: Disclosed`

`CONKB` is published at `INDLEVEL` 2 and 3 only (NAICS 23, 236, 237, 238). It is **not** crossed with 6-digit NAICS, so "8221 within 238220" is not published.

---

## 4. Container totals — 2022 Economic Census, US, employer establishments

All from `RCPTOT`, `ESTAB`, `FIRM`, `EMP`, `PAYANN`, `PAYQTR1`; dollar figures in **$1,000**; reference year 2022. `Basis: Disclosed` for every cell.

| NAICS | Table ID | ESTAB | FIRM | EMP | PAYANN ($1,000) | PAYQTR1 ($1,000) | RCPTOT ($1,000) | Maps to sub-vertical |
|---|---|---|---|---|---|---|---|---|
| **238220** Plumbing, Heating, and Air-Conditioning Contractors | EC2223BASIC | 114,427 | 112,088 | 1,169,692 | 80,351,785 | 17,826,657 | 297,608,835 | 1 (sprinkler/suppression install + ITM) — **fire is a small minority**, see §3 |
| **238210** Electrical Contractors and Other Wiring Installation Contractors | EC2223BASIC | 81,249 | 78,975 | 968,734 | 69,110,234 | 15,632,945 | 249,247,389 | 2 (fire alarm sold without monitoring) — **fire is a small minority** |
| **561621** Security Systems Services (except Locksmiths) | EC2256BASIC | 7,462 | 6,161 | 140,876 | 8,708,745 | 2,151,682 | 31,313,513 | 2 (monitoring + alarm) — **fire not separated from burglar by definition** |
| **811310** Commercial and Industrial Machinery and Equipment (except Automotive and Electronic) Repair and Maintenance | EC2281BASIC | 23,925 | 22,020 | 228,701 | 14,500,733 | 3,314,490 | 54,640,745 | 3 (extinguisher service without installation) — **fire is a tiny minority** |
| **561990** All Other Support Services | EC2256BASIC | 12,269 | 10,554 | 178,413 | 8,674,469 | 1,957,032 | 29,678,192 | 3 residual — **no fire content identifiable** |

Additional construction-only detail for 238220 and 238210 (EC2223BASIC, $1,000 where dollar):

| Variable | 238220 | 238210 |
|---|---|---|
| `RCPCWRK` Value of construction work | 288,331,268 | 244,852,717 |
| `RCPNCW` Net value of construction work | 267,125,455 | 230,779,497 |
| `RCPOTH` Other receipts | 9,277,569 | 4,394,674 |
| `VALADD` Value added | 175,917,812 | 152,969,385 |
| `EMPQ1CW` Q1 construction workers | 846,519 | 758,929 |
| `EMPQ1OC` Q1 other employees | 323,173 | 209,805 |
| `PAYANCW` Construction-worker payroll | 56,060,961 | 51,066,919 |
| `PAYANOC` Other payroll | 24,290,824 | 18,043,315 |
| `CSTMPRT` Cost of materials, parts, supplies | 93,671,679 | 76,952,362 |

`Basis: Disclosed` for all. These reconcile exactly (D1).

---

## 5. Establishment counts by employment size band

**Instrument: table `EC2223LOCCONS`, variable `EMPSZFE` (employment size of establishment), measure `ESTAB`, reference year 2022, geography United States.** These are **container** counts — plumbing/HVAC/fire-sprinkler for 238220 and all of electrical contracting for 238210. They are not fire counts.

Census band labels are verbatim from `EMPSZFE_LABEL`. Note the Census band is **"less than 5"**, not the brief's "1-4"; the Economic Census universe is employer establishments, so 0-employee establishments in the reference period sit inside "less than 5".

| `EMPSZFE` | Label (verbatim) | 238220 ESTAB | share of entire-year | 238210 ESTAB | share of entire-year |
|---|---|---|---|---|---|
| 001 | "All establishments" | **114,427** | — | **81,249** | — |
| 100 | "Establishments operated for the entire year" | 93,416 | 100.00% | 67,642 | 100.00% |
| 210 | "Establishments operated entire year with less than 5 employees" | **49,926** | 53.44% | **35,717** | 52.80% |
| 215 | "…with 5 to 9 employees" | **19,350** | 20.71% | **13,783** | 20.38% |
| 220 | "…with 10 to 19 employees" | **12,587** | 13.47% | **8,945** | 13.22% |
| 225 | "…with 20 to 49 employees" | **7,730** | 8.27% | **5,976** | 8.83% |
| 230 | "…with 50 to 99 employees" | **2,346** | 2.51% | **1,892** | 2.80% |
| 235 | "…with 100 to 249 employees" | **1,134** | 1.21% | **988** | 1.46% |
| 245 | "…with 250 to 499 employees" | **248** | 0.27% | **211** | 0.31% |
| 250 | "…with 500 employees or more" | **95** | 0.10% | **130** | 0.19% |
| 500 | "Establishments not operated for the entire year" | 21,011 | — | 13,607 | — |

`Basis: Disclosed` for every `ESTAB` value except 238220's `EMPSZFE` 500 (21,011), which is `Basis: Estimated` (D2 — subtraction; 238210's published 13,607 confirms the method). Percentage columns are `Basis: Estimated` (D2).

**Rolled to the brief's bands (238220 container, entire-year establishments):**
- 1-4 (Census "less than 5"): 49,926 · 5-9: 19,350 · 10-19: 12,587 · 20-49: 7,730 · 50-99: 2,346 · **100+: 1,477**. `Basis: Disclosed` except 100+ which is `Estimated` (D2).
- **74.16%** of entire-year 238220 establishments have fewer than 10 employees. `Basis: Estimated` (D2).
- Only **1.58%** have 100 or more employees. `Basis: Estimated` (D2).

The same shape holds for 238210: **73.18%** under 10 employees; **1.96%** at 100+. `Basis: Estimated` (D2).

**Underwriting note:** this is the *trade* distribution, not the fire distribution. A fire-protection contractor with a 20-employee ITM crew is structurally more like the 20-49 band than the sub-5 mode of the container. Do not read the 53% sub-5 mode as the fire-protection size distribution.

**Not obtained:** size bands for 561621, 811310 and 561990. `EC2200SIZEEMPEST` would carry them but returns only sector-level rows through the accessible endpoint; CBP and SUSB were unreachable. This is an open gap.

---

## 6. Firm versus establishment — multi-location intensity

From the 2022 Economic Census `FIRM` and `ESTAB` (**not** SUSB — SUSB was unreachable and its firm concept differs):

| NAICS | ESTAB | FIRM | ESTAB per FIRM | Basis |
|---|---|---|---|---|
| 238220 | 114,427 | 112,088 | 1.021 | Estimated (D6) |
| 238210 | 81,249 | 78,975 | 1.029 | Estimated (D6) |
| **561621** | 7,462 | 6,161 | **1.211** | Estimated (D6) |
| 561990 | 12,269 | 10,554 | 1.162 | Estimated (D6) |
| 811310 | 23,925 | 22,020 | 1.087 | Estimated (D6) |

**561621 is the most branch-intensive container by a wide margin**, which is what you would expect where national monitoring platforms operate multi-site footprints. The construction containers are near-unitary, consistent with a mostly single-location contractor population.

Unit economics of the containers (all `Basis: Estimated`, D7):

| NAICS | EMP per ESTAB | Payroll per employee | Receipts per ESTAB ($1,000) | Receipts per employee |
|---|---|---|---|---|
| 238220 | 10.2 | $68,695 | 2,601 | $254,434 |
| 238210 | 11.9 | $71,341 | 3,068 | $257,292 |
| 561621 | 18.9 | $61,819 | 4,196 | $222,277 |
| 561990 | 14.5 | $48,620 | 2,419 | $166,345 |
| 811310 | 9.6 | $63,405 | 2,284 | $238,918 |

---

## 7. Labour-side denominators

- **SOC 49-2098, Security and Fire Alarm Systems Installers — national employment 85,900 (2024).** `Basis: Press-derived` (O\*NET OnLine occupation summary, which attributes the figure to "Bureau of Labor Statistics 2025 wage data and 2024-2034 employment projections"; BLS OEWS pages themselves were unreachable, see §0). Projected 2024-2034 growth described as "Much faster than average (7% or higher)", with **9,400** projected annual openings. This occupation, like NAICS 561621 and `CONKB` 8212, **fuses security with fire** in its title and definition — it is not a fire-only headcount.
- **Road Sprinkler Fitters Local 669 (UA) — 16,631 members, 2025 filing.** `Basis: Press-derived` (UnionFacts, republishing US DOL Office of Labor-Management Standards union filings; page last updated 2026-04-23). Local 669 is the single national local with jurisdiction over sprinkler fitting, which makes this an unusually clean **fire-specific** labour denominator — it is a union-membership count, not total US sprinkler fitters, so it is a floor on the organised segment and says nothing about open-shop headcount. Not verified against the underlying LM-2 form.
- **SOC 47-2152 (Plumbers, Pipefitters, and Steamfitters)** is where sprinkler fitters are classified in OEWS; **no OEWS figure was retrievable** (see §0).
- **BLS QCEW: nothing retrieved.** The series construction for a national private annual QCEW request on NAICS 238220 would be `ENU` + area `US000` + data-type + size + ownership `5` + industry `238220`; `api.bls.gov` and `data.bls.gov` are both robots-disallowed for the available fetch tool, so this was not executed and **no QCEW number is asserted anywhere in this document.**

---

## 8. Association counts and licence registries

### Associations

- **AFSA (American Fire Sprinkler Association): "more than 1,000 member companies."** `Basis: Disclosed` (AFSA's own About page, https://firesprinkler.org/about/, retrieved 2026-07-29; no publication date shown on the page). Exact wording: *"Belonging to AFSA, along with more than 1,000 member companies, gives you the professional support to expand your knowledge…"* AFSA is the open-shop/merit-shop sprinkler contractor body, so this is a partial census of sub-vertical 1 only.
- **NFSA (National Fire Sprinkler Association): no membership count published on the pages reached.** Checked https://nfsa.org/ , https://nfsa.org/join/ and https://nfsa.org/aboutnfsa/ ; the join page lists three categories — Contractor, Individual, and Supplier & Manufacturer (SAM) — but no count. Founding fact disclosed on the history page: *"On November 22, 1905, three specialty contractors met in St. Louis, MO, to establish the National Automatic Sprinkler Contractors Association."* `Basis: Disclosed`. **No NFSA membership figure is asserted here.**
- **NAFED (National Association of Fire Equipment Distributors): membership count not obtained.** `www.nafed.org` is disallowed by robots for the available fetch tool; searches surfaced only data-broker profiles, which are not acceptable sources. **No NAFED figure is asserted here.** This leaves sub-vertical 3 without an association denominator.

### State licence registries — outcome

The brief's hypothesis is right in principle: sprinkler and fire-alarm contractor licences are fire-specific by construction. In practice, **none of the registries reached publishes an aggregate count**, and the searchable registries are JavaScript applications or binary downloads that the available fetch tool cannot enumerate. What was established:

| State | Registry / agency | Fire-specific licence class confirmed | Count obtained | Basis |
|---|---|---|---|---|
| California | Contractors State License Board (CSLB) | **C-16 Fire Protection Contractor** — confirmed as a standalone classification | **No.** CSLB's Public Data Portal (`/onlineservices/Dataportal/ListByClassification`) is a **download form only** — "The list is available in Excel (.xls) format" — with no counts displayed. The 2023 CSLB Sunset Report contains a "Table 6 Licensee Population" in its contents but the table body was not reachable; the report does state *"approximately 300,000 licensed contractors (active and inactive status)"* across **all** classifications | Disclosed (300,000 all-classification figure); C-16 count not obtained |
| California | CSLB Industry Bulletin 24-02, issued **2024-05-10** | Confirms a **Fire Sprinkler Fitter Certification** requirement for C-16 qualifiers and journey-level personnel installing or repairing water-based fire protection systems for commercial or multi-family dwellings; apprentices/trainees need a Fire Sprinkler Fitter Registration; one- and two-family dwellings excluded | No count in the bulletin | Disclosed |
| Texas | TDI State Fire Marshal's Office | Separate licensing regimes for **fire extinguisher**, **fire alarm**, **fire sprinkler** and fireworks firms — SFMO "license[s] companies that sell, install, certify, and service fire extinguishers, fire alarms, fire sprinklers, and fireworks" | Only a dated aggregate: **"14,333 registrations, licenses, and permits issued to fire alarm, fire extinguisher, fire sprinkler, and fireworks firms, individuals, and other regulated entities"** in **FY15** — firms, individuals and fireworks are combined, so it cannot be used as a firm count | Disclosed (FY15, Texas Legislature committee handout) |
| Maryland | Office of the State Fire Marshal | **Fire Sprinkler Contractor licence, eight classes: I, IIa, IIb, IIc, IId, IIIa, IIIb, IIIc.** Licences expire two years after issue | **No.** The published list (Maryland OneStop list view) returned binary/JS content | Disclosed (class structure only) |
| North Carolina | State Board of Examiners of Plumbing, Heating and Fire Sprinkler Contractors | Fire sprinkler is a named, separately-licensed classification at board level | **No.** `nclicensing.org` robots fetch timed out | — |
| Washington | Washington State Patrol, Fire Protection Bureau | **Fire Protection Sprinkler System Contractor**, Levels I-III (WAC 212-80) | Not obtained | — |
| Georgia | Office of the Commissioner of Insurance and Safety Fire | "Fire Suppression Professionals" licensing exists as a separate programme | Not obtained | — |
| Delaware | Office of the State Fire Marshal | Publishes "licensed public fire protection companies" | Not obtained | — |

**Third-party certification cross-check attempted and failed:** a page indexing "State-by-state NICET certification counts across Fire Alarm, Water-Based, ITM, Special Hazards, and In-Building Public Safety Communications disciplines" with "Data as of July 1, 2024" was located, but the numeric body did not render. **No NICET count is asserted here.**

---

## 9. Conflicts and tensions preserved

1. **Fire-sprinkler revenue: $12.0186B (Census `CONKB` 8221, 2022) versus commercial-vendor industry sizings that run several times larger.** Vendor pages for "Fire Protection & Security System Installation Contractors" (IBISWorld) and "United States Fire Sprinklers Market" (Research and Markets / GlobeNewswire, 2025-11-10) were surfaced but returned HTTP 405/paywalls, so **no vendor figure is quoted here**. The tension to flag for the master document is definitional, not arithmetic: Census `CONKB` 8221 counts *value of business done by construction establishments primarily doing building sprinkler installation*, whereas vendor "market" figures typically bundle device manufacture, distribution, monitoring and standalone ITM firms outside sector 23. **I would underwrite on the Census figure as the construction-contracting denominator and treat any vendor number as a differently-scoped total, not a competing estimate of the same thing.**
2. **Two different fire-alarm ceilings.** Construction-side `CONKB` 8212 "Fire and security systems installation and service contractor" = **$18.5143B** (2022). Services-side NAICS 561621 `RCPTOT` = **$31.3135B** (2022). These are **not** alternatives and must not be averaged or added carelessly: 8212 is contractors classified in sector 23 selling installation and service; 561621 is establishments selling alarm systems *with monitoring* in sector 56. Both fuse fire with burglar. Together they bound the alarm/detection/monitoring sub-vertical from above at **$49.8278B** (`Basis: Estimated`, D8), of which an unknown — and, from published Census, unknowable — share is fire.
3. **Establishment counts by size: Economic Census versus CBP.** The brief asked for CBP. CBP was unreachable, so §5 uses `EC2223LOCCONS`. These two sources routinely differ (different universe treatment of establishments not operating the full year, different reference period). **A later session should not treat §5 as if it were CBP.**

---

## Derivations

**D1 — Validation of the EC2223BASIC extraction.** The Economic Census response is a positional JSON array of 139 fields; the mapping to variable names was verified by four independent identities that all closed exactly:
- 238220: `EMPQ1CW` 846,519 + `EMPQ1OC` 323,173 = 1,169,692 = `EMP`. ✔
- 238220: `PAYANCW` 56,060,961 + `PAYANOC` 24,290,824 = 80,351,785 = `PAYANN`. ✔
- 238210: 758,929 + 209,805 = 968,734 = `EMP`. ✔ · 51,066,919 + 18,043,315 = 69,110,234 = `PAYANN`. ✔
- 238220: `RCPCWRK` 288,331,268 + `RCPOTH` 9,277,569 = 297,608,837 against `RCPTOT` 297,608,835 (difference of 2, consistent with independent rounding of $1,000 units).

**D2 — Size bands.** Sum of the eight 238220 bands: 49,926 + 19,350 + 12,587 + 7,730 + 2,346 + 1,134 + 248 + 95 = **93,416**, which equals the separately-retrieved `EMPSZFE` 100 value of 93,416 exactly. ✔ The same test on 238210 gives 67,642 = published 67,642. ✔
- 238220 not-operated-entire-year = 114,427 − 93,416 = **21,011**.
- 238220 100+ employees = 1,134 + 248 + 95 = **1,477**; 1,477 ÷ 93,416 = **1.58%**.
- 238220 under 10 employees = 49,926 + 19,350 = 69,276; 69,276 ÷ 93,416 = **74.16%**.
- 238210 100+ = 988 + 211 + 130 = 1,329; 1,329 ÷ 67,642 = **1.96%**. Under 10 = 49,500 ÷ 67,642 = **73.18%**.

**D3 — Fire share of all construction.** 12,018,607 ÷ 2,920,771,250 = **0.4115%**. 18,514,295 ÷ 2,920,771,250 = **0.6339%**. Within NAICS 238: 12,014,511 ÷ 1,281,526,572 = **0.9375%**.

**D4 — Fire-sprinkler work as a share of the 238220 container.** 12,018,607 ÷ 297,608,835 = **4.038%**. This is an upper-bound style comparison, not an exact share: the numerator spans all of sector 23 while the denominator is 238220 only. Read it as "of the order of 4%", and note the corresponding figure for `CONKB` 8212 against 238210 is 18,514,295 ÷ 249,247,389 = **7.428%**.

**D5 — Combined fire-relevant construction KOB.** 12,018,607 + 18,514,295 = **$30,532,902 thousand**. Ceiling, because 8212 includes burglar/security.

**D6 — Establishment-to-firm ratios.** 114,427 ÷ 112,088 = 1.021 · 81,249 ÷ 78,975 = 1.029 · 7,462 ÷ 6,161 = 1.211 · 12,269 ÷ 10,554 = 1.162 · 23,925 ÷ 22,020 = 1.087.

**D7 — Unit economics.** Employment per establishment = `EMP` ÷ `ESTAB`. Payroll per employee = `PAYANN` × 1,000 ÷ `EMP`. Receipts per establishment = `RCPTOT` ÷ `ESTAB` (in $1,000). Receipts per employee = `RCPTOT` × 1,000 ÷ `EMP`. Worked for 238220: 1,169,692 ÷ 114,427 = 10.2 · 80,351,785,000 ÷ 1,169,692 = $68,695 · 297,608,835 ÷ 114,427 = 2,601 · 297,608,835,000 ÷ 1,169,692 = $254,434.

**D8 — Upper bound on alarm/detection/monitoring.** 18,514,295 + 31,313,513 = **$49,827,808 thousand**. Both components fuse fire with burglar; the sum is a ceiling on the combined construction-side and services-side alarm layer, not a fire figure.

**D9 — Illustrative implied establishment counts (heavily caveated, do not quote standalone).** If sprinkler-contracting establishments earned the 238220 average of $2,600.9 thousand per establishment, `CONKB` 8221's $12,018,607 thousand would imply ≈ **4,621** establishments. On the same logic with 238210's $3,067.7 thousand per establishment, `CONKB` 8212's $18,514,295 thousand would imply ≈ **6,035** establishments. **These are arithmetic illustrations, not counts.** Fire sprinkler contractors are widely understood to be larger than the average plumbing establishment, which would push the true count below 4,621; nothing in the published data confirms the direction or size of that adjustment. `Basis: Estimated`.

---

## Sources

Every URL below was retrieved on **2026-07-29**. Where a source carries no publication date on the page, that is stated.

**Census — data endpoints (all reference year 2022):**
- EC2223BASIC, Construction summary statistics, US — https://data.census.gov/api/access/data/table?id=ECNBASIC2022.EC2223BASIC&g=010XX00US&y=2022 (human view: https://data.census.gov/table/ECNBASIC2022.EC2223BASIC)
- EC2223KOB, Value of business done for kind-of-business, US — https://data.census.gov/api/access/data/table?id=ECNKOB2022.EC2223KOB&g=010XX00US&y=2022
- EC2223LOCCONS, Location of construction establishments by employment size, US — https://data.census.gov/api/access/data/table?id=ECNLOCCONS2022.EC2223LOCCONS&g=010XX00US&y=2022 (size bands retrieved with `&nkd=EMPSZFE~100|210|215|220|225|230|235|245|250`)
- EC2256BASIC, Administrative & Support / Waste Management summary statistics, US — https://data.census.gov/api/access/data/table?id=ECNBASIC2022.EC2256BASIC&g=010XX00US&y=2022
- EC2281BASIC, Other Services summary statistics, US — https://data.census.gov/api/access/data/table?id=ECNBASIC2022.EC2281BASIC&g=010XX00US&y=2022
- CB2200CBP, 2022 County Business Patterns — https://data.census.gov/api/access/data/table?id=CBP2022.CB2200CBP&g=010XX00US&y=2022 (sector-level only; see §0)

**Census — metadata and table listings:**
- 2022 Economic Census, NAICS Sector 23 table list — https://www.census.gov/data/tables/2022/econ/economic-census/naics-sector-23.html
- 2022 Economic Census, NAICS Sector 56 table list — https://www.census.gov/data/tables/2022/econ/economic-census/naics-sector-56.html
- Economic Census API dataset list (2002-2022) — https://www.census.gov/data/developers/data-sets/economic-census.html
- `2022/ecnkob` variable list — https://api.census.gov/data/2022/ecnkob/variables.json
- `2022/ecnvalcon` group EC2223VALCON variable list — https://api.census.gov/data/2022/ecnvalcon/groups/EC2223VALCON.html
- `2022/ecnsize` group list — https://api.census.gov/data/2022/ecnsize/groups.html
- `2022/ecnnapcsprd` group list — https://api.census.gov/data/2022/ecnnapcsprd/groups.html
- `2022/cbp` variable list — https://api.census.gov/data/2022/cbp/variables.json

**Occupational / labour:**
- O\*NET OnLine, 49-2098.00 Security and Fire Alarm Systems Installers (attributes data to "Bureau of Labor Statistics 2025 wage data and 2024-2034 employment projections") — https://www.onetonline.org/link/summary/49-2098.00
- UnionFacts, Plumbers Local 669 / Road Sprinkler Fitters (US DOL OLMS filings; page "Last Updated: April 23rd, 2026"; membership from 2025 filing) — https://unionfacts.com/local-union/59937/PPF/669/

**Associations:**
- American Fire Sprinkler Association, About (no publication date on page) — https://firesprinkler.org/about/
- National Fire Sprinkler Association, Membership — https://nfsa.org/join/
- National Fire Sprinkler Association, History of the NFSA — https://nfsa.org/aboutnfsa/

**Licence registries and regulator documents:**
- CSLB Public Data Portal, List by Classification — https://www.cslb.ca.gov/onlineservices/Dataportal/ListByClassification
- CSLB Reports index — https://web.cslb.ca.gov/About_Us/Library/Reports.aspx
- CSLB 2023 Sunset Report — https://web.cslb.ca.gov/Resources/Reports/Sunset/CSLB_2023_Sunset_Report.pdf
- CSLB Industry Bulletin 24-02, Fire Certification, issued 2024-05-10 — https://www.cslb.ca.gov/Resources/IndustryBulletins/2024/24-02_-_Fire_Certification.pdf
- CSLB classification detail, C-16 Fire Protection — https://www.cslb.ca.gov/about_us/library/licensing_classifications/Licensing_Classifications_Detail.aspx?Class=C16
- Texas Department of Insurance, Fire Industry Licensing — https://www.tdi.texas.gov/fire/fmli.html
- Texas SFMO licensee search application — https://appscenter.tdi.texas.gov/reports/p/sfmo
- Texas Legislature committee handout, "Texas State Fire Marshal's Office Functions" (FY15 figures; 84R) — https://www.legis.state.tx.us/tlodocs/84R/handouts/C2102016051613001/c7d5d6fc-741b-461b-8f29-cb886b211053.PDF
- Maryland Office of the State Fire Marshal, Fire Sprinkler Contractors — https://firemarshal.maryland.gov/permits-licensing/fire-sprinkler-contractors
- Maryland OneStop, Maryland State Licensed Fire Sprinkler Contractors list — https://onestop.md.gov/list_views/61701893a0c8d4019fc56757
- North Carolina State Board of Examiners of Plumbing, Heating and Fire Sprinkler Contractors — https://nclicensing.org/
- Washington State Patrol, Fire Sprinklers — https://wsp.wa.gov/fire-sprinklers/
- Georgia Office of the Commissioner of Insurance and Safety Fire, Fire Suppression Professionals — https://oci.georgia.gov/inspections-permits-plans/buildings-fire-suppression-systems/fire-suppression-professionals
- Delaware Office of the State Fire Marshal, licensed public fire protection companies — https://statefiremarshal.delaware.gov/technical-services/licensed-public-fire-protection-companies-testing-applications

**Located but not usable (no figure taken):**
- Fire Cert Academy, NICET certified individuals by state ("Data as of July 1, 2024") — https://firecertacademy.com/resources/nicet-certified-by-state
- IBISWorld, Fire Protection & Security System Installation Contractors (HTTP 405/paywall) — https://www.ibisworld.com/united-states/market-research-reports/fire-protection-security-system-installation-contractors-industry
- "United States Fire Sprinklers Market Analysis Report 2025-2033", GlobeNewswire, 2025-11-10 — https://www.globenewswire.com/de/news-release/2025/11/10/3184858/28124/en/United-States-Fire-Sprinklers-Market-Analysis-Report-2025-2033-Rising-Fire-Safety-Awareness-Adoption-of-Advanced-Technologies-and-Stringent-Safety-Regulations-Bolster-Growth.html

---

## What I could not verify

Named plainly, with what was tried.

1. **Any County Business Patterns figure at 6-digit NAICS.** `api.census.gov` requires a key this environment does not have; `data.census.gov`'s table endpoint returns only 2-digit sector rows for `CB2200CBP`, verified by searching the response for 238220, 238210, 561621, 811310 and 561990 with `nkd=EMPSZES~001,LFO~001` applied — all NOT FOUND, last NAICS present `99`. **No CBP number appears above.** Also unverified: whether CBP 2023 or 2024 vintages are published.
2. **Any SUSB figure.** SUSB is `.xlsx` on `www2.census.gov`, which is proxy-blocked. The firm-vs-establishment table in §6 is Economic Census `FIRM`/`ESTAB`, a **different concept** from SUSB's enterprise-level firm. **No SUSB number appears above.**
3. **Any BLS QCEW figure** (establishments, employment, average annual pay, by NAICS). `data.bls.gov` and `api.bls.gov` are robots-disallowed for the available fetch tool.
4. **BLS OEWS directly.** `www.bls.gov/oes/current/oes492098.htm`, `/oes/2025/may/oes492098.htm` and `/oes/2024/may/oes492098.htm` all redirected to index pages; `www.bls.gov/ooh/...` returned HTTP 403. The single occupational figure carried (85,900 for SOC 49-2098) is second-hand via O\*NET and is labelled `Press-derived`. No OEWS figure for SOC 47-2152 (which contains sprinkler fitters) was obtained at all.
5. **Employment-size bands for 561621, 811310 and 561990.** `EC2200SIZEEMPEST` is the right table and its `EMPSZFE` code list was confirmed, but the accessible endpoint returns sector-level rows only (searched for 561621, 811310, 561990 with and without `nkd=EMPSZFE~210`; all NOT FOUND, last NAICS `81`).
6. **Any NAPCS product-line split for 561621 or 811310.** `EC2200NAPCSPRDIND` exists and its variables were confirmed (`NAPCS2022`, `NAPCS2022_LABEL`, `NAPCSDOL`, `ESTAB`, `NAICS2022`), but the response truncates inside the manufacturing NAPCS range before reaching services. A NAPCS line separating fire-alarm monitoring from burglar monitoring, or naming portable-extinguisher servicing, may or may not exist — **I could not determine which.**
7. **Establishment, employment or payroll counts by `CONKB`.** They are not published — `EC2223KOB` carries `RCPTOT` only. So the $12.0186B sprinkler figure has **no companion establishment count** in any Census product found.
8. **State-level `CONKB` 8221 values.** The table title says "U.S., Regions, and States", but the state-geography request (`g=040XX00US` with `nkd=CONKB~8221`) returned empty content. No state allocation of the sprinkler revenue line was obtained.
9. **A count of licensed fire sprinkler contractors or fire alarm contractors in any state.** Attempted: California CSLB (data portal is download-only; Sunset Report Table 6 body unreachable), Texas TDI SFMO (search app only; the sole figure found is a FY15 aggregate of 14,333 that mixes firms, individuals and fireworks), Maryland (list view returned binary), North Carolina (robots timeout), Washington, Georgia, Delaware, Virginia DPOR, Florida DFS/DBPR, Alabama, South Carolina. **The brief's most promising instrument produced no counts in this environment.** A session with browser-grade access should retry CSLB Sunset Report Table 6 and the Maryland OneStop list first — both are known to contain the number.
10. **NFSA and NAFED membership counts.** NFSA publishes none on its About, Join or History pages; `nafed.org` is robots-disallowed. Sub-vertical 3 therefore has **no association denominator** in this document.
11. **NFPA's own industry or contractor-population estimates.** Searches returned NFPA fire-statistics reports (sprinkler effectiveness, US experience with sprinklers) rather than any contractor-population or industry-size estimate; `nfpa.org` was not successfully fetched. **No NFPA figure appears above.**
12. **NICET certification-holder counts.** A state-by-state index dated 2024-07-01 was located but its numeric body did not render.
13. **Individual Economic Census table release dates.** Every 2022 Economic Census figure here carries reference year 2022 and a retrieval date of 2026-07-29; I did not verify the specific publication date of EC2223KOB, EC2223BASIC, EC2223LOCCONS, EC2256BASIC or EC2281BASIC.
