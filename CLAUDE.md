CLAUDE.md — smbx.ai

## What This Is
AI-powered deal intelligence platform for business acquisitions from $300K to mega-cap. Users talk to Yulia (AI deal intelligence) who guides them through buying, selling, or raising capital for businesses. Chat-first experience — users talk to Yulia, not dashboards. Yulia IS the front door — there is no sales team, no contact forms, no dead-end CTAs. Every action routes to chat.

## Core Architecture
- Chat-first UX — Guber v5.2 design system (Sora headings, Inter body)
- Node.js + Express (ESM) backend
- React 19 + Vite 7 + Tailwind CSS v3 + Radix UI frontend
- wouter for client routing
- PostgreSQL via raw postgres-js (no ORM)
- Claude API (primary), Google Gemini (secondary), OpenAI (tertiary)
- Stripe monthly subscriptions: Free / $49 Starter / $149 Professional / $999 Enterprise
- JWT authentication (no sessions, no passport — sessions broke on Railway)
- Railway deployment (GitHub push → auto-deploy)

## Critical Rules — Read These First
1. **MONTHLY SUBSCRIPTIONS.** Free (unlimited chat + 1 deliverable) / $49 Starter (unlimited analysis) / $149 Professional (CIM, deal room, matching) / $999 Enterprise (teams, API, white-label). No per-deal fees. No success fees. No wallet. Cancel anytime.
2. **FREE TIER.** Unlimited Yulia conversation. ONE free structured deliverable (ValueLens or deal score, email required). Second deliverable requires $49/month Starter.
3. **LEAGUE MULTIPLIERS DO NOT AFFECT PRICE.** Everyone uses the same subscription tiers. Leagues determine analytical complexity only (L1 gets 10-page CIM, L5 gets 60-page CIM).
4. **Yulia never says "As an AI."** She is expert M&A deal intelligence. Adapts persona by league: Coach (L1), Guide (L2), Analyst (L3), Associate (L4), Partner (L5), Macro (L6).
5. **Financial data: zero hallucination.** Extract exactly from documents, never invent numbers. Add-backs require user verification.
6. **All money stored in cents (integers).** Never use floating point for financial values.
7. **Chinese wall.** Buyer data and seller data strictly isolated. No cross-deal data leakage.
8. **Mobile browser first.** Design for mobile, then adapt to desktop.

## Legal Identity
smbx.ai is an AI-powered deal intelligence platform. NOT a broker, advisor, appraiser, law firm, or financial advisor. All outputs are AI-generated estimates for informational purposes only.
- Never say: "AI advisor", "business broker", "replace your broker", "appraisal", "we advise", "our advice"
- Always say: "AI deal intelligence", "AI-guided process", "AI-estimated value range", "our analysis shows"
- Required disclaimer on every deliverable: "smbx.ai is a technology platform, not a business brokerage, law firm, or financial advisor. All valuations, analyses, and documents are AI-generated estimates for informational purposes only."

## Design System — Guber v5.2
```
--bg-primary: #f9f9fc          /* Light gray canvas */
--bg-card: #FFFFFF             /* White cards */
--bg-sidebar: #f3f3f6          /* Sidebar background */
--text-primary: #1a1c1e        /* Near-black body */
--text-secondary: #5d5e61      /* Muted/meta */
--accent-primary: #b0004a      /* Crimson brand accent */
--font-headline: 'Sora', system-ui, sans-serif
--font-body: 'Inter', system-ui, sans-serif
/* Dark mode */
--bg-primary-dark: #0f1012
--bg-card-dark: #2f3133
--text-primary-dark: #f9f9fc
--border-dark: zinc-800
```

## Pricing Model — Monthly Subscriptions
**How It Works:**
1. User starts free → unlimited Yulia conversation, ONE free deliverable (ValueLens or deal score)
2. Second deliverable → $49/month Starter paywall (unlimited analysis, exports)
3. CIM, deal room, matching, sourcing → $149/month Professional upgrade
4. Teams, API, white-label → $999/month Enterprise
5. 30-day free trial of Professional available. Monthly billing, cancel anytime. No per-deal fees.

