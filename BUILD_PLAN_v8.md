# smbx.ai — Master Build Plan v8

### Last Updated: February 26, 2026
### Supersedes: BUILD_PLAN_v6 (February 24, 2026), CHAT_MORPH_ARCHITECTURE.md

---

## WHY v8 EXISTS

v6 had a blind spot. It described the front door in exhaustive detail (Phases A-E: chat morph → gates → wallet → deliverables → polish → launch) and then hand-waved the rest as "post-launch phases F-J." But the actual product — the canvas, the data room, document management, RBAC, collaboration, sourcing, pipeline management, the intelligence engine — had no build plan. They were described in METHODOLOGY_V17 and YULIA_PROMPTS_V2 as features, but never decomposed into buildable chunks with dependencies, effort estimates, and verification criteria.

v8 fixes this. It covers **every system in the entire platform** — from the first chat message to the intelligence flywheel — organized by what each system IS, what it DEPENDS ON, and HOW TO BUILD IT.

**Source-of-Truth Hierarchy (unchanged):**

| Document | Governs | Status |
|----------|---------|--------|
| **This file (BUILD_PLAN_v8.md)** | Complete build roadmap — every system, every phase | MASTER |
| **METHODOLOGY_V17.md** | Domain logic, financial formulas, gate definitions, RBAC rules | AUTHORITATIVE |
| **YULIA_PROMPTS_V2.md** | Runtime prompts, conversation scripts, deliverable schemas | AUTHORITATIVE |
| **smbx-v12-prototype.html** | Visual design source of truth | AUTHORITATIVE |
| **CHAT_MORPH_ARCHITECTURE.md** | Detailed Phase 1 implementation spec | REFERENCE (subsumed here) |

---

## THE 13 SYSTEMS

SMBX is not a chatbot with features bolted on. It is 13 interlocking systems. Every user interaction touches multiple systems simultaneously. Here they are, in dependency order:

```
┌──────────────────────────────────────────────────────────────┐
│                     THE 13 SYSTEMS                           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  LAYER 1 — FOUNDATION (must exist for anything to work)      │
│  ┌─────────┐ ┌──────────┐ ┌────────────┐                    │
│  │ 1. SPA  │ │ 2. AUTH  │ │ 3. CHAT    │                    │
│  │  SHELL  │ │ & ACCOUNT│ │  ENGINE    │                    │
│  └────┬────┘ └─────┬────┘ └─────┬──────┘                    │
│       │            │            │                            │
│  LAYER 2 — DEAL ENGINE (makes the product work)              │
│  ┌────▼────┐ ┌─────▼────┐ ┌────▼───────┐                    │
│  │ 4. GATE │ │ 5. WALLET│ │ 6. CANVAS  │                    │
│  │  SYSTEM │ │ & PAYMENT│ │            │                    │
│  └────┬────┘ └─────┬────┘ └────┬───────┘                    │
│       │            │            │                            │
│  LAYER 3 — DELIVERABLES (makes money)                        │
│  ┌────▼────────────▼────────────▼──────┐                     │
│  │  7. DELIVERABLE GENERATION PIPELINE │                     │
│  └────┬────────────────────────────────┘                     │
│       │                                                      │
│  LAYER 4 — DEAL MANAGEMENT (makes deals real)                │
│  ┌────▼────┐ ┌──────────┐ ┌────────────┐                    │
│  │ 8. DATA │ │ 9. COLLAB│ │ 10.PIPELINE│                    │
│  │   ROOM  │ │  & RBAC  │ │  & VELOCITY│                    │
│  └─────────┘ └──────────┘ └────────────┘                    │
│                                                              │
│  LAYER 5 — INTELLIGENCE (makes the moat)                     │
│  ┌──────────┐ ┌──────────┐ ┌────────────┐                   │
│  │11.MARKET │ │12.SOURCING│ │13.NOTIF &  │                   │
│  │ INTEL    │ │  ENGINE  │ │ ENGAGEMENT │                    │
│  └──────────┘ └──────────┘ └────────────┘                   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## SYSTEM-BY-SYSTEM SPECIFICATION

### System 1: SPA Shell
**What it is:** The single-page application container — topbar, scroll area, dock, state management, routing, animations.

**Current state:** ~70% built. Home.tsx implements landing/journey/chat states. ChatDock exists with 8 tools. useAnonymousChat hook works. V5 multi-page routes still exist alongside.

**What remains:**
- Kill V5 routes, redirect /sell → /#sell
- Consolidate ChatContext + useAnonymousChat into AppContext
- Morph animations (CSS keyframes for fade transitions)
- Topbar morphing (logo centering, back button, "Yulia" subtitle)
- Session restore (page reload → detect existing session → go straight to chat)
- Chat bubbles matching v12 spec (terra user bubbles, not dark)

**Depends on:** Nothing (foundation layer)
**Blocks:** Everything

---

### System 2: Auth & Account
**What it is:** User identity — registration, login, JWT management, session migration from anonymous to authenticated.

**Current state:** ~40% built. JWT auth exists but password validation is placeholder. Registration endpoint exists. Anonymous→auth conversion endpoint exists.

**What remains:**
- Real password hashing (bcrypt — wire up existing code)
- Email validation
- Password reset flow (email-based)
- Google SSO (OAuth2)
- Inline signup card component (renders as chat message)
- Anonymous session migration (preserve messages + deal data)
- Token refresh mechanism
- Profile page (basic: name, email, company, role)

**Depends on:** System 1 (SPA Shell)
**Blocks:** Systems 4-13 (everything authenticated)

---

### System 3: Chat Engine
**What it is:** The conversational interface — message handling, SSE streaming, system prompt assembly, journey context injection, field extraction, seven-factor scoring.

**Current state:** ~75% built. Anonymous sessions, SSE streaming, Anthropic API integration, buildAnonymousPrompt(), field extraction, seven-factor scoring — all working. 20-message limit, 3 sessions/IP/day.

**What remains:**
- Authenticated chat (unlimited messages, persistent history)
- Conversation list sidebar (after auth)
- Multi-conversation support (create new, switch between)
- Streaming improvements (word-by-word, not chunk-by-chunk)
- Message formatting (markdown rendering in Yulia's responses)
- Yulia's first-response formula enforcement (classify → estimate → insight → question)
- Error recovery (retry on failure, graceful degradation)
- File attachment rendering in chat (show uploaded files inline)

**Depends on:** Systems 1-2
**Blocks:** Systems 4, 6, 7

---

### System 4: Gate System
**What it is:** The 22-gate progression engine across 4 journeys. Each gate has entry criteria, a system prompt, completion triggers, and produces deal data as side effects.

**Current state:** ~50% built on backend. gateRegistry.ts (22 gates), gateReadinessService.ts, gatePrompts.ts, gate-specific tools (12 agentic tools). Frontend: 0% — no gate UI, no progress indicators.

**What remains:**

Backend:
- Gate advancement logic (check completion criteria → advance → update deal record)
- Gate-specific system prompt injection (swap prompt as user moves S0→S1→S2)
- Deal record CRUD (create on first message, update as fields extracted)
- Gate event logging (for velocity tracking)
- Paywall trigger at S2/B2/R2 (gate cannot advance without purchase)

Frontend:
- Gate progress indicator (subtle at first, more visible as they progress)
- Gate transition announcements in chat ("Great — I have your financials. Let's value this business.")
- Deal summary sidebar (shows extracted fields, current gate, completion %)
- Journey-specific tools popup (tools change per gate — S0 shows different tools than S3)

**Depends on:** Systems 1-3
**Blocks:** Systems 5, 7, 8

---

### System 5: Wallet & Payments
**What it is:** Stripe integration, wallet management, menu pricing with league multipliers, paywall enforcement.

**Current state:** ~60% built on backend. Wallet service (getOrCreateWallet, addCredits, deductCredits, getBalance, getTransactionHistory). Stripe webhooks. Menu catalog with 91 deliverables seeded by journey + gate. League multipliers. Frontend: 0%.

**What remains:**

Backend:
- Stripe Checkout session creation (one-time charges for wallet blocks)
- Webhook handler: payment_intent.succeeded → addCredits
- Wallet block bonuses (5-30% for larger blocks)
- Insufficient funds flow (pause, prompt top-up, resume)
- Credit expiration (12 months) and rollover rules
- Refund logic (unused credits within 30 days)
- Transaction history endpoint

Frontend:
- Wallet balance display (in sidebar or topbar)
- Paywall card (renders in chat when gate requires purchase)
- Top-up flow (select block → Stripe Checkout → return → balance updated)
- Transaction history view
- Deliverable pricing display (menu items with prices)
- Inline "Add funds" button in Yulia's paywall message

**Depends on:** Systems 1-4
**Blocks:** System 7

---

### System 6: Canvas
**What it is:** The deliverable viewer/editor — side-by-side with chat. Think Claude's artifacts, but for M&A documents. Where users VIEW, REVIEW, EDIT, COMPARE, and EXPORT deliverables.

**Current state:** 0% built. This system doesn't exist yet at all.

**What it must do:**
- Display generated deliverables (valuations, CIMs, financial models, LOIs, DD checklists)
- Side-by-side with chat on desktop (Claude artifacts model)
- Full-screen on mobile with "back to chat" navigation
- Markdown rendering for text-heavy deliverables (valuations, CIMs)
- Table rendering for financial data (spreadsheet-like views)
- Interactive charts (revenue trends, valuation ranges, sensitivity analysis)
- Edit mode: user can annotate, comment, request changes → Yulia revises
- Comparison mode: "show me this valuation vs. the one from 3 weeks ago"
- Export: PDF download, DOCX download, XLSX for financial models
- Save to data room (one click → document stored permanently)
- Version history (v1, v2, v3 of a CIM as user refines it)

**Architecture:**
```
┌─────────────────────────────────────────┐
│ Desktop (>1024px)                        │
│ ┌──────────────┬────────────────────────┐│
│ │ CHAT (40%)   │ CANVAS (60%)           ││
│ │              │                        ││
│ │ Messages     │ [Deliverable Viewer]   ││
│ │              │                        ││
│ │              │ ┌────────────────────┐ ││
│ │              │ │ Business Valuation │ ││
│ │              │ │ v2 — Feb 26, 2026  │ ││
│ │              │ │                    │ ││
│ │              │ │ SDE: $280,000      │ ││
│ │              │ │ Multiple: 3.1-3.4× │ ││
│ │              │ │ Range: $868K-$952K │ ││
│ │              │ │                    │ ││
│ │              │ │ [Export PDF]       │ ││
│ │              │ │ [Save to Room]    │ ││
│ │              │ │ [Compare v1]      │ ││
│ │              │ └────────────────────┘ ││
│ ├──────────────┴────────────────────────┤│
│ │ Dock                                   ││
│ └────────────────────────────────────────┘│
└─────────────────────────────────────────┘

