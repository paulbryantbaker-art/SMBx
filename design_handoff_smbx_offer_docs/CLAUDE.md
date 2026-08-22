# CLAUDE.md — offer documents handoff (OXBLOOD, 2026-08-22)

**Names are current as of `uploads/OFFER_REFERENCE.md`, 2026-08-22:**
`smbXCorpDev` → **smbx Dev**, `Premium` → **smbx Dev Pro**. Two further lines
(**smbx Coach**, **smbx Crew**) are decided but carry **no figures yet** — do not
add them to any collateral until their numbers are set. `smbXDefinitive` is still
undecided (camel-case or `smbx Definitive`) and appears nowhere in this family.

**The X gesture, under the new names.** The names are lower-case `smbx`, so the
capital-X mark is gone from the wordmark. It is preserved as **the lower-case
`x` set in the accent** — `smb` + `<span class="x">x</span>` + ` Dev` — which keeps
the logo's mark alive in running type without altering the decided name. On the
closer's **raised** Dev Pro plate the `x` is `#FFF3F0`, not accent: §3.4.3 bars the
accent from a raised surface (`#FF7D55` on `#964046` is 2.67:1). The two plates
therefore carry differently-coloured `x` marks **on purpose**.

**RULE ZERO: transcription, not interpretation.** Extract values from the 13
reference HTML files; never eyeball, never round, never improve. When this file
and the HTML disagree, the HTML wins and this file is a bug — say so.

**The fonts are already in your environment.** Instrument Serif 400 (+ italic),
Plus Jakarta Sans 400/500/600/700, IBM Plex Mono 400/500. No font files ship with
this handoff and the reference pages load them from Google Fonts — swap that for
whatever local mechanism the repo uses. Do not re-embed TTFs.

## What this is

The two smbx Dev offer documents rebuilt on **OXBLOOD** (`DESIGN_LANGUAGE.md`,
2026-08-22), replacing the CARTA / Deal Green versions dated 2026-08-19:

- **`offer-nopricing-p01..p05.html`** — 5 pages: cover · problem · engagement ·
  Premium · closer.
- **`offer-pricing-p01..p07.html`** — 7 pages: cover · problem · engagement ·
  Premium · schedule (table) · terms · closer.
- **`featured/cover-2a-portal.html`** — the landscape LinkedIn Featured cover,
  1200×630. Filename kept for continuity; **the portal it was named for is gone.**

All pages 1080 × 1350 exact, no JS. Pages p01–p04 are byte-identical between the
two documents except the foot page number (`N / 5` vs `N / 7`). The closers differ
only in the para (no-pricing drops "at a price you already know") and page number.

## Target

`scripts/studio/build-deck.mts` — one spec per document. Suggested page kinds:
`cover-field-panel` · `body` (dash list) · `body-numbered` · `body-table` ·
`closer-field`. The with-pricing document is the published offering PDF (site
download); the no-pricing one is postable.

## Laws that bind this family

- Every hex resolves to `DESIGN_LANGUAGE.md` §3 — map in `TOKENS-USED.md`. No
  green, mint, amber, teal, blue or near-black anywhere. **There is no black band.**
- **Two oxblood surfaces per document and no more:** the cover's right field panel
  and the closer page. Every page between is flat bone `#FCFAF6`.
- **The depth ramp does the work on the field, not a second colour.** Every oxblood
  surface is the same material under different light: well `#50191D` recessed,
  field `#8A2B32`, plate `#964046` raised by an `#AF6F74` rim. Dense content and
  the accent go in the **well** (§3.4.2–3); a raised plate carries content and
  never the accent. Both covers put the stat block in a well; the closer shows
  plate-by-rim and well together.
- **No gradients.** The old sanctioned 170° bone→panel gradient is retired; grounds
  are flat.
- **Radius 0** except the closer action bar (6px). Headshots are square.
- **THE BUTTON LAW:** the accent never fills a resting button. The action bar is
  bone `#FCFAF6` on the field with an `#1A1A1A` flush-left label.
