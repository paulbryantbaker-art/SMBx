# CLAUDE.md — figure-card handoff (2026-08-19)

**RULE ZERO: transcription, not interpretation.** Extract values from the two
reference HTML files; never eyeball, never round, never improve. When this file
and the HTML disagree, the HTML wins and this file is a bug — say so.

## What this is

The approved grounds for the smbX one-pager FIGURE layout ("day four questions"
card family), chosen by Paul 2026-08-19 from a 6-direction → 3-refinement →
4-final ladder:

- **DARK = `dark-2a-green-monolith.html`** — Deal Green monolith on the band,
  greenBright offset rim plate, aimed green bloom, gradient left panel.
- **LIGHT = `light-2b-stepped-portal.html`** — four receding green portal
  steps on paper, gradient left panel, dot field.

Note they are DIFFERENT mechanics on the two grounds, on purpose. Both are
1080 × 1350 exact, no JS, fonts embedded from `assets/fonts/`.

## Target

`scripts/studio/build-onepager.mts` (FIGURE layout, FORMATS.md §2.0) —
these become the ground treatments behind the existing spec slots
(`kicker/hook/body/points/note/cta/byline`). Copy slots are unchanged.
Suggested spec switch: `ground: 'monolith-dark' | 'portal-light'` with the
current bloom card kept as-is behind its existing flag.

## Sanctioned amendments (Paul, this thread, 2026-08-19) — scope: THIS card family

1. **Gradients** (previously banned by DESIGN.md §2):
   - Copy panel, light: `linear-gradient(170deg, #FFFFFF 0%, #F9F7F1 46%, #F3F0E9 100%)`
   - Copy panel, dark: `linear-gradient(170deg, #22261F 0%, #181818 62%)`
   - Dark bloom: `radial-gradient(620px 880px at 655px 620px, rgba(green,.55) 0%, rgba(green,.22) 42%, transparent 85%)` — the approved C-treatment geometry re-aimed; derive via `rgba(CARTA.green, α)`.
2. **Exposure lift on the figure, renderer-side only** — dark: `brightness(1.16) contrast(1.05)` (the pre-approved pair); light: `brightness(1.08) contrast(1.02)` (new, sanctioned). `founder-standing.png` stays untouched.
3. **Deal Green as a plate surface** (monolith / portal steps).

Everything else in DESIGN.md holds: radius 0, no textures, no shadows, square
handles grammar, button law, the three faces. **The renderer-proof law holds:
rasterise the card at 2× and post the PNG/JPG — no gradient may reach a vector
layer.**

## Parameters — DARK (monolith)

| Element | Values |
|---|---|
| Canvas | 1080×1350 `#181818` |
| Copy panel | 0,0 → 596×1232, dark gradient above, right seam 1px `#2A2E29` |
| Bloom | see amendment 1, painted above panel, below monolith |
| Orbit | circle 760px at (400,−180), 1px `#2A2E29`; 7px `#A8F0CE` nodes at (479,355),(1060,120) |
| Rim plate | 610,14 → 420×1232 `#0FA97C` |
| Monolith | 596,0 → 420×1232 `#0A7A58`; inner frame inset 16, 1px `#086348` |
| 47% | Source Serif 550, 168px/0.9, ls −0.03em, `#FFFFFF`, at (48,70) in-plate |
| Stat bar | 52×4 `#A8F0CE` at (158,252) in-plate |
| Label | mono 600 13.5/1.7, ls .12em, `#DFF5EC`, w230 at (158,278) in-plate — verbatim substring of body |
| Figure | h930 at (515,302), feet on y1232, lift 1.16/1.05 |
| Kicker | mint square 8px + mono 600 13.5 ls .16em `#A8F0CE` at (64,58) |
| Logo | `logo-green-x-dark.png` h26 top-right 64 |
| Hook | serif 550 64/1.04 `#F4F5F1`, turn (`at day four.`) `#A8F0CE`, w480 at (64,128) |
| Lede | sans 400 21/1.5 `#D7DBD2` w460 at (64,368) |
| Points | y 560/706/852, w460; chip 28px `#22261F` + mono `#A8F0CE`; k sans 600 19 `#F4F5F1`; v sans 16.5/1.45 `#ABB2AB` |
| Note | mono 13/1.55 `#8A9088` w440 at (64,1044) |
| Foot | h118, top seam `#2A2E29`, bg `#181818`; headshot 54 round, 3px `#FFFFFF` ring, 1px `#4A4F44` outline; name 600 19 `#F4F5F1`; title 14.5 `#ABB2AB`; CTA mono 600 17 `#FFFFFF` |

## Parameters — LIGHT (portal)

| Element | Values |
|---|---|
| Canvas | 1080×1350 `#FFFFFF` |
| Copy panel | 0,0 → 520×1232, light gradient above, right seam 1px `#E4DFD3` |
| Dot field | 5×12 grid, 3px `#D8D3C6` dots, 34px pitch, origin (430,120) |
| Portal steps | p1 520,0 → 496×1232 `#DFF5EC` · p2 558,0 → 458×1194 `#0FA97C` · p3 596,0 → 420×1156 `#0A7A58` · p4 634,0 → 382×1118 `#086348` (38px insets, staggered bottoms) |
| 47% | same face, at (682,70), `#FFFFFF` |
| Stat bar | 52×4 `#A8F0CE` at (688,252) |
| Label | as dark, `#DFF5EC`, w240 at (688,278) |
| Figure | h930 at (500,302), feet y1232, lift 1.08/1.02 |
| Kicker/hook/lede/points/note | light palette: green kicker, ink hook (green turn), `#4A4F54` body, `#DFF5EC` chips w/ green numerals, `#7C8187` note; same geometry as dark, lede w452, points w440 |
| Logo | `logo-green-x-dark.png` (sits on the green steps) |
| Foot | white, top hair `#E4DFD3`, CTA green, ring outline `#D8D3C6` |

## Assets

`assets/founder-standing.png` (1150×3560, the axis-corrected cutout — never
regenerate, never re-matte), `founder-portrait.jpg` (the only headshot),
`logo-green-x{,-dark}.png` (as shipped), fonts: Source Serif 4 variable
(wght-only), Schibsted Grotesk 400/600/700, IBM Plex Mono 400/600.

## Acceptance

Every hex resolves to a CARTA token (`TOKENS-USED.md` is the map); copy renders
verbatim from the spec with nothing truncated; both references reproduce
pixel-for-pixel at 1080×1350 before any parameterisation; output rasterised at
2× before it is posted or PDF'd.
