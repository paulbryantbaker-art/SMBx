# How it works &amp; pricing — handoff

The "How it works &amp; pricing" page from smbX, packaged as a self-contained
React/JSX prototype. Drop this into Claude Code (or any front-end environment)
as the source of truth for **copy, structure, design system, and component
breakdown**. It is not a production build — it's a high-fidelity reference
implementation.

---

## What's in the box

```
handoff-how/
├── README.md          ← you are here
├── how.html           ← entry point (open in a browser to view)
├── how.css            ← V3 design system tokens (CSS variables + utility classes)
└── how.jsx            ← the entire page as a React component (LearnDoc)
```

Open `how.html` in any modern browser. No build step, no install. React 18 +
Babel are loaded from unpkg with pinned integrity hashes; JSX is transpiled
in-browser. This is fine for handoff but **should be replaced by a real build
in production** (Vite/Next/etc).

---

## Design system — V3

The page is built on a small, deliberate token system. Every color, font, and
spacing decision references these. Don't introduce ad-hoc colors or fonts.

### Color

**Light institutional palette — cool whites, slate ink, emerald accent.**
The brand is "private equity reading room" — Bloomberg-adjacent, not consumer
SaaS. Restraint is a feature.

| Token              | Value                       | Use                                          |
|--------------------|-----------------------------|----------------------------------------------|
| `--bg`             | `#F6F7F9`                   | Page background, behind everything           |
| `--panel`          | `#FBFBFC`                   | Sidebars, doc-tab headers                    |
| `--surface`        | `#FFFFFF`                   | Cards, doc canvas                            |
| `--surface-2`      | `#F1F3F6`                   | Nested cards, subtle hover                   |
| `--line`           | `#E6E9EE`                   | Default dividers, borders                    |
| `--line-2`         | `#D6DAE1`                   | Stronger borders                             |
| `--ink`            | `#0F1623`                   | Primary text                                 |
| `--ink-2`          | `#46505F`                   | Secondary text                               |
| `--ink-3`          | `#6B7588`                   | Tertiary, eyebrows                           |
| `--ink-4`          | `#98A1B0`                   | Disabled, hairline labels                    |
| `--accent`         | `#138A5A` (emerald)         | **Reserved** — pursue, live, send, "go"      |
| `--accent-2`       | `#0F7148`                   | Accent hover                                 |
| `--accent-soft`    | `rgba(19,138,90,0.10)`      | Accent washes, chosen-row backgrounds        |
| `--accent-ring`    | `rgba(19,138,90,0.28)`      | Focus rings, featured-card outlines          |
| `--warn`           | `#B8841F`                   | Sparingly                                    |
| `--danger`         | `#C2453B`                   | Sparingly                                    |
| `--info`           | `#2E6FBF`                   | Sparingly                                    |

**Emerald is sacred.** It only appears on:

- "Pursue" verdicts and "go" signals
- Live status dots (online, working)
- The chosen option in any decision frame
- Primary CTAs (Start free, Send) and the §02 "compounding" highlight chip

If everything is accent, nothing is.

### Type

```
--font-display: "Inter Tight", "Inter", system-ui, sans-serif;
--font-body:    "Inter", system-ui, sans-serif;
--font-mono:    "JetBrains Mono", ui-monospace, monospace;
```

- **Display (Inter Tight)** — used for headlines, big numbers, glossary terms,
  card titles. Always paired with `letter-spacing: -0.025em` to `-0.01em`
  (tighter at larger sizes) and `font-weight: 600`. Never below 14px.
- **Body (Inter)** — paragraphs, labels. Default 14px / 1.5 line-height.
  Long-form text gets `text-wrap: pretty`.
- **Mono (JetBrains Mono)** — eyebrows, section numbers (`§01`), data labels,
  tabular numerics. Use `font-variant-numeric: tabular-nums` for any number
  that lives in a table or aligned column.

The `font-feature-settings: "ss01", "cv11"` on `body` enables Inter's
single-storey `a` and curved `l` — small touches, but they make the page feel
considered. Keep them.

### Reusable classes

- `.eyebrow` — mono, 10px, 0.12em tracking, uppercase, `--ink-3`. Section
  labels, doc meta tags, table headers.
