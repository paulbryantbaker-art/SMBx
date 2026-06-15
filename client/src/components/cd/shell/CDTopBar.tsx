/* ============================================================
   CDTopBar — the workspace top bar. Hamburger + brand on the left,
   a centered segmented section selector (Today · Portfolio ·
   Analysis · Studio), and the right cluster: search, notification
   bell (slotted in from V6), Yulia toggle, avatar. Presentational —
   all state is owned by V6App.
   ============================================================ */
import type { ReactNode } from "react";
import { CDIcon, CDAvatar, CDBrand } from "./cdAtoms";

export type CDSectionKey = "today" | "portfolio" | "analysis" | "studio";
export const CD_SECTIONS: Array<{ key: CDSectionKey; label: string }> = [
  { key: "today", label: "Today" },
  { key: "portfolio", label: "Portfolio" },
  { key: "analysis", label: "Analysis" },
  { key: "studio", label: "Studio" },
];

const ghostBtn: React.CSSProperties = { position: "relative", width: 36, height: 36, borderRadius: 9, border: "1px solid transparent", background: "transparent", display: "grid", placeItems: "center", cursor: "pointer", padding: 0 };

export function CDTopBar({
  activeSection, onSection, onToggleNav, onSearch,
  notifBell, yuliaOpen, onToggleYulia, avatarInitials, onAvatar,
}: {
  activeSection: CDSectionKey;
  onSection: (s: CDSectionKey) => void;
  onToggleNav: () => void;
  onSearch: () => void;
  notifBell?: ReactNode;
  yuliaOpen: boolean;
  onToggleYulia: () => void;
  avatarInitials: string;
  onAvatar: () => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "0 16px", height: 60, background: "transparent", flexShrink: 0, zIndex: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <button onClick={onToggleNav} title="Toggle sidebar" style={ghostBtn}><CDIcon name="today" size={18} color="var(--cd-ink-3)" /></button>
        <CDBrand />
      </div>
      <div style={{ display: "flex", gap: 3, background: "var(--cd-surface-2)", border: "1px solid var(--cd-line)", borderRadius: 11, padding: 4, flexShrink: 0 }}>
        {CD_SECTIONS.map((s) => {
          const active = s.key === activeSection;
          return (
            <button key={s.key} onClick={() => onSection(s.key)} aria-current={active ? "page" : undefined} style={{ padding: "7px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none", fontFamily: "var(--cd-sans)", background: active ? "var(--cd-surface)" : "transparent", color: active ? "var(--cd-ink)" : "var(--cd-ink-3)", boxShadow: active ? "var(--cd-shadow-sm)" : "none" }}>{s.label}</button>
          );
        })}
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <button onClick={onSearch} title="Search · ⌘K" style={ghostBtn}><CDIcon name="search" size={17} color="var(--cd-ink-3)" /></button>
        {notifBell}
        <button onClick={onToggleYulia} title="Toggle Yulia" aria-pressed={yuliaOpen} style={{ ...ghostBtn, width: "auto", padding: "0 11px", gap: 7, background: yuliaOpen ? "var(--cd-accent-soft)" : "transparent" }}>
          <CDIcon name="sparkle" size={16} color={yuliaOpen ? "var(--cd-accent)" : "var(--cd-ink-3)"} />
          <span style={{ fontSize: 12.5, fontWeight: 600, color: yuliaOpen ? "var(--cd-accent-strong)" : "var(--cd-ink-2)" }}>Yulia</span>
        </button>
        <div style={{ width: 1, height: 24, background: "var(--cd-line)" }} />
        <button onClick={onAvatar} title="Account" style={{ border: "none", background: "transparent", cursor: "pointer", padding: 0, borderRadius: "50%" }}><CDAvatar initials={avatarInitials} size={30} color="var(--cd-accent)" /></button>
      </div>
    </div>
  );
}
