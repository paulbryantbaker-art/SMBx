import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useLocation } from "wouter";
import { useAnonymousChat } from "../../../hooks/useAnonymousChat";
import { useAuthChat } from "../../../hooks/useAuthChat";
import { DEV_AUTH_BYPASS, authHeaders } from "../../../hooks/useAuth";
import type { User } from "../../../hooks/useAuth";
import { useMobileDeals } from "../../../hooks/useMobileDeals";
import { TabBar } from "./TabBar";
import { GlassTopBar, LargeTitle, TitleCollapseProvider } from "./TopBar";
import { TodayScreen } from "./screens/Today";
import { PipelineScreen } from "./screens/Pipeline";
import { DetailScreen } from "./screens/Detail";
import { WatchingScreen } from "./screens/Watching";
import { MobileDealsListScreen } from "./screens/DealsListScreen";
import { MobileProviderProfileScreen } from "./screens/ProviderProfileScreen";
import { MobileAnalysisScreen } from "./screens/Analysis";
import { LibraryDetailScreen, LibraryDocumentScreen, LibraryFinderScreen, LibraryScreen, SearchScreen } from "./screens/LibrarySearch";
import { MobileAnalysesScreen } from "./screens/Analyses";
import { MobileDealTeamScreen } from "./screens/DealTeam";
import { ChatSheet } from "./ChatSheet";
import { LearnSheet } from "./LearnSheet";
import { NotificationsSheet } from "./NotificationsSheet";
import { useNotifications, type AppNotification } from "../../../hooks/useNotifications";
import { useAudience } from "../../../hooks/useAudience";
import { runDealAnalysis } from "../../../hooks/useV6WorkspaceData";
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
  // A real, signed-in user (not anon, not the dev-bypass preview) whose deal
  // fetch resolved with ZERO deals → screens show an honest empty state + a
  // "source your first deal" CTA instead of silently falling back to samples.
  const realEmpty = !!user && !DEV_AUTH_BYPASS && userDeals.loaded && !userDeals.hasData;

  const initial = readMobileHashState();
  const [view, setView] = useState<MobileView>(() => mobileViewFromHash(initial));
  const [libraryDocBack, setLibraryDocBack] = useState<MobileView | null>(null);
  const [chatOpen, setChatOpen] = useState(initial.chat);
  const [acctOpen, setAcctOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
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

  // URL hash sync + browser-history integration. Forward navigation (going
  // deeper: tab → deal → analysis) PUSHES a history entry so the OS back gesture
  // steps back through screens; lateral/shallower moves REPLACE so the stack
  // doesn't balloon on every tab tap. The hashchange listener below restores
  // `view` when back pops an entry. With the post-login navigate({replace}) in
  // App.tsx, back walks the app and only exits (to marketing) from a root tab —
  // never back to the auth screen.
  const navDepthRef = useRef(0);
  useEffect(() => {
    const next = buildMobileHash(view, chatOpen);
    if (window.location.hash === next) {
      navDepthRef.current = viewDepth(view);
      return; // already at this hash (e.g. restored by a back gesture)
    }
    const full = window.location.pathname + window.location.search + next;
    const depth = viewDepth(view);
    if (depth > navDepthRef.current) window.history.pushState(null, "", full);
    else window.history.replaceState(null, "", full);
    navDepthRef.current = depth;
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
      setView(mobileViewFromHash(next));
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
  useEffect(() => {
    const onAction = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (!detail) return;

      if (detail.canvas_action === "open_tab" && detail.tab?.kind === "analysis") {
        const tab = detail.tab;
        setView({
          kind: "analysis",
          tab: activeTab,
          analysisTitle: tab.title || detail.title || "Analysis",
          analysisTool: tab.tool || detail.analysisType,
          analysisRunId: tab.analysisRunId ?? detail.analysisRunId ?? null,
          analysisData: tab.analysisData ?? detail.analysisData,
          analysisMarkdown: tab.markdown ?? detail.markdown,
          comparisonData: tab.comparisonData,
          versionNumber: tab.versionNumber ?? detail.versionNumber ?? null,
          status: tab.status ?? detail.analysisStatus ?? "analysis open",
          modelState: tab.modelState,
        });
        setChatOpen(false);
      }

      if (detail.canvas_action === "create_model_tab" && detail.tabId) {
        setView({
          kind: "analysis",
          tab: activeTab,
          analysisTitle: detail.title || "Interactive model",
          analysisTool: detail.modelType || "interactive_model",
          analysisRunId: detail.analysisRunId ?? null,
          status: "saved model",
          modelState: detail.initialAssumptions || {},
        });
        setChatOpen(false);
      }

      if ((detail.canvas_action === "update_model" || detail.canvas_action === "read_tab_state") && (detail.analysisData || detail.versionNumber || detail.state)) {
        setView(prev => prev.kind === "analysis" ? {
          ...prev,
          analysisData: detail.analysisData ?? prev.analysisData,
          analysisRunId: detail.analysisRunId ?? prev.analysisRunId,
          versionNumber: detail.versionNumber ?? prev.versionNumber,
          status: detail.versionNumber ? `saved v${detail.versionNumber}` : prev.status,
          modelState: detail.state ?? detail.updates ?? prev.modelState,
        } : prev);
      }
    };

    window.addEventListener("smbx:canvas_action", onAction);
    return () => window.removeEventListener("smbx:canvas_action", onAction);
  }, [activeTab]);
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
  const onOpenAnalyses = () => setView({ kind: "analyses", tab: activeTab });
  const onOpenLibraryFinder = (filter = "all") => setView({ kind: "library-finder", tab: activeTab, filesFilter: filter });
  const onOpenLibraryDetail = (
    dealTitle = "Big Fake Deal",
    dealMeta = "$5.4M · East Texas · industrial services",
    portfolioName = "Buy",
    dealStage = "all",
  ) => setView({ kind: "library-detail", tab: activeTab, dealTitle, dealMeta, portfolioName, dealStage });
  const onOpenLibraryDoc = (docTitle = "IOI · v3", docMeta = "Yulia · drafting · 2 min ago", docKind = "draft", deliverableId?: number) => {
    setLibraryDocBack(view);
    setView({ kind: "library-doc", tab: activeTab, docTitle, docMeta, docKind, deliverableId });
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
  const onRunDealAnalysis = async (input: {
    dealId: string;
    dealTitle: string;
    analysisType: string;
    menuItemSlug?: string;
    label: string;
    prompt: string;
  }) => {
    const numericId = Number(input.dealId);
    if (!Number.isFinite(numericId)) {
      onAskYulia(input.prompt);
      return;
    }

    try {
      const result = await runDealAnalysis({
        dealId: numericId,
        analysisType: input.analysisType,
        menuItemSlug: input.menuItemSlug,
        requestedFrom: "mobile_deal_detail",
      });
      const tab = result.tab;
      setView({
        kind: "analysis",
        tab: activeTab,
        analysisTitle: tab?.title || `${input.dealTitle} · ${input.label}`,
        analysisTool: tab?.tool || result.analysisType || input.analysisType,
        analysisRunId: tab?.analysisRunId ?? result.analysisRunId ?? null,
        analysisData: tab?.analysisData ?? result.analysisData,
        analysisMarkdown: tab?.markdown ?? result.message,
        status: tab?.status ?? result.analysisStatus ?? "analysis complete",
      });
      setChatOpen(false);
    } catch {
      onAskYulia(input.prompt);
    }
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
  // Deal Team (DT-2) — Detail threads its parsed numeric id up through
  // onOpenTeam. Real deals carry a numeric id and get the live participants +
  // messages backend. Sample/dev-bypass deals pass null; the team screen then
  // renders sample collaboration data so the surface is reviewable in dev,
  // consistent with the rest of the mobile sample-data experience.
  const onOpenTeam = (rawId: number | null, title: string) => {
    setView({ kind: "deal-team", tab: activeTab, dealRawId: rawId ?? undefined, dealTitle: title });
  };
  const onOpenWatching = () => setView({ kind: "watching" });
  const onOpenDealsList = () => setView({ kind: "deals-list", tab: activeTab });
  const onOpenProviderProfile = () => setView({ kind: "provider-profile", tab: activeTab });
  const onAvatarClick = () => {
    if (!user) {
      if (DEV_AUTH_BYPASS) onDevSignIn?.();
      else navigate("/login");
      return;
    }
    // Authed → open the account sheet (Sign out / preview).
    setAcctOpen(true);
  };

  // Notifications (@mention + deal). Only poll for a real signed-in user —
  // anon / dev-bypass have no token, so /api/notifications would 401. The
  // bell + sheet are hidden in that case (onNotif left undefined below).
  const notifEnabled = !!user && !DEV_AUTH_BYPASS;
  const { notifications, unreadCount, markRead, markAllRead, refresh: refreshNotifs, respondToDealRequest } =
    useNotifications(notifEnabled);

  // Resolve a notification's action_url (a desktop V6 hash route like
  // `/#mode=pipeline&tab=deal-team-123` or `/#mode=...&tab=deal-45`) to the
  // closest mobile surface. Deal-scoped routes open the deal detail; bare
  // mode routes switch tabs; anything else just closes the sheet.
  const resolveNotifNav = (n: AppNotification) => {
    if (!n.read_at) markRead(n.id);
    setNotifOpen(false);
    try {
      const url = n.action_url || "";
      const hashIndex = url.indexOf("#");
      const rawHash = hashIndex >= 0 ? url.slice(hashIndex + 1) : "";
      const params = new URLSearchParams(rawHash);
      const tabParam = params.get("tab") || "";
      const modeParam = params.get("mode") || "";

      // Deal-scoped: deal-team-{id} (mention) or deal-{id} → open detail.
      const dealMatch = tabParam.match(/^deal(?:-team)?-(.+)$/);
      const dealId = dealMatch ? dealMatch[1] : n.deal_id != null ? String(n.deal_id) : "";
      if (dealId) {
        onOpenDeal(dealId, n.title?.replace(/\s*·\s*Team$/, "") || "Deal");
        return;
      }

      // Mode-level routes → switch the matching mobile tab.
      if (modeParam === "pipeline") { setView({ kind: "tab", tab: "pipeline" }); return; }
      if (modeParam === "search") { setView({ kind: "search", tab: "search" }); return; }
      if (modeParam === "library" || modeParam === "files" || modeParam === "docs") {
        setView({ kind: "tab", tab: "brief" });
        return;
      }
      if (modeParam === "analysis" || modeParam === "intel") {
        setView({ kind: "analyses", tab: activeTab });
        return;
      }
      // Fallback: a deal id on the notification but no parseable route.
      if (n.deal_id != null) onOpenDeal(String(n.deal_id), n.title || "Deal");
    } catch {
      /* malformed action_url — sheet already closed */
    }
  };

  const onOpenNotif = () => {
    refreshNotifs();
    setNotifOpen(true);
  };
  // Props spread into every chrome-bearing GlassTopBar. Undefined onNotif →
  // the bell is hidden (anon / dev-bypass), so screens stay clean for guests.
  const notifBarProps = notifEnabled
    ? { onNotif: onOpenNotif, notifCount: unreadCount }
    : {};

  const handleSignOut = () => {
    setAcctOpen(false);
    // Reset the marketing→app threshold flags so the reload lands on the
    // logged-out marketing site, then sign out and hard-navigate.
    try {
      sessionStorage.removeItem("smbx_app_entered");
      sessionStorage.removeItem("smbx_preview_marketing");
    } catch { /* ignore */ }
    onSignOut();
    window.location.assign("/");
  };

  // Opens the Stripe Customer Portal to manage subscription/billing. The
  // /api/stripe/portal route is now behind requireAuth, so authHeaders() is
  // required. Hidden for the dev-bypass preview (no real token → would 401).
  const handleManageBilling = async () => {
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
      });
      if (res.ok) {
        const { url } = await res.json();
        if (url) window.location.assign(url);
      }
    } catch { /* portal unavailable — leave the sheet open */ }
  };

  // Detail and Watching are full-page surfaces with their own white
  // backgrounds. Tabs share the home gradient.
  const isWhitePage =
    view.kind === "detail" ||
    view.kind === "watching" ||
    view.kind === "deals-list" ||
    view.kind === "provider-profile" ||
    view.kind === "library-finder" ||
    view.kind === "library-detail" ||
    view.kind === "library-doc" ||
    view.kind === "analysis" ||
    view.kind === "deal-team";
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
          realEmpty={realEmpty}
          onOpenAnalyses={onOpenAnalyses}
          onOpenDealsList={onOpenDealsList}
          {...notifBarProps}
        />
      )}
      {view.kind === "tab" && activeTab === "pipeline" && (
        <PipelineScreen
          isAnon={isAnon}
          initials={initials}
          onOpenDeal={onOpenDeal}
          onOpenWatching={onOpenWatching}
          onOpenDealsList={onOpenDealsList}
          onAvatarClick={onAvatarClick}
          onSearch={onOpenSearch}
          userWatching={userDeals.hasData ? userDeals.watching : null}
          userFeatured={userDeals.hasData ? userDeals.featured : null}
          userPicks={userDeals.hasData ? userDeals.picks : null}
          userAll={userDeals.hasData ? userDeals.all : null}
          realEmpty={realEmpty}
          {...notifBarProps}
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
          realEmpty={realEmpty}
          {...notifBarProps}
        />
      )}
      {view.kind === "tab" && activeTab === "search" && (
        <SearchScreen
          initials={initials}
          onAvatarClick={onAvatarClick}
          onOpenSearch={onOpenSearch}
          onChat={onChat}
          onAskYulia={onAskYulia}
          {...notifBarProps}
        />
      )}
      {view.kind === "detail" && (
        <DetailScreen
          dealId={view.dealId ?? "unknown"}
          dealTitle={view.dealTitle ?? view.dealId ?? "Deal"}
          onBack={() => setView({ kind: "tab", tab: "today" })}
          onChat={onChat}
          onAskYulia={onAskYulia}
          onRunAnalysis={onRunDealAnalysis}
          onOpenTeam={onOpenTeam}
        />
      )}
      {view.kind === "watching" && (
        <WatchingScreen
          onBack={() => setView({ kind: "tab", tab: "pipeline" })}
          onOpenDeal={onOpenDeal}
        />
      )}
      {view.kind === "deals-list" && (
        <MobileDealsListScreen
          onBack={() => setView({ kind: "tab", tab: view.tab ?? "pipeline" })}
          onOpenDeal={onOpenDeal}
          user={user}
        />
      )}
      {view.kind === "provider-profile" && (
        <MobileProviderProfileScreen
          onBack={() => setView({ kind: "tab", tab: view.tab ?? "today" })}
          user={user}
        />
      )}
      {view.kind === "search" && (
        <SearchScreen
          initials={initials}
          onAvatarClick={onAvatarClick}
          onOpenSearch={onOpenSearch}
          onChat={onChat}
          onAskYulia={onAskYulia}
          {...notifBarProps}
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
          realEmpty={realEmpty}
          {...notifBarProps}
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
            dealRawId: view.dealRawId,
          })}
          dealTitle={view.dealTitle}
          dealMeta={view.dealMeta}
          portfolioName={view.portfolioName}
          dealStage={view.dealStage as "all" | "data-room" | undefined}
          dealRawId={view.dealRawId ?? null}
        />
      )}
      {view.kind === "library-doc" && (
        <LibraryDocumentScreen
          onBack={() => setView(libraryDocBack ?? { kind: "library", tab: activeTab })}
          onAskYulia={onAskYulia}
          title={view.docTitle}
          meta={view.docMeta}
          kind={view.docKind}
          deliverableId={view.deliverableId ?? null}
        />
      )}
      {view.kind === "analyses" && (
        <MobileAnalysesScreen
          initials={initials}
          onAvatarClick={onAvatarClick}
          onSearch={onOpenSearch}
          deals={userDeals.hasData ? userDeals.today : null}
          onRunDealAnalysis={onRunDealAnalysis}
          onAskYulia={onAskYulia}
          {...notifBarProps}
        />
      )}
      {view.kind === "analysis" && (
        <MobileAnalysisScreen
          title={view.analysisTitle ?? "Analysis"}
          analysisRunId={view.analysisRunId}
          analysisData={view.analysisData}
          comparisonData={view.comparisonData}
          modelState={view.modelState}
          status={view.status}
          versionNumber={view.versionNumber}
          onBack={() => setView({ kind: "tab", tab: activeTab })}
          onAskYulia={onAskYulia}
          onOpenDeal={onOpenDeal}
          onOpenDocument={onOpenLibraryDoc}
          onOpenDealFiles={(dealId, dealTitle, scope) => {
            // dealId is the real numeric deal id (stringified) from the
            // analysis surface action. Thread it as dealRawId so the data
            // room opens against the REAL backend deal, not a sample.
            const rawId = Number(dealId);
            setView({
              kind: "library-detail",
              tab: activeTab,
              dealTitle,
              dealMeta: view.dealMeta,
              portfolioName: "Deal files",
              // "shared" maps to the data-room scope on mobile (library-detail
              // only has all | data-room). Anything else → data-room view too,
              // since opening "deal files" from an analysis means the room.
              dealStage: scope === "all" ? "all" : "data-room",
              dealRawId: Number.isFinite(rawId) ? rawId : undefined,
            });
          }}
          onRunDealAnalysis={onRunDealAnalysis}
          onUpdate={(patch) => setView(prev => prev.kind === "analysis" ? { ...prev, ...patch } : prev)}
        />
      )}
      {view.kind === "deal-team" && (
        <MobileDealTeamScreen
          // Real deals carry a numeric id → live participants/messages. Sample
          // and dev-bypass deals have no numeric id → null, which switches the
          // screen to sample collaboration data (reviewable in dev).
          dealId={view.dealRawId ?? null}
          dealTitle={view.dealTitle ?? "Deal"}
          userId={user?.id ?? null}
          userEmail={user?.email ?? null}
          initials={initials}
          onAvatarClick={onAvatarClick}
          // Back to the deal it belongs to. For a real deal, dealRawId
          // stringifies into the detail's dealId (Detail re-parses the numeric
          // id), so this works even after a reload restored the team view from
          // the URL hash. Sample deals have no numeric id to reconstruct the
          // detail route from, so fall back to the current tab.
          onBack={() =>
            view.dealRawId != null
              ? onOpenDeal(String(view.dealRawId), view.dealTitle ?? "Deal")
              : setView({ kind: "tab", tab: activeTab })
          }
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

      {/* Notifications sheet — @mention + deal notifications (DT-5). */}
      <NotificationsSheet
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        notifications={notifications}
        unreadCount={unreadCount}
        onRow={resolveNotifNav}
        onMarkAllRead={markAllRead}
        onRespondToDealRequest={respondToDealRequest}
      />

      {/* Account sheet — Liquid-Glass bottom sheet with Sign out / preview. */}
      {acctOpen && (
        <>
          <div onClick={() => setAcctOpen(false)} style={A.scrim} aria-hidden="true" />
          <div style={A.sheet} role="dialog" aria-label="Account">
            <div style={A.grab} />
            <div style={A.id}>
              <div style={A.name}>{user?.email || "Signed in"}</div>
              <div style={A.sub}>smbX.ai workspace</div>
            </div>
            {user && (
              <button type="button" style={A.item} onClick={() => { setAcctOpen(false); onOpenProviderProfile(); }}>Provider profile</button>
            )}
            {user && !DEV_AUTH_BYPASS && (
              <button type="button" style={A.item} onClick={handleManageBilling}>Manage subscription</button>
            )}
            <button type="button" style={A.item} onClick={() => { setAcctOpen(false); window.location.assign("/?marketing"); }}>Preview marketing site</button>
            <button type="button" style={{ ...A.item, ...A.danger }} onClick={handleSignOut}>Sign out</button>
          </div>
        </>
      )}
    </div>
    </TitleCollapseProvider>
  );
}

