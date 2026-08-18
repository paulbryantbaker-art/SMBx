<!-- run: 12 | hunt: B | date: 2026-08-11
     query: state-by-state ASME A17.3 adoption (FL, OH, NY, CA, PA, GA, NC, MI, VA, CO, AZ, MD, MN, MO, TN, WI);
            QEI certified inspector population + accredited certifying bodies under ASME QEI-1;
            IUEC LM-2 file 000-197 via OLMS olmsapps.dol.gov + IUEC Local 1 + NEIEP completions
     tool: web search + fetch -->

# Run 12 — A17.3 state adoption, the QEI population, IUEC from the primary source

**Access note, stated up front because it bounds three findings below.** In this
container `curl` reached **no** external host (all connections refused by the
session egress policy; `olmsapps.dol.gov`, `www.dol.gov`, `enforcedata.dol.gov`,
`www.naesai.org`, `www.asme.org` and `regulations.justia.com` are all recorded as
`connect_rejected — gateway answered 403 to CONNECT` in the proxy's own failure
log). All work below was therefore done through server-side fetch/search, which
has its own limit: `olmsapps.dol.gov/query/orgReport.do` fails robots/TLS
preflight on every attempt. That is why GAP 3 ends where it does, and it is a
tooling limit, not a finding about the filing.

---

## GAP 1 — ASME A17.3 state adoption

### The state-by-state table

Legend for **Retroactive force** — this is the column that matters commercially.
`YES` = the state compels existing units to reach a baseline on a clock.
`ADOPTED, NOT RETROACTIVE` = A17.3 is named as an approved standard but the
state has expressly disclaimed retroactive application, or exempted the existing
stock, so it forces no capex until an alteration is triggered.

