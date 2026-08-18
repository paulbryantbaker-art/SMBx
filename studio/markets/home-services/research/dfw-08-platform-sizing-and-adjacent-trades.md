<!-- run: 08 | hunt: B | date: 2026-08-01
     query: (a) employee count or band for each of the 26 platform-owned DFW
            establishments; (b) CBP bands for the five adjacent trades
     tool: three parallel web passes for (a); market-data.mjs over the CBP
           county file for (b)
     coverage rows: 8 (the headline share), and seeds for the other trades -->

# Platform location sizing — and the adjacent trades

## Part A — the sizing attempt, and why it mostly failed

**The objective.** Run 06 produced a platform-owned share of the DFW acquisition
band as a range — 8.5% on a 10–249 employee band, 22.6% on a 20–249 band. One
input collapses that range: an employee count for each of the 26 platform-owned
establishments. This run went after it.

**The result: four figures out of twenty-six.** Everything else is not published
anywhere that meets the standard.

| Business | Parent | Figure | Covers | Source |
|---|---|---|---|---|
| Baker Brothers Plumbing, Air & Electric | Wrench Group | **400** | The brand, which operates only in DFW | Energage/Top Workplaces company profile, employer-reported. Corroborated by an independent 150–499 band placement |
| Berkeys Air Conditioning, Plumbing & Electrical | Wrench Group | **195** | The brand, DFW only | Energage/Top Workplaces, employer-reported. Corroborated by a 150–499 band placement, Dallas Morning News list 2024 |
| Lex Cooling, Heating, Plumbing & Electrical | Champions Group | **50+ technicians** | The brand across the metroplex | lexairconditioning.com/about-us — "50+ Expert Technicians". Undated marketing statistic, a floor not a point |
| Dallas Mechanical Group | EMCOR | **"more than 150"** | The operating company, North Texas | dallasmechanicalgroup.com/about — *"With skilled staff of more than 150, we are one of the largest HVAC contractors in Texas."* Undated |

**Twenty-two returned nothing.** Not "nothing found in a quick look" — three
independent passes checked each company's homepage, About page, careers page,
leadership page, and every dated acquisition release naming the business. The
company sites use qualitative phrasing instead: *"a team of dedicated
professionals"*, *"over 90 years of combined service experience"*, *"over 75
years of combined experience"*.

### What was deliberately not used

- **Data brokers.** ZoomInfo, RocketReach, Owler, Growjo, LeadIQ, Datanyze,
  Cience, Seamless.AI, D&B and the Glassdoor and Indeed size fields all return
  headcounts for nearly every one of these companies. **Every one of those is a
  modelled estimate, not a reported figure.** Using them would have filled the
  table completely and made it worthless.
- **Brand-level figures dropped into a metro row.** Roto-Rooter publishes *"almost
  4,000 people at company-owned locations"* across the US and Canada; ARS
  publishes ≈6,000 nationally; Service Experts publishes "more than 3,000+"
  across 80 locations in 31 states. **None of these is a DFW number**, and
  allocating one to a DFW establishment would be the relabelled-total failure
  pattern named in CLAUDE.md job 2.
- One trap worth recording so it is not rediscovered and trusted: an Energage
  profile for "American Residential Services" shows **141 US employees**, against
  ARS's own ≈6,000. The scope is unknown and the two cannot both describe the
  same entity. Not used.

### What this failure actually tells us

**Branch-level headcount is not published for privately held trade businesses.**
That is not a gap in the search; it is the nature of the population, and it is
precisely why County Business Patterns exists. A federal statistical programme
with mandatory response is the only thing that sees inside these companies.

**So the range does not close from public sources, and the honest status of the
headline number is `unknown` on the numerator side.**

### The directional read, stated as directional

All four figures that do exist are **50 or more**, and two are in the 150–499
band. Against a metro where only 122 establishments have 50 or more employees,
that is consistent with platform-owned locations sitting at the top of the
distribution — which would put the true share near the **22.6%** end rather than
the 8.5% end.