const A: Record<string, CSSProperties> = {
  scrim: { position: "fixed", inset: 0, zIndex: 9998, background: "rgba(0,0,0,0.28)" },
  sheet: {
    position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 9999,
    background: "linear-gradient(180deg, rgba(255,255,255,.90), rgba(255,255,255,.82))",
    WebkitBackdropFilter: "blur(30px) saturate(190%)", backdropFilter: "blur(30px) saturate(190%)",
    borderTop: "1px solid rgba(255,255,255,.7)", borderRadius: "22px 22px 0 0",
    boxShadow: "0 -22px 54px -20px rgba(25,24,19,.42)",
    padding: "10px 16px calc(env(safe-area-inset-bottom, 0px) + 14px)",
  },
  grab: { width: 38, height: 4, borderRadius: 2, background: "var(--mb-ink-5)", margin: "0 auto 12px" },
  id: { padding: "2px 6px 12px" },
  name: { fontFamily: "var(--mb-font-display)", fontWeight: 700, fontSize: 16, color: "var(--mb-ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  sub: { fontFamily: "var(--mb-font-mono)", fontSize: 11, color: "var(--mb-ink-3)", marginTop: 2 },
  item: {
    display: "block", width: "100%", textAlign: "left", padding: "15px 6px",
    border: 0, borderTop: "1px solid rgba(25,24,19,.08)", background: "transparent",
    fontFamily: "var(--mb-font-display)", fontSize: 16, color: "var(--mb-ink)", cursor: "pointer",
  },
  danger: { color: "#C0562F" },
};


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
  dealRawId: number | null;
  deliverableId: number | null;
  filesFilter: string | null;
  analysisRunId: number | null;
  analysisTitle: string | null;
  analysisTool: string | null;
  status: string | null;
  versionNumber: number | null;
  chat: boolean;
  watching: boolean;
  view: "search" | "library" | "library-finder" | "library-detail" | "library-doc" | "analyses" | "analysis" | "deals-list" | "deal-team" | "provider-profile" | null;
} {
  try {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return emptyMobileHashState();
    const params = new URLSearchParams(hash);
    const rawTabParam = params.get("tab");
    const rawTab = (rawTabParam === "library" ? "brief" : rawTabParam) as MobileTab | null;
    const tab: MobileTab = rawTab && VALID_TABS.includes(rawTab) ? rawTab : "today";
    const rawView = params.get("view");
    const pushedView =
      rawView === "search" || rawView === "library" || rawView === "library-finder" || rawView === "library-detail" || rawView === "library-doc" || rawView === "analyses" || rawView === "analysis" || rawView === "deals-list" || rawView === "deal-team" || rawView === "provider-profile"
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
    const dealRawIdParam = params.get("drid");
    const deliverableIdParam = params.get("did");
    const dealRawId = dealRawIdParam ? Number(dealRawIdParam) : NaN;
    const deliverableId = deliverableIdParam ? Number(deliverableIdParam) : NaN;
    const filesFilter = params.get("filter");
    const runParam = params.get("run");
    const versionParam = params.get("v");
    const analysisRunId = runParam ? Number(runParam) : NaN;
    const versionNumber = versionParam ? Number(versionParam) : NaN;
    const analysisTitle = params.get("at") ?? dealTitle;
    const analysisTool = params.get("tool");
    const status = params.get("status");
    const chat = params.get("chat") === "open";
    const watching = params.get("view") === "watching";
    return {
      tab,
      detail,
      dealTitle,
      docTitle,
      docMeta,
      docKind,
      dealMeta,
      portfolioName,
      dealStage,
      dealRawId: Number.isFinite(dealRawId) ? dealRawId : null,
      deliverableId: Number.isFinite(deliverableId) ? deliverableId : null,
      filesFilter,
      analysisRunId: Number.isFinite(analysisRunId) ? analysisRunId : null,
      analysisTitle,
      analysisTool,
      status,
      versionNumber: Number.isFinite(versionNumber) ? versionNumber : null,
      chat,
      watching,
      view: pushedView,
    };
  } catch {
    return emptyMobileHashState();
  }
}

