<!-- run: 09 | hunt: B | date: 2026-08-11
     query: direct primary-source URL fetches — platform websites, sponsor portfolio pages,
     PR Newswire / BusinessWire "About" boilerplates, NAICS 238290, BizBuySell Insight Report,
     GF Data, DealStats/BVR, IBBA Market Pulse, Pepperdine PCM, NEII/NAEC/NEIEP/IUEC,
     Colorado DOPS MCP guidance, Elevator World MCP article, WA Elevator contract-tier page
     tool: web search + fetch -->

# Gap sweep — consolidator register fields, LMM multiples, contract-tier margins, units per mechanic

**Method constraint, stated up front because it shaped what was reachable.** The session's WebSearch
budget was exhausted (200/200) before this pass began, and every general search engine I tried —
DuckDuckGo, Mojeek, Ecosia, Yahoo — is robots-disallowed to the fetch tool in this environment. So
this pass ran entirely on **direct URL fetches of known primary domains**: company websites, sponsor
portfolio pages, wire-service releases, regulator PDFs and trade-association sites. That method is
strictly better than search for Slot 1 (the sources are the companies themselves) and materially
worse for Slots 2–4, where the target document is one whose URL you must first discover. Where a
slot is short, that constraint is part of the reason, and I say so rather than dressing up the gap.

**Law 1 held throughout.** Where I guessed a candidate domain, the fetch is the verification — the
domain is recorded only if the fetched page identifies the right company against an independently
known fact (HQ city, sponsor, state list, brand). Two candidate domains resolved to **GoDaddy
for-sale parking pages** and are recorded as empty, not as domains. Nothing here is invented.

---

## SLOT 1 — Consolidator register empty fields → **PARTIALLY FILLED**

### 1.1 Domains closed (10)

Every one verified by fetching the domain itself and matching the returned page against a fact the
register already held. Where a sponsor or wire release independently gave the URL, that is noted as
a second, higher-priority confirmation.

| Platform | Domain | How verified | Basis |
|---|---|---|---|
| Action Elevator | **actionelevator.com** | Own site returns "Action Elevator Company," HQ Millersville MD, MD/VA/DE/DC — matches register exactly. **Second confirmation:** H.I.G. Capital's own release names the URL. | `Disclosed` |
| Elevator Service, Inc. (ESI) | **esigr.com** | **Carroll Capital's own portfolio page** links it and states "Grand Rapids, MI." Fetched site returns Elevator Service Inc, Grand Rapids, "Since 1987." | `Disclosed` |
| Total Access Elevator | **totalaccesselevator.com** | Own site returns "Total Access Elevator Corporation," Santa Fe Springs CA (13011 Florence Ave) — matches register HQ. | `Disclosed` |
| Integrity Elevator Solutions | **integrityelevators.com** | **Given in the Del Monte Capital PR Newswire release.** Fetched site confirms IES, TX + LA. | `Disclosed` |
| Ascend Safety Collective | **ascendsafetycollective.com** | **Given in the BusinessWire launch release** ("www.ascendsafetycollective.com"). Site live and consistent. | `Disclosed` |
| ATIS | **atis.com** | **Given inside ATIS's own boilerplate:** "ATIS (www.atis.com) is one of North America's largest providers of vertical transportation inspections…" | `Disclosed` |
| Kings III | **kingsiii.com** | Own site; confirms LiftNet as "a Kings III company," matching the register's LiftNet entry. | `Disclosed` |
| Start Elevator | **startelevator.com** | Own site: "a leading elevator company in NYC" — matches register's Bronx/NY entry. | `Disclosed` |
| Cibes Lift Group | **cibeslift.com** | Own site: Cibes Lift Group, Sweden, 70+ countries — matches register. | `Disclosed` |
| Urban Elevator Service | **urbanelevator.com** | Own site: "Urban Elevator Service, LLC," IL and IN — matches the register's *retained* states post-Otis. | `Disclosed` |

### 1.2 Domains still empty (2), and why

- **Standard Elevator Systems** — `standardelevator.com` **302-redirects to a GoDaddy for-sale
  parking page**. It is not the company's site. **Left empty.** An Arcline components platform of
  this size may well operate under a different domain or under its operating brands; I did not find
  it and did not guess.
- **Elevator Systems, Inc.** (ShoreView, Garden City NY) — `elevatorsystemsinc.com` returned a
  robots.txt connect-timeout on repeated attempts. Domain existence is therefore **unconfirmed
  either way**. **Left empty.**
