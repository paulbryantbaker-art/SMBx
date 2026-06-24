/**
 * Redesign primitives — the shared building blocks for the Cash App-inspired
 * mobile language (see /MOBILE_REDESIGN.md). Everything separates by tone (no
 * borders, no shadows), uses the system font, and the one violet accent.
 *
 *   Hero        — the one big display number/headline per screen
 *   SectionHeader — big bold sentence-case (NOT an uppercase eyebrow)
 *   ActionRow   — leading · title · one line · an action pill; whitespace-sep
 *   MarkBadge   — confident colored circle + white initial
 *   Sparkline   — a small live-data line
 */
import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import { RT, markColor } from "./rt";

export function Hero({
  label,
  value,
  sub,
  trailing,
}: {
  label?: ReactNode;
  value: ReactNode;
  sub?: ReactNode;
  /** Optional right-aligned element on the value line (e.g. a Sparkline). */
  trailing?: ReactNode;
}) {
  return (
    <div>
      {label != null && <div style={S.heroLabel}>{label}</div>}
      <div style={S.heroValueRow}>
        <span style={S.heroValue}>{value}</span>
        {trailing}
      </div>
      {sub != null && <div style={S.heroSub}>{sub}</div>}
    </div>
  );
}

export function SectionHeader({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div style={{ ...S.section, ...style }}>{children}</div>;
}

export function MarkBadge({
  label,
  seed,
  size = 40,
}: {
  label: string;
  /** Colour seed (deal id / name). Falls back to the label. */
  seed?: number | string;
  size?: number;
}) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: markColor(seed ?? label),
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: Math.round(size * 0.36),
        fontWeight: 500,
        flex: "none",
      }}
    >
      {(label || "?").trim().charAt(0).toUpperCase()}
    </span>
  );
}

export function ActionRow({
  leading,
  title,
  sub,
  action,
  onClick,
}: {
  leading?: ReactNode;
  title: ReactNode;
  sub?: ReactNode;
  /** Right-side affordance — usually an "Open"/"Start" pill (string) or a node. */
  action?: ReactNode;
  onClick?: () => void;
}) {
  const tap = onClick
    ? {
        role: "button",
        tabIndex: 0,
        onClick,
        onKeyDown: (e: KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        },
      }
    : {};
  return (
    <div {...tap} style={{ ...S.row, ...(onClick ? S.rowTap : null) }}>
      {leading != null && <span style={S.rowLead}>{leading}</span>}
      <span style={S.rowText}>
        <span style={S.rowTitle}>{title}</span>
        {sub != null && <span style={S.rowSub}>{sub}</span>}
      </span>
      {action != null &&
        (typeof action === "string" ? <span style={S.pill}>{action}</span> : action)}
    </div>
  );
}

export function Sparkline({
  points,
  color = RT.accent,
  width = 92,
  height = 38,
}: {
  /** y-values 0..1 (0 = bottom). Evenly spaced across the width. */
  points: number[];
  color?: string;
  width?: number;
  height?: number;
}) {
  if (!points.length) return null;
  const pad = 3;
  const w = width - pad * 2;
  const h = height - pad * 2;
  const step = points.length > 1 ? w / (points.length - 1) : 0;
  const d = points
    .map((p, i) => `${(pad + i * step).toFixed(1)},${(pad + (1 - Math.max(0, Math.min(1, p))) * h).toFixed(1)}`)
    .join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <polyline points={d} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const S: Record<string, CSSProperties> = {
  heroLabel: { fontSize: 13, color: RT.muted, display: "flex", alignItems: "center", gap: 4 },
  heroValueRow: { display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginTop: 2 },
  heroValue: { fontSize: 48, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1, color: RT.ink },
  heroSub: { fontSize: 13.5, color: RT.muted, marginTop: 8 },
  section: { fontSize: 19, fontWeight: 600, color: RT.ink, letterSpacing: "-0.01em", margin: "22px 0 2px" },
  row: { display: "flex", alignItems: "center", gap: 12, padding: "12px 0", fontFamily: RT.font, color: RT.ink },
  rowTap: { cursor: "pointer", WebkitTapHighlightColor: "transparent" },
  rowLead: { flex: "none", display: "flex", alignItems: "center" },
  rowText: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 1 },
  rowTitle: { fontSize: 17, fontWeight: 600, lineHeight: 1.3, color: RT.ink, overflow: "hidden", textOverflow: "ellipsis" },
  rowSub: { fontSize: 14, color: RT.muted, lineHeight: 1.35, overflow: "hidden", textOverflow: "ellipsis" },
  pill: {
    flex: "none",
    background: RT.line,
    color: RT.ink,
    borderRadius: RT.rPill,
    padding: "8px 15px",
    fontSize: 13.5,
    fontWeight: 500,
    whiteSpace: "nowrap",
  },
};
