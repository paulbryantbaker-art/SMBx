<!-- run: 22 | hunt: B | date: 2026-08-12
     query: US HVAC equipment shipments, calendar 2025 against 2024 — the
            install-side demand instrument this practice has never pulled
     tool: web search + fetch. AHRI's own statistical release was LOCATED and
           DATED but could not be opened (403 to the fetcher); the figures
           below are ACHR News reporting it, and are labelled as such.
     coverage rows: NEW — market performance over time (see RESEARCH.md § B
            pass 1b, added the same day) -->

# US heating and cooling equipment shipments, 2025 against 2024

**Why this file exists.** Paul, 2026-08-12: *"how come in none of these reports
do we get any real market YoY performance in any of the segments, HVAC install,
service, plumbing repair and service, etc. This is important in understanding
the market."* He is right, and the reason is structural: **RESEARCH.md § B had
no pass that asks how a market performed.** Pass 1 gathers structure and scale
(a stock, at one date), pass 2 who owns what, pass 3 costs and multiples. Flow
was nobody's job, so no master carries it. This is the first read against the
new pass 1b.

## What the figures say

Full-year 2025 against full-year 2024, US shipments:

| Equipment | 2025 | 2024 | Change |
|---|---|---|---|
| A/C and air-source heat pumps, combined | 7.75 m | 9.68 m | **−20%** |
| Air conditioners only | 4.10 m | 5.56 m | **−26.2%** |
| Air-source heat pumps only | 3.64 m | 4.12 m | **−11.6%** |
| Gas warm-air furnaces | 3.25 m | 3.12 m | **+4.1%** |
| Oil warm-air furnaces | 32,799 | 30,036 | **+9.2%** |
| Gas water heaters | 4.25 m | 4.18 m | **+1.8%** |
| Electric water heaters | 5.03 m | 5.06 m | **−0.6%** |

December 2025 alone, against December 2024: A/C and heat pumps combined
408,244 units, "down 21.4% from 519,326"; air conditioners 188,715, "down
35.9% from 294,336"; heat pumps 219,529, "down 2.4% from 244,990"; gas
furnaces 267,065, "a 0% change from 267,059 units"; oil furnaces 4,058, "up by
31.5% from 3,087 units"; gas water heaters 418,518, "up 19.3% from 350,875
units"; electric water heaters 462,252, "up 16.8% from 395,719 units".

## Why this matters to a buyer, and it matters a great deal

**Cooling equipment shipments fell by a fifth in a single year while furnaces
and water heaters did not.** That is not a market-wide contraction; it is a
divergence, and the divergence is the finding:

1. **It separates install demand from service demand**, which is the split the
   whole recurring-revenue thesis rests on and which NAICS 238220 cannot make.
   A replacement-heavy HVAC business and a service-contract HVAC business had
   very different 2025s, and nothing in the current master would tell a buyer
   that.
2. **It is a volume series, not a dollar series.** Paired with a price index it
   would separate price from volume. Unpaired, a revenue line that held up in
   2025 may be price carrying a falling unit count — which reverses when price
   normalises.
3. **The A/C-versus-heat-pump split moved**, −26.2% against −11.6%. Heat pumps
   took share of a shrinking pool.
4. **A 2023–2024 pull-forward is the obvious candidate explanation** — the
   refrigerant transition (§7.1) had installers and distributors building stock
   ahead of the change. *This file does not establish that.* It is the
   hypothesis pass 1b should test, not a conclusion.

**Nothing here should reach a master or a card until the instrument itself is
opened.** See the sourcing note below.

## Sourcing — read this before using any figure above

**The instrument exists, is named and dated, and was not opened.** AHRI
publishes the December 2025 U.S. Heating and Cooling Equipment Shipment Data as
its own statistical release, dated **2026-02-13**, contact Regan Spencer, with
a PDF and an Excel companion. AHRI's own news page for that release was reached
and confirms the release, its date and its contact; the PDF itself returned 403
to this session's fetcher, and the Excel was not attempted.

So **every figure above is ACHR News reporting AHRI**, not AHRI reporting
itself. Under this practice's classes that is `press` carrying `interested` —
AHRI is the manufacturers' own association, and a shipment count is its
members' own data. It is a well-founded figure and it is not an instrument
read.

Two things follow, and both bind:

- **A card or master carrying these numbers names ACHR News and the date**, and
  says the release is AHRI's. Anything else launders press into instrument,
  which is the failure pattern named in CLAUDE.md job 2.
- **The next run opens the release.** `sourcing-protection.mts` will report
  these figures as press-and-interested with no instrument underneath, and it
  will be right to.

## Sources

- ACHR News, "Heat Pump, A/C Shipments See 20% Declines in 2025", published
  2026-02-25 — https://www.achrnews.com/articles/165859-heat-pump-a-c-shipments-see-20-declines-in-2025
- AHRI, "AHRI Releases December 2025 U.S. Heating and Cooling Equipment
  Shipment Data", release dated 2026-02-13 (located, not opened) —
  https://www.ahrinet.org/news-events/news/ahri-releases-december-2025-us-heating-and-cooling-equipment-shipment-data
- AHRI statistical release PDF, December 2025 (403 to this session) —
  https://www.ahrinet.org/system/files/2026-02/December2025StatisticalRelease.pdf
- AHRI monthly shipments index — https://www.ahrinet.org/analytics/statistics/monthly-shipments
- AHRI historical data — https://www.ahrinet.org/analytics/statistics/historical-data

## What we don't know yet

- **The release itself.** Every figure here is second-hand until the PDF or the
  Excel companion is opened. That is the first job of the next run.
- **Dollars, not units.** Shipment counts are volume. The revenue consequence
  needs a price series — BLS PPI for NAICS 238220 is the candidate.
- **Whether 2024 was inflated by pre-buy** ahead of the refrigerant transition.
  If it was, the 2025 fall is a return to trend rather than a contraction, and
  those are opposite readings for a buyer.
- **The service side.** Shipments measure installation. Nothing here measures
  maintenance, repair or contract revenue, which is the half of the market this
  practice actually underwrites.
- **Plumbing.** Water heaters are the only plumbing-adjacent line here. Repair
  and drain work has no shipment analogue and needs a different instrument.
- **Geography.** These are national. No metro split is published.
