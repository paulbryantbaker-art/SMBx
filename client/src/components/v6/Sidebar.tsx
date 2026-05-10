import { useEffect, useRef, useState, type CSSProperties } from "react";
import { MODES, V6Icon } from "./icons";
import type { ModeId, OpenTab } from "./types";

interface SidebarProps {
  activeMode: ModeId;
  onPickMode: (id: ModeId) => void;
  onOpenTab: OpenTab;
  user: { display_name: string | null; email: string } | null;
  onSignIn: () => void;
  onSignUp: () => void;
  onSignOut: () => void;
}

export function V6Sidebar({
  activeMode, onPickMode, onOpenTab,
  user, onSignIn, onSignUp, onSignOut,
}: SidebarProps) {
  const [hover, setHover] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const expanded = pinned || hover || menuOpen;
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

      <div style={{ ...S.modes, padding: expanded ? "18px 8px 8px" : "18px 6px 8px" }}>
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
              <span className="mode-icon"><V6Icon name={m.icon} size={17} /></span>
              {expanded && (
                <>
                  <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.label}</span>
                </>
              )}
            </button>
          ))}
      </div>

      <div style={{ ...S.foot, padding: expanded ? "8px 8px 12px" : "8px 6px 12px" }}>
          <button
            className="mode-item"
            style={{ width: "100%", ...(expanded ? null : { justifyContent: "center", padding: "10px 0" }) }}
            title={!expanded ? "Recent activity" : undefined}
            aria-label="Recent activity"
            onClick={() => onOpenTab({ id: "tab-history", kind: "history", title: "Conversation history" })}
          >
            <span className="mode-icon"><V6Icon name="history" size={17} /></span>
            {expanded && <span>Recent activity</span>}
          </button>
          <button
            className="mode-item"
            style={{ width: "100%", ...(expanded ? null : { justifyContent: "center", padding: "10px 0" }) }}
            title={!expanded ? "Settings" : undefined}
            aria-label="Settings"
            onClick={() => onOpenTab({ id: "tab-settings", kind: "settings", title: "Settings" })}
          >
            <span className="mode-icon"><V6Icon name="settings" size={17} /></span>
            {expanded && <span>Settings</span>}
          </button>
      </div>
    </aside>
  );
}

const S: Record<string, CSSProperties> = {
  rail: {
    flexShrink: 0,
    background: "linear-gradient(180deg, #F5F8FC 0%, #EEF4FA 100%)",
    borderRight: "1px solid #DCE6F1",
    display: "flex", flexDirection: "column", height: "100%",
    transition: "width 180ms ease",
    overflow: "hidden",
    position: "relative", zIndex: 5,
  },
  account: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "12px 14px",
    borderBottom: "1px solid #E1E8F2",
    background: "rgba(248,251,255,0.88)",
  },
  avatar: {
    width: 32, height: 32, borderRadius: 10,
    background: "#1A1918",
    color: "#FFFFFF",
    display: "grid", placeItems: "center",
    fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12,
    letterSpacing: "-0.02em",
    flexShrink: 0,
    boxShadow: "0 8px 18px rgba(26,34,51,0.12)",
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
  modes: { flex: 1, overflow: "auto", padding: "16px 8px 8px" },
  sectionHead: {
    padding: "0 10px 8px",
    fontFamily: "var(--font-mono)", fontSize: 9.5,
    color: "var(--m-on-surface-mid)",
    letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600,
  },
  foot: {
    padding: "8px 8px 12px",
    borderTop: "1px solid #E1E8F2",
    display: "flex", flexDirection: "column", gap: 2,
  },
  menu: {
    position: "absolute",
    top: "calc(100% + 4px)",
    left: 12, right: 12,
    background: "var(--m-surface-on-light)",
    border: "1px solid #DCE6F1",
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
