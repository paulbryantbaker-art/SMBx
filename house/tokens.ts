/**
 * THE house design tokens — one definition, every surface.
 *
 * Why this file exists (Paul, 2026-07-24): "whether I'm generating a PDF
 * carousel, image, or full report — using Claude on the web or using the app —
 * I want them to be the same backend." Before this, the Ledger palette was
 * copy-pasted into nine files, so a brand change was a nine-file edit and the
 * surfaces drifted. Everything that renders house collateral imports from here.
 *
 * ZERO dependencies by design. No DB, no API key, no Express, no Anthropic SDK.
 * That is what lets the same tokens serve a local Cowork CLI run, an in-app
 * render, and the vendored `studio-kit/` copy without divergence.
 *
 * `DESIGN.md` in the studio workspace remains the canonical description of the
 * system; this file is its machine-readable form and must not drift from it.
 *
 * ── CARTA pass, 2026-08-08 ─────────────────────────────────────────────────
 * The public site was rebuilt in the Carta language; the collateral renderers
 * were left behind, and this is where that split closes. `CARTA` is the live
 * palette. `LEDGER` is RETIRED — kept, not deleted, because it is the rollback
 * path and because a named dead palette is what lets a future session catch
 * itself reaching for `#E8A62B`. Nothing new imports LEDGER.
 *
 * What actually moved: the warm is GONE (brass and honey have no Carta
 * equivalent — there is one accent and it is green), the band went from a
 * saturated jade `#0A6A4C` to a flat near-black `#131512` with no texture, no
 * glaze and no halo, and the corner radius went to 0 everywhere except buttons
 * and inputs. Six values did not move at all: bone, ink, green, greenHover,
 * greenTint and mint survived the restyle intact.
 *
 * ── Aurora pass, 2026-08-01 ────────────────────────────────────────────────
 * Paul, 2026-07-31: "I hate the dark green… too dark… make the pages more
 * cheerful and AI-forward." The complaint was about WEIGHT, not hue, so the
 * system keeps its shape and loses its heaviness. Nothing here is near-black
 * any more. Retired in this pass and never to reappear as live guidance:
 * green `#16624C`, hover `#0F4E3C`, tint `#E7F0EC`, brass `#B08637`,
 * boardroom `#0F1A16`, bone `#F6F4EF`, ink `#14181C`, slate `#5C6670`,
 * muted `#8A9099`, hair `#E4E1D9`, rule `#D8D5CA`, mint `#8FD0AE`,
 * ivory `#F3F1EA`, and the REPORT trio `#CBD1CB` / `#A6BEB2` / `#EEE9DD`.
 */

/**
 * The Ledger palette, Aurora values. **RETIRED 2026-08-08 — see `CARTA`.**
 *
 * Kept, not deleted, and deliberately (CARTA_COLLATERAL_CONVERSION §4): it is
 * the rollback path, and `DESIGN.md`'s dead table names these hexes so that a
 * session about to reach for amber `#E8A62B` can see it is reaching into a
 * grave. Nothing in a renderer should import this. The only live consumers left
 * are `server/services/researchComposer.ts` (the app's Studio composer, and
 * Studio is off — `STUDIO_IN_APP = false`) and the legacy `blockBackground()`
 * stack below, which exists so old artifacts rebuild identically.
 */
export const LEDGER = {
  /* canvas + ink */
  bone: '#FCFAF6', // page canvas — lifted, so the accent has room
  ink: '#16181A', // headings, primary text
  slate: '#5A6169', // body text (decks, cards, the app)
  muted: '#83898F', // sources, vintages, captions
  hair: '#EAE5DC', // hairline borders
  rule: '#DED8CC', // heavier dividers; secondary text on the block

  /* the accent — one green, two values, plus a highlight that carries no text */
  green: '#0A7A58', // the working accent: CTA fills, links, the logo mark
  greenHover: '#086348',
  greenTint: '#DFF5EC', // chip fill
  jade: '#0FA97C', // vivid highlight — ambient bloom, large numerals, edges. NEVER small text.
  mint: '#A8F0CE', // green-on-block links, rings

  /* the warm — brass on light surfaces, honey on the block */
  brass: '#E8A62B', // amber: rules, bars, large numerals on bone
  honey: '#F5C452', // amber on the jade block — numerals and tags

  /* the rhythm break — a saturated jade block, not a near-black */
  dark: '#0A6A4C',
  ivory: '#F2FBF6', // reading text on the block
} as const;

