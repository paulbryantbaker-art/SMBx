<!-- run: 08 | hunt: B | date: 2026-08-11
     query: ASME A17.3 state adoption (published tables + 12 state administrative codes);
            NAICS 238290 establishments by employment size band (Census ecnbasic/CBP/SUSB/QCEW);
            QEI inspector population and certifying bodies (ASME QEI-1, NAESA, NAEC);
            IUEC membership from DOL OLMS primary filing
     tool: Census API + OLMS + web search + fetch -->

# Run 08 — Gap Sweep: Code Adoption, Census Fragmentation, QEI, IUEC

## Session tooling constraint (read first — it bounds every slot below)

This pass ran under an egress policy that materially limited retrieval. Recording it
because it determines which slots are "empty because unpublished" versus "empty because
unreachable" — those are different findings and must not be conflated.

- `curl`/Bash HTTPS returned **HTTP 403 on CONNECT** for every research host tested:
  `api.census.gov`, `www.census.gov`, `www2.census.gov`, `data.census.gov`, `www.bls.gov`,
  `data.bls.gov`, `www.dol.gov`, `olmsapps.dol.gov`, `enforcedata.dol.gov`, `www.asme.org`,
  `www.naesai.org`, `regulations.justia.com`, `www.ecfr.gov`, `law.cornell.edu`,
  `www.tdlr.texas.gov`. Only `api.github.com`, `raw.githubusercontent.com` and `pypi.org`
  were reachable from the shell.
- The web-fetch tool **did** reach HTML/JSON on those hosts, but it (a) obeys `robots.txt`,
  (b) cannot retrieve `.xlsx` or `.zip` binaries, and (c) passes content through a
  summarising model, so long tables truncate.
- The web-search tool's session budget was exhausted (200/200) before this pass began, so
  **no keyword search was available**. All retrieval below was by direct URL construction.

Consequence: bulk statistical files (SUSB `.xlsx`, CBP `.txt`, QCEW `.zip`, OLMS `.zip`)
were structurally undownloadable this pass, regardless of whether they exist.

---

# SLOT 1 — ASME A17.3 state adoption map

**Status: PARTIALLY FILLED.**

Four states resolved to a quoted rule (3 adopt, 1 does not); three further states returned
informative negatives; five were attempted and not reached. No published national adoption
table was located.

## 1.1 What A17.3 is, from the publisher

ASME product page for A17.3, **current edition A17.3–2023**. Scope, quoted verbatim:

> "This Code is intended to serve as the basis for state and local jurisdictional
> authorities in adopting retroactive requirements for existing elevators and escalators
> to enhance the safety of the general public."

- Publisher: ASME. Vintage: 2023 edition (page accessed 2026-08-11).
- URL: https://www.asme.org/codes-standards/find-codes-standards/a17-3-safety-code-existing-elevators-escalators
- Basis: **Disclosed**.

This confirms the underwriting premise: A17.3 is drafted expressly as *retroactive*
requirements, in contrast to A17.1 which governs new installations. The commercial
question is therefore purely one of adoption, and adoption is jurisdictional.

## 1.2 Search for a published adoption table — result: NONE FOUND

| Source attempted | URL | Outcome |
|---|---|---|
| NEII codes & standards | https://www.neii.org/codes-and-standards/ , https://www.neii.org/codes-standards/ , https://www.neii.org/ | `robots.txt` fetch failed (ConnectTimeout) on the two code pages; homepage retrieved but contains **no** code-adoption map or A17.3 reference |
| ASME state adoption | https://www.asme.org/codes-standards/publications-information/state-adoption | **404** |
| NAESA International | https://www.naesai.org/ (full nav enumerated), https://www.naesai.org/state-information | Nav lists Inspector Search, QEI certification, directories, resources — **no** state code-adoption resource; `/state-information` **404** |
| Justia federal regulation search, `"ASME A17.3"` | https://regulations.justia.com/search?query=%22ASME+A17.3%22 | "We couldn't find any regulations under the given parameters" (this index is federal-only; it does not cover state administrative codes) |

