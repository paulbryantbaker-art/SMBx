import { useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { DEV_AUTH_BYPASS, useAuth, type User } from "../../hooks/useAuth";
import { useAnonymousChat } from "../../hooks/useAnonymousChat";
import { useAuthChat } from "../../hooks/useAuthChat";
import { useIsMobile } from "../../hooks/useIsMobile";
import V6Mobile from "./mobile/V6Mobile";
import { V6Chat } from "./Chat";
import { V6Canvas } from "./Canvas";
import { MODES, V6Icon } from "./icons";
import { buildDesktopSurfaceContext, type SurfaceContext } from "../../lib/yuliaSurfaceContext";
import { normalizeModelPreference, type ModelPreference } from "../../lib/modelPreference";
import { isSuperAdminUser } from "../../lib/superAdmin";
import { buildBigFakeInvestmentBoardTab, shouldOpenSampleInvestmentBoard } from "../../lib/sampleInvestmentBoard";
import type { FileListView, FileScope, IconName, Message, ModeId, Tab } from "./types";

const VALID_MODES: ModeId[] = ["today", "pipeline", "search", "files", "docs", "analysis", "intel", "library"];

interface ChatBridge {
  thread: Message[];
  sending: boolean;
  streamingText: string;
  activeTool: string | null;
  error: string | null;
  send: (text: string, surfaceContext?: SurfaceContext, modelPreference?: ModelPreference) => void;
  uploadFile?: (file: File) => Promise<{ name: string; size: string } | null>;
  confirmStagedAction?: (id: number, summary?: string) => void | Promise<void>;
  cancelStagedAction?: (id: number) => void | Promise<void>;
}

function mergeStructuredAssumptions(analysisData: Record<string, any> | undefined, updates: Record<string, any>): Record<string, any> | undefined {
  if (!analysisData || analysisData.schemaVersion !== "analysis-runtime-v1") return analysisData;
  const assumptions = Array.isArray(analysisData.assumptions) ? analysisData.assumptions : [];
  if (assumptions.length === 0) return analysisData;

  return {
    ...analysisData,
    assumptions: assumptions.map((assumption: Record<string, any>) => {
      if (!assumption?.key || updates[assumption.key] === undefined) return assumption;
      const nextValue = updates[assumption.key];
      return {
        ...assumption,
        value: nextValue,
        displayValue: String(nextValue),
      };
    }),
  };
}

function applyCanvasModelUpdate(tab: Tab, detail: Record<string, any>): Tab {
  const updates = detail.updates && typeof detail.updates === "object" ? detail.updates : {};
  const modelState = detail.state && typeof detail.state === "object"
    ? detail.state
    : { ...(tab.modelState ?? {}), ...updates };
  const analysisData = detail.analysisData && typeof detail.analysisData === "object"
    ? detail.analysisData
    : mergeStructuredAssumptions(tab.analysisData, updates);

  return {
    ...tab,
    modelState,
    analysisData,
    analysisRunId: detail.analysisRunId ?? tab.analysisRunId,
    versionNumber: detail.versionNumber ?? tab.versionNumber,
    status: detail.versionNumber ? `saved v${detail.versionNumber}` : tab.status,
  };
}

export default function V6App() {
  const auth = useAuth();
  const isMobile = useIsMobile();
  const user = auth.user;

  if (auth.loading) {
    return (
      <div style={{ display: "grid", placeItems: "center", height: "100vh", color: "var(--m-on-surface-mid)" }}>
        Loading…
      </div>
    );
  }

  if (isMobile) {
    return <V6Mobile user={user} onSignOut={async () => { await auth.logout(); }} onDevSignIn={auth.devSignIn} />;
  }

  if (DEV_AUTH_BYPASS) {
    return <V6AppAnon user={user} onSignOut={auth.logout} onDevSignIn={auth.devSignIn} />;
  }

  return user
    ? <V6AppAuthed user={user} onSignOut={auth.logout} />
    : <V6AppAnon />;
}

/* ─── Anonymous variant — uses anon chat hook ────────────────── */
function V6AppAnon({
  user = null,
  onSignOut = () => {},
  onDevSignIn,
}: {
  user?: User | null;
  onSignOut?: () => void | Promise<void>;
  onDevSignIn?: () => void;
} = {}) {
  const chat = useAnonymousChat();
  const bridge = useMemo<ChatBridge>(() => ({
    thread: chat.messages.map(m => ({
      who: m.role === "user" ? "u" : "y",
      text: m.content,
      stagedAction: null,
    })),
    sending: chat.sending,
    streamingText: chat.streamingText,
    activeTool: null,
    error: chat.error,
    send: (text, surfaceContext, modelPreference) => chat.sendMessage(text, undefined, surfaceContext, modelPreference),
    uploadFile: chat.uploadFile,
  }), [chat.messages, chat.sending, chat.streamingText, chat.error, chat.sendMessage, chat.uploadFile]);
  return <V6AppShell user={user} chat={bridge} onSignOut={() => { void onSignOut(); }} onDevSignIn={onDevSignIn} />;
}

/* ─── Authenticated variant — uses authed chat hook ──────────── */
function V6AppAuthed({ user, onSignOut }: { user: User; onSignOut: () => Promise<void> }) {
  const chat = useAuthChat(user);
  const bridge = useMemo<ChatBridge>(() => ({
    thread: chat.messages.map(m => ({
      who: m.role === "user" ? "u" : "y",
      text: m.content,
      stagedAction: m.metadata?.stagedAction ?? null,
    })),
    sending: chat.sending,
    streamingText: chat.streamingText,
    activeTool: chat.activeTool,
    error: null, // useAuthChat surfaces errors via toasts already
    send: chat.sendMessage,
    uploadFile: chat.uploadFile,
    confirmStagedAction: chat.confirmStagedAction,
    cancelStagedAction: chat.cancelStagedAction,
  }), [chat.messages, chat.sending, chat.streamingText, chat.activeTool, chat.sendMessage, chat.uploadFile, chat.confirmStagedAction, chat.cancelStagedAction]);

  return <V6AppShell user={user} chat={bridge} onSignOut={async () => { await onSignOut(); }} />;
}

/* ─── Shared shell ───────────────────────────────────────────── */

interface ShellProps {
  user: User | null;
  chat: ChatBridge;
  onSignOut: () => void;
  onDevSignIn?: () => void;
}

function V6AppShell({ user, chat, onSignOut }: ShellProps) {
  // ─── Tab + mode state, hydrated from URL hash ───
  const initial = readHashState();

  const [activeMode, setActiveMode] = useState<ModeId>(initial.mode);
  const [modelPreference, setModelPreference] = useState<ModelPreference>(() => {
    try {
      return normalizeModelPreference(localStorage.getItem("smbx_model_preference"));
    } catch {
      return "auto";
    }
  });
  const [tabs, setTabs] = useState<Tab[]>(() => {
    const rootMode = initial.mode;
    const todayRoot: Tab = {
      id: "today-root",
      kind: "mode-root",
      modeId: "today",
      title: "Today",
      pinned: true,
    };
    const rootTab: Tab = {
      id: `${rootMode}-root`,
      kind: "mode-root",
      modeId: rootMode,
      title: MODES.find(m => m.id === rootMode)?.label ?? rootMode,
      pinned: rootMode === "today",
    };
    const deepTab = tabFromHash(initial.tab, initial.scope, initial.title, initial.run);
    const base = rootTab.id === todayRoot.id ? [todayRoot] : [todayRoot, rootTab];
    return deepTab && !base.find(tab => tab.id === deepTab.id) ? [...base, deepTab] : base;
  });
  const [activeTabId, setActiveTabId] = useState(initial.tab ?? `${initial.mode}-root`);

  // Sync tab + mode to URL hash on every change
  useEffect(() => {
    const activeTab = tabs.find(t => t.id === activeTabId);
    writeHashState({
      mode: activeMode,
      tab: activeTabId,
      scope: activeTab?.fileScope,
      title: activeTab?.title,
      run: activeTab?.analysisRunId ?? undefined,
    });
  }, [activeMode, activeTabId, tabs]);

  // Listen for browser back/forward
  useEffect(() => {
    const onHash = () => {
      const next = readHashState();
      const rootId = `${next.mode}-root`;
      setActiveMode(next.mode);
      setTabs(prev => {
        const deepTab = tabFromHash(next.tab, next.scope, next.title, next.run);
        const withToday = prev.find(t => t.id === "today-root")
          ? prev
          : [{ id: "today-root", kind: "mode-root" as const, modeId: "today" as const, title: "Today", pinned: true }, ...prev];
        const withRoot = withToday.find(t => t.id === rootId)
          ? withToday
          : [...withToday, { id: rootId, kind: "mode-root" as const, modeId: next.mode, title: MODES.find(m => m.id === next.mode)?.label ?? next.mode, pinned: next.mode === "today" }];
        if (!deepTab) return withRoot;
        if (withRoot.find(t => t.id === deepTab.id)) {
          return withRoot.map(t => t.id === deepTab.id ? { ...t, ...deepTab } : t);
        }
        return [...withRoot, deepTab];
      });
      setActiveTabId(next.tab ?? rootId);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const pickMode = (modeId: ModeId) => {
    setActiveMode(modeId);
    const rootId = `${modeId}-root`;
    setTabs(prev => {
      if (prev.find(t => t.id === rootId)) return prev;
      const meta = MODES.find(m => m.id === modeId);
      return [...prev, { id: rootId, kind: "mode-root", modeId, title: meta?.label ?? modeId, pinned: modeId === "today" }];
    });
    setActiveTabId(rootId);
  };

  const activateTab = (id: string) => {
    const tab = tabs.find(t => t.id === id);
    const mode = tab ? modeForTab(tab) : null;
    if (mode) setActiveMode(mode);
    setActiveTabId(id);
  };

  const openTab: (descriptor: Omit<Tab, "id"> & { id?: string }) => void = (descriptor) => {
    const id = descriptor.id ?? `${descriptor.kind}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const sourceMode = descriptor.kind === "mode-root" ? undefined : descriptor.sourceMode ?? activeMode;
    const nextTab = { ...descriptor, ...(sourceMode ? { sourceMode } : null), id } as Tab;
    setTabs(prev => {
      const existing = prev.find(t => t.id === id);
      if (existing) {
        // Merge new descriptor into the existing tab so callers can re-open
        // a tab with new section/anchor/template/tool props (e.g., pricing
        // pill activates an open How-it-works tab and switches its section).
        return prev.map(t => t.id === id ? { ...t, ...descriptor, ...(sourceMode ? { sourceMode } : null), id } : t);
      }
      if (descriptor.kind === "marketing-studio" && descriptor.studioView === "canvas") {
        const lastStudioIndex = prev.reduce((last, tab, index) => tab.kind === "marketing-studio" ? index : last, -1);
        const insertAt = lastStudioIndex >= 0 ? lastStudioIndex + 1 : prev.length;
        return [...prev.slice(0, insertAt), nextTab, ...prev.slice(insertAt)];
      }
      return [...prev, nextTab];
    });
    const nextMode = modeForTab(nextTab);
    if (nextMode) setActiveMode(nextMode);
    setActiveTabId(id);
  };

  const closeTab = (id: string) => {
    if (id === "today-root") return;
    const tabToClose = tabs.find(t => t.id === id);
    if (tabToClose?.kind === "marketing-studio" && tabToClose.studioView === "canvas" && tabToClose.studioDirty !== false) {
      const saveDraft = window.confirm(`Save "${tabToClose.title}" before closing?\n\nOK saves it to Marketing Studio. Cancel closes without saving.`);
      if (saveDraft) {
        saveStudioDraft(tabToClose);
      } else {
        discardStudioDraft(tabToClose);
      }
    }
    setTabs(prev => {
      const next = prev.filter(t => t.id !== id);
      if (id === activeTabId) {
        const idx = prev.findIndex(t => t.id === id);
        const fallback = next[idx - 1] ?? next[idx] ?? next.find(t => t.id === "today-root") ?? next[0];
        if (fallback) setActiveTabId(fallback.id);
      }
      return next;
    });
  };

  const reorderTabs = (dragId: string, targetId: string) => {
    if (dragId === targetId || dragId === "today-root" || targetId === "today-root") return;
    setTabs(prev => {
      const dragIndex = prev.findIndex(t => t.id === dragId);
      const targetIndex = prev.findIndex(t => t.id === targetId);
      if (dragIndex < 0 || targetIndex < 0) return prev;

      const dragged = prev[dragIndex];
      const target = prev[targetIndex];
      const todayPinned = (tab: Tab) => tab.kind === "mode-root" && tab.modeId === "today";
      if (todayPinned(dragged) || todayPinned(target)) return prev;

      const next = [...prev];
      next.splice(dragIndex, 1);
      const adjustedTargetIndex = next.findIndex(t => t.id === targetId);
      next.splice(adjustedTargetIndex < 0 ? next.length : adjustedTargetIndex, 0, dragged);
      return next;
    });
  };

  // Listen for canvas_action events emitted by useAuthChat tools
  useEffect(() => {
    const onAction = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail) return;
      // Possible canvas actions: open_tab, switch_mode, update_model, create_model_tab, read_tab_state
      if (detail.canvas_action === "open_tab" && detail.tab) openTab(detail.tab);
      if (detail.canvas_action === "show_content") {
        const artifactTab: Tab = {
          id: detail.tabId || `artifact-${Date.now()}`,
          kind: "analysis",
          title: detail.title || "Yulia artifact",
          tool: "artifact",
          markdown: detail.content || detail.markdown || detail.message || "",
          artifactData: detail,
          status: "canvas artifact",
        };
        saveArtifactTab(artifactTab);
        openTab(artifactTab);
      }
      if (detail.canvas_action === "create_model_tab" && detail.tabId) {
        openTab({
          id: detail.tabId,
          kind: "analysis",
          title: detail.title || "Interactive model",
          dealId: detail.dealId ?? null,
          dealTitle: detail.dealTitle ?? null,
          tool: detail.modelType || "interactive_model",
          analysisRunId: detail.analysisRunId ?? null,
          modelState: detail.initialAssumptions || {},
          status: "saved model",
        });
      }
      if (detail.canvas_action === "update_model") {
        const targetId = detail.tabId && detail.tabId !== "active" ? detail.tabId : activeTabId;
        setTabs(prev => prev.map(tab => tab.id === targetId ? applyCanvasModelUpdate(tab, detail) : tab));
      }
      if (detail.canvas_action === "read_tab_state" && detail.state) {
        const targetId = detail.tabId && detail.tabId !== "active" ? detail.tabId : activeTabId;
        setTabs(prev => prev.map(tab => tab.id === targetId ? {
          ...tab,
          modelState: detail.state,
          analysisRunId: detail.analysisRunId ?? tab.analysisRunId,
          analysisData: detail.analysisData ?? tab.analysisData,
          versionNumber: detail.versionNumber ?? tab.versionNumber,
        } : tab));
      }
      if (detail.canvas_action === "switch_mode" && detail.mode && VALID_MODES.includes(detail.mode)) {
        pickMode(detail.mode);
      }
    };
    window.addEventListener("smbx:canvas_action", onAction);
    return () => window.removeEventListener("smbx:canvas_action", onAction);
  }, [activeTabId]);

  // URL → tab bridge. Bookmarkable links / footer links open the matching
  // tab. After opening, the URL is rewritten to "/" so the tab state lives
  // in the hash like the rest of the app.
  useEffect(() => {
    const path = window.location.pathname;
    if (path === "/how-it-works" || path === "/pricing") {
      const section: "how" | "pricing" = path === "/pricing" ? "pricing" : "how";
      openTab({ id: "tab-learn", kind: "learn", title: "How it works · Pricing", section });
      window.history.replaceState(null, "", "/" + window.location.hash);
    } else if (path === "/marketing-studio" || path === "/studio") {
      if (isSuperAdminUser(user)) {
        openTab({ id: "marketing-studio", kind: "marketing-studio", title: "Marketing Studio", studioView: "home" });
      } else {
        openTab({ id: "today-root", kind: "mode-root", modeId: "today", title: "Today", pinned: true });
      }
      window.history.replaceState(null, "", "/" + window.location.hash);
    } else if (path === "/settings" || path === "/profile") {
      openTab({ id: "tab-settings", kind: "settings", title: "Settings" });
      window.history.replaceState(null, "", "/" + window.location.hash);
    } else if (path === "/history") {
      openTab({ id: "tab-history", kind: "history", title: "Conversation history" });
      window.history.replaceState(null, "", "/" + window.location.hash);
    }
  }, []); // mount-only — initial URL routing


  // ─── Composer state ───
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const currentSurfaceContext = () => buildDesktopSurfaceContext(activeMode, activeTabId, tabs);

  const send = (override?: string) => {
    const msg = (override ?? draft).trim();
    if (!msg) return;
    if ((DEV_AUTH_BYPASS || !user) && shouldOpenSampleInvestmentBoard(msg)) {
      openTab(buildBigFakeInvestmentBoardTab());
      setDraft("");
      setTimeout(() => inputRef.current?.focus(), 50);
      return;
    }
    chat.send(msg, currentSurfaceContext(), modelPreference);
    setDraft("");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  useEffect(() => {
    try {
      localStorage.setItem("smbx_model_preference", modelPreference);
    } catch { /* ignore */ }
  }, [modelPreference]);

  // ─── Resizable Yulia rail ───
  const [chatWidth, setChatWidth] = useState(400);
  const onDragStart = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = chatWidth;
    const onMove = (ev: globalThis.MouseEvent) => {
      const dx = ev.clientX - startX;
      setChatWidth(Math.min(520, Math.max(360, startW + dx)));
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const modeLabel = MODES.find(m => m.id === activeMode)?.label ?? "Workspace";
  const launcherWork = (modeId: ModeId) => tabs.filter(tab => tabBelongsToLauncherMode(tab, modeId, tabs));
  const [hoveredLauncher, setHoveredLauncher] = useState<ModeId | null>(null);
  const [closingLauncher, setClosingLauncher] = useState<ModeId | null>(null);
  const hoveredLauncherRef = useRef<ModeId | null>(null);
  const launcherHoverCloseRef = useRef<number | null>(null);
  const launcherFadeCloseRef = useRef<number | null>(null);
  const launcherStripRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    hoveredLauncherRef.current = hoveredLauncher;
  }, [hoveredLauncher]);

  const clearLauncherHoverClose = () => {
    if (launcherHoverCloseRef.current !== null) {
      window.clearTimeout(launcherHoverCloseRef.current);
      launcherHoverCloseRef.current = null;
    }
  };

  const clearLauncherFadeClose = () => {
    if (launcherFadeCloseRef.current !== null) {
      window.clearTimeout(launcherFadeCloseRef.current);
      launcherFadeCloseRef.current = null;
    }
  };

  const openLauncherHover = (modeId: ModeId, openCount: number) => {
    clearLauncherHoverClose();
    clearLauncherFadeClose();
    setClosingLauncher(null);
    setHoveredLauncher(openCount > 0 ? modeId : null);
  };

  const closeLauncherHover = () => {
    clearLauncherHoverClose();
    const launcherToClose = hoveredLauncherRef.current;
    setHoveredLauncher(null);
    if (!launcherToClose) return;
    setClosingLauncher(launcherToClose);
    clearLauncherFadeClose();
    launcherFadeCloseRef.current = window.setTimeout(() => {
      setClosingLauncher(current => current === launcherToClose ? null : current);
      launcherFadeCloseRef.current = null;
    }, 560);
  };

  const scheduleLauncherHoverClose = () => {
    clearLauncherHoverClose();
    launcherHoverCloseRef.current = window.setTimeout(() => {
      closeLauncherHover();
    }, 160);
  };

  useEffect(() => {
    return () => {
      if (launcherHoverCloseRef.current !== null) window.clearTimeout(launcherHoverCloseRef.current);
      if (launcherFadeCloseRef.current !== null) window.clearTimeout(launcherFadeCloseRef.current);
    };
  }, []);

  useEffect(() => {
    if (!hoveredLauncher) return;

    const onPointerMove = (event: PointerEvent) => {
      const openWrap = launcherStripRef.current?.querySelector<HTMLElement>(".top-launcher-wrap.open");
      const openMenu = openWrap?.querySelector<HTMLElement>(".top-launcher-menu");
      const boundaryTargets = [openWrap, openMenu, launcherStripRef.current].filter(Boolean) as HTMLElement[];
      const margin = 46;
      const insideOpenArea = boundaryTargets.some(target => {
        const rect = target.getBoundingClientRect();
        return (
          event.clientX >= rect.left - margin &&
          event.clientX <= rect.right + margin &&
          event.clientY >= rect.top - margin &&
          event.clientY <= rect.bottom + margin
        );
      });

      if (!insideOpenArea) {
        closeLauncherHover();
      }
    };

    window.addEventListener("pointermove", onPointerMove);
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, [hoveredLauncher]);

  const renderLauncherTab = (tab: Tab, options: { child?: boolean; parentTitle?: string } = {}) => {
    const parentDeal = options.parentTitle ? null : owningLauncherDealForTab(tab, tabs);
    const dealContext = options.parentTitle ?? parentDeal?.title ?? inferredLauncherDealName(tab);
    const label = cleanLauncherRepeatedScope(dealContext ? stripLauncherDealPrefix(tab.title, dealContext) : tab.title);
    return (
      <div
        key={tab.id}
        className={`top-work-row ${options.child ? "child" : "parent"} ${tab.id === activeTabId ? "active" : ""}`}
      >
        <button
          className="top-work-item"
          onClick={() => activateTab(tab.id)}
          title={tab.title}
        >
          <span className="top-work-copy">
            <span className="top-work-title">{label}</span>
            <span className="top-work-meta">{topTabMeta(tab, tabs, Boolean(options.parentTitle || parentDeal))}</span>
          </span>
        </button>
        <button
          className="top-work-close"
          onClick={(event) => {
            event.stopPropagation();
            closeTab(tab.id);
          }}
          aria-label={`Close ${tab.title}`}
          title={`Close ${tab.title}`}
        >
          <V6Icon name="close" size={10} />
        </button>
      </div>
    );
  };

  const renderLauncherWorkTree = (modeId: ModeId) => {
    const modeTabs = launcherWork(modeId);
    const tabTree = groupLauncherTabsByDeal(modeTabs);
    if (modeTabs.length === 0) {
      return null;
    }
    return (
      <div className="top-work-stack" role="list">
        {tabTree.deals.map(group => (
          <div key={group.deal.id} className="top-work-branch" role="listitem">
            {group.virtual ? (
              <div className={`top-work-row parent virtual ${group.children.some(tab => tab.id === activeTabId) ? "active-parent" : ""}`}>
                <button
                  className="top-work-item"
                  onClick={() => openTab({ id: launcherDealTabIdForTitle(group.deal.title), kind: "deal", title: group.deal.title, sourceMode: "pipeline" })}
                >
                  <span className="top-work-copy">
                    <span className="top-work-title">{group.deal.title}</span>
                    <span className="top-work-meta">Deal page</span>
                  </span>
                </button>
              </div>
            ) : renderLauncherTab(group.deal)}
            {group.children.length > 0 && (
              <div className="top-work-child-stack">
                {group.children.map(tab => renderLauncherTab(tab, { child: true, parentTitle: group.deal.title }))}
              </div>
            )}
          </div>
        ))}
        {tabTree.loose.map(tab => renderLauncherTab(tab))}
      </div>
    );
  };

  // ⌘K focuses Yulia from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="v6-root" style={A.shell}>
      <div style={A.row}>
        <div style={{ ...A.leftRail, width: chatWidth }}>
          <div style={A.leftLauncherBar}>
            <nav ref={launcherStripRef} style={A.launcherStrip} aria-label="Workspace launchers">
              {MODES.map(mode => {
                const openCount = launcherWork(mode.id).length;
                const launcherActive = activeMode === mode.id;
                const isLauncherMenuOpen = hoveredLauncher === mode.id && openCount > 0;
                const isLauncherMenuClosing = closingLauncher === mode.id && openCount > 0;
                return (
                  <div
                    key={mode.id}
                    className={`top-launcher-wrap ${isLauncherMenuOpen ? "open" : ""} ${isLauncherMenuClosing ? "closing" : ""}`}
                    style={A.topLauncherWrap}
                    onMouseEnter={() => openLauncherHover(mode.id, openCount)}
                    onMouseLeave={scheduleLauncherHoverClose}
                    onFocus={() => openLauncherHover(mode.id, openCount)}
                    onBlur={(event) => {
                      const nextTarget = event.relatedTarget;
                      if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
                        scheduleLauncherHoverClose();
                      }
                    }}
                  >
                    <button
                      className={`top-launcher ${launcherActive ? "active" : ""}`}
                      style={{ ...A.topLauncher, ...(launcherActive ? A.topLauncherActive : undefined) }}
                      onClick={() => pickMode(mode.id)}
                      aria-label={mode.label}
                      aria-current={launcherActive ? "page" : undefined}
                      aria-haspopup={openCount > 0 ? "menu" : undefined}
                    >
                      <span className="top-launcher-icon" style={{ ...A.topLauncherIcon, ...(launcherActive ? A.topLauncherIconActive : undefined) }}>
                        <V6Icon name={mode.icon} size={14} />
                      </span>
                      <span style={A.topLauncherLabel}>{mode.label}</span>
                      {openCount > 0 && <span style={{ ...A.topLauncherBadge, ...(launcherActive ? A.topLauncherBadgeActive : undefined) }}>{openCount}</span>}
                    </button>
                    {openCount > 0 && (
                      <div
                        className="top-launcher-menu"
                        style={A.topLauncherMenu}
                        role="menu"
                        onMouseEnter={() => openLauncherHover(mode.id, openCount)}
                        onMouseLeave={scheduleLauncherHoverClose}
                      >
                        <div style={A.topLauncherMenuHead}>
                          <span>{mode.label}</span>
                          <span style={A.topLauncherMenuMeta}>{openCount} open</span>
                        </div>
                        <div className="thin-scroll" style={A.topLauncherMenuBody}>
                          {renderLauncherWorkTree(mode.id)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
          <div style={A.chatPane}>
            <V6Chat
              thread={chat.thread}
              draft={draft}
              setDraft={setDraft}
              send={send}
              inputRef={inputRef}
              modeLabel={modeLabel}
              onOpenTab={openTab}
              sending={chat.sending}
              streamingText={chat.streamingText}
              activeTool={chat.activeTool}
              error={chat.error}
              modelPreference={modelPreference}
              setModelPreference={setModelPreference}
              showLearnLinks={!user}
              onFileUpload={chat.uploadFile}
              onConfirmStagedAction={chat.confirmStagedAction}
              onCancelStagedAction={chat.cancelStagedAction}
            />
          </div>
        </div>
        <div onMouseDown={onDragStart} title="Drag to resize chat" role="separator" aria-orientation="vertical" style={A.dragHandle}>
          <div style={A.dragGrip} />
        </div>
        <div className="v6-canvas-frame" style={A.canvasPane}>
          <V6Canvas
            tabs={tabs}
            activeTabId={activeTabId}
            setActiveTabId={setActiveTabId}
            openTab={openTab}
            closeTab={closeTab}
            reorderTabs={reorderTabs}
            onPickMode={pickMode}
            onTalkToYulia={(prompt) => send(prompt)}
            user={user}
            onSignOut={onSignOut}
            modelPreference={modelPreference}
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Hash-based URL state ───────────────────────────────── */

function readHashState(): { mode: ModeId; tab: string | null; scope?: FileScope; title?: string; run?: number } {
  try {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return { mode: "today", tab: null };
    const params = new URLSearchParams(hash);
    const runParam = Number(params.get("run"));
    const run = Number.isFinite(runParam) && runParam > 0 ? runParam : undefined;
    const mobileDeal = params.get("deal");
    if (mobileDeal) {
      return { mode: "today", tab: mobileDeal, title: params.get("t") ?? undefined, run };
    }
    const rawMode = params.get("mode") as ModeId | null;
    const mode: ModeId = rawMode && VALID_MODES.includes(rawMode) ? rawMode : "today";
    const rawScope = params.get("scope") as FileScope | null;
    const scope = rawScope && ["all", "data-room", "shared"].includes(rawScope) ? rawScope : undefined;
    const tab = params.get("tab");
    return { mode, tab, scope, title: params.get("t") ?? undefined, run };
  } catch {
    return { mode: "today", tab: null };
  }
}

function tabFromHash(tab: string | null, scope?: FileScope, title?: string, run?: number): Tab | null {
  if (!tab) return null;
  if (tab.endsWith("-root")) return null;
  if (tab.startsWith("files-")) {
    const view = tab.replace(/^files-/, "") as FileListView;
    if (isFileListView(view)) {
      return {
        id: tab,
        kind: "files-list",
        title: filesListTitle(view),
        fileListView: view,
      };
    }
  }
  if (tab.startsWith("deal-")) {
    return {
      id: tab,
      kind: "deal",
      title: title || titleForDealId(tab),
      fileScope: scope,
    };
  }
  if (tab.startsWith("analysis-") || tab.startsWith("an-")) {
    if (tab.startsWith("analysis-bigfake-board")) {
      return buildBigFakeInvestmentBoardTab(tab);
    }
    return {
      id: tab,
      kind: "analysis",
      title: title || titleForAnalysisId(tab),
      analysisRunId: run ?? analysisRunIdFromTabId(tab),
    };
  }
  if (tab.startsWith("artifact-")) {
    return readArtifactTab(tab) ?? {
      id: tab,
      kind: "analysis",
      title: title || "Yulia artifact",
      tool: "artifact",
      markdown: "",
      artifactData: { canvas_action: "show_content", title: title || "Yulia artifact" },
      status: "canvas artifact",
    };
  }
  if (tab === "marketing-studio") {
    return {
      id: "marketing-studio",
      kind: "marketing-studio",
      title: "Marketing Studio",
      studioView: "home",
    };
  }
  return null;
}

function isFileListView(value: string): value is FileListView {
  return value === "all" || value === "deal-libraries" || value === "needs-action" || value === "data-rooms";
}

function filesListTitle(view: FileListView): string {
  const titles: Record<FileListView, string> = {
    all: "All files",
    "deal-libraries": "Deal libraries",
    "needs-action": "Needs action",
    "data-rooms": "Data rooms",
  };
  return titles[view];
}

function titleForDealId(id: string): string {
  if (id.includes("pest")) return "Pest Control · FL";
  if (id.includes("hvac")) return "HVAC platform · CO";
  if (id.includes("electrical")) return "Electrical Contractor · TX";
  if (id.includes("dist")) return "Distribution · OH";
  return "Big Fake Deal";
}

function titleForAnalysisId(id: string): string {
  const normalized = id.toLowerCase();
  if (normalized.includes("buyer")) return "Buyer fit";
  if (normalized.includes("qoe")) return "Quality of earnings";
  if (normalized.includes("comps") || normalized.includes("comparison")) return "Deal comparison";
  if (normalized.includes("valuation")) return "Valuation model";
  if (normalized.includes("recast")) return "Recast analysis";
  if (normalized.includes("sba")) return "SBA bankability";
  if (normalized.includes("lbo")) return "LBO model";
  if (normalized.includes("dcf")) return "DCF model";
  if (normalized.includes("tax")) return "Tax impact";
  if (normalized.includes("market")) return "Market intelligence";
  return "Analysis";
}

function analysisRunIdFromTabId(id: string): number | undefined {
  const match = id.match(/^analysis-(\d+)$/);
  if (!match) return undefined;
  const run = Number(match[1]);
  return Number.isFinite(run) && run > 0 ? run : undefined;
}

const ARTIFACT_TAB_CACHE_KEY = "smbx_v6_artifact_tabs";

function saveArtifactTab(tab: Tab) {
  try {
    if (tab.kind !== "analysis" || tab.tool !== "artifact") return;
    const raw = sessionStorage.getItem(ARTIFACT_TAB_CACHE_KEY);
    const existing = raw ? JSON.parse(raw) : {};
    const next = {
      ...(existing && typeof existing === "object" ? existing : {}),
      [tab.id]: {
        id: tab.id,
        kind: tab.kind,
        title: tab.title,
        tool: tab.tool,
        markdown: tab.markdown,
        artifactData: tab.artifactData,
        status: tab.status,
        sourceMode: tab.sourceMode,
      },
    };
    const entries = Object.entries(next).slice(-12);
    sessionStorage.setItem(ARTIFACT_TAB_CACHE_KEY, JSON.stringify(Object.fromEntries(entries)));
  } catch {
    // Best-effort; artifact tabs still work for the current render.
  }
}

function readArtifactTab(id: string): Tab | null {
  try {
    const raw = sessionStorage.getItem(ARTIFACT_TAB_CACHE_KEY);
    if (!raw) return null;
    const cache = JSON.parse(raw);
    const tab = cache?.[id];
    if (!tab || tab.kind !== "analysis" || tab.tool !== "artifact") return null;
    return tab as Tab;
  } catch {
    return null;
  }
}

function saveStudioDraft(tab: Tab) {
  try {
    const key = "smbx_marketing_studio_drafts";
    const drafts = JSON.parse(localStorage.getItem(key) || "[]");
    const draftId = tab.studioDraftId ?? tab.id;
    const workingStore = (window as unknown as Record<string, Record<string, any> | undefined>).__smbxMarketingStudioWorkingDrafts ?? {};
    const workingDraft = workingStore[draftId] ?? {};
    const existing = Array.isArray(drafts)
      ? drafts.find((item: any) => item?.id === draftId)
      : null;
    const draft = {
      ...existing,
      ...workingDraft,
      id: draftId,
      tabId: tab.id,
      title: workingDraft.title ?? tab.title,
      format: workingDraft.format ?? tab.studioFormat ?? "one-pager",
      campaign: workingDraft.campaign ?? tab.studioCampaign ?? "General",
      updatedAt: new Date().toISOString(),
      status: workingDraft.status ?? existing?.status ?? "draft",
    };
    const next = Array.isArray(drafts)
      ? [draft, ...drafts.filter((item: any) => item?.id !== draft.id)].slice(0, 24)
      : [draft];
    localStorage.setItem(key, JSON.stringify(next));
    delete workingStore[draftId];
    (window as unknown as Record<string, Record<string, any>>).__smbxMarketingStudioWorkingDrafts = workingStore;
  } catch {
    // Local draft saving is best-effort until the studio has a backend table.
  }
}

function discardStudioDraft(tab: Tab) {
  try {
    const draftId = tab.studioDraftId ?? tab.id;
    const workingStore = (window as unknown as Record<string, Record<string, any> | undefined>).__smbxMarketingStudioWorkingDrafts ?? {};
    delete workingStore[draftId];
    (window as unknown as Record<string, Record<string, any>>).__smbxMarketingStudioWorkingDrafts = workingStore;
  } catch {
    // Best-effort session cleanup.
  }
}

function modeForTab(tab: Tab): ModeId | null {
  if (tab.kind === "mode-root") return tab.modeId ?? null;
  if (tab.kind === "deal" || tab.kind === "analysis") return "pipeline";
  if (tab.kind === "doc") return inferredLauncherDealName(tab) ? "pipeline" : "files";
  if (tab.kind === "files-list" || tab.kind === "marketing-studio") return "files";
  if (tab.kind === "learn" || tab.kind === "feed-item" || tab.kind === "starter" || tab.kind === "settings" || tab.kind === "history") return "today";
  if (tab.sourceMode) return tab.sourceMode;
  return null;
}

interface LauncherDealGroup {
  deal: Tab;
  children: Tab[];
  virtual?: boolean;
}

function tabBelongsToLauncherMode(tab: Tab, mode: ModeId, allTabs: Tab[]): boolean {
  if (tab.kind === "mode-root") return false;
  if (tab.kind === "learn") return mode === "today";
  if (tab.kind === "settings" || tab.kind === "history" || tab.kind === "starter" || tab.kind === "feed-item") return mode === "today";
  if (tab.kind === "files-list" || tab.kind === "marketing-studio") return mode === "files";
  if (tab.kind === "deal") return mode === "pipeline";
  const dealParent = owningLauncherDealForTab(tab, allTabs);
  if (dealParent || inferredLauncherDealName(tab)) return mode === "pipeline";
  if (tab.kind === "analysis") return mode === "pipeline";
  if (tab.kind === "doc") return mode === "files";
  if (tab.sourceMode) return tab.sourceMode === mode;
  return false;
}

function groupLauncherTabsByDeal(modeTabs: Tab[]): { deals: LauncherDealGroup[]; loose: Tab[] } {
  const dealTabs = modeTabs.filter(tab => tab.kind === "deal");
  const used = new Set<string>();
  const deals: LauncherDealGroup[] = dealTabs.map(deal => {
    used.add(deal.id);
    const children = modeTabs.filter(tab => tab.kind !== "deal" && launcherTabMatchesDeal(tab, deal));
    children.forEach(tab => used.add(tab.id));
    return { deal, children };
  });

  const virtualDealChildren = new Map<string, Tab[]>();
  modeTabs.forEach(tab => {
    if (used.has(tab.id) || tab.kind === "deal") return;
    const dealTitle = inferredLauncherDealName(tab);
    if (!dealTitle) return;
    if (!virtualDealChildren.has(dealTitle)) virtualDealChildren.set(dealTitle, []);
    virtualDealChildren.get(dealTitle)?.push(tab);
    used.add(tab.id);
  });

  virtualDealChildren.forEach((children, dealTitle) => {
    deals.push({
      deal: {
        id: `virtual-${launcherDealTabIdForTitle(dealTitle)}`,
        kind: "deal",
        title: dealTitle,
        sourceMode: "pipeline",
      },
      children,
      virtual: true,
    });
  });

  return { deals, loose: modeTabs.filter(tab => !used.has(tab.id)) };
}

function owningLauncherDealForTab(tab: Tab, allTabs: Tab[]): Tab | null {
  if (tab.kind === "deal") return null;
  return allTabs.find(candidate => candidate.kind === "deal" && launcherTabMatchesDeal(tab, candidate)) ?? null;
}

function launcherTabMatchesDeal(tab: Tab, deal: Tab): boolean {
  if (tab.id === deal.id) return false;
  if (tab.dealId != null && String(tab.dealId) === String(deal.id)) return true;
  if (tab.dealTitle && sameLauncherDealName(tab.dealTitle, deal.title)) return true;
  if (tab.dealTitle) return false;
  if (tab.kind === "analysis" && tab.id.startsWith("model-")) return false;
  const dealTitle = normalizeLauncherDealTitle(deal.title);
  return sameLauncherDealName(inferredLauncherDealName(tab), dealTitle) || stripLauncherDealPrefix(tab.title, dealTitle) !== normalizeLauncherTabTitle(tab.title);
}

function inferredLauncherDealName(tab: Tab): string | null {
  if (tab.dealTitle) return tab.dealTitle;
  if (tab.kind === "analysis" && tab.id.startsWith("model-")) return null;
  const haystack = normalizeLauncherTabTitle([
    tab.id,
    tab.title,
    tab.kind === "analysis" ? tab.tool : "",
    tab.kind === "doc" ? tab.status : "",
  ].filter(Boolean).join(" ")).toLowerCase();

  if (haystack.includes("big fake") || haystack.includes("bigfake")) return "Big Fake Deal";
  if (haystack.includes("pest")) return "Pest Control · FL";
  if (haystack.includes("hvac platform") || haystack.includes("deal-hvac")) return "HVAC platform · CO";
  if (haystack.includes("electrical")) return "Electrical Contractor · TX";
  if (haystack.includes("distribution")) return "Distribution · OH";
  if (/\bioi\b/.test(haystack) || haystack.includes("qoe") || haystack.includes("buyer fit") || haystack.includes("mutual nda")) return "Big Fake Deal";
  if (haystack.includes("p&l") || haystack.includes("p-l") || haystack.includes("audited") || haystack.includes("tax return")) return "Big Fake Deal";
  if (/\bloi\b/.test(haystack)) return "Pest Control · FL";
  if (
    haystack.includes("customer list") ||
    haystack.includes("security findings") ||
    haystack.includes("corporate org") ||
    haystack.includes("disclosure schedule") ||
    haystack.includes("insurance") ||
    haystack.includes("litigation")
  ) {
    return "HVAC platform · CO";
  }
  return null;
}

function topTabIcon(tab: Tab): IconName {
  if (tab.kind === "deal") return "deal";
  if (tab.kind === "analysis") return "chart";
  if (tab.kind === "files-list" || tab.kind === "learn") return "library";
  if (tab.kind === "doc" || tab.kind === "marketing-studio") return "doc";
  if (tab.kind === "history") return "history";
  if (tab.kind === "settings") return "settings";
  if (tab.kind === "starter") return "plus";
  return "feed";
}

function topTabMeta(tab: Tab, allTabs: Tab[] = [], insideDeal = false): string {
  const dealContext = insideDeal ? null : (owningLauncherDealForTab(tab, allTabs)?.title ?? inferredLauncherDealName(tab));
  const withDeal = (label: string) => dealContext ? `${dealContext} · ${label}` : label;
  if (tab.kind === "deal") return "Deal page";
  if (tab.kind === "analysis") return withDeal(tab.tool ? `Analysis · ${tab.tool}` : "Analysis");
  if (tab.kind === "files-list") return "File workspace";
  if (tab.kind === "doc") return withDeal(tab.status ? `Document · ${tab.status}` : "Document");
  if (tab.kind === "marketing-studio") return "Studio";
  if (tab.kind === "learn") return tab.section === "pricing" ? "Pricing" : "How it works";
  if (tab.kind === "history") return "Recent activity";
  if (tab.kind === "settings") return "Workspace settings";
  if (tab.kind === "starter") return "New workspace";
  return "Open work";
}

function launcherDealTabIdForTitle(title: string): string {
  const key = normalizeLauncherDealTitle(title).toLowerCase();
  if (key.includes("big fake")) return "deal-bigfake";
  if (key.includes("pest")) return "deal-pest";
  if (key.includes("hvac")) return "deal-hvac";
  if (key.includes("electrical")) return "deal-electrical";
  if (key.includes("distribution")) return "deal-distribution";
  return `deal-${key.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "workspace"}`;
}

function stripLauncherDealPrefix(title: string, dealTitle: string): string {
  const normalizedTitle = normalizeLauncherTabTitle(title);
  const normalizedDeal = normalizeLauncherDealTitle(dealTitle);
  if (!normalizedDeal) return normalizedTitle;
  const patterns = [
    new RegExp(`^${escapeLauncherRegExp(normalizedDeal)}\\s*(?:[·:/-])\\s*`, "i"),
    new RegExp(`^${escapeLauncherRegExp(normalizedDeal)}\\s+`, "i"),
  ];
  for (const pattern of patterns) {
    const stripped = normalizedTitle.replace(pattern, "").trim();
    if (stripped !== normalizedTitle) return stripped || normalizedTitle;
  }
  return normalizedTitle;
}

function cleanLauncherRepeatedScope(title: string): string {
  const parts = normalizeLauncherTabTitle(title)
    .split(/\s*[·:]\s*/)
    .map(part => part.trim())
    .filter(Boolean);
  if (parts.length < 2) return normalizeLauncherTabTitle(title);
  while (parts.length > 1 && launcherDealTitleKey(parts[0]) === launcherDealTitleKey(parts[1])) {
    parts.splice(1, 1);
  }
  return parts.join(" · ");
}

function sameLauncherDealName(left?: string | null, right?: string | null): boolean {
  const a = launcherDealTitleKey(left);
  const b = launcherDealTitleKey(right);
  return Boolean(a && b && a === b);
}

function launcherDealTitleKey(title?: string | null): string {
  return normalizeLauncherDealTitle(title ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizeLauncherDealTitle(title: string): string {
  return normalizeLauncherTabTitle(title)
    .replace(/\s*[·:-]\s*sample\b/gi, "")
    .trim();
}

function normalizeLauncherTabTitle(title: string): string {
  return title.replace(/\s+/g, " ").trim();
}

function escapeLauncherRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function writeHashState({
  mode,
  tab,
  scope,
  title,
  run,
}: {
  mode: ModeId;
  tab: string;
  scope?: FileScope;
  title?: string;
  run?: number;
}) {
  try {
    const params = new URLSearchParams();
    params.set("mode", mode);
    params.set("tab", tab);
    if (scope) params.set("scope", scope);
    if (title && !tab.endsWith("-root")) params.set("t", title);
    if (run) params.set("run", String(run));
    const next = `#${params.toString()}`;
    if (window.location.hash !== next) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search + next);
    }
  } catch { /* noop */ }
}

const A: Record<string, CSSProperties> = {
  shell: {
    display: "flex", flexDirection: "column",
    height: "100vh", width: "100%", overflow: "hidden",
    background: "linear-gradient(180deg, #DDE8F8 0%, #E2EBF9 48%, #EFF4FD 100%)",
  },
  leftLauncherBar: {
    height: 54,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "6px 10px 8px",
    boxSizing: "border-box",
    overflow: "visible",
    position: "relative",
    zIndex: 70,
  },
  launcherStrip: {
    position: "relative",
    height: 40,
    width: "fit-content",
    maxWidth: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    padding: "4px",
    boxSizing: "border-box",
    borderRadius: 15,
    background: "rgba(251, 253, 255, 0.88)",
    border: "1px solid rgba(150, 174, 205, 0.78)",
    boxShadow: "0 1px 2px rgba(36,59,84,0.08), 0 10px 24px -22px rgba(45,65,90,0.38), inset 0 1px 0 rgba(255,255,255,0.94)",
    backdropFilter: "blur(8px) saturate(150%)",
    WebkitBackdropFilter: "blur(8px) saturate(150%)",
    overflow: "visible",
  },
  topLauncherWrap: {
    display: "inline-flex",
    height: 32,
    flex: "0 0 auto",
  },
  topLauncher: {
    all: "unset",
    boxSizing: "border-box",
    height: 32,
    minWidth: 74,
    padding: "0 8px",
    borderRadius: 11,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    cursor: "pointer",
    border: "1px solid transparent",
    color: "#59697D",
    fontSize: 12,
    fontWeight: 800,
  },
  topLauncherActive: {
    background: "#FFFFFF",
    border: "1px solid rgba(132, 158, 196, 0.88)",
    color: "#2F5F8D",
    boxShadow: [
      "0 1px 1px rgba(36, 59, 84, 0.10)",
      "0 8px 16px -15px rgba(36, 59, 84, 0.38)",
      "inset 0 1px 0 rgba(255,255,255,0.96)",
    ].join(", "),
  },
  topLauncherIcon: {
    width: 19,
    height: 19,
    borderRadius: 6,
    display: "grid",
    placeItems: "center",
    color: "inherit",
  },
  topLauncherIconActive: {
    background: "rgba(225, 239, 253, 0.96)",
    color: "#2F5F8D",
    boxShadow: "inset 0 0 0 0.5px rgba(147, 176, 209, 0.42)",
  },
  topLauncherLabel: {
    lineHeight: 1,
    whiteSpace: "nowrap",
  },
  topLauncherBadge: {
    minWidth: 16,
    height: 16,
    padding: "0 5px",
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    fontFamily: "var(--font-mono)",
    fontSize: 9.5,
    color: "#3F6689",
    background: "rgba(227, 240, 253, 0.96)",
    boxShadow: "inset 0 0 0 1px rgba(151, 183, 214, 0.62)",
  },
  topLauncherBadgeActive: {
    color: "#2F5F8D",
    background: "rgba(235, 244, 253, 0.78)",
    boxShadow: "0 0 0 1px rgba(150, 174, 205, 0.42)",
  },
  topLauncherMenu: {
    position: "absolute",
    top: "calc(100% + 4px)",
    left: "50%",
    width: 326,
    maxHeight: "min(500px, calc(100vh - 108px))",
    display: "flex",
    flexDirection: "column",
    padding: 10,
    boxSizing: "border-box",
    borderRadius: 16,
    background: "rgba(242, 247, 253, 0.96)",
    border: "1px solid rgba(195, 211, 228, 0.72)",
    boxShadow: "0 22px 54px rgba(37, 52, 74, 0.18), inset 0 1px 0 rgba(255,255,255,0.78)",
    backdropFilter: "blur(18px) saturate(160%)",
    WebkitBackdropFilter: "blur(18px) saturate(160%)",
    zIndex: 80,
  },
  topLauncherMenuHead: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    padding: "4px 6px 9px",
    fontSize: 13,
    fontWeight: 850,
    color: "var(--m-on-surface)",
    letterSpacing: "-0.01em",
  },
  topLauncherMenuMeta: {
    fontFamily: "var(--font-mono)",
    fontSize: 9.5,
    letterSpacing: "0.11em",
    textTransform: "uppercase",
    color: "var(--m-on-surface-mid)",
    fontWeight: 700,
  },
  topLauncherMenuBody: {
    flex: "0 1 auto",
    minHeight: 0,
    maxHeight: "min(410px, calc(100vh - 174px))",
    overflowY: "auto",
    padding: "0 2px 2px",
  },
  row: {
    flex: 1,
    display: "flex",
    minHeight: 0,
    gap: 8,
    padding: "8px",
    boxSizing: "border-box",
    overflow: "visible",
  },
  leftRail: {
    flexShrink: 0,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    overflow: "visible",
    position: "relative",
    zIndex: 60,
  },
  chatPane: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    marginTop: 0,
    minHeight: 0,
  },
  canvasPane: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    minHeight: 0,
    position: "relative",
    borderRadius: 14,
    overflow: "hidden",
    background: "linear-gradient(180deg, #FFFFFF 0%, #FEFFFF 58%, #F8FBFF 100%)",
    border: "1px solid rgba(145, 165, 191, 0.84)",
    boxShadow: [
      "0 0 0 1px rgba(255, 255, 255, 0.72)",
      "inset 0 1px 0 rgba(255, 255, 255, 0.98)",
      "-14px -10px 30px rgba(38, 54, 76, 0.13)",
      "-3px -2px 8px rgba(38, 54, 76, 0.10)",
      "0 18px 44px rgba(31, 45, 66, 0.14)",
      "0 2px 8px rgba(31, 45, 66, 0.10)",
    ].join(", "),
  },
  dragHandle: {
    width: 8, flexShrink: 0,
    cursor: "col-resize",
    background: "transparent",
    position: "relative",
    borderRadius: 999,
    margin: "10px 0",
  },
  dragGrip: {
    position: "absolute", top: "50%", left: "50%",
    transform: "translate(-50%, -50%)",
    width: 3, height: 42, borderRadius: 999,
    background: "#778A9E", opacity: 0.18,
  },
};
