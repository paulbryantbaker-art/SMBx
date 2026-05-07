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
// Two distinct texture systems (2026-05-07):
//
//   RANDOM_TEXTURES — the previous watercolor-wash set. Used ONLY by the
//   Detail page artifact cards (RECAST / BASELINE / BUYERS / IOI etc.)
//   that carry semantic-verdict color identity. These should NOT pick up
//   the new wave textures.
//
//   WAVE_TEXTURES — the new 'textures 4' wave set the user dropped. 8
//   PNGs (gold/green/teal/blue/purple/coral/pink/greengold). Each colored
//   hero card on Today / Pipeline / Brief picks one at module load and
//   re-rolls on page reload.
//
// White list cards (.mb-as-card / .m-card) reference neither and stay
// plain white. watch + pass stay fixed in RANDOM_TEXTURES (semantic).

// ─── PREVIOUS set — watercolor washes, for Detail artifact cards ────
const GOLD_POOL  = ["sunrise", "gold-marble", "orig-sunrise"] as const;
const GREEN_POOL = ["pursue", "sage-botanical", "orig-pursue"] as const;
const COOL_BLUE_POOL = [
  "baseline", "mint-waves", "aqua-cloud", "orig-baseline",
] as const;
const COOL_PURPLE_POOL = [
  "buyers", "sage-botanical", "mint-waves", "orig-buyers",
] as const;

export const RANDOM_TEXTURES = {
  welcome:  tex(pick(GOLD_POOL)),
  pursue:   tex(pick(GREEN_POOL)),
  baseline: tex(pick(COOL_BLUE_POOL)),
  buyers:   tex(pick(COOL_PURPLE_POOL)),
  watch:    tex("watch"),
  pass:     tex("pass"),
} as const;

// ─── NEW set — wave textures, for non-Detail colored cards ──────────
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

export const WAVE_TEXTURES = {
  welcome:  tex(pick(WAVE_POOL)), // Today anon hero
  pursue:   tex(pick(WAVE_POOL)), // Today authed DailyHero
  baseline: tex(pick(WAVE_POOL)), // Pipeline featured hero
  buyers:   tex(pick(WAVE_POOL)), // Today Explore card
  brief:    tex(pick(WAVE_POOL)), // Brief screen editorial header
} as const;
