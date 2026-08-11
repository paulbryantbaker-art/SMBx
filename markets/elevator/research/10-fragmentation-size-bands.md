<!-- run: 10 | hunt: B | date: 2026-08-11
     query: https://data.census.gov/api/access/data/table?id=CBP2022.CB2200CBP&g=010XX00US&y=2022  (filter: NAICS2017=23, LFO=001, all EMPSZES)
            https://data.census.gov/api/access/data/table?id=ECNLOCCONS2022.EC2223LOCCONS&g=010XX00US&y=2022  (filter: NAICS2022 in {23, 2382, 238210}, all EMPSZFE)
            https://data.census.gov/api/access/data/table?id=ECNLOCCONS2022.EC2223LOCCONS&g=0400000US06&y=2022  (filter: NAICS2022=238290, California)
            https://data.census.gov/api/access/data/table?id=ECNSIZE2022.EC2200SIZEEMPEST&g=010XX00US&y=2022  (filter: NAICS2022=23)
     tool: Census/BLS bulk file download + parse -->

# NAICS 238290 — establishments by employment size band

## VERDICT: STILL EMPTY for 238290 itself. FILLED for its parent 2382, its sibling 238210, and all-construction.

The single number this run was sent to get — establishment counts by employment
size class for **NAICS 238290, US, 2022** — was **not obtained**. No fabricated
or reconstructed substitute is recorded below. What *was* obtained, verified,
and is safe to use is the containing subsector 2382, the sibling 238210, the
derived 238220+238290 residual, and all-construction on two independent
methodologies.

---

## READ THIS FIRST: 238290 IS A CONTAINER CODE

**NAICS 238290 "Other Building Equipment Contractors" is not the elevator
trade.** It is the residual bucket of NAICS 2382, and its illustrative examples
include **vending machine installation, ATM installation, bowling alley
equipment installation, and church bell installation** alongside elevator and
escalator work.

Per the brief for this run, **BLS OEWS puts elevator and escalator installers
and repairers at ≈13.90% of 238290 employment.** *(Carried from the run brief.
NOT verified in this run — see the access log; bls.gov was unreadable from this
session. Treat as unconfirmed.)*

**Therefore: any fragmentation statistic read off 238290 describes the
container, not the elevator trade.** A "% of establishments under 5 employees"
computed on this code is a statement about vending-machine and ATM installers as
much as about elevator companies.

**What a 238290 size table can support:** an order-of-magnitude sense of how a
residual building-equipment code is structured; a *ceiling* on the number of
acquirable elevator establishments.
**What it cannot support:** a count of acquirable elevator companies; a
fragmentation claim about the elevator trade; any per-establishment revenue or
headcount figure attributed to elevator contractors. Do not put a 238290
fragmentation number on a page next to the word "elevator."

---

## 1. The target table — NOT OBTAINED

| Employment size class | Establishments | % of total |
|---|---|---|
| *(NAICS 238290, US, 2022 — not retrieved)* | — | — |

**Why it is empty, precisely.** Every keyless route to a 6-digit CBP or Economic
Census size table was tried and each failed at a specific, reproducible point:

1. **`api.census.gov` (CBP 2022 and Economic Census) — key-mandatory.** Re-tested
   this run from a different egress IP. Response body: *"A valid key must be
   included with each data API request."* Confirmed, not worked around.
2. **`www2.census.gov` bulk files (`cbp22us.zip`, the record layout, and
   `us_state_naics_detailedsizes_2022.xlsx`) — unreachable twice over.** The
   session's egress proxy answers **403 to CONNECT** for `www2.census.gov`,
   `www.census.gov`, `data.census.gov`, `data.bls.gov` and `www.bls.gov`
   (only GitHub and PyPI hosts are permitted). The independent page-fetch route
   is refused by **robots.txt** for `www2.census.gov` and `data.bls.gov`. So the
   ZIP/XLSX files could not be downloaded, unzipped or parsed at all. **BLS QCEW
   size-class data was blocked by the same two mechanisms** and no cross-check
   from a second methodology was possible.
3. **`data.census.gov`'s keyless table endpoint — reachable, but it will not
   filter and it truncates.** It accepts `id`, `g`, `y`; it silently **ignores**
   `n=`, `n=N0600.238290`, `nkd=`, `NAICS2022=`, and rejects `INDLEVEL=`,
   `offset=`, `page=`, `sort=` with 400/403. It returns the whole table, and the
   response for `EC2223LOCCONS` at US level **cuts off after NAICS 238210** —
   roughly fifty rows short of 238290. Verified by five independent reads, all
   of which independently reported the last visible code as `238210`.