/**
 * THE CARTA PALETTE — live as of 2026-08-08. The site's language, in the
 * renderers.
 *
 * Read the roles, not the hexes. The system has ONE accent and it is green;
 * everything else is a ground, an ink or a hairline. There is no warm. If a
 * surface wants a second colour it does not get one — it gets a rule, a plate
 * or a handle.
 *
 * THE BUTTON LAW, stated here because it is the fastest way to look off-brand
 * while every individual hex checks out: **green is never a resting fill.**
 * A primary is ink-on-light or bone-on-dark. Green appears on hover, on chips,
 * on kickers, on links, and on the 4×52 bar under a numeral. A green button
 * passes every colour check and reads as the wrong practice.
 */
export const CARTA = {
  /* grounds — four, and they are all light */
  bone: '#FCFAF6',       // the page
  boneAlt: '#F9F7F1',    // an alternating section, a quiet stripe
  panel: '#F3F0E9',      // an inset panel, a filled cell
  white: '#FFFFFF',      // cards — always with a 1px ink border, never floating

  /* ink */
  ink: '#16181A',        // headlines, borders, primary buttons, the handles
  body: '#4A4F54',       // body text — cooler and deeper than Ledger's slate
  muted: '#7C8187',      // sources, vintages, captions, kicker labels

  /* hairlines */
  hair: '#E4DFD3',       // separators inside a card
  chipBorder: '#D8D3C6', // heavier divider; chip and plate edges

  /* the accent — one green, and it is never a resting fill */
  green: '#0A7A58',      // links, kickers, rules, the bar under a numeral
  greenHover: '#086348',
  greenTint: '#DFF5EC',  // chip fill
  greenBright: '#0FA97C',// vivid highlight, rare — large marks only, NEVER small text
  mint: '#A8F0CE',       // the accent ON DARK: the byline ring, a link on the band

  /* the dark band — FLAT. No texture, no glaze, no halo, no gradient. */
  dark: '#131512',
  darkSeam: '#2A2E29',   // hairline on the band
  darkPlate: '#22261F',  // label plates sitting on the band
  darkInk: '#F4F5F1',    // reading text on the band
  darkSub: '#D7DBD2',    // secondary text on the band
  darkMuted: '#ABB2AB',  // kicker labels, captions on the band
  darkLegal: '#8A9088',  // the smallest legal / source line on the band
  darkBtnBorder: '#4A4F44',
} as const;

/**
 * Long-form report tokens.
 *
 * `body` is deliberately darker than `LEDGER.slate` — long-form reading text
 * wants more contrast than a slide glanced at for two seconds. Kept separate
 * rather than folded into LEDGER so that unifying it later is an explicit
 * design decision, not a silent side effect of de-duplication.
 */
export const REPORT = {
  body: '#3F464C', // sustained-reading ink — see the note above
} as const;

/**
 * RETIRED with the jade block, 2026-08-08: `ivorySub #C9E8DA`,
 * `statLabel #BFE3D2` and `tableHead #F1ECE0`.
 *
 * All three were tuned for a surface that no longer exists — the first two are
 * mint-cast greys for text on the emerald block, the third a warm bone for a
 * GFM table head. Carta's equivalents are `CARTA.darkSub`, `CARTA.darkMuted`
 * and `CARTA.panel`. They are recorded in DESIGN.md's dead table rather than
 * kept as exports, because three orphan values that nothing reads are three
 * values a future session will read as live.
 */

/** Working type. Newsreader displays, Inter works, Plex Mono labels. */
export const TYPE = {
  display: `'Newsreader', Georgia, serif`,
  sans: `'Inter', -apple-system, sans-serif`,
  mono: `'IBM Plex Mono', monospace`,
} as const;

/**
 * Display weight. 600 on Newsreader — the equivalent page colour to the 545
 * this system ran on Fraunces, matched by eye across the cover hook, the
 * statement head and the report title.
 *
 * ── FRAUNCES RETIRED, 2026-08-05 ──────────────────────────────────────────
 * Paul, on a pricing headline: "it looks like the f is drunk lol — and makes
 * the whole sentence look weird."
 *
 * He was reading the typeface correctly. Fraunces carries an `opsz` axis from
 * 9 to 144, and CSS `font-optical-sizing` defaults to `auto`, so a 52px
 * headline requests optical size 52 — where the f grows a long right arm with
 * a ball terminal that overhangs the following letter, and stroke contrast
 * rises sharply. Undercase drew that for type set very large. At carousel
 * headline size it reads as a wobble, and because the contrast moves with it,
 * the whole line looks unsteady rather than just the one glyph. The numerals
 * do the same thing — the flagged 1 and the curled 5 in "150".
 *
 * Pinning `opsz` low fixes the f and was offered; Paul chose to change the
 * face instead. Newsreader keeps the editorial warmth, the ball terminals and
 * the page colour, and draws an upright f and confident figures. It carries
 * `opsz` 6–72 and `wght` 200–800, so DISPLAY_OPSZ below stops this recurring.
 *
 * `@fontsource-variable/fraunces` stays installed — nothing has been deleted,
 * and reverting is a two-line change here plus one in fontEmbeds.ts.
 */
