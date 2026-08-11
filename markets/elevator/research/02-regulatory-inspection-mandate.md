<!-- run: 02 | hunt: B | date: 2026-08-11
     query: "ASME A17.1 CSA B44 Safety Code for Elevators and Escalators current edition 2025"; "ASME A17.1 Section 8.6 Maintenance Control Program requirement periodic test Category 1 Category 5"; "A17.1 8.11 periodic inspections witnessing of tests 8.10 acceptance inspection section"; "8.6.1.2.2 maintenance control program ASME A17.1"; "maintenance control program A17.1 first introduced 2007 edition requirement history elevator"; "NEII elevator code adoption map state by state A17.1 edition adopted table"; "NYC DOB elevator periodic inspection Category 1 test third party inspection agency independent of maintenance company"; "ASME QEI-1 qualified elevator inspector certification accreditation NAESA number of certified inspectors"; "ASME A17.3 Safety Code for Existing Elevators and Escalators current edition which states adopted"; "ASME A17.2 Guide for Inspection of Elevators Escalators and Moving Walks current edition purpose"; "8.6.4.19 OR 8.6.4.20 A17.1 periodic test electric elevator category 1 category 5 interval"; "Table N1 A17.1 inspection and test intervals nonmandatory appendix N months"; "elevator inspector shall not be employed by / no financial interest maintenance company state regulation third party inspection conflict of interest"; "state elevator mechanic license elevator contractor license which states require list 2025"; "NYC Local Law 126 of 2021 elevator inspection requirements Administrative Code 28-304 1 RCNY 103-02"; "NYC elevator door lock monitoring retrofit deadline January 2027"; "Maryland third party qualified elevator inspector TPQEI law HB1107 2018"; "states with no elevator safety law no state elevator inspection requirement"; "Washington state elevator program annual inspection RCW 70.87"; "Chicago elevator annual inspection ordinance certificate of inspection private inspection agency"; "qualified elevator inspector shortage number of QEI certified inspectors nationwide aging workforce"; "BLS elevator and escalator installers and repairers number employed 2025"
     tool: web search + fetch -->

# Run 02 / Hunt B — The Regulatory Layer: Is Elevator Maintenance Code-Compelled or Customer-Chosen?

**Purpose of this pass.** To establish, on the authority of the instruments themselves, whether the recurring revenue in an elevator service route is legally compulsory or commercially discretionary — and, separately, whether third-party inspection is a standalone business or a captive line of the maintenance contract.

