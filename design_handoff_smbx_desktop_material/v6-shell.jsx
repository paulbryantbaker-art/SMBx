/* V6 — Utility sidebar.
   Account chip · search (expanded pane) · modes · settings.
   No deal index, no recents — those live in the canvas now. */

const { useState: m6sS, useRef: m6sR, useEffect: m6sE } = React;

const MODES = [
  { id: "search",       label: "Business Search",     count: "6",  icon: "search" },
  { id: "docs",         label: "Docs",                count: "24", icon: "doc"    },
  { id: "analysis",     label: "Analysis",            count: "11", icon: "chart"  },
  { id: "intel",        label: "Market Intelligence", count: "87", icon: "feed"   },
  { id: "library",      label: "Library",             count: "143",icon: "library"},
];

function V6Icon({ name, size = 14 }) {
  const s = size;
  switch (name) {
    case "search":
      return (
        <svg width={s} height={s} viewBox="0 0 14 14" fill="none">
          <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M9 9l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );
    case "doc":
      return (
        <svg width={s} height={s} viewBox="0 0 14 14" fill="none">
          <path d="M3 1.5h5l3 3v8H3v-11z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
          <path d="M8 1.5v3h3" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
          <path d="M5 8h4M5 10h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      );
    case "chart":
      return (
        <svg width={s} height={s} viewBox="0 0 14 14" fill="none">
          <path d="M2 12h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          <rect x="3" y="7" width="2" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3"/>
          <rect x="6" y="4" width="2" height="7" rx="0.5" stroke="currentColor" strokeWidth="1.3"/>
          <rect x="9" y="6" width="2" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.3"/>
        </svg>
      );
    case "feed":
      return (
        <svg width={s} height={s} viewBox="0 0 14 14" fill="none">
          <path d="M2 4h10M2 7h10M2 10h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      );
    case "library":
      return (
        <svg width={s} height={s} viewBox="0 0 14 14" fill="none">
          <rect x="2" y="2" width="3.5" height="10" rx="0.6" stroke="currentColor" strokeWidth="1.3"/>
          <rect x="6" y="3.5" width="3.5" height="8.5" rx="0.6" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M11 3l1.7 0.4-1.7 8.7-1.7-0.3 1.7-8.8z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
        </svg>
      );
    case "settings":
      return (
        <svg width={s} height={s} viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M7 1v2M7 11v2M1 7h2M11 7h2M2.5 2.5L4 4M10 10l1.5 1.5M2.5 11.5L4 10M10 4l1.5-1.5"
            stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      );
    case "history":
      return (
        <svg width={s} height={s} viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M7 4v3l2 1.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      );
    case "plus":
      return (
        <svg width={s} height={s} viewBox="0 0 14 14" fill="none">
          <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
        </svg>
      );
    case "close":
      return (
        <svg width={s} height={s} viewBox="0 0 14 14" fill="none">
          <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      );
    case "pin":
      return (
        <svg width={s} height={s} viewBox="0 0 14 14" fill="none">
          <path d="M7 1l1.7 4.5L13 7l-4.3 1.5L7 13l-1.7-4.5L1 7l4.3-1.5L7 1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
        </svg>
      );
    case "back":
      return (
        <svg width={s} height={s} viewBox="0 0 14 14" fill="none">
          <path d="M9 3l-4 4 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case "deal":
      return (
        <svg width={s} height={s} viewBox="0 0 14 14" fill="none">
          <path d="M2 4l5-2.5 5 2.5v6L7 12.5 2 10V4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
          <path d="M2 4l5 2.5 5-2.5M7 6.5V12" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
        </svg>
      );
    default:
      return null;
  }
}

function V6Sidebar({ activeMode, onPickMode, searchOpen, setSearchOpen, onOpenTab }) {
  const searchRef = m6sR(null);
  const [q, setQ] = m6sS("");
  const [hover, setHover] = m6sS(false);
  const [pinned, setPinned] = m6sS(false);
  const expanded = pinned || hover || searchOpen;

  // Search results — live as you type, grouped
  const allResults = {
    deals: [
      { id: "d-industrial", label: "Industrial Svc · TX",     sub: "Pursue · 92 fit" },
      { id: "d-pest",       label: "Pest Control · FL",        sub: "Pursue · 84 fit" },
      { id: "d-electrical", label: "Electrical · TX",          sub: "Watch · 78 fit" },
    ],
    docs: [
      { id: "doc-nda",  label: "Acme NDA · executed",       sub: "Mar 18 · final" },
      { id: "doc-loi",  label: "Industrial Svc · LOI v3",   sub: "Mar 22 · draft"  },
      { id: "doc-memo", label: "Q1 thesis memo",            sub: "Feb 28 · final"  },
    ],
    analysis: [
      { id: "an-recast", label: "Industrial Svc · Recast",   sub: "Mar 25 · live" },
      { id: "an-comps",  label: "Pest Control · Comps",      sub: "Mar 20 · saved"},
    ],
  };
  const norm = q.trim().toLowerCase();
  const matches = !norm ? null : Object.fromEntries(
    Object.entries(allResults).map(([k, arr]) => [k, arr.filter(r => (r.label + r.sub).toLowerCase().includes(norm))])
  );

  return (
    <aside
      style={{ ...m6s.rail, width: expanded ? 260 : 56 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}>
      {/* Account chip */}
      <div style={{ ...m6s.account, padding: expanded ? "12px 14px" : "12px 0", justifyContent: expanded ? "flex-start" : "center" }}>
        <div style={m6s.avatar}>YS</div>
        {expanded && (
          <>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={m6s.acctName}>Yulia Sun</div>
              <div style={m6s.acctSub}>Apex SMB Holdings</div>
            </div>
            <button className="m-state" style={m6s.chevBtn} title="Pin sidebar" onClick={() => setPinned(!pinned)}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                {pinned
                  ? <path d="M9 4.5l-3-3-3 3M9 7.5l-3 3-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  : <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>}
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Search bar — opens search pane */}
      <div style={{ ...m6s.searchWrap, padding: expanded ? "12px 12px 0" : "12px 8px 0" }}>
        <button
          className="m-state"
          style={{ ...m6s.searchTrigger, ...(searchOpen ? m6s.searchTriggerActive : null) }}
          onClick={() => { setSearchOpen(!searchOpen); setTimeout(() => searchRef.current?.focus(), 50); }}>
          <V6Icon name="search" size={13}/>
          {expanded && (
            <>
              <span style={{ flex: 1, textAlign: "left", fontSize: 12.5 }}>
                {searchOpen ? "Searching everything…" : "Search · ⌘K"}
              </span>
              {!searchOpen && <span style={m6s.kbd}>⌘K</span>}
              {searchOpen && (
                <span onClick={(e) => { e.stopPropagation(); setSearchOpen(false); setQ(""); }} style={{ fontSize: 11, color: "var(--m-on-surface-mid)", padding: "2px 6px" }}>esc</span>
              )}
            </>
          )}
        </button>
      </div>

      {/* Search panel — appears in the rail when active */}
      {searchOpen && (
        <div className="fade-in" style={m6s.searchPane}>
          <input
            ref={searchRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Type to search deals, docs, analyses…"
            style={m6s.searchInput}
            onKeyDown={(e) => { if (e.key === "Escape") { setSearchOpen(false); setQ(""); } }}
          />
          <div className="thin-scroll" style={m6s.searchResults}>
            {!norm && (
              <div style={m6s.searchEmpty}>
                <div style={{ fontSize: 11, color: "var(--m-on-surface-mid)", marginBottom: 8, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", fontWeight: 600 }}>SUGGESTED</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {[
                    { kind: "deals", label: "Industrial Svc · TX", sub: "Last opened today" },
                    { kind: "docs", label: "Industrial Svc · LOI v3", sub: "3 days ago" },
                    { kind: "analysis", label: "Industrial Svc · Recast", sub: "Yesterday" },
                  ].map(s => (
                    <button key={s.label} className="m-state" style={m6s.resultRow}
                      onClick={() => { onOpenTab({ kind: s.kind === "deals" ? "deal" : s.kind === "docs" ? "doc" : "analysis", title: s.label }); setSearchOpen(false); }}>
                      <V6Icon name={s.kind === "deals" ? "deal" : s.kind === "docs" ? "doc" : "chart"} size={12}/>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, color: "var(--m-on-surface)", fontWeight: 500 }}>{s.label}</div>
                        <div style={{ fontSize: 11, color: "var(--m-on-surface-mid)" }}>{s.sub}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {norm && Object.entries(matches).map(([group, arr]) => arr.length > 0 && (
              <div key={group} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, color: "var(--m-on-surface-mid)", margin: "8px 4px 4px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", fontWeight: 600, textTransform: "uppercase" }}>
                  {group} · {arr.length}
                </div>
                {arr.map(r => (
                  <button key={r.id} className="m-state" style={m6s.resultRow}
                    onClick={() => {
                      const k = group === "deals" ? "deal" : group === "docs" ? "doc" : "analysis";
                      onOpenTab({ kind: k, title: r.label });
                      setSearchOpen(false); setQ("");
                    }}>
                    <V6Icon name={group === "deals" ? "deal" : group === "docs" ? "doc" : "chart"} size={12}/>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, color: "var(--m-on-surface)", fontWeight: 500 }}>{r.label}</div>
                      <div style={{ fontSize: 11, color: "var(--m-on-surface-mid)" }}>{r.sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            ))}

            {norm && Object.values(matches).every(a => a.length === 0) && (
              <div style={{ padding: "16px 12px", fontSize: 12.5, color: "var(--m-on-surface-mid)", textAlign: "center" }}>
                No matches for "{q}"
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modes — primary nav */}
      {!searchOpen && (
        <div style={{ ...m6s.modes, padding: expanded ? "16px 8px 8px" : "16px 6px 8px" }}>
          {expanded && <div style={m6s.sectionHead}>Workspace</div>}
          {MODES.map(m => (
            <button
              key={m.id}
              className={`mode-item ${activeMode === m.id ? "active" : ""}`}
              onClick={() => onPickMode(m.id)}
              title={!expanded ? m.label : undefined}
              style={!expanded ? { justifyContent: "center", padding: "10px 0" } : null}>
              <span className="mode-icon"><V6Icon name={m.icon} size={14}/></span>
              {expanded && (
                <>
                  <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.label}</span>
                  <span className="mode-count">{m.count}</span>
                </>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Footer — settings + history */}
      {!searchOpen && (
        <div style={{ ...m6s.foot, padding: expanded ? "8px 8px 12px" : "8px 6px 12px" }}>
          <button className="mode-item" style={{ width: "100%", ...(expanded ? null : { justifyContent: "center", padding: "10px 0" }) }} title={!expanded ? "Recent activity" : undefined}>
            <span className="mode-icon"><V6Icon name="history" size={14}/></span>
            {expanded && <span>Recent activity</span>}
          </button>
          <button className="mode-item" style={{ width: "100%", ...(expanded ? null : { justifyContent: "center", padding: "10px 0" }) }} title={!expanded ? "Settings" : undefined}>
            <span className="mode-icon"><V6Icon name="settings" size={14}/></span>
            {expanded && <span>Settings</span>}
          </button>
        </div>
      )}
    </aside>
  );
}

const m6s = {
  rail: {
    flexShrink: 0,
    background: "var(--m-surface-1)",
    borderRight: "1px solid var(--m-outline-var)",
    display: "flex", flexDirection: "column", height: "100%",
    transition: "width 180ms ease",
    overflow: "hidden",
    position: "relative", zIndex: 5,
  },

  account: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "12px 14px",
    borderBottom: "1px solid var(--m-outline-var)",
  },
  avatar: {
    width: 32, height: 32, borderRadius: 10,
    background: "var(--m-primary-container)",
    color: "var(--m-on-primary-container)",
    display: "grid", placeItems: "center",
    fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12,
    letterSpacing: "-0.02em",
    flexShrink: 0,
  },
  acctName: {
    fontSize: 13, fontWeight: 600, color: "var(--m-on-surface)",
    letterSpacing: "-0.01em",
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  acctSub: {
    fontSize: 11.5, color: "var(--m-on-surface-mid)",
    marginTop: 1,
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  chevBtn: {
    all: "unset",
    width: 24, height: 24, borderRadius: 6,
    display: "grid", placeItems: "center",
    color: "var(--m-on-surface-mid)", cursor: "pointer",
    flexShrink: 0,
  },

  searchWrap: { padding: "12px 12px 0" },
  searchTrigger: {
    all: "unset",
    width: "100%", boxSizing: "border-box",
    display: "flex", alignItems: "center", gap: 10,
    padding: "9px 12px",
    background: "var(--m-surface-2)",
    borderRadius: 10,
    color: "var(--m-on-surface-var)",
    cursor: "pointer",
  },
  searchTriggerActive: {
    background: "var(--m-surface-on-light)",
    boxShadow: "0 0 0 2px var(--m-primary)",
    color: "var(--m-on-surface)",
  },
  kbd: {
    fontFamily: "var(--font-mono)", fontSize: 10,
    padding: "2px 6px",
    background: "var(--m-surface-3)",
    borderRadius: 4,
    color: "var(--m-on-surface-mid)",
    flexShrink: 0,
  },

  searchPane: {
    flex: 1,
    display: "flex", flexDirection: "column",
    padding: "12px 12px 0",
    minHeight: 0,
  },
  searchInput: {
    width: "100%", boxSizing: "border-box",
    background: "var(--m-surface-on-light)",
    border: "1px solid var(--m-primary)",
    borderRadius: 10,
    padding: "9px 12px",
    fontSize: 13, color: "var(--m-on-surface)",
    outline: "none",
    boxShadow: "0 0 0 3px rgba(92,107,192,0.15)",
  },
  searchResults: {
    flex: 1, overflowY: "auto",
    paddingTop: 12,
    minHeight: 0,
  },
  searchEmpty: { paddingTop: 4 },
  resultRow: {
    all: "unset",
    display: "flex", alignItems: "center", gap: 10,
    padding: "8px 10px",
    borderRadius: 8,
    cursor: "pointer",
    color: "var(--m-on-surface-var)",
    width: "100%", boxSizing: "border-box",
  },

  modes: {
    flex: 1,
    overflow: "auto",
    padding: "16px 8px 8px",
  },
  sectionHead: {
    padding: "0 10px 8px",
    fontFamily: "var(--font-mono)", fontSize: 9.5,
    color: "var(--m-on-surface-mid)",
    letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600,
  },

  foot: {
    padding: "8px 8px 12px",
    borderTop: "1px solid var(--m-outline-var)",
    display: "flex", flexDirection: "column", gap: 2,
  },
};

Object.assign(window, { V6Sidebar, V6Icon, MODES });
