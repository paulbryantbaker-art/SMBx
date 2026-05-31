# smbX — Design Brief for Claude Design (and any external design tool)

**Purpose of this document:** a single self-contained brief that gives any
external design tool (Claude Design, Cursor, v0, Lovable, Figma AI, a junior
designer) enough context to design the smbX surfaces without losing the
product's identity, the brand doctrine, or the existing design system already
in production.

**How to use:** read §0 first — it defines the two surfaces and what your job
is on each. Then paste §0–§9 into Claude Design and follow the prompt in §6.

---

## 0. The two surfaces — READ THIS FIRST

smbX has **two distinct surfaces**, and your job is different on each. Do not
blur them.

### Surface 1 — Logged-out: a regular marketing website

Anonymous visitors see a **normal website** — header, sections, footer. No app
shell, no sidebar, no canvas. This is the Mercury-style marketing site. You
have **full creative latitude** here, constrained only by the doctrine (§4)
and the design tokens (§5).

Pages: Home, /sell, /buy, /raise, /pmi, /pricing, /standard (+ model pages),
/connectors, /about, /legal.

Entry mechanic: a **Yulia chat input** present on every marketing page.
**Submitting a message is the threshold** — the moment a visitor sends their
first message (or signs in), they are taken into the app (Surface 2). There is
no in-place chat expansion on the marketing site; submit = enter the app.

### Surface 2 — Logged-in: the app shell + raised canvas

Logged-in users work inside the **existing V6 app shell**: a three-panel
layout with a **raised canvas** (the elevated central work surface with
persistent tabs) flanked by a sidebar (left) and Yulia's chat rail (right).

**This shell structure is LOCKED.** It is in production, it works, and it is
not being redesigned. The raised canvas stays. The tab system stays. The chat
rail stays. The tri-panel topology stays.

**Your job on Surface 2 is to design the CONTENT AREAS** — what fills the
regions, not the regions themselves:

- The **content inside each canvas tab** (model interiors, analysis views,
  deal views, the Studio editor, file lists)
- The **content inside each mode-root** (Today, Pipeline, Search, Studio, Files)
- The **content inside the chat thread** (how Yulia's messages, tool-result
  cards, and staged-action approvals render)
- The **visual chrome** of the shell (sidebar styling, tab-strip styling,
  raised-canvas elevation treatment) — restyle to match the new aesthetic, but
  **do not restructure**

See `CLAUDE_DESIGN_APP_WIREFRAME.md` for the exact shell structure and the
precise locked-vs-open boundary on Surface 2.

### The relationship between the two surfaces

```
LOGGED OUT                              LOGGED IN
Marketing website                       App shell + raised canvas
(full CD latitude)        ──submit──►   (shell locked; CD designs content areas)
Mercury aesthetic        first message  Mercury chrome + Bloomberg-density
Yulia chat input          or sign-in    content (see §7)
```

**The threshold is the chat submit.** A visitor types into the Yulia chat
input on any marketing page and hits send — that action navigates them into the
app shell (Surface 2), with their message already in the chat thread and
Yulia's response rendering in the app's chat rail. They do not "expand a chat"
on the marketing site and stay there; the first submit *is* entering the app.

The ChatDock on the marketing site is the *same component* that lives in the
app's chat rail. The first message is carried across the navigation (the
visitor never re-types it), so the handoff is seamless: type on the website,
land in the app mid-conversation.

Implication for both surfaces: the marketing chat input is a **launcher**, not
a destination. Its only job is to capture the first message and hand off to the
app. All actual conversation, tool use, and artifact generation happen on
Surface 2.

---

## 1. What smbX is

**One-sentence frame:** smbX is M&A diligence software accessed through
Yulia, an AI deal-intelligence assistant who produces analyst-grade work
product for the people who actually do M&A — buyers, sellers, capital raisers,
post-close operators — across deals from $300K main-street to mega-cap.

**Two-paragraph frame:**

smbX is a deterministic substrate for M&A diligence work. Where most M&A
software is a CRM + document portal + report templates, smbX is a calculation
substrate that produces *actual analytical artifacts* — valuation baselines,
quality-of-earnings (QoE) preview adjustments, working capital pegs,
SBA/LBO financing models, §1060 allocations, structuring permutations,
deal packages with audit-verifiable hashes, CIMs, LOI scaffolds, post-close
100-day plans. Each artifact is computed, content-addressed, hash-verifiable,
and carries explicit version pins to the methodology that produced it.

