# SMBX SALES WEBSITE SPECIFICATION
## Public-Facing Pages for smbx.ai
**Version:** 2.0 | **Updated:** February 21, 2026
**Purpose:** Complete specification for every public page on smbx.ai. This is YOUR reference — not in the repo. Use it to write CC prompts for Phase 7.

---

## DESIGN PRINCIPLES

1. **"Beer Wine Cigarettes" rule** — visitors know what you do in 2 seconds
2. **Mobile-first** — design for 375px, then scale up
3. **Mirror claude.ai aesthetic** — warm, minimal, conversational
4. **Every page has ONE job** — drive signup or explain value
5. **No clever messaging** — clarity over creativity
6. **Dollars, not credits** — wallet amounts are real money ($1 = $1)

---

## SITE MAP

```
smbx.ai/
├── / ............................ Home (catch-all landing)
├── /sell ........................ Sell journey value prop
├── /buy ......................... Buy journey value prop
├── /raise ....................... Raise journey value prop
├── /integrate ................... PMI journey value prop
├── /pricing ..................... Wallet model explanation
├── /how-it-works ................ Product walkthrough
├── /enterprise .................. Broker / Advisory / Lender
├── /login ....................... Login
├── /signup ...................... Create account
├── /chat ........................ App (authenticated)
└── /legal/
    ├── /privacy ................. Privacy Policy
    └── /terms ................... Terms of Service
```

**Total: 12 public pages + app**

---

## CONVERSION FUNNEL

```
                    AWARENESS
                       │
         Google Search / Referral / Social
                       │
                       ▼
              ┌─────────────────┐
              │   HOME PAGE     │  ← 60% of traffic lands here
              │  (smbx.ai/)    │
              └────────┬────────┘
                       │
            ┌──────────┼──────────┐
            ▼          ▼          ▼
      ┌──────────┐ ┌────────┐ ┌────────┐
      │  /sell   │ │  /buy  │ │ /raise │  ← Journey-specific SEO pages
      └────┬─────┘ └───┬────┘ └───┬────┘
           │           │          │
           └───────────┼──────────┘
                       │
                       ▼
              ┌─────────────────┐
              │    /signup      │  ← Single conversion point
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │   /chat (app)   │  ← FREE: S0 intake + S1 financials
              │   S0 → S1 FREE │     User gets value before paying
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │    PAYWALL      │  ← S2/B2/R2: First paid deliverable
              │  (Valuation)    │     User has context + trust
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │  WALLET TOP-UP  │  ← Stripe checkout
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ PAYING CUSTOMER │  ← Continues through gates
              └─────────────────┘
```

**Key insight:** The app IS the sales funnel. Gates S0 and S1 are free — that's your free trial. By the time someone hits the paywall at S2, they've invested 20-30 minutes with Yulia and seen their financials organized. The switching cost is real. They pay.

---

## SHARED COMPONENTS

