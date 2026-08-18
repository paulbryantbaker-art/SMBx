<!-- run: 05 | hunt: B | date: 2026-08-11
     query: BLS OES 47-4021 elevator escalator installers repairers May 2025 wage employment; bls.gov oes 2025 may oes474021; IUEC LM-2 membership Department of Labor OLMS; "000-197" OLMS LM-2 ELEVATOR CONSTRUCTORS; NEIEP apprenticeship 4 year hours graduates per year; IUEC NEBA national agreement mechanic hourly wage rate; California DIR prevailing wage determination "Elevator Constructor"; Davis-Bacon wage determination elevator constructor; elevator maintenance contract "per unit per month" price range; elevator maintenance contract five year term auto-renewal cancellation liquidated damages; "full maintenance" versus "oil and grease" elevator contract types; "In re Elevator Antitrust Litigation" maintenance service contracts; European Commission 2007 elevator escalator cartel decision fine; elevator modernization cost 2025 controller replacement price range; elevator installed base average age "more than 20 years" modernization eligible; HUD "estimated useful life" table elevator; university/city award elevator modernization contract bid amount; NEII number of elevators in United States; Otis 10-K/earnings maintenance portfolio units retention rate service margin; Otis EV/EBITDA August 2026; elevator service company EBITDA multiple lower middle market; APi Group Elevated Facility Services Group purchase price; KONE TK Elevator 2026 enterprise value EBITDA; elevator route density "units per mechanic"; NAEC members statistics; elevator mechanics shortage retirements
     tool: web search + fetch -->

# 05 — Operating Economics and Labor: US Elevator & Escalator

**Basis labels used throughout:** `Disclosed` (the party itself published it) · `Press-derived` (a third party reported it) · `Estimated` (arithmetic I performed from disclosed inputs — the arithmetic is shown every time) · `Unsourced` (a figure I found but could not tie to an instrument — recorded with that warning attached, never used as a conclusion).

**A note on what is NOT here.** Several slots the brief asks for are empty. They are listed in `## What we don't know yet` at the end, and that section is long on purpose. Where a number exists in the market but I could only find it behind an interested party with no visible instrument, I have recorded it as a *claim by that party*, not as a fact.

---

## A. Labor — the binding constraint

### A.1 BLS OEWS 47-4021 — Elevator and Escalator Installers and Repairers

**Vintage problem, stated up front.** BLS retired the static per-occupation OEWS profile pages for the May 2024 and May 2025 vintages. https://www.bls.gov/oes/2025/may/oes474021.htm, https://www.bls.gov/oes/2024/may/oes474021.htm and https://www.bls.gov/oes/current/oes474021.htm all redirect to the OEWS programme home page (tested 2026-08-11, three separate attempts, plus a cache-busted retry). Direct download of the OEWS national XLSX was blocked by this session's egress policy. **The most recent OEWS profile I could read at the primary source is May 2023.** The May 2024 figures below come from BLS's own Occupational Outlook Handbook (primary BLS, different product) and, for the percentile detail only, from a secondary aggregator that cites OEWS May 2024 — flagged as such.

#### May 2023 — BLS OEWS, occupation 47-4021 (primary; `Disclosed`)
Source: US Bureau of Labor Statistics, Occupational Employment and Wage Statistics, May 2023 — https://www.bls.gov/oes/2023/may/oes474021.htm

| Item | May 2023 |
|---|---|
| National employment | 23,990 |
| Mean hourly wage | $48.11 |
| Mean annual wage | $100,060 |
| Median annual wage | $102,420 |
| 10th percentile (annual) | $51,960 |
| 25th percentile (annual) | $75,570 |
| 50th percentile (annual) | $102,420 |
| 75th percentile (annual) | $127,310 |
| 90th percentile (annual) | $138,910 |

Industries, May 2023 (same source):
- Building Equipment Contractors (NAICS 2382) — 21,390 employed, $102,450 mean annual. **~89% of the occupation sits in one NAICS line.**
- Machinery, Equipment and Supplies Merchant Wholesalers — 500 employed, $100,980 mean annual
- Machinery Manufacturing — 390 employed, $70,300 mean annual
- Highest-paying industry: Other Specialty Trade Contractors — $132,090 mean annual

Top-paying states, May 2023 (mean annual): Nevada $151,500 · Hawaii $132,150 · Massachusetts $126,830 · California $126,110 · New Jersey $124,970.
Top-paying metros, May 2023 (mean annual): San Francisco–Oakland–Hayward CA $138,300 · Urban Honolulu HI $132,110 · Boston–Cambridge–Nashua MA-NH $126,730.

#### May 2024 / 2024 base year — BLS Occupational Outlook Handbook (primary BLS; `Disclosed`)
Source: BLS OOH, "Elevator and Escalator Installers and Repairers", page last modified **28 August 2025** — https://www.bls.gov/ooh/construction-and-extraction/elevator-installers-and-repairers.htm

- Median pay 2024: **$106,580/yr — $51.24/hr**
- Number of jobs, 2024: **24,200**
- Projected change 2024–34: **+5%** ("faster than average"), **+1,200 jobs**
- Average annual openings 2024–34: **~2,000/yr**
- Typical entry-level education: high school diploma or equivalent
- Training: 4-year apprenticeship with predetermined annual hours of technical instruction and paid OJT
- BLS's own framing of the openings: "Many openings result from worker retirements and transitions rather than net new job creation."

**Read that last line carefully.** BLS projects **+1,200 net new jobs over ten years but ~2,000 openings per year** — i.e. roughly 20,000 openings across the decade against 1,200 of net growth. Approximately 94% of hiring demand in this occupation over 2024–34 is replacement demand, not growth. `Estimated`: (20,000 total openings − 1,200 net growth) ÷ 20,000 = 94%. That is the succession-pressure instrument, and it is a BLS projection rather than a survey of the existing mechanic population's age.

#### May 2024 percentile detail (secondary, flagged)
Source: skilledtradesiq.com, "Elevator Installer and Repairer Salary (2026 Data)", citing "BLS OEWS, May 2024" — https://skilledtradesiq.com/salaries/elevator-installer-repairer/ · `Press-derived`, **not verified against BLS**
- Employment ~23,340; median annual $106,580 (matches BLS OOH exactly, which is a partial cross-check); mean annual $104,860
- 10th $54,720 · 25th $76,700 · 75th $131,740 · 90th $149,250
- Top state medians: Hawaii $150,600 · Maine $138,520 · Nevada $137,950 · California $137,340
- Highest metro median: San Jose–Sunnyvale–Santa Clara CA $169,560

I am recording these because the median matches the BLS OOH figure exactly, which raises confidence that the aggregator did read the OEWS file. I am **not** treating the percentiles or state medians as verified.

### A.2 The wage comparison that inverts the home-services thesis

All four rows below are BLS OEWS **May 2023**, same vintage, same methodology, primary source — so the comparison is apples-to-apples.

