# SMBX.AI — COMPLETE PUBLIC WEBSITE SPEC (V5)
## Design Language + Conversion Architecture + Page Specs + Build Instructions
## Version 5.0 | February 22, 2026
## THIS FILE REPLACES ALL PREVIOUS SPEC FILES

---

# PART 1: DESIGN LANGUAGE

## Philosophy

Editorial confidence meets warm authority. The homepage IS the product.
Every page has a live chat input because the best sales pitch is 
letting people use the thing.

## Colors

| Token              | Hex       | Usage                                          |
|--------------------|-----------|-------------------------------------------------|
| `--cream`          | `#FAF8F4` | Page background                                 |
| `--cream-deep`     | `#F3F0EA` | Recessed/emphasis zones                          |
| `--warm-white`     | `#FFFFFF` | Cards, chat bubbles, elevated surfaces           |
| `--stone`          | `#E8E4DC` | Borders, dividers, inactive UI                   |
| `--stone-light`    | `#F0EDE6` | Footer, sidebar                                  |
| `--terra`          | `#DA7756` | Primary accent — CTAs, links, brand              |
| `--terra-hover`    | `#C4684A` | Hover/pressed                                    |
| `--terra-soft`     | `#FFF0EB` | Tags, badges                                     |
| `--terra-glow`     | `rgba(218,119,86,.08)` | Card hover shadows               |
| `--text`           | `#1A1A18` | Headings, primary — NEVER #000000               |
| `--text-mid`       | `#4A4843` | Secondary body                                   |
| `--muted`          | `#7A766E` | Descriptions, helper text                        |
| `--border`         | `#E0DCD4` | Card borders, dividers                           |

Rules: NO pure black. NO gradients (except terra CTA block). 
Terra is the ONLY accent color.

## Typography

Serif: `'Playfair Display', Georgia, ui-serif, serif`
Sans: `'Instrument Sans', system-ui, -apple-system, sans-serif`

| Name          | Size                     | Wt  | Font | Usage              |
|---------------|--------------------------|-----|------|--------------------|
| `display-xl`  | clamp(40px, 5.5vw, 72px) | 900 | Ser  | Hero h1            |
| `display-lg`  | clamp(36px, 4.5vw, 60px) | 900 | Ser  | Section h2         |
| `display-md`  | clamp(32px, 3.5vw, 48px) | 900 | Ser  | Sub-section h2     |
| `display-sm`  | clamp(28px, 3vw, 40px)   | 900 | Ser  | CTA headings       |
| `stat`        | 42px                     | 900 | Ser  | Big numbers        |
| `heading`     | 18px                     | 700 | Sans | Card titles        |
| `body-lg`     | 19px                     | 400 | Sans | Lead text          |
| `body`        | 15px                     | 400 | Sans | Paragraphs         |
| `body-sm`     | 14px                     | 400 | Sans | Card descriptions  |
| `caption`     | 13px                     | 400 | Sans | Stat labels        |
| `overline`    | 12px                     | 600 | Sans | Section labels     |
| `nav`         | 14px                     | 500 | Sans | Nav links          |

Rules: Headings ALWAYS serif. Body ALWAYS sans. Italic serif in 
headings is ALWAYS terra colored.

## The Logo

"smbx.ai" — sans-serif (Instrument Sans), 22px, bold, -.03em
"smb" = #1A1A18, "x" = #DA7756, ".ai" = #1A1A18
HTML: `<span class="logo">smb<span class="x">x</span>.ai</span>`

## Buttons — 5 Types Only

| # | Name | Specs | Where |
|---|------|-------|-------|
| 1 | **Primary** | terra bg, white text, 15px/600, 16×32 pad, pill | Hero CTA, section CTAs. Always has →. Max 2 per viewport. |
| 2 | **Secondary** | transparent, 2px stone border, 15px/600, 14×28, pill | Paired with Primary only. Never alone. |
| 3 | **Nav CTA** | terra bg, white, 13px/600, 10×22, pill | Nav bar only. Exactly 1 per page. |
| 4 | **Card Link** | no bg/border, terra text, 14px/600, no padding | Inside cards. Hover: translateX(4px). Has →. |
| 5 | **CTA Block** | white bg, terra text, 16px/700, 18×40, pill | Terra gradient section only. 1 per page at bottom. |

