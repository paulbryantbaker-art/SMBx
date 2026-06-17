/* V6 Desktop — CD "smbx Desktop" implementation.
 *
 * Faithful build of the Claude Design handoff (smbx Desktop.dc.html): a desktop
 * masthead + editorial main + a persistent 328px Yulia dock. The SURFACES are
 * desktop-native compositions, but every value is read from the SAME hooks the
 * mobile app uses (useMobileDeals, useNextActions, the chat bridge, the brief
 * endpoints) — a layout over mobile data, never a parallel data layer.
 *
 * Built so far: masthead, Today dashboard, the Yulia dock, and the deal
 * slide-over (reuses the mobile DetailScreen). Pipeline/Sourcing/Studio/
 * Integration/Files render an honest "lands next" state in the CD language
 * until their surfaces are built (DESKTOP_PHASE1_IMPLEMENTATION §4).
 */

import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { DEV_AUTH_BYPASS, authHeaders, type User } from "../../hooks/useAuth";
import { useAnonymousChat } from "../../hooks/useAnonymousChat";
import { useAuthChat } from "../../hooks/useAuthChat";
import { useMobileDeals, type MobileFeatured, type MobileStageRow } from "../../hooks/useMobileDeals";
import { useNextActions, type NextAction } from "../../hooks/useNextActions";
import { PIPELINE_STAGES, type PipelineStageId } from "../../lib/pipelineStages";
import { ChromeModeProvider } from "./mobile/TopBar";
import { DetailScreen } from "./mobile/screens/Detail";
import { MobileAnalysisScreen } from "./mobile/screens/Analysis";
import { MobileModelScreen, ensureModelTabFromCanvasAction } from "./mobile/screens/Model";
import { runDealAnalysis } from "../../hooks/useV6WorkspaceData";
import { useModelStore } from "../../lib/modelStore";
import { ToastHost } from "../mobile/ToastHost";
import type { MobileChatBridge, MobileMessage, Verdict } from "./mobile/types";

/* ── CD tokens ── */
const INK = "#1A2233", MUT = "#7A8395", MUT2 = "#555E6F", FAINT = "#A6AEBC";
const PERI = "#6F82DC", PERI2 = "#8A9AE8", PERI3 = "#B7C0EC", PERI_BG = "#EEF1FB", PERI_INK = "#4F60BD";
const BG = "#E9ECF7", DOCK_BG = "rgba(243,244,250,0.62)", LINE = "rgba(60,60,67,0.09)";
const DOCK_FILTER = "blur(24px) saturate(170%) brightness(1.03)";
const DISP = "'Inter Tight',-apple-system,system-ui,sans-serif";
const BODY = "'Inter',-apple-system,system-ui,sans-serif";
const MONO = "'JetBrains Mono',ui-monospace,monospace";

const VERDICT: Record<Verdict, { bg: string; ink: string; dot: string; label: string }> = {
  pursue: { bg: "#E6F3EC", ink: "#3F8A6A", dot: "#3F8A6A", label: "Pursue" },
  watch: { bg: "#FAF1E1", ink: "#9C7128", dot: "#D6A35C", label: "Watch" },
  pass: { bg: "#F2F2F7", ink: "#7A8395", dot: "#A6AEBC", label: "Pass" },
};

type SurfaceKey = "today" | "pipeline" | "sourcing" | "studio" | "integration" | "files";
const NAV: { key: SurfaceKey; label: string }[] = [
  { key: "today", label: "Today" }, { key: "pipeline", label: "Pipeline" },
  { key: "sourcing", label: "Sourcing" }, { key: "studio", label: "Studio" },
  { key: "integration", label: "Integration" }, { key: "files", label: "Files" },
];

/* A canvas tab is an analysis (incl. Yulia artifacts via markdown) or a live
   model. Tabs persist; two can be shown side-by-side to compare. */
type CanvasTab =
  | { id: string; kind: "analysis"; title: string; analysisRunId?: number | null; analysisData?: Record<string, any>; status?: string; versionNumber?: number | null }
  | { id: string; kind: "model"; title: string; modelTabId: string };

const Diamond = ({ s = 16, c = "#fff" }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={c} aria-hidden="true"><path d="M12 1.6c.3 5.2 5.2 10.1 10.4 10.4-5.2.3-10.1 5.2-10.4 10.4-.3-5.2-5.2-10.1-10.4-10.4C6.8 11.7 11.7 6.8 12 1.6Z" /></svg>
);

export default function V6Desktop({ user, onSignOut, onDevSignIn }: { user: User | null; onSignOut: () => void; onDevSignIn?: () => void }) {
  if (DEV_AUTH_BYPASS) return <V6DesktopAnon user={user} onSignOut={onSignOut} onDevSignIn={onDevSignIn} />;
  return user ? <V6DesktopAuthed user={user} onSignOut={onSignOut} /> : <V6DesktopAnon onSignOut={onSignOut} onDevSignIn={onDevSignIn} />;
}

/* ── bridge split (verbatim shape from V6Mobile) ── */
function V6DesktopAnon({ user = null, onSignOut = () => {}, onDevSignIn }: { user?: User | null; onSignOut?: () => void; onDevSignIn?: () => void } = {}) {
  const chat = useAnonymousChat();
  const thread = useMemo<MobileMessage[]>(() => chat.messages.map(m => ({ who: m.role === "user" ? "u" : "y", text: m.content, stagedAction: null })), [chat.messages]);
  const bridge = useMemo<MobileChatBridge>(() => ({ thread, sending: chat.sending, streamingText: chat.streamingText, activeTool: null, toolTrace: [], error: chat.error, paywallData: null, send: (t, sc) => chat.sendMessage(t, undefined, sc) }), [thread, chat.sending, chat.streamingText, chat.error, chat.sendMessage]);
  return <Shell user={user} chat={bridge} onSignOut={onSignOut} onDevSignIn={onDevSignIn} />;
}
function V6DesktopAuthed({ user, onSignOut }: { user: User; onSignOut: () => void }) {
  const chat = useAuthChat(user);
  const thread = useMemo<MobileMessage[]>(() => chat.messages.map(m => ({ who: m.role === "user" ? "u" : "y", text: m.content, stagedAction: m.metadata?.stagedAction ?? null })), [chat.messages]);
  const bridge = useMemo<MobileChatBridge>(() => ({ thread, sending: chat.sending, streamingText: chat.streamingText, activeTool: chat.activeTool, toolTrace: chat.toolTrace, error: null, paywallData: chat.paywallData, send: chat.sendMessage, uploadFile: chat.uploadFile, confirmStagedAction: chat.confirmStagedAction, cancelStagedAction: chat.cancelStagedAction, conversations: chat.conversations, activeConversationId: chat.activeConversationId, selectConversation: chat.selectConversation, refreshConversations: chat.loadConversations }), [thread, chat.sending, chat.streamingText, chat.activeTool, chat.toolTrace, chat.paywallData, chat.sendMessage, chat.uploadFile, chat.confirmStagedAction, chat.cancelStagedAction, chat.conversations, chat.activeConversationId, chat.selectConversation, chat.loadConversations]);
  return <Shell user={user} chat={bridge} onSignOut={onSignOut} />;
}

