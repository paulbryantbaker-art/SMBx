# SMBX.AI — COMPLETE PUBLIC WEBSITE SPEC
## Design Language + Copy + Page Specs + Build Instructions
## Version 4.0 | February 22, 2026
## THIS FILE REPLACES: SMBX_SALES_WEBSITE_SPEC.md, SMBX_WEBSITE_COPY_FINAL.md, all previous DL docs

---

# PART 1: DESIGN LANGUAGE

The definitive visual spec. Every public page follows this exactly.

## Philosophy

Editorial confidence meets warm authority. Playfair Display headlines 
carry typographic weight. Warm cream palette says "we're serious about 
your money, but we're not a bank." Every element earns its place.

## Colors

| Token              | Hex       | Usage                                          |
|--------------------|-----------|-------------------------------------------------|
| `--cream`          | `#FAF8F4` | Page background — the base of everything        |
| `--cream-deep`     | `#F3F0EA` | Recessed areas, emphasis zones                   |
| `--warm-white`     | `#FFFFFF` | Cards, elevated surfaces                         |
| `--stone`          | `#E8E4DC` | Borders, dividers, inactive UI                   |
| `--stone-light`    | `#F0EDE6` | Footer background, sidebar                       |
| `--terra`          | `#DA7756` | Primary accent — CTAs, links, brand              |
| `--terra-hover`    | `#C4684A` | Hover/pressed state for terra elements           |
| `--terra-soft`     | `#FFF0EB` | Tags, badges, light emphasis                     |
| `--terra-glow`     | `rgba(218,119,86,.08)` | Icon backgrounds, card hover shadows  |
| `--text`           | `#1A1A18` | Headings, primary text — NEVER #000000           |
| `--text-mid`       | `#4A4843` | Secondary body, footer links                     |
| `--muted`          | `#7A766E` | Descriptions, helper text                        |
| `--border`         | `#E0DCD4` | Card borders, dividers                           |

Rules: NO pure black. NO gradients on backgrounds (except terra CTA block). 
Terra is the ONLY accent. No blue, green, purple.

## Typography

| Name          | Size                     | Weight | Font      | Usage                    |
|---------------|--------------------------|--------|-----------|--------------------------|
| `display-xl`  | clamp(52px, 7vw, 92px)   | 900    | Serif     | Hero h1 only             |
| `display-lg`  | clamp(36px, 4.5vw, 60px) | 900    | Serif     | Section h2               |
| `display-md`  | clamp(32px, 3.5vw, 48px) | 900    | Serif     | Sub-section h2           |
| `display-sm`  | clamp(28px, 3vw, 40px)   | 900    | Serif     | CTA headings             |
| `stat`        | 42–48px                  | 900    | Serif     | Big numbers              |
| `heading`     | 18–20px                  | 700    | Sans      | Card titles              |
| `body-lg`     | 18px                     | 400    | Sans      | Hero subtitle, lead      |
| `body`        | 15px                     | 400    | Sans      | Paragraphs               |
| `body-sm`     | 14px                     | 400    | Sans      | Card descriptions        |
| `caption`     | 13px                     | 400    | Sans      | Stat labels              |
| `overline`    | 12–13px                  | 600    | Sans      | Section labels (uppercase, .15–.2em tracking) |
| `nav`         | 14px                     | 500    | Sans      | Nav links                |

Fonts:
- Serif: `'Playfair Display', Georgia, ui-serif, serif`
- Sans: `'Instrument Sans', system-ui, -apple-system, sans-serif`

Rules: Headings are ALWAYS serif. Body is ALWAYS sans. Italic serif 
is reserved for emphasis words inside headings and is ALWAYS terra colored.

## The Logo

Text mark: "smbx.ai" — mixed color
Font: Sans (Instrument Sans / system-ui) — NOT serif
Weight: 700, letter-spacing: -.03em, size: 22px
Colors: "smb" → #1A1A18, "x" → #DA7756, ".ai" → #1A1A18
HTML: `<span class="logo">smb<span class="x">x</span>.ai</span>`

## Buttons — 5 Types Only

### 1. PRIMARY (Main CTA)
- bg: terra, text: white, 15px/600, padding: 16px 32px, pill
- Hover: terra-hover, translateY(-1px)
- Always has → arrow. Max 2 per viewport.

### 2. SECONDARY (Paired with Primary)
- bg: transparent, text: --text, border: 2px solid stone
- 15px/600, padding: 14px 28px, pill
- Hover: border-color --text
- Never appears alone. Always next to Primary.

