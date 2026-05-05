# smbX.ai — Pricing, Hook & Retention Strategy
**Version:** 1.0 | **Date:** March 21, 2026
**Status:** Authoritative — supersedes Pricing Catalog v2 wallet model, Market Strategy subscription model, and all prior pricing discussions
**Purpose:** Defines what smbx.ai IS, what each user segment gets free, what they pay for, and why they stay. This document governs pricing implementation, marketing copy, Yulia's paywall conversations, and the CC build prompt.

---

## PART 1: WHAT WE ARE

### Legal Identity

smbx.ai is an **AI-powered deal intelligence platform**. We are not a business brokerage, law firm, investment advisor, appraiser, or financial advisor. We generate AI-powered estimates, analysis, and documents for informational purposes. For professional advisory, legal, tax, and brokerage services, we connect users with licensed professionals.

### The Three Revenue Layers

| Layer | What It Is | Legal Model | License Required |
|-------|-----------|-------------|-----------------|
| **AI-generated analysis & documents** | Valuations, CIMs, financial models, deal scoring, market intelligence | Information product (Zillow Zestimate model) | None |
| **Platform access & workflow tools** | Deal room, NDA management, document collaboration, buyer/seller matching interface, DD coordination | SaaS technology platform (Datasite/BizBuySell model) | None |
| **Connections to licensed professionals** | SBA lenders, business brokers, M&A attorneys, CPAs, appraisers | Referral/marketplace (LegalZoom/Lendio model) | None (referral fees from professionals) |

### What Yulia Can and Cannot Do

**CAN DO (information & document generation):**
- Generate AI-estimated valuation ranges based on user-provided data
- Produce CIMs, financial models, deal structure analyses, DD checklists
- Explain M&A concepts, terminology, deal structures, financing options
- Calculate SDE, EBITDA, DSCR, IRR, and other financial metrics
- Score and analyze deals from user-provided listing data
- Model capital stacks, SBA financing scenarios, seller financing structures
- Provide market comparables and industry benchmarks
- Generate negotiation frameworks and strategies

**CANNOT DO (advisory/fiduciary activities):**
- Provide legal advice (→ connect to attorney)
- Provide tax advice (→ connect to CPA)
- Provide formal business appraisals (→ connect to licensed appraiser)
- Negotiate on behalf of either party
- Represent either side in a transaction
- Hold, transfer, or escrow funds
- Guarantee outcomes, prices, or timelines
- Make investment recommendations

### Required Disclaimers (every deliverable, every paywall, terms of service)

> smbx.ai is a technology platform, not a business brokerage, law firm, or financial advisor. All valuations, analyses, and documents are AI-generated estimates for informational purposes only. They are not formal appraisals, legal advice, tax advice, or investment recommendations. Consult licensed professionals before making financial decisions. smbx.ai does not represent either party in a transaction.

---

## PART 2: PRICING MODEL — OUTCOME-PRICED, NOT TOOL-PRICED

### Core Principle

We do not sell access to a tool. We do not sell monthly subscriptions. We sell the guided process of executing an M&A deal — priced as a **platform fee** scaled to deal complexity (league), payable when the user transitions from free analysis to deal execution.

### Why Not a Wallet / Why Not a Subscription

| Model | Problem |
|-------|---------|
| **Per-deliverable wallet** | Too much friction. Every purchase decision interrupts the experience. Wallet blocks, top-ups, insufficient funds — all kill conversion at the moment of highest engagement. |
| **Monthly subscription** | Sells the tool, not the outcome. A $49/mo subscription for M&A intelligence is a commodity. Doesn't capture value proportional to deal size. Premature — we haven't earned the right to ask for recurring commitment before demonstrating value. |
| **Per-deal platform fee** | Sells the process. One decision point, at the moment of maximum commitment. Price scales with deal value. Simplest possible billing: one Stripe checkout. |

### The Pricing Architecture

**FREE TIER — No signup, no credit card, no friction**

Everything in S0–S1 (Sell) and B0–B1 (Buy) is free. This includes:

| Deliverable | Journey | What It Does | Conversion Role |
|-------------|---------|-------------|-----------------|
| Unlimited Yulia conversation | All | Full AI advisory chat, any question, any topic | Demonstrates competence, builds trust |
| ValueLens (fka Bizestimate) | SELL | AI-estimated valuation range with math shown | User acquisition hook — "what's my business worth?" |
| Value Readiness Report | SELL | 7-factor exit readiness score + improvement actions + $ impact | Flagship seller hook — $5K–$15K of consultant-equivalent work |
| Preliminary SDE/EBITDA | SELL | Add-back identification, earnings normalization | Shows the owner things they didn't know about their own business |
| Investment Thesis Document | BUY | Acquisition blueprint, criteria definition, capital stack template | Creates buyer commitment before any purchase |
| Capital Stack Template | BUY | SBA + seller note + equity injection modeling | Shows the buyer HOW to actually buy a business |
| Deal Scoring | BUY | Paste a listing URL → instant analysis, risks, pursue/pass | The thing nobody else does for buyers |
| CIM (L1 only) | SELL | Full AI-generated Confidential Information Memorandum | The Toast hardware play — free at L1 to hook brokers and generate data |

**PAID TIER — Per-Deal Platform Fee**

The paywall activates at the S2/B2 gate — the transition from "understanding my options" to "executing my deal." At this point, the user has received substantial free value, Yulia has accumulated weeks or months of context, and the user has made a commitment decision.

| League | SDE/EBITDA Band | Platform Fee | What's Included | Alternative Cost |
|--------|----------------|-------------|-----------------|-----------------|
| **L1** | SDE < $500K | **$999** | Full deal execution: all remaining deliverables, deal room, document management, buyer/seller matching interface, DD checklists, closing support, 180-day PMI plan | $15K–$40K broker commission |
| **L2** | SDE $500K–$2M | **$1,500** | Same as L1 + more sophisticated financial modeling | $25K–$75K broker commission |
| **L3** | EBITDA $2M–$5M | **$5,000** | Same + institutional-quality CIM, working capital analysis, full buyer outreach tools | $75K–$200K IB retainer + success fee |
| **L4** | EBITDA $5M–$10M | **$15,000** | Same + three-statement modeling, DCF, advanced deal structuring | $150K–$400K IB engagement |
| **L5** | EBITDA $10M–$50M | **Custom** | Enterprise engagement, dedicated support, API access | $300K–$1M+ IB fees |
| **L6** | EBITDA $50M+ | **Custom** | Enterprise — priced per engagement | Full IB engagement |

**PROFESSIONAL TIER — Broker/Advisor Subscription**

| Plan | Price | What's Included |
|------|-------|-----------------|
| **Advisor Trial** | Free (first 3 client deals) | Full platform access for 3 client journeys. Proves the value before asking for money. |
| **Advisor Pro** | $299/month | Unlimited client deals, all deliverables, branded outputs, client management dashboard |
| **Advisor Enterprise** | $499/month | Same + API access, white-label options, priority support, team seats |

**REFERRAL REVENUE — Invisible to Users**

| Source | Revenue per Deal | Triggered When |
|--------|-----------------|---------------|
| SBA lender referral | $15,000–$50,000 (1.5–3% of loan) | Buyer finances through platform-referred lender |
| Guidant Financial (ROBS) | $500–$1,000 referral fee | Buyer uses ROBS for equity injection |
| Attorney/CPA referral | $200–$500 per referral | User needs licensed professional |
| Insurance (R&W, E&O) | $500–$2,000 | Deal requires insurance products |

---

## PART 3: SEGMENT-BY-SEGMENT HOOK → AHA → PAY → STAY

### SELLERS

#### First-Time Seller (L1/L2)
**Who:** Dental practice owner, HVAC company, restaurant owner. Smart people who don't know M&A lingo. Making the biggest financial decision of their life.

**HOOK:** "Tell me about your business." → 5-minute conversation → AI-estimated range with real math. Yulia shows the add-backs, explains why the owner's car lease counts, tells them the range is $850K–$1.1M and here's why. Free. No signup.