**Finding: no publicly accessible, current, national A17.3 adoption table was found.** This
is itself a defensible result — it means the artifact does not exist in published form and
must be built state-by-state, which is why it is worth building.

Caveat on strength of this negative: with keyword search unavailable this pass, the
conclusion rests on direct checks of the four organisations most likely to publish such a
table (ASME as publisher, NEII as the OEM trade body, NAESA as the inspector body, Justia
as a code aggregator). A trade-press compilation (e.g. Elevator World) may exist and was
not reachable.

## 1.3 State-by-state, from the states' own administrative codes

### ADOPTS A17.3

**ILLINOIS — adopts ASME A17.3–2005, with a hard retroactive deadline.**
41 Ill. Adm. Code 1000.60 (Illinois JCAR).
URL: https://www.ilga.gov/commission/jcar/admincode/041/041010000000600R.html

- Edition adopted: "Safety Code for Existing Elevators and Escalators (ASME A17.3-2005)".
- Compliance deadline: upgrades to be **"completed by January 1, 2015"**, with an earlier
  enforcement option of **January 1, 2013**.
- Retroactive items the state pulled from A17.3–2005: hoistway/car door restrictions; car
  illumination; emergency signalling devices; phase reversal protection; power-operated
  door reopening devices; pit stop switches; pit ladders.
- Carve-out: firefighters' emergency operation and hydraulic elevator cylinders per
  A17.3–2005 §4.3.3(b) "are not required to be upgraded unless" there is controller
  alteration, equipment failure, or public safety risk.
- Forward reference: alterations made after adoption must comply with
  ASME A17.1-2019/CSA B44-2019.
- Basis: **Disclosed**.

This is the cleanest example of the mechanism: a dated retroactive deadline attached to a
named item list. Note the deadline has passed (2015), so in Illinois the modernisation
wave this triggered is historic, not forward — the relevant forward question there is
enforcement of the carve-out triggers (controller alteration, equipment failure).

**TEXAS — adopts ASME A17.3–2002, still in force.**
16 Tex. Admin. Code §74.100, "Technical Requirements — ASME and ASCE Codes" (TDLR).
URL: https://regulations.justia.com/states/texas/title-16/part-4/chapter-74/section-74-100/

Quoted verbatim, §74.100(a):
> "The commission adopts the standards for the installation, maintenance, repair,
> replacement, alteration, testing, operation, and inspection of equipment that are
> contained in the following codes:
> (1) ASME Code A17.1-2016/CSA B44-16 as amended in subsection (b);
> (2) ASME Code A17.3-2002;
> (3) ASME Code A18.1-2005; and
> (4) ASCE Code 21."

Quoted verbatim, §74.100(c):
> "(1) ASME Code A17.1-2016/CSA B44-16 and the amendments in subsection (b) shall be
> effective on November 1, 2018.
> (2) ASME Code A18.1-2005 shall be effective September 1, 2008.
> (3) ASME Code A17.3-2002 continues to be in effect."

- No exemption by building age and no separate A17.3 compliance date was stated in the
  retrieved text — A17.3–2002 is simply standing law.
- Basis: **Disclosed**.

**WASHINGTON — adopts ASME A17.3–2015, adoption date 10/1/2018, listed "Current".**
WAC 296-96-00650, "Adopted standards" (WA L&I).
URL: https://app.leg.wa.gov/WAC/default.aspx?cite=296-96-00650

Retrieved adopted-standards list includes:
> "Safety Code for Existing Elevators and Escalators ASME A17.3-2015" — adoption date
> "10/1/2018", status "Current".

Alongside: ASME A17.1-2019/CSA B44-19; A18.1-2020; A90.1-2015; ANSI/ASSP A10.4-2016;
ASSE/ANSI A10.5-2020; A17.2-2020; A17.6-2010.

