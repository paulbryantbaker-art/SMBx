# smbX V6 App Wireframe — Structural Reference for Claude Design

**What this document is:** an accurate, region-by-region wireframe of the
**logged-in** smbX V6 app (Surface 2 from `CLAUDE_DESIGN_BRIEF.md` §0), so an
external design tool (Claude Design, v0, Cursor) designs the **content areas**
inside the existing shell instead of inventing a parallel architecture.

**This document covers Surface 2 ONLY — the logged-in app.** The logged-out
marketing website (Surface 1) is a *regular website* with full design latitude
and is NOT governed by this wireframe — see the brief §0 and §6 for Surface 1.

**The boundary, stated plainly:**

> On Surface 2, **the shell is a given, not a canvas.** The three-panel layout,
> the **raised canvas** (the elevated central work surface with persistent
> tabs), the sidebar, and the chat rail are in production and are staying. CD's
> job here is to design the **content areas** — what fills the regions — and to
> restyle the shell's *chrome* to the new aesthetic *without restructuring it*.

**How to use:** paste alongside `CLAUDE_DESIGN_BRIEF.md`. The brief gives the
doctrine + Mercury/Bloomberg references + the two-surface model; this gives the
locked Surface-2 shell. CD designs content areas within the shell, never the
shell topology.

**What's locked vs. what CD designs (Surface 2):**

| LOCKED — structure stays (restyle chrome only, never restructure) | CD DESIGNS — the content areas |
|---|---|
| Three-panel topology: sidebar + raised canvas + chat rail | Visual chrome of each panel (color, spacing, type, elevation treatment) |
| The raised canvas as the elevated central work surface | What fills each canvas tab (model interiors, analysis, deal, doc, Studio) |
| Tabbed canvas — persistent, multi-tool, pinnable tabs | Tab-strip aesthetic + the layout of content inside each tab |
| Five top-level modes (Today / Pipeline / Search / Studio / Files) | The content composition of each mode-root |
| Yulia chat rail as a persistent peer to the canvas | The chat-thread content grammar (messages, tool-result cards, staged actions) |
| ChatDock as the universal input (same component as marketing pill) | ChatDock's visual treatment (shared across both surfaces) |
| Mobile topology: top bar + screen + tab bar + chat starter pill + chat sheet | Visual treatment + content of each mobile screen |
| The chat→canvas tool-call bridge (§9) | How tool results and tab-open events render in the thread |
| Existing primitives (Studio/List/Compete/texture-card/VerdictPill/Sparkline/FitGauge) | New content layouts that compose these primitives |

**Aesthetic split on Surface 2** (from brief §7): the shell chrome (sidebar,
tab strip, raised-canvas frame) takes the **Mercury** restrained chrome; the
work-surface content areas (model tab interiors, file browser, deal detail)
take **Bloomberg-density**. Do not pad-and-card-ify the work surfaces — density
is the credibility signal.

---

## 1. Desktop Shell — Three-Panel Workspace

The production V6 desktop shell is a tri-panel layout that persists across
every mode and every tab. Source of truth: `client/src/components/v6/V6App.tsx`,
`Sidebar.tsx`, `Canvas.tsx`, `Chat.tsx`.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  [logo]  smbX                                              [user] [bell] [⚙]  │ ← Top bar (thin, optional)
├──────────────┬─────────────────────────────────────────────┬─────────────────┤
│              │  ┌─Tab1─┬─Tab2─┬─Tab3──┬─Tab4─┐    [+ new]  │                 │
│              │  └──────┴──────┴───────┴──────┘             │                 │
│              │                                              │                 │
│              │  ┌───────────────────────────────────────┐  │                 │
│              │  │                                       │  │                 │
│              │  │                                       │  │   Yulia chat    │
│   SIDEBAR    │  │           CANVAS (active tab)         │  │   thread        │
│              │  │                                       │  │                 │
│   • Today    │  │    [content varies by tab kind —      │  │   [msg]         │
│   • Pipeline │  │     model, analysis, deal, doc,       │  │   [msg]         │
│   • Search   │  │     marketing-studio, feed-item,      │  │   [msg]         │
│   • Studio   │  │     files-list, settings, history,    │  │                 │
│   • Files    │  │     learn, starter]                   │  │                 │
│              │  │                                       │  │                 │
│   ───        │  │                                       │  │                 │
│              │  │                                       │  │   ┌──────────┐  │
│   [active    │  │                                       │  │   │ ChatDock │  │ ← Universal chat input
│    deal      │  │                                       │  │   └──────────┘  │
│    context]  │  └───────────────────────────────────────┘  │                 │
│              │                                              │                 │
└──────────────┴─────────────────────────────────────────────┴─────────────────┘
   ~240px         flex-1                                       ~380px

