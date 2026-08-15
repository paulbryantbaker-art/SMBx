# FORMATS — the slot tables

**Status: reconstructed 2026-07-29** from the three builders' source and from
`home-services-teardown.pdf`, the render Paul confirmed as correct. The original
`FORMATS.md` is referenced by `CLAUDE.md`, by `COWORKHANDOFF.md` and by
`COWORKDOTHIS.md`, and exists in none of: `$REPO/content/studio/`, the
`~/Downloads/SMBx-main` unzip (byte-identical to the checkout), or the workspace.
Every session since has improvised its layout. That is the whole reason the
report and the carousel do not look like the same practice.

Three formats. Each is a **fixed set of slots**. Copy is written *into* slots.
Copy is never written and then hoped into a layout — that is the failure this
file exists to end.

**`DESIGN.md` is the other half — the house LOOK.** Palette, type, the
dead systems named with their hexes. This file tells you where a thing goes;
that one tells you what it looks like when it gets there. Read both before
building, and read the dead-systems table specifically: this practice has run
eight visual systems, so a session working from memory does not fill the gap
with nothing — it fills it with terra cotta, coral, office blue, or the
green-black Ledger pass that died 2026-07-31. If a colour
or a typeface is about to be decided, it has already been decided.

---

## 0 · THE ORDER OF OPERATIONS

Collateral is the *last* step, and it fails when it is treated as the first one.
Every production run, in this order:

```
1  master.md exists, is audited, AND has been verified against primary sources
                                              ← CLAUDE.md job 2. Not optional.
2  write the imagery brief                    → markets/<m>/collateral/image-brief.md
                                                one entry per slot, sized to §4 below
3  Paul generates the art in Gemini           → markets/<m>/media/, named for what it SHOWS
4  write the spec                             → markets/<m>/specs/<name>.deck.mts
   …starting with THE MESSAGE in the header comment. One sentence saying what
   the piece is for. If you cannot write it, the piece is not ready to build.
5  verify the spec against the master         → verify-spec.mts, §6 below
5b check the copy                             → voice-check.mts, §7 below
5c check the surfaces                         → design-check.mts, §8 below
6  build                                      → --out markets/<m>/<collateral|decks>/<slug>/<date>
   READ THE WHOLE OUTPUT. The builders now exit 3 on missing art, and the
   failure prints AFTER the success line — but only if you scroll.
7  LOOK at the render — BOTH BOOKENDS, not just the dark one.
8  READ IT ALOUD. Still the only test that catches lifeless writing.
```

Step 2 is a **standing step, not a conditional one** — work out what images the
piece needs and write the Gemini prompts before anything is built, sized to the
slot table. Step 7 is the one that gets skipped: every image slot is
`object-fit: cover`, so the image is cropped from the centre, and one pass of
build → open → adjust → build is the difference between fitting and not.

**On output paths, see the Output law in §5.** The builders default to a flat
`./collateral` at the studio root, which overwrites the last build *and* files it
outside its market. Always pass `--out`.

**If a layout genuinely cannot express something, say so and stop.** Do not
invent a page.

---

## 1 · CAROUSEL — `build-deck.mts`

**Canvas** 1080 × 1350 px (4:5), `deviceScaleFactor: 2`. Outputs `<slug>.pdf`
and `<slug>-light.pdf`, their `-pNN.jpg` page previews, and one shared
`<slug>-caption.txt`.

**Spec shape** — `export const deck = {...}` in `markets/<m>/specs/<name>.deck.mts`

| Field | Required | What it is |
|---|---|---|
| `slug` | yes | output basename. One artifact, one slug. |
| `kicker` | yes | mono label, top-right of every page (`LANE TEARDOWN`) |
| `cover` | yes | `{ hook, sub, image, imagePos, numeral?, unit?, numeralLabel?, stats?, ghost?, spark? }` |
| `pages[]` | yes | the page kinds below |
| `closer` | yes | `{ tag, head, body }` |
| `headshot` | no | defaults to `client/public/founder-portrait.jpg` |
| `caption` | yes | the LinkedIn post text |

Cover and closer are **auto-added as the bookends**. Every page in `pages[]`
is light. Do not author a bookend, and do not author a dark body page.

