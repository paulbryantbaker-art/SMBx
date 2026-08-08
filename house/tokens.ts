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
 * `DESIGN_LANGUAGE.md` remains the canonical description of the system; this
 * file is its machine-readable form and must not drift from it.
 */

/**
 * The Ledger palette, AURORA pass (2026-07-31, Paul: "I hate the dark green…
 * too dark… what can we do to make the pages look more cheerful").
 *
 * The complaint was about WEIGHT, not hue. Two values were carrying it: the
 * boardroom band at `#0F1A16` (L* 8.9 — near-black with just enough green to
 * read as a mistake rather than a decision) appearing three-plus times in the
 * landing scroll, and Deal Green at `#16624C` (L* 36), dark enough that it
 * receded on bone instead of leading. So the system keeps its shape and loses
 * its heaviness: nothing is near-black any more, the rhythm break is a
 * saturated jade BLOCK rather than an absence of colour, and brass grows up
 * from jewelry-on-one-stat into a working second warm.
 *
 * WHY THE ACCENT IS NOT THE VIVID JADE. The obvious move — make the accent the
 * bright jade — fails accessibility outright, and it fails quietly: white on
 * `#0FA97C` is 2.97:1 and the same jade as link text on bone is 2.85:1, both
 * well under the 4.5:1 floor. Nothing in a diff shows that. So the vivid jade
 * is a HIGHLIGHT token (ambient bloom, large numerals, block edges — roles
 * that carry no small text) and `green` sits deep enough to hold white at
 * 5.3:1 and to read as a link on bone at 5.1:1, while still landing ~9 L*
 * brighter and materially more saturated than the green it replaces.
 *
 * Contrast on the jade block `dark` (#0A6A4C), all measured not assumed, flat
 * value first and over the texture second (the glaze deepens it slightly, so
 * the flat number is always the worse case and the one to hold):
 * ivory 6.2 / 7.4 · ivorySub 5.0 / 5.9 · mint 5.0 / 5.9 · statLabel 4.7 / 5.6 ·
 * honey 4.0 / 4.8 · brass 3.1 / 3.7. Honey and brass are large-text-only
 * colours — numerals and tags — which is the only job either has here.
 *
 * The block was briefly set five points deeper than this out of caution, and
 * that was a mistake worth recording: rendering it showed a field visibly
 * heavier than the one that was reviewed and signed off, and re-checking the
 * roles showed the caution bought nothing — every role still clears AA at this
 * lightness, because the two that come closest are numerals. Contrast margin
 * is not free; spending it darkens the thing the whole pass exists to lighten.
 *
 * Values verified identical across every renderer.
 */
/**
 * ── THE CARTA SYSTEM (2026-08-07) — the PUBLIC SITE's language ──────────────
 *
 * Values transcribed from `design_handoff_smbx_carta_restyle/` (Claude Design),
 * which is a BINDING spec: its README's rule is "transcription, not
 * interpretation — extract values from the source, never eyeball, never round,
 * never improve." Nothing here is a judgement call; every hex was read out of
 * the reference HTML and cross-checked against its frequency in the file.
 *
 * WHY THIS IS A SECOND EXPORT INSTEAD OF AN EDIT TO `LEDGER`.
 * Paul's scope call was explicit: the public site lands first, the collateral
 * renderers follow in a second pass. But `LEDGER` is imported by
 * researchComposer, deckDesigner, practiceMapPdf, ownerFullReport, artworkService
 * and both app shells — so editing it in place would have re-skinned every
 * report PDF, LinkedIn carousel and one-pager the moment the site changed,
 * which is precisely the thing he deferred. Two exports keep the phases
 * honest: the site consumes CARTA, the collateral keeps LEDGER, and phase 2
 * is the commit that moves the renderers over and deletes LEDGER.
 *
 * THE COST OF THAT, STATED PLAINLY: between now and phase 2 the site and the
 * collateral are DIFFERENT SYSTEMS. `content/studio/DESIGN.md` exists on the
 * premise that they are one, and `npm run test:design` checks that premise —
 * so both say so during the interim rather than quietly asserting something
 * false. A deck built this week will not match the website; that is a known,
 * time-boxed divergence, not drift.
 *
 * WHAT CHANGED, AND THE ONE THING THAT DID NOT: the accent survives untouched.
 * Deal Green `#0A7A58`, its hover, its tint and mint are identical values to
 * Aurora's — the brand mark does not move. What moves is everything around it:
 * the dark surface stops being a saturated jade block over a texture and
 * becomes flat near-black `#131512` with square edges; the warm second accent
 * (brass/honey) is GONE, leaving exactly one accent; and the neutrals go
 * cooler and slightly deeper for reading.
 *
 * THE BUTTON LAW IS A TOKEN-LEVEL FACT, NOT A STYLE PREFERENCE: green is
 * NEVER a resting button fill. Primary is ink on light / bone on dark, and
 * green appears as hover feedback, chips, kickers and links. `greenHover`
 * therefore names a FILL that only exists in the hover state — read it that
 * way or the law inverts.
 */
