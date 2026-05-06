import { type CSSProperties, type ReactNode } from "react";
import type { Tab, IconName, OpenTab, ModeId } from "./types";
import type { User } from "../../hooks/useAuth";
import { V6Icon } from "./icons";
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

interface CanvasProps {
  tabs: Tab[];
  activeTabId: string;
  setActiveTabId: (id: string) => void;
  openTab: OpenTab;
  closeTab: (id: string) => void;
  onPickMode: (id: ModeId) => void;
  onTalkToYulia?: (prompt: string) => void;
  user: User | null;
  onSignOut: () => void;
}

export function V6Canvas({ tabs, activeTabId, setActiveTabId, openTab, closeTab, onPickMode, onTalkToYulia, user, onSignOut }: CanvasProps) {
  const activeTab = tabs.find(t => t.id === activeTabId) ?? tabs[0];

  const openStarterTab = () => {
    const id = `starter-${Date.now()}`;
    openTab({ id, kind: "starter", title: "New" });
    // Notify Yulia so she greets the user in the chat panel.
    if (onTalkToYulia) {
      onTalkToYulia("I just opened a new tab — what can you help me with?");
    }
  };

  return (
    <div style={K.canvas}>
      <V6TabStrip
        tabs={tabs}
        activeTabId={activeTabId}
        setActiveTabId={setActiveTabId}
        closeTab={closeTab}
        onNewTab={openStarterTab}
      />
      <div className="thin-scroll" style={K.canvasBody}>
        {activeTab && (
          <V6TabContent
            tab={activeTab}
            openTab={openTab}
            onPickMode={onPickMode}
            onTalkToYulia={onTalkToYulia}
            user={user}
            onSignOut={onSignOut}
          />
        )}
      </div>
    </div>
  );
}

interface TabStripProps {
  tabs: Tab[];
  activeTabId: string;
  setActiveTabId: (id: string) => void;
  closeTab: (id: string) => void;
  onNewTab: () => void;
}

function V6TabStrip({ tabs, activeTabId, setActiveTabId, closeTab, onNewTab }: TabStripProps) {
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
      <button className="tab-new-btn" title="New tab" aria-label="New tab" onClick={onNewTab}>
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
  if (tab.kind === "settings") return "settings";
  if (tab.kind === "history") return "history";
  if (tab.kind === "starter") return "plus";
  if (tab.kind === "model") return "chart";
  if (tab.kind === "sourcing") return "search";
  if (tab.kind === "deliverable") return "doc";
  return "doc";
}

interface TabContentProps {
  tab: Tab;
  openTab: OpenTab;
  onPickMode: (id: ModeId) => void;
  onTalkToYulia?: (prompt: string) => void;
  user: User | null;
  onSignOut: () => void;
}

function V6TabContent({ tab, openTab, onTalkToYulia, user, onSignOut }: TabContentProps) {
  if (tab.kind === "mode-root") {
    if (tab.modeId === "search")   return <V6SearchRoot openTab={openTab} onTalkToYulia={onTalkToYulia} user={user} />;
    if (tab.modeId === "docs")     return <V6DocsRoot openTab={openTab} user={user} />;
    if (tab.modeId === "analysis") return <V6AnalysisRoot openTab={openTab} user={user} />;
    if (tab.modeId === "intel")    return <V6IntelRoot openTab={openTab} user={user} />;
    if (tab.modeId === "library")  return <V6LibraryRoot openTab={openTab} user={user} />;
    return <Placeholder label={`${tab.title} — root view`} note="Unknown mode root." />;
  }
  if (tab.kind === "deal")     return <V6DealView id={tab.id} title={tab.title} openTab={openTab} onTalkToYulia={onTalkToYulia} />;
  if (tab.kind === "doc")      return <V6DocView id={tab.id} title={tab.title} />;
  if (tab.kind === "analysis") return <V6AnalysisView title={tab.title} />;
  if (tab.kind === "feed-item") return <Placeholder label={`Feed · ${tab.title}`} note="Feed item reading view is a thin wrapper — coming after polish." />;
  if (tab.kind === "learn")    return <V6LearnView section={tab.section} anchor={tab.anchor} onTalkToYulia={onTalkToYulia} />;
  if (tab.kind === "settings") return <V6SettingsView user={user} onSignOut={onSignOut} />;
  if (tab.kind === "history")  return <V6HistoryView />;
  if (tab.kind === "starter")  return <V6StarterView onTalkToYulia={onTalkToYulia} />;
  if (tab.kind === "model") {
    return (
      <PendingSurface
        eyebrow="OPENED BY YULIA"
        title={tab.title}
        chip={tab.modelType ? `model · ${tab.modelType}` : undefined}
        body="The interactive model viewer ships in the next build. In the meantime, ask Yulia in chat to walk you through the assumptions or run a what-if."
      />
    );
  }
  if (tab.kind === "sourcing") {
    return (
      <PendingSurface
        eyebrow="OPENED BY YULIA"
        title={tab.title}
        chip={tab.runId ? `run · ${tab.runId}` : undefined}
        body="The live sourcing panel ships in the next build. Ask Yulia in chat for the latest candidates and stage progress."
      />
    );
  }
  if (tab.kind === "deliverable") {
    return (
      <PendingSurface
        eyebrow="OPENED BY YULIA"
        title={tab.title}
        chip={tab.deliverableId ? `deliverable · ${tab.deliverableId}` : undefined}
        body="The in-canvas viewer ships in the next build. Ask Yulia in chat to summarize this deliverable or surface specific sections."
      />
    );
  }
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

/**
 * Tab opened by an agentic tool whose interactive viewer hasn't shipped yet.
 * Honest framing: chat-first means even an empty canvas surface is OK because the
 * conversation continues with Yulia. This card surfaces what was opened and points
 * the user back to chat.
 */
function PendingSurface({ eyebrow, title, chip, body }: {
  eyebrow: string;
  title: string;
  chip?: string;
  body: string;
}) {
  return (
    <div className="m-fade-up" style={P.wrap}>
      <div className="mono" style={P.eyebrow}>{eyebrow}</div>
      <h1 style={P.title}>{title}</h1>
      {chip && <div style={P.chip}>{chip}</div>}
      <p style={P.body}>{body}</p>
    </div>
  );
}

const P: Record<string, CSSProperties> = {
  wrap: {
    maxWidth: 560,
    background: "var(--m-surface-on-light)",
    border: "1px solid var(--m-outline-var)",
    borderRadius: 14,
    padding: "26px 28px",
    boxShadow: "var(--m-elev-1)",
  },
  eyebrow: {
    fontSize: 9.5,
    color: "var(--m-primary)",
    letterSpacing: "0.14em",
    fontWeight: 600,
  },
  title: {
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: 22,
    letterSpacing: "-0.025em",
    margin: "6px 0 10px",
    color: "var(--m-on-surface)",
  },
  chip: {
    display: "inline-block",
    fontFamily: "var(--font-display)",
    fontSize: 11,
    color: "var(--m-on-primary-container)",
    background: "var(--m-primary-container)",
    padding: "3px 10px",
    borderRadius: 999,
    marginBottom: 14,
  },
  body: {
    fontSize: 13.5,
    lineHeight: 1.55,
    color: "var(--m-on-surface-mid)",
    margin: 0,
    maxWidth: "60ch",
  },
};

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
