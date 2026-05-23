# DEFINITIVE Build Plan

**Status:** Canonical build plan for the agent-access substrate.  
**Created:** May 20, 2026.  
**Codename:** DEFINITIVE.  
**Baseline:** V19 remains the current methodology/runtime baseline. DEFINITIVE v1.0 is the current public/spec/runtime pin. DEFINITIVE v1.1 / V20 supersedes the model-catalog and gate-routing portions for forward build planning.
**Primary sources:** `/Users/paul/Downloads/v19/DEFINITIVE_v1_0.md.pdf`, `methodology/DEFINITIVE_V1_1_DEAL_MECHANICS.md`, and `/Users/paul/Downloads/v19/DEFINITIVE Substrate Architecture_ From Model Corpus to Terminal M and A Deal Platform.pdf`.

## One-Line Doctrine

smbX is the Deal OS and M&A diligence substrate for humans and agents. Yulia is the human reference surface.

Stop treating app vs infrastructure as a fork. Both ship. The app proves the substrate to humans; the substrate is the moat agents, enterprises, boards, and LPs can trust.

## Naming Decision

DEFINITIVE replaces the working names "V20" and "The Diligence Standard."

- **Public product:** smbX.
- **Human surface:** Yulia.
- **Agent/spec/runtime codename:** DEFINITIVE.
- **Public version target:** DEFINITIVE v1.0 runtime and DEFINITIVE v1.1 / V20 deal-mechanics catalog.
- **Methodology baseline:** V19, referenced internally as the v0.x foundation that DEFINITIVE supersedes for agent access.

V19 docs remain useful and should not be discarded. New build work should map V19 gates, models, artifacts, and audit primitives into DEFINITIVE versioned contracts.

## Product Shape

DEFINITIVE is a deterministic, versioned, citation-validated, methodology-pinned, audit-trailed M&A diligence layer callable by Yulia, the app, API clients, and external agents.

The app is not a demo sitting on top of the substrate. The app is the Deal OS working environment. The agent surface is not a separate product. It is another way to operate the same DealState, methodology gates, source record, model stack, completeness contract, and package output.

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

The May 21 substrate-architecture memo adds the next distinction: the 123-model catalog is the library, not the terminal substrate. The terminal substrate needs eight orchestration primitives around the library:

| Primitive | Build target |
|---|---|
| Deal payload ingest | One `ingest_deal_payload` entrypoint accepts arbitrary input and returns classification plus a missing-input contract. |
| Eight-axis classification | Deterministic routing key: journey, sub-journey, league, jurisdiction, distress posture, asset class, industry, and tax classification. |
| Persistent DealState | Content-addressable, versioned, durable state with parent CIDs and Merkle state hash. |
| Dependency graph + action cache | Bazel-style action-key caching and cascade invalidation for model/gate recompute. |
| Completeness contract | `CompletenessSpec` and `check_completeness` compute Deal Readiness Levels without implying deal quality. |
| Permutation / best-vehicle engine | Enumerate structures, prune to Pareto frontier, and compute preference-vector outcomes without recommending. |
| Portable signed package | `DealPackage` with JSON, PDF/A-3 render, signed manifest, timestamps, and selective disclosure proofs. |
| Capability discovery + next calls | `introspect_capabilities` and universal `next_suggested_calls` guide thin agents to completion. |

### Deal OS Agent Doctrine

Agents should be welcomed into the deal even when they arrive with incomplete facts. The first call should not be a rejection because the agent lacks a full data room, final financials, counsel-reviewed terms, or a defined transaction type. It should return what DEFINITIVE can know now, what it cannot know yet, and what call or source would move the deal forward.

The recursive loop is:

`ingest payload -> classify -> compose plan -> execute deterministic work -> check completeness -> request/fetch missing inputs -> update DealState -> repeat`.

That loop carries the same methodology a human user would follow:

| Stage | What DEFINITIVE should do |
|---|---|
| Information intake | Accept partial facts, classify the deal, preserve provenance, and return a MissingInputContract. |
| IOI / indication | Produce an early sourced/caveated indication package and assumption log when the facts support it. |
| Deeper diligence | Add files, model refreshes, market facts, tax/legal mechanics, and pass-through inputs as they arrive. |
| LOI / term architecture | Convert diligence into structure, economic terms, conditions, and counsel-safe drafting scaffolds. |
| Confirmatory diligence | Re-run affected models, invalidate stale outputs, and surface blockers in Today, Files, and Pipeline. |
| Modeling and negotiation prep | Compute scenarios, sensitivities, and negotiation economics without negotiating or recommending. |
| Close / PMI | Finalize a verifiable package and preserve the surviving DealState for post-close work. |

**No-rejection contract:** an incomplete external agent call returns `ClassificationKey`, `MissingInputContract`, current/created `DealState`, and `next_suggested_calls`. It does not dead-end unless the request itself violates THE LINE.

### Agent Home And Take-Back Contract

Agents should understand smbX as a place to **return to**, not just a service to call once. A deal is iterative: new facts arrive, documents are created, diligence expands, a data room becomes more complete, terms change, models re-run, and the next best work item changes. The Deal OS needs to preserve that continuity for both people and agents.

