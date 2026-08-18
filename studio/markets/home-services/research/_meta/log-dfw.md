# Log — hunt B · DFW HVAC

Frame: `_meta/frame-dfw.md`. Read that first; this file is the resume point.

Rows land flat in `markets/home-services/research/` as `dfw-NN-topic-source.md`,
prefixed `dfw-` so this hunt's reads stay separable from the parent market's
inside one flat folder. Every file opens with its run header.

---

## Run log

| Run | Date | What was pulled | Landed as | Result |
|---|---|---|---|---|
| — | 2026-08-01 | Preflight only. Doctor run, rule files read, workspace surveyed. Nothing pulled. | — | 2 blockers found, 1 warning cleared |
| 00 | 2026-08-01 | OMB Bulletin 23-01 — DFW–Arlington MSA (CBSA 19100) delineation | `_meta/frame-dfw.md` | ok — **11 counties, not 9** |
| 01 | 2026-08-01 | All 34 register parents' own sites checked for a DFW location; domains verified | `dfw-01-platform-dfw-locations.md`; domains into `screen/consolidators.md` | ok — 18 parents with a confirmed DFW location; 12 confirmed absent; Apex unresolved |
| 02 | 2026-08-01 | Apex Service Partners + Texas — dated wires, own site, sponsor pages. Apollo dateline re-verified by hand. | `dfw-02-apex-position.md` | **partial** — HQ confirmed inside the MSA (Irving); no operating brand findable in Texas. Absence of evidence, not evidence of absence. |
| 03 | 2026-08-01 | Six franchise location finders (Neighborly, Authority Brands), filtered to the 11 counties | `dfw-03-franchise-locations.md` | ok — 37 franchise businesses; **25 in NAICS 238220**; 13 HVAC |
| 04 | 2026-08-01 | TDLR air conditioning contractor licences — statute, data channels, county counts via the Socrata mirror | `dfw-04-tdlr-licence-registry.md` | ok, then **partially superseded by run 05** — counts did not filter on licence expiry |
| 05 | 2026-08-01 | TDLR bulk file `ltairref.csv` supplied by Paul, read directly — 20,400 rows | `dfw-05-tdlr-file-analysis.md`; legal entity names into `screen/consolidators.md` | ok — **4,799 current licences / 4,665 firms**; 2,806 environmental-capable HVAC firms; licence count is **not** a size proxy |
| 06 | 2026-08-01 | **CBP 2023 Complete County File** (`cbp23co.txt`, 1,100,962 rows) supplied by Paul — NAICS 238220 × the 11 counties × employment size class | `dfw-06-cbp-establishment-bands.md` | ok — **2,412 estabs, 31,980 emp, $2.418B payroll**; 74.5% under 10 employees; **the band, and a first computed share** |
| 07 | 2026-08-01 | **2022 Economic Census EC2223KOB** supplied by Paul — construction receipts by kind-of-business, US and states | `dfw-07-receipts-and-the-238220-split.md` | ok — TX 238220 receipts **$25.418B**; **HVAC 34.3% / plumbing 32.8% measured**; DFW receipts derived at **$8.356B** (range $6.9–8.4B) |
| 08 | 2026-08-01 | (a) employee counts for the 26 platform-owned DFW establishments, three parallel passes; (b) CBP bands for five adjacent trades via `market-data.mjs` | `dfw-08-platform-sizing-and-adjacent-trades.md` | **(a) failed honestly — 4 figures of 26.** Branch headcount is not published for private trade businesses. **(b) ok** — electrical, roofing, pest control, finish carpentry, other building equipment all seeded |
| 09 | 2026-08-03 | Arithmetic only — the three-number sizing card Paul asked for, bounds computed, all derivations registered | `dfw-09-sizing-card.md` | ok — market ≈$8.4B (range 6.9–8.4) · band $3.6–6.4B · rolled-up 8.5–22.6% of band · residual ≈280 estabs, ≈$2–6B. **Baker Brothers (400 emp) placed in the Census 250+ band — first named cross-check between runs 06 and 08.** In-band platform count corrected 26 → ≈25. |
| 12 | 2026-08-03 | KOB dollar cuts + allocations for electrical, roofing, finish carpentry; **garage-door NAICS mapping settled** (CONKB 8351 → 238350, 90.5% US / 98.2% TX) | `dfw-12-adjacent-trade-dollars.md` | ok — TX electrical $22.943B, roofing $6.970B; DFW derived $6.880B / $2.759B; **DFW is 39.58% of TX roofing payroll — overweight, hail signal; roofing spread only 3%** |
| 13 | 2026-08-03 | Electrical (238210) ownership pass — owner-published sources | `dfw-13-electrical-numerator.md` | ok — **no residential-electrical-first PE platform found in DFW** (absence of evidence, field searched); IES, FSG, Rosendin added to register; Prism/Team Enoch/Milestone recorded as notable independents |
| 14 | 2026-08-03 | Roofing (238160) ownership pass | `dfw-14-roofing-numerator.md` | ok — commercial consolidated (5 platforms, 6 nameplates); **residential/storm is the open field, sponsor entries dated 2024-01 → 2025-10**; four name-collision traps closed |
| 15 | 2026-08-03 | Pest control (561710) ownership pass | `dfw-15-pest-numerator.md` | ok — **the most consolidated trade: 9 parents, ≈26+ verified locations against a 396-establishment universe**; Anticimex entered 2025-06, Rollins/Romex 2026-04 |
| 16 | 2026-08-03 | Sizing cards for electrical, roofing, pest — arithmetic on runs 08/12–15 | `dfw-16-adjacent-trade-cards.md` | ok — **the density gradient runs exactly with recurring-revenue quality**: pest ≈40 locations/9 parents (10.1% of ALL estabs) → HVAC (1.1%) → roofing (commercial only) → electrical (residential side empty) |
| 17 | 2026-08-03 | **VERIFICATION PASS (b)** over runs 12–16 — exact KOB recompute + 14 adversarial web checks | `verification-pass-2026-08-03b.md` | 12 CONFIRMED, 2 PARTLY, zero substantive refutations. Corrections: IES is **NASDAQ** not NYSE; Citation/Aptive dated **2024-08-27**; Romex DFW cites romexpest.com/texas |
| 11 | 2026-08-03 | **SYNTHESIS + AUDIT.** Engine bootstrapped per CLOUD_BOOTSTRAP.md; Part XI (the DFW cut) written into `master.md`; §5.1 DFW row corrected; A.0.4 registered; 5 derivation rows and 11 source URLs added; snapshot `versions/master-v5.md` | `master.md` (v5) | **audit.mts: 386 figures, 275 found, 108 UNEXPLAINED — identical 108 to the pre-insertion baseline.** Part XI added 14 figures, all traced. NOT CLEAN overall is entirely the legacy condition: the pre-2026-08 parts' research files were never landed on disk. |
| 18 | 2026-08-03 | Four-metro CBP comparison (Houston, San Antonio, Austin) — OMB delineations + `market-data.mjs` | `tx-metros-cbp-238220.md` | ok — DFW is the largest TX metro market (32.9% of state payroll); big four hold 79.5% |
| 19 | 2026-08-03 | **§11.7 into master (v7) + THE DFW REPORT built.** `documents/dfw-home-services-market-map.md` audited against master — **35 figures, 35 found, 0 unexplained** — rendered via `build-report.mts` (16pp, 4.3MB), all 16 pages eyeballed. Filed collateral per Paul's decision; existing composed bands + cover reused, no new art needed | `collateral/dfw-home-services-market-map/2026-08-03/` | Cover clean, no overflow; the only audit residue is master URLs not all carried into a derived doc — expected. **Rev 2 same day on Paul's review:** two-line title pushed the cover stack down and exposed the jade halo's elliptical edge as a hard band — title cut to one line, matching the approved 29 July cover geometry. The composed bands' floating Deal Green dash read as an artefact — six new **full-bleed wide-crop bands** composed from the source trades illustrations (band-*-wide.jpg in media/, originals untouched), same treatment as the cover image. Re-rendered, re-eyeballed. |
| 20 | 2026-08-03 | **EC2256BASIC + EC2223VALCON + EC2223LOCCONS** supplied by Paul — pest metro receipts, service-split test, TX size cross-check | `dfw-20-pest-metro-receipts.md`; master v8; report rev 3 | **DFW pest MEASURED: $585.1M / 344 firms / 397 estabs (2022 EC)** — the only house trade with a measured metro revenue figure; EC vs CBP agree within rounding on estabs and payroll (397/$206.9M vs 396/$206.4M) and LOCCONS 8,971 TX estabs vs CBP 8,909 — **denominators now rest on two federal programs**. VALCON is a location-of-work matrix: **service-vs-new-construction confirmed unpublished**, closed. |
| 21 | 2026-08-03 | **ELECTRICAL RE-CHECK** — adversarial second pass triggered by Paul's challenge (Milestone) | `dfw-21-electrical-recheck.md`; run 13 banner; register +2 parents; master v9 (A.0.5); report corrected + re-rendered | **Team Enoch verdict OVERTURNED** — recapitalized by McKinney Capital 2022-03-01; the own-site "family owned" copy survived the recap. Milestone independent CONFIRMED but is the flagship of family holdco **Mpact Home Services** (incl. **Firehouse Roofing** — now in the register so a roofing screen cannot call it independent). IES Residential's Rowlett branch placed. Claim sharpened: no dedicated residential **service-and-repair** electrical consolidator. |
| 10 | 2026-08-03 | **VERIFICATION PASS** — job 2 / pass 6. Independent recompute of every file-derived figure (fresh parser); 26 adversarial web checks against issuing sources | `verification-pass-2026-08-03.md` | **Zero refutations. All recomputes exact.** Three corrections registered: the CBP "N" cell is "not available or not comparable" per the Census glossary, not "disclosure suppression"; the $5.0–5.5M Roto-Rooter figure lives in Chemed's 8-K Ex-99 (2026-04-23), not the acquisition release; DynaTen's Fort Worth attribution cites dynaten.com, not the Comfort Systems logo page. |

