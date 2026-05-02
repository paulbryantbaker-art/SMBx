/* V6 — Chat pane and the tabbed canvas system.
   Chat is leaner — no doors. Canvas is the App Store / Files surface. */

const { useState: m6cS, useEffect: m6cE, useRef: m6cR } = React;

/* ──────────────────────────────────────────────
   CHAT PANE — compact, persistent
   ────────────────────────────────────────────── */
function V6Chat({ thread, draft, setDraft, send, inputRef, modeLabel, onOpenTab }) {
  return (
    <div style={m6c.chat}>
      <div style={m6c.chatHead}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={m6c.yMark}>Y</div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--m-on-surface)", letterSpacing: "-0.01em" }}>Yulia</div>
            <div className="mono" style={{ fontSize: 10, color: "var(--m-on-surface-mid)", letterSpacing: "0.06em" }}>SAMPLE · {modeLabel.toUpperCase()}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 2 }}>
          <button className="m-btn text" style={{ height: 28, fontSize: 11.5 }}>History</button>
          <button className="m-btn text" style={{ height: 28, fontSize: 11.5 }}>Share</button>
        </div>
      </div>

      <div className="thin-scroll" style={m6c.chatBody}>
        {thread.length === 0 ? (
          <V6ChatEmpty modeLabel={modeLabel} onPick={(t) => send(t)} onOpenTab={onOpenTab}/>
        ) : thread.map((m, i) => (
          <V6Msg key={i} who={m.who} text={m.text}/>
        ))}
      </div>

      <form style={m6c.composer} onSubmit={(e) => { e.preventDefault(); send(); }}>
        <textarea
          ref={inputRef}
          rows={2}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`Message Yulia · she's aware of what's open`}
          style={m6c.composerInput}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
        />
        <div style={m6c.composerFoot}>
          <span className="mono" style={{ fontSize: 10, color: "var(--m-on-surface-mid)" }}>↵ send · ⇧↵ newline · / commands</span>
          <button type="submit" className="m-fab" aria-label="Send" disabled={!draft.trim()}>
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
              <path d="M7 11.5V2.5M7 2.5L3 6.5M7 2.5L11 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}

