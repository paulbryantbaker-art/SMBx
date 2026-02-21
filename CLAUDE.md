CLAUDE.md — smbx.ai
What This Is
AI-powered M&A platform for SMB through mega-cap deals. Users talk to Yulia (AI advisor) who guides them through buying, selling, or raising capital for businesses. Chat-first experience — users talk to Yulia, not dashboards.
Core Architecture

Chat-first UX that mirrors claude.ai exactly — same layout, fonts, colors, sidebar, mobile behavior
Node.js + Express (ESM) backend
React 19 + Vite 7 + Tailwind CSS v3 + Radix UI frontend
wouter for client routing
PostgreSQL via raw postgres-js (no ORM — Drizzle broke on Railway, bypassed entirely)
Claude API (primary), Google Gemini (secondary), OpenAI (tertiary)
Stripe wallet payments — NO SUBSCRIPTIONS, NO TIERS
JWT authentication (no sessions, no passport — sessions broke on Railway)
Railway deployment (GitHub push → auto-deploy)

Critical Rules — Read These First

NO SUBSCRIPTIONS. Pure wallet + menu pricing. Users top up wallet with real dollars via Stripe, spend dollars on deliverables. $1 in wallet = $1 purchasing power. No separate "credit" unit. League multipliers adjust price by deal size.
Gate-by-gate pricing. Users pay small amounts progressively as they advance through gates — NOT one big lump sum per journey. Each gate unlock is a manageable price point that keeps users moving forward.
Mirror claude.ai UI exactly. Same layout, serif fonts (ui-serif/Georgia stack), warm cream background (#F5F5F0), terra cotta accent (#DA7756), collapsible left sidebar with chat history, centered chat at max-w-3xl, rounded-2xl composer with subtle shadow.
Mobile browser first. Design for mobile, then adapt to desktop. Sidebar hidden on mobile, slides in from left. Composer sticks above keyboard.
Yulia never says "As an AI." She is an expert M&A advisor. Adapts persona by league: Coach (L1), Guide (L2), Analyst (L3), Associate (L4), Partner (L5), Macro (L6).
Financial data: zero hallucination. Extract exactly from documents, never invent numbers. Add-backs require user verification.
League determines everything. L1-L6 controls: financial metric (SDE vs EBITDA), multiple ranges, deliverable pricing, Yulia persona, document complexity.
All money stored in cents (integers). Never use floating point for financial values.
Chinese wall. Buyer data and seller data strictly isolated. No cross-deal data leakage.

Reference Documents

METHODOLOGY_V17.md — Complete M&A methodology, 6 parts (~80 pages): Master rules, Exit (Sell), Raise, Buyer, Broker, PMI
SMBX_COMPLETE_SPEC.md — Full build specification with all details
YULIA_PROMPTS_V2.md — Agentic runtime: system prompts, gate scripts, conversation flows

Design Tokens (Mirror claude.ai)
css--bg-primary: #F5F5F0;        /* Warm cream canvas */
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
Pricing Model — Pure Wallet + Menu
How It Works

User signs up free → free gates hook them in (S0-S1, B0-B1, R0-R1, PMI0)
First paywall hits at gate 2 (valuation / investor materials)
User tops up wallet with real dollars via Stripe
Each gate advancement has a clear, small price — users pay as they progress
$1 in wallet = $1 of purchasing power (no credit conversion)
Yulia contextually proposes value-added services (optimization plans, transaction readiness) as natural upsells during the journey

Wallet Top-Up Blocks
BlockPriceBonusTotalDiscountStarter$50$0$500%Builder$100$5$1055%Momentum$250$25$27510%Accelerator$500$75$57515%Professional$1,000$200$1,20020%Scale$2,500$625$3,12525%Enterprise Lite$5,000$1,500$6,50030%Enterprise$10,000$3,000$13,00030%Enterprise Plus$25,000$7,500$32,50030%Institutional$50,000$15,000$65,00030%
Menu Tiers (Base Prices — before league multiplier)

Analyst ($5–$25): Quick valuations, market snapshots, comparable pulls
Associate ($25–$100): Full CIM drafts, buyer lists, financial models
VP ($100–$500+): Deep research packages, full DD suites

League Multipliers
LeagueDeal SizeMultiplierL1< $500K1.0×L2$500K–$1M1.25×L3$1M–$5M2.0×L4$5M–$10M3.5×L5$10M–$50M6.0×L6$50M+10.0×
Price Formula
Final Price = Base Price × League Multiplier × (1 + Wagyu Surcharge if applicable)
Free vs Paid

Free gates: S0-S1, B0-B1, R0-R1, PMI0 (intake, basic financials)
First paywall: S2 (Valuation), B2 (Target Valuation), R2 (Investor Materials)

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
Transaction_Fee = MAX(deal_value × 0.5%, $2,000)
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
FilePurposeserver/db.tsPostgreSQL connection via postgres-js (raw SQL)server/index.tsExpress entry pointserver/routes.tsAll API endpointsserver/routes/auth.tsJWT auth routes (login, signup, verify)server/routes/chat.tsChat CRUD + message endpointsserver/ai.tsAI orchestration (routes tasks to Claude/Gemini/OpenAI)server/services/walletService.tsWallet CRUD, balance checks, auto-refillserver/services/menuCatalogService.tsMenu items, wallet blocks, deal packagesserver/services/leagueRouter.tsLeague detection + multiplier calculationserver/services/gateReadinessService.tsGate advancement logicserver/services/complexityPreflightService.tsWagyu Rule surcharge detectionserver/services/deliverableGenerationService.tsAI generation orchestrationshared/gateRegistry.ts22 gates across 4 journeysshared/constants.tsLeague ranges, multiples, safe harbor, fee constantsclient/src/App.tsxAll frontend routing (wouter)client/src/layouts/AppLayout.tsxSidebar + main area (Claude mirror)client/src/styles/DESIGN_SYSTEM.mdUI component specs and design tokens
AI Orchestration
TaskEngineConfigChat/ConversationClaude Sonnet 4.5Streaming, methodology contextFinancial ExtractionGemini 2.5 FlashJSON only, temp 0.0Market IntelligenceGemini 2.5 Pro + SearchSearch grounding enabledDocument ForensicsClaude with RAGGrounded only, temp 0.1Drafting (LOI/CIM)Claude Sonnet 4.5Template injectionQuick ValuationClaude Haiku 4.5Structured output
Commands
bashnpm run dev          # Start dev server (Vite + Express)
npm run build        # Build for production
Database
All queries use raw postgres-js — no ORM. Pattern:
javascriptimport sql from '../db.ts';
const users = await sql`SELECT * FROM users WHERE id = ${userId}`;
Schema changes: write raw SQL migrations in server/migrations/ and run them manually or on deploy.
Environment Variables Required
DATABASE_URL, ANTHROPIC_API_KEY, GOOGLE_AI_API_KEY, OPENAI_API_KEY,
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET,
JWT_SECRET, NODE_ENV, PORT, APP_URL
