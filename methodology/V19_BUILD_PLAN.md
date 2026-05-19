# V19 Build Plan — Real Outstanding Work

**Audit date:** May 19, 2026 (after V19 methodology docs landed in repo + 62 TS-error cleanup + Phase E/G substrate work + Pitch Book Studio/runtime spine work + Today/Files/Pipeline operating wiring + public demo Yulia context + agent-substrate strategy update).
**Sources:** `methodology/CC_V19_IMPLEMENTATION_BRIEF.md` + `methodology/METHODOLOGY_V19.md` + `Downloads/v19/smbX Must-Haves.pdf` + `Downloads/v19/Agent Economy MandA Playbook.pdf` + May 19 agent-attractor/tollgate strategy notes.
**Audit baseline:** `origin/main` at `c5270a9`.

## Current V19 execution order — Studio wedge, full deal operating system

**Decision:** V19 leads with **Pitch Book Studio as the first visible wedge**, but V19 is not "Studio with extras." The full target is a beautiful human app plus an agent-ready M&A operating substrate: model the deal, work the methodology gates, route source files, generate collateral, verify every claim, audit every material action, and expose the same primitives to agents/API/MCP clients.

**Studio role:** Studio is the creation surface for pitch books, IC decks, QoE preview books, CIM excerpts, lender books, board updates, and investment memos. It proves source-grounded collateral, slide provenance, versioning, export discipline, and audit appendices.

**Deal-work role:** Today, Pipeline, Files, Search, Models, and Yulia are equally core. They own the daily work of moving deals through V19 gates, composing model stacks, updating assumptions, surfacing blockers, routing files, validating citations, and generating next actions.

**First Attractor:** QoE Preview ships as a Studio-generated book: upload/source files → extract facts → run QoE Lite + NWC/add-back defensibility → generate QoE Preview Book → export/share.

**Competitive bar:** smbX must compete with finance workbenches and Claude Finance-style workflows by offering unified inputs, source-linked verification, server-side financial models, Excel/model round trip, audit trail, institutional-quality output, deal-state memory, and agent-callable methodology primitives.

## North Star — human pleasing, agent ready

V19 must satisfy two audiences at once:

1. **Humans:** the app must feel beautiful, calm, useful, and coherent. Apple Glass + Neo remains the product language. The UI should feel like a premium working surface, not a database admin console.
2. **Agents:** the same work must be callable through stable resources, tools, scopes, schemas, provenance, and audit records. An agent should be able to call smbX and get work product that is more defensible than what it could produce with a generic LLM.

The product is successful only when the human-facing app and the agent-facing substrate are the same system. No fake UI-only flows. No backend-only systems without human trust and polish.

## Agent tollgate doctrine — the three durable moats

V19 should build toward three structural advantages that are hard for horizontal AI tools, banks, law firms, Big 4, or data vendors to reproduce:

1. **Verification layer regulators, boards, and LPs trust.** Deterministic compute, source validation, methodology pins, model hashes, counsel deferrals, and seven-year audit records. Every material output should answer: what facts, files, models, citations, assumptions, and methodology version produced this?
2. **V19 as canonical M&A methodology standard.** Gates, models, artifacts, source rules, and document schemas should be versioned and URI-addressable: `methodology://v19/...`, `MODEL.*.v1`, `studio://...`, `deal://...`, `audit://...`. The methodology can be public; the execution engine, verification layer, and corpus are the business.
3. **Sub-$1B deal-terms corpus.** Every permitted deal workflow should generate structured, anonymized benchmark primitives: NWC pegs, add-backs, earnout terms, R&W terms, escrow/deductible patterns, financing structures, blocker outcomes, and post-close claims. This is the long-term agent attractor and compounding moat.

## Three-track doctrine — beautiful app, deal runtime, callable substrate

V19 must ship as three synchronized lanes, not as a choice between frontend and infrastructure.

**Lane A — Product Surface.** The app remains beautiful, fast, and useful for human users. Apple Glass + Neo is the product language. Today, Studio, Files, Pipeline, Search, Pricing, and Learn should feel like one coherent product, not admin dashboards over a database.

**Lane B — Deal Runtime.** V19 gates, model stacks, deterministic server models, firm memory, deal state, next actions, counsel deferrals, and source requirements are the actual work engine. Studio is one consumer of this runtime; Today, Pipeline, Files, Search, and Yulia are also first-class consumers.

**Lane C — Callable Substrate.** Every meaningful frontend action must resolve to a durable object, strict schema, tool, resource, model execution, citation check, and audit record. This prepares smbX for the next 12-18 months when more usage comes from agents, API clients, and MCP-enabled finance workbenches.

### Surface-to-substrate map

