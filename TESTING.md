# smbx.ai — Testing Tracker
**Last updated:** 2026-03-28
**Tester:** Paul
**Environment:** Production (Railway) — smbx-production.up.railway.app
**Devices:** MacBook (Chrome/Safari), iPhone (Safari), Android (Chrome)

---

## How to Use This Document

1. Test each section below in order
2. For each issue found, add an entry to the **Issues Log** at the bottom
3. Use the issue template — every field matters for fixing
4. Screenshots go in `/testing/screenshots/` (create the folder, drop files there)
5. Reference issues by ID (e.g., `T-001`) when discussing with Claude Code

---

## Test Plan

### 1. HOME PAGE & FIRST IMPRESSION
- [ ] Home page loads on desktop (dot field visible, logo in sidebar, greeting text)
- [ ] Home page loads on mobile (responsive, no horizontal scroll)
- [ ] Dark mode toggle works (dots visible in both modes)
- [ ] X logo in sidebar navigates to home
- [ ] Suggestion chips visible ("I want to sell my business", etc.)
- [ ] Typing in the chat dock works (focus, keyboard appears on mobile)
- [ ] Journey pages load from sidebar (Sell, Buy, Raise, Integrate, Advisors, How, Pricing)
- [ ] Below-the-fold content renders on journey pages

### 2. CONVERSATION QUALITY (The Critical Test)
Test 10 different openers. For each, evaluate:
- Does Yulia respond specifically (not generic "I'd be happy to help")?
- Does she follow the 4-beat pattern (Analysis → Options → Implications → User Decides)?
- Does she save data immediately (call update_deal_field)?
- Does she classify the league when she has enough data?
- Does she generate a free deliverable proactively?

**Sell openers to test:**
- [ ] "I want to sell my HVAC business doing $2M revenue in Atlanta"
- [ ] "I'm thinking about selling my dental practice"
- [ ] "What's my business worth? I have a landscaping company doing $400K SDE"
- [ ] "I need to sell my restaurant, it's been 15 years"

**Buy openers to test:**
- [ ] "I want to buy an HVAC company in the Southeast doing $1M-$3M EBITDA"
- [ ] "I'm a search fund operator looking for my first acquisition"
- [ ] "Looking to buy a business under $500K"

**Raise openers to test:**
- [ ] "I need to raise capital for my SaaS company"
- [ ] "We're looking for $2M in growth equity"

**General:**
- [ ] "What can you help me with?" (should NOT be generic)

### 3. AUTHENTICATION FLOW
- [ ] Anonymous chat works (no login required)
- [ ] Anonymous chat persists across page refreshes
- [ ] Signup flow works (email + password)
- [ ] Google OAuth works
- [ ] Login redirects to /chat
- [ ] Session migration (anonymous → authenticated preserves conversation)
- [ ] Logout works, returns to home

### 4. DEAL CREATION & GATE PROGRESSION
- [ ] Yulia creates a deal when user provides business info
- [ ] Deal appears in sidebar under "Deals"
- [ ] Gate advances when readiness criteria met (no payment check)
- [ ] Gate progress indicator updates
- [ ] Multiple deals can exist simultaneously

### 5. DELIVERABLE GENERATION
- [ ] Free deliverable generates (ValueLens or deal score)
- [ ] Deliverable renders in canvas tab
- [ ] Deliverable content has real numbers (not placeholder)
- [ ] PDF export works (download triggers, file opens)
- [ ] DOCX export works
- [ ] XLSX export works
- [ ] Second deliverable triggers paywall (if not TEST_MODE)
- [ ] With TEST_MODE=true, all deliverables generate freely

### 6. TABBED CANVAS SYSTEM
- [ ] Clicking sidebar Tools opens canvas tabs (Pipeline, Sourcing, Data Room, Library)
- [ ] Multiple tabs can be open simultaneously
- [ ] Vertical icon strip appears with 2+ tabs (desktop)
- [ ] Tab switching preserves content (no reload)
- [ ] Closing a tab switches to the next one
- [ ] Closing last tab shows empty canvas state
- [ ] Mobile: canvas opens as full-screen overlay with pill tabs
- [ ] Mobile: pill tab switching works
- [ ] Mobile: X closes the tab, returns to chat

### 7. INTERACTIVE MODELS (Canvas)
For each model, test: opens, renders, sliders work, calculations update, charts render.

