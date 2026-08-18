<!-- run: 07 | hunt: B | date: 2026-08-11
     query: Socrata SODA pulls against data.cityofnewyork.us/resource/e5aq-a4j2.json (DOB NOW Elevator Safety Compliance),
            855j-jady.json (DOB Safety Violations), kfp4-dz4h.json (DOB NOW Build Elevator Permit Applications),
            juyv-2jek.json (DOB NOW Build Elevator Device Details);
            data.ny.gov/resource/jrac-r9vc.json (NYSDOL Elevator Contractor License) and cxfs-ya8e.json (NYSDOL Elevator Individual Licenses);
            api.us.socrata.com/api/catalog/v1 for dataset discovery; attempted fetches of nyc.gov DOB elevator pages (all 404)
     tool: Socrata API pulls + web search + fetch -->

# NYC Metro Deep-Dive — Elevator & Escalator
## Run 07 · Hunt B · 2026-08-11

**Every number below was computed by me from a live API pull.** Each is shown with the exact query that produced it. Nothing here is quoted from an article or a market-research summary.

Registry vintage: `rowsUpdatedAt` = **2026-08-10 20:34 UTC** (one day before this run).

---

## 0. Method note — how these numbers were obtained, and one honest caveat

Direct container egress to `data.cityofnewyork.us` is blocked by this session's proxy policy (403 on CONNECT), so every pull was made through a fetch tool that returns the API response body. To keep transcription risk near zero I did two things:

1. **Pushed all aggregation server-side.** No row-by-row pagination of 120k records; every figure is a Socrata `$select=count(*)` / `$group` / `$having` result, so the response body was small enough to return verbatim.
2. **Cross-footed every split against a known total.** Device-status split, device-type split, borough split, CAT1-year split, CAT5-year split, `status_date`-year split, CAT1-null-by-type and CAT1-current-by-type all independently sum to **93,454** (active) or **120,256** (all records). The violation-type split and the violation-status split independently sum to **262,889**. The licence city split and the licence type×status split independently sum to **210** and **300**. Eight independent groupings hitting their control totals exactly is the check that the transcriptions are clean.

The one caveat worth stating: my **first** `count(*)` call returned `120116`, and the correct value is `120256` — confirmed three ways (status split sum, type split sum, and a re-query aliased `total_records`, plus a fourth via the `/api/v3/` endpoint). A single unverified read of an API through a summarising layer is not trustworthy. Every headline figure here was read at least twice or reconciled against a control total. I flag this because it is exactly the failure mode that puts a wrong number in a market master.

**A second methodological point.** SoQL's `|>` pipe operator works on this dataset only in a narrow form (`... GROUP BY x |> SELECT count(*)`); adding `HAVING`, a stage-2 `GROUP BY`, or a stage-2 `WHERE` causes the server to silently drop `$query` and return the unfiltered table. Because a silent fallback returns *plausible-looking data*, this is a live trap for anyone reproducing this work. I therefore computed the devices-per-building distribution the slow, safe way: `$group=bin` + `$having=count(*)>=k`, then binary-searched `$offset` to find the exact number of qualifying groups for k = 2,3,4,5,6,11. That is ~90 tiny queries, all reproducible, and the result satisfies two independent arithmetic identities (below).

---

## A. The device registry, computed

### A.1 Total records vs active devices — the reconciliation that matters

The registry is a **cumulative** device history, not a live inventory. Treating record count as market size overstates the serviceable base by 29%.

| Device status | Records | Query |
|---|---:|---|
| **Active** | **93,454** | `$select=device_status,count(*) as n&$group=device_status` |
| Removed | 20,447 | " |
| Work in Progress | 3,548 | " |
| Dismantled | 1,678 | " |
| Deleted | 744 | " |
| Withdrawn | 308 | " |
| Sealed | 77 | " |
| **Total records** | **120,256** | `$select=count(*)` |

`93,454 ÷ 120,256 = 77.7%`. **26,802 records (22.3%) are not live devices.** Removed + Dismantled + Deleted + Withdrawn + Sealed = 23,254 are terminal states; Work in Progress (3,548) is a device being installed or altered — future base, not current base.

> **The serviceable base in the five boroughs is 93,454 devices, not 120,256.** Any per-device revenue or unit-count model built on the larger number is 29% too big at the top line (`120,256 ÷ 93,454 = 1.287`).

