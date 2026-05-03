# SMBx.ai — Build Status & Punch List

**Audit date:** 2026-05-03
**Method:** Two parallel codebase audits (backend + frontend), claims spot-verified against actual files.
**Bottom line:** Backend ~85%, Frontend ~70%, end-to-end product ~75%. Core M&A flow works (chat → gate progression → deliverable → PDF). Sourcing engine runs. Subscriptions take money. Auth holds. The polish layer and a few strategic seams are what's missing.

---

## Meta-finding: docs have drifted from reality

The biggest finding is meta. **CLAUDE.md and `~/.claude/projects/.../memory/MEMORY.md` reference files and directories that no longer exist:**

- CLAUDE.md says `client/src/pages/public/AppShell.tsx` is THE layout — **it does not exist**. The real shell is `client/src/components/v6/V6App.tsx`, with `<Route><V6App /></Route>` as the catch-all in `client/src/App.tsx`.
- Memory references `client/src/components/journey_v2/pages/` — **that directory is gone**.
- CLAUDE.md says "Claude (primary), Gemini (secondary), OpenAI (tertiary)" — **only Claude is wired**; zero Gemini or OpenAI imports exist anywhere in `/server`.

Anyone (human or AI) following the docs as ground truth will write code against ghosts. Decide whether to fix the docs or fix the code, but the gap is real.

---

## What's solid (don't touch unless broken)

| Area | Why it's solid |
|---|---|
| **Methodology** | All 22 gates (S0-S5 / B0-B5 / R0-R5 / PMI0-3) have full prompts in `server/prompts/gatePrompts.ts` (1192 lines, no stubs). Tax §9 just got V18a (post-OBBBA, May 2 2026 effective). |
| **Calculation engine** | All 22 formulas in `client/src/lib/calculations/core.ts`. Tax constants now post-OBBBA-current (QSBS tiered exclusion, §168(k) permanent, §163(j) EBITDA, etc). |
| **AI agentic loop** | 16 tools defined and dispatched in `server/services/aiService.ts`; 10-round limit; SSE heartbeat to dodge proxy timeouts. |
| **Deliverables** | 28 generators in `server/services/generators/`, routed via `deliverableProcessor.ts`. PDF rendering via Puppeteer + Chart.js. |
| **Subscriptions** | Free / $49 / $149 / $999 — Stripe checkout, webhooks (`subscription.updated`, `charge.succeeded`), portal redirect, plan-gating helper. Free-deliverable counter on user record. |
| **Auth** | JWT (no sessions), signup / login / reset, Google OAuth, **passkeys** (`server/migrations/046_passkeys.sql`). |
| **Documents** | TipTap editor + toolbar, doc lifecycle service (`server/services/documentLifecycle.ts`), data-room routes, share tokens, doc-views tracking. |
| **Notifications** | In-app: `client/src/components/chat/NotificationBell.tsx` with 30s poll + unread badge + 11 notification types. Email via `server/services/emailService.ts`. pg-boss async dispatch. |
| **Sourcing** | 5-stage engine in `server/services/sourcingPipelineService.ts`. Google Places integration. `client/src/components/chat/PortfolioCanvas.tsx` renders 4-tier candidate grid. |
| **10 financial models** | All present in `client/src/components/models/`. Zustand store (`modelStore.ts`). `create_model_tab` agentic tool wired. |
| **PWA install gate** | `client/src/components/mobile/InstallWall.tsx` for logged-in mobile users. |
| **V6 desktop chrome** | Material 3 tokens, slate-blue `#2E5C8A` rail, lavender chrome `#ECEAF2`, resizable panels (320–640px chat well). |
| **Migrations** | 61 SQL files (`server/migrations/000` → `057`). Auto-run on startup via `server/run-migration.ts`. No drift. |
| **Worker** | pg-boss queue with 6 scheduled jobs (thesis scan, ValueLens refresh, freshness scan, rate monitor, daily aggregator, enrichment batch) — *but see blocker #3 below*. |

---

## 🚧 Production blockers (fix before public scale)

These are real risks, not nice-to-haves.

### 1. No AI fallback. Single point of failure.
Only Claude is wired. CLAUDE.md says "Claude (primary), Gemini (secondary), OpenAI (tertiary)" but the secondary/tertiary providers are pure documentation fiction. If Anthropic 429s or has an outage, the entire app hangs.
- **Fix option A:** Build the fallback (~half-day in `server/services/aiService.ts`: catch 429 / 5xx, retry with Gemini Flash via `@google/generative-ai`).
- **Fix option B:** Update CLAUDE.md to be honest about Claude-only.

