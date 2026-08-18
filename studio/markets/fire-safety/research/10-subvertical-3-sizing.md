# Stream 10 — Sub-vertical 3 sizing: extinguisher, kitchen and special hazard

Run 2026-07-29. Closes the failed gate item from `00-GATE-REPORT.md` §3.

**Scope of SV3 as sized here:** portable fire extinguisher sales and service; commercial
kitchen hood/duct cleaning and wet-chemical suppression service; clean agent systems;
industrial special hazard.

---

## 0. Answer, stated first

**There is no revenue denominator for SV3 in the public record.** Six routes were worked.
Five produced no denominator. The sixth — the obligated-site route — produced one, and it
is a **count of code-obligated sites, not a dollar figure**.

| What SV3 has as a denominator | Value | Basis |
|---|---:|---|
| **Code-obligated commercial kitchens** (Type I hood, NFPA 96 cleaning + NFPA 17A semiannual suppression service) | **≥ 737,325 sites** | Estimated (D5) from Disclosed Census/NCES/AHA/KFF counts |
| **Portable extinguishers in commercial buildings** under NFPA 10 Class A spacing | **8.57 million (code floor) – 24.11 million** | Estimated (D1–D3) from Disclosed CBECS + Cal. Code Regs. tit. 19 §568 |
| **Commercial buildings carrying the NFPA 10 obligation** | **5,918 thousand buildings / 96,423 million sq ft** | Disclosed (CBECS 2018, via stream 08) |
| **Largest single disclosed SV3-adjacent revenue line, any US filer** | **Cintas Fire Protection Services $817.463M (FY2025)** | Disclosed (Cintas FY2025 10-K, R11) |

**The bottom-up dollar estimate that falls out of those counts is $1.1 billion – $2.6 billion
per year of recurring SV3 service revenue** (`Basis: Estimated`, D7), and **I believe it is
low**, for reasons stated in §7.3 rather than adjusted away.

**Cintas makes no addressable-market statement of any kind.** The hoped-for "public company's
own stated TAM" does not exist in the FY2025 10-K. What Cintas does state is that its markets
are "local in nature and highly fragmented" — a structure claim, not a size claim.

---

## 1. Route 1 — NAPCS product lines. **No result. Route characterised and closed.**

### 1.1 The retrieval path, corrected

Stream 01 recorded the table as `EC2200NAPCSPRDIND` with dataset `2022/ecnnapcsprd` and could
not reach it. The working `data.census.gov` table ID is:

```
https://data.census.gov/api/access/data/table?id=ECNNAPCSPRD2022.EC2200NAPCSPRDIND&g=010XX00US&y=2022
```

`Basis: Disclosed` — retrieved 2026-07-29, HTTP 200, no API key. The prefix
`ECNNAPCSPRDIND2022.` (the natural guess, and the one that fails) returns **HTTP 400**.
Recording this so the next stream does not re-derive it.

A **second, previously unrecorded table exists and is complete**:

```
https://data.census.gov/api/access/data/table?id=ECNNAPCSIND2022.EC2200NAPCSINDPRD&g=010XX00US&y=2022
```

`Basis: Disclosed` — "Selected Sectors: Industry by Products for the U.S.: 2022".

### 1.2 What each returns

| Table | Rows returned | First → last NAPCS2022 | Fire/extinguisher/suppression label present? |
|---|---:|---|---|
| `EC2200NAPCSPRDIND` | **396** | 1000025000 → 2005525000 | **No.** Truncates inside apparel/leather manufacturing, never reaches sector 56 or 81 |
| `EC2200NAPCSINDPRD` | **31** | 0000000000 only | **No.** Publishes sector totals only (NAICS 21, 22, 23, 31-33 … 81), NAPCS "Total" |

`Basis: Disclosed` (both retrieved 2026-07-29).

### 1.3 Every filter tried, and its result

| Filter | Result |
|---|---|
| `&n=811310` | **Silently ignored** — response still returns mining and manufacturing rows. Confirms stream 01 |
| `&n=81` | Silently ignored — identical 396-row manufacturing response |
| `&nkd=NAICS2022~811310` | **HTTP 400** |
| `&nkd=NAPCS2022~1000025000` (a value known to exist) | **HTTP 400** |
| `&nkd=NAPCS2022~5623000000` | **HTTP 400** |
| `&nkd=SECTOR~81` | **HTTP 400** |
| `&nkd=INDLEVEL~6` | **HTTP 400** |
| `&nkd=TYPOP~00` | **HTTP 200**, but does not reduce the row set — still ends at 2005525000 |
| `&pg=2` | **HTTP 403** |
| `&g=0400000US56` (single state, to shrink the payload) | **HTTP 200, empty body** — replicates stream 01's state-geography failure on `EC2223KOB` |
| `id=ECNNAPCSPRD2022.EC2281NAPCSPRDIND` (sector-81-scoped) | **HTTP 400** — table does not exist |
| `id=ECNNAPCSPRD2022.EC2256NAPCSPRDIND` (sector-56-scoped) | **HTTP 400** — table does not exist |

`Basis: Disclosed` — all tested 2026-07-29.

### 1.4 The two fallbacks

- `api.census.gov/data/2022/ecnnapcsprd` returns the key-required error verbatim: **"A valid
  *key* must be included with each data API request."** `Basis: Disclosed`.
- `www2.census.gov/programs-surveys/economic-census/technical-documentation/product-codes-descriptions/NAPCS_Codes_Descriptions.xlsx`
  — the single official NAPCS code list, linked from `www.census.gov` — returns
  **ROBOTS_DISALLOWED**. `Basis: Disclosed`. (`www.census.gov` itself is reachable; `www2` is not.)

### 1.5 Verdict

**No NAPCS product line for fire-extinguisher servicing, fire-suppression servicing or kitchen
suppression was obtained.** I could not establish whether one exists. The `EC2200NAPCSPRDIND`
payload is capped server-side at 396 rows and the cap falls roughly 6,000 NAPCS codes short of
the services range; there is no offset, page or dimension filter on the keyless endpoint that
moves past it. **Closing this requires a Census API key.** That is a 10-minute registration,
not a research problem, and it is the single highest-value unblock in this stream.

---

## 2. Route 4 — Cintas Corporation. **The best primary source available, and it does not size the market.**

### 2.1 The disclosed revenue line

**Source: Cintas FY2025 Form 10-K, accession 0000723254-25-000017, FYE 2025-05-31, XBRL
rendered revenue-disaggregation exhibit `R11.htm`.**
https://www.sec.gov/Archives/edgar/data/723254/000072325425000017/R11.htm

