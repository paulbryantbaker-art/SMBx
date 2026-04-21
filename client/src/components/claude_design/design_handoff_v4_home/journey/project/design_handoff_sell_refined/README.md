# Handoff: `/sell` — Sell-side product page (V4 shell, refined)

## Overview

This is the marketing + product preview page for **smbx.ai's Sell-side**
product (helping SMB owners prepare a business for sale). It is delivered
inside the **V4 app shell** — the same three-pane Tool Rail + Chat Well +
Canvas Card layout used across the product — so the page demonstrates the
product while also marketing it. The Canvas hosts an editorial article
broken into a hero, a horizontal journey strip, and alternating
feature/stat rows. A live chat thread + composer runs in the Chat Well.

The single authoritative mock is **`Sell refined.html`**. Everything
else in this folder is a stylesheet it imports.

---

## About the Design Files

**These files are design references, not production code.** They are
HTML + vanilla JS prototypes that show the intended look, spacing,
typography, and interaction behavior. The task is to **recreate them in
the target codebase's environment** (React, Vue, Svelte, etc.) using the
codebase's existing component patterns.

- CSS **tokens and component styles** (`v4-tokens.css`, `v4-shell.css`,
  `journey-content.css`, `sell-editorial.css`) are the source of truth
  for visual values. Import them as-is, or translate them verbatim into
  the target system — do not re-derive values by eye.
- The **class names are part of the contract**. Keep the `.v4-*`,
  `.sv-*`, `.jt-*`, `.jc-*` naming so the styles map 1:1. Rename only
  after the port is pixel-identical.
- The inline `<style>` block in `Sell refined.html` contains the
  page-specific composer overrides — these **must** be ported verbatim
  (see §6 Composer).

---

## Fidelity

**High-fidelity (hifi).** Exact colors, typography, spacing, shadows,
radii, and interaction states are final. The implementation should be
pixel-identical at 1440×900.

---

## File Manifest

| File | Role | Scope |
|---|---|---|
| `Sell refined.html` | Page structure + inline composer CSS + all JS | `body > .app-v4 > .v4-shell` |
| `v4-tokens.css` | CSS custom properties (colors, shadows, density) | `.app-v4 {}` |
| `v4-shell.css` | Three-pane shell: `.v4-tool`, `.v4-chat`, `.v4-canvas*`, `.v4-comp`, `.v4-psw`, `.v4-next` | V4 shell surfaces |
| `journey-content.css` | Generic content blocks used inside the Canvas: `.jc-card`, `.jc-est`, `.jc-chip`, etc. | Canvas body |
| `sell-editorial.css` | Sell-page-specific editorial system: `.sv-hero`, `.sv-row`, `.sv-strip`, `.sv-paths`, `.sv-bignum`, `.sv-break`, `.sv-cta`, **plus the `[data-aff]` affordance system** | Canvas body |

---

## 1. Layout — The V4 Shell

The page is a **fixed-viewport three-pane shell** (not a scrolling web
page). The outer `body` is locked with `height: 100%` and
`background: var(--v4-bg)`. Inside:

```
.app-v4  (fixed inset:0, provides tokens)
  └── .v4-shell  (position:absolute, inset:0, owns the three custom props)
        ├── <aside class="v4-tool">           ← Left: floating tool rail
        ├── <section class="v4-chat" id="chat"> ← Middle: flat chat well
        │     ├── .v4-psw         (portfolio switcher)
        │     ├── .v4-chat__head
        │     ├── .v4-chat__scroll (messages scroll here)
        │     ├── .v4-next (suggested-action chip)
        │     └── .v4-comp.v4-comp--hero (composer — in flow at bottom)
        └── <div class="v4-canvas-wrap">       ← Right: floating canvas card
              └── .v4-canvas
                    ├── .v4-canvas__head  (breadcrumb)
                    └── #canvasBody .sellv2 (editorial content)
```

### Shell positioning math

`.v4-shell` declares three custom properties that everything else
consumes:

```css
.v4-shell {
  --v4-tool-w: 184px;   /* tool rail width when expanded; 56px collapsed */
  --v4-chat-w: 380px;   /* chat well width */
  --v4-rail-w: 0px;     /* right rail; 0 on this page */
}
```

| Pane | Position | Notes |
|---|---|---|
| `.v4-tool` | `position:absolute; top:16px; bottom:16px; left:14px; width:56px` (expands to 184px on hover/toggle) | Floats with `--v4-shadow-md`, radius 16px |
| `.v4-chat` | `position:absolute; top:0; bottom:0; left:calc(var(--v4-tool-w) + 28px); width:var(--v4-chat-w)` | **Flat** — no card, no shadow. Column of flat content. |
| `.v4-canvas-wrap` | `position:absolute; top:16px; bottom:16px; left:calc(var(--v4-tool-w) + 28px + var(--v4-chat-w) + 16px); right:calc(var(--v4-rail-w) + 16px)` | The floating card lives inside; `right:16px` override is set inline in the page |

**Do not change these offsets.** The 16px + 28px + 16px pattern is how
the tool rail and canvas card visually float on the `--v4-bg` backdrop
while the chat well sits flat against it.

---

## 2. Design Tokens

All values come from **`v4-tokens.css`** scoped to `.app-v4`. Reproduce
this file byte-for-byte, or translate to the target system's token
primitives. **Do not invent new colors or shadows.**

### Palette

| Token | Hex | Use |
|---|---|---|
| `--v4-bg` | `#F6F6F4` | App backdrop (cool off-white) |
| `--v4-bg-2` | `#EEEEEB` | Subtle fill (send button resting, chip hover target) |
| `--v4-ink` | `#0A0A0B` | Primary text, primary button bg |
| `--v4-ink-2` | `#2E2E32` | Secondary text |
| `--v4-mute` | `#6A6A70` | Tertiary text |
| `--v4-faint` | `#9C9CA2` | Eyebrows, monospace meta labels |
| `--v4-line` | `#E6E6E2` | Hairlines on backdrop |
| `--v4-line-2` | `#DADAD5` | Stronger divider |
| `--v4-card` | `#FFFFFF` | Canvas + dock card fill |
| `--v4-card-line` | `#EAEAE6` | Canvas card border |
| `--v4-gutter` | `#E0E0DB` | Vertical divider |
| `--v4-chip` | `#EFEFEC` | Chip fill |
| `--v4-chip-h` | `#E5E5E1` | Chip hover |
| `--v4-on-ink` | `#FFFFFF` | Text on ink |
| `--v4-ok` | `#22A755` | Success |
| `--v4-warn` | `#D18B1F` | Warning |
| `--v4-flag` | `#C24A2D` | Flag / error |

### Shadows

```css
--v4-shadow-lg:
  0 40px 80px -20px rgba(15,15,30,0.18),
  0 18px 40px -12px rgba(15,15,30,0.12),
  0 4px 10px rgba(15,15,30,0.06);

--v4-shadow-md:
  0 10px 30px -8px rgba(15,15,30,0.14),
  0 4px 12px rgba(15,15,30,0.08),
  0 1px 3px rgba(15,15,30,0.04);

--v4-shadow-sm:
  0 2px 6px rgba(15,15,30,0.08);
```

The **composer** uses a custom elevation recipe matching the canvas
card exactly (see §6).

### Typography

| Family | Weights | Use |
|---|---|---|
| `Inter` | 400, 500, 600, 700 | UI copy, body text |
| `Sora` | 400, 500, 600, 700 | Display / titles (`.sv-hero__h`, `.v4-psw__n`, headings) |
| `JetBrains Mono` | 500, 600 | Eyebrows, meta labels, "TRY · 3 INPUTS" chips, numeric IDs |

Imported via a single Google Fonts link in the `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
```

### Density

`.app-v4[data-density="compact"]` tightens `--row-pad-y` from 12px→7px
and `--stack-gap` from 14px→8px. The Tweaks panel toggles this via
`data-density` on the `.app-v4` root; keep the mechanism if you keep
the density control, otherwise ship the `comfortable` defaults.

---

