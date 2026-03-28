# smbx.ai — Testing Tracker
**Last updated:** 2026-03-28
**Tester:** Paul
**Environment:** Production (Railway) — smbx-production.up.railway.app
**Devices:** MacBook (Chrome/Safari), iPhone (Safari), Android (Chrome)

---

## How to Use

### Filing an Issue
1. Duplicate `testing/issues/T-000-TEMPLATE.md`
2. Rename to `T-001-short-description.md` (increment the number)
3. Fill in the frontmatter fields and description
4. Drop screenshots in `testing/screenshots/` with matching name
5. Tell Claude Code: "read the testing issues and fix them"

### How Claude Code Uses This
Claude reads all files in `testing/issues/` and parses the YAML frontmatter to understand severity, status, area, and reproduction steps. Issues marked `status: new` are the active queue.

### Severity Guide
- **critical** 🔴 — User can't use the product (Yulia doesn't respond, page crashes, data loss, blank screen)
- **major** 🟡 — Wrong behavior but workaround exists (wrong price, deliverable errors, layout broken on one device)
- **minor** 🟢 — Cosmetic or non-blocking (typo, slight misalignment, slow but works)

### Status Values
- **new** — Just filed, not looked at
- **in-progress** — Claude Code is working on it
- **fixed** — Fix committed and pushed (commit hash in `fixed_in`)
- **wont-fix** — Intentional behavior or deferred

### Area Tags
`conversation` `canvas` `models` `sourcing` `auth` `export` `design` `mobile` `performance` `pricing` `navigation` `dark-mode`

---

## Issue Dashboard

*(This section auto-populated by Claude Code when asked to review issues)*

| ID | Title | Severity | Area | Status |
|----|-------|----------|------|--------|
| — | No issues filed yet | — | — | — |

---

## Test Plan Checklist

### 1. HOME PAGE & FIRST IMPRESSION
- [ ] Home page loads on desktop (dot field visible, logo in sidebar, greeting text)
- [ ] Home page loads on mobile (responsive, no horizontal scroll)
- [ ] Dark mode toggle works (dots visible in both modes)
- [ ] X logo in sidebar navigates to home
- [ ] Suggestion chips visible and clickable
- [ ] Typing in chat dock works (focus, keyboard on mobile)
- [ ] Journey pages load from sidebar (Sell, Buy, Raise, Integrate, Advisors, How, Pricing)
- [ ] Below-the-fold content renders on journey pages

### 2. CONVERSATION QUALITY (The Critical Test)
For each opener, grade Yulia's response:
- **A** = Specific, saves data, classifies league, asks smart follow-up
- **B** = Reasonable but generic, doesn't save data proactively
- **C** = Chatbot-level response ("I'd be happy to help")
- **F** = No response, error, or completely wrong

| # | Opener | Grade | Issue |
|---|--------|-------|-------|
| 1 | "I want to sell my HVAC business doing $2M revenue in Atlanta" | | |
| 2 | "I'm thinking about selling my dental practice" | | |
| 3 | "What's my business worth? I have a landscaping company doing $400K SDE" | | |
| 4 | "I need to sell my restaurant, it's been 15 years" | | |
| 5 | "I want to buy an HVAC company in the Southeast doing $1M-$3M EBITDA" | | |
| 6 | "I'm a search fund operator looking for my first acquisition" | | |
| 7 | "Looking to buy a business under $500K" | | |
| 8 | "I need to raise capital for my SaaS company" | | |
| 9 | "We're looking for $2M in growth equity" | | |
| 10 | "What can you help me with?" | | |

### 3. AUTHENTICATION
- [ ] Anonymous chat works (no login required)
- [ ] Anonymous chat persists across refresh
- [ ] Signup works (email + password)
- [ ] Google OAuth works
- [ ] Login redirects to /chat
- [ ] Session migration preserves conversation
- [ ] Logout returns to home

