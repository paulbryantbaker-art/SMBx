# smbx.ai — Design Language
## The current visual system. Authoritative as of 2026-04-15.
## This document supersedes `STYLE_GUIDE.md` for the visual system.
## `STYLE_GUIDE.md` remains authoritative for logo rules, brand voice, and copy patterns.

---

## Purpose

This doc encodes the visual language shipped to the smbx.ai website during the April 14 redesign commits (pricing page redesign → journey pages redesign → motion pass → cinematic anchors → landing→chat morph). It is written so that another Claude Code (or any designer) can build **documents, posts, LinkedIn carousels, decks, and marketing collateral that look like the website** — not a color/font bolted onto a template.

The site is designed for an M&A deal-intelligence audience (owners selling, buyers acquiring, advisors running mandates, PE funds screening). The language must read as **confident, considered, document-like** — not SaaS-glossy, not AI-slop, not over-animated. Premium restraint with a single saturated accent.

Everything below is the current code state in `client/src/components/content/tokens.ts`, `storyBlocks.tsx`, `DealCostMap.tsx`, `DealCalculator.tsx`, and `MobileJourneyStory.tsx`. When in doubt, the code is the truth; this doc is the narration.

---

## 1. Palette

### Accent — single brand color, two theme values, rare usage

| Role | Hex | Use |
|---|---|---|
| Pink (light mode) | `#D44A78` | Eyebrows, key metrics, interactive accents, focus rings |
| Pink (dark mode) | `#E8709A` | Same, slightly lighter for dark backgrounds |
| Pink (hover/pressed) | `#B03860` | Button active state |

Pink is **punctuation, not wallpaper**. It appears on eyebrow labels, the single most important number in a section, the primary CTA fill, and active-state treatments. It does not fill backgrounds, it does not tint headlines, it does not appear in multiple places per section. If a layout has three pink things visible at once, one is wrong.

### Journey accents — per-page override

Some journey pages override the brand pink with a journey-specific accent so the eye can tell surfaces apart when viewed in sequence.

| Journey | Light | Dark |
|---|---|---|
| /sell | `#D44A78` | `#E8709A` (= brand pink) |
| /buy | `#3E8E8E` teal | `#52A8A8` |
| /raise | `#C99A3E` gold | `#DDB25E` |
| /pmi (integrate) | `#8F4A7A` plum | `#AE6D9A` |
| /advisors | `#D44A78` | `#E8709A` |
| /how, /pricing | `#D44A78` | `#E8709A` |

For LinkedIn: if a post or carousel is about a specific journey, use that journey's accent. Otherwise default to brand pink.

### Neutrals — warm enough to feel human, cool enough not to compete with pink

**Light mode**
| Role | Hex |
|---|---|
| Ink (strongest text, headlines) | `#0f1012` |
| Ink soft (alt text, card bg dark variant) | `#1a1c1e` |
| Body text | `#3c3d40` |
| Muted text (captions, meta) | `#6e6a63` |
| Hairline border | `rgba(15,16,18,0.08)` |
| Internal rule | `rgba(15,16,18,0.06)` |
| Page background | `#F9F9FC` |
| Card background | `#ffffff` |
| Alt section background | `#f4f4f7` |

**Dark mode**
| Role | Hex |
|---|---|
| Page bg | `#1A1C1E` |
| Card bg | `#1a1c1e` (same as page — flat) |
| Alt section bg | `#151617` |
| Immersive bg (CTA, cinematic anchors) | `#0f1012` |
| Body text | `rgba(218,218,220,0.85)` |
| Muted text | `rgba(218,218,220,0.55)` |
| Hairline border | `rgba(255,255,255,0.08)` |

---

## 2. Typography

Two fonts. Strong contrast.

### `Sora` — display
Weight `800–900`. Tight tracking. Editorial compression. Headlines only.

### `Inter` — body, labels, UI
Weight `400–600`. Comfortable leading. Everything that is not a headline.

