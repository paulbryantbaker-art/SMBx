import { lazy, Suspense, type CSSProperties } from "react";
import type { Tab, OpenTab, ModeId } from "./types";
import type { User } from "../../hooks/useAuth";
import type { ModelPreference } from "../../lib/modelPreference";
import type { WkTheme } from "../../lib/wkTheme";

const V6TodayRoot = lazy(() => import("./modes/TodayRoot").then(module => ({ default: module.V6TodayRoot })));
const V6PipelineRoot = lazy(() => import("./modes/PipelineRoot").then(module => ({ default: module.V6PipelineRoot })));
const V6FilesRoot = lazy(() => import("./modes/FilesRoot").then(module => ({ default: module.V6FilesRoot })));
const V6FilesListView = lazy(() => import("./modes/FilesRoot").then(module => ({ default: module.V6FilesListView })));
const V6DealsListView = lazy(() => import("./modes/DealsListView").then(module => ({ default: module.V6DealsListView })));
const V6ProviderProfileView = lazy(() => import("./modes/ProviderProfileView").then(module => ({ default: module.V6ProviderProfileView })));
const V6SearchRoot = lazy(() => import("./modes/SearchRoot").then(module => ({ default: module.V6SearchRoot })));
const V6DocsRoot = lazy(() => import("./modes/DocsRoot").then(module => ({ default: module.V6DocsRoot })));
const V6AnalysisRoot = lazy(() => import("./modes/AnalysisRoot").then(module => ({ default: module.V6AnalysisRoot })));
const V6IntelRoot = lazy(() => import("./modes/IntelRoot").then(module => ({ default: module.V6IntelRoot })));
const V6LibraryRoot = lazy(() => import("./modes/LibraryRoot").then(module => ({ default: module.V6LibraryRoot })));
const V6DealView = lazy(() => import("./views/DealView").then(module => ({ default: module.V6DealView })));
const V6DealTeamView = lazy(() => import("./views/DealTeamView").then(module => ({ default: module.V6DealTeamView })));
const V6DocView = lazy(() => import("./views/DocView").then(module => ({ default: module.V6DocView })));
const V6AnalysisView = lazy(() => import("./views/AnalysisView").then(module => ({ default: module.V6AnalysisView })));
const V6ModelCanvasView = lazy(() => import("./views/ModelCanvasView").then(module => ({ default: module.V6ModelCanvasView })));
const V6SettingsView = lazy(() => import("./views/SettingsView").then(module => ({ default: module.V6SettingsView })));
const V6HistoryView = lazy(() => import("./views/HistoryView").then(module => ({ default: module.V6HistoryView })));
const V6StarterView = lazy(() => import("./views/StarterView").then(module => ({ default: module.V6StarterView })));
const V6LearnView = lazy(() => import("./Learn").then(module => ({ default: module.V6LearnView })));
const V6MarketingStudioView = lazy(() => import("./views/MarketingStudioView").then(module => ({ default: module.V6MarketingStudioView })));

interface CanvasProps {
  tabs: Tab[];
  activeTabId: string;
  setActiveTabId: (id: string) => void;
  openTab: OpenTab;
  closeTab: (id: string) => void;
  reorderTabs: (dragId: string, targetId: string) => void;
  onPickMode: (id: ModeId) => void;
  onTalkToYulia?: (prompt: string) => void;
  user: User | null;
  onSignOut: () => void;
  modelPreference?: ModelPreference;
  /* Workspace chrome theme (Settings → Appearance). */
  wkTheme?: WkTheme;
  onSetWkTheme?: (t: WkTheme) => void;
  /* Conversation-history seam — see HistoryView. Resume must route through
     the live chat bridge, not a fresh fetch. chatBusy mirrors chat.sending:
     switching or deleting the active thread mid-stream corrupts the panel,
     so HistoryView disables those rows while Yulia is replying. */
  activeConversationId?: number | null;
  chatBusy?: boolean;
  onResumeConversation?: (id: number) => void;
  onConversationDeleted?: (id: number) => void;
}

