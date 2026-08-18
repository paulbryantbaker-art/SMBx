<!-- run: 20 | hunt: B | date: 2026-08-03
     query: EC2256BASIC (sector 56), EC2223VALCON, EC2223LOCCONS — supplied by
            Paul, read directly
     tool: python over the flat files
     coverage: closes the pest dollar side (MEASURED); closes the service-split
               question as confirmed-unpublished; adds a second federal program
               under the study's denominators -->

# Pest metro receipts, measured — and two questions closed

## 1. The headline: DFW pest control is a measured metro market

The 2022 Economic Census publishes NAICS 56 below state level. For
**exterminating and pest control services (561710), Dallas–Fort Worth–Arlington
MSA, 2022**:

| Geography | Firms | Estabs | Receipts | Annual payroll | Employees |
|---|---|---|---|---|---|
| **DFW MSA** | **344** | **397** | **$585,099k — $585.1M** | $206,861k | 4,352 |
| — Dallas–Plano–Irving MD | 238 | 269 | $410,281k | $145,165k | 3,144 |
| — Fort Worth–Arlington–Grapevine MD | 117 | 128 | $174,818k | $61,696k | 1,208 |
| Texas | 1,323 | 1,495 | $1,779,177k | $628,665k | 13,420 |
| United States | 13,928 | 16,402 | $19,895,993k | $7,199,152k | 147,561 |

County detail (published rows): Dallas $227,718k · Tarrant $159,237k · Collin
$88,382k · Denton $79,306k · Johnson $9,136k · Ellis $8,066k · Rockwall $2,848k;
Hunt, Kaufman and Parker suppressed (flag D). The two Metro Divisions sum to the
MSA total exactly ($410,281k + $174,818k = $585,099k), and the published county
rows plus the three suppressed counties reconcile to it — the file is internally
consistent.

**This is the only house trade with a measured metro revenue figure**, and DFW
pest is 32.9% of the Texas pest market on receipts — the same one-third-of-Texas
share the metro holds in plumbing-and-HVAC payroll.

## 2. The cross-check that makes the whole study stronger

Two independent federal programs now sit under the pest universe:

| Measure | Economic Census 2022 | CBP 2023 |
|---|---|---|
| DFW establishments | 397 | 396 |
| DFW annual payroll | $206,861k | $206,366k |
| DFW employment | 4,352 | 3,954 |

Establishments and payroll agree within a rounding error across different
programs and vintages. (Employment differs ≈10% — the EC measures a March-12
pay period of the census year against CBP's 2023 count; noted, not reconciled.)

Same at state level for the core trade: LOCCONS (EC 2022) counts **8,971** Texas
238220 establishments against CBP 2023's 8,909, and the full-year size
distribution tracks CBP nearly band for band (<5: 3,695 · 5–9: 1,711 · 10–19:
992 · 20–49: 615 · 50–99: 202 · 100–249: 98). **The denominators in this study
now rest on two federal programs, not one.**

## 3. The service-split question — closed as confirmed unpublished

EC2223VALCON's `CONSTA` dimension is *"Location of Construction Work by State
Code"* — a state-by-state matrix of where work was performed (TX 238220 total
$24,752,931k of construction work, with small out-of-state lines to Arizona,
Arkansas, California, Colorado and others). **It does not split new construction
from service and repair.** That was the last unpulled sector-23 table that could
have; the split is now *confirmed unpublished* in every public geography, not
merely unfound. Every underwriting model on these trades carries it as an
assumption, ours included — ours says so.

(One figure for the file: VALCON's $24.75B of Texas 238220 *construction work*
against KOB's $25.42B of *total receipts* — the ≈$0.67B difference is
non-construction activity inside the code, consistent with KOB's secondary-
activity lines.)

## Derivations

| Figure | Inputs | Arithmetic | Assumption |
|---|---|---|---|
| 32.9% — DFW share of TX pest receipts | $585,099k ÷ $1,779,177k | division | none — both measured |

## Sources

- EC2256BASIC.dat — 2022 Economic Census, sector 56, "Summary Statistics for
  the U.S., States, and Selected Geographies", from
  https://www2.census.gov/programs-surveys/economic-census/data/2022/sector56/EC2256BASIC.zip
- EC2223VALCON.dat — https://www2.census.gov/programs-surveys/economic-census/data/2022/sector23/EC2223VALCON.zip
- EC2223LOCCONS.dat — https://www2.census.gov/programs-surveys/economic-census/data/2022/sector23/EC2223LOCCONS.zip
- All supplied 2026-08-03 and read directly; CBP comparators from run 06/08.

## What we don't know yet

- Hunt, Kaufman and Parker county pest detail (suppressed).
- The EC-vs-CBP pest employment gap (vintage and reference-period, unreconciled).
- Service vs new construction — now **confirmed unpublished**; permanently an
  assumption unless a trade association measures it.