- Also recorded as empty rather than guessed: `integrityelevator.com` (GoDaddy parking page — the
  real one is `integrityelevators.com`, plural), and `elevatorserviceinc.com` (**does not resolve —
  NXDOMAIN**). `esielevator.com` resolves but returns 403, so its ownership could not be verified;
  it is **not** recorded as ESI's domain.

### 1.3 Other fields closed this pass

**Acquired trading names — the highest-value field, and the biggest gain.**

- **Specialized Elevator** — the company's own About page names **six brands the earlier pass
  missed**: San Francisco Elevator · Mile High Elevator · Koch Elevator · Gable Elevator ·
  Willamette Elevator · TEC (Atlantic City/Philadelphia). It also **widens the state list** to add
  VA, ME, NH, CT, RI, NJ, DE beyond the twelve previously named.
- **American Elevator Group** — its own story page names **four brands the earlier pass missed**:
  Unitec (described as the first company) · D&D Elevator (NY) · Jersey Elevator (NJ) · Kencor
  Elevator (PA). Also: founded 2020 by **Mark Boelhouwer** with Arcline investment; 12 partner
  companies and 30,000 elevators re-confirmed.
- **Standard Elevator Systems** — the Arcline release **names all five founding suppliers**, which
  the earlier pass recorded as "the other four are not named": **Standard Elevator Systems, LLC**
  (Memphis TN) · **EMI Porta, LLC** (Arlington Heights IL) · **ZZIPCO, LLC** (Franklin Lakes NJ) ·
  **Texacone, LLC** (Mesquite TX) · **Elevator Equipment Company, LLC / EECO** (Los Angeles CA, plus
  Richmond IN plant). Release dated **2022-01-26**. **Conflict retained:** the earlier pass recorded
  *McIntosh Industries, Inc. (NJ)* as an acquired name; McIntosh is **not** among the five in this
  release, and the release's NJ entity is ZZIPCO. Both are kept. It is possible McIntosh is a later
  add-on or a related entity; **I did not verify that and am not asserting it.**
- **ESI** — the July 2026 release adds **ESI Indiana · Tristar Elevator · "A1 Pinnacle"** (the
  unified entity from the A-1 / Pinnacle merger) to the brand list.
- **Action Elevator** — H.I.G.'s release states **Century Elevator was acquired concurrent with the
  H.I.G. transaction**, dating it to **2024-09-03**.

**HQ cities closed (4):** Integrity Elevator Solutions → **Houston, TX** (register had state only) ·
Minnesota Elevator Inc. → **Mankato, MN** · Standard Elevator Systems → **Memphis, TN** · TEI Group
→ refined from "New York, NY" to **Long Island City, NY** (30-30 47th Ave, Suite 610).

**Location/branch counts closed (3):** Action Elevator → **3 offices** (Baltimore, Ocean City,
Lanham MD) · ESI → **6 Michigan offices** (Grand Rapids, East Lansing, Ann Arbor, Traverse City,
Kalamazoo, Saginaw — note this is the **Michigan operating company only**, not the 14-state group) ·
MEI → **16 service locations across 8 states**.

