# SMBX BUILD PLAYBOOK
## Your Step-by-Step Guide to Building smbx.ai with Claude Code
**Version:** 2.0 | **Updated:** February 21, 2026
**Purpose:** This is YOUR guide, not Claude Code's. It tells you what to paste into CC, when, and what to check after each step.

---

## BEFORE YOU START

### Prerequisites
- GitHub repo: `paulbryantbaker-art/SMBx`
- Railway project with PostgreSQL service connected
- Railway URL: `smbx-production.up.railway.app`
- Claude Code open and connected to the SMBx repo
- GitHub Desktop for push/deploy

### Environment Variables (set in Railway)
```
DATABASE_URL=postgresql://...        # Railway provides this
ANTHROPIC_API_KEY=sk-ant-...         # Claude API
GOOGLE_AI_API_KEY=...                # Gemini (Phase 3+)
OPENAI_API_KEY=sk-...                # OpenAI fallback (Phase 3+)
STRIPE_SECRET_KEY=sk_test_...        # Stripe (Phase 4+)
STRIPE_PUBLISHABLE_KEY=pk_test_...   # Stripe (Phase 4+)
STRIPE_WEBHOOK_SECRET=whsec_...      # Stripe (Phase 4+)
JWT_SECRET=<random-64-char-string>   # Auth
NODE_ENV=production
PORT=3000
APP_URL=https://smbx.ai
```

### Tech Stack (LOCKED — do not deviate)
- **Frontend:** React 19 + Vite + Tailwind CSS v3 (NOT v4 — v4 breaks on Railway)
- **Backend:** Node.js + Express (ESM)
- **Database:** PostgreSQL via raw postgres-js (NOT Drizzle ORM — Drizzle broke on Railway)
- **Auth:** JWT with jsonwebtoken (NOT sessions, NOT passport — sessions broke on Railway)
- **Payments:** Stripe (wallet top-ups only, NO subscriptions)
- **AI:** Claude API (primary), Gemini (secondary), OpenAI (tertiary)
- **Deploy:** Railway (GitHub push → auto-deploy)

### Repo Documents — Staged Loading Strategy

CC has a ~200K token context window. Your docs total ~91K tokens. Loading them all at once will choke CC. Here's when each file enters the repo:

| File | Tokens | When to Add | CC Reads It? |
|------|--------|-------------|--------------|
| `CLAUDE.md` | ~2K | **Before Phase 0** | Auto-reads every session |
| `SMBX_COMPLETE_SPEC.md` | ~12K | **Before Phase 0** | When you tell it to |
| `METHODOLOGY_V17.md` | ~50K | **Before Phase 0** | NEVER fully — reference parts only |
| `YULIA_PROMPTS_V2.md` | ~18K | **Before Phase 3** | Feed in sections |
| `INDUSTRY_KNOWLEDGE_BASE.md` | ~9K | **Before Phase 6** | One-time DB seed, then forget |

### Golden Rules for Claude Code
1. **One task per prompt.** Never combine phases.
2. **CC should never have more than 2 docs in active context** (CLAUDE.md is always tiny + one working file).
3. **If CC gets slow or confused, it's overloaded.** Break the task smaller or start a new CC session.
4. **Always test on Railway**, not localhost. Your phone can't reach localhost.
5. **Mobile-first.** Test on your phone after every deploy.
6. **If CC drifts**, say: "Re-read CLAUDE.md" and it snaps back.

---

## PHASE 0: PROJECT SCAFFOLD (Day 1, ~2 hours)

### What You're Building
The empty project structure with all tooling configured correctly.

### Files CC Needs
- `CLAUDE.md` (auto-read)
- `SMBX_COMPLETE_SPEC.md` — Sections 1-4

### Step 1: Initialize Project

