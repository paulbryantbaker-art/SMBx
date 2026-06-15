/* ============================================================
   CDLeftRail — the workspace sidebar. Leads with "New deal", then
   the live active-deal list (color dot · name · EV), then the
   section-contextual module nav (changes with the active section),
   Settings, and the signed-in user. Collapses to a 66px icon rail.
   Presentational — V6App owns the data + handlers.
   ============================================================ */
import { CDIcon, CDAvatar, type CDIconName } from "./cdAtoms";

export interface CDRailDeal { id: number; code: string; evLabel: string; color: string }
export interface CDRailNavItem { icon: CDIconName; label: string; active?: boolean; badge?: number | null; onClick: () => void }
export interface CDRailModuleNav { label: string; items: CDRailNavItem[] }

export function CDLeftRail({
  open, deals, activeGroupId, onOpenDeal, onNewDeal, moduleNav, userName, userSub, onSettings,
}: {
  open: boolean;
  deals: CDRailDeal[];
  activeGroupId: string | null;
  onOpenDeal: (d: CDRailDeal) => void;
  onNewDeal: () => void;
  moduleNav: CDRailModuleNav;
  userName: string;
  userSub: string;
  onSettings: () => void;
}) {
  const initials = (userName.replace(/[^a-zA-Z]/g, "").slice(0, 2) || "SX").toUpperCase();
  return (
    <div style={{ width: open ? 240 : 66, flexShrink: 0, background: "transparent", display: "flex", flexDirection: "column", transition: "width .22s cubic-bezier(.4,0,.2,1)", overflow: "hidden" }}>
      <div style={{ padding: open ? "14px 14px" : "14px 13px", flexShrink: 0 }}>
        <button onClick={onNewDeal} title="New deal" style={{ display: "flex", alignItems: "center", justifyContent: open ? "flex-start" : "center", gap: 9, width: "100%", padding: open ? "9px 12px" : "9px", borderRadius: "var(--cd-r-md)", border: "1px solid var(--cd-line)", background: "var(--cd-surface)", boxShadow: "var(--cd-shadow-sm)", cursor: "pointer", fontFamily: "var(--cd-sans)", fontSize: 13, fontWeight: 600, color: "var(--cd-ink)" }}>
          <CDIcon name="plus" size={16} color="var(--cd-accent)" />{open && "New deal"}
        </button>
      </div>

      <div className="cd-scrollable" style={{ flex: 1, overflow: "auto", padding: "0 13px", minHeight: 0 }}>
        {open && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 11px 9px" }}>
            <span className="cd-eyebrow">Active deals</span>
            <span className="cd-num" style={{ fontSize: 10.5, fontWeight: 700, color: "var(--cd-ink-4)" }}>{deals.length}</span>
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {deals.map((d) => {
            const sel = activeGroupId === String(d.id) || activeGroupId === d.code;
            return (
              <button key={d.id} title={d.code} onClick={() => onOpenDeal(d)} aria-current={sel ? "page" : undefined} style={{ display: "flex", alignItems: "center", gap: 10, padding: open ? "8px 11px" : "9px", borderRadius: "var(--cd-r-md)", border: sel ? "1px solid var(--cd-line)" : "1px solid transparent", background: sel ? "var(--cd-surface)" : "transparent", boxShadow: sel ? "var(--cd-shadow-sm)" : "none", cursor: "pointer", width: "100%", justifyContent: open ? "flex-start" : "center", textAlign: "left" }}>
                <span style={{ width: open ? 8 : 10, height: open ? 8 : 10, borderRadius: 3, background: d.color, flexShrink: 0 }} />
                {open && <span style={{ fontSize: 12.5, fontWeight: sel ? 600 : 500, color: sel ? "var(--cd-ink)" : "var(--cd-ink-2)", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.code}</span>}
                {open && <span className="cd-num" style={{ fontSize: 10.5, color: "var(--cd-ink-4)" }}>{d.evLabel}</span>}
              </button>
            );
          })}
          {open && deals.length === 0 && <div style={{ fontSize: 11.5, color: "var(--cd-ink-4)", padding: "4px 11px" }}>No active deals yet.</div>}
        </div>

        {open && (
          <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "18px 11px 9px" }}>
            <span className="cd-eyebrow">{moduleNav.label}</span>
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {moduleNav.items.map((it, i) => (
            <button key={i} title={it.label} onClick={it.onClick} aria-current={it.active ? "page" : undefined} style={{ display: "flex", alignItems: "center", gap: 11, padding: open ? "8px 11px" : "9px", borderRadius: "var(--cd-r-md)", border: it.active ? "1px solid var(--cd-line)" : "1px solid transparent", background: it.active ? "var(--cd-surface)" : "transparent", boxShadow: it.active ? "var(--cd-shadow-sm)" : "none", cursor: "pointer", width: "100%", justifyContent: open ? "flex-start" : "center" }}>
              <CDIcon name={it.icon} size={17} color={it.active ? "var(--cd-accent)" : "var(--cd-ink-3)"} />
              {open && <span style={{ fontSize: 12.5, fontWeight: it.active ? 600 : 500, color: it.active ? "var(--cd-ink)" : "var(--cd-ink-2)", flex: 1, textAlign: "left" }}>{it.label}</span>}
              {open && it.badge != null && it.badge > 0 && <span className="cd-num" style={{ fontSize: 10.5, fontWeight: 700, color: "var(--cd-ink-3)", background: "var(--cd-surface-3)", borderRadius: 6, padding: "1px 6px" }}>{it.badge}</span>}
            </button>
          ))}
        </div>

        {open && <div style={{ height: 1, background: "var(--cd-line)", margin: "12px 11px 8px" }} />}
        <button title="Settings" onClick={onSettings} style={{ display: "flex", alignItems: "center", gap: 11, padding: open ? "8px 11px" : "9px", borderRadius: "var(--cd-r-md)", border: "1px solid transparent", background: "transparent", cursor: "pointer", width: "100%", justifyContent: open ? "flex-start" : "center" }}>
          <CDIcon name="settings" size={17} color="var(--cd-ink-3)" />
          {open && <span style={{ fontSize: 12.5, fontWeight: 500, color: "var(--cd-ink-2)", flex: 1, textAlign: "left" }}>Settings</span>}
        </button>
      </div>

      <div style={{ borderTop: "1px solid var(--cd-line)", padding: open ? "11px 16px" : "11px 0", flexShrink: 0, display: "flex", justifyContent: open ? "flex-start" : "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
          <CDAvatar initials={initials} size={30} color="var(--cd-accent)" />
          {open && <div style={{ minWidth: 0 }}><div style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "var(--cd-ink)" }}>{userName}</div><div style={{ fontSize: 10.5, color: "var(--cd-ink-3)", whiteSpace: "nowrap" }}>{userSub}</div></div>}
        </div>
      </div>
    </div>
  );
}