ALL pills (border-radius: 100px). No sharp corners. No 6th type.
Primary + Secondary always same visual height side-by-side.
Mobile: stack vertically, full-width.

## Cards

- bg: warm-white, border: 1px solid --border, radius: 16px
- Hover: border-color terra, shadow 0 8px 32px terra-glow, translateY(-2px)
- Optional: 3px terra top-line fading in on hover
- Same grid = same padding

## Sections

Desktop: 80px 40px padding. Mobile: 48px 20px.
Max width: 1200px centered.
Backgrounds: cream (default), cream-deep (emphasis), stone-light (footer), 
terra gradient (final CTA).

## Nav

Static (scrolls away). 1200px max. ~64px height.
Logo left. Links center-right. Nav CTA far right.
Mobile: logo + hamburger.

## Footer

bg: stone-light. Grid: brand (2fr) + 3 cols (1fr).
Tagline: "The AI deal advisor for brokers, owners, and investors."

## Banned

Dark/black backgrounds. Pure black. Non-terra accents. Sharp buttons.
Underlined links. Animated heroes. Stock photos. Emojis in UI chrome.

---

# PART 2: VOICE & POSITIONING

## Three Pillars (in order)

1. **SPEED** — Deals close in months, not years. Deliverables in 
   minutes, not weeks.
2. **INTELLIGENCE** — Real market data, comps, buyer behavior — 
   applied to YOUR specific deal. Not generic advice.
3. **COLLABORATION** — Owner, broker, attorney, CPA in one deal 
   room. Service providers join free.

## Core Rules

- **The villain is the PROCESS** — slow, fragmented, stuck in 2005. 
  Never brokers. Never advisors. Never any person.
- **Brokers are power users and allies.** They appear as EQUAL users 
  on the homepage. They get featured placement. They benefit.
- **Never say "AI-powered"** — describe the outcome instead.
- **Every page qualifies ALL deal sizes** — a $300K landscaping 
  owner AND a $40M PE partner think "this is for me."
- **The product sells itself.** Every page has a live chat input. 
  The best pitch is letting people use the thing.
- **"Every deal deserves an expert"** is the brand line.

---

# PART 3: CONVERSION ARCHITECTURE

## The Big Idea

The homepage chat input connects to LIVE Yulia. No fake previews.
The user gets real, specific responses about THEIR deal before they 
have an account. The account creation happens inside the conversation 
when the user is already invested.

## The Flow

```
HOMEPAGE (anonymous)
  User types → Yulia responds (real API)
  ↓
5-8 MESSAGES (still anonymous, ~10 min)
  Yulia classifies business, estimates SDE/EBITDA,
  finds add-backs, gives preliminary range
  ↓
ACCOUNT WALL (inline, in chat)
  "To save your conversation and build your full
  financial picture, create a free account."
  Signup form appears IN the chat. Google SSO.
  All messages preserved.
  ↓
SEAMLESS MORPH
  Homepage chat view smoothly becomes the app.
  Sidebar slides in. Conversation continues.
  URL transitions to /chat.
  ↓
FREE GATES (S0 + S1)
  Full financial analysis, add-backs, preliminary
  range, deal roadmap — all free. ~$2K-$5K value.
  ↓
PAYWALL (S2 — natural, not pushy)
  "Your full valuation report is $199."
  User pays → report generates in minutes.
  Pattern established for subsequent gates.
```

## Anonymous Session Spec

- Created on first message from homepage/journey page
- Session ID stored in localStorage + server-side
- Messages stored server-side linked to session_id
- Full Yulia context window maintained
- Rate limit: max 10 messages per anonymous session
- No deliverable generation (text responses only)
- Session expires after 7 days if no account created
- Return visitors see: "Continue your conversation about [business]..."

## Account Wall Behavior

- Appears as a card IN the conversation (not a redirect)
- Email + password fields, Google SSO, Apple SSO
- Triggered when Yulia has delivered 3-4 insights and is 
  ready to generate the financial summary
- On success: session converts, all messages transfer
- Chat continues without interruption

## The Seamless Morph (Homepage → App)

- The chat view on the homepage uses the SAME components as /chat
- Same message bubbles, same input bar, same Yulia avatar
- On account creation: sidebar slides in from left, nav updates,
  URL changes to /chat — but the conversation stays in place