- [ ] Valuation Explorer — create via Yulia ("value my business")
- [ ] LBO Model — create via Yulia ("model this acquisition")
- [ ] SBA Financing — create via Yulia ("check SBA eligibility")
- [ ] Tax Impact — renders, asset vs stock comparison works
- [ ] Cap Table — add rounds, pie chart updates
- [ ] Earnout — add milestones, probability sliders work
- [ ] Covenant Compliance — headroom gauges work
- [ ] Working Capital — monthly data input, trend chart
- [ ] Sensitivity Matrix — heatmap renders from parent model
- [ ] Comparison — reads from multiple model tabs

**Mobile-specific model tests:**
- [ ] Sliders are easy to grab (28px thumb)
- [ ] Number inputs trigger numeric keyboard
- [ ] Grids stack properly (not side-by-side on phone)
- [ ] Charts render at readable size
- [ ] Tables scroll horizontally without breaking layout

### 8. SOURCING ENGINE
- [ ] Create a buy thesis (Sourcing panel → New Thesis)
- [ ] Generate Intelligence Brief (click button, wait ~45s)
- [ ] Brief renders with 6 collapsible sections
- [ ] Pipeline progress shows during Stages 2-4 (requires GOOGLE_PLACES_API_KEY)
- [ ] Portfolio canvas renders with tiered candidates (A/B/C/D)
- [ ] Candidate detail slide-out opens on click
- [ ] Status changes work (Pursue, Pass, etc.)
- [ ] On-demand enrichment works (Get More Details button)

### 9. SUBSCRIPTION / PAYWALL
- [ ] GET /api/stripe/subscription returns current plan
- [ ] TEST_MODE=true returns enterprise for all users
- [ ] Paywall card appears after first free deliverable (TEST_MODE=false)
- [ ] Subscribe button creates Stripe checkout (TEST_MODE=false)
- [ ] After subscribing, deliverables generate freely

### 10. DOCUMENT QUALITY
- [ ] ValueLens PDF has branded cover page
- [ ] ValueLens PDF has charts (valuation range, multiple comparison)
- [ ] PDF typography uses Sora/Inter (not Helvetica)
- [ ] Tables have terra accent headers and alternating rows
- [ ] Confidentiality notice and disclaimer present
- [ ] DOCX has headers/footers with smbx.ai branding
- [ ] XLSX has formatted header row and number formatting

### 11. DARK MODE
- [ ] All pages render correctly in dark mode
- [ ] Chat messages readable
- [ ] Canvas panels have appropriate dark backgrounds
- [ ] Dot grid visible but subtle
- [ ] No white flashes on page transitions
- [ ] Interactive models readable in dark mode

### 12. MOBILE-SPECIFIC
- [ ] iOS Safari: no address bar overlap issues
- [ ] iOS Safari: keyboard doesn't push content off screen
- [ ] iOS Safari: safe area insets respected (notch, home bar)
- [ ] Android Chrome: back gesture works (returns to chat from canvas)
- [ ] Horizontal scroll doesn't exist on any page
- [ ] Touch targets are 44px+ minimum
- [ ] Text is readable without pinch-to-zoom

### 13. PERFORMANCE
- [ ] Home page loads in <3s
- [ ] Chat response starts streaming in <2s
- [ ] Interactive model recalculates in <100ms on slider move
- [ ] No visible jank when switching canvas tabs
- [ ] PDF export completes in <10s

---

## Issues Log

### Template
Copy this for each issue:

```
### T-XXX: [Short description]
**Severity:** 🔴 Critical / 🟡 Major / 🟢 Minor
**Route/Page:** /chat, /sell, home, etc.
**Device:** Desktop Chrome / iPhone Safari / Android Chrome
**Steps to Reproduce:**
1. Go to [page]
2. Type "[message]" or click [button]
3. [What happens next]

**Expected:** [What should happen]
**Actual:** [What actually happens]
**Screenshot:** `/testing/screenshots/T-XXX.png` (if applicable)
**Status:** 🆕 New / 🔧 In Progress / ✅ Fixed / 🚫 Won't Fix
**Fixed in:** [commit hash or "pending"]
```

---

### Issues

*(Add issues below as you find them)*

---

## Environment Notes

- **TEST_MODE:** Check Railway env vars → should be `true` for testing
- **ANTHROPIC_API_KEY:** Must be set for Yulia to respond
- **GOOGLE_PLACES_API_KEY:** Required for sourcing Stage 2+ (optional for testing other features)
- **STRIPE keys:** Required for real payment testing (not needed with TEST_MODE=true)
- **DATABASE_URL:** Railway PostgreSQL — migrations auto-run on deploy
- **Auto-migrations:** Server runs all pending SQL migrations on startup

## Quick Links

- **Production:** https://smbx-production.up.railway.app
- **Railway Dashboard:** https://railway.app
- **GitHub:** https://github.com/paulbryantbaker-art/SMBx
