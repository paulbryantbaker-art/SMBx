<!-- run: 07 | hunt: B | date: 2026-08-01
     query: 2022 Economic Census EC2223KOB — Construction: Value of Business
            Done for Kind-of-Business, NAICS 238220, Texas and US
     tool: direct read of the Census flat file supplied by Paul
     coverage rows: 3 (dollars), 4 (the 238220 split) -->

# Receipts, and the 238220 split measured

**Provenance.** `EC2223KOB.dat`, the 2022 Economic Census *Construction: Value of
Business Done for Kind-of-Business for the U.S., Regions, and States*, supplied
by Paul on 2026-08-01 and read directly. Paired with CBP 2023 payroll from run 06.

**Geography, settled.** This table publishes at US, region and state only —
confirmed from `api.census.gov/data/2022/ecnkob/geography.html`, which lists
levels `010`, `020` and `040` and nothing below. There is no county or metro
figure for construction receipts to be had. That is why what follows is a
derivation and is labelled as one throughout.

---

## 1. The measured figures

| | NAICS 238220 receipts, 2022 |
|---|---|
| United States | **$297.609B** |
| Texas | **$25.418B** — 8.5% of the US |

Against CBP 2023 for the same code: Texas has **8,909 establishments, 105,086
employees and $7.355B of annual payroll** across 173 counties, with no statewide
aggregate row to double-count.

## 2. The 238220 split — measured, not assumed

**This is the run that cracks the soft spot.** The `CONKB` kind-of-business field
splits receipts inside 238220. For Texas:

| Kind of business | Receipts | Share of 238220 |
|---|---|---|
| **Heating, ventilation and air-conditioning contractor (HVAC)** | **$8.710B** | **34.3%** |
| **Plumbing contractor** | **$8.333B** | **32.8%** |
| Mechanical contractor | $4.492B | 17.7% |
| Building sprinkler system installation | $0.717B | 2.8% |
| All other construction activity | $0.711B | 2.8% |
| Electric power installation and service | $0.652B | 2.6% |
| Steam and pipe fitting | $0.512B | 2.0% |
| Refrigeration contractor | $0.453B | 1.8% |
| Other business activities secondary to construction | $0.365B | 1.4% |
| Lawn sprinkler installation | $0.180B | 0.7% |
| *(listed subtotal)* | *$25.128B* | *98.9%* |

**Split one of the three — HVAC versus plumbing — is now a measured figure.**
Every prior run had to carry it as an assumption or route around it via the
separate Texas licensing agencies. The Census measures it directly: HVAC is
roughly a third of 238220 revenue, plumbing roughly another third, and mechanical
contracting a further sixth.

**Split two is partly cut too.** *Mechanical contractor* at 17.7% is
commercial-leaning by definition, as are building sprinkler, steam and pipe
fitting and refrigeration. Together those four are **24.3%** of 238220 revenue
and are largely outside a residential thesis. Combined with the TDLR Class A/B
statutory capacity limit from run 05, the residential boundary is now drawn from
two independent regulatory and statistical sources rather than from judgement.

**Split three — service versus new construction — remains untouched by any source
in this hunt.** It is the one that is still an assumption, and it should be
stated as such wherever it matters.

## 3. DFW receipts — derived, three ways, and they disagree

Census publishes no metro figure, so DFW receipts must be allocated from the
Texas total. Three defensible bases, all using CBP 2023:

| Allocation basis | DFW share of Texas | Implied DFW 238220 receipts |
|---|---|---|
| **Annual payroll** | 32.87% | **$8.356B** |
| Employment | 30.43% | $7.735B |
| Establishment count | 27.07% | $6.882B |

**They span $6.9B to $8.4B, and no midpoint is taken.** Per the citation law,
conflicting values are carried at both ends.