### 3. NAV CTA (Nav bar only)
- bg: terra, text: white, 13px/600, padding: 10px 22px, pill
- Exactly 1 per page. Smaller than Primary.

### 4. CARD LINK (Inside cards)
- No bg, no border. text: terra, 14px/600
- Hover: translateX(4px). Arrow → included.

### 5. CTA BLOCK (Terra section at bottom)
- bg: white, text: terra, 16px/700, padding: 18px 40px, pill
- Hover: translateY(-2px), shadow
- 1 per page, in the terra CTA block only.

Rules: ALL pills. Primary + Secondary always same visual height.
Mobile: stack vertically, full-width. No 6th type. Ever.

## Cards

- bg: warm-white, border: 1px solid --border, radius: 16px
- Hover: border-color terra, shadow 0 8px 32px terra-glow, translateY(-2px)
- Optional: 3px terra top-line that fades in on hover
- Cards in same grid MUST have identical padding

## Section Rhythm

- Desktop: padding 80px 40px. Mobile: 48px 20px.
- Max content width: 1200px, centered.
- Backgrounds: cream (default), cream-deep (emphasis), stone-light (footer), 
  terra gradient (final CTA only)

## Nav

- Static (scrolls away). Max-width 1200px. Height ~64px.
- Logo left, links center-right, Nav CTA far right.
- Mobile: logo + hamburger only.

## Footer

- bg: stone-light. Grid: brand (2fr) + 3 link cols (1fr).
- Logo + tagline left. Product / Company / Legal columns.
- Bottom: © 2026 smbx.ai, border-top.

## Tags

- Free: bg #E8F5E9, text #2E7D32, 11px/700/uppercase/pill
- Paid: bg terra-soft, text terra, 11px/700/uppercase/pill
- Hero tag: 13px/600/uppercase/.18em tracking, terra, with 36px line before

## Banned

