# Retired figures — elevator & escalator

**The denylist.** Every figure below was carried by this market's work at some point
and was then retired, corrected or superseded by a named correction pass. Nothing
here may appear in a spec, a caption or a rendered document.

This file exists because `audit.mts` cannot catch these. The audit proves a figure is
*traceable*; these were traceable — to a posted deck or a prior research file — and
still wrong.

**R-EL-001 was live on LinkedIn when it was retired.** It is the reason this file
exists on day one of the market rather than after the first correction pass.

Read by `scripts/studio/retired-check.mjs`. Format is fixed — each entry is a `###`
heading followed by the four fields, in order.

- `pattern` — a literal string, matched case-insensitively, dash forms folded.
- `requires` — pipe-separated words; at least one must appear near the pattern.
- `ledger` — the correction pass that retired it.
- `verdict` — what to do when it is found.

### R-EL-001 · the PE share of US elevator units
- pattern: 10%
- requires: PE|private equity|sponsor|unit|units|services|elevator
- ledger: A.0.1
- verdict: RETIRED as a citation. CORRECTED 2026-08-11 after the deck spec was recovered: the posted card DOES name a source — `elevatorworld.com · Dec 2025` — so the earlier finding that no publisher was named was wrong. What disqualifies it is narrower and still decisive: that article is paywalled (403 to direct fetch, reader proxy and Wayback) and has never been read by anyone in this practice, so its base year, its denominator, and whether PE-owned OEMs sit inside it are all unknown. The magnitude survives ONLY as the practice's own bottom-up estimate, 8–9%, which must be labelled Estimated and carry Derivation D-1. Any use must also state whether PE-owned OEMs are in the denominator — TK Elevator is Advent/Cinven-owned, and including OEMs changes the answer by an order of magnitude.

### R-EL-002 · the ~10% short form
- pattern: ~10%
- requires: PE|private equity|sponsor|unit|units|elevator
- ledger: A.0.1
- verdict: RETIRED. Same as R-EL-001 — a named but unread paywalled source. Listed separately because the tilde form is how it appeared in the posted teardown.

### R-EL-003 · units per technician per day
- pattern: 65-90
- requires: unit|units|technician|tech|day|route|density
- ledger: A.0.1
- verdict: RETIRED. Origin is CT Acquisitions, an M&A advisory selling elevator deal advisory — an interested party. Its attribution to NAEC was checked at naec.org and FALSIFIED; NAEC publishes no benchmarks at all. The figure is also implausible against a 4-visits-per-year contract structure. The sourced national ratio is ~34–39 units per mechanic, and that is a FLOOR, not a ceiling.

### R-EL-004 · NAEC as a benchmark publisher
- pattern: NAEC
- requires: benchmark|benchmarks|units per|65|90|published
- ledger: A.0.1
- verdict: CORRECTED. NAEC publishes no benchmarks. Confirmed at naec.org. Any figure attributed to NAEC is misattributed and the real publisher must be found before use.

### R-EL-005 · New York licensing authority
- pattern: Department of State
- requires: elevator|licence|license|contractor|inspector|New York
- ledger: A.0.1
- verdict: CORRECTED to New York State Department of LABOR. Elevator contractor, inspection-agency, mechanic and inspector licences are issued by NYSDOL, not the Department of State.

### R-EL-006 · NYC share of New York State elevator licences
- pattern: 55%
- requires: licence|license|NYC|New York|contractor|inspection
- ledger: A.0.1
- verdict: CORRECTED to 48.6–49.5%, computed from the licence data directly. The ~55% was a first-pass approximation from address strings.

### R-EL-007 · the NYC device count trap
- pattern: 120,000
- requires: NYC|New York|elevator|device|devices|registry
- ledger: A.0.1
- verdict: DO NOT USE as a serviceable base. 120,256 is the TOTAL RECORD count in DOB NOW; the ACTIVE device count is 93,454 and the permanent vertical-transportation base is 92,075. Using record count overstates the serviceable base by 29%. Same verdict for any figure near 120,256 presented as devices in service.

### R-EL-008 · units per mechanic stated as a ceiling
- pattern: 34-39
- requires: ceiling|maximum|at most|upper bound
- ledger: A.0.1
- verdict: CORRECTED — it is a FLOOR, not a ceiling. `research/05-operating-economics-labor.md` has this backwards. The denominator includes installation and modernization workers who carry no route, and the numerator rests on a 2007-vintage unit count; both errors push the true route figure higher. The master draft supersedes file 05 on this point.

### R-EL-009 · the OEM / independent ownership split
- pattern: 60%
- requires: OEM|OEMs|hold|share|units|independent|independents
- ledger: A.0.1
- verdict: RETIRED — conflicts with a primary source. Otis's 10-K states independents hold approximately 50% of service units; the posted card says OEMs ~60% and independents ~30%, from a paywalled trade article this practice has never read. A company filing outranks it. Note also that the posted 10/60/30 sums to exactly 100%, which no real ownership estimate does.

### R-EL-010 · the independent share
- pattern: 30%
- requires: independent|independents|hold|share|units|OEM
- ledger: A.0.1
- verdict: RETIRED. Same card, same unread source, same conflict with Otis's ~50%.

### R-EL-011 · the 2021 platform deal peak
- pattern: 40 deals
- requires: 2021|peak|platform|PE|transactions
- ledger: A.0.1
- verdict: UNVERIFIED — do not restate. Traced only to the paywalled Elevator World article. Our own register verified 10 PE service platforms with dated add-ons and nothing reproducing a peak of 40.