export const CARTA = {
  /* light surfaces */
  bone: '#FCFAF6',        // page ground — unchanged from Aurora
  boneAlt: '#F9F7F1',     // second light ground, used for banded sections
  panel: '#F3F0E9',       // tint / panel fill
  panelHover: '#EFEBE1',
  panelDeep: '#ECE8DC',
  white: '#FFFFFF',       // card fill — cards are white, and square

  /* ink scale — cooler and deeper than Ledger's slate/muted pair */
  ink: '#16181A',         // headlines, primary button fill — unchanged
  body: '#4A4F54',        // body copy
  muted: '#7C8187',       // labels, meta
  placeholder: '#8B9088',

  /* lines. Radius is 0 everywhere except buttons/inputs, so a hairline is
     doing the work a rounded card used to do — these carry the layout. */
  hair: '#E4DFD3',        // hairlines AND the 1px grid seam behind tiles
  chipBorder: '#D8D3C6',

  /* the one accent — identical to Aurora's, deliberately */
  green: '#0A7A58',       // links, chips, kickers, ACTIVE states
  greenHover: '#086348',  // the hover FILL (never a resting fill — see above)
  greenTint: '#DFF5EC',   // light-surface wash
  greenBright: '#0FA97C', // rare
  mint: '#A8F0CE',        // the accent ON dark surfaces

  /* dark bands + footer — flat, square, untextured */
  dark: '#131512',
  darkSeam: '#2A2E29',    // grid seams and hairlines on dark
  darkPlate: '#22261F',   // label plates
  darkInk: '#F4F5F1',     // reading text on dark
  darkSub: '#D7DBD2',
  darkMuted: '#ABB2AB',
  darkLegal: '#8A9088',
  darkBtnBorder: '#4A4F44',
} as const;

/** Type for the site. Loaded from Google Fonts in the browser — which is fine
 *  HERE and fatal in a renderer: the PDF/deck paths must embed woff2s locally
 *  (Railway blocks the Google CDN; the Docker image carries only Noto).
 *
 *  THE PHASE-2 FONT BLOCKER IS CLEARED (2026-08-08). This comment used to say
 *  collateral could not move until @fontsource packages existed for Source
 *  Serif 4 and Schibsted Grotesk. They do:
 *  `server/services/fontEmbeds.ts` exports `cartaFontFaceCss()`, inlining
 *  Source Serif 4 variable + Schibsted Grotesk 400–700 + Plex Mono 400/500,
 *  already proven by the practice market-map PDF. A renderer moving to CARTA
 *  swaps `fontFaceCss()` for `cartaFontFaceCss()` and is done.
 *  Work order: `content/studio/CARTA_COLLATERAL_CONVERSION.md`. */
export const CARTA_TYPE = {
  display: `'Source Serif 4', Georgia, serif`,
  sans: `'Schibsted Grotesk', -apple-system, sans-serif`,
  mono: `'IBM Plex Mono', monospace`,
} as const;

/** Display weights: 550 headlines, 600 card titles. */
export const CARTA_DISPLAY_WEIGHT = 550;

/** The signature frame device — 8px ink squares at −4px offsets (7px squares
 *  keep the SAME −4px offset on small cards — the 2026-08-07 fidelity audit
 *  confirmed every small-handle site in the references sits at −4, and the
 *  README says "−4px offsets" for both sizes). Square, never rounded; this is
 *  what replaces Aurora's curved band crests as the house's recognisable
 *  gesture. */
export const CARTA_HANDLE = { size: 8, offset: -4, sizeSmall: 7, offsetSmall: -4 } as const;