/* ── shell ── */
function Shell({ user, chat, onSignOut, onDevSignIn }: { user: User | null; chat: MobileChatBridge; onSignOut: () => void; onDevSignIn?: () => void }) {
  useCdFonts();
  const deals = useMobileDeals(user);
  const canFetch = !!user && !DEV_AUTH_BYPASS;
  const { actions } = useNextActions(user, canFetch);
  const [surface, setSurface] = useState<SurfaceKey>("today");
  const [openDeal, setOpenDeal] = useState<{ id: string; title: string } | null>(null);
  const [dockOpen, setDockOpen] = useState(true);
  const [acctOpen, setAcctOpen] = useState(false);
  // Tabbed canvas — analyses/models open here; two can be compared side-by-side.
  const [canvasTabs, setCanvasTabs] = useState<CanvasTab[]>([]);
  const [activeCanvasId, setActiveCanvasId] = useState<string | null>(null);
  const [compareId, setCompareId] = useState<string | null>(null);

  const firstName = (user?.display_name?.trim() || user?.email || "there").split(/[\s@.]+/)[0];
  const initials = initialsFor(user);
  const send = (t: string) => { chat.send(t); setDockOpen(true); };
  const onAvatar = () => { if (!user) { DEV_AUTH_BYPASS ? onDevSignIn?.() : window.location.assign("/login"); return; } setAcctOpen(o => !o); };

  const addCanvasTab = (tab: CanvasTab) => {
    setCanvasTabs(prev => prev.some(t => t.id === tab.id) ? prev.map(t => t.id === tab.id ? { ...t, ...tab } : t) : [...prev, tab]);
    setActiveCanvasId(tab.id);
    setOpenDeal(null); // surface the canvas
  };
  const addTabRef = useRef(addCanvasTab);
  addTabRef.current = addCanvasTab;

  const closeCanvasTab = (id: string) => {
    setCanvasTabs(prev => {
      const next = prev.filter(t => t.id !== id);
      setActiveCanvasId(cur => cur === id ? (next.length ? next[next.length - 1].id : null) : cur);
      setCompareId(cur => cur === id ? null : cur);
      return next;
    });
  };

  // Yulia's tool outputs (create_model_tab / open_tab analysis / show_content)
  // land on the canvas. Registered once; uses a ref so it always calls the
  // latest addCanvasTab. The shared modelStore makes models the same live tab.
  useEffect(() => {
    const onAction = (e: Event) => {
      const d = (e as CustomEvent).detail;
      if (!d) return;
      if (d.canvas_action === "create_model_tab" && d.tabId) {
        const ensured = ensureModelTabFromCanvasAction(d);
        if (ensured) addTabRef.current({ id: "model-" + ensured.tabId, kind: "model", title: ensured.title, modelTabId: ensured.tabId });
      } else if (d.canvas_action === "open_tab" && d.tab?.kind === "analysis") {
        const t = d.tab;
        const rid = t.analysisRunId ?? d.analysisRunId ?? null;
        addTabRef.current({ id: "an-" + (rid ?? Date.now()), kind: "analysis", title: t.title || d.title || "Analysis", analysisRunId: rid, analysisData: t.analysisData ?? d.analysisData, status: t.status, versionNumber: t.versionNumber });
      } else if (d.canvas_action === "show_content") {
        const md = d.content || d.markdown || d.message || "";
        addTabRef.current({ id: "doc-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6), kind: "analysis", title: d.title || "Yulia artifact", analysisData: { analysisMarkdown: md } });
      } else if (d.canvas_action === "update_model") {
        const targetId = d.tabId && d.tabId !== "active" ? d.tabId : null;
        const updates = d.updates && typeof d.updates === "object" ? d.updates : null;
        if (targetId && updates) useModelStore.getState().updateAssumptions(targetId, updates);
      }
    };
    window.addEventListener("smbx:canvas_action", onAction);
    return () => window.removeEventListener("smbx:canvas_action", onAction);
  }, []);

  // Run a deal analysis and open the result as a canvas tab (deal-detail action).
  const runAnalysisToCanvas = async (input: { dealId: string; dealTitle: string; analysisType: string; menuItemSlug?: string; label: string; prompt: string }) => {
    const numericId = Number(input.dealId);
    if (!Number.isFinite(numericId)) { send(input.prompt); return; }
    try {
      const result = await runDealAnalysis({ dealId: numericId, analysisType: input.analysisType, menuItemSlug: input.menuItemSlug, requestedFrom: "desktop_canvas" });
      const tab = result.tab;
      const rid = tab?.analysisRunId ?? result.analysisRunId ?? null;
      addCanvasTab({ id: "an-" + (rid ?? Date.now()), kind: "analysis", title: tab?.title || `${input.dealTitle} · ${input.label}`, analysisRunId: rid, analysisData: tab?.analysisData ?? result.analysisData, status: tab?.status ?? result.analysisStatus ?? "analysis complete" });
    } catch { send(input.prompt); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", width: "100%", overflow: "hidden", fontFamily: BODY, color: INK, background: BG }}>
      {/* MASTHEAD */}
      <header style={{ height: 62, flexShrink: 0, padding: "0 26px", display: "flex", alignItems: "center", gap: 26, borderBottom: "1px solid rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.55)", backdropFilter: "blur(20px) saturate(180%)", WebkitBackdropFilter: "blur(20px) saturate(180%)", boxShadow: "0 1px 0 rgba(60,60,67,0.06)", zIndex: 5, position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(150deg,#8A9AE8,#6F82DC)", display: "grid", placeItems: "center", boxShadow: "0 4px 12px -4px rgba(111,130,220,0.6), inset 0 1px 0 rgba(255,255,255,0.4)" }}><Diamond /></div>
          <span style={{ fontFamily: DISP, fontWeight: 700, fontSize: 16, letterSpacing: "-0.3px", color: INK }}>smbx<span style={{ color: PERI }}>.ai</span></span>
        </div>
        <nav style={{ display: "flex", alignItems: "center", gap: 3 }}>
          {NAV.map(n => {
            const on = surface === n.key;
            return <button key={n.key} type="button" onClick={() => { setSurface(n.key); setOpenDeal(null); setActiveCanvasId(null); }} style={{ padding: "7px 13px", border: "none", borderRadius: 9, fontFamily: BODY, fontSize: 13.5, cursor: "pointer", background: on && !activeCanvasId ? PERI_BG : "transparent", color: on && !activeCanvasId ? PERI_INK : MUT2, fontWeight: on ? 600 : 500 }}>{n.label}</button>;
          })}
        </nav>
        <div style={{ flex: 1 }} />
        {canvasTabs.length > 0 && (
          <button type="button" onClick={() => setActiveCanvasId(activeCanvasId ? null : canvasTabs[canvasTabs.length - 1].id)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 12px", border: "none", borderRadius: 10, cursor: "pointer", fontFamily: BODY, fontSize: 13, fontWeight: 600, background: activeCanvasId ? INK : PERI_BG, color: activeCanvasId ? "#fff" : PERI_INK }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18" /></svg>
            Canvas<span style={{ fontFamily: MONO, fontSize: 11, padding: "1px 6px", borderRadius: 999, background: activeCanvasId ? "rgba(255,255,255,0.2)" : "rgba(111,130,220,0.18)" }}>{canvasTabs.length}</span>
          </button>
        )}
        <button type="button" onClick={() => setDockOpen(true)} style={{ display: "flex", alignItems: "center", gap: 9, width: 230, padding: "8px 12px", border: "1px solid rgba(60,60,67,0.12)", borderRadius: 10, background: "#fff", color: FAINT, fontSize: 13, cursor: "pointer", textAlign: "left" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <span style={{ flex: 1 }}>Search deals, files, people</span>
          <span style={{ fontFamily: MONO, fontSize: 11, border: "1px solid rgba(60,60,67,0.14)", borderRadius: 5, padding: "1px 5px" }}>⌘K</span>
        </button>
        <button type="button" aria-label="New deal" onClick={() => send("I want to start a new deal.")} style={{ width: 36, height: 36, border: "none", borderRadius: 10, background: INK, color: "#fff", display: "grid", placeItems: "center", cursor: "pointer", boxShadow: "0 6px 16px -8px rgba(26,34,51,0.6)" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg></button>
        <button type="button" onClick={onAvatar} aria-label="Account" style={{ width: 34, height: 34, borderRadius: 999, border: "none", display: "grid", placeItems: "center", background: "linear-gradient(150deg,#B7C0EC,#8A9AE8)", color: "#2C357A", fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>{initials}</button>
        {acctOpen && user && (
          <>
            <div onClick={() => setAcctOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 60 }} />
            <div style={{ position: "absolute", top: 56, right: 22, zIndex: 61, minWidth: 220, padding: 6, background: "#fff", borderRadius: 14, border: "1px solid rgba(60,60,67,0.1)", boxShadow: "0 18px 50px -16px rgba(26,34,51,0.4)" }} role="menu">
              <div style={{ padding: "8px 10px", fontFamily: MONO, fontSize: 11, color: FAINT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
              <button type="button" style={acctItem} onClick={() => { setAcctOpen(false); window.location.assign("/?marketing"); }}>Preview marketing site</button>
              <button type="button" style={{ ...acctItem, color: "#C0562F" }} onClick={() => { try { sessionStorage.removeItem("smbx_app_entered"); sessionStorage.removeItem("smbx_preview_marketing"); } catch { /* ignore */ } onSignOut(); window.location.assign("/"); }}>Sign out</button>
            </div>
          </>
        )}
      </header>

      {/* BODY */}
      <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
        <main style={{ flex: 1, minWidth: 0, overflow: activeCanvasId ? "hidden" : "auto", position: "relative", background: AMBIENT, display: activeCanvasId ? "flex" : "block" }}>
          {activeCanvasId ? (
            <DesktopCanvas
              tabs={canvasTabs} activeId={activeCanvasId} compareId={compareId}
              onActivate={setActiveCanvasId} onClose={closeCanvasTab} onMinimize={() => setActiveCanvasId(null)}
              onSetCompare={setCompareId} onAsk={send}
              onOpenDeal={(id, title) => setOpenDeal({ id, title })} onRunAnalysis={runAnalysisToCanvas}
            />
          ) : (
            <>
              {surface === "today" && <Today firstName={firstName} deals={deals} actions={actions} user={user} onOpenDeal={(id, title) => setOpenDeal({ id, title })} onAsk={send} />}
              {surface === "pipeline" && <Pipeline deals={deals} onOpenDeal={(id, title) => setOpenDeal({ id, title })} onAsk={send} goSourcing={() => setSurface("sourcing")} />}
              {surface === "integration" && <Integration deals={deals} canFetch={canFetch} onOpenDeal={(id, title) => setOpenDeal({ id, title })} onAsk={send} />}
              {surface !== "today" && surface !== "pipeline" && surface !== "integration" && <SurfaceComing label={NAV.find(n => n.key === surface)!.label} onAsk={send} />}
            </>
          )}
        </main>

        <YuliaDock open={dockOpen} onToggle={() => setDockOpen(o => !o)} chat={chat} initials={initials} />
      </div>

      {/* Deal slide-over (reuses the mobile DetailScreen) */}
      {openDeal && (
        <>
          <div onClick={() => setOpenDeal(null)} style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(15,18,35,0.32)" }} />
          <aside style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 560, maxWidth: "92vw", background: "#fff", zIndex: 51, display: "flex", flexDirection: "column", overflow: "auto", boxShadow: "-24px 0 60px -30px rgba(15,18,35,0.5)" }}>
            <ChromeModeProvider mode="pane">
              <DetailScreen
                dealId={openDeal.id}
                dealTitle={openDeal.title}
                onBack={() => setOpenDeal(null)}
                onChat={() => setDockOpen(true)}
                onAskYulia={send}
                onRunAnalysis={runAnalysisToCanvas}
                onOpenTeam={(_r: number | null, t: string) => send(`Show me the deal team for ${t}.`)}
                onOpenDealFiles={() => send("Open this deal's data room.")}
              />
            </ChromeModeProvider>
          </aside>
        </>
      )}
      <ToastHost zIndex={10000} />
    </div>
  );
}

/* ── Tabbed canvas (open analyses/models; compare two side-by-side) ── */
type RunAnalysisInput = { dealId: string; dealTitle: string; analysisType: string; menuItemSlug?: string; label: string; prompt: string };
function DesktopCanvas({ tabs, activeId, compareId, onActivate, onClose, onMinimize, onSetCompare, onAsk, onOpenDeal, onRunAnalysis }: {
  tabs: CanvasTab[]; activeId: string; compareId: string | null;
  onActivate: (id: string) => void; onClose: (id: string) => void; onMinimize: () => void;
  onSetCompare: (id: string | null) => void; onAsk: (t: string) => void;
  onOpenDeal: (id: string, title: string) => void; onRunAnalysis: (i: RunAnalysisInput) => void;
}) {
  const active = tabs.find(t => t.id === activeId) ?? tabs[0];
  const compareTab = compareId ? tabs.find(t => t.id === compareId) ?? null : null;
  if (!active) return null;
  const render = (tab: CanvasTab) => tab.kind === "model"
    ? <MobileModelScreen modelTabId={tab.modelTabId} title={tab.title} onBack={() => onClose(tab.id)} onTalkToYulia={onAsk} />
    : <MobileAnalysisScreen title={tab.title} analysisRunId={tab.analysisRunId} analysisData={tab.analysisData} status={tab.status} versionNumber={tab.versionNumber} onBack={() => onClose(tab.id)} onAskYulia={onAsk} onOpenDeal={onOpenDeal} onRunDealAnalysis={onRunAnalysis} />;

  return (
    <div style={{ flex: 1, minWidth: 0, height: "100%", display: "flex", flexDirection: "column" }}>
      {/* tab strip */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", borderBottom: "1px solid rgba(60,60,67,0.08)", background: "rgba(255,255,255,0.5)", backdropFilter: GLASS_FILTER, WebkitBackdropFilter: GLASS_FILTER, flexShrink: 0, overflowX: "auto" }}>
        {tabs.map(t => {
          const on = t.id === activeId;
          const cmp = t.id === compareId;
          return (
            <div key={t.id} onClick={() => onActivate(t.id)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 10px", borderRadius: 9, cursor: "pointer", flexShrink: 0, background: on ? "#fff" : "transparent", boxShadow: on ? "0 1px 3px rgba(15,18,35,0.08), inset 0 0 0 0.5px rgba(60,60,67,0.1)" : cmp ? "inset 0 0 0 1px " + PERI : "none" }}>
              <span style={{ width: 7, height: 7, borderRadius: 2, background: t.kind === "model" ? "#6FB89A" : PERI, flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: on ? INK : MUT2, maxWidth: 180, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.title}</span>
              <button type="button" onClick={e => { e.stopPropagation(); onClose(t.id); }} aria-label="Close tab" style={{ border: "none", background: "transparent", color: FAINT, cursor: "pointer", display: "grid", placeItems: "center", padding: 0, width: 16, height: 16 }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg></button>
            </div>
          );
        })}
        <span style={{ flex: 1 }} />
        {tabs.length >= 2 && (
          <button type="button" onClick={() => onSetCompare(compareTab ? null : (tabs.find(t => t.id !== activeId)?.id ?? null))} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 11px", border: "none", borderRadius: 9, cursor: "pointer", fontSize: 12.5, fontWeight: 600, background: compareTab ? INK : "rgba(60,60,67,0.06)", color: compareTab ? "#fff" : MUT2, flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="7" height="16" rx="1.5" /><rect x="14" y="4" width="7" height="16" rx="1.5" /></svg>
            {compareTab ? "Single view" : "Compare"}
          </button>
        )}
        <button type="button" onClick={onMinimize} style={{ padding: "6px 11px", border: "none", borderRadius: 9, cursor: "pointer", fontSize: 12.5, fontWeight: 600, background: "rgba(60,60,67,0.06)", color: MUT2, flexShrink: 0 }}>Done</button>
      </div>

      {/* content */}
      <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
        <div style={{ flex: 1, minWidth: 0, position: "relative", overflow: "auto", background: "#fff" }}><ChromeModeProvider mode="pane">{render(active)}</ChromeModeProvider></div>
        {compareTab && (
          <>
            <div style={{ width: 1, background: "rgba(60,60,67,0.12)", flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", background: "#fff" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderBottom: "1px solid rgba(60,60,67,0.08)", flexShrink: 0 }}>
                <span style={{ fontFamily: MONO, fontSize: 10, color: FAINT, fontWeight: 700, letterSpacing: "0.5px" }}>COMPARE</span>
                <select value={compareId ?? ""} onChange={e => onSetCompare(e.target.value || null)} style={{ flex: 1, border: "1px solid rgba(60,60,67,0.14)", borderRadius: 8, padding: "5px 8px", fontFamily: BODY, fontSize: 12.5, color: INK, background: "#fff", cursor: "pointer" }}>
                  {tabs.filter(t => t.id !== activeId).map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                </select>
              </div>
              <div style={{ flex: 1, minHeight: 0, position: "relative", overflow: "auto" }}><ChromeModeProvider mode="pane">{render(compareTab)}</ChromeModeProvider></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── TODAY dashboard ── */
function Today({ firstName, deals, actions, user, onOpenDeal, onAsk }: {
  firstName: string; deals: ReturnType<typeof useMobileDeals>; actions: NextAction[]; user: User | null;
  onOpenDeal: (id: string, title: string) => void; onAsk: (t: string) => void;
}) {
  const featured = deals.hasData ? deals.featured : null;
  const all = deals.hasData ? deals.all : [];
  const leadRow = featured ? all.find(r => r.rawId === featured.rawId) ?? null : null;
  const { greeting, dateLabel } = useClock();
  const market = useMarketRead(user, deals.hasData);
  const [verdictFilter, setVerdictFilter] = useState<Verdict | "all">("all");

  const ledger = all.slice(0, verdictFilter === "all" ? 8 : 99).filter(r => verdictFilter === "all" || r.verdict === verdictFilter).slice(0, 6);
  const counts = useMemo(() => ({
    all: all.length,
    pursue: all.filter(r => r.verdict === "pursue").length,
    watch: all.filter(r => r.verdict === "watch").length,
    pass: all.filter(r => r.verdict === "pass").length,
  }), [all]);

  return (
    <div style={{ maxWidth: 1060, margin: "0 auto", padding: "26px 38px 60px" }}>
      {/* greeting */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, marginBottom: 22 }}>
        <div>
          <h1 style={{ fontFamily: DISP, fontWeight: 800, fontSize: 27, letterSpacing: "-0.6px", margin: 0, color: INK }}>{greeting}, {firstName}.</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 8 }}>
            {actions.length > 0 && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 11px", borderRadius: 999, background: PERI_BG, color: PERI_INK, fontSize: 12.5, fontWeight: 600 }}><Diamond s={12} c={PERI} />{actions.length} {actions.length === 1 ? "deal needs" : "deals need"} you</span>
            )}
            <span style={{ fontSize: 13, color: MUT }}>{actions.length > 0 ? actions[0].title : deals.loaded && !deals.hasData ? "No active deals yet — Yulia can source your first." : "You're all caught up."}</span>
          </div>
        </div>
        <span style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: "0.4px", color: FAINT }}>{dateLabel}</span>
      </div>

      {/* LEAD card */}
      {featured ? (
        <LeadCard featured={featured} row={leadRow} topAction={actions[0]} onOpen={() => onOpenDeal(featured.id, featured.name)} onAsk={onAsk} />
      ) : (
        <EmptyLead loaded={deals.loaded} onAsk={onAsk} />
      )}

      {/* ledger + what needs you */}
      <div style={{ display: "grid", gridTemplateColumns: "1.65fr 1fr", gap: 18, marginBottom: 24 }}>
        <section style={card}>
          <div style={{ padding: "15px 18px 13px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid rgba(60,60,67,0.07)" }}>
            <span style={eyebrow}>THE PIPELINE</span><span style={{ flex: 1 }} />
            <div style={{ display: "flex", gap: 5 }}>
              {([["all", `All ${counts.all}`], ["pursue", `Pursue ${counts.pursue}`], ["watch", `Watch ${counts.watch}`], ["pass", `Pass ${counts.pass}`]] as const).map(([k, lbl]) => {
                const on = verdictFilter === k;
                return <button key={k} type="button" onClick={() => setVerdictFilter(k as Verdict | "all")} style={{ padding: "4px 11px", border: "none", borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: "pointer", background: on ? INK : "#F2F2F7", color: on ? "#fff" : MUT2 }}>{lbl}</button>;
              })}
            </div>
          </div>
          {ledger.length === 0 ? (
            <div style={{ padding: "26px 18px", color: MUT, fontSize: 13 }}>{deals.loaded ? "No deals in this view." : "Loading your pipeline…"}</div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.7fr) 0.9fr 0.7fr 1.1fr auto", gap: 12, padding: "9px 18px", borderBottom: "1px solid rgba(60,60,67,0.06)", fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.7px", color: FAINT, fontWeight: 600 }}>
                <span>DEAL</span><span>STAGE</span><span style={{ textAlign: "right" }}>EV</span><span>FIT</span><span />
              </div>
              {ledger.map(r => <LedgerRow key={r.id} r={r} onOpen={() => onOpenDeal(r.id, r.name)} />)}
            </>
          )}
        </section>

        <section style={card}>
          <div style={{ padding: "15px 18px 13px", borderBottom: "1px solid rgba(60,60,67,0.07)" }}><span style={eyebrow}>WHAT NEEDS YOU</span></div>
          {actions.length === 0 ? (
            <div style={{ padding: "26px 18px", color: MUT, fontSize: 13 }}>{deals.loaded ? "Nothing needs you right now." : "Loading…"}</div>
          ) : actions.slice(0, 5).map((a, i) => (
            <div key={a.id} onClick={() => a.prefill ? onAsk(a.prefill) : a.dealId != null ? onOpenDeal(`deal-${a.dealId}`, a.dealName) : onAsk(a.title)} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "13px 18px", borderBottom: "1px solid rgba(60,60,67,0.05)", cursor: "pointer" }}>
              <span style={{ fontFamily: MONO, fontSize: 11, color: FAINT, marginTop: 2, width: 14, flexShrink: 0 }}>{String(i + 1).padStart(2, "0")}</span>
              <span style={{ flex: 1, minWidth: 0 }}><span style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: INK }}>{a.title}</span><span style={{ display: "block", fontSize: 12, color: MUT, marginTop: 1 }}>{a.dealName}</span></span>
              <span style={{ padding: "3px 9px", borderRadius: 999, background: a.priority >= 3 ? "#FBE9E4" : PERI_BG, color: a.priority >= 3 ? "#C0562F" : PERI_INK, fontSize: 11, fontWeight: 650, whiteSpace: "nowrap", flexShrink: 0 }}>{a.cta || "Open"}</span>
            </div>
          ))}
        </section>
      </div>

      {/* market read + activity */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 18 }}>
        <MarketRead market={market} onAsk={onAsk} />
        <Activity items={market.activity} loaded={deals.loaded} />
      </div>
    </div>
  );
}

/* ── INTEGRATION surface (native PMI — honest-empty captured, no Asana) ── */
interface PmiWorkstream { id: number; title: string; detail?: string; owner?: string; first_move?: string; status: string; pct?: number; kind?: string; label?: string }
interface PmiLever { name?: string; category?: string; target_value_cents?: number }
interface PmiPlan { id: number; horizonDays?: number; summary?: string; targetValueCents?: number | null; valueLevers?: PmiLever[]; createdAt?: string }

function useIntegrationPlan(dealId: number | null, canFetch: boolean) {
  const [data, setData] = useState<{ plan: PmiPlan | null; workstreams: PmiWorkstream[] } | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (dealId == null || !canFetch) { setData(null); return; }
    let off = false; setLoading(true);
    fetch(`/api/deals/${dealId}/integration-plan`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (!off) setData(d ? { plan: d.plan ?? null, workstreams: Array.isArray(d.workstreams) ? d.workstreams : [] } : { plan: null, workstreams: [] }); })
      .catch(() => { if (!off) setData({ plan: null, workstreams: [] }); })
      .finally(() => { if (!off) setLoading(false); });
    return () => { off = true; };
  }, [dealId, canFetch]);
  return { data, loading };
}

function Integration({ deals, canFetch, onOpenDeal, onAsk }: { deals: ReturnType<typeof useMobileDeals>; canFetch: boolean; onOpenDeal: (id: string, title: string) => void; onAsk: (t: string) => void }) {
  // "In integration" = post-close (Close/PMI stage). MobileStageRow stageId maps
  // PMI + S5/B5/R5 close gates to "close".
  const cos = (deals.hasData ? deals.all : []).filter(r => r.stageId === "close");
  const [sel, setSel] = useState(0);
  const active = cos[sel] ?? cos[0] ?? null;
  const { data: plan } = useIntegrationPlan(active ? active.rawId : null, canFetch);

  if (deals.loaded && cos.length === 0) {
    return (
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "26px 38px" }}>
        <h1 style={{ fontFamily: DISP, fontWeight: 800, fontSize: 27, letterSpacing: "-0.6px", margin: 0 }}>Integration</h1>
        <div style={{ ...card, marginTop: 22, padding: "44px 30px", textAlign: "center" }}>
          <span style={{ display: "inline-grid", placeItems: "center", width: 46, height: 46, borderRadius: 13, background: PERI_BG, marginBottom: 14 }}><Diamond s={22} c={PERI} /></span>
          <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 18, color: INK }}>No companies in integration yet</div>
          <p style={{ maxWidth: 440, color: MUT, fontSize: 14, lineHeight: 1.5, margin: "8px auto 0" }}>When you close a deal, its first-100-days value-creation plan lives here — every lever tracked to target, with Yulia keeping each one current.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "26px 38px 60px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, marginBottom: 18 }}>
        <div>
          <h1 style={{ fontFamily: DISP, fontWeight: 800, fontSize: 27, letterSpacing: "-0.6px", margin: 0 }}>Integration</h1>
          <div style={{ fontSize: 13.5, color: MUT, marginTop: 7 }}>A trackable value-creation plan — Yulia tracks each lever to target. Captured value stays an honest dash until a finance system is connected.</div>
        </div>
        <span style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: "0.4px", color: FAINT }}>{cos.length} IN INTEGRATION</span>
      </div>

      {/* company tabs */}
      {cos.length > 0 && (
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          {cos.map((c, i) => {
            const on = i === sel;
            return (
              <button key={c.id} type="button" onClick={() => setSel(i)} style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 15px", borderRadius: 14, cursor: "pointer", minWidth: 230, textAlign: "left", border: "none", background: on ? INK : "rgba(255,255,255,0.5)", backdropFilter: on ? "none" : GLASS_FILTER, WebkitBackdropFilter: on ? "none" : GLASS_FILTER, boxShadow: on ? "none" : "inset 0 0 0 0.5px rgba(60,60,67,0.12)" }}>
                <span style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, display: "grid", placeItems: "center", background: "rgba(127,140,180,0.18)", color: on ? "#fff" : INK, fontFamily: MONO, fontWeight: 700, fontSize: 12 }}>{initialsOf(c.name)}</span>
                <span style={{ minWidth: 0 }}><span style={{ display: "block", fontSize: 14, fontWeight: 600, color: on ? "#fff" : INK, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</span><span style={{ display: "block", fontSize: 12, color: on ? "rgba(255,255,255,0.7)" : MUT, marginTop: 1 }}>Post-close</span></span>
              </button>
            );
          })}
        </div>
      )}

      {active && !plan?.plan && (
        <div style={{ ...card, padding: "34px 30px", textAlign: "center" }}>
          <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 18, color: INK }}>No 100-day plan for {active.name} yet</div>
          <p style={{ maxWidth: 440, color: MUT, fontSize: 14, lineHeight: 1.5, margin: "8px auto 18px" }}>Yulia can build a value-creation plan — workstreams, owners, and illustrative value targets for the first 100 days.</p>
          <button type="button" onClick={() => onAsk(`Build the 100-day integration plan for ${active.name}.`)} style={{ padding: "10px 18px", border: "none", borderRadius: 11, background: PERI, color: "#fff", fontWeight: 700, fontSize: 13.5, cursor: "pointer" }}>Build the plan with Yulia</button>
        </div>
      )}

      {plan?.plan && <IntegrationPlan plan={plan.plan} workstreams={plan.workstreams} dealName={active?.name ?? "Deal"} onAsk={onAsk} />}
    </div>
  );
}