**Basis labels used throughout:** `Disclosed` = the regulator's or standards body's own instrument (statute, administrative rule, official form/notice, or the standards developer's own publication page). `Reproduced` = a regulator's document quoting or citing the model code text, where I could not reach the paywalled code itself. `Press-derived` = trade press or industry association. `Estimated` = my inference, labelled as such.

**A structural caveat that governs this entire file.** ASME A17.1/CSA B44 is a copyrighted, paywalled standard. UpCodes, which hosts the section text, is blocked by robots.txt to my fetcher, and direct HTTP retrieval is blocked by egress policy in this environment. I therefore **could not read the primary code text verbatim.** Everything below about A17.1's internal structure is `Reproduced` — established by triangulating state and municipal regulators who cite specific section numbers and reproduce specific intervals in their own binding instruments. Where I have only one regulator's citation for a section number, I say so. **No section number in this file was written from memory.** Section numbers I could not corroborate are listed in "What we don't know yet" rather than asserted here.

---

## 0. Bottom line

**Maintenance is code-compelled, not customer-chosen — but the compulsion runs through the building owner, not the service provider, and it became compulsory relatively recently.**

The mechanism is the **Maintenance Control Program (MCP)** in ASME A17.1 Section 8.6.1.2. Before the MCP requirement, the code told you the equipment had to be *safe*; maintenance was the owner's chosen means to that end. With the MCP, the code requires a *documented, written program of scheduled maintenance tasks, procedures, examinations and tests*, kept on site, with records retained. An owner cannot lawfully operate a conveyance without one. That converts maintenance from a discretionary operating expense into a compliance obligation — and because almost no owner can author or execute an MCP in-house, it converts into a compulsory purchase from a licensed contractor.

**The inspection annuity is separately compelled and is the harder legal floor:** annual periodic inspection plus an annual Category 1 test, a Category 3 test at 36 months (water hydraulic), and a Category 5 test at 60 months. These intervals are stated in binding state and city instruments in their own words, not merely in the model code.

**Third-party independence is the contested question, and the answer is genuinely state-by-state.** There is no national rule. I found four distinct regimes, and the OEM trade association is on record *opposing* mandatory independence. Detail in §B.4.

---

## A. The model codes

### A.1 ASME A17.1/CSA B44 — current edition and lineage

**Current edition: ASME A17.1-2025/CSA B44:25.** `Disclosed`

CSA Group's product page carries the standard's own Preface:

> "This is the seventh edition of ASME A17.1/CSA B44, *Safety Code for Elevators and Escalators*. It supersedes the previous editions of ASME A17.1/CSA B44, published in 2022, 2019, 2016, 2013, 2010, and 2007."
> — https://www.csagroup.org/store/product/2432469/

ASME's own page describes the code's scope as establishing "safety requirements for the design, installation, operation, maintenance, alteration, and repair of elevators/escalators" and as "the accepted guide throughout North America for the design, construction, installation, operation, inspection, testing, maintenance, alteration, and repair of elevators, escalators and related conveyances." — https://www.asme.org/codes-standards/find-codes-standards/safety-code-for-elevators-and-escalators

**CONFLICTING EDITION COUNTS — both retained per the rules of this pass:**

| Source | Claim |
|---|---|
| CSA Group product page (quoting the standard's own Preface) | **"seventh edition of ASME A17.1/CSA B44"** — https://www.csagroup.org/store/product/2432469/ |
| ANSI Blog, "ASME A17.1-2025: Safety Code for Elevators and Escalators [New]" | **"the twenty-fourth edition of the code"** — https://blog.ansi.org/ansi/asme-a17-1-2025-safety-code-elevator-csa-b44/ |

These are probably not in genuine conflict — "seventh" almost certainly counts the harmonized ASME/CSA joint editions beginning 2007, and "twenty-fourth" almost certainly counts the full A17.1 lineage back to its 1920s origin. **I did not verify that reconciliation and am not asserting it.** Both figures are recorded as published.

**Revision cycle.** The Preface sequence — 2007, 2010, 2013, 2016, 2019, 2022, 2025 — is a clean **three-year cycle**. `Estimated` (derived by me from the Preface list; I found no publisher statement declaring a three-year cycle). The ANSI Blog explicitly declines to state a cycle, saying only that "over the years, numerous revisions have kept it current."

One unresolved flag: my fetch of the ASME A17.1 product page returned the phrase "placed on stabilized maintenance," which would be inconsistent with an active three-year cycle. ASME product pages list multiple standards, and I could not confirm the phrase attaches to A17.1 rather than to a neighbouring standard on the same page. **Recorded as unresolved, see §What we don't know yet.**

**Why the edition matters commercially.** Adoption is state-by-state and lags badly (§B). A service route's technical and capex obligations are set by *the edition the state has adopted*, not the current edition — and in at least one state that edition is a quarter-century old (Pennsylvania, §B.2).

### A.2 What A17.1 actually mandates on inspection and testing

**Section 8.6 is titled "Maintenance, Repair, Replacement, and Testing."** `Reproduced` — section title per UpCodes' page title for the section (https://up.codes/s/maintenance-repair-replacement-and-testing), corroborated by the fact that multiple state regulators cite 8.6.x for both maintenance and periodic test requirements (below).

**Section 8.10 covers acceptance inspections and tests; Section 8.11 covers periodic inspections and witnessing of tests.** `Reproduced` — NAESA International's *Inspector Applicant Handbook* states the QEI experience gate as "performing inspections and witnessing tests as specified in ASME A17.1 Sections 8.10/8.11" (https://naesai.org/storage/editable-pdfs/qei-application.pdf), and Maryland's elevator program page references "A17.1 section 8.11" and "A17.1 section 8.6" (https://labor.maryland.gov/labor/safety/elev.shtml).

**The interval schedule lives in Nonmandatory Appendix N, Table N1.** `Disclosed` (as to the adoption mechanism). Washington's binding rule is the cleanest evidence, because it adopts the appendix by name:

> "Pursuant to requirements ASME A17.1/CSA B44, 8.6.1.7 and 8.11.1.3, the department adopts ASME A17.1/CSA B44, Appendix N for the frequency of periodic tests."
> — WAC 296-96-00675, https://app.leg.wa.gov/WAC/default.aspx?cite=296-96-00675

New Jersey adopts the same table under a slightly different name — "Appendix N-1 of the most recent edition of ASME A17.1 referenced in the building subcode" — NJAC 5:23-12.3, https://regulations.justia.com/states/new-jersey/title-5/chapter-23/subchapter-12/section-5-23-12-3/

New York City modifies it: DOB's service notice refers to "Table N1 of ASME A17.1, as modified by Chapter K1 of Appendix K of the New York City Building Code." — https://www.nyc.gov/assets/buildings/pdf/periodic_elevator_inspections_sn.pdf

**A note on Table N1 itself.** I located a reproduction of Table N1 ("REQUIRED INSPECTION AND TEST INTERVALS IN 'MONTHS'", pp. 2253–2254, https://prisenyc.com/wp-content/uploads/2022/01/Elevator-Code-Table.pdf) hosted by a private NYC inspection firm. **I am not using its cell values.** My extraction of it returned "Category 1 test: not required" for electric elevators, which is flatly contradicted by four independent binding instruments below. Either the extraction misread the table or the table is a NYC-modified variant. Either way it fails the standard of this pass. The intervals in §A.3 are taken instead from jurisdictions that state them in their own regulatory text.

### A.3 The test categories and their intervals

This is the annuity's legal basis. The intervals below are stated **in the jurisdictions' own binding words**, which is stronger evidence than a reproduction of the model code.

| Test | Interval | Instruments stating it |
|---|---|---|
| **Periodic inspection** (visual/functional, no load) | **12 months** | CA, NYC, TX, DC, WA, IL, HI (see rows below) |
| **Category 1** (annual, generally no-load safety test) | **12 months** | See below |
| **Category 3** (water hydraulic elevators) | **36 months** | See below |
| **Category 5** (full-load, full-speed safety test) | **60 months** | See below |

**Category 1 — 12 months.** `Disclosed`
- California: "Category One Tests shall be completed once every 12 months" — 8 CCR §3141.6, https://dir.ca.gov/title8/3141_6.html
- New York City: Category 1 tests "performed between January 1st and December 31st of each year at a minimal time interval of six months" — NYC Admin. Code **§28-304.6.1**, https://www.nyc.gov/assets/buildings/codes-pdf/cons_codes_2014/2014CC_AC_Chapter3_Maintenance_of_Buildings.pdf
- Texas: "The owner of the elevator or related equipment must obtain an inspection every 12 months and submit the inspection report." — TDLR Elevator Safety FAQ, https://www.tdlr.texas.gov/elevator/elefaq.htm
- Washington, DC: "Category 1 Inspection: every 12 months" — DC DOB, https://dob.dc.gov/node/1616596
- Washington State: "The department shall cause all conveyances to be inspected and tested at least once each year." — RCW 70.87.120, https://app.leg.wa.gov/rcw/default.aspx?cite=70.87.120
- Illinois: "The Elevator Safety and Regulation Act and our Rules require annual inspections of conveyances." — Illinois OSFM, https://sfm.illinois.gov/about/divisions/elevators/elevator-faqs.html
- NYC DOB describes CAT1 as "An annual no load safety test performed between January 1 and December 31." — https://www.nyc.gov/site/buildings/safety/elevator-compliance.page

**Category 3 — 36 months, water hydraulic elevators.** `Disclosed`
- California: "Category Three Tests shall be completed once every 36 months" — 8 CCR §3141.6
- New York City: Category 3 tests "performed every three years on or before the anniversary month of the last Category 3 testing" — NYC Admin. Code §28-304.6.1; and per 1 RCNY §103-02, "within three (3) years from the month of issuance of a certificate of compliance," https://www.nyc.gov/assets/buildings/rules/1_RCNY_103-02.pdf
- Hawaii: Exhibit C, "Inspection and Test Intervals (In Months)" — Category 3 = 36 for hydraulic elevators, escalators/moving walks, dumbwaiters, material lifts, inclined, screw-column, rooftop, LU/LA and construction cars — https://regulations.justia.com/states/hawaii/title-12/subtitle-8/part-11/chapter-229/exhibit-c/
- NYC DOB identifies the equipment class: "Category 3 testing of water hydraulic elevators" — https://www.nyc.gov/assets/buildings/pdf/in_new_elv_cat_testing_reqs.pdf

**Category 5 — 60 months, full-load.** `Disclosed`
- California: "Category Five Tests shall be completed once every 60 months" — 8 CCR §3141.6
- New York City: Category 5 "performed every five years on or before the month of the final acceptance test" — NYC Admin. Code §28-304.6.1
- Washington, DC: "Category 5 Inspection: every 60 months" — https://dob.dc.gov/node/1616596
- Ohio: "At least one test every five years shall be a full-load safety test" under "ASME A 17.1-2016, section 8.6.4.20" — OAC 1301:3-6-04, https://regulations.justia.com/states/ohio/title-1301-3/chapter-1301-3-6/section-1301-3-6-04/
- Hawaii: Exhibit C — Category 5 = 60 months

**Section numbers for the periodic tests.** `Reproduced`, two independent regulators:
- **8.6.4.19 — traction (electric) elevator Category 1 test requirements; 8.6.4.20 — traction Category 5 test requirements.** Tennessee Dept. of Labor & Workforce Development, *Elevator Code Changes – Updates* (effective 7/18/2021) cites "A17.1 2016 8.6.4.19: Traction Category 1 Test requirements" and "A17.1 2016 8.6.4.20: Traction Category 5 Test requirements" — https://www.tn.gov/content/dam/tn/workforce/documents/employers/Elevator_Code_Changes-Update.pdf. Ohio independently cites 8.6.4.20 for the five-year full-load test (above).
- **8.6.5.14 and 8.6.4.20.2 — hydraulic and roped-hydraulic periodic tests.** TSASK (Saskatchewan technical safety authority), *Elevator Periodic Category Tests and Inspection Frequency*, May 2024, cites "ASME A17.1/CSA B44 Rules 8.6.5.14, 8.6.4.19.2, 8.6.4.19.3, 8.6.4.20.2" — https://api.tsask.ca/wp-content/uploads/2025/02/Periodic_Category_Tests_and_Inspection_Frequency.pdf. **Canadian regulator; recorded because the code is jointly harmonized, but flagged as non-US.**
- **8.6.1.7.2 — periodic test result recording / test tag.** Tennessee: "A17.1 2010 8.6.1.7.2 requires a metal test tag with all applicable code requirements, date performed and the name of the person or firm performing the test." Corroborated by WA L&I form F621-123-000 (below), which maps "periodic test results" to 8.6.1.7.2.
- **8.6.8.15 — escalators/moving walks.** Single low-confidence source only (the prisenyc Table N1 reproduction). **Not asserted; see gaps.**

**A material non-uniformity worth pricing.** New Jersey requires escalator periodic inspection **every six months**, not annually: "Escalators: at intervals of not more than six months" — NJAC 5:23-12.3. Hawaii separately requires escalator/moving-walk **internal inspection every 36 months** — HAR §12-229-7.1, https://www.law.cornell.edu/regulations/hawaii/Haw-Code-R-SS-12-229-7-1. Escalator-heavy portfolios (transit, retail, airports) therefore carry a materially higher mandated inspection load in some states.

### A.4 Is *maintenance itself* code-mandated? The MCP requirement

**Yes — and this is the single most important finding in this pass.**

**What it is.** Colorado's Division of Oil and Public Safety states the definition from the code:

> "a documented set of maintenance tasks, maintenance procedures, examinations, and tests to ensure that equipment is maintained in compliance with the requirements of ASME A17.1 Section 8.6."
> — Colorado DOPS, *Conveyance Maintenance Control Program Guidance* (effective 3/27/15; revised 4/1/2017), citing ASME A17.1-2013 and Colorado Conveyance Regulations 7 CCR 1101-8 §2-3-3, and referencing A17.1 §§8.6.1.1–8.6.1.4 — https://ops.colorado.gov/sites/ops/files/2019-12/mcpguidance0417.pdf `Disclosed`

**The mandatory language.** The Illinois Office of the State Fire Marshal circulates an excerpt of A17.1-2007/CSA B44-07 §8.6.1.2 (General Maintenance Requirements) reading:

> "A written Maintenance Control Program shall [be] in place"

and requiring scheduled examinations, maintenance and tests based on equipment age, condition, usage, environment and manufacturer guidance; "cleaning, lubricating, and adjusting applicable components at regular intervals and repairing or replacing all worn or defective components"; maintenance records documenting all activities; accessibility to elevator personnel; and procedures for SIL-rated electrical protective devices.
— https://sfm.illinois.gov/content/dam/soi/en/web/sfm/sfmdocuments/documents/maintenancecontrolprogram.pdf `Reproduced`

**When it entered the code — 2000 edition.** `Press-derived`, but from an authoritative trade source authored by a recognised code figure:

> "In 1997, the Canadian Standards Association (CSA) wrote its first extensive maintenance section in the CSA B44 S1-97 Safety Code for Elevators and Escalators." … "This extensive maintenance section was added to the **2000 edition of ASME A17.1** with some modifications during harmonization with the American elevator code."
> — John W. Koshak, "Maintenance Control Program Changes," *Elevator World*, https://elevatorworld.com/article/maintenance-control-program-changes/

The same article notes the requirement's enforcement lag: "even in 2015, this is not always the case, as MCPs are still not being provided consistently."

**Corroboration of the timeline from regulators:** the requirement is present and cited at §8.6.1.2 in the A17.1-2007 edition (Illinois OSFM, above) and in the A17.1-2013 edition (Colorado, above; Florida, below). I could not obtain the A17.1-2000 text itself to verify Koshak's attribution directly — flagged in gaps.

**The MCP's documentary skeleton.** Washington L&I's form F621-123-000, *Maintenance Control Program Documentation & Records* (07-2019), maps each requirement to a code section — this is the best single map of the MCP's contents I obtained. `Reproduced` — https://lni.wa.gov/forms-publications/F621-123-000.pdf

| Requirement | A17.1 section cited by WA L&I |
|---|---|
| Maintenance task procedures available to elevator personnel | 8.6.1.2.1(b) |
| Accurate as-built wiring diagram | 8.6.1.2.2(a) |
| Unique maintenance procedures for SIL-rated devices | 8.6.1.2(b)(2) |
| Procedures under alternative arrangements | 8.6.1.2(b)(3) |
| Unique maintenance procedures specified in ASME A17.7/B44.7 | 8.6.1.2(b)(4) |
| Procedures for testing, traction loss, suspension member issues | 8.6.1.2(b)(5) |
| Written checkout procedures | 8.6.1.2(c) |
| Emergency evacuation and enclosure cleaning | 8.6.1.2.2(d) |
| **On-site maintenance records — 5-year retention** | **8.6.1.4.1** |
| Code non-compliance documentation | 8.6.1.4.1(a)(3) |
| Repair and replacement records | 8.6.1.4.1(b) |
| Oil usage log | 8.6.1.4.1(c)(1) |
| Suspension replacement criteria | 8.6.1.4.1(c)(4) |
| Acceptance test records (5-year, overspeed valve) | 8.6.1.4.1(d) |
| **Callback records** | **8.6.1.4.2** |
| Periodic test results | 8.6.1.7.2 |

**States enforce the MCP with hard deadlines.** Florida Rule 61C-5.0015: "Elevators must comply with the maintenance control program onsite documentation requirement in s. 8.6.1.2, ASME A17.1-2013, as adopted by reference in Rule 61C-5.001," with phased compliance deadlines running from January 1, 2018 through October 1, 2020 depending on the code under which the unit was installed. — https://regulations.justia.com/states/florida/61/61c/chapter-61c-5/section-61c-5-0015/ `Disclosed`

Tennessee: "A Maintenance Control Program (MCP) shall be in place for each individual unit," meeting amended requirements in Rules of the Tennessee Dept. of Labor & Workforce Development Chapter 0800-03-04-.02(o) through (y). `Disclosed`

**Why this is the moat, stated plainly.** Three features of the MCP do underwriting work:

1. **It is written and unit-specific.** Every device needs its own program. The MCP is not portable across a portfolio without per-unit work.
2. **It requires the as-built wiring diagram and OEM-specific procedures** (8.6.1.2.2(a), 8.6.1.2(b)(4)). On proprietary/microprocessor equipment this is the practical chokepoint that makes switching providers hard and keeps OEM-controlled units OEM-serviced. *(Analytic inference — `Estimated`.)*
3. **It requires 5-year on-site records and callback records** (8.6.1.4.1, 8.6.1.4.2). A route acquirer inherits a documented compliance history — and a documented liability history. **In diligence, the MCP file and callback log are the two documents that matter most, and they exist by law.** *(Analytic inference — `Estimated`.)*

### A.5 ASME A17.2 — the Guide for Inspection

**Current edition: A17.2-2023, the ninth edition, revising the 2020 edition.** `Press-derived` (ANSI Blog) — https://blog.ansi.org/ansi/asme-a17-2-2023-guide-inspection-elevators/

**Its role is explicitly non-mandatory.** It is "a guide for inspection and testing procedures for electric and hydraulic elevators, escalators, and moving walks" that "assists qualified inspectors" in complying with A17.1, but inspectors "may employ alternative methods to demonstrate compliance." It contains the inspection checklists and verification procedures used in practice, and is written for professionals with "knowledge and experience to recognize potential deficiencies."

**Underwriting read:** A17.2 is not a source of obligation. It is the *procedure manual* that makes the obligation executable, and therefore the training substrate for QEIs. It is a barrier to entry by competence, not by law. `Estimated`

### A.6 ASME A17.3 — the retroactive code, and where the capex comes from

**Current edition: A17.3-2023, the twelfth edition, revising the 2020 edition.** `Press-derived` (ANSI Blog) — https://blog.ansi.org/ansi/asme-a17-3-2023-code-existing-elevators-escalators/

Its function:

> "ASME A17.3-2023 serves as the basis for state and local jurisdictional authorities in adopting retroactive requirements for existing elevators and escalators."

**This is the instrument that creates forced modernization capex.** A17.1 governs new installations; A17.3, when adopted, reaches backwards and requires existing equipment to be upgraded. NYC's Appendix K is the clearest live example: "the provisions of ASME A17.3-2015 shall be modified in accordance with this appendix and are applicable to all existing elevators and escalators" — NYC Building Code Appendix K §K301.1, https://codelibrary.amlegal.com/codes/newyorkcity/latest/NYCadmin/0-0-0-190629. See §D.1 for the deadline schedule this creates.

**Underwriting read:** for a service route, A17.3 adoption is the single largest driver of non-recurring, high-margin repair/modernization revenue, and it arrives on a published schedule years in advance. A route in an A17.3-adopting jurisdiction with a known retrofit deadline has a forecastable capex pipeline attached to its installed base. `Estimated`

---

## B. State adoption — the patchwork

### B.1 The published adoption table

The only comprehensive published state-by-state adoption table I located is:

**National Elevator Industry, Inc., *Stateside Code Update Report*, February 2019** — https://nationalelevatorindustry.org/wp-content/uploads/2019/08/CodeAdoption.pdf `Press-derived` (industry association)

**This table is seven and a half years stale as of this pass and several rows are known to be superseded** (see §B.2). It is reproduced in full because it is the only systematic snapshot found, and because *the pattern of lag* it documents is itself the durable finding.

| State | A17.1 edition (Feb 2019) | A17.7 | Note as published |
|---|---|---|---|
| AL | 2016 | 2007 | Auto-adopts latest version six months after publication |
| AK | 2013 | 2007 | Proposed rule to adopt 2016 |
| AZ | 2007 | Excluded | Moratorium on rulemakings; no timeline |
| AR | 2007 | 2007 | Discussing 2013 or 2016; no timeline |
| CA | 2004 | None | Looking at adopting 2013; no schedule |
| CA (Los Angeles) | 2004 | None | Follows state standards |
| CO | 2013 | 2007 | Stakeholder outreach planned Feb/Mar 2019 |
| CT | 2013 | 2007 | Final rule effective 1/3/2018 |
| DE | N/A | N/A | **No state code; local regulation only** |
| D.C. | 2010 | Excluded | Proposed 2015 ICodes adoption |
| FL | 2013 | 2007 | Developing seventh edition |
| GA | 2013 | 2007 | Decided to update to 2016; no timeline |
| HI | 2010 | 2007 | Not currently considering adoption |
| ID | 2016 | 2007 | Effective 2018 |
| IL | 2013 | 2007 | Rules to incorporate updated standards proposed shortly |
| IL (Chicago) | 2016 | 2007 | Ordinance effective 3/28/2018 |
| IN | 2007 | 2007 | Committee discussing 2016 |
| IA | 2016 | 2007 | Effective 1/24/2018 |
| KS | 2006 IBC | None | Considering 2018 IBC |
| KY | 2010 | 2007 | Timeline uncertain |
| LA | 2013 | 2007 | Not currently discussing |
| ME | 2013 | Excluded | Effective 12/1/2015 |
| MD | 2016 | 2007 | Final rule adopted |
| MA | 2013 | None | Final rules effective 6/1/2018 |
| MI | 2010 | 2007 | Rulemaking not expected until 2019 |
| MN | 2010 | 2007 | Discussing 2018 ICodes |
| MS | 2016 | 2007 | Effective August 2017 |
| MO | 2004 | None | Discussing update to 2016; no timeline |
| MT | 2004 | None | Draft rules published |
| NE | 2013 | 2007 | Intends rulemaking to adopt 2016 in 2019 |
| NH | 2016 | 2007 | Auto-adopted effective 5/30/2017 |
| NJ | 2013 | Excluded | Proposed 2018 IBC adoption |
| NM | 2012 | 2007 | Local regulation; IBC (2015) adopted 2016 |
| NY (state) | 2013 | 2007 | Evaluating 2018 ICodes |
| **NY (NYC)** | **2000/2002/2003/2005** | None | Discussing revisions to construction codes |
| NV | 2013 | 2007 | Reviewing alignment with 2016 |
| NC | 2016 | 2007 | Auto-adopted effective 5/30/2017 |
| ND | 2013 | 2007 | Discussing 2020 building code |
| OH | 2016 | 2007 | Effective 1/1/2018 |
| OK | 2016 | 2007 | Auto-adopted May 2017 |
| OR | 2010 | 2007 | Review beginning 2019 or 2020 |
| **PA** | **2000/2002** | None | Completing review of 2016; no timeframe |
| RI | 2016 | 2007 | Proposed amendments |
| SC | 2016 | 2007 | For installations after 7/1/1986 |
| SD | 2007 | 2007 | Remains in effect |
| TN | 2010 | 2007 | Board beginning process to adopt 2016 |
| TX | 2016 | Excluded | Rule effective 11/1/2018 |
| UT | 2016 | 2007 | Adopted |
| VT | 2013 | Excluded | Effective 7/1/2014 |
| VA | 2013 | 2007 | 2018 update; intended effective Feb–Mar 2021 |
| WA | 2016 | Limited | Effective 10/1/2018 |
| WV | 2013 | 2007 | Effective 5/1/2016 |
| WI | 2013 | 2007 | Drafting amendments for 2016 |
| WY | 2016 | 2007 | Adopted 2018 ICC codes; effective 5/23/2018 |

**The structural finding, which does not go stale:** as of that snapshot, adopted editions spanned **2000 to 2016** — a sixteen-year spread — against a code then on a three-year cycle. Several states (AZ, AR, IN, SD on 2007; CA, MO, MT on 2004; PA and NYC on 2000/2002) were two to five editions behind. Three mechanisms explain the spread and all three persist: **auto-adoption** states (AL, NH, NC, OK) track within months; **building-code-cycle** states inherit whatever edition their IBC cycle references; **standalone-rulemaking** states drift indefinitely, and AZ was explicitly frozen by a rulemaking moratorium.

### B.2 Adoption updates verified since the NEII table

These I confirmed directly from the jurisdiction's own instrument or site (`Disclosed` unless noted), and they supersede the corresponding 2019 rows:

| State | Verified adopted edition | Source |
|---|---|---|
| **Illinois** | **A17.1-2019**; A17.1-2022 under consideration for door-lock-monitoring retrofits on existing units | Illinois OSFM FAQ, https://sfm.illinois.gov/about/divisions/elevators/elevator-faqs.html |
| **Oregon** | **A17.1-2019**, adopted by reference | OAR 918-400-0455, https://regulations.justia.com/states/oregon/chapter-918/division-400/section-918-400-0455/ |
| **Tennessee** | **A17.1-2016** on and after **7/18/2021** (A17.1-2010 before that date) | TN DOL&WD, *Elevator Code Changes – Updates*, https://www.tn.gov/content/dam/tn/workforce/documents/employers/Elevator_Code_Changes-Update.pdf |
| **Ohio** | **A17.1-2016** cited in current rule text | OAC 1301:3-6-04, https://regulations.justia.com/states/ohio/title-1301-3/chapter-1301-3-6/section-1301-3-6-04/ |
| **Kansas** | Statute keys code version to installation date; units installed before **7/1/2024** conform to regulations in effect at installation; material alteration (>49%) triggers current code | K.S.A. 44-1805, https://law.justia.com/codes/kansas/chapter-44/article-18/section-44-1805/ |
| **NYC** | Building Code Appendix K modifies **ASME A17.3-2015** for existing equipment | NYC BC §K301.1, https://codelibrary.amlegal.com/codes/newyorkcity/latest/NYCadmin/0-0-0-190629 |
| **Pennsylvania** | Periodic testing still specified under **"ASME A17.1-2000" with "A17.1a-2002" addenda** | 34 Pa. Code §405.8(a), https://regulations.justia.com/states/pennsylvania/title-34/part-xiv/chapter-405/generally/section-405-8/ |
| **California** | §3141.6 states its own intervals and "references ASME A17.1-2004 standards for detailed test procedures" | 8 CCR §3141.6, https://dir.ca.gov/title8/3141_6.html |

**Pennsylvania is the standout.** Its live regulation still runs periodic testing off a code edition published in 2000 with 2002 addenda. **Twenty-three editions of drift, on the ANSI count.**

### B.3 Who may perform the inspection — four regimes

This is the taxonomy that determines whether an inspection business exists in a state at all. Every row is `Disclosed` from the instrument named.

**Regime 1 — Public inspector monopoly. No third-party periodic inspection market.**

| State | Instrument | Operative text |
|---|---|---|
| Massachusetts | 524 CMR 36.00 §26.4.2 | "Periodic inspections and load tests shall be **made by a state elevator inspector employed by the Office**." (§26.1.2 same for new installations) — https://regulations.justia.com/states/massachusetts/524-cmr/title-524-cmr-36-00/section-26/ |
| Washington | RCW 70.87.120 | "The department shall cause all conveyances to be inspected and tested at least once each year." … "The department shall appoint and employ inspectors, as may be necessary to carry out the provisions of this chapter." — https://app.leg.wa.gov/rcw/default.aspx?cite=70.87.120 |
| Hawaii | HAR §12-229-7.1 | "All permit renewal inspections and witnessing of tests … shall be performed by **qualified inspectors employed by the department**." — https://www.law.cornell.edu/regulations/hawaii/Haw-Code-R-SS-12-229-7-1 |
| Pennsylvania | 34 Pa. Code §405.8(b),(g) | "A construction code official shall witness each test enumerated in this section." … "A construction code official shall complete a test report after the official witnesses a periodic test." — https://regulations.justia.com/states/pennsylvania/title-34/part-xiv/chapter-405/generally/section-405-8/ |
| New Jersey | NJAC 5:23-12.3 | Inspections and tests performed by "the elevator subcode official or elevator inspector"; no authorization of private agencies found in the section — https://regulations.justia.com/states/new-jersey/title-5/chapter-23/subchapter-12/section-5-23-12-3/ |

**Regime 2 — Third-party inspection required *and* independence from the maintenance provider mandated.** *(This is the crux answer; see §B.4.)*

**Regime 3 — Third-party inspection permitted; independence not mandated by the jurisdiction (or mandated only indirectly, via the certifier's ethics code).**

| State | Instrument | Finding |
|---|---|---|
| Georgia | Ga. Comp. R. & Regs. 120-3-25-.05 | Requires "a minimum of three (3) years' experience in the installation, repair, maintenance or inspection of elevators and be a current QEI"; "All private inspection firms inspecting elevators in the State of Georgia shall have a minimum of $500,000 general liability insurance." **No independence or conflict-of-interest language in the section.** — https://www.law.cornell.edu/regulations/georgia/Ga-Comp-R-Regs-R-120-3-25-.05 |
| Ohio | OAC 1301:3-6-04 | "Inspectors shall comply with the **code of ethics established by the 'Qualified Elevator Inspector' (QEI) certifying agency**." No direct independence rule in the state rule — the obligation is imported by reference from the certifier (see §C.3). — https://regulations.justia.com/states/ohio/title-1301-3/chapter-1301-3-6/section-1301-3-6-04/ |
| Washington, DC | DC DOB; DCMR 12A §§3001, 3009.2, 3009.4.1, 3009.5 | "The owner must connect with a DOB approved **Third-party Elevator Inspection Agency**" which "conducts inspections of all elevators and conveyances in the District on DOB's behalf." **No independence language found.** — https://dob.dc.gov/node/1616596 |
| Mississippi | 19 Miss. Code R. §8-1.11 | "No inspector's license shall be granted to any person unless he or she meets the current ASME QEI-1 … Standards for the Qualifications of Elevator Inspectors or State standards"; insurance per §1.12. **No independence language in this section.** — https://www.law.cornell.edu/regulations/mississippi/19-Miss-Code-R-SS-8-1-11 |

**Regime 4 — Individual-level self-inspection bar only (the firm may still inspect its own work through a different employee).**

| State | Instrument | Operative text |
|---|---|---|
| Kansas | K.S.A. 44-1805 | "No licensed elevator mechanic or employee of such a licensee shall inspect work that was performed on an elevator **by that individual**." — https://law.justia.com/codes/kansas/chapter-44/article-18/section-44-1805/ |

Kansas also gates the trade broadly: "No individual shall erect, construct, alter, replace, inspect, maintain, remove or dismantle any elevator … unless such individual is a licensed elevator mechanic or such individual is employed and directed by a licensee."

### B.4 THE CRUX — must the inspector be independent of the maintenance provider?

**There is no national rule. The answer is jurisdictional, and the industry is actively fighting about it.**

**States/cities where independence IS mandated (`Disclosed`):**

**New York City — the strictest, and it is statutory, not merely rule-level.**
> "**an approved elevator agency not affiliated with the agency performing the maintenance**"
> — NYC Administrative Code **§28-304.6.1**, https://www.nyc.gov/assets/buildings/codes-pdf/cons_codes_2014/2014CC_AC_Chapter3_Maintenance_of_Buildings.pdf

Restated by DOB in two places:
> "Periodic inspections must be performed by an approved elevator agency and **cannot be affiliated with the agency performing the maintenance**."
> — NYC DOB, *Service Update: Periodic Elevator Inspection Must be Performed by Approved Agency on Behalf of Owner*, **November 30, 2021**, https://www.nyc.gov/assets/buildings/pdf/periodic_elevator_inspections_sn.pdf

> "The agency performing the periodic inspection cannot be affiliated with the agency performing maintenance on the device." … CAT1 tests are witnessed by "approved **independent third-party agencies** licensed by the Department." … "Owners are responsible for hiring an approved inspection agency."
> — NYC DOB Elevator Compliance, https://www.nyc.gov/site/buildings/safety/elevator-compliance.page

Note: I searched 1 RCNY §101-07 and §103-02 for the independence clause and **did not find it there** — the only conflict provision in the rules is 101-07(c)(4)(iv), "An employee of an elevator [inspection] agency may work only for such agency and for one agency director at a time" (https://rules.cityofnewyork.us/wp-content/uploads/2021/10/Final-Rule-Amendment-of-Rules-Governing-Boiler-amp-Elevator-Inspections.pdf, effective January 1, 2022). **The independence mandate is carried by the Administrative Code, not the rules.** That matters: it takes a Council act, not a DOB rulemaking, to reverse.

**Illinois (and therefore Chicago).**
> "A third party inspection company or inspector must be licensed with the State of Illinois, and **be independent of your conveyance maintenance company**."
> — Illinois OSFM Elevator FAQ, under 225 ILCS 312 (Elevator Safety and Regulation Act) and 41 Ill. Adm. Code 1000, https://sfm.illinois.gov/about/divisions/elevators/elevator-faqs.html

Chicago operates its Annual Inspection Certification (AIC) program through "state-licensed, third-party inspection companies to inspect their elevators and other conveying devices annually," reported via the AIC portal — https://www.chicago.gov/city/en/depts/bldgs/provdrs/inspect/svcs/annual_inspectioncertificationaicprogramupdate.html — so the Illinois independence rule flows through to Chicago's program.

**Maryland — independence built into the definition of who may register.**
> A third-party qualified elevator inspector must be: "**An independent elevator consultant; Employed by an independent inspection agency; or Employed by the insurer of the elevator unit.**"
> — COMAR 09.12.81.04-1, https://regs.maryland.gov/us/md/exec/comar/09.12.81.04-1

Also: QEI certification from an ASME-accredited organization; $250 initial and $250 annual registration; insurance of at least $500,000 injury/death per occurrence and $100,000 property damage; automatic cancellation if insurance or QEI certification lapses. The state retains acceptance inspections for new installations and alterations, accident investigation and QC monitoring, while TPQEIs perform the annual and five-year inspections; "A TPQEI is required to be physically present during the testing of an elevator unit." — https://labor.maryland.gov/labor/safety/elev.shtml. Statutory basis cited as Chapter 337 of the Laws of 2018 (HB1107).

**Texas — firm-level conflict bar, though framed as conflict of interest rather than structural separation.**
> "A registered inspector may not inspect equipment if the inspector **or the inspector's employer** has a financial or personal conflict of interest."
> — TDLR Elevator Safety and Licensing FAQ, https://www.tdlr.texas.gov/elevator/elefaq.htm

TDLR also confirms inspectors are private, not public: "Elevator inspectors are required to register with the Department, but they are not employees of the Department," and separately requires contractor registration: "Any person that performs installation, alteration, testing, repair or maintenance of an elevator, escalator, or related equipment is required to be registered with the Department."

**The industry position — and it cuts the other way.** `Press-derived`

> "When it is inevitable that Authorities Having Jurisdiction are not going to employ elevator inspectors, **elevator companies should not be precluded from inspecting elevators they maintain**." … "elevator companies who elect to perform inspections must be entitled to select personnel to perform inspections." … "**Properly regulated self-inspection should not be construed as a 'conflict of interest'. It has a proven track record.**"
> — National Elevator Industry, Inc., *Elevator Inspection Policy*, approved **September 24, 2013**, https://nationalelevatorindustry.org/wp-content/uploads/2019/08/elevatorinspection.pdf

NEII — the OEM trade association — states a preference for inspections "administered by inspectors employed by Authorities Having Jurisdiction," and where that is not available, for permitting maintenance-company self-inspection. **The major OEMs are on record opposing mandatory third-party independence.** That is a live political risk to any thesis that capitalizes independent inspection revenue.

**The counterweight sits at the certification level, not the jurisdictional level.** NAESA International's conflicts policy binds its QEIs directly:

> "All QEI Inspectors have a fundamental responsibility to refrain from participating in QEI or compliance inspections when a competing interest precludes or inhibits the exercise of the QEI Inspector's independent professional judgment." … "Examples of conflicts of interest include but are not limited to inspecting work performed by a family member, **inspecting work performed by a co-worker**, or **having an interest in a service or repair company that may benefit from the results of an inspection report**."
> — NAESA International, Code of Ethics / Conflicts of Interest, https://naesai.org/code-of-ethics

**This is the sharpest tension in the regulatory layer.** NAESA's ethics rule, read plainly, disqualifies a QEI from inspecting work performed by a co-worker — which would bar most in-house self-inspection at firms certified through NAESA. NEII's policy says self-inspection is fine. Ohio resolves it by importing the certifier's ethics code into state rule (OAC 1301:3-6-04); most states do not address it at all.

**Underwriting conclusion on the crux.** `Estimated`

Third-party QEI inspection is a **real standalone business in a minority of jurisdictions and a captive line in the rest.** Specifically:
- **Real standalone business:** NYC, Illinois/Chicago, Maryland, Texas — independence mandated or conflict-barred at firm level.
- **No business at all:** Massachusetts, Washington, Hawaii, Pennsylvania, New Jersey — the public inspector holds the franchise.
- **Captive/optional:** Georgia, Ohio, DC, Mississippi, Kansas and most others — third parties permitted, but nothing structurally prevents the maintenance company from also holding the inspection work, subject only to a certifier's ethics code the state may or may not enforce.

An inspection-agency roll-up therefore has a **materially smaller and more politically exposed TAM than a maintenance-route roll-up.** The maintenance annuity is compelled everywhere the MCP requirement is adopted; the *independent inspection* annuity is compelled in a handful of states, and the largest trade association is lobbying against it.

### B.5 Licensing gates — contractors and mechanics

Licensing is separate from inspection and is itself a barrier to entry (and to route portability).

**New York State — the most elaborate structure found.** `Disclosed` — https://dol.ny.gov/elevator-licensing-information

Statutory basis: **Article 33 of the New York State Labor Law**. Seven credentials:
- *Individual:* Elevator Mechanic ("required to engage in elevator and conveyance work"); Elevator Inspector; Accessibility Lift Technician; Elevator Accessibility Technician (restricted to ASME A18.1 platform lifts); Temporary Elevator Mechanics License (during verified mechanic shortages, **effective June 10, 2026**)
- *Business:* Elevator Contractor License ("required to engage in the business of elevator and conveyance work"); Elevator Inspection Contractor License

**A grandfather clause is closing:** the qualifying path of "proof of work … for a period of not less than four years prior to January 1, 2022" **expires June 10, 2026** — i.e., it has now lapsed as of this pass's date. Remaining paths are NAEC certification, apprenticeship completion, approved training programs, or municipal equivalency. NYC DOB licensure as a Private Elevator Inspection Agency Director or Inspector is "determined to be an equivalent municipal program."

**Other licensing gates verified:**
- **Kansas:** licensed elevator mechanic required for essentially all work; separate inspector license (K.S.A. 44-1805).
- **Georgia:** inspector certification requires 3 years' experience + current QEI + $500k liability insurance for private inspection firms (120-3-25-.05).
- **Maryland:** TPQEI registration $250 initial / $250 annual, QEI from ASME-accredited organization, $500k/$100k insurance (COMAR 09.12.81.04-1).
- **Texas:** contractor registration for anyone performing installation, alteration, testing, repair or maintenance; separate inspector registration, expiring every 12 months with CE required for renewal (TDLR).
- **Illinois:** inspector license renewed every two years with 8 hours CE annually; QEI credential plus insurance required (OSFM).
- **Mississippi:** inspector license conditioned on meeting current ASME QEI-1 (19 Miss. Code R. §8-1.11).

**Contractor and mechanic licensing are commonly separate credentials** (business licence vs. individual licence) — NY, Kansas and Texas all show this structure explicitly. `Disclosed`

**Third-party count of licensing states:** a vendor site reports "Elevator Mechanic License: 36/51 States Require It" (https://plainhirecheck.com/trade/elevator). `Press-derived`, **unverified against any state list — do not rely on this number without checking it state by state.**

---

## C. QEI certification

### C.1 The standard

**ASME QEI-1, *Standard for the Qualification of Elevator Inspectors*. Current edition: QEI-1-2024.** `Disclosed` — https://www.asme.org/codes-standards/find-codes-standards/standard-for-the-qualification-of-elevator-inspectors

ASME's stated purpose:
> "intended for the purpose of establishing uniform criteria, which will aid in: (a) qualifying and training of inspection personnel for government agencies, insurance companies, elevator companies, building owners, and managers (b) providing guidance for accredited certifying organizations."

ASME notes this edition "has been placed on stabilized maintenance," meaning it remains in effect and open to formal change requests.

Note the scope language: QEI-1 explicitly contemplates inspectors employed by "elevator companies" as well as by government agencies and insurers. **The standard itself does not require independence.** Independence, where it exists, is imposed by jurisdictions (§B.4) or by certifiers' ethics policies (§C.3).

### C.2 Who accredits, who certifies

**Accreditor: the ANSI National Accreditation Board (ANAB), under ISO/IEC 17024.** `Disclosed`
- NAESA International: "accredited by the ANSI National Accreditation Board (ANAB) under the 17024 standard," certifying inspectors "to the ASME QEI-1 Standard for Qualified Elevator Inspectors" — https://naesai.org/faq
- Qualified Elevator Inspector Training Fund (QEITF): "QEITF was granted accreditation under ISO/IEC 17024: 2012 by the ANSI National Accreditation Board (ANAB)" in **December 2013** — https://www.qeitf.org/become-an-inspector/
- National Association of Elevator Contractors (NAEC) also issues a QEI credential — https://www.credly.com/org/national-association-of-elevator-contractors/badge/naec-qualified-elevator-inspector-qei.1

Maryland's regulation reflects this structure by requiring "a valid qualified elevator inspector certification issued by an organization **accredited by the American Society of Mechanical Engineers**" (COMAR 09.12.81.04-1) — a slightly different framing from the ANAB accreditation the certifiers themselves cite. `Disclosed`, noted as a discrepancy in framing between instruments.

### C.3 The experience gates

**The QEI-1 core requirement.** `Reproduced` — NAESA quotes it directly:
> "An inspector shall have verifiable experience of at least one year performing inspections and witnessing tests as specified in ASME A17.1 and ASME A18.1 under the direct observation of a QEI Certified Inspector and/or Inspector Supervisor"
> — ASME QEI-1 Standard, **Section 2.1**, as quoted in NAESA International *Inspector Applicant Handbook* (© 2015), https://naesai.org/storage/editable-pdfs/qei-application.pdf

**NAESA's four qualification pathways** (all requiring the §2.1 supervised inspection year on top):
1. "Four (4) years' verifiable documented education and experience in the mechanical and/or electrical aspects in the elevator industry" + ≥1 year performing inspections/witnessing tests per A17.1 §§8.10/8.11 and A18.1
2. "Two years of verifiable documented college courses in an elevator industry related engineering field" + 1 year inspection/testing experience
3. Meeting the "elevator personnel" definition with documented training + 1 year performing inspections and witnessing tests as an inspector or trainee under direct supervision for an enforcing authority
4. Executive Director discretion via notarized affidavits where documentation cannot be produced

**QEITF's route (union/apprenticeship-anchored):** `Disclosed` — https://www.qeitf.org/become-an-inspector/
- High school or GED diploma
- "Five (5) years of supervised experience in the elevator trade (includes an **8,000-hour national apprenticeship program** and 1-year of post-apprenticeship experience)"
- "Passing score on the National Elevator Industry Education Program (NEIEP) Mechanics Exam or an equivalent"
- QEITF 4-day Inspector Training Course + certification exam

**Renewal.** NAESA requires annual continuing education, a renewal fee, signed maintenance-of-qualifications documents, and agreement to NAESA's terms; NAESA awards "0.1 CEU per clock hour of instruction" — https://naesai.org/faq. State overlays vary: Illinois requires renewal every two years with 8 hours CE annually; Texas registrations expire every 12 months with CE required.

**Underwriting read on the gate.** `Estimated` — The binding constraint is not the exam, it is the **8,000-hour apprenticeship plus post-apprenticeship year** (QEITF) or the 4-to-5-year experience base (NAESA). A QEI cannot be manufactured in under roughly five years from a standing start. That is a genuine, non-capital barrier to entry, and it caps how fast an inspection roll-up can scale organically — headcount must be bought, not trained.

### C.4 Population and demographics — LARGELY UNVERIFIED

**I could not establish the number of QEI-certified inspectors in the United States.** I searched NAESA, NAEC, QEITF, ASME, ONET and trade press. NAESA's FAQ, its history page and QEITF's site all decline to publish a count.

**The one datapoint found:** `Press-derived`, and weak —
> NAESA "education programs certified or re-certified **more than 3,100 individuals**" last year
> — Jack Day, "NAESA International," *Elevator World*, https://elevatorworld.com/article/naesa-international/ — **the article's publication date was not captured in my retrieval, so "last year" is undated and this figure is not anchored in time. It also mixes new certifications with re-certifications and covers one certifier of at least three.** Do not use as a population estimate.

**Adjacent occupational data — note this is a DIFFERENT population.** `Disclosed` (BLS via O*NET) — https://www.onetonline.org/link/summary/47-4021.00
- **Elevator and Escalator Installers and Repairers (SOC 47-4021): 24,200 employed (2024)**
- Median wage (2025): **$52.84/hour, $109,910/year**
- Projected growth 2024–2034: "Faster than average (5% to 6%)"
- Projected job openings 2024–2034: **2,000**

This is the mechanic population, not the inspector population. It is included because it bounds the pool from which QEIs are drawn — the ~24,200 figure is the recruitment universe, and inspectors are a small subset of it. **Any inference from 24,200 to an inspector count is mine and unverified.**

**Age/retirement profile: NOT FOUND.** No source consulted published age distribution, average tenure, or retirement projections for QEIs. Flagged as a priority gap.

**One adjacent enforcement-capacity signal, non-US:** CBC reported that "about 65% of elevator inspections in N.L. didn't happen in 2024" (Newfoundland and Labrador) — https://amp.cbc.ca/news/canada/newfoundland-labrador/going-down-about-65-of-elevator-inspections-in-n-l-didn-t-happen-in-2024-1.7533525. `Press-derived`, Canadian. Recorded only as evidence that public-inspector-monopoly regimes can fail to deliver the mandated inspection volume — which is a thesis-relevant pattern, not a US figure.

---

## D. Jurisdictional variation worth underwriting

### D.1 New York City — the strictest regime in the country, and the one that most changes route economics

**Installed base.** "the city's **84,000+ elevator devices** – including passenger and freight elevators, escalators, dumbwaiters, roller coasters, and more" — NYC DOB press release, *New DOB Report Maps NYC's 84,000+ Elevators*, **April 12, 2018**, underlying the 2017 Elevator Report — https://www.nyc.gov/site/buildings/dob/pr-elevators-report.page `Disclosed`

An older figure for a narrower class: "approximately **59,000 active and available-for-use passenger and freight elevators in approximately 20,000 buildings** citywide" — NYC Comptroller, *Audit Report on the Department of Buildings Elevator Inspections and Follow-Up Activities*, Audit No. MJ10-063A, **October 21, 2010** — https://comptroller.nyc.gov/reports/audit-report-on-the-department-of-buildings-elevator-inspections-and-follow-up-activities/ `Disclosed`. **The two figures are not in conflict** — different device classes, sixteen years apart — but neither is current.

**The mandate stack.** `Disclosed`
- Statute: **NYC Administrative Code Title 28, Article 304**; **Local Law 126 of 2021**, effective **January 1, 2022**
- Rules: **1 RCNY §101-07** (approved agencies) and **§103-02** (inspections, tests, filings, penalties), effective January 1, 2022
- Retroactive technical requirements: **NYC Building Code Appendix K**, modifying **ASME A17.3-2015**

**The compliance calendar per device, per year:**
- Periodic inspection, Jan 1–Dec 31, "at a minimum of three months from the date of any Category 1 testing or previous periodic inspection" (1 RCNY §103-02) — **filed within 14 days** (§28-304.6.5.1)
- Category 1 test, Jan 1–Dec 31, minimum 6-month interval (§28-304.6.1) — **filed within 21 days** (§28-304.6.5.2)
- Category 3 (water hydraulic): every 3 years
- Category 5: every 5 years from the month of the final acceptance test
- DOB must be notified **at least five days prior** to Category 1 escalator tests, Category 3 water hydraulic tests and Category 5 elevator tests (DOB Industry Notice, **December 30, 2021**, https://www.nyc.gov/assets/buildings/pdf/in_new_elv_cat_testing_reqs.pdf)
- **Hard filing windows:** DOB rejects periodic inspection filings not submitted by **January 14** and CAT1 filings not submitted by **January 21** — https://www.nyc.gov/site/buildings/safety/elevator-compliance.page

**Late-filing penalties (1 RCNY §103-02).** `Disclosed` — https://www.nyc.gov/assets/buildings/rules/1_RCNY_103-02.pdf
- Residential (1–2 units): "$50.00 per month, per elevator," capped at "$600.00 per elevator"
- Commercial/mixed-use: **$150.00/month** (Category 1 / periodic), capped at **$1,800.00**; **$250.00/month** (Category 3 / 5), capped at **$3,000.00**

**Forced retrofit capex on a published schedule (NYC BC Appendix K, §K301.1 et seq.).** `Disclosed` — https://codelibrary.amlegal.com/codes/newyorkcity/latest/NYCadmin/0-0-0-190629
- **Door lock monitoring** — "Means shall be provided to monitor the position of power-operated car doors" to prevent car operation if the door is not fully closed. Deadline **January 1, 2020**. Confirmed by DOB service notice: "Effective January 1, 2020 all automatic passenger and freight elevators must be in compliance," citing "Appendix K Chapter K3 Section 3.10.12 of the New York City Building Code"; enforcement by OATH summonses and follow-up inspections — https://www.nyc.gov/assets/buildings/pdf/elevator_door_monitoring_deadline_sn.pdf (NYC DOB, December 2019)
- **Escalator skirt deflector devices** — **January 1, 2025**
- **Single-plunger brake alteration or Unintended Car Movement Protection (UCMP)** — **January 1, 2027**
- **Restricted opening of hoistway doors on automatic passenger elevators** — **January 1, 2027**
- Residential elevator compliance — November 7, 2023

**How NYC changes the economics of owning a route there.** `Estimated`
1. **Independence mandate splits the wallet.** §28-304.6.1 forbids the maintenance provider from performing the periodic inspection. A NYC route generates maintenance revenue only; the inspection fee accrues to a separate, licensed agency. Conversely, an *inspection agency* in NYC has a legally protected, non-cannibalizable revenue line. These are two different businesses in NYC and one business in Georgia.
2. **Penalty structure makes the service contract defensive.** Filing windows are hard and penalties accrue monthly per device. For a large portfolio owner, the value of the maintenance contract is substantially the value of *not* incurring OATH summonses and filing penalties — which raises willingness to pay and lowers churn.
3. **Two January 1, 2027 retrofit deadlines are live right now.** UCMP/single-plunger brake and restricted hoistway door opening both bind in under five months from this pass's date. Any NYC-exposed route should be diligenced for the *unperformed* share of that retrofit backlog — it is simultaneously a near-term revenue pipeline and an unbooked liability if the incumbent has been quoting and not converting.
4. **The 2010 Comptroller audit is a caution on enforcement, not a comfort.** It found "nearly one-fifth of all sampled elevators were not inspected in 2009" and that DOB's "enforcement and follow-up activities are not adequate." That is sixteen years stale and predates LL126, but it establishes that mandated ≠ performed, and that compliance rates are an empirical question in every jurisdiction.

### D.2 Illinois / Chicago — independence mandated statewide, current code

Illinois is on **A17.1-2019** with **A17.1-2022 under consideration specifically for door-lock-monitoring retrofits on existing units** — i.e., Illinois is contemplating its own version of the NYC retrofit driver. Annual inspection required statewide under 225 ILCS 312 and 41 Ill. Adm. Code 1000; the inspector must be state-licensed **and independent of the maintenance company**; Chicago runs the same requirement through its AIC portal with quarterly due dates. `Disclosed`

**Economics:** same structural split as NYC — maintenance and inspection are separate wallets — but with a more current adopted code and, on the evidence found, a lighter penalty regime. An Illinois inspection agency is a genuine standalone asset. `Estimated`

### D.3 Massachusetts, Washington, Hawaii — public inspector monopoly

All three reserve periodic inspection to government employees (§B.3). `Disclosed`

**Economics:** `Estimated` — there is **no inspection revenue to acquire** in these states. A route here is a pure maintenance annuity. Two consequences: (a) route valuation should carry no inspection line at all; (b) the state inspection workforce is a throughput constraint the operator does not control — if the state cannot inspect, certificates lapse, and the operator absorbs the customer friction without owning the remedy. Washington's statute is unambiguous that it is the department's job: "The department shall cause all conveyances to be inspected and tested at least once each year."

### D.4 Pennsylvania — the stale-code, public-witness outlier

Periodic testing is still specified under **A17.1-2000 with A17.1a-2002 addenda**; "A construction code official shall witness each test"; no inspector licensing or credentialing system appears in 34 Pa. Code §405.8; and no independence provision exists. `Disclosed`

**Economics:** `Estimated` — the compliance burden on owners is lower and less current than in NYC or Illinois, which cuts willingness to pay for compliance-driven service. There is no third-party inspection business. And because the adopted edition predates the harmonized A17.1/B44 series entirely, **an operator's technical obligations in PA diverge materially from its obligations in a 2019/2022-edition state** — a real integration cost for any multi-state roll-up, since MCP content, test procedures and documentation differ by adopted edition.

### D.5 Maryland — the cleanest model of a legislated third-party market

Maryland deliberately constructed an independent inspection profession: TPQEI registration, mandatory structural independence (independent consultant / independent inspection agency / the unit's insurer), ASME-accredited QEI certification, $500k/$100k insurance, $250 annual registration, automatic cancellation on lapse, physical presence required during testing, with the state retaining acceptance inspections, alterations, accident investigation and QC monitoring. Statutory basis Chapter 337 of the Laws of 2018 (HB1107); COMAR adoption noted as proposed for December 2025. `Disclosed`

**Economics:** `Estimated` — Maryland is the best template for what an independent-inspection roll-up looks like when a state builds the market on purpose: a defined, registered, insured, licensed provider set with a hard barrier (QEI + insurance + registration) and no ability for the maintenance incumbent to absorb the line. The registered-TPQEI list is a ready-made acquisition target register. **Recommended follow-on: pull the Maryland TPQEI registry and count registrants — that is the closest available proxy to the size of an independent inspection market in a mandated state.**

### D.6 Summary of the strict-to-loose spectrum

| Jurisdiction | Adopted edition (verified) | Who inspects | Independence mandated? | Retrofit capex driver | Net effect on a service route |
|---|---|---|---|---|---|
| **NYC** | A17.3-2015 via Appendix K | Approved private agency | **YES — statutory (§28-304.6.1)** | **Heavy; 2 deadlines at 1/1/2027** | Highest WTP, split wallet, near-term retrofit pipeline |
| **Illinois / Chicago** | A17.1-2019 (2022 under consideration) | State-licensed third party | **YES (OSFM)** | Possible DLM retrofit pending | Split wallet, current code |
| **Maryland** | Not verified in this pass | Registered TPQEI | **YES — structural (COMAR 09.12.81.04-1)** | Not verified | Purpose-built independent inspection market |
| **Texas** | A17.1-2016 (per NEII 2019) | Registered private inspector | **YES — conflict bar incl. employer** | Not verified | Split wallet |
| **Ohio** | A17.1-2016 | Third party | **Indirect — via QEI certifier's ethics code** | Not verified | Ambiguous; depends on certifier enforcement |
| **Georgia / DC / Mississippi** | GA 2013, DC 2010 (NEII 2019) | Third party | **NO provision found** | Not verified | Inspection can be captive to maintenance |
| **Kansas** | Keyed to install date; 7/1/2024 pivot | Licensed mechanic/inspector | **Individual only, not firm** | Not verified | Inspection largely captive |
| **Massachusetts / Washington / Hawaii** | MA 2013, WA 2016, HI 2010 (NEII 2019) | **State employees** | N/A — no private market | Not verified | Maintenance annuity only; no inspection revenue |
| **Pennsylvania** | **A17.1-2000 / A17.1a-2002** | Construction code official | N/A | Minimal (stale code) | Lowest compliance-driven WTP |
| **New Jersey** | 2013 (NEII 2019) | Elevator subcode official | N/A | Not verified | Escalators inspected **every 6 months** |

---

## What we don't know yet

**Left deliberately empty rather than filled with plausible invention.** Each item below is a real gap, not a formatting placeholder.

**On the model code itself**
1. **I never read A17.1 verbatim.** The standard is paywalled; UpCodes is robots-blocked to my fetcher; direct HTTP retrieval is blocked by egress policy in this environment. Every A17.1 section number and interval in this file is triangulated from regulators who cite it. **Someone with a licensed copy of A17.1-2025 should verify §§8.6.1.2, 8.6.1.4, 8.6.1.7, 8.6.4.19, 8.6.4.20, 8.10, 8.11.1.3 and Nonmandatory Appendix N Table N1 against the actual text before any of this is used in an IC memo.**
2. **Table N1's actual cell values.** I have the table's title and page numbers (2253–2254) but not a trustworthy transcription. The only reproduction I found returned an internally inconsistent result. The authoritative interval grid — every equipment class, every category, every footnote — is still missing.
3. **The A17.1 section number for escalator/moving walk periodic tests.** One low-confidence source gives 8.6.8.15. Not corroborated. Not asserted.
4. **Whether A17.1 is on "stabilized maintenance."** My fetch of ASME's A17.1 page returned that phrase, which would contradict the three-year edition cadence implied by the Preface. I could not confirm the phrase attaches to A17.1 rather than a neighbouring standard. **This matters: if A17.1 has gone to stabilized maintenance, the forced-obsolescence/retrofit thesis weakens materially.** Verify directly with ASME.
5. **The publisher-stated revision cycle.** No source states one. The three-year pattern is my inference from the Preface list.
6. **Reconciliation of "seventh edition" vs "twenty-fourth edition."** Both retained; neither verified as to what it counts.
7. **Direct verification that the MCP was new in the A17.1-2000 edition.** I have Koshak in *Elevator World* saying so and regulators confirming its presence from 2007 onward. I could not read the 2000 edition.
8. **Whether A17.3 adoption is common or rare across states.** The NEII table tracks A17.1 and A17.7 but not A17.3. I verified A17.3 adoption only in NYC (2015 edition, via Appendix K). **Since A17.3 is the retroactive-capex engine, a state-by-state A17.3 adoption map is arguably the single highest-value missing artifact in this whole regulatory layer.**

**On state adoption**
9. **A current adoption table.** The NEII table is February 2019. I verified eight states since. **The other ~42 states' current adopted editions are unverified.** A commissioned pull of each state's adopting rule would be needed for a real map. Vendor sites offering "50 states compared" were either robots-blocked or unverifiable and are not cited as authority here.
10. **Whether the states shown at 2004/2007 editions in 2019 have since moved.** AZ, AR, IN, SD, MO, MT, CA in particular. California's own regulation still references A17.1-2004 procedures, which suggests at least some of this lag persists — but I did not confirm the current California adopted edition.
11. **Maryland's adopted A17.1 edition.** Not found; the COMAR adoption was noted as proposed for December 2025 with a linked PDF I did not retrieve.

**On the independence question**
12. **A systematic 50-state independence survey.** I established the rule for 14 jurisdictions by reading the instruments. **The other ~37 are unknown, and the four-regime taxonomy in §B.3–B.4 is built on a partial sample.** This is the most important remaining research task for any thesis that values independent inspection revenue.
13. **Whether NEII's 2013 anti-independence position is still its live position**, and whether it has defeated or delayed independence mandates in any specific state. The policy document is 13 years old.
14. **Whether Ohio (and any other state importing a certifier's ethics code) actually enforces the NAESA conflict rule** against maintenance-company self-inspection. The rule text imports it; enforcement practice is unknown.
15. **Whether NAESA's ethics rule is enforced against its own certificants at OEM service companies.** Read literally it bars inspecting a co-worker's work. If enforced, it is a de facto national independence rule. If not, it is decoration. I found no enforcement evidence either way.

**On QEI supply**
16. **The number of QEI-certified inspectors in the United States.** Not published by NAESA, NAEC, QEITF or ASME. The one figure found (NAESA "certified or re-certified more than 3,100 individuals") is undated, conflates new and renewal, and covers one of at least three certifiers.
17. **The age and retirement profile of the inspector population.** Nothing found. No source publishes age distribution, tenure or retirement projections for QEIs. Given the ~5-year minimum experience gate, this is a material supply question and it is entirely unanswered.
18. **The split of QEIs between public employment, OEM employment and independent agencies.** Unknown, and it directly determines the addressable headcount for an inspection roll-up.
19. **State-level counts of registered/licensed inspectors.** Several states maintain public lists (Illinois "a listing of licensed inspectors is available on our website"; Maryland's TPQEI registry; Texas registered inspectors). **None were pulled in this pass. These registries are the most tractable path to a real inspector population estimate and to a target register — recommended next action.**

**On enforcement reality**
20. **Actual compliance rates.** The only US datapoint found is the 2010 NYC Comptroller audit ("nearly one-fifth of all sampled elevators were not inspected in 2009"), which is sixteen years old and predates Local Law 126. **Mandated is not the same as performed, and the gap between them is where both the risk and the opportunity sit.** No current compliance-rate data was located for any jurisdiction.
21. **Whether the NYC 1/1/2027 UCMP and hoistway-door retrofits are on track**, and what share of the 84,000+ device base remains non-compliant. This is a live, dateable, quantifiable capex pipeline and it is unmeasured here.
22. **Current NYC device count.** The 84,000+ figure is from April 2018; the 59,000 passenger/freight figure is from October 2010. Neither is current.
