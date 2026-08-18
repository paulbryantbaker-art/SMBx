# 02 — Codes and the Mandate (US Fire & Life Safety)

**Stream:** Codes, standards, adoption lag, licensing, enforcement mechanics
**Compiled:** 2026-07-29
**Basis key:** `Disclosed` = stated in a cited published source · `Press-derived` = inferred from trade/press reporting · `Estimated` = my arithmetic, shown in `## Derivations`

---

## 0. The chain of obligation — how a private standard becomes a bill

A US building owner is never bound by "NFPA 25." The owner is bound by the **edition of NFPA 25 that the Authority Having Jurisdiction has adopted**, which arrives through a three-link chain:

1. **Model code adoption.** A state (or, in home-rule states, a municipality) adopts either the **ICC International Fire Code (IFC)** or the **NFPA 1 Fire Code** / **NFPA 101 Life Safety Code** family, by statute or administrative rule.
2. **Reference into the model code.** The model code mandates ITM by reference. In the IFC family this is **IFC Section 901.6** and **IFC Table 901.6.1, "Fire Protection System Maintenance Standards."** In the NFPA family it is **NFPA 1 Chapter 13**.
3. **Edition freeze.** The referenced standard's edition is fixed by the model code's **Chapter 80 (Referenced Standards)** list, not by whatever NFPA has most recently published. Adoption therefore lags the current edition by two to five cycles in most of the country.

Load-bearing wording, **NYC Fire Code (2022), FC 901.6** — "Fire protection systems shall be maintained in good working order at all times," with systems not in working order to be "repaired or replaced as necessary"; **FC 901.6.1** routes to the referenced standards in **FC Table 901.6.1** (portable extinguishers → NFPA 10; sprinkler systems → NFPA 25; fire alarm systems → NFPA 72; carbon dioxide systems → NFPA 12). `Basis: Disclosed` — https://www.nyc.gov/assets/fdny/downloads/pdf/about/Chapter-09.pdf

The National Fire Sprinkler Association states the mechanism explicitly: "Jurisdictions adopting the 2024 editions of the IBC, IFC, NFPA 1, or NFPA 101 will also begin enforcing the latest versions of several critical fire protection standards, including but not limited to" **NFPA 13-2022, NFPA 20-2022, NFPA 14-2024, NFPA 72-2022, NFPA 25-2023**. `Basis: Disclosed` — NFSA, 2025-07-02, https://nfsa.org/2025/07/02/maryland-and-north-carolina-adopt-2023-edition-of-nfpa-25/

**Underwriting consequence:** the annuity is a function of *adopted* edition, not current edition. A target's route density and revenue-per-site in Maryland (NFPA 1-2024 → NFPA 25-2023) is not the same obligation set as in Minnesota (state fire marshal guidance still citing NFPA 25-2011).

---

## 1. SUB-VERTICAL 1 — Fire protection contracting (sprinkler / suppression install + ITM)

### 1.1 NFPA 25 — current edition and predecessors

| Item | Value | Basis | Source |
|---|---|---|---|
| Full title | Standard for the Inspection, Testing, and Maintenance of Water-Based Fire Protection Systems | Disclosed | nfpa.org product page |
| Current edition | **2026** | Disclosed | NFPA product listing; QRFS change analysis 2026-06-23 |
| Immediately prior editions | 2023, 2020, 2017, 2014, 2011 | Disclosed | NFSA (2023 ed.); MN DOH (2011 ed.); MN SFM (2011 ed.) |
| Revision cycle | 3 years | Estimated (see Derivations D1) | — |
| Tentative Interim Amendment on record | TIA 25-26-1 posted at docinfofiles.nfpa.org | Disclosed | https://docinfofiles.nfpa.org/files/AboutTheCodes/25/TIA_25_26_1.pdf |

### 1.2 NFPA 25 frequency table — the sprinkler ITM annuity

Section numbers below are cited to the edition indicated in the right-hand column. **Numbering moved between editions** (notably valve chapters at 13.x in the 2011 edition vs. component chapters at 5.x/6.x/8.x/13.x/14.x in 2020–2023), so section numbers are only meaningful against a stated edition.

#### Weekly

| Component | Requirement | Section (edition) | Basis |
|---|---|---|---|
| Gauges — dry pipe, preaction, deluge | Visual inspection | 5.2.4.2 (2011) | Disclosed — Getz Fire matrix |
| Control valves secured with **seals only** | Visual position inspection | 13.3.2.1 (2011) | Disclosed — Getz Fire; ironsmithfire (2023) |
| Fire pump casing relief valve | Inspection | 13.5.7.1 (2011) | Disclosed — Getz Fire |
| Fire pump pressure relief valve | Inspection | 13.5.7.2 (2011) | Disclosed — Getz Fire |
| **Diesel** fire pump no-flow (churn) test | Run test | 8.3.1 (2023 numbering per UpToCode) | Disclosed — ironsmithfire (2023 ed.) |

#### Monthly

| Component | Requirement | Section (edition) | Basis |
|---|---|---|---|
| Gauges — wet pipe systems | Visual inspection | 5.2.4.1 (2011) | Disclosed — Getz Fire |
| Control valves — locked or electrically supervised | Visual position inspection | 13.3.2.1 (2011) | Disclosed — Getz Fire; MN DOH |
| Alarm valves — external | Inspection | 13.4.1.1 (2011) | Disclosed — Getz Fire |
| **Electric** fire pump no-flow (churn) test | Run test | — | Disclosed — ironsmithfire (2023 ed.) |
| Water tank low-temperature alarms (cold weather) | Test | NFPA 25-1998 per ASHE | Disclosed — ASHE (2014) |

> **CONFLICT — fire pump churn test.** ironsmithfire (2023 edition) reports **electric monthly / diesel weekly**. The ASHE hospital schedule (2014, citing NFPA 25-1998 and NFPA 25-2011) reports **weekly for fire pumps generally, monthly permitted with a CMS waiver**. Both are reported. **I would underwrite on electric-monthly / diesel-weekly** for post-2017-edition jurisdictions, and on **weekly for all pumps** in any jurisdiction still enforcing a pre-2017 edition or any CMS-certified facility without the waiver — because the weekly obligation is the one that generates the larger route-labour requirement and the one an AHJ can cite against.
> Sources: https://ironsmithfire.com/nfpa-25-inspection-schedule/ (2026-06-12) · https://www.ashe.org/sites/default/files/ashe/fire-safety-equipment-system-inspection_hospitals.pdf (2014)

#### Quarterly

| Component | Requirement | Section (edition) | Basis |
|---|---|---|---|
| Waterflow alarm devices | Inspection and test | 5.2.5 / 13.2.6 (2011); 5.3.1 (2023 per UpToCode) | Disclosed — Getz Fire; UpToCode |
| Fire department connections (FDC) | Inspection | 13.7.1 (2011); 13.8.1 (2023 per UpToCode) | Disclosed — Getz Fire; UpToCode |
| Sprinkler pressure-reducing valves | Inspection | 13.5.1.1 (2011) | Disclosed — Getz Fire |
| Hydraulic nameplates | Inspection | — | Disclosed — ironsmithfire |
| Main drain test **where a backflow preventer or PRV is present on the riser** | Test | 13.2.5 (2011) | Disclosed — Getz Fire; ironsmithfire |
| Supervisory signal devices (non-valve) | Test | NFPA 72-1999 per ASHE | Disclosed — ASHE |

#### Semiannual

