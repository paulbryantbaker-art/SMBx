import { lazy, Suspense, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { authHeaders, DEV_AUTH_BYPASS, useAuth, type User } from "../../hooks/useAuth";
import { useAnonymousChat } from "../../hooks/useAnonymousChat";
import { useAuthChat } from "../../hooks/useAuthChat";
import { useIsMobile } from "../../hooks/useIsMobile";
import { V6Chat } from "./Chat";
import { MODES, V6Icon } from "./icons";
import V6NotificationBell from "./V6NotificationBell";
import "./workspace.css";
import { buildDesktopSurfaceContext, type SurfaceContext } from "../../lib/yuliaSurfaceContext";
import { normalizeModelPreference, type ModelPreference } from "../../lib/modelPreference";
import { loadWkTheme, saveWkTheme, WK_THEMES, type WkTheme } from "../../lib/wkTheme";
import { VERDICT_MATERIAL } from "./shared/verdictMaterial";
import { useV6WorkspaceData } from "../../hooks/useV6WorkspaceData";
import { CDTopBar, type CDSectionKey } from "../cd/shell/CDTopBar";
import { CDLeftRail, type CDRailDeal, type CDRailModuleNav } from "../cd/shell/CDLeftRail";
import { CDCanvasTabStrip, type CDStripTab } from "../cd/shell/CDCanvasTabStrip";
import { CDYuliaRail } from "../cd/shell/CDYuliaRail";
import { cdDealColor, cdFmtCents } from "../cd/shell/cdAtoms";

/* Family inks for Open-tab glyphs (consume verdictMaterial, never restate):
 * deal=info-blue baseline, doc=structure gold, analysis/model=valuation
 * sage. Unlisted kinds stay neutral ink. */
const TAB_KIND_INK: Record<string, string | undefined> = {
  deal: VERDICT_MATERIAL.baseline.tone.ink,
  doc: VERDICT_MATERIAL.watch.tone.ink,
  analysis: VERDICT_MATERIAL.pursue.tone.ink,
  model: VERDICT_MATERIAL.pursue.tone.ink,
};
import { consumePendingMessage } from "../../marketing/useEnterApp";
import { buildBigFakeInvestmentBoardTab, shouldOpenSampleInvestmentBoard } from "../../lib/sampleInvestmentBoard";
import { useModelStore, type ModelType } from "../../lib/modelStore";
import type { FileListView, FileScope, IconName, Message, ModeId, Tab, ToolTraceEntry } from "./types";

const VALID_MODES: ModeId[] = ["today", "pipeline", "search", "studio", "files", "docs", "analysis", "intel", "library", "notifications"];

const V6Mobile = lazy(() => import("./mobile/V6Mobile"));
const V6Canvas = lazy(() => import("./Canvas").then(module => ({ default: module.V6Canvas })));
// Agent-first desktop ("nd") shell — opt-in via localStorage smbx_shell="nd". AGENT_DESKTOP_CUTOVER_PLAN.md
const NDApp = lazy(() => import("../nd/NDApp").then(module => ({ default: module.NDApp })));

export interface ChatBridge {
  thread: Message[];
  sending: boolean;
  streamingText: string;
  activeTool: string | null;
  toolTrace?: ToolTraceEntry[];
  error: string | null;
  send: (text: string, surfaceContext?: SurfaceContext, modelPreference?: ModelPreference) => void;
  uploadFile?: (file: File) => Promise<{ name: string; size: string } | null>;
  confirmStagedAction?: (id: number, summary?: string) => void | Promise<void>;
  cancelStagedAction?: (id: number) => void | Promise<void>;
  /* Conversation history (authed only) — the History tab resumes/clears
     threads through the SAME useAuthChat instance that powers the composer. */
  activeConversationId?: number | null;
  selectConversation?: (id: number) => void;
  newConversation?: () => void;
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
  const user = auth.user;

  if (auth.loading) {
    return (
      <div style={{ display: "grid", placeItems: "center", height: "100vh", color: "var(--m-on-surface-mid)" }}>
        Loading…
      </div>
    );
  }

  // ─── Desktop UI removed (2026-06-16) ───────────────────────────────────────
  // The desktop shells (nd + cd) were a parallel reimplementation that diverged
  // from the backend the mobile app already consumes correctly. Per direction,
  // every bit of desktop UI is out of the render path: the working mobile
  // experience now renders on EVERY viewport while desktop is rebuilt — against
  // the real APIs this time. (V6AppShell / NDApp / cd shell are dead code,
  // unreferenced; safe to delete in a follow-up cleanup.)
  return (
    <Suspense fallback={<V6ShellLoader />}>
      <V6Mobile user={user} onSignOut={async () => { await auth.logout(); }} onDevSignIn={auth.devSignIn} />
    </Suspense>
  );
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
    toolTrace: chat.toolTrace,
    error: null, // useAuthChat surfaces errors via toasts already
    send: chat.sendMessage,
    uploadFile: chat.uploadFile,
    confirmStagedAction: chat.confirmStagedAction,
    cancelStagedAction: chat.cancelStagedAction,
    activeConversationId: chat.activeConversationId,
    selectConversation: chat.selectConversation,
    newConversation: chat.newConversation,
  }), [chat.messages, chat.sending, chat.streamingText, chat.activeTool, chat.toolTrace, chat.sendMessage, chat.uploadFile, chat.confirmStagedAction, chat.cancelStagedAction, chat.activeConversationId, chat.selectConversation, chat.newConversation]);

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
  // Agent-first desktop shell (opt-in, gated). Returns BEFORE the V6 shell hooks
  // so the two desktops never coexist; mobile/anon already branched earlier.
  // The agent-first ("nd") shell is now the DEFAULT desktop. Opt OUT with ?nd=0
  // (or localStorage smbx_shell = "legacy") to drop to the fully-functional
  // previous desktop while the deeper nd surfaces (deal workspace, etc.) are
  // phased in. ?nd=1 forces it back on.
  const ndShell = (() => {
    try {
      const q = new URLSearchParams(window.location.search).get("nd");
      if (q === "1") { localStorage.removeItem("smbx_shell"); return true; }
      if (q === "0") { localStorage.setItem("smbx_shell", "legacy"); return false; }
      const s = localStorage.getItem("smbx_shell");
      return s !== "legacy" && s !== "cd"; // default → nd
    } catch { return true; }
  })();
  if (ndShell) {
    return <Suspense fallback={<V6ShellLoader />}><NDApp user={user} chat={chat} onSignOut={onSignOut} /></Suspense>;
  }

  // ─── Tab + mode state, hydrated from URL hash ───
  const initial = readHashState();
  const restoreModelTab = useModelStore(s => s.restoreTab);
  const updateModelAssumptions = useModelStore(s => s.updateAssumptions);
  const closeModelTab = useModelStore(s => s.closeTab);

  const [activeMode, setActiveMode] = useState<ModeId>(initial.mode);
  const [modelPreference, setModelPreference] = useState<ModelPreference>(() => {
    try {
      return normalizeModelPreference(localStorage.getItem("smbx_model_preference"));
    } catch {
      return "auto";
    }
  });
  // Workspace chrome theme (toolbar palette + Settings → Appearance) —
  // shell repaint only.
  const [wkTheme, setWkTheme] = useState<WkTheme>(loadWkTheme);
  const [themeOpen, setThemeOpen] = useState(false);
  const changeWkTheme = (t: WkTheme) => { setWkTheme(t); saveWkTheme(t); };
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
  // FAB chat open/closed (CD "Ramp" workspace — chat is a floating bubble).
  // CD shell: the Yulia rail is a persistent right panel (default open on
  // desktop, matching the mockup); collapses to a thin strip. `navOpen`
  // toggles the left rail between 240px and the 66px icon rail.
  const [chatOpen, setChatOpen] = useState(true);
  const [navOpen, setNavOpen] = useState(true);
  const [acctOpen, setAcctOpen] = useState(false);
  // Stripe Customer Portal session state for the account popover's
  // "Manage subscription" item (desktop parity with mobile billing).
  const [billingBusy, setBillingBusy] = useState(false);
  const [billingError, setBillingError] = useState<string | null>(null);
  const tabsRef = useRef<Tab[]>(tabs);

  useEffect(() => {
    tabsRef.current = tabs;
  }, [tabs]);

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

  // Apply a notification's action_url. These are V6 hash routes —
  // `/#mode=pipeline&tab=deal-team-123` (mention), `/#mode=...&tab=deal-456`,
  // etc. Driving them through the hash lets the existing hashchange decoder
  // (the `onHash` effect above) build the right canvas tab — one source of
  // routing truth. Assigning window.location.hash fires hashchange; if the
  // target equals the current hash it would be a no-op, so we read+apply the
  // decoded state directly in that case.
  const navigateToActionUrl = (actionUrl: string) => {
    try {
      const hashIndex = actionUrl.indexOf("#");
      const rawHash = hashIndex >= 0 ? actionUrl.slice(hashIndex + 1) : "";
      if (!rawHash) return;
      const nextHash = `#${rawHash}`;
      if (window.location.hash === nextHash) {
        // Same hash → hashchange won't fire; decode + apply inline.
        const next = readHashState();
        const rootId = `${next.mode}-root`;
        setActiveMode(next.mode);
        const deepTab = tabFromHash(next.tab, next.scope, next.title, next.run);
        if (deepTab) {
          setTabs(prev =>
            prev.find(t => t.id === deepTab.id)
              ? prev.map(t => (t.id === deepTab.id ? { ...t, ...deepTab } : t))
              : [...prev, deepTab],
          );
        }
        setActiveTabId(next.tab ?? rootId);
      } else {
        // Different hash → let the hashchange listener do the decoding.
        window.location.hash = nextHash;
      }
    } catch {
      /* malformed action_url — ignore */
    }
  };

  const openTab: (descriptor: Omit<Tab, "id"> & { id?: string }) => void = (descriptor) => {
    const id = descriptor.id ?? `${descriptor.kind}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const sourceMode = descriptor.kind === "mode-root" ? undefined : descriptor.sourceMode ?? activeMode;
    const nextTab = { ...descriptor, ...(sourceMode ? { sourceMode } : null), id } as Tab;
    saveArtifactTab(nextTab);
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
    if (tabToClose?.kind === "model") {
      closeModelTab(tabToClose.modelTabId ?? tabToClose.id);
    }
    if (tabToClose?.kind === "marketing-studio" && tabToClose.studioView === "canvas" && tabToClose.studioDirty !== false) {
      const saveDraft = window.confirm(`Save "${tabToClose.title}" before closing?\n\nOK saves it to Pitch Book Studio. Cancel closes without saving.`);
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
        const modelType = normalizeCanvasModelType(detail.modelType);
        if (modelType) {
          restoreModelTab(
            detail.tabId,
            modelType,
            detail.title || "Interactive model",
            detail.initialAssumptions || {},
            typeof detail.dealId === "number" ? detail.dealId : undefined,
            typeof detail.parentOutputHash === "string" ? detail.parentOutputHash : null,
          );
        }
        openTab({
          id: detail.tabId,
          kind: modelType ? "model" : "analysis",
          title: detail.title || "Interactive model",
          dealId: detail.dealId ?? null,
          dealTitle: detail.dealTitle ?? null,
          tool: detail.modelType || "interactive_model",
          modelTabId: modelType ? detail.tabId : undefined,
          modelType: modelType || detail.modelType,
          analysisRunId: detail.analysisRunId ?? null,
          modelState: detail.initialAssumptions || {},
          status: modelType ? "versioned model" : "saved model",
        });
      }
      if (detail.canvas_action === "update_model") {
        const targetId = detail.tabId && detail.tabId !== "active" ? detail.tabId : activeTabId;
        const targetTab = tabsRef.current.find(tab => tab.id === targetId);
        const updates = detail.updates && typeof detail.updates === "object" ? detail.updates : {};
        if (targetTab?.kind === "model" && targetTab.modelTabId) {
          updateModelAssumptions(targetTab.modelTabId, updates);
        }
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
  }, [activeTabId, restoreModelTab, updateModelAssumptions]);

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
      openTab({ id: "marketing-studio", kind: "marketing-studio", title: "Studio", studioView: "home" });
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

  // Marketing → app threshold: if the visitor submitted a message on the
  // marketing site, consume it on mount, open Yulia, and send it so she answers
  // the question they crossed over with. Fires once (consume clears it; ref
  // guards against StrictMode double-invoke).
  const pendingHandledRef = useRef(false);
  useEffect(() => {
    if (pendingHandledRef.current) return;
    pendingHandledRef.current = true;
    const pending = consumePendingMessage();
    if (pending) {
      setChatOpen(true);
      setTimeout(() => send(pending), 60);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("smbx_model_preference", modelPreference);
    } catch { /* ignore */ }
  }, [modelPreference]);

  const modeLabel = MODES.find(m => m.id === activeMode)?.label ?? "Workspace";
  const launcherWork = (modeId: ModeId) => tabs.filter(tab => tabBelongsToLauncherMode(tab, modeId, tabs));
  // Open work items surfaced in the nav "Open" section (mode-roots are reached
  // through the module groups, so they're excluded here).
  const workTabs = tabs.filter(t => t.kind !== "mode-root");

  // ⌘K summons Yulia from anywhere: open the chat window if it's closed,
  // then focus the composer once it has rendered.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (chatOpen) {
          inputRef.current?.focus();
        } else {
          setChatOpen(true);
          requestAnimationFrame(() => inputRef.current?.focus());
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chatOpen]);

  // ⌘1–⌘9 jump to the Nth open work tab; ctrl+Tab / ctrl+shift+Tab cycle
  // through them (wrapping). Both reuse activateTab — the exact code path an
  // Open-row click takes — so the mode switches along with the tab. ⌘1–⌘9
  // no-op while focus is in an editable field; ctrl+Tab is safe everywhere
  // (plain Tab is never intercepted, so focus traversal is untouched).
  useEffect(() => {
    const inEditable = () => {
      const el = document.activeElement as HTMLElement | null;
      return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && !e.metaKey && !e.altKey && e.key === "Tab") {
        if (workTabs.length === 0) return;
        e.preventDefault();
        const idx = workTabs.findIndex(t => t.id === activeTabId);
        const next = idx === -1
          // Active tab is a mode-root: enter the cycle at either end.
          ? (e.shiftKey ? workTabs[workTabs.length - 1] : workTabs[0])
          : workTabs[(idx + (e.shiftKey ? -1 : 1) + workTabs.length) % workTabs.length];
        if (next) activateTab(next.id);
        return;
      }
      if (e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey && /^[1-9]$/.test(e.key)) {
        if (inEditable()) return;
        const target = workTabs[Number(e.key) - 1];
        if (!target) return;
        e.preventDefault();
        activateTab(target.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tabs, activeTabId]);

  // CD "Ramp" workspace sidebar nav, mapped to V6 modes. Diligence opens the
  // Analyses hub (portfolio-aware recommendations + searchable catalog) instead
  // of duplicating per-analysis links in the rail.
  const wkNav: Array<{ section: string | null; items: Array<{ mode: ModeId; label: string; icon: IconName }> }> = [
    { section: null, items: [{ mode: "today", label: "Today", icon: "today" }] },
    { section: "Deal flow", items: [
      { mode: "pipeline", label: "Pipeline", icon: "feed" },
      { mode: "search", label: "Search", icon: "search" },
    ] },
    { section: "Diligence", items: [
      { mode: "analysis", label: "Analyses", icon: "chart" },
    ] },
    { section: "Documents", items: [
      // Files is the single document home (by deal → deliverables + data room);
      // the old Library tab listed the SAME deliverables by recency and is gone.
      // Studio stays as the marketing-book creator (not a file store).
      { mode: "files", label: "Files", icon: "library" },
      { mode: "studio", label: "Studio", icon: "studio" },
    ] },
  ];
  const avatarInitials = ((user?.email || "SX").replace(/[^a-zA-Z]/g, "").slice(0, 2) || "SX").toUpperCase();

  // Opens the Stripe Customer Portal — desktop parity with mobile's
  // handleManageBilling (V6Mobile). /api/stripe/portal is behind
  // requireAuth, so authHeaders() is required; the item is hidden for
  // the dev-bypass preview (no real token → would 401).
  const handleManageBilling = async () => {
    if (billingBusy) return;
    setBillingBusy(true);
    setBillingError(null);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
      });
      if (res.ok) {
        const { url } = await res.json();
        if (url) { window.location.assign(url); return; }
      }
      setBillingError("Couldn’t open the billing portal. Try again.");
    } catch {
      setBillingError("Couldn’t open the billing portal. Try again.");
    } finally {
      setBillingBusy(false);
    }
  };

  // ─── CD desktop shell (MIG-2) ──────────────────────────────────────────
  // The mockup chrome: top section nav, deal-list left rail, a floating
  // canvas on the desk, a persistent Yulia rail. Wired to the SAME V6 state
  // (tabs/modes/chat) — no parallel app. Escape hatch: localStorage
  // smbx_shell="legacy" falls back to the original V6 sidebar shell.
  const cdShell = (() => { try { return localStorage.getItem("smbx_shell") !== "legacy"; } catch { return true; } })();
  const workspace = useV6WorkspaceData(user);
  const railDeals: CDRailDeal[] = useMemo(() => workspace.deals
    .filter(d => (d.status || "").toLowerCase() === "active")
    .map(d => ({ id: d.id, code: d.business_name || `Deal #${d.id}`, evLabel: cdFmtCents(d.asking_price), color: cdDealColor(d.id) })),
    [workspace.deals]);

  const MODE_SECTION: Record<string, CDSectionKey> = { today: "today", notifications: "today", pipeline: "portfolio", intel: "portfolio", search: "portfolio", analysis: "analysis", files: "analysis", studio: "studio" };
  const SECTION_PRIMARY: Record<CDSectionKey, ModeId> = { today: "today", portfolio: "pipeline", analysis: "analysis", studio: "studio" };
  const activeSection: CDSectionKey = MODE_SECTION[activeMode] ?? "today";
  const onSection = (s: CDSectionKey) => { if (activeSection !== s) pickMode(SECTION_PRIMARY[s]); };

  const moduleNav: CDRailModuleNav = activeSection === "portfolio"
    ? { label: "Portfolio", items: [
        { icon: "portfolio", label: "Pipeline", active: activeMode === "pipeline", onClick: () => pickMode("pipeline") },
        { icon: "analysis", label: "Market intel", active: activeMode === "intel", onClick: () => pickMode("intel") },
        { icon: "search", label: "Market search", active: activeMode === "search", onClick: () => pickMode("search") },
      ] }
    : activeSection === "analysis"
    ? { label: "Analysis", items: [
        { icon: "scenario", label: "Analyses", active: activeMode === "analysis", onClick: () => pickMode("analysis") },
        { icon: "docs", label: "Files", active: activeMode === "files", badge: launcherWork("files").length, onClick: () => pickMode("files") },
      ] }
    : activeSection === "studio"
    ? { label: "Studio", items: [
        { icon: "grid", label: "Studio", active: activeMode === "studio", onClick: () => pickMode("studio") },
      ] }
    : { label: "Today", items: [
        { icon: "today", label: "Today", active: activeMode === "today", onClick: () => pickMode("today") },
        { icon: "bell", label: "Notifications", active: activeMode === "notifications", onClick: () => pickMode("notifications") },
      ] };

  const stripTabs: CDStripTab[] = workTabs.map(t => ({ id: t.id, title: t.title, kind: t.kind, color: t.kind === "deal" ? cdDealColor(t.id) : undefined }));
  const activeWorkTab = tabs.find(t => t.id === activeTabId);
  const activeGroupId = activeWorkTab?.kind === "deal" ? activeWorkTab.id : null;
  const yuliaDealLabel = activeWorkTab?.kind === "deal" ? activeWorkTab.title : undefined;

  const v6Canvas = (
    <Suspense fallback={<V6ShellLoader />}>
      <V6Canvas
        tabs={tabs}
        activeTabId={activeTabId}
        setActiveTabId={setActiveTabId}
        openTab={openTab}
        closeTab={closeTab}
        reorderTabs={reorderTabs}
        onPickMode={pickMode}
        onTalkToYulia={(prompt) => { setChatOpen(true); send(prompt); }}
        user={user}
        onSignOut={onSignOut}
        modelPreference={modelPreference}
        wkTheme={wkTheme}
        onSetWkTheme={changeWkTheme}
        activeConversationId={chat.activeConversationId}
        chatBusy={chat.sending}
        onResumeConversation={chat.selectConversation
          ? (id) => { chat.selectConversation?.(id); setChatOpen(true); }
          : undefined}
        onConversationDeleted={(id) => { if (id === chat.activeConversationId) chat.newConversation?.(); }}
      />
    </Suspense>
  );

  const v6ChatPanel = (
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
      toolTrace={chat.toolTrace}
      error={chat.error}
      modelPreference={modelPreference}
      setModelPreference={setModelPreference}
      showLearnLinks={!user}
      showEmptySuggestions
      onFileUpload={chat.uploadFile}
      onConfirmStagedAction={chat.confirmStagedAction}
      onCancelStagedAction={chat.cancelStagedAction}
    />
  );

  if (cdShell) {
    return (
      <div
        className="v6-root wk cd-root"
        data-wk-theme={wkTheme === "paper" ? undefined : wkTheme}
        data-wk-mode={activeMode}
        style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", background: "var(--cd-desk)" }}
      >
        <CDTopBar
          activeSection={activeSection}
          onSection={onSection}
          onToggleNav={() => setNavOpen(o => !o)}
          onSearch={() => pickMode("search")}
          notifBell={user ? <V6NotificationBell onNavigate={navigateToActionUrl} /> : undefined}
          yuliaOpen={chatOpen}
          onToggleYulia={() => setChatOpen(o => !o)}
          avatarInitials={avatarInitials}
          onAvatar={() => setAcctOpen(o => !o)}
        />
        {acctOpen && (
          <>
            <div className="wkacct-backdrop" onClick={() => setAcctOpen(false)} />
            <div className="wkacct" role="menu" style={{ position: "absolute", top: 54, right: 16, zIndex: 60 }}>
              <div className="wkacct-id">
                <div className="wkacct-name">{user?.email || "Signed in"}</div>
                <div className="wkacct-sub">smbX.ai workspace</div>
              </div>
              {user && <button className="wkacct-item" role="menuitem" onClick={() => { setAcctOpen(false); openTab({ kind: "provider-profile", title: "Provider profile" }); }}>Provider profile</button>}
              {user && !DEV_AUTH_BYPASS && (
                <button className="wkacct-item" role="menuitem" disabled={billingBusy} style={billingBusy ? { opacity: 0.6, cursor: "default" } : undefined} onClick={() => { void handleManageBilling(); }}>
                  {billingBusy ? "Opening billing portal…" : "Manage subscription"}
                </button>
              )}
              {billingError && <div style={{ padding: "2px 11px 8px", fontSize: ".76rem", lineHeight: 1.35, color: "#C0562F" }} role="alert">{billingError}</div>}
              <button className="wkacct-item" role="menuitem" onClick={() => { setAcctOpen(false); window.location.assign("/?marketing"); }}>Preview marketing site</button>
              <button className="wkacct-item danger" role="menuitem" onClick={() => {
                setAcctOpen(false);
                try { sessionStorage.removeItem("smbx_app_entered"); sessionStorage.removeItem("smbx_preview_marketing"); } catch { /* ignore */ }
                void onSignOut();
                window.location.assign("/");
              }}>Sign out</button>
            </div>
          </>
        )}
        <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
          <CDLeftRail
            open={navOpen}
            deals={railDeals}
            activeGroupId={activeGroupId}
            onOpenDeal={(d) => openTab({ kind: "deal", id: String(d.id), title: d.code })}
            onNewDeal={() => { setChatOpen(true); send("I want to start a new deal."); }}
            moduleNav={moduleNav}
            userName={user?.email?.split("@")[0] || "Workspace"}
            userSub="smbX.ai workspace"
            onSettings={() => openTab({ kind: "settings", title: "Settings" })}
          />
          <section style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", minHeight: 0 }}>
            {stripTabs.length > 0 && (
              <CDCanvasTabStrip tabs={stripTabs} activeId={activeTabId} onPick={activateTab} onClose={closeTab} onNew={() => pickMode("today")} />
            )}
            <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
              <div style={{ flex: 1, minWidth: 0, padding: stripTabs.length > 0 ? "0 0 8px 8px" : "4px 0 8px 8px" }}>
                <div style={{ height: "100%", position: "relative", background: "var(--cd-canvas)", borderRadius: "var(--cd-r-xl)", border: "1px solid var(--cd-line)", boxShadow: "var(--cd-shadow-lg)", overflow: "hidden" }}>
                  {/* CD token bridge: remaps the warm V6 app tokens to the CD
                      cool/indigo palette so every not-yet-rebuilt surface renders
                      in the CD language. Bespoke CD pages (Today) re-scope themselves. */}
                  <div className="cd-bridge" style={{ height: "100%" }}>{v6Canvas}</div>
                </div>
              </div>
              <CDYuliaRail open={chatOpen} onToggle={setChatOpen} dealLabel={yuliaDealLabel} topGap={stripTabs.length > 0 ? 0 : 4}>
                <div className="cd-bridge" style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>{v6ChatPanel}</div>
              </CDYuliaRail>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div
      className="v6-root wk"
      data-wk-theme={wkTheme === "paper" ? undefined : wkTheme}
      // Living Chrome: the active mode tints the room (ambient wash, KPI
      // band, nav pill) via the [data-wk-mode] token blocks in workspace.css.
      data-wk-mode={activeMode}
    >
      <div className="wk-app">
        {/* SIDEBAR — CD sectioned IA, wired to V6 modes. Holds search (top) +
            the toolbar (foot): New, notifications, account. */}
        <aside className="wknav">
          <div className="wkbrand"><span className="brand-mark" />smb<b>X</b></div>
          {/* Search launcher — moved out of the (now removed) topbar. */}
          <button className="wknav-search wk-tap" onClick={() => pickMode("search")} title="Search deals, artifacts, methodology">
            <V6Icon name="search" size={16} />
            <span className="wknav-search-label">Search</span>
            <span className="kbd">⌘K</span>
          </button>
          <nav className="wknavscroll" aria-label="Workspace">
            {wkNav.map((grp, gi) => (
              <div key={gi}>
                {grp.section && <div className="navsec">{grp.section}</div>}
                {grp.items.map((item, ii) => {
                  const count = launcherWork(item.mode).length;
                  const on = activeMode === item.mode;
                  return (
                    <button
                      key={`${gi}-${ii}`}
                      className={`navitem wk-tap ${on ? "on" : ""}`}
                      onClick={() => pickMode(item.mode)}
                      aria-current={on ? "page" : undefined}
                    >
                      <V6Icon name={item.icon} size={17} />
                      <span>{item.label}</span>
                      {count > 0 && <span className="badge">{count}</span>}
                    </button>
                  );
                })}
              </div>
            ))}
            {/* OPEN — work items (deals/docs/analyses/models/files) live here now
                instead of a vertical strip on the canvas, so the canvas is pure
                content. Mode-roots are reached via the groups above. */}
            {workTabs.length > 0 && (
              <div role="tablist" aria-label="Open tabs">
                <div className="navsec">Open</div>
                {workTabs.map(t => {
                  const on = t.id === activeTabId;
                  return (
                    <div
                      key={t.id}
                      className={`navtab wk-tap ${on ? "on" : ""}`}
                      role="presentation"
                      // Middle-click closes the row (browser-tab muscle memory).
                      // preventDefault on BOTH events: Chrome starts autoscroll
                      // on middle mousedown, pastes on auxclick (Linux).
                      onMouseDown={e => { if (e.button === 1) e.preventDefault(); }}
                      onAuxClick={e => {
                        if (e.button !== 1) return;
                        e.preventDefault();
                        closeTab(t.id);
                      }}
                    >
                      <button
                        className="navtab-t"
                        onClick={() => activateTab(t.id)}
                        title={t.title}
                        role="tab"
                        aria-selected={on}
                        aria-current={on ? "page" : undefined}
                      >
                        {/* Open-tab glyphs learn their kind (family tones from
                            verdictMaterial): deals=info-blue, docs=structure
                            gold, analyses/models=valuation sage. Labels stay
                            ink; only the glyph carries the family. */}
                        <span style={{ display: "inline-flex", color: TAB_KIND_INK[t.kind] }}>
                          <V6Icon name={navTabIcon(t)} size={16} />
                        </span>
                        <span>{t.title}</span>
                      </button>
                      <button
                        className="navtab-x"
                        onClick={e => { e.stopPropagation(); closeTab(t.id); }}
                        aria-label={`Close ${t.title}`}
                      >
                        <V6Icon name="close" size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </nav>
          {/* FOOT TOOLBAR — relocated from the topbar: New, notifications, account.
              Popovers open UPWARD/RIGHTWARD from here (see .wknav-foot CSS). */}
          <div className="wknav-foot">
            <button className="wkicon wk-tap" title="New" onClick={() => pickMode("today")}><V6Icon name="plus" size={18} /></button>
            {user && <V6NotificationBell onNavigate={navigateToActionUrl} />}
            {/* Workspace theme — one click from the toolbar (also in
                Settings → Appearance). Popover clones the account menu. */}
            <div className="wkacct-wrap" style={{ marginLeft: "auto" }}>
              <button
                className="wkicon wk-tap"
                title="Workspace theme"
                aria-haspopup="menu"
                aria-expanded={themeOpen}
                onClick={() => setThemeOpen(o => !o)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="9" cy="9" r="4.4" stroke="currentColor" strokeWidth="1.7" />
                  <circle cx="15.5" cy="13.8" r="4.4" stroke="currentColor" strokeWidth="1.7" />
                </svg>
              </button>
              {themeOpen && (
                <>
                  <div className="wkacct-backdrop" onClick={() => setThemeOpen(false)} />
                  <div className="wkacct" role="menu" style={{ minWidth: 216 }}>
                    <div className="wkacct-id">
                      <div className="wkacct-name">Workspace theme</div>
                    </div>
                    {WK_THEMES.map(t => (
                      <button
                        key={t.id}
                        className="wkacct-item"
                        role="menuitemradio"
                        aria-checked={wkTheme === t.id}
                        onClick={() => { changeWkTheme(t.id); setThemeOpen(false); }}
                        style={{ display: "flex", alignItems: "center", gap: 9 }}
                      >
                        <span aria-hidden style={{
                          width: 22, height: 14, borderRadius: 4, flexShrink: 0,
                          background: `linear-gradient(to right, ${t.swatch.nav} 0 38%, ${t.swatch.bg} 38% 100%)`,
                          border: `1px solid ${t.swatch.line}`,
                        }} />
                        <span style={{ flex: 1 }}>{t.label}</span>
                        {wkTheme === t.id && <span aria-hidden style={{ color: "var(--st-good-fg)", fontWeight: 700 }}>✓</span>}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="wkacct-wrap" style={{ marginLeft: 6 }}>
              <button
                className="wkav wk-tap"
                title={user?.email || "Account"}
                aria-haspopup="menu"
                aria-expanded={acctOpen}
                onClick={() => { setAcctOpen(o => !o); setBillingError(null); }}
              >{avatarInitials}</button>
              {acctOpen && (
                <>
                  <div className="wkacct-backdrop" onClick={() => setAcctOpen(false)} />
                  <div className="wkacct" role="menu">
                    <div className="wkacct-id">
                      <div className="wkacct-name">{user?.email || "Signed in"}</div>
                      <div className="wkacct-sub">smbX.ai workspace</div>
                    </div>
                    {user && <button className="wkacct-item" role="menuitem" onClick={() => { setAcctOpen(false); openTab({ kind: "provider-profile", title: "Provider profile" }); }}>Provider profile</button>}
                    {/* Stripe Customer Portal — popover stays open on failure so
                        the inline error below is visible; success navigates away. */}
                    {user && !DEV_AUTH_BYPASS && (
                      <button
                        className="wkacct-item"
                        role="menuitem"
                        disabled={billingBusy}
                        style={billingBusy ? { opacity: 0.6, cursor: "default" } : undefined}
                        onClick={() => { void handleManageBilling(); }}
                      >
                        {billingBusy ? "Opening billing portal…" : "Manage subscription"}
                      </button>
                    )}
                    {billingError && (
                      <div style={{ padding: "2px 11px 8px", fontSize: ".76rem", lineHeight: 1.35, color: "#C0562F" }} role="alert">
                        {billingError}
                      </div>
                    )}
                    <button className="wkacct-item" role="menuitem" onClick={() => { setAcctOpen(false); window.location.assign("/?marketing"); }}>Preview marketing site</button>
                    <button className="wkacct-item danger" role="menuitem" onClick={() => {
                      setAcctOpen(false);
                      // Reset the marketing→app threshold ourselves so the reload lands on
                      // the logged-out site, then sign the session out and hard-navigate.
                      try {
                        sessionStorage.removeItem("smbx_app_entered");
                        sessionStorage.removeItem("smbx_preview_marketing");
                      } catch { /* ignore */ }
                      void onSignOut();
                      window.location.assign("/");
                    }}>Sign out</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </aside>

        {/* MAIN — just the tabbed canvas now (topbar removed; canvas sits at top). */}
        <section className="wkmain">
          <div className="wkcanvas">
            <Suspense fallback={<V6ShellLoader />}>
              <V6Canvas
                tabs={tabs}
                activeTabId={activeTabId}
                setActiveTabId={setActiveTabId}
                openTab={openTab}
                closeTab={closeTab}
                reorderTabs={reorderTabs}
                onPickMode={pickMode}
                onTalkToYulia={(prompt) => { setChatOpen(true); send(prompt); }}
                user={user}
                onSignOut={onSignOut}
                modelPreference={modelPreference}
                wkTheme={wkTheme}
                onSetWkTheme={changeWkTheme}
                activeConversationId={chat.activeConversationId}
                chatBusy={chat.sending}
                onResumeConversation={chat.selectConversation
                  ? (id) => { chat.selectConversation?.(id); setChatOpen(true); }
                  : undefined}
                onConversationDeleted={(id) => {
                  if (id === chat.activeConversationId) chat.newConversation?.();
                }}
              />
            </Suspense>
          </div>
        </section>
      </div>

      {/* FAB CHAT — V6Chat lifted into a floating bubble */}
      {!chatOpen && (
        <button className="wk-fab wk-tap" aria-label="Ask Yulia" onClick={() => setChatOpen(true)}>
          <YuliaGlyphSvg size={24} /><span className="bdot" />
        </button>
      )}
      <div className={`wk-chatwin ${chatOpen ? "open" : ""}`} role="dialog" aria-label="Yulia">
        <div className="wk-chatwin-hd">
          <span className="av"><YuliaGlyphSvg size={16} /></span>
          <span className="nm">Yulia</span>
          <button className="cx" aria-label="Close" onClick={() => setChatOpen(false)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </div>
        <div className="wk-chatwin-body">
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
            toolTrace={chat.toolTrace}
            error={chat.error}
            modelPreference={modelPreference}
            setModelPreference={setModelPreference}
            showLearnLinks={!user}
            showEmptySuggestions
            onFileUpload={chat.uploadFile}
            onConfirmStagedAction={chat.confirmStagedAction}
            onCancelStagedAction={chat.cancelStagedAction}
          />
        </div>
      </div>
    </div>
  );
}

/* Yulia glyph (half-filled circle) used in the workspace sidebar + FAB. */
function YuliaGlyphSvg({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 3a9 9 0 010 18z" fill="currentColor" />
    </svg>
  );
}

function V6ShellLoader() {
  return (
    <div style={A.shellLoader}>
      <div style={A.shellLoaderDot} />
      <span>Loading workspace...</span>
    </div>
  );
}

const CANVAS_MODEL_TYPES = new Set<ModelType>([
  "valuation",
  "lbo",
  "sba_financing",
  "dcf",
  "sensitivity",
  "comparison",
  "cap_table",
  "earnout",
  "tax_impact",
  "working_capital",
  "covenant",
  "sde_analysis",
]);

function normalizeCanvasModelType(value: unknown): ModelType | null {
  return typeof value === "string" && CANVAS_MODEL_TYPES.has(value as ModelType)
    ? value as ModelType
    : null;
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
  if (tab.startsWith("deal-team-")) {
    const rawDealId = tab.replace(/^deal-team-/, "");
    const numericDealId = Number(rawDealId);
    const dealTitle = title ? title.replace(/\s*·\s*Team$/, "") : titleForDealId(rawDealId);
    return {
      id: tab,
      kind: "deal-team",
      title: title || `${dealTitle} · Team`,
      dealId: Number.isFinite(numericDealId) && numericDealId > 0 ? numericDealId : rawDealId,
      dealTitle,
    };
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
  if (tab.startsWith("model-")) {
    return {
      id: tab,
      kind: "model",
      title: title || titleForAnalysisId(tab),
      modelTabId: tab,
      analysisRunId: run,
      status: "versioned model",
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
  if (tab.startsWith("definitive-packet-")) {
    const packetRowId = Number(tab.replace(/^definitive-packet-/, ""));
    return readArtifactTab(tab) ?? {
      id: tab,
      kind: "analysis",
      title: title || "DEFINITIVE packet",
      tool: "artifact",
      markdown: "",
      artifactData: {
        type: "definitive_packet",
        packetRowId: Number.isFinite(packetRowId) && packetRowId > 0 ? packetRowId : undefined,
        source: "hash",
      },
      status: "Packet",
    };
  }
  if (tab === "marketing-studio") {
    return {
      id: "marketing-studio",
      kind: "marketing-studio",
      title: "Studio",
      studioView: "home",
    };
  }
  if (tab.startsWith("studio-book-")) {
    const bookId = Number(tab.replace(/^studio-book-/, ""));
    return {
      id: tab,
      kind: "marketing-studio",
      title: title || "Pitch Book",
      studioView: "canvas",
      studioFormat: "buyer-pitch-book",
      studioBookId: Number.isFinite(bookId) && bookId > 0 ? bookId : null,
      studioDraftId: tab,
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
      format: workingDraft.format ?? tab.studioFormat ?? "buyer-pitch-book",
      studioBookId: tab.studioBookId ?? workingDraft.studioBookId ?? null,
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

// Small per-kind glyph for the nav "Open" rows: deals get the briefcase,
// analyses/models the chart, everything else (docs, files, studio, settings…)
// a generic document icon.
function navTabIcon(tab: Tab): IconName {
  if (tab.kind === "deal" || tab.kind === "deal-team") return "deal";
  if (tab.kind === "analysis" || tab.kind === "model") return "chart";
  return "doc";
}

function modeForTab(tab: Tab): ModeId | null {
  if (tab.kind === "mode-root") return tab.modeId ?? null;
  if (tab.kind === "deal" || tab.kind === "deal-team" || tab.kind === "analysis" || tab.kind === "model") return "pipeline";
  if (tab.kind === "doc") return inferredLauncherDealName(tab) ? "pipeline" : "files";
  if (tab.kind === "marketing-studio") return "studio";
  if (tab.kind === "files-list") return "files";
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
  if (tab.kind === "marketing-studio") return mode === "studio";
  if (tab.kind === "files-list") return mode === "files";
  if (tab.kind === "deal") return mode === "pipeline";
  const dealParent = owningLauncherDealForTab(tab, allTabs);
  if (dealParent || inferredLauncherDealName(tab)) return mode === "pipeline";
  if (tab.kind === "analysis" || tab.kind === "model" || tab.kind === "deal-team") return mode === "pipeline";
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
  if ((tab.kind === "analysis" || tab.kind === "model") && tab.id.startsWith("model-")) return false;
  const dealTitle = normalizeLauncherDealTitle(deal.title);
  return sameLauncherDealName(inferredLauncherDealName(tab), dealTitle) || stripLauncherDealPrefix(tab.title, dealTitle) !== normalizeLauncherTabTitle(tab.title);
}

function inferredLauncherDealName(tab: Tab): string | null {
  if (tab.dealTitle) return tab.dealTitle;
  if ((tab.kind === "analysis" || tab.kind === "model") && tab.id.startsWith("model-")) return null;
  const haystack = normalizeLauncherTabTitle([
    tab.id,
    tab.title,
    tab.kind === "analysis" ? tab.tool : "",
    tab.kind === "model" ? tab.modelType : "",
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

function topTabMeta(tab: Tab, allTabs: Tab[] = [], insideDeal = false): string {
  const dealContext = insideDeal ? null : (owningLauncherDealForTab(tab, allTabs)?.title ?? inferredLauncherDealName(tab));
  const withDeal = (label: string) => dealContext ? `${dealContext} · ${label}` : label;
  if (tab.kind === "deal") return "Deal page";
  if (tab.kind === "deal-team") return withDeal("Deal team");
  if (tab.kind === "analysis") return withDeal(tab.tool ? `Analysis · ${tab.tool}` : "Analysis");
  if (tab.kind === "model") return withDeal(tab.modelType ? `Model · ${tab.modelType}` : "Model");
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

// Shell-loader styles for V6ShellLoader. The rest of the old slate-era `A`
// style object was dead (no other `A.` usages) and has been removed.
const A: Record<string, CSSProperties> = {
  shellLoader: {
    width: "100%",
    minHeight: 220,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    color: "#8B867A",
    fontSize: 12,
    fontWeight: 700,
  },
  shellLoaderDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    background: "#2BFF77",
    boxShadow: "0 0 0 6px rgba(43,255,119,0.14)",
  },
};