| Human surface | Human job | Substrate primitive | Agent/MCP future |
|---|---|---|---|
| Today | See what matters now | `morning_brief`, `gate_countdown`, `deal_pulse`, `studio_refresh_need` | `get_morning_brief`, `list_deal_actions` |
| Studio | Create collateral | `studio_book`, `studio_slide`, `studio_source`, `studio_export`, `slide_provenance` | `create_pitch_book`, `revise_pitch_book`, `export_pitch_book` |
| Files | Route and verify source material | `source_card`, `data_room_file`, `citation_link`, `access_scope` | `list_sources`, `attach_source`, `validate_source` |
| Pipeline | Work the deal through methodology stages | `deal_state`, `gate_state`, `model_stack`, `blocker`, `next_action` | `compose_model_stack`, `advance_gate`, `read_deal_state` |
| Models / Workbooks | Run assumptions, sensitivities, and deal math | `assumption_set`, `model_run`, `model_output`, `output_hash`, `sensitivity_case` | `execute_model`, `refresh_model`, `diff_assumptions` |
| Search | Find buyers, targets, lenders, advisors | `market_query`, `buyer_pool`, `target_list`, `provider_match` | `buyer_universe`, `target_search`, `provider_search` |
| Chat/Yulia | Orchestrate work | `tool_call`, `approval_request`, `audit_record`, `counsel_deferral` | MCP tools + agent identity + scoped auth |
| Audit / Verification | Prove what happened | `audit_manifest`, `citation_validation`, `methodology_pin`, `source_hash` | `read_audit_packet`, `verify_output` |
| Benchmarks | Compound anonymized learnings | `deal_term_observation`, `benchmark_snapshot`, `data_rights_grant` | `benchmark_query`, `contribute_observation` |
| Pricing | Package access | `plan_entitlement`, `credit_budget`, `agent_scope`, `export_limit` | API/MCP credits, per-agent limits, enterprise governance |

### Modeling and deal-work doctrine

V19 deal work is not complete when a deck exports. The system must help a human or agent actually work the deal:

- **Model the deal:** run canonical server models, track assumptions, persist outputs, hash results, and show missing-input states instead of hallucinating numbers.
- **Move the deal:** compose gate/model requirements by league, journey, and deal type; surface blockers; propose next actions; require approval for regulated/legal/tax-sensitive steps.
- **Refresh the deal:** detect when files, market data, assumptions, or citations changed after a model-backed output was created.
- **Explain the deal:** let Yulia answer from deal state, model outputs, files, citations, and methodology rather than generic narrative.
- **Package the deal:** Studio turns verified deal state into pitch books, QoE books, IC decks, lender books, CIM summaries, board updates, and memos.
- **Remember the deal:** firm memory captures reusable assumptions, provider preferences, house style, prior deal patterns, and diligence workflows.
- **Benchmark the deal:** permitted structured deal-term observations feed anonymized aggregate benchmarks, never raw customer documents.

### Pricing and tollgate doctrine

Base plans remain monthly subscriptions. No wallet, no success fees, no per-deal tolls. V19 adds credit budgets, agent scopes, and governance gates on top of subscriptions.

Enterprise/agent packaging may add contracted platform fees, included credits, per-gate/model action metering, and per-deliverable metering inside the subscription/contract framework. Do not reintroduce a consumer wallet, success fee, or ad hoc per-deal toll.

| Gate | Meaning | Applies to |
|---|---|---|
| `agent_identity_required` | Autonomous/background agent use requires a named agent identity and scope. | MCP/API, enterprise automation |
| `source_grounding_required` | Customer-facing output needs source/citation/model provenance. | Studio export, share links, investment memos |
| `model_refresh_required` | Linked assumptions/files changed after a model-backed output was created. | Studio books, Today brief, QoE Preview |
| `human_approval_required` | Legal/tax/regulated/closing-sensitive action needs user approval or counsel deferral. | Counsel triggers, tax structure, legal issue spotting |
| `credit_budget_required` | High-volume model runs, exports, or API calls consume included plan credits. | Server models, exports, MCP calls |
| `enterprise_scope_required` | Firm memory, connectors, scoped tokens, audit packets, and API/MCP access require enterprise governance. | Team/Enterprise |

### Enterprise trust doctrine

Agent-ready also means procurement-ready. V19 should build toward SOC 2 Type II, ISO 27001, ISO 42001, single-tenant/VPC options, role/matter permissions, ethical walls, scoped tokens, BYOK-ready storage, and seven-year immutable audit retention. These are not launch-polish items; they determine whether PE, IB, advisory, and law-firm agents can call smbX in production.

### V19 entitlement baseline

Implemented in `server/services/v19EntitlementService.ts`; events are written to `agency_usage_events` with `v19.*` event keys.

