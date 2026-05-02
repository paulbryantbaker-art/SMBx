# Handoff: SMBX Desktop Workspace (V6)

## Overview

SMBX is an agentic AI workspace built specifically for buying and selling small/mid-market businesses. The product centres on **Yulia**, a chat-first AI agent who runs the deal loop end-to-end: sourcing deals, drafting docs, running valuation analysis, and surfacing market intelligence.

This handoff covers the **logged-out / public sample** of the desktop web app — the marketing surface that doubles as a working demo. A first-time visitor lands directly inside the app, can interact with sample data (Yulia's picks, sample deals, sample analyses), can read about the product (How it works, Pricing) without leaving the workspace, and is invited to start chatting with Yulia for free.

When a user logs in, the **same shell** continues to host their real workspace; the only delta is that the hero "Welcome / Sample" copy is replaced by the daily "Today" brief with their actual picks.

---

## About the Design Files

The files in this bundle are **HTML/JSX design references** — high-fidelity prototypes built with React + inline Babel for fast iteration. They are **not** production code to copy directly.

The intent is for the developer to **recreate this design in their target codebase**, using its existing patterns and libraries (React + Tailwind, Next.js, SwiftUI, etc.). The HTML mocks document the **intended look and behavior** — exact colors, typography, spacing, layout, interactions, and content. The developer should:

1. Read this README end-to-end first.
2. Open `V6 Files Workspace.html` in a browser to see the live prototype.
3. Reference the `.jsx` files for component structure and exact pixel values.
4. Implement using the codebase's idioms (e.g. translate the inline-styles approach in the prototype into the codebase's component library or styling solution).

If the codebase has no established framework yet, **React + a CSS-in-JS or Tailwind solution is the natural fit** — the design system is small enough to express as a tokens file plus ~20 components.

---

## Fidelity

**High-fidelity.** Every color, font size, spacing value, border-radius, and shadow is final. Recreate pixel-perfectly. The only intentional looseness is in *content* — the deal names, document text, analysis numbers, etc. are sample copy and will be replaced by real data on the live product.

---

## Layout — Three-Column Shell

The desktop workspace is a fixed three-column shell that fills the viewport (no inner page scroll on the body itself; each column scrolls independently).

```
┌──────────┬───────────────────────┬───────────────────────────────────────────┐
│          │                       │  ┌─ Tab strip ─────────────────────────┐  │
│ Sidebar  │  Chat (Yulia)         │  │ [×] Sample Business Search · ⊕      │  │
│ (rail)   │                       │  ├─────────────────────────────────────┤  │
│          │                       │  │                                     │  │
│ 56px     │  400px (resizable)    │  │  Canvas — tab content                │  │
│ collapsed│  drag handle on right │  │  (welcome hero, deal view, doc       │  │
│ 260px    │  edge to resize       │  │  editor, analysis, learn page…)      │  │
│ expanded │                       │  │                                     │  │
│          │                       │  │  flex: 1                            │  │
│          │                       │  │                                     │  │
└──────────┴───────────────────────┴───────────────────────────────────────────┘
```

### Column 1 — Sidebar (rail)

- Width: **56px collapsed (default)**, **260px expanded**, animates `width 180ms ease`.
- Expands on hover; click the chevron in the account chip to **pin** it open.
- Background: `--m-surface-1` (`#ECEAF2`, cool lavender).
- Border-right: `1px solid --m-outline-var`.
- Contents top → bottom:
  - **Account chip** — 32×32 avatar (initials "YS"), name "Yulia Sun", subtitle "Apex SMB Holdings", chevron toggle for pin. When collapsed, shows only the avatar centred.
  - **Search trigger** — pill button "Search · ⌘K". Clicking expands the rail and replaces the modes list with a search pane (input + grouped results: Deals, Docs, Analyses).
  - **Workspace modes list** (5 items): Business Search, Docs, Analysis, Market Intelligence, Library. Each has an icon + label + count chip on the right. Active mode uses `--m-primary-container` background. When collapsed, shows icons only with native `title` tooltips.
  - **Footer** — Recent activity + Settings buttons.

### Column 2 — Chat well (Yulia)

