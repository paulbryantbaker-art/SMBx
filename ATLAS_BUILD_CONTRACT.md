# Atlas Build Contract — single source of truth for the desktop build

This is the binding contract every Atlas build agent follows. Pixel detail lives in
the design maps under `/tmp/atlas_maps/` (read the one for your screen). This file
fixes the **file layout, tokens, primitives, navigation, data wiring, and law** so
10 screens built in parallel link up and compile.

Design maps (read-only references):
- `/tmp/atlas_maps/00_design_shell_today_pipeline_sourcing_deals.md` — tokens, shell, Today, Pipeline, Sourcing, Deals, chat rail.
- `/tmp/atlas_maps/01_design_cockpit_studio_integration_files_agent_settings.md` — Cockpit, Studio, Integration, Files, Agent, Settings×6.
- `/tmp/atlas_maps/02_data_hooks.md` — the client data layer (the hooks to reuse).
- `/tmp/atlas_maps/03_chat_rail.md` — chat-rail reuse contract.
- `/tmp/atlas_maps/04_shell_breakpoint.md` — V6App edit + useIsDesktop.
- `/tmp/atlas_maps/05_backend_endpoints.md` — REAL/THIN/GAP per screen.

## THE LAW (non-negotiable, applies to every file)

1. **One data layer.** Reuse the existing hooks (`/tmp/atlas_maps/02`). Never add a
   parallel fetch path. New hooks are allowed ONLY when they call an existing
   endpoint that has no client hook yet (the only sanctioned case: `useIntegrationPlan`).
2. **Mobile is untouched.** Do not edit anything under `client/src/components/v6/mobile/`
   or any mobile hook. The only existing file edited is `V6App.tsx` (foundation only).
3. **Honesty.** Every value is a real field from a hook or an honest `—`. NEVER port the
   prototype's demo data (Project Atlas/Nova, $48M, "New listing scanner 7:00 AM",
   $1,200 plan, the 248-deal counts, the team thread). The prototype's literals are
   layout placeholders, not content. Every screen needs loading / empty / error states.
4. **THE LINE.** Irreversible actions route through the existing staged-action confirm
   card (`chat.confirmStagedAction`/`cancelStagedAction`). Yulia shows analysis/options;
   the user decides. No fabricated recommendations on regulated moves.
5. **Money is integer cents** from the API (returned as strings). The deal hooks already
   coerce via `toNum`; format with a shared `fmtCents` helper (see primitives). Never
   floating-point money; never display a synthetic fit number (`fitIsReal` gates it).
6. **Pricing is locked:** Free / $99 Solo / $249 Pro / $749 Team / $3,000+ Enterprise.
   The Billing screen reads real plan/usage; the $1,200 "Professional" is fiction.
7. **No gratuitous eyebrows/micro-text** beyond what the design's structural labels
   require (KPI labels, column headers, section labels are fine; decorative kickers are not).

## File layout & ownership

All Atlas code lives under `client/src/components/v6/desktop/`. **Each screen agent owns
exactly ONE screen file and creates no other files** (except a screen may add a sibling
`screens/<Name>/` folder for its own sub-components if large). Foundation owns everything else.

```
client/src/hooks/useIsDesktop.ts                    [FOUNDATION] breakpoint hook (min-width:1024px)
client/src/hooks/useIntegrationPlan.ts              [FOUNDATION] new hook over existing /integration-plan
client/src/components/v6/V6App.tsx                  [FOUNDATION] add desktop branch (exact edit in map 04 §5)
client/src/components/v6/desktop/atlas.css          [FOUNDATION] .atlas-root scope + DM Sans + scrollbar + glow keyframe
client/src/components/v6/desktop/atlasTokens.ts     [FOUNDATION] T (palette/radii/shadow/font) — see below
client/src/components/v6/desktop/atlasNav.tsx       [FOUNDATION] AtlasView, AtlasNav, AtlasNavContext, useAtlasNav
client/src/components/v6/desktop/AtlasApp.tsx       [FOUNDATION] shell: auth branch, hooks, bridge, view state, header+body, canvas_action sub
client/src/components/v6/desktop/AtlasHeader.tsx    [FOUNDATION] 58px header + tab strip + utilities
client/src/components/v6/desktop/primitives.tsx     [FOUNDATION] shared atoms (see signatures below)
client/src/components/v6/desktop/icons.tsx          [FOUNDATION] inline SVG icon set
client/src/components/v6/desktop/chat/AtlasChatRail.tsx  [FOUNDATION] 340px rail (reuse ChatDock + ChatSheet renderers)
client/src/components/v6/desktop/screens/Today.tsx        [AGENT] TodayScreen
client/src/components/v6/desktop/screens/Pipeline.tsx     [AGENT] PipelineScreen
client/src/components/v6/desktop/screens/Sourcing.tsx     [AGENT] SourcingScreen
client/src/components/v6/desktop/screens/Deals.tsx        [AGENT] DealsScreen
client/src/components/v6/desktop/screens/Cockpit.tsx      [AGENT] CockpitScreen
client/src/components/v6/desktop/screens/Studio.tsx       [AGENT] StudioScreen
client/src/components/v6/desktop/screens/Integration.tsx  [AGENT] IntegrationScreen
client/src/components/v6/desktop/screens/Files.tsx        [AGENT] FilesScreen
client/src/components/v6/desktop/screens/Agent.tsx        [AGENT] AgentScreen
client/src/components/v6/desktop/screens/Settings.tsx     [AGENT] SettingsScreen (6 panes)
client/src/components/v6/desktop/screens/Canvas.tsx       [FOUNDATION] reuse mobile Model/Analysis for chat-opened artifacts
```