┌─────────────────────┐
│ Mobile (<768px)      │
│ ┌───────────────────┐│
│ │ ← Back to chat    ││
│ │                   ││
│ │ [Deliverable]     ││
│ │ Full-screen       ││
│ │                   ││
│ │ [Export] [Save]   ││
│ └───────────────────┘│
└─────────────────────┘
```

**Components needed:**
- CanvasContainer.tsx — the split-view shell
- DeliverableViewer.tsx — renders any deliverable type
- MarkdownRenderer.tsx — rich text with financial formatting
- FinancialTable.tsx — spreadsheet-like data tables
- ChartWidget.tsx — recharts-based visualizations
- ExportBar.tsx — PDF/DOCX/XLSX download buttons
- VersionHistory.tsx — compare deliverable versions
- CanvasMobileSheet.tsx — full-screen mobile overlay

**Depends on:** Systems 1-3
**Blocks:** System 7 (deliverables need somewhere to render)

---

### System 7: Deliverable Generation Pipeline
**What it is:** The AI engine that creates institutional-grade documents — valuations, CIMs, financial models, LOIs, DD checklists, SBA analyses, pitch decks, and 80+ other deliverable types.

**Current state:** ~40% built on backend. 9 generators exist in server/services/generators/. Capital stack engine (659 lines). Financial model templates. Deliverable schemas defined in YULIA_PROMPTS_V2 Section 8. Frontend: 0%.

**What it must do:**

Generation flow:
1. User reaches paywall gate → Yulia explains deliverable + price
2. User confirms purchase → wallet deducted → status: 'generating'
3. AI builds content using model routing (Haiku → Sonnet → Opus based on deliverable tier)
4. Preview generation (enough to show value — first page / executive summary)
5. Full content generation after purchase
6. Canvas renders the result
7. Yulia summarizes key findings in chat
8. User can iterate ("change the growth assumption to 15%")

Model routing:
- Haiku: Classification, field extraction, screening (80% of calls, $1/$5 per M tokens)
- Sonnet: Valuations, market analysis, financial models, strategic recommendations (15%)
- Opus: CIMs, QoE reports, legal review — premium docs ($15/$75 per M tokens, 5%)

Cost optimization:
- Prompt caching: system prompts (~50K tokens) cached at $0.10/M vs $1.00/M
- Batch API: non-urgent generations submitted in batches (50% discount)
- Template reuse: common sections (SBA rules, market data) cached and injected

Export pipeline:
- PDF generation (valuations, CIMs, deal memos) — server-side using puppeteer or docx→pdf
- DOCX generation (CIMs, LOIs) — using docx-js library
- XLSX generation (financial models, working capital) — using ExcelJS

**Key deliverables by gate:**

| Gate | Deliverable | Price (L1 base) | Generator | Model |
|------|-------------|-----------------|-----------|-------|
| S2 | Business Valuation | $350 | valuationGenerator | Sonnet |
| S2 | Full Valuation Suite | $500 | valuationGenerator | Sonnet+Opus |
| S2 | Reality Check | $150 | valuationGenerator | Sonnet |
| S3 | Full CIM | $700 | cimGenerator | Opus |
| S3 | Living CIM | $900 | livingCimGenerator | Opus |
| S3 | Blind Teaser | $175 | teaserGenerator | Sonnet |
| S4 | Buyer Matching | $200 | matchingGenerator | Sonnet |
| B2 | Target Valuation | $350 | valuationGenerator | Sonnet |
| B2 | Financial Model | $275 | financialModelGenerator | Sonnet |
| B2 | LOI Draft | $70 | loiGenerator | Sonnet |
| B3 | DD Package | $200 | ddGenerator | Sonnet |
| B3 | QoE Lite | $500 | qoeGenerator | Opus |
| R2 | Pitch Deck | $500 | pitchDeckGenerator | Opus |
| INT | Market Intelligence Report | $200 | marketIntelGenerator | Sonnet |
| INT | Fragmentation Heat Map | $150 | heatMapGenerator | Sonnet |

**Depends on:** Systems 1-6 (needs canvas to render, wallet to charge)
**Blocks:** Systems 8, 10 (deliverables go into data room, feed pipeline)

---

### System 8: Data Room
**What it is:** Secure document storage organized by deal. Every M&A transaction involves hundreds of documents that need to be organized, version-controlled, shared selectively, and tracked.

**Current state:** ~10% built. File upload endpoint exists. Document extractor parses PDFs. No data room UI, no folder structure, no document states, no sharing.

**What it must do:**

Document organization:
```
Deal: Acme Pest Control
├── 📁 Financials
│   ├── 📄 2023 Tax Return         [uploaded, LOCKED]
│   ├── 📄 2024 P&L                [uploaded, LOCKED]
│   ├── 📄 2025 YTD P&L            [uploaded, editable]
│   └── 📄 Add-back Schedule       [generated, editable]
│
├── 📁 Deal Documents
│   ├── 📄 CIM v3                  [generated, APPROVED]
│   ├── 📄 Blind Teaser            [generated, APPROVED]
│   ├── 📄 Business Valuation v2   [generated, current]
│   └── 📄 LOI Template            [generated, editable]
│
├── 📁 Due Diligence
│   ├── 📁 Requests (from buyer)
│   ├── 📁 Responses (from seller)
│   └── 📄 DD Checklist            [generated, in-progress]
│
└── 📁 Closing
    ├── 📄 Purchase Agreement      [uploaded, LOCKED]
    ├── 📄 Working Capital         [generated, editable]
    └── 📄 Closing Funds Flow      [generated, editable]
