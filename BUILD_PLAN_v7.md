# smbx.ai — BUILD PLAN v7: Execution Chunks

### Last Updated: February 26, 2026
### Supersedes: BUILD_PLAN_v6 for execution order only
### Purpose: Ordered work chunks that Claude Code can execute autonomously in 4-5 hour sessions

---

## HOW TO USE THIS DOCUMENT

Each chunk below is a self-contained CC session. Read the chunk, execute every step, verify at the end. BUILD_PLAN_v6 remains the master spec for design tokens, pricing, methodology, and competitive positioning. METHODOLOGY_V17 remains authoritative for domain logic. This document is purely **what to build, in what order, with what instructions.**

**Source-of-truth hierarchy (unchanged):**
1. `smbx-homepage-v12.html` → visual design (colors, spacing, typography, component patterns)
2. `BUILD_PLAN_v6.md` → master spec (everything: roadmap, pricing, data architecture)
3. `METHODOLOGY_V17.md` → domain logic (gates, scoring, journeys, financial formulas)
4. `YULIA_PROMPTS_V2.md` → runtime prompts (league personas, gate scripts, deliverable schemas)
5. **This file → execution order and CC session instructions**

---

## iOS MOBILE CHAT ARCHITECTURE — DO NOT BREAK

The mobile chat keyboard handling has been solved and deployed. This is the proven pattern — every chunk must preserve it:

- **Root container** (`#app-root`): `position: fixed; left: 0; right: 0; top: 0; height: 100%`
- **JavaScript hook** (`useAppHeight.ts`): listens to `window.visualViewport` resize/scroll events, sets `app.style.height = vv.height + 'px'` and `app.style.top = vv.offsetTop + 'px'`
- **Layout**: flex column → header (shrink-0) → scroll area (flex-1 overflow-y-auto min-h-0) → dock (shrink-0)
- **The dock is a FLEX CHILD** inside the container, **NOT** position:fixed
- **DO NOT** use position:fixed on the dock/input bar
- **DO NOT** use 100dvh
- **DO NOT** add visualViewport hacks to move the dock
- The container handles everything. A working test page exists at `/test.html`.
- Public page and internal chat share **ONE dock component** (`ChatDock.tsx`)

---

## AUDIT SNAPSHOT (Feb 26, 2026)

**Working backend (80%):** Anonymous sessions, SSE streaming, chat morph, field extraction, seven-factor scoring, league classification, 22-gate registry, gate readiness, 983-line gate prompts, 12 agentic tools, 659-line capital stack engine, 9 deliverable generators, wallet + Stripe + webhooks, ~70 menu items, document upload + extraction, paywall service.

**Broken / missing:**
| # | Gap | Impact | Effort |
|---|-----|--------|--------|
| 1 | Front-end stuck on V5 multi-page | Product doesn't match design | 3-5 days |
| 2 | Worker service not deployed | Paid deliverables never process | 4 hrs |
| 3 | No PDF export | Deliverables render as JSON | 2-3 days |
| 4 | Inline signup not in chat flow | Conversion breaks immersion | 1 day |
| 5 | Model routing not implemented | All calls = Sonnet, 3-4× cost | 4-6 hrs |
| 6 | Dock too small, only 4 tools | ✅ FIXED (this session) | Done |

---

## CHUNK EXECUTION ORDER

```
CHUNK 1  ✅  Dock Upgrade (done this session — 8 tools, bigger input, v12 CSS)
CHUNK 2      V12 SPA Shell + Design System
CHUNK 3      Journey Views + Deal Cards → Chat
CHUNK 4      Chat View Polish + Message Styling
CHUNK 5      Inline Signup Card + Conversion Flow
CHUNK 6      Worker Service Deployment
CHUNK 7      Model Routing + Cost Optimization
CHUNK 8      PDF Export for Deliverables
CHUNK 9      Streaming UX + Error States
CHUNK 10     Cleanup, Seeds, Config, E2E Smoke Tests
```

---

## ═══════════════════════════════════════════════════
## CHUNK 1: Dock Upgrade ✅ COMPLETE
## Time: Done | Status: CSS + Component updated
## ═══════════════════════════════════════════════════

**What was done:**
- ChatDock.tsx expanded from 4 tools → 8 tools with grouped sections ("Start with Yulia" / "Tools")
- Journey starters: Sell my business, Buy a business
- Utility tools: Business valuation, SBA loan check, Capital structure, Search for a business, Upload financials, Post-acquisition help
- Textarea: 17px/18px font, 44px min-height, 20px padding
- Buttons: w-9 h-9 (36px), 16px send icon
- Dock card max-width: 720px (was 640px)
- CSS: terra border (was gold), stronger shadow, proper v12 focus glow
- Root CSS variables updated to match v12 prototype exactly
- Old tokens removed: stone, stone-light, cream-deep, warm-white

