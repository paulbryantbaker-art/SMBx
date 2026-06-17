/* V6 Desktop shell — Phase 0 + first surfaces.
 *
 * This is NOT a parallel app. It is a LAYOUT over the mobile data: it lifts the
 * exact chat bridge + data hooks V6Mobile uses and mounts the existing,
 * prop-driven mobile screen COMPONENTS inside a desktop master-detail shell.
 * The screens are untouched — only the on* callback bodies differ (they set
 * shell state instead of mobile view state). See DESKTOP_PHASE1_IMPLEMENTATION.md.
 *
 * Phase 0 (this file): masthead nav + content pane + deal-detail pane +
 *   persistent Yulia composer (HYBRID), with the GlassTopBar chrome made
 *   pane-relative via ChromeModeProvider.
 * Wired surfaces so far: Today, Pipeline, and the deal Detail. Sourcing /
 *   Studio / Integration / Files render an honest "next" state until their
 *   contracts land (DESKTOP_PHASE1_IMPLEMENTATION §4).
 */

import { useMemo, useState, type CSSProperties } from "react";
import { DEV_AUTH_BYPASS, type User } from "../../hooks/useAuth";
import { useAnonymousChat } from "../../hooks/useAnonymousChat";
import { useAuthChat } from "../../hooks/useAuthChat";
import { useMobileDeals } from "../../hooks/useMobileDeals";
import { useAudience } from "../../hooks/useAudience";
import { TitleCollapseProvider, ChromeModeProvider } from "./mobile/TopBar";
import { TodayScreen } from "./mobile/screens/Today";
import { PipelineScreen } from "./mobile/screens/Pipeline";
import { DetailScreen } from "./mobile/screens/Detail";
import { ChatSheet } from "./mobile/ChatSheet";
import { ToastHost } from "../mobile/ToastHost";
import type { MobileChatBridge, MobileMessage } from "./mobile/types";

type SurfaceKey = "today" | "pipeline" | "sourcing" | "studio" | "integration" | "files";

const SURFACES: { key: SurfaceKey; label: string; ready: boolean }[] = [
  { key: "today", label: "Today", ready: true },
  { key: "pipeline", label: "Pipeline", ready: true },
  { key: "sourcing", label: "Sourcing", ready: false },
  { key: "studio", label: "Studio", ready: false },
  { key: "integration", label: "Integration", ready: false },
  { key: "files", label: "Files", ready: false },
];

const ACCENT = "#6F82DC"; // CD periwinkle

interface V6DesktopProps {
  user: User | null;
  onSignOut: () => void;
  onDevSignIn?: () => void;
}

export default function V6Desktop({ user, onSignOut, onDevSignIn }: V6DesktopProps) {
  if (DEV_AUTH_BYPASS) return <V6DesktopAnon user={user} onSignOut={onSignOut} onDevSignIn={onDevSignIn} />;
  return user
    ? <V6DesktopAuthed user={user} onSignOut={onSignOut} />
    : <V6DesktopAnon onSignOut={onSignOut} onDevSignIn={onDevSignIn} />;
}

/* ─── Anon / authed bridge split — copied verbatim from V6Mobile so the two
   shells share one chat data layer (no parallel reimplementation). ─── */

function V6DesktopAnon({
  user = null,
  onSignOut = () => {},
  onDevSignIn,
}: { user?: User | null; onSignOut?: () => void; onDevSignIn?: () => void } = {}) {
  const chat = useAnonymousChat();
  const thread = useMemo<MobileMessage[]>(() => chat.messages.map(m => ({
    who: m.role === "user" ? "u" : "y",
    text: m.content,
    stagedAction: null,
  })), [chat.messages]);
  const bridge = useMemo<MobileChatBridge>(() => ({
    thread,
    sending: chat.sending,
    streamingText: chat.streamingText,
    activeTool: null,
    toolTrace: [],
    error: chat.error,
    paywallData: null,
    send: (text, surfaceContext) => chat.sendMessage(text, undefined, surfaceContext),
  }), [thread, chat.sending, chat.streamingText, chat.error, chat.sendMessage]);
  return <V6DesktopShell user={user} chat={bridge} onSignOut={onSignOut} onDevSignIn={onDevSignIn} />;
}

