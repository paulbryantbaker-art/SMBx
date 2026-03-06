# SMBX.ai — MASTER EXECUTION PLAYBOOK v8 (UPDATED)
## The CC Prompts That Actually Build the Platform
### Updated: March 2026 — Post Strategy Review

---

## WHAT CHANGED FROM THE PREVIOUS VERSION

The original Build Plan v8 (February 2026) correctly sequenced the chat, gates, wallet, and deliverables. What it got wrong was **deferring the platform intelligence flywheel to post-launch Sessions 14-15**. That's backwards. The flywheel — `company_profiles` auto-persistence, buyer thesis matching, and demand signals — IS the product moat. Buyers come for the AI. They stay for the intelligence. Sellers come for the analysis. They stay because real buyers are watching.

**Three structural changes in this update:**

1. **Sessions 3-5 get expanded** to wire the knowledge graph from day one. Every Yulia conversation auto-persists to `company_profiles`. Sellers see buyer demand signals at Gate S0. Buyers get a stored Thesis Document at Gate B0.

2. **Sessions 11-16 are completely reordered.** The old plan had Collaboration (RBAC) at Session 11 and the Intelligence Engine at Session 14. That's inverted. The new order: Knowledge Graph wiring → Seller OS (Value Readiness Report) → Buyer OS (Thesis + Internal Matching) → Off-Market Discovery → Sale-Readiness Scoring → Living Valuations.

3. **The sourcing architecture is now specified.** Session 14 has a concrete implementation plan: Google Places API (NOT SerpAPI), Apollo.io + Hunter.io + Whoxy for enrichment, BLS QCEW + Census SUSB + IRS SOI for free revenue estimation, pg-boss orchestration (already in the stack). Total cost: ~$237-431/month at startup scale. ~$0.29/business fully enriched.

---

## HOW TO USE THIS DOCUMENT

This is the **exact prompts you paste into Claude Code**, in order, to build the platform session by session.

**Rules:**
1. One session = one CC prompt. Don't combine them.
2. Start every CC session with `cd ~/Desktop/SMBx && claude`
3. Paste the prompt. Let CC run. Don't interrupt unless it asks.
4. When it finishes, run the verification steps.
5. If verification passes: commit, push, confirm Railway deploys clean.
6. If verification fails: tell CC what failed. Let it fix it.
7. Move to the next session.

**Auth is OFF for now.** All endpoints are open. You'll test as anonymous users. Auth gets added as a thin layer before go-live.

**Estimated total CC time:** ~60-80 hours across Sessions 1-10 (launch-ready)

---

## PRE-FLIGHT CHECKLIST

Before starting Session 1, make sure these files exist in the repo:

```
SMBx/
├── CLAUDE.md                    ← CC reads automatically
├── BUILD_PLAN_v8.md             ← This file (place in repo root)
├── METHODOLOGY_V17.md           ← Already in repo
├── YULIA_PROMPTS_V2.md          ← Already in repo
├── SMBX_DESIGN_SYSTEM.md        ← Already in repo
├── client/                      ← Built React app
├── server/                      ← Built Express backend
├── shared/                      ← Shared types
├── Dockerfile                   ← Railway deploy
├── railway.json                 ← Railway config
└── .env.example                 ← Env var template
```

**Critical env var needed for Session 1:**
```
ANTHROPIC_API_KEY=sk-ant-...   ← Must be set in Railway env vars
```

---

## SESSION 1: YULIA SPEAKS (AI Backend + Streaming)
**Estimated CC time:** 3-4 hours
**What ships:** User types a message → Yulia responds with streaming text

### The Prompt

```
Read CLAUDE.md first, then read this entire prompt before writing any code.

## CONTEXT
SMBX.ai is an M&A advisory platform. The public website pages are built (homepage, /sell, /buy, /raise, /integrate, /pricing, /how-it-works, /enterprise). The chat UI shell exists. Auth exists but we're SKIPPING auth for now — all endpoints should work without authentication.

The database has these tables already: users, conversations, messages, deals, anonymous_sessions, wallets, wallet_transactions, wallet_blocks, menu_items.

## WHAT TO BUILD
Wire up the Anthropic Claude API so Yulia actually responds to messages with SSE streaming. No auth required.

### Step 1: Install the Anthropic SDK
```bash
npm install @anthropic-ai/sdk
```

### Step 2: Create the chat API endpoint
Create or update `server/routes/chat.ts`:

**POST /api/chat/message**
- Accepts: `{ message: string, conversationId?: string, journeyContext?: string }`
- If no conversationId: create a new conversation in the DB, return the new ID
- Save the user message to the `messages` table
- Call Anthropic API with SSE streaming (claude-sonnet-4-20250514 model)
- Stream the response back to the client via SSE
- When streaming completes, save the full assistant message to the `messages` table
- Return format: SSE stream with `data: {"type":"text_delta","text":"..."}` chunks and `data: {"type":"message_stop"}` at end

**GET /api/chat/conversations**
- Returns all conversations, ordered by last message timestamp desc
- Each conversation includes: id, title, updatedAt, messageCount

**GET /api/chat/conversations/:id/messages**
- Returns all messages for a conversation, ordered by createdAt asc

**DELETE /api/chat/conversations/:id**
- Hard deletes a conversation

### Step 3: System prompt
Read YULIA_PROMPTS_V2.md Section 1 (Master System Prompt). Copy the full text as a string constant in `server/prompts/masterPrompt.ts`. Do NOT summarize or shorten it.

The system prompt for every API call:
```
{MASTER_SYSTEM_PROMPT}

CURRENT CONTEXT:
- Journey: {journeyContext || "not yet determined"}
- This is a new conversation. Detect the user's intent and route to the correct journey.
- If intent is clear, begin the appropriate Gate 0 intake immediately.
- If ambiguous, ask ONE clarifying question.
```

### Step 4: Wire the frontend
- On send: POST to /api/chat/message
- Open an EventSource to receive streaming response
- Render each text_delta chunk as it arrives
- When message_stop arrives, finalize the message in state
- On page load: GET /api/chat/conversations to populate sidebar
- On conversation click: GET /api/chat/conversations/:id/messages

### Step 5: No auth middleware on these routes

### Step 6: ANTHROPIC_API_KEY from process.env

## VERIFICATION
1. `npm run build` — zero errors
2. Type "I want to sell my pest control business" → Yulia streams a contextually relevant response
3. Send a second message → conversation continues
4. Refresh → conversation appears in sidebar
5. Click conversation → messages reload
6. Works on Railway (not just localhost)
7. Works on mobile
```

---

## SESSION 2: CHAT MORPH (Public Page → Chat Transition)
**Estimated CC time:** 4-5 hours
**What ships:** User types on any public page → page fades → full chat view appears

### The Prompt

```
Read CLAUDE.md first, then read this entire prompt before writing any code.

## CONTEXT
Session 1 is done — Yulia responds with SSE streaming. Conversations persist.

## WHAT TO BUILD
The "chat morph" — user types on any public page → smooth transition to full chat view.

### The UX Flow
1. User is on any public page (/, /sell, /buy, etc.)
2. They type in the chat input and hit send
3. Page content fades (opacity 0, 300ms ease)
4. Chat view fades in (opacity 1, 300ms ease, 100ms delay)
5. Message appears as user bubble (terra cotta, right-aligned)
6. Yulia's streaming response appears
7. Topbar morphs: nav links fade out → "Yulia" subtitle + back arrow appear
8. Back arrow returns to the page they came from

### State Machine — Do NOT use React Router navigation
```typescript
type AppPhase = 'landing' | 'chat';
```
The transition is a CSS animation, not a route change.

### Journey Context
Capture which page the user is on when they send their first message:
- `/` or `/sell` → journeyContext = "sell"
- `/buy` → journeyContext = "buy"
- `/raise` → journeyContext = "raise"
- `/integrate` → journeyContext = "integrate"
- `/pricing` or `/how-it-works` → journeyContext = "unknown"

Pass journeyContext to POST /api/chat/message. Inject into system prompt:
```
JOURNEY CONTEXT: User started on the "{journeyContext}" page.
- /sell: likely wants to sell
- /buy: likely wants to buy
- /raise: likely wants to raise capital
- /integrate: likely just acquired a business
Confirm their intent in your first response.
```

### ChatDock — ONE Shared Component
Create `client/src/components/ChatDock.tsx` — same component on public pages AND chat view.
- Auto-expanding textarea (min 1 row, max 5 rows)
- Send button (circular, terra cotta, appears when text entered)
- Placeholder changes by context

### iOS Keyboard Handling (CRITICAL)
- `useAppHeight` sets `--app-height` (visualViewport.height) + `--app-top` as CSS vars
- Containers use `position:fixed` + these vars
- ChatDock is `shrink-0` flex child — NEVER `position:fixed`
- NEVER use `h-dvh`/`100dvh` — dvh does NOT shrink for iOS keyboard
- NEVER use `overflow-hidden` on position:fixed chat containers

## VERIFICATION
1. Homepage → type message → page fades → chat view appears
2. Yulia responds with streaming text
3. Back arrow → returns to homepage
4. /buy → type → Yulia responds about buying (journey context works)
5. /sell → type → Yulia responds about selling
6. iPhone Safari — keyboard doesn't break layout
7. Works on Railway
```

---

## SESSION 3: CONVERSATION PERSISTENCE + DATABASE SCHEMA
**Estimated CC time:** 3-4 hours (expanded from original — adds knowledge graph schema)
**What ships:** Conversations persist, sidebar works, session restore, AND the full intelligence database schema is in place for Sessions 4+