```
Prompt to CC:

"Read SMBX_COMPLETE_SPEC.md Sections 1-4.

Initialize the project from scratch:

1. Create package.json with type: "module" (ESM)
2. Install dependencies:
   - express, cors, helmet, compression, morgan
   - postgres (raw postgres-js — NO Drizzle ORM)
   - jsonwebtoken, bcryptjs
   - @anthropic-ai/sdk
   - stripe
   - dotenv

3. Install dev dependencies:
   - typescript, tsx, @types/node, @types/express
   - vite, @vitejs/plugin-react
   - tailwindcss@3, postcss, autoprefixer
   - concurrently

4. Create project structure:
   server/
     index.ts — Express server entry
     db.ts — postgres-js connection (import postgres from 'postgres')
     routes/auth.ts
     routes/chat.ts
     migrations/ — raw SQL files
   client/
     src/
       main.tsx
       App.tsx
       index.css — @tailwind base; @tailwind components; @tailwind utilities;
       pages/
       components/
       styles/DESIGN_SYSTEM.md
   shared/
     types.ts

5. Configure:
   - tsconfig.json (ESM, strict)
   - vite.config.ts (proxy /api to Express)
   - tailwind.config.js (v3 style, with design system colors from CLAUDE.md)
   - postcss.config.js (tailwindcss + autoprefixer)

6. Create server/db.ts:
   import postgres from 'postgres';
   const sql = postgres(process.env.DATABASE_URL!);
   export default sql;

7. npm run dev should start both Vite and Express concurrently.

DO NOT install Drizzle. DO NOT install express-session or passport.
Use Tailwind CSS v3, NOT v4."
```

### Step 2: Railway Deploy Test

```
Prompt to CC:

"Make sure the project builds for production:
- npm run build should compile the client (Vite) and the server (tsc or tsx)
- The Express server should serve the built client files in production
- Add a health check route: GET /api/health → { status: 'ok' }

Test: npm run build succeeds with zero errors."
```

Then: Commit, push via GitHub Desktop, check Railway builds successfully.

### ✅ Phase 0 Done When
- [ ] `npm run dev` starts both frontend and backend
- [ ] `npm run build` succeeds with zero errors
- [ ] Railway deploys without errors
- [ ] Visiting your Railway URL shows the React app
- [ ] GET `/api/health` returns `{ status: 'ok' }`

---

## PHASE 1: DATABASE (Day 1-2, ~3 hours)

### What You're Building
Core database tables and seed data.

### Files CC Needs
- `CLAUDE.md` (auto-read)
- `SMBX_COMPLETE_SPEC.md` — Section 5

### Step 1: Create Tables

```
Prompt to CC:

"Read SMBX_COMPLETE_SPEC.md Section 5 — Database Schema.

Create server/migrations/001_initial.sql with all the core tables
defined in the spec. Use raw SQL CREATE TABLE statements.

Then create a migration runner in server/migrate.ts that:
1. Reads SQL files from server/migrations/ in order
2. Runs them against the DATABASE_URL
3. Tracks which migrations have run (create a migrations table)

Run the migration now against the Railway database."
```

### Step 2: Seed Data

```
Prompt to CC:

"Create server/migrations/002_seed.sql that inserts:

1. Wallet blocks (all 10 tiers from the spec — $50 to $50,000)
2. Menu items (at least 10 core deliverables across Analyst, Associate, VP tiers)
3. Three test users:
   - seller@test.com (display_name: 'Test Seller')
   - buyer@test.com (display_name: 'Test Buyer')
   - raiser@test.com (display_name: 'Test Raiser')
   Hash passwords with bcryptjs. Password: 'test123' for all three.

4. Create a wallet for each test user with $500 balance.

Run the seed migration."
```

### ✅ Phase 1 Done When
- [ ] All core tables exist in Railway PostgreSQL
- [ ] Test users can be queried: `SELECT * FROM users;`
- [ ] Wallet blocks seeded: `SELECT * FROM wallet_blocks;`
- [ ] Menu items seeded: `SELECT * FROM menu_items;`
- [ ] Migration runner tracks completed migrations

---

## PHASE 2: AUTHENTICATION (Day 2, ~3 hours)

### What You're Building
JWT-based login/signup system.

### Files CC Needs
- `CLAUDE.md` (auto-read)
- `SMBX_COMPLETE_SPEC.md` — Section 6

### Step 1: Auth Routes

```
Prompt to CC:

"Read SMBX_COMPLETE_SPEC.md Section 6 — Authentication.

Build JWT-based auth in server/routes/auth.ts:

POST /api/auth/signup — Create user, return JWT
POST /api/auth/login — Verify credentials, return JWT
GET /api/auth/me — Verify JWT, return user data

JWT config:
- Sign with JWT_SECRET env var
- 30-day expiration
- Payload: { userId, email, league }

Auth middleware in server/middleware/auth.ts:
- Reads Authorization: Bearer <token> header
- Verifies token
- Attaches user to req.user
- Returns 401 if invalid

Use raw postgres-js for all queries. No ORM."
```