## 3. Tool Rail — `.v4-tool`

Floating vertical rail on the left edge. **Always visible.** Collapses
to 56px icons + expands to 184px with labels on hover (or always
expanded if `.v4-tool--expanded` is applied).

Structure:
```html
<aside class="v4-tool v4-tool--expanded">
  <button class="v4-tool__logo">s</button>   <!-- brand glyph -->
  <div class="v4-tool__sep"></div>
  <div class="v4-tool__list">
    <!-- grouped nav buttons: v4-tool__group-h headings + v4-tool__btn rows -->
  </div>
  <div class="jt-acct">   <!-- bottom: account CTAs -->
    <button class="jt-acct__btn">Start free</button>
    <button class="jt-acct__btn jt-acct__btn--ghost">Sign in</button>
  </div>
</aside>
```

Full CSS in `v4-shell.css` starting at line ~14. Account-button
overrides live in the inline `<style>` block of the page.

---

## 4. Chat Well — `.v4-chat`

Flat column between the tool rail and the canvas. Contents, top to
bottom:

1. **`.v4-psw`** — portfolio switcher (logo square + name + mono meta + caret). Pill hover on `.v4-psw__btn`.
2. **`.v4-chat__head`** — a single line of context ("Sell-side · Acme, Inc.")
3. **`.v4-chat__scroll` (id="chatScroll")** — the message list. Each message is `.v4-msg` + `.v4-msg__bubble`. User messages get `.v4-msg--me` which styles the bubble with `background:var(--v4-bg-2); padding:10px 14px; border-radius:14px 14px 4px 14px`. Agent messages are plain body copy, 13px.
4. **`.v4-next.v4-next--quiet`** — single "Suggested" action chip (see §5).
5. **`.v4-comp.v4-comp--hero`** — composer (see §6).

### Messages

```html
<div class="v4-msg v4-msg--me"><div class="v4-msg__bubble">…</div></div>
<div class="v4-msg"><div class="v4-msg__bubble">…<strong>bold</strong>…</div></div>
```

Bold spans inside a bubble use `color: var(--v4-ink); font-weight: 600;`.

---

## 5. Suggested-action chip — `.v4-next.v4-next--quiet`

A single dashed-ghost chip that surfaces the next recommended action.
**Quiet variant is required on this page** — the solid variant exists
in `v4-shell.css` but is not used.

```html
<button class="v4-next v4-next--quiet" id="nextAction">
  <span class="v4-next__k">Suggested</span>
  <span class="v4-next__t">See the add-backs</span>
  <span class="v4-next__go" aria-hidden="true">→</span>
</button>
```

Styles (in page inline `<style>`):
- `background: transparent`
- `border: 1px dashed var(--v4-line)`
- `border-radius: 999px`
- `padding: 7px 12px 7px 14px`, `margin: 2px 18px 10px`
- `.v4-next__k` is JetBrains Mono 9px, uppercase, letter-spacing 0.14em, `var(--v4-faint)`
- `.v4-next__t` is Inter 11.5px 500, `var(--v4-mute)`
- `.v4-next__go` is a plain `→` arrow, same color as `__t`
- Hover: border darkens to `var(--v4-ink)`, text to `var(--v4-ink)`, bg to `var(--v4-bg-2)`. **No transform.**

Clicking scrolls the canvas to the add-back estimator (see JS §9).

---

## 6. Composer — `.v4-comp.v4-comp--hero` (THE TRICKY ONE)

A true round pill at the bottom of the Chat Well, visually matching the
Canvas Card's elevation recipe. **Everything in this section must be
ported verbatim** — it's the single most scrutinized interaction on the
page.

### DOM
```html
<div class="v4-comp v4-comp--hero">
  <form class="v4-comp__card" id="chatForm">
    <input id="chatInput" type="text" placeholder="Ask Yulia anything about your business…" autocomplete="off">
    <button class="v4-comp__send-btn" type="submit" aria-label="Send">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="19" x2="12" y2="5"/>
        <polyline points="5 12 12 5 19 12"/>
      </svg>
    </button>
  </form>
  <!-- meta strip hidden; bottom edge aligns with canvas card bottom -->
  <div class="v4-comp__foot" hidden>…</div>
</div>
```