| Deal OS surface | Agent can do here | Portable artifact the agent can take back |
|---|---|---|
| Today | Read blockers, priorities, and next actions. | `next_suggested_calls`, `CompletenessReport`, `DealStateDiff` |
| Pipeline | Track gate/stage movement by methodology and source readiness. | `GateState`, `DealPlan`, `PipelineStageDelta` |
| Files | Attach, classify, request, and cite source materials. | `SourceIndex`, `MissingInputContract`, `CitationRefs` |
| Data Room | Maintain diligence indexes, source gaps, and disclosure subsets. | `DataRoomIndex`, `DisclosureSubset`, `SourceGapList` |
| Studio | Create books, memos, briefs, diligence packets, and exports. | `DocumentDraft`, `StudioBook`, `ExportManifest` |
| Models | Execute deterministic models and update assumptions. | `ModelOutput`, `AssumptionLog`, `OutputHash` |
| Audit Package | Verify methodology pins, source hashes, model outputs, and final packages. | `AuditPacket`, `DealPackage`, `MerkleInclusionProof` |

This is why the app must stay more than a model catalog. Yulia tracks the entire deal lifecycle, including document creation and data-room work. Agents should be able to come here, work the deal like a person, then take a structured update back to their own system after each iteration.

## Non-Negotiables

1. Every serious number comes from a deterministic model, uploaded/source file, or timestamped market-data source.
2. Every material claim has an Authority Register/source citation or an explicit unsupported state.
3. Every model-backed answer, Studio export, gate move, publish/share path, and external agent call writes an audit record.
4. Every tool accepts a methodology/spec version and refuses unknown versions.
5. The customer is the beneficial principal, not the agent platform that routed the call.
6. THE LINE compliance is enforced in code through structured refusal states.
7. Pricing remains software pricing: subscriptions, credits, per-call compute, fixed deliverables, enterprise platform/corpus fees. No success fees, no deal-value fees, no wallet revival.
8. Human UI remains beautiful: Apple Glass + Neo for the app, Studio-style saved primitives reused without drift.
9. Agent access remains Deal OS access: accept incomplete payloads, continue recursively, and preserve value in DealState at every step.

## v1.1 / V20 Target Scope

| Component | v1.1 / V20 target | Notes |
|---|---:|---|
| Gates | 30 | V19/DEFINITIVE base plus G28 Distressed/Restructuring, G29 Capital Structure & Liability Management, G30 Real Estate & Asset-Class Overlays. |
| Deal-mechanics model slots | 123 | M101-M223. 95-model core ships first; LME, crypto, selected SALT/CITT, and regulated overlays stage as research-only or professional-handoff where required. |
| Document generators | 13 | US production variants first. International generators ship research-only until counsel review. |
| Authority Register | 800+ entries | Adds bankruptcy, restructuring, LME, real estate, connected tax, agreement architecture, IP, digital assets, industry-regulated overlays, recovery datasets, and THE LINE pass-through authorities. |
| Conformance tests | 750 minimum | Expand coverage by model status. Production executable models need deterministic fixtures before they can leave research/planning status. Authenticated route smoke now covers JWT + mandate-chain + protected tool execution. |
| Reference implementations | 2 | TypeScript and Python under MIT license. |
| Public spec | 1 | `v1.definitive.smbx.ai` or equivalent, with citable section URIs and v1.1 deal-mechanics catalog URIs. |

## Current Repo Baseline

The repo is already partway there from V19:

- `MODEL.*.v1` server-side runtime exists and persists model executions.
- Tier-0 model catalog has first-pass deterministic fixtures.
- Studio books, versions, sources, exports, readiness, provenance, PPTX/PDF export, and pitch-book tools exist.
- `audit_trail`, V19 usage events, plan entitlements, tollgate states, and model/export/chat audit writes exist.
- Internal resource contract exists for Studio/source/model/audit/gate resources.
- Today, Pipeline, Files, Search, Pricing, and Studio have human-facing V6 surfaces.
- Demo Yulia has public demo deal/portfolio context.
- DEFINITIVE v1.1 deal-mechanics catalog is now code-addressable at `definitive://v1.1/deal-mechanics`, with 123 model slots, G28-G30, 800+ Authority Register target, THE LINE category per model, DB-free route/deal mapping coverage, a first-class route map, and a pass-through substrate pricing rule.

The gap is not "start over." The gap is to formalize the substrate: Authority Register, expanded deal-mechanics catalog, spec-versioned MCP tools, beneficial-customer identity, mandate chain, conformance tests, hard citation/audit gates across all high-stakes paths, and the terminal substrate spine: payload ingest, DealState, dependency graph, completeness, permutations, package signing, capability discovery, and next-call hints.

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
- Agents may enter at any stage: fresh intake, IOI response, LOI package, diligence refresh, negotiation prep, close package, or PMI. The substrate should classify the entry point and continue the process.
- Incomplete agent payloads are normal. Return `MissingInputContract` and `next_suggested_calls`, not a brittle rejection, unless THE LINE requires refusal.
- Tools return structured JSON first; human rendering is a separate step.
- Every call has actor, platform, beneficial customer, mandate, version pin, input hash, output hash, citation refs, billing attribution, and THE LINE status.
- Every response should eventually carry `next_suggested_calls`, `completeness_contribution_delta`, `state_hash_after`, `methodology_version`, and `the_line_invariant`.
- Agents should be able to operate in three modes: direct tool calls, plan-driven execution from `compose_deal_plan`, or hint-driven execution by repeatedly following `next_suggested_calls`.

