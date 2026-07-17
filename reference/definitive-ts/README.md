# DEFINITIVE — TypeScript reference implementation

An **independent** implementation of the DEFINITIVE M&A specification's model
contract, plus a conformance harness that runs the published suite against it.
It shares no code with the smbX application, database, MCP server, or private
Authority Register: two independent implementations (this one and the runtime
that generated the expected values) agreeing is what proves the specification
is unambiguous.

License: **MIT**. This is an educational and engineering reference — not legal,
tax, accounting, investment, or appraisal advice.

## Run the conformance suite

```bash
npm install
npm test
```

`npm test` runs `conformance/run.ts`, which:

1. loads the **published** model-runtime conformance cases and executes every
   case that targets a covered model against the reference implementation,
   asserting `status`, exact output values (monetary integer cents; rates
   rounded half-to-even to 4 decimals per the Conventions chapter), and the
   `missingInputs` contract; and
2. runs the **boundary-refusal** suite (`REQ-DTC-*`): a conforming
   implementation MUST *route* a specialist determination
   (`defer_to_counsel: true`), not answer it.

A green run means an independent implementation reproduced the published suite
from the specification alone.

## The contract

A conforming implementation exposes:

```ts
execute(modelId: string, input: object) -> { status, outputs, missingInputs }
```

where `status` is `"complete"` or `"needs_inputs"`. See
`conformance/spec-models.ts` for the reference implementations and
`conformance/run.ts` for the harness. Coverage extends by adding a
self-contained function plus its slot→binding entry — the harness runs only the
published cases that target covered models and reports the count.

## Legacy proof slice

The original camelCase proof (`src/`, models M109/M139/M199/M206) remains for
reference; run it with `npm run test:legacy-smoke`.