**States closed:** MEI → **MN, WI, MI, CO, KS, MO, ND, SD** (register had only "Kansas City,
Detroit").

**Dates closed:** MEI/Smart Elevator Tech → **2026-02-10** (register had year only). Axxiom's add-on
history is now dated from the company's own news index: **AmeriTex 2025-09-15 · Liftech 2025-03-19 ·
Quality Elevator 2025-03-19 · Evolution Elevator & Escalator 2025-04-17 · Arizona Elevator Services
2024-02-21 · IronHawk 2024-02-21.**

**Other counts:** ATIS → **200+ licensed QEI professionals, 15,000+ clients, ~100,000 elevators and
escalators** (company boilerplate, re-confirmed) · Action Elevator → **~500 customers** · Kings III →
**150,000+ phones monitored, 98% customer retention, 35+ years** · Axxiom legal name → **Axxiom
Elevator, LLC**.

**Conflicts retained (Law 4), both live:**
- **Elevated Facility Services** — its current site says **21 states across 57 markets**; the APi
  2024 acquisition materials said **22 states / 30+ markets**, and Elevator World said 18+ states.
  All three kept, dated. The *markets* figure nearly doubling while the *states* figure falls by one
  is itself informative about how the company counts.
- **Urban Elevator Service HQ** — the register says **Cicero, IL**; the company's current site gives
  **Lombard, IL (54 Eisenhower Ln N)**. Both kept. Most likely a relocation after the 8-location
  Otis sale, but I did not verify that and am not asserting it.

### 1.4 Unit counts — **STILL EMPTY**

This is the honest failure inside Slot 1. The brief flagged **7 unpublished unit counts**; I closed
**none of them**. After fetching the About/company pages of Axxiom, Champion, Total Access, ESI,
Integrity, Ascend, TEI, Delaware, MEI, Start and Elevated, **not one publishes a maintenance-portfolio
unit count.** The register still has published unit counts for only four entries, and two of those
are not maintenance portfolios (ATIS ~100,000 is an *inspection* book; Kings III 150,000+ is *phones*,
not units). Usable maintenance-portfolio counts remain **AEG 30,000** and **Specialized ~25,000**,
plus Elevated's stale **11,000+** from the Incline hold.

**This is a structural fact about the sector, not a research failure to fix by trying harder.**
Independent elevator service companies do not publish unit counts, because the unit count *is* the
asset and publishing it invites both OEM poaching and competitor bidding. Expect to obtain it only
under NDA in a process. Underwriting models should be built to take unit count as a diligence input,
not a screening input.

---

## SLOT 2 — Disinterested elevator-specific LMM multiple → **STILL EMPTY**

**No disinterested, elevator-specific, lower-middle-market valuation multiple exists in the public
record.** I checked every source the brief named and can now say *why* it does not exist, which is
more useful than another interested-party band.

### 2.1 What each named source actually is, with its interest disclosed

| Source | What it publishes | Interest | Elevator-specific? |
|---|---|---|---|
| **GF Data** (gfdata.com) | LMM M&A multiples, **$10–500M EV**, 30+ data points/deal, **330 contributor firms**, organized **by NAICS** | Owned by **ACG**, a deal-professional membership body; contributor firms are PE sponsors and advisors submitting their own deals — a **self-selected sample of completed sponsor deals**, which skews toward financeable, above-median assets | **No.** Paywalled; no elevator cut published |
| **DealStats / BVR** (bvresources.com) | Private + public acquisitions, SDE / EBITDA / revenue multiples, 200+ data points, NAICS/SIC coded | Paid data vendor; **$1,499/yr** entry tier. Sells to valuation practitioners — no stake in elevator deal flow, so **disinterested as to sector** | **No elevator cut published free** |
| **BizBuySell Insight Report** | ~50,000 listed/sold businesses, **70+ markets, 65 industries**, broker-reported **voluntarily** | Owned by **CoStar Group**; a listings marketplace. Interest is in transaction volume generally, **not in elevator advisory** — genuinely disinterested as to this sector | **No.** Sector split is Service / Retail / Manufacturing / Restaurant only |
| **IBBA + M&A Source Market Pulse** | Quarterly survey, businesses **under $50M**, produced with the Pepperdine PCM Project | Published by **two broker/intermediary associations** — their members sell sell-side advisory. Interested at the category level, though not elevator-specific | **No.** Construction & engineering appears as a sector; elevator does not |
| **Pepperdine Private Capital Markets Project** | Cost of private capital, owner expectations | University-run — **the most disinterested publisher on the list** | Report page returned 404 on the URLs I could reach; **no elevator cut located** |
| **CT Acquisitions** (already in the file) | Elevator LMM bands, retention, route density | **Sells elevator sell-side advisory.** Figures appear on a page built to attract sellers, several attributed to unverifiable sources | Yes — but **interested** |

### 2.2 The structural reason it does not exist, and it is not a soft one

Elevator installation and service sit in **NAICS 238290, "Other Building Equipment Contractors."**
I pulled the code's illustrative examples. "Elevator installation" and "escalator installation" are
both there — alongside **vending machines, ATMs, bowling alley equipment, church bells and tower
clocks, garage doors, vaults and safes, vehicle lifts, pneumatic tube systems, satellite dishes and
gasoline pumps.**

That matters concretely. **Every NAICS-coded database on the list — GF Data and DealStats included —
can only ever produce a 238290 multiple, and a 238290 multiple is not an elevator multiple.** It is
a blended multiple across a grab-bag of unrelated installation trades with entirely different
recurring-revenue characteristics. A buyer citing a 238290 comp for an elevator service book is
citing the wrong thing with a real code attached to it, which is more dangerous than citing nothing.
There is no NAICS or SIC code that isolates elevator service, so **no code-driven database can
isolate it either.**

### 2.3 The one genuinely disinterested LMM figure I can offer, with its limits stated

**BizBuySell Insight Report, Q2 2026** — average **cash-flow (SDE) multiple 2.7x**, up 2% YoY;
average revenue multiple **0.7x**, flat. N ≈ 50,000 listed/sold businesses across 65 industries;
methodology is **voluntary broker reporting of closed transactions**, which is a real selection
limitation the publisher itself discloses. Publisher CoStar has no elevator-sector interest.

**Do not use this as an elevator comp.** It is (a) an **SDE** multiple, not EBITDA, so it sits on a
different earnings base entirely; (b) main-street scale, well below PE-platform size; (c) all-sector.
It is recorded as the disinterested *floor context* for what small US service businesses trade at —
useful only to show how far above it the elevator platform bids sit, and therefore how much of the
elevator premium is recurring-contract and route-density driven rather than general small-business
pricing.

### 2.4 Who would have to publish it for one to exist

Stated plainly, because the brief asked:

1. **GF Data / ACG** could produce it — they hold NAICS-coded LMM deal data from 330 contributors and
   could run a 238290 cut. But per §2.2 that cut would still be contaminated by vending machines and
   garage doors. To be an *elevator* multiple, GF Data would have to add a **sub-NAICS sector tag**,
   which they do not currently offer.
2. **NAEC — the National Association of Elevator Contractors** — is the body that *should* publish it
   and is the only one positioned to do it cleanly, since its membership **is** the independent
   contractor population. **I fetched naec.org and it publishes no statistical benchmarks at all** —
   no multiples, no route density, no membership economics. Its published output is training,
   education and events.
3. **A public strategic acquirer** disclosing an LMM tuck-in price alongside its EBITDA. APi did this
   at platform scale (Elevated, ~12.95x) but no acquirer discloses purchase price on individual
   sub-$5M-EBITDA add-ons — and Axxiom, Specialized, AEG and ESI have collectively done **dozens**
   of exactly those deals without a single disclosed price.

Until one of those three changes, **the elevator LMM multiple is a private number held by about a
dozen sponsors and their advisors, and every public figure is an interested party's estimate.** That
is the finding. Treat any elevator LMM multiple presented to you as a negotiating position, and ask
who profits from the number being where it is.

---

## SLOT 3 — Full-maintenance vs oil-and-grease margin split → **PARTIALLY FILLED**

The tier **definitions**, the **code floor beneath them**, and the **risk transfer that separates
them** are now sourced and quantifiable. **Published margin percentages by tier remain unfound** —
and I now think they are unfindable for the same reason unit counts are.

### 3.1 The three tiers, defined (source's interest disclosed)

**Washington Elevator** — an independent elevator service company; **interest disclosed: it sells
these contracts.** https://waelevator.com/blog/maintenance-agreements-part-1 (`Press-derived`)

- **Full-service:** "These include both maintenance and 'insurance' as described below. Service
  callbacks (trouble calls), repairs, parts, and testing are typically included." — "The monthly
  price is higher, but everything should be covered."
- **Maintenance:** "the elevator company will provide you with a Maintenance Control Program (MCP),
  which is required by code"; testing included at no charge varies by company.
- **Oil and Grease:** "**Oil and Grease (Lube & Examination) agreements generally provide less
  maintenance.**" — "Any parts, repairs or service callbacks are billed separately. Testing is
  sometimes included, but not always. The monthly cost is lower."

**Useful terminology capture: "Lube & Examination" is the formal name.** Procurement documents will
say "Lube & Examination," "Examination and Lubrication" or "Preventive Maintenance Only" rather than
the shop-floor phrase "oil and grease." That is the search string for any later pass.

### 3.2 The finding that reframes the tier question — there is a code floor under every tier

ASME A17.1 §8.6 mandates a **written Maintenance Control Program for every unit, regardless of
contract tier.** From Colorado DOPS's *Conveyance Maintenance Control Program Guidance* (`Disclosed`,
state regulator — https://ops.colorado.gov/sites/ops/files/2019-12/mcpguidance0417.pdf), an MCP must
contain **"Required maintenance tasks, such as cleaning, lubricating and adjusting the equipment"**
and **"Specified scheduled maintenance intervals."** Illinois OSFM circulates the mandatory language:
**"A written Maintenance Control Program shall [be] in place."** The requirement entered A17.1 with
the **2000 edition** (Koshak, *Elevator World*), and per Koshak it "changed the way maintenance was
required and verified by inspectors."

Colorado's guidance **draws no distinction between full-maintenance and limited-scope contracts** —
the MCP obligation is identical either way, and responsibility is dual: MCP documentation is
"Provided by the contractor responsible for maintenance… or by the conveyance owner and owned by the
owner," and must **remain on site when contractors change.**

**Therefore the tiers do not differ in the maintenance *tasks* performed.** Since 2000, they cannot —
the task list and the intervals are code-mandated at every tier. **The tiers differ in who absorbs
parts and callbacks.** Full maintenance is the same labor with an **embedded insurance wrapper**;
oil-and-grease is the same labor with that wrapper stripped out and billed T&M. Washington Elevator's
own wording concedes exactly this: full-service "include[s] both maintenance **and 'insurance.'**"

That is the correct frame for underwriting, and it inverts the naive read. The margin question is not
"does the contractor do less work on a cheap contract" — **it is "how well can the contractor price
an insurance book it has written on equipment of unknown age."**

### 3.3 Sizing the risk transfer — the arithmetic the margin split actually turns on

The missing input was callback frequency. File 05 recorded it as "Nothing found." **Found:**

> "Ron Schloss has suggested that an achievable number of callbacks for reliably maintained equipment
> is **two callbacks per year for escalators, three per year for hydraulic elevators and four
> callbacks per year for traction elevators**."
> — John W. Koshak, "Maintenance Control Program Changes," *Elevator World*,
> https://elevatorworld.com/article/maintenance-control-program-changes/ (`Press-derived`; an
> attributed practitioner suggestion of an *achievable* rate, i.e. a **best-case** figure, not a
> survey mean — a poorly-maintained book runs higher)

