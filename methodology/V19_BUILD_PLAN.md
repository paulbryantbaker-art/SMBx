# V19 Build Plan — Real Outstanding Work

**Audit date:** May 18, 2026 (after V19 methodology docs landed in repo + 62 TS-error cleanup + Phase E/G substrate work + Pitch Book Studio/runtime spine work).
**Sources:** `methodology/CC_V19_IMPLEMENTATION_BRIEF.md` + `methodology/METHODOLOGY_V19.md` + `Downloads/v19/smbX Must-Haves.pdf` + `Downloads/v19/Agent Economy MandA Playbook.pdf`.
**Audit baseline:** `origin/main` at `c5270a9`.

## Current V19 execution order — Pitch Book Studio first

**Decision:** V19 now leads with **Pitch Book Studio**, not Today Canvas or a standalone QoE report. Studio is the creation surface for pitch books, IC decks, QoE preview books, CIM excerpts, lender books, board updates, and investment memos. Files remains storage/routing. Studio is where source-grounded collateral gets created, versioned, refreshed, audited, and exported.

**First Attractor:** QoE Preview ships as a Studio-generated book: upload/source files → extract facts → run QoE Lite + NWC/add-back defensibility → generate QoE Preview Book → export/share.

**Competitive bar:** Studio must compete with finance workbenches and Claude Finance-style workflows: unified inputs, source-linked verification, server-side financial models, Excel/model round trip, audit trail, and institutional-quality presentation output.

## Dual-track doctrine — beautiful app, callable substrate

V19 must ship as two synchronized lanes, not as a choice between frontend and infrastructure.

**Lane A — Product Surface.** The app remains beautiful, fast, and useful for human users. Apple Glass + Neo is the product language. Today, Studio, Files, Pipeline, Search, Pricing, and Learn should feel like one coherent product, not admin dashboards over a database.

**Lane B — Callable Substrate.** Every meaningful frontend action must resolve to a durable object, strict schema, tool, resource, model execution, citation check, and audit record. This prepares smbX for the next 12-18 months when more usage comes from agents, API clients, and MCP-enabled finance workbenches.

### Surface-to-substrate map

| Human surface | Human job | Substrate primitive | Agent/MCP future |
|---|---|---|---|
| Today | See what matters now | `morning_brief`, `gate_countdown`, `deal_pulse`, `studio_refresh_need` | `get_morning_brief`, `list_deal_actions` |
| Studio | Create collateral | `studio_book`, `studio_slide`, `studio_source`, `studio_export`, `slide_provenance` | `create_pitch_book`, `revise_pitch_book`, `export_pitch_book` |
| Files | Route and verify source material | `source_card`, `data_room_file`, `citation_link`, `access_scope` | `list_sources`, `attach_source`, `validate_source` |
| Pipeline | Manage deal state | `deal_state`, `gate_state`, `model_stack`, `next_action` | `compose_model_stack`, `advance_gate`, `read_deal_state` |
| Search | Find buyers, targets, lenders, advisors | `market_query`, `buyer_pool`, `target_list`, `provider_match` | `buyer_universe`, `target_search`, `provider_search` |
| Chat/Yulia | Orchestrate work | `tool_call`, `approval_request`, `audit_record`, `counsel_deferral` | MCP tools + agent identity + scoped auth |
| Pricing | Package access | `plan_entitlement`, `credit_budget`, `agent_scope`, `export_limit` | API/MCP credits, per-agent limits, enterprise governance |

### Pricing and tollgate doctrine

Base plans remain monthly subscriptions. No wallet, no success fees, no per-deal tolls. V19 adds credit budgets, agent scopes, and governance gates on top of subscriptions.

| Gate | Meaning | Applies to |
|---|---|---|
| `agent_identity_required` | Autonomous/background agent use requires a named agent identity and scope. | MCP/API, enterprise automation |
| `source_grounding_required` | Customer-facing output needs source/citation/model provenance. | Studio export, share links, investment memos |
| `model_refresh_required` | Linked assumptions/files changed after a model-backed output was created. | Studio books, Today brief, QoE Preview |
| `human_approval_required` | Legal/tax/regulated/closing-sensitive action needs user approval or counsel deferral. | Counsel triggers, tax structure, legal issue spotting |
| `credit_budget_required` | High-volume model runs, exports, or API calls consume included plan credits. | Server models, exports, MCP calls |
| `enterprise_scope_required` | Firm memory, connectors, scoped tokens, audit packets, and API/MCP access require enterprise governance. | Team/Enterprise |

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
- Studio as the flagship collateral surface: pitch books, IC decks, QoE books, CIM summaries, lender books, board updates, investment memos.
- Today as the daily operating surface: morning brief, gate countdown, deals-in-flight pulse, Studio drafts needing refresh, files needing review.
- Files as routing and proof: data-room items, source cards, citations, file status, permissions, source gaps.
- Pipeline as deal state: grouped tabs, gates, active deals, sub-tabs, model stack, next action.
- Pricing/Learn as credible product packaging: monthly plans, credits, agent limits, enterprise governance, no wallet language.

