import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useLocation } from "wouter";
import { useAnonymousChat } from "../../../hooks/useAnonymousChat";
import { useAuthChat } from "../../../hooks/useAuthChat";
import { DEV_AUTH_BYPASS } from "../../../hooks/useAuth";
import type { User } from "../../../hooks/useAuth";
import { useMobileDeals } from "../../../hooks/useMobileDeals";
import { TabBar } from "./TabBar";
import { GlassTopBar, LargeTitle, TitleCollapseProvider } from "./TopBar";
import { TodayScreen } from "./screens/Today";
import { PipelineScreen } from "./screens/Pipeline";
import { DetailScreen } from "./screens/Detail";
import { WatchingScreen } from "./screens/Watching";
import { LibraryDetailScreen, LibraryDocumentScreen, LibraryFinderScreen, LibraryScreen, SearchScreen } from "./screens/LibrarySearch";
import { ChatSheet } from "./ChatSheet";
import { LearnSheet } from "./LearnSheet";
import { useAudience } from "../../../hooks/useAudience";
import { buildMobileSurfaceContext } from "../../../lib/yuliaSurfaceContext";
import type { MobileChatBridge, MobileTab, MobileView } from "./types";

const VALID_TABS: MobileTab[] = ["today", "pipeline", "search", "brief"];

interface V6MobileProps {
  user: User | null;
  onSignOut: () => void;
  onDevSignIn?: () => void;
}

export default function V6Mobile({ user, onSignOut, onDevSignIn }: V6MobileProps) {
  if (DEV_AUTH_BYPASS) {
    return <V6MobileAnon user={user} onSignOut={onSignOut} onDevSignIn={onDevSignIn} />;
  }
  return user
    ? <V6MobileAuthed user={user} onSignOut={onSignOut} />
    : <V6MobileAnon />;
}

function V6MobileAnon({
  user = null,
  onSignOut = () => {},
  onDevSignIn,
}: {
  user?: User | null;
  onSignOut?: () => void;
  onDevSignIn?: () => void;
} = {}) {
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
    send: (text, surfaceContext) => chat.sendMessage(text, undefined, surfaceContext),
  }), [chat.messages, chat.sending, chat.streamingText, chat.error, chat.sendMessage]);
  return <V6MobileShell user={user} chat={bridge} onSignOut={onSignOut} onDevSignIn={onDevSignIn} />;
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
  onDevSignIn?: () => void;
}

