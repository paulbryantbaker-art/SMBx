# smbx.ai — UI build list for Claude Design

It's **smbx.ai** (not "Meridian"); the right-rail Copilot is **Yulia**. Keep your mock's chrome: left deal sidebar, top tabs, center "Ask Yulia / build a model" bar, right Yulia rail.

## Top tabs: Today · Portfolio · Analysis · Studio

### Today  *(your mock — build as designed)*
- Greeting + "{N} active mandates · ${X} aggregate EV in play"
- Yulia **morning briefing** card + action chips
- 4 **KPI cards**: active mandates · aggregate EV · weighted IRR · tasks due today
- **Pipeline value** line chart
- **Today's priorities** (the to-do queue)
- **Active deals** table — deal · stage · EV · IRR · trend
- **Sector allocation** donut
- **Market pulse** (sector heat + comps)
- **Recent activity** feed

### Portfolio
- **Pipeline** (default): deals grouped by stage; each row shows EV · multiple · blockers · next step.
- **Search** (sub-tab): market discovery — find buyers, targets, capital, advisors.

### Analysis
- **Analyses** (default): the model catalog (Valuation · DCF · LBO · QoE · Comps · SBA · Sensitivity · Tax · Earnout · Cap table · Working capital · Covenant · Compare), "what to run next per deal," and which models are stale. Running one opens a live model.
- **Files** (sub-tab): all documents organized by deal, plus each deal's data room.

### Studio
- Build marketing books: pitch books, CIMs, decks.

## ⭐ THE CORE — Today is an INTELLIGENT dashboard, not a display *(design + demo this; don't let it get lost)*

This is the soul of the product and the easiest thing to skin away. A KPI grid + chart + task list is a *dashboard*. The product is **per-deal intelligence**: Yulia fuses four real signals into a guided, educational read per active deal. **Today's body is a stack of these "intelligence reads," one per mandate** (the KPIs / chart / donut / activity are the supporting cast below them). The same read is the lead of each **Deal detail** page.

**Demo it now with realistic placeholder content** so the structure is designed-in; Claude Code wires it to the real synthesis later. Anatomy of one card:

- **Header:** deal name · **League badge** (L1–L10 label) · journey · gate — e.g. `League 5 · Logistics · B3 Diligence`.
- **Where you stand** (methodology progress): what's **done ✓** vs **needed** for this league/gate + a **readiness %**.
- **Market read** (alignment): heat label + multiple direction + the **descriptive implication** — *never* advice.
- **Your move:** the single highest-leverage next step **+ why** (tied to gate × market). `[Run]` `[Ask Yulia]`.