## Terminal Substrate Architecture

The active substrate architecture plan is now code-addressable at `definitive://v1.1/substrate-architecture` and exposed at `/api/definitive/substrate-architecture`.

### New Object Contracts

- `DealPayload`
- `MissingInputContract`
- `ClassificationKey`
- `DealState`
- `DealPlan`
- `CompletenessSpec`
- `CompletenessReport`
- `DealReadinessLevel`
- `StructurePermutation`
- `ParetoFrontier`
- `BestVehicleBlock`
- `Deliverable`
- `DealPackage`
- `SignedManifest`
- `Attestation`
- `MerkleInclusionProof`
- `CapabilityCatalog`
- `MCPCallHint`

### New MCP Tools To Stage

| Family | Tools |
|---|---|
| Payload/classification | `ingest_deal_payload`, `update_deal_payload` |
| State/plan | `compose_deal_plan`, `get_deal_state`, `diff_deal_state`, `resume_deal`, `clone_deal_state`, `link_related_deal` |
| Completeness | `check_completeness`, `get_definition_of_done` |
| Package | `finalize_deal_package`, `verify_package`, `reopen_deal_package`, `disclose_subset` |
| Permutations | `generate_permutations`, `score_permutation`, `set_objective_preference`, `compute_best_vehicle`, `expand_permutations` |
| Deliverables | `prepare_rwi_submission`, `prepare_negotiation_brief`, `generate_funds_flow`, `prepare_regulatory_filings`, `compose_pmi_plan` |
| Discovery/cost | `introspect_capabilities`, `describe_methodology`, `estimate_deal_cost` |

These are build targets, not all current runtime tools. Existing MCP v0.1 remains the stable execution surface until each contract has schema, conformance, THE LINE status, and audit behavior.

## Agent Tool Surface v1

| Tool | Purpose | Current status | v1 done condition |
|---|---|---|---|
| `lookup_citation` | Resolve claims to Authority Register/source entries. | V19 citation lookup exists but not full Authority Register. | Backed by `authority_register`; free introspection; returns source URIs, status, effective dates. |
| `fetch_market_data` | Pull timestamped market/regulatory datasets. | Market-data cache/service exists. | Adds freshness states, FRED refresh, HSR/IRS/FTC snapshots, source hashes. |
| `defer_to_counsel` | Structured THE LINE/legal/tax escalation. | Tool exists. | Every risky action can produce `LINE_VIOLATION` or counsel routing packet. |
| `compose_model_stack` | Return required models/citations by deal archetype/gate. | Tool exists. | Deep league x journey x deal-type composition with version pinning, including G28/G29/G30 trigger overlays. |
| `execute_model` | Run deterministic model by id/version. | Tool exists and persists model executions. | All high-stakes paths use it; all outputs have input/output hashes and audit ids. |
| `validate_conformance` | Run conformance checks against deliverables. | Started. | 750-case suite minimum, local + hosted validation, machine-readable pass/fail report, and production-model coverage for every executable catalog entry. |
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

**Done when:** fresh reader knows DEFINITIVE v1.0 is the current runtime pin and DEFINITIVE v1.1 / V20 is the expanded deal-mechanics target.

### Run 2 - Authority Register Foundation

**Goal:** create the L2 content spine.
**Status:** Started in repo. Migration `073_definitive_authority_register.sql` creates the first Authority Register schema, seeds 50 active US authorities, and wires `lookup_citation` through the register while preserving V19 `citation_registry` compatibility. Staged ingestion now reaches 140 active seed rows: `078_definitive_authority_register_batch2.sql` adds bankruptcy/restructuring, connected tax, Treasury, FIRPTA/real-estate tax, and IP title/lien anchors; `079_definitive_authority_register_batch3.sql` adds agreement architecture, THE LINE pass-through pricing, recovery-data, digital-asset research, regulated-industry, and real-estate pass-through-standard anchors. The DB-free seed plan is code-addressable at `definitive://v1.1/deal-mechanics/authority-seed-plan`, targets 920 planned entries against the 800+ requirement, and exposes bankruptcy, restructuring/LME, IRC/Treasury, real-estate, connected-tax, agreement-architecture, IP, pass-through pricing, recovery-data, digital-asset, regulated-industry, Delaware, market-data, methodology, and compliance/audit categories through the public spec and agent card.

- Add `authority_register` schema.
- Add `methodology_sections` authority links if not already present.
- Add `authority_id`, category, jurisdiction, source URL, effective date, supersession, status, validation metadata.
- Seed first 50 US authorities.
- Publish the 800+ seed expansion plan with category targets, source types, model/gate coverage, freshness policy, and THE LINE boundary.
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
**Status:** Started in repo. `/api/definitive/tools/list`, `/api/definitive/tools/call`, and `/api/definitive/tools/:toolName/call` expose the first authenticated DEFINITIVE v0.1 tool surface for `lookup_citation`, `fetch_market_data`, `defer_to_counsel`, `compose_model_stack`, `execute_model`, `record_corpus_observation`, and `validate_conformance`. The agent card now advertises the DEFINITIVE protocol, spec pins, manifest endpoint, tool-list endpoint, and call endpoint. `/.well-known/definitive.json` and `/api/definitive/spec` provide a single discovery manifest for agents to find tool contracts, THE LINE states, audit packet routes, conformance status, and corpus/data-rights rules without inferring them from scattered routes. The manifest and agent card now explicitly separate public discovery from authenticated discovery and authenticated execution, so governed tool calls, audit packets, and corpus writes do not look public to external agents. Calls use existing JWT auth in local/app runtime while carrying OAuth-ready identity, beneficial-customer, mandate, requested-scope, tollgate, and usage metadata.

