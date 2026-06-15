# Agent-First Desktop — Cutover Plan (smbx.ai)

> Migrating the **desktop** app to the new agent-first design (`/Users/paul/Downloads/Test 33 new design`):
> chat-is-home, journey-aware, split `[sidebar | Yulia rail | canvas]`, monochrome + rationed violet.
> Built as a **new gated shell** that reuses the existing agent chat + real data, flagship-first with
> sign-off gates, then cut over. **Mobile, anonymous, and marketing are untouched.** Supersedes the
> abandoned fintech `MIGRATION_PLAN.md` / `cd/` direction.

---

## 0. TL;DR
1. The design's **plan→act→report** pattern *is* the real agentic loop — `useAuthChat` already returns the real `toolTrace` (→ the **Task** work-checklist) and `confirmStagedAction`/`cancelStagedAction` (→ the **StagedConfirm** card). We reuse the chat wholesale.
2. The **agent-first core** (Home · Overview · Sourcing · Deal brief · Analysis canvas) is **~entirely wire-able to real data today**. The **journey-deep** surfaces (Closing · PMI · SELL funnel · RAISE terms) and a few deal KPIs are **honest-empty** until net-new backends land (the MIG-3 family) — they ship as honest-empty scaffolds and light up later. Never faked.
3. Graft is low-risk: a new `NDApp` shell mounted behind a `localStorage` flag at the one convergence point (`V6AppShell`), exactly like the existing `smbx_shell="legacy"` idiom. Mobile returns `V6Mobile` before ever reaching that point.

## 1. Target architecture
- **New shell:** `client/src/components/nd/NDApp.tsx` (default export). Props mirror V6's `ShellProps`: `{ user: User|null, chat: ChatBridge, onSignOut, onDevSignIn? }`. It consumes the **same `ChatBridge`** V6App builds (V6App.tsx lines ~40-56), so it reuses `useAuthChat` with **zero hook changes**.
- **Router:** an explicit **state machine** replacing V6's hash triad (`activeMode + tabs[] + activeTabId`). State: `{ route: 'home'|'overview'|'sourcing'|'deal'|'closing'|'post'|'sell'|'raise'|'new', dealId?, journey?, dealTab?, railOpen, canvasTabs[], activeCanvasTab }`. Logo → home; ⌘K toggles the Yulia rail. (URL sync optional — can keep a thin hash for deep-linking later.)
- **Tokens:** port the `.mck` sheet to a scoped **`.nd-root`** layer (monochrome base, **violet accent = Yulia only**, status palette by meaning, **IBM Plex Mono** for labels/numbers). Exact hex in §2.
- **THE LINE:** the **StagedConfirm** card is the real `agency_staged_actions` confirm/cancel flow (already wired via SSE `staged_action` + `POST /api/agency/actions/:id/confirm|cancel`). No outward/irreversible action without it.

## 2. Design tokens (port verbatim to `.nd-root`)
- **Type:** body/UI = grotesque sans (Helvetica Neue stack); **labels/numbers/eyebrows/breadcrumbs = IBM Plex Mono** (tabular). Base 13.5px, line-height 1.45, letter-spacing -0.005em.
- **Monochrome:** ink `#1A1A18` · ink-2 `#6C6B66` · ink-3 `#9A988F` · ink-4 `#C2C0B6` · line `#E7E5DF` · line-2 `#F0EEE9` · surface `#FFF` · canvas `#FBFAF7` · surface-2 `#F6F5F1` · surface-3 `#EFEEE9`.
- **Accent (Yulia only, rationed):** `#5A4FD6` · soft `#F0EEFC` · line `#DDD6F6` · ink `#3A3290`.
- **Status (meaning only):** ok `#3F9468`/`#E9F3ED`/`#D2E6DA` · warn `#B07D3A`/`#F6EFE1`/`#ECDCC1` · risk `#C0533F`/`#F7ECE9`/`#EED4CD` · live = ok green.
- **Ramp:** Display 28/600/-0.03em · Title 17/600/-0.02em · Body 14/1.6 · Label 12.5 · Eyebrow 10.5 mono uppercase 0.08em. **Radii:** cards 12 · buttons 8 · inputs 9 · pills 6 · composer 16 · launcher 26. **Hairline 1px borders, no heavy shadows** (only composer + launcher pill get a soft shadow). **Primary button = near-black `--ink`, never the accent.** Spacing 4/8/12/16/24.