Combined with the loaded mechanic cost already verified in file 05 — **California DIR prevailing wage
determination SC-62-X-999-2023-1: total hourly rate $108.095/hr for an Elevator Constructor
mechanic** (`Disclosed`) — and the **IUEC/NEBA overtime rule that steps straight to 2x** outside the
regular working day with no time-and-a-half tier:

`Estimated`, arithmetic shown, **per traction unit per year**, callback labor only, parts excluded:

| Callback duration assumption | Straight time (4 × hrs × $108.095) | At 2x overtime |
|---|---|---|
| 1 hr on site | $432 | $865 |
| 2 hrs on site | **$865** | **$1,730** |
| 4 hrs on site | $1,730 | $3,459 |

**The callback duration is my assumption, not a sourced figure — it is shown as a sensitivity for
that reason.** The 4 callbacks/yr, the $108.095/hr and the 2x rule are all sourced.

Now set that against the **sourced contract revenue** already in file 05:

- **$1,611 per unit per year** — Bay St Louis MS / A-1 Elevator, quarterly visits, **parts-excluded**,
  callbacks **7am–4pm weekdays only** (`Disclosed`, executed municipal contract)
- **$1,692 – $16,173 per unit per year** — Wisconsin/UW 19-5971, weekly to monthly visits
  (`Disclosed`, awarded public pricing)

