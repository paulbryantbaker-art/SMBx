# Fire & life safety — research gate report

Run 2026-07-29. Twelve research files, **7,918 lines**, **809 source URLs**.
Eight streams in the first round, four gap-fills in the second.

**What this is:** the raw evidence base a market assessment gets written from.
Every figure carries a label saying how solid it is — **Disclosed** (a company or
a government table said it), **Press-derived** (a trade outlet said it), or
**Estimated** (we computed it, and the arithmetic is shown). Counts: **1,062
Disclosed · 198 Press-derived · 182 Estimated**.

**What this is not:** verified. A figure here is *traceable to a source*. Phase 4
— opening the primary source on every load-bearing number and confirming its
scope and period — has not been done. That distinction is the whole reason the
last market assessment had to be corrected.

---

## Files

| File | Lines |
|---|---:|
| `01-government-sizing.md` | 330 |
| `02-codes-and-mandate.md` | 656 |
| `03-consolidators-a.md` | 632 |
| `04-consolidators-b.md` | 944 |
| `05-brand-level-detail.md` | 699 |
| `06-unit-economics.md` | 655 |
| `07-valuation-and-deals.md` | 446 |
| `08-demand-drivers.md` | 705 |
| `09-brand-rosters-gapfill.md` | 505 |
| `10-subvertical-3-sizing.md` | 791 |
| `11-multiples-gapfill.md` | 422 |
| `12-annuity-quantified.md` | 955 |
| **Total** | **7,918** |

---

## Gate results

### 1. Named platforms with sponsors — **PASS** (needed 15)

**32 distinct entities** with an identified sponsor or owner. Composition
caveat, so the number is not read as more than it is: it includes four
manufacturer platforms rather than service contractors, two sub-platforms now
absorbed inside Summit, one exited into APi, and three permanent-capital holders
(Markel/VSC, Mark Ein/Kastle, BlackRock LTPC/Summit). Service contractors under
a live PE sponsor are fewer, and the master should count that subset separately.

### 2. Brand-level detail — **PASS** (was failing; now closed)

**≈370 brands from round one, plus 214 more in the gap-fill**, with **31 verified
domains**. Zero domains were guessed; over 100 cells were left deliberately empty
and itemised.

The two failures from round one are fixed:

- **APi Group** — the roster is out. A JSON endpoint at
  `apigroupinc.com/api/v1/companies` bypassed the robots block, giving 36
  companies (21 in Safety Services), and the EX-21 subsidiary lists filled in the
  legal names. **118 register rows** now cover APi, including the sub-brands of
  Viking, Western States, Davis-Ulmer, American Fire Protection Group and
  CertaSite.
- **Encore Fire Protection** — **75 rows**. Its real footprint is **13 states, not
  the 17 commonly reported.**

Also fixed: **National Fire & Safety's domain is `natfiresafety.com`** — it was
the single most dangerous unknown, being unmatchable by either name or domain.
**Spectrum is `spectrum-safety.com`.**

**Three domain traps caught, any one of which would have corrupted the screen:**
`certasite.com` resolves to Certa Tower Services, an unrelated cell-tower firm
(CertaSite is `certasitepro.com`); `encorefp.com` is not Encore
(`encorefireprotection.com` is); `spectrumsafetysolutions.com` is an unrelated
India-market fire firm.

**And a structural warning about APi's own filings:** its EX-21 is *shrinking*.
Western States Fire Protection, Grunau, Delta Fire Systems, Landmark Sprinkler,
Olsen Fire and five others appear in the 2020 S-4 and are **absent from the FY2025
exhibit**, replaced by two consolidation vehicles. Those businesses still trade
under their old signs. **A register built only from the current EX-21 under-counts
by ≈30 live names.** The 2020 S-4 exhibit (92 rows) must be used alongside it.