**Substrate work**
- Canonical `MODEL.*.v1` server-side model execution with output hashes and audit payloads.
- Strict artifact schemas for `StudioBook`, `StudioSlide`, `SourceCard`, `ModelRun`, `AuditRecord`, `DealState`, `GateState`.
- Source/citation validation before Studio export and high-stakes chat answers.
- V19 tool runtime: `compose_model_stack`, `execute_model`, `lookup_citation`, `fetch_market_data`, `defer_to_counsel`, `update_tax_position`, `write_audit_trail`.
- Thin MCP v1 exposing the same tools/resources used by the app, then full MCP/API packaging later.
- Agent identity, scoped tokens, and audit manifests for enterprise/agent users.
- Credit budget meter and plan entitlements for human and agent usage.
- Anonymized benchmark/data-rights foundation for future sub-$1B deal-terms corpus.

### Consecutive runs from here

| Run | Name | Current repo state | Next done condition |
|---|---|---|---|
| 1 | Pitch Book Studio V1 | 🟡 Implemented as first pass: `studio_books`, `studio_book_versions`, `studio_sources`, `studio_exports`, server routes, Studio UI, local fallback, PPTX/PDF export, and five pitch-book tools exist. | Verify migrations on fresh + existing DB, harden source/provenance states, and make Studio UI use the final Apple Glass + Neo design language. |
| 2 | Pitch Book Generation Engine | 🟡 Deterministic templates for seven formats exist in `server/services/pitchBookStudio.ts`; tools exist in `server/services/tools.ts`; Studio refresh now calls canonical V19 model execution and stores missing-input state/output hashes on the book version. | Replace placeholder narrative slots with source-extraction facts and deepen the remaining format-specific model templates. |
| 3 | Pitch Book Source Grounding | 🟡 Slide-level provenance, warning states, source cards, audit appendices, export citation validation, Studio model-health UI, and Studio V19 readiness checks exist in draft form. Strict export can now block external delivery when blockers remain. | Validate every file/model/citation reference against registries before all share/publish surfaces, and block or clearly flag unsupported metrics. |
| 4 | V19 Foundation Repair | 🟡 `market_data_cache` collision is addressed by 067/070 compatibility migrations; V19 tables exist. | Run fresh-db and migrated-db verification; confirm all V19 tables and seeds are usable. |
| 5 | Canonical Server-Side V19 Runtime | 🟡 Started: model registry now canonicalizes IDs to `MODEL.*.v1`; `v19ModelRuntime.ts` adds deterministic execution, missing-input reporting, output hashes, audit payloads; `model_executions` persists canonical runs from Studio refresh and the `execute_model` tool; Studio refresh/export writes V19 audit records. | Make chat-backed claims use the same runner automatically and attach model-execution ids to audit packets/share flows. |
| 6 | Tier-0 Server Models | 🟡 First executable subset added: SDE, EBITDA, valuation triangulation, DSCR stress, NWC peg, sources/uses, SBA, HSR, and QoE Lite. Framework runners exist for remaining Tier-0/Phase 2 models. `npm run test:v19-models` covers the first deterministic fixtures. | Fill out full Tier-0 calculations for tax, legal halt scan, PPA, rollover, earnout, structure analysis, and LBO. |
| 7 | Artifact Schemas + Thin MCP Contract | 🟡 Started: `shared/v19Artifacts.ts` defines Studio, source, model-run, audit, deal-state, and gate-state artifact contracts; `v19ResourceContract.ts` exposes first resource templates/tool contracts through the agent card; `/api/v19/resource-contract` and `/api/v19/resources?uri=...` now read authenticated internal resources. | Keep resource reads aligned with Studio/model/audit persistence and graduate the internal contract into MCP/API packaging only after it stabilizes. |
| 8 | Model Stack, Gates, Prompts | 🟡 Composer service exists; gate definitions now expose V19 `requiredModels`, `requiredCitations`, and `alwaysHaltTriggers`; chat prompt injection now includes current V19 gate readiness; `YULIA_PROMPTS_V4.md` is still pending. | Compose league × journey × deal type stacks more deeply and formalize prompt governance in `YULIA_PROMPTS_V4.md`. |
| 9 | V19 Tools + Chat Runtime | 🟡 Started: `compose_model_stack`, `execute_model`, `lookup_citation`, `fetch_market_data`, `read_v19_readiness`, `defer_to_counsel`, `update_tax_position`, and `write_audit_trail` are registered. Tool outputs now carry V19 readiness for deal context, Studio books, model runs, exports, and gate advance. | Make audit writes automatic for every model-backed response and extend readiness checks into share/publish paths beyond Studio export. |
| 10 | Credit Budget + Pricing Tollgates | 🟡 Implemented as first pass: V19 plan entitlements now define model-run, Studio-book, export, API/MCP, tool-call, and enterprise-agent allowances; V19 actions write to `agency_usage_events`; tools and Studio return structured `credit_budget_required`, `human_approval_required`, and `enterprise_scope_required` states. | Add pricing-page/user-visible meter UI, org-level pooling, and enterprise policy controls. |
| 11 | Today Canvas + Firm Memory | 🟡 Today UI exists, but V19 operating-surface data model is pending. | Add Morning Brief, Gate Countdown, Deals-in-Flight Pulse, Studio refresh needs, and reusable firm memory. |
| 12 | QoE Preview Attractor | 🟡 QoE Preview Book template exists. | Make the full upload → extraction → QoE Lite → Studio book → export path work end to end. |
| 13 | Market Data + Connectors | 🟡 Existing market-data service/cache exists. | Add daily FRED refresh, freshness checks, and read-only connector contracts/status surfaces. |
| 14 | Excel Round Trip | ❌ Greenfield. | Add assumptions, import/export, rerun, diff, and Studio slide refresh when linked assumptions change. |
| 15 | Agent Identity, Audit Packets, Full MCP/API | 🟡 Agent card exists; deeper audit/API/OAuth work pending. | Seven-year audit manifests, audit packets, scoped auth, MCP-compatible routes, A2A/API packaging, and marketplace readiness. |
| 16 | Benchmarks + Data Rights Foundation | ❌ Greenfield. | Add anonymized-data rights/metadata flow and internal benchmark schema for future sub-$1B deal-terms corpus. |
| 17 | Final Hardening | ❌ Pending. | Build, migrations, model fixtures, Studio export checks, chat/tool checks, Playwright coverage, and deployment checks all green. |

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
| 1 | Today Canvas (Morning Brief + Gate Countdown + Deals-in-Flight Pulse) | PDF #4 | ❌ greenfield |
| 2 | Firm Memory persistent object (prior-deal carryforward) | PDF #5 | ❌ greenfield |
| 3 | 7-yr SOX-grade AI audit trail (immutable append-only + signed manifests + SOC 2 Type 2) | PDF #6 | 🟡 V19 `audit_trail` schema added; immutable manifests + SOC 2 controls pending |
| 4 | Citation registry + validator | V19 §2+§7 | 🟡 registry schema + seed + validator service added; chat hook pending |
| 5 | Model registry + Tier-0 calc engine (20 models server-side) | V19 §4 | 🟡 registry schema + canonical `MODEL.*.v1` catalog + first executable subset added |
| 6 | Model stack composer | V19 §7 | 🟡 composer service added and canonical tool registered; gate/runtime hook pending |
| 7 | Excel round-trip (assumption versioning + diff engine) | PDF #9 | ❌ greenfield |
| 8 | Engagement-Letter→CIM-in-48hrs hero workflow (broker Attractor) | PDF #1 | 🟡 partial (CIM gen exists, workflow chain doesn't) |
| 9 | Deal Pack in 4 hours (IS Attractor) | PDF #2 | ❌ greenfield |
| 10 | QoE Preview (search-funder Attractor) | PDF #3 | ❌ greenfield |
| 11 | SBA-eligibility filter on buyer lists (post-March-2026 citizenship rule) | PDF #7 | ❌ greenfield (`sbaLendingService.ts` exists as foundation) |
| 12 | Credit-budget pricing recast + real-time meter UI | PDF Agent Economy | 🟡 Server meter/entitlements started; real-time UI and org pooling pending |
| 13 | Persistent file storage on Railway volume `/data/uploads/` | V19 §7.5 | 🟡 production default set; Railway volume/env verification pending |
| 14 | Doc migration (archive V17/V18a/V18b, update CLAUDE.md) | V19 §1+§9 | 🟡 working-tree complete; commit SHA pending |

