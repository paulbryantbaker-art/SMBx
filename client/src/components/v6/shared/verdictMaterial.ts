/* verdictMaterial.ts — THE single source for verdict-tinted watercolor
 * material on desktop (desktop⇄mobile fusion, Wave A foundation).
 *
 * Every desktop hero/tonal surface that wears a verdict consumes THIS module
 * — never re-derive verdict kinds, never hardcode texture filenames, never
 * re-type overlay gradients. The values are the proven mobile recipes
 * (HERO_OVERLAY / HERO_GLOW in mobile/screens/Today.tsx, verdict trio tokens
 * in index.css), so a pursue deal wears the same watercolor on mobile and
 * desktop and verdict-color literacy transfers between platforms.
 *
 * Material doctrine (judges' merged resolution):
 * - Two independent axes: TEXTURE (which painting) and TINT (which verdict).
 *   Any texture can be re-verdicted by swapping only the overlay/glow pair.
 * - NORMAL compositing only — multiply was tried twice on mobile and muddied
 *   warm cream into brown. The 165deg gradient tints; the texture's true hue
 *   survives. Alpha shape: ~0.30 at top (keeps the numeral zone bright),
 *   ~0.62 at bottom (gives white inner-cell text contrast).
 * - Always layer the verdict glow WITH a plain dark lift shadow — glow alone
 *   reads flat (see heroBoxShadow()).
 * - DERIVE never renders on texture: the muted-emerald tick (#2E8C5A) is a
 *   light-surface verification signal. Hero numerals are plain renders.
 * - baseline is NOT a fourth verdict — it is the calm navy "no verdict yet"
 *   wash (mobile's MarketIntel family). Render baseline until a real verdict
 *   exists; never guess a verdict color from ambiguous text.
 */

import { RANDOM_TEXTURES } from "../../../lib/randomTextures";

export type VerdictKind = "pursue" | "watch" | "pass" | "baseline";

/* Derive a verdict kind from a human verdict label.
 *
 * Pure, order-sensitive first-match (pursue → watch → pass → baseline).
 *
 * Self-test corpus (mirror these in unit tests before any hero ships —
 * a wrong verdict tint is worse than blandness):
 *   "Pursue"                  → pursue     "Strong fit"          → pursue
 *   "Proceed to LOI"          → pursue     "Green light" / "green-light"
 *                                          / "greenlight"        → pursue
 *   "Watch"                   → watch      "Caution"             → watch
 *   "Conditional"             → watch      "Needs review"        → watch
 *   "Pass"                    → pass       "Decline"             → pass
 *   "Walk away"               → pass
 *   undefined / "" / "Analyzing…" / "No verdict yet"             → baseline
 */
export function deriveVerdictKind(label?: string): VerdictKind {
  if (!label) return "baseline";
  if (/pursue|strong|proceed|green.?light/i.test(label)) return "pursue";
  if (/watch|caution|conditional|review/i.test(label)) return "watch";
  if (/pass|decline|walk/i.test(label)) return "pass";
  return "baseline";
}

export interface VerdictMaterial {
  /** Watercolor texture URL — consumed from randomTextures.ts (correct
   *  cache-bust version, session-stable picks). Never hardcode filenames. */
  texture: string;
  /** The 165deg verdict tint, light top → dark bottom (0.30 → 0.62). */
  overlay: string;
  /** Verdict-tinted ambient glow — cards "radiate" their color into the
   *  page. Layer with HERO_LIFT (see heroBoxShadow); glow alone reads flat. */
  glow: string;
  /** Tonal trio for LIGHT surfaces (pills, tonal fields): mid = dots/fills,
   *  ink = text on soft, soft = tonal background. (= mobile verdict tokens) */
  tone: { mid: string; ink: string; soft: string };
}

