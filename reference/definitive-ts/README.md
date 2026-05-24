# DEFINITIVE TypeScript Reference

This is the first internal reference implementation for DEFINITIVE / The Diligence Standard. It is intentionally small, pure TypeScript, and independent of the app shell, database, MCP server, JWT auth, and private Authority Register tables.

The point is proof, not product surface:

- deterministic model identifiers and schemas
- pure functions with cents-denominated money inputs
- JSON-safe outputs with spec, methodology, model, input hash, output hash, and THE LINE boundary
- sample authority references only, not production Authority Register data
- smoke tests that can run from a fresh clone

## Run

From the repo root:

```bash
npm run test:definitive-reference
```

From this folder:

```bash
npm run test
```

## Models In This Slice

| Model | Reference function | Scope |
| --- | --- | --- |
| M109 | `computeWorkingCapitalPeg` | Normalized monthly NWC and peg |
| M139 | `computeSection1060Allocation` | Residual-method purchase price allocation |
| M199 | `computeFirptaWithholding` | FIRPTA withholding ladder |
| M206 | `computeIndemnificationLadder` | Cap, basket, and recoverable-loss math |

All outputs are descriptive computations. They do not draft, advise, broker, negotiate, opine, or recommend a legal/tax position.
