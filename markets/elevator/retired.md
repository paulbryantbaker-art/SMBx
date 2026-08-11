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