| Operating segment | FY2025 | FY2024 | FY2023 |
|---|---:|---:|---:|
| Uniform Rental and Facility Services | 77.1% | 77.8% | 78.2% |
| First Aid and Safety Services | 11.8% | 11.1% | 10.8% |
| **Fire Protection Services** | **7.9%** | **7.6%** | **7.1%** |
| Uniform Direct Sales | 3.2% | 3.5% | 3.9% |

`Basis: Disclosed`. The percentage column renders in full. The dollar column renders truncated
in the retrieved HTML as `$817…`, `$728…`, `$627…` (thousands), consistent in every leading
digit with the figures carried into this study — **$817,463 / $728,610 / $627,747 thousand**.
The percentage cross-check closes it: 7.9% × $10,340,181 thousand = $816,874 thousand, a 0.07%
gap against $817,463 thousand, which is rounding on the disclosed percentage (D8).

Company totals, from the FY2025 Q4 earnings release (Exhibit 99, accession 0000723254-25-000013):
total revenue **$10,340,181 thousand** (FY2025) and **$9,596,615 thousand** (FY2024); "All Other"
(= Fire Protection Services **plus** Uniform Direct Sales) **$1,146,018** and **$1,064,082
thousand**. `Basis: Disclosed`.
https://www.sec.gov/Archives/edgar/data/723254/000072325425000013/ex992025-5x31.htm

**No FY2026 10-K exists yet.** Cintas's own investor page lists the 2025 Form 10-K as the most
recent annual filing as of 2026-07-29, and `q4-fy26-revenue-and-earnings.pdf` returns an
HTTP 404 response.
`Basis: Disclosed` — https://www.cintas.com/investors/financial-reports/

### 2.2 What the segment actually contains — and why it is not SV3

Item 1 of the FY2025 10-K describes the fire offering as **"fire extinguishers, sprinkler
systems and alarm testing"**. `Basis: Disclosed`. Cintas separately markets special hazard
suppression (stream 04, source 56).

**This spans all three sub-verticals.** Sprinkler ITM is SV1; alarm testing is SV2. **The
$817.463M is therefore an over-statement of Cintas's SV3 revenue and cannot be used as a pure
SV3 anchor.** Cintas does not split it further. This is the single most important caveat on
the most-cited number in this sub-vertical.

### 2.3 Every operating metric Cintas discloses

| Metric | Value at 2025-05-31 | Basis |
|---|---:|---|
| Business customers served | **more than 1 million** | Disclosed |
| Local delivery routes (company-wide) | **≈ 12,100** | Disclosed |
| Operational facilities | **478** | Disclosed |
| Distribution centres | **12** | Disclosed |
| Employee-partners (global) | **≈ 48,300** | Disclosed |
| Employee-partners represented by labour unions | **≈ 900** | Disclosed |

**None of these is broken out for Fire Protection Services.** There is no fire route count, no
fire customer count and no fire facility count in the 10-K.

The one fire-specific headcount that exists is a press release, not a filing: Cintas Fire
Protection **"employs more than 2,500 employee-partners across the United States"**, up from
**24** at the division's launch in April 2003. `Basis: Press-derived` — Businesswire,
2023-04-17.

### 2.4 The market-size statement — there isn't one

Searched Item 1, Item 1A and Item 7 of the FY2025 10-K. **Cintas states no total addressable
market, no market size and no market share, for fire protection or for any segment.** What it
states instead:

> "The primary markets served by each of the Cintas operating segments are **local in nature
> and highly fragmented**."

and that it competes with "national, regional and local providers, large national retailers and
small local retailers as well as companies with a significant online presence", and that
"[b]usinesses may decide to perform certain services **in-house** instead of outsourcing these
services." `Basis: Disclosed`, all verbatim.

**Assessment.** A route-services filer with a $10.3 billion top line and a $817 million fire
business declines to size its own fire market. That is itself evidence about the state of the
public record: the largest disclosed participant has no citable denominator either.

### 2.5 Other route-service filers

ABM Industries and Aramark were checked for a fire-protection revenue line. **Neither discloses
one.** ABM reports Business & Industry, Manufacturing & Distribution, Education, Aviation and
Technical Solutions; Aramark reports Food and Support Services and Uniform Services. Neither
taxonomy contains a fire line. **No figure is carried from either.**

---

## 3. Route 2 — the route base. **This is the denominator that survives.**

### 3.1 Commercial kitchens — the obligated site count

**Instrument: 2022 Economic Census table `EC2272BASIC`, US, `ESTAB` and `RCPTOT`.**
https://data.census.gov/api/access/data/table?id=ECNBASIC2022.EC2272BASIC&g=010XX00US&y=2022
`Basis: Disclosed` — retrieved 2026-07-29. Population measured: **employer establishments** in
sector 72, reference year 2022. Non-employers are excluded.

| NAICS2022 | Label | Establishments | Receipts ($1,000) |
|---|---|---:|---:|
| 722 | Food Services and Drinking Places | **701,875** | 900,617,869 |
| 7225 | Restaurants and Other Eating Places | 608,144 | 800,120,264 |
| **722511** | **Full-Service Restaurants** | **254,201** | 372,803,601 |
| **722513** | **Limited-Service Restaurants** | **271,243** | 358,864,144 |
| **722514** | **Cafeterias, Grill Buffets, and Buffets** | **4,590** | 5,683,111 |
| 722515 | Snack and Nonalcoholic Beverage Bars | 78,110 | 62,769,408 |
| 7223 | Special Food Services | 52,820 | 66,844,163 |
| 722310 | Food Service Contractors | 30,086 | 50,858,684 |
| 722320 | Caterers | 12,579 | 12,966,223 |
| 722330 | Mobile Food Services | 10,155 | 3,019,256 |
| 722410 | Drinking Places (Alcoholic Beverages) | 40,911 | 33,653,442 |
| 721 | Accommodation | 70,566 | 295,697,706 |
| **721110** | **Hotels (except Casino Hotels) and Motels** | **56,260** | 206,193,557 |
| **721120** | **Casino Hotels** | **400** | 75,928,928 |
| 721191 | Bed-and-breakfast inns | 2,390 | 1,176,816 |
| 7213 | Rooming/Boarding Houses, Dormitories, Workers' Camps | 1,456 | 1,968,338 |

**This is the unit count a prior stream could not find at the National Restaurant Association.
It was in the Economic Census the whole time.**

Institutional kitchens, from their own primary registries:

| Population | Count | Vintage | Source | Basis |
|---|---:|---|---|---|
| Operating public elementary and secondary schools | **99,297** | SY 2023-24 | NCES CCD "Public Elementary/Secondary School Universe Survey," 2023-24, Final Version 1a, Table 3 | Disclosed |
| Private schools | **30,492** | SY 2019-20 | NCES Digest Table 105.50 | Disclosed |
| All US registered hospitals | **6,100** | 2024 AHA Annual Survey | AHA Fast Facts on U.S. Hospitals, 2026 | Disclosed |
| — of which community hospitals | 5,121 | same | same | Disclosed |
| CMS-certified nursing facilities | **14,742** | July 2025 | KFF, from CMS Nursing Home Compare / CASPER | Disclosed |

**Not enumerated, and therefore excluded from the count:** correctional facilities, degree-granting
postsecondary institutions, corporate/campus dining halls, military dining, stadiums and arenas,
non-hotel casinos, convenience stores with fryers, and grocery hot-bar/deli operations. **Every
one of these carries an NFPA 96 obligation.** The count below is a floor for that reason.

**Core obligated commercial-kitchen base: 737,325 sites** (D5). `Basis: Estimated` from
Disclosed components.

> **CONFLICT — restaurant unit count. Three sources, three numbers, not averaged.**
> - **701,875** — US Census, 2022 Economic Census `EC2272BASIC`, NAICS 722, employer
>   establishments. `Basis: Disclosed`.
> - **"more than 1 million restaurant and foodservice outlets"** — National Restaurant
>   Association, 2026 State of the Restaurant Industry, published 2026-02-12, alongside
>   $1.55 trillion projected 2026 sales and 15.8 million jobs. `Basis: Disclosed`.
> - **"nearly 750,000 restaurants in the United States alone"** — HOODZ franchise marketing
>   page, no date. `Basis: Press-derived`.
>
> These measure different things. Census counts **employer establishments in NAICS 722** in
> **2022**; NRA counts **"restaurant and foodservice outlets"** in **2026**, a definition that
> plausibly includes non-employer operations, in-store foodservice inside retail and grocery,
> and institutional outlets that Census classifies outside 722. **I would underwrite on the
> Census figure for an establishment denominator and treat the NRA figure as the outlet-level
> ceiling.** The gap between them — roughly 300,000 outlets — is itself the size of the
> "institutional and in-store kitchen" layer that Census 722 does not see, which is consistent
> with the 207,291 institutional sites counted separately above.

### 3.2 Portable extinguishers — the installed base, derived from code

Building stock, `Basis: Disclosed` (EIA CBECS 2018; 2018 data year, released 2021-2022; carried
forward from stream 08 §-CBECS, which flags that **no 2024 CBECS exists**):

- **5,918 thousand commercial buildings**
- **96,423 million sq ft of commercial floorspace**

Spacing rule, `Basis: Disclosed` — **Cal. Code Regs. tit. 19, § 568, Table 2**, "Fire
Extinguisher Size and Placement for Class A Hazards", which codifies the NFPA 10 Class A
distribution table into enforceable state law:

| Occupancy hazard | Min. rated single extinguisher | Max. floor area **per unit of A** | Max. floor area **for extinguisher** | Max. travel distance |
|---|---|---:|---:|---:|
| Light (low) | 2-A | 3,000 sq ft | **11,250 sq ft** | 75 ft |
| Ordinary (moderate) | 2-A | 1,500 sq ft | **11,250 sq ft** | 75 ft |
| Extra (high) | 4-A | 1,000 sq ft | **11,250 sq ft** | 75 ft |

**Why this is the right instrument.** It is a legally binding maximum spacing, published by a
state, so an extinguisher count derived from it is a *code floor* rather than a guess. Every
compliant commercial building must carry at least this density.

| Basis of density | Sq ft per extinguisher | Implied US installed base | Derivation |
|---|---:|---:|---|
| Absolute code cap, all hazard classes | 11,250 | **8,570,933** | D1 |
| 4-A rated 10 lb ABC unit, **ordinary** hazard | 6,000 | **16,070,500** | D2 |
| 4-A rated 10 lb ABC unit, **extra** hazard | 4,000 | **24,105,750** | D3 |

`Basis: Estimated` (D1–D3) from Disclosed inputs. **Band: 8.57 million to 24.11 million
portable extinguishers in US commercial buildings, central case ≈ 16.07 million.**

**What this band excludes, and therefore understates:** manufacturing and industrial floorspace
(CBECS does not cover it), multifamily residential common areas, vehicle and fleet extinguishers,
marine, and any building under 1,000 sq ft.

**I found no source — NFPA, NAFED or manufacturer — stating an installed base or an
annual-units-serviced figure for US portable extinguishers.** Searched directly. The only
results were content-farm statistics aggregators with no methodology, which are not cited here.
**The derived band above is the whole of what this study has.**

### 3.3 The frequency layer that makes these counts an annuity

From stream 02 (`02-codes-and-mandate.md` §3.1, §3.2, and its annual-visit build), all
`Basis: Disclosed` against the cited NFPA editions:

- **Portable extinguishers, NFPA 10:** annual maintenance by a qualified party; monthly
  inspection is owner-performed under §7.2.1. Six-year internal maintenance and 12-year
  hydrostatic test on stored-pressure dry chemical.
- **Kitchen wet chemical, NFPA 17A (2009) §7.3.3:** "At least **semiannually**, maintenance
  shall be conducted." Dry chemical, NFPA 17 (2009) §11.3.1: same interval.
- **Hood and duct cleaning, NFPA 96:** frequency by cooking volume — solid fuel monthly,
  high-volume quarterly, moderate-volume semiannual, low-volume annual. (Stream 02 preserves a
  three-way conflict on the *section number* — Table 11.4 / Table 12.4 / §12.6.1 — but not on
  the schedule itself.)
- **Clean agent, NFPA 2001:** 2022 edition — monthly visual, semiannual container check, annual
  functional test. Enclosure integrity / door-fan test to ASTM E2174 verifying a 10-minute hold.
- **Halon 1301, NFPA 12A (2009) §6.1.1:** semiannual thorough inspection.

**So the obligated-site count converts to visits per year without an assumption: 1 for
extinguishers, 2 for kitchen suppression, and 1 to 12 for hood cleaning depending on volume.**

---

## 4. Route 6 — state licence registries. **Fire-specific by construction, but they do not scale.**

### 4.1 Utah State Fire Marshal — company licence tables

Retrieved 2026-07-29 from `firemarshal.utah.gov/licensees/`, which publishes a live table per
licence class. `Basis: Disclosed`. Population measured: **companies holding a current Utah
licence in that class**, including out-of-state firms.

| Utah licence class | Companies |
|---|---:|
| **Fire Extinguisher Companies** | **246** |
| **Fire Suppression Companies** | **92** |
| **Kitchen Exhaust Systems Companies** | **51** |
| Automatic fire sprinkler | **not published at company level** — Utah publishes technicians only |

### 4.2 Nevada State Fire Marshal — licensing list

