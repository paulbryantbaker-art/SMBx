# CLAUDE.md — smbx.ai

## What This Is
AI-powered M&A platform for SMB through mega-cap deals. Users talk to Yulia (AI advisor) who guides them through buying, selling, or raising capital for businesses. Chat-first experience — users talk to Yulia, not dashboards.

## Core Architecture
- **Chat-first UX that mirrors claude.ai exactly** — same layout, fonts, colors, sidebar, mobile behavior
- Node.js + Express (ESM) backend
- React 19 + Vite 7 + Tailwind CSS 4 + Radix UI frontend
- wouter for client routing
- PostgreSQL via Drizzle ORM
- Claude API (primary), Google Gemini (secondary), OpenAI (tertiary)
- Stripe wallet payments — **NO SUBSCRIPTIONS, NO TIERS**
- Railway deployment

## Critical Rules — Read These First
1. **NO SUBSCRIPTIONS.** Pure wallet + menu pricing. Users buy credits via Stripe, spend them on deliverables from a menu. League multipliers adjust price by deal size.
2. **Mirror claude.ai UI exactly.** Same layout, serif fonts (ui-serif/Georgia stack), warm cream background (#F5F5F0), terra cotta accent (#DA7756), collapsible left sidebar with chat history, centered chat at max-w-3xl, rounded-2xl composer with subtle shadow.
3. **Mobile browser first.** Design for mobile, then adapt to desktop. Sidebar hidden on mobile, slides in from left. Composer sticks above keyboard.
4. **Yulia never says "As an AI."** She is an expert M&A advisor. Adapts persona by league: Coach (L1), Guide (L2), Analyst (L3), Associate (L4), Partner (L5), Macro (L6).
5. **Financial data: zero hallucination.** Extract exactly from documents, never invent numbers. Add-backs require user verification.
6. **League determines everything.** L1-L6 controls: financial metric (SDE vs EBITDA), multiple ranges, deliverable pricing, Yulia persona, document complexity.
7. **All money stored in cents (integers).** Never use floating point for financial values.
8. **Chinese wall.** Buyer data and seller data strictly isolated. No cross-deal data leakage.

## Reference Documents
- `METHODOLOGY_V17.md` — Complete M&A methodology, 6 parts (~80 pages): Master rules, Exit (Sell), Raise, Buyer, Broker, PMI
- `SMBX_COMPLETE_SPEC.md` — Full build specification with all details

## Design Tokens (Mirror claude.ai)
```css
--bg-primary: #F5F5F0;        /* Warm cream canvas */
--bg-secondary: #FFFFFF;       /* White composer/cards */
--bg-sidebar: #EDEDEA;         /* Sidebar background */
--text-primary: #1A1A18;       /* Near-black body */
--text-secondary: #6B6B65;     /* Muted/meta */
--accent-primary: #DA7756;     /* Terra cotta brand */
--shadow-composer: 0 0.25rem 1.25rem rgba(0,0,0,0.035);
--font-serif: ui-serif, Georgia, Cambria, 'Times New Roman', serif;
/* Dark mode */
--bg-primary-dark: #2B2A27;
--bg-secondary-dark: #1F1E1B;
--text-primary-dark: #EEEEEE;
```

## Pricing Model — Pure Wallet + Menu

### Wallet Blocks (Top-Up Options)
| Block | Price | Bonus | Total | Discount |
|-------|-------|-------|-------|----------|
| Starter | $50 | $0 | $50 | 0% |
| Builder | $100 | $5 | $105 | 5% |
| Momentum | $250 | $25 | $275 | 10% |
| Accelerator | $500 | $75 | $575 | 15% |
| Professional | $1,000 | $200 | $1,200 | 20% |
| Scale | $2,500 | $625 | $3,125 | 25% |
| Enterprise Lite | $5,000 | $1,500 | $6,500 | 30% |
| Enterprise | $10,000 | $3,000 | $13,000 | 30% |
| Enterprise Plus | $25,000 | $7,500 | $32,500 | 30% |
| Institutional | $50,000 | $15,000 | $65,000 | 30% |

### Menu Tiers
- **Analyst** ($5–$25): Quick valuations, market snapshots, comparable pulls
- **Associate** ($25–$100): Full CIM drafts, buyer lists, financial models
- **VP** ($100–$500+): Deep research packages, full DD suites

### League Multipliers
| League | Deal Size | Multiplier |
|--------|-----------|-----------|
| L1 | < $500K | 1.0× |
| L2 | $500K–$1M | 1.25× |
| L3 | $1M–$5M | 2.0× |
| L4 | $5M–$10M | 3.5× |
| L5 | $10M–$50M | 6.0× |
| L6 | $50M+ | 10.0× |

### Price Formula
```
Final Price = Base Price × League Multiplier × (1 + Wagyu Surcharge if applicable)
```

### Free vs Paid
- **Free gates:** S0-S1, B0-B1, R0-R1, PMI0 (intake, basic financials)
- **First paywall:** S2 (Valuation), B2 (Target Valuation), R2 (Investor Materials)

## Four Journeys × Six Gates

### SELL (S0–S5)
S0 Intake (free) → S1 Financials (free) → S2 Valuation (PAYWALL) → S3 Packaging → S4 Market Matching → S5 Closing

### BUY (B0–B5)
B0 Thesis (free) → B1 Sourcing (free) → B2 Valuation (PAYWALL) → B3 Due Diligence → B4 Structuring → B5 Closing

### RAISE (R0–R5)
R0 Intake (free) → R1 Financial Package (free) → R2 Investor Materials (PAYWALL) → R3 Outreach → R4 Terms → R5 Closing

### PMI (PMI0–PMI3)
PMI0 Day 0 (free) → PMI1 Stabilization → PMI2 Assessment → PMI3 Optimization

## Math Engine — Exact Formulas (AI must not invent)
```
SDE = Net_Income + Owner_Salary + D&A + Interest + One_Time + Verified_Addbacks
EBITDA = Net_Income + D&A + Interest + Taxes + Verified_Addbacks - Non_Recurring
DSCR = EBITDA / Annual_Debt_Service (SBA ≥ 1.25, Conventional ≥ 1.50)
Valuation = (SDE or EBITDA) × (Base_Multiple + Growth_Premium + Margin_Premium)
Transaction_Fee = MAX(deal_value × 0.5%, $2,000)
```

### League Multiple Ranges
```typescript
const LEAGUE_MULTIPLE_RANGES = {
  L1: { metric: 'SDE', min: 2.0, max: 3.5 },
  L2: { metric: 'SDE', min: 3.0, max: 5.0 },
  L3: { metric: 'EBITDA', min: 4.0, max: 6.0 },
  L4: { metric: 'EBITDA', min: 6.0, max: 8.0 },
  L5: { metric: 'EBITDA', min: 8.0, max: 12.0 },
  L6: { metric: 'EBITDA', min: 10.0, max: null },
};
```

### Roll-Up Override
Industries: veterinary, dental, HVAC, MSP, pest control. If revenue > $1.5M → force EBITDA metric regardless of league.

## Key File Map
| File | Purpose |
|------|---------|
| `shared/schema.ts` | All database tables (Drizzle ORM) |
| `shared/gateRegistry.ts` | 22 gates across 4 journeys |
| `shared/constants.ts` | League ranges, multiples, safe harbor, fee constants |
| `server/index.ts` | Express entry point |
| `server/routes.ts` | All API endpoints |
| `server/ai.ts` | AI orchestration (routes tasks to Claude/Gemini/OpenAI) |
| `server/services/walletService.ts` | Wallet CRUD, balance checks, auto-refill |
| `server/services/menuCatalogService.ts` | Menu items, wallet blocks, deal packages |
| `server/services/leagueRouter.ts` | League detection + multiplier calculation |
| `server/services/gateReadinessService.ts` | Gate advancement logic |
| `server/services/complexityPreflightService.ts` | Wagyu Rule surcharge detection |
| `server/services/deliverableGenerationService.ts` | AI generation orchestration |
| `client/src/App.tsx` | All frontend routing (wouter) |
| `client/src/layouts/AppLayout.tsx` | Sidebar + main area (Claude mirror) |

## AI Orchestration
| Task | Engine | Config |
|------|--------|--------|
| Chat/Conversation | Claude Sonnet 4.5 | Streaming, methodology context |
| Financial Extraction | Gemini 2.5 Flash | JSON only, temp 0.0 |
| Market Intelligence | Gemini 2.5 Pro + Search | Search grounding enabled |
| Document Forensics | Claude with RAG | Grounded only, temp 0.1 |
| Drafting (LOI/CIM) | Claude Sonnet 4.5 | Template injection |
| Quick Valuation | Claude Haiku 4.5 | Structured output |

## Commands
```bash
npm run dev          # Start dev server (Vite + Express)
npm run build        # Build for production
npx drizzle-kit push # Push schema to database
npx drizzle-kit generate # Generate migrations
```

## Environment Variables Required
```
DATABASE_URL, ANTHROPIC_API_KEY, GOOGLE_AI_API_KEY, OPENAI_API_KEY,
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET,
SESSION_SECRET, NODE_ENV, PORT, APP_URL
```
