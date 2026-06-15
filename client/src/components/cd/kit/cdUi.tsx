/* ============================================================
   cdUi.tsx — shared CD atoms for the app surfaces. Re-exports the
   shell primitives and adds the cards/pills/badges every CD page
   reuses, so Portfolio / Analysis / Files / Studio / Deal detail all
   speak one vocabulary. All --cd-* tokens (works in any .cd-root).
   ============================================================ */
import type { CSSProperties, ReactNode } from "react";
export { CDIcon, CD_ICONS, CDBrand, CDAvatar, CDPill, cdDealColor, cdFmtCents } from "../shell/cdAtoms";
export type { CDIconName, CDTone } from "../shell/cdAtoms";
import { CDIcon } from "../shell/cdAtoms";

/* card — the floating surface every page composes on */
export function CDCard({ children, style, pad = true, className = "" }: { children: ReactNode; style?: CSSProperties; pad?: boolean; className?: string }) {
  return (
    <div className={className} style={{ background: "var(--cd-surface)", border: "1px solid var(--cd-line)", borderRadius: "var(--cd-r-lg)", boxShadow: "var(--cd-shadow-md)", padding: pad ? "var(--cd-pad)" : 0, ...style }}>
      {children}
    </div>
  );
}

/* section title row with optional trailing action */
export function CDSectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
      <h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 700, letterSpacing: "-0.01em", color: "var(--cd-ink)" }}>{children}</h3>
      {action}
    </div>
  );
}

/* eyebrow — the only sanctioned micro-label (functional section labels only) */
export function CDEyebrow({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <span className="cd-eyebrow" style={style}>{children}</span>;
}

/* section divider with an eyebrow on the left */
export function CDDivider({ label }: { label?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0" }}>
      {label && <span className="cd-eyebrow">{label}</span>}
      <div style={{ flex: 1, height: 1, background: "var(--cd-line)" }} />
    </div>
  );
}

/* big KPI stat */
export function CDStat({ label, value, sub, accent }: { label: string; value: ReactNode; sub?: ReactNode; accent?: string }) {
  return (
    <div style={{ background: "var(--cd-surface)", border: "1px solid var(--cd-line)", borderRadius: "var(--cd-r-lg)", boxShadow: "var(--cd-shadow-sm)", padding: "15px 17px", minWidth: 0 }}>
      <div className="cd-eyebrow" style={{ marginBottom: 8 }}>{label}</div>
      <div className="cd-num" style={{ fontSize: 26, fontWeight: 700, lineHeight: 1, color: accent || "var(--cd-ink)", letterSpacing: "-0.02em" }}>{value}</div>
      {sub != null && <div style={{ fontSize: 11.5, color: "var(--cd-ink-3)", marginTop: 7 }}>{sub}</div>}
    </div>
  );
}

/* delta chip (▲/▼ pct) */
export function CDDelta({ v, suffix = "%" }: { v: number; suffix?: string }) {
  const pos = v >= 0;
  return (
    <span className="cd-num" style={{ color: pos ? "var(--cd-pos)" : "var(--cd-neg)", fontSize: 12, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 2 }}>
      <span style={{ fontSize: 9 }}>{pos ? "▲" : "▼"}</span>{Math.abs(v)}{suffix}
    </span>
  );
}

/* league badge — "L9" */
export function CDLeagueBadge({ league }: { league: number }) {
  return (
    <span className="cd-num" style={{ display: "inline-flex", alignItems: "center", height: 18, padding: "0 6px", borderRadius: 5, background: "var(--cd-ink)", color: "var(--cd-surface)", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.02em", flexShrink: 0 }}>
      L{league}
    </span>
  );
}

/* method pill — a methodology item, done (✓) or open (○) */
export function CDMethodPill({ label, done = false }: { label: string; done?: boolean }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px 3px 7px", borderRadius: 999, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", background: done ? "var(--cd-pos-soft)" : "var(--cd-surface-2)", color: done ? "var(--cd-pos)" : "var(--cd-ink-3)", border: `1px solid ${done ? "transparent" : "var(--cd-line)"}` }}>
      <CDIcon name={done ? "check" : "model"} size={11} color={done ? "var(--cd-pos)" : "var(--cd-ink-4)"} />{label}
    </span>
  );
}

/* market heat bar — 5 dashes that fill warm→hot with the score (0–100) */
export function CDHeatBar({ heat, segments = 5 }: { heat: number; segments?: number }) {
  const filled = Math.round((Math.max(0, Math.min(100, heat)) / 100) * segments);
  const tone = heat >= 75 ? "var(--cd-neg)" : heat >= 50 ? "var(--cd-warn)" : heat >= 25 ? "var(--cd-pos)" : "var(--cd-ink-4)";
  return (
    <span style={{ display: "inline-flex", gap: 3, alignItems: "center" }}>
      {Array.from({ length: segments }, (_, i) => (
        <span key={i} style={{ width: 9, height: 4, borderRadius: 2, background: i < filled ? tone : "var(--cd-surface-3)" }} />
      ))}
    </span>
  );
}

/* direction glyph — multiple trend ↗ / → / ↘ */
export function CDDirGlyph({ dir }: { dir: string }) {
  const d = (dir || "").toLowerCase();
  const up = d.includes("expand") || d.includes("up") || d.includes("rising");
  // "contract"/"contracting" is the server's canonical down value (marketHeatService) —
  // without it the glyph rendered a flat "stable" arrow next to the word "contracting".
  const down = d.includes("compress") || d.includes("contract") || d.includes("down") || d.includes("falling");
  const color = up ? "var(--cd-pos)" : down ? "var(--cd-neg)" : "var(--cd-ink-3)";
  return <span style={{ color, fontWeight: 700, fontSize: 12 }}>{up ? "↗" : down ? "↘" : "→"}</span>;
}

/* the THE LINE footnote, used under any Yulia-authored read */
export function CDLineNote({ style }: { style?: CSSProperties }) {
  return <div style={{ fontSize: 10.5, color: "var(--cd-ink-4)", ...style }}>Yulia shows analysis &amp; implications — not transaction advice.</div>;
}