| State | A17.3 adopted | Edition | Citation | Compliance deadline | Retroactive force | Basis |
|---|---|---|---|---|---|---|
| **Florida** | **YES** | **A17.3-2020** | **Rule 61C-5.001(2), F.A.C.** | **§3.10.12 moved from 12/31/2023 to 8/1/2025; enforcement deferred to 8/1/2029** | **YES** | Instrument (DBPR chapter PDF, dated 25 May 2026) |
| **Ohio** | **YES** | **A17.3-2020** | **OAC 4101:5-3-01** (Title 4101:5 — Elevators: Elevator Code), eff. 7/1/2024 | None | **ADOPTED, NOT RETROACTIVE** — see 4101:5-3-02(B) | Instrument (codes.ohio.gov) |
| **Georgia** | **YES** | **A17.3-2020** | **Rule 120-3-25-.02(c)(3)**; schedule at 120-3-25-.15 | **§3.10.12 by 1/1/2025**; door restrictors (2.7.5) 2 yr; hydraulic 4.3.3 5 yr; escalator 5.1.11 2 yr | **YES** | Instrument + OCI Bulletin 23-EX-5 (17 Apr 2023) |
| **Michigan** | **YES** | **A17.3-2017** | **R 408.7003** ("The following standards are adopted by reference") | Not stated in rule | Adoption confirmed; retroactive force NOT established | Instrument (Michigan Elevator Rules, via Justia) |
| **Colorado** | **YES** (qualified) | Edition not named in rule ("currently-adopted edition") | **7 CCR 1101-8-2-7** | None | **ADOPTED, NOT RETROACTIVE** — pre-7/1/2008 stock exempt | Instrument (via Justia) |
| **Idaho** *(bonus)* | **YES** | **A17.3-2015** | Idaho DOPL adopted-codes list; IDAPA cite not stated on page | Not stated | Undetermined | State agency page (not the IDAPA instrument) |
| **New York City** *(city, not state)* | **YES** | **A17.3-2002** (2016 DOB notice) / **A17.3-2015** (current Appendix K Ch. K3 title) — **both retained, see below** | NYC Building Code **Appendix K, Chapter K3**, §3.10.12 | **1/1/2020** | **YES** | Instrument-adjacent (NYC DOB notice, Nov 2016) |
| Chicago *(city)* | YES | A17.3-2015 | Ordinance eff. 3/28/2018 | Not stated | Undetermined | **Summary only** (NEII table, Feb 2019) |
| Vermont | YES | A17.3-2011 | Not obtained | Not stated | Undetermined | **Summary only** (NEII table, Feb 2019) |
| Illinois | YES *(prior pass)* | A17.3-2005 | 41 Ill. Adm. Code 1000.60 | "completed by January 1, 2015" | YES | Prior pass |
| Texas | YES *(prior pass)* | A17.3-2002 | 16 TAC §74.100 | — | YES | Prior pass |
| Washington | YES *(prior pass)* | A17.3-2015 | WAC 296-96-00650, eff. 10/1/2018 | — | YES | Prior pass |
| West Virginia | **NO** | — | Amendments eff. 5/1/2016 "deleted A17.3 reference" | — | — | **Summary only** (NEII table, Feb 2019) |
| Oregon | **NO** *(prior pass)* | — | absent from OAR 918-400-0455 | — | — | Prior pass |
| New Jersey | **NO** *(prior pass)* | — | — | — | — | Prior pass |
| Iowa | **NO** *(prior pass)* | — | — | — | — | Prior pass |
| Massachusetts | **NO** — runs own A17 modifications *(prior pass)* | own A17-2004 mods | — | — | — | Prior pass |
| New York (State) | **UNDETERMINED** | — | — | — | — | Checked: 19 NYCRR search, NEII table (blank), up.codes NYS lists A17.1-2016 only |
| California | **UNDETERMINED** | — | — | — | — | Checked: dir.ca.gov Title 8 Art. 41 (sb6a41) — covers A17.1-2004 conveyances, no A17.3 seen; index page sb6.html returned 404 |
| Pennsylvania | **UNDETERMINED** | — | 34 Pa. Code §405.2 is the operative "Standards" section | — | — | Checked: pacodeandbulletin.gov (robots-blocked), Justia (index only), casetext (403). Third-party up.codes advertises a "Pennsylvania Existing Elevator and Escalator Code 2015 based on ASME A17.3, 2015" — **not verified against the instrument** |
| North Carolina | **UNDETERMINED** | — | 13 NCAC 15 is the chapter | — | — | Checked: reports.oah.state.nc.us (robots/timeout), Justia (TOC only). up.codes advertises "North Carolina Existing Elevator and Escalator Code 2020 based on ASME A17.3, 2020" — **not verified** |
| Wisconsin | **UNDETERMINED** | — | SPS 318.1801 / SPS 318.17086 are the candidate sections | — | — | Checked: docs.legis.wisconsin.gov (robots), Cornell LII (rate-limited 429 on three attempts) |
| Virginia | **UNDETERMINED** | — | — | — | — | Not reached this run |
| Arizona | **UNDETERMINED** | — | — | — | — | NEII (2019) notes "Moratorium on rulemakings"; A17.3 column blank |
| Maryland | **UNDETERMINED** | — | — | — | — | Search returned no COMAR instrument |
| Minnesota | **UNDETERMINED** | — | — | — | — | Not reached this run |
| Missouri | **UNDETERMINED** | — | — | — | — | Not reached this run |
| Tennessee | **UNDETERMINED** | — | — | — | — | Not reached this run |

**Tally.** Adopted and confirmed from the instrument this run: **Florida, Ohio,
Georgia, Michigan, Colorado** (+ Idaho as a bonus, + New York City). Adopted per
prior passes: Illinois, Texas, Washington. Adopted per summary source only:
Chicago, Vermont. Confirmed negative: Oregon, New Jersey, Iowa, Massachusetts
(own modifications), West Virginia (summary source). **Undetermined: 11** — New
York State, California, Pennsylvania, North Carolina, Wisconsin, Virginia,
Arizona, Maryland, Minnesota, Missouri, Tennessee.

---

### The instruments, quoted

#### Florida — A17.3-2020, with the only live statewide deadline found

Rule 61C-5.001, Florida Administrative Code (Division of Hotels and Restaurants,
DBPR). Source document: `61C-5Combined.pdf`, Florida Elevator Safety Code
Administrative Rules, **dated May 25, 2026**, published at
`www2.myfloridalicense.com/hr/statutes/documents/61C-5Combined.pdf`.

Adoption, quoted:

> "ASME A17.3-2020, Safety Code for Existing Elevators and Escalators, with the
> following exclusions and changes"

The same rule adopts, for new work, "ASME A17.1-2019, Safety Code for Elevators
and Escalators," and "ASME A18.1-2020, Safety Standard for Platform Lifts and
Stairway Chairlifts."

