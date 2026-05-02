# smbX.ai Public Marketing — Stitch Brief

Paste this entire file into Stitch's prompt. It describes a 3-page marketing front-end (desktop only) that sits inside an app shell. The pages render as canvas tabs at the top of a content area — the left sidebar holds a chat composer ("Yulia") that is always visible. No sign-up button in the chrome: users sign up only when they need a deliverable, via the chat flow.

Generate **desktop screens at 1440px wide.** Mobile is deferred.

---

## Design System (pin these exactly)

### Palette — monochrome only

| Role | Light | Dark |
| --- | --- | --- |
| Canvas (card fill) | `#FFFFFF` | `#1C1D1F` |
| Page background | `#F5F5F7` | `#0F1012` |
| Surface subtle | `#FAFAF8` | `rgba(255,255,255,0.02)` |
| Border | `#E5E1D9` | `rgba(255,255,255,0.06)` |
| Border subtle | `rgba(60,55,45,0.05)` | `rgba(255,255,255,0.04)` |
| Text primary | `#1A1C1E` | `#F0F0F3` |
| Text muted | `#6E6A63` | `rgba(240,240,243,0.62)` |
| Text subtle | `#9A968F` | `rgba(240,240,243,0.38)` |
| Accent fill (buttons, chips) | `#0A0A0B` | `#F0F0F3` |
| Accent text (on accent fill) | `#FFFFFF` | `#0A0A0B` |

**No pink. No terra cotta. No gradients in chrome.** Pure black-and-white monochrome. Warm off-whites (`#FAFAF8`, `#F5F5F7`), not cool greys. Subtle warmth in paper-like surfaces.

### Typography

- **Headline:** Sora, weight 800, letter-spacing `-0.03em`, line-height 1.02–1.08.
- **Body:** Inter, weight 400 (text) / 500 (labels) / 600 (emphasis) / 700 (card titles).
- **Numbers / badges:** Sora, weight 700, letter-spacing `-0.01em`.
- **Section labels:** Sora, 11px, weight 700, letter-spacing `0.14em`, uppercase.
- **Never italic.**

### Shape

- Card radius: 14px (cards, CTA cards), 10–12px (smaller cards), 999px (pills, chat, persona pills)
- Canvas card radius: 14px, 1px border
- Tab strip tabs: `10px 10px 0 0` (rounded top only)

### Spacing rhythm

4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 56 / 64 / 72 / 96.

### Motion

Exponential ease-out on hovers. Scale-down-on-press for buttons (`0.97`). Stagger on enter (40–60ms). Transform + opacity only; never width/height.

---

## Chrome — shared across all 3 pages

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Left: Yulia chat column, ~520px wide]  │  [Right: canvas panel]    │
│                                         │                           │
│ ┌─ welcome / chat scroll ─────────────┐ │ ╭── [Home] [Journey]       │
│ │                                     │ │ │    [How it works] ──╮    │
│ │  (conversation OR empty state)      │ │ │    │ active tab     │   │
│ │                                     │ │ │    │ blends with    │   │
│ │                                     │ │ │    │ canvas below   │   │
│ │                                     │ │ ╰─── ╰─ ... ─ seamless ─  │
│ │                                     │ │                           │
│ ├─ ChatDock pill ────────────────────┤ │ │  [page content]          │
│ └─────────────────────────────────────┘ │                           │
└─────────────────────────────────────────────────────────────────────┘
```

- **Left column** — fixed 520px wide. Chat scroll area with ChatDock pill at the bottom. This column is the same across all pages; it's not part of what Stitch generates (we already have it). Model in Stitch as a simple left rail placeholder labeled "Yulia chat lives here."
- **Canvas area** — fills remaining width, has 16px padding around a canvas card (radius 14px, 1px border, soft shadow).
- **Canvas tab strip** — Dia browser style. Three rounded-top tabs: `Home`, `Journey`, `How it works`. Active tab fills with the canvas card color (same hex) so the active tab visually "melts" into the canvas. Inactive tabs are transparent or subtly recessed with a 1px border. No close buttons — these are permanent marketing tabs.
- **No top nav bar above the tabs.** Tabs ARE the nav.
- **No sign-up button anywhere.** Signup happens later via chat flow when a deliverable is requested. Only a discreet "Sign in" link top-right of the canvas area for returning users.

---

## Page 1: Home (`/`)

Centered content column on the left side of the canvas, 4-stage pattern rail on the right.

### Layout

**Canvas is a 2-column grid inside the card** (`gridTemplateColumns: 1.3fr 1fr`, gap 56px). Everything in the LEFT column is centered horizontally and stacked vertically with generous breathing room.

### Left column (centered)

1. **Headline** (Sora 800, clamp(40px, 4.6vw, 68px), line-height 1.02, letter-spacing -0.035em, max-width 720px):
   > The deal team you hire. Analyst. Associate. VP.

2. **Hero chat pill** — 58px tall, 999px radius, max-width 560px, white card with 1px border. Layout:
   - Left: paperclip icon (`stroke: textSubtle`, size 16px)
   - Middle: placeholder text "Tell Yulia about your deal…" in Inter 15px, text-subtle
   - Right: a 36px circular filled button in accent color (`#0A0A0B`) with an up-arrow icon (white). This is the "send" visual even though clicking the whole pill focuses the real chat on the left.
   - Soft shadow: `0 1px 3px rgba(60,55,45,0.04), 0 1px 1px rgba(60,55,45,0.02)`
   - Hover: lift 1px + slight border darken.

