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