---

## Coverage table

The resume point and the stop condition. A hunt is done when every row is `ok`,
or named explicitly as unknown, **and** two consecutive runs on a slot return
nothing new.

| # | Coverage row | Status | Runs | Note |
|---|---|---|---|---|
| 1 | **Boundary and vintage** | `ok` | 2 | 11 counties settled. TDLR file dated 2026-06-01, cut to current licences as of 2026-08-01. CBP and Economic Census vintages still unpinned, blocked with row 2. |
| 2 | **Establishment-size distribution** — CBP, 238220 × 11 counties × employee size class | `ok` | 1 | **CLOSED by run 06.** No key was ever needed — the flat file is a public download. 2,412 establishments; 1,330 under 5, 467 at 5–9, 291 at 10–19, 192 at 20–49, 66 at 50–99, 49 at 100–249, 7 at 250–499. Ten establishments sit in suppressed cells, all in the 20-plus range. |
| 3 | **Receipts / the dollar side** | `ok` | 1 | **As far as it goes.** No MSA figure exists — construction stops at state level in the Economic Census, confirmed from the API geography spec. Texas 238220 receipts **$25.418B** measured; DFW **derived at $8.356B** on a payroll-share basis, with $7.735B and $6.882B from employment and establishment bases. Registered in run 07 `## Derivations`. **Cannot be banded** — the Economic Census publishes receipts by kind-of-business and state, never by employment size class, so the headline share stays an establishment share. |
| 4 | **The 238220 split problem** | `thin` | 4 | **Split 1 (HVAC vs plumbing) is now MEASURED**, not assumed: Economic Census kind-of-business detail puts Texas 238220 at **HVAC 34.3%, plumbing 32.8%, mechanical contractor 17.7%** of receipts (run 07). Independently corroborated by Texas licensing HVAC and plumbing under two separate agencies (run 05 §6). Split 2 cut from two directions — the commercial-leaning kind-of-business categories total 24.3% of receipts, and TDLR's Class A/B statutory capacity limit isolates 1,738 residential-scale firms. **Split 3, service vs new construction, remains untouched by any source and is still an assumption.** |
| 5 | **Establishments → companies** | `thin` | 3 | Now bounded from both ends: 4,665 licensed HVAC firms (TDLR, includes non-employers) against 2,412 CBP establishments in 238220 (employers only, HVAC **and** plumbing). **The gap is the non-employer population and it is roughly half the market** — the licence registry overstates the acquirable universe by about 2x before any band is applied. Company-vs-establishment within the band is still open: Wrench, ARS, Roto-Rooter and Legacy each hold two DFW locations. |
| 6 | **Platform-owned locations in DFW** | `ok` | 2 | Two consecutive runs; the residual gap is named explicitly as unknown below, per the stop condition. |
| 6a | *— the Apex residual* | `unknown` | 2 | Apex publishes no roster. HQ is inside the MSA, no operating brand findable. **The TDLR file does not resolve it either** — the 13 Texas businesses trading as "Apex" are the unrelated ones run 02 warned about. Remaining routes: TX SOS entity search, county DBA filings. **Said so on the page.** |
| 6b | *— the franchise-encumbered line* | `ok` | 1 | 25 businesses in 238220, of which 13 HVAC. Owner count is below business count by an unmeasured amount. |
| 7 | **Independent residual by size band** | `thin` | 2 | Run 09 puts bounds on it: **≈280 unmatched establishments carrying roughly $2–6B of annual work** (band total $3.6–6.4B). Width is almost entirely the 22 unsized platform locations. Establishments, not companies; Apex overstates it by an unknown amount. |
| 8 | **The headline number** — platform-owned share of the acquisition band | `thin` | 2 | **≈8.5% on a 10–249 band, ≈22.6% on a 20–249 band.** Run 08 went after the employee bands that would collapse this and got 4 of 26 — branch headcount is not published for private trade businesses, which is why CBP exists. All four figures are 50+, two in the 150–499 band, so the truth likely sits near the 22.6% end. **Directional, not evidence. The range stands.** |
| 8a | *— employee band per platform establishment* | `unknown` | 1 | Not publicly available for 22 of 26. Data-broker estimates were available for nearly all and deliberately refused. LinkedIn self-reported bands are the one remaining non-broker route and need a browser — robots.txt blocks an automated fetcher. **Said so on the page.** |