### Tier 1 — Foundation + competitive moat

| # | Item | Source | State |
|---|---|---|---|
| 15 | DB migrations: citation_registry + model_registry + audit_trail + deal_model_stack + tax_position_registry + legal_defer_log | V19 §2 | 🟡 migration 067 added; deploy/apply pending |
| 16 | Constants: `v19Regulatory.ts` + `v19Leagues.ts` | V19 §3 | 🟡 files added; runtime integration pending |
| 17 | Yulia prompts V4 — V19 block + tax/legal V19 refs + gate prompts with model stack | V19 §5 | 🟡 partial (V18 distillations exist; need V19 updates) |
| 18 | 7 new agentic tools: compose_model_stack, execute_model, lookup_citation, fetch_market_data, defer_to_counsel, update_tax_position, write_audit_trail | V19 §6 | 🟡 tools registered; chat/Studio automatic invocation and fixture coverage pending |
| 19 | FRED daily refresh job | V19 §7.4 | ❌ greenfield |
| 20 | Gate registry: `requiredModels` + `alwaysHaltTriggers` per gate | V19 §8 | ❌ greenfield |
| 21 | Broken-auction signal layer | PDF #14 | ❌ greenfield (category-creating; no incumbent) |
| 22 | Capital-Partner DB & Outreach Kit | PDF #12 | ❌ greenfield |
| 23-26 | Native integrations: QuickBooks read, Datasite/Intralinks/Firmex read, DocuSign/Ironclad, Carta read | PDF #19 | ❌ greenfield |

