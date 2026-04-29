# smbX · Home v3 — Design Handoff

This package contains the design source for the **Home v3** prototype of smbx.ai. It exists so an engineer (or Claude Code) can build the production version while preserving the design intent exactly.

## What's in here

```
dist/
├── Home v3.standalone.html      ← The visual reference. Open in any browser. Works offline.
├── HANDOFF.md                   ← This file.
└── source/
    ├── Home v3.html             ← Entry. Loads styles + JSX components.
    ├── v3-styles.css            ← Tokens (colors, type, spacing) + global classes.
    ├── v3-shell.jsx             ← App shell: sidebar (deals, commands, footer links), tabbar.
    ├── v3-chat.jsx              ← Chat pane: welcome doors, mode banner, thread, composer.
    ├── v3-canvas.jsx            ← Right-pane document viewer: deal canvas + LearnDoc routing.
    └── v3-learn.jsx             ← The combined "How it works · Pricing" document.
```

The standalone HTML is the **ground truth**. Anything that disagrees with it is wrong — including this document. When in doubt, open the standalone, click around, screenshot.

## How to run the source (during build)

The source files load via `<script type="text/babel">` (in-browser Babel). To preview locally:

1. Serve the `dist/source/` directory with any static server (`python3 -m http.server`, `npx serve`, etc.).
2. Open `Home v3.html`.

In production, transpile the JSX ahead-of-time and load the resulting JS normally. The in-browser Babel approach is for design iteration only.

## Stack assumptions

- **React 18.3.1** via UMD CDN (`react.development.js`, `react-dom.development.js`).
- **Babel Standalone 7.29.0** for in-browser JSX (design-time only).
- No bundler, no JSX modules, no `import` statements. Components attach to `window` at the bottom of each file:
  ```js
  Object.assign(window, { ChatPane, Welcome, DoorCard, ModeBanner });
  ```
- **Inter** + **Inter Tight** + **JetBrains Mono** from Google Fonts.
- Styling is a mix of CSS variables (in `v3-styles.css`) and inline-style objects per component (e.g. `vw = { ... }` in `v3-chat.jsx`, `vp = { ... }` in `v3-canvas.jsx`, `vL = { ... }` in `v3-learn.jsx`).

## Design intent (the why, not the what)

### The thesis

Yulia is the deal team you hire. The product **does** the work — recasts, models, drafts, screens — but **never** crosses into the things that would make smbX a regulated entity: it doesn't negotiate, hold funds, or charge success fees. **The restraint is the product.** That thesis must show up in copy, structure, and pricing.

### Visual language

- **Institutional, not editorial.** Mono microlabels, §-numbered sections, tabular numerals, dashed dividers. Think Bloomberg-meets-Linear, not Stripe-meets-magazine.
- **Two greens.** Indigo `#1B2C5C` is the trust/CTA color (buttons, accents, brand mark). Emerald `--accent` (`#138A5A`) is reserved for "go" signals: live status dots, ✓ done states, asset-deal Δ wins, the PURSUE verdict tag. **Never mix:** every "Send" / "Start" CTA is indigo; every "go" semantic is emerald.

  The codebase currently uses `--accent` for emerald globally. Rename to `--go` if your design system separates them, but do not collapse them — losing the distinction breaks the visual system.

- **No emoji, no gradients (almost), no gimmicks.** One subtle accent-soft gradient on the chosen-option card and the featured Pro pricing card; that's it. Borders and color carry hierarchy, not depth effects.
- **Type scale.** Display (Inter Tight) for h1/h2/h3 with negative letter-spacing (`-0.025em` to `-0.03em`). Body (Inter) at 13.5px / 1.6. Mono (JetBrains) at 9.5–11px for microlabels with `0.08–0.1em` letter-spacing and uppercase.
- **Spacing rhythm.** 6 / 8 / 10 / 12 / 14 / 16 / 18 / 22 / 28 px. Stick to these.

### Layout

Two-column desktop split: chat pane (left, capped at 480px) and canvas pane (right, fills the rest). The chat is the **conversation surface**; the canvas is the **document surface**. Yulia produces things in the canvas; you talk to her in the chat.

> **The 480px cap is deliberate.** On wide monitors a chat pane that scales with the viewport becomes uncomfortable to read and steals room from the canvas (which is what users came for). The cap keeps the chat as a comfortable reading column and gives the document its room. Do not remove it.

### The four doors (welcome screen)

The chat opens with four entry points. The first three are the user's mode of engagement:

1. **Watch a demo** — Yulia runs an end-to-end teaser screen, autonomously. (`mode: "watch"`)
2. **Explore a sample deal** — opens a finished deal. User clicks around. (`mode: "explore"`)
3. **Start with my own** — empty composer. (`mode: "start"`)

The fourth door, under a `LEARN MORE` divider, is the **document door**:

4. **How it works · Pricing** — opens the LearnDoc on the right canvas. (`mode: "learn"`)

The first three doors are styled as solid cards. The fourth is a dashed/transparent variant — visually subordinate, signaling "this is meta-information, not your primary action."

### The mode state machine

`mode` is the central state. It lives in `<V3Workspace>` (`v3-chat.jsx`) and is threaded into both panes.