Status vocabulary: `open` · `running` · `blocked` (named dependency) · `thin`
(one source, needs a second) · `ok` (worked, two runs returned nothing new) ·
`unknown` (worked, and the answer is not publicly available — said so on the
page).

## Trade-extension coverage (added 2026-08-03)

The recipe per trade: bands (CBP) · dollars (KOB + allocate) · numerator
(ownership pass) · register section · sizing card · verification · synthesis.

| Trade | Bands | Dollars | Numerator | Register | Card | Verified | Synthesized |
|---|---|---|---|---|---|---|---|
| HVAC + plumbing (238220) | ok | ok | ok | ok | ok | **ok** | **ok — master Part XI** |
| Electrical (238210) | ok (r08+r16) | ok (r12) | ok (r13) | ok | ok (r16) | **ok (r17)** | open |
| Roofing (238160) | ok (r08+r16) | ok (r12) — tightest allocation, 3% spread | ok (r14) | ok | ok (r16) | **ok (r17)** | open |
| Pest (561710) | ok (r08+r16) | **payroll only — EC2256BASIC.zip gives MEASURED metro receipts** | ok (r15) | ok | ok (r16, dollars pending) | **ok (r17)** | open |
| Garage doors | inside 238350 (r12 — mapping settled) | TX KOB line $323,368k measured; DFW not computable | Guild absent (r01) | n/a | n/a | — | — |
| Plumbing depth (TSBPE) | — | — | — | — | — | — | RMP roster not yet pulled |

