import { type CSSProperties } from "react";

export type Verdict = "pursue" | "watch" | "pass";

const VERDICT_THEME: Record<Verdict, { bg: string; fg: string; chip: string; label: string }> = {
  pursue: { bg: "var(--st-good-bg)",   fg: "var(--st-good-fg)",   chip: "var(--st-good-fg)",   label: "PURSUE" },
  watch:  { bg: "var(--st-review-bg)", fg: "var(--st-review-fg)", chip: "var(--st-review-fg)", label: "WATCH"  },
  pass:   { bg: "var(--st-risk-bg)",   fg: "var(--st-risk-fg)",   chip: "var(--st-risk-fg)",   label: "PASS"   },
};

// Flat CD "Ramp" surface — white card, hairline border, single soft shadow.
// Verdict is conveyed by the status pill, not a watercolor wash.
const VERDICT_SURFACE: Record<Verdict, { background: string; shadow: string; border: string }> = {
  pursue: { background: "var(--surface)", shadow: "0 1px 2px rgba(25,24,19,.06)", border: "var(--line)" },
  watch:  { background: "var(--surface)", shadow: "0 1px 2px rgba(25,24,19,.06)", border: "var(--line)" },
  pass:   { background: "var(--surface)", shadow: "0 1px 2px rgba(25,24,19,.06)", border: "var(--line)" },
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
  const surface = VERDICT_SURFACE[verdict];
  return (
    <div
      onClick={onClick}
      className="wkcard tap"
      style={{
        padding: "16px 18px",
        cursor: "pointer",
        background: surface.background,
        borderColor: surface.border,
        boxShadow: surface.shadow,
      }}
      role="button"
      tabIndex={0}
      aria-label={`${name}, ${theme.label}, ${sub}`}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 15,
            letterSpacing: "-0.015em", color: "var(--ink)",
          }}>{name}</div>
          <div style={{ fontSize: 11.5, color: "var(--ink-2)", marginTop: 2 }}>{sub}</div>
        </div>
        <span style={{
          fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 10,
          letterSpacing: "0.12em",
          color: theme.fg, background: theme.bg,
          padding: "4px 9px", borderRadius: 999, flexShrink: 0,
        }}>{theme.label}</span>
      </div>
      <div style={{ display: "flex", gap: 18, marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--line)" }}>
        <V6Stat label="SDE" val={sde} />
        <V6Stat label="Mult." val={multiple} />
        <V6Stat label="Fit" val={fit} accent={theme.chip} />
      </div>
      <div style={{
        fontSize: 12, color: "var(--ink-3)",
        lineHeight: 1.5, marginTop: 10, textWrap: "pretty",
      }}>{note}</div>
    </div>
  );
}

export function V6Stat({ label, val, accent }: { label: string; val: string | number; accent?: string }) {
  return (
    <div>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--ink-3)",
        letterSpacing: "0.12em", fontWeight: 600,
      }}>{label.toUpperCase()}</div>
      <div style={{
        fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 16,
        letterSpacing: "-0.02em", color: accent ?? "var(--ink)",
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
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 16px",
        borderBottom: last ? "none" : "1px solid var(--line)",
        cursor: onClick ? "pointer" : "default",
        color: "var(--ink-3)",
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
      <span style={W.count}>{count}</span>
    </div>
  );
}

const W: Record<string, CSSProperties> = {
  tag: {
    width: 32, height: 32, borderRadius: 9,
    background: "var(--surface-2)",
    display: "grid", placeItems: "center",
    fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 12,
    color: "var(--ink-2)",
    flexShrink: 0,
  },
  name: {
    fontSize: 13, fontWeight: 600, color: "var(--ink)",
    letterSpacing: "-0.01em",
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  sub: { fontSize: 11.5, color: "var(--ink-3)", marginTop: 1 },
  count: {
    fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--ink-2)",
    padding: "3px 9px", background: "var(--surface-2)", borderRadius: 999,
    fontWeight: 600, flexShrink: 0,
  },
};

export type DocStatusKind = "draft" | "final" | "live" | "sent" | "saved";

const DOC_STATUS: Record<DocStatusKind, { label: string; bg: string; fg: string }> = {
  draft: { label: "DRAFT", bg: "var(--st-review-bg)", fg: "var(--st-review-fg)" },
  final: { label: "FINAL", bg: "var(--st-good-bg)",   fg: "var(--st-good-fg)" },
  live:  { label: "LIVE",  bg: "var(--accent-soft)",  fg: "var(--accent-strong)" },
  sent:  { label: "SENT",  bg: "var(--surface-2)",    fg: "var(--ink-2)" },
  saved: { label: "SAVED", bg: "var(--surface-2)",    fg: "var(--ink-3)" },
};

export function V6DocStatus({ status }: { status: DocStatusKind }) {
  const m = DOC_STATUS[status];
  return (
    <span style={{
      fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, letterSpacing: "0.14em",
      color: m.fg, background: m.bg,
      padding: "3px 7px", borderRadius: 4,
      whiteSpace: "nowrap",
    }}>{m.label}</span>
  );
}