### R-EL-012 · platform retention above 90%
- pattern: 90%
- requires: retention|customer|platform|book|books|sticky
- ledger: A.0.1
- verdict: UNVERIFIED and directionally wrong. The only disclosed retention in this market is Otis's own — the OEM's own book, the best case — and it FELL from 93.5% to 92.4%, with management saying a return to 94% "will take sustained time."

### R-EL-013 · the route-density illustration
- pattern: 8 stops
- requires: route|density|stops|margin|payroll
- ledger: A.0.1
- verdict: NO SOURCE. The posted diagram renders "5 stops / route" against "8 stops / route" as a measured bar chart with no source line. The point survives and is now far better evidenced — NYC device data shows 3,072 buildings holding 34.5% of all devices at 10.5 devices each — but these two numbers were illustrative and were presented as measurements.

### R-EL-014 · the fabricated Otis retention quotation
- pattern: sustained time
- requires: retention|94%|Otis|Marks|return
- ledger: A.0.3
- verdict: RETIRED — FABRICATED. No transcript contains "will take sustained time." Marks said close to the opposite: "So, I do believe you'll see the retention rate go up again." The 94% came from analyst Jeffrey Sprague recalling 2022. The 93.5% → 92.4% figures DO verify and may be used; the sentence may never be quoted again.

### R-EL-015 · the NEBA "1:1 hard cap"
- pattern: hard cap
- requires: NEBA|apprentice|apprentices|helper|helpers|mechanic|1:1|ratio
- ledger: A.0.3
- verdict: CORRECTED. Article X ¶2 caps Helpers, Apprentices AND Assistant Mechanics against Mechanics "on any one job, except on jobs where two teams or more are working." Three classifications, per job, with an express exception. The growth-ceiling argument survives; the phrase "hard cap" does not.

### R-EL-016 · Otis portfolio growth stated annually
- pattern: fourth consecutive year
- requires: Otis|portfolio|maintained|4%|grew
- ledger: A.0.3
- verdict: CORRECTED to "4% for the fourteenth consecutive quarter" (Marks, Q4 2025 call). No source states the annual form.

### R-EL-017 · Otis US share of revenue
- pattern: 29.1%
- requires: Otis|US|net sales|total|4,192
- ledger: A.0.3
- verdict: CORRECTED to 29.0%. 4,192 ÷ 14,431 = 29.05%. A rounded figure is a different figure.

### R-EL-018 · employees per establishment, all construction
- pattern: 9.52
- requires: establishment|establishments|construction|employees|per
- ledger: A.0.3
- verdict: CORRECTED to 9.32. 785,917 is the FIRM count, not establishments (803,120). Note this was itself a correction of an earlier 9.3 — a correction-to-another-guess, caught on its second occurrence. The 238290 side was never obtained at all, so the "18.4 vs 9.3" contrast remains withdrawn.

### R-EL-019 · KONE's 2010 Oregon acquisition
- pattern: Oregon Elevator
- requires: KONE|2010|acquire|acquired|acquisition
- ledger: A.0.3
- verdict: CORRECTED to Reliant Elevator Co. The source said "an elevator service company in Oregon"; a description was read as a company name. Never generate or infer a company name.

### R-EL-020 · the Florida A17.3 deferral date
- pattern: 8/1/2029
- requires: Florida|61C|A17.3|defer|deferred|enforcement
- ledger: A.0.3
- verdict: RETIRED — no 2029 date exists in Rule 61C-5.001. §3.10.12 moves to 8/1/2025; the separate deferral for §§3.8.5, 3.10.13, 3.10.14, 3.13.1 and 3.13.2 runs to 8/1/2028.

### R-EL-021 · the EC cartel scope formula
- pattern: sale, installation, maintenance and modernisation
- requires: Commission|COMP|cartel|38.823|scope|European
- ledger: A.0.3
- verdict: RETIRED — that formula does not appear in the decision. The Official Journal carries the opposite qualification for Germany, which is €617m of the €992m: "services were not directly part of the cartel agreements." Do not present the European case as a service-market precedent.

### R-EL-022 · Otis's ~50% independents used as a US figure
- pattern: 50% of service units
- requires: US|U.S.|United States|domestic|American
- ledger: A.0.3
- verdict: SCOPE ERROR. The sentence is real and verbatim but sits under Competition, scoped "in most of our local geographies", and is unchanged boilerplate across five 10-Ks. It is GLOBAL. It may be quoted as a global statement; it may NOT be used to measure the United States, and no US OEM-versus-independent split may be derived from it.

### R-EL-023 · the NEBA signatory count
- pattern: seven major OEMs
- requires: NEBA|agreement|sign|signed|signatories
- ledger: A.0.3
- verdict: NOT FOUND on verification. Withdrawn.

### R-EL-024 · Otis service share of sales
- pattern: 35% of its sales
- requires: service|Service|Otis|segment|profit
- ledger: A.0.4
- verdict: RETIRED — FALSE as written. Service is 65.4% of Otis's sales (9,442 ÷ 14,431); 35% is NEW EQUIPMENT. The sentence inverted the argument it was making. "New equipment is 35% of sales and 9% of segment profit" is the true and stronger form. Every component was individually verified and the assembled sentence was not — check composed claims, not just figures.

### R-EL-025 · the A17.3 adoption count
- pattern: twelve states
- requires: A17.3|adopt|adopted|retroactive|modernization
- ledger: A.0.4
- verdict: CORRECTED to nine states on their own instruments, plus Vermont from a summary source. New York City and Chicago are CITIES and were being counted as states.

### R-EL-026 · New York unfiled five-year tests
- pattern: 10,000
- requires: five-year|Category 5|CAT5|never filed|unfiled|New York|NYC
- ledger: A.0.4
- verdict: CORRECTED to 8,442. The 10,000 summed Category 5 never-filed (8,442) with Category 1 never-filed (1,691), two populations that may overlap.
