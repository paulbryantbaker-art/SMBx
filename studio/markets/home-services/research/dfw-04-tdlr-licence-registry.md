<!-- run: 04 | hunt: B | date: 2026-08-01
     query: Texas Department of Licensing and Regulation — air conditioning and
            refrigeration contractor licences, statute, data availability, and
            counts for the eleven-county DFW MSA
     tool: web search + fetch; official sources only (tdlr.texas.gov,
           data.texas.gov, statutes.capitol.texas.gov). Five counts re-verified
           by hand against the Socrata API.
     coverage row: 5 (establishments vs companies) and a partial for row 2 -->

# The Texas licence registry as a DFW denominator

> **PARTIALLY SUPERSEDED, same day, by `dfw-05-tdlr-file-analysis.md`.**
> This run queried TDLR's Socrata mirror without filtering on licence expiry.
> Paul supplied the raw bulk file later on 2026-08-01, and it shows the extract
> is **not** active-only: 1,335 of 20,400 rows are expired. **Every count below
> is about 6.4% too high**, and the ≈3,050 derivation is superseded by a measured
> 2,849. Run 05 also reconciles the 20,323 vs 19,163 conflict this run had to
> carry at both values — the gap is expired licences. Read run 05 for the
> corrected figures; the statute, the data-channel documentation and the
> individual-vs-entity finding in this file all stand.

**Why this run existed.** Census County Business Patterns is inaccessible without
an API key. The state licence registry is the authoritative alternative, and it
is the source a target hunt would start from later regardless.

---

## The finding that governs every number below

**A Texas air conditioning contractor licence is held by an individual person,
not by a business entity. A licence count is not an establishment count.**

Three independent official confirmations:

**Tex. Occ. Code § 1302.252**, verbatim: *"An air conditioning and refrigeration
contracting company must employ full-time in each permanent office a license
holder who holds an appropriate license assigned to that company."* The company
is the employer of the licensee; it is not the licensee.

**16 TAC § 75.70(a)(1)**: the licensee shall *"assign his or her license to one
company or one permanent office of the company that will use the license."*

**The application form (ACR002)** collects the applicant's Social Security Number
and personal name, with "Business Name" in a separate BUSINESS INFORMATION
section.

This shows in the data itself: every record carries an `owner_name` in person
format beside a company `business_name` — `SUMNERS HEATING & AIR CONDITIONING
INC` / `SUMNERS, ROY LEE`.

**The error runs in both directions.** A firm employing several licensed
individuals at one office generates several licence rows, which over-counts. And
because § 1302.252 requires a licence holder *in each permanent office*, a
multi-branch firm's branches all carry the same `business_name` and collapse to
one row when de-duplicated, which under-counts. **There is no branch or location
identifier in the file.** The true establishment count sits between the two
bounds, and both bounds are given.

---

## 1. The licence, and which category is residential

**Regulator:** Texas Department of Licensing and Regulation, under Tex. Occ. Code
Ch. 1302.

**Licence:** Air Conditioning and Refrigeration Contractor License, number prefix
`TACL`. The A/C Technician credentials — Registered and Certified — are separate
and subordinate.

**Statutory definitions (§ 1302.002), verbatim:**

- *Air conditioning and refrigeration contracting:* "performing or offering to
  perform the design, installation, construction, repair, maintenance, service,
  or modification of equipment or a product in an environmental air conditioning
  system, a commercial refrigeration system, or a process cooling or heating
  system"
- *Environmental air conditioning:* "treating air to control temperature,
  humidity, cleanliness, ventilation, and circulation to meet human comfort
  requirements" — **this is the residential-comfort endorsement**
- *Commercial refrigeration:* "the use of mechanical or absorption equipment to
  control temperature or humidity to satisfy the intended use of a specific
  space"

**Classes (§ 1302.253), verbatim.** Class A: "…a system, a product, or equipment
of any size or capacity". Class B: "…of not more than: (1) 25 tons cooling
capacity; or (2) 1.5 million British thermal units per hour output heating
capacity". Class B alone covers essentially all residential work.

The application offers four combinations: Class A or B, each with Environmental
Air Conditioning or Commercial Refrigeration/Process Cooling and Heating.

---

## 2. The data, and where it lives

Two independent official channels, both free.

**Bulk file.** `https://www.tdlr.texas.gov/dbproduction2/ltairref.csv`, 3.62 MB,
timestamped 2026-06-01. Format spec at `/dbproduction2/lrformat.txt` — 22 fields
including County, Name, Business Name, Business County, Business ZIP, License
Type, License Subtype, License Expiration Date. Index page states the files are
updated every day.

**Texas Open Data Portal (Socrata).** Dataset `7358-krk7`, "TDLR All Licenses",
962,445 rows, last updated **2026-04-12**. Queryable at
`https://data.texas.gov/resource/7358-krk7.json`.

The counts below came from the Socrata API. **Five were re-verified by hand in
this session** and all five returned exactly the figures recorded: statewide
20,323; Dallas 1,756; Tarrant 1,329; Collin 528; Wise 67.

---

## 3. Counts — `license_type = 'A/C Contractor'`, as of 2026-04-12

| County | Licences (upper bound) | Distinct business names (lower bound) |
|---|---|---|
| Dallas | 1,756 | 1,688 |
| Tarrant | 1,329 | 1,299 |
| Collin | 528 | 514 |
| Denton | 438 | 431 |
| Ellis | 208 | 206 |
| Johnson | 198 | 194 |
| Kaufman | 181 | 180 |
| Parker | 181 | 178 |
| Rockwall | 125 | 124 |
| Hunt | 98 | 96 |
| Wise | 67 | 66 |
| **DFW eleven-county total** | **5,109** | **4,976** |
| *Texas statewide* | *20,323* | *19,139* |

