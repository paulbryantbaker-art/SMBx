# Remaining Work — smbX.ai

## FIXED
- ~~Notification schema mismatch~~ — Fixed in `274d26d`

---

## Part 1: Journey Intelligence (HIGH PRIORITY)

The core product value — the actual journey paths and how Yulia guides users through them — is underbuilt. The gate system (S0-S5, B0-B5) exists structurally but lacks the depth of real-world M&A advisory intelligence.

### Seller Journey — Exit Readiness (6 months to 2 years)

The seller journey isn't just "list and sell." Getting a business ready for a premium exit is a long process and smbX.ai should be the platform that guides owners through every step — without ever being a listing site.

**What's missing:**

#### A. Multiple Exit Structures
The platform currently assumes a full sale. Real owners have multiple paths and Yulia needs to understand, explain, and guide each:

1. **Full Sale** — sell 100% and walk away
2. **Partner Buyout** — one partner buys out the other(s)
3. **Capital Raise** — bring in outside capital without selling control (the Raise journey exists but isn't connected to seller context)
4. **Employee Buyout (ESOP/MBO)** — management or employees acquire the business
5. **Majority Share Sale** — sell controlling interest while retaining minority stake
6. **Stock/Asset Transfer Combinations** — partial asset sales, stock swaps, earnouts, seller financing structures

**Needs:**
- Exit structure selection in S0/S1 (Yulia asks: "How are you thinking about your exit?")
- Each structure needs its own valuation lens, legal considerations, tax implications, and timeline
- Gate prompts adapted per structure (e.g., partner buyout doesn't need buyer matching but does need partner negotiation tactics)
- Schema: `deals.exit_structure` or `company_profiles.exit_type` field
- Deliverables adapted per structure (e.g., ESOP feasibility analysis, partner buyout term sheet template)

#### B. The Value Creation Story
Yulia needs to articulate clearly HOW smbX.ai improves outcomes:
- **Deal Intelligence** — how market data, buyer demand signals, and comp analysis lead to better pricing
- **Readiness scoring** — why a business that scores 85/100 on readiness commands a 15-30% premium over one that scores 50
- **Improvement roadmap** — specific, prioritized actions that increase valuation (already partially built in seller dashboard, but Yulia doesn't weave this into conversation naturally)
- **Premium buyer matching** — finding the RIGHT buyer (strategic, PE, search fund) who will pay more because of synergy, not just any buyer
- **Timeline management** — setting realistic expectations (6-24 months) and keeping sellers engaged through the process

#### C. Seller Negotiation Intelligence
Yulia needs real-world negotiation tactics for sellers:
- How to handle lowball offers
- When and how to create competitive tension among buyers
- Earnout structuring and risks
- Seller financing as a deal sweetener vs. trap
- Working capital adjustments and how they change the effective price
- Non-compete and transition period negotiation
- Reps & warranties negotiation (what to push back on)
- Escrow/holdback strategies
- When to walk away and how to do it

### Buyer Journey — Target and Acquire

The buyer journey should be: find the right deal fast, understand WHY it's right (or wrong), navigate negotiation, bring everyone to the table, and follow through 180 days post-close.

**What's missing:**

#### A. Deal Qualification Intelligence
The current pipeline shows scores but doesn't help buyers quickly understand the "why":
- **"This IS the right deal because..."** — Yulia should synthesize thesis fit, financials, market position, and seller motivation into a clear recommendation
- **"This is NOT a deal to pursue because..."** — equally important: fast disqualification with specific reasons (concentration risk, declining revenue, unrealistic ask, regulatory issues)
- **Deal Screening Memo** — exists as a deliverable type but needs to be the centerpiece of buyer decision-making, not just a document

#### B. Full Deal Lifecycle
Currently the buyer journey focuses on sourcing. The full path:
1. Thesis definition (B0) ✓ built
2. Discovery + sourcing (B1) ✓ built
3. Target evaluation + valuation (B2) — partially built
4. **Due diligence orchestration** (B3) — LOI templates, DD checklist, document requests, red flag identification
5. **Deal structuring** (B4) — SBA modeling, seller financing, earnout structures, equity rolls
6. **Negotiation + closing** (B5) — term negotiation, purchase agreement review, closing checklist
7. **PMI (Post-Merger Integration)** — 180-day value creation plan, Day 1 checklist, stabilization period, employee communication, customer retention

#### C. Collaboration — Bring Everyone to the Table
Buyers need to invite:
- Business brokers / intermediaries
- Attorneys (buyer-side and seller-side)
- CPAs / accountants
- SBA lenders
- Investors / equity partners
- Operating partners

Each participant needs appropriate access levels and deal room visibility. (Session 16 covers RBAC but needs to be designed with this buyer workflow in mind.)

#### D. Buyer Negotiation Intelligence
Yulia needs real-world negotiation tactics for buyers:
- How to structure LOIs that protect the buyer while remaining competitive
- Quality of earnings analysis and what to look for
- Working capital peg negotiation
- Seller note structuring (interest rate, term, subordination)
- Earnout design that aligns incentives
- Reps & warranties — what to insist on
- Escrow sizing and release triggers
- When to re-trade and when it kills the deal
- How to negotiate with brokers vs. direct with sellers
- Multi-offer situations — how to win without overpaying

---

## Part 2: Code Gaps (Sessions 11-15)

### 2. Revenue estimation is orphaned
**File:** `server/services/revenueEstimationService.ts`

Service exists but is never called. Company profiles never get `revenue_estimated_low`/`revenue_estimated_high` populated.

**Fix:** Call from `discoveryService.upsertDiscoveryTarget()` after creating a company profile.

### 3. Discovery routes use setImmediate instead of pg-boss
**Files:** `server/routes/discovery.ts:30`, `server/routes/buyerPipeline.ts:157`

Both routes fire-and-forget via `setImmediate`. The pg-boss worker and `enqueueDiscoveryScan()` exist but aren't wired in. Works for testing but scans won't survive server restarts.

**Fix:** Replace `setImmediate(() => runDiscoveryScan(...))` with `enqueueDiscoveryScan(thesisId)`.

### 4. BizBuySell via Apify
**File:** `server/services/discoveryService.ts:154-161`

Placeholder that logs "configure Apify actor ID". No actual scraping.

### 5. Whoxy WHOIS lookups
Not implemented. Needed for domain age signals in sale-readiness scoring.

### 6. Hunter.io email enrichment
Not implemented. Tier 2 enrichment for owner contact discovery.

### 7. Apollo.io company enrichment
Not implemented. Tier 3 enrichment for employee count, revenue ranges, leadership.

### 8. Bizestimate PDF/shareable card
Not implemented. Shareable one-page business value summary for sellers.

### 9. Geographic subdivision for Google Places
Not implemented. Currently gets max 60 results per geography. Grid-cell subdivision would improve coverage.

---

## Part 3: Sessions 16-18 (prompts not yet written)

| Session | What Ships | Priority | Est. Time |
|---------|-----------|----------|-----------|
| **16** | **Collaboration:** RBAC, deal rooms, advisor access, day passes | Medium | 5-6 hrs |
| **17** | **Pipeline view:** visual gate progression, deal cards, multi-deal management | Medium | 4-5 hrs |
| **18** | **Notifications:** email service, gate nudges, match alerts, weekly digest | High | 4-5 hrs |

### Session 16 — Collaboration
RBAC for deal rooms. Advisor/broker access with configurable permissions. Day passes for temporary access (schema exists in migration 009). Deal invitations with token-based acceptance (routes partially exist). **Must be designed around the buyer workflow above** — inviting attorneys, CPAs, lenders, partners to specific deal rooms with appropriate visibility.

### Session 17 — Pipeline View
Visual gate progression (S0-S5 / B0-B5 / R0-R5). Deal cards with status indicators. Multi-deal management. Enhances existing `PipelinePanel`.

### Session 18 — Notifications
Email delivery service (SendGrid/Postmark/SES). Gate nudges. Match alerts for buyers. Weekly digest of pipeline activity and valuation changes.

---

## Part 4: Go-Live Prerequisites (not blocking testing)

- Email sending infrastructure (SendGrid/Postmark/SES)
- Auth flow polish (login/signup UX, password reset, email verification)
- Share links / public document access
- Production Stripe keys (currently TEST_MODE=true)
- SSL + custom domain on Railway
- Error monitoring (Sentry or similar)
- Analytics (Mixpanel/Amplitude/PostHog)

---

## Environment Variables Needed (for missing integrations)

```
APIFY_API_TOKEN=...          # apify.com — BizBuySell scraping
HUNTER_API_KEY=...           # hunter.io — email finding ($49/month)
APOLLO_API_KEY=...           # apollo.io — company enrichment (free tier)
WHOXY_API_KEY=...            # whoxy.com — WHOIS lookups ($0.002/lookup)
GOOGLE_PLACES_API_KEY=...   # Already defined — needed for discovery
```

---

## Summary

| # | Item | Severity | Category |
|---|------|----------|----------|
| — | **Journey Intelligence** | | |
| 1 | Multiple exit structures (full sale, partner buyout, ESOP, capital raise, majority sale, asset transfer) | **Critical** | Product |
| 2 | Seller value creation story — how Deal Intelligence improves outcomes | **Critical** | Product |
| 3 | Seller negotiation tactics (lowballs, earnouts, reps & warranties, walk-away) | **High** | Product |
| 4 | Buyer deal qualification ("why this IS/ISN'T the right deal") | **Critical** | Product |
| 5 | Buyer full lifecycle (DD orchestration, deal structuring, negotiation, PMI 180-day plan) | **Critical** | Product |
| 6 | Buyer negotiation tactics (LOI structuring, QoE, working capital, seller notes) | **High** | Product |
| 7 | Collaboration workflow for buyer deal teams (attorneys, CPAs, lenders, partners) | **High** | Product |
| — | **Code Gaps** | | |
| 8 | Revenue estimation orphaned | **Medium** | Code |
| 9 | setImmediate vs pg-boss | **Medium** | Code |
| 10 | BizBuySell stub | **Medium** | Code |
| 11 | Whoxy/Hunter/Apollo integrations | **Medium** | Code |
| 12 | Bizestimate PDF | **Medium** | Code |
| 13 | Geo subdivision | **Low** | Code |
| — | **Platform** | | |
| 14-16 | Sessions 16-18 (Collaboration, Pipeline View, Notifications) | **Pending** | Platform |
| 17+ | Go-live prerequisites (email, auth polish, Stripe prod, monitoring) | **Pending** | Go-live |