function IntegrationPlan({ plan, workstreams, dealName, onAsk }: { plan: PmiPlan; workstreams: PmiWorkstream[]; dealName: string; onAsk: (t: string) => void }) {
  const horizon = plan.horizonDays ?? 100;
  const created = plan.createdAt ? new Date(plan.createdAt).getTime() : Date.now();
  const dayN = Math.max(0, Math.min(horizon, Math.round((Date.now() - created) / 86400000)));
  const atRisk = workstreams.filter(w => w.kind === "warn").length;
  const done = workstreams.filter(w => w.kind === "ok" || (w.pct ?? 0) >= 100).length;
  const target = plan.targetValueCents ? fmtM(plan.targetValueCents) : "—";
  const levers = plan.valueLevers ?? [];
  const cost = levers.filter(l => l.category === "cost_synergy").reduce((s, l) => s + (l.target_value_cents || 0), 0);
  const rev = levers.filter(l => l.category === "revenue_synergy").reduce((s, l) => s + (l.target_value_cents || 0), 0);
  const risks = workstreams.filter(w => w.kind === "warn");

  return (
    <>
      {/* day bar */}
      <div style={{ ...card, borderRadius: 16, padding: "16px 18px", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 11 }}><span style={eyebrow}>{horizon}-DAY PLAN · DAY {dayN}</span><span style={{ fontSize: 12.5, color: MUT }}>Day {dayN} of {horizon} since plan created</span></div>
        <div style={{ height: 8, borderRadius: 999, background: "#ECECF1", overflow: "hidden" }}><div style={{ height: "100%", width: `${(dayN / horizon) * 100}%`, borderRadius: 999, background: "linear-gradient(90deg,#8A9AE8,#6F82DC)" }} /></div>
      </div>

      {/* KPI strip — captured + retention are honest dashes (native PMI law) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 18 }}>
        <Kpi value="—" label="Value captured (illustrative target only)" />
        <Kpi value={target} label="Value target · illustrative" />
        <Kpi value={`${done}/${workstreams.length}`} label="Workstreams on track" />
        <Kpi value={String(atRisk)} label="Initiatives at risk" />
      </div>

      {/* Yulia banner */}
      {plan.summary && (
        <div style={{ borderRadius: 16, overflow: "hidden", marginBottom: 20, border: "1px solid rgba(111,130,220,0.22)", background: "linear-gradient(180deg,#F7F8FE,#FFFFFF)", boxShadow: "0 10px 30px -20px rgba(79,96,189,0.5)", padding: "15px 17px", display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ width: 36, height: 36, borderRadius: 11, flexShrink: 0, display: "grid", placeItems: "center", background: "linear-gradient(150deg,#8A9AE8,#6F82DC)", boxShadow: "0 5px 14px -5px rgba(111,130,220,0.7)" }}><Diamond s={18} /></span>
          <div style={{ flex: 1, minWidth: 0, fontSize: 13.5, lineHeight: 1.5, color: "#283047" }}>{plan.summary}</div>
          <button type="button" onClick={() => onAsk(`Re-sequence the integration plan for ${dealName}.`)} style={{ padding: "9px 15px", border: "none", borderRadius: 10, background: "linear-gradient(150deg,#8A9AE8,#6F82DC)", color: "#fff", fontSize: 13, fontWeight: 650, cursor: "pointer", flexShrink: 0 }}>Re-sequence plan</button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: 18 }}>
        {/* initiatives (workstreams) */}
        <div>
          <div style={{ ...eyebrow, color: FAINT, marginBottom: 11 }}>VALUE-CREATION INITIATIVES</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {workstreams.map(w => {
              const st = w.kind === "warn" ? { bg: "#FBE9E4", ink: "#C0562F" } : w.kind === "ok" ? { bg: "#E6F3EC", ink: "#3F8A6A" } : { bg: "#F2F2F7", ink: MUT2 };
              return (
                <div key={w.id} style={{ ...card, borderRadius: 16, padding: "15px 17px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
                    <span style={{ flex: 1, minWidth: 0, fontSize: 14.5, fontWeight: 700, color: INK, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{w.title}</span>
                    <span style={{ padding: "3px 10px", borderRadius: 999, background: st.bg, color: st.ink, fontSize: 10.5, fontWeight: 650, whiteSpace: "nowrap" }}>{w.label || w.status}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: w.first_move ? 13 : 0 }}>
                    <span style={{ flex: 1, height: 6, borderRadius: 999, background: "#ECECF1", overflow: "hidden" }}><span style={{ display: "block", height: "100%", width: `${w.pct ?? 0}%`, borderRadius: 999, background: "linear-gradient(90deg,#6FB89A,#3F8A6A)" }} /></span>
                    <span style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 700, color: INK }}>{w.pct ?? 0}%</span>
                  </div>
                  {w.first_move && (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 12, borderTop: "1px solid rgba(60,60,67,0.06)" }}>
                      <span style={{ flex: 1, minWidth: 0, fontSize: 13, color: "#283047", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}><span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.5px", color: FAINT, fontWeight: 700 }}>NEXT</span> · {w.first_move}</span>
                      {w.owner && <span style={{ fontSize: 12, color: MUT, whiteSpace: "nowrap" }}>{w.owner}</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* value to target + risks */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ ...card, borderRadius: 16, padding: "16px 18px" }}>
            <div style={{ ...eyebrow, marginBottom: 12 }}>VALUE TO TARGET</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 7, marginBottom: 11 }}><span style={{ fontFamily: DISP, fontWeight: 800, fontSize: 30, letterSpacing: "-1px", color: INK }}>—</span><span style={{ fontSize: 13, color: MUT }}>of {target} target</span></div>
            <div style={{ fontSize: 11.5, color: FAINT, lineHeight: 1.4, marginBottom: 16 }}>Captured value needs a finance connection — targets are illustrative.</div>
            {cost > 0 && <LeverRow label="Cost" target={fmtM(cost)} />}
            {rev > 0 && <LeverRow label="Revenue" target={fmtM(rev)} />}
          </div>

          <div style={{ ...card, borderRadius: 16, padding: "16px 18px" }}>
            <div style={{ ...eyebrow, marginBottom: 12 }}>RISKS TO THE PLAN</div>
            {risks.length === 0 ? (
              <div style={{ fontSize: 12.5, color: MUT }}>No workstreams flagged at risk.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {risks.map(r => (
                  <div key={r.id} style={{ display: "flex", alignItems: "flex-start", gap: 11, padding: "11px 13px", border: "1px solid rgba(60,60,67,0.09)", borderRadius: 13 }}>
                    <span style={{ flex: 1, minWidth: 0 }}><span style={{ display: "block", fontSize: 13, fontWeight: 600, color: INK }}>{r.title}</span>{r.first_move && <span style={{ display: "block", fontSize: 11.5, color: MUT, marginTop: 2, lineHeight: 1.4 }}>{r.first_move}</span>}</span>
                    <span style={{ padding: "3px 9px", borderRadius: 999, background: "#FBE9E4", color: "#C0562F", fontSize: 10.5, fontWeight: 650, flexShrink: 0 }}>At risk</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function LeverRow({ label, target }: { label: string; target: string }) {
  const c = label === "Revenue" ? { bg: "#E6F3EC", ink: "#3F8A6A" } : { bg: PERI_BG, ink: PERI_INK };
  return (
    <div style={{ marginBottom: 13 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}><span style={{ padding: "2px 8px", borderRadius: 999, background: c.bg, color: c.ink, fontSize: 10, fontWeight: 650 }}>{label}</span><span style={{ flex: 1 }} /><span style={{ fontFamily: MONO, fontSize: 11.5, fontWeight: 700, color: INK }}>— <span style={{ color: FAINT, fontWeight: 500 }}>/ {target}</span></span></div>
      <div style={{ height: 5, borderRadius: 999, background: "#ECECF1", overflow: "hidden" }} />
    </div>
  );
}

/* ── PIPELINE surface ── */
function Pipeline({ deals, onOpenDeal, onAsk, goSourcing }: { deals: ReturnType<typeof useMobileDeals>; onOpenDeal: (id: string, title: string) => void; onAsk: (t: string) => void; goSourcing: () => void }) {
  const all = deals.hasData ? deals.all : [];
  const [stage, setStage] = useState<PipelineStageId | "all">("all");
  const rows = all.filter(r => stage === "all" || r.stageId === stage);
  const priced = all.filter(r => r.askingPrice);
  const totalAsk = priced.reduce((s, r) => s + (r.askingPrice || 0), 0);
  const realFits = all.map(r => r.fit).filter((f): f is number => typeof f === "number");
  const medianFit = realFits.length ? Math.round([...realFits].sort((a, b) => a - b)[Math.floor(realFits.length / 2)]) : null;
  const strongest = [...all].filter(r => typeof r.fit === "number").sort((a, b) => (b.fit ?? 0) - (a.fit ?? 0))[0] ?? null;
  const stageCounts = (id: PipelineStageId) => all.filter(r => r.stageId === id).length;

  if (deals.loaded && all.length === 0) {
    return (
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "26px 38px" }}>
        <h1 style={{ fontFamily: DISP, fontWeight: 800, fontSize: 27, letterSpacing: "-0.6px", margin: 0 }}>Pipeline</h1>
        <div style={{ ...card, marginTop: 22, padding: "44px 30px", textAlign: "center" }}>
          <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 18, color: INK }}>No deals in your pipeline yet</div>
          <p style={{ maxWidth: 420, color: MUT, fontSize: 14, lineHeight: 1.5, margin: "8px auto 18px" }}>Add a deal or let Yulia source one, and it shows up here across the funnel.</p>
          <button type="button" onClick={() => onAsk("Help me source my first deal.")} style={{ padding: "10px 18px", border: "none", borderRadius: 11, background: PERI, color: "#fff", fontWeight: 700, fontSize: 13.5, cursor: "pointer" }}>Source a deal with Yulia</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1060, margin: "0 auto", padding: "26px 38px 60px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: DISP, fontWeight: 800, fontSize: 27, letterSpacing: "-0.6px", margin: 0 }}>Pipeline</h1>
          <div style={{ fontSize: 13.5, color: MUT, marginTop: 7 }}>Your deals across the funnel — Yulia keeps each one current.</div>
        </div>
        <span style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: "0.4px", color: FAINT }}>{all.length} IN MOTION</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1.4fr", gap: 12, marginBottom: 20 }}>
        <Kpi value={String(all.length)} label="Deals in motion" />
        <Kpi value={priced.length ? fmtM(totalAsk) : "—"} label="Total ask" />
        <Kpi value={medianFit != null ? String(medianFit) : "—"} label="Median fit" />
        <Kpi value={strongest?.name ?? "—"} label={strongest && typeof strongest.fit === "number" ? `Strongest fit · ${strongest.fit}` : "Strongest fit"} small onClick={strongest ? () => onOpenDeal(strongest.id, strongest.name) : undefined} />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        <Chip label="All deals" n={all.length} on={stage === "all"} onTap={() => setStage("all")} />
        {PIPELINE_STAGES.map(s => <Chip key={s.id} label={s.title} n={stageCounts(s.id)} on={stage === s.id} onTap={() => setStage(s.id)} />)}
      </div>

      <section style={card}>
        <div style={{ padding: "15px 20px 13px", borderBottom: "1px solid rgba(60,60,67,0.07)" }}><span style={eyebrow}>DEALS · {stage === "all" ? "All deals" : PIPELINE_STAGES.find(s => s.id === stage)?.title}</span></div>
        {rows.length === 0 ? (
          <div style={{ padding: "26px 20px", color: MUT, fontSize: 13 }}>No deals in this stage.</div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.7fr) 0.9fr 0.7fr 1.1fr auto", gap: 12, padding: "9px 20px", borderBottom: "1px solid rgba(60,60,67,0.06)", fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.7px", color: FAINT, fontWeight: 600 }}>
              <span>DEAL</span><span>STAGE</span><span style={{ textAlign: "right" }}>ASK</span><span>FIT</span><span />
            </div>
            {rows.map(r => <LedgerRow key={r.id} r={r} onOpen={() => onOpenDeal(r.id, r.name)} />)}
          </>
        )}
      </section>

      {all.some(r => r.stageId === "source") && (
        <button type="button" onClick={goSourcing} style={{ marginTop: 14, padding: "11px 16px", border: "none", borderRadius: 12, background: "rgba(255,255,255,0.5)", backdropFilter: GLASS_FILTER, WebkitBackdropFilter: GLASS_FILTER, boxShadow: GLASS_EDGE, color: PERI_INK, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          Top-of-funnel candidates live in Sourcing — open it
        </button>
      )}
    </div>
  );
}

function Kpi({ value, label, small, onClick }: { value: string; label: string; small?: boolean; onClick?: () => void }) {
  return (
    <div onClick={onClick} style={{ ...card, borderRadius: 16, padding: "15px 17px", cursor: onClick ? "pointer" : "default" }}>
      <div style={{ fontFamily: DISP, fontWeight: small ? 700 : 800, fontSize: small ? 16 : 26, letterSpacing: small ? "-0.3px" : "-0.8px", color: INK, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{value}</div>
      <div style={{ fontSize: 12, color: MUT, marginTop: 3 }}>{label}</div>
    </div>
  );
}

function Chip({ label, n, on, onTap }: { label: string; n: number; on: boolean; onTap: () => void }) {
  return (
    <button type="button" onClick={onTap} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 14px", border: "none", borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: "pointer", background: on ? INK : "rgba(255,255,255,0.5)", color: on ? "#fff" : MUT2, boxShadow: on ? "none" : "inset 0 0 0 0.5px rgba(60,60,67,0.12)", backdropFilter: on ? "none" : GLASS_FILTER, WebkitBackdropFilter: on ? "none" : GLASS_FILTER }}>
      {label}<span style={{ fontFamily: MONO, fontSize: 11, padding: "1px 6px", borderRadius: 999, background: on ? "rgba(255,255,255,0.2)" : "rgba(60,60,67,0.08)", color: on ? "#fff" : MUT }}>{n}</span>
    </button>
  );
}

function LeadCard({ featured, row, topAction, onOpen, onAsk }: { featured: MobileFeatured; row: MobileStageRow | null; topAction?: NextAction; onOpen: () => void; onAsk: (t: string) => void }) {
  const v = VERDICT[featured.verdict];
  const ev = row?.askingPrice ? fmtM(row.askingPrice) : null;
  const earnings = row?.ebitda ?? row?.sde ?? null;
  const mult = row?.askingPrice && earnings ? (row.askingPrice / earnings).toFixed(1) + "× " + (row.ebitda ? "EBITDA" : "SDE") : null;
  const sde = row?.sde ? fmtM(row.sde) + " SDE" : null;
  return (
    <div style={{ position: "relative", borderRadius: 24, overflow: "hidden", color: "#fff", marginBottom: 24, boxShadow: "0 20px 48px -20px rgba(63,138,106,0.5), inset 0 1px 0 rgba(255,255,255,0.24)", backgroundImage: "radial-gradient(110% 120% at 10% 4%, rgba(255,255,255,0.4), rgba(255,255,255,0) 42%), radial-gradient(80% 90% at 92% 10%, rgba(150,200,172,0.55), rgba(150,200,172,0) 54%), radial-gradient(120% 130% at 70% 130%, rgba(34,84,62,0.7), rgba(34,84,62,0) 56%), linear-gradient(150deg, #5FA487 0%, #3F8A6A 52%, #2E6B52 100%)" }}>
      <div style={{ position: "relative", padding: "22px 26px 24px", display: "flex", gap: 24 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 700, letterSpacing: "1.4px", color: "rgba(255,255,255,0.92)" }}>NEEDS YOU TODAY</span>
            {topAction && <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 11px", borderRadius: 999, background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", fontSize: 11.5, fontWeight: 650 }}>{topAction.title}</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 6 }}>
            <span style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, display: "grid", placeItems: "center", background: "rgba(255,255,255,0.2)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.34)", fontFamily: MONO, fontWeight: 700, fontSize: 14 }}>{initialsOf(featured.name)}</span>
            <div>
              <div style={{ fontFamily: DISP, fontWeight: 800, fontSize: 25, letterSpacing: "-0.6px", lineHeight: 1.05 }}>{featured.name}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.88)", marginTop: 3 }}>{featured.sub}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 9, margin: "14px 0 16px" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 999, background: "rgba(255,255,255,0.22)", backdropFilter: "blur(8px)", fontSize: 12, fontWeight: 650 }}><span style={{ width: 6, height: 6, borderRadius: 999, background: "#fff" }} />{v.label}</span>
            {featured.fitIsReal && <span style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 700 }}>{featured.fit}<span style={{ fontWeight: 500, opacity: 0.85 }}> fit</span></span>}
          </div>
          <div style={{ background: "radial-gradient(circle at 16% 0%, rgba(255,255,255,0.12), transparent 44%), linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))", backdropFilter: "blur(4px)", border: "0.5px solid rgba(255,255,255,0.3)", borderRadius: 15, padding: "13px 15px", maxWidth: 480 }}>
            <div style={{ fontSize: 13.5, lineHeight: 1.55, color: "#fff" }}>{featured.revLabel}{mult ? ` · implied ${mult}` : ""}. Open the full brief for Yulia's read — <strong style={{ fontWeight: 700 }}>you decide the next move.</strong></div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 13 }}>
              <button type="button" onClick={onOpen} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", border: "none", borderRadius: 10, background: "#fff", color: "#2E6B52", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Open full brief <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></button>
              <button type="button" onClick={() => onAsk(`Draft an IOI for ${featured.name}.`)} style={ghostBtn}>Draft the IOI</button>
              <button type="button" onClick={() => onAsk(`Give me your read on ${featured.name}.`)} style={ghostBtn}>Ask Yulia</button>
            </div>
          </div>
        </div>
        <div style={{ flexShrink: 0, alignSelf: "flex-end", textAlign: "right" }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "1px", color: "rgba(255,255,255,0.85)" }}>ENTERPRISE VALUE</div>
          <div style={{ fontFamily: DISP, fontWeight: 800, fontSize: 54, letterSpacing: "-2.4px", lineHeight: 1, marginTop: 4 }}>{ev ?? "—"}</div>
          <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.9)", marginTop: 5 }}>{[mult, sde].filter(Boolean).join(" · ") || "Pricing pending"}</div>
        </div>
      </div>
    </div>
  );
}

