/* Random texture rotation — module-level pick.
 *
 * Each surface draws once at module import, so the pick is stable for the
 * session and re-rolls on hard refresh without React re-render churn.
 *
 * 2026-06-11 payload diet: art ships as ~1125px-wide JPEG (q60–72, ≤250KB
 * each) instead of the original ~2MB PNGs — mobile Today alone was pulling
 * ~12.8MB of texture. The PNG masters stay in client/public/textures/;
 * unreferenced textures (old desktop hero/random decks, card deck, orig-*)
 * were moved to client/textures_backup/ so they no longer ship in builds.
 * The dead DESKTOP_TEXTURES export (zero consumers) was removed with them.
 */

const VERSION = "v=20260611-jpg-1";
const tex = (name: string) => `/textures/texture-${name}.jpg?${VERSION}`;
const heroTex = (n: number) => `/textures/texture-hero-${n}.jpg?${VERSION}`;
const desktopRandomTex = (n: number) => `/textures/desktop/random/texture-random-${String(n).padStart(2, "0")}.jpg?${VERSION}`;
const desktopRandomNamedTex = (name: string) => `/textures/desktop/random/${name}.jpg?${VERSION}`;
const desktopTodayRoseGold = () => `/textures/desktop/texture-today-rose-gold.jpg?${VERSION}`;
const artHouseTex = (n: number) => `/textures/desktop/art-house/art-house-${String(n).padStart(2, "0")}.jpg?${VERSION}`;

const shuffle = <T,>(arr: readonly T[]): T[] => {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

const ART_HOUSE_POOL = Array.from(
  { length: 7 },
  (_, index) => artHouseTex(index + 1),
);

const desktopTextureSet = (pool: readonly string[], count: number): string[] => {
  const deck = shuffle(pool);
  return Array.from({ length: count }, (_, index) => deck[index % deck.length] ?? pool[0]);
};

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

/* Files lane spares (the unwired 2026-05-03 set) — FIXED per lane, never in
 * the random hero/card rotation, so the four Files shortcuts stay
 * recognizable session to session. Consumed by v6/modes/FilesRoot.tsx. */
export const FILE_LANE_TEXTURES = {
  allFiles:      tex("gold-marble"),
  dealLibraries: tex("sage-botanical"),
  needsAction:   tex("mint-waves"),
  dataRooms:     tex("aqua-cloud"),
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
