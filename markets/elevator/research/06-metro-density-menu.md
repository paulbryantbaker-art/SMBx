<!-- run: 06 | hunt: B | date: 2026-08-11
     query: NYC Open Data elevator records dataset DOB device number; state elevator conveyance device registry open data inspection Washington Labor Industries; National Association of Elevator Contractors independent elevator companies members; QCEW NAICS 238290 other building equipment contractors employment by MSA; Texas TDLR elevator escalator registered units database download licensed contractors; Chicago elevator inspections open data portal annual inspection ordinance; Philadelphia elevator device open data licenses inspections OpenDataPhilly; Massachusetts elevator inspection data open data mass.gov conveyance number of elevators; data.texas.gov TDLR elevator dataset registered elevators open data portal; NAEC membership number of member companies independent elevator contractors 2025; Seattle SDCI elevator escalator number of registered conveyances annual operating permit count; Illinois Elevator Safety Act state fire marshal conveyance registration annual inspection Chicago exempt; "elevator" open data city portal device registry Los Angeles OR Boston OR Denver OR "San Francisco" registered conveyances count; NEII number of elevators escalators United States installed base 1 million; CTBUH skyscraper center buildings 12 floors by city; California DOSH elevator unit number of conveyances permits backlog inspectors; BLS OES "elevator and escalator installers and repairers" metropolitan area employment; Washington L&I number of elevators conveyances registered statewide annual inspection operating permit; New York City "elevator" number of devices 2025 DOB annual report inspections violations; NYC DOB licensed elevator agency directors inspectors list approved agencies directory; Florida DBPR Bureau of Elevator Safety registered elevators number of units certificate of operation data; Chicago department of buildings number of elevators conveyance devices city total 2024 2025; Miami-Dade Broward elevator annual inspection certificate of operation Florida 61C-5; plus direct Socrata SoQL aggregation queries against data.cityofnewyork.us, data.ny.gov, data.texas.gov and the Socrata discovery catalog API
     tool: web search + fetch -->

# Run 06 — US Elevator & Escalator: Metro Density & Data-Availability Menu

**Purpose.** Assemble the sourceable evidence needed to *choose* a metro for a deep-dive. The choice is the principal's. This document is a menu with the arguments for and against each item, ranked on **data availability**, not on market size.

**Method note / standing caveat.** No primary source publishes metro-level elevator service revenue. Every "$X billion [metro] elevator market" figure in circulation is derived. Nothing in this file is a metro revenue figure. Where arithmetic appears it is shown and labelled `Estimated`. Everything else is `Disclosed` (published by the body that owns the fact) or `Press-derived` (a number an agency gave a journalist or auditor).

---

## Part 0 — How I searched for registries, and what that search proves

I swept the Socrata discovery catalog, which indexes the open-data portals of most large US cities and many states, rather than guessing city by city.

| Sweep | Endpoint | Result |
|---|---|---|
| `q=elevator` | https://api.us.socrata.com/api/catalog/v1?q=elevator&only=dataset&limit=40 | **7 datasets total.** 4 of the 7 are NYC DOB elevator datasets; 1 is MTA subway elevator/escalator assets (also NYC); 2 are false positives (Chicago "Elevation Benchmarks", Edmonton LRT outages) |
| `q=elevator license` | https://api.us.socrata.com/api/catalog/v1?q=elevator+license&only=dataset&limit=30 | **13 datasets.** Adds the two NY State DOL elevator licence datasets on data.ny.gov and Oregon BCD licences |

`Disclosed` — these are the catalog's own result counts.

**This is the single most decision-relevant finding in the run.** Across the entire Socrata universe of US municipal and state open-data portals, elevator device data is essentially a *New York artifact*. Chicago has none. Los Angeles has none. Boston, Philadelphia, San Francisco, Denver, Houston have none.