### The Prompt

```
Read CLAUDE.md first, then read this entire prompt before writing any code.

## CONTEXT
Sessions 1-2 done: Yulia streams responses, chat morph works from all public pages.

## WHAT TO BUILD IN THIS SESSION

### Part A: Conversation Persistence (same as before)

**Anonymous Session Management**
- On first visit: generate UUID → store in localStorage as `smbx_session_id`
- Send with every API call (header: `X-Session-ID`)
- Create `anonymous_sessions` table record on first message

**Sidebar**
- Load all conversations for this session ID
- Group by date: Today / Yesterday / Last 7 Days / Older
- Show title (first user message, truncated 50 chars) + timestamp
- Click → load conversation messages
- "New Chat" button → fresh conversation, blank state
- Active conversation highlighted

**Session Restore on Refresh**
- Check localStorage for `smbx_session_id`
- If found → load most recent conversation → transition to chat phase
- Show previous messages, continue seamlessly

**Conversation Title Generation**
- Use first user message truncated to 50 chars
- After Yulia's first response, optionally use a Haiku call for a 3-5 word title

### Part B: Intelligence Database Schema (CRITICAL — do this in the SAME session)

Run these migrations. This schema enables the knowledge graph, buyer demand signals, and the sourcing engine — everything from Sessions 4 onward depends on it being in place.

```sql
-- Knowledge graph: every seller conversation auto-creates a company profile
CREATE TABLE IF NOT EXISTS company_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT,                          -- anonymous session that created it
  deal_id UUID REFERENCES deals(id),
  
  -- Identity
  name TEXT,
  website TEXT,
  naics_code TEXT,                          -- 6-digit NAICS
  industry_label TEXT,                      -- human-readable industry name
  
  -- Location
  city TEXT,
  state TEXT,
  metro TEXT,
  
  -- Financials (user-reported, from Yulia conversations)
  revenue_reported BIGINT,                  -- in cents
  sde_reported BIGINT,                      -- in cents
  ebitda_reported BIGINT,                   -- in cents
  employee_count INTEGER,
  years_in_operation INTEGER,
  
  -- Financials (AI-estimated, from enrichment pipeline)
  revenue_estimated_low BIGINT,
  revenue_estimated_high BIGINT,
  revenue_estimation_method TEXT,           -- 'user_reported' | 'employee_rpe' | 'reviews_proxy' | 'web_traffic'
  revenue_confidence NUMERIC(3,2),          -- 0.00-1.00
  
  -- Valuation
  valuation_low BIGINT,                     -- preliminary range, in cents
  valuation_high BIGINT,
  valuation_method TEXT,
  valuation_updated_at TIMESTAMPTZ,
  
  -- Deal status
  deal_status TEXT DEFAULT 'private',       -- 'private' | 'exploring' | 'listed' | 'under_loi' | 'sold'
  
  -- Enrichment data from external sources (Phase 2+)
  enrichment_data JSONB DEFAULT '{}',       -- Apollo, Hunter, WHOIS, etc.
  domain TEXT,
  domain_registered_date DATE,
  
  -- Sale readiness scoring (Phase 5+)
  sale_readiness_score INTEGER,             -- 0-100
  sale_readiness_signals JSONB DEFAULT '[]',
  
  -- Embedding for semantic matching (Phase 3+)
  profile_embedding VECTOR(1536),
  
  -- Metadata
  data_sources JSONB DEFAULT '[]',          -- which sources contributed data
  confidence_score NUMERIC(3,2) DEFAULT 0.50,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_company_profiles_naics ON company_profiles(naics_code);
CREATE INDEX idx_company_profiles_state ON company_profiles(state);
CREATE INDEX idx_company_profiles_deal_status ON company_profiles(deal_status);
CREATE INDEX idx_company_profiles_session ON company_profiles(session_id);

-- Buyer theses: stored acquisition criteria with live match counts
CREATE TABLE IF NOT EXISTS theses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  deal_id UUID REFERENCES deals(id),
  
  -- Criteria
  buyer_type TEXT,                          -- 'individual' | 'searcher' | 'pe' | 'strategic' | 'family_office'
  industries JSONB DEFAULT '[]',            -- list of NAICS codes or industry labels
  geographies JSONB DEFAULT '[]',           -- states, metros, or 'national'
  
  revenue_min BIGINT,                       -- in cents
  revenue_max BIGINT,
  sde_min BIGINT,
  sde_max BIGINT,
  deal_value_min BIGINT,
  deal_value_max BIGINT,
  
  equity_available BIGINT,                  -- how much they can invest
  prefers_sba BOOLEAN DEFAULT false,
  
  -- Thesis document (the deliverable output)
  thesis_document TEXT,                     -- full markdown content
  thesis_document_generated_at TIMESTAMPTZ,
  
  -- Match tracking
  internal_match_count INTEGER DEFAULT 0,  -- matches against company_profiles
  last_match_scan_at TIMESTAMPTZ,
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_theses_session ON theses(session_id);
CREATE INDEX idx_theses_active ON theses(is_active);

-- Discovery targets: off-market companies flagged for buyers (Phase 4+)
CREATE TABLE IF NOT EXISTS discovery_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thesis_id UUID REFERENCES theses(id),
  company_profile_id UUID REFERENCES company_profiles(id),
  
  -- Source
  source TEXT NOT NULL,                     -- 'google_places' | 'bizbuysell' | 'manual' | 'internal_match'
  source_url TEXT,
  source_id TEXT,                           -- external ID (Google Place ID, BizBuySell listing ID, etc.)
  
  -- Enrichment status
  enrichment_status TEXT DEFAULT 'pending', -- 'pending' | 'enriching' | 'complete' | 'failed'
  enrichment_attempted_at TIMESTAMPTZ,
  
  -- Scoring
  thesis_fit_score INTEGER,                 -- 0-100, how well this matches the buyer's thesis
  sale_readiness_score INTEGER,             -- 0-100
  overall_score INTEGER,                    -- composite
  
  -- Buyer action
  buyer_status TEXT DEFAULT 'flagged',      -- 'flagged' | 'reviewing' | 'pursuing' | 'passed'
  buyer_notes TEXT,
  buyer_actioned_at TIMESTAMPTZ,
  
  -- Raw data from discovery
  raw_data JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_discovery_targets_thesis ON discovery_targets(thesis_id);
CREATE INDEX idx_discovery_targets_status ON discovery_targets(buyer_status);
CREATE INDEX idx_discovery_targets_source ON discovery_targets(source);

-- Update conversations table with intelligence columns
ALTER TABLE conversations 
  ADD COLUMN IF NOT EXISTS journey TEXT,
  ADD COLUMN IF NOT EXISTS current_gate TEXT,
  ADD COLUMN IF NOT EXISTS league TEXT,
  ADD COLUMN IF NOT EXISTS deal_id UUID REFERENCES deals(id),
  ADD COLUMN IF NOT EXISTS company_profile_id UUID REFERENCES company_profiles(id),
  ADD COLUMN IF NOT EXISTS thesis_id UUID REFERENCES theses(id),
  ADD COLUMN IF NOT EXISTS extracted_data JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS journey_context TEXT;
```

## VERIFICATION
1. `npm run build` — zero errors
2. Conversations persist across page refreshes
3. Sidebar shows conversations grouped by date
4. New Chat creates a fresh conversation
5. All new tables exist in database (check with: `\dt` in psql)
6. company_profiles, theses, discovery_targets tables created with correct columns
7. Works on Railway
```

---

## SESSION 4: YULIA'S BRAIN — JOURNEY DETECTION + LEAGUE + GATE S0/B0 + KNOWLEDGE GRAPH WIRING
**Estimated CC time:** 5-6 hours (expanded — adds knowledge graph persistence)
**What ships:** Journey detection, league classification, gate S0/B0, AND every conversation auto-persists to company_profiles + theses. Sellers see buyer demand signals.

### The Prompt

```
Read CLAUDE.md first, then read this entire prompt before writing any code.

Then read these sections of YULIA_PROMPTS_V2.md:
- Section 2: League Persona Definitions (L1-L6)
- Section 3: Journey Detection & Routing
- Section 4: SELL Journey Gate S0
- Section 5: BUY Journey Gate B0
- Section 13: Gate Advancement Triggers

## CONTEXT
Sessions 1-3 done. Conversations persist with anonymous session IDs. Database has company_profiles, theses, discovery_targets tables from Session 3 migrations.

## WHAT TO BUILD

### Part A: Dynamic System Prompt + Journey Detection (same as before)

Create `server/prompts/buildSystemPrompt.ts`:
```typescript
function buildSystemPrompt(conversation: {
  journey: string | null;
  currentGate: string | null;
  league: string | null;
  extractedData: Record<string, any>;
  journeyContext: string | null;
}): string
```

After each message, run a Haiku classification call:
```
Given this user message: "{message}" and context: "{journeyContext}"

Classify intent: SELL | BUY | RAISE | PMI | UNKNOWN

Extract any mentioned business data:
- industry, revenue, location, employees, business name, years_in_operation, owner_compensation

