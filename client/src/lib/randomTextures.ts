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

// Pinned 2026-05-07 per user direction: replace the prior randomized
// pools with the new texture set. Anon (welcome) → gold-marble across
// the home and any welcome hero. Authed (pursue / DailyHero) →
// sage-botanical green. baseline + buyers also point at the new set
// (mint-waves / aqua-cloud) so the whole hero system is on the new
// textures, not the prior watercolor washes. watch + pass stay fixed
// (semantic colors with no visual substitutes).
//
// 2026-05-07 update: full randomization across the new "textures 4" wave
// set the user dropped (8 textures). Each colored hero card picks one at
// page load. White list cards are unaffected (they don't reference
// RANDOM_TEXTURES). watch + pass stay fixed (semantic).
const WAVE_POOL = [
  "wave-gold",
  "wave-green",
  "wave-teal",
  "wave-blue",
  "wave-purple",
  "wave-coral",
  "wave-pink",
  "wave-greengold",
] as const;

export const RANDOM_TEXTURES = {
  welcome:  tex(pick(WAVE_POOL)), // anon Today hero, sample Brief
  pursue:   tex(pick(WAVE_POOL)), // authed DailyHero, Detail recast
  baseline: tex(pick(WAVE_POOL)), // Pipeline featured, Detail baseline
  buyers:   tex(pick(WAVE_POOL)), // Today Explore, Detail buyers
  watch:    tex("watch"),         // semantic, fixed
  pass:     tex("pass"),          // semantic, fixed
} as const;
