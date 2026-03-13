# CLAUDE.md — smbX.ai Repository Reference
## Updated: March 13, 2026

## Stack
- **Frontend:** React 19 + Vite 7 + Tailwind CSS v3 (NOT v4 — native bindings break on Railway)
- **Backend:** Express + PostgreSQL with raw postgres-js (NOT Drizzle — breaks on Railway)
- **AI:** Anthropic API (Claude) for Yulia, SSE streaming
- **Payments:** Stripe (one-time charges via wallet blocks, NOT subscriptions at launch)
- **Deployment:** Railway
- **Auth:** JWT (deferred to Phase 6 — no auth walls at launch)
- **Fonts:** Inter (primary), Caveat (handwritten accents) — loaded in index.html

## Critical Technical Constraints
- **Chat morph:** Use `AppPhase` state machine (`'landing' | 'chat'`) with CSS animations. NEVER `useNavigate()` — causes remount, kills the smooth fade.
- **iOS Safari:** `overflow-hidden` must NEVER be applied to `position:fixed` chat containers (swallows touch scroll events). Use `--app-height` from `visualViewport.height`. NEVER use `h-dvh` or `100dvh` (does NOT shrink for iOS keyboard).
- **Layout dimensions:** Must use CSS classes, not inline styles (hooks can call `removeProperty` on inline styles).
- **Database:** Pure postgres-js throughout. `db.ts`, `seed.ts`, `shared/schema.ts` all use raw SQL / plain TS interfaces. No ORM.
- **Tailwind:** v3 only. v4 native bindings break on Railway.

## Commands
```bash
npm run dev          # Start dev server (frontend + backend)
npm run build        # Production build
npm run db:seed      # Seed database
npm run db:migrate   # Run migrations
```

## Authoritative Documents (in repo)
| File | Purpose |
|------|---------|
| `METHODOLOGY_V17.md` | Core methodology, league governance, calculation rules |
| `YULIA_PROMPTS_V3.md` | Runtime AI spec — system prompts, gate prompts, deliverable schemas, industry data |
| `SMBX_DESIGN_SYSTEM.md` | Visual design reference (Guber v5.2) |

**NOT in repo but authoritative (in Claude.ai project):**
- `SMBX_FINAL_BUILD_PLAN.md` — The definitive build plan. Supersedes all prior build plans.
- `SMBX_PRICING_CATALOG_v2` — Launch pricing: wallet model, 10 visible items, league multipliers
- `SMBX_DEAL_INTELLIGENCE_NARRATIVE.md` — Copy/messaging foundation
- `smbX.ai Market Strategy Playbook` — Competitive positioning, GTM strategy

## Build Plan Summary (Phase 1 = current priority)

### PHASE 1: THE FRONT DOOR
User types → Yulia responds → page morphs into tool → conversation works.
1. AI backend: Anthropic API + SSE streaming, `POST /api/chat/message`
2. System prompt: `server/prompts/masterPrompt.ts` (from YULIA_PROMPTS_V3 Section 1)
3. Dynamic prompt assembly: `server/prompts/buildSystemPrompt.ts` (journey context, league, gate injection)
4. Chat morph: `AppPhase` state machine with CSS fade animations
5. `ChatDock.tsx`: ONE shared component for all pages (public landing + chat view)
6. Topbar morph: nav links fade out, "Yulia" subtitle + back arrow appear
7. Message persistence: conversations + messages tables
8. iOS keyboard: `useAppHeight` hook with `--app-height` CSS var

### PHASE 2: GATES + FREE VALUE
Gate engine, journey/league/exit-type detection, free deliverable generators.

### PHASE 3: WALLET + PAYMENTS
Stripe Checkout, 6 wallet blocks, paywall cards in chat, TEST_MODE bypass.

### PHASE 4: CANVAS + DELIVERABLES
3-panel layout, all deliverable generators, export to PDF/DOCX.

### PHASE 5: INTELLIGENCE LAYER
Sovereign data (Census, BLS, FRED, SBA), living documents, negotiation intelligence.

### PHASE 6: AUTH + POLISH
JWT auth, anonymous→auth migration, mobile responsive, analytics.

## Pricing (Launch — Wallet Only)
```typescript
// League Multipliers
const LEAGUE_MULTIPLIERS = { L1: 1.0, L2: 1.5, L3: 3.0, L4: 5.0, L5: 8.0, L6: 10.0 };

// Base Prices (cents) — 10 visible items
const BASE_PRICES = {
  "business-valuation": 35000,       // $350
  "full-cim": 70000,                 // $700
  "sba-bankability": 20000,          // $200
  "deal-screening-memo": 15000,      // $150
  "market-intelligence": 20000,      // $200
  "loi-draft": 12500,                // $125
  "qoe-lite": 50000,                 // $500
  "financial-model": 30000,          // $300
  "sector-analysis": 15000,          // $150
  "working-capital-analysis": 15000  // $150
};

// Wallet Blocks: $50, $100+$5, $250★+$15, $500+$40, $1000+$100, $2500+$300
// TEST_MODE=true bypasses Stripe charges for development
```

## Design System Quick Reference
- **Logo:** `smbX.ai` — only the X in terra cotta (#D4714E), everything else primary text color
- **User bubbles:** bg #FFF0EB, text #1A1A18, border 1px solid rgba(212,113,78,0.18)
- **3-panel workspace:** sidebar (#EDEAE5), chat (#F5F3EF), canvas (#FFFFFF)
- **60/30/10 rule:** Terra is functional only (active states, send button), not decorative
- **Desktop hero:** `min-h-[calc(100vh-80px)]`, max-w-[860px] chat card, shadow-2xl, 40px radius, text-[56px] headline

## Key Rules for Yulia
- Yulia is an expert human M&A advisor. Never "As an AI."
- 4-Beat First Response: Classify → Estimate → Insight → Question. Always start with a real number.
- Wallet uses dollars, not credits. $1 = $1. Never say "credits."
- Advisors/brokers are CUSTOMERS. Never position against them.
- Free deliverables auto-generate when data is ready. Don't ask permission.
- Paid deliverables: explain value first, then price. Compare to human advisory cost.

## File Structure (target)
```
server/
├── routes/chat.ts                 # Chat API endpoints
├── prompts/
│   ├── masterPrompt.ts            # Full Yulia system prompt (V3 Section 1)
│   └── buildSystemPrompt.ts       # Dynamic prompt assembly
├── services/
│   ├── paywallService.ts          # Pricing catalog + league multipliers
│   ├── gateService.ts             # Gate progression + completion triggers
│   ├── walletService.ts           # Wallet operations
│   └── deliverableService.ts      # Deliverable generation orchestration
└── migrations/

client/src/
├── components/
│   ├── ChatDock.tsx               # ONE shared chat input (public + chat view)
│   └── Canvas.tsx                 # Deliverable viewer/editor
├── hooks/
│   ├── useChat.ts                 # Chat state, SSE streaming
│   └── useAppHeight.ts            # iOS keyboard fix
├── pages/public/                  # All public pages
└── App.tsx                        # AppPhase state machine
```