Never mix in a third font. Never use weight 700 on either (both have it; neither needs it — 600 Inter and 800 Sora are the correct "bold" moves).

### Type scale — copy/paste these exact values

**Hook headline** (first thing on a page, the "money question")
```
font-family: Sora;
font-weight: 900;
font-size: clamp(2.5rem, 7vw, 5.75rem);
line-height: 0.92;
letter-spacing: -0.04em;
color: ink (#0f1012) or #f9f9fc on dark
```

**Section headline** (one per section, below an eyebrow)
```
font-family: Sora;
font-weight: 900;
font-size: clamp(2rem, 4.5vw, 3.5rem);
line-height: 1;
letter-spacing: -0.025em;
```

**Card headline** (product tile, tier card, calculator anchor)
```
font-family: Sora;
font-weight: 900;
font-size: 1.75rem;
line-height: 1;
letter-spacing: -0.02em;
```

**Hook body** (the sub under the hook headline)
```
font-family: Inter;
font-size: clamp(17px, 2vw, 21px);
line-height: 1.55;
font-weight: 400;
color: body (#3c3d40)
```

**Section body**
```
font-family: Inter;
font-size: clamp(16px, 1.5vw, 19px);
line-height: 1.55;
```

**Body (mobile-safe)**
```
font-family: Inter;
font-size: clamp(14px, 3.6vw, 16px);
line-height: 1.5;
```

**Caption / footnote**
```
font-family: Inter;
font-size: 13px;
line-height: 1.5;
color: muted
```

### Eyebrow variants — this is the signature detail

There are **two** eyebrow styles. Use them deliberately.

**HookEyebrow** — opens a page
- 11px Inter, weight 700, uppercase, `letter-spacing: 0.2em`
- Accent-colored (pink or journey accent)
- Preceded by a 6×6px filled dot in the same accent color
- Pattern: `● SMBX.AI · FASTER, EASIER M&A · PRICING`
- Use at the top of a page, once.

**SectionEyebrow** — opens a section inside a page
- 11px Inter, weight 600 (semi-bold), uppercase, `letter-spacing: 0.08em`
- No dot
- Accent-colored but slightly quieter
- Pattern: `THE MATH` or `STEP 2 · BASELINE`
- Use per section.

If every label on a page uses the `0.20em+dot` treatment, the page reads as a repeating slogan. The two-variant system is what makes the page read as a document instead.

---

## 3. Spacing & Radii

### Spacing
- Section vertical padding: `clamp(48px, 8vw, 96px)` (bands) or `mb-28` (sections inside a container)
- Card inner padding: `clamp(20px, 3vw, 32px)`
- Max content width: `1152px` (wide) or `896px` (prose)

### Radii
- `sm: 8px` (chips, small pills)
- `md: 14px` (most cards)
- `lg: 20px` (larger cards, CTA blocks)
- `xl: 28px` (hero CTAs)
- `full: 9999px` (pills, buttons)

Rounded corners throughout. The system uses `14px` as the default card radius — sharper than the `24px`+ common in "friendly" SaaS, softer than the `0–8px` brutalist look. Gives the work an editorial-but-modern feel.

---

## 4. Motion

### Timing
- Spring ease: `[0.22, 1, 0.36, 1]` (cubic-bezier)
- Fast: `180ms` — hover/focus states, toggles
- Base: `300ms` — section reveals, view transitions
- Slow: `600ms` — hero staggers

### Scroll-reveal variants
Every section on a journey page fades up into view as the user scrolls.

```
section reveal:
  initial: opacity 0, y: 16
  whileInView: opacity 1, y: 0
  viewport: once, margin -10%
  transition: 0.5s spring

mobile section reveal (shorter y for small viewports):
  initial: opacity 0, y: 10
  whileInView: opacity 1, y: 0
  viewport: once, margin -5%
  transition: 0.45s spring

stagger container (children reveal in sequence):
  stagger children 0.08s, delay 0.05s

item inside stagger:
  initial: opacity 0, y: 12
  animate: opacity 1, y: 0, 0.45s spring
```

