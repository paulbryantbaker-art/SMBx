CLAUDE.md — smbx.ai
Last updated: 2026-04-01

## What This Is
AI-powered deal intelligence platform for business acquisitions from $300K to mega-cap. Users talk to Yulia (AI deal intelligence) who guides them through buying, selling, or raising capital for businesses. Chat-first experience — users talk to Yulia, not dashboards. Yulia IS the front door — there is no sales team, no contact forms, no dead-end CTAs. Every action routes to chat.

## Core Architecture
- AppShell.tsx is the ONLY layout — all routes go through it. Chat.tsx is deleted.
- Node.js + Express (ESM) backend
- React 19 + Vite 7 + Tailwind CSS v3 + Radix UI frontend
- wouter for client routing
- PostgreSQL via raw postgres-js (no ORM)
- Claude API (primary), Google Gemini (secondary), OpenAI (tertiary)
- Stripe monthly subscriptions: Free / $49 Starter / $149 Professional / $999 Enterprise
- JWT authentication (no sessions, no passport — sessions broke on Railway)
- Railway deployment (GitHub push → auto-deploy, Dockerfile with Chromium)
- Auto-migrations on server startup (server/index.ts runs all SQL in server/migrations/)
- Tabbed canvas system — tools open as persistent tabs in the right canvas panel
- 10 interactive financial models with deterministic calculation engine (zustand state)
- 5-stage sourcing engine with Google Places integration
- Premium PDF export via Puppeteer (headless Chromium) + Chart.js

## Critical Rules — Read These First
1. **MONTHLY SUBSCRIPTIONS.** Free (unlimited chat + 1 deliverable) / $49 Starter / $149 Professional / $999 Enterprise. No per-deal fees. No wallet.
2. **WALLET IS DEAD.** walletService, paywallService, dealExecutionFee, platformFeeService deleted. Never recreate.
3. **FREE TIER.** Unlimited conversation. ONE free deliverable per user. Paywall triggers after first free deliverable, NOT at a fixed gate.
4. **AppShell.tsx is the ONLY layout.** Never create parallel layouts. All UI changes go here.
5. **NEVER use position:fixed full-viewport divs with background-color.** Safari reads them for toolbar tinting and it breaks dark mode switching. Use position:absolute inside a relative parent instead.
6. **ValueLens (NOT Bizestimate).** The old name is dead.
7. **Talk to Yulia (NOT Contact Sales).** All CTAs route to chat.
8. **Yulia never says "As an AI."** Expert M&A deal intelligence. Adapts persona by league.
9. **Financial data: zero hallucination.** Extract exactly from documents, never invent numbers.
10. **All money stored in cents (integers).** Never use floating point for financial values.
11. **Mobile browser first.** Design for mobile, then adapt to desktop.

## Design System
### Logo
- **Primary:** `final logo.png` — purple-to-gold gradient X + "smbx.ai" text (side-by-side, transparent)
- **Icon:** `x.png` — matching gradient X only (for sidebar, 42px, spins 180° on hover)
- **Dark mode hero:** `DG Trans.png` (transparent dark-optimized variant)
- Logo only shows in sidebar on non-home pages (hidden on home — hero logo is there)

### Colors
```
--accent-primary: #D44A78    /* Hot pink from logo gradient — buttons, active states */
--accent-dark-mode: #E8709A  /* Lighter pink for dark backgrounds */
--accent-hover: #B03860      /* Deeper for hover/pressed */
--bg-primary: #F9F9FC        /* Light page background */
--bg-dark: #1A1C1E           /* Dark page background */
--bg-card: #FFFFFF            /* Cards, inputs */
--text-primary: #1A1A18       /* Near-black body text */
--text-muted: #6E6A63         /* Captions, meta */
--font-headline: 'Sora', system-ui, sans-serif
--font-body: 'Inter', system-ui, sans-serif
```

### Backgrounds
- **Dot grid** on body (CSS radial-gradient): 12% light / 10% dark, 26px spacing
- **Circuit board** on landing pages only: `rose gold bg.jpeg` (light, 10% opacity) / `GD.jpeg` (dark, 35% opacity)
- Background layers use position:absolute (NOT fixed) to avoid breaking Safari toolbar
- Center blur ellipse on home page for clean text reading area
- Journey pages get the same background with content at z-10