- The user should feel like the website BECAME the app
- Zero "loading new page" or "redirecting" friction

## Journey Page Chat Inputs

Every journey page (/sell, /buy, /raise, /integrate) has a chat 
input with contextual placeholder and suggested prompts:

/sell: "Tell Yulia about the business you want to sell..."
  Suggestions: "I own a restaurant in Chicago" / "My SaaS does $2M ARR"
  
/buy: "Tell Yulia what kind of business you're looking for..."
  Suggestions: "I want to buy a landscaping company" / "Looking for SaaS under $5M"

/raise: "Tell Yulia about your raise..."
  Suggestions: "I need $2M for expansion" / "Exploring Series A options"

/integrate: "Tell Yulia what you just acquired..."
  Suggestions: "I just bought a plumbing company" / "Closing on a SaaS acquisition next month"

These all route to the same Yulia API with the journey context pre-loaded.

## What's Free (Pre-Paywall)

| Journey | Free Deliverables |
|---------|-------------------|
| Sell (S0+S1) | Business classification, SDE/EBITDA calc, add-back ID, preliminary range, roadmap |
| Buy (B0+B1) | Thesis development, target criteria, preliminary sourcing, scoring framework |
| Raise (R0+R1) | Raise assessment, financial structure, gap ID, strategy |
| Integrate (PMI0) | Day Zero checklist, priorities assessment, quick wins |

## Paywall Deliverables & Pricing

| Journey | Gate | Deliverable | Price |
|---------|------|-------------|-------|
| Sell | S2 | Full Valuation Report | $199 |
| Sell | S3 | CIM & Packaging | $299 |
| Sell | S4 | Buyer Matching | $199 |
| Sell | S5 | Closing Support | $299 |
| Buy | B2 | Target Valuation | $199 |
| Buy | B3 | Due Diligence | $299 |
| Buy | B4 | Deal Structuring | $199 |
| Buy | B5 | Closing Support | $299 |
| Raise | R2 | Valuation & Deck | $199 |
| Raise | R3 | Investor Targeting | $149 |
| Raise | R4 | Term Sheet Analysis | $199 |
| Integrate | PMI1 | 30-Day Plan | $299 |
| Integrate | PMI2 | 60-Day Assessment | $299 |
| Integrate | PMI3 | 100-Day Roadmap | $299 |

Journey packages: Sell $1,799 / Buy $1,399 / Raise $749 / Integrate $899

## Wallet Blocks (3 shown, rest behind "More options")

- **Try Yulia** — $199 (one deliverable)
- **Run a Deal** — $999 (+10% bonus = $1,099) ← most popular
- **Deal Pro** — $2,499 (+20% bonus = $2,999)

## Anti-Abuse for Anonymous Sessions

- Rate limit: 10 messages max per session
- IP-based throttling: max 3 anonymous sessions per IP per day
- No deliverable generation without account
- Responses capped at ~300 tokens for anonymous users
- reCAPTCHA or similar on first message if traffic spike detected

---

# PART 4: SITEMAP

```
smbx.ai/
├── /                 Home (chat-first hero)
├── /sell             Sell (story + chat input)
├── /buy              Buy (story + chat input)
├── /raise            Raise (story + chat input)
├── /integrate        Integrate (story + chat input)
├── /pricing          Pricing
├── /how-it-works     Product walkthrough
├── /enterprise       For brokers & advisors
├── /login            Sign In
├── /signup           Create Account
├── /chat             App (authenticated)
└── /legal/
    ├── /privacy      Privacy Policy
    └── /terms        Terms of Service
```

---

# PART 5: PAGE-BY-PAGE SPECS

---

## HOME PAGE (/)

### Section 1: HERO (Chat-First)

H1 (display-xl): "Every deal deserves an *expert.*"

Subtitle (body-lg, muted): "Yulia is the AI deal advisor that 
brokers, owners, and investors use to move faster, know more, 
and close with confidence."

**Live Chat Input:**
- Large text input with placeholder: "Tell Yulia about your deal..."
- Send button (terra, rounded)
- Below input: "Free to start · No credit card"
- Below that: 4 suggested prompt pills:
  - "I want to sell my HVAC business"
  - "I'm looking to acquire a SaaS company"
  - "Help me value a $3M business"
  - "I need to raise $2M"