**The bookend law (amended 2026-08-01).** *Exactly two bookends, the first page
and the last, and they always match each other.* The old wording was "exactly
two DARK pages" — that was written when dark was the only bookend there was.
The rule it exists to enforce is unchanged: never a third bookend, and never a
deck that ends on two of them in a row.

**Both bookend surfaces are house**, the way the one-pager's dark and light
cards are both house. `--bookend dark|light|both` (default `both`). The dark
variant keeps the bare slug because it is the default post; the light one takes
`-light`. **The body pages are byte-identical between the two** — only the
first and last page change surface. This is a choice of opening, not a second
deck, so never treat the two as separate artifacts to keep in sync.

**The cover carries the argument, not just the title.** It is the only surface
in the system that can get away with saying nothing, which is exactly why it
reads as empty when it does. Four optional slots, all of them existing house
devices:

| Slot | What it renders |
|---|---|
| `numeral` + `unit?` + `numeralLabel?` | the signature figure above the hook — reading ink on both grounds, over a 4px green bar (mint on the band) |
| `stats: [{value, label}]` | the proof strip — up to three hairline cards at the foot of the copy column. This is the report cover's stat band. |
| `ghost: false` | switch off the oversized `X` behind the copy (default on) |
| `spark: false` | switch off the corner constellation (default on) |

A hook containing a sentence break renders as a **two-beat**: the turn changes
colour automatically. Nothing to author.

**Every figure on a cover must survive the same audit as a body figure.** It is
the most-screenshotted surface you make and the one most likely to travel
without its deck. Do not put a total on a cover unless the total is itself
cited — summing rows with different vintages, publishers and scopes is how the
`$700B` opener got cut from the home-services teardown.

**Page kinds — the complete vocabulary. There are four. Nothing else exists.**

```
{ kind:'numeral',   numeral, unit?, head, body?, source? }
{ kind:'statement', tag, tagColor?:'green'|'brass', head, body?, source? }
{ kind:'diagram',   tag, head, body?, source?, connector?,
                    bars:[{ label, sub, style:'ink'|'green', h }] }
{ kind:'trade',     name, image?, imagePos?, numeral?, unit?, head, body?, source? }
```

| Kind | Reads as | Use it for |
|---|---|---|
| `numeral` | giant grotesk figure, green bar, serif sub-headline, body | one number that carries a whole idea |
| `statement` | mono eyebrow with a green square, serif headline, green rule, body | a claim with no figure attached |
| `diagram` | two bars with a connector between them | a comparison — `4–8x` **vs** `16–20x` |
| `trade` | left: eyebrow + figure + rule + headline + body; right: rounded image panel | a sub-vertical with its art |

**Rules that hold across every page**

- `tagColor: 'brass'` marks a **trap or caution**. The key name is historical — Carta has one accent, so both tag colours now render green on paper and mint on the band; the distinction survives in the word, not the hue. Green is neutral. Never
  decorative — the colour is carrying meaning.
- `source:` is a **mono line at the foot of the page**. Any page with a figure
  and no `source:` is a defect. Publisher and date, nothing more.
- `h:` on a bar is a **pixel height**, and the ratio between two bars must be
  the ratio between the two numbers. A 4–8x bar at 176 against a 16–20x bar at
  340 is honest. Eyeballed heights are a chart that lies.
- **A bar label longer than six glyphs overflows its bar** (found 2026-08-03).
  Bars are a fixed 168px wide and the label has no fitting logic — `$8.12B` fits,
  `$14.06B` clips its final character, and nothing errors. A chart that
  mis-states its own figure is worse than no chart. The `numeral` page has the
  same ceiling one glyph higher: at 290px, `$14.06B` runs off the right edge of
  the page. **Rounding is not the escape** — a rounded figure is a different
  figure. Move the figure into a `statement` head, where the display serif at 58px has
  room, or pick a comparison whose labels are short.
- The ghost numeral (`02`, `03`) is drawn by the builder from page order. Do not
  put a page number in copy.
- One idea per page. If a page needs two `source:` lines it is two pages.

---

## 2 · ONE-PAGER — `build-onepager.mts`

**Canvas** 1080 × 1350 px. Renders both `dark` and `light` variants by default.

