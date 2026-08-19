# Work order — the figure cover for carousels (`house/deck.ts`)

**For Claude Code, from a Cowork studio session, 2026-08-18.** Paul: *"Def full
axis correction! Let's lock that in for carousel and single image formats.
Banner for longer form reports. (let's don't remove the other types, but I
think this can be the default.)"*

The one-pager half is DONE — `scripts/studio/build-onepager.mts` now carries
`layout: 'figure'` as the default (approved v6 mock geometry; FORMATS.md §2.0,
DESIGN.md §6.2 amended and dated). The carousel half is this order. It is
written rather than built because the deck cover lives in `house/deck.ts`,
which is the shared grammar the app also renders through — ONE CLONE law says a
studio session asks for engine changes there rather than making them, and the
engine-parity suite (50 cases) plus `test:design` (103) guard that file.

## What to build

A **figure cover** variant in `deckPages()`: the full-length founder cutout
(`studio/assets/brand/founder-standing.png` — axis-straightened 13.67°, matte
re-cut for any ground; derivation in `studio/assets/INDEX.md`, regeneration
recipe in `studio/FORMATS.md` §2.1) standing in the cover's right minor column,
hook and stats wrapping/beside it in the golden major.

The approved geometry, from the one-pager conversion (reuse, do not re-derive):

- figure height = card height × φ⁻¹ (834px on a 1350 canvas), floated IN FLOW
  with `shape-outside` on its own alpha — `position: absolute` silently kills
  the wrap (measured defect, v2 mock);
- float top margin 100px — the APPROVED rendering lands his feet just above
  the foot rule; do not "fix" it to touch without Paul's sign-off;
- spacing on the Fibonacci ladder 21 · 34 · 55;
- dark cover: the SANCTIONED radial Deal Green bloom behind the figure
  (scope is exact: figure layouts, dark ground, radial Deal Green — DESIGN.md
  §6.2; the boardroom texture stays retired; `bloom: false` opts out);
- **the C treatment is the dark default** (Paul, 2026-08-18; FORMATS §2.0 has
  the numbers): bloom AIMED at the figure torso (600 × 860 ellipse, peak
  0.52) plus a 1.16/1.05 exposure lift on the figure applied at render — a
  CSS `filter: brightness(1.16) contrast(1.05)` on the cutout `<img>` is the
  Chromium equivalent; the asset itself is never lifted;
- CTA/address on the band in `CARTA.white` (Paul: "bright white") — consider
  whether this wants a token (`darkCta`?) rather than reading `white`, since
  the same value now appears in two builders.

## Contract

- `cover.figure?: string` — presence selects the figure cover; default asset
  `brand/founder-standing.png` when `cover.layout === 'figure'` with no path.
  **Default for NEW decks** per Paul — but existing specs must render
  byte-identically, so the selection must be opt-in at the spec level exactly
  the way the one-pager's back-compat inference works (a spec with
  `cover.image` and no `cover.layout` keeps today's framed-image cover).
- Text-only and framed-image covers stay fully available — "don't remove the
  other types."
- Reports are OUT of scope: banner grammar stays (Paul: "banner for longer
  form reports").
- Assets arrive as data URIs through `DeckAssets` — keep the module pure (no
  fs; the parity suite asserts it).
- The three in-flight home-services decks (P-2 `dead-deal-economics`, P-5
  `hvac-2026-read`, P-7 `corp-dev-cost-sheet`) should adopt the figure cover
  once it exists; their specs currently have no cover image at all.

## Gates before merge

`npm run test:engine-parity` · `npm run test:design` · a real render of one
in-flight deck compared against its previous output — the font trap
(COLLATERAL_STATE.md §4) is invisible in a diff, so check the rendered PDF's
faces, not the source.