Return JSON: { "journey": "...", "extracted": {...} }
```

League classification from revenue/SDE:
- L1: $0-$500K SDE
- L2: $500K-$2M SDE
- L3: $2M-$5M EBITDA
- L4: $5M-$10M EBITDA
- L5: $10M-$50M EBITDA
- L6: $50M+ EBITDA

### Part B: Knowledge Graph Auto-Persistence (CRITICAL NEW FEATURE)

Every time Yulia extracts data from a seller conversation, automatically upsert to `company_profiles`. This is the database flywheel — the platform gets smarter with every conversation.

Create `server/services/knowledgeGraphService.ts`:

```typescript
async function upsertCompanyProfile(
  conversationId: string,
  sessionId: string,
  extractedData: Record<string, any>
): Promise<string> {
  // Build a profile from extracted conversation data
  // If conversation already has a company_profile_id → UPDATE
  // If not → INSERT and link to conversation

  // Map extracted fields:
  // extractedData.industry → naics_code (use industry→NAICS lookup table)
  // extractedData.revenue → revenue_reported
  // extractedData.sde → sde_reported
  // extractedData.location.city + state → city, state
  // extractedData.employees → employee_count
  // extractedData.years_in_operation → years_in_operation
  // extractedData.business_name → name

  // Returns: company_profile_id
}

async function upsertBuyerThesis(
  conversationId: string,
  sessionId: string,
  extractedData: Record<string, any>
): Promise<string> {
  // Build a thesis from extracted buy-side conversation data
  // If conversation already has a thesis_id → UPDATE
  // If not → INSERT and link to conversation

  // Map extracted fields:
  // extractedData.target_industries → industries
  // extractedData.target_geographies → geographies
  // extractedData.revenue_min/max → revenue_min, revenue_max
  // extractedData.equity_available → equity_available
  // extractedData.buyer_type → buyer_type

  // Returns: thesis_id
}
```

Wire this into the message processing loop:
```
After each user message + Yulia response:
  1. Run classification (Haiku) → extract journey + data
  2. Update conversation state (journey, league, gate, extracted_data)
  3. If journey === 'sell' AND extracted data has industry/revenue/location:
       → upsertCompanyProfile()
  4. If journey === 'buy' AND extracted data has industries/geographies/budget:
       → upsertBuyerThesis()
  5. Rebuild system prompt with updated state
```

**Important:** Do NOT require all fields to be present before creating the profile. Create it when you have at minimum: industry + rough revenue + location (state). Update it as more data comes in. Use UPSERT (INSERT ... ON CONFLICT DO UPDATE).

### Part C: Buyer Demand Signals for Sellers (CRITICAL NEW FEATURE)

When Yulia detects a SELL journey and creates/updates a company_profile, she should query the theses table to find matching buyers. Surface this to the seller in a natural way — early in the S0 conversation (typically after she has enough data to do a meaningful query: industry + state + approximate revenue range).

```typescript
async function getBuyerDemandSignals(companyProfile: CompanyProfile): Promise<{
  strongMatches: number;       // theses where industry + geography + size all match
  industryMatches: number;     // theses where just industry matches (broader)
  totalActiveBuyers: number;   // all active theses on platform
}> {
  // Query theses table:
  // Strong match: industries array contains this NAICS, 
  //              geographies contains this state or 'national',
  //              revenue_min <= company revenue <= revenue_max
  // Industry match: industries contains NAICS (ignore geography/size)
  // Total: COUNT of all active theses
}
```

Inject buyer demand signals into Yulia's S0 system prompt:
```
BUYER DEMAND CONTEXT:
Based on what the seller has shared so far, there are:
- {strongMatches} active buyers on this platform whose acquisition criteria closely match this business
- {industryMatches} buyers specifically looking for businesses in this industry
- {totalActiveBuyers} total active acquirers on the platform

Mention the strong match count naturally in your conversation — but only after you have enough data to make a meaningful match (industry + state + approximate revenue). Don't mention this in your very first response. 

When appropriate, say something like: "Good news — I'm already seeing {strongMatches} active buyers on our platform whose acquisition criteria match what you've described. Let me get a few more details so I can give you the full picture."

This creates urgency and validates their decision to use the platform.
```

### Part D: Deal Creation
When journey is detected, create a deal in the `deals` table:
- Link to the conversation
- Set initial gate (S0, B0, R0, PMI0)
- Store extracted data

## VERIFICATION
1. `npm run build` — zero errors
2. "I want to sell my pest control business doing $1.8M in Dallas" → Yulia detects SELL, starts S0
3. After a few exchanges → check company_profiles table: a row exists with industry, revenue, location
4. "I'm looking to buy an HVAC company in Texas, budget around $2M" → Yulia detects BUY, starts B0
5. After a few exchanges → check theses table: a row exists with industries, geographies, deal range
6. Seller conversation: Yulia mentions buyer demand signal naturally mid-conversation
7. L2 league tone (warm, professional) vs L1 tone (accessible, educational) — verify they feel different
8. Conversation state (journey, gate, league) persists in DB between requests
```

---

## SESSION 5: GATE PROGRESSION + FREE DELIVERABLES (Value Readiness Report + Thesis Document)
**Estimated CC time:** 5-6 hours (expanded — adds Value Readiness Report and Thesis Document)
**What ships:** Gates advance, free deliverables deliver genuine value, the hooks that make users stay

### The Prompt

```
Read CLAUDE.md first, then read this entire prompt before writing any code.

Read YULIA_PROMPTS_V2.md Section 4 (S1 Gate), Section 5 (B1 Gate), Section 13 (Gate Advancement Triggers).
Read METHODOLOGY_V17.md Section 2.0-2.3 (League System, Gate Definitions, Financial Formulas).

## CONTEXT
Sessions 1-4 done. Journey detection works. Knowledge graph auto-persists. Buyer demand signals surface to sellers. Now we make the gate progression actually deliver value.

## WHAT TO BUILD

### Part A: Gate Advancement Service (same architecture as before)

Create `server/services/gateService.ts`:
```typescript
async function checkGateAdvancement(conversationId: string): Promise<{
  shouldAdvance: boolean;
  nextGate: string | null;
  completionDeliverable: 'value_readiness_report' | 'thesis_document' | 'sde_analysis' | null;
}>

async function advanceGate(conversationId: string, nextGate: string): Promise<void>
```

### Part B: S0 → S1 Transition — Seller Gets the Value Readiness Report

When S0 requirements are met (industry + revenue + owner compensation + location + exit reason + league classified), Yulia:

1. Summarizes what she's learned
2. Announces league classification
3. Delivers the **FREE Value Readiness Report** (see format below)
4. Auto-advances to S1

**S0 Requirements:**
- Industry identified
- Revenue known (approximate is fine)
- Owner compensation/salary known
- Location known (city + state)
- Exit reason understood
- Business age known
- Years until desired exit (or ASAP)

**The Value Readiness Report (this is the flagship free deliverable):**

This is NOT just a SDE number. This is a personalized strategic document that makes the seller understand exactly what they need to do and why the platform is valuable. It should be rendered in the canvas (from Session 7) and feel like something they'd normally pay a consultant $2-5K for.

```markdown
## Your Business Value Readiness Report
### {Business Name or "Your Business"} | {Industry} | {City, State}

**Summary:** Based on your inputs, your business currently scores {X}/100 on our 
Value Readiness Scale. Here's your personalized roadmap to maximize your exit value.

---

### Current Financial Snapshot

| Metric | Your Numbers | Industry Benchmark |
|--------|-------------|-------------------|
| Annual Revenue | ${revenue} | — |
| Owner Compensation | ${owner_comp} | — |
| Preliminary SDE | ${sde_estimate} | — |
| Years in Operation | {years} | — |

*Note: Full SDE calculation with add-backs happens in the next phase.*

---

### Your Preliminary Value Range

Based on industry comparables for {industry} businesses in your revenue range:

**Estimated Range: ${low_multiple}M – ${high_multiple}M**
*(Based on {low_x}x – {high_x}x SDE for {industry})*

This is a preliminary range. Your actual number will be higher or lower based on:
- Financial documentation quality
- Customer concentration
- Owner dependency
- Revenue trend
- Business systems and processes

---

### Value Readiness Score: {score}/100

| Dimension | Score | What It Means |
|-----------|-------|---------------|
| Financial Documentation | {x}/20 | {explanation} |
| Owner Independence | {x}/20 | {explanation} |
| Customer Base Quality | {x}/20 | {explanation} |
| Revenue Trend | {x}/20 | {explanation} |
| Business Systems | {x}/20 | {explanation} |

---

### Your 12-Month Value Creation Roadmap

These are the highest-impact actions to increase your sale price before going to market:

**Action 1: {specific action}**
- Estimated impact: +${dollar_impact} to sale price
- Time to implement: {timeframe}
- Difficulty: {Easy/Medium/Hard}

**Action 2: {specific action}**
- Estimated impact: +${dollar_impact} to sale price
- Time to implement: {timeframe}
- Difficulty: {Easy/Medium/Hard}

**Action 3: {specific action}**
- Estimated impact: +${dollar_impact} to sale price
- Time to implement: {timeframe}
- Difficulty: {Easy/Medium/Hard}

**Total potential upside:** +${total_upside} to your exit value
**If you follow this plan:** ${improved_low}M – ${improved_high}M estimated range

---

### Buyer Demand Intelligence

*{X} active buyers on our platform match your business profile.*
*{Y} are specifically looking for {industry} businesses in {state}.*

---

### Next Steps

