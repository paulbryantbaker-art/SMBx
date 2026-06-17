# Desktop Phase-1 Implementation Spec

Last updated: 2026-06-17
Third and final guardrail doc. Read order: `DESKTOP_REBUILD_BRIEF.md` (rules) →
`DESKTOP_BACKEND_MAP.md` (what backend exists) → **this** (how to build it).

> Produced by a 17-agent workflow: one shell-feasibility pass, then a build
> contract for each of the 8 surfaces, **each adversarially verified against the
> real codebase**. The verification caught all 8 contracts describing a
> `V6Desktop` shell as if it already existed (it does not) and reclassified them
> honestly; it also surfaced three real backend bugs (see §6). Every endpoint,
> hook, and component below was opened and confirmed in source.

## 0. The one critical reframe

There is **no desktop shell to mount into.** `V6App.tsx` renders `V6Mobile` on
every viewport. So this is **not "reuse an existing desktop surface"** — it is a
**net-new desktop shell that composes the existing mobile screen components and
hooks.** Build the shell first (Phase 0); the surfaces then mount into it with
near-zero per-screen work because the screens are already prop/callback-driven.

**Shell feasibility = reuse-with-refactor (verified).** The mobile screens are
prop/callback-driven with **zero internal routing** (grep for wouter/useLocation
across `screens/` returns nothing — all nav lives in `V6Mobile.tsx`). `modelStore`
(zustand) is already global and shared. The **only** blocker is `position:fixed`
viewport chrome (see §2).

## 1. Shell architecture (Phase 0)

New file `client/src/components/v6/V6Desktop.tsx`, selected by `V6App.tsx` at a
desktop breakpoint (mobile path stays byte-for-byte unchanged):

```
<V6Desktop user>                         // owns ALL shared state + data hooks
  ├─ hooks lifted verbatim from V6Mobile.tsx (anon+authed bridge build,
  │    useMobileDeals, useNotifications, useAudience, useModelStore)
  ├─ shellState: { activeSurface: today|pipeline|sourcing|studio|integration|files,
  │                selectedDealId, selectedDealTitle, quickLook, workspaceOpen }
  ├─ <Masthead/>          // top nav (NO left rail); buttons call setActiveSurface
  ├─ <ContentPanes/>      // master-detail; each pane position:relative, own scroll
  │     ├─ MasterPane → the active surface screen, passed the SAME props V6Mobile passes
  │     └─ DetailPane / DealWorkspace overlay → DetailScreen / Analysis / Model
  ├─ <QuickLook/> overlay
  └─ <PersistentYuliaComposer chat={bridge}/>   // HYBRID: docked input always visible,
        expands into the reused ChatSheet ({open,onClose,chat})
```

**How surfaces mount:** identical call shape to `V6Mobile.tsx` screen rendering;
only the `on*` callback **bodies** change from `setView({...})` to
`setActiveSurface / setSelectedDeal / openWorkspace`. Because screens never read
view state, swapping handler bodies is sufficient — **no edits to screen logic.**

**Shared state:** `selectedDeal`/`activeSurface` live in `V6Desktop` useState.
Selection flows down as props, up via callbacks. Canvas actions reuse the
`smbx:canvas_action` window listener **verbatim** from `V6Mobile.tsx` — it already
drives the shared `modelStore`, so a model opened from the desktop composer is the
same live tab the canvas shows.

## 2. The required refactor (blocks Phase 0)

`GlassTopBar` (`mobile/TopBar.tsx`) renders **three `position:fixed` strips**
(`chromeSentinel`, `barWrap`, `floatingChrome`) anchored to the visual viewport.
Inside a pane they anchor to the **window**, not the pane — chrome floats over the
whole desktop. Same issue: `Analysis.tsx` `floatBack/floatShare/chatDock`,
`LibrarySearch.tsx` `docChatDock`.

**Two-birds fix:** `chromeSentinel` sets a background on a `position:fixed`
element — that is also a **CLAUDE.md rule #5 violation** (Safari toolbar-tint /
dark-mode bug). Convert these to `position:absolute`/`sticky` inside a
`position:relative` pane wrapper. **Precedent already in the repo:** `Model.tsx`
header is `position:sticky` by deliberate design — copy that pattern. Implement via
a `surfaceMode:'pane'` prop (mobile default keeps `fixed`; desktop passes `'pane'`).
`Detail.tsx` `FloatingNav` and `LibrarySearch` float buttons are **already**
`position:absolute` — confirm they stay inside the relative pane; no change.