Washington additionally maintains its **own** retroactive body of rules: WAC 296-96
**Part D, "Regulations for Existing Elevators"** (WAC 296-96-23000 et seq.), separate from
Part C ("Regulations for New and Altered Elevators", 296-96-02400 et seq.). Source for the
part structure: https://app.leg.wa.gov/WAC/default.aspx?cite=296-96

- Washington is the most current A17.3 adopter found (2015 edition).
- Basis: **Disclosed**.

### DOES NOT ADOPT A17.3 / A17.3 NOT CITED

**OREGON — A17.3 absent from the adopted model codes.**
OAR 918-400-0455, "Adopted Oregon Elevator Specialty Code".
URL: https://oregon.public.law/rules/oar_918-400-0455

The retrieved text adopts the Oregon Specialty Lift Code (2005) plus five ASME model
codes: **A17.1-2010, A17.2-2010, A17.6-2010, A18.1-2008, A90.1-2009**, effective
January 1, 2012. **A17.3 is not among them.**

Caveat, stated plainly: the text retrieved describes the *2011* Oregon Elevator Specialty
Code. OAR 918-400-0435 ("Governing Codes") establishes which edition applies by permit
date, and a later Oregon edition may exist that this pass did not reach. Treat as
"A17.3 not adopted as of the 2011 edition", not as a current-year statement.
- Basis: **Disclosed**, vintage-qualified.

**NEW JERSEY — A17.3 not cited in the elevator subcode adoption sections reached.**
N.J.A.C. 5:23-12.2 and 5:23-12.3.
URLs: https://regulations.justia.com/states/new-jersey/title-5/chapter-23/subchapter-12/section-5-23-12-2/ ,
https://regulations.justia.com/states/new-jersey/title-5/chapter-23/subchapter-12/section-5-23-12-3/

Both sections reference **ASME A17.1, A18.1, A90.1** and use open-ended language —
maintenance "shall conform to the most recent edition of ASME A18.1 or ASME A90.1, or
ASME A17.1 referenced in the building subcode". Inspection intervals are set by
Appendix N-1 rather than by A17.3. **A17.3 does not appear.**

This is a *not-found within the sections read*, not a proven statewide non-adoption — NJ
could reference A17.3 elsewhere in the Uniform Construction Code. Flagged as unresolved.

**IOWA — A17.3 not cited in the definitions rule.**
Iowa Admin. Code r. 875-71.1 (Definitions).
URL: https://regulations.justia.com/states/iowa/agency-875/chapter-71/rule-875-71-1/

Cites **ASME A17.7, ASME A17.1, ANSI/ISO/IEC 17024**. A17.3 does not appear. Chapter
875-71 contains a rule 875-71.16 "Publications Available for Review" that was not reached
and is the likely home of any incorporation-by-reference list.

### OWN RETROACTIVE CODE RATHER THAN A17.3

**MASSACHUSETTS — state-modified A17, own existing-elevator chapter.**
524 CMR chapter list, URL: https://regulations.justia.com/states/massachusetts/524-cmr/

- **524 CMR 35.00**: "Safety Code For Elevators And Escalators A17-2004 And The
  Massachusetts Modifications Of That Code".
- **524 CMR 10.00**: "Requirements for Permits and Inspections of Existing Elevators
  Undergoing Alterations and Replacements".
- **524 CMR 11.00**: "Elevators Placed Out of Service or Decommissioned".
- No separate A17.3 chapter appears in the 524 CMR chapter list. Massachusetts appears to
  regulate existing equipment through its own modifications and its alterations chapter
  rather than by adopting A17.3 wholesale. Not verified to section text.

### ATTEMPTED, NOT REACHED (named so the next pass starts here, not at zero)

