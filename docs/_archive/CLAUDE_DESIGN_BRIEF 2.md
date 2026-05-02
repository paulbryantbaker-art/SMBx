# smbx.ai — Brief for Claude Design

**Use this to spin up a new CD project.** Everything you need to redesign `/` and `/journey` from scratch in a Claude-Code-DL direction is here.

---

## 1. What we are

**smbx.ai** — AI deal intelligence platform for M&A professionals running real transactions. Yulia (the AI) drafts the documents, runs the numbers, builds the buyer lists, and moves deals forward. The platform is **chat-first** — Yulia is the front door. There is no sales team, no contact form. Every CTA routes to chat.

**Target audience** — M&A practitioners who do deals for a living:
- **Searchers** (ETA, self-funded acquisition entrepreneurs)
- **M&A advisors** (lower-middle-market, IBA-affiliated)
- **Business brokers** (IBBA, state associations)
- **Independent sponsors** (fundless, deal-by-deal)
- **Investment bankers** (boutique, sector-focused, middle-market)
- **Exit planners** (CEPAs, value-builder advisors, wealth managers)

**Voice** — Editorial, confident, restrained. Not "AI helper friendly." Closer to a *Wall Street Journal* deal column than a SaaS landing page. Yulia is positioned as the **deal team you hire** — analysis, options, implications, *you decide*. That restraint IS the product.

**Pricing** — Monthly subscription only. No success fees, ever.
- Free: $0 forever — Meet Yulia, one deliverable on the house
- Solo: $79/mo — One active deal at a time
- Pro: $199/mo — Unlimited deals, every capability *(highlight tier)*
- Team: $499/mo — Up to 5 seats, shared workspace
- Enterprise: From $2,500/mo — SSO, SOC 2, single-tenant, API

---

## 2. Brand reference

We want to mirror **Claude Code's design language** (Cowork-derived). That means:

- **Editorial publication aesthetic** — feels like a print artifact, not a SaaS dashboard
- **Warm cream canvas** — `#F4EEE3` (oat) for the page, `#FFFFFF` for cards
- **Terra/Clay accent used SPARINGLY** — `#D4714E`, ≤6 moments per page
- **Display = bold sans for impact, italic serif for editorial moments**
- **Mono type for metadata/captions/footnotes** (gives the "edition" feel)
- **Generous whitespace, asymmetric composition, type-led layouts**
- **No glassmorphism. No gradients on metrics. No purple/cyan AI palette.**

### Local reference files (already saved)

If you can read project files: `/tmp/cowork.html` is a saved copy of the Cowork product page; `/tmp/claude-brand.css` has Anthropic's brand tokens.

---

## 3. Design tokens (current — V17/V20)

```css
/* Canvas */
--canvas-warm:   #F4EEE3   /* page background — oat cream */
--canvas-cream:  #FFFFFF   /* card surfaces */
--canvas-deep:   #1A1814   /* dark bleed sections, footers */

/* Ink */
--ink-primary:   #1A1814   /* near-black, warm */
--ink-secondary: #3D3A33   /* body text */
--ink-tertiary:  #87867F   /* metadata, muted */
--ink-inverse:   #F4EEE3   /* cream type on dark */

/* Rules / borders */
--rule:          #E5DFD2

/* Accent — TERRA / CLAY (sparingly) */
--terra:         #D4714E
--terra-hover:   #B85F3D
--terra-on-dark: #E58761   /* lift slightly on dark canvas */
```

**Terra discipline:** target 6 counted terra moments per page. Typical: hero word/period, an eyebrow, numbered list digits, a final CTA button, an italic editorial closer, an ambient backdrop word at 5% opacity. **Do not** use terra on body text (fails WCAG contrast).

### Type system — four roles, each with one job

```
Display (impact):     'Sora', 800 weight   — clamp(64, 10vw, 144)
Editorial (italic):   'Instrument Serif'   — clamp(36, 5vw, 80)
Body:                 'Inter', 400/500     — 17px / line-height 1.55
Metadata / mono:      'JetBrains Mono'     — 11px / letter-spacing 0.16em / uppercase
```

