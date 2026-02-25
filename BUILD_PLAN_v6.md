# smbx.ai — Master Build Plan v6

### Last Updated: February 24, 2026
### Supersedes: BUILD_PLAN_v5 (February 21, 2026)

---

## CRITICAL: Source-of-Truth Hierarchy

This build plan is the MASTER DOCUMENT. It contains the roadmap, the intelligence engine blueprint, the conversion architecture, and Yulia's agentic specifications. For detailed implementations, reference:

| Document | What It Governs | Status |
|----------|----------------|--------|
| **This file (BUILD_PLAN_v6.md)** | Everything: roadmap, tech stack, pricing, intelligence engine, conversion flow, competitive positioning | MASTER |
| **METHODOLOGY_V17.md** | Strata OS, Yulia's personality, gate logic, journey definitions, financial formulas | AUTHORITATIVE (in repo) |
| **YULIA_PROMPTS_V2.md** | Runtime prompts, league personas, gate-by-gate scripts, deliverable schemas, industry knowledge base | AUTHORITATIVE (in repo) |
| **smbx-v12-prototype.html** | Visual source of truth — SPA with landing, journey views, chat morph, dock, all CSS values, all journey content | AUTHORITATIVE (LATEST) |
| **SMBX_PUBLIC_WEBSITE_SPEC.md** | V5 spec — OUTDATED, superseded by v12 prototype for front-end architecture | REFERENCE ONLY |
| **SMBX_DESIGN_SYSTEM.md** | Design tokens — NEEDS UPDATE to match v12 prototype (Inter font, new color values, new component patterns) | NEEDS UPDATE |

**Rule: When the prototype HTML and any spec disagree, the prototype wins. The v12 prototype is the current source of truth for all front-end design.**

---

## 1. What SMBX Is — The One-Paragraph Pitch

SMBX is an AI-powered M&A intelligence platform where a conversational AI advisor named Yulia guides users through buying, selling, or getting agency-level deal work at any deal size — from a $300K landscaping company to a $500M PE roll-up. Users talk to Yulia, not dashboards. She asks questions, classifies their business, runs financial analysis, generates institutional-grade deliverables, surfaces market intelligence, and advances them through a structured deal process. The platform monetizes through a pure wallet system ($1 = $1) where users pay per deliverable at ~10% of human advisory cost. The intelligence engine — powered by free government data (Census, BLS, FRED, SEC EDGAR) and Claude's research capabilities — delivers PitchBook-quality market intelligence for under $225/month in infrastructure costs. No existing platform combines AI-synthesized, localized market intelligence with deal flow. That gap is the moat.

**The Product Is Not Documents. The Product Is Intelligence.**

Users come for a valuation, stay for the market intelligence, and buy deliverables when the intelligence surfaces something actionable. The LOI → DD → Close workflow is table stakes. The WOW factor is: "I opened the app and Yulia told me a business matching my buy box just appeared, it's undervalued by 15%, and the owner has no succession plan."

---

## 2. Current State (February 24, 2026)

### ✅ Built and Deployed
- **Public website**: Homepage, /sell, /buy, /raise, /integrate, /pricing, /how-it-works, /enterprise — deployed but **being replaced** by v12 SPA prototype
- **React + Express + Tailwind v3** running on Railway
- **PostgreSQL** on Railway (raw postgres-js queries)
- **JWT auth** working (no password validation yet — placeholder)
- **Basic chat UI** (Claude.ai-style sidebar, messages, input bar)
- **Anthropic API key** configured on Railway