The distinct-name column is a sum of per-county distinct counts, so it slightly
overstates the unique-firm total — a firm with offices in two counties is counted
in both. The metro-wide de-duplicated figure could not be retrieved and is listed
below as an open item.

**DFW is 25.1% of the Texas licence total.** De-duplication moves the metro
figure by 2.6% and the state figure by 5.8% — Texas HVAC firms overwhelmingly
carry one licence each, which is worth knowing because it means the two bounds
are close together.

### Endorsement split

Dallas: 1,066 of 1,756 licences carry an Environmental Air Conditioning
endorsement. Tarrant: 789 of 1,329. That is 60.7% and 59.4% respectively. The
remaining share is commercial refrigeration or process cooling only, and is
largely out of scope for a residential thesis.

**Derived, not reported:** applying about 60% to the metro licence total implies
roughly **3,050** Environmental Air-endorsed contractor licences across the
eleven counties. See `## Derivations`. No source publishes this figure.

### One unreconciled conflict, carried at both values

TDLR's own "ACR at a Glance" for FY25 reports **19,163** Air Conditioning
Contractors statewide. The Socrata extract returns **20,323**. The gap is about
6%, the vintages differ, and the active-status treatment may differ. **Both
values are carried. No midpoint is taken.**

---

## 4. Plumbing — a different agency

Plumbing has **not** moved to TDLR. The Texas State Board of Plumbing Examiners
remains standalone at `tsbpe.texas.gov`, confirmed by the absence of any plumbing
category from TDLR's licence-type list. TSBPE licences are also individual:
Responsible Master Plumber, Master Plumber, Journeyman, Tradesman–Limited,
Inspector, Apprentice. **The Responsible Master Plumber is the closest analogue
to a business-level credential** — a firm must operate under one — and the RMP
file carries the last known company name for each licensee, which makes it the
right starting file for a plumbing firm count. Free daily CSV rosters at
`tsbpe.texas.gov/free-licensee-list/`.

---

## 5. What this does and does not replace

**It gives a denominator that does not route through Census.** About 5,100
licences held by about 4,950 firms across the eleven counties, of which roughly
60% carry the residential endorsement.

**It does not replace CBP, for three reasons:**

1. **No establishment count.** Licences and firms, not locations. The binding
   limitation.
2. **No size distribution.** Nothing in the file indicates employment. The
   acquisition band is defined by employee size class, and this source cannot
   band anything. **Row 2 stays blocked.**
3. **No NAICS mapping.** These are regulatory categories. They will not reconcile
   cleanly to 238220 — the Environmental Air endorsement is a closer fit to
   residential HVAC than 238220 is, but it is not the same population, and 238220
   also contains plumbing, which TDLR does not license at all.

**What it is better at than CBP:** it names firms with addresses rather than
counting buckets. That makes it the correct starting source for a target hunt
later, and the route by which the Apex gap in run 02 could be closed.

## Derivations

| Figure | Inputs | Arithmetic | Assumption |
|---|---|---|---|
| **≈3,050** — Environmental Air-endorsed contractor licences, DFW eleven counties | DFW licence total 5,109; endorsement share observed in Dallas (1,066 of 1,756) and Tarrant (789 of 1,329) | 5,109 × ≈0.60 | That the Dallas and Tarrant endorsement mix holds across the nine smaller counties. It was not measured there — the grouped query failed. The two measured counties are the most urban in the set, so a rural county with more agricultural refrigeration work could sit lower. **Treat as an order of magnitude, not a count.** |

## Sources

Official sources only. Retrieved 2026-08-01.

- https://www.tdlr.texas.gov/acr/
- https://statutes.capitol.texas.gov/docs/OC/htm/OC.1302.htm
- https://www.tdlr.texas.gov/ACR/Forms/acr%20law%20booklet.pdf
- https://www.tdlr.texas.gov/acr/forms/acr002%20contractor%20license%20application.pdf
- https://www.tdlr.texas.gov/media/pdf/ACR%20at%20a%20Glance.pdf (FY25)
- https://www.tdlr.texas.gov/LicenseSearch/licfile.asp
- https://www.tdlr.texas.gov/dbproduction2/ltairref.csv
- https://www.tdlr.texas.gov/dbproduction2/lrformat.txt
- https://data.texas.gov/dataset/TDLR-All-Licenses/7358-krk7
- https://data.texas.gov/resource/7358-krk7.json (counts queried directly)
- https://tsbpe.texas.gov/ and https://tsbpe.texas.gov/free-licensee-list/

## What we don't know yet

- **The metro-wide de-duplicated firm count.** Multi-county `IN()` queries were
  rejected by the proxy; only per-county de-duplication succeeded. Anyone holding
  `ltairref.csv` can compute it in one line.
- **Endorsement split for the nine smaller counties.** Only Dallas and Tarrant
  were obtained, and the ≈3,050 derivation rests on them.
- **The `AR`, `BR` and `ARBR` subtype codes.** They appear on 728 records
  statewide and are explained on no TDLR page located. Probably legacy
  refrigeration codes — **not verified, not assumed.**
- **Whether the Socrata extract is active-licences-only.** Described as sourced
  from TDLR's Active License Search, which strongly implies it; no page states it.
- **Reconciliation of 20,323 against 19,163.**
- **Whether TSBPE's CSVs carry a county field**, and therefore any DFW plumbing
  firm count.
- **Any crosswalk from TDLR categories to NAICS 238220.** There isn't one, and
  constructing it would be an assumption, not a lookup.