- Below prompts: "Your first financial analysis is always free."

The chat input is functional. It sends to the real Yulia API.
When user sends a message, the page transitions to a chat view.

### Section 2: WHO USES THIS

Overline: "Built for everyone on the deal"
H2: "One platform. Every seat at the table."

4 persona cards:

**Business Owners**
"Selling, buying, or raising — Yulia speaks your language. No jargon, 
no assumptions. Just clear guidance from first question to closing day."
Example: "I had no idea my add-backs were worth $127K. Yulia found every one."

**Brokers & Advisors**
"Produce CIMs in an hour, not three weeks. Screen and score buyer 
lists instantly. Manage 3× the deal flow with the same team."
Example: "I closed 4 more deals last quarter using Yulia for work product."

**Attorneys & CPAs**
"Invited by your client? You're in — for free. Review financials, 
flag risks, collaborate on documents in real time."
Example: "Finally, one place to see the whole deal instead of chasing 6 inboxes."

**Investors & Search Funds**
"Screen hundreds of targets overnight. Model returns before your 
first call. Manage diligence across a portfolio."
Example: "Scored 47 acquisition targets against my thesis in one session."

### Section 3: SHOW DON'T TELL (Conversation Preview)

Split header:
- Left H2: "See what happens when you *start talking.*"
- Right: "Yulia doesn't ask you to fill out forms. She has a 
  conversation — and turns it into institutional-quality work 
  product in minutes."

Full conversation preview showing a realistic exchange:
User describes HVAC business → Yulia responds with SDE estimate, 
add-backs, market context (PE consolidation in DFW), preliminary 
range of $3.5M–$4.7M → User reacts → Yulia suggests next steps 
including "invite your broker."

Context line: "This analysis took 30 seconds. A traditional advisor 
takes 2–4 weeks."

### Section 4: JOURNEYS

H2: "What brings you here?"
4 journey cards with hook lines:

- **Sell** — "Know your real number." → From "what's my business 
  worth?" to wire transfer.
- **Buy** — "Find the right deal." → Build your thesis, screen 
  targets, model returns.
- **Raise** — "Raise without losing control." → Valuation, pitch 
  deck, investor targeting, term sheet analysis.
- **Integrate** — "Your first 100 days." → Day 0 checklist 
  through 100-day optimization.

### Section 5: TRUST NUMBERS

4-column stat grid:
- $2.4T — Annual SMB transaction volume
- 80+ — Industry verticals with live market data
- Minutes — From conversation to deliverable
- Free — For attorneys, CPAs, and service providers

### Section 6: FINAL CTA

Terra gradient. "Your next deal starts with a conversation."
CTA Block: "Talk to Yulia →"

---

## SELL PAGE (/sell)

### Hero
Tag: "Sell Your Business"
H1: "You built it. Now *own the exit.*"
Lead: "Most owners sell for less than they should — not because the 
business isn't worth it, but because they didn't have the right 
information at the right time. Yulia changes that."
CTA: Primary "Start selling — free →" + Secondary "See how it works"

### Journey Timeline (Visual, Story-Driven)

Overline: "Your selling journey"
H2: "From 'what's it worth?' to *wire transfer.*"

Vertical timeline with steps 1-5. Each step has:
- Number in a dot on a vertical line
- Title + price tag (Free / From $X)
- Description paragraph
- Optional "detail" box with example conversation or scenario

**Step 1: Tell Yulia about your business** (Free)
"No forms. Just a conversation. Describe your business — industry, 
location, revenue, team, whatever you know. Yulia asks smart 
follow-ups and builds your deal profile."
Detail: "I own an HVAC company in Dallas, 12 employees, $3.2M 
revenue, been running it for 15 years." — That's all it takes.

**Step 2: See your real numbers** (Free)
"Yulia calculates your SDE or EBITDA, identifies every legitimate 
add-back, and gives you a preliminary valuation range — with the 
math shown."
Detail: "Most owners discover add-backs they didn't know existed. 
Personal vehicle, one-time expenses, above-market rent to yourself, 
family members on payroll — Yulia finds them all."

**Step 3: Get your valuation report** (From $199)
"Full multi-methodology valuation: comparable transactions, industry 
multiples, discounted cash flow. Benchmarked against real deals in 
your industry and region."

