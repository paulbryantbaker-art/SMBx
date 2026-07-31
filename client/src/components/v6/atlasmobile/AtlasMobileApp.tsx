/**
 * AtlasMobileApp — the Atlas-mobile shell (renders below 1024px; AtlasApp is the
 * desktop sibling). It is the mobile twin of `desktop/AtlasApp.tsx`:
 *
 *   - Auth branch (DEV_AUTH_BYPASS / authed / anon) builds the MobileChatBridge
 *     from the unchanged useAuthChat / useAnonymousChat hooks — no parallel
 *     fetch path (one-data-layer law).
 *   - The shell holds a single AtlasView state plus a 'more' overlay flag,
 *     provides the nav + chat contexts (reused from desktop/atlasNav), and
 *     subscribes to the global `smbx:canvas_action` event (the ONE chat→canvas
 *     bridge — same event V6Mobile + AtlasApp listen to; reuses
 *     ensureModelTabFromCanvasAction + registerCanvasArtifact).
 *   - It renders the device-chrome-free shell: app root (position:relative;
 *     height:100dvh; M.frameBg; .atlas-mobile) → header (variant A on Today,
 *     variant B back bar on detail/section screens — THE SHELL OWNS THE HEADER,
 *     screens render only their body) → scroll area (.scr, bottom-padded to
 *     clear the glass bar) → the active screen → BottomNav (on the five primary
 *     screens) → YuliaFab (on pipeline/cockpit/sourcing) → YuliaSheet host.
 *
 * Law honored: reuse the desktop foundation (T / primitives / icons / atlasNav)
 * — never redefined; honest states (screens own those); THE LINE (staged
 * actions via the bridge); no device chrome (real viewport + safe-area insets);
 * glass bars are small inset elements, NOT full-viewport fixed bg divs (Safari
 * rule); app root is position:relative.
 */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useAnonymousChat } from "../../../hooks/useAnonymousChat";
import { useAuthChat } from "../../../hooks/useAuthChat";
import { DEV_AUTH_BYPASS, type User } from "../../../hooks/useAuth";
import { useModelStore } from "../../../lib/modelStore";
import type { SurfaceContext } from "../../../lib/yuliaSurfaceContext";
import type { MobileChatBridge, MobileMessage } from "../mobile/types";
import { ensureModelTabFromCanvasAction } from "../mobile/screens/Model";
import { registerCanvasArtifact } from "../desktop/screens/Canvas";
import { rehydrateCanvasTabs } from "../../../lib/canvasRehydrate";
import { clearDealBrief } from "../../../lib/dealBriefCache";

import "./atlas-mobile.css";
import { T } from "../desktop/atlasTokens";
import { M } from "./mobileTokens";
import {
  AtlasChatContext,
  AtlasNavContext,
  type AtlasNav,
  type AtlasScreen,
  type AtlasView,
  type SettingsPane,
} from "../desktop/atlasNav";
import { MobileTabHeader, MobileBackHeader } from "./MobileHeader";
import { BottomNav, bottomTabForScreen, type BottomTab } from "./BottomNav";
import { YuliaFab } from "./YuliaFab";
import { YuliaSheet } from "./YuliaSheet";
import { MobileShellContext } from "./mobileShell";

import TodayMobileScreen from "./screens/Today";
import DealsMobileScreen from "./screens/Deals";
import CockpitMobileScreen from "./screens/Cockpit";
import CanvasMobileScreen from "./screens/Canvas";
import FilesMobileScreen from "./screens/Files";
import MoreScreen from "./screens/More";
import SourcingMobileScreen from "./screens/Sourcing";
import ClientsMobileScreen from "./screens/ClientsM";
import StudioMobileScreen from "./screens/Studio";
import IntegrationMobileScreen from "./screens/Integration";
import AgentMobileScreen from "./screens/Agent";
import SettingsMobileScreen from "./screens/Settings";

interface AtlasMobileAppProps {
  user: User | null;
  onSignOut: () => void;
  onDevSignIn?: () => void;
}

/* ─── auth branch (mirror of AtlasApp / V6Mobile) ──────────── */

