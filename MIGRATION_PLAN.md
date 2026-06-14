# MIGRATION_PLAN.md — Porting the Claude Design (CD) fintech UI onto smbx.ai

> Companion to **`CD_UI_PORT_BRIEF.md`** (the information-architecture + surface-inventory spec). This plan is the *engineering* counterpart: it names the files, the token strategy, the one net-new backend, and the build sequence. The brief says **what each surface contains and how it behaves**; this plan says **what we build, what we reuse, and in what order**. Read the brief first — this does not repeat it.

---

## 1. Approach

This is a **presentation rebuild, not a product rebuild.** CD is the visual guide; our data layer, feature depth, and backend are canonical and stay. Every CD surface maps onto an existing, real V6 component that already out-features the mock (live calc runtime, DEFINITIVE readiness, RBAC team, provenance, zero-hallucination money handling) — so we reskin in place and adopt CD's genuinely-new affordances (tabbed canvas, command palette, SVG charts, Finder-style file split, the intelligence-read stack) rather than porting CD's mock data, `data.js`, or thinner logic. The one true addition is a backend **deal-intelligence synthesis endpoint** that fuses four signals CD only mocks. Where CD and V6 disagree on a number or a rule, V6 wins (THE LINE, two-greens law, eyebrow lock, real-or-"—").

---

## 2. Token & theme map

**Decision: new layer, NOT replace-in-place.** Build `client/src/styles/cdTokens.css`, imported once at the top of `client/src/index.css`, scoped under a **`.cd-root`** class (mirroring `.v6-root` / `.mobile-root`). A blind overwrite of `--ink / --surface / --line / --accent` would repaint every live V3 surface and silently break `verdictMaterial.ts` (warm watercolor recipes) and `operatingPrimitives.tsx` (hardcoded oat/charcoal hexes that assume a warm canvas). New fintech surfaces opt in; legacy V3 / `--m-*` / `--mb-*` stay untouched. Promote to `:root` only once V3 is retired (`REPO_STATUS.md`).

**Fonts to add:** the CD `@import` for **Figtree / Newsreader / IBM Plex Mono** goes in `index.css`. Map `--sans→--cd-sans`, `--serif→--cd-serif`, `--num→--cd-num`, `--mono→--cd-mono`. Keep our JetBrains `--font-mono` separate. CD's `.num` / `.mono` / `.tnum` utilities collide with our same-named ones — **namespace CD's as `.cd-num` / `.cd-mono`**.

**The palette shift:** CD is cool-OKLCH — indigo `--accent oklch(0.56 0.15 256)` + cool neutrals + an indigo/teal finance ramp (`--pos/--neg/--warn`, `--c1..c6`). These **replace the warm verdict greens on CD surfaces**: charts render indigo+teal, not `--m-pursue`. Map all CD tokens to `--cd-*` (accent + soft/strong/ring; `--cd-desk/-canvas/-bg/-surface/-2/-3/-line/-2/-ink..-ink-4`; `--cd-pos/-neg/-warn`; `--cd-r-*`; `--cd-shadow-*`). Keep OKLCH verbatim; add an sRGB fallback only if Safari <15.4 is in scope. Density: carry `[data-density="compact"]` but scope it to `.cd-root[data-density]` and wire a toggle in the shell. The 4-state skeleton ports as `.cd-skel` / `@keyframes skel-shimmer` (distinct from existing `.wk-skel`).

**Key risks:** (1) **`:root` promotion is the cascade footgun** — any stray un-scoped CD var leaks into `operatingPrimitives.tsx` hexes; keep everything `.cd-root`-scoped. (2) **No dark mode in CD** — our `DarkModeToggle.tsx` + the Safari-toolbar-tint rule expect one; flag as a TODO, derive cool-dark `--cd-*` later. (3) **No verdict-watercolor equivalent** — `verdictMaterial.ts` heroes can't be reused literally on CD surfaces; either keep verdict heroes on the legacy warm material or re-derive verdict tints in OKLCH. (CD already uses `prefers-reduced-motion` — good.)

