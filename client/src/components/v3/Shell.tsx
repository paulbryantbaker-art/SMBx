/* V3 — sidebar (deal index) and document tab strip.
   Light institutional palette. Port of dist/source/v3-shell.jsx. */
import { useState, type CSSProperties } from "react";

interface Deal {
  id: string;
  label: string;
  meta: string;
  live?: boolean;
  muted?: boolean;
  tag: string;
}

interface V3SidebarProps {
  activeDeal: string;
  onPick: (id: string) => void;
  onSlash: (cmd: string) => void;
  onCommand: (cmd: string) => void;
}

export function V3Sidebar({ activeDeal, onPick, onSlash, onCommand }: V3SidebarProps) {
  const [q, setQ] = useState("");
  const deals: Deal[] = [
    { id: "sample", label: "Big Fake Deal · sample", meta: "demo", live: true, tag: "S" },
    { id: "d1", label: "HVAC platform · CO", meta: "§3.2", muted: true, tag: "1" },
    { id: "d2", label: "Distribution · OH", meta: "ttm", muted: true, tag: "2" },
    { id: "d3", label: "Auto repair · 4-loc", meta: "BL·12", muted: true, tag: "3" },
    { id: "d4", label: "MEP services · NM", meta: "QoE", muted: true, tag: "4" },
  ];
  return (
    <aside style={vsb.rail}>
      <div style={vsb.brand}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={vsb.brandText}>smbx<span style={{ color: "var(--ink-3)" }}>.</span>ai</span>
        </div>
        <button style={vsb.iconBtn} title="New deal" onClick={() => onCommand("new")}>
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
        </button>
      </div>

      <div style={vsb.searchWrap}>
        <svg width="11" height="11" viewBox="0 0 14 14" fill="none" style={vsb.searchIcon}>
          <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M9 9l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search · / for commands"
          style={vsb.search}
        />
        <span style={vsb.kbd}>⌘K</span>
      </div>

      <div className="thin-scroll" style={vsb.scroll}>
        <div style={vsb.section}>
          <div style={vsb.sectionHead}>
            <span className="eyebrow" style={{ fontSize: 9 }}>Deals</span>
            <span style={vsb.count}>{deals.length}</span>
          </div>
          {deals.map((d) => (
            <button
              key={d.id}
              onClick={() => onPick(d.id)}
              style={{
                ...vsb.dealItem,
                ...(d.id === activeDeal ? vsb.dealActive : null),
              }}
            >
              <span style={{
                ...vsb.dealTag,
                color: d.live ? "var(--go)" : "var(--ink-3)",
                borderColor: d.live ? "var(--go-ring)" : "var(--line-2)",
              }}>
                {d.tag}
              </span>
              <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 13 }}>
                {d.label}
              </span>
              <span className="mono" style={{ fontSize: 10, color: d.live ? "var(--go)" : "var(--ink-4)" }}>
                {d.meta}
              </span>
            </button>
          ))}
        </div>

        <div style={vsb.section}>
          <div style={vsb.sectionHead}>
            <span className="eyebrow" style={{ fontSize: 9 }}>Commands</span>
            <span className="mono" style={{ fontSize: 10, color: "var(--ink-4)" }}>/</span>
          </div>
          {[
            ["/screen", "Screen a teaser"],
            ["/recast", "Recast a P&L"],
            ["/buyers", "Build buyer list"],
            ["/structure", "Model SBA"],
            ["/qoe", "Run QoE Lite"],
            ["/draft", "Draft IOI / LOI"],
          ].map(([cmd, label]) => (
            <button key={cmd} onClick={() => onSlash(cmd)} style={vsb.slashItem}>
              <span className="mono" style={{ color: "var(--go)", fontSize: 11, width: 70 }}>{cmd}</span>
              <span style={{ fontSize: 12.5, color: "var(--ink-2)" }}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={vsb.foot}>
        <div style={vsb.footRow}>
          <button style={vsb.footLink} onClick={() => onSlash("/pricing")}>
            <span className="mono" style={{ color: "var(--go)" }}>/pricing</span>
          </button>
          <button style={vsb.footLink} onClick={() => onSlash("/how")}>
            <span className="mono" style={{ color: "var(--go)" }}>/how</span>
          </button>
          <button style={vsb.footLink} onClick={() => onSlash("/about")}>
            <span className="mono" style={{ color: "var(--go)" }}>/about</span>
          </button>
        </div>
        <button className="btn btn-ghost" style={{ width: "100%", padding: "8px 12px", fontSize: 12.5 }}>
          Sign in
        </button>
      </div>
    </aside>
  );
}

const vsb: Record<string, CSSProperties> = {
  rail: {
    width: 264, flexShrink: 0,
    background: "var(--panel)",
    borderRight: "1px solid var(--line)",
    display: "flex", flexDirection: "column",
    height: "100vh",
  },
  brand: {
    padding: "13px 14px",
    borderBottom: "1px solid var(--line)",
    display: "flex", alignItems: "center", justifyContent: "space-between",
  },
  brandText: {
    fontFamily: "var(--font-display)",
    fontWeight: 700, fontSize: 14.5,
    letterSpacing: "-0.02em",
    color: "var(--ink)",
  },
  iconBtn: {
    all: "unset",
    width: 24, height: 24,
    borderRadius: 5,
    border: "1px solid var(--line-2)",
    background: "var(--surface)",
    display: "grid", placeItems: "center",
    color: "var(--ink-2)", cursor: "pointer",
  },
  searchWrap: {
    margin: "10px 12px 8px",
    position: "relative",
  },
  searchIcon: {
    position: "absolute", left: 9, top: "50%",
    transform: "translateY(-50%)",
    color: "var(--ink-4)",
  },
  search: {
    width: "100%", boxSizing: "border-box",
    border: "1px solid var(--line)",
    background: "var(--bg)",
    borderRadius: 6,
    padding: "6px 38px 6px 26px",
    fontSize: 12.5,
    color: "var(--ink)",
    outline: "none",
    transition: "border-color 100ms",
  },
  kbd: {
    position: "absolute", right: 6, top: "50%",
    transform: "translateY(-50%)",
    fontFamily: "var(--font-mono)", fontSize: 9,
    padding: "2px 5px",
    background: "var(--surface-2)",
    border: "1px solid var(--line)",
    borderRadius: 3,
    color: "var(--ink-3)",
  },
  scroll: { flex: 1, overflowY: "auto" },
  section: { paddingBottom: 8 },
  sectionHead: {
    padding: "12px 14px 6px",
    display: "flex", justifyContent: "space-between", alignItems: "center",
  },
  count: {
    fontFamily: "var(--font-mono)", fontSize: 9.5,
    color: "var(--ink-4)",
  },
  dealItem: {
    all: "unset",
    display: "flex", alignItems: "center", gap: 9,
    width: "100%", boxSizing: "border-box",
    padding: "6px 14px",
    color: "var(--ink-2)",
    cursor: "pointer",
    transition: "background 80ms",
  },
  dealActive: {
    background: "var(--surface)",
    color: "var(--ink)",
    boxShadow: "inset 2px 0 0 var(--go)",
  },
  dealTag: {
    width: 18, height: 18,
    borderRadius: 4,
    border: "1px solid",
    background: "var(--bg)",
    display: "grid", placeItems: "center",
    fontFamily: "var(--font-mono)",
    fontSize: 9.5, fontWeight: 600,
    flexShrink: 0,
  },
  slashItem: {
    all: "unset",
    display: "flex", alignItems: "center", gap: 6,
    width: "100%", boxSizing: "border-box",
    padding: "5px 14px",
    cursor: "pointer",
  },
  foot: {
    padding: 12,
    borderTop: "1px solid var(--line)",
    display: "flex", flexDirection: "column", gap: 8,
  },
  footRow: {
    display: "flex", gap: 4,
  },
  footLink: {
    all: "unset",
    flex: 1,
    padding: "5px 6px",
    fontSize: 11,
    color: "var(--ink-3)",
    cursor: "pointer",
    borderRadius: 4,
    textAlign: "center",
  },
};

// Document tab strip — minimal, IDE-style
interface Tab {
  id: string;
  tag: string;
  label: string;
  modified?: boolean;
  closable?: boolean;
}

interface V3DocTabsProps {
  tabs: Tab[];
  active: string;
  onPick: (id: string) => void;
  onClose: (id: string) => void;
}

export function V3DocTabs({ tabs, active, onPick, onClose }: V3DocTabsProps) {
  return (
    <div style={vdt.bar}>
      <div style={vdt.left} className="thin-scroll">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => onPick(t.id)} style={{
            ...vdt.tab,
            ...(t.id === active ? vdt.tabActive : null),
          }}>
            <span className="mono" style={{ fontSize: 9.5, color: t.id === active ? "var(--go)" : "var(--ink-4)", marginRight: 8 }}>
              {t.tag}
            </span>
            <span>{t.label}</span>
            {t.modified && <span style={{ marginLeft: 7, color: "var(--go)", fontSize: 16, lineHeight: 0 }}>·</span>}
            {t.closable && (
              <span
                role="button"
                onClick={(e) => { e.stopPropagation(); onClose(t.id); }}
                style={vdt.tabClose}
              >×</span>
            )}
          </button>
        ))}
      </div>
      <div style={vdt.right}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span className="pulse-dot" style={{ color: "var(--go)" }} />
          <span className="eyebrow" style={{ fontSize: 9.5 }}>Yulia online</span>
        </span>
        <span style={vdt.divider} />
        <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-4)" }}>
          v0.4.2 · 142ms
        </span>
      </div>
    </div>
  );
}

const vdt: Record<string, CSSProperties> = {
  bar: {
    height: 36, flexShrink: 0,
    background: "var(--panel)",
    borderBottom: "1px solid var(--line)",
    display: "flex", alignItems: "stretch",
  },
  left: { flex: 1, display: "flex", alignItems: "stretch", overflowX: "auto", minWidth: 0 },
  tab: {
    all: "unset",
    padding: "0 14px",
    display: "inline-flex", alignItems: "center",
    fontSize: 12, color: "var(--ink-3)",
    borderRight: "1px solid var(--line)",
    cursor: "pointer", whiteSpace: "nowrap",
    transition: "color 80ms, background 80ms",
  },
  tabActive: {
    background: "var(--surface)",
    color: "var(--ink)",
    boxShadow: "inset 0 -1px 0 var(--surface), inset 0 2px 0 var(--go)",
  },
  tabClose: {
    marginLeft: 8,
    width: 14, height: 14,
    borderRadius: 3,
    display: "inline-grid", placeItems: "center",
    fontSize: 12, color: "var(--ink-4)",
    lineHeight: 1,
  },
  right: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "0 16px",
  },
  divider: {
    width: 1, height: 12, background: "var(--line-2)",
  },
};
