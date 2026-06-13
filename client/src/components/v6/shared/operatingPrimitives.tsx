/* operatingPrimitives.tsx — shared presentational primitives for the
 * computed "operating" intelligence the launcher tabs surface from
 * useTodayOperatingBrief (gate countdowns, deal pulse, model-refresh needs,
 * files-needing-review, DEFINITIVE readiness).
 *
 * THE LINE: everything here is DESCRIPTIVE — state facts the app computed
 * (readiness %, blocker counts, staleness reasons, the next suggested CALL
 * or tool). Never advice, never "you should accept/pass/counter/sign".
 *
 * Color is on-system: the 5 server tones map to tonal trios drawn from
 * verdictMaterial + journeyTone (consume, never restate); urgency RANKING
 * comes from real fields (blockerCount, readiness, status), not from tone.
 */
import type { CSSProperties, ReactNode } from "react";
import { VERDICT_MATERIAL, JOURNEY_TONE } from "./verdictMaterial";
import type { TodayTone, TodayDefinitiveDealState } from "../../../hooks/useTodayOperatingBrief";

type Trio = { mid: string; ink: string; soft: string };

/** Server brief tones → on-system tonal trios. gold=watch, cactus=pursue,
 *  plum=raise(plum); oat/charcoal are the two warm/cool neutrals. */
export const TONE_TRIO: Record<TodayTone, Trio> = {
  gold: VERDICT_MATERIAL.watch.tone,
  cactus: VERDICT_MATERIAL.pursue.tone,
  plum: JOURNEY_TONE.raise,
  oat: { mid: "#B8AE97", ink: "#7A7256", soft: "#F1EEE6" },
  charcoal: { mid: "#8B92A0", ink: "#4A5260", soft: "#EDEFF2" },
};

export function toneTrio(tone?: TodayTone | null): Trio {
  return (tone && TONE_TRIO[tone]) || TONE_TRIO.oat;
}

/** A small tonal chip (label on soft, ink text). The atom of every
 *  operating surface. */
export function OpChip({ label, tone, title }: { label: string; tone?: TodayTone; title?: string }) {
  const t = toneTrio(tone);
  return (
    <span
      title={title}
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "3px 9px", borderRadius: 999,
        background: t.soft, color: t.ink,
        fontSize: "0.72rem", fontWeight: 700, lineHeight: 1.4,
        whiteSpace: "nowrap",
      }}
    >
      <span aria-hidden style={{ width: 5, height: 5, borderRadius: "50%", background: t.mid, flexShrink: 0 }} />
      {label}
    </span>
  );
}

/** A row of blocker chips for a gate-countdown / deal-pulse item. Each
 *  blocker is a state fact the brief computed. */
export function BlockerChips({ blockers, tone, max = 4 }: { blockers: string[]; tone?: TodayTone; max?: number }) {
  if (!blockers || blockers.length === 0) return null;
  const shown = blockers.slice(0, max);
  const extra = blockers.length - shown.length;
  return (
    <span style={{ display: "inline-flex", flexWrap: "wrap", gap: 6, minWidth: 0 }}>
      {shown.map((b, i) => <OpChip key={i} label={b} tone={tone} />)}
      {extra > 0 && <OpChip label={`+${extra} more`} tone="oat" />}
    </span>
  );
}

/** Readiness verdict from the DEFINITIVE DealState. Color RANKS by real
 *  signal: any open blocker → red; high completeness → green; in between →
 *  amber. The DRL level + score% are the computed facts on display. */
export function readinessKind(d?: TodayDefinitiveDealState | null): "ready" | "gaps" | "blocked" | null {
  if (!d) return null;
  if (d.blockerCount > 0) return "blocked";
  if (d.score >= 70 && d.missingCount === 0) return "ready";
  return "gaps";
}

const READINESS_TONE: Record<"ready" | "gaps" | "blocked", Trio> = {
  ready: VERDICT_MATERIAL.pursue.tone,
  gaps: VERDICT_MATERIAL.watch.tone,
  blocked: VERDICT_MATERIAL.pass.tone,
};

const READINESS_WORD: Record<"ready" | "gaps" | "blocked", string> = {
  ready: "Ready",
  gaps: "Input gaps",
  blocked: "Blocked",
};

/** A compact readiness badge: DRL level · score% · blocker count. Descriptive
 *  only. Renders nothing when there's no DEFINITIVE state (honest absence). */
export function ReadinessBadge({ state, compact = false }: { state?: TodayDefinitiveDealState | null; compact?: boolean }) {
  const kind = readinessKind(state);
  if (!kind || !state) return null;
  const t = READINESS_TONE[kind];
  const detail = state.blockerCount > 0
    ? `${state.blockerCount} blocker${state.blockerCount === 1 ? "" : "s"}`
    : state.missingCount > 0
      ? `${state.missingCount} gap${state.missingCount === 1 ? "" : "s"}`
      : `${state.score}%`;
  return (
    <span
      title={`${state.readinessLevel} · ${state.score}% complete · ${state.sourceCount} sources`}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: compact ? "2px 8px" : "3px 10px", borderRadius: 999,
        background: t.soft, color: t.ink,
        fontSize: "0.72rem", fontWeight: 700, lineHeight: 1.4, whiteSpace: "nowrap",
      }}
    >
      <span aria-hidden style={{ width: 6, height: 6, borderRadius: "50%", background: t.mid, flexShrink: 0 }} />
      {compact ? `${state.readinessLevel} · ${detail}` : `${READINESS_WORD[kind]} · ${detail}`}
    </span>
  );
}

/** The page-level NEXT-MOVE BAR: one line of computed state facts distilled
 *  from the brief. Honest fallback when nothing is waiting. Descriptive,
 *  never advisory. */
export function NextMoveBar({
  parts, tone = "plum", icon, onClick, ctaLabel,
}: {
  parts: string[];
  tone?: TodayTone;
  icon?: ReactNode;
  onClick?: () => void;
  ctaLabel?: string;
}) {
  const t = toneTrio(tone);
  const empty = parts.length === 0;
  const text = empty ? "Portfolio is current — no blockers waiting." : parts.join("  ·  ");
  const Wrapper: any = onClick ? "button" : "div";
  return (
    <Wrapper
      {...(onClick ? { type: "button", className: "wk-tap", onClick } : {})}
      style={{
        ...(onClick ? BTN_RESET : {}),
        display: "flex", alignItems: "center", gap: 12,
        width: "100%", boxSizing: "border-box",
        padding: "13px 16px", borderRadius: 14,
        background: empty ? "var(--surface-2)" : t.soft,
        border: `1px solid ${empty ? "var(--wk-hairline-2)" : "transparent"}`,
        cursor: onClick ? "pointer" : "default",
        textAlign: "left",
      }}
    >
      <span aria-hidden style={{ display: "inline-flex", color: empty ? "var(--ink-3)" : t.ink, flexShrink: 0 }}>
        {icon}
      </span>
      <span style={{ flex: 1, minWidth: 0, fontSize: "0.9rem", fontWeight: 600, color: empty ? "var(--ink-2)" : t.ink, lineHeight: 1.4 }}>
        {text}
      </span>
      {onClick && ctaLabel && (
        <span aria-hidden style={{ flexShrink: 0, fontSize: "0.8rem", fontWeight: 700, color: empty ? "var(--ink-3)" : t.ink }}>{ctaLabel} ›</span>
      )}
    </Wrapper>
  );
}

export const BTN_RESET: CSSProperties = {
  appearance: "none",
  border: 0,
  margin: 0,
  font: "inherit",
  color: "inherit",
  background: "transparent",
};