function V6DesktopAuthed({ user, onSignOut }: { user: User; onSignOut: () => void }) {
  const chat = useAuthChat(user);
  const thread = useMemo<MobileMessage[]>(() => chat.messages.map(m => ({
    who: m.role === "user" ? "u" : "y",
    text: m.content,
    stagedAction: m.metadata?.stagedAction ?? null,
  })), [chat.messages]);
  const bridge = useMemo<MobileChatBridge>(() => ({
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
  }), [thread, chat.sending, chat.streamingText, chat.activeTool, chat.toolTrace, chat.paywallData, chat.sendMessage, chat.uploadFile, chat.confirmStagedAction, chat.cancelStagedAction, chat.conversations, chat.activeConversationId, chat.selectConversation, chat.loadConversations]);
  return <V6DesktopShell user={user} chat={bridge} onSignOut={onSignOut} />;
}

/* ─── Shell ─── */

interface ShellProps {
  user: User | null;
  chat: MobileChatBridge;
  onSignOut: () => void;
  onDevSignIn?: () => void;
}

function V6DesktopShell({ user, chat, onSignOut, onDevSignIn }: ShellProps) {
  const userDeals = useMobileDeals(user);
  const realEmpty = !!user && !DEV_AUTH_BYPASS && userDeals.loaded && !userDeals.hasData;
  const { audience, setAudience } = useAudience(user);
  const isAnon = !user;
  const initials = initialsFor(user);

  const [activeSurface, setActiveSurface] = useState<SurfaceKey>("today");
  const [selectedDeal, setSelectedDeal] = useState<{ id: string; title: string } | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [acctOpen, setAcctOpen] = useState(false);

  const openDeal = (id: string, title: string) => setSelectedDeal({ id, title });
  const askYulia = (prompt: string) => { chat.send(prompt); setChatOpen(true); };
  const onAvatarClick = () => {
    if (!user) { if (DEV_AUTH_BYPASS) onDevSignIn?.(); else window.location.assign("/login"); return; }
    setAcctOpen(o => !o);
  };
  const handleSignOut = () => {
    setAcctOpen(false);
    try { sessionStorage.removeItem("smbx_app_entered"); sessionStorage.removeItem("smbx_preview_marketing"); } catch { /* ignore */ }
    onSignOut();
    window.location.assign("/");
  };

  // Today's many callbacks routed to the nearest sensible shell action. Deep
  // targets (analyses, deals-list, library doc) land on the matching surface
  // or Yulia; none are dead clicks.
  const todayProps = {
    isAnon,
    initials,
    onOpenDeal: openDeal,
    onOpenLibrary: () => setActiveSurface("files"),
    onOpenLibraryDetail: () => setActiveSurface("files"),
    onChat: () => setChatOpen(true),
    onSearch: () => setChatOpen(true),
    onAskYulia: askYulia,
    onLearn: (section: "how" | "pricing") => window.location.assign(section === "pricing" ? "/pricing" : "/how-it-works"),
    onAvatarClick,
    userPipeline: userDeals.hasData ? userDeals.today : null,
    featured: userDeals.hasData ? userDeals.featured : null,
    audience,
    onAudienceChange: setAudience,
    showAudienceSwitcher: isAnon,
    realEmpty,
    onOpenAnalyses: () => setActiveSurface("studio"),
    onOpenDealsList: () => setActiveSurface("pipeline"),
    onAddDeal: () => askYulia("I want to start a new deal."),
  };

  const pipelineProps = {
    isAnon,
    initials,
    onOpenDeal: openDeal,
    onOpenWatching: () => setActiveSurface("pipeline"),
    onOpenDealsList: () => setActiveSurface("pipeline"),
    onAvatarClick,
    onSearch: () => setChatOpen(true),
    userFeatured: userDeals.hasData ? userDeals.featured : null,
    userPicks: userDeals.hasData ? userDeals.picks : null,
    userAll: userDeals.hasData ? userDeals.all : null,
    realEmpty,
    onAddDeal: () => askYulia("I want to start a new deal."),
  };

  return (
    <TitleCollapseProvider>
      <div className="dt-root" style={S.root}>
        {/* Masthead */}
        <header style={S.masthead}>
          <div style={S.brand}>smb<b style={{ color: ACCENT }}>X</b></div>
          <nav style={S.nav}>
            {SURFACES.map(s => {
              const on = activeSurface === s.key;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => { setActiveSurface(s.key); setSelectedDeal(null); }}
                  style={{ ...S.navItem, ...(on ? S.navItemOn : null) }}
                  aria-current={on ? "page" : undefined}
                >{s.label}</button>
              );
            })}
          </nav>
          <div style={{ position: "relative" }}>
            <button type="button" onClick={onAvatarClick} style={S.avatar} aria-label="Account">{initials}</button>
            {acctOpen && user && (
              <>
                <div onClick={() => setAcctOpen(false)} style={S.acctScrim} aria-hidden="true" />
                <div style={S.acctMenu} role="menu">
                  <div style={S.acctId}>{user.email}</div>
                  <button type="button" style={S.acctItem} onClick={() => { setAcctOpen(false); window.location.assign("/?marketing"); }}>Preview marketing site</button>
                  <button type="button" style={{ ...S.acctItem, color: "#C0562F" }} onClick={handleSignOut}>Sign out</button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Body: surface (master) + deal detail (detail) */}
        <div style={S.body}>
          <main style={S.pane}>
            <ChromeModeProvider mode="pane">
              <div style={S.column}>
                {activeSurface === "today" && <TodayScreen {...todayProps} />}
                {activeSurface === "pipeline" && <PipelineScreen {...pipelineProps} />}
                {activeSurface !== "today" && activeSurface !== "pipeline" && (
                  <SurfaceComing label={SURFACES.find(s => s.key === activeSurface)?.label ?? ""} onAskYulia={askYulia} />
                )}
              </div>
            </ChromeModeProvider>
          </main>

          {selectedDeal && (
            <aside style={S.detail}>
              <ChromeModeProvider mode="pane">
                <DetailScreen
                  dealId={selectedDeal.id}
                  dealTitle={selectedDeal.title}
                  onBack={() => setSelectedDeal(null)}
                  onChat={() => setChatOpen(true)}
                  onAskYulia={askYulia}
                  onRunAnalysis={(input: { prompt: string }) => askYulia(input.prompt)}
                  onOpenTeam={(_rawId: number | null, title: string) => askYulia(`Show me the deal team for ${title}.`)}
                  onOpenDealFiles={() => askYulia("Open this deal's data room.")}
                />
              </ChromeModeProvider>
            </aside>
          )}
        </div>

        {/* Persistent Yulia composer (HYBRID) */}
        <DockedComposer
          chat={chat}
          chatOpen={chatOpen}
          onExpand={() => setChatOpen(true)}
        />
        <ChatSheet open={chatOpen} onClose={() => setChatOpen(false)} chat={chat} />
        <ToastHost zIndex={10000} />
      </div>
    </TitleCollapseProvider>
  );
}

