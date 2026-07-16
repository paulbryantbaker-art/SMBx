# Handoff: smbX.ai Marketing Site (Landing + Industries)

## Overview
Two-page marketing site for **smbX** — a buy-side-only corporate development advisory for acquirers of private companies under $250M revenue. Pages:
1. **Landing page** — chat-engine hero, dark proof band, Why us, How it works (7 phases), Sample read, Who it's for, Industries teaser, "Whose side" band, booking CTA, footer.
2. **Industries (Sectors) page** — 12 sector theses + a "Heritage" block, plus CTA and footer.

## About the Design Files
The files in this bundle are **design references created in HTML** — high-fidelity prototypes showing intended look and behavior, **not production code to ship directly**. The task is to **recreate these designs in your target stack** (Next.js/React, Astro, plain HTML — your choice; if no codebase exists, pick what fits a small static marketing site with light interactivity). The two `.dc.html` files use a proprietary component runtime (`support.js`, `ds-base.js`, `{{ }}` template holes, `<sc-for>`/`<sc-if>` tags) — **ignore the runtime**; read them as: the markup between `<x-dc>…</x-dc>` is the page, the `class Component` script at the bottom is the interactive behavior (plain React-class-style logic you can port directly), and `pd.css` contains 100% of the styling.

## Fidelity
**High-fidelity.** Colors, type scale, spacing, copy, and interactions are final. Recreate pixel-perfectly. All styling lives in `assets/pd.css` (heavily commented — the comments record design decisions and are worth reading). Copy text in the HTML files is final and approved — do not rewrite.

## Design Tokens (from `pd.css`, scoped to `.pd` root)
Colors:
- Ink `#222222` · Body `#6A6A6A` · Tertiary `#9A9A9A` · Faint `#BBBBBB`
- Card `#F7F7F7` · Border `#DDDDDD` · Hairline `#EBEBEB`
- Coral `#FF385C` · Coral link `#E61E4D` · CTA `#E61E4D` (hover `#D70466`)
- Page base: warm white `#FFFDFC` (never pure white)
- Dark bands: `#141414` (top `#151312`, bottom `#131313`) with `blackbleed.webp` texture
- Footer: flat warm charcoal `#2B2A27` (deliberately NOT the textured dark band)
- Dark-band text: all-white remaps (`--pd-ink:#FFF`, body `#F4F4F4`, tert `#E6E6E6`); links on dark = `#FFB3BF`; accent stat on dark = `#FF8298`

Typography:
- Display/body: **Schibsted Grotesk** (400–800), Google Fonts
- Mono (labels, meta): **IBM Plex Mono** (400–600)
- H1 hero (centered landing): clamp(42px, 5.2vw, 68px), weight 800, ls -0.03em, lh 1.04
- H2 section: clamp(38px, 4.8vw, 62px), 800, ls -0.03em, lh 1.04, `text-wrap: pretty`, max-width 24em
- Section eyebrow (`.pd-seclabel`): 17px/800, uppercase, ls 0.04em, coral `#E61E4D`
- Lede (`.pd-sub`): 22px/1.55, body gray, max 34em
- Body (`.pd-body`): 18px/1.7, max 44em · Small: 15px · Caption: 13.5px
- Mono labels: 13–13.5px, ls 0.09em, uppercase

Layout — **two-width system (hard rule)**:
- Section rail `--pd-max: 1360px`; centered artifacts (cards, accordion, chat) `--pd-mid: 1040px`. No other section widths.
- Side padding `--pd-pad-x: clamp(28px, 4.5vw, 64px)`
- Section top padding: clamp(130px, 15vw, 220px)

Radii: pills 99px · cards 24px · map/report card 14px · desk cards 16px · dealcards 10px.

## Signature Visual Devices (recreate faithfully)
1. **Ambient coral wash** — one absolute z-index:-1 layer inside the isolated `.pd` root with 6 distributed no-repeat radial gradients (all alpha ≤ 0.050, coral→rose→peach). See `.pd-ambient`. PERF: never promote it (no transform/filter/will-change), never `position:fixed`.
2. **Dark "swoosh" bands** (`.pd-dark`) — near-black textured bands (blackbleed.webp) whose curved top/bottom edges are cut with a CSS `mask` (two SVG curve masks + a stretching middle fill; curve height `--pd-curve: clamp(52px, 6vw, 112px)`). Content padding clears the curves via `.pd-dark-pad`. Corner "spark" dots optional per band (`.pd-spark`).
3. **Hero mesh** (`.pd-heromesh`) — CSS dot-matrix (24px ink micro-grid + 96px sparse coral dots), radially masked to bloom behind the chat input. Pure CSS, static.
4. **Section accent blooms** (`.pd-accent.al` / `.ar`) — quarter-ellipse coral radials entering from off-canvas left/right, vertically mask-faded.
5. **Scroll-reveal** — every section: `[data-rv]` fades/rises in once via IntersectionObserver (threshold 0.12, translate 24px→0, ~520–640ms); `.rv-stagger` cascades children at 70ms steps. Killed under `prefers-reduced-motion`. Important detail: re-scan on DOM mutation, and elements already above the viewport reveal immediately (see the `_rvScan` logic in the DC scripts).
6. **Stat count-up** — proof-band numbers roll up (1300ms, cubic ease-out) when the band enters view; preserves prefix/suffix text; skipped under reduced motion.