function emptyMobileHashState(): ReturnType<typeof readMobileHashState> {
  return {
    tab: "today",
    detail: null,
    dealTitle: null,
    docTitle: null,
    docMeta: null,
    docKind: null,
    dealMeta: null,
    portfolioName: null,
    dealStage: null,
    dealRawId: null,
    deliverableId: null,
    filesFilter: null,
    analysisRunId: null,
    analysisTitle: null,
    analysisTool: null,
    status: null,
    versionNumber: null,
    chat: false,
    watching: false,
    view: null,
  };
}

function mobileViewFromHash(state: ReturnType<typeof readMobileHashState>): MobileView {
  // Deal Team with a real numeric deal id fetches live participants/messages;
  // without one it renders sample data (dev/sample deals). Sample mode has no
  // durable URL carrier (drid is only written for real deals), so a restored /
  // hand-edited deal-team hash with no drid can't be rehydrated into the sample
  // deal it came from — fall back to the tab rather than a contextless screen.
  // In-session sample navigation goes through setView directly, not this path.
  if (state.view === "deal-team" && state.dealRawId == null) {
    return { kind: "tab", tab: state.tab };
  }
  if (state.view) {
    return {
      kind: state.view,
      tab: state.tab,
      dealTitle: state.dealTitle ?? undefined,
      dealMeta: state.dealMeta ?? undefined,
      portfolioName: state.portfolioName ?? undefined,
      dealStage: state.dealStage ?? undefined,
      dealRawId: state.dealRawId ?? undefined,
      deliverableId: state.deliverableId ?? undefined,
      docTitle: state.docTitle ?? undefined,
      docMeta: state.docMeta ?? undefined,
      docKind: state.docKind ?? undefined,
      filesFilter: state.filesFilter ?? undefined,
      analysisTitle: state.analysisTitle ?? state.dealTitle ?? undefined,
      analysisTool: state.analysisTool ?? undefined,
      analysisRunId: state.analysisRunId,
      versionNumber: state.versionNumber,
      status: state.status ?? undefined,
    };
  }
  if (state.detail) return { kind: "detail", dealId: state.detail, dealTitle: state.dealTitle ?? undefined };
  if (state.watching) return { kind: "watching" };
  return { kind: "tab", tab: state.tab };
}