| Plan | Monthly V19 allowance | Model runs | Studio exports | Studio books | API/MCP calls | Tool calls | Agent usage |
|---|---:|---:|---:|---:|---:|---:|---|
| Free | 30 | 20 | 1 | 1 | 0 | 60 | None |
| Solo | 600 | 300 | 30 | 12 | 0 | 600 | None |
| Pro | 2,500 | 1,200 | 150 | 60 | 2,500 | 2,500 | None |
| Team | 12,000 | 6,000 | 600 | 300 | 15,000 | 10,000 | Supervised |
| Enterprise | Custom/unlimited by contract | Custom | Custom | Custom | Custom | Custom | Autonomous |

### What must be built

**Human product work**
- Shared Apple Glass + Neo design system: hero cards, texture cards, list cards, dark-glass controls, side rail/tab tree, detail-page surfaces, responsive constraints, and screenshot QA.
- Studio as the flagship collateral surface: pitch books, IC decks, QoE books, CIM summaries, lender books, board updates, investment memos.
- Today as the daily operating surface: morning brief, gate countdown, deals-in-flight pulse, Studio drafts needing refresh, files needing review.
- Pipeline as opportunity/deal work: methodology Kanban, league-defined stages, active deals, grouped tabs, sub-tabs, blockers, model stack, next action.
- Files as routing and proof: data-room items, source cards, citations, file status, permissions, source gaps, source hashes.
- Models/workbooks as deal math: assumptions, model runs, sensitivities, Excel import/export, refresh/diff review.
- Search as market discovery: buyers, targets, lenders, advisors, provider matches, market citations, reusable search artifacts.
- Yulia as orchestrator: chat can read/write deal state, run tools, explain model outputs, request approval, defer to counsel, and write audit records.
- Pricing/Learn as credible product packaging: monthly plans, credits, agent limits, enterprise governance, no wallet language.

**Substrate work**
- Canonical `MODEL.*.v1` server-side model execution with output hashes and audit payloads.
- Strict artifact schemas for `StudioBook`, `StudioSlide`, `SourceCard`, `ModelRun`, `AssumptionSet`, `AuditRecord`, `DealState`, `GateState`, `BenchmarkObservation`, and `DataRightsGrant`.
- Source/citation validation before Studio export, publish/share, gate advance, model-backed chat, and agent/API responses.
- Gate/model stack composition by league, journey, deal type, and methodology version.
- V19 tool runtime: `compose_model_stack`, `execute_model`, `lookup_citation`, `fetch_market_data`, `defer_to_counsel`, `update_tax_position`, `write_audit_trail`.
- Thin MCP v1 exposing the same tools/resources used by the app, then full MCP/API packaging later.
- Agent identity, scoped tokens, signed audit manifests, and enterprise policy controls for agent users.
- Credit budget meter and plan entitlements for human and agent usage.
- Anonymized benchmark/data-rights foundation for future sub-$1B deal-terms corpus.

**Compliance/trust work**
- Seven-year immutable audit retention and downloadable audit packets.
- SOC 2 Type II / ISO 27001 / ISO 42001 evidence path.
- Single-tenant/VPC option path, scoped tokens, role/matter permissions, and ethical-wall-ready access controls.
- Public methodology/versioning posture so V19 can become a citable standard, not a black box.

### Consecutive runs from here

