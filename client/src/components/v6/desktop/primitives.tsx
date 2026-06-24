/**
 * Atlas shared primitives. Every screen imports these atoms instead of
 * re-implementing card/pill/KPI styles so the look stays consistent. All
 * inline-styled with the T token object.
 *
 * Honesty helpers `fmtCents` / `fmtCompact` live here too: null/NaN → "—".
 * Money is integer cents (the deal hooks coerce string cents via toNum).
 */
import type { CSSProperties, ReactNode } from "react";
import { T } from "./atlasTokens";
import { CheckIcon } from "./icons";

/* ─── money / number formatting ──────────────────────────── */

/** Format integer cents as the design's "$48.0M" / "$680K" / "$8.4B" style.
 *  null / NaN → "—". */
export function fmtCents(cents: number | null | undefined): string {
  if (cents == null || !Number.isFinite(cents)) return "—";
  const dollars = cents / 100;
  return fmtDollars(dollars);
}

function fmtDollars(dollars: number): string {
  const sign = dollars < 0 ? "-" : "";
  const abs = Math.abs(dollars);
  if (abs >= 1_000_000_000) return `${sign}$${trim(abs / 1_000_000_000)}B`;
  if (abs >= 1_000_000) return `${sign}$${trim(abs / 1_000_000)}M`;
  if (abs >= 1_000) return `${sign}$${Math.round(abs / 1_000)}K`;
  return `${sign}$${Math.round(abs).toLocaleString()}`;
}

/** Compact count/EV formatting ("8.4B" style, no $). null/NaN → "—". */
export function fmtCompact(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `${sign}${trim(abs / 1_000_000_000)}B`;
  if (abs >= 1_000_000) return `${sign}${trim(abs / 1_000_000)}M`;
  if (abs >= 1_000) return `${sign}${trim(abs / 1_000)}K`;
  return `${sign}${Math.round(abs).toLocaleString()}`;
}

function trim(n: number): string {
  // One decimal, drop a trailing ".0".
  return n.toFixed(1).replace(/\.0$/, "");
}

/* ─── Sparkle ✦ in the Gemini gradient ───────────────────── */

export function Sparkle({ size = 17 }: { size?: number }) {
  return (
    <span
      aria-hidden="true"
      style={{
        background: T.spark,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
        fontSize: size,
        lineHeight: 1,
        flex: "none",
      }}
    >
      ✦
    </span>
  );
}

/* ─── MarkBadge — square deal initial tile ───────────────── */

export function MarkBadge({
  letter,
  bg = T.blueBg,
  fg = T.blue,
  size = 26,
  radius = 7,
}: {
  letter: string;
  bg?: string;
  fg?: string;
  size?: number;
  radius?: number;
}) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        flex: "none",
        borderRadius: radius,
        background: bg,
        color: fg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: Math.round(size * 0.46),
        fontWeight: 700,
      }}
    >
      {(letter || "?").slice(0, 1).toUpperCase()}
    </span>
  );
}

/* ─── Avatar — round, gradient or tinted ─────────────────── */

export function Avatar({
  initials,
  bg,
  size = 32,
  gradient = false,
}: {
  initials: string;
  bg?: string;
  size?: number;
  gradient?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        flex: "none",
        borderRadius: "50%",
        background: gradient ? T.avatarGrad : (bg ?? T.blueBg),
        color: gradient ? "#fff" : T.blue,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: Math.round(size * 0.4),
        fontWeight: 600,
      }}
    >
      {(initials || "").slice(0, 2).toUpperCase()}
    </span>
  );
}

/* ─── Pill ────────────────────────────────────────────────── */

