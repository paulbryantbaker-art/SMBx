# Atlas Mobile — Build Contract

Single source of truth for the Atlas-mobile build. Pixel detail lives in the design
maps under `/tmp/atlas_mobile_maps/` (read the one for your screen). This file fixes
file layout, tokens, the shell, nav, per-screen wiring, and law so the screens link
up and compile. Companion to the desktop `ATLAS_BUILD_CONTRACT.md` — **this build
reuses the desktop Atlas foundation, never re-derives it.**

Design maps:
- `/tmp/atlas_mobile_maps/m1_today_yulia_pipeline_deals.md`
- `/tmp/atlas_mobile_maps/m2_cockpit_files_more.md`
- `/tmp/atlas_mobile_maps/m3_sourcing_studio_integration_agent.md`
- `/tmp/atlas_mobile_maps/m4_shell_tokens_reuse.md` — shell + token reconciliation + reuse plan (READ THIS).

## THE LAW (applies to every file)

1. **Reuse the desktop Atlas foundation.** Import `T` from `../desktop/atlasTokens`,
   primitives from `../desktop/primitives`, icons from `../desktop/icons`, and the nav
   + chat contexts from `../desktop/atlasNav` (`AtlasView`, `AtlasScreen`, `AtlasNavContext`,
   `useAtlasNav`, `AtlasChatContext`, `useAtlasChat`). Do NOT re-define tokens/primitives.
2. **One data layer.** Reuse the same hooks the desktop Atlas + V6Mobile use
   (`useMobileDeals`, `useAuthChat`, `useNextActions`, `useV6WorkspaceData`,
   `useMobileDataRoom`, `useIntegrationPlan`, sourcing). No new fetch path.
3. **Mobile (V6Mobile) and desktop stay intact.** Do NOT edit `client/src/components/v6/mobile/`
   (the V6Mobile app) or `client/src/components/v6/desktop/screens/`. The only existing
   files you edit: `V6App.tsx` (mobile branch → AtlasMobileApp), and `desktop/icons.tsx`
   (ADD the 5 nav SVGs — additive, safe). V6Mobile stays importable as a fallback.
4. **Honesty.** Every value is a real hook field or an honest `—` (use `fmtCents`).
   Render loading/empty/error. No prototype demo literals (Project Atlas/$48M/Nova/
   "142 documents"/"3 things need you" counts) — those are placeholders. fit only when real.
5. **THE LINE.** Irreversible actions via the existing staged-action confirm
   (`chat.confirmStagedAction`/`cancelStagedAction`). Yulia shows; user decides.
6. **Drop the device chrome.** No bezel/notch/"9:41"/home-indicator. Render in the real
   viewport (`100dvh`); pad with `env(safe-area-inset-*)`. The glass bottom-nav/FAB are
   small inset bars → `position:fixed/absolute` is fine; they are NOT full-viewport
   `position:fixed` bg divs (Safari toolbar rule). App root is `position:relative`.
7. **Pricing locked** Free/$99/$249/$749/$3,000+ (Settings/billing).

## File layout & ownership

New folder `client/src/components/v6/atlasmobile/`. Foundation owns everything except
the screen bodies; each screen agent owns ONE screen file.

```
client/src/components/v6/V6App.tsx                        [FOUNDATION] mobile branch → AtlasMobileApp (keep V6Mobile import as fallback)
client/src/components/v6/desktop/icons.tsx                [FOUNDATION] ADD HomeIcon, PipelineBarsIcon, DealsListIcon, FolderIcon, MoreDotsIcon (paths in m4 §1d)
client/src/components/v6/atlasmobile/mobileTokens.ts      [FOUNDATION] M = { glassNav, glassFab, glassSheet, frameBg, ... } (m4 §2 mobile-only block)
client/src/components/v6/atlasmobile/atlas-mobile.css     [FOUNDATION] .atlas-mobile scope: DM Sans, hidden scrollbars (.scr), momentum scroll, safe-area helpers
client/src/components/v6/atlasmobile/AtlasMobileApp.tsx   [FOUNDATION] shell: auth branch → MobileChatBridge, useState<AtlasView>, provide AtlasNavContext+AtlasChatContext, smbx:canvas_action sub, header + scroll + screen router + BottomNav + Yulia FAB + sheet host
client/src/components/v6/atlasmobile/BottomNav.tsx        [FOUNDATION] floating glass tab bar (Today/Pipeline/Deals/Files/More) — m4 §1d
client/src/components/v6/atlasmobile/YuliaFab.tsx         [FOUNDATION] glass FAB → opens quick-chat sheet — m4 §1e
client/src/components/v6/atlasmobile/YuliaSheet.tsx       [FOUNDATION] glass bottom-sheet quick chat (frame 08) reusing useAtlasChat
client/src/components/v6/atlasmobile/MobileHeader.tsx     [FOUNDATION] header variant A (home: ✦Atlas+avatar) + variant B (back bar: BackIcon + title + right slot)
client/src/components/v6/atlasmobile/screens/Today.tsx        [AGENT]
client/src/components/v6/atlasmobile/screens/AskYulia.tsx     [AGENT] full-screen chat (frame 02)
client/src/components/v6/atlasmobile/screens/Pipeline.tsx     [AGENT]
client/src/components/v6/atlasmobile/screens/Deals.tsx        [AGENT]
client/src/components/v6/atlasmobile/screens/Cockpit.tsx      [AGENT]
client/src/components/v6/atlasmobile/screens/Files.tsx        [AGENT]
client/src/components/v6/atlasmobile/screens/More.tsx         [AGENT] More menu (frame 07)
client/src/components/v6/atlasmobile/screens/Sourcing.tsx     [AGENT]
client/src/components/v6/atlasmobile/screens/Studio.tsx       [AGENT]
client/src/components/v6/atlasmobile/screens/Integration.tsx  [AGENT]
client/src/components/v6/atlasmobile/screens/Agent.tsx        [AGENT]
client/src/components/v6/atlasmobile/screens/Settings.tsx     [AGENT]
```
Foundation writes compiling stub screens first (each exports the named component
rendering an `EmptyState`); agents replace their stub.

