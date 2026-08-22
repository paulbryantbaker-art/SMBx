<!-- CARTA pass — written 2026-08-08 from CARTA_COLLATERAL_CONVERSION.md.
     Supersedes the Aurora pass of 2026-08-01, which is now in §2. -->

> **CARTA IS CANON until Paul says otherwise** (2026-08-08, his words). There is
> no interim state and no surface that is allowed to stay on the old palette
> because it is inconvenient to move. If you find one, it is a bug to report,
> not a precedent to follow.
>
> **State of the system, 2026-08-15 — ALL FOUR BUILDERS ARE ON CARTA.**
> `house/tokens.ts` exports `CARTA`, `server/services/fontEmbeds.ts` embeds
> Source Serif 4 and Schibsted Grotesk, and every builder reads all three:
>
> | Builder | Grammar | Faces | Palette guard |
> |---|---|---|---|
> | `build-deck.mts` | `house/deck.ts` — Carta | Carta | yes |
> | `build-report.mts` | `house/report.ts` — Carta | Carta | yes |
> | `build-onepager.mts` | Carta | Carta | yes |
> | `build-og-card.mts` | Carta | Carta | yes |
>
> This table is DERIVED from the source by `npm run test:design`, which fails if
> it disagrees with what the builders import, embed and guard. It exists because
> for a week the notice here read "all four builders import it" as plain prose
> while two of them opened by destructuring `LEDGER`, embedded the Ledger faces
> and ran no guard at all — and a session reading this file as canon had no
> reason to look. A claim about the code is checked against the code.
>
> **What "no Ledger at all" cost the two that moved** (Paul, 2026-08-15): amber
> and honey are gone rather than remapped — Carta has exactly one accent, so
> every kicker takes green on light and mint on the band; the boardroom texture
> is gone, because the band is now a flat colour and a texture image sits ABOVE
> the colour in a background stack and wins outright; the radial glazes are gone,
> since a wash over a flat ground just makes a slightly different flat ground
> while adding a transparency group the renderer-proof law forbids; and the pill
> rules and rounded image frames are square. `build-og-card.mts` also had its
> three typefaces HARD-CODED as string literals, so no font change could ever
> have reached it.
>
> **The app is gated, not converted.** `server/services/paletteGate.ts` blocks
> any artifact the app tries to render in a retired palette. Three of its
> renderers — the single-image card, the announcement card and the post card —
> are still Ledger and now fail rather than shipping. Those artifacts are the
> studio's; see `COLLATERAL_STATE.md`.

# The house design language — collateral

Everything smbX produces looks like one practice because every renderer reads
the same values. This file is what those values are, what they came from, and
what is retired.

**FORMATS.md is the container: which builder, which fields, what size the image
slot is. This file is the look: colour, type, layout grammar, marks.** Read
FORMATS.md to know where a thing goes. Read this to know what it looks like when
it gets there. Neither repeats the other — and the gate enforces that, because
two copies of a measurement is how one goes stale.

## Where the truth is

`house/tokens.ts` in the repo holds every colour and typeface as code, and every
builder imports it. **If this document and that file disagree, the file wins and
this document is a bug** — say so rather than working around it.

`npm run test:design` is the check on that claim. It asserts that every hex in
this file is a real token, that every token is documented here, that no retired
hex appears as live guidance, that this file does not restate FORMATS.md's slot
dimensions, and that the site-divergence note above matches what the stylesheet
actually says.

---

# 1. Paste this into anything that needs the short version