### CSS (lifted verbatim from the page inline `<style>`)

```css
.v4-comp.v4-comp--hero { padding: 8px 16px 16px; }

/* The pill — matches canvas card elevation exactly */
.v4-comp--hero .v4-comp__card {
  position: relative;
  display: flex; align-items: center;
  background: var(--v4-card);
  border: 1px solid var(--v4-card-line);
  border-radius: 999px;
  padding: 7px 7px 7px 22px;
  gap: 8px;
  min-height: 58px;
  box-shadow:
    0 1px 0 rgba(255,255,255,0.9) inset,
    0 0 0 1px rgba(15,15,20,0.02),
    0 40px 80px -20px rgba(15,15,30,0.18),
    0 18px 40px -12px rgba(15,15,30,0.12),
    0 4px 10px rgba(15,15,30,0.06);
  transition: box-shadow 160ms, transform 160ms;
}

/* Inset highlight on the top curve — matches canvas ::before */
.v4-comp--hero .v4-comp__card::before {
  content: ''; position: absolute; inset: 0 0 auto 0; height: 28px;
  background: linear-gradient(180deg, rgba(255,255,255,0.5), transparent);
  pointer-events: none; border-radius: 999px 999px 0 0;
}

.v4-comp--hero .v4-comp__card:focus-within {
  box-shadow:
    0 0 0 3px rgba(10,10,11,0.08),
    0 1px 0 rgba(255,255,255,0.9) inset,
    0 0 0 1px rgba(15,15,20,0.02),
    0 40px 80px -20px rgba(15,15,30,0.22),
    0 18px 40px -12px rgba(15,15,30,0.14),
    0 4px 10px rgba(15,15,30,0.08);
}

/* Input */
.v4-comp--hero #chatInput {
  flex: 1; min-width: 0;
  border: 0; outline: 0; background: transparent;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 15.5px;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: var(--v4-ink);
  padding: 10px 0;
}
.v4-comp--hero #chatInput::placeholder {
  color: var(--v4-mute); font-weight: 400; letter-spacing: -0.005em;
}

/* Send — LIGHT GREY RESTING STATE */
.v4-comp--hero .v4-comp__send-btn {
  width: 44px; height: 44px;
  border-radius: 999px;
  background: var(--v4-bg-2);   /* light grey when no text */
  color: var(--v4-mute);
  border: 0; cursor: pointer;
  display: grid; place-items: center;
  flex-shrink: 0;
  transition: background 160ms, color 160ms, transform 120ms, box-shadow 160ms;
  box-shadow: none;
}

/* BLACK when input has text — toggled by JS adding .has-text on the form */
.v4-comp--hero .v4-comp__card.has-text .v4-comp__send-btn {
  background: var(--v4-ink);
  color: var(--v4-on-ink);
  box-shadow: 0 6px 16px -6px rgba(10,10,11,0.45);
}
.v4-comp--hero .v4-comp__card.has-text .v4-comp__send-btn:hover {
  background: #1f1f22;
  transform: translateY(-1px);
  box-shadow: 0 10px 22px -8px rgba(10,10,11,0.55);
}
.v4-comp--hero .v4-comp__send-btn:active { transform: translateY(0); }
```

> The SVG's `stroke="#fff"` is hardcoded in the markup. At the light-grey
> resting state the arrow inherits `color: var(--v4-mute)` via
> `color:` being set on the button — but because the SVG uses literal
> `stroke="#fff"`, swap the stroke to `currentColor` if you want the
> arrow to darken at rest. Current design keeps the white stroke (it
> reads as a soft grey against `--v4-bg-2`). If that looks wrong in
> your environment, use `stroke="currentColor"`.

### Interaction contract

| Event | Behavior |
|---|---|
| User types any non-whitespace character | Form gets `.has-text` → send button turns black |
| Input cleared / whitespace-only | `.has-text` removed → send button returns to light grey |
| Form submit | Send message, clear input, remove `.has-text` |
| Focus | Adds 3px soft ring on the pill (via `:focus-within`) |

