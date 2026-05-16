# V19 Build Plan — Real Outstanding Work

**Audit date:** May 16, 2026 (after V19 methodology docs landed in repo + 62 TS-error cleanup + Phase E/G substrate work).
**Sources:** `methodology/CC_V19_IMPLEMENTATION_BRIEF.md` + `methodology/METHODOLOGY_V19.md` + `Downloads/v19/smbX Must-Haves.pdf` + `Downloads/v19/Agent Economy MandA Playbook.pdf`.
**Audit baseline:** `origin/main` at `c5270a9`.

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
| 3 | 7-yr SOX-grade AI audit trail (immutable append-only + signed manifests + SOC 2 Type 2) | PDF #6 | 🟡 partial (`agency_action_events` is mutable; V19 `audit_trail` shape not built) |
| 4 | Citation registry + validator | V19 §2+§7 | ❌ greenfield |
| 5 | Model registry + Tier-0 calc engine (20 models server-side) | V19 §4 | ❌ greenfield (client-side equivalents for ~7) |
| 6 | Model stack composer | V19 §7 | ❌ greenfield |
| 7 | Excel round-trip (assumption versioning + diff engine) | PDF #9 | ❌ greenfield |
| 8 | Engagement-Letter→CIM-in-48hrs hero workflow (broker Attractor) | PDF #1 | 🟡 partial (CIM gen exists, workflow chain doesn't) |
| 9 | Deal Pack in 4 hours (IS Attractor) | PDF #2 | ❌ greenfield |
| 10 | QoE Preview (search-funder Attractor) | PDF #3 | ❌ greenfield |
| 11 | SBA-eligibility filter on buyer lists (post-March-2026 citizenship rule) | PDF #7 | ❌ greenfield (`sbaLendingService.ts` exists as foundation) |
| 12 | Credit-budget pricing recast + real-time meter UI | PDF Agent Economy | ❌ greenfield |
| 13 | Persistent file storage on Railway volume `/data/uploads/` | V19 §7.5 | ⚠️ status unknown |
| 14 | Doc migration (archive V17/V18a/V18b, update CLAUDE.md) | V19 §1+§9 | ❌ not done despite V19 docs being in repo |

### Tier 1 — Foundation + competitive moat

| # | Item | Source | State |
|---|---|---|---|
| 15 | DB migrations: citation_registry + model_registry + audit_trail + deal_model_stack + tax_position_registry + legal_defer_log | V19 §2 | ❌ greenfield |
| 16 | Constants: `v19Regulatory.ts` + `v19Leagues.ts` | V19 §3 | ❌ greenfield |
| 17 | Yulia prompts V4 — V19 block + tax/legal V19 refs + gate prompts with model stack | V19 §5 | 🟡 partial (V18 distillations exist; need V19 updates) |
| 18 | 7 new agentic tools: compose_model_stack, execute_model, lookup_citation, fetch_market_data, defer_to_counsel, update_tax_position, write_audit_trail | V19 §6 | ❌ greenfield |
| 19 | FRED daily refresh job | V19 §7.4 | ❌ greenfield |
| 20 | Gate registry: `requiredModels` + `alwaysHaltTriggers` per gate | V19 §8 | ❌ greenfield |
| 21 | Broken-auction signal layer | PDF #14 | ❌ greenfield (category-creating; no incumbent) |
| 22 | Capital-Partner DB & Outreach Kit | PDF #12 | ❌ greenfield |
| 23-26 | Native integrations: QuickBooks read, Datasite/Intralinks/Firmex read, DocuSign/Ironclad, Carta read | PDF #19 | ❌ greenfield |

### Tier 2 — Agent-economy SKU

| # | Item | Source | State |
|---|---|---|---|
| 27 | MCP server (Cloudflare Workers + Anthropic SDK, 15-25 consolidated tools) | PDF Agent Economy | ❌ greenfield |
| 28 | A2A Agent Card at `/.well-known/agent-card.json` | PDF Agent Economy | ❌ greenfield |
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

## Four strategic decisions blocking the build

1. **Conversion target** — which of the three Attractors leads? (IS = "Sign your next LOI before lunch", Search funder = "Don't pay $25K for a QoE on a fraud deal", Broker = "Sign engagement Tuesday, send outreach Thursday"). Picking one collapses Tier 0 by ~40%.

2. **Phase E/G substrate vs V19 audit_trail** — same or different? If `agency_action_events` can absorb V19's `audit_trail` semantics with column additions, half of V19 §2 is partway done.

3. **Server-side calc engine or keep client-side?** V19 wants `server/services/models/`; today they live in `client/src/lib/calculations/`. Moving enables audit trail + citation hygiene but requires API surface.

4. **MCP server scope** — full v1 is 16-28 eng-weeks (4-7 months). Ship Tier 0 product first and add MCP as Tier 2, or pause Tier 0 to lay MCP foundation?

## Pragmatic Tier 0 cut (3-4 weeks focused)

**Week 1 — Schema + docs foundation**
- §1 doc migration
- §2 migrations (citation_registry + model_registry + audit_trail + deal_model_stack + tax_position_registry + legal_defer_log)
- §2 columns on deals/conversations
- §3 constants (`v19Regulatory.ts`, `v19Leagues.ts`)
- §2 seed citation_registry (~30 rows)

**Week 2 — Model registry + Tier 0 calc + composer**
- `modelRegistry.ts`
- 20 Phase 1 Tier 0 models
- `modelStackComposer.ts`
- `citationValidator.ts` + chat-route hook
- 7 new agentic tools

**Week 3 — Today Canvas (PDF #4) + Firm Memory (PDF #5)**
Highest-leverage user-visible features in the entire backlog.

**Week 4 — Ship one Attractor end-to-end**
Pick the persona. Build < 5-min onboarding → hero deliverable → conversion.

**Week 5+** — Credit-budget pricing, broken-auction signal, Excel round-trip, native integrations, then agent-economy SKU as separate workstream.

## Why this ordering

- **Weeks 1-2 are pure foundation** — gives every later phase a substrate to build on. Nothing user-visible ships, but everything after this gets faster.
- **Week 3 (Today Canvas + Firm Memory) is the highest user-visible leverage.** The PDFs identify Today Canvas as the daily-habit hook ("DAU stabilizes >40% or dies <15%") and Firm Memory as the strongest unilateral lock-in. These two ship the experience users actually feel.
- **Week 4 (Attractor)** is the conversion mechanic. Without one of these working end-to-end, the product still feels like a chat tool with extras.
- **Tier 2 (agent-economy)** waits because it's a different business — the API SKU, MCP server, marketplace surfaces. Important but not Tier 0 ship-blocking.

## Bottom-line

V19 brief alone = ~9-15 days of focused work.
V19 + PDF Tier 1 + one Attractor = ~3-4 weeks focused (6 weeks sustainable).
Full V19 + PDFs + agent-economy SKU = ~4-7 months.

Maintain this file in lockstep with `methodology/METHODOLOGY_V19.md`. When a tier-0 item ships, mark it ✅ done with a commit SHA. When scope changes, update here in the same commit as the code.