### Navigation (PublicNav.tsx)
- Logo: "smbx.ai" in serif font, links to /
- Links: Sell, Buy, Raise, Pricing, Login
- CTA button: "Get started free →" → /signup
- Sticky top, white background, 1px bottom border (#E8E4DC)
- Mobile: hamburger menu, slide-in overlay

### Footer (Footer.tsx)
- Three columns:
  - **Product:** Sell, Buy, Raise, Integrate
  - **Company:** Pricing, How It Works, Enterprise
  - **Legal:** Privacy, Terms
- Copyright: "© 2026 smbx.ai. All rights reserved."
- Background: #F0EDE6, text: #6B6B65

### Design Tokens (from CLAUDE.md)
```css
--bg-primary: #F5F5F0;        /* Warm cream canvas */
--bg-secondary: #FFFFFF;       /* White cards/sections */
--bg-sidebar: #F0EDE6;         /* Cream sections */
--text-primary: #1A1A18;       /* Near-black body */
--text-secondary: #6B6B65;     /* Muted/meta */
--text-tertiary: #9B9891;      /* Lightest text */
--accent-primary: #DA7756;     /* Terra cotta brand */
--border: #E8E4DC;             /* Subtle borders */
--font-serif: ui-serif, Georgia, Cambria, serif;
--font-sans: ui-sans-serif, system-ui, sans-serif;
--shadow-card: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06);
```

---

## PAGE 1: HOME (smbx.ai/)

### Purpose
Catch all traffic. Explain what smbx.ai is. Route to journey pages or signup.

### SEO
- Title: "smbx.ai — Your M&A Advisor, On Demand"
- Description: "Sell, buy, raise capital, or integrate a business. AI-powered advisory with real deliverables. Start free."
- H1: "Sell a business. Buy a business. Raise capital."

### Layout

**HERO** (centered, py-24, bg-primary)
```
    Sell a business.
    Buy a business.
    Raise capital.

    Your M&A advisor, on demand.

    [Get started free →]
```
- Heading: serif, text-4xl (mobile) / text-5xl (desktop), text-primary
- Subtext: sans, text-xl, text-secondary
- CTA: terra cotta button, rounded-xl, px-8 py-4 → /signup

**JOURNEY CARDS** (py-20, bg-white, max-w-4xl mx-auto)
Three cards in a row (stack on mobile):

```
    ┌──────────────────┐
    │  Sell             │
    │  Know what your   │
    │  business is      │
    │  worth.           │
    │                   │
    │  Start free →     │
    └──────────────────┘
```

- Cards: white, rounded-2xl, shadow, hover lift
- Title: serif, text-xl
- Description: sans, text-secondary
- "Start free →" link in terra cotta
- Cards link to /sell, /buy, /raise

**HOW IT WORKS** (py-20, bg-white)
Heading (serif, text-3xl, centered): "How it works"
Three text blocks, vertically stacked, max-w-2xl mx-auto:
- "Start a conversation" (FREE badge) + description
- "Get deliverables" (FROM $15 badge) + description
- "Close your deal" + description

FREE/FROM badges: small inline pill, bg-[#F0EDE6], text-xs, text-secondary.

**CREDIBILITY** (py-20, centered, max-w-lg)
Heading (serif, text-2xl): "Built on institutional methodology"
Three short paragraphs:
- "80+ industry verticals with current market multiples."
- "Every number verified. Every calculation shown."
- "Adapted to your deal size and complexity."

**FINAL CTA** (py-20, bg-[#F0EDE6])
Heading: "Ready to start?"
Subtext: "Your first financial analysis is free. No credit card required."
CTA: "Get started free →" → /signup

---

## PAGE 2: SELL (/sell)

### SEO
- Title: "Sell Your Business — smbx.ai"
- Description: "Know what your business is worth. From first financial analysis to wire transfer — guided every step. Start free."
- H1: "Know what your business is worth."

### Layout

**HERO** (centered, py-24)
```
    Know what your business is worth.

    From first financial analysis to
    wire transfer — guided every step.

    [Start selling — free to begin →]
```

**WHAT YOU GET** (py-20, max-w-2xl)
Heading: "What you get"
Five items, vertically stacked, separated by 1px lines:
Each: Title (serif text-xl) + price badge (pill) + description

| Deliverable | Price | Description |
|------------|-------|-------------|
| Financial Analysis | FREE | Upload your P&L and tax returns. Yulia normalizes your earnings, identifies add-backs, and calculates your true SDE or EBITDA. |
| Defensible Valuation | From $15 | Multi-methodology valuation with industry comps, growth premiums, and a price range buyers will take seriously. |
| Confidential Information Memorandum | From $75 | Your business's resume — the document serious buyers review to decide if they want to proceed. |
| Buyer Identification | From $40 | Targeted buyer list based on your industry, size, geography, and strategic fit. |
| Closing Support | From $100 | LOI review, deal structure analysis, closing checklist, and funds flow coordination. |

**YOUR JOURNEY** (py-20)
Heading: "Your journey"
Six steps:
① Intake — free  ② Financial Analysis — free  ③ Valuation — from $15
④ Packaging — from $75  ⑤ Buyer Matching — from $40  ⑥ Closing — from $100

"free" labels in green-tinted text. Price labels in text-secondary.
Below: "You start free and pay only for what you need, when you need it."

**INDUSTRIES** (py-20)
Heading: "We know your industry"
Flowing text: "HVAC · Dental · Veterinary · SaaS · Manufacturing · Insurance · Restaurants · E-commerce · Professional Services · and 70+ more"

**FAQ** (py-20)
Six accordion items:

| Question | Answer |
|----------|--------|
| How accurate is the valuation? | Your valuation uses the same methodology investment banks and M&A advisors use — market comparables, earnings multiples, and industry-specific adjustments. Every number is sourced and every calculation is shown. |
| Do I need financial statements? | Ideally, yes — 3 years of tax returns and P&L statements give the best results. But you can start by entering key numbers manually and refine later. |
| How long does the process take? | Most sellers complete the free intake and financial analysis in a single session (20-30 minutes). A full valuation generates in minutes. The entire sell-side journey can move at your pace. |
| Who sees my information? | Nobody until you decide to share it. Your data is encrypted, isolated from other users, and never shared with buyers without your explicit permission. |
| What does it cost? | Starting a conversation and getting your financials analyzed is free. Paid deliverables start at $15 for a valuation. You add dollars to your wallet and spend as you go — no subscriptions, no retainers. |
| Can I talk to a human? | Yulia handles advisory, but for complex situations or if you prefer human guidance, we can connect you with vetted M&A professionals in your area. |

**FINAL CTA** (py-20, bg-[#F0EDE6])
"Start selling — free to begin →"
"No credit card required."

---

## PAGE 3: BUY (/buy)

### SEO
- Title: "Buy a Business — smbx.ai"
- Description: "Find your perfect acquisition. Define your thesis, score any deal, model the returns. Start free."
- H1: "Find your perfect acquisition."

### Layout

**HERO**: "Find your perfect acquisition." / "Define your thesis. Score any deal. Model the returns."

**WHAT YOU GET**:
| Deliverable | Price |
|------------|-------|
| Acquisition Thesis | FREE |
| Deal Scoring | FREE |
| Financial Modeling | From $50 |
| Due Diligence | From $15 |
| Deal Structuring | From $50 |
| Closing Support | From $100 |

**WHO THIS IS FOR** (py-20):
Four buyer types:
- **First-time acquirers** — Never bought a business? Yulia walks you through every step, explains every term, and makes sure you don't overpay.
- **Search fund operators** — Define your thesis, screen deals systematically, and model returns before committing your investors' capital.
- **Independent sponsors** — Build your deal pipeline, run financial models, and prepare materials for your capital partners.
- **PE bolt-on teams** — Score add-on targets against your platform thesis, model synergies, and structure creative deals.

**JOURNEY**: B0-B5 with pricing  
**FAQ**: 4 items about SBA modeling, financial detail, multiple deals, deal sourcing  
**CTA**: "Start buying — free to begin →"

---

## PAGE 4: RAISE (/raise)

### SEO
- Title: "Raise Capital — smbx.ai"
- Description: "Raise capital without losing control. Investor-ready materials, valuation guidance, and term sheet analysis."
- H1: "Raise capital without losing control."

### Layout

**HERO**: "Raise capital without losing control." / "Investor-ready materials, valuation guidance, and term sheet analysis."

**WHAT YOU GET**:
| Deliverable | Price |
|------------|-------|
| Capital Strategy | FREE |
| Pre-Money Valuation | From $50 |
| Pitch Deck | From $200 |
| Investor Targeting | From $40 |
| Term Sheet Analysis | From $50 |

**JOURNEY**: R0-R5 with pricing  
**FAQ**: 4 items about equity dilution, investor types, pitch deck quality, timeline  
**CTA**: "Start raising — free to begin →"

---

## PAGE 5: INTEGRATE (/integrate)

### SEO
- Title: "Post-Acquisition Integration — smbx.ai"
- Description: "You just acquired a business. The first 100 days determine everything. Get your integration plan."
- H1: "You just acquired a business. Now what?"

### Layout

**HERO**: "You just acquired a business. Now what?" / "The first 100 days determine everything."

**WHAT YOU GET**:
| Deliverable | Price |
|------------|-------|
| Day 0 Checklist | FREE |
| 30-Day Stabilization | From $100 |
| 60-Day Assessment | From $100 |
| 100-Day Optimization | From $150 |

Descriptions:
- **Day 0 Checklist** — Change passwords. Lock financial accounts. Notify key people. Nothing falls through the cracks.
- **30-Day Stabilization** — Employee communication, customer retention plan, vendor renegotiation, quick wins.
- **60-Day Assessment** — SWOT analysis, operational benchmarking, identify cost savings and revenue opportunities.
- **100-Day Optimization** — Full integration roadmap with KPIs, milestones, and accountability.

**JOURNEY**: PMI0-PMI3 with pricing  
**CTA**: "Start integrating — free to begin →"

---

## PAGE 6: PRICING (/pricing)

### SEO
- Title: "Pricing — smbx.ai"
- Description: "Pay as you go. No subscriptions. No retainers. Start free and add funds when you need them."
- H1: "Pay as you go."

### Layout

**HERO** (py-24)
```
    Pay as you go.

    No subscriptions. No retainers.
    No minimum commitment.

    Add funds to your wallet. Spend
    them on what you need. Start free.
```

**HOW IT WORKS** (py-20, max-w-2xl)
```
    How your wallet works

    1. Sign up free
       Your first intake and financial
       analysis cost nothing.

    2. Add funds when ready
       When you want a paid deliverable,
       add funds to your wallet. Buy
       as little as $50.

    3. Spend on what you need
       Each deliverable has a clear price.
       Funds are deducted instantly.
       No surprises.
```

**WALLET BLOCKS** (py-20)
Heading: "Choose your wallet size"
Grid of 6 cards (2 columns mobile, 3 desktop):

| Block | Price | Bonus | Note |
|-------|-------|-------|------|
| Starter | $50 | — | Best for a single deliverable |
| Builder | $100 | +$5 bonus | Best for 2-3 deliverables |
| Momentum | $250 | +$25 bonus | Most popular |
| Accelerator | $500 | +$75 bonus | Full sell or buy journey |
| Professional | $1,000 | +$200 bonus | Multiple journeys |
| Scale | $2,500 | +$625 bonus | Enterprise / advisory firms |

Cards: white, rounded-2xl, shadow-card. Name at top, price large, bonus below.
"Most popular" = subtle terra cotta border on Momentum card.
Link below grid: "Need more? View all options →" (shows remaining 4 blocks)

**COMPARISON** (py-20)
Heading: "vs. the alternatives"
Three columns (stack on mobile) — NOT a checkbox table:
- **Traditional M&A advisor:** $50K-$300K retainer, 5-8% success fee, not available under $2M
- **Online calculator:** $0-$99, generic formulas, no deliverables
- **smbx.ai:** Start free, industry-specific, professional deliverables, any deal size

**FAQ** (py-20)
5 accordion items:

| Question | Answer |
|----------|--------|
| What can I do for free? | Your initial intake conversation and financial analysis (S0-S1) are completely free. You'll see your normalized earnings and add-backs before spending a dollar. |
| How does the wallet work? | Add funds to your wallet via credit card. Each deliverable has a clear price. When you request one, the funds are deducted instantly. No subscriptions, no recurring charges. |
| Why do prices vary by deal size? | Larger deals require more complex analysis — EBITDA instead of SDE, multi-methodology valuations, institutional-grade deliverables. League multipliers ensure the depth of analysis matches your deal. |
| Can I get a refund? | Wallet funds don't expire and are refundable if unused. Generated deliverables are non-refundable since AI computation costs are incurred at generation time. |
| What are value-added services? | During your journey, Yulia may suggest complementary services like business optimization plans or transaction readiness assessments. These are optional and priced separately — never forced. |

**CTA** (py-20, bg-[#F0EDE6])
"Start free. Pay when you see value."
[Get started free →]

---

## PAGE 7: HOW IT WORKS (/how-it-works)

### SEO
- Title: "How It Works — smbx.ai"
- Description: "A guided conversation that produces real deliverables. Meet Yulia, your AI M&A advisor."
- H1: "How smbx.ai works"

### Layout

**HERO**: "How smbx.ai works" / "A guided conversation that produces real deliverables."

**MEET YULIA** (py-20)
Two paragraphs about what she does and how she adapts to your deal size and industry.

**THE GATE SYSTEM** (py-20)
Simple visual of 6 connected steps. Brief explanation that you progress through gates, free gates first, paid deliverables unlock deeper analysis.

**DELIVERABLES** (py-20)
List of 6 deliverable types with brief descriptions: Valuations, CIMs, Financial Models, Buyer Lists, Pitch Decks, Closing Checklists.

**INDUSTRIES** (py-20)
Heading + flowing list of 80+ industry names in text-tertiary.

**DATA PRIVACY** (py-20)
Short "your information is yours" section. Encrypted, isolated, never shared without permission.

---

## PAGE 8: ENTERPRISE (/enterprise)

### SEO
- Title: "Enterprise — smbx.ai"
- Description: "Built for advisors too. Whether you're a solo broker or a mid-market firm."
- H1: "Built for advisors too."

### Layout

**HERO**: "Built for advisors too." / "Whether you're a solo broker or a mid-market firm."

**THREE USE CASES**:
- **Brokers** — Accelerate your deal flow. Use Yulia to prepare valuations and CIMs in minutes instead of weeks.
- **Advisory Firms** — Scale your practice without scaling headcount. Consistent methodology across every engagement.
- **Lenders** — Evaluate borrowers faster. SBA loan modeling, DSCR analysis, and collateral assessment built in.

**COMING SOON**:
- Multi-deal dashboard
- Team collaboration
- White-label reports
- Custom branding
- API access

**CTA**: "Contact us →" (mailto link for now)

---

## CLAUDE CODE PROMPTS FOR WEBSITE BUILD

Use these during Phase 7. Paste one at a time into CC.

### PROMPT W.1 — Design System README

```
Create client/src/styles/DESIGN_SYSTEM.md with these exact specs:

Aesthetic: Claude.ai product design language. Warm, minimal, conversational.

COLORS:
--bg-primary: #F5F5F0 (warm cream canvas)
--bg-secondary: #FFFFFF (white cards)
--bg-sidebar: #F0EDE6 (cream sections, sidebar)
--text-primary: #1A1A18 (near-black body)
--text-secondary: #6B6B65 (muted/meta)
--text-tertiary: #9B9891 (lightest text)
--accent-primary: #DA7756 (terra cotta — CTAs, links, active states)
--border: #E8E4DC (subtle borders and dividers)

TYPOGRAPHY:
Headings: font-serif (ui-serif, Georgia, Cambria, serif)
Body: font-sans (ui-sans-serif, system-ui, sans-serif)
Hero heading: text-4xl on mobile, text-5xl on desktop
Section headings: text-2xl to text-3xl
Body text: text-base to text-lg

SPACING:
Section padding: py-16 to py-24
Max content width: max-w-4xl or max-w-2xl for text-heavy sections
Horizontal padding: px-6

COMPONENTS:
Buttons: rounded-xl, px-6 py-3, font-medium
  Primary: bg-terra text-white hover:bg-terra/90
  Secondary: bg-white border border-border text-primary hover:bg-cream
Cards: bg-white rounded-2xl shadow-card p-6 hover:shadow-md transition
Badges: bg-sidebar text-xs px-2 py-0.5 rounded-full text-secondary
Accordions: border-b border-border, chevron rotation on expand

MOBILE FIRST:
Design for 375px first. Use md: breakpoint for desktop adjustments.
```

### PROMPT W.2 — Nav + Footer + Layout

```
Build shared layout components:

client/src/components/layout/PublicNav.tsx:
- Logo: "smbx.ai" in serif font, terra cotta color, links to /
- Links: Sell, Buy, Raise, Pricing (hidden on mobile)
- Right side: "Login" text link + "Get started free →" button
- Mobile: hamburger icon, slide-in menu overlay
- Sticky top, bg-white, border-b border-border

client/src/components/layout/Footer.tsx:
- py-16, bg-sidebar
- Three columns (stack on mobile):
  Product: Sell, Buy, Raise, Integrate
  Company: Pricing, How It Works, Enterprise
  Legal: Privacy, Terms
- Copyright at bottom in text-tertiary

client/src/components/layout/PublicLayout.tsx:
- Renders Nav + children + Footer
- All public pages wrap in this
```

### PROMPT W.3 — Home Page

```
Build client/src/pages/public/Home.tsx.

SECTION 1 - HERO (py-24, bg-primary, centered)
Heading (serif, text-4xl md:text-5xl): "Sell a business. Buy a business. Raise capital."
Subtext (sans, text-xl, text-secondary): "Your M&A advisor, on demand."
CTA button: "Get started free →" → /signup

SECTION 2 - JOURNEY CARDS (py-20, bg-white, max-w-4xl mx-auto)
Three cards, horizontal row on desktop, stack on mobile:
- Sell your business → /sell
- Buy a business → /buy
- Raise capital → /raise
Cards: white, rounded-2xl, shadow, hover lift.

SECTION 3 - HOW IT WORKS (py-20, bg-white)
Heading: "How it works"
Three text blocks, max-w-2xl mx-auto.

SECTION 4 - CREDIBILITY (py-20, centered, max-w-lg)
Heading: "Built on institutional methodology"
Three short paragraphs.

SECTION 5 - FINAL CTA (py-20, bg-sidebar)
"Ready to start?" + CTA button.

Mobile-first. Test at 375px wide.
```

### PROMPT W.4 — Sell Page

```
Build client/src/pages/public/Sell.tsx.
Follow the design system. Reference the Sell page spec.

HERO, WHAT YOU GET (5 deliverables with prices),
YOUR JOURNEY (S0-S5), INDUSTRIES, FAQ (6 items), FINAL CTA.
```

### PROMPT W.5 — Buy, Raise, Integrate Pages

```
Build three pages following the same pattern as Sell:

1. client/src/pages/public/Buy.tsx
   Hero: "Find your perfect acquisition."
   Deliverables: 6 items. Add "Who this is for" section with 4 buyer types.

2. client/src/pages/public/Raise.tsx
   Hero: "Raise capital without losing control."
   Deliverables: 5 items.

3. client/src/pages/public/Integrate.tsx
   Hero: "You just acquired a business. Now what?"
   Deliverables: 4 items (PMI0-PMI3).

Same design system, same component patterns.
```

### PROMPT W.6 — Pricing Page

```
Build client/src/pages/public/Pricing.tsx.

HERO: "Pay as you go."
HOW IT WORKS: 3 steps
WALLET BLOCKS: 6 cards in grid (show dollar amounts, not credits)
COMPARISON: vs traditional advisor and online calculators
FAQ: 5 items
CTA: "Start free. Pay when you see value."
```

### PROMPT W.7 — How It Works + Enterprise

```
Build:
1. client/src/pages/public/HowItWorks.tsx
   Meet Yulia, Gate System visual, Deliverable types, Industries, Privacy

2. client/src/pages/public/Enterprise.tsx
   Three use cases: Brokers, Advisory Firms, Lenders
   Coming Soon features list
   Contact CTA
```

### PROMPT W.8 — SEO + Routing

```
Final website polish:

1. Wire all routes including public pages
2. Create SEO component that sets title + meta tags per page
3. Add OG tags for social sharing
4. Verify all CTAs link to /signup
5. Test navigation on mobile
6. Add favicon (terra cotta circle with "S" lettermark — just use a simple SVG)
```

---

## CONTENT GUIDELINES

### Voice
- Confident, not salesy
- Specific, not vague
- Short sentences over long ones
- Address the reader directly ("your business", "your financials")
- No exclamation points
- No "revolutionary" or "game-changing" or "cutting-edge"

### Pricing Display Rules
- Always show "FREE" prominently on free deliverables
- Paid deliverables show "From $X" (base price, before league multiplier)
- Never show league multipliers on public pages — too confusing
- Wallet blocks show dollar amounts: "$50", "$100 (+$5 bonus)", etc.
- Never use the word "credits" — it's dollars

### CTA Button Rules
- Primary CTA: "Get started free →" (always links to /signup)
- Secondary CTA: journey-specific ("Start selling — free to begin →")
- Always include "free" in the CTA text
- Always include "No credit card required" near CTAs
- Arrow character: → (right arrow, not >)
