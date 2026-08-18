<!-- run: 15 | hunt: B | date: 2026-08-11
     query: pass 6 — every load-bearing figure against the issuing body
     tool: SEC EDGAR, company annual reports, BLS, Census, state administrative codes, court and Commission records -->

# Verification pass — 2026-08-11

**This is a source document.** Job 2 of the studio method: every load-bearing figure in
`documents/master-draft-2026-08-11.md` checked against the body that issued it, not
against whoever cited it. Findings here become citable, which is what lets a corrected
figure pass an audit honestly.

**Why it was run.** The draft audited `✓ CLEAN` at 129 figures. A clean audit proves
*traceability*, not *truth* — a faithfully-carried fabrication audits green. On
2026-07-27 the home-services master audited clean and six load-bearing figures failed
this step three days later.

**It found the same class of thing here.**

- **One fabricated quotation.** A sentence attributed to Otis management that no
  transcript contains, built out of an analyst's question.
- **One scope error that changes a decision.** The Otis figure used to retire an
  already-published claim is **global**, not US — so it cannot carry that weight.
- Roughly twenty further corrections: wrong speaker, wrong denominator, a company name
  that was never a company name, an expired wage determination, a "hard cap" with an
  express exception in its own text.

Verdicts are one of: **VERIFIED** · **CORRECTED** · **NOT FOUND** (the issuing source
was reached and the figure is not in it) · **UNVERIFIABLE** (the source could not be
reached; what blocked it is named).

---


# Otis Worldwide

# Verification pass — Otis Worldwide (NYSE: OTIS) cluster
**Pass 6, primary-source verification. Date of pass: 2026-08-11.**
Verifier note: every figure below was checked against the issuing body — the SEC
filing on EDGAR, Otis's own earnings release, or the earnings call transcript —
not against anyone citing them.

**Primary document for figures 1–9:**
Otis Worldwide Corporation, **Form 10-K for the fiscal year ended December 31, 2025**,
accession **0001781335-26-000011**, **filed 2026-02-05**, CIK 0001781335.
Primary document `otis-20251231.htm`.
https://www.sec.gov/Archives/edgar/data/1781335/000178133526000011/otis-20251231.htm

Segment figures were read from the filing's own XBRL detail exhibits, which are
the filed financial statements rendered page by page:
- R121 — *Segment Financial Data — Schedule of Segment Information (Details)*
- R122 — *Segment Financial Data — Schedule of Geographic External Sales (Details)*
- R123 — *Segment Financial Data — Schedule of Net Sales by Sales Type (Details)*

Corroborated against **XBRL company concept API**, `RevenueFromContractWithCustomerExcludingAssessedTax`,
which returns FY2025 = 14,431,000,000, form 10-K, accn 0001781335-26-000011, filed 2026-02-05.
https://data.sec.gov/api/xbrl/companyconcept/CIK0001781335/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json

---

## SUMMARY TABLE — verdict only

