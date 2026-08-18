<!-- run: 12 | hunt: B | date: 2026-08-03
     query: EC2223KOB kind-of-business cuts and CBP-based allocations for the
            remaining home-services trades; garage-door NAICS mapping
     tool: market-data.mjs (kob, allocate) over the files on disk; awk for the
           CONKB 8351 distribution -->

# The adjacent trades — dollar cuts, and the garage-door mapping settled

All from the two federal files already on disk. Bands for these trades were
seeded in run 08; this run adds the dollar side and closes the NAICS question
run 08 flagged.

## 1. Texas receipts by trade (2022 Economic Census, measured)

| NAICS | Trade | TX receipts | Core kind-of-business share |
|---|---|---|---|
| 238210 | Electrical contractors | **$22.943B** | Electric power installation and service 68.1% ($15.614B); telecom 7.1%; fire and security systems 6.1%; highway/street lighting 5.9% |
| 238160 | Roofing contractors | **$6.970B** | Roofing contractor 94.5% ($6.587B) — the cleanest single-trade code in the sector |
| 238350 | Finish carpentry | **$2.760B** | **Garage door and overhead door installation, residential-type: $323,368k** |
| 238290 | Other building equipment | **$3.584B** | Elevator and escalator 43.2%; millwright 21.6%; boiler/pipe/duct insulation 17.0% |

## 2. The garage-door mapping — settled

Run 08 flagged that garage doors do not map cleanly to a NAICS code. The
kind-of-business file answers it: CONKB 8351 (*garage door and overhead door
installation contractor, residential-type*) appears across eleven 6-digit codes,
and the distribution is decisive —

- US: **$2,668,725k of the $2,947,779k total sits in NAICS 238350** (finish
  carpentry) — 90.5%. The remainder scatters ($175M in 238290, $54M in 238310,
  under $1M in 238220).
- Texas: **$323,368k of $329,254k in 238350** — 98.2%.

**Garage doors are a kind-of-business inside 238350**, not a code of their own
and not 238290 (which is elevators and millwrights). Any DFW garage-door
universe therefore sits inside the metro's 391 finish-carpentry establishments
(run 08), mixed with actual finish carpenters, and a garage-door-specific count
cannot be extracted from CBP. Texas garage-door receipts are measured at
$323,368k; a DFW figure would be double-derived and is not computed.

## 3. DFW allocations (derived — same method and caveats as run 07)

| NAICS | Trade | DFW share of TX payroll | Payroll-basis receipts | Range across bases | Spread |
|---|---|---|---|---|---|
| 238210 | Electrical | 29.99% | **$6.880B** | $6.189–6.880B | 11% |
| 238160 | Roofing | **39.58%** | **$2.759B** | $2.667–2.759B | **3%** |
| 238350 | Finish carpentry | 30.62% | $0.845B | $0.792–0.845B | 7% |

Two things stand out and both are findings:

**DFW carries 39.58% of Texas roofing payroll** — against 32.87% of
plumbing/HVAC and 29.99% of electrical. The metro is overweight roofing relative
to its size, consistent with North Texas hail exposure driving a
storm-restoration industry.

**The roofing allocation is the most defensible in the set.** The three bases
agree within 3% (versus 21% for 238220), so the derived $2.759B carries a far
smaller assumption than the HVAC figure does.

## 4. The pest dollar side — one download, better geography

Pest control (561710) is NAICS 56, not construction — and sector 56 publishes at
**"U.S., States, and Selected Geographies"**, i.e. below state level. The file:

`https://www2.census.gov/programs-surveys/economic-census/data/2022/sector56/EC2256BASIC.zip`

When downloaded, pest becomes the one house trade with a **measured** metro
revenue figure — no allocation, no assumption. Until then its DFW dollar side is
payroll only ($0.206B, run 08).

## Derivations

| Figure | Inputs | Arithmetic | Assumption |
|---|---|---|---|
| $6.880B DFW electrical receipts | TX 238210 receipts $22.943B; DFW payroll share 29.99% (CBP 2023) | multiplication | DFW's receipts-per-payroll ratio matches Texas. Range $6.189–6.880B; both ends carried. |
| $2.759B DFW roofing receipts | TX 238160 receipts $6.970B; DFW payroll share 39.58% | multiplication | Same assumption; the three bases agree within 3%, the tightest in the study. |
| $0.845B DFW finish-carpentry receipts | TX 238350 receipts $2.760B; DFW payroll share 30.62% | multiplication | Same; carried mainly as the host code for garage doors. |

## Sources

- EC2223KOB.dat (2022 Economic Census, sector 23) and cbp23co.txt (CBP 2023) —
  both on disk, provenance in runs 06–07
- https://www.census.gov/data/tables/2022/econ/economic-census/naics-sector-56.html
  (EC2256BASIC listing, fetched 2026-08-03)

## What we don't know yet

- DFW garage-door establishment count — inseparable from finish carpentry in CBP.
- Pest metro receipts — one download away.
- Whether electrical's 68.1% core share holds in DFW (the code's telecom and
  fire-security lines may skew differently in a data-center metro).
