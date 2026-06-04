# Substrate-First Plan — what needs to be redone

Last updated: 2026-06-04

## The architecture (three layers)
1. **Deterministic models = code (legitimately "hardcoded").** The math and match
   models — valuation, SDE/EBITDA, DSCR, IRR, LBO, DCF, match/fit *scores* — are
   computed by the server-side V19/DEFINITIVE model runtime (and the client
   interactive what-if canvas). These ARE supposed to be code. Don't touch.
2. **Methodology = the guide.** Gates / stages / requirements (`gateRegistry`,
   DEFINITIVE catalog) are the framework Yulia follows. Canonical; one source.
3. **Understanding = Yulia (the Claude brain).** The *interpretation* — verdict
   (pursue/watch/pass), where a deal is and what it needs, recommendations, the
   portfolio read, the narrative — is Yulia reasoning with Claude, guided by the
   methodology and fed by the model outputs. **Not a formula, not hardcoded rules.**
   It's the AI brain. This is a chat app / substrate for exactly this reason.

The app is the **GUI**: it renders (1) the model outputs and (3) Yulia's analysis.
It must **never compute the math (that's the model runtime) and never compute the
judgment (that's Yulia)**.

## The one rule
> Substrate value present → render it.
> Substrate value absent → render a skeleton / honest empty state.
> **Never** fall back to a client-computed verdict, fit, stage, blurb, or number.

## IA reference: desktop mirrors mobile
The "what goes on which surface / what nav" question is **already solved on mobile**.
Desktop **mirrors mobile's IA** (surfaces, cards, order, nav), adapted to the wider
canvas. We stop inventing desktop layouts.

**Mobile Today = the home spec (card stack):**
1. Daily hero — the strongest deal this week (verdict, FIT, headline figure), tap to open
2. Market intelligence — Yulia's portfolio read (headline + 3 signals + Ask Yulia) —
   **already renders `/api/agency/portfolio-brief`** (the pattern to copy everywhere)
3. Explore / today's quick wins — persona prompts → chat
4. Library preview — quick routes + docs needing attention
5. Analyses launcher — one tap to run a model
6. Activity — recent library activity
7. Pipeline preview — deals in motion (verdict pills, watch, See all, honest empty)

**Nav:** Today · Pipeline · Search · Files **+ Studio (desktop-only)** — pitch-book/CIM
work earns a top-level tab on the bigger canvas; mobile reaches it via Files/Analyses.

**Every card renders the substrate** (Yulia's brief + model outputs), never hardcoded.
The Market Intelligence card is the template. The hero + pipeline rows need Yulia's
per-deal read → see P0. Note: mobile's *data* layer has the same hardcoding sins
(SAMPLE_PIPELINE, DailyHero figures) — mirror its **IA**, fix its **data** with P0–P2.

## Already correct (don't touch)
- **Model hooks fetch, don't derive:** `useNextActions`, `useTodayOperatingBrief`,
  `usePortfolioSummary`, `useV6WorkspaceData`, `useDefinitiveSurfaceMechanics`.
- **Substrate contracts that already exist:**
  - `GET /api/agency/deals/:id/brief` → `verdict{label,score,text}`, `marketRead`, `taxLegal`, `nextMoves[]`
  - `GET /api/agency/today-operating-brief` → `dealPulse[]` with status/fit/verdict + `definitive{readinessLevel,score,nextSuggestedCalls,missingCount}`, `gateCountdown[]`, `modelRefreshNeeds[]`
  - `GET /api/agency/portfolio-brief` → `marketIntelligence`, ranked deals/files
  - `GET /api/user/next-actions` → gate-aware actions (server `getMissingForGate`)
  - `GET /api/portfolio/summary` → weighted EV
  - `GET /api/deals/:id/gates` → real `gate_progress` (per-gate status + completed_at)
- **Legitimately app-side:** pure formatting (`fmtCents`, relative time), the 11
  interactive what-if canvas calculators (`lib/calculations/core.ts`), pure renderers
  (`FitGauge`, `VerdictPill` — they render a *passed* value), and the **canonical**
  gate names/order from `shared/gateRegistry` (one source both server + app read).

---

## P0 — Render Yulia's analysis, not the app's guess (root fix)
`GET /api/deals` returns raw rows. Because Yulia hasn't necessarily analyzed every
deal yet, the app fills the gap by **computing its own** verdict/fit/stage
(`fitFromEbitda`, `verdictFromGate`, `inferLeague`, `methodologyProgressForGate`,
the `useMobileDeals`/`useHomeDeals` derivations). That's the app pretending to be
either the model runtime or Yulia. Both are wrong.

**Substrate fix (the chat-app/substrate way):** Yulia analyzes each deal against the
methodology (Claude brain) → her assessment (verdict, fit, stage, what's-needed) is
**persisted/cached** on the deal / DealState → `/api/deals` (or the brief) returns it
→ the app renders it. Re-analysis triggers on deal change / new model output. Deals
Yulia hasn't reached yet show **"Yulia is analyzing…"** + known facts only — never an
app-computed verdict. (This is *caching Yulia's reasoning*, not a deterministic
scorer.)

**Then DELETE (client re-derivations this unblocks):**
- `hooks/useMobileDeals.ts` → `dealVerdict()`, `fitScore()` (incl. `id*31` hash), pick/featured ranking
- `hooks/useHomeDeals.ts` → `picks` by-EBITDA, hardcoded `MID_JOURNEY` gate set
- `modes/PipelineRoot.tsx` → `verdictFromGate`, `gateForVerdict`, `fitFromEbitda`, `inferLeague`, `methodologyProgressForGate`
- `modes/TodayRoot.tsx` → `fitFromEbitda`, gate→status `/[345]$/` inference
- `lib/pipelineStages.ts` → `stageForGate` becomes display-only once substrate emits stage

## P1 — Kill the fabricating fallbacks (render skeleton/empty instead)
The substrate brief exists; the app invents content when it's absent.
- `views/DealView.tsx` → `deriveVerdict`, `buildDealIntelligence` (market headline/bullets/tax-legal/nextMoves), `resolveMarketBulletAnalysis`/`resolveDealMoveAction` routing
- `shared/DealJourneyFlow.tsx` → `STAGE_BLURB` (authored stage prose), client done/current measurement → render `/api/deals/:id/gates`
- `modes/TodayRoot.tsx` → `stageNextAction` copy
- `modes/PipelineRoot.tsx` → `yuliaMoveForGate`, `enrichPipelineDeal` blockers
- `modes/MarketingStudioView.tsx` → `bookReadinessCount`/`modelHealthForBook` (re-derives slide gaps; use server `readiness.issues`)

## P2 — Remove sample/fabricated data banks (or gate behind an explicit demo flag)
Shown as real or as silent fallback:
- `lib/sampleDeals.ts` (24 fake deals + verdicts + market intel)
- `lib/sampleInvestmentBoard.ts` (~25KB fabricated board/analysis)
- `views/DealView.tsx` → `SAMPLE_STATS`, `SAMPLE_LINKED`, `DEAL_FILES` (surface on non-numeric ids, not just logged-out)
- `modes/IntelRoot.tsx` → `FEED` ("Yulia · synthesized from 6 sources") — fabricated intel as real
- `modes/DocsRoot.tsx` → `RECENTS`/`TEMPLATES`/`FOLDERS` (no real-data path at all)
- Mobile: `Today.tsx` (`SAMPLE_PIPELINE`/`SAMPLE_MARKET_INTEL`/hero figures), `Brief.tsx`, `Pipeline.tsx`, `LibrarySearch.tsx` (draft/room/library/recent-search banks), `DealsListScreen.tsx`

## P3 — Wire the never-wired surfaces to the substrate
- `modes/IntelRoot.tsx` — 100% static; **needs a substrate intel endpoint** (or render empty)
- `modes/DocsRoot.tsx` — wire to `/api/deliverables/all` + `/api/deals`
- `modes/MarketingStudioView.tsx` — fetch `/studio/formats` instead of hardcoded `FORMATS`; book slide scaffold from `pitchBookStudio`

## P4 — Move route/analysis mapping to the substrate catalog
"Which analysis does this gate/action need?" is methodology.
- `modes/AnalysisRoot.tsx` → `recommendedToolIdsForGate`
- mobile `Detail.tsx`/`Analyses.tsx` → `mobileAnalysisForAction` (19-case map)
- `lib/v6ActionContracts.ts` → journey→primary-doc/analysis tables
→ all should come from the substrate route-map / `definitiveDealMechanicsCatalog`.

---

## Suggested order
1. **P0** (one substrate contract → deletes a whole client layer) — highest leverage.
2. **P1** (skeletons replace fabrication) — kills the "fake analysis as real" risk.
3. **P2** (delete sample banks) — mechanical, big footprint.
4. **P3 / P4** (wire remaining surfaces, move route map) — finishing.

Each step is **mostly deletion + using a contract that already exists**, not new app logic.