**Payroll is the preferred basis** and the figure to carry forward is **$8.356B**,
for a stated reason: establishment count is the worst possible allocator here
because 74.5% of DFW establishments have fewer than ten employees, so a count
weights a one-truck shop equally with a 200-person mechanical contractor. Payroll
tracks revenue more closely than either alternative. That the three methods
disagree by 21% is itself the finding — it is the size of the assumption.

**Applying the Texas kind-of-business mix**, DFW HVAC-specific revenue is
**≈$2.863B** and plumbing **≈$2.740B**. That carries a second assumption on top
of the first: that DFW's trade mix matches the state's. DFW is more urban and
more commercial than Texas as a whole, which if anything shifts the mix toward
mechanical contracting and away from residential HVAC.

## 4. An independent check on a figure the master already carries

Texas 238220 receipts per employee: **$241,879** (2022 receipts over 2023
employment).

The master's §4.1 valuation framework carries *"revenue per total employee:
platform math converges on ≈$180K–$271K/employee"*, derived from Apex, Redwood
and Champions disclosures. **The Census figure lands inside that range**, from a
completely independent basis — a government census of the industry rather than
arithmetic on three platform press reports.

That is worth recording. It does not verify the platform figures, but it is the
first primary-source corroboration the master's per-employee benchmark has had.

## Derivations

| Figure | Inputs | Arithmetic | Assumption |
|---|---|---|---|
| **$8.356B** — DFW MSA 238220 receipts | Texas 238220 receipts $25,418,099k (2022 Economic Census, EC2223KOB); DFW 238220 payroll $2,417,736k and Texas 238220 payroll $7,354,548k (CBP 2023) | 2,417,736 ÷ 7,354,548 = 32.87%; × $25,418,099k | That DFW's receipts-per-payroll-dollar ratio matches the Texas average. Census publishes no sub-state construction receipts, so this cannot be checked. Two vintages are mixed — 2022 receipts against 2023 payroll — which a share-based allocation largely but not wholly cancels. The employment-share and establishment-share alternatives give $7.735B and $6.882B; the spread is the size of the assumption. |
| **≈$2.863B** — DFW HVAC-specific revenue | $8.356B above × 34.3% | The Texas HVAC share of 238220 receipts applied to the DFW total | Both the assumption above **and** that DFW's kind-of-business mix matches Texas's. DFW is more urban and commercial than the state average, which would shift mix away from residential HVAC. Compounding two assumptions — treat as an order of magnitude. |
| **24.3%** — commercial-leaning share of Texas 238220 receipts | Mechanical 17.7% + building sprinkler 2.8% + steam and pipe fitting 2.0% + refrigeration 1.8% | Sum | That these four kind-of-business categories are predominantly non-residential. Definitional, not measured. |

## Sources

- U.S. Census Bureau, 2022 Economic Census, **EC2223KOB** — *Construction: Value
  of Business Done for Kind-of-Business for the U.S., Regions, and States*,
  `EC2223KOB.dat`, retrieved from
  https://www2.census.gov/programs-surveys/economic-census/data/2022/sector23/EC2223KOB.zip
- Geography confirmation: https://api.census.gov/data/2022/ecnkob/geography.html
- U.S. Census Bureau, County Business Patterns 2023, Complete County File — see
  run 06
- Master §4.1, for the per-employee benchmark compared in §4 above

## What we don't know yet

- **DFW receipts as a measured figure.** Not published, and it will not be —
  construction stops at state level in the Economic Census.
- **Whether DFW's kind-of-business mix matches Texas's.** Unmeasurable from
  published data.
- **Service versus new construction.** Split three, still untouched. The
  recurring-revenue logic the whole thesis rests on lives in service and
  replacement, and no source in this hunt separates it.
- **Receipts by establishment size band.** The Economic Census publishes receipts
  by kind-of-business and by state, not by employment size class, so the dollar
  side cannot be banded the way run 06 banded establishments. **The headline share
  therefore stays an establishment share, not a dollar share.**