### Step 2: Login UI

```
Prompt to CC:

"Build the login page at client/src/pages/Login.tsx.

Simple form: email + password + Submit button.
On success: store JWT in memory (not localStorage), redirect to /chat.
On failure: show error message.

Style using the design system: cream background, terra cotta button,
serif heading, centered card layout.

Also build client/src/pages/Signup.tsx with: name + email + password + Submit.

Wire up routes in App.tsx:
- / → Login (or redirect to /chat if already authenticated)
- /signup → Signup
- /chat → Chat (protected, redirect to / if not authenticated)"
```

### ✅ Phase 2 Done When
- [ ] Can sign up with email/password
- [ ] Can log in with test accounts
- [ ] JWT returned and stored in memory
- [ ] Protected routes redirect to login if no token
- [ ] GET /api/auth/me returns user data with valid token

---

## PHASE 3: CHAT UI + YULIA AI (Days 3-5, ~12 hours)

### What You're Building
Claude.ai-mirror chat interface AND Yulia's first AI responses.

### Files CC Needs
- `CLAUDE.md` (auto-read)
- `SMBX_COMPLETE_SPEC.md` — Sections 7-10
- ADD `YULIA_PROMPTS_V2.md` to repo now — but tell CC to read only Sections 1-3

### Step 1: Chat UI

```
Prompt to CC:

"Build the chat interface that mirrors Claude.ai's design.
Read SMBX_COMPLETE_SPEC.md Section 15 for component specs.

client/src/pages/Chat.tsx:
- Left sidebar: conversation list (cream background #F0EDE6)
- Main area: message thread (white background)
- Bottom: input bar with textarea, send button
- Mobile: sidebar hidden by default, hamburger to toggle
- Messages: user messages right-aligned terra cotta, assistant left-aligned
- Typing indicator: three animated dots when waiting

server/routes/chat.ts (raw postgres-js + JWT auth):
- POST /api/chat/conversations — create new conversation
- GET /api/chat/conversations — list user's conversations
- GET /api/chat/conversations/:id/messages — get messages
- POST /api/chat/conversations/:id/messages — send message (echo for now)

Style EXACTLY like claude.ai — warm, minimal, rounded corners."
```

### Step 2: Connect Claude API

```
Prompt to CC:

"Read YULIA_PROMPTS_V2.md Sections 1-3 only (Master System Prompt,
League Personas, Journey Detection).

Build server/ai.ts:
- Import Anthropic SDK
- buildSystemPrompt(user, deal?) that assembles:
  • Master system prompt (always)
  • League persona (based on user's league, default L2)
  • Journey context (if deal exists)
- streamChat(conversationId, userMessage) that:
  • Builds system prompt
  • Sends to Claude API with streaming
  • Streams response back via SSE
  • Saves both messages to database

Update POST /api/chat/conversations/:id/messages to:
- Save user message
- Call streamChat
- Stream Yulia's response back to the client
- Save assistant message when complete

Update InputBar.tsx to handle SSE streaming responses."
```

### Step 3: Journey Detection

```
Prompt to CC:

"Read YULIA_PROMPTS_V2.md Section 3 — Journey Detection.

Update server/ai.ts to detect journey intent from the first few messages.
When Yulia detects the user wants to sell/buy/raise/integrate:
1. Create a deal record in the database
2. Set the journey type and initial gate (S0/B0/R0/PMI0)
3. Inject the gate-specific prompt into the system prompt

For now, just handle SELL journey detection. The others follow the same pattern."
```

### ✅ Phase 3 Done When
- [ ] Chat UI looks like claude.ai on mobile
- [ ] Sidebar shows conversation list, can create new conversations
- [ ] Messages display correctly (user right, Yulia left)
- [ ] Yulia responds via Claude API with streaming
- [ ] Yulia uses the master system prompt and league persona
- [ ] Typing indicator shows while Yulia is responding
- [ ] Journey detection works for SELL

---

## PHASE 4: WALLET + PRICING ENGINE (Days 5-7, ~12 hours)

### What You're Building
The complete wallet system with Stripe integration.

### Files CC Needs
- `CLAUDE.md` (auto-read)
- `SMBX_COMPLETE_SPEC.md` — Section 7