| Component | Requirement | Basis |
|---|---|---|
| Vane-type and pressure-switch-type waterflow switches | Test | Disclosed — ironsmithfire; MN DOH (2011 ed., Sec. 5.3.3 / 13.2.6) |
| Valve tamper (supervisory) switches | Test | Disclosed — ASHE (NFPA 72-1999) |
| Water tank high/low level alarms | Test | Disclosed — ASHE (NFPA 25-1998) |
| Dry and preaction waterflow test — **2026 edition adds a three-option semiannual test** (bypass connection, inspector's test connection, or automated testing) | Test | Disclosed — QRFS on NFPA 25-2026 |

#### Annual

| Component | Requirement | Section (edition) | Basis |
|---|---|---|---|
| Sprinklers (floor-level visual), pipe and fittings, hangers, seismic bracing, signage, spare sprinkler cabinet | Inspection | 5.2.1.1 / 5.2.2 (2011); 5.2.1 (2023) | Disclosed — Getz Fire; UpToCode |
| Main drain test at each riser | Test | 5.3.3 (2023 per UpToCode) | Disclosed |
| Antifreeze solution concentration | Test | — | Disclosed — ironsmithfire |
| Fire pump full-flow test at churn, 100% and 150% of rated capacity | Test | 8.3.3 (2023 per UpToCode) | Disclosed |
| Backflow preventer forward-flow test | Test | — | Disclosed — ironsmithfire |
| Dry pipe valve **partial** trip test | Test | 13.4.4.2.2 (2011) | Disclosed — Getz Fire; MN DOH |
| Preaction / deluge valve trip test at full flow | Test | 13.4.3.2.2 (2011) | Disclosed — Getz Fire |
| Dry pipe / preaction / deluge valve interior inspection and cleaning (during trip test) | Inspection + maintenance | 13.4.4.1.5, 13.4.4.3, 13.4.3.1.7, 13.4.3.3.2 (2011) | Disclosed — Getz Fire |
| Control valve full-range operation; OS&Y stem lubrication | Maintenance | 13.3.3.1, 13.3.4 (2011) | Disclosed — Getz Fire |
| Hose connection valves; hose rack valves | Inspection | 13.5.2.1, 13.5.3.1 (2011) | Disclosed — Getz Fire |
| Fire hydrants — inspection and lubrication (ironsmithfire also reports an **annual hydrant flow test**) | Inspection / test | — | Press-derived — ironsmithfire only; not corroborated |

#### Every 3 years

| Component | Requirement | Section (edition) | Basis |
|---|---|---|---|
| Dry pipe and preaction valves — **full-flow trip test** | Test | 13.4.4.2.2.2 (2011) | Disclosed — MN DOH; ironsmithfire |
| Occupant-use fire hose service test after first 5 years | Test | NFPA 1962 (2008) 4.3.2 — "removed…at intervals not exceeding 5 years" then every 3 years | Disclosed — Getz Fire |

#### Every 5 years

| Component | Requirement | Section (edition) | Basis |
|---|---|---|---|
| **Internal pipe assessment** (corrosion, scale, obstructing material) | Inspection | **14.2.1** | Disclosed — psintegrated (2021-08-31); UpToCode |
| Obstruction investigation where conditions indicate | Investigation | 14.3 (2011) | Disclosed — Getz Fire |
| Check valves — internal inspection | Inspection | 13.4.2.1 (2011) | Disclosed — Getz Fire |
| **Gauges — replace, or test by comparison with a calibrated gauge** | Test / replace | **5.3.2.1** | Disclosed — psintegrated; Getz Fire (5.3.2) |
| **Standpipe flow test at the hydraulically most remote outlet** | Test | **6.3.1.1** | Disclosed — psintegrated; UpToCode (6.3.1) |
| **Manual standpipe hydrostatic test** | Test | **6.3.2.1** | Disclosed — psintegrated |
| Pressure-reducing valve full-flow test | Test | — | Disclosed — ironsmithfire |
| Underground and exposed private fire service main flow test | Test | — | Disclosed — ironsmithfire |
| FDC piping hydrostatic test — **2026 edition relief:** pipe between FDC and check valve of 10 ft or less may skip the five-year hydrostatic test if visually inspected internally and externally | Test | New in 2026 ed. | Disclosed — QRFS |

#### Long-cycle sprinkler sample testing — **the largest live conflict in NFPA 25**

| Sprinkler class | NFSA (2023 ed.) | Getz Fire (2011 ed.) | ironsmithfire (2023 ed.) |
|---|---|---|---|
| Standard response | 50 years, then every 10 years | 50 years (5.3.1.1.1) | 50 years |
| Fast response, **not** ESFR/CMSA | **25 years**, then every 10 years | 20 years (5.3.1.1.1.3) | 25 years |
| ESFR and CMSA | **20 years**, then every 10 years | not separately listed | not separately listed |
| Dry sprinklers | **20 years**, then every 10 years | not listed | **20 years** |
| Extra-high-temperature solder type under continuous max ambient | not listed | **5 years** (5.3.1.1.1.4) | not listed |
| Harsh/corrosive environment | **5 years** | not listed | not listed |
| High-temperature | not listed | not listed | 75 years |

> **CONFLICT preserved.** NFSA is the sprinkler industry's own standards body and its post reads directly off the 2023 edition; ironsmithfire's 75-year "high temperature" row is not corroborated anywhere else I found, and Getz Fire's 20-year fast-response row is the **2011** rule. **I would underwrite on the NFSA schedule** for any 2020-or-later adopted edition, and treat the 20-year fast-response trigger as the binding one in pre-2020 jurisdictions. The commercial point is the same either way: the 20/25-year sample test is a **replacement-driving event**, not an inspection, and it is arriving now for buildings sprinklered in the 2000–2006 construction wave.
> Sources: https://nfsa.org/2023/08/17/nfpa-25-fire-sprinkler-testing/ (2023-08-17) · https://getzfire.com/wp-content/uploads/2020/09/Service-Requirements.pdf · https://ironsmithfire.com/nfpa-25-inspection-schedule/ (2026-06-12)

Additional 2026-edition item with direct replacement revenue: **residential sprinklers in dwelling units in place 50 years must be replaced with fast-response models or tested to confirm the thermal response index does not exceed 65 (m·s)^½.** `Basis: Disclosed` — QRFS on NFPA 25-2026.

### 1.3 NFPA 25 (2026) changes that move the revenue line

| Change | Section | Commercial read | Basis |
|---|---|---|---|
| Escutcheons and cover plates on recessed/concealed sprinklers must be replaced for physical damage, detrimental corrosion, loading, non-manufacturer paint, or adhered covers | 5.2.1.1.5 | Converts a visual finding into a parts-and-labour ticket on every annual | Disclosed — QRFS |
| Spare sprinkler cabinet list must add K-factor, temperature rating, wrench model numbers and quantity by type | 5.4.1.6.6.1 | Recurring deficiency line item | Disclosed — QRFS |
| Abandoned systems must be physically removed/disabled and distinctly marked | **4.1.13** (new) | Decommissioning scope | Disclosed — QRFS |
| Ice in piping explicitly defined as an impairment requiring thawing or replacement | Impairment chapter | Emergency-service driver | Disclosed — QRFS |
| Corrosion-mitigation systems (nitrogen generators, vapour inhibitors) must be maintained per manufacturer spec or the system requires recalculation | Impairment chapter | Pulls nitrogen inerting into the ITM contract | Disclosed — QRFS |
| Personnel must be "qualified…for the specific tasks performed" — AHJ may set standards by task type | Ch. 4 | Loosens/varies the labour-qualification gate by task | Disclosed — QRFS |

---

## 2. SUB-VERTICAL 2 — Alarm, detection and monitoring

### 2.1 NFPA 72 — current edition

| Item | Value | Basis | Source |
|---|---|---|---|
| Full title | National Fire Alarm and Signaling Code | Disclosed | nfpa.org |
| Current edition | **2025** | Disclosed | NFPA product page; ICC store; ANSI webstore |
| Prior editions in circulation | 2022, 2019, 2016, 2013, 2010 | Disclosed | NFSA (2022); Seattle FD (2016); MN DOH (2010) |
| Governing ITM chapter | **Chapter 14** — Table 14.3.1 (inspection), Table 14.4.3.2 / Table 14.4.5 (testing) | Disclosed | MN DOH; UpToCode |

### 2.2 NFPA 72 frequency table by device class

Cited to **NFPA 72-2010** (Minnesota Department of Health reproduction, June 2016) unless noted; corroborated for the 2019+ editions by UpToCode.

| Device / component | Inspect | Test | Section / table (2010 ed.) |
|---|---|---|---|
| Fire alarm control unit — trouble signals | Semiannually | Annually | Table 14.3.1 |
| Remote annunciators | Semiannually | Annually | Table 14.3.1 |
| Initiating devices (smoke, heat, pull stations) | Semiannually | Annually | Table 14.3.1; Table 14.4.5 |
| Notification appliances (horns, strobes, speakers) | Semiannually | Annually | Table 14.3.1; Table 14.4.5 |
| Magnetic door hold-open devices | Semiannually | — | Table 14.3.1 |
| **Lead-acid batteries** | **Monthly** | Semiannual + annual load/discharge | Table 14.3.1; Table 14.4.5 |
| Nickel-cadmium batteries | Semiannually | Semiannual + annual | Table 14.3.1; Table 14.4.5 |
| Sealed lead-acid batteries | Semiannually | Semiannual + annual; **replace every 4 years** | Table 14.3.1; Table 14.4.5 |
| **Primary (dry cell) batteries** | **Monthly** | **Monthly** | Table 14.3.1; Table 14.4.2.2 |
| **Smoke detector sensitivity** | — | **Within 1 year of installation, then every alternate year; after two consecutive successful tests the interval may extend to 5 years** | Sec. 14.4.5.3 |
| Heat detectors — non-restorable fixed-temperature | — | **Every 15 years**: replace, or laboratory-test 2 per 100 | Table 14.4.2.2, item 14.d.3 |
| Heat detectors — restorable fixed-temperature | — | Annually test 2 (or 20%, whichever is greater) per circuit; **all detectors within 5 years** | Sec. 14.4.5.5 |
| Duct detectors | Semiannually | Annually + airflow verification | UpToCode (2019+) |
| **DACT / supervising-station transmitter** | Semiannually | Annually | Table 14.3.1 item 15(a); Table 14.4.5 item 22 |
| Waterflow switches | Semiannually | **Quarterly** | UpToCode; NFPA 25 cross-reference |
| Kitchen hood extinguishing system interface switches | Semiannually | Annually | MN DOH text |
| Interface devices (elevator recall, HVAC shutdown, door release) | Semiannually | Annually | Sec. 14.4.5 |
| Emergency voice/alarm communication | Semiannually | Annually + intelligibility verification | UpToCode |

**Seattle Fire Department**, citing **2016 NFPA 72 Chapter 14**, restates two of these in AHJ-facing language: smoke detector sensitivity "required every 5 yrs, after passing 1st annual calibration test," and "2 or 20%, whichever is greater, of restorable fixed-temperature, spot-type heat detectors need to be tested annually." `Basis: Disclosed` — https://seattle.gov/Documents/Departments/Fire/Business/SystemsTestingFireAlarm.pdf

### 2.3 Monitoring / supervising station

| Requirement | Value | Basis | Source |
|---|---|---|---|
| Supervising-station communications path supervision — **single** communications path | Timer test at intervals **not exceeding 60 minutes** | Disclosed | NFSA, 2023-02-03 |
| Supervising-station communications path supervision — **multiple** paths | Timer test at intervals **not exceeding 6 hours** | Disclosed | NFSA, 2023-02-03 |
| Sprinkler control valve supervision — NFPA 13 (2022) §16.9.3.3.1 permits four conditions: central station / proprietary / remote station signalling; local signalling at a constantly attended location; valves locked in position; or valves in fenced enclosures sealed open and **inspected weekly** | — | Disclosed | NFSA, 2023-02-03 |
| **IFC Section 903.4** requires valves controlling the water supply for automatic sprinkler systems to be supervised by a **listed fire alarm control unit** — NFSA states that where the two conflict, the IFC controls | — | Disclosed | NFSA, 2023-02-03 |

**Underwriting read:** IFC 903.4 is what forces a *monitored* alarm panel onto sprinklered commercial stock, and is therefore the code hook that converts a one-time sprinkler install into a recurring monitoring RMR line. This is the structural link between sub-vertical 1 and sub-vertical 2.

### 2.4 Records

- **NFPA 72 §14.6.2.4** — "Record be kept of all inspections, testing and maintenance performed"; records maintained on premises for a minimum of three years; smoke detector sensitivity testing extended to five years requires longer retention. Sample form: **NFPA 72(2010) Figure 14.6.2.4**, 11 pages. `Basis: Disclosed` — MN DOH.
- **NFPA 72 §10.4.3** — "Only properly trained and competent persons perform inspections, testing and maintenance." `Basis: Disclosed` — MN DOH.

---

## 3. SUB-VERTICAL 3 — Extinguisher, kitchen and special hazard

### 3.1 NFPA 10 — Portable Fire Extinguishers

| Item | Value | Basis | Source |
|---|---|---|---|
| Current edition | **2026** | Press-derived | Multiple 2026 trade guides reference "NFPA 10 (2026)"; NFPA product page not directly confirmable |
| Prior editions in circulation | 2022, 2018, 2013, 2010 | Disclosed | MN DOH (2010); Central Valley Fire District lists NFPA 10-2021 |
| Notable 2026 change | Electronic monitoring permitted **in lieu of** the manual monthly inspection | Press-derived | fireprotectionfinder.com |

Frequencies cited to **NFPA 10-2010** (MN DOH, June 2016 rev. Nov 2016), corroborated by the Getz Fire matrix:

| Interval | Requirement | Section |
|---|---|---|
| **Monthly (30-day intervals)** | Visual inspection when initially placed in service and "at least monthly at a minimum of 30-day intervals thereafter"; may be performed by facility staff, or replaced by electronic monitoring | **7.2.1** |
| Monthly — documentation | Date and inspector initials on tag, label, or checklist | 7.2.4 |
| **Annual** | Maintenance by a trained technician using manufacturer manuals and proper tools; new tamper seals on rechargeable units | **7.3.1.1.1** |
| Annual — documentation | Tag/label recording month and year of service, technician name, company name | 7.3.3 |
| Annual | CO₂ hose assembly conductivity test | 7.3.1.3 |
| **6-year** | Stored-pressure extinguishers subject to a 12-year hydrostatic test must be **emptied and internally examined** | **7.3.1.2.1** |
| 6-year — documentation | Durable metallic label, minimum 2 in. × 3½ in., affixed by a heatless process | 7.3.3.1 |
| **Hydrostatic** | Table **8.3.1** — see below | 8.3.1 |

**Hydrostatic test intervals by extinguisher type** (`Basis: Disclosed` — MN DOH citing NFPA 10-2010 Table 8.3.1):

| Type | Interval |
|---|---|
| Pressurized water | 5 years |
| Water mist | 5 years |
| Carbon dioxide (CO₂) | 5 years |
| Wet chemical (Class K) | 5 years |
| Dry chemical with **stainless steel** shells | 5 years |
| Dry chemical (standard) | 12 years |
| AFFF / FFFP foam | 5 years (Getz Fire: "pressurized water/foam 5 yr") |
| Halogenated agent | 12 years (Getz Fire) |
| **Non-rechargeable stored-pressure** | Removed from service **12 years from date of manufacture** — no hydrostatic option |

Documentation: low-pressure cylinders require a metallic label showing month/year, test pressure and technician/company (§8.7.2/8.7.3); high-pressure cylinders (CO₂) require a **stamp** with tester ID and test date. `Basis: Disclosed` — MN DOH.

### 3.2 NFPA 96 — Commercial cooking (the route-density tier)

| Item | Value | Basis | Source |
|---|---|---|---|
| Full title | Standard for Ventilation Control and Fire Protection of Commercial Cooking Operations | Disclosed | nfpa.org |
| Current edition | **2024**, issued April 2023 | Press-derived | usmadesupply.com; Amazon/ICC listings for the 2024 edition |
| Editions still enforced | "most AHJs still enforce the 2017 or 2021 adopted editions" | Disclosed (quoted) | usmadesupply.com |
| Prior editions cited by AHJs | 2011 (MN DOH) | Disclosed | MN DOH |

**Frequency by cooking volume** — the tiering that makes kitchen work route-dense:

| Cooking operation | Frequency | Basis |
|---|---|---|
| **Solid-fuel** cooking (wood, charcoal) | **Monthly** | Disclosed — facilitec-sw; usmadesupply |
| **High-volume** (24-hour operation, charbroiling, wok) | **Quarterly** | Disclosed — facilitec-sw; usmadesupply |
| **Moderate-volume** (standard ≈6–16 hour operation) | **Semiannually** | Disclosed — facilitec-sw; usmadesupply |
| **Low-volume** (places of religious worship, seasonal businesses, senior centres) | **Annually** | Disclosed — facilitec-sw; usmadesupply |

> **CONFLICT 1 — table number.** facilitec-sw places the schedule at **Table 12.4** of the 2024 edition and quotes §12.4: "The entire exhaust system shall be inspected for grease buildup by a properly trained, qualified, and certified person(s)…". usmadesupply states the cleaning requirement sits at **§12.6.1 in the 2021 and 2024 editions, and was §11.4 in 2017 and earlier**. The Minnesota Department of Health, working from **NFPA 96(2011)**, cites **"Sec. 11.4 and Table 11.4."** All three are reported. **I would underwrite on: Table 11.4 for pre-2021 adopted editions; Chapter 12 (Table 12.4 inspection, §12.6.1 cleaning) for 2021 and 2024.**
>
> **CONFLICT 2 — inspection vs. cleaning, and this one is commercially material.** facilitec-sw states: "Table 12.4 is an inspection schedule, not a cleaning schedule. Cleaning is a separate event with a separate trigger," with cleaning triggered when inspection finds grease exceeding the depth thresholds in §12.6.1.1. The Minnesota Department of Health, by contrast, reports a flat **6-month cleaning frequency, extendable to 12 months with documented minimal grease production and AHJ approval** — i.e. treats the interval as a cleaning cadence. **I would underwrite on the inspection/cleaning split** (it is the correct reading of the standard's structure) **but model revenue on the AHJ practice**, because most AHJs — and the IFC, below — enforce the interval as a *service visit* cadence and hood-cleaning contractors bill it that way.
> Sources: https://facilitec-sw.com/compliance/nfpa-96-codes/ · https://usmadesupply.com/resources/building-codes-standards/fire-suppression-standards/nfpa-96 · https://www.health.state.mn.us/facilities/regulation/engineering/docs/lsckitcheneqp.pdf (July 2016)

**Wet-chemical suppression service and fusible links:**

| Requirement | Section | Basis |
|---|---|---|
| "Maintenance of the fire-extinguishing systems…shall be made by properly trained, qualified, and certified person(s)…**at least every 6 months**" | **§12.2.1** (2024 ed.); **§11.2.1** (2011 ed.) | Disclosed — facilitec-sw (2024); MN DOH (2011) |
| Fusible links — **metal alloy type replaced at least semiannually** | §12.2.4 (2024 ed. per facilitec: "Fusible links must be replaced annually") | **CONFLICT** — see below |
| Fusible links — other types "examined and cleaned or replaced at least annually" | NFPA 96(2011) per MN DOH | Disclosed |
| Monthly owner/staff inspection of the kitchen hood extinguishing system | — | Disclosed — MN DOH |

> **CONFLICT — fusible links.** facilitec-sw (2024 ed.) says fusible links must be replaced **annually** per §12.2.4. MN DOH (2011 ed.) says **metal alloy links semiannually**, other types examined/cleaned or replaced **annually**. Both reported. **I would underwrite on semiannual for metal-alloy links** because that is the interval that aligns with the semiannual suppression service visit and is therefore already in the route.

**IFC counterpart — this is what an IFC-family AHJ actually enforces.** City of Charleston, SC, citing **2015 IFC §609.3.3.1 and Table 609.3.3.1**:

| Cooking operation type | Inspection interval |
|---|---|
| High-volume (24-hour, charbroiling, wok) | **3 months** |
| Solid fuel-burning appliances | **1 month** |
| Low-volume (religious worship, seasonal, senior centres) | **12 months** |
| All other operations | **6 months** |

Recordkeeping wording, quoted: "Records for inspections shall state the individual and company performing the inspection, a description of the inspection and when the inspection took place. Records for cleanings shall state the individual and company performing the cleaning and when the cleaning took place." Cleaning must comply with **ANSI/IKECA C10**. `Basis: Disclosed` — https://www.charleston-sc.gov/1456/Inspection-Frequency

### 3.3 Special hazard — NFPA 2001, 17, 17A, 12, 12A

Cited to the editions in the Getz Fire service matrix unless noted.

| System | Requirement | Interval | Section (edition) |
|---|---|---|---|
| **Clean agent — NFPA 2001 (2008)** | "At least annually, all systems shall be thoroughly inspected" | Annual | 7.1.1 |
| | Weigh cylinders (agent quantity and pressure) | Semiannual | 7.1.3 |
| | Container hydrostatic retest (DOT/CTC) | 5+ years | 7.2.1 |
| | Hose test | 5 years | 7.3.2.1 |
| | Room/enclosure integrity | Annual | 7.4 |
| **Clean agent — NFPA 2001 (2022)** | Visual inspection (cylinders in place, gauges in range, actuators accessible, no damage/corrosion) | **Monthly** | 8.1.1 |
| | Container check — weigh or measure against minimum design concentration | Semiannual | 8.4 |
| | Functional test — detection circuits, releasing panel, control and supervisory circuits | Annual | 8.6 / Annex C |
| | Cylinder hydrostatic test | 5 years, per **49 CFR §180.205** | 8.7 |
| | Enclosure integrity (door fan) test per **ASTM E2174**, verifying the minimum **10-minute hold time** | — | 8.8; hold time at 5.5.3.4 |
| **Dry chemical — NFPA 17 (2009)** | "At least semiannually, maintenance shall be conducted"; agent examined for caking | Semiannual | 11.3.1, 11.3.1.1 |
| | Container and hose hydrostatic test | 12 years | 11.5.1 |
| **Wet chemical — NFPA 17A (2009)** | "At least semiannually, maintenance shall be conducted" | Semiannual | 7.3.3 |
| | Container and hose hydrostatic test | 12 years | 7.5.1 |
| **CO₂ — NFPA 12 (2011)** | System inspection (30-day) | Monthly | 4.8.1 |
| | System test by competent personnel | Annual | 4.8.3.2 |
| | Weigh high-pressure cylinders | Semiannual | 4.8.3.5.1 |
| | Container hydrostatic retest; 12-year service limit | 5–12 years | 4.6.5.2 |
| | Hose test | 5 years | 4.8.2.3 |
| **Halon 1301 — NFPA 12A (2009)** | "At least semiannually, all systems shall be thoroughly inspected" | Semiannual | 6.1.1 |
| | Container retest | 5+ years | 6.2.1 |
| | Hose inspection / hose test | Annual / 5 years | 6.3, 6.3.2 |
| | Room integrity | Semiannual | 6.4 |

> **CONFLICT — NFPA 2001 base inspection interval.** The 2008 edition sets an **annual** thorough inspection with semiannual weighing; the 2022 edition sets a **monthly** visual with semiannual container check and annual functional test. Both reported. **I would underwrite on the 2022 structure** for data-centre and mission-critical accounts (which are typically in recently-adopted jurisdictions and typically contract to the newer edition regardless), and note that the monthly visual is usually owner-performed, so the *billable* clean-agent cadence remains semiannual + annual either way.
> Sources: https://getzfire.com/wp-content/uploads/2020/09/Service-Requirements.pdf · https://www.uptocode.build/resources/nfpa-2001

---

## 4. Model code family and adopted edition by state

### 4.1 Family split — two conflicting counts, both reported

| Source | Count | Basis |
|---|---|---|
| PlainFireData, "Fire Code Adoption by State" | 33 states IFC · 11 states NFPA · 3 state-specific (CA, NY, OR) · 4 local-only (MO, MT, SD, WY) | Press-derived — no edition years, no citations, no page date found |
| ICC Master I-Code Adoption Chart, **January 2024** | 43 jurisdictions with a statewide IFC edition listed; 15 jurisdictions flagged as local-only (with overlap where a state has both a statewide code and local adoption authority) | Disclosed |

> **CONFLICT.** PlainFireData classes Indiana, Iowa, Louisiana, Massachusetts and Michigan variously as "NFPA" or "IFC" in ways the ICC chart contradicts (ICC lists Louisiana 2021 IFC, Massachusetts 2015 IFC, Michigan 2015 IFC statewide). **I would underwrite on the ICC chart** for the IFC column — it is the ICC's own adoption tracking and carries edition years — and treat PlainFireData's "NFPA" column as a signal only. Several states genuinely run **both** (Georgia adopts an IFC-derived State Minimum Standard Fire Code *and* NFPA 101 for state fire marshal jurisdiction). Neither source is adequate for deal diligence; adoption must be confirmed state by state against the administrative code.
> Sources: https://plainfiredata.com/fire-codes · https://www.iccsafe.org/wp-content/uploads/Master-I-Code-Adoption-Chart-1.pdf (January 2024)

### 4.2 IFC edition adopted statewide — ICC Master Chart, January 2024

`Basis: Disclosed` — ICC Master I-Code Adoption Chart, January 2024.

| IFC edition | States |
|---|---|
| **2021** | AL, AK, AR, CA, CT, DE, FL, LA, MD, MT, NV, NJ, NC, ND, OR, SC, SD, UT, VA, WY |
| **2018** | AZ, GA, HI, ID, MN, MS, NE, NH, NY, OK, PA, RI, WA, WV |
| **2015** | DC, ME, MA, MI, NM, OH, WI |
| **2012** | TN, TX |
| Local adoption only (chart "X") | CO, IL, IN, IA, KS, KY, MO, NV, NJ, NM, OK, TX, VT, WA, WY |

Note the overlaps: several states appear in both a statewide row and the local-only column because the statewide code is a floor and municipalities adopt independently (home rule). **Texas and Tennessee at the 2012 IFC are the extreme lag cases in the chart.**

### 4.3 Primary adoption instruments verified — named, cited, dated

| Jurisdiction | Family | Adopted edition | Instrument | Effective / dated | Basis |
|---|---|---|---|---|---|
| **Florida** | NFPA | **NFPA 1, Florida 2021 Edition** and **NFPA 101, Florida 2021 Edition** (Florida Fire Prevention Code, 8th Edition) | **F.A.C. 69A-60.003** (NFPA 1) and **69A-60.004** (NFPA 101); rulemaking authority ss. 633.104, 633.202, 633.208 F.S. | **Effective 12/31/2023**; prior amendments 4-26-22, 12-31-20, 11-11-18, 12-31-17 | Disclosed |
| **Florida — next cycle** | NFPA | 9th Edition (2026) FFPC | Rule hearing | **Hearing scheduled 2026-07-14** | Disclosed |
| **Maryland** | NFPA | **NFPA 1, 2024 edition** | Maryland State Fire Prevention Code | **"As of June 23, 2025, Maryland has officially adopted the 2024 edition of NFPA 1"** | Disclosed (NFSA) |
| **Massachusetts** | NFPA | **NFPA 1, 2021 edition**, with Massachusetts amendments | **527 CMR 1.00**, Massachusetts Comprehensive Fire Safety Code (Board of Fire Prevention Regulations) | In effect **2022-12-09**; update effective **2023-05-12** | Disclosed |
| **Illinois** | NFPA 101 | **NFPA 101, 2015 edition** (replacing the **2000 edition**) | **41 Ill. Adm. Code Part 100**, Fire Prevention and Safety | **Effective 2020-01-01** | Disclosed |
| **California** | IFC-derived, state-specific | **2025 California Fire Code, Title 24 Part 9**, based on the **2024 IFC** | California Building Standards Commission triennial code | Published **2025-07-01**, **effective 2026-01-01** | Disclosed |
| **New York State** | IFC | **2020 Fire Code of New York State**, based on the **2018 IFC** | 19 NYCRR (Uniform Fire Prevention and Building Code) | — | Press-derived (UpCodes edition label; DOS page not parsed) |
| **New York City** | Own | **NYC Fire Code 2022** (Title 29) | NYC Administrative Code | — | Disclosed (FDNY Chapter 9 PDF) |
| **Ohio** | IFC | Ohio Fire Code | **OAC 1301:7-7** | Rule text effective **2025-11-20** | Disclosed (rule metadata; underlying IFC edition not confirmed) |
| **Minnesota** | IFC | Minnesota State Fire Code; ICC chart shows **2018 IFC** | — | — | Disclosed |
| **Minnesota — NFPA 25** | — | Minnesota State Fire Marshal page states **"The 2011 edition of NFPA 25"** | MN DPS/SFM fire code topic page | undated | Disclosed — **conflicts with the 2018 IFC referencing NFPA 25-2017**; see §4.5 |
| **Utah** | IFC | Utah adopts **2021 IFC** (ICC chart); **R710-5** amends **NFPA 25 Chapter 5, Section 5.1, Table 5.1** directly | **Utah Admin. Code R710-5-7** | — | Disclosed |
| **Central Valley Fire District, Montana** (worked example of local adoption) | IFC | **2021 IFC** by **Board Resolution 222307**, approved by the Montana State Fire Marshal | Board Resolution 222307 adopted **2023-04-11** | **Effective 2023-04-12**; projects submitted before that date use the **2012 IFC** | Disclosed |
| **Vancouver, WA** | IFC + local amendment | Adds ITM reporting to IFC 901.6 | **VMC 16.04.166**, **Ordinance M-4485 § 27, 2024** | 2024 | Disclosed |
| **Sun City Fire District, AZ** | IFC | **2024 IFC** with district amendments | District code adoption document, as amended 01-2026 | 2026 | Disclosed (document exists; contents not parsed) |

### 4.4 Which NFPA edition each IFC edition freezes

I could **not** retrieve IFC Chapter 80 itself — ICC Digital Codes gates it behind Premium and UpCodes blocks automated retrieval. What I did establish, from an AHJ that published its own Chapter 80 selections:

**Central Valley Fire District (MT), on the 2021 IFC**, lists as adopted referenced standards: **NFPA 10 (2021), NFPA 13 (2019), NFPA 25 (2020), NFPA 72 (2019)**. `Basis: Disclosed` — https://www.centralvalleyfire.com/adopted-codes-standards

> **CAUTION / CONFLICT.** The 2021 IFC was published in 2020, so an NFPA 10-2021 reference inside it is chronologically implausible; the district has more likely listed the editions **it** enforces rather than IFC Chapter 80's list verbatim. The NFPA 13-2019, NFPA 25-2020 and NFPA 72-2019 entries are consistent with a 2021 IFC. **I would underwrite on 2021 IFC → NFPA 25-2020 / NFPA 72-2019 / NFPA 13-2019, and treat the NFPA 10 edition as unverified.** For the 2024 IFC / NFPA 1-2024 / NFPA 101-2024 family, NFSA's list gives **NFPA 13-2022, NFPA 14-2024, NFPA 20-2022, NFPA 25-2023, NFPA 72-2022**.

### 4.5 The lag, quantified

| Standard | Current edition | Example adopted edition | Lag |
|---|---|---|---|
| NFPA 25 | 2026 | **2011** (Minnesota SFM guidance) | **15 years, 5 edition cycles** (Estimated — D2) |
| NFPA 25 | 2026 | **2020** (any 2021-IFC jurisdiction) | 6 years, 2 cycles (Estimated — D2) |
| NFPA 25 | 2026 | **2023** (Maryland, NFPA 1-2024, from 2025-06-23) | 3 years, 1 cycle (Estimated — D2) |
| NFPA 72 | 2025 | **2019** (2021-IFC jurisdiction) | 6 years, 2 cycles (Estimated — D2) |
| NFPA 72 | 2025 | **2016** (Seattle FD guidance) | 9 years, 3 cycles (Estimated — D2) |
| NFPA 72 | 2025 | **1999** (CMS/ASHE hospital baseline) | 26 years (Estimated — D2) |
| NFPA 96 | 2024 | **2017 or 2021** ("most AHJs") | 3–7 years (Disclosed + Estimated) |
| NFPA 10 | 2026 (Press-derived) | **2010** (MN DOH), **2021** (Central Valley FD) | up to 16 years (Estimated — D2) |
| IFC | 2024 | **2012** (Texas, Tennessee per ICC chart) | **12 years, 4 cycles** (Estimated — D2) |

**Underwriting consequence:** a diligence model that prices ITM scope off the current edition will over-state scope in Texas, Tennessee, Ohio, Michigan, Maine, New Mexico, Wisconsin and DC, and under-state the *rate of future scope expansion* in states on a fast adoption cadence (Florida triennial by rule; California triennial by statute; Maryland just moved to NFPA 1-2024).

---

## 5. Who is permitted to perform ITM

| Jurisdiction | Requirement | Citation | Basis |
|---|---|---|---|
| **New York City** | Supervision by a **Certificate of Fitness holder** is mandated for sprinkler, standpipe, foam, fire alarm, private hydrant and yard hydrant systems (exception for Group R-3 sprinkler supervision) | **FC 901.6.3** | Disclosed |
| **New York City** | Detailed **monthly** inspection reports for standpipe and sprinkler systems must be completed by the CoF holder and **posted near the main water supply control valve** | **FC 901.6.2.1** | Disclosed |
| **Utah** | "Automatic fire sprinkler systems, standpipes, and fire pumps shall be inspected annually by a person holding a **certificate of registration** as required in Section 3.1"; newly installed systems exempt from the annual test for one year from approval | **R710-5-7(4)(a)**, R710-5-7(6) | Disclosed |
| **Iowa** | **Contractor licence** + **technician licence** (technician works under a licensed contractor) + technician-trainee licence; endorsements for Automatic Sprinkler System Installation/Maintenance Inspection, Special Hazards Systems, Preengineered Dry Chemical/Wet Agent, Preengineered Water-Based (1–2 family). Contractor must name a **responsible managing employee (RME)** with a current qualifying certification | **Iowa Code ch. 100C and 100D; 481 IAC ch. 265 and 266** | Disclosed |
| **Washington** | **Fire Protection Sprinkler System Contractor Certificate** from the State Fire Marshal under **RCW 18.160 and WAC 212-80**, four levels (U, III, II, I); **Level U requires NICET ASSL Level III**; levels I–III may be earned by SFMO in-house exam. Separate L&I contractor registration under **RCW 18.27** | RCW 18.160; WAC 212-80; RCW 18.27 | Disclosed |
| **Minnesota** | Licensed contractor required for sprinkler heads, dry-pipe trip testing and most maintenance; facility staff may perform visual inspection of control valves, gauges and (with training) waterflow alarms | MN DOH guidance on NFPA 25(2011) | Disclosed |
| **Minnesota — alarm** | Facility staff limited to inspection and basic testing with documented training; "approved servicing contractor" required for complex and annual testing | MN DOH on NFPA 72(2010) §10.4.3 | Disclosed |
| **Seattle** | Testing must be by a "certified technician"; credential not further specified in the FD document | Seattle FD systems testing guidance (2016 NFPA 72) | Disclosed |
| **NFPA 25 (2026)** | Personnel must be "qualified…for the specific tasks performed," allowing the AHJ to define standards **by task type** rather than uniformly | Ch. 4 | Disclosed |
| **NFPA 96 (2024)** | Exhaust system inspection "by a properly trained, qualified, and **certified** person(s)"; extinguishing system maintenance likewise | §12.4, §12.2.1 | Disclosed |
| **South Carolina** | Sprinkler contractor licensure through the SC Contractor's Licensing Board | llr.sc.gov/clb/licensure_sprinkler.aspx | Disclosed (page identified, not parsed) |
| **Texas** | Fire sprinkler registration/licence administered by the **Texas Department of Insurance, State Fire Marshal's Office** | tdi.texas.gov — **NOT VERIFIED**, robots-blocked | — |

**Third-party vs. in-house:** no jurisdiction I examined bars in-house ITM outright. The pattern is a **split by task**: owner/facility staff may perform the monthly and semiannual *visual* work (NFPA 10 monthly, NFPA 72 semiannual visual, NFPA 25 weekly/monthly gauge and valve checks), while **annual functional testing, dry-pipe trip tests, sensitivity testing, fire pump flow tests and all suppression-system maintenance require a licensed/certified contractor**. That split is the reason the contracted annuity concentrates in the annual and semiannual visits rather than the monthly ones — which materially affects revenue-per-site modelling.

---

## 6. Reporting and enforcement mechanics — the ITM-to-repair pull-through

### 6.1 Third-party electronic inspection reporting

**The Compliance Engine (BRYCER LLC)** is the dominant third-party ITM reporting platform.

| Metric | Value | Basis | Source |
|---|---|---|---|
| AHJs on the platform | "trusted by over **1,420 Authorities Having Jurisdiction (AHJs)**" | Disclosed (vendor claim) | thecomplianceengine.com |
| Worked AHJ example — Burlington, VT | "actively tracking **686 systems**, with **89% in full compliance**" | Disclosed (vendor claim) | thecomplianceengine.com |
| False-alarm attribution | "**32% of false alarms** are caused by systems that are not compliant with inspection, testing, and maintenance requirements" | Disclosed (vendor claim) | thecomplianceengine.com |

**Named jurisdiction mandates:**

| Jurisdiction | Mandate | Effective | Mechanics | Basis |
|---|---|---|---|---|
| **San Diego, CA** | All service providers who inspect, install, test and repair fire protection systems in the city "are required to register and submit all inspection, installation, testing and maintenance (ITM) reports via The Compliance Engine"; **14 system types** covered (sprinkler, fire alarm, standpipe, fire pump, kitchen hood suppression, smoke control/removal, dry chemical, clean agent/CO₂, emergency standby power, and others) | **2020-04-15** | No registration fee; **service provider pays a filing fee per report submitted**; repair reports carry no submittal fee. **Reports with deficiencies must be resubmitted with corrective-action documentation within 14 days of the rejection date** | Disclosed |
| **Raleigh, NC** | "All compliant & non-compliant fire protection systems are required to be sent to The City of Raleigh electronically" | **2015-11-01**, **Ordinance No. 2015-492** | — | Disclosed |
| **Seattle, WA** | "System Testing Reports Must Be Submitted Online" via thecomplianceengine.com; central station must be notified to place the FAS in test mode | — | — | Disclosed |
| **Vancouver, WA** | ITM results submitted on an approved form via the Fire Department online system **within 30 days from the service date**; if deficiencies are repaired within 30 days the inspection and repair reports may be combined; otherwise repairs "documented and uploaded to the FMO contractor portal within 30 days of the completion of the repairs" | **Ordinance M-4485 § 27, 2024** | **VMC 16.04.166**, an explicit local addition to IFC 901.6 | Disclosed |
| **Charleston, SC** | Compliance reporting programme | — | — | Disclosed (page identified) |
| **North Liberty, IA** | Implemented The Compliance Engine | — | — | Press-derived (Patch) |

### 6.2 Records and retention

- **IFC §901.6.3** (records) and **IFC §110.3** — records must be "available to the fire code official." `Basis: Disclosed` — NFSA, 2025-11-06.
- **NFPA 25 §§4.3–4.3.5 (2020 edition)** — record requirements. NFSA guidance: retention is a **minimum of three years** on-site or at an approved location; "Three years is a minimum, not a cap"; keep each record one year past the next occurrence of that type, which makes **five-year cycle records effectively a ≈six-year retention**; initial records and operation manuals retained "for the life of the installation." Where the fire code and NFPA 25 differ on retention, **"the fire code controls."** `Basis: Disclosed`
- **NFPA 72 §14.6.2.4** — minimum three years on premises. `Basis: Disclosed`
- **2024 IFC change to §901.6.3** was editorial (ICC code change **F58-21**); **Table 901.6.1**'s title was updated editorially with no technical change. `Basis: Disclosed` — WA State Building Code Council, 2024 IFC Significant Changes Report, 2024-07-24.

### 6.3 Does a failed inspection compel a repair?

Yes, through three separate mechanisms, all named:

1. **The base code obligation.** **IFC/NYC FC 901.6**: systems "shall be maintained in good working order at all times" and, if not in working order, "repaired or replaced as necessary." That is an affirmative, continuing duty — not a duty to inspect.
2. **The reporting loop.** San Diego rejects a deficient report and requires **corrective-action documentation within 14 days**; Vancouver WA requires the repair report **within 30 days of repair completion**. The AHJ now holds a dated, machine-readable list of open deficiencies per address.
3. **Federal payment leverage in healthcare.** CMS ties Life Safety Code deficiencies to **denial of payment for new admissions at 3 months and termination from Medicare at 6 months** (see §7).

**Underwriting read:** third-party electronic reporting is the single strongest structural driver of ITM-to-repair conversion, because it removes the building owner's ability to sit on a deficiency privately. A target operating in TCE jurisdictions should show materially higher repair-attach than one operating in paper-report jurisdictions; this is a testable diligence question and should be asked as a **repair revenue ÷ inspection revenue ratio, split by TCE vs. non-TCE jurisdiction**.

---

## 7. Occupancy classes with elevated frequency

### 7.1 Healthcare — a separate and stricter overlay

| Requirement | Detail | Basis |
|---|---|---|
| **CMS adopted Life Safety Code** | **42 CFR 482.41(b)(1)(i)** requires compliance with **NFPA 101, Life Safety Code, 2012 edition** (issued 2011-08-11) with **TIA 12-1, 12-2, 12-3, 12-4**, and **NFPA 99, Health Care Facilities Code, 2012 edition** with **TIA 12-2 through 12-6** | Disclosed — eCFR |
| Federal Register | Fire safety requirements final rule published **2016-05-04** (81 FR); §482.41 most recently amended at **81 FR 42548 (2016-06-30)** | Disclosed |
| **Nursing home retroactive sprinkler mandate** | "All nursing homes must be fully sprinklered as of **August 13, 2013** in order to participate in Medicare or Medicaid." Codified at **42 CFR 483.70(a)(8)** (now 483.90); cited under **tag K056**. Five-year phase-in began with the final rule published **2008-08-13** | Disclosed — CMS S&C-13-55-LSC, 2013-08-16 |
| Enforcement ladder | Initial citation at scope/severity **D, E or F** minimum → **Denial of Payment for New Admissions (DPNA) required at 3 months** if substantial compliance not achieved → **termination from Medicare required at 6 months**. Civil Monetary Penalties where noncompliance is serious. "CMS does not have authority to allow extensions" | Disclosed — CMS S&C-13-55-LSC |

**Hospital frequency overlay** — ASHE/AHA schedule (2014), referencing **NFPA 25-1998 and 2011, NFPA 72-1999, NFPA 10-1998, NFPA 96-1998, NFPA 80-1999/2007, NFPA 90A-1999, NFPA 105-2007**:

| Component | Frequency |
|---|---|
| Supervisory signal devices | Quarterly |
| Valve tamper switches | Every 6 months |
| Water-flow devices | **Quarterly** (6 months with CMS waiver) |
| Duct, heat and smoke detectors; manual alarm boxes | Annually |
| Visual/audible alarms and speakers | Annually |
| Off-site fire responder notification | **Quarterly** |
| Fire pumps, no-flow test | **Weekly** (monthly with CMS waiver) |
| Water tank high/low level alarms | Every 6 months |
| Water tank temperature alarms | Monthly (cold weather) |
| Sprinkler main drain | Annually |
| Fire department connections | Quarterly |
| Standpipe water flow | Every 5 years |
| Kitchen auto-extinguishing systems | Every 6 months |
| CO₂ and gaseous extinguishing systems | Annually |
| Portable extinguishers — inspection / maintenance | Monthly / Annually |
| Standpipe hoses hydrostatic | 5 years after installation, then every 3 years |
| **Fire and smoke dampers** | **1 year after installation, then every 6 years** |
| Smoke-detection air-handling shutdown | Annually |
| Sliding/rolling fire doors | Annually |

`Basis: Disclosed` — https://www.ashe.org/sites/default/files/ashe/fire-safety-equipment-system-inspection_hospitals.pdf (2014)

**Note the two structural facts a buyer should price:** (a) hospitals sit on **1998/1999-vintage NFPA editions** by federal reference, which is *older* than most state adoptions, so healthcare ITM scope is not simply "state scope plus"; (b) **fire and smoke damper testing on a 6-year cycle** and **fire door annual inspection** are healthcare-heavy adjacent scopes that a fire-protection platform can attach.

**The Joint Commission standard EC.02.03.05** ("Maintaining Fire Safety Equipment and Fire Safety Building Features") is the accreditation-side overlay. **I could not retrieve the standard's element-of-performance list** — jointcommission.org returned HTTP 403. Flagged in §10.

### 7.2 High-rise

- **Chicago**: existing buildings exceeding **80 ft** — see §8.
- **New York City**: office buildings **100 ft or more** — see §8.
- **Maryland**: existing high-rise **residential** retrofit requirement **removed** in 2025 — see §8.

### 7.3 Assisted living, schools, data centres

- **Illinois** applies **NFPA 101 (2015)** as the state minimum fire safety standard, with occupancy-specific fact sheets for **day care facilities and residential board and care facilities**. `Basis: Disclosed` — sfm.illinois.gov.
- **Data centres**: the relevant elevated-frequency driver is the **clean agent** layer (NFPA 2001 semiannual container check, annual functional test, **enclosure integrity / door fan test to ASTM E2174** verifying a minimum **10-minute hold time** per §5.5.3.4). **I could not verify NFPA 75 (Standard for the Fire Protection of Information Technology Equipment) frequencies** — flagged in §10.
- **Schools**: I could not establish a named, cited elevated-frequency requirement distinct from base occupancy classification. Flagged in §10.

---

## 8. Retroactive sprinkler mandates — dated forcing functions

| Jurisdiction | Scope | Instrument | Dated deadlines | Basis |
|---|---|---|---|---|
| **New York City** | **Office buildings 100 ft or more in height**; also buildings converting to office use above 100 ft, at conversion | **Local Law 26 of 2004** (LL 26/04 §§ 1, 3, 23); Building Code §§ **26-248, 27-228.5, 27-929.1** | Owner's affidavit **2005-07-01** → 7-year report **2011-07-01** → 14-year report **2018-07-01** → **full sprinklering and certification of compliance by 2019-07-01** (15-year window). Hardship time extensions and partial waivers for interior Landmark designation or structural impracticability | Disclosed — NYC DOB LL26 summary |
| **Chicago** | "**every existing building exceeding 80 feet in height above grade** shall be protected throughout by an approved automatic sprinkler system" | **Municipal Code of Chicago 13-196-205**; companion life safety evaluation at **13-196-206** | Compliance plan to the fire commissioner by **2005-09-01**; **⅓ of gross square footage by 2009-01-01**; **⅔ by 2013-01-01**; **100% by 2017-01-01**. Exceptions: open-air parking, open-air stadium portions, **Class A-2 non-transient residential** buildings and their garages, certain mixed occupancies, **Chicago Landmarks**, contributing buildings in landmark districts, and buildings colour-coded red or orange in the **1996 Chicago Historic Resources Survey** — buildings using exceptions 3–7 must instead comply with the **13-196-206 life safety evaluation** | Disclosed |
| **Maryland** | Existing **high-rise residential** buildings | Amendments to the Maryland State Fire Prevention Code, on adoption of **NFPA 1/101 2024 editions** | "Recent amendments to the Maryland State Fire Prevention Code have **eliminated the requirement to retrofit existing high-rise residential buildings** with automatic fire sprinkler systems" — NFSA statement dated **2025-07-10**; Maryland's NFPA 1-2024 adoption dated **2025-06-23** | Disclosed |
| **Nursing homes, nationwide** | All Medicare/Medicaid-participating nursing homes | **42 CFR 483.70(a)(8)** (now 483.90) | **Fully sprinklered as of 2013-08-13** | Disclosed |

**Underwriting read:** the NYC and Chicago programmes are **expired** as installation demand — their commercial residue is the resulting **ITM base** (a 2005–2019 retrofit wave now entering 20-year fast-response sample-test territory and 25-year gauge/valve replacement territory). Maryland's 2025 reversal is the live signal that retroactive mandates are **politically reversible**, and a thesis that underwrites future retrofit volume from pending state mandates should be discounted accordingly.

---

## 9. Derivations

**D1 — NFPA revision cycle (3 years).**
NFPA 25 editions observed in cited sources: 2011, 2014 (implied by cycle), 2017, 2020, 2023, 2026. Successive observed pairs: 2020→2023 = 3; 2023→2026 = 3. NFPA 72 observed: 2010, 2013, 2016, 2019, 2022, 2025 → uniform 3-year steps. NFPA 96 observed: 2017, 2021, 2024 → 4 then 3 (NFPA 96 slipped a cycle). **Conclusion: 3-year cycle is the norm; NFPA 96 has run on a 3–4 year cadence.** `Basis: Estimated`

**D2 — Adoption lag in years and cycles.**
Lag(years) = (current edition year) − (adopted edition year). Lag(cycles) = Lag(years) ÷ 3, rounded to the nearest whole cycle.
- NFPA 25: 2026 − 2011 = **15 years**; 15 ÷ 3 = **5 cycles**.
- NFPA 25: 2026 − 2020 = **6 years**; 6 ÷ 3 = **2 cycles**.
- NFPA 25: 2026 − 2023 = **3 years**; 3 ÷ 3 = **1 cycle**.
- NFPA 72: 2025 − 2019 = **6 years** = **2 cycles**; 2025 − 2016 = **9 years** = **3 cycles**; 2025 − 1999 = **26 years**.
- NFPA 10: 2026 − 2010 = **16 years**.
- IFC: 2024 − 2012 = **12 years**; 12 ÷ 3 = **4 cycles**.
`Basis: Estimated` — arithmetic only; the input edition years are Disclosed and sourced in §4.

**D3 — Minimum contractor-performed site events per year, single-tenant commercial building.**
Assumed configuration: one wet-pipe sprinkler system on a riser with a backflow preventer, one monitored fire alarm system, portable extinguishers, one commercial kitchen with a wet-chemical hood suppression system, moderate cooking volume.
- Sprinkler: quarterly inspection/test = 4 visits per year, of which one is the annual (main drain, antifreeze, floor-level sprinkler and pipe inspection). **4**
- Fire alarm: semiannual inspection (2) — of which one visit carries the annual functional test. **2**
- Extinguishers: annual maintenance. **1** (monthly inspection is owner-performed under NFPA 10 §7.2.1)
- Kitchen hood suppression: semiannual service per NFPA 96 §12.2.1/§11.2.1. **2**
- Hood/duct inspection at moderate volume: semiannual. **2**
Total = 4 + 2 + 1 + 2 + 2 = **11 contractor-performed scheduled site events per year**, before any 3-year (dry-pipe full trip), 5-year (internal pipe, gauges, standpipe) or 6-year (extinguisher internal) event, and before any deficiency-driven repair visit.
`Basis: Estimated` — frequencies are Disclosed per §1–§3; the building configuration is my assumption and should be replaced with the target's actual site mix.

**D4 — Five-year-cycle record retention.**
NFSA guidance: keep each record one year past the next occurrence of that type. For a 5-year interval item, retention = 5 + 1 = **≈6 years**. `Basis: Estimated`, from a Disclosed rule.

---

## 10. What I could not verify

1. **IFC Chapter 80 referenced-standard editions, verbatim, for the 2015/2018/2021/2024 IFC.** ICC Digital Codes gates Chapter 80 behind a Premium subscription (pages returned only platform metadata) and UpCodes blocks automated retrieval by robots.txt. I therefore **cannot state with primary-source confidence which NFPA 25/72/10/96 edition each IFC edition freezes.** The only direct evidence I obtained is a Montana fire district's published list against the 2021 IFC (NFPA 25-2020, NFPA 72-2019, NFPA 13-2019, and an implausible NFPA 10-2021), plus NFSA's list for the 2024 family. **This is the highest-value remaining gap and should be closed with a purchased ICC Premium seat or a print copy before any market sizing is finalised.**
2. **IFC Table 901.6.1 in full.** I obtained the NYC Fire Code's version in summary (NFPA 10 / 25 / 72 / 12 mapped to system types) and confirmed the 2024 IFC change to the table was editorial only, but I do not have the complete row list with standard titles for any IFC edition. Kitsap County's published "Referenced Standards for System Maintenance" PDF did not contain the table.
3. **Joint Commission EC.02.03.05 elements of performance and frequencies.** jointcommission.org returned HTTP 403 to automated retrieval. The healthcare overlay in §7.1 therefore rests on the CMS regulation (verified) and the ASHE schedule (verified, but dated 2014).
4. **Texas licensing.** tdi.texas.gov blocked automated retrieval. I could not confirm the Texas Insurance Code chapters, the RME licence classes, or which NFPA editions the Texas State Fire Marshal adopts for sprinkler, alarm and extinguisher ITM. Texas is on the **2012 IFC** per the ICC chart, which makes it a large and unusually laggy market — this gap matters.
5. **NFPA 10 current edition, from NFPA directly.** Multiple 2026 trade sources reference "NFPA 10 (2026)" and an electronic-monitoring alternative to the monthly inspection, but I could not load the NFPA product page's edition list. Labelled Press-derived throughout.
6. **NFPA 25 and NFPA 72 free-access text.** link.nfpa.org and NFPA LiNK are JavaScript applications that returned no content. All NFPA 25/72 section numbers in this document come from government or trade reproductions, each attributed to a stated edition; **section numbers should be re-checked against the actual adopted edition before being quoted to a seller or lender.**
7. **NFPA 96 section numbering across editions.** Three sources give three different locations for the cooking-volume schedule (Table 11.4 / Table 12.4 / §12.6.1). Reported as a conflict rather than resolved.
8. **NFPA 75** (data centre / IT equipment fire protection) frequencies — not researched to a citable standard.
9. **School occupancy elevated frequencies** — no named, cited requirement distinct from base occupancy classification found.
10. **Honolulu Ordinance 18-14** (residential high-rise fire safety evaluation / sprinkler programme) — identified in search results with a phcppros article dated 2018-06-26, but I did not retrieve the ordinance's scope or compliance deadlines. Left out rather than guessed.
11. **New Jersey, Pennsylvania, Georgia, Virginia, Tennessee, Colorado state adoption instruments** — I have ICC-chart edition years for these but did not retrieve the administrative code citations or effective dates. The §4.3 table is therefore a partial primary-source picture (≈15 jurisdictions), not a 50-state one.
12. **North Carolina's adoption of NFPA 25-2023** — NFSA's headline claims it; the article body contains no North Carolina date or instrument. Reported as unresolved.
13. **The Compliance Engine figures** are vendor-published claims on BRYCER's own site and are **not independently verified**. No third-party count of TCE jurisdictions, reports processed, or deficiency-to-repair conversion was obtainable. A 2026-04-03 BRYCER press release exists but the host blocked retrieval.
14. **Home-rule municipal independence** — I verified the mechanism by example (Central Valley Fire District MT adopting the 2021 IFC by board resolution on a different clock from the state; Vancouver WA amending IFC 901.6 by ordinance; Chicago and NYC operating wholly independent codes) but did not compile a list of home-rule states.

---

## Sources

Every URL below was retrieved on **2026-07-29**. Publication dates are given where the source stated one.

**Standards — editions and change analysis**
- NFPA 25 product page — https://www.nfpa.org/product/nfpa-25-standard-for-the-inspection-testing-and-maintenance-of-water-based-fire-protection-systems/p0025code (no date shown)
- NFPA, Tentative Interim Amendment NFPA 25 (TIA 25-26-1) — https://docinfofiles.nfpa.org/files/AboutTheCodes/25/TIA_25_26_1.pdf (no date parsed)
- QRFS, "NFPA 25 2026 Edition: Key Updates & Additions" — https://blog.qrfs.com/497-nfpa-25-2026-edition-key-updates-additions/ (2026-06-23)
- NFPA 72 product page — https://www.nfpa.org/product/nfpa-72-national-fire-alarm-and-signaling-code/p0072code (no date shown)
- ICC Store, NFPA 72 2025 Edition — https://shop.iccsafe.org/nfpa-72-national-fire-alarm-and-signaling-code-2025-edition.html (no date shown)
- NFPA 96 product page — https://www.nfpa.org/product/nfpa-96-standard/p0096code (no date shown)
- US Made Supply, NFPA 96 guide — https://usmadesupply.com/resources/building-codes-standards/fire-suppression-standards/nfpa-96 (2026 guide; no explicit date)
- FireProtectionFinder, "NFPA 10 (2026) Lets You Replace Monthly Fire Extinguisher Inspections With Electronic Monitoring" — https://fireprotectionfinder.com/news/nfpa-10-2026-electronic-monitoring-fire-extinguishers (no date shown)

**NFPA 25 frequencies**
- NFSA, "Choosing the Sample for NFPA 25 Fire Sprinkler Testing" — https://nfsa.org/2023/08/17/nfpa-25-fire-sprinkler-testing/ (2023-08-17)
- Ironsmith Fire, "NFPA 25 Inspection Schedule" — https://ironsmithfire.com/nfpa-25-inspection-schedule/ (2026-06-12)
- UpToCode, "NFPA 25 Sprinkler Inspection Requirements" — https://www.uptocode.build/resources/nfpa-25 (no date shown)
- Getz Fire Equipment, "Service Requirements" matrix — https://getzfire.com/wp-content/uploads/2020/09/Service-Requirements.pdf (posted 2020-09)
- PS Integrated, "5 Year Fire Sprinkler Inspection" — https://www.psintegrated.com/blog/5-year-fire-sprinkler-inspection (2021-08-31)
- Minnesota Department of Health, "Maintenance and Testing of Fire Sprinkler Systems" — https://www.health.state.mn.us/facilities/regulation/engineering/docs/lscfiresprinklers.pdf (July 2016, rev. October 2016)
- Minnesota State Fire Marshal, "Sprinkler inspection testing and maintenance" — https://dps.mn.gov/divisions/sfm/fire-code/fire-code-information-topic/sprinkler-inspection-testing-and-maintenance (no date shown)
- Utah Admin. Code R710-5-7 — https://regulations.justia.com/states/utah/public-safety/title-r710/rule-r710-5/section-r710-5-7/ (no date shown)

**NFPA 72 frequencies and monitoring**
- Minnesota Department of Health, "Inspection and Testing of Fire Alarm Systems" — https://www.health.state.mn.us/facilities/regulation/engineering/docs/lscfatesting.pdf (June 2016)
- UpToCode, "NFPA 72 Fire Alarm Inspection Requirements" — https://www.uptocode.build/resources/nfpa-72 (no date shown)
- Seattle Fire Department, "Systems Testing — Fire Alarm" — https://seattle.gov/Documents/Departments/Fire/Business/SystemsTestingFireAlarm.pdf (no date shown; cites 2016 NFPA 72)
- NFSA, "Fire Sprinkler Monitoring & Supervision: NFPA 13 and NFPA 72" — https://nfsa.org/2023/02/03/fire-sprinkler-monitoring-supervision/ (2023-02-03)

**NFPA 10**
- Minnesota Department of Health, "Maintenance and Testing of Portable Fire Extinguishers" — https://www.health.state.mn.us/facilities/regulation/engineering/docs/lscfireext.pdf (June 2016, rev. November 2016)

**NFPA 96 and kitchen**
- Facilitec Southwest, "NFPA 96 for Commercial Kitchens — Section-by-Section Guide" — https://facilitec-sw.com/compliance/nfpa-96-codes/ (2026 guide; no explicit date)
- Minnesota Department of Health, "Protection of Kitchen Cooking Equipment" — https://www.health.state.mn.us/facilities/regulation/engineering/docs/lsckitcheneqp.pdf (July 2016)
- City of Charleston SC, "Inspection & Cleaning Frequency of Commercial Kitchen Hoods" — https://www.charleston-sc.gov/1456/Inspection-Frequency (no date shown; cites 2015 IFC)

**Special hazard**
- UpToCode, "NFPA 2001: Clean Agent Fire Suppression Systems Guide" — https://www.uptocode.build/resources/nfpa-2001 (no date shown; cites 2022 edition)
- Getz Fire Equipment service matrix (as above)

**Model code adoption**
- ICC, Master I-Code Adoption Chart — https://www.iccsafe.org/wp-content/uploads/Master-I-Code-Adoption-Chart-1.pdf (January 2024)
- PlainFireData, "Fire Code Adoption by State" — https://plainfiredata.com/fire-codes (no date shown)
- FireCodes AI, "Adopted Fire Codes by State" — https://www.firecodes.ai/product/supported-codes (no date shown)
- Florida Admin. Code 69A-60.003 — https://flrules.org/gateway/ruleno.asp?id=69A-60.003 (effective 2023-12-31)
- Florida Admin. Code 69A-60.004 — https://flrules.org/gateway/ruleno.asp?id=69A-60.004
- Florida State Fire Marshal, Florida Fire Prevention Code — https://www.myfloridacfo.com/division/sfm/bfp/florida-fire-prevention-code (9th edition rule hearing 2026-07-14)
- NFSA, "Maryland and North Carolina Adopt 2023 Edition of NFPA 25" — https://nfsa.org/2025/07/02/maryland-and-north-carolina-adopt-2023-edition-of-nfpa-25/ (2025-07-02)
- Mass.gov, 527 CMR 1.00 Massachusetts Comprehensive Fire Safety Code — https://www.mass.gov/regulations/527-CMR-100-massachusetts-comprehensive-fire-safety-code (effective 2022-12-09; update 2023-05-12)
- Illinois Office of the State Fire Marshal, Life Safety Code — https://sfm.illinois.gov/resources/life-safety-code.html (NFPA 101-2015 effective 2020-01-01)
- California DGS Building Standards Commission, Codes — https://www.dgs.ca.gov/BSC/Codes (2025 Title 24 published 2025-07-01, effective 2026-01-01)
- Ohio Administrative Code Rule 1301:7-7-09 — https://codes.ohio.gov/ohio-administrative-code/rule-1301:7-7-09 (rule effective 2025-11-20)
- Central Valley Fire District (MT), Adopted Codes & Standards — https://www.centralvalleyfire.com/adopted-codes-standards (Resolution 222307, effective 2023-04-12)
- Washington State Building Code Council, 2024 IFC Significant Changes Report — https://sbcc.wa.gov/sites/default/files/2024-07/IFC_SignificantChangesReportMaster_07242024.pdf (2024-07-24)

**ITM authority, reporting, records**
- FDNY, NYC Fire Code Chapter 9 — https://www.nyc.gov/assets/fdny/downloads/pdf/about/Chapter-09.pdf (no date shown)
- NFSA, "The Paper Trail: Documentation and Owner Retention from Codes to NFPA 25" — https://nfsa.org/2025/11/06/a-guide-to-documentation-and-owner-retention/ (2025-11-06)
- BRYCER, The Compliance Engine — https://www.thecomplianceengine.com/ (no date shown)
- City of San Diego, The Compliance Engine — https://www.sandiego.gov/fire/community-risk-reduction/fire-protection-systems/compliance-engine (effective 2020-04-15)
- City of Raleigh, "Inspections: The Compliance Engine" — https://raleighnc.gov/fire/services/inspections-compliance-engine (Ordinance 2015-492, effective 2015-11-01)
- Vancouver (WA) Municipal Code 16.04.166 — https://vancouver.municipal.codes/VMC/16.04.166 (Ordinance M-4485 § 27, 2024)
- Iowa Department of Inspections, Appeals & Licensing, Fire Protection System Licensing — https://dial.iowa.gov/licenses/alarms-fire/fire-protection-system-licensing (no date shown)
- Washington fire sprinkler contractor licence requirements (RCW 18.160 / WAC 212-80) — https://contractorlicenserequirements.com/washington/fire-sprinkler-license-requirements/ (2026 guide)
- Kitsap County DCD, "International Fire Code (IFC) Standards for Inspection, Testing and Maintenance" — https://www.kitsap.gov/dcd/Documents/Referenced%20Standards%20for%20System%20Maintenance.pdf (no date shown)

**Healthcare overlay**
- eCFR, 42 CFR 482.41 — https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-482/subpart-C/section-482.41 (amended 81 FR 42548, 2016-06-30)
- Federal Register, "Medicare and Medicaid Programs; Fire Safety Requirements for Certain Health Care Facilities" — https://www.federalregister.gov/documents/2016/05/04/2016-10043/medicare-and-medicaid-programs-fire-safety-requirements-for-certain-health-care-facilities (2016-05-04)
- CMS, Survey & Certification Letter S&C-13-55-LSC — https://www.cms.gov/Medicare/Provider-Enrollment-and-Certification/SurveyCertificationGenInfo/Downloads/Survey-and-Cert-Letter-13-55.pdf (2013-08-16)
- ASHE/AHA, "Fire Safety Equipment and Fire Safety Building System Inspection — Hospitals" — https://www.ashe.org/sites/default/files/ashe/fire-safety-equipment-system-inspection_hospitals.pdf (2014)

**Retroactive sprinkler mandates**
- NYC DOB, "Local Law 26 of 2004 — Summary of provisions" — https://www.nyc.gov/html/dob/downloads/bldgs_code/ll26-04_summary.pdf (no date shown)
- American Legal Publishing, Municipal Code of Chicago 13-196-205 — https://codelibrary.amlegal.com/codes/chicago/c7209359-81de-4059-a679f6a211f04dea/chicagobuilding_il/0-0-0-361622 (no date shown)
- American Legal Publishing, Municipal Code of Chicago 13-196-206 — https://codelibrary.amlegal.com/codes/chicago/c7209359-81de-4059-a679f6a211f04dea/chicagobuilding_il/0-0-0-361642 (no date shown)
- GlobeNewswire / NFSA, "National Fire Sprinkler Association Responds to Removal of High-Rise Fire Sprinkler Retrofits in Maryland" — https://www.globenewswire.com/news-release/2025/07/10/3113603/0/en/National-Fire-Sprinkler-Association-Responds-to-Removal-of-High-Rise-Fire-Sprinkler-Retrofits-in-Maryland.html (2025-07-10)
