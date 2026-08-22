# STYLE.md — smbX collateral style, OXBLOOD

**Written 2026-08-22 from the built files in this folder.** `CLAUDE.md` is the
per-page parameter dump — use it to reproduce *these* pages. This file is the
reusable system — use it to build *new* pages in the same style.

Where this file and `DESIGN_LANGUAGE.md` disagree, the design language wins and
this file is a bug. Where this file and the HTML disagree, the HTML wins.

**Fonts are already in your environment.** Instrument Serif 400 + italic, Plus
Jakarta Sans 400/500/600/700, IBM Plex Mono 400/500. No font files ship here; the
reference pages load them from Google Fonts. Swap for the repo's local mechanism.

---

## 1. The two grounds, and the rule that limits them

| Ground | Value | Where |
|---|---|---|
| bone | `#FCFAF6` | every body page, the cover's copy column, all foots |
| field (oxblood) | `#8A2B32` | the cover's panel, the closer page |

**Two oxblood surfaces per document. Never three, never two adjacent.** In these
documents that is the cover's right panel and the closer page. Everything between
is flat bone. There is **no black band** — the dark surface is oxblood.

Grounds are **flat**. No gradient anywhere, on any ground, ever.

---

## 2. Depth — the ramp, not a second colour

Every oxblood surface is the same material under different light. Do not
introduce a new hue to signal depth; move along the ramp.

| Step | Value | Reads as | Carries |
|---|---|---|---|
| well | `#50191D` | recessed | dense text, fine print, **the accent**, big stats |
| shade | `#6C2227` | subtle recess | alternating rows, quiet panels |
| **field** | `#8A2B32` | the ground | anything |
| plate | `#964046` | subtle lift | chips, emphasised cards — content only |
| rim | `#AF6F74` | **an edge, never a fill** | 1px outlines on plates and photos |
| border | `#C08D90` | ghost outline | unfilled button/plate outlines |

**Three laws, and the measured reason for each.**

1. **Lift comes from an edge, not a fill.** A 1px `#AF6F74` rim on a `#964046`
   plate reads raised and costs the text nothing. Raising the *fill* to the rim
   value drops the `sub` tier to 2.89:1 — under AA.
2. **The recessed well is the most legible surface.** It carries all four text
   tiers; the field carries three; a plate carries two. Dense reading belongs in
   the well.
3. **The accent lives at field level and below.** `#FF7D55` is 5.55:1 on the well,
   3.36:1 on the field, **2.67:1 on a plate** — failing even the display
   threshold. A raised surface carries content, never the accent.

Practical consequence you will hit immediately: on a raised plate, a brand mark or
emphasis that would be accent elsewhere must be `#FFF3F0` instead. Two plates on
the same page can therefore carry differently-coloured marks. That is correct.

### Text on the field

| Tier | Value | On well | On field | On plate |
|---|---|---|---|---|
| ink | `#FFF3F0` | 12.91:1 | 7.82:1 | 6.20:1 |
| sub | `#F0D8D4` | 10.33:1 | 6.26:1 | 4.96:1 |
| muted | `#DCB8B4` | 7.72:1 | 4.68:1 | 3.71:1 |
| legal | `#D6B2AF` | 5.77:1 | 4.39:1 | 3.48:1 |

Never grey on the field — grey goes dirty on red. Accent on the field is
`#FF7D55` at **display sizes only** (≥24px regular, ≥18.7px bold); for small text
on the field use `#FFAA90`.

### Light surfaces

| Token | Value | Use |
|---|---|---|
| ground | `#FCFAF6` | the page |
| panel | `#F3EFE9` | recess, quiet grouping |
| rule | `#E3DDD4` | hairlines — never a fill |
| ink | `#1A1A1A` | headlines, table values, primary button fill |
| body | `#57534E` | running text |
| muted | `#76726B` | labels, captions, page numbers |
| accent | `#B8431E` | turns, rules, marks, stat values, links |
| accent hover | `#9C3717` | hover, and chip text on tint |
| accent tint | `#FBE7DF` | chip fill under `#9C3717` text |

---

## 3. Type

| Role | Face | Where |
|---|---|---|
| Display | **Instrument Serif 400**, italic for turns | headlines, payoffs, numerals, stat values |
| Working | **Plus Jakarta Sans** 400/500/600/700 | all reading copy, plate titles, bylines |
| Data & labels | **IBM Plex Mono** 400/500 | running headers, notes, stat labels, page numbers, action bars |

Sizes as built on a 1080-wide canvas:

| Element | Size |
|---|---|
| body-page headline | 78 / 1.03, ls −.004em |
| cover hook · closer payoff | 72 / 1.04 |
| reading copy | 40 / 1.3 |
| cover lede | 36 / 1.34 |
| plate title | 32 (600) |
| stat value · cover numeral | 46 · 144 |
| mono: running header, notes | 22 |
| mono: stat labels, plate tags | 20 |
| action-bar label | 24 (600), ls .08em |

**Floor: 20px on these 1080-wide carousel pages.** Judge at 360px wide. The
design language's global floor is 13px — that applies to screen UI and to the
single-card figure-card format, not here.

Emphasis in a display line is **italic accent**, not a colour swap on roman.
`text-wrap: pretty` on every headline and paragraph. Tabular figures in tables and
stat rows.

**No decorative eyebrows.** Do not add a mono kicker above a title. Lead with the
title. A label earns its place only when it carries something the reader cannot
infer — a running header naming the section does; `CORPORATE DEVELOPMENT` on every
page does not.

---

## 4. The φ grid

The golden section sets the column split. **Which side gets the major share
depends on what the format asks of the copy**, and that is the whole rule:

| Format | Canvas | Seam | Major share |
|---|---|---|---|
| Portrait cover | 1080×1350 | **667** = 1080/φ | copy (0–667); field is the minor 413 |
| Landscape cover | 1200×630 | **458** = 1200 − 1200/φ | field (458–1200); copy is the minor 458 |

Portrait vertical rhythm: logo 56 (bottom edge 106), hook 168, lede **471 =
1232/φ²**, stats 800. Content height is 1232 — the foot bar owns the last 118.

**One cross-column grid line per cover.** On the portrait cover the well's top
edge is 106 — the logo's baseline continued straight across the seam. If either
moves, move both.

Body pages are a flex column at `padding: 52px 72px 130px` on flat bone, with the
foot bar absolutely placed at the bottom. Measure caps at 900–930.

---

## 5. Marks and shape

- **Radius 0 everywhere.** The only exception in this family is the closer's
  action bar at 6px, because it is a button.
- **Hairlines 1px:** `#E3DDD4` on light, `#AF6F74` on the field. Never a fill.
- **The accent rule:** 84×4 under a display headline; 56×4 inside a well under a
  numeral. Not 6px — the old system's heavier rule is retired.
- **Corner handles:** ink squares at a negative offset on **two opposite corners**
  (top-left and bottom-right), once per page, on the thing that matters. The
  design language specifies 8px at −4px; on a 1080-wide artboard that is
  optically invisible, so this family uses **16px at −8px** — the ratio (offset =
  half the square) preserved, the size scaled. Do not propagate the scaled figure
  to interface work.
- **Offset plates** sit at +18,+18 behind a photo, in the **well** value, reading
  as recession rather than a shadow. The plate and the corner handle deliberately
  overhang the page margin; that is what those gestures are. Do not "fix" them.
- **The brand mark in running type:** the names are lower-case `smbx`, so the
  capital-X mark is gone. Preserve it as the lower-case `x` set in the accent —
  `smb` + accent `x` + ` Dev`. On a raised plate that `x` becomes `#FFF3F0` (law 3).
- **No** drop shadow, gradient, glow, texture, rounded card, or curve. No circle,
  no ellipse, no `border-radius: 50%` headshot — photographs are square-cropped.
- **No emoji. No stock photography. No SVG-drawn illustration.**

---

## 6. Page kinds, as built

**Cover (photograph panel).** Bone copy column on the major φ share: logo
top-left, hook, lede, stat rows whose hairlines run flush to the seam. The field
panel on the other share is filled **edge to edge by a photograph**, with a
**recessed well carrying the headline stat placed at the foot of the panel** —
the photograph owns the top, the well anchors the bottom. Foot bar: square
headshot, name, role, mono accent CTA.

Two things this treatment costs you, both accepted:

- The cover's entire oxblood share becomes photography, so **the well is the only
  field colour left on the page.** The document's two-oxblood-surface rule still
  holds because the closer is a full field page — but the cover reads
  photography-led, not field-led.
- No exposure filter on a panel photograph. The 1.08/1.02 brightness-contrast lift
  belonged to the cut-out figure against flat oxblood and is wrong here.

Layer order is panel (flat field, as fallback ground) → photograph z1 → well z2 →
numeral and label z3. Crop with background-size + background-position on a div,
not object-fit, so the zoom is explicit and reproducible.

**Match the SPLIT to the photograph's aspect, not the other way round.** This is
the rule that governs the treatment:

- A **standing** shot (tall source) takes a **vertical** split — a side panel,
  photograph cropped head-to-thigh, well at the foot of the panel.
- A **wide** shot (2:1 or wider) takes a **horizontal** split — the photograph runs
  the full card width as a band, with a field band beneath carrying the copy. A
  side panel would discard half the width, which is the only reason the wide shot
  was worth using.

Decide the split from the source aspect before you place anything. Forcing a wide
photograph into a tall slot is the most expensive mistake available here — it looks
like a crop and reads like a mistake.

**Keep the stat off the subject.** Whether it lives in a well or straight on a
field band, the stat block goes where the photograph is empty. On a short band
(under ~220px) drop the well and set the stat on the field directly — a recess
inside a shallow band leaves no padding and the band is already the darkest
surface on the card.

*Retired:* the cut-out figure on a flat field panel. Cut-outs now appear only on
the single-card figure-card format.

**Body page (bone).** Running header (section name, flush left, mono, nowrap) over
a hairline. Display headline. 84×4 accent rule. Lede. Then one of:
*dash list* (26×4 accent dash + 40px copy, bold lead in ink), *numbered list*
(44×44 tint chip, mono accent-hover numeral), or *table* (mono header over a 2px
accent rule, 40px tabular rows on hairlines). Mono note pinned to the bottom by
`margin-top:auto`. Foot bar: logo left, `N / M` right.

**Closer (field page).** Two fixed flex tracks — never `flex:1`, which cannot
shrink below its children's min-content and will silently break the right margin.
Left: display payoff, an outlined `#C08D90` plate and a raised `#964046`+rim
plate, a 40px para, the action bar, a mono proof line, the bone logo. Right: a
φ-rect photograph (1:1.618) with an offset well plate, a rim border, and two
corner handles; byline beneath. Page number bottom-right on the same margin as the
photograph.

### The button law
**The accent is never a resting button fill.** Primary is **ink on light** and
**bone on the field**. The accent appears on hover, in chips, in marks, in links.
An accent-filled button has been tried in two prior systems and reads as a
warning both times.

---

## 7. Naming and copy laws that bind the design

- **smbx Dev** (was smbXCorpDev) · **smbx Dev Pro** (was Premium). **smbx Coach**
  and **smbx Crew** are decided but carry **no figures** — do not put them in
  collateral until their numbers are set, and never attach a success fee to
  either. `smbXDefinitive` is still undecided; it appears nowhere in this family.
- **The retainer is `$15,000 a quarter, paid up front`** — never "$5,000 a month".
  Same money; the quarter is the deliberate billing unit. The monthly wording
  shipped once and was reversed the same hour.
- **No public pricing.** No figure from the fee schedule reaches a public surface.
  The no-pricing document is the postable one; the with-pricing document is
  email-gated.
- **Track record:** always "led or co-led", always "selected transactions", and
  the attribution travels **wherever the deal figure appears** — not as a
  footnote. This is why the cover stat label reads `ACQUISITIONS LED OR CO-LED`.
- **Describe the work, never a competitor.** Every differentiator is a fact about
  us. No grievance copy.
- **Section labels are real headers**, not mono eyebrow micro-text.

---

## 8. Drift checklist — stop if any is true

1. A green, teal, blue, amber, gold or brass value appears anywhere.
2. Your warm colour is yellow-warm rather than red-warm (amber sits at hue
   ~39–42°; the accent is 14°, the field 356°).
3. There is a black band, or a third oxblood page, or two adjacent.
4. A gradient, glow, shadow, texture, or curve.
5. A rounded corner on anything but a button.
6. The accent fills a resting button, or sits on a raised plate.
7. A caption or label under 20px on a 1080-wide page.
8. A mono kicker sits above a headline.
9. A headshot is round.
10. You named Fraunces, Newsreader, Source Serif 4 or Schibsted Grotesk.
11. A fee figure appears on a public surface.
12. `smbXCorpDev` or `Premium` appears anywhere.

---

## 9. Rebuild targets

`scripts/studio/build-deck.mts`, one spec per document. Page kinds map to §6:
`cover-field-panel` · `body` · `body-numbered` · `body-table` · `closer-field`.

⚠️ **The pricing brochure's spec slug is `smbx-corpdev-offering-pricing` but the
route serves `smbx-corpdev-pricing.pdf`.** A naive rebuild lands a new file
*beside* the live one and every lead keeps receiving the old brochure, silently.
Build with an explicit `--slug smbx-corpdev-pricing`, then confirm the file at
`content/collateral/smbx-corpdev-pricing.pdf` actually changed size or mtime.

Raster at 2× before PDF or posting.