function V6MobileShell({ user, chat, onSignOut, onDevSignIn }: ShellProps) {
  const [, navigate] = useLocation();

  // Live deal data for authed users; anon falls back to hardcoded
  // sample arrays inside each screen. Empty arrays for authed users
  // with no deals yet are also passed through — screens render their
  // empty state in that case.
  const userDeals = useMobileDeals(user);

  const initial = readMobileHashState();
  const [view, setView] = useState<MobileView>(
    initial.view
      ? {
          kind: initial.view,
          tab: initial.tab,
          dealTitle: initial.dealTitle ?? undefined,
          dealMeta: initial.dealMeta ?? undefined,
          portfolioName: initial.portfolioName ?? undefined,
          dealStage: initial.dealStage ?? undefined,
          docTitle: initial.docTitle ?? undefined,
          docMeta: initial.docMeta ?? undefined,
          docKind: initial.docKind ?? undefined,
          filesFilter: initial.filesFilter ?? undefined,
        }
      : initial.detail
      ? { kind: "detail", dealId: initial.detail, dealTitle: initial.dealTitle ?? undefined }
      : initial.watching
        ? { kind: "watching" }
        : { kind: "tab", tab: initial.tab }
  );
  const [libraryDocBack, setLibraryDocBack] = useState<MobileView | null>(null);
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
      if (next.view) {
        setView({
          kind: next.view,
          tab: next.tab,
          dealTitle: next.dealTitle ?? undefined,
          dealMeta: next.dealMeta ?? undefined,
          portfolioName: next.portfolioName ?? undefined,
          dealStage: next.dealStage ?? undefined,
          docTitle: next.docTitle ?? undefined,
          docMeta: next.docMeta ?? undefined,
          docKind: next.docKind ?? undefined,
          filesFilter: next.filesFilter ?? undefined,
        });
      }
      else if (next.detail) setView({ kind: "detail", dealId: next.detail, dealTitle: next.dealTitle ?? undefined });
      else if (next.watching) setView({ kind: "watching" });
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
    view.kind === "search" ? "search" :
    view.kind === "watching" ? "pipeline" :
    view.tab ? view.tab :
    "today";
  const sendWithSurface = (prompt: string) => {
    chat.send(prompt, buildMobileSurfaceContext(view, activeTab));
  };
  const chatWithSurface: MobileChatBridge = {
    ...chat,
    send: sendWithSurface,
  };
  const onTabChange = (next: MobileTab) => {
    if (next === "search") setView({ kind: "search", tab: "search" });
    else setView({ kind: "tab", tab: next });
  };
  const onChat = () => setChatOpen(true);
  const onOpenSearch = () => setView({ kind: "search", tab: "search" });
  const onOpenLibrary = () => setView({ kind: "library", tab: activeTab });
  const onOpenLibraryFinder = (filter = "all") => setView({ kind: "library-finder", tab: activeTab, filesFilter: filter });
  const onOpenLibraryDetail = (
    dealTitle = "Big Fake Deal",
    dealMeta = "$5.4M · East Texas · industrial services",
    portfolioName = "Buy",
    dealStage = "all",
  ) => setView({ kind: "library-detail", tab: activeTab, dealTitle, dealMeta, portfolioName, dealStage });
  const onOpenLibraryDoc = (docTitle = "IOI · v3", docMeta = "Yulia · drafting · 2 min ago", docKind = "draft") => {
    setLibraryDocBack(view);
    setView({ kind: "library-doc", tab: activeTab, docTitle, docMeta, docKind });
  };
  const onChatClose = () => setChatOpen(false);
  const onLearn = (section: "how" | "pricing", anchor?: string) =>
    setLearn({ open: true, section, anchor });
  const onLearnClose = () => setLearn(s => ({ ...s, open: false }));
  const onLearnTalkToYulia = (prompt: string) => {
    sendWithSurface(prompt);
    setChatOpen(true);
  };
  // Used by Today's persona-tip chips. Same shape as onLearnTalkToYulia
  // but the source is the Today Explore card rather than the Learn sheet.
  const onAskYulia = (prompt: string) => {
    sendWithSurface(prompt);
    setChatOpen(true);
  };

  // Audience signal — drives copy + capability shortcuts. The anon
  // switcher pill is rendered inline at the top of the Explore card on
  // Today (passed down via prop). Authed users have their audience
  // captured server-side, so no switcher needed.
  const { audience, setAudience } = useAudience(user);
  const isAnonAudience = !user;

  const initials = computeInitials(user);
  const isAnon = !user;

  const onOpenDeal = (id: string, title: string) => {
    setView({ kind: "detail", dealId: id, dealTitle: title });
  };
  const onOpenWatching = () => setView({ kind: "watching" });
  const onAvatarClick = () => {
    if (DEV_AUTH_BYPASS) {
      if (user) onSignOut();
      else onDevSignIn?.();
      return;
    }
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
  const isWhitePage =
    view.kind === "detail" ||
    view.kind === "watching" ||
    view.kind === "library-finder" ||
    view.kind === "library-detail" ||
    view.kind === "library-doc";
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
          onOpenLibrary={onOpenLibraryFinder}
          onOpenLibraryDetail={onOpenLibraryDoc}
          onChat={onChat}
          onSearch={onOpenSearch}
          onAskYulia={onAskYulia}
          onLearn={onLearn}
          onAvatarClick={onAvatarClick}
          userPipeline={userDeals.hasData ? userDeals.today : null}
          audience={audience}
          onAudienceChange={setAudience}
          showAudienceSwitcher={isAnonAudience}
        />
      )}
      {view.kind === "tab" && activeTab === "pipeline" && (
        <PipelineScreen
          isAnon={isAnon}
          initials={initials}
          onOpenDeal={onOpenDeal}
          onOpenWatching={onOpenWatching}
          onAvatarClick={onAvatarClick}
          onSearch={onOpenSearch}
          userWatching={userDeals.hasData ? userDeals.watching : null}
          userFeatured={userDeals.hasData ? userDeals.featured : null}
          userPicks={userDeals.hasData ? userDeals.picks : null}
        />
      )}
      {view.kind === "tab" && activeTab === "brief" && (
        <LibraryScreen
          initials={initials}
          onAvatarClick={onAvatarClick}
          onOpenSearch={onOpenSearch}
          onOpenFinder={onOpenLibraryFinder}
          onOpenDetail={onOpenLibraryDoc}
          onOpenDealLibrary={onOpenLibraryDetail}
        />
      )}
      {view.kind === "tab" && activeTab === "search" && (
        <SearchScreen
          initials={initials}
          onAvatarClick={onAvatarClick}
          onOpenSearch={onOpenSearch}
          onChat={onChat}
          onAskYulia={onAskYulia}
        />
      )}
      {view.kind === "detail" && (
        <DetailScreen
          dealId={view.dealId ?? "unknown"}
          dealTitle={view.dealTitle ?? view.dealId ?? "Deal"}
          onBack={() => setView({ kind: "tab", tab: "today" })}
          onChat={onChat}
          onAskYulia={onAskYulia}
        />
      )}
      {view.kind === "watching" && (
        <WatchingScreen
          onBack={() => setView({ kind: "tab", tab: "pipeline" })}
          onOpenDeal={onOpenDeal}
        />
      )}
      {view.kind === "search" && (
        <SearchScreen
          initials={initials}
          onAvatarClick={onAvatarClick}
          onOpenSearch={onOpenSearch}
          onChat={onChat}
          onAskYulia={onAskYulia}
        />
      )}
      {view.kind === "library" && (
        <LibraryScreen
          initials={initials}
          onAvatarClick={onAvatarClick}
          onOpenSearch={onOpenSearch}
          onOpenFinder={onOpenLibraryFinder}
          onOpenDetail={onOpenLibraryDoc}
          onOpenDealLibrary={onOpenLibraryDetail}
        />
      )}
      {view.kind === "library-finder" && (
        <LibraryFinderScreen
          onBack={() => setView({ kind: "tab", tab: activeTab })}
          onOpenDetail={onOpenLibraryDoc}
          onOpenDealLibrary={onOpenLibraryDetail}
          initialFilter={view.filesFilter as "all" | "deals" | "actionable" | "docs" | "analysis" | "data-room" | "shared" | "secure" | undefined}
          onFilterChange={(filter) => setView({ kind: "library-finder", tab: activeTab, filesFilter: filter })}
        />
      )}
      {view.kind === "library-detail" && (
        <LibraryDetailScreen
          onBack={() => setView({ kind: "library-finder", tab: activeTab, filesFilter: "deals" })}
          onOpenDoc={onOpenLibraryDoc}
          onStageChange={(stage) => setView({
            kind: "library-detail",
            tab: activeTab,
            dealTitle: view.dealTitle,
            dealMeta: view.dealMeta,
            portfolioName: view.portfolioName,
            dealStage: stage,
          })}
          dealTitle={view.dealTitle}
          dealMeta={view.dealMeta}
          portfolioName={view.portfolioName}
          dealStage={view.dealStage as "all" | "data-room" | undefined}
        />
      )}
      {view.kind === "library-doc" && (
        <LibraryDocumentScreen
          onBack={() => setView(libraryDocBack ?? { kind: "library", tab: activeTab })}
          onAskYulia={onAskYulia}
          title={view.docTitle}
          meta={view.docMeta}
          kind={view.docKind}
        />
      )}
      <TabBar active={activeTab} onChange={onTabChange} onChat={onChat} />
      <ChatSheet open={chatOpen} onClose={onChatClose} chat={chatWithSurface} />
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
  search: "Search",
  brief: "Files",
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