Users access the substrate through Yulia, an AI assistant present on every
page surface. Yulia *never* recommends a transaction, negotiates on behalf of
a party, contacts counterparties, signs, files, custodies funds, or matches
buyers to sellers for fees. She presents analysis, options, and implications;
the user decides. This is doctrine, not personality — it's what keeps smbX
out of broker-dealer / investment-adviser / business-broker territory and
on the software side of the line.

**Critical context for design:** the product is genuinely *interesting*. The
methodology is published openly (The Diligence Standard — see §3). The
artifacts are real working analysis. The voice is restrained because the
substance is rigorous. The marketing site's job is to make this *visible* —
not to perform "AI excitement," not to perform "founder-friendly warmth,"
not to perform "enterprise gravitas." The product is the work; the marketing
should feel like the work.

---

## 2. Who actually uses it

Not personas — actual people, in priority order:

1. **Self-funded searchers and search-fund principals.** Recently MBA'd
   acquirers running ETA strategies, hunting one business in the $1M–$5M
   EBITDA range. Sophisticated buyers but solo. Need analyst-grade work
   without analyst headcount. Use Yulia between buyer meetings.

2. **Lower-middle-market PE associates and VPs.** Diligence and structuring
   firepower for $5M–$50M EBITDA acquisitions. Already have analysts; use
   smbX to compress the model-building cycle from days to hours.

3. **Family offices and independent sponsors.** Less institutional than PE,
   more sophisticated than searchers. Episodic deal flow, need to ramp fast
   when something interesting shows up.

4. **Operating-business owners considering exit.** $1M–$50M EBITDA founders.
   First exit, possibly only exit. Need to understand their own business
   the way a buyer's diligence team will. Adversarial education without
   a broker fee structure attached.

5. **Capital raisers.** Operating businesses raising debt or equity. Need
   the financial package a sophisticated lender or investor will require.

6. **Post-close operators.** New owners 30–100 days in. Need a working
   100-day plan, not a McKinsey deck.

7. **Agent platforms.** Claude, ChatGPT, and custom MCP clients use smbX
   as a backend substrate for their own deal-intelligence experiences.
   smbX is the substrate; the agent is the surface.

What none of these users want: a marketing site that performs at them.
They want to see the product, run a calculation, get an artifact, and
move on.

---

## 3. The site

10 pages, plus the methodology library. Each row states the page's *job*,
not its layout — layout is what the design directions explore.

| Page | Job |
|---|---|
| **Home** | Make it immediately obvious smbX is software that produces working analysis, not advice. Get the visitor talking to Yulia in <30 seconds. Show one real artifact (a working capital peg or a valuation baseline) inline. Surface the explicit "what we are NOT" list (broker, advisor, accountant, appraiser). |
| **/sell** | For owner-operators considering exit. Walk through the 6 sell-side stages (S0 Intake → S1 Financials → S2 Valuation → S3 Packaging → S4 Market Matching → S5 Closing). For each stage, show the artifact Yulia produces. |
| **/buy** | For searchers, PE, family offices, strategics. 6 buy-side stages (B0 Thesis → B1 Sourcing → B2 Valuation → B3 Due Diligence → B4 Structuring → B5 Closing). For each stage, show the artifact and the model behind it. |
| **/raise** | For operating businesses raising debt or equity. 6 raise-side stages (R0 Intake → R5 Closing). |
| **/pmi** | For post-close operators. 4 PMI stages (PMI0 Day 0 → PMI1 Stabilization → PMI2 Assessment → PMI3 Optimization). |
| **/pricing** | Tier table (Free / $99 Solo / $249 Pro / $749 Team / $3,000+ Enterprise) + per-artifact SKUs ($99 QoE preview / $499 CIM / $999 valuation dossier). Explicit "never charged" section (no success fees, no per-deal fees, no percentage of deal value). |
| **/standard** | Home of The Diligence Standard — the open methodology library. ~100+ model pages (one per calculation: working capital peg, §1060 allocation, SBA DSCR, exit waterfall, etc.). This is the SEO trust layer. Each model page is a real reference document with inputs, computation, controlling authorities, worked example, and a "generate this in smbX" CTA. |
| **/connectors** | smbX inside Claude, ChatGPT, and any MCP-capable agent. Show the 53 tools, the OAuth flow, the audit guarantees. Strategic message: smbX is the substrate, accessed through any agent. |
| **/about** | What smbX is and is not. The safe-harbor positioning. The team (just Paul today). |
| **/legal** | Terms, Privacy, Acceptable Use, public version of THE LINE Policy. |

