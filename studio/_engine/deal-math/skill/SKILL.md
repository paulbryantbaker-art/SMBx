---
name: deal-math
description: "Run smbX deal math in Cowork — SDE/EBITDA normalization, valuation range, SBA/DSCR go-no-go, LBO returns with sensitivity, earnout expected value, and multi-deal comparison — using the deterministic workbench in STUDIO/_engine/deal-math. Use whenever Paul asks to model, value, screen, stress, or compare a deal or target; whenever SDE, EBITDA, add-backs, DSCR, SBA financing, IRR, MOIC, earnout, or a purchase price needs computing; and whenever a deal folder under STUDIO/deals/ is being created or updated. Formulas come from METHODOLOGY_V17 §5.0 and are never improvised in conversation."
---

# Deal math

The deal math engine runs as code, not as arithmetic in your head. **You never
compute a deal figure yourself** — you fill `deal.json`, run the harness, and
interpret the output. Same rule as the platform: the AI is forbidden from
inventing formulas.

```
WORKBENCH  STUDIO/_engine/deal-math       harness, engine, fixtures
DEALS      STUDIO/deals/<deal>/           deal.json · documents/ · analysis/ · models/<date>/
```

## The loop

1. **Profile.** Copy `deals/_template/deal.json` into `STUDIO/deals/<deal>/`.
   Every figure entered must trace to a document in `documents/` (record it in
   the row's `source`) or be logged in `assumption_log`. Never invent a figure;
   an empty field plus a named gap beats a plausible guess.
2. **Add-backs.** Only `verified: true` items enter SDE/EBITDA, and
   `verified: true` requires `evidence`. Unverified add-backs stay listed —
   visible, excluded.
3. **Run.**
   `node harness/run.mjs deals/<deal> --model valuation|sba|lbo|earnout`
   `node harness/run.mjs deals/<deal> --model compare deals/<other> ...`
   Each run writes `models/<date>/<model>/`: `result.json`, `model.xlsx`,
   `dashboard.html`.
4. **Verify.** Recalc the workbook (xlsx skill `recalc.py`), then
   `python3 harness/verify_xlsx.py <run-dir>` — Excel must agree with the
   engine. Never report numbers from a run whose parity check failed.
5. **Interpret.** Your job is the analysis around the numbers: what the DSCR
   headroom means, which sensitivity cells are survivable, what to negotiate.
   Follow the golden pattern — analysis, options, implications; the decision
   is Paul's.

## League rule (V17 §5.5)

L1–L2 deals are talked about in SDE; L3–L6 in Adjusted EBITDA. The workbench
computes both; lead with the league's basis.

## Engine provenance

`engine/` is vendored from the SMBx repo — check `ENGINE_PROVENANCE.md`. If it
says NOT YET VENDORED, runs fall back to the V17 reference implementation and
every output is stamped accordingly; say so when reporting. After any
re-vendoring, run `node fixtures/parity-test.mjs` and
`node fixtures/canon-tests.mjs` before trusting output.

## The line

Studio is buy-side. Workbench output is internal analysis: no valuation on a
named target ever leaves the studio in published output, no fee talk, no
securities/tax/legal opinions — name the specialist instead. Model runs and
`analysis/` memos are fine; they are the practice's own work product.

## Report back

Quote what the scripts printed (engine label, parity result). Give the
headline numbers with their basis and year, name every unverified add-back and
every assumption_log entry, and end on what is not yet known.