For a more Claude-Code-DL feel, consider swapping Sora → **Instrument Sans / Söhne / GT America** style, and pairing with the same Instrument Serif for italic moments. The italic-serif-as-editorial-pause is the move.

### Spacing rhythm

- Page padding: `clamp(24px, 5vw, 96px)`
- Section spacing: `clamp(80px, 10vw, 160px)` between major beats
- Card interiors: `clamp(28px, 4vw, 56px)`
- Max content width: 1440px, but text columns capped at 760ch / 65ch for readability

---

## 4. Page: `/` (Homepage)

Current section order, top-to-bottom:

1. **Hero** — text-only, no artifact in hero
2. **A live recast** (two-column: editorial copy ↔ SDE recast card)
3. **The Spine** (dark bleed — three-line pull quote)
4. **Institutional logos** (trust-by-affiliation row)
5. **Six-way persona router** (3-cluster grid: Buy-side / Sell-side / Across the deal)
6. **Trust quotes** (two pull-quotes + micro-stats)
7. **What Yulia does** — 4 zigzag capabilities
8. **Consolidation** (dark bleed — "Eight tools. One line item." with 6-tile animation)
9. **Data bridge** ("Weeks vs. Hours" velocity comparison)
10. **Pricing ladder** (5-tier glimpse)
11. **The Arc** (4 stations: Find / Prepare / Transact / Integrate)
12. **Final CTA** ("She's already waiting." with faint ambient backdrop word)

### V20 copy verbatim

#### Hero
- **Eyebrow:** `FOR THE PEOPLE WHO DO DEALS FOR A LIVING`
- **H1 (two lines):** `Close deals` / `faster.` *(second line in terra, including period)*
- **Subhead:** Yulia is the AI deal team that compresses weeks into hours — drafting the documents, running the numbers, building the buyer lists, and moving deals forward while you sleep. Built for the M&A professionals who do deals for a living.
- **Proof line:** `No success fees, ever · Free to start · Your full deal team on a subscription`

#### A live recast (Section 2)
- **Eyebrow:** `A LIVE YULIA ANALYSIS`
- **Headline (italic serif):** *Two-minute build. Every number sourced.*
- **Body:** Watch Yulia work through a real industrial-services business end-to-end — in the time it takes to finish your coffee. Owner comp normalized, add-backs defended against tax returns, indicative range sourced to live comps.
- **CTA:** `Paste your own deal — try it now →`
- **Artifact:** SDE Recast Card (see §6)

#### The Spine — three lines, terra periods only
1. Close deals faster.
2. The AI deal team that compresses weeks into hours.
3. Built for M&A professionals who do deals for a living.

#### Persona router
- **Eyebrow:** `Six ways Yulia works`
- **Headline:** The work looks different from every seat.
- **Subhead:** Pick the seat you sit in. We'll show you what Yulia does in your world. Or skip it and talk to her directly in the chat.
- **Three clusters:**
  - **Buy-side** — *Bringing capital to the table.*
    - I'm looking to buy a business · Search funder · ETA · Self-funded
    - I raise capital for deals · Independent sponsor · Fundless
  - **Sell-side** — *Bringing the business to market.*
    - I represent sellers · M&A advisor · IBA · LMM
    - I list businesses · Business broker · IBBA
  - **Across the deal** — *Running the engagement end-to-end.*
    - I run transactions at a boutique firm · Investment banker · Middle market
    - I prepare owners for exit · Exit planner · CEPA
- **Card CTA:** `See what Yulia does for you →`

#### Capabilities — section heading
- **Eyebrow:** `WHAT YULIA DOES`
- **Headline:** Weeks of work. Done before lunch.
- **Subhead:** Four things Yulia does that change how fast you close.

##### Cap 01 · The book
- **Headline:** The 100-page sell-side book. Drafted in under an hour.
- **Body:** The core marketing document every serious deal needs — the one your analyst spent three months building — Yulia drafts in 47 minutes. Sourced to the seller's financials. Branded to your firm. Ready for your red pen.
- **Meta (italic):** Same quality a PE buyer expects. Same hour your coffee is still hot.
- **Artifact:** CIM section preview (see §6)