```

Document states: `draft` → `review` → `approved` → `locked`
- Locked documents: immutable record of truth (tax returns, signed agreements)
- Generated documents: Yulia-created, user can request revisions
- Uploaded documents: user-provided, can be replaced but history preserved

Version history:
- Every edit creates a new version
- Previous versions accessible but clearly marked
- Diff view between versions (for CIM iterations)

**Components needed:**
- DataRoomView.tsx — file browser with folder tree
- DocumentCard.tsx — individual document with status badge, actions
- FolderTree.tsx — collapsible folder navigation
- DocumentPreview.tsx — quick-look before opening in canvas
- UploadZone.tsx — drag-and-drop file upload into specific folders
- ShareDialog.tsx — set access levels per document/folder
- AuditLog.tsx — who accessed what, when

Backend:
- Folder/document CRUD endpoints
- Document state machine (draft→review→approved→locked)
- Version storage (each version is a separate file, linked by document_id)
- Access control middleware (check user role + document permissions)
- File storage (Railway volume or S3-compatible — start with local, migrate)
- Watermarking for sensitive documents (CIMs shared with buyers)

**Depends on:** Systems 1-4 (needs auth, needs deal context from gates)
**Blocks:** System 9 (sharing needs data room to exist)

---

### System 9: Collaboration & RBAC
**What it is:** Multi-party deal management. Deals involve sellers, buyers, attorneys, CPAs, lenders, brokers, consultants. Each needs different access to different parts of the deal.

**Current state:** 0% built. Schema defined in METHODOLOGY_V17 (Section 4.5.10-4.5.11). Prompts exist in YULIA_PROMPTS_V2 Section 15.

**Participant roles (7 types):**

| Role | Sees | Can Do |
|------|------|--------|
| owner | Everything in their deal | Full control, invite/remove participants |
| attorney | Deal docs, DD, closing, legal docs | Comment, upload, approve legal docs |
| cpa | Financials, tax docs, valuations | Comment, upload financial docs |
| broker | CIM, marketing, buyer pipeline | Edit CIM, manage buyer list, view comms |
| lender | Financials, SBA analysis, collateral | View, request additional docs |
| consultant | Scoped to specific folders | View, comment (time-limited) |
| buyer/seller (counterparty) | Shared folders only | View shared docs, submit/respond to DD |

**Invitation flow:**
1. Deal owner tells Yulia: "I want to add my attorney"
2. Yulia asks: email, role, access level
3. System generates invite with secure token
4. Email sent with deal-specific link
5. Invitee clicks link → creates account (or logs in) → lands in scoped deal view
6. All actions logged in audit trail

**Day Pass system (from METHODOLOGY_V17 4.5.5):**
- 48-hour time-limited access tokens for external advisors
- Three access levels: read, comment, full
- No account required to view (token-based access)
- Timer starts on first access, auto-revokes at expiration

**Chinese Wall enforcement:**
- Buyer data and seller data strictly isolated
- Same user cannot be on both sides of the same deal
- AI context flushed between sessions (no cross-deal data leakage)

**Components needed:**
- ParticipantList.tsx — shows all deal participants with roles
- InviteDialog.tsx — invite new participant (email, role, scope)
- DayPassCard.tsx — create/manage temporary access
- RoleSelector.tsx — assign/change participant roles
- AccessScopeEditor.tsx — configure folder-level permissions
- AuditTrail.tsx — chronological log of all participant actions

Backend:
- RBAC middleware (check role + resource + action on every request)
- Invitation service (generate tokens, send emails, track acceptance)
- Day pass service (create, validate, expire)
- Deal-scoped messaging (participants can communicate within deal context)
- Activity notifications (new document, new comment, deadline approaching)
- Participant event logging

**Depends on:** Systems 1-4, 8 (data room must exist to share documents)
**Blocks:** Nothing directly (but enhances systems 8, 10, 12)

---

### System 10: Pipeline & Deal Velocity
**What it is:** Visual deal management — where is every deal in its journey, how fast is it moving, what's blocked, what needs attention.

**Current state:** ~20% built on backend. Gate registry defines the pipeline stages. Deal velocity event types defined. Gate progress tracked. Frontend: 0%.

**What the user sees (progressive disclosure):**
- At S0-S1: just the chat. No pipeline visible. Yulia drives.
- At S2+: subtle progress indicator. "Step 3 of 6: Valuation"
- At S3+: sidebar shows full gate map with completion badges
- At S4+: sidebar shows buyer/seller pipeline (list of parties involved)
- At B1+: deal pipeline shows opportunities being tracked, scored, compared

**Pipeline views:**

For sellers:
```
S0 ✅ → S1 ✅ → S2 🔵 → S3 ○ → S4 ○ → S5 ○
Intake    Fin.    Value   Package Match  Close
                  ↑ YOU ARE HERE
                  Next: Purchase valuation ($350)
