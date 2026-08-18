<!-- run: 05 | hunt: B | date: 2026-08-01
     query: direct analysis of TDLR's bulk air conditioning contractor licence
            file, ltairref.csv, supplied by Paul
     tool: pandas over the raw file — no API, no aggregator
     coverage rows: 2 (partial), 4, 5, 6
     SUPERSEDES several figures in dfw-04-tdlr-licence-registry.md — see §1 -->

# The TDLR licence file, read directly

**Provenance.** `ltairref.csv`, TDLR's bulk air conditioning contractor file,
supplied by Paul on 2026-08-01 and analysed in full. 20,400 rows, one licence
type throughout (`A/C Contractor`), 23 columns. Run 04 established what this file
is and where it comes from; this run reads it rather than querying the Socrata
mirror, which is why several figures move.

---

## 1. The correction — the extract is not active-only

**Run 04 listed "whether the Socrata extract is active-licences-only" as an open
question. It is not.** The file carries a `LICENSE EXPIRATION DATE` on every row,
running from 2025-01-29 to 2027-09-30. Against 2026-08-01:

| | Rows |
|---|---|
| Expired | **1,335** |
| Current | **19,065** |
| Total in file | 20,400 |

**This reconciles the conflict run 04 had to carry at both values.** TDLR's own
"ACR at a Glance" reports **19,163** Air Conditioning Contractors for FY25; the
bulk file and its Socrata mirror return about 20,300. The gap is expired
licences. Current-only here is **19,065**, within 0.5% of TDLR's published
active figure. The two sources were never in conflict — they were counting
different populations, and run 04 could not see that because the API queries did
not filter on expiry.

**Consequence: every count in run 04 is roughly 6.4% too high.** They are
superseded by the table below. The `≈3,050` derivation in run 04's
`## Derivations` is also superseded — the endorsement split is now measured for
all eleven counties rather than extrapolated from two, and the measured figure is
**2,849**.

## 2. DFW, current licences only

| County | Current licences | Distinct firms | Env-capable licences | Env-capable firms | of which Class B | Env % |
|---|---|---|---|---|---|---|
| Collin | 495 | 483 | 298 | 293 | 185 | 60.2 |
| Dallas | 1,652 | 1,597 | 999 | 982 | 582 | 60.5 |
| Denton | 410 | 403 | 226 | 224 | 141 | 55.1 |
| Ellis | 194 | 193 | 105 | 104 | 67 | 54.1 |
| Hunt | 88 | 86 | 58 | 57 | 41 | 65.9 |
| Johnson | 183 | 180 | 99 | 98 | 65 | 54.1 |
| Kaufman | 173 | 171 | 118 | 116 | 60 | 68.2 |
| Parker | 172 | 169 | 103 | 101 | 72 | 59.9 |
| Rockwall | 116 | 115 | 72 | 72 | 48 | 62.1 |
| Tarrant | 1,252 | 1,225 | 738 | 731 | 465 | 58.9 |
| Wise | 64 | 63 | 33 | 33 | 24 | 51.6 |
| **Sum of counties** | **4,799** | 4,685 | **2,849** | 2,811 | **1,750** | **59.4** |

**Metro-wide de-duplicated** — the figure run 04 could not retrieve, because a
firm operating in two counties is counted twice in a sum of counties:

- All current A/C firms: **4,665**
- Environmental-capable firms: **2,806**
- Class B environmental firms: **1,738**

Only about 20 firms span more than one county, so the sum-of-counties overstates
by well under half a percent.

## 3. The subtype codes, resolved

Run 04 flagged `AR`, `BR` and `ARBR` as unexplained and refused to assume. The
file shows the full vocabulary and the pattern is now legible — codes are
`<class><endorsement>` pairs, concatenated where a licensee holds two:

| Code | Statewide, current |
|---|---|
| BE | 6,767 |
| AC | 5,353 |
| AE | 3,997 |
| BC | 2,051 |
| AR | 410 |
| BR | 255 |
| AEBR | 140 |
| ARBE | 87 |
| AEBE | 2 |
| ARBR | 1 |

The existence of `AEBR` (Class A Environmental **plus** Class B R) and `ARBE`
(Class A R **plus** Class B Environmental) confirms the concatenation. `R`
remains a distinct endorsement from `C`, most likely a legacy refrigeration code
— **still not confirmed by any TDLR page, still not assumed.** What matters here
is only that `AEBR` and `ARBE` carry an environmental endorsement and therefore
belong in the environmental count, which is why this run's 2,849 exceeds a naive
`AE + BE` count of 2,795.