| Run | Name | Current repo state | Next done condition |
|---|---|---|---|
| 1 | Product Design System Lock | 🟡 Apple Glass + Neo is live across V6, Studio has the strongest softened desktop pattern, Today/Search/Pipeline are being aligned, reusable Studio surface styles exist. | Extract/normalize reusable hero, texture-card, list-card, dark-glass, rail, and detail-page styles; verify desktop/mobile screenshots so the human app feels coherent and premium. |
| 2 | V19 Foundation Repair | 🟡 `market_data_cache` collision is addressed by 067/070 compatibility migrations; V19 tables exist; `npm run verify:v19-schema` verifies required migration/table/column coverage and can run live DB checks when `DATABASE_URL` is present. | Run verifier against fresh and existing Railway/local databases; mark schema state with commit SHA. |
| 3 | Canonical Server-Side Deal Modeling Runtime | 🟡 Model registry canonicalizes IDs to `MODEL.*.v1`; `v19ModelRuntime.ts` runs deterministic models, reports missing inputs, hashes outputs, persists model executions, and writes V19 audit records. | Make server models the default source for every model-backed chat answer, Studio refresh, Today brief, Pipeline gate move, and export; attach model execution ids to audit packets/share flows. |
| 4 | Tier-0 Server Models | ✅ First-pass V19 server catalog covers SDE, EBITDA, valuation, DSCR, NWC, sources/uses, SBA, HSR, QoE Lite, tax, legal halt scan, LBO, PPA, rollover, earnout, structure analysis, buyer fit, deal score, market context, sensitivity, comparison, cap table, covenant, DCF, PMI, deal-kill probability, and timeline. `npm run test:v19-models` covers 25 deterministic fixtures. | Deepen formulas with live source extraction, market-data refreshes, Excel round-trip assumptions, and benchmark calibration. |
| 5 | Model Stack, Gates, And Deal Work | 🟡 Composer service exists; gate definitions expose V19 `requiredModels`, `requiredCitations`, and `alwaysHaltTriggers`; Pipeline now shows methodology stages and sample deal blockers. | Compose league × journey × deal type stacks deeply, execute required models per gate, move deals through Kanban stages, surface blockers, and require approval/counsel deferral for sensitive actions. |
| 6 | Files As Proof And Source Routing | 🟡 Files work queue reads shared operating-brief data; source-card and Studio source schemas exist. | Make Files the durable proof layer: source cards, file status, data-room routing, permissions, citation links, source gaps, stale source states, and audit-ready source hashes. |
| 7 | Studio V1 + Pitch Book Engine | 🟡 Studio UI, `studio_books`, versions, sources, exports, PPTX/PDF export, pitch-book tools, seven deterministic templates, source-card-aware draft generation, and stricter readiness checks exist. | Finish Apple Glass + Neo polish, replace placeholder narrative with extracted source/model content, and make every book format refresh from canonical deal/model/source state. |
| 8 | Studio Source Grounding + Export Verification | 🟡 Slide provenance, warning states, source cards, audit appendices, citation validation, model-health UI, and readiness checks exist. | Block every share/export/publish path on source/model/citation readiness; produce downloadable audit appendices and machine-readable export manifests. |
| 9 | QoE Preview Attractor | 🟡 QoE Preview Book template exists. | Make upload/source files → extract facts → run QoE Lite/NWC/add-back/DSCR → generate Studio book → validate provenance → export PPTX/PDF work end to end. |
| 10 | Today Canvas + Firm Memory | 🟡 `today_operating_briefs`, `firm_memory`, Today UI cards, Files work queue wiring, Pipeline pulse/countdown wiring, and `update_firm_memory` tool exist. | Deepen Today actions with real model/readiness execution, add Firm Memory edit UI, capture provider/deal-pattern learnings, and add enterprise memory governance. |
| 11 | Pipeline Opportunity Operating System | 🟡 Pipeline has methodology Kanban, shortcuts, gate countdown, deal pulse, and public demo context. | Make Yulia automatically rank, move, and explain deals by league-defined stage/gate; add grouped tabs/sub-tabs, next-action execution, and portfolio-level blocker analytics. |
| 12 | Search + Market Discovery Runtime | 🟡 Search surface exists; existing market-data service/cache exists. | Turn Search into callable market discovery: buyer pools, target lists, lenders, advisors, provider matches, market citations, and reusable search artifacts. |
| 13 | V19 Tools + Chat Runtime | 🟡 `compose_model_stack`, `execute_model`, `lookup_citation`, `fetch_market_data`, `read_v19_readiness`, `defer_to_counsel`, `update_tax_position`, and `write_audit_trail` are registered; public demo Yulia now understands demo deal/portfolio context. | Wire automatic audit/readiness checks into every high-stakes chat, share, publish, gate advance, and export path; make Yulia answer from deal state, not generic narrative. |
| 14 | Artifact Schemas + Thin MCP Contract | 🟡 `shared/v19Artifacts.ts` and `v19ResourceContract.ts` define/read Studio, source, model-run, audit, deal-state, gate-state, and prompt resources through internal routes. | Keep resources aligned with app objects and graduate the internal contract into a production MCP/API package after stabilization. |
| 15 | Audit Packets + Verification Layer | 🟡 V19 `audit_trail` exists; model/export/chat rows are being written. | Add seven-year append-only manifests, signed output hashes, downloadable audit packets, verification endpoints, retention policy, and SOC 2/ISO evidence hooks. |
| 16 | Benchmarks + Data Rights Foundation | ❌ Greenfield. | Add data-rights grants, anonymized deal-term observation schemas, benchmark snapshots, and corpus contribution controls for sub-$1B deal terms. |
| 17 | Credit Budget + Pricing Tollgates | 🟡 Plan entitlements define model-run, Studio-book, export, API/MCP, tool-call, and enterprise-agent allowances; tools/Studio expose structured tollgate states; first user-visible meter exists. | Add org-level pooling, enterprise policy controls, billing-period reconciliation, and agent/package SKUs that preserve monthly subscription doctrine. |
| 18 | Excel Round Trip | ❌ Greenfield. | Add assumption versioning, Excel import/export, model reruns, diff review, and linked Studio slide refresh when assumptions change. |
| 19 | Market Data + Connectors | 🟡 Existing market-data service/cache exists. | Add daily FRED refresh, freshness checks, connector status, and read-only contracts for QuickBooks, VDRs, DocuSign/Ironclad, Carta, and later PitchBook/CapIQ-style providers. |
| 20 | Agent Identity + Enterprise Trust | 🟡 Agent card exists; deeper auth/compliance work pending. | Add OAuth/PKCE, scoped tokens, per-agent identity, enterprise scopes, single-tenant/VPC option path, A2A/API packaging, and marketplace readiness. |
| 21 | Final Hardening | ❌ Pending. | Build, migrations, model fixtures, Studio export checks, chat/tool checks, Playwright coverage, deployment checks, and compliance evidence checks all green. |