The register now covers all trades: **60 parents, 239 brands, 94 domains, no
entry without a domain** (the three ownership-unresolved carriers hold their own
domains).

---

## Where this stands, without synthesizing it

**A denominator now exists, and it is a good one.** From the TDLR bulk file read
directly (run 05), current licences as of 2026-08-01: **4,799 A/C contractor
licences held by 4,665 distinct firms** across the eleven counties, of which
**2,806 firms are environmental-air capable** — the residential-relevant
population — and **1,738 are Class B**, capped at 25 tons by statute and
therefore residential-scale by law rather than by assumption.

Because Texas licenses plumbing under a separate agency, this is a **clean HVAC
population** — which is more than NAICS 238220 can say for itself.

**The band still does not exist.** TDLR carries no employment field, and run 05
confirmed empirically that licence count is not a size proxy: 98.5% of these
firms hold exactly one licence, the maximum is three, and TDIndustries — among
the largest mechanical contractors in Dallas — holds two. Row 2 is untouched.

**The band arrived on 2026-08-01 and the prediction held.** Run 05's all-firms
share was 0.29%; run 06's banded share is **8.5% to 22.6%** depending on the cut
— between one and two orders of magnitude higher, entirely because the
denominator changed. That is exactly the artefact this log warned about, now
demonstrated rather than asserted.