```
https://data.cityofnewyork.us/resource/e5aq-a4j2.json?$select=device_status,count(*)%20as%20n&$group=device_status&$order=n%20desc
https://data.cityofnewyork.us/resource/e5aq-a4j2.json?$select=count(*)%20as%20total_records
```

### A.2 Devices by type — and the escalator segment isolated

`$select=device_type,count(*) as n&$group=device_type` (all records) and the same with `$where=device_status='Active'`:

| Device type | All records | **Active** | Active as % of records |
|---|---:|---:|---:|
| Elevator | 96,444 | **81,232** | 84.2% |
| Accessibility Lift | 8,678 | **7,034** | 81.1% |
| **Escalator** | 4,291 | **2,606** | **60.7%** |
| Dumbwaiter | 1,997 | **1,197** | 59.9% |
| Personnel Hoist | 7,916 | **709** | 9.0% |
| Conveyor | 800 | **638** | 79.8% |
| Manlift | 113 | **32** | 28.3% |
| Moving Walk | 17 | **6** | 35.3% |
| **Total** | **120,256** | **93,454** | 77.7% |

Both columns sum exactly to their control totals.

**Three structural reads:**

**(i) Construction equipment is not part of the maintenance annuity.** Personnel Hoist + Conveyor + Manlift = **1,379 active** devices, and their survival rates (9.0%, 79.8%, 28.3%) show what they are: temporary site equipment that gets registered and removed. The **permanent vertical-transportation base is 92,075** (Elevator + Escalator + Dumbwaiter + Accessibility Lift + Moving Walk). This is the number that carries a recurring service contract.

**(ii) The escalator segment is 2,606 active units** — 2.8% of the active base, and it is overwhelmingly Manhattan:

| Borough | Active escalators | Share |
|---|---:|---:|
| Manhattan | 1,853 | **71.1%** |
| Brooklyn | 300 | 11.5% |
| Queens | 275 | 10.6% |
| Bronx | 122 | 4.7% |
| Staten Island | 56 | 2.1% |
| **Total** | **2,606** | 100% |

```
https://data.cityofnewyork.us/resource/e5aq-a4j2.json?$select=borough,count(*)%20as%20n&$where=device_status=%27Active%27%20AND%20device_type=%27Escalator%27&$group=borough
```

Escalators are a distinct trade — different mechanics, different parts, higher service intensity per unit — and 71% of the city's units sit inside one borough, largely transit, retail and office. **This is the most geographically concentrated segment in the dataset.**

**(iii) The escalator and dumbwaiter decommission rates (39.3% and 40.1% of records not active) are roughly double the elevator rate (15.8%).** Dumbwaiters are a dying device class. Escalators are being removed at a meaningfully higher rate than elevators — worth understanding before underwriting escalator-weighted route density.

**Passenger vs freight cannot be split.** The dataset carries an `equipment_type` column, but it is populated for only **18,894 of 93,454 active devices (20.2%)** — 74,560 are null. The populated values are `ElectricElevators` (13,590), `HydraulicElevators` (1,665), `PlatformStairwayChairLifts` (1,619), `PRElevators` (600), and 16 smaller classes. This distinguishes drive technology, not passenger vs freight duty. **I am leaving the passenger/freight split empty — the registry does not support it.**

```
https://data.cityofnewyork.us/resource/e5aq-a4j2.json?$select=equipment_type,count(*)%20as%20n&$where=device_status=%27Active%27&$group=equipment_type&$order=n%20desc&$limit=100
```

### A.3 Devices by borough

`$select=borough,count(*) as n&$where=device_status='Active'&$group=borough` — sums exactly to 93,454.

| Borough | Active devices | Share |
|---|---:|---:|
| **Manhattan** | **48,378** | **51.8%** |
| Brooklyn | 20,115 | 21.5% |
| Queens | 13,333 | 14.3% |
| Bronx | 9,693 | 10.4% |
| Staten Island | 1,935 | 2.1% |
| **Total** | **93,454** | 100% |

**Manhattan alone holds more devices than the other four boroughs combined.** For a route-based service business this is the single most important geographic fact in the dataset: a Manhattan-dense route book and an outer-borough route book are different assets with different drive times, different building types, and different pricing power.

### A.4 Route density — the distribution, not the mean

