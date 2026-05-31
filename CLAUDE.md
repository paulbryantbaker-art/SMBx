CLAUDE.md — smbx.ai
Last updated: 2026-05-25

> **For a current-vs-stale map of the whole repo, read `REPO_STATUS.md` at the root.** Archived docs live in `docs/_archive/` — do not build against them.

## What This Is
AI-powered deal intelligence platform for business acquisitions from $300K to mega-cap. Users talk to Yulia (AI deal intelligence) who guides them through buying, selling, or raising capital for businesses. Chat-first experience — users talk to Yulia, not dashboards. Yulia IS the front door — there is no sales team, no contact forms, no dead-end CTAs. Every action routes to chat.

## Core Architecture
- `client/src/components/v6/V6App.tsx` is the current app shell — all catch-all routes go through it. Chat.tsx is deleted.
- Node.js + Express (ESM) backend
- React 19 + Vite 7 + Tailwind CSS v3 + Radix UI frontend
- wouter for client routing
- PostgreSQL via raw postgres-js (no ORM)
- Claude API (primary), Google Gemini (secondary), OpenAI (tertiary)
- Stripe monthly subscriptions: Free / $99 Solo / $249 Pro / $749 Team / $3,000+ Enterprise. Legacy $79 / $199 / $499 / $2,500+ references are early-access or annual-equivalent only.
- JWT authentication (no sessions, no passport — sessions broke on Railway)
- Railway deployment (GitHub push → auto-deploy, Dockerfile with Chromium)
- Auto-migrations on server startup (server/index.ts runs all SQL in server/migrations/)
- Tabbed canvas system — tools open as persistent tabs in the right canvas panel
- 11 interactive canvas model components backed by legacy pure calculation helpers and zustand state
- 5-stage sourcing engine with Google Places integration
- Premium PDF export via Puppeteer (headless Chromium) + Chart.js

## Critical Rules — Read These First
1. **MONTHLY SUBSCRIPTIONS (LOCKED 2026-05-27).** Free (unlimited chat + 1 deliverable) / $99 Solo / $249 Pro / $749 Team / $3,000+ Enterprise. Canonical record: `SMBX_PRICING_LOCKED.md`. Any older table showing $79 / $199 / $499 / $2,500 is stale — point at the locked file and update. No per-deal fees. No wallet. No success/referral/contingent compensation.
2. **WALLET IS DEAD.** walletService, paywallService, dealExecutionFee, platformFeeService deleted. Never recreate.
3. **FREE TIER.** Unlimited conversation. ONE free deliverable per user. Paywall triggers after first free deliverable, NOT at a fixed gate.
4. **V6App.tsx is the ONLY current app shell.** Never create parallel layouts. All UI changes go through the V6 shell/components.
5. **NEVER use position:fixed full-viewport divs with background-color.** Safari reads them for toolbar tinting and it breaks dark mode switching. Use position:absolute inside a relative parent instead.
6. **ValueLens (NOT Bizestimate).** The old name is dead.
7. **Talk to Yulia (NOT Contact Sales).** All CTAs route to chat.
8. **Yulia never says "As an AI."** Expert M&A deal intelligence. Adapts persona by league.
9. **Financial data: zero hallucination.** Extract exactly from documents, never invent numbers.
10. **All money stored in cents (integers).** Never use floating point for financial values.
11. **Mobile browser first.** Design for mobile, then adapt to desktop.
12. **THE LINE is product law.** Read `THE_LINE_POLICY.md`. Yulia shows analysis, options, and implications; the user decides. No recommendations for regulated transaction decisions, negotiation, counterparty contact, custody, signing, filing, legal/tax/accounting/appraisal opinions, success fees, referral fees, or deal-value fees.

## Design System
**The V6 design language is the two CD handoff bundles** at the repo root: `design_handoff_smbx_desktop_material/` (desktop) and `design_handoff_smbx_app store/` (mobile). Production implements them faithfully — see `DESIGN_SOURCE.md` for the file-by-file implementation map. For a quick token reference, read `DESIGN_TOKENS.md` (auto-generated from `client/src/index.css` by `npm run design:extract`). Reuse saved Studio/List/Compete/texture-card primitives; do not invent adjacent card/button styles when an existing primitive fits.