### Tier 2 — Agent-economy SKU

| # | Item | Source | State |
|---|---|---|---|
| 27 | MCP server (Cloudflare Workers + Anthropic SDK, 15-25 consolidated tools) | PDF Agent Economy | ❌ greenfield |
| 28 | A2A Agent Card at `/.well-known/agent-card.json` | PDF Agent Economy | 🟡 public agent-card endpoint added; OAuth/scoped-token metadata pending |
| 29 | OAuth 2.1 + PKCE-S256 + RFC 8707 audience-bound tokens | PDF Agent Economy | ❌ greenfield |
| 30 | AP2 readiness (Verifiable Credentials, 3 mandate types, Stripe + x402 stablecoin rails) | PDF Agent Economy | ❌ greenfield |
| 31 | Per-agent identity + scoped Restricted-API-Keys + 15-min ephemeral tokens | PDF Agent Economy | ❌ greenfield |
| 32 | Yulia API SKU pricing (per-tool / per-deliverable / per-token markup) | PDF Agent Economy | ❌ greenfield |
| 33 | Salesforce AgentExchange + MS 365 Agent Store + OpenAI Apps SDK | PDF Agent Economy | ❌ greenfield |
| 34 | Service-provider sponsorship rail (lenders/QofE/M&A insurers, flat $/mo, never success-tied) | PDF Agent Economy | ❌ greenfield |
| 35 | Plaid-style data-share API SKU | PDF Agent Economy | ❌ greenfield |

### Tier 3 — Stickiness amplifiers (post-launch)

| # | Item | Source | State |
|---|---|---|---|
| 36 | Quarterly LP Update auto-draft | PDF #13 | ❌ greenfield |
| 37 | Family Office "Virtual Deal Team" SKU + procurement-ready terms | PDF #18 | ❌ greenfield |
| 38 | Track-record / Fund-I Attribution Export | PDF #17 | ❌ greenfield |
| 39 | Multi-journey attach instrumentation (target 60% ARR from ≥2 journeys) | PDF #16 | ❌ greenfield |
| 40 | Day-pass / per-deal SKU under subscription module (NOT wallet revival) | PDF #20 | ❌ greenfield |
| 41 | Yulia Benchmarks (anonymized cross-sectional learning as product) | PDF Agent Economy | ❌ greenfield |
| 42 | Bidirectional write-back to Salesforce/DealCloud/Affinity/HubSpot/Notion | PDF Agent Economy | ❌ greenfield |
| 43 | Phase 2 calc engine models (DCF.TWOSTAGE, WACC.MODCAPM, SAFE.POSTMONEY, etc.) | V19 §4 Phase 2 | ❌ greenfield |
| 44 | Phase 3 mega-cap models (LBO.PE.MEGA, MERGER.TAKEPRIVATE, EXIT.DUALTRACK) | V19 §4 Phase 3 | ❌ greenfield |

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

1. **Lead Attractor:** QoE Preview leads, shipped as a Studio-generated book. Engagement-Letter→CIM and Deal Pack follow after Studio/source grounding works.

