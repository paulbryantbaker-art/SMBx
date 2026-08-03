/**
 * Redesign tokens (RT) — the Cash App-inspired mobile language. See
 * /MOBILE_REDESIGN.md for the law. Kept SEPARATE from the legacy `T`/`M` tokens
 * so screens migrate one at a time; once every screen is on RT, the old tokens
 * retire. Surfaces separate by TONE (warm off-white page / white element), never
 * borders or shadows.
 *
 * AURORA (2026-08-02, with the Phase-1 T/M swap — "marry Aurora with Cash
 * App"). The color profile previously came from the RETIRED marketing
 * palette (the Ramp neon `#2BFF77` era, its site dead since the practice
 * pivot); it now comes from `house/tokens.ts`, the same palette the
 * practice site, PDF composers and studio builders read. The GRAMMAR is
 * unchanged and is the point of this file: tone separation, white cards,
 * one rationed accent (active nav pill · the Yulia button · primary CTAs).
 *
 * The accent contract flips with the palette: the neon was a bright fill
 * that needed DARK on-accent text; Deal Green is a deep fill that carries
 * WHITE (5.3:1, measured in house/tokens.ts). `onAccent` is therefore
 * white now — screens that pair RT.accent with RT.onAccent stay correct
 * automatically. Deal Green is also legible AS text on white (5.1:1), so
 * `accentInk` merges into the same value, as the site's links and CTAs do.
 */
import { T } from "../../desktop/atlasTokens";
import { LEDGER } from "../../../../../../house/tokens";

export const RT = {
  // surfaces — the warm well over bone-family tones (matches M.frameBg;
  // the old "neutral light grey, closer to Cash App" note is superseded:
  // grammar theirs, palette ours)
  page: "#F9F6F0",
  card: "#ffffff", // white — every raised element (no border, no shadow)
  // ink scale (NEUTRAL greys — de-tinted + DARKENED so secondary text stays
  // crisp on the light page; Cash App never floats light type on light grey)
  ink: LEDGER.ink,
  ink2: "#3A3A40", // body / descriptions — dark, not grey
  muted: "#4D4D54", // secondary (subs, labels) — darkened for crisp contrast on the page
  faint: "#86868E", // tertiary (timestamps) only — never body
  line: LEDGER.hair, // warm pill fill / hairline when one is truly needed
  // the one accent — DEAL GREEN (see header: white rides on it now)
  accent: LEDGER.green,
  accentStrong: LEDGER.greenHover, // solid buttons / hover
  accentSoft: LEDGER.greenTint, // soft pill / chip backgrounds
  accentInk: LEDGER.green, // accent-colored TEXT/icons on white or on accentSoft
  onAccent: "#FFFFFF", // text/icon ON the accent fills (5.3:1 on Deal Green)
  // live data — the desktop's own semantics (verdict green / terra), so
  // "up" never collides with the brand accent (two-greens law)
  up: "#1f8a5b",
  down: "#c2410c",
  // confident mark / icon fills (white glyph/initial on top, all ≥5:1) —
  // the Google blue, violet and pink retired for calmer Aurora-adjacent
  // hues; hue DIVERSITY is the job (a list reads as a set, not noise)
  marks: ["#1d8a6e", "#33658C", "#4d8a26", "#a86f12", "#c2521f", "#A6435C", "#5C6470"] as const,
  // radii
  rCard: 18,
  rPill: 999,
  // type
  font: T.font, // the system font
} as const;

/** Stable mark colour for a deal/row, so a list reads as a set not noise. */
export function markColor(seed: number | string): string {
  const n =
    typeof seed === "number"
      ? Math.abs(Math.trunc(seed))
      : [...String(seed)].reduce((a, c) => a + c.charCodeAt(0), 0);
  return RT.marks[n % RT.marks.length];
}