## 3. Corrected phasing

- **Phase 0 — Shell + chrome refactor.** `V6Desktop` (masthead + panes + persistent
  composer), the `surfaceMode:'pane'` refactor, lift the bridge build + canvas
  listener + shared state. Prerequisite for everything.
- **Phase 1 — Reuse surfaces, zero backend.** Today, Pipeline, DealWorkspace,
  Studio, Files, Yulia composer. Mount existing mobile screens/hooks; only callback
  bodies differ.
- **Phase 2 — Net-new UI over existing backend (+ thin fixes).** Sourcing
  (over `/api/sourcing/*`; needs the SSE token-auth fix + the `is_active` bug fix,
  §6), Integration (over native PMI `/integration-plan`).
- **Phase 3 — Genuine backend builds.** Structured deal `risks[]`; candidate EBITDA
  + a real candidate `draft-outreach` endpoint; data-room members / Shared-by-Seller
  / verdict-tags; nested folders (`data_room_folders.parent_id`); paywall SSE emit;
  audit-schema fix; `due_at` wiring.

## 4. Per-surface build contracts

Each is **verified**: components/hooks/endpoints opened in source. Cite files +
symbols; line numbers drift — grep the symbol.

### 4.1 Today — reuse · Phase 1
- **Reuse:** `screens/Today.tsx` (TodayScreen) with the exact prop shape `V6Mobile`
  passes (onOpenDeal, onChat, onSearch, userPipeline, featured, audience, realEmpty,
  notifCount, …). Zero logic change.
- **Hooks:** `useMobileDeals` (the only pipeline/featured source), bridge
  (`useAuthChat`/`useAnonymousChat`), `useNotifications`, `useAudience`. (`useWatchlist`
  is internal to the screen.) Internal fetches `GET /api/agency/portfolio-brief`
  (market read) and `GET /api/deliverables/all` (Recents) ride along free.
- **Honest-empty:** `loaded && !hasData` → StarterHero (never a sample deal); fit
  numeral only when `fitIsReal`; market read null → "ask for the brief" CTA; Recents
  empty → "Nothing filed yet". **EV / captured-$ never render** (no such number).
- **LINE:** lead-card CTAs route to chat; IOI *send* is the staged-confirm point
  (handled by the bridge). Market read is editorial, never a recommendation.
- **Note:** CD's gate-countdown + "What needs you" bands are **not** in mobile Today;
  they are Phase-2 additions over `/api/user/next-actions` + `/api/agency/today-operating-brief`
  (zero backend build, just new bands). Decide if Phase-1 Today = mobile layout faithfully.

### 4.2 Pipeline — reuse · Phase 1
- **Reuse:** `screens/Pipeline.tsx` (PipelineScreen, PipelineKpis, PipeRow),
  `VerdictPill`, `SectionHeader`; `pipelineStages.ts` (PIPELINE_STAGES, stageForGate).
  Row opens DetailScreen as the brief slide-over.
- **Hooks:** `useMobileDeals` (the ledger + KPIs from `all`), `useWatchlist`.
  (`usePipelineProgress` is **sourcing-only** — not this surface; the original pointer
  was wrong.)
- **Endpoints:** `GET /api/deals`; KPI weighted-EV optionally from
  **`GET /api/portfolio/summary`** (corrected path — NOT `/api/pipeline/...`).
- **Adapters:** CD funnel chips (Sourced/Screened/In review/Pursuing/Watching) are
  **hardcoded samples** in the file — derive honest counts from `all` instead, OR
  relabel real 5-stage groups (open decision). League band `{ffMin..}` → real
  `MobileLeagueBand {min,max,implied,pct,inRange}`. Gate string→`stageForGate`.
- **Honest-empty:** real user never sees `SAMPLE_*`; cents-correct money
  (`normalizeRawDeal`/`fmtM`); fit numeral only for real `seven_factor_composite`.