```

For buyers:
```
Active Opportunities
┌─────────────────────────────────────────┐
│ Acme Pest Control    Score: 87/100  🟢  │
│ $1.2M rev · 3.1× SDE · SBA eligible    │
│ Stage: LOI Submitted · 14 days          │
├─────────────────────────────────────────┤
│ Metro HVAC Services  Score: 72/100  🟡  │
│ $800K rev · 2.8× SDE · needs 15% down  │
│ Stage: Initial Review · 3 days          │
├─────────────────────────────────────────┤
│ CleanPro Janitorial  Score: 45/100  🔴  │
│ $450K rev · 2.2× SDE · high owner dep.  │
│ Stage: Pass recommended                 │
└─────────────────────────────────────────┘
```

**Deal velocity tracking (10 events):**
1. discovery → 2. first_view → 3. saved → 4. nda_signed → 5. cim_requested → 6. meeting_scheduled → 7. loi_submitted → 8. loi_accepted → 9. due_diligence_started → 10. closing

**Pacing alerts:**
- "Your DD has been open 34 days — average is 21. What's blocking you?"
- "You've been at the valuation stage for 2 weeks. Ready to move forward?"
- "3 buyers viewed your CIM in the last week — 1 requested an NDA"

**Components needed:**
- PipelineView.tsx — visual gate progression (horizontal steps)
- DealCard.tsx — summary card for individual deals
- DealList.tsx — sortable, filterable list of all deals
- VelocityChart.tsx — time-in-stage visualization
- PacingAlert.tsx — in-chat and sidebar alerts for stalled deals
- OpportunityScorecard.tsx — seven-factor score breakdown for buyer deals

**Depends on:** Systems 1-4 (gates produce the data, pipeline visualizes it)
**Blocks:** Nothing (enhances user experience, not a prerequisite)

---

### System 11: Market Intelligence Engine
**What it is:** The moat. Free government data (Census, BLS, FRED, BEA, SEC EDGAR, IRS SOI) combined with AI synthesis to deliver PitchBook-quality intelligence at $225/month infrastructure cost.

**Current state:** ~5% built. Schema defined. API keys listed. Data pipeline architecture designed. Yulia's prompts include industry knowledge (Layer 1 — baked into system prompt). Nothing else.

**Architecture: Four layers, built progressively**

**Layer 1 — Prompt Knowledge (BUILT):**
Yulia already knows industry multiples, SBA rules, PE roll-up patterns, common add-backs by industry. This is knowledge embedded in system prompts. Works today, costs nothing extra, limited to Claude's training data.

**Layer 2 — Government Data APIs (Phase G):**
Real data from free government sources, cached in PostgreSQL, synthesized by Claude.

| Source | What It Gives You | Cache | API Key |
|--------|-------------------|-------|---------|
| Census CBP | Establishment counts by NAICS × ZIP | 90 days | Free |
| BLS QCEW | Employment + wages by NAICS × county | 30 days | None |
| FRED | 840K time series: rates, CPI, unemployment | 24 hours | Free |
| BEA | GDP by county, regional price parities | 90 days | Free |
| SEC EDGAR | Public company financials by SIC/NAICS | 30 days | None |
| IRS SOI | Private business financials by industry | 365 days | None |

Data pipeline (wake-run-sleep agent pattern):
```
Trigger (user action or cron) → pg-boss job enqueued
  Worker picks up → LangGraph.js agent wakes
  ├── fetch Census CBP (NAICS + geography)
  ├── fetch BLS QCEW (employment + wages)
  ├── fetch BEA GDP (local economy)
  ├── fetch FRED indicators (rates, macro)
  ├── Claude synthesis → report → PostgreSQL
  Agent checkpoints state → sleeps
```

**Layer 3 — Real-Time Intelligence (Phase H):**
- GDELT: news monitoring by NAICS + geography, 15-minute updates
- Google Trends: demand signals by geography + industry
- Event detection: news → Haiku classification → scoring → alert

**Layer 4 — Flywheel (Phase J):**
Every deal generates anonymized transaction data. Over time, YOUR data becomes more valuable than government sources — actual deal multiples, time-to-close, DD red flags by industry.

**Intelligence deliverables:**
- Market Intelligence Report ($200) — full seven-layer analysis
- Target Quick Brief ($25) — single deal match analysis
- Deep Match Analysis ($75) — detailed target evaluation
- Fragmentation Heat Map ($150) — geographic competitive density
- Industry Health Index (free) — 0-100 composite score
- Weekly Market Pulse (free) — email digest
- Thesis Health Check (free) — buy box validation

**Composite Industry Health Index (0-100):**
| Component | Weight | Sources |
|-----------|--------|---------|
| Demand signals | 25% | Google Trends, BLS employment growth, news sentiment |
| Regulatory environment | 15% | GDELT policy tracking |
| Technology disruption risk | 15% | AI impact by sector |
| Financial/lending environment | 20% | FRED rates, SBA lending, PE activity |
| Labor market conditions | 10% | BLS QCEW wages, unemployment |
| Macroeconomic factors | 15% | BEA GDP, CPI, consumer confidence |

**Depends on:** Systems 1-4 (needs user context, deal data)
**Blocks:** System 12 (sourcing needs market data)

---

### System 12: Sourcing Engine
**What it is:** Three-part matching engine — deals for buyers, buyers for sellers, advisors for everyone.

**Current state:** 0% built. Gate prompts describe sourcing (S4, B1) but there's no actual matching engine.

**Part A: Deal sourcing for buyers**
- Buyer defines buy box (thesis): industry, geography, size range, SDE target, financing approach, specific criteria
- Multi-thesis support: same buyer can have multiple buy boxes
- System scans against known listings + market data
- Scores every opportunity against thesis criteria (financial fit 40%, operational fit 30%, thesis fit 30%)
- Daily alerts: "3 new matches — 1 scored 87/100"
- Sourcing Sprint deliverable ($60): concentrated search across multiple sources

Where deals come from:
- User-submitted (paste a listing URL → Yulia analyzes)
- BizBuySell/BizQuest listings (future scraping or API)
- Ghost profiles (unclaimed businesses being tracked by buyers)
- Platform sellers (other SMBX users listing businesses)
- Eventually: direct outreach targets identified by intelligence engine

**Part B: Buyer sourcing for sellers**
- Based on league + industry + deal size → generate buyer profile
- L1-L2: Individual operators, SBA-qualified buyers, career changers
- L3-L4: PE firms, funded searchers, strategic acquirers
- L5-L6: Large PE sponsors, public strategics, cross-border buyers
- Buyer list deliverable ($200): scored list of likely buyer types
- Outreach strategy ($100): approach templates per buyer type

**Part C: Advisor marketplace (future)**
- M&A attorneys, CPAs, real estate agents, SBA lenders, escrow companies
- League-appropriate recommendations
- Start simple: Yulia recommends by type + location, user finds one
- Later: actual directory with profiles, ratings, deal experience

**Depends on:** Systems 1-5, 11 (needs market data, needs deal context)
**Blocks:** Nothing directly

---

### System 13: Notifications & Engagement
**What it is:** The system that brings users back. Email digests, in-app alerts, pacing nudges, follow-up engine, re-engagement campaigns.

**Current state:** 0% built.

**Notification types:**
- Deal alerts: "New match for your buy box" (email + in-app)
- Pacing alerts: "Your DD has been open 34 days" (in-app + email if inactive)
- Market events: "New regulation affecting pest control industry" (email digest)
- Gate nudges: "You're 2 questions away from your free valuation estimate" (in-app)
- Follow-up: "Your valuation was $X. Ready for the CIM?" (email after 7 days)
- Daily briefing: morning email with new matches, changes, recommendations

**Engagement-based tiering (AI resource allocation):**
| Tier | Score | Scan Frequency | AI Cost/Month |
|------|-------|----------------|---------------|
| Dormant | 0-10 | Manual only | $0 |
| Low | 11-30 | Weekly | $0.05 |
| Medium | 31-60 | 2×/week | $0.20 |
| High | 61-85 | Daily | $0.50 |
| Power | 86-100 | Multi-daily | $1.50 |

Engagement score = last login (30%) + active deals (25%) + recent actions (20%) + deal updates (15%) + profile completeness (10%)

**In-app "What's Changed" panel:**
When user returns after absence, show: what happened since last login, ordered by significance. Powers the "I opened the app and Yulia told me a business matching my buy box appeared" experience.

**Follow-up engine rules (per deliverable):**
- Post-valuation: 7 days → "Ready for CIM?" / 30 days → "Market conditions changed"
- Post-CIM: 3 days → "Buyer interest update" / 14 days → "Time to refresh pricing?"
- Post-DD-start: 7 days → "DD progress check" / 21 days → "Average DD is 21 days"
- Abandoned intake: 24 hours → "Pick up where you left off" / 7 days → final nudge

**Depends on:** Systems 1-4, 11 (needs user data, deal data, intelligence data)
**Blocks:** Nothing

---

## BUILD PHASES — THE COMPLETE SEQUENCE

### PHASE 1: The Front Door (Week 1)
**Goal:** User types on any public page → Yulia responds → seamless morph → conversation builds deal profile
**Effort:** ~16 hours
**Systems touched:** 1, 3 (partial 2)

**What ships:**
- V12 SPA with morph animations (landing → journey → chat)
- Topbar morphing (centered logo, back button, "Yulia" subtitle)
- Chat bubbles matching v12 spec (terra user, white Yulia)
- Anonymous sessions with SSE streaming
- Journey context injection (sell/buy/agency/intelligence)
- Yulia's four-beat first response (classify → estimate → insight → question)
- Session restore on page reload
- Mobile-optimized (iOS viewport fix proven)

**Detailed spec:** See CHAT_MORPH_ARCHITECTURE.md

**Verify:** Open app → see 4 cards → click Sell → journey view → click "$1.8M Pest Control" → morph to chat → Yulia responds with industry analysis → back button works → type directly from landing → morph works. iOS Safari + desktop Chrome.

---

### PHASE 2: Auth & Account Conversion (Week 1-2)
**Goal:** Anonymous users convert to authenticated accounts without losing anything
**Effort:** ~12 hours
**Systems touched:** 2, 3, partial 4

**What ships:**
- Real auth (bcrypt passwords, email validation)
- Inline signup card (renders as chat message after 4+ exchanges)
- Google SSO
- Anonymous → authenticated session migration
- Conversation list sidebar (appears post-auth)
- Multi-conversation support
- Basic profile page (name, email, company)
- Auth token management (JWT refresh)

**Trigger for signup card (client-side):**
- 4+ user messages, OR
- seven_factor_composite exists in session data, OR
- 3+ user messages AND (revenue OR industry extracted)

**Migration flow:**
1. User clicks signup in inline card
2. Account created → JWT issued
3. POST /api/chat/anonymous/:sessionId/convert → links all messages + deal data to user
4. signupCompleted flag → sidebar slides in → unlimited messages
5. Chat continues seamlessly — no redirect, no page reload

**Verify:** Anonymous chat for 5 messages → signup card appears → create account → all previous messages preserved → sidebar shows conversation → new conversation creates fresh chat → logout/login preserves everything.

---

### PHASE 3: Gate Engine + Deal Records (Week 2-3)
**Goal:** Yulia drives users through structured gates; deals become first-class objects
**Effort:** ~16 hours
**Systems touched:** 4, 3

**What ships:**

Backend:
- Gate progression engine (22 gates across 4 journeys)
- Gate-specific system prompts (swap per gate — S0 prompt ≠ S2 prompt)
- Auto-advance when completion criteria met
- Deal record CRUD (industry, revenue, SDE, EBITDA, league, location, etc.)
- Field extraction refinement (more accurate, more fields)
- Gate event logging (timestamp every transition)
- Paywall flag at S2/B2/R2 (cannot advance without System 5)

Frontend:
- Gate progress indicator (subtle steps at top of chat)
- Gate transition messages in chat
- Deal summary panel (sidebar section showing extracted data)
- Journey-specific tools (tools popup changes per gate)

**Gate advancement logic:**
```
After each Yulia response:
  1. Extract fields from conversation → update deal record
  2. Check current gate's completion criteria
  3. If all required fields present:
     a. If next gate is free → auto-advance, inject new prompt
     b. If next gate is paywall → trigger paywall message
     c. Log gate_advancement event with timestamp
  4. Update gate progress indicator in UI