function EmptyLead({ loaded, onAsk }: { loaded: boolean; onAsk: (t: string) => void }) {
  return (
    <div style={{ borderRadius: 24, border: "1px dashed rgba(60,60,67,0.18)", background: "#fff", padding: "34px 30px", marginBottom: 24, textAlign: "center" }}>
      <div style={{ fontFamily: DISP, fontWeight: 800, fontSize: 20, color: INK }}>{loaded ? "No deal needs you yet" : "Loading your day…"}</div>
      {loaded && <>
        <p style={{ color: MUT, fontSize: 14, lineHeight: 1.5, maxWidth: 420, margin: "8px auto 16px" }}>When you add or source a deal, the one that needs you most lands here with Yulia's read.</p>
        <button type="button" onClick={() => onAsk("Help me source my first deal.")} style={{ padding: "10px 18px", border: "none", borderRadius: 11, background: PERI, color: "#fff", fontWeight: 700, fontSize: 13.5, cursor: "pointer" }}>Source a deal with Yulia</button>
      </>}
    </div>
  );
}

function LedgerRow({ r, onOpen }: { r: MobileStageRow; onOpen: () => void }) {
  const v = VERDICT[r.verdict];
  const ev = r.askingPrice ? fmtM(r.askingPrice) : "—";
  const fit = typeof r.fit === "number" ? r.fit : null;
  return (
    <div onClick={onOpen} style={{ display: "grid", gridTemplateColumns: "minmax(0,1.7fr) 0.9fr 0.7fr 1.1fr auto", gap: 12, alignItems: "center", padding: "12px 18px", borderBottom: "1px solid rgba(60,60,67,0.05)", cursor: "pointer" }}>
      <span style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
        <span style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, display: "grid", placeItems: "center", background: v.bg, color: v.ink, fontFamily: MONO, fontWeight: 700, fontSize: 11 }}>{initialsOf(r.name)}</span>
        <span style={{ minWidth: 0 }}><span style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: INK, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.name}</span><span style={{ display: "block", fontSize: 11.5, color: MUT, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.sub}</span></span>
      </span>
      <span style={{ fontSize: 12.5, color: MUT2 }}>{r.gate}</span>
      <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, color: INK, textAlign: "right" }}>{ev}</span>
      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ flex: 1, height: 5, borderRadius: 999, background: "#ECECF1", overflow: "hidden" }}>{fit != null && <span style={{ display: "block", height: "100%", width: `${fit}%`, borderRadius: 999, background: "linear-gradient(90deg,#8A9AE8,#6F82DC)" }} />}</span>
        <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: fit != null ? INK : FAINT, width: 18, textAlign: "right" }}>{fit ?? "—"}</span>
      </span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 999, background: v.bg, color: v.ink, fontSize: 11, fontWeight: 650, whiteSpace: "nowrap" }}><span style={{ width: 5, height: 5, borderRadius: 999, background: v.dot }} />{v.label}</span>
    </div>
  );
}