- Expose `tools/list`.
- Expose `lookup_citation`, `fetch_market_data`, `defer_to_counsel`.
- Use OAuth-ready request structure, even if local dev auth is simplified.
- Add `.well-known` metadata or agent-card updates for DEFINITIVE scope. **First pass complete:** `/.well-known/definitive.json` mirrors the agent-facing manifest.

**Done when:** Claude Code or another local MCP client can list and call the three tools.

### Run 6 - Model Stack And Execute Model MCP

**Goal:** expose real deterministic deal work.
**Status:** Started in repo. The DEFINITIVE MCP v0.1 tool inventory now advertises `compose_model_stack` and `execute_model` alongside the initial citation, market-data, and counsel-deferral tools. These reuse the existing V19 model stack composer and deterministic model runner, with `MODEL.*.v1` IDs, source/citation metadata, output hashes, and governed execution. DEFINITIVE v1.1 / V20 adds the expanded deal-mechanics catalog as a planning/discovery layer: 123 model slots, G28/G29/G30, 800+ authority target, route/deal mapping coverage, and pass-through substrate rules. The current runtime routes G28/G29/G30 trigger overlays into `compose_model_stack` without pretending unimplemented catalog entries are executable models. The route map now gives every active M-slot journey, gate, deal-type, league-range, readiness, and tool-surface metadata for Yulia and agents. `compose_model_stack` now also returns applicable mechanics, readiness summary, Yulia-facing mechanics brief, tool surfaces, and THE LINE boundary by deal profile. The pass-through substrate catalog is now published through the public spec/agent-card surface and `/api/definitive/pass-through-catalog`, with source type, provider examples, dependent model slots, per-call billing posture, fixed-margin rule, and no-referral/no-success-fee boundary. The spec and agent card now expose Today, Pipeline, Files, and Studio mechanics summaries so the UI can read executable counts, pass-through dependencies, professional-handoff needs, research-only mechanics, visible model slots, and Yulia guidance from one route-map contract.

- Add `compose_model_stack`.
- Add `execute_model`.
- Require model id + version pin.
- Return structured output, citation refs, input hash, output hash, audit id.
- Price/meter through existing V19 entitlement service.
- Add G28/G29/G30 trigger evaluation and overlay composition.
- Map v1.1 catalog entries to runtime `MODEL.*.v1` ids only when the deterministic function exists.
- Add the full 123-slot journey/gate/deal-type mapping so every model is discoverable, even before it is executable. **First pass complete:** the DB-free route map covers all 123 slots and fails smoke tests if any active slot lacks route metadata.
- Wire the route map into Yulia's deal-profile classifier. **First pass complete:** `compose_model_stack` now carries applicable mechanics, readiness counts, pass-through/professional/research boundaries, and a Yulia mechanics brief for chat and agent clients.
- Publish the Pass-Through Substrate Catalog. **First pass complete:** the catalog is public discovery, outcome-independent, and explicit that human specialist routing is free/editorial only.
- Connect the applicable-mechanics payload into Today, Pipeline, Files, and Studio. **Contract first pass complete:** public discovery now includes per-surface mechanics summaries; visual rendering can consume this without inventing page-specific logic.
- Validate the authenticated route path. **Expanded pass complete:** `npm run test:definitive-auth-route` creates a stable DB/JWT fixture and proves protected tool inventory, THE LINE inventory, corpus observation-type rules, data-rights read/grant flow, sanitized corpus observation writes, unsupported-version refusal, explicit THE LINE refusal envelopes for human approval / counsel review / enterprise scope, `compose_model_stack` mandate-chain output with G28/G29/G30 routing, pinned model-backed audit-packet retrieval, Studio export audit-packet retrieval, and staged-action list/cancel behavior.

**Done when:** five reference deals can run reproducible server models through the tool surface.

### Run 7 - THE LINE Enforcement Pass

**Goal:** compliance by construction.
**Status:** Started in repo. The canonical action registry now emits a machine-readable DEFINITIVE THE LINE contract for each registered tool, including `lineStatus`, refusal behavior, risk tags, required scopes, citations, billing posture, and confirmation requirements. `/api/definitive/line/inventory` exposes the inventory and the agent card advertises it for agent/runtime discovery. The DEFINITIVE MCP v0.1 executor now evaluates the line contract before execution and returns structured `human_approval_required`, `counsel_review_required`, `enterprise_scope_required`, `credit_budget_required`, or `LINE_VIOLATION` responses instead of jumping straight to raw tools. Successful calls route through the governed tool executor so staged approvals and audit behavior stay aligned with Yulia. Authenticated route coverage now proves human-approval, counsel-review, and enterprise-scope refusal envelopes over the live API. `npm run test:definitive-entitlements` disables local paywall bypass inside the test process and proves Pro credit-budget exhaustion and Free plan-scope refusal with DB fixtures.

