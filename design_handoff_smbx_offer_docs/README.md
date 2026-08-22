# smbX collateral handoff — OXBLOOD

**2026-08-22.** Rebuild package for the two smbx Dev offer documents and the
landscape LinkedIn Featured cover, on the OXBLOOD design language.

## Read in this order

1. **`STYLE.md`** — the reusable style contract. Read this if you are building
   *new* collateral in the style. Tokens, the depth ramp and its measured laws,
   type scale, the φ grid, page-kind recipes, the drift checklist.
2. **`CLAUDE.md`** — per-page parameter tables. Read this if you are reproducing
   *these* pages. Every coordinate, size and hex, plus the deliberate deviations
   and the reasons they are deliberate.
3. **`TOKENS-USED.md`** — the hex-by-hex map and the full list of copy departures
   from the source PDF.

`DESIGN_LANGUAGE.md` (not shipped here — it lives in the repo) is the authority
above all three.

## What is in the box

| | |
|---|---|
| `offer-nopricing-p01..p05.html` | 5pp — cover · problem · engagement · Dev Pro · closer. Postable. |
| `offer-pricing-p01..p07.html` | 7pp — adds schedule (table) and terms. **Email-gated only.** |
| `featured/cover-2a-portal.html` | 1200×630 LinkedIn Featured cover. Filename is historical — the portal it was named for is retired. |
| `candidates/cover-suit-b-framed.html` | An alternative cover treatment Paul ranked second and asked to keep. **Not live.** |
| `assets/` | photography and both logo marks |

**Asset manifest** — six files, all referenced by a page:
`founder-suit.jpg` (portrait cover) · `founder-plane.jpg` (landscape featured) ·
`founder-headshot.jpg` (closer/CTA portrait) · `founder-portrait.jpg` (56px cover
foot byline only) · `logo-accent-x.png` (light grounds) · `logo-bone-x.png` (field).

`founder-standing.png` also ships — **unreferenced here on purpose.** It is the
retired cut-out, still live in the figure-card package, kept so a rebuild of that
family has it to hand. `founder-standing-nophone.png` is **not** shipped: its
clone-fill is visible at every crop now in use.

Pages p01–p04 are identical between the two documents except the foot page number
(`N / 5` vs `N / 7`). The closers differ only in one para line and the page number.

All pages are exact-size, no JS, fonts from CDN. Verified before export: 14 pages,
every local asset reference resolves, and no page contains a retired-system value
(no Deal Green, mint, near-black band, Source Serif 4, Schibsted Grotesk, or
`smbXCorpDev`).

## Before you start

- **The fonts are already in your environment.** Instrument Serif, Plus Jakarta
  Sans, IBM Plex Mono. No font files ship here — swap the CDN links for the repo's
  local mechanism. Do not re-embed TTFs.
- **Covers use photographs, not the cut-out.** This is the single biggest change in
  the package: a photograph fills the field panel edge to edge and the stat block
  moves to a well at the panel's foot. `founder-suit.jpg` on the portrait cover,
  `founder-plane.jpg` on the landscape. The cut-out `founder-standing.png` is
  **retired from covers** and survives only on the figure cards — do not reinstate
  a `.fig` layer.
- **The split direction follows the source aspect.** A standing shot takes a
  vertical split with a side panel; a wide shot (≥2:1) takes a horizontal split
  running the full card width with a field band beneath. Forcing a wide photograph
  into a tall slot discards half its width. `STYLE.md §6` has the rule.
- **`founder-suit.jpg` is retouched** — a tower spire behind his head was painted
  out. If that photo is ever re-exported from the source, the retouch must be
  redone. `founder-standing-nophone.png` is retained but unused; its clone-fill
  shows at the crops now in use.
- **No matted/alpha version of any photograph exists.** A cut-out of the suit shot
  needs hand matting — no colour key separates a charcoal suit from dark buildings
  behind glass.
- **Logos are derived, not official.** `logo-accent-x.png` and `logo-bone-x.png`
  were remapped pixel-wise from the green mark. If brand has a real oxblood mark,
  use it and delete these.
- **No figure for smbx Coach or smbx Crew exists.** Do not invent one.

## Not in this package

- The landscape featured build's **body pages** — still on the retired green
  system. They need this same pass.
- The figure cards — separate package, `design_handoff_smbx_figure_card/`.
- The two shipped PDFs. Both still carry `smbXCorpDev` and Deal Green; the rename
  alone forces a rebuild. See `STYLE.md §9` for the slug trap that will otherwise
  leave every lead receiving the old brochure.

## Three deliberate deviations — do not "correct" them

Each looks like a bug to anyone reading the numbers cold, so each is flagged
in place as well:

1. **Corner handles are 16px at −8px**, where `DESIGN_LANGUAGE.md §5` says 8px at
   −4px. The ratio is preserved; the size is scaled for a 1080px artboard, where
   8px is optically invisible. Do not carry the scaled figure into interface work.
2. **The closer's offset plate and bottom-right handle overhang the page margin**
   (x1034 and x1024 against a 1016 margin). That is what an offset plate and a
   negative-offset handle *are*. The photograph is the content and the photograph
   aligns.
3. **The two closer plates carry differently-coloured `x` marks** — accent on the
   outlined plate, bone on the raised one. §3.4.3 bars the accent from a raised
   surface: `#FF7D55` on `#964046` is 2.67:1, failing even the display threshold.