`Basis: Disclosed` — "Licensing Website List", document date **2022-03-07**, published at
`fire.nv.gov`. Population measured: **licences held**, by class. A firm holding two classes
appears twice, so these are not disjoint firm counts.

| Nevada licence class | Count |
|---|---:|
| **Portable Fire Extinguishers (E)** | **84** |
| **Sale of Portable Fire Extinguishers (RSFE)** | **298** |
| **Pre-Engineered / Engineered Fixed Extinguishing Systems (E1-E2)** | **50** |
| **Hood and Duct Cleaning (H)** | **40** |
| Automatic Fire Sprinkler Systems (G) | 149 |
| Underground Fire Sprinkler Work (GU) | 217 |
| Residential Automatic Fire Sprinkler Systems (J) | 83 |
| Standpipe Systems (I) | 44 |
| Fire Alarms / Protective Signaling Systems (F) | 171 |
| Backflow Testing (BF) | 50 |
| Private Hydrants (PH) | 44 |
| Medical Gas Installation (MG) | 18 |
| Pyrotechnic Companies (P) | 39 |
| Flame Effects (FE) | 19 |

**The structurally useful number here is the ratio, not the level.** In Nevada, portable-extinguisher
service licences are **84 ÷ 149 = 56.4%** of automatic-fire-sprinkler company licences (D9).
`Basis: Estimated`. That is the only registry-based read this study has on SV3's size relative
to SV1, and it is one state on a four-year-old list.

### 4.3 Why this route does not produce a national establishment count

Scaling the two state counts to national population produces figures that disagree by a factor
of 2.7 (D10): Utah's 246 extinguisher companies scale to **≈ 23,900** nationally; Nevada's 84
portable-extinguisher licences scale to **≈ 8,900**. `Basis: Estimated`. **These are not
averaged and neither is asserted as a national count.** The divergence is explained, not
resolved: both registries include out-of-state firms holding a licence to work in that state,
so per-capita scaling double-counts national platforms once per state they operate in. **A
national establishment count cannot be built this way.** It could be built by deduplicating
firm names across all 50 registries — a real but much larger job.

### 4.4 States checked and not obtained

