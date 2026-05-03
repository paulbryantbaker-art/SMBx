/* Random texture rotation — module-level pick.
 *
 * Each surface (welcome hero, pursue, baseline, buyers) draws once at module
 * import from a curated pool of compatible watercolor washes. Module imports
 * happen once per page load, so the pick is stable for the session and
 * re-rolls on hard refresh — exactly the "different look every reload" feel
 * we want without React re-render churn.
 *
 * Constraint: home page (Today welcome hero) stays in the GOLD pool so the
 * warm/gold brand identity is preserved across rolls. Other surfaces draw
 * from broader pools that match their existing color washes (green, blue,
 * purple-cool).
 *
 * watch + pass stay fixed because their colors (peach, pink/coral) carry
 * semantic action meaning and don't have visual substitutes that read the
 * same way.
 */

const VERSION = "v=20260503";
const tex = (name: string) => `/textures/texture-${name}.png?${VERSION}`;

const pick = <T,>(arr: readonly T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

// Warm + gold — for Today welcome hero + Brief screen header
const GOLD_POOL = ["sunrise", "gold-marble", "orig-sunrise"] as const;

// Sage / forest — for pursue action card + Detail pursue
const GREEN_POOL = ["pursue", "sage-botanical", "orig-pursue"] as const;

// Powder blue / mint / aqua — for Pipeline + Detail baseline
const COOL_BLUE_POOL = [
  "baseline", "mint-waves", "aqua-cloud", "orig-baseline",
] as const;

// Lavender / mist / cool — for Today Explore + Detail buyers
const COOL_PURPLE_POOL = [
  "buyers", "sage-botanical", "mint-waves", "orig-buyers",
] as const;

export const RANDOM_TEXTURES = {
  welcome:  tex(pick(GOLD_POOL)),
  pursue:   tex(pick(GREEN_POOL)),
  baseline: tex(pick(COOL_BLUE_POOL)),
  buyers:   tex(pick(COOL_PURPLE_POOL)),
  watch:    tex("watch"), // semantic, fixed
  pass:     tex("pass"),  // semantic, fixed
} as const;