### 4. DEAL CREATION & GATES
- [ ] Deal created when user provides business info
- [ ] Deal appears in sidebar
- [ ] Gate advances on readiness (no payment check)
- [ ] Multiple deals coexist

### 5. DELIVERABLES
- [ ] Free deliverable generates
- [ ] Renders in canvas tab
- [ ] Has real numbers (not placeholder)
- [ ] PDF export downloads and opens
- [ ] DOCX export works
- [ ] XLSX export works
- [ ] Paywall triggers after first free (TEST_MODE=false)
- [ ] TEST_MODE=true bypasses all paywalls

### 6. TABBED CANVAS
- [ ] Tools open as canvas tabs (Pipeline, Sourcing, Data Room, Library)
- [ ] Multiple tabs open simultaneously
- [ ] Vertical icon strip on desktop (2+ tabs)
- [ ] Tab switching preserves content
- [ ] Close tab → next tab activates
- [ ] Close last tab → empty canvas
- [ ] Mobile: full-screen overlay with pill tabs
- [ ] Mobile: pill switching works
- [ ] Mobile: X closes tab → back to chat

### 7. INTERACTIVE MODELS
| Model | Opens | Renders | Sliders Work | Charts Update | Mobile OK |
|-------|-------|---------|-------------|---------------|-----------|
| Valuation Explorer | | | | | |
| LBO / Acquisition | | | | | |
| SBA Financing | | | | | |
| Tax Impact | | | | | |
| Cap Table | | | | | |
| Earnout | | | | | |
| Covenant Compliance | | | | | |
| Working Capital | | | | | |
| Sensitivity Matrix | | | | | |
| Deal Comparison | | | | | |

### 8. SOURCING ENGINE
- [ ] Create buy thesis
- [ ] Generate Intelligence Brief (~45s)
- [ ] Brief renders with 6 sections
- [ ] Pipeline progress during Stages 2-4
- [ ] Portfolio canvas with tiered candidates
- [ ] Candidate detail slide-out
- [ ] Status changes (Pursue/Pass)
- [ ] On-demand enrichment

### 9. SUBSCRIPTION / PAYWALL
- [ ] GET /api/stripe/subscription returns plan
- [ ] TEST_MODE=true → enterprise
- [ ] Paywall after first free deliverable
- [ ] Stripe checkout works (TEST_MODE=false)

### 10. DOCUMENT QUALITY
- [ ] PDF: branded cover, charts, Sora/Inter fonts, disclaimer
- [ ] DOCX: headers/footers, branded tables
- [ ] XLSX: formatted headers, number formatting

### 11. DARK MODE
- [ ] All pages render correctly
- [ ] Chat readable
- [ ] Canvas panels appropriate dark bg
- [ ] Dot grid visible but subtle
- [ ] Models readable

### 12. MOBILE
- [ ] iOS Safari: no address bar issues
- [ ] iOS Safari: keyboard doesn't break layout
- [ ] iOS Safari: safe area insets (notch, home bar)
- [ ] Android: back gesture works
- [ ] No horizontal scroll anywhere
- [ ] Touch targets 44px+
- [ ] Text readable without zoom

### 13. PERFORMANCE
- [ ] Home loads <3s
- [ ] Chat streams <2s
- [ ] Model recalc <100ms
- [ ] Tab switching smooth
- [ ] PDF export <10s

---

## Environment Notes

| Variable | Required For | Check |
|----------|-------------|-------|
| `TEST_MODE=true` | Bypass paywalls during testing | Railway env vars |
| `ANTHROPIC_API_KEY` | Yulia responds | Must be set |
| `GOOGLE_PLACES_API_KEY` | Sourcing Stage 2+ | Optional for non-sourcing testing |
| `STRIPE_SECRET_KEY` | Real payment testing | Not needed with TEST_MODE |
| `DATABASE_URL` | Everything | Railway PostgreSQL |

**Auto-migrations:** Server runs all pending SQL on startup. No manual DB work needed.