4. **`EC2223BASIC` (the 7,725 reconciliation table) — reachable and complete, but
   unparseable through this channel.** It carries **151 columns**; positional
   reads of it failed their own arithmetic control every time (children did not
   sum to the parent), so **no value from EC2223BASIC is recorded in this
   document** — including the establishment count for 238290.

**Two figures were produced during this run and then discarded as
confabulations**, and are named here so they are recognisable if they resurface:
a 238290 count of **37,894** and a 238220 count of **122,826**. Both came from
the truncated region of the response. Both were rejected because
238210 + 238220 + 238290 must equal 2382 (203,401) and neither combination does,
and because California alone reports only 732 establishments in 238290 (below),
which is irreconcilable with a US total of 37,894. **Neither number is real. Do
not use either.**

---

## 2. What IS verified — NAICS 2382 and 238210, US, 2022

**Source: 2022 Economic Census, table `EC2223LOCCONS`** ("Construction: Location
of Construction Establishments by Employment Size for the U.S. and States:
2022"), API dataset `2022/ecnloccons`, table ID on data.census.gov
`ECNLOCCONS2022.EC2223LOCCONS`. Geography `0100000US` (United States).
Variable `ESTAB` = "Number of establishments"; size variable `EMPSZFE`.
**Band definitions are the source's own and are reproduced verbatim.**

Note the structure: the size bands cover only establishments **operated for the
entire year**. Establishments *not* operated the entire year are reported as a
single line with no size detail.

### NAICS 2382 — Building Equipment Contractors (the parent of 238290)

| EMPSZFE | Size class (source wording) | Establishments | % of entire-year |
|---|---|---:|---:|
| 001 | All establishments | 203,401 | — |
| 100 | Establishments operated for the entire year | 167,779 | 100.00% |
| 210 | Establishments operated entire year with less than 5 employees | 88,238 | 52.59% |
| 215 | Establishments operated entire year with 5 to 9 employees | 34,457 | 20.54% |
| 220 | Establishments operated entire year with 10 to 19 employees | 22,690 | 13.52% |
| 225 | Establishments operated entire year with 20 to 49 employees | 14,755 | 8.79% |
| 230 | Establishments operated entire year with 50 to 99 employees | 4,586 | 2.73% |
| 235 | Establishments operated entire year with 100 to 249 employees | 2,318 | 1.38% |
| 245 | Establishments operated entire year with 250 to 499 employees | 496 | 0.30% |
| 250 | Establishments operated entire year with 500 employees or more | 239 | 0.14% |
| 500 | Establishments not operated for the entire year | 35,622 | — |

*Control: 88,238+34,457+22,690+14,755+4,586+2,318+496+239 = **167,779** = the
entire-year line, exactly. 167,779 + 35,622 = **203,401** = all establishments,
exactly.*

### NAICS 238210 — Electrical Contractors and Other Wiring Installation Contractors

| EMPSZFE | Size class | Establishments | % of entire-year |
|---|---|---:|---:|
| 001 | All establishments | 81,249 | — |
| 100 | Operated for the entire year | 67,642 | 100.00% |
| 210 | Entire year, less than 5 employees | 35,717 | 52.80% |
| 215 | Entire year, 5 to 9 employees | 13,783 | 20.38% |
| 220 | Entire year, 10 to 19 employees | 8,945 | 13.22% |
| 225 | Entire year, 20 to 49 employees | 5,976 | 8.83% |
| 230 | Entire year, 50 to 99 employees | 1,892 | 2.80% |
| 235 | Entire year, 100 to 249 employees | 988 | 1.46% |
| 245 | Entire year, 250 to 499 employees | 211 | 0.31% |
| 250 | Entire year, 500 employees or more | 130 | 0.19% |
| 500 | Not operated for the entire year | 13,607 | — |

*Control: bands sum to **67,642**, exactly; +13,607 = **81,249**, exactly. Two
independent reads returned identical figures.*

### DERIVED: NAICS 238220 + 238290 combined (the residual of 2382)

2382 has exactly three six-digit children — 238210, 238220, 238290 — so
subtracting the verified 238210 from the verified 2382 gives the combined
238220 + 238290 exactly. **This is the closest verified quantity to the target
and it is an upper bound on 238290 in every band.**

| Size class | 2382 | − 238210 | = 238220 + 238290 |
|---|---:|---:|---:|
| All establishments | 203,401 | 81,249 | **122,152** |
| Operated entire year | 167,779 | 67,642 | **100,137** |
| Less than 5 employees | 88,238 | 35,717 | **52,521** |
| 5 to 9 employees | 34,457 | 13,783 | **20,674** |
| 10 to 19 employees | 22,690 | 8,945 | **13,745** |
| 20 to 49 employees | 14,755 | 5,976 | **8,779** |
| 50 to 99 employees | 4,586 | 1,892 | **2,694** |
| 100 to 249 employees | 2,318 | 988 | **1,330** |
| 250 to 499 employees | 496 | 211 | **285** |
| 500 employees or more | 239 | 130 | **109** |
| Not operated entire year | 35,622 | 13,607 | **22,015** |

*Control: residual bands sum to **100,137**, exactly; +22,015 = **122,152**,
exactly.*

**238220 is Plumbing, Heating, and Air-Conditioning Contractors and dominates
this residual.** 238290's true share of it is unknown from this run. The residual
is therefore a ceiling, not an estimate.

### State-level anchor: NAICS 238290, California, 2022

Same table, geography `0400000US06`. Retrieved successfully because state rows
are shorter and the response reached 238290.

| EMPSZFE | Size class | Establishments |
|---|---|---:|
| 001 | All establishments | 732 |
| 100 | Operated entire year | 627 |
| 210 | Less than 5 employees | 281 |
| 215 | 5 to 9 employees | 117 |
| 220 | 10 to 19 employees | 98 |
| 225 | 20 to 49 employees | 75 |
| 230 | 50 to 99 employees | 33 |
| 235 | 100 to 249 employees | 17 |
| 245 | 250 to 499 employees | withheld (flag `D`) |
| 250 | 500 or more | not published |
| 500 | Not operated entire year | 105 |

*Control: 281+117+98+75+33+17 = 621; the entire-year line is 627, leaving 6
establishments across the two withheld top bands. 627 + 105 = 732, exactly.*

**This is one state and must not be grossed up.** It is recorded because it is
the evidence that killed the 37,894 confabulation: California is a large share
of US construction, and 732 establishments here is consistent with a US total in
the **single-digit thousands**, not the tens of thousands.

---

## 3. All-construction comparison — NAICS 23, two methodologies

### 3a. County Business Patterns 2022, table `CB2200CBP`

Vintage **CBP 2022**; **codes are `NAICS2017`, not NAICS2022** — CBP 2022 is
published on the 2017 NAICS basis. Filter `NAICS2017=23`, `LFO=001`,
all `EMPSZES`. **CBP publishes establishments, employment and payroll by
employment-size class — it does not publish receipts. No revenue figure in this
document is attributed to CBP.**

| EMPSZES | Size class (source wording) | Establishments | % of total |
|---|---|---:|---:|
| 001 | All establishments | 800,651 | 100.00% |
| 210 | Establishments with less than 5 employees | 527,420 | 65.87% |
| 220 | Establishments with 5 to 9 employees | 126,815 | 15.84% |
| 230 | Establishments with 10 to 19 employees | 74,494 | 9.30% |
| 241 | Establishments with 20 to 49 employees | 47,853 | 5.98% |
| 242 | Establishments with 50 to 99 employees | 14,799 | 1.85% |
| 251 | Establishments with 100 to 249 employees | 7,063 | 0.88% |
| 252 | Establishments with 250 to 499 employees | 1,534 | 0.19% |
| 254 | Establishments with 500 to 999 employees | 488 | 0.06% |
| 260 | Establishments with 1,000 employees or more | 185 | 0.02% |

*Control: bands sum to **800,651**, exactly.*

For scale, the same table's all-sector US totals (NAICS 00): 8,298,562
establishments; under 5 employees 4,626,130; 5–9 1,461,672; 10–19 1,032,118;
20–49 742,266; 50–99 241,410; 100–249 134,687; 250–499 37,470; 500–999 13,850;
1,000+ 8,959. *Control: sums to 8,298,562, exactly.*

### 3b. Economic Census 2022, `EC2223LOCCONS`, NAICS 23

| EMPSZFE | Size class | Establishments | % of entire-year |
|---|---|---:|---:|
| 001 | All establishments | 803,120 | — |
| 100 | Operated for the entire year | 628,833 | 100.00% |
| 210 | Entire year, less than 5 employees | 372,428 | 59.23% |
| 215 | Entire year, 5 to 9 employees | 112,684 | 17.92% |
| 220 | Entire year, 10 to 19 employees | 72,338 | 11.50% |
| 225 | Entire year, 20 to 49 employees | 47,057 | 7.48% |
| 230 | Entire year, 50 to 99 employees | 14,784 | 2.35% |
| 235 | Entire year, 100 to 249 employees | 7,222 | 1.15% |
| 245 | Entire year, 250 to 499 employees | 1,598 | 0.25% |
| 250 | Entire year, 500 or more | 722 | 0.11% |
| 500 | Not operated for the entire year | 174,287 | — |

*Control: bands sum to **628,833**, exactly; +174,287 = **803,120**, exactly.
Hierarchy control: 236 (249,607) + 237 (37,793) + 238 (515,720) = **803,120**,
exactly.*

### 3c. The three construction totals do not agree, and should not be forced to

| Figure | Source | Table |
|---|---:|---|
| 800,651 | County Business Patterns 2022 | `CB2200CBP` |
| 803,120 | Economic Census 2022 | `EC2223LOCCONS` |
| 785,917 | Economic Census 2022 | `EC2200SIZEEMPEST` |

Three different establishment universes and reference periods. CBP counts
establishments active in the March reference period; the Economic Census counts
establishments in operation during the year; and the location-of-establishments
tabulation differs again from the size-of-establishments tabulation *within* the
same Economic Census. The spread is about 2%. **They are not reconciled here and
must not be presented as one number.**

---

## 4. Share under 5, under 10, under 20 employees — arithmetic shown

**NAICS 238290: NOT COMPUTABLE.** The band counts were not obtained.

**Closest verified proxy — NAICS 2382 (Building Equipment Contractors),
Economic Census 2022, as a share of the 167,779 establishments operated the
entire year:**

- **Under 5:** 88,238 ÷ 167,779 = **52.59%**
- **Under 10:** (88,238 + 34,457) = 122,695 ÷ 167,779 = **73.13%**
- **Under 20:** (122,695 + 22,690) = 145,385 ÷ 167,779 = **86.65%**

**Sibling — NAICS 238210 (Electrical), of 67,642 entire-year establishments:**

- **Under 5:** 35,717 ÷ 67,642 = **52.80%**
- **Under 10:** (35,717 + 13,783) = 49,500 ÷ 67,642 = **73.18%**
- **Under 20:** (49,500 + 8,945) = 58,445 ÷ 67,642 = **86.40%**

**Derived residual — 238220 + 238290, of 100,137 entire-year establishments
(upper bound on 238290's counts, not its shares):**

- **Under 5:** 52,521 ÷ 100,137 = **52.45%**
- **Under 10:** (52,521 + 20,674) = 73,195 ÷ 100,137 = **73.10%**
- **Under 20:** (73,195 + 13,745) = 86,940 ÷ 100,137 = **86.82%**

**All construction, NAICS 23 — CBP 2022, of 800,651 total establishments:**

- **Under 5:** 527,420 ÷ 800,651 = **65.87%**
- **Under 10:** (527,420 + 126,815) = 654,235 ÷ 800,651 = **81.71%**
- **Under 20:** (654,235 + 74,494) = 728,729 ÷ 800,651 = **91.02%**

**All construction, NAICS 23 — Economic Census 2022, of 628,833 entire-year:**

- **Under 5:** 372,428 ÷ 628,833 = **59.23%**
- **Under 10:** (372,428 + 112,684) = 485,112 ÷ 628,833 = **77.14%**
- **Under 20:** (485,112 + 72,338) = 557,450 ÷ 628,833 = **88.65%**

**The comparison that matters, and it survives the missing row.** Building
equipment contractors are **markedly less atomised than construction at large**:
**52.59% under 5 employees versus 65.87%** on CBP (or 59.23% on the Economic
Census), and **86.65% under 20 versus 91.02%**. The three sub-parts of 2382 —
electrical, the residual containing 238290, and 2382 itself — sit within
**0.4 percentage points of each other** at every threshold, which is the
strongest available indication that 238290's own distribution is near 52–53%
under 5 and 86–87% under 20. **That is an inference from siblings, not a
measurement of 238290, and it is not entered in any table above.**

---

## 5. Average employees per establishment

**NAICS 238290: NOT OBTAINED.** Employment for 238290 lives in `EC2223BASIC`,
which failed every arithmetic control through the only available channel. **The
≈18.4 employees per establishment figure carried in the run brief is therefore
NOT verified by this run**, and neither is the ≈9.3 construction comparison as
stated.

**All construction (NAICS 23), 2022 Economic Census, table `EC2200SIZEEMPEST`:**

- 7,485,385 paid employees ÷ 785,917 establishments = **9.52 employees per
  establishment**

*Confidence: moderate, single read. The 785,917 establishment count was
independently corroborated by a second table; the 7,485,385 employment figure
was not. The band decomposition of this same table failed a sum control and is
excluded from this document entirely.*

**CBP employment for NAICS 23 was attempted and rejected** — the read returned
116,960,707 employees for construction, which exceeds total US employment
(135,748,407 for all sectors in the same table) and is a column misalignment.
**No CBP employment figure for construction is recorded here.**

**So the load-bearing contrast — that 238290 runs roughly twice the employees
per establishment of ordinary construction — remains UNVERIFIED.** A reader must
not be told that 238290 is a structurally larger-establishment code on the
strength of this run. What this run *can* say is the weaker, sourced version:
**building equipment contractors as a group are less fragmented than
construction overall**, by the share statistics in section 4.

---

## 6. Narrowing toward the elevator trade specifically

**Nothing was obtained.** Reported separately and clearly labelled, as required:

- **BLS OEWS industry-occupation cross-tab** — the correct instrument for
  isolating elevator mechanics inside 238290. `www.bls.gov` and `data.bls.gov`
  were both unreachable this run (proxy 403 and robots.txt refusal). The ≈13.90%
  employment share quoted in section 1 comes from the run brief and **was not
  verified here**.
- **State elevator-contractor licence registries** — the most promising route to
  a real count of elevator firms, and the one that would sidestep the container
  problem entirely. Not attempted this run: every state licensing host is
  outside the permitted egress list. **This should be the next run.**
- **BLS QCEW size-class data** — named in the brief as a legitimate
  cross-methodology check. Blocked; no cross-check was possible.

---

## Vintages and table IDs, for the record

| Source | Vintage | Dataset / Table ID | Code basis | Status |
|---|---|---|---|---|
| County Business Patterns | 2022 | `CBP2022.CB2200CBP` | **NAICS2017** | Retrieved, 2-digit only |
| Economic Census, construction location by employment size | 2022 | `ECNLOCCONS2022.EC2223LOCCONS` (`2022/ecnloccons`) | NAICS2022 | Retrieved; truncates after 238210 at US level |
| Economic Census, key statistics | 2022 | `ECNBASIC2022.EC2223BASIC` (`2022/ecnbasic`) | NAICS2022 | Reachable; **no value used** — failed arithmetic controls |
| Economic Census, employment size of establishments | 2022 | `ECNSIZE2022.EC2200SIZEEMPEST` (`2022/ecnsize`) | NAICS2022 | Retrieved, sector level only |
| BLS OEWS | — | — | — | **Unreachable** |
| BLS QCEW size class | — | — | — | **Unreachable** |

---

## What we don't know yet

1. **The establishment count for NAICS 238290 by employment size band — the
   thing this run existed to produce.** It sits about fifty rows past a hard
   truncation point in the only keyless endpoint that reaches 6-digit industries.
2. **The total establishment count for 238290, and therefore whether the 7,725
   figure from `EC2223BASIC` is right.** It could not be read reliably, so it is
   neither confirmed nor contradicted here, and the reconciliation this run was
   asked to perform did not happen.
3. **Employment in 238290, and so its employees per establishment.** The ≈18.4
   figure is unverified. Until it is, the claim that 238290 is a structurally
   larger-establishment code should not be put in front of a reader.
4. **What share of 238290 is actually elevator and escalator work** — on
   establishments rather than employment. The ≈13.90% is an *employment* share
   carried unverified from the brief; the establishment share could be very
   different, since vending and ATM installers are plausibly much smaller units
   than elevator service companies. **This is the number that decides whether
   238290 is usable at all**, and we do not have it.
5. **Whether an elevator-specific establishment count exists anywhere.** State
   licence registries are the untried route and the recommended next step.
6. **Any second-methodology cross-check.** BLS QCEW was blocked, so every figure
   above rests on Census alone.

**How to close items 1–3 in one step, next run:** obtain a Census API key
(free, `api.census.gov/data/key_signup.html`) and issue
`api.census.gov/data/2022/ecnloccons?get=NAICS2022,NAICS2022_LABEL,EMPSZFE,EMPSZFE_LABEL,ESTAB&for=us:*&NAICS2022=238290&key=…`,
plus the same against `2022/ecnbasic` for ESTAB and EMP. Alternatively run the
download from a machine with ordinary internet access:
https://www2.census.gov/programs-surveys/cbp/datasets/2022/cbp22us.zip with
its record layout, filtering `naics == "238290"` and grouping on `empszes`.
**Both take minutes on an unrestricted network.** Neither was possible here, and
that — not the difficulty of the question — is why this row is still empty.