To get your full valuation with comparable transactions and a defensible methodology:
**Full Valuation Report — $350** (next step when you're ready)

Or continue building your profile to refine these numbers first.
```

Generate this using Claude Sonnet. Pull all data from `conversation.extracted_data`. For dimensions where you don't have data yet, score conservatively and note what's needed.

For the improvement roadmap, use METHODOLOGY_V17.md Section 2.X (add-back analysis and value creation levers) to generate specific, dollar-quantified recommendations. Common levers:
- Formalizing add-backs before sale: +15-25% SDE
- Reducing owner dependency (documenting processes): +10-20% multiple
- Converting month-to-month clients to annual contracts: +5-15% SDE
- Cleaning up personal expenses run through business: +5-15% SDE
- Building 3 years of clean P&Ls: +0.5-1.0x multiple

### Part C: B0 → B1 Transition — Buyer Gets the Thesis Document

When B0 requirements are met (buyer type + industries + geographies + size range + financial capacity), Yulia:

1. Summarizes the acquisition thesis
2. Queries internal matches against company_profiles
3. Delivers the **FREE Thesis Document** (see format below)
4. Updates `theses` table with thesis_document content
5. Auto-advances to B1

**B0 Requirements:**
- Buyer type identified
- Target industries defined (at least 1)
- Target geographies defined
- Revenue or deal size range defined
- Equity available known
- SBA preference stated

**The Thesis Document:**

```markdown
## Acquisition Thesis
### {Buyer Name or "Your Thesis"} | Generated {date}

**Summary:** You are a {buyer_type} seeking to acquire a {industry} business in {geography}, 
with {revenue_min}-{revenue_max} in revenue, using approximately ${equity_available} in equity.

---

### Acquisition Criteria

| Criterion | Your Target |
|-----------|-------------|
| Buyer Type | {buyer_type} |
| Target Industries | {industries list} |
| Geography | {geographies list} |
| Revenue Range | ${revenue_min} – ${revenue_max} |
| Deal Value Range | ${deal_value_min} – ${deal_value_max} |
| Equity Available | ${equity_available} |
| SBA Financing | {Yes/No/Open to it} |

---

### Financing Snapshot

At your target deal size and equity investment:
- **SBA 7(a) loan amount:** ${loan_amount} (at 90% LTV)
- **Estimated monthly payment:** ${monthly_payment} (at current SBA rate, 10-year term)
- **DSCR required:** 1.25x minimum
- **SDE needed to qualify:** ${sde_required} minimum

---

### Platform Match Intelligence

Right now on the smbX.ai platform:
- **{internal_matches} businesses** match your core criteria (industry + geography + size)
- **{broader_matches} additional businesses** are in adjacent industries or geographies

---

### What Happens Next

1. **Yulia will show you matching opportunities** — both listed deals and off-market intelligence
2. **You'll evaluate and score each target** — Yulia scores thesis fit, SBA eligibility, and risk
3. **For strong matches:** Yulia generates a Deal Screening Memo ($150) for any target you want to pursue
4. **When you're ready to make an offer:** Yulia drafts the IOI and LOI

*This Thesis Document is saved to your deal profile. Share it with your lender or SBA advisor to demonstrate deal readiness.*
```

### Part D: S1 → S2 — SDE Analysis (same as before, but now goes into canvas)

S1 deep dive gathers detailed financials. When complete, Yulia delivers the SDE calculation as a formatted canvas document (preview for the $350 full valuation):

```markdown
## Your Preliminary Financial Analysis

**Revenue (most recent year):** ${revenue}
**Less: COGS:** (${cogs})
**Gross Profit:** ${gross_profit}

**Add-backs Identified:**
| Category | Amount | Confidence |
|----------|--------|-----------|
| Owner salary | ${amount} | Confirmed |
| Personal vehicle | ${amount} | High |
| Family health insurance | ${amount} | High |
| One-time expenses | ${amount} | Confirmed |

**Adjusted SDE:** ${sde}

**Preliminary Value Range:** ${low} – ${high}
*(Based on {low_x}x – {high_x}x SDE for {industry})*

For the full valuation with comparable transactions, 7-factor quality score, and 
specific multiple recommendation: **Full Valuation — $350**
```

## VERIFICATION
1. Complete S0 (pest control, $1.8M Dallas) → Value Readiness Report appears in chat
2. Report has: score, financial snapshot, preliminary range, improvement roadmap with dollar amounts
3. Report mentions buyer demand signals (X buyers match)
4. Complete B0 (HVAC buyer, Texas, $2M budget) → Thesis Document appears
5. Thesis Document has: criteria table, financing snapshot, internal match count
6. Check theses.thesis_document column — content saved
7. Continue seller conversation into S1 → SDE calculation appears
8. Gates advance in DB: S0→S1, B0→B1
```

---

## SESSION 6: WALLET + STRIPE (Payment System)
**Estimated CC time:** 4-5 hours
**What ships:** Users can top up a wallet and purchase deliverables
*(No changes from original Build Plan v8 — this section is correct as written)*

### The Prompt

```
Read CLAUDE.md first, then read this entire prompt before writing any code.

## CONTEXT
Sessions 1-5 done. Gates advance. Free deliverables render in chat. Yulia naturally leads into paid deliverables.

## WHAT TO BUILD

### Wallet Service
Create `server/services/walletService.ts`:
- createWallet(sessionId) → creates wallet for anonymous user
- getBalance(walletId) → balance in cents
- addFunds(walletId, amountCents, source) → credit wallet
- deductFunds(walletId, amountCents, reason) → debit wallet  
- getTransactions(walletId) → history

All amounts in CENTS internally. $1 = 100 cents.

### Wallet Blocks (Pre-Defined Top-Up Amounts)
The wallet_blocks table is already seeded:
- $50 (no bonus)
- $100 ($5 bonus = $105 purchasing power)
- $250 ($15 bonus = $265)
- $500 ($40 bonus = $540)
- $1,000 ($100 bonus = $1,100)

### Stripe Integration
Install: `npm install stripe`

POST /api/wallet/checkout
- Accepts: { blockId: string }
- Creates Stripe Checkout Session
- Returns checkout URL

POST /api/webhook/stripe
- Handles checkout.session.completed
- Credits wallet with block amount + bonus
- Records transaction

### Menu Items (Deliverable Pricing)
From menu_items table:
- Full Valuation Report: $350
- Value Readiness Report: FREE (delivered at S0 completion)
- Thesis Document: FREE (delivered at B0 completion)
- SBA Financing Model: $200
- Deal Screening Memo: $150
- Market Intelligence Report: $200
- Financial Model: $275
- CIM: $700
- LOI Draft: $70

### Wallet UI
- Balance indicator in topbar/chat header
- Click → expand to show top-up options
- Click block → Stripe Checkout → return → balance updated
- Transaction history accessible

### TEST_MODE bypass
Add TEST_MODE=true env var that skips actual Stripe payment and auto-approves purchases for testing.
```typescript
if (process.env.TEST_MODE === 'true') {
  // Skip Stripe, credit wallet directly, mark as test transaction
  await walletService.addFunds(walletId, blockAmount + bonus, 'test_mode');
  return { success: true, test: true };
}
```

### Environment Variables
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
TEST_MODE=true   ← for testing without real Stripe
```

## VERIFICATION
1. Wallet balance displays in chat view ($0 initially)
2. TEST_MODE=true: click $100 block → balance goes to $105 instantly (no Stripe redirect)
3. TEST_MODE=false: click $100 block → Stripe Checkout opens in test mode
4. Complete Stripe checkout → balance updates to $105
5. Request $350 valuation → wallet debits
6. Insufficient funds → top-up prompt appears
7. Transaction history shows all credits and debits
```

---

## SESSION 7: CANVAS + DELIVERABLE GENERATION
**Estimated CC time:** 5-6 hours
**What ships:** Split-view canvas, deliverable generation, PDF export
*(Largely same as original, with Value Readiness Report added as first free deliverable)*

### The Prompt

```
Read CLAUDE.md first, then read this entire prompt before writing any code.

## CONTEXT
Sessions 1-6 done. Wallet works. Yulia delivers free deliverables in-chat. Now we render those deliverables in a proper canvas panel and add paid deliverable generation.

## WHAT TO BUILD

### Canvas Layout

Desktop (≥1024px): Split view
┌──────────────────────────────────────────────────┐
│ Topbar                                           │
├──────────────────┬───────────────────────────────┤
│  Chat (50%)      │  Canvas (50%)                 │
│  Messages        │  Deliverable content          │
│  ChatDock        │  Toolbar: Export | Save       │
└──────────────────┴───────────────────────────────┘

Mobile: Canvas opens as full-screen bottom sheet with close button.

Create `client/src/components/Canvas.tsx`:
- Toolbar: Export PDF, Save to Data Room, Close, Version indicator
- Content area: renders markdown with tables, headers, financial formatting
- Smooth open/close animation
- Persists across message sends (don't close canvas when user sends a message)

### Free Deliverables → Canvas Integration

When Yulia delivers a free deliverable (Value Readiness Report at S0, Thesis Document at B0, SDE analysis at S1), automatically open the canvas with the content. 

These are already generated from Session 5 — just wire them into the canvas display. In the API response, include:
```json
{ "openCanvas": true, "canvasContent": "...", "canvasTitle": "Value Readiness Report" }
```

### Paid Deliverables to Implement

**1. Full Valuation Report ($350) — top priority**
- Executive Summary
- Business Overview (from S0/S1 extracted data)
- Financial Analysis (revenue, SDE, add-backs with full math)
- Valuation Methodology (SDE multiple for L1-L2, EBITDA for L3+)
- Industry Comparables (from METHODOLOGY_V17.md industry multiples)
- 7-Factor Quality Score (revenue trend, margin, customer concentration, owner dependency, industry outlook, operational maturity, financial documentation — score each 1-10, explain)
- Recommended Asking Price Range (with rationale)
- Key Risks and Mitigants
- SBA Bankability Assessment
- Next Steps

Use Claude Sonnet. Inject ALL extracted conversation data. Must be factually grounded — no hallucinated numbers.

**2. Deal Screening Memo ($150) — for buyers evaluating a specific target**
- Target Overview
- Financial Summary (from listing or conversation data)
- Thesis Fit Score (vs. buyer's saved thesis criteria)
- Preliminary Valuation Range
- SBA Financing Assessment (can this be financed? what's the DSCR?)
- Key Risks
- Recommendation: Pursue / Pass / Investigate Further

**3. SBA Financing Model ($200) — answers the #1 buyer question**
- Loan amount, rate, term calculations (use current SBA 7(a) rates from METHODOLOGY_V17)
- DSCR analysis (Debt Service Coverage Ratio — must be 1.25x minimum)
- Monthly payment schedule
- Equity injection required
- Seller note component (if needed to bridge gap)
- Go / No-Go on SBA eligibility with specific reasoning

### Deliverable Generation Pipeline
Create `server/services/deliverableService.ts`:
```typescript
async function generateDeliverable(
  dealId: string,
  menuItemSlug: string,
  conversationData: Record<string, any>
): Promise<{ id: string; content: string; status: string }>
```

Database schema:
```sql
CREATE TABLE IF NOT EXISTS deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id),
  conversation_id UUID REFERENCES conversations(id),
  menu_item_slug TEXT NOT NULL,
  status TEXT DEFAULT 'generating',  -- generating | complete | failed
  content TEXT,
  version INTEGER DEFAULT 1,
  cost_cents INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);
```

### PDF Export
Convert deliverable markdown to PDF for download.
Use html-pdf-node or a similar lightweight library.
Include: SMBX branding, page numbers, clean typography, proper table formatting.

## VERIFICATION
1. Complete S0 → Value Readiness Report appears in canvas automatically
2. Complete B0 → Thesis Document appears in canvas
3. Request Full Valuation ($350) → canvas streams it in progressively
4. Valuation has all 8 sections including 7-factor score
5. Numbers match what was provided in conversation
6. Click Export PDF → clean PDF downloads with SMBX branding
7. Canvas persists when you send more messages
8. Close canvas → reopen → content still there
9. Deal Screening Memo and SBA Model generate for buyers
```

---

## SESSION 8: DATA ROOM
**Estimated CC time:** 3-4 hours
**What ships:** Generated deliverables auto-organize into deal folders
*(Same as original Build Plan v8)*

### The Prompt

```
Read CLAUDE.md first.

## CONTEXT
Sessions 1-7 done. Deliverables generate and display in canvas.

## WHAT TO BUILD

### Data Room View
Create `client/src/pages/DataRoom.tsx`:
- Left panel: folder tree (Financials / Valuation / Deal Documents / Due Diligence)
- Right panel: document cards (title, status, date, version)
- Access via "Documents" link in sidebar

### Auto-Filing on Generation
- Value Readiness Report → Deal Documents/
- Full Valuation Report → Valuation/
- SBA Financing Model → Financials/
- Thesis Document → Deal Documents/
- Deal Screening Memo → Deal Documents/
- Financial Model → Financials/
- CIM → Deal Documents/

### Document Cards
- Title, status (draft/final), date generated, version number
- Click → opens in canvas

### "Save to Data Room" Button
In canvas toolbar → files the current deliverable to the appropriate folder

## VERIFICATION
1. Generate valuation → appears in Valuation/ folder
2. Generate SBA model → appears in Financials/ folder
3. Click document in data room → opens in canvas
4. Both seller and buyer deliverables accessible
```

---

## SESSION 9: POLISH + MOBILE + ERROR HANDLING
**Estimated CC time:** 3-4 hours
**What ships:** Production-quality UX
*(Same as original Build Plan v8)*

### The Prompt

```
Read CLAUDE.md first.

## WHAT TO FIX AND POLISH

### Error Handling
1. Anthropic API fails → "I'm having trouble connecting. Let me try again." + retry button
2. Stripe checkout fails → graceful error, don't lose conversation state
3. Deliverable generation fails → notify in chat, offer retry, refund wallet
4. SSE connection drops mid-stream → auto-reconnect
5. Network offline → "You appear to be offline. I'll send your message when you're back."

### Mobile Polish
1. iOS Safari viewport: position:fixed inset:0 + JS visualViewport for height/top
2. ChatDock is shrink-0 flex child, NOT position:fixed
3. Test at 375px — everything usable
4. Canvas on mobile: full-screen sheet with close button
5. Topbar: hamburger menu for sidebar on mobile

### Chat Quality
1. Message timestamps (subtle, below each message)
2. "Yulia is typing..." indicator during streaming
3. Auto-scroll to latest message (smooth)
4. Markdown rendering: headers, lists, tables, code blocks
5. Financial tables: properly aligned

### Loading States
1. Initial app load: skeleton while checking session
2. Conversation switch: brief loading indicator
3. Deliverable generation: progress indicator in canvas
4. Wallet top-up: loading state during checkout

## VERIFICATION
1. Complete flow on iPhone Safari — no layout breaks
2. Complete flow on desktop Chrome — smooth and fast
3. Network offline → indicator shows → reconnect → messages send
4. Kill server mid-response → error appears → retry works
5. Long conversation (50+ messages) → scrolls smoothly
```

---

## SESSION 10: E2E TESTING + LAUNCH READINESS
**Estimated CC time:** 2-3 hours
**What ships:** Automated tests, deploy verification

### The Prompt

```
Read CLAUDE.md first.

## WHAT TO BUILD
End-to-end Playwright tests for critical user journeys.

### Test Suite (e2e/ folder)

**test: complete-sell-journey.spec.ts**
1. Navigate to /sell
2. Type "I want to sell my pest control business doing $1.8M revenue in Dallas"
3. Assert: page morphs to chat view
4. Assert: Yulia responds (streaming appears)
5. Answer Yulia's questions (location, employees, owner comp, years)
6. Assert: gate advances S0→S1
7. Assert: Value Readiness Report appears in canvas
8. Assert: report mentions buyer demand signals
9. Assert: company_profiles table has a row for this business

**test: complete-buy-journey.spec.ts**
1. Navigate to /buy
2. Type "I'm looking for HVAC companies in Texas under $5M"
3. Answer B0 questions (buyer type, equity available, timeline)
4. Assert: gate advances B0→B1
5. Assert: Thesis Document appears in canvas
6. Assert: theses table has a row with matching criteria

**test: knowledge-graph.spec.ts**
1. Start seller conversation → provide business details
2. Assert: company_profiles row created/updated after each message exchange
3. Assert: deal_id linked to conversation
4. Start buyer conversation → provide thesis criteria
5. Assert: theses row created/updated
6. Assert: internal_match_count > 0 if there's a matching company profile

**test: wallet-flow.spec.ts**
1. Open wallet → balance shows $0
2. TEST_MODE=true: click $100 block → balance immediately shows $105
3. Request deliverable → balance debits correctly

**test: chat-persistence.spec.ts**
1. Start conversation → send 3 messages
2. Reload page
3. Assert: conversation in sidebar
4. Click conversation → all messages + responses load

Run all tests. Fix failures. Tests should pass on Railway.
```

---

## EXECUTION TIMELINE

```
WEEK 1:
├── Day 1: Session 1 (AI backend + streaming)           → Yulia talks
├── Day 2: Session 2 (Chat morph)                       → Website becomes the app
├── Day 3: Session 3 (Persistence + DB schema)          → Conversations save + intelligence DB ready
├── Day 4: Session 4 (Journey detection + knowledge graph) → Yulia gets smart + DB fills
└── Day 5: Session 5 (Gate progression + free deliverables) → Real value delivered

WEEK 2:
├── Day 1: Session 6 (Wallet + Stripe)                  → Users can pay
├── Day 2-3: Session 7 (Canvas + deliverables)          → Paid deliverables generate
├── Day 4: Session 8 (Data room)                        → Documents organized
└── Day 5: Session 9 (Polish + mobile)                  → Production quality

WEEK 3:
├── Day 1: Session 10 (E2E tests)                       → Launch confidence
├── Day 2: Add auth layer (thin — JWT before wallet access)
├── Day 3: Final testing on Railway
└── Day 4: 🚀 LAUNCH
```

---

## SESSIONS 11-16: POST-LAUNCH (Build When Revenue Allows)

These are prioritized in the order that matters most for the platform's moat and retention. They are NOT blocking launch, but they ARE what separates a transactional tool from a platform businesses return to daily.

---

## SESSION 11: SELLER OS — LIVING VALUATION + VALUE ROADMAP TRACKER
**Build When:** First paying users confirmed
**Estimated CC time:** 5-6 hours
**What ships:** The retention hook for sellers — a living valuation that updates as they take action

### Why This Session Is Critical
The Value Readiness Report (delivered at S0 in Session 5) is a snapshot. The Living Valuation is what brings sellers back monthly. Every time a seller marks an improvement action complete, Yulia updates their estimated range. This is the primary seller OS retention mechanic.

### The Prompt

```
Read CLAUDE.md first.

## CONTEXT
Sessions 1-10 done, platform is live. Sellers are getting Value Readiness Reports. We need to make those reports "alive" — updating as sellers take action and as market conditions change.

## WHAT TO BUILD

### Seller Dashboard
Create a page/panel accessible from the sidebar for sellers with an active deal/profile:

- **Header:** "Your Business Value Tracker" | Current estimated range | Last updated date
- **Range visualization:** Simple bar showing low-mid-high range (not a precise number)
- **Improvement Roadmap:** The actions from their Value Readiness Report, now as a checklist

### Improvement Action Tracker
Convert the roadmap items from the Value Readiness Report into persistent, interactive items:

```sql
CREATE TABLE IF NOT EXISTS improvement_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_profile_id UUID REFERENCES company_profiles(id) NOT NULL,
  
  -- Action details
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,           -- 'financial' | 'operations' | 'sales' | 'documentation'
  
  -- Impact
  ebitda_impact_cents BIGINT,      -- estimated EBITDA improvement in cents
  valuation_impact_cents BIGINT,   -- estimated sale price improvement in cents
  difficulty TEXT,                 -- 'easy' | 'medium' | 'hard'
  timeline_days INTEGER,           -- estimated days to complete
  
  -- Status
  status TEXT DEFAULT 'not_started',  -- 'not_started' | 'in_progress' | 'complete'
  completed_at TIMESTAMPTZ,
  completion_note TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

When a seller marks an action complete, Yulia:
1. Acknowledges in chat: "You completed '{action}' — let me update your valuation range."
2. Recalculates the range (add the `valuation_impact_cents` to the range)
3. Shows the update: "Your estimated range just moved from $1.1M-$1.4M to $1.2M-$1.55M. That's +$150K in exit value."
4. Updates `company_profiles.valuation_low` and `valuation_high`
5. Suggests the next highest-impact action

### Quarterly Market Update Job
Create a pg-boss recurring job (runs monthly):

```typescript
boss.schedule('monthly-valuation-refresh', '0 9 1 * *', async () => {
  // For each active company_profile with a valuation:
  // 1. Check if industry multiples have changed (from METHODOLOGY_V17 industry benchmarks)
  // 2. Check if local market conditions changed (BLS QCEW for the NAICS + county)
  // 3. If material change (>5%): update valuation range + notify via email/in-app
});
```

### Re-engagement Message
Monthly email/in-app notification for sellers:
"Your estimated value range was last updated {X} days ago. You have {N} improvement actions in progress. Log in to see your current picture."

## VERIFICATION
1. Complete S0 → Value Readiness Report → improvement actions appear in tracker
2. Mark action "complete" → Yulia updates range and shows dollar impact
3. Dashboard shows current range, all actions, completed/in-progress
4. Monthly job scheduled (verify in pg-boss admin)
```

---

## SESSION 12: BUYER OS — THESIS STORAGE + INTERNAL MATCHING + PIPELINE VIEW
**Build When:** After Session 11
**Estimated CC time:** 5-6 hours
**What ships:** Buyers get a live deal pipeline with match counts and Yulia-scored opportunities

### The Prompt

```
Read CLAUDE.md first.

## CONTEXT
Sessions 1-11 done. Buyers are getting Thesis Documents at B0. The theses table is populated. company_profiles is being auto-filled from seller conversations. Now we make the buyer experience dynamic — they come back because their pipeline updates.

## WHAT TO BUILD

### Buyer Pipeline View
Create a page accessible from sidebar: "My Deal Pipeline"

Layout:
┌─────────────────────────────────────────────────────┐
│  Your Acquisition Thesis                             │
│  HVAC · Texas · $1M-$3M SDE · 6 active matches      │
│  [View Thesis] [Edit Criteria]                       │
├─────────────────────────────────────────────────────┤
│  Opportunities (scored by Yulia)                     │
│                                                      │
│  ● [Company Name] — HVAC — Dallas, TX               │
│    Est. Revenue: $4.2M | SDE: $890K | Score: 87/100  │
│    SBA Eligible: Yes | Status: Flagged               │
│    [Get Screening Memo — $150] [Pass] [Pursue]       │
│                                                      │
│  ● [Company Name] — HVAC — Houston, TX              │
│    Est. Revenue: $2.8M | SDE: $620K | Score: 74/100  │
│    SBA Eligible: Yes | Status: Flagged               │
│    [Get Screening Memo — $150] [Pass] [Pursue]       │
└─────────────────────────────────────────────────────┘

### Thesis-to-Profile Matching Engine
Create `server/services/matchingService.ts`:

```typescript
async function runInternalMatching(thesisId: string): Promise<{
  matches: CompanyProfileMatch[];
  matchCount: number;
}> {
  // Query company_profiles against thesis criteria
  // Score each match (0-100):
  //   - Industry match: 0 or 30 points (NAICS prefix match)
  //   - Geography match: 0 or 25 points (state or metro)
  //   - Revenue/SDE range match: 0-25 points (partial credit for near-misses)
  //   - Deal status match: 0 or 20 points (exploring/listed = higher score)
  // Return scored, sorted results
}
```

Run this as a pg-boss job triggered by:
1. New company_profile created → match against ALL active theses
2. Thesis updated → re-run matching against all company_profiles
3. Daily scan → refresh match counts

### Buyer Action System
When buyer acts on a discovery target:
- **Flagged** (default) → just appeared in pipeline
- **Reviewing** → buyer is evaluating
- **Pursuing** → buyer wants to move forward (triggers Deal Screening Memo offer)
- **Passed** → buyer is not interested (remove from active pipeline)

These update `discovery_targets.buyer_status`.

### Match Alerts
When a new company_profile is created that matches an existing active thesis:
- Send in-app notification: "New match in your pipeline: {industry} business in {location} — {score}/100 thesis fit"
- (Email notifications come in Session later — for now, in-app only)

### Saved Thesis Editing
Allow buyers to refine their thesis criteria after B0:
- Edit geographic scope, revenue range, industry
- Re-run matching immediately
- Show count change: "Your criteria now matches 12 businesses (was 6)"

## VERIFICATION
1. Have seller conversation → company_profile created
2. Have buyer conversation with matching criteria → thesis created
3. Check buyer pipeline view → company profile appears as match
4. Score is 0-100 based on criteria overlap
5. Buyer clicks "Pursue" → status changes
6. Modify buyer thesis → match count updates
```

---

## SESSION 13: OFF-MARKET DISCOVERY PIPELINE v1 (Google Places + BizBuySell)
**Build When:** After Session 12
**Estimated CC time:** 7-9 hours
**What ships:** Yulia actively discovers potential acquisition targets for buyers beyond the platform's internal database

### Architecture Decision (Already Made)
Based on extensive research:
- **Use:** Google Places API (official, legal, $0 up to ~5K queries/month free tier)
- **Do NOT use:** SerpAPI — Google filed lawsuit December 2025, unacceptable legal risk
- **Use:** Apify actors for BizBuySell scraping (~$5-50/month)
- **Use:** Apollo.io free tier for company enrichment (210M+ contacts, 10K email credits/month free)
- **Use:** Hunter.io ($49/month) for email finding/verification
- **Use:** Whoxy ($0.002/lookup) for WHOIS domain age signals
- **Revenue estimation:** BLS QCEW + Census SUSB + IRS SOI (all free) + Damodaran RPE by sector

### The Prompt

```
Read CLAUDE.md first. Read METHODOLOGY_V17.md Section on NAICS codes.

## CONTEXT
Sessions 1-12 done. Buyers have a deal pipeline with internal matches. Now we extend discovery beyond the platform's own database.

When a buyer defines a thesis and wants to see opportunities, there are three tiers:
1. Internal matches (already built in Session 12)
2. Listed deals from BizBuySell (this session)
3. Off-market discovery via Google Places (this session)

"Platform flags it, buyer decides the approach" — Yulia identifies and scores targets, presents them in the pipeline, buyer decides whether and how to reach out.

## WHAT TO BUILD

### Worker Infrastructure (pg-boss jobs)
All discovery runs as async background jobs via pg-boss. Install if not already:
```bash
npm install pg-boss
```

Create `server/workers/discoveryWorker.ts`:
- Initialize pg-boss on server startup
- Register job handlers for discovery jobs

```typescript
// Job types
type DiscoveryJob = 
  | { type: 'bizbuysell_search'; thesisId: string; criteria: ThesisCriteria }
  | { type: 'google_places_search'; thesisId: string; criteria: ThesisCriteria; geographyCell: GeoCell }
  | { type: 'enrich_target'; targetId: string; tier: 1 | 2 | 3 }
  | { type: 'score_target'; targetId: string }
```

### Source 1: BizBuySell via Apify
Set up an Apify actor call to scrape BizBuySell listings matching the buyer's thesis:

```typescript
async function searchBizBuySell(criteria: ThesisCriteria): Promise<RawListing[]> {
  // Call Apify BizBuySell actor with:
  // - industry/category filter (map from NAICS to BizBuySell category)
  // - state filter
  // - price range filter (from thesis deal_value_min/max)
  // - revenue range filter
  
  // Returns raw listings with: title, asking_price, revenue, sde, location, description, listing_url
}
```

On results:
1. For each listing, check if a company_profile already exists (dedup by: normalize title + state + price range)
2. If not: INSERT into `company_profiles` with `deal_status = 'listed'`, `data_sources = ['bizbuysell']`
3. INSERT into `discovery_targets` with `source = 'bizbuysell'`, `source_url = listing_url`, `buyer_status = 'flagged'`
4. Queue enrichment job (tier 1 only — WHOIS + basic Google Places lookup)

### Source 2: Google Places API (physical businesses)
Use the official Google Places Text Search API to discover businesses that may NOT be listed:

```typescript
// Google Places Text Search API
// Cost: $10/1,000 requests (Text Search Pro)
// Free tier: 5,000 requests/month

async function searchGooglePlaces(
  category: string,      // e.g., "plumbing contractor", "hvac company"
  location: string,      // e.g., "Dallas, TX"
  radius?: number        // meters, defaults to 30,000 (30km)
): Promise<PlaceResult[]> {
  const response = await fetch(
    `https://places.googleapis.com/v1/places:searchText`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.websiteUri,places.nationalPhoneNumber,places.rating,places.userRatingCount,places.businessStatus,places.regularOpeningHours,places.primaryType'
      },
      body: JSON.stringify({
        textQuery: `${category} in ${location}`,
        locationBias: { circle: { center: { latitude, longitude }, radius } },
        maxResultCount: 20
      })
    }
  );
  
  // Returns: place_id (storable), name, address, website, phone, rating, review_count, status, hours
  // IMPORTANT: Store only the Place ID permanently. Re-query for full details. 
  // Per Google ToS: do NOT build a persistent database of Google data — only Place IDs can be stored.
}
```

**Geographic subdivision strategy** (to overcome 60-result limit per query):
- Divide a target metro into a grid of 1-mile radius cells
- Query each cell with the target industry category
- Deduplicate by Place ID

**Industry → Google Places category mapping:**
Create a lookup table mapping common acquisition industries to Google Places text queries:
- NAICS 2382 (HVAC) → ["hvac company", "air conditioning contractor", "heating contractor"]
- NAICS 5612 (Pest Control) → ["pest control company", "exterminator"]
- NAICS 5617 (Landscaping) → ["landscaping company", "lawn care service"]
- NAICS 8111 (Auto Repair) → ["auto repair shop", "mechanic shop"]
- NAICS 6211 (Medical Offices) → ["medical practice", "doctor's office"]
- etc. — build this list out for the top 20 most common acquisition industries

On results:
1. For each Place result, deduplicate against existing company_profiles (by: Place ID, website, phone)
2. If not duplicate: INSERT into `company_profiles` with `deal_status = 'unknown'`, `data_sources = ['google_places']`
3. Store: Place ID in enrichment_data, name, address, state, approximate coordinates
4. INSERT into `discovery_targets` with `source = 'google_places'`, `source_id = place_id`, `buyer_status = 'flagged'`
5. Queue tier-1 enrichment job

### Tiered Enrichment Pipeline (~$0.29/business fully enriched, reducible to $0.05-0.15 with tiers)

**Tier 1 — Run on all discoveries (~$0.05/business):**
- WHOIS lookup via Whoxy API ($0.002/lookup): domain registration date → business maturity signal
  - Domain age < 2 years → low confidence in established business
  - Domain age > 10 years → strong signal of established operation
- Basic Google Places Details refresh (if from Places source) → verify businessStatus = OPERATIONAL
- Revenue estimation (free, ~$0 marginal cost):
  ```
  // Use employee_count if available + BLS QCEW industry average annual pay
  // Formula: revenue_estimate = employees × (avg_annual_pay_in_naics / labor_cost_pct_of_revenue)
  // Labor cost % of revenue by industry:
  //   Restaurants: 30%, Professional services: 45%, Construction: 25%, Healthcare services: 40%
  // Source: BLS QCEW (https://data.bls.gov/cew/data/api/{YEAR}/{QTR}/industry/{NAICS}.csv)
  // Pre-cache this data in your DB — don't call BLS on every enrichment
  ```

**Tier 2 — Run on targets passing initial industry/geography filter (~$0.15/business additional):**
- Hunter.io domain search: find email addresses associated with the business domain
  - API endpoint: GET https://api.hunter.io/v2/domain-search?domain={domain}&api_key={key}
  - Returns: list of email addresses with confidence scores + full names
  - Use the first/highest confidence result as potential owner contact
- Store emails in `enrichment_data.contacts` (do NOT surface email addresses directly to buyers — this is for platform use)

**Tier 3 — Full enrichment, only for high-scoring targets (~$0.10/business additional):**
- Apollo.io company enrichment (free tier, 10K credits/month):
  - POST https://api.apollo.io/v1/organizations/enrich
  - Returns: employee count, LinkedIn URL, estimated revenue ranges, technology stack, leadership names
- Store in `enrichment_data`

### Revenue Estimation Service
Create `server/services/revenueEstimationService.ts`:

```typescript
async function estimateRevenue(
  naicsCode: string,
  state: string,
  employeeCount: number | null,
  reviewCount: number | null
): Promise<{
  estimatedLow: number;    // cents
  estimatedHigh: number;   // cents
  method: string;
  confidence: number;
}> {
  // Method 1: Employee count × Revenue Per Employee (from pre-cached QCEW + Damodaran data)
  // Method 2: Review count percentile within industry+geography (proxy for relative size)
  // Combine with weighted average
  // Apply 0.7x private company discount to Damodaran public company benchmarks
}
```

Pre-seed the database with cached QCEW and SUSB data (one-time download, free):
- BLS QCEW: https://data.bls.gov/cew/data/api/2024/a/industry/{6-digit NAICS}.csv
- Census SUSB: https://www.census.gov/data/tables/2022/econ/susb/2022-susb-annual.html
Create a `naics_benchmarks` table:
```sql
CREATE TABLE IF NOT EXISTS naics_benchmarks (
  naics_code TEXT NOT NULL,
  state TEXT,               -- null for national average
  avg_annual_pay_cents BIGINT,
  revenue_per_employee_cents BIGINT,
  labor_cost_pct NUMERIC(4,2),
  median_firm_revenue_cents BIGINT,   -- from SUSB by employee band
  data_year INTEGER,
  source TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (naics_code, COALESCE(state, 'US'))
);
```

### Discovery Flow (end-to-end)
When buyer has an active thesis and requests to "find opportunities":

1. User tells Yulia "show me what's out there" or clicks "Find Opportunities" in pipeline
2. Yulia acknowledges: "I'm scanning BizBuySell and Google Maps for [HVAC companies in Texas]. This runs in the background — I'll update your pipeline as results come in."
3. Backend enqueues:
   - `bizbuysell_search` job (runs in ~30 seconds)
   - Multiple `google_places_search` jobs (one per geography cell, ~2-5 minutes total)
4. Results flow into `discovery_targets` and `company_profiles` in real-time
5. As jobs complete, frontend polls `/api/buyer/pipeline` and updates count
6. When scan is complete: Yulia posts in chat: "Found 23 potential targets. 8 strongly match your thesis. 4 are already listed for sale on BizBuySell. I've scored all of them."

### Scoring Algorithm
After enrichment, score each discovery target:

```typescript
function scoreTarget(target: DiscoveryTarget, thesis: Thesis): number {
  let score = 0;
  
  // Industry match (30 pts)
  if (naicsMatch(target.naics_code, thesis.industries)) score += 30;
  else if (parentNaicsMatch(target.naics_code, thesis.industries)) score += 15;
  
  // Geography match (25 pts)
  if (geographyMatch(target.state, thesis.geographies)) score += 25;
  else if (metroMatch(target.metro, thesis.geographies)) score += 15;
  
  // Revenue/SDE range match (25 pts)
  const revScore = rangeScore(target.revenue_estimated_mid, thesis.revenue_min, thesis.revenue_max);
  score += Math.round(revScore * 25);
  
  // Sale readiness signals (20 pts)
  if (target.deal_status === 'listed') score += 20;
  else if (target.deal_status === 'exploring') score += 15;
  else if (target.sale_readiness_score > 60) score += 10;
  
  return score;
}
```

### Environment Variables Needed
```
GOOGLE_PLACES_API_KEY=...    ← Google Cloud Console, Places API enabled
APIFY_API_TOKEN=...          ← apify.com account
HUNTER_API_KEY=...           ← hunter.io account
APOLLO_API_KEY=...           ← apollo.io account
WHOXY_API_KEY=...            ← whoxy.com account
```

### Cost Management
- Google Places: Free up to 5,000 Text Search Pro calls/month. Set a spending cap at $50/month in GCP console.
- Cache all Google Places results — never re-query the same geographic cell + category within 7 days
- Use tiered enrichment: only full-enrich targets with score > 40
- BizBuySell via Apify: ~$5-50/month depending on frequency

## VERIFICATION
1. Buyer completes B0 with HVAC + Texas + $1-3M SDE
2. Requests discovery: "Find me opportunities"
3. Backend enqueues discovery jobs
4. Within 60 seconds: BizBuySell results appear in pipeline (listed deals)
5. Within 5 minutes: Google Places results appear (off-market businesses)
6. Each result has: name, estimated revenue range, score, source
7. Listed deals (from BizBuySell) show asking price
8. Off-market targets (from Google Places) show estimated range
9. Buyer clicks "Pass" on a target → removed from active pipeline
10. Buyer clicks "Pursue" → Deal Screening Memo offer appears
11. company_profiles table has new rows from this discovery run
12. WHOIS domain age populated in enrichment_data for discovered businesses
```

---

## SESSION 14: SALE-READINESS SCORING + BUYER PIPELINE INTELLIGENCE
**Build When:** After Session 13
**Estimated CC time:** 4-5 hours
**What ships:** Every business in company_profiles gets a sale-readiness score, buyers see intelligent prioritization

### The Prompt

```
Read CLAUDE.md first.

## CONTEXT
Sessions 1-13 done. Off-market discovery runs. Buyers have a pipeline of discovered targets. Now we make that pipeline intelligent — the businesses most likely to sell float to the top.

## WHAT TO BUILD

### Sale-Readiness Scoring Service
Create `server/services/saleReadinessService.ts`:

The Silver Tsunami: 41-51% of small businesses are owned by Baby Boomers (born 1946-1964, now 62-80). 56% of sellers cite retirement as their primary exit motivation. We can estimate sale-readiness from public signals.

```typescript
async function scoreSaleReadiness(companyProfileId: string): Promise<{
  score: number;          // 0-100
  signals: SaleSignal[];
  tier: 'hot' | 'warm' | 'cold' | 'unknown';
}> {
  // Score based on weighted signals:
  // 
  // TIER 1 - HIGH WEIGHT (total: 60 pts possible)
  // ● Business age: founded 15+ years ago = +15 pts (owner likely aging out)
  //   → from company_profiles.years_in_operation or domain registration date
  // ● Deal status: 'listed' = +20 pts, 'exploring' = +15 pts
  // ● Business is in known consolidation industry (HVAC, dental, veterinary, pest control) = +10 pts
  // ● Domain registration drops to single year (via Whoxy monitoring) = +15 pts
  //
  // TIER 2 - MEDIUM WEIGHT (total: 30 pts possible)
  // ● Google Maps review volume declining (< 50% of previous 6mo volume) = +10 pts
  //   → requires periodic Google Places re-poll (cache the review_count and compare)
  // ● Business hours reduced from previous known hours = +10 pts
  // ● Website last updated > 2 years ago (check page copyright year in enrichment_data) = +5 pts
  // ● Low review count relative to business age (few reviews for 20-year-old business) = +5 pts
  //
  // TIER 3 - SUPPORTING (total: 10 pts possible)
  // ● Google Maps listing shows 'Permanently Closed' risk factors = +5 pts
  // ● Industry experiencing consolidation tailwinds = +5 pts
  //   (HVAC, dental, veterinary, home services, specialty retail)
}
```

Score tiers:
- 70-100: **Hot** (strong sell signals, surface first in buyer pipeline)
- 50-69: **Warm** (moderate signals, worth evaluating)
- 25-49: **Cold** (few signals, include but deprioritize)
- 0-24: **Unknown** (insufficient data)

### Update Pipeline Display
Show sale-readiness tier as a colored indicator in the buyer pipeline:
- 🔴 Hot — "Strong sale signals"
- 🟡 Warm — "Some sale indicators"
- ⚪ Cold — "Limited sale signals"

Reorder pipeline: Hot > Warm > Cold, within each tier sort by thesis_fit_score.

### Periodic Re-scoring Job
pg-boss weekly job:
- For all active discovery_targets in buyer pipelines
- Re-fetch Google Places review count (use cached Place ID)
- Check if review velocity has changed
- Re-run sale-readiness score
- If score changes significantly (>10 points): log the change

### "Why This Is Hot" Explanation
When buyer views a "Hot" target, show the signals that drove the score:
"This business shows multiple sale-readiness indicators: founded 24 years ago, in an active consolidation industry, domain registration just renewed for only 1 year."

## VERIFICATION
1. Create company_profiles with varying characteristics
2. Run scoring: 20-year-old pest control in Texas → score > 60
3. 2-year-old SaaS company in California → score < 30
4. Pipeline view shows Hot/Warm/Cold indicators
5. Hot targets appear first, Cold appear last
6. Score explanation shows relevant signals
```

---

## SESSION 15: LIVING VALUATIONS + QUARTERLY SELLER RE-ENGAGEMENT
**Build When:** After Session 14, when you have 50+ active seller profiles
**Estimated CC time:** 4-5 hours
**What ships:** Seller valuations update over time, driving quarterly re-engagement

### The Prompt

```
Read CLAUDE.md first.

## CONTEXT
Sellers are getting Value Readiness Reports. They're marking improvement actions complete and seeing their range update. Now we add the market-driven component: their valuation shifts based on external conditions even when they haven't done anything.

## WHAT TO BUILD

### Market-Driven Valuation Refresh
Create a quarterly pg-boss job that updates seller valuations:

```typescript
boss.schedule('quarterly-valuation-refresh', '0 9 1 */3 *', async () => {
  // For each active company_profile with a valuation range:
  
  // 1. Pull current BLS QCEW data for NAICS + county
  //    → Has average wage for this industry changed? 
  //    → Wage growth = business value growth signal
  
  // 2. Pull Census SUSB update if newer data available
  //    → Has median revenue per firm changed in this NAICS × employee size band?
  
  // 3. Check buyer demand shift:
  //    → Has the count of active theses matching this NAICS + geography changed?
  //    → More buyers = upward pressure on multiples
  //    → Fewer buyers = downward pressure
  
  // 4. Recalculate valuation range incorporating:
  //    → Original range × wage growth factor × demand signal factor
  
  // 5. If range changed by >5%:
  //    → Update company_profiles.valuation_low, valuation_high, valuation_updated_at
  //    → Queue re-engagement notification
});
```

### Re-engagement Notification
When a seller's valuation range changes due to market conditions:

```
Subject: Your business value estimate just changed

Hi [name],

Your estimated sale value range was updated based on current market conditions:

Previous range: $1.1M – $1.4M
Current range: $1.25M – $1.6M (+$150K)

Why it changed: Buyer demand for pest control businesses in Texas increased 23% 
this quarter, with 3 new active acquirers matching your profile.

Log in to see your full picture →
```

For now: store notifications in a `notifications` table. Display in-app on next login. Email integration comes in a later session.

### "Bizestimate" Feature
When a seller shares their business details publicly (deal_status = 'exploring' or higher), they get a shareable "Bizestimate" card — a simple one-page summary they can show to advisors or lenders:

- Business overview (industry, location, years)
- Current estimated value range
- Value Readiness Score
- "Powered by smbX.ai Engine"
- Last updated date

Generate as a simple PDF or shareable URL.

## VERIFICATION
1. Create company_profile with valuation range
2. Manually trigger quarterly job → range updates
3. Notification appears in in-app notification list
4. Notification explains what changed and why
5. Bizestimate PDF generates and is shareable
```

---

## SESSIONS 16-18: PLATFORM SCALE (Build After Sessions 11-15 Validated)

| Session | What Ships | Priority | Est. CC Time |
|---------|-----------|----------|--------------|
| 16 | Collaboration: RBAC, deal rooms, advisor access, day passes | Medium | 5-6 hrs |
| 17 | Pipeline view: visual gate progression, deal cards, multi-deal management | Medium | 4-5 hrs |
| 18 | Notifications: email service, gate nudges, match alerts, weekly digest | High | 4-5 hrs |

CC prompts for Sessions 16-18 will be written when Sessions 11-15 are verified complete.

---

## CRITICAL REMINDERS FOR ALL CC SESSIONS

1. **No auth.** All endpoints work without JWT through Sessions 1-10. Auth added as thin layer before go-live.
2. **Tailwind CSS v3.** Not v4. If CC tries to upgrade, stop it.
3. **Raw postgres-js.** Not Drizzle, not Prisma.
4. **Railway deploy.** Always test on Railway, not just localhost.
5. **Mobile first.** Test on iPhone after every deploy.
6. **One session at a time.** Don't skip ahead.
7. **iOS keyboard:** NEVER `h-dvh`, NEVER `overflow-hidden` on fixed containers. Use `position:fixed` + `useAppHeight` hook + `shrink-0` flex child for ChatDock.
8. **Company profiles auto-persist.** Never let a conversation with real business data end without checking that company_profiles was updated.
9. **Google Places — official API only.** Do NOT use SerpAPI (Google lawsuit filed Dec 2025). Do NOT build persistent databases of Google data — only store Place IDs.
10. **The sourcing engine is pg-boss.** Not LangGraph. Not Temporal. All discovery jobs are deterministic queue workers.
11. **Commit after every session.** Don't accumulate uncommitted code.
12. **ANTHROPIC_API_KEY + Stripe test keys** must be in Railway env vars before Sessions 1 and 6 respectively.
13. **TEST_MODE=true** bypasses Stripe for development and testing.

---

## THE STRATEGIC PICTURE

When Sessions 1-10 are complete, you have:
- A chat platform where Yulia delivers real M&A intelligence
- Free deliverables (Value Readiness Report, Thesis Document) that make users stay
- Paid deliverables (Full Valuation, SBA Model, Deal Screening Memo) that generate revenue
- A database that fills itself: every conversation → company_profiles or theses
- Buyer demand signals visible to sellers: validation that real buyers exist

When Sessions 11-16 are complete, you have:
- A living platform that businesses return to because it updates
- Off-market discovery: buyers find businesses that were never listed
- Sale-readiness scoring: the right businesses float to the top
- Living valuations: sellers have a reason to come back every quarter
- This is the moat — not any single feature, but the compound intelligence that grows with every user

**The platform intelligence is self-filling.** No scraping required, no paid data feeds required for the core experience. Every seller conversation, every buyer thesis, every marked improvement action makes the platform smarter. That's the flywheel. That's the moat.
```