**AHA MOMENT:** Value Readiness Report. "Your business scores 4.2 out of 7. Your biggest issue is owner dependency. If you fix these three things over 6–12 months, your range moves to $1.1M–$1.4M. Here's what each fix is worth." This is $5K–$15K of consulting work, delivered free.

**WHAT THEY PAY FOR:** Platform fee ($999–$1,500) when they're ready to execute. This unlocks CIM generation (L2+), deal room, buyer matching interface, NDA management, DD coordination, closing support, 180-day PMI plan.

**WHY THEY STAY:** Yulia has 6–18 months of accumulated intelligence about their business. Financial model connected to their books and auto-updating. CIM is a living document. Deal room has documents, buyer communications, audit trail. Walking away means starting over with a broker who knows nothing. Platform fee is 94%+ discount vs. that broker's commission.

**YULIA'S PAYWALL MESSAGE (S2 gate):**
> "Based on everything we've built together, you're ready to take the next step. Your ValueLens shows $850K–$1.1M, your readiness score is 5.8/7, and I've identified 3 buyer categories that fit your business.
>
> To move into deal execution — where I generate your full CIM, set up your deal room, and help you manage the buyer process — there's a one-time platform fee of $999.
>
> This covers everything through closing: CIM, deal room, buyer tools, due diligence checklists, closing documents, and 180-day post-sale transition support.
>
> For context, a business broker would charge $15,000–$40,000 in commissions on a deal this size.
>
> [Proceed to Deal Execution — $999]"

---

#### Sophisticated Seller (L3/L4)
**Who:** $2M–$10M EBITDA company. May have a CFO. Shopping for investment bankers. Getting quoted $150K–$300K retainers + 3–5% success fees.

**HOOK:** Same first conversation, but Yulia shifts to L3/L4 persona — speaks EBITDA, discusses adjusted vs. reported, mentions working capital targets. ValueLens includes comparable transaction ranges and quality-of-earnings assessment. Free.

**AHA MOMENT:** The AI-generated CIM. A 30–40 page institutional-quality document produced in hours vs. the 4–8 weeks the IB quoted. The owner realizes the $150K engagement fee is mostly paying for document production AI now handles.

**WHAT THEY PAY FOR:** Platform fee ($5,000–$15,000). Still 90%+ discount on traditional advisory. May also bring their existing advisor onto the platform → multi-party coordination lock-in.

**WHY THEY STAY:** 12–18 month transaction. Platform managing buyer outreach across 15–30 potentials, tracking NDA execution, maintaining live data room, coordinating between seller's attorney, CPA, and advisors. Switching mid-deal = telling 20 buyers the data room just moved.

---

### BUYERS

#### Individual Buyer (husband/wife team, career changer)
**Who:** $200K saved, HELOC available, maybe 401(k). Browsing BizBuySell for months. Favorited 40 listings. Terrified of making a $500K mistake.

**HOOK:** "Paste a listing URL and I'll tell you if it's a good deal." Within 60 seconds: estimated true SDE, opinion on asking price vs. market, SBA feasibility, DSCR check, top 3 risks. Free. Nobody else does this.

**AHA MOMENT:** Capital stack analysis. "Here's how you'd actually buy this: $400K SBA loan, $75K seller note on standby, $50K ROBS rollover, $25K cash. Monthly payment $4,200 against $8,500/month SDE. DSCR 2.0x — the bank approves this." Nobody has ever shown them HOW to structure the purchase.

**WHAT THEY PAY FOR:** Platform fee ($999–$1,500) when they move from analyzing to executing. Unlocks deal room, DD checklists, LOI drafting, lender matching. Also connected to SBA lenders via referral network → $15K–$50K referral revenue smbx.ai never mentions.

**WHY THEY STAY:** Yulia analyzed 15 deals over 3 months. Knows criteria, financing capacity, risk tolerance. Scored every listing they've viewed. Starting over = explaining everything from scratch. Plus 180-day PMI plan post-close.

---

#### Search Fund / ETA Buyer
**Who:** MBA grad. Raised $400K–$600K search capital. Looking 6–18 months. Burning through budget. Speed to conviction is everything.