function V6ChatEmpty({ modeLabel, onPick, onOpenTab }) {
  // Logged-out welcome — invites first-time viewers to explore the sample.
  // (Logged-in surface uses the time-of-day greeting; not shown here.)
  // Mode-aware "do" suggestions — actions Yulia can take in the current context
  const suggestions = {
    "Business Search": [
      "What's worth my time today?",
      "Filter pipeline by recurring revenue",
      "Pest Control · FL — quick read",
      "Find HVAC deals in TX under $5M",
      "Compare my top 3 pursue picks",
    ],
    "Docs": [
      "Draft an LOI for Industrial Svc · TX",
      "What's in our latest NDA?",
      "Recast the P&L on the open deal",
      "Summarize this CIM in 5 bullets",
      "Pull diligence checklist for SBA close",
    ],
    "Analysis": [
      "Run comps on Pest Control · FL",
      "Re-run valuation with 6.0× multiple",
      "What do these numbers tell me?",
      "Stress-test DSCR if rates rise 1pt",
      "Build a 3-scenario sensitivity",
    ],
    "Market Intelligence": [
      "Pest control trends, last 30 days",
      "Who's buying HVAC in CO?",
      "What sectors are heating up?",
      "Multiples — landscaping vs. pest",
      "Who closed in TX last month?",
    ],
    "Library": [
      "Find the Q1 thesis memo",
      "Pull every closed deal in TX",
      "Show me everything I starred",
      "Last 5 docs I edited",
      "Find that note about owner financing",
    ],
  }[modeLabel] || ["What can you do?", "Walk me through a deal", "Show me what's possible"];

  // Universal "learn" chips — always available
  const learnChips = [
    { label: "How it works",       tab: { id: "tab-learn", kind: "learn", title: "How it works · Pricing", section: "how" } },
    { label: "Pricing",            tab: { id: "tab-learn", kind: "learn", title: "How it works · Pricing", section: "pricing" } },
    { label: "What can Yulia do?", tab: { id: "tab-learn", kind: "learn", title: "How it works · Pricing", section: "how" } },
    { label: "Compare plans",      tab: { id: "tab-learn", kind: "learn", title: "How it works · Pricing", section: "pricing" } },
  ];

  return (
    <div className="fade-up">
      <h1 style={{
        fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700,
        letterSpacing: "-0.02em", lineHeight: 1.2, margin: "0 0 8px", color: "var(--m-on-surface)",
        textWrap: "balance",
      }}>Hi there. Yulia can walk you through one of your deals right now — for free.</h1>
      <p style={{ fontSize: 12.5, lineHeight: 1.55, color: "var(--m-on-surface-var)", margin: "0 0 14px", textWrap: "pretty" }}>
        Start using the app completely for free. Use the <strong style={{ color: "var(--m-on-surface)" }}>Search Ideas</strong> below to explore, or just start chatting. Feel free to learn more about the app too.
      </p>

      {/* Mode-aware action chips */}
      <div className="mono" style={{ fontSize: 9.5, color: "var(--m-on-surface-mid)", letterSpacing: "0.14em", fontWeight: 600, margin: "0 0 8px" }}>
        SEARCH IDEAS · {modeLabel.toUpperCase()}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 16 }}>
        {suggestions.map(s => (
          <button key={s} onClick={() => onPick(s)} className="m-state"
            style={{
              all: "unset", display: "flex", alignItems: "center", gap: 8,
              padding: "8px 12px",
              background: "var(--m-surface-2)",
              borderRadius: 10,
              fontSize: 12.5, color: "var(--m-on-surface-var)",
              cursor: "pointer", boxSizing: "border-box", width: "100%",
            }}>
            <span style={{ color: "var(--m-primary)", fontSize: 11 }}>→</span>
            <span>{s}</span>
          </button>
        ))}
      </div>

      {/* Universal learn chips — pill row */}
      <div className="mono" style={{ fontSize: 9.5, color: "var(--m-on-surface-mid)", letterSpacing: "0.14em", fontWeight: 600, margin: "0 0 8px" }}>
        ABOUT SMBX
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {learnChips.map(c => (
          <button key={c.label} onClick={() => onOpenTab && onOpenTab(c.tab)}
            style={{
              all: "unset", display: "inline-flex", alignItems: "center", gap: 6,
              padding: "7px 12px",
              background: "var(--m-primary)",
              borderRadius: 999,
              fontSize: 11.5, fontWeight: 600, color: "var(--m-on-primary)",
              cursor: "pointer",
              transition: "background 120ms ease, transform 120ms ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#234975"}
            onMouseLeave={(e) => e.currentTarget.style.background = "var(--m-primary)"}>
            <span style={{ fontSize: 10, opacity: 0.85 }}>↗</span>
            <span>{c.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function V6Msg({ who, text }) {
  const isY = who === "y";
  return (
    <div className="fade-up" style={{ display: "flex", gap: 10, marginBottom: 14 }}>
      <div style={{
        width: 24, height: 24, flexShrink: 0, borderRadius: 7,
        background: isY ? "var(--m-primary-container)" : "var(--m-surface-2)",
        color: isY ? "var(--m-on-primary-container)" : "var(--m-on-surface-var)",
        display: "grid", placeItems: "center",
        fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 10,
      }}>{isY ? "Y" : ">"}</div>
      <div style={{ flex: 1, minWidth: 0, fontSize: 12.5, lineHeight: 1.55, color: "var(--m-on-surface)", paddingTop: 3 }}>{text}</div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   CANVAS — tabbed workspace
   ────────────────────────────────────────────── */

function V6Canvas({ tabs, activeTabId, setActiveTabId, openTab, closeTab, mode, onPickMode }) {
  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  return (
    <div style={m6c.canvas}>
      <V6TabStrip
        tabs={tabs}
        activeTabId={activeTabId}
        setActiveTabId={setActiveTabId}
        closeTab={closeTab}
      />
      <div className="thin-scroll" style={m6c.canvasBody}>
        {activeTab && <V6TabContent tab={activeTab} openTab={openTab} onPickMode={onPickMode} />}
      </div>
    </div>
  );
}

function V6TabStrip({ tabs, activeTabId, setActiveTabId, closeTab }) {
  return (
    <div className="tab-strip">
      {tabs.map(t => (
        <div
          key={t.id}
          className={`tab ${activeTabId === t.id ? "active" : ""} ${t.pinned ? "pinned" : ""}`}
          onClick={() => setActiveTabId(t.id)}
          title={t.title}>
          <span className="tab-icon">
            <V6Icon name={tabIcon(t)} size={12}/>
          </span>
          <span className="tab-label">{t.title}</span>
          {!t.pinned && (
            <button className="tab-close" onClick={(e) => { e.stopPropagation(); closeTab(t.id); }} aria-label="Close tab">
              <V6Icon name="close" size={10}/>
            </button>
          )}
        </div>
      ))}
      <button className="tab-new-btn" title="New tab">
        <V6Icon name="plus" size={12}/>
      </button>
    </div>
  );
}

function tabIcon(tab) {
  if (tab.kind === "mode-root") {
    const map = { search: "search", docs: "doc", analysis: "chart", intel: "feed", library: "library" };
    return map[tab.modeId] || "doc";
  }
  if (tab.kind === "deal") return "deal";
  if (tab.kind === "doc") return "doc";
  if (tab.kind === "analysis") return "chart";
  if (tab.kind === "feed-item") return "feed";
  if (tab.kind === "learn") return "library";
  return "doc";
}

function V6TabContent({ tab, openTab, onPickMode }) {
  if (tab.kind === "mode-root") {
    if (tab.modeId === "search")    return <V6SearchRoot openTab={openTab}/>;
    if (tab.modeId === "docs")      return <V6DocsRoot openTab={openTab}/>;
    if (tab.modeId === "analysis")  return <V6AnalysisRoot openTab={openTab}/>;
    if (tab.modeId === "intel")     return <V6IntelRoot openTab={openTab}/>;
    if (tab.modeId === "library")   return <V6LibraryRoot openTab={openTab}/>;
  }
  if (tab.kind === "deal")     return <V6DealView title={tab.title} openTab={openTab}/>;
  if (tab.kind === "doc")      return <V6DocView title={tab.title}/>;
  if (tab.kind === "analysis") return <V6AnalysisView title={tab.title}/>;
  if (tab.kind === "learn")    return <V6LearnView section={tab.section}/>;
  return <div style={{ padding: 40, color: "var(--m-on-surface-mid)" }}>Unknown tab</div>;
}

/* Section helpers */
function V6Section({ eyebrow, title, sub, action, children }) {
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

const m6c = {
  chat: {
    background: "var(--m-surface)",
    borderRight: "1px solid var(--m-outline-var)",
    display: "flex", flexDirection: "column", minHeight: 0, height: "100%",
  },
  chatHead: {
    height: 56, flexShrink: 0, padding: "0 14px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    borderBottom: "1px solid var(--m-outline-var)",
  },
  yMark: {
    width: 28, height: 28, borderRadius: 8,
    background: "var(--m-primary-container)",
    color: "var(--m-on-primary-container)",
    display: "grid", placeItems: "center",
    fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13,
  },
  chatBody: { flex: 1, overflowY: "auto", padding: "16px 14px" },
  composer: {
    margin: 12,
    background: "var(--m-surface-on-light)",
    borderRadius: 14,
    padding: 10,
    border: "1px solid var(--m-outline-var)",
  },
  composerInput: {
    width: "100%", boxSizing: "border-box",
    border: "none", background: "transparent",
    fontSize: 13, lineHeight: 1.5, color: "var(--m-on-surface)",
    resize: "none", outline: "none", padding: "4px 6px",
    fontFamily: "var(--font-body)",
  },
  composerFoot: { marginTop: 4, display: "flex", justifyContent: "space-between", alignItems: "center" },

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

Object.assign(window, { V6Chat, V6Canvas, V6TabStrip, V6Section, V6TabContent });