**Method.** `$select=bin&$where=device_status='Active'&$group=bin&$having=count(*)>=k&$order=bin&$limit=1&$offset=X`, binary-searching X to find the exact number of qualifying buildings N≥k. A row present at 0-indexed offset X means N > X; empty means N ≤ X.

Resolved counts:

| k | Buildings with ≥ k active devices | Bracketing probes |
|---|---:|---|
| 1 | 43,455 | `$group=bin` group count via `... GROUP BY bin \|> SELECT count(*)` |
| 2 | **17,509** | ROW@17508, EMPTY@17509 |
| 3 | **7,723** | ROW@7722, EMPTY@7723 |
| 4 | **4,847** | ROW@4846, EMPTY@4847 |
| 5 | **3,072** | ROW@3071, EMPTY@3072 |
| 6 | **2,263** | ROW@2262, EMPTY@2263 |
| 11 | **856** | ROW@855, EMPTY@856 |

Buildings: `count(distinct bin)` = **43,454**; the `GROUP BY bin` group count = **43,455**. The difference is exactly one NULL-BIN group, verified: `$where=device_status='Active' AND bin IS NULL` returns **1**. So there are 43,454 identified buildings plus 1 unlocated device.

**The distribution:**

| Devices in building | Buildings | % of buildings | Devices held | % of devices |
|---|---:|---:|---:|---:|
| 1 | **25,946** | 59.7% | 25,946 | 27.8% |
| 2 | **9,786** | 22.5% | 19,572 | 20.9% |
| 3–5 | **5,460** | 12.6% | — | — |
| 6–10 | **1,407** | 3.2% | — | — |
| 11+ | **856** | 2.0% | — | — |
| **Total** | **43,455** | 100% | 93,454 | 100% |

Buildings column sums to 43,455 exactly.

**Concentration.** Devices in buildings with 5 or more devices:

```
devices in buildings of size 1–4
  = 1×25,946 + 2×9,786 + 3×2,876 + 4×1,775
  = 25,946 + 19,572 + 8,628 + 7,100
  = 61,246
devices in buildings with 5+  = 93,454 − 61,246 = 32,208
```

Cross-checked by an independent identity. Since Σ(j≥1) N≥j = total devices:
```
Σ(j≥5) N≥j = 93,454 − (43,455 + 17,509 + 7,723 + 4,847) = 19,920
devices in buildings with 5+ = 4×N≥5 + Σ(j≥5) N≥j = 4×3,072 + 19,920 = 32,208  ✓
```

> **3,072 buildings — 7.1% of all buildings with a live device — hold 32,208 devices, 34.5% of the entire active base, at a mean of 10.5 devices per building.**
>
> At the other end, **25,946 single-device buildings (59.7% of buildings) hold just 27.8% of devices.**

Mean devices per building = 93,454 ÷ 43,455 = **2.15**, and the mean is close to useless here: the distribution is severely right-skewed and the economics live in the tail.

**Why this is the whole trade.** A route of 100 devices spread over 100 buildings and a route of 100 devices spread over 10 buildings carry near-identical contract revenue and radically different cost to serve — drive time, callback response, parts staging, and the mechanic's ability to close multiple tickets per stop. The registry says NYC contains **both** structures in size: a long tail of ~26k single-device walk-ups and a dense core of ~3.1k multi-device towers holding a third of all devices. **Route quality, not route size, is the underwriting question in this metro,** and this dataset is the only place in the US where a buyer can measure it before signing an NDA.

### A.5 Device age — the registry does not support it

There is **no installation date and no manufacture date** in this dataset. The only date that could proxy for it is `status_date`, and it does not work:

| status_date year | Active devices |
|---|---:|
| 2020 | **21,043** |
| 2021 | **11,586** |
| 2019 | **10,440** |
| 1988 | **6,635** |
| 2022 | 4,145 |
| 2024 | 3,698 |
| 2025 | 3,622 |
| 2023 | 3,529 |
| all other years | 28,756 |

(sums to 93,454 including 1 null)

**46.1% of active devices carry a status_date in 2019–2021**, and 6,635 carry 1988. These are system-migration artefacts — the DOB NOW Elevator Compliance module went live around 2020, and 1988 is a legacy bulk load. `status_date` records when the record last changed state, not when the device was installed.

> **I am leaving device age empty. The dataset does not support it, and any age or modernisation-cycle figure derived from `status_date` would be an artefact of a database migration.**