function readMobileHashState(): {
  tab: MobileTab;
  detail: string | null;
  dealTitle: string | null;
  docTitle: string | null;
  docMeta: string | null;
  docKind: string | null;
  dealMeta: string | null;
  portfolioName: string | null;
  dealStage: string | null;
  filesFilter: string | null;
  chat: boolean;
  watching: boolean;
  view: "search" | "library" | "library-finder" | "library-detail" | "library-doc" | null;
} {
  try {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return { tab: "today", detail: null, dealTitle: null, docTitle: null, docMeta: null, docKind: null, dealMeta: null, portfolioName: null, dealStage: null, filesFilter: null, chat: false, watching: false, view: null };
    const params = new URLSearchParams(hash);
    const rawTabParam = params.get("tab");
    const rawTab = (rawTabParam === "library" ? "brief" : rawTabParam) as MobileTab | null;
    const tab: MobileTab = rawTab && VALID_TABS.includes(rawTab) ? rawTab : "today";
    const rawView = params.get("view");
    const pushedView =
      rawView === "search" || rawView === "library" || rawView === "library-finder" || rawView === "library-detail" || rawView === "library-doc"
        ? rawView
        : null;
    const detail = params.get("deal");
    const dealTitle = params.get("t");
    const docTitle = params.get("doc");
    const docMeta = params.get("m");
    const docKind = params.get("k");
    const dealMeta = params.get("dm");
    const portfolioName = params.get("p");
    const dealStage = params.get("s");
    const filesFilter = params.get("filter");
    const chat = params.get("chat") === "open";
    const watching = params.get("view") === "watching";
    return { tab, detail, dealTitle, docTitle, docMeta, docKind, dealMeta, portfolioName, dealStage, filesFilter, chat, watching, view: pushedView };
  } catch {
    return { tab: "today", detail: null, dealTitle: null, docTitle: null, docMeta: null, docKind: null, dealMeta: null, portfolioName: null, dealStage: null, filesFilter: null, chat: false, watching: false, view: null };
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
    } else if (view.kind === "search" || view.kind === "library" || view.kind === "library-finder" || view.kind === "library-detail" || view.kind === "library-doc") {
      params.set("view", view.kind);
      if (view.tab) params.set("tab", view.tab);
      if (view.kind === "library-finder" && view.filesFilter) params.set("filter", view.filesFilter);
      if (view.kind === "library-detail") {
        if (view.dealTitle) params.set("t", view.dealTitle);
        if (view.dealMeta) params.set("dm", view.dealMeta);
        if (view.portfolioName) params.set("p", view.portfolioName);
        if (view.dealStage) params.set("s", view.dealStage);
      }
      if (view.kind === "library-doc") {
        if (view.docTitle) params.set("doc", view.docTitle);
        if (view.docMeta) params.set("m", view.docMeta);
        if (view.docKind) params.set("k", view.docKind);
      }
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
  /* Page-wide gradient retuned 2026-05-05 (eve, take 5) — three stops with
     a near-white intermediate at 40%. The top 40% interpolates white→
     near-white (visually pure white), and the bottom 60% smoothly fades
     to periwinkle. No knee, no plateau — just a gentle curve that pushes
     the visible tint into the lower half of long pages. */
  return (
    "linear-gradient(to bottom," +
    " #FFFFFF 0%," +
    " #FBFCFE 40%," +
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