- `.eyebrow-accent` — same but emerald. CTA section heads only.
- `.mono` — switches font to JetBrains Mono and turns on tabular-nums.
- `.btn`, `.btn-accent`, `.btn-ghost` — the only two button styles in the
  system. `.btn-accent` is emerald + white, `.btn-ghost` is bordered + ink.
  Both 8×14 padding, 6px radius, 13px / 500.
- `.thin-scroll` — opt-in custom scrollbar. Apply to long scrollable regions.
- `.pulse-dot` — 6px live-status dot. Inherits `currentColor`, so wrap in a
  span with `color: var(--accent)` for emerald.
- `.fade-up`, `.fade-in` — entry animations. 320–480ms cubic-bezier.

### Spacing &amp; density

- Section gap: `marginTop: 32` (between `<LSec>` blocks)
- Section head bottom margin: 16px, with a 1px `--line` divider
- Card interiors: 14–20px padding depending on density
- Grid gutters: 8–12px (tight); 1px `--line` background grid for "stitched" cards
- Border radii: 3px (chips, tags), 5–6px (cards), 8–10px (page-level shells)
- Shadows: almost none. Where used, ultra-soft and inkwell-y:
  `0 12px 32px -16px rgba(15,22,35,0.08)`

The page should feel **printed, not lit**. If a shadow looks elevated, dial it
back.

---

## Component breakdown — `how.jsx`

The page is a single `LearnDoc` component composed of section primitives. All
styles are inline via the `vL` style object at the bottom of the file (see
"Why inline styles" below).

```
<LearnDoc>
├── Title block
│   ├── eyebrow:  DOCUMENT · HOW IT WORKS &amp; PRICING · v0.5
│   ├── h1:       "The engine. / The price."
│   ├── lede:     2-sentence positioning paragraph
│   └── meta:     3 mono tags (sections / read-time / updated)
│
├── §01 The four-step engine
│   └── 2×2 grid of <PatternCell>
│       └── Cells 01–03 are Yulia's work; cell 04 is the user's decision
│           (rendered with accent={true} — emerald wash + emerald ink)
│
├── §02 A real interaction
│   └── 3 × <ExampleAct>
│       ├── Act 01 — the question (founder quote)
│       ├── Act 02 — Yulia's analysis
│       │   ├── exampleLead paragraph (EBITDA normalization)
│       │   ├── 3 × <OptionCard> (one with chosen={true})
│       │   └── implications table (5-col grid, chosen row highlighted)
│       └── Act 03 — the decision
│
├── §03 Why this gets faster the longer you use it
│   ├── 4 paragraphs
│   ├── moatStrip — 5 × <MoatChip> (last one accent={true} with underline)
│   └── italic closer
│
├── §04 The language
│   └── 3 × <GlossCard> (Baseline™ / Blind Equity™ / Rundown™)
│
├── --- partBreak divider --- ("PART II · PRICING")
│
├── §05 Pricing
│   ├── 5 × <PriceCard> (Pro is featured={true})
│   ├── feature matrix — 11 rows × 6 cols
│   └── "The promises" — 6 ruleRows (one with accent dot)
│
├── §06 FAQ
│   └── 8 × <FaqRow> (collapsible; first 2 default-open)
│
├── endCta — dark inverted CTA strip
│
└── footnote — compliance text in a dashed-border footer
```

### Section primitive — `<LSec>`

Wraps every section. Provides:
- `§NN` mono number on the left
- Section title in `.eyebrow` style
- Optional right-aligned eyebrow
- 1px bottom-bordered head row
- 32px top margin

Use this for any new section. Don't roll your own.

### Card primitives

| Component       | Used in    | Accent variant?                                     |
|-----------------|------------|-----------------------------------------------------|
| `PatternCell`   | §01        | `accent` — emerald gradient wash, emerald headline  |
| `ExampleAct`    | §02        | —                                                   |
| `OptionCard`    | §02        | `chosen` — emerald soft + ring + "CHOSEN" tag       |
| `MoatChip`      | §03        | `accent` — emerald number + 2px emerald underline   |
| `GlossCard`    | §04        | —                                                   |
| `PriceCard`     | §05        | `featured` — emerald wash + ring + tag<br>`muted` — dashed border for Enterprise |
| `FaqRow`        | §06        | First 2 default-open via `idx < 2`                  |