### 2. Two subscription TODOs leak Professional features to free users.
- `server/routes/intelligence.ts:193` — `// TODO: subscription access check here`
- `server/routes/sourcing.ts:378` — `// TODO: subscription check — Professional tier required`

Add `getUserPlan` + `planMeetsRequirement` guard. **Five minutes each.**

### 3. `ENABLE_SCHEDULED_JOBS=true` is not the default.
`server/worker.ts:93` gates ALL six cron jobs (thesis scan, ValueLens refresh, freshness scan, rate monitor, daily aggregator, enrichment batch) behind this flag. If it's not set on Railway, none of those jobs run — meaning thesis matching never updates, rate-change alerts never fire, ValueLens never refreshes.

**Verify the env var on Railway today.**

### 4. CLAUDE.md is materially out of date.
Points to `AppShell.tsx` and `journey_v2/` paths that don't exist. Either rename `V6App.tsx` to `AppShell.tsx` or update CLAUDE.md to point to V6App. Fix the Key File Map.

---

## 🔌 Wired backend, missing frontend (user-facing seams)

The backend can do this; the user can't reach it.

| Gap | Backend state | Frontend gap | Lift |
|---|---|---|---|
| **Settings page** | `/api/flywheel/usage`, `/api/flywheel/benchmarks`, subscription read all wired. `client/src/pages/Settings.tsx` exists. | **No nav link in V6 sidebar.** User must know the URL. | Add a sidebar item. ~1 hour. |
| **Standalone /pricing checkout** | Stripe checkout endpoint works. | `/pricing` redirects to a Learn tab; no public plan-comparison page that funnels to checkout. | Build a marketing pricing page that hits the same Stripe endpoint as `PaywallCard.tsx`. ~half-day. |
| **Review response UI** | `/api/collaboration/*` invite/accept/role wired. `documentShareService.ts` ready. | Per memory `project_week_todo.md`: review response UI is TODO. `AcceptInvite.tsx` exists but no surface for "respond to a shared deliverable." | Real build. ~1-2 days. |
| **Deal team roster / 3-circle viz** | `deal_participants` table, RBAC, activity log. | No UI showing who's on a deal, their role, last activity. | Real build. ~1-2 days. |
| **Marketing /sell /buy /raise pages** | Backend doesn't care. | These routes fall through to `<V6App>` and become chat modes. There are NO dedicated pages explaining the journey. | If you want them, real build. If not, route them explicitly to a 404 or to chat with copy. |
| **Mobile fullscreen chat** | n/a | `V6Mobile.tsx` uses bottom-sheet tabs; mobile users can't collapse the canvas to chat full-screen. | Build a fullscreen chat dialog (architecture already in `~/.claude/projects/.../memory/feedback_pwa_chat_flex_layout.md`). |
| **Dark mode toggle** | n/a | `client/src/components/shared/DarkModeToggle.tsx` exists but isn't placed in V6 chrome. | Add to sidebar/header. ~30 min. |

---

## 🧹 Dead / orphaned code (safe to delete)

- `client/src/components/app_v4/` — V4App, V4Shell, V4Chat, V4Canvas. Zero importers outside `app_v4/` itself. Replaced by V6.
- `client/src/components/app/AppShellInner.tsx` — predates V6, not imported, harmless but confusing.
- `client/src/components/public/PublicLayout.tsx` — not in any route.
- Page files that exist but aren't routable in `App.tsx`: `Pipeline.tsx`, `Sourcing.tsx`, `DataRoom.tsx`, `Intelligence.tsx`, `Search.tsx` (legacy V3-era pages).
- Working-tree noise (visible in `git status`): `Reveal 2.tsx`, `useIsMobile 2.ts`, `V6_WIRING_LOG 2.md`, `Copy of Copy of...png` — duplicate-named files from Finder/iCloud copies.
- `journey/pages/` (4040 lines) — orphaned per memory; verify and delete.

---

## 🔮 Architected but never built

These appear in CLAUDE.md / memory architecture notes but have no code:

- **Push / SMS notifications** — only email + in-app DB notifications exist.
- **Live collaborative editing** (WebSocket co-edit in data room) — invitations are async; no real-time sync.
- **API rate limiting** middleware — no rate-limit code found. Could become a problem with abuse on agentic loop.
- **Industry-specific optimization playbooks** — `server/services/optimizationPlanService.ts` uses generic templates instead of industry-tuned plays.
- **Multi-currency** — everything is USD cents. International deals would need refactor.
- **Comprehensive analytics** — admin console exists; cohort / funnel analytics don't.
- **Row-level security at DB layer** — RBAC enforced per-route only; one missed check = cross-tenant leak.

---

## ⚠️ Known stubs that look real

- **~20 "category" deliverables** (e.g., `sell_business_profile`, `buy_investment_thesis`, `pmi_swot`) fall through to `generateCategoryContent()` in `deliverableProcessor.ts` — a single generic Claude prompt instead of specialized templates. They render and ship, but they won't feel as crafted as ValueLens or CIM. If you're shipping these as paid deliverables, build dedicated generators for the high-volume ones.
- **`MAX_TOOL_ROUNDS = 10`** in `aiService.ts:8` — fine in normal use, but a multi-gate progression with rich tool use could hit it. Watch logs.
- **Auditor mode for uploaded docs** is wired in `promptBuilder.ts` (24-hour upload window triggers forensic mode), but there's no UI signal to the user that they're in auditor mode. They might be confused why Yulia suddenly stops estimating and starts citing pages.

---

## Suggested priority order

### Before public launch
1. Fix the 2 subscription TODOs (10 min total)
2. Set `ENABLE_SCHEDULED_JOBS=true` on Railway (30 sec)
3. Build AI fallback OR delete the Gemini/OpenAI claim from CLAUDE.md (half-day or 30 sec)
4. Fix CLAUDE.md Key File Map (1 hour)
5. Add Settings link to V6 sidebar (1 hour)
6. Build a real /pricing page that funnels to Stripe (half-day)

### Next sprint after launch
7. Review-response UI + deal-team roster view (the `project_week_todo.md` items)
8. Mobile fullscreen chat
9. Build dedicated generators for the top 5 category deliverables you actually sell
10. Decide on /sell /buy /raise — real pages or just chat modes? Either way, make routing explicit.

### Defer (no paying customer needs these yet)
- Multi-currency
- Push / SMS notifications
- WebSocket co-edit
- Comprehensive analytics
- Row-level security at DB layer

---

## Component status — at-a-glance

### Backend

| Area | Status | Completeness |
|---|---|---|
| Methodology (Gates) | ✅ Done | 100% |
| Calculations | ✅ Done | 100% |
| Subscriptions | ⚠️ Partial | 95% (2 TODOs) |
| Sourcing | ⚠️ Partial | 80% (Google API optional, jobs gated) |
| Generators | ⚠️ Partial | 85% (categories are stubs) |
| Tools (Agentic) | ✅ Done | 100% |
| Documents | ✅ Done | 100% |
| Collaboration | ⚠️ Partial | 90% (no live sync) |
| Notifications | ⚠️ Partial | 70% (email + in-app, no SMS / push) |
| AI Orchestration | ✗ Partial | 40% (no fallback) |
| Auth | ✅ Done | 100% |
| Migrations | ✅ Done | 100% |
| PDF | ✅ Done | 100% |
| Worker | ⚠️ Partial | 85% (jobs disabled by default) |

### Frontend

| Area | Status | Completeness |
|---|---|---|
| Layout (V6App is shell) | ⚠️ Partial | 80% (CLAUDE.md says AppShell, file is V6App; clean up) |
| Chat (ChatDock) | ✅ Done | 100% |
| Tabbed Canvas | ✅ Done | 100% |
| 10 Financial Models | ✅ Done | 100% |
| Sourcing Portfolio | ✅ Done | 100% |
| Document Editor | ✅ Done | 100% |
| Deal Team / Sharing | ⚠️ Partial | 40% (invitations only; no review-response, no roster) |
| Notifications | ✅ Done | 100% |
| Marketing Routes | 🟥 Stub | 30% (chat modes only, no pages) |
| Auth Flow | ✅ Done | 100% |
| Subscription / Stripe UI | ⚠️ Partial | 60% (gate-triggered paywall; no /pricing checkout) |
| Mobile | ⚠️ Partial | 50% (no fullscreen chat) |
| PWA Install | ✅ Done | 100% |
| V6 Desktop Chrome | ✅ Done | 100% |
| Settings | 🟥 Stub | 40% (page exists, no nav link) |
