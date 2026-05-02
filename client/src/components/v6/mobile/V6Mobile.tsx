import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useLocation } from "wouter";
import { useAnonymousChat } from "../../../hooks/useAnonymousChat";
import { useAuthChat } from "../../../hooks/useAuthChat";
import type { User } from "../../../hooks/useAuth";
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

function V6MobileShell({ user, chat: _chat, onSignOut: _onSignOut }: ShellProps) {
  const [, _navigate] = useLocation();

  const initial = readMobileHashState();
  const [view, setView] = useState<MobileView>(
    initial.detail
      ? { kind: "detail", dealId: initial.detail }
      : { kind: "tab", tab: initial.tab }
  );

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

  return (
    <div className="mobile-root" style={S.root}>
      <div style={S.placeholder}>
        <div style={S.placeholderHead}>V6 Mobile</div>
        <div style={S.placeholderBody}>
          {view.kind === "tab"
            ? `Tab: ${view.tab}`
            : `Detail: ${view.dealId}`}
        </div>
        <div style={S.placeholderMeta}>
          {user ? `Authed as ${user.email}` : "Anonymous"}
        </div>
        <div style={S.placeholderHint}>Phase M1 — primitives + chrome land next.</div>
      </div>
    </div>
  );
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
    minHeight: "100vh",
    width: "100%",
    background: "var(--mb-bg-2)",
    paddingTop: "env(safe-area-inset-top, 0px)",
    paddingBottom: "env(safe-area-inset-bottom, 0px)",
  },
  placeholder: {
    padding: "60px 22px",
    display: "flex", flexDirection: "column", gap: 8,
  },
  placeholderHead: {
    fontFamily: "var(--mb-font-display)",
    fontSize: 34, fontWeight: 800, letterSpacing: -1,
    color: "var(--mb-ink)",
  },
  placeholderBody: {
    fontFamily: "var(--mb-font-mono)",
    fontSize: 14, color: "var(--mb-ink-2)",
  },
  placeholderMeta: {
    fontSize: 13, color: "var(--mb-ink-3)",
  },
  placeholderHint: {
    fontSize: 12, color: "var(--mb-ink-4)",
    marginTop: 24,
  },
};
