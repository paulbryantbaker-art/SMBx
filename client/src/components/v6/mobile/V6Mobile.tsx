import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useLocation } from "wouter";
import { useAnonymousChat } from "../../../hooks/useAnonymousChat";
import { useAuthChat } from "../../../hooks/useAuthChat";
import type { User } from "../../../hooks/useAuth";
import { useMobileDeals } from "../../../hooks/useMobileDeals";
import { TabBar } from "./TabBar";
import { GlassTopBar, LargeTitle, TitleCollapseProvider } from "./TopBar";
import { TodayScreen } from "./screens/Today";
import { PipelineScreen } from "./screens/Pipeline";
import { BriefScreen } from "./screens/Brief";
import { DetailScreen } from "./screens/Detail";
import { WatchingScreen } from "./screens/Watching";
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

  // Live deal data for authed users; anon falls back to hardcoded
  // sample arrays inside each screen. Empty arrays for authed users
  // with no deals yet are also passed through — screens render their
  // empty state in that case.
  const userDeals = useMobileDeals(user);

  const initial = readMobileHashState();
  const [view, setView] = useState<MobileView>(
    initial.detail
      ? { kind: "detail", dealId: initial.detail, dealTitle: initial.dealTitle ?? undefined }
      : initial.watching
        ? { kind: "watching" }
        : { kind: "tab", tab: initial.tab }
  );
  const [chatOpen, setChatOpen] = useState(initial.chat);
  const [learn, setLearn] = useState<{ open: boolean; section: "how" | "pricing"; anchor?: string }>({
    open: false, section: "how",
  });

  // PWA standalone vs Safari tab determines scroll architecture:
  //   - PWA standalone: .mobile-root is the scroll container (position:absolute
  //     inset:0 overflow:auto). Required for visualViewport keyboard tracking
  //     and the three-layer chat sheet pattern.
  //   - Safari tab: .mobile-root flows naturally, body scrolls. Required for
  //     iOS Safari's native chrome auto-hide / page-bleed behavior (Safari
  //     only triggers it on document scroll, not custom scroll containers).
  // Detected once at mount — display-mode doesn't change after launch.
  const isStandalone = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(display-mode: standalone)").matches;
  }, []);

  // Track --vvh from visualViewport — PWA STANDALONE ONLY.
  //
  // CRITICAL: do NOT touch document.body or document.documentElement
  // styles in Safari tab mode. iOS 26 Safari's chrome stays translucent
  // (live-blurs page content through status bar) until ANY post-initial-
  // paint inline-style mutation on body locks it into opaque-tinted
  // mode. Not just backgroundColor — setProperty('--vvh', ...) counts.
  //
  // visualViewport fires `resize` during the user's first scroll because
  // iOS chrome auto-hides (viewport height changes). If we run setVVH on
  // that event in Safari tab mode, body mutates → chrome locks → bleed
  // dies after the first scroll gesture. Symptom: "worked on load and
  // first scroll, then stopped." (exactly what we observed)
  //
  // Safe gating: the body-lock CSS at index.css:643 is itself gated by
  // (display-mode: standalone), so --vvh is a no-op in Safari tab —
  // skipping the JS write loses nothing. PWA standalone still needs
  // --vvh for keyboard tracking + chat sheet sizing.
  useEffect(() => {
    if (!isStandalone) return; // Safari tab: body must stay pristine for chrome bleed.

    document.documentElement.classList.add("mobile-pwa-active");

    const vv = window.visualViewport;
    if (!vv) {
      return () => {
        document.documentElement.classList.remove("mobile-pwa-active");
      };
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
  }, [isStandalone]);

  // URL hash sync
  useEffect(() => {
    writeMobileHashState(view, chatOpen);
  }, [view, chatOpen]);

  // Scroll-to-top on every navigation. Tab taps and deal opens both flow
  // through `view`, so a single effect on that key handles both. Scroll
  // target depends on launch mode (mirrors the LargeTitle scroll-source
  // detection): PWA standalone scrolls .mobile-root (body is locked to
  // viewport so it can't scroll); Safari tab scrolls window (.mobile-root
  // flows naturally so the document scrolls). Pure scroll calls don't
  // mutate body styles, so the iOS 26 chrome-lock hazard at line 96
  // doesn't apply here.
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isStandalone) {
      rootRef.current?.scrollTo({ top: 0 });
    } else {
      window.scrollTo({ top: 0 });
    }
  }, [view, isStandalone]);

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

  // Watching is a sub-page of Pipeline, so reflect that in the tab bar.
  // Detail comes from anywhere, so default to Today there.
  const activeTab: MobileTab =
    view.kind === "tab" ? (view.tab ?? "today") :
    view.kind === "watching" ? "pipeline" :
    "today";
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
  const onOpenWatching = () => setView({ kind: "watching" });
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

  // Detail and Watching are full-page surfaces with their own white
  // backgrounds. Tabs share the home gradient.
  const isWhitePage = view.kind === "detail" || view.kind === "watching";
  const rootStyle: CSSProperties = {
    ...(isStandalone ? S.rootPwa : S.rootSafari),
    background: isWhitePage ? "#FFFFFF" : rootGradient(isAnon),
  };

  return (
    <TitleCollapseProvider>
    <div ref={rootRef} className="mobile-root" style={rootStyle}>
      {view.kind === "tab" && activeTab === "today" && (
        <TodayScreen
          isAnon={isAnon}
          initials={initials}
          onOpenDeal={onOpenDeal}
          onChat={onChat}
          onLearn={onLearn}
          onAvatarClick={onAvatarClick}
          userPipeline={userDeals.hasData ? userDeals.today : null}
          userPicks={userDeals.hasData ? userDeals.picks : null}
        />
      )}
      {view.kind === "tab" && activeTab === "pipeline" && (
        <PipelineScreen
          isAnon={isAnon}
          initials={initials}
          onOpenDeal={onOpenDeal}
          onOpenWatching={onOpenWatching}
          onAvatarClick={onAvatarClick}
          onSearch={onChat}
          userWatching={userDeals.hasData ? userDeals.watching : null}
          userFeatured={userDeals.hasData ? userDeals.featured : null}
        />
      )}
      {view.kind === "tab" && activeTab === "brief" && (
        <BriefScreen
          isAnon={isAnon}
          initials={initials}
          onOpenDeal={onOpenDeal}
          onAvatarClick={onAvatarClick}
          onSearch={onChat}
          userPicks={userDeals.hasData ? userDeals.picks : null}
        />
      )}
      {view.kind === "detail" && (
        <DetailScreen
          dealId={view.dealId ?? "unknown"}
          dealTitle={view.dealTitle ?? view.dealId ?? "Deal"}
          onBack={() => setView({ kind: "tab", tab: "today" })}
          onChat={onChat}
        />
      )}
      {view.kind === "watching" && (
        <WatchingScreen
          onBack={() => setView({ kind: "tab", tab: "pipeline" })}
          onOpenDeal={onOpenDeal}
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

function readMobileHashState(): { tab: MobileTab; detail: string | null; dealTitle: string | null; chat: boolean; watching: boolean } {
  try {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return { tab: "today", detail: null, dealTitle: null, chat: false, watching: false };
    const params = new URLSearchParams(hash);
    const rawTab = params.get("tab") as MobileTab | null;
    const tab: MobileTab = rawTab && VALID_TABS.includes(rawTab) ? rawTab : "today";
    const detail = params.get("deal");
    const dealTitle = params.get("t");
    const chat = params.get("chat") === "open";
    const watching = params.get("view") === "watching";
    return { tab, detail, dealTitle, chat, watching };
  } catch {
    return { tab: "today", detail: null, dealTitle: null, chat: false, watching: false };
  }
}

function writeMobileHashState(view: MobileView, chatOpen: boolean) {
  try {
    const params = new URLSearchParams();
    if (view.kind === "detail" && view.dealId) {
      params.set("deal", view.dealId);
      // Persist title in the URL so it survives the home ↔ detail full
      // reload (state is wiped by reload; URL is the only durable carrier).
      if (view.dealTitle) params.set("t", view.dealTitle);
    } else if (view.kind === "watching") {
      params.set("view", "watching");
    } else if (view.tab) {
      params.set("tab", view.tab);
    }
    // Chat-open is URL-driven so the post-reload mount can rehydrate it
    // (and so index.html's body-bg script can paint white when present).
    if (chatOpen) params.set("chat", "open");
    const next = params.toString() ? `#${params.toString()}` : "";
    if (window.location.hash !== next) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search + next);
    }
  } catch { /* noop */ }
}

// .mobile-root gradient: white throughout the page, fading to periwinkle
// at the bottom for the Safari URL bar bleed.
//
// The page-level gradient used to carry a gold/sage band at the top to
// blend with the gold chrome, but body bg is white everywhere now — the
// band had nothing to connect to and read as a stranded strip painting
// the margins around the welcome card. The sunrise warmth lives in the
// welcome card's own watercolor texture, which lets the card stand out
// cleanly against a white page.
//
// isAnon kept in the signature for symmetry but no longer drives color.
function rootGradient(_isAnon: boolean) {
  return (
    "linear-gradient(to bottom," +
    " #FFFFFF 0," +
    " #FFFFFF 72%," +
    " #A8B3E5 100%)"
  );
}

const S: Record<string, CSSProperties> = {
  // PWA standalone: existing architecture. Body is locked to --vvh by the
  // .mobile-pwa-active CSS rules; .mobile-root is the scroll container.
  // visualViewport keyboard tracking + three-layer chat sheet depend on
  // this exact shape. Background is set inline per render (auth-aware).
  rootPwa: {
    position: "absolute",
    inset: 0,
    overflowY: "auto",
    overflowX: "hidden",
    WebkitOverflowScrolling: "touch",
    overscrollBehaviorY: "contain",
    touchAction: "pan-y",
    paddingBottom: "env(safe-area-inset-bottom, 0px)",
  },
  // Safari tab: natural flow, body scrolls. min-height: 100lvh covers the
  // FULL webview (largest viewport, including the area behind iOS chrome)
  // so body bg never leaks past .mobile-root into the URL-bar zone. dvh
  // (visible viewport, shrinks when chrome shows) was leaving a gold
  // strip below the page. lvh always = full webview height. Content above
  // is unaffected — min-height just adds white padding below the last
  // card. paddingBottom clears the floating tab pill (~80px + 18px gap +
  // safe area) so the last card isn't hidden behind it.
  rootSafari: {
    position: "relative",
    minHeight: "100lvh",
    paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 110px)",
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
