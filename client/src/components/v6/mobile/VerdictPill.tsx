/* V6 Mobile — verdict pill.

   Redesigned 2026-06-11: the previous version rendered mono-caps micro text
   via the .mb-verdict-pill class, which the app-wide eyebrow/micro-label kill
   rule (index.css ~110-120) display:none's — so every verdict was invisible.
   This version is intentionally NOT in that pattern: sentence-case body type
   at a readable size, tonal background per verdict (muted emerald / gold /
   terracotta from the --mb verdict tokens), inline styles only so no blanket
   class selector can take it out. */

import type { CSSProperties } from "react";
import type { Verdict } from "./types";

interface VerdictPillProps {
  kind?: Verdict;
  /** True when the pill sits on a white/light card; false (default) renders
   *  the on-texture glass variant with a verdict-tinted dot. */
  onLight?: boolean;
}

const LABELS: Record<Verdict, string> = {
  pursue: "Pursue",
  watch:  "Watch",
  pass:   "Pass",
};

/** Tonal (light-surface) colors — soft bg + ink from the verdict tokens. */
const TONES: Record<Verdict, { bg: string; ink: string }> = {
  pursue: { bg: "var(--mb-verdict-pursue-soft)", ink: "var(--mb-verdict-pursue-ink)" },
  watch:  { bg: "var(--mb-warn-soft)",           ink: "var(--mb-warn-ink)" },
  pass:   { bg: "var(--mb-danger-soft)",         ink: "var(--mb-danger-ink)" },
};

/** Dot color on dark/texture surfaces — the mid verdict tone reads on both. */
const DARK_DOT: Record<Verdict, string> = {
  pursue: "var(--mb-verdict-pursue)",
  watch:  "var(--mb-warn)",
  pass:   "var(--mb-danger)",
};

export function VerdictPill({ kind = "pursue", onLight = false }: VerdictPillProps) {
  const tone = TONES[kind];
  const surface: CSSProperties = onLight
    ? { background: tone.bg, color: tone.ink }
    : {
        background: "rgba(255,255,255,0.22)",
        color: "#fff",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "4px 10px",
        borderRadius: 999,
        fontFamily: "var(--mb-font-body)",
        fontSize: 11.5,
        fontWeight: 650,
        lineHeight: 1,
        whiteSpace: "nowrap",
        flexShrink: 0,
        ...surface,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 5,
          height: 5,
          borderRadius: 999,
          background: onLight ? "currentColor" : DARK_DOT[kind],
          flexShrink: 0,
        }}
      />
      {LABELS[kind]}
    </span>
  );
}