/* ─── Persistent docked composer — always visible; expands into ChatSheet ─── */

function DockedComposer({ chat, chatOpen, onExpand }: { chat: MobileChatBridge; chatOpen: boolean; onExpand: () => void }) {
  const [draft, setDraft] = useState("");
  if (chatOpen) return null; // the expanded ChatSheet owns the composer while open
  const submit = () => {
    const t = draft.trim();
    if (!t) return;
    chat.send(t);
    setDraft("");
    onExpand();
  };
  return (
    <div style={S.dock}>
      <button type="button" onClick={onExpand} style={S.dockGlyph} aria-label="Open Yulia">
        <span style={{ width: 9, height: 9, borderRadius: 999, background: ACCENT, display: "inline-block" }} />
      </button>
      <input
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
        placeholder="Ask Yulia…"
        style={S.dockInput}
        aria-label="Ask Yulia"
      />
      <button type="button" onClick={submit} disabled={!draft.trim()} style={{ ...S.dockSend, opacity: draft.trim() ? 1 : 0.45 }}>Send</button>
    </div>
  );
}

function SurfaceComing({ label, onAskYulia }: { label: string; onAskYulia: (p: string) => void }) {
  return (
    <div style={S.coming}>
      <div style={{ fontFamily: "var(--mb-font-display, Inter)", fontWeight: 800, fontSize: 26, color: "var(--mb-ink, #1a1a1a)", letterSpacing: "-0.5px" }}>{label}</div>
      <p style={{ maxWidth: 420, color: "var(--mb-ink-3, #6b6b6b)", fontSize: 15, lineHeight: 1.5, margin: "10px 0 18px" }}>
        This surface lands in the next build step, wired to the same backend the mobile app already uses. In the meantime, Yulia can do it from chat.
      </p>
      <button type="button" onClick={() => onAskYulia(`Help me with ${label.toLowerCase()}.`)} style={S.comingBtn}>Ask Yulia about {label}</button>
    </div>
  );
}