- Width: **400px default**, resizable 320–640px via drag handle (6px wide vertical strip on the right edge).
- Background: `--m-surface` (`#F8F8FA`, slightly off-white).
- Header (56px tall): Yulia avatar (28×28, slate-blue tint) + "Yulia" name + small mono caption "SAMPLE · {MODE NAME}". Right side: History / Share text buttons.
- Body: scrolling thread or empty state.
- Composer (sticky at bottom):
  - White card with `--m-outline-var` border, 14px border-radius, 10px padding, 12px margin.
  - Textarea inside (transparent background, no border, 13px font).
  - Footer row: monospace hint "↵ send · ⇧↵ newline · / commands" on left; **circular slate-blue Send FAB** on right (36×36, 12px radius, paper-plane SVG, disabled state when textarea empty).

### Column 3 — Canvas (tab workspace)

- Background: `--m-bg` (`#F1F1F4`, light cool grey).
- Tab strip at top (38px tall, `--m-surface-1` lavender background) — browser-style tabs with icon + label + close. Active tab "lifts" by matching the canvas background and using bold weight. New-tab button (`+`) on the right.
- Body: scrolling content area, padding `28px 40px 56px`, **no max-width** — the layout uses `repeat(auto-fill, minmax(...))` grids so cards reflow into more columns at larger viewports (this is intentional: maximizing the window shows *more content*, not bigger content).

---

## Screens / Views

There are six tab content types. Tabs are owned by the App and shared across modes; switching modes activates that mode's "root" tab.

### 1. Welcome / Sample Business Search root (`mode-root`, modeId="search")

**Tab label:** "Sample Business Search" (logged-out). Logged-in: "Today".

The default view a visitor sees. Top to bottom:

1. **Welcome hero card** — full-width elevated card.
   - Background: linear-gradient 135° from `#2E5C8A` (slate) to `#1A3D63` (dark slate).
   - White text. Decorative radial glow at top-right (white 20% → transparent, 380×380, offset -120/-100).
   - Eyebrow (mono, 10px, white 85%, letter-spacing 0.14em): "WELCOME TO SMBX · WORKING SAMPLE"
   - Date (top-right): "Friday, March 27"
   - **H1** (Inter Tight 800, 38px, line-height 1.05, letter-spacing -0.03em, max-width 760px, text-wrap: balance):
     > Agentic AI specifically built for buying and selling businesses of all shapes and sizes.
   - **Tag** (Inter 400, 14.5px, white 88%, max-width 620px):
     > Yulia does all of the hard work — so your deal team can focus on building relationships and making deals better and faster.
   - Sub-eyebrow row (mono, 10px, white 70%): "YULIA'S PICKS · TODAY · 5 DEALS · 14 MIN READ" with right-aligned "↓ tap any to open".
   - **Picks list** — 5 rows in a translucent inner card (`rgba(255,255,255,0.14)`, 14px radius). Each row is a 4-col grid `32px 1.4fr 2.4fr 60px`: rank number / deal name / one-line note / fit score with "FIT" caption. Bottom border `1px solid rgba(255,255,255,0.1)` between rows.
   - The whole hero card is clickable → opens the top deal ("Industrial Svc · TX") in a new tab.

2. **In review** section (eyebrow "PIPELINE · 6 IN REVIEW") — grid of 6 deal cards (`auto-fill, minmax(280px, 1fr)`, 14px gap). Each card: verdict pill (PURSUE/WATCH/PASS), deal name + subtitle, fit score, SDE, multiple, one-line summary. Card click → opens deal view.

3. **Yulia is watching** section — 2-col `auto-fill, minmax(360px, 1fr)` of two list cards, each containing 3 watch sources (BizBuySell, DealStream, etc.) with letter avatar, source name + update time, and count chip.

4. **Recently closed** section — `auto-fill, minmax(220px, 1fr)` grid of small filled-tonal cards (4 reference deals: date eyebrow, name, "Closed at $X · multiple").

### 2. Docs root (`mode-root`, modeId="docs")

- Eyebrow "QUICK" — **Start from a template** — `auto-fill, minmax(150px, 1fr)` grid of 6 template cards, each centered, with an emoji-icon (placeholder) and template name (LOI, NDA, IOI, Memo, Diligence Checklist, Term Sheet).
- Eyebrow "RECENT" — **Recently edited** — `auto-fill, minmax(280px, 1fr)` grid of 3 doc cards.
- Eyebrow "FOLDERS" — **By deal** — `auto-fill, minmax(240px, 1fr)` grid of 4 folder cards.

