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
import { MobileHomeHeader, MobileBackHeader } from "./MobileHeader";
import { BottomNav, bottomTabForScreen, type BottomTab } from "./BottomNav";
import { YuliaFab } from "./YuliaFab";
import { YuliaSheet } from "./YuliaSheet";
import { MobileShellContext } from "./mobileShell";

import TodayMobileScreen from "./screens/Today";
import AskYuliaScreen from "./screens/AskYulia";
import DealsMobileScreen from "./screens/Deals";
import CockpitMobileScreen from "./screens/Cockpit";
import FilesMobileScreen from "./screens/Files";
import MoreScreen from "./screens/More";
import SourcingMobileScreen from "./screens/Sourcing";
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
type MobileSurface = AtlasScreen | "more" | "askyulia";

/* Screens that show the floating bottom tab bar — Today / Deals / Sourcing /
 * Files / More (the bottom-bar destination set; the retired 'pipeline' alias is
 * folded into Deals and never renders as its own surface). */
const NAV_SCREENS = new Set<MobileSurface>(["today", "deals", "sourcing", "files", "more"]);
/* Screens that show the Yulia FAB (no inline composer). Deals absorbs the
 * former Pipeline FAB so Yulia is reachable from the merged screen. */
const FAB_SCREENS = new Set<MobileSurface>(["deals", "cockpit", "sourcing"]);
/* The FAB sits above the tab bar only when the bar is present (Deals/Sourcing). */

/* Header title for the variant-B back bar, per screen. The retired 'pipeline'
 * alias renders Deals everywhere, so it carries the Deals title. */
const SCREEN_TITLE: Record<AtlasScreen, string> = {
  today: "Atlas",
  pipeline: "Deals",
  sourcing: "Sourcing",
  deals: "Deals",
  studio: "Studio",
  integration: "Integration",
  files: "Files",
  agent: "Agent",
  cockpit: "Deal cockpit",
  canvas: "Canvas",
  settings: "Settings",
};