**Limits of that sweep, stated honestly:** Socrata is not the only platform. CKAN, ArcGIS Hub, Accela/Tyler permit portals and bespoke agency lookups are not indexed there — and indeed I found registry-grade sources *outside* Socrata in Washington, Texas and Florida (below). I attempted the data.gov CKAN `package_search` API three times (https://catalog.data.gov/api/3/action/package_search?q=elevator...) and received HTTP 404 each time; **that check was not completed** and is logged in "What we don't know yet."

---

## Part A — Where the units actually are

### A.1 New York City — the gold seam, and it is not close

**Source: NYC Open Data — "DOB NOW Elevator Safety Compliance", dataset id `e5aq-a4j2`, NYC Department of Buildings.**
Landing page: https://data.cityofnewyork.us/Housing-Development/DOB-NOW-Elevator-Safety-Compliance/e5aq-a4j2
Metadata: https://data.cityofnewyork.us/api/views/e5aq-a4j2.json
SoQL API: https://data.cityofnewyork.us/resource/e5aq-a4j2.json

Publisher's own description, verbatim: *"This data set includes elevator inspection and report filing information through the New York City Department of Buildings' DOB NOW: Elevator Compliance Filings module. The data is collected because the Department of Buildings tracks elevator inspection information. This data include items such as device number, device status, report filing dates, inspetion dates, BIN, and other location information."* (typo "inspetion" is in the original)

**Vintage: rows last updated 2026-08-10** (`rowsUpdatedAt` = 1786394045). This is a live, effectively-daily dataset, not a stale snapshot.

Columns: `device_number`, `device_type`, `device_status`, `status_date`, `equipment_type`, `periodic_report_year`, `cat1_report_year`, `cat1_latest_report_filed`, `cat5_latest_report_filed`, `periodic_latest_inspection`, `bin`, `borough`, `house_number`, `street_name`, `block`, `lot`, `zip_code`, `latitude`, `longitude`, `communitydistrict`, `citycouncildistrict`, `bbl`, `censustract`, `ntaname`.

**Counts — all `Disclosed`, obtained by SoQL aggregation against the publisher's own API on 2026-08-11:**

Total rows: **120,257** (`$select=count(1)`)
Distinct device numbers: **120,032** (`$select=count(distinct device_number)`)
Distinct buildings (BIN) carrying a device: **47,052** (`$select=count(distinct bin)`)

Device inventory by type (distinct devices, all statuses):

| Device type | Devices |
|---|---|
| Elevator | 96,225 |
| Accessibility Lift | 8,676 |
| Personnel Hoist | 7,913 |
| Escalator | 4,291 |
| Dumbwaiter | 1,997 |
| Conveyor | 800 |
| Manlift | 113 |
| Moving Walk | 17 |

Device inventory by status (distinct devices):

| Status | Devices |
|---|---|
| Active | 93,235 |
| Removed | 20,446 |
| Work in Progress | 3,544 |
| Dismantled | 1,678 |
| Deleted | 744 |
| Withdrawn | 308 |
| Sealed | 77 |
| Revoked / other | — |

**The number that matters for an annuity thesis — ACTIVE ELEVATORS ONLY:**

Query: `$where=device_status = "Active" AND device_type = "Elevator"`

| Borough | Active elevators |
|---|---|
| Manhattan | 42,359 |
| Brooklyn | 17,293 |
| Queens | 11,322 |
| Bronx | 8,666 |
| Staten Island | 1,375 |
| **NYC total** | **81,015** |

All-status distinct devices by borough, for comparison: Manhattan 65,481 · Brooklyn 25,046 · Queens 16,068 · Bronx 11,228 · Staten Island 2,209.

Note the discipline this dataset allows and no other metro does: you can separate the **live maintenance base (81,015 active elevators)** from the **registry-inflated base (120,032 device records)**. Any broker or seller quoting "120,000 elevators in New York" is quoting a number that includes 20,446 removed and 1,678 dismantled units. That distinction is worth real money in diligence and it is only available here.

**Companion NYC datasets (same portal, same publisher):**

- **DOB NOW: Build Elevator Permit Applications**, `kfp4-dz4h` — **70,442 rows**. By borough: Manhattan 33,868 · Brooklyn 16,237 · Queens 10,486 · Bronx 8,666 · Staten Island 1,203. This is the modernisation/new-install capex signal, addressable at building level.
- **DOB NOW: Build Elevator Device Details**, `juyv-2jek` — **108,588 rows**; publisher states one row per device per job filing, filings from December 2017 forward. https://catalog.data.gov/dataset/dob-now-build-elevator-device-details
- **Elevator Agency / Inspector License Info**, `fazp-4djs` — see Part B.
- **MTA Subway Elevator and Escalator Asset Inventory**, `94fv-bak7` — appears in the Socrata catalog; my `count(1)` call against https://data.cityofnewyork.us/resource/94fv-bak7.json returned HTTP 404, so **I have no count for it.** Left empty deliberately.
- **Elevator Inspections by date**, `dedp-nh8d` — returns **4 rows**. Deprecated/empty shell. Do not rely on it.

**Historical benchmarks for NYC, for sanity-checking growth:**
- **76,088 registered elevator devices**, NYC DOB, obtained by FOIL filed September 2015 / received November 2015, republished at https://github.com/datanews/elevators — `Disclosed` (agency response), with the republisher's own warning of inconsistent columns and at least seven dummy test records.
- **"84,000+ elevator devices"** — NYC DOB press release, 12 April 2018, https://www.nyc.gov/site/buildings/dob/pr-elevators-report.page — `Disclosed`. DOB's phrasing includes "passenger and freight elevators, escalators, dumbwaiters, roller coasters, and more."

Those two, against 120,032 device records / 93,235 active devices today, are consistent with a registry that has both grown and been more completely digitised. They are *not* three measurements of the same thing, and should not be trend-lined naively.

### A.2 Washington State — a real registry, with one damaging hole

- **WA L&I performs inspections and issues annual operating permits for "more than 22,000 conveyances throughout Washington."** `Disclosed` — https://lni.wa.gov/licensing-permits/elevators/about-the-elevator-program/
- **Public lookup exists:** https://secure.lni.wa.gov/elevatorlookup/ — provides "the last three years of inspection history for an elevator, escalator, or other conveyances in Washington State." Two versions (pre- and post-27 March 2025, the latter the "ALiS" tool).
- **The hole:** the lookup explicitly excludes **Spokane and Seattle**. https://secure.lni.wa.gov/elevatorlookup/ — Seattle regulates its own conveyances through SDCI (https://www.seattle.gov/construction-and-inspections/inspections/elevator-and-escalator-inspections) and **publishes no device count**; I checked and found none.
- **Press-derived, 2019 state audit:** "of the state's 18,000 conveyances, which are mostly escalators and elevators," more than half were not inspected in 2018; thousands went two or three years; three went more than ten years; inspector headcount went 21 → 27 with plans for up to 10 more. https://www.king5.com/article/news/local/elevator-escalator-audit-state-law/281-34505464-55f7-4351-835c-595cbee00a02 — `Press-derived`. The article carries no visible publication date; findings reference 2018 data.

### A.3 Texas — statewide unit search plus downloadable licence data

- **TDLR Elevator Data Search** — unit-level search of registered elevators and of elevator contractors: https://www.tdlr.texas.gov/elevator_searchapp/elevator/search and https://www.tdlr.texas.gov/elevator_searchapp/contractor/search . Individual unit detail pages exist at e.g. https://www.tdlr.texas.gov/Elevator_SearchApp/Elevator/Details/7205. **I could not read these pages: TDLR's robots.txt blocked my fetch.** So I record the source as existing and unit-level, but I have **no unit counts from it**. Empty on purpose.
- **data.texas.gov "TDLR — All Licenses", `7358-krk7`** — statewide licence roster with `license_type`, `business_county`, `business_city_state_zip`, `business_name`, `owner_name`. Rows last updated **2026-07-16**. See Part B for the counts, which are the usable Texas evidence.

### A.4 Florida — one county discloses, the state does not

- **Broward County: "We regulate over 10,355 elevating devices countywide."** `Disclosed` — https://www.broward.org/Building/Elevators/Pages/Default.aspx . This is the only county-level device count I found published anywhere outside New York.
- **Miami-Dade County** is a delegated local authority that "acts in the place of the State of Florida in all matters pertaining to elevators, escalators, moving walks and other related equipment covered by the Florida Building Code, and Florida Statute 399 **except licensing of inspectors, contractors and technicians**," covering all municipalities **except the City of Miami and City of Miami Beach**. https://www.miamidade.gov/global/economy/elevators/home.page — `Disclosed`. **It publishes no device count.**
- **Florida DBPR Bureau of Elevator Safety** publishes only growth rates, no absolute counts: 2013–2018, "11% increase in elevator licenses," "150% increase in elevator installation and alteration permits," "16% increase in certified elevator inspectors," "24% increase in registered elevator companies"; and a "47% increase in elevator licenses" 2005–2018. https://www2.myfloridalicense.com/elevator-safety/bureau-information/ — `Disclosed` but useless as a level.

### A.5 California — big numbers, no public data

- **City of Los Angeles: approximately 20,974 elevators; 9,486 (roughly 45%) past due for inspection; 1,290 escalators, about one-third past due; 15 inspectors.** Attributed to Kim Arther, chief inspector, LADBS elevator division.
- **LA County outside city limits: 19,141 elevators, about 28% past due**, attributed to Frank Polizzi, Cal/OSHA/DIR spokesman. Permit expiration "as high as 63% in neighboring SoCal counties."
- Source: LAist, 25 April 2019, https://laist.com/news/elevator-inspections-los-angeles — all `Press-derived`, all seven years stale.
- **Cal/OSHA Elevator Unit publishes no count and no public device database** that I could find: https://www.dir.ca.gov/dosh/elevator.html . The page routes to a public records request.
- **NEII trade figure:** "California has the most elevators at over 145,000" — see A.8.

### A.6 Illinois / Chicago — regulated hard, published almost nothing

- **Illinois State Fire Marshal, Elevator Safety Division** administers the Elevator Safety and Regulation Act through "registration, inspection, and certification of conveyances, and the licensing of contractors, mechanics, inspectors, inspection companies" — **statewide except Chicago**, which is its own jurisdiction. https://sfm.illinois.gov/about/divisions/elevators.html — `Disclosed`. **No device counts published.** The page notes a September 2025 software migration and longer-than-normal processing times.
- **Chicago DOB publishes no conveyance device count.** Checked https://www.chicago.gov/city/en/depts/bldgs/provdrs/elevators.html and https://www.chicago.gov/city/en/depts/bldgs/provdrs/inspect/svcs/annual_inspectioncertificationaicprogramupdate.html . Chicago's open data portal returns no elevator dataset in the Socrata sweep.
- **The only quantified Chicago picture is an audit, and it is building-level and twelve years old.** Chicago OIG, October 2014, File #13-0464: **6,438 buildings** requiring an annual elevator inspection in 2013; only **2,185** inspected (**33.9%**) — DOB staff inspected 965 of 5,059 buildings under its oversight (19.1%), the third-party AIC program covered 1,220 of 1,379 (88.5%); **20,104 elevator code violations since January 2006, of which 62.1% remained unresolved** as of March 2014; a 1,004-record paper backlog worth $186,155 in delayed billings; roughly $772,040 of foregone inspection fees. https://igchicago.org/wp-content/uploads/2015/04/DOB-Elevator-Inspections-Audit.pdf — `Disclosed` (OIG). Note carefully: **buildings, not devices.** Do not convert one to the other without a stated multiplier, and I have no sourceable multiplier.

### A.7 Other jurisdictions checked

- **Colorado** — Division of Oil and Public Safety requires all regulated conveyances to be registered before being placed in service, $200 per conveyance, under the Elevator and Escalator Certification Act. https://ops.colorado.gov/sites/ops/files/2020-12/conveyanceregistrationnotice_12_2020.pdf — `Disclosed` requirement, **no published count, no public database found.**
- **Massachusetts** — Board of Elevator Regulations / Office of Public Safety and Inspections publishes registered elevator contractors through MyLicenseOne, https://madpl.mylicense.com/Verification/Search.aspx?Facility=Y , and search results are downloadable at no cost. Page last updated 2 September 2025. https://www.mass.gov/info-details/registered-elevator-contractors . I did not obtain a count — the portal is a form-driven search, not an API. Empty on purpose.
- **Oregon** — data.oregon.gov `vhbr-cuaq`, Building Codes Division Active Contractor/Individual Licenses, **47,085 rows** total. My attempt to filter to elevator licence types returned HTTP 400; **whether it contains elevator licence types is unverified.**
- **Philadelphia** — OpenDataPhilly exposes L&I trade licences, building/zoning permits, code violations and property history (https://opendataphilly.org/datasets/licenses-and-inspections-trade-licenses/) but **no elevator device dataset** surfaced in either the Socrata sweep or the portal search.
- **The Elevator Database** (https://elevatordatabase.com/) — a **third-party aggregator run by LoberLab, explicitly "not affiliated with the State of Massachusetts"** and not a government source. Covers CA, CO, CT, FL, MD, MA, NC, OH, TX, with PA in alpha. Useful as a pointer to which states disclose; **not citable as a primary source, and no counts should be taken from it.**

### A.8 National denominators (trade-published, use with care)

**NEII (National Elevator Industry, Inc.) Fact Sheet**, https://nationalelevatorindustry.org/wp-content/uploads/2020/07/NEII-Fact-Sheet-2020.pdf — the PDF carries **no visible publication date**; the file path implies 2020.
- "more than 1.03 million elevators in the United States, which is up from 900,000 in 2007"
- "California has the most elevators at over 145,000"
- "56,000 escalators in North America"
- "Elevators in the United States make 20.6 billion passenger trips per year"

`Disclosed` by a trade association, **not a statistical agency**. NEII is the OEM-side body; its installed-base number is the industry's standard talking point and has no published methodology I could locate. Use it as an order of magnitude only.

**One derived figure, shown and labelled.** NYC's 81,015 active elevators against NEII's 1.03m US elevators:
`81,015 ÷ 1,030,000 = 7.9%` → **`Estimated`: New York City alone holds roughly 8% of the US elevator installed base.** This is arithmetic on two sources of different vintage and different definitions (a live municipal registry vs. an undated trade estimate). It is directionally useful and should never be quoted as a published statistic.

### A.9 Building stock

I did **not** obtain a sourceable mid-/high-rise building count by metro. CTBUH's Skyscraper Center ranks New York "#1 Tallest City in North America" by number of 150m+ completed buildings (https://www.skyscrapercenter.com/city/new-york-city), but the underlying per-city counts sit behind CVU member access, and a 150m+ threshold is the wrong cut for elevator density anyway — the annuity lives in 6–20 storey stock, not trophy towers. **Left empty rather than filled with a guess.** The NYC BIN count above (47,052 buildings with a registered device) is the one hard building-stock number in this file, and it exists only because NYC publishes the registry.

### A.10 BLS employment — and the container-code caveat, quantified

**Read this before using any 238290 figure.**

NAICS 238290 "Other Building Equipment Contractors" is **not an elevator code**. BLS OES, May 2023, for NAICS 238290: total industry employment **153,170**, of which **Elevator and Escalator Installers and Repairers = 21,300, or 13.90%** of the industry. https://www.bls.gov/oes/2023/may/naics5_238290.htm — `Disclosed`.

**So roughly seven of every eight workers in NAICS 238290 are not in the elevator trade.** Any metro sizing that treats 238290 QCEW employment or establishment counts as an elevator proxy is wrong by roughly 7x, and wrong by a *varying* factor across metros depending on the local mix of the other trades in the container. I did not use 238290 for metro sizing and recommend the practice does not either.

**Use the occupation instead.** BLS OES publishes SOC **47-4021, Elevator and Escalator Installers and Repairers**, by metropolitan area. This is occupation-specific, metro-level, and published — the best metro density instrument I found that is not a device registry.

**May 2023, SOC 47-4021 — national employment 23,990.** Metropolitan areas with the highest employment level:

| Metro area | Employment | Per 1,000 jobs | Location quotient | Annual mean wage |
|---|---|---|---|---|
| New York-Newark-Jersey City, NY-NJ-PA | 4,060 | 0.43 | **2.71** | $114,510 |
| Los Angeles-Long Beach-Anaheim, CA | 960 | 0.16 | 0.98 | $123,770 |
| Miami-Fort Lauderdale-West Palm Beach, FL | 810 | 0.30 | **1.87** | $89,660 |
| Seattle-Tacoma-Bellevue, WA | 780 | 0.37 | **2.37** | $121,110 |
| Chicago-Naperville-Elgin, IL-IN-WI | 760 | 0.17 | 1.07 | $124,790 |
| Dallas-Fort Worth-Arlington, TX | 750 | 0.19 | 1.20 | $86,530 |
| Washington-Arlington-Alexandria, DC-VA-MD-WV | 730 | 0.23 | 1.49 | $102,030 |
| San Francisco-Oakland-Hayward, CA | 580 | 0.24 | 1.51 | $138,300 |
| Boston-Cambridge-Nashua, MA-NH | 570 | 0.21 | 1.31 | $126,730 |
| Philadelphia-Camden-Wilmington, PA-NJ-DE-MD | 390 | 0.14 | 0.88 | $95,520 |

Source: https://www.bls.gov/oes/2023/may/oes474021.htm — `Disclosed`.

**May 2019 for comparison — national employment 28,350** (note the national count *fell* 15% between the two vintages, which is a data-collection question as much as an industry one, and I cannot resolve it):

| Metro area | Employment | Per 1,000 jobs | Location quotient | Annual mean wage |
|---|---|---|---|---|
| New York-Newark-Jersey City, NY-NJ-PA | 4,960 | 0.51 | 2.66 | $83,980 |
| Washington-Arlington-Alexandria, DC-VA-MD-WV | 1,150 | 0.36 | 1.87 | $78,430 |
| Los Angeles-Long Beach-Anaheim, CA | 1,130 | 0.18 | 0.94 | $93,790 |
| Dallas-Fort Worth-Arlington, TX | 1,050 | 0.29 | 1.48 | $78,960 |
| Boston-Cambridge-Nashua, MA-NH | 900 | 0.32 | 1.67 | $105,010 |
| Miami-Fort Lauderdale-West Palm Beach, FL | 860 | 0.32 | 1.68 | $70,340 |
| Baltimore-Columbia-Towson, MD | 750 | 0.55 | **2.84** | $90,200 |
| San Francisco-Oakland-Hayward, CA | 700 | 0.28 | 1.47 | $104,600 |
| Houston-The Woodlands-Sugar Land, TX | 580 | 0.19 | 0.98 | $74,500 |
| Chicago-Naperville-Elgin, IL-IN-WI | 560 | 0.12 | 0.62 | $94,140 |

Source: https://www.bls.gov/oes/2019/may/oes474021.htm — `Disclosed`.

**Two things to flag in that pair.** Chicago's LQ moves 0.62 → 1.07 and Seattle appears from nowhere into 4th place; Baltimore has the highest LQ in the 2019 table (2.84) and drops out of the 2023 top ten entirely. OES metro estimates for a ~24,000-person national occupation are thin and volatile. Treat any single-year metro figure as indicative, not as a measurement. **I could not retrieve May 2024 or May 2025 for this occupation** — the dated URL pattern that works for 2019 and 2023 resolves to the OEWS index page for 2024 and 2025.

---

## Part B — Independent contractor inventory by metro

**Scope discipline.** Per the brief, this is an inventory count and a source inventory. **No company is named anywhere in this file.** Target naming is a separate job under different rules.

### B.1 The associations — and an important correction to a common assumption

- **NAEC — National Association of Elevator Contractors**, https://www.naec.org/ . Its Contractor membership category is defined as *"Corporations and firms regularly and substantially engaged in the business of selling, installing and servicing freight or passenger elevators, escalators, Dumbwaiters, man-lifts, moving walks, etc. in the United States of America"* (https://naec.site-ym.com/general/register_member_type.asp). Categories are Contractor ($870 domestic), Associate ($870–$1,030), Supplier ($870–$1,030), plus a one-time $100 initiation fee. **The definition does not say "independent" or exclude OEMs.** NAEC is widely described as the independents' body, but its own published membership definition does not carry that restriction — worth knowing before citing it as an independent-contractor census. **I found no published member count and no publicly accessible member directory** on the pages I could reach; the directory sits behind a member login (https://naec.site-ym.com/login.aspx).
- **ECA — Elevator Contractors of America** ("Elevators of America"), https://www.elevatorcontractors.org/ . Self-described as *"a nonprofit organization dedicated to the good of the signatory independent elevator industry."* **This is the association that explicitly represents independents** — but only **union-signatory** independents, so it structurally excludes the non-signatory segment. **No member count and no public directory found.**
- **NAESA International**, https://naesai.org/industry-services — QEI inspector certification and training; publishes an organizational members list (**approximately 17 organizations**) and an Inspector Search directory. Useful for the inspection-services adjacency, not for service contractors.

**Net:** the association route yields **named, real sources but no countable inventory** without membership access. The licence registries below are the countable route.

### B.2 New York — the best contractor inventory available, and it is public

**Source: data.ny.gov — "Elevator Contractor License: New York State Department of Labor", `jrac-r9vc`.**
https://data.ny.gov/Government-Finance/Elevator-Contractor-License-New-York-State-Departm/jrac-r9vc/about_data
Publisher description, verbatim: *"The dataset includes a comprehensive list of contractor licenses issued to businesses for elevator inspection and contracting within New York State, encompassing contractor and license information."*
Columns: `license_number`, `license_type`, `business_name`, `dba_name`, `address`, `address_2`, `city`, `state`, `zip_code`, `phone`, `issued_date`, `expiration_date`, `license_status`.
**Rows last updated 2026-01-25.** Total rows: **300.**

| License type | Status | Count |
|---|---|---|
| Elevator Contractor License (SH131) | **Active** | **132** |
| Elevator Inspection Contractor License (SH131) | **Active** | **78** |
| Elevator Contractor License (SH131) | Expired | 60 |
| Elevator Inspection Contractor License (SH131) | Expired | 30 |

By state of business address: NY 261 · NJ 16 · PA 3 · FL 3 · IL 2 · MA 2 · CT 2 · VT 2 · TX 2 · SC 1 · MO 1 · ME 1 · OH 1 · WA 1 · MD 1 · CA 1.

By city (all statuses, top of list): Brooklyn 40 · New York 36 · Bronx 24 · Long Island City 15 · Staten Island 13 · Flushing 5 · Woodside 5 · Bohemia 4 · Deer Park 4 · Astoria 4 · Rochester 4 · Schenectady 3 · Buffalo 3 · Pelham 3 · Fresh Meadows 2 · Mineola 2 · Clifton Park 2 · Maspeth 2 · Middletown 2 · Oceanside 2 · Bellmore 2 · Syracuse 2 · Lewiston 2 · Mount Vernon 2.

**`Estimated` (arithmetic shown):** five-borough addresses = Brooklyn 40 + New York 36 + Bronx 24 + Long Island City 15 + Staten Island 13 + Flushing 5 + Woodside 5 + Astoria 4 + Fresh Meadows 2 + Maspeth 2 = **146 of 300 licence records (49%)**. Add Long Island (Bohemia 4, Deer Park 4, Mineola 2, Oceanside 2, Bellmore 2 = 14) and Westchester (Pelham 3, Mount Vernon 2 = 5) and the NY-Newark-Jersey City commuting geography holds **~165 of 300 (55%)** of all New York State elevator contractor licence records, before counting the 16 New Jersey addresses. This is a count of licence records by mailing city, not a count of firms by operating territory — a firm licensed from Bohemia may service Manhattan and vice versa.

**Companion:** "Elevator Individual Licenses: New York State Department of Labor", `cxfs-ya8e`, **6,679 rows**, rows last updated **2026-01-28**. Columns `license_number`, `license_type`, `first_name`, `last_name`, `issued_date`, `expiration_date`, `license_status`. Covers elevator mechanics, inspection, accessibility and lift accessibility. https://data.ny.gov/Government-Finance/Elevator-Individual-Licenses-New-York-State-Depart/cxfs-ya8e/about_data

**Regime context:** NYSDOL licenses five individual categories (Elevator Mechanic, Accessibility Lift Technician, Elevator Accessibility Technician, Elevator Inspector, Temporary Elevator Mechanic) and two business categories (Elevator Contractor $600/2yr, Elevator Inspection Contractor $600/2yr). A contractor licence requires the business be "owned by or employ a NYS DOL-licensed elevator mechanic" plus liability, workers' comp and disability insurance. Further changes take effect 10 June 2026. https://dol.ny.gov/elevator-licensing-information — `Disclosed`.

**Why this matters commercially:** a state licence that requires an owner-or-employee licensed mechanic is a *structural barrier* and a *succession trap*. The licence is pinned to a person. That is precisely the condition that produces motivated sellers, and New York is the only large metro where you can enumerate the affected population from public data.

**NYC city-level companion, with a health warning:** "Elevator Agency / Inspector License Info", `fazp-4djs`, NYC DOB, rows last updated 2026-08-09. **3,699 rows.** Status distribution: EXPIRED 2,456 · OBSOLETE 1,070 · INACTIVE 110 · **ACTIVE 24** · ON HOLD 13 · DECEASED 11 · REVIEW PENDING 5 · SUSPENDED 4 · SURRENDERED 3 · RETIRED 2 · REVOKED 1. Distinct business names among ACTIVE records: **7**. Those active figures are implausibly low against a city running ~81,000 active elevators through mandatory third-party CAT1 testing, so **the `license_status` field in this dataset should be treated as unreliable** and the dataset used for the roster and business addresses, not for currency. Flagging rather than using it.

### B.3 Texas — statewide, downloadable, county-resolved

**Source: data.texas.gov — "TDLR — All Licenses", `7358-krk7`**, TDLR's own description: *"A listing of all TDLR license holders from https://www.tdlr.texas.gov/LicenseSearch/."* **Rows last updated 2026-07-16.** A parallel raw CSV of elevator contractor licences is published at https://www.tdlr.texas.gov/dbproduction2/ltelectr.csv

Statewide elevator licence counts:

| License type | Count |
|---|---|
| Elevator Responsible Party | 628 |
| **Elevator Contractor** | **365** |
| Qualified Elevator Inspector | 210 |
| Elevator Responsible Party CE Provider | 11 |

**Elevator Contractor licences by county of business address:**

DALLAS 70 · HARRIS 62 · TARRANT 33 · *OUT OF STATE 27* · BEXAR 20 · TRAVIS 14 · WILLIAMSON 11 · DENTON 9 · COLLIN 8 · GALVESTON 8 · NUECES 7 · BASTROP 6 · HAYS 5 · FORT BEND 5 · EL PASO 5 · LUBBOCK 4 · RANDALL 4 · HIDALGO 3 · FANNIN 3 · VAN ZANDT 3 · KENDALL 3 · KAUFMAN 3 · TAYLOR 3 · PARKER 2 · WALLER 2 · HARDIN 2 · ROCKWALL 2 · GRAYSON 2 · GREGG 2.

**`Estimated` (arithmetic shown), rolling counties into metros:**
- **DFW** = Dallas 70 + Tarrant 33 + Denton 9 + Collin 8 + Kaufman 3 + Parker 2 + Rockwall 2 = **127**
- **Houston** = Harris 62 + Galveston 8 + Fort Bend 5 + Waller 2 = **77**
- **Austin** = Travis 14 + Williamson 11 + Bastrop 6 + Hays 5 = **36**
- **San Antonio** = Bexar 20 + Kendall 3 = **23**

**Caveat that must travel with these numbers:** "Elevator Contractor" is a company licence and **includes the OEM majors' local branches**. It is a total-contractor count, not an independent count. Netting out OEM branches requires naming firms, which is out of scope here. Treat 127 for DFW as the universe, not the target pool.

### B.4 Other states with countable or downloadable contractor inventory

- **Massachusetts** — Elevator Contractor licences searchable and **downloadable at no cost** via https://madpl.mylicense.com/Verification/Search.aspx?Facility=Y (filter Profession = Elevator Licenses, License Type = Elevator Contractor). Fields: company name, licence number, licence type, licence status. **Count not obtained** — form-driven, no API.
- **Florida** — DBPR licenses Registered Elevator Companies, Certified Elevator Inspectors and Certified Elevator Technicians; a company must employ at least one certified inspector or Certificate of Competency holder. Licensee search at https://www.myfloridalicense.com/intentions2.asp?chBoard=true&boardid=210 . **No count published and no downloadable list found.** https://openmyfloridabusiness.gov/business/23/elevator-companies/
- **Illinois** — SFM licenses "contractors, mechanics, inspectors, inspection companies" statewide ex-Chicago. **No published roster or count found.**
- **Washington** — L&I licenses elevator contractors and mechanics; **no published roster count found**.
- **Oregon** — data.oregon.gov `vhbr-cuaq`, 47,085 licence rows; elevator licence types **unverified** (filter query errored).

---

## Part C — Regulatory intensity by metro

Regulatory intensity is the annuity's density multiplier: mandatory frequency, mandatory *third-party* inspection, and enforcement with teeth all convert a device into recurring billable events.

| Metro / jurisdiction | Frequency | Third-party required? | Enforcement evidence published? | Source |
|---|---|---|---|---|
| **New York City** | **CAT1 annual** (no-load safety test, 1 Jan–31 Dec); **CAT5 every 5 years** (rated load and speed) | **Yes — "Category Testing is performed and witness by approved independent third-party agencies licensed by the Department"** | **Yes** — device-level filing status (`cat1_report_year`, `cat5_latest_report_filed`, `periodic_latest_inspection`) published per device in `e5aq-a4j2`; DOB publishes elevator violation PDFs | https://www.nyc.gov/site/buildings/safety/elevator-compliance.page |
| **Chicago** | **Annual** | **Yes** — AIC program "requires building owners/property managers to hire state-licensed, third-party inspection companies to inspect their elevators and other conveying devices annually"; results filed to DOB via AIC portal | **Only historically** — OIG 2014 audit (see A.6). No current published dataset | https://www.chicago.gov/city/en/depts/bldgs/provdrs/inspect/svcs/annual_inspectioncertificationaicprogramupdate.html |
| **Seattle** | **Annual**, "as close as possible to the same month of last year's inspection" | **No — city inspectors (SDCI)** | No | https://www.seattle.gov/construction-and-inspections/inspections/elevator-and-escalator-inspections |
| **Washington State (ex-Seattle, ex-Spokane)** | **Annual operating permit** | State L&I inspectors | **Yes, damningly** — state audit found >half of 18,000 conveyances uninspected in 2018 | https://lni.wa.gov/licensing-permits/elevators/about-the-elevator-program/ · https://www.king5.com/article/news/local/elevator-escalator-audit-state-law/281-34505464-55f7-4351-835c-595cbee00a02 |
| **Illinois (ex-Chicago)** | **Annual certificate of operation**; 3-year renewal exception for certain religious buildings with a single 2-level conveyance | Licensed inspectors/inspection companies | No | https://sfm.illinois.gov/about/divisions/elevators.html |
| **Florida (Broward, Miami-Dade)** | Certificates of Operation with mandated inspection | **Yes — "mandated enforcement by Certified Elevator Inspectors"** under FS Ch. 399, FAC 61C-5, FBC Ch. 30 | Partial — Broward discloses device count; no violation data found | https://www.broward.org/Building/Elevators/Pages/Default.aspx · https://www.miamidade.gov/global/economy/elevators/home.page |
| **Los Angeles / California** | Permit-based | Cal/OSHA and LADBS inspectors | **Yes, damningly, but stale** — ~45% of LA city elevators past due (2019) | https://laist.com/news/elevator-inspections-los-angeles |

**NYC's penalty structure is the sharpest I found and is worth quoting to a seller:** CAT1 and CAT5 results must be filed **within 21 days** of the inspection/test date to avoid late fees; failure to file by the deadline draws **$3,000 (CAT1)** and **$5,000 (CAT5)** for non-residential properties. https://www.nyc.gov/site/buildings/safety/elevator-compliance.page — `Disclosed`. Fines of that size on a 21-day clock are what make the compliance-filing service line non-discretionary rather than nice-to-have.

**Chicago's paradox, stated plainly:** Chicago has an inspection regime as strict as New York's on paper — annual, mandatory, third-party — and publishes essentially nothing about it. High regulatory intensity, near-zero data availability. That combination is bad for a deep-dive and good for whoever already operates there.

---

## Part D — The menu: 3–4 candidate metros, ranked on data availability

Ranked on **data availability**, per the brief, not on size. The ranking principle, stated plainly: **a metro with a public device registry is worth far more to this practice than a bigger metro with no published data.** A registry converts every downstream question — density, share, route economics, contract coverage, modernisation backlog, seller quality — from an interview into a query. Where the registry is absent, the deep-dive degrades into paid-database work and primary calls, at several times the cost and a fraction of the defensibility.

---

### 1. NEW YORK — New York-Newark-Jersey City, NY-NJ-PA · **Data availability: exceptional. No peer.**

**Density evidence.** 81,015 **active** elevators plus 4,291 escalator device records, across 47,052 buildings, geocoded to lat/long, BBL, census tract, NTA, council district and community district; live to 2026-08-10 (`e5aq-a4j2`). Manhattan alone (42,359 active elevators) exceeds any other US metro's entire likely device base. Corroborated independently by BLS: 4,060 elevator installers/repairers, **LQ 2.71** — the highest employment level in the country and, in 2023, effectively the highest concentration of any large metro.

**Independent-inventory evidence.** 132 active Elevator Contractor licences and 78 active Elevator Inspection Contractor licences statewide (`jrac-r9vc`, updated 2026-01-25), of which ~55% of all licence records carry addresses in the NYC/LI/Westchester geography, plus 16 New Jersey-addressed licences. 6,679 individual licences (`cxfs-ya8e`). Licence structurally requires an owner-or-employed licensed mechanic — a named succession constraint.

**Regulatory intensity.** Highest found. Annual CAT1 plus 5-year CAT5, **mandatory independent third-party agencies**, 21-day filing window, $3,000/$5,000 penalties. Compliance status is published **per device**.

**What a deep-dive could actually use.** Device-level census with status and location; per-device CAT1/CAT5 filing currency (a direct proxy for which buildings are under-served); 70,442 permit applications by borough as a modernisation/capex signal; 108,588 device-detail filing rows since Dec 2017; a public statewide contractor roster with issue and expiry dates. Density, coverage gaps, contractor inventory and capex can all be measured, not estimated.

**The honest argument against.** (i) It is the most competitively picked-over elevator market in the country — every consolidator and every OEM knows New York, so entry multiples will reflect it and proprietary angles will be scarce. (ii) The MSA spans NY, NJ and PA and the registry stops at the city line: **New Jersey and Westchester devices are not in `e5aq-a4j2`**, so "the metro" is only partly measurable even here. (iii) Union density and the NYSDOL mechanic-licence requirement raise labour cost and constrain the buyer's ability to integrate or relocate crews. (iv) Manhattan's stock skews to large-portfolio owners with sophisticated procurement — less pricing slack than a fragmented suburban route. (v) The city dataset's own `license_status` field is demonstrably unreliable (24 ACTIVE agency records against 81,015 active elevators), a caution that even the best registry needs field-level validation.

---

### 2. DALLAS-FORT WORTH-ARLINGTON, TX (with Houston as the paired alternative) · **Data availability: good — the best non-New York option.**

**Density evidence.** BLS May 2023: 750 elevator installers/repairers, LQ 1.20 (May 2019: 1,050, LQ 1.48). TDLR operates a **unit-level** elevator search covering registered devices statewide (https://www.tdlr.texas.gov/elevator_searchapp/elevator/search) — **but I was robots-blocked from reading it and therefore hold no device counts.** The device data is believed to exist and be unit-resolved; that belief is untested.

**Independent-inventory evidence.** The strongest outside New York and the easiest to work with: `Estimated` **127** Elevator Contractor licences in the DFW counties (Dallas 70, Tarrant 33, Denton 9, Collin 8, Kaufman 3, Parker 2, Rockwall 2) from a statewide roster of 365, updated 2026-07-16, downloadable as CSV, with owner name, business address and county. Houston equivalent = **77**. Plus 628 Elevator Responsible Party and 210 QEI licences statewide.

**Regulatory intensity.** Moderate. State-administered under TDLR with registered units and QEI-based inspection. No third-party mandate as aggressive as NYC's and no published violation data found.

**What a deep-dive could actually use.** A downloadable, owner-named, county-resolved contractor universe — which is the single hardest thing to build in most metros and here is a CSV. Combined with the TDLR unit search, it should be possible to tie contractors to devices. Growth-market dynamics (DFW added elevator employment in the 2019 table at LQ 1.48) mean new-install and modernisation volume alongside service.

**The honest argument against.** (i) **The unit-count half of the thesis is unverified** — I could not read TDLR's elevator search and cannot confirm what it returns, how many units, or whether it is bulk-extractable. That is a material open risk on the very thing that would justify choosing Texas. (ii) Low-rise sprawl means fewer devices per building and longer routes — the density that makes elevator service profitable is weaker than any dense-core metro. (iii) LQ 1.20 vs New York's 2.71. (iv) "Elevator Contractor" includes OEM branches, so 127 overstates the independent pool by an unknown margin. (v) Mean wage $86,530 is the lowest in the top-ten table, which cuts both ways — cheaper labour, but also lower service pricing.

---

### 3. MIAMI-FORT LAUDERDALE-WEST PALM BEACH, FL · **Data availability: moderate — one genuine county disclosure, patchy elsewhere.**

**Density evidence.** **Broward County discloses "over 10,355 elevating devices countywide"** — the only county-level device count published outside New York, and a real anchor. BLS May 2023: 810 elevator installers/repairers, **LQ 1.87** — third-highest employment and second-highest concentration among large metros, consistent across both vintages (2019: 860, LQ 1.68). High-rise coastal residential stock is the right building type.

**Independent-inventory evidence.** Weak on published counts. Florida licenses Registered Elevator Companies, Certified Elevator Inspectors and Certified Elevator Technicians through DBPR with a public licensee search, but **no count and no downloadable list found**. DBPR publishes only growth rates (24% increase in registered elevator companies 2013–2018).

**Regulatory intensity.** Genuine and layered: FS Ch. 399, FAC 61C-5, FBC Ch. 30, with "mandated enforcement by Certified Elevator Inspectors" and Certificates of Operation. **Fragmented authority is the defining feature** — Miami-Dade acts for the state across all municipalities *except* the City of Miami and City of Miami Beach, which run their own; Broward runs its own; DBPR retains all licensing.

**What a deep-dive could actually use.** Broward's 10,355 as a hard denominator for at least one county; a stable, twice-confirmed BLS concentration signal; a three-county structure where each authority is separately approachable for records; strong post-Surfside structural tailwind on building recertification (asserted from context, **not sourced in this run** — flagged as unverified).

**The honest argument against.** (i) The metro is **four or five regulators in a trench coat** (Broward, Miami-Dade, City of Miami, Miami Beach, Palm Beach), so there is no single dataset and every count must be assembled and reconciled jurisdiction by jurisdiction. (ii) No published contractor count at all — the independent inventory would have to be built from scratch. (iii) Lowest mean wage in the 2023 top ten ($89,660) alongside heavy seasonal/condo ownership implies price-sensitive, churn-prone contracts and weaker annuity quality than the LQ suggests. (iv) Broward's figure is a single undated sentence on a county web page with no methodology.

---

### 4. SEATTLE-TACOMA-BELLEVUE, WA · **Data availability: moderate, with a hole exactly where you need it.**

**Density evidence.** BLS May 2023: 780 elevator installers/repairers, **LQ 2.37** — the second-highest concentration of any large US metro, behind only New York. WA L&I discloses **"more than 22,000 conveyances throughout Washington"** and runs a public device lookup returning three years of inspection history.

**Independent-inventory evidence.** Weak. L&I licenses elevator contractors and mechanics but **publishes no roster count** I could find. Nothing comparable to New York's or Texas's public licence data.

**Regulatory intensity.** Annual operating permits statewide, annual city inspections in Seattle. Enforcement is *published and poor*, which is itself commercially interesting: the state auditor found more than half of 18,000 conveyances uninspected in 2018, some for over a decade, with inspectors at 21 rising to 27.

**What a deep-dive could actually use.** A public per-device inspection-history lookup — genuinely rare — plus a disclosed statewide denominator, a top-two concentration signal, high wages ($121,110) implying premium service pricing, and a documented public-sector inspection shortfall that private third-party capacity could absorb.

**The honest argument against — and it is close to disqualifying.** **The L&I lookup explicitly excludes Seattle and Spokane.** The public device data covers everything *except the core of the metro you would be buying in.* Seattle SDCI inspects its own conveyances with city staff and publishes no device count and no dataset. So the headline "Washington has a public registry" collapses on contact with the actual target geography. Add: no contractor inventory data; a small absolute market (780 workers, ~22,000 statewide conveyances vs 81,015 active elevators in New York City alone); the 22,000 and the audit's 18,000 are unreconciled; and the audit is seven years old.

---

### Explicitly considered and demoted

- **Chicago-Naperville-Elgin.** Third/fifth-largest employment, annual mandatory third-party inspection regime — and **no published device count, no open dataset, no contractor roster**. The Socrata sweep returns zero Chicago elevator datasets. The only quantified evidence is a 2014 OIG audit measured in *buildings*, not devices. Genuinely large market, near-zero measurability. Also note the unexplained LQ swing (0.62 in 2019 → 1.07 in 2023), which undermines the one metro-level instrument that does exist.
- **Los Angeles-Long Beach-Anaheim.** Second-largest employment but **LQ 0.98 — no concentration at all**, consistent across both vintages (0.94 in 2019). Cal/OSHA publishes no count and no public database; the only figures are seven-year-old newspaper attributions. Sprawl works against route density. Large but thin and unmeasurable.
- **Washington-Arlington-Alexandria and Baltimore-Columbia-Towson.** Both show real concentration (DC LQ 1.49 in 2023, 1.87 in 2019; Baltimore **LQ 2.84** in 2019, the highest in that table). **Baltimore's disappearance from the 2023 top ten is unexplained and may reflect nothing more than OES sampling noise in a small occupation.** No device registry or contractor roster found for either. Worth a future run if a data source can be located; not choosable on today's evidence.
- **Boston-Cambridge-Nashua.** LQ 1.31, mean wage $126,730, and Massachusetts publishes a **downloadable** registered-elevator-contractor list (madpl.mylicense.com). That is a real asset. Demoted only because I obtained **no contractor count and no device count** — the sources exist but are form-driven and were not extracted in this run. **This is the most likely candidate to be promoted by one more hour of work.**

---

## What we don't know yet

**Left deliberately empty rather than estimated:**

1. **Metro-level revenue for any metro.** Not published anywhere, by anyone, for any of these metros. No figure attempted.
2. **Mid-/high-rise building counts by metro.** No sourceable dataset obtained. CTBUH's per-city counts are behind member access and its 150m+ threshold is the wrong cut for elevator density anyway. Only NYC has a hard number (47,052 buildings with a registered device) and only because NYC publishes the registry.
3. **Texas device counts.** The TDLR Elevator Data Search is unit-level and appears to be exactly the right source, but robots.txt blocked my fetch. **No Texas device count is recorded in this file.** This is the highest-value single gap: resolving it would materially strengthen or sink candidate #2.
4. **Massachusetts counts — devices and contractors.** Both sources are identified and both are extractable (MyLicenseOne downloads search results at no cost; OPSI records feed third-party aggregators). Neither was extracted. Boston's ranking is artificially depressed as a result.
5. **Florida contractor counts.** DBPR has a licensee search; no count and no bulk list obtained.
6. **Seattle SDCI device count.** Not published; would require a records request. Without it, Seattle's core is unmeasured.
7. **Chicago device count.** Not published in any form I could find. Would require FOIA to DOB, most plausibly against the AIC portal.
8. **Cal/OSHA conveyance count and any public database.** Not published; DIR routes to a public records request.
9. **Colorado, Illinois and Washington contractor rosters.** All three states license contractors; none publishes a countable roster that I found.
10. **NAEC and ECA membership counts and geographic distribution.** Both associations are named and their scopes are now understood — critically, **NAEC's published Contractor definition does not exclude OEMs**, contrary to the common assumption — but member directories sit behind logins. Membership-based independent-contractor counts by metro remain unavailable.
11. **BLS OES 47-4021 for May 2024 and May 2025.** The dated URL pattern that serves 2019 and 2023 resolves to the OEWS index for 2024/2025. The most recent metro table in this file is **May 2023**. Also unexplained: national employment in this occupation *fell* from 28,350 (2019) to 23,990 (2023), a 15% decline that is more likely a classification or sampling artifact than a real contraction, but I cannot demonstrate that.
12. **QCEW 238290 by MSA.** Not retrieved — bls.gov, census.gov and data.census.gov were blocked to direct fetch in this environment. Given that only **13.90%** of NAICS 238290 employment is elevator-trade (BLS OES, May 2023), the practice loses little: **238290 by MSA should not be used as an elevator proxy in any case**, and SOC 47-4021 by MSA is strictly superior. Recorded so the gap is not mistaken for an oversight.
13. **The data.gov CKAN catalog sweep was not completed** — three attempts at `catalog.data.gov/api/3/action/package_search` returned HTTP 404. My registry sweep therefore rests on the Socrata discovery catalog alone, which does not index CKAN, ArcGIS Hub or Accela/Tyler portals. **Additional municipal device registries may exist on those platforms and would not have appeared in my results.** Given that Washington's, Texas's and Florida's sources were all found outside Socrata, this is a live possibility, not a theoretical one.
14. **The MTA Subway Elevator and Escalator Asset Inventory** (`94fv-bak7`) appears in the Socrata catalog but its resource endpoint returned 404. No count recorded. Transit-authority devices are a distinct, contract-heavy segment and may deserve their own run.
15. **Post-Surfside condo recertification as a Florida demand driver** was asserted in the Miami entry from general context and **is not sourced in this run.** Treat as an unverified hypothesis.
16. **OEM branch share of licensed contractor counts.** Texas's 365 and New York's 132 active contractor licences both include OEM majors' branches. Netting them out requires naming firms, which is out of scope for this run by instruction. Every contractor count in this file is therefore a **total-contractor universe, not an independent-contractor count.**