Foundation writes **stub** screen files first (each exporting the named component
rendering a single honest "—" placeholder) so the project compiles before agents run.
Each screen agent then REPLACES its stub. Agents must keep the same default export name
and the props contract below.

### Screen props contract (every screen)
```ts
import type { User } from "../../../../hooks/useAuth";
export interface AtlasScreenProps {
  user: User | null;
  view: AtlasView;           // from atlasNav
}
// nav is obtained inside via useAtlasNav(); chat is obtained via the shell context (see below).
```
Screens get the deal context from `view` (e.g. `view.dealId`, `view.settingsPane`,
`view.subId`). Screens call `useAtlasNav()` to navigate and `useMobileDeals(user)` /
other hooks directly for data. Default export is a named function component.

## Tokens — `atlasTokens.ts`

Export a const `T` (used in inline styles across all screens) AND mirror the palette as
CSS vars in `atlas.css` under `.atlas-root`. Values are verbatim from the design maps:

```ts
export const T = {
  font: "'DM Sans', -apple-system, system-ui, sans-serif",
  // ink / text
  ink: '#1f1f1f', ink2: '#202124', ink3: '#3c4043', label: '#444746',
  muted: '#5e6b7b', muted2: '#80868b', faint: '#9aa3ad',
  // blue (primary/active)
  blue: '#0b57d0', blueBg: '#e8f0fe', blueBg2: '#eef4ff', blueBg3: '#f3f7ff',
  navActive: '#d3e3fd', stageActiveBd: '#bcd4fb', approvalBd: '#cfe0ff',
  tabActive: 'rgba(11,87,208,.10)', tabHover: 'rgba(11,87,208,.05)',
  // green / amber / terra / violet
  green: '#1f8a5b', greenBg: '#e6f4ec', greenAv: '#cdeada',
  amber: '#9a6b00', amberBg: '#fdf0d5', amberBg2: '#fff3e0', amberAv: '#f3e0b0',
  citeBg: '#fff6d6', citeBd: '#f0dca0',
  terra: '#c2410c', terraBg: '#fdeee6',
  violet: '#5b53d6', violetBg: '#ecebfb',
  // surfaces / borders
  white: '#fff', surface: '#fafbfd', page: '#e9edf2', hover: '#f7f9fc',
  track: '#f0f4f9', railDiv: '#f0f2f5',
  border: '#e3e8ef', hair: '#eef1f5', rowDiv: '#f3f5f8', rowDiv2: '#f6f8fb',
  inputBd: '#dbe3ec', progTrack: '#e8edf3',
  // gradients
  spark: 'linear-gradient(135deg,#4285F4,#9B72CB 50%,#D96570)',
  avatarGrad: 'linear-gradient(135deg,#4285F4,#9B72CB)',
  // radii
  rCard: 14, rCardLg: 16, rPill: 999, rComposer: 24, rBubble: 18, rChip: 13,
  // shadow
  shCard: '0 1px 2px rgba(60,64,67,.06)', shSoft: '0 1px 2px rgba(60,64,67,.05)',
  shHover: '0 4px 12px rgba(60,64,67,.10)', shWin: '0 8px 30px rgba(31,41,55,.16)',
} as const;
```

## Primitives — `primitives.tsx` (foundation builds; agents import)

Build these exact exports. Keep them inline-styled with `T`. Agents must use them
rather than re-implementing, so the look is consistent.