| State | Citation targeted | URL tried | Why it failed |
|---|---|---|---|
| Florida | Rule 61C-5.001 F.A.C. | https://www.flrules.org/gateway/ruleNo.asp?id=61C-5.001 | Read timeout, twice |
| Ohio | elevator chapter of OAC | https://codes.ohio.gov/ohio-administrative-code/rule-1301:3-5-01 (= boilers); chapter-1301:3-3 (= bedding lab fees) | Wrong chapter; Ohio's elevator chapter not identified |
| Minnesota | Minn. R. 1307.0032 | https://www.revisor.mn.gov/rules/1307.0032/ | **Repealed**, L 2013 c 85 art 2 s 44 — successor rule not identified |
| California | Title 8 Elevator Safety Orders | https://www.dir.ca.gov/title8/sb6.html (404), sb7g1.html (wrong group) | Correct subchapter index not located |
| Pennsylvania | 34 Pa. Code ch. 405 | https://regulations.justia.com/states/pennsylvania/title-34/part-xiv/chapter-405/ | Index only, no section text |
| Virginia | 13VAC5-63 (USBC) | https://regulations.justia.com/states/virginia/title-13/agency-5/chapter-63/ | Index only (Parts I/II/III), no section text |
| Georgia | Ga. Comp. R. & Regs. 120-3-3 | https://regulations.justia.com/states/georgia/rules-and-regulations-of-the-state-of-georgia/department-120/chapter-120-3/subject-120-3-3/ | Department index only |
| Maryland | COMAR 09.12.81 | https://mdrules.elaws.us/comar/09.12.81.03 | Host returned a blocked-access page |
| Wisconsin | SPS 318 | https://docs.legis.wisconsin.gov/code/admin_code/sps/.../318 | `robots.txt` disallowed |
| Utah | Utah Admin. Code R616-2 | https://adminrules.utah.gov/public/rule/R616-2/Current%20Rules | 404 |

## 1.4 Scoreboard

| State | Adopts A17.3? | Edition | Deadline / effective | Source |
|---|---|---|---|---|
| Illinois | **Yes** | A17.3-2005 | Upgrades complete by **Jan 1, 2015** (early option Jan 1, 2013) | 41 Ill. Adm. Code 1000.60 |
| Texas | **Yes** | A17.3-2002 | "continues to be in effect" | 16 TAC §74.100 |
| Washington | **Yes** | A17.3-2015 | Adopted **10/1/2018**, "Current" | WAC 296-96-00650 |
| Oregon | **No** (2011 ed.) | — | A17.1-2010 etc. adopted; A17.3 absent | OAR 918-400-0455 |
| New Jersey | Not cited | — | A17.1/A18.1/A90.1 only, in sections read | N.J.A.C. 5:23-12.2/.3 |
| Iowa | Not cited | — | A17.7/A17.1 only, in rule read | Iowa A.C. r. 875-71.1 |
| Massachusetts | Own code | A17-2004 + MA mods | — | 524 CMR 35.00 |

**3 of 7 resolved states adopt A17.3, and each adopts a different edition (2002, 2005,
2015).** That edition scatter is a finding in its own right: there is no common national
retroactive baseline, so modernisation-demand underwriting has to be done state by state,
and the *edition* determines which retrofit items are in scope.

## 1.5 What A17.3 compliance concretely requires

Best available evidence is the Illinois enumeration (§1.3 above) — a jurisdiction's own
itemisation of what it pulled from A17.3-2005:

1. Hoistway and car door restrictions (door restrictors)
2. Car illumination
3. Emergency signalling devices
4. Phase reversal protection
5. Power-operated door reopening devices
6. Pit stop switches
7. Pit ladders
8. Firefighters' emergency operation *(conditional — §4.3.3(b) carve-out)*
9. Hydraulic elevator cylinders *(conditional — §4.3.3(b) carve-out)*

