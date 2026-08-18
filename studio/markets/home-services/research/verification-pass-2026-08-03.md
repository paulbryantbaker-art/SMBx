<!-- run: 10 | hunt: B | date: 2026-08-03
     query: primary-source verification of the DFW HVAC hunt's load-bearing
            figures — CLAUDE.md job 2 / RESEARCH.md pass 6
     tool: (a) independent recompute of every file-derived figure with a fresh
           parser; (b) three adversarial web passes instructed to REFUTE, each
           claim checked against the issuing source -->

# Verification pass — 2026-08-03 · DFW HVAC hunt (runs 00–09)

**What this file is.** The job-2 verification of every load-bearing figure in
the DFW hunt, written as a source document so `audit.mts` can check against it.
Each figure is quoted as its source states it, with URL and date. Verdicts:
**CONFIRMED** · **CONFIRMED-WITH-NOTE** · **CORRECTED** (registered in §D) ·
**NOT VERIFIABLE** (stated, with why).

**Headline: 26 adversarial checks, zero refutations, three corrections
registered — one definitional, two citation-placement.** Every file-derived
figure reproduced exactly under an independent parser.

---

## A · File-derived figures — independent recompute

Method: every figure originally produced by awk (device) or pandas (container)
was recomputed with a different parser (`csv` module, fresh logic, no shared
code). **All match to the digit.**

| Figure | Original | Recompute | Verdict |
|---|---|---|---|
| TDLR file rows | 20,400 | 20,400 | CONFIRMED |
| TDLR current statewide (exp ≥ 2026-08-01) | 19,065 | 19,065 | CONFIRMED |
| DFW current licences | 4,799 | 4,799 | CONFIRMED |
| DFW distinct firms | 4,665 | 4,665 | CONFIRMED |
| DFW environmental-capable licences / firms | 2,849 / 2,806 | 2,849 / 2,806 | CONFIRMED |
| DFW Class B environmental licences / firms | 1,750 / 1,738 | 1,750 / 1,738 | CONFIRMED |
| DFW 238220 estabs / emp / payroll | 2,412 / 31,980 / $2,417,736k | identical | CONFIRMED |
| DFW size bands | 1,330 / 467 / 291 / 192 / 66 / 49 / 7 | identical | CONFIRMED |
| TX 238220 estabs / emp / payroll | 8,909 / 105,086 / $7,354,548k | identical | CONFIRMED |
| TX 238220 receipts | $25,418,099k | identical | CONFIRMED |
| TX HVAC / plumbing / mechanical KOB | $8,710,445k / $8,333,475k / $4,492,144k | identical | CONFIRMED |
| US 238220 receipts | $297,608,835k | identical | CONFIRMED |

**Internal consistency checks that fell out of the recompute:**

- The four Census regions in the KOB file sum **exactly** to the US total:
  $53,671,772k + $62,428,518k + $108,813,748k + $72,694,797k = $297,608,835k.
- TDLR current-only (19,065) sits within 0.5% of TDLR's own published FY25
  figure (19,163) — the two counts were reconciled in run 05 and the
  reconciliation holds.
- US national 238220 from the CBP 2023 file: **110,542 establishments,
  1,210,941 employees.** Recorded as a national anchor. The home-services master
  carries 114,427 establishments for the 2022 vintage; the difference is
  vintage, not conflict, and no reconciliation is attempted here.

## B · Statutory and administrative claims

**Tex. Occ. Code § 1302.252** — CONFIRMED-WITH-NOTE. Verbatim: *"An air
conditioning and refrigeration contracting company must employ full-time in each
permanent office a license holder who holds an appropriate license assigned to
that company."* Confirmed word-for-word across two independent reproductions of
the official text (law.justia.com, texas.public.law — the latter marked verified
to 2025-05-26). **Note:** the Legislature's own site could not be fetched by an
automated tool (navigation shell only; PDF routes robots-blocked), so the
verification rests on two agreeing mirrors of the official text rather than the
issuing page itself.

**Tex. Occ. Code § 1302.253** — CONFIRMED-WITH-NOTE, same sourcing note. Class B
verbatim: *"…not more than: (1) 25 tons cooling capacity; or (2) 1.5 million
British thermal units per hour output heating capacity."*