**The result is stark and it explains the entire tier structure.** At the low end of the market
(~$1,611/unit/yr), absorbing four traction callbacks a year at a 2-hour straight-time assumption
consumes **~54% of total contract revenue**; at overtime rates it consumes **~107% — the contract
loses money on callbacks alone, before a single part.**

**This is why the cheap contracts are parts-and-callback-excluded.** It is not a commercial
preference; it is arithmetic. And it explains a specific clause that otherwise looks like sloppy
drafting: Bay St Louis's **"7am–4pm weekdays only"** callback window is the contractor engineering
its way out of the **2x overtime tier**, which is the single input that turns that contract negative.
A buyer reading a target's contract book should treat **after-hours callback coverage bundled into a
low fixed monthly** as the highest-risk clause in the file.

### 3.4 What is still empty here

**No published gross-margin percentage by contract tier was found**, and I now expect none exists.
The same logic as unit counts applies: tier margin mix is the core competitive secret of an
independent service book. What this pass delivers instead is the **mechanism and the arithmetic** to
compute it from a target's own data in diligence — mix of full-maintenance vs L&E units, age and
type of equipment (traction vs hydraulic drives the 4-vs-3 callback rate), the after-hours coverage
clause, and the loaded mechanic rate. Those four inputs give you the answer for a specific target,
which is what actually matters.