> smbX house style ("Carta") — a square, structural, print-plate editorial
> system. White paper `#FFFFFF` (canvas moved bone→white 2026-08-12,
> matching carta.com's measured ground), ink `#16181A`, white cards with a 1px ink
> border. **Exactly one accent with two surface values: `#B8431E` on light,
> `#FF7D55` on the field** — its text-safe value on the field is `#FFAA90`.
> **The one warm family here is RED-warm, never YELLOW-warm**: no amber, no
> brass, no gold, no honey. Those sit at hue 39–42°; the accent sits at 14° and
> the field at 356°. The full-bleed rhythm break is a **flat oxblood field
> `#8A2B32`** — no texture, no glaze, no halo, no gradient — carrying reading
> text `#FFF3F0`. **Radius is 0 everywhere except buttons and inputs, at
> 10px.** Framed things wear four 8px ink corner handles at −4px, outside the
> frame. **The accent is never a resting fill**: a primary is ink-on-light or
> bone-on-field, and the accent appears on hover, chips, kickers, links and the
> bar under a numeral. Display type is **Source Serif 4** at weight **550** (600
> for card titles); working type is **Schibsted Grotesk** with tabular figures;
> labels are **IBM Plex Mono** at 0.16em tracking. A cited number rendered
> enormous over an accent bar IS the graphic. Photography is real or absent.

---

# 2. DEAD — if this is in your draft, you drifted

Every one of these was a real smbX system. Every one is retired. They are listed
with their hexes because that is how you catch yourself: a hex that is not in
§4 is not ours, and most of the wrong ones are here.

| Dead system | Signature | Died |
|---|---|---|
| **Carta / Deal Green** (the system oxblood replaced) | Deal Green `#0A7A58`, hover `#086348`, chip tint `#DFF5EC`, mint `#A8F0CE`, jade `#0FA97C`, jade block `#0A6A4C` — and the entire near-black band ramp: `#181818` `#2A2E29` `#22261F` `#4A4F44` `#F4F5F1` `#D7DBD2` `#ABB2AB` `#8A9088`. **If your draft is green anywhere, this is the system you reconstructed.** | 2026-08-22 |
| **Ledger, Aurora values** (the system Carta replaced) | amber `#E8A62B`, honey `#F5C452`, the jade block `#0A6A4C`, ivory `#F2FBF6`, slate `#5A6169`, muted `#83898F`, hair `#EAE5DC`, rule `#DED8CC`. Only bone and ink survived into the current system. Deal Green, its hover, the chip tint and mint were live through Carta and died with it on 2026-08-22, so "it was in Ledger" is now weak evidence of life, not of death. The vivid highlight kept its hex and lost its job: it is no longer an ambient bloom. | 2026-08-08 |
| Ledger report trio | `#C9E8DA` `#BFE3D2` `#F1ECE0` — block sub-text, stat labels and a warm GFM table head | 2026-08-08 |
| Ledger green-black (the first Ledger pass) | Deal Green `#16624C`, hover `#0F4E3C`, boardroom band `#0F1A16`, bone `#F6F4EF`, ink `#14181C`, brass `#B08637`, mint `#8FD0AE` | 2026-07-31 |
| Coral practice site v1–v3 | `#FF385C` `#E61E4D` `#D70466`, pink/rose ambient washes | 2026-07-17 |
| Office-blue pivot (lasted one day) | `#185ABD` `#124A9E` `#9EC1FF` | 2026-07-17 |
| Terra cotta wireframe pass | `#D4714E`, clay / apricot / "warm" anything | 2026-07-10 |
| Liquid-glass product marketing | neon `#00D632`, canvas gradients, glass cards | 2026-07-11 |
| V6 slate / lavender / periwinkle | slate-blue chips, lavender surfaces | 2026-06-24 |
| Hot pink V3/V4 | `#D44A78` | 2026 spring |
| Warm-cream "Edition" era | cream editorial, serif columns | 2026 spring |

`LEDGER` is still exported from `house/tokens.ts`. That is deliberate — it is
the rollback path, and it is what lets `researchComposer.ts` (the app's retired
Studio composer) keep building. **Nothing new imports it.**

**The variable-name trap.** The website stylesheet calls the accent
`--pd-coral`, `--pd-coral-link`, `--pd-cta`. Those names are historical — the
system went coral → blue → green and the slots were reused rather than renamed.
**Never infer a colour from a variable name; read the value.**

**Why the drift happens, so you can see it coming.** This repo's history
contains all ten systems above, in committed CSS, in design bundles, in old
briefs. Anything reconstructing "the smbX look" from general familiarity rather
than from `house/tokens.ts` will surface one of them, confidently.

The tells change every pass, so learn the current ones rather than the last
ones. As of Carta they are:

- **A rounded corner.** A 12–24px card is Ledger. Carta is square.
- **Anything green.** Deal Green was the house accent for eight months and is
  now the single most likely wrong hex in a draft — recent, legitimate, and
  still sitting in old CSS all over this repo.
- **Yellow-warm rather than red-warm.** This system IS warm now, so "is it
  warm?" no longer separates right from wrong — the HUE ANGLE does. Amber,
  honey and brass sit at 39–42°; the accent sits at 14°, the field at 356°.
  If your warm reads golden rather than burnt, it is Ledger.
- **A textured or bloomed dark surface.** The field is flat. If a dark page has
  plaster, a glaze, or a glow rising from a corner, it is Ledger.
- **A black band.** There is no black band. The dark surface is oxblood.
- **An accent-filled button.** See §4. This one passes every colour check.

---

# 3. It looks like the website because it is the website's values

This is not a resemblance. It is the same numbers, and the same markdown.

**Read the state note at the top of this file first** — the stylesheet in this
repo is a pass behind, so the table below is the contract, not a description of
today. The site is the side that has to move.

**The report and the research page are one document.** `build-report.mts` turns
a `.md` into the PDF, and the same `.md` renders the page at
`smbx.ai/research/<slug>`, reading the same `<!--cover-->` block. The web page
adopts the PDF's darker reading ink `#3F464C` instead of a lighter body grey,
because it is holding parity with a printed document. Page and PDF cannot drift,
because there is nothing to drift *from*.

The rest maps one-to-one:

| Website role | Collateral | Value |
|---|---|---|
| Page canvas | light deck pages, light one-pager, report body | bone `#FFFFFF` (white since 2026-08-12) |
| Alternating section | a quiet stripe, a second-tier panel | `#F9F7F1` |
| Inset panel / filled cell | GFM table head, a plate on paper | `#F3F0E9` |
| Panel hover | a hovered filled cell or tile | `#EFEBE1` |
| Deep panel | the heaviest inset a light page carries | `#ECE8DC` |
| Placeholder | input ghost text only | `#8B9088` |
| Card surface | every card, always with a 1px ink border | `#FFFFFF` |
| Headline ink | heads on light pages, borders, primary buttons | `#16181A` |
| Body copy | body on decks, cards and one-pagers | `#4A4F54` |
| Long-form reading ink | report body and the research page | `#3F464C` |
| Muted | sources, page numbers, captions, kicker labels | `#7C8187` |
| Hairline | separators inside a card | `#E4DFD3` |
| Heavier divider | chip and plate edges, frame hairlines on paper | `#D8D3C6` |
| The accent | kickers, rules, list markers, links, chip fills, the stat bar | `#B8431E` |
| Accent hover | link and control hover only | `#9C3717` |
| Chip fill on light | a chip, a tint behind a notice | `#FBE7DF` |
| Vivid highlight | large marks, illustration masses, chip fills on the field — never small text | `#FF7D55` |
| The accent on the field | rules, links and the stat bar, as TEXT | `#FFAA90` |
| The field | deck cover and closer, dark one-pager, report cover | `#8A2B32` |
| Recess on the field | inputs, insets, dense text, the footer base | `#50191D` |
| Subtle recess | alternating rows, quiet grouping | `#6C2227` |
| Hairline on the field | strips, table rules, frame edges — an EDGE, never a fill | `#AF6F74` |
| Label plate on the field | cover stat cards, numbered workstream cards | `#964046` |
| Reading text on the field | every head and paragraph on the field | `#FFF3F0` |
| Secondary on the field | sub-heads, supporting copy | `#F0D8D4` |
| Labels on the field | mono kickers, captions, figure labels | `#DCB8B4` |
| Smallest legal line on the field | the source line under a stat | `#D6B2AF` |
| Outlined control on the field | a bordered button | `#C08D90` |
| Display face | every hook, head and report title | Source Serif 4, 550 |
| Working face | all working copy and every figure | Schibsted Grotesk, tabular |
| Label face | kickers, sources, page numbers | IBM Plex Mono |

When someone opens the PDF you posted and then clicks through to the site, the
two have to read as the same practice. That is the whole point of the system,
and it is why none of it is yours to adjust.

---

# 4. The palette

### Grounds — four, and they are all light

`bone #FFFFFF` is the page — pure white since 2026-08-12 (Paul, side-by-side with carta.com: "the background is definitely darker still"); the token keeps its historic name. `boneAlt #F9F7F1` is an alternating section.
`panel #F3F0E9` is an inset — a filled cell, a table head; it hovers to
`panelHover #EFEBE1` and its heaviest form is `panelDeep #ECE8DC`. Input ghost
text is `placeholder #8B9088` — that role only. `white #FFFFFF` is a
card, and a card **always** carries a 1px `ink` border; a white rectangle
floating on bone with no edge is not a card, it is a hole.

### Ink

`ink #16181A` carries headlines, borders, primary button fills and the corner
handles. `body #4A4F54` is body copy — cooler and deeper than the grey it
replaced. `muted #7C8187` is a source, a vintage, a caption, a kicker label.

### Hairlines

`hair #E4DFD3` separates rows inside a card. `chipBorder #D8D3C6` is the heavier
one: a chip edge, a plate edge, a frame on paper.

### The one accent

`green #B8431E` is the whole accent system on LIGHT surfaces — a kicker square,
a rule, a list marker, a link, a chip fill, and the 4px bar under a numeral. At
5.44:1 on white it is one of the few accents this house has had that carries
text AND fills, so it does all three jobs. `greenHover #9C3717` is for hover and
nothing else. `greenTint #FBE7DF` fills a chip on light.
`greenBright #FF7D55` is a large mark — a chart mass, an illustration plane, a
chip fill on the field — and **never small text**: 2.53:1 on white, 3.36:1 on
the field, which clears AA only at display sizes (≥24px).
`mint #FFAA90` is the accent's text-safe value **on the field**, at 4.61:1.

**THE NAMES ARE ROLES, NOT COLOURS.** `green`, `mint` and `greenBright` are
historical keys kept so 16 importers did not need editing in a palette commit.
Read them as: accent-on-light, accent-on-field-as-text, accent-as-large-mark.

**THE BUTTON LAW: the accent is never a resting fill.** A primary button is
ink-on-light or bone-on-field. The accent appears on hover, on chips, on
kickers, on links, and on the bar. An accent-filled button is the fastest way to
make a surface look off-brand while every individual hex still checks out —
nothing in a diff or a contrast checker will catch it. carta.com reaches the
same rule independently: their primary is `rgb(26,26,26)` on white.

### There is no jewelry

Ledger's amber and honey have no equivalent here and no replacement. They are
the trap this pass makes sharpest: the system is warm now, so a golden hex no
longer looks obviously foreign — check the hue angle, not the temperature. Where a
brass bar sat under a big numeral, Carta puts a **green bar** — 4px tall, 52px
wide on a card-scale numeral, 10px below it, taken from the live site's proof
trio. Where a brass rule underlined a table head, Carta puts ink. Where a brass
tag labelled a section, Carta puts a green kicker square. If a surface seems to
want a second colour, it wants a rule, a plate or a handle instead.

### The band

`dark #8A2B32` — oxblood — **flat**. No texture, no glaze, no halo, no gradient,
no bloom.

**THE FIELD BUYS SOMETHING NEAR-BLACK COULD NOT GIVE: RECESS.** The old band sat
at luminance 0.0091 with nothing below it, so every surface on it had to go
lighter and "recessed" did not exist as a move. Oxblood sits at 0.0736 — 8.1×
higher — so the ramp runs in both directions. Three consequences worth knowing
before you place anything on it:
1. **Lift comes from an edge, not a fill.** A 1px `darkSeam` rim on a
   `darkPlate` reads as raised and costs the text nothing; raising the FILL to
   the rim value drops `darkSub` to 2.89:1.
2. **`darkWell` is the most legible surface in the system** — all four text
   tiers clear AA on it, where the field carries three and `darkPlate` two.
   Dense reading belongs in the well, not on a raised card.
3. **The accent lives at field level and below.** `greenBright` is 5.55:1 on the
   well, 3.36:1 on the field, 2.67:1 on a plate, 1.55:1 on the rim. A raised
   surface carries content, never the accent.
This is the largest single change in the Carta pass and it *deletes machinery*:
the Ledger block was a composite built by `blockBackground()` — plaster under a
jade glaze under a radial halo — and every one of those layers is gone.

Do not keep the texture "for depth". Depth on a Carta surface is structural:
the frame, the handles, the plate, the rule. And note the trap — writing
`background: <dark> url(texture)` changes nothing on screen, because the image
sits above the colour in the CSS background stack. The colour underneath is
only ever a no-image fallback. **Delete the layer; do not re-point it.**

**A TOKEN CAN CHANGE ITS JOB, AND THAT IS WORSE THAN CHANGING ITS VALUE.**
Found 2026-08-03 and it applies with full force to this pass. `dark` used to
mean a plain near-black, so anything that wanted "make this darker" reached for
it; when Aurora made it the jade block, those callers were not swept, and the
one-pager painted the left 18% of every photograph in saturated green — hidden
on the dark card where it merged into the block, a colour cast on the light
one. **`dark` means the rhythm break and nothing else.** A shadow, a scrim, a
seam or a recess is `ink`. Carta makes this trap quieter and therefore more
dangerous: its band and its ink are near-identical darks, so a consumer holding
the wrong one looks right until the next palette move.

The field's own values are named, not bone at alpha. Every one is the field
mixed toward black or white by a fixed fraction, so surfaces read as ONE
MATERIAL under different light — if `dark` ever moves, regenerate the whole
ramp rather than nudging members of it:
`darkWell #50191D` recess · `darkShade #6C2227` subtle recess ·
`darkPlate #964046` label plates · `darkSeam #AF6F74` the rim, an EDGE never a
fill · `darkBtnBorder #C08D90` an outlined control ·
`darkInk #FFF3F0` reading text · `darkSub #F0D8D4` secondary ·
`darkMuted #DCB8B4` labels · `darkLegal #D6B2AF` the smallest source line.

### Structure replaces atmosphere — the rule the first Carta pass missed

Paul, 2026-08-08, on the first full re-render: the pages *"still seem Aurora
with just a plain dark background."* He was right, and the diagnosis is exact.
Ledger held a page together with **atmosphere** — plaster texture, a jade
glaze, a bloom rising out of a corner. Carta deletes every one of those. If you
delete them and add nothing, you do not get Carta; you get the old layout with
the lights off.

What replaces them is **structure**, and it is not optional decoration:

- **The page bracket.** A hairline frame inset inside the trim on a cover, a
  closer and a one-pager copy column, wearing the four corner handles. It ducks
  *behind* the art, so on a page carrying a full-height photograph or a foot
  band the bracket stops at the picture's edge on its own.
- **Framed art.** Every image sits in a square hairline frame with handles —
  the report hero, the carousel's trade slot. Never a bare bleeding rectangle
  on a light page.
- **Plates.** A stat card, a workstream card, a table head: a filled panel with
  a drawn edge, `darkPlate` on the band and `panel` on paper.
- **Seams.** Where two surfaces meet, a 1px `darkSeam` or `hair` line — not a
  gradient, and not nothing.

A converted surface that carries none of these is a surface that changed
palette and kept its old grammar. That is the drift tell to check first.

### Light surfaces

Flat bone. Ledger lifted a light page with four radial blooms alternating jade
and amber; with amber gone, green-only blooms read as a haze rather than as
light, so the wash goes with the warm. If a light page reads empty, it is short
of structure, not short of atmosphere.

### Long-form reading

`REPORT.body #3F464C` is the one Ledger-era value Carta keeps **on purpose**.
Fifty-five printed pages is a different decision from a slide glanced at for two
seconds, and the site's own report pages use that exact ink.

---

# 5. Type

| Role | Face | Notes |
|---|---|---|
| Display | **Source Serif 4** at 550 | 600 for card titles. Hooks, heads, report titles, big figures set in serif. |
| Working | **Schibsted Grotesk** | All body copy, cards, UI-like elements. Tabular figures everywhere. Giant grotesk numerals run at 800. |
| Label | **IBM Plex Mono** | Kickers, sources, page numbers, figure labels. 0.16em tracking on a kicker. |

**The readability floor: nothing customer-facing sets below 13px** (Paul,
2026-07-13). Mono labels run 13–13.5px with their tracking; a label that
"needs" to be smaller is a label that should not exist.

**Fonts are embedded, never linked.** `cartaFontFaceCss()` inlines all three as
base64 `@font-face` rules. A renderer that reaches the Google Fonts CDN gets
nothing — Railway blocks it and the Docker image ships only Noto — so the
artifact renders in typewriter mono, correctly locally and wrong in production.
That has happened once.

**Source Serif 4 is wired as the wght-only variable cut, not the opsz one.** A
variable serif with an optical-size axis hands you its most mannered drawings at
headline sizes if the browser is left to map font-size onto the axis. That is
the Fraunces failure this system already paid for. No axis, nothing to mis-map,
and no `font-variation-settings` to remember on every consumer.

**Why the axis rule exists, in full.** Paul on a pricing headline set in
Fraunces: *"it looks like the f is drunk lol — and makes the whole sentence look
weird."* He was reading the typeface correctly. Fraunces carries an `opsz` axis
from 9 to 144 and CSS `font-optical-sizing` defaults to `auto`, so a 52px
headline requested optical size 52 — where the `f` grows a long right arm with a
ball terminal that overhangs the next letter and stroke contrast rises sharply.
Undercase drew that for type set very large. At headline size it reads as a
wobble, and because the contrast moves with it the whole LINE looks unsteady,
not just the glyph. The figures did it too. Fraunces went out on 2026-08-05,
Newsreader replaced it, and Carta replaced Newsreader — but the axis is the
lesson, not the face.

**Discretionary ligatures off in titles.** A swash ampersand in "Home Services
M&A" reads as a glyph nobody recognises. A title is the wrong place to discover
that a face has opinions.

---

# 6. The three formats, as they actually render

**FORMATS.md owns the slots.** What follows is the *look* inside them; it
deliberately restates none of its measurements, and the gate fails this file if
it does.

## 6.1 Carousel — `build-deck.mts`

Bookends and body. The cover and closer take the band (or bone, with
`--bookend light`); everything between is bone. Carta has one dark, so the
`--bookend ink` and `--bookend dark` flags now paint the same ground; both names
survive because live specs pass both.

The cover hook is the display serif, two-tone — the second beat turns mint on
the band, Deal Green on paper. A hero figure sits in the reading ink with the
stat bar under it, never in a colour of its own. The kicker is a green square
then a mono label. The byline is Paul's real headshot in an **opaque neutral
ring** — never green next to a face, and never translucent, which is how a
bloom behind the strip turned the ring green by another route.

Body pages carry a ghost numeral at 5%, a mono kicker rule at the head, and a
flat band strip at the foot. A trade page frames its illustration: square, 1px
ink, four handles, and the clipping happens on an inner element so the handles
are not sheared off.

The closer's action bar is the one filled control in the system — bone on the
band, ink on paper, its arrow green. It carries the only radius on the page.

**Every page is rasterised at 2× and the PDF rebuilt from flat images.** Vector
gradients get seamed by Preview and LinkedIn's rasteriser. This survives Carta
even though there are no gradients left to seam: the law is about what a
renderer may do to a page, not about what we put on it.

## 6.2 One-pager — `build-onepager.mts`

**The FIGURE layout is the default (Paul, 2026-08-18; the split below is
preserved, inferred for any spec that names `image` without `layout`).** The
full-length founder cutout floats in the text flow and the copy wraps his
silhouette. The geometry is measured: figure height 834px = 1350 × φ⁻¹, the
same golden construction the site hero took from carta.com; spacing steps the
Fibonacci ladder (21 · 34 · 55); the frame is the full-card inset hairline
with the four handles (sanctioned here — there is no photograph column for it
to cross); feet land just above the foot hairline, the approved v6 rendering.

**FRAME C — THE PORTRAIT IS A RECTANGLE ON THE CLOSER (Paul, 2026-08-19:
"maybe instead of a round frame, it should be rectangle to accommodate the
imperfect pic").** The round headshot disc was Carta's ONE sanctioned radius
exception. On a CTA closer it fails for a measurable reason: a square/circular
frame on a 1:1.62 source must discard 38% of the image, and what it discards is
everything below the chin — "it looks like i have no neck". So the closer's
portrait is a **φ rectangle**: `founder-portrait.jpg` is 1200×1944 = 1:1.620 and
φ is 1.618, so the frame shows the WHOLE photograph, uncropped, and the collar
and shoulders survive. Radius 0 with four corner handles — which is the house
grammar rather than an exception to it — plus a **14px Deal Green offset plate**,
the monolith's rim-light move, so the closer rhymes with the cover instead of
copying it. The small byline disc in a FOOT stays round (it is a byline mark,
not a portrait) and crops at 0.283 of the source height.

**THE BLOOM, SANCTIONED AND SCOPED (Paul, 2026-08-18).** The figure layout's
dark variant carries a radial Deal Green bloom behind the figure. This is a
deliberate, dated amendment to the flat-band law below — chosen from a ladder
where flat, bloom, and bloom-plus-texture were shown side by side. The scope
is exactly this: **the figure layout, dark ground, radial Deal Green.** It is
not a general licence to glaze: the boardroom texture stays retired (it was in
the same ladder and was not chosen), no other surface gains a wash, and the
dead-systems table below still governs everything else. `bloom: false` in the
spec returns the Carta-flat card. Renderer-proof holds because the PDF is
rebuilt from the flat PNG — no gradient reaches the vector layer. The foot CTA
on the band is `CARTA.white` — bright white by Paul's call, one step above the
dark reading ink; green on paper.

The split layout, preserved: a vertical split — a copy column on the band or
on bone, the photograph full-bleed beside it. The copy column is the framed
thing — an inset hairline panel wearing the four handles. Do not run the frame
across the whole card; it crosses the photograph and reads as a stray box.

The seam between column and photograph is an **ink shadow**, not the band. It
must stay on `ink`: under Carta the two darks are nearly identical, which makes
this exactly the bug that will not appear until the next palette move.

## 6.3 Report — `build-report.mts`

A flat band cover, square, with a green kicker square, the title in the display
serif, a mint rule, a square-framed hero, square label plates for the stat band,
and the byline pinned to the foot.

The body is print white with the long-form reading ink. Part heads take a 2.5px
ink top rule. Tables are hairline with a `panel` head, mono uppercase column
labels and an ink underline. A blockquote is a **notice** — a green rail over a
flattened green tint, never a decorative grey.

**The cover is rasterised; the body stays vector.** Rasterising fifty-five pages
of research would destroy selectable text and balloon the file, so only the one
page that carries a full-bleed dark ground becomes an image, and the body's few
translucent fills are flattened. `/Group=0 /Shading=0` in the output is the
assertion that it worked.

---

# 7. The standing marks

**Logo.** `logo-green-x.png` on light, `logo-green-x-dark.png` (white wordmark,
mint X) on dark. Never redraw it, recolour it, stretch it, or add an effect. If
you see `logo-coral-x.png` or `logo-blue-x.png` in the folder, those are history
kept on disk — using one is a drift, not a choice.

**The face is the trust layer.** Paul's real headshot appears on every artifact:
report cover byline, one-pager foot, carousel cover and closer. Round crop,
opaque neutral ring on every ground. `client/public/founder-portrait.jpg` is the
file; the walking shot is `founder-walking.webp`. **Those are the only two
photographs of him that exist. Never generate or alter one.**

**Byline.** "Paul Baker" / "Buy-side corporate development". Not a title he does
not hold, not a company line that implies staff.

**The corner handles.** Four 8px ink squares at −4px, on cover panels, image
frames and cards; 7px at −4px on a small card; `darkInk` on the band. They sit
outside the frame, so the framed element must never carry `overflow: hidden` —
clip the picture, never the frame. This is the house gesture; it replaced the
curved crests, and a surface without it has probably not converted.

---

# 8. Graphics doctrine

**The number is the graphic.** A cited figure set enormous over a green bar
beats any illustration, and it is the house signature. Every number on a surface
must be traceable to a source — the citation law in CLAUDE.md applies to
collateral exactly as it applies to a master. **Never a fabricated chart, never
an invented benchmark, never a figure that reads well.**

**The prompt is part of the palette.** `brandPaletteLines()` and
`artworkPaletteClause()` in `house/tokens.ts` generate the text handed to
models, specifically so a prompt cannot disagree with a renderer. A model told
to add "one small brass-gold accent" complies faithfully: the picture goes
off-palette with nothing wrong in the diff and nothing to see in review. Both
functions are Carta as of 2026-08-08, and the amber clause is **deleted rather
than reduced** — "sparingly" still gets you gold.

Editing those strings invalidates every cached deck, because the cache key
hashes the prompt. On a palette change that is the correct outcome.

**The artwork library is still Ledger-era.** Every illustration in `assets/` was
generated from prompts baking in a retired bone, and they land warmer and darker
than the page around them. `ARTWORK_LIFT` in `house/tokens.ts` is the
multiplicative bandage and it cannot fully work — a brightness multiply lifts
the yellow cast with everything else. `scripts/studio/art-prompt.mts` prints the
current brief and `--check` measures a directory's corners; regenerating the
library from it is the actual repair, and it is Paul's call.

**Illustration is allowed. Photography is real or absent.** A generated image
that is obviously a drawing is fine. A photograph that implies something
happened is not — no stock, ever, and no photoreal people. Name the hexes from
§4 in the prompt, ask for flat editorial illustration, and ban baked-in
vignettes, edge fades, gradient backgrounds and drop shadows. The layout applies
its own framing; an image that arrives pre-faded fights it and loses.

**No decorative eyebrows.** A small uppercase label above a heading saying
nothing the reader could not infer is filler and reads as such. The mono kickers
in these formats are real: they name the document. A label earns its place only
by carrying information.

---

# 9. Voice on a designed surface

The words are part of the design. Full laws in CLAUDE.md; these are the ones
that show up in collateral:

- Senior operator writing for a principal. Specific, unhurried, no hype.
- **Human, not clever** (Paul, 2026-08-03). Professional is the floor; sounding
  like a person is the requirement. Read every line aloud before it renders. If
  it is a sentence nobody would say out loud, rewrite it — a reader who notices
  the writing has stopped reading the argument.

  The tells, all of which have shipped here:

  - **A construction that only works on the page.** *"Neither figure is wrong.
    Quoting either one without naming which it is, is."* That closing `, is.` is
    a trick, not a sentence. It became *"Neither number is wrong on its own. The
    problem is quoting one without saying which."*
  - **Passive where a person would be direct.** "is not something we can
    currently verify" becomes "we have not been able to verify it".
  - **Semicolons doing a full stop's job**, and "that which" phrasing generally.
  - **Contractions are house.** A confirmed-good teardown opens a page with
    "The asset isn't the truck." Formality is not the same thing as authority.

  What stays: specific, unhurried, no hype, no AI self-reference, and the number
  carrying the weight. Human does not mean chatty.

- **Plain language, and say what the message is** (Paul, 2026-08-03). *"I'm just
  confused on what the actual message is… we're asking firms to trust us to go
  against banks and auctions. Just use plain language throughout and be thorough
  and explanatory. Too much jargon."*

  Two failures, and the second is the dangerous one.

  **Jargon.** The reader is a principal, not a practitioner. "EV/EBITDA", "comp
  set", "in-band", "tuck-in", "platform parent", "recurring mix" are shorthand
  *we* use. On a page, explain the thing instead of naming it: not "EV/EBITDA is
  16.34x" but "compare the whole business, debt included, to its operating
  earnings, and the same company is 16.34x." It costs a line and buys every
  reader who was not going to ask.

  **A piece with no message.** The first commercial-MEP deck was six true,
  well-sourced observations that never said what they were *for*. Every page
  passed its check and the deck still failed, because a reader cannot act on a
  demonstration of competence. **Write the one-sentence message before the
  pages, put it in the spec header, and make every page a worked example of
  it.** If you cannot write that sentence, the piece is not ready.

- **No AI self-reference of any kind**, anywhere, ever.
- Describe the work, never a competitor. No grievance copy.
- The category is a corporate development function — not a cheaper bank.
- Buy-side loyalty stated warmly and **once**. Never a stacked oath.
- Track record: "led or co-led", "selected transactions", employers anonymised
  as "a global investment bank" and "a world-class PE-backed aggregator", total
  stated as **150 acquisitions**. The attribution line goes wherever the deal
  names go — never as a footnote.
- **No fee talk, no pricing, on any public surface.**
- Client-facing documents end on what we don't know yet.

---

# 9a. Carta is canon — and the guards that make it stick

**THE RE-RENDER LAW.** A pre-Carta artifact is never patched, it is rebuilt.
Re-render from the spec into a new dated folder; never edit an old output,
never lift a page out of one, never reuse its images. Every dated folder before
`2026-08-08` carries a `RETIRED-PALETTE.txt`.

- **`house/palette-guard.ts`** — every builder calls it on the document it is
  about to render. A retired hex or typeface fails the build, exit 4, nothing
  written. It reads the DOCUMENT, not the source, because a colour can arrive
  through a function three files away and the rendered markup is the only place
  the question has one answer.
- **`scripts/studio/carta-guard.mts`** — the preflight: source hexes, plus the
  artwork library's grounds and warm masses. Photographs are detected by colour
  count and exempt; posterising a real photograph into the accent is a way to
  destroy an asset while believing you are converting it, and that happened
  here once.
- **`npm run test:design`** — this file against `house/tokens.ts`.

A guard that cannot fail is worse than no guard. Each of these has been shown
to fail on a reverted input, deliberately, before being trusted.

# 10. Drift tells

Check your own output against these. Each one has actually happened.

- [ ] **You wrote HTML or CSS.** The single largest tell. House collateral comes
      out of the builders. A 52-page report once shipped in the wrong typeface
      because a session could not find the template and wrote its own stylesheet
      to "match the style". If a builder will not run, stop and say so — do not
      approximate it.
- [ ] **A hex appears that is not in §4.** Especially a warm one.
- [ ] **A rounded card.** Radius is 0 except on buttons and inputs.
- [ ] **A green button, or any green resting fill.** Passes every colour check.
- [ ] **A textured, glazed or bloomed dark surface.** The band is flat.
- [ ] **The words "warm", "coral", "terracotta", "cream", "amber" describe an
      intent.** This palette is bone, ink and one green.
- [ ] **A gradient anywhere.** Carta has none; a legibility scrim over a
      photograph is the single exception.
- [ ] **Handles missing from a framed thing**, or sheared off by an
      `overflow: hidden` on the frame.
- [ ] **A third dark page**, or a deck that ends on two darks.
- [ ] **A stock photograph**, or any generated image of a person.
- [ ] **A number you cannot point at a source for.**
- [ ] **You inferred a colour from a variable name.** `--pd-coral` is green.
- [ ] **You edited or reused a pre-Carta output** instead of re-rendering from
      the spec. Every old dated folder says not to, in a file.

If several of these are true at once, you did not make a series of small
mistakes — you anchored on a retired system. Stop, re-read §2 and §4, and start
the surface again.