**Spec shape** — `export const post = {...}` in `markets/<m>/specs/<name>.post.mts`

| Field | Required | Slot |
|---|---|---|
| `slug` | yes | output basename |
| `hook` | yes | display-serif headline, 45px/1.13. The whole point of the card. |
| `kicker` | no | an 8px green square then a muted mono label, top-right |
| `numeral` | no | display-serif 124px/0.86 figure over a 4px green bar, left column |
| `numeralLabel` | no | mono caps under the figure (`\n` breaks the line) |
| `body` | no | 23px/1.5 |
| `invite` | no | 23px semibold — the ask |
| `cta` | no | closing line |
| `image` | no | right photo panel. **Omit for a full-width text card.** |
| `imagePos` | no | crop, default `50% 42%` |
| `imageDark` | no | overrides `image` on the dark card only |
| `imageLight` | no | overrides `image` on the light card only |
| `imagePosDark` | no | overrides `imagePos` on the dark card only |
| `imagePosLight` | no | overrides `imagePos` on the light card only |
| `byline` | no | `{ name, title }`, defaults to Paul |
| `variants` | no | `['dark','light']` |
| `caption` | yes | LinkedIn post text |

Mint rule is 72 × 5, fixed. The photo panel is `object-fit: cover` full-bleed —
**it always fills.** If art looks stranded on a one-pager the file is wrong, not
the layout.

**There is no `sub` field** (corrected 2026-08-03). This table carried one for
four days — "supporting line under the hook" — and the builder's `Post`
interface never had it, so a `sub:` was accepted by the spec and silently
dropped from the render. The supporting line goes in `body`. This was the
silent-drop failure this file exists to prevent, inside this file.

**Per-variant art (added 2026-08-03).** The two cards are one artifact, not two,
and the single `image` running on both is the common case. But the block and the
paper are different surfaces, and a photo that carries one can sit badly on the
other — so `imageDark` / `imageLight` override `image` on that card alone, with
`imagePosDark` / `imagePosLight` for the crop. `smbx-open-for-business` uses it:
the headshot on the block, where eye contact is doing the work, and the walking
shot on paper. Both must still be real photographs — the imagery law does not
bend because there are now two slots.

**A hook that breaks badly is fixed with U+00A0, not by rewriting it.** The hook
carries `text-wrap: balance`, which optimises line lengths and will happily
orphan a short word onto its own line — "Buying a business / is hard work. We /
make it easier." Glue each sentence with non-breaking spaces and balance can
only break between them. Same technique as the U+2011 note on `hook` above.

---

## 3 · REPORT — `build-report.mts`

**Canvas** US Letter portrait. Cover is a dark full-bleed card; body pages are
bone. Outputs `<slug>.pdf`.

### 3.1 The cover block

An HTML comment at the very top of the `.md`, above the first `---`:

```
<!--cover
byline:   Paul Baker
role:     smbX.ai · Buy-side corporate development
headshot: founder-portrait.jpg
image:    cover-{subject}.jpg
imagePos: 50% 50%
footer:   {Short Title} — {Assessment Type}
eyebrow:  MARKET ASSESSMENT
accent:   {substring of a ## heading} | band-{name}.jpg | 50% 50%
stat:     {figure} | {label, ≤6 words}
for:      {Client name}          ← CLIENT DOCUMENTS ONLY. Omit for public work.
-->
```

`accent:` and `stat:` repeat. Any other key is silently discarded.

### 3.1a `for:` — the only thing a client document adds

Paul, 2026-08-15: *"i want all decks, docs and collateral for a client to have
the same look and feel as the branded smbx collateral — it will just have whose
it's for on the cover too."*

So there is **no client template**. A client deliverable is the house report
with one extra line, and `for:` is that line: it renders as a plated
`PREPARED FOR / {name}` block at the right-hand end of the cover's byline rule,
so the cover reads *by … / for …* across one line. Omit the key and the block
does not render at all — which is the published-collateral case, and the reason
you cannot accidentally ship a public report with a client's name on it.

**Three rules on what goes in it.**

