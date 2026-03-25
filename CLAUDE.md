CLAUDE.md — smbx.ai
What This Is
AI-powered deal intelligence platform for business acquisitions from $300K to mega-cap. Users talk to Yulia (AI deal intelligence) who guides them through buying, selling, or raising capital for businesses. Chat-first experience — users talk to Yulia, not dashboards. Yulia IS the front door — there is no sales team, no contact forms, no dead-end CTAs. Every action routes to chat.
Core Architecture

Chat-first UX that mirrors claude.ai exactly — same layout, fonts, colors, sidebar, mobile behavior
Node.js + Express (ESM) backend
React 19 + Vite 7 + Tailwind CSS v3 + Radix UI frontend
wouter for client routing
PostgreSQL via raw postgres-js (no ORM)
Claude API (primary), Google Gemini (secondary), OpenAI (tertiary)
Stripe one-time platform fee per deal — NO SUBSCRIPTIONS for end users, NO WALLET
JWT authentication (no sessions, no passport — sessions broke on Railway)
Railway deployment (GitHub push → auto-deploy)

Critical Rules — Read These First

ONE-TIME PLATFORM FEE. 0.1% of SDE or EBITDA, $999 minimum, one payment per deal. No wallet, no per-deliverable pricing, no credits. Everything through close + 180 days PMI is included. Fee formula: `fee_cents = Math.max(99900, Math.round(sde_or_ebitda * 0.001 * 100))`
FREE TIER IS GENEROUS. S0-S1, B0-B1, R0-R1, PMI0 are free. ValueLens, Value Readiness Report, Deal Scoring, Investment Thesis, Capital Stack — all free. CIM is PAID (behind S2/B2 paywall, included in platform fee).
Mirror claude.ai UI exactly. Same layout, serif fonts (ui-serif/Georgia stack), warm cream background (#F5F5F0), terra cotta accent (#C96B4F), collapsible left sidebar with chat history, centered chat at max-w-3xl, rounded-2xl composer with subtle shadow.
Mobile browser first. Design for mobile, then adapt to desktop. Sidebar hidden on mobile, slides in from left. Composer sticks above keyboard.
Yulia never says "As an AI." She is an expert M&A deal intelligence. Adapts persona by league: Coach (L1), Guide (L2), Analyst (L3), Associate (L4), Partner (L5), Macro (L6).
Financial data: zero hallucination. Extract exactly from documents, never invent numbers. Add-backs require user verification.
League determines everything. L1-L6 controls: financial metric (SDE vs EBITDA), multiple ranges, Yulia persona, document complexity.
All money stored in cents (integers). Never use floating point for financial values.
Chinese wall. Buyer data and seller data strictly isolated. No cross-deal data leakage.

Legal Identity — What We Are and Are Not

smbx.ai is an AI-powered deal intelligence platform. NOT a broker, advisor, appraiser, law firm, or financial advisor. All outputs are AI-generated estimates for informational purposes only.
Never say: "AI advisor", "business broker", "replace your broker", "appraisal", "we advise", "our advice"
Always say: "AI deal intelligence", "AI-guided process", "AI-estimated value range", "our analysis shows"
Required disclaimer on every deliverable: "smbx.ai is a technology platform, not a business brokerage, law firm, or financial advisor. All valuations, analyses, and documents are AI-generated estimates for informational purposes only."

Reference Documents

METHODOLOGY_V17.md — Complete M&A methodology, 6 parts (~80 pages): Master rules, Exit (Sell), Raise, Buyer, Broker, PMI

Design Tokens (Mirror claude.ai)
css--bg-primary: #F5F5F0;        /* Warm cream canvas */
--bg-secondary: #FFFFFF;       /* White composer/cards */
--bg-sidebar: #EDEDEA;         /* Sidebar background */
--text-primary: #1A1A18;       /* Near-black body */
--text-secondary: #6B6B65;     /* Muted/meta */
--accent-primary: #C96B4F;     /* Terra cotta brand */
--shadow-composer: 0 0.25rem 1.25rem rgba(0,0,0,0.035);
--font-serif: ui-serif, Georgia, Cambria, 'Times New Roman', serif;
/* Dark mode */
--bg-primary-dark: #2B2A27;
--bg-secondary-dark: #1F1E1B;
--text-primary-dark: #EEEEEE;
Pricing Model — One-Time Platform Fee
How It Works

User signs up free → free gates hook them in (S0-S1, B0-B1, R0-R1, PMI0)
First paywall hits at S2/B2/R2 gate — after Yulia calculates SDE/EBITDA from actual financials
Single Stripe checkout: 0.1% of SDE or EBITDA, $999 minimum
Everything after payment is included: all deliverables, deal room, buyer matching, DD coordination, closing support, 180-day PMI
No per-deliverable pricing. No wallet. No top-ups. One decision point.

Platform Fee Examples
| Deal | SDE/EBITDA | Fee | vs. Traditional |
|------|-----------|-----|----------------|
| Small business ($350K SDE) | $350K | $999 (minimum) | $15K-$40K broker |
| Mid-market ($3M EBITDA) | $3M | $3,000 | $100K-$200K IB |
| Upper mid ($8M EBITDA) | $8M | $8,000 | $200K-$400K IB |
| Large ($50M+ EBITDA) | $50M+ | Custom | Full IB engagement |

Advisor Subscriptions (separate from deal fee)
| Plan | Price | Details |
|------|-------|---------|
| Trial | Free | First 3 client deals |
| Pro | $299/month | Unlimited deals, branded outputs |
| Enterprise | $499/month | API, white-label, team seats |

Free vs Paid Deliverables

Free (S0-S1, B0-B1): ValueLens, Value Readiness Report, SDE/EBITDA analysis, Investment Thesis, Capital Stack, Deal Scoring
PAID (behind S2/B2 paywall): CIM, full financial models, DD packages, LOI tools, buyer lists, closing documents
Everything paid is included in the one-time platform fee — no additional charges

Four Journeys × Six Gates
SELL (S0–S5)
S0 Intake (free) → S1 Financials (free) → S2 Valuation (PAYWALL) → S3 Packaging → S4 Market Matching → S5 Closing
BUY (B0–B5)
B0 Thesis (free) → B1 Sourcing (free) → B2 Valuation (PAYWALL) → B3 Due Diligence → B4 Structuring → B5 Closing
RAISE (R0–R5)
R0 Intake (free) → R1 Financial Package (free) → R2 Investor Materials (PAYWALL) → R3 Outreach → R4 Terms → R5 Closing
PMI (PMI0–PMI3)
PMI0 Day 0 (free) → PMI1 Stabilization → PMI2 Assessment → PMI3 Optimization
Math Engine — Exact Formulas (AI must not invent)
SDE = Net_Income + Owner_Salary + D&A + Interest + One_Time + Verified_Addbacks
EBITDA = Net_Income + D&A + Interest + Taxes + Verified_Addbacks - Non_Recurring
DSCR = EBITDA / Annual_Debt_Service (SBA ≥ 1.25, Conventional ≥ 1.50)
Valuation = (SDE or EBITDA) × (Base_Multiple + Growth_Premium + Margin_Premium)
Platform_Fee = MAX(99900, ROUND(sde_or_ebitda * 0.001 * 100)) // in cents
League Multiple Ranges
javascriptconst LEAGUE_MULTIPLE_RANGES = {
  L1: { metric: 'SDE', min: 2.0, max: 3.5 },
  L2: { metric: 'SDE', min: 3.0, max: 5.0 },
  L3: { metric: 'EBITDA', min: 4.0, max: 6.0 },
  L4: { metric: 'EBITDA', min: 6.0, max: 8.0 },
  L5: { metric: 'EBITDA', min: 8.0, max: 12.0 },
  L6: { metric: 'EBITDA', min: 10.0, max: null },
};
Roll-Up Override
Industries: veterinary, dental, HVAC, MSP, pest control. If revenue > $1.5M → force EBITDA metric regardless of league.
Key File Map
| File | Purpose |
|------|---------|
| server/db.ts | PostgreSQL connection via postgres-js (raw SQL) |
| server/index.ts | Express entry point |
| server/routes/chat.ts | Chat CRUD + SSE streaming endpoints |
| server/routes/auth.ts | JWT auth routes (login, signup, verify, Google OAuth) |
| server/routes/stripe.ts | Platform fee checkout + Stripe webhooks |
| server/routes/export.ts | PDF/DOCX/XLSX export endpoints (pdfkit, docx, exceljs) |
| server/routes/dataRoom.ts | Folder/document management + deliverable comments |
| server/routes/collaboration.ts | Deal invites, RBAC, NDA, day passes |
| server/routes/deliverables.ts | Deliverable CRUD, content editing, regeneration |
| server/services/aiService.ts | AI orchestration + agentic loop |
| server/services/platformFeeService.ts | Platform fee calculation, Stripe checkout, payment verification |
| server/services/dealExecutionFee.ts | Fee formula: 0.1% of SDE/EBITDA, $999 min |
| server/services/menuCatalogService.ts | Menu items catalog (deliverable listing, no per-item pricing) |
| server/services/leagueClassifier.ts | League detection from deal financials |
| server/services/gateReadinessService.ts | Gate advancement + paywall logic |
| server/services/dealAccessService.ts | RBAC: hasDealAccess, folder visibility, activity logging |
| server/services/dealService.ts | Deal CRUD, gate advancement, auto-advance |
| server/services/dealFreshnessService.ts | Financial snapshot tracking, stale deliverable detection |
| server/services/gateConversationService.ts | Gate transition lifecycle (summarize + archive + create) |
| server/services/gateSummaryService.ts | Claude Haiku gate conversation summarization |
| server/services/deliverableProcessor.ts | AI generation dispatch + category routing + auto-filing |
| server/services/modelRouter.ts | Tier-based Claude model routing (Opus/Sonnet/Haiku) |
| server/services/optimizationPlanService.ts | Seller value optimization engine + milestones |
| server/services/exportService.ts | PDF/DOCX/XLSX generation with watermarking |
| server/services/documentExtractor.ts | PDF/XLSX/CSV extraction via Claude Vision |
| server/services/emailService.ts | Transactional emails via Resend (welcome, gate, deliverable) |
| server/services/paywallService.ts | Paywall prompt generation with fee context |
| server/services/tools.ts | 10 agentic tools for authenticated chat |
| server/services/promptBuilder.ts | Dynamic prompt assembly with gate/league/knowledge layers |
| server/prompts/gatePrompts.ts | Gate-specific prompts for all 4 journeys |
| server/services/generators/ | 23 specialized generators (valuation, CIM, LOI, LBO, etc.) |
| client/src/pages/Chat.tsx | Main chat page with canvas, sidebar, composer |
| client/src/pages/public/AppShell.tsx | Unified shell for all public pages |
| client/src/components/chat/Canvas.tsx | Document viewer with export, edit, comments, stale badge |
| client/src/components/chat/Sidebar.tsx | Deal-grouped conversation sidebar |
| client/src/components/chat/PaywallCard.tsx | Platform fee paywall card at S2/B2/R2 |
| client/src/components/chat/InteractiveModel.tsx | Financial model with sliders, scenarios, sensitivity |
| client/src/components/chat/DataRoom.tsx | Data room UI with folders, search, share links |
| client/src/components/chat/CommentsPanel.tsx | Deliverable commenting with resolve workflow |
| client/src/components/chat/NDAModal.tsx | NDA acceptance modal for deal participants |
| client/src/hooks/useAuthChat.ts | Chat state management + SSE event handling |
AI Orchestration (Anthropic Only)

| Task | Engine | Config |
|------|--------|--------|
| Chat/Conversation | Claude Sonnet 4.6 | Streaming, methodology context |
| Agentic Loop | Claude Sonnet 4.6 | 10-tool toolbelt, 10-round safety limit |
| Document Extraction | Claude Sonnet 4.6 | Vision (page-by-image), JSON output |
| Deliverable Generation | Tier-routed (Opus/Sonnet/Haiku) | 23 generators + 9 category generators + model routing |
| CIM Generation | Claude Opus 4.6 | High-quality long-form document |
| Gate Summarization | Claude Haiku 4.5 | Fast 3-4 sentence gate summaries |
| Optimization Plans | Claude Sonnet 4.6 | Structured JSON output |

Generators (server/services/generators/): valuationReport, sbaBankability, capitalStructure, cimGenerator, loiGenerator, financialModel, blindTeaser, ddPackage, workingCapital, dealScreeningMemo, intelligenceReport, fundsFlowStatement, closingChecklist, taxImpactAnalysis, pitchDeckGenerator, integrationPlanGenerator, executiveSummary, dealScoring, outreachStrategy, buyerList, lboModel, valueCreationPlan, dataRoomStructure
Commands
bashnpm run dev          # Start dev server (Vite + Express)
npm run build        # Build for production
Database
All queries use raw postgres-js — no ORM. Pattern:
javascriptimport { sql } from '../db.js';
const users = await sql`SELECT * FROM users WHERE id = ${userId}`;
Schema changes: write raw SQL migrations in server/migrations/ and run them manually or on deploy.
Environment Variables Required
DATABASE_URL, ANTHROPIC_API_KEY, GOOGLE_AI_API_KEY, OPENAI_API_KEY,
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET,
JWT_SECRET, NODE_ENV, PORT, APP_URL