- Inventory every existing tool/action.
- Assign THE LINE status and refusal behavior.
- Add structured refusal results.
- Ensure every externally visible action has approval/counsel/enterprise/credit gates.

**Done when:** no tool can recommend, negotiate, represent, guarantee, or tie fees to transaction outcome.

### Run 8 - Conformance Harness

**Goal:** test the substrate as a standard.
**Status:** Started in repo. `npm run test:definitive-conformance` runs the first data-driven DEFINITIVE conformance harness against JSON cases in `testing/definitive/conformance/v1/`. The suite now has 405 passing-target cases: 202 model-runtime cases, 60 deal-mechanics route cases, 84 prompt/meta cases, 30 route-trigger cases, and 29 model-stack cases. Runtime cases cover valuation, SDE/EBITDA normalization, working-capital peg, QoE Lite, tax structure, DSCR stress, sources/uses, SBA LBO, LMM LBO, HSR triage, legal halt scan, earnout, PPA, rollover, structure analysis, buyer fit, market context, sensitivity, deal comparison, covenant compliance, PMI value creation, deal-kill probability, timeline, deal scoring, cap table dilution, DCF, FIRPTA withholding, 1031 timing, rent-roll normalization, CAM true-up, RE-heavy asset/entity election, RE/operating-business bifurcation, NOI/cap-rate bridge, lease abstraction, property escrow/holdback sizing, title/survey checklist, PCA reserve modeling, FIRPTA v1.1, CITT transfer tax, OpCo/PropCo separation, ground lease mechanics, indemnity ladder, survival periods, escrow/holdback sizing, RWI stack architecture, transaction tax master integration, 338/336 gross-up, 1374 built-in gains tax, transaction cost capitalization, imputed interest/OID/453A, SALT transaction tax, closing statement true-up, conditions-to-close logic, termination/break-fee economics, earnout architecture, 1060 allocation, sale-leaseback/ASC 842 mechanics, REIT 75/75/90 compliance, IP chain-of-title, IP lien search, IP representation set, license dependency mapping, IP carve-out/license-back, source-code escrow, employee IP assignment verification, OSS exposure process, IP-specific 1060 allocation, domain/trademark transfer mechanics, three-prong solvency, 363 sale mechanics, plan feasibility, best-interests-of-creditors, APR/new-value, cramdown-rate, 1111(b) election, Chapter 7 waterfall, DIP sizing, exchange-offer mechanics, fulcrum security, RSA economics, ABC/Article 9 liquidation, claims trading, Subchapter V eligibility, Chapter 22 recidivism, LP-secondary/ECI withholding, strip-sale pricing, NAV facility LTV, venture-debt warrant coverage, convertible/SAFE conversion, ABL borrowing base, make-whole/call protection, covenant baskets, 280G, 382 NOL limitation, 355 spin research, LME uptier/drop-down/double-dip research, project-finance coverage research, token taxonomy research, stablecoin PPS research, and digital-asset reporting research. Route cases cover real estate, connected tax, agreement architecture, IP, Chapter 11/Subchapter V, LME, capital structure, LP/GP secondaries, crypto, carve-out/JV, venture/PIPE, distress-trigger, healthy-buyer, founder-exit, public/tender, OpCo/PropCo, SaaS IP, project-finance, international, raise/capital-structure, fund-secondary, seller-tax, ESOP, RWI/indemnity, earnout-legal, Article 9, DIP financing, cramdown-rate, claims-trading, reorg/spin, JV/Up-C, property-escrow, lease, privacy/cyber, stablecoin, IP-carve-out, public-fairness, QSBS-founder, ESOP-trustee, UK W&I/MAC, recap-solvency, Up-C/TRA, asset-tax, CVR/earnout, ordinary-course, healthcare-regulatory, insurance-agency, defense/CFIUS, financial-services regulated, energy project-finance, multi-domain carve-out, retail lease, lower-middle-market buyer, out-of-court workout, REIT merger, OSS stack, connected-tax, employee-IP, and working-capital/PPA profiles. Prompt/meta cases cover empty-brief behavior, Yulia route-brief language for pass-through, professional-handoff, research-only, tax, and IP/OSS profiles, Today/Pipeline/Files/Studio surface guidance, manifest access/pricing/LINE/conformance doctrine, Authority Register seed-plan discovery, category-level seed coverage, staged migration seed coverage across the 140-row baseline, substrate-architecture primitives, Deal OS no-rejection agent lifecycle, iterative work surfaces, portable agent handoffs, agent-card execution boundaries, MCP tool descriptions, agent discoverability/desirability doctrine, The Diligence Standard publication doctrine, and pass-through catalog pricing rules. Route-trigger cases cover G28/G29/G30 threshold edges and text triggers: cash runway 89/90 days, FCCR 0.99/1.0x, secured-debt trading at 59/60/79/80 cents, maintenance-covenant breach at four/five quarters, solvency, bankruptcy, RSA, forbearance, LME, exchange-offer, covenant-amendment, real-estate 24.9/25 percent, digital-asset 9.9/10 percent, secondaries, project finance, combined multi-gate routing, and signal normalization. Model-stack cases cover the composed `compose_model_stack` payload for base sell/buy/raise/PMI stacks, overlay gates, applicable mechanics, readiness summaries, cross-domain/regulated stack profiles, and Yulia mechanics brief language. The cases verify version pins, audit payload pins, output hashes, nested deterministic outputs, edge cases, below-threshold states, missing-input behavior, deterministic refusal states, route readiness, pass-through boundaries, authority seed-plan coverage, staged authority migration coverage, substrate-architecture discovery, tool surfaces, route-trigger thresholds, composed model-stack payloads, Yulia mechanics briefs, the agent no-rejection lifecycle, iterative work surfaces, portable take-back artifacts, agent discovery layers, semantic tool metadata, structured output requirements, marketplace build order, and published-standard doctrine. `npm run test:definitive-surface` adds a DB-free smoke test for the agent card, MCP inventory, THE LINE inventory, spec manifest, corpus sanitizer, pre-DB refusal behavior, v1.1 deal-mechanics catalog discovery, Authority Register seed-plan coverage, substrate-architecture plan discovery, and the `validate_conformance` status tool. `npm run test:definitive-auth-route` adds a live API smoke test for JWT auth, protected tool inventory, THE LINE inventory, corpus rules, data-rights grants, sanitized corpus observation writes, unsupported-version refusal, explicit human/counsel/enterprise refusal envelopes, mandate-chain output, protected `compose_model_stack` G28/G29/G30 routing, model-backed audit-packet retrieval, Studio export audit-packet retrieval, and staged-action list/cancel behavior.