export function Pill({
  children,
  bg = T.track,
  fg = T.muted,
  border,
  style,
}: {
  children: ReactNode;
  bg?: string;
  fg?: string;
  border?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        borderRadius: T.rPill,
        padding: "4px 11px",
        fontSize: 12.5,
        fontWeight: 600,
        background: bg,
        color: fg,
        border: border ? `1px solid ${border}` : undefined,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/* ─── ExpiryPill — neutral date countdown ────────────────── */

/** Whole days until an ISO date (ceil); null if absent/invalid. Client clock. */
export function daysUntil(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return Math.ceil((d.getTime() - Date.now()) / 86_400_000);
}

/** A neutral, factual date countdown — never a directive. Past → quiet "Expired";
 *  within 7 days → amber "Expires in Nd"; otherwise nothing. THE LINE: a calendar
 *  fact, not a prioritization. Shared by OffersPanel + MandatesBand so the
 *  threshold/phrasing never drift. */
export function ExpiryPill({ iso, verb = "Expires" }: { iso: string | null | undefined; verb?: string }) {
  const days = daysUntil(iso);
  if (days == null) return null;
  if (days < 0) return <Pill bg={T.track} fg={T.muted2}>Expired</Pill>;
  if (days === 0) return <Pill bg={T.amberBg} fg={T.amber}>{verb} today</Pill>;
  if (days <= 7) return <Pill bg={T.amberBg} fg={T.amber}>{verb} in {days}d</Pill>;
  return null;
}

/* ─── Card ────────────────────────────────────────────────── */

export function Card({
  children,
  pad = 16,
  style,
  hover = false,
  onClick,
}: {
  children: ReactNode;
  pad?: number | string;
  style?: CSSProperties;
  hover?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: T.white,
        border: `1px solid ${T.border}`,
        borderRadius: T.rCard,
        boxShadow: T.shCard,
        padding: pad,
        cursor: onClick ? "pointer" : undefined,
        transition: hover ? "box-shadow .15s ease" : undefined,
        ...style,
      }}
      onMouseEnter={hover ? (e) => { e.currentTarget.style.boxShadow = T.shHover; } : undefined}
      onMouseLeave={hover ? (e) => { e.currentTarget.style.boxShadow = T.shCard; } : undefined}
    >
      {children}
    </div>
  );
}

/* ─── KpiCard ─────────────────────────────────────────────── */

export function KpiCard({
  label,
  value,
  delta,
  deltaColor = T.muted2,
}: {
  label: string;
  value: ReactNode;
  delta?: ReactNode;
  deltaColor?: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        background: T.white,
        border: `1px solid ${T.border}`,
        borderRadius: T.rCard,
        boxShadow: T.shCard,
        padding: "15px 17px",
      }}
    >
      <div style={{ fontSize: 13, color: T.muted, fontWeight: 700, letterSpacing: ".02em", marginBottom: 7 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-.02em", lineHeight: 1, color: T.ink }}>
        {value}
      </div>
      {delta != null && (
        <div style={{ fontSize: 12, marginTop: 6, color: deltaColor }}>{delta}</div>
      )}
    </div>
  );
}

/* ─── Segmented control ───────────────────────────────────── */

export function Segmented<TId extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: TId; label: string }[];
  value: TId;
  onChange: (id: TId) => void;
}) {
  return (
    <div style={{ display: "inline-flex", background: T.track, borderRadius: T.rPill, padding: 3 }}>
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            style={{
              border: "none",
              borderRadius: T.rPill,
              padding: "6px 13px",
              fontSize: 12.5,
              fontWeight: 600,
              cursor: "pointer",
              background: active ? T.white : "transparent",
              color: active ? T.ink : T.muted,
              boxShadow: active ? T.shCard : undefined,
              fontFamily: T.font,
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ─── StepperPills — connected gate/stage pills ──────────── */

export type StepState = "done" | "current" | "upcoming";

export function StepperPills({ steps }: { steps: { label: string; state: StepState }[] }) {
  return (
    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0 }}>
      {steps.map((step, i) => {
        const style = stepPillStyle(step.state);
        return (
          <span key={`${step.label}-${i}`} style={{ display: "inline-flex", alignItems: "center" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                borderRadius: T.rPill,
                padding: "8px 14px",
                fontSize: 13.5,
                fontWeight: 600,
                background: style.bg,
                color: style.fg,
                border: `1px solid ${style.bd}`,
              }}
            >
              <span
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: style.dotBg,
                  color: style.dotFg,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  flex: "none",
                }}
              >
                {step.state === "done" ? "✓" : i + 1}
              </span>
              {step.label}
            </span>
            {i < steps.length - 1 && (
              <span style={{ width: 18, height: 1, background: T.inputBd, flex: "none" }} />
            )}
          </span>
        );
      })}
    </div>
  );
}