The deadline, quoted:

> "The effective date for Section 3.10.12 (System to Monitor and Prevent
> Automatic Operation of the Elevator with Faulty Door Contact Circuits) of ASME
> A17.3-2020 is changed from December 31, 2023, to August 1, 2025"

> "Compliance with Section 3.10.12 may not be enforced until August 1, 2029"

**Read this carefully — the two dates do different things.** The *requirement*
bites on 1 August 2025; *enforcement* is withheld until 1 August 2029. So Florida
has a mandate in force now with a four-year enforcement grace. For a modernization
book that is a demand shelf with a known end date, not a demand spike.

**What §3.10.12 actually is.** Door-contact-circuit monitoring — a control system
that detects a failed door contact and prevents the car running with the doors
unlocked. It is a controller-level retrofit, which is why it tends to pull a
larger modernization scope along with it on older equipment.

Note also: Florida rule **61C-5.0012, "Electrolysis Protection,"** — the hydraulic
cylinder corrosion item — appears in the chapter as a **repealed** rule title.
Florida no longer carries that requirement.

#### Ohio — adopted, and expressly not retroactive

Two rules, and the second one undoes the commercial reading of the first.

OAC **4101:5-3-01**, "Accepted engineering practice and approved standards,"
effective **1 July 2024**, in **Title 4101:5 — Elevators: Elevator Code**. The
adoption line, quoted from the Board of Building Standards rule document
(`dico_bbs_elevator_rules_eff_july_1.pdf`, dated 31 May 2024) which shows the
edition change in strike/bold as `20152020`:

> "ASME A17.3 (Note c) 2020 Safety Code for Existing Elevators and Escalators."

So Ohio moved from A17.3-2015 to **A17.3-2020** effective 1 July 2024.

OAC **4101:5-3-02**, "Resolution of conflicts," paragraph (B), quoted in full:

> "The rules of the board are not to be retroactively applied to existing
> elevators that are not otherwise being altered or repaired. Portions of an
> elevator not altered and not affected by an alteration are not required to
> comply with the code requirements for a new elevator."

**Ohio therefore adopts A17.3 as a reference standard but forces no upgrade
capex.** A17.3 bites only when the unit is already being altered or repaired.
This is the single most important correction in this run: Ohio would have been
recorded as an adopting state on the strength of 4101:5-3-01 alone, and the
modernization-driver inference would have been wrong.

Separately, Ohio's elevator *operations* chapter — OAC **1301:3-6** (Department
of Commerce, Division of Industrial Compliance; certificates of operation,
inspections, certificates of competency) — references **A17.1-2016** only, and
contains no A17.3 adoption. Rule 1301:3-6-04 applies periodic safety tests "in
accordance with the standards established in the 'Safety Code for Elevators and
Escalators,' ASME A17.1-2016."

#### Georgia — A17.3-2020 with a real retroactive schedule

Rules and Regulations of the State of Georgia, Office of the Commissioner of
Insurance and Safety Fire, **Subject 120-3-25**, "Rules and Regulations for
Escalators and Elevators" (`rules.sos.ga.gov/gac/120-3-25`).

Adoption, quoted from Rule **120-3-25-.02(c)(3)**:

> "ASME A17.3, 2020 Edition of the Safety Code for Existing Elevators and
> Escalators, with such revisions, amendments, and interpretations thereof as are
> made, approved and adopted by the Standards Committee."

And Rule **120-3-25-.10(1)(a)**:

> "Freight elevators with operating stations in the car, which allow personnel to
> ride shall comply with ASME A17.3, the standards for existing elevators."

Rule **120-3-25-.15** carries the phase-in. As summarised from the rule text
(the sub-paragraph numbering is quoted; the intervals are quoted; the anchor date
for each interval is **not** stated in the text I retrieved):

| Sub-paragraph | Item | Interval |
|---|---|---|
| 120-3-25-.15(5) | Hydraulic elevator compliance with **Section 4.3.3** | within **five (5) years** |
| 120-3-25-.15(6) | Escalator **Performance Step Indexing**, Rule 5.1.11 | within **two (2) years** |
| 120-3-25-.15(8) | **Restricted hoistway/car door openings** (door restrictors), Rule 2.7.5 | within **two (2) years** |
| 120-3-25-.15(9) | Automatic passenger/freight elevator compliance with **Section 3.10.12** | within **three (3) years** |