export function V6Canvas({ tabs, activeTabId, openTab, onPickMode, onTalkToYulia, user, onSignOut, modelPreference, wkTheme, onSetWkTheme, activeConversationId, chatBusy, onResumeConversation, onConversationDeleted }: CanvasProps) {
  const activeTab = tabs.find(t => t.id === activeTabId) ?? tabs[0];
  // The open-tabs strip lives in the left nav ("Open" section) now, so the
  // canvas is pure content: just the active tab's body at full height.

  return (
    <div style={K.canvas}>
      <div className="thin-scroll v6-canvas-scroll" style={K.canvasBody}>
        {activeTab && (
          <Suspense fallback={<CanvasContentLoader />}>
            <V6TabContent
              tab={activeTab}
              openTab={openTab}
              onPickMode={onPickMode}
              onTalkToYulia={onTalkToYulia}
              user={user}
              onSignOut={onSignOut}
              modelPreference={modelPreference}
              wkTheme={wkTheme}
              onSetWkTheme={onSetWkTheme}
              activeConversationId={activeConversationId}
              chatBusy={chatBusy}
              onResumeConversation={onResumeConversation}
              onConversationDeleted={onConversationDeleted}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}

interface TabContentProps {
  tab: Tab;
  openTab: OpenTab;
  onPickMode: (id: ModeId) => void;
  onTalkToYulia?: (prompt: string) => void;
  user: User | null;
  onSignOut: () => void;
  modelPreference?: ModelPreference;
  wkTheme?: WkTheme;
  onSetWkTheme?: (t: WkTheme) => void;
  activeConversationId?: number | null;
  chatBusy?: boolean;
  onResumeConversation?: (id: number) => void;
  onConversationDeleted?: (id: number) => void;
}

function V6TabContent({ tab, openTab, onTalkToYulia, user, onSignOut, modelPreference, wkTheme, onSetWkTheme, activeConversationId, chatBusy, onResumeConversation, onConversationDeleted }: TabContentProps) {
  if (tab.kind === "mode-root") {
    if (tab.modeId === "today")    return <V6TodayRoot openTab={openTab} onTalkToYulia={onTalkToYulia} user={user} />;
    if (tab.modeId === "pipeline") return <V6PipelineRoot openTab={openTab} onTalkToYulia={onTalkToYulia} user={user} modelPreference={modelPreference} />;
    if (tab.modeId === "search")   return <V6SearchRoot openTab={openTab} onTalkToYulia={onTalkToYulia} user={user} />;
    if (tab.modeId === "studio")   return <V6MarketingStudioView tab={{ id: "marketing-studio", kind: "marketing-studio", title: "Studio", studioView: "home" }} openTab={openTab} user={user} onTalkToYulia={onTalkToYulia} />;
    if (tab.modeId === "files")    return <V6FilesRoot openTab={openTab} onTalkToYulia={onTalkToYulia} user={user} />;
    if (tab.modeId === "docs")     return <V6DocsRoot openTab={openTab} onTalkToYulia={onTalkToYulia} user={user} modelPreference={modelPreference} />;
    if (tab.modeId === "analysis") return <V6AnalysisRoot openTab={openTab} onTalkToYulia={onTalkToYulia} user={user} modelPreference={modelPreference} />;
    if (tab.modeId === "intel")    return <V6IntelRoot openTab={openTab} onTalkToYulia={onTalkToYulia} />;
    if (tab.modeId === "library")  return <V6LibraryRoot openTab={openTab} onTalkToYulia={onTalkToYulia} user={user} />;
    return <Placeholder label={`${tab.title} — root view`} note="Unknown mode root." />;
  }
  if (tab.kind === "files-list") return <V6FilesListView view={tab.fileListView ?? "all"} openTab={openTab} onTalkToYulia={onTalkToYulia} user={user} />;
  if (tab.kind === "deals-list") return <V6DealsListView view={tab.dealsListView ?? "all"} initialStage={tab.dealsStage} openTab={openTab} onTalkToYulia={onTalkToYulia} user={user} />;
  if (tab.kind === "provider-profile") return <V6ProviderProfileView user={user} />;
  if (tab.kind === "deal")     return <V6DealView id={tab.id} title={tab.title} openTab={openTab} fileScope={tab.fileScope} onTalkToYulia={onTalkToYulia} modelPreference={modelPreference} user={user} />;
  if (tab.kind === "deal-team") return <V6DealTeamView dealId={String(tab.dealId ?? tab.id)} dealTitle={tab.dealTitle ?? tab.title} openTab={openTab} onTalkToYulia={onTalkToYulia} user={user} />;
  if (tab.kind === "doc")      return <V6DocView id={tab.id} title={tab.title} openTab={openTab} modelPreference={modelPreference} onTalkToYulia={onTalkToYulia} />;
  if (tab.kind === "analysis") return <V6AnalysisView title={tab.title} tool={tab.tool} markdown={tab.markdown} comparisonData={tab.comparisonData} analysisData={tab.analysisData} artifactData={tab.artifactData} analysisRunId={tab.analysisRunId} deliverableId={tab.deliverableId} status={tab.status} versionNumber={tab.versionNumber} resolvedMenuItemSlug={tab.resolvedMenuItemSlug} openTab={openTab} onTalkToYulia={onTalkToYulia} />;
  if (tab.kind === "model")    return <V6ModelCanvasView tabId={tab.modelTabId ?? tab.id} title={tab.title} onTalkToYulia={onTalkToYulia} />;
  if (tab.kind === "feed-item") return <Placeholder label={`Feed · ${tab.title}`} note="Feed item reading view is a thin wrapper — coming after polish." />;
  if (tab.kind === "learn")    return <V6LearnView section={tab.section} anchor={tab.anchor} onTalkToYulia={onTalkToYulia} />;
  if (tab.kind === "marketing-studio") return <V6MarketingStudioView tab={tab} openTab={openTab} user={user} onTalkToYulia={onTalkToYulia} />;
  if (tab.kind === "settings") return <V6SettingsView user={user} onSignOut={onSignOut} wkTheme={wkTheme} onSetWkTheme={onSetWkTheme} />;
  if (tab.kind === "history")  return <V6HistoryView user={user} activeConversationId={activeConversationId} busy={chatBusy} onResume={onResumeConversation} onDeleted={onConversationDeleted} />;
  if (tab.kind === "starter")  return <V6StarterView onTalkToYulia={onTalkToYulia} />;
  return <Placeholder label="Unknown tab" />;
}

function Placeholder({ label, note }: { label: string; note?: string }) {
  return (
    <div className="wk-content m-fade-up" style={{ maxWidth: 720 }}>
      <h1 style={{
        fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24,
        letterSpacing: "-0.025em", margin: "4px 0 8px", color: "var(--ink)",
      }}>{label}</h1>
      {note && <p style={{ fontSize: 13, color: "var(--ink-2)", margin: 0 }}>{note}</p>}
    </div>
  );
}

function CanvasContentLoader() {
  return (
    <div style={K.loader}>
      <div style={K.loaderPulse} />
      <div>
        <div style={K.loaderTitle}>Loading workspace</div>
        <div style={K.loaderSub}>Preparing this surface...</div>
      </div>
    </div>
  );
}

const K: Record<string, CSSProperties> = {
  canvas: {
    background: "var(--surface)",
    display: "flex", flexDirection: "column", flex: 1, minWidth: 0,
    minHeight: 0, width: "100%", height: "100%",
    borderRadius: "inherit",
    overflow: "hidden",
  },
  canvasBody: {
    flex: 1, overflowY: "auto",
    padding: "28px 40px 56px",
    width: "100%",
    boxSizing: "border-box",
  },
  loader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    color: "#8B867A",
    minHeight: 220,
    background: "transparent",
  },
  loaderPulse: {
    width: 10,
    height: 10,
    borderRadius: 999,
    background: "#2BFF77",
    boxShadow: "0 0 0 6px rgba(43,255,119,0.14)",
  },
  loaderTitle: {
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: 14,
    color: "#191813",
  },
  loaderSub: {
    fontSize: 12,
    marginTop: 2,
    color: "#8B867A",
  },
};