### Step 1: Wallet Service

```
Prompt to CC:

"Read SMBX_COMPLETE_SPEC.md Section 7.

Build server/services/walletService.ts:
- getWallet(userId) → { balance_cents, auto_refill_enabled, ... }
- addFunds(userId, amountCents, stripePaymentId) → updated wallet
- deductFunds(userId, amountCents, menuItemId, description) → updated wallet
- getTransactions(userId, limit) → transaction history

All amounts in cents. $1 in wallet = $1 purchasing power. No credit conversion.

Build the wallet badge component: client/src/components/wallet/WalletBadge.tsx
- Shows current balance in sidebar
- Clicking opens wallet page or top-up modal"
```

### Step 2: Stripe Integration

```
Prompt to CC:

"Build Stripe wallet top-up flow:

server/routes/stripe.ts:
- POST /api/stripe/create-checkout — Creates Stripe checkout session
  for selected wallet block. Sends block ID, returns session URL.
- POST /api/stripe/webhook — Stripe webhook handler.
  On checkout.session.completed: credit the user's wallet.

client/src/components/wallet/TopUpModal.tsx:
- Shows wallet blocks (all 10 tiers from spec)
- Each block shows: name, price, bonus amount, total dollars
- Clicking a block → Stripe checkout → redirect back → wallet updated

Use Stripe test mode keys. Test with card 4242 4242 4242 4242."
```

### Step 3: Purchase Flow

```
Prompt to CC:

"Build the deliverable purchase flow:

When Yulia presents a paid deliverable:
1. Show price: base price × league multiplier × wagyu (if applicable)
2. If wallet has enough: show 'Generate' button
3. If wallet doesn't: show inline top-up option
4. After purchase: deduct wallet, create deliverable record

Wire Yulia's paywall behavior:
- At Gate S2/B2/R2 (first paywall), Yulia explains the value
  and presents the purchase option
- If insufficient funds, Yulia shows top-up options in conversation
- After top-up, Yulia auto-continues: 'Great, let me generate that now.'"
```

### ✅ Phase 4 Done When
- [ ] Wallet displays in sidebar (correct balance)
- [ ] Can top up via Stripe (test mode)
- [ ] Stripe webhook credits wallet correctly
- [ ] Can purchase a deliverable (wallet deducted)
- [ ] Insufficient funds triggers top-up modal
- [ ] Transaction history displays correctly

---

## PHASE 5: JOURNEY + GATE SYSTEM (Days 7-9, ~12 hours)

### What You're Building
The full gate progression system across all 4 journeys.

### Files CC Needs
- `CLAUDE.md` (auto-read)
- `SMBX_COMPLETE_SPEC.md` — Section 8
- `YULIA_PROMPTS_V2.md` — Sections 4-7 (feed ONE section at a time)

### Step 1: Gate Registry + Readiness

```
Prompt to CC:

"Read SMBX_COMPLETE_SPEC.md Section 8.

Build:
1. shared/gateRegistry.ts — all 22 gates with metadata
2. server/services/gateReadinessService.ts:
   - checkGateReadiness(dealId, targetGate) → { ready, missing, blockers }
   - advanceGate(dealId, targetGate) → updates deal, creates event
3. shared/sidebarRules.ts:
   - getVisibleSections(journey, currentGate) → what sidebar shows
   - Progressive disclosure: only show items relevant to current gate
4. Routes: GET /api/deals/:id/gate-status, POST /api/deals/:id/advance-gate
5. GateProgress.tsx — visual indicator in chat header or sidebar"
```

### Step 2: Wire Gate Prompts to Yulia

Feed gate prompts one journey at a time:

```
"Read YULIA_PROMPTS_V2.md Section 4 — SELL Journey Gate Prompts (S0-S5).

Create server/prompts/sellGates.ts with system prompt additions
for each gate. Update server/ai.ts buildSystemPrompt() to include
the current gate prompt based on deal.currentGate.

Test: Start a SELL journey, go through S0, advance to S1,
verify Yulia's behavior changes."
```

Then repeat for BUY (Section 5), RAISE (Section 6), PMI (Section 7) — one at a time.

