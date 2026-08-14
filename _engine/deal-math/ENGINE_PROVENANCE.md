# Engine Provenance

**Status: NOT YET VENDORED.** The `engine/` folder is empty until the calc
modules are staged from the SMBx repo on Paul's disk.

When vendoring, record here:

| Field | Value |
|---|---|
| Source repo | *(paulbryantbaker-art/SMBx — path on disk)* |
| Commit | *(git rev-parse HEAD at time of copy)* |
| Date vendored | |
| Files copied | *(list, with source path → engine/ path)* |

Expected modules (per SMBX_PLATFORM_REFERENCE §5, Calculation Engine):
`calculateSDE`, `calculateValuationRange`, `calculateIRR`, `calculateMOIC`,
`calculateDSCR`, `buildProForma`, `calculateSBAEligibility`,
`calculateAmortization`, `calculateDilution`, `calculateWaterfall`,
`buildSensitivityMatrix`.

Rule: engine files are copied **unchanged**. If a change is needed, it happens
in the repo first, then gets re-vendored. Parity against METHODOLOGY_V17 canon
is checked by `fixtures/parity-test.mjs` at every vendoring.