The anchor date is supplied by the regulator's own bulletin. **Georgia OCI
Bulletin 23-EX-5**, "Regulations pertaining to existing elevator door lock
monitoring," **dated 17 April 2023**:

- Code section: **ASME A17.3 Section 3.10.12**
- Requirement: "System to Monitor and Prevent Automatic Operation of the Elevator
  with Faulty Door Contact Circuits"
- **Compliance deadline: January 1, 2025** — "within three years of the rule's
  effective date"

**Georgia is the cleanest example in the set of A17.3 functioning as a
modernization forcing function**, and unlike Florida the deadline has already
passed. Note in particular 120-3-25-.15(5): a five-year clock on hydraulic
Section 4.3.3 is the expensive one, since that is where jack/cylinder work lives.

#### Michigan — A17.3-2017 adopted by reference

Michigan Elevator Rules, Bureau of Construction Codes, Elevator Safety Board.
Rule **R 408.7003**, "Applicability of national standards," quoted:

> "Rule 3. The following standards are adopted by reference."

The list includes **"ASME A17.3-2017 safety code for existing elevators and
escalators"** (the rule states the standard's purchase price as $168.00 — that is
the code book, not an upgrade cost). The rule as retrieved does not state a
separate effective date for this standard, and **does not establish whether
Michigan applies it retroactively.** Recorded as adopted; retroactive force
undetermined.

#### Colorado — adopted, existing stock exempted

**7 CCR 1101-8-2-7**, "Implementation of Adopted Standards," Colorado Department
of Labor and Employment. Quoted:

> "All conveyances installed prior to July 1, 2008 are exempt from complying with
> the currently-adopted edition of ASME A17.3 unless one of the following
> conditions exists"

The two triggering conditions are substantial alteration, or presentation of
material risk. And when triggered, the rule points at A17.1, not A17.3:

> "Any Alteration that is a result of the conditions listed above shall conform to
> the currently-adopted edition of ASME A17.1"

The rule does not name an A17.3 edition — it says "currently-adopted edition."
**Colorado is functionally a non-retroactive state**: the exemption covers
everything installed before 1 July 2008, which is the entire population A17.3
exists to address.

#### New York City — a genuine retrofit mandate, with an edition conflict

