import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { MODES, V6Icon } from "./icons";
import type { ModeId, OpenTab } from "./types";

interface SidebarProps {
  activeMode: ModeId;
  onPickMode: (id: ModeId) => void;
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
  onOpenTab: OpenTab;
  user: { display_name: string | null; email: string } | null;
  onSignIn: () => void;
  onSignUp: () => void;
  onSignOut: () => void;
}

const DEMO_RESULTS = {
  deals: [
    { id: "d-bigfake",    label: "Big Fake Deal · sample", sub: "Pursue · 92 fit" },
    { id: "d-pest",       label: "Pest Control · FL",      sub: "Pursue · 84 fit" },
    { id: "d-electrical", label: "Electrical · TX",        sub: "Watch · 78 fit"  },
  ],
  docs: [
    { id: "doc-nda",  label: "Acme NDA · executed",     sub: "Mar 18 · final" },
    { id: "doc-loi",  label: "Big Fake Deal · LOI v3",  sub: "Mar 22 · draft" },
    { id: "doc-memo", label: "Q1 thesis memo",          sub: "Feb 28 · final" },
  ],
  analysis: [
    { id: "an-recast", label: "Big Fake Deal · Recast",  sub: "Mar 25 · live"  },
    { id: "an-comps",  label: "Pest Control · Comps",    sub: "Mar 20 · saved" },
  ],
} as const;

type ResultGroup = keyof typeof DEMO_RESULTS;

