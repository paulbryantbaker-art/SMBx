CLAUDE.md — smbx.ai
Last updated: 2026-03-27

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
- Railway deployment (GitHub push → auto-deploy)
- Tabbed canvas system — tools open as persistent tabs in the right canvas panel

## Critical Rules — Read These First
1. **MONTHLY SUBSCRIPTIONS.** Free (unlimited chat + 1 deliverable) / $49 Starter (unlimited analysis) / $149 Professional (CIM, deal room, matching) / $999 Enterprise (teams, API, white-label). No per-deal fees. No success fees. No wallet. Cancel anytime.
2. **WALLET IS DEAD.** walletService, paywallService, dealExecutionFee, platformFeeService are all deleted. Do not recreate. Do not reference wallet, credits, balance, or execution fees.
3. **FREE TIER.** Unlimited Yulia conversation. ONE free structured deliverable per user (ValueLens or deal score, email required). Paywall triggers after first free deliverable, NOT at a fixed gate.
4. **LEAGUE MULTIPLIERS DO NOT AFFECT PRICE.** Everyone uses the same subscription tiers. Leagues determine analytical complexity only.
5. **Yulia never says "As an AI."** She is expert M&A deal intelligence. Adapts persona by league.
6. **Financial data: zero hallucination.** Extract exactly from documents, never invent numbers.
7. **All money stored in cents (integers).** Never use floating point for financial values.
8. **Chinese wall.** Buyer data and seller data strictly isolated.
9. **Mobile browser first.** Design for mobile, then adapt to desktop.
10. **AppShell.tsx is the ONLY layout.** Never create parallel layouts. All UI changes go here.
11. **ValueLens (NOT Bizestimate).** The old name is dead.
12. **Talk to Yulia (NOT Contact Sales).** All CTAs route to chat.

## The Line — What smbx.ai Is and Isn't
smbx.ai does 90% of what an investment bank does — the 90% that doesn't require a license.

**What we DO (no license required):**
- Financial analysis: SDE, EBITDA, add-backs, trend analysis, projections
- Valuation modeling: market comps, multiple analysis, DCF, LBO models
- Document generation: CIMs, blind teasers, executive summaries, pitch decks
- Deal structuring: capital stack modeling, DSCR analysis, sources & uses
- Due diligence coordination: checklists, document tracking, red flag analysis
- Market intelligence: industry multiples, PE activity, buyer demand signals
- Process management: gate advancement, milestone tracking, timeline coordination
- Deal sourcing: Google Places discovery, thesis matching, portfolio management

**What we DON'T do (requires a license):**
- Represent buyers or sellers in negotiations
- Provide legal opinions or draft legal documents
- Provide tax advice
- Formally appraise businesses
- Manage client funds

**Language rules:**
- NEVER: "I recommend" / "I advise" / "you should" → USE: "The analysis shows" / "The data suggests"
- NEVER: "Contact sales" / "Talk to our team" → Yulia IS the team
- NEVER: "As an AI" / "As a language model" → Never break character
- NEVER mention wallet, balance, credits, execution fee, or platform fee

## Design System — Guber v5.2
```
--bg-primary: #f9f9fc          /* Light gray canvas + dot grid background */
--bg-card: #FFFFFF             /* White cards */
--text-primary: #1a1c1e        /* Near-black body */
--text-secondary: #5d5e61      /* Muted/meta */
--accent-primary: #b0004a      /* Crimson brand accent */
--font-headline: 'Sora', system-ui, sans-serif
--font-body: 'Inter', system-ui, sans-serif
```
- Dot grid background on body (radial-gradient, 26px spacing, 12% light / 10% dark)
- Sidebar: 80px icon rail (Explore + Tools + Chats sections)
- Canvas: tabbed system with vertical icon strip on right edge (Dia-style)
- Logo: X2 Transparent.png in sidebar, "smbx" text with crimson X elsewhere

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

## Math Engine — Exact Formulas
```
SDE = Net_Income + Owner_Salary + D&A + Interest + One_Time + Verified_Addbacks
EBITDA = Net_Income + D&A + Interest + Taxes + Verified_Addbacks - Non_Recurring
DSCR = EBITDA / Annual_Debt_Service (SBA ≥ 1.25, Conventional ≥ 1.50)
```

## Key File Map
| File | Purpose |
|------|---------|
| client/src/pages/public/AppShell.tsx | THE layout — all routes, all views, tabbed canvas |
| client/src/components/shell/Sidebar.tsx | Shell sidebar (conversations grouped by deal) |
| client/src/components/shell/ChatMessages.tsx | Message rendering with markdown |
| client/src/components/shared/ChatDock.tsx | THE chat input — used everywhere |
| client/src/components/chat/Canvas.tsx | Document viewer with export/edit/comments |
| client/src/components/chat/PortfolioCanvas.tsx | Sourcing portfolio management UI |
| client/src/components/chat/SourcingPanel.tsx | Thesis management + intelligence brief |
| client/src/hooks/useAuthChat.ts | Authenticated chat state + SSE streaming |
| client/src/hooks/useAnonymousChat.ts | Anonymous chat state + SSE streaming |
| server/index.ts | Express entry point |
| server/routes/chat.ts | Chat CRUD + SSE streaming |
| server/routes/sourcing.ts | Sourcing pipeline + portfolio + candidate endpoints |
| server/services/aiService.ts | AI orchestration + agentic loop |
| server/services/sourcingPipelineService.ts | 5-stage sourcing engine |
| server/services/googlePlacesClient.ts | Field-mask-enforced Google Places wrapper |
| server/services/subscriptionService.ts | Subscription management |
| server/services/tools.ts | 13 agentic tools for authenticated chat |
| server/services/promptBuilder.ts | Dynamic prompt assembly |
| server/services/deliverableProcessor.ts | AI generation dispatch |
| server/services/marketDataService.ts | Census CBP (2023) + FRED + BLS |
| server/worker.ts | pg-boss scheduled jobs |

## Dead Code (deleted — do not recreate)
- walletService.ts, paywallService.ts, dealExecutionFee.ts, platformFeeService.ts
- Chat.tsx (standalone page — AppShell handles /chat)
- Home.tsx (standalone page — AppShell handles /)
- Advisors.tsx, Buy.tsx, Sell.tsx (standalone pages — AppShell handles these routes)
- chat/Sidebar.tsx (legacy — shell/Sidebar.tsx is the active one)
- HomeSidebar.tsx, PublicChatInput.tsx (orphaned, never imported)

## AI Orchestration
| Task | Engine |
|------|--------|
| Chat/Conversation | Claude Sonnet 4.6 |
| Agentic Loop | Claude Sonnet 4.6 (13 tools, 10-round limit) |
| Document Extraction | Claude Sonnet 4.6 (Vision) |
| Deliverable Generation | Tier-routed (28 generators) |
| CIM Generation | Claude Opus 4.6 |
| Gate Summarization | Claude Haiku 4.5 |
| Intelligence Brief | Claude Sonnet 4.6 (sourcing Stage 1) |
| Website Enrichment | Claude Haiku 4.5 |

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
JWT_SECRET, NODE_ENV, PORT, APP_URL, CENSUS_API_KEY
