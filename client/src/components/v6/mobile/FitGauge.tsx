/* V6 Mobile — Circular FIT score gauge.
   Replaces the giant Y icon block on Detail's hero with something
   that actually communicates data: a radial progress ring showing
   how strong the deal fits the user's thesis (0–100).
   Color is verdict-driven (green pursue, amber watch, red pass) so
   the gauge encodes both "how strong" and "Yulia's call" in one
   visual unit. */

import type { Verdict } from "./types";

interface FitGaugeProps {
  /** Score 0–100. Renders as a percentage of the ring. */
  score: number;
  /** Verdict drives the ring color and the text-shadow accent. */
  verdict?: Verdict;
  /** Outer diameter in px. Default 100, matches former YIcon hero footprint. */
  size?: number;
  /** Stroke width as a fraction of size. Default 0.10 (10% of diameter). */
  strokeRatio?: number;
}

const VERDICT_COLOR: Record<Verdict, string> = {
  pursue: "var(--mb-verdict-pursue-ink)",   // #3F8A6A
  watch:  "var(--mb-warn-ink)",              // #9C7128
  pass:   "var(--mb-danger-ink)",            // #A85248
};

const VERDICT_TRACK: Record<Verdict, string> = {
  pursue: "var(--mb-verdict-pursue-soft)",  // #E6F3EC
  watch:  "var(--mb-warn-soft)",             // #FAF1E1
  pass:   "var(--mb-danger-soft)",           // #FBEAE7
};

export function FitGauge({
  score, verdict = "pursue", size = 100, strokeRatio = 0.10,
}: FitGaugeProps) {
  const stroke = size * strokeRatio;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const dashOffset = circumference * (1 - clamped / 100);
  const ringColor = VERDICT_COLOR[verdict];
  const trackColor = VERDICT_TRACK[verdict];

  return (
    <div
      role="img"
      aria-label={`Fit score ${clamped} out of 100, verdict ${verdict}`}
      style={{
        width: size,
        height: size,
        position: "relative",
        flexShrink: 0,
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={trackColor}
          strokeWidth={stroke}
        />
        {/* Progress arc — rotated -90deg so it starts at top */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={ringColor}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{
            transition: "stroke-dashoffset 600ms cubic-bezier(0.25, 1, 0.5, 1)",
          }}
        />
      </svg>
      {/* Centered number + label */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
        }}
      >
        <div
          style={{
            fontFamily: "var(--mb-font-display)",
            fontWeight: 800,
            fontSize: size * 0.32,
            letterSpacing: "-1px",
            color: ringColor,
            lineHeight: 1,
          }}
        >{clamped}</div>
        <div
          className="mb-mono"
          style={{
            fontSize: size * 0.10,
            fontWeight: 700,
            letterSpacing: "0.12em",
            color: "var(--mb-ink-3)",
            marginTop: 2,
          }}
        >FIT</div>
      </div>
    </div>
  );
}