export default function AtlasMobileApp({ user, onSignOut, onDevSignIn }: AtlasMobileAppProps) {
  if (DEV_AUTH_BYPASS) {
    return <AtlasMobileAnon user={user} onSignOut={onSignOut} onDevSignIn={onDevSignIn} />;
  }
  return user ? (
    <AtlasMobileAuthed user={user} onSignOut={onSignOut} />
  ) : (
    <AtlasMobileAnon onSignOut={onSignOut} onDevSignIn={onDevSignIn} />
  );
}

function AtlasMobileAnon({
  user = null,
  onSignOut = () => {},
  onDevSignIn,
}: {
  user?: User | null;
  onSignOut?: () => void;
  onDevSignIn?: () => void;
} = {}) {
  const chat = useAnonymousChat();
  const thread = useMemo<MobileMessage[]>(
    () =>
      chat.messages.map((m) => ({
        who: m.role === "user" ? "u" : "y",
        text: m.content,
        stagedAction: null,
        canvasArtifact: m.metadata?.canvasArtifact ?? null,
      })),
    [chat.messages],
  );
  const bridge = useMemo<MobileChatBridge>(
    () => ({
      thread,
      sending: chat.sending,
      streamingText: chat.streamingText,
      activeTool: null,
      toolTrace: [],
      error: chat.error,
      paywallData: null,
      send: (text, surfaceContext) => chat.sendMessage(text, undefined, surfaceContext),
    }),
    [thread, chat.sending, chat.streamingText, chat.error, chat.sendMessage],
  );
  return (
    <AtlasMobileShell user={user} chat={bridge} onSignOut={onSignOut} onDevSignIn={onDevSignIn} />
  );
}

function AtlasMobileAuthed({ user, onSignOut }: { user: User; onSignOut: () => void }) {
  const chat = useAuthChat(user);
  const thread = useMemo<MobileMessage[]>(
    () =>
      chat.messages.map((m) => ({
        who: m.role === "user" ? "u" : "y",
        text: m.content,
        stagedAction: m.metadata?.stagedAction ?? null,
        canvasArtifact: m.metadata?.canvasArtifact ?? null,
      })),
    [chat.messages],
  );
  const bridge = useMemo<MobileChatBridge>(
    () => ({
      thread,
      sending: chat.sending,
      streamingText: chat.streamingText,
      activeTool: chat.activeTool,
      toolTrace: chat.toolTrace,
      error: null,
      paywallData: chat.paywallData,
      send: chat.sendMessage,
      uploadFile: chat.uploadFile,
      confirmStagedAction: chat.confirmStagedAction,
      cancelStagedAction: chat.cancelStagedAction,
      conversations: chat.conversations,
      activeConversationId: chat.activeConversationId,
      selectConversation: chat.selectConversation,
      refreshConversations: chat.loadConversations,
      // Resume the deal's SAVED conversation (Yulia "remembers") + rehydrate its
      // persisted canvas tabs (her analyses come back). for-deal always CREATES a
      // new thread, so we RESUME the most-recent existing one instead.
      bindDeal: (dealId: number) => {
        const forDeal = (chat.conversations ?? [])
          .filter((c) => c.deal_id === dealId)
          .sort((a, b) => (b.updated_at || "").localeCompare(a.updated_at || ""));
        const convId = forDeal[0]?.id;
        if (convId == null) return; // no saved thread yet — it's created on first send
        if (convId !== chat.activeConversationId) chat.selectConversation(convId);
        void rehydrateCanvasTabs(convId, dealId);
      },
    }),
    [
      thread,
      chat.sending,
      chat.streamingText,
      chat.activeTool,
      chat.toolTrace,
      chat.paywallData,
      chat.sendMessage,
      chat.uploadFile,
      chat.confirmStagedAction,
      chat.cancelStagedAction,
      chat.conversations,
      chat.activeConversationId,
      chat.selectConversation,
      chat.loadConversations,
    ],
  );
  return <AtlasMobileShell user={user} chat={bridge} onSignOut={onSignOut} />;
}

/* ─── the shell ────────────────────────────────────────────── */

interface ShellProps {
  user: User | null;
  chat: MobileChatBridge;
  onSignOut: () => void;
  onDevSignIn?: () => void;
}

/** The local active-surface union: every desktop AtlasScreen, plus the
 *  mobile-only 'more' overlay screen (which is NOT in the desktop union). */