export const LEDGER = {
  /* canvas + ink */
  bone: '#FCFAF6', // page canvas — lifted, so the accent has room
  ink: '#16181A', // headings, primary text
  slate: '#5A6169', // body text (decks, cards, the app)
  muted: '#83898F', // sources, vintages, captions
  hair: '#EAE5DC', // hairline borders
  rule: '#DED8CC', // heavier dividers

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
 * Long-form report tokens.
 *
 * `body` is deliberately darker than `LEDGER.slate` — long-form reading text
 * wants more contrast than a slide glanced at for two seconds. Kept separate
 * rather than folded into LEDGER so that unifying it later is an explicit
 * design decision, not a silent side effect of de-duplication.
 */
export const REPORT = {
  body: '#3F464C', // darker than LEDGER.slate for sustained reading
  ivorySub: '#C9E8DA', // cover sub-text on the block
  statLabel: '#BFE3D2', // cover stat-card labels on the block
  tableHead: '#F1ECE0', // GFM table header fill
} as const;

/** Working type. Fraunces displays, Inter works, Plex Mono labels. */
export const TYPE = {
  display: `'Fraunces', Georgia, serif`,
  sans: `'Inter', -apple-system, sans-serif`,
  mono: `'IBM Plex Mono', monospace`,
} as const;

/** Fraunces display weight — 545, not 600. */
export const DISPLAY_WEIGHT = 545;

/* ── derived forms ────────────────────────────────────────────────────── */

/**
 * `#RRGGBB` → `rgba(r,g,b,a)`.
 *
 * Halos, rings and glazes are all palette colours at low alpha. Deriving them
 * keeps them from going stale when the palette moves — a hand-written
 * `rgba(22,98,76,0.28)` is Deal Green today and a lie tomorrow.
 */
export function rgba(hex: string, alpha: number): string {
  const n = parseInt(hex.replace('#', ''), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

/**
 * The mint byline ring and the halo on the block — house constants.
 *
 * The halo is derived from `jade`, not `green`: it is a glow laid OVER the
 * jade block, and the working accent is now close enough to the block itself
 * that a halo made from it would be invisible. The vivid highlight is what
 * separates from the ground, which is the job a halo has.
 */
export const MINT_RING = rgba(LEDGER.mint, 0.65);
export const GREEN_HALO = rgba(LEDGER.jade, 0.28);

/**
 * The jade block, laid over the boardroom texture.
 *
 * This helper exists because the obvious way to write it is wrong, and wrong
 * in a way that renders rather than errors. The old rule was
 * `background: DARK url(texture) center/cover` — with the near-black band
 * colour that read fine, because the image and the colour underneath it were
 * the same shade. The image is opaque and FULLY covers the colour, so the
 * colour was never really doing any work; it was a fallback. Point that same
 * rule at a saturated jade and the page still renders near-black — the whole
 * change silently does nothing, on every dark surface at once.
 *
 * So the block is composited: a 72% jade glaze OVER the texture, with the
 * flat colour last as the no-image fallback.
 *
 * This was 0.84 and the collateral came back flat ("what happened to the
 * texture?"). The alpha was only half of why: on the CAROUSEL COVER a second
 * veil is painted over this composite (deck.ts `.glaze`), so the two
 * multiplied out to ~0.92 effective and the plaster vanished. Both were
 * pulled back together — changing either alone barely moves it, which a
 * ladder of this value ALONE demonstrated before the second layer was
 * found: 0.84 through 0.54 looked nearly identical on the cover.
 *
 * Contrast is unaffected in the direction that matters: the mean ground goes
 * #1B6251 -> #205B4F, so ivory measures 7.4:1 rather than 6.7:1. More
 * texture makes the field slightly DARKER on average, not lighter.
 *
 * The glaze also deepens the effective ground a little, which is a gift and
 * not a problem: ivory on the composited block measures 8.7:1 against 7.7:1
 * on flat jade.
 */
export const BLOCK_GLAZE = rgba(LEDGER.dark, 0.72);

/** The full background stack for a textured jade block. */
export function blockBackground(textureUrl: string): string {
  return `linear-gradient(${BLOCK_GLAZE}, ${BLOCK_GLAZE}), url('${textureUrl}') center/cover, ${LEDGER.dark}`;
}

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
 * The deck cache key hashes the prompt, so editing these lines invalidates
 * every cached deck. On a palette change that is the CORRECT outcome, not a
 * cost to avoid: a cached deck is a deck rendered in the old colours, and
 * serving it after a rebrand is the exact drift this function exists to stop.
 * Outside a palette change, leave the wording alone.
 */
export function brandPaletteLines(): string[] {
  return [
    `- Bone paper ${LEDGER.bone}; ink ${LEDGER.ink}; body gray ${LEDGER.slate}; muted ${LEDGER.muted}; hairline ${LEDGER.hair}.`,
    `- Deal Green ${LEDGER.green} (deep ${LEDGER.greenHover}); vivid jade ${LEDGER.jade} for large numerals and edges ONLY, never small text; mint on the block ${LEDGER.mint}; amber ${LEDGER.brass} on light and honey ${LEDGER.honey} on the block, for numerals and rules; jade block ${LEDGER.dark} (the rhythm break — nothing in this system is near-black); ivory ${LEDGER.ivory}; ivory-sub ${LEDGER.rule}.`,
  ];
}

/** The strict palette clause for image-generation prompts (Gemini artwork). */
export function artworkPaletteClause(): string {
  return `bone off-white background ${LEDGER.bone}, deep green ${LEDGER.green},`;
}