JS (inline, bottom of page):
```js
(() => {
  const inp = document.getElementById('chatInput');
  const card = inp?.closest('.v4-comp__card');
  if (inp && card) inp.addEventListener('input',
    () => card.classList.toggle('has-text', inp.value.trim().length > 0));
})();
```

And on submit, after clearing, dispatch `input` so `.has-text` reconciles.

---

## 7. Canvas Card — `.v4-canvas`

A single floating white card on the right that hosts the editorial
content. Shell styles in `v4-shell.css` around line 369. The elevation
recipe here is what the composer mirrors:

```css
.v4-canvas {
  background: var(--v4-card);
  border: 1px solid var(--v4-card-line);
  border-radius: 18px;
  box-shadow:
    0 1px 0 rgba(255,255,255,0.9) inset,
    0 0 0 1px rgba(15,15,20,0.02),
    0 40px 80px -20px rgba(15,15,30,0.18),
    0 18px 40px -12px rgba(15,15,30,0.12),
    0 4px 10px rgba(15,15,30,0.06);
}
.v4-canvas::before {
  content: ''; position: absolute; inset: 0 0 auto 0; height: 80px;
  background: linear-gradient(180deg, rgba(255,255,255,0.5), transparent);
  border-radius: 18px 18px 0 0; pointer-events: none;
}
```

Head (`.v4-canvas__head`) is a 48px-min-height breadcrumb strip:
```
SMBX.AI / SELL · Sell a business   [Demo · Acme, Inc.]
```
The kicker (`.v4-canvas__crumb-k`) is JetBrains Mono 9px uppercase
`var(--v4-faint)`. The title (`.v4-canvas__crumb-t`) is Sora 700 14px
`var(--v4-ink)`. The demo badge (`.v4-canvas__crumb-badge`) is a small
chip.

---

## 8. Canvas body — `.sellv2` editorial system

Lives inside `.v4-canvas__body` (padding zeroed on this page).
Styles all live in **`sell-editorial.css`**. The content reads like a
long-form article broken into named sections. Each section uses one of
the following patterns:

### 8a. Hero — `.sv-hero.sv-hero--full`
Full-width lede, centered. Two layout modes exist (`sv-hero` and
`sv-hero--full`); this page ships `--full`.

```html
<section class="sv-hero sv-hero--full">
  <div class="sv-hero__lede">
    <div class="sv-hero__eye">—  A QUIET KIND OF READY</div>
    <h1 class="sv-hero__h">A harder question than "what's it worth?"</h1>
    <p class="sv-hero__sub">…</p>
    <div class="sv-hero__cta">
      <button class="sv-hero__btn">See your range</button>
      <button class="sv-hero__btn sv-hero__btn--ghost">How it works</button>
    </div>
  </div>
  <div class="sv-hero__stats">
    <!-- four .sv-hero__metac stat cells -->
  </div>
  <ol class="sv-strip">…</ol>  <!-- horizontal journey strip -->
</section>
```

Heading uses `font-size: clamp(44px, 6.8cqw, 84px)` and
`font-family: 'Sora'`. `text-wrap: balance`.

### 8b. Horizontal journey strip — `.sv-strip`

Replaces an older vertical arc pattern (`.sv-arc`, still in CSS as
fallback — not used). Six numbered steps in a row, connected by a
hairline that fills in under "done" + "active" nodes.

```html
<ol class="sv-strip">
  <div class="sv-strip__hd">
    <span class="sv-strip__k">THE JOURNEY</span>
    <span class="sv-strip__t">~14 weeks · 6 phases</span>
  </div>
  <div class="sv-strip__track">
    <li class="sv-strip__step" data-state="done">
      <span class="sv-strip__n">01</span>
      <span class="sv-strip__name">Readiness</span>
      <span class="sv-strip__dur">2 WK</span>
    </li>
    <!-- data-state="done" | "active" | (omitted)=upcoming -->
  </div>
</ol>
```