| # | Figure as carried | Verdict |
|---|---|---|
| 1 | New Equipment rev $4,989m, OP $240m, margin 4.8% | **VERIFIED** |
| 2 | Service rev $9,442m, OP $2,374m, margin 25.1% | **VERIFIED** |
| 3 | Maintenance & Repair $7,584m; Modernization $1,858m | **VERIFIED** |
| 4 | Total revenue $14,431m | **VERIFIED** |
| 5 | US net sales $4,192m — carried as 29.1% of total | **CORRECTED** (dollar figure verified; the percentage is 29.0%) |
| 6 | Segment operating profit $2,614m; Service = 91% of it | **VERIFIED** |
| 7 | FY2024 margin gap 18.5pp; gap widened 1.8pp | **VERIFIED — method-dependent, must be registered as a Derivation** |
| 8 | ~2.5m units, growing 4% for a **fourth consecutive year**, 1.1m connected | **CORRECTED** (units and connected verified; "fourth consecutive year" is not what the source says) |
| 9 | 10-K states independents hold ~50% of service units, lower-value half | **VERIFIED — but the statement is GLOBAL, not US. Scope warning.** |
| 10 | Retention 93.5%→92.4%; management: return to 94% "will take sustained time" | **NOT FOUND** (the numbers verify; the quoted phrase is in no transcript, and 94% is an analyst's number, not management's) |
| 11 | EV/EBITDA 14.20 GuruFocus 11 Aug 2026; 14.71 stockanalysis/S&P 10 Aug 2026 | **UNVERIFIABLE as dated** (live vendor pages, no retrievable snapshot; today's readings differ) |
| 12 | Bay State Elevator 17 Aug 2020; 8 of Urban Elevator's 11 US sites 21 Apr 2025 | **VERIFIED** (with "11" flagged as derived, not stated) |

---

## FIGURE-BY-FIGURE

### 1. New Equipment — revenue $4,989m, operating profit $240m, margin 4.8% — **VERIFIED**

FY2025 10-K, R121, *Segment Financial Data — Schedule of Segment Information (Details)*,
units caption "$ in Millions", column "12 Months Ended Dec. 31, 2025":

> **New Equipment** — Net sales **$ 4,989** — Operating profit **$ 240**

The **4.8%** margin is not only derivable, it is **stated by Otis itself**. Otis
Worldwide, *"OTIS REPORTS FOURTH QUARTER AND FULL YEAR 2025 RESULTS"*, released
**28 January 2026**, segment results table, Full Year 2025, New Equipment:
Net Sales $4,989m, Operating Profit $240m, **Operating Profit Margin 4.8%**.
https://otisinvestors.com/news/news-details/2026/OTIS-REPORTS-FOURTH-QUARTER-AND-FULL-YEAR-2025-RESULTS/default.aspx

Unrounded check: 240 ÷ 4,989 = **4.8106%**. Rounds to 4.8%. Consistent.

---

### 2. Service — revenue $9,442m, operating profit $2,374m, margin 25.1% — **VERIFIED**

FY2025 10-K, R121, column "12 Months Ended Dec. 31, 2025":

> **Service** — Net sales **$ 9,442** — Operating profit **$ 2,374**

Margin also stated by Otis directly in the 28 January 2026 earnings release
segment table: Full Year 2025 Service — Net Sales $9,442m, Operating Profit
$2,374m, **Operating Profit Margin 25.1%**.

Unrounded check: 2,374 ÷ 9,442 = **25.1430%**. Rounds to 25.1%. Consistent.

**The central economic claim of the document stands.** The service-vs-new-equipment
operating margin gap in FY2025 is 25.1% against 4.8% — both figures stated by the
issuer, both traceable to the filed segment note.

---

### 3. Within Service — Maintenance & Repair $7,584m, Modernization $1,858m — **VERIFIED**

FY2025 10-K, R123, *Segment Financial Data — Schedule of Net Sales by Sales Type
(Details)*, "USD ($) in Millions", column "12 Months Ended Dec. 31, 2025":

> Maintenance and Repair **7,584**
> Modernization **$ 1,858**

Internal consistency check: 7,584 + 1,858 = **9,442**, which ties exactly to
Service net sales in R121. Clean.

---

### 4. Total revenue $14,431m — **VERIFIED**

Three independent confirmations inside the same filing:
- R121 Total Operating Segments — Net sales **$ 14,431**
- R122 Total — Net sales **$14,431**
- R123 Total Net Sales — **$ 14,431**

And from the XBRL company-concept API, tag
`RevenueFromContractWithCustomerExcludingAssessedTax`, FY2025, start 2025-01-01,
end 2025-12-31, value **14,431,000,000**, form 10-K, accn 0001781335-26-000011,
filed 2026-02-05.

---

### 5. US net sales $4,192m, carried as 29.1% of total — **CORRECTED**

**The dollar figure is VERIFIED.** FY2025 10-K, R122, *Schedule of Geographic
External Sales (Details)*, "USD ($) in Millions", column "12 Months Ended
Dec. 31, 2025":

> **United States Operations** — Net sales **4,192**

For context the same table gives China 1,650 and Other 8,589; 4,192 + 1,650 +
8,589 = 14,431. Ties.

**The percentage is wrong.** The 10-K does not state a percentage; 29.1% is a
derived figure. The arithmetic:

> 4,192 ÷ 14,431 = 0.2904857… = **29.05%**, which is **29.0%** to one decimal.

29.1% would require US net sales of at least $4,199m. The document is carrying
**29.1%** where the filing supports **29.0%**. Under this practice's citation law
a rounded figure is a different figure, so this is a correction, not a tolerance.

**What it was:** 29.1% of total.
**What the source supports:** 29.0% (29.05% unrounded).
**Why it changed:** arithmetic on the filed figures; no source states 29.1%.

---

### 6. Segment operating profit $2,614m; Service = 91% of segment OP — **VERIFIED**

FY2025 10-K, R121:

> **Total Operating Segments** — Operating profit **$ 2,614**

Check: 240 + 2,374 = 2,614. Ties.

Service share: 2,374 ÷ 2,614 = **90.8187%**, which is **91%** to the nearest whole
percent. The claim as carried ("Service = 91% of segment OP") is sound. If the
figure is ever restated to one decimal it is **90.8%**, not 91.0%.

**One scope point worth holding, because it is exactly the relabelled-total
pattern in miniature.** $2,614m is **segment** operating profit, not consolidated
operating profit. Otis's consolidated FY2025 operating income is **$2,133,000,000**
(XBRL `OperatingIncomeLoss`, FY2025, form 10-K, accn 0001781335-26-000011, filed
2026-02-05) — the difference is general corporate expense and other items. The
claim is correctly worded as "of segment OP" and must stay worded that way. Against
consolidated operating profit the ratio would be 111%, which is meaningless.
https://data.sec.gov/api/xbrl/companyconcept/CIK0001781335/us-gaap/OperatingIncomeLoss.json

---

### 7. FY2024 margin gap 18.5pp, gap widened 1.8pp — **VERIFIED, method-dependent**

This figure traces, but only under one of two arithmetics, and the two do not agree.
It must be registered under `## Derivations` with the method named.

**Method A — differencing Otis's own reported margins (this is where 18.5pp comes from).**
Otis's 28 January 2026 earnings release states, for Full Year 2024: New Equipment
Operating Profit Margin **6.1%**, Service Operating Profit Margin **24.6%**.

> 24.6 − 6.1 = **18.5pp** (FY2024 gap)
> 25.1 − 4.8 = **20.3pp** (FY2025 gap)
> 20.3 − 18.5 = **1.8pp** (widening)

Both carried figures reproduce exactly. The inputs are issuer-stated.

**Method B — computing from the filed segment dollars.**
FY2024 from R121 (comparative column, "12 Months Ended Dec. 31, 2024"):
New Equipment net sales **$ 5,367**, operating profit **$ 329**; Service net sales
**$ 8,894**, operating profit **$ 2,185**.

> 329 ÷ 5,367 = 6.1301%; 2,185 ÷ 8,894 = 24.5671% → gap **18.4371pp** → **18.4pp**
> FY2025 gap 25.1430 − 4.8106 = **20.3324pp** → **20.3pp**
> widening = **1.8953pp** → **1.9pp**

**So: 18.5pp / 1.8pp under Method A; 18.4pp / 1.9pp under Method B.** The carried
figures are Method A and are defensible, because Otis publishes 6.1% and 24.6%
itself. But the master must say so. The failure mode to avoid is a document that
computes FY2025 margins from dollars in one place and quotes a Method-A gap in
another — the reader cannot reconstruct either, and the 1.8 vs 1.9 discrepancy
looks like an error rather than a rounding convention.

**Recommendation for the Derivations register:** state that segment margin gaps are
computed by differencing Otis's reported one-decimal segment margins, and that
rounding at the margin level is why the widening reads 1.8pp rather than 1.9pp.

---

### 8. ~2.5m units maintained, growing 4% for a fourth consecutive year, 1.1m connected — **CORRECTED**

**Portfolio size — VERIFIED.** FY2025 10-K, Item 1 (Business), verbatim:

> "We have a maintenance portfolio of approximately 2.5 million units globally,
> which includes Otis equipment manufactured and sold by us, as well as equipment
> from other original equipment manufacturers."

Corroborated in the 28 January 2026 earnings release boilerplate: *"We move 2.5
billion people a day and maintain approximately 2.5 million customer units
worldwide, the industry's largest Service portfolio."*

**Connected units — VERIFIED.** FY2025 10-K, Item 1, verbatim:

> "As of December 31, 2025, approximately 1.1 million units of our global
> portfolio, including units under the warranty period, are connected."

Note the qualifier — **"including units under the warranty period"**. If the master
uses 1.1 million as a measure of the connected *maintenance* base, the warranty
units are in that number and the 10-K says so.

**"Growing 4% for a fourth consecutive year" — CORRECTED. No source says this.**

The company's own framing is quarters, not years. Otis Q4 2025 earnings call,
**28 January 2026**, Judith Marks (Chair, CEO & President), verbatim:

> "At approximately 2.5 million units, the largest in the industry, our
> maintenance portfolio grew 4% for the **fourteenth consecutive quarter**"

Cristina Mendez (EVP & CFO), same call, verbatim:

> "Our service portfolio grew 4% in 2025, bringing it approximately to 2.5 million
> units and strengthening our leading position globally."

Confirmed against two independent transcript vendors, both carrying "fourteenth
consecutive quarter":
- https://www.fool.com/earnings/call-transcripts/2026/01/28/otis-otis-q4-2025-earnings-call-transcript/
- https://www.investing.com/news/transcripts/earnings-call-transcript-otis-worldwide-q4-2025-misses-eps-stock-dips-93CH-4480941

**Why this matters and why it is not merely pedantic.** "Fourth consecutive year"
is arithmetically *consistent* with the record — the Q4 2024 call (Judy Marks,
29 January 2025) said "We grew our maintenance portfolio by more than 4% for the
**third consecutive year**, and our portfolio now stands at approximately 2.4
million units, leading our industry," and fourteen consecutive quarters ending
Q4 2025 reaches back to Q3 2022. So the claim is probably true. **But no source
states it**, and it is the third failure pattern — a figure nobody sourced,
sitting where a sourced one should be.

**What it was:** growing 4% for a fourth consecutive year.
**What the sources say:** "grew 4% for the fourteenth consecutive quarter"
(Marks, Q4 2025 call) and "grew 4% in 2025" (Mendez, same call).
**Why it changed:** the year-count framing is the practice's construction, not
the issuer's. Use the company's wording or register the year count as a Derivation
with the two calls as inputs.

---

### 9. THE CRITICAL ONE — independents hold ~50% of service units — **VERIFIED, with a scope warning that must be read**

**The sentence exists. Here it is, verbatim, with its full surrounding context.**

FY2025 10-K, **Item 1 (Business), under the subsection heading "Competition"**:

> "In the Service segment, independent service providers and other small operators
> are significant competitors in most of our local geographies. These independent
> service providers have an aggregate portfolio of about 50% of service units, but
> account for a smaller percentage of the service business when measured by value
> because of the types of units and level of maintenance covered by these
> providers."

Independently confirmed to exist via **EDGAR full-text search** on the exact string
`"aggregate portfolio of about 50% of service units"` — **5 hits, all Otis Worldwide
Corp 10-K filings**: filed 2022-02-04 (FY2021), 2023-02-03 (FY2022), 2024-02-02
(FY2023), 2025-02-04 (FY2024) and 2026-02-05 (FY2025).

**So the load-bearing claim is real. Three qualifications, and the practice needs
all three before this overturns a published figure.**

**(a) THE SCOPE IS GLOBAL, NOT US. This is the live risk.**
The sentence sits in the Competition subsection describing Otis's worldwide
competitive position, and the scope-setting words are **"in most of our local
geographies"** — Otis's local geographies worldwide. Nothing in the passage
restricts it to the United States. Otis's US operations are $4,192m of $14,431m
(29.0%) of the business; the ~50% figure is not a statement about that 29%.

If the elevator master uses this sentence to establish a **US** independent share,
that is precisely the **relabelled total** — a real figure whose measured
population has been quietly changed. Given that this practice is retiring an
already-published figure on the strength of this sentence, and that the retired
figure is presumably a US one, **this is the finding of the pass.** Either the
claim is restated as global, or a US-specific source is found. The 10-K does not
supply one.

**(b) IT IS UNCHANGED BOILERPLATE, NOT AN FY2025 MEASUREMENT.**
The identical sentence appears in all five Otis 10-Ks from FY2021 through FY2025.
It carries no measurement date, no methodology and no unit count. It is a
competitive characterisation the company has repeated for five years, and it should
be attributed as "Otis has stated in each of its last five annual reports", not as
a 2025 datapoint.

**(c) "LOWER-VALUE HALF" IS A GLOSS, AND THE 10-K IS MORE CAREFUL THAN THAT.**
The filing says the independents "account for a smaller percentage of the service
business **when measured by value**", and attributes it to "the types of units and
level of maintenance covered". It never says "half" of value, and it never
quantifies the value share. The units are ~50%; the value share is only
characterised as smaller. "The lower-value half" is a fair reading of the units
figure but must not be allowed to imply the 10-K put a number on the value split.
It did not.

**Verdict: VERIFIED as to the words. The claim as the practice intends to use it
is only sound if it is stated as global.**

---

### 10. Retention 93.5% → 92.4%, management saying a return to 94% "will take sustained time" — **NOT FOUND**

Split verdict, and the second half is serious.

**The retention figures and their attribution — VERIFIED.**
Otis Q4 2024 earnings call, **29 January 2025**, **Judy Marks, President and Chief
Executive Officer**, verbatim:

> "So using that, I would tell you, going from 93.5% or so to 92.4%, some of that
> is involuntary."

Speaker, quarter and both numbers are correct as carried. Note the hedge in the
source — **"93.5% or so"** — which the document should preserve rather than
present 93.5% as a precise reported metric. Otis does not publish retention rate
as a standalone disclosed figure in the 10-K; it surfaces in call Q&A.

**The quotation "will take sustained time" — NOT FOUND. It is in no transcript of
that call.**

I checked two independent transcripts of the Q4 2024 call in full:
- The Motley Fool — https://www.fool.com/earnings/call-transcripts/2025/01/29/otis-worldwide-otis-q4-2024-earnings-call-transcri/
- Insider Monkey — https://www.insidermonkey.com/blog/otis-worldwide-corporation-nyseotis-q4-2024-earnings-call-transcript-1439078/

Neither contains the phrase "will take sustained time", nor any management
statement about how long a return to a higher retention rate would take. What
Marks actually said about recovery, verbatim:

> "So, I do believe you'll see the retention rate go up again."

No timeframe. No qualification. The opposite tone to the one the document reports.

**And the 94% is misattributed.** 94% was not management's target or management's
number at all. It was spoken by an **analyst**, **Jeffrey Sprague of Vertical
Research**, recalling history:

> "I had like 94% in '22 and 93.5% in '23, and I think we're 92.5% here now."

So the carried claim takes an analyst's recollection of a 2022 figure, converts it
into a management benchmark, and attaches to it a quotation management never
uttered. Both moves are in one sentence.

**For completeness, what Otis has since said about retention** — Q4 2025 call,
28 January 2026, Cristina Mendez (EVP & CFO), verbatim:

> "We ended the year with a stable retention rate outside of China, enabled by our
> ongoing focus on investment in service excellence."

That is the current, sourceable position: **stabilised ex-China**, not a dated
recovery promise. If the master needs a forward-looking retention statement, this
is the one that exists.

**This is a fabricated quotation attributed to a named executive on a named call.
It must come out of the document, not be softened.**

---

### 11. EV/EBITDA — 14.20 (GuruFocus, 11 Aug 2026) and 14.71 (stockanalysis/S&P, 10 Aug 2026) — **UNVERIFIABLE as dated**

These are **vendor computations, not filings**, and both pages are live and
price-driven: they change intraday and neither exposes a retrievable dated
snapshot. The figures as dated therefore cannot be re-verified after the fact.

**Readings taken today, 11 August 2026:**

| Vendor | Carried | Reading today (2026-08-11) | URL |
|---|---|---|---|
| GuruFocus | 14.20 (11 Aug 2026) | **14.21** | https://www.gurufocus.com/term/ev2ebitda/OTIS |
| stockanalysis.com (source: S&P Global Market Intelligence) | 14.71 (10 Aug 2026) | **14.61** | https://stockanalysis.com/stocks/otis/statistics/ |

GuruFocus displays "as of August 11, 2026" and adds that the figure sits 22% below
Otis's 10-year median of 18.17 and below an Industrial Products industry median of
16.165. stockanalysis states its numbers come from **S&P Global Market
Intelligence** and notes that "price-based statistics and ratios update throughout
each trading day."

Per instruction, no attempt has been made to reconcile the two — they use different
EBITDA definitions and different enterprise-value conventions, and a spread of that
size between vendors is normal and is itself the useful information.

**How these must be presented.** Attributed to the vendor and the date of reading,
never to Otis and never to a filing: "GuruFocus, 11 August 2026" / "S&P Global
Market Intelligence via stockanalysis.com, 10 August 2026". If either number is
going to be large on a page, take a fresh reading on the day of the build and
restate the date, because the value carried will not be the value a reader sees.

---

### 12. Dated acquisitions — **VERIFIED**, with one derived element flagged

**Bay State Elevator, 17 August 2020 — VERIFIED.**
Otis Worldwide's own press release, *"Otis Acquires Bay State Elevator, Further
Strengthens Presence in Northeast U.S."*, **dateline August 17, 2020**, verbatim
opening:

> "Otis Worldwide Corporation (NYSE: OTIS) has acquired Bay State Elevator,
> including its service portfolio and operations in Massachusetts, Connecticut,
> Vermont and upstate New York."

Past tense — **completed**, not merely announced, as of that date. The release also
carries the subhead statement: *"Acquisition adds to the company's industry-leading
maintenance portfolio of more than 2M units."*
https://www.prnewswire.com/news-releases/otis-acquires-bay-state-elevator-further-strengthens-presence-in-northeast-us-301113093.html

**Urban Elevator — 8 locations, announced 21 April 2025 — VERIFIED. "Of 11 US
sites" is DERIVED, not stated.**

Elevator World, *"Otis Acquires Eight Urban Elevator Locations"*, verbatim:

> "Otis acquired eight Urban Elevator Service locations in the U.S., Maven Group,
> which served as financial advisor to Urban Elevator, announced on April 21."

and:

> "Established in 1985 in Chicago, Urban Elevator will maintain ownership of its
> three Illinois and Indiana locations."

https://elevatorworld.com/news/daily-news/otis-acquires-eight-urban-elevator-locations/

Corroborated by counsel to the seller — Jones Day, *"Urban Elevator sells eight
locations to Otis"*, April 2025.
https://www.jonesday.com/en/practices/experience/2025/04/urban-elevator-sells-eight-locations-to-otis

**Two things to hold about this one:**

1. **"11" is arithmetic, not a citation.** 8 acquired + 3 retained = 11. No source
   states that Urban Elevator operated 11 US locations before the transaction.
   Write it as "eight locations, with three Illinois and Indiana locations
   retained by the seller" — which is what the sources support — or register 11
   as a Derivation.
2. **The announcing party was the seller's financial advisor, Maven Group, not
   Otis.** No Otis press release for this transaction was located. That is normal
   for a tuck-in of this size, but it means the deal is sourced to trade press and
   advisor announcement, not to the acquirer, and the attribution should say so.
   Otis's FY2025 10-K does not name individual tuck-in acquisitions.

---

## WHAT THIS PASS CHANGES

Three items require action before anything derives from this cluster:

1. **Figure 10 carries a fabricated quotation.** "Will take sustained time" was
   never said, on that call or any other I could reach, and the 94% benchmark
   belongs to an analyst describing 2022, not to management. Remove it. The
   sourceable replacement, if a forward-looking retention line is needed, is
   Mendez on the Q4 2025 call: retention "stable... outside of China".

2. **Figure 9 is global.** The 10-K sentence is real, verbatim as carried, and
   present in five consecutive annual reports — but it describes Otis's competitors
   "in most of our local geographies" worldwide. It is not a US measurement. A
   published US figure cannot be retired on it without a scope change to the claim
   or a genuinely US-specific source.

3. **Figures 5 and 8 carry derived numbers that no source states** — 29.1% where
   the filing gives 29.0%, and "fourth consecutive year" where the company says
   "fourteenth consecutive quarter". Both are small; both are the pattern that
   ends with an unsourced figure large on a page.

The core economic claim — Service at 25.1% operating margin against New Equipment
at 4.8%, on $9,442m and $4,989m of revenue — **survives verification intact**, and
survives it against figures Otis states itself rather than figures we computed.
That is the strongest part of the document and it should carry the weight.

## Sources register

| Source | Type | Date | URL |
|---|---|---|---|
| Otis Worldwide, Form 10-K FY2025, accn 0001781335-26-000011 | SEC filing (primary) | filed 2026-02-05 | https://www.sec.gov/Archives/edgar/data/1781335/000178133526000011/otis-20251231.htm |
| Same filing, R121 / R122 / R123 XBRL detail exhibits | SEC filing (primary) | filed 2026-02-05 | https://www.sec.gov/Archives/edgar/data/1781335/000178133526000011/R121.htm |
| SEC XBRL company concept API — revenue, operating income | SEC data (primary) | retrieved 2026-08-11 | https://data.sec.gov/api/xbrl/companyconcept/CIK0001781335/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json |
| EDGAR full-text search, exact-phrase check on the independents sentence | SEC search (primary) | retrieved 2026-08-11 | https://efts.sec.gov/LATEST/search-index |
| Otis, "OTIS REPORTS FOURTH QUARTER AND FULL YEAR 2025 RESULTS" | Issuer press release (primary) | 2026-01-28 | https://otisinvestors.com/news/news-details/2026/OTIS-REPORTS-FOURTH-QUARTER-AND-FULL-YEAR-2025-RESULTS/default.aspx |
| Otis Q4 2025 earnings call transcript (Motley Fool) | Transcript vendor | 2026-01-28 | https://www.fool.com/earnings/call-transcripts/2026/01/28/otis-otis-q4-2025-earnings-call-transcript/ |
| Otis Q4 2025 earnings call transcript (Investing.com) | Transcript vendor | 2026-01-28 | https://www.investing.com/news/transcripts/earnings-call-transcript-otis-worldwide-q4-2025-misses-eps-stock-dips-93CH-4480941 |
| Otis Q4 2024 earnings call transcript (Motley Fool) | Transcript vendor | 2025-01-29 | https://www.fool.com/earnings/call-transcripts/2025/01/29/otis-worldwide-otis-q4-2024-earnings-call-transcri/ |
| Otis Q4 2024 earnings call transcript (Insider Monkey) | Transcript vendor | 2025-01-29 | https://www.insidermonkey.com/blog/otis-worldwide-corporation-nyseotis-q4-2024-earnings-call-transcript-1439078/ |
| Otis, "Otis Acquires Bay State Elevator..." | Issuer press release (primary) | 2020-08-17 | https://www.prnewswire.com/news-releases/otis-acquires-bay-state-elevator-further-strengthens-presence-in-northeast-us-301113093.html |
| Elevator World, "Otis Acquires Eight Urban Elevator Locations" | Trade press | April 2025 | https://elevatorworld.com/news/daily-news/otis-acquires-eight-urban-elevator-locations/ |
| Jones Day, "Urban Elevator sells eight locations to Otis" | Seller's counsel | April 2025 | https://www.jonesday.com/en/practices/experience/2025/04/urban-elevator-sells-eight-locations-to-otis |
| GuruFocus, OTIS EV/EBITDA | Commercial vendor | read 2026-08-11 | https://www.gurufocus.com/term/ev2ebitda/OTIS |
| stockanalysis.com (S&P Global Market Intelligence), OTIS statistics | Commercial vendor | read 2026-08-11 | https://stockanalysis.com/stocks/otis/statistics/ |

## Method note — access constraints

Direct HTTPS from the shell to `sec.gov`, `data.sec.gov`, `efts.sec.gov` and
`otis.com` was blocked by this session's egress policy, and EDGAR's `/cgi-bin/`
browse paths are disallowed by robots. All primary-source retrieval was done
through the fetch tool against permitted EDGAR `/Archives/` paths, the XBRL data
API and issuer IR pages. The FY2025 10-K primary document is 3,115,299 bytes and
is truncated by the fetch path before Item 7, so **MD&A prose could not be read
directly**; segment figures were taken instead from the filing's own R-file XBRL
exhibits, which are the filed statements and are equivalent for figures 1–7.
Nothing in this pass rests on a source I could not open.

---


# KONE · Schindler · TK Elevator · Mitsubishi · the merger

# Verification Pass 6 — OEM cluster and the KONE/TKE merger
**Date of pass:** 2026-08-11
**Scope:** KONE, Schindler, TK Elevator, Mitsubishi Electric, and the KONE/TKE combination.
**Method:** issuing body only — company financial statements, company IR presentations, and the parties' own regulated announcements. Trade press used nowhere as a figure source.

---

## Summary table — verdict only

| # | Figure as carried | Verdict |
|---|---|---|
| **KONE FY2025 (EUR, global unless noted)** | | |
| 1 | Sales EUR 11,245.2m | VERIFIED |
| 2 | Adjusted EBIT EUR 1,369.3m (12.2%) | VERIFIED |
| 3 | New Building Solutions EUR 4,097.7m | VERIFIED |
| 4 | Service EUR 4,753.6m (+7.6%) | VERIFIED — growth basis must be labelled |
| 5 | Modernisation EUR 2,394.0m (+17.4%) | VERIFIED — growth basis must be labelled |
| 6 | Americas EUR 2,812.1m | VERIFIED |
| 7 | Americas = 25.0% of sales | DERIVED — not stated by KONE |
| 8 | Maintained units ≈1.8 million | VERIFIED |
| 9 | KONE discloses no business-line margin | VERIFIED |
| **Schindler FY2025 (CHF, global unless noted)** | | |
| 10 | Revenue CHF 10,947m | VERIFIED |
| 11 | EBIT CHF 1,384m (12.6%), adjusted 13.3% | VERIFIED |
| 12 | Americas CHF 3,214m | VERIFIED |
| 13 | Americas = 29.4% of group | DERIVED — not stated |
| 14 | Americas down 3.2% | DERIVED, and CURRENCY-MISLABEL RISK |
| 15 | No business-line split / no margin split / no unit count | VERIFIED |
| 16 | CFO attributed Americas service decline to selectivity on recaptures | **CORRECTED** — speaker is the CEO; and the decline is in portfolio units |
| **TK Elevator FY24/25 (EUR, year ended 30 Sep 2025)** | | |
| 17 | Sales EUR 9.2bn | VERIFIED |
| 18 | Adjusted EBITDA EUR 1,617m | VERIFIED |
| 19 | Adjusted EBITDA margin 17.5% | DERIVED — not found stated |
| 20 | Adjusted EBIT 15% | VERIFIED |
| 21 | Service EUR 4.5bn + Modernisation EUR 1.6bn | VERIFIED |
| 22 | 65% stated / 66.3% computed, both kept | VERIFIED — correct practice |
| 23 | Americas 44% of sales | VERIFIED — and see the near-miss below |
| 24 | Americas EUR 4.2bn | VERIFIED as printed — tension with #23, both kept |
| 25 | Americas adjusted EBIT margin 19.4% | VERIFIED |
| 26 | Americas mix Service 52 / Mod 19 / NI 29 | VERIFIED — carries a company footnote |
| 27 | Maintained units >1.4 million | VERIFIED |
| 28 | Owned by Advent / Cinven | VERIFIED — exact vehicle named below |
| **Mitsubishi Electric FY2026 (JPY, year ended 31 Mar 2026)** | | |
| 29 | Building Systems JPY 707.8bn | VERIFIED |
| 30 | Operating profit JPY 66.7bn (9.4%) | VERIFIED — margin stated, not computed |
| 31 | Sits inside the Life segment | VERIFIED |
| 32 | Includes non-elevator business | VERIFIED — enumerated below |
| 33 | Publishes no maintained-unit count | **QUALIFIED** — true of results, not of all disclosure |
| **The merger** | | |
| 34 | Announced 29 April 2026 | VERIFIED |
| 35 | Enterprise value EUR 29.4bn | VERIFIED — qualifier is load-bearing |
| 36 | Combined portfolio ≈3.2 million units | VERIFIED |
| 37 | Closing no earlier than Q2 2027 | VERIFIED — a second condition is uncarried |
| 38 | Contractual provision for regulator-forced divestments | VERIFIED — exists; characterise precisely |

---

## 1. KONE — FY2025

**Source (primary):** KONE Corporation, *Financial Statement Bulletin for January–December 2025*, published by KONE.
URL: https://www.kone.com/en/Images/KONE_Financial%20Statement%20Bulletin_2025_tcm17-141561.pdf
Currency EUR. Geography global except where an Area is named.

**#1 Sales — VERIFIED.** Exactly as stated: "Sales grew by 1.3% to EUR 11,245.2 (11,098.4) million". Prior-year comparative in brackets is KONE's own convention.

**#2 Adjusted EBIT — VERIFIED.** Exactly as stated: "The adjusted EBIT was EUR 1,369.3 (1,303.0) million or 12.2% (11.7%) of sales."

**#3–#5 Business lines — VERIFIED.**
- New Building Solutions EUR 4,097.7m, which "declined by 5.9% at comparable exchange rates".
- Service EUR 4,753.6m, which "grew by 7.6% at comparable exchange rates".
- Modernization EUR 2,394.0m, which "grew by 17.4% at comparable exchange rates".

Two labelling points. First, **+7.6% and +17.4% are at COMPARABLE EXCHANGE RATES**, not reported growth. Carrying either bare invites a reader to compare them against a reported-currency figure elsewhere in the document. Second, KONE spells the line **"Modernization"**; the master carries "Modernisation". Immaterial to the figure, but the quoted line name should match the source if it appears in quotation marks.

**#6 Americas — VERIFIED.** Exactly as stated: "In the Americas Area, sales grew by 3.1% and totaled EUR 2,812.1 million."
Geography label: KONE's **"Americas Area"** is a reporting Area covering North and South America. It is not a US figure, and must never be used as one.

**#7 Americas 25.0% share — DERIVED, not stated.** KONE does not print a 25.0% share. It computes as 2,812.1 / 11,245.2 = 25.007%. Legitimate arithmetic on two stated figures, but under citation law it belongs in `## Derivations` with its inputs, not carried as though KONE published it.

**#8 Maintained units — VERIFIED.** Exactly as stated: "KONE's elevator and escalator service base continued to grow and consisted of approximately 1.8 million units at the end of 2025."
Note the company's own term is **"service base"**, and the figure is expressly approximate and global.

**#9 No business-line margin — VERIFIED.** The bulletin reports consolidated adjusted EBIT only. No EBIT or margin is given for New Building Solutions, Service or Modernization separately. The claim stands as written and is a genuine analytical constraint, not an oversight in the reading.

---

## 2. Schindler — FY2025

**Sources (primary):**
- Schindler Group, *Annual Results 2025* press release / ad hoc announcement. URL: https://group.schindler.com/en/media/press-releases/annual-results-2025.html
- Schindler Group, *Financial Statements 2025*, segment note (Note 5). URL: https://group.schindler.com/content/dam/website/group/docs/investors/2025/2025-schindler-fy-financial-statements-en.pdf/_jcr_content/renditions/original./2025-schindler-fy-financial-statements-en.pdf

Currency CHF. Geography global except where a region is named.

**#10–#11 Group figures — VERIFIED.** Revenue CHF 10,947 million; order intake CHF 11,313 million; operating profit (EBIT) CHF 1,384 million; EBIT margin reported 12.6%; EBIT margin adjusted 13.3%; net profit CHF 1,073 million (9.8%). The release states growth "in local currencies of 3.1% and 1.3%, respectively" for order intake and revenue.

**#12 Americas revenue — VERIFIED**, from the segment note rather than the press release. Revenue by geographical region, CHF million:

| Region | 2025 | 2024 |
|---|---|---|
| EMEA | 5,255 | 5,142 |
| Americas | 3,214 | 3,320 |
| Asia-Pacific | 2,478 | 2,774 |
| **Group** | **10,947** | **11,236** |

**Note the annual results press release does NOT carry a regional table.** Anyone verifying #12 against the press release alone will not find it and may wrongly record it as unsourced. The figure lives in the Financial Statements segment note. Worth recording so the next pass does not re-open it.

**#13 Americas 29.4% — DERIVED, not stated.** 3,214 / 10,947 = 29.36%. Same treatment as KONE's 25.0%: register it.

**#14 Americas "down 3.2%" — DERIVED, and the currency label is load-bearing.** It computes from the two stated CHF figures: 3,214 vs 3,320 = −3.19%. Schindler does not print a −3.2% for the Americas.

This is a **relabelled-total risk of exactly the kind this pass hunts for.** The −3.2% is a decline in **reported Swiss francs**. Schindler's group revenue *grew* 1.3% in local currencies in the same year while *falling* in reported CHF from 11,236 to 10,947 — so reported-CHF movement in this document is carrying a substantial translation effect. A reader shown "Americas down 3.2%" with no currency label will read it as an underlying market decline in the Americas, which the source does not establish. If the document keeps the figure it must say **"down 3.2% in reported CHF"**, and it should not be used to support a claim about underlying Americas demand.

**#15 No business-line split, no margin split, no maintained-unit count — VERIFIED.** The segment note reports **"Elevators & Escalators" as a single segment** with one operating profit figure. Revenue is disaggregated only by timing of recognition (over time CHF 8,865m / point in time CHF 2,050m / other 32 → 10,947m), not by New Installations vs Modernization vs Service. No unit count appears anywhere in the consolidated financial statements. The press release refers to the business lines qualitatively — "In local currencies, the decline in New Installations revenue was more than offset by growth in Modernization and Service" — but quantifies none of them. All three claims stand.

**#16 The CFO quote — CORRECTED.**

Carried as: a **CFO** statement attributing an **Americas service decline** to "increased selectivity when it comes to recaptures".

What the record actually shows. The quote is real and the wording is right:

> "In service, our maintenance portfolio units continued to expand with the strongest growth in Asia-Pacific, excluding China. In Americas, we saw a modest decrease, as indicated already in October. This was a result of our increased selectivity when it comes to recaptures that we decided to pursue as well as from softer conversions."

Occasion: Schindler's full-year 2025 results call, **11 February 2026**, in the opening remarks.

**Two corrections.**

1. **The speaker is the CEO, not the CFO.** The transcript attributes the passage to **Paolo Compagna, Chief Executive Officer**. Schindler's CFO is Carla De Geyseleer, and she is on the same call — which is precisely how this kind of misattribution survives review. If the document names a role, it must name the right one; better still, name the person: *(Paolo Compagna, CEO, Schindler FY2025 results call, 11 February 2026)*.

2. **The decline is in maintenance PORTFOLIO UNITS, not service revenue.** The subject of the passage is "our maintenance portfolio units", and "In Americas, we saw a modest decrease" refers to that unit count. Carrying it as an "Americas service decline" silently converts a unit-count movement into a revenue movement. These are different quantities and, given #14 above, a reader will tend to fuse them into a single story about the Americas that neither source supports.

**Source-quality caveat, stated plainly.** Schindler does not publish a verbatim transcript of its results call. The wording above is taken from a third-party transcript of that call. It is the best available record and the substance is independently corroborated by a second transcript of the same call — which reports management explaining the Americas service unit decline as "our strategy of selectivity in recaptures" and expecting the softer NI-conversion contribution to end in 2026 — but a spoken quote resting on a commercial transcript is weaker evidence than a filed document. If this quote is to be used prominently, it should be checked against Schindler's own webcast recording before it appears in client-facing work.

---

## 3. TK Elevator — FY2024/2025 (year ended 30 September 2025)

**Sources (primary):**
- TK Elevator, *Company Presentation*, April 2026. URL: https://www.tkelevator.com/media/baet/publications/presentations/tke_company_presentation_apr-2026.pdf
- KONE Corporation inside-information release, 29 April 2026 (for sales and adjusted EBITDA, disclosed in a regulated announcement about TKE). URL: https://www.kone.com/global/en/newsroom/releases/2026/inside-information--kone-and-tke-to-combine--creating-a-world-class-company-in-the-elevator-and-escalator-industry-2026-04-29.html

Currency EUR. Fiscal year ends 30 September, **not** 31 December — so TKE's FY24/25 is not coterminous with KONE's or Schindler's FY2025, and the three are not like-for-like periods.

**What TKE does and does not disclose.** TKE has been privately held since the 2020 buyout. It publishes press releases and a public company presentation carrying headline financials, segment and regional splits. Its **audited consolidated financial statements are not publicly downloadable**: they sit behind a credentialed portal at investors.tkelevator.com, which states it "is used to communicate information to existing and prospective investors, lenders and noteholders, securities analysts, rating agencies and other eligible persons in connection with the reporting requirements under our principal financing arrangements", with access granted by application. So TKE figures in this document rest on **company-prepared IR material, not on audited statements we have read**. That is a real difference in evidentiary weight from KONE and Schindler and should be said once, near the TKE table.

**#17 Sales — VERIFIED.** KONE's release states TKE sales of **EUR 9,230 million** for 10/2024–9/2025. TKE's own presentation prints "€9.2bn in FY24/25". Both are the same figure at different precision; the master's "EUR 9.2bn" is faithful.

**#18 Adjusted EBITDA EUR 1,617m — VERIFIED.** Stated in KONE's release for the same 10/2024–9/2025 period. TKE's own results release headline says adjusted EBITDA rose "12% to a new high of €1.6bn", consistent at lower precision.

**#19 Adjusted EBITDA margin 17.5% — DERIVED, not found stated.** 1,617 / 9,230 = 17.52%. No 17.5% was located in TKE's public presentation or in KONE's release. It is sound arithmetic on two stated figures and can be carried, but it must be registered under `## Derivations` with both inputs, not attributed to TKE.

**#20 Adjusted EBIT margin 15% — VERIFIED.** Printed as "15%" for FY24/25 in the company presentation.

**#21–#22 Service and Modernisation — VERIFIED, and the handling is correct.** The presentation prints Service "4.5" and Modernization "1.6" (€bn, FY24/25), and separately prints **"65%"** as the Service + Modernization share of sales. The computed share from the rounded components is 6.1 / 9.2 = 66.3%.

**Keeping both values is right and should not be "tidied".** The 65% is TKE's own stated figure, computed off unrounded internals; the 66.3% is what the published rounded components give. Replacing them with a single number, or splitting to a midpoint, would manufacture a figure no source reports. The master's "65% stated / 66.3% computed — both values kept" is exactly the citation-law-compliant treatment.

**#23 Americas 44% of sales — VERIFIED, and this one nearly went wrong.**

The regional slide ("TKE with sweet-spot regional positions") carries **two percentage series per region — a sales share and an adjusted EBIT share**:

| Region | Sales share | Adj. EBIT share |
|---|---|---|
| Americas | 44% | 56% |
| Europe/Africa | 23% | 17% |
| Asia/Pacific (incl. Middle East) | 27% | 23% |
| Access Solutions (shown separately) | 5% | 4% |

**Near-miss worth recording.** A first reading of this slide returned "Americas: 44% adj. EBIT share and 23% sales share" — transposing the two series and pulling Europe/Africa's sales share onto the Americas row. The correct pairing was settled by summation: sales 44 + 23 + 27 + 5 = 99, adj. EBIT 56 + 17 + 23 + 4 = 100. Had the transposed reading been carried, the document would have stated that the Americas is 23% of TKE's sales — roughly half the truth — in a section whose entire point is TKE's Americas weighting. **44% is the sales share. 56% is the adjusted EBIT share.**

The 56% adjusted EBIT share is itself a strong fact the master does not currently carry: the Americas produces a **majority of TKE's adjusted EBIT off 44% of its sales**, which is the sharpest available statement of where the profit pool sits.

**#24 Americas EUR 4.2bn — VERIFIED as printed, with an unreconciled tension.** The Americas slide ("Americas: Premier business in the industry's largest regional profit pool") prints FY24/25 sales of "€4.2bn" and an adjusted EBIT margin of "19.4%", against FY21/22 of "€3.5bn" and "14.3%", with "+7% CAGR" and margin expansion of "+5.1 pts".

€4.2bn against group sales of €9,230m is 45.5%, while the regional slide prints a 44% sales share. Both figures are printed by TKE in the same document. The likely cause is the separate treatment of Access Solutions and rounding, but **no reconciliation is offered by the source and none should be invented.** Carry both as printed, attribute both to the same presentation, and do not compute a third number from them.

**#25 Americas adjusted EBIT margin 19.4% — VERIFIED.** As printed above. Note this is a **regional** margin and is far above the group adjusted EBIT margin of 15% — the two must never be interchanged.

**#26 Americas mix Service 52 / Modernisation 19 / New Installation 29 — VERIFIED**, for FY24/25, with the FY21/22 comparative printed as 52 / 16 / 33. The slide carries the footnote: **"Breakdowns may not add up to 100% due to other sales not shown."** That footnote should travel with the figures; without it the three numbers read as an exhaustive partition, which TKE expressly declines to claim.

**#27 Maintained units >1.4 million — VERIFIED.** The presentation prints "1.40m E&E units under maintenance" as of Sep-25; KONE's release states TKE has "more than 1.4 million elevator and escalator units under maintenance". Both support the carried claim. Global figure.

**#28 Ownership — VERIFIED, and the precise vehicle matters.** KONE's release identifies the seller as **"a consortium led by Advent and Cinven, through their jointly controlled holding company Vertical Topco I S.A."**

**Why this is more than a detail.** The master's use of TKE ownership bears on any "PE share of the market" statistic. TKE is a **global OEM with EUR 9.2bn of sales and 1.4 million maintained units sitting inside a private-equity-controlled structure**. Whether that population is inside or outside the denominator changes a "PE-owned share" figure by an order of magnitude, exactly as the brief anticipated. Any such statistic in the master must state explicitly whether PE-controlled OEMs are included, or it is not interpretable. Note also that the consortium is "led by" Advent and Cinven — the release does not say they are the only members, and the master should not assert that they are.

---

## 4. Mitsubishi Electric — FY2026 (year ended 31 March 2026)

**Sources (primary):**
- Mitsubishi Electric Corporation, consolidated financial results for fiscal 2026. URL: https://www.mitsubishielectric.com/en/pr/2026/pdf/0428_co1.pdf and briefing materials https://www.mitsubishielectric.com/en/pr/2026/pdf/0428_co2.pdf
- Mitsubishi Electric Corporation, *Life Business Area* strategy presentation, 29 May 2024. URL: https://www.mitsubishielectric.com/sites/news/2024/pdf/0529-a5.pdf

Currency JPY. Geography global (Mitsubishi Electric consolidated).

**#29–#30 Building Systems — VERIFIED.** As printed: "Building Systems Revenue (YoY) Operating profit (YoY) Operating profit margin (YoY) **707.8**(+41.8) **66.7**(+16.5) **9.4%**(+1.9pt)". JPY billion. The **9.4% margin is stated by the company**, not computed by us — unlike KONE's and Schindler's Americas shares. Revenue rose JPY 41.8bn and operating profit JPY 16.5bn year on year, with margin up 1.9 percentage points.

**#31 Sits inside the Life segment — VERIFIED.** Life segment FY2026 revenue JPY 2,318.2bn, operating profit JPY 170.5bn. Building Systems is one of two businesses in Life, the other being air conditioning systems and home products. So Building Systems is roughly 31% of Life revenue and Life is materially larger than the elevator business — any read-across from Life-level figures to elevators is wrong.

**#32 Includes non-elevator business — VERIFIED, and the contamination is substantial.** Per Mitsubishi Electric's own Life Business Area presentation, the Building Systems business comprises, in addition to elevators and escalators (new installation, maintenance and renewal):

- **building management systems** — "System control by connecting energy saving equipment and sensors"
- **security systems** — "Network cameras (Video monitoring system)" and "Access control system"
- **power equipment** — "DC power distribution system", "UPS (Uninterruptable Power Supply)", "Emergency power generation equipment"
- **lighting systems**
- **facility management services** — maintenance, repair, remote monitoring and renewal

This is a wide non-elevator perimeter. **JPY 707.8bn is therefore not an elevator-and-escalator revenue figure**, and the 9.4% margin is not an elevator margin. If the master uses either to compare Mitsubishi against KONE, Schindler or TKE — all of whom report far closer to pure elevator perimeters — the comparison is not like-for-like and the document must say so at the point of comparison, not only in a note. The claim as carried is correct; the risk is that a correct claim sits beside a table that invites the reader to compare anyway.

**#33 Publishes no maintained-unit count — QUALIFIED.**

True of the **financial results**: no maintained or serviced unit count appears in the FY2026 consolidated results materials. But it is **not true that Mitsubishi Electric publishes no such figure anywhere.** Its own Life Business Area presentation of 29 May 2024 claims **"Top-class maintenance stock in Japan"** and sets an elevator/escalator maintenance stock target of **"1 million units to 1.3 million units"** by FY2026.

Three cautions if that figure is used. It is a **target range, not an actual**; it is expressed as a range and must never be collapsed to a midpoint; and the surrounding claim is **Japan-specific**, so it cannot be treated as a global maintained portfolio comparable to KONE's 1.8 million or TKE's 1.4 million. The safest form of the master's claim is: *Mitsubishi Electric does not disclose a maintained-unit count in its financial reporting*, which is exactly true, rather than the unqualified *publishes no maintained-unit count*, which is not.

---

## 5. THE MERGER — KONE / TK Elevator

**Source (primary):** KONE Corporation, inside-information stock exchange release, **29 April 2026**, "KONE and TKE to combine, creating a world-class company in the elevator and escalator industry".
URL: https://www.kone.com/global/en/newsroom/releases/2026/inside-information--kone-and-tke-to-combine--creating-a-world-class-company-in-the-elevator-and-escalator-industry-2026-04-29.html
Corroborated against the same announcement published by **TK Elevator** and by **Cinven**. Currency EUR.

This is a regulated inside-information disclosure by a listed issuer — the strongest class of source available for this cluster.

**#34 Announcement date 29 April 2026 — VERIFIED.**

**#35 Enterprise value EUR 29.4bn — VERIFIED, and the qualifier is load-bearing.** Exactly as stated: the total consideration "would result in an enterprise value for TKE of **EUR 29.4 billion, including interest-bearing net debt**, based on the above assumptions".

Two things must travel with this number. It is an **enterprise value including interest-bearing net debt**, not an equity price. And it is expressly **"based on the above assumptions"** — the consideration comprises cash plus newly issued KONE class B shares, so the headline EV is sensitive to the KONE share price used and is **subject to adjustment at completion** (see #38). Carrying "EUR 29.4bn" as a fixed, settled price would overstate what the release says. Note also that widely reported USD equivalents circulating in trade and financial press are conversions, not figures the parties disclosed — the parties' number is in euros.

**#36 Combined portfolio ≈3.2 million units — VERIFIED.** The combined company is described as having "approximately **3.2 million units under maintenance**" and "approximately **EUR 20.5 billion in annual sales**". The EUR 20.5bn combined sales figure is a strong fact the master does not currently carry and is worth adding alongside the unit count.

Sense check, for confidence rather than for publication: KONE ≈1.8m + TKE ≈1.4m ≈ 3.2m. The parties' figure and the components agree; do not publish the arithmetic as if it were an independent confirmation.

**#37 Closing no earlier than Q2 2027 — VERIFIED, with one condition the master omits.** Exactly as stated: completion "is subject to regulatory approvals **and KONE shareholder approval** and is expected to occur **earliest in the second quarter of 2027**".

The master carries the timing and the regulatory condition but **not the KONE shareholder-approval condition**. That should be added. Because part of the consideration is newly issued KONE class B shares, the shareholder vote is a real gate, not a formality, and it is the condition most likely to be misread as already satisfied.

**#38 The divestment provision — VERIFIED. It exists. Here is the actual language.**

This was flagged as the commercially important element, and it is confirmed. The share purchase agreement expressly contemplates regulator-driven divestments and adjusts the price for them:

> "Under the terms of the share purchase agreement entered into between KONE and Vertical Topco I S.A. (the "SPA") the total consideration, including the number of class B shares in KONE to be issued as share consideration and the cash consideration, would be adjusted in connection with completion, based on (i) **the terms and scope of any potential divestments of TKE's or KONE's current business operations required for the satisfaction of regulatory conditions to completion**, and (ii) certain other customary purchase price adjustments."

And separately:

> "Completion of the transaction is also subject to regulatory approvals in several jurisdictions. KONE is confident that it will secure all necessary regulatory approvals **in accordance with its contractual commitments** while preserving the strategic rationale of the combination."

**Characterise this precisely — the distinction is where a reader will go wrong.** What the release discloses is a **consideration-adjustment mechanism keyed to divestments**: if regulators require divestments of TKE's *or KONE's* operations, the price moves. The phrase "in accordance with its contractual commitments" confirms the SPA contains **defined remedy obligations on KONE**, but the release **does not publish their content, scope or any cap**, and it does not state a hell-or-high-water standard. So:

- **Supportable:** the SPA expressly anticipates regulator-required divestments, contemplates that they may fall on **either party's** business, and adjusts the total consideration for their terms and scope; KONE has contractual commitments regarding securing approvals.
- **NOT supportable from this release:** that KONE is obliged to divest whatever is demanded, that any specific business or geography is earmarked, that a cap exists at any level, or that any particular divestment is expected. None of that is disclosed.

Two further points for the master. First, the explicit inclusion of **"KONE's current business operations"** — not merely TKE's — is the single most actionable detail here: the parties themselves contemplate that KONE assets may have to be sold to clear the deal. Second, the units under discussion are a combined **≈3.2 million-unit maintenance portfolio** across overlapping geographies, and any divested route density would be a live asset for a regional consolidator. That is a legitimate inference to draw *provided* it is framed as an inference from the disclosed provision, and not as a disclosed intention. The release announces no divestment.

**Regarding TKE's and Cinven's versions of the announcement:** both carry the EUR 29.4bn enterprise value, the ≈3.2 million combined units and the Q2 2027 earliest completion. The **detailed SPA divestment language quoted above appears in KONE's regulated release**, which is the version to cite for #38. Citing the TKE or Cinven page for the divestment provision would not support it.

---

## 6. Cross-cluster cautions

**Fiscal periods are not aligned. Do not build a four-way table without labelling them.** KONE and Schindler report to 31 December 2025; TKE to 30 September 2025; Mitsubishi Electric to 31 March 2026. Four different windows, spanning eighteen months end to end.

**Three currencies, no common base.** EUR (KONE, TKE), CHF (Schindler), JPY (Mitsubishi). No FX conversion has been performed in this pass and none should be added to the master without registering the rate and date used as a derivation.

**Perimeters differ materially.** KONE and Schindler are close to pure elevator and escalator companies; TKE includes an Access Solutions business shown separately at 5% of sales; Mitsubishi's Building Systems includes building management, security, power and lighting. Margin comparison across the four is not like-for-like.

**"Americas" is a different object in each document.** KONE's "Americas Area" is a reporting Area covering North and South America. Schindler's "Americas" is a geographical region in its segment note. TKE's "Americas" is a reporting region excluding the separately shown Access Solutions. None of the three is a US figure, and no US-only revenue figure for any of these four companies was located in this pass.

**Shares and growth rates are frequently ours, not theirs.** Of the percentages carried in this cluster, KONE's 25.0%, Schindler's 29.4% and −3.2%, and TKE's 17.5% and 66.3% are all **computed**, while Mitsubishi's 9.4%, TKE's 15%, 19.4%, 44%, 65% and the mix percentages, and KONE's 12.2%, +7.6% and +17.4% are **stated by the issuer**. The master should not present the two classes identically.

---

## 7. Corrections to register in `## A.0.x`

1. **Schindler CFO quote → CEO.** Was: attributed to the CFO. Actually: **Paolo Compagna, Chief Executive Officer**, Schindler FY2025 results call, 11 February 2026. Source: transcript of that call. Schindler publishes no verbatim transcript; attribution should be confirmed against the company webcast before prominent use.
2. **Schindler quote subject → maintenance portfolio units, not service revenue.** Was: "an Americas service decline". Actually: "In service, our **maintenance portfolio units** continued to expand… In Americas, we saw a modest decrease".
3. **Schindler Americas −3.2% → reported CHF.** Was: "down 3.2%" unqualified. Actually: derived from CHF 3,320m (2024) to CHF 3,214m (2025) as reported in Swiss francs. Not a local-currency or underlying decline. Group revenue grew 1.3% in local currencies in the same year.
4. **Mitsubishi maintained units → qualify the claim.** Was: "publishes no maintained-unit count". Actually: none in financial reporting, but a Japan-specific maintenance stock **target** of "1 million units to 1.3 million units" by FY2026 appears in the company's Life Business Area presentation of 29 May 2024.
5. **Derived percentages to be registered under `## Derivations`, not attributed to issuers:** KONE Americas 25.0%; Schindler Americas 29.4% and −3.2%; TKE adjusted EBITDA margin 17.5%; TKE Service+Mod 66.3% (the 65% is stated and stays as stated).

## 8. Additions the sources support that the master does not carry

1. **Combined annual sales ≈ EUR 20.5 billion** — KONE release, 29 April 2026.
2. **KONE shareholder approval is a completion condition**, alongside regulatory approvals — KONE release.
3. **TKE Americas produces 56% of adjusted EBIT on 44% of sales** — TKE company presentation, April 2026.
4. **The SPA contemplates divestments of KONE's own operations, not only TKE's** — KONE release.
5. **TKE's audited consolidated statements are not publicly available**, sitting behind a credentialed noteholder portal — investors.tkelevator.com.

## 9. Nothing in this cluster was NOT FOUND

Every figure in the brief was located in an issuing-body document and either verified, corrected, or reclassified as derived. No carried figure in this cluster proved to be absent from its source, and no fabrication was detected. The failures found are **labelling failures** — currency, speaker, scope and stated-versus-computed — not invented numbers.

---


# Labor and operating economics

# Verification Pass 6 — Labor and Operating Economics

**Market:** elevator and escalator service
**Cluster:** labor, wages, union, apprenticeship, prevailing wage
**Verifier pass date:** 2026-08-11
**Method:** issuing body only. BLS OEWS/OOH tables at bls.gov, the California DIR determination PDF itself, the IUEC's own posting of the NEBA agreement, NEIEP's own FAQ, California DAS training criteria. Secondary republishers were used only to characterise an existing weak citation, never to confirm a figure.

---

## Summary table

| # | Figure as carried | Verdict | Source reached |
|---|---|---|---|
| 1 | OEWS May 2023, 47-4021 employment **23,990** | **VERIFIED** | bls.gov OEWS May 2023 |
| 2 | Median annual wage **$102,420** | **VERIFIED** | same |
| 3 | Mean annual wage **$100,060** | **VERIFIED** | same |
| 4 | 90th percentile **$138,910** | **VERIFIED** | same |
| 5a | OOH **24,200** jobs (2024) | **VERIFIED** | bls.gov OOH |
| 5b | OOH median **$106,580** (2024) | **VERIFIED** | same |
| 5c | Projected **+5%**, 2024–34 | **VERIFIED** | same |
| 5d | **~2,000** openings/yr | **VERIFIED** | same |
| 5e | **~94%** replacement rather than growth | **VERIFIED as derivation** — arithmetic sound; OOH does not state it; terminology is wrong | derived from 5c–5e |
| 6 | HVAC median **$57,300** | **VERIFIED** | OEWS May 2023, 49-9021 |
| 7 | Plumber 90th **$103,140** | **VERIFIED** | OEWS May 2023, 47-2152 |
| 8 | HVAC 90th **$84,250** | **VERIFIED** | OEWS May 2023, 49-9021 |
| 9a | Elevator median within **1%** of plumber 90th | **VERIFIED** (−0.698%) | derived |
| 9b | Exceeds HVAC 90th by **21.6%** | **VERIFIED** (+21.567%) | derived |
| 9c | **1.79×** HVAC median | **VERIFIED** (1.787435) | derived |
| 9d | **Same-vintage comparison?** | **VERIFIED — all four are OEWS May 2023, national, same table family.** Comparison is valid | see § Vintage |
| 10a | DIR determination **SC-62-X-999-2023-1** | **VERIFIED** | dir.ca.gov PDF |
| 10b | Mechanic basic **$63.95/hr** | **VERIFIED** | same |
| 10c | Total package **$108.095/hr** | **VERIFIED** (components sum exactly) | same |
| 10d | **69%** fringe load | **VERIFIED as derivation** (69.03%) | derived |
| 10e | Determination is current | **CORRECTED — expired 2023-12-31** | same |
| 11a | IUEC membership **31,290** | **UNVERIFIABLE** — OLMS unreachable on every channel | blocked, see § OLMS |
| 11b | "Year covered 2025" | **UNVERIFIABLE** (advocacy republisher only) | blocked |
| 11c | Fiscal year ending **30 June** | **NOT FOUND** — the cited page states no fiscal year end | unionfacts.com |
| 11d | Scope of 31,290 vs BLS US employment | **CORRECTED — populations are not comparable** | see § Scope |
| 12 | IUEC "**30,000+** across the US and Canada" | **VERIFIED**, two-country scope confirmed | iuec.org |
| 13a | NEBA term **2022–27**, seven major OEMs | **Term VERIFIED. Signatories NOT FOUND** | iuec.org PDF |
| 13b | Annual increases **3.45–3.50%** | **VERIFIED** | same |
| 13c | **1:1 hard cap** on helpers/apprentices per mechanic | **CORRECTED — it is not a hard cap, and not per-firm** | same |
| 13d | Overtime straight to **double time** | **VERIFIED** | same |
| 14a | NEIEP **4 years** | **VERIFIED** | dir.ca.gov DAS |
| 14b | **6,800** OJT hours | **VERIFIED**, but source is a California state standard and NEIEP's own text conflicts | dir.ca.gov DAS / neiep.org |
| 14c | **144** classroom hours per year | **VERIFIED** | neiep.org FAQ |
| 14d | Annual completions *not published* | **CONFIRMED not published** | neiep.org |

**Overturned or unsupported: 13c (NEBA ratio), 10e (expired determination), 11c (fiscal year end), 11d (scope), 13a signatories (not found), plus a currency flag on the whole OEWS block.**

---

## 1–4. BLS OEWS, May 2023, SOC 47-4021 — all VERIFIED

Source: *Occupational Employment and Wages, May 2023 — 47-4021 Elevator and Escalator Installers and Repairers*, U.S. Bureau of Labor Statistics. Last Modified April 3, 2024. https://www.bls.gov/oes/2023/may/oes474021.htm

Quoted exactly as published:

| Item | As published |
|---|---|
| Occupation | "47-4021 Elevator and Escalator Installers and Repairers" |
| Employment | **23,990** |
| Employment RSE | 6.2% |
| Mean hourly wage | $48.11 |
| Mean annual wage | **$100,060** |
| Wage RSE | 1.2% |
| 10th percentile annual | $51,960 |
| 25th percentile annual | $75,570 |
| Median (50th) annual | **$102,420** |
| 75th percentile annual | $127,310 |
| 90th percentile annual | **$138,910** |

All four figures as carried are exact. No rounding drift.

Note for the analyst, not a defect: median hourly is $49.24 and mean hourly $48.11 — the median exceeds the mean, the signature of a wage floor set by a national agreement rather than a market. That is a real supporting fact for the Part VI argument and it is on the same table.

## 5. BLS Occupational Outlook Handbook — VERIFIED, with one terminology correction

Source: *Occupational Outlook Handbook — Elevator and Escalator Installers and Repairers*, BLS. Last Modified Date: August 28, 2025. https://www.bls.gov/ooh/construction-and-extraction/elevator-installers-and-repairers.htm

Quoted exactly from Quick Facts:

- 2024 Median Pay: "$106,580 per year   $51.24 per hour"
- Number of Jobs, 2024: "24,200"
- Job Outlook, 2024–34: "5% (Faster than average)"
- Employment Change, 2024–34: "1,200"
- Typical Entry-Level Education: "High school diploma or equivalent"
- On-the-job Training: "Apprenticeship"
- Openings: "About 2,000 openings for elevator and escalator installers and repairers are projected each year, on average, over the decade."

### The 94% — arithmetic checked, and it holds

The OOH does **not** state 94% anywhere. It is a derivation and must be registered under `## Derivations`:

```
Openings over the decade = 2,000/yr × 10 yr        = 20,000
Employment change (growth) 2024–34                 =  1,200
Growth share of openings   = 1,200 / 20,000        =   6.0%
Non-growth share           = 1 − 0.06              =  94.0%
```

Sensitivity to the rounded input: "about 2,000" could be 1,950–2,049, giving 93.85%–94.14%. The claim is robust to the rounding. **VERIFIED as a derivation.**

**One correction to make, and it is a wording correction, not a number.** BLS does not use "replacement demand." Its projections define total openings as growth **plus occupational transfers plus labor force exits**. "Occupational transfers" are people moving to a different occupation — that is not replacement of a retiring mechanic, it is attrition to other work. The document should say **"94% of projected openings come from separations rather than growth"** and not "replacement demand," which asserts a retirement story the table does not support on its own. The economic point the document is making survives the rewording intact.

## 6–9. Cross-trade comparison — SAME VINTAGE, comparison is valid

This was the flagged risk and it comes back clean. All four wage figures are from **OEWS May 2023**, national estimates, same release, all Last Modified April 3, 2024.

| Occupation | SOC | Median annual | 90th pct annual | Source |
|---|---|---|---|---|
| Elevator and escalator installers and repairers | 47-4021 | $102,420 | $138,910 | oes474021.htm |
| Heating, Air Conditioning, and Refrigeration Mechanics and Installers | 49-9021 | **$57,300** | **$84,250** | oes499021.htm |
| Plumbers, Pipefitters, and Steamfitters | 47-2152 | $61,550 | **$103,140** | oes472152.htm |

Supporting figures from the same tables: HVAC employment 397,450, mean annual $59,620; plumbers employment 436,160, mean annual $67,840.

Derived claims, recomputed:

| Claim | Computation | Result | Carried | Verdict |
|---|---|---|---|---|
| Elevator median within 1% of plumber 90th | 102,420 ÷ 103,140 | 0.993019 → **0.698% below** | "within 1%" | VERIFIED |
| Exceeds HVAC 90th | 102,420 ÷ 84,250 | 1.215668 → **+21.567%** | "21.6%" | VERIFIED |
| Multiple of HVAC median | 102,420 ÷ 57,300 | **1.787435** | "1.79×" | VERIFIED |

**No vintage mismatch. The Part VI argument is not built on a mismatch.** Note that the comparison correctly uses the OEWS May 2023 elevator median of $102,420, not the OOH 2024 figure of $106,580 — substituting the OOH figure would break the "within 1%" claim (it would be 3.3% above). Whoever built this block kept the vintages straight. **Do not let a later editor "update" the elevator median to $106,580 without recomputing all three derived claims.**

### Currency flag — the block is same-vintage but stale

The BLS OEWS landing page, retrieved 2026-08-11 and last modified May 15, 2026, presents **May 2025** as the most recent dataset. The document is carrying May 2023 — two vintages behind.

I could **not** retrieve the May 2024 or May 2025 occupation pages: the year-path URLs (`/oes/2024/may/oes474021.htm`, `/oes/2025/may/oes474021.htm`) and `/oes/current/oes474021.htm` all resolved to the OEWS landing page rather than the occupation table. So I state only that a newer vintage exists; **I make no claim about what the newer figures are.** This is a currency issue to resolve before publication, not a fabrication. If the block is refreshed, all four figures and all three derived claims move together or not at all.

## 10. California DIR prevailing wage determination — VERIFIED, but EXPIRED

Source: *General Prevailing Wage Determination SC-62-X-999-2023-1*, California Department of Industrial Relations, Office of the Director – Research Unit. https://www.dir.ca.gov/OPRL/2023-1/PWD/Determinations/Southern/SC-062-X-999.pdf

- Determination number: **SC-62-X-999-2023-1** — confirmed exactly as carried
- Craft: "Elevator Constructor"
- Issue Date: **February 22, 2023**
- Effective Until: **December 31, 2023**
- Localities: "All localities within Imperial, Los Angeles, Orange, Riverside, San Diego, Santa Barbara and Ventura counties. Portions of Kern, San Bernardino and San Luis Obispo counties"

Elevator Mechanic (Journeyperson), as printed:

| Component | Rate |
|---|---|
| Basic Hourly Rate | **$63.95** |
| Health and Welfare | $16.075 |
| Pension | $20.56 |
| Vacation and Holiday | $5.81 |
| Training | $0.70 |
| Other | $1.00 |
| **Total Hourly Rate** | **$108.095** |

Both carried rates are exact. The components sum to $44.145 in fringes; $63.95 + $44.145 = $108.095 exactly — the total is internally consistent, which is worth knowing because a mis-transcribed fringe line would not otherwise show.

Fringe load, derived: 44.145 ÷ 63.95 = **69.03%**, carried as 69%. **VERIFIED as a derivation** — register the inputs and the arithmetic.

**CORRECTED — the determination is expired.** It ran to 2023-12-31 and is superseded; later determinations exist in the same series (a 2023-2 determination and a 2025-1 predetermined-increase sheet both appear in the DIR directory). The document must either date-label this explicitly as the 2023-1 determination, or refresh to the current one. A prevailing wage presented as current when it is thirty-one months expired is exactly the kind of figure a client checks.

**Scope caution:** this is Southern California only, one craft, one determination. It is a legitimate illustration of a union-scale total package; it is not a national labour cost and must not be presented as one.

## 11. IUEC membership — UNVERIFIABLE. I did not reach OLMS.

**I could not reach DOL OLMS on any available channel.** Exactly what blocked me, so it can be retried from a machine with clean egress:

| Attempt | Result |
|---|---|
| `curl https://olmsapps.dol.gov/query/orgReport.do?rptId=923620&rptForm=LM2Form | **CONNECT tunnel failed, HTTP 403** — destination denied by this session's egress policy. Proxy status endpoint confirms `connect_rejected` / "policy denial". Not retried, per policy. |
| Managed fetcher, same `/query/` URL (twice) | **ROBOTS_DISALLOWED** — "robots.txt fetch failed: [SSL: CERTIFICATE_VERIFY_FAILED]" for host `olmsapps.dol.gov`. Fetcher defaults to disallow when robots cannot be read. |
| https://olmsapps.dol.gov/olpdr/ (OPDR root) | **Reached** — but it is an Angular single-page app; the response is an unrendered template of `{{union.lmNo}}` / `{{rpt.fileId}}` placeholders with no data. |
| https://olmsapps.dol.gov/olpdr/rest/unionAnnualReports/923620 | **ROBOTS_DISALLOWED** |
| https://olmsapps.dol.gov/olpdr/Guide_to_Working_with_OLMS_LM_Data.pdf (bulk-data guide) | **ROBOTS_DISALLOWED** |
| https://olmsapps.dol.gov/Disclosure/ | Reached; an ordering page only, no queryable report path |
| Wayback capture of the LM-2 report page | **PROXY_REJECTED (403)** |

So **neither the IUEC national filing (file 000-197, report id 923620) nor IUEC Local 1 (file 047-117, report id 925791) was retrieved.** Nothing in this pass confirms or overturns 31,290. It stays **UNVERIFIABLE** and must not be upgraded to "verified" on the strength of this pass.

What the existing citation actually is, documented precisely so the weakness is legible:

> Center for Union Facts, "Elevator Constructors Union," https://unionfacts.com/union/elevator_constructors/ — states members **31,290**, year covered **2025**, credits "Office of Labor-Management Standards," "Last Updated: April 23rd, 2026." **It states no file number, no report id, no fiscal year end date, and provides no hyperlink to the DOL filing.**

Two consequences:

- **11c — NOT FOUND.** The carried detail "fiscal year ending 30 June" is **not on the cited page**. The page states no fiscal year end at all. That detail has been attached to the figure from somewhere unrecorded and must be removed or independently sourced.
- **This is a textbook laundered citation.** An advocacy organisation naming a government body with no table, no page and no date for the underlying record. Per the practice's own test — "if a citation has no table, no page and no date, it is not a citation" — this does not qualify, and it is the weakest citation in the document as flagged.

**Recommendation:** retrieve report id 923620 from `olmsapps.dol.gov` from an unrestricted machine and quote Item 20 directly, or state the membership figure is unavailable. Do not carry an advocacy republisher as the source of a load-bearing figure.

### 11d. Scope — CORRECTED. This is a relabelled total waiting to happen.

**31,290 and 23,990 are not the same population and must never be juxtaposed as if they were.**

- BLS 47-4021 employment **23,990** — *United States only*, an occupational employment estimate of wage-and-salary jobs.
- IUEC membership **31,290** — a *labor organization's total membership*, and the IUEC is an international union covering **the United States and Canada**. Its membership includes Canadian members, retirees and members not currently employed in the occupation.

The union figure is **larger than** the entire US occupational employment estimate. Any sentence that puts them side by side implies a unionisation rate above 100% and will be caught immediately by a reader who knows the trade. If the document wants to make a density claim, it needs a US-only union membership figure from the LM-2 (which is why reaching OLMS matters), or it must state the comparison's limits explicitly.

## 12. IUEC's own figure — VERIFIED, two-country scope confirmed

Source: IUEC, https://www.iuec.org/about, retrieved 2026-08-11. Exact sentence:

> "The IUEC represents 30,000+ skilled elevator constructors across the US and Canada."

**Scope is US + Canada, stated by the union itself.** It is not a US figure and must be labelled as such wherever it appears. It is consistent in magnitude with the unverified 31,290, which is mild corroboration of order of magnitude and nothing more — it does not rescue figure 11.

## 13. NEBA national agreement — the most important correction in this pass

Source: *National Elevator Bargaining Association Agreement with International Union of Elevator Constructors*, posted by the IUEC. https://iuec.org/wp-content/uploads/2022-2027-NEBA-Agreement.pdf

**Term — VERIFIED.** July 9, 2022 to July 8, 2027. "2022–27" as carried is right.

### 13b. Annual increases — VERIFIED

Article V, Par. 1:

| Year | Increase | Effective |
|---|---|---|
| 1st | **3.50%** | January 1, 2023 |
| 2nd | **3.45%** | January 1, 2024 |
| 3rd | **3.45%** | January 1, 2025 |
| 4th | **3.45%** | January 1, 2026 |
| 5th | **3.50%** | January 1, 2027 |

Range **3.45–3.50%** exactly as carried. Both endpoints are real reported values, not an invented range.

### 13c. The ratio — **CORRECTED. It is not a 1:1 hard cap.**

The document calls this "the single most important operating constraint" and concludes "headcount cannot be bought." The agreement does not say what the document says it says. Article X, Par. 2, verbatim:

> "The total number of Helpers, Apprentices and Assistant Mechanics employed shall not exceed the number of Mechanics on any one job, except on jobs where two teams or more are working, one extra Helper, Apprentice or Assistant Mechanic may be employed for the first two teams and an extra Helper, Apprentice or Assistant Mechanic for each additional three teams."

Three distinct errors in the figure as carried:

1. **It is not a "hard cap."** The clause contains an express exception permitting the ratio to be *exceeded* on multi-team jobs — one extra for the first two teams, plus one more for each additional three teams. A cap with a written escape clause is a constraint, not a hard cap, and "hard" is the word doing the analytical work in the document.
2. **It covers three classifications, not two.** "Helpers, Apprentices **and Assistant Mechanics**." Dropping Assistant Mechanics understates the denominator of who counts against the ratio and misdescribes the crew structure.
3. **It binds per job, not per firm.** "on any one job." It is a jobsite crew-composition rule. The document uses it to support a company-level claim about headcount growth, and the clause does not reach that far on its own.

**The underlying argument may well survive** — a per-job 1:1-plus-slack ratio still constrains how fast a contractor can lever mechanics with cheaper labour, and combined with the four-year apprenticeship it still explains why headcount is slow to build. But the document must quote the clause as written, drop "hard cap," and make the per-job scope explicit. As carried it overstates a real constraint, and it is the load-bearing claim of the section — which is precisely where an overstatement costs the most.

### 13d. Overtime — VERIFIED

Article VII, Par. 3 (Construction Work), verbatim:

> "Work performed on Construction Work on Saturdays, Sundays and before and after the regular working day on Monday to Friday, inclusive, shall be classed as overtime, and paid for at double the rate of single time."

Parallel provisions appear at Article VIII, Par. 5 (Repair Work) and Article VIII(A), Par. 2 (Modernization Work). "Straight to double time" is supported: the agreement moves from single time to double time with no intermediate time-and-a-half tier in these provisions. Cite the article and paragraph when used.

### 13a. "Signed by all seven major OEMs" — **NOT FOUND**

The agreement states, at Article I:

> "a list of the Employers for which NEBA negotiates and executes this Agreement is attached hereto and made a part hereof."

**The list is not in the posted PDF, and no signature page is present in it.** So the primary document was reached and the claim is absent from it. The number seven, and the identity of the signatories, are not supported by the agreement as published on the union's own site.

This is a specific, checkable, named claim about which companies are bound — the kind a client will test. Either source the employer schedule (a NEBA or NEII membership roster, or a copy of the agreement including its attachment) or reduce the claim to what the document supports: that NEBA negotiates the national agreement on behalf of its employer members. Do not carry "all seven major OEMs" on the strength of the agreement text alone.

## 14. NEIEP apprenticeship — VERIFIED, with a conflict to carry

**14a/14b. Four years and 6,800 hours — VERIFIED**, from the California Division of Apprenticeship Standards:

Source: *Elevator Constructor Industry Training Criteria (O\*NET CODE 47-402100)*, California DIR / DAS. https://dir.ca.gov/das/MITC/MITC/Elevator/ElevatorConstructorIndustryTraining.pdf

> "a minimum of a four (4) year program"
> "not less than 6,800 hours of on‐the‐job training"
> "no less than 144 hours per year"

**14c. 144 classroom hours per year — VERIFIED from NEIEP itself**, which is the better source for this one:

Source: NEIEP, "Elevator Apprentices Frequently Asked Questions," https://www.neiep.org/iuec-apprenticeship-faq/

> "The IUEC apprenticeship requires 144 hours per year in the NEIEP classroom."
> "Each semester consists of 72 hours of training with a NEIEP instructor. The 72 hours are spread out over 18 weeks, with students attending class in person for four hours one night a week."

Two semesters × 72 hours = 144, internally consistent.

### The conflict on OJT hours — carry both, do not split

The 6,800 figure is verified, but note precisely what it is: **a California state apprenticeship standard**, not a NEIEP national publication. NEIEP's own material says something different:

- NEIEP FAQ: "Apprentices must work full-time in their trade, usually **2,000 hours for every calendar year** of their apprenticeship." Over four years that implies **≈8,000 hours**, not 6,800.
- NEIEP homepage: "Apprenticeships will last **four to five years**" and "100-200 hours of classes" per year — looser than, and in the classroom case inconsistent with, the FAQ's firm 144.

Per citation law, **keep both values and cite both**: 6,800 hours is the California DAS minimum criterion; NEIEP's own description implies roughly 2,000 hours per year. **Do not average them into a midpoint no source reported.** The cleanest formulation for the document is that the program is a four-year registered apprenticeship requiring not less than 6,800 hours of on-the-job training (California DAS criteria) alongside 144 classroom hours per year (NEIEP), and to attribute the 6,800 to California rather than presenting it as a national NEIEP figure.

**14d. Annual completions — CONFIRMED not published.** Neither the NEIEP homepage nor the apprenticeship FAQ publishes completion, graduation or class-size counts. Carrying it as "not published" is correct and should stay. If a throughput number is ever needed, the route is DOL's registered apprenticeship data (RAPIDS) by program sponsor, not NEIEP.

---

## What a later editor must not do

1. **Do not "update" the elevator median to $106,580** inside the cross-trade block. It breaks the "within 1%" claim. The block is OEWS May 2023 throughout; refresh all four figures together or none.
2. **Do not restore "1:1 hard cap."** The clause has a written exception and covers Assistant Mechanics too.
3. **Do not upgrade 31,290 to verified** without an actual OLMS retrieval. This pass did not reach it.
4. **Do not place 31,290 beside 23,990.** Different countries, different populations.
5. **Do not present SC-62-X-999-2023-1 as a current rate.** It expired 2023-12-31.

## Sources reached in this pass

| Source | URL | Retrieved |
|---|---|---|
| BLS OEWS May 2023, 47-4021 | https://www.bls.gov/oes/2023/may/oes474021.htm | 2026-08-11 |
| BLS OEWS May 2023, 49-9021 | https://www.bls.gov/oes/2023/may/oes499021.htm | 2026-08-11 |
| BLS OEWS May 2023, 47-2152 | https://www.bls.gov/oes/2023/may/oes472152.htm | 2026-08-11 |
| BLS OOH, elevator installers and repairers | https://www.bls.gov/ooh/construction-and-extraction/elevator-installers-and-repairers.htm | 2026-08-11 |
| California DIR, SC-62-X-999-2023-1 | https://www.dir.ca.gov/OPRL/2023-1/PWD/Determinations/Southern/SC-062-X-999.pdf | 2026-08-11 |
| NEBA–IUEC agreement 2022–27 | https://iuec.org/wp-content/uploads/2022-2027-NEBA-Agreement.pdf | 2026-08-11 |
| IUEC, About | https://www.iuec.org/about | 2026-08-11 |
| NEIEP apprenticeship FAQ | https://www.neiep.org/iuec-apprenticeship-faq/ | 2026-08-11 |
| NEIEP homepage | https://www.neiep.org/ | 2026-08-11 |
| California DAS elevator training criteria | https://dir.ca.gov/das/MITC/MITC/Elevator/ElevatorConstructorIndustryTraining.pdf | 2026-08-11 |
| Center for Union Facts (characterised, not relied on) | https://unionfacts.com/union/elevator_constructors/ | 2026-08-11 |

**Not reached:** DOL OLMS (`olmsapps.dol.gov`) report ids 923620 and 925791 — see § 11 for the exact blockers.

---


# Codes and the legal record

# Pass 6 — Primary-source verification: CODE AND LEGAL CITATIONS
## Elevator market assessment · verification date 2026-08-11

**Evidence classes used throughout, per the method:**

- **(a) THE INSTRUMENT** — the code text, statute, administrative rule or court opinion itself.
- **(b) A REGULATOR REPRODUCING IT** — a state or federal agency restating the requirement in its own published document (survey form, adopted rule, bulletin).
- **(c) SOMEONE DESCRIBING IT** — trade association, consultant, press, aggregator.
- **(d) SEARCH-INDEX MATCH ONLY** — an exact-phrase query matched a document I could not retrieve.
  This is the weakest class and is flagged wherever used.

**Access constraint, stated once.** ASME A17.1 and A17.3 are paywalled and were not
bypassed. NFPA 101 is behind free-registration on NFPA's own platform and is
robots-disallowed on UpCodes; neither was bypassed. Where that blocked class (a),
the verdict says so.

---

## SUMMARY TABLE

| # | Citation as carried | Verdict |
|---|---|---|
| 1a | NFPA 101 §9.4.2.1 — new installations → A17.1/CSA B44 | **VERIFIED** (class c, verbatim) |
| 1b | NFPA 101 §9.4.2.2 — existing → A17.3, section number and substance | **VERIFIED** (class b) |
| 1c | NFPA 101 §9.4.2.2 — the exact quoted wording *"shall be in accordance with"* | **CORRECTED** → *"shall conform with"* (class d) |
| 1d | Requirement stable back to NFPA 101-2000 §9.4.2 | **UNVERIFIABLE** |
| 2a | CMS-2786R exists, carries tag K531 with the A17.3 sentence | **VERIFIED** (class a) |
| 2b | CMS adopted the 2012 Life Safety Code | **VERIFIED** (class a/b) |
| 2c | 26 TAC §505.164 cites NFPA 101 §9.4.3 by number | **VERIFIED** (class a) |
| 3a | A17.1 §8.6.1.2 requires a written Maintenance Control Program | **VERIFIED** (class b, via Florida rule) |
| 3b | The MCP contents list (tasks, procedures, examinations, tests, as-built wiring diagrams) | **UNVERIFIABLE** (paywall) |
| 3c | A17.2-2010 refers to *"the MCP as required by 8.6.1.2.1"* | **UNVERIFIABLE** (retrieval truncated) |
| 3d | Illinois OSFM quotes A17.1-2007 §8.6.1.2 as *"A written Maintenance Control Program shall be in place"* | **NOT FOUND** |
| 3e | Florida 61C-5.0015 enforces §8.6.1.2 with deadlines | **VERIFIED** (class a) |
| 3f | MCP entered the code at the 2000 edition, from CSA B44 S1-97 | **UNVERIFIABLE** |
| 4a | Category 1 = 12 mo · Category 3 = 36 mo · Category 5 = 60 mo | **VERIFIED** (class a, California) |
| 4b | *"water hydraulic"* qualifier on Category 3 | **NOT FOUND** in the state rule checked |
| 4c | Periodic inspection 12 months — NYC | **VERIFIED** (class a) |
| 4d | Periodic inspection 12 months — Washington RCW 70.87.120 | **VERIFIED** (class a) |
| 4e | Periodic inspection 12 months — Illinois | **VERIFIED** (class a) |
| 4f | New Jersey escalator inspection every 6 months | **VERIFIED** (class a) |
| 4g | TX TDLR · DC DOB · Hawaii Exhibit C intervals | **NOT CHECKED** |
| 5a | NYC §28-304.6.1 — *"not affiliated with the agency performing the maintenance"* | **VERIFIED** (class a, verbatim) |
| 5b | Maryland COMAR 09.12.81.04-1 — third-party independence | **VERIFIED** (class a) |
| 5c | Illinois — third-party independence mandated | **VERIFIED** (class a) |
| 5d | Texas — third-party independence mandated | **VERIFIED** (class a, 16 TAC §74.72) |
| 5e | Washington — public inspectors | **VERIFIED** (class a) |
| 5f | New Jersey — *"no private market at all"* | **CORRECTED** — private agencies permitted for R-2/R-3/R-4/R-5 |
| 5g | MA · HI · PA — no private market; GA · DC · MS · OH silent/captive; KS bars individual not firm | **NOT CHECKED** |
| 6a | Florida 61C-5.001 — A17.3-2020; §3.10.12 moved to 8/1/2025 | **VERIFIED** (class a) |
| 6b | Florida — enforcement deferred to **8/1/2029** | **NOT FOUND** — the rule says **8/1/2028**, and for different subsections |
| 6c | Ohio OAC 4101:5-3-01 — A17.3-2020, eff. 7/1/2024 | **VERIFIED** (class a) |
| 6d | Ohio OAC 4101:5-3-02(B) — no retroactive application | **VERIFIED** (class a, near-verbatim) |
| 6e | Georgia Rule 120-3-25-.02(c)(3) — A17.3-2020 | **VERIFIED** (class a) |
| 6f | Illinois 41 Ill. Adm. Code 1000.60 — deadline 1 Jan 2015 | **VERIFIED** (class a) |
| 6g | Texas 16 TAC §74.100 | **VERIFIED** (class a) — but adopts **A17.3-2002** |
| 6h | Washington WAC 296-96-00650, eff. 10/1/2018 | **VERIFIED** (class a) — A17.3-2015 |
| 6i | Colorado 7 CCR 1101-8-2-7 — pre-7/1/2008 stock exempt | **VERIFIED** (class a) |
| 7a | *In re Elevator Antitrust Litig.* — docket 06-3128-cv, 4 Sept 2007 | **VERIFIED** (class a) |
| 7b | Both complaint quotes; affirmance; no prior course of dealing | **VERIFIED** (class a, verbatim) |
| 7c | EC decision 21 Feb 2007, COMP/E-1/38.823 | **VERIFIED** (class a) |
| 7d | Fines exceeding EUR 992m | **VERIFIED, with a caveat** — no total is printed; the OJ table sums to EUR 992,312,200 |
| 7e | Scope expressly *"sale, installation, maintenance and modernisation"* | **CORRECTED** — different wording, and Germany excluded services |

---

## 1. NFPA 101 §9.4.2 — THE RETROACTIVE HOOK

### 1a. §9.4.2.1 (new installations) — VERIFIED, verbatim

Quoted three times, identically, in the ASME A17 Code Coordination Committee's
*Matrix of Elevator & Escalator Related Requirements in the Model Codes vs. ASME
A17.1/CSA B44 & A17.3*, 4 January 2019, in a column headed **NFPA 101 – 2018 (LSC)**:

> **9.4.2.1** Except as modified herein, new elevators, escalators, dumbwaiters, and
> moving walks shall be in accordance with the requirements of ASME A.17.1/CSA B44,
> Safety Code for Elevators and Escalators.

Source: https://nationalelevatorindustry.org/wp-content/uploads/2019/08/matrixelevator.pdf
**Evidence class (c)** — a trade association reproducing the code text. The `A.17.1`
is the matrix's own typo, reproduced here as printed. Edition covered: NFPA 101-2018.

This matches what the document carries for §9.4.2.1, including "Except as modified
herein" and "shall be in accordance with the requirements of".

### 1b. §9.4.2.2 (existing installations) — section number and substance VERIFIED

Two independent regulator documents establish that NFPA 101 §9.4.2.2 is the provision
pointing **existing** equipment at **ASME A17.3**, and that §9.4.2.1 is its counterpart
for new equipment:

1. **ASHE, *K-Tag Preparedness Survey Readiness Checklist and Crosswalk*, released
   20 January 2021.** The Life Safety Code section references it lists:
   - K532, 2012 EXISTING → **"9.4.2.2"**
   - K532, 2012 NEW → **"9.4.2.1"**
   - K531 (both) → **"9.4.2, 9.4.3"**

   Source: https://www.ashe.org/system/files/media/file/2021/02/ASHE-K-Tag-Crosswalk.pdf.pdf
   Evidence class (c) — a hospital-engineering association's crosswalk, not the code.

2. **CMS Form CMS-2786R** (see §2 below), which restates the substance in the
   regulator's own words under both K531 and K532.

Combined with 1a — where §9.4.2.1 is verified verbatim as the *new* half of a matched
pair — the section number and the substance of §9.4.2.2 are established.

### 1c. The exact wording as carried — CORRECTED

**The document carries:**

> "Except as modified herein, existing elevators, escalators, dumbwaiters, and moving
> walks shall **be in accordance with** the requirements of ASME A17.3, Safety Code for
> Existing Elevators and Escalators."

**The evidence points to:**

> "Except as modified herein, existing elevators, escalators, dumbwaiters, and moving
> walks shall **conform with** the requirements of ASME A17.3, Safety Code for Existing
> Elevators and Escalators."

Three separate exact-phrase queries resolve this:

| Query (exact phrase, quoted) | Matched |
|---|---|
| `"Except as modified herein, existing elevators, escalators, dumbwaiters, and moving walks"` | NEII matrix; NC 13 NCAC 15 .0202; UpCodes NFPA 101 Chapter 9 pages |
| `"shall conform with the requirements of ASME A17.3"` | UpCodes **Vermont NFPA 101-2015 Chapter 9** |
| `"dumbwaiters, and moving walks shall conform"` | UpCodes **Tennessee NFPA 101-2012** Ch. 9; **Rhode Island NFPA 101-2015** Ch. 9; **Vermont NFPA 101-2015** Ch. 9; UpCodes page titled **"9.4.2 Code Compliance"** |

The phrase `"in accordance with the requirements of ASME A17.3, Safety Code for Existing
Elevators"` was also queried as an exact phrase. **It did not match any NFPA 101 page** —
its matches were an UpCodes page for *Modifications to ASME A17.3-2015* and commercial
standards-store listings.

The Tennessee hit is the load-bearing one: it is the **2012 edition**, which is the
edition the document quotes and the edition CMS adopted.

**Evidence class (d) — search-index match only.** UpCodes is `robots.txt`-disallowed and
was not retrieved. NFPA's own platform requires an account. Neither was bypassed. I could
not retrieve a class (a) or (b) copy of §9.4.2.2 itself: the public.resource.org and
CMS-hosted full-text copies of NFPA 101-2012 both exceed the fetch window and terminate
before Chapter 9 (Chapter 9 begins at printed page 101-98).

**What this means for the document.** The claim is sound; three words of the quotation are
not. A quotation carried in quotation marks with a section number attached is exactly the
kind of thing a reader checks, and "shall be in accordance with" appears to have been
carried across from §9.4.2.1 — where it is correct — into §9.4.2.2, where it is not. Until
a class (a) copy is in hand, the safe form is to state the requirement without quotation
marks and cite the section.

### 1d. "Stable back to NFPA 101-2000 §9.4.2" — UNVERIFIABLE

Not established. The public.resource.org copy of NFPA 101-2000 was retrieved but
terminates in Chapter 3; its table of contents confirms only that §9.4 is titled
**"ELEVATORS, ESCALATORS, AND CONVEYORS"** at page 101-75.
Source: https://roxana-il.org/wp-content/uploads/2020/06/2000-NFPA-101.pdf

One adjacent datum, in tension with the claim: **26 TAC §510.124** (adopting NFPA 101-2003)
cites the sections in the older hyphenated style — **"NFPA 101, § 9-4.3.2"** and
**"NFPA101, § 9-4.6"** — which is the pre-2000 numbering convention. That does not
disprove the claim, but it means the numbering in that era cannot be assumed.
Source: https://law.cornell.edu/regulations/texas/26-Tex-Admin-Code-SS-510-124

---

## 2. CMS ADOPTION

### 2a. CMS-2786R and tag K531 — VERIFIED, class (a)

The form is *Fire Safety Survey Report — 2012 Life Safety Code Healthcare*, **Form
CMS-2786R (07/2018)**, marked "Form Approved OMB Exempt".
Source: https://www.cms.gov/Medicare/CMS-Forms/CMS-Forms/downloads/cms2786R.pdf

**K531, 2012 EXISTING**, in full as printed:

> "Elevators comply with the provision of 9.4. Elevators are inspected and tested as
> specified in ASME A17.1, Safety Code for Elevators and Escalators. Firefighter's Service
> is operated monthly with a written record. **Existing elevators conform to ASME/ANSI
> A17.3, Safety Code for Existing Elevators and Escalators.**"

**K531, 2012 NEW:**

> "…New elevators conform to ASME/ANSI A17.1, Safety Code for Elevators and Escalators,
> including Firefighter's Service Requirements."

**K532, 2012 EXISTING:**

> "Escalators, dumbwaiters, and moving walks comply with the provisions of 9.4. All
> existing escalators, dumbwaiters, and moving walks conform to the requirements of
> ASME/ANSI A17.3, Safety Code for Existing Elevators and Escalators."

The sentence the document carries — "Existing elevators conform to ASME/ANSI A17.3, Safety
Code for Existing Elevators and Escalators" — is **exactly right**, and it is a fragment of
the longer K531 tag rather than the whole tag. The full tag is stronger than the fragment:
it also carries the A17.1 inspection-and-test requirement and the monthly firefighters'
service record, both of which are recurring paid work.

Note the form's own title establishes 2b: it is the **2012 Life Safety Code** survey form.

### 2c. 26 TAC §505.164 — VERIFIED, class (a)

Chapter title **Hospital Licensing**; the version read is current through an effective date
of **31 January 2025**.
Source: https://www.law.cornell.edu/regulations/texas/26-Tex-Admin-Code-SS-505-164

Subsection (c), verbatim:

> "(c) Requirements for existing elevators, escalators, and conveyors. Existing elevators,
> escalators, and conveyors shall comply with ASME/ANSI A17.3, Safety Code for Existing
> Elevators and Escalators, 1996 edition. All existing elevators having a travel distance
> of 25 feet or more above or below the level that best serves the needs of emergency
> personnel for fire-fighting or rescue purposes shall conform to Fire Fighters' Service
> Requirements of ASME/ANSI A17.3 **as required by NFPA 101, §9.4.3**."

Subsection (d) also cites **NFPA 101, §9.4.6** for the monthly firefighters'-service record.

**Editions matter here and the rule is old:** it adopts **NFPA 101 (2003 edition)**,
**A17.1 (2000 edition)** and **A17.3 (1996 edition)**. The document should not present this
rule as evidence of a current-edition mandate; it is evidence that a state health regulator
cites NFPA 101 §9.4.x by number, which is the claim actually made.

---

## 3. ASME A17.1 §8.6.1.2 — THE MAINTENANCE CONTROL PROGRAM

**A17.1 is paywalled. No attempt was made to bypass it.** What follows is what regulators
say about it, which is class (b).

### 3a / 3e. Florida — VERIFIED, class (a)

**Florida Rule 61C-5.0015, Maintenance Control Programs**, effective 31 December 2017,
amended 29 October 2019:

> "Elevators must comply with the maintenance control program onsite documentation
> requirement in **s. 8.6.1.2, ASME A17.1-2013**"

with staged compliance deadlines keyed to the code under which the unit was installed:

| Unit installed under | MCP deadline |
|---|---|
| ASME A17.1-2013 | 1 January 2018 |
| ASME A17.1b-2009 | 1 July 2018 |
| A17.1a-2005 / A17.1S-2005 (MRL Supplement) / A17.1-2000 | 1 January 2019 |
| ASME A17.1b-1998 | 1 April 2020 |
| ASME A17.1b-1995 and earlier | 1 October 2020 |

Source: https://regulations.justia.com/states/florida/department-61/division-61c/chapter-61c-5/section-61c-5-0015/

This is a state regulator naming §8.6.1.2 by number, tying it to onsite MCP documentation,
and setting enforcement dates. It establishes that the MCP obligation is real, that it sits
at §8.6.1.2, and that it reaches back to units installed under 1995-era code — which is the
point the document is making with it.

### 3b. The MCP contents list — UNVERIFIABLE

The specific contents carried — scheduled tasks, procedures, examinations, tests, and
**as-built wiring diagrams** — could not be checked against A17.1 §8.6.1.2 itself. The
Florida rule speaks only of "onsite documentation". Paywall; not bypassed.

### 3c. The A17.2-2010 corroboration — UNVERIFIABLE

ASME A17.2-2010 *Guide for Inspection of Elevators, Escalators, and Moving Walks* is
available in full at
https://archive.org/details/gov.law.asme.a17.2.2010 (public.resource.org). The text file
was retrieved but the fetch terminated in the front matter (contents, foreword, committee
roster, summary of changes); neither "maintenance control program" nor "8.6.1.2" appears in
the portion reached. **The quotation is not disproved — it was not reached.** Anyone with
the PDF locally can settle this in one search.

### 3d. The Illinois OSFM quotation — NOT FOUND

The document carries Illinois OSFM as quoting A17.1-2007 §8.6.1.2 as *"A written Maintenance
Control Program shall be in place"*. **I could not locate this.** Searches against the
Illinois State Fire Marshal's elevator pages and against 41 Ill. Adm. Code Part 1000 returned
nothing carrying that sentence. §1000.75 (New Technology) and §1000.60 (Adoption of
Nationally Recognized Safety Codes) do not contain it; §1000.60 adopts A17.1-**2007** but
its MCP-adjacent content is the upgrade list, not §8.6.

This is a NOT FOUND on a quotation attributed to a named state regulator, which is the
category the method treats as serious. It may exist in an OSFM bulletin or FAQ not indexed;
it is not established, and it should not be carried in quotation marks with Illinois
OSFM's name on it until it is.

### 3f. "Entered the code at the 2000 edition, from CSA B44 S1-97" — UNVERIFIABLE

No primary or regulator source reached. The Florida deadline table is *consistent* with a
2000-edition origin — it treats A17.1-2000 as one of the older cohorts needing a later
deadline — but that is inference, not verification.

---

## 4. INSPECTION INTERVALS

Five jurisdictions checked against their own rules; the brief asked for at least three.

### 4a. California 8 CCR §3141.6 — VERIFIED, class (a)

Section title **"Periodic Tests"**, operative **1 May 2008**.
Source: https://www.dir.ca.gov/title8/3141_6.html

> (a)(1) Category One Tests shall be completed once every **12 months**
> (a)(2) Category Three Tests shall be completed once every **36 months**
> (a)(3) Category Five Tests shall be completed once every **60 months**

The 12 / 36 / 60 structure carried in the document is **confirmed**.

### 4b. The "water hydraulic" qualifier on Category 3 — NOT FOUND

§3141.6 states the 36-month interval without restricting Category Three to water-hydraulic
units. The qualifier derives from ASME A17.1 Table N1, which is paywalled and was not
checked. Carry the interval; do not carry the qualifier as a California-sourced fact.

Two further details from the same rule, useful and currently uncarried: tests must be
performed by a Certified Competent Conveyance Mechanic employed by a Certified Qualified
Conveyance Company, must be **witnessed** by a Certified Competent Conveyance Inspector,
and a unit failing a periodic test "shall be removed from service until satisfactory test
result is achieved."

### 4c. New York City — VERIFIED, class (a), with a numbering caveat

Text of §28-304.6.1 as it read before the 2022 amendments:

> "The required periodic inspections shall be made by the department, except that one
> inspection and test for elevators and escalators shall be made between January first and
> December thirty-first of each year"

Source: https://nycadmincode.readthedocs.io/t28/c03/art304/

**Caveat on the section number.** In the current codified text (see 5a), §28-304.6.1 is
titled **"Inspection and testing entities"** and carries the independence rule, not the
annual frequency. The document cites §28-304.6.1 for *both* the interval and the
independence requirement; that was true of the pre-2022 text and is now only half true.
Cite §28-304.6.1 for independence; cite Article 304 generally, or the current
frequency subsection, for the annual interval.

Also from Article 304, class (a): §28-304.3 — chair lifts and stairway chair lifts "at
intervals not exceeding one year"; §28-304.2 — intervals per "Table N1 of ASME 17.1 as
referenced in chapter 35."

### 4d. Washington RCW 70.87.120 — VERIFIED, class (a)

> "the department shall cause all conveyances to be inspected and tested **at least once
> each year**"

Source: https://app.leg.wa.gov/RCW/default.aspx?cite=70.87.120
Session-law history: 2008 c 181 s 207; 1998 c 137 s 4; 1997 c 216 s 2; 1993 c 281 s 61;
1983 c 123 s 13; 1970 ex.s. c 22 s 2; 1963 c 26 s 12.

The same section carries the department's power to "appoint and employ inspectors", which
is the class (a) basis for the Washington half of claim 5e.

### 4e. Illinois 41 Ill. Adm. Code §1000.140 — VERIFIED, class (a)

> "It shall be the responsibility of the owner of all new and existing conveyances located
> in any building or structure to have the conveyance inspected **annually**." (§1000.140(b)(1))

Source: https://www.law.cornell.edu/regulations/illinois/Ill-Admin-Code-tit-41-SS-1000.140

### 4f. New Jersey escalators every six months — VERIFIED, class (a)

**N.J.A.C. 5:23-12.3(a)(1):**

> "Periodic inspections shall be made at intervals of not more than **six months** for all
> escalators."

Same subsection, for everything else:

> "Inspection intervals for ASME A17.1 elevator devices other than escalators shall not
> exceed those set forth in Appendix N-1 of ASME A17.1 … cyclical inspections shall not be
> required more frequently than once a year."
> "Stairway chairlifts and wheelchair lifts shall be inspected at intervals not exceeding
> one year."

Source: https://www.nj.gov/dca/codes/codreg/pdf_regs/njac_5_23_12.pdf

**A material adjacent fact the document does not carry.** New Jersey DCA's own bulletin
*Required Elevator Maintenance Checklists and Routine Inspections* states:

> "In 2017, the Department adopted amendments to the Uniform Construction Code (N.J.A.C.
> 5:23) that **discontinued the performance of routine (six-month) elevator inspections**"
> "The intent of the regulations adopted back in 2017 was to put the responsibility of
> maintenance on the owner and their elevator maintenance company"

Source: https://www.nj.gov/dca/codes/publications/pdf_elevator/elvr_six_mo_check.pdf

So New Jersey's six-month cadence survives **for escalators** and was withdrawn for
elevators — with the obligation shifted onto owners and their maintenance contractors. If
the document uses New Jersey as an example of six-month inspection frequency generally,
that reading is wrong; the escalator claim as written is right.

### 4g. Texas TDLR, DC DOB, Hawaii Exhibit C — NOT CHECKED

Out of budget after five jurisdictions. Not disputed; not verified.

---

## 5. THIRD-PARTY INDEPENDENCE

### 5a. New York City — VERIFIED, class (a), verbatim

**NYC Administrative Code §28-304.6.1, "Inspection and testing entities."** Amendment
history as printed: Am. 2019 N.Y. Laws Ch. 750 (eff. 1/1/2022); Am. 2020 N.Y. Laws Ch. 55
(eff. 1/1/2022); Am. L.L. 2021/126 (eff. 1/1/2022).
Source: https://codelibrary.amlegal.com/codes/newyorkcity/latest/NYCadmin/0-0-0-158093

> "The required category tests and periodic inspections in Table N1 of ASME A17.1 as
> modified by chapter K1 of appendix K of the New York City building code shall be performed
> on behalf of the owner by an approved elevator agency in accordance with this code and
> department rules. Where indicated in Table N1, tests shall be witnessed by an approved
> elevator agency not affiliated with the agency performing the test, and not affiliated
> with the agency performing the elevator work. Where indicated in Table N1, inspections
> shall be performed by an approved elevator agency **not affiliated with the agency
> performing the maintenance**. Not affiliated, as used in this section, shall mean the
> approved elevator agency owners, directors and inspectors shall be independent of all
> relative approved elevator agencies, maintenance firms or other entities providing any
> associated services to the device owner."

The phrase the document carries is **exact**. The definitional sentence that follows it is
stronger than the fragment and is worth carrying too — it reaches owners and directors, not
just the inspector, which is what makes the New York market structurally separate rather
than merely arm's-length.

### 5b. Maryland — VERIFIED, class (a)

**COMAR 09.12.81.04-1, "Third-Party Qualified Elevator Inspectors"**, Title 09 Maryland
Department of Labor, Subtitle 12 Division of Labor and Industry, Chapter 09.12.81 Elevator,
Escalator, and Chairlift Safety. Text current through Md. Register Vol. 52, No. 12,
13 June 2025.
Source: https://regulations.justia.com/states/maryland/title-09/subtitle-12/chapter-09-12-81/section-09-12-81-04-1/

> "A third-party qualified elevator inspector shall be: (a) An independent elevator
> consultant; (b) Employed by an independent inspection agency; or (c) Employed by the
> insurer of the elevator unit."

> "A third-party qualified elevator inspector shall have a valid qualified elevator
> inspector certification issued by an organization accredited by the American Society of
> Mechanical Engineers."

Registration with the Commissioner is required before inspecting; insurance minimum
$500,000 injury/death per occurrence and $100,000 property damage; annual renewal fee $250.

Note the mechanism: Maryland achieves independence by **enumerating the three permitted
employers**, not by a "not affiliated" prohibition. The effect matches what the document
claims; the wording does not, and the document should not put NYC's phrasing in Maryland's
mouth.

### 5c. Illinois — VERIFIED, class (a)

**41 Ill. Adm. Code §1000.140(e)(1):**

> "No individual licensed as both an elevator mechanic (regular or limited) and elevator
> inspector may inspect his/her own work, the work of his/her company, or the work of a
> company affiliated with his/her company."

Source: https://www.law.cornell.edu/regulations/illinois/Ill-Admin-Code-tit-41-SS-1000.140

The bar reaches the **company and its affiliates**, not only the individual. Narrow
exceptions exist for governmental and academic institutions with their own licensed
personnel, and for certain hydraulic pressure tests witnessed by a contractor-employed
inspector where a separate licensed mechanic performs the test.

*The document's separate claim about Chicago specifically was not checked.*

### 5d. Texas — VERIFIED, class (a)

**16 TAC §74.72, "Standards of Conduct for Inspector or Contractor Registrants":**

> "An inspector is prohibited from performing inspections upon equipment for which the
> inspector's employer also has a contract to perform installations, maintenance, repairs,
> replacements or alterations on that equipment."

Source: https://regulations.justia.com/states/texas/title-16/part-4/chapter-74/section-74-72/

Note this is an **employer-level** bar, and it names maintenance explicitly.

### 5e. Washington — VERIFIED, class (a)

RCW 70.87.120: the department inspects, and "shall appoint and employ inspectors, as may be
necessary to carry out the provisions of this chapter". Consistent with the claim that
Washington has no private inspection market.

### 5f. New Jersey — CORRECTED

The document carries New Jersey among states with **"no private market at all"** (public
inspectors). The rule is not that absolute.

**N.J.A.C. 5:23-12.3(a)(3):**
> "Periodic inspections … shall be made by the elevator subcode official or elevator
> inspector."

**N.J.A.C. 5:23-12.3(a)(5)** then permits construction officials to accept
> "signed statements and supporting inspection and acceptance test reports, filed by an
> **approved qualified agent or agency**"

for exempted structures in Groups **R-2, R-3, R-4 and R-5**.

Source: https://www.nj.gov/dca/codes/codreg/pdf_regs/njac_5_23_12.pdf

So the public-inspector default is real, and there is a private-agency channel for
residential groups. "No private market at all" overstates it.

### 5g. Massachusetts, Hawaii, Pennsylvania, Georgia, DC, Mississippi, Ohio, Kansas — NOT CHECKED

The Pennsylvania source (34 Pa. Code Chapter 7) is `robots.txt`-disallowed on the
Pennsylvania Code site and was not retrieved. The remainder were not reached. The Kansas
claim in particular — that the individual is barred but the firm is not — is a fine
distinction of exactly the kind that is usually either the sharpest observation in a
section or an artifact of a half-read rule, and it is unverified.

---

## 6. A17.3 STATE ADOPTIONS

### 6a / 6b. Florida Rule 61C-5.001 — VERIFIED on the adoption and the 2025 date; **8/1/2029 NOT FOUND**

Effective date of the version read: **31 December 2023**.
Source: https://regulations.justia.com/states/florida/department-61/division-61c/chapter-61c-5/section-61c-5-001/

Adopted editions:
> "ASME A17.1-2019, Safety Code for Elevators and Escalators, with the following exclusions"
> "ASME A17.3-2020, Safety Code for Existing Elevators and Escalators, with the following
> exclusions and changes"

The door-monitoring deferral:
> "The effective date for Part 3.10.12 of ASME A17.3-2020 is changed from December 31, 2023,
> to **August 1, 2025**."

**The carried "enforcement deferred to 8/1/2029" is NOT FOUND.** What the rule contains is
a *different* deferral, to a *different* year, for a *different* set of sections:

> sections **3.8.5, 3.10.13, 3.10.14, 3.13.1 and 3.13.2** — effective date "changed from
> December 31, 2023, until **August 1, 2028**."

Two things are wrong in the carried version: the year (**2028**, not 2029) and the
attachment (it applies to five other subsections, not to §3.10.12). The document currently
reads as though Florida moved 3.10.12 to 2025 and then declined to enforce it until 2029.
On this text, Florida moved 3.10.12 to 2025 full stop, and separately deferred five other
requirements to 2028.

*Caveat on class:* this reading is from a regulation aggregator carrying the rule text
(class b/c). The official Florida source, `flrules.org`, timed out on repeated attempts.
Given that a **date** is the thing being corrected, the correction should be re-checked
against flrules.org before it is relied on — but the carried 2029 date has no support in
any text I reached.

### 6c / 6d. Ohio — VERIFIED, class (a), and the retroactivity bar is near-verbatim

**OAC 4101:5-3-01, "Accepted engineering practice and approved standards"**, effective
**1 July 2024**. Adopts **ASME A17.1-2019** and **ASME A17.3-2020**.
Source: https://codes.ohio.gov/ohio-administrative-code/rule-4101:5-3-01

**OAC 4101:5-3-02, "Resolution of conflicts"**, effective **1 July 2024**, paragraph (B),
verbatim:

> "The rules of the board are **not to be retroactively applied to existing elevators that
> are not otherwise being altered or repaired**. Portions of an elevator not altered and
> not affected by an alteration are not required to comply with the code requirements for a
> new elevator."

Source: https://codes.ohio.gov/ohio-administrative-code/rule-4101:5-3-02

The quotation the document carries is **exact**. The second sentence, which the document
does not carry, tightens the point: Ohio's carve-out is scoped to the *unaltered portions*
of an altered unit, which is a narrower bar than "Ohio does not apply A17.3 retroactively."
Ohio adopting A17.3-2020 in the immediately preceding rule and then disclaiming retroactive
application in the next is the single most interesting fact in this cluster, and it is
carried correctly.

### 6e. Georgia Rule 120-3-25-.02(c)(3) — VERIFIED, class (a)

Source: https://rules.sos.ga.gov/gac/120-3-25

> "ASME A17.3, 2020 Edition of the Safety Code for Existing Elevators and Escalators, with
> such revisions, amendments, and interpretations thereof as are made, approved and adopted
> by the Standards Committee."

Georgia adopts A17.1-2019 for new work in the same rule. No explicit effective date for the
edition adoptions appears in the rule text read; the rule does elsewhere set compliance
"within two (2) years of the effective date of this Rule revision" for certain modernization
work.

### 6f. Illinois 41 Ill. Adm. Code §1000.60 — VERIFIED, class (a)

Section title **"Adoption of Nationally Recognized Safety Codes"**.
Source: https://www.ilga.gov/commission/jcar/admincode/041/041010000000600R.html

> "the following upgrade requirements of the 2007 edition of the Safety Code for Elevators
> and Escalators (ASME A17.1) and the 2005 edition of the Safety Code for Existing Elevators
> (ASME A17.3) must be completed by **January 1, 2015**"

> "Safety Code for Existing Elevators and Escalators (ASME A17.3-2005), but only as required
> under Section 35(h) and (i) of the Act and subsection (d)"

The enumerated upgrades: restricted opening of hoistway or car doors on passenger elevators;
car illumination; emergency operation and signalling devices; phase reversal and failure
protection; reopening device for power-operated doors or gates; stop switch in pits — each
"in accordance with ASME A17.3-2005". Firefighters' emergency operation and the hydraulic
cylinder(s) with their associated safety devices under A17.3-2005 §4.3.3(b) are **not**
required to be upgraded except in stated circumstances.

The deadline is confirmed. Note that Illinois adopts A17.3 **partially and by enumeration**,
not wholesale — the document should not present Illinois as a full-A17.3 retroactive state.

### 6g. Texas 16 TAC §74.100 — VERIFIED that it exists and adopts A17.3; **the edition is old**

Section title **"Technical Requirements — ASME and ASCE Codes"**, effective
**1 November 2018**.
Source: https://www.law.cornell.edu/regulations/texas/16-Tex-Admin-Code-SS-74-100

> "(1) ASME Code A17.1-2016/CSA B44-16 as amended in subsection (b);
> (2) **ASME Code A17.3-2002**; (3) ASME Code A18.1-2005; and (4) ASCE Code 21."
> "ASME Code A17.3-2002 continues to be in effect."

Texas is on **A17.3-2002**, eighteen years behind Florida, Ohio and Georgia. If the document
groups Texas with the A17.3-2020 states, that grouping is wrong. A17.2 is not adopted by
this rule.

*(The Texas Secretary of State's own TAC viewer has migrated to
`texas-sos.appianportalsgov.com` and the legacy `texreg.sos.state.tx.us` URL now returns a
redirect notice; Cornell LII was used instead — class (b/c).)*

### 6h. Washington WAC 296-96-00650 — VERIFIED, class (a)

Section title **"Adopted standards."**
> "Safety Code for Existing Elevators and Escalators **ASME A17.3-2015**" — effective
> **10/1/2018**, status Current.

Source: https://app.leg.wa.gov/WAC/default.aspx?cite=296-96-00650
Corroborated independently by NEII's *Stateside Code Update Report*, February 2019, which
records Washington on A17.1-2016 and A17.3-2015 as of 10/1/2018:
https://nationalelevatorindustry.org/wp-content/uploads/2019/08/CodeAdoption.pdf

### 6i. Colorado 7 CCR 1101-8-2-7 — VERIFIED, class (a)

Section title **"Implementation of Adopted Standards"**.
Source: https://regulations.justia.com/states/colorado/1100/1101-d-2/rule-7-ccr-1101-8/article-2/section-7-ccr-1101-8-2-7/

> "All conveyances installed prior to **July 1, 2008** are exempt from complying with the
> currently-adopted edition of ASME A17.3"
> "unless one of the following conditions exists: (a) Substantial Alteration of a conveyance
> (b) An elevator presents a Material Risk"
> "Any Alteration that is a result of the conditions listed above shall conform to the
> currently-adopted edition of ASME A17.1."
> "An AHJ may require and enforce more stringent standards than these minimum requirements
> regarding Firefighters' Emergency Operation, including full compliance with ASME A17.3."

The exemption is confirmed, and it is conditional rather than absolute — substantial
alteration or a material-risk finding pulls a pre-2008 unit back in, and any local AHJ may
impose full A17.3 on firefighters' emergency operation.

**What 6c/6d and 6i together mean for the thesis.** Ohio and Colorado are both states that
adopt A17.3 and then expressly limit its retroactive reach. That is not fatal to the
document's argument — the compelled *maintenance and inspection* cadence in §§4 and 5 is
untouched by it — but a national claim of "existing elevators must be retrofitted under a
retroactive code" is materially qualified by two of the seven states the document itself
cites. The qualification belongs on the page.

---

## 7. THE ANTITRUST RECORD

### 7a / 7b. *In re Elevator Antitrust Litigation* — VERIFIED, class (a), verbatim

Caption *In re Elevator Antitrust Litigation*; **Docket No. 06-3128**; **argued 14 June
2007**; **decided 4 September 2007**; panel Jacobs, C.J., Straub and B.D. Parker, Circuit
Judges. Reported at 502 F.3d 47 (2d Cir. 2007).
Source: https://law.justia.com/cases/federal/appellate-courts/ca2/06-3128/06-3128-cv_opn-2011-03-27.html

Both carried quotations appear, verbatim:

> "refusing to sell competitors the parts, tools, software or diagrams necessary to service
> the elevators"

> "embedded computer systems that can only be interfaced with defendant-controlled handheld
> units"

Disposition:

> "We affirm."

Reasoning, verbatim:

> "the complaint does not allege that defendants terminated any prior course of dealing—the
> sole exception to the broad right of a firm to refuse to deal"

> "the unilateral termination of a voluntary (and thus presumably profitable) course of
> dealing suggested a willingness to forsake short-term profits"

Docket number, both dates, both quotes and the disposition are all confirmed. The document's
framing is also correct and is the framing that matters: the court recorded the mechanism
**as alleged in the complaint** and affirmed dismissal anyway, because refusal to deal is
lawful absent termination of a prior course of dealing. The mechanism is not a judicial
finding of fact, and the document is right not to present it as one.

### 7c. European Commission decision — VERIFIED, class (a)

Official Journal title, verbatim:

> "Summary of Commission Decision of **21 February 2007** relating to a proceeding under
> Article 81 of the Treaty establishing the European Community (**Case COMP/E-1/38.823 —
> Elevators and Escalators**)"

Published **OJ C 75, pages 19–24, 26 March 2008**. CELEX 52008XC0326(01).
Source: https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX:52008XC0326(01)

Date and case number are exact.

### 7d. "Fines exceeding EUR 992m" — VERIFIED, with a caveat about how the figure is obtained

**The Official Journal summary prints no total.** It prints fines by member state and
undertaking:

| | KONE | Otis | Schindler | ThyssenKrupp | Mitsubishi |
|---|---|---|---|---|---|
| Belgium | 0 | 47,713,050 | 69,300,000 | 68,607,000 | — |
| Germany | 62,370,000 | 159,043,500 | 21,458,250 | 374,220,000 | — |
| Luxembourg | 0 | 18,176,400 | 17,820,000 | 13,365,000 | — |
| Netherlands | 79,750,000 | 0 | 35,169,750 | 23,477,850 | 1,841,400 |

**Derivation, arithmetic shown:**
Belgium 185,620,050 + Germany 617,091,750 + Luxembourg 49,361,400 + Netherlands
140,239,000 = **EUR 992,312,200**.

That supports "exceeding EUR 992m" precisely, and it is contemporaneously corroborated by
press reporting on the day of the decision (CNBC, 21 February 2007, "EU Fines Elevator
Cartel a Record 992 Million Euros" — class c).

**Two caveats that should travel with the figure.** First, it is a **derived** number, not a
quoted one: the document should register it under Derivations with this arithmetic, not cite
it as a figure the Commission published. Second, the 2007 fines were **not final** —
ThyssenKrupp's fine was subsequently reduced on appeal. If the document uses the figure as
"fines imposed by the 2007 decision", that is accurate; if it uses it as "fines paid" or
"the cost of the cartel", it is not.

### 7e. Scope "sale, installation, maintenance and modernisation" — CORRECTED

The OJ summary does not use that formula. What it says, verbatim:

> "The addressees participated in four separate but related single and continuous
> infringements of Article 81 of the Treaty in Belgium, Germany, Luxembourg and the
> Netherlands regarding elevators and escalators."

> "agreeing to share elevator and escalator sales and installations"

> "agreement not to compete with each other for maintenance contracts for elevators and
> escalators already in function"

> "agreeing not to compete with each other for modernization contracts"

And, critically:

> "the cartels covered the same products and services in each Member State at issue, **with
> the exception of Germany where — to the knowledge of the Commission — services were not
> directly part of the cartel agreements**"

Two corrections. The quoted scope formula is **not the Commission's wording** and should
lose its quotation marks; the substance (sales/installation, maintenance, modernisation) is
right. And **Germany is an exception** — the largest fine block by a wide margin, EUR 617m
of the EUR 992m, comes from a cartel the Commission says did not directly cover services.
A document using this decision as evidence that the *aftermarket* is where the collusion
happened must say that, because the country carrying most of the money is the one where it
did not.

---

## THE SHORT LIST OF WHAT TO FIX

1. **NFPA 101 §9.4.2.2** — three words wrong in a quoted passage. Either obtain a class (a)
   copy and quote it correctly, or drop the quotation marks and cite the section.
2. **Florida 8/1/2029** — no support. The rule says 8/1/2028, for five other subsections.
3. **Illinois OSFM MCP quotation** — attributed to a named regulator, not locatable.
4. **EC scope quotation** — not the Commission's words, and Germany excluded services.
5. **EUR 992m** — derived by summing the OJ table; register the arithmetic.
6. **New Jersey "no private market at all"** — overstated; R-2/R-3/R-4/R-5 have one.
7. **Texas grouped with A17.3-2020 states** — Texas is on A17.3-2002.
8. **Ohio and Colorado expressly limit retroactive reach** — the national retroactivity
   claim needs that qualification on the page, not in the appendix.

---


# Installed base · Census · the deal record · New York

# Pass 6 — Primary-source verification: installed base, Census, deal record, New York

Verification date: 2026-08-11
Scope: figures 1–17 of the elevator market assessment cluster "installed base, Census
figures, deal record, New York data".
Method: issuing body only. Census from the Census Bureau's own table API, BLS from
bls.gov OEWS industry pages, NYC counts re-queried live against the Socrata endpoint,
deal figures from the acquirer's SEC exhibit and the parties' own releases.

---

## Summary table

| # | Figure as carried | Verdict |
|---|---|---|
| 1 | NEII 2020: >1.03M US elevators; 56,000 North American escalators | **VERIFIED** |
| 2 | NEII 2019: 35,000 US escalators / 44,000 US+Canada (conflict kept, both values) | **VERIFIED** |
| 3 | NEII 2019: "A majority of this data was compiled in 2007." | **VERIFIED — sentence is real, quoted exactly** |
| 4 | LA: 23,700 permitted conveyances, 20,406 elevators, Jan 2018 audit | **VERIFIED** |
| 5 | EC2223BASIC 238290: 7,725 / 6,611 / $42,421,304k / 141,908 / $11,853,912k | **VERIFIED (all five)** |
| 6 | EC2223LOCCONS 2382: 203,401 estabs; 52.59% / 73.13% / 86.65% | **CORRECTED — percentages are of 167,779, not 203,401** |
| 7a | CB2200CBP: 800,651 estabs; 65.87% / 81.71% / 91.02% | **VERIFIED** |
| 7b | All-construction employees per establishment 9.52 (7,485,385 ÷ 785,917) | **CORRECTED — 785,917 is FIRMS, not establishments** |
| 8 | BLS OEWS: elevator mechanics 13.90% of 238290 — May 2022 and May 2023 | **VERIFIED (both vintages)** |
| 9 | APi/Elevated $570m, closed 4 June 2024, ≈$220m rev, over 18 states, ≈600 | **VERIFIED** |
| 10 | "22 states / 30+ markets" from Elevated's own 2023-10-23 release | **VERIFIED — attribution correct** |
| 11a | TK Elevator / Albany Elevator, 3 May 2021 | **VERIFIED** |
| 11b | KONE / "Oregon Elevator" 2010 | **CORRECTED — target was Reliant Elevator Co.** |
| 11c | KONE / Eagle Elevator, Minneapolis 2012 | **VERIFIED (2 May 2012)** |
| 12a | TAKA service book to KONE in 2019 | **NOT FOUND** |
| 12b | TAKA to TEI Group, 3 January 2025 | **VERIFIED** |
| 12c | Otis never acquired TAKA | **VERIFIED (negative) — no Otis transaction exists; TAKA independent to 2025** |
| 13 | 120,256 total / 93,454 active / 92,075 base after 1,379 construction | **VERIFIED (all three, cross-footed)** |
| 14 | Type split: 81,232 / 7,034 / 2,606 / 1,197 / 6 | **VERIFIED (sums to 92,075)** |
| 15 | Borough split: 48,378 / 20,115 / 13,333 / 9,693 / 1,935 | **CORRECTED (scope) — this is the 93,454 base, not the 92,075 base** |
| 16 | 43,454 buildings; 3,072 (7.1%) hold 32,208 (34.5%) at 10.5; 25,946 single-device | **VERIFIED (all, exactly)** |
| 17 | NYS DOL: 132 contractors, 78 inspection agencies, 3,948 mechanics, 748 inspectors | **VERIFIED (all four)** |

**Nothing in this cluster is UNVERIFIABLE.** The earlier pass's network block did not
recur in the same form — see the access note below.

---

## Access note — the earlier pass's block, and what actually happened here

Direct HTTP clients are denied by this session's egress policy: `curl` to
census.gov, bls.gov, neii.org and data.cityofnewyork.us all returned
`CONNECT tunnel failed, response 403`. That is an organization policy denial, not a
transport fault, and it is not routed around.

The permitted fetch path does reach all four hosts. Two consequences worth recording:

- **`api.census.gov` requires an API key** and returns an HTML error page without one,
  on every endpoint tested (`ecnbasic`, `cbp`). This is almost certainly what blocked
  the earlier pass and produced the "blocked by network policy" note.
- **`data.census.gov/api/access/data/table` needs no key and returns the same
  underlying table data.** That is the route used for figures 5, 6 and 7, and it is why
  the Census figures are verified here rather than deferred. Record it for future passes.

Header and value arrays from that API were paired **by index position locally**, not by
eye and not by asking a summarizer to read off a field. This matters: an intermediate
read of the NAICS 23 row reported `FIRM = 613,241,103`, which is impossible. Paired
correctly, that position is `CSTSCNT`. **The 785,917 error in figure 7 is exactly this
class of mistake** (see below).

---

## 1–3. The installed base — NEII

### Figure 1 — 2020 fact sheet — VERIFIED

Source: NEII, *Elevator and Escalator Fact Sheet*, 2020.
URL: https://nationalelevatorindustry.org/wp-content/uploads/2020/07/NEII-Fact-Sheet-2020.pdf

Verbatim:

> "There are more than 1.03 million elevators in the United States, which is up from
> 900,000 in 2007."

> "There are 56,000 escalators in North America."

Also on the sheet, verbatim: "California has the most elevators at over 145,000."
"There is 1 elevator for every 317 riders in the U.S." "Globally, 590,000 elevators were
installed in 2016; 40,000 of those were in North America."

Note the escalator figure is stated for **North America**, and is carried as North
America. Correct as carried.

### Figure 2 — 2019 fact sheet — VERIFIED

Source: NEII, *Fact Sheet*, published February 2019.
URL: https://nationalelevatorindustry.org/wp-content/uploads/2019/02/Fact-Sheet.pdf

Verbatim:

> "There are 900,000 elevators in the United States (1,000,000 when you add elevators
> in Canada)."

> "35,000 units in United States (44,000 in the U.S. and Canada)"  [escalators]

Both sheets exist and both say what is claimed. The conflict is real and the handling —
carry both values, no midpoint — is correct. The two sheets are also internally
reconcilable: the 2020 sheet frames 900,000 as the *2007* figure, and the 2019 sheet
presents 900,000 as current while dating its own data to 2007.

### Figure 3 — the vintage sentence — VERIFIED, EXACT

The sentence is real. From the 2019 fact sheet, verbatim and complete:

> **"A majority of this data was compiled in 2007."**

This is the load-bearing caveat under every share statistic derived from the NEII
installed base, and it survives verification intact. It appears on the 2019 sheet; it
does **not** appear on the 2020 sheet, which carries no compilation-date statement at
all. If a document attributes the sentence to the 2020 sheet, that attribution is wrong;
attributing it to the 2019 sheet is correct.

### Figure 4 — Los Angeles — VERIFIED

Source: Los Angeles City Controller, *Elevating Safety: Audit of the Department of
Building Safety's Elevator Inspection Program*, dated **24 January 2018**.
URL: https://controller.lacity.gov/audits/elevating-safety-audit-of-the-department-of-building-safetys-elevator-inspection-program

Verbatim:

> "LADBS' 24 elevator inspectors oversee 23,700 permitted conveyances, with 20,406
> (86%) being either hydraulic or cabled elevators."

Both figures exact, and the 86% share is the audit's own. The audit separately says
Angelenos "ride some 23,000 elevators, escalators and other types of people-moving
conveyances on a daily basis" — a rounded, differently-scoped sentence. Use 23,700.

---

## 5–7. Census — the container

All three from the Census Bureau's own table API, no aggregator in the chain.

### Figure 5 — EC2223BASIC, NAICS 238290 — VERIFIED, all five

Table: **ECNBASIC2022.EC2223BASIC**, 2022 Economic Census, geography `0100000US`
(United States), `NAICS2022 = 238290`, `INDLEVEL = 6`, `YEAR = 2022`,
label "Other Building Equipment Contractors".
URL: https://data.census.gov/api/access/data/table?id=ECNBASIC2022.EC2223BASIC&g=010XX00US&n=238290&y=2022

| Field | Published value | As carried |
|---|---|---|
| ESTAB | 7,725 | 7,725 ✓ |
| FIRM | 6,611 | 6,611 ✓ |
| RCPTOT | 42,421,304 ($000) | $42,421,304k ✓ |
| EMP | 141,908 | 141,908 ✓ |
| PAYANN | 11,853,912 ($000) | $11,853,912k ✓ |

Clean. This is the figure set the "238290 is a container" argument rests on, and it is
sound.

### Figure 6 — EC2223LOCCONS, NAICS 2382 — CORRECTED (denominator)

Table: **ECNLOCCONS2022.EC2223LOCCONS**, `NAICS2022 = 2382` ("Building Equipment
Contractors"), size variable `EMPSZFE`.
URL: https://data.census.gov/api/access/data/table?id=ECNLOCCONS2022.EC2223LOCCONS&g=010XX00US&n=2382&y=2022

Published rows:

| EMPSZFE | Label | ESTAB |
|---|---|---|
| 001 | All establishments | **203,401** |
| 100 | Establishments operated for the entire year | **167,779** |
| 210 | …entire year with less than 5 employees | 88,238 |
| 215 | …entire year with 5 to 9 employees | 34,457 |
| 220 | …entire year with 10 to 19 employees | 22,690 |
| 225 | …entire year with 20 to 49 employees | 14,755 |
| 230 | …entire year with 50 to 99 employees | 4,586 |
| 235 | …entire year with 100 to 249 employees | 2,318 |
| 245 | …entire year with 250 to 499 employees | 496 |
| 250 | …entire year with 500 employees or more | 239 |
| 500 | Establishments not operated for the entire year | 35,622 |

**The total 203,401 is VERIFIED.** The three percentages are also arithmetically
correct — but **not against that total**:

| Band | Count | ÷ 167,779 (entire year) | ÷ 203,401 (all establishments) |
|---|---|---|---|
| under 5 | 88,238 | **52.59%** ✓ carried | 43.38% |
| under 10 | 122,695 | **73.13%** ✓ carried | 60.32% |
| under 20 | 145,385 | **86.65%** ✓ carried | 71.48% |

The size bands only cover establishments **operated for the entire year** — they sum to
exactly 167,779, and the 35,622 establishments not operated the entire year are excluded
from the distribution entirely.

**The correction is one of scope, not value.** Carrying "203,401 establishments, of which
52.59% have under 5 employees" states something the table does not support: the true
share of *all* 2382 establishments with under 5 employees is 43.38%. Either quote the
percentages against 167,779 and say so, or quote the counts. Do not pair them with
203,401.

### Figure 7 — CBP 2022 and the per-establishment ratio

Table: **CBP2022.CB2200CBP**, `NAICS2017 = 23` (Construction), `LFO = 001`, US.
URL: https://data.census.gov/api/access/data/table?id=CBP2022.CB2200CBP&g=010XX00US&n=23&y=2022

**7a — establishments and size shares — VERIFIED.**

| EMPSZES | Label | ESTAB |
|---|---|---|
| 001 | All establishments | **800,651** |
| 210 | less than 5 employees | 527,420 |
| 220 | 5 to 9 | 126,815 |
| 230 | 10 to 19 | 74,494 |
| 241 | 20 to 49 | 47,853 |
| 242 | 50 to 99 | 14,799 |
| 251 | 100 to 249 | 7,063 |
| 252 | 250 to 499 | 1,534 |
| 254 | 500 to 999 | 488 |
| 260 | 1,000 or more | 185 |

Bands sum to exactly 800,651. Shares against that total: under 5 = **65.87%**, under 10
= **81.71%**, under 20 = **91.02%**. All three exact as carried, and unlike figure 6 the
denominator here is the stated total. Clean.

**7b — "employees per establishment 9.52 (7,485,385 ÷ 785,917)" — CORRECTED.**

Both inputs are real Census values, and both come from **EC2223BASIC (2022 Economic
Census), NAICS 23** — not from CBP. Paired by index position from the raw arrays:

| Field | Value |
|---|---|
| NAICS2022 | 23 (Construction), INDLEVEL 2 |
| ESTAB | **803,120** |
| FIRM | **785,917** |
| EMP | **7,485,385** |
| RCPTOT | 2,920,771,250 ($000) |
| PAYANN | 529,751,969 ($000) |

**785,917 is the FIRM count. It is not an establishment count.** The ratio labelled
"employees per establishment" therefore divides employees by *firms*, which is a
different quantity — a multi-establishment contractor is one firm and many
establishments, so the divisor is too small and the ratio too high.

Correct values, each on a single consistent basis:

| Basis | Calculation | Result |
|---|---|---|
| As carried (employees ÷ **firms**) | 7,485,385 ÷ 785,917 | 9.52 |
| Economic Census, per **establishment** | 7,485,385 ÷ 803,120 | **9.32** |
| CBP 2022, per **establishment** | 7,361,847 ÷ 800,651 | **9.19** |

CBP's own construction employment is **7,361,847** (`EMP`, EMPSZES 001, LFO 001) against
800,651 establishments. Note the figure cited in an intermediate read as CBP `EMP`,
116,960,707, is `PAYQTR1` — first-quarter payroll in $000, not people.

This is **the relabelled total**, in its textbook form: a real figure from a real table
whose scope was quietly changed on the way into the document. It also mixes programs —
the 800,651 is attributed to CBP while the ratio's inputs are Economic Census. Whichever
basis the document wants, both numerator and denominator must come from it.

### Figure 8 — BLS OEWS — VERIFIED, both vintages

Source: BLS Occupational Employment and Wage Statistics, industry-specific tables for
**NAICS 238290 — Other Building Equipment Contractors**. SOC 47-4021, Elevator and
Escalator Installers and Repairers.

| Vintage | URL | Industry employment | 47-4021 | Percent |
|---|---|---|---|---|
| May 2022 | https://www.bls.gov/oes/2022/may/naics5_238290.htm | 148,470 | 20,640 | **13.90%** |
| May 2023 | https://www.bls.gov/oes/2023/may/naics5_238290.htm | 153,170 | 21,300 | **13.90%** |

Both exact as carried. The 13.90% is **printed on the BLS page itself** as "Percent of
Industry Employment" — it is not a derived figure, which is the strongest form this can
take. Recomputation agrees: 13.9018% and 13.9061%.

One nuance to hold, not a correction: OEWS industry employment for 238290 (148,470 in
May 2022) is not the same as the Economic Census `EMP` for 238290 (141,908 in 2022).
Different programs, different reference periods, different establishment universes. Do
not use one to check the other, and do not mix them in a single ratio — that is how 7b
happened.

---

## 9–12. The deal record

### Figure 9 — APi Group / Elevated — VERIFIED

Source: APi Group Corporation, Form 8-K Exhibit 99.1, filed with the SEC.
URL: https://www.sec.gov/Archives/edgar/data/1796209/000162828024026540/apg-2024604xexx991.htm

Verbatim:

> "New Brighton, Minnesota – June 4, 2024 – APi Group Corporation (NYSE: APG) ("APi" or
> the "Company") today announced that it has completed its previously announced
> acquisition of Elevated Facility Services Group ("Elevated") from a fund managed by
> L Squared Capital Partners for approximately $570 million."

> "Elevated is expected to contribute approximately $220 million in annual revenue at an
> approximate 20% adjusted EBITDA margin."

> "Elevated has approximately 600 leaders and serves customers in over 18 states."

All four elements confirmed from the acquirer's own SEC exhibit: **$570 million**,
**closing 4 June 2024**, **≈$220m revenue**, **over 18 states**, **≈600**. Two points of
precision worth preserving in copy: the release says "over 18 states", not "18 states";
and the ≈600 are described as "leaders" / "new teammates", which is a headcount
statement but not literally the words "employees". The $220m is **expected contribution**,
forward-looking, not a reported historical result. The 20% adjusted EBITDA margin is
available from the same sentence if useful.

### Figure 10 — the "22 states / 30+ markets" attribution — VERIFIED

Source: Elevated Facility Services Group, "Elevated Facility Services Unveils Rebranding
and New Direction for Growing Company", PR Newswire, **23 October 2023**.
URL: https://www.prnewswire.com/news-releases/elevated-facility-services-unveils-rebranding-and-new-direction-for-growing-company-301963441.html

Verbatim:

> "In operation across 30+ markets in 22 states, it serves the owners and facility
> managers of airports, universities, hospitals, and premier properties."

**The attribution is correct as carried.** This is Elevated's own release, dated
2023-10-23, and the figure is *not* from APi — APi's June 2024 release says "over 18
states". Keeping the two apart is right: they are different companies speaking at
different dates about a changing footprint, and the eight-month-older, larger number
belongs to the seller. Do not reconcile them into one figure.

### Figure 11 — dated OEM tuck-ins

**11a — TK Elevator / Albany Elevator, 3 May 2021 — VERIFIED.**
Source: TK Elevator press release, dated **May 3, 2021**.
URL: https://www.tkelevator.com/media/usa_canada/press_releases_us_ca/archive_7/20210503-tke-albany.pdf

> "TK Elevator has acquired Albany Elevator, a leading provider of modernization,
> maintenance, repair and installation services in the Albany area for the past 21 years."

Date and parties exact.

**11b — KONE / "Oregon Elevator" 2010 — CORRECTED.**

There is no company named "Oregon Elevator" in this transaction. KONE's own release is
titled **"KONE acquires elevator service company in Oregon, USA", dated 1 June 2010** —
a company *in* Oregon, not a company *called* Oregon Elevator.

The target was **Reliant Elevator Co.** Source: NW Labor Press, 4 June 2010:

> "Kone Elevators and Escalators has acquired Reliant Elevator Co., the largest
> independent union elevator service company in Oregon."

URL: https://nwlaborpress.org/2010/0604/6-4-10IUEC.html
KONE release: https://www.kone.com/en/news-and-insights/releases/kone-acquires-elevator-service-company-in-oregon-usa.aspx

Carry as: **KONE / Reliant Elevator Co. (Oregon), announced 1 June 2010.** The error is a
headline misread — the descriptive phrase "elevator service company in Oregon" became a
company name — and it would be invisible to any audit, since the date and acquirer are
right. Note separately that KONE also acquired **A-Lift Elevator, Portland, Oregon**; if
the register carries only one Oregon KONE tuck-in, check which is meant.

**11c — KONE / Eagle Elevator, Minneapolis 2012 — VERIFIED.**
Source: KONE press release via PR Newswire, dated **2 May 2012**.
URL: https://www.prnewswire.com/news-releases/kone-acquires-eagle-elevator-in-minneapolis-minnesota-usa-149815085.html

> "KONE has acquired the business of Eagle Elevator Corporation, an independent elevator
> service company with a very strong reputation in the Minnesota market."

The year 2012 as carried is right; the precise date is 2 May 2012.

### Figure 12 — TAKA Elevator

**12b — TAKA to TEI Group, 3 January 2025 — VERIFIED.**
Source: TEI Group's own announcement.
URL: https://teigroup.com/Northeast-Region/news-article.php?id=182

> "TAMPA, FL. January 3, 2025—TEI Group, a leader in comprehensive elevator services in
> the New York Metropolitan Area and the US Southeast region, is pleased to announce the
> acquisition of TAKA Elevator, an independent provider of elevator services based in
> Orlando, Florida."

Date and parties exact.

**12c — "Otis never acquired TAKA" — VERIFIED as a negative.** No Otis/TAKA transaction
exists in any source located. The affirmative evidence is stronger than mere absence:
TEI's January 2025 release describes TAKA at the point of sale as "an **independent**
provider of elevator services", and the founder's quote refers to "the business we have
built at TAKA over the last 13 years" — i.e. continuous independent ownership from
founding (2012) to January 2025. An Otis acquisition in that window is excluded. The
earlier source that attributed TAKA to Otis was wrong, and the correction stands.

**12a — TAKA service book to KONE in 2019 — NOT FOUND.**

No primary or credible secondary source supports this. Searched: KONE's press-release
archives, TEI's release, the trade press, and TAKA's own materials. KONE issues releases
for its US tuck-ins (Eagle Elevator, Reliant, A-Lift are all on file), and there is no
2019 KONE release involving TAKA. TEI's 2025 release, which recounts TAKA's history, does
not mention KONE at all.

This does not disprove the transaction — a maintenance-portfolio sale is often
unannounced, and a company can sell a service book while continuing to trade, which is
consistent with TAKA still being "independent" in 2025. But **it is currently unsourced**.
Per the correction rule, replacing one unsourced claim with another is not a correction:
either produce the source, or the document says the 2019 KONE portfolio sale could not be
substantiated. Do not carry it as settled fact, and in particular do not let it stand as
the "corrected" version of the retired Otis claim — that would be
*corrected-to-another-guess*.

---

## 13–17. New York

Dataset: NYC Open Data, **DOB NOW: Elevator Safety Compliance**, resource `e5aq-a4j2`.
All counts below re-queried live on 2026-08-11 via the Socrata SoQL API at
https://data.cityofnewyork.us/resource/e5aq-a4j2.json.

### The two recorded traps — both reproduced and avoided

**Trap 1 — the count discrepancy.** `$select=count(1)` returns **120,256**, matching the
carried total exactly. The earlier pass's 120,116 from a `count(*)` call is not
reproducible and should be treated as the artifact. The count is corroborated
independently: the seven `device_status` values sum to exactly 120,256 (below). A control
total that cross-foots is the answer to this trap.

**Trap 2 — the `|>` pipe.** Confirmed live and still broken. `$query` **works** on its
own — `$query=SELECT count(1) AS n WHERE device_status='Active'` correctly returns
93,454. But adding a `|>` stage causes the **entire `$query` parameter to be silently
dropped**, and the endpoint returns unfiltered device records with an HTTP 200. There is
no error. Any figure produced through a `|>` pipe on this dataset is untrustworthy.

Workaround used here, which needs no nested aggregation: filter with `$having`, order
**ascending**, and probe at offset *N−1*. If the row returned is the set's maximum, the
set has exactly *N* members; offset *N* returns `[]`. This gives exact counts in two
calls and is immune to the pipe bug.

### Figure 13 — the totals — VERIFIED

| | Count |
|---|---|
| Total records | **120,256** |
| Active devices | **93,454** |

Full `device_status` breakdown, which cross-foots to the control total:

| device_status | count |
|---|---|
| Active | 93,454 |
| Removed | 20,447 |
| Work in Progress | 3,548 |
| Dismantled | 1,678 |
| Deleted | 744 |
| Withdrawn | 308 |
| Sealed | 77 |
| **Sum** | **120,256** ✓ |

Construction devices removed from the active set — `Personnel Hoist` 709 + `Conveyor`
638 + `Manlift` 32 = **1,379**, exactly as carried. 93,454 − 1,379 = **92,075**. All
three figures verified, and the 1,379 is confirmed by composition rather than assertion.

### Figure 14 — permanent vertical-transportation base by type — VERIFIED

Active devices, excluding the three construction types:

| device_type | count |
|---|---|
| Elevator | 81,232 |
| Accessibility Lift | 7,034 |
| Escalator | 2,606 |
| Dumbwaiter | 1,197 |
| Moving Walk | 6 |
| **Sum** | **92,075** ✓ |

Exact on every line, and the five types sum to the 92,075 base independently.

### Figure 15 — borough split — CORRECTED (scope)

The five carried values reproduce **exactly** — but only on the **93,454 active base**,
i.e. with construction devices still in:

| Borough | On active base (93,454) — **as carried** | On VT base (92,075) |
|---|---|---|
| Manhattan | **48,378** | 47,835 |
| Brooklyn | **20,115** | 19,785 |
| Queens | **13,333** | 13,139 |
| Bronx | **9,693** | 9,558 |
| Staten Island | **1,935** | 1,758 |
| Sum | **93,454** | 92,075 |

**The numbers are right; the base is not the one the document defines.** Figure 13
establishes 92,075 as "the permanent vertical-transportation base after removing 1,379
construction devices", and figure 14's type table is computed on it. The borough table
is computed on 93,454 and includes the hoists, conveyors and manlifts that figure 13
explicitly removed.

So the document contains two tables that appear to describe the same population and do
not: the type table sums to 92,075, the borough table to 93,454. Either restate the
borough table on the 92,075 base (right-hand column above, which sums correctly), or say
plainly that the borough split is of all active devices. The 1,379-device gap is small,
but a reader who adds either table up will find they disagree.

### Figure 16 — buildings and concentration — VERIFIED, all of it

| Figure | Verdict |
|---|---|
| 43,454 buildings | **VERIFIED** — `count(distinct bin)` on active = 43,454 |
| 25,946 buildings hold exactly one device | **VERIFIED** — exact |
| 3,072 buildings (7.1%) hold 32,208 devices (34.5%), 10.5 each | **VERIFIED** — exact |

**25,946** confirmed by offset probe on `$having=c=1`: offset 25,945 returns a row,
offset 25,946 returns `[]`. Exactly 25,946, no rounding.

**3,072** is the count of buildings with **5 or more devices**, and it is exact.
Confirmed two independent ways: ordered by device count descending, the 3,072nd building
has 5 devices and the 3,073rd has 4; and `$having=c>=5` ordered ascending returns the
maximum (137) at offset 3,071 and `[]` at 3,072. The threshold is **5+**, not 10+ — for
the record, only **1,000–1,004** buildings hold 10 or more. If the document states or
implies a 10-device threshold anywhere, that wording is wrong even though the figure is
right; "10.5" is the group's *average*, not its cut-off.

**32,208** verified by reconstructing the full distribution. Boundary counts, each pinned
exactly by the ascending-offset method:

| Set | Count |
|---|---|
| groups with ≥3 devices | 7,723 |
| groups with ≥4 devices | 4,847 |
| groups with ≥5 devices | 3,072 |
| groups with exactly 1 device | 25,946 |

**One subtlety decides this figure.** Exactly **one active device has a NULL `bin`**.
`count(distinct bin)` excludes it — giving 43,454 buildings — but `GROUP BY bin` creates
a group for it, so the grouped set has **43,455** rows. That was confirmed directly:
ordered ascending, offset 43,454 returns the maximum (137) and offset 43,455 returns `[]`.

Reconstructing on the 43,455 groups:

| devices | groups | devices in bucket |
|---|---|---|
| 1 | 25,946 | 25,946 |
| 2 | 9,786 | 19,572 |
| 3 | 2,876 | 8,628 |
| 4 | 1,775 | 7,100 |
| ≥5 | 3,072 | **32,208** |
| **total** | **43,455** ✓ | **93,454** ✓ |

Devices in groups of ≤4 = 61,246; 93,454 − 61,246 = **32,208**. Exact, and both margins
cross-foot to the control totals.

Derived figures check too: 3,072 ÷ 43,454 = 7.0695% → **7.1%** ✓; 32,208 ÷ 93,454 =
34.4640% → **34.5%** ✓; 32,208 ÷ 3,072 = 10.4844 → **10.5** ✓.

Worth recording that ignoring the null-`bin` group produces **32,210** — off by two, and
plausible enough to be adopted as a "correction" by a later pass. It is not one. The
carried figure is right; 32,208 should be left alone.

Note these concentration figures use the 93,454 active base, consistent with figure 15
and inconsistent with figures 13/14's 92,075. Same scope issue as above; the arithmetic
is sound within its own base.

### Figure 17 — New York State licensing — VERIFIED, all four, and the agency is right

Source: **New York State Department of Labor**, published on the State's open data
portal. Confirmed **Department of Labor**, not Department of State.

Individual licences — dataset `cxfs-ya8e`, filtered `license_status = 'Active'`:
https://data.ny.gov/resource/cxfs-ya8e.json

| license_type | Active |
|---|---|
| Elevator Mechanic License (SH132) | **3,948** ✓ |
| Elevator Inspector License (SH132) | **748** ✓ |
| SH132: Elevator Accessibility Lift Technician | 54 |
| Elevator Accessibility Technician License (SH132) | 11 |

Business licences — dataset `jrac-r9vc`, filtered `license_status = 'Active'`:
https://data.ny.gov/resource/jrac-r9vc.json

| license_type | Active |
|---|---|
| Elevator Contractor License (SH131) | **132** ✓ |
| Elevator Inspection Contractor License (SH131) | **78** ✓ |

All four exact. **The active filter is load-bearing** — unfiltered, the same datasets
return 5,610 mechanics and 963 inspectors. Anyone re-pulling these must filter
`license_status = 'Active'` or they will get materially larger numbers and think the
document is understated.

---

## Corrections register for this pass

| Ref | Was | Is | Source that overturned it |
|---|---|---|---|
| 6 | "203,401 establishments, 52.59% under 5 / 73.13% under 10 / 86.65% under 20" | Percentages are of **167,779** establishments operated the entire year. Against all 203,401 they are 43.38% / 60.32% / 71.48%. Both counts are correct; the pairing is not. | ECNLOCCONS2022.EC2223LOCCONS, EMPSZFE 001 vs 100 |
| 7b | "all-construction employees per establishment 9.52 (7,485,385 ÷ 785,917)" | **785,917 is FIRMS, not establishments.** Establishments are 803,120. Per establishment: **9.32** (Economic Census) or **9.19** (CBP, 7,361,847 ÷ 800,651). | ECNBASIC2022.EC2223BASIC, NAICS 23 — FIRM and ESTAB are distinct fields |
| 11b | "KONE / Oregon Elevator 2010" | **KONE / Reliant Elevator Co.**, Oregon, announced **1 June 2010**. No company named "Oregon Elevator" was involved. | KONE release title; NW Labor Press, 4 June 2010 |
| 15 | Borough split presented on the 92,075 VT base | Values are correct but are the **93,454 active base**, construction devices included. On the 92,075 base: 47,835 / 19,785 / 13,139 / 9,558 / 1,758. | Live Socrata re-query, both bases |
| 12a | "TAKA service book to KONE in 2019" | **NOT FOUND.** No primary or secondary source. Not to be carried as settled, and not to be treated as the correction to the retired Otis claim. | KONE release archive; TEI 2025 release |

## Figures strengthened rather than changed

- **Figure 3**, the NEII "compiled in 2007" sentence, is real and quoted exactly. Every
  share statistic resting on the installed base keeps its vintage caveat. It is on the
  **2019** sheet, not the 2020 one.
- **Figure 16** is exact in every part, including the 32,208 that a careless
  recomputation would "correct" to 32,210. The null-`bin` group is the reason.
- **Figure 8**'s 13.90% is printed by BLS, not derived here.
- **Figure 5** is clean on all five values, straight from the Census table.

## What this pass did not establish

- Whether TAKA sold a maintenance portfolio to KONE in 2019 (12a) — unresolved, and
  resolving it likely needs a trade-press archive or the parties directly.
- Whether the document's own wording for figure 16 states a 10-device threshold. The
  figures are right; the threshold is 5+. That is a copy check against the master, not a
  source question.
- CBP and Economic Census establishment universes differ (800,651 vs 803,120) and are not
  reconciled here. Do not treat them as interchangeable, and do not build a ratio across
  the two programs.

---