- **The accent never sits on a raised surface** (§3.4.3) — see the Premium plate.
- **No decorative eyebrows** (§4). The running header carries the section name
  flush left and nothing else; page numbers live in the foot only.
- **Corner handles:** two opposite corners, 16px at −8px. §5's 8px/−4px is an
  interface figure; the ratio is preserved for a 1080-wide canvas. This is the one
  deliberate numeric deviation in the family — do not propagate it to UI.
- Exposure lift renderer-side only: `brightness(1.08) contrast(1.02)` on the
  standing figure. `founder-standing-nophone.png` as shipped — never regenerate.
- **Logo placement is per format, not global.** Portrait cover: top-left on bone at
  (64,56), 199px, accent mark. Landscape featured: top-left **on the photograph**,
  (48,44), 240px, accent mark. Body and closer pages: lower-left / foot, 199px and
  24px, bone mark on the field. The old "always lower-left at φ²" rule is dead.
- **The mark is the only type allowed over a photograph.** Small, ink, in a corner
  the subject does not occupy. Never the hook, never the stat.
- **Type floor:** reading 40px, headlines 78, mono labels 20, nothing under 20px.
  Judge at 360px wide.
- Copy VERBATIM from the offering PDF — departures listed in
  `TOKENS-USED.md § Copy departures`, and no others.
- **The retainer is `$15,000 a quarter, paid up front`** — never "$5,000 a month".
  The two are the same money; the *quarter* is the deliberate billing unit,
  because it commits three months where a month lets a client leave after thirty.
  The monthly wording shipped once and was reversed the same hour. Do not redo it.
- **No figure for smbx Coach or smbx Crew exists.** Never invent one, and never
  attach a success fee to either.
- Rasterise at 2× before PDF/post.

## Parameters — COVER (p01, both docs)

| Element | Values |
|---|---|
| Canvas | 1080×1350 `#FCFAF6` |
| **Grid** | **1080 / φ = 667.** The panel seam is that line: copy column is the major share (0–667), field the minor (667–1080). Copy measure 539 (64 padding both sides). Vertical: logo at 56 (bottom edge 106), hook at 168, lede at **1232/φ² = 471**, stats at 800. The well now sits at the panel's foot (896), so the logo-baseline grid line that once ran across the seam no longer applies — the photograph occupies that band. |
| Field panel | 667,0 → 413×1232 `#8A2B32`. Kept as the fallback ground **under** the photograph; nothing of it shows in the shipped page. |
| **Photograph** | 667,0 → 413×1232, `founder-suit.jpg`, `background-size:1001px auto; background-position:-179px -39px`, **z1** — fills the panel edge to edge, cropped head to thigh. **No filter:** the 1.08/1.02 lift belonged to the cut-out against flat oxblood and washes out a photograph. |
| Logo | `logo-accent-x.png` w199 at **(64,56)** — top-left, on bone, above the headline. Ink wordmark, accent X. Moved 2026-08-22 (briefly top-right on the field; Paul moved it left the same day) |
| **Well** | 699,**896** → 349×304 `#50191D`, **z2** — at the **foot** of the panel, because the photograph owns the top. Recessed, not sitting on the field; no border, since recession is the darker fill (§3.4.1 — an edge means lift). 32px right margin. |
| Numeral | `150` Instrument Serif 400 144/0.86 `#FFF3F0` at (731,**928**), in the well, z2 |
| Stat bar | 56×4 `#FF7D55` at (735,**1082**), in the well — **5.55:1 here vs 3.36:1 on the field**, which is why the accent belongs in the well (§3.4.3) |
| Field label | mono 500 20/1.5 ls .1em `#DCB8B4` w285 at (735,**1108**), **hard-broken** `ACQUISITIONS` / `LED OR CO-LED` |
| Hook | Instrument Serif 400 72/1.04 ls −.004em `#1A1A1A` w539 at (64,168), 3 lines; turn `We make it easier.` **italic** `#B8431E` |
| Lede | Plus Jakarta Sans 400 36/1.34 `#57534E` w539 at (64,471) |
| Stats | at (64,800) w603 — rules run flush to the panel seam at x667, so every label now fits one line; rows top-hair `#E3DDD4` (last also bottom), pad 20/18; value Instrument Serif 400 46 `#B8431E` min-w120 tabular; label mono 500 20/1.3 ls .08em `#76726B` — `$5B+ / ≈$21B / 0` |
| ~~Figure~~ | **Retired.** The cut-out `founder-standing.png` layer is gone from this page; the photograph replaced it. Do not reinstate a `.fig` rule here. |
| Foot | h118, top hair `#E3DDD4`, `#FCFAF6`; headshot 56 **square**, 1px `#E3DDD4`, object-position 50% 18%; name PJS 600 24 `#1A1A1A`; title PJS 400 20 `#76726B`; right mono 500 22 ls .08em `#B8431E` `SWIPE →` |