**HOOK:** Proactive deal flow matching. "Based on your thesis (home services, $1M–$3M EBITDA, Southeast), here are 7 matching businesses scored by fit." Background agent doing the work while they sleep.

**AHA MOMENT:** Full acquisition model — sources & uses, LBO returns, IRR sensitivity, debt schedule — in minutes. They've been building these in Excel for every deal. Yulia does it instantly.

**WHAT THEY PAY FOR:** Platform fee ($2,500–$5,000) per deal execution. Search fund community is tight — one successful acquisition generates 5–10 referrals.

**WHY THEY STAY:** Every deal evaluated, every pass/pursue decision, every model. Platform becomes deal management system for acquisitions 2, 3, 4 (add-ons).

---

#### PE Firm / Family Office (L4/L5)
**Who:** Has analysts. Knows what they're doing. Not here for education.

**HOOK:** Speed demo. Feed Yulia a CIM → complete deal screening report in 40 minutes vs. 40 analyst hours. Valuation range, QoE flags, comparables, capital structure, IRR sensitivity, pursue/pass recommendation.

**AHA MOMENT:** Second deal. Yulia remembers investment criteria, references first deal comparison. "This one's a better fit — customer concentration is half and EBITDA margin is 300bps higher." Accumulated pipeline intelligence.

**WHAT THEY PAY FOR:** Enterprise annual contract ($25K–$100K/year). Per-seat, per-deal-flow pricing. Justifies itself against one analyst salary.

**WHY THEY STAY:** Deal pipeline history = institutional memory. New associate doesn't need 6 months to learn firm preferences. Yulia already knows them.

---

### PROFESSIONAL USERS

#### Business Broker
**Who:** Handles 5–20 deals/year. Most important segment for platform growth — each broker = multiple deals.

**HOOK:** Free CIM at L1/L2. A 25-page AI-generated CIM in 2 hours vs. 40 hours manually. 3 client deals free (Advisor Trial).

**AHA MOMENT:** Second client's ValueLens includes industry benchmarks from first deal's data. Platform is already smarter because of broker's own activity. They're contributing to AND benefiting from the intelligence flywheel.

**WHAT THEY PAY FOR:** Advisor Pro ($299/month) for unlimited client deals. Clients are on the platform paying their own platform fees. Broker absorbs $299/mo as practice cost (fraction of commissions).

**WHY THEY STAY:** Client relationships live on platform. Deal history, financial models, buyer databases, NDA trails = practice management system. Switching = migrating 15 active deals, losing audit trail on 50 closed deals.

---

#### CPAs and Attorneys
**WHO:** Not primary users. Invited into deals via day passes.

**HOOK:** 48-hour day pass access. CPA reviews client's financial data in deal room. Sees quality of AI analysis. Thinks "I should recommend this to my other clients."

**WHAT THEY PAY FOR:** Nothing directly. They're the distribution channel.

**REVENUE MODEL:** Every CPA invited into one deal → referral source for 3–5 future sellers. Worth more than any subscription.

---

## PART 4: ANTI-LEAKAGE ARCHITECTURE

### The Problem
User gets free ValueLens + VRR + CIM (at L1) → takes documents to broker or negotiates directly → closes deal off-platform → pays nothing.

### Why This Is Acceptable (Within Limits)
- Marginal cost of free deliverables ≈ $0 (AI-generated)
- "Leaked" CIM is branded marketing → broker sees quality → becomes power user
- 3–5% conversion to paid execution still generates substantial revenue on high-value deals
- Leakage only fatal above 30–40% AND when marginal costs are high. Neither applies here.

### Five Structural Anti-Leakage Mechanisms

**1. The buyer network is the real product, not the CIM.**
A CIM without distribution is worthless. Platform connects sellers to matched, qualified buyers. Free analysis tells them what their business is worth; only the platform connects them to who will buy it.

**2. Process orchestration makes individual documents irrelevant.**
CIM = 10–15% of deal value chain. The other 85–90% (buyer outreach, NDA management, DD coordination, LOI negotiation, deal room, closing) only exists on-platform. Taking a CIM and leaving = doing 85% of the work yourself.