## The three lenses

The V19 implementation brief covers **runtime correctness** (calc engine, citation hygiene, model stack, audit trail). The two PDFs cover a parallel and equally large body of **conversion + stickiness** and **agent-economy SKU** work that the brief doesn't address. The real build list is the union.

| Lens | Source | Scope |
|---|---|---|
| Runtime correctness | V19 Implementation Brief (9 sections) | Calc engine, citation registry, model stack composer, audit trail, deferred-to-counsel |
| Conversion + stickiness | Must-Haves PDF (20 priorities) | Today Canvas, Firm Memory, Excel round-trip, 7-yr audit, Three Attractor hooks, broken-auction signal |
| Agent-economy SKU | Agent Economy PDF | MCP server, A2A Agent Card, AP2 readiness, credit-budget pricing, Yulia API tier, scoped tokens, marketplace surfaces |

## Master build list

### Tier 0 — Launch blockers

| # | Item | Source | State |
|---|---|---|---|
| 1 | Product design system lock (Apple Glass + Neo) | Product doctrine | 🟡 V6 live; Studio has strongest softened desktop pattern; Today/Search/Pipeline alignment in progress |
| 2 | V19 foundation + migration verification | V19 §1-2 | 🟡 067/070 compatibility migrations exist; verifier exists; fresh/existing DB verification still needed |
| 3 | Canonical server-side deal-model runtime | V19 §4 | 🟡 `MODEL.*.v1` runtime, output hashes, persisted executions, and audit payloads exist |
| 4 | Tier-0 model catalog | V19 §4 | ✅ 25 deterministic fixtures passing; deeper formulas/source extraction still needed |
| 5 | Model stack + gate execution | V19 §7-8 | 🟡 Composer/gate requirements exist; deeper league × journey × deal-type execution pending |
| 6 | Files as proof/source routing | V19 §2+§7 | 🟡 Source schemas exist; Files queue exists; source-card/file-permission/citation workflows need depth |
| 7 | Studio + pitch-book engine | Studio-first decision | 🟡 Studio, seven formats, persistence, tools, PPTX/PDF export, and readiness checks exist |
| 8 | Studio/source/export verification | V19 §2+§7 | 🟡 Provenance/readiness/export checks exist; all share/publish paths need strict blocking |
| 9 | QoE Preview Attractor | PDF #3 | 🟡 Template exists; full upload → extraction → models → Studio book → export path pending |
| 10 | Today Canvas + Firm Memory | PDF #4-5 | 🟡 Operating brief, Firm Memory, Files/Pipeline wiring, and update tool exist; action execution/UI governance pending |
| 11 | Pipeline opportunity operating system | V19 gates + product doctrine | 🟡 Methodology Kanban, shortcuts, gate pulse, and public demo context exist; automatic stage/action execution pending |
| 12 | Search + market discovery runtime | Market/search doctrine | 🟡 Search UI exists; buyer/provider/search artifacts and citation-backed market runtime pending |
| 13 | V19 tools + chat runtime | V19 §6 | 🟡 Tools registered; public demo Yulia fixed; automatic audit/readiness across all paths pending |
| 14 | Thin MCP/resource contract | Agent Economy | 🟡 Internal resources/routes/agent-card exist; production MCP/API package pending |
| 15 | Audit packets + verification layer | PDF #6 + tollgate notes | 🟡 `audit_trail` exists; signed manifests, downloadable packets, and retention controls pending |
| 16 | Benchmarks + data-rights foundation | Tollgate notes | ❌ Greenfield: data-rights grants, anonymized observations, benchmark snapshots |
| 17 | Credit-budget pricing + tollgates | Agent Economy | 🟡 Entitlements, usage events, tollgate states, and first meter exist; org pooling/reconciliation pending |
| 18 | Excel round trip | PDF #9 | ❌ Greenfield: assumptions, import/export, rerun, diff, linked slide refresh |
| 19 | Market data + connectors | V19 §7.4 + PDF #19 | 🟡 Market-data service/cache exists; FRED refresh, freshness, connector contracts/status pending |
| 20 | Enterprise trust/compliance path | Agent Economy + procurement doctrine | 🟡 Agent card exists; OAuth/scopes/agent identity/SOC2-ISO evidence path pending |
| 21 | Persistent file storage on Railway volume `/data/uploads/` | V19 §7.5 | 🟡 Production default set; Railway volume/env verification pending |