A partial route exists but was not usable in this pass: `juyv-2jek` (DOB NOW Build Elevator Device Details, 115,901 rows) carries `machine_manufacturer`, `machine_model`, `controller_manufacturer` for devices with filings since Dec 2017. But `count(distinct machine_manufacturer)` = **2,031** — a free-text field with heavy spelling variance, unusable for OEM installed-base share without a normalisation pass. **I am not reporting an OEM share.** Flagged for a future run.

---

## B. Regulatory intensity, quantified

### B.1 What I verified, and what I could not

**Could not verify in this pass.** The session's web-search budget was exhausted (200/200) by earlier runs before this section, and every NYC DOB elevator page I attempted returned 404 (`/site/buildings/safety/elevators.page`, `/site/buildings/property-or-business-owner/elevators.page`, `/site/buildings/industry/elevator-inspections.page`, `/site/buildings/property-or-business-owner/elevator-inspections.page`).

So the following, carried from an earlier pass, remain **unverified in run 07** and should be treated as such until re-checked:
- the 21-day filing window after test
- NYC Admin Code **§28-304.6.1** third-party-agency unaffiliation requirement
- specific civil-penalty dollar amounts

**I am not restating any penalty dollar figure**, because I could not reach a primary source for it in this run and I will not carry a number forward on trust.

### B.2 What the enforcement data proves directly

`855j-jady` (DOB Safety Violations) carries `device_number` and `device_type`. Filtering `device_type='Elevators'` gives **262,889 elevator violations**, of a 1,100,893-row all-device table. The violation-type split and the violation-status split each sum to 262,889 independently.

**By status:**

| Status | Count | Share |
|---|---:|---:|
| **Active (open)** | **159,460** | 60.7% |
| Dismissed | 103,177 | 39.2% |
| Pending Dismissal | 252 | 0.1% |

**By code family** (24 distinct codes returned):

| Code family | Count | Share of elevator violations |
|---|---:|---:|
| **CAT1-coded** (FTC/FTF-VT-CAT1-CO/HA/NJ, EVCAT1, VCAT1) | **149,744** | 57.0% |
| **Periodic-coded** (FTC/FTF-VT-PER-CO/HA/NJ) | **56,377** | 21.4% |
| **CAT5-coded** (EVCAT5, JVCAT5, HVCAT5) | **5,591** | 2.1% |
| Other (ACC1 27,183; LL10/81 17,495; JVIOS 3,608; E 2,142; ACJ1 738; EJVIOS 7; EACJ1 4) | 51,177 | 19.5% |

Largest single codes: `FTC-VT-CAT1-CO` **69,321** (failure to correct, CAT1) and `FTF-VT-CAT1-CO` **38,646** (failure to file, CAT1).

**The enforcement regime is confirmed by its own code structure.** DOB maintains *separate* violation codes for failure-to-**file** and failure-to-**correct**, at *separate* hazard tiers (CO / HA / NJ), for *each* of CAT1, CAT5 and Periodic. A regulator does not build that taxonomy unless it is enforcing filing currency and defect closure as two distinct obligations. That is direct, primary-source evidence of the strictness characterised in the earlier pass, independent of any secondary description.

**Reach of enforcement:**

| Measure | Value | Query |
|---|---:|---|
| Distinct devices ever cited | **67,843** | `$select=count(distinct device_number)&$where=device_type='Elevators'` |
| — as % of the 93,454 active base | **72.6%** | computed |
| Distinct buildings ever cited | **34,051** | `$select=count(distinct bin)&$where=device_type='Elevators'` |
| — as % of the 43,454 buildings | **78.4%** | computed |
| Open violations per active device | **1.71** | 159,460 ÷ 93,454 |

> **Nearly three-quarters of live devices and nearly four-fifths of buildings with a live device have been cited at least once, and 159,460 elevator violations remain open.**

**A caution on the annual trend.** Elevator violations by issue year are not usable as an enforcement time series: 2023 shows 124,623, 2022 shows **zero**, 2020 shows **1**, 2013 shows 1. These are bulk-load and migration artefacts. **Use the stock (159,460 open), not the flow.** `Basis: Disclosed` for the stock; the annual series is not reportable.

### B.3 The mandated annuity, computed

This is the part that is genuinely computable, and it is the size of the compliance workload the regime creates.

**CAT1 — annual, every permanent device:**