---

## 3. Component map

Real file names. "Replaces" = the V6 file being reskinned in place (no parallel shells — Critical Rule #4). Net-new files are marked **NEW**.

### Foundation & shell

| CD source | New / target app file | Replaces / reskins | Real data hook / endpoint |
|---|---|---|---|
| `tokens` (inline `--accent`/oklch) | **NEW** `client/src/styles/cdTokens.css` | adds to `client/src/index.css` (scoped `.cd-root`) | — (static theme) |
| `CanvasTabStrip` (appA.jsx) | **NEW** `client/src/components/v6/CanvasTabStrip.tsx` | rebuilds left-rail "Open" section, `V6App.tsx` 681–732 | `tabs[]` state in `V6App.tsx`; `groupLauncherTabsByDeal` / `openTab` / `closeTab` / `reorderTabs` |
| `CommandPalette` (⌘K) | **NEW** `CommandPalette.tsx` (net-new affordance) | — (we lack one) | wires to `pickMode` / `openTab` |
| `YuliaPanel` (right rail) | reuse `Chat.tsx` bridge, dock the rail | replaces floating `.wk-chatwin` FAB | existing `smbx:canvas_action` → `create_model_tab`, `useModelStore` |
| shell atoms (`Icon/Pill/Delta/Card/SectionTitle/NavItem`) | reuse `V6Icon` (`icons.tsx`), `operatingPrimitives.tsx`, `dataChips.tsx` | do NOT port `shell.jsx` | — |

### Today

| CD source | New / target app file | Replaces / reskins | Real data hook / endpoint |
|---|---|---|---|
| Today "deal read" cards | **NEW** `client/src/components/v6/shared/IntelStack.tsx` (`IntelStack`, `IntelRead`, `LeagueBadge`, `DirGlyph`, `MethodPill`) | replaces `buildCommandQueue`/`CommandRow` block in `TodayRoot.tsx` (new Section 1 lead) | **NEW** `useDealIntelligenceRead` → `/api/agency/deals/:id/intelligence` (§4); KPI row from `usePortfolioSummary` |
| KPI cards / market / activity | keep `HeroFrame`, `MarketReadCard`, `ShapeCell`, recent-work/deals-in-motion as supporting cast | reskin in `TodayRoot.tsx` | `useTodayOperatingBrief`, `useMobileDeals`, `/api/intelligence/portfolio-heat`; reuse existing `HeatBar` (do not port CD's) |

### Deal detail

| CD source | New / target app file | Replaces / reskins | Real data hook / endpoint |
|---|---|---|---|
| `DealDetailPage` Overview tab | reskin `client/src/components/v6/views/DealView.tsx` in place | canonical deal surface (`kind:"deal"`) | `/api/deals/:id`, `/deliverables`, `loadDealDataRoom(id)`, `/api/agency/deals/:id/brief` |
| `DealDetailPage` "Team & chat" tab | keep routing to `DealTeamView.tsx` (do NOT inline) | existing `kind:"deal-team"` tab via `openDealTeam()` | `useDealTeam`; comments via `DealCommentsThread.tsx` |
| `DealDetailPage` Notifications tab | **drop** — already the V6 bell | — | — |
| CD editable goal-date track | **NEW** `StageTimeline` block in `DealView.tsx` | replaces read-only `D.stageTrack` | `buildStageProgress(real, data.gates, deliverableStats)` over `getJourneyGates`; goal-dates in localStorage by deal id |
| `marketintel.jsx` | **NEW** `DealMarketPanel` co-located in `DealView.tsx` | upgrades thin `D.marketCard` | **wire `getMarketIntelligenceProfileForDeal`**, not just `dealBrief.marketRead` (brief §2c); `buildLeagueBand()` over `LEAGUE_MULTIPLES`. No mocked comps/prime/fed-funds/buyer-count |

### Portfolio (Pipeline + Search)

| CD source | New / target app file | Replaces / reskins | Real data hook / endpoint |
|---|---|---|---|
| `portfolio.jsx` SubTabs header | **NEW** thin wrapper `client/src/components/v6/modes/PortfolioRoot.tsx` | unifies the three roots under one page | switches `V6PipelineRoot` / `V6SearchRoot` / Intel root |
| `PipelineBoard` / `DealCard` (kanban + drag) | keep `PipelineRoot.tsx` ledger (`wktable`) — style fork only | — (do NOT port drag-to-advance) | `useV6WorkspaceData` (money coerced via `normalizeDeal`/`toNum`), `useTodayOperatingBrief`, `usePortfolioSummary`, `useMobileDeals`. Gate advance stays the `advance_gate` server tool |
| Search "market groups" | keep `SearchRoot.tsx` → `openTab({tool:"market_discovery"})` | — (not a real endpoint) | `runSearch` + `onTalkToYulia` |

### Analysis + Files

| CD source | New / target app file | Replaces / reskins | Real data hook / endpoint |
|---|---|---|---|
| `AnalysesCatalog` (6 tools) | reskin `client/src/components/v6/modes/AnalysisRoot.tsx` | keep our 14-tool `TOOLS` + `FAMILY_TONE` (richer) | `useV6WorkspaceData`, `useTodayOperatingBrief` (`modelRefreshNeeds`); recently-run = deliverables w/ `analysis_run_id` |
| `DCFLive/LBOTab/SensTab/CompsTab` | reskin the 11 `client/src/components/models/*.tsx` via `ModelRenderer.tsx` inside `ModelCanvasView.tsx` | visual reference only — do NOT port CD's `computeDCF` | `useModelStore`; canonical calc = `lib/calculations/core.ts`; versions via `listSavedModelExecutions` |
| `charts.jsx` (`Sparkline/AreaChart/Donut/Waterfall/Heatmap/BarChart/StageBar`) | **NEW** `client/src/components/v6/shared/charts/` (SVG, CSS-var-themed) | net-new — `models/Charts.tsx` is Chart.js/PDF-only | inline data props (Today/Analysis/canvas) |
| `FilesExplorer` (Finder sidebar) | reskin `client/src/components/v6/modes/FilesRoot.tsx`; **adopt shared-vs-private split** (CD richer) | preserve our `definitiveDisclosureStatus` / source-gap chips (CD lacks) | `useV6WorkspaceData`, `useTodayOperatingBrief` (`fileReviewItems`); counts from `deal.document_count` |

### Studio + Notifications + States

| CD source | New / target app file | Replaces / reskins | Real data hook / endpoint |
|---|---|---|---|
| `studio.jsx` `BookCover/BookCard` | **NEW** `StudioBookCover` sub-component in `MarketingStudioView.tsx` | replaces flat `bookRow` list | `GET /api/studio/pitch-books` (already wired) |
| `notifications.jsx` full page | **NEW** `client/src/components/v6/views/NotificationsView.tsx` (new tab kind `notifications`) | `V6NotificationBell.tsx` popover stays as quick view + gains "See all →" | `useNotifications()` (`/api/notifications`, `markRead`, `markAllRead`, `respondToDealRequest`) |
| `ErrorBand` / `StatusChip` | **NEW** `shared/ErrorBand.tsx`, `shared/StatusChip.tsx` | — | reuse existing `YuliaSkeleton.tsx` + `EmptyState.tsx`; StatusChip → `.statpill` classes |

---

## 4. The one net-new backend — deal-intelligence synthesis

This is the only backend build. CD mocks it; the four pieces live in separate endpoints today. This is the **fusion layer** the brief flags (`CD_UI_PORT_BRIEF.md` §"THE CORE" + the field→source table).

- **Service:** `server/services/dealIntelligenceReadService.ts` exporting `getDealIntelligenceRead(userId, dealId, forceRefresh)`.
- **Endpoint:** `GET /agency/deals/:dealId/intelligence` added to `server/routes/portfolioBrief.ts` (already mounted at `/api`; same `(req as any).userId` auth pattern).
- **Inputs:** `userId`, `dealId`, optional `forceRefresh`.
- **Wiring (reuse, no new SQL):** deal + one `gateCountdown`/`dealPulse` item filtered from `getTodayOperatingBrief(userId)` (gives `requiredModels`, `requiredCitations`, `blockers`, `nextAction`, `definitive` readiness). League from the deal's `league` column → fallback `classifyV19LeagueFromCents(...)` in `server/constants/v19Leagues.ts`; `primaryMetric` + `multipleFloor/Ceil` from `LEAGUES[code]`. Market from `getMarketHeat(deal.industry)` + FRED via `marketIntelligenceRuntime`. Done-vs-needed = completed deliverable slugs ∩ `getGateV19Requirements(gateId).requiredModels`.

- **Output shape:**
  ```
  { dealId,
    league: { code, primaryMetric, multipleBand: [floor, ceil] },
    gate:   { id, name },
    whereYouStand: { done: [{model,label}], needed: [{model,label}], readinessPct },
    marketRead:    { heatLabel, heatScore, direction, implicationText },
    yourMove:      { label, reason, toolName },
    generatedAt, intelligenceMode }
  ```

- **THE LINE:** `implicationText` and `yourMove.reason` are **descriptive only** ("multiples expanding in {industry}; {n} active buyer theses") — never "you should / buy / sell / counter". Deterministic template first; an optional short Yulia-composed sentence (Haiku via `callClaudeWithModel`, cached 72h like `yulia_deal_briefs`) is polish, with `intelligenceMode:'deterministic_fallback'` until it backfills.

- **Client hook:** **NEW** `client/src/hooks/useDealIntelligenceRead.ts` modeled exactly on `useTodayOperatingBrief.ts` (fetch, `authHeaders()`, cancel guard, `{data, loading, error}`). Consumed by `IntelStack.tsx` (Today) and `DealView.tsx`'s read.

- **4 states:** loading → skeleton; empty (deal exists, no gate/financials) → "needs intake" + `requiredFields`; error → honest banner; generating → deterministic fallback while the AI sentence backfills.

- **Caveats:** `gateRegistry` carries 22 gates (not the 30-gate DEFINITIVE catalog) so readiness understates substrate depth; postgres-js returns money as strings (coerce); seed data has no real deadlines, so slipped-gate banners stay honestly-empty.

---

## 5. Phased sequence

**Phase 1 — desktop, in vertical slices (each slice ships all four states):**

1. **Foundation** — `cdTokens.css` + `.cd-root` scope + font imports + density toggle + `.cd-skel`; `CanvasTabStrip.tsx` (the net-new tabbed canvas) + `CommandPalette.tsx`; dock the Yulia rail. *(Everything below mounts inside this shell.)*
2. **The backend** — `dealIntelligenceReadService.ts` + `/agency/deals/:id/intelligence` + `useDealIntelligenceRead.ts`. Built early because Today and Deal detail both depend on it.
3. **Today** — `IntelStack.tsx` as the lead read-stack; reskin supporting cast in `TodayRoot.tsx`.
4. **Deal detail** *(budget like 3 surfaces — brief §1)* — reskin `DealView.tsx`; new `StageTimeline` + `DealMarketPanel` (wired to the full profile); keep `DealTeamView.tsx` + `DealCommentsThread.tsx`.
5. **Portfolio** — `PortfolioRoot.tsx` SubTabs wrapper over reskinned `PipelineRoot.tsx` + `SearchRoot.tsx`; add the missing inline error band.
6. **Analysis + Files** — reskin `AnalysisRoot.tsx` + the 11 models via `ModelRenderer`/`ModelCanvasView`; build `shared/charts/` SVG atoms; reskin `FilesRoot.tsx` with the shared-vs-private split.
7. **Studio / Notifications / States** — `StudioBookCover` in `MarketingStudioView.tsx`; `NotificationsView.tsx` + "See all" from the bell; `ErrorBand.tsx` + `StatusChip.tsx`, retrofit all surfaces to the four-state law.

**Phase 2 — mobile (scoped follow-up, not a responsive afterthought):** port the same look to the separate `client/src/components/v6/mobile/` surface (its own shell, ~14 screens, 5 sheets) against the shared data layer. Plan now, build after Phase 1.

---

## 6. Risks & decisions to confirm (approve before build)

1. **Token-name collision is the top risk.** Approve the `.cd-root`-scoped new-layer decision — a `:root` promotion cascades into `operatingPrimitives.tsx` hardcoded hexes and `verdictMaterial.ts` warm recipes and breaks live V3. Confirm we keep CD strictly scoped until V3 retires.
2. **The tabbed canvas is genuinely net-new.** `CanvasTabStrip.tsx` rebuilds the left-rail "Open" section as a horizontal strip and is the largest new build. Confirm contiguous deal-grouping must not fight `reorderTabs`' Today-pin guard, and that the ⌘K palette is in scope.
3. **The SVG charts are net-new.** `shared/charts/` (Sparkline/Area/Donut/Waterfall/Heatmap/Bar/Stage) are additive — `models/Charts.tsx` stays Chart.js for PDF. Confirm the Heatmap reads our slate-blue `--accent` ramp rather than CD's raw `oklch()` interpolation.
4. **Missing data backends — DECIDED: build them (no honest-empty).** Per brief §"data contracts" these had no backend; we are now **building them as part of the migration** so every widget renders real (still zero-hallucination — real or "—", never fabricated). New backends to add (each its own slice, before/with the surface that needs it):
   - **Portfolio-value time-series** (powers Today's "Pipeline value" 12-week chart) — snapshot aggregate EV over time (new `portfolio_value_snapshots` table + a daily worker write + `GET /api/portfolio/value-series`).
   - **Per-deal IRR / returns history** (powers the "weighted IRR" KPI + per-deal IRR sparkline + the deal base-case IRR/MOIC card) — surface IRR/MOIC from each deal's latest LBO/DCF analysis run; trend = the series of saved runs. `GET /api/deals/:id/returns` + a portfolio rollup in `/api/portfolio/summary`.
   - **Comps / market feed** (powers Market pulse + the deal comps/prime/fed-funds) — extend the market-data service (`marketDataService.ts` FRED + CBP + the comps already in the per-deal profile) into a `GET /api/intelligence/market-feed` for the tickers, and surface `getMarketIntelligenceProfileForDeal` comps on the deal panel.
   Until a given backend lands its slice, that widget shows honest-empty — it is never faked.
5. **Reuse-vs-rebuild scope per surface.** Confirm the default is **reskin-in-place** (V6 out-features CD nearly everywhere): keep our 14-tool catalog over CD's 6, our live `core.ts` calc over CD's `computeDCF`, our RBAC team + provenance + DEFINITIVE chips. Net-new builds are limited to: the token layer, the tabbed canvas + palette, `IntelStack`, the SVG charts, `DealMarketPanel`/`StageTimeline`, `PortfolioRoot` SubTabs, `NotificationsView`, the shared state atoms, and the one synthesis backend.
6. **Two product laws hold throughout:** no eyebrow kickers / micro-labels (LOCKED 2026-06-01) — drop CD's `PUBLIC COMPS`, `BUYER UNIVERSE`, `weekday·date`, `Yulia·6:42 AM`; and the two-greens law — computed values wear `--st-good-fg`, indigo `--cd-accent` is CTA-only.