function buildMobileHash(view: MobileView, chatOpen: boolean): string {
  try {
    const params = new URLSearchParams();
    if (view.kind === "detail" && view.dealId) {
      params.set("deal", view.dealId);
      // Persist title in the URL so it survives the home ↔ detail full
      // reload (state is wiped by reload; URL is the only durable carrier).
      if (view.dealTitle) params.set("t", view.dealTitle);
    } else if (view.kind === "watching") {
      params.set("view", "watching");
    } else if (view.kind === "search" || view.kind === "library" || view.kind === "library-finder" || view.kind === "library-detail" || view.kind === "library-doc" || view.kind === "analyses" || view.kind === "analysis" || view.kind === "deals-list" || view.kind === "deal-team" || view.kind === "provider-profile") {
      params.set("view", view.kind);
      if (view.tab) params.set("tab", view.tab);
      if (view.kind === "library-finder" && view.filesFilter) params.set("filter", view.filesFilter);
      if (view.kind === "deal-team") {
        // drid (real numeric deal id) is the durable carrier the team view
        // rehydrates from; title rides along for the header on cold reload.
        if (view.dealRawId != null) params.set("drid", String(view.dealRawId));
        if (view.dealTitle) params.set("t", view.dealTitle);
      }
      if (view.kind === "library-detail") {
        if (view.dealTitle) params.set("t", view.dealTitle);
        if (view.dealMeta) params.set("dm", view.dealMeta);
        if (view.portfolioName) params.set("p", view.portfolioName);
        if (view.dealStage) params.set("s", view.dealStage);
        if (view.dealRawId != null) params.set("drid", String(view.dealRawId));
      }
      if (view.kind === "library-doc") {
        if (view.docTitle) params.set("doc", view.docTitle);
        if (view.docMeta) params.set("m", view.docMeta);
        if (view.docKind) params.set("k", view.docKind);
        if (view.deliverableId != null) params.set("did", String(view.deliverableId));
      }
      if (view.kind === "analysis") {
        if (view.analysisTitle) params.set("at", view.analysisTitle);
        if (view.analysisTool) params.set("tool", view.analysisTool);
        if (view.analysisRunId) params.set("run", String(view.analysisRunId));
        if (view.versionNumber) params.set("v", String(view.versionNumber));
        if (view.status) params.set("status", view.status);
      }
    } else if (view.tab) {
      params.set("tab", view.tab);
    }
    // Chat-open is URL-driven so the post-reload mount can rehydrate it
    // (and so index.html's body-bg script can paint white when present).
    if (chatOpen) params.set("chat", "open");
    return params.toString() ? `#${params.toString()}` : "";
  } catch {
    return "";
  }
}

/** Navigation depth — drives push (going deeper) vs replace (lateral/shallower)
 *  in the history-sync effect, so the OS back gesture pops one screen at a time. */
function viewDepth(view: MobileView): number {
  switch (view.kind) {
    case "tab":
    case "search":
      return 0;
    case "detail":
    case "watching":
    case "library":
    case "analyses":
    case "deal-team":
    case "deals-list":
    case "provider-profile":
      return 1;
    default:
      return 2; // library-finder / library-detail / library-doc / analysis
  }
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
};
