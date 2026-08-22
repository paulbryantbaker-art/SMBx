# TOKENS-USED — offer documents, OXBLOOD (2026-08-22)

Two documents at 1080×1350/page: `offer-nopricing-p01..p05` (5pp) and `offer-pricing-p01..p07` (7pp),
plus the landscape `featured/cover-2a-portal.html` (1200×630).

Supersedes the CARTA / Deal Green map dated 2026-08-19. **Every green, mint and near-black hex in the
previous map is now a dead-system value** (`DESIGN_LANGUAGE.md` §2) and appears nowhere in these files.
Every hex below resolves to §3 of `DESIGN_LANGUAGE.md`.

## Light surfaces

| Hex | Token | Where |
|---|---|---|
| #FCFAF6 | ground (bone) | cover canvas + copy column, body-page ground, foots, closer action-bar fill |
| #FFFFFF | card | unused in this family — no white cards survive the flat-ground change |
| #E3DDD4 | rule | all hairlines: header seam, stat rows, table rows, foot tops, headshot edge |
| #1A1A1A | ink | headlines, bold leads, table values, running header, corner handles, action-bar label |
| #57534E | body | ledes, running copy, plate descriptions |
| #76726B | muted | notes, stat labels, foot page numbers, byline titles |
| #B8431E | accent | `em` turns, the 84×4 rule, dash marks, cover stat values, the X, table header rule, SWIPE |
| #9C3717 | accent hover | numbered-chip text on tint |
| #FBE7DF | accent tint | numbered-list chip fill |

## The field and its ramp

| Hex | Token | Where |
|---|---|---|
| #8A2B32 | FIELD | cover right panel, closer canvas |
| #50191D | well | **cover stat block (recessed)**, closer portrait offset plate |
| #964046 | plate | closer Dev Pro plate fill (raised) |
| #AF6F74 | rim | closer Dev Pro plate edge, portrait border |
| #C08D90 | border | closer Core plate outline (ghost) |
| #FFF3F0 | field ink | 150 numeral, closer payoff, plate titles, byline name |
| #F0D8D4 | field sub | closer para, plate descriptions |
| #DCB8B4 | field muted | cover stat label, closer proof line, byline title, page number |
| #FF7D55 | accent in the well / on field | cover stat bar (in the well — 5.55:1, vs 3.36:1 on the field), Core-plate X (display size only) |

## Type

| Role | Face | Used at |
|---|---|---|
| Display | Instrument Serif 400 (+ italic for turns) | headlines 78, cover hook 72, closer payoff 72, numeral 144, stat values 46 |
| Working | Plus Jakarta Sans 400/500/600/700 | reading 40, plate titles 32, lede 36, byline 24–26 |
| Data & labels | IBM Plex Mono 400/500 | running header 22, notes 22, stat labels 20, action bar 24 |

Loaded from Google Fonts — **no font files ship with this handoff**; the target environment already
carries all three families.

## What OXBLOOD changed structurally

1. **The four-step portal is retired** (Paul, 2026-08-22). The cover's right side is now one flat
   oxblood field panel carrying the 150 numeral. `#0FA97C` / `#086348` / `#DFF5EC` are gone.
2. **The depth ramp carries the field, not a second colour.** Both covers put the
   stat block in a recessed well `#50191D` rather than flat on the field: the
   accent rule reads 5.55:1 there against 3.36:1 on the field, and §3.4.2 puts
   dense content in the well by design. No border on the well — an edge would mean
   lift (§3.4.1); recession is the darker fill. The figure crosses its lower edge,
   which is what makes the depth legible.
4. **The closer is a full oxblood page.** With the cover's field panel it forms the bookend pair;
   every page between is flat bone. There is no black band and no third dark page.
4. **All gradients removed.** The sanctioned 170° bone→panel gradient is dead (§8.5); cover copy column
   and body-page ground are flat `#FCFAF6`.
5. **THE BUTTON LAW applied.** The closer action bar was an accent fill; it is now bone on the field
   with `#1A1A1A` label, 6px radius (the one sanctioned radius).
6. **Accent barred from raised surfaces** (§3.4.3). The Dev Pro plate's `x` is `#FFF3F0`, not `#FF7D55`
   — `#FF7D55` on `#964046` is 2.67:1 and fails even the display threshold. The Core plate sits at
   field level, so its `x` stays `#FF7D55`.
7. **Decorative eyebrows removed** (§4). The per-page mono kicker and the repeated
   `CORPORATE DEVELOPMENT` top strip are gone. The running header now carries the section name flush
   left; the page number lives only in the foot.
8. **Ghost numerals and the cover dot field removed** — neither is in the OXBLOOD mark vocabulary.
9. **Corner handles corrected** to two opposite corners (was four), scaled to 16px at −8px. §5
   specifies 8px at −4px for interface scale; the ratio (offset = half the square) is preserved for a
   1080-wide canvas. Flagged as the one deliberate numeric deviation in this family.
10. **Round headshots squared.** Radius 0 everywhere except the action bar.
11. **Logo re-marked.** `logo-accent-x.png` (ink wordmark, `#B8431E` X) on light;
    `logo-bone-x.png` (bone wordmark, `#FF7D55` X) on the field. Both derived pixel-wise from
    `logo-green-x.png`; the green originals are retained in `offer-docs/assets/` but unreferenced.

## Copy departures

Carried forward from the 2026-08-19 map, all still flagged:

1. The schedule page split in two (table page + terms page) to hold the 40px reading floor —
   terms-page headline is the verbatim substring "Nothing to haggle over, no surprises at close."
2. No-pricing closer drops "at a price you already know" (its referent page is absent).
3. Old amber/gold accents re-tokened — now to OXBLOOD accent, not to green.
4. "FOLLOW FOR THE NEXT READ" replaced by the action bar (offer document, not a feed post).

Round of 2026-08-22 (naming, per `uploads/OFFER_REFERENCE.md`):

6. **`smbXCorpDev` → `smbx Dev`, `Premium` → `smbx Dev Pro`** on every page. The capital X is gone
   from the names, so the mark survives as the **lower-case `x` in the accent**.
7. **p06 retainer line corrected** to `$15,000 a quarter, paid up front` from "$15,000 to start — your
   first 90 days. Then $5,000 a month, stop any time." Same money, but the quarter is the decided
   billing unit and the monthly wording was reversed once already.
8. **p06 credit line** now reads "Every retainer dollar is credited against the success fee at close",
   which is what the constants actually do.

New this round:

6. **Cover stat label now reads `ACQUISITIONS LED OR CO-LED`** (was
   `ACQUISITIONS — TWO DECADES, ONE SIDE OF THE TABLE`). §7 requires "led or co-led" wherever the
   track-record figure appears; the old label asserted 150 acquisitions without the attribution. The
   shorter label also clears the figure's head, which the long one did not.

## Type floor

Reading 40px · headlines 78 · closer payoff 72 · cover hook 72 · plate titles 32 · mono labels 20–24 ·
nothing under 20px. Judge at 360px wide.