## 3. Foundation — shared chrome (build first, both as `nd/` modules)
Per the handoff's prescribed order: tokens → primitives → chrome → chat parts → StagedConfirm → states.
- `nd/tokens.css` — the `.nd-root` token layer above.
- `nd/primitives.tsx` — `Ic` (map ~36 glyphs to our icon set), `Logo`, `YuliaMark` (accent square + sparkle — the agent identity badge), `Avatar`/`AvatarStack` (initials, tones a–d, live dot), `Chip`, `Btn` (ink/ghost/quiet), `IconBtn`, `Mono`, `Dot`, `StatusPill`, `SeverityPill`.
- `nd/chrome/Sidebar.tsx` — **journey-aware** 232px rail (Logo · New deal · Search ⌘K · PIPELINE {Ask Yulia, Overview} · `{JOURNEY} LIFECYCLE` stages w/ live counts · DEALS list · user footer).
- `nd/chrome/TopBar.tsx` — 54px per-deal identity + journey pill + **stage breadcrumb** (done/current/future).
- `nd/chat/` — `YuliaMsg`/`UserMsg`, **`Task`** (work-checklist row; renders from `toolTrace`), `Composer` (with the law line + Data room/@mention), `RankedTargets` (inline result preview), **`StagedConfirm`**.
- `nd/states.tsx` — `Skeleton`/`LoadingBlock` ("Yulia is reading…"), **`EmptyChart`** ("No live feed yet"), `ErrorState` (quiet + Retry).
- `nd/useYuliaRail.ts` — rail open/close, ⌘K toggle, canvas tab open/close/switch, surface-as-canvas wrapper.
- **`useCanvasActionBus.ts`** (shared, factored from V6App ~409-479) — see §4.

## 4. The Yulia rail + `canvas_action` (the heart — get this right)
- **Reuse `useAuthChat(user)` unchanged.** It returns `{ messages, sending, streamingText, activeTool, toolTrace, confirmStagedAction, cancelStagedAction, sendMessage(content, surfaceContext, modelPreference), uploadFile, conversation mgmt }`. Its optimistic-message guards (`sendingRef`, `loadedConvIdRef`) are load-bearing — **do not** reimplement the SSE loop.
- **Map the design onto the real loop:** the **Task** checklist ← `toolTrace` (real `tool_start`/`tool_done` events). The **StagedConfirm** ← the `staged_action` SSE event + `confirm/cancelStagedAction`. The chat's **"Open →"** artifacts ← `canvas_action`.
- **`canvas_action` is a GLOBAL `window` event** (`smbx:canvas_action`), not a prop. NDApp **must** install the listener (verbs: `open_tab`, `show_content`, `create_model_tab`, `update_model`, `read_tab_state`, `switch_mode`) or Yulia can't open canvas tabs/models from chat ("looks like nothing happens"). **Factor V6App's handler into `useCanvasActionBus`** and map verbs → ND router/canvas-tab state (`open_tab`→a deal/canvas tab; `create_model_tab`→Model tab; `switch_mode`→route).
- **surfaceContext:** the `send()` wrapper lives in V6AppShell (injects `buildDesktopSurfaceContext(...)` + `modelPreference`). NDApp must build an equivalent from its **route state** so Yulia knows the page/deal you're on. Re-read `modelPreference`/`wkTheme` from their existing localStorage keys — don't fork.

## 5. Surface-by-surface data wiring
Legend: **REAL** = wire to the cited endpoint now · **EMPTY** = honest-empty until a net-new backend · **NEW** = net-new backend on the parallel track (§6).

| Surface | Component | Data wiring | Phase |
|---|---|---|---|
| **00 Ask Yulia — Home** | `AskYuliaHome` | **REAL** — briefing: `GET /api/user/next-actions` + `/api/agency/today-operating-brief` (needs-attention) · `GET /api/intelligence/portfolio-heat` (market intel) · `GET /api/deals` (your-deals, last-action from `updated_at`+gate_events). Composer = `chat.sendMessage`. | 1 |
| **01 Overview** | `OverviewPage` | **REAL** — deals table `GET /api/deals` · KPI strip `GET /api/portfolio/summary` (portfolio **IRR = honest "—"**, NEW) · sector heat `portfolio-heat` · what-needs-you `next-actions` + `/api/agency/portfolio-brief` · recent activity = gate_events + deliverables + `useNotifications` (unified feed = light NEW; compose client-side first). | 1 |
| **02 Sourcing** | `WorkSourcing` | **REAL** — targets `GET /api/sourcing/portfolios/:id/candidates` · banner+progress SSE `GET /api/sourcing/portfolios/:id/progress`. | 3 |
| **03 Deal brief** | `WorkAnalysis` | **REAL** record `GET /api/deals/:id` + brief `GET /api/agency/deals/:id/brief` (verdict/marketRead = thesis). **EMPTY**: valuation KPIs (EV/EV-EBITDA/synergy NPV/IRR), risk register, football-field → **NEW** (MIG-3). | 2 |
| **04 Analysis canvas (split)** | `DealCanvasShell` | Chat = `useAuthChat`. Canvas tabs: **Model REAL** (`POST /api/deals/:id/analysis` + `GET /api/analysis-runs/:id` — LBO waterfall/moic/irr real) · **Documents/Data room REAL** (`GET /api/deals/:id/data-room`) · **Analysis KPIs + football-field EMPTY** (MIG-3) · IC-memo = deliverable generator (**NEW** first-class). `canvas_action` drives tab opens. | 2 |
| **10 New deal — intake** | `NewDealFlow` | **REAL** — journey picker + create via the existing add-deal path (`POST /api/deals` / promote-to-deal). Routes into the journey workspace. | 2 |
| **08 SELL — Vela** | `SellSurface` | CIM/teaser **REAL** (deliverable generators) · buyer list **REAL** (`GET /api/sourcing/buyer-demand/:dealId`) · process funnel **NEW/EMPTY**. | 3 |
| **09 RAISE — Ember** | `RaiseSurface` | financial package **REAL** (deliverable/analysis pipeline) · investor list **NEW/EMPTY** · term-sheet comparison **NEW/EMPTY**. | 3 |
| **05 Closing** | `ClosingSurface` | conditions-to-close, funds-flow, signature packet — **ALL NEW/EMPTY** (substrate-only today; back later via gateReadinessService + new tables; signature bounded by THE LINE — no custody/e-sign). | 4 |
| **06 Post-merger / PMI** | `PostMergerSurface` | integration workstreams, synergy capture — **NEW/EMPTY**. | 4 |
| **07 Journeys / 11 States / 12 Tokens** | reference | States + StagedConfirm = §3 components; Journeys/Tokens = internal reference (not routed). | 0 |

