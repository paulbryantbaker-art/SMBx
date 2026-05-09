import { type CSSProperties } from "react";
import { RANDOM_TEXTURES } from "../../../lib/randomTextures";

export type Verdict = "pursue" | "watch" | "pass";

const VERDICT_THEME: Record<Verdict, { bg: string; fg: string; chip: string; label: string }> = {
  pursue: { bg: "var(--m-pursue-container)", fg: "var(--m-pursue-on-cont)", chip: "var(--m-pursue)", label: "PURSUE" },
  watch:  { bg: "var(--m-watch-container)",  fg: "#3F2E00",                 chip: "var(--m-watch)",  label: "WATCH"  },
  pass:   { bg: "var(--m-pass-container)",   fg: "#4A1410",                 chip: "var(--m-pass)",   label: "PASS"   },
};

interface DealCardProps {
  verdict: Verdict;
  name: string;
  sub: string;
  fit: number;
  sde: string;
  multiple: string;
  note: string;
  onClick: () => void;
}

export function V6DealCard({ verdict, name, sub, fit, sde, multiple, note, onClick }: DealCardProps) {
  const theme = VERDICT_THEME[verdict];
  return (
    <div
      onClick={onClick}
      className="m-card m-state tap"
      style={{
        padding: "16px 18px",
        cursor: "pointer",
        backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.94), rgba(248,250,255,0.82)), url('${RANDOM_TEXTURES.card}')`,
        backgroundSize: "cover, cover",
        backgroundPosition: "center, center",
      }}
      role="button"
      tabIndex={0}
      aria-label={`${name}, ${theme.label}, ${sub}`}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15,
            letterSpacing: "-0.015em", color: "var(--m-on-surface)",
          }}>{name}</div>
          <div style={{ fontSize: 11.5, color: "var(--m-on-surface-mid)", marginTop: 2 }}>{sub}</div>
        </div>
        <span style={{
          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 10,
          letterSpacing: "0.12em",
          color: theme.fg, background: theme.bg,
          padding: "4px 9px", borderRadius: 999, flexShrink: 0,
        }}>{theme.label}</span>
      </div>
      <div style={{ display: "flex", gap: 18, marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--m-outline-var)" }}>
        <V6Stat label="SDE" val={sde} />
        <V6Stat label="Mult." val={multiple} />
        <V6Stat label="Fit" val={fit} accent={theme.chip} />
      </div>
      <div style={{
        fontSize: 12, color: "var(--m-on-surface-var)",
        lineHeight: 1.5, marginTop: 10, textWrap: "pretty",
      }}>{note}</div>
    </div>
  );
}

export function V6Stat({ label, val, accent }: { label: string; val: string | number; accent?: string }) {
  return (
    <div>
      <div className="mono" style={{
        fontSize: 9, color: "var(--m-on-surface-mid)",
        letterSpacing: "0.12em", fontWeight: 600,
      }}>{label.toUpperCase()}</div>
      <div className="mono" style={{
        fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16,
        letterSpacing: "-0.02em", color: accent ?? "var(--m-on-surface)",
        marginTop: 1, fontVariantNumeric: "tabular-nums",
      }}>{val}</div>
    </div>
  );
}

interface WatchRowProps {
  tag: string;
  name: string;
  sub: string;
  count: number;
  last: boolean;
  /** Called when the row is tapped or activated via keyboard. */
  onClick?: () => void;
}

export function V6WatchRow({ tag, name, sub, count, last, onClick }: WatchRowProps) {
  return (
    <div
      className="m-state"
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 16px",
        borderBottom: last ? "none" : "1px solid var(--m-outline-var)",
        cursor: onClick ? "pointer" : "default",
        color: "var(--m-on-surface-var)",
      }}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      <div style={W.tag}>{tag}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={W.name}>{name}</div>
        <div style={W.sub}>{sub}</div>
      </div>
      <span className="mono" style={W.count}>{count}</span>
    </div>
  );
}

const W: Record<string, CSSProperties> = {
  tag: {
    width: 32, height: 32, borderRadius: 9,
    background: "var(--m-surface-2)",
    display: "grid", placeItems: "center",
    fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 12,
    color: "var(--m-on-surface-var)",
    flexShrink: 0,
  },
  name: {
    fontSize: 13, fontWeight: 600, color: "var(--m-on-surface)",
    letterSpacing: "-0.01em",
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  sub: { fontSize: 11.5, color: "var(--m-on-surface-mid)", marginTop: 1 },
  count: {
    fontSize: 10.5, color: "var(--m-on-surface-var)",
    padding: "3px 9px", background: "var(--m-surface-2)", borderRadius: 999,
    fontWeight: 600, flexShrink: 0,
  },
};

export type DocStatusKind = "draft" | "final" | "live" | "sent" | "saved";

const DOC_STATUS: Record<DocStatusKind, { label: string; bg: string; fg: string }> = {
  draft: { label: "DRAFT", bg: "var(--m-watch-container)",     fg: "#3F2E00" },
  final: { label: "FINAL", bg: "var(--m-pursue-container)",    fg: "var(--m-pursue-on-cont)" },
  live:  { label: "LIVE",  bg: "var(--m-primary-container)",   fg: "var(--m-on-primary-container)" },
  sent:  { label: "SENT",  bg: "var(--m-secondary-container)", fg: "var(--m-on-secondary-container)" },
  saved: { label: "SAVED", bg: "var(--m-surface-2)",           fg: "var(--m-on-surface-var)" },
};

export function V6DocStatus({ status }: { status: DocStatusKind }) {
  const m = DOC_STATUS[status];
  return (
    <span className="mono" style={{
      fontSize: 9, fontWeight: 700, letterSpacing: "0.14em",
      color: m.fg, background: m.bg,
      padding: "3px 7px", borderRadius: 4,
      whiteSpace: "nowrap",
    }}>{m.label}</span>
  );
}