Items 8 and 9 are the capital-intensive ones (a hydraulic jack replacement and a
firefighters'-service controller upgrade are order-of-magnitude larger than a pit ladder),
and Illinois specifically made them conditional. That conditionality is where the
modernisation dollars actually sit, and it is triggered by *controller alteration,
equipment failure, or public safety risk* — i.e. by events, not by a calendar date.

**Published cost figures for these retroactive upgrades: NONE FOUND. STILL EMPTY.**
No costed source was retrieved for door restrictors, jack replacement, or firefighters'
service retrofit. Nothing has been estimated here.

## 1.6 What would fill the rest of SLOT 1

- The 10 unreached states above, from the URLs already identified (Florida and Ohio are the
  highest-value misses given installed base).
- Identification of Ohio's actual elevator chapter in OAC and Minnesota's successor to the
  repealed 1307.0032.
- Resolution of the **NFPA 101 §9.4 channel**, which this pass could not verify: NFPA 101
  is widely believed to require existing elevators to conform to A17.3, which would make
  A17.3 effective in every NFPA 101 state regardless of direct elevator-code adoption. If
  true this roughly inverts the map. `nfpa.org` pages retrieved did not contain section
  text and NFPA's state-adoption map was not located. **This is the single highest-value
  unresolved question in this slot** — it is the difference between "3 states" and "most
  states". Do not use A17.3 adoption counts in underwriting until it is settled.
- A costed source for the nine retroactive items.

---

# SLOT 2 — NAICS 238290 fragmentation by employment size band

**Status: STILL EMPTY.** No establishment counts by size band were obtained. No numbers
have been estimated or carried over. There is no arithmetic to show because no figures
were retrieved.

## 2.1 The container warning — restated prominently, as instructed

**NAICS 238290 is a CONTAINER, not the elevator trade.** An earlier pass established via
BLS OEWS that elevator installers and repairers are only **~13.9%** of 238290 employment.
Any fragmentation statistic read off 238290 describes "Other Building Equipment
Contractors" — a bucket that also holds conveyor, crane/hoist, and other specialty
equipment installers — **not** the elevator industry. When this table is eventually
retrieved, it must be labelled as container-level and must not be presented as an elevator
buy-box without the 13.9% caveat attached.

## 2.2 What was actually established (useful for the next attempt)

**Finding A — the Census Data API now requires a key for all data requests.**
Every data call to `api.census.gov` returned, verbatim:
> "A valid *key* must be included with each data API request."

Metadata endpoints remain open without a key — https://api.census.gov/data/2022/cbp/variables.json
and https://api.census.gov/data/2022/cbp/variables/EMPSZES.json both returned content.
So dataset discovery is possible key-free; data retrieval is not.

**Finding B — a parameter correction for the earlier pass.**
https://api.census.gov/data/2022/cbp/variables.json lists **`NAICS2017`**, not
`NAICS2022`. **CBP 2022 is coded on the 2017 NAICS vintage.** The earlier pass's
`NAICS2022=238290` filter was wrong independently of the endpoint problem, and would have
returned nothing even with a valid key. `EMPSZES` is confirmed present and described as
"Employment size of establishments code", with a companion `EMPSZES_LABEL`.

**Finding C — data.census.gov's unauthenticated access API does not filter.**
https://data.census.gov/api/access/data/table?id=CBP2022.CB2200CBP&g=010XX00US returns
real data with no key, but **only at 2-digit NAICS sector level**. Four filter syntaxes
were tested and all returned the identical sector list (00 Total; 11; 21; 22; 23; 31-33;
42 …), never reaching 6-digit detail:

| Variant tried | Result |
|---|---|
| `&n=238290` | ignored — sector level returned |
| `&NAICS2017=238290` | ignored — sector level returned |
| `&n=238290&nkd=EMPSZES` | ignored — sector level returned |
| `&n=238290&nkd=NAICS2017` | ignored — sector level returned |
| `&nkd=NAICS2017~238290,EMPSZES~001` | **HTTP 400** |
| `id=ECN2022.EC2223LOCCONS` | **HTTP 400** (table id not valid in this form) |

This reproduces and explains the earlier pass's failure: it is not a query-construction
error that more effort will fix, it is that the unauthenticated table endpoint serves only
the default sector aggregation.

**Finding D — the bulk files exist and are named, but were undownloadable here.**

| File | URL | Size | Why not retrieved |
|---|---|---|---|
| SUSB 2022, US & states, 6-digit NAICS | https://www2.census.gov/programs-surveys/susb/tables/2022/us_state_6digitnaics_2022.xlsx | 37.7 MB | `.xlsx`; host 403 to curl |
| SUSB 2022, US & states, NAICS, detailed employment sizes | https://www2.census.gov/programs-surveys/susb/tables/2022/us_state_naics_detailedsizes_2022.xlsx | 4.8 MB | `.xlsx`; host 403 to curl |
| QCEW Q1 size-class file | https://data.bls.gov/cew/data/files/2022/csv/2022_q1_by_size.zip | — | `.zip`; host 403 to curl |
| CBP record layout | https://www2.census.gov/programs-surveys/cbp/technical-documentation/records-layouts/2022_record_layouts/us-layout-2022.txt | — | `robots.txt` disallowed |

Note the SUSB "detailed employment sizes" file at 4.8 MB is the **best single target** for
the next pass — it is US-and-state, NAICS-by-detailed-size, and small enough to parse.

**Finding E — QCEW is a viable substitute and its size files are annual.**
https://www.bls.gov/cew/downloadable-data-files.htm confirms establishment size-class
files exist for **first quarter only**, annually from 1990, at the pattern
https://data.bls.gov/cew/data/files/[YEAR]/csv/[YEAR]_q1_by_size.zip.

## 2.3 Basis discipline reminder for whoever fills this

**CBP publishes establishments, employment and payroll — NOT receipts.** Revenue must not
be attributed to CBP. If a revenue-per-establishment figure is wanted, it has to come from
the Economic Census or SUSB (which does publish receipts), and be labelled accordingly.

## 2.4 What would fill SLOT 2

One free Census API key, then a single call:

```
https://api.census.gov/data/2022/cbp?get=ESTAB,EMP,PAYANN,EMPSZES_LABEL
   &for=us:*&NAICS2017=238290&EMPSZES=001,212,220,230,241,242,249,250&key=<KEY>
```

Bands requested: 1-4, 5-9, 10-19, 20-49, 50-99, 100-249, 250+ (plus 001 = all
establishments, needed as the denominator for share arithmetic). Shares to be computed as
band ÷ 001 and shown. Alternatively, download
`us_state_naics_detailedsizes_2022.xlsx` (4.8 MB) from any host with normal egress.

Either route is a few minutes of work once the key or the egress exists. The blocker is
access, not method.

---

# SLOT 3 — QEI (Qualified Elevator Inspector) population

**Status: PARTIALLY FILLED.** The certification architecture is established. **The
population count remains unfound**, and no age/retirement evidence was located.

## 3.1 The standard

**ASME QEI-1, "Standard for the Qualification of Elevator Inspectors"** is the governing
standard; certifying organisations operate under it. ASME's own QEI-1 product page was not
reached this pass (two URL constructions returned 404), so the accreditation mechanism is
**not quoted from the publisher** here and should not be asserted as verified.

## 3.2 The certifying body identified

**NAESA International** (National Association of Elevator Safety Authorities) administers
QEI certification.
URL: https://www.naesai.org/qei-certification

Disclosed programme facts:
- Eligibility is by "individuals meeting experience requirements outlined in the ASME
  QEI-1 Standard"; applicants submit documentation of educational and professional
  prerequisites, then sit an exam covering multiple safety codes.
- **Fees: $1,295 certification (includes membership); $500 exam-only (includes
  membership); $400 retake (no membership).**
- Governance: NAESA maintains a **Board of Certification** (https://naesai.org/directory/4).
- Basis: **Disclosed**.

**A public roster exists but yielded no count.** NAESA operates an "Inspector Search" /
"Search Certified Inspectors" at **https://naesai.org/search**. The page was retrieved and
confirms the function, but the search interface is dynamic and returned neither a total
nor result-set parameters to this pass's fetcher. **This roster is the single most likely
place a national count can be derived**, either from a published total or by enumerating
results (e.g. by state).

**NAEC (National Association of Elevator Contractors)** — https://www.naec.org/ — was
checked as a possible second certifier. The pages reached describe **CET™, CAT™** and the
**Vertical Transportation Management Program (VTMP)**, and contain **no** QEI programme.
On the evidence retrieved, NAEC is an education/training body here, not a QEI certifier.
This does not exclude other certifying organisations existing under QEI-1.

## 3.3 What is genuinely not published

No count of QEI-certified inspectors in the United States was found. No age distribution,
median age, or retirement-profile evidence was found. Neither figure appears to be
published by NAESA or ASME in any page reached this pass.

## 3.4 Who would know — name them, per the brief

1. **NAESA International Board of Certification** — holds the certificant register; the
   authoritative source for a US count and for age distribution.
2. **ASME** — as owner of QEI-1 and accreditor of certifying organisations, holds the list
   of accredited certifying bodies (needed to know whether NAESA is the only one).
3. **State elevator safety boards / licensing agencies** — several license or register
   inspectors and hold QEI credentials on file, giving a bottom-up count. Texas is the
   cleanest worked example: inspector registration is mandatory under
   **16 TAC §74.20/§74.21** (TDLR), so TDLR's registered-inspector roll is a countable
   state-level proxy.

## 3.5 What would fill SLOT 3

- Enumerate https://naesai.org/search state by state and sum (needs a browser-capable
  fetch — the interface defeated a plain fetcher).
- Direct enquiry to NAESA's Board of Certification for certificant count and age profile.
- ASME's list of QEI-1 accredited certifying organisations, to confirm NAESA is the whole
  universe or not.
- Sum state inspector registries (TDLR and equivalents) as an independent cross-check.

---

# SLOT 4 — IUEC membership from the primary source

**Status: PARTIALLY FILLED.** A primary self-published membership figure was obtained
direct from the union. **The LM-2 filing itself was not reached** — but the correct DOL
host and interface were identified and the earlier pass's dead endpoint was corrected.

## 4.1 Primary, from the union itself

**International Union of Elevator Constructors**, https://www.iuec.org/ and
https://www.iuec.org/about/ (accessed 2026-08-11), states verbatim:

> "The IUEC represents 30,000+ skilled elevator constructors across the US and Canada."

Also disclosed: founded **1901** ("Elevating North America Since 1901").
Basis: **Disclosed** (self-reported by the organisation).

Three qualifications that matter for use:
1. It is **US and Canada combined**, not US-only.
2. "30,000+" is rounded and undated — it is a marketing figure, not a reported one.
3. It is **directionally consistent** with the 31,290 LM-2 figure the earlier pass obtained
   via an anti-union advocacy republisher. Two independent sources now bracket the same
   number, which materially raises confidence in ~30-31k even though the filing itself is
   still not in hand.

The union does not publish a count of local unions on the pages reached; specific locals
(1, 8, 31) are referenced.

## 4.2 OLMS — endpoint corrected, filing not retrieved

**Correction to the earlier pass: `olms.dol-esa.gov` no longer resolves** (DNS failure —
"Name or service not known"). That is why the earlier attempt could not reach DOL directly.

**The live host is `olmsapps.dol.gov`.** The Online Public Disclosure Room is confirmed at
**https://olmsapps.dol.gov/olpdr/**, and the union query form at
**https://olmsapps.dol.gov/query/getOrgQry.do**.

Interface as retrieved:
- Search fields: **file number**; **union name by abbreviation** (a dropdown that contains
  an explicit **"IUEC-ELEVATOR CONSTRUCTORS AFL-CIO"** entry); **year covered by report**;
  **payment size** min/max; plus "Search Independent Unions Only" and "Search Active Unions
  Only" checkboxes.
- Functions offered: "View Reporting History", "Export", and side-by-side report comparison.
- Bulk data: the OPDR states **"The files below are Zip files containing pipe delimited
  text files"**, and points to an "OLMS Guide to Working with Downloaded LM Filing Data".

**Why the filing was not retrieved:** the search is a POST/JavaScript-driven application
(no working GET parameterisation was found — `?unionAbbrev=IUEC` was blocked by
`robots.txt`), and the bulk alternative is `.zip`, which this session could neither fetch
via the web-fetch tool nor download via curl (dol.gov returns 403 on CONNECT). This is an
access failure, not an absence of data: **total membership, receipts and year covered are
all definitely published in the LM-2 and are definitely on that host.**

## 4.3 Local 1 (New York)

**Not retrieved.** Requires the same OLMS query path.

## 4.4 What would fill SLOT 4

- Normal egress to `olmsapps.dol.gov`, then: select "IUEC-ELEVATOR CONSTRUCTORS AFL-CIO"
  in the union-abbreviation dropdown, take the most recent LM-2, and record **total
  members, total receipts, and year covered** exactly as filed — plus the same for
  Local 1 (New York) as a separate filing.
- Or the OLMS bulk zip, which gives every IUEC local in one file and would produce the
  local-by-local membership distribution — considerably more useful than the national
  total for metro-level underwriting.

---

# Slot scoreboard

| Slot | Status | One-line reason |
|---|---|---|
| 1 — A17.3 state adoption | **PARTIALLY FILLED** | 3 adopters quoted (IL/TX/WA, three different editions), 4 negatives, 10 states named-but-unreached; no published national table exists; NFPA 101 §9.4 channel unresolved and could invert the map |
| 2 — 238290 size bands | **STILL EMPTY** | Census API now key-mandatory; data.census.gov's key-free endpoint serves only 2-digit NAICS; bulk files are .xlsx/.zip and this session's egress blocked census.gov and bls.gov outright |
| 3 — QEI population | **PARTIALLY FILLED** | Certifier (NAESA), standard (ASME QEI-1), fees and public roster located; no count and no age profile published anywhere reached |
| 4 — IUEC membership | **PARTIALLY FILLED** | "30,000+ US and Canada" direct from iuec.org corroborates the 31,290 LM-2 figure; correct OLMS host identified (olmsapps.dol.gov, replacing the dead olms.dol-esa.gov); filing itself not retrieved |

---

## What we don't know yet

1. **Whether NFPA 101 §9.4 makes A17.3 effective in states that never adopted it directly.**
   This is the largest open question on the board. If NFPA 101 requires existing elevators
   to conform to A17.3, then A17.3 reaches every NFPA 101 jurisdiction and the direct-
   adoption count (3 of 7 sampled) badly understates the retroactive mandate. If it does
   not, modernisation-by-mandate is a genuinely narrow, state-specific phenomenon. **Do not
   size modernisation demand off code adoption until this is resolved.**
2. **A17.3 status in 10 named states**, including Florida and Ohio — both large installed
   bases, both attempted, neither reached.
3. **Whether A17.3 adopters enforce.** Illinois' deadline passed in 2015; Texas' A17.3-2002
   is 24 years old. Adoption on paper and capex actually compelled are different things,
   and nothing retrieved speaks to enforcement intensity, variance practice, or violation
   rates.
4. **Any published cost figure for the nine retroactive A17.3 items** — particularly
   hydraulic jack replacement and firefighters' service retrofit, which is where the money
   is. Nothing found; nothing estimated.
5. **Establishment counts by employment size band for NAICS 238290** — no band, no share,
   no denominator. And when obtained it will describe the container, of which the elevator
   trade is ~13.9% by employment.
6. **How many QEI inspectors exist in the US**, and their age distribution — the retirement
   question that would tell us whether inspection capacity is a binding constraint on
   deal-relevant service revenue.
7. **Whether NAESA is the only QEI-1 certifying organisation**, which determines whether a
   NAESA roster count would be the national total or only part of it.
8. **IUEC membership as filed** (total members, receipts, year covered) and **Local 1's
   filing** — plus the local-by-local distribution, which is the form of the data that
   would actually be underwritable at metro level.
9. **Whether a trade-press A17.3 adoption compilation exists** (e.g. Elevator World). This
   pass had no keyword search available, so the "no published table" finding rests on
   checks of ASME, NEII, NAESA and Justia only.