### 3. Analysis root (`mode-root`, modeId="analysis")

- Eyebrow "TOOLS" — **What can I run** — `auto-fill, minmax(280px, 1fr)` grid of 6 tool cards (Recast, Comps, Valuation, DSCR, QoE, Sensitivity). Each: 36×36 colored icon swatch + name + one-line description.
- Eyebrow "RECENT" — **Recently run** — list card with 5 rows in a `32px 2fr 2fr 80px 80px` grid (icon / title / sub / date / status).

### 4. Market Intelligence root (`mode-root`, modeId="intel")

- **Featured insight** — full-width tap card with a soft slate-tinted gradient (`linear-gradient(135deg, #DCE7F3 0%, #B8CCE3 100%)`), padding 32×36, shows feed item title + summary.
- Eyebrow "SECTORS YOU WATCH" — **Activity this week** — `auto-fill, minmax(160px, 1fr)` grid of 5 sector cards.
- Eyebrow "FEED" — list card with 5 feed item rows.

### 5. Library root (`mode-root`, modeId="library")

- Filter chips row (All, Deals, Docs, Memos, Notes — segmented).
- List of library items (5 rows in a `32px 2fr 1.4fr 100px 24px` grid: icon / name / sub / date / chevron).

### 6. Deal view (`deal`)

Opened by clicking a deal card. Layout: 2-pane, max-width 1180.

- **Left rail (numbers)** — fixed-width column with verdict header, key metrics (SDE, Asking, Multiple, Fit Score), recast P&L flow rows (Revenue / -COGS / Gross / -OpEx / SDE), DSCR card.
- **Right pane (narrative)** — eyebrow + heading + paragraphs of Yulia's thesis, sourcing notes, risks. Clickable mini-cards link to docs (LOI v3, NDA, etc.) and analyses (Recast, Comps).

### 7. Doc view (`doc`)

Two-column: 1fr (editor) + 280px (comment rail). Max-width 1180. Editor is a tall white card with body copy; rail shows Yulia's inline comments tied to specific paragraphs.

### 8. Analysis view (`analysis`)

Sliders + live-computed output cards. Sliders for Multiple, SDE, Down Payment %, Interest Rate. Cards: Purchase Price, Annual Debt Service, DSCR (color-flips between pursue/watch/pass thresholds), Cash Flow After Debt.

### 9. Learn view (`learn`)

Opens when an "About SMBX" pill is clicked from the chat. One tab; two sub-tabs inside it ("How it works" / "Pricing").

**Hero header** (`linear-gradient(135deg, #DCE7F3 0%, #ECEFF6 100%)`, 18px radius, 32×36 padding, slate-tinted radial glow):
- Eyebrow: "ABOUT SMBX · YULIA"
- H1: "The chat-first M&A workspace built for solo searchers." (Inter Tight 800, 38px)
- Tag: "Yulia surfaces the right deals, drafts the docs, and runs the math — so you can focus on judgment, not busy-work."

**Sub-nav** — "How it works" / "Pricing" with primary-color underline on active.

**How it works tab:**
- Eyebrow "THE LOOP" — 3-col card grid: 01 Yulia surfaces deals / 02 You read, ask, recast / 03 Drafts that close. Each card: number, title, body, mode chip.
- Eyebrow "CAPABILITIES" — 3×2 filled-tonal grid (Recast, Comps, Valuation, QoE, Buyer Fit, Drafting).
- Eyebrow "WHY" — 2-col layout: paragraph card + stats card (10× / 2 hrs / $0).
- Eyebrow "FAQ" — list card with 5 expandable rows (click to open, +/× toggle icon).

**Pricing tab:**
- Monthly/Annual segmented toggle (centered).
- 3-col plan grid: Starter ($49 / $39), Operator ($199 / $159, "MOST POPULAR" pill, primary border), Fund ($599 / $479).
- Eyebrow "DETAILS" — full feature comparison table (4-col grid, no scroll).
- Eyebrow "GUARANTEE" — money-back CTA card.

---

## Components

### Material-3-style primitives (defined in `v6-styles.css`)