export const DISPLAY_WEIGHT = 600;

/**
 * Display optical size, PINNED — never `auto`.
 *
 * This is the token that keeps the Fraunces failure from happening again in a
 * different face. Any variable serif with an `opsz` axis will hand you its most
 * mannered drawings at headline sizes if the browser is left to map font-size
 * onto the axis. 30 sits at the display end of Newsreader's 6–72 range without
 * reaching for the flourishes.
 *
 * Consume it as `font-variation-settings: 'opsz' ${'$'}{DISPLAY_OPSZ}` on every
 * surface that sets the display face.
 */
export const DISPLAY_OPSZ = 30;

/**
 * CARTA type. Source Serif 4 displays, Schibsted Grotesk works, Plex Mono
 * labels. Mono is the one thing that did not move.
 *
 * The variable cut wired into `cartaFontFaceCss()` is Source Serif 4's
 * **wght-only** file, not the opsz one, and that is the point: a variable serif
 * with an `opsz` axis hands you its most mannered drawings at headline sizes if
 * the browser is left to map font-size onto the axis. That is the Fraunces
 * failure this system already paid for once. No axis, nothing to mis-map.
 */
export const CARTA_TYPE = {
  display: `'Source Serif 4', Georgia, serif`,
  sans: `'Schibsted Grotesk', -apple-system, sans-serif`,
  mono: `'IBM Plex Mono', monospace`,
} as const;

/** Display weight on Source Serif 4. 600 for card titles — see below. */
export const CARTA_DISPLAY_WEIGHT = 550;

/** Card titles sit one step heavier so a small serif line holds against a rule. */
export const CARTA_CARD_TITLE_WEIGHT = 600;

/**
 * THE CORNER HANDLES — the house gesture, replacing Ledger's curved crests.
 *
 * Four ink squares at the corners of a framed thing: cover panels, image
 * frames, cards. They sit OUTSIDE the frame, at a negative offset, which is
 * why `overflow: hidden` on the framed element shears them off. Clip the
 * texture inside, never the frame itself.
 *
 * On a dark surface they are `darkInk`, not `ink` — an ink handle on the band
 * is invisible, and an invisible handle is indistinguishable from a surface
 * that never converted.
 */
export const CARTA_HANDLE = { size: 8, offset: -4, sizeSmall: 7, offsetSmall: -4 } as const;

/**
 * RADIUS. Zero everywhere. The only exceptions are buttons and inputs at 10px.
 *
 * Ledger's 12–16px cards are the single loudest tell that a surface did not
 * convert, so this is a token rather than a habit — a rounded card is now a
 * value someone had to type, not a value they forgot to change.
 */
export const CARTA_RADIUS = 0;
export const CARTA_CONTROL_RADIUS = 10;

/** The stat bar under a big numeral — 4×52 green, 10px below. The live site's
 *  About-page proof trio, lifted rather than invented. Replaces Ledger's brass
 *  bar, which is the jewelry Carta does not wear. */
export const CARTA_STAT_BAR = { width: 52, height: 4, gap: 10 } as const;

/** The kicker mark — an 8px green square before a mono label at 0.16em. */
export const CARTA_KICKER = { square: 8, tracking: '0.16em' } as const;

/**
 * The four corner handles, as markup + CSS.
 *
 * Returned as a pair so every builder draws the same gesture from the same
 * definition. `on` is the frame's own selector; the handles are its children
 * and it must be `position: relative` (and NOT `overflow: hidden`).
 */
export const HANDLE_HTML =
  '<i class="hdl hdl-tl"></i><i class="hdl hdl-tr"></i><i class="hdl hdl-bl"></i><i class="hdl hdl-br"></i>';

export function handleCss(color: string = CARTA.ink, small = false): string {
  const size = small ? CARTA_HANDLE.sizeSmall : CARTA_HANDLE.size;
  const off = small ? CARTA_HANDLE.offsetSmall : CARTA_HANDLE.offset;
  return `.hdl{position:absolute;width:${size}px;height:${size}px;background:${color};z-index:3;}`
    + `.hdl-tl{top:${off}px;left:${off}px;}.hdl-tr{top:${off}px;right:${off}px;}`
    + `.hdl-bl{bottom:${off}px;left:${off}px;}.hdl-br{bottom:${off}px;right:${off}px;}`;
}