function stepPillStyle(state: StepState) {
  if (state === "current") {
    return { bg: T.blueBg, fg: T.blue, bd: T.stageActiveBd, dotBg: T.blue, dotFg: "#fff" };
  }
  if (state === "done") {
    return { bg: T.white, fg: T.ink, bd: T.border, dotBg: T.green, dotFg: "#fff" };
  }
  return { bg: T.white, fg: T.muted2, bd: T.hair, dotBg: T.progTrack, dotFg: T.muted2 };
}

/* ─── ProgressBar ─────────────────────────────────────────── */

export function ProgressBar({ pct, color = T.blue }: { pct: number; color?: string }) {
  const clamped = Math.max(0, Math.min(100, Number.isFinite(pct) ? pct : 0));
  return (
    <div style={{ height: 5, borderRadius: T.rPill, background: T.progTrack, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${clamped}%`, background: color, borderRadius: T.rPill }} />
    </div>
  );
}

/* ─── SectionLabel ────────────────────────────────────────── */

/** Quiet section label. Sentence-case (NOT an uppercase mono eyebrow kicker — the
 *  LOCKED no-gratuitous-eyebrows rule): a calm grouping label, not chrome. */
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div style={{ fontSize: 14, color: T.ink, fontWeight: 700, letterSpacing: "-0.01em" }}>
      {children}
    </div>
  );
}

/* ─── EmptyState ──────────────────────────────────────────── */

export function EmptyState({
  title,
  hint,
  cta,
  onCta,
  accent = T.blue,
  onAccent = "#fff",
}: {
  title: string;
  hint?: string;
  cta?: string;
  onCta?: () => void;
  /** CTA fill — desktop keeps slate-blue; mobile passes the brand-green RT.accent. */
  accent?: string;
  /** CTA text/foreground on the fill — desktop white; mobile passes RT.onAccent
   *  (dark, because the bright green fill needs dark text). */
  onAccent?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 10,
        padding: "48px 24px",
        margin: "auto",
        maxWidth: 420,
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 600, color: T.ink }}>{title}</div>
      {hint && <div style={{ fontSize: 13.5, color: T.muted, lineHeight: 1.5 }}>{hint}</div>}
      {cta && onCta && (
        <button
          type="button"
          onClick={onCta}
          style={{
            marginTop: 4,
            background: accent,
            color: onAccent,
            border: "none",
            borderRadius: T.rPill,
            padding: "9px 18px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: T.font,
          }}
        >
          {cta}
        </button>
      )}
    </div>
  );
}

/* ─── LoadingState ────────────────────────────────────────── */

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: "48px 24px",
        margin: "auto",
        color: T.muted,
        fontSize: 13.5,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 14,
          height: 14,
          borderRadius: "50%",
          border: `2px solid ${T.progTrack}`,
          borderTopColor: T.blue,
          animation: "atlas-glow 1s linear infinite",
        }}
      />
      {label}
    </div>
  );
}

/* ─── StatusDot — checklist circle ───────────────────────── */

export function StatusDot({ state }: { state: "done" | "prog" | "open" }) {
  if (state === "done") {
    return (
      <span
        style={{
          width: 16,
          height: 16,
          flex: "none",
          borderRadius: "50%",
          background: T.green,
          color: "#fff",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CheckIcon size={10} c="#fff" />
      </span>
    );
  }
  if (state === "prog") {
    return (
      <span
        style={{
          width: 16,
          height: 16,
          flex: "none",
          borderRadius: "50%",
          border: `2px solid ${T.blue}`,
          color: T.blue,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 9,
          fontWeight: 700,
        }}
      >
        ▷
      </span>
    );
  }
  return (
    <span
      style={{
        width: 16,
        height: 16,
        flex: "none",
        borderRadius: "50%",
        border: `2px solid ${T.inputBd}`,
        background: T.white,
      }}
    />
  );
}