- Add conformance test runner.
- First 100-case target is met; keep expanding across WC peg, earnout, MAE, indemnification, tax, R&W, financing, post-close, controller/SB 21, route triggers, and meta tests.
- 400-case checkpoint is met and the suite is now at 405 cases; keep expanding across authenticated route behavior, authority depth, model-stack edge cases, public discovery, registry packaging, and meta behavior.
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
**Status:** Started in repo. Studio pitch-book exports now persist a `studio-export-audit-v1` packet in export metadata with DEFINITIVE/V19 pins, book/version ids, export/input/output hashes, slide-level provenance, source manifest, model manifest, citation validation, warning state, and packet hash. Model-backed Yulia/chat audit rows now include a `model-backed-chat-audit-v1` packet with response hash, output hash, model stack, readiness resource URIs, citation validation, THE LINE/readiness issues, and packet hash. Audit packets are now readable through `/api/studio/pitch-books/:bookId/exports/:exportId/audit-packet`, `/api/studio/pitch-books/:bookId/exports/latest/audit-packet`, and `/api/definitive/audit-packets/:auditTrailId`.

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
**Status:** Started in repo. Migration `076_definitive_corpus_foundation.sql` adds data-rights grants, structured corpus observations, and benchmark release controls. `definitiveCorpusService` now enforces the core rule: no active anonymized-benchmark grant, no corpus write. Permitted observations are sanitized to remove party identifiers, emails/phones/URLs, file names, raw/verbatim/source/document text, and long unstructured strings before hashing and storage. `/api/definitive/corpus/observation-types`, `/api/definitive/corpus/rights`, `/api/definitive/corpus/rights/grants`, and `/api/definitive/corpus/observations` expose the internal substrate. The MCP v0.1 inventory now includes `record_corpus_observation`, which returns `data_rights_required` until the rights gate exists. Static schema verification now covers the corpus/data-rights tables and columns.

- Add data-rights grants.
- Add anonymized benchmark observation schema.
- Capture structured deal-term observations only.
- Exclude raw customer documents from corpus.
- Add aggregation thresholds before benchmark output.

**Done when:** permitted NWC/add-back/earnout/R&W/financing observations can be stored without identifying parties.

### Run 16 - Public Spec Site

**Goal:** make DEFINITIVE citable.
**Status:** Started in repo. `/.well-known/definitive.json` now publishes the first machine-readable public spec manifest with the current DEFINITIVE/V19 pins, doctrine, endpoint map, access model, tool surface, THE LINE state summary, conformance status, and corpus/data-rights rules. This is not yet the full public docs site, but it gives agents and future documentation a stable discovery root.

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

### Run 19 - Terminal Substrate Spine

**Goal:** turn the model corpus into the Deal OS substrate: hand any incomplete or complete deal stage in, recursively work the methodology, and get state/package outputs back.
**Status:** In progress with the terminal schema spine now code-addressable. `definitive://v1.1/substrate-architecture` and `/api/definitive/substrate-architecture` expose eight primitives, 27 staged MCP tool targets, the eight-axis classification key, six-phase solo-founder sequence, universal response-envelope fields, and THE LINE invariant. The schema registry now publishes `DealPayload`, `ClassificationKey`, `MissingInputContract`, `DealState`, `CompletenessSpec`, `DealReadinessLevel`, `CompletenessReport`, `DealPackage`, and the main agent take-back artifacts (`CapabilityCatalog`, `SourceIndex`, `SourceGapList`, `SelectiveDisclosureProof`, `ModelOutput`, `AssumptionLog`, `OutputHash`, `AuditPacket`, `MerkleInclusionProof`).