1. **A name, not a mandate.** THE LINE's engagement-confidentiality rule is not
   suspended by the fact that the client is the reader: hold period, check size,
   equity available and leverage tolerance never reach a page. Those would
   audit perfectly clean — no figure in them is uncited — so nothing mechanical
   catches it. This one is on the person writing.
2. **`for:` makes the document client-direct, which changes where it files.**
   It renders to `decks/`, never `collateral/`. See the filing law in
   `CLAUDE.md`: collateral is publishable anywhere, and a document naming a
   client is not.
3. **It is on the cover, deliberately, and not in the running footer or as a
   watermark.** A reader who opens the PDF at page 4 and forwards it should
   still be able to see from the cover who commissioned it.

### 3.2 THE COVER BUDGET — and the rule that supersedes it

Mechanically the cover fits: one-line title → hero + 3 stats + 4 cards;
two-line title → 3 cards; stats run 3 per row; overflow is **silent** — the
byline slides onto page 2 and the cover just looks like it has a hole in it.

**But fitting is not the standard. A cover is a cover.**

The confirmed-good render carries: logo · eyebrow · title · rule · **one**
subtitle line · one full-height image panel · byline bar. That is all. It does
not carry stat cards, and it does not carry a numbered list of findings,
caveats or qualifications.

So, binding:

| On the cover | Not on the cover |
|---|---|
| eyebrow, title, rule, one subtitle line | stat bands |
| one image, filling its panel | numbered finding cards |
| byline + role + headshot | caveats, scope notes, conflicts, what-we-don't-know |
| footer | anything that begins "note that" |

Findings belong in `## EXECUTIVE SUMMARY` on page 2. Caveats belong in the
appendix. A cover that argues has already lost the reader it was meant to open.

**Check page 1 of every render.** One command, and it is the only way to catch
a silent overflow:

```bash
pdftoppm -png -r 55 -f 1 -l 1 collateral/<slug>/<date>/<slug>.pdf /tmp/cover
```

### 3.3 Body slots

| Markdown | Renders as | Break behaviour |
|---|---|---|
| `# PART …` | 21pt display serif, 2.5px ink top rule | **`page-break-before: always`** |
| `##` | 14.5pt display serif | `page-break-after: avoid` |
| `###` | 11.5pt working sans 700 | `page-break-after: avoid` |
| GFM table | hairline table | avoids breaking inside |
| `>` blockquote | green left rule, tinted panel | avoids breaking inside |
| `accent:` match | 100% × 2.2in image band | avoids breaking inside |

### 3.4 The white-space failure — cause and fix

**Cause.** `# PART` carries `page-break-before: always`. Every part header
starts a fresh page, so whatever text sat above it is abandoned wherever it
stopped. Ten parts produce ten partial pages. Tables and accent bands then add
their own: `page-break-inside: avoid` on a block that will not fit pushes the
whole block to the next page and leaves the remainder of the current one empty.
There are no `orphans`/`widows` declarations anywhere in the stylesheet.

**Fix, in order of preference:**

1. **Fill the part, do not pad it.** A `# PART` should open with copy that runs
   to the foot of its page. If a part has one page of content it is a `##`
   inside another part, not a part.
2. **Size tables to the page.** A table that cannot fit in the remaining space
   goes at the top of a part, or is split into two tables with their own `###`.
   Never let a 30-row table decide where the page ends.
3. **Place `accent:` bands against the first `##` of a part**, so the band sits
   under a header at the top of a fresh page rather than mid-flow.
4. If a hole remains, the section order is wrong. Reorder. Do not insert filler.

### 3.5 The accent band

Composed art only, **1700 × 520 px** (3.27:1) — that is the file to make.
The print box is 7.0 × 2.2 in (3.18:1), so the render trims ≈3% off the sides;
compose with the subject clear of the outer 2%. Rendered at 100% × 2.2in with
`object-fit: cover`. The composition is: bone canvas, illustration at **full
band height** sitting right of centre, a short Deal Green rule anchoring the
left third. Compose at print weight — 1700×520 JPEG at q88 is ≈45KB; the raw
4–5MB PNGs took one report to 11MB.

The failure mode is an illustration that occupies only the middle of the band
with empty bone either side. That reads as a mistake even though the file
dimensions are correct. **Full band height, or no band.**

