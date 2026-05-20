# DEFINITIVE Build Plan

**Status:** Canonical build plan for the agent-access substrate.  
**Created:** May 20, 2026.  
**Codename:** DEFINITIVE.  
**Baseline:** V19 remains the current methodology/runtime baseline. DEFINITIVE v1.0 is the public/spec/runtime target that rolls V19 forward into an agent-callable M&A diligence substrate.  
**Primary source:** `/Users/paul/Downloads/v19/DEFINITIVE_v1_0.md.pdf`.

## One-Line Doctrine

smbX is the M&A diligence substrate. Yulia is the human reference surface.

Stop treating app vs infrastructure as a fork. Both ship. The app proves the substrate to humans; the substrate is the moat agents, enterprises, boards, and LPs can trust.

## Naming Decision

DEFINITIVE replaces the working names "V20" and "The Diligence Standard."

- **Public product:** smbX.
- **Human surface:** Yulia.
- **Agent/spec/runtime codename:** DEFINITIVE.
- **Public version target:** DEFINITIVE v1.0.
- **Methodology baseline:** V19, referenced internally as the v0.x foundation that DEFINITIVE v1.0 supersedes for agent access.

V19 docs remain useful and should not be discarded. New build work should map V19 gates, models, artifacts, and audit primitives into DEFINITIVE versioned contracts.

## Product Shape

DEFINITIVE is a deterministic, versioned, citation-validated, methodology-pinned, audit-trailed M&A diligence layer callable by Yulia, the app, API clients, and external agents.

The stack has six layers:

| Layer | Role | Determinism requirement |
|---|---|---|
| L1 Calc Engine | Financial, tax, legal-logic, market, and deal math as pure functions. | Same inputs + same version -> same outputs. |
| L2 Versioned Content DB | Authority Register, methodology sections, jurisdiction overlays, conformance cases. | Deterministic and versioned. |
| L3 Auditor | Re-checks outputs against model definitions, methodology pins, citations, and freshness. | Deterministic. |
| L4 Author | Yulia/LLM narrative for memos, books, summaries, and chat. | Stochastic but never final without L6 validation. |
| L5 Market Intel | Live/cached FRED, HSR, IRS, FTC, ABA/SRS/Marsh/PitchBook-style sources with as-of stamps. | Deterministic per snapshot. |
| L6 Citation Validator | Every non-calc claim resolves to an authority/source or is flagged/stripped. | Deterministic hard gate. |

L1 + L2 + L6 are the spine. L4 is a drafting layer, not the source of truth.

## Non-Negotiables

1. Every serious number comes from a deterministic model, uploaded/source file, or timestamped market-data source.
2. Every material claim has an Authority Register/source citation or an explicit unsupported state.
3. Every model-backed answer, Studio export, gate move, publish/share path, and external agent call writes an audit record.
4. Every tool accepts a methodology/spec version and refuses unknown versions.
5. The customer is the beneficial principal, not the agent platform that routed the call.
6. THE LINE compliance is enforced in code through structured refusal states.
7. Pricing remains software pricing: subscriptions, credits, per-call compute, fixed deliverables, enterprise platform/corpus fees. No success fees, no deal-value fees, no wallet revival.
8. Human UI remains beautiful: Apple Glass + Neo for the app, Studio-style saved primitives reused without drift.

## v1.0 Target Scope

| Component | v1.0 target | Notes |
|---|---:|---|
| Gates | 27 | V19 22 gates plus International, Cyber/Privacy/AI, PMI, Continuation Fund, Alt Exit. |
| Deterministic deal models | 38 | M101-M138 style model catalog; V19 existing server models become the first batch. |
| Document generators | 13 | US production variants first. International generators ship research-only until counsel review. |
| Authority Register | 500+ entries | Delaware, federal tax/regulatory, NY/CA/TX, studies, datasets, model forms, treatises. |
| Conformance tests | 750 | Expand to 1,000 in v1.2. Tests must run against TypeScript and Python reference implementations. |
| Reference implementations | 2 | TypeScript and Python under MIT license. |
| Public spec | 1 | `v1.definitive.smbx.ai` or equivalent, with citable section URIs. |

## Current Repo Baseline

The repo is already partway there from V19:

- `MODEL.*.v1` server-side runtime exists and persists model executions.
- Tier-0 model catalog has first-pass deterministic fixtures.
- Studio books, versions, sources, exports, readiness, provenance, PPTX/PDF export, and pitch-book tools exist.
- `audit_trail`, V19 usage events, plan entitlements, tollgate states, and model/export/chat audit writes exist.
- Internal resource contract exists for Studio/source/model/audit/gate resources.
- Today, Pipeline, Files, Search, Pricing, and Studio have human-facing V6 surfaces.
- Demo Yulia has public demo deal/portfolio context.

The gap is not "start over." The gap is to formalize the substrate: Authority Register, spec-versioned MCP tools, beneficial-customer identity, mandate chain, conformance tests, and hard citation/audit gates across all high-stakes paths.

## Build Lanes

### Lane A - Human Product Surface

Goal: the app remains the best demo and daily working environment.

- Keep V6 as the only shell.
- Keep Apple Glass + Neo, App Store + Neo, and saved Studio primitives as the design language.
- Studio remains the flagship creation surface.
- Today remains the daily operating surface.
- Pipeline becomes methodology Kanban and deal movement.
- Search becomes market discovery.
- Files becomes proof/source routing.
- Pricing/Learn explain subscriptions, credits, tollgates, agent access, and THE LINE without sounding like infrastructure docs.

### Lane B - Deal Runtime

Goal: every human action is backed by real deal state.

- Deal state, gate state, model stacks, assumptions, model runs, files, citations, Studio books, exports, approvals, counsel deferrals, and audit records are durable objects.
- Yulia answers from these objects before generating narrative.
- Client models stay interactive, but exported/shared/model-backed claims must run through server-side canonical models.
- Pipeline stages are league-defined and methodology-pinned.

### Lane C - Callable Substrate

Goal: agents can call the same work the app uses.

- MCP/API surfaces are thin adapters over the internal runtime, not separate systems.
- Tools return structured JSON first; human rendering is a separate step.
- Every call has actor, platform, beneficial customer, mandate, version pin, input hash, output hash, citation refs, billing attribution, and THE LINE status.

## Agent Tool Surface v1

| Tool | Purpose | Current status | v1 done condition |
|---|---|---|---|
| `lookup_citation` | Resolve claims to Authority Register/source entries. | V19 citation lookup exists but not full Authority Register. | Backed by `authority_register`; free introspection; returns source URIs, status, effective dates. |
| `fetch_market_data` | Pull timestamped market/regulatory datasets. | Market-data cache/service exists. | Adds freshness states, FRED refresh, HSR/IRS/FTC snapshots, source hashes. |
| `defer_to_counsel` | Structured THE LINE/legal/tax escalation. | Tool exists. | Every risky action can produce `LINE_VIOLATION` or counsel routing packet. |
| `compose_model_stack` | Return required models/citations by deal archetype/gate. | Tool exists. | Deep league x journey x deal-type composition with version pinning. |
| `execute_model` | Run deterministic model by id/version. | Tool exists and persists model executions. | All high-stakes paths use it; all outputs have input/output hashes and audit ids. |
| `validate_conformance` | Run conformance checks against deliverables. | Greenfield. | 750-case suite, local + hosted validation, machine-readable pass/fail report. |
| `write_audit_trail` | Write immutable call/output record. | Tool exists for V19 audit rows. | Full mandate-chain, beneficial-customer, version, citation, hash, and billing fields. |

## Identity And Billing Architecture

Every external/substrate call needs the four-layer identity stack:

| Field | Meaning |
|---|---|
| `agent_id` | The AI agent or automation making the call. |
| `agent_platform_id` | Claude, ChatGPT, Agentforce, Copilot, direct, etc. |
| `beneficial_customer_id` | The entity on whose behalf the work is done. This keys billing. |
| `billing_org_id` | The organization paying the invoice; usually the beneficial customer. |

Add:

- `mandate_id`
- `mandate_scope`
- `mandate_expiry`
- `payment_method_id`
- `spec_version`
- `tool_name`
- `input_hash`
- `output_hash`
- `citation_refs`
- `line_status`

Transport auth can use OAuth/JWT. Billing and audit trust must use the beneficial-customer + mandate chain.

## THE LINE Contract

Every tool/action must be classified before it ships:

| Status | Meaning |
|---|---|
| `ok` | Software work inside allowed scope. |
| `human_approval_required` | Sensitive but allowed after explicit user approval. |
| `counsel_review_required` | Needs professional review before final output/action. |
| `enterprise_scope_required` | Requires enterprise governance/scope. |
| `credit_budget_required` | Needs included credits or contracted budget. |
| `LINE_VIOLATION` | Refuse by construction; do not complete the action. |

Example refusal shape:

```json
{
  "error": "LINE_VIOLATION",
  "violation_type": "transaction_recommendation",
  "remedy": "defer_to_counsel",
  "counsel_routing": {
    "category": "broker_dealer_question",
    "jurisdiction": "US-DE"
  }
}
```

## Pricing Architecture

Public human tiers remain:

- Free
- Solo
- Pro
- Team
- Enterprise

DEFINITIVE adds agent/substrate packaging without changing the doctrine:

| Layer | Pricing shape | Rule |
|---|---|---|
| Human seats | Monthly subscription | Safe software subscription. |
| Per-call MCP/API | Fixed software compute per call | Paid regardless of deal outcome. |
| Per-deliverable | Fixed software deliverable price | Never tied to deal value or close. |
| Enterprise platform/corpus | Annual substrate and corpus access fee | Contracted software/platform access. |
| Marketplace co-billing | Platform rev-share on smbX software revenue | Channel cost, not deal compensation. |

Credits are plan allowances and governance controls, not a consumer wallet.

## Open-Source Posture

Open under MIT:

- DEFINITIVE spec
- JSON schemas
- Gate definitions
- Conformance test inputs/expected outputs
- TypeScript reference implementation
- Python reference implementation
- Authority Register schema
- Documentation site source

Keep proprietary:

- Populated Authority Register
- Hosted production calc engine with live updates
- Live market-data integrations and freshness SLAs
- Audit trail and mandate-chain infrastructure
- Customer accounts, billing, and data-rights controls
- Sub-$1B corpus and benchmark snapshots

## Consecutive Build Runs

### Run 1 - Canonical Docs And Naming

**Goal:** repo stops oscillating between V19/V20/DEFINITIVE.

- Add this plan.
- Update repo status and agent instructions.
- Add V19 -> DEFINITIVE mapping.
- Keep V19 docs as baseline, not current endpoint.

**Done when:** fresh reader knows DEFINITIVE v1.0 is the active agent-access target.

### Run 2 - Authority Register Foundation

**Goal:** create the L2 content spine.
**Status:** Started in repo. Migration `073_definitive_authority_register.sql` creates the first Authority Register schema, seeds 50 active US authorities, and wires `lookup_citation` through the register while preserving V19 `citation_registry` compatibility.

- Add `authority_register` schema.
- Add `methodology_sections` authority links if not already present.
- Add `authority_id`, category, jurisdiction, source URL, effective date, supersession, status, validation metadata.
- Seed first 50 US authorities.
- Add ingestion/check scripts.

**Done when:** `lookup_citation` can query real Authority Register rows and returns active/deprecated/freshness state.

### Run 3 - Spec Versioning And Methodology Pins

**Goal:** make reproducibility explicit.
**Status:** Started in repo. Migration `074_definitive_version_pins.sql` adds `DEFINITIVE.v1.0` / `methodology://v19` pins to audit trail, model executions, Studio versions/exports, and deal model stacks. Current model, audit, Studio, and resource-read paths now persist or expose those pins for agent reproducibility.

- Add `spec_version` / `methodology_version` to model runs, Studio exports, audit trail, gate state, and tool calls.
- Reject unknown versions.
- Add public/internal URI conventions:
  - `definitive://v1/gates/...`
  - `definitive://v1/models/...`
  - `definitive://v1/authorities/...`
  - `definitive://v1/artifacts/...`

**Done when:** a model execution or Studio export can be reproduced by version pin + input hash.

### Run 4 - Beneficial Customer And Mandate Chain

**Goal:** make agent billing/audit attribution correct.
**Status:** Started in repo. Migration `075_definitive_mandate_chain.sql` adds beneficial customer records, external agent identities, agent mandates, and mandate-chain fields on audit, usage, action, and model-execution records. Runtime usage/audit writers now resolve a default human-session mandate context and can carry external agent mandate IDs when present.