### Screen props
```ts
import type { AtlasScreenProps } from "../../desktop/atlasNav"; // { user, view }
export default function <Name>MobileScreen(props: AtlasScreenProps) { ... }
```
Screens get nav via `useAtlasNav()`, chat via `useAtlasChat()`, data off `view` + hooks.

## Shell (foundation) — from m4 §1

- **App root:** `position:relative; height:100dvh; overflow:hidden; background:` the frame
  gradient `linear-gradient(165deg,#fff,#f7faff 46%,#eef2fe 78%,#e9e8f6 100%)` (token `M.frameBg`).
  `.atlas-mobile` scope; DM Sans; hidden scrollbars on `.scr`.
- **Header:** variant A (Today — ✦Atlas + avatar, inside scroll top) / variant B (detail —
  BackIcon + optional MarkBadge + title + right slot, `flex:none`, border-bottom T.railDiv).
  Top padded with `env(safe-area-inset-top)`.
- **Scroll area:** `.scr flex:1 overflow:auto`, bottom padding `calc(62px + env(safe-area-inset-bottom) + 28px)` so content clears the glass bar.
- **BottomNav** (Today/Pipeline/Deals/Files/More): the glass material (m4 §1d), `position:absolute; left:16 right:16; bottom:calc(env(safe-area-inset-bottom)+16px)`. Active `T.blue`, inactive `T.faint`. Drives `nav.go(...)`; More toggles the More screen/overlay.
- **YuliaFab + YuliaSheet:** FAB (glass) on screens without an inline composer → opens the quick-chat sheet (reuse `useAtlasChat`).
- AtlasMobileApp mirrors `desktop/AtlasApp.tsx`: auth branch (DEV_AUTH_BYPASS/user/anon) → build `MobileChatBridge` → provide contexts → subscribe `smbx:canvas_action` → render header+scroll+screen+nav.

## Nav model (reuse desktop `atlasNav`)

`AtlasScreen` union already has all 12 (`today|pipeline|sourcing|deals|studio|integration|files|agent|cockpit|canvas|settings`). Add a local `'more'` screen in the mobile router (overlay) — or render More as `settings`-adjacent; keep the union, handle 'more' in AtlasMobileApp state. Bottom tabs → today/pipeline/deals/files/more. More rows → sourcing/studio/integration/agent/settings. Deal row → `openDeal(id,name)` → cockpit. FAB → quick-chat sheet.

## Per-screen wiring (mirror the desktop sibling for data + honest states)

For data wiring + honest states, each screen REFERENCES its desktop sibling
`client/src/components/v6/desktop/screens/<X>.tsx` (same hooks, same honest handling) and
re-lays it for mobile per its design map. Do not copy the desktop layout — copy the *wiring*.

| Mobile screen | Hooks (same as desktop) | Notes |
|---|---|---|
| Today | `useMobileDeals` + `useNextActions` + `useTodayOperatingBrief` | greeting, composer→chat, chips→nav, attention=next-actions, agents=brief |
| AskYulia | `useAtlasChat()` full-screen chat | user/yulia bubbles, "What I used", quick-replies; screen-aware context pill |
| Pipeline | `useMobileDeals.all` grouped by stage | mobile stage cards; FAB; card→openDeal |
| Deals | `useMobileDeals.all` | search + filter chips + list rows → openDeal |
| Cockpit | `/api/deals/:id` + `/brief` (mirror desktop Cockpit) | verdict/fit/gates/KPIs/read/risks; THIS-DEAL chips |
| Files | `useMobileDataRoom(view.dealId)` | folders w/ counts + docs; honest, no faked clause |
| More | static + `useAuth` (profile) | Profile card + Modules (Sourcing/Studio/Integration/Agent) + Account (Settings/Members/Notifications) |
| Sourcing | `/api/sourcing/*` (mirror desktop Sourcing) | stepper + buy-box + candidate list; honest-empty |
| Studio | `useV6WorkspaceData` deliverables | collateral list + export |
| Integration | `useIntegrationPlan(view.dealId)` | milestones + workstreams; honest-empty |
| Agent | `GET /api/agency/actions` (mirror desktop Agent — GAP) | honest: no persisted agents; real approval queue |
| Settings | `useAuth` + `/api/stripe/subscription` | profile + billing (locked pricing); honest stubs |

## Verify gate
`npx tsc --noEmit` clean; AtlasMobileApp mounts <1024px; every screen renders loading/empty/error; bottom nav navigates; no device chrome; no demo literals; mobile (V6Mobile) + desktop untouched.