## Screens / Views

### 1. Landing page (`LandingPage.dc.html`)
Section order: sticky nav → hero (chat engine) → dark proof band → Why us (#why) → How it works (#how) → Sample read (#sample) → Who it's for (#who) → Key industry verticals (#sectors) → dark "Whose side" band → CTA (#cta) → footer. Plus a fixed bottom-right sticky CTA pill ("Build your market map") that slides in after scrolling past ~0.9 viewport heights.

**Nav** (sticky, z-50): white 92% + blur(12px); logo left (44px高), links (Why us · How it works · Industries · Who it's for), two pills right (outline "Confidential consultation" + primary "Build your market map"). On scroll >40px it condenses (`.min`): padding 9px, logo 30px, soft shadow. Links/`pd-nav-book` hidden ≤760px.

**Hero** — centered, fills first viewport minus nav minus curve height (so the dark band's swoosh crest is visible at the fold; on mobile ≤760px full fold, no peek). H1: "We'll build and run your business acquisition strategy tailored to your goals." Sub: "Institutional-grade corporate development, on demand." Below: the **chat engine** —
- Resting state: one large pill input bar ("Sector & Strategy — …") with Continue button + 5 suggestion chips (Fire & life safety, Elevator service, NDT & inspection, Environmental services, MRO distribution). Max width 780px.
- On send (desktop >900px): bar swaps for a conversation card (white, radius 24, big shadow) titled "Acquisition Engine". Scripted 2-step demo: turn 1 → assistant asks size band/geography (1100ms "Reading your idea…" working state); turn 2 → shows a **Preliminary Read** report card (HVAC Southeast: funnel ~3,100 → ~220 → ~60, "what most buyers miss" insight, "Book the walkthrough" button).
- Mobile ≤900px: bar stays in page as doorway; chat is a fixed bottom sheet (92dvh, slides up, scrim, grab handle, keyboard-height aware via visualViewport → `--pd-kb`).
- Meta row below: "Or book a call instead · See a sample read →".

**Proof band** (dark, curved): eyebrow "TWO DECADES ON THE BUY SIDE"; 4 stats — 150+ Acquisitions closed · $5B+ Enterprise value added · ~$21B Transactions touched · **0** Sell-side engagements. Ever. (the 0 in coral `#FF8298`). Count-up on enter.

**Why us**: 3×2 hairline-grid of `<details>` cards, each: coral index (01–06), title, summary body, "+ THE EVIDENCE" expander with 2 paragraphs. Titles: An acquisition machine, not a broker / A target universe in days, not weeks / Off-market deals, at better prices / Senior-only. No junior hand-off. / Buy-side only. One client per target. / A fraction of the cost of in-house. Closing line + link "See how the machine runs →".

**How it works**: vertical accordion of 7 `<details>` phases (number, mono phase label, one-line summary, +/− toggle circle): 01 Thesis · 02 Sourcing · 03 Evaluation · 04 Structure & offer · 05 Diligence & close · 06 Integration · 07 Value creation (add-on service). Closing block ends with primary pill "Bring us your idea →" (links to #yulia, the chat).

**Sample read**: the flagship artifact — a 760px white report card (`.pd-map`): head (logo + "SAMPLE READ"), title "Commercial Landscaping — Southeast", mono thesis line, horizontal funnel (~2,400 → ~180 → ~55), giant coral **9** with caption, "WHAT SEPARATES THE 9" (3 numbered screens: route density / contract tenure / crew that stays), gray insight block, near-black "THE NUMBER" block ($6–8M), coral-rule verdict block, footer with "Run yours →".

**Who it's for**: interactive index — left column of 5 giant names (faint→ink when active, coral arrow), right sticky panel with the active segment's blurb + tailored link. Data in the DC script (`whoData`): Family offices / Independent sponsors / Search funds & solo acquirers / Operators & strategics / PE firms. Mobile: names only, panel hidden.

**Key industry verticals**: 12 two-column hairline rows (name + one-line thesis), each linking to the Industries page, then "Read the full sector theses →".

**Whose side band** (dark, curved): asymmetric grid — pull-quote "The seller has a broker. Who is working for you?" left; body + two pills right ("Build your market map →" primary, "Book a call" white-outline).

**CTA**: two columns — H2 "Start with a confidential conversation." + body left; gray booking card right ("Book 30 minutes", supporting copy, mono "30 MIN · VIDEO CALL · CONFIDENTIAL", primary pill "Pick a time →" linking to **https://calendar.app.google/rA9vC7RRdR2wLJbV6** (opens new tab), caption "Scheduling opens in Google Calendar. No lists sold, no sellers represented."). No form fields — booking link only.

**Footer**: flat charcoal `#2B2A27`; logo (inverted via filter), firm blurb, FIRM + BUYERS link columns, WHERE WE WORK ("Nationwide, from Dallas–Fort Worth, Texas."), full legal disclosure paragraph, legal line "© 2026 smbX. Buy-side only, by design. · Terms · Privacy · Disclosures".

### 2. Industries page (`SectorsPage.dc.html`)
Same nav (logo links home; Industries active) and footer (shortened). Hero: eyebrow "Key industry verticals", H2 "Buy-side M&A for acquirers of private companies under $250M in revenue.", lede re retainer+success fee. Then 12 `.pd-sector` blocks — each: 1.5px ink top rule, big name, zig-zag split (7/5 columns, alternating), left "know" column (bold lead ending in a coral full stop + 1–2 body paragraphs, optional tag pills), right aside (coral-rule "Who we run it for" + near-black "Why this lane" card). Sectors in order: Fire & life safety / Elevator & escalator service / Power & grid infrastructure services / Building automation & critical power / TIC-NDT / Environmental & industrial cleaning / Water & wastewater contract O&M / Specialty & MRO distribution / Machine shops & precision manufacturing / Food contract manufacturing & co-packing / Non-emergency medical transport / RCM & medical billing. Then the **Heritage** block (Home & commercial services) styled apart: gray card, no rule, first-person copy, attribution line "Selected transactions led or co-led in the course of employment at Wrench Group and JPMorgan Chase." Closing CTA section + footer.

**Copy guardrail**: no directional market numbers (entity counts, penetration %, multiples) on these pages — only named regulations (NFPA 25/72, RCRA, AS9100, ISO 13485). Keep it that way.

## Interactions & Behavior (summary — full logic in the DC scripts)
- Nav condense: scroll > 40px → `.min` class.
- Sticky CTA: scroll > 0.9 × innerHeight → slide in.
- Scroll reveal + count-up: as described under Signature Devices.
- Chat engine: state machine in `LandingPage` script (`send()`, `_step`, scripted responses); `#yulia` anchor targets the chat zone.
- Who-it's-for selector: click name → swap panel body/link (no navigation).
- Accordions: native `<details>`/`<summary>`, markers hidden, animated +/− toggles.
- All transitions: transform/opacity only; everything honors `prefers-reduced-motion`.
- Focus: global `:focus-visible` 2px ink outline (white on dark); chat inputs excluded (their container carries focus state via `:focus-within`).

## State Management
Landing: `{ navMin, sticky, engaged, open, draft, turns[], working, workingText, showMap, who }`. Sectors: `{ navMin }`. No data fetching; the chat demo is scripted. The booking CTA is a plain external link (a Calendly/Google-Calendar embed may replace it later — keep the section layout).

## Assets (in `assets/`)
- `logo-coral-x.png` — smbX.ai wordmark (coral X). Used in nav (44px), chat head (28px), report cards (22px), footer (40px, inverted white via `filter: brightness(0) invert(1)`).
- `blackbleed.webp` — slate/plaster texture for dark bands (background-image, cover).
- `pd.css` — the complete stylesheet (1311 lines, all components + responsive rules + rationale comments).
- Fonts via Google Fonts: Schibsted Grotesk 400–800, IBM Plex Mono 400–600.

## Files
- `LandingPage.dc.html` — landing page markup + behavior script
- `SectorsPage.dc.html` — industries page markup + behavior script
- `assets/pd.css`, `assets/logo-coral-x.png`, `assets/blackbleed.webp`

Cross-page links in the prototypes use relative `.dc.html` paths — map them to real routes (`/` and `/industries`). In-page anchors: #why, #how, #sample, #who, #sectors, #cta, #yulia (chat), #proof.