| SOC | Occupation | Employment | Median annual | Mean annual | 90th pct annual | Source |
|---|---|---|---|---|---|---|
| 47-4021 | Elevator & escalator installers/repairers | 23,990 | **$102,420** | $100,060 | **$138,910** | [BLS](https://www.bls.gov/oes/2023/may/oes474021.htm) |
| 47-2111 | Electricians | 712,580 | $61,590 | $67,810 | $104,180 | [BLS](https://www.bls.gov/oes/2023/may/oes472111.htm) |
| 47-2152 | Plumbers, pipefitters, steamfitters | 436,160 | $61,550 | $67,840 | $103,140 | [BLS](https://www.bls.gov/oes/2023/may/oes472152.htm) |
| 49-9021 | HVAC/R mechanics and installers | 397,450 | $57,300 | $59,620 | $84,250 | [BLS](https://www.bls.gov/oes/2023/may/oes499021.htm) |

**The single most important number in this file:** the elevator mechanic **median** ($102,420) is *below but within ~2% of* the electrician **90th percentile** ($104,180) and *above* the plumber 90th percentile ($103,140) and far above the HVAC 90th percentile ($84,250). `Estimated`: $102,420 ÷ $57,300 = **1.79x** the HVAC median; ÷ $61,590 = **1.66x** the electrician median.

A typical elevator mechanic out-earns roughly nine out of ten HVAC technicians. Any underwriting model imported from HVAC, plumbing or roofing consolidation that assumes labour cost per hour in the $25–45 range, or assumes a buyer can arbitrage wage rates by recruiting or by shifting mix toward helpers, is wrong on the input that dominates the cost stack.

Occupation size is the second structural fact: **23,990–24,200 mechanics nationally** (BLS). This is a trade roughly **1/30th the size of the electrician workforce**. There is no deep bench to hire from; a buyer cannot grow a route base faster than it can grow mechanics, and it cannot grow mechanics faster than NEIEP graduates them.

### A.3 Union: IUEC — membership and the bargaining structure

**Primary-source access failure, declared.** The brief instructs that IUEC LM-2 filings with the US DOL are the primary source and should be used over press estimates. I attempted this and **could not reach OLMS**. `olmsapps.dol.gov` and `olms.dol-esa.gov` are both blocked to the fetch tool by robots.txt handling, and direct HTTPS to `dol.gov` hosts was refused by this session's egress proxy (403 on CONNECT). Search did surface the OLMS report URLs — the national body files under **file number 000-197** with a **fiscal year ending 30 June** (e.g. `olmsapps.dol.gov/query/orgReport.do?rptId=844037&rptForm=LM2Form` for FYE 06/30/2022) — but I could not open them. **Anyone re-running this should pull file 000-197 directly.** What follows is the best available substitute, labelled honestly.

| Figure | Source | Basis |
|---|---|---|
| **31,290 members, year covered 2025**, total assets $69,908,354, 64–69 affiliated locals listed (largest: Local 1, Long Island City NY, 2,853 members) | Center for Union Facts republication of OLMS LM filings — https://www.unionfacts.com/union/Elevator_Constructors (page states "Source: Office of Labor-Management Standards", "Year Covered: 2025 • Last Updated: April 23rd, 2026") | `Press-derived` from LM-2. **Interest disclosure: Center for Union Facts is an advocacy organisation critical of organised labour.** It republishes DOL filings, so the underlying instrument is right, but I could not confirm whether 31,290 is the national body's Item 20 figure or a sum across locals — I asked the page directly and it does not label which. |
| **28,620 members (2018)**, cited to "US Department of Labor, Office of Labor-Management Standards. File number 000-197. Report submitted September 28, 2018" | Wikipedia, IUEC — https://en.wikipedia.org/wiki/International_Union_of_Elevator_Constructors | `Press-derived` from LM-2, with the LM-2 citation visible |
| **"30,000+ skilled elevator constructors across the US and Canada"** | IUEC's own site — https://iuec.org/ | `Disclosed` (self-reported) |
| **"more than 31,000 members"** covered by the 2022 CBA | ElevatorInfo, 20 April 2022 — https://www.elevatorinfo.org/elevator-constructors-union-ratifies-new-collective-bargaining-agreement/ | `Press-derived` |

**Do not compute a naive union density from these.** IUEC membership (30,000–31,290) *exceeds* BLS US employment in SOC 47-4021 (23,990–24,200). The two cannot be divided. The reasons are that IUEC covers **US and Canada**, and that IUEC membership includes apprentices, helpers, assistant mechanics and retirees/members not currently coded into 47-4021 by OEWS, while OEWS is a US establishment survey of one SOC code. **I did not find a CPS-based union density percentage for this detailed occupation and I am not going to invent one.**

**What I can establish structurally instead**, and it is stronger than a percentage: the industry bargains **nationally**, and every major OEM is a signatory.

Source: **National Elevator Bargaining Association Agreement with the International Union of Elevator Constructors, 9 July 2022 – 8 July 2027** — https://iuec.org/wp-content/uploads/2022-2027-NEBA-Agreement.pdf (`Disclosed`, primary CBA)

Parties per ElevatorInfo's contemporaneous report of ratification: NEBA representing **Otis, Schindler, Fujitec America, KONE, Mitsubishi, North American Elevator Services and TKE**, plus the **Elevator Contractors of America (ECA)** for independent signatory contractors.

Terms extracted verbatim / near-verbatim from the CBA:
- **Term:** 9 July 2022 to 8 July 2027 (five years)
- **Annual gross increases effective 1 January each year:** Yr1 **3.50%**, Yr2 **3.45%**, Yr3 **3.45%**, Yr4 **3.45%**, Yr5 **3.50%**
- **Fringe credit mechanic:** "Subtract the $0.85 per hour fringe contribution increase from the computed total package percentage, and the result will be the wage rate increase for the Elevator Constructor Mechanic."
- The wage table line reads verbatim: *"Current Wage Rate Amount Contribution Level $37.485 Fringe Total January 1, 2023……………....... $0.85 $38.335"*. **Caution — I am not asserting that $37.485/hr is "the" mechanic wage.** The line is ambiguous as rendered ($37.485 + $0.85 = $38.335), and a $37.49 national figure sits far below the BLS median hourly of $51.24, which is consistent with this being a national reference/base rate that local agreements and zone differentials build on. Flagged in "What we don't know yet."
- **Helper:** "seventy (70) percent of the Elevator Constructor Mechanic's rate"
- **Apprentice progression (% of mechanic rate):** probationary (0–6 mo) **50%** · 1st yr **55%** · 2nd yr **65%** · 3rd yr **70%** · 4th yr / assistant mechanic **80%**
- **Apprentice ratio:** "total number of Helpers, Apprentices and Assistant Mechanics employed shall not exceed the number of Mechanics on any one job" (with a limited extra-helper allowance for multi-team jobs). **This is a hard 1:1 cap on dilution** — a buyer cannot lever the crew mix toward cheap labour beyond parity.
- **Overtime:** Saturdays, Sundays and outside the regular working day are "paid for at **double the rate of single time**"; holiday work at double time *in addition to* holiday pay. Note there is no time-and-a-half tier in the construction/repair language quoted — it steps straight to 2x. Callback and emergency coverage economics follow from this.
- **Jurisdiction:** local primary jurisdiction is defined as "that territory in which its members will agree to travel on their own time"; changes require both IUEC and NEBA Executive Director approval. This is a real constraint on geographic route expansion.

### A.4 What a mechanic actually costs an employer — prevailing wage instrument

Source: **California Department of Industrial Relations, General Prevailing Wage Determination SC-62-X-999-2023-1, Elevator Constructor, issue date 22 February 2023, expiration 31 December 2023** — https://www.dir.ca.gov/OPRL/2023-1/PWD/Determinations/Southern/SC-062-X-999.pdf (`Disclosed`, primary state determination). Counties: Imperial, Los Angeles, Orange, Riverside, San Diego, Santa Barbara, Ventura, plus parts of Kern, San Bernardino, San Luis Obispo.

Mechanic (journeyperson), per hour:

| Component | $/hr |
|---|---|
| Basic hourly rate | **$63.95** |
| Health and welfare | $16.075 |
| Pension | $20.56 |
| Vacation and holiday | $5.81 |
| Training | $0.70 |
| Other | $1.00 |
| **Total hourly rate** | **$108.095** |
| Daily / Saturday OT (1.5x) | $140.070 |
| Sunday / holiday OT | $172.045 |

`Estimated`: fringe load = ($108.095 − $63.95) ÷ $63.95 = **69% on top of base**. At 2,000 hours, straight-time fully-loaded cost per Southern California mechanic ≈ **$216,190/yr** ($108.095 × 2,000) — before vehicle, tools, supervision, insurance or unbilled travel.

This is a **prevailing-wage determination for public works in one region**, not a national private-market rate, and it is a **2023-1** determination. It is the cleanest primary instrument I could obtain for the loaded cost of the trade. Attempts to pull a current Davis-Bacon determination from SAM.gov (WD NY20260020) returned only page metadata, not the wage table.

### A.5 The apprenticeship pipeline — NEIEP

Source: **NEIEP National Apprenticeship Standards ("pattern standards"), certification date 15 July 2005**, developed by the National Elevator Industry Educational Program for the IUEC and participating employers — https://portal.neiep.org/download/patternstandards.pdf (`Disclosed`, primary programme standard, **but 2005 vintage**)
- **Term: four (4) years**, "minimum OJL attainment of **6,800 hours**"
- **144 hours per year** of related classroom instruction
- Wage progression 50% / 55% / 65% / 70% / 80% of mechanic rate (matches the 2022–27 CBA above — good cross-check across 17 years)
- Apprentice:mechanic ratio deferred to the CBA

Source: **NEIEP Apprentice FAQ** — https://www.neiep.org/iuec-apprenticeship-faq/ (`Disclosed`)
- "2,000 hours for every calendar year of their apprenticeship"; "The IUEC apprenticeship requires **144 hours per year in the NEIEP classroom**" — four hours one night a week, 72 hours per semester across 18 weeks
- Selection: **Elevator Industry Aptitude Test**, pass mark **70%**, then structured interviews by two Joint Apprenticeship Committee members, ranked by interview score
- The FAQ itself hedges duration generally: "Some are as short as two years, but most last for four or even five."

**Completions per year: not found.** NEIEP publishes no completion count I could locate, and DOL RAPIDS/apprenticeship.gov occupation-level completion data was not retrieved in this pass. This is a material gap — it is the single number that bounds how fast the trade's capacity can grow.

The barrier structure is worth stating plainly for underwriting: entry is **gated by a joint labour-management committee**, not by an employer's hiring decision. A buyer of an elevator service business cannot solve a capacity constraint by paying more or recruiting harder in the way an HVAC consolidator can.

### A.6 Retirement / succession pressure in the mechanic population

What I have:
- BLS projections imply ~94% of 2024–34 openings are replacement rather than growth (derivation in A.1), and BLS states in its own words that "Many openings result from worker retirements and transitions rather than net new job creation." (`Disclosed`, BLS OOH)
- Local-level recruitment activity is visible in trade press (e.g. Elevator World, "IUEC Local 1 To Recruit 50 Elevator-Escalator Apprentices"), but I did not verify the article body.

What I do **not** have: a median age for the mechanic population, a retirement-eligibility count, IUEC pension-fund participant-to-retiree ratios (the Elevator Constructors' pension plan Form 5500 would carry active vs retired participant counts and is the right instrument), or any survey of independent contractors' mechanic age profile. Recorded as empty.

---

## B. Maintenance contract economics

### B.1 What the contract types actually are

Source: **Washington Elevator** (an independent elevator service company — interest disclosed: they sell service contracts), "Service Maintenance Agreements — Part One" — https://waelevator.com/blog/maintenance-agreements-part-1 (`Press-derived`)
- **Full-service:** "Service callbacks (trouble calls), repairs, parts, and testing are typically included. The monthly price is higher, but everything should be covered."
- **Maintenance:** includes "some level of regular maintenance"; testing may or may not be included at no charge.
- **Oil and grease:** "Any parts, repairs or service callbacks are billed separately. Testing is sometimes included, but not always. The monthly cost is lower, but the owner may need to account for costs in the form of service calls or repairs."
- Term, same source: "Elevator agreements are generally **long-term (5-years or more) with automatic roll-over renewals**."
- Cancellation: distinguishes without-cause termination from with-cause, the latter "will require a breach to break the agreement. These clauses usually include a 'cure' period."

**Margin profile by contract type: NOT SOURCED.** I found no published gross-margin figures separating full-maintenance from oil-and-grease/parts-and-labour contracts. The economic logic is obvious (full maintenance transfers parts and callback risk to the contractor in exchange for a higher fixed monthly, so its margin is a function of equipment age and route discipline rather than of price), but **I have no instrument for it and am recording the slot as empty** rather than asserting a range. See "What we don't know yet."

### B.2 Real published per-unit-per-month pricing (primary)

**Instrument 1 — State of Wisconsin / UW contract 19-5971, elevator maintenance pricing schedule** — https://www.bussvc.wisc.edu/purch/contract/lists/5971pricing.pdf (`Disclosed`, public-sector awarded pricing)
- Bidders shown: **TK Elevator, Schindler, KONE, Schumacher**, plus "UW in-house" for some units
- Priced per unit as "BID PRICE PER MONTH", unit-by-unit
- **Observed range: $141.00 to $1,347.77 per unit per month**
- Examples read from the schedule: ~$1,012.43/mo (Thyssen units, 21 N Park St), $709.00/mo (Otis unit, Barnard Hall), $338.00/mo (specialty lifts), $1,086.10/mo (KONE, multiple units)
- By contractor: TK Elevator ~$265–$1,347; Schindler ~$141–$884
- **Service interval is priced explicitly**: a column shows W (weekly), S/M (semi-monthly) or M (monthly) — i.e. visit frequency is the pricing driver, which is exactly the route-density lever
- `Estimated` annualised: **$1,692 to $16,173 per unit per year** ($141 × 12; $1,347.77 × 12)

**Instrument 2 — City of Bay St Louis, MS / A-1 Elevator Service LLC, elevator maintenance agreement** — https://mccmeetingspublic.blob.core.usgovcloudapi.net/baystlsms-meet-8b6dcbbcc78347bcbdd9611b24ea4788/ITEM-Attachment-001-96996fbde2bd419ba9a9214aac82d143.pdf (`Disclosed`, executed/proposed municipal contract)
- **$940/month, $11,280/year, 7 units** → `Estimated` **~$134/unit/month, ~$1,611/unit/year**
- Scope: **quarterly** preventive maintenance (controllers, machines, ropes, hydraulics, hoistway, pit, doors, signals, escalators); callback service **7am–4pm weekdays only**; annual safety tests
- Exclusions: design changes, pre-existing conditions, obsolescence, misuse, power loss, theft, vandalism, hoist/pump motors, valves, drives, underground components, building structure, carriage finishes — **this is a parts-excluded / limited-scope contract, i.e. the low end of the coverage spectrum, which is consistent with it also being the low end of the price range**

The two instruments together bracket the market: **~$134/unit/month for quarterly-visit, parts-excluded coverage on simple units, up to ~$1,348/unit/month for weekly-visit coverage on complex traction equipment in an institutional setting.** That is a **10x spread**, and it is driven by visit frequency, equipment type and scope of parts coverage — not by geography or contractor identity. Any per-unit revenue assumption applied to a target without knowing its visit-frequency and coverage mix is meaningless.

### B.3 Contract term, auto-renewal, escalation, cancellation

**Primary contract language (Bay St Louis, above):**
- **Term:** three years initial
- **Auto-renewal:** "automatically re-new for successive three-year periods, after the initial term, unless either party serves written notice of its intention to cancel at least 30 days before the end"
- **Escalation:** "All prices as stated in this agreement shall be subject to review and adjusted annually if necessary. **No price increase shall be more than 5% annually.**" (Note this is a *cap* negotiated by a municipal buyer — an unconstrained commercial contract may not have one.)
- **Termination:** 30 days' written notice before term expiry; early termination requires certified mail stating breach, 30 days to cure, terminates day 31 if uncured; non-payment 60 days past billing allows suspension of service

**Practitioner description of the harsher end (law firm; `Press-derived`):** South Florida Law, PLLC, "Four Things You Need to Know About Elevator Maintenance Contracts" — https://www.southfloridalawpllc.com/2021/02/13/four-things-you-need-to-know-about-elevator-maintenance-contracts/
- Contracts "renew every **three to five years**"
- Cancellation window is narrow — "a relatively narrow timeframe (eg **90–120 days**) to cancel before the window expires"
- Describes "**self-renewing or evergreen clauses**" that make contracts "non-cancelable for several years" once the window passes
- Notes a **right of first refusal** clause allowing the incumbent to "meet or match offers by a competitor prior to cancelation"
- The firm cites **no statute and no case law** — this is practitioner description, not adjudicated authority. Article date not shown on the page.

**Independent servicer description (`Press-derived`, Washington Elevator, above):** "generally long-term (5-years or more) with automatic roll-over renewals."

**Regulatory/litigation evidence — what I found and what it does and does not prove:**
- **In re Elevator Antitrust Litigation**, US District Court SDNY, docket 1:04-cv-01178-TPG, MDL No. 1644, complaint dated 1 November 2004 — https://cases.justia.com/federal/district-courts/new-york/nysdce/1:2004cv01178/244173/74/2.pdf. The complaint alleges conspiracy "to coordinate bid prices for contracts for the sale of elevators and escalators and the provision of elevator and escalator **maintenance and repair services**" and "rigging bids for contracts for elevator and escalator maintenance and repair services." **I read the document and it does NOT contain allegations about contract length, auto-renewal, cancellation restrictions, liquidated damages, tying, proprietary tools or third-party servicer lockout.** I checked specifically because that is what the brief asked for. It proves that US maintenance pricing conduct has been litigated; it does not prove anything about contract terms.
- **European Commission elevator/escalator cartel decision, 21 February 2007** — record fine of **€992 million** against Otis, KONE, Schindler and ThyssenKrupp, covering installation and maintenance in Belgium, Germany, Luxembourg and the Netherlands; upheld on appeal (CJEU C-501/11 P, 2013). `Press-derived` from CNBC (https://www.cnbc.com/2007/02/21/eu-fines-elevator-cartel-a-record-992-million-euros.html) and Concurrences. **This is EU, not US, and it is 19 years old.** It is context for why maintenance contracting in this industry attracts regulatory attention; it is not evidence about US contract terms today.

**Honest verdict on B.3:** the "long terms and difficult cancellation" characterisation is **well-attested by practitioners and by one executed contract, but I did not find the primary evidence the brief hoped for** — no state statute specifically regulating elevator maintenance contract terms, no US court decision construing an elevator evergreen/liquidated-damages clause, and no OEM standard-form terms and conditions. I attempted the OEM form via a Law Insider posting of a US Communities purchasing-alliance elevator maintenance agreement; the page carried only metadata, not the contract text.

### B.4 Retention and attrition

**Disclosed, and the best number in this section:**
Otis Worldwide, Q4 2024 earnings call, 29 January 2025 — CEO Judy Marks on the service portfolio retention rate: **"going from 93.5% or so to 92.4%, some of that is involuntary."** — https://www.fool.com/earnings/call-transcripts/2025/01/29/otis-worldwide-otis-q4-2024-earnings-call-transcri/ (`Disclosed` via transcript). Same call: portfolio **~2.4 million units** at end-2024, **+4.2%** for the year, third consecutive year of 4%+ growth; China portfolio 435,000 units; **"we are net neutral on our net churn…the conversions then become the portfolio growth"** — i.e. all portfolio growth came from new-equipment conversions, none from retention improvement.

Otis Q3 2025 earnings call, 29 October 2025 — https://s203.q4cdn.com/227649559/files/doc_financials/2025/q3/3Q25-Otis-Worldwide-Corp-Earnings-Call-Transcript.pdf (`Disclosed`):
- "we're going to approach **2.5 million units** in our Service portfolio by year end"; "we continue to add about **100,000 units** this year"; portfolio growth **4%** in the quarter
- **"returning to the 94% retention rate will take sustained time to rebuild customers' trust"** — Judy Marks. Read as an admission that retention is currently *below* 94%.
- "Mix and churn for Service was flat"
- **Like-for-like service pricing increased 3 points in the quarter**; Americas up mid-single digits, EMEA low single digits

So the honest range for a **global OEM's** portfolio retention is **92.4%–94%**, disclosed, trending down and then being rebuilt. That is an annual attrition of **6.0%–7.6%**, implying an average contract life of `Estimated` **13–17 years** (1 ÷ 0.076 = 13.2; 1 ÷ 0.060 = 16.7) *if* attrition were constant — which it is not, since churn is concentrated at renewal windows.

**Interested-party benchmark, recorded with the interest disclosed:** CT Acquisitions — an M&A advisory firm that sells elevator sell-side services — publishes "Top-quartile is **95%+**; median is **88%**" for annual contract renewal on independent elevator businesses, attributed only to "buyer underwriting standards" with **no named source**. https://ctacquisitions.com/guides/elevator-business-valuation/ · `Unsourced`. I record it as a claim by a party with a commercial interest in elevator deal flow, not as a benchmark.

### B.5 Route density metrics — revenue per unit, revenue per mechanic, units per mechanic

This is where the brief says buyers underwrite, and it is where the public record is thinnest. Here is exactly what I could and could not source.

**Revenue per unit per year — sourced, from real contracts:**
- **$1,611/unit/yr** (Bay St Louis: $940/mo ÷ 7 units × 12) — quarterly-visit, parts-excluded
- **$1,692 to $16,173/unit/yr** (Wisconsin 19-5971 range: $141 to $1,347.77/mo × 12) — weekly to monthly visits, institutional
Both `Estimated` from `Disclosed` contract pricing. Arithmetic shown.

**Otis-derived per-unit service revenue — with a warning attached:**
Otis FY2025 Service segment net sales **$9.442 billion** (`Disclosed`, Otis FY2025 results release, 28 January 2026 — https://www.otisinvestors.com/news/news-details/2026/OTIS-REPORTS-FOURTH-QUARTER-AND-FULL-YEAR-2025-RESULTS/default.aspx) against a portfolio approaching **2.5 million units**. `Estimated`: $9,442m ÷ 2.45m units ≈ **$3,854 per unit per year**. **Do not use this as a maintenance-revenue-per-unit figure.** Otis's Service segment bundles maintenance, repair *and* modernization — Otis discloses these only as growth rates ("organic maintenance and repair sales increased 4% and organic modernization sales increased 14%" in Q3 2025; Q3 2025 release, https://s203.q4cdn.com/227649559/files/doc_financials/2025/q3/Q3-2025-Otis-Earnings-Release_FINAL.pdf) and **not as dollar splits**. It is also a global figure across markets with wildly different price levels (~500,000 of the units are in China). It is a ceiling on maintenance-only revenue per unit, nothing more.

**Revenue per employee — sourced, from a real US transaction:**
Elevated Facility Services Group, acquired by APi Group: **~$220 million revenue, ~600 employees, 18 states** (`Disclosed`, APi Group investor presentation, 15 April 2024 — https://s201.q4cdn.com/155847588/files/doc_presentations/2024/Apr/15/apg-investor-presentation_vfinal.pdf). `Estimated`: **~$367,000 revenue per employee** (not per mechanic — the 600 includes branch management, admin and sales). Units under contract were **not disclosed**, so revenue per unit and units per mechanic cannot be derived from this deal.

**Units per mechanic — a national ceiling, and a warning about the circulating number:**
`Estimated` national ratio: **900,000 US elevators** (National Elevator Industry Inc. fact sheet — "There are 900,000 elevators in the United States (1,000,000 when you add elevators in Canada)"; 35,000 US escalators; https://nationalelevatorindustry.org/wp-content/uploads/2019/02/Fact-Sheet.pdf — **NEII states "A majority of this data was compiled in 2007"**, so treat as stale) ÷ **~24,200 mechanics** (BLS OOH 2024) = **~37 units per mechanic**. This is an *upper bound on a national average*, not a route metric: the denominator includes mechanics doing new installation, repair and modernization who carry no maintenance route at all, and the numerator is a ~2007-vintage count.

**The circulating "route density" figures, and why I am not endorsing them.** CT Acquisitions (https://ctacquisitions.com/guides/elevator-business-valuation/) publishes, attributed to "NAEC data": "**65 to 90 units per technician per day**" as the industry route-density benchmark, and "A typical mid-market target holds **800 to 3,500 units**"; also "miles per service call — top-quartile is under 12 miles, median is 18 miles" and a technician-to-manager ratio of "8:1 to 12:1". **Three problems:** (1) "units per technician **per day**" is internally implausible — no mechanic performs preventive maintenance on 65–90 units in a day; the figure is most likely units per technician *per route*, garbled; (2) I could not verify the NAEC attribution — the National Association of Elevator Contractors publishes no such statistic that I could locate on naec.org; (3) **the publisher is an M&A advisory firm selling services into elevator transactions**, and the figure appears on a page whose purpose is to attract sellers. Recorded as `Unsourced` claim by an interested party. **The route-density slot is effectively empty.**

**What is sourced and is genuinely useful for route density:** the Wisconsin schedule prices **service interval explicitly** (weekly / semi-monthly / monthly), which means visit frequency is a contracted, priced variable. That, plus the 1:1 apprentice cap and the 2x overtime rule from the CBA, is enough to say that route economics in this trade are set by *visit frequency × travel time × loaded mechanic hour*, and that all three inputs are structurally rigid. It is not enough to state a units-per-mechanic benchmark.

---

## C. Modernization

### C.1 Service life and the modernization cycle

**OEM's own published guidance (`Disclosed`; interest disclosed — Otis sells modernization):** Otis, "Elevator Modernization" — https://www.otis.com/en/us/our-company/innovation/elevator-modernization
- "**more than 7 million of the world's 21 million elevators are more than 20 years old**"
- "That number is expected to **more than double to 15 million** elevators in the next decade"
- "For elevators, this useful life is typically **around 20 years**. Past that period, aging equipment experiences more frequent and unexpected shutdowns."
- Core scope: "upgrading the system to the latest safety standards and regulations, and upgrading the **controller**, or 'brain' of the elevator, to the latest technology"; cab aesthetics optional; US-specific opportunity called out as converting hydraulic to roped/belted systems

A second reporting of the same Otis-sourced framing gives slightly different denominators — "**Around 8 million of the world's 22 million elevators are more than 20 years old**", rising to 15 million in a decade (Hartford Business Journal, https://hartfordbusiness.com/article/in-ct-engineers-shape-key-part-of-otis-future-business-modernizing-the-worlds-aging/, no byline or date shown; `Press-derived`). **Both are recorded; they conflict at 7m/21m vs 8m/22m.** Neither is US-specific.

**Independent, non-commercial life estimates (`Disclosed`, government):** US Department of Housing and Urban Development, CNA e-Tool Estimated Useful Life Table (numbering per ASTM 2018-08 outline) — https://www.hud.gov/sites/documents/eul_for_cna_e_tool.pdf. Section 3.5.1, vertical transportation:

| Component | EUL (years) |
|---|---|
| Elevator controller, call, dispatch, emergency | **10–20** |
| Elevator cab, interior finish | 10–20 |
| Elevator cab, frame | 35–50 |
| Elevator, machinery | **20–30** |
| Elevator, shaftway doors | 10–20 |
| Elevator, shaftway hoist rails, cables, traveling | 20–25 |
| Elevator, shaftway hydraulic piston and leveling | 20–25 |
| Escalators | 50 |
| Electrical switchgear | 50 |

This matters because it shows **the modernization cycle is component-staggered, not monolithic**: controllers and door equipment age out at 10–20 years while frames and escalators run 35–50. That is the structural reason modernization can be sold in phases — and Otis has commercialised exactly that (Otis "flexible/phased elevator modernization packages", announced for North America).

### C.2 What a modernization costs — real, sourced transactions only

I deliberately excluded the "elevator modernization cost 2026" content-farm pages (dazenelevator.com, elevatorinsight.io, elevatorblueprint.com, esigr.com, fujixd.com and similar) that dominate search for this query. They quote wide ranges with no methodology and no source, several appear machine-generated, and every one of them is published by a party selling elevators or modernization. **None of their numbers appear in this file.** What follows is procurement and project reporting.

| Project | Cost | Units | Derived per unit | Source | Basis |
|---|---|---|---|---|---|
| **Co-op City, Bronx NY** — full modernization, 2019–early 2025, contractor **Champion Elevator** | **$48.5m total** ($42.0m phase 1 + $6.5m phase 2) | **176** (160 residential + 16 garage) | `Estimated` **$275,568/unit** overall; **$262,500/unit** residential ($42m ÷ 160); **$406,250/unit** garage ($6.5m ÷ 16) | Habitat Magazine, August 2024 — https://www.habitatmag.com/Publication-Content/Bricks-Bucks/2024/August-2024/co-op-city-elevator-modernization | `Press-derived`; scope stated as replacing "all the aging elevator infrastructure, including 176 cabs, shafts and machinery" — i.e. **full mod, not controller-only** |
| **209 Joralemon St, NYC (DCAS)** — "new elevator cars and hoistway equipment, liftnet system, controllers, power units, sump pump" plus architectural/MEP | Bids: **$2,150,000** (Five Star Contracting) and **$3,548,000** (Action Elevator) | **not stated** | not derivable | NYC DCAS bid tabulation, EPIN 85623B0003, bid opening **30 April 2024** — https://www.nyc.gov/assets/dcas/downloads/pdf/business/bidtabs/dcas-bid-tab-epin-85623B0003.pdf | `Disclosed` (public bid tab). **Note the 65% spread between two bids on identical scope.** |
| **University of Kentucky, Slone Building elevator modernization** | Single bid **$356,500** against a **university estimate of $135,000** | not stated | not derivable | UK Purchasing bid tabulation, bid date **8 November 2022** — https://purchasing.uky.edu/sites/default/files/2022-11/cck-2666-23tab.pdf | `Disclosed`. **The bid came in at 2.6x the owner's estimate**, and only one bidder responded. |

**Two things a buyer should take from that table.** First, real full-modernization pricing on institutional equipment runs in the **mid-six figures per unit** (Co-op City at ~$262k–$406k/unit, over a five-year programme). Second — and this is the more valuable observation — **bid dispersion is enormous**: 65% between two bidders on the same NYC scope, and 164% between an owner's engineer estimate and the only bid received in Kentucky. In a trade with ~24,000 mechanics nationally, modernization pricing is capacity-constrained and locally idiosyncratic. **I do not have a controller-only-replacement price point from any primary source.**

### C.3 Is modernization annuity or lumpy — and what it does to earnings quality

The evidence says **lumpy, currently booming, and structurally separate from the maintenance annuity**:

- **Otis modernization order growth (`Disclosed`):** Q4 2025 orders **+43%**; FY2025 modernization backlog **+30%** at constant currency vs New Equipment backlog **+2%** (FY2025 results, 28 January 2026). Q3 2025: orders **+27%** — "our highest modernization orders since spin"; backlog **+22%**. Q2 2026: modernization **sales +24%**, backlog **+26%** cc, but **orders +9%** — i.e. the order growth rate decelerated sharply from +43% to +9% in two quarters while sales caught up to the backlog (Investing.com report of Otis Q2 2026 slides, 22 July 2026 — https://www.investing.com/news/company-news/otis-q2-2026-slides-service-surges-24-as-margins-compress-93CH-4806216). **That deceleration is the lumpiness, visible in real time at the largest player in the world.**
- **Otis Q2 2026 Service margin fell to 23.2%, down 170bp** from 24.9% in Q2 2025, in the same quarter modernization sales grew 24% (same source). Modernization is dilutive to service-segment margin at Otis. A target whose recent EBITDA growth is modernization-led is showing lower-quality, lower-margin, non-recurring earnings — and the largest company in the industry is demonstrating the mechanism in its own P&L.
- **Revenue mix at a real US independent platform (`Disclosed`):** Elevated Facility Services Group at acquisition — **Contractual Maintenance & Services 40% · Repair 30% · Modernization 30%**; ~20% adjusted EBITDA margin; ~$220m revenue; 600 employees; 18 states; branch-led; founded 2004 (APi Group investor presentation, 15 April 2024). APi's framing: "highly recurring revenue driven by non-discretionary demand", with "approximately **70% of revenues** from inspections, service and repair."

**That 40/30/30 split is the most important single disclosure in this file for deal underwriting.** At a real, sizeable, PE-owned US independent, **only 40% of revenue was contractual maintenance**. The 30% repair line is recurring-*ish* but demand-driven and not contracted; the 30% modernization line is project revenue. When a seller describes their business as "recurring", the question to ask is which of those three buckets they are counting, and Elevated is the benchmark for what an above-average independent's mix actually looks like.

**Modernization-eligible share of the US installed base: NOT SOURCED.** Otis's 7m/21m (≈33%) and the alternative 8m/22m (≈36%) are **global**. NEII's 900,000 US elevator count is ~2007 vintage. I found no age distribution of the US installed base from any source. Multiplying a global age share by a stale US unit count would produce exactly the kind of plausible-sounding fabrication this pass is supposed to avoid, so **I have not done it.**

---

## D. Valuation

### D.1 Public comparable — Otis, and why it is not your comp

**Otis Worldwide (NYSE: OTIS), EV/EBITDA — two vendors, both recorded, they conflict:**

| Vendor | EV/EBITDA | EV | EBITDA | As of |
|---|---|---|---|---|
| **GuruFocus** — https://www.gurufocus.com/term/enterprise-value-to-ebitda/OTIS | **14.20** | $36,179m | $2,547m TTM (ended June 2026) | **11 August 2026** |
| **stockanalysis.com** (data attributed to **S&P Global Market Intelligence**) — https://stockanalysis.com/stocks/otis/statistics/ | **14.71** | $36.20bn | $2.46bn TTM | **10 August 2026** |

Both `Press-derived` from vendor calculations. The enterprise values agree to within 0.1%; the discrepancy is entirely in the TTM EBITDA definition ($2,547m vs $2,460m). GuruFocus additionally reports OTIS market cap context: 10-year median EV/EBITDA **18.17**, 10-year range **9.59–22.62**, industry (Industrial Products) median **16.17**. stockanalysis.com reports market cap $28.17bn, EV/EBIT 15.81, P/E 19.01, last earnings 22 July 2026.

**Otis fundamentals behind that multiple (`Disclosed`, FY2025 results, 28 January 2026):** total net sales **$14.4bn** (+1%, flat organic); **Service net sales $9.442bn (+6%, +5% organic), Service operating profit $2.374bn, Service margin 25.1% (+50bp)**; New Equipment net sales $4.989bn (−7%), operating profit $240m, **margin 4.8% (−130bp)**; adjusted EPS $4.05.

**⚠️ EXPLICIT WARNING, as the brief requires: a global OEM multiple is NOT a lower-middle-market independent multiple and must not be used as one.** Otis at ~14.2–14.7x EV/EBITDA is: (i) a global business with ~2.5 million units under contract and roughly 500,000 of them in China; (ii) 66% Service revenue at a **25.1% segment margin** that an independent will not replicate; (iii) publicly listed with daily liquidity, an investment-grade balance sheet and no key-man risk; (iv) the original-equipment manufacturer, meaning it captures conversion of its own new-equipment installs into its own maintenance portfolio — a structural funnel no independent has. An independent LMM elevator service business shares the *word* "elevator" with Otis and almost nothing else about the risk profile. Applying 14x to a $3m-EBITDA independent would be an error of roughly a factor of two.

### D.2 Disclosed strategic transactions — with the arithmetic shown

**APi Group / Elevated Facility Services Group** (`Disclosed` inputs, `Estimated` multiple)
- Announced **15 April 2024**; completed June 2024. Consideration: **"$570 million cash consideration, subject to working capital and other standard adjustments."** Target: ~**$220m revenue**, **~20% adjusted EBITDA margin**, 600 employees, 18 states, Tampa FL, founded 2004, branch-led. Mix 40% contractual maintenance / 30% repair / 30% modernization. Seller: L Squared Capital Partners.
- Source: APi Group investor presentation, 15 April 2024 — https://s201.q4cdn.com/155847588/files/doc_presentations/2024/Apr/15/apg-investor-presentation_vfinal.pdf; also https://ir.apigroupcorp.com/News/press-releases/news-details/2024/APi-Group-Enters-New-Adjacent-Service-Market-with-Acquisition-of-Elevated-Facility-Services-Group/default.aspx
- **APi did not state a multiple.** `Estimated`: $220m × 20% = **$44m adj. EBITDA**; $570m ÷ $44m = **~12.95x**. Both inputs are approximations ("approximately $220 million", "approximately 20%"), so the derived multiple is approximate — a ±5% swing in either input moves it to roughly 11.7x–14.4x.
- **This is the single most relevant comparable in this file for a US elevator service platform** — a US-only, independent, branch-model, service-weighted business at ~$44m EBITDA. It is a **platform-scale strategic print**, not an LMM tuck-in comp.

**KONE / TK Elevator** (`Disclosed` inputs, `Estimated` multiple)
- Announced **29 April 2026**. **Enterprise value EUR 29.4 billion**, "including interest-bearing net debt". TKE sales **EUR 9,230 million** and **adjusted EBITDA EUR 1,617 million (17.5% margin)** for the period **10/2024–9/2025**. TKE has "more than **1.4 million** elevator and escalator units under maintenance"; combined group ~**3.2 million units** and ~EUR 20.5bn sales with roughly **65% from service and modernization**. Synergies ~**EUR 700m** annual run-rate pre-tax, full P&L effect by end of year three. Consideration includes EUR 5bn cash plus up to 270m KONE class B shares. Expected closing **earliest Q2 2027**, subject to regulatory approval.
- Sources: KONE inside information release, 29 April 2026 — https://www.kone.com/global/en/newsroom/releases/2026/inside-information--kone-and-tke-to-combine--creating-a-world-class-company-in-the-elevator-and-escalator-industry-2026-04-29.html ; TKE release — https://www.tkelevator.com/global-en/newsroom/press-releases/kone-and-tke-to-combine-creating-a-world-class-company-in-the-elevator-and-escalator-industry-197696.html
- **Neither release states an EV/EBITDA multiple.** `Estimated`: EUR 29,400m ÷ EUR 1,617m = **~18.2x pre-synergy**. Post full run-rate synergies: 29,400 ÷ (1,617 + 700) = **~12.7x**.
- **Conflicting figure recorded:** the TKE release as rendered to me also referenced "EUR 2.7 billion adjusted EBIT" as a *combined group* figure, which if divided into the EV gives ~10.9x. That is not TKE-standalone EBITDA and should not be used. **The EUR 1,617m adjusted EBITDA on EUR 9,230m sales (17.5%) is the standalone TKE figure from KONE's own release and is the correct denominator.** Both are recorded here per the keep-both rule.
- **This is a global OEM take-private at ~18x. It is even less applicable to an LMM independent than Otis's trading multiple.**

### D.3 Published LMM elevator multiples — one source, heavily caveated

**Publisher: CT Acquisitions.** ⚠️ **Interest disclosed inline, as the brief requires: CT Acquisitions is an M&A advisory firm that sells transaction services into the elevator sector — its own page describes a "buyer-paid model, no upfront fees to sellers", and these multiple pages function as seller-acquisition content.** A firm that earns fees on elevator transactions publishing elevator transaction multiples is an interested party, and multiples published by such a firm run in one direction. Source: https://ctacquisitions.com/guides/elevator-ma-multiples-2026/ (page states "last verified July 2026").

Recorded verbatim, as **claims**, not as findings:

| Segment | Published range |
|---|---|
| Under $1m revenue | "2.0x to 3.5x SDE" |
| $1m–$3m revenue | "3.0x to 5.0x SDE (roughly 4x to 6x adj. EBITDA after normalization)" |
| $3m–$10m revenue | "5.0x to 7.0x maintenance-weighted; 4.0x to 6.0x install-heavy" |
| $10m–$25m revenue | "6.0x to 9.0x" |
| $25m+ platform | "9.0x to 11.0x, with disclosed strategic prints to ~13x" |
| Modernization specialists | "4.5x to 6.5x (adj. EBITDA), $3M to $25M revenue" |
| New-construction installation | "4.0x to 6.0x (adj. EBITDA)" |
| Accessibility/residential lifts | "2.5x to 4.0x SDE under $1M earnings; ~4x to 6x adj. EBITDA for multi-branch dealers" |
| PE-backed platforms | "9x to 13x (adj. EBITDA)" |
| OEM/mega-cap ceiling | "~16x to ~18x disclosed" |

**Underlying sources the firm cites, and my assessment of each:**
- **GF Data** Q3 2025: "$10M to $25M TEV average of 5.9x" and "$25M to $50M TEV average of 7.4x" — GF Data is a genuine, methodologically serious private-company transaction database, **but these are all-industry TEV-band averages, not elevator-specific**. They are being used as a proxy and dressed as elevator data.
- **BizBuySell** 2025: "service-sector average of 2.52x SDE" — again all-services, not elevator, and BizBuySell is listing-price data on micro businesses.
- **IBBA Market Pulse** Q1 2026 broker survey (300 advisors) — sentiment survey, not transaction data.
- **Disclosed transactions**: APi/Elevated at "~12.9x" (June 2024) and KONE/TKE at "~18.4x" (29 April 2026). **I independently derived ~12.95x and ~18.2x from the primary filings above.** These two check out. That is meaningful — it says the firm did the same arithmetic I did on the public prints.
- **DealStats, BizComps** subscription databases — not verifiable without a subscription.
- A separate CT Acquisitions page adds: "The median independent elevator deal referenced in our sale-process guide has run near **7.5x EBITDA, about 1.3x revenue**" for the $10m–$25m band — **no source at all**, purely proprietary assertion.

**How to use this:** the *shape* is credible and consistent with what the primary transactions show (micro businesses on SDE; a step-up through the $10m–$25m band; platform-scale independents in the low double digits, corroborated by APi/Elevated at ~12.95x; OEMs at ~14x trading and ~18x for control, corroborated by Otis and KONE/TKE). The *specific elevator-band numbers below platform scale rest on all-industry proxy data plus the firm's own unpublished deal book*, and should be treated as an interested party's indication rather than as evidence. **There is no elevator-specific LMM multiple in this file that I can stand behind as sourced.**

### D.4 Other margin evidence relevant to valuation

- Otis FY2025 (`Disclosed`): Service margin **25.1%** vs New Equipment margin **4.8%** — a **20.3 point** spread. This is the clearest published statement of why the service book, not the install book, is what is being bought.
- Otis Q2 2026 (`Disclosed`): Service margin **23.2%**, down 170bp, with modernization sales +24% — service margin is not monotonic and dilutes when modernization mix rises.
- Elevated at acquisition (`Disclosed`): **~20% adjusted EBITDA margin** on a 40/30/30 maintenance/repair/mod mix — the best available anchor for what a strong US independent platform earns.
- CT Acquisitions claims (`Unsourced`, interested party) modernization gross margins of "28% to 35% versus 15% to 22% for new installation" — recorded, not endorsed.

---

## What we don't know yet

Long by design. Each item below is a slot I left empty rather than fill with a plausible number.

**Labor**
1. **The current BLS OEWS vintage for 47-4021.** BLS retired the static per-occupation profile pages for May 2024 and May 2025; all three candidate URLs redirect to the OEWS home page, and the OEWS national XLSX download was blocked by this session's egress policy. **The primary OEWS data in this file is May 2023.** May 2024 median/employment come from BLS OOH; May 2024 percentiles come from a secondary aggregator and are unverified. **Re-run: pull `oesm25nat.zip` from bls.gov/oes/tables.htm or the One Screen tool at data.bls.gov/oes/.**
2. **The IUEC LM-2 itself.** OLMS (`olmsapps.dol.gov`, `olms.dol-esa.gov`) was unreachable — robots.txt handling blocked the fetch tool and the egress proxy refused direct HTTPS to dol.gov hosts. **File number 000-197, FYE 30 June** is confirmed as the national body's filing. Membership figures here are LM-2 *republications* (Center for Union Facts, an anti-union advocacy organisation) and self-reports. **Re-run: open OLMS file 000-197 directly for Item 20 and the FY2024/FY2025 receipts.**
3. **Union density as a percentage of the occupation.** Not sourced. IUEC membership (30,000–31,290, US **and Canada**, including apprentices and helpers) exceeds BLS US employment in 47-4021 (23,990–24,200), so the two cannot be divided. No CPS-based detailed-occupation density figure (unionstats.com returned an empty frameset) was obtained. **The "heavily unionized" claim in this file rests on structure — all seven major OEMs are NEBA signatories to a national agreement — not on a density number.**
4. **What a union mechanic's actual national base wage is.** The 2022–27 NEBA agreement line reads "$37.485 … $0.85 … $38.335", which is ambiguous as rendered and sits far below the BLS median hourly of $51.24. I have not resolved whether $37.485 is a national base on which local zone differentials are layered. **Re-run: read Article V of the NEBA agreement in full, plus a sample of local agreements.**
5. **A current Davis-Bacon determination for elevator constructors.** SAM.gov (WD NY20260020) returned page metadata only. The California DIR determination in this file is **2023-1 vintage and Southern California only**.
6. **NEIEP completions per year, and current apprentice headcount.** Not published anywhere I could find. This is the number that bounds industry capacity growth and I do not have it. **Re-run: DOL apprenticeship.gov / RAPIDS data by occupation, and NEIEP's Form 5500 or annual report.**
7. **The age profile of the mechanic population.** No median age, no retirement-eligibility count, no pension active-to-retiree ratio. The 94% replacement-demand figure is derived from BLS *projections*, not from an observed age distribution. **Re-run: the Elevator Constructors' pension and annuity fund Form 5500 filings carry active vs retired participant counts.**
8. **Whether independents can hire union mechanics on the same terms as OEMs.** The ECA (Elevator Contractors of America) signs the same national agreement, but I did not establish whether wage rates, benefit contributions or apprentice allocation differ for independents. This directly affects whether an LMM target has a labour cost advantage or disadvantage vs Otis.
9. **Non-union share of the trade.** Some independents are open-shop. I found no estimate of the non-union share of US elevator service revenue or headcount.

**Contract economics**
10. **Margin profile of full-maintenance vs oil-and-grease/parts-and-labour contracts.** Completely unsourced. The definitional distinction is well established (Washington Elevator); the margin differential is not published anywhere I could find. **This is a first-order underwriting input and it is empty.**
11. **OEM standard-form maintenance terms and conditions.** Not obtained. The Law Insider posting of a US Communities elevator maintenance agreement carried metadata only. The contract-term evidence in this file is one small municipal contract (3-year auto-renewing, 30-day notice, 5% escalation cap) plus practitioner description (3–5 years, 90–120 day windows, right of first refusal, evergreen clauses).
12. **Any US statute or court decision specifically governing elevator maintenance contract terms.** I looked and did not find one. The 2004 SDNY antitrust complaint alleges bid-rigging on maintenance pricing but — I checked the document specifically — contains **no** allegations about contract length, auto-renewal, cancellation, liquidated damages, tying, proprietary tools or third-party lockout. The €992m EU cartel decision is EU, 2007, and about pricing conduct, not contract terms.
13. **Liquidated damages / early-termination penalty quantum.** No dollar or formula from any primary contract.
14. **Proprietary tools, diagnostic software and parts lockout** — the mechanism most often cited as the real barrier to switching servicers on OEM equipment. **I found no primary evidence of it in this pass and have therefore made no claim about it.** This is arguably the most important unexplored question in the whole contract-economics section, because it determines whether an independent's route book is actually contestable.
15. **Retention/attrition for US LMM independents.** The 92.4%–94% range is Otis, global. The "top-quartile 95%+, median 88%" figures are an unsourced assertion by an M&A advisory firm.
16. **Escalator maintenance economics separately from elevators.** Escalators are ~35,000 US units (NEII, ~2007) against ~900,000 elevators, carry a 50-year EUL in HUD's table, and almost certainly have different per-unit pricing and mechanic-hour intensity. Nothing in this file separates them.

**Route density**
17. **Units per mechanic — the actual route metric.** Empty. The ~37 units/mechanic national ratio derived here is an upper bound built on a ~2007 unit count and an all-purpose mechanic denominator. The circulating "65 to 90 units per technician per day" figure is internally implausible, unverifiable against NAEC, and published by an interested party.
18. **Revenue per mechanic.** Not sourced. Elevated's ~$367k revenue per *employee* is the closest available and includes non-mechanics.
19. **Maintenance-only revenue per unit per year at scale.** Otis does not disclose the dollar split between maintenance/repair and modernization within its Service segment — only growth rates. The $3,854/unit/yr derived here is a ceiling that includes modernization and China.
20. **Callback frequency per unit per year** and its cost — the variable that determines whether a full-maintenance contract makes or loses money. Nothing found.

**Modernization**
21. **Controller-only replacement price.** No primary data point. The three sourced projects are full modernizations or unstated-unit lump sums.
22. **US installed base age distribution and modernization-eligible share.** Otis's ~33–36% >20 years is **global**. NEII's 900,000 US elevators is ~2007 vintage. I refused to multiply the two.
23. **A current US elevator unit count.** NEII's fact sheet self-describes as majority-2007 data. There is no current authoritative US installed-base count in this file.
24. **Modernization backlog conversion timing and cancellation rates** for independents — the thing that makes modernization-heavy earnings unreliable.

**Valuation**
25. **Any elevator-specific LMM multiple that is not published by an interested advisory firm.** None found. The two multiples I can stand behind (~12.95x APi/Elevated, ~18.2x KONE/TKE) are both derived by me from primary filings and both are **platform/OEM scale**, not LMM.
26. **Working capital and capex intensity** for elevator service businesses — not addressed in this pass at all.
27. **What the PE consolidators have actually paid.** The Elevator World article on private equity consolidation of the North American elevator service industry since 2018 (https://elevatorworld.com/article/private-equity-consolidation-of-the-north-american-elevator-service-industry-since-2018/) returned **HTTP 403** and could not be read. It is the most likely single source for named platforms, tuck-in activity and unit counts. **Re-run: obtain via Elevator World subscription.**
28. **Number of independent elevator contractors in the US** and the OEM-vs-independent share of the ~900,000-unit installed base. NAEC publishes no member count I could locate. This is the market-structure denominator for any roll-up thesis and it is missing.
