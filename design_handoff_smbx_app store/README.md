# Handoff: SMBX Mobile (iOS) — Yulia

## Overview

This bundle covers the **mobile (iOS) experience** for SMBX — the agentic AI workspace for buying and selling small/mid-market businesses. The desktop bundle (separate) covers the chat-first web workspace; this is the companion phone app.

The mobile app is a **read-and-react surface** rather than a full workspace. Its job:
- Push the user the **brief** every morning — Yulia's 3 picks, with verdicts.
- Let them tap into a deal, see Yulia's verdict + recast P&L, and chat back.
- Keep them in the loop on pipeline activity (sources Yulia is watching, deals in review).
- Hand off heavier work (drafting, analysis, multi-doc review) back to desktop.

The visual language is **Apple App Store** — large titles, full-bleed hero cards, soft pastel gradients, generous spacing, mono-tabular numerals on data, App-Store-style "Get" pill buttons. Two chrome variants are in this bundle:
1. **Standard** (`TopBar` + opaque tab bar) — closer to today's iOS apps.
2. **Liquid Glass v2** (`GlassTopBar` + floating glass tab bar with backdrop-filter) — iOS 26 style.

The first-time / logged-out experience reframes every section as a **sample tour**: the welcome hero invites the user to "Start chatting with Yulia for free", and each list cell is labelled with a "VIEW SAMPLE · …" eyebrow so it's obvious this isn't their data yet.

---

## About the Design Files

The files in this bundle are **HTML/JSX design references** — high-fidelity prototypes built with React + inline Babel for fast iteration. They are **not** production code to copy directly.

The intent is for the developer to **recreate this design in their target codebase**. For iOS, that almost certainly means **SwiftUI** (the design is App-Store-flavoured and leans on iOS 17/26 patterns — large titles, `.scrollEdgeEffect`, sheet presentations, system blur materials). If a React Native codebase already exists, that is the second-best target. The HTML mocks document the intended look and behavior — exact colors, typography, spacing, copy, gradients, and interactions.

How to use this package:
1. Read this README end-to-end.
2. Open `Mobile iOS.html` in a browser to see the live prototype (5 artboards in a pan/zoom canvas).
3. Reference the `.jsx` files for component structure and exact pixel values.
4. Reimplement using your codebase's idioms.

---

## Fidelity

**High-fidelity.** Every color, type size, spacing value, gradient stop, and corner radius is final. The only intentional looseness is in *content* — deal names, P&L numbers, source names are sample copy and will come from the API.

A few specific things to recreate exactly:
- The **pastel hero gradients** (pursue / watch / pass) — these are the single strongest brand signal.
- The **App-Store "Get" pill** style for primary CTAs.
- The **large-title scroll behavior** (large at top, collapses into bar title on scroll) — standard iOS, but make sure to wire it up.
- The **glass tab bar** in v2 — multi-layer recipe (blur + saturate + brightness + 0.5px edge highlight + soft shadow).
- The **mono-tabular numerals** on every datapoint (fit scores, $ figures, multiples, dates).

---

## Device frame

All artboards render inside a **402 × 874** frame matching iPhone 15 Pro logical size. The prototype draws a custom bezel via `IOSDevice` (in `ios-frame.jsx`); production obviously won't have this — you're building the screen, not the bezel.

The viewport is the inside of the bezel: assume **safe area insets** of 54px top (status bar + dynamic island padding) and 34px bottom (home indicator). The floating tab bar sits **18px above the bottom edge** (i.e. inside the safe area), not flush.

---

## Screens

There are **5 artboards** in the canvas, organized into 3 sections:

### Section: Primary flow (3 screens)
1. **Today** — daily home (`screen-today.jsx`)
2. **Pipeline** — deals in review + sources Yulia watches (`screen-pipeline.jsx`)
3. **Brief** — today's 3 picks long-form (`screen-today.jsx` exports `BriefScreen`)

### Section: Deal detail (1 screen)
4. **Deal detail · App Store style** — the big-icon stat strip + recast P&L + "what's new" + ratings pattern (`screen-detail.jsx`)

### Section: Liquid Glass v2 (1 screen)
5. **Today · liquid glass** — same Today content under the glass top bar + glass floating tab bar (`screen-today-glass.jsx`)

