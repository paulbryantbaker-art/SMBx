/* ============================================================
   cdAtoms.tsx — shared Claude-Design chrome primitives for the
   desktop shell (CDWorkspaceShell + the section reskins). Ported
   from the CD handoff (shell.jsx) but namespaced to the `--cd-*`
   token layer (cdTokens.css, scoped under `.cd-root`). Nothing here
   reads the live V3 `--ink`/`--surface` palette, so it can't collide
   with the warm/green production chrome.
   ============================================================ */
import type { CSSProperties, ReactNode } from "react";

/* ---- Geometric line icons (CD set) ---------------------------------- */
export const CD_ICONS: Record<string, string> = {
  today: "M4 7h16M4 12h16M4 17h10",
  portfolio: "M4 18V9m5 9V5m5 13v-7m5 7V8",
  analysis: "M4 19V5m0 14h16M8 15l3-4 3 2 4-6",
  docs: "M7 3h7l4 4v14H7zM14 3v4h4",
  search: "M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3",
  bell: "M6 9a6 6 0 1112 0c0 5 2 6 2 6H4s2-1 2-6M10 21h4",
  plus: "M12 5v14M5 12h14",
  send: "M5 12l14-7-5 14-3-6-6-1z",
  sparkle: "M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3z",
  settings: "M12 9a3 3 0 100 6 3 3 0 000-6zM4 12h2m12 0h2M12 4v2m0 12v2",
  chevdown: "M6 9l6 6 6-6",
  chevright: "M9 6l6 6-6 6",
  close: "M6 6l12 12M18 6L6 18",
  model: "M4 5h16v14H4zM4 10h16M9 10v9",
  scenario: "M4 12h4l3-8 4 16 3-8h2",
  data: "M5 5h14v4H5zM5 11h14v4H5zM5 17h9",
  doc: "M7 3h7l4 4v14H7zM14 3v4h4",
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  clock: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2",
  bolt: "M13 3L5 14h6l-1 7 8-11h-6z",
  check: "M5 12l5 5L20 6",
  link: "M9 15l6-6M10 6l1-1a4 4 0 016 6l-1 1M14 18l-1 1a4 4 0 01-6-6l1-1",
  flag: "M5 21V4m0 0h11l-2 4 2 4H5",
  comment: "M5 5h14v10H9l-4 4z",
  share: "M4 12v7h16v-7M12 3v12M8 7l4-4 4 4",
  filter: "M4 5h16l-6 7v6l-4 2v-8z",
  expand: "M4 9V4h5M20 15v5h-5M15 4h5v5M9 20H4v-5",
  arrowup: "M12 19V5M6 11l6-6 6 6",
};
export type CDIconName = keyof typeof CD_ICONS | string;

export function CDIcon({ name, size = 18, sw = 1.7, color = "currentColor", style }: { name: CDIconName; size?: number; sw?: number; color?: string; style?: CSSProperties }) {
  const fill = name === "sparkle" || name === "bolt";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: "block", flexShrink: 0, ...style }}>
      <path d={CD_ICONS[name] || ""} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill={fill ? color : "none"} fillOpacity={fill ? 0.14 : 0} />
    </svg>
  );
}

/* ---- Brand mark ----------------------------------------------------- */
export function CDBrand({ compact }: { compact?: boolean }) {
  return (
    <span style={{ fontWeight: 700, fontSize: compact ? 15 : 16, letterSpacing: "-0.03em", whiteSpace: "nowrap", color: "var(--cd-ink)" }}>
      smb<span style={{ color: "var(--cd-accent)" }}>x</span>.ai
    </span>
  );
}

/* ---- Avatar --------------------------------------------------------- */
export function CDAvatar({ initials, size = 26, color }: { initials: string; size?: number; color?: string }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: color || "var(--cd-surface-3)", color: color ? "white" : "var(--cd-ink-2)", display: "grid", placeItems: "center", fontSize: size * 0.36, fontWeight: 700, fontFamily: "var(--cd-sans)", flexShrink: 0, letterSpacing: "0.01em" }}>
      {initials}
    </div>
  );
}

/* ---- Pill ----------------------------------------------------------- */
export type CDTone = "neutral" | "accent" | "pos" | "neg" | "warn";
const PILL_MAP: Record<CDTone, { bg: string; fg: string }> = {
  neutral: { bg: "var(--cd-surface-3)", fg: "var(--cd-ink-2)" },
  accent: { bg: "var(--cd-accent-soft)", fg: "var(--cd-accent-strong)" },
  pos: { bg: "var(--cd-pos-soft)", fg: "var(--cd-pos)" },
  neg: { bg: "var(--cd-neg-soft)", fg: "var(--cd-neg)" },
  warn: { bg: "var(--cd-warn-soft)", fg: "oklch(0.5 0.13 75)" },
};
export function CDPill({ children, tone = "neutral" }: { children: ReactNode; tone?: CDTone }) {
  const c = PILL_MAP[tone];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 999, background: c.bg, color: c.fg, fontSize: 11, fontWeight: 600, fontFamily: "var(--cd-sans)", whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

/* ---- Per-deal color — stable, shared across rail / tab strip / Today.
   Keyed by deal id so the same deal wears the same color everywhere. -- */
export const CD_DEAL_COLORS = ["#3b6fe0", "#2f9e6f", "#1aa8c4", "#d99a2b", "#b65cc4", "#cf5b3e"];
export function cdDealColor(id: number | string): string {
  const s = String(id);
  // Numeric ids and their string form ("504" vs 504) must map to the same
  // color so a deal wears one color across the rail, tab strip, and Today.
  const n = /^\d+$/.test(s) ? parseInt(s, 10) : Array.from(s).reduce((a, c) => a + c.charCodeAt(0), 0);
  return CD_DEAL_COLORS[Math.abs(n) % CD_DEAL_COLORS.length];
}

/* ---- Shared cents formatter (compact EV labels) --------------------- */
export function cdFmtCents(cents: number | null | undefined): string {
  if (cents == null || !isFinite(cents)) return "—";
  const d = cents / 100;
  if (d >= 1e9) return `$${(d / 1e9).toFixed(d >= 1e10 ? 0 : 1)}B`;
  if (d >= 1e6) return `$${(d / 1e6).toFixed(d >= 1e7 ? 0 : 1)}M`;
  if (d >= 1e3) return `$${(d / 1e3).toFixed(0)}K`;
  return `$${Math.round(d)}`;
}
