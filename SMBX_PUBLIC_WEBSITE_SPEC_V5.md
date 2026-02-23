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
- Large text input (white bg, stone border, 20px radius, shadow)
- Placeholder: "Tell Yulia about your deal..."
- Bottom bar inside input: left "Free to start · No credit card", 
  right terra send button (40px, rounded 12px, ↑ arrow)
- Below input: 4 suggested prompt pills (white bg, stone border, pill):
  - "I want to sell my HVAC business"
  - "I'm looking to acquire a SaaS company"
  - "Help me value a $3M business"
  - "I need to raise $2M"
- Pill hover: border terra, text terra, bg terra-soft
- Below prompts: "Your first financial analysis is **always free**."

The chat input is functional. It sends to the real Yulia API.
When user sends a message, the page transitions to a chat view.

### Section 2: ONE PLATFORM (Persona Cards)

Overline: "Built for everyone on the deal"
H2 (display-md): "One platform. Every seat at the table."

4 persona cards (standard card hover with terra top-line):

**🏢 Business Owners**
"Selling, buying, or raising — Yulia speaks your language. No 
jargon, no assumptions. Just clear guidance from first question 
to closing day."
*Italic example at bottom, border-top separator:*
"I had no idea my add-backs were worth $127K. Yulia found every one."

**🤝 Brokers & Advisors**
"Produce CIMs in an hour, not three weeks. Screen and score buyer 
lists instantly. Manage 3× the deal flow with the same team."
*"I closed 4 more deals last quarter using Yulia for work product."*

**⚖️ Attorneys & CPAs**
"Invited by your client? You're in — for free. Review financials, 
flag risks, collaborate on documents in real time."
*"Finally, one place to see the whole deal instead of chasing 6 inboxes."*

**📊 Investors & Search Funds**
"Screen hundreds of targets overnight. Model returns before your 
first call. Manage diligence across a portfolio."
*"Scored 47 acquisition targets against my thesis in one session."*

### Section 3: CONVERSATION PREVIEW

Split header (2-col, aligned to bottom):
- Left H2 (display-md): "See what happens when you *start talking.*"
- Right (body, muted): "Yulia doesn't ask you to fill out forms. 
  She has a conversation — and turns it into institutional-quality 
  work product in minutes."

Conversation preview component (white bg, stone border, 20px radius, 
large shadow — looks like an app window):

Header bar: cream bg, border-bottom, Yulia avatar (terra 32px 
square-rounded with white "Y") + "Yulia · AI Deal Advisor"

Messages:

**User (dark bubble, right-aligned):**
"I want to sell my HVAC business in Dallas. Revenue is about 
$3.2M, I take home around $640K."

**Yulia (cream bubble, left-aligned):**
"Great — let me work with those numbers. Based on your revenue 
and owner compensation, I'm calculating an adjusted EBITDA of 
approximately **$780K** after typical add-backs for owner-operated 
HVAC businesses.

[Terra-soft insight box:]
📊 HVAC companies in the Dallas-Fort Worth market are currently 
trading at 4.5–6× EBITDA. Three PE firms are actively consolidating 
in your region. Your preliminary range: **$3.5M – $4.7M**."

**Context line (centered, caption, muted):**
"— This analysis took 30 seconds. A traditional advisor takes 
2–4 weeks. —"

**User:**
"That's way more than I expected. What do we do next?"

**Yulia:**
"Let's build your financial package and identify your best buyers. 
I'll walk you through every step — or if you're working with a 
broker, invite them in and I'll produce the work product they need 
to get you to market faster."

### Section 4: JOURNEYS

H2 (display-md): "What brings you here?"

4 journey cards (standard card hover with terra top-line):

**Sell** 
Hook (body, 500 weight): "Know your real number."
Description (body-sm, muted): "From 'what's my business worth?' 
to wire transfer — Yulia handles valuation, CIM, buyer matching, 
and closing support."
Card link: "Start selling →"

**Buy**
Hook: "Find the right deal."
"Build your thesis, screen targets, model returns, manage diligence 
— whether it's your first acquisition or your fifteenth."
Card link: "Start buying →"

**Raise Capital**
Hook: "Raise without losing control."
"Valuation, pitch deck, investor targeting, term sheet analysis. 
Negotiate from strength, not desperation."
Card link: "Start raising →"

**Integrate**
Hook: "Your first 100 days."
"You just acquired a business. Now what? Day 0 checklist through 
100-day optimization. Don't let value slip away."
Card link: "Start planning →"

### Section 5: TRUST NUMBERS

4-column stat grid (border-top, items separated by border-right):
- **$2.4T** — Annual SMB transaction volume
- **80+** — Industry verticals with live market data
- **Minutes** — From conversation to deliverable
- **Free** — For attorneys, CPAs, and service providers

### Section 6: FINAL CTA

Terra gradient block, 20px radius.
H3 (display-sm, white): "Your next deal starts with a conversation."
CTA Block button: "Talk to Yulia →"

---

## SELL PAGE (/sell)

### Hero
Tag (overline with terra line-before): "Sell Your Business"
H1 (display-xl): "You built it. Now *own the exit.*"
Lead (body-lg, muted, max-width 600px): "Most owners sell for less 
than they should — not because the business isn't worth it, but 
because they didn't have the right information at the right time. 
Yulia changes that."
CTA: Primary "Start selling — free →" + Secondary "See how it works"

### Journey Timeline (Vertical, Story-Driven)