- Node: 36px circle. `done` = filled ink. `active` = white fill, ink
  border, 3px soft ring. `upcoming` = white, line-colored border, mute
  number.
- Track line uses two pseudo-elements (`::before` full, `::after`
  shorter ink fill at `width: calc(100% / 6 * 1.5)`).
- Responsive: below 860px, `.sv-strip__track` becomes 3-up and the
  connecting line is hidden.

### 8c. Feature/stat row — `.sv-row`

Two-column alternating rows:
```html
<section class="sv-row" id="s2">
  <div class="sv-row__text">
    <div class="sv-row__eye">
      <span class="sv-row__eye__n">01</span> The hidden EBITDA
    </div>
    <h2 class="sv-row__h">Most owners underestimate their EBITDA by 20–40%.</h2>
    <p class="sv-row__p">…</p>
    <div class="sv-row__stat">…</div>
  </div>
  <div class="sv-anim sv-anim-d2">
    <!-- canvas-style card (e.g. .jc-est add-back estimator) -->
  </div>
</section>
```

Alternate sides with `.sv-row--reverse`. Headings are Sora 700
~clamp(26px, 3.4cqw, 40px), `text-wrap: balance`.

### 8d. Big-number break — `.sv-bignum` / `.sv-break`

Large single-stat callouts. `.sv-bignum__v` is Sora 700 ~72px,
`.sv-bignum__k` is mono eyebrow, `.sv-bignum__t` / `.sv-bignum__s` are
body.

### 8e. Paths list — `.sv-paths`

A tabular list of buyer-type rows (`.sv-paths__row`) with: number
(`__n` mono), title (`__t` Sora 600), description (`__b`), type chip
(`__typ`). Head row is `.sv-paths__head`.

### 8f. CTA block — `.sv-cta`

Full-width closer with a small pointer arrow (`.sv-cta__point`,
`.sv-cta__point-ar`) that animates the user's eye toward the chat well.
Click handler wires `#ctaPoint` to focus the composer (see JS §9).

### 8g. Animation wrapper — `.sv-anim` / `.sv-anim-d1` / `.sv-anim-d2`

Intersection-observer-driven entry animation. When the `--full` motion
tweak is active, elements transition opacity/transform on enter. When
Tweaks is set to `motion: reduced` or `off`, this must be no-op.

---

## 9. Affordance system — `[data-aff]`

Any card inside the canvas can declare its interactivity with a single
attribute. **This is a core system; do not drop it.**

| Value | Meaning | Visual signals |
|---|---|---|
| `try` | User input changes state | Dashed inner ring (outline 1px dashed, -8px offset), cursor pointer, hover lifts, **pulsing black dot in top-right corner** (`::after` with `sv-aff-pulse` keyframes). Chip badge becomes solid-ink. Option buttons lift on hover. |
| `live` | Streams from chat/product | Chip gets a pulsing green-ish dot (`sv-live-pulse`), sage-tinted bg |
| `preview` | Static illustration of an output | Chip is transparent with mute border |

```css
[data-aff="try"] {
  position: relative;
  transition: box-shadow 240ms, transform 240ms, border-color 240ms;
  cursor: pointer;
  outline: 1px dashed rgba(10,10,11,0.14);
  outline-offset: -8px;
}
[data-aff="try"]:hover {
  box-shadow: 0 18px 40px -18px rgba(10,10,11,0.22), 0 2px 8px -4px rgba(10,10,11,0.06);
  transform: translateY(-1px);
  border-color: rgba(10,10,11,0.22);
  outline-color: rgba(10,10,11,0.28);
}
[data-aff="try"]::after {
  content: '';
  position: absolute; top: 14px; right: 14px;
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--v4-ink);
  box-shadow: 0 0 0 0 rgba(10,10,11,0.45);
  animation: sv-aff-pulse 1.8s ease-out infinite;
  pointer-events: none; z-index: 2;
}
[data-aff="try"].is-engaged::after { animation: none; opacity: 0.25; }
[data-aff="try"].is-engaged { outline-color: transparent; }

@keyframes sv-aff-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(10,10,11,0.35); }
  70%  { box-shadow: 0 0 0 10px rgba(10,10,11,0);   }
  100% { box-shadow: 0 0 0 0 rgba(10,10,11,0);     }
}
```