The 3 primary screens form the bottom-tab triad: **Today / Pipeline / Brief**. The deal detail is a push from any list cell. The glass variant is a chrome-only variant of Today, not an additional tab.

---

## 1. Today screen

**Tab label:** Today. Bottom tab icon: filled square with top stroke (calendar/today glyph).

Top → bottom (logged-out variant; logged-in replaces only the welcome hero with the daily brief teaser):

1. **TopBar** — `54px top padding`, large H1 "Today" (Inter Tight 800, 34px, letter-spacing -1), search button (36×36 circular, 4% black bg) and JM avatar circle (36×36, dark slate gradient). Padding `54px 22px 8px`.

2. **Welcome hero** — full-bleed App-Store-style hero card.
   - Margin: `14px 16px 0`. Border-radius 24, overflow hidden.
   - Background: `linear-gradient(155deg, var(--hero-pursue-1) 0%, var(--hero-pursue-2) 100%)` = `#A8D4BD → #5FA88A` (mint sage).
   - Decorative radial highlight top-right: `radial-gradient(circle at 80% -20%, rgba(255,255,255,0.35), transparent 60%)`.
   - Padding: 22 horizontal, 24 vertical.
   - Eyebrow (mono, 11px, white 85%, 0.06em tracking, uppercase): "WELCOME TO SMBX · WORKING SAMPLE"
   - H2 (display 800, 28px, line-height 1.05, letter-spacing -0.5, white): "Agentic AI built for buying and selling businesses."
   - Tag (15px, white 85%, line-height 1.45): "Yulia does the hard work — sourcing, recasts, drafts. You bring the judgment."
   - CTA row at the bottom: white "Start" pill (`get-pill`, 6×22 padding, 76px min-width, font-weight 700, color `--blue-ink`) on the left; mono caption on the right "FREE · 3 SAMPLE DEALS" (white 75%, 10.5px, 0.1em tracking).

3. **TryThisCard** — "Three ways to explore" guide card (replaces the second deal hero in the logged-out state).
   - Wrapped in `.as-card` (white, 18px radius), margin `14px 16px 0`.
   - Inner header: eyebrow "TRY THIS" (13px, accent-ink, 0.04em uppercase) + section title "Three ways to explore" (display 700, 20px). Padding 16×18.
   - 3 numbered rows, each tappable (`tap` class), separated by 1px `--line-2` borders:
     - **01 · Open a sample deal** — sub: "See Yulia's verdict, recast P&L, drafts" — pill "View"
     - **02 · Chat with Yulia** — sub (smart quotes): "What's worth my time today?" · ask anything — pill "Chat"
     - **03 · Read the brief** — sub: "Today's 3 picks · 10 min read" — pill "Read" (last row, no bottom border)
   - Each row: 14×18 padding, grid `auto 1fr auto` with 14px gap. The numeral is mono, 13px, 600 weight, accent-ink color, in a 28×28 circle with 4% black background.

4. **PIPELINE section** — eyebrow + title + 5 deal rows in a card.
   - Eyebrow row: "VIEW SAMPLE · IN PIPELINE" / title "5 deals Yulia is working" / one-line sub "Tap any to see what Yulia delivered". Padding `0 22px 8px`.
   - List card: `.as-card`, margin `0 16px 4px`, contains 5 `PipelineRow` components:
     - Row layout: `auto 1fr auto auto` grid, 14px gap, 14px vertical padding, 18px horizontal.
     - 32×32 `YIcon` (square gradient avatar — pursue/watch/pass tints).
     - Name (display 600, 15px) + sub (13px, ink-3) stacked.
     - Mono fit score (13px, 600).
     - "Get"-style pill (`.get-pill`).
     - 1px `--line-2` border between rows.

5. **YULIA'S BRIEF section** — teaser card pointing at the Brief tab.
   - Eyebrow "VIEW SAMPLE · YULIA'S BRIEF". Title "Today's read".
   - Tap card with brief preview (date, headline, 2-line dek, "Read brief →" pill).

6. **Bottom spacer** — 120px to clear the floating tab bar.

### Tab bar (standard variant)