### 🔨 Building NOW — v12 Prototype Conversion
- **New SPA architecture** — single page with Landing/Journey/Chat states (replaces multi-page routes)
- **New design system** — Inter font only (replaces Playfair Display + Instrument Sans), updated terra (#D4714E), new color tokens
- **4 journey views** — sell, buy, agency & automation (was raise), AI intelligence (was integrate)
- **Dock** — fixed bottom chat input always visible (replaces hero chat input)
- **Tools popup** — 4 pre-fill items (replaces suggested prompt pills)
- **Chat morph** — state transitions with fade animations
- **Anonymous session system** — no auth wall, anyone can chat immediately

### 🔜 What's Next
- Agentic gate system (S0→S5, B0→B5, R0→R5, PMI0→PMI3)
- Wallet + Stripe + paywall integration
- Deliverable generation pipeline
- Intelligence data pipeline (government data APIs + AI synthesis)

---

## 3. Design System (from smbx-v12-prototype.html — SOURCE OF TRUTH)

### CRITICAL: This prototype replaces the v5 prototype entirely. Different fonts, different colors, different architecture.

### Colors (from prototype :root)

| Token | Hex | Usage |
|-------|-----|-------|
| cream | #FAF8F4 | Page background, topbar bg |
| fill | #F3F0EA | Recessed zones, plus-button bg |
| white | #FFFFFF | Cards, message bubbles, elevated surfaces |
| terra | #D4714E | Primary accent — CTAs, send button, Yulia avatar, links |
| terra-hover | #BE6342 | Hover/pressed state |
| terra-soft | #FFF0EB | Tags, badges, plus-button hover |
| terra-glow | rgba(212,113,78,.12) | Card focus shadows, input focus ring |
| text | #1A1A18 | Headings, primary body — NEVER #000000 |
| text-mid | #3D3B37 | Secondary body text |
| muted | #6E6A63 | Placeholders, descriptions, back button |
| faint | #A9A49C | Hints, typing dots, weakest text |
| border | #DDD9D1 | Borders, dividers, dock top border |

**REMOVED from old prototype:** stone (#E8E4DC), stone-light (#F0EDE6), cream-deep, warm-white. These tokens no longer exist.

### Shadows (4-tier system)

| Token | Value | Usage |
|-------|-------|-------|
| shadow-sm | 0 1px 3px rgba(26,26,24,.06) | Subtle, card active state |
| shadow-card | 0 1px 4px rgba(26,26,24,.05) | Default card, message bubbles |
| shadow-md | 0 2px 8px rgba(26,26,24,.07), 0 1px 2px rgba(26,26,24,.04) | Card hover |
| shadow-lg | 0 4px 20px rgba(26,26,24,.08), 0 1px 3px rgba(26,26,24,.05) | Dock card, hero card, tools popup |

### Typography
- **SINGLE FONT**: Inter (weight 400-800) — imported from Google Fonts
- Both `--serif` and `--sans` are set to `'Inter', system-ui, sans-serif`
- **Playfair Display and Instrument Sans are GONE** — removed entirely
- Headings use Inter 800 weight, not a separate serif font
- H1: 44px/48px/54px (mobile/tablet/desktop), font-weight 800, letter-spacing -.03em
- Body: 17px/18px, font-weight 500

### Logo
`smb` in #1A1A18 + `x` in #D4714E + `.ai` in #1A1A18. Inter bold 26px (28px desktop), letter-spacing -.03em.

### Architecture: Single-Page App (NOT Multi-Page)

The prototype is a **single-page application**, not separate route pages:

```
┌─────────────────────────────────────┐
│  TOPBAR (logo centered in chat,     │
│  back button, login icon)           │
├─────────────────────────────────────┤
│                                     │
│  SCROLL AREA                        │
│  ├── LANDING (4 journey cards)      │
│  ├── JOURNEY (dynamic content)      │
│  └── MESSAGES (chat view)           │
│                                     │
├─────────────────────────────────────┤
│  DOCK (fixed bottom, always visible)│
│  └── Chat input + tools popup       │
└─────────────────────────────────────┘
```

**Three states, one page:**
1. **Landing** — h1 + subtitle + 4 action cards (Sell, Buy, Agency, Intelligence)
2. **Journey** — user clicks a card → landing fades → journey content slides in
3. **Chat** — user sends message → journey fades → messages appear, topbar enters chat-mode

**No separate /sell, /buy, /raise, /integrate routes.** Everything is rendered dynamically within the scroll area.

### Topbar (replaces traditional Nav)
- Always visible, fixed at top
- Logo left (centered when in chat-mode via `position:absolute;left:50%;transform:translateX(-50%)`)
- Back button (hidden by default, appears via `.has-back` class)
- "Yulia" subtitle appears below logo in chat-mode
- Login icon (user silhouette) right side
- Border-bottom appears in chat-mode: `border-bottom-color: var(--border)`
- **No nav links** (no Sell, Buy, Pricing, etc.)

### Dock (replaces hero chat input)
- Fixed to bottom of screen, always visible
- Contains the chat input card with terra border (1.5px solid rgba(212,113,78,.35))
- **Plus button** (left side) — opens/closes tools popup, rotates 45° when open
- **Send button** (right side) — appears only when text entered, terra circle 36px
- Focus state: border turns solid terra, 4px terra-glow ring
- Max-width 640px centered
- padding-bottom uses `env(safe-area-inset-bottom)` for iPhone notch

### Tools Popup (replaces suggested prompt pills)
4 tool items that pre-fill the input:
1. **Upload financials** — "I have financials to share —" (paperclip icon)
2. **Business valuation** — "I need a business valuation — I own a" (compass icon)
3. **Search for a business** — "Help me find a business — I'm looking for" (search icon)
4. **SBA loan check** — "Can this deal get SBA financing? I'm looking at a" (shield icon)

Popup drops DOWN from hero card, drops UP from dock (it's at screen bottom).

### Landing Page Content
- H1: "Sell a business. Buy a business. Raise capital." (Inter 800, 44-54px)
- Subtitle: "Meet Yulia, your expert M&A advisor." (Inter 400, 20px, muted)
- 4 action cards in 2×2 grid (4×1 on desktop):
  1. **Sell my business** (layers icon)
  2. **Buy a business** (cart icon)
  3. **Agency & automation** (star icon) — REPLACES "Raise Capital"
  4. **AI intelligence** (cube icon) — REPLACES "Integrate"

### 4 Journey Views (rendered dynamically, NOT separate pages)

| Journey | Label | Headline | Replaces |
|---------|-------|----------|----------|
| sell | SELL-SIDE | Know what you're worth. *Exactly.* | /sell page |
| buy | BUY-SIDE | Find the deal. *Know the math.* | /buy page |
| agency | AGENCY & AUTOMATION | She does *the work.* | /raise page (NEW) |
| intelligence | AI INTELLIGENCE | Intelligence no one *else has.* | /integrate page (NEW) |

Each journey has: label, h1, subtitle, Yulia insight box (gradient bg), phased sections with cards, deal-size examples (clickable → sends message), and a quote block.

### Chat Components

- **User message (.mu)** — terra bg (#D4714E), white text, border-radius 20px 20px 6px 20px, right-aligned, max-width 82%
- **Yulia message (.my)** — white bg, shadow-card, border-radius 20px, left-aligned, max-width 90%
- **YuliaAvatar (.ya)** — 32px circle (border-radius: 50%), terra bg, white "Y" text, 12px font-weight 700
- **Typing indicator** — 3 dots, 8px circles, faint color, animated pulse
- **Messages max-width**: 640px centered

### No Footer
The prototype has no footer. The dock replaces the footer area.

### Animations
- `fu` (fade up): opacity 0→1, translateY 10px→0, 0.4s ease (staggered with delays)
- `si` (slide in): opacity 0→1, translateY 6px→0, 0.3s ease (for messages)
- `dp` (dot pulse): scale 0.8↔1, opacity 0.3↔1, 1.4s ease infinite (typing dots)

### Responsive Breakpoints
- Mobile: <768px (default)
- Tablet: ≥768px (max-width 860px, padding 0 40px)
- Desktop: ≥1024px (max-width 960px, padding 0 48px)

---

## 4. Tech Stack (VERIFIED WORKING ON RAILWAY)

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js + Express (ESM) |
| Frontend | React 19 + Vite 7 + Tailwind CSS v3 + Radix UI |
| Database | PostgreSQL via raw postgres-js queries |
| Job Queue | **pg-boss** (PostgreSQL-native, Phase G+) → BullMQ + Redis (Phase 3 / 500+ users) |
| Agent Framework | **LangGraph.js** with PostgreSQL checkpointer (Phase G+) |
| Search | pgvector extension for semantic search (Phase I+) |
| AI | Anthropic Claude (primary), Google Gemini (secondary), OpenAI (tertiary) |
| Payments | Stripe (wallet top-ups via Checkout — NOT subscriptions) |
| Auth | JWT tokens + bcrypt (stored in localStorage) |
| Deployment | Railway: **Web service** + **Worker service** + PostgreSQL (auto-deploy from GitHub) |
| Domain | smbx.ai via Cloudflare (DNS + CDN) |
| Data Sources | Census CBP, BLS QCEW, BEA, FRED, SEC EDGAR, IRS SOI, GDELT, Google Trends |

**RAILWAY DEPLOYMENT ARCHITECTURE:**
```
Railway Project
├── Web Service (~0.5 vCPU, 512MB) — Express API, serves React frontend
├── Worker Service (~0.25 vCPU, 512MB) — pg-boss consumer, runs background agents
└── PostgreSQL (~0.25 vCPU, 512MB, 2GB) — app data + job queue + agent state
    (shared via Railway private networking)
```

**WHY pg-boss INSTEAD OF BullMQ + Redis:**
- pg-boss uses PostgreSQL's `SKIP LOCKED` for exactly-once job delivery
- Eliminates Redis dependency entirely ($0 vs $5-10/month for Upstash)
- Cron scheduling, retries, delayed jobs, archiving — all in existing database
- Single data store = simpler ops, fewer failure modes
- Handles 0-500 users easily; migrate to BullMQ + Redis only when throughput demands it

**RAILWAY COMPATIBILITY — LEARNED THE HARD WAY:**
- ❌ Tailwind v4 → native binding failure (@tailwindcss/oxide). Use v3.
- ❌ Drizzle ORM → connection issues on Railway. Use raw postgres-js with `ssl: 'require', prepare: false`.
- ❌ Express sessions + connect-pg-simple → ECONNREFUSED errors. Use JWT tokens.
- ❌ wouter → replaced with React Router.
- ✅ PostCSS handles Tailwind in v3 (no @tailwindcss/vite plugin needed).

### AI Model Routing

| Task | Model | % of calls | Rationale |
|------|-------|-----------|-----------|
| Scanning, matching, classification, news summary, notifications | Haiku 4.5 | ~80% | $1/$5 per M tokens — near-Sonnet-4 quality |
| Yulia conversation, valuations, market analysis, strategic recs | Sonnet 4.5 | ~15% | $3/$15 per M tokens — deep reasoning |
| Premium docs (CIMs, QoE), legal review | Opus 4.6 | ~5% | Maximum quality for high-value deliverables |

### Cost Optimization Stack (multiplicative — each layer stacks on the previous)

| Optimization | Savings | How |
|-------------|---------|-----|
| Model tiering (80% Haiku) | 60-70% | Background tasks on cheapest model |
| Batch API | 50% on top | All background jobs submitted as batches, 24hr window |
| Prompt caching | Up to 90% on input | System prompts + templates cached, $0.10/M vs $1.00/M |
| Shared intelligence | 50-80% fewer calls | Sector analysis runs once, distributes to all users in that sector |

**Combined effect:** Per-user background AI cost drops from ~$2.45/month (Sonnet only) to ~$0.20-0.31/month (fully optimized). At $170/month API budget: **550-850 lightly active users** or **25-30 power users**.

---

## 5. The Conversion Architecture — How the Website BECOMES the App

### Single-Page App — Three States, One Page

The product is a single-page application with three states. There are NO separate route pages (/sell, /buy, etc.). The dock (chat input) is ALWAYS visible at the bottom. Users can type from any state.

```
STATE 1: LANDING
  h1 + subtitle + 4 journey cards (2×2 mobile, 4×1 desktop)
  Dock visible at bottom with "Tell Yulia about your deal..."

STATE 2: JOURNEY
  User clicks a card → landing fades out → journey content appears
  Back button appears in topbar, dock placeholder changes per journey
  Journey pages have clickable deal-size cards that pre-fill the input

STATE 3: CHAT
  User sends a message (from any state) → content fades → messages appear
  Topbar enters chat-mode (logo centered, "Yulia" subtitle, back button)
  Dock stays, messages scroll in the scroll-area
```

### The Morph Flow

**From Landing → Chat (direct):**
1. Landing fades out (opacity 0, translateY -10px, 350ms)
2. Messages container activates, dock stays
3. App gets `chat-mode` and `has-back` classes
4. Topbar: logo moves to center, "Yulia" subtitle appears, back button shows
5. User message appears (terra bubble, right-aligned)
6. Typing indicator → Yulia responds

**From Journey → Chat:**
1. Journey content fades out (opacity 0, translateY -10px, 300ms)
2. Same transition to chat-mode as above
3. Journey context injected into Yulia's system prompt

**Back button** returns to landing (resets everything — clears messages, restores landing, removes chat-mode classes).

### The Dock — Always-Visible Chat Input

The dock is fixed to the bottom of the screen on every state:
- **Plus button** (left) → opens tools popup with 4 pre-fill options
- **Textarea** with journey-specific placeholder
- **Send button** (right) → appears only when text entered, terra circle

**Tools popup items** (replace the old suggested prompt pills):
1. Upload financials → "I have financials to share —"
2. Business valuation → "I need a business valuation — I own a"
3. Search for a business → "Help me find a business — I'm looking for"
4. SBA loan check → "Can this deal get SBA financing? I'm looking at a"

Popup drops DOWN from hero card, drops UP from dock.

### Journey Context Injection

No URL routes to detect — context comes from which journey card was clicked:
- Clicked **Sell** card → dock placeholder: "Tell Yulia about your business…"
- Clicked **Buy** card → dock placeholder: "Tell Yulia what you're looking for…"
- Clicked **Agency** card → dock placeholder: "Tell Yulia what you need built…"
- Clicked **Intelligence** card → dock placeholder: "Ask about any industry or market…"
- **No card clicked** (typed directly from landing) → detect intent from message

### Deal-Size Cards → Instant Chat

Each journey has clickable deal-size example cards (e.g., "$350K Cleaning Service", "$1.8M Pest Control"). Clicking one pre-fills the dock input with a specific message and sends it, transitioning directly to chat.

### Anonymous Session Flow

```
Visitor on landing/journey → types in dock → hits send
        │
        ▼
Page morphs to chat state
Anonymous session created (UUID in localStorage + server DB)
POST /api/chat/anonymous creates session
        │
        ▼
3-5 message conversation (FREE — building trust + data):
Yulia classifies business, estimates league, gives preliminary
SDE range, mentions industry-specific add-backs, asks smart follow-ups
        │
        ▼
Inline signup card appears IN the chat (not a modal, not a redirect):
- Renders as a message in the conversation flow
- Fields: email + password, OR Google SSO button
- On success: POST /api/chat/anonymous/:sessionId/convert
  → links anonymous messages to new user account
  → returns conversation_id
        │
        ▼
Post-auth morph (future):
- Chat continues seamlessly
- Conversation history sidebar could appear
- All previous messages preserved
        │
        ▼
Paywall at S2: "Your full valuation report is $50."
User has already invested 20+ minutes and seen real value. They pay.
```

### Rate Limits
- Max 10 messages per anonymous session
- Max 3 anonymous sessions per IP per day
- Anonymous Yulia responses capped at ~300 tokens
- Session expires after 7 days if no account created

### 4 Journeys (Rendered Dynamically, NOT Separate Pages)

| Journey Key | Label | Headline | Old Route |
|-------------|-------|----------|-----------|
| sell | SELL-SIDE | Know what you're worth. *Exactly.* | was /sell |
| buy | BUY-SIDE | Find the deal. *Know the math.* | was /buy |
| agency | AGENCY & AUTOMATION | She does *the work.* | was /raise |
| intelligence | AI INTELLIGENCE | Intelligence no one *else has.* | was /integrate |

Each journey contains: label tag, h1 with em accent, subtitle, Yulia insight box (gradient bg), phased sections with cards, deal-size example cards (clickable), and a quote block. All content is in the prototype's JavaScript `J` object.

---

## 6. Yulia — A Fully Agentic M&A Advisor

### What "Fully Agentic" Means

Yulia is NOT a chatbot that waits for questions. She is an advisor who drives the process:

- **She tells users what to do next** — at every step, she provides direction
- **She proactively identifies value** — finds add-backs the seller didn't know about, flags risks the buyer didn't consider, identifies optimization opportunities
- **She generates deliverables without being asked** when the gate calls for them
- **She adjusts complexity by league** — L1 gets hand-holding and explanation; L5 gets speed, analytical depth, and institutional vocabulary
- **She handles the entire process** — from intake through closing, she manages every step a human advisor would

### League Personas

| League | Persona | Behavior |
|--------|---------|----------|
| L1 Main Street | Coach | Warm, educational. Explains every concept. "Let me walk you through what SDE means..." |
| L2 Lower Middle | Guide | Knowledgeable peer. Assumes basic literacy. "Your SDE suggests a 3.2-3.8× multiple range." |
| L3 Middle Market | Analyst | Professional, data-forward. Uses EBITDA, discusses comps, references market dynamics. |
| L4 Upper Middle | Associate | Institutional tone. Focuses on time savings. "I've modeled three scenarios..." |
| L5 Large Cap | Partner | Executive-level. Brief, decisive. Focuses on strategy and portfolio implications. |
| L6 Mega Cap | Macro | Board-room tone. Cross-border, regulatory, macroeconomic framing. |

### Yulia's First Response — The Hook

When a user types anything about their business, Yulia's FIRST response must:
1. **Classify the business** — identify industry, NAICS code, vertical
2. **Estimate the league** — based on any revenue/SDE/EBITDA clues
3. **Give a specific number** — preliminary SDE estimate, typical multiple range, or market size
4. **Mention industry-specific insights** — 2-3 common add-backs, key value drivers, or market dynamics for THAT industry
5. **Ask the first smart follow-up** — not generic ("tell me more") but specific ("What percentage of your revenue comes from recurring service contracts vs. one-time installations?")

The user should think: "Holy shit, she already knows my industry."

### Proactive Value Creation

**For sellers:** Yulia identifies EBITDA improvement opportunities. "Your owner compensation is $180K but market rate for a GM in this role is $85K. That's a $95K add-back that increases your SDE by 15% and could add $285K to your valuation."

**For buyers:** Yulia analyzes targets against thesis criteria. "This target's revenue concentration is 40% in one client — that's a red flag for your thesis. But their recurring revenue mix at 65% is above your 50% threshold. I'd recommend a 10-15% valuation discount for concentration risk."

**For experts (L4-L6):** Yulia focuses on speed and analytical depth. "I've modeled your acquisition at three entry multiples with sensitivity analysis on revenue growth and margin expansion. The base case shows 22% IRR with 3.2× MOIC at a 5-year exit."

---

## 7. Pricing Model

### Philosophy
- Price like a restaurant, not a utility (fixed menu prices, no meters)
- Value before money (preview deliverable, THEN show price)
- Anchor to human labor, not AI cost (10% of what a human charges)
- Intelligence is continuous, monetization is intermittent

### Access Model: Pure Wallet + Menu — No Subscriptions at ANY League
- Platform access: **FREE** (all leagues)
- Yulia conversation: **Unlimited** (fair-use)
- Free deliverables: Intake, classification, financial spread, add-back analysis
- All other deliverables: Menu-priced, wallet-deducted
- **$1 = $1** (no conversion math, no credits, no tokens)

### Six Leagues

| League | Name | Deal Size | Metric | Multiplier |
|--------|------|-----------|--------|------------|
| L1 | Main Street | <$1M SDE | SDE | 1.0× |
| L2 | Lower Middle Market | $1M–$5M SDE | SDE | 1.25× |
| L3 | Middle Market | $5M–$25M EBITDA | EBITDA | 2.0× |
| L4 | Upper Middle Market | $25M–$100M EBITDA | EBITDA | 3.0–4.0× |
| L5 | Large Cap | $100M–$1B EBITDA | EBITDA | 5.0–8.0× |
| L6 | Mega Cap | $1B+ EBITDA | EBITDA | Custom |

### Wallet Blocks

| Block | Amount | Discount | Target |
|-------|--------|----------|--------|
| Try It | $50 | 0% | L1 |
| Starter | $100 | 0% | L1 |
| Standard | $250 | 0% | L1-L2 |
| Deal Block | $500 | 0% | L1-L2 |
| Power Block | $1,000 | 5% | L2 |
| Fund Block | $2,500 | 10% | L3 |
| Institutional | $5,000 | 15% | L3-L4 |
| Enterprise | $10,000 | 20% | L4-L5 |
| Portfolio | $25,000 | 25% | L5 |
| Strategic | $50,000 | 30% | L5-L6 |

### User-Facing Language Rules
- Do NOT say "credits" or "tokens" — say "pay per deliverable"
- Show deliverable with its price, not credit balance
- Frame as: "Buy what you need. No subscriptions. No commitments."
- Wallet mechanics stay backend — user sees dollar prices on deliverables

---

## 8. Four Journeys × Six Gates Each

### Front-End Journey → Backend Gate Mapping

The v12 prototype renamed the user-facing journeys. Backend gate names stay the same:

| Front-End Journey Card | Backend Gate System | User Sees |
|----------------------|--------------------|-|
| **Sell my business** | SELL (S0→S5) | SELL-SIDE |
| **Buy a business** | BUY (B0→B5) | BUY-SIDE |
| **Agency & automation** | RAISE (R0→R5) + PMI (PMI0→PMI3) | AGENCY & AUTOMATION |
| **AI intelligence** | Intelligence deliverables (cross-journey) | AI INTELLIGENCE |

The "Agency & automation" journey encompasses what a human advisor DOES — CIM generation, valuation, SBA analysis, deal screening, DD management, PMI. It maps to deliverables across all gate systems.

The "AI intelligence" journey showcases the data foundation — Census, BLS, BEA, FRED, IRS, SEC EDGAR — and intelligence products. It maps to intelligence deliverables (Market Reports, Fragmentation Heat Maps, etc.).

### SELL Journey (S0 → S5)

| Gate | Name | Free? | Key Deliverables |
|------|------|-------|-----------------|
| S0 | Intake & Classification | ✓ Free | Business basics, league estimate |
| S1 | Financial Spread | ✓ Free | Financial extraction, add-back analysis, EBITDA optimization |
| S2 | Valuation & Reality Check | PAYWALL | Business Valuation ($350), Full Suite ($500), Reality Check ($150) |
| S3 | Packaging | Paid | CIM ($700), Living CIM ($900), Blind Teaser ($175) |
| S4 | Market Matching | Paid | Buyer Matching ($200), Outreach ($100), LOI Review ($100) |
| S5 | Closing | Paid | DD Prep ($200), Working Capital ($200), Closing Pack ($150) |

### BUY Journey (B0 → B5)

| Gate | Name | Free? | Key Deliverables |
|------|------|-------|-----------------|
| B0 | Thesis & Intake | ✓ Free | Buy box definition, league classification |
| B1 | Deal Sourcing | Mixed | Sourcing Sprint ($60), Target Fit Scoring (Free) |
| B2 | Valuation & Offer | PAYWALL | Target Valuation ($350), Financial Model ($275), LOI ($70) |
| B3 | Due Diligence | Paid | DD Package ($200), QoE Lite ($500), QoE Standard ($1,000) |
| B4 | Structuring | Paid | Working Capital ($200), Negotiation Strategy ($300) |
| B5 | Closing | Paid | Closing Funds Flow ($150), Closing Pack ($150) |

### RAISE Journey (R0 → R5)

| Gate | Name | Free? | Key Deliverables |
|------|------|-------|-----------------|
| R0 | Readiness Intake | ✓ Free | Capital needs assessment |
| R1 | Financial Package | Paid | Readiness Assessment ($150), Financial Package ($500) |
| R2 | Investor Materials | PAYWALL | Pitch Deck ($500), Teaser ($175) |
| R3 | Investor Outreach | Paid | Investor Matching ($200) |
| R4 | Term Sheet | Paid | Term Sheet Analysis ($200), Negotiation Strategy ($300) |
| R5 | Closing | Paid | Raise DD Package ($300) |

### PMI Journey (PMI0 → PMI3)

| Gate | Name | Key Deliverables |
|------|------|-----------------|
| PMI0 | Day Zero | Day 1 Checklist (Free), 100-Day Plan ($750) |
| PMI1 | Stabilization | Synergy Tracking Setup ($300) |
| PMI2 | Assessment | 90-Day Performance Check ($200), Acquisition vs. Model ($200) |
| PMI3 | Optimization | Value Creation Roadmap ($500) |

All prices are L1 baseline. League multiplier applies. Total platform deliverables: ~91 items across deal + intelligence categories.

---

## 9. Build Phases — PHASED INTELLIGENCE ARCHITECTURE

### KEY PRINCIPLE: Architect for intelligence now, activate features progressively.

Every phase includes schema foundations for intelligence so features populate existing structures instead of requiring retrofit.

---

### Phase A: Chat Morph + Anonymous Sessions (NOW)
**Goal**: User types in dock from any state → Yulia responds → seamless morph to chat
**Effort**: ~12 hours

**Single-Page App Shell:**
- [ ] App container with three states: Landing, Journey, Chat
- [ ] Topbar: logo (centered in chat-mode), back button (hidden by default), login icon, "Yulia" subtitle in chat-mode
- [ ] Scroll area: renders Landing OR Journey OR Messages based on state
- [ ] Dock: fixed bottom, always visible, plus-button + textarea + send-button
- [ ] Tools popup: 4 items (Upload financials, Business valuation, Search, SBA check) — drops down from hero card, up from dock
- [ ] State transitions with fade animations (landing.out, journey→chat, enterChatDirect)

**Landing State:**
- [ ] H1: "Sell a business. Buy a business. Raise capital."
- [ ] Subtitle: "Meet Yulia, your expert M&A advisor."
- [ ] 4 action cards: Sell, Buy, Agency & automation, AI intelligence (2×2 mobile, 4×1 desktop)
- [ ] Cards clickable → triggers transition to Journey state

**Journey States (sell, buy, agency, intelligence):**
- [ ] Dynamic content from journey data object (label, h1, sub, insight, sections, deals, quote)
- [ ] Yulia insight box with gradient bg and avatar
- [ ] Phased sections with cards
- [ ] Deal-size example cards → clickable → pre-fills dock and sends → transitions to Chat
- [ ] Quote block at bottom, dock placeholder changes per journey

**Chat State:**
- [ ] Messages container (max-width 640px centered)
- [ ] User message: terra bg, white text, right-aligned, border-radius 20px 20px 6px 20px
- [ ] Yulia message: white bg, shadow-card, left-aligned, avatar + text bubble
- [ ] Typing indicator: 3 animated dots
- [ ] Auto-scroll to bottom on new message

**Anonymous Session API:**
- [ ] `POST /api/chat/anonymous` — create session (UUID), store in DB + client localStorage
- [ ] Messages stored server-side linked to session_id
- [ ] Send message to Yulia API, return SSE streaming response
- [ ] Rate limits: max 10 msgs/session, 3 sessions/IP/day, ~300 token cap, 7-day expiry
- [ ] `POST /api/chat/anonymous/:sessionId/convert` — link to user account after signup

**System Prompt + Journey Context:**
- [ ] Master system prompt from YULIA_PROMPTS_V2.md Section 1
- [ ] Journey context injected based on which card was clicked (sell/buy/agency/intelligence)
- [ ] If no card clicked (typed from landing), detect intent from message
- [ ] First response: classify business, estimate numbers, industry-specific insights, smart follow-up

**Verify**: Open app → see landing with 4 cards → click "Sell" → journey content appears → click "$1.8M Pest Control" deal card → chat activates → Yulia responds with industry-specific analysis → back button returns to landing. Also: type directly in dock from landing → chat activates. Works on mobile Safari.

---

### Phase B: Agentic Gate System + Account Conversion
**Goal**: Yulia drives users through gates; anonymous → authenticated transition
**Effort**: ~16 hours

- [ ] Gate registry: 22 gates across 4 journeys (S0-S5, B0-B5, R0-R5, PMI0-PMI3)
- [ ] Gate-specific system prompts (from YULIA_PROMPTS_V2.md Sections 4-7)
- [ ] Gate readiness checks — auto-advance when conditions met
- [ ] Deal record creation on first journey message
- [ ] Inline account creation: after 3-5 valuable exchanges, Yulia prompts signup
- [ ] Anonymous → authenticated session migration (preserve all conversation + deal data)
- [ ] Sidebar updates as gates advance (progressive disclosure)
- [ ] Gate S0 full agentic intake (conversational, not a form)
- [ ] Gate S1 financial spread (document upload + extraction + add-back identification)
- [ ] Yulia announces gate transitions: "Great — I have your financials. Let's value this business."

**Verify**: Full S0 intake conversation → gate advances to S1 → financial questions → gate advances to S2 → paywall appears. Deal record has all fields populated.

---

### Phase C: Wallet + Stripe + Paywall
**Goal**: Users can pay for deliverables through the wallet
**Effort**: ~16 hours

- [ ] Wallet service: getOrCreateWallet, addCredits, deductCredits, getBalance, getTransactionHistory
- [ ] Stripe Checkout integration (one-time charges, NOT subscriptions)
- [ ] 10 wallet blocks with bonus credits (see Section 6)
- [ ] Webhook: payment_intent.succeeded → addCredits
- [ ] Paywall at S2/B2/R2: Yulia explains deliverable + price → user accepts → wallet deducted
- [ ] Insufficient funds flow: show wallet top-up options inline in chat
- [ ] Menu catalog service: all deliverables seeded by journey + gate with base prices
- [ ] League multiplier applied: menu_price × league_multiplier = user_price
- [ ] Refund logic (unused credits within 30 days)
- [ ] Credit expiration (12 months) and rollover (one extension for blocks ≥$500)
- [ ] All amounts stored in cents (integers). Displayed as dollars.

**Verify**: User reaches S2 → Yulia offers valuation at $50 → user tops up wallet → purchase → wallet deducted → deliverable status: 'generating'.

---

### Phase D: Deliverable Generation Pipeline
**Goal**: AI generates institutional-grade deliverables
**Effort**: ~16 hours

- [ ] Model routing: Haiku (classification) → Sonnet (analysis) → Opus (premium docs)
- [ ] Generation flow: purchase → status 'generating' → AI builds content → preview → complete
- [ ] Preview generation (enough to show value before purchase)
- [ ] Full content generation after purchase
- [ ] Prompt caching for system prompts (~50K tokens, saves 90% on input costs)
- [ ] Batch API for non-urgent generation (50% discount)
- [ ] Export to PDF (CIMs, valuations, LOIs) and XLSX (financial models)
- [ ] Deliverable stored in deal data room
- [ ] Yulia announces completion: "Your valuation report is ready. Here's what I found..."
- [ ] Complexity preflight (Wagyu Rule): flag multi-entity, international, unusual structures

**Verify**: User purchases valuation → 30-60 seconds → full report generated → PDF download available → Yulia summarizes key findings in chat.

---

### Phase E: Polish + Testing → LAUNCH
**Goal**: Production-ready for first users
**Effort**: ~12 hours

- [ ] E2E test: anonymous chat → account creation → free gates → paywall → top up → purchase → deliverable
- [ ] E2E test: BUY journey start → thesis → sourcing → valuation
- [ ] Stripe live mode keys + webhook verification
- [ ] iOS Safari + desktop Chrome/Safari testing
- [ ] Error states: insufficient funds, generation failure, network error
- [ ] Remove ALL "subscription" or "tier" language
- [ ] Rate limiting on AI endpoints
- [ ] Fair-use limits on Yulia conversation
- [ ] Database backup strategy
- [ ] Error monitoring (Sentry or equivalent)

### 🚀 LAUNCH — Transaction Engine Live

---

### Phase F: Value Builder for Sellers (Week 2-3 Post-Launch)
**Goal**: Extend seller engagement pre-sale through optimization intelligence
**Effort**: ~12 hours | **Revenue Impact**: +30-60% seller LTV

Highest-ROI post-launch feature. Every seller who completed valuation but isn't ready to sell is a candidate.

- [ ] Activate Value Builder deliverables: Value Optimization Plan ($200), Valuation Driver Scorecard ($75), Quarterly Re-Score ($45), Concentration Reduction Plan ($150), Recurring Revenue Blueprint ($150), Process Documentation Audit ($100), Owner Dependency Reduction ($150), Financial Cleanup Guide ($100)
- [ ] Value Tracker service: baseline valuation → current estimate → optimization levers → progress
- [ ] Yulia post-valuation prompt: "Your value is $X. But there's $Y in unrealized value. Want an optimization plan?"
- [ ] Quarterly check-in flow: follow-up nudge → financial upload → re-score → updated estimate
- [ ] Basic follow-up engine: 90-day nudges for optimization, 30-day nudges for CIM purchase

---

### Phase G: Market Watch + Intelligence Data Pipeline (Month 2)
**Goal**: Always-on deal scanning + government data intelligence engine
**Effort**: ~24 hours | **Revenue Impact**: +$100-$400/month per active buyer

This is where the platform becomes an intelligence engine. See Section 11 for the complete data architecture.

**Infrastructure — Wake-Run-Sleep Agent Architecture:**
- [ ] Deploy **Worker service** on Railway (separate from Web service, same repo, different start command)
- [ ] Install **pg-boss** as PostgreSQL-native job queue (no Redis needed yet)
- [ ] pg-boss cron scheduling for nightly data refresh (`0 2 * * *`)
- [ ] pg-boss event-driven triggers: new deal added, data source updated, threshold crossed
- [ ] **LangGraph.js** agent framework with PostgreSQL checkpointer (`@langchain/langgraph-checkpoint-postgres`)
- [ ] Agent state persistence: each user gets unique thread IDs, state loads/saves automatically between runs
- [ ] LangGraph Store for cross-thread knowledge (e.g., market intelligence shared between deal sourcing + valuation agents)

**Agent Pattern — NOT always-on:**
Agents "wake" on schedule or event, execute their task, persist state to PostgreSQL, then "sleep." A shared worker pool of 3-5 concurrent workers processes all user jobs. The agent accumulates knowledge over weeks via persisted state, but the process only runs for minutes per day.

**Engagement-Based Tiering (allocate AI resources by activity):**
- [ ] Engagement scoring: last login (30%), active deals (25%), recent actions (20%), deal updates (15%), profile completeness (10%)
- [ ] Scan frequency by tier: Dormant=manual only ($0), Low=weekly ($0.05), Medium=2×/week ($0.20), High=daily ($0.50), Power=multi-daily ($1.50)
- [ ] Nightly recalculation of engagement scores → adjust next_scan_due per user
- [ ] Per-user token budgets in `usage_tracking` table to prevent runaway costs
- [ ] Jitter on scan scheduling (hash user ID across 2-hour window) to prevent thundering herd

**Shared Intelligence Layer (50-80% API cost reduction):**
- [ ] Sector-level market analysis runs ONCE per sector per week, cached, distributed to all users in that sector
- [ ] With 500 users across 20 sectors → 20 market scans instead of 500
- [ ] Shared results stored in `agent_knowledge` with `knowledge_type = 'sector_analysis'`

**Data Source Integrations:**
- [ ] Census CBP API integration (establishment counts by NAICS + geography at ZIP level)
- [ ] BLS QCEW API integration (employment + wages by 6-digit NAICS, quarterly)
- [ ] FRED API integration (840,000+ time series: interest rates, SBA rates, CPI, unemployment)
- [ ] BEA API integration (GDP by county, regional price parities)
- [ ] Stale-while-revalidate caching layer with freshness indicators (in PostgreSQL, not Redis)

**Intelligence Features:**
- [ ] Basic Claude research agent: NAICS code + geography → synthesized market overview from real data
- [ ] Multi-thesis architecture: buyers define multiple buy boxes with criteria
- [ ] Market scanning engine: daily job scans for matches per thesis
- [ ] Alert pipeline: match → intelligence_alert → notification
- [ ] Intelligence deliverables: Target Quick Brief ($25), Deep Match Analysis ($75), Market Intelligence Report ($200)
- [ ] Free intelligence: basic match alerts, Weekly Market Pulse, Thesis Health Check
- [ ] Industry Health Index calculation (basic: demand + financial + macro components)

**Daily Briefing System (the killer delivery pattern):**
- [ ] Morning email digest: new deal matches, valuation changes, market trends, recommended actions
- [ ] Configurable delivery time per user timezone
- [ ] In-app "what's changed" panel: query `agent_change_log` where `created_at > user.last_login_at`, ordered by significance
- [ ] Progressive disclosure: email shows 3-5 bullet summaries → "View full analysis" links to app

**Verify**: Buyer defines thesis → daily scan → match alert email next morning → opens app → "what's changed" panel shows match → "Tell me more" ($25) → brief delivered → "Full analysis" ($75) → deep report with real Census/BLS data. Also: dormant users cost $0 in API; power users cost ~$1.50/month.

---

### Phase H: Active Deal Intelligence + Event Detection (Month 3)
**Goal**: Monitor live deals, detect market events, intervene proactively
**Effort**: ~16 hours | **Revenue Impact**: +$200-$500 per active deal

- [ ] Deal monitor service: gate duration, milestone progress, pacing, risk scoring
- [ ] Pacing alerts: "Your DD has been open 34 days — average is 21"
- [ ] GDELT integration: news monitoring by NAICS + geography (15-minute updates)
- [ ] Event detection pipeline: news → Haiku classification → scoring → alert
- [ ] Event Score = (Breadth × 0.2) + (Depth × 0.3) + (Certainty × 0.2) + (Recency × 0.15) + (Actionability × 0.15)
- [ ] Event-to-deal linkage: surface relevant events for active deals
- [ ] Deal intelligence deliverables: DD Acceleration ($150), Market Defense Brief ($100), Counter-Offer Analysis ($75), Multi-Offer Strategy ($200)
- [ ] Full follow-up engine: rules for all deliverables with time-based nudges

---

### Phase I: Full Intelligence + Deep Data (Month 4)
**Goal**: Complete the intelligence loop — deep data, public comps, portfolio analytics
**Effort**: ~16 hours

- [ ] SEC EDGAR Frames API: public company financial benchmarks by SIC/NAICS (median EBITDA margins, revenue multiples, growth rates)
- [ ] IRS Statistics of Income: private business benchmarks by entity type (the only public source for private company financials by industry)
- [ ] BizBuySell Insight Report data: actual SMB transaction multiples (2.0×–3.3× SDE across sectors)
- [ ] Industry-specific KPI templates (CPA, SaaS, HVAC, e-commerce, marketing agencies)
- [ ] Comparable transaction analysis powered by EDGAR + BizBuySell
- [ ] Full Industry Health Index (all 6 weighted components — see Section 10)
- [ ] pgvector semantic search across cached reports ("find similar markets")
- [ ] Seller Market Monitor: market briefs ($75), timing analysis ($150), comparable alerts
- [ ] Buyer Portfolio Intelligence (L3+): Portfolio Benchmark ($300), Cross-Deal Patterns ($200)
- [ ] Post-close intelligence: 90-Day Performance Check ($200), Earn-Out Tracker ($100/quarter)
- [ ] Journey Bridge Credits: SELL→BUY (10%), BUY→PMI ($100), repeat loyalty credits

---

### Phase J: Intelligence Flywheel + Research Engine (Month 6+)
**Goal**: Platform intelligence compounds with every deal
**Effort**: Ongoing

- [ ] Multi-agent research: Opus orchestrator + Sonnet workers in parallel (90% quality improvement over single-agent)
- [ ] Google Trends integration (demand signals by geography + industry)
- [ ] Financial Modeling Prep integration (structured public comps)
- [ ] Forward-looking risk scoring (AI disruption, tariff exposure, regulatory changes)
- [ ] "Market Pulse" dashboard: composite Industry Health Index, sparklines, traffic-light indicators
- [ ] Cross-report semantic search and "similar markets" recommendations
- [ ] Transaction data collection: anonymized pipeline (industry, geography, multiple, structure, time-to-close)
- [ ] Flywheel products: Transaction Benchmark ($100), Industry Multiple Tracker, Buyer Demand Index, Time-to-Close Predictor, DD Risk Predictor, Optimal Pricing Recommendation
- [ ] Anonymized Deal Data Export ($500-$2,000/quarter) for institutional clients

---

## 10. Phase Summary & Timeline

| Phase | Name | When | Effort | What Ships |
|-------|------|------|--------|------------|
| A | Chat Morph + Anonymous | NOW | ~12 hrs | User types on any page → Yulia responds → seamless morph |
| B | Gates + Account Conversion | Week 1-2 | ~16 hrs | 22 gates, agentic intake, anonymous→auth migration |
| C | Wallet + Stripe + Paywall | Week 2-3 | ~16 hrs | Payment system, menu pricing, paywall at S2/B2/R2 |
| D | Deliverable Generation | Week 3-4 | ~16 hrs | AI-generated valuations, CIMs, financial models, PDF/XLSX |
| E | Polish + Testing | Week 4-5 | ~12 hrs | E2E testing, error handling, Stripe live mode |
| — | **🚀 LAUNCH** | **Week 5** | — | **Transaction engine live** |
| F | Value Builder | Week 6-7 | ~12 hrs | Seller optimization, value tracking, follow-up engine |
| G | Market Watch + Data Pipeline | Month 2 | ~24 hrs | pg-boss worker, LangGraph.js agents, gov data APIs, engagement tiering, daily briefings |
| H | Deal Intel + Events | Month 3 | ~16 hrs | Deal pacing, GDELT news monitoring, event scoring |
| I | Full Intelligence + Deep Data | Month 4 | ~16 hrs | SEC EDGAR, IRS SOI, BizBuySell, pgvector, portfolio analytics |
| J | Flywheel + Research Engine | Month 6+ | Ongoing | Multi-agent research, data products, predictive intelligence |

**Total to launch**: ~72 hours (~5 weeks)
**Total to full intelligence platform**: ~140 hours (~6 months post-launch)

---

## 11. Intelligence Engine Blueprint — Building a $20K Platform for $225/month

### The Core Insight

The data you need already exists for free. The U.S. government publishes establishment counts, employment, wages, and financial benchmarks by 6-digit NAICS code down to the ZIP code level — the exact data that PitchBook and IBISWorld charge $20K+/year to repackage. By combining Census Bureau, BLS, FRED, and SEC EDGAR APIs with Claude's agentic research capabilities and a smart caching layer, SMBX delivers IBISWorld-quality industry intelligence for $70–225/month in total infrastructure costs.

### The Universal Taxonomy

NAICS codes are the foundation. Every government data source uses them, enabling joins across Census, BLS, BEA, and IRS data at up to 6-digit industry granularity. Geography uses Census FIPS codes (state → county → MSA → ZIP), creating a two-dimensional matrix of **industry × location** that answers any query.

### Tier 1 Sources — Free, Highest Impact, Build First

**Census County Business Patterns (CBP):** Establishment counts, employment, and payroll by NAICS at ZIP code and county level, including business size classes (5–9 employees vs. 50–99). Answers "how many plumbing companies with 10–50 employees exist in Dallas County?" directly. REST API with free key; annual with ~2-year lag.

**BLS Quarterly Census of Employment and Wages (QCEW):** County-level employment, wages, and establishment counts by 6-digit NAICS, updated quarterly with ~6-month lag. No API key required. Most granular publicly available source for local business density.

**Bureau of Economic Analysis (BEA):** GDP by county and metro area with industry detail, personal income by county, Regional Price Parities for cost-of-living adjustments. Free REST API. GDP by county is the most direct measure of local economic health.

**FRED (Federal Reserve Economic Data):** 840,000+ time series including interest rates, SBA lending rates, CPI, unemployment, consumer confidence. Free REST API, 120 requests/minute. Essential for the macro layer: discount rates, financing environment, timing signals.

**SEC EDGAR:** All public company filings with XBRL-structured financial data. Frames API aggregates financial metrics across all filers by SIC code — compute median EBITDA margins, revenue multiples, growth rates by industry. Bulk download of `companyfacts.zip` (~3GB). Rate limit: 10 req/sec, no key.

**IRS Statistics of Income:** Only publicly available aggregate financial data for private businesses by industry — average receipts, deductions, net income by entity type. Annual with 2–3 year lag. Essential because most SMBs are private.

### Tier 2 Sources — Free/Low-Cost, High Impact

**GDELT:** Global news in 152 languages with sentiment analysis, entity recognition, geographic tagging, updated every 15 minutes. Free, no API key. Powers the real-time intelligence layer.

**Google Trends:** Official API (launched July 2025) tracks search interest by geography and topic — demand signals.

**Financial Modeling Prep:** Clean structured public company financials via REST API (250 free requests/day).

**BizBuySell Insight Reports:** Actual SMB transaction multiples quarterly for free — closest proxy to real deal pricing for Main Street businesses.

### Tier 3 — Worth Paying For

RMA Annual Statement Studies (~$300/year), Financial Modeling Prep Starter ($99/month), NewsAPI.ai ($149/month). Total: ~$250/month for professional-grade data.

### Data Pipeline Architecture

**Phase 1 (0-500 users):** pg-boss (PostgreSQL-native job queue) orchestrates data collection with a wake-run-sleep agent pattern via LangGraph.js:

```
User creates buy box → Express API → pg-boss job enqueued
  Worker picks up job → LangGraph.js agent wakes (loads persisted state from PostgreSQL)
  ├── Step: fetch Census CBP data (NAICS + geography)
  ├── Step: fetch BLS QCEW data (employment + wages)
  ├── Step: fetch BEA GDP data (local economy)
  ├── Step: fetch FRED indicators (rates, macro)
  ├── Step: Claude research (recent news + trends via Batch API)
  └── Step: Claude synthesis → generate report → store in PostgreSQL
  Agent state checkpointed → agent "sleeps" until next trigger
```

**Phase 2 (500+ users):** Migrate to BullMQ + Redis for higher throughput, per-user round-robin processing, and FlowProducer parallel child jobs.

### Tiered Caching Strategy

All caching in PostgreSQL via `data_source_cache` table (no Redis needed at this scale):

| Source Type | Cache Duration | Example |
|-------------|---------------|---------|
| NAICS definitions | 365 days | Industry classification codes |
| Census business counts | 90 days | Establishment counts by ZIP |
| BLS employment data | 30 days | Monthly employment updates |
| FRED economic indicators | 24 hours | Interest rates, CPI |
| Industry news | 1–4 hours | GDELT, news feeds |
| Generated research reports | 7–30 days | Depends on constituent data freshness |

PostgreSQL implements **stale-while-revalidate**: serve cached data immediately, pg-boss enqueues background refresh job, show freshness indicator to user.

### The Seven Layers of Intelligence

When a buyer creates a buy box, the system delivers across seven dimensions:

1. **Industry Structure & Attractiveness** — Porter's Five Forces applied to the specific sector. Census CBP quantifies competitive landscape; BLS tracks employment trends.

2. **Market Sizing & Competitive Density** — How many businesses in this NAICS exist in this geography? Total employment and payroll? Census CBP at ZIP granularity.

3. **Valuation Multiples in Context** — BizBuySell: Main Street 2.0×–3.3× SDE. Adjusted for owner dependency, client concentration, recurring revenue, growth trajectory.

4. **Industry-Specific KPIs** — CPA: revenue per partner, client retention, Rule of Thirds. SaaS: Rule of 40, NRR, churn, LTV/CAC. HVAC: job backlog, technician retention, service contracts. E-commerce: gross margins, channel concentration, CAC trends.

5. **Localized Economic Context** — BEA GDP by county, BLS unemployment, Regional Price Parities. Urban vs. rural buyer pool density (15–25% valuation discount for thin rural markets).

6. **Macro Timing Signals** — SBA rates (10.5–15.5%), Fed funds, Baby Boomer Silver Tsunami supply acceleration, PE dry powder ($1.6T+).

7. **Forward-Looking Risk & Opportunity** — AI disruption risk by sector, tariff exposure, regulatory changes, estate tax shifts. 3–5 most material current events per industry-geography.

### Composite Industry Health Index

Each industry-geography gets a 0–100 score:

| Component | Weight | Data Sources |
|-----------|--------|-------------|
| Demand signals | 25% | Google Trends, BLS employment growth, news sentiment |
| Regulatory environment | 15% | GDELT policy tracking, sector-specific regulation |
| Technology disruption risk | 15% | AI impact by sector, patent activity |
| Financial/lending environment | 20% | FRED rates, SBA lending, PE activity |
| Labor market conditions | 10% | BLS QCEW wages, unemployment |
| Macroeconomic factors | 15% | BEA GDP, CPI, consumer confidence |

Events scoring 8–10: immediate push notifications. 5–7: daily digests. 1–4: weekly summaries. Each tagged with buyer sentiment and seller sentiment (same event often has opposite implications).

### Event Detection Scoring

**Event Score = (Breadth × 0.2) + (Depth × 0.3) + (Certainty × 0.2) + (Recency × 0.15) + (Actionability × 0.15)**

### Infrastructure Cost

| Component | Service | Monthly Cost |
|-----------|---------|-------------|
| Railway Pro plan (includes $20 credit) | Railway | $20 |
| Web service (~0.5 vCPU, 512MB) | Railway | ~$15 |
| Worker service (~0.25 vCPU, 512MB) | Railway | ~$10 |
| PostgreSQL (~0.25 vCPU, 512MB, 2GB) | Railway | ~$10 |
| **Infrastructure subtotal** | | **~$55** |
| Claude API (fully optimized) | Haiku/Sonnet + caching + batch | $65–170 |
| Domain + CDN | Cloudflare | $1 |
| Tier 3 data (optional) | RMA + FMP + NewsAPI | $0–250 |
| **Total** | | **$120–225/month** |

**Note:** No Redis needed at Phase 1. pg-boss runs in existing PostgreSQL. Redis + BullMQ ($5-10/month) added only at 500+ users.

**Scaling path:**
- Phase 1 (0-500 users): pg-boss + PostgreSQL, $55 infra + $170 API = $225/month
- Phase 2 (500-2K users): Add Redis + BullMQ, $65 infra, revenue funds API growth
- Phase 3 (2K+ users): BullMQ Pro ($95/month), read replicas, multiple workers
- Phase 4 (enterprise): Temporal.io, multi-region, dedicated infra

### Competitive Positioning

| Capability | BizBuySell | Acquire.com | Axial | PitchBook | SMBX |
|------------|-----------|-------------|-------|-----------|------|
| AI-synthesized industry reports | ❌ | ❌ | ❌ | ❌ | ✅ |
| Localized market intelligence | Basic | ❌ | ❌ | ❌ | ✅ Deep |
| Real-time event alerts by sector | ❌ | ❌ | ❌ | Partial | ✅ |
| Forward-looking risk signals | ❌ | ❌ | Partial | Partial | ✅ |
| Affordable (<$100/month) | ✅ Free | ✅ Free | ❌ | ❌ | ✅ |
| Integrated with deal flow | ✅ | ✅ | ✅ | ❌ | ✅ |

Emerging competitors: DealPotential (funding intent prediction, 7M+ companies), Grata (AI deal sourcing, middle market), Clearly Acquired (AI SMB marketplace, 3.2M businesses), BizScout (partnered with Transworld). None combine AI-generated market intelligence with localized data and real-time event detection at SMB scale.

---

## 12. Database Schema (Build ALL Tables at Phase A)

### Core Tables
- users, conversations, messages, deals, wallets, wallet_transactions, wallet_blocks, menu_items, deal_packages, deliverables, gate_progress, anonymous_sessions

### Intelligence Foundation Tables (build now, populate Phase F+)
- theses, intelligence_alerts, follow_up_rules, follow_up_queue, value_trackers, deal_monitors, journey_bridges

### Intelligence Engine Data Tables (build now, populate Phase G+)
- industries (NAICS code, name, sector, health_index)
- market_data_points (naics_code, geography_fips, metric, value, source, period, cache timing)
- research_reports (naics_code, geography_fips, type, content, embedding vector, freshness)
- industry_events (naics_codes, geography, event_score, buyer/seller sentiment, source)
- data_source_cache (source, endpoint, params_hash, response, cache timing, stale flag)

### Agent State Tables (build Phase G, used by LangGraph.js + pg-boss)
- **user_agents** (user_id, agent_type, schedule_cron, config JSONB, is_active, engagement_score, next_scan_due)
- **agent_runs** (user_id, agent_type, trigger_type [scheduled|event|on_demand], status, input_context JSONB, output_summary JSONB, tokens_used, cost_cents, started_at, completed_at)
- **agent_knowledge** (user_id, knowledge_type, knowledge_key, content JSONB, confidence, created_at, updated_at) — upsert pattern, accumulates over time
- **agent_change_log** (user_id, change_type, entity_type, entity_id, old_value JSONB, new_value JSONB, significance_score, created_at) — powers "what's changed" briefings
- **usage_tracking** (user_id, period, tokens_input, tokens_output, cost_cents, scan_count) — per-user token budgets
- LangGraph checkpointer tables auto-created by `@langchain/langgraph-checkpoint-postgres`

**Layered Memory Model:**
- Working memory → LangGraph graph state during single run (auto-persisted via checkpointer)
- Short-term memory → last 5 run summaries from `agent_runs` (loaded as context)
- Long-term memory → accumulated entries in `agent_knowledge` (optionally with pgvector embeddings)
- Procedural memory → user preferences + learned patterns in `user_agents.config` JSONB

---

## 13. Environment Variables

```
# Core
DATABASE_URL=postgresql://...
NODE_ENV=production
PORT=5000

# AI
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=...
OPENAI_API_KEY=sk-...

# Payments
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Intelligence Data Pipeline (Phase G+)
# pg-boss uses DATABASE_URL — no separate connection needed
# REDIS_URL=... (Phase 2+ only, when migrating to BullMQ at 500+ users)
CENSUS_API_KEY=... (free)
FRED_API_KEY=... (free)
BEA_API_KEY=... (free)
# BLS QCEW — no key required
# SEC EDGAR — no key required (10 req/sec, set User-Agent)
# GDELT — no key required
```

---

## 14. Unit Economics

| Metric | Transaction Only | With Intelligence |
|--------|-----------------|-------------------|
| Gross margin | 95%+ | 95%+ |
| L1 annual revenue per user | $500–$2,870 | $800–$4,070 |
| L3 annual revenue per user | $6,000–$50,000 | $6,800–$46,700 |
| Year 1 ARR target | $1.58M | $2.0M |
| Year 5 ARR target | $12.8M | $18.7M |
| Intelligence % of revenue | 0% | 30-60% at L1-L2, 15-30% at L3+ |
| Intelligence infrastructure | — | $120–225/month |

### Per-User Background AI Cost (with full optimization stack)

| Optimization Level | Cost/User/Month | Users at $170 API Budget |
|---|---|---|
| Standard API, Sonnet only | $2.45 | ~70 |
| Haiku tiering (80/20) | $0.98 | ~175 |
| + Batch API | $0.49 | ~350 |
| + Prompt caching + shared intelligence | **$0.20–0.31** | **~550–850** |

### Per-User Cost by Engagement Tier

| Tier | Scan Frequency | AI Cost/Month |
|---|---|---|
| Dormant (score 0-10) | Manual only | $0 |
| Low (11-30) | Weekly digest | ~$0.05 |
| Medium (31-60) | 2×/week | ~$0.20 |
| High (61-85) | Daily scans | ~$0.50 |
| Power (86-100) | Multi-daily + alerts | ~$1.50 |

Practical maximum at $225/month budget: **25-30 highly active users** (50 interactions/day) or **500+ lightly active users** (daily automated scans only).

At $2M Year 1 ARR, intelligence infrastructure costs 0.1% of revenue while delivering capabilities that compete with platforms charging $20,000+/year.

---

## 15. Key Decisions Log

| Decision | Rationale | Date |
|----------|-----------|------|
| Fresh rebuild | 181K lines, 30K monolith, cascading Replit issues | Feb 21, 2026 |
| Pure wallet, no subscriptions at any league | Per-output pricing is 2026 standard | Feb 17, 2026 |
| $1 = $1, no conversion math | Simplest mental model | Feb 17, 2026 |
| Chat-first homepage with anonymous sessions | Let users experience Yulia before signup | Feb 22, 2026 |
| Tailwind v3, not v4 | v4 breaks Railway (native binding) | Feb 19, 2026 |
| Raw postgres-js, not Drizzle | Drizzle breaks Railway | Feb 19, 2026 |
| JWT auth, not sessions | Sessions break Railway | Feb 19, 2026 |
| Free government data for intelligence | Replaces $20K+/year data subscriptions | Feb 21, 2026 |
| ~~BullMQ + Redis for data pipeline~~ | SUPERSEDED by pg-boss for Phase 1 (Feb 24). BullMQ deferred to 500+ users | Feb 21, 2026 |
| pgvector for semantic search | Similar reports, intelligent retrieval | Feb 21, 2026 |
| Fully agentic Yulia (drives process, not chatbot) | Users need an advisor, not a search box | Feb 20, 2026 |
| No deal size ceiling | $500M PE buyer is L5/L6, not "too big" | Feb 23, 2026 |
| v12 SPA prototype replaces v5 multi-page | Single page with Landing/Journey/Chat states, no route pages | Feb 24, 2026 |
| Inter font only (replaces Playfair+Instrument Sans) | Single font family, weights 400-800 | Feb 24, 2026 |
| Terra color updated to #D4714E | Was #DA7756 in v5 prototype | Feb 24, 2026 |
| Dock replaces hero chat input | Fixed bottom input always visible in every state | Feb 24, 2026 |
| Tools popup replaces suggested prompt pills | 4 pre-fill items: Upload, Valuation, Search, SBA | Feb 24, 2026 |
| 4 journeys: Sell, Buy, Agency, Intelligence | Agency replaces Raise, Intelligence replaces Integrate | Feb 24, 2026 |
| No nav links, no footer | Topbar has logo + login only; dock replaces footer | Feb 24, 2026 |
| Deal-size cards clickable → instant chat | Pre-fills input and sends, bypassing manual typing | Feb 24, 2026 |
| pg-boss replaces BullMQ+Redis for Phase 1 | PostgreSQL-native job queue, eliminates Redis, $0 vs $5-10/month | Feb 24, 2026 |
| LangGraph.js for agent framework | TypeScript-native, PostgreSQL checkpointer, production-ready state persistence | Feb 24, 2026 |
| Wake-run-sleep agent pattern (not always-on) | Agents wake on schedule/event, execute, persist state, sleep. Shared worker pool | Feb 24, 2026 |
| Engagement-based AI resource tiering | Dormant users cost $0, power users ~$1.50/month. Prevents runaway API costs | Feb 24, 2026 |
| Separate Railway worker service | Web + Worker + PostgreSQL as 3 Railway services. Worker processes pg-boss jobs | Feb 24, 2026 |
| Daily briefing as primary delivery | Morning email digest + in-app "what's changed" panel. Agent work is worthless unseen | Feb 24, 2026 |
| Shared intelligence layer | Sector analysis runs once/week, distributed to all users. 50-80% API cost reduction | Feb 24, 2026 |
| BullMQ+Redis deferred to 500+ users | pg-boss handles 0-500 users. Migrate only when throughput demands it | Feb 24, 2026 |

---

*BUILD_PLAN_v6 — February 24, 2026*
*The master document. Contains everything: roadmap, design system, tech stack, pricing, conversion architecture, Yulia's agentic spec, intelligence engine blueprint, competitive positioning, and unit economics.*