### ✅ Phase 5 Done When
- [ ] All 22 gates registered with metadata
- [ ] Gate readiness checks work
- [ ] Gate advancement updates deal and triggers events
- [ ] Sidebar shows progressive disclosure per gate
- [ ] Yulia's behavior changes per gate (different prompts)
- [ ] Paywall triggers at S2/B2/R2

---

## PHASE 6: DELIVERABLE GENERATION (Days 9-11, ~12 hours)

### What You're Building
AI-generated deliverables with proper output schemas.

### Files CC Needs
- `CLAUDE.md` (auto-read)
- `YULIA_PROMPTS_V2.md` — Section 8 (Deliverable Output Schemas)
- ADD `INDUSTRY_KNOWLEDGE_BASE.md` to repo now

### Step 1: Seed Industry Data

```
Prompt to CC:

"Read INDUSTRY_KNOWLEDGE_BASE.md.

Create server/migrations/003_industry_data.sql that seeds the
industry_verticals table with all 80 verticals from the knowledge base.

Each vertical needs: slug, name, category, sde_multiple_low,
sde_multiple_high, ebitda_multiple_low, ebitda_multiple_high,
median_margin, common_add_backs (jsonb), kpis (jsonb),
typical_buyers (jsonb), heat_rating, keywords (text array).

Run the migration."
```

### Step 2: Deliverable Generation Engine

```
Prompt to CC:

"Read YULIA_PROMPTS_V2.md Section 8 — Deliverable Output Schemas.

Build server/services/deliverableService.ts:
- generateDeliverable(dealId, menuItemSlug) → deliverable record
- Routes to the appropriate AI engine:
  • Valuation → Claude Sonnet (methodology context)
  • CIM → Claude Sonnet (template injection)
  • Financial Extraction → Gemini Flash (JSON mode, temp 0.0)
  • Market Intelligence → Gemini Pro + Search
  • Quick Valuation → Claude Haiku

Build client/src/components/deliverables/DeliverableCard.tsx:
- Renders deliverable results inline in chat
- Download/export button
- Shows calculation breakdowns (not just final numbers)"
```

### ✅ Phase 6 Done When
- [ ] Industry data seeded (80 verticals in DB)
- [ ] Valuation deliverable generates correctly
- [ ] CIM generates with proper structure
- [ ] Deliverable cards render in chat
- [ ] All deliverables respect league multipliers
- [ ] Financial calculations match methodology

---

## PHASE 7: LANDING PAGES (Days 11-13, ~8 hours)

### What You're Building
The public-facing website pages.

### Reference Doc (YOUR machine, not repo)
- `SMBX_SALES_WEBSITE_SPEC.md` — page-by-page content and layout

### Step 1: Design System + Nav

```
Prompt to CC:

"Create shared layout components for the public website:

client/src/components/layout/PublicNav.tsx:
- Logo (smbx.ai text), links: Sell, Buy, Raise, Pricing, Login
- Mobile: hamburger menu
- Sticky top, white background, subtle bottom border

client/src/components/layout/Footer.tsx:
- Three columns: Product (Sell, Buy, Raise, Integrate), Company (About, Pricing), Legal (Privacy, Terms)
- Copyright line at bottom

client/src/components/layout/PublicLayout.tsx:
- Wraps Nav + content + Footer"
```

### Step 2: Home Page

```
Prompt to CC:

"Build client/src/pages/public/Home.tsx.

HERO (centered, py-24):
Heading (serif, text-4xl): 'Sell a business. Buy a business. Raise capital.'
Subtext: 'Your M&A advisor, on demand.'
CTA button: 'Get started free →' → /signup

Three journey cards below:
- Sell your business → /sell
- Buy a business → /buy
- Raise capital → /raise
Cards: white, rounded-2xl, shadow, hover lift.

HOW IT WORKS section, CREDIBILITY section, FINAL CTA.
Mobile-first. Test at 375px wide."
```

### Step 3: Journey Pages + Pricing

Build /sell, /buy, /raise, /integrate, and /pricing pages one at a time.
Reference your `SMBX_SALES_WEBSITE_SPEC.md` for exact content.

### ✅ Phase 7 Done When
- [ ] All public pages render correctly
- [ ] Navigation works on mobile and desktop
- [ ] SEO meta tags set on each page
- [ ] CTAs link to /signup
- [ ] Pricing page shows wallet blocks with dollar amounts (not credits)
- [ ] Hero says "Sell a business. Buy a business. Raise capital."

---