**V6 in one line:** desktop uses slate-blue `#2E5C8A` + lavender chrome `#ECEAF2`; mobile uses periwinkle `#8A9AE8` + watercolor textures from `client/public/textures/`. Hot pink (`#D44A78`, V3/V4 era) and warm cream + terra (`#F4EEE3` + `#D4714E`, Cowork-DL "Edition" v22 era) are both retired — if your output anchors on either, you read a stale doc.

**Safari toolbar rule still applies:** never use `position:fixed` full-viewport divs with a background color (Safari reads them for toolbar tinting and it breaks dark-mode switching). Use `position:absolute` inside a relative parent instead.

## Pricing Model — Monthly Subscriptions
**Free:** Unlimited Yulia Q&A, ONE ValueLens or deal score (email required)
**$99 Solo:** Unlimited ValueLens, deal scoring, VRR, SDE/EBITDA analysis, exports, and one supervised MCP/agent key
**$249 Pro:** Everything in Solo + CIM, deal room, market discovery, source routing, DD, LOI scaffolds, and three supervised MCP/agent keys
**$749 Team:** Shared deal vault, firm templates, seats, specialist handoff coordination, and supervised agent workflows
**$3,000+ Enterprise:** Everything in Team + single-tenant, SSO, API controls, portfolio infrastructure, custom governance, and governed autonomous agent scope

Credits are included plan allowances and governance controls, not a wallet. Event artifacts may have flat software prices or consume included credits, but no fee may vary with deal value, close, or outcome.

## Journeys, Stages, and Deal-Mechanics Gates
Top-level product journeys remain SELL, BUY, RAISE, and PMI. SELL/BUY/RAISE expose six user-facing stages; PMI exposes four post-close stages.

- **SELL:** S0 Intake → S1 Financials → S2 Valuation → S3 Packaging → S4 Market Matching → S5 Closing
- **BUY:** B0 Thesis → B1 Sourcing → B2 Valuation → B3 Due Diligence → B4 Structuring → B5 Closing
- **RAISE:** R0 Intake → R1 Financial Package → R2 Investor Materials → R3 Outreach → R4 Terms → R5 Closing
- **PMI:** PMI0 Day 0 → PMI1 Stabilization → PMI2 Assessment → PMI3 Optimization

The current DEFINITIVE substrate is broader than those stage labels. `server/services/definitiveDealMechanicsCatalog.ts` defines the active v1.1 deal-mechanics catalog: 30 gates and 123 model slots (M101-M223), including G28 Distressed / Restructuring, G29 Capital Structure & Liability Management, and G30 Real Estate & Asset-Class Overlays. Agents should route through `compose_model_stack`, the route map, and DealState rather than hard-coding only the four journey stage lists.

## Calculation and Model Runtime
There are two layers:

- **Client canvas calculation helpers:** `client/src/lib/calculations/core.ts` contains legacy pure JS helpers for the human interactive canvas: SDE, EBITDA, valuation, DSCR/debt service, SBA financing/amortization, IRR/MOIC, LBO/pro forma, sensitivity, FCF, working capital peg, covenant compliance, tax impact, cap table dilution, exit waterfall, earnout, installment sale, and DCF. This is not the complete substrate catalog.
- **Server V19/DEFINITIVE runtime:** `server/services/v19ModelRuntime.ts` contains the model-backed runtime used by Yulia/agents, currently covering 100+ `MODEL.*.v1` definitions across valuation, QoE, financing, structure, tax, legal economics, real estate, IP, restructuring, capital structure, secondaries, PMI, and research-only overlays. `npm run test:definitive-conformance` currently covers 202 model-runtime cases.
- **DEFINITIVE deal-mechanics catalog:** `server/services/definitiveDealMechanicsCatalog.ts` is the broader route/discovery catalog with 123 M-slots and 30 gates. Some slots are executable now, some are professional-handoff or research-only, and some are reserved.