```

**Verify:** Start sell journey → Yulia asks industry, location, revenue (S0) → all answered → "Great, your profile is complete" → advances to S1 → Yulia asks for financials → upload P&L → extraction runs → add-backs identified → S1 complete → hits S2 paywall → "Your valuation report is $350."

---

### PHASE 4: Wallet & Payments (Week 3)
**Goal:** Users can pay for deliverables; revenue flows
**Effort:** ~14 hours
**Systems touched:** 5, 4, 3

**What ships:**

Backend:
- Stripe Checkout integration (one-time charges, NOT subscriptions)
- 10 wallet blocks ($50 → $50,000 with 0-30% bonus tiers)
- Webhook: payment_intent.succeeded → wallet credited
- Paywall enforcement at gate level
- Insufficient funds → inline top-up prompt
- League multiplier on all menu prices

Frontend:
- Wallet balance in topbar/sidebar
- Paywall card in chat (Yulia explains → price → "Purchase" button)
- Top-up flow (select block → Stripe Checkout → redirect back → balance updated)
- Purchase confirmation ("Your valuation is being generated...")
- Transaction history view

**Paywall conversation (Yulia's script):**
```
"Based on everything you've shared, I can now generate your full valuation 
report. Here's what it includes:

• Multi-methodology valuation (SDE multiples, comparable transactions, 
  asset-based floor)
• Seven-factor quality score with detailed breakdown
• SBA financing feasibility check
• Recommended listing price range with rationale

Business Valuation — $350

[Purchase Button]     [View Wallet]

This is a one-time purchase — no subscription required."
```

**Verify:** User hits S2 paywall → sees price → clicks "Purchase" → insufficient funds → "Add funds" → Stripe Checkout → pays $500 → returns → wallet shows $500 → clicks "Purchase" again → wallet shows $150 → deliverable status: generating. Also: returning user with existing balance → quick purchase flow.

---

### PHASE 5: Canvas + Deliverable Generation (Week 3-4)
**Goal:** AI generates institutional-grade deliverables; users view them in a beautiful canvas
**Effort:** ~24 hours (largest phase)
**Systems touched:** 6, 7, 3

This is the biggest phase because it's TWO major systems that depend on each other. Split into sub-phases:

**Phase 5A: Canvas Shell (8 hours)**
- Split-view layout (chat left, canvas right on desktop)
- Mobile: canvas opens as full-screen sheet
- Canvas container with toolbar (export, save, version, close)
- Markdown renderer for text deliverables
- Financial table renderer for data-heavy content
- Canvas state management (which deliverable is open, version tracking)

**Phase 5B: Generation Pipeline (10 hours)**
- Deliverable generation service (queue purchase → generate → store → notify)
- Model routing (Haiku/Sonnet/Opus per deliverable tier)
- Business Valuation generator (the first and most important deliverable)
- SBA Analysis generator (high-demand, proves financing feasibility)
- Deal Screening Memo generator (quick, high-value for buyers)
- Generation status in chat ("Generating your valuation... this takes 30-60 seconds")
- Streaming output to canvas (progressive rendering as sections complete)

**Phase 5C: Export Pipeline (6 hours)**
- PDF export (for valuations, CIMs, deal memos)
- DOCX export (for CIMs, LOIs — editable by users)
- XLSX export (for financial models — interactive spreadsheets)
- "Save to Data Room" button (creates document record, links to deal)

**First deliverables to ship (by priority):**
1. Business Valuation ($350) — the gateway drug
2. Deal Screening Memo ($150) — fast, proves Yulia's analysis depth
3. SBA Financing Model ($200) — answers "can this deal get financed?"
4. Financial Model ($275) — buyer's core tool
5. LOI Draft ($70) — converts interest to action
6. CIM ($700) — the flagship document

**Verify:** Purchase valuation → 30-60 sec → canvas opens with full report → scroll through sections → click "Export PDF" → downloads → click "Save to Room" → appears in data room (Phase 6). Also: Yulia summarizes key findings in chat after generation completes. Also: user says "change the growth assumption to 15%" → Yulia regenerates with new assumption → canvas updates → version history shows v1 and v2.

---

### PHASE 6: Data Room (Week 4-5)
**Goal:** Every deal has organized document storage with versioning and access control
**Effort:** ~16 hours
**Systems touched:** 8, partial 6

**What ships:**
- Data room view (folder tree + document grid)
- Auto-generated folder structure per deal (Financials, Deal Docs, DD, Closing)
- Document upload into specific folders
- Document states (draft → review → approved → locked)
- Version history per document
- Generated deliverables auto-filed into correct folders
- Document preview (quick look without opening canvas)
- Basic sharing (generate link with access level)
- Audit log (who viewed/downloaded/edited what)

**Folder auto-generation:**
When a deal is created, the system auto-creates the standard folder structure. As gates advance, new folders appear:
- S0-S1: Financials folder
- S2: Financials + Valuation folder
- S3: + Marketing folder (CIM, teaser)
- S4: + Buyer Management folder
- S5: + Closing folder
- DD: + Due Diligence folder (with sub-folders for requests/responses)

**Document states:**
```
DRAFT ──→ REVIEW ──→ APPROVED ──→ LOCKED
  │          │           │
  └──────────┴───────────┘ (can go back to draft)
                             LOCKED is permanent