3. **Dictate hint pill** — small pill with a subtle border. Contents:
   - Tiny round black "N" badge
   - `New`
   - `·`
   - `Hold [Ctrl+D] to dictate` — `Ctrl+D` rendered as a small `<kbd>` with border

4. **Persona row** — horizontal pill row, 4 tabs separated by 1px hairline dividers:
   - Searchers / Advisors / Brokers / Owners
   - No tab active by default on this page
   - On hover of a pill: that pill fills with accent (`#0A0A0B`, white text)
   - Clicking navigates to `/journey?p=<persona>`

5. **Currently viewing pill** — small rounded pill with subtle border:
   - `Currently viewing: Overview` (default)
   - When a persona is hovered: `Currently viewing: Searcher Workflow` (etc.)

6. **Subheadline** (Sora 700, clamp(22px, 2.2vw, 30px), max-width 680px):
   > 90% of what an investment bank does. _Everything that doesn't require a license._
   
   (Second sentence in muted text.)

7. **Three feature cards** — 3-column grid, gap 12px, max-width 720px. Each card:
   - 14px radius, 1px border, white fill
   - 34px square icon badge (radius 9, surface-subtle fill, subtle border, centered monochrome line icon)
   - Title in Sora 700, 14.5px
   - Body in Inter 12.5px, muted color, line-height 1.5
   - Three cards:
     1. **Sourcing Thesis** — icon: magnifying glass. Body: "Yulia builds your buyer criteria from a conversation and scores every inbound teaser against it."
     2. **Define the deal direction** — icon: line chart trending up. Body: "Three paths, not one recommendation. Tradeoffs priced in price, structure, tax, timing."
     3. **SBA Modeling** — icon: stacked horizontal lines. Body: "SOP 50 10 8 compliance baked in: 10% injection sources, two-year standby notes, partial stock."

8. **Tertiary CTA** — small pill button, ghost style (transparent bg, border): `How Yulia works →` — links to /how-it-works

### Right column — Pattern Rail

Vertical sequence of 4 stages, connected by a faint 1px vertical line running down the middle of the numbered badges. Each row is a 3-column mini-grid: `60px (number badge) / 1.1fr (label + desc) / 1.6fr (mini output preview)`, gap 18px, 28px between rows.

**Row 1 — 01 / ANALYSIS**
- Badge: 48px circle, white fill, 1px border, "01" in Sora 600, muted color
- Label: `ANALYSIS` (Sora 700, 12px, letter-spacing 0.14em) + subtitle "Yulia reads the docs, runs the numbers." (Inter 13.5, muted)
- Preview card (14px radius, 1px border, 96px min-height): title "Adjusted EBITDA Bridge (TTM)" and a 7-bar monochrome chart (bars at 42%, 52%, 58%, 48%, 64%, 72%, 68%) with labels "Reported / +Addbacks / Adjusted" beneath.

**Row 2 — 02 / OPTIONS**
- Label: "Three paths. Not one recommendation."
- Preview: title "Three paths", 3 rows of table:
  - Quick cash · 3.2x · 86% cash
  - Mid-market · 3.8x · 70% cash (highlighted row, subtle fill + 1px border)
  - Strategic · 4.5x · 55% cash

**Row 3 — 03 / IMPLICATIONS**
- Label: "Price. Structure. Timing."
- Preview: title "Mid-market path · implications", 4-row table (k/v with hairline borders between rows):
  - Price: $4.2M
  - Structure: Asset sale
  - Timing: 5–8 mo
  - Tax basis: Capital gain

