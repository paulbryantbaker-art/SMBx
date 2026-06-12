/* dataChips.tsx — desktop ports of mobile's data-color primitives
 * (Data Speaks Color, Phase 1 foundation).
 *
 * Color enters the desktop ONLY through data semantics: which industry,
 * which verdict, how strong the fit. Both chips route every hue through
 * shared/verdictMaterial.ts — no hex is restated here.
 *
 * HONESTY FIX vs the mobile original: mobile IndustryIcon defaults to
 * verdict="pursue", painting no-call deals green. The desktop port takes a
 * VerdictKind and callers derive it with deriveVerdictKind() — deals with
 * no real call wear the baseline info-blue, never a guessed verdict.
 */
import { pickIcon } from "../mobile/IndustryIcon";
import { VERDICT_MATERIAL, type VerdictKind } from "./verdictMaterial";

/** Industry glyph on a verdict-tinted gradient chip (mobile IndustryIcon
 *  recipe: 145deg gradient, white glyph, iOS chip shadow). 28px default —
 *  ledger-row scale. */
export function IndustryGlyphChip({
  name, kind = "baseline", size = 28,
}: {
  name: string;
  kind?: VerdictKind;
  size?: number;
}) {
  const Icon = pickIcon(name);
  const [c1, c2] = VERDICT_MATERIAL[kind].iconGradient;
  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.27),
        background: `linear-gradient(145deg, ${c1} 0%, ${c2} 100%)`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        flexShrink: 0,
        boxShadow: [
          "0 0 0 0.5px rgba(0,0,0,0.06)",
          "0 1px 2px rgba(0,0,0,0.10)",
          "inset 0 1px 0 rgba(255,255,255,0.32)",
          "inset 0 0 0 0.5px rgba(255,255,255,0.14)",
        ].join(","),
      }}
    >
      <Icon size={Math.round(size * 0.54)} strokeWidth={2.2} />
    </span>
  );
}

/** Compact fit-score ring (mobile FitGauge reduced to ledger scale): ring =
 *  the kind's tone.mid, track = tone.soft. NO number inside — the mono
 *  numeral renders beside it in the cell, keeping the computed voice ink. */
export function FitRing({
  score, kind = "baseline", size = 18,
}: {
  score: number;
  kind?: VerdictKind;
  size?: number;
}) {
  const stroke = Math.max(2.5, size * 0.14);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const tone = VERDICT_MATERIAL[kind].tone;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`Fit ${clamped} of 100`}
      style={{ flexShrink: 0, verticalAlign: "middle" }}
    >
      <circle cx={size / 2} cy={size / 2} r={radius} fill="transparent" stroke={tone.soft} strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="transparent"
        stroke={tone.mid}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - clamped / 100)}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

/** Flat tonal chip for categorical data (journey, stage, kind): soft bg +
 *  ink text, mobile VerdictPill onLight grammar. Pass a verdictMaterial or
 *  JOURNEY_TONE trio — never restate hexes at call sites. */
export function ToneChip({
  label, tone,
}: {
  label: string;
  tone: { ink: string; soft: string };
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        borderRadius: 999,
        background: tone.soft,
        color: tone.ink,
        fontSize: "0.72rem",
        fontWeight: 700,
        lineHeight: 1.5,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}
