# smbX Agent Test Results

Last updated: 2026-05-27

This is the living results log for substrate-only agent methodology tests. It intentionally separates test evidence from the test plan. OAuth, Stripe, marketplace import, and production env checks are tracked elsewhere until we are ready for platform testing.

## Summary

| Date | Case | Area | Status | Notes |
| --- | --- | --- | --- | --- |
| 2026-05-27 | Methodology matrix | Agent entry with partial/rich deal info | Pass | `npm run test:definitive-agent-methodology` returned 45 passed, 0 failed. |
| 2026-05-26 | LBO-001 | LMM LBO with $5M EBITDA | Pass | DealState, model-stack routing, and deterministic LBO runtime completed with no missing inputs. |
| 2026-05-26 | LOI-001 | Agent LOI request | Pass | External-agent simulation receives `LOIPacket.v0.1`, `DocumentDraft.v0.1`, source coverage, model dependency status, and THE LINE boundaries. Visible output saved at `testing/definitive/results/loi-001-agent-output.md`. |
| 2026-05-27 | SELLREP-001 | Sell-side owner/owner-rep representation | Pass | Owner/owner-rep agents can enter at intake, financials, data-room/DD prep, incoming LOI review, negotiation prep, close readiness, and funds-flow without losing sell-side posture or crossing THE LINE. |
| 2026-05-26 | MMR-001 | Market multiple provenance | Pass | Substrate requires supplied or sourced multiples before valuation/LBO reliance; uncited LBO exit multiple request returns market-intelligence requirement. |
| 2026-05-26 | MMR-002 | Market multiple packet | Pass | Substrate builds `MarketMultiplePacket.v0.1` from benchmark/comps sources and carries citations into LBO assumption resolution. |
| 2026-05-26 | MMR-003 | Model execution preflight | Pass | Valuation/LBO model inputs now pass through market-multiple preflight before deterministic execution. |
| 2026-05-26 | MCP-001 | Remote MCP demo-agent | Partial pass | Public discovery and unauthenticated MCP initialization/list passed locally; authenticated market-packet/LBO path is implemented and awaits a bearer token for live execution. |
| 2026-05-27 | MCP-E2E-001 | Authenticated fixture runner | Pass | `npm run test:definitive-mcp-e2e` passed 9/9 against local API/app (`mcp-e2e-20260527095543-bf8f9477`): BUY/SELLREP/RAISE/PMI over `/mcp`, persistence/audit rows, protected app APIs, and desktop/mobile retrieval. |

## LBO-001: Lower-Middle-Market LBO With $5M EBITDA

### Purpose

Validate that an agent can enter with a buy-side LBO fact pattern and receive the correct methodology outputs:

- content-addressed `DealState`
- classification and missing-input guidance
- model-stack routing that includes LBO support
- deterministic `MODEL.LBO.LMM.v1` outputs
- audit hashes and citation tags
- THE LINE-safe output posture

### Simulated Deal Profile

| Field | Value |
| --- | ---: |
| Journey | buy |
| Target | Simulated LBO Target |
| Industry | B2B services |
| Jurisdiction | US |
| Deal type | lower-middle-market acquisition LBO |
| Entry EBITDA | $5,000,000 |
| Purchase price | $40,000,000 |
| Implied entry multiple | 8.0x EBITDA |
| Debt | $24,000,000 |
| Sponsor equity | $16,000,000 |
| Debt / EBITDA | 4.8x |
| Equity / purchase price | 40.0% |
| Hold period | 5 years |
| EBITDA growth | 5.0% annually |
| Exit multiple | 8.5x EBITDA |
| Debt paydown | $10,000,000 |

### Raw Model Inputs

```json
{
  "purchase_price_cents": 4000000000,
  "debt_cents": 2400000000,
  "sponsor_equity_cents": 1600000000,
  "entry_ebitda_cents": 500000000,
  "exit_multiple": 8.5,
  "hold_years": 5,
  "ebitda_growth_pct": 0.05,
  "debt_paydown_cents": 1000000000
}
```

### DealState Output

| Output | Value |
| --- | --- |
| Protocol | `DEFINITIVE.deal-state.v0.1` |
| State ID | `dealstate_71f80bda71feb293` |
| CID | `definitive:deal-state:sha256:71f80bda71feb29375d4fb68470eb6f1966c6f664720f063d0a1a494eab59b0a` |
| State hash | `71f80bda71feb29375d4fb68470eb6f1966c6f664720f063d0a1a494eab59b0a` |
| Journey | buy |
| Sub-journey | healthy_buy_side |
| League | L4 |
| Jurisdiction | US |
| Industry | B2B services |
| Triggered overlays | none |
| Completeness level | `DRL4_DILIGENCE_READY` |
| Completeness score | 80 |
| Missing input status | `sufficient_for_next_step` |
| Minimal next input set | `deal_structure` |
| Source index count | 2 |
| Methodology version | V19 |
| Spec version | DEFINITIVE.v1.0 |