type MobileSurface = AtlasScreen | "more";

/* Redesign: the floating bar shows on the two content tabs only. Everything else
 * is a detail/hub screen (back header, no bar) reached from a deal, the Yulia
 * sheet's jump-nav, or the avatar menu. */
const NAV_SCREENS = new Set<MobileSurface>(["today", "deals"]);
/* The FAB sits above the tab bar only when the bar is present (Deals/Sourcing). */

/* Header title for the variant-B back bar, per screen. The retired 'pipeline'
 * alias renders Deals everywhere, so it carries the Deals title. */
const SCREEN_TITLE: Record<AtlasScreen, string> = {
  today: "Today",
  pipeline: "Deals",
  sourcing: "Sourcing",
  deals: "Deals",
  clients: "Clients",
  studio: "Studio",
  integration: "Integration",
  files: "Files",
  agent: "Agent",
  cockpit: "Deal cockpit",
  canvas: "Canvas",
  settings: "Settings",
};

function AtlasMobileShell({ user, chat, onSignOut }: ShellProps) {
  const [view, setView] = useState<AtlasView>({ screen: "today" });
  // 'more' is an overlay screen that is NOT in the desktop AtlasView union — it
  // lives in a separate flag so nav/openDeal/etc. keep the canonical AtlasView.
  const [moreOpen, setMoreOpen] = useState(false);
  // The Yulia slide-up sheet (chat + jump-to nav) — the universal Yulia surface;
  // it overlays whatever screen you're on. `openChat` opens it (the full-screen
  // chat is retired).
  const [sheetOpen, setSheetOpen] = useState(false);

  // Latest view for the canvas_action listener (subscribes once) AND for
  // commitNav, which merges a partial navigation onto the current view.
  const viewRef = useRef(view);
  viewRef.current = view;
  /* ── BROWSER / SWIPE BACK ────────────────────────────────────────────
   * Paul: "when I'm logged in and I go back, it takes me to a logged out page."
   *
   * Cause: mobile navigation was pure React state. The URL never changed, so
   * the browser's back stack still held whatever was there BEFORE the app — the
   * logged-out marketing page — and an iOS back-swipe left the app entirely.
   * Desktop already did this properly (AtlasApp's `commitView`); the mobile
   * shell never got it.
   *
   * So every navigation pushes a history entry, and popstate restores it. The
   * OVERLAYS are entries too (the More hub, the Yulia sheet), because on a phone
   * a back-swipe with a sheet open should close the sheet — not exit.
   *
   * `depthRef` counts entries WE pushed, so the header back button can use the
   * same mechanism as the swipe (history.back()) while still knowing when it has
   * run out of app history and should fall back to an explicit target instead of
   * stepping off the app.
   */
  const depthRef = useRef(0);

  const commitNav = useCallback(
    (next: { view?: AtlasView; moreOpen?: boolean; sheetOpen?: boolean },
     mode: "push" | "replace" = "push") => {
      const merged = {
        view: next.view ?? viewRef.current,
        moreOpen: next.moreOpen ?? false,
        sheetOpen: next.sheetOpen ?? false,
      };
      setView(merged.view);
      setMoreOpen(merged.moreOpen);
      setSheetOpen(merged.sheetOpen);
      const state = { atlasMobile: merged };
      if (mode === "replace") {
        window.history.replaceState(state, "");
      } else {
        window.history.pushState(state, "");
        depthRef.current += 1;
      }
    },
    [],
  );

  // Stable handle for the once-subscribed canvas_action listener.
  const commitNavRef = useRef(commitNav);
  commitNavRef.current = commitNav;

  // Seed the first entry so backing to it restores Today rather than reloading
  // or falling out to the marketing page.
  useEffect(() => {
    window.history.replaceState(
      { atlasMobile: { view: { screen: "today" }, moreOpen: false, sheetOpen: false } },
      "",
    );
  }, []);

  // Restore whatever a Back / Forward / swipe lands on.
  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      const st = (e.state as { atlasMobile?: { view: AtlasView; moreOpen: boolean; sheetOpen: boolean } } | null)?.atlasMobile;
      depthRef.current = Math.max(0, depthRef.current - 1);
      if (!st) {
        // No app state on this entry — we have walked back to before the app.
        // Land on Today instead of showing a logged-out surface.
        setView({ screen: "today" });
        setMoreOpen(false);
        setSheetOpen(false);
        return;
      }
      setView(st.view);
      setMoreOpen(st.moreOpen);
      setSheetOpen(st.sheetOpen);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const mobileShell = useMemo(
    () => ({
      openChat: () => commitNav({ sheetOpen: true }),
      closeChat: () => window.history.back(),
      signOut: onSignOut,
    }),
    [commitNav, onSignOut],
  );


  // When the user lands on a deal surface (cockpit/canvas), resume that deal's
  // saved Yulia conversation + rehydrate its persisted canvas tabs — so Yulia
  // doesn't appear to "forget" and her analyses come back. Guarded so it fires
  // once per deal change (not on every chat update). chatRef avoids re-binding
  // when the bridge identity changes mid-stream.
  const chatRef = useRef(chat);
  chatRef.current = chat;
  const lastBoundDealRef = useRef<number | null>(null);
  useEffect(() => {
    const d = view.dealId;
    if (d != null && (view.screen === "cockpit" || view.screen === "canvas") && lastBoundDealRef.current !== d) {
      lastBoundDealRef.current = d;
      chatRef.current.bindDeal?.(d);
    }
  }, [view.dealId, view.screen]);

  const nav = useMemo<AtlasNav>(
    () => ({
      view,
      go: (screen: AtlasScreen, opts?: Partial<AtlasView>) =>
        commitNav({ view: { screen, ...opts } }),
      openDeal: (dealId: number, dealName?: string) =>
        commitNav({ view: { screen: "cockpit", dealId, dealName } }),
      openSettings: (pane?: SettingsPane) =>
        commitNav({ view: { screen: "settings", settingsPane: pane ?? "profile" } }),
      openCanvas: (canvasTabId: string, dealId?: number) =>
        commitNav({ view: { screen: "canvas", canvasTabId, dealId } }),
      // Document tabs are a desktop affordance — mobile navigates one surface at
      // a time, so these are inert here (the shared AtlasNav type requires them).
      openTabs: [],
      activeTabId: null,
      selectTab: () => {},
      closeTab: () => {},
    }),
    [view, commitNav],
  );

  // Subscribe to Yulia's tool results (the ONE chat→canvas bridge). Same event
  // V6Mobile + AtlasApp listen to — do NOT invent a second channel.
  useEffect(() => {
    const onAction = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (!detail) return;
      const current = viewRef.current;

      // A LIVE canvas change (new analysis/model) means this deal's read is now
      // stale → drop its in-session cached brief so the next cockpit open reflects
      // it (the "log changes made in session" ask). Replays + read-only echoes skip.
      if (!detail.replay && detail.canvas_action && detail.canvas_action !== "read_tab_state" && typeof current.dealId === "number") {
        clearDealBrief(current.dealId);
      }

      // Interactive model → live modelStore tab → Canvas.
      if (detail.canvas_action === "create_model_tab" && detail.tabId) {
        const ensured = ensureModelTabFromCanvasAction(detail);
        if (ensured) {
          commitNavRef.current({
            view: {
              screen: "canvas",
              canvasTabId: ensured.tabId,
              dealId: typeof detail.dealId === "number" ? detail.dealId : current.dealId,
              dealName: detail.dealTitle ?? current.dealName,
            },
          });
          return;
        }
        const id = `artifact-${detail.analysisRunId ?? Date.now()}`;
        registerCanvasArtifact({
          id,
          kind: "analysis",
          title:
            typeof detail.title === "string" && detail.title ? detail.title : "Interactive model",
          markdown: detail.markdown ?? detail.content ?? undefined,
          analysisRunId: detail.analysisRunId ?? null,
          dealId: typeof detail.dealId === "number" ? detail.dealId : null,
        });
        commitNavRef.current({ view: { screen: "canvas", canvasTabId: id, dealId: current.dealId, dealName: current.dealName } });
        return;
      }

      // Analysis tab opened from chat → stash + Canvas.
      if (detail.canvas_action === "open_tab" && detail.tab?.kind === "analysis") {
        const tab = detail.tab;
        const id = typeof detail.artifactId === "string" && detail.artifactId
          ? detail.artifactId
          : `artifact-${tab.analysisRunId ?? detail.analysisRunId ?? Date.now()}`;
        registerCanvasArtifact({
          id,
          kind: "analysis",
          title: tab.title || detail.title || "Analysis",
          markdown: tab.markdown ?? detail.markdown ?? undefined,
          analysisRunId: tab.analysisRunId ?? detail.analysisRunId ?? null,
          dealId: typeof detail.dealId === "number" ? detail.dealId : null,
        });
        commitNavRef.current({ view: { screen: "canvas", canvasTabId: id, dealId: current.dealId, dealName: current.dealName } });
        return;
      }

      // Long-form Yulia artifact (show_content) → stash + Canvas.
      if (detail.canvas_action === "show_content") {
        const markdown = detail.content || detail.markdown || detail.message || "";
        const id = typeof detail.artifactId === "string" && detail.artifactId
          ? detail.artifactId
          : `artifact-content-${Date.now()}`;
        registerCanvasArtifact({
          id,
          kind: "content",
          title: detail.title || "Yulia artifact",
          markdown,
          analysisRunId: detail.analysisRunId ?? null,
          // Tag with the deal so it lists under the cockpit's "On the canvas".
          dealId: typeof detail.dealId === "number" ? detail.dealId : current.dealId ?? null,
        });
        // Replay (resuming a deal's saved chat): registered above so it's reopenable
        // from the deal page — but DON'T navigate away from the deal the user
        // opened, and DON'T push a history entry for a silent registration.
        if (detail.replay) return;
        commitNavRef.current({ view: { screen: "canvas", canvasTabId: id, dealId: current.dealId, dealName: current.dealName } });
        return;
      }

      // Yulia adjusting an open model — apply to the store; Canvas re-renders
      // from its subscription. read_tab_state is an echo (no write needed).
      if (detail.canvas_action === "update_model") {
        const targetId =
          detail.tabId && detail.tabId !== "active" ? detail.tabId : current.canvasTabId;
        const updates = detail.updates && typeof detail.updates === "object" ? detail.updates : null;
        if (targetId && updates) {
          useModelStore.getState().updateAssumptions(targetId, updates);
        }
      }
    };

    window.addEventListener("smbx:canvas_action", onAction);
    return () => window.removeEventListener("smbx:canvas_action", onAction);
  }, []);

  // NOTE: do NOT mutate document.documentElement / body background from React.
  // index.html sets the mobile html+body bg to #FFFFFF SYNCHRONOUSLY before first
  // paint, and iOS Safari samples the toolbar tint once at that first paint — any
  // post-paint JS bg write gives a stale/mismatched tint and defeats the
  // translucent chrome + page-bleed (the document must stay pristine after mount,
  // like V6Mobile in Safari-tab mode). The pre-paint script is the sole owner.
  const initials = computeInitials(user);

  // The active surface = the 'more' overlay if open, else the view's screen.
  const surface: MobileSurface = moreOpen ? "more" : view.screen;
  const isToday = surface === "today";
  // Every screen body-scrolls now (the chat is an overlay sheet, not a surface),
  // so iOS Safari keeps collapsing its chrome on scroll.
  const showNav = NAV_SCREENS.has(surface);
  // Yulia lives IN the dock on tabbed screens (Today/Deals), so the FAB only
  // appears where there's no dock (detail/hub) — one Yulia affordance per screen.
  // The menu hub has its own row; the canvas carries Ask Yulia in its action bar.
  const showFab = !showNav && surface !== "more" && surface !== "canvas";
  const activeTab: BottomTab = bottomTabForScreen(view.screen) ?? "today";

  // Back target: detail/section screens step back to a sensible surface. Deal
  // detail (cockpit/canvas) → Deals; the More-reached module screens
  // (studio/integration/agent/settings) → the More menu; everything else
  // (including the Sourcing bottom-bar tab) → Today.
  const onBack = useCallback(() => {
    // Prefer the real back stack so the header button and an iOS back-swipe are
    // the SAME operation — two code paths would drift and confuse the history.
    if (depthRef.current > 0) {
      window.history.back();
      return;
    }
    // No app history left (deep link straight into a detail screen). Step to the
    // sensible parent with REPLACE, so we still never fall out of the app and
    // don't grow a stack that leads nowhere.
    const s = view.screen;
    if (s === "studio" || s === "integration" || s === "agent" || s === "settings") {
      commitNav({ view: { screen: "today" }, moreOpen: true }, "replace");
      return;
    }
    commitNav(
      { view: { screen: s === "cockpit" || s === "canvas" ? "deals" : "today" } },
      "replace",
    );
  }, [view.screen, commitNav]);

  // Surface context for the quick-chat sheet (screen-aware Yulia).
  const surfaceContext: SurfaceContext = useMemo(
    () => ({
      device: "mobile",
      activeMode: view.screen,
      activeView: view.screen,
      activeTitle: view.dealName ?? SCREEN_TITLE[view.screen] ?? "Atlas",
      dealId: view.dealId,
      dealTitle: view.dealName,
    }),
    [view.screen, view.dealId, view.dealName],
  );

  const onTab = (tab: BottomTab) => {
    commitNav({ view: { screen: tab as AtlasScreen } });
  };

  // The shell owns the header. Variant A on Today; variant B back bar elsewhere
  // (including the More overlay, which gets a plain titled bar without a back —
  // tapping a bottom tab leaves it).
  const header: ReactNode = isToday ? (
    // Top bar names the PAGE (no "Atlas" wordmark). Avatar → account/More menu;
    // search → the Yulia sheet (ask/find anything — Atlas's search surface).
    <MobileTabHeader
      title="Today"
      initials={initials}
      onAvatar={() => commitNav({ moreOpen: true })}
      onSearch={() => commitNav({ sheetOpen: true })}
    />
  ) : surface === "deals" ? (
    // Deals is a bottom-nav TAB — a titled top bar with search + avatar, NOT a
    // back bar (a tab has nothing to go back to).
    <MobileTabHeader
      title="Deals"
      initials={initials}
      onAvatar={() => commitNav({ moreOpen: true })}
      onSearch={() => commitNav({ sheetOpen: true })}
    />
  ) : surface === "more" ? (
    <MobileBackHeader title="Menu" onBack={onBack} />
  ) : surface === "cockpit" ? (
    // Cockpit owns a FULL-BLEED textured header — its back button + deal name live
    // inside the banner (over the texture), so the shell renders no separate bar.
    null
  ) : (
    <MobileBackHeader
      title={view.dealName ?? SCREEN_TITLE[view.screen] ?? "Atlas"}
      onBack={onBack}
      showSparkle={view.screen === "canvas"}
    />
  );

  return (
    <AtlasNavContext.Provider value={nav}>
      <AtlasChatContext.Provider value={chat}>
        <MobileShellContext.Provider value={mobileShell}>
        <div className="atlas-mobile" style={S.rootScroll}>
          {header}
          <div className="scr" style={S.scrollFlow}>
            <ActiveScreen surface={surface} user={user} view={view} />
          </div>

          {/* Floating chrome — each piece is its OWN small position:fixed element
              (nav = bottom bar, FAB = bottom-right, sheet = modal), NOT wrapped in
              a viewport-filling fixed layer. CRITICAL: a full-viewport
              `position:fixed; inset:0` element makes iOS Safari treat the page as a
              fixed app and STOP minimizing its top/bottom chrome on scroll — the
              exact reason the chrome wouldn't collapse here. Small bottom-anchored
              fixed bars (like macrumors.com / the legacy V6Mobile TabBar) don't
              trigger that, so the chrome collapses normally. The YuliaSheet returns
              null when closed, so on content screens nothing fills the viewport. */}
          {showNav && <BottomNav active={activeTab} onTab={onTab} onYulia={() => commitNav({ sheetOpen: true })} />}
          {showFab && <YuliaFab onOpen={() => commitNav({ sheetOpen: true })} />}
          <YuliaSheet
            open={sheetOpen}
            onClose={onBack}
            surfaceContext={surfaceContext}
          />
        </div>
        </MobileShellContext.Provider>
      </AtlasChatContext.Provider>
    </AtlasNavContext.Provider>
  );
}