Sidebar:   client/src/components/v6/Sidebar.tsx
Canvas:    client/src/components/v6/Canvas.tsx
Chat rail: client/src/components/v6/Chat.tsx
ChatDock:  client/src/components/shared/ChatDock.tsx
```

**Region responsibilities:**

- **Sidebar (left).** Mode selector + active deal context. The 5 top-level
  modes live here. Sidebar is *persistent across modes* — selecting a mode
  changes the canvas, not the sidebar.
- **Canvas (center).** Tabbed workspace. Tabs are persistent — opening a
  model, deal, doc, or analysis adds a tab; closing a tab removes it.
  The active tab's content fills the canvas region.
- **Chat rail (right).** Yulia's persistent surface. The chat thread is
  always visible while working in the canvas. ChatDock at the bottom is
  the universal "Talk to Yulia" input — *the same component used on every
  page surface, including the marketing site.*

`★ Tip for CD ─────────────────────────────────`
The user works with the canvas while talking to Yulia. The chat is not a
modal, not a sheet, not a popup — it's a peer to the canvas, visible at
the same time. This is the core interaction model. Designs that hide
chat behind a click break the product.
─────────────────────────────────────────────────

---

## 2. The 5 Top-Level Modes (Sidebar entries)

Each mode swaps the canvas content. Modes are mutually exclusive — only
one mode-root is shown at a time, but tabs across modes can coexist in
the canvas tab strip.

| Mode | Sidebar label | Canvas content (mode-root) | Source |
|---|---|---|---|
| `today` | Today (5) | Daily briefing: deals needing attention, scheduled artifacts, recent Yulia activity | `modes/TodayRoot.tsx` |
| `pipeline` | Pipeline (6) | Deal pipeline (kanban or table) — stage, league, journey, status per deal | `modes/PipelineRoot.tsx` |
| `search` | Search (6) | Sourcing engine entry — query builder + saved searches + feed | `modes/SearchRoot.tsx` |
| `studio` | Studio (7) | Yulia's output canvas — CIMs, pitch books, IC decks, board updates | `modes/MarketingStudioView` |
| `files` | Files (24) | File/data-room browser — list, table, deal-scoped or all-scoped | `modes/FilesRoot.tsx` |

**Secondary modes** (not in the sidebar, reached by opening specific tabs):

| Mode | When it appears | Source |
|---|---|---|
| `docs` | When opening a document | `modes/DocsRoot.tsx` |
| `analysis` | When opening an analysis artifact | `modes/AnalysisRoot.tsx` |
| `intel` | Research / intelligence surface | `modes/IntelRoot.tsx` |
| `library` | Saved reference library | `modes/LibraryRoot.tsx` |

`★ Tip for CD ─────────────────────────────────`
The mode-root is the "home page" of each mode. It's what the user sees
when they click a sidebar item with no other tabs open. CD should design
each mode-root as its own composition — they don't all share the same
layout. Today is briefing-shaped; Pipeline is table-shaped; Studio is
canvas-shaped; Files is list-shaped.
─────────────────────────────────────────────────

---

## 3. Tab Kinds — What Can Live in a Canvas Tab

A tab is the unit of work. The user can have many tabs open at once,
across modes. Each tab is a `TabKind` from `client/src/components/v6/types.ts`:

| Tab kind | What it contains | View component |
|---|---|---|
| `mode-root` | The home of a mode (Today / Pipeline / Search / Studio / Files) | `modes/*Root.tsx` |
| `files-list` | A filtered file browser scoped to a deal or category | `modes/FilesRoot.tsx` |
| `deal` | A single deal's workspace — overview, stage, financials, files | `views/DealView.tsx` |
| `doc` | A document viewer — markdown / PDF / parsed financial doc | `views/DocView.tsx` |
| `analysis` | An analysis artifact — valuation baseline, QoE preview, working capital peg | `views/AnalysisView.tsx` |
| `model` | An interactive financial model (one of 11 — see §4) | `views/ModelCanvasView.tsx` |
| `marketing-studio` | A Studio output in progress — CIM, pitch book, IC deck | `views/MarketingStudioView.tsx` |
| `feed-item` | A sourcing engine result — target business detail | `modes/SearchRoot.tsx` (drilldown) |
| `learn` | Help / learn content | `Learn.tsx` |
| `settings` | User settings | inline |
| `history` | Activity history | inline |
| `starter` | Empty-state / first-run tab | inline |

**Tab strip behavior:**
- Tabs are persistent — they stay open across sessions until closed
- Tabs can be pinned (`pinned: true`) — pinned tabs stay leftmost and can't
  be accidentally closed
- Opening a tab from chat: Yulia calls `create_model_tab` or similar tool,
  the canvas opens a new tab and switches to it
- The tab strip lives at the top of the canvas region, just under the (optional) top bar

```
Canvas tab strip:
┌─Tab A (pinned)─┬─Tab B─┬─Tab C─┬─Tab D─┐  [+ new]
└────────────────┴───────┴───────┴───────┘
        ↑              ↑
   active tab     hover shows close X
```

---

## 4. The 11 Interactive Canvas Models (`kind: "model"`)

These are the financial model components users interact with. Each is a
`ModelCanvasView` instance with a specific `modelType`. Source:
`client/src/components/models/`.

| Model | Modal type | Computes |
|---|---|---|
| Valuation Explorer | `valuation` | EBITDA × multiple → enterprise value with sensitivities |
| LBO | `lbo` | Entry / exit / IRR / MOIC for buyout |
| SBA Financing | `sba_financing` | DSCR, debt schedule, monthly P&I |
| DCF | `dcf` | Discounted cash flow → enterprise value |
| Tax Impact | `tax_impact` | Asset vs. stock sale tax allocation, §1060 |
| Cap Table | `cap_table` | Pre/post-money ownership, dilution |
| Sensitivity Matrix | `sensitivity` | 2D sensitivity grid (e.g. multiple × growth) |
| Deal Comparison | `comparison` | Side-by-side scenarios |
| Earnout | `earnout` | Earnout payment schedule + total |
| Working Capital | `working_capital` | Working capital peg calculation |
| Covenant Compliance | `covenant` | Debt covenant tracker |

**Inside an interactive model tab — generic structure:**

```
┌─ Model header ────────────────────────────────────────────────┐
│  Title (e.g. "LBO — TruckCo Acquisition")          v3  ●saved  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─ Assumptions ─────────┐    ┌─ Output ──────────────────┐   │
│  │                       │    │                            │   │
│  │  [input: EBITDA]      │    │  Enterprise Value          │   │
│  │  [input: Multiple]    │ →  │  $42,500,000               │   │
│  │  [input: Debt %]      │    │                            │   │
│  │  [input: Exit Yr]     │    │  IRR: 27.4%                │   │
│  │                       │    │  MOIC: 3.1×                │   │
│  └───────────────────────┘    │                            │   │
│                                │  [chart: cash flows]       │   │
│                                │                            │   │
│                                └────────────────────────────┘   │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│  [Citations] [Methodology link] [Export PDF] [Discuss in chat]  │
└────────────────────────────────────────────────────────────────┘
```

`★ Tip for CD ─────────────────────────────────`
The model tab is the heart of the product. It's where users *do work*.
The assumption inputs on the left + the computed output on the right is
the Bloomberg-Terminal-like part of the product — dense, working,
deterministic. CD should not card-ify or whitespace-pad this region;
density is the feature.
─────────────────────────────────────────────────

---

## 5. The Studio Tab (`kind: "marketing-studio"`)

The Studio is where Yulia generates *narrative artifacts* — CIMs, pitch
books, IC decks, board updates, lender books. Each is a `studioFormat`:

| Format ID | Output |
|---|---|
| `buyer-pitch-book` | Buyer-side pitch book |
| `seller-pitch-book` | Seller-side pitch book |
| `ic-deck` | Investment committee deck |
| `qoe-preview-book` | QoE preview document |
| `cim-summary-deck` | CIM summary deck |
| `board-update` | Board update memo |
| `lender-book` | Lender financing book |

**Studio tab has three views (`studioView`):**

- `home` — Studio entry, format picker
- `canvas` — Active draft, page-by-page editor with inline chat
- `collection` — Saved drafts library

```
Studio canvas view:

┌──── Studio: Buyer Pitch Book — TruckCo ──── [Save] [Export PDF] ──┐
│                                                                    │
│  ┌─ Page list ─────┐  ┌─ Active page ─────────────────────────┐  │
│  │  ☐ Cover         │  │                                        │  │
│  │  ☐ Executive sum │  │  [Editable page content,               │  │
│  │  ● Market overv  │  │   rendered as a slide / page,          │  │
│  │  ☐ Financials    │  │   with inline citations]               │  │
│  │  ☐ Competitive   │  │                                        │  │
│  │  ☐ Risk          │  │                                        │  │
│  │  ☐ Ask           │  │                                        │  │
│  │                  │  │                                        │  │
│  │  [+ Add section] │  │                                        │  │
│  └──────────────────┘  └────────────────────────────────────────┘  │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 6. The Files / Data Room Tab

Files is both a top-level mode (`mode: "files"`) and a per-deal scoped
view (`files-list` tab with `fileScope: "data-room"`). Source:
`modes/FilesRoot.tsx`.

**File scopes:**

| `fileScope` | Shows |
|---|---|
| `all` | Every file the user has access to |
| `data-room` | Files in the active deal's data room |
| `shared` | Files shared with this user from other deals |

**File list views:**

| `fileListView` | Composition |
|---|---|
| `all` | Flat list across all deals |
| `deal-libraries` | Grouped by deal |
| `needs-action` | Files flagged for review or extraction |
| `data-rooms` | Folder-view of active data rooms |

```
Files list (deal-libraries view):

┌─ Files ─────────────────────────────────────────────────────────┐
│  All  |  Deal libraries  |  Needs action  |  Data rooms          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ▾ TruckCo Acquisition (12 files)                                │
│    📄 2023_Tax_Return.pdf     2.4 MB    extracted    [open]     │
│    📊 QuickBooks_Export.xlsx  1.1 MB    parsed       [open]     │
│    📄 Working_Capital.pdf     0.3 MB    pending      [open]     │
│    ...                                                           │
│                                                                  │
│  ▾ ConcreteCo Sourcing (3 files)                                │
│    📄 Initial_Brief.pdf       0.5 MB                  [open]     │
│    ...                                                           │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 7. The Chat Rail — Yulia's Surface

The chat rail is the **most important interaction surface in the product.**
It's persistent on desktop, slides up as a sheet on mobile, and is the
universal "Talk to Yulia" entry point on every page including the marketing
site.

Source: `client/src/components/v6/Chat.tsx`, `client/src/components/shared/ChatDock.tsx`.

```
Chat rail (desktop right panel):

┌── Yulia ──────────────── [history] [settings] ──┐
│                                                  │
│  ┌─ thread ─────────────────────────────────┐   │
│  │                                           │   │
│  │  Y: I've prepared the working capital     │   │
│  │     peg. The number is $1.8M. Here are    │   │
│  │     the three sensitivities I varied:     │   │
│  │     [opens Working Capital tab →]         │   │
│  │                                           │   │
│  │  U: What if AR days drops to 35?          │   │
│  │                                           │   │
│  │  Y: [updating WC tab] The peg drops to    │   │
│  │     $1.4M.                                │   │
│  │                                           │   │
│  │  [STAGED ACTION]                          │   │
│  │  ┌───────────────────────────────────┐   │   │
│  │  │ finalize_deal_package             │   │   │
│  │  │ requires explicit confirmation    │   │   │
│  │  │ [Confirm] [Cancel]                │   │   │
│  │  └───────────────────────────────────┘   │   │
│  │                                           │   │
│  └───────────────────────────────────────────┘   │
│                                                  │
│  ┌─ ChatDock ───────────────────────────────┐   │
│  │  [📎] [Type to Yulia...]            [↑]  │   │
│  └───────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘
```

**Chat affordances:**

- **Yulia opens canvas tabs.** Tool call `create_model_tab` → Canvas adds
  a new tab and switches to it. The chat references the opened tab inline.
- **Yulia reads canvas state.** Tool call `read_tab_state` → Yulia answers
  questions about what's on the canvas without the user re-pasting it.
- **Yulia updates canvas state.** Tool call `update_model` → Inputs change,
  output recomputes, chat shows the new number inline.
- **Staged actions appear in chat.** When a tool requires human approval
  (e.g. `finalize_deal_package`), the chat shows an inline approval card
  with Confirm / Cancel.
- **File upload via ChatDock.** Paperclip → upload → Yulia parses and refers
  to it in the next message.

`★ Tip for CD ─────────────────────────────────`
ChatDock is **the same component** on the marketing site as in the app.
That's the bridge: a visitor on smbx.ai/sell types into ChatDock; they
become a user; they continue using the same ChatDock in V6App. The
visual treatment must work in both contexts — marketing-page hero and
app right-rail. Design ChatDock once.
─────────────────────────────────────────────────

---

## 8. Mobile Shell — Collapsed Tri-Panel

The mobile shell preserves the three responsibilities of the desktop shell
(navigation / canvas / chat) but reorganizes them for one-handed phone use.
Source: `client/src/components/v6/mobile/V6Mobile.tsx`.

```
┌─────────────────────────────────────┐
│  smbX        ☰  [audience switcher]  │ ← TopBar.tsx
├─────────────────────────────────────┤
│                                     │
│                                     │
│                                     │
│        [Active screen content]      │
│                                     │
│        Today / Pipeline / Detail    │
│        / Brief / Analysis /         │
│        LibrarySearch / Watching     │
│                                     │
│                                     │
│                                     │
│       ┌────────────────────┐        │
│       │ 💬 Talk to Yulia → │        │ ← ChatStarterPill (sticky)
│       └────────────────────┘        │
├─────────────────────────────────────┤
│ [Today] [Pipe] [Search] [Studio] [≡] │ ← TabBar.tsx
└─────────────────────────────────────┘

When chat is tapped, ChatSheet slides up from bottom:

┌─────────────────────────────────────┐
│              ⌄ (dismiss)             │
├─────────────────────────────────────┤
│                                     │
│   [Yulia thread]                    │
│                                     │
│                                     │
│   ┌───────────────────────────┐     │
│   │ ChatDock                  │     │
│   └───────────────────────────┘     │
└─────────────────────────────────────┘
```

**Mobile screens (`mobile/screens/`):**

| Screen | Purpose |
|---|---|
| `Today.tsx` | Daily briefing — top 5 deals needing attention |
| `Pipeline.tsx` | Deal pipeline list |
| `Brief.tsx` | Brief artifact view |
| `Detail.tsx` | Deal detail view |
| `Analysis.tsx` | Analysis artifact view |
| `LibrarySearch.tsx` | Library / methodology search |
| `Watching.tsx` | Watching list (saved targets) |

**Mobile primitives (`mobile/`):**

| Primitive | Used for |
|---|---|
| `VerdictPill.tsx` | Pursue / Watch / Pass verdict chip |
| `Sparkline.tsx` | Micro-chart inside list items |
| `FitGauge.tsx` | Deal fit visualization |
| `glass.tsx` | Liquid Glass card primitives (the mobile aesthetic) |
| `YIcon.tsx` | Yulia icon (avatar / brand mark) |
| `IndustryIcon.tsx` | Industry icons |
| `PickRow.tsx` | Selectable list row |
| `AudienceSwitcher.tsx` | Switch buyer/seller/raiser/PMI context |
| `ChatStarterPill.tsx` | The sticky "Talk to Yulia" pill |
| `ChatSheet.tsx` | Chat sheet that slides up |
| `LearnSheet.tsx` | Learn content sheet |

`★ Tip for CD ─────────────────────────────────`
The mobile shell uses *watercolor textures* (not gradients) for verdict
heroes — see `client/public/textures/texture-pursue.png` and siblings.
This is a deliberate deviation from the design handoff bundle. Mobile
also uses periwinkle (`#8A9AE8`) as the primary, not slate-blue. CD
should treat mobile and desktop as **two coherent design systems
sharing a substrate**, not one design system stretched across screen
sizes.
─────────────────────────────────────────────────

---

## 9. Interaction Patterns — How Chat and Canvas Talk

The chat-canvas bridge is the product's defining UX. These are the four
patterns CD must preserve:

### Pattern A — Chat opens canvas tab
```
User in ChatDock: "Build me a working capital peg for TruckCo"
       │
       ▼
Yulia tool call: create_model_tab({modelType: "working_capital", dealId: 47})
       │
       ▼
Canvas: opens new tab, switches to it, shows model with seeded assumptions
       │
       ▼
Chat thread (inline): "I've opened the working capital model in the canvas →"
```

### Pattern B — Chat updates open canvas tab
```
User (looking at LBO tab): "What if EBITDA was $1.5M?"
       │
       ▼
Yulia: read_tab_state → identifies active LBO tab
       │
       ▼
Yulia: update_model({tabId: "...", updates: {ebitda_cents: 150_000_000}})
       │
       ▼
Canvas: LBO tab inputs update, outputs recompute (no reload, no flash)
       │
       ▼
Chat: "Updated. New IRR is 24.1%, MOIC is 2.7×."
```

### Pattern C — Canvas state available to chat without re-pasting
```
User opens Working Capital tab. Inputs values manually.
User in chat: "Why is the peg this high?"
       │
       ▼
Yulia: read_tab_state(activeTabId) — reads inputs + outputs
       │
       ▼
Yulia answers using actual current canvas state, no re-paste needed.
```

### Pattern D — Staged action requires inline approval
```
User: "Finalize the deal package."
       │
       ▼
Yulia: stages finalize_deal_package, sends approval card to chat
       │
       ▼
Chat thread: shows StagedAction card with [Confirm] [Cancel]
       │
       ▼
User clicks Confirm: tool actually executes, audit row written
```

---

## 10. Component Inventory — What CD Should Reuse vs. Replace

### Reuse (don't reinvent — these are production primitives)

| Primitive | Location | Purpose |
|---|---|---|
| `ChatDock` | `components/shared/ChatDock.tsx` | The universal chat input |
| `DarkModeToggle` | `components/shared/DarkModeToggle.tsx` | Safari-safe dark-mode swap |
| `Reveal` | `components/shared/Reveal.tsx` | Scroll-driven section reveal |
| `ChapterStrip` | `components/shared/ChapterStrip.tsx` | Stage/chapter nav (perfect for journey pages) |
| `DotField` | `components/shared/DotField.tsx` | Animated background |
| `VerdictPill` | `v6/mobile/VerdictPill.tsx` | Pursue/Watch/Pass chip |
| `Sparkline` | `v6/mobile/Sparkline.tsx` | Micro chart in list rows |
| `glass.tsx` primitives | `v6/mobile/glass.tsx` | Liquid Glass card variants |
| `FitGauge` | `v6/mobile/FitGauge.tsx` | Deal fit gauge visualization |
| `V19UsageMeter` | `v6/V19UsageMeter.tsx` | Credit / usage display |

### Open to redesign (content layouts inside the shell)

| Surface | Current state | CD can redesign |
|---|---|---|
| Each mode-root (Today, Pipeline, Search, Studio, Files) | Functional V6 implementation | Composition, density, type hierarchy |
| Model tab interior (assumption inputs + outputs) | Bloomberg-style dense | Density level, chart treatment |
| Studio canvas (CIM / pitch book editor) | Page-based editor | Editor chrome, page nav, export UI |
| Files list | Grouped list | Grouping strategy, density, preview pattern |
| Chat thread rendering | Bubble + tool-result chips | Bubble shape, tool-result visual grammar |
| Sidebar mode list | Vertical icon + label | Icon style, active state, contextual info |
| Tab strip aesthetic | Browser-like tabs | Tab shape, close affordance, pinned visual |

### Locked structure (do not change)

- Three-panel desktop layout (sidebar / canvas / chat rail)
- Tabbed canvas with persistent tabs
- Universal ChatDock present on every surface
- Mobile: top bar / screen / tab bar / sticky chat starter pill / chat sheet
- The 5 top-level modes in the sidebar
- The 11 interactive model types
- The 7 Studio formats
- The chat → canvas tool-call bridge

---

## 11. How to Brief Claude Design with This Wireframe

Paste this document **alongside** `CLAUDE_DESIGN_BRIEF.md`. The brief gives CD
the doctrine + the Mercury/Bloomberg references + the two-surface model. This
gives CD the locked Surface-2 shell. The direction is locked — CD is *not*
exploring alternatives; it is designing the **content areas** within this
shell.

Your Surface-2 prompt to CD becomes:

> "Read `CLAUDE_DESIGN_BRIEF.md` (especially §0 two surfaces, §7 locked
> aesthetic split) and this wireframe.
>
> This is **Surface 2 — the logged-in app**. The shell is LOCKED: three-panel
> topology, the raised canvas with persistent tabs, the sidebar, the chat rail.
> Do not restructure it. Restyle its chrome to the locked Mercury aesthetic;
> design the **content areas** inside it.
>
> Apply the locked aesthetic split: **Mercury chrome** for the shell (sidebar,
> tab strip, raised-canvas frame); **Bloomberg-density** for the work-surface
> content areas (model tab interiors, file browser, deal detail).
>
> Design these content areas:
> 1. The **Today mode-root** content (briefing-shaped)
> 2. The **Pipeline mode-root** content (table-shaped)
> 3. A **model tab interior** (assumption inputs + computed outputs —
>    Bloomberg density; this is the work surface, do not pad it out)
> 4. A **Studio canvas view** (CIM / pitch-book editor — document-shaped)
> 5. The **chat thread** content grammar (Yulia messages, tool-result cards,
>    staged-action approval cards)
> 6. The **mobile Today screen** (how the same content collapses on phone,
>    periwinkle + watercolor textures per §8 of this wireframe)
>
> Preserve: three-panel topology, raised canvas, tab system, chat rail,
> ChatDock as universal input, the 5 sidebar modes, the 11 model types.
> Restyle chrome; never restructure.
>
> Run the brief's §8 anti-pattern checklist before returning each surface."

That prompt gives CD a structurally accurate Surface-2 target. The output is
content-areas-redesigned-inside-the-real-shell — exactly the trade you want:
CD's content-design taste applied to the production Canvas + Chat-Rail grammar.

**Surface 1 (the logged-out marketing website) is briefed separately** — see
`CLAUDE_DESIGN_BRIEF.md` §6. That surface has full design latitude and is not
governed by this wireframe.

---

**End of wireframe. This is Surface 2 (the logged-in app). Pair with
`CLAUDE_DESIGN_BRIEF.md` — §0 defines the two surfaces, §6 briefs Surface 1
(the marketing website), this wireframe locks Surface 2 (the app shell). The
brief is the "what / why / where-Mercury-vs-Bloomberg"; this is the
"how Surface 2 is organized and what stays fixed."**