- `.m-card` — white card with 14px radius, 1px outline-var border. Modifier `.elevated` (no border, soft shadow). Modifier `.filled-tonal` (warm tinted background, no border). Modifier `.tap` (cursor pointer, lift + shadow on hover).
- `.m-btn` — pill button, 36px height, 14px h-padding. Variants: `.filled` (primary), `.tonal` (primary-container), `.outlined` (1px outline border), `.text` (no background).
- `.m-fab` — 36×36 12px-radius square, primary background, white icon. Used for the chat send button.
- `.m-state` — applies hover state-layer (4% black) + active (8% black). Add to interactive elements.
- `.mode-item` — sidebar row primitive. Active state uses primary-container background.
- `.tab` — browser-style tab. Active tab uses canvas background (lifts visually).
- `.m-input`, `.m-slider` — form controls with primary focus rings.

### Custom components (in `.jsx` files)

- `V6Sidebar` (v6-shell.jsx) — collapsible rail with hover expansion, search pane.
- `V6Icon` (v6-shell.jsx) — inline SVG icon set. **Do not use an icon font or external library** — these are tuned 14×14 strokes specific to the design. Names: search, doc, chart, feed, library, settings, history, plus, close, pin, back, deal.
- `V6Chat`, `V6ChatEmpty`, `V6Msg` (v6-canvas.jsx) — chat well.
- `V6Canvas`, `V6TabStrip`, `V6Tab` (v6-canvas.jsx) — tabbed canvas surface.
- `V6SearchRoot`, `V6DocsRoot`, `V6AnalysisRoot`, `V6IntelRoot`, `V6LibraryRoot` (v6-modes.jsx) — five mode home screens.
- `V6DealView`, `V6DocView`, `V6AnalysisView`, `V6Slider`, `V6OutputCard`, `V6FlowRow` (v6-views.jsx) — deep views.
- `V6LearnView`, `V6HowSection`, `V6PricingSection`, `V6FaqRow` (v6-learn.jsx) — How it works + Pricing tab.

---

## Interactions & Behavior

### Sidebar
- Hover → expand from 56px to 260px (180ms ease).
- Click chevron in account chip → toggle pinned state (rail stays expanded after mouse-out).
- Click search trigger → expand rail, replace modes list with search pane, autofocus input. Esc → close, restore modes list.
- Click mode → switch active mode, ensure that mode's root tab exists, activate it. Search pane closes.

### Tabs
- Click tab → activate it (same as opening a file in a browser).
- Click × on tab → close. If active tab closed, fall back to nearest neighbor.
- Pinned tabs (mode roots) — no close button shown; cannot be closed.
- New tab button → no-op in prototype; in real app should open a "new" picker.

### Chat
- Empty state shows logged-out welcome + search-idea chips (mode-aware) + filled "About SMBX" indigo pills.
- "About SMBX" chip → opens the Learn tab (or activates if it already exists), passing a `section` prop to deep-link to How / Pricing.
- Other chips → fill the textarea and send (simulated).
- Composer: ↵ sends, ⇧↵ newline. Send button disabled when input empty.
- After send: user message appears in thread; after 600ms a Yulia stub reply ("On it. Watch the canvas — I'll fill it in as I go.") appears. **Replace this stub with real LLM streaming in production.**
- Resizing chat well: drag the 6px vertical handle on its right edge. Persists per-session.

### Cards / lists
- Cards with `.tap` class lift by 1px and gain `--m-elev-3` shadow on hover.
- Deal card click → `openTab({ kind: "deal", title, id })`.
- Doc / template card click → `openTab({ kind: "doc", title, id, template })`.
- Tool card click → `openTab({ kind: "analysis", title, tool })`.

### Animations
- All entry: `fadeUp` keyframe — opacity 0→1, translateY 6px→0, 280ms `cubic-bezier(0.2, 0, 0, 1)`. Apply via `.fade-up` class.
- State layer transitions: `background 120ms ease`.
- Card lift: `box-shadow 160ms`, `transform 120ms`.
- Sidebar width: `width 180ms ease`.

---

## State Management

The app keeps minimal local state in the root `V6App`:

```jsx
// Mode + sidebar
const [activeMode, setActiveMode] = useState("search");
const [searchOpen, setSearchOpen] = useState(false);

// Tabs
const [tabs, setTabs] = useState([{ id: "search-root", kind: "mode-root", modeId: "search", title: "Sample Business Search", pinned: true }]);
const [activeTabId, setActiveTabId] = useState("search-root");

// Chat
const [thread, setThread] = useState([]);
const [draft, setDraft] = useState("");
const [chatWidth, setChatWidth] = useState(400); // resizable

// Logged-in / logged-out — not yet wired in prototype but implied:
// const [user, setUser] = useState(null);  // null = logged out (welcome view)
```

In a real codebase:
- Tabs and active tab → URL-syncable state (each tab has a route, e.g. `/workspace/deal/industrial-svc-tx`).
- Chat thread → backed by streaming LLM endpoint with persistent server history.
- Deal/doc/analysis content → fetched from API on tab open, with loading + error states (the prototype shows none).
- `chatWidth` and `pinned` (sidebar) → persisted to `localStorage`.

---

## Design Tokens

All tokens are defined as CSS custom properties at `:root` in `v6-styles.css`. **Translate these directly into your token system** (Tailwind theme, design tokens JSON, CSS modules, etc.).

### Color — 60/30/10 system

The palette deliberately follows the 60/30/10 rule.

#### 60% — Canvas surfaces (light cool grey)
| Token | Hex | Usage |
|---|---|---|
| `--m-bg` | `#F1F1F4` | Canvas background. The dominant surface. |
| `--m-surface` | `#F8F8FA` | Chat well background (slightly lighter). |
| `--m-surface-on-light` | `#FFFFFF` | Cards on canvas. |
| `--m-surface-tinted` | `#ECECF1` | `filled-tonal` card variant — subtle cool tint. |
| `--m-surface-2` | `#E6E6EC` | Secondary tinted surfaces (hover backgrounds, kbd chips). |
| `--m-surface-3` | `#D6D6DE` | Dividers, mid-contrast. |

#### 30% — Chrome (cool lavender)
| Token | Hex | Usage |
|---|---|---|
| `--m-surface-1` | `#ECEAF2` | Sidebar + tab strip background. |
| `--m-surface-container` | `#ECEAF2` | Same — alias. |

#### 10% — Accent (slate blue)
| Token | Hex | Usage |
|---|---|---|
| `--m-primary` | `#2E5C8A` | Primary buttons, FAB, focus rings, slider thumbs, About-SMBX chips, Yulia avatar tint. |
| `--m-on-primary` | `#FFFFFF` | Text on primary. |
| `--m-primary-container` | `#DCE7F3` | Tinted accent surface (active sidebar item, soft hero). |
| `--m-on-primary-container` | `#0F2C4A` | Text on primary-container. |
| `--m-secondary` | `#B85C3A` | Warm terracotta, used <5% (highlight chips, illustration). |
| `--m-secondary-container` | `#F4DDD0` | |
| `--m-tertiary` | `#B85C3A` | Alias to secondary in current build. |
| `--m-tertiary-container` | `#F4DDD0` | |

#### Semantic verdict colors (only inside verdict pills — never decorative)
| Token | Hex | Usage |
|---|---|---|
| `--m-pursue` | `#4A8C6F` | Sage green — "PURSUE" verdict only. |
| `--m-pursue-container` | `#DCE9E1` | Pursue pill background. |
| `--m-pursue-on-cont` | `#143628` | Pursue pill text. |
| `--m-watch` | `#B98A1A` | Amber — "WATCH". |
| `--m-watch-container` | `#F5E5B8` | |
| `--m-pass` | `#A23A2F` | Red — "PASS". |
| `--m-pass-container` | `#F2D6D2` | |

#### Text + outline
| Token | Hex | Usage |
|---|---|---|
| `--m-on-surface` | `#1A1B25` | Body / primary text. |
| `--m-on-surface-var` | `#44475A` | Secondary text. |
| `--m-on-surface-mid` | `#6B6F84` | Tertiary / metadata. |
| `--m-outline` | `#C5C5CC` | Strong dividers. |
| `--m-outline-var` | `#DEDEE5` | Soft dividers, card borders. |