**Engage behavior:** When a user first interacts with an `[data-aff="try"]`
card, add class `.is-engaged` to the card. The pulse stops and the
dashed ring fades. In this page, the estimator handler adds the class
on first click:
```js
estHost.addEventListener('click', e => {
  const b = e.target.closest('.jc-est__opt'); if (!b) return;
  es[b.dataset.k] = b.dataset.o; rest(); est();
  const card = estHost.closest('[data-aff="try"]');
  if (card) card.classList.add('is-engaged');
});
```

---

## 10. The estimator — `.jc-est` (the page's one "try it" widget)

Styles in `journey-content.css` starting around line 444.

```html
<div class="jc-est" data-aff="try" style="box-shadow:0 12px 28px -12px rgba(10,10,11,0.08);">
  <div class="jc-est__head">
    <div class="jc-est__title">Add-back estimator</div>
    <div class="jc-est__sub">↳ Try it · 3 inputs</div>
  </div>
  <div class="jc-est__grid" id="est"></div>
  <div class="jc-est__result empty" id="estResult">
    Pick all three inputs to see the estimate.
  </div>
</div>
```

Grid is rendered in JS from an `EST` object with three columns: Annual
revenue, Industry, Owner involvement. Each column is a `.jc-est__col`
containing a label and a stack of `.jc-est__opt` buttons (flex column).

Option button states:
- resting: transparent, mute text, thin border
- hover: white bg, ink inset ring, 0.5px lift
- `.active`: solid ink bg, white text

Computation (reproduced in `est()` in the page):
```js
// revenue bracket → [lo, hi] EBITDA multiplier
const rf = {
  '$1–5M':  [0.35, 0.65],
  '$5–10M': [0.60, 1.20],
  '$10–25M':[1.10, 2.20],
  '$25–50M':[2.00, 3.80],
  '$50M+':  [3.50, 6.50],
}[rev];
// industry → bias
const ib = {
  'Services':1.10,'Manufacturing':1.00,'Healthcare':1.15,
  'Technology':0.90,'Construction':1.05,'Retail':0.95,'Other':1.00,
}[ind];
// owner involvement → bias
const ob = own === 'Full-time operator' ? 1.25
         : own === 'Part-time'          ? 1.05
         : /* absentee */                 0.85;
const lo = rf[0] * ib * ob;
const hi = rf[1] * ib * ob;
const evLo = (lo * 5.5).toFixed(1);
const evHi = (hi * 5.5).toFixed(1);
```
Result block (`.jc-est__result`) renders:
- `.jc-est__resk` — "Estimated hidden EBITDA" (mono eyebrow)
- `.jc-est__resv` — `$X.XXM – $Y.YYM` (Sora 700, big)
- `.jc-est__ress` — "At a 5–6× multiple, that's **$A – $B** of enterprise value."
- `.jc-est__resn` — "Industry-pattern estimates — the real number is specific to your financials."

---

## 11. Page-level JS

All inline at the bottom of `Sell refined.html`. Responsibilities:

1. **Chat plumbing** — `send(text)`, `msg(who, text)`. `who === 'me'`
   renders `.v4-msg--me`; `who === 'y'` renders agent message. Appends
   to `#chatScroll`.
2. **Canvas crumb** — updates `.v4-canvas__crumb-t` based on section
   visibility via IntersectionObserver (optional — removing it is OK).
3. **Suggested-action click** — `#nextAction` scrolls the canvas body
   to the estimator.
4. **CTA pointer** — `#ctaPoint` focuses `#chatInput` and briefly rings
   the composer.
5. **Composer state** — toggles `.has-text` on the form based on
   `#chatInput` value (see §6).
6. **Estimator** — renders option grid, computes result, engages the
   `[data-aff="try"]` card on first click.