**Four observations out of twenty-six is not evidence for a figure.** It is a
reason to prefer one end of a range while saying so. The range stands.

### The one remaining route

All three passes independently reached the same conclusion: **LinkedIn company
pages carry self-reported employee bands, and LinkedIn is disallowed by
robots.txt to an automated fetcher.** A browser session can read them. That is
the highest-yield remaining source for perhaps fifteen of the twenty-two blanks,
and it is the only route identified that does not involve a data broker.

Also flagged: `firstcallmechanical.com/about` renders a technician count through
a JavaScript counter that a fetcher cannot execute — the raw HTML carries only
`branches=25` and `states=11`. A browser would see the real number.

A Dallas Business Journal ranked list of North Texas mechanical contractors would
likely fill DynaTen, Dallas Mechanical Group and Infinity in one pass, but the
list pages are paywalled.

---

## Part B — the five adjacent trades, seeded

Produced with `market-data.mjs bands` against the same CBP county file, one
command per trade. This is the repeatable half: the next trade costs a command,
not a session.

**Dallas–Fort Worth, 11 counties, CBP 2023:**

| NAICS | Trade | Estabs | Employment | Annual payroll | Avg emp/estab | Payroll/employee |
|---|---|---|---|---|---|---|
| 238220 | Plumbing, heating & air-conditioning | **2,412** | 31,980 | **$2.418B** | 13.3 | $75,602 |
| 238210 | Electrical contractors | **1,634** | 28,980 | **$2.149B** | 17.7 | $74,145 |
| 238160 | Roofing contractors | **907** | 6,053 | $0.458B | 6.7 | $75,593 |
| 238350 | Finish carpentry | 391 | 3,260 | $0.194B | 8.3 | $59,658 |
| 561710 | Exterminating and pest control | **396** | 3,954 | $0.206B | 10.0 | $52,192 |
| 238290 | Other building equipment contractors | 197 | 6,428 | $0.434B | **32.6** | $67,444 |

All measured, all primary-source, none derived.

**Three things worth noticing before anyone builds on this:**

**Electrical is bigger per establishment than HVAC and plumbing** — 17.7 average
employees against 13.3 — on two-thirds the establishment count. A different shape
of market, not a smaller one.

**Pest control pays materially less** — $52,192 per employee against $75,602 in
238220. Different labour model, different margin structure, and it is the one
trade of the six that is **not** in the construction sector, so unlike the others
**its receipts are published at metro level.** NAICS 56 gets county and MSA
geography from the Economic Census. If a dollar-denominated metro market size is
ever wanted, pest control is the trade that can carry one without a derivation.

**238290 averages 32.6 employees per establishment**, by far the largest of the
six. Whatever is in that code in this metro is not a residential service business.

**Caution on the trade-to-NAICS mapping.** These codes were run to seed the next
hunts, not to define them. Garage doors in particular do not map cleanly — the
Economic Census kind-of-business detail carries *"garage door and overhead door
installation contractor, residential-type"* as a line inside 238220, while the
establishment counts above assume 238290 or 238350. **That mapping needs settling
before any garage-door figure is published**, and it is exactly the same
one-code-many-trades problem 238220 posed.

## Sources

- U.S. Census Bureau, County Business Patterns 2023, Complete County File
- Energage / Top Workplaces company profiles for Baker Brothers and Berkeys
- lexairconditioning.com/about-us · dallasmechanicalgroup.com/about
- Roto-Rooter, ARS and Service Experts corporate boilerplate — recorded above as
  brand-level and explicitly not used as DFW figures

## What we don't know yet

- **Employee counts for 22 of the 26 platform-owned DFW establishments.** The
  headline share stays a range because of this and nothing else.
- Whether the four figures that exist are representative of the other 22.
- The correct NAICS mapping for garage doors.
- Whether any of the 26 has changed hands since its parent's page was updated.