**⚠️ NOT changed (iOS safe):** forwardRef pattern, useImperativeHandle, textarea onChange auto-resize, env(safe-area-inset-bottom), onKeyDown Enter, click-outside-to-close, hidden file input pattern.

---

## ═══════════════════════════════════════════════════
## CHUNK 2: V12 SPA Shell + Design System
## Time: 4-5 hours | Depends on: Chunk 1
## ═══════════════════════════════════════════════════

**Goal:** Replace V5 multi-page architecture with V12 single-page app. After this chunk: topbar (logo + login only), scroll area, dock — three states (Landing, Journey, Chat) in the same scroll area. No more /sell, /buy, /raise, /integrate public routes.

### Step 1: Update `client/index.html`
Replace the Google Fonts import. Remove any Playfair Display or Instrument Sans references:
```html
<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

### Step 2: Create `client/src/components/public/TopbarV12.tsx`
The v12 topbar — minimal, no nav links:
- **Default state:** Logo left (`smb` in --text + `x` in --terra + `.ai` in --text, Inter 800, 26px mobile / 28px desktop), login icon right (user SVG, 24px circle)
- **Journey/chat state:** Back button appears left (`← Back` in muted text, 15px). In chat state: logo moves to center (position absolute, left 50%, translateX(-50%)), "Yulia" subtitle appears below (13px, muted)
- Border-bottom: transparent default, `var(--border)` in chat state
- Height: ~52px mobile, ~56px desktop. `flex-shrink: 0`
- **Props:** `phase: 'landing' | 'journey' | 'chat'`, `onBack: () => void`, `onLogin: () => void`
- Reference: `smbx-homepage-v12.html` lines 28-56 for exact CSS

### Step 3: Create `client/src/pages/public/SPA.tsx`
This is the new home page — single component managing three states:

```typescript
type Phase = 'landing' | 'journey' | 'chat';
type Journey = 'sell' | 'buy' | 'agency' | 'intelligence';

// State
const [phase, setPhase] = useState<Phase>('landing');
const [activeJourney, setActiveJourney] = useState<Journey | null>(null);

// Uses existing ChatContext for anonymous chat — DO NOT rebuild ChatContext
// Uses existing useAnonymousChat hook — DO NOT rebuild
// Uses existing useAppHeight hook — keeps iOS working
```

**Layout structure (MUST follow iOS pattern):**
```
<div id="app-root">          ← useAppHeight manages this
  <TopbarV12 />              ← shrink-0
  <div className="scroll-area"> ← flex-1 overflow-y-auto min-h-0
    {phase === 'landing' && <Landing />}
    {phase === 'journey' && <JourneyView />}
    {phase === 'chat' && <ChatMessages />}
  </div>
  <ChatDock />               ← shrink-0, NOT position:fixed