Satisfied completeness checks:

- `journey_classified`
- `deal_subject_present`
- `industry_present`
- `jurisdiction_present`
- `economic_scale_present`
- `source_trail_present`
- `file_universe_present`

Next suggested calls:

| Priority | Tool | Reason |
| --- | --- | --- |
| P0 | `update_deal_payload` | Collect `deal_structure`. |
| P1 | `check_completeness` | Re-score before creating or updating artifacts. |
| P0 | `compose_model_stack` | Translate classification and overlays into applicable M101-M223 model stack. |

Portable take-back artifacts:

- `DealState`
- `ClassificationKey`
- `MissingInputContract`
- `CompletenessReport`
- `MCPCallHint[]`

### Model Stack Output

| Output | Value |
| --- | --- |
| Journey | buy |
| League | L4 |
| Complexity | MEDIUM_HEAVY |
| Primary metric | EBITDA |
| Triggered overlay gates | none |
| Applicable mechanics count | 28 |
| Executable mechanics | 22 |
| Planning-only mechanics | 3 |
| Professional-handoff mechanics | 11 |
| Research-only mechanics | 1 |

Primary models:

- `MODEL.VAL.EBITDA.v1`
- `MODEL.VAL.TRIANGULATION.v1`
- `MODEL.DEAL.SCORE.v1`
- `MODEL.BUYER.FIT.v1`

Supporting models:

- `MODEL.STRUCT.NWC.PEG.v1`
- `MODEL.QOE.LITE.v1`
- `MODEL.DEAL.COMPARISON.v1`
- `MODEL.LBO.LMM.v1`
- `MODEL.COVENANT.COMPLIANCE.v1`

Tax/legal models:

- `MODEL.TAX.STRUCTURE.v1`
- `MODEL.LEGAL.HALTSCAN.v1`

Sensitivity models:

- `MODEL.SENSITIVITY.MATRIX.v1`
- `MODEL.MARKET.CONTEXT.v1`
- `MODEL.STRUCT.EARNOUT.MC.v1`

Top methodology mechanics surfaced:

- `M109` Working capital peg
- `M210` Closing-statement true-up sequence
- `M119` SBA 7(a) post-SOP 50 10 8
- `M139` 1060 seven-class allocation
- `M200` Transaction tax master engine
- `M201` 338(h)(10) and 336(e) gross-up math
- `M136` Fraudulent-transfer baseline
- `M148` Three-prong solvency

### LBO Runtime Output

Model:

```text
MODEL.LBO.LMM.v1
```

Status:

```text
complete
```

Outputs:

| Output | Raw value | Human-readable |
| --- | ---: | ---: |
| `entry_leverage` | 4.8 | 4.8x debt / EBITDA |
| `sponsor_equity_pct` | 0.4 | 40.0% |
| `exit_ebitda_cents` | 638140781 | $6,381,407.81 |
| `exit_enterprise_value_cents` | 5424196639 | $54,241,966.39 |
| `exit_equity_value_cents` | 4024196639 | $40,241,966.39 |
| `moic` | 2.52 | 2.52x |
| `simple_irr` | 0.2026 | 20.26% |

Missing inputs:

```json
[]
```

Citation tags:

```json
[
  "[FRED:SOFR]",
  "[FRED:BAMLH0A0HYM2]"
]
```

Output hash:

```text
6c65333dab25636b7ee75114fd99a30a1e3316faa7cfd65c6e0f86feb2eac9d6
```

Audit payload:

```json
{
  "modelId": "MODEL.LBO.LMM.v1",
  "version": "v1",
  "specVersion": "DEFINITIVE.v1.0",
  "specUri": "definitive://v1",
  "methodologyVersion": "V19",
  "methodologyUri": "methodology://v19",
  "dealId": null,
  "userId": null,
  "conversationId": null,
  "inputHash": "46d47f1dc4c2e46c1bd1d89bdfdf274d65416a6326c64db325243b58d94c4b84",
  "outputHash": "6c65333dab25636b7ee75114fd99a30a1e3316faa7cfd65c6e0f86feb2eac9d6",
  "missingInputs": [],
  "executedAt": "2026-05-26T19:53:47.647Z"
}
```

### Test Assessment

Pass.

The agent can enter with a plausible LBO fact pattern and receive:

- a valid L4 buy-side DealState
- a clear missing-input contract asking for deal structure
- model-stack routing that includes `MODEL.LBO.LMM.v1`
- complete deterministic LBO output
- hashes and citations for auditability
- no missing runtime inputs

Important limitation:

The current LBO runtime is a simplified lower-middle-market model. It computes entry leverage, sponsor equity percentage, exit EBITDA, exit enterprise value, exit equity value, MOIC, and simple IRR. It does not yet output a year-by-year debt schedule, interest expense, cash sweep, tax cash flows, maintenance covenants, or full sources-and-uses waterfall inside this runtime envelope.

Recommended follow-up tests:

- LBO sensitivity: exit multiple from 7.0x to 9.5x and EBITDA growth from 0% to 8%.
- Downside LBO: flat EBITDA, lower exit multiple, reduced debt paydown.
- Covenant-linked LBO: run `MODEL.COVENANT.COMPLIANCE.v1` alongside the LBO.
- Solvency/handoff case: run `M148` / `MODEL.RESTRUCTURING.SOLVENCY.THREE_PRONG.v1` for high-leverage LBO scenarios.
- Document path: generate an IC memo or lender book from the LBO output.

## LOI-001: External Agent Looking For An LOI

### Purpose

Validate that an external assistant can ask for LOI prep and receive a governed substrate response instead of an unauthorized binding offer, legal clause draft, or external transmission.

### Simulated Deal Profile

| Field | Value |
| --- | --- |
| Journey | buy |
| Target | LOI Ready HVAC Co. |
| Industry | HVAC services |
| Jurisdiction | US-TX |
| Revenue | $24,000,000 |
| EBITDA | $5,000,000 |
| Purchase price / EV | $40,000,000 |
| Structure | Asset purchase with senior debt, sponsor equity, seller note, and confirmatory diligence |
| Model state | `MODEL.LBO.LMM.v1` output hash present |
| Source coverage | Financials, tax, legal, and commercial documents present |

### Results

| Check | Expected | Result |
| --- | --- | --- |
| Ingest external-agent LOI payload | Buy-side `DealState` | Pass |
| Completeness | `term_architecture_present`, `model_state_present`, `DRL4_DILIGENCE_READY` | Pass |
| LOI packet | `LOIPacket.v0.1` | Pass |
| Source coverage | No LOI source-category gaps | Pass |
| Economic terms | Purchase price and EBITDA carried as payload facts | Pass |
| Closing conditions | Diligence condition and exclusivity carried as payload facts | Pass |
| Model dependency | `not_blocked` | Pass |
| Boundaries | No binding offer, no clause drafting, no external transmission | Pass |
| Next calls | `compose_document_draft`, `prepare_diligence_request`, `prepare_negotiation_brief` | Pass |
| Draft scaffold | `DocumentDraft.v0.1` with `documentType: "loi_outline"` | Pass |
| Draft source policy | Unsourced claims disallowed | Pass |

### Test Assessment

Pass.

This is the first explicit LOI agent simulation in the methodology matrix. It proves the substrate can help an agent prepare an internal LOI architecture packet while keeping counsel/user decisions, clause language, binding status, negotiation, and external delivery outside the automated tool boundary.

Readable output artifact:

- `testing/definitive/results/loi-001-agent-output.md`

## SELLREP-001: Sell-Side Owner / Owner-Rep Coverage

### Purpose

Validate that an agent representing the owner, founder, seller, broker, banker, or other sell-side advisor can enter anywhere in the seller process and receive sell-side preparation artifacts rather than buyer-offer behavior.

### Coverage

| Entry Point | Simulated Need | Expected Substrate Behavior | Result |
| --- | --- | --- | --- |
| S0 Intake | Owner rep says they need LOI/DD readiness, without explicit `journey: "sell"` | Infer `journey: "sell"` and return `representationContext.side: "sell_side"` | Pass |
| S1 Financials | Owner adds revenue, SDE, EBITDA, and financial source | Prepare pre-IOI/readiness packet with no external transmission | Pass |
| S3 Package / Data Room | Owner rep prepares seller data room and buyer diligence response | Return `DataRoomIndex`, no core source gaps, and seller diligence readiness draft | Pass |
| S4 Incoming LOI | Owner rep reviews buyer LOI terms | Return `LOIPacket`, `NegotiationBrief`, and seller LOI readiness draft without binding acceptance, clause drafting, negotiation, or external send | Pass |
| S5 Closing Prep | Owner rep prepares close readiness and funds flow | Return `CloseReadiness` and `FundsFlow` with no closing authority, money movement, or wire instructions | Pass |

### Substrate Behavior Added

Deal OS artifacts now carry a `representationContext` object that identifies sell-side, buy-side, raise-side, PMI, or unknown posture without changing the core DealState protocol. For sell-side work it includes an owner/owner-rep preparation path:

- classify owner/owner-rep mandate and sale-process stage
- normalize SDE/EBITDA, add-backs, working capital, valuation, and market support
- index data-room sources and identify seller-side source gaps
- prepare for incoming IOIs/LOIs without drafting clauses, accepting terms, or sending externally
- prepare diligence-response packets, disclosure subsets, and advisor/counsel handoffs
- stage close-readiness and funds-flow arithmetic without closing authority or wire instructions

Seller-specific Studio draft scaffolds were added for:

- `seller_loi_readiness`
- `seller_diligence_readiness`

### Test Assessment

Pass.

This closes the obvious seller-side representation gap in the local methodology matrix. The next useful seller-side tests are lower-quality inputs: owner rep with no financials, owner rep with partial data room, owner rep with an incoming LOI but no model outputs, and owner rep with a buyer diligence request containing sensitive/private data-room categories.

Verification:

- `npm run test:definitive-agent-methodology` returned 45 passed, 0 failed.
- `npm run test:definitive-surface` returned 42 passed, 0 failed.
- `npm run test:definitive-conformance` returned 472 passed, 0 failed.
- `npx tsc --noEmit --pretty false` passed.

## MMR-001: Market Multiple Resolution Guard

### Purpose

Validate that valuation-sensitive calculations cannot silently invent target, entry, or exit multiples.

### Contract Tested

The substrate can use a multiple only when it is:

- supplied by the calling agent/user and labeled as an assumption
- attached through a cited market-intelligence packet
- explicitly handled as a scenario/sensitivity assumption

If none of those are true, the substrate must return missing-input/source-gap guidance instead of running a valuation-sensitive calculation on fabricated market assumptions.

### Results

| Check | Expected | Result |
| --- | --- | --- |
| LBO with industry and economics but no exit multiple | `needs_market_intelligence` | Pass |
| LBO with agent-supplied `exit_multiple` | `resolved` with `agent_supplied` provenance and warning | Pass |
| Valuation with cited market packet | `resolved` with `market_packet` provenance and citations | Pass |
| Market packet from benchmark + closed-deal comps | `MarketMultiplePacket.v0.1` with high confidence and citations | Pass |
| LBO using market packet | `market_packet` provenance carried into `exit_multiple` assumption | Pass |
| Model preflight with market packet | Inject sourced `exit_multiple` before LBO execution | Pass |
| Model preflight without market support | Block with `needs_market_intelligence` | Pass |
| Deterministic LBO runtime without `exit_multiple` | `needs_inputs` and no outputs | Pass |

### Substrate Behavior Added

`fetch_market_data` now supports market-multiple packet resolution in addition to cached series lookup. Agents can call it with `dataType: "market_multiples"` or a valuation/LBO/comps calculation plus industry/NAICS context.

Packet source order:

- NAICS benchmark range where available.
- Closed-deal comp statistics where available.
- Missing-input/source-gap response where industry/NAICS or market evidence is absent.

`execute_model` and `run_model_iteration` now perform market-multiple preflight for valuation/LBO models. The execution path can inject sourced packet values into model input, or block execution with a market-intelligence/source-gap response before deterministic math runs.

### Verification

Command:

```bash
npm run test:definitive-agent-methodology
```

Output:

```text
45 passed, 0 failed
```

TypeScript:

```bash
npx tsc --noEmit --pretty false
```

Output: pass with no compiler errors.

Surface smoke:

```bash
npm run test:definitive-surface
```

Output:

```text
42 passed, 0 failed
```

## MCP-001: Remote MCP Demo-Agent Sequence

### Purpose

Exercise the connector-facing HTTP/MCP surface rather than only local service functions.

### Sequence Added

The demo agent script now performs this authenticated path when `DEFINITIVE_MCP_ACCESS_TOKEN` or `DEFINITIVE_APP_JWT` is provided:

- `ingest_deal_payload` with a partial HVAC buy-side payload.
- `fetch_market_data` with `dataType: "market_multiples"` to obtain `MarketMultiplePacket.v0.1`.
- `execute_model` for `MODEL.LBO.LMM.v1` without an explicit `exit_multiple`, relying on the packet preflight to inject the sourced exit multiple.
- Assert model status, market provenance, output hash, persisted model execution id, and MOIC output.

### Local Verification

Command:

```bash
npm run test:definitive-remote-mcp
```

Output without auth token:

```text
2 passed, 0 failed
```

Authenticated calls were skipped because no `DEFINITIVE_MCP_ACCESS_TOKEN` or `DEFINITIVE_APP_JWT` was present in the shell. This is expected for an unauthenticated local smoke run.