- Add beneficial-customer identity fields to usage/audit/call records.
- Add mandate records with scope, expiry, signature placeholder, and spend cap.
- Add AP2-compatible shape, even if cryptographic signing is feature-flagged.
- Add org-level usage buckets keyed by beneficial customer, not channel.

**Done when:** an agent call can be attributed to the principal and audited independently of the platform.

### Run 5 - MCP v0.1

**Goal:** first callable substrate.

- Expose `tools/list`.
- Expose `lookup_citation`, `fetch_market_data`, `defer_to_counsel`.
- Use OAuth-ready request structure, even if local dev auth is simplified.
- Add `.well-known` metadata or agent-card updates for DEFINITIVE scope.

**Done when:** Claude Code or another local MCP client can list and call the three tools.

### Run 6 - Model Stack And Execute Model MCP

**Goal:** expose real deterministic deal work.

- Add `compose_model_stack`.
- Add `execute_model`.
- Require model id + version pin.
- Return structured output, citation refs, input hash, output hash, audit id.
- Price/meter through existing V19 entitlement service.

**Done when:** five reference deals can run reproducible server models through the tool surface.

### Run 7 - THE LINE Enforcement Pass

**Goal:** compliance by construction.

- Inventory every existing tool/action.
- Assign THE LINE status and refusal behavior.
- Add structured refusal results.
- Ensure every externally visible action has approval/counsel/enterprise/credit gates.

**Done when:** no tool can recommend, negotiate, represent, guarantee, or tie fees to transaction outcome.

### Run 8 - Conformance Harness

**Goal:** test the substrate as a standard.

- Add conformance test runner.
- Start with 100 cases across WC peg, earnout, MAE, indemnification, tax, R&W, financing, post-close, controller/SB 21, and meta tests.
- Grow to 400 by pre-v1.
- Grow to 750 for v1.0.

**Done when:** CI can run conformance tests against the TypeScript implementation.

### Run 9 - TypeScript Reference Implementation

**Goal:** open implementation proof.

- Extract deterministic model schemas and pure functions.
- Publish internal package path first.
- Add README and example calls.
- Keep Authority Register data out; include fixture/sample authorities only.

**Done when:** external developer can clone/run tests without private app services.

### Run 10 - Python Reference Implementation

**Goal:** finance/agent ecosystem reach.

- Port TS schemas and deterministic models.
- Match conformance expected outputs exactly.
- Add package scaffolding.

**Done when:** TS and Python pass the same conformance cases.

### Run 11 - Audit Packet v1

**Goal:** make outputs defensible.

- Build downloadable audit packet JSON.
- Include input/output hashes, model executions, source hashes, citation refs, methodology/spec pin, approvals, counsel deferrals, and export hashes.
- Add seven-year retention design and append-only manifest shape.

**Done when:** a Studio export and a model-backed chat answer both produce audit packets.

### Run 12 - Studio And QoE On DEFINITIVE

**Goal:** make Studio prove the substrate.

- Tie Studio source grounding to Authority Register where applicable.
- Make QoE Preview use server models, source cards, and audit packets end to end.
- Export PPTX/PDF with source appendix and machine-readable audit appendix.

**Done when:** upload/source files -> extract facts -> run QoE Lite/NWC/add-back checks -> Studio book -> export -> audit packet works.

### Run 13 - Pipeline And Today On DEFINITIVE

**Goal:** make daily deal work methodology-pinned.

- Pipeline stages/gates use `definitive://` pins.
- Today reads model freshness, citation gaps, files needing review, gate blockers, and Studio refresh needs from durable state.
- Yulia explains every move from deal state.

**Done when:** a user can ask why a deal moved and Yulia cites gate/model/source/audit state.

### Run 14 - Files And Search On DEFINITIVE

**Goal:** proof and market discovery become callable substrate.

- Files: source cards, hashes, permissions, data-room routing, stale/source-gap states.
- Search: buyer pools, target lists, lenders, advisors, market citations, reusable artifacts.
- Both write audit/source records.

**Done when:** market and file outputs can be reused by Studio, Today, Pipeline, and MCP calls.

### Run 15 - Corpus And Data Rights Foundation

**Goal:** prepare the long-term moat without over-collecting.

