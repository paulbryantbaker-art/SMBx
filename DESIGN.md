<!-- CARTA pass — written 2026-08-08 from CARTA_COLLATERAL_CONVERSION.md.
     Supersedes the Aurora pass of 2026-08-01, which is now in §2. -->

> **CARTA IS CANON until Paul says otherwise** (2026-08-08, his words). There is
> no interim state and no surface that is allowed to stay on the old palette
> because it is inconvenient to move. If you find one, it is a bug to report,
> not a precedent to follow.
>
> **State of the system, 2026-08-08.** The collateral engine is on **Carta**:
> `house/tokens.ts` exports `CARTA`, all four builders import it, and
> `server/services/fontEmbeds.ts` embeds Source Serif 4 and Schibsted Grotesk.
>
> **The website stylesheet in this repo is NOT on Carta.**
> `client/src/practice/practice.css` is still on the Ledger green-black trial —
> its accent and its dark band are both in §2's dead table, and the gate prints
> the accent it actually found when you run it. So §3 below describes what the
> two surfaces must share, and the site is the side that has to move. Do not
> "correct" the collateral back to match the site. **Delete this paragraph when
> the stylesheet lands** — `npm run test:design` fails if it is still here after
> the site converts, and fails if it is missing while the site is behind.

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
> system. Bone paper `#FCFAF6`, ink `#16181A`, white cards with a 1px ink
> border. **Exactly one accent: Deal Green `#0A7A58`**, with mint `#A8F0CE` as
> its value on the dark band and bright green `#0FA97C` reserved for large
> marks — never small text. **There is no warm colour: no amber, no brass, no
> gold, no honey.** The full-bleed rhythm break is a **flat near-black band
> `#131512`** — no texture, no glaze, no halo, no gradient — carrying reading
> text `#F4F5F1`. **Radius is 0 everywhere except buttons and inputs, at
> 10px.** Framed things wear four 8px ink corner handles at −4px, outside the
> frame. **Green is never a resting fill**: a primary is ink-on-light or
> bone-on-dark, and green appears on hover, chips, kickers, links and the bar
> under a numeral. Display type is **Source Serif 4** at weight **550** (600
> for card titles); working type is **Schibsted Grotesk** with tabular figures;
> labels are **IBM Plex Mono** at 0.16em tracking. A cited number rendered
> enormous over a green bar IS the graphic. Photography is real or absent.

---

# 2. DEAD — if this is in your draft, you drifted

Every one of these was a real smbX system. Every one is retired. They are listed
with their hexes because that is how you catch yourself: a hex that is not in
§4 is not ours, and most of the wrong ones are here.

| Dead system | Signature | Died |
|---|---|---|
| **Ledger, Aurora values** (the system Carta replaced) | amber `#E8A62B`, honey `#F5C452`, the jade block `#0A6A4C`, ivory `#F2FBF6`, slate `#5A6169`, muted `#83898F`, hair `#EAE5DC`, rule `#DED8CC`. Six values survived the restyle unchanged and are live in §4 — bone, ink, Deal Green, its hover, the chip tint and mint — which is why "it was in Ledger" is not by itself evidence of death. The vivid highlight kept its hex and lost its job: it is no longer an ambient bloom. | 2026-08-08 |
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
- **Anything warm.** Amber was a working house colour for eight days and is now
  the single most likely wrong hex in a draft, precisely because it was recent
  and legitimate.
- **A textured or bloomed dark surface.** Carta's band is flat. If a dark page
  has plaster, a glaze, or a green glow rising from a corner, it is Ledger.