### Tier 1 — Foundation + competitive moat

| # | Item | Source | State |
|---|---|---|---|
| 22 | DB migrations: citation_registry + model_registry + audit_trail + deal_model_stack + tax_position_registry + legal_defer_log | V19 §2 | 🟡 migration 067 added; deploy/apply pending |
| 23 | Constants: `v19Regulatory.ts` + `v19Leagues.ts` | V19 §3 | 🟡 files added; runtime integration pending |
| 24 | Yulia prompts V4 — V19 block + tax/legal V19 refs + gate prompts with model stack | V19 §5 | 🟡 `YULIA_PROMPTS_V4.md` exists; deeper gate/model binding pending |
| 25 | Agentic tools: compose_model_stack, execute_model, lookup_citation, fetch_market_data, defer_to_counsel, update_tax_position, write_audit_trail | V19 §6 | 🟡 tools registered; automatic invocation and fixture coverage pending |
| 26 | FRED daily refresh job | V19 §7.4 | ❌ greenfield |
| 27 | Gate registry: `requiredModels` + `alwaysHaltTriggers` per gate | V19 §8 | 🟡 fields exist; deeper runtime usage pending |
| 28 | Broken-auction signal layer | PDF #14 | ❌ greenfield (category-creating; no incumbent) |
| 29 | Capital-Partner DB & Outreach Kit | PDF #12 | ❌ greenfield |
| 30-33 | Native integrations: QuickBooks read, Datasite/Intralinks/Firmex read, DocuSign/Ironclad, Carta read | PDF #19 | ❌ greenfield |

### Tier 2 — Agent-economy SKU

| # | Item | Source | State |
|---|---|---|---|
| 34 | MCP server (production package over internal V19 contract) | PDF Agent Economy | ❌ greenfield |
| 35 | A2A Agent Card at `/.well-known/agent-card.json` | PDF Agent Economy | 🟡 public agent-card endpoint added; OAuth/scoped-token metadata pending |
| 36 | OAuth 2.1 + PKCE-S256 + RFC 8707 audience-bound tokens | PDF Agent Economy | ❌ greenfield |
| 37 | AP2 readiness (Verifiable Credentials, 3 mandate types, Stripe + x402 stablecoin rails) | PDF Agent Economy | ❌ greenfield |
| 38 | Per-agent identity + scoped Restricted-API-Keys + 15-min ephemeral tokens | PDF Agent Economy | ❌ greenfield |
| 39 | Yulia API SKU pricing (per-tool / per-deliverable / per-token markup) | PDF Agent Economy | ❌ greenfield |
| 40 | Salesforce AgentExchange + MS 365 Agent Store + OpenAI Apps SDK | PDF Agent Economy | ❌ greenfield |
| 41 | Service-provider sponsorship rail (lenders/QoE/M&A insurers, flat $/mo, never success-tied) | PDF Agent Economy | ❌ greenfield |
| 42 | Plaid-style data-share API SKU | PDF Agent Economy | ❌ greenfield |

### Tier 3 — Stickiness amplifiers (post-launch)

| # | Item | Source | State |
|---|---|---|---|
| 43 | Quarterly LP Update auto-draft | PDF #13 | ❌ greenfield |
| 44 | Family Office "Virtual Deal Team" SKU + procurement-ready terms | PDF #18 | ❌ greenfield |
| 45 | Track-record / Fund-I Attribution Export | PDF #17 | ❌ greenfield |
| 46 | Multi-journey attach instrumentation (target 60% ARR from ≥2 journeys) | PDF #16 | ❌ greenfield |
| 47 | Day-pass / per-deal SKU under subscription module (NOT wallet revival) | PDF #20 | ❌ greenfield |
| 48 | Yulia Benchmarks (anonymized cross-sectional learning as product) | PDF Agent Economy | ❌ greenfield |
| 49 | Bidirectional write-back to Salesforce/DealCloud/Affinity/HubSpot/Notion | PDF Agent Economy | ❌ greenfield |
| 50 | Phase 2 calc engine models (DCF.TWOSTAGE, WACC.MODCAPM, SAFE.POSTMONEY, etc.) | V19 §4 Phase 2 | ❌ greenfield |
| 51 | Phase 3 mega-cap models (LBO.PE.MEGA, MERGER.TAKEPRIVATE, EXIT.DUALTRACK) | V19 §4 Phase 3 | ❌ greenfield |