function MarketRead({ market, onAsk }: { market: ReturnType<typeof useMarketRead>; onAsk: (t: string) => void }) {
  const mi = market.intel;
  return (
    <section style={{ position: "relative", borderRadius: 20, overflow: "hidden", color: "#F4FAFF", boxShadow: "0 16px 40px -18px rgba(24,72,105,0.5), inset 0 1px 0 rgba(255,255,255,0.2)", backgroundImage: "radial-gradient(110% 90% at 10% 4%, rgba(255,255,255,0.16), rgba(255,255,255,0) 44%), linear-gradient(160deg, #3F6E86 0%, #2C5570 52%, #1C3C56 100%)" }}>
      <div style={{ position: "relative", padding: "18px 20px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 13 }}>
          <span style={{ width: 22, height: 22, borderRadius: 7, display: "grid", placeItems: "center", background: "rgba(255,255,255,0.18)" }}><Diamond s={13} /></span>
          <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: "1.2px", color: "rgba(255,255,255,0.9)" }}>MARKET READ · YULIA</span>
        </div>
        {mi ? (
          <>
            <h3 style={{ fontFamily: DISP, fontWeight: 800, fontSize: 19, letterSpacing: "-0.4px", lineHeight: 1.22, margin: 0 }}>{mi.headline}</h3>
            {mi.subhead && <p style={{ fontSize: 13, lineHeight: 1.5, color: "#DCEAF4", margin: "9px 0 0" }}>{mi.subhead}</p>}
            {Array.isArray(mi.bullets) && mi.bullets.length > 0 && (
              <div style={{ marginTop: 15, borderRadius: 13, overflow: "hidden", background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))", border: "0.5px solid rgba(255,255,255,0.22)" }}>
                {mi.bullets.slice(0, 3).map((b, i) => (
                  <div key={i} style={{ display: "flex", gap: 11, padding: "11px 14px", borderBottom: i < Math.min(3, mi.bullets!.length) - 1 ? "0.5px solid rgba(255,255,255,0.12)" : "none" }}><span style={{ fontFamily: MONO, fontSize: 10, color: "#fff", opacity: 0.7 }}>{String(i + 1).padStart(2, "0")}</span><span style={{ fontSize: 12.5, lineHeight: 1.45 }}>{typeof b === "string" ? b : (b as { text?: string }).text}</span></div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <h3 style={{ fontFamily: DISP, fontWeight: 800, fontSize: 18, letterSpacing: "-0.4px", lineHeight: 1.25, margin: 0 }}>No market read yet.</h3>
            <p style={{ fontSize: 13, lineHeight: 1.5, color: "#DCEAF4", margin: "9px 0 14px" }}>Ask Yulia for a read on your pipeline and the market it sits in.</p>
            <button type="button" onClick={() => onAsk("Give me a market read across my pipeline.")} style={{ padding: "8px 14px", border: "1px solid rgba(255,255,255,0.4)", borderRadius: 10, background: "rgba(255,255,255,0.12)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Ask for the read</button>
          </>
        )}
      </div>
    </section>
  );
}

function Activity({ items, loaded }: { items: { text: string; when: string; dot: string }[]; loaded: boolean }) {
  return (
    <section style={card}>
      <div style={{ padding: "15px 18px 13px", borderBottom: "1px solid rgba(60,60,67,0.07)" }}><span style={eyebrow}>RECENT ACTIVITY</span></div>
      {items.length === 0 ? (
        <div style={{ padding: "22px 18px", color: MUT, fontSize: 13 }}>{loaded ? "Nothing filed yet." : "Loading…"}</div>
      ) : (
        <div style={{ padding: "6px 18px 10px" }}>
          {items.slice(0, 4).map((it, i) => (
            <div key={i} style={{ display: "flex", gap: 12, padding: "11px 0", borderBottom: i < Math.min(4, items.length) - 1 ? "1px solid rgba(60,60,67,0.05)" : "none" }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: it.dot, marginTop: 5, flexShrink: 0 }} />
              <span style={{ flex: 1 }}><span style={{ display: "block", fontSize: 13, color: INK, lineHeight: 1.4 }}>{it.text}</span><span style={{ fontFamily: MONO, fontSize: 10.5, color: FAINT }}>{it.when}</span></span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ── YULIA DOCK ── */
function YuliaDock({ open, onToggle, chat, initials }: { open: boolean; onToggle: () => void; chat: MobileChatBridge; initials: string }) {
  const [draft, setDraft] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);
  const working = chat.sending || !!chat.activeTool;
  const trace = chat.toolTrace ?? [];
  const submit = () => { const t = draft.trim(); if (!t) return; chat.send(t); setDraft(""); };
  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } };

  if (!open) {
    return (
      <aside style={{ width: 58, flexShrink: 0, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "16px 0", background: DOCK_BG, backdropFilter: DOCK_FILTER, WebkitBackdropFilter: DOCK_FILTER, borderLeft: "1px solid rgba(255,255,255,0.5)" }}>
        <button type="button" onClick={onToggle} aria-label="Expand Yulia" style={{ width: 38, height: 38, border: "none", borderRadius: 11, cursor: "pointer", display: "grid", placeItems: "center", background: "linear-gradient(150deg,#8A9AE8,#6F82DC)", boxShadow: "0 5px 14px -5px rgba(111,130,220,0.7), inset 0 1px 0 rgba(255,255,255,0.4)" }}><Diamond s={19} /></button>
        <span style={{ width: 7, height: 7, borderRadius: 999, background: PERI, animation: working ? "yp 1.3s ease-in-out infinite" : "none" }} />
        <span style={{ writingMode: "vertical-rl", fontSize: 11, fontWeight: 600, color: MUT, letterSpacing: "0.3px" }}>Yulia{working ? " · working" : ""}</span>
      </aside>
    );
  }

  return (
    <aside style={{ width: 328, flexShrink: 0, height: "100%", display: "flex", flexDirection: "column", background: DOCK_BG, backdropFilter: DOCK_FILTER, WebkitBackdropFilter: DOCK_FILTER, borderLeft: "1px solid rgba(255,255,255,0.5)" }}>
      <div style={{ padding: "16px 18px 14px", display: "flex", alignItems: "center", gap: 11, borderBottom: "1px solid rgba(60,60,67,0.08)" }}>
        <span style={{ width: 34, height: 34, borderRadius: 11, flexShrink: 0, display: "grid", placeItems: "center", background: "linear-gradient(150deg,#8A9AE8,#6F82DC)", boxShadow: "0 5px 14px -5px rgba(111,130,220,0.7), inset 0 1px 0 rgba(255,255,255,0.4)" }}><Diamond s={18} /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: INK }}>Yulia</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}><span style={{ width: 6, height: 6, borderRadius: 999, background: working ? PERI : "#C4CBD6", animation: working ? "yp 1.3s ease-in-out infinite" : "none" }} /><span style={{ fontSize: 11.5, color: working ? PERI : MUT, fontWeight: 600 }}>{working ? "working…" : "ready"}</span></div>
        </div>
        <button type="button" onClick={onToggle} aria-label="Collapse Yulia" style={{ width: 28, height: 28, flexShrink: 0, border: "none", borderRadius: 8, background: "transparent", color: MUT, display: "grid", placeItems: "center", cursor: "pointer" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6" /></svg></button>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
        {(working || trace.length > 0) && (
          <>
            <div style={{ fontFamily: MONO, fontSize: 9.5, fontWeight: 700, letterSpacing: "1px", color: FAINT, marginBottom: 10 }}>CURRENT WORK</div>
            <div style={{ border: "1px solid rgba(60,60,67,0.09)", borderRadius: 14, background: "#fff", boxShadow: "0 1px 3px rgba(15,18,35,0.04)", padding: "5px 6px", marginBottom: 18 }}>
              {trace.map((t, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "9px 10px" }}>
                  <span style={{ width: 17, height: 17, borderRadius: 999, flexShrink: 0, marginTop: 1, display: "grid", placeItems: "center", background: "#E6F3EC" }}><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#3F8A6A" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 6" /></svg></span>
                  <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 600, color: INK }}>{prettyTool(t.tool)}</span>
                </div>
              ))}
              {working && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "9px 10px", borderRadius: 10, background: "#F7F8FE" }}>
                  <span style={{ width: 17, height: 17, borderRadius: 999, flexShrink: 0, marginTop: 1, border: "2px solid #C7D0F4", borderTopColor: PERI, animation: "spin .8s linear infinite" }} />
                  <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 600, color: INK }}>{chat.activeTool ? prettyTool(chat.activeTool) : "Working…"}</span>
                </div>
              )}
            </div>
          </>
        )}

        {chat.thread.length > 0 ? (
          <>
            <div style={{ fontFamily: MONO, fontSize: 9.5, fontWeight: 700, letterSpacing: "1px", color: FAINT, marginBottom: 10 }}>CONVERSATION</div>
            {chat.thread.map((m, i) => (
              <div key={i} className="fup" style={{ display: "flex", gap: 9, marginBottom: 13 }}>
                {m.who === "u"
                  ? <span style={{ width: 24, height: 24, borderRadius: 999, flexShrink: 0, display: "grid", placeItems: "center", background: "linear-gradient(150deg,#B7C0EC,#8A9AE8)", color: "#2C357A", fontWeight: 700, fontSize: 9.5 }}>{initials}</span>
                  : <span style={{ width: 24, height: 24, borderRadius: 8, flexShrink: 0, display: "grid", placeItems: "center", background: "linear-gradient(150deg,#8A9AE8,#6F82DC)" }}><Diamond s={13} /></span>}
                <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, lineHeight: 1.5, color: "#283047", paddingTop: 3, whiteSpace: "pre-wrap" }}>{m.text}{m.who === "y" && i === chat.thread.length - 1 && chat.streamingText ? chat.streamingText : ""}</span>
              </div>
            ))}
          </>
        ) : !working && (
          <div style={{ textAlign: "center", color: MUT, fontSize: 12.5, lineHeight: 1.5, padding: "30px 12px" }}>
            <span style={{ display: "inline-grid", placeItems: "center", width: 40, height: 40, borderRadius: 12, background: "#fff", border: "1px solid rgba(111,130,220,0.2)", marginBottom: 10 }}><Diamond s={20} c={PERI} /></span>
            <div>Ask Yulia anything about your deals, the market, or what to do next.</div>
          </div>
        )}
      </div>

      <div style={{ padding: "12px 14px 16px", borderTop: "1px solid rgba(60,60,67,0.08)" }}>
        <div style={{ border: "1px solid rgba(60,60,67,0.12)", borderRadius: 15, background: "#fff", boxShadow: "0 2px 6px rgba(15,18,35,0.05)", padding: 5 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
            <textarea ref={taRef} value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={onKey} rows={1} placeholder="Ask Yulia…" style={{ flex: 1, minWidth: 0, border: "none", outline: "none", resize: "none", background: "transparent", fontFamily: BODY, fontSize: 13.5, lineHeight: 1.45, color: INK, padding: "9px 4px 7px 9px", maxHeight: 110 }} />
            <button type="button" onClick={submit} aria-label="Send" style={{ width: 32, height: 32, flexShrink: 0, border: "none", borderRadius: 11, background: "linear-gradient(150deg,#8A9AE8,#6F82DC)", display: "grid", placeItems: "center", cursor: "pointer" }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg></button>
          </div>
        </div>
        <div style={{ fontSize: 10.5, color: FAINT, marginTop: 8, lineHeight: 1.4, textAlign: "center" }}>Analysis &amp; implications — Yulia asks before anything irreversible.</div>
      </div>
    </aside>
  );
}

function SurfaceComing({ label, onAsk }: { label: string; onAsk: (t: string) => void }) {
  return (
    <div style={{ maxWidth: 1060, margin: "0 auto", padding: "26px 38px" }}>
      <h1 style={{ fontFamily: DISP, fontWeight: 800, fontSize: 27, letterSpacing: "-0.6px", margin: 0, color: INK }}>{label}</h1>
      <div style={{ marginTop: 22, border: "1px solid " + LINE, borderRadius: 18, background: "#fff", padding: "44px 30px", textAlign: "center", boxShadow: "0 1px 3px rgba(15,18,35,0.04)" }}>
        <span style={{ display: "inline-grid", placeItems: "center", width: 46, height: 46, borderRadius: 13, background: PERI_BG, marginBottom: 14 }}><Diamond s={22} c={PERI} /></span>
        <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 18, color: INK }}>{label} lands next</div>
        <p style={{ maxWidth: 420, color: MUT, fontSize: 14, lineHeight: 1.5, margin: "8px auto 18px" }}>This surface is being built on the same backend the mobile app already uses. Yulia can do it from chat in the meantime.</p>
        <button type="button" onClick={() => onAsk(`Help me with ${label.toLowerCase()}.`)} style={{ padding: "10px 18px", border: "none", borderRadius: 11, background: PERI, color: "#fff", fontWeight: 700, fontSize: 13.5, cursor: "pointer" }}>Ask Yulia about {label}</button>
      </div>
    </div>
  );
}