```
permanent VT base (excl. construction equipment) = 92,075 devices
→ 92,075 CAT1 inspection events per year          [Estimated — assumes all permanent
                                                   device classes are CAT1-subject]
```

Empirical floor from the registry itself: **87,111** active devices carry a CAT1 report year of 2025 or 2026 (`$where=device_status='Active'&$group=cat1_report_year`). Because the field holds the *latest* year only, actual 2025 filings are at least this number. **Observed ≈ 87,111; theoretical ≈ 92,075.** The two agree within 5.4%, which is itself the compliance-gap measurement.

**CAT5 — five-year cycle, elevators:**

```
active elevators = 81,232
→ 81,232 ÷ 5 = 16,246 CAT5 events per year        [Estimated]
```

Empirical corroboration: CAT5 latest-filing counts by year among active devices are 2024 = **16,212**, 2023 = 14,524, 2025 = 13,721, 2022 = 12,458. **The 2024 observed count (16,212) lands within 0.2% of the theoretical annual rate (16,246).** That is an unusually clean validation of a derived figure against observed behaviour.

**Combined:**

```
92,075 CAT1  +  16,246 CAT5  =  108,321 statutory inspection events per year
                                 in the five boroughs alone          [Estimated]
```

**Capacity ratio.** Against **748 active NYS Elevator Inspector licences statewide** (§C):

```
108,321 ÷ 748 = 145 statutory inspection events per licensed inspector per year
 92,075 ÷ 748 = 123 CAT1 events per licensed inspector per year
```
`Basis: Estimated.` This is a **lower bound on inspector workload**, because it charges the entire statewide inspector pool with the NYC device base only — those same inspectors also cover the rest of New York State. Every one of these events also requires the maintenance contractor to attend and witness, so each is a two-party event.

> **The regime mandates ~108,000 inspection events a year across the five boroughs, and each one requires a licensed inspector from an agency that cannot be the maintenance provider. That is the structural reason the maintenance base in this metro is an annuity rather than a discretionary spend — and the reason the inspection function is a separate business from the service function.**

### B.4 Filing currency — the live-vs-dormant maintenance base

`$select=cat1_report_year,count(*)&$where=device_status='Active'&$group=cat1_report_year` and the CAT5 equivalent via `date_extract_y(cat5_latest_report_filed)`. Both sum to 93,454.

**CAT1, all 93,454 active devices:**

| CAT1 status | Devices | Share |
|---|---:|---:|
| **Current** (report year 2025 or 2026) | **87,111** | **93.2%** |
| Stale (2024 or earlier) | 4,652 | 5.0% |
| **No CAT1 filing ever** | **1,691** | 1.8% |

**CAT1, the 81,232 active elevators specifically:**

| CAT1 status | Devices | Share |
|---|---:|---:|
| Current (2025/2026) | 78,078 | **96.1%** |
| Stale (≤2024) | 2,740 | 3.4% |
| Never filed | 414 | 0.5% |

Escalators: 2,392 of 2,606 current (**91.8%**), 43 never filed.
Accessibility Lifts are the weak class: 1,101 of the 1,691 never-filed devices are Accessibility Lifts.

**CAT5, the 81,232 active elevators** (`$where=device_status='Active' AND device_type='Elevator'`):

| CAT5 status | Devices | Share | Query |
|---|---:|---:|---|
| **Within 5 years** (filed ≥ 2021-08-11) | **67,198** | **82.7%** | `AND cat5_latest_report_filed >= '2021-08-11'` |
| Lapsed (filed, but > 5 years ago) | 5,592 | 6.9% | derived |
| **Never filed** | **8,442** | **10.4%** | `AND cat5_latest_report_filed IS NULL` |

Data-quality note: the CAT5 year distribution contains 692 devices dated **1960** and 12 dated **1970** — placeholder dates, not real filings. They fall inside the "lapsed" bucket and do not affect the "within 5 years" figure.

> **This is the closest thing to a live-vs-dormant maintenance census available anywhere in the US.** 93.2% of active devices are CAT1-current — meaning the overwhelming majority of the base is under an active compliance relationship, and therefore almost certainly under an active maintenance contract. The **1,691 devices with no CAT1 filing ever and the 8,442 elevators with no CAT5 ever** are the anomalous tail: either genuinely dormant equipment, or a compliance failure, or a registry defect. **~10,000 devices sit outside the compliance annuity** and that population is where both risk and opportunity concentrate.