/** Route the active surface to its screen body. The shell already rendered the
 *  header + scroll wrapper, so screens return only their content. */
function ActiveScreen({
  surface,
  user,
  view,
}: {
  surface: MobileSurface;
  user: User | null;
  view: AtlasView;
}) {
  switch (surface) {
    case "today":
      return <TodayMobileScreen user={user} view={view} />;
    // 'pipeline' is a retired alias of Deals — the Pipeline funnel is now the
    // Deals Board toggle, so it renders the same screen.
    case "pipeline":
    case "deals":
      return <DealsMobileScreen user={user} view={view} />;
    case "files":
      return <FilesMobileScreen user={user} view={view} />;
    case "more":
      return <MoreScreen user={user} view={view} />;
    case "clients":
      return <ClientsMobileScreen user={user} view={view} />;
    case "sourcing":
      return <SourcingMobileScreen user={user} view={view} />;
    case "studio":
      return <StudioMobileScreen user={user} view={view} />;
    case "integration":
      return <IntegrationMobileScreen user={user} view={view} />;
    case "agent":
      return <AgentMobileScreen user={user} view={view} />;
    case "settings":
      return <SettingsMobileScreen user={user} view={view} />;
    case "cockpit":
      return <CockpitMobileScreen user={user} view={view} />;
    // Real canvas surface: renders Yulia's chat-opened model/analysis artifacts,
    // falling back to the deal cockpit only when nothing is on the canvas.
    case "canvas":
      return <CanvasMobileScreen user={user} view={view} />;
    default:
      return <TodayMobileScreen user={user} view={view} />;
  }
}