## 6. Net-new backend track (parallel; honest-empty → real, never a blocker)
Consolidated into the **MIG-3 family** + new routes. Each = a route + a hook; the honest-empty UI flips to real when present:
- **Deal KPI rollup** (EV · EV/EBITDA · synergy NPV · implied IRR) + **value-series** (football-field) + **named-risk register**.
- **Portfolio IRR** + **unified recent-activity feed**.
- **Closing** (conditions-to-close, funds-flow sources&uses) · **PMI** (workstreams, synergy) · **SELL funnel** · **RAISE** investor list + term-sheet comparison.
These do **not** block the core cutover — surfaces ship honest-empty and light up as backends land.

## 7. Phasing & sign-off gates
- **Phase 0 — Foundation** (tokens · primitives · chrome · chat parts · StagedConfirm · states · useYuliaRail · useCanvasActionBus). Gated flag wired.
- **Phase 1 — Flagship: Ask Yulia Home + Overview**, real data, on the preview. ⛳ **SIGN-OFF GATE** — we do not proceed until this is right.
- **Phase 2 — Deal workspace + Analysis canvas (split) + Yulia rail + canvas_action + New-deal intake.** ⛳ **SIGN-OFF GATE.**
- **Phase 3 — Sourcing + SELL + RAISE** (real-data parts; journey-deep tabs honest-empty).
- **Phase 4 — Closing + PMI** honest-empty scaffolds **+** the net-new backend track (§6).
- **Phase 5 — Adversarial review** (data honesty · THE LINE · token discipline · a11y) **+ cutover** (flip default) **+ retire** the abandoned `cd/` fintech shell. ⛳ **SIGN-OFF GATE.**

## 8. Cutover mechanics
- **Graft point:** add a flag at the top of `V6AppShell` (the convergence both desktop variants reach), **before** the `cdShell` block: `if (ndEnabled) return <NDApp user={user} chat={chat} onSignOut={onSignOut} />;` where `ndEnabled = localStorage.getItem('smbx_shell') === 'nd'` (or `smbx_desktop_v2='1'`).
- **Mobile/anon/marketing untouched:** `V6App` returns `<V6Mobile>` before `V6AppShell`; logged-out users get marketing; only authed desktop sees NDApp.
- **Preview:** set the flag on the realauth preview → see NDApp. Iterate per phase.
- **Cut over:** flip the default to NDApp; keep `smbx_shell=legacy`/`=cd` as escape hatches during bake.
- **Retire:** once NDApp is default + stable, delete `client/src/components/cd/` (fintech) and later the warm V6 desktop chrome. Mobile stays.

## 9. Risks & mitigations (from recon)
1. **`canvas_action` global listener** — NDApp must install it (shared `useCanvasActionBus`) or Yulia can't open canvas artifacts. *Highest-priority integration point.*
2. **surfaceContext** — build from ND route state, else Yulia loses page/deal awareness.
3. **`modelPreference`/`wkTheme`** — re-read existing localStorage keys; don't fork.
4. **`useAuthChat` optimistic-message guards** — reuse the hook unchanged; never reimplement the SSE parse.
5. **Honesty** — every NEW surface ships honest-empty, never faked (the design already does this; keep it).
6. **Scope discipline** — flagship-first + sign-off gates. This is the explicit fix for the last round's breadth-first failure.

## 10. Open decisions for you
1. **Revert prod fintech now?** (recommended — the live site is still the disliked desktop). `git revert d5f266b` + push.
2. **Namespace `nd/`** ok? (or pick another).
3. **Net-new backends (§6)** — build alongside the core (so journey-deep surfaces are real sooner), or after the core ships honest-empty?
4. Confirm **flagship sign-off** before Phase 2.
