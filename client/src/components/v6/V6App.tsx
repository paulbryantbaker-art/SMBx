import { useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { useLocation } from "wouter";
import { useAuth, type User } from "../../hooks/useAuth";
import { useAnonymousChat } from "../../hooks/useAnonymousChat";
import { useAuthChat } from "../../hooks/useAuthChat";
import { useIsMobile } from "../../hooks/useIsMobile";
import V6Mobile from "./mobile/V6Mobile";
import { V6Sidebar } from "./Sidebar";
import { V6Chat } from "./Chat";
import { V6Canvas } from "./Canvas";
import { SampleBanner, SAMPLE_DISMISS_KEY } from "./SampleBanner";
import { MODES } from "./icons";
import type { Message, ModeId, Tab } from "./types";

const VALID_MODES: ModeId[] = ["search", "docs", "analysis", "intel", "library"];

interface ChatBridge {
  thread: Message[];
  sending: boolean;
  streamingText: string;
  activeTool: string | null;
  error: string | null;
  send: (text: string) => void;
}

export default function V6App() {
  const auth = useAuth();
  const isMobile = useIsMobile();

  if (auth.loading) {
    return (
      <div style={{ display: "grid", placeItems: "center", height: "100vh", color: "var(--m-on-surface-mid)" }}>
        Loading…
      </div>
    );
  }

  if (isMobile) {
    return <V6Mobile user={auth.user} onSignOut={async () => { await auth.logout(); }} />;
  }

  return auth.user
    ? <V6AppAuthed user={auth.user} onSignOut={auth.logout} />
    : <V6AppAnon />;
}

/* ─── Anonymous variant — uses anon chat hook ────────────────── */
function V6AppAnon() {
  const chat = useAnonymousChat();
  const bridge = useMemo<ChatBridge>(() => ({
    thread: chat.messages.map(m => ({
      who: m.role === "user" ? "u" : "y",
      text: m.content,
    })),
    sending: chat.sending,
    streamingText: chat.streamingText,
    activeTool: null,
    error: chat.error,
    send: chat.sendMessage,
  }), [chat.messages, chat.sending, chat.streamingText, chat.error, chat.sendMessage]);
  return <V6AppShell user={null} chat={bridge} onSignOut={() => {}} />;
}

/* ─── Authenticated variant — uses authed chat hook ──────────── */
function V6AppAuthed({ user, onSignOut }: { user: User; onSignOut: () => Promise<void> }) {
  const chat = useAuthChat(user);
  const bridge = useMemo<ChatBridge>(() => ({
    thread: chat.messages.map(m => ({
      who: m.role === "user" ? "u" : "y",
      text: m.content,
    })),
    sending: chat.sending,
    streamingText: chat.streamingText,
    activeTool: chat.activeTool,
    error: null, // useAuthChat surfaces errors via toasts already
    send: chat.sendMessage,
  }), [chat.messages, chat.sending, chat.streamingText, chat.activeTool, chat.sendMessage]);

  return <V6AppShell user={user} chat={bridge} onSignOut={async () => { await onSignOut(); }} />;
}

/* ─── Shared shell ───────────────────────────────────────────── */

interface ShellProps {
  user: User | null;
  chat: ChatBridge;
  onSignOut: () => void;
}

function V6AppShell({ user, chat, onSignOut }: ShellProps) {
  const [, navigate] = useLocation();

  // ─── Tab + mode state, hydrated from URL hash ───
  const initial = readHashState();

  const [activeMode, setActiveMode] = useState<ModeId>(initial.mode);
  const [searchOpen, setSearchOpen] = useState(false);
  const [tabs, setTabs] = useState<Tab[]>(() => {
    const rootMode = initial.mode;
    return [{
      id: `${rootMode}-root`,
      kind: "mode-root",
      modeId: rootMode,
      title: `Sample ${MODES.find(m => m.id === rootMode)?.label ?? rootMode}`,
      pinned: true,
    }];
  });
  const [activeTabId, setActiveTabId] = useState(initial.tab ?? `${initial.mode}-root`);

  // Sync tab + mode to URL hash on every change
  useEffect(() => {
    writeHashState({ mode: activeMode, tab: activeTabId });
  }, [activeMode, activeTabId]);

  // Listen for browser back/forward
  useEffect(() => {
    const onHash = () => {
      const next = readHashState();
      setActiveMode(next.mode);
      if (next.tab) setActiveTabId(next.tab);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const pickMode = (modeId: ModeId) => {
    setActiveMode(modeId);
    setSearchOpen(false);
    const rootId = `${modeId}-root`;
    setTabs(prev => {
      if (prev.find(t => t.id === rootId)) return prev;
      const meta = MODES.find(m => m.id === modeId);
      return [...prev, { id: rootId, kind: "mode-root", modeId, title: `Sample ${meta?.label ?? modeId}`, pinned: true }];
    });
    setActiveTabId(rootId);
  };

  const openTab: (descriptor: Omit<Tab, "id"> & { id?: string }) => void = (descriptor) => {
    const id = descriptor.id ?? `${descriptor.kind}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setTabs(prev => {
      if (prev.find(t => t.id === id)) {
        setActiveTabId(id);
        return prev;
      }
      return [...prev, { ...descriptor, id }];
    });
    setActiveTabId(id);
  };

  const closeTab = (id: string) => {
    setTabs(prev => {
      const next = prev.filter(t => t.id !== id);
      if (id === activeTabId) {
        const idx = prev.findIndex(t => t.id === id);
        const fallback = next[idx - 1] ?? next[idx] ?? next[0];
        if (fallback) setActiveTabId(fallback.id);
      }
      return next;
    });
  };

  // Listen for canvas_action events emitted by useAuthChat tools
  useEffect(() => {
    const onAction = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail) return;
      // Possible canvas actions: open_tab, switch_mode
      if (detail.canvas_action === "open_tab" && detail.tab) openTab(detail.tab);
      if (detail.canvas_action === "switch_mode" && detail.mode && VALID_MODES.includes(detail.mode)) {
        pickMode(detail.mode);
      }
    };
    window.addEventListener("smbx:canvas_action", onAction);
    return () => window.removeEventListener("smbx:canvas_action", onAction);
  }, []);

  // ─── Composer state ───
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const send = (override?: string) => {
    const msg = (override ?? draft).trim();
    if (!msg) return;
    chat.send(msg);
    setDraft("");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

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
  const isAnon = !user;

  // ─── Banner state (anon only) ───
  const [bannerDismissed, setBannerDismissed] = useState(false);
  useEffect(() => {
    try {
      if (localStorage.getItem(SAMPLE_DISMISS_KEY) === "1") setBannerDismissed(true);
    } catch { /* noop */ }
  }, []);
  const dismissBanner = () => {
    setBannerDismissed(true);
    try { localStorage.setItem(SAMPLE_DISMISS_KEY, "1"); } catch { /* noop */ }
  };
  const startWorkspace = () => {
    openTab({ id: "tab-learn", kind: "learn", title: "How it works · Pricing", section: "pricing" });
  };

  // ⌘K opens sidebar search from anywhere
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape" && searchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  return (
    <div className="v6-root" style={A.shell}>
      {isAnon && !bannerDismissed && (
        <SampleBanner onDismiss={dismissBanner} onStartWorkspace={startWorkspace} />
      )}
      <div style={A.row}>
        <V6Sidebar
          activeMode={activeMode}
          onPickMode={pickMode}
          searchOpen={searchOpen}
          setSearchOpen={setSearchOpen}
          onOpenTab={openTab}
          user={user}
          onSignIn={() => navigate("/login")}
          onSignUp={() => navigate("/signup")}
          onSignOut={onSignOut}
        />
        <main style={A.main}>
          <div style={{ width: chatWidth, flexShrink: 0, minWidth: 0, display: "flex", flexDirection: "column" }}>
            <V6Chat
              thread={chat.thread}
              draft={draft}
              setDraft={setDraft}
              send={send}
              inputRef={inputRef}
              modeLabel={modeLabel}
              onOpenTab={openTab}
              isAnon={isAnon}
              sending={chat.sending}
              streamingText={chat.streamingText}
              activeTool={chat.activeTool}
              error={chat.error}
            />
          </div>
          <div onMouseDown={onDragStart} title="Drag to resize chat" role="separator" aria-orientation="vertical" style={A.dragHandle}>
            <div style={A.dragGrip} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <V6Canvas
              tabs={tabs}
              activeTabId={activeTabId}
              setActiveTabId={setActiveTabId}
              openTab={openTab}
              closeTab={closeTab}
              onPickMode={pickMode}
              onTalkToYulia={(prompt) => send(prompt)}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

/* ─── Hash-based URL state ───────────────────────────────── */

function readHashState(): { mode: ModeId; tab: string | null } {
  try {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return { mode: "search", tab: null };
    const params = new URLSearchParams(hash);
    const rawMode = params.get("mode") as ModeId | null;
    const mode: ModeId = rawMode && VALID_MODES.includes(rawMode) ? rawMode : "search";
    const tab = params.get("tab");
    return { mode, tab };
  } catch {
    return { mode: "search", tab: null };
  }
}

function writeHashState({ mode, tab }: { mode: ModeId; tab: string }) {
  try {
    const params = new URLSearchParams();
    params.set("mode", mode);
    params.set("tab", tab);
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
  },
  row: { flex: 1, display: "flex", minHeight: 0 },
  main: { flex: 1, minWidth: 0, display: "flex" },
  dragHandle: {
    width: 6, flexShrink: 0,
    cursor: "col-resize",
    background: "var(--m-outline-var)",
    position: "relative",
  },
  dragGrip: {
    position: "absolute", top: "50%", left: "50%",
    transform: "translate(-50%, -50%)",
    width: 2, height: 28, borderRadius: 2,
    background: "var(--m-on-surface-mid)", opacity: 0.4,
  },
};
