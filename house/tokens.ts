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

/** The Ledger palette. Values verified identical across every renderer. */
export const LEDGER = {
  /* canvas + ink */
  bone: '#F6F4EF', // page canvas
  ink: '#14181C', // headings, primary text
  slate: '#5C6670', // body text (decks, cards, the app)
  muted: '#8A9099', // sources, vintages, captions
  hair: '#E4E1D9', // hairline borders
  rule: '#D8D5CA', // heavier dividers

  /* the ONE accent */
  green: '#16624C', // Deal Green — the only accent
  greenHover: '#0F4E3C',
  greenTint: '#E7F0EC', // chip fill
  mint: '#8FD0AE', // green-on-dark links, rings

  /* jewelry — signature numerals only, never a second accent */
  brass: '#B08637',

  /* dark boardroom band */
  dark: '#0F1A16',
  ivory: '#F3F1EA', // reading text on dark
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
  ivorySub: '#CBD1CB', // cover sub-text on dark
  statLabel: '#A6BEB2', // cover stat-card labels on dark
  tableHead: '#EEE9DD', // GFM table header fill
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

/** The mint byline ring and the green halo on dark bands — house constants. */
export const MINT_RING = rgba(LEDGER.mint, 0.65);
export const GREEN_HALO = rgba(LEDGER.green, 0.28);

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
 * Wording is deliberately byte-identical to the hand-written original: the
 * deck cache key hashes the prompt, so changing a character would invalidate
 * every cached deck.
 */
export function brandPaletteLines(): string[] {
  return [
    `- Bone paper ${LEDGER.bone}; ink ${LEDGER.ink}; body gray ${LEDGER.slate}; muted ${LEDGER.muted}; hairline ${LEDGER.hair}.`,
    `- Deal Green ${LEDGER.green} (deep ${LEDGER.greenHover}); mint on dark ${LEDGER.mint}; brass ${LEDGER.brass} (jewelry only); boardroom dark ${LEDGER.dark}; ivory ${LEDGER.ivory}; ivory-sub ${LEDGER.rule}.`,
  ];
}

/** The strict palette clause for image-generation prompts (Gemini artwork). */
export function artworkPaletteClause(): string {
  return `bone off-white background ${LEDGER.bone}, deep green ${LEDGER.green},`;
}