## 11 Interactive Canvas Models (client/src/components/models/)
Valuation Explorer, LBO, SBA Financing, DCF, Tax Impact, Cap Table, Sensitivity Matrix, Deal Comparison, Earnout, Working Capital, and Covenant Compliance. These are the human canvas components, not the full agent/substrate model inventory.

## Yulia's Canvas Tools
- `create_model_tab` — opens interactive models from conversation
- `update_model` — modifies assumptions ("what if EBITDA is $1.5M")
- `read_tab_state` — reads canvas state for contextual responses
- `get_sourcing_portfolio` — reads buyer's sourcing pipeline
- SSE canvas_action handler forwards tool results to zustand store

## Reference Documents
- **YULIA_AGENCY_SPEC.md** — Product/architecture doctrine for Yulia as the agentic operating layer: advisor posture without licensed-advisor boundary crossing, permission levels, surface contracts, data-room/file architecture, and implementation priorities.
- **YULIA_AGENCY_IMPLEMENTATION_PLAN.md** — Practical wiring plan for context packs, prompt governance, governed tool execution, staged approvals, surface actions, Today, Files, and Data Room.
- **SMBX_PRICING_LOCKED.md** — Locked canonical pricing record (2026-05-27): Free / $99 Solo / $249 Pro / $749 Team / $3,000+ Enterprise. If any other doc or code constant disagrees, this file wins.
- **THE_LINE_POLICY.md** — Hard operating policy for pricing, artifacts, Yulia refusals, marketing language, and drift triggers around securities, UPL, tax/accounting/appraisal, brokerage, and transaction-compensation boundaries. Now includes statutory safe-harbor citations (Lowe v. SEC, Tex. Gov't Code § 81.101(c), N.C. Gen. Stat. § 84-2.2) and the "Never Even Accused" four-layer test.
- **DEFINITIVE v1.0** = `methodology/DEFINITIVE_BUILD_PLAN.md` + V19 baseline docs below.
  - DEFINITIVE is the current agent-access/spec/substrate build target as of May 20, 2026.
  - Doctrine: smbX is the M&A diligence substrate; Yulia is the human reference surface.
  - Agent/API/MCP work should use DEFINITIVE naming, spec versioning, Authority Register, beneficial-customer identity, mandate chain, conformance, audit packets, and THE LINE contracts.
- **METHODOLOGY V19 baseline** = `methodology/METHODOLOGY_V19.md` + `methodology/CC_V19_IMPLEMENTATION_BRIEF.md` + `methodology/V19_BUILD_PLAN.md`.
  - V19 remains the current methodology/runtime baseline and rolls forward into DEFINITIVE v1.0.
  - V17/V18a/V18b are archived in `docs/_archive/methodology/` and should not be used as new-build source material.
  - Runtime still contains V18 tax/legal distillations in `server/prompts/taxEngine.ts` and `server/prompts/legalEngine.ts`; V19/DEFINITIVE prompt/runtime migration is tracked in `methodology/V19_BUILD_PLAN.md` and `methodology/DEFINITIVE_BUILD_PLAN.md`.
- STYLE_GUIDE.md — Complete UI & brand style guide for marketing materials
- TESTING.md — Testing tracker with issue template system
- REPO_STATUS.md — Current-vs-stale map for the whole repo (read this when reviewing on GitHub)

## Key File Map
| File | Purpose |
|------|---------|
| client/src/components/v6/V6App.tsx | Current app shell — catch-all routes, desktop/mobile V6 workspace, tabbed canvas |
| client/src/components/models/ | 11 interactive financial model components for the human canvas |
| client/src/lib/calculations/core.ts | Legacy pure calculation helpers for canvas models |
| server/services/v19ModelRuntime.ts | Server-side V19 model runtime for executable/research `MODEL.*.v1` definitions |
| server/services/definitiveDealMechanicsCatalog.ts | DEFINITIVE v1.1 123-slot / 30-gate deal-mechanics catalog |
| client/src/lib/modelStore.ts | Zustand store for model tab state |
| client/src/components/shared/ChatDock.tsx | THE chat input — used everywhere |
| client/src/components/shared/DarkModeToggle.tsx | Dark mode + Safari toolbar color management |
| client/src/components/chat/PortfolioCanvas.tsx | Sourcing portfolio management UI |
| server/index.ts | Express entry + auto-migrations |
| server/services/aiService.ts | AI orchestration + agentic loop |
| server/prompts/taxEngine.ts | V18 §9 tax foundation + per-league workflow (18a distillation) |
| server/prompts/legalEngine.ts | V18 §10 legal foundation + per-league workflow (18b distillation) |
| server/constants/v19Regulatory.ts | V19 regulatory constants for HSR, SBA, OBBBA, §382, CFIUS, RWI |
| server/constants/v19Leagues.ts | V19 L1-L10 league classification constants |
| server/services/sourcingPipelineService.ts | 5-stage sourcing engine |
| server/services/tools.ts | 35 agentic tools |
| server/services/definitiveConnectorDistribution.ts | Claude-first connector launch package and marketplace evidence pack |
| server/services/definitiveAssistantDistributionReadiness.ts | Claude/ChatGPT/MCP launch readiness and revenue blocker map |
| server/services/definitiveOpenApiSpec.ts | OpenAPI package for ChatGPT GPT Actions and enterprise review |
| server/services/definitiveRemoteMcpTransport.ts | Streamable HTTP `/mcp` transport and registry `server.json` surface |
| server/services/definitiveMcpAuthMetadata.ts | OAuth protected-resource metadata and `WWW-Authenticate` challenge helper for `/mcp` |
| server/services/premiumPdfRenderer.ts | Puppeteer HTML→PDF with Chart.js |
| server/services/chartService.ts | Chart configs for PDF export |
| server/services/subscriptionService.ts | Subscription management + Stripe |
| server/templates/pdf/ | HTML templates for premium PDF export |
| server/worker.ts | pg-boss scheduled jobs |
| Dockerfile | Node 22 Alpine + Chromium + fonts |

## Dead Code (deleted — do not recreate)
- walletService.ts, paywallService.ts, dealExecutionFee.ts, platformFeeService.ts
- Chat.tsx, Home.tsx, Advisors.tsx, Buy.tsx, Sell.tsx (standalone pages)
- chat/Sidebar.tsx, HomeSidebar.tsx, PublicChatInput.tsx (orphaned)
- chartjs-node-canvas (native canvas dep removed — charts render in Puppeteer page)
- All old logo files (x-logo.png, X2 Transaparant.png, GX.png, redx.png, etc.)

## AI Orchestration
| Task | Engine |
|------|--------|
| Chat/Conversation | Claude Sonnet 4.6 |
| Agentic Loop | Claude Sonnet 4.6 (35 tools, 10-round limit) |
| Deliverable Generation | Tier-routed (28 generators) |
| CIM Generation | Claude Opus 4.6 |
| Intelligence Brief | Claude Sonnet 4.6 (sourcing Stage 1) |
| Website Enrichment | Claude Haiku 4.5 |
| Gate Summarization | Claude Haiku 4.5 |

## Commands
```bash
npm run dev          # Start Vite dev server (frontend only, port 5173)
npx tsx server/index.ts  # Start Express backend (port 3000)
npm run build        # Build for production
```

## Environment Variables
DATABASE_URL, ANTHROPIC_API_KEY, GOOGLE_AI_API_KEY, OPENAI_API_KEY,
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_PLACES_API_KEY,
STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET,
STRIPE_PRICE_SOLO, STRIPE_PRICE_PRO, STRIPE_PRICE_TEAM, STRIPE_PRICE_ENTERPRISE,
JWT_SECRET, NODE_ENV, PORT, APP_URL, CENSUS_API_KEY, TEST_MODE