Overline: "Your selling journey"
H2 (display-md): "From 'what's it worth?' to *wire transfer.*"

Vertical timeline: line on left (2px stone), numbered dots (56px 
circles, stone border, serif number). Dots highlight terra on hover.

**Step 1: Tell Yulia about your business** — [FREE tag, green]
"No forms. Just a conversation. Describe your business — industry, 
location, revenue, team, whatever you know. Yulia asks smart 
follow-ups and builds your deal profile."
Detail box (cream-deep, rounded): *"I own an HVAC company in Dallas, 
12 employees, $3.2M revenue, been running it for 15 years." — That's 
all it takes to start.*

**Step 2: See your real numbers** — [FREE tag, green]
"Yulia calculates your SDE or EBITDA, identifies every legitimate 
add-back, and gives you a preliminary valuation range — with the 
math shown. Not a guess. A number you can take to your CPA."
Detail box: *Most owners discover add-backs they didn't know existed. 
Personal vehicle, one-time expenses, above-market rent to yourself, 
family members on payroll — Yulia finds them all.*

**Step 3: Get your valuation report** — [FROM $199 tag, terra-soft]
"Full multi-methodology valuation: comparable transactions, industry 
multiples, discounted cash flow. Benchmarked against real deals in 
your industry and region. The kind of report advisory firms charge 
$10K–$25K to produce."

**Step 4: Go to market** — [FROM $299 tag, terra-soft]
"Yulia builds your Confidential Information Memorandum — the document 
that makes buyers take your business seriously. Then she identifies 
and scores qualified buyers for your specific deal."
Detail box: *Working with a broker? Invite them in. Yulia produces 
the CIM and buyer research — your broker focuses on relationships 
and negotiation. The deal moves faster for everyone.*

**Step 5: Close with confidence** — [FROM $299 tag, terra-soft]
"LOI comparison, due diligence management, working capital analysis, 
deal structuring, and closing coordination. Yulia keeps every party 
organized and every document in one place."

Below timeline (centered):
"Typical sell-side journey: **From $1,799** · Traditional advisory: 
~~$50,000–$200,000~~"
CTA: Primary "Start your journey — free →"

### Built for Your Deal (3 cards)

H2 (display-md): "Built for *your* deal."

3 cards with terra stat number at top:

**Under $500K** — "First-time seller"
"You've never done this before. That's okay — Yulia walks you 
through every step in plain language. No jargon, no assumptions."
Result box (cream-deep, italic): *"He thought he'd be lucky to get 
$200K. Yulia found $31K in add-backs he didn't know counted. 
Asking price: $425K."*

**$500K – $10M** — "Serious operation"
"You know your business is valuable. Yulia produces institutional-
quality work product — the same CIMs and valuations that $100K 
advisory firms deliver."
Result box: *"Valued at $2.6M–$3.9M using live comps. Three PE 
firms actively consolidating in her industry. Full CIM in 47 minutes."*

**$10M+** — "Strategic exit"
"PE roll-up, strategic sale, or management buyout — Yulia handles 
the analytical heavy lifting while your deal team focuses on 
execution."
Result box: *"Their team of 3 operated like a team of 12. Six 
platform acquisitions closed in 14 months."*

### Broker Callout (cream-deep box, 2-column)

Left column:
H3 (display-sm): "Working with a *broker?* Even better."
Body (muted): "Yulia doesn't replace your broker — she makes them 
faster. Many of our most active users are brokers and advisors who 
use Yulia to produce work product, screen buyers, and manage more 
deals simultaneously."

Right column (4 benefits with terra-soft circle checkmarks):
- **Invite your broker** into the deal room — they see everything, 
  collaborate in real time
- **CIMs in an hour** — your broker reviews and refines instead of 
  building from scratch
- **Attorneys and CPAs join free** — no extra seats, no extra cost
- **Your broker's expertise + Yulia's speed** = deals that close 
  faster at better terms

### Chat Input (Live, contextual)

H3: "Ready to start?"
Chat input component (same as homepage): 
Placeholder: "Tell Yulia about the business you want to sell..."
Suggested prompts: "I own a restaurant in Chicago" / "My SaaS does 
$2M ARR" / "Landscaping business, 3 employees"

### FAQ

H2 (display-sm, centered): "Questions sellers ask."

Items (border-bottom separated):

**"Can I trust an AI valuation?"**
"Yulia uses the same methodologies as human advisors — comparable 
transactions, industry multiples, discounted cash flow. Every 
calculation is shown, every comp is sourced. Many sellers bring 
Yulia's report to their CPA for review. The math speaks for itself."

**"Will buyers take an AI-generated CIM seriously?"**
"The CIM format, depth, and quality match what top advisory firms 
produce. Buyers care about the information, not who typed it. Many 
of our CIMs are reviewed and co-branded by the seller's broker 
before going to market."

**"Do I still need a broker?"**
"That's your call. Some sellers use Yulia end-to-end. Others use 
Yulia for the analytical work and their broker for relationships 
and negotiation. Many brokers use Yulia themselves — she produces 
their work product faster so they can focus on what humans do best: 
building trust and closing deals."

**"What if my business is complicated?"**
"Yulia covers 80+ industry verticals with current market data. 
Whether you're a single-location restaurant or a multi-state 
healthcare practice, she adapts — different metrics, different comps, 
different buyer profiles. If something is truly unusual, she'll 
tell you."

### Final CTA

Terra gradient block.
H3: "You built something valuable. Let's prove it."
CTA Block: "Talk to Yulia — free →"

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