**Name collisions that will produce false matches** — these must be caught by
domain, never by name: **"Guardian"** (five unrelated entities, one of which
publishes on two different domains), **"Absolute Fire Protection"** (three
different owners), **"National"** (four), **"ASG"** and **"United Alarm
Service"** (two owned platforms each).

### 3. All three sub-verticals sized separately — **PARTIAL. Materially better, still uneven.**

- **Sprinkler and suppression contracting — PASS, and cleanly.** The first round's
  best result: 2022 Economic Census table **`EC2223KOB`**, variable **`CONKB`**,
  code **8221 "Building sprinkler system installation contractor" = $12,018,607
  thousand** (US, 2022, Disclosed). It is a distinct code from 8222 "Lawn
  sprinkler". This is a fire-specific figure from a primary government table —
  not, as the plan originally would have produced, a count of plumbers.
- **Alarm, detection and monitoring — CEILING, not a size.** Both available
  instruments fuse fire with burglar *by definition*. `CONKB` 8212 = $18,514,295
  thousand; NAICS 561621 = $31,313,513 thousand. Differently scoped, not averaged.
  The fire share is unestablished and that is a real limit.
- **Extinguisher, kitchen and special hazard — PARTIAL, was a total failure.**
  No revenue denominator exists in the public record; this is now established
  rather than assumed. What replaced it is a **count of legally obligated sites**,
  which is defensible because each one carries a recurring statutory duty:
  **≥737,325 commercial kitchens** (530,034 from Census 722511/722513/722514 plus
  207,291 institutional — schools, hospitals, nursing facilities, hotels), and
  **8.57M–24.11M portable extinguishers**, floored on California's codification of
  the NFPA 10 spacing table at a legal maximum of 11,250 sq ft per extinguisher
  against CBECS floorspace. Bottom-up recurring service revenue lands at
  **$1.08B–$2.60B/yr**, and the file states plainly that this is **a floor, not an
  estimate** — Cintas alone would be 16–38% of that pool, which is not credible
  against its own "highly fragmented" language.

  **The most-cited number in this sub-vertical does not mean what it is used to
  mean:** Cintas Fire Protection Services revenue of **$817.463M FY2025** covers
  "fire extinguishers, **sprinkler systems and alarm testing**" — it spans all
  three sub-verticals and Cintas does not split it.

### 4. Every figure carries a Basis label — **PASS**

1,062 Disclosed · 198 Press-derived · 182 Estimated, across all twelve files.

### 5. Standing laws — **3 violations found and fixed, 0 remaining**

`~`-for-approximately: one author usage corrected to `≈`, and two inside a direct
quotation of APi's own deck escaped as `\~` so the quote stays verbatim. Census
API URL tildes are inside code spans and are part of citations.

---

## The five findings that most change the shape of the study

**1. A widely circulated valuation figure is laundered, and the chain is now
traced.** The "17–20x for fire platforms" that appears across the industry
originates in **one** PE Hub report, relayed by SDM Magazine on **2024-07-15**
(not 2026), describing *prospective bids* valuing Pye-Barker at 17x–20x its $350M
EBITDA. **No sale occurred** — Altas retained majority and sold minority stakes to
ADIA and GIC in January 2025, terms undisclosed.

`ctacquisitions.com` then republished 17–20x **attributing it to Capstone and
Breakwater. Capstone actually publishes 11.8x. Breakwater's own ceiling is
7x–10x. Neither contains 17–20x.** Zeus Fire and Security — a real PE-backed
operator — subsequently republished the figure citing CT Acquisitions. **The
apparent multiplicity of sources is one 2024 assertion counted four times.**

**2. No investment bank publishes fire-specific multiples by size tier.** Stop
looking for that document. Meridian Capital is the only house with a
sector-dedicated Fire & Life Safety M&A update — 110+ transactions across two
editions, **zero values, zero multiples**. What does exist: **GF Data's size bands**
(NA PE-backed deals, all industries, N=2,084) — **$10–25M enterprise value = 6.4x**.
Against that, **APi's disclosed sub-6x bolt-on ceiling sits 0.4–0.7 turns below
the market for identically sized deals.** That is the roll-up's edge stated as a
number against a real benchmark, and it is more defensible than the spread the
plan originally wanted.

