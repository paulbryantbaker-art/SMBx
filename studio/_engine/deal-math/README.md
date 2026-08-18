# Deal Math Workbench

The deal math engine, running in Cowork instead of the app. Deterministic
calculations — same rule as the platform: **the AI is forbidden from inventing
formulas.** Code computes; Claude interprets.

## Where this lives when installed

```
STUDIO/deals/<deal>/          one folder per deal (existing studio layout)
    deal.json                 the deal profile — single source of inputs
    notes.md                  running narrative
    documents/                source documents (P&Ls, tax returns, CIMs received)
    analysis/                 written analysis, memos
    models/<date>/            each model run: xlsx + dashboard.html + result.json

STUDIO/_engine/deal-math/     the workbench itself (this folder)
    engine/                   VENDORED calc modules from the SMBx repo — unmodified
    ENGINE_PROVENANCE.md      repo, commit, file list, date of the vendoring
    harness/                  runner, schema, xlsx + dashboard builders
    fixtures/                 METHODOLOGY_V17 §5.0 canon tests (parity checks)
```

## The one-engine rule

`engine/` files are lifted from the SMBx repo **unchanged** and the source
commit is recorded in `ENGINE_PROVENANCE.md`. When the app's engine changes,
re-vendor and re-run `fixtures/parity-test.mjs`. Never edit engine files here —
a local edit is a fork, and a fork is the drift the one-engine rule exists to
prevent.

## Running a model

```bash
node harness/run.mjs deals/<deal> --model valuation   # SDE/EBITDA + valuation range
node harness/run.mjs deals/<deal> --model sba         # capital stack, DSCR go/no-go
node harness/run.mjs deals/<deal> --model lbo         # IRR, MOIC, pro forma, sensitivity
node harness/run.mjs deals/<deal> --model compare deals/<a> deals/<b> ...
node harness/run.mjs deals/<deal> --model captable
node harness/run.mjs deals/<deal> --model earnout
```

Each run writes `models/<date>/`: `result.json` (all inputs + outputs),
`model.xlsx` (real Excel formulas, IB formatting), `dashboard.html`.

## The line

Buy-side practice rules apply to anything that leaves this folder: no valuation
on a named target in studio *output*, no fee talk, no unlicensed opinions.
Internal analysis is fine — that is what this workbench is for.
