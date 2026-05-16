import { useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { useLocation } from "wouter";
import { DEV_AUTH_BYPASS, useAuth, type User } from "../../hooks/useAuth";
import { useAnonymousChat } from "../../hooks/useAnonymousChat";
import { useAuthChat } from "../../hooks/useAuthChat";
import { useIsMobile } from "../../hooks/useIsMobile";
import V6Mobile from "./mobile/V6Mobile";
import { V6Sidebar } from "./Sidebar";
import { V6Chat } from "./Chat";
import { V6Canvas } from "./Canvas";
import { MODES } from "./icons";
import { buildDesktopSurfaceContext, type SurfaceContext } from "../../lib/yuliaSurfaceContext";
import { normalizeModelPreference, type ModelPreference } from "../../lib/modelPreference";
import { isSuperAdminUser } from "../../lib/superAdmin";
import type { FileListView, FileScope, Message, ModeId, Tab } from "./types";

const VALID_MODES: ModeId[] = ["today", "pipeline", "search", "files", "docs", "analysis", "intel", "library"];

interface ChatBridge {
  thread: Message[];
  sending: boolean;
  streamingText: string;
  activeTool: string | null;
  error: string | null;
  send: (text: string, surfaceContext?: SurfaceContext, modelPreference?: ModelPreference) => void;
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
  }), [chat.messages, chat.sending, chat.streamingText, chat.error, chat.sendMessage]);
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
    confirmStagedAction: chat.confirmStagedAction,
    cancelStagedAction: chat.cancelStagedAction,
  }), [chat.messages, chat.sending, chat.streamingText, chat.activeTool, chat.sendMessage, chat.confirmStagedAction, chat.cancelStagedAction]);

  return <V6AppShell user={user} chat={bridge} onSignOut={async () => { await onSignOut(); }} />;
}

/* ─── Shared shell ───────────────────────────────────────────── */

interface ShellProps {
  user: User | null;
  chat: ChatBridge;
  onSignOut: () => void;
  onDevSignIn?: () => void;
}

function V6AppShell({ user, chat, onSignOut, onDevSignIn }: ShellProps) {
  const [, navigate] = useLocation();

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
    const deepTab = tabFromHash(initial.tab, initial.scope, initial.title);
    const base = rootTab.id === todayRoot.id ? [todayRoot] : [todayRoot, rootTab];
    return deepTab && !base.find(tab => tab.id === deepTab.id) ? [...base, deepTab] : base;
  });
  const [activeTabId, setActiveTabId] = useState(initial.tab ?? `${initial.mode}-root`);

  // Sync tab + mode to URL hash on every change
  useEffect(() => {
    const activeTab = tabs.find(t => t.id === activeTabId);
    writeHashState({ mode: activeMode, tab: activeTabId, scope: activeTab?.fileScope });
  }, [activeMode, activeTabId, tabs]);

  // Listen for browser back/forward
  useEffect(() => {
    const onHash = () => {
      const next = readHashState();
      const rootId = `${next.mode}-root`;
      setActiveMode(next.mode);
      setTabs(prev => {
        const deepTab = tabFromHash(next.tab, next.scope, next.title);
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
      if (detail.canvas_action === "create_model_tab" && detail.tabId) {
        openTab({
          id: detail.tabId,
          kind: "analysis",
          title: detail.title || "Interactive model",
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
    chat.send(msg, currentSurfaceContext(), modelPreference);
    setDraft("");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  useEffect(() => {
    try {
      localStorage.setItem("smbx_model_preference", modelPreference);
    } catch { /* ignore */ }
  }, [modelPreference]);

  // ─── Resizable chat well ───
  const [chatWidth, setChatWidth] = useState(400);
  const onDragStart = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = chatWidth;
    const onMove = (ev: globalThis.MouseEvent) => {
      const dx = ev.clientX - startX;
      setChatWidth(Math.min(640, Math.max(320, startW + dx)));
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
        <V6Sidebar
          activeMode={activeMode}
          tabs={tabs}
          activeTabId={activeTabId}
          onPickMode={pickMode}
          onPickTab={activateTab}
          onCloseTab={closeTab}
          onOpenTab={openTab}
          user={user}
          onSignIn={() => {
            if (DEV_AUTH_BYPASS) {
              onDevSignIn?.();
              return;
            }
            navigate("/login");
          }}
          onSignUp={() => {
            if (DEV_AUTH_BYPASS) {
              onDevSignIn?.();
              return;
            }
            navigate("/signup");
          }}
          onSignOut={onSignOut}
        />
        <main style={A.main}>
          <div style={{ ...A.chatPane, width: chatWidth }}>
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
              onConfirmStagedAction={chat.confirmStagedAction}
              onCancelStagedAction={chat.cancelStagedAction}
            />
          </div>
          <div onMouseDown={onDragStart} title="Drag to resize chat" role="separator" aria-orientation="vertical" style={A.dragHandle}>
            <div style={A.dragGrip} />
          </div>
          <div style={A.canvasPane}>
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
        </main>
      </div>
    </div>
  );
}

/* ─── Hash-based URL state ───────────────────────────────── */

function readHashState(): { mode: ModeId; tab: string | null; scope?: FileScope; title?: string } {
  try {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return { mode: "today", tab: null };
    const params = new URLSearchParams(hash);
    const mobileDeal = params.get("deal");
    if (mobileDeal) {
      return { mode: "today", tab: mobileDeal, title: params.get("t") ?? undefined };
    }
    const rawMode = params.get("mode") as ModeId | null;
    const mode: ModeId = rawMode && VALID_MODES.includes(rawMode) ? rawMode : "today";
    const rawScope = params.get("scope") as FileScope | null;
    const scope = rawScope && ["all", "data-room", "shared"].includes(rawScope) ? rawScope : undefined;
    const tab = params.get("tab");
    return { mode, tab, scope, title: params.get("t") ?? undefined };
  } catch {
    return { mode: "today", tab: null };
  }
}

function tabFromHash(tab: string | null, scope?: FileScope, title?: string): Tab | null {
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
  if (tab.sourceMode) return tab.sourceMode;
  if (tab.kind === "deal" || tab.kind === "analysis") return "pipeline";
  if (tab.kind === "files-list" || tab.kind === "doc" || tab.kind === "marketing-studio") return "files";
  if (tab.kind === "learn" || tab.kind === "feed-item" || tab.kind === "starter" || tab.kind === "settings" || tab.kind === "history") return "today";
  return null;
}

function writeHashState({ mode, tab, scope }: { mode: ModeId; tab: string; scope?: FileScope }) {
  try {
    const params = new URLSearchParams();
    params.set("mode", mode);
    params.set("tab", tab);
    if (scope) params.set("scope", scope);
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
    background: "linear-gradient(180deg, #D8E4F0 0%, #CEDDEB 100%)",
  },
  row: {
    flex: 1,
    display: "flex",
    minHeight: 0,
    gap: 8,
    padding: 8,
    boxSizing: "border-box",
  },
  main: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    gap: 8,
    minHeight: 0,
  },
  chatPane: {
    flexShrink: 0,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    borderRadius: 22,
    overflow: "hidden",
    boxShadow: "0 22px 56px rgba(38, 59, 84, 0.12)",
  },
  canvasPane: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    minHeight: 0,
    borderRadius: 22,
    overflow: "hidden",
    background: "var(--m-bg)",
    border: "1px solid rgba(199, 214, 229, 0.72)",
    boxShadow: "0 26px 68px rgba(38, 59, 84, 0.14)",
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