/**
 * The handle colour for ONE surface, scoped.
 *
 * A builder that renders a light card and a dark card from one stylesheet
 * cannot colour the handles in `handleCss()` — whichever value it passes is
 * wrong on the other surface, and the failure is silent: ink handles on the
 * `#131512` band are invisible, and an invisible handle is indistinguishable
 * from a page that never converted. This is the same defect `design-check.mts`
 * was written to catch on cover text, one gesture further out.
 */
export function handleColorCss(scope: string, color: string): string {
  return `${scope} .hdl{background:${color};}`;
}

/**
 * The Carta band, as a background value. It is a colour. That is the whole
 * function, and it exists so that a builder reads `cartaBand()` in the same
 * slot where it used to read `blockBackground(TEXTURE, …)` — making the
 * deletion of the glaze/texture/halo stack visible in the diff rather than
 * silent.
 *
 * TRAP THIS REPLACES: `background: DARK url(texture)` ignores the colour. The
 * texture image sits ABOVE the base colour in the CSS background stack, so
 * repointing the token while leaving the texture layer in place changes
 * nothing on screen and shows a clean diff.
 */
export function cartaBand(): string { return CARTA.dark; }

/** The Carta page. Flat bone — no bloom, no plaster, no wash.
 *
 *  Ledger lifted a light page with four radial blooms alternating jade and
 *  amber. Amber is gone, and green-only blooms on bone read as a haze rather
 *  than as light. Carta is a print-plate language: the page is paper, and the
 *  structure — rules, plates, handles, the ink border on a white card — is what
 *  keeps it from reading flat. */
export function cartaPage(): string { return CARTA.bone; }

/* ── derived forms ────────────────────────────────────────────────────── */

/**
 * `#RRGGBB` → `rgba(r,g,b,a)`.
 *
 * Halos, rings and glazes are all palette colours at low alpha. Deriving them
 * keeps them from going stale when the palette moves — a hand-written
 * `rgba(22,98,76,0.28)` was Deal Green until 2026-07-31 and is a lie now.
 */