**3. The recurring-revenue claim is real but smaller and more fragile than the
industry says it is.** Three findings, all new:
- **A commercial retention figure exists** and had never been surfaced: ADT
  Commercial (now Everon) disclosed **≈91% customer retention, ≈10-year customer
  life, ≈30% recurring share** (April 2022 investor deck). Far more relevant than
  ADT's residential 13.1% attrition, though it is a marketing-deck figure on a
  blended security-plus-fire book.
- **Assignability turns on whose paper the contract is on.** Three executed ITM
  contracts were obtained in full and they are structurally incompatible: a
  contractor's own form runs 60 months with auto-renewal and an explicit right to
  assign; the JCI–Physicians Realty contract is terminable on 45 days by either
  party and **may not be assigned without the owner's consent**; the Pye-Barker–Lee
  County vehicle is a rate-card PO cancellable in 30 days "for any reason
  whatsoever." **The best-named logos are the ones least likely to travel in a
  deal.**
- **APi has simultaneously claimed "consistent renewal rates" and contract
  durations of "less than six months" for six straight years**, through the 10-Q
  filed 2025-10-30.

**4. The mandate is real; capture of it is not.** City of Rockville, Maryland
(2024-01-31): of 2,083 fire protection systems, only **1,313 — 63% — are current
on annual inspections**. In one of the most actively enforced jurisdictions in the
country, **37% of legally inspectable systems are not current.** That is
simultaneously the bear case on the annuity and the bull case on the
consolidation opportunity.

**5. The insurance-pressure thesis currently cuts backwards.** Marsh
(2026-07-22): global commercial property rates **−12% in Q2 2026**, after −9% in
each of the two prior quarters. A carrier with surplus capacity has less leverage
to compel a retrofit. The code-mandated ITM annuity is untouched; the
carrier-driven upgrade cycle is not. Separately, **no commercial
sprinklered-vs-unsprinklered premium differential could be verified from any
carrier or broker** — the industry's most-repeated marketing claim has no
traceable public commercial source.

---

## What we still do not know

- **The fire share of the alarm and monitoring sub-vertical.** Both instruments
  fuse fire with burglar at the definition level. It has a ceiling and no size.
- **The clean-agent and special-hazard layer is entirely unsized** — no unit
  count, no price. So is restaurant wet-chemical suppression service, which means
  a whole NFPA 17A revenue line is missing from the sub-vertical 3 estimate.
- **No fire contractor discloses an ITM renewal, retention or attrition rate.**
  Checked across APi, Cintas, JCI, ADT, Rollins and UniFirst. **There is no
  fire/life-safety S-1 in EDGAR** — the richest normal source does not exist here.
- **The composition of an ITM book by contract form** — written multi-year vs
  annual PO vs handshake. Nobody discloses it. This is the most commercially
  decisive unquantified variable in the industry, and it is a **diligence
  question, not a research question**.
- **Route density** — stops per technician per day, drive time, minimum viable
  metro density. Still no named source. The only figures found were vendor
  marketing with uncited attributions, and they were deliberately not carried.
- **Whether an emptied office building keeps getting inspected.** No source
  measures ITM deferral. This is the live question on the annuity's durability.

Three routes are identified but unreached, and each is a concrete next step
rather than a dead end: a **Census API key** would unlock the NAPCS product
tables that split extinguisher servicing out of NAICS 811310; **state franchise
registries in CA, MN, WI and NY publish FDDs free**, and Item 19 in a hood-cleaning
or extinguisher franchise disclosure is the best available route-economics data;
and **credit rating agency opinions** on the named platforms are entitlement-gated
rather than absent, so that is a paid-database task.