## Already done or partly done

- **Phase E/G substrate** (from `a14c305` WIP): `agencyActionRegistry`, `agencyAuditLog`, `agencyStagedActions`, `governedToolExecutor` — adjacent to but not the same as V19 audit-trail shape.
- **Market data foundation**: `marketDataService.ts` (CBP/BLS/FRED) — different schema than V19 wants.
- **Market intelligence runtime**: `marketIntelligenceRuntime.ts` + `market_intelligence_profiles` table (mig 066) — cousin of V19 modelStackComposer.
- **Analysis runtime**: `analysisRuntime.ts` + mig 063/064 — durable analysis artifacts pattern.
- **V18 tax + legal engines**: `taxEngine.ts` + `legalEngine.ts` — solid V18 distillations, easy roll to V19.
- **Agentic tool layer**: 31 tools (including 8 from Phase 0/A/B/C agentic-tools-restore PR).
- **Gate registry**: 22 gates in `shared/gateRegistry.ts` (needs `requiredModels` field).
- **Basic calc engine**: 22 functions at `client/src/lib/calculations/` (client-side).
- **`is_general` column** on conversations (mig 060).
- **Merger lite**: mig 059 + `pair_merger_deals` tool + CIM carve-out + LOI merger structures.

## Locked decisions

1. **Studio is the first wedge, not the whole product:** QoE Preview leads, shipped as a Studio-generated book, but V19 is the full deal operating system across Today, Pipeline, Files, Search, Models, Studio, and Yulia.

2. **Audit substrate:** V19 `audit_trail` stays as the canonical model/export/citation audit record. Phase E/G `agency_action_events` can remain adjacent for staged actions and approvals, but it should not replace V19 audit semantics.

3. **Server-side models:** Server-side `MODEL.*.v1` execution is canonical for audit, exports, chat-backed claims, and agent/API calls. Client models remain interactive what-if surfaces.

4. **Deal work is methodology-pinned:** Gate moves, model stacks, blocker analysis, and next actions must be grounded in V19 methodology, league, journey, and deal type. Yulia should not invent process outside the methodology when a methodology state exists.

5. **MCP timing:** Do not pause frontend to build a giant MCP server. Build a thin MCP/schema/resource contract in parallel now, using the same internals the app already calls. Full marketplace-grade MCP/API packaging comes later.

6. **Corpus strategy:** Structured benchmark observations and data-rights grants should be designed now. Do not store raw customer documents as benchmark data. The moat is anonymized, structured, permissioned deal-term observations.

7. **Pricing doctrine:** Monthly subscriptions remain the base. Add included credits, agent scopes, and governance gates. Do not reintroduce wallet, success fees, or per-deal tolls.

8. **Human experience:** The app must stay beautiful for every human user. Apple Glass + Neo remains the product design language while the substrate becomes more callable underneath.

## Execution plan

### Phase 1 — Human Product System + Runtime Spine

- Finish shared Apple Glass + Neo component patterns so Today, Studio, Files, Pipeline, Search, detail pages, Pricing, and Learn feel like one product.
- Verify migrations on fresh and existing DBs.
- ✅ Make Studio refresh call canonical `execute_model`.
- ✅ Persist Studio refresh/export hashes into V19 audit records.
- ✅ Add source/citation validation before Studio export.
- ✅ Add fixtures for first Tier-0 models.
- ✅ Expand Tier-0 deterministic runners for tax structure, legal halt scan, LBO LMM, PPA, rollover, earnout, and structure analysis.
- ✅ Replace remaining generic model placeholders with deterministic runners for buyer fit, deal score, market context, sensitivity, comparison, cap table, covenant, DCF, PMI, deal-kill, and timeline.
- ✅ Add dedicated persisted model-execution records for Studio refresh and the `execute_model` tool.
- ✅ Add automatic V19 audit rows for model-backed authenticated chat responses.
- Make deal-model execution the default source for Yulia, Today, Pipeline, Studio, and exports.

### Phase 2 — Deal Operating Runtime

- Deepen `compose_model_stack` by league × journey × deal type.
- Execute required models per gate and store `model_execution_id`s on deal/gate state.
- Add assumption sets, missing-input states, stale-output detection, and model refresh requirements.
- Make Pipeline automatically show gate blockers, required models, required citations, next actions, and counsel/approval gates.
- Make Yulia answer from deal state and model outputs before narrative generation.
- Keep client-side models as interactive what-if surfaces, but canonicalize every exported/shared/model-backed claim through server-side `MODEL.*.v1`.