**Row 4 — 04 / YOU DECIDE**
- Label: "Every time. You review, adjust, send."
- Preview: "Drafted counter · ready to review" + a small quote-like message snippet ("Thanks for the offer. The $3.8M number undervalues the installed base…") + a tiny "Send" button on the right (accent fill).

---

## Page 2: Journey (`/journey`)

Single-column left-aligned content, max-width 1200px. Persona pill tabs at the top (the same 4: Searchers/Advisors/Brokers/Owners), default active is **Searcher**. URL updates to `?p=<persona>`.

### Layout (vertical sections, each separated by ~72px)

1. **Persona pill bar** (inline row of 4 tabs, padded by 4px inside a 999-radius surface-subtle container with 1px border). Active tab: accent fill, white text. Inactive: transparent, muted text.

2. **Eyebrow** (Sora 700, 11px, 0.14em tracking, uppercase, subtle color). Example (searcher): `SEARCHERS · ETA · FIRST-TIME ACQUIRERS`

3. **Headline** (Sora 800, clamp(36px, 4vw, 56px), max-width 820px). Example: `Stop reading 100 CIMs to find 3.`

4. **Subhead** (Inter 18px, muted, max-width 680px).

5. **Sample chip row** — 3 rounded pill buttons with white fill, 1px border. Hover: lift 1px + border darken. Clicking pre-fills the chat on the left. Example chips for searcher: "Screen this teaser" / "Run QoE Lite" / "Model SBA for $4M EBITDA"

6. **Pain section** — section label `THE PROBLEM` + body paragraph (Inter 16px, line-height 1.6, muted, max-width 720px).

7. **"What Yulia does" — 4 capability cards** in a 2x2 grid (gap 12px, each card 14px radius, 1px border, white fill, 22–24px padding). Title in Sora 700, 16px. Body in Inter 13.5px, muted, line-height 1.5.

8. **Demo band** — a horizontal surface-subtle card with title "Try it on your own deal" on the left + description "Paste real numbers. Yulia streams the answer into the chat on the left." + a prominent pill button "Run the demo →" on the right (accent fill).

9. **Lifecycle strip** — 5-column grid (varies per persona), each cell a small card (12px radius, 1px border, white fill, 18px padding, ~120px min-height): two-digit number (01, 02, …), stage name (Sora 700, 14px), body (Inter 12px, muted).

10. **Pricing pointer card** — wide surface-subtle card with 1px border, 14px radius, containing a single paragraph that starts with bold "Pricing:" and then a one-liner pointing at Free / Solo / Pro / Team tiers.

### Per-persona content

**Searcher (default):**
- Eyebrow: SEARCHERS · ETA · FIRST-TIME ACQUIRERS
- Headline: "Stop reading 100 CIMs to find 3."
- 4 capabilities: 90-second teaser screen · QoE Lite pre-LOI · SOP 50 10 8 structures · NDA to LOI in 14 days
- Lifecycle: Raise → Search → Screen → Buy → Operate

**Advisor:**
- Eyebrow: M&A ADVISORS · BANKERS · IBAs
- Headline: "Your client's CIM. First draft. By Friday."
- 4 capabilities: CIM drafted in under an hour · Buyer tree from public filings · Win one more bake-off per quarter · Diligence across five parties
- Lifecycle: Pitch → CIM → Buyer tree → Diligence → Close

**Broker:**
- Eyebrow: BUSINESS BROKERS · IBBA · STATE ASSOCIATIONS
- Headline: "Recast, valuation, marketing package — by lunch."
- 4 capabilities: Recast & valuation · Marketing package · The Baseline pitch tool · Buyer qualification
- Lifecycle: Pitch → Engage → Market → Qualify → Close

**Owner:**
- Eyebrow: BUSINESS OWNERS
- Headline: "What's your business worth? Find out for free."
- 4 capabilities: The Baseline (free) · Exit options analysis · Broker comparison · Counter-offer drafting
- Lifecycle: Baseline → Options → Prepare → Review → Close

---

## Page 3: How it works (`/how-it-works`)

Single-column content, max-width 1100px, left-aligned. Long-form, section-by-section.

### Sections (top to bottom, ~96px gaps)

1. **Hero**
   - Headline (Sora 800, clamp(36px, 4vw, 56px), max-width 780px): `Analysis. Options. Implications.` with the next line `You decide.` in muted color.
   - Subhead (Inter 18px, muted, max-width 640px): "Yulia is the deal team you hire — analyst, associate, VP. She doesn't negotiate for you, hold funds, or take a success fee. That restraint is the product."