| `mode`    | Chat pane shows         | Canvas pane shows         |
|-----------|-------------------------|---------------------------|
| `welcome` | Four-door welcome       | Sample-deal preview       |
| `watch`   | Autoplay demo thread    | Live deal canvas, animated|
| `explore` | Initial Yulia message + slash-suggestions | Sample deal canvas |
| `start`   | Empty composer prompt   | Empty canvas placeholder  |
| `learn`   | "I opened the doc on the right" + suggestions | LearnDoc |

**`thread` is preserved across mode changes** so the user can switch contexts without losing what they typed. Only the welcome mode hides it (the welcome IS the thread when `thread.length === 0`).

### The LearnDoc as canvas content

A critical decision: How it Works + Pricing are **not separate routes**. They render in the same canvas the deal documents render in. This says, structurally, "this is a document Yulia produces, just like a CIM or a recast." It also keeps the user in flow — they can ask Yulia a question while the doc is open, without navigating away.

LearnDoc structure (see `v3-learn.jsx`):
- Title block with mono meta tags
- §01 The pattern (4-cell grid)
- §02 The restraints (5 numbered rows + accent callout)
- §03 A real interaction (3 Acts: Question → Analysis → Decision; with 3 option cards + 5-col implications table)
- §04 Integration moat (body + 5-stat strip)
- §05 Glossary (Baseline / Blind Equity / Rundown)
- PART II divider
- §06 Pricing (5-tier strip + feature matrix + 6 rules)
- §07 FAQ (8 collapsible rows)
- Dark final CTA

## Must-preserve behaviors

These are non-negotiable. If your build doesn't do these, it's wrong:

1. **Chat pane caps at 480px** on wide viewports. Canvas pane fills the rest.
2. **Welcome content is a single reading column** — h1, lede, doors, footer ticker all share the same right edge. Do not give individual elements their own `max-width`. (We hit this bug live; see "Gotchas" below.)
3. **The four doors all share the same width**, including door 04. Door 04's wrapper (`learnSect`) needs explicit `width: 100%` because it's not a flex child of the doors container.
4. **Mode banner shows in chat for all modes except `welcome`** with a `← back` link returning to welcome.
5. **Thread persists across mode changes.**
6. **Indigo for CTAs, emerald for "go" signals.** Don't collapse them.
7. **Canvas footer status bar swaps text by mode** — `READY · SBA-CLEAR · 7.0× · VERDICT PURSUE` for deal modes, `READING · HOW-IT-WORKS · PRICING · UPDATED 04/26` for learn mode.
8. **Doc top-bar swaps the file path and "modified/read-only" badge** based on mode.
9. **Mono microlabels are uppercase with `letter-spacing: 0.08em`**, never sentence case, never tracking-tight.
10. **The PURSUE verdict tag is emerald**, the canvas top-right, always visible in deal modes.

## Gotchas (things we hit during design — don't re-invent these bugs)

1. **`all: unset` on a `<button>` removes its width AND its text-align.** The four doors needed `width: 100%; text-align: left;` explicitly. Without these the button shrink-fits to content and centers its children, creating phantom carriage returns.

2. **Block-level wrappers don't always inherit full width.** Door 04's `learnSect` wrapper looked correct visually at narrow widths but collapsed to ~393px on wide viewports because it lacked `width: 100%; display: block;`. Set both explicitly on any block wrapper around a flex column's "outsider" element.

3. **Inline `style` objects must be uniquely named globally.** Babel-in-browser transpiles each `<script type="text/babel">` into the global scope. Two files both declaring `const styles = {...}` would clobber each other. We use `vw` (chat), `vp` (canvas), `vL` (learn) prefixes.

4. **Canvas pane scrolling is the LearnDoc's only scroller.** The canvas body has `overflow-y: auto` (`.thin-scroll`); the doc itself doesn't manage scroll. If you re-engineer this, make sure section anchors (`#pricing`, etc.) scroll the canvas, not the page.

5. **Lede paragraphs had a stale `maxWidth: 480` from earlier iterations.** When the welcome column shrank to 560px and then was removed, the lede was orphaned at 480 — narrower than its siblings. Trace any `maxWidth` rules and verify they all share one source of truth (the welcome column width, not per-element).

## Copy is locked

The copy in this prototype is the result of multiple rounds of editing with the founder. It is intentionally specific:

- "I run M&A deal work end-to-end" — first person, present tense.
- "$149/mo, flat. No success fees, ever." — never edit, never round, never qualify.
- "$2.4B SCREENED" — keep the period implicit, mono-cased.
- "PURSUE" / "PASS" — Yulia's verdict vocabulary. Never "Buy" / "Skip".
- "The Baseline™ / Blind Equity™ / The Rundown™" — branded terms. Trademark glyphs included.
- The LearnDoc act labels — "ACT 01 · THE QUESTION", "ACT 02 · YULIA'S ANALYSIS", "ACT 03 · THE DECISION" — are part of the document's narrative, not generic section headers.

If your CMS strips trademark glyphs or mono casing, fix the CMS.

## Mobile

Out of scope for this handoff. The desktop split (chat ↔ canvas) doesn't translate; mobile is a different product (a companion, not a port). When you get to mobile, ask the design team — don't shrink-down the desktop.

## Questions / changes

If you need to deviate, ask before coding. The design has been iterated heavily; what looks like a small choice (door order, color use, status bar text) is usually load-bearing.

— smbX design team · April 2026