**Demo content (use your mock's deals):**
- **Project Meridian** — `League 5 · Logistics · B3 Diligence`. Done: QoE ✓ Valuation ✓ Comps ✓. Needed: **Working-capital peg**, **Confirmatory DD**. Readiness **62%**. Market: logistics multiples **contracting** (FedEx/ODFL −1%); 8.2× sits **top of band** → exit range tightening. **Move:** run the WC peg — the one thing between you and the valuation gate, and where the market pressure lands.
- **Project Atlas** — `League 6 · Healthcare Tech · B1 IOI`. Done: Buyer fit ✓ Comps ✓. Needed: **Valuation range** before the 11:00 IOI. Readiness **48%**. Market: healthcare multiples **stable**, buyer universe deep. **Move:** finalize the IOI valuation range.
- **Project Lumen** — `League 7 · Semis · B2 Modeling`. Done: DCF ✓ LBO ✓. Needed: refresh **Comps** (2 days stale). Readiness **71%**. Market: semis **rallied +3.2%** → implied exit lifts. **Move:** re-run Comps to capture the rally.

**Field → real-data map (for the Claude Code translation):**
| Card element | Real source |
|---|---|
| League badge | league classification (`server/constants/v19Leagues.ts`) |
| Done ✓ / Needed | operating brief `gateCountdown.requiredModels` / `requiredCitations` / `blockers` + deliverables already run |
| Readiness % | DEFINITIVE readiness `score` |
| Market read + implication | per-deal market-intelligence profile (`getMarketIntelligenceProfileForDeal`: heat, `multipleDirection`, comps, FRED) |
| Your move + why | synthesis of `gateCountdown.nextAction` × the market implication — **descriptive (THE LINE), never "buy/sell/counter"** |

> **Flag for the build:** the *fusion* of these four into one read is a **new backend synthesis endpoint** (doesn't exist yet — the pieces live in separate endpoints). CD demos the structure with the content above; Claude Code builds the `deal-intelligence read` to fill it. **Mark this demo content as PLACEHOLDER that maps to the fields above** so the intent translates cleanly.

## Detail pages
- **Deal** (click a deal in the sidebar): overview + stage progress · its data room (folders + files) · its models/analyses · deal team (people, chat, comments) · activity.
- **Model** (open from Analysis or Yulia): a live, **editable** model on the canvas — change an assumption (e.g. EBITDA) and the numbers update; save as a scenario.
- **Document** (open from Files): the doc with its status (draft / review / final), in the editor.

## Canvas (the main work panel = a TABBED canvas)  ← *missing from the current build*
The center work area is a **tabbed canvas**, like an IDE / browser tabs. Opening anything — a model, an analysis, a document, a deal — opens it as a **persistent tab** across the top of the canvas. **Multiple stay open at once** and the user switches between them **without losing state** (a half-edited model stays half-edited when you tab away and back).
- **Tabs stack and group by relation.** Tabs that belong together cluster: e.g. a deal's Valuation + its LBO + that LBO's "5.5× scenario" sit as a related group; scenarios of a model nest next to the model they came from.
- Every "Open in canvas / Open scenario / Add to DCF" from Yulia (below) **opens a new related tab** next to the current one — it doesn't replace what you're looking at.
- Each tab: small kind icon (model / analysis / doc / deal) · title · close (×). A "+" / overflow handles many open tabs.

## Yulia (right rail)
Chat that *does the work*: ask → Yulia builds a model/analysis and shows the result inline with chips like **"Open in canvas / Add to DCF / Open scenario."** Follow-ups compound ("stress at 5.5× leverage"). Each chip **opens a new tab in the canvas** (see above) — promoting the inline result into a full, editable surface beside whatever's already open.

---
**Two rules to keep:** (1) Yulia shows analysis, options, and implications — it never tells the user to accept/pass/counter/sign/negotiate (no transaction advice). (2) Every number is real or shows "—"; never fabricate data to fill a chart.

---

## Migration model — what else CD must account for

The sections above are the **information architecture**. This is the **state, data, and surface inventory** a re-skin must hit. None of it changes the IA — it's what lives inside each surface. Real names only.

### States — every surface has four, not one
Two shared primitives skin every surface: `YuliaSkeleton` (greyed shimmer rows + pulsing footer label) and `V6EmptyState` (rested card · 64px watercolor chip · `title` · one `body` · ≤1 `action`). **Real-or-empty law:** skeleton mid-load → real data OR an honest empty card. Never fake rows.
- **Loading** labels are surface-specific (`"Yulia is reading your pipeline…"`, `"Loading files…"`).
- **Empty/zero-deal** — every CTA routes to chat (`Start with Yulia`, `Source a deal`).
- **Error** — inline risk band, never a blank: `Couldn't load Today queue ({error}).`
- **Generating** — deliverable enum `queued · generating · failed · draft · ready`; doc tones `draft|review|locked|done`; DEFINITIVE disclosure chips `blocked_by_source_gaps · source_gaps_open · data_room_index_ready · ready_for_user_controlled_disclosure`.
Skin all four per surface, not just the happy path.

### The deal spine — what "stage" actually means
4 journeys, **22 gates** (`shared/gateRegistry.ts`): SELL/BUY/RAISE 6 each, PMI 4. `S2`/`B2`/`R2` are 🔒 paywall gates (Solo+); the rest free. The Pipeline's columns **collapse** 22 gates into **5 stages** via `stageForGate()`: `source · value · diligence · structure · close` (each with a sub-line). **Leagues L1–L10** set model depth + the `primaryMetric` (SDE ≤L2, else EBITDA) and multiple floor/ceiling. A "blocker" = an unmet `requiredField`/`requiredModel`/`requiredCitation`, or a counsel-deferral halt — that's what feeds Today's priorities queue.

### Entry & new-deal flow
Two-surface boundary (`App.tsx`): logged-out ALWAYS sees marketing; `V6App` renders ONLY for an authed user. Auth is **Google-only** (Login/Signup = a single "Continue with Google" — no email/password, no verify step). **There is no create-deal REST endpoint** — new deals are **chat-first**: mobile FAB → `AddDealSheet` (name + Journey segmented Buying/Selling/Raising) → composes a prompt → Yulia creates it in chat; desktop's `New deal` just opens the chat with that prompt. Every "add a deal" path lands in the chat seam.

### Collaboration — deal-centric, not social
`DealTeamView` (desktop 2-col Team + chat; mobile twin). **12 roles** (`attorney · cpa · broker · lender · re_agent · appraiser · escrow · title · insurance …`), each a toned pill; **3 access levels** `full · comment · read` (read = 403 on post/comment). `DealCommentsThread` is threaded, anchored to a `section_ref`, with Resolve, `⌘+Enter`, and `@mention` autocomplete. **Bell** (`V6NotificationBell`, polls 30s): types `mention · deal_request · deal_comment · new_document · gate_advance`, unread badge caps at 9+. **Share links**: `blind · teaser · full` + `requires_nda`/`max_views`/expiry/revoke. **Friends/DMs are RETIRED (migration 086) — do NOT skin them.**

### Model anatomy — what's inside "Open in canvas"
All 11 model types share one skeleton: an **Assumptions panel** (every edit → instant client `recalculate()`), **output metric cards** (LBO `irr/moic/dscr`; SBA `dscr/eligible/monthlyPayment`), a **chart**, and **auto-saved Versions** (max 20, each with a `changeReason` — **there is no Save button**). `sensitivity`/`comparison` models subscribe to a source tab. Yulia mutates the *same* zustand state (`update_model` → `{updates:{ebitda:150000000}}`, in cents).

### Documents & data room
Two entities: `deliverables` (Yulia artifacts, TipTap-editable) and `data_room_documents` (filed/uploaded, foldered, versioned). **`doc_class` chips:** `legal` amber · `marketing` sky · `working` gray. **Statuses:** `draft · review · approved · locked · agreed · executed · archived`. Folders are gate-gated + journey-templated; unmatched docs fall into a synthetic **Unfiled**. `DocumentEditor`: read-only by default / edit shows a toolbar + a Yulia "Revise…" bar. NDA gating blocks non-owners until signed; `read` seats can't file/upload/status/comment.

### Plans & gating
5 tiers `free | solo | pro | team | enterprise` (`client/src/lib/pricing.ts`). The paywall fires **after the first free deliverable** (not a fixed gate) — `PaywallCard` → `/unlock-gate` → Stripe. `V19UsageMeter`: plan pill + ~6 metrics (`Model runs`, `Studio exports`… `used/limit`) + scope pills (`Agents off|Supervised|Autonomous`). Features render conditionally via `/api/v19/entitlements`. (No billing-portal link exists yet.)

### Data contracts — the money footgun
**postgres-js returns `numeric`/`bigint` as STRINGS, and all money is in cents.** Hooks coerce via `toNum()` at the fetch boundary — any new consumer using a raw `typeof === "number"` guard silently drops the value (totals → 0, multiples → "—"). Live: `/api/deals`, `/api/portfolio/summary`, `/api/deliverables/all`, `/api/deals/:id/data-room`, `/api/intelligence/portfolio-heat`, `/api/agency/today-operating-brief`. **No endpoint exists for:** EV/portfolio-value time-series, per-deal IRR history — so the **"Pipeline value" 12-week chart and the "weighted IRR" KPI have no real backing yet**, and `byCloseWindow` is a gate-number heuristic, not real close dates. Show "—", not invented curves (or ask us to build the backend).

### Mobile scope — the decision that ~doubles the plan
Mobile is **NOT** a responsive reflow. It's a separate, hand-built surface (`components/v6/mobile/`): its own shell, a 4-tab bar + center chat FAB, **~14 screens**, **5 sheets**, and its own tokens. It shares the desktop **data layer** but **none of the visual system** — so re-skinning desktop alone leaves the whole mobile app on the old look.

> **Scope (decided): desktop first, mobile after.**
> - **Phase 1 (now):** re-skin the **desktop** surface — Today / Portfolio (+ Search) / Analysis (+ Files) / Studio, the detail pages (Deal / Model / Document), the tabbed canvas, and the Yulia rail — including all four states per surface.
> - **Phase 2 (later):** port the same look to the separate **mobile** surface (`components/v6/mobile/`: its own shell, ~14 screens, 5 sheets) against the shared data layer.
>
> Plan Phase 1 fully; treat mobile as a known, scoped follow-up — not a responsive afterthought.


---

## Surface detail — what's actually on each screen (mock all of this)

The IA, canvas, states, spine, and contracts above say *how surfaces behave*. This says *what's literally on each one* — the section inventory a re-skin must reproduce. Real component/section names. Lead two are the ones flagged thin: **Deal detail** and **Market Intelligence**.

### 1. Deal detail — the densest screen in the app *(`DealView` + `DealTeamView` + `DealCommentsThread`)*
One deal opens as **two tabs** — a `deal` tab (everything below) and a separate `deal-team` tab — plus comments that mount on its doc/analysis tabs. There is **no standalone activity feed or 6-month dossier component**; re-entry context is the verdict basis line + `fmtRelative` timestamps, not a panel. Skin the `deal` tab top-to-bottom:
- **Hero band** — verdict-tinted watercolor card; `wk-masthead` deal name; subline `$5.4M revenue · East Texas · industry · BUY · gate B2`; right-aligned **Fit** numeral. Glass action row, 4 journey-driven pills: `Open files` · `Data room` · `Team` · `Generate {LOI|CIM|Pitch deck|100-day plan}`. States: `LOADING DEAL…`, error band (falls back to reference layout), `actionError`/`actionNote` banners.
- **Stage progress card** — `Stage N of 6 — {name}`; right meta `{BUY} methodology · Next: {stage} · {done} of {total} deliverables complete`; 6-node track (B0–B5) with ✓ done / numbered current / upcoming, emerald connectors.
- **Yulia's verdict card** — verdict label + text + basis line `From Yulia's read · descriptive, not advice · {time}`. Empty: `Yulia is analyzing this deal` + `Ask for the read`.
- **Stats row** — 5 mono tiles w/ DERIVE tick: `REVENUE` · `SDE` · `EBITDA` · `ASKING PRICE` (with league-multiple band bar + `league L3: min–max× EBITDA`) · `MODELED VALUATION`.
- **Intelligence grid** — left `Market intelligence` (see §2); right `Structure read` (Tax / Legal columns) + `Yulia recommends` (≤3 next-move rows, `›`).
- **Data room / file explorer** (`DealFileExplorer`, opens when scope active) — header `Ask Yulia for a file` · `File latest to room`; scope rail `View deal` + `All Files`/`Data Room`/`Shared` (counts); `DataRoomReliancePanel` (freshness headline, `Ask Yulia`, model-rerun rows w/ status pill + `Rerun`); folder sidebar (`Portfolio / Deal`); file list w/ search `⌘K`, sections `ARTIFACTS · LEGAL DOCS · EXECUTED`; rows = icon, title, meta, `WorkSeal`/provenance, freshness warning, location path, status chip (`View`/`Draft`/`In review`/`Immutable`/`Action needed`), `›`.
- **Produced work** — `Analyses Yulia has run` (DCF/LBO/valuation cards) + `Documents Yulia has drafted` (CIM/LOI/memo cards) w/ `V6DocStatus`; per-section empty copy.
- **TEAM tab** (`DealTeamView`, the separate `deal-team` tab) — header (deal name, `N people · you own it/shared`, `Ask Yulia who to add`). **Team column:** `Invite` (owner only) → form (email + Role select of 12 + Access select full/comment/read + `Send invitation`); member rows (avatar, name, email · access, `RoleBadge`, settings/remove, inline role/access edit); `Pending invitations`. **Team chat column:** message count, threaded bubbles (name, `RoleBadge`, time-ago, @mention highlight, `Reply`), reply stack, compose textarea w/ @-mention autocomplete + send; read-only/empty/loading notes.
- **Contextual comments** (`DealCommentsThread`, on doc/analysis tabs) — `COMMENTS · N`, `Show N resolved`; rows (avatar, author, role chip, time, `Re: section`, body, `Resolve`/`✓ Resolved`); composer w/ @-mention menu, `⌘+Enter to send`, `Comment`.

Files: `client/src/components/v6/views/DealView.tsx` · `DealTeamView.tsx` · `hooks/useDealTeam.ts` · `shared/DealCommentsThread.tsx`.

### 2. Market Intelligence — exists richly server-side, surfaces thin *(flag both consumers for enrichment)*
The server already builds a full per-deal `MarketIntelligenceProfile` (NAICS, heat score, buyer-universe estimates, SBA capital availability, FRED prime/fed-funds, comps, forecasts, rule-changes, source gaps, citations, freshness) via `marketIntelligenceRuntime.ts` + `marketHeatService.ts` (heat 1–5, labels Cold→Super-Hot, multiple direction expanding/stable/contracting). It surfaces in **three** places — two of which under-read it:
- **(a) Portfolio Intel — `IntelRoot.tsx` (the full surface, reads it well).** Title `Market intelligence` · action `Ask Yulia what to watch`. Heat-posture band = 3 `HeatStatCell`s (Sectors running hot of N · Multiples expanding · Multiples contracting). `Your sectors` lead `Hottest now: {industry} — {label} ({score}/5)`. Sector cards (`g3`, one per portfolio industry): name, `{n} deals` chip, `HeatChip` + `HeatBar` + direction glyph ↗/→/↘, top signal/state, avg fit, `Get the market read ›`. Empty `No sectors yet`; loading `Yulia is reading your portfolio…`. Source `/api/intelligence/portfolio-heat`.
- **(b) Today widget — `MarketReadCard` in `TodayRoot.tsx` (THIN — enrich).** `Where your sectors are running` — top-5 ranked heat rows (industry, `label · {direction} multiples`, `HeatBar`), tap → ask Yulia. Empty `Add a deal industry…`. **Only name + label + direction + bar — no buyers, comps, multiples, signals, or FRED pulse despite the data existing.** Should carry prime/fed-funds + buyer-thesis movement.
- **(c) Deal-detail panel — `Market intelligence` section in `DealView.tsx` (THIN — rewire).** Headline (or `Yulia hasn't built a market read yet`), 4 fact tiles (Industry · Geography · Revenue · Earnings), clickable bullets → deeper analysis, `Source gaps` box. **Pulls from `dealBrief.marketRead`, NOT the richer `getMarketIntelligenceProfileForDeal` — so heat score, buyer universe, capital/SBA, comps, multiple direction, freshness/sources are all absent here.** Wire the profile in.

Endpoints (`routes/intelligence.ts`): `GET /portfolio-heat` · `GET /market-overview` · `POST /sba-analysis` · `GET /economic-indicators` · `POST /refresh-fred` · `GET /cbp` · `GET/POST /reports`. Files: `modes/IntelRoot.tsx` · `modes/TodayRoot.tsx` · `views/DealView.tsx` · `server/services/marketIntelligenceRuntime.ts` · `marketHeatService.ts`.

### 3. Today — command-center dashboard *(`TodayRoot.tsx`, max-w 1180, centered)*
Every figure real/computed; `Fit` is NULL on seed so shows `—`, never invented. Top-to-bottom:
- **Command header** — `Today` title; large display `fmtCents(totalEvCents)` (sum-only, never weighted) + `across N active deals`; right mono freshness stamp.
- **Empty state** — no deals/money → `Start your first deal` card + `Start with Yulia`, replaces everything below.
- **`What needs you`** (the lead, consequence-ranked command queue) — lede joining counts (`N deals with open gate items · N models need rerun · N files awaiting review · N ready to disclose`); ≤6 `CommandRow`s: **gate** (title, `gateId · gateName`, `BlockerChips`, `ReadinessBadge`, `Next: <action>`), **model** (`OpChip` status, `Why: <inputs> changed`, `Rerun ›`), **file** (`Ready to disclose`/`N source gaps` chip, `Review: <reason>`); tonal left rail + `Open deal/Rerun/Ask Yulia ›`. Overflow → `See all N in Pipeline ›`. Clear: `Portfolio is current…` + `Ask Yulia what's next`.
- **Portfolio shape strip** — 3 cells: `Gate-ready` (count) · `Blocked` (count) · `By stage` (pills `gateId ×count`, top 5). Hidden if none.
- **Strongest source** (demoted hero, `HeroFrame`) — watercolor verdict-textured: `Strongest source this week` eyebrow, deal name, sub, one real money metric, pills `Open deal` + `Ask Yulia`.
- **Market read** (`MarketReadCard`) — see §2(b).
- **Footer grid** — `Recent work` (top-4 deliverables → doc/analysis; `Open Files →`) + `Deals in motion` (top-6 rows: initials, name, sub, verdict/price pill; `See all →`).

### 4. Pipeline + All-deals list *(`PipelineRoot.tsx` + `DealsListView.tsx`)*
- **`PipelineRoot` — desktop ledger schedule.** Head: `Pipeline` + sub `Your deals by stage — weighted value, fit, and what's blocking each gate.` + `All deals` + `New deal` (→ Yulia). KPI band (`.mhead`): `Deals in motion` · `Total ask` · `Weighted EV` (only when real fit exists) · `Median fit` · `Blockers` (green at 0). `NextMoveBar` (gold) = top blocked deal + next action + `Open deal`, only when a real blocker exists. **Stage-grouped ledger** (`.wktable`, one `<tbody>`/stage), columns `Deal` (glyph + name + industry·location) · `Stage` · `SDE` · `Asking` · `Multiple` (asking÷EBITDA as `N.N×`; green in-band / rust out) · `Fit` (`FitRing` + int) · `Ready` (`ReadinessBadge`) · `Verdict` (statpill Pursue/Watch/Pass); verdict-tinted 3px left rail; clickable per-stage aggregate header `{N deals} · {$ ask}`; capped 5 rows/stage, overflow `See all N in {stage} →`; total row. `Yulia's ranked read` card list (rank, name, sub, verdict statpill, green fit; sub `What Yulia would look at first.`). Loading `Yulia is reading your pipeline…`; empty `No deals yet` + `Source a deal`.
- **`DealsListView` — All deals.** Head `All deals` + `Showing X of Y deals` (appends `· sample data` logged-out, 60 deterministic SAMPLE_DEALS). Filters: search (name/industry/location/league/gate) + journey chips `All/Buy/Sell/Raise/PMI` + stage chips `All stages/Source/Value/Diligence/Structure/Close/PMI`. Columns: `Deal` · `Journey` (ToneChip) · `League` · `Stage` (ToneChip) · `SDE` · `Asking` · `Status` (statpill active/stalled/closed). Pagination 100 + `Show next 100`.

Files: `modes/PipelineRoot.tsx` · `modes/DealsListView.tsx` · `lib/pipelineStages.ts`.

### 5. Analyses page + the opened model *(`AnalysisRoot.tsx` + `ModelCanvasView.tsx`)*
- **`AnalysisRoot`** (max-w 1180) — `pg-head` title `Analyses` + sub `Yulia recommends what to run next per deal and gate` + `New analysis` (`Running…`). `wkerr`/`wknote` band. **Model freshness lead** — `wkcard` either `N models need a rerun` (≤3 stale rows: gold `OpChip` Rerun/Stale, title · deal, `X, Y changed`, ↗) or `Every model is current — no reruns waiting` + `Current` chip. **Recommended for your portfolio** — `g2` grid of ≤4 deal cards (business, `statpill` gate code · name, `fchip` gate-mapped tool buttons); empty `No deals in your portfolio yet`. **All analyses** catalog — collapsed `Browse all 15 analyses` toggle (auto-expands on search); `filterbar` + `N of 15` + `g3` tool cards (family-tinted tile, name, sub, chevron). **Recently run** — `wktable` (Title w/ family logo, Deal, Status `V6DocStatus` saved/live, Updated); empty `Nothing run yet.`
- **15 catalog tools** — `Recast P&L`·Find honest add-backs · `QoE`·Earnings quality + proof · `Comps`·Public + private benchmarks · `Valuation model`·Multiples + pricing bridge · `DCF`·Growth, WACC, terminal value · `LBO`·Leverage, MOIC, IRR · `Sensitivity`·Scenario table w/ sliders · `Tax impact`·Allocation + sign-off map · `Earnout`·Contingent value scenarios · `Buyer fit`·Score against thesis · `SBA structure`·Model leverage scenarios · `Working capital`·Peg, true-up, target NWC · `Cap table`·Dilution + waterfall · `Covenant check`·Compliance + headroom · `Compare deals`·Side-by-side next-action read. Families: valuation (green) · diligence (blue) · structure (gold).
- **Opened model tab** (`ModelCanvasView`, max-w 1280) — header card: display title, `working model not a one-time answer` blurb, status stack (`v{N}` accent pill, `WorkSeal` `MODEL.{type}.v1`/version/outputHash/time — "unsigned" when local, freshness pill live/current/needs_rerun/superseded via `--st-*`), actions `Ask Yulia to optimize` (dark) + `Compare versions`. **Grid** = `ModelRenderer` surface + sticky rail: `Version trail / Scenario history`, `Rerun if` dependency chips (≤4), ≤6 version rows (`v{N}` badge, change reason, time), divider, `Saved runs / Agent readback` cards (`v{N}`, short hash, freshness badge, saved time, key outputs, reason callout, `Explain`/`Rerun`/`Restore`). Not-loaded → `Ask Yulia to reopen.`
- **11 model types → renderers** — `valuation`+`sde_analysis`→ValuationExplorer, plus `lbo`, `sba_financing`, `dcf`, `tax_impact`, `cap_table`, `sensitivity`, `comparison`, `earnout`, `working_capital`, `covenant`. Per-model surface = KPI cards + inputs/sliders + chart: Valuation (SDE/EBITDA, Multiple range, Mid, SBA Eligible; ValuationRange + Waterfall charts; League select; methodology-weight sliders) · LBO (Entry Multiple, IRR, MOIC, Yr1 DSCR, Payback; optimize Target IRR/Min DSCR) · SBA (Loan, Monthly Pmt, Down, LTV, DSCR) · DCF (EV, PV FCF, PV Terminal, Terminal) · Tax (Stock vs Asset, Cap Gain, Fed 23.8%, State, Net Proceeds, Diff, §453) · Cap table (Founder shares, Rounds, Ownership, Exit Payout) · Earnout (Expected/Max/PV, Milestones) · Working capital (Peg, Variance, Months) · Covenant (Min DSCR/Max Debt-EBITDA/Max LTV vs financials) · Sensitivity (matrix from linked tab) · Comparison (Risk-Return, reads linked tabs).

Files: `modes/AnalysisRoot.tsx` · `views/ModelCanvasView.tsx` · `views/ModelRenderer.tsx` · `models/` · `lib/modelStore.ts`.

### 6. Files + data-room hub *(`FilesRoot.tsx` → hub `V6FilesRoot` + list `V6FilesListView`)*
- **Hub header** — title `Private deal libraries, plus shared data rooms.` + sub; actions kebab `⋯` (summarize via Yulia) + `Upload` (routes to Yulia, **not a real uploader**).
- **Source lanes** (`Files that need your eye`) — `g4` watercolor tiles w/ real mono counts: `All files` (deliverables + deal docs) · `Deal libraries` (deal count; `Portfolio › deal › stage`) · `Needs action` (review-queue/draft) · `Data rooms` (deals w/ docs). Tap → `files-list` tab.
- **Recents** (`g2` left) — ≤5 latest deliverables as `FileListRow`s (doc/chart/deal icon, title, sub `Deal · Models|status · 2h ago`, status chip); `See all`; empty `No recent files yet.`
- **Data rooms** (right) — ≤6 deal rows (icon, `room.deal`, `Journey · location`, `Data room active`/`Library ready` + `N items`) → opens deal w/ `data-room` scope; empty `No deal libraries yet.`
- **Needs action** (`#files-work-queue`) — review-queue items as `FileListRow`s; footer `N recent · N rooms · N queued`.
- **List sub-view** (`V6FilesListView`) — rooms views (`deal-libraries`/`data-rooms`) render `wktable` (`Deal | Details | Stage | Items | Action=Open`); file views group rows by deal.
- **Status chips** — tone pill (`draft`→review · `review`→diligence · `locked`→missing · `done`→good) + optional DEFINITIVE disclosure chip (`ready for user-controlled disclosure` good · `N gaps block disclosure` missing · `N gaps open` review · `data room index ready` diligence). DEFINITIVE rows open an `analysis`/artifact tab (packet identity, source gaps, next agent calls, portable artifacts); model-refresh rows route to Yulia.

File: `modes/FilesRoot.tsx`.

### 7. Studio — Pitch Book Studio *(`MarketingStudioView.tsx`)*
Title is **`Pitch Book Studio`** (not "Studio"). Two states in one component: home (book list) + `StudioCanvas` (book editor). No pitch/CIM/deck tab split — those are formats.
- **Studio home** — header + sub + kebab `⋯` + `New book` (→ Yulia picks format). `Start from a format` + `V19UsageMeter` (compact, surface="studio") when logged in. **Format grid** (`wkgrid g3`) — 7 cards, each `slideCount` + title + audience + detail + `Create →`: `Buyer Pitch Book` · `Seller Pitch Book` · `IC Deck` · `QoE Preview Book` · `CIM Summary Deck` · `Board Update` · `Lender Book` (tap POSTs a new book, opens canvas). Lower `wkgrid g2`: **Books in Studio** (count statpill; rows = 2-letter format icon, title, `format / vN / N slides`, `N gaps`/`clean` chip; empty `No books yet`) + **Model freshness** (`StudioModelRefreshPanel`: `Reading`/`N queued` chip; ≤3 rows model-initial icon, title, deal + changed-inputs, `needs_rerun`/review chip; empty `Model-linked books are clean`).
- **Book canvas** (`StudioCanvas`) — header: eyebrow `Pitch Book Studio`, title, format detail; status chips slide-gap (`N slide gaps`/`slides grounded`) + model health (`N model gaps`/`N models current`) + readiness (`export ready`/`N export gaps`/`readiness pending`); buttons `Refresh models` · `PDF` · `PowerPoint`. **Slide stage** = one `wkcard`/slide (2-digit number, `grounded`/warning chip, title, body, bullet grid, provenance strip `N facts · N models · N cites · N unchecked`). **Tool rail** (4+ cards): `Yulia instruction` (textarea + `Revise book` + `Ask Yulia`) · `Source tray` (sourceType/citation, linked/warn dot) · `Assumptions` (label/value rows) · `Model tray` (name, summary/"Needs X", output hash) · `Audit` (version note, top-4 readiness issues). Logged-out renders a local 6-slide draft (`Decision frame · Source read · Model view · Risks · Open questions · Next actions`).

File: `views/MarketingStudioView.tsx`.

### 8. Document detail / editor *(`DocView` live + `DocumentEditor` alternate)*
Live surface is `V6DocView` (a `doc` tab in `V6Canvas`): two-column "paper sheet on a desk" — centered article (max 820px) + sticky 280px rail. Polls `/api/deliverables/:id` every 4s until status leaves `queued`/`generating`.
- **Article (left)** — `Toolbar` (from `TOOLBAR_BUTTONS`): `Heading` (`H2 ▾`) · `Bold` (`B`) · `Italic` (`I`) · `Underline` (`U`) · `Link` · `Bulleted list` (`≣`) · `Quote` (`❝`); dividers after Bold + Link; `document.execCommand` on the contentEditable sheet. Toolbar right: `Save` (`Saving…`) + mono `SAVED · 12 MIN AGO` + `WorkSeal` (only when complete **and** real output hash, else `v{n} · completed`) + status chip. `toolbarNote` inline banner. **The sheet** = serif paper card: sentence-case eyebrow `{Doc type} · {status}`, `h1` title, `react-markdown` body in contentEditable. States: `LOADING DELIVERABLE…`, red error band ("…Showing reference layout."), generating empty, not-available empty, and a hardcoded **sample LOI** (Purchase Price & Structure · Diligence & Conditions · Working Capital · Transition & Non-Compete) w/ gold highlight + Yulia comment-marker dot when no real id.
- **Status chip** (`V6DocStatus`): `DRAFT` / `FINAL` / `LIVE` / `SENT` / `SAVED` mono caps (complete→live, draft→draft, else saved).
- **Right rail** — `YULIA · LIVE` card (contextual watch) · `DOCUMENT ACTIONS` card (`Ask Yulia` · `Request review` · `File to data room` · `Share safely` · `Regenerate`, each `Staging…`/`Regenerating…`, via `executeSurfaceAction`) · Comments (real `DealCommentsThread` when real id, else static sample) · `VERSION HISTORY` (rows `v3 · current` + relative dates from `/versions`, else sample).
- **Alternate `DocumentEditor`** (TipTap, not in live canvas) — `Editing` badge, `Save`/`Cancel`, `docClass` chip (legal/marketing/other), `DocumentToolbar` (Bold/Italic/Strike/H1–H3/lists/table/link/undo/redo), `Revise` bar → `POST /revise`. **No PDF/PPTX export control on either surface**; the read-only sheet carries `id="canvas-print-area"` for external print; pitch-deck export is a separate deliverable slug (`raise-pitch-deck`).

### 9. Search / discovery *(`SearchRoot.tsx` → result `AnalysisView`; pipeline `SourcingPanel` + `PortfolioCanvas`)*
- **`V6SearchRoot`** — `Search` title + sub `Market discovery — buyers, targets, capital, and the professionals who help you close.` **Composer** = magnifier glyph + input (`Describe what you're looking for — buyers, targets, capital, advisors…`) + `Search`; submit opens an `analysis` tab `Market discovery` (`tool: "market_discovery"`) + pings Yulia. **Workspace scorecard** (`mhead`, ≥1 active deal) — 3 tiles: `Sourcing for` / count · `Median fit` (from `seven_factor_composite`) · `Your sectors` (≤3 top-industry pill buttons). **Discover for your pipeline** (active deals only) — `g2` ≤4 deal cards `Buyers & comps for {business_name}` · `{industry} · {location}` · `›`. **Evergreen categories** — `Start a discovery search`, `g3` 6 cards (40px watercolor chip + Lucide icon + title + sub + periwinkle `Open`): `Potential buyers` · `Targets to buy` · `PE and capital` · `Deal professionals` · `Real estate & ops` · `Market maps`. **Quick starts** — 4 prompt buttons (`↗`): Find buyers / Build target list / Map PE firms / Find deal counsel.
- **Discovery RESULT — sourcing pipeline** (`SourcingPanel` + `PortfolioCanvas`) — Thesis rail (`{n} theses`, `+ New Thesis`; `Create Buy Thesis` form: Name, Industry, Geography, NAICS, Min/Max Rev, Min/Max Price; thesis cards w/ status chip + match count; empty `No buy theses yet`). `Generate Intelligence Brief` → spinner `Analyzing market data…` → `Acquisition Intelligence Brief`: narrative + collapsible `BriefSection`s (Market Density · Deal Economics · Acquisition Signals · Competitive Landscape · Key Risks · Recommended Search Parameters) + staged progress bar w/ candidate/A-tier/B-tier counts. **`PortfolioCanvas`** (when ready): `PipelineStatusBadge` (Initializing→Ready/Failed/Needs Refresh), stat chips Total/A-tier/B-tier/Pursuing, status filter pills (All/New/Reviewing/Pursuing/Passed), collapsible Pursuing + A/B/C/D tier sections of `CandidateCard`s (score badge, name, status chip, city·rating·founded·revenue, signal chips SBA History/Exit Signals/Recurring Rev/Basic data, AI summary, Pursue/Pass). **`CandidateDetail`** slide-out: Score Breakdown (6 `ScoreBar`s — Size/Geography/Industry/Acq. Signals/Quality/Risk), Business Details, Signals (Growth/Risks/Exit), `Get More Details`/`Run Deep Analysis`, Status pill row, Notes + Save. Legacy `Matches` list (score badge, name, status chip, industry/rev/price/location, Pursue/Pass/View listing).

Files: `modes/SearchRoot.tsx` · `chat/SourcingPanel.tsx` · `chat/PortfolioCanvas.tsx` · `views/AnalysisView.tsx`.

---
**Two things this appendix changes for the plan:** (1) **Deal detail is the heaviest single screen** — two tabs + threaded comments + a file explorer + a market panel, not one card stack; budget it like three surfaces. (2) **Market Intelligence is a build-and-wire job, not a skin job** — the data exists server-side; the Today widget and the deal-detail panel both under-read it and must be rewired to `getMarketIntelligenceProfileForDeal`, not just restyled.