**For a document version**: sections that "arrive" via staggered entry — pull quotes that fade up, stat strips that reveal one at a time — mirror the site's rhythm. A static doc can't animate; use whitespace and left-rule indents to signal the same pacing.

### The morph
Landing → chat transition on the site uses a coordinated choreography:
1. Sidebar sections swap with `AnimatePresence` — 220ms spring, ±6px y.
2. Landing wrapper plays a premium morph-out: opacity, scale `0.985`, translateY `-10px`, 2px blur.
3. Chat view fades in with upward drift, 300ms spring.

For docs: this translates to **deliberate section breaks** — a full-bleed divider, a page break, a full-width pull-quote that signals "we're moving from browsing to working."

### prefers-reduced-motion
All motion is suppressed under `prefers-reduced-motion: reduce`. Documents don't need this, but *noise-sensitive readers exist* — don't overload printed PDFs with heavy animations in derivative video versions.

---

## 5. Materials

### Apple Glass (mobile sticky chrome, eyebrow pills, home tools popup)
```
background: rgba(255,255,255,0.72) (light) | rgba(20,22,24,0.72) (dark)
backdrop-filter: blur(14px) saturate(180%)
-webkit-backdrop-filter: blur(14px) saturate(180%)
border: 1px solid hairline
```

Used for floating chrome over scrolling content (sticky CTAs, dropdowns). Android falls back to the flat rgba.

For docs: **translucent overlay effects in Figma or Keynote** are the print analogue. A 72% white tile with a hairline reads as "glass" even without backdrop-blur.

### Ring-accent CTA (no blurred halo)
The PageCTA block at the bottom of each journey page.

```
background: immersive (#0f1012)
border: 1px solid accent@55%
boxShadow:
  inset 0 0 0 1px accent@18%,
  0 24px 48px -24px rgba(0,0,0,0.45)
```

Thin accent ring. Inner accent hairline. Soft outer drop shadow. No radial-gradient blur behind the content. Framer-inspired. This is the anti-Canva move.

### Light card on dark stage (cinematic anchors)
The `DealCostMap` on /pricing and `DealCalculator` on /buy sit inside immersive-dark SectionBands. Both cards use:

```
background: #ffffff
border: 1px solid rgba(15,16,18,0.08)
boxShadow: 0 24px 60px -24px rgba(0,0,0,0.45)
```

Inner sub-cards are warm off-white `#f6f5f2`. Text is ink. One saturated accent column (pink on pricing, teal on buy) fills the payoff tile.

This is Apple's signature — a white sheet floating on a dark stage. **For LinkedIn carousels**: it's the single most transferable pattern. Dark background slides with a centered light content card read as premium. Light slides with black hero metrics read as ordinary.

---

## 6. Editorial Primitives (the site's vocabulary)

The journey pages are composed from a fixed set of reusable blocks. A derivative document should use the same vocabulary.

### HookHeader
- HookEyebrow (accent, 0.2em + dot)
- Giant headline (Sora 900, clamp)
- Sub paragraph (Inter, max-w-2xl, body color)
- Used once per page, at the top.

### SectionBand
Full-bleed background wrapper with three tones:
- `info` — default, matches page bg
- `alt` — subtle gray tint, signals "this is different"
- `immersive` — deep black, cinematic — used once per page, for the anchor interactive or the CTA

### SectionHeader
- SectionEyebrow (accent, 0.08em, no dot)
- Section headline (Sora 900, clamp)
- Optional sub paragraph

### StoryBlock
Named protagonist with an editorial layout — "Sarah V. · Partner, boutique M&A advisory" on a left rail, running prose on the right, 3-KPI strip below. The KPI strip ends with the accent-colored metric ("$2.7M fee"). Never a testimonial card grid. Always one story at a time.

### SlowVsFast
Asymmetric two-column contrast. "The way it's been" on the left in strikethrough + opacity 50%. "With Yulia" on the right in full bold. One vertical rule between. Takeaway sentence below in medium weight.