- **Texas (TDI State Fire Marshal's Office).** Licence classes confirmed to exist for fire
  extinguisher registered firms and technicians. The licensee portal at
  `appscenter.tdi.texas.gov/reports/p/sfmo` is a **search form that returns no aggregate count**,
  and no downloadable registry was found. `Basis: Disclosed` (the absence, not a count).
- **Florida (DFS / State Fire Marshal).** Rule chapter **69A-21, "Fire Extinguishers and
  Pre-Engineered Systems"** confirms a permit and licence regime exists. **No licensee count
  obtained.**
- **Delaware.** A public Fire Extinguisher Licensee list PDF is indexed at
  `statefiremarshal.delaware.gov/wp-content/uploads/sites/110/2025/05/publicFELListPdfMAY.pdf`
  but returns **HTTP 404** at that path. **No count obtained.**
- **California (SFM).** Not reached in this run.

---

## 5. Route 3 — associations. **Nothing. All four blocked or silent.**

| Body | What was tried | Result |
|---|---|---|
| **NAFED** | `nafed.org/about`, `nafed.org/join-now.html` | **ROBOTS_DISALLOWED** on both |
| **NAFED** | `web.nafed.org/search` (member directory) | Reachable. **Search form only — publishes no membership total**, and no result-count is exposed without a query |
| **NAFED** | `thebigredguide.com` profile page | Behind an Incapsula challenge; returned no content |
| **FSSA** | `fssa.net/aboutindustry` ("What is Special Hazard Fire Protection?") | Reachable. **Contains no member count, no market value, no systems-installed figure.** Definitional content only |
| **IKECA** | `ikeca.org/page/aboutikeca` | **HTTP 403** |
| **NFPA / USFA** | Searched for an installed-base or units-serviced statistic | No such publication surfaced |

**No association membership number is asserted in this document.** The nearest datum in the
whole study remains stream 06's: ORR Protection self-reports **4 NAFED-certified associates**
across 15 branches, which is a certification count at one firm, not an industry count.

---

## 6. Route 5 — bottom-up from the named platforms. **Fragments, no aggregate.**

| Platform | Disclosed operating datum | Basis |
|---|---|---|
| **ORR Protection** (special hazard) | FY2025 revenue **$169,428,932**; RMR **$1,254,129**; SDM 100 rank **#32**; **15 branches**; **"more than 8,000 sites"** protected annually; "over 40 percent of the Fortune 100" as customers; 42 NICET- and 4 NAFED-certified associates | Press-derived (revenue/RMR, via stream 04, flagged unverified there) / Disclosed (site and branch counts, company site) |
| **Relay Fire and Safety** (Riverside) | Riverside invested **December 2022**. Scope stated as "fire alarms, fire sprinkler systems, **fire extinguishers**, fire pumps, **fire suppression systems**, intercom, access control, security, video". Add-ons: Advanced Fire Protection Systems (Feb 2023), Metro Fire Inspections (Dec 2023), Accurate Fire Equipment (Sep 2025). Target geography Northeast and mid-Atlantic | Disclosed (riversidecompany.com portfolio page) |
| **Relay Fire and Safety** | **No revenue, no location count, no customer count published** | — |
| **EverSmith Brands** (Riverside) | **500th franchise territory awarded**, announced 2024-11-19. Portfolio: **Kitchen Guard**, U.S. Lawns, Millicare, Clintar, Prism Specialties. Kitchen Guard awarded **30+ new territories in 2024** | Disclosed (PRWeb, 2024-11-19) |
| **Kitchen Guard** | **"eclipses 115 sold territories"** (stated 2026); described as "a multi-million-dollar business", HQ San Diego, "has dominated the Southern California market" | Press-derived (kitchenguardfranchise.com) |
| **Green Guard** (Riverside add-on to EverSmith, 2023-04-18) | Commercial kitchen exhaust cleaning; **served over 400 customers across eight states in 2022**; HQ Escondido, CA. Riverside describes the KEC market as "underserved" | Disclosed (riversidecompany.com release, 2023-04-18) |
| **Facilitec (Southwest)** | Publishes a dated hood-cleaning price and frequency guide — see §7.2 | Disclosed |
| **HOODZ** | Franchise marketing cites "nearly 750,000 restaurants in the United States alone" | Press-derived |
| **Enviromatic, Hood-Z, and the extinguisher arms of Pye-Barker, Marmic and Summit** | **No revenue, location or customer count found** | — |

> **Trap flagged explicitly.** EverSmith's **500 franchise territories** is a portfolio-wide
> figure spanning commercial landscaping (U.S. Lawns, Clintar), floor care (Millicare) and
> restoration (Prism). **It is not a kitchen-exhaust unit count.** The kitchen-exhaust unit
> count inside EverSmith is Kitchen Guard's **115 sold territories**. Anyone reading 500 as an
> SV3 number would overstate that platform by roughly 4.3×.

**A bottom-up aggregate cannot be built from these.** Two of the eight named SV3 operators
disclose a revenue figure, and one of those two (ORR) is carried unverified. There is no
platform census to sum.

---

## 7. The bottom-up estimate, with every assumption stated

### 7.1 Extinguisher layer

**Unit prices, from a dated operator source.** IronClad Fire Protection, published **2025-11-07**,
`Basis: Press-derived` (an operator's published price guide, not a filing):

| Service | Price per extinguisher |
|---|---|
| Annual inspection/maintenance | **$15 – $30** |
| Six-year maintenance | **$40 – $80** |
| Twelve-year hydrostatic test | **$50 – $100+** |
| Recharge after use, 5-10 lb ABC | $40 – $60 |
| Recharge after use, Class K kitchen | $100 – $150 |
| Recharge after use, clean agent | $150 – $300+ |

Its worked site examples, same source: 8 extinguishers → **$220-320/yr**; 18 → **$480-630/yr**;
12 (restaurant) → **$376-504/yr**; 45 (warehouse) → **$1,110-1,440/yr**; 60 (apartment complex)
→ **$1,320-1,800/yr**.

> **CONFLICT — price per extinguisher. Not averaged.**
> HomeGuide (consumer price aggregator, no publication date) gives **$40 – $100** for a
> professional inspection, split by agent type: ABC dry chemical $40-70, CO2 $80-120, **wet
> chemical $150-300**. `Basis: Press-derived`.
> That is **2.7× to 3.3×** IronClad's route price. The gap is a population difference, not an
> error: HomeGuide prices a **single-unit consumer/small-business call-out including the trip**,
> IronClad prices a **route stop with dozens of units under one trip charge**. **I would
> underwrite SV3 on the route price ($15-30), because SV3 is by definition a route business** —
> and I would use the consumer price only when modelling one-off retail service.

**Result (D4), on the central 16,070,500-unit base at route pricing:**

| Line | Annual units serviced | Revenue |
|---|---:|---:|
| Annual maintenance | 16,070,500 | $241.1M – $482.1M |
| Six-year maintenance (1/6 of stock) | 2,678,417 | $107.1M – $214.3M |
| Twelve-year hydrostatic (1/12 of stock) | 1,339,208 | $67.0M – $133.9M |
| **Extinguisher ITM annuity, central case** | | **$415.2M – $830.3M** |

At the 8.57M code floor: **$221.4M – $442.8M**. At the 24.11M extra-hazard bound:
**$622.8M – $1,245.5M**. `Basis: Estimated` (D4).

**Excluded from this line, every one of them real revenue:** new extinguisher sales, cabinets,
signage and mounting, recharge after discharge, installation, and all floorspace CBECS does not
cover.

### 7.2 Kitchen layer

**Hood and duct cleaning prices — two dated operator guides, preserved as a conflict.**

**Facilitec Southwest**, published **2026-06-16**, updated **2026-07-01**, `Basis: Press-derived`.
The page carries its own disclaimer that these are "industry-typical 2026 ranges from publicly
available pricing across the Southwest, not Facilitec Southwest's actual pricing":

| Kitchen | Per visit |
|---|---|
| Single-hood low-volume (church, day camp, senior centre) | **$300 – $700** |
| Standard sit-down restaurant, single hood | **$450 – $1,200** |
| High-volume, multi-hood, 24-hour | **$600 – $1,800** |
| Large/complex (multi-hood, solid fuel, casino) | **$1,000 – $3,500+** |

Frequency, same source: solid-fuel monthly, high-volume quarterly, moderate-volume semiannual,
low-volume annual. Worked example: "A high-volume restaurant on a quarterly schedule at $1,200
per visit spends **$4,800 per year**."

**Total Fire Protection**, published **2026-06-08**, `Basis: Press-derived`:

| System | Per visit | National average |
|---|---|---|
| Single hood, small | $200 – $450 | $325 |
| Single hood, standard | $400 – $800 | $600 |
| Multiple hoods (2-4) | $800 – $1,500 | $1,150 |
| Large system (5+ hoods) | $1,500 – $2,500 | $2,000 |

Annual by NFPA 96 frequency, same source: solid-fuel monthly **$7,200-14,400**; quarterly
**$2,400-6,000**; **semiannual $1,800-4,800**; annual schedule $900-2,400 per year. Add-ons
priced separately: ductwork at $150-400 per 10 ft, filter replacement at $30-80 each. Labour is
quoted at **"$104 per hour nationally"** for a two-technician crew.

> **CONFLICT — annual cost of a semiannual hood-cleaning schedule. Not averaged.**
> Facilitec's standard single-hood range implies **$900 – $2,400 per year** on a semiannual
> schedule. Total Fire Protection publishes **$1,800 – $4,800 per year** for the same schedule.
> TFP's figure is roughly 2× Facilitec's because TFP's semiannual band is weighted to multi-hood
> systems while Facilitec's is a single-hood price. **Both are carried below as a range on the
> kitchen layer rather than resolved.**

**Wet-chemical suppression service — no usable price obtained, and none is generated.**
The only semiannual suppression-inspection price found is Kinetix Fire (published 2021-02-25,
modified 2021-12-07): **$500-800 semiannual**, with annual figures of $800-1,000 for systems
under 30 detectors and $1,800-2,000 above 30. `Basis: Press-derived`. **That is an
engineered-system detector-count price, not a restaurant hood-system price**, and applying it
to 737,325 restaurant kitchens would be a category error of exactly the kind this study is
trying to avoid. FireTron (published 2025-08-16) gives **install** cost only — "$3,000 to
$5,000 for wet chemical kitchen hood suppression systems" in Texas, against a table range of
$2,000-6,000. **The NFPA 17A semiannual service line is therefore left out of the arithmetic
entirely.** It is real revenue, twice a year, at every one of 737,325 sites, and this estimate
does not contain it.

**Result (D6), hood and duct cleaning only, all 737,325 sites on the semiannual schedule:**

| Price basis | Annual per site | US total |
|---|---|---:|
| Facilitec, standard single hood, 2 visits | $900 – $2,400 | **$663.6M – $1,769.6M** |
| Total Fire Protection, published semiannual band | $1,800 – $4,800 | **$1,327.2M – $3,539.2M** |

`Basis: Estimated` (D6). **Not averaged.** The semiannual assumption is itself conservative
against NFPA 96: any site in the high-volume or solid-fuel tier is on a quarterly or monthly
schedule at 2× to 6× this frequency.

### 7.3 SV3 partial total, and why I think it is low

**D7 — central-case sum, service revenue only:**

| Layer | Low | High |
|---|---:|---:|
| Extinguisher ITM (16.07M units, route pricing) | $415.2M | $830.3M |
| Hood/duct cleaning (737,325 sites, semiannual, Facilitec pricing) | $663.6M | $1,769.6M |
| **Partial SV3 recurring service revenue** | **$1,078.8M** | **$2,599.9M** |

**≈ $1.1 billion to $2.6 billion per year.** `Basis: Estimated` (D7).

**Everything this excludes:** the entire NFPA 17A wet-chemical suppression service line (no
price obtained); the entire clean-agent and industrial special-hazard layer (no unit count and
no price obtained — FSSA publishes neither); all equipment sales; all installation; recharge
after discharge; kitchen-system installs at $2,000-6,000 each; hood-system repairs and filter
supply; and all extinguishers in industrial, multifamily and vehicle applications outside CBECS.

**Sanity check against Cintas, and it fails in a specific direction (D11).** Cintas alone books
**$817.463M** of Fire Protection Services revenue. If the whole SV3 service pool were
$1.1-2.6 billion, and even if only half of Cintas's fire line were SV3, Cintas would hold
**16% to 38%** of a market its own 10-K calls "highly fragmented". **That is not credible.**

I am not adjusting the estimate to fix it. The three most likely explanations, in order:

1. **Real extinguisher density materially exceeds the code-minimum spacing.** The 75-ft travel
   distance in a partitioned building — corridors, stairwells, kitchens, mechanical rooms, one
   per floor per stair — drives counts well above the area-based maxima used in D1-D3. **No
   source giving observed extinguishers-per-square-foot or per-building was found**, so the
   correction cannot be sized.
2. **CBECS is the wrong universe for extinguishers.** It excludes manufacturing and industrial
   floorspace, which is the extra-hazard, highest-density tier, and excludes multifamily common
   areas and vehicle fleets entirely.
3. **The excluded lines are the majority of the money.** Equipment sales, installation, recharge
   and the untimed suppression-service annuity are all missing from D7, and SV3 is materially a
   product-plus-service business, not a pure ITM annuity.

**Read D7 as a floor on SV3 service revenue, not as SV3.**

---

## 8. What this changes for the study

1. **SV3 now has a denominator, and it is a site count, not a dollar figure.** ≈737,325
   code-obligated commercial kitchens and 8.6-24.1 million commercial portable extinguishers
   across 5.918 million buildings. Both are derived from primary registries and codified law,
   both carry stated exclusions, and both are floors.
2. **SV1 and SV3 are not comparable on a like basis, and the master should say so.** SV1's
   $12.0186 billion (Census `CONKB` 8221) is *value of business done by construction
   establishments*. SV3's number is a bottom-up service-revenue floor of $1.1-2.6 billion that
   omits equipment, install and two whole service lines. **Presenting them side by side as
   "$12.0B vs $1.1-2.6B" would be a methodological error.** What can be said: on the one
   registry that publishes both, Nevada, **portable-extinguisher service licences are 56.4% of
   sprinkler-company licences** — so SV3's *firm population* is of the same order as SV1's,
   even though its measured revenue is not.
3. **Cintas is the right comparable and the wrong TAM source.** Its $817.463M fire line is the
   largest disclosed route-based fire revenue in the US and grew 30.2% over two years
   ($627.747M → $817.463M, D12). It is also cross-sub-vertical, unbroken-out, and accompanied
   by **no market-size claim whatsoever**.
4. **One unblock is worth more than any further searching: a Census API key.** The NAPCS route
   is a 396-row server cap away from an answer, and the keyed endpoint has no such cap.

---

## Derivations

**D1 — Extinguisher installed base, absolute code floor.**
96,423 million sq ft = 96,423,000,000 sq ft. Cal. Code Regs. tit. 19 §568 Table 2 caps
"maximum floor area for extinguisher" at 11,250 sq ft in all three hazard classes.
96,423,000,000 ÷ 11,250 = **8,570,933** extinguishers. `Basis: Estimated`.

**D2 — Extinguisher installed base, ordinary hazard, 4-A unit.**
A 10 lb ABC extinguisher rated 4-A:60-B:C is the common commercial unit. Ordinary-hazard maximum
floor area per unit of A = 1,500 sq ft, so one 4-A unit covers 4 × 1,500 = 6,000 sq ft.
96,423,000,000 ÷ 6,000 = **16,070,500**. `Basis: Estimated`.

**D3 — Extinguisher installed base, extra hazard, 4-A unit.**
Extra-hazard maximum floor area per unit of A = 1,000 sq ft; 4 × 1,000 = 4,000 sq ft.
96,423,000,000 ÷ 4,000 = **24,105,750**. `Basis: Estimated`.

**D4 — Extinguisher ITM revenue, central case.**
Annual maintenance: 16,070,500 × $15 = $241,057,500; × $30 = $482,115,000.
Six-year maintenance: 16,070,500 ÷ 6 = 2,678,417 units/yr; × $40 = $107,136,667; × $80 = $214,273,333.
Twelve-year hydrostatic: 16,070,500 ÷ 12 = 1,339,208 units/yr; × $50 = $66,960,417; × $100 = $133,920,833.
Sum low $415,154,583; sum high $830,309,167. **$415.2M – $830.3M**. `Basis: Estimated`.
Same arithmetic on 8,570,933 units gives $221.4M – $442.8M; on 24,105,750 units, $622.8M – $1,245.5M.

**D5 — Core obligated commercial-kitchen count.**
Census 2022 `EC2272BASIC`: 722511 254,201 + 722513 271,243 + 722514 4,590 = **530,034**.
Institutional and lodging: public schools 99,297 + private schools 30,492 + hospitals 6,100 +
nursing facilities 14,742 + hotels/motels 56,260 + casino hotels 400 = **207,291**.
530,034 + 207,291 = **737,325**. `Basis: Estimated` from Disclosed components.
**Deliberately excluded** (would raise it): 722515 snack bars 78,110; 722410 drinking places
40,911; 722310 food service contractors 30,086; 722320 caterers 12,579; 722330 mobile food
10,155; and all corrections, postsecondary, corporate dining, military, stadium, non-hotel
casino, C-store and grocery-deli kitchens, which are not enumerated in this study.

**D6 — Hood and duct cleaning revenue, semiannual schedule.**
Facilitec basis: 737,325 × $900 = $663,592,500; × $2,400 = $1,769,580,000.
Total Fire Protection basis: 737,325 × $1,800 = $1,327,185,000; × $4,800 = $3,539,160,000.
`Basis: Estimated`. **The two bases are not averaged.**

**D7 — SV3 partial recurring service total.**
Low: $415,154,583 + $663,592,500 = **$1,078,747,083**.
High: $830,309,167 + $1,769,580,000 = **$2,599,889,167**.
**≈ $1.08 billion – $2.60 billion.** `Basis: Estimated`. Excludes the NFPA 17A suppression-service
line, the entire clean-agent/special-hazard layer, equipment sales, installation and recharge.

**D8 — Cintas Fire Protection Services, percentage cross-check.**
0.079 × $10,340,181 thousand = **$816,874 thousand**, against the carried $817,463 thousand.
Difference $589 thousand = **0.072%**, within rounding on a disclosed one-decimal percentage.
`Basis: Estimated` from Disclosed.

**D9 — Nevada extinguisher-to-sprinkler licence ratio.**
84 portable-fire-extinguisher licences ÷ 149 automatic-fire-sprinkler-system licences =
**0.5638 → 56.4%**. `Basis: Estimated`. Licences, not firms; one firm may hold several.

**D10 — Why state-licence scaling fails, shown arithmetically.**
Utah: 246 companies × (340,000,000 ÷ 3,500,000 population) = **23,897**.
Nevada: 84 licences × (340,000,000 ÷ 3,200,000) = **8,925**.
Ratio 23,897 ÷ 8,925 = **2.68×**. `Basis: Estimated`. **Neither figure is asserted as a
national count**; the derivation exists to show the route's failure, not its result.

**D11 — Cintas implied share of the D7 pool.**
$817,463 thousand ÷ $2,599,889 thousand = **31.4%** if all of Cintas's fire revenue were SV3;
÷ $1,078,747 thousand = **75.8%**. On an assumed half-SV3 split of Cintas's fire line, the
implied share is 15.7% to 37.9% of the pool. `Basis: Estimated`. **This is presented as evidence that D7 is too low**, not as a share estimate.

**D12 — Cintas Fire Protection Services growth.**
$817,463 ÷ $627,747 = 1.3022 → **+30.2% over two years**; CAGR = 1.3022^0.5 − 1 = **+14.1%**.
Year on year FY2024→FY2025: $817,463 ÷ $728,610 = **+12.2%**. `Basis: Estimated` from Disclosed.

**D13 — Cintas fire revenue per employee-partner, vintage-matched.**
The 2,500+ Fire Protection employee-partner count is dated April 2023; the vintage-matched
revenue is FY2023 (FYE 2023-05-31) of $627,747 thousand.
$627,747,000 ÷ 2,500 = **$251,099 per employee-partner**. `Basis: Estimated`.
Compare stream 06's company-wide Cintas figure of $214,082 (FY2025). The fire division sits
**above** the company average on this measure, which is consistent with a higher-value,
lower-frequency service call than a uniform route stop.

---

## Sources

**Census — Economic Census 2022 (all retrieved 2026-07-29, no API key)**
- `EC2272BASIC`, Accommodation and Food Services summary statistics, US — https://data.census.gov/api/access/data/table?id=ECNBASIC2022.EC2272BASIC&g=010XX00US&y=2022
- `EC2200NAPCSPRDIND`, Selected Sectors: Products by Industry, US — https://data.census.gov/api/access/data/table?id=ECNNAPCSPRD2022.EC2200NAPCSPRDIND&g=010XX00US&y=2022
- `EC2200NAPCSINDPRD`, Selected Sectors: Industry by Products, US — https://data.census.gov/api/access/data/table?id=ECNNAPCSIND2022.EC2200NAPCSINDPRD&g=010XX00US&y=2022
- Census API key requirement, verbatim error — https://api.census.gov/data/2022/ecnnapcsprd
- NAPCS code list landing page (file itself robots-blocked on www2) — https://www.census.gov/programs-surveys/economic-census/technical-documentation/code-lists/product-codes-descriptions.html

**Cintas Corporation (NASDAQ: CTAS)**
- FY2025 Form 10-K, accession 0000723254-25-000017, FYE 2025-05-31, primary document `ctas-20250531.htm` — https://www.sec.gov/Archives/edgar/data/723254/000072325425000017/ctas-20250531.htm
- Revenue disaggregation by operating segment, rendered exhibit R11 — https://www.sec.gov/Archives/edgar/data/723254/000072325425000017/R11.htm
- FY2025 Q4 earnings release, Exhibit 99, accession 0000723254-25-000013 — https://www.sec.gov/Archives/edgar/data/723254/000072325425000013/ex992025-5x31.htm
- Investor financial reports index (confirms no FY2026 10-K as at 2026-07-29) — https://www.cintas.com/investors/financial-reports/
- "Cintas' Fire Protection Division Celebrates 20 Years of Impact", Businesswire, 2023-04-17 — https://www.businesswire.com/news/home/20230417005020/en/Cintas-Fire-Protection-Division-Celebrates-20-Years-of-Impact

**Codes and standards**
- Cal. Code Regs. tit. 19, § 568, Fire Extinguisher Size and Placement for Class A Hazards — https://www.law.cornell.edu/regulations/california/19-CCR-568
- NFPA 10, NFPA 96, NFPA 17, NFPA 17A, NFPA 2001, NFPA 12A frequencies — carried from `02-codes-and-mandate.md` §3.1-§3.3 with its own conflicts preserved there

**Obligated-site registries**
- NCES, Common Core of Data, "Public Elementary/Secondary School Universe Survey," 2023-24 Final Version 1a, Table 3 — https://nces.ed.gov/ccd/tables/202324_summary_3.asp
- NCES Digest of Education Statistics Table 105.50, private schools 2019-20 — https://nces.ed.gov/fastfacts/display.asp?id=84
- AHA, Fast Facts on U.S. Hospitals, 2026 (2024 AHA Annual Survey) — https://www.aha.org/system/files/media/file/2026/02/Fast-Facts-on-US-Hospitals-2026.pdf
- KFF, "A Look at Nursing Facility Characteristics", certified facilities as of July 2025, from CMS Nursing Home Compare / CASPER — https://www.kff.org/medicaid/a-look-at-nursing-facility-characteristics/
- National Restaurant Association, 2026 State of the Restaurant Industry press release, 2026-02-12 — https://restaurant.org/research-and-media/media/press-releases/persistent-cost-increases-and-enduring-demand-will-shape-the-restaurant-industry-in-2026/
- EIA CBECS 2018 building and floorspace totals — carried from `08-demand-drivers.md` §CBECS

**State licence registries**
- Utah State Fire Marshal, licensee tables index — https://firemarshal.utah.gov/licensees/
- Utah, Fire Extinguisher Companies — https://firemarshal.utah.gov/licensees/fire-extinguisher-companies-table/
- Utah, Fire Suppression Companies — https://firemarshal.utah.gov/licensees/fire-suppression-companies-table/
- Utah, Kitchen Exhaust Systems Companies — https://firemarshal.utah.gov/licensees/kitchen-exhaust-systems-companies-table/
- Nevada State Fire Marshal, Licensing Website List, dated 2022-03-07 — https://fire.nv.gov/uploadedFiles/firenvgov/content/bureaus/FPL/LicensingWebsitelist03072022.pdf
- Texas Department of Insurance, fire extinguisher licensing — https://www.tdi.texas.gov/fire/fmliexting.html and licensee portal https://appscenter.tdi.texas.gov/reports/p/sfmo
- Florida Administrative Code chapter 69A-21, Fire Extinguishers and Pre-Engineered Systems — https://www.myfloridacfo.com/docs-sf/state-fire-marshal-libraries/sfm-documents/bfp/florida-fire-prevention-code/69a-21.pdf

**Associations (all negative results)**
- NAFED member directory — https://web.nafed.org/search
- FSSA, "What is Special Hazard Fire Protection?" — https://www.fssa.net/aboutindustry

**Platforms**
- Riverside Company, Relay Fire and Safety portfolio page — https://www.riversidecompany.com/investment-portfolio/relay-fire-and-safety
- Riverside Company, Green Guard investment release, 2023-04-18 — https://www.riversidecompany.com/currents/greenguard-news-release/
- EverSmith Brands, 500th franchise territory, PRWeb, 2024-11-19 — https://www.prweb.com/releases/eversmith-brands-reaches-milestone-with-500th-franchise-territory-awarded-302306995.html
- Kitchen Guard franchise, "Disrupting the Industry" — https://kitchenguardfranchise.com/about/
- ORR Protection figures — carried from `04-consolidators-b.md` and `06-unit-economics.md`

**Pricing (all Press-derived, all dated where the source shows a date)**
- IronClad Fire Protection, "How Much Does Fire Extinguisher Service Really Cost?", 2025-11-07 — https://www.ironcladfireprotection.com/blog/what-fire-extinguisher-service-really-costs/
- HomeGuide, fire extinguisher inspection cost, no date shown — https://homeguide.com/costs/fire-extinguisher-inspection-cost
- Facilitec Southwest, "Commercial Kitchen Hood Cleaning Cost — 2026 Guide", 2026-06-16, updated 2026-07-01 — https://facilitec-sw.com/pricing-business-planning/commercial-kitchen-hood-cleaning-cost-2026-guide/
- Total Fire Protection, "Kitchen Hood Cleaning Cost Guide 2026 Report", 2026-06-08 — https://www.tfp1.com/blog/kitchen-hood-cleaning-cost/
- Kinetix Fire, "What's the Cost of a Fire Suppression Inspection?", 2021-02-25 (mod. 2021-12-07) — https://kinetixfire.com/whats-the-cost-of-a-fire-suppression-inspection/
- FireTron, fire suppression system cost guide, 2025-08-16 — https://firetron.com/fire-suppression-systems/fire-suppression-system-cost/
- HOODZ franchise, hood cleaning business page, no date — https://hoodzfranchise.com/featured/hood-cleaning-business/

---

## What I could not verify

1. **Whether a NAPCS product line for fire-extinguisher or fire-suppression servicing exists at
   all.** `EC2200NAPCSPRDIND` caps at 396 rows and stops in apparel manufacturing; every
   dimension filter that would jump to sector 56 or 81 returns HTTP 400; the companion
   `EC2200NAPCSINDPRD` publishes sector totals only; sector-scoped NAPCS tables do not exist;
   the official code list on `www2.census.gov` is robots-blocked; `api.census.gov` requires a
   key. **This is answerable with a Census API key and is not answerable without one.**
2. **The exact dollar cells in Cintas's revenue-disaggregation table.** The rendered exhibit
   truncates them to `$817…`, `$728…`, `$627…` (thousands). The disclosed percentages (7.9 /
   7.6 / 7.1) and the disclosed company totals reconstruct them to within 0.07% (D8), which is
   why the figures are carried as Disclosed — but I did not read the untruncated cells.
3. **Any installed-base or annual-units-serviced figure for US portable fire extinguishers,
   from NFPA, NAFED, USFA or a manufacturer.** None found. The 8.57M-24.11M band in §3.2 is
   derived from floorspace and codified spacing, not observed.
4. **Observed extinguishers per square foot or per building.** No source. This is the single
   assumption doing the most work in D2 and the most likely reason D7 is low.
5. **NAFED membership.** `nafed.org/about` and `/join-now.html` are robots-disallowed; the
   member directory is a search form with no exposed total; the third-party profile is behind
   Incapsula. **No membership number is asserted.**
6. **IKECA membership or any IKECA sizing of the hood-cleaning market.** `ikeca.org` returned
   an HTTP 403 response on every path tried.
7. **Any FSSA figure.** Its own industry page carries no member count, market value or
   systems-installed statistic.
8. **A restaurant/commercial wet-chemical hood-suppression semiannual service price.** The only
   semiannual suppression price found (Kinetix, $500-800) is an engineered detector-count price
   and was **deliberately not applied**. The NFPA 17A service line is consequently missing from
   D7 entirely.
9. **Any clean-agent or industrial special-hazard unit count or price.** Neither a systems
   count nor a service price was obtained, so the special-hazard layer of SV3 is **entirely
   absent from the estimate**. ORR Protection's "more than 8,000 sites" across 15 branches is
   the only quantitative handle in the whole study on this layer.
10. **Texas, Florida, Delaware and California licensed-firm counts.** Texas's portal returns a
    search form with no aggregate; Florida publishes the rule but not a count; Delaware's public
    list PDF 404s at its indexed path; California was not reached. **Only Utah and Nevada
    produced counts, and §4.3 shows those two do not scale to a national figure.**
11. **A national, deduplicated count of licensed extinguisher-service firms.** Buildable from
    50 state registries with name deduplication; not built here.
12. **Revenue, location or customer counts for Relay Fire and Safety, Facilitec, Enviromatic,
    Hood-Z, and the extinguisher arms of Pye-Barker, Marmic and Summit.** None disclosed. The
    platform-sum route to a bottom-up total is not available.
13. **ABM Industries and Aramark fire-protection revenue.** Neither discloses a fire line;
    confirmed absent rather than not found.
14. **Correctional, postsecondary, corporate-dining, military, stadium and grocery-deli kitchen
    counts.** All carry NFPA 96 obligations and none is enumerated here, which is why 737,325
    is stated as a floor.