### Send Button
- Round circle, arrow points UP (not forward)
- Grey `#D8D8DA` when empty (non-clickable)
- Accent `#D44A78` when text present
- Consistent across home hero, mobile, and in-chat

### Dark Mode
- Safari toolbar: DarkModeToggle sets body/html bg with !important + meta theme-color
- NEVER use position:fixed viewport-covering divs with bg-color (Safari reads them for toolbar)
- Toggle adds theme-transition class for smooth 300ms color shift

## Pricing Model — Monthly Subscriptions
**Free:** Unlimited Yulia Q&A, ONE ValueLens or deal score (email required)
**$49 Starter:** Unlimited ValueLens, deal scoring, VRR, SDE/EBITDA analysis, exports
**$149 Professional:** Everything in Starter + CIM, deal room, matching, sourcing, DD, LOI
**$999 Enterprise:** Everything in Professional + unlimited users, white-label, API, portfolio

## Four Journeys × Six Gates
- **SELL:** S0 Intake → S1 Financials → S2 Valuation → S3 Packaging → S4 Market Matching → S5 Closing
- **BUY:** B0 Thesis → B1 Sourcing → B2 Valuation → B3 Due Diligence → B4 Structuring → B5 Closing
- **RAISE:** R0 Intake → R1 Financial Package → R2 Investor Materials → R3 Outreach → R4 Terms → R5 Closing
- **PMI:** PMI0 Day 0 → PMI1 Stabilization → PMI2 Assessment → PMI3 Optimization

## Calculation Engine (client/src/lib/calculations/)
22 formula types, all pure JS, <16ms, deterministic:
- SDE, EBITDA, DSCR, IRR (Newton-Raphson), MOIC, FCF, DCF
- Valuation (multiple-based, blended multi-methodology)
- LBO full model (pro forma, sources/uses, exit analysis)
- SBA financing (eligibility, amortization)
- Tax impact (asset sale §1060, stock sale, goodwill §197, installment §453)
- Cap table dilution + exit waterfall
- Earnout expected value, covenant compliance, working capital
- Sensitivity matrix builder

## 10 Interactive Models (client/src/components/models/)
Valuation Explorer, LBO, SBA Financing, Tax Impact, Cap Table, Sensitivity Matrix, Deal Comparison, Earnout, Working Capital, Covenant Compliance. All use zustand store, react-chartjs-2 charts, responsive grids.

## Yulia's Canvas Tools
- `create_model_tab` — opens interactive models from conversation
- `update_model` — modifies assumptions ("what if EBITDA is $1.5M")
- `read_tab_state` — reads canvas state for contextual responses
- `get_sourcing_portfolio` — reads buyer's sourcing pipeline
- SSE canvas_action handler forwards tool results to zustand store

## Reference Documents
- METHODOLOGY_V17.md (v17.1) — Master methodology: all formulas, gate logic, analysis types
- SMBX_PLATFORM_REFERENCE.md — Platform identity, pricing, design system, sourcing, canvas architecture
- STYLE_GUIDE.md — Complete UI & brand style guide for marketing materials
- TESTING.md — Testing tracker with issue template system

## Key File Map
| File | Purpose |
|------|---------|
| client/src/pages/public/AppShell.tsx | THE layout — all routes, all views, tabbed canvas |
| client/src/components/models/ | 10 interactive financial model components |
| client/src/lib/calculations/core.ts | Deterministic calculation engine (22 formulas) |
| client/src/lib/modelStore.ts | Zustand store for model tab state |
| client/src/components/shared/ChatDock.tsx | THE chat input — used everywhere |
| client/src/components/shared/DarkModeToggle.tsx | Dark mode + Safari toolbar color management |
| client/src/components/chat/PortfolioCanvas.tsx | Sourcing portfolio management UI |
| server/index.ts | Express entry + auto-migrations |
| server/services/aiService.ts | AI orchestration + agentic loop |
| server/services/sourcingPipelineService.ts | 5-stage sourcing engine |
| server/services/tools.ts | 16 agentic tools |
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
| Agentic Loop | Claude Sonnet 4.6 (16 tools, 10-round limit) |
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
JWT_SECRET, NODE_ENV, PORT, APP_URL, CENSUS_API_KEY, TEST_MODE