## 4. Class A versus Class B is a statutory capacity split, not an assumption

This is the useful structural finding. Class B is capped by statute at 25 tons
cooling or 1.5 million BTU/hr heating (§ 1302.253). Class A is unlimited.

So within the environmental-air population, **Class B firms are capped at
residential and light-commercial capacity by law** — not by inference, not by a
class-of-customer estimate:

- Class B environmental: **1,750 licences, 1,738 firms**
- Class A environmental: **1,099 licences**

A Class A holder may of course also serve residential, so Class A is "both",
not "commercial". But the Class B population is a hard-floored residential-scale
segment, and it is the closest thing to a residential HVAC universe that any
source has produced for this metro so far.

## 5. The licence file cannot band. Confirmed empirically.

Run 04 said this from the absence of an employment field. The data confirms it
more sharply. Among DFW environmental-capable firms:

| Licences held | Firms | Share |
|---|---|---|
| 1 | 2,712 | 98.5% |
| 2 | 40 | 1.5% |
| 3 | 1 | 0.0% |

**The maximum is three.** § 1302.252 requires a licence holder in each permanent
office, which suggested licence count might proxy for branch count and therefore
for size. It does not. The decisive case: **TDIndustries — one of the largest
mechanical contractors in Dallas — holds two.** A one-truck operator also holds
one. There is no relationship between licence count and firm size.

**So row 2 stays blocked and CBP is still required.** Nothing in this file bands
anything.

## 6. TDLR is HVAC-only, and that partly solves the 238220 problem

Testing the register's confirmed DFW platform brands against the file produces a
clean pattern: **every HVAC brand appears and every plumbing-only brand is
absent.**

Absent from the entire file: Roto-Rooter, Schrader Plumbing, Repipe Specialists,
Mr. Rooter, Benjamin Franklin Plumbing. All five are plumbing businesses,
licensed by the Texas State Board of Plumbing Examiners, not TDLR.

That is a validation and a finding at once. NAICS 238220 bundles plumbing with
HVAC and cannot separate them. **Texas licenses them under two different
agencies, so the TDLR file is a clean HVAC population** — split one of the three
in the 238220 problem, resolved by regulatory structure rather than assumption.
The Environmental Air endorsement and the Class A/B capacity limit then cut
partly across split two. Split three — service versus new construction — remains
untouched by any source.

## 7. Platform-owned entities located in the file

Matched on exact business name against the register's confirmed DFW nameplates.
These are **state-registry legal entity names**, the strongest available source,
and they are being written back into `screen/consolidators.md`.

| Legal entity in TDLR | Parent | County | Subtype |
|---|---|---|---|
| BAKER BROTHERS LLC | Wrench Group | Dallas | BE |
| BERKEYS LLC | Wrench Group | Tarrant | BE |
| SWAN ELECTRIC PLUMBING & AIR INC. | The SEER Group | Dallas | AE |
| AMERICAN RESIDENTIAL SERVICES | ARS / Rescue Rooter | Dallas | BE |
| SERVICE EXPERTS HEATING & AC LLC | Service Experts | Dallas | AC |
| SERVICE EXPERTS HEATING AC & PLUMBING | Service Experts | Tarrant | AE |
| LIGHTFOOT MECHANICAL | Legacy Service Partners | Parker | AC |
| LIGHTFOOT MECHANICAL SERVICES LLC | Legacy Service Partners | Parker | BE |
| DYNATEN COMFORT SYSTEMS USA | Comfort Systems USA | Tarrant | AC |
| INFINITY CONTRACTORS INC | Modigent | Tarrant | AC |
| INFINITY CONTRACTORS LTD | Modigent | Tarrant | AC |
| EVOLUTION MECHANICAL & CONTROLS, LLC | Modigent | Denton | AE |
| AIR TEXAS MECHANICAL, LLC | Service Logic | Dallas | AC |
| TEXAS CHILLER SYSTEMS | Astra Service Partners | Dallas | AC |
| DFW MECHANICAL GROUP LLC | United Building Solutions | Collin | AC |
| FIRSTCALL MECHANICAL GROUP TX, LLC | FirstCall Mechanical | Dallas | AE |
| FIRST CALL MECHANICAL GROUP, LLC | FirstCall Mechanical | Dallas | AC |