```

**Verify:** Open deal → see folder tree → upload tax return → appears in Financials folder → status: "uploaded" → click "Lock" → locked icon appears → generate CIM → auto-filed in Marketing folder → click CIM → opens in canvas → export PDF. Also: generate valuation v1 → iterate → v2 appears → click "Compare versions" → side-by-side view.

---

### PHASE 7: Polish + Launch Prep (Week 5)
**Goal:** Production-ready for first users
**Effort:** ~12 hours
**Systems touched:** All of 1-8

**What ships:**
- E2E test: anonymous chat → signup → free gates → paywall → top up → purchase → deliverable → data room
- E2E test: BUY journey → thesis → sourcing talk → valuation → DD start
- Stripe live mode keys + webhook verification
- iOS Safari + desktop Chrome/Safari testing
- Error states: insufficient funds, generation failure, network error, session expiry
- Rate limiting on AI endpoints
- Fair-use limits on Yulia conversation (token budget per day)
- Database backup strategy
- Error monitoring (Sentry)
- Remove all placeholder/dev content
- Loading states (skeleton screens for canvas, data room)
- Empty states (no deals yet, no documents yet)

**Verify:** Full journey from anonymous → authenticated → S0→S1→S2 (paywall) → purchase → deliverable generated → saved to data room → start new conversation → previous deal context preserved. Works on mobile. No console errors. Stripe webhook fires correctly.

---

### 🚀 LAUNCH — Transaction Engine Live (Week 5-6)

At this point, the platform can:
1. ✅ Attract users (public website with immediate Yulia access)
2. ✅ Convert users (anonymous → authenticated seamlessly)
3. ✅ Classify deals (agentic intake through 22 gates)
4. ✅ Charge money (wallet + Stripe + menu pricing)
5. ✅ Generate deliverables (valuations, deal memos, financial models, CIMs)
6. ✅ Display deliverables (canvas with export)
7. ✅ Store documents (data room with folder structure)

What it CANNOT yet do:
- ❌ Multi-party collaboration (attorney, CPA, lender access)
- ❌ Real-time intelligence from government data
- ❌ Automated deal sourcing and matching
- ❌ Email notifications and engagement
- ❌ Pipeline visualization and velocity tracking

---

### PHASE 8: Collaboration & RBAC (Week 6-7)
**Goal:** Deals become multi-party workspaces
**Effort:** ~20 hours
**Systems touched:** 9, 8, 2

**What ships:**
- Invitation system (deal owner invites participants by email)
- 7 participant roles with scoped access
- Day pass system (48-hour temporary access for advisors)
- Role-based data room views (attorney sees legal docs, CPA sees financials)
- Deal-scoped messaging (participants can communicate within deal)
- Activity notifications (new document, new comment)
- Participant management UI (invite, remove, change role)
- Chinese Wall enforcement (buyer/seller data isolation)
- NDA tracking (digital NDA acceptance for CIM access)

**Verify:** Seller invites attorney → attorney receives email → clicks link → creates account → sees only legal documents + DD folder → adds comment on LOI → seller sees notification → seller invites lender → lender sees financial docs + SBA analysis only. Also: create day pass → advisor accesses via token → 48 hours later → access revoked.

---

### PHASE 9: Pipeline & Deal Velocity (Week 7-8)
**Goal:** Users can see and manage their deal pipeline visually
**Effort:** ~14 hours
**Systems touched:** 10, 4, 3

**What ships:**
- Pipeline view (visual gate progression — where am I?)
- Deal card components (summary view of any deal)
- Multi-deal management (buyers managing multiple opportunities)
- Velocity tracking (time-in-stage for every gate transition)
- Pacing alerts in chat ("Your DD is taking longer than average")
- Opportunity scorecard for buyers (seven-factor breakdown)
- Deal comparison view (compare two opportunities side-by-side)
- "What's next" recommendations (Yulia suggests the next action)

**Verify:** Seller with active deal at S3 → sees pipeline with S0✅ S1✅ S2✅ S3🔵 → clicks S3 → sees gate details. Buyer with 3 opportunities → sees deal cards sorted by score → clicks one → detailed scorecard → clicks "Compare" → side-by-side with another deal.

---

### PHASE 10: Notifications & Engagement (Week 8-9)
**Goal:** Users come back; the platform works even when they're not logged in
**Effort:** ~16 hours
**Systems touched:** 13, 3, 4

**What ships:**
- Email service (SendGrid or similar)
- Gate nudge emails (abandoned intake, stalled at paywall)
- Follow-up engine (post-valuation → CIM nudge, post-CIM → buyer nudge)
- In-app notification center
- "What's changed" panel (activity since last login)
- Engagement scoring (drives AI resource allocation in Phase 12)
- Configurable notification preferences (email frequency, types)
- Daily briefing email template (for Phase 12)

**Verify:** User completes S2 valuation → doesn't return for 7 days → receives email "Ready for your CIM?" → clicks link → lands in deal at S3 → Yulia picks up where they left off. Also: user logs in after 3 days → "What's changed" shows: "New CIM template available for your industry."

---

### PHASE 11: Market Intelligence Engine (Month 2-3)
**Goal:** Real government data powers Yulia's analysis and standalone intelligence products
**Effort:** ~28 hours
**Systems touched:** 11, 7, 13

**Sub-phase 11A: Data Pipeline Infrastructure (10 hours)**
- Deploy Worker service on Railway (separate from Web)
- pg-boss as PostgreSQL-native job queue
- LangGraph.js agent framework with PostgreSQL checkpointer
- Basic NAICS taxonomy loaded
- Census CBP API integration (first and most impactful)
- BLS QCEW API integration
- FRED API integration
- Stale-while-revalidate caching in PostgreSQL

**Sub-phase 11B: Intelligence Products (10 hours)**
- Market Intelligence Report generator ($200)
- One-click market analysis (NAICS + geography → seven-layer report)
- SBA bankability calculator (live FRED rates + deal parameters)
- Industry Health Index calculation (basic: 3 of 6 components)
- Fragmentation Heat Map generator ($150)
- Intelligence deliverables in canvas (maps, charts, data tables)

**Sub-phase 11C: Engagement-Based Intelligence (8 hours)**
- Engagement scoring per user
- Scan frequency by engagement tier
- Shared intelligence layer (sector analysis runs once, shared across users)
- Per-user token budgets
- Weekly Market Pulse email (free — engagement driver)
- "What's changed" panel populated with real market data

**Verify:** Buyer defines buy box → system fetches Census CBP data → generates market overview → shows: "There are 847 pest control establishments in Dallas County, 23% have 10-50 employees, average payroll $42K" → saves as Market Intelligence Report → costs $200. Also: Intelligence runs overnight → user opens app → "What's changed: SBA rates dropped 0.25% — this improves your deal DSCR from 1.28 to 1.35."

---

### PHASE 12: Sourcing Engine (Month 3-4)
**Goal:** Automated deal matching for buyers; buyer profile generation for sellers
**Effort:** ~20 hours
**Systems touched:** 12, 11, 4, 13

**What ships:**
- Multi-thesis architecture (buyers define multiple buy boxes)
- Thesis-based scoring (every opportunity scored against criteria)
- User-submitted deal analysis (paste listing URL → Yulia evaluates)
- Buyer profile generation for sellers (league-appropriate buyer types)
- Sourcing Sprint deliverable ($60) for buyers
- Match alerts (email + in-app when new match found)
- Daily briefing system (morning email with matches + market updates)
- Deal pipeline for buyers (tracking opportunities through stages)

**Verify:** Buyer creates buy box: "HVAC companies, $500K-$2M revenue, Dallas area" → Yulia confirms thesis → system runs market scan → 3 matches found → scored → presented as cards → buyer clicks one → detailed analysis → "Pursue" or "Pass" → pipeline updates.

---

### PHASE 13: Advanced Deliverables + Living CIM (Month 4-5)
**Goal:** Complete the deliverable catalog; enable living documents
**Effort:** ~20 hours
**Systems touched:** 7, 6, 8

**What ships:**
- Full CIM generator (L1-L6 adapted, 10-60 pages)
- Living CIM (auto-updates when financials change)
- QoE Lite ($500) and QoE Standard ($1,000) generators
- LOI generator with negotiation strategy
- DD checklist generator (auto-tracks progress)
- Working capital model
- Closing funds flow calculator
- 100-Day Integration Plan (PMI)
- Pitch Deck generator (for RAISE journey)
- All remaining deliverables from the 91-item catalog
- CIM share links (blind/teaser/full access levels)
- Watermarking for shared documents

**Living CIM architecture:**
```
Financial data updated → triggers CIM refresh
├── Financial sections regenerated
├── Valuation range recalculated
├── Market context refreshed (if stale)
├── Version incremented
└── Notification to stakeholders
```

**Verify:** Generate CIM → share blind teaser link → recipient sees anonymized version → requests full access → NDA signed → full CIM visible. Also: update financials → CIM auto-refreshes → version history shows change.

---

### PHASE 14: Deep Data + Event Detection (Month 5-6)
**Goal:** SEC EDGAR, IRS SOI, GDELT news monitoring complete the intelligence loop
**Effort:** ~18 hours
**Systems touched:** 11, 12, 13

**What ships:**
- SEC EDGAR Frames API integration (public company benchmarks by industry)
- IRS Statistics of Income integration (private business benchmarks)
- BizBuySell Insight Report data (actual transaction multiples)
- GDELT news monitoring (15-minute updates by NAICS + geography)
- Event detection pipeline (news → Haiku classification → scoring → alert)
- Event-to-deal linkage (surface relevant events for active deals)
- Full Industry Health Index (all 6 components)
- Comparable transaction analysis (EDGAR + BizBuySell)
- pgvector semantic search across cached reports
- Industry-specific KPI templates (CPA, SaaS, HVAC, etc.)

**Verify:** User with active HVAC deal → GDELT detects "New EPA refrigerant regulation" → event scored 7.8 → linked to their deal → appears in "What's changed" → "This regulation could affect 23% of your service revenue. Want me to run an impact analysis?"

---

### PHASE 15: GTM Features (Month 6+)
**Goal:** Marketplace features that create network effects
**Effort:** ~16 hours
**Systems touched:** 9, 12, 5

**What ships:**
- Ghost profile notifications (buyers tracking unclaimed businesses → outreach to owner)
- Broker listing generator (22x-compliant CIMs from raw financials)
- Lender risk dashboard (automated DSCR, LTV, SBA eligibility)
- Transaction token pricing (0.5% success fee on closed deals, $2K minimum)
- Escrow integration (deposit tracking, earnout milestone management)
- Deal velocity analytics (admin dashboard — average time per stage)
- Magma feedback loop (verified post-close financials → improve AI accuracy)
- Journey bridge credits (SELL→BUY 10% credit, BUY→PMI $100)
- Advisor marketplace (basic directory with ratings)

**Verify:** Deal closes → transaction token created → 0.5% fee calculated → Stripe charge → platform earns revenue on deal close. Also: broker creates CIM for client → white-labeled → shared with 5 buyers → 3 request NDAs → broker manages pipeline.

---

### PHASE 16: Intelligence Flywheel (Month 6+, Ongoing)
**Goal:** Platform intelligence compounds with every deal; data products emerge
**Effort:** Ongoing
**Systems touched:** 11, 12, 7

**What ships:**
- Multi-agent research (Opus orchestrator + Sonnet workers in parallel)
- Google Trends integration (demand signals)
- Financial Modeling Prep integration (public company comps)
- Forward-looking risk scoring (AI disruption, tariff exposure, regulatory)
- Market Pulse dashboard (Industry Health Index + sparklines + traffic lights)
- Cross-report semantic search ("find similar markets")
- Transaction data collection (anonymized: industry, multiple, structure, time-to-close)
- Flywheel data products:
  - Transaction Benchmark ($100)
  - Industry Multiple Tracker (dashboard)
  - Buyer Demand Index (dashboard)
  - Time-to-Close Predictor
  - DD Risk Predictor
  - Optimal Pricing Recommendation
- Anonymized Deal Data Export ($500-$2,000/quarter for institutional clients)

---

## COMPLETE TIMELINE

| Phase | Name | When | Effort | What Ships | Revenue Impact |
|-------|------|------|--------|------------|----------------|
| 1 | Front Door | Week 1 | 16 hrs | Chat morph, SPA, anonymous Yulia | $0 (acquisition) |
| 2 | Auth & Conversion | Week 1-2 | 12 hrs | Signup, session migration, sidebar | $0 (conversion) |
| 3 | Gate Engine | Week 2-3 | 16 hrs | 22 gates, deal records, progression | $0 (engagement) |
| 4 | Wallet & Payments | Week 3 | 14 hrs | Stripe, wallet, paywall | 💰 FIRST REVENUE |
| 5 | Canvas + Deliverables | Week 3-4 | 24 hrs | Generation pipeline, viewer, export | 💰💰 CORE REVENUE |
| 6 | Data Room | Week 4-5 | 16 hrs | Document storage, folders, versioning | Retention |
| 7 | Polish + Launch | Week 5 | 12 hrs | E2E testing, error handling, monitoring | Quality |
| — | **🚀 LAUNCH** | **Week 5-6** | — | **Transaction engine live** | **~$500-2K/week** |
| 8 | Collaboration | Week 6-7 | 20 hrs | RBAC, invitations, day passes | Stickiness |
| 9 | Pipeline & Velocity | Week 7-8 | 14 hrs | Visual pipeline, multi-deal mgmt | Engagement |
| 10 | Notifications | Week 8-9 | 16 hrs | Email, nudges, follow-up engine | Re-engagement |
| 11 | Intelligence Engine | Month 2-3 | 28 hrs | Gov data, market reports, IHI | 💰💰💰 NEW REVENUE |
| 12 | Sourcing Engine | Month 3-4 | 20 hrs | Deal matching, buyer profiles | 💰💰 BUYER REVENUE |
| 13 | Advanced Deliverables | Month 4-5 | 20 hrs | Living CIM, QoE, full catalog | 💰💰 PREMIUM REVENUE |
| 14 | Deep Data + Events | Month 5-6 | 18 hrs | EDGAR, IRS, GDELT, pgvector | Intelligence |
| 15 | GTM Features | Month 6+ | 16 hrs | Ghost profiles, broker tools, escrow | Network effects |
| 16 | Flywheel | Month 6+ | Ongoing | Multi-agent, data products, benchmarks | 💰💰💰 DATA REVENUE |

**Total to launch:** ~110 hours (~6 weeks)
**Total to full platform:** ~262 hours (~8 months post-start)

---

## DEPENDENCY GRAPH

```
Phase 1 (SPA Shell + Chat)
    │
    ├──→ Phase 2 (Auth + Conversion)
    │        │
    │        ├──→ Phase 3 (Gate Engine)
    │        │        │
    │        │        ├──→ Phase 4 (Wallet + Payments)
    │        │        │        │
    │        │        │        ├──→ Phase 5 (Canvas + Deliverables)
    │        │        │        │        │
    │        │        │        │        ├──→ Phase 6 (Data Room)
    │        │        │        │        │        │
    │        │        │        │        │        ├──→ Phase 7 (Polish → 🚀 LAUNCH)
    │        │        │        │        │        │
    │        │        │        │        │        ├──→ Phase 8 (Collaboration + RBAC)
    │        │        │        │        │        │
    │        │        │        │        │        └──→ Phase 13 (Advanced Deliverables)
    │        │        │        │        │
    │        │        │        │        └──→ Phase 9 (Pipeline + Velocity)
    │        │        │        │
    │        │        │        └──→ Phase 15 (GTM Features)
    │        │        │
    │        │        ├──→ Phase 10 (Notifications + Engagement)
    │        │        │        │
    │        │        │        └──→ Phase 12 (Sourcing Engine) ←── Phase 11
    │        │        │
    │        │        └──→ Phase 11 (Intelligence Engine)
    │        │                 │
    │        │                 ├──→ Phase 14 (Deep Data + Events)
    │        │                 │
    │        │                 └──→ Phase 16 (Flywheel)
    │        │
    │        └──→ (All phases need auth)
    │
    └──→ (Nothing works without the shell)