### 4.3 DealWorkspace — reuse · Phase 1
- **Reuse:** `screens/Detail.tsx` (DetailScreen) **is** the Deal-brief tab — it
  already self-fetches `GET /api/deals/:id` + `GET /api/agency/deals/:id/brief`,
  builds the stage tracker (`buildMobileStageProgress`) and the league football-field
  that flips ABOVE/BELOW RANGE (`buildMobileLeagueBand`/`LeagueBandStrip`). Data-room
  tab = `LibraryDetailScreen`; Team = `MobileDealTeamScreen`.
- **Tabs mapping:** Deal brief = DetailScreen as-is; Data room =
  `LibraryDetailScreen(dealStage:'data-room')`; Financials/Diligence = same screen
  filtered by folder/gate (keeps Phase 1).
- **Adapters:** verdict via `verdictFromLabel` (maps STRONG/PURSUE→pursue etc.);
  fit = `dealBrief?.verdict?.score ?? deal?.fit`; **gate names from
  `shared/gateRegistry.ts`** (B2='Valuation') — NOT `portfolioBrief`'s `gateLabel`
  (B2='Underwriting'). No EV column — `asking_price` is the price anchor.
- **Honest-empty:** no brief → fit '—', badge "No read yet", no league band,
  "Generate the read" CTA. Stat tiles pushed only when their cents value is real.
- **LINE:** header **Share** mints a `cim_share_link` → staged-confirm; and
  `POST /api/deals/:id/share-links` **requires `livingCimId`** (resolve from
  `GET /api/deals/:id/data-room` first, else 400). Keep the "descriptive, not advice"
  basis line. `taxLegal.signoffFlags` = CPA/counsel handoff, never an opinion.

