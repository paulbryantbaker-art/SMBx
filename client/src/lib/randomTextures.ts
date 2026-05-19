/* Random texture rotation — module-level pick.
 *
 * textures 4 = hero surfaces.
 * textures 3 = secondary/action cards.
 *
 * Each surface draws once at module import, so the pick is stable for the
 * session and re-rolls on hard refresh without React re-render churn.
 */

const VERSION = "v=20260515-art-house-1";
const tex = (name: string) => `/textures/texture-${name}.png?${VERSION}`;
const heroTex = (n: number) => `/textures/texture-hero-${n}.png?${VERSION}`;
const cardTex = (n: number) => `/textures/texture-card-${n}.png?${VERSION}`;
const desktopHeroTex = (n: number) => `/textures/desktop/texture-hero-${n}.png?${VERSION}`;
const desktopRandomTex = (n: number) => `/textures/desktop/random/texture-random-${String(n).padStart(2, "0")}.png?${VERSION}`;
const desktopRandomNamedTex = (name: string) => `/textures/desktop/random/${name}.png?${VERSION}`;
const desktopTodayRoseGold = () => `/textures/desktop/texture-today-rose-gold.png?${VERSION}`;
const artHouseTex = (n: number) => `/textures/desktop/art-house/art-house-${String(n).padStart(2, "0")}.png?${VERSION}`;

const pick = <T,>(arr: readonly T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

const shuffle = <T,>(arr: readonly T[]): T[] => {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

const HERO_POOL = [1, 2, 3, 4, 5, 6, 7, 8] as const;
const CARD_POOL = [1, 2, 3, 4, 5, 6, 7, 8] as const;
const DESKTOP_MID_TEXTURE_COUNT = 14;
const DESKTOP_MID_POOL = Array.from(
  { length: DESKTOP_MID_TEXTURE_COUNT },
  (_, index) => desktopRandomTex(index + 1),
);
const DESKTOP_HERO_POOL = Array.from(
  { length: 13 },
  (_, index) => desktopRandomTex(index + 15),
);
const ART_HOUSE_POOL = Array.from(
  { length: 7 },
  (_, index) => artHouseTex(index + 1),
);

const desktopTextureSet = (pool: readonly string[], count: number): string[] => {
  const deck = shuffle(pool);
  return Array.from({ length: count }, (_, index) => deck[index % deck.length] ?? desktopHeroTex(1));
};

const todayDesktopHeroTextures = desktopTextureSet(DESKTOP_HERO_POOL, 3);
const todayDesktopMidTextures = desktopTextureSet(DESKTOP_MID_POOL, 2);
const pipelineDesktopHeroTextures = desktopTextureSet(DESKTOP_HERO_POOL, 1);
const pipelineDesktopMidTextures = desktopTextureSet(DESKTOP_MID_POOL, 2);
const filesDesktopHeroTextures = desktopTextureSet(DESKTOP_HERO_POOL, 1);
const filesDesktopMidTextures = desktopTextureSet(DESKTOP_MID_POOL, 4);
const searchDesktopHeroTextures = desktopTextureSet(DESKTOP_HERO_POOL, 1);
const searchDesktopMidTextures = desktopTextureSet(DESKTOP_MID_POOL, 4);
const pageArtHouseTextures = desktopTextureSet(ART_HOUSE_POOL, 7);
const studioArtHouseTextures = desktopTextureSet(ART_HOUSE_POOL, 4);

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
  // Desktop art shuffles per page group at module import. Each hard refresh
  // gets a new spread, and no textured surface repeats within the same page.
  todayHeroSample: desktopTodayRoseGold(),
  todayHeroWorkspace: todayDesktopHeroTextures[1],
  todayMarket: todayDesktopHeroTextures[2],
  todayCard: todayDesktopMidTextures[0],
  todaySecondary: todayDesktopMidTextures[1],

  pipelineHero: pipelineDesktopHeroTextures[0],
  pipelineCard: pipelineDesktopMidTextures[0],
  pipelineSecondary: pipelineDesktopMidTextures[1],

  filesHero: filesDesktopHeroTextures[0],
  filesAll: filesDesktopMidTextures[0],
  filesDeals: filesDesktopMidTextures[1],
  filesAction: filesDesktopMidTextures[2],
  filesRoom: filesDesktopMidTextures[3],

  searchHero: searchDesktopHeroTextures[0],
  searchOpportunities: searchDesktopMidTextures[0],
  searchBuyers: searchDesktopMidTextures[1],
  searchProviders: searchDesktopMidTextures[2],
  searchFinancing: searchDesktopMidTextures[3],

  // Learn/pricing needs a steadier, sharper read than the random hero deck.
  // These are curated from the high-resolution desktop texture set.
  learnHero: desktopRandomTex(4),
  pricingFeatured: desktopRandomTex(21),
  pricingGuarantee: desktopRandomTex(10),
} as const;

export const STUDIO_TEXTURES = {
  rose: desktopTodayRoseGold(),
  blue: desktopRandomNamedTex("texture-random-24-clean"),
  green: desktopRandomTex(26),
  navy: desktopRandomTex(4),
} as const;

export const ART_HOUSE_TEXTURES = {
  // Art-house imagery is for secondary/editorial contrast, not the main app
  // hero language. Each major page gets one anchor image so the art feels
  // intentional and never repeats inside the same page.
  today: pageArtHouseTextures[0],
  pipeline: pageArtHouseTextures[1],
  files: pageArtHouseTextures[2],
  search: pageArtHouseTextures[3],
  learn: pageArtHouseTextures[4],
  pricing: pageArtHouseTextures[5],
  studio: pageArtHouseTextures[6],

  studioPreview: studioArtHouseTextures[0],
  studioCollection: studioArtHouseTextures[1],
  studioCampaign: studioArtHouseTextures[2],
  studioCollateral: studioArtHouseTextures[3],
} as const;