```

**Critical path to launch:** 1 → 2 → 3 → 4 → 5 → 6 → 7 → 🚀
**Critical path to differentiation:** 11 → 12 → 14 → 16

---

## DATABASE SCHEMA — ALL TABLES

### Built at Phase 1 (empty until needed):

**Core:**
- users, conversations, messages, deals, anonymous_sessions

**Payments (Phase 4):**
- wallets, wallet_transactions, wallet_blocks, menu_items, deal_packages, deliverables

**Gates (Phase 3):**
- gate_progress, deal_fields (extracted data per deal)

**Intelligence Foundation (Phase 11):**
- industries, market_data_points, research_reports, industry_events, data_source_cache, theses, intelligence_alerts

**Agent State (Phase 11):**
- user_agents, agent_runs, agent_knowledge, agent_change_log, usage_tracking

**Collaboration (Phase 8):**
- deal_network_participants, day_passes, deal_messages

**GTM (Phase 15):**
- living_cims, cim_scenarios, cim_share_links, cim_access_logs, ghost_notifications, transaction_tokens, deal_velocity_events, escrow_transactions, earnout_schedules, ground_truth_data

**Follow-up (Phase 10):**
- follow_up_rules, follow_up_queue, value_trackers, deal_monitors, journey_bridges

**Data Room (Phase 6):**
- data_room_folders, data_room_documents, document_versions, document_access_log

---

## INFRASTRUCTURE

**Phase 1 (0-500 users):**
```
Railway Project
├── Web Service (~0.5 vCPU, 512MB) — Express + React
├── Worker Service (~0.25 vCPU, 512MB) — pg-boss consumer (Phase 11)
└── PostgreSQL (~0.25 vCPU, 512MB, 2GB)
```

Monthly cost: $55 infrastructure + $65-170 Claude API = **$120-225/month**

**Phase 2 (500+ users):** Add Redis + BullMQ ($5-10/month)
**Phase 3 (2K+ users):** BullMQ Pro ($95/month), read replicas, multiple workers
**Phase 4 (enterprise):** Temporal.io, multi-region

---

## KEY DECISIONS (v8 additions)

| Decision | Rationale | Date |
|----------|-----------|------|
| Canvas is Claude artifacts model | Proven UX pattern, users understand split-view | Feb 26, 2026 |
| Data room before collaboration | Can't share documents that don't have a home | Feb 26, 2026 |
| Deliverables render in canvas, not chat | Chat is for conversation; documents need space | Feb 26, 2026 |
| Pipeline is progressive disclosure | Don't overwhelm new users; reveal complexity as they need it | Feb 26, 2026 |
| Intelligence engine is post-launch | Yulia's prompt knowledge (Layer 1) is good enough for first 100 users | Feb 26, 2026 |
| Census CBP is first intelligence integration | Highest single-source value: establishment counts by NAICS × ZIP | Feb 26, 2026 |
| Sourcing engine depends on intelligence | Can't match deals without market data to score against | Feb 26, 2026 |
| Phase 5 is the largest phase (24 hrs) | Canvas + deliverables are two systems that must ship together | Feb 26, 2026 |
| 16 phases, not 10 | v6's 10 phases hid 6 entire systems in "post-launch" | Feb 26, 2026 |
| Total effort: 262 hours, not 140 | v6 undercounted by excluding canvas, data room, collaboration, pipeline | Feb 26, 2026 |

---

## WHAT SUCCESS LOOKS LIKE AT EACH MILESTONE

**Week 1 (Phase 1 complete):**
"I typed into the chat on the homepage. The website transformed into a conversation with Yulia. She knew my industry and gave me a real number. I can't believe this is free."

**Week 3 (Phases 1-4 complete):**
"I've been talking to Yulia for two weeks. She knows my business inside out. She just told me my valuation is $350 to see the full report. That's nothing compared to what a broker charges. I'm buying it."

**Week 5 (🚀 Launch):**
"I paid $350 for a valuation report that took 45 seconds. It's 12 pages with real market data, comparable transactions, and a seven-factor quality score. My CPA said it's better than the one we paid $5,000 for last year. I just bought the CIM package for $700."

**Month 2 (Phase 8-10 complete):**
"I invited my attorney and CPA to the deal room. They can see exactly what they need and nothing else. My attorney added comments on the LOI, and Yulia revised it in 30 seconds. We're submitting the offer tomorrow."

**Month 4 (Phase 11-12 complete):**
"I opened the app and Yulia told me a pest control company matching my buy box just appeared in Dallas. She scored it 87/100 against my thesis, checked SBA eligibility, and modeled my returns — all before I finished my coffee. I'm calling the broker today."

**Month 6+ (Full platform):**
"I run my entire M&A practice through SMBX. I have 4 active buy-side deals and 2 sell-side. Yulia manages all of them — sourcing, analysis, DD tracking, document management, investor communication, closing checklists. My attorney and CPA both have accounts. I spent $3,200 on the platform this quarter. My old advisory firm charged me $50,000 for less."

---

*BUILD_PLAN_v8 — February 26, 2026*
*The definitive build plan. Every system, every phase, every dependency. The whole building, not just the front door.*
