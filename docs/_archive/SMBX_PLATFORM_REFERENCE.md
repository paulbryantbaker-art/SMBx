# smbX.ai — PLATFORM REFERENCE
## Single source of truth for decisions, architecture, and standards
## Place in repo root. CC reads this alongside CLAUDE.md.
## Last updated: March 28, 2026

---

# §1. THE LINE — What Yulia Can and Cannot Do

smbX does 90% of what an IB does — everything that doesn't require a license. Yulia is the AI deal team (analyst + associate + VP).

## Golden Pattern
**Analysis → Options → Implications → User Decides.**

Every interaction follows this sequence. Yulia presents analysis, lays out options with trade-offs, explains implications of each path, and the user makes the decision.

## Yulia ALWAYS Does
- Generate documents (valuations, CIMs, financial models, DD checklists, LOIs, pitch decks)
- Draft communications for the user to send (buyer outreach, counter-offers, DD follow-ups, attorney requests)
- Score and rank offers against objective criteria
- Drive the deal timeline with proactive nudges and status tracking
- Coordinate due diligence (checklist generation, item tracking, red flag identification)
- Model scenarios (base/bull/bear, sensitivity analysis, what-if)
- Present market data with sources cited

Every drafted communication ends with: **"[Review and send when ready — adjust the tone and details to match your style.]"**

## Yulia NEVER Does
- **Recommend** — never says "you should" or "I recommend." Says "here are three options" with analysis of each
- **Negotiate on behalf** — never contacts counterparties. Drafts messages for the user to send
- **Advise** — never says "my advice is." Presents analysis and implications
- **Represent** — never acts as the user's agent or fiduciary
- **Guarantee** outcomes, prices, or timelines — gives ranges with methodology, never promises
- **Use "we" language** — Yulia is a tool, not a partner. "I've prepared" not "we've prepared"
- **Price anchor against advisors** — never says "a broker would charge $50K for this." Sells the intelligence, not the price gap

## Regulatory Boundary
The platform is NEVER described as an "AI advisor" in any user-facing context due to fiduciary language concerns. It is a "deal intelligence platform." Yulia is an "AI deal team" or "AI analyst."

---

# §2. PRICING MODEL (Authoritative — March 26, 2026)

## Subscription Tiers

| Tier | Price | Key Features |
|------|-------|-------------|
| **Free** | $0 | Unlimited Yulia conversation + ONE structured deliverable (email required to receive it) |
| **Starter** | $49/mo | ValueLens, deal scoring, VRR, SDE/EBITDA analysis, Investment Thesis, Capital Stack, basic exports |
| **Professional** | $149/mo | Everything in Starter + CIM, deal room, matching, sourcing, DD/LOI tools, living documents |
| **Enterprise** | $999/mo | Everything in Professional + unlimited team members, white-label outputs, API, portfolio dashboard |

## Rules
- Monthly billing only at launch. No annual pricing until 90 days of churn data.
- 30-day free trial of Professional available to all users.
- No per-deal fees. No success fees. No wallet. **WALLET IS DEAD.**
- No separate broker/advisor tiers. Solo broker = $149 Professional. Broker with team = $999 Enterprise.
- Subscription continues post-close for PMI support (180 days).
- "Contact Sales" does not exist anywhere. All CTAs route to "Talk to Yulia" in chat.
- TEST_MODE=true in env vars → getUserPlan() returns 'enterprise' for all users.
- The free deliverable is per-user, not per-session. Tracked on users table.
- Email capture required for the free deliverable — this is the account creation moment.

## Paywall Placement
NOT at a fixed gate (S2/B2). Triggers after the first free deliverable — whenever that happens in the conversation. The upgrade from $49 Starter to $149 Professional triggers when the user needs a Professional-tier feature (CIM, deal room, matching).

## Gates Are Readiness-Only
Gates check whether prerequisite work is done. They NEVER check payment status. Gate advancement is always allowed if readiness criteria are met.

---

# §3. DESIGN SYSTEM — Guber v5.2

## Typography
- **Headings:** Sora (weight 800 for page titles, 600 for section heads)
- **Body:** Inter (weight 400 regular, 500 medium, 600 semibold)
- **Monospace:** For financial figures in some table contexts