export function rgba(hex: string, alpha: number): string {
  const n = parseInt(hex.replace('#', ''), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

/**
 * Blend `hex` at `alpha` over an OPAQUE base and return an opaque hex.
 *
 * THE RENDERER-PROOF LAW, applied to vector output. A translucent fill makes
 * Chromium emit a PDF transparency group, and Preview re-composites those its
 * own way — that is the hard-edged rectangle Paul reported on the sample cover.
 * Decks solve it by rasterizing every page. A REPORT cannot: rasterizing 55
 * pages of research would destroy selectable, searchable text and balloon the
 * file. So a report flattens instead — same colour to the eye, no alpha channel
 * for a renderer to disagree about.
 *
 * Use it for any fill sitting on a KNOWN, OPAQUE background. It cannot help a
 * fill over a photograph or a gradient; those must be rasterized.
 */
export function flatten(hex: string, alpha: number, over: string): string {
  const c = (h: string) => { const n = parseInt(h.replace('#', ''), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const [r1, g1, b1] = c(hex), [r2, g2, b2] = c(over);
  const mix = (a: number, b: number) => Math.round(a * alpha + b * (1 - alpha));
  return '#' + [mix(r1, r2), mix(g1, g2), mix(b1, b2)]
    .map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();
}

/** The mint byline ring and the jade halo on block surfaces — house constants. */
export const MINT_RING = rgba(LEDGER.mint, 0.65);
export const GREEN_HALO = rgba(LEDGER.jade, 0.28);

/* ── the block ────────────────────────────────────────────────────────── */

/**
 * The glaze alpha for the block. THE most breakable number in the system.
 *
 * The texture is a near-black image and in the CSS background stack it sits
 * ABOVE the base colour, so it wins outright — the base colour underneath is
 * only ever a no-image fallback. Written the intuitive way
 * (`background: DARK url(texture)`) every block on every surface renders
 * near-black while the code reads as though it is jade. There is no error and
 * no visual diff to catch it. The glaze is what actually makes the block the
 * colour it claims to be, so it has to sit OVER the texture, in the base
 * colour, at an alpha high enough to carry it.
 *
 * ── 2026-08-01, second pass. Lowered 0.84 → 0.72 (Paul, on the first Aurora
 * render: "the front and back pages and one pager pages should have a slight
 * texture to them… it keeps the pages from looking so flat"). At 0.84 the
 * plaster relief in `blackbleed.webp` measured 0.87 units of high-frequency
 * variation against 2.03 on the retired green-black block — a 57% loss. The
 * texture was still in the stack; the glaze had simply buried it. 0.72 brings
 * the relief back visibly and costs about two points of lightness, which is
 * below the threshold of noticing. The website's own band has run at 0.34 since
 * the warmth pass, with the comment "low alpha so the plaster detail stays
 * fully visible" — 0.84 was always the outlier, not the house value.
 */
export const BLOCK_GLAZE_ALPHA = 0.52;

/**
 * The glaze COLOUR. Jade, not the base.
 *
 * Second pass, 2026-08-01 (Paul: "I don't think the texture is quite enough").
 * Glazing in the base `#0A6A4C` traps you: every point of alpha you give back
 * to the plaster is a point of lightness the block loses, so more texture means
 * a heavier block — the exact complaint that started the Aurora pass. Glazing
 * in `jade #0FA97C` breaks the trade. Jade is light enough to hold the surface
 * up at HALF the alpha, so the plaster reads at full strength and the block
 * comes out brighter than it was at 0.84, not darker.
 *
 * The block's composite colour is therefore jade-over-base, not `LEDGER.dark`
 * flat. `LEDGER.dark` is still the fallback and still the token DESIGN.md §4
 * names — this is the same "the block is a composite, not a colour" law the
 * design file already states, applied one layer further up.
 */
export const BLOCK_GLAZE_COLOR = LEDGER.jade;

/**
 * The paper wash for LIGHT surfaces.
 *
 * Third pass, 2026-08-01. The first two answers were both wrong, and wrong in
 * the same way: they tried to make bone less flat by adding GRAIN, using
 * `bonebleed.webp`. Paul, looking at the live site beside the render: "I almost
 * don't think either are quite nailing the new website colors."
 *
 * He was right, and the site says why. `.pd-ambient` in `practice.css` carries
 * no texture at all — the canvas is lifted by six soft radial BLOOMS at the
 * page edges, alternating warm and green, at alphas between 0.024 and 0.16.
 * Depth on light surfaces is coloured light, not paper grain. Sampling the
 * 2026-08-01 site screenshot confirms the Aurora version has gone chromatic:
 * the centre canvas reads exactly `#FCFAF6` (the bone token, unchanged), the
 * top-left and lower-right blooms resolve to jade at ~0.07, and the top-right
 * and lower-left to amber at ~0.09.
 *
 * So the plaster is gone from light surfaces. `bonebleed.webp` stays on disk
 * and stays wired as an optional argument, because it is a real house asset
 * and this is the third time it has been picked up and put down — but it is
 * OFF by default, and the default is the site's own recipe.
 */
export const PAPER_BLOOMS = [
  { at: '52% 34% at 2% 0%',    color: 'jade' as const,  alpha: 0.12 },
  { at: '50% 32% at 99% 4%',   color: 'brass' as const, alpha: 0.15 },
  { at: '56% 34% at 0% 82%',   color: 'brass' as const, alpha: 0.13 },
  { at: '52% 32% at 100% 88%', color: 'jade' as const,  alpha: 0.11 },
] as const;

/** Optional plaster on light surfaces. 1 = none. Off by default — see above. */
export const PAPER_VEIL_ALPHA = 1;

/**
 * The complete background stack for a block surface — the full-bleed rhythm
 * break used by the deck cover and closer, the dark one-pager and the report
 * cover.
 *
 * Returns every layer in one value, deliberately. Before the Aurora pass this
 * stack was hand-rolled in three files as a base rule plus a separate overlay
 * element, and the overlay's glaze was a hardcoded `rgba(15,26,22, …)` — the
 * retired boardroom near-black, which is not a token and therefore did not
 * move when the palette did. Changing `LEDGER.dark` alone would have changed
 * only the invisible fallback and left every surface exactly as dark as it
 * was. One function, one stack, one place to be wrong.
 *
 * CSS paints the FIRST listed layer on top, so the order below reads
 * top-down: jade halo, then the glaze, then the texture, then the base.
 *
 * @param texture   the `blackbleed.webp` data URI (or url) — omit for a flat block
 * @param haloSize  the radial halo geometry, per surface
 * @param alpha     glaze strength; defaults to the house `BLOCK_GLAZE_ALPHA`
 */
export function blockBackground(
  texture?: string,
  haloSize = '900px 500px at 50% -10%',
  alpha: number = BLOCK_GLAZE_ALPHA,
): string {
  const layers = [
    `radial-gradient(${haloSize}, ${rgba(LEDGER.jade, 0.3)}, transparent 65%)`,
    `linear-gradient(180deg, ${rgba(BLOCK_GLAZE_COLOR, alpha)}, ${rgba(BLOCK_GLAZE_COLOR, alpha)})`,
  ];
  if (texture) layers.push(`url('${texture}') center/cover`);
  layers.push(LEDGER.dark);
  return layers.join(', ');
}

/**
 * The complete background stack for an INK surface — the dark ground that
 * replaced the jade block.
 *
 * WHY IT EXISTS (Paul, 2026-08-06): "let's retire the emerald background bc my
 * headshot and walking shot contrasts with the green… i do like having the
 * textures." A saturated jade field behind a photograph of a person fights the
 * skin tones in it; near-black does not. `blockBackground()` stays reachable so
 * old artifacts rebuild identically, but nothing new should reach for it.
 *
 * Same bloom geometry as the deck's ink bookends in `house/deck.ts` — jade
 * rising bottom-left, weaker jade upper-right, a brass whisper low-centre, per
 * COVER-CTA-SPEC §3. Defined ONCE here so a deck and a report cannot drift into
 * two different darks, which is exactly how the last one went wrong.
 *
 * The texture is kept — it is what stops a near-black page reading as dead
 * flat — and a light ink veil sits over it so the grain supports the type
 * instead of competing with it.
 *
 * @param texture  the `blackbleed.webp` data URI — omit for a flat ink ground
 * @param veil     ink veil over the texture; 0 shows the raw grain
 */
/**
 * Bloom geometry, per surface. Same recipe, different corner kept clear.
 *
 * `deck` is COVER-CTA-SPEC §3 verbatim: jade rising bottom-left, weaker jade
 * upper-right, brass whisper low-centre.
 *
 * `report` moves the strong bloom to the LOWER RIGHT, and the reason is
 * specific rather than aesthetic: the report cover pins the byline — Paul's
 * headshot — to the bottom LEFT, which on the deck geometry is precisely where
 * the jade is heaviest. Retiring the emerald ground and then dropping the
 * portrait into a green pool would have solved nothing. The byline corner stays
 * near-black.
 */
export const INK_BLOOMS = {
  deck: [
    `radial-gradient(88% 64% at 4% 106%, ${rgba(LEDGER.jade, 0.32)}, transparent 64%)`,
    `radial-gradient(64% 48% at 98% -8%, ${rgba(LEDGER.jade, 0.16)}, transparent 60%)`,
    `radial-gradient(56% 44% at 56% 112%, ${rgba(LEDGER.brass, 0.08)}, transparent 66%)`,
  ],
  report: [
    `radial-gradient(74% 50% at 99% 88%, ${rgba(LEDGER.jade, 0.30)}, transparent 62%)`,
    `radial-gradient(56% 40% at 102% -4%, ${rgba(LEDGER.jade, 0.13)}, transparent 60%)`,
    `radial-gradient(52% 36% at 46% 104%, ${rgba(LEDGER.brass, 0.06)}, transparent 66%)`,
  ],
} as const;

export function inkBackground(
  texture?: string,
  veil = 0.34,
  blooms: readonly string[] = INK_BLOOMS.deck,
): string {
  const layers = [...blooms];
  if (texture) {
    layers.push(`linear-gradient(180deg, ${rgba(LEDGER.ink, veil)}, ${rgba(LEDGER.ink, veil)})`);
    layers.push(`url('${texture}') center/cover`);
  }
  layers.push(LEDGER.ink);
  return layers.join(', ');
}

/**
 * The background stack for a LIGHT surface — bone paper with the plaster
 * relief showing through. Deck body pages, the light one-pager, report body.
 *
 * Same shape as `blockBackground()`: veil over texture over base. Passing no
 * texture returns flat bone, so a caller without the asset degrades to exactly
 * what shipped before this existed rather than to something broken.
 *
 * @param texture  the `bonebleed.webp` data URI — omit for flat bone
 * @param alpha    veil strength; defaults to the house `PAPER_VEIL_ALPHA`
 */
export function paperBackground(
  texture?: string,
  veil: number = PAPER_VEIL_ALPHA,
): string {
  const layers = PAPER_BLOOMS.map(
    b => `radial-gradient(${b.at}, ${rgba(LEDGER[b.color], b.alpha)}, transparent 64%)`,
  );
  if (texture && veil < 1) {
    layers.push(
      `linear-gradient(180deg, ${rgba(LEDGER.bone, veil)}, ${rgba(LEDGER.bone, veil)})`,
      `url('${texture}') center/cover`,
    );
  }
  layers.push(LEDGER.bone);
  return layers.join(', ');
}

/**
 * The hero dot-matrix, from `.pd-heromesh` — an ink micro-grid with sparse
 * green points, radially masked so it blooms in the middle and dissolves
 * before the edges (Paul, 2026-07-14: "needs some graphic or texture… not
 * selling the app, selling the service").
 *
 * Returned as a `{ backgroundImage, backgroundSize, backgroundPosition, mask }`
 * set rather than a single shorthand, because the mask is what keeps it from
 * reading as graph paper and it cannot ride in a `background:` value.
 */
export function meshLayer() {
  return {
    backgroundImage:
      `radial-gradient(${rgba(LEDGER.green, 0.2)} 1.2px, transparent 1.7px), ` +
      `radial-gradient(${rgba(LEDGER.ink, 0.13)} 1px, transparent 1.4px)`,
    backgroundSize: '96px 96px, 24px 24px',
    backgroundPosition: '11px 13px, 0 0',
    mask: 'radial-gradient(54% 58% at 50% 64%, #000, transparent 74%)',
  };
}

/**
 * The artwork lift.
 *
 * Every illustration in `assets/` was generated from prompts that baked in the
 * RETIRED bone `#F6F4EF` — and in practice landed warmer and darker still:
 * `trades/homes.png` measures `rgb(242,238,229)` across its background. Aurora
 * bone is `#FCFAF6` = `rgb(252,250,246)`. So on a light surface the framed art
 * panel sits nine to seventeen points below the paper around it and reads as a
 * dingy rectangle — Paul, 2026-08-01: "the cover image background needs to be
 * even lighter, not darker."
 *
 * `brightness()` is multiplicative, which is exactly the property this needs:
 * it lifts a near-white background by nine points and the illustration's dark
 * greens by one. The drawing is untouched; only its paper moves.
 *
 * THIS IS A BRIDGE, NOT THE FIX. The real repair is regenerating the library
 * from the corrected `PROMPTS.md`, which is Paul's call and not a small one.
 * The factor is calibrated to the home-services trade set; art baked at a
 * different value will land near, not exactly, on bone. When the library is
 * regenerated, set this to 1 and delete this comment.
 */
/**
 * THE GOLDEN RATIO, as a working scale rather than a decoration.
 *
 * phi = 1.6180339887. Its useful property here is that the ladder is
 * self-similar: every step is the previous one divided by phi, so a margin, a
 * gutter and a measure taken from the same ladder relate to one another the way
 * the page's two halves do. That is what reads as settled -- not the number, but
 * the fact that nothing on the page is an arbitrary round value.
 *
 * A carousel page is 1080 x 1350, so the divisions that matter are:
 *   major(1080) = 667.5   minor(1080) = 412.5    the vertical split
 *   major(1350) = 834.4   minor(1350) = 515.6    the horizontal one
 *
 * Do NOT round these to tidy numbers afterwards. The tidying is what breaks the
 * relationship, and a 412.5 rounded to 400 is just a number again.
 */
export const PHI = 1.6180339887;

/** n divided by phi, steps times. phi(1080) = 667.5, phi(1080, 2) = 412.5. */
export const phi = (n: number, steps = 1): number => n / Math.pow(PHI, steps);

/** The larger part of a golden division of n. */
export const major = (n: number): number => phi(n);

/** The smaller part -- n less its major. minor(1080) = 412.5. */
export const minor = (n: number): number => n - phi(n);

/**
 * The spacing ladder for a 1080-wide page. Every step is phi times the one
 * below, derived FROM the page rather than picked to look right.
 */
export const SPACE = {
  xs: +phi(1080, 8).toFixed(1),
  sm: +phi(1080, 7).toFixed(1),
  md: +phi(1080, 6).toFixed(1),
  lg: +phi(1080, 5).toFixed(1),
  xl: +phi(1080, 4).toFixed(1),
  xxl: +phi(1080, 3).toFixed(1),
} as const;

export const ARTWORK_LIFT = 1;

/**
 * The palette paragraph handed to MODELS — the deck designer's brand contract
 * and the artwork prompt.
 *
 * This is the subtlest drift risk in the whole system, and the reason this
 * function exists. When the palette lived as literal text inside a prompt, a
 * brand change left the model instructed in the OLD colours — and the model
 * complied faithfully. The output went off-brand with no code change to
 * review and nothing visibly wrong in the diff. Generating it means the
 * instructions cannot disagree with the renderer.
 *
 * The Aurora pass necessarily changes these strings, which invalidates every
 * cached deck — the deck cache key hashes the prompt. That is correct and
 * intended: a deck cached under the green-black contract is a green-black
 * deck. Do not "preserve" the old wording to save the cache.
 */
export function brandPaletteLines(): string[] {
  return [
    `- Bone paper ${CARTA.bone}; ink ${CARTA.ink}; body ${CARTA.body}; muted ${CARTA.muted}; hairline ${CARTA.hair}.`,
    `- ONE ACCENT and it is green: Deal Green ${CARTA.green} (hover ${CARTA.greenHover}, chip fill ${CARTA.greenTint}). On the dark band the accent is mint ${CARTA.mint}. There is NO warm colour in this system — no amber, no brass, no gold, no honey.`,
    `- TWO GROUNDS: bone paper ${CARTA.bone} and the band ${CARTA.dark}. The band is FLAT — no texture, no glaze, no halo, no gradient. On the band the neutrals are named values, not bone at alpha: reading text ${CARTA.darkInk}, secondary ${CARTA.darkSub}, labels ${CARTA.darkMuted}, hairlines ${CARTA.darkSeam}, label plates ${CARTA.darkPlate}.`,
    `- SQUARE. Corner radius 0 on cards, panels, image frames and plates; 10px on buttons and inputs and nothing else. Framed things wear four ${CARTA_HANDLE.size}px ink corner handles at ${CARTA_HANDLE.offset}px, outside the frame — ${CARTA.darkInk} on the band.`,
    `- GREEN IS NEVER A RESTING FILL. A primary button is ink-on-light or bone-on-dark. Green appears on hover, on chips, on kickers, on links, and on the bar under a numeral.`,
    `- RETIRED, do not use: amber ${LEDGER.brass}, honey ${LEDGER.honey}, the jade block ${LEDGER.dark}, ivory ${LEDGER.ivory}. They belong to palettes withdrawn on 2026-08-06 and 2026-08-08 and survive only so old artifacts rebuild.`,
  ];
}

/**
 * The strict palette clause for image-generation prompts (Gemini artwork).
 *
 * THE BACKGROUND HEX IS THE WHOLE POINT. The existing library was generated
 * against the retired bone `#F6F4EF` and landed warmer still — `trades/homes.png`
 * measures rgb(243,239,229) against Aurora bone's rgb(252,250,246). On a light
 * page the art panel sits up to seventeen points below the paper around it and
 * reads as a dingy rectangle; `ARTWORK_LIFT` is the multiplicative bandage, and
 * it cannot fully work — a brightness multiply lifts the yellow cast with
 * everything else, leaving blue about nine points short.
 *
 * State it as an exact hex and say the word FLAT, because "off-white" is an
 * invitation to a gradient and a gradient cannot match a flat page at any
 * brightness. Paul, 2026-08-06: "we need to give gemini the background and
 * primary colors that we need to regen the images with."
 */
export function artworkPaletteClause(): string {
  /* JADE LEADS, DEAL GREEN SHADES — the order is the point, and it is the
     opposite of the UI palette. Deal Green is the working accent on a page: a
     rule, a bar, a word. Spread across the body of a van or the roofs of a
     dozen houses it reads heavy and muddy against bone (Paul, 2026-08-06: "the
     green is too dark"). Jade is the lighter value and the better FILL, and it
     is what Gemini reaches for unprompted — a measured test image came back
     jade-dominant against a brief that asked for Deal Green, which is the model
     agreeing with the eye. So the brief now asks for what actually works.
     "greenBright is never small text" still holds; that rule is about type on
     bone, not about an illustration.

     CARTA, 2026-08-08: the amber detail clause is DELETED rather than reduced.
     Carta has one accent. A prompt that mentions gold "sparingly" gets gold —
     the model complies faithfully, the picture goes off-palette, and nothing in
     the diff or the render shows it. Both surviving values (bone, deep green)
     are unchanged across the move, so only the removals matter here. */
  return `flat solid background exactly ${CARTA.bone} with no gradient, vignette, texture or drop shadow; `
    + `bright green ${CARTA.greenBright} for the main masses and large planes; `
    + `deep green ${CARTA.green} for shadow, shaded faces and secondary detail only; `
    + `near-black linework ${CARTA.ink}; `
    + `NO amber, NO gold, NO brass and no warm accent of any kind — this palette has one colour;`;
}
