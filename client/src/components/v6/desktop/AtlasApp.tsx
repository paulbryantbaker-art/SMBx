/**
 * AtlasApp — the desktop shell (renders at/above 1024px; V6Mobile renders
 * below). Mirrors V6Mobile's structure: a three-way auth branch builds the
 * MobileChatBridge from the unchanged useAuthChat / useAnonymousChat hooks,
 * then the shell holds the single AtlasView state, provides nav + chat
 * contexts, subscribes to the global `smbx:canvas_action` event, and renders
 * the window frame + header + body (Today full-bleed / app two-region /
 * settings).
 *
 * Law honored here:
 *   - One data layer: reuses the same hooks + the same window event + the same
 *     zustand modelStore as mobile. No parallel fetch path.
 *   - Mobile untouched: nothing under v6/mobile/ is edited.
 *   - Safari toolbar rule: the window is normal-flow (height:100vh), NEVER a
 *     position:fixed full-viewport bg div.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useAnonymousChat } from "../../../hooks/useAnonymousChat";
import { useAuthChat } from "../../../hooks/useAuthChat";
import { DEV_AUTH_BYPASS, type User } from "../../../hooks/useAuth";
import { useModelStore } from "../../../lib/modelStore";
import { clearDealBrief } from "../../../lib/dealBriefCache";
import type { MobileChatBridge, MobileMessage } from "../mobile/types";

import "./atlas.css";
import { T } from "./atlasTokens";
import {
  AtlasChatContext,
  AtlasNavContext,
  type AtlasNav,
  type AtlasScreen,
  type AtlasView,
  type OpenTab,
  type SettingsPane,
} from "./atlasNav";
import { AtlasHeader } from "./AtlasHeader";
import { AtlasChatRail } from "./chat/AtlasChatRail";

import TodayScreen from "./screens/Today";
import SourcingScreen from "./screens/Sourcing";
import DealsScreen from "./screens/Deals";
import CockpitScreen from "./screens/Cockpit";
import StudioScreen from "./screens/StudioCreate";
import IntegrationScreen from "./screens/Integration";
import FilesScreen from "./screens/Files";
import AgentScreen from "./screens/Agent";
import SettingsScreen from "./screens/Settings";
import CanvasScreen, { registerCanvasArtifact, getCanvasArtifact, type CanvasArtifact } from "./screens/Canvas";
import { ensureModelTabFromCanvasAction } from "../mobile/screens/Model";

/* ─── open-tab helpers (deal cockpit + canvas/analysis become tabs) ─────────
 * Module screens (Today/Deals/…) are navigation, not documents, so they never
 * produce a tab. Only cockpit + canvas do. */

function tabIdForView(v: AtlasView): string | null {
  if (v.screen === "cockpit" && v.dealId != null) return `deal-${v.dealId}`;
  if (v.screen === "canvas" && v.canvasTabId) return `canvas-${v.canvasTabId}`;
  return null;
}

/** Best-effort canvas label: the live model-tab title, else the stashed
 *  artifact title, else null (caller falls back to the deal name / "Analysis"). */
function canvasTitle(canvasTabId: string): string | null {
  const modelTab = useModelStore.getState().tabs[canvasTabId];
  if (modelTab?.title) return modelTab.title;
  return getCanvasArtifact(canvasTabId)?.title ?? null;
}

function tabForView(v: AtlasView): OpenTab | null {
  if (v.screen === "cockpit" && v.dealId != null) {
    return { id: `deal-${v.dealId}`, kind: "deal", title: v.dealName || `Deal ${v.dealId}`, view: v };
  }
  if (v.screen === "canvas" && v.canvasTabId) {
    return {
      id: `canvas-${v.canvasTabId}`,
      kind: "canvas",
      title: canvasTitle(v.canvasTabId) || v.dealName || "Analysis",
      view: v,
    };
  }
  return null;
}

interface AtlasAppProps {
  user: User | null;
  onSignOut: () => void;
  onDevSignIn?: () => void;
}

/* ─── auth branch (mirror of V6Mobile) ─────────────────────── */

export default function AtlasApp({ user, onSignOut, onDevSignIn }: AtlasAppProps) {
  if (DEV_AUTH_BYPASS) {
    return <AtlasAnon user={user} onSignOut={onSignOut} onDevSignIn={onDevSignIn} />;
  }
  return user ? (
    <AtlasAuthed user={user} onSignOut={onSignOut} />
  ) : (
    <AtlasAnon onSignOut={onSignOut} onDevSignIn={onDevSignIn} />
  );
}

