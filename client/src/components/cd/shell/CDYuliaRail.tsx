/* ============================================================
   CDYuliaRail — the persistent right rail. Open: a 348px floating
   card whose body hosts the existing V6 chat (passed as children),
   so all chat logic/streaming/staged-actions are reused untouched.
   Collapsed: a 50px strip with the Yulia glyph (click to expand).
   Replaces the FAB + slide-in window on desktop.
   ============================================================ */
import type { ReactNode } from "react";
import { CDIcon, CDPill } from "./cdAtoms";

export function CDYuliaRail({
  open, onToggle, dealLabel, children, topGap = 0,
}: {
  open: boolean;
  onToggle: (next: boolean) => void;
  dealLabel?: string;
  children: ReactNode;
  topGap?: number;
}) {
  if (!open) {
    return (
      <button onClick={() => onToggle(true)} title="Open Yulia" aria-label="Open Yulia" style={{ width: 50, flexShrink: 0, margin: `${topGap}px 8px 8px 8px`, borderRadius: "var(--cd-r-lg)", background: "var(--cd-surface)", border: "1px solid var(--cd-line)", boxShadow: "var(--cd-shadow-md)", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 16, gap: 14, cursor: "pointer" }}>
        <span style={{ width: 30, height: 30, borderRadius: 9, background: "var(--cd-accent-soft)", display: "grid", placeItems: "center" }}><CDIcon name="sparkle" size={17} color="var(--cd-accent)" /></span>
        <span style={{ writingMode: "vertical-rl", fontSize: 11.5, fontWeight: 700, color: "var(--cd-ink-3)", letterSpacing: "0.06em" }}>Yulia</span>
      </button>
    );
  }
  return (
    <div style={{ width: 360, flexShrink: 0, margin: `${topGap}px 8px 8px 8px`, borderRadius: "var(--cd-r-lg)", border: "1px solid var(--cd-line)", boxShadow: "var(--cd-shadow-md)", background: "var(--cd-surface)", display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 14px", borderBottom: "1px solid var(--cd-line)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
          <div style={{ width: 26, height: 26, borderRadius: 8, background: "var(--cd-accent-soft)", display: "grid", placeItems: "center", flexShrink: 0 }}><CDIcon name="sparkle" size={15} color="var(--cd-accent)" /></div>
          <span style={{ fontWeight: 700, fontSize: 13.5, color: "var(--cd-ink)" }}>Yulia</span>
          {dealLabel && <CDPill tone="accent">{dealLabel}</CDPill>}
        </div>
        <button onClick={() => onToggle(false)} title="Collapse" style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "transparent", display: "grid", placeItems: "center", cursor: "pointer", padding: 0 }}><CDIcon name="close" size={16} color="var(--cd-ink-3)" /></button>
      </div>
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );
}