### Phase 3 — Files, Sources, And Verification

- ✅ Define strict artifact schemas for deals, Studio books, slides, sources, model runs, audit records, and gate states.
- ✅ Add first `methodology://`, `deal://`, `studio://`, `source://`, `model://`, `audit://`, and `gate://` resource shapes.
- ✅ Add V19 readiness checks for gate models, gate citations, Studio slide/source/model gaps, and strict Studio export.
- Files next: source cards, file status, data-room routing, source gaps, permission state, citation links, source hashes, and stale source states.
- Extend readiness checks to every high-stakes chat, share/publish path, gate advance, and agent/API response.
- Build machine-readable audit packets that include model runs, source hashes, citation checks, methodology pin, approvals, and export hashes.

### Phase 4 — Studio + QoE Preview Attractor

- Finish Studio V1 visual alignment and interaction polish.
- Replace placeholder narrative with extracted source/model content.
- Make all seven book formats refresh from canonical deal/model/source state.
- Upload/source files.
- Extract financial facts.
- Run QoE Lite, NWC peg, add-back defensibility, DSCR stress.
- Generate QoE Preview Book in Studio.
- Flag unsupported metrics and stale model outputs.
- Export PPTX/PDF with source and audit appendix.

### Phase 5 — Today, Pipeline, Search, And Firm Memory

- ✅ Today first pass: morning brief, gate countdown, deals-in-flight pulse substrate, files needing review substrate, Studio drafts needing refresh, and cached operating brief.
- ✅ Files first wiring: work queue and shortcuts can read `filesNeedingReview` from the shared Today operating brief.
- ✅ Pipeline first wiring: deal cards can read `dealPulse`, and the page shows `gateCountdown` from the shared Today operating brief.
- Pipeline next: methodology Kanban automation, grouped tabs, sub-tabs, next-action execution, portfolio-level blocker analytics.
- Search next: buyer pools, target lists, lenders, advisors, provider matches, reusable market searches, and market citations.
- ✅ Firm Memory first pass: persistent object, default house style/workflow/finance assumptions, and Today snapshot.
- ✅ Firm Memory write path: `update_firm_memory` creates/updates durable assumptions, house style, providers, deal patterns, and workflows through the tool runtime.
- Firm Memory next: user-visible edit/update actions, provider/deal-pattern capture, enterprise governance, and memory-scoped agent calls.

### Phase 6 — Excel, Market Data, And Connectors

- Add assumption versioning and Excel import/export.
- Add model rerun and diff review.
- Refresh linked Studio slides and Today/Pipeline statuses when assumptions change.
- Add read-only connector contracts/status for QuickBooks, VDRs, DocuSign/Ironclad, Carta, and later PitchBook/CapIQ-style providers.
- Add market-data freshness checks and daily FRED refresh.

### Phase 7 — Corpus, Data Rights, And Benchmarks

- Add `data_rights_grant` and `benchmark_observation` schemas.
- Capture permitted structured deal-term observations: NWC pegs, earnout terms, R&W deductibles, escrow/cap/survival terms, financing structures, blockers, gate outcomes, and post-close claims.
- Keep raw customer documents out of the benchmark corpus.
- Add benchmark snapshots and internal query resources.
- Make future Yulia Benchmarks a product surface only after rights, privacy, and aggregation thresholds are clear.

### Phase 8 — Enterprise Agent Readiness

- ✅ Publish the internal resource/tool contract through the agent-card surface.
- ✅ Create authenticated internal resource read routes over existing server services.
- Keep the contract internal/local until stable, then package the same objects for MCP/API consumers.
- Add agent identity, scoped tokens, and enterprise audit packets.
- Expand MCP/API routes from internal contract to public/enterprise packaging.
- Add A2A/agent-card metadata for scopes, pricing, tools, auth, and audit guarantees.
- Add seven-year append-only audit manifests.
- Add SOC 2 Type II / ISO 27001 / ISO 42001 evidence hooks.
- Add org-level budgets and enterprise policy controls.

## Bottom-line

V19 is no longer a single backend cleanup or a Studio-only product run. It is a three-track product build:

- **Human surface:** the app must be beautiful, coherent, responsive, and pleasant enough that humans want to live in it every day.
- **Deal runtime:** the app must actually work deals through methodology gates with server-side models, files, assumptions, citations, approvals, memory, and next actions.
- **Agent substrate:** the same objects must be callable by agents through schemas, tools, resources, scoped auth, credits, and audit packets.

Maintain this file in lockstep with `methodology/METHODOLOGY_V19.md`. When a tier-0 item ships, mark it ✅ done with a commit SHA. When scope changes, update here in the same commit as the code.