7. **Tweaks panel** — reads/writes the `EDITMODE-BEGIN…EDITMODE-END`
   JSON block. Implements `acc` (affordances), `density`, `motion`,
   `hero`, `paths` toggles. **Remove this entire subsystem if you
   don't need runtime knobs in your target environment** — it is a
   prototype-authoring convenience, not product behavior.

---

## 12. Responsive behavior

The shell is built for desktop (1280px+). Below 860px, a few
editorial-layout rules kick in via container queries in
`sell-editorial.css`:

```css
@container canvas (max-width: 860px) {
  .sv-hero--full .sv-hero__stats { grid-template-columns: repeat(2, 1fr); }
  .sv-strip__track               { grid-template-columns: repeat(3, 1fr); gap: 22px 0; }
  .sv-strip__track::before,
  .sv-strip__track::after        { display: none; }
}
```

No mobile redesign is defined. If you need one, escalate.

---

## 13. Interactions & motion

| Element | Trigger | Effect | Timing |
|---|---|---|---|
| Tool rail hover | mouseenter on `.v4-tool` | width 56px → 184px, labels fade in | 200ms `cubic-bezier(0.4,0,0.2,1)` |
| Composer focus | `:focus-within` | Adds 3px soft ring on pill | 160ms |
| Composer type | input event, non-empty value | `.has-text` → send button grey → black | 160ms bg/color |
| `[data-aff="try"]` corner pulse | always (until engaged) | Expanding ring | 1.8s infinite `ease-out` |
| `[data-aff="try"]` hover | mouseenter on card | Lift -1px, shadow deepens, outline darkens | 240ms |
| Estimator option click | click on `.jc-est__opt` | Set active, recompute result, engage card | — |
| Suggested chip hover | mouseenter | border ink, text ink, bg `--v4-bg-2`. No transform. | 160ms |
| CTA pointer click | click `#ctaPoint` | Focus composer input, briefly flash ring on pill | 320ms |
| Section entry | IntersectionObserver on `.sv-anim` | opacity 0→1, translateY 12px→0 | 400–600ms ease-out |

**Honor `prefers-reduced-motion`.** Disable the pulsing affordance dot,
the section-entry animation, and composer micro-hover transforms when
it is set.

---

## 14. Acceptance checklist

Before signing off the port, verify at 1440×900:

- [ ] Tool rail floats 16px from top / bottom / 14px from left, with `--v4-shadow-md`.
- [ ] Chat well is flat on `--v4-bg` backdrop (no card, no shadow).
- [ ] Canvas card floats 16px from top / bottom / right, with the exact 3-layer shadow + `::before` top highlight.
- [ ] Composer pill has `min-height: 58px`, is full-width inside the chat well's 16px gutter, and its **bottom edge aligns with the canvas card's bottom edge** (both at 16px from viewport bottom). The "Yulia · Sell-side partner · Under NDA" foot strip is **hidden**.
- [ ] Composer elevation matches canvas card exactly (same 5-stop shadow stack + inset top highlight).
- [ ] Send button is light-grey (`--v4-bg-2`) at rest and turns black (`--v4-ink`) while input has non-whitespace content.
- [ ] Add-back estimator has a pulsing black dot in its top-right corner; the pulse stops when the user picks any option.
- [ ] Estimator dashed inner ring is visible at rest; disappears after first interaction.
- [ ] Suggested chip is dashed-border ghost, uppercase mono "SUGGESTED" kicker, Inter body, no fill.
- [ ] Scroll fires section-tracking only when JS is active — no layout shift without JS.
- [ ] All text comes from `Inter`, `Sora`, and `JetBrains Mono` — no system-font fallback visible.

---

## 15. Open questions / not specified

- **Dark mode.** Not designed.
- **Real chat backend.** The `send()` function uses a hard-coded demo
  response. Wire to the actual assistant endpoint as appropriate.
- **Canvas content source.** The editorial copy is static in the HTML;
  in production this should probably come from a CMS or MDX.
- **Analytics.** No events instrumented — add in the target codebase.
- **Mobile / tablet.** No layout defined below ~860px beyond the two
  container-query tweaks above.