**OMB Bulletin 23-01, CBSA 19100** — CONFIRMED against the bulletin PDF itself
(whitehouse.gov, dated 2023-07-21). Exactly eleven counties, nothing missing,
nothing extra: Collin, Dallas, Denton, Ellis, Hunt, Kaufman, Rockwall (Division
19124); Johnson, Parker, Tarrant, Wise (Division 23104).

**TDLR "ACR at a Glance" FY25** — CONFIRMED. *"Number of Licenses: 60,552 (FY
25)"*; Air Conditioning Contractor **19,163**; Registered AC Technician 37,942;
Certified AC Technician 3,447. The three sum to 60,552 exactly.
https://www.tdlr.texas.gov/media/pdf/ACR%20at%20a%20Glance.pdf

**CBP record layout** — CONFIRMED-WITH-NOTE. Field list (fipstate, fipscty,
naics, est, emp, ap, size classes) confirmed; the canonical layout .txt on
`www2.census.gov` is robots-blocked, so confirmation rests on the Census index
page plus a faithful mirror. Vintage note: the first size class is `n1_4` in
pre-2017 layouts and `n<5` from 2017 on — `market-data.mjs` already reads both.

## C · The platform numerator — every DFW location claim re-checked

All CONFIRMED, quotes on file with the checking agents' reports. The ones that
carry the most weight:

| Claim | Verbatim anchor | Source |
|---|---|---|
| Baker Brothers, Dallas Metroplex (Wrench) | "Dallas Metroplex, TX" | wrenchgroup.com/wrench-group-brands/ |
| Berkeys (Wrench) | "Dallas/Grape Vine, TX" *(sic — two words on the page)* | same |
| Baker Brothers 400 employees | "400 US Employees" | topworkplaces.com/company/baker-brothers-plumbing/ |
| Berkeys 195 employees | "195 US Employees" | topworkplaces.com/company/berkeys-air-conditioning/ |
| Lex 50+ technicians, North Texas | "50+ Expert Technicians" · "a leading residential service provider based in North Texas" | lexairconditioning.com/about-us · PR Newswire 2026-01-15 |
| ARS ×2, Irving | "6029 W. Campus Circle, Irving, TX 75063" (+ Suite 150) | ars.com/locations/texas |
| Service Experts Dallas (Richardson) + Fort Worth; HQ Richardson | "headquartered in Richardson, TX" | serviceexperts.com |
| SEER HQ Addison; Swan Sunnyvale | "15303 Dallas Parkway #475 Addison, TX 75001" · "309 U.S. 80 Frontage Rd, Sunnyvale, TX" | theseergroup.com · callswan.com |
| Sunny Service, Hurst (TurnPoint) | "Sunny Service — Hurst, TX" | turnpointservices.com/turnpoint-brands/ |
| Roto-Rooter FW buyback | "approximately $20.6 million" (SF + Fort Worth, 2026-03-31); south Texas "approximately $12.0 million" (2026-06-08) | GlobeNewswire 2026-04-01; Chemed 8-K Ex-99 |
| Dallas Mechanical Group 150+ (EMCOR) | "With skilled staff of more than 150, we are one of the largest HVAC contractors in Texas." | dallasmechanicalgroup.com/about, ©2026 EMCOR |
| UBS / DFW Mechanical Group, Wylie | "Headquartered in Wylie, Texas" | BusinessWire 2026-01-20 |
| Modigent: Infinity (FW) + Evolution (Irving) | "premier design-build and mechanical services provider in the greater Dallas-Fort Worth metroplex" | modigent.com/companies |
| Air Texas Mechanical, Addison (Service Logic) | "3724 Arapaho Road Addison, TX 75001" | servicelogic.com/locations |
| Texas Chiller Systems, Farmers Branch (Astra) | "14311 Welch Rd #500, Farmers Branch, TX 75244" — **HQ is San Antonio; Farmers Branch is the branch** | astraservicepartners.com |
| Crete: CBS Mesquite + CUES Dallas | "Austin / San Antonio, TX \| Mesquite, TX" · "Dallas, TX" | creteunited.com/our-partners |
| FirstCall DFW branch | "Dallas-Fort Worth, TX" branch → /dfw | firstcallmechanical.com |
| Apex dateline and scale | "TAMPA, FL and DALLAS-FORT WORTH, TX — (May 28, 2026)" · "75 prominent local brands across 46 states, with more than 13,000 employees" · "+150 locations… +$3B in annual revenue" | apollo.com, 2026-05-28 |
| Franchise spot-check, 5 of 37 | all five live at the claimed finders, addresses matching | aireserv.com ×2, mrrooter.com, onehourheatandair.com, mistersparky.com |