/* ── data + helpers ── */
function useMarketRead(user: User | null, hasData: boolean) {
  const [intel, setIntel] = useState<{ headline: string; subhead?: string; bullets?: (string | { text?: string })[] } | null>(null);
  const [activity, setActivity] = useState<{ text: string; when: string; dot: string }[]>([]);
  useEffect(() => {
    if (!user || DEV_AUTH_BYPASS || !hasData) { setIntel(null); setActivity([]); return; }
    let off = false;
    fetch("/api/agency/portfolio-brief", { headers: authHeaders() }).then(r => r.ok ? r.json() : null).then(d => { if (!off && d?.marketIntelligence?.headline) setIntel(d.marketIntelligence); }).catch(() => {});
    fetch("/api/deliverables/all", { headers: authHeaders() }).then(r => r.ok ? r.json() : []).then((d: { name?: string; deal_name?: string; status?: string; created_at?: string }[]) => {
      if (off || !Array.isArray(d)) return;
      setActivity(d.slice(0, 4).map(x => ({ text: `${x.status === "complete" ? "Deliverable ready" : "In progress"} · ${x.name || "Document"}${x.deal_name ? " — " + x.deal_name : ""}`, when: relTime(x.created_at), dot: x.status === "complete" ? "#6FB89A" : "#8A9AE8" })));
    }).catch(() => {});
    return () => { off = true; };
  }, [user?.id, hasData]);
  return { intel, activity };
}