**Free:** Unlimited Yulia Q&A, ONE ValueLens or deal score (email required)
**$49 Starter:** Unlimited ValueLens, deal scoring, VRR, SDE/EBITDA analysis, Investment Thesis, Capital Stack, document exports
**$149 Professional:** Everything in Starter + CIM, deal room, buyer/seller matching, sourcing, DD checklists, LOI tools, living docs
**$999 Enterprise:** Everything in Professional + unlimited users, white-label, API, portfolio dashboard, priority support

## Four Journeys × Six Gates
- **SELL:** S0 Intake → S1 Financials → S2 Valuation → S3 Packaging → S4 Market Matching → S5 Closing
- **BUY:** B0 Thesis → B1 Sourcing → B2 Valuation → B3 Due Diligence → B4 Structuring → B5 Closing
- **RAISE:** R0 Intake → R1 Financial Package → R2 Investor Materials → R3 Outreach → R4 Terms → R5 Closing
- **Paywall:** After first free deliverable (not at a fixed gate). Upgrade prompts when user needs a higher-tier feature.
- **PMI:** PMI0 Day 0 → PMI1 Stabilization → PMI2 Assessment → PMI3 Optimization

## Math Engine — Exact Formulas
```
SDE = Net_Income + Owner_Salary + D&A + Interest + One_Time + Verified_Addbacks
EBITDA = Net_Income + D&A + Interest + Taxes + Verified_Addbacks - Non_Recurring
DSCR = EBITDA / Annual_Debt_Service (SBA ≥ 1.25, Conventional ≥ 1.50)
Valuation = (SDE or EBITDA) × (Base_Multiple + Growth_Premium + Margin_Premium)
Subscription: $49/mo Starter, $149/mo Professional, $999/mo Enterprise
```

**League Multiple Ranges:**
| League | Metric | Min | Max |
|--------|--------|-----|-----|
| L1 | SDE | 2.0x | 3.5x |
| L2 | SDE | 3.0x | 5.0x |
| L3 | EBITDA | 4.0x | 6.0x |
| L4 | EBITDA | 6.0x | 8.0x |
| L5 | EBITDA | 8.0x | 12.0x |
| L6 | EBITDA | 10.0x | — |

**Roll-Up Override:** veterinary, dental, HVAC, MSP, pest control. Revenue > $1.5M → force EBITDA metric.

