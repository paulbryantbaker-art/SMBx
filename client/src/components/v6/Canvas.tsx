import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import type { Tab, OpenTab, ModeId } from "./types";
import type { User } from "../../hooks/useAuth";
import type { ModelPreference } from "../../lib/modelPreference";
import { V6TodayRoot } from "./modes/TodayRoot";
import { V6PipelineRoot } from "./modes/PipelineRoot";
import { V6FilesListView, V6FilesRoot } from "./modes/FilesRoot";
import { V6SearchRoot } from "./modes/SearchRoot";
import { V6DocsRoot } from "./modes/DocsRoot";
import { V6AnalysisRoot } from "./modes/AnalysisRoot";
import { V6IntelRoot } from "./modes/IntelRoot";
import { V6LibraryRoot } from "./modes/LibraryRoot";
import { V6DealView } from "./views/DealView";
import { V6DocView } from "./views/DocView";
import { V6AnalysisView } from "./views/AnalysisView";
import { V6SettingsView } from "./views/SettingsView";
import { V6HistoryView } from "./views/HistoryView";
import { V6StarterView } from "./views/StarterView";
import { V6LearnView } from "./Learn";
import { V6MarketingStudioView } from "./views/MarketingStudioView";

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
}

export function V6Canvas({ tabs, activeTabId, openTab, onPickMode, onTalkToYulia, user, onSignOut, modelPreference }: CanvasProps) {
  const activeTab = tabs.find(t => t.id === activeTabId) ?? tabs[0];
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    let settleTimer = 0;
    const onScroll = () => {
      node.classList.add("is-scrolling");
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => node.classList.remove("is-scrolling"), 140);
    };
    node.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(settleTimer);
      node.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div style={K.canvas}>
      <div ref={scrollRef} className="thin-scroll v6-canvas-scroll" style={K.canvasBody}>
        {activeTab && (
          <V6TabContent
            tab={activeTab}
            openTab={openTab}
            onPickMode={onPickMode}
            onTalkToYulia={onTalkToYulia}
            user={user}
            onSignOut={onSignOut}
            modelPreference={modelPreference}
          />
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
}

function V6TabContent({ tab, openTab, onTalkToYulia, user, onSignOut, modelPreference }: TabContentProps) {
  if (tab.kind === "mode-root") {
    if (tab.modeId === "today")    return <V6TodayRoot openTab={openTab} onTalkToYulia={onTalkToYulia} user={user} />;
    if (tab.modeId === "pipeline") return <V6PipelineRoot openTab={openTab} onTalkToYulia={onTalkToYulia} user={user} modelPreference={modelPreference} />;
    if (tab.modeId === "search")   return <V6SearchRoot openTab={openTab} onTalkToYulia={onTalkToYulia} user={user} />;
    if (tab.modeId === "studio")   return <V6MarketingStudioView tab={{ id: "marketing-studio", kind: "marketing-studio", title: "Studio", studioView: "home" }} openTab={openTab} user={user} onTalkToYulia={onTalkToYulia} />;
    if (tab.modeId === "files")    return <V6FilesRoot openTab={openTab} onTalkToYulia={onTalkToYulia} user={user} />;
    if (tab.modeId === "docs")     return <V6DocsRoot openTab={openTab} onTalkToYulia={onTalkToYulia} user={user} modelPreference={modelPreference} />;
    if (tab.modeId === "analysis") return <V6AnalysisRoot openTab={openTab} onTalkToYulia={onTalkToYulia} user={user} modelPreference={modelPreference} />;
    if (tab.modeId === "intel")    return <V6IntelRoot openTab={openTab} onTalkToYulia={onTalkToYulia} />;
    if (tab.modeId === "library")  return <V6LibraryRoot openTab={openTab} />;
    return <Placeholder label={`${tab.title} — root view`} note="Unknown mode root." />;
  }
  if (tab.kind === "files-list") return <V6FilesListView view={tab.fileListView ?? "all"} openTab={openTab} onTalkToYulia={onTalkToYulia} user={user} />;
  if (tab.kind === "deal")     return <V6DealView id={tab.id} title={tab.title} openTab={openTab} fileScope={tab.fileScope} onTalkToYulia={onTalkToYulia} modelPreference={modelPreference} />;
  if (tab.kind === "doc")      return <V6DocView id={tab.id} title={tab.title} openTab={openTab} modelPreference={modelPreference} onTalkToYulia={onTalkToYulia} />;
  if (tab.kind === "analysis") return <V6AnalysisView title={tab.title} tool={tab.tool} markdown={tab.markdown} comparisonData={tab.comparisonData} analysisData={tab.analysisData} artifactData={tab.artifactData} analysisRunId={tab.analysisRunId} deliverableId={tab.deliverableId} status={tab.status} versionNumber={tab.versionNumber} resolvedMenuItemSlug={tab.resolvedMenuItemSlug} openTab={openTab} onTalkToYulia={onTalkToYulia} />;
  if (tab.kind === "feed-item") return <Placeholder label={`Feed · ${tab.title}`} note="Feed item reading view is a thin wrapper — coming after polish." />;
  if (tab.kind === "learn")    return <V6LearnView section={tab.section} anchor={tab.anchor} onTalkToYulia={onTalkToYulia} />;
  if (tab.kind === "marketing-studio") return <V6MarketingStudioView tab={tab} openTab={openTab} user={user} onTalkToYulia={onTalkToYulia} />;
  if (tab.kind === "settings") return <V6SettingsView user={user} onSignOut={onSignOut} />;
  if (tab.kind === "history")  return <V6HistoryView />;
  if (tab.kind === "starter")  return <V6StarterView onTalkToYulia={onTalkToYulia} />;
  return <Placeholder label="Unknown tab" />;
}

function Placeholder({ label, note }: { label: string; note?: string }) {
  return (
    <div className="m-fade-up m-page-flow" style={{ maxWidth: 720 }}>
      <div className="mono" style={{ fontSize: 9.5, color: "var(--m-on-surface-mid)", letterSpacing: "0.14em", fontWeight: 600 }}>STUB</div>
      <h1 style={{
        fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24,
        letterSpacing: "-0.025em", margin: "4px 0 8px", color: "var(--m-on-surface)",
      }}>{label}</h1>
      {note && <p style={{ fontSize: 13, color: "var(--m-on-surface-mid)", margin: 0 }}>{note}</p>}
    </div>
  );
}

export function V6Section({ eyebrow, title, sub, action, children }: {
  eyebrow?: string;
  title: string;
  sub?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section style={{ marginBottom: 36 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          {eyebrow && <div className="mono" style={{ fontSize: 9.5, color: "var(--m-on-surface-mid)", letterSpacing: "0.14em", fontWeight: 600 }}>{eyebrow}</div>}
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, letterSpacing: "-0.025em", margin: "4px 0 0", color: "var(--m-on-surface)" }}>{title}</h2>
          {sub && <div style={{ fontSize: 12.5, color: "var(--m-on-surface-mid)", marginTop: 3 }}>{sub}</div>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

const K: Record<string, CSSProperties> = {
  canvas: {
    background: "linear-gradient(180deg, #FFFFFF 0%, #FEFFFF 55%, #F8FBFF 100%)",
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
};