2. **The Pattern** — section label `THE PATTERN` then a 4-column grid of cards (gap 16, each card 14px radius, 1px border, white fill, 24px padding, ~180px min-height). Each card:
   - Two-digit number in subtle color (Sora 700, 11px, 0.14em tracking)
   - Stage name (Sora 700, 15px, 0.08em tracking)
   - Description (Inter 13, muted, line-height 1.5)
   Four stages: 01 ANALYSIS, 02 OPTIONS, 03 IMPLICATIONS, 04 YOU DECIDE.

3. **What Yulia will NOT do** — section label, then a responsive grid of 5 cards (auto-fit, minmax(280px, 1fr), gap 12). Each card: surface-subtle fill (not white), 12px radius, subtle border, 20-22px padding. Title (Sora 700, 14.5) + body (Inter 13, muted):
   - She will not negotiate on your behalf.
   - She will not hold funds.
   - She will not charge a success fee.
   - She will not represent you as a fiduciary.
   - She will not guarantee an outcome.

4. **A real redacted example** — section label, then a single wide card (14px radius, 1px border, white fill) containing:
   - A horizontal 3-tab strip at the top (`The question / Yulia's analysis / The decision`) — the active tab has canvas-white fill, inactive tabs have surface-subtle fill
   - Below the strip, a content area (28px padding) with prose text in Inter 14, line-height 1.65, muted color.

5. **Why the restraint is the positioning** — a surface-subtle card (40px padding, 16px radius, subtle border), containing just a section label and a single large paragraph (Sora 600, 22–26px, line-height 1.4, max-width 840px).

6. **Pricing** (anchor `#pricing`) — section label, big headline "Priced against building it yourself.", supporting paragraph, then:
   - **5 tier cards** in a responsive grid (auto-fit, minmax(200px, 1fr), gap 12). Each card (22px padding, 14px radius, 1px border): Name + sub + price (Sora 800, 22px) + list of key specs (Seats / Active deals / Deliverables / Post-close / Team / SSO+SOC2).
   - The **Pro** tier has a "MOST POPULAR" badge attached to the card top-left (accent fill, tiny caps), a slightly heavier border, and a barely-there surface-subtle fill.
   - Tiers: Free · Solo ($79/mo) · Pro ($199/mo, POPULAR) · Team ($499/mo) · Enterprise (From $2,500/mo)

7. **The rules** — a surface-subtle card with section label + 6 bullet points. Each bullet has a tiny dot marker in muted color.

8. **Start free** — a prominent pill button in accent fill, sized ~14px vertical padding, 28px horizontal, 999px radius.

9. **FAQ** — section label, then a single card (14px radius, 1px border, white fill) containing 7 accordion rows. Each row: a 100%-width button with `question` on the left + chevron on the right. When expanded, reveals the answer in smaller body text inside the same row.

10. **Enterprise** (anchor `#enterprise`) — section label, big headline "The enterprise stack. Without the six-figure install.", supporting paragraph, 4 bulleted inclusions (each bullet has a small 6px filled circle marker in accent color), then a **ghost button** "Book a scoping call →" (transparent fill, 1.5px border in text-primary color, 999px radius).

---

## Interaction Rules

- **Chat column never scrolls with the canvas.** Independent scroll.
- **Clicking sample chips on any page** pre-fills the chat composer.
- **Hero chat pill on Home** focuses the real chat in the left column on click.
- **Persona pills on Home** navigate to `/journey?p=<persona>`.
- **Persona pills on Journey** swap content in place (URL query updates without page reload).
- **Tab switches** in the Dia strip animate gently (spring fade + 8px translateY on enter).
- **All transitions** use transform + opacity only. Hover states use exponential ease-out. Press states scale to `0.97`.

## What to avoid

- No pink, no terra cotta, no gradients in chrome
- No glassmorphism / blur effects
- No stock-photo 3D icons or clip art
- No "sign up" button anywhere in chrome
- No timid evenly-distributed spacing — use rhythm (varied gaps per group)
- No cards-within-cards or decorative borders
- No italic type

## What to prefer

- Warm off-whites over cool greys
- Plenty of whitespace
- Minimal line icons (stroke 1.5–1.8)
- Rounded tops on tabs, 999px on chat pills
- Subtle shadows (`0 1px 2px rgba(60,55,45,0.04)`)
- Monochrome throughout
- Editorial type rhythm
- Asymmetric 2-column layout on Home

---

Generate 3 desktop screens (1440px wide):

1. **Home** — matching the left/right split above
2. **Journey — Searcher** — persona active with full content
3. **How it works** — scrollable long page

Once generated, please include the Tailwind + React export so the code can be read back into the project.