**17 firms, 18 licences. Of these, 8 carry an environmental endorsement** — ARS,
Swan, Service Experts (Tarrant), Lightfoot Mechanical Services, Evolution
Mechanical, FirstCall (Dallas), Berkeys and Baker Brothers. The other nine hold
commercial refrigeration codes only, which is exactly what the run 01 split
between residential-side and commercial-mechanical parents predicted, and is an
independent confirmation of it.

**Not found in the file, and worth chasing:** Sunny Service (TurnPoint) appears
nowhere; Champions' Lex could not be isolated; and no Apex-affiliated entity
appears. The thirteen Texas businesses trading as "Apex" are the unrelated ones
run 02 warned about — Apex A/C, Apex Comfort Solutions, Apex Heating & Air
Conditioning Svcs, Apex Services Inc. **The Apex gap survives this file.**

Franchisees do appear, under franchisee legal names — `4JR LLC DBA AIRE SERV OF
FORT WORTH`, `WEBER TECH SERVICE COMPANY DBA ONE HOUR`, `ONE HOUR HEATING & AC OF
FRISCO`. The `DBA` convention is how a franchise shows up in this registry.

### A caution the matching produced on its own

Substring matching against this file generates real false positives. `ARS` hits
MARS HVAC, ALLSTARS ELECTRIC and 3 PILLARS. `LEX` hits AIRPLEX, FLEX AIR and ALEX
AC. `CRETE` hits ADVANCED CONCRETE CONSTRUCTION. Every match above was made on
exact business name for that reason, and the short-token warning already carried
in `consolidators.md` is confirmed in live data.

## 8. The number Paul asked for, and why this still is not it

Of the 2,806 environmental-capable HVAC firms in the eleven counties, **8 are
platform-owned. That is 0.29%.**

**Do not use that figure.** It is arithmetically correct and answers the wrong
question, in two ways that both push the same direction:

**The denominator is dominated by micro-operators.** Those 2,806 firms are
overwhelmingly one licence, one truck, one owner — businesses no platform would
ever bid for. A share computed against them measures the size of the long tail,
not the state of the acquisition band. Restricting to Class B environmental
(1,738 firms) barely moves it, because that population is also mostly tiny.

**The numerator is understated.** Apex is unresolved, Sunny Service and Lex are
not locatable in the file, and any platform-owned business trading under a legal
name the register does not carry is invisible.

This is precisely the artefact the log warned about before the file arrived: the
answer is determined by where the band is cut, and **this file cannot cut a
band.** The honest position is unchanged — the headline number needs CBP employee
size classes, and the master's *Saturated* label stands unrevised.

What the file has done is give the eventual calculation a clean, named,
regulator-sourced HVAC universe of **2,806 firms with addresses** to band against,
rather than a bucket count. That is a much better denominator than the one this
hunt started with, and it is also the authoritative starting list a target hunt
would use later.

## Sources

- `ltairref.csv`, TDLR bulk air conditioning contractor licence file, supplied
  2026-08-01. Published at https://www.tdlr.texas.gov/LicenseSearch/licfile.asp
- Field spec: https://www.tdlr.texas.gov/dbproduction2/lrformat.txt
- Tex. Occ. Code § 1302.252 and § 1302.253 —
  https://statutes.capitol.texas.gov/docs/OC/htm/OC.1302.htm
- TDLR "ACR at a Glance" FY25 —
  https://www.tdlr.texas.gov/media/pdf/ACR%20at%20a%20Glance.pdf

## What we don't know yet

- **Employment or revenue for any firm in the file.** No field exists, and
  licence count is not a proxy. CBP remains required.
- **What `R` means** as an endorsement code. Not on any TDLR page located.
- **Whether Apex, TurnPoint or Champions operate in DFW under legal names the
  register does not carry.** The file would contain them; we cannot recognise
  them.
- **Service versus new construction.** No source touches this split yet.
- **Plumbing.** TSBPE holds it, and the Responsible Master Plumber file has not
  been pulled.
- **How many of the 2,806 are genuinely independent** rather than merely
  unmatched. The register is parent-and-brand level; the brand/DBA layer is still
  not built.