</div>
```

### Step 4: Landing state (inside SPA.tsx or separate component)
- H1: "Sell a business. Buy a business. Raise capital." — Inter 800, 44px mobile / 48px tablet / 54px desktop, letter-spacing -.03em, color --text
- Subtitle: "Meet Yulia, your expert M&A advisor." — Inter 400, 18px mobile / 20px desktop, color --muted
- 4 action cards in grid (2×2 mobile, 4×1 desktop):
  1. **Sell my business** — briefcase icon, terra
  2. **Buy a business** — cart icon, terra
  3. **Agency & automation** — star icon, terra
  4. **AI intelligence** — cube/chip icon, terra
- Cards: white bg, shadow-card, border-radius 16px, hover: shadow-md + translateY(-1px)
- Vertically centered in scroll area: `min-height: calc(100dvh - 52px - 80px)` with flexbox centering
- Fade-up animation on load (existing `homeFadeUp` keyframe)
- Reuse existing `home-agrid` CSS for the grid layout

### Step 5: Update `App.tsx` routing
```
REMOVE routes: /sell, /buy, /raise, /integrate, /how-it-works, /enterprise
CHANGE: / → <SPA /> (new component)
KEEP: /login, /signup, /chat/:id?, /pricing, /legal/privacy, /legal/terms
```
Note: Keep /pricing as a standalone page for now (users may link to it directly). Move its content into a journey view later.

### Step 6: Remove V5 components from SPA imports
The SPA does NOT use: `PublicNav.tsx`, `Footer.tsx`, `HomeSidebar.tsx`, `PublicLayout.tsx`. These can stay in the codebase (other routes may still use them) but the SPA should not import them.

### Verify:
- Load `/` → see landing with 4 cards, topbar with logo + login, dock at bottom
- No Playfair Display anywhere (check computed styles in DevTools)
- No nav links, no footer
- Click login icon → navigates to /login
- iOS Safari: dock stays above keyboard, scroll area fills remaining space
- Desktop: landing content centered, dock prominent at bottom

---

## ═══════════════════════════════════════════════════
## CHUNK 3: Journey Views + Deal Cards → Chat
## Time: 4-5 hours | Depends on: Chunk 2
## ═══════════════════════════════════════════════════

**Goal:** All 4 journey views render inside the SPA. Clickable deal-size cards pre-fill the dock and auto-send, morphing into chat. Full Landing → Journey → Chat flow works.

### Step 1: Journey View Component
Create `client/src/components/public/JourneyView.tsx` (or render inline in SPA.tsx):
- **Props:** `journey: Journey`, `onDealClick: (msg: string) => void`, `onBack: () => void`
- **Data source:** The `J` constant from `Home.tsx` — copy it into the SPA or into a shared `journeyData.ts` file. This content is excellent and shouldn't be rewritten.
- **Layout per v12 spec:**
  - Label tag: `terra-soft` bg, terra text, 12px font-weight 700, uppercase, px-3 py-1, rounded-full
  - H1 with `<em>` rendered as terra accent: Inter 800, 36px mobile / 44px tablet / 48px desktop
  - Subtitle: 17px, color --text-mid, max-width 680px
  - Yulia insight box: gradient bg (`linear-gradient(135deg, #FFF8F4, #FFF0EB)`), rounded-2xl, padding 28px, left border 3px terra. YuliaAvatar (32px terra circle with "Y") inline, text in italic
  - Phased sections: label in 12px uppercase muted, title in Inter 700 24px with `<em>` in terra, cards below
  - Cards: white bg, shadow-card, rounded-2xl, padding 28px, hover: shadow-md + translateY(-1px)
  - Quote block at bottom: 20px italic text, muted attribution
- Use existing CSS classes: `.home-j-insight`, `.home-j-card`, `.home-j-deal`, `.home-j-quote`, `.home-j-heading`

### Step 2: Deal-size example cards
Each journey's last section has `deals` array with `{sz, tp, rs, msg}`:
- Render as a flex-wrap row of clickable cards
- Card shows: deal size (large, bold), business type, key metric
- On click: **pre-fill dock** with `msg` value AND **auto-send**
- Auto-send triggers the morph to chat state
- Implementation: pass `msg` up to SPA via `onDealClick` prop → SPA calls dockRef.current methods to set text → calls the onSend handler

### Step 3: Dock placeholder per journey
When a journey is active, update the dock placeholder:
- sell → `"Tell Yulia about your business…"`
- buy → `"Tell Yulia what you're looking for…"`
- agency → `"Tell Yulia what you need built…"`
- intelligence → `"Ask about any industry or market…"`
- landing (no journey) → `"Tell Yulia about your deal…"`

### Step 4: Morph transitions
**Landing → Journey:** Card clicked → `setPhase('journey')`, `setActiveJourney(key)`. Landing content fades out (300ms, opacity 0 + translateY -10px), journey content fades in. Topbar shows back button.

**Journey → Chat:** User types in dock and sends → `setPhase('chat')`. Journey content fades out, chat messages appear. Topbar enters chat-mode (logo centered, "Yulia" subtitle).

**Chat → Back:** Back button → return to landing, reset state. If there are messages, consider warning "this will start a new conversation" (or just allow back to landing while preserving chat — let them re-enter chat by typing again).

### Step 5: Journey context → Yulia
When sending the first message, pass the journey context to the anonymous chat:
- The existing `useAnonymousChat` hook's `sendMessage` should accept a `sourcePage` parameter
- Map journey keys: sell → '/sell', buy → '/buy', agency → '/raise', intelligence → '/integrate'
- This feeds into `promptBuilder` on the server which already handles page-specific system prompts

### Step 6: Journey scroll behavior
- Journey content can be long (5+ sections with multiple cards each)
- Scroll area must scroll naturally
- Padding-bottom on scroll content must account for dock height (~80-90px)
- On journey enter: scroll to top of scroll area
- On chat enter: scroll to bottom (newest message)

### Verify:
- Click "Sell" card on landing → journey content loads with all 6 phases, deal examples, quote
- Click "$1.5M Pest Control" deal card → dock fills → auto-sends → morphs to chat → Yulia responds with pest control context
- Back button from journey → returns to landing
- Back button from chat → returns to landing
- All 4 journeys render correctly with proper styling
- Mobile: journey scrolls, dock stays at bottom, keyboard works
- Desktop: content centered, max-width 960px

---

## ═══════════════════════════════════════════════════
## CHUNK 4: Chat View Polish + Message Styling
## Time: 4-5 hours | Depends on: Chunk 3
## ═══════════════════════════════════════════════════

**Goal:** Chat messages render beautifully inside the SPA scroll area. Streaming works. Markdown renders. Auto-scroll works. The chat experience feels native, not bolted on.

### Step 1: Chat message components inside SPA
When in chat phase, messages render in the scroll area:
- Container: max-width 640px, centered, padding 20px
- **User message:** terra bg (#D4714E), white text, rounded-[20px_20px_6px_20px], right-aligned, max-width 82%, padding 14px 18px, text 16px, shadow-sm
- **Yulia message:** white bg, shadow-card, rounded-[20px_20px_20px_6px], left-aligned, max-width 90%, padding 16px 20px
- **Yulia avatar:** 32px circle, terra bg, white "Y" text (12px, font-weight 700). Show left of first Yulia message in a group, then hide for consecutive Yulia messages
- **Typing indicator:** 3 dots, 8px circles, faint color, pulse animation (existing `homeTypingDot` keyframe)
- **Message slide-in:** Use existing `homeSlideIn` animation on new messages

### Step 2: Streaming content rendering
- The existing `useAnonymousChat` hook provides `streamingContent` and `messages`
- During streaming: show a Yulia message bubble with content updating word-by-word
- After stream completes: replace with full message from `messages` array
- Render Yulia content with `react-markdown` (already in deps) — apply `.home-yt` CSS class for markdown styling (paragraphs, bold, lists)

### Step 3: Auto-scroll behavior
- On new message: scroll to bottom of scroll area
- During streaming: keep scrolled to bottom as content grows
- If user has scrolled UP manually: don't force scroll (respect their position)
- Implementation: track `isNearBottom` (within 100px of bottom). Only auto-scroll if near bottom.

### Step 4: Messages remaining indicator
When < 5 anonymous messages remain:
- Show subtle text below messages, above dock: `"X messages remaining · Create account for unlimited"`
- Style: 13px, muted color, centered, padding 8px
- Only visible when `phase === 'chat'` and `messagesRemaining <= 5`
- Clicking "Create account" triggers inline signup (Chunk 5)

### Step 5: Empty chat state
When user first enters chat (no messages yet — e.g., they typed directly from landing):
- Show user's message immediately (right-aligned, terra)
- Show typing indicator for Yulia
- As streaming starts, replace typing indicator with Yulia's response

### Step 6: Reconnection / session restore
- On page load, `useAnonymousChat` checks localStorage for session ID
- If session exists with messages: restore to chat phase, show previous messages
- If session expired: start fresh from landing
- Handle gracefully: no flash of landing then jump to chat

### Verify:
- Send a message → user bubble appears right-aligned in terra → typing indicator → Yulia responds left-aligned in white
- Markdown renders: bold, paragraphs, lists display correctly
- Streaming: text appears word by word, scrolls to keep up
- 20+ messages: scroll works, older messages accessible by scrolling up
- Refresh page: session restores, messages reload, lands in chat phase
- Mobile Safari: keyboard opens, messages scroll, dock stays visible

---

## ═══════════════════════════════════════════════════
## CHUNK 5: Inline Signup Card + Conversion Flow
## Time: 4-5 hours | Depends on: Chunk 4
## ═══════════════════════════════════════════════════

**Goal:** When Yulia triggers conversion (after delivering value), a signup card appears INSIDE the chat — not a redirect, not a modal. On success, the anonymous session converts to authenticated and the user transitions to the full tool.

### Step 1: Create `client/src/components/chat/InlineSignupCard.tsx`
Renders as a special message in the chat flow:
- Design: white bg card, terra accent border-left (3px), slightly wider than normal messages (max-width 95%), rounded-2xl, shadow-md, padding 24px
- Header: "Save your progress and continue with Yulia" (Inter 600, 18px, --text)
- Subtext: "Create a free account to unlock unlimited conversations, your deal workspace, and deliverables." (15px, --text-mid)
- Fields: email input + password input (stacked, rounded-xl, border --border, focus: terra border + glow)
- Submit button: "Continue" — full-width, terra bg, white text, rounded-xl, 48px height
- Divider: "or" text with horizontal lines
- Google SSO button: "Continue with Google" — white bg, border --border, Google icon, full-width
- Already have account? "Sign in" link in terra
- Error display: red text below fields if auth fails

### Step 2: Trigger conditions
Show the inline signup card when:
- `messagesRemaining <= 3` (approaching limit)
- OR `showSaveProgress === true` (Yulia's system prompt triggers this after ~10 messages when real value has been delivered)
- Card appears as a message in the conversation flow (between Yulia's messages)
- Only show ONCE per session (track with `hasShownSignup` state)

### Step 3: Wire to existing auth
The existing `useAuth` hook has:
- `register(email, password)` — creates account
- `login(email, password)` — signs in
- `loginWithGoogle()` — Google SSO (if GOOGLE_CLIENT_ID env var set)

On successful auth:
1. Call `POST /api/chat/anonymous/:sessionId/convert` with auth token → copies messages to a conversation record linked to new user
2. Store the returned `conversationId`
3. Navigate to `/chat/${conversationId}` — this is the full authenticated chat view
4. The transition should feel seamless: same messages, same context, but now with the full sidebar, deal workspace, etc.

### Step 4: Smooth post-auth transition
After successful auth + session convert:
- Brief "Welcome" animation (0.5s, card content morphs into success state: checkmark + "You're all set")
- Then navigate to `/chat/${conversationId}`
- The authenticated Chat page should detect "just converted" and NOT show an empty state — it should load the converted conversation immediately

### Step 5: Handle edge cases
- User dismisses signup card: allow, but show again after 3 more messages or at limit
- User hits 20-message limit without signing up: show a full-width card that says "Create a free account to continue" with no dismiss option. The dock input is disabled (greyed out placeholder: "Create an account to continue…")
- Network error on signup: show inline error, allow retry
- Google SSO popup blocked: fall back to email/password with a note

### Verify:
- Chat to 17 messages → signup card appears inline
- Fill email + password → submit → account created → session converted → navigates to /chat with messages preserved
- Dismiss card → continue chatting → card reappears at message 20 (undismissable)
- Google SSO works (if configured)
- Error states render properly

---

## ═══════════════════════════════════════════════════
## CHUNK 6: Worker Service Deployment
## Time: 4-5 hours | Depends on: Nothing (can run in parallel with UI chunks)
## ═══════════════════════════════════════════════════

**Goal:** Deliverable purchases actually get processed. User pays → job enqueues → worker picks it up → deliverable generates → status updates to "completed."

### Step 1: Add worker build scripts to `package.json`
```json
{
  "scripts": {
    "build": "tsc && vite build",
    "build:worker": "tsc -p tsconfig.worker.json",
    "start:worker": "node dist/server/worker.js"
  }
}
```

### Step 2: Create `tsconfig.worker.json`
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "."
  },
  "include": ["server/**/*.ts"],
  "exclude": ["client/**/*", "node_modules"]
}
```

### Step 3: Verify worker.ts compiles
Run `npm run build:worker` locally. Fix any import issues. The worker.ts file (356 lines) should compile cleanly — it imports from:
- `./services/jobQueue` (pg-boss)
- `./generators/*` (all 9 generators)
- Database connection
Ensure all paths resolve after compilation.

### Step 4: Create Railway worker service
In Railway dashboard:
- Add new service in the same project
- Source: same GitHub repo
- Build command: `npm install && npm run build:worker`
- Start command: `npm run start:worker`
- Environment variables: same as web service (DATABASE_URL, ANTHROPIC_API_KEY, etc.)
- Resource: ~0.25 vCPU, 512MB RAM (worker is lightweight)

Alternatively, if using Dockerfile approach:
```dockerfile
# Dockerfile.worker
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY dist/server ./dist/server
CMD ["node", "dist/server/worker.js"]
```

### Step 5: Verify the job queue connection
The worker needs to connect to the SAME PostgreSQL database as the web service. pg-boss creates its own schema (`pgboss`). Verify:
- `jobQueue.ts` uses `noScheduling: true, noSupervisor: true` in client mode (web service)
- `worker.ts` uses full pg-boss with scheduling and monitoring (worker service)
- Both connect to the same DATABASE_URL

### Step 6: End-to-end test
1. Create a test user with wallet balance
2. Purchase a deliverable (e.g., valuation report) via the API
3. Check pg-boss queue: job should appear
4. Worker should pick it up within seconds
5. Generator runs, produces JSON content
6. Deliverable record updates: status → "completed", content populated
7. Check in the app: deliverable viewer shows the content

### Step 7: Error handling verification
- What happens if the generator fails? Worker should update status to "failed" with error message
- What happens if the worker crashes mid-generation? pg-boss has retry logic
- What happens if the database connection drops? Worker should reconnect

### Verify:
- `npm run build:worker` compiles cleanly
- Worker starts and connects to pg-boss
- Purchase flow: wallet debit → job enqueue → generation → completion
- Deliverable viewer shows real content
- Failed generation: status updates to "failed" with error message
- Railway logs show worker processing jobs

---

## ═══════════════════════════════════════════════════
## CHUNK 7: Model Routing + Cost Optimization
## Time: 4-5 hours | Depends on: Chunk 6
## ═══════════════════════════════════════════════════

**Goal:** Route AI calls to the right model tier. Haiku for cheap background tasks, Sonnet for conversation, Opus for premium deliverables. Cuts API costs 60-70%.

### Step 1: Update `server/services/aiService.ts`
Currently hardcodes `claude-sonnet-4-5-20250929` for all calls. Add a model parameter:
```typescript
type ModelTier = 'haiku' | 'sonnet' | 'opus';

const MODELS: Record<ModelTier, string> = {
  haiku: 'claude-haiku-4-5-20251001',
  sonnet: 'claude-sonnet-4-5-20250929',
  opus: 'claude-opus-4-6',
};
```

### Step 2: Route by task type
Update `callClaude()` and `streamAnonymousResponse()` to accept a model tier:

| Task | Model | Rationale |
|------|-------|-----------|
| Classification, field extraction | Haiku | Simple structured output, $1/M vs $3/M |
| Seven-factor scoring | Haiku | Numeric scoring with rubric |
| League classification | Haiku | Decision tree with clear rules |
| Journey detection | Haiku | Intent classification |
| Anonymous conversation | Sonnet | Quality matters for conversion |
| Authenticated conversation | Sonnet | Core experience |
| Valuation report narrative | Sonnet | Analysis + writing |
| SBA bankability narrative | Sonnet | Analysis + writing |
| CIM generation | Opus | Premium deliverable, must be excellent |
| LOI generation | Sonnet | Legal language but templated |

### Step 3: Update callers
- `fieldExtractor.ts`: change to `callClaude(prompt, 'haiku')`
- `sevenFactorScoring.ts`: change to `callClaude(prompt, 'haiku')`
- `leagueClassifier.ts`: change to `callClaude(prompt, 'haiku')`
- `journeyDetection.ts`: change to `callClaude(prompt, 'haiku')`
- `cimGenerator.ts`: change to `callClaude(prompt, 'opus')`
- All others: default to Sonnet (existing behavior)

### Step 4: Add prompt caching headers (if available)
For system prompts that are reused across calls (Yulia's base personality, gate prompts), add Anthropic's prompt caching:
```typescript
// In the API call
system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }]
```
This can reduce input token costs by up to 90% for cached portions.

### Step 5: Verify
- Anonymous chat still works (Sonnet)
- Field extraction still extracts correctly (Haiku)
- CIM generator produces higher quality output (Opus)
- Check Railway logs for model being used per request
- Calculate: if 80% of calls are Haiku, 15% Sonnet, 5% Opus, expected cost should be ~30-40% of current

---

## ═══════════════════════════════════════════════════
## CHUNK 8: PDF Export for Deliverables
## Time: 4-5 hours | Depends on: Chunk 6
## ═══════════════════════════════════════════════════

**Goal:** Deliverables download as professional branded PDF documents, not JSON in a modal.

### Step 1: Install PDF generation library
Use `@react-pdf/renderer` for server-side PDF generation (Node.js compatible, no headless browser needed):
```bash
npm install @react-pdf/renderer
```
Alternative: `puppeteer` for HTML-to-PDF (heavier but more design control). Choose based on Railway memory constraints (~512MB for worker).

### Step 2: Create PDF templates
Start with the two highest-value deliverables:

**Valuation Report PDF (`server/templates/valuationReportPDF.ts`):**
- Cover page: smbx.ai logo, "Business Valuation Report", business name, date, "Prepared by Yulia, AI M&A Advisor"
- Executive summary page
- Financial analysis (revenue, SDE/EBITDA, add-backs table)
- Valuation methodologies (each with range and explanation)
- Seven-factor scoring (radar chart or table)
- Market context section
- Disclaimer / limitations page

**CIM PDF (`server/templates/cimPDF.ts`):**
- Cover page with confidentiality notice
- Table of contents
- Executive summary
- Business overview
- Financial performance (tables, charts)
- Market analysis
- Growth opportunities
- Transaction overview

### Step 3: Integrate into worker pipeline
In `worker.ts`, after a generator produces JSON content:
1. Pass the JSON to the PDF template
2. Render to PDF buffer
3. Upload PDF to a storage location (Railway volume or S3)
4. Update deliverable record: `pdf_url = '/api/deliverables/:id/pdf'`

### Step 4: Add PDF download endpoint
```typescript
// server/routes/deliverables.ts
router.get('/:id/pdf', requireAuth, async (req, res) => {
  const deliverable = await getDeliverable(req.params.id);
  if (!deliverable?.pdf_url) return res.status(404).send('PDF not generated');
  // Stream the PDF file
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${deliverable.slug}.pdf"`);
  // ... serve file
});
```

### Step 5: Update DeliverableViewer.tsx
Add a "Download PDF" button:
- Position: top-right of the viewer modal
- Style: terra bg, white text, rounded-lg, download icon
- Shows when `deliverable.pdf_url` exists
- Falls back to current JSON rendering when no PDF available

### Verify:
- Purchase a valuation report → worker generates → PDF created → download works
- PDF looks professional (branded, formatted, readable)
- CIM PDF has all sections from the generator output
- Download works on mobile Safari
- Graceful fallback when PDF isn't ready yet

---

## ═══════════════════════════════════════════════════
## CHUNK 9: Streaming UX + Error States
## Time: 4-5 hours | Depends on: Chunk 4
## ═══════════════════════════════════════════════════

**Goal:** The perceived responsiveness goes from "is it working?" to instant feedback. Error states are handled gracefully.

### Step 1: Immediate typing indicator
In `server/routes/anonymousChat.ts`, send a typing SSE event BEFORE the Claude API call:
```typescript
res.write(`data: ${JSON.stringify({ type: 'typing' })}\n\n`);
// Then start the Claude API call
```
On the client, show the typing indicator as soon as this event arrives (before any content streams).

### Step 2: Connection error handling
If the SSE connection drops mid-stream:
- Show a subtle error banner: "Connection lost. Retrying…" (not a modal, not blocking)
- Attempt reconnection after 2 seconds
- If reconnection fails after 3 attempts: "Something went wrong. Your message was saved — try refreshing."
- Style: cream bg with terra-soft border, centered below messages

### Step 3: Rate limit UX
When the anonymous session hits the rate limit (20 messages):
- Server returns 403 with `{ error: 'limit_reached', messagesUsed: 20, maxMessages: 20 }`
- Client shows the undismissable signup card (from Chunk 5)
- Dock input becomes disabled: greyed placeholder "Create an account to continue…"

### Step 4: API error states
- Anthropic API rate limit (429): "Yulia is busy — please wait a moment" with auto-retry in 5 seconds
- Anthropic API error (500): "Something went wrong on our end. Try again." with retry button
- Network offline: "You're offline. Your messages will be sent when you reconnect."

### Step 5: Loading states
- On page load with session restore: show a brief loading state (logo pulse animation) while messages load from server
- On first message send: show typing indicator immediately (don't wait for server response)
- On journey card click: fade transition should feel instant (no loading spinner)

### Step 6: Error boundary
Add a React error boundary around the SPA component:
```typescript
class ChatErrorBoundary extends React.Component {
  // Catch render errors
  // Show: "Something went wrong. Refresh to try again." with refresh button
  // Log error details to console (or Sentry when added)
}
```

### Verify:
- Send message → typing indicator appears within 200ms
- Kill network mid-stream → error banner shows → reconnect attempt
- Send 20 messages → signup card appears → dock disabled
- Refresh with existing session → messages load cleanly, no flash

---

## ═══════════════════════════════════════════════════
## CHUNK 10: Cleanup, Seeds, Config, Smoke Tests
## Time: 4-5 hours | Depends on: All previous chunks
## ═══════════════════════════════════════════════════

**Goal:** Clean deployment, no conflicts, everything verified end-to-end.

### Step 1: Delete conflicting seed system
- Delete `server/seed.ts` (uses Drizzle ORM, banned on Railway)
- Ensure migration 006 is the sole source of menu item seeding
- Verify all ~70+ menu item slugs in migration 006 match the dispatcher cases in `worker.ts`

### Step 2: Move static configuration to env vars
- `PRIME_RATE`: currently hardcoded to 7.50% in `capitalStackEngine.ts` and `sbaBankability.ts`. Move to `process.env.PRIME_RATE || '7.50'`
- Document in README: "Update PRIME_RATE monthly until FRED API integration (Phase G)"

### Step 3: Align anonymous chat limits with spec
BUILD_PLAN_v6 says:
- "Max 10 messages per anonymous session" (code allows 20)
- "Anonymous Yulia responses capped at ~300 tokens" (code sets 1500)

**Decision needed from Paul:** Keep 20/1500 (more generous, better conversion?) or align to 10/300 (cheaper, forces signup sooner). For now, set to a middle ground unless Paul specifies:
- 15 messages per session
- 800 token max for anonymous responses

### Step 4: Remove old V5 route pages (optional)
If all traffic is routing through the SPA correctly, consider removing:
- `pages/public/Sell.tsx`, `Buy.tsx`, `Raise.tsx`, `Integrate.tsx`, `HowItWorks.tsx`, `Enterprise.tsx`
- Remove their routes from App.tsx
- Keep: `Login.tsx`, `Signup.tsx`, `Pricing.tsx`, `Privacy.tsx`, `Terms.tsx`

### Step 5: E2E smoke test
Using the existing Playwright scaffold in `e2e/`:
- **Test 1:** Load `/` → landing renders → 4 cards visible → dock visible
- **Test 2:** Click "Sell" card → journey content loads → back button works
- **Test 3:** Type in dock → send → morphs to chat → Yulia responds (mock SSE)
- **Test 4:** Load `/login` → login form renders
- **Test 5:** Load `/pricing` → pricing page renders
- **Test 6:** 20 messages → signup card appears → dock disabled

### Step 6: Final CSS audit
Grep the entire codebase for old design tokens and fix:
```bash
grep -rn "Playfair\|Instrument Sans\|cream-deep\|warm-white\|stone-light\|#DA7756\|#E8E4DC\|#F0EDE6\|#4A4843\|#7A766E\|#E0DCD4" client/src/
```
Replace any stragglers with v12 tokens.

### Step 7: Railway deployment verification
- Push to GitHub → Railway auto-deploys
- Web service: builds and starts correctly
- Worker service: builds and starts correctly (if deployed in Chunk 6)
- Test on real mobile device (iPhone Safari)
- Test on desktop Chrome and Firefox

### Verify:
- Clean build with no warnings
- All routes work: /, /login, /signup, /chat, /pricing
- No old V5 visual artifacts (Playfair, nav links, footer on SPA)
- Worker processes at least one test job
- Mobile Safari: full flow works end to end

---

## EFFORT SUMMARY

| Chunk | Item | Hours | Blocks Launch? |
|-------|------|-------|----------------|
| 1 ✅ | Dock upgrade | Done | — |
| 2 | V12 SPA shell + design system | 4-5 | YES |
| 3 | Journey views + deal cards | 4-5 | YES |
| 4 | Chat view polish | 4-5 | YES |
| 5 | Inline signup + conversion | 4-5 | YES |
| 6 | Worker service deployment | 4-5 | YES (for paid features) |
| 7 | Model routing | 4-5 | No (cost optimization) |
| 8 | PDF export | 4-5 | SOFT YES |
| 9 | Streaming UX + errors | 4-5 | SOFT YES |
| 10 | Cleanup + smoke tests | 4-5 | YES (launch gate) |

**Total: ~40-45 hours across 9 remaining chunks**

### Parallelization
- **Chunks 2-5** are sequential (each builds on the previous UI)
- **Chunk 6** (worker) can run in parallel with UI chunks
- **Chunks 7-8** can run in parallel after Chunk 6
- **Chunk 9** can run after Chunk 4
- **Chunk 10** runs last

### Critical path: Chunks 2 → 3 → 4 → 5 → 10 = launch-ready frontend
### Secondary path: Chunk 6 → 7 + 8 = launch-ready backend

---

## WHAT'S CORRECTLY DEFERRED (NOT in these chunks)

Per BUILD_PLAN_v6 phasing, these are post-launch:
- **Phase F:** Value Builder, optimization plans, quarterly re-scoring
- **Phase G:** Government data APIs, LangGraph.js agents, daily briefings, engagement tiering
- **Phase H:** GDELT events, deal pacing, Lendio/Guidant partnerships
- **Phase I:** SEC EDGAR, IRS SOI, pgvector, portfolio analytics
- **Phase J:** Multi-agent research, ML matching, data products

---

*BUILD_PLAN_v7 — February 26, 2026*
*Execution plan. 10 chunks. ~45 hours to launch-ready.*