function computeInitials(user: User | null): string {
  if (!user) return "JM";
  const src = user.display_name?.trim() || user.email;
  const parts = src.split(/[\s@.]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

// Shared bottom clearance for the floating glass tab bar: 62px bar + 16px inset
// + safe-area + breathing room.
const NAV_CLEARANCE = "calc(62px + env(safe-area-inset-bottom, 0px) + 28px)";

const S: Record<string, CSSProperties> = {
  // Body-scroll shell — content screens grow the DOCUMENT so iOS Safari
  // collapses its chrome and the page full-bleeds top & bottom (the immersive
  // scroll). This MATCHES V6Mobile's proven-on-device `rootSafari` recipe
  // VERBATIM: a plain BLOCK box (NO display:flex), position:relative (Safari
  // rule), min-height (not height) + no overflow, so the screen content flows in
  // normal document flow and the BODY is the scroller. The earlier flex-column +
  // inner flex-grow `.scr` shape sized fine in headless Blink but did NOT let the
  // body scroll on a real iPhone (WebKit sizes flex-grow / min-height:auto items
  // differently) — so the chrome never collapsed. Block flow is the fix.
  // 100LVH (not dvh) fills the full webview behind the chrome so the bg never
  // leaks a strip into the URL-bar zone and there's no dvh shrink-on-chrome seam.
  // The floating-nav clearance lives HERE, on the actual scroller (the body).
  rootScroll: {
    position: "relative",
    minHeight: "100lvh",
    width: "100%",
    background: M.frameBg,
    color: T.ink,
    paddingBottom: NAV_CLEARANCE,
  },
  // Body-scroll mode — a TRANSPARENT block wrapper so the screen flows directly
  // in the document and the BODY scrolls (mirrors V6Mobile, which renders screens
  // straight inside .mobile-root with no inner wrapper). It is NOT a flex item
  // and NOT a scroll container — its only job is to clip a wide decorative child
  // (e.g. the Today hero glow) from panning the page horizontally.
  //
  // overflow-x MUST be `clip`, never `hidden`: per the CSS overflow spec, when
  // one axis is `hidden` and the other is `visible`, the visible axis computes to
  // `auto` — so `overflow-x:hidden` would silently make this a vertical scroll
  // container, trapping the scroll here and leaving Safari's chrome up. `clip`
  // clips horizontally WITHOUT establishing a scroll container, so vertical
  // overflow propagates to the document body. (Safari 16+; older iOS just loses
  // the horizontal clip, while body scroll — the important part — still works.)
  // See memory/mobile-scroll-architecture + Tailwind Plus issue #579.
  scrollFlow: {
    overflowX: "clip",
  },
};