function AtlasAnon({
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
  return <AtlasShell user={user} chat={bridge} onSignOut={onSignOut} onDevSignIn={onDevSignIn} />;
}

function AtlasAuthed({ user, onSignOut }: { user: User; onSignOut: () => void }) {
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
  return <AtlasShell user={user} chat={bridge} onSignOut={onSignOut} />;
}

/* ─── the shell ────────────────────────────────────────────── */

interface ShellProps {
  user: User | null;
  chat: MobileChatBridge;
  onSignOut: () => void;
  onDevSignIn?: () => void;
}

function AtlasShell({ user, chat }: ShellProps) {
  const [view, setView] = useState<AtlasView>({ screen: "today" });
  // Latest view for the canvas_action listener (it subscribes once).
  const viewRef = useRef(view);
  viewRef.current = view;

  // Open "document" tabs (deals + canvases). Session-scoped — a full reload
  // starts clean at `today`; reopening a deal re-adds its tab. openTabsRef keeps
  // closeTab's fallback math off the render cycle.
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([]);
  const openTabsRef = useRef(openTabs);
  openTabsRef.current = openTabs;

  // ── In-app browser history ──────────────────────────────────────────────
  // Desktop nav is internal `view` state. Without history integration a
  // browser Back / trackpad swipe-back leaves the in-app view entirely and —
  // compounded by the bfcache reload guard — the app re-mounts at its initial
  // `today` view, so backing out of a deal dumped the user on Today instead of
  // the page they came from. We mirror a router: each forward navigation pushes
  // a history entry carrying the target view; popstate restores it; the initial
  // entry is seeded on mount. pushState/popstate are same-document, so the
  // bfcache guard never fires for in-app Back (only on real cross-document
  // restores), and the two coexist cleanly.
  // Ensure a cockpit/canvas view has an open tab — add it, or refresh its
  // title/view when a better one arrives (dealName lands, or a canvas title
  // resolves after its artifact registers). Module screens produce no tab.
  // Shared by commitView (forward nav) AND popstate (Back/Forward), so backing
  // into a deal always shows its tab.
  const trackTab = useCallback((next: AtlasView) => {
    const tab = tabForView(next);
    if (!tab) return;
    setOpenTabs((prev) => {
      const i = prev.findIndex((t) => t.id === tab.id);
      if (i === -1) return [...prev, tab];
      const merged = { ...prev[i], view: tab.view, title: tab.title || prev[i].title };
      if (merged.title === prev[i].title && merged.view === prev[i].view) return prev;
      const copy = prev.slice();
      copy[i] = merged;
      return copy;
    });
  }, []);

  const commitView = useCallback(
    (next: AtlasView, mode: "push" | "replace" = "push") => {
      setView(next);
      trackTab(next);
      const state = { atlasView: next };
      if (mode === "replace") window.history.replaceState(state, "");
      else window.history.pushState(state, "");
    },
    [trackTab],
  );
  // Stable handle for the once-subscribed canvas_action listener.
  const commitViewRef = useRef(commitView);
  commitViewRef.current = commitView;

  // Seed the initial entry so backing to it restores `today` (not a reload).
  useEffect(() => {
    window.history.replaceState({ atlasView: viewRef.current }, "");
  }, []);

  // Restore the view a Back / Forward lands on.
  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      const v = (e.state as { atlasView?: AtlasView } | null)?.atlasView ?? { screen: "today" };
      setView(v);
      trackTab(v);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [trackTab]);

  // Switch to an already-open tab.
  const selectTab = useCallback((tab: OpenTab) => commitView(tab.view), [commitView]);

  // Close a tab. If it was the active one, fall back to the neighbor that slides
  // into its slot (or the previous one), else the Deals list — never a blank.
  const closeTab = useCallback(
    (id: string) => {
      const prev = openTabsRef.current;
      const idx = prev.findIndex((t) => t.id === id);
      if (idx === -1) return;
      const nextTabs = prev.filter((t) => t.id !== id);
      setOpenTabs(nextTabs);
      if (tabIdForView(viewRef.current) === id) {
        const fallback = nextTabs[idx] ?? nextTabs[idx - 1] ?? null;
        commitView(fallback ? fallback.view : { screen: "deals" });
      }
    },
    [commitView],
  );

  const nav = useMemo<AtlasNav>(
    () => ({
      view,
      go: (screen: AtlasScreen, opts?: Partial<AtlasView>) =>
        commitView({ screen, ...opts }),
      openDeal: (dealId: number, dealName?: string) =>
        commitView({ screen: "cockpit", dealId, dealName }),
      openSettings: (pane?: SettingsPane) =>
        commitView({ screen: "settings", settingsPane: pane ?? "profile" }),
      openCanvas: (canvasTabId: string, dealId?: number) =>
        commitView({ screen: "canvas", canvasTabId, dealId }),
      openTabs,
      activeTabId: tabIdForView(view),
      selectTab,
      closeTab,
    }),
    [view, commitView, openTabs, selectTab, closeTab],
  );

  // Subscribe to Yulia's tool results (the ONE chat→canvas bridge). Same event
  // V6Mobile listens to — do NOT invent a second channel.
  useEffect(() => {
    const onAction = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (!detail) return;
      const current = viewRef.current;

      // A live canvas change → this deal's read is stale; drop its session-cached
      // brief so the next cockpit open reflects it. Replays + echoes skip.
      if (!detail.replay && detail.canvas_action && detail.canvas_action !== "read_tab_state" && typeof current.dealId === "number") {
        clearDealBrief(current.dealId);
      }

      // Interactive model → live modelStore tab → Canvas.
      if (detail.canvas_action === "create_model_tab" && detail.tabId) {
        const ensured = ensureModelTabFromCanvasAction(detail);
        if (ensured) {
          commitViewRef.current({
            screen: "canvas",
            canvasTabId: ensured.tabId,
            dealId: typeof detail.dealId === "number" ? detail.dealId : current.dealId,
            dealName: detail.dealTitle ?? current.dealName,
          });
          return;
        }
        // Fold to a content artifact if the model type isn't supported.
        const id = `artifact-${detail.analysisRunId ?? Date.now()}`;
        registerCanvasArtifact({
          id,
          kind: "analysis",
          title: typeof detail.title === "string" && detail.title ? detail.title : "Interactive model",
          markdown: detail.markdown ?? detail.content ?? undefined,
          analysisRunId: detail.analysisRunId ?? null,
          dealId: typeof detail.dealId === "number" ? detail.dealId : null,
        });
        commitViewRef.current({ screen: "canvas", canvasTabId: id, dealId: current.dealId, dealName: current.dealName });
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
        commitViewRef.current({ screen: "canvas", canvasTabId: id, dealId: current.dealId, dealName: current.dealName });
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
        // from the deal page — but DON'T navigate away from the deal the user opened.
        if (detail.replay) return;
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
  const isToday = view.screen === "today";
  const isSettings = view.screen === "settings";

  const body = isToday ? (
    <div style={S.todayWrap}>
      <TodayScreen user={user} view={view} />
    </div>
  ) : isSettings ? (
    <div style={S.settingsWrap}>
      <SettingsScreen user={user} view={view} />
    </div>
  ) : (
    <div style={S.appBody}>
      <AtlasChatRail />
      <div style={S.detailRegion}>
        <AppScreen user={user} view={view} />
      </div>
    </div>
  );

  return (
    <AtlasNavContext.Provider value={nav}>
      <AtlasChatContext.Provider value={chat}>
        {/* Window frame — fills the viewport in production (not a fixed
            1440×908 centered card). Normal flow, not position:fixed. */}
        <div className="atlas-root" style={S.window}>
          <AtlasHeader initials={initials} />
          {body}
        </div>
      </AtlasChatContext.Provider>
    </AtlasNavContext.Provider>
  );
}

/** The active app screen (isApp views 1–8 + cockpit + canvas). */
function AppScreen({ user, view }: { user: User | null; view: AtlasView }) {
  switch (view.screen) {
    case "sourcing":
      return <SourcingScreen user={user} view={view} />;
    // "pipeline" is a retired tab — kept in the AtlasScreen union as an alias so
    // lingering deep links / nav.go('pipeline') still resolve to the merged
    // table-first Deals screen (which carries the Board funnel toggle).
    case "pipeline":
    case "deals":
      return <DealsScreen user={user} view={view} />;
    case "studio":
      return <StudioScreen user={user} view={view} />;
    case "integration":
      return <IntegrationScreen user={user} view={view} />;
    case "files":
      return <FilesScreen user={user} view={view} />;
    case "agent":
      return <AgentScreen user={user} view={view} />;
    case "cockpit":
      return <CockpitScreen user={user} view={view} />;
    case "canvas":
      return <CanvasScreen user={user} view={view} />;
    default:
      return <DealsScreen user={user} view={view} />;
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
  // Production: fill the viewport. NOT a position:fixed full-viewport bg div
  // (Safari toolbar rule) — normal flow, height:100vh.
  window: {
    width: "100%",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    background: T.white,
    overflow: "hidden",
    color: T.ink,
  },
  // Today: full-bleed single scroll area, no rail.
  todayWrap: {
    flex: 1,
    minHeight: 0,
    position: "relative",
    overflow: "auto",
    background: `linear-gradient(180deg, ${T.white} 0px, ${T.surface} 220px)`,
  },
  // App: rail + detail region.
  appBody: {
    flex: 1,
    minHeight: 0,
    display: "flex",
    overflow: "hidden",
  },
  // Canvas: a SMOOTH gradient, white at the very top (so it meets the borderless
  // nav with no seam) fading to a faint tint below — subtly highlights the
  // content ground so the white Yulia rail + white cards float, with no hard
  // edge anywhere.
  detailRegion: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    background: `linear-gradient(180deg, ${T.white} 0px, ${T.surface} 220px)`,
  },
  // Settings: no rail.
  settingsWrap: {
    flex: 1,
    minHeight: 0,
    display: "flex",
    overflow: "hidden",
    background: `linear-gradient(180deg, ${T.white} 0px, ${T.surface} 220px)`,
  },
};