- Complete: add versioned schemas for `DealPayload`, `ClassificationKey`, `MissingInputContract`, `DealState`, `CompletenessSpec`, `CompletenessReport`, and `DealPackage`.
- Build `ingest_deal_payload` and rules-first classification into the eight-axis routing key.
- Add idempotency keys to every MCP-shaped tool call.
- Add content-addressable `DealState`, parent CID lineage, and `state_hash`.
- Add model dependency graph and action-key cache for deterministic recompute.
- Add shallow `check_completeness` and `get_definition_of_done`.
- Add universal `next_suggested_calls` envelope.
- Encode lifecycle stages from intake -> IOI -> deeper diligence -> LOI -> confirmatory diligence -> modeling/negotiation prep -> close/PMI.
- Expose Deal OS work surfaces and take-back artifacts for Today, Pipeline, Files, Data Room, Studio, Models, and Audit Package.

**Done when:** an external agent can ingest a raw or partial deal payload, receive classification plus missing inputs, execute a generated plan against persistent state, and see completeness progress without guessing which menu/page/tool to use or being rejected for ordinary incompleteness.

### Run 20 - Permutations And Portable Package

**Goal:** produce the terminal M&A package agents can hand back to principals, LPs, boards, counsel, and counterparties.

- Build `generate_permutations`, `score_permutation`, `set_objective_preference`, `compute_best_vehicle`, and `expand_permutations`.
- Preserve THE LINE: the substrate emits Pareto frontier and "computed-best given stated preferences," not recommendations.
- Build `finalize_deal_package`, `verify_package`, `reopen_deal_package`, and `disclose_subset`.
- Package outputs as structured JSON plus human render, with signed manifest, audit chain, source hashes, model output CIDs, citation chain, and selective disclosure proofs.

**Done when:** a downstream verifier can prove what was computed, under which version, from which inputs, with which citations, without trusting Yulia's narrative.

### Run 21 - Agent Discoverability And Desirability

**Goal:** make smbX/DEFINITIVE discoverable, preferable, and allow-listable for lab/PE/JV generalist agents without letting marketplace work distract from the substrate spine.
**Status:** Started in repo. `/.well-known/mcp/server-card.json` and `/.well-known/mcp` now generate from the existing DEFINITIVE manifest, MCP tool inventory, substrate architecture doctrine, and THE LINE metadata. The endpoints are public discovery only; execution still routes through authenticated/governed tool contracts.

- Publish `/.well-known/mcp/server-card.json` and `/.well-known/mcp` from the same DEFINITIVE manifest, not a parallel metadata file.
- Keep the canonical namespace ready for `smbx-ai/diligence` / The Diligence Standard.
- Prepare registry submissions for the Linux Foundation MCP Registry, PulseMCP, Glama, mcp.so, Smithery, Docker MCP Catalog, and curated GitHub lists.
- Prepare client-store packages for Claude Connector Directory, ChatGPT Apps Directory, Microsoft Agent Store, Salesforce AgentExchange, and Google Agent Gallery after the internal contract is stable.
- Publish enterprise allow-list artifacts: GitHub Copilot registry JSON, AWS Q / Kiro registry JSON, Azure API Center blueprint, and Bedrock AgentCore policy template.
- Make every marketplace-facing tool query-aligned: `diligence_<phase>_<artifact>` names; descriptions that say "working capital peg," "Section 1060 allocation," "FIRPTA withholding," "indemnification cap and basket," "QoE adjustments," "earnout construction," and "LBO model" when those are the actual tool jobs.
- Require `outputSchema`, `structuredContent` shape, idempotency key behavior, read-only/destructive/open-world annotations, result-size limits, methodology version, citation/provenance fields, and THE LINE declaration before any external listing.
- Treat "The Diligence Standard" as the public standardization move: stable model/gate URLs, Authority Register references, open conformance suite, and `DEFINITIVE-conformant` badge language.

**Done when:** an enterprise agent platform can discover smbX, understand exactly what it does, verify that outputs are deterministic/citation-backed/THE LINE-safe, and add it to a governed allow-list without bespoke explanation from us.

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
11. Terminal substrate schemas: `DealPayload`, `ClassificationKey`, `MissingInputContract`, `DealState`, `CompletenessSpec`, `CompletenessReport`, `DealPackage`.
12. `ingest_deal_payload` with rules-first classification and idempotency-key contract.
13. Content-addressable `DealState` plus shallow `check_completeness` and `next_suggested_calls`.
14. Deal OS lifecycle contract so agent work advances recursively through intake, IOI, diligence, LOI, modeling, negotiation prep, close, and PMI.
15. Agent home/take-back contract for document creation, data rooms, source indexes, model outputs, audit packets, and portable package updates.
16. MCP server-card and well-known discovery metadata over the same manifest, with query-aligned tool descriptions and output schemas.
17. Registry/app-store/enterprise allow-list submission packages staged but not promoted ahead of schema/state readiness.

## 12-Month Milestones

| Window | Milestone | Acceptance |
|---|---|---|
| Month 0-1 | Foundation | Authority Register schema, 50 entries, MCP v0.1, docs site scaffold, THE LINE position published internally/publicly, v1.1 catalog discoverable. |
| Month 2-3 | V19 anchoring | 250 authority entries, all 22 V19 gates anchored, first 5 deterministic models callable through MCP/internal surface, G28/G29/G30 trigger evaluator stubbed. |
| Month 4-6 | Models + audit | 95-model core implementation underway, 30 gates routable, audit/mandate logging live, first paid QoE Preview path ready. |
| Month 7-9 | Conformance + reference impls | 500+ authorities, 400 conformance tests, TS/Python reference implementations published internally or publicly, first restructuring/real-estate model fixtures passing. |
| Month 10-12 | DEFINITIVE launch | 800+ authority target in reach, 750 tests, public spec, V19 -> DEFINITIVE changelog, first external agent call, first enterprise/design-partner contract target. |

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