**Step 4: Go to market** (From $299)
"Yulia builds your CIM and identifies qualified buyers. Working with 
a broker? Invite them in — Yulia produces the work product, your 
broker focuses on relationships."
Detail: "Your broker reviews and refines instead of building from 
scratch. The deal moves faster for everyone."

**Step 5: Close with confidence** (From $299)
"LOI comparison, due diligence management, working capital analysis, 
deal structuring. Every party organized, every document in one place."

Below timeline: "Typical sell-side journey: From $1,799 · Traditional 
advisory: ~~$50,000–$200,000~~"
CTA: Primary "Start your journey — free →"

### Built for Your Deal (3 cards)

H2: "Built for *your* deal."

**Under $500K** — "First-time seller"
"Never done this before? Yulia walks you through every step in 
plain language."
Result: "He thought he'd be lucky to get $200K. Yulia found $31K 
in add-backs. Asking price: $425K."

**$500K – $10M** — "Serious operation"
"Institutional-quality work product — same CIMs and valuations 
that $100K advisory firms deliver."
Result: "Valued at $2.6M–$3.9M using live comps. Full CIM in 
47 minutes."

**$10M+** — "Strategic exit"
"PE roll-up, strategic sale, management buyout — Yulia handles 
the analytical heavy lifting."
Result: "Their team of 3 operated like a team of 12. Six 
acquisitions in 14 months."

### Broker Callout (Ally positioning)

Cream-deep box, 2-column:
Left: H3 "Working with a *broker?* Even better."
"Yulia doesn't replace your broker — she makes them faster. Many 
of our most active users are brokers who use Yulia to produce work 
product and manage more deals simultaneously."

Right: 4 benefits with checkmarks:
- Invite your broker into the deal room
- CIMs in an hour — broker reviews instead of building
- Attorneys and CPAs join free
- Broker expertise + Yulia speed = faster close, better terms

### Chat Input (Live, contextual)

H3: "Ready to start?"
Chat input: "Tell Yulia about the business you want to sell..."
Suggested: "I own a restaurant in Chicago" / "My SaaS does $2M ARR" / 
"Landscaping business, 3 employees"

### FAQ

"Can I trust an AI valuation?" → Same methodologies as human advisors. 
Every calc shown, every comp sourced. Many sellers share with their CPA.

"Will buyers take an AI-generated CIM seriously?" → Same format and depth. 
Buyers care about the information. Many CIMs co-branded with the broker.

"Do I still need a broker?" → Your call. Some go end-to-end with Yulia. 
Others use Yulia for analysis and their broker for relationships. Many 
brokers use Yulia themselves.

"What if my business is complicated?" → 80+ industry verticals. Yulia 
adapts. If something is truly unusual, she'll tell you.

### CTA
Terra gradient: "You built something valuable. Let's prove it."
"Talk to Yulia — free →"

---

## BUY PAGE (/buy)

### Hero
Tag: "Buy a Business"
H1: "Find the right deal. *Own it.*"
Lead: "Whether it's your first acquisition or your fifteenth — Yulia 
screens targets, models returns, manages diligence, and keeps every 
party on track."
CTA: Primary "Start buying — free →"

### Journey Timeline

**Step 1: Define your thesis** (Free)
"What kind of business? What size? What geography? What returns? 
Yulia builds your acquisition criteria and search strategy."
Detail: "I'm looking for B2B SaaS companies, $1-5M ARR, 70%+ 
gross margins, in healthcare or fintech."

**Step 2: Screen and score targets** (Free)
"Yulia analyzes market data to identify businesses matching your 
thesis. Each target scored on financial fit, strategic fit, and 
acquisition feasibility."
Detail: "47 targets scored overnight. Top 8 flagged for deep dive."

**Step 3: Value your targets** (From $199)
"Full valuation on any target — comps, multiples, DCF. Know what 
it's worth before your first conversation with the seller."

**Step 4: Run diligence** (From $299)
"Structured DD workflow — financial, operational, legal, commercial. 
Risks surfaced early. Documents organized. Nothing falls through."

**Step 5: Structure and close** (From $299)
"Offer modeling, scenario analysis, deal terms, LOI drafting, 
closing coordination. Every decision supported with data."