### SignOffChain
Five numbered steps (Draft → Route → Wait → Execute → Log) as a horizontal timeline on desktop, vertical on mobile. Each step has a Yulia action + a "chain detail" line explaining what's happening in the system.

### BrandedTermCard
Definition tile for a trademarked term (Baseline™, Blind Equity™, Rundown™). Eyebrow "smbx.ai product" + giant term + trademark glyph + one-liner + definition + example + inline CTA. Not a card in a grid — always paired or standalone.

### JargonTerm
Inline tooltip wrapping a trademarked term in prose. Dashed underline affordance. Hover/focus reveals the definition. For first-time encounters.

### PageCTA
Bottom-of-page CTA. Ring-accent style (no blur halo). Sora 900 headline, Inter sub, pill button filled with the page's accent. "Free · No account required · Your data stays yours" tagline in muted white.

### Cinematic anchor pattern
Once per journey page, one interactive is wrapped in `<SectionBand tone="immersive">` — it becomes the visual anchor:
- /sell → MultipleMap
- /buy → DealCalculator (4 sliders → IRR spread)
- /raise → StackBuilder
- /how → LiveClassifier
- /integrate → Day180Calendar
- /advisors → CapacitySlider
- /pricing → DealCostMap (3-way cost comparison)

The interactive is a **light card on the dark stage** (see Materials).

---

## 7. Anti-Slop Rules

The things *not* to do. These are the tells of AI-generated work. Avoid them all.

1. **No gradient headlines.** No `background-clip: text` pink-to-purple. Solid ink or solid white only.
2. **No radial-gradient blur halos behind content.** The "soft pink glow" under a hero CTA is the #1 AI-slop tell. Use a ring accent or hairline instead.
3. **No glassmorphism on desktop cards.** Apple Glass is reserved for floating mobile chrome (sticky CTAs, eyebrow pills, dropdowns). Desktop cards are flat with hairlines.
4. **No identical-shadow card grids.** Three cards with the same `shadow-lg` is a SaaS template. Either no shadow (editorial hairline) or one featured card with elevation.
5. **No Material Symbols everywhere.** Use inline SVG for checkmarks, arrows, chevrons. Material Symbols are fine for functional utility icons (nav, status) but look lazy as decoration.
6. **Eyebrow tracking ≤ 0.08em for sections, 0.2em only for the hook.** `letter-spacing: 0.24em` uppercase labels repeated 8 times on a page is the SaaS-template look.
7. **One accent per section, maximum.** If pink appears on the eyebrow, the headline, the CTA, and a stat all in the same section — delete three of them.
8. **Never fill backgrounds with accent color.** Accent fills one CTA button, one stat number, one emphasis word. Not a whole section tint.
9. **No AI-gen corporate photography, no stock illustrations with purple gradients, no 3D isometric icons.** Use real numbers, real screenshots, real data.
10. **No "fade-only" section transitions.** Every section should fade + y-translate (see Motion). A static SaaS page feels more slop than an animated one in 2026.

---

## 8. Voice — how the site talks

Brief, declarative, confident. No hedging. No "we believe". No "empowering". No "revolutionary".

**Hook pattern**: a money question or a sharp promise. Short sentence, often fragmented.
- "Close deals faster and smarter."
- "Close faster. Pay less doing it."
- "Kill 100 bad deals before lunch."

**Section headline pattern**: a declarative claim with one number, one verb, or one proper noun.
- "Three ways to pay for the same work."
- "Pick a deal. Watch The Rundown run."
- "Drag the layers. Watch the math."

**Body pattern**: named protagonists, real numbers, specific outcomes.
- "Sarah V., Partner, boutique M&A advisory. Closed at $154.8M on Mark's deal. $2.7M fee, 4 hours of partner review."

**CTA pattern**: an action verb + a specific output.
- "Start free"
- "Run a Baseline"
- "Let Yulia pick"
- Never "Learn More" or "Get Started"

