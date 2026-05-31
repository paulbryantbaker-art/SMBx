# smbX Front-End Direction — LOCKED (2026-05-29)

**Decision:** Adopt the Claude Design "Ramp" handoff (warm-neutral base + neon
green accent + Schibsted Grotesk / JetBrains-Mono-for-numbers + FAB chat) as the
new smbX design language. This **replaces** the production V6 cool slate-blue /
lavender / periwinkle palette and most of the current UI/UX, across **both** the
logged-out marketing front end and the logged-in app.

Source handoff: `/Users/paul/Downloads/design_handoff_smbx/` (HTML/CSS design
references — recreate in the React/V6 codebase, do not ship as-is).

---

## What's locked

- **Accent: neon green** (the "slight greenish" look from the screenshots) —
  NOT amber, NOT slate-blue. Applied as the default on both surfaces.
- **Base: warm-neutral** (warm off-white, warm near-black ink).
- **Type: Schibsted Grotesk** (display + UI) + **JetBrains Mono** (ALL numbers,
  eyebrows, labels, codes, metadata, timestamps — the "computed / verifiable"
  signal). This mono-for-numbers convention is a keeper and is central to the
  identity.
- **Chat: FAB (floating action button)** — a floating chat bubble that opens an
  expandable chat window, on both surfaces. This **supersedes** the V6
  three-panel "chat rail as peer to canvas" structure.
- **Scope: replaces most of the production UI/UX** — the visual design and the
  chat interaction pattern. The *functional* substrate wiring (modes, the 11
  models, the tab/canvas system, deal state, the chat→canvas tool bridge) stays;
  it gets re-skinned, not rebuilt.

## Exact tokens (from CD's CSS — source of truth)

### Marketing site (`:root`)
```
--bg          #FBFAF6     warm off-white page background
--surface     #FFFFFF     cards / sheets
--surface-2   #F3F1EA     subtle warm fills, hovers
--surface-3   #ECE9DF     deeper fills
--ink         #191813     primary text (warm near-black)
--ink-2       #57534A     secondary text
--ink-3       #8B867A     tertiary / muted
--line        rgba(25,24,19,.10)
--line-2      rgba(25,24,19,.16)
--dk          #16140E     dark sections bg
--dk-2        #211E16     dark section panels
--accent      #2BFF77     neon green (LOCKED — override CD's amber default)
--accent-strong #10E060
--accent-soft #CFFFE1
--on-accent   #00210F     text on accent
--mono        'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace
```

### App (`body.wk` overrides)
```
--accent      #2BFF77
--accent-strong #0FB94F
--accent-soft #D8F7E4
--on-accent   #06371A
--bg          #FCFCFA     (app base, slightly cleaner than marketing)
--surface     #FFFFFF
--surface-2   #F3F3EE
--surface-3   #E9E8E1
```
(App and marketing greens differ slightly in strong/soft; unify to one set
during implementation unless there's a reason to keep them distinct.)

### Number treatment
```
.mono  { font-family: var(--mono); }
.num   { font-variant-numeric: tabular-nums; font-feature-settings: "tnum"; }
```
Every dollar figure, metric, timestamp, code, and metadata label uses mono +
tabular-nums.

### Fonts to load
- Schibsted Grotesk — weights 400/500/600/700/800 (Google Fonts)
- JetBrains Mono — weights 400/500/700 (Google Fonts)

## Retired by this decision

- The V6 cool palette: slate-blue `#2E5C8A`, cool lavender `#ECEAF2`,
  periwinkle `#8A9AE8`, cool grey canvas `#F1F1F4`. (Retired the way hot pink
  and warm-cream-terra were retired before.)
- The chat *rail* (persistent right panel) → replaced by FAB chat.

## One handling note — green accent vs. verdict green

The brand accent (electric neon green `#2BFF77`) must stay visually distinct
from the verdict "pursue" green (muted sage `#4A8C6F`). They are different
enough (electric vs. muted) to coexist, but in any view that shows both —
e.g. the Pipeline with verdict pills — keep the brand green electric/bright and
the verdict greens muted, so they read as two different systems. Do not let the
verdict pills adopt the brand neon.

## Status of the older design docs

- `CLAUDE_DESIGN_COPY.md` — **still valid.** The copy doesn't change with the
  palette. (Its design-direction header references Ramp/colors; the copy itself
  is unaffected.)
- `CLAUDE_DESIGN_BRIEF.md` — **aesthetic sections superseded.** The doctrine
  (what smbX is NOT, pricing, voice, the two surfaces) still holds. The
  Mercury/Bloomberg + slate-blue aesthetic direction is dead — replaced by this
  doc.
- `CLAUDE_DESIGN_APP_WIREFRAME.md` — **functional structure still valid; chat
  rail superseded.** The modes, models, tabs, and chat→canvas bridge still
  describe the product. The "chat rail as peer to canvas" is replaced by FAB
  chat.

---

## Implementation plan (phased)

### Phase 1 — Token + type foundation (highest leverage, ~1 day)
Swap the design tokens in `client/src/index.css`:
- Replace the V6 desktop `:root` `--m-*` block with CD's warm base + neon green.
- Replace the `.mobile-root` `--mb-*` block with the same system.
- Load Schibsted Grotesk + JetBrains Mono.
- Add `.mono` / `.num` number treatment; apply to numeric displays.
Outcome: a large fraction of the app re-skins for free because V6 components
consume these tokens. The running app immediately shows the new palette.
Reversible (token-level).

### Phase 2 — FAB chat conversion (~2–3 days)
Convert the chat rail (`v6/Chat.tsx`) → FAB chat:
- Floating bubble + expandable chat window (per CD's design).
- ChatDock lives inside the FAB window (still the universal input).
- The chat→canvas bridge (Yulia opens tabs, updates models, staged actions)
  still works — chat now overlays the canvas instead of sitting beside it.
- V6 shell goes from tri-panel (sidebar + canvas + chat rail) to two-panel
  (sidebar + canvas) + FAB chat.

### Phase 3 — Marketing site / Surface 1 (~1 week)
Build the 10 public pages as React routes, recreating CD's HTML in the V6
codebase with the new tokens:
- `/`, `/buy`, `/sell`, `/raise`, `/integrate`, `/pricing`, `/standard`,
  `/standard/[model]`, `/connectors`, `/about`, `/legal/*`
- The chat-input launcher → submit → app transition (carry first message
  across navigation; same ChatDock).
- Copy from `CLAUDE_DESIGN_COPY.md` verbatim.

### Phase 4 — App content-area re-skin (~1 week)
Beyond what Phase 1 gives for free, match CD's specific app patterns:
- Pipeline table, mode-roots, model tab interiors, Studio editor.
- Reconcile the sidebar IA (CD's vs. the V6 modes — keep functional modes,
  restyle).
- Apply mono-numbers + card styles throughout.

### Phase 5 — Mobile (~3–4 days)
Adapt the system to the V6 mobile shell (CD's handoff is desktop-first):
- New tokens on `.mobile-root`.
- Responsive layouts for the public pages + the app.
- FAB chat as a bottom sheet on mobile.

**Total: roughly 3–4 weeks of focused front-end work.** Phase 1 is the
contained, reversible, high-value first step and should go first.