Pages **not** to produce:
- "Contact Us" — every page has Yulia
- "Schedule a Demo" — the demo is talking to Yulia right now
- Testimonials carousel (no users yet)
- "Trusted by [logo strip]" (no logos yet)
- Blog (The Diligence Standard replaces it)
- "Get Started" lead-capture wall


The web app is the on-ramp, not the product. Optimize the home page for "first chat in 10 seconds, first artifact in 5 minutes, connector install offered after the first artifact." Long-term, most ongoing use happens inside Claude / ChatGPT / custom MCP clients — the web app stays as marketing + methodology + demo + install flow + the workspace for users who haven't installed an agent yet.
---

## 4. The doctrine — non-negotiable

These rules must be preserved across every design direction:

1. **Universal CTA: "Talk to Yulia."** Never "Contact Sales," never "Schedule
   a Demo," never "Book a Call," never "Get a Quote."
2. **Chat lives on every page**, not on a dedicated contact page. Sticky
   bottom on mobile, persistent in header on desktop, accessible from any
   section.
3. **The free artifact is called *The Baseline***. Never "ValueLens" (retired
   name — if it appears anywhere, replace it).
4. **No success fees, no per-deal pricing, no contingent fees, ever.** All
   pricing is flat — subscription or per-artifact. State this explicitly on
   the pricing page.
5. **Voice is restrained.** Yulia speaks first-person and professional:
   "I've prepared the working capital peg. Here are the three sensitivities
   I varied." Never "I recommend," never "you should," never "the best
   option," never "guaranteed." No marketing bombast ("revolutionary,"
   "game-changing," "AI-powered as a badge").
6. **Surface explicit "what smbX is NOT" on the home page.** Three or four
   lines, plain text: not a broker-dealer, not an investment adviser, not
   a law firm, not a CPA firm, not an appraiser, not an escrow agent. Does
   not negotiate, sign, file, custody, recommend transactions, or match
   counterparties for fees.
7. **Every artifact shown carries a disclaimer block.** Visible, not buried.
8. **Mobile-first.** Assume the first conversation with Yulia happens on a
   phone.
9. **No `position: fixed` full-viewport divs with `background-color`.**
   Safari toolbar bug breaks dark-mode switching. Use `position: absolute`
   inside a relative parent instead.

---

## 5. The existing design language

The V6 design language is in production today. New directions may *evolve*
it but should not *replace* it — the app shell at `client/src/components/v6/V6App.tsx`
isn't going away, and any marketing surface needs to feel continuous with
the app a user lands in after their first chat.

### Tokens (live in `client/src/index.css`, projected to `DESIGN_TOKENS.md`)

**Desktop V6 — Material 3 base, slate-blue accent, cool lavender chrome:**

| Token | Hex | Role |
|---|---|---|
| `--m-primary` | `#2E5C8A` | Slate-blue — the 10% accent. Single hue. No green/purple decoration. |
| `--m-primary-container` | `#DCE7F3` | Soft slate-blue container |
| `--m-secondary` | `#B85C3A` | Warm terracotta — used as <5% highlight chip only, never field |
| `--m-bg` | `#F1F1F4` | Cool grey canvas — the 60% |
| `--m-surface` | `#F8F8FA` | Surface white |
| `--m-surface-1` | `#ECEAF2` | Cool lavender — the 30% chrome (sidebar + tab strip ONLY) |
| `--m-pursue` | `#4A8C6F` | Verdict green — inside verdict pills only, never decoration |
| `--m-watch` | `#B98A1A` | Verdict amber — inside verdict pills only |
| `--m-pass` | `#A23A2F` | Verdict red — inside verdict pills only |

