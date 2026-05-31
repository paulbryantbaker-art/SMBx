# Agent-POV substrate test suite

This directory contains the test harnesses + fixtures that validate the smbX DEFINITIVE substrate from the perspective of an external asking agent. Read [TEST_PLAN_SUBSTRATE_AGENT_POV.md](../../TEST_PLAN_SUBSTRATE_AGENT_POV.md) at the repo root first — it defines the categories, gates, personas-versus-payload-classification framing, and pass criteria.

## Layout

```
testing/agent-pov/
├── README.md                      ← you are here
├── types.ts                       ← shared type contracts (DealSimulation, PayloadFixture, etc.)
├── runner-helpers.ts              ← MCP client wrapper, OAuth bridge, JWT minting, assertions
│
├── data/
│   └── sample-deal-facts.ts       ← canonical deal fact patterns shared across simulations
│
├── simulations/                   ← deal simulation fixtures (TypeScript modules)
│   └── SIM-L4-BUY-SELL-HEALTHY-001.ts   ← worked example (anchor format)
│
├── payloads/                      ← payload classification fixtures (JSON)
│   ├── PC-SPARSE-L4-BUY-001.json        ← sparse-payload anchor
│   └── PC-LINE-VIOLATION-001.json       ← refusal-fixture anchor
│
├── results/                       ← harness output (JSON), one file per run
└── golden/                        ← canonical reference traces for regression-replay
```

The runner scripts themselves live in `scripts/agent-pov-*.ts`, not here. They load fixtures from this tree.

## How to add a fixture

### A payload classification fixture (PC-*)

Create a new JSON file under `payloads/`. Use `PC-SPARSE-L4-BUY-001.json` or `PC-LINE-VIOLATION-001.json` as your template. The fixture name pattern is `PC-<CATEGORY>-<DESCRIPTOR>-<NNN>.json`. Categories: `SPARSE | PARTIAL | RICH | CONTRADICTORY | AMBIGUOUS | GARBAGE | CROSS_DOMAIN | VERSION | FUZZ | LINE_VIOLATION`. The fixture must conform to the `PayloadFixture` type in `types.ts`.

### A deal simulation fixture (SIM-*)

Create a new TypeScript module under `simulations/`. Use `SIM-L4-BUY-SELL-HEALTHY-001.ts` as your template. The fixture name pattern is `SIM-<LEAGUE>-<JOURNEY>-<DEAL_TYPE>-<NNN>.ts`. The fixture must export a `DealSimulation` as default.

### A canonical fact pattern

Add a new export to `data/sample-deal-facts.ts`. Money in cents only. Reference it from your simulation fixture's `factPattern` field.

## Running tests

```bash
# Discovery + auth
npx tsx scripts/agent-pov-discovery.ts

# Payload classification harness (loads everything under payloads/)
npx tsx scripts/agent-pov-payload-classification.ts

# THE LINE refusals (loads PC-LINE-* + the dedicated refusal matrix)
npx tsx scripts/agent-pov-line-refusals.ts

# Cross-customer security
npx tsx scripts/agent-pov-cross-customer-security.ts

# Simulation runner — load a specific simulation or run all Tier-A
npx tsx scripts/agent-pov-simulation-runner.ts                # all simulations
npx tsx scripts/agent-pov-simulation-runner.ts SIM-L4-BUY-SELL-HEALTHY-001

# State integrity / resume
npx tsx scripts/agent-pov-state-integrity.ts
npx tsx scripts/agent-pov-state-resume.ts

# Methodology coverage
npx tsx scripts/agent-pov-methodology-coverage.ts

# Tamper detection on portable packages
npx tsx scripts/agent-pov-package-tamper.ts

# Caller parity (Claude / ChatGPT / direct MCP)
npx tsx scripts/agent-pov-caller-parity.ts

# Failure modes (malformed, version refusal, idempotency, concurrency)
npx tsx scripts/agent-pov-failure-modes.ts

# Audit row integrity
npx tsx scripts/agent-pov-audit-integrity.ts

# Fuzz
npx tsx scripts/agent-pov-fuzz.ts
```

All harnesses accept `--url=<origin>` (default: `http://127.0.0.1:3000`). All harnesses exit 0 on all-pass and 1 on any-fail.

## Conventions

- **Money is in cents.** Never floats. (CLAUDE.md Critical Rule #10.)
- **All times in UTC ISO 8601** for serialization.
- **Fixture file ⇄ test ID 1:1.** The fixture's `id` field equals its file basename minus `.json`/`.ts`.
- **Result files go to `results/`.** One JSON per run, named `<harness>-<runId>.json`. Older results are kept (they're the regression history).
- **Never modify production code from inside a test fixture.** Tests can call the substrate via HTTP; they cannot mutate `server/` or `client/` source. If a test needs a new export from production code, that's a code change made separately.
- **No Stripe / onboarding flows.** This suite tests methodology + artifacts only. Paid-path E2E and signup flows are tracked elsewhere.