2. **Audit substrate:** V19 `audit_trail` stays as the canonical model/export/citation audit record. Phase E/G `agency_action_events` can remain adjacent for staged actions and approvals, but it should not replace V19 audit semantics.

3. **Server-side models:** Server-side `MODEL.*.v1` execution is canonical for audit, exports, chat-backed claims, and agent/API calls. Client models remain interactive what-if surfaces.

4. **MCP timing:** Do not pause frontend to build a giant MCP server. Build a thin MCP/schema/resource contract in parallel now, using the same internals the app already calls. Full marketplace-grade MCP/API packaging comes later.

5. **Pricing doctrine:** Monthly subscriptions remain the base. Add included credits, agent scopes, and governance gates. Do not reintroduce wallet, success fees, or per-deal tolls.

6. **Human experience:** The app must stay beautiful for every human user. Apple Glass + Neo remains the product design language while the substrate becomes more callable underneath.

## Execution plan

### Phase 1 — Studio + Runtime Spine

- Finish Studio V1 visual alignment and interaction polish.
- Verify migrations on fresh and existing DBs.
- ✅ Make Studio refresh call canonical `execute_model`.
- ✅ Persist Studio refresh/export hashes into V19 audit records.
- ✅ Add source/citation validation before Studio export.
- ✅ Add fixtures for first Tier-0 models.
- ✅ Add dedicated persisted model-execution records for Studio refresh and the `execute_model` tool.
- Extend persisted model-execution records across chat-backed claims and audit packets.

### Phase 2 — Thin Agent Substrate

- ✅ Define strict artifact schemas for deals, Studio books, slides, sources, model runs, audit records, and gate states.
- ✅ Add first `methodology://`, `deal://`, `studio://`, `source://`, `model://`, `audit://`, and `gate://` resource shapes.
- ✅ Publish the internal resource/tool contract through the agent-card surface.
- ✅ Create authenticated internal resource read routes over existing server services.
- ✅ Add V19 readiness checks for gate models, gate citations, Studio slide/source/model gaps, and strict Studio export.
- Keep the contract internal/local until stable, then package the same objects for MCP/API consumers.
- ✅ Add plan entitlements for credits, model runs, exports, and agent/API scopes.
- ✅ Add remaining tollgate states to tools and Studio: human approval required, credit budget required, enterprise scope required.
- Add pricing-page/user-visible meter UI, org-level budgets, and enterprise policy controls.

### Phase 3 — Today, Files, Pipeline as Operating Surfaces

- Today: morning brief, gate countdown, deals-in-flight pulse, files needing review, Studio drafts needing refresh.
- Files: source cards, file status, data-room routing, source gaps, permission state, citation links.
- Pipeline: gate state, deal stack, model requirements, grouped tabs, sub-tabs, next action.
- Firm Memory: reusable assumptions, house style, preferred providers, prior deal patterns, standard diligence workflows.

### Phase 4 — QoE Preview Attractor

- Upload/source files.
- Extract financial facts.
- Run QoE Lite, NWC peg, add-back defensibility, DSCR stress.
- Generate QoE Preview Book in Studio.
- Flag unsupported metrics and stale model outputs.
- Export PPTX/PDF with source and audit appendix.

### Phase 5 — Excel + Connector Work

- Add assumption versioning and Excel import/export.
- Add model rerun and diff review.
- Refresh linked Studio slides when assumptions change.
- Add read-only connector contracts/status for QuickBooks, VDRs, DocuSign/Ironclad, Carta, and later PitchBook/CapIQ-style providers.
- Add market-data freshness checks and daily FRED refresh.

### Phase 6 — Enterprise Agent Readiness

- Add agent identity, scoped tokens, and enterprise audit packets.
- Expand MCP/API routes from internal contract to public/enterprise packaging.
- Add A2A/agent-card metadata for scopes, pricing, tools, auth, and audit guarantees.
- Add seven-year append-only audit manifests.
- Add anonymized-data rights/metadata foundation and internal benchmark schema.

## Bottom-line

V19 is no longer a single backend cleanup. It is a dual-track product build:

- **Short term:** make Studio beautiful, useful, source-grounded, and model-backed.
- **Medium term:** make Today/Files/Pipeline operate on the same substrate objects.
- **12-18 month readiness:** expose those same objects and tools to agents through MCP/API, scoped auth, credits, and audit packets.

Maintain this file in lockstep with `methodology/METHODOLOGY_V19.md`. When a tier-0 item ships, mark it ✅ done with a commit SHA. When scope changes, update here in the same commit as the code.