---

## C. The supply side

### C.1 Contractor and inspection-agency licences — verified exactly

New York State licenses elevator contractors through the **Department of Labor**, not the Department of State. (The earlier pass attributed this to DOS; the authoritative datasets are NYSDOL's.) Dataset `jrac-r9vc`, vintage **2026-05-28**:

`$select=license_type,license_status,count(*)&$group=license_type,license_status` — sums to 300 exactly.

| Licence type | Active | Expired | Total |
|---|---:|---:|---:|
| **Elevator Contractor License (SH131)** | **132** | 60 | 192 |
| **Elevator Inspection Contractor License (SH131)** | **78** | 30 | 108 |
| **Total** | **210** | **90** | **300** |

> **The earlier pass's figures — ~132 active contractor licences and 78 inspection agency licences statewide — are confirmed exactly.** Basis: `Disclosed`.

**Individual licences** (`cxfs-ya8e`, vintage **2026-07-28**) — sums to 6,679 exactly:

| Licence type | Active | Expired |
|---|---:|---:|
| **Elevator Mechanic (SH132)** | **3,948** | 1,662 |
| **Elevator Inspector (SH132)** | **748** | 215 |
| Elevator Accessibility Lift Technician (SH132) | 54 | 35 |
| Elevator Accessibility Technician (SH132) | 11 | 6 |
| **Total active** | **4,761** | 1,918 |

`93,454 active NYC devices ÷ 3,948 active statewide mechanic licences = 23.7 devices per mechanic` — again a lower bound, since those mechanics also serve the rest of the state.

### C.2 The NYC-area share — verified, and slightly below the earlier estimate

The earlier pass put ~55% of licences at NYC-area addresses. Two independent methods:

**Method 1 — city name.** `$select=city,count(*)&$where=license_status='Active'&$group=city` (sums to 210). Counting only unambiguous five-borough city names (Brooklyn 27, New York 27, Long Island City 14, Bronx 14, Staten Island 7, Flushing 3, Astoria 3, Woodside 2, Whitestone 2, Fresh Meadows 1, Hollis 1, Queens Village 1):

```
102 of 210 active licences = 48.6%
```
One ambiguous record ("Ridgewood", Queens NY or Ridgewood NJ) excluded as conservative.

**Method 2 — ZIP range.** `$where=license_status='Active' AND zip_code between '10001' and '10499'` → 27 contractor + 21 inspection = 48. `between '11001' and '11499'` → 33 contractor + 23 inspection = 56. `between '11691' and '11697'` → 0.

```
104 of 210 = 49.5%   (marginally overinclusive: 11001–11003 are Nassau)
```

> **48.6%–49.5% of active NYS elevator licences carry a five-borough address — not 55%.** The earlier figure is close but ~5–6 points high if "NYC-area" means the five boroughs. It is defensible if "NYC-area" was meant to include Westchester, Long Island and northern NJ (see §D). Basis: `Disclosed` (registry) + `Estimated` (address classification).

**By licence type**, NYC-addressed active licences: **60 contractor** (45.5% of the 132) and **44 inspection agency** (56.4% of the 78). **Inspection agencies are more NYC-concentrated than contractors** — consistent with the mandated CAT1 workload being concentrated where the devices are.

### C.3 OEM / platform / independent split — partially answered, honestly

**I did not compile a company list, per the run's constraints.** What I can characterise structurally without one:

**An independent, empirical count of firms actually performing permitted elevator work in NYC.** `kfp4-dz4h` (DOB NOW Build Elevator Permit Applications, filings since Dec 2017) — `count(distinct applicant_businessname)`:

| Measure | Value |
|---|---:|
| Total filings | 70,460 |
| **Distinct filing firms, all-time** | **324** |
| Distinct buildings | 35,657 |

By year (`$group=date_extract_y(filing_date)`):

| Year | Filings | Distinct firms |
|---|---:|---:|
| 2026 (to 11 Aug) | 3,365 | 149 |
| 2025 | 4,669 | 146 |
| 2024 | 5,009 | 155 |
| 2023 | 5,028 | 155 |
| 2022 | 6,572 | 170 |
| 2021 | 7,957 | 172 |
| 2020 | 13,788 | 183 |
| 2019 | 18,504 | 178 |
| 2018 | 5,565 | 146 |

> **Roughly 146–155 distinct firms file elevator permits in NYC in any recent year, from a cumulative pool of 324 since 2017.** Note this **exceeds the 132 active statewide contractor licences** — because `applicant_businessname` is the filing applicant, which includes design professionals and expediters as well as licensed elevator contractors. The two counts measure different populations and should not be netted against each other.

**A visible consolidation signal.** Distinct active filers fell from **183 (2020) to 146 (2025)**, a **20.2% decline**, while filings fell 66% over the same window. Filing volume and firm count both contracting, with firm count contracting more slowly than volume, is consistent with either post-2020 construction normalisation or exit/absorption of smaller filers. **This run cannot separate those two explanations** and I am not asserting either.

**What I could not establish:** the split of the 132 contractor licences among OEM branches, platform-owned firms, and independents. That requires name-level classification of the licence register, which is target-list work under different rules. **Left empty deliberately.**

### C.4 IUEC Local 1 — not established

**I could not retrieve IUEC Local 1 membership.** The DOL LM-2 filing was not reachable: the web-search budget was exhausted before this section, and `www.bls.gov` / `www.dol.gov`-class hosts are blocked by this session's egress policy (confirmed 403 on CONNECT in the proxy failure log).

**I am leaving Local 1 membership empty rather than estimating it.** The one bounding fact I can offer from verified data: there are **3,948 active NYS Elevator Mechanic licences statewide**, which is a hard ceiling on the number of licensed mechanics Local 1 could represent in New York, and Local 1 covers the NYC area only — a subset. Basis: `Disclosed` for 3,948; the Local 1 figure itself is **not reported**.

---

## D. The honest limits — what this registry does NOT see

**This is the most important caveat in the run, and it is large.**

The DOB NOW registry covers **the five boroughs of New York City only**. The Census-defined **New York–Newark–Jersey City MSA** extends well beyond it — Westchester, Rockland and Putnam counties in New York; Nassau and Suffolk on Long Island; and a dozen northern New Jersey counties. **Every one of those jurisdictions is regulated separately**, and none publishes a device-level registry comparable to NYC's.

**Quantifying the blind spot.** I could not pull Census population or building-stock figures — `api.census.gov`, `www.census.gov` and `www2.census.gov` are all blocked by this session's egress policy (confirmed 403 in the proxy log). So I used the one metro-wide supply-side measure I do have: the address distribution of the 210 active NYS elevator licences.

Classifying the city field by county:

| Area | Active licences | Share of state |
|---|---:|---:|
| **NYC five boroughs** | **102** | 48.6% |
| Westchester | 13 | 6.2% |
| Nassau + Suffolk | 27 | 12.9% |
| Rockland | 3 | 1.4% |
| Putnam | 1 | 0.5% |
| New Jersey (all) | 8 | 3.8% |
| **≈ NY–Newark–Jersey City MSA total** | **≈154** | **73.3%** |
| Rest of New York State | ≈56 | 26.7% |

```
NYC share of metro-area-addressed licences = 102 ÷ 154 = 66.2%
```

> **On the best proxy available to me, the device registry covers roughly two-thirds of the metro's licensed supply base — and I am blind to the other third.**
>
> **I can see 93,454 devices. I cannot see a single device in Westchester, Nassau, Suffolk, Rockland, Putnam, or northern New Jersey.** There is no equivalent public registry for any of them.

`Basis: Estimated.` This is a **supply-side proxy, not a device count.** It assumes licensed firms are distributed roughly in proportion to devices served, which is unlikely to hold precisely — Manhattan's density means a NYC-addressed firm probably serves more devices per firm than a Suffolk-addressed one, which would mean the registry covers **more** than two-thirds of metro *devices* even while covering ~66% of metro *firms*. I cannot resolve the direction of that bias without device counts I do not have. Two city classifications are judgement calls (Princeton Junction NJ is Trenton MSA, not NY MSA; "Ridgewood" is ambiguous), so ±2 licences.

**Three further limits worth stating plainly:**

1. **The registry is a compliance-filing system, not an asset register.** It records devices that file. A device that has never filed and never been caught may not appear at all. The 1,691 active devices with no CAT1 filing ever hint at the edge of this.
2. **BIN is the building key, not the owner or the contract.** Route density measured by BIN is a good proxy for service-route economics but is **not** a contract count. Two devices in one building can sit with two different service providers, and a single owner can hold many BINs. **This run measured building-level device density, not contract-level route density.** The two are not the same thing, and the registry cannot distinguish them.
3. **No maintenance-provider field exists.** The registry does not name who services each device. **Market share by service provider is not derivable from this dataset** — not by me, and not by anyone.

---

## Summary of computed figures

| Figure | Value | Basis |
|---|---:|---|
| Total registry records | 120,256 | Disclosed |
| **Active devices** | **93,454** | Disclosed |
| Non-live records | 26,802 (22.3%) | Disclosed |
| Permanent VT base (excl. construction equip.) | 92,075 | Disclosed |
| Active elevators | 81,232 | Disclosed |
| **Active escalators** | **2,606** (71.1% Manhattan) | Disclosed |
| Manhattan share of devices | 51.8% | Disclosed |
| Buildings with a live device | 43,454 (+1 null BIN) | Disclosed |
| Mean devices per building | 2.15 | Disclosed |
| Buildings with exactly 1 device | 25,946 (59.7%) | Disclosed |
| **Devices in buildings with 5+** | **32,208 (34.5%)**, in 3,072 buildings (7.1%) | Disclosed |
| CAT1 current (all active) | 87,111 (93.2%) | Disclosed |
| CAT1 never filed | 1,691 (1.8%) | Disclosed |
| CAT5 within 5 yrs (elevators) | 67,198 (82.7%) | Disclosed |
| CAT5 never filed (elevators) | 8,442 (10.4%) | Disclosed |
| Open elevator violations | 159,460 | Disclosed |
| Devices ever cited | 67,843 (72.6%) | Disclosed |
| **Statutory inspection events / yr** | **≈108,321** | Estimated |
| Active contractor licences (NYS) | 132 | Disclosed |
| Active inspection-agency licences (NYS) | 78 | Disclosed |
| Active mechanic licences (NYS) | 3,948 | Disclosed |
| Active inspector licences (NYS) | 748 | Disclosed |
| NYC share of active licences | 48.6%–49.5% | Estimated |
| Metro coverage of this registry | ≈66% of metro licensed firms | Estimated |

---

## What we don't know yet

1. **IUEC Local 1 membership.** Not retrieved. DOL LM-2 unreachable — web-search budget exhausted and `dol.gov`/`bls.gov`-class hosts blocked by session egress policy. Ceiling of 3,948 active statewide mechanic licences is the only bound offered. **Left empty.**
2. **The 21-day filing window, §28-304.6.1 unaffiliation requirement, and civil-penalty dollar amounts.** Carried from an earlier pass but **not re-verified in run 07** — every nyc.gov DOB elevator URL attempted returned 404. The enforcement *code structure* independently corroborates that filing and correction are separately enforced, but the specific windows and dollar figures need a primary-source re-check.
3. **OEM vs platform vs independent split of the 132 contractor licences.** Requires name-level classification of the licence register — target-list work under different rules. Deliberately not done here.
4. **Passenger vs freight elevator split.** `equipment_type` is null for 79.8% of active devices and encodes drive technology, not duty class. Not derivable.
5. **Device age and modernisation cycle.** No install or manufacture date in the registry; `status_date` is a migration artefact (46.1% clustered in 2019–2021). A partial route exists via `juyv-2jek` machine/controller fields for post-2017 filings, but `machine_manufacturer` has 2,031 free-text variants and needs a normalisation pass first.
6. **OEM installed-base share.** Blocked by the same free-text problem. Worth a dedicated normalisation run — it would reveal how much of the base sits on equipment whose OEM has a structural service advantage.
7. **Device counts for the rest of the MSA** — Westchester, Nassau, Suffolk, Rockland, Putnam, northern NJ. No comparable public registry is known to exist. The ~66% metro-coverage figure is a **supply-side licence proxy**, not a device count, and its bias direction is unresolved.
8. **Contract-level route density.** This run measured devices per *building*. Service contracts are not building-scoped, and the registry carries no maintenance-provider field. Building density is a proxy for route economics, not a measurement of it.
9. **Whether the 2020→2025 decline in distinct permit filers (183→146) is consolidation or construction-cycle normalisation.** Both fit the data. Not separable from this dataset alone.
10. **Revenue.** No primary source publishes metro-level revenue for construction trades. No dollar figure is asserted anywhere in this document.
