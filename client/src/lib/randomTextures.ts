/* Random texture rotation — module-level pick.
 *
 * textures 4 = hero surfaces.
 * textures 3 = secondary/action cards.
 *
 * Each surface draws once at module import, so the pick is stable for the
 * session and re-rolls on hard refresh without React re-render churn.
 */

const VERSION = "v=20260510-mobile-texture-recipes-glass";
const tex = (name: string) => `/textures/texture-${name}.png?${VERSION}`;
const heroTex = (n: number) => `/textures/texture-hero-${n}.png?${VERSION}`;
const cardTex = (n: number) => `/textures/texture-card-${n}.png?${VERSION}`;
const desktopHero = (name: string) => `/textures/desktop-hero-${name}.svg?${VERSION}`;

const pick = <T,>(arr: readonly T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

const HERO_POOL = [1, 2, 3, 4, 5, 6, 7, 8] as const;
const CARD_POOL = [1, 2, 3, 4, 5, 6, 7, 8] as const;

export const RANDOM_TEXTURES = {
  // Curated mobile recipes. These are intentionally semantic, not fully
  // random: adjacent Today cards should never accidentally land in the same
  // color family.
  welcome: heroTex(6),
  market:  heroTex(2),
  explore: heroTex(3),
  files:   heroTex(1),
  search:  heroTex(8),
  pipeline: heroTex(7),

  // Existing semantic aliases.
  pursue:   heroTex(8),
  baseline: heroTex(2),
  watch:    tex("watch"),
  pass:     tex("pass"),

  // Supporting/navigation card aliases.
  buyers:       heroTex(3),
  card:         heroTex(2),
  cardPursue:   heroTex(8),
  cardBaseline: heroTex(1),
  cardBuyers:   heroTex(3),

  // Legacy named textures remain available for any older route that expects
  // semantic art. These are not in the new hero/card rotation.
  legacyPursue:   tex("pursue"),
  legacyWatch:    tex("watch"),
  legacyPass:     tex("pass"),
  legacyBaseline: tex("baseline"),
} as const;

export const DESKTOP_TEXTURES = {
  todayHeroSample: desktopHero("today-sample"),
  todayHeroWorkspace: desktopHero("today-workspace"),
  todayCard: cardTex(4),
  todaySecondary: cardTex(4),

  pipelineHero: desktopHero("pipeline"),
  pipelineCard: cardTex(2),
  pipelineSecondary: cardTex(8),

  filesHero: desktopHero("files"),
  filesAll: cardTex(4),
  filesDeals: cardTex(2),
  filesAction: cardTex(5),
  filesRoom: cardTex(7),

  searchHero: desktopHero("search"),
  searchOpportunities: cardTex(5),
  searchBuyers: cardTex(7),
  searchProviders: cardTex(2),
  searchFinancing: cardTex(4),
} as const;
