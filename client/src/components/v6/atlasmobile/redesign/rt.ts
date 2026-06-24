/**
 * Redesign tokens (RT) — the Cash App-inspired mobile language. See
 * /MOBILE_REDESIGN.md for the law. Kept SEPARATE from the legacy `T`/`M` tokens
 * so screens migrate one at a time; once every screen is on RT, the old tokens
 * retire. Surfaces separate by TONE (grey page / white element), never borders
 * or shadows. One violet accent; color otherwise lives in content (marks/data).
 */
import { T } from "../../desktop/atlasTokens";

export const RT = {
  // surfaces
  page: "#f3f2ef", // soft warm grey — the page
  card: "#ffffff", // white — every raised element (no border, no shadow)
  // ink scale
  ink: "#16161a",
  ink2: "#3a3a3e",
  muted: "#6c6b66",
  faint: "#a09f9a",
  line: "#e7e6e1", // grey pill fill / hairline when one is truly needed
  // the one accent
  accent: "#5b53d6",
  accentSoft: "#ece9fb",
  accentInk: "#3c3489",
  // live data
  up: "#4d8a26",
  down: "#c2521f",
  // confident mark / icon fills (white glyph/initial on top)
  marks: ["#5b53d6", "#2f6fc4", "#4d8a26", "#a86f12", "#c2521f", "#c43e6a", "#1d8a6e"] as const,
  // radii
  rCard: 18,
  rPill: 999,
  rSheet: 24,
  // type
  font: T.font, // the system font
  mono: 'ui-monospace, "SF Mono", Menlo, monospace',
} as const;

/** Stable mark colour for a deal/row, so a list reads as a set not noise. */
export function markColor(seed: number | string): string {
  const n =
    typeof seed === "number"
      ? Math.abs(Math.trunc(seed))
      : [...String(seed)].reduce((a, c) => a + c.charCodeAt(0), 0);
  return RT.marks[n % RT.marks.length];
}