##### Cap 02 · The financials
- **Headline:** Three years of financials. Normalized in minutes.
- **Body:** Owner compensation normalized. Earnings adjustments defended against the tax returns. The working-capital number a buyer's accountant won't argue with. The diligence you'd pay a firm $25,000 to run — done before you sign anything.
- **Meta (italic):** Decision-grade numbers. On a Tuesday.
- **Artifact:** SDE Recast Card

##### Cap 03 · The buyer list
- **Headline:** The buyer list that actually responds.
- **Body:** Strategic acquirers. Financial buyers. Platform plays. Pulled from public filings and current activity — not a database that goes stale between renewals. Scored against the seller's profile so the outreach that goes out has a response rate.
- **Meta (italic):** Better than the subscription you're paying for one.
- **Artifact:** Ranked buyer list card (see §6)

##### Cap 04 · The structure
- **Headline:** The structure that actually closes.
- **Body:** SBA compliance modeling that accounts for every rule change. Seller-note terms that lenders approve. Earnout and rollover structures that survive due diligence. The work that makes the difference between a deal you shake hands on and a deal you wire funds on.
- **Meta (italic):** Built for closing. Not for paperwork.
- **Artifact:** SOP capital-stack diagram (see §6)

#### Consolidation (dark)
- **Eyebrow:** `One subscription. Everything you need.`
- **Headline:** The tools you already pay for give you raw material. Yulia gives you the finished work.
- **Subhead:** The pipeline software, the research database, the document vault, the market reports, the comparison data. They help you gather. Yulia helps you close.
- **Visual:** 3×2 grid of generic tool tiles (Pipeline · Research · Data room · Market data · Documents · Analysis) animating into a single smbx tile. *Currently animated via IntersectionObserver — iterates well as a Lottie or canvas.*