### Elevation
| Token | Value |
|---|---|
| `--m-elev-0` | `none` |
| `--m-elev-1` | `0 1px 2px rgba(15, 18, 35, 0.05), 0 1px 3px 1px rgba(15, 18, 35, 0.04)` |
| `--m-elev-2` | `0 2px 6px rgba(15, 18, 35, 0.08), 0 1px 2px rgba(15, 18, 35, 0.05)` |
| `--m-elev-3` | `0 4px 12px rgba(15, 18, 35, 0.10), 0 2px 4px rgba(15, 18, 35, 0.05)` |

### Typography

Three families, loaded from Google Fonts:
- `--font-display: "Inter Tight", "Inter", system-ui, sans-serif` — H1/H2/H3, large numbers, display copy.
- `--font-body: "Inter", system-ui, sans-serif` — body, buttons, UI text.
- `--font-mono: "JetBrains Mono", ui-monospace, monospace` — eyebrows, kbd chips, fit scores, dates, datapoints. Add `font-feature-settings: "ss01"` (handled by `.mono` class).

Type scale used in this design:
| Use | Family | Size | Weight | Letter-spacing | Line-height |
|---|---|---|---|---|---|
| Hero H1 | Display | 38px | 800 | -0.03em | 1.05 |
| Section H2 | Display | 22px | 700 | -0.025em | 1.15 |
| View H3 | Display | 20px | 700 | -0.025em | 1.2 |
| Subsection title | Display | 17–18px | 700 | -0.02em | 1.3 |
| Card title | Display | 14–14.5px | 600–700 | -0.01em / -0.02em | 1.3 |
| Body large | Body | 14.5px | 400 | – | 1.55 |
| Body | Body | 13–13.5px | 400 | – | 1.55 |
| Caption / sub | Body | 12.5px | 400 | – | 1.55 |
| Small / meta | Body | 11.5–12px | 400–500 | – | 1.5 |
| Eyebrow | Mono | 9.5–10px | 600–700 | 0.14em | – |
| Datapoint | Mono | 11–13px | 600–700 | – | – |

### Spacing

Loose 4-base scale used throughout: 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 40, 48, 56, 64.

Common patterns:
- Card inner padding: `14px 16px` (small list rows), `16px 18px` / `18px 20px` (cards), `24px 28px` (large cards).
- Canvas body padding: `28px 40px 56px` (top-right-bottom-left).
- Section bottom margin: `32–36px`.
- Grid gaps: 10–14px between cards, 16–18px between sections.

### Border radius
- Small (chips, kbd): 4–6px
- Mid (buttons, mode items, list rows): 8–10px
- Standard (cards, FAB): 12–14px
- Large (hero headers, plan cards): 18px
- Pill / circular: 999px

---

## Assets

The prototype uses **inline SVG icons only** (defined in `V6Icon` in `v6-shell.jsx`). No image assets, icon fonts, or external icon libraries. The icon set is small (~12 glyphs) and tuned to a 14px stroke weight — recreate them as React components or import from a library that matches the Material-3 / Lucide-style look (Lucide's outline set is the closest match if you don't want to hand-roll).