`build-report.mts` resolves an image from the `.md`'s own folder, that folder's
`media/`, its **sibling** `../media/`, or `$REPO/client/public/` — **and nothing
else.** The deck builder's `--media` → `./media` → `./assets` chain does not
apply. Report art lives in `markets/<m>/media/`, referenced by bare filename,
with the report's source `.md` in `markets/<m>/documents/` beside it. The
`../media` step was added to the resolver on 2026-07-29; without it a report
filed in `documents/` could not see its own market's art, and every cover image
and band resolved to nothing — silently, because a missing accent just does not
render.

### 3.6 Required document skeleton

Start from `REPORT_TEMPLATE.md`. Non-negotiable:

```
<!--cover -->            the block above
# {Subject}              one line if you can manage it
## A Buy-Side Assessment for Acquirers · Published {D Month YYYY}
## EXECUTIVE SUMMARY     bullets, each a claim with its figure
# PART I … n             the body
# APPENDIX — DATA CONFLICTS, CAVEATS & SOURCE NOTES
  ## A.0 Provenance
  ## A.0.1 … A.0.n       one per verification pass
  ## A.1 Reconciled data conflicts
  ## A.2 Caveats
  ## A.3 Primary source families
  ## A.4 How to read the figures    ← STANDING BLOCK, near-verbatim
## Sources
## Derivations
## What we don't know yet           ← every client-facing document ends here
```

---

## 4 · IMAGE SLOTS — dimensions, ratios, and the silent drop

**Only certain slots take an image, and this is the most common failure in the
whole system.** An `image:` key on a page kind that has no image slot is
**silently discarded** — the build succeeds, the render looks finished, the
picture is simply gone. On the carousel, `trade` is the only body page kind with
an image slot. There is no other option: to put art on a body page, the page
kind must be `trade`. Cover and closer are dark bookends added by the builder;
never author them as pages.

Every slot is `object-fit: cover` — the image is scaled to fill and the overflow
is **cropped from the centre**. A square image in a tall slot loses over half its
width. That is why images "don't fit".

| Artifact | Slot | Box | Ratio | Ask Gemini for |
|---|---|---|---|---|
| Carousel | cover panel | 476 × 1102 px | 0.43 (≈3:7) | **9:16** |
| Carousel | `trade` page | 404 × 604 px | 0.67 (2:3) | **3:4** |
| One-pager | photo column | 470 × 1350 px | 0.35 (≈1:2.9) | **9:16** |
| Report | cover hero | 5.84 × 2.05 in | 2.85:1 | **16:9** |
| Report | `accent:` band | 1700 × 520 px (3.27:1) → 7.0 × 2.2 in box (3.18:1) | see §3.5 | **16:9** |

Gemini emits only standard ratios, so **none of these match exactly** and every
image gets cropped. Two rules make that survivable:

1. **Compose for the centre band.** Ask for the subject in the middle with
   generous empty space on the axis that will be cropped — top and bottom for the
   wide report bands, left and right for the tall carousel and one-pager panels.
2. **Steer the crop with `imagePos`.** It is a CSS `object-position`: `50% 30%`
   keeps the upper-middle, `50% 70%` the lower.

**Then look at the render.** Build, open the output, adjust `imagePos`, build
again. One pass of that is the difference between fitting and not, and it is not
optional.

### 4.1 The imagery brief — written before anything is built

**Standing step, not a conditional one.** After the master is synthesized and
audited, and before any collateral is built, work out what images the piece needs
and write the prompts to `markets/<m>/collateral/image-brief.md`. Skipping it is
how a deck ends up with a cover photo and five bare text pages, and how a market
folder reaches render day with an empty `media/`.

One block per image:

```markdown
## 1. Carousel cover
file:     home-services-cover.png      ← save the Gemini export here, in markets/<m>/media/
slot:     carousel cover panel · 476×1102 · request 9:16
imagePos: 50% 45%

PROMPT
A flat editorial illustration of a residential HVAC condenser unit beside a
suburban house wall, drawn in clean geometric line work. Bright green (#0FA97C)
for the main masses, deep green (#0A7A58) for shading only, near-black linework
(#16181A), on a flat bone background (#FCFAF6). No amber, no gold, no brass, no
warm accent of any kind. Subject centred with
generous empty background to the left and right. Uniform flat background to all
four edges. No text, no lettering, no people, no logos, no charts, no vignette,
no drop shadow, no edge fade. 9:16 portrait.
```

