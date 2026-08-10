<!-- run: 09 | hunt: B | date: 2026-08-03
     query: none — arithmetic only, on figures already in research/
     tool: computation over runs 05, 06, 07, 08; every derived figure registered
     coverage rows: 7 and 8 — the three-number answer, with bounds -->

# The DFW sizing card — HVAC and plumbing

**What this is.** Paul, 2026-08-03: *"we just need a pretty solid way to size a
market… a useful metric is understanding what the dollar spend of work exists in
a market/region and what proportion is part of a roll-up already and what is
left that is worthy of exploration."*

This file is that metric, computed for DFW plumbing-and-HVAC with every input
already on disk. **It is also the repeatable template**: the same card, for any
trade in any metro, needs four public inputs — the CBP county file, the Economic
Census KOB file, the state licence roster, and the consolidator register — and
`market-data.mjs` produces the first two cuts in one command each.

Nothing here is a new source. It is arithmetic on runs 05–08, and every derived
figure carries its assumption in the `## Derivations` table.

---

## The three numbers

### 1 · The dollar spend of work in the market

| | Figure | Standing |
|---|---|---|
| DFW plumbing + HVAC (238220), total annual receipts | **≈$8.4B** (range $6.9–8.4B across allocation bases) | DERIVED |
| — of which HVAC-specific | ≈$2.9B | DERIVED (two stacked assumptions) |
| — of which plumbing-specific | ≈$2.7B | DERIVED (same) |
| The measured floor under all of it: DFW annual payroll | **$2.418B** | MEASURED |
| The measured state anchor: Texas 238220 receipts | **$25.418B** | MEASURED |

### 2 · What is already part of a roll-up

| | Figure | Standing |
|---|---|---|
| Platform-owned establishments in the metro, 238220 | **≈26** across 18 parents | MEASURED (owner-published + state registry) |
| Share of the acquisition band (10–249 employees, 307 estabs) | **8.5% – 22.6%** of establishments | DERIVED — the range IS the answer until the 22 unsized locations are sized |
| Franchise-encumbered businesses (neither rolled up nor cleanly independent) | **25** in 238220 | MEASURED |
| Directional read | near the **top** of the range — all four sized platform locations are 50+ employees | stated as directional only |

### 3 · What is left that is worthy of exploration

| | Figure | Standing |
|---|---|---|
| Establishments in the 10–249 band matched to no platform | **≈280** | DERIVED (register-dependent: "independent" = unmatched) |
| Annual work sitting in the whole 10–249 band | **$3.6B – $6.4B** | DERIVED, bounded |
| Annual work in the unmatched residual | **roughly $2 – 6B** | DERIVED, bounded — wide almost entirely because 22 platform locations are unsized |
| The named raw material for a target map | **2,806 environmental-air HVAC firms with addresses** (TDLR) | MEASURED |

**The one-paragraph read.** DFW plumbing-and-HVAC is roughly an $8B-a-year
market in which three-quarters of establishments are too small to buy. The
buyable middle — 307 establishments of 10–249 employees — carries $3.6–6.4B of
annual work, and the eighteen platforms already present own somewhere between a
twelfth and a quarter of it, probably nearer the quarter. That still leaves
around 280 establishments and several billion dollars of annual work unmatched
to any consolidator: not an open market, but a long way from a closed one.
Entry is tuck-in, exactly as the master's §5.1 closing line says.

---

## A cross-check that landed while computing this

Run 08 found Baker Brothers at **400 employees** (employer-reported). The Census
table in run 06 shows exactly **seven** establishments of 250+ employees in the
metro. Baker Brothers must be one of them — the two entirely independent sources
are consistent, and it is the first time a named platform location has been
placed in a specific Census band.

It also means run 06's numerator was slightly off: Baker Brothers sits **above**
the 10–249 band, so the in-band platform count is ≈25, not 26. The share range
barely moves; the correction is recorded here rather than silently absorbed.

## What made the dollar conversion legitimate

The brief banned printing a revenue band computed from `benchmarks.md`, whose
seeds are marked UNVERIFIED. That ban stands. What changed is that run 07
produced a **measured** receipts-per-employee figure — Texas 238220 receipts over
Texas 238220 employment, **$241,879** — from two federal censuses. Employment ×
a measured benchmark, with the assumption registered, is a derivation the house
standard permits. Employment × an unverified seed is not. Same arithmetic,
different standing, and the difference is the whole point.

## Derivations

| Figure | Inputs | Arithmetic | Assumption |
|---|---|---|---|
| ≈$8.4B market (range $6.9–8.4B) | TX receipts $25,418,099k; DFW/TX payroll, employment, estab shares (32.87% / 30.43% / 27.07%) | share × state receipts, three bases | DFW resembles Texas on the chosen basis. Payroll preferred; the 21% spread is the assumption's size. No midpoint. |
| ≈$2.9B HVAC / ≈$2.7B plumbing | above × TX kind-of-business mix (34.3% / 32.8%) | multiplication | DFW's trade mix matches Texas's. Second assumption stacked on the first. |
| $241,879 receipts/employee | TX receipts (2022) ÷ TX employment (2023) | division | Mixed vintages, one year apart. |
| Band employment 14,950–26,365 | band establishment counts × band limits, constrained so all bands sum to the measured 31,980 | floor: counts × band minima; ceiling: metro total minus minimum possible employment outside the band | Census suppression handled as bounds (10 estabs in N cells, 20–999 each), never as zero. |
| Band dollars $3.6–6.4B | band employment × $241,879 | multiplication | Receipts/employee is uniform across size bands. Larger shops likely run higher revenue/employee, so the top of the band range is conservative. |
| Platform in-band employment 615–5,873 | Berkeys 195 + Lex 50 + DMG 150 measured; 22 unsized locations bounded 10–249 each | sum of bounds | The unsized 22 all sit in the 10–249 band. Baker Brothers (400) excluded — it is in the 250+ band. |
| Residual ≈$2–6B | band employment minus platform in-band employment, × $241,879 | subtraction of bounds | Inherits every assumption above. **The width is almost entirely the 22 unsized platform locations** — sizing them collapses this and the share range together. |
| ≈280 unmatched establishments | 307 in band − ≈25 platform in band | subtraction | "Unmatched" means not in `consolidators.md`. Apex unresolved; the residual is overstated by whatever Apex owns. |

## The repeatable recipe, stated once

1. `market-data.mjs bands` on the CBP county file → establishments, employment,
   payroll, size bands. *(any metro, any NAICS, one command)*
2. `market-data.mjs kob` + `allocate` on the Economic Census file → state
   receipts, trade mix, the derived metro dollar with its range.
3. State licence roster → the named firm universe for the eventual target map.
4. Consolidator register + owner-published rosters → the platform-owned
   subtraction, and the franchise line.
5. **This card.** Three numbers, bounds stated, derivations registered.

Steps 1–2 are minutes. Step 3 is one state download. Step 4 is the real work and
the register is the asset that compounds across metros — most of these parents
operate nationally, so the DFW register is already most of the Houston register.

## What we don't know yet

- Employee bands for 22 of 26 platform locations — **the single input that
  narrows both the share range and the residual dollars.** LinkedIn via a
  browser session is the identified route.
- What Apex owns in DFW. The residual is overstated by exactly that amount.
- Service vs new construction. Still no source; still the recurring-revenue
  soft spot.
- Whether receipts/employee is flat across size bands (assumed, stated).
- **None of this has been through `audit.mts` or a verification pass.** The card
  is a computed working answer, not a publishable finding, until job 2 runs.