NYC adopts A17.3 through **Appendix K, Chapter K3 of the New York City Building
Code** ("Modifications to ASME A17.3, Safety Code for Existing Elevators and
Escalators").

From the NYC Department of Buildings notice on the door monitor circuit
(`nyc.gov/assets/buildings/pdf/elevator-door-monitor-circuit.pdf`, **dated
November 2016**), quoted:

> "ASME A17.3 of 2002, as modified by Chapter K3 of Appendix K Section 3.10.12 of
> the New York City Building Code"

> Compliance deadline: **"January 1, 2020"**

**Conflict, both values kept per citation law.** The 2016 DOB notice says
**A17.3-2002**. The current Appendix K chapter is titled "Modifications to ASME
**A17.3-2015**, Safety Code for Existing Elevators and Escalators." These are
consistent with a code-cycle change between the 2014 and 2022 editions of the NYC
Building Code rather than a contradiction, but I did not retrieve the Appendix K
text itself (amlegal renders client-side and returned metadata only; up.codes is
robots-blocked), so **which edition is in force today is not confirmed from the
instrument.** Both are recorded.

The 1 January 2020 deadline is the operative fact for the New York metro cut: the
door-monitoring retrofit obligation on the existing NYC stock is **already past
due**, not forthcoming.

#### The NEII table — what it is, and why its A17.3 column cannot be used alone

`nationalelevatorindustry.org/wp-content/uploads/2019/08/CodeAdoption.pdf` —
"Stateside Code Update Report," **February 2019**, published by **National
Elevator Industry, Inc. (NEII)**. *Interest disclosed: NEII is the trade
association of the elevator OEMs and major maintenance providers — the
constituency that sells the modernization work a code adoption creates.*

It is a 50-state table, and it is the closest thing to a national adoption
register that exists. But it is built for **A17.1 and A17.7**. Its A17.3 column is
populated for only three jurisdictions — **Chicago (A17.3-2015), Vermont
(A17.3-2011), Washington (A17.3-2015)** — plus a note that West Virginia
"deleted A17.3 reference" effective 5/1/2016.

**It is blank for Florida, Georgia, Ohio, Michigan, Illinois and Texas, all six of
which do adopt A17.3.** So the column is not a negative signal, and a state's
absence from it means nothing. This is direct evidence for the earlier pass's
conclusion that no published national A17.3 adoption table exists — the industry's
own tracker does not attempt one. The table is also **seven years stale**: it puts
Ohio at A17.1-2016 and Florida at A17.1-2013, where the instruments now show
A17.3-2020 in both.

Used here only to corroborate Chicago, Vermont and West Virginia, each labelled
**summary source, not instrument**.

---

### Cost figures for the retroactive upgrade items — still not found

**UNDETERMINED, and I now think it is unpublished rather than merely unfound.**

Searched for published unit costs on the three expensive A17.3 items — door
restrictors, firefighters' emergency operation, hydraulic cylinder replacement —
across the regulators that mandate them and the standards bodies. No state
regulator quantified compliance cost in any instrument retrieved: Florida's rule
sets dates without a fiscal note in the chapter PDF, Georgia's Bulletin 23-EX-5
states the requirement and the deadline and no cost, and NYC's DOB notice
likewise.

The only dollar figure encountered in any instrument this run is **$168.00**,
Michigan's stated purchase price for the ASME A17.3-2017 code book (R 408.7003) —
which is the price of the standard, not of compliance with it.

Where cost figures do circulate they are on elevator-consultancy and
service-contractor marketing pages, which are commercial publishers with a direct
interest in the size of the number. None is quoted here. If this line is worth
closing, the route is a state regulatory-impact/fiscal-note filing attached to one
of the adopting rulemakings — Florida's or Georgia's rule packages are the
candidates — not a web search.

---

## GAP 2 — The QEI population

### How many QEI-certified inspectors are there in the US?

**UNDETERMINED. No count is published by any of the certifying bodies, and the
public roster does not expose one.**

What was established:

**There are three accredited certifying organizations, not one.** From NAESA
International's own FAQ (`naesai.org/faq`), quoted:

> "NAESA and the two other ANSI National Accreditation Board (ANAB) 17024
> accredited organizations"

NAESA states the number (three) but **does not name the other two** on that page.
On the evidence gathered they are almost certainly the **National Association of
Elevator Contractors (NAEC)**, which issues a "NAEC Qualified Elevator Inspector
(QEI)" credential (it maintains a Credly badge page for it), and the **Qualified
Elevator Inspector Training Fund (QEITF)** at `qeitf.org`, which runs CEI and CEIS
certifications and a Prolydian-hosted certificant portal at
`inspectors.qeitf.org`. **Both identifications are inference from the credential
pages, not confirmed against an ANAB accreditation register** — recorded as such.
This matters on its own: a QEI count taken from NAESA alone would undercount the
population by whatever the other two bodies certify.

**Every route to a count was closed:**

| Route | Result |
|---|---|
| NAESA roster, `naesai.org/search` | Renders "Search Certified Inspectors" with no browsable roster, no result count, no total. Requires a query; returns no aggregate. |
| NAESA FAQ | Fee and renewal only. No population figure. |
| NAEC via Credly badge page | Credly commonly shows an earner count; **this badge page does not disclose one**. |
| QEITF `inspectors.qeitf.org` | Describes CEI/CEIS programs; **is not a public directory** and shows no certificant count. |
| O*NET certification record 13551-B | Confirms certifier "NAESA International," ANSI-accredited. **"The webpage contains no information regarding how many individuals currently hold or have obtained this certification."** |

Confirmed detail: NAESA's QEI training course and certification exam is
**$1,295**, quoted from the FAQ — "the cost for this is $1295 and includes
membership with a passing score."

### Age / retirement profile

**UNDETERMINED. No age or retirement data exists for the QEI population
specifically.**

The structural reason is worth recording, because it tells you the claim cannot be
sourced the way the fire & life safety equivalent was: **there is no separate BLS
occupation code for elevator inspector.** QEIs fall inside SOC **47-4011,
Construction and Building Inspectors**, alongside every other building inspector.
The nearest usable proxy is BLS CPS Table 11b, "Employed persons by detailed
occupation and age" (current table year **2025**) for 47-4011 — I confirmed the
table exists and covers 2025 but could not extract the 47-4011 row (the fetch
truncated in the healthcare block before reaching construction occupations).

**So the fire & life safety analogue — "an ageing certified-inspector
population" — cannot currently be made for elevator, and should not be asserted.**
The honest version available today is narrower and still useful: the certifying
infrastructure is three small private bodies, certification runs about $1,295 a
head, and none of them publishes how many people hold the credential.

### How many states require a QEI specifically?

**UNDETERMINED — not systematically surveyed this run.** One confirmed data point
picked up incidentally: **Idaho** adopts **"ASME QEI – 1 2018 Standard for the
Qualification of Elevator Inspectors"** on its DOPL adopted-codes list, alongside
A17.1-2022 and A17.3-2015. Ohio operates a parallel but distinct mechanism —
OAC 1301:3-6-02 issues state **"certificates of competency,"** which is a state
credential rather than a QEI reference. That contrast is the reason the question
needs a proper survey: "requires a QEI" and "licenses its own inspectors" are
different regimes and a count that conflates them would be wrong.

---

## GAP 3 — IUEC membership from the primary source

### What was established

**The filing exists and is identified.** Searching the OLMS disclosure index
returned the report-level URLs directly, which confirms both the file number and
the fiscal year:

| Body | OLMS file number | Latest LM-2 | Report URL |
|---|---|---|---|
| **IUEC (national)** | **000-197** | **LM-2, period ending 06/30/2025** | `olmsapps.dol.gov/query/orgReport.do?rptId=923620&rptForm=LM2Form` |
| **IUEC Local 1 (New York)** | **047-117** | **LM-2, period ending 06/30/2025** | `olmsapps.dol.gov/query/orgReport.do?rptId=925791&rptForm=LM2Form` |

Prior-year IUEC national filings, same index: FY2018 `rptId=683936`, FY2019
`710564`, FY2020 `736014`, FY2021 `782530`, FY2022 `844037`.

**Two things this settles even without the filing body.** First, the earlier
pass's dead host is corrected: the live host is **`olmsapps.dol.gov`**, and the
report path is `/query/orgReport.do?rptId=<id>&rptForm=LM2Form`. Second, **IUEC's
fiscal year ends 30 June**, so "year covered 2025" means the year ended **30 June
2025** — which is a real gain, because it dates the 31,290 figure precisely rather
than to a calendar year.

**IUEC Local 1's file number, 047-117, is newly identified** and is the handle the
New York metro cut needs.

### What could not be retrieved, and why

**I could not read either filing.** `olmsapps.dol.gov/query/orgReport.do` failed
on every attempt (six, across two URL parameter orders), with robots/TLS preflight
errors; `curl` to the same host is refused outright by the session egress policy.
Note the host is *partly* reachable — `/olpdr/` and `/query/getYearlyData.do` both
fetched successfully — so this is a path-level block on the report renderer, not a
dead site. **A session with ordinary network access should get these two URLs on
the first try.**

Also unretrieved: the OLMS yearly bulk data (`2000.zip`–`2024.zip`, pipe-delimited,
listed at `/query/getYearlyData.do`), which would answer membership and receipts
for both bodies offline and is the better route next time. Note its latest year is
**2024**, so it would not yet carry the FY2025 filing.

### The membership figures — all values kept

| Value | Basis | Vintage | Status |
|---|---|---|---|
| **31,290 members** | **Center for Union Facts**, republishing the OLMS filing | "Year covered 2025" — now datable to **FY ending 30 June 2025**; page "Last Updated: April 23rd, 2026" | **Still secondary.** Not confirmed against the LM-2. |
| **28,620 members** | Wikipedia infobox, citing **US DOL, Office of Labor-Management Standards**, report submitted **28 September 2018**, **file number 000-197** | 2018 | Secondary, but independently corroborates the file number 000-197 |
| **"over 25,000"** | Wikipedia body text | undated | Secondary, undated |
| **"30,000+ across the US and Canada"** | **IUEC's own site** | undated | Self-reported; **note it is US + Canada**, so not directly comparable to a US-only LM-2 figure |

*Interest disclosed: the **Center for Union Facts** is a project of Berman and
Company, an anti-union advocacy organisation. It republishes DOL filings, and
nothing here suggests the number is wrong — but it is an advocacy publisher and
the figure has still not been checked against the filing it claims to reproduce.*

**Receipts: UNDETERMINED.** No receipts figure was obtained for IUEC national from
any source, primary or secondary.

**Net position on GAP 3: the figure did not move, but its provenance did.** 31,290
is still Center for Union Facts, not OLMS. What is new is the exact filing
address, the correct host, the fiscal-year end, and Local 1's file number.

### NEIEP annual apprenticeship completions

**UNDETERMINED.** NEIEP (National Elevator Industry Educational Program) publishes
course catalogues, recruitment pages and apprenticeship openings at `neiep.org`,
and Thomas Edison State University's Office of Professional Learning Review
carries a NEIEP credit-review client page — but **no completion or graduation
counts** appear on any of them.

The route not yet run, and the one most likely to work: **DOL's RAPIDS**
(Registered Apprenticeship Partners Information Database System). NEIEP programs
are registered apprenticeships, so completions should be extractable from the
**RAPIDS dataset on `catalog.data.gov`** or the "Apprentices by State" dashboard on
`apprenticeship.gov`, filtered to the elevator constructor occupation. Both were
identified this run; neither was queried, because `dol.gov` hosts are blocked in
this container. This remains the growth ceiling for the trade and is worth one
dedicated pass with working network access.

---

## What we don't know yet

1. **Eleven of the sixteen named states are still open** — New York State,
   California, Pennsylvania, North Carolina, Wisconsin, Virginia, Arizona,
   Maryland, Minnesota, Missouri, Tennessee. For four of them the exact instrument
   is already identified and only the text is missing: **PA 34 Pa. Code §405.2**,
   **NC 13 NCAC 15**, **WI SPS 318.1801 / 318.17086**, **CA Title 8 Elevator
   Safety Orders** (the article covering pre-2008 conveyances, which is not
   Article 41). Each was blocked by robots, IP-block, 403 or rate limit — not by
   absence of a source.
2. **Whether "adopted" means anything in Michigan and Idaho.** Both name an A17.3
   edition; neither instrument retrieved says whether it applies retroactively.
   Ohio and Colorado both adopt A17.3 *and* disclaim retroactive effect, so the
   default assumption has to be that adoption alone proves nothing about forced
   capex. **This is the single biggest analytical risk in the section**: an
   "A17.3 adoption count" used as a modernization-demand proxy would silently
   include states that compel nothing.
3. **Which A17.3 edition New York City is actually on** — 2002 per the 2016 DOB
   notice, 2015 per the current Appendix K chapter title. Both are carried above;
   the Appendix K text itself resolves it.
4. **The anchor date for Georgia's 120-3-25-.15 intervals.** The bulletin fixes
   §3.10.12 at 1 January 2025. The 2-year door-restrictor and 5-year hydraulic
   clocks are quoted as intervals with no start date in the text retrieved.
5. **Any published cost for a door restrictor, an FEO retrofit, or a hydraulic
   cylinder replacement.** Two passes have now failed. Next attempt should be a
   state fiscal note or regulatory-impact statement attached to the Florida or
   Georgia rulemaking, not a search.
6. **The size of the QEI population**, and whether it is ageing. Neither is
   published. The fire & life safety analogue does not transfer, and the elevator
   labour finding should not lean on it until SOC 47-4011 age data is pulled — and
   even then it is a proxy for all building inspectors, not for QEIs.
7. **The names of the two non-NAESA ANAB-accredited certifying bodies**, confirmed
   against an accreditation register rather than inferred from credential pages.
8. **How many states require a QEI specifically** versus licensing their own
   inspectors — Idaho does the former, Ohio the latter, and nothing else was
   surveyed.
9. **IUEC's actual LM-2 numbers.** Two URLs, both known, both unread:
   `rptId=923620` (national, 000-197) and `rptId=925791` (Local 1, 047-117). Also
   unread: total receipts, which no source has supplied at all.
10. **NEIEP completions** — try the RAPIDS dataset on catalog.data.gov.
11. **Whether the network limits here distorted the map.** The states that came
    back confirmed are disproportionately those whose codes sit on fetchable
    hosts. Florida, Ohio, Georgia and Michigan are real findings; the eleven
    UNDETERMINED rows carry no information either way and must not be read as
    soft negatives.