**The prompt rules, every time.** Each exists because breaking it produced an
unusable image:

- **Palette, always named:** bone `#FCFAF6`, bright green `#0FA97C` for masses,
  Deal Green `#0A7A58` for shading, ink `#16181A` for linework — and say **no
  amber, no gold, no brass** out loud, because "sparingly" still gets you gold.
  (Carta, 2026-08-08 — amber, honey and the jade block are RETIRED, as is the
  whole green-black era before them. **Their hexes are deliberately not repeated
  here:** DESIGN.md §2 is the one graveyard, and a retired hex quoted in a live
  file is a retired hex a session can copy. If a prompt you are copying names a
  colour that is not in §4, it predates the current palette. `DESIGN.md` is the authority; this list must match its §4,
  and `npx tsx scripts/studio/art-prompt.mts "<subject>"` prints the block
  straight from the tokens so it cannot drift.) A model told "on-brand" invents
  a brand.
- **Flat editorial illustration.** Not photorealistic, not 3D, not stock-photo.
- **Ban in every prompt:** text, lettering, numbers, people, faces, logos,
  charts, graphs.
- **Ban baked-in effects:** vignette, edge fade, gradient background, drop
  shadow, border, frame. The layout applies its own framing; art that arrives
  pre-faded prints as a smudge.
- **Uniform flat background to all four edges** — this is what makes the crop
  survivable.
- **State the aspect ratio** from the table above.
- **Name the composition margin** — which side carries the empty space, so the
  crop takes background rather than subject.

Photographs are different. Generated *illustration* is fine because it is
obviously illustration; a photograph that implies something happened is not.
**Real or none.** Never AI-generate or alter a photo of Paul — the headshot is
`founder-portrait.jpg`, the walking shot `founder-walking.webp`, and those are
the only photos of him that exist.

---

## 5 · Applies to all three

- **Never hand-roll a layout.** All three builders import `house/tokens.ts`;
  that shared import is the only reason the surfaces match. Output looking wrong
  means the spec is wrong.
- **Palette** bone `#FCFAF6` · ink `#16181A` · Deal Green `#0A7A58` · mint
  `#A8F0CE` on dark · the flat band `#131512`. Radius 0 except buttons and
  inputs at 10px; framed things wear four ink corner handles. **Type** Source
  Serif 4 / Schibsted Grotesk / IBM Plex
  Mono. If the output is not that, it did not come from a builder. There is no
  warm colour in this system: amber and honey were retired on 2026-08-08 and
  have no replacement.
- **Output law.** Always `--out markets/<m>/collateral/<slug>/$(date +%F)` — or
  `.../decks/<slug>/$(date +%F)` when the artifact is client-direct rather than
  postable. The bare default is a flat `./collateral` at the studio root: it
  overwrites the last build AND files it outside its market.
- **Filing law.** `collateral/` is posting content, anywhere it can be posted —
  a carousel files there whole, PDF + page JPGs + caption together, because they
  are one post. `decks/` is client-direct material for a named acquirer and is
  never posted. Ask before filing when it is not obvious.
- **Slug law.** One artifact, one slug. `home-services-teardown` is the
  carousel; `home-services-market-assessment` is the report.
- **Markdown hazards.** Never `~` for "approximately" — GFM reads paired tildes
  as strikethrough. Never end a sentence immediately after a bare figure
  (`…drain/sewer $59.`) — the auditor tokenises the full stop into the number. A
  rounded figure is a different figure.
- **Imagery.** Real photos or none; generated illustration is fine where it is
  obviously illustration. Never AI-generate or alter a photo of Paul.
- **Write the imagery brief before anything visual**, to
  `markets/<m>/collateral/image-brief.md`, sized to the slot tables above.

---

## 6 · What the guard rails now cover

