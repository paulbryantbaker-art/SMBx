# CLAUDE.md — offer documents handoff (2026-08-19)

**RULE ZERO: transcription, not interpretation.** Extract values from the 12
reference HTML files; never eyeball, never round, never improve. When this file
and the HTML disagree, the HTML wins and this file is a bug — say so.

## What this is

The two smbXCorpDev offer documents in the approved figure-card LIGHT family
(portal-light bookends), replacing `smbx-corpdev-offering-pricing.pdf` (the old
amber/dark system — dead):

- **`offer-nopricing-p01..p05.html`** — 5 pages: cover · problem · engagement ·
  Premium · closer.
- **`offer-pricing-p01..p07.html`** — 7 pages: cover · problem · engagement ·
  Premium · schedule (table) · terms · closer.

All pages 1080 × 1350 exact, no JS, fonts embedded from `assets/fonts/`.
Pages p01–p04 are byte-identical between the two documents except the foot
page number (`N / 5` vs `N / 7`). The closers differ only in the para
(no-pricing drops "at a price you already know") and page number.

## Target

`scripts/studio/build-deck.mts` — one spec per document
(`smbx-corpdev-offering.deck.mts`, `smbx-corpdev-offering-pricing.deck.mts`).
Suggested page kinds: `cover-portal-light` · `body` (dash list) · `body-numbered`
· `body-table` · `closer-frame-c-light`. The with-pricing document is the
published offering PDF (site download); the no-pricing one is postable.

## Laws carried over (round one + carousel round)

- Every hex resolves to `laws/tokens.ts` CARTA block — map in `TOKENS-USED.md`.
  Greens only; the old PDF's ambers are dead-system hexes, re-tokened.
- Radius 0 except the round byline headshot. No shadows, no textures.
- Gradient sanction (scoped): the 170deg bone→boneAlt 46%→panel gradient is the
  cover copy panel AND the body-page ground (the old doc's cream ground,
  re-tokened). No other gradients on light pages.
- Exposure lift renderer-side only: `brightness(1.08) contrast(1.02)` on the
  standing figure. `founder-standing.png` as shipped — never regenerate.
- Bookend law: plated bookends only (cover portal steps, closer green plates);
  every page between is light.
- Bookend logos lower-left at φ²: 199px wide (`logo-green-x.png`).
- **Mobile floor:** reading text 40px, headlines 64px, mono kickers 26px,
  source/legal ≥20px, nothing under 20px. Judge at 360px wide.