## Parameters — BODY SHELL (p02–p06)

Flex column, padding 52px 72px 130px, flat `#FCFAF6` ground. No ghost numeral.

| Element | Values |
|---|---|
| Running header | mono 500 22 ls .13em `#1A1A1A`, flush LEFT, nowrap, section name only (`THE PROBLEM` · `THE ENGAGEMENT` · `THE UPGRADE` · `THE SCHEDULE` · `THE TERMS`); bottom hair 1px `#E3DDD4`, pad-b 22 |
| Headline | Instrument Serif 400 78/1.03 ls −.004em `#1A1A1A`, mt 62, max-w 930, `text-wrap:pretty`; italic `#B8431E` turns; the `x` in `smbx Dev` / `smbx Dev Pro` always `#B8431E` on light |
| Rule | 84×4 `#B8431E`, `flex:0 0 4px`, mt 34 |
| Lede | PJS 400 40/1.3 `#57534E`, mt 38, max-w 900 |
| Dash list | mt 46, gap 26; dash 26×4 `#B8431E` mt 20; text PJS 400 40/1.3 `#57534E`, bold lead 600 `#1A1A1A`, max-w 900 |
| Numbered list | gap 21 (p03) / 24 (p04); chip 44×44 `#FBE7DF`, mono 500 26/44 `#9C3717`; text as dash list, max-w 920; numbering continues 1–5 → 6–7 |
| Table (p05) | max-w 936; header mono 500 22 ls .13em `#76726B`, 2px `#B8431E` rule; rows PJS 400 40 `#1A1A1A` tabular, rate + min-fee row 600, pad 20/0, hair `#E3DDD4` |
| Note | mt auto (pad-t 28), mono 400 22/1.55 `#76726B`, max-w 860 |
| Foot | h90, top hair `#E3DDD4`, `#FCFAF6`; `logo-accent-x.png` h24 left; mono 500 22 ls .1em `#76726B` `N / M` right |

## Parameters — CLOSER (field page, last page)

