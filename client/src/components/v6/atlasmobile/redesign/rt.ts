/**
 * Redesign tokens (RT) — the Cash App-inspired mobile language. See
 * /MOBILE_REDESIGN.md for the law. Kept SEPARATE from the legacy `T`/`M` tokens
 * so screens migrate one at a time; once every screen is on RT, the old tokens
 * retire. Surfaces separate by TONE (warm off-white page / white element), never
 * borders or shadows.
 *
 * COLOR PROFILE = the external/marketing palette (client/src/marketing/
 * marketing.css): a warm off-white page, warm near-black inks, and the brand
 * GREEN accent. Green works as a FILL with dark on-accent text — it is NOT
 * legible as text/icon on white, so accent-colored text/icons use `accentInk`
 * (deep green) and fills carry `onAccent` (#00210F) text. Accent stays rationed:
 * active nav pill · the Yulia button · primary CTAs.
 */
import { T } from "../../desktop/atlasTokens";

export const RT = {
  // surfaces (warm — matches marketing --bg / --surface)
  page: "#F4F4F6", // neutral light grey — the page (less brown; closer to Cash App)
  card: "#ffffff", // white — every raised element (no border, no shadow)
  // ink scale (NEUTRAL greys — de-tinted + DARKENED so secondary text stays
  // crisp on the light page; Cash App never floats light type on light grey)
  ink: "#18181B",
  ink2: "#3A3A40", // body / descriptions — dark, not grey
  muted: "#5A5A62", // secondary (subs, labels) — readable medium-dark, AA+ on the page
  faint: "#86868E", // tertiary (timestamps) only — never body
  line: "#E7E7EA", // neutral pill fill / hairline when one is truly needed
  // the one accent — BRAND GREEN
  accent: "#2BFF77", // bright brand green — FILLS only (pair with onAccent text)
  accentStrong: "#10E060", // deeper green — solid buttons / hover
  accentSoft: "#CFFFE1", // pale green — soft pill / chip backgrounds
  accentInk: "#0A5C2E", // deep green — accent-colored TEXT/icons on white or on accentSoft
  onAccent: "#00210F", // dark text/icon ON the bright-green accent fills
  // live data (marketing --pos / --neg)
  up: "#2E8C5A",
  down: "#C0562F",
  // confident mark / icon fills (white glyph/initial on top)
  marks: ["#1d8a6e", "#2f6fc4", "#4d8a26", "#a86f12", "#c2521f", "#c43e6a", "#5b53d6"] as const,
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