**Procurement seam, worked and only partly productive.** I re-read the Wisconsin/UW 19-5971 pricing
schedule specifically hunting tiered scope. It **prices ~400+ units unit-by-unit with an explicit
service-interval column (W / S-M / M)** but carries **no scope-of-coverage definitions at all** — it
is a pricing schedule detached from its specification. The document that would settle Slot 3 is a
**single RFP pricing both a full-maintenance and an L&E option for the same units**, which is exactly
the kind of document that is findable by search and largely unfindable by URL guessing. **That is the
one concrete thing a follow-up pass with search budget should go get.**

---

## SLOT 4 — Units per mechanic → **PARTIALLY FILLED**, with a directional correction

### 4.1 The circulating figure — origin confirmed, and now doubly falsified

The "**65 to 90 units per technician per day**" figure originates with **CT Acquisitions**
(https://ctacquisitions.com/guides/elevator-business-valuation/), **an M&A advisory firm that sells
elevator sell-side services**, on a page whose purpose is to attract sellers. It is attributed there
to "NAEC data."

**That attribution does not hold.** I fetched **naec.org** directly this pass. The National
Association of Elevator Contractors **publishes no statistical benchmarks whatsoever** — no route
density, no productivity metrics, no membership economics. Its published output is training,
continuing education, membership and events. This is now the **second independent check** to fail to
locate the cited source.

**Do not repeat the figure.** Beyond being unattributable, it is internally impossible as written:
no mechanic performs preventive maintenance on 65–90 units in a day. Against the sourced contract
intervals below, 65–90 units is plausibly a **route** (a monthly-interval book), which suggests the
"per day" is a garble of "per route." **But that is my inference and I am not asserting it as the
figure's meaning.**

### 4.2 The national ratio — now corroborated across three independent denominators

The earlier pass had one derivation. This pass adds two union-published denominators:

| Numerator | Denominator | Source of denominator | Ratio |
|---|---|---|---|
| 935,000 (900,000 US elevators + 35,000 US escalators, NEII) | ~24,200 US elevator installers/repairers | BLS OOH 2024 | **~38.6** |
| ~1,035,000 (1,000,000 US+Canada elevators + escalators, NEII) | **30,000+** elevator constructors, US + Canada | **IUEC's own site** (`Disclosed`) | **~34.5** |
| ~1,035,000 | **27,000+** IUEC members | **NEIEP** (IUEC's educational arm) (`Disclosed`) | **~38.3** |

**Conflict retained:** IUEC says "30,000+", NEIEP says "over 27,000." Both are the union's own
publications. Both kept.

Three independent denominators converge on **~34–39 units per mechanic nationally.** That convergence
is the substantive gain — the earlier single derivation could have been an artifact of the BLS
occupation definition; it is not.

### 4.3 The directional correction — this is a FLOOR, not a ceiling

**File 05 records ~37 as "an upper bound on a national average." I believe the direction is wrong,
and it matters, so I am stating it rather than quietly restating the number.**

Both distortions push the same way:

1. **The denominator is too large.** It counts every mechanic doing **new installation and
   modernization**, who carries **no maintenance route at all**. Removing them shrinks the
   denominator and **raises** units per route mechanic.
2. **The numerator is too small.** NEII states "a majority of this data was compiled in **2007**." The
   installed base has grown for ~19 years. A current count is **higher**, which also **raises** the
   ratio.

The only offsetting factor is that some units are self-maintained rather than contracted (the
Wisconsin schedule shows this directly — many UW units are marked "N/A / UW in-house"), which trims
the numerator. That effect is real but small relative to the two above.

**So ~34–39 is a floor on units per maintenance mechanic. The true route figure is above it.** Any
model that treats ~37 as a ceiling will under-credit route density in a dense metro and mis-price the
asset. This is the opposite of the conclusion the earlier file supports, and it is the more
consequential half of Slot 4.

### 4.4 Why no single benchmark can exist — and what to underwrite instead

Units per mechanic is **not a constant of the trade. It is a dependent variable of contracted visit
frequency**, and visit frequency is a *priced line item* in real contracts, not an operating choice.

Sourced intervals, from actual contracts:
- **Weekly (52 visits/unit/yr)**, semi-monthly (24), monthly (12) — Wisconsin/UW 19-5971, where the
  interval column **W / S-M / M** is priced explicitly
- **Quarterly (4 visits/unit/yr)** — Bay St Louis MS

A mechanic works **2,000 hours/year** (NEIEP, `Disclosed` — "2,000 hours of full-time, supervised
work annually"). Holding productive route time and per-visit duration constant, **units per mechanic
scales inversely with visit frequency across a 13x span** (52 visits vs 4). A book of quarterly L&E
units supports an order of magnitude more units per mechanic than a book of weekly institutional
traction units — **at correspondingly lower revenue and margin per unit.**

**The underwriting consequence, which is the actual answer to Slot 4:** *units per mechanic is
meaningless as a standalone screening metric, and a target quoting a high one may be quoting a
low-frequency, low-price book rather than superior route density.* The metric to underwrite is
**visit-frequency mix**, and it is knowable — it is written into the contracts, and public-sector
comparables price it explicitly.

I am **not** publishing a units-per-mechanic point estimate. The inputs to do the division honestly
for a specific target are now all sourced; the national constant the brief hoped for does not exist,
and the reason it does not exist is structural rather than evidentiary.

---

## Slot verdicts

| Slot | Verdict |
|---|---|
| **1 — register fields** | **PARTIALLY FILLED.** 10 domains closed, 2 left empty (one a parking page, one unverifiable). ~30 fields closed in total across HQ, states, locations, dates and brands. **Unit counts closed: zero.** |
| **2 — disinterested LMM multiple** | **STILL EMPTY.** None exists. The reason is structural (NAICS 238290 is a grab-bag) and is now documented, with the three parties who could change it named. |
| **3 — full-maintenance vs L&E margin** | **PARTIALLY FILLED.** Tiers defined; code floor established (MCP mandates identical tasks at every tier); risk transfer sized with sourced callback frequency and loaded wage. No published margin percentages. |
| **4 — units per mechanic** | **PARTIALLY FILLED.** Circulating figure's origin confirmed and its attribution falsified at NAEC. National floor of ~34–39 corroborated across three denominators, with the earlier pass's direction corrected. No point benchmark published — it is a dependent variable. |

---

## What we don't know yet

1. **Maintenance-portfolio unit counts for 7+ register entries.** Zero closed. Independents do not
   publish this — the unit book is the asset. **Treat as a diligence input, never a screening input.**
2. **The real domain for Standard Elevator Systems**, and whether **Elevator Systems, Inc.** has a
   live site. Both left empty. `standardelevator.com` is a for-sale parking page.
3. **Whether McIntosh Industries belongs in Standard Elevator Systems' brand list.** Conflicting
   evidence retained. The Arcline release names five suppliers and McIntosh is not among them.
4. **Any elevator-specific LMM multiple from a disinterested publisher.** Does not exist. Would
   require GF Data to add sub-NAICS tagging, NAEC to start publishing benchmarks, or a public
   strategic to disclose an add-on price.
5. **Published gross margin by contract tier.** Not found; likely not published anywhere. The
   mechanism and arithmetic to derive it per-target are now in hand.
6. **A single RFP pricing full-maintenance and Lube & Examination options side by side for the same
   units.** This is the one document that would convert Slot 3 to FILLED. Search the exact strings
   **"Lube & Examination," "Examination and Lubrication," "Preventive Maintenance Only"** — not "oil
   and grease," which is shop-floor jargon and will not appear in procurement text.
7. **Actual callback duration in hours.** The 4-per-year rate is sourced; the hours per callback are
   not, which is why §3.3 is a sensitivity table rather than a figure.
8. **A survey-mean callback rate.** The Schloss figures are an *achievable* best case for
   well-maintained equipment. The rate on a neglected book — precisely what a buyer inherits — is
   unpublished, and it is the number that determines whether an acquired full-maintenance book is
   profitable.
9. **Whether the IUEC 30,000+ / NEIEP 27,000+ figures include Canada consistently**, and what share
   of either carries a maintenance route rather than installation/mod work. Resolving that share
   would convert the ~34–39 floor into a real route metric.
10. **Method gap, flagged for the next run:** this pass had **no working search engine**. Slots 2–4
    were worked by direct URL fetch only. Slot 3's missing RFP and any Pepperdine PCM sector table
    are both plausibly findable with search budget restored.