**The first computed answer, from run 06:** roughly **8.5% of the 10–249
employee band** and **22.6% of the 20–249 band** is platform-owned. Neither
"open" nor "closed" — about 280 establishments in the 10–249 band hold no
platform in the register, which is real runway, against a field of eighteen
parents already present and two that entered this year.

**It is a range, not a figure, and it is not yet a finding.** Narrowing it needs
an employee band for each of the 26 platform-owned establishments. It has not
been audited. The Apex hole is open. The master's *Saturated* label is not
revised on the strength of this — but §5.1's own closing line, *"Entry is
tuck-in only,"* now has numbers behind it for the first time.

---

## Access — the live constraint on rows 2 and 3

**The Census Data API requires a key.** A keyless request to
`api.census.gov/data/2023/cbp` returns, verbatim:

> "A valid *key* must be included with each data API request. If you don't have
> one, request an API Key here."

Free and issued immediately at `https://api.census.gov/data/key_signup.html`.

**Routes already ruled out, so nobody re-walks them:**

| Route | Outcome |
|---|---|
| `api.census.gov` without a key | Explicit key-required error |
| `www2.census.gov` CBP flat files | Disallowed by robots.txt |
| `data.bls.gov` QCEW open-data CSV | Disallowed by robots.txt |
| TDLR licence registry | Works — runs 04 and 05, raw file read in full. Gives a clean named HVAC universe of 2,806 firms, but carries **no employment field and no usable size proxy**, so it cannot band |
| Aggregator restatements of CBP | Excluded by the brief |
| **Census flat files, downloaded in a browser by Paul** | **THE ROUTE.** No key, no login — the key only gates the API, not the downloads. Worked for TDLR `ltairref.csv` on 2026-08-01 and is the same pattern. |

### The download list — keyless, browser only

| File | URL | What it unblocks |
|---|---|---|
| `cbp23co.zip` (12.7 MB) | `www2.census.gov/programs-surveys/cbp/datasets/2023/cbp23co.zip` | **Row 2** — CBP Complete County File, establishments by employment size class, every county × NAICS. The acquisition band and therefore the headline number. |
| `EC2223BASIC.zip` | `www2.census.gov/programs-surveys/economic-census/data/2022/sector23/EC2223BASIC.zip` | **Row 3** — and settles the construction-geography question below |
| `EC2223LOCCONS.zip` | `www2.census.gov/programs-surveys/economic-census/data/2022/sector23/EC2223LOCCONS.zip` | State-level construction establishments by employment size — a cross-check on whether DFW's distribution tracks Texas's |

### The construction-geography question — CLOSED, after one wrong turn