function initialsFor(user: User | null): string {
  if (!user) return "JM";
  const src = user.display_name?.trim() || user.email;
  const p = src.split(/[\s@.]+/).filter(Boolean);
  return (p.length >= 2 ? p[0][0] + p[1][0] : src.slice(0, 2)).toUpperCase();
}

const S: Record<string, CSSProperties> = {
  root: { height: "100dvh", display: "flex", flexDirection: "column", background: "#ECEAF2", overflow: "hidden", position: "relative" },
  masthead: {
    display: "flex", alignItems: "center", gap: 24, padding: "0 22px", height: 56, flexShrink: 0,
    background: "rgba(255,255,255,0.72)", backdropFilter: "blur(18px) saturate(180%)", WebkitBackdropFilter: "blur(18px) saturate(180%)",
    borderBottom: "1px solid rgba(25,24,19,0.08)",
  },
  brand: { fontFamily: "var(--mb-font-display, Inter)", fontWeight: 800, fontSize: 19, letterSpacing: "-0.5px", color: "#1a1a1a" },
  nav: { display: "flex", alignItems: "center", gap: 4, flex: 1 },
  navItem: {
    padding: "7px 13px", borderRadius: 9, border: "none", background: "transparent", cursor: "pointer",
    fontFamily: "var(--mb-font-display, Inter)", fontWeight: 600, fontSize: 14, color: "#5b5b66",
  },
  navItemOn: { background: "rgba(111,130,220,0.14)", color: ACCENT },
  avatar: {
    width: 34, height: 34, borderRadius: "50%", border: "none", cursor: "pointer", color: "#fff",
    background: "linear-gradient(145deg, #8A9AE8, #6F82DC)", fontFamily: "var(--mb-font-display, Inter)", fontWeight: 700, fontSize: 13,
  },
  acctScrim: { position: "fixed", inset: 0, zIndex: 60 },
  acctMenu: {
    position: "absolute", top: 44, right: 0, zIndex: 61, minWidth: 220, padding: 6,
    background: "#fff", borderRadius: 14, border: "1px solid rgba(25,24,19,0.1)", boxShadow: "0 18px 50px -16px rgba(25,24,19,0.4)",
  },
  acctId: { padding: "8px 10px", fontFamily: "var(--mb-font-mono, monospace)", fontSize: 11, color: "#8b867a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  acctItem: { display: "block", width: "100%", textAlign: "left", padding: "10px", border: "none", borderTop: "1px solid rgba(25,24,19,0.07)", background: "transparent", cursor: "pointer", fontFamily: "var(--mb-font-display, Inter)", fontSize: 14, color: "#1a1a1a" },
  body: { flex: 1, display: "flex", minHeight: 0, position: "relative" },
  pane: { flex: 1, minWidth: 0, position: "relative", overflow: "auto" },
  column: { position: "relative", maxWidth: 820, margin: "0 auto", minHeight: "100%", paddingBottom: 96 },
  detail: { width: "min(620px, 48%)", flexShrink: 0, position: "relative", overflow: "auto", background: "#fff", borderLeft: "1px solid rgba(25,24,19,0.1)" },
  dock: {
    position: "absolute", left: "50%", transform: "translateX(-50%)", bottom: 18, zIndex: 50,
    display: "flex", alignItems: "center", gap: 8, width: "min(640px, calc(100% - 48px))", padding: "8px 8px 8px 14px",
    background: "rgba(255,255,255,0.92)", backdropFilter: "blur(20px) saturate(180%)", WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: "1px solid rgba(25,24,19,0.1)", borderRadius: 16, boxShadow: "0 18px 50px -18px rgba(25,24,19,0.42)",
  },
  dockGlyph: { width: 30, height: 30, borderRadius: "50%", border: "none", background: "rgba(111,130,220,0.14)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 },
  dockInput: { flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: "var(--mb-font-display, Inter)", fontSize: 15, color: "#1a1a1a" },
  dockSend: { padding: "8px 16px", borderRadius: 11, border: "none", background: ACCENT, color: "#fff", fontFamily: "var(--mb-font-display, Inter)", fontWeight: 700, fontSize: 14, cursor: "pointer" },
  coming: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", minHeight: "60vh", padding: "0 24px" },
  comingBtn: { padding: "11px 20px", borderRadius: 12, border: "none", background: ACCENT, color: "#fff", fontFamily: "var(--mb-font-display, Inter)", fontWeight: 700, fontSize: 14, cursor: "pointer" },
};