- **A green button.** See §4. This one passes every colour check.

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
| Page canvas | light deck pages, light one-pager, report body | bone `#FCFAF6` |
| Alternating section | a quiet stripe, a second-tier panel | `#F9F7F1` |
| Inset panel / filled cell | GFM table head, a plate on paper | `#F3F0E9` |
| Card surface | every card, always with a 1px ink border | `#FFFFFF` |
| Headline ink | heads on light pages, borders, primary buttons | `#16181A` |
| Body copy | body on decks, cards and one-pagers | `#4A4F54` |
| Long-form reading ink | report body and the research page | `#3F464C` |
| Muted | sources, page numbers, captions, kicker labels | `#7C8187` |
| Hairline | separators inside a card | `#E4DFD3` |
| Heavier divider | chip and plate edges, frame hairlines on paper | `#D8D3C6` |
| The accent | kickers, rules, list markers, links, the stat bar | Deal Green `#0A7A58` |
| Accent hover | link and control hover only | `#086348` |
| Chip fill | a chip, a tint behind a notice | `#DFF5EC` |
| Vivid highlight | large marks and illustration masses only | `#0FA97C` |
| The accent on dark | rules, links and the stat bar on the band | mint `#A8F0CE` |
| The dark band | deck cover and closer, dark one-pager, report cover | `#131512` |
| Hairline on the band | strips, table rules, frame edges on dark | `#2A2E29` |
| Label plate on the band | cover stat cards, numbered workstream cards | `#22261F` |
| Reading text on the band | every head and paragraph on dark | `#F4F5F1` |
| Secondary on the band | sub-heads, supporting copy on dark | `#D7DBD2` |
| Labels on the band | mono kickers, captions, figure labels on dark | `#ABB2AB` |
| Smallest legal line on the band | the source line under a stat | `#8A9088` |
| Outlined control on the band | a bordered button on dark | `#4A4F44` |
| Display face | every hook, head and report title | Source Serif 4, 550 |
| Working face | all working copy and every figure | Schibsted Grotesk, tabular |
| Label face | kickers, sources, page numbers | IBM Plex Mono |

When someone opens the PDF you posted and then clicks through to the site, the
two have to read as the same practice. That is the whole point of the system,
and it is why none of it is yours to adjust.

---

# 4. The palette

### Grounds — four, and they are all light

`bone #FCFAF6` is the page. `boneAlt #F9F7F1` is an alternating section.
`panel #F3F0E9` is an inset — a filled cell, a table head. `white #FFFFFF` is a
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

`green #0A7A58` is the whole accent system. It is a kicker square, a rule, a
list marker, a link, and the 4px bar under a numeral. `greenHover #086348` is
for hover and nothing else. `greenTint #DFF5EC` fills a chip.
`greenBright #0FA97C` is a large mark — a chart mass, an illustration plane —
and **never small text**; on bone it does not hold contrast.
`mint #A8F0CE` is the accent's value **on the band**, because Deal Green on
`#131512` is a 1.9:1 mark that reads as a dark smudge.

**THE BUTTON LAW: green is never a resting fill.** A primary button is
ink-on-light or bone-on-dark. Green appears on hover, on chips, on kickers, on
links, and on the bar. A green button is the fastest way to make a surface look
off-brand while every individual hex still checks out — nothing in a diff or a
contrast checker will catch it.

### There is no jewelry

Ledger's amber and honey have no Carta equivalent and no replacement. Where a
brass bar sat under a big numeral, Carta puts a **green bar** — 4px tall, 52px
wide on a card-scale numeral, 10px below it, taken from the live site's proof
trio. Where a brass rule underlined a table head, Carta puts ink. Where a brass
tag labelled a section, Carta puts a green kicker square. If a surface seems to
want a second colour, it wants a rule, a plate or a handle instead.

### The band

`dark #131512`, **flat**. No texture, no glaze, no halo, no gradient, no bloom.
This is the largest single change in the Carta pass and it *deletes machinery*:
the Ledger block was a composite built by `blockBackground()` — plaster under a
jade glaze under a radial halo — and every one of those layers is gone.

Do not keep the texture "for depth". Depth on a Carta surface is structural:
the frame, the handles, the plate, the rule. And note the trap — writing
`background: #131512 url(texture)` changes nothing on screen, because the image
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

The band's own neutrals are named values, not bone at alpha:
`darkInk #F4F5F1` reading text · `darkSub #D7DBD2` secondary ·
`darkMuted #ABB2AB` labels · `darkLegal #8A9088` the smallest source line ·
`darkSeam #2A2E29` hairlines · `darkPlate #22261F` label plates ·
`darkBtnBorder #4A4F44` an outlined control.

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

A vertical split: a copy column on the band or on bone, the photograph
full-bleed beside it. The copy column is the framed thing — an inset hairline
panel wearing the four handles. Do not run the frame across the whole card; it
crosses the photograph and reads as a stray box.

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