## D · Corrections registered

**D.1 — The "N" cell definition. CORRECTED.** Runs 06 and 09 (and the first
version of `market-data.mjs`) described `N` cells in the CBP file as "Census
disclosure suppression." The Census CBP glossary defines **N as "Not available
or not comparable"** — a data-availability symbol. The disclosure-withholding
flags are **D** ("Withheld to avoid disclosing data for individual companies")
and **S** ("Withheld because estimate did not meet publication standards").
The operational rule is unchanged — an N cell is never zero and the ten DFW
establishments outside the named bands remain outside them — but the attribution
to disclosure was wrong per the issuing body and is retired. `market-data.mjs`
message text corrected 2026-08-03; runs 06 and 09 carry the old wording and this
entry supersedes it.

**D.2 — The $5.0–5.5M Roto-Rooter revenue figure. CITATION CORRECTED.** The
figure is real and exact, but it does **not** appear in the 2026-04-01
acquisition release, where prior files implied it lived. It appears in Chemed's
Q1 earnings release, filed as Exhibit 99 to the 8-K of 2026-04-23 (CIK
0000019584, accession 0000019584-26-000010): *"These two acquisitions are
anticipated to add $5.0 million to $5.5 million of revenue for the remainder of
2026."* Cite the 8-K exhibit, not the acquisition release.

**D.3 — DynaTen's Fort Worth attribution. CITATION CORRECTED.** Comfort Systems'
own companies page (`/our-companies/` — the `/operating-companies/` path 404s)
shows logos with no cities. The Fort Worth attribution rests on dynaten.com
itself: "4375 Diplomacy Road Fort Worth, TX 76155", footer "© 2026 Comfort
Systems USA". The claim stands; the correct citation is the brand site.

Minor notes, no correction needed: Wrench renders Berkeys' location "Dallas/Grape
Vine" (two words); Texas Chiller Systems' HQ is San Antonio with Farmers Branch
as the DFW branch; Apex's release adds "has served over 16 million homes."

## E · What this pass does NOT establish

- **Derived figures are not verifiable, by construction.** The ≈$8.4B market,
  the $3.6–6.4B band, the 8.5–22.6% share and the ≈$2–6B residual are
  derivations. This pass verified their **inputs** (all confirmed above) and
  their arithmetic (recomputed independently). The assumptions remain
  assumptions and are registered in run 09's `## Derivations`.
- **Employer-reported headcounts are verified as *stated*, not as *true*.**
  Baker Brothers' 400 and Berkeys' 195 are Energage/Top Workplaces
  employer-reported figures. The pages say what we claim they say; no
  independent census of either company exists.
- **32 of 37 franchise locations were not individually re-checked** — five were
  spot-checked and all five held.
- **The Apex gap, the 22 unsized platform locations, and the service-vs-new-
  construction split are unchanged** — verified as unknown, which is different
  from resolved.
- **`audit.mts` has still not run.** There is nothing yet for it to audit — no
  master section or derived document has been synthesized from this research.
  When one is, this file is a source it checks against.

## Sources

Consolidated above per-claim. Issuing bodies reached directly: whitehouse.gov
(OMB), tdlr.texas.gov, sec.gov (EDGAR), census.gov glossary and layout index,
apollo.com, businesswire.com, globenewswire.com, prnewswire.com, and eighteen
company sites. Statutes via two agreeing reproductions of the official text
(law.justia.com; texas.public.law) — the Legislature's own site is not fetchable
by an automated tool and this is recorded rather than papered over.

## What we don't know yet

Unchanged from run 09, and restated so this file can stand alone: what Apex owns
in DFW; employee bands for 22 of 26 platform locations; the service-vs-new-
construction split; whether receipts-per-employee is flat across size bands; how
many of the 37 franchise businesses share an owner.