| Element | Values |
|---|---|
| Canvas | 1080×1350 `#8A2B32`; flex row gap 52, padding 64px 64px 56px → content box 64–1016 (952 wide) |
| **Track widths** | `.colL` **flex 0 0 520**, gap 52, `.colR` **flex 0 0 380**. 520 + 52 + 380 = 952 exactly. Both tracks are fixed on purpose: `.colR` was `flex:1` and could not shrink below its children's min-content, so it rendered 410 wide and pushed the portrait 50px past the margin onto a different right edge than the page number. Do not restore `flex:1`, and do not put a `margin-right` back on `.frame` or `.by` — those margins were what set the 410 floor. |
| Left col | w520: payoff Instrument Serif 400 72/1.04 `#FFF3F0` mt 8 · plates mt 42 gap 18 · para PJS 400 40/1.32 `#F0D8D4` mt 36 · action bar mt 36 · proof mono 400 22/1.5 `#DCB8B4` mt 26 · `logo-bone-x.png` w199 mt auto |
| Plate (Core) | 1px `#C08D90` outline, **no fill** (field level); title PJS 600 32 `#FFF3F0`, X `#FF7D55`; desc PJS 400 24/1.35 `#F0D8D4` mt 6; pad 24/26 |
| Plate (Dev Pro, fuller) | `#964046` fill + 1px `#AF6F74` rim (raised); tag mono 500 20 ls .12em `#FFF3F0` `THE PART MOST ADVISORS SKIP`; title `#FFF3F0`, **`x` also `#FFF3F0`** — the accent is barred from a raised surface; desc `#F0D8D4` |
| Action bar | h84 `#FCFAF6`, radius 6px, pad 0 30; label mono 600 24 ls .08em `#1A1A1A` flush LEFT nowrap — `BOOK A CALL — SMBX.AI`; trailing `→` right |
| Portrait | `founder-headshot.jpg`, φ-rect 380×616, `object-fit:cover; object-position:50% 20%` (source 1536×2732 — only 60px of vertical crop at this scale, so the position barely moves it; 20% keeps the headroom), mt 222, no side margin — **right edge lands on 1016, the same margin the page number uses**; 18px `#50191D` offset plate at +18,+18 (recession behind the photo); 1px `#AF6F74` border; **16px `#1A1A1A` handles at −8, top-left and bottom-right only** |
| Margin overhang (intended) | The offset plate reaches x1034 and the bottom-right handle x1024 — both outside the 1016 margin. That is what an offset plate and a −8 handle *are*; the photo is the content and the photo aligns. 46px of trim clearance at 2× raster. Don't "fix" these two. |
| Byline | under frame mt 34, w380: name PJS 600 26 `#FFF3F0`; title PJS 400 22 `#DCB8B4` |
| Page number | mono 500 22 ls .1em `#DCB8B4` nowrap, absolute right 64 / bottom 56 |

## Parameters — FEATURED COVER (landscape)

Replaces page 1 of the landscape LinkedIn-Featured build
(`smbx-corpdev-offering-featured.pdf`, 1200×630/page). Landscape body pages of
that build are unchanged and still carry the old system — **they need this same
pass.**

| Element | Values |
|---|---|
| Canvas | 1200×630 `#FCFAF6` (Featured crop ≈1.91:1 — full-bleed safe) |
| Photograph | `founder-plane.jpg`, the wide seated shot — **not** the standing cut-out |
| **Split** | **Horizontal, not vertical — and this is forced by the source.** `founder-plane.jpg` is 3168×1344 (**2.36:1**); a 742×630 side panel is 1.18:1, so filling one discarded half the image's width, which was the only reason the wide shot was worth using. There is no side panel and no φ seam on this surface. |
| **Photograph** | 0,0 → **1200×430**, full card width, `background-size:1200px auto; background-position:0 0`, z1. Scale 0.3788 — the **whole** width of the source shows; the crop is vertical only, keeping the top 1135px of 1344. |
| Logo | `logo-accent-x.png` **w240 at (48,44) — on the photograph**, z3. Ink wordmark; the cabin wall behind it is light enough to carry it. Mirrors the portrait cover's top-left mark and leaves the band to the hook and the stat. |
| Field band | 0,430 → 1200×200 `#8A2B32`, z2. This is the card's field share — a photograph is not a field surface. |
| **Band layout** | **A flex row, not absolute offsets:** `padding:0 48px; display:flex; align-items:center; justify-content:center; gap:76px`. The hook and the stat centre as a group — measured 218px clear either side. Deliberate: the hook breaks where Instrument Serif's metrics put it, so hand-computed centring drifts. Do not convert this band to absolute positions. |
| Hook | Instrument Serif 400 40/1.12 `#FFF3F0`, `max-width:560px`, italic turn `#FF7D55` (40px clears the display threshold) |
| Stat | `flex:0 0 auto`; numeral Instrument Serif 400 76/0.88 `#FFF3F0`; bar 40×4 `#FF7D55` `margin-top:20`; label mono 500 14/1.45 ls .1em `#DCB8B4` `margin-top:14`, nowrap, **hard-broken** `ACQUISITIONS` / `LED OR CO-LED` |
| **No well here** | At 200px tall a recess inside the band leaves no padding, and the band is already the darkest surface on the card. The stat sits straight on the field. The 150 is also deliberately **off the photograph** — over it, the card obscured the subject. |
| ~~Figure, lede~~ | **Both gone.** The cut-out is retired; the lede does not fit a 200px band. To restore the lede, band → 240 and photograph → 390 (still full width, 119px more vertical crop). |