- Add data-rights grants.
- Add anonymized benchmark observation schema.
- Capture structured deal-term observations only.
- Exclude raw customer documents from corpus.
- Add aggregation thresholds before benchmark output.

**Done when:** permitted NWC/add-back/earnout/R&W/financing observations can be stored without identifying parties.

### Run 16 - Public Spec Site

**Goal:** make DEFINITIVE citable.

- Build docs site under `v1.definitive.smbx.ai` or `/definitive/v1`.
- Add citable URIs for gates, models, authorities, conformance cases, tool contracts, and THE LINE states.
- Publish V19 -> DEFINITIVE changelog.

**Done when:** a public README or agent can link to stable spec sections.

### Run 17 - Distribution Shells

**Goal:** prepare agent discovery without paid channels.

- MCP Registry submission package.
- OpenAI Apps Directory package.
- Microsoft Agent Store shell.
- GitHub public repos for spec and reference implementations.
- Keep paid marketplace activation gated until revenue.

**Done when:** all submission artifacts exist and can be toggled public when ready.

### Run 18 - Enterprise Trust Path

**Goal:** be ready when procurement asks.

- SOC 2-ready controls docs.
- Access controls, encryption, audit logging, change management, vendor list.
- ISO 42001/EU AI Act risk-tier logic documentation.
- Single-tenant/VPC option path.

**Done when:** first enterprise prospect can be shown a credible controls packet even before formal audit spend.

## 90-Day Build Order

1. Docs/naming lock.
2. Authority Register schema + 50 seed entries.
3. Spec versioning and URI pins.
4. Beneficial-customer + mandate-chain fields.
5. MCP v0.1 with `lookup_citation`, `fetch_market_data`, `defer_to_counsel`.
6. `compose_model_stack` + `execute_model` through MCP/internal agent surface.
7. THE LINE action inventory.
8. First 100 conformance tests.
9. Audit packet v1 for Studio export and model-backed chat.
10. QoE Preview end-to-end through server models and source grounding.

## 12-Month Milestones

| Window | Milestone | Acceptance |
|---|---|---|
| Month 0-1 | Foundation | Authority Register schema, 50 entries, MCP v0.1, docs site scaffold, THE LINE position published internally/publicly. |
| Month 2-3 | V19 anchoring | 250 authority entries, all 22 V19 gates anchored, first 5 deterministic models callable through MCP/internal surface. |
| Month 4-6 | Models + audit | 38-model target substantially implemented, 27 gates wired, audit/mandate logging live, first paid QoE Preview path ready. |
| Month 7-9 | Conformance + reference impls | 500 authorities, 400 conformance tests, TS/Python reference implementations published internally or publicly. |
| Month 10-12 | DEFINITIVE v1.0 launch | 750 tests, public spec, V19 -> DEFINITIVE changelog, first external agent call, first enterprise/design-partner contract target. |

## Cut Rules

If scope slips:

1. Do not cut deterministic calc or citation validation.
2. Do not cut THE LINE enforcement.
3. Cut international before US.
4. Cut document generators before deal models.
5. Cut test count before Authority Register depth.
6. Cut marketplace/listing work before core substrate.
7. Cut UI experiments before app coherence and saved design primitives.

## Current Next Actions

1. Create `authority_register` migration and seed script.
2. Add `spec_version` to V19 audit/model/export/tool records.
3. Add beneficial-customer and mandate-chain fields to usage/audit events.
4. Convert existing V19 tool metadata into DEFINITIVE MCP tool contracts.
5. Write THE LINE status inventory for every registered tool/action.
6. Add first conformance harness around existing deterministic model fixtures.
7. Tie Studio export audit packet to the new version/citation/hash shape.

## Definition Of Done For DEFINITIVE v1.0

DEFINITIVE v1.0 is done when:

- Human app remains coherent and polished.
- Agents can call the substrate through stable tools.
- 27 gates are version-pinned.
- 38 deterministic models are implemented or explicitly deferred with rationale.
- 500+ authorities are registered.
- 750 conformance cases pass.
- Studio/QoE export path produces source-grounded output plus audit packet.
- Every high-stakes action has citation, approval, enterprise, credit, or THE LINE gates.
- Billing keys on beneficial customer.
- Public spec and reference implementations exist.
- No part of the system depends on a generic LLM claim being trusted without validation.
