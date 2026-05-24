# DEFINITIVE Python Reference

This is the Python mirror of the TypeScript reference proof. It uses the same JSON fixtures as `reference/definitive-ts` and has no runtime dependency on the app shell, database, MCP server, JWT auth, or production Authority Register.

## Run

From the repo root:

```bash
npm run test:definitive-reference-python
```

The Python and TypeScript reference packages both run against:

```text
testing/definitive/reference/v1/reference-implementation.cases.json
```

## Scope

This initial slice mirrors four deterministic/computation-only model slots:

- M109 working-capital peg
- M139 Section 1060 residual-method allocation
- M199 FIRPTA withholding
- M206 indemnification ladder

All authority references are sample fixtures. Production Authority Register data stays out of the reference package.