Floating, `position: absolute; bottom: 18; left: 12; right: 12;` inside the screen's frame:
- Pill-shaped translucent capsule (3 tabs: Today / Pipeline / Brief), `rgba(255,255,255,0.78)`, `backdrop-filter: blur(28px) saturate(180%)`, `border-radius: 999`, soft shadow + 0.5px white inner edge.
- Inside the capsule: 3 icon+label columns, active tab uses `--accent-ink` color, inactive `--ink-3`. Icons are `today` / `pipeline` / `brief` (filled when active). Labels: 10px 600.
- **Adjacent floating circular FAB** (chat/Yulia composer) — 56×56, `border-radius: 50%`, `--accent-ink` background, white chat-bubble icon, deep slate shadow.

---

## 2. Pipeline screen

**Tab label:** Pipeline. Bottom tab icon: stacked tri-layer "deal stream" glyph.

Top → bottom:

1. **TopBar** with title "Pipeline".
2. **Section: NEW TODAY** — eyebrow "VIEW SAMPLE · NEW TODAY", title "Food Svc Distribution · MN", sub "The strongest source this week — tap to see why."
3. **Featured tap card** — full-bleed pursue gradient hero (same recipe as Today's hero) showing the top new pick: verdict pill + name + 2-line note + fit score + bottom row of mini-stats (SDE, multiple, listings).
4. **Section: IN REVIEW** — eyebrow "PIPELINE · IN REVIEW", title "6 deals you've opened". Grid (1-column on phone) of 6 reviewed-deal rows. Each row mirrors the Today PipelineRow but adds a small verdict pill in the avatar slot.
5. **Section: YULIA IS WATCHING** — eyebrow "WATCHING", title "Yulia is watching ›", sub "Sample sources Yulia revisits weekly — yours go here."
6. **Watch sources list** — `.as-card`, 4 source rows (BizBuySell, DealStream, Axial, Sunbelt). Each row: letter-avatar circle (32×32 colored disc) + source name + "updated 2h ago" + count chip on the right.
7. Bottom spacer for tab bar.

---

## 3. Brief screen

**Tab label:** Brief. Bottom tab icon: paper page with text lines.

Long-form daily brief — designed to read like a small newsletter:

1. **TopBar** with title "Brief".
2. **Date eyebrow** + **headline H1** (display 800, 28px) — "Friday, March 27" / "3 picks worth your time today."
3. **Dek** — 16px Inter, ink-2, max ~10em width, line-height 1.55. 2–3 sentences setting the day.
4. **Pick 1 / Pick 2 / Pick 3** — each is a stacked block:
   - Eyebrow ("PICK 01 · PURSUE", mono accent-ink)
   - Display H3 (22px 700) — deal name
   - 1-line stat strip (SDE / asking / multiple / fit) in a soft mono row
   - Body paragraph (15px Inter, ink, 1.55 line height) — Yulia's thesis
   - Footer row: small chips ("Recast", "Comps", "Memo") + "Open deal →" pill on the right
5. **Footer card** — "What I'm watching tomorrow" teaser.

---

## 4. Deal detail screen

**Pattern:** App Store app detail page.

Top → bottom:

1. **Glass back-bar** (44px tall) sticky on top: 14px chevron-back left, deal name (centered, 17px display 700), share icon right.
2. **App-Store-style icon strip** (24px above + 24px below):
   - 88×88 `YIcon` square gradient (pursue/watch/pass tinted) on the left.
   - Title block (display 700, 22px) + subtitle (15px ink-2) + verdict pill on the right.
3. **Stats strip** — 4-column row, separated by hairline dividers, each column shows: mono datapoint (15px 700) over caption (10.5px 600 ink-3, uppercase). Examples: $1.80M SDE / 4.2× / 92 FIT / TX.
4. **CTA row** — "Get"-style pill ("Open in Yulia") + small download icon button + small share button. Sticky-ish below the stats.
5. **What's new card** — eyebrow "WHAT'S NEW" / version label / 3-bullet list of recent Yulia activity ("Recast updated 2h ago", "LOI v3 drafted", "Comps refreshed").
6. **Closer look** — narrative paragraphs (Yulia's thesis), with mini chips at the end ("Recast", "Comps", "DSCR") that act as inline tab links.
7. **Recast P&L mini-table** — 5 rows (Revenue / -COGS / Gross / -OpEx / SDE), each row: label + mono $ figure right-aligned. Bold the SDE row.
8. **Ratings card** — 5-criterion rating block (Margins, Concentration, Capex, Owner-Out, Multiple), each with a 5-dot scale.

---

## 5. Today (Liquid Glass v2)

Same content as Today, with three chrome swaps:

1. **GlassTopBar** replaces TopBar — sticky translucent bar at the very top (44px status bar inset + 8/12 padding), with bottom-edge `mask-image: linear-gradient(to bottom, black 80%, transparent 100%)` so content scrolls *under* the bar with a soft fade.
2. **LargeTitle** — separate large H1 (34px 800) sits below the glass bar. Standard iOS pattern: title is large at scroll-top, collapses into the centered bar title on scroll.
3. **TabBar2** — same layout as TabBar, but the capsule is built from `GlassSurface` with `tint="chrome"`:
   - bg `rgba(255,255,255,0.62)`
   - filter `blur(40px) saturate(180%) brightness(1.06)`
   - inner edge `inset 0 0 0 0.5px rgba(255,255,255,0.75), inset 0 1px 0 rgba(255,255,255,0.55)`
   - shadow `0 1px 0 rgba(0,0,0,0.04), 0 10px 30px -8px rgba(0,0,0,0.14)`

In SwiftUI, the equivalent recipe: `.background(.ultraThinMaterial)` + `.toolbar { ToolbarItem(...) }` with `.scrollEdgeEffect(.disabled)` for the under-bar fade. iOS 26 native materials match the look.

---

## Components

### Standard (`mobile-primitives.jsx`)

- `Icon` — outline SVG icon set (chat, search, back, share, close, download, chevron, star, arrowUp, today, pipeline, brief). Stroke-based, all 14–22px.
- `YIcon({ size, kind })` — square rounded gradient avatar with white "Y". `kind` ∈ default / pursue / watch / pass / cool. Used everywhere as Yulia's mark and as deal-card avatars.
- `TabBar({ active, onChange })` — floating capsule + adjacent FAB (described above).
- `TopBar({ title })` — 54px top padding, large H1, search circle, JM avatar circle.
- `VerdictPill({ kind, onLight })` — small mono pill (PURSUE / WATCH / PASS) with pulsing dot.
- `Sparkline({ values, w, h, c })` — inline SVG polyline, 1.6px stroke, no fill.

### Glass / v2 (`glass-primitives.jsx`)

- `GlassSurface({ children, radius, tint, style })` — multi-layer iOS 26 glass primitive. Tints: `light` / `chrome` / `dark` / `onColor`. **Use this anywhere you need glass** — its recipe is the source of truth.
- `TabBar2` — glass version of TabBar (uses `GlassSurface` chrome tint).
- `GlassTopBar({ title, showBack, onBack })` — sticky translucent top bar with the masked bottom edge.
- `LargeTitle({ children })` — 34px display title, padding `8px 22px 12px`.
- `Icon2`, `YIcon2`, `VerdictPill2`, `Sparkline2` — duplicates of the standard icons/components, same recipes.

### Screen exports

- `screen-today.jsx` exports `TodayScreen`, `BriefScreen`, `HeroCard`, `PipelineRow`, `TryThisCard`, `TryRow` (all attached to `window`).
- `screen-today-glass.jsx` exports `TodayScreen2`.
- `screen-pipeline.jsx` exports `PipelineScreen`.
- `screen-detail.jsx` exports `DetailScreen`.
- `mobile-primitives.jsx` and `glass-primitives.jsx` attach all of their exports to `window`.

### Frame / canvas (prototype only)

- `IOSDevice` (`ios-frame.jsx`) — pixel-perfect iPhone bezel + status bar + home indicator. **Do not port** — you're building the screen, not the bezel.
- `DesignCanvas`, `DCSection`, `DCArtboard` (`design-canvas.jsx`) — pan/zoom canvas wrapping the artboards. **Do not port.**

---

## Interactions & Behavior

### Navigation
- Bottom tab bar — 3 tabs (Today / Pipeline / Brief). Tapping switches root view; preserves per-tab scroll position (standard iOS).
- Cells in any list (PipelineRow, watching source, brief pick, etc.) — push the deal-detail screen.
- Detail screen back button — pop.
- Floating circular chat FAB (next to the tab bar) — opens **Yulia composer sheet** (full-screen modal sheet with large textarea, send, voice input). Not in the prototype's screens but the FAB is wired in to all 4 main views.

### Scroll
- Standard iOS behavior: large title at scroll-top collapses into the bar title at top after ~30px of scroll. The glass top bar variant relies on `mask-image` to fade content under the bar.
- The bottom tab bar **never hides** — content scrolls under it, the 120px bottom spacer in each screen prevents content from being trapped behind it.

### Animations
- `.fade-up` (defined in `mobile-styles.css`) — 480ms `cubic-bezier(0.2,0.7,0.2,1)`, opacity 0→1 + translateY 8px→0. Apply to cards as they appear on first render.
- `.slide-up` — 380ms slide from below; used for sheet presentations.
- `.tap` — 120ms opacity transition; opacity drops to 0.6 on `:active`. Apply to every tappable card/row for press feedback. (In SwiftUI / native, this is automatic via `Button` style.)
- `.pulse-dot` — 2s ease-out infinite ring pulse on the verdict pill dot.

### Pull-to-refresh
Not in the prototype but expected on Today and Pipeline. Refresh action: re-fetch the daily brief / pipeline state.

---

## Design Tokens

All defined in `:root` in `mobile-styles.css`. Translate directly into your token system (SwiftUI `Color` extensions, Tailwind theme, etc.).

### Surfaces
| Token | Hex | Usage |
|---|---|---|
| `--bg` | `#FFFFFF` | Card backgrounds (white). |
| `--bg-2` | `#F5F5F7` | Background under cards (App-Store grey). |
| `--card` | `#FFFFFF` | Card. |
| `--card-2` | `#F2F2F7` | Tinted card variant. |

### Ink
| Token | Hex | Usage |
|---|---|---|
| `--ink` / `--ink-1` | `#1A2233` | Primary text. |
| `--ink-2` | `#555E6F` | Secondary text. |
| `--ink-3` | `#7A8395` | Tertiary / metadata. |
| `--ink-4` | `#A6AEBC` | Disabled / placeholder. |
| `--ink-5` | `#C5CBD6` | Subtle / divider-ish. |
| `--line` | `rgba(60,60,67,0.16)` | iOS standard divider. |
| `--line-2` | `rgba(60,60,67,0.08)` | Soft divider inside cards. |

### Brand — soft periwinkle accent (matches desktop's primary)
| Token | Hex | Usage |
|---|---|---|
| `--accent` | `#8A9AE8` | Primary accent. |
| `--accent-2` | `#6F82DC` | Stronger primary. |
| `--accent-ink` | `#4F60BD` | Accent text on light. |
| `--accent-soft` | `#EEF1FB` | Accent-tinted surfaces. |

### iOS blue — softened to powder
| Token | Hex | Usage |
|---|---|---|
| `--blue` | `#7FA8D9` | Powder iOS blue. |
| `--blue-ink` | `#4A7AB0` | Blue text (Get pills). |
| `--blue-soft` | `#EAF0FA` | Get-pill background. |

### Hero gradients (pastel two-tone) — **the primary brand signal**
| Variant | From | To |
|---|---|---|
| Pursue | `#A8D4BD` | `#5FA88A` |
| Watch | `#EBC891` | `#C99959` |
| Pass | `#EBB1AA` | `#C6857D` |

Used on: full-bleed welcome hero, deal-detail icon background, featured pipeline card. Always a `155deg` linear gradient with a top-right radial highlight overlay.

### Verdict semantics
| Token | Hex |
|---|---|
| `--verdict-pursue` | `#6FB89A` |
| `--verdict-pursue-ink` | `#3F8A6A` |
| `--verdict-pursue-soft` | `#E6F3EC` |
| `--warn` | `#D6A35C` |
| `--warn-ink` | `#9C7128` |
| `--warn-soft` | `#FAF1E1` |
| `--danger` | `#D88B84` |
| `--danger-ink` | `#A85248` |
| `--danger-soft` | `#FBEAE7` |

### Typography
- `--font-display`: SF Pro Display (or Inter Tight on web fallback).
- `--font-body`: SF Pro Text (or Inter on web fallback).
- `--font-mono`: SF Mono (or JetBrains Mono on web fallback). All datapoints, eyebrows, and dates use mono with `font-variant-numeric: tabular-nums`.

Type scale:
| Use | Family | Size | Weight | Letter-spacing | Line-height |
|---|---|---|---|---|---|
| Large title | Display | 34px | 800 | -1px | 1.05 |
| Hero H2 | Display | 28px | 800 | -0.5px | 1.05 |
| Brief H1 | Display | 28px | 800 | -0.5px | 1.1 |
| Section title | Display | 26px | 700 | -0.5px | 1.1 |
| Pick title H3 | Display | 22px | 700 | -0.4px | 1.2 |
| Card title | Display | 15–17px | 600–700 | -0.2 to -0.3px | 1.3 |
| Body | Body | 14.5–15px | 400 | – | 1.45–1.55 |
| Sub / caption | Body | 13px | 400 | – | 1.4 |
| Small | Body | 11–12px | 500 | – | 1.4 |
| Eyebrow (mono) | Mono | 10.5–11px | 600–700 | 0.06–0.1em | – |
| Datapoint (mono) | Mono | 11–15px | 600–700 | – | – |

### Spacing scale
4-base: 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 40, 56, 88, 120.

Common patterns:
- Screen horizontal padding: 16 (cards) / 22 (text).
- Card inner padding: 14×18 (rows), 16×18 / 18×22 (cards), 22×24 (heroes).
- Section bottom spacing: 24–32.
- Bottom safe-area spacer for floating tab bar: **120px**.

### Radii
- Buttons / pills: 999px.
- Cards: 18px (`.as-card`).
- Hero card: 24px.
- Square avatars: `size * 0.225` (so 60→13.5, 88→19.8).
- Bezel-style rounded inner: 48px (frame only).

### Shadows
- Card hover (none on phone, but tap state): N/A.
- Floating tab bar: `0 8px 28px rgba(0,0,0,0.10), inset 0 0 0 0.5px rgba(255,255,255,0.5)`.
- Floating chat FAB: `0 8px 28px rgba(46,92,138,0.32), inset 0 0 0 0.5px rgba(255,255,255,0.18)`.
- Glass chrome (v2): `0 1px 0 rgba(0,0,0,0.04), 0 10px 30px -8px rgba(0,0,0,0.14)` + 0.5px white inner edge.

### Glass recipe — **exact**

Light:
- bg `rgba(255,255,255,0.55)`
- filter `blur(32px) saturate(180%) brightness(1.05)`
- edge `inset 0 0 0 0.5px rgba(255,255,255,0.7), inset 0 1px 0 rgba(255,255,255,0.55)`
- shadow `0 1px 3px rgba(0,0,0,0.04), 0 8px 24px -6px rgba(0,0,0,0.10)`

Chrome (top bar, tab bar):
- bg `rgba(255,255,255,0.62)`
- filter `blur(40px) saturate(180%) brightness(1.06)`
- edge `inset 0 0 0 0.5px rgba(255,255,255,0.75), inset 0 1px 0 rgba(255,255,255,0.55)`

Dark (modal sheets in dark mode):
- bg `rgba(28,28,32,0.62)`
- filter `blur(40px) saturate(180%) brightness(0.92)`
- edge `inset 0 0 0 0.5px rgba(255,255,255,0.18), inset 0 1px 0 rgba(255,255,255,0.10)`

OnColor (glass cells inside a colored hero):
- bg `rgba(255,255,255,0.18)`
- filter `blur(20px) saturate(180%) brightness(1.10)`
- edge `inset 0 0 0 0.5px rgba(255,255,255,0.32), inset 0 1px 0 rgba(255,255,255,0.22)`

In SwiftUI: `.regularMaterial` matches "chrome" closely; use `.thinMaterial` for "light"; `.ultraThickMaterial` for "dark"; for "onColor" overlay a `Color.white.opacity(0.18)` and a `.thinMaterial`.

---

## Sample Content / Copy (verbatim)

Keep the **tone** — direct, data-honest, founder-voice — when wiring real data.

### Welcome hero
- Eyebrow: "WELCOME TO SMBX · WORKING SAMPLE"
- H2: "Agentic AI built for buying and selling businesses."
- Tag: "Yulia does the hard work — sourcing, recasts, drafts. You bring the judgment."
- CTA: "Start" · meta "FREE · 3 SAMPLE DEALS"

### Try This card (logged-out only)
- Eyebrow: "TRY THIS"
- Title: "Three ways to explore"
- Row 01: Open a sample deal — "See Yulia's verdict, recast P&L, drafts" — pill "View"
- Row 02: Chat with Yulia — "What's worth my time today?" · ask anything — pill "Chat"
- Row 03: Read the brief — "Today's 3 picks · 10 min read" — pill "Read"

### Pipeline (sample 5)
1. Industrial Svc · TX — "$1.80M SDE · honest capex story" — 92 FIT (pursue)
2. Pest Control · FL — "92% on monthly contracts" — 84 FIT (pursue)
3. Electrical · TX — "Margins good · concentration risk" — 78 FIT (watch)
4. HVAC platform · CO — "Family business · clean financials" — 74 FIT (watch)
5. Distribution · OH — "Asking high · margins thin" — 61 FIT (pass)

### Pipeline section eyebrows
- "VIEW SAMPLE · IN PIPELINE" / "5 deals Yulia is working" / "Tap any to see what Yulia delivered"
- "VIEW SAMPLE · NEW TODAY" / "Food Svc Distribution · MN" / "The strongest source this week — tap to see why."
- "WATCHING" / "Yulia is watching ›" / "Sample sources Yulia revisits weekly — yours go here."

### Brief
- Date: "Friday, March 27"
- Headline: "3 picks worth your time today."
- Pick 01 PURSUE — Industrial Svc · TX
- Pick 02 PURSUE — Pest Control · FL
- Pick 03 WATCH — Electrical · TX

---

## State Management

The mobile app keeps minimal local state. Real-app expectations:

- **Auth** — logged-out vs logged-in switches the Today hero copy + adds the "TRY THIS" guide card. All other screens render the same regardless of auth.
- **Active tab** — bottom-tab nav state (URL-syncable in React Native, `TabView` selection in SwiftUI).
- **Navigation stack** — push/pop for deal-detail and any modal sheets. Standard iOS nav stack per tab.
- **Brief content** — fetched once daily, cached for offline read.
- **Pipeline state** — paginated list, refreshed via pull-to-refresh.
- **Chat sheet** — modal sheet with its own composer state; tied to a global Yulia thread (synced with desktop chat).
- **Persistence** — sidebar pin / last-active-tab to user prefs; deal scroll position to in-memory cache.

---

## Assets

The prototype uses **inline SVG icons only** (defined in `Icon` / `Icon2`). Recreate the same outline style at the same sizes — they're tuned for iOS bottom-bar density. Lucide outline is the closest off-the-shelf match.

No image assets — Yulia avatars are CSS gradients (`YIcon`), JM avatar is a CSS gradient, source avatars are colored letter discs. Production may swap any of these for real photos / logos; size them at the same dimensions.

Fonts: SF Pro Display / SF Pro Text / SF Mono are system defaults on iOS. On the web prototype these fall back to Inter Tight / Inter / JetBrains Mono.

---

## What's NOT in this design (deliberate gaps)

1. **Push notification design** — daily brief push (8am) is implied but not mocked. Standard iOS rich notification with the deal name + verdict pill recommended.
2. **Yulia chat sheet** — the FAB is wired in but the modal sheet (composer + thread + voice input) is not in this bundle. Use the desktop chat as the visual reference and adapt to a phone modal sheet.
3. **Pull-to-refresh state** — gesture is expected; no custom indicator designed (use system).
4. **Empty / loading / error states** — prototype renders sample data unconditionally.
5. **Onboarding / sign-in flow** — first-run welcome is implied but not designed (the in-app "WORKING SAMPLE" framing is the soft onboarding).
6. **Settings screen** — accessed via the JM avatar circle; not designed.
7. **Deep deal screens** — recast P&L, comps, valuation, doc viewer, draft editor: handed off to desktop. Mobile shows a summary on the deal detail page and a "Open on desktop →" link for the heavy editors.
8. **Dark mode** — only light is designed. Tokens are organized so a dark variant can be added with paired hex values.
9. **Accessibility passes** — semantics are reasonable but no formal a11y review. Add Dynamic Type support, VoiceOver labels for icon-only buttons, focus-order checks.
10. **iPad layout** — phone-only.

---

## Files in this bundle

| File | Purpose |
|---|---|
| `Mobile iOS.html` | Entry-point. Loads React + Babel + scripts, mounts `<App/>` inside a `DesignCanvas` with 5 artboards. |
| `mobile-styles.css` | Tokens (`:root`) + utility classes (`as-card`, `get-pill`, `verdict-pill`, `eyebrow`, `section-title`, `tap`, `mono`, animations). Read first. |
| `ios-frame.jsx` | Prototype-only iPhone bezel + status bar + home indicator. Do not port. |
| `design-canvas.jsx` | Prototype-only pan/zoom canvas (`DesignCanvas`, `DCSection`, `DCArtboard`). Do not port. |
| `mobile-primitives.jsx` | Standard chrome: `Icon`, `YIcon`, `TabBar`, `TopBar`, `VerdictPill`, `Sparkline`. |
| `glass-primitives.jsx` | iOS 26 glass chrome: `GlassSurface`, `TabBar2`, `GlassTopBar`, `LargeTitle`, `Icon2`, `YIcon2`, `VerdictPill2`, `Sparkline2`. |
| `screen-today.jsx` | Today screen + Brief screen + sub-components (`HeroCard`, `PipelineRow`, `TryThisCard`, `TryRow`). |
| `screen-today-glass.jsx` | Today screen wrapped in glass chrome (`TodayScreen2`). |
| `screen-pipeline.jsx` | Pipeline screen. |
| `screen-detail.jsx` | Deal detail screen. |

### Loading order (in `Mobile iOS.html`)
1. React + ReactDOM + Babel
2. `ios-frame.jsx` (defines IOSDevice)
3. `design-canvas.jsx` (prototype shell)
4. `mobile-primitives.jsx` (defines Icon, YIcon, TabBar, TopBar, VerdictPill — used by screens)
5. `glass-primitives.jsx` (defines GlassSurface, TabBar2, GlassTopBar, LargeTitle, etc.)
6. `screen-today.jsx`
7. `screen-today-glass.jsx`
8. `screen-detail.jsx`
9. `screen-pipeline.jsx`
10. Inline `<App/>` mount.

In production, this becomes either a SwiftUI module graph or a normal RN bundle — no Babel-in-browser.

---

## Recommended implementation path (SwiftUI)

1. **Tokens first.** Translate `:root` from `mobile-styles.css` into a `ThemeColors`/`ThemeFonts` extension on `Color`/`Font`. Verify the pastel hero gradients render correctly.
2. **Build the tab shell.** `TabView` with 3 tabs (Today / Pipeline / Brief). Implement the floating glass tab bar — either custom (overlay + `.regularMaterial` background) or via a hidden `TabView` + custom bar. Add the floating chat FAB as an overlay button.
3. **Build the standard chrome.** `LargeTitle`, top bar buttons, the `.scrollEdgeEffect` / scroll-aware title collapse.
4. **Implement the hero card.** Get the gradient + radial highlight + eyebrow/H2/tag/CTA composition pixel-perfect. This is the hardest visual element — once it's right, everything else slots in.
5. **Implement Today end-to-end** (welcome hero + TryThis + pipeline list + brief teaser). Validates row patterns and section eyebrows.
6. **Implement Pipeline + Brief + Detail** — they reuse the same primitives.
7. **Add the glass v2 chrome variant** (or just commit to glass — production can pick one).
8. **Wire data, push notifications, chat sheet, persistence.**
9. **A11y + Dynamic Type pass.**

Reach out with questions — happy to clarify any pixel-level decision or copy choice. The companion **desktop bundle** documents the chat-first web workspace and shares the same design tokens (slate-blue accent, mint-sage pursue, etc.) so brand consistency is automatic if you build them in lockstep.