```ts
Sparkle({ size?: number })                      // the ✦ in T.spark gradient text-clip
MarkBadge({ letter, bg?, fg?, size?, radius? }) // square initial tile (deal mark)
Avatar({ initials, bg?, size?, gradient? })     // round avatar; gradient uses T.avatarGrad
Pill({ children, bg?, fg?, border?, style? })   // generic pill (radius 999)
Card({ children, pad?, style?, hover?, onClick? }) // white card, T.border, T.rCard, T.shCard
KpiCard({ label, value, delta?, deltaColor? })  // the KPI tile
Segmented({ options:{id,label}[], value, onChange }) // segmented control (T.track track)
StepperPills({ steps:{label,state}[] })         // connected gate/stage pills; state: 'done'|'current'|'upcoming'
ProgressBar({ pct, color? })                    // 5px track T.progTrack + fill
SectionLabel({ children })                      // uppercase micro label (11px T.muted2 600 .03em)
EmptyState({ title, hint?, cta?, onCta? })      // honest empty
LoadingState({ label? })                        // honest loading
StatusDot({ state })                            // checklist circle: done/prog/open glyph
fmtCents(cents: number|null): string            // "$48.0M" / "$680K" / "—" (null → "—")
fmtCompact(n: number|null): string              // "8.4B" style for counts/EV
```
`fmtCents` rounds to the design's style ($X.XM, $XXXK, $X.XB); null/NaN → `'—'`.

## Navigation — `atlasNav.tsx`

```ts
export type AtlasScreen = 'today'|'pipeline'|'sourcing'|'deals'|'studio'
  |'integration'|'files'|'agent'|'cockpit'|'canvas'|'settings';
export type SettingsPane = 'profile'|'billing'|'notifications'|'members'|'connections'|'security';
export interface AtlasView {
  screen: AtlasScreen; dealId?: number; dealName?: string;
  settingsPane?: SettingsPane; subId?: string; canvasTabId?: string;
}
export interface AtlasNav {
  view: AtlasView;
  go(screen: AtlasScreen, opts?: Partial<AtlasView>): void;
  openDeal(dealId: number, dealName?: string): void;   // → screen:'cockpit'
  openSettings(pane?: SettingsPane): void;              // → screen:'settings'
  openCanvas(canvasTabId: string, dealId?: number): void;
}
export const AtlasNavContext = createContext<AtlasNav | null>(null);
export function useAtlasNav(): AtlasNav;  // throws if outside provider
```
AtlasApp owns `useState<AtlasView>({screen:'today'})`, provides `AtlasNavContext`. The
header active-tab: `cockpit`→Deals, `canvas`→(keep prior tab or Deals), `settings`→none.

## Shell chat bridge access

AtlasApp builds the chat bridge (per map 03 §6 — reuse `useAuthChat`/`useAnonymousChat`,
construct the `MobileChatBridge`) and provides it via a second context:
```ts
export const AtlasChatContext = createContext<MobileChatBridge | null>(null);
export function useAtlasChat(): MobileChatBridge | null;
```
The chat rail consumes `useAtlasChat()`. Screens may also read it (e.g. Cockpit nudges
that prefill a Yulia message) but most do not need it.

## Per-screen data wiring (REAL unless noted; full detail in maps 02 + 05)

