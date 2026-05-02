import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useLocation } from "wouter";
import { useAnonymousChat } from "../../../hooks/useAnonymousChat";
import { useAuthChat } from "../../../hooks/useAuthChat";
import type { User } from "../../../hooks/useAuth";
import { TabBar } from "./TabBar";
import { GlassTopBar, LargeTitle, TitleCollapseProvider } from "./TopBar";
import { TodayScreen } from "./screens/Today";
import { PipelineScreen } from "./screens/Pipeline";
import { BriefScreen } from "./screens/Brief";
import { DetailScreen } from "./screens/Detail";
import { ChatSheet } from "./ChatSheet";
import { LearnSheet } from "./LearnSheet";
import type { MobileChatBridge, MobileTab, MobileView } from "./types";

const VALID_TABS: MobileTab[] = ["today", "pipeline", "brief"];

interface V6MobileProps {
  user: User | null;
  onSignOut: () => void;
}

export default function V6Mobile({ user, onSignOut }: V6MobileProps) {
  return user
    ? <V6MobileAuthed user={user} onSignOut={onSignOut} />
    : <V6MobileAnon />;
}

function V6MobileAnon() {
  const chat = useAnonymousChat();
  const bridge = useMemo<MobileChatBridge>(() => ({
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
  return <V6MobileShell user={null} chat={bridge} onSignOut={() => {}} />;
}

function V6MobileAuthed({ user, onSignOut }: { user: User; onSignOut: () => void }) {
  const chat = useAuthChat(user);
  const bridge = useMemo<MobileChatBridge>(() => ({
    thread: chat.messages.map(m => ({
      who: m.role === "user" ? "u" : "y",
      text: m.content,
    })),
    sending: chat.sending,
    streamingText: chat.streamingText,
    activeTool: chat.activeTool,
    error: null,
    send: chat.sendMessage,
  }), [chat.messages, chat.sending, chat.streamingText, chat.activeTool, chat.sendMessage]);
  return <V6MobileShell user={user} chat={bridge} onSignOut={onSignOut} />;
}

interface ShellProps {
  user: User | null;
  chat: MobileChatBridge;
  onSignOut: () => void;
}

function V6MobileShell({ user, chat, onSignOut }: ShellProps) {
  const [, navigate] = useLocation();

  const initial = readMobileHashState();
  const [view, setView] = useState<MobileView>(
    initial.detail
      ? { kind: "detail", dealId: initial.detail }
      : { kind: "tab", tab: initial.tab }
  );
  const [chatOpen, setChatOpen] = useState(false);
  const [learn, setLearn] = useState<{ open: boolean; section: "how" | "pricing"; anchor?: string }>({
    open: false, section: "how",
  });

  // Track --vvh from visualViewport (per architecture_ios_pwa_pill.md)
  useEffect(() => {
    document.documentElement.classList.add("mobile-pwa-active");
    const vv = window.visualViewport;
    if (!vv) {
      return () => document.documentElement.classList.remove("mobile-pwa-active");
    }
    const setVVH = () => {
      const vvh = `${vv.height}px`;
      const vvs = vv.height < 600 ? "0px" : "env(safe-area-inset-bottom, 0px)";
      document.body.style.setProperty("--vvh", vvh);
      document.body.style.setProperty("--vvs", vvs);
    };
    vv.addEventListener("resize", setVVH);
    setVVH();
    return () => {
      vv.removeEventListener("resize", setVVH);
      document.documentElement.classList.remove("mobile-pwa-active");
      document.body.style.removeProperty("--vvh");
      document.body.style.removeProperty("--vvs");
    };
  }, []);

  // URL hash sync
  useEffect(() => {
    writeMobileHashState(view);
  }, [view]);

  useEffect(() => {
    const onHash = () => {
      const next = readMobileHashState();
      if (next.detail) setView({ kind: "detail", dealId: next.detail });
      else setView({ kind: "tab", tab: next.tab });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // URL → LearnSheet bridge: /how-it-works and /pricing open the sheet on
  // mount (footer + bookmarked links). URL is rewritten to "/" so subsequent
  // tab state lives in the hash like the rest of the mobile shell.
  useEffect(() => {
    const path = window.location.pathname;
    if (path === "/how-it-works" || path === "/pricing") {
      const section: "how" | "pricing" = path === "/pricing" ? "pricing" : "how";
      setLearn({ open: true, section });
      window.history.replaceState(null, "", "/" + window.location.hash);
    }
  }, []); // mount-only

  const activeTab: MobileTab = view.kind === "tab" ? (view.tab ?? "today") : "today";
  const onTabChange = (next: MobileTab) => setView({ kind: "tab", tab: next });
  const onChat = () => setChatOpen(true);
  const onChatClose = () => setChatOpen(false);
  const onLearn = (section: "how" | "pricing", anchor?: string) =>
    setLearn({ open: true, section, anchor });
  const onLearnClose = () => setLearn(s => ({ ...s, open: false }));
  const onLearnTalkToYulia = (prompt: string) => {
    chat.send(prompt);
    setChatOpen(true);
  };

  const initials = computeInitials(user);
  const isAnon = !user;

  const onOpenDeal = (id: string, title: string) => {
    setView({ kind: "detail", dealId: id, dealTitle: title });
  };
  const onAvatarClick = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    // Authed: minimal confirm flow until a proper account sheet lands.
    // Avoids accidental sign-out on a mistap.
    if (typeof window !== "undefined" && window.confirm("Sign out of smbx.ai?")) {
      onSignOut();
    }
  };

  return (
    <TitleCollapseProvider>
    <div className="mobile-root" style={S.root}>
      {view.kind === "tab" && activeTab === "today" && (
        <TodayScreen
          isAnon={isAnon}
          initials={initials}
          onOpenDeal={onOpenDeal}
          onChat={onChat}
          onLearn={onLearn}
          onAvatarClick={onAvatarClick}
        />
      )}
      {view.kind === "tab" && activeTab === "pipeline" && (
        <PipelineScreen
          isAnon={isAnon}
          initials={initials}
          onOpenDeal={onOpenDeal}
          onAvatarClick={onAvatarClick}
        />
      )}
      {view.kind === "tab" && activeTab === "brief" && (
        <BriefScreen
          isAnon={isAnon}
          initials={initials}
          onOpenDeal={onOpenDeal}
          onAvatarClick={onAvatarClick}
        />
      )}
      {view.kind === "detail" && (
        <DetailScreen
          dealId={view.dealId ?? "unknown"}
          dealTitle={view.dealTitle ?? view.dealId ?? "Deal"}
          onBack={() => setView({ kind: "tab", tab: "today" })}
        />
      )}
      <TabBar active={activeTab} onChange={onTabChange} onChat={onChat} />
      <ChatSheet open={chatOpen} onClose={onChatClose} chat={chat} />
      <LearnSheet
        open={learn.open}
        onClose={onLearnClose}
        section={learn.section}
        anchor={learn.anchor}
        onTalkToYulia={onLearnTalkToYulia}
      />
    </div>
    </TitleCollapseProvider>
  );
}

/* ─── Per-tab screen placeholder (M4/M5) ─────────────────── */

const TAB_TITLES: Record<MobileTab, string> = {
  today: "Today",
  pipeline: "Pipeline",
  brief: "Brief",
};

function TabPlaceholder({ tab, initials }: { tab: MobileTab; initials: string }) {
  return (
    <div style={{ minHeight: "100vh", paddingBottom: 140 }}>
      <GlassTopBar title={TAB_TITLES[tab]} initials={initials} />
      <LargeTitle>{TAB_TITLES[tab]}</LargeTitle>
      <div style={S.placeholderBody}>
        <div className="mb-mono" style={S.placeholderTag}>STUB</div>
        <div style={S.placeholderHint}>
          {tab} screen lands in phase M{tab === "pipeline" ? "4" : "5"}.
        </div>
      </div>
    </div>
  );
}

function computeInitials(user: User | null): string {
  if (!user) return "JM"; // sample-state placeholder per CD
  const src = user.display_name?.trim() || user.email;
  const parts = src.split(/[\s@.]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

/* ─── URL hash state ─────────────────────────────────────── */

function readMobileHashState(): { tab: MobileTab; detail: string | null } {
  try {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return { tab: "today", detail: null };
    const params = new URLSearchParams(hash);
    const rawTab = params.get("tab") as MobileTab | null;
    const tab: MobileTab = rawTab && VALID_TABS.includes(rawTab) ? rawTab : "today";
    const detail = params.get("deal");
    return { tab, detail };
  } catch {
    return { tab: "today", detail: null };
  }
}

function writeMobileHashState(view: MobileView) {
  try {
    const params = new URLSearchParams();
    if (view.kind === "detail" && view.dealId) {
      params.set("deal", view.dealId);
    } else if (view.tab) {
      params.set("tab", view.tab);
    }
    const next = params.toString() ? `#${params.toString()}` : "";
    if (window.location.hash !== next) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search + next);
    }
  } catch { /* noop */ }
}

const S: Record<string, CSSProperties> = {
  root: {
    // html/body are locked (height:100%, overflow:hidden) for the V6 desktop
    // layout, so mobile must be its own scroll container.
    // touch-action: pan-y opts back into vertical pans (PWA mode sets
    // touch-action:none on body for the fullscreen-chat architecture).
    position: "absolute",
    inset: 0,
    overflowY: "auto",
    overflowX: "hidden",
    WebkitOverflowScrolling: "touch",
    overscrollBehaviorY: "contain",
    touchAction: "pan-y",
    background: "var(--mb-bg)",
    paddingBottom: "env(safe-area-inset-bottom, 0px)",
  },
  placeholderBody: {
    padding: "32px 22px",
    display: "flex", flexDirection: "column", gap: 8,
  },
  placeholderTag: {
    fontSize: 9.5, color: "var(--mb-ink-4)",
    letterSpacing: "0.14em", fontWeight: 700,
  },
  placeholderHint: {
    fontSize: 13, color: "var(--mb-ink-3)",
  },
};