**Settled 2026-08-01: the 2022 Economic Census does not publish construction
below state level.** Confirmed from the API geography specifications rather than
prose:

| Dataset | Supported geography levels |
|---|---|
| `ecnvalcon` — Value of Construction Work | `010` US, `040` state |
| `ecnkob` — Value of Business Done | `010` US, `020` region, `040` state |
| `ecnloccons` — Establishments by Employment Size | `010` US, `040` state |

No county, no metropolitan statistical area, for any of them.

**The audit trail on this one, recorded because it went wrong twice.** A first
pass read the geographic-levels page sentence — *"Data from the economic census
are summarized by Region for the Construction sector only"* — as excluding
construction below state level. A second pass **withdrew that as overstated**, on
the strength of `ecnbasic` listing county and metro geography. **The withdrawal
was itself wrong.** `ecnbasic` supports those levels across sectors generally;
the construction-specific datasets do not. The original reading was correct and
is reinstated.

**Consequence: Paul's decision of 2026-08-01 is the operative path, not a
fallback.** Derive DFW receipts from the Texas receipts-per-payroll ratio applied
to DFW payroll from CBP, registered in `## Derivations` with the assumption
stated — that DFW's ratio matches the state's, which understates a high-cost
metro.

**Inputs, and what is still needed.** CBP (run 06) already supplies both payroll
figures: **Texas 238220 payroll $7,354,548k across 8,909 establishments**; **DFW
238220 payroll $2,417,736k across 2,412 establishments**. The missing input is
Texas 238220 receipts, which is in `EC2223KOB.zip` at
`www2.census.gov/programs-surveys/economic-census/data/2022/sector23/EC2223KOB.zip`.
`EC2223BASIC.zip` is no longer worth fetching — its construction detail is not
sub-state either.

**Until then the dollar side is payroll**, which is measured, primary-source and
needs no assumption. It is a different measure from revenue and must be labelled
as payroll wherever it appears.

---

## The repeatable half — `market-data.mjs`

Built 2026-08-01 and filed at the studio root, following the `engagements.mjs`
precedent: plain node, zero dependencies, no tsx, no network, no browser, so a
cloud session has it without cloning the engine.

```
node market-data.mjs bands    --cbp <cbp##co.txt> --state 48 --counties <list> --naics 238220
node market-data.mjs kob      --kob <EC22..KOB.dat> --state 48 --naics 238220
node market-data.mjs allocate --cbp <..> --kob <..> --state 48 --counties <list> --naics 238220
```

It reproduces every figure in runs 06 and 07 exactly, reads the size-class
columns from the header rather than by position (the names changed between
vintages), reports suppressed cells rather than totalling around them, and
`allocate` deliberately refuses to pick one of the three bases — the spread is
the size of the assumption.

**It is not a method file.** `RESEARCH.md` is the method and remains the only
one. This is the arithmetic that was done by hand for DFW, so the next metro and
the next trade cost a command.

## Tooling state

`SMBx-main/node_modules` is not installed, and this session reaches the disk
through a sandboxed VM with no network. **No `audit.mts`, no `screen.mts rank`,
no `verify-spec.mts` from this session.** `doctor.mjs` runs because it is
dependency-free plain node.

**The verification pass ran 2026-08-03** (`research/verification-pass-2026-08-03.md`
— zero refutations, three corrections registered) **and the synthesis + audit ran
the same day.** Part XI is in the master at v5; `audit.mts` baseline 108
unexplained before insertion, 108 after — the DFW part is clean, the legacy
condition is not, and it is Paul's call what to do about the 372-figure body
whose original research was never landed: retire the untraceable figures,
re-source them, or carry the condition documented.

---

## Open, and Paul's

- **The buy-box** — revenue range and cheque size. Blank on purpose.
- **The revised target-scoring model.** Exists, **not adopted**, does not bind
  hunt B. Ask before building against it.
- **The 14-buyer DFW acquirer draft board** from a prior session. Not on disk;
  Paul has offered to paste it.
- **What to do if a load-bearing figure's basis collapses** in pass 6.