Below: "Typical buy-side journey: From $1,399"

### Built for Your Deal (3 cards)

**First-time buyer** — "Buying your first business is terrifying. 
Yulia makes it methodical."
Result: "Went from 'I don't know where to start' to LOI in 6 weeks."

**Search fund / independent sponsor** — "Screen hundreds of targets 
against your thesis. Move fast on the right ones."
Result: "Scored 47 deals overnight. In LOI in 3 weeks."

**PE / strategic** — "Roll-up modeling, platform builds, portfolio 
analytics. Your deal team of 3 operates like 12."
Result: "Six platform acquisitions closed in 14 months."

### Chat Input
"Tell Yulia what kind of business you're looking for..."
Suggested: "SaaS companies under $5M" / "Home services in Texas" / 
"Looking for my first acquisition"

### FAQ + CTA
"Where do the targets come from?" → Market intelligence and public data. 
We complement brokers, not compete.

"Your next acquisition starts with a conversation."

---

## RAISE PAGE (/raise)

### Hero
Tag: "Raise Capital"
H1: "Raise smart. *Keep control.*"
Lead: "The difference between a good raise and a great one is 
preparation. Yulia builds your financial story, your deck, and 
your investor strategy — so you negotiate from strength."

### Journey Timeline

**Step 1: Define your strategy** (Free)
"How much do you need? What are you willing to give? Who should 
you approach? Yulia aligns your raise with your goals."

**Step 2: Build your financial package** (Free)
"Yulia organizes your numbers into the story investors need to 
see. Gaps identified. Weaknesses addressed before they're exposed."

**Step 3: Valuation and pitch deck** (From $199)
"Defensible pre-money valuation. 12-slide institutional deck built 
from YOUR actual data — not a template with your numbers pasted in."

**Step 4: Target the right investors** (From $149)
"Angels, VCs, family offices, strategics — profiled and prioritized 
for your specific raise. The right money, not just any money."

**Step 5: Negotiate terms** (From $199)
"Term sheet analysis. Side-by-side comparison. What each term means 
for your control, dilution, and economics. Negotiate informed."

Below: "Typical raise journey: From $749"

### Chat Input
"Tell Yulia about your raise..."
Suggested: "I need $2M for expansion" / "Exploring Series A" / 
"Want to bring on a strategic partner"

### CTA
"Raise from strength. Talk to Yulia — free."

---

## INTEGRATE PAGE (/integrate)

### Hero
Tag: "Post-Acquisition"
H1: "You bought it. Now *make it work.*"
Lead: "The first 100 days determine whether your acquisition creates 
value or destroys it. Most buyers wing it. You won't."

### Journey Timeline

**Day 0: Secure the business** (Free)
"Change passwords. Lock accounts. Notify key people. Transfer critical 
access. Yulia's Day Zero checklist makes sure nothing slips."

**Days 1-30: Stabilize** (From $299)
"Employee communication. Customer retention. Vendor renegotiation. 
Quick wins that build momentum and trust with your new team."

**Days 31-60: Assess** (From $299)
"SWOT analysis. Operational benchmarking. Where are the cost savings? 
Where are the revenue opportunities? What did due diligence miss?"

**Days 61-100: Optimize** (From $299)
"Full integration roadmap with KPIs, milestones, and accountability. 
The plan that turns your acquisition into a compounding asset."

Below: "Typical integration: From $899"

### Chat Input
"Tell Yulia what you just acquired..."
Suggested: "Just bought a plumbing company" / "Closing on SaaS next month"

### CTA
"Your first 100 days, done right."

---

## PRICING PAGE (/pricing)

### Hero
H1: "Know what you'll spend *before you start.*"
Sub: "Every journey has a clear price. No retainers. No surprises. 
Your first conversation and financial analysis are always free."

### Journey Packages (tabs: Sell / Buy / Raise / Integrate)
Each tab shows stages + prices + total.
- Sell-Side Complete: From $1,799
- Buy-Side Complete: From $1,399
- Raise Capital: From $749
- Integration: From $899

### Three Examples
| $400K landscaping | ~$1,800 total | vs $40K broker |
| $3M HVAC | ~$4,500 total | vs $150K+ traditional |
| $25M PE acquisition | ~$12,000 total | vs $500K+ |