| Screen | Hook(s) / endpoint to reuse | Honesty notes |
|---|---|---|
| **Today** | `useMobileDeals(user)` + `useNextActions(user, canFetch)` (Needs-attention) + `useTodayOperatingBrief` (agent activity, may be empty) | central composer → `chat.send`; chips → `nav.go`. Empty: no deals → first-deal CTA. |
| **Pipeline** | `useMobileDeals.all` (group by `stageForGate`, `pipelineStages.ts`) + `usePortfolioSummary` (KPI tiles) | KPIs from `usePortfolioSummary` (weightedEvCents etc.) or `—`. Cards → `nav.openDeal`. Fit only if `fitIsReal`. |
| **Sourcing** | `/api/sourcing/theses`, `/theses/:id/pipeline`, `/portfolios/:id/candidates`, `usePipelineProgress` SSE. No hook exists — extract fetch from `chat/SourcingPanel.tsx`/`PortfolioCanvas.tsx` into a local `useSourcing` inside the screen file. | If no theses → honest empty with "Define a buy-box" CTA → `chat.send`. Stepper state from portfolio `pipeline_status`. |
| **Deals** | `useMobileDeals.all` (portfolio table) | Search/filter client-side over `all`. Row → `nav.openDeal`. `+ Add deal` → `chat.send` (Yulia is the front door). Stage/fit pill palettes per map 00. |
| **Cockpit** | TWO calls: `GET /api/deals/:id` (gates/velocity/deliverableStats) + `GET /api/agency/deals/:id/brief` (verdict→verdict, fit→verdict.score, read→marketRead, risks→taxLegal/researchNeeded, moves→nextMoves). Deal-team: `GET /api/deals/:id/participants` + `GET/POST /api/deals/:id/messages` (polling). | `view.dealId` required. "citations" discrete array is a GAP → render `marketRead.sourceSignals`/chips instead, never fabricate. THIS-DEAL chips → `nav.go(screen,{dealId})`. |
| **Studio** | `useV6WorkspaceData` (deliverables list = COLLATERAL sub-list) + `exportDeliverableFile` + the generators. Slide canvas: render the selected deliverable's real content/metadata; `Export PDF` → `exportDeliverableFile(id,'pdf')`. | Sub-list = real deliverables (`artifact_kind`/`name`), not the demo decks. Empty → "Ask Yulia to draft" CTA. |
| **Integration** | `useIntegrationPlan(dealId)` (NEW hook, GET `/integration-plan` → `{plan,workstreams,milestones}`) + `PATCH /workstreams/:id`. | Honest-empty when `plan===null` → "No integration plan yet" + generate CTA (full-access only). Captured-$ stays `—`. |
| **Files** | `useMobileDataRoom(dealId)` (folders/documents/groups) + `GET /data-room/documents/:id/download` + `useMobileShareLinks`. | Sub-list = real folders w/ counts. Cited-clause highlight needs a page anchor = GAP → render the doc + citations from chat without a fake clause box, OR show clause box only when a real citation provides it. Never fake §7.3. |
| **Agent** | **GAP** — no persisted/schedulable agent backend. Reuse `GET /api/agency/actions` (pending staged actions = "Needs approval") + `useNextActions`/notifications for activity. | Render honestly: agents are configured by talking to Yulia; show the REAL pending-approval queue + a clear "scheduled agents coming soon" state. Do NOT fabricate "New listing scanner / run history". |
| **Settings** | Profile = `useAuth().user`. Billing = `GET /api/stripe/subscription` + `POST /api/stripe/portal` (Manage) + usage from `/api/v19/entitlements` (honest `—` if unavailable). Members = `GET /api/deals/:id/participants` is per-deal, not org — render current user + honest note (org members = GAP). Notifications/Connections/Security = faithful chrome, honest non-persisted/stub (matches prototype). | LOCKED pricing only; never $1,200. Billing "Change plan" → `/pricing` or portal. |
| **Canvas** | foundation: reuse modelStore + mobile `Model.tsx`/`Analysis.tsx` rendering for chat-opened artifacts. | Subscribe to `smbx:canvas_action` in AtlasApp; route open_tab/create_model_tab/show_content here; update_model → modelStore. |

## Chat rail wiring (foundation — from map 03 §"CONCRETE CONTRACT")

- AtlasApp calls `useAuthChat(user)` (or `useAnonymousChat()`); builds `MobileChatBridge`
  exactly like `V6Mobile.tsx` lines 84–110 / 51–82; provides it via `AtlasChatContext`.
- `AtlasChatRail` (340px): header (`✦ Yulia` + context pill from `view`), message list
  (port `Message`/`Streaming`/`StagedActionCard`/`PaywallCard` renderers from
  `mobile/ChatSheet.tsx`, restyled to T tokens — same props), composer
  `<ChatDock variant="dock" onSend={(t)=>chat.send(t, buildDesktopSurfaceContext(...))} onFileUpload={chat.uploadFile} disabled={chat.sending}/>`
  + disclaimer "Yulia sees this screen · check important info".
- `ctxLabel`/`composerHint` derive from `view.screen` (table in map 00 screen 5 / map 01).
- Staged actions → `chat.confirmStagedAction(id,summary)` / `chat.cancelStagedAction(id)`.
- AtlasApp subscribes to window `smbx:canvas_action` (do not invent a 2nd channel).

## Verify gate (every agent self-checks; foundation + final pass enforce)

- `npx tsc --noEmit` clean (foundation runs after stubs; final pass after screens).
- No import of mobile files except types (`mobile/types.ts`) and reused screen
  components for the Canvas (`screens/Model`, `screens/Analysis`) and `ChatDock`/ChatSheet renderers.
- Every screen renders loading + empty + error without crashing on a null/empty hook.
- No demo literals from the prototype; no synthetic fit numbers; no $1,200.