#### Arc (4 stations)
- **Eyebrow:** `The whole deal. Not just one step.`
- **Headline:** From the first conversation to a year after close.
- **Subhead:** Every deal follows the same arc. Find the opportunity. Prepare it. Take it to market. Negotiate the terms. Close. Build value after. Yulia runs the arc — and stays with you when the next one starts.
- **Stations:**
  - **Find** — Sourcing, screening, evaluating opportunities.
  - **Prepare** — Documents, financials, buyer lists, investor memos.
  - **Transact** — Offers, counter-offers, diligence, closing.
  - **Integrate** — Day-one planning, 100-day execution, value creation. *(terra moment — the 4th station's circle is filled terra)*

#### Pricing ladder (glimpse)
5 cards, Pro highlighted with terra top-rail. *(Full table lives on `/how-it-works`.)*
- Free $0 forever · Meet Yulia
- Solo $79/mo · One active deal
- Pro $199/mo · Practitioners *(highlighted)*
- Team $499/mo · Small teams
- Enterprise From $2,500/mo · Firms

#### Final CTA
- **Headline:** She's already waiting.
- **Subhead:** Yulia is live in the chat on your left — the same Yulia that runs in every paid workspace. Ask her anything. Paste a document. Describe a deal. See what she produces.
- **Primary button:** `Talk to Yulia`
- **Secondary link:** `Or see how Yulia works →` *(routes to /how-it-works)*
- **Backdrop word (5% opacity terra):** `CLOSE.`

---

## 5. Page: `/journey?p=<persona>`

**Visually distinct from home** — runs on **dark canvas** `#16130E` (deeper than home's cream) with cream type. Hero headline uses **Instrument Serif italic** (not Sora) to feel like a long-form dossier rather than a marketing cover.

Six tabs in sticky pill bar at top: **Searcher · Advisor · Broker · Sponsor · Banker · Exit Planner**. URL state via `?p=`. Default = `searcher`. Each tab has the same structure with persona-specific copy.

**Page structure (per tab):**
1. Sticky pill bar (with `← Home` link on the left)
2. Dossier strip — mono "Dossier · {persona} · File · {ID}-001 · Issued · {date} · Confidential · For practitioners"
3. Hero — eyebrow + italic-serif H1 (with terra period) + subhead + chip suggestions, paired with a **per-persona artifact card** on the right
4. **What you're up against** — data-cited problem statement with mono source footnote
5. **How Yulia changes that** — numbered list of 4 changes (terra digits)
6. **Live demo** — cream-island callout with outlined-terra demo button
7. **The arc** — 4–5 lifecycle stations
8. **Pricing pointer** — short tier hint
9. **Footer CTA** — large headline + filled-terra button + per-persona ambient backdrop word (SEARCH / DRAFT / LIST / RAISE / PITCH / READY)

### V20 persona copy (full text per tab)

#### Searcher (default)
- **Eyebrow:** `Searchers · ETA (Entrepreneurship Through Acquisition) · Self-funded`
- **Headline:** From 100 teasers to 3 real deals — in a week, not a quarter.
- **Subhead:** The median search runs 19 months. You screen 100–300 companies a week. 37% of searches end without a close. Yulia screens a teaser in 90 seconds, runs pre-LOI diligence in the time it takes to read the teaser again, and models SBA-compliant structures that actually clear the June 2025 rule changes.
- **Chips:** `Screen this teaser` · `Run QoE Lite` · `Model SBA structure for $4M EBITDA`
- **What you're up against:** 1,250 hours a year on top-of-funnel screening. A pipeline that tops out at 150 companies per week even with Grata or Sourcescrub. A 37% failure rate on the search itself. A 21.3% rate of LOI breaks from QoE discrepancies in 2025 — double the 2023 rate. And on June 1, 2025, SOP 50 10 8 deleted the phased buyout structure your peers relied on, forcing full seller standby and personal guarantees on retained equity.
  - **Source:** `Stanford 2024 Search Fund Study · Fed SBCS 2024 · Axial Dead Deal Report 2025`
- **How Yulia changes that:**
  1. **Proprietary sourcing engine.** Google Places + Census + SBA-data-integrated. Surfaces trigger-event targets by age, tenure, industry, and readiness markers. The intern-reading-PDFs loop becomes a scored pipeline Yulia maintains daily.
  2. **90-second teaser screen.** SDE normalized against owner comp. Add-backs stress-tested. Customer concentration flagged. Pursue/pass with reasoning attached.
  3. **QoE Lite pre-LOI.** Proof of cash. NWC peg. One-timer scrub. The Range Rover add-back called out by name.
  4. **SOP 50 10 8 structures.** Hard-codes the June 2025 rule changes — seller note full-standby, 10% equity injection, no partial buyouts.
- **Demo button:** `Screen a teaser →`
- **Footer button:** `Screen a teaser`
- **Footer CTA:** Try Yulia on a teaser you're sitting on right now.
- **Backdrop word:** `SEARCH.`

#### Advisor
- **Eyebrow:** `M&A advisors · IBA (International Business Associates) · LMM (Lower Middle Market)`
- **Headline:** Your client's CIM. Drafted by Friday. Closed by Tuesday.
- **Subhead:** You run 2–4 live mandates. CIM drafting eats 80–150 hours per mandate. 30–40% of engaged mandates don't close. Bake-off win rate hovers at 20–33%. Yulia drafts the book, builds the buyer tree, runs the status across five parties, and preps the next pitch — between your client calls.
- **Chips:** `Draft a CIM for a $12M EBITDA platform` · `Build a buyer tree for industrial services` · `Generate the pitch for Tuesday's bake-off`
- **What you're up against:** 400–600 hours a year of CIM drafting at principal rates. A 30–40% mandate failure rate — meaning 60% of your engagement hours don't convert. A bake-off win rate of 20–33%, so 60–80% of your pitch labor is unrecovered. And a tool stack that runs $80K–$250K a year for a 5-person shop — DealCloud, PitchBook, Axial, Datasite — that gives you raw material but doesn't produce the finished work.
  - **Source:** `FE Training 2024 · Vendr 2025 · Axial 2024 · FIRMEX Fee Guide`
- **How Yulia changes that:**
  1. **CIM drafted in under an hour.** 100 pages, redline-ready, branded to your firm.
  2. **Buyer tree that responds.** Strategics, financials, platform plays — scored against the seller's profile.
  3. **22-gate deal scoring.** Kill dying mandates at gate 8, not gate 18.
  4. **Structure modeling + negotiation tactics.** R&W insurance terms. Earnout structures. Rollover equity.
- **Demo button:** `Draft a CIM section →`
- **Footer button:** `Draft my book`
- **Footer CTA:** Try Yulia on a mandate you're pitching this week.
- **Backdrop word:** `DRAFT.`

#### Broker
- **Eyebrow:** `Business brokers · IBBA (International Business Brokers Association) · State associations`
- **Headline:** Recast. Valuation. Marketing package. By lunch.
- **Subhead:** 75–90% of Main Street listings never sell. Each dead listing consumed 50–150 hours of your time. CIM prep takes 40–80 hours per engagement. 23–29% of deal failures trace to unrealistic seller expectations. Yulia handles the prep that swallows your week and arms you for the seller conversation that wins the listing.
- **Chips:** `Recast this P&L` · `Run The Baseline on a $1.8M HVAC business` · `Draft the marketing package`
- **What you're up against:** IBBA Q4 2024: 368 brokers completed 330 deals — about 3.6 closes per broker per year. 75–90% of Main Street listings never sell. CIM prep on an engagement that does move forward runs 40–80 hours. 23–29% of deal failures trace to unrealistic seller expectations, with 84% of those pricing gaps 11–30% over realistic value.
  - **Source:** `IBBA Market Pulse Q4 2024 · M&A Source 2024 · Axial 2024`
- **How Yulia changes that:**
  1. **The Baseline™ multi-scenario valuation.** Sourced to IBBA Market Pulse multiples and the seller's financials.
  2. **Full marketing package in hours.** CIM, teaser, NDA, buyer list, offer matrix.
  3. **SBA pre-qualification modeling.** Buyer financial capacity tested before LOI.
  4. **Buyer-list engine.** Replaces the BizBuySell + DealStream + BizEquity stack.
- **Demo button:** `Run a P&L recast →`
- **Footer button:** `Recast a listing`
- **Footer CTA:** Try Yulia on a listing you're prepping right now.
- **Backdrop word:** `LIST.`

#### Independent Sponsor
- **Eyebrow:** `Independent sponsors · Fundless · Deal-by-deal`
- **Headline:** One deal. Fifteen LPs. Fifteen memos. One afternoon.
- **Subhead:** You pitch 5–20 LPs per deal. Hit rate is 10–25% on the second meeting. 1–3 commit. 25–33% of exclusive LOIs fail to close — absorbing $150K–$300K of diligence and legal per dead deal. Yulia auto-generates audience-specific IC memos, models R&W and earnout structures, and front-runs the QoE discrepancies that killed 21.3% of 2025 LOIs.
- **Chips:** `Draft IC memo for family office` · `Model rollover equity` · `Build cap table waterfall`
- **What you're up against:** McGuireWoods 2024: two-thirds to three-quarters of exclusive LOIs close. The 25–33% that die cost $150K–$300K each in diligence and legal. You run 5–10 deals a year. IC memo labor is 40–80 hours per deal × audience variant. Independent sponsors were 27% of Axial closed deals last year — competing against funds with committed capital and a Monday-morning IC.
  - **Source:** `McGuireWoods 2024 IS Survey · Citrin Cooperman 2024 · Axial Dead Deal Report 2025`
- **How Yulia changes that:**
  1. **Audience-specific IC memos.** Family-office, mezz-fund, institutional-LP — three variants from one deal file. Fifteen LPs in one afternoon.
  2. **Structure modeling against LP mandates.** R&W, earnout, rollover, seller financing — pre-tested against each capital partner's known mandates.
  3. **Blind Equity™ + QoE Lite.** Front-runs the 21.3% LOI-break QoE discrepancies.
  4. **22-gate methodology + deal scoring.** Defensible "why now" narrative.
- **Demo button:** `Draft an IC memo →`
- **Footer button:** `Draft an LP memo`
- **Footer CTA:** Start drafting the capital partner memo for your live deal.
- **Backdrop word:** `RAISE.`

#### Investment Banker
- **Eyebrow:** `Boutique IBs · Middle market · Sector-focused`
- **Headline:** The 200-hour CIM. Done in 40. By the analyst. On Tuesday.
- **Subhead:** Your analyst spends 150–300 hours on CIM and model per mandate. 85% quit within two years. Your firm spends 150% of analyst salary on retention. The MD bottleneck is pitch prep — freeing 400 hours a year unlocks 1–2 additional live mandates. Yulia compresses analyst-to-VP workflow from weeks to days.
- **Chips:** `Draft pitch for Tuesday's bake-off` · `Build comp set for healthcare services` · `Run buyer universe targeting`
- **What you're up against:** McKinsey 2024: one leading bank cut investment-brief production from 9 hours to 30 minutes with generative AI. SignalFire: 25% of junior banker time is on tasks AI can now do. JPMorgan spent $500M+ on analyst retention in 2024. Your tool stack runs $50K–$80K per banker.
  - **Source:** `McKinsey 2024 · SignalFire 2024 · Vendr 2025 · Farsight AI in IB Survey 2024`
- **How Yulia changes that:**
  1. **28 document generators + The Rundown™.** 200-hour CIM/pitchbook build → 40 hours of review-grade work.
  2. **Buyer-list engine against comp-transactions database.** Surfaces 21%-pursuit-rate targets.
  3. **Diligence Q&A + RBAC deal room.** Eliminates Datasite per-page fees.
  4. **Yulia as analyst + associate + VP for MD pitch prep.**
- **Demo button:** `Draft a pitchbook page →`
- **Footer button:** `Build my pitch`
- **Footer CTA:** Try Yulia on your next bake-off pitch.
- **Backdrop word:** `PITCH.`

#### Exit Planner
- **Eyebrow:** `CEPAs (Certified Exit Planning Advisors) · Value Builder advisors · Wealth managers`
- **Headline:** Owner readiness diagnosed in one conversation.
- **Subhead:** 80% of an owner's net worth sits illiquid in the business. 76% regret the sale within 12 months. Businesses scoring ≥80 on readiness get offers 71% higher than average. Only 32% of owners have a documented exit plan. Yulia surfaces trigger-event owners, generates the readiness report, and quarterbacks the 5–7 specialist handoffs.
- **Chips:** `Run owner-readiness scorecard` · `Generate value-gap analysis` · `Build 100-day value creation plan`
- **What you're up against:** EPI 2023: 80% of owner net worth sits in the business. 76% regret the sale within 12 months. Value Builder data: businesses scoring ≥80 receive offers 71% higher than average — implying ~40% discount for unprepared owners. Only 32% of owners have a documented exit plan, so 68% of your natural market is invisible to conventional prospecting.
  - **Source:** `EPI 2023–25 State of Owner Readiness · Value Builder · Exit Planning Institute`
- **How Yulia changes that:**
  1. **Prospect-identification engine.** Trigger-event detection. Surfaces age 55+, 10+ year tenure, no valuation, 80%+ illiquid owners.
  2. **Owner-readiness + value-gap assessment.** Branded Rundown™ report.
  3. **28 document generators including the 100-day PMI plan.**
  4. **Handoff coordination via deal room.** Quarterback CPA, attorney, IB, estate planner, insurance, lender.
- **Demo button:** `Run readiness scorecard →`
- **Footer button:** `Run a readiness scorecard`
- **Footer CTA:** Run the readiness scorecard on a client you've been circling.
- **Backdrop word:** `READY.`

---

## 6. Artifacts (visual elements with content)

### SDE Recast Card
A live-document tile showing a normalized earnings worksheet:
- Header: `YULIA · SDE RECAST` (mono) / `TTM · 2026` (right)
- Title: `Normalized earnings & valuation`
- Mono context line: `Industrial services · $1.8M revenue · Texas`
- Sub: `TTM figures, three-year tax returns defended`
- Worksheet rows:
  - Reported pre-tax earnings ↦ $612,400
  - + Owner compensation (above market) ↦ $184,000
  - + Personal vehicle & travel ↦ $38,200
  - + One-time legal settlement ↦ $62,000
  - + Family member payroll (non-working) ↦ $104,000
  - **Normalized SDE** ↦ **$1,000,600**
  - Multiple range (industry · revenue band) ↦ 3.2× – 3.8×
- Terra moment: `INDICATIVE VALUATION` eyebrow + `$3.2M – $3.8M` headline
- Footnote: `Quick-cash · local buyer · 90–120 days to close`

### CIM section preview
Document tile mocking up a CIM page:
- Mono header: `THE BOOK · SECTION 3.2 · DRAFT`
- Display: `3.2 Investment Highlights`
- Three short body paragraphs (78% of revenue under multi-year contracts; technician retention 94% — 3× industry; EBITDA margin expansion 11.2% → 18.6%)

### Multiple Matrix (heatmap)
Industry × revenue-band grid (6 industries × 4 bands), terra-tinted cells by intensity. Bottom legend: Light → Heavy gradient.

### Ranked buyer list
- Header: `BUYER LIST · 12 RANKED` (mono left) · `YULIA · LIVE` (mono right)
- Ranked rows with numeric prefix (01–05), buyer name + tag (e.g., "Closed 3 similar · LOI in 11 days"), and 5-dot fit score. Top match in terra.
- Footer: `Top match responded last Tuesday.` · `7 warm · 5 cold`

### SOP capital stack
- Mono header: `DEAL STRUCTURE · CAPITAL STACK`
- Three stacked bars sized by % of total — Buyer equity 10% (terra), Bank loan 78% (ink), Seller note 12% (dim)
- Each row: `Label`, `Amount`, footnote line
- Footer: `Modeled end-to-end · Ready for the credit committee`

### Per-persona artifact (journey hero)
Each `/journey` tab shows a persona-specific document preview as the hero artifact. Same chrome (mono header → bold title → 2–3 body paragraphs → italic footnote), different content per persona:
- Searcher: `PURSUE` / `Teaser Screen · HVAC · TX`
- Advisor: `CIM · DRAFT` / `3.2 Investment Highlights`
- Broker: `BASELINE` / `Indicative range · $1.8M HVAC`
- Sponsor: `IC MEMO · DRAFT` / `Family-office variant · Acme platform`
- Banker: `PITCHBOOK · P.04` / `Why us · Healthcare services`
- Exit Planner: `READINESS` / `Owner readiness · Score 62 / 100`

---

## 7. Behaviors

### Slide-over reveal (homepage dark sections)
The Spine and Consolidation sections are dark-bleed full-screen panels. As the user scrolls, the **previous cream section pins (`position: sticky; top: 0; z-index: 1`)** while the **dark section rises up from below with `z-index: 2`**. Visual effect: dark curtain rolls up over pinned cream content. Pure CSS sticky + z-index, no JS animation library.

### Persona switch (journey)
- Sticky pill bar at top, mask-image right-edge fade for horizontal scroll on mobile
- Click or `←/→` arrow keys to switch personas
- 220ms `journey-fade-in` opacity animation on subtree remount (`key={active.id}`)
- URL updates via `?p={id}` without page reload

### Hero animation (homepage)
- Sora ExtraBold display with `clamp(64, 10.4vw, 144)` — drops cleanly across viewports
- "faster." (terra) is the only color accent in the H1
- Hero is text-only; the SDE recast card lives in the section *below* the hero (V20 spec — keeps the hero composition tight)

### Reveal-on-scroll
Each major section uses an IntersectionObserver to add `data-v17-revealed='true'` to children with `data-v17-reveal`, triggering opacity + 14px translateY transitions in 60ms staggered intervals. Respects `prefers-reduced-motion`.

### Mobile thumb-zone CTA (journey only)
Fixed-position bottom-right pill on viewports ≤767px showing the persona's demo verb. One tap to send the prompt to Yulia. Hidden on desktop.

---

## 8. Anti-patterns we're avoiding (please continue to avoid)

These are the AI-generated tells we've explicitly designed against. Don't introduce them:

- **No purple/cyan gradients** anywhere. No "AI shimmer."
- **No glassmorphism** — frosted glass cards, glow borders used decoratively.
- **No gradient text on metrics** ($3.2M with a gradient is dead.)
- **No rounded rectangles with one-side colored borders** — the lazy "accent" pattern.
- **No identical-card grids** repeated endlessly (icon + heading + text × 6).
- **No hero metric layout template** — big number, small label, gradient blur.
- **No sparklines as decoration** — tiny charts that say nothing.
- **No "Inter everywhere"** — four type roles, four jobs.
- **No dark mode with glowing accents** — looks "cool" without design decisions.
- **No modals unless there's no alternative.**
- **No success fees / contact sales / wallet — ever.** Subscription only.
- **No long-press gestures.** Visible ⋯ menus, swipe actions, or dedicated buttons.

---

## 9. What's currently rough — please look at these

These are the spots we want CD's eye on:

1. **Homepage feels long** — 12 sections is a lot of scroll. Worth questioning if Consolidation + Data Bridge + Pricing Ladder all need to be there or whether Consolidation alone carries the message.

2. **Persona router cluster grid** — works on desktop; mobile collapses to a single column that's still 6 cards tall. Maybe a horizontal scroll-snap on mobile?

3. **Capabilities zigzag is right but visually monotone** — 4 caps × identical alternating layout. Could one of them break the pattern (full-width artifact, or a dark-bg cap)?

4. **`/journey` dark-canvas direction is bold** — but might be *too* dark for a marketing surface. Worth A/B'ing against a softer version (deeper cream with terra hairlines instead of full ink background).

5. **Editorial tone** — copy is right but visually we're closer to "tech publication" than "Wall Street dossier." A real Wall Street move would be a serif body font on `/journey` and tighter columns (like a newspaper).

6. **Yulia chat panel** is always on the left of the canvas. Designs need to assume a 33%-viewport sticky chat column on desktop, full-screen on mobile.

7. **Reduced motion** — we respect `prefers-reduced-motion` for the slide-over but the rest of the entrances aren't fully audited. Worth a polish pass.

---

## 10. Tech stack constraints (so designs are buildable)

- **React 19 + Vite 7 + Tailwind CSS v3 + Radix UI**
- All components are inline-styled React (TSX), no separate CSS modules currently
- Wouter for routing — `/`, `/journey?p=…`, `/how-it-works`
- No animation libraries in homepage path — pure CSS transitions + IntersectionObserver. (Open to adding GSAP / Motion if a moment really needs it.)
- All financial values stored in cents as integers. Money rendered formatted (`$3.2M`, `$612,400`).
- Mobile-first. Designs need to work at 375px portrait and adapt up.

---

## 11. Files / where things live

If CD has filesystem access:
- `client/src/components/canvas_marketing/HomeCanvas.tsx` — the homepage
- `client/src/components/canvas_marketing/JourneyCanvas.tsx` — the journey page
- `client/src/components/canvas_marketing/HowItWorksCanvas.tsx` — /how-it-works (includes pricing table + FAQ)
- `client/src/components/artifacts/SDERecastCard.tsx` — the live SDE worksheet
- `client/src/index.css` — global tokens + slide-over CSS
- `/tmp/cowork.html` — saved Cowork product page reference
- `/tmp/claude-brand.css` — saved Anthropic brand tokens

---

## 12. Bottom line

We have working V20 home + journey pages with the right copy and a credible editorial direction. The job for CD: **take this content and rebuild the visual + interaction layer to match Claude Code's design quality.** Mirror the Cowork rhythm, the Anthropic restraint, the editorial publication aesthetic — applied to a niche M&A audience that needs to take this product seriously the moment they land.

The voice and content are locked. The visual execution is open.
