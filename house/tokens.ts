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