export const VERDICT_MATERIAL: Record<VerdictKind, VerdictMaterial> = {
  pursue: {
    texture: RANDOM_TEXTURES.pursue,
    overlay: "linear-gradient(165deg, rgba(63,138,106,0.30) 0%, rgba(40,92,70,0.62) 100%)",
    glow: "0 14px 36px -10px rgba(63,138,106,0.32)",
    tone: { mid: "#6FB89A", ink: "#3F8A6A", soft: "#E6F3EC" },
  },
  watch: {
    texture: RANDOM_TEXTURES.watch,
    overlay: "linear-gradient(165deg, rgba(202,150,82,0.30) 0%, rgba(128,86,36,0.62) 100%)",
    glow: "0 14px 36px -10px rgba(180,130,50,0.30)",
    tone: { mid: "#D6A35C", ink: "#9C7128", soft: "#FAF1E1" },
  },
  pass: {
    texture: RANDOM_TEXTURES.pass,
    overlay: "linear-gradient(165deg, rgba(216,139,132,0.30) 0%, rgba(140,68,60,0.62) 100%)",
    glow: "0 14px 36px -10px rgba(180,90,80,0.28)",
    tone: { mid: "#D88B84", ink: "#A85248", soft: "#FBEAE7" },
  },
  baseline: {
    // Navy-neutral "no verdict yet" — texture from the live rotation
    // (RANDOM_TEXTURES.baseline), tint from mobile's calm MarketIntel navy
    // family normalized to the verdict overlay alpha shape (0.30 → 0.62).
    texture: RANDOM_TEXTURES.baseline,
    overlay: "linear-gradient(165deg, rgba(24,58,76,0.30) 0%, rgba(16,36,62,0.62) 100%)",
    glow: "0 16px 38px -14px rgba(24,72,105,0.40)",
    // Mobile's info-blue family — baseline is informational, not a verdict.
    tone: { mid: "#7FA8D9", ink: "#4A7AB0", soft: "#EAF0FA" },
  },
};

/** Hero card corner radius — mobile HeroFrame parity (= --wk-hero-radius). */
export const HERO_RADIUS = 22;

/* The non-glow layers of the mobile HeroFrame shadow stack:
 * dark lift + inset top highlight ("lit from above") + inset bottom shade. */
export const HERO_LIFT =
  "0 8px 20px -8px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.24), inset 0 -1px 0 rgba(0,0,0,0.20)";

/** The full four-layer HeroFrame box-shadow for a verdict kind:
 *  ambient verdict glow, dark lift, inset top highlight, inset bottom shade. */
export function heroBoxShadow(kind: VerdictKind): string {
  return `${VERDICT_MATERIAL[kind].glow}, ${HERO_LIFT}`;
}

/* On-texture glass inner cell — the row that floats INSIDE a hero
 * (mobile H.innerCell / CTA.cell). blur(3px) ONLY, kept low so the
 * watercolor stays crisp beneath; the 0.5px white border and inset
 * highlights do the glass work. */
export const HERO_INNER_CELL = {
  radius: 16,
  background:
    "radial-gradient(circle at 18% 0%, rgba(255,255,255,0.14), transparent 42%), linear-gradient(180deg, rgba(255,255,255,0.038), rgba(255,255,255,0.003))",
  backdropFilter: "blur(3px)",
  border: "0.5px solid rgba(255,255,255,0.34)",
  boxShadow:
    "0 10px 26px -18px rgba(0,0,0,0.44), inset 0 1px 0 rgba(255,255,255,0.34), inset 0 -1px 0 rgba(255,255,255,0.05)",
} as const;

/* Ghost glass button on texture (mobile H.innerButton / CTA.pill) — no blur,
 * no border; the faint white vertical gradient reads as a frosted chip. */
export const HERO_GHOST_PILL_BG =
  "linear-gradient(180deg, rgba(255,255,255,0.078), rgba(255,255,255,0.02))";

/** Inject a <link rel="preload" as="image"> for a hero texture so the
 *  watercolor is decoded before the hero mounts (no wrong-color flash).
 *  Idempotent per URL. */
export function preloadTexture(url: string): void {
  if (typeof document === "undefined" || !url) return;
  const existing = document.head.querySelector(
    `link[rel="preload"][as="image"][href="${url}"]`,
  );
  if (existing) return;
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.href = url;
  document.head.appendChild(link);
}