### How to Pay (3 wallet blocks)
- Try Yulia — $199
- Run a Deal — $999 (+10%)  ← popular
- Deal Pro — $2,499 (+20%)
"More options →" for larger blocks.

### What's Free
Full list of pre-paywall deliverables.
"Your first conversation with Yulia costs nothing."

### Service Providers
"Attorneys, CPAs, and real estate agents collaborate free.
When a client invites you, you get full access at no cost."

### FAQ + CTA

---

## HOW IT WORKS (/how-it-works)

### Hero
H1: "Talk to Yulia. She handles the rest."

### 4-Step Process (expanded)
1. Tell Yulia about your deal (Free)
2. She analyzes everything (Free)
3. Get real deliverables (Pay as you go)
4. Close with confidence (Stage-by-stage)

### Applied Intelligence
"Not generic advice. YOUR deal, YOUR market."
Specific examples of intelligence applied.

### Collaboration
"Everyone on the deal. One room."
Broker, attorney, CPA, real estate agent — all in.

### The Four Stories (expanded scenarios)
$400K landscaping / $3M HVAC / $12M search fund / $40M PE roll-up

### Chat Input + CTA

---

## ENTERPRISE (/enterprise)

### Hero
Tag: "For Deal Professionals"
H1: "Your expertise. Yulia's *horsepower.*"
Sub: "Close more deals. Produce better work product. Spend your 
time on relationships, not spreadsheets."

### The Broker Problem
"You have 15 active listings. Each needs a valuation, CIM, buyer 
outreach, DD management. Your associates are drowning. Yulia 
produces institutional-quality work product in minutes."

### 3 Use-Case Cards
- Brokers & Intermediaries
- Attorneys & CPAs (free access when invited)
- PE Firms & Search Funds

### ROI
"A broker producing 2 more CIMs per month adds $150K+ in annual 
revenue. Yulia pays for herself on deal one."

### Chat Input + CTA

---

## LOGIN (/login) & SIGNUP (/signup)

Centered forms on cream bg. Logo at top. No nav links.
Terra CTA buttons. Minimal and clean.

---

# PART 6: SEO

Every page: unique title, meta description, OG tags, canonical URL.
Favicon: "sx" in terra on transparent (SVG).
robots.txt: allow public, disallow /chat.
sitemap.xml: all public URLs.

---

# PART 7: BUILD INSTRUCTIONS FOR CLAUDE CODE

## Priority: The Chat Input

The most important technical feature is the live chat input on 
every public page. This requires:

1. **Anonymous session endpoint** — POST /api/chat/anonymous
   - Creates temp session, stores messages server-side
   - Returns session_id (also stored in localStorage)
   - Rate limited: 10 messages max, 3 sessions per IP per day
   - Yulia responses capped at ~300 tokens for anonymous

2. **Inline signup component** — renders IN the chat flow
   - Email/password + Google SSO
   - On success: converts anonymous session to user account
   - All messages transfer seamlessly

3. **Chat view component** — shared between homepage and /chat
   - Same message bubbles, input bar, Yulia avatar
   - On homepage: no sidebar, minimal chrome
   - After auth: sidebar slides in, URL changes to /chat

4. **Journey context injection** — when chat starts from a 
   journey page, Yulia's system prompt includes journey context
   (e.g., "This user came from /sell, they want to sell")

## Build Order

1. Shared chat components (reusable between public and app)
2. Anonymous session API endpoint
3. Homepage with live chat input
4. Seamless auth flow (inline signup in chat)
5. Journey pages with contextual chat inputs
6. Remaining pages (pricing, how-it-works, enterprise)
7. SEO

## Design Rules (Non-Negotiable)

- 5 button types. ALL pills. No exceptions.
- Headings: serif. Body: sans. No mixing.
- Section padding: 80/40 desktop, 48/20 mobile. Max 1200px.
- NO pure black. NO gradients (except terra CTA). NO stock photos.
- Cards: white, stone border, 16px radius, terra hover.
- Import: Playfair Display (400,700,900,italic) + Instrument Sans (400-700).

## Files to Reference

- This spec (SMBX_PUBLIC_WEBSITE_SPEC.md) — THE source of truth
- smbx-v5-prototype.html — Visual reference for homepage + sell page
- CLAUDE.md — Project conventions