function useClock() {
  const [now] = useState(() => new Date());
  const h = now.getHours();
  const greeting = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  const dateLabel = now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).toUpperCase().replace(",", " ·");
  return { greeting, dateLabel };
}

function useCdFonts() {
  useEffect(() => {
    const id = "cd-desktop-fonts";
    if (document.getElementById(id)) return;
    const l = document.createElement("link");
    l.id = id; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap";
    document.head.appendChild(l);
  }, []);
}

function relTime(iso?: string): string {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "";
  const mins = Math.max(0, Math.round((Date.now() - t) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}
function fmtM(cents: number): string {
  const d = cents / 100;
  if (d >= 1e9) return `$${(d / 1e9).toFixed(1)}B`;
  if (d >= 1e6) return `$${(d / 1e6).toFixed(d >= 1e7 ? 0 : 1)}M`;
  if (d >= 1e3) return `$${Math.round(d / 1e3)}K`;
  return `$${Math.round(d)}`;
}
function initialsOf(name: string): string { const p = name.replace(/[^a-zA-Z0-9 ]/g, "").split(/\s+/).filter(Boolean); return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase() || "··"; }
function initialsFor(user: User | null): string { if (!user) return "JM"; const src = user.display_name?.trim() || user.email; const p = src.split(/[\s@.]+/).filter(Boolean); return (p.length >= 2 ? p[0][0] + p[1][0] : src.slice(0, 2)).toUpperCase(); }
function prettyTool(t: string): string { return (t || "Working").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()); }

/* Liquid Glass — same material the mobile app uses (glass.tsx): translucent
   white + blur + saturate + the layered inset edge-highlights. Reads as glass
   only because it refracts the lavender AMBIENT behind it. */
const GLASS_EDGE = "inset 0 0 0 0.5px rgba(255,255,255,0.7), inset 0 1px 0 rgba(255,255,255,0.66), inset 0 -1px 0 rgba(255,255,255,0.16)";
const GLASS_FILTER = "blur(22px) saturate(185%) brightness(1.05)";
const card: CSSProperties = {
  borderRadius: 18,
  background: "rgba(255,255,255,0.58)",
  backdropFilter: GLASS_FILTER, WebkitBackdropFilter: GLASS_FILTER,
  boxShadow: `${GLASS_EDGE}, 0 1px 3px rgba(15,18,35,0.04), 0 18px 40px -20px rgba(40,48,90,0.24)`,
  overflow: "hidden",
};
/* Soft lavender wash + two periwinkle glows — gives the glass something to
   bend. Quiet per CLAUDE.md; on the main's own padding box so it sits still
   behind the scrolling cards (no position:fixed bg div — Safari toolbar rule). */
const AMBIENT = "radial-gradient(78% 56% at 88% 6%, rgba(138,154,232,0.16), transparent 55%), radial-gradient(72% 70% at 4% 102%, rgba(111,130,220,0.14), transparent 58%), linear-gradient(180deg, #F6F7FC 0%, #EDEFFA 58%, #E6EAF7 100%)";
const eyebrow: CSSProperties = { fontFamily: MONO, fontSize: 10.5, fontWeight: 700, letterSpacing: "1.2px", color: INK };
const ghostBtn: CSSProperties = { padding: "8px 14px", border: "1px solid rgba(255,255,255,0.4)", borderRadius: 10, background: "rgba(255,255,255,0.1)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" };
const acctItem: CSSProperties = { display: "block", width: "100%", textAlign: "left", padding: 10, border: "none", borderTop: "1px solid rgba(60,60,67,0.07)", background: "transparent", cursor: "pointer", fontFamily: BODY, fontSize: 14, color: INK };