### 4.4 Studio — reuse · Phase 1
- **Reuse:** `screens/Analyses.tsx` (CATALOG already groups **16** analyses into
  Value/Diligence/Structure — CD's "13" is illustrative; keep all 16),
  `screens/Analysis.tsx` (verdict/KPIs/valuation range/scenario sliders/version
  history/export), `screens/Model.tsx` + `components/models/*` (the 11 interactive
  models via shared `modelStore`), `DeliverableComments.tsx`.
- **Endpoints (all verified):** `POST /api/deals/:id/analysis`;
  `GET/POST /api/analysis-runs/:id` (+ `/versions`, `/assumptions`, `/restore`);
  `GET /api/deliverables/all`. **Zero backend work.**
- **Adapters:** verdict `{label,tone,score}` via `sentenceLabel`; EV from
  `calculations.midpoint`/base_case; league band built at read layer; pricing bridge
  from `tables['Valuation bridge']`; money via `formatMoneyCents`.
- **Honest-empty:** IRR/MOIC/synergy '—' until the model is run; EV '—' when no
  earnings; export hidden until a `deliverableId` resolves; WorkSeal only on a real
  `model_output_hash`. **Captured-$ permanent dash.**
- **LINE:** `runContractedAction` routes irreversible nextActions through staged
  confirm; "Optimize" only asks Yulia; keep tax/legal/appraisal triggers visible.
- **Docs/Data-room canvas tabs** reuse `LibraryDetailScreen`/finder — not net-new.

### 4.5 Files — reuse · Phase 1 (two-level), members/tags Phase 2-3
- **Reuse:** `screens/LibrarySearch.tsx` exports — LibraryScreen, LibraryFinderScreen,
  LibraryDetailScreen→RealDealDataRoom, LibraryDocumentScreen→RealDocumentReader,
  ShareSheet, RealUploadBar. All prop-driven, drop in unchanged.
- **Hooks:** `useLibraryWorkspace` (internal; lift to a hooks file to share),
  `useMobileDataRoom(dealId)`, `useMobileShareLinks(dealId)`.
- **Endpoints (all verified):** `GET /api/deals/:id/data-room`;
  `POST /api/deals/:id/data-room/file`; `POST /api/data-room/:id/upload` (50MB,
  multer); `PATCH /api/data-room/documents/:docId` (lifecycle-gated);
  `GET /api/data-room/documents/:docId/download` (S3 presigned);
  share-links GET/POST/DELETE; `GET /api/deliverables/all` + `/:id`.
- **Adapters:** folders are **FLAT** — render the Miller view as **two levels**
  (source → folder → documents), not arbitrary nesting (nesting = Phase 3 schema
  change). `file_type` enum for uploads = {pdf,docx,xlsx,csv,pptx,txt,other} ∪
  {deliverable} for filed deliverables. DB status value is **`complete`** not
  `completed`.
- **Sidebar gaps:** **members** (endpoint `GET /api/deals/:id/participants` exists,
  no hook yet — Phase 2 thin hook), **Shared-by-Seller** (no per-doc side flag —
  Phase 3 or omit), **Tags Pursue/Watch/Pass** (no deal disposition column — drop or
  repoint at sourcing — Phase 2/3).
- **Honest-empty:** no fit/verdict/EV/captured-$ anywhere in Files (no source);
  provenance seal only on a real `model_output_hash`; ShareSheet with no
  `livingCimId` → "Generate a CIM first" (never POSTs → would 400).
- **LINE:** share create/revoke already behind explicit ShareSheet + arm/confirm;
  status-advance respects server lifecycle; uploads owner/full-access only.

### 4.6 Sourcing — **net-new** · Phase 2
- **No mobile screen exists.** Don't reuse a UI; read the existing backend. Lift the
  shapes/helpers **verbatim** from `components/chat/PortfolioCanvas.tsx` (Candidate/
  Portfolio interfaces, `formatRevenue` cents→display, `TIER_COLORS`, `STATUS_LABELS`)
  — it already implements the exact read path but is orphaned. **Do not copy
  `SourcingPanel.tsx`'s `Thesis` interface — it is stale/wrong vs the DB.**
- **Endpoints — corrected `sourcing.ts` route map (grep by symbol):** theses GET 17 /
  POST 38 / PATCH 69 / DELETE 101; scan POST 215; pipeline POST 367; portfolio GET
  393; brief GET 418; progress SSE 437; candidates GET 498; candidate GET 539;
  candidate PATCH 558; portfolios GET 591; enrich POST 613.
- **Adapters:** candidate revenue = `estimated_revenue_low_cents`/`high_cents` (a
  **range**, often null) via `formatRevenue`; fit → `total_score` (0-100) + `tier`
  (A/B/C/D); status = **`pipeline_status`** enum {new, reviewing, contacted,
  responded, meeting, pursuing, passed, archived}; mandate filter = **`is_active=true`**
  (no `status` column); location = compose `City, ST` from city+state. **No EV /
  league band / verdict on candidates** — drop them.
- **Honest-empty:** Tier-0/1 candidates have null revenue/rating/signals → dashes,
  never zeros. Banner "screened N" = `total_candidates`, "ranked N" = `a_tier_count`;
  **"N ready for outreach" has NO backing field → dash/omit** (do not fake it).
  No-thesis → "define a mandate"; thesis-but-no-portfolio → "run discovery" (POST
  `.../pipeline`).
- **LINE:** "Draft outreach" = irreversible counterparty contact → staged-confirm;
  drafts land in Documents; **no send endpoint exists** (don't invent one).
- **Phase-2 thin fixes required:** the SSE progress route only reads the Authorization
  header but the hook auths via `?token=` → 401; either add a query-token fallback or
  poll `GET /api/sourcing/portfolios/:id`. Also fix the `is_active` bug (§6).

### 4.7 Integration — **net-new** · Phase 2 · NATIVE PMI, no Asana
- **No mobile screen exists.** New master-pane screen reading native PMI.
- **New hook:** `useIntegrationPlan(dealId)` → `GET /api/deals/:id/integration-plan`
  (honest-empty `{plan:null,workstreams:[],milestones:[]}`). Company tabs from
  `useMobileDeals` filtered to `journey_type==='pmi'`.
- **Endpoints (verified, mounted at index.ts):** GET integration-plan; POST
  `.../generate` (full-access, 403 else); PATCH `.../workstreams/:wsId` (full-access);
  tool `generate_integration_plan` from the composer.
- **Adapters:** lever `cost_synergy→Cost`, `revenue_synergy→Revenue`; **no "Multiple"
  lever** (drop it); `target_value_cents`/100 at display; status already mapped to
  `{kind,label}` server-side — consume directly; Day-bar = `clamp(today−createdAt,0,100)`
  labeled **"Day X of 100 since plan created"** (no close_date anchor exists).
- **Honest-empty (hard requirement):** **captured-$ always a dash** ("Illustrative
  target; verified capture needs a finance connector"); **%-to-target** dash (only
  execution % is real); **key-staff retention** dash (no field); per-initiative due
  dash (`due_at` exists but unwired). "Initiatives at risk" = workstreams with
  `kind==='warn'`.
- **LINE:** read surface (no staged-confirm to view); **regenerate is destructive**
  (replaces tracked workstreams) → confirm; every $ labeled illustrative; hide
  generate/PATCH controls for non-full-access and surface the 403 honestly.

### 4.8 Yulia composer (HYBRID) — reuse · Phase 1
- **Reuse:** `ChatSheet.tsx` AS-IS ({open,onClose,chat}) for the expanded thread — it
  already renders the streaming trace ledger ("current work"), staged-action
  confirm/cancel cards, history, and upload, and self-portals `position:fixed inset:0`
  (correct for an overlay; no pane refactor needed). The **docked input bar** is the
  only net-new chrome.
- **Bridge:** lift the anon+authed bridge build verbatim from `V6Mobile.tsx`
  (`useAuthChat`/`useAnonymousChat` → MobileChatBridge, stable-thread useMemo).
- **Endpoints (verified):** `POST /api/chat/conversations/:id/messages` (SSE:
  text_delta, tool_start, tool_done(canvas_action), staged_action, done);
  conversations CRUD; `POST /api/agency/actions/:id/confirm|cancel`; upload.
- **Adapter:** **`buildDesktopSurfaceContext` is dead code** expecting the deleted
  `Tab[]` model — add a thin overload `buildYuliaDockSurfaceContext(activeSurface,
  selectedDeal)` (read-layer only).
- **LINE (fully inherited, zero new code):** staged_action SSE → StagedActionCard →
  confirm/cancel POST; nothing auto-runs; anon bridge omits upload/confirm/cancel →
  show sign-in-gated affordances, never fake-enabled controls.

## 5. Cross-cutting (every surface)
- **Cents discipline:** postgres-js returns money columns as **strings** — coerce via
  `normalizeRawDeal`/`toNum` at the fetch boundary; all money integer cents end-to-end
  (Rule #10).
- **fitIsReal:** render a fit numeral only when real; synthetic id-hash fit → dash.
- **Captured-$:** always a dash with an illustrative-target note (native PMI law).
- **Staged-confirm:** reused unchanged via the chat bridge — outreach/IOI/share/
  advance-gate stay gated.
- **No eyebrows / micro-text** (CLAUDE.md LOCKED 2026-06-01).
- **No new data layer:** every value traces to an existing endpoint; grep must show no
  new fetch URL on Phase-0/1 surfaces.

## 6. Real bugs found (fix regardless of desktop)
1. **`get_sourcing_portfolio` throws.** `tools.ts` (~line 3938) queries
   `buyer_theses ... status='active'` — there is no `status` column (only `is_active`).
   Postgres errors at runtime. Fix to `is_active = true`.
2. **Sourcing SSE progress 401s in prod.** `GET /api/sourcing/portfolios/:id/progress`
   uses header-only `requireAuth`, but `usePipelineProgress` authenticates via
   `?token=` query (EventSource can't set headers). Add a query-token fallback.
3. **Free-tier paywall is not wired.** Client plumbing is live (`useAuthChat` handles
   `type:'paywall'`, ChatSheet renders PaywallCard) but **no server code emits a
   `paywall` SSE event** — grep across chat.ts/aiService.ts/governedToolExecutor.ts =
   0. Critical Rule #3 (one free deliverable, then paywall) is currently unenforced in
   the stream. Wiring the server emit + anon limit signal is **new work**, not reuse.

## 7. Open product decisions (don't block Phase 0/1)
- **Pipeline funnel labels:** keep CD's chip labels (build a deterministic
  gate/verdict→bucket map) or relabel the real 5-stage groups? (Honest minimum = the
  latter.)
- **Today bands:** is Phase-1 Today the mobile layout faithfully, or does it add the
  gate-countdown + "what needs you" bands now (zero backend, over existing endpoints)?
- **Files sidebar:** which of members / Shared-by-Seller / Tags are in v1 vs deferred?
- **Nested folders:** accept two-level (source→folder→docs) for v1, or schedule the
  `parent_id` schema change (Phase 3)?
- **QuickLook:** reuse DetailScreen in a drawer (heavier, self-fetches) or a lighter
  summary off the already-loaded `useMobileDeals` row?