- Copy VERBATIM from the old offering PDF (departures listed in
  `TOKENS-USED.md` §Departures — 4 items, all awaiting/holding Paul's sanction).
- Rasterise at 2× before PDF/post — no gradient reaches a vector layer.

## Parameters — COVER (p01, both docs)

Ground transcribed 1:1 from `light-2b-stepped-portal.html` (round-one handoff).

| Element | Values |
|---|---|
| Canvas | 1080×1350 `#FFFFFF` |
| Copy panel | 0,0 → 520×1232, 170deg gradient, right seam 1px `#E4DFD3` |
| Dot field | 5×12 grid, 3px `#D8D3C6`, 34px pitch, origin (430,120) |
| Portal steps | p1 520,0→496×1232 `#DFF5EC` · p2 558,0→458×1194 `#0FA97C` · p3 596,0→420×1156 `#0A7A58` · p4 634,0→382×1118 `#086348` |
| Numeral | `150` Source Serif 550 168/0.9, ls −.03em, `#FFFFFF`, at (682,70) |
| Stat bar | 52×4 `#A8F0CE` at (688,252) |
| Step label | mono 600 22/1.55 ls .1em `#DFF5EC` w250 at (688,278) — `ACQUISITIONS — TWO DECADES, ONE SIDE OF THE TABLE` |
| Kicker | 10px green square + mono 600 26 ls .14em `#0A7A58` at (64,58) — `CORPORATE DEVELOPMENT` |
| Hook | serif 550 64/1.06 ls −.01em `#16181A` w470 at (64,130); turn `We make it easier.` `#0A7A58` |
| Lede | sans 400 40/1.32 `#4A4F54` w452 at (64,492) |
| Stats | at (64,846) w452; rows top-hair `#E4DFD3` (last also bottom), pad 16/14; value serif 550 42 `#0A7A58` min-w128; label mono 600 20 ls .08em `#7C8187` — `$5B+ / ≈$21B / 0` |
| Logo | `logo-green-x.png` w199 at (64,1128) |
| Figure | h930 at (500,302), feet y1232, lift 1.08/1.02 |
| Foot | h118, top hair, `#FFFFFF`; headshot 56 round (3px white ring, 1px `#D8D3C6` outline); name sans 600 24 `#16181A`; title sans 400 20 `#7C8187`; right mono 600 22 ls .08em `#0A7A58` `SWIPE →` |

## Parameters — BODY SHELL (p02–p06)

Flex column, padding 56px 72px 130px, ground = the 170deg gradient.

| Element | Values |
|---|---|
| Top strip | mono 600 20 ls .18em `#7C8187` right-aligned — `CORPORATE DEVELOPMENT`; bottom hair 1px `#E4DFD3`, pad-b 22 |
| Kicker | 10px green square + mono 600 26 ls .14em `#0A7A58`, mt 56 |
| Headline | serif 550 64/1.06 ls −.012em `#16181A`, mt 26, max-w 920; green `em` turns; `X` in smbXCorpDev always `#0A7A58` |
| Rule | 84×6 `#0A7A58`, `flex:0 0 6px`, mt 34 |
| Lede | sans 400 40/1.3 `#4A4F54`, mt 40, max-w 900 |
| Dash list | mt 44, gap 26; dash 26×6 `#0A7A58` mt 19; text sans 400 40/1.3 `#4A4F54`, bold lead 600 `#16181A`, max-w 900 |
| Numbered list | gap 21 (p03) / 24 (p04); chip 44×44 `#DFF5EC`, mono 600 26/44 `#0A7A58`; text as dash list, max-w 920; numbering continues 1–5 → 6–7 |
| Table (p05) | max-w 936; header mono 600 20 ls .14em `#7C8187`, 3px `#0A7A58` rule; rows sans 400 40 `#16181A`, rate + min-fee row 600, pad 20/0, hair `#E4DFD3` |
| Note | mt auto (pad-t 28), mono 400 22/1.55 `#7C8187`, max-w 860 |
| Ghost numeral | serif 550 300/1 ls −.02em `#E4DFD3`, right 56 / bottom 118, z0 — `02…06` by page |
| Foot | h90, top hair, `#FFFFFF`; `logo-green-x.png` h24 left; mono 600 22 ls .08em `#0A7A58` `N / M` right |

## Parameters — CLOSER (FRAME C light, last page)

| Element | Values |
|---|---|
| Canvas | flex row gap 52, padding 64px 64px 56px, gradient ground |
| Left col | w540: kicker (as body, mt 12) `FOR THE ACQUIRER` · payoff serif 550 64/1.06 `#16181A` mt 30 · plates mt 40 gap 18 · para sans 400 40/1.32 `#4A4F54` mt 36 · action bar mt 36 · proof mono 400 22/1.5 `#7C8187` mt 26 · logo w199 mt auto |
| Plate (Core) | 1.5px `#0A7A58` border, `#FFFFFF`; title sans 600 32 `#16181A`; desc sans 400 24/1.35 `#4A4F54` mt 6; pad 24/26 |
| Plate (Premium, fuller) | `#0A7A58` fill; tag mono 600 20 ls .12em `#A8F0CE` `THE PART MOST ADVISORS SKIP`; title white (X `#A8F0CE`); desc `#DFF5EC` |
| Action bar | h84 `#0A7A58`, pad 0 30; label mono 600 26 ls .1em `#FFFFFF` flush LEFT — `BOOK A CALL — SMBX.AI`; trailing `→` right |
| Portrait | φ-rect 380×616 (1200×1944 = 1:1.620, whole photo), mt 216 mr 16; 14px `#0A7A58` offset plate at +14,+14; 1px `#16181A` border; 12px `#16181A` corner handles at −6 offsets |
| Byline | under frame mt 34: name sans 600 26 `#16181A`; title sans 400 22 `#7C8187` |
| Page number | mono 600 22 ls .08em `#7C8187`, absolute right 64 / bottom 56 |

## Assets

`assets/founder-standing.png` (1150×3560, as shipped), `founder-portrait.jpg`
(the only headshot), `logo-green-x{,-dark}.png`, fonts: Source Serif 4 variable
(wght-only), Schibsted Grotesk 400/600, IBM Plex Mono 400/600.

## Acceptance

Every hex a CARTA token; bookends and only bookends plated; every page legible
at 360px wide (nothing under 20px); copy verbatim with the four flagged
departures and no others; both documents reproduce pixel-for-pixel at 1080×1350
before parameterisation; output rasterised at 2×. No fee talk outside the
pricing document's schedule/terms pages.