- Dark/black backgrounds
- Pure black (#000000)
- Non-terra accent colors
- Sharp-cornered buttons
- Underlined links
- Animated hero elements (particles, orbs)
- Stock photography
- Emojis in UI chrome

---

# PART 2: VOICE & POSITIONING

## Three Pillars (in order)

1. **SPEED** — Deals that take 12 months close in 4. CIMs in an 
   hour. Analysis in minutes. You move at market speed.
2. **INTELLIGENCE** — Real market data, comps, industry benchmarks, 
   buyer behavior — applied to YOUR specific deal. Yulia knows what 
   HVAC companies in Dallas sell for.
3. **COLLABORATION** — Owner, broker, attorney, CPA in one deal room. 
   Service providers collaborate for free.

Cost savings are real and mentioned — but they're the RESULT of 
speed and automation, not the headline.

## Rules

- The villain is the PROCESS, never people. Not brokers, not advisors.
- Brokers and service providers are users and allies.
- Never say "AI-powered" — say "instant" or describe the outcome.
- FAQ = objection handling. Answer what stops signups.
- CTA is always "Start Free →" or journey-specific variant.
- Every page must qualify ALL leagues in <5 seconds — a $300K 
  owner AND a $40M PE partner both think "this is for me."
- Pricing = value, not cost. Journey packages, not deliverable menus.
- ROI framing: "Spend $1,800, add $500K to your sale price."

---

# PART 3: SITEMAP & FUNNEL

## Sitemap

```
smbx.ai/
├── /                 Home
├── /sell             Sell Your Business
├── /buy              Buy a Business
├── /raise            Raise Capital
├── /integrate        Post-Acquisition Integration
├── /pricing          How Pricing Works
├── /how-it-works     Product Walkthrough
├── /enterprise       Brokers / Advisors / Firms
├── /login            Sign In
├── /signup           Create Account
├── /chat             App (authenticated)
└── /legal/
    ├── /privacy      Privacy Policy
    └── /terms        Terms of Service
```

## Conversion Funnel

```
Search / Referral / Social
         │
    HOME or JOURNEY PAGE  ← traffic lands
         │
    /sell  /buy  /raise   ← intent-specific SEO
         │
      /signup             ← single conversion point
         │
    /chat (FREE gates)    ← S0+S1 free, user invests 30 min
         │
    PAYWALL (Gate 2)      ← first paid deliverable
         │
    WALLET TOP-UP         ← Stripe
         │
    PAYING CUSTOMER       ← continues through gates
```

The app IS the funnel. Free gates are the trial. By paywall, 
the user has invested 30 minutes and seen real value.

---

# PART 4: PAGE-BY-PAGE SPECS

---

## HOME PAGE (/)

SEO Title: "Sell or Buy Any Business, Anywhere — smbx.ai"
Meta: "AI deal advisory from valuation to close. Sell, buy, raise 
capital, or integrate. Start free."

### Section 1: HERO

H1 (display-xl): "Sell a business. Buy a business. Raise capital."
Sub (body-lg, muted): "Yulia is your AI deal advisor. She does the work."

Below the H1: Visual strip — 4 mini-cards in horizontal row 
(scrollable on mobile). Each card: deal size + one result + journey type.

| $400K Landscaping | $3M HVAC | $12M Search Fund | $40M PE Roll-up |
|---|---|---|---|
| Found $31K in add-backs | Valued at $2.6M–$3.9M | 47 targets scored overnight | 6 acquisitions in 14 months |
| Selling | Selling | Buying | Platform Build |

Cards: small, clean, data-forward. Warm-white bg, stone border, 
body-sm text. On mobile these scroll horizontally.

Below the strip: "Start free. Yulia figures out the rest."

CTA: Primary "Start free →" + Secondary "How it works"

Bottom of hero: horizontal rule (2px solid --text), then trust stats 
in 4-column grid:

| $2.4T annual SMB volume | 73% fail rate without guidance | 30%+ value left on table | 24hr to first valuation |

### Section 2: THE PROBLEM

Cream-deep background with border, rounded, padded.

H2: "Most owners sell for *30% less* than their business is worth."

Right side: 4 stat cards in 2×2 grid:
- 10% — typical broker commission
- $25K+ — average advisory retainer
- 6–12 mo — average close time with broker
- 70% — of listed businesses never sell

### Section 3: OUTCOMES (Yulia results)

Split header:
- Left: H2 "Your AI advisor delivers *results.*"
- Right: "Yulia builds deal-specific strategies using real market data, 
  comps, and industry benchmarks — then guides you through every stage."

4 outcome cards (2×2 grid):
- 3–4× EBITDA Multiples Captured
- 23+ Qualified Buyers, Day One
- 80% Less Time on Admin
- 90% Cost Reduction vs. Brokers

### Section 4: HOW IT WORKS

Centered overline: "How It Works"
H2: "Three steps to your best deal."

3-column card grid:
1. "Start a conversation" — Tell Yulia about your business or target. 
   She builds your profile. [Free to start tag]
2. "Get real deliverables" — Valuation, buyer list, CIM, DD checklist. 
   Real documents, not summaries. [Pay as you go tag]
3. "Close with confidence" — Negotiation, deal structuring, closing. 
   Every stage, every decision. [Stage-by-stage tag]

### Section 5: JOURNEYS

H2: "What brings you here?"

4-column card grid:
- Sell: "Know your number. Find qualified buyers. Close on your terms." 
  → Card link "Start selling →"
- Buy: "Build your buy box. Find the right deal. Model the returns." 
  → Card link "Start buying →"
- Raise: "Structure your raise. Match with investors. Keep control." 
  → Card link "Start raising →"
- Integrate: "Your first 100 days, done right. Systems, people, culture." 
  → Card link "Start planning →"

### Section 6: FINAL CTA

Terra gradient background, rounded.
H3: "Ready to make your next deal your best deal?"
CTA Block button: "Start with Yulia →"

---

## SELL PAGE (/sell)

SEO Title: "Sell Your Business — smbx.ai"
Meta: "Know what your business is worth. Defensible valuation, 
professional CIM, buyer identification. Start free."

### Hero
Hero tag: "Sell Your Business"
H1: "Know what your business is worth."
Sub: "From first financial analysis to wire transfer — guided 
every step. Your first analysis is free."
CTA: Primary "Start selling — free →" + Secondary "See deliverables"

### "Built for your deal size"
3 cards showing range:
- Under $500K: "First-time seller? Yulia walks you through every 
  step in plain language."
- $500K – $10M: "Experienced owner selling a real operation? 
  Institutional-quality work product."
- $10M+: "PE or strategic exit? Full CIM, buyer targeting, deal 
  room management."

### What You Get (vertical list, not cards)

Financial Analysis — Free
"SDE/EBITDA calculated. Every legitimate add-back identified."

Defensible Valuation — From $199
"Multi-methodology using current market data for your industry."

Confidential Information Memorandum — From $299
"The document that makes buyers take your business seriously."

Buyer Identification — From $199
"Qualified buyers profiled and prioritized for your deal."

Closing Support — From $299
"LOI comparison, DD prep, working capital, funds flow — to the wire."

### Your Journey (visual steps)
① Intake .................. Free
② Financial Package ........ Free
③ Valuation ............... From $199
④ CIM & Packaging ......... From $299
⑤ Buyer Matching .......... From $199
⑥ Closing ................. From $299
Typical total: From $1,799

### FAQ (objection handling)
- "How accurate is an AI valuation?" → Multiple methodologies, 
  real comps, shown work. Many users bring it to their CPA.
- "Will buyers take a CIM from an AI seriously?" → Same format 
  and depth as a $50K advisory firm produces.
- "What if my business is complicated?" → 80+ industry verticals. 
  Yulia adapts to your specific business type.
- "Do I still need a broker?" → Many users work with brokers who 
  use Yulia. We complement, not replace.

### CTA
Terra gradient block. "Know your number. Start free."

---

## BUY PAGE (/buy)

SEO Title: "Buy a Business — smbx.ai"
Meta: "Find your perfect acquisition. Build your thesis, screen 
targets, model returns. Start free."

### Hero
Hero tag: "Buy a Business"
H1: "Find the right deal. Model the returns."
Sub: "Build your acquisition thesis. Yulia screens targets, runs 
valuations, and manages diligence."
CTA: Primary "Start buying — free →"

### "Built for your deal size"
- First-time buyer: "Buying your first business? Thesis to close."
- Search fund / independent sponsor: "Screen hundreds of targets overnight."
- PE / strategic: "Roll-up modeling, platform builds, portfolio analytics."

### What You Get
Acquisition Thesis — Free
Target Screening & Scoring — From $199
Target Valuation — From $199
Due Diligence Management — From $299
Deal Structuring & Modeling — From $199
Closing Support — From $299
Typical total: From $1,399

### FAQ
- "Where do the targets come from?" → We analyze publicly available 
  data and market intelligence. We don't compete with brokers.
- "Can I use this for multiple acquisitions?" → Absolutely. 
  Roll-up operators use Yulia for serial acquisitions.

### CTA
"Find your next acquisition. Start free."

---

## RAISE PAGE (/raise)

SEO Title: "Raise Capital for Your Business — smbx.ai"
Meta: "Raise capital without losing control. Pitch deck, investor 
materials, term sheet analysis. Start free."

### Hero
Hero tag: "Raise Capital"
H1: "Raise capital without losing control."
Sub: "Investor-ready materials, valuation guidance, and term sheet 
analysis — negotiate from strength."
CTA: Primary "Start raising — free →"

### What You Get
Capital Strategy — Free
Pre-Money Valuation — From $199
Pitch Deck — From $199
Investor Targeting — From $149
Term Sheet Analysis — From $199
Typical total: From $749

### FAQ
- "What kind of raises?" → Angel, seed, Series A through growth 
  equity. Debt structures too.
- "Does Yulia find investors?" → She profiles and prioritizes 
  investors for your specific raise. Introductions are yours.

### CTA
"Raise smart. Start free."

---

## INTEGRATE PAGE (/integrate)

SEO Title: "Post-Acquisition Integration — smbx.ai"
Meta: "You just acquired a business. Now what? Day 0 checklist 
through 100-day optimization plan."

### Hero
Hero tag: "Post-Acquisition"
H1: "You just acquired a business. Now what?"
Sub: "The first 100 days determine value creation or destruction. 
Yulia makes sure it's the former."
CTA: Primary "Start your integration — free →"

### What You Get
Day 0 Checklist — Free
30-Day Stabilization Plan — From $299
60-Day Assessment — From $299
100-Day Optimization Roadmap — From $299
Typical total: From $899

### CTA
"Your first 100 days, done right."

---

## PRICING PAGE (/pricing)

SEO Title: "Pricing — smbx.ai"
Meta: "Know exactly what you'll spend. Journey packages from $749. 
Start free, pay as you go."

### Hero
H1: "Know exactly what you'll spend before you start."
Sub: "Every journey has a clear price. No retainers. No surprises. 
Your first conversation and financial analysis are always free."

### Section 1: Journey Packages (tabs or cards)

Layout: 4 tabs — Sell / Buy / Raise / Integrate.
Each shows journey stages + what you get + price per stage + total.

Sell-Side Complete: From $1,799
Buy-Side Complete: From $1,399
Raise Capital: From $749
Integration: From $899

"From" because league multipliers adjust final price based on 
deal complexity. DO NOT show multiplier tables on the page.

### Section 2: Three Examples (not a formula)

"What does it actually cost?"

| Your deal | Typical total | Traditional cost |
|-----------|---------------|-----------------|
| $400K landscaping business | ~$1,800 | $40,000 (10% broker) |
| $3M HVAC company | ~$4,500 | $150,000+ (5% broker + advisor) |
| $25M PE acquisition | ~$12,000 | $500,000+ (banker + legal + advisor) |

### Section 3: How to Pay

Three wallet options shown:

**Try Yulia** — $199
"See what the work product looks like."

**Run a Deal** — $999 (+10% bonus)
"Most customers start here." ← mark as popular

**Deal Pro** — $2,499 (+20% bonus)
"Everything you need. One purchase."

Small "More options →" link for larger blocks.

### Section 4: What's Free

- Business intake and classification
- SDE/EBITDA calculation  
- Add-back identification
- Preliminary valuation range
- Journey roadmap
"Your first conversation with Yulia costs nothing."

### Section 5: Service Provider Access

"Attorneys, CPAs, and real estate agents collaborate free."
"When a client invites you to their deal room, you get full access 
at no cost. Focus on what you do best."

### FAQ
- "Why isn't it a subscription?" → You pay for what you use. 
  No monthly fee collecting dust.
- "Can I start small and add more later?" → Yes. Buy one deliverable 
  or the whole journey.
- "What if I need a bigger deal analyzed?" → Larger deals use adjusted 
  pricing that reflects complexity. Still a fraction of traditional cost.
- "Is there a refund policy?" → If Yulia's work product doesn't meet 
  professional standards, we'll make it right.

### CTA
"Start free. Pay when you're ready."

---

## HOW IT WORKS PAGE (/how-it-works)

SEO Title: "How It Works — smbx.ai"
Meta: "Talk to Yulia. Get real deliverables. Close your deal. 
See how AI-powered M&A advisory actually works."

### Hero
H1: "Talk to Yulia. She handles the rest."
Sub: "Here's what happens when you start a deal."

### Section 1: The Process (4 steps, expanded)

Step 1: "Tell Yulia about your deal" — Free
"Are you selling, buying, raising, or integrating? Yulia asks the 
right questions, classifies your business, and builds your profile."

Step 2: "She analyzes everything" — Free
"Yulia calculates your SDE or EBITDA, identifies add-backs, pulls 
industry comps, and gives you a preliminary range."

Step 3: "Get real deliverables" — Pay as you go
"Full valuation report. CIM. Buyer list. Pitch deck. DD checklist. 
Real documents you can hand to a buyer, investor, or attorney."

Step 4: "Close with confidence" — Stage-by-stage
"LOI review, due diligence management, deal structuring, closing 
coordination. Yulia guides every decision."

### Section 2: Applied Intelligence

H2: "Not generic advice. YOUR deal, YOUR market."

Show specific examples of intelligence applied:
- "HVAC companies in Dallas sell at 4.5–6× EBITDA to PE consolidators"
- "Your gross margins are 12% below industry median — here's how to fix it"
- "3 PE firms actively acquiring veterinary practices in your region"
- "Based on 847 comparable transactions in the last 24 months"

### Section 3: Collaboration

H2: "Everyone on the deal. One room."

"Invite your broker, attorney, CPA, and real estate agent into your 
deal room. They collaborate for free. Shared documents, shared timeline, 
no email scavenger hunts."

### Section 4: Built for Every Deal Size

The 4-scenario stories (expanded versions):
- $400K landscaping (Marco) — L1 seller story
- $3M HVAC (Danielle) — L3 seller story  
- $12M search fund acquisition — L4 buyer story
- $40M PE roll-up — L5 platform build story

These are the detailed stories that got cut from the homepage hero.

### CTA
"See it in action. Start free."

---

## ENTERPRISE PAGE (/enterprise)

SEO Title: "For Brokers & Advisors — smbx.ai"
Meta: "Your deal expertise. Yulia's analytical horsepower. Close 
more deals, faster."

### Hero
Hero tag: "For Deal Professionals"
H1: "Your expertise. Yulia's horsepower."
Sub: "Close more deals. Produce better work product. Spend your 
time on relationships, not spreadsheets."
CTA: Primary "Get started →" + Secondary "Talk to us"

### Section 1: The Problem for Brokers

"You have 15 active listings. Each one needs a valuation, a CIM, 
buyer outreach, and DD management. Your associates are drowning. 
Yulia is the team member who produces institutional-quality work 
product in minutes and never needs to sleep."

### Section 2: Use Cases (3 cards)

**Brokers & Intermediaries**
"Produce CIMs in an hour. Screen and score buyer lists instantly. 
Manage 3× the deal flow with the same team."

**Attorneys & CPAs**
"Free access when invited by a client. Review financials, flag 
risks, collaborate in real time."

**PE Firms & Search Funds**
"Screen hundreds of targets against your thesis. Model returns 
before your first call. Manage diligence across portfolio companies."

### Section 3: ROI for Professionals

"A broker producing 2 more CIMs per month at average commission 
adds $150K+ in annual revenue. Yulia pays for herself on deal one."

### CTA
"Your deal expertise. Yulia's speed. Let's go."

---

## LOGIN (/login) & SIGNUP (/signup)

Clean, centered forms on cream background. Logo at top. 
Match the public site design — zero visual friction into the app.

Login: Email + password. "Sign in" Primary button. 
"Don't have an account? Sign up" link below.

Signup: Name + email + password. "Create account" Primary button.
"Already have an account? Sign in" link below.

Both pages: minimal, no sidebar, no nav links (just logo). 
Same cream background, same terra CTA buttons.

---

## LEGAL PAGES (/legal/privacy, /legal/terms)

Standard legal text. Same cream background, serif headings, 
sans body. Max-width 720px centered. Simple and clean.

---

# PART 5: SEO & META

Every page gets:
- Unique <title> (specified per page above)
- <meta name="description"> (specified per page above)
- OpenGraph: og:title, og:description, og:url, og:type
- Canonical URL
- H1 tag (only one per page)

Site-wide:
- Favicon: SVG, letters "sx" in terra cotta on transparent
- robots.txt: Allow all public pages, disallow /chat
- sitemap.xml: All public page URLs
- No old branding (sellbuysmb, sbsmb, etc.)

---

# PART 6: BUILD INSTRUCTIONS FOR CLAUDE CODE

## Files to Read First
- This file (SMBX_PUBLIC_WEBSITE_SPEC.md)
- CLAUDE.md (project context)
- The homepage HTML prototype (if present) — for visual reference only

## Build Order
1. Design system CSS tokens + shared components (Button, Card, etc.)
2. Nav + Footer (shared across all pages)
3. Home page (/)
4. Sell page (/sell)
5. Buy page (/buy)
6. Raise page (/raise)
7. Integrate page (/integrate)
8. Pricing page (/pricing)
9. How It Works page (/how-it-works)
10. Enterprise page (/enterprise)
11. Login + Signup pages
12. SEO: meta tags, favicon, robots.txt, sitemap.xml

## Critical Rules
- Use the homepage HTML prototype as VISUAL REFERENCE for layout, 
  spacing, and component styling — but build in React + Tailwind
- Follow the Design Language in Part 1 EXACTLY
- Only 5 button types exist (see Part 1). No 6th type.
- All buttons pill-shaped. Primary + Secondary same height when paired.
- Headings always serif. Body always sans. No mixing.
- Italic terra treatment only inside headings (<em> or <i>)
- Section padding: 80px 40px desktop, 48px 20px mobile
- Max content width: 1200px
- NO pure black (#000000) anywhere
- NO stock photos, emojis in chrome, or animated heroes
- Mobile-first: test at 375px width
- All "Start Free" / "Get Started" CTAs link to /signup
- Journey card links go to their respective pages (/sell, /buy, etc.)
- Dark mode does NOT apply to public pages — always cream
- After building, run `npm run build` and fix all errors
- Verify all pages render at mobile and desktop widths

## Homepage HTML Prototype

If `/smbx-homepage-final.html` or similar is in the repo root, 
use it as a VISUAL REFERENCE for:
- Layout structure and section order
- Typography sizes and weights
- Card styling and hover effects
- Button sizes and pairing
- Color application
- Spacing and rhythm

Build the React components to match this visual output, using 
Tailwind classes mapped to the Design Language tokens.