**3. Living documents decay outside the platform.**
Valuation connected to real-time accounting data updates automatically. Exported PDF is frozen in time. CIM refreshes financial tables as monthly numbers come in. Platform holds the living version; export is a snapshot.

**4. Accumulated AI intelligence creates compounding switching costs.**
After 6 months, Yulia knows the business better than the owner's CPA. Every conversation, every correction, every refinement builds institutional memory that can't be exported. Loss aversion: losing an AI advisor who "knows your business" feels 2x worse than the benefit of trying alternatives.

**5. Multi-party coordination creates collective switching costs.**
When seller, buyer, attorney, CPA, and lender all coordinate through the platform, no single party can leave without disrupting everyone else. Mid-deal switching = telling all parties to re-register somewhere else.

### What We Do NOT Do
- No punitive lock-in (no contractual restrictions on leaving)
- No hidden data hostage (users can export their documents anytime)
- No contact information hiding (we're not a matching marketplace)
- Retention through value, not friction

---

## PART 5: IMPLEMENTATION REQUIREMENTS FOR BUILD

### Stripe Integration (Simplified)

**Kill the wallet.** Replace with:
- One-time Stripe Checkout at S2/B2 gate (platform fee)
- Stripe Subscriptions for Advisor Pro/Enterprise tiers
- `TEST_MODE=true` env var bypass for development (unchanged)

### Paywall Architecture

**One paywall card, one moment, one decision.**
- Appears at S2 gate (sellers) or B2 gate (buyers)
- Shows: what they've received free, what's included in paid tier, the price, the alternative cost
- Single "Proceed to Deal Execution" button → Stripe Checkout → return → full access unlocked
- League determines price automatically from deal financials (user never sees league label)

### Database Changes from Pricing Catalog v2

- Remove: `wallet_blocks` table, `wallet_transactions` table, per-deliverable pricing
- Remove: wallet balance display, top-up flows, insufficient funds logic
- Keep: `league_multiplier` logic (now determines platform fee, not per-deliverable price)
- Keep: deliverable generation pipeline (all deliverables still generated, just not individually priced)
- Add: `deal_platform_fee` column on deals table (one payment per deal)
- Add: `advisor_subscriptions` table for broker tier

### Free Deliverable Triggers (No Change from Current Architecture)

All S0–S1 and B0–B1 deliverables auto-generate when data is ready. No paywall, no permission, no signup required.

### Referral Infrastructure (New)

- Lender referral tracking (which buyers were connected to which lenders)
- Professional referral tracking (attorney, CPA, appraiser connections)
- Revenue attribution per deal

---

## PART 6: SUCCESS METRICS

| Metric | Target | Measurement |
|--------|--------|-------------|
| Free → Paid conversion rate | 5–10% | Users who hit S2/B2 paywall and pay |
| Time to first value | < 5 minutes | First ValueLens or deal score delivered |
| Average platform fee | $2,500 | Blended across all leagues |
| Lender referral revenue per buyer deal | $20,000 | Average referral fee on funded SBA loans |
| Broker adoption | 20 brokers in year 1 | Brokers who complete Advisor Trial |
| Deals per broker per year | 8–12 | Active deals managed through platform |
| Net revenue retention | 110%+ | Existing users spending more over time |
| Leakage rate | < 20% | Users who take free analysis and never pay |

---

## DOCUMENT HIERARCHY

This document is authoritative for pricing, hooks, retention, and "what we are" positioning. It supersedes:
- Pricing Catalog v2 (wallet model → replaced by per-deal platform fee)
- Market Strategy Playbook pricing section (subscription model → deferred to Phase 2 for enterprise)
- BUILD_PLAN_v10 wallet phases → simplified to single Stripe checkout
- Any prior per-deliverable pricing or league multiplier pricing

It is consistent with and does not supersede:
- METHODOLOGY_V17.md (gates, journeys, math engine, deliverable schemas)
- YULIA_PROMPTS_V3.md (conversation flows, persona definitions)
- SMBX_DESIGN_SYSTEM.md (visual design)
- CLAUDE.md (CC session context)