**`verify-spec.mts` exists as of 2026-07-29.** For two days `CLAUDE.md` named it
and it was not in the repo, which is worse than naming nothing — the rule read as
enforced and nothing was enforcing it. It now checks that every figure reaching a
page appears in the master or in the master's `## Derivations`, and flags any page
carrying a figure with no `source:` line.

```
npx tsx $REPO/scripts/studio/verify-spec.mts markets/<m>/specs/<name>.deck.mts
```

With no `--against` it finds `markets/<m>/master.md` two levels up, which is the
layout, so the common case needs no flag.

**A clean verify-spec is not a clean bill of health.** It proves the spec is
faithful to the master. It cannot tell you the master is right — a
faithfully-carried fabrication passes here exactly as it passes `audit.mts`. Job
2, verification against primary sources, is the step that catches that.

**What it still cannot see:** figures on the cover or the closer, where the format
gives no `source:` slot at all. Those are your eyes.


---

## 7 · VOICE — `voice-check.mts`

**Added 2026-08-03**, after a deck that passed `audit.mts` and `verify-spec.mts`
and still failed. Paul: *"I'm just confused on what the actual message is… we're
asking firms to trust us to go against banks and auctions. Just use plain
language throughout and be thorough and explanatory. Too much jargon."*

```
npx tsx $REPO/scripts/studio/voice-check.mts markets/<m>/specs/<name>.deck.mts
npx tsx $REPO/scripts/studio/voice-check.mts markets/<m>/specs          # whole folder
```

Four checks, on every string that reaches a page and on the caption:

| Check | What it catches |
|---|---|
| **NO MESSAGE** | the spec header does not state, in one sentence, what the piece is for. Exit 2 — this is the one that matters. |
| **JARGON** | practice shorthand a principal would have to translate: `EV/EBITDA`, `P/E`, `RPOs`, `comp set`, `tuck-in`, `platform parent`, `add-back`, `dry powder`, `re-rate`, `LOI`, `QoE`, `NAICS`… Each carries the plain-English replacement. |
| **FILLER** | consultant vocabulary — `leverage`, `utilize`, `robust`, `seamless`, `synergies`, `in order to`, `solutions`. |
| **STIFF / LONG** | constructions that only work on the page, semicolons in display copy, and any sentence over 32 words. |

`EBITDA`, `revenue` and `multiple` are deliberately **not** flagged. The reader
knows them, and a checker that cries wolf gets ignored.

**What it cannot do, and this is the important part: it cannot tell you whether
the writing sounds human.** It finds shorthand, filler and long sentences. It
cannot find a sentence that is short, plain, jargon-free and still lifeless.
Step 8 above is not decoration — read the copy aloud before it renders. That is
still the actual test, and this only clears the floor beneath it.


---

## 8 · SURFACES AND ART — `design-check.mts`, and the art guard

Both added 2026-08-03, after one build shipped with three trade pages missing
their illustrations and a cover CTA that was unreadable on the light bookend.
Neither failure raised an error. Paul caught both by eye.

### Requested art that does not resolve now FAILS the build

`build-deck.mts` and `build-onepager.mts` used to print
`[deck] image not found: trades/roofing.png` and carry on to a `✓`. A warning
above a success line is a warning nobody reads. They now collect every miss and,
after the success line, print the list and **exit 3**.

```
✗ 3 image(s) the spec asked for could not be found:
    trades/roofing.png
    trades/garage-doors.png
    trades/electrical-ev.png

The pages that wanted them rendered WITHOUT art. Nothing above is postable.
```

A page with **no `image` key at all** is untouched by this — the teardown's
pest-control page is deliberately text-only, and omitting the photo on a
one-pager is a real format. This only fires when a spec asks for a file that is
not there. `--allow-missing-art` overrides it for a deliberate dry run.

### Every block colour needs a paper counterpart

```
npx tsx $REPO/scripts/studio/design-check.mts
```

Any cover or closer rule coloured with a block-only token — mint, darkInk, darkSub —
must have a matching `.bk-lt` override. Miss one and the light bookend renders
that element at roughly 2.8:1 on bone, which `DESIGN.md` §4 warns "does not show
up in a diff or in a screenshot you are not squinting at."

It proves a decision was made for the light surface. **It does not prove the
colour is right.** Render both bookends and look at both. Step 7 exists because
this check cannot replace it.