function AtlasMobileShell({ user, chat }: ShellProps) {
  const [view, setView] = useState<AtlasView>({ screen: "today" });
  // 'more' is an overlay screen that is NOT in the desktop AtlasView union — it
  // lives in a separate flag so nav/openDeal/etc. keep the canonical AtlasView.
  const [moreOpen, setMoreOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  // Full-screen Ask Yulia chat surface (frame 02) — opened from the Today
  // composer; rendered inside the shell's scroll area as the 'askyulia' surface.
  const [chatOpen, setChatOpen] = useState(false);
  const mobileShell = useMemo(
    () => ({ openChat: () => setChatOpen(true), closeChat: () => setChatOpen(false) }),
    [],
  );

  // Latest view for the canvas_action listener (subscribes once).
  const viewRef = useRef(view);
  viewRef.current = view;

  const nav = useMemo<AtlasNav>(
    () => ({
      view,
      go: (screen: AtlasScreen, opts?: Partial<AtlasView>) => {
        setMoreOpen(false);
        setChatOpen(false);
        setView({ screen, ...opts });
      },
      openDeal: (dealId: number, dealName?: string) => {
        setMoreOpen(false);
        setChatOpen(false);
        setView({ screen: "cockpit", dealId, dealName });
      },
      openSettings: (pane?: SettingsPane) => {
        setMoreOpen(false);
        setChatOpen(false);
        setView({ screen: "settings", settingsPane: pane ?? "profile" });
      },
      openCanvas: (canvasTabId: string, dealId?: number) => {
        setMoreOpen(false);
        setChatOpen(false);
        setView({ screen: "canvas", canvasTabId, dealId });
      },
    }),
    [view],
  );

  // Subscribe to Yulia's tool results (the ONE chat→canvas bridge). Same event
  // V6Mobile + AtlasApp listen to — do NOT invent a second channel.
  useEffect(() => {
    const onAction = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (!detail) return;
      const current = viewRef.current;

      // Interactive model → live modelStore tab → Canvas.
      if (detail.canvas_action === "create_model_tab" && detail.tabId) {
        const ensured = ensureModelTabFromCanvasAction(detail);
        if (ensured) {
          setMoreOpen(false);
          setView({
            screen: "canvas",
            canvasTabId: ensured.tabId,
            dealId: typeof detail.dealId === "number" ? detail.dealId : current.dealId,
            dealName: detail.dealTitle ?? current.dealName,
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
        setMoreOpen(false);
        setView({ screen: "canvas", canvasTabId: id, dealId: current.dealId, dealName: current.dealName });
        return;
      }

      // Analysis tab opened from chat → stash + Canvas.
      if (detail.canvas_action === "open_tab" && detail.tab?.kind === "analysis") {
        const tab = detail.tab;
        const id = `artifact-${tab.analysisRunId ?? detail.analysisRunId ?? Date.now()}`;
        registerCanvasArtifact({
          id,
          kind: "analysis",
          title: tab.title || detail.title || "Analysis",
          markdown: tab.markdown ?? detail.markdown ?? undefined,
          analysisRunId: tab.analysisRunId ?? detail.analysisRunId ?? null,
          dealId: typeof detail.dealId === "number" ? detail.dealId : null,
        });
        setMoreOpen(false);
        setView({ screen: "canvas", canvasTabId: id, dealId: current.dealId, dealName: current.dealName });
        return;
      }

      // Long-form Yulia artifact (show_content) → stash + Canvas.
      if (detail.canvas_action === "show_content") {
        const markdown = detail.content || detail.markdown || detail.message || "";
        const id = `artifact-content-${Date.now()}`;
        registerCanvasArtifact({
          id,
          kind: "content",
          title: detail.title || "Yulia artifact",
          markdown,
          analysisRunId: detail.analysisRunId ?? null,
        });
        setMoreOpen(false);
        setView({ screen: "canvas", canvasTabId: id, dealId: current.dealId, dealName: current.dealName });
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

  const initials = computeInitials(user);

  // The active surface = the 'more' overlay if open, else the view's screen.
  const surface: MobileSurface = chatOpen ? "askyulia" : moreOpen ? "more" : view.screen;
  const isToday = surface === "today";
  const showNav = NAV_SCREENS.has(surface);
  const showFab = FAB_SCREENS.has(surface);
  const fabAboveNav = showFab && showNav; // Deals/Sourcing have both bar + FAB
  const activeTab: BottomTab = moreOpen ? "more" : bottomTabForScreen(view.screen) ?? "today";

  // Back target: detail/section screens step back to a sensible surface. Deal
  // detail (cockpit/canvas) → Deals; the More-reached module screens
  // (studio/integration/agent/settings) → the More menu; everything else
  // (including the Sourcing bottom-bar tab) → Today.
  const onBack = useCallback(() => {
    const s = view.screen;
    if (s === "studio" || s === "integration" || s === "agent" || s === "settings") {
      setView({ screen: "today" }); // reset the underlying view, then show More
      setMoreOpen(true);
      return;
    }
    setMoreOpen(false);
    if (s === "cockpit" || s === "canvas") {
      setView({ screen: "deals" });
    } else {
      setView({ screen: "today" });
    }
  }, [view.screen]);

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
    setSheetOpen(false);
    setChatOpen(false);
    if (tab === "more") {
      setMoreOpen(true);
      return;
    }
    setMoreOpen(false);
    nav.go(tab as AtlasScreen);
  };

  // The shell owns the header. Variant A on Today; variant B back bar elsewhere
  // (including the More overlay, which gets a plain titled bar without a back —
  // tapping a bottom tab leaves it).
  const header: ReactNode = isToday ? (
    <MobileHomeHeader initials={initials} onAvatar={() => nav.openSettings()} />
  ) : surface === "askyulia" ? (
    <MobileBackHeader title="Yulia" showSparkle onBack={() => setChatOpen(false)} />
  ) : surface === "more" ? (
    <MobileBackHeader title="More" onBack={() => onTab("today")} />
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
        <div className="atlas-mobile" style={S.root}>
          {header}
          <div className="scr" style={S.scroll}>
            <ActiveScreen surface={surface} user={user} view={view} />
          </div>

          {showNav && <BottomNav active={activeTab} onTab={onTab} />}
          {showFab && <YuliaFab onOpen={() => setSheetOpen(true)} aboveNav={fabAboveNav} />}

          <YuliaSheet
            open={sheetOpen}
            onClose={() => setSheetOpen(false)}
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
    case "askyulia":
      return <AskYuliaScreen user={user} view={view} />;
    // canvas folds to the cockpit detail family for now (a screen agent owns the
    // real canvas surface).
    case "canvas":
      return <CockpitMobileScreen user={user} view={view} />;
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

const S: Record<string, CSSProperties> = {
  // Production: fill the real viewport. NOT a position:fixed full-viewport bg
  // div (Safari toolbar rule) — position:relative so the glass bars/FAB/sheet
  // can anchor against it.
  root: {
    position: "relative",
    height: "100dvh",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    background: M.frameBg,
    color: T.ink,
  },
  // The single scroll area. Bottom padding clears the floating glass tab bar:
  // 62px bar + 16px inset + safe-area + breathing room.
  scroll: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    // Lock horizontal pan: overflow-y:auto alone makes overflow-x compute to
    // auto too, so any element wider than the column (e.g. a decorative glow)
    // lets the whole page slide side-to-side. Clip x; edge-bleed chip rows keep
    // their own inner overflow-x:auto and are unaffected (they sit at the edge,
    // not beyond it).
    overflowX: "hidden",
    // Keep the rubber-band overscroll LOCAL so it reveals the app's frame
    // gradient (full bleed) instead of chaining to the body, whose background is
    // a different (warm) color and shows as a mismatched strip at top/bottom.
    overscrollBehavior: "contain",
    display: "flex",
    flexDirection: "column",
    paddingBottom: "calc(62px + env(safe-area-inset-bottom, 0px) + 28px)",
  },
};