## Colors
| Token | Value | Usage |
|-------|-------|-------|
| Background | #FAFAFA | Page background |
| Primary text | #1A1A18 | All body text |
| Secondary text | #44403C | Subheadings, labels |
| Muted text | #6E6A63 | Captions, footnotes |
| Terra cotta | #D4714E | **Functional only** — active states, send button, section labels, hero data numbers. NEVER decorative backgrounds. |
| TerraSoft | #FFF0EB | User message bubble background |
| Cream | #FAF8F4 | Alternate section backgrounds |
| Card bg | #FFFFFF | White cards |
| Card border | #eeeef0 | Card borders, dividers |
| App bg | #f9f9fc | App shell background |

## Logo
`smbX.ai` — ONLY the X is terra cotta (#D4714E). Everything else (smb, .ai) is primary text color.

Engine brand variant: `smbX.ai Engine` — X and "Engine" are terra, "smb" and ".ai" are primary.

## Key Component Rules
- **ChatDock:** ONE shared component used on both public pages and chat. Tools popup, file upload, attachment chips, auto-expand textarea.
- **User message bubbles:** bg #FFF0EB, text #1A1A18, border 1px solid rgba(212,113,78,0.18), shadow 0 1px 3px rgba(26,26,24,.06). NOT solid terra or dark backgrounds.
- **Desktop hero pattern:** `hidden md:flex min-h-[calc(100vh-80px)] flex-col items-center justify-center px-6` with gap:7vh, max-w-[860px] chat card with shadow-2xl/40px radius/2px solid #D1D5DB.
- **iOS Safari:** overflow-hidden must NEVER be applied to position:fixed chat containers. Use `--app-height` from visualViewport.height.
- **Chat morph:** Uses AppPhase state machine with CSS animations — not useNavigate (causes remount, kills fade).

---

# §4. DELIVERABLE RENDERING GUIDE

Every deliverable has up to three rendering targets:
1. **Canvas** — interactive React view side-by-side with chat (tabbed workspace)
2. **Export** — polished downloadable file (PDF/DOCX/XLSX/PPTX)
3. **Share** — secure read-only view for external recipients

## Category A: Narrative Reports → PDF
ValueLens, Business Valuation, Seven-Factor Analysis, VRR, Market Intel, SBA Analysis, DD Risk Summary, Deal Screening Memo, Earnings Summary.

- Server-side PDF via reportlab (Python). Branded cover page, headers/footers, financial tables with IB formatting, charts as embedded PNG.
- **CC skill reference:** `/mnt/skills/public/pdf/SKILL.md`

## Category B: Marketing Documents → PDF / PPTX
CIM (10-60 pages, league-adapted), Blind Teaser (1-2 pages), Executive Summary, Pitch Deck (12-20 slides).

- CIM is the flagship. Full TOC, financial exhibits, watermarking for shared copies.
- Pitch Deck uses pptxgenjs.
- **CC skill references:** `/mnt/skills/public/pdf/SKILL.md`, `/mnt/skills/public/pptx/pptxgenjs.md`

## Category C: Financial Models → XLSX
Pro Forma, SBA Model, Capital Structure, Working Capital, Cap Table, Dilution Model, Funds Flow, Earnout, Post-Close Cash Flow.

- Real Excel formulas, not hardcoded values. IB color coding: blue inputs, black formulas, green cross-sheet, yellow assumptions. Negatives in parentheses, zeros as "-".
- **CC skill reference:** `/mnt/skills/public/xlsx/SKILL.md`

## Category D: Legal/Transactional → DOCX
LOI, Counter Proposal, Term Sheet Analysis, DD Checklist (with actual checkbox fields), Closing Checklist, Data Room Structure.

- Clean letterhead, proper business letter format. Attorneys must be able to edit these.
- **CC skill reference:** `/mnt/skills/public/docx/SKILL.md`

## Category E: Operational Plans → PDF / DOCX
Integration Plan (PMI), Day Zero Checklist, Employee Comms, Customer/Vendor Outreach, Transition Plan, Seller Training Schedule.

## Category F: Communication Drafts → In-Chat
Buyer outreach, counter-offers, DD follow-ups, attorney requests. Rendered as cards in chat with "Copy" button. Not files.

## Brand Template System
All exports share a common `smbxBrand.ts` module:
- Terra cotta as accent only (section dividers, one data highlight — never backgrounds)
- Typography: 24pt title → 18pt section → 14pt subsection → 11pt body → 9pt footnote
- Every doc: branded cover page, headers, footers, confidentiality notice
- Financial tables: right-aligned, $ with commas, negatives in parentheses, alternating rows, source footnotes
- Data always cites source: "Source: U.S. Census Bureau, CBP (2023)"
- White space is generous — spacious = premium
- Disclaimer on final page (not intrusive)

## Design Principles
1. Every document has a cover page
2. Every document has proper headers/footers
3. Financial tables use IB formatting
4. Charts are clean — no 3D, no rainbow. Max 3-4 colors. Source citation below.
5. Terra cotta is an accent, not a theme
6. White space is a feature
7. Data always cites its source
8. Every export is self-contained (readable without chat context)
9. Disclaimers present but not intrusive

---

# §5. INTERACTIVE CANVAS ARCHITECTURE

## Tabbed Workspace (Dia Browser Model)
The canvas supports unlimited tabs. Each tab is an independent rendering surface. Tabs persist within a deal session. Users can close, reorder, pin. "+" creates new.

**Tab types:**
- Model tabs — live interactive (valuation, LBO, SBA, DCF, sensitivity, comparison, cap table, earnout)
- Document tabs — view/annotate (CIM, valuation report, DD checklist)
- Comparison tabs — derived from two or more model tabs (auto-update when sources change)
- Data tabs — sourcing results, market intelligence, pipeline view

## Two Input Channels
Every model tab has an `assumptions` state object. Both UI controls (sliders, inputs, toggles) and Yulia (via `update_model` tool) modify the same state → deterministic recalculation → instant re-render.

**Critical: calculations are deterministic JavaScript, not AI.** DSCR, IRR, MOIC, valuation ranges, amortization — all pure functions. Same inputs always produce same outputs. Instant (<16ms). Auditable. Exportable as real Excel formulas.

AI is used for: generating initial assumptions, interpreting results, suggesting scenarios, drafting communications based on outputs.

## Yulia's Canvas Tools

```
update_model      — modify assumptions in any tab (by tabId or "active")
create_model_tab  — open a new interactive model tab
render_to_tab     — push generated content to a tab
read_tab_state    — read assumptions + outputs from any tab ("active" or "all")
```

## Cross-Tab Awareness
Yulia's system prompt includes a summary of all open tab states. She can reference any tab. Linked tabs auto-update when source tabs change. Comparison tabs derive from model tabs.

User: "What about this one?" → Yulia reads active tab.
User: "Apply same assumptions to Company B" → Yulia copies Tab 1 to Tab 2.
User: "Which deal should I pursue?" → Yulia reads all tabs and compares.

## Interactive Model Types

### Valuation Explorer
Sliders for add-backs, multiple range, methodology weights. Live valuation range chart, SDE waterfall, multiple context chart.

### LBO / Acquisition Model
Purchase price, EBITDA, growth, exit multiple, debt structure, synergies. Returns dashboard (IRR, MOIC, cash-on-cash), DSCR gauge, pro forma table, sensitivity matrix. This is where "increase EBITDA by 10%" works.

### SBA Financing Calculator
Down payment %, loan term, rate, seller note. Go/no-go traffic light (DSCR ≥ 1.25 = green), monthly payment breakdown, amortization schedule.

### Deal Comparison
Reads from other model tabs. Side-by-side cards, radar chart, comparison table with green/red highlighting. The "which deal should I buy" view.

### Sensitivity Matrix
Pick two variables, see output metric at every intersection. Color gradient from red (below hurdle) to green (exceeds target).

### Cap Table / Dilution (Raise)
Pre/post ownership pie, dilution waterfall, payout waterfall at exit values, MOIC per investor class.

### Earnout Scenario
Probability-weighted expected value, fan chart (best/expected/worst), effective total price.

## Calculation Engine
Pure JavaScript functions shared client/server:
- `calculateSDE`, `calculateValuationRange`
- `calculateIRR`, `calculateMOIC`, `calculateDSCR`, `buildProForma`
- `calculateSBAEligibility`, `calculateAmortization`
- `calculateDilution`, `calculateWaterfall`
- `buildSensitivityMatrix`

## Export from Interactive Models
- PDF: snapshot of current state as branded report. Charts as images. Assumptions in appendix.
- XLSX: full model with real Excel formulas. Blue inputs, black formulas. Sensitivity as separate sheet.
- Version history tracks each export as point-in-time.

## Mobile
Full-screen sheet over chat. Horizontal scroll tab strip. Touch-friendly sliders. Back gesture preserves tab state.

---

# §6. SOURCING ENGINE

## Architecture
Research-first: every sourcing journey begins with an Acquisition Intelligence Brief (industry landscape, NAICS mapping, market structure, deal economics, competitive buyer landscape) before any specific targets.

## Data Sources
| Source | What It Provides | Lag | Cost |
|--------|-----------------|-----|------|
| Census CBP (2023 endpoint) | Establishment counts, employees, payroll by NAICS × geography | 2-3 years | Free |
| BLS QCEW | Employment, wages, establishment counts by NAICS × county | 6 months | Free |
| Census BDS | Firm age distribution, entry/exit rates | Annual | Free |
| FRED | Prime rate, unemployment, CPI, regional data | Real-time | Free |
| SBA 7(a) loan data | Loan counts, amounts by NAICS × state | 1 quarter | Free |
| Google Places | Specific businesses by name, address, rating, reviews | Real-time | ~$0.03/request |

## What's Built (2,374 lines)
marketDataService.ts (Census/FRED/BLS), discoveryService.ts (Google Places), thesisMatchingService.ts, buyerSourcingService.ts, listingIngestionService.ts, searchService.ts, marketOpportunityService.ts, saleReadinessService.ts, revenueEstimationService.ts, ownershipDetectionService.ts

## What's Not Wired Yet
- `scan_market` tool (Yulia can't trigger discovery from conversation)
- Census BDS integration (no firm age data)
- SBA lending dataset (no sba_loan_stats table)
- Website enrichment via Haiku
- Aggregator monitoring (daily BizBuySell scan)
- Market heat scoring service
- Company type classification (see §7)

## Multi-Source Display
Yulia should present layered data: "Census says 847 establishments (2023). BLS quarterly data shows 12.4% growth. Google Places identifies 614 with active web presence. SBA funded 31 acquisitions in this market last year." Always show data vintage.

---

# §7. COMPANY TYPE CLASSIFICATION

The sourcing engine must classify every business it encounters. Census counts ALL establishments — PE-backed roll-ups, public company subsidiaries, franchise units, and chain locations are not acquisition targets for most buyers.

## Types to Detect
1. **PE-Backed / Roll-Up Platforms** — already owned by private equity. They're buyers, not targets. Detection: SEC filings, website "portfolio" pages, LinkedIn exec titles ("VP of M&A"), Crunchbase. Hard case: PE add-on that kept original name.

2. **Public Company Subsidiaries** — not acquirable. Map via SEC EDGAR subsidiary exhibits, D&B corporate family trees. A public company may operate 200 local service locations.

3. **Multi-Location Chains & Franchises** — chain locations aren't independent. Franchise units MIGHT be acquirable (franchisee can sell). Detection: same website domain, same phone prefix, Google Places "chain" attribute, FDD data.

4. **Non-Physical-Location Businesses** — consulting, digital, professional services. Invisible to Google Places pipeline. Need alternative data sources: state registrations, SBA loans, professional licensing boards.

## Why It Matters
The difference between "847 HVAC companies" (Census) and "~580 independently-owned, acquirable HVAC businesses" (after filtering). Platform credibility depends on this.

---

# §8. COPY RULES

- **Never say "small business"** — smbX serves ALL deal sizes, $300K to mega-cap
- **Advisors/brokers are CUSTOMERS, not competitors** — never position against traditional advisory
- **Never use "old way vs new way" comparisons** — never anchor pricing against advisory fees
- **No deliverable names on journey pages** — lead with outcomes, not product names
- **No "we" language** — Yulia is a tool, not a team member
- **IB comparison framing** — approved for How It Works and Pricing pages only, with mandatory callout clarifying it is not anti-advisor positioning
- **Copy voice** — sounds like a veteran M&A advisor who has closed deals around the world. Human, sympathetic, authoritative, specific. Never AI-generated marketing copy.
- **ValueLens** is the authoritative name (not Bizestimate, not "business valuation tool")
- **"Talk to Yulia"** replaces "Contact Sales" everywhere

---

# §9. FOUR JOURNEYS — GATE MAP

## Sell Journey (S0-S5)
6-month to 2-year arc: understand → optimize → prepare → exit.
Exit types: full sale, partner buyout, capital raise, ESOP, majority share sale, partial stock/asset.

| Gate | Name | Key Deliverables |
|------|------|-----------------|
| S0 | Getting Started | Business profile, league classification |
| S1 | Financial Deep-Dive | SDE/EBITDA analysis, add-back schedule, ValueLens |
| S2 | Valuation & Positioning | Valuation report, seven-factor, market snapshot |
| S3 | Deal Materials | CIM, blind teaser, buyer list |
| S4 | Buyer Matching | Outreach strategy, meeting prep, LOI analysis |
| S5 | Closing & Transition | DD coordination, working capital, funds flow, transition plan |

## Buy Journey (B0-B5)
Extends 180 days post-close with PMI. Buyer value = speed to conviction.

| Gate | Name | Key Deliverables |
|------|------|-----------------|
| B0 | Thesis & Readiness | Investment thesis, target criteria, capital stack |
| B1 | Deal Screening | Market scan, deal scoring, screening memos |
| B2 | Valuation & Modeling | Financial model, SBA analysis, LOI draft |
| B3 | Due Diligence | DD checklist, risk summary, QoE |
| B4 | Deal Structure | Sources & uses, earnout model, working capital |
| B5 | Closing & Integration | Funds flow, closing checklist → auto-transition to PMI |

## Raise Journey (R0-R5)
| Gate | Name |
|------|------|
| R0 | Readiness Assessment |
| R1 | Financial Package |
| R2 | Investor Materials (pitch deck, data room) |
| R3 | Investor Outreach |
| R4 | Term Negotiation |
| R5 | Closing the Raise |

## PMI Journey (PMI0-PMI3)
| Gate | Name |
|------|------|
| PMI0 | Day Zero (first 48 hours) |
| PMI1 | Stabilization (30 days) |
| PMI2 | Assessment (60-90 days) |
| PMI3 | Optimization (90-180 days) |

---

# §10. WHAT'S BUILT vs WHAT'S NOT (Updated March 28, 2026)

## Built and Working

### Core Platform
- Chat loop: anonymous + authenticated, SSE streaming, morph from landing to chat
- 16 agentic tools in tools.ts (including 3 canvas model tools)
- 28 generators with model routing (deterministic/haiku/sonnet/opus)
- 45 normalizer switch cases + 10 aliases + category generators
- Gate system: 22 gates, readiness checks, gate prompts (1,171 lines)
- Knowledge injection: industry profiles, SBA rules, methodology, market context
- Seven-factor scoring (123 lines)
- All 7 journey pages as content components (6,434 lines total)
- AppShell (1,777 lines) — THE layout, unified routing, deal-grouped sidebar, tabbed canvas
- Auth: register, login, JWT, Google OAuth, password reset, anonymous→auth migration
- Auto-migrations on server startup (no manual SQL on Railway)

### Subscription & Payments
- subscriptionService.ts (387 lines) — getUserPlan, canGenerateDeliverable, createCheckout, webhook handling
- Stripe integration: POST /subscribe, GET /subscription, POST /portal
- TEST_MODE=true → enterprise for all users
- Free deliverable tracking (one per user)
- Paywall triggers after first free deliverable

### Tabbed Canvas System
- Multi-tab canvas in AppShell (Dia browser model)
- Vertical icon strip on right edge (desktop, 2+ tabs)
- Horizontal pill tabs in full-screen overlay (mobile)
- Tab content persists when switching (all mounted, inactive hidden)
- Tools (Pipeline, Sourcing, Data Room, Library, Settings) open as canvas tabs

### Calculation Engine (22 formula types, all pure JS, <16ms)
- SDE, EBITDA with add-back schedules
- Valuation (multiple-based, blended multi-methodology, DCF)
- DSCR, monthly payment, SBA eligibility, amortization
- IRR (Newton-Raphson), MOIC, cash-on-cash
- LBO full model (pro forma, sources/uses, exit analysis)
- Sensitivity matrix builder (any 2 variables × any output)
- Free cash flow waterfall
- Tax impact (asset sale by IRC §1060 class, stock sale, goodwill §197, installment §453)
- Cap table dilution + exit waterfall with liquidation preferences
- Earnout expected value (probability-weighted, PV)
- Working capital normalization (12-month average, seasonal variance)
- Covenant compliance (DSCR, Debt/EBITDA, LTV headroom)

### 10 Interactive Model UIs
- Valuation Explorer: sliders for add-backs, multiples, methodology weights, live range chart
- LBO / Acquisition: returns dashboard (IRR/MOIC/DSCR), pro forma table, DSCR timeline, sensitivity heatmap, sources & uses
- SBA Financing: go/no-go traffic light, DSCR gauge, amortization schedule
- Tax Impact: asset vs stock sale side-by-side, PPA allocation, installment sale
- Cap Table: rounds editor, ownership pie chart, exit waterfall at multiple valuations
- Sensitivity Matrix: 2-variable color-coded heatmap from any parent model
- Deal Comparison: side-by-side metrics with best-deal highlighting, risk-return radar
- Earnout: milestone editor with probability sliders, EV vs max payout chart
- Working Capital: 12-month trend with peg line, seasonal variance
- Covenant Compliance: DSCR/Debt-to-EBITDA/LTV headroom dashboard
- All grids responsive (stack on mobile), 28px slider thumbs, numeric keyboard inputs

### Yulia's Canvas Tools
- create_model_tab — opens interactive models from conversation
- update_model — modifies assumptions ("what if EBITDA is $1.5M") → instant recalc
- read_tab_state — reads canvas state for contextual responses
- get_sourcing_portfolio — reads buyer's sourcing pipeline
- SSE canvas_action handler — tool results flow to zustand store → charts update

### Sourcing Engine (5-stage pipeline)
- sourcingPipelineService.ts — orchestrates all 5 stages
- Stage 1: Intelligence Brief (Sonnet + Census CBP/BDS + SBA + FRED + market heat)
- Stage 2: Expansion Search (Google Places free ID-only search, 500-2K candidates)
- Stage 3: Tiered Enrichment (Essentials → Pro → Haiku website → Sonnet deep)
- Stage 4: Multi-factor scoring (6 dimensions, A/B/C/D tiers, Haiku batch summaries)
- Stage 5: Portfolio management (PortfolioCanvas UI, status tracking, on-demand enrichment)
- googlePlacesClient.ts — field-mask-enforced billing safety, usage tracking
- Background refresh: weekly (A/B candidates), monthly (expansion re-run)
- marketHeatService.ts — industry heat 1-5 scale, PE activity signals
- websiteEnrichmentService.ts — Haiku-powered website analysis, 30-day cache
- aggregatorMonitorService.ts — BizBuySell via Apify, daily scans
- thesisMatchingService.ts — buyer thesis scoring, daily scan job
- buyerSourcingService.ts — reverse matching (sellers → buyer demand)

### Premium Document Exports
- HTML→PDF via Puppeteer (headless Chromium) + Chart.js server-side charts
- ValueLens template: branded cover + financial analysis with 4 chart types
- chartService.ts: valuation range bar, multiple comparison, deal score radar, earnings breakdown
- Dockerfile updated with Chromium + canvas native deps
- Legacy pdfkit/docx/exceljs pipeline preserved as fallback
- Data room with folders, share links, NDA, access logs
- Collaboration RBAC: owner/attorney/CPA/broker/lender roles

### Infrastructure
- pg-boss workers: daily thesis scan, daily aggregator scan, daily enrichment batch, weekly freshness scan, weekly portfolio refresh, monthly portfolio expansion, quarterly ValueLens refresh, FRED rate monitor
- Dot grid background on body (CSS radial-gradient, responsive opacity)

## Not Built Yet
- Living documents (stale detection exists in dealFreshnessService, but proactive regeneration + version tracking UI not wired)
- Auditor mode (prompt injection when processing uploaded docs — NotebookLM-style grounded verification)
- Company type classification (PE-backed, franchise, chain vs independent — filtering Census counts)
- draft_communication tool (Yulia drafts outreach/counter-offers as in-chat cards with "Copy" button)
- render_to_tab tool (push generated content to a specific canvas tab)
- XLSX export with real Excel formulas (currently values snapshot, not formula-linked)
- Map view for sourcing results (Google Maps embed with score-coded pins)
- Canvas tab reordering and pinning
- Swipe-between-tabs gesture on mobile

## Recently Cleaned Up (March 28, 2026)
- All wallet code removed (walletService, paywallService, dealExecutionFee, platformFeeService deleted)
- Bizestimate renamed to ValueLens everywhere
- Pricing pages updated to $49/$149/$999
- Advisor-specific tiers removed
- Orphan files deleted (Home.tsx, Chat.tsx, chat/Sidebar.tsx, standalone pages, animations duplicate)
- Census CBP endpoint updated to 2023
- CLAUDE.md rewritten
- METHODOLOGY_V17.md updated to v17.1 (interactive canvas, sourcing, premium exports, subscriptions)