## PHASE 8: TESTING + LAUNCH PREP (Days 13-15, ~8 hours)

### The Critical E2E Test

Do this on your actual phone:

1. Visit smbx-production.up.railway.app
2. Read the homepage — does it make sense in 2 seconds?
3. Click "Get started free" → lands on /signup
4. Create account with real email
5. Land on chat — see welcome screen with journey cards
6. Say "I want to sell my HVAC business"
7. Yulia should: detect SELL journey, start S0 intake, ask about the business
8. Answer Yulia's questions through S0 and S1 (free gates)
9. Reach S2 (valuation) — Yulia should present the paywall
10. Top up wallet with Stripe test card (4242 4242 4242 4242)
11. Purchase valuation deliverable
12. Deliverable generates and displays inline
13. Check sidebar shows gate progress
14. Check wallet balance decreased correctly

### Launch Checklist

```
Prompt to CC:

"Final launch prep:

1. Custom domain setup: Configure smbx.ai → Railway
2. SSL is automatic on Railway
3. Switch Stripe to live mode keys
4. Set up error monitoring (add Sentry or similar)
5. Database backup strategy (Railway provides this)
6. Rate limiting on auth routes
7. Remove test users from production seed (or add a cleanup)
8. Verify all env vars are set in Railway production"
```

### ✅ Phase 8 Done When
- [ ] E2E test passes on your phone
- [ ] Custom domain works (smbx.ai)
- [ ] Stripe live mode configured
- [ ] Error monitoring active
- [ ] Database backup configured
- [ ] No test data in production

---

## TROUBLESHOOTING

### CC Forgot the Rules
Say: "Re-read CLAUDE.md" — it snaps back immediately.

### CC Is Slow / Unresponsive
It's overloaded. Start a new CC session. Don't try to push through.

### Railway Build Fails
Common causes:
- Tailwind v4 native bindings → already fixed (using v3)
- Drizzle ORM errors → already fixed (using raw postgres-js)
- Missing env vars → check Railway dashboard
- TypeScript errors → ask CC to fix, don't manually edit

### Mobile Keyboard Pushes UI Up
This is a known mobile browser issue. CC should use `h-dvh` (dynamic viewport height) instead of `h-screen`, and the input bar should be `position: sticky` not `position: fixed`.

### Stripe Webhooks Not Firing
- Make sure webhook endpoint is public (Railway URL, not localhost)
- Verify webhook secret matches
- Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

### Yulia Says "As an AI"
The master system prompt forbids this. If it happens, the system prompt isn't being injected correctly. Check `server/ai.ts buildSystemPrompt()`.

---

## CC PROMPT CHEAT SHEET

When CC goes off track, use these:

| Problem | Say This |
|---------|----------|
| CC forgot design system | "Re-read client/src/styles/DESIGN_SYSTEM.md. Fix the styling." |
| CC forgot pricing rules | "Re-read CLAUDE.md. Pricing section." |
| CC used Drizzle | "We do NOT use Drizzle. Use raw postgres-js. Read server/db.ts." |
| CC used sessions | "We do NOT use sessions. JWT only. Read server/middleware/auth.ts." |
| CC used Tailwind v4 syntax | "We use Tailwind v3. Check tailwind.config.js." |
| CC used credits not dollars | "$1 = $1. No credit conversion. Read CLAUDE.md Rule 6." |
| CC built too much at once | "Stop. Let's focus on just [specific thing]. One task at a time." |
| CC is confused about gates | "Read SMBX_COMPLETE_SPEC.md Section 8 only. Focus on gate [X]." |

---

## POST-LAUNCH ROADMAP

### Week 1-2: Stabilize
- Monitor error logs
- Fix any mobile UI issues
- Watch Stripe webhook reliability
- Gather first user feedback

### Week 3-4: Iterate
- Polish Yulia's responses based on real conversations
- Add more industry verticals if needed
- Optimize gate advancement logic
- Add Google OAuth (Phase 2 enhancement)

### Month 2: Expand
- BUY journey full testing
- RAISE journey full testing
- PMI journey full testing
- Market intelligence engine (free data sources)
- Value-added services (business optimization plans)

### Ongoing
- Update industry multiples quarterly
- Expand deliverable catalog
- Add document upload + parsing (Gemini Flash)
- Enterprise features (broker dashboard, multi-deal)
- Apple passkey auth
