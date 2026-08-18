<!-- run: 06 | hunt: B | date: 2026-08-01
     query: Census County Business Patterns 2023, Complete County File
            (cbp23co.txt), NAICS 238220, the eleven DFW MSA counties,
            establishment counts by employment size class
     tool: direct read of the Census flat file supplied by Paul — no API,
           no aggregator, no vendor estimate
     coverage rows: 2 (closed), 5, 7, 8 -->

# DFW establishment-size distribution, NAICS 238220

**Provenance.** `cbp23co.txt`, the Census Bureau's County Business Patterns 2023
Complete County File, 1,100,962 rows, downloaded by Paul on 2026-08-01 from
`www2.census.gov/programs-surveys/cbp/datasets/2023/cbp23co.zip` and read
directly. **No API key, no aggregator, no vendor restatement** — this is the
bottom-up source the brief specified.

NAICS 238220 is *Plumbing, Heating, and Air-Conditioning Contractors*. Counties
are the eleven of the OMB Bulletin 23-01 Dallas–Fort Worth–Arlington MSA.

---

## 1. The table

| County | Estabs | Employment | Annual payroll ($k) | <5 | 5–9 | 10–19 | 20–49 | 50–99 | 100–249 | 250–499 |
|---|---|---|---|---|---|---|---|---|---|---|
| Collin | 264 | 2,939 | 217,084 | 151 | 52 | 28 | 20 | 5 | 8 | N |
| Dallas | 727 | 13,292 | 1,078,697 | 386 | 126 | 93 | 69 | 25 | 22 | 4 |
| Denton | 234 | 2,371 | 178,943 | 142 | 39 | 22 | 20 | 8 | 3 | N |
| Ellis | 112 | 942 | 65,928 | 67 | 21 | 13 | 7 | 3 | N | N |
| Hunt | 68 | 415 | 25,218 | 37 | 20 | 7 | 4 | N | N | N |
| Johnson | 88 | 702 | 40,541 | 44 | 23 | 15 | 4 | N | N | N |
| Kaufman | 89 | 670 | 44,760 | 54 | 18 | 9 | 7 | N | N | N |
| Parker | 86 | 649 | 39,296 | 49 | 20 | 11 | 4 | N | N | N |
| Rockwall | 68 | 672 | 49,449 | 45 | 12 | 6 | N | N | 3 | N |
| Tarrant | 631 | 9,078 | 664,889 | 331 | 124 | 78 | 57 | 25 | 13 | 3 |
| Wise | 45 | 250 | 12,931 | 24 | 12 | 9 | N | N | N | N |
| **DFW MSA** | **2,412** | **31,980** | **2,417,736** | **1,330** | **467** | **291** | **192** | **66** | **49** | **7** |

`N` is Census disclosure suppression, not zero. Named bands account for 2,402 of
2,412 establishments, so **ten establishments sit inside suppressed cells** — all
of them in the 20-plus range, which is the range that matters. Nothing in the
500–999 or 1000-plus bands is published for any of the eleven counties.

**Metro totals:** 2,412 establishments, 31,980 employees, **$2.418 billion**
annual payroll, averaging 13.3 employees per establishment.

## 2. The shape of the market

| Slice | Establishments | Share |
|---|---|---|
| Under 10 employees | 1,797 | **74.5%** |
| 10–249 employees | 307 | 12.7% |
| 20–249 employees | 115 | 4.8% |
| 250+ employees | 7 (published) | 0.3% |

**Three-quarters of the metro's plumbing-and-HVAC establishments have fewer than
ten employees.** That is the single most important number in this file, because
it is the population that every all-firms share calculation is dominated by, and
it is the population no platform will ever bid for.

## 3. CBP against TDLR — the two denominators reconcile, and the gap is the finding

Run 05 counted **4,665 licensed HVAC firms** in the same eleven counties from the
state registry. This file counts **2,412 establishments** in 238220 — a code that
covers HVAC *and* plumbing, so it should be the larger population, and it is
roughly half the size.

The gap is not an error in either source. **CBP counts only establishments with
paid employees.** TDLR licenses every contractor, including the sole proprietor
with no payroll. So the difference is the non-employer population, and it is
enormous: allowing that 238220 splits between HVAC and plumbing, the licensed
HVAC firms with any employees at all are plausibly under a third of the licensed
total.

**Consequence for the thesis: the acquirable universe is far smaller than the
licence count suggested, and the licence registry overstates it by roughly 2x
before any size band is applied.** That is a correction to the framing this hunt
was carrying two runs ago.

## 4. The headline number — platform-owned share of the acquisition band

### The numerator

From runs 01 and 05, platform-owned establishments inside the eleven counties
that fall within NAICS 238220 — plumbing and HVAC, excluding the electrical
nameplates, which are 238210:

**Residential-side (16):** Baker Brothers, Berkeys (Wrench) · Swan Electric
Plumbing & Air (SEER) · ARS/Rescue Rooter DFW, ARS/Rescue Rooter Dallas (ARS) ·
Service Experts Dallas, Service Experts Fort Worth · Sunny Service (TurnPoint) ·
Lex (Champions) · Lightfoot Mechanical, Black Plumbing Cleburne (Legacy) ·
Roto-Rooter Dallas, Roto-Rooter Fort Worth · Schrader Plumbing (P3) · Repipe
Dallas, Repipe Fort Worth.

**Commercial-mechanical, also inside 238220 (10–11):** DynaTen (Comfort Systems)
· Infinity Contractors, Evolution Mechanical (Modigent) · Crete Building Services
TX, Crete United Energy Services (Crete) · Air Texas Mechanical (Service Logic) ·
Texas Chiller Systems (Astra) · DFW Mechanical Group (UBS) · Dallas Mechanical
Group (EMCOR) · FirstCall Mechanical DFW. Walker Engineering (Comfort Systems)
is excluded as probably electrical — unverified either way.

**Call it 26–27 platform-owned establishments in 238220.**

### The share

Platform-owned businesses are by construction the larger operators — a platform
does not buy a two-person shop as an anchor. Essentially none of the 26 sits in
the under-10 tail. So the share depends entirely on where the band is drawn:

| Band | Establishments in band | Platform-owned | Share |
|---|---|---|---|
| 10–249 employees | 307 | ≈26 | **≈8.5%** |
| 20–249 employees | 115 | ≈26 | **≈22.6%** |

**The honest answer is a range: between roughly 8% and 23%, and it cannot be
narrowed without an employee count for each platform location.** If the platform
locations are mostly 20-plus — which is likely, given ARS, Service Experts,
Comfort Systems and EMCOR are large operators — the number sits at the top of
that range. If several are 10–19, it sits lower.

### What that means for the question Paul asked

He asked: *"If it's low, DFW is open. If it's high, the honest answer is a
different metro."*

**It is neither, and the middle is the interesting answer.** Even at the top of
the range, roughly three-quarters of the 20–249 band and more than 90% of the
10–249 band is not platform-owned. In absolute terms there are **roughly 280
establishments in the 10–249 band that no platform in the register holds.**

That does not read as a closed metro. It also does not read as an open one:
a 22% platform share of the 20–49-and-up band is a crowded field by the standards
of most trades, the register shows eighteen parents already holding ground, and
two entered this year.

**The master's §5.1 label of *Saturated* is defensible at the platform-formation
level and misleading at the tuck-in level** — which is exactly what §5.1 itself
says in its closing line: *"Entry is tuck-in only."* This run supports that
sentence and puts numbers behind it for the first time.

**This is a first computation, not a finding.** It has not been through
`audit.mts`, the numerator is a named-location count rather than a verified
employee-banded one, and the Apex hole is still open. It needs a verification
pass before it reaches any document.

## 5. What still limits it

- **The band is establishments, not companies.** Wrench holds two locations, ARS
  two, Roto-Rooter two, Legacy two. A company count is lower than 26, and the
  target count is a company count.
- **238220 is still plumbing plus HVAC, and still commercial plus residential.**
  Ten of the 26 are commercial-mechanical. A residential-HVAC-only band would be
  materially smaller on both sides of the ratio, and the direction of the net
  effect is not obvious.
- **Apex is unresolved.** Every unnamed Apex location in the band moves the share
  up.
- **The suppressed cells hold ten establishments**, all in the 20-plus range —
  the range the share is computed on.
- **No employee band for any platform location.** This is the single change that
  would turn the range into a number.

## Sources

- U.S. Census Bureau, County Business Patterns 2023, Complete County File
  (`cbp23co.txt`), retrieved from
  https://www2.census.gov/programs-surveys/cbp/datasets/2023/cbp23co.zip
- Platform locations: `dfw-01-platform-dfw-locations.md` and
  `dfw-05-tdlr-file-analysis.md`, both owner-published or state-registry sourced
- County set: OMB Bulletin No. 23-01

## What we don't know yet

- **Employee counts for the 26 platform-owned establishments.** The one input
  that converts the 8–23% range into a figure.
- **What Apex owns in DFW.**
- **The residential-only cut of 238220.** Needs Economic Census class-of-customer
  detail, still pending `EC2223BASIC.zip`.
- **Whether the ten establishments in suppressed cells are platform-owned.**
- **The dollar side.** Payroll is now in hand at $2.418B for the metro; receipts
  are not, and whether the Economic Census publishes construction at county or
  metro level is still open.