**Mobile V6 — App Store + Liquid Glass, periwinkle accent, watercolor textures:**

| Token | Hex | Role |
|---|---|---|
| `--mb-accent` | `#8A9AE8` | Periwinkle — the mobile primary |
| `--mb-bg` | (cream/warm) | Mobile canvas |
| `--mb-tex-pursue` | `url(/textures/texture-pursue.png)` | Watercolor hero texture (replaces CD's pastel gradients) |
| `--mb-tex-watch`, `--mb-tex-pass` | (watercolor urls) | Per-verdict hero textures |

### Existing primitives (live in `client/src/components/shared/` + `v6/`)

Reuse before inventing. Each is in production and themed correctly:

- **`ChatDock`** — THE chat input. Used everywhere. The universal "Talk to
  Yulia" surface.
- **Studio card** — paid-artifact tile, slate-blue accent, used in Studio
  outputs
- **List card** — neutral list item with status chip and action
- **Compete card** — comparison card for side-by-side deal data
- **Texture card** — mobile watercolor hero card with verdict pill
- **`Reveal`** — scroll-driven section reveal primitive
- **`DotField`** — animated dot-field background (used sparingly)
- **`ChapterStrip`** — chapter/stage navigation (perfect for the journey
  pages' stage walkthrough)
- **`DarkModeToggle`** — the Safari-safe dark-mode swap

### Retired patterns — must not reintroduce

- **Hot pink** (`#D44A78`, V3/V4 era) — if the design has hot pink, it's
  reading a stale doc
- **Warm cream + terra cards** (`#F4EEE3` + `#D4714E`, Cowork-DL "Edition"
  v22 era) — also retired
- **`ValueLens`** — old name for The Baseline
- **"As an AI" framing** — Yulia never says this

---

## 6. The build prompt (direction is locked — see §7)

The design direction is **locked**: Mercury-dominant for the logged-out
marketing website and the app's chrome; Bloomberg-density for the logged-in
work-surface content areas. You are not exploring three directions — you are
applying one locked direction across two surfaces (§0).

When you paste this brief into Claude Design, your prompt should be:

> "Read this brief end-to-end, especially §0 (the two surfaces) and
> `CLAUDE_DESIGN_APP_WIREFRAME.md` (the locked app shell). The design
> direction is locked per §7 — do not propose alternatives.
>
> **Surface 1 — design these logged-out marketing pages as a regular
> Mercury-style website (full latitude within doctrine §4 + tokens §5):**
> 1. Home (`/`) — type-led hero (NOT chat-led), the 'what smbX does' section,
>    the 'what smbX is NOT' safe-harbor block, a methodology preview, a pricing
>    summary, footer. Yulia chat input present (submit → app).
> 2. The Yulia chat input launcher — resting state + placeholder behavior;
>    submitting takes the visitor into the app (see §10).
> 3. `/buy` — Mercury page composition; the B0→B5 stage walkthrough embeds
>    Bloomberg-density tables showing the artifact each stage produces.
> 4. `/standard/working-capital-peg` — a single methodology page, Bloomberg
>    reference-grade density.
> 5. `/pricing` — tier table + per-artifact SKUs + explicit 'never charged' list.
>
> **Surface 2 — redesign these CONTENT AREAS inside the LOCKED app shell
> (do not restructure the shell; see the wireframe):**
> 6. The **Today mode-root** content (briefing-shaped).
> 7. The **Pipeline mode-root** content (table-shaped).
> 8. A **model tab interior** (assumption inputs + computed outputs —
>    Bloomberg density, this is the work surface).
> 9. A **Studio canvas** (CIM / pitch-book editor — document-shaped).
> 10. The **chat thread** content grammar (Yulia messages, tool-result cards,
>     staged-action approval cards).
>
> Preserve on Surface 2: the three-panel topology, the raised canvas, the
> tab system, the chat rail, ChatDock as the universal input. Restyle their
> chrome to the new aesthetic; do not restructure them.
>
> Run the §8 anti-pattern checklist before returning each surface."

---

## 7. Inspiration — Mercury + Bloomberg (the locked references)

**The pairing in one line: Mercury sets the surface. Bloomberg sets the
substance.**

We're deliberately *not* reinventing the wheel. Mercury and Bloomberg are
both deeply trusted by sophisticated financial users — the exact audience
smbX serves. Anchoring to these two references signals "we know who we're
talking to" before any copy is read. Each contributes a different layer of
the design:

- **Mercury (`mercury.com`)** sets the *surface* — how the marketing pages
  feel. Calm, restrained, confident. The financial product done without
  consumer-finance friendliness theater. A working-product aesthetic.

- **Bloomberg (`bloomberg.com/professional/products/terminal` + Terminal
  product pages)** sets the *substance* — how the methodology library and
  the dense pages feel. Credibility-through-density. Permission to show
  many numbers without UX panic. The "for professionals who require this"
  voice.

### What to borrow from Mercury (specifically)

**Structural:**
- Hero composition: a real product screenshot *inside* the hero, not adjacent
  to it. For smbX, this becomes the ChatDock + Yulia + a live working
  capital peg computing in the hero region.
- Section structure on home: hero → product-in-action → "what we do"
  (translated to "what smbX produces") → methodology preview (replaces
  Mercury's customer logos) → pricing → CTA. Linear, sectioned, no
  decorative interludes.
- Sticky pricing comparison on `/pricing` with the tier table visible
  while scrolling.
- The "What makes Mercury different" structural move — for smbX it becomes
  "What makes smbX different from M&A advisory software."

**Visual:**
- Generous whitespace that feels *professional-spare*, not luxury-empty.
  This is the hardest thing to copy from Mercury — they get the density
  exactly right.
- Single accent color used disciplinedly. (For smbX: slate-blue `#2E5C8A`
  desktop / periwinkle `#8A9AE8` mobile.)
- Subtle, accurate product screenshots — not decorative illustrations.
- Buttons: minimal, type-driven, no heavy backgrounds.
- Footer: dense but organized, signals seriousness without screaming.

**Voice:**
- "Banking built for ambitious companies" → translate to:
  *"M&A diligence software built for the people who actually do M&A."*
- Plain English. No jargon, no buzzwords, no "AI-powered" badges.
- Features listed, not marketed.

### What to borrow from Bloomberg (specifically)

**Structural:**
- The Terminal screenshot used as a hero element — translates to
  *DealState view + a working calculation* as the hero element on
  `/buy`, `/sell`, `/raise`, `/pmi`.
- Dense data tables presented as a *feature*, not minimized away.
- "Why professionals choose this" framing → *"Why deal teams choose
  smbX as their diligence substrate."*
- The methodology library (`/standard`) should feel like Bloomberg's
  product documentation: indexed, cross-linked, reference-grade.

**Visual:**
- Permission to show many numbers without softening them with rounded
  cards or generous padding.
- Tabular layouts as a primary content pattern, not a fallback.
- Type used at multiple sizes purposefully (sectional headers, body,
  citations, small-print authority refs).
- Dark mode treated as serious (not gimmicky) — the default for the
  methodology library could be light, but dark mode should feel
  identical-quality.

**Voice:**
- "For professionals who require X" → *"For acquirers who require
  analyst-grade work."*
- Specs and numbers in marketing copy ("53 deterministic tools, 123
  M-slots, hash-verifiable audit chain"), not just benefits.
- No testimonials needed when the product is the proof.

### What to NOT borrow from either

**From Mercury — do not borrow:**
- Their specific palette (we have slate-blue + lavender, not their
  near-monochrome cool greys)
- Banking-specific motifs (account cards, currency symbols, payment
  iconography)
- Their occasional cute illustration (Mercury uses them sparingly; we
  use even less — zero on the marketing site, period)
- The "founders" voice that creeps into some of their sections — we are
  not founder-friendly theater, we are deal-team-credible

**From Bloomberg — do not borrow:**
- Amber-on-black palette (we keep slate-blue + lavender)
- Terminal-specific UI conventions (function keys, keyboard shortcuts
  displayed in marketing)
- Their slightly dated marketing typography (we want modern restraint,
  not 1990s-financial-publication)
- Their "enterprise sales" surface (we don't have a sales team — every
  CTA is "Talk to Yulia")

### Where Mercury applies vs. where Bloomberg-density applies (LOCKED)

The direction is locked to a single split, mapped onto the two surfaces
from §0. This is not an exploration — it's the decision.

| Surface / region | Aesthetic |
|---|---|
| **Logged-out marketing site** (home, /sell, /buy, /raise, /pmi, /pricing, /about, /connectors, /legal) | **Mercury** — restrained, spacious, type-led, calm |
| **Yulia chat input launcher** (marketing entry) | **Mercury** — reads as product, not support |
| **App chrome** (sidebar, tab strip, raised-canvas frame, top bar) | **Mercury** — Mercury's restrained chrome |
| **Methodology pages** (`/standard` + model pages) | **Bloomberg-density** — reference-grade, indexed, cross-linked, tabular |
| **Model tab interiors** (assumptions + outputs + charts) | **Bloomberg-density** — dense, professional-grade work surface |
| **File browser / data room** | **Bloomberg-density** — tabular, scannable |
| **Deal detail view** | **Bloomberg-density** — information-dense overview |

**The axis is clean: marketing + navigation + chrome = Mercury; the actual
work surfaces = Bloomberg.** Mercury signals *care* (gets the visitor to
engage); Bloomberg signals *rigor* (keeps them paying). Both signals fire
where they matter most.

Do **not** apply Mercury's spacious restraint to the model tab interiors or
the methodology pages — those need density. Density is the credibility signal
for this audience; padding it out makes the substrate read as a productivity
toy instead of a professional substrate.

---

## 8. Anti-pattern checklist (paste at the end of every brief)

Before returning a direction, verify it does **none** of the following:

- [ ] Uses the word "Contact" anywhere as a CTA
- [ ] Schedules a demo or a call
- [ ] Tags any pricing plan as "Most Popular" / "Best Value" / "Recommended"
- [ ] Shows fake testimonials or placeholder "trusted by" logos
- [ ] Uses hot pink anywhere
- [ ] Uses warm cream + terra cards
- [ ] Calls the free artifact "ValueLens"
- [ ] Says "we negotiate," "our advisors," "we get you the best deal,"
      "guaranteed"
- [ ] Has Yulia saying "I recommend" or "you should"
- [ ] Hides the disclaimer block
- [ ] Uses `position: fixed` full-viewport divs with `background-color`
- [ ] Introduces a new card style when an existing primitive (Studio, List,
      Compete, texture-card) would fit

---

## 9. Reference sites — primary, secondary, tertiary

**Primary references (locked, see §7):**
- **Mercury (`mercury.com`)** — sets the surface of the marketing pages.
  Financial-product restraint without consumer-finance friendliness theater.
- **Bloomberg (`bloomberg.com/professional/products/terminal`, and the
  broader `/professional` surface)** — sets the substance of the methodology
  library and dense pages. Credibility-through-density.

**Secondary references — borrow specific moves only:**
- **Linear (`linear.app`)** — for the "marketing site feels structurally
  continuous with the product" move (Yulia is the hero, not a hero image).
- **Anthropic (`anthropic.com`)** — for the explicit "what we do / what
  we don't" framing on the home page (the safe-harbor positioning).
- **Stripe Docs (`stripe.com/docs`)** — for the methodology library's
  developer-grade documentation aesthetic, *if* Bloomberg-density alone
  feels too austere.

**Tertiary — useful for narrow problems:**
- **Vercel (`vercel.com`)** — only for the dark-mode-as-serious treatment
  on `/standard` pages, if dark mode is added.
- **Cursor (`cursor.com`)** — only for the "AI assistant in the hero"
  composition, *if* the Mercury-style product-screenshot hero doesn't fit
  the chat-first interaction.

**Do not consult unless explicitly asked:**
- Generic SaaS marketing sites (Notion, Asana, Monday, etc.) — wrong
  audience signal
- Consumer fintech (Cash App, Robinhood, Chime) — wrong audience signal
- Founder-friendly small business tools (Gusto, Pilot, Bench) — wrong
  audience signal

The Mercury × Bloomberg pairing is deliberate and primary. Use the
secondaries to fill narrow gaps; the tertiary list is for problem-specific
research, not general aesthetic direction.

The smbX-specific bet: **Linear as primary structural reference**,
**Stripe Docs as secondary for `/standard`**. Together they cover both
surfaces (journeys + methodology) coherently.

---

## 10. Entry mechanic — the Yulia chat input launcher (LOCKED)

The logged-out marketing site uses a **Yulia chat input** as its entry
mechanic, not a "Get Started" button. **Submitting the first message takes the
visitor into the app** (Surface 2) — the chat input is a *launcher*, not a
destination. There is no in-place chat expansion on the marketing site.

**Why a chat input, not full-chat-in-hero or a "Get Started" button:** smbX is
only valuable with the user's real data. The marketing pages do the
trust-building; the chat input is the single action that converts a convinced
visitor into an app user. One field, one submit, you're in the product.

**Why it must read as "the product," not Intercom support:** size and frame it
larger than a support widget. Name Yulia. Show a real capability line. This is
the front door, not a help bubble.

### The chat input (resting state)

```
┌──────────────────────────────────────────────────────┐
│  ◐  Ask Yulia                                          │
│  ┌────────────────────────────────────────────┐  ┌──┐ │
│  │ Value a deal, build a working capital peg…  │  │↑ │ │
│  └────────────────────────────────────────────┘  └──┘ │
│   Yulia works from your real numbers — a tax return,   │
│   a few figures, or just a name.                       │
└──────────────────────────────────────────────────────┘
```

- The placeholder rotates through real example asks ("Value a business I'm
  considering buying…", "Build a working capital peg…", "Draft a CIM…",
  "Explain how §1060 allocation works…") to communicate scope without
  clickable demo data.
- **On submit → navigate to the app shell**, carry the message across, render
  Yulia's response in the app's chat rail. The visitor never re-types.

Placement: design two variants for comparison — (a) a deliberate page element
in/below the hero and repeated as the section CTA (high-presence, like
Mercury's "Open an account" appearing throughout the page), and (b) a
persistent element. Avoid the pure bottom-right-corner-only treatment — that's
Intercom muscle memory and undersells the product.

### Where starter prompts live now

Because submit takes the visitor straight to the app, **starter prompts live
in the app's first-load empty state** (the chat rail when the visitor arrives
with no message yet — e.g. via sign-in rather than a typed message), not as an
overlay on the marketing site. The marketing input communicates scope through
its rotating placeholder; the app's empty state offers the explicit starters:

```
App chat rail, first load (arrived without a typed message):

Yulia:
"Hi — I'm Yulia. I work on deal analysis, valuation, working
 capital, structuring, and post-close. Tell me what you're
 working on, or pick one to see how I work:

   → Value a business I'm considering buying
   → Build a working capital peg
   → Draft a CIM for a sale process
   → Explain a methodology concept (no data needed)

 I work with whatever you have — a tax return PDF, a few
 numbers, or just a name."
```

(A visitor who arrives by typing a real message on the marketing site skips
this empty state entirely — they land mid-conversation with their message
already sent. The starters are only for the no-message entry path.)

### No demo data — starter prompts only (LOCKED)

Do **not** build a demo/sandbox mode with a fake company. The audience uses
chatbots daily and does not need handholding; a fake-company sandbox signals
"toy" and creates a friction-laden "now bring your real deal" transition.

- The first three starter prompts lead to the user's **own data path**
  ("upload your financials / paste a few numbers / give me a name").
- The fourth starter prompt is the **pure-curiosity path** — Yulia answers
  methodology questions with citations into The Diligence Standard, requiring
  no data. This handles the visitor who wants to verify rigor before sharing
  anything.

### Implementation note (for whoever wires this up)

The first message must survive the marketing→app navigation. Capture it on
submit (sessionStorage or a pending-message state), have the app read and send
it on mount, then clear it. The ChatDock is the same component on both
surfaces, so only the message hand-off needs wiring — not a second chat
implementation.

---

**End of brief.** Direction is locked (§7), the two surfaces are defined (§0),
the entry mechanic is defined (§10). Paste §0–§10 into Claude Design and use
the build prompt in §6. Pair with `CLAUDE_DESIGN_APP_WIREFRAME.md` for the
Surface-2 shell structure. Do not explore alternative directions — apply the
locked one across both surfaces.