### Inline styles object — `vL`

Everything is in one `const vL = { ... }` object at the bottom of `how.jsx`.

**This is intentional.** The original lives in a multi-component prototype
where global `styles` collisions break Babel-in-browser compilation. Each
component module's style object is named uniquely (`vL` here =
"v3-learn"). When you migrate to a real build:

1. Convert `vL` to CSS Modules, Tailwind, or styled-components — your call.
2. **Preserve token names** (`var(--accent)`, etc) — those are the design
   system contract.
3. Don't flatten the component primitives into one big page. They earn their
   keep when copy changes (and copy changes a lot).

---

## Copy — current as of v0.5

The copy in `how.jsx` is the canonical v0.5 of this page. Key choices that
should be preserved verbatim unless explicitly revised:

- **Title:** "The engine. / The price." — split across two lines, second line
  in `--accent` emerald.
- **§01 closer:** *"The fourth step is the product. The first three are how
  she earns it."* — italic, between two horizontal rules. This is the thesis
  of the page.
- **§03 thesis line:** *"The capabilities are the surface. The integration is
  the moat."* — italic closer.
- **§04 trademarked terms:** Baseline™, Blind Equity™, Rundown™. Keep the ™.
- **§05 promises (NOT "rules"):** Positive frame is intentional. The original
  was framed as restraints; v0.5 reframes as commitments.
- **FAQ row 08:** the labor-split with attorneys ("Yulia is the analyst pod
  and the document engine. Your attorney is the closer."). This is the
  compliance positioning; do not soften.
- **Footnote:** SEC Rule 15(b)(13) reference, fiduciary disclaimer, escrow
  through attorney. Required. Do not delete.

---

## What I'd port first when productionizing

1. **Tokens → CSS variables in your real stylesheet** (1:1 from `how.css`).
2. **Fonts → self-host or use your CDN of choice.** The current Google Fonts
   import is fine for handoff; in production you want preloaded woff2.
3. **`<LSec>` and the card primitives** — drop them into your component
   library. They're small and have no external deps.
4. **Replace inline-styles `vL` with your styling solution.** Token names
   stay; everything else can be reformatted.
5. **Make `<FaqRow>` keyboard-accessible.** Currently uses a button but
   doesn't announce expanded state. Add `aria-expanded` and an
   `aria-controls` linkage.
6. **Hydrate the CTA buttons.** Currently dead. Wire to your auth/sales flows.

---

## Things that look weird but are correct

- `overflow: hidden` on `html, body` is set by `how.css` because the original
  V3 chat shell needs it. `how.html` overrides this in its inline `<style>`
  so the standalone page scrolls. If you embed `<LearnDoc>` inside your real
  app shell, you may need similar handling.
- `min-width: 600` on the feature matrix rows is intentional — below that, a
  feature matrix becomes unreadable. The container scrolls horizontally
  instead of wrapping. Don't "fix" this with media queries that stack.
- `fontVariantNumeric: "tabular-nums"` is set on every numeric value in cards
  and tables. Keep it. Without it, the multipliers (`5.5×` / `6.8×` / `7.5×`)
  jitter as you scan.
- `text-wrap: pretty` on long paragraphs — it's the modern CSS solution to
  orphan/widow lines. Some older browsers ignore it gracefully.

---

## Questions / what's missing

- **No real router.** This is one page. If you're integrating into a
  multi-page app, the doc-shell wrapper in `how.html` needs to be replaced
  by your actual route component.
- **No analytics events.** Add to: every CTA, every FAQ open, the doors at
  the top of the engine grid.
- **No motion beyond fade-in/up.** §03's moat strip would benefit from a
  scroll-triggered count-up on the numbers (22, 28, 12, 01, ~2yr). Easy add.
- **Pricing tiers are hardcoded.** If pricing becomes dynamic, `<PriceCard>`
  takes well-defined props — replace the literal JSX in §05 with a `.map()`.

---

Built with React 18, no compile step, no framework lock-in. Ship it.