export function V6Sidebar({
  activeMode, onPickMode, searchOpen, setSearchOpen, onOpenTab,
  user, onSignIn, onSignUp, onSignOut,
}: SidebarProps) {
  const searchRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [hover, setHover] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const expanded = pinned || hover || searchOpen || menuOpen;
  const menuRef = useRef<HTMLDivElement>(null);

  // Click outside to close account menu
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  const isAnon = !user;
  const acctName = user
    ? (user.display_name?.trim() || user.email.split("@")[0])
    : "Guest";
  const acctSub = user ? user.email : "Sign in to use yours";
  const initials = (() => {
    if (!user) return "·";
    const src = user.display_name?.trim() || user.email;
    const parts = src.split(/[\s@.]+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return src.slice(0, 2).toUpperCase();
  })();

  const norm = q.trim().toLowerCase();
  const matches = !norm ? null : (Object.fromEntries(
    (Object.entries(DEMO_RESULTS) as [ResultGroup, typeof DEMO_RESULTS[ResultGroup]][])
      .map(([k, arr]) => [k, arr.filter(r => (r.label + r.sub).toLowerCase().includes(norm))])
  ) as Record<ResultGroup, { id: string; label: string; sub: string }[]>);

  const openSearch = () => {
    setSearchOpen(true);
    setTimeout(() => searchRef.current?.focus(), 50);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setQ("");
  };

  const onSearchKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") closeSearch();
  };

  const tabKindFor = (group: ResultGroup) =>
    group === "deals" ? "deal" : group === "docs" ? "doc" : "analysis";

  const iconFor = (group: ResultGroup) =>
    group === "deals" ? "deal" : group === "docs" ? "doc" : "chart";

  return (
    <aside
      style={{ ...S.rail, width: expanded ? 260 : 56 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div ref={menuRef} style={{ ...S.account, padding: expanded ? "12px 14px" : "12px 0", justifyContent: expanded ? "flex-start" : "center", position: "relative" }}>
        <button
          className="m-state"
          style={{ ...S.avatar, cursor: "pointer", border: "none" }}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={user ? "Account menu" : "Sign in or sign up"}
          aria-expanded={menuOpen}
        >{initials}</button>
        {expanded && (
          <>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={S.acctName}>{acctName}</div>
              <div style={S.acctSub}>{acctSub}</div>
            </div>
            <button
              className="m-state"
              style={S.chevBtn}
              title={pinned ? "Unpin sidebar" : "Pin sidebar"}
              aria-label={pinned ? "Unpin sidebar" : "Pin sidebar"}
              aria-pressed={pinned}
              onClick={() => setPinned(!pinned)}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                {pinned
                  ? <path d="M9 4.5l-3-3-3 3M9 7.5l-3 3-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  : <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>}
              </svg>
            </button>
          </>
        )}

        {menuOpen && expanded && (
          <div role="menu" style={S.menu} className="m-fade-in">
            {isAnon ? (
              <>
                <button role="menuitem" className="m-state" style={S.menuItem} onClick={() => { setMenuOpen(false); onSignIn(); }}>
                  Sign in
                </button>
                <button role="menuitem" className="m-state" style={S.menuItem} onClick={() => { setMenuOpen(false); onSignUp(); }}>
                  Create account
                </button>
                <div style={S.menuDivider} />
                <div style={S.menuFooter}>
                  Free tier · unlimited chat · 1 deliverable
                </div>
              </>
            ) : (
              <>
                <div style={S.menuHeader}>
                  <div style={S.menuName}>{acctName}</div>
                  <div style={S.menuEmail}>{user.email}</div>
                </div>
                <div style={S.menuDivider} />
                <button
                  role="menuitem"
                  className="m-state"
                  style={S.menuItem}
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenTab({ id: "tab-settings", kind: "settings", title: "Settings" });
                  }}
                >
                  Profile
                </button>
                <button
                  role="menuitem"
                  className="m-state"
                  style={S.menuItem}
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenTab({ id: "tab-settings", kind: "settings", title: "Settings" });
                  }}
                >
                  Settings
                </button>
                <div style={S.menuDivider} />
                <button role="menuitem" className="m-state" style={{ ...S.menuItem, color: "var(--m-pass)" }} onClick={() => { setMenuOpen(false); onSignOut(); }}>
                  Sign out
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div style={{ ...S.searchWrap, padding: expanded ? "12px 12px 0" : "12px 8px 0" }}>
        <button
          className="m-state"
          style={{ ...S.searchTrigger, ...(searchOpen ? S.searchTriggerActive : null) }}
          onClick={() => (searchOpen ? closeSearch() : openSearch())}
          aria-label="Search workspace"
          aria-expanded={searchOpen}
        >
          <V6Icon name="search" size={13} />
          {expanded && (
            <>
              <span style={{ flex: 1, textAlign: "left", fontSize: 12.5 }}>
                {searchOpen ? "Searching everything…" : "Search · ⌘K"}
              </span>
              {!searchOpen && <span style={S.kbd}>⌘K</span>}
              {searchOpen && (
                <span
                  role="button"
                  onClick={(e) => { e.stopPropagation(); closeSearch(); }}
                  style={{ fontSize: 11, color: "var(--m-on-surface-mid)", padding: "2px 6px" }}
                >esc</span>
              )}
            </>
          )}
        </button>
      </div>

      {searchOpen && (
        <div className="m-fade-in" style={S.searchPane}>
          <input
            ref={searchRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Type to search deals, docs, analyses…"
            style={S.searchInput}
            onKeyDown={onSearchKey}
            aria-label="Search query"
          />
          <div className="thin-scroll" style={S.searchResults}>
            {!norm && (
              <div style={{ paddingTop: 4 }}>
                <div style={S.suggestedHead}>SUGGESTED</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {[
                    { kind: "deal" as const, label: "Big Fake Deal · sample",   sub: "Last opened today" },
                    { kind: "doc" as const,  label: "Big Fake Deal · LOI v3",   sub: "3 days ago" },
                    { kind: "analysis" as const, label: "Big Fake Deal · Recast", sub: "Yesterday" },
                  ].map(s => (
                    <button
                      key={s.label}
                      className="m-state"
                      style={S.resultRow}
                      onClick={() => { onOpenTab({ kind: s.kind, title: s.label }); closeSearch(); }}
                    >
                      <V6Icon name={s.kind === "deal" ? "deal" : s.kind === "doc" ? "doc" : "chart"} size={12} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, color: "var(--m-on-surface)", fontWeight: 500 }}>{s.label}</div>
                        <div style={{ fontSize: 11, color: "var(--m-on-surface-mid)" }}>{s.sub}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {norm && matches && (Object.entries(matches) as [ResultGroup, typeof matches[ResultGroup]][]).map(([group, arr]) => arr.length > 0 && (
              <div key={group} style={{ marginBottom: 10 }}>
                <div style={S.groupHead}>{group} · {arr.length}</div>
                {arr.map(r => (
                  <button
                    key={r.id}
                    className="m-state"
                    style={S.resultRow}
                    onClick={() => { onOpenTab({ kind: tabKindFor(group), title: r.label }); closeSearch(); }}
                  >
                    <V6Icon name={iconFor(group)} size={12} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, color: "var(--m-on-surface)", fontWeight: 500 }}>{r.label}</div>
                      <div style={{ fontSize: 11, color: "var(--m-on-surface-mid)" }}>{r.sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            ))}

            {norm && matches && (Object.values(matches) as { id: string }[][]).every(a => a.length === 0) && (
              <div style={{ padding: "16px 12px", fontSize: 12.5, color: "var(--m-on-surface-mid)", textAlign: "center" }}>
                No matches for &ldquo;{q}&rdquo;
              </div>
            )}
          </div>
        </div>
      )}

      {!searchOpen && (
        <div style={{ ...S.modes, padding: expanded ? "16px 8px 8px" : "16px 6px 8px" }}>
          {expanded && <div style={S.sectionHead}>Workspace</div>}
          {MODES.map(m => (
            <button
              key={m.id}
              className={`mode-item ${activeMode === m.id ? "active" : ""}`}
              onClick={() => onPickMode(m.id)}
              title={!expanded ? m.label : undefined}
              aria-label={m.label}
              aria-current={activeMode === m.id ? "page" : undefined}
              style={!expanded ? { justifyContent: "center", padding: "10px 0" } : undefined}
            >
              <span className="mode-icon"><V6Icon name={m.icon} size={14} /></span>
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

      {!searchOpen && (
        <div style={{ ...S.foot, padding: expanded ? "8px 8px 12px" : "8px 6px 12px" }}>
          <button
            className="mode-item"
            style={{ width: "100%", ...(expanded ? null : { justifyContent: "center", padding: "10px 0" }) }}
            title={!expanded ? "Recent activity" : undefined}
            aria-label="Recent activity"
            onClick={() => onOpenTab({ id: "tab-history", kind: "history", title: "Conversation history" })}
          >
            <span className="mode-icon"><V6Icon name="history" size={14} /></span>
            {expanded && <span>Recent activity</span>}
          </button>
          <button
            className="mode-item"
            style={{ width: "100%", ...(expanded ? null : { justifyContent: "center", padding: "10px 0" }) }}
            title={!expanded ? "Settings" : undefined}
            aria-label="Settings"
            onClick={() => onOpenTab({ id: "tab-settings", kind: "settings", title: "Settings" })}
          >
            <span className="mode-icon"><V6Icon name="settings" size={14} /></span>
            {expanded && <span>Settings</span>}
          </button>
        </div>
      )}
    </aside>
  );
}

const S: Record<string, CSSProperties> = {
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
    boxShadow: "0 0 0 3px rgba(46, 92, 138, 0.15)",
    fontFamily: "var(--font-body)",
  },
  searchResults: {
    flex: 1, overflowY: "auto",
    paddingTop: 12,
    minHeight: 0,
  },
  resultRow: {
    all: "unset",
    display: "flex", alignItems: "center", gap: 10,
    padding: "8px 10px",
    borderRadius: 8,
    cursor: "pointer",
    color: "var(--m-on-surface-var)",
    width: "100%", boxSizing: "border-box",
  },
  suggestedHead: {
    fontSize: 11, color: "var(--m-on-surface-mid)",
    marginBottom: 8,
    fontFamily: "var(--font-mono)", letterSpacing: "0.1em", fontWeight: 600,
  },
  groupHead: {
    fontSize: 10, color: "var(--m-on-surface-mid)",
    margin: "8px 4px 4px",
    fontFamily: "var(--font-mono)", letterSpacing: "0.12em", fontWeight: 600,
    textTransform: "uppercase",
  },
  modes: { flex: 1, overflow: "auto", padding: "16px 8px 8px" },
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
  menu: {
    position: "absolute",
    top: "calc(100% + 4px)",
    left: 12, right: 12,
    background: "var(--m-surface-on-light)",
    border: "1px solid var(--m-outline-var)",
    borderRadius: 10,
    boxShadow: "var(--m-elev-3)",
    padding: 4,
    zIndex: 50,
    display: "flex", flexDirection: "column", gap: 1,
  },
  menuItem: {
    all: "unset",
    padding: "8px 10px",
    borderRadius: 6,
    fontSize: 12.5,
    color: "var(--m-on-surface)",
    cursor: "pointer",
    fontWeight: 500,
  },
  menuHeader: { padding: "8px 10px 6px" },
  menuName: { fontSize: 12.5, fontWeight: 600, color: "var(--m-on-surface)" },
  menuEmail: { fontSize: 11, color: "var(--m-on-surface-mid)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  menuDivider: { height: 1, background: "var(--m-outline-var)", margin: "4px 0" },
  menuFooter: { padding: "6px 10px", fontSize: 10.5, color: "var(--m-on-surface-mid)" },
};