**Trademark terms** (Baseline™, Blind Equity™, Rundown™) are products with capital-letter proper-noun treatment. Always use the trademark glyph on first reference in a section. Define them via JargonTerm or BrandedTermCard before using in prose.

---

## 9. Translating to LinkedIn documents

A LinkedIn document (carousel, single-page, multi-slide) should read as **a continuation of the website**, not a separate brand expression. Apply these patterns:

### Title slide
- Full-bleed dark background (`#0f1012` or `#1A1C1E`).
- HookEyebrow at top-left (accent, dot, 0.2em).
- Giant Sora 900 headline, tight tracking, left-aligned.
- Small Inter body below as the sub.
- Bottom-left: "smbx.ai" in flat white (no logo file for a one-color treatment — just the wordmark in Sora 800).

### Content slide (standard)
- Light background (`#F9F9FC` or `#ffffff`).
- SectionEyebrow at top (accent, 0.08em, no dot).
- Sora 900 section headline.
- Inter body or a stat strip (3 KPIs with accent on the last).
- Generous whitespace. Max 3–4 elements per slide.

### Stat slide (the hero metric)
- Near-black background (`#0f1012`).
- Single giant Sora 900 number (clamp sizes, tabular-nums) in accent color.
- Small Inter caption below in muted white.
- Like the "spread vs IB fee: 775×" card on /pricing.

### Light-card-on-dark slide (the cinematic anchor)
- Dark background (`#0f1012`).
- Centered white card with hairline border, 24px padding, 60px soft drop shadow.
- All text inside the card is ink-dark.
- Used for the "hero data" moment — the one thing the reader must remember.

### Quote slide
- Light background.
- Sora 900 headline for the quote (not Inter italic — that reads weak).
- Attribution in Inter 13px muted, with an accent-colored 3px left-rule.

### CTA slide
- Dark background (`#0f1012`) + 1px accent ring border + soft drop shadow.
- Sora 900 action verb + specific output.
- Pill-shaped button visual with accent fill.
- "Free · No account required · Your data stays yours" in muted white underneath.

### What to avoid in docs
- No gradient fills on slide backgrounds
- No 3D metallic logo variants (the rose-gold 3D variant exists but is reserved for specific site hero placements — default to flat)
- No three-column feature grids with identical card shadows
- No bullet points longer than 6 words
- No emoji (unless the user explicitly asks — the brand is formal-adjacent)
- No pink text on dark backgrounds at sizes smaller than 14px (use `#E8709A` for dark, and bump the weight to 600)

---

## 10. Asset references

Logos and image assets live in `/client/public/` on the main SMBx repo. The wordmark and icon files:
- `G3L.png` — flat black wordmark (light mode)
- `G3D.png` — flat white wordmark (dark mode)
- `X.png` — icon mark only, flat black
- `X-white.png` — icon mark only, flat white
- `New G1 Logo T.png` — rose-gold 3D variant (restricted use)

For LinkedIn documents, the flat wordmark (`G3L` / `G3D`) is the default. The rose-gold 3D variant is reserved for on-site hero placements and should not be used in documents.

Typography:
- Sora (Google Fonts, weights 400/600/800/900)
- Inter (Google Fonts, weights 400/500/600)

---

## 11. Version history

- **2026-04-14** — Pricing redesign (inheritance tiers, comparison table, FAQ accordion, Yulia-picks-tier), motion tokens, SectionBand primitive, Apple Glass on mobile, scroll-reveal everywhere, ScrollProgressBar, cinematic anchors on all 7 journey pages, ring-accent CTAs replacing blurred halos, eyebrow variants (hook vs section), JargonTerm component, DealCalculator on /buy, landing→chat morph keyed on viewState, light-card-on-dark treatment on both cost-comparison anchors.
- **2026-04-04** — Previous `STYLE_GUIDE.md` state (flat ink-on-paper logos, rose-gold 3D variant, cream #F8F6F2 backgrounds). Deprecated for visual system; retained for logo rules and brand voice.
