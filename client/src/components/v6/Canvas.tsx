import { type CSSProperties, type ReactNode } from "react";
import type { Tab, IconName, OpenTab, ModeId } from "./types";
import { V6Icon } from "./icons";
import { V6SearchRoot } from "./modes/SearchRoot";
import { V6DocsRoot } from "./modes/DocsRoot";
import { V6AnalysisRoot } from "./modes/AnalysisRoot";
import { V6IntelRoot } from "./modes/IntelRoot";
import { V6LibraryRoot } from "./modes/LibraryRoot";
import { V6DealView } from "./views/DealView";
import { V6DocView } from "./views/DocView";
import { V6AnalysisView } from "./views/AnalysisView";
import { V6LearnView } from "./Learn";

interface CanvasProps {
  tabs: Tab[];
  activeTabId: string;
  setActiveTabId: (id: string) => void;
  openTab: OpenTab;
  closeTab: (id: string) => void;
  onPickMode: (id: ModeId) => void;
  onTalkToYulia?: (prompt: string) => void;
}

export function V6Canvas({ tabs, activeTabId, setActiveTabId, openTab, closeTab, onPickMode, onTalkToYulia }: CanvasProps) {
  const activeTab = tabs.find(t => t.id === activeTabId) ?? tabs[0];
  return (
    <div style={K.canvas}>
      <V6TabStrip
        tabs={tabs}
        activeTabId={activeTabId}
        setActiveTabId={setActiveTabId}
        closeTab={closeTab}
      />
      <div className="thin-scroll" style={K.canvasBody}>
        {activeTab && <V6TabContent tab={activeTab} openTab={openTab} onPickMode={onPickMode} onTalkToYulia={onTalkToYulia} />}
      </div>
    </div>
  );
}

interface TabStripProps {
  tabs: Tab[];
  activeTabId: string;
  setActiveTabId: (id: string) => void;
  closeTab: (id: string) => void;
}

function V6TabStrip({ tabs, activeTabId, setActiveTabId, closeTab }: TabStripProps) {
  return (
    <div className="tab-strip" role="tablist" aria-label="Open workspace items">
      {tabs.map(t => (
        <div
          key={t.id}
          className={`tab ${activeTabId === t.id ? "active" : ""} ${t.pinned ? "pinned" : ""}`}
          onClick={() => setActiveTabId(t.id)}
          title={t.title}
          role="tab"
          aria-selected={activeTabId === t.id}
        >
          <span className="tab-icon"><V6Icon name={tabIcon(t)} size={12} /></span>
          <span className="tab-label">{t.title}</span>
          {!t.pinned && (
            <button
              className="tab-close"
              onClick={(e) => { e.stopPropagation(); closeTab(t.id); }}
              aria-label={`Close ${t.title}`}
            >
              <V6Icon name="close" size={10} />
            </button>
          )}
        </div>
      ))}
      <button className="tab-new-btn" title="New tab" aria-label="New tab">
        <V6Icon name="plus" size={12} />
      </button>
    </div>
  );
}

function tabIcon(tab: Tab): IconName {
  if (tab.kind === "mode-root") {
    const map: Record<ModeId, IconName> = {
      search: "search", docs: "doc", analysis: "chart", intel: "feed", library: "library",
    };
    return tab.modeId ? map[tab.modeId] : "doc";
  }
  if (tab.kind === "deal") return "deal";
  if (tab.kind === "doc") return "doc";
  if (tab.kind === "analysis") return "chart";
  if (tab.kind === "feed-item") return "feed";
  if (tab.kind === "learn") return "library";
  return "doc";
}

interface TabContentProps {
  tab: Tab;
  openTab: OpenTab;
  onPickMode: (id: ModeId) => void;
  onTalkToYulia?: (prompt: string) => void;
}

function V6TabContent({ tab, openTab, onTalkToYulia }: TabContentProps) {
  if (tab.kind === "mode-root") {
    if (tab.modeId === "search")   return <V6SearchRoot openTab={openTab} />;
    if (tab.modeId === "docs")     return <V6DocsRoot openTab={openTab} />;
    if (tab.modeId === "analysis") return <V6AnalysisRoot openTab={openTab} />;
    if (tab.modeId === "intel")    return <V6IntelRoot openTab={openTab} />;
    if (tab.modeId === "library")  return <V6LibraryRoot openTab={openTab} />;
    return <Placeholder label={`${tab.title} — root view`} note="Unknown mode root." />;
  }
  if (tab.kind === "deal")     return <V6DealView title={tab.title} openTab={openTab} />;
  if (tab.kind === "doc")      return <V6DocView title={tab.title} />;
  if (tab.kind === "analysis") return <V6AnalysisView title={tab.title} />;
  if (tab.kind === "feed-item") return <Placeholder label={`Feed · ${tab.title}`} note="Feed item reading view is a thin wrapper — coming after polish." />;
  if (tab.kind === "learn")    return <V6LearnView section={tab.section} anchor={tab.anchor} onTalkToYulia={onTalkToYulia} />;
  return <Placeholder label="Unknown tab" />;
}

function Placeholder({ label, note }: { label: string; note?: string }) {
  return (
    <div className="m-fade-up" style={{ maxWidth: 720 }}>
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
    background: "var(--m-bg)",
    display: "flex", flexDirection: "column", minHeight: 0, height: "100%",
  },
  canvasBody: {
    flex: 1, overflowY: "auto",
    padding: "28px 40px 56px",
    width: "100%",
    boxSizing: "border-box",
  },
};
