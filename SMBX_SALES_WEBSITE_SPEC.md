# SMBX.AI — SALES WEBSITE SPEC
## Complete Public Website & Conversion Funnel
**Design Language:** Claude.ai product aesthetic (NOT Anthropic.com corporate)
**Last Updated:** February 18, 2026

---

## DESIGN LANGUAGE: CLAUDE.AI PRODUCT

Claude.ai's product design is distinct from Anthropic's corporate site. Here's the difference:

| | Claude.ai (what we use) | Anthropic.com (not this) |
|---|---|---|
| **Feel** | Warm, approachable, conversational | Editorial, corporate, research-forward |
| **Background** | Soft cream (#FAF9F5) | Hard white with sections |
| **Corners** | Very rounded (rounded-2xl) | Mixed |
| **Shadows** | Barely-there, warm | More defined |
| **Typography** | Serif for content, sans for UI chrome | Bold editorial headlines |
| **Tone** | Like a smart friend | Like a research paper |
| **Density** | Spacious, breathable | Dense with information |
| **Motion** | Almost none — subtle fades | More scroll effects |
| **CTAs** | Understated, confident | More prominent |
| **Overall** | A calm, smart tool | A serious company |

**Our design tokens (matching Claude.ai):**

```css
/* Backgrounds */
--bg-primary: #FAF9F5;        /* Warm cream — the signature */
--bg-card: #FFFFFF;            /* White cards float on cream */
--bg-sidebar: #F0EDE6;         /* Slightly warmer for panels */
--bg-hover: #E8E4DC;           /* Hover state */
--bg-dark: #2B2A27;            /* Dark mode */

/* Text */
--text-primary: #1A1A18;       /* Near-black, never pure black */
--text-secondary: #6B6963;     /* Muted, for descriptions */
--text-tertiary: #9B9891;      /* Very subtle, for metadata */

/* Accent */
--terra: #DA7756;              /* Terra cotta — primary CTA color */
--terra-hover: #C4684A;        /* Darker on hover */

/* Typography */
--font-display: 'Copernicus', Georgia, ui-serif, serif;  /* Headings */
--font-body: system-ui, -apple-system, sans-serif;        /* Body/UI */

/* Shapes */
--radius-card: 1rem;           /* rounded-2xl — signature Claude roundness */
--radius-button: 9999px;       /* Pill-shaped buttons */
--radius-input: 0.75rem;       /* Input fields */

/* Shadows */
--shadow-card: 0 0.25rem 1.25rem rgba(0, 0, 0, 0.035);  /* Barely visible */
--shadow-hover: 0 0.5rem 2rem rgba(0, 0, 0, 0.06);       /* Lift on hover */
```

**Design principles:**
1. The marketing site should feel like you're already inside the product
2. Zero visual friction between landing page and the chat interface
3. If someone uses Claude.ai daily, smbx.ai should feel immediately familiar
4. Cards, spacing, typography — all the same as the app itself
5. No "marketing site energy" — no hero images, no stock photos, no animations
6. Content does the work. Design gets out of the way.

---

## SITEMAP

```
smbx.ai/
├── / ............................ Home
├── /sell ........................ Sell Your Business
├── /buy ......................... Buy a Business
├── /raise ....................... Raise Capital
├── /integrate ................... Post-Acquisition
├── /pricing ..................... How Pricing Works
├── /how-it-works ................ Product Walkthrough
├── /enterprise .................. Brokers / Advisors / Firms
├── /login ....................... Sign In
├── /signup ...................... Create Account
├── /chat ........................ App (authenticated)
└── /legal/
    ├── /privacy ................. Privacy Policy
    └── /terms ................... Terms of Service
```

---

## CONVERSION FUNNEL

```
         Search / Referral / Social
                   │
                   ▼
         ┌─────────────────┐
         │   HOME or SEO   │ ← Traffic lands here
         │   JOURNEY PAGE  │
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │    /signup       │ ← One conversion point
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │   /chat — FREE  │ ← S0 + S1 are free
         │   Gates 0 & 1   │   User gets REAL value (financial analysis)
         └────────┬────────┘   before ever paying
                  │
                  ▼
         ┌─────────────────┐
         │   PAYWALL       │ ← Gate 2: Valuation or Model
         │   (Gate 2)      │   By now they've invested 30 minutes
         └────────┬────────┘   and seen their data organized
                  │
                  ▼
         ┌─────────────────┐
         │  WALLET TOP-UP  │ ← Stripe checkout
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │ PAYING CUSTOMER │ ← Continues through gates 3-5
         └─────────────────┘
```

**The app IS the funnel.** The free gates are your free trial. The website just gets them to sign up.

---

## GLOBAL ELEMENTS

### Navigation Bar

```
┌──────────────────────────────────────────────┐
│  smbx.ai          Sell  Buy  Raise  Pricing  │
│                                    [Sign in]  │
└──────────────────────────────────────────────┘
```

- Background: transparent, becomes --bg-primary on scroll (subtle transition)
- Logo: "smbx.ai" in --font-display, --terra color
- Links: --font-body, --text-secondary, hover → --text-primary
- "Sign in" button: ghost style (text only, no background), --text-secondary
- Mobile: hamburger menu, slides down (not a separate page)
- Sticky on scroll
- Height: 64px desktop, 56px mobile
- Max-width container: 1200px, centered

### Footer

```
┌──────────────────────────────────────────────┐
│  smbx.ai                                    │
│                                              │
│  Product        Company       Legal          │
│  Sell           How It Works  Privacy        │
│  Buy            Pricing       Terms          │
│  Raise          Enterprise                   │
│  Integrate      Sign Up                      │
│                                              │
│  © 2026 smbx.ai                             │
└──────────────────────────────────────────────┘
```

- Background: --bg-sidebar (#F0EDE6)
- Text: --text-secondary
- Links: --text-secondary, hover → --text-primary
- Logo: --font-display, --terra
- Columns: 3 on desktop, stacked on mobile
- Generous vertical padding (py-16)

---

## PAGE 1: HOME (/)

### Purpose
Catch all traffic. Explain what smbx.ai is in 5 seconds. Route to journey or signup.

### SEO
- Title: "smbx.ai — Your M&A Advisor, On Demand"
- Description: "Sell, buy, raise capital, or integrate a business. Guided start to finish by Yulia, your M&A advisor. Start free."
- H1: "Your M&A advisor, on demand."

### Layout

**Section 1 — Hero**
```
Background: --bg-primary (cream)
Centered text, max-width 640px

    "Your M&A advisor,
     on demand."

    Sell, buy, raise capital, or integrate a
    business — guided start to finish.

    [Get started free →]
```

- Heading: --font-display, text-5xl (mobile text-4xl), --text-primary
- Subtext: --font-body, text-lg, --text-secondary, max-width 480px
- CTA: Pill button, --terra background, white text, rounded-full, px-8 py-3
- Vertical padding: py-24 (mobile py-16)
- No image. No illustration. No animation. Just words.

**Section 2 — The Problem**
```
Background: --bg-primary

    Most business owners can't afford an M&A 
    advisor. Most advisors can't afford to 
    work with most business owners.

    We fixed that.
```

- Two short paragraphs. Nothing else.
- Font: --font-display, text-2xl, --text-primary
- Centered, max-width 560px
- This section sells the gap. Calm, confident.
- py-20

**Section 3 — Four Journeys**
```
Background: --bg-primary

    What brings you here?

    ┌─────────────────┐  ┌─────────────────┐
    │                 │  │                 │
    │  Sell           │  │  Buy            │
    │                 │  │                 │
    │  Know your      │  │  Find your      │
    │  number. Find   │  │  perfect deal.  │
    │  your buyer.    │  │  Model the      │
    │                 │  │  returns.       │
    │  Start free →   │  │  Start free →   │
    └─────────────────┘  └─────────────────┘

    ┌─────────────────┐  ┌─────────────────┐
    │                 │  │                 │
    │  Raise          │  │  Integrate      │
    │                 │  │                 │
    │  Bring on       │  │  Your first     │
    │  capital. Keep  │  │  100 days,      │
    │  control.       │  │  done right.    │
    │                 │  │                 │
    │  Start free →   │  │  Start free →   │
    └─────────────────┘  └─────────────────┘
```

- Grid: 2×2 on desktop, 1 column on mobile
- Cards: --bg-card (white), rounded-2xl, --shadow-card
- Card hover: --shadow-hover, translate-y -2px (gentle lift)
- Card title: --font-display, text-xl
- Card description: --font-body, text-base, --text-secondary
- Card link: --terra, text-sm
- "What brings you here?" heading: --font-display, text-3xl, centered
- These should look EXACTLY like the welcome screen cards inside the app

**Section 4 — How It Works**
```
Background: white (#FFFFFF)

    How it works

    Start a conversation               FREE
    Tell Yulia about your business. 
    She asks the right questions,
    organizes your financials, and
    classifies your deal.

    Get deliverables                    FROM $15
    Valuations, CIMs, buyer lists,
    financial models, pitch decks —
    generated in minutes, not weeks.

    Close your deal
    Yulia guides you through every
    stage — from LOI to wire transfer.
```

- Three steps, vertically stacked (not horizontal icons)
- Each step: title in --font-display text-xl, description in --font-body --text-secondary
- "FREE" and "FROM $15" badges: small pill, --bg-sidebar background, --text-secondary
- No icons. No numbers in circles. Just text with generous spacing.
- py-20

**Section 5 — Credibility**
```
Background: --bg-primary

    Built on institutional methodology

    80+ industry verticals with current 
    market multiples and transaction data.

    Every number verified. Every calculation 
    shown. Zero hallucinated financials.

    Adapted to your deal — a $500K business 
    gets different guidance than a $50M business.
```

- Three short statements. No bullet points.
- --font-body, text-lg, --text-secondary
- Center-aligned, max-width 560px
- Heading: --font-display, text-2xl
- py-20

**Section 6 — Final CTA**
```
Background: --bg-sidebar (#F0EDE6)

    Ready to start?

    Your first financial analysis is free.
    No credit card required.

    [Get started free →]
```

- Centered, simple, confident
- Same pill button as hero
- py-20

---

## PAGE 2: SELL YOUR BUSINESS (/sell)

### Purpose
Capture sellers. Highest-value SEO page. "What's my business worth?"

### SEO
- Title: "Sell Your Business — smbx.ai"
- Description: "Know what your business is worth. Get a defensible valuation, professional CIM, and buyer identification. Start free."
- H1: "Know what your business is worth."

### Layout

**Hero**
```
    Know what your business is worth.
    Find the right buyer.

    From first financial analysis to wire 
    transfer — guided every step.

    [Start selling — free to begin →]
```

**What You Get** (vertical list, not cards)
```
    What you get

    Financial Analysis                      Free
    Your books organized. SDE or EBITDA 
    calculated. Every legitimate add-back 
    identified and documented.

    Defensible Valuation                    From $15
    Multi-methodology valuation using 
    current market data for your specific 
    industry. Not a guess — a number with 
    math behind it.

    Confidential Information Memorandum     From $75
    The document that makes buyers take 
    your business seriously. Adapted to 
    your deal size — from 10-page summary 
    to 40-page institutional presentation.

    Buyer Identification                    From $40
    Who's buying businesses like yours? 
    Individual operators, PE firms, 
    strategic acquirers — profiled and 
    prioritized.

    Closing Support                         From $100
    LOI comparison, due diligence prep, 
    working capital analysis, funds flow 
    statement — all the way to the wire.
```

- Each deliverable: title in --font-display, "From $X" in small pill badge
- Description: --font-body, --text-secondary
- Subtle separator line between each (1px, --bg-hover)
- This is a menu — they're previewing what they'll buy later

**Your Journey** (visual gate progression)
```
    Your journey

    ① Intake ..................... free
    ② Financial Analysis ......... free
    ③ Valuation .................. from $15
    ④ Packaging .................. from $75
    ⑤ Buyer Matching ............. from $40
    ⑥ Closing .................... from $100

    You start free and pay only for what 
    you need, when you need it.
```

- Simple numbered list, not a complex diagram
- "free" in green-ish text, prices in --text-secondary
- Subtle connecting line or dots between steps (optional)

**Industry Expertise**
```
    We know your industry

    80+ verticals with real market data. 
    Your valuation uses actual multiples 
    and transaction benchmarks — not a 
    generic calculator.

    HVAC · Dental · Veterinary · SaaS · 
    Manufacturing · Insurance · 
    Restaurants · E-commerce · 
    Professional Services · and 70+ more
```

- Industry names in a soft flowing list, --text-secondary
- Not a grid of icons. Just names.

**FAQ** (accordion)
```
    Common questions

    ▸ How accurate is the valuation?
    ▸ How long does it take to sell a business?
    ▸ Do I still need a broker?
    ▸ What if my books aren't clean?
    ▸ Is my information confidential?
    ▸ What does "free to start" actually mean?
```

Answers (collapsed, expand on click):

**How accurate is the valuation?**
We use your verified financials and current market multiples specific to your industry. We show all our math. A valuation is a range, not a single number — the actual sale price depends on buyer demand, deal structure, and negotiation. For deals above $5M EBITDA, we recommend supplementing with a formal Quality of Earnings engagement.

**How long does it take to sell?**
Depends on price, industry, and market. On average: under $2M SDE takes 4–8 months. $2M–$10M EBITDA takes 8–14 months. Prepared sellers with clean books and realistic prices sell faster. That's what we help with.

**Do I still need a broker?**
Under $2M SDE — Yulia can guide you through a direct sale. Over $2M — a broker adds significant value, especially running a competitive process. Either way, everything we produce makes you more prepared, which means a faster sale and better price whether you use a broker or not.

**What if my books aren't clean?**
Most small business books aren't perfect. That's normal. We help you identify add-backs — legitimate adjustments that increase your apparent earnings. If your books need serious cleanup, we'll tell you honestly and suggest working with a CPA first.

**Is my information confidential?**
Yes. Your data is completely siloed. No other user, buyer, or advisor on the platform can see your information. We maintain a strict separation between all deals.

**What does "free to start" actually mean?**
Gates 0 and 1 (intake and financial analysis) are completely free. No credit card, no trial timer. You talk to Yulia, she organizes your information, and you see your financial profile. You only pay when you want a specific deliverable — starting with the valuation at Gate 2.

**Final CTA**
```
    [Start selling — free to begin →]
    
    No credit card required.
```

---

## PAGE 3: BUY A BUSINESS (/buy)

### SEO
- Title: "Buy a Business — smbx.ai"
- Description: "Find your perfect acquisition. Model returns, run due diligence, close with confidence. Start free."
- H1: "Find your perfect acquisition."

### Layout

**Hero**
```
    Find your perfect acquisition.

    Define your thesis. Score any deal. 
    Model the returns. Close with confidence.

    [Start buying — free to begin →]
```

**What You Get**
```
    Acquisition Thesis                      Free
    Clarify what you're looking for — 
    industry, size, geography, return 
    targets — and why it makes sense.

    Deal Scoring                            Free
    Evaluate any opportunity against your 
    criteria. Quick scoring on a 0–100 scale 
    so you don't waste time on bad fits.

    Financial Modeling                       From $50
    Full acquisition model: DSCR, cash-on-cash, 
    IRR, MOIC. Sources & uses. 5-year projections. 
    Scenario analysis. SBA loan qualification check.

    Due Diligence                            From $15
    Comprehensive checklist customized to the 
    target's industry, size, and deal structure.

    Deal Structuring                         From $50
    Optimize your capital structure. Asset vs 
    equity. Earnout analysis. Working capital 
    targets. Seller financing terms.

    Closing                                  From $100
    Funds flow statement, closing checklist, 
    transition planning.
```

**Who This Is For**
```
    Built for every kind of buyer

    First-time acquirers
    You know you want to buy a business. 
    You don't know where to start.

    Search fund operators  
    You have a thesis and capital. You need 
    fast analysis on deal flow.

    Independent sponsors
    Running a process without committed capital. 
    You need investor-ready materials.

    PE bolt-on teams
    Evaluating add-ons for a platform. 
    Quick scoring and modeling at scale.
```

- Four buyer types, each with title + 2-line description
- Not cards — just text blocks with generous spacing

**FAQ**
```
    ▸ Can I model SBA-financed acquisitions?
    ▸ How detailed is the financial model?
    ▸ Can I evaluate multiple deals at once?
    ▸ Is this a deal sourcing platform?
```

**Can I model SBA-financed acquisitions?**
Yes. The acquisition model includes SBA 7(a) loan parameters — down payment requirements, interest rates, guarantee fees, and DSCR calculations. It will tell you if a deal qualifies and what your debt service looks like.

**How detailed is the financial model?**
It includes: sources & uses of funds, 5-year projections, debt service coverage ratio, cash-on-cash returns, IRR, MOIC, and scenario sensitivity (base/upside/downside). You get the same analysis a PE firm would produce for an investment committee memo.

**Can I evaluate multiple deals at once?**
Yes. Each deal is a separate conversation. You can run as many as you want in parallel. Each has its own thesis scoring and modeling.

**Is this a deal sourcing platform?**
No. We don't list businesses for sale. We help you analyze and close deals you find elsewhere — through brokers, direct outreach, or marketplaces like BizBuySell.

---

## PAGE 4: RAISE CAPITAL (/raise)

### SEO
- Title: "Raise Capital for Your Business — smbx.ai"
- Description: "Raise capital without losing control. Pitch deck, investor materials, and term sheet analysis. Start free."
- H1: "Raise capital without losing control."

### Layout

**Hero**
```
    Raise capital without losing control.

    Investor-ready materials, valuation 
    guidance, and term sheet analysis — 
    so you negotiate from strength.

    [Start raising — free to begin →]
```

**What You Get**
```
    Capital Strategy                        Free
    How much to raise, what to offer, 
    and who to approach. Aligned with 
    your stage, goals, and risk tolerance.

    Pre-Money Valuation                     From $50
    Defensible valuation that protects 
    your equity position. Multiple 
    methodologies, clearly documented.

    Pitch Deck                              From $200
    12-slide institutional deck: problem, 
    solution, market, traction, team, 
    financials, the ask. Content generated 
    from your actual data.

    Investor Targeting                      From $40
    Who should you approach? Angels, VCs, 
    family offices, strategics — profiled 
    and prioritized for your raise.

    Term Sheet Analysis                     From $50
    Side-by-side comparison of offers. 
    What each term means for your control, 
    dilution, and economics.
```

**Your Journey**
```
    ① Strategy .................. free
    ② Financial Package ......... free
    ③ Valuation & Deck .......... from $200
    ④ Investor Outreach ......... from $40
    ⑤ Term Sheet Review ......... from $50
    ⑥ Closing ................... from $100
```

---

## PAGE 5: POST-ACQUISITION (/integrate)

### SEO
- Title: "Post-Acquisition Integration — smbx.ai"
- Description: "You just acquired a business. Now what? Day 0 checklist through 100-day optimization plan."
- H1: "You just acquired a business. Now what?"

### Layout

**Hero**
```
    You just acquired a business.
    Now what?

    The first 100 days determine whether 
    your acquisition creates or destroys 
    value. Yulia makes sure it's the former.

    [Start your integration — free to begin →]
```

**What You Get**
```
    Day 0 Checklist                         Free
    Secure the business. Change passwords. 
    Lock financial accounts. Notify key 
    people. Nothing falls through the cracks.

    30-Day Stabilization                    From $100
    Employee communication, customer 
    retention plan, vendor renegotiation, 
    quick wins.

    60-Day Assessment                       From $100
    SWOT analysis, operational benchmarking, 
    identify cost savings and revenue 
    opportunities.

    100-Day Optimization                    From $150
    Full integration roadmap with KPIs, 
    milestones, and accountability.
```

---

## PAGE 6: PRICING (/pricing)

### Purpose
Explain the wallet model. Overcome "how much does this cost" objection. Show it's cheaper than alternatives.

### SEO
- Title: "Pricing — smbx.ai"
- Description: "Pay as you go. No subscriptions. No retainers. Start free and add credits when you need them."
- H1: "Pay as you go."

### Layout

**Hero**
```
    Pay as you go.

    No subscriptions. No retainers. 
    No minimum commitment.

    Add credits to your wallet. Spend 
    them on what you need. Start free.
```

**How It Works**
```
    How your wallet works

    1. Sign up free
       Your first intake and financial 
       analysis cost nothing.

    2. Add credits when ready
       When you want a paid deliverable, 
       add credits to your wallet. Buy 
       as little as $50.

    3. Spend on what you need
       Each deliverable has a clear price. 
       Credits are deducted instantly. 
       No surprises.
```

**Wallet Blocks** (the actual top-up options)
```
    Choose your wallet size

    ┌──────────────┐  ┌──────────────┐
    │   Starter    │  │   Builder    │
    │   $50        │  │   $100       │
    │              │  │   +5% bonus  │
    │   Best for   │  │              │
    │   a single   │  │   Best for   │
    │   deliverable│  │   2-3        │
    │              │  │   deliverables│
    └──────────────┘  └──────────────┘

    ┌──────────────┐  ┌──────────────┐
    │   Growth     │  │ Professional │
    │   $200       │  │   $500       │
    │   +10% bonus │  │   +15% bonus │
    │              │  │              │
    │   Most       │  │   Full sell  │ ← "Most Popular" badge
    │   popular    │  │   or buy     │
    │              │  │   journey    │
    └──────────────┘  └──────────────┘

    ┌──────────────┐  ┌──────────────┐
    │ Accelerator  │  │ Enterprise   │
    │   $1,000     │  │   $2,500     │
    │   +20% bonus │  │   +25% bonus │
    └──────────────┘  └──────────────┘
```

- Cards: --bg-card, rounded-2xl, --shadow-card
- Recommended card: Subtle --terra border
- Grid: 2 columns on mobile, 3 on desktop
- Show only 6 most common blocks. Link to "View all options" for remaining 4.

**Comparison**
```
    vs. the alternatives

    Traditional M&A advisor
    $50,000–$300,000 retainer
    5-8% success fee
    6-18 month engagement
    Not available under $2M EBITDA

    Online valuation calculator
    $0–$99
    Generic formulas, no industry data
    No deliverables, no guidance
    Good for a rough guess

    smbx.ai
    Start free, pay as you go
    Industry-specific analysis
    Professional deliverables
    Guided process, any deal size
```

- NOT a feature comparison table with checkmarks
- Three columns of plain text, each describing the option
- Let the contrast speak for itself

**FAQ**
```
    ▸ Do credits expire?
    ▸ Can I get a refund?
    ▸ Why aren't deliverable prices fixed?
    ▸ What's the league multiplier?
    ▸ Do I need to buy a package?
```

**Do credits expire?**
No. Credits stay in your wallet until you use them.

**Can I get a refund?**
Credits are non-refundable but never expire. If a deliverable fails to generate properly, we'll re-generate it at no additional cost.

**Why aren't deliverable prices fixed?**
Larger, more complex deals require more analysis. A $500K HVAC company valuation is simpler than a $50M multi-entity manufacturing deal. Our league system adjusts pricing so you pay proportionally to your deal's complexity. Base prices are listed — your actual price may be higher for complex transactions.

**What's the league multiplier?**
We classify deals into leagues based on size and complexity. Smaller deals (L1-L2) pay base price. Larger deals (L3+) pay a multiplier because the analysis is deeper and more rigorous. Your multiplier is shown before any purchase — no surprises.

**Do I need to buy a package?**
No. Everything is à la carte. Packages exist as a convenience for people who know they want the full journey — they offer a discount over buying individual deliverables.

---

## PAGE 7: HOW IT WORKS (/how-it-works)

### Purpose
The deeper explanation for people who want to understand the product before signing up.

### SEO
- Title: "How smbx.ai Works — Your M&A Advisor, Explained"
- H1: "How smbx.ai works"

### Layout

**Hero**
```
    How smbx.ai works

    A guided conversation that turns into 
    real deliverables and real deals.
```

**Meet Yulia**
```
    Meet Yulia

    Yulia is your M&A advisor. She asks 
    the right questions, organizes your 
    financials, generates professional 
    deliverables, and guides you through 
    every stage of your transaction.

    She adapts to your deal. A first-time 
    seller with a $500K business gets 
    plain-language guidance and practical 
    steps. A PE fund evaluating a $20M 
    platform gets institutional analysis 
    and GAAP-ready documentation.

    Same methodology. Different depth.
```

**The Gate System** (visualized simply)
```
    Your deal moves through gates

    Every transaction follows a proven sequence. 
    Each gate has a clear purpose and clear 
    deliverables. You always know where you 
    are and what's next.

    [Simple visual: 6 connected dots/steps
     labeled: Intake → Financials → Valuation →
     Packaging → Matching → Closing]

    The first two gates are free. You see 
    real value before you pay anything.
```

**Deliverables**
```
    What Yulia builds for you

    Valuations
    Industry-specific, multi-methodology. 
    Every number sourced, every calculation shown.

    CIMs
    The document buyers and investors need. 
    Adapted from 10-page summaries to 
    40-page institutional presentations.

    Financial Models
    DSCR, returns analysis, 5-year projections, 
    scenario sensitivity. Buyer-ready or 
    investor-ready.

    Buyer & Investor Lists
    Profiled, categorized, and prioritized 
    based on your specific deal.

    Pitch Decks
    Investor-ready presentations built from 
    your actual financials and story.

    Closing Documents
    Funds flow statements, DD checklists, 
    working capital analysis.
```

**Industries**
```
    80+ industries, real data

    Every valuation pulls from current market 
    multiples, margin benchmarks, and typical 
    buyer profiles for your specific industry.

    [Flowing list of industry names in 
     --text-tertiary, wrapping naturally]
    
    HVAC · Plumbing · Electrical · Roofing · 
    Pest Control · Veterinary · Dental · 
    Medical · Pharmacy · SaaS · MSP · 
    E-commerce · Restaurants · Car Wash · 
    Insurance · Financial Advisory · 
    Accounting · Manufacturing · Trucking · 
    Self-Storage · Funeral Homes · Staffing · 
    and 60+ more
```

**Your Data**
```
    Your information is yours

    Every deal is completely siloed. No data 
    crosses between users, deals, or 
    conversations. We don't sell data. 
    We don't share data. We don't use 
    your data to train models.
```

---

## PAGE 8: ENTERPRISE (/enterprise)

### Purpose
Capture brokers, advisors, and firms who want to use smbx.ai for their practice.

### SEO
- Title: "smbx.ai for Brokers and Advisors"
- H1: "Built for advisors too."

### Layout

**Hero**
```
    Built for advisors too.

    Whether you're a solo broker or a 
    mid-market advisory firm — Yulia 
    accelerates your practice.

    [Contact us →]
```

**Use Cases**
```
    For business brokers
    Generate CIMs, valuations, and blind 
    teasers in minutes instead of days. 
    Focus on relationships and deal-making.

    For M&A advisory firms
    Institutional-grade deliverables for 
    your lower-market engagements. Serve 
    more clients without adding headcount.

    For lenders
    Quick risk assessment, DSCR analysis, 
    and SBA eligibility checks on 
    prospective borrowers.
```

**Coming Soon**
```
    What's coming for enterprise

    • White-label deal rooms
    • Multi-seat team access
    • Commission tracking
    • Day pass system for buyers/lenders
    • API access for integration
    
    Interested? Reach out — we'll keep 
    you in the loop.

    [Contact us →]
```

- "Contact us" either opens a mailto: or a simple form
- This page is intentionally lighter — it's a teaser. Enterprise features aren't built yet.

---

## PAGE 9: LOGIN (/login)

### Layout
```
Background: --bg-primary (full page)
Centered card: max-width 400px

    smbx.ai

    [Continue with Google]              ← Prominent, full-width
    
    ──── or ────

    Email
    [                              ]
    
    Password
    [                              ]
    
    [Sign in]                          ← Terra cotta pill button

    Don't have an account? Sign up →
```

- Card: --bg-card, rounded-2xl, --shadow-card, p-8
- Google button: white bg, subtle border, Google "G" icon, full width
- Inputs: rounded-lg, subtle border, focus ring in --terra
- "Sign in" button: --terra background, white text, full width, rounded-full
- Link text: --terra color
- Must match Claude's login page feel exactly

---

## PAGE 10: SIGNUP (/signup)

### Layout
```
Background: --bg-primary
Centered card: max-width 400px

    Create your account

    [Continue with Google]

    ──── or ────

    Name
    [                              ]
    
    Email
    [                              ]
    
    Password
    [                              ]

    [Create account]

    Already have an account? Sign in →

    By creating an account you agree to 
    our Terms and Privacy Policy.
```

- Same design as login
- Terms/privacy links in --text-tertiary, small text

---

## COPYWRITING RULES

These rules apply to ALL pages:

1. **Never say "AI-powered"** — Say "instant" or describe the outcome
2. **Never say "machine learning" or "algorithm"** — Just describe what it does
3. **Never say "our platform"** — Say "smbx.ai" or just describe the action
4. **Never say "leverage"** — Normal words only
5. **Never say "streamline" or "optimize"** — Overused, means nothing
6. **Never use emojis** in body copy (fine in UI chrome like badges)
7. **Never fake social proof** — No "trusted by X companies" until real
8. **Lead with outcomes** — "Know what your business is worth" not "Get a valuation report"
9. **Be specific about price** — "From $15" not "affordable"
10. **Be honest about limitations** — "We recommend supplementing with a QoE for deals above $5M" builds more trust than "Works for any deal!"
11. **Short sentences.** Especially in hero sections.
12. **Use second person.** "Your business" not "a business." "You get" not "users get."

---

## SEO STRATEGY

### Page Titles and Meta Descriptions

| Page | Title | Meta Description |
|------|-------|-----------------|
| / | smbx.ai — Your M&A Advisor, On Demand | Sell, buy, raise capital, or integrate a business. Guided start to finish. Start free. |
| /sell | Sell Your Business — smbx.ai | Know what your business is worth. Defensible valuation, professional CIM, buyer identification. Start free. |
| /buy | Buy a Business — smbx.ai | Find your perfect acquisition. Financial modeling, due diligence, deal structuring. Start free. |
| /raise | Raise Capital — smbx.ai | Raise capital without losing control. Pitch deck, investor materials, term sheet analysis. Start free. |
| /integrate | Post-Acquisition Integration — smbx.ai | Your first 100 days after acquiring a business. Day 0 checklist through optimization plan. |
| /pricing | Pricing — smbx.ai | Pay as you go. No subscriptions. Start free, add credits when you need them. From $50. |
| /how-it-works | How smbx.ai Works | A guided conversation that produces real M&A deliverables. Meet Yulia, your M&A advisor. |
| /enterprise | smbx.ai for Brokers and Advisors | Generate CIMs, valuations, and buyer lists in minutes. Built for M&A professionals. |

### Structured Data
- Organization schema on home page
- FAQ schema on /sell, /buy, /raise, /pricing (helps get FAQ rich results in Google)
- Product schema on /pricing

### Technical SEO
- Canonical URLs on every page
- robots.txt allowing all public pages, blocking /chat
- XML sitemap including all public pages
- OpenGraph tags for every page (title, description, image)
- Twitter card tags
- Favicon: Terra cotta "sx" monogram on transparent background

---

## CLAUDE CODE PROMPTS FOR BUILDING THE WEBSITE

These replace Phase 8 in your build playbook.

---

### PROMPT W.1 — Design System README

```
Before building any public pages, create a design system reference file 
at client/src/styles/DESIGN_SYSTEM.md with these exact specifications:

Aesthetic: Claude.ai product design language. Warm, minimal, conversational. 
The marketing site should feel like you're already inside the product.

Colors:
- Background: #FAF9F5 (warm cream)
- Cards: #FFFFFF (white on cream)  
- Sidebar/Footer bg: #F0EDE6
- Hover: #E8E4DC
- Text primary: #1A1A18 (near-black, never pure black)
- Text secondary: #6B6963
- Text tertiary: #9B9891
- Accent/CTA: #DA7756 (terra cotta)
- Accent hover: #C4684A

Typography:
- Headings: Georgia, ui-serif, serif (we'll use system serif for now)
- Body: system-ui, -apple-system, sans-serif
- Heading sizes: hero text-5xl (mobile text-4xl), section headings text-3xl, 
  subsection text-xl
- Body: text-base (16px), descriptions text-lg (18px)

Spacing:
- Section padding: py-24 (mobile py-16)
- Content max-width: max-w-2xl (672px) for text, max-w-5xl (1024px) for grids
- Card padding: p-6 to p-8
- Generous vertical rhythm — err on the side of too much whitespace

Components:
- Cards: bg-white rounded-2xl shadow (0 0.25rem 1.25rem rgba(0,0,0,0.035))
  hover: shadow grows, translate-y -2px
- Buttons (primary): bg-[#DA7756] text-white rounded-full px-8 py-3 
  hover:bg-[#C4684A] transition
- Buttons (ghost): text-[#6B6963] hover:text-[#1A1A18] no background
- Inputs: rounded-lg border border-[#E8E4DC] focus:ring-[#DA7756]
- Accordion: clean expand/collapse, no borders, subtle + icon

Rules:
- No stock photos anywhere
- No emojis in body copy
- No gradients
- No animations except subtle fade-in on scroll (opacity transition)
- No purple, no blue, no green in the palette
- Mobile-first — build for 375px width first

Save this file. Reference it whenever building any page.
```

### PROMPT W.2 — Navigation and Footer

```
Read the design system at client/src/styles/DESIGN_SYSTEM.md.

Build the shared navigation and footer components:

1. client/src/components/public/Navbar.tsx:
   - Height: 64px desktop, 56px mobile
   - Background: transparent, transitions to #FAF9F5 on scroll
   - Sticky (fixed to top)
   - Left: "smbx.ai" in serif font, terra cotta (#DA7756)
   - Center/Right: Links — Sell, Buy, Raise, Pricing (text-secondary, hover text-primary)
   - Far right: "Sign in" ghost button
   - Container: max-w-5xl mx-auto px-6
   - Mobile: hamburger icon, links dropdown below nav (simple, no fancy animation)

2. client/src/components/public/Footer.tsx:
   - Background: #F0EDE6
   - Three columns: Product (Sell, Buy, Raise, Integrate), Company (How It Works, Pricing, Enterprise, Sign Up), Legal (Privacy, Terms)
   - "smbx.ai" logo text in terra cotta at top-left of footer
   - "© 2026 smbx.ai" at bottom
   - Mobile: columns stack vertically
   - py-16

3. client/src/layouts/PublicLayout.tsx:
   - Wraps Navbar + page content + Footer
   - Content area has min-height to push footer down
   - Background: #FAF9F5

Make sure all links use your router (wouter or react-router).
```

### PROMPT W.3 — Home Page

```
Build the home page at client/src/pages/public/Home.tsx.
Follow the design system. This page has 6 sections:

SECTION 1 - HERO (centered, py-24, max-w-2xl mx-auto)
Heading (serif, text-5xl mobile text-4xl): "Your M&A advisor, on demand."
Subtext (sans, text-lg, text-secondary, max-w-md): "Sell, buy, raise capital, or integrate a business — guided start to finish."
CTA button (terra cotta pill): "Get started free →" links to /signup

SECTION 2 - THE GAP (centered, py-20, max-w-lg mx-auto)
Two paragraphs in serif text-2xl:
"Most business owners can't afford an M&A advisor. Most advisors can't afford to work with most business owners."
"We fixed that."
Just text. Nothing else. Let it breathe.

SECTION 3 - FOUR JOURNEYS (py-20)
Heading (serif, text-3xl, centered): "What brings you here?"
Four white cards in 2x2 grid (1 col on mobile):
- Sell: "Know your number. Find your buyer." → /sell
- Buy: "Find your perfect deal. Model the returns." → /buy
- Raise: "Bring on capital. Keep control." → /raise
- Integrate: "Your first 100 days, done right." → /integrate
Cards: white, rounded-2xl, shadow, hover lift. Card title in serif text-xl. 
Description in sans text-secondary. "Start free →" link in terra cotta.
These should look IDENTICAL to the welcome screen cards in the app.

SECTION 4 - HOW IT WORKS (py-20, bg-white for contrast)
Heading (serif, text-3xl, centered): "How it works"
Three text blocks, vertically stacked, max-w-2xl mx-auto:
- "Start a conversation" (FREE badge) + description
- "Get deliverables" (FROM $15 badge) + description  
- "Close your deal" + description
Titles in serif text-xl. Descriptions in sans text-secondary.
FREE/FROM badges: small inline pill, bg-[#F0EDE6], text-xs, text-secondary.
No icons, no numbers in circles.

SECTION 5 - CREDIBILITY (py-20, centered, max-w-lg)
Heading (serif, text-2xl): "Built on institutional methodology"
Three short paragraphs in sans text-lg text-secondary:
- "80+ industry verticals with current market multiples."
- "Every number verified. Every calculation shown."
- "Adapted to your deal size and complexity."

SECTION 6 - FINAL CTA (py-20, bg-[#F0EDE6])
Heading (serif, text-2xl): "Ready to start?"
Subtext: "Your first financial analysis is free. No credit card required."
CTA button: "Get started free →" links to /signup

Mobile-first. Test at 375px wide.
```

### PROMPT W.4 — Sell Page

```
Build the sell page at client/src/pages/public/Sell.tsx.
Follow the design system.

HERO (centered, py-24)
Heading: "Know what your business is worth."
Subtext: "From first financial analysis to wire transfer — guided every step."
CTA: "Start selling — free to begin →" → /signup

WHAT YOU GET (py-20, max-w-2xl)
Heading: "What you get"
Five items, vertically stacked, separated by subtle 1px lines:
Each has: Title (serif text-xl) + price badge (pill) + description (sans text-secondary)
- Financial Analysis (FREE)
- Defensible Valuation (From $15)
- Confidential Information Memorandum (From $75)
- Buyer Identification (From $40)
- Closing Support (From $100)
Use the descriptions from the sales website spec.

YOUR JOURNEY (py-20)
Heading: "Your journey"
Six steps as a simple numbered list:
① Intake — free  ② Financial Analysis — free  ③ Valuation — from $15
④ Packaging — from $75  ⑤ Buyer Matching — from $40  ⑥ Closing — from $100
"free" labels in a slightly green-tinted text. Price labels in text-secondary.
Below: "You start free and pay only for what you need, when you need it."

INDUSTRIES (py-20)
Heading: "We know your industry"
Description paragraph.
Flowing text of industry names in text-tertiary:
"HVAC · Dental · Veterinary · SaaS · Manufacturing · Insurance · 
Restaurants · E-commerce · Professional Services · and 70+ more"

FAQ (py-20)
Heading: "Common questions"
Six accordion items. Use a simple expand/collapse.
Include the questions and answers from the sales website spec.

FINAL CTA (py-20, bg-[#F0EDE6])
"Start selling — free to begin →"
"No credit card required."
```

### PROMPT W.5 — Buy, Raise, Integrate Pages

```
Build these three pages following the same pattern as the sell page:

1. client/src/pages/public/Buy.tsx
Hero: "Find your perfect acquisition."
Sub: "Define your thesis. Score any deal. Model the returns."
Deliverables: Acquisition Thesis (Free), Deal Scoring (Free), Financial Modeling (From $50), Due Diligence (From $15), Deal Structuring (From $50), Closing (From $100)
Journey: 6 steps B0-B5
Add a "Who this is for" section with 4 buyer types: First-time acquirers, Search fund operators, Independent sponsors, PE bolt-on teams. Just title + 2-line description each.
FAQ: 4 items about SBA modeling, model detail, multiple deals, deal sourcing.

2. client/src/pages/public/Raise.tsx
Hero: "Raise capital without losing control."
Sub: "Investor-ready materials, valuation guidance, and term sheet analysis."
Deliverables: Capital Strategy (Free), Pre-Money Valuation (From $50), Pitch Deck (From $200), Investor Targeting (From $40), Term Sheet Analysis (From $50)
Journey: 6 steps R0-R5

3. client/src/pages/public/Integrate.tsx
Hero: "You just acquired a business. Now what?"
Sub: "The first 100 days determine everything."
Deliverables: Day 0 Checklist (Free), 30-Day Stabilization (From $100), 60-Day Assessment (From $100), 100-Day Optimization (From $150)
Journey: 4 steps PMI0-PMI3

Same design system, same component patterns as the sell page.
```

### PROMPT W.6 — Pricing Page

```
Build the pricing page at client/src/pages/public/Pricing.tsx.

HERO (py-24)
Heading: "Pay as you go."
Subtext: "No subscriptions. No retainers. Add credits when you need them."

HOW IT WORKS (py-20, max-w-2xl)
Heading: "How your wallet works"
Three steps:
1. "Sign up free" — first intake and financial analysis cost nothing
2. "Add credits when ready" — buy as little as $50
3. "Spend on what you need" — clear prices, instant deduction

WALLET BLOCKS (py-20)
Heading: "Choose your wallet size"
Grid of 6 cards (2 columns mobile, 3 desktop):
- Starter $50
- Builder $100 (+5% bonus)
- Growth $200 (+10% bonus) ← "Most popular" badge
- Professional $500 (+15% bonus)
- Accelerator $1,000 (+20% bonus)
- Enterprise $2,500 (+25% bonus)
Cards: white, rounded-2xl, shadow. Name at top, price large, bonus below.
"Most popular" = subtle terra cotta border on the Growth card.
Link below grid: "Need more? View all options →"

COMPARISON (py-20)
Heading: "vs. the alternatives"
Three columns (stack on mobile) — NOT a checkbox comparison table:
- Traditional M&A advisor: $50K-$300K retainer, 5-8% success fee, not available under $2M
- Online calculator: $0-$99, generic formulas, no deliverables
- smbx.ai: Start free, industry-specific, professional deliverables, any deal size
Just text descriptions, no table, no checkmarks.

FAQ (py-20)
5 accordion items about credits, refunds, pricing, leagues, packages.

CTA (py-20, bg-[#F0EDE6])
"Start free. Pay when you see value."
[Get started free →]
```

### PROMPT W.7 — How It Works and Enterprise Pages

```
Build the remaining two public pages:

1. client/src/pages/public/HowItWorks.tsx
Hero: "How smbx.ai works"
Sub: "A guided conversation that produces real deliverables."
Sections:
- Meet Yulia — 2 paragraphs about what she does and how she adapts
- The Gate System — simple visual of 6 connected steps, brief explanation
- Deliverables — list of 6 deliverable types with brief descriptions
- Industries — heading + flowing list of 80+ industry names
- Data Privacy — short "your information is yours" section

2. client/src/pages/public/Enterprise.tsx
Hero: "Built for advisors too."
Sub: "Whether you're a solo broker or a mid-market firm."
Three use cases: Brokers, Advisory Firms, Lenders (title + description each)
Coming Soon section: list of 5 planned features
CTA: "Contact us →" (mailto link for now)

Same design system. Same layout patterns.
```

### PROMPT W.8 — SEO, Meta Tags, Routing

```
Final website polish:

1. Update all routes to include the public pages:
   / → Home, /sell → Sell, /buy → Buy, /raise → Raise, 
   /integrate → Integrate, /pricing → Pricing, 
   /how-it-works → HowItWorks, /enterprise → Enterprise,
   /login → Login, /signup → Signup, /chat → App (requires auth)

2. Create a shared SEO component: client/src/components/SEO.tsx
   that sets document title and meta tags for each page.
   Use these titles and descriptions:
   - /: "smbx.ai — Your M&A Advisor, On Demand" / "Sell, buy, raise capital, or integrate a business. Start free."
   - /sell: "Sell Your Business — smbx.ai" / "Know what your business is worth. Start free."
   - /buy: "Buy a Business — smbx.ai" / "Find your perfect acquisition. Start free."
   - /raise: "Raise Capital — smbx.ai" / "Raise capital without losing control. Start free."
   - /integrate: "Post-Acquisition Integration — smbx.ai" / "Your first 100 days done right."
   - /pricing: "Pricing — smbx.ai" / "Pay as you go. No subscriptions. From $50."
   - /how-it-works: "How smbx.ai Works" / "A guided conversation that produces real M&A deliverables."
   - /enterprise: "smbx.ai for Brokers and Advisors" / "Professional M&A deliverables in minutes."

3. Add OpenGraph tags (og:title, og:description, og:url, og:type) to each page.

4. Create a simple SVG favicon — the letters "sx" in terra cotta (#DA7756) 
   on transparent background. Save as public/favicon.svg.

5. Create public/robots.txt:
   Allow all public pages. Disallow /chat.

6. Create a sitemap at public/sitemap.xml with all public page URLs.

7. Verify: no references to "sellbuysmb", "sbsmb", or any old branding anywhere.

8. Make sure all public pages work without authentication.
   /chat and all /api routes (except auth) require authentication.
```

---

## TESTING CHECKLIST

After building all pages, test on your actual phone:

- [ ] Home page loads with cream background, serif headings
- [ ] All four journey cards link to correct pages
- [ ] "Get started free" buttons link to /signup
- [ ] Sell page has all deliverables and FAQ
- [ ] Buy page has all deliverables and buyer types
- [ ] Raise page has all deliverables
- [ ] Integrate page has all deliverables
- [ ] Pricing page shows wallet blocks correctly
- [ ] How It Works page loads completely
- [ ] Enterprise page loads with contact link
- [ ] Navigation works on mobile (hamburger opens/closes)
- [ ] Footer renders correctly on all pages
- [ ] Dark mode does NOT apply to public pages (keep cream always)
- [ ] Login page looks clean and matches Claude's login
- [ ] Signup page works
- [ ] No page takes more than 2 seconds to load
- [ ] No broken links
- [ ] No old branding anywhere
- [ ] Looks good on iPhone, Android, and desktop
