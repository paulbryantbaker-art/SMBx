<!-- run: 18 | hunt: B | date: 2026-08-03
     query: CBP 2023 NAICS 238220 totals for the other three big Texas MSAs,
            OMB 23-01 delineations confirmed from the bulletin PDF
     tool: market-data.mjs bands over cbp23co.txt; one OMB fetch -->

# The four Texas metros — 238220, measured

Context table for the DFW report and the scope decision of 2026-08-03. All
figures Census CBP 2023, counties per OMB Bulletin 23-01.

| MSA (CBSA) | Counties | Estabs | Employment | Annual payroll | Avg emp/estab | Share of TX 238220 payroll |
|---|---|---|---|---|---|---|
| Dallas–Fort Worth–Arlington (19100) | 11 | **2,412** | 31,980 | **$2.418B** | 13.3 | **32.9%** |
| Houston–Pasadena–The Woodlands (26420) | 10 — Austin, Brazoria, Chambers, Fort Bend, Galveston, Harris, Liberty, Montgomery, San Jacinto, Waller | **1,909** | 25,783 | **$1.906B** | 13.5 | 25.9% |
| Austin–Round Rock–San Marcos (12420) | 5 — Bastrop, Caldwell, Hays, Travis, Williamson | **825** | 12,459 | **$0.961B** | 15.1 | 13.1% |
| San Antonio–New Braunfels (41700) | 9 — Atascosa, Bandera, Bexar, Comal, Guadalupe, Kendall, Kerr, Medina, Wilson | **822** | 8,927 | **$0.563B** | 10.9 | 7.7% |
| **Four metros combined** | 35 | **5,968 of 8,909 (67.0%)** | 79,149 of 105,086 | **$5.848B of $7.355B (79.5%)** | — | **79.5%** |

Texas totals from run 06 (8,909 establishments, 105,086 employees, $7,354,548k
payroll). Shares are division; no assumption.

**What this is for.** The DFW report carries this table as measured Texas
context. It is NOT an ownership map — the platform numerator exists only for
DFW; Houston, Austin and San Antonio ownership passes have not been run, and
nothing here supports a claim about who owns what in those metros.

**What it already shows.** The big four hold four-fifths of the state's
HVAC-and-plumbing payroll; DFW alone is the largest at a third, 27% bigger than
Houston. Austin runs the largest average establishment (15.1 employees); San
Antonio the smallest (10.9).

## Sources
- https://www.whitehouse.gov/wp-content/uploads/2023/07/OMB-Bulletin-23-01.pdf
  (Houston, San Antonio and Austin MSA delineations, quoted 2026-08-03)
- cbp23co.txt — Census CBP 2023 Complete County File (provenance in run 06)

## What we don't know yet
- Everything numerator-side for Houston, Austin and San Antonio: platform
  locations, franchise counts, licence-registry cuts. Each needs its own runs
  01–05-equivalent before any ownership claim.