1. Terminal substrate schemas are now first-class in the schema registry: `DealPayload`, `ClassificationKey`, `MissingInputContract`, `DealState`, `CompletenessSpec`, `DealReadinessLevel`, `CompletenessReport`, `DealPackage`, plus the main portable take-back contracts. Surface smoke now fails if a tool map references a schema name the registry does not publish.
2. Continue deterministic runtime functions and schemas without changing THE LINE readiness. Sixty-eight models are now executable with conformance coverage: M139, M148, M151-M160, M164-M172, and M177-M223. Eight volatile models now have research-only runtime scaffolds: M143, M161-M163, and M173-M176. Prompt/runtime language for research-only, professional-handoff, pass-through route briefs, substrate-architecture primitives, agent no-rejection Deal OS lifecycle, iterative work surfaces, portable agent handoffs, schema-registry contracts, and `CompletenessSpec` definition-of-done behavior is now covered by prompt/meta conformance cases. Authenticated route validation now has expanded DB/JWT coverage at `npm run test:definitive-auth-route`.
3. Authority Register seed plan is expanded from 500+ to 800+ and now targets 920 planned entries across bankruptcy, restructuring, IRC/Treasury, real-estate, connected-tax, agreement-architecture, IP, pass-through pricing, recovery-data, digital-asset, regulated-industry, Delaware, market-data, methodology, and compliance/audit categories. Staged ingestion has now moved beyond the first 100 seeded rows: migration `079_definitive_authority_register_batch3.sql` adds 40 more active anchors for agreement economics, THE LINE pass-through pricing/referral boundaries, recovery datasets, digital-asset research, regulated industries, ASC 842, and ASTM pass-through standards. Surface smoke now fails if staged Authority Register migration rows fall below the 140-row baseline.
4. Pass-Through Substrate Catalog first pass is published with per-call pricing posture, fixed margin, source type, dependent model slots, and THE LINE boundary.
5. Surface mechanics contract is published for Today, Pipeline, Files, and Studio, and visual rendering now uses saved V6/Studio primitives without new page-specific logic.
6. The 400-case conformance checkpoint is met; next target is expanding toward 500 across authenticated route behavior, Authority Register depth, model-stack edge cases, public discovery/registry packages, and meta behavior.
6a. Keep agent discoverability from drifting: server-card metadata, registry packages, app-store packages, tool naming, `outputSchema`, structured outputs, and THE LINE declarations must be checked against the plan before marketplace work starts.
7. Keep extending authenticated route-level smoke coverage beyond the completed explicit THE LINE refusal envelopes for human approval, counsel review, and enterprise scope. Studio export packet retrieval, model-backed chat packet retrieval, staged approval list/cancel behavior, and direct budget/plan tollgate coverage now have tests.
8. Live schema verification now passes with `.env` loading enabled: `npm run verify:v19-schema` checks static migrations plus the live Railway database and currently reports 341/341 checks passing with corpus/data-rights, mandate-chain, audit, Studio, market-data, firm-memory, and Today tables present.

## Definition Of Done For DEFINITIVE v1.0 + v1.1 Deal Mechanics

DEFINITIVE is done when:

- Human app remains coherent and polished.
- Agents can call the substrate through stable tools.
- 30 gates are version-pinned, including G28, G29, and G30.
- 123 model slots are cataloged, and every production executable model is implemented with conformance cases or explicitly deferred with rationale.
- Every active model slot has route-map metadata: journey, gate, deal type, league range, readiness, and tool surface.
- 95-model core is either executable or staged with THE LINE category and implementation rationale.
- 800+ authorities are registered or queued with source/authority category and freshness plan.
- Pass-through data/software APIs are priced per call at cost or cost-plus-fixed, while human specialist routing remains free/editorial and never success-tied.
- 750 conformance cases pass.
- Studio/QoE export path produces source-grounded output plus audit packet.
- Every high-stakes action has citation, approval, enterprise, credit, or THE LINE gates.
- Billing keys on beneficial customer.
- Public spec and reference implementations exist.
- Agents can ingest a raw `DealPayload`, receive a deterministic classification/missing-input contract, and proceed through DealState/completeness without guessing the app surface.
- Agents can enter midstream with incomplete context, receive the next useful IOI/LOI/diligence/modeling/negotiation/close/PMI calls, and keep recursively advancing the same DealState.
- Agents can manage document creation, data-room indexing, files, pipeline movement, models, and audit packages from the same DealState and take portable artifacts back after each iteration.
- Agents and enterprise registries can discover smbX through well-known MCP metadata, query-aligned tool descriptions, structured output schemas, The Diligence Standard / DEFINITIVE version pins, conformance evidence, and THE LINE regulatory-neutrality declarations.
- Outputs can be finalized into a portable package with version pins, source hashes, model outputs, citation chain, audit trail, and selective disclosure path.
- No part of the system depends on a generic LLM claim being trusted without validation.