Raster at 2× (2400×1260) to match the existing featured PDF pages.

## Assets

- `founder-standing.png` (1150×3560) — the cut-out. **Retired from covers**
  2026-08-22 when the photograph treatment was adopted; still used by the figure
  cards. The phone stays: Paul reversed the retouch because the clone-fill shows at
  a close crop. Do not retouch, do not regenerate.
- `founder-standing-nophone.png` — **not shipped in this package.** The retouched
  cut-out; its clone-fill is visible at every crop now in use. Recorded here only so
  nobody retouches that photograph again.
- `founder-plane.jpg` (3168×1344) — the wide/seated shot, for landscape surfaces:
  the featured cover, banners, and any page-width band. Untouched original.
- `founder-headshot.jpg` (1536×2732) — **the closer/CTA portrait**, added
  2026-08-22. Chest-up, three-piece grey suit, city window behind. Its maroon tie
  reads as a near-neighbour of the field `#8A2B32`, which is why it sits well on the
  closer — don't recolour it.
- `founder-portrait.jpg` — **now only the 56px foot headshot on the cover.** Still
  the old shot; superseded on the closer.
- `founder-suit.jpg` (1536×2732) — the suit shot, **retouched 2026-08-22: a tower
  spire behind his head was painted out** (band x742–794, y0–178, per-row
  interpolation from clean sky either side, guarded so it cannot touch skin; the
  rim-light halo along the scalp apex was levelled in a second pass). If this photo
  is ever re-exported from the source, the retouch must be redone — the spire is in
  the original. **No matted/alpha version exists.** The background is a glazed wall
  over a cityscape; no colour key separates a charcoal suit from dark buildings
  behind glass, so a cut-out needs hand matting.
- `logo-accent-x.png` — ink wordmark, `#B8431E` X. For light grounds.
- `logo-bone-x.png` — bone wordmark, `#FF7D55` X. For the field.
  Both derived pixel-wise from `logo-green-x.png` (green channel → accent, ink →
  ink/bone). If a real OXBLOOD mark exists in brand, prefer it and delete these.
- No fonts. See the note at the top.

## Acceptance

Every hex an OXBLOOD token; exactly two oxblood surfaces per document; no
gradient, no curve, no rounded corner outside the action bar; the accent nowhere
near a resting button fill or a raised surface; every page legible at 360px wide
(nothing under 20px); copy verbatim with the five flagged departures and no
others; both documents reproduce pixel-for-pixel at 1080×1350 before
parameterisation; output rasterised at 2×. No fee talk outside the pricing
document's schedule/terms pages.

## Still on the old system — not in this handoff

- The landscape featured build's **body pages** (`smbx-corpdev-offering-featured.pdf`).
- `figure-card/2b-stepped-portal-{light,dark}.html` — the portal is retired, so
  these have no OXBLOOD equivalent by design.
- `figure-card/2a-green-monolith-{light,dark}.html` — superseded by
  `2a-oxblood-monolith-*`, kept unreferenced.