Fonts (Google Fonts):
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Inter+Tight:wght@500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
```

In production: self-host these or use `next/font` for proper preloading.

---

## Sample Content / Copy (verbatim)

The prototype ships with realistic sample data. Replace at integration time, but keep the **tone** — direct, data-honest, founder-voice.

### Yulia's picks (welcome hero list)
1. Industrial Svc · TX — "$1.80M SDE · honest capex story" — 92 fit
2. Pest Control · FL — "92% on monthly contracts" — 84
3. Electrical · TX — "Margins good · concentration risk" — 78
4. HVAC platform · CO — "Family business · clean financials" — 74
5. Distribution · OH — "Asking high · margins thin" — 61

### Chat empty state (logged-out)
> **Hi there. Yulia can walk you through one of your deals right now — for free.**
>
> Start using the app completely for free. Use the **Search Ideas** below to explore, or just start chatting. Feel free to learn more about the app too.

### Search idea chips (Business Search mode)
- What's worth my time today?
- Filter pipeline by recurring revenue
- Pest Control · FL — quick read
- Find HVAC deals in TX under $5M
- Compare my top 3 pursue picks

(Each mode has its own 5-item set — see `v6-canvas.jsx` `V6ChatEmpty.suggestions` for the full mapping.)

### About SMBX chips (filled slate-blue pills)
- How it works
- Pricing
- What can Yulia do?
- Compare plans

### Pricing plans
- **Starter** — $49/mo (or $39 annual) — "For first-time searchers, kicking the tires." 50 deal reviews, basic recast/comps, 5 LOI/NDA drafts, 1 active deal, email support.
- **Operator** — $199/mo (or $159 annual) — *MOST POPULAR* — "For active searchers running 1–3 deals at a time." Unlimited reviews, full recast/comps/valuation, unlimited drafts, 5 active deals, market intel feed, priority support.
- **Fund** — $599/mo (or $479 annual) — "For micro-PE firms and small search funds." Everything in Operator + unlimited deals, 5 seats, custom diligence templates, API access, dedicated CSM.

---

## What's NOT in this design (deliberate gaps)

These are intentional omissions in the prototype that the developer must add in production:

1. **Real LLM streaming** — chat replies are stubbed with a fixed string after a 600ms timeout. Replace with a streaming endpoint and proper message schema.
2. **Auth / logged-in state** — there's no sign-in flow, account menu actions, or session UI in the sample. The "Account chip" just sits there. Wire it to your auth provider.
3. **Real data fetching** — deal/doc/analysis content is hardcoded. Add API clients, loading skeletons, error states, empty states.
4. **URL routing** — tabs and views aren't URL-synced. Add proper routing so deep links work and the back button does the right thing.
5. **Accessibility passes** — the prototype has reasonable semantics (button elements, headings) but no formal a11y review. Add proper focus management for the rail expand, keyboard nav for tabs, ARIA for the live chat region, etc.
6. **Mobile / responsive** — the desktop shell is fixed-shape. The mobile experience is shipped as a separate handoff bundle.
7. **Persistence** — sidebar pin state, chat width, draft text, etc. should persist to localStorage / user preferences in production.
8. **Empty states for deep views** — the prototype renders sample data unconditionally. Add proper empty states for "no deals yet", "no docs yet", etc.

---

## Files in this bundle

| File | Purpose |
|---|---|
| `V6 Files Workspace.html` | Entry-point. Loads React + Babel, mounts `<V6App/>`, wraps it in a `DesignCanvas` for the prototype's pan/zoom shell. |
| `v6-styles.css` | Single source of truth for tokens + primitive component classes. Read this first. |
| `v6-shell.jsx` | Sidebar, V6Icon SVG set, MODES list. |
| `v6-canvas.jsx` | Chat well + tabbed canvas system + section helpers + canvas styles. |
| `v6-modes.jsx` | Five mode-root screens (Business Search, Docs, Analysis, Intel, Library). |
| `v6-views.jsx` | Deep views: deal, doc editor, analysis sliders. |
| `v6-learn.jsx` | How it works + Pricing tab content. |
| `design-canvas.jsx` | Prototype-only — pan/zoom canvas wrapper. **Do not port to production.** Wrap the real app in your standard layout instead. |

### Loading order (in `V6 Files Workspace.html`)
1. React + ReactDOM + Babel
2. `design-canvas.jsx` (prototype shell only)
3. `v6-shell.jsx` (defines V6Icon, MODES used by other modules)
4. `v6-canvas.jsx`
5. `v6-modes.jsx`
6. `v6-views.jsx`
7. `v6-learn.jsx`
8. The `<V6App/>` root component (inline in the HTML)

In production, this becomes a normal module graph — no Babel-in-browser needed.

---

## Recommended implementation path

1. **Set up tokens.** Copy the `:root` block from `v6-styles.css` into your token system. Verify the 60/30/10 reads correctly in your test page.
2. **Build the shell** (3-column layout + collapsing sidebar + tab strip) with empty content slots. Get the chrome right before any content.
3. **Implement the chat well** with a stub model. Get the empty state, send/reply loop, and resizing right.
4. **Implement one mode root** end-to-end (recommend: Business Search). This validates the section/card patterns.
5. **Implement deep views** (deal, doc, analysis) — these reuse the same primitives.
6. **Implement Learn** — How it works + Pricing.
7. **Wire real data** (auth, LLM, API).
8. **A11y + responsive polish.**

Reach out with questions — happy to clarify any pixel-level decision or tone choice.