## Key File Map
| File | Purpose |
|------|---------|
| server/db.ts | PostgreSQL connection via postgres-js (raw SQL) |
| server/index.ts | Express entry point |
| server/routes/chat.ts | Chat CRUD + SSE streaming endpoints |
| server/routes/auth.ts | JWT auth routes (login, signup, verify, Google OAuth) |
| server/routes/stripe.ts | Subscription checkout + Stripe webhooks |
| server/routes/export.ts | PDF/DOCX/XLSX export endpoints (pdfkit, docx, exceljs) |
| server/routes/dataRoom.ts | Folder/document management + file upload |
| server/routes/collaboration.ts | Deal invites, RBAC, NDA, day passes |
| server/routes/deliverables.ts | Deliverable CRUD, content editing, regeneration |
| server/services/aiService.ts | AI orchestration + agentic loop |
| server/services/subscriptionService.ts | Subscription management, plan access checks (replaces dealExecutionFee.ts) |
| server/services/paywallService.ts | Paywall prompt generation with subscription context |
| server/services/menuCatalogService.ts | Menu items catalog (deliverable listing) |
| server/services/leagueClassifier.ts | League detection from deal financials |
| server/services/gateReadinessService.ts | Gate advancement + paywall logic |
| server/services/dealAccessService.ts | RBAC: hasDealAccess, folder visibility, activity logging |
| server/services/dealService.ts | Deal CRUD, gate advancement, auto-advance |
| server/services/dealFreshnessService.ts | Financial snapshot tracking, stale deliverable detection |
| server/services/gateConversationService.ts | Gate transition lifecycle (summarize + archive + create) |
| server/services/gateSummaryService.ts | Claude Haiku gate conversation summarization |
| server/services/deliverableProcessor.ts | AI generation dispatch + category routing + auto-filing |
| server/services/modelRouter.ts | Deterministic/Haiku/Sonnet/Opus tier routing |
| server/services/optimizationPlanService.ts | Seller value optimization engine + milestones |
| server/services/exportService.ts | PDF/DOCX/XLSX generation with watermarking |
| server/services/documentExtractor.ts | PDF/XLSX/CSV extraction via Claude Vision |
| server/services/emailService.ts | Transactional emails via Resend |
| server/services/tools.ts | 12 agentic tools for authenticated chat |
| server/services/promptBuilder.ts | Dynamic prompt assembly with gate/league/knowledge layers |
| server/prompts/gatePrompts.ts | Gate-specific prompts for all 4 journeys |
| shared/gateRegistry.ts | 22 gate definitions, ordering, free/paid flags |
| client/src/pages/Chat.tsx | Main chat page with canvas, sidebar, composer |
| client/src/pages/public/AppShell.tsx | Unified shell for all public pages |
| client/src/components/chat/Canvas.tsx | Document viewer with export, edit, comments, stale badge |
| client/src/components/chat/Sidebar.tsx | Deal-grouped conversation sidebar |
| client/src/components/chat/PaywallCard.tsx | Subscription upgrade card (triggers after free deliverable) |
| client/src/hooks/useAuthChat.ts | Chat state management + SSE event handling |

## AI Orchestration (Anthropic Only)
| Task | Engine | Config |
|------|--------|--------|
| Chat/Conversation | Claude Sonnet 4.6 | Streaming, methodology context |
| Agentic Loop | Claude Sonnet 4.6 | 12-tool toolbelt, 10-round safety limit |
| Document Extraction | Claude Sonnet 4.6 | Vision (page-by-image), JSON output |
| Deliverable Generation | Tier-routed | 28 generators + 9 category generators + model routing |
| CIM Generation | Claude Opus 4.6 | High-quality long-form document |
| Gate Summarization | Claude Haiku 4.5 | Fast 3-4 sentence gate summaries |
| Optimization Plans | Claude Sonnet 4.6 | Structured JSON output |

**Model Router Tiers:** deterministic (no API call) → Haiku (fast/cheap) → Sonnet (default) → Opus (CIM, complex valuation)

## 28 Generators
`server/services/generators/`: valuationReport, sbaBankability, capitalStructure, cimGenerator, loiGenerator, financialModel, blindTeaser, ddPackage, workingCapital, dealScreeningMemo, intelligenceReport, fundsFlowStatement, closingChecklist, taxImpactAnalysis, pitchDeckGenerator, integrationPlanGenerator, executiveSummary, dealScoring, outreachStrategy, buyerList, lboModel, valueCreationPlan, dataRoomStructure, valueLens, valueReadinessReport, thesisDocument, sdeAnalysis, sectorAnalysis

## Export Pipeline
PDF (pdfkit), DOCX (docx), XLSX (exceljs). PPTX coming.

## Commands
```bash
npm run dev          # Start dev server (Vite + Express)
npm run build        # Build for production
```

## Database
All queries use raw postgres-js — no ORM:
```typescript
import { sql } from '../db.js';
const users = await sql`SELECT * FROM users WHERE id = ${userId}`;
```
Schema changes: raw SQL migrations in `server/migrations/`, run manually or on deploy.

## Environment Variables
DATABASE_URL, ANTHROPIC_API_KEY, GOOGLE_AI_API_KEY, OPENAI_API_KEY,
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET,
JWT_SECRET, NODE_ENV, PORT, APP_URL
