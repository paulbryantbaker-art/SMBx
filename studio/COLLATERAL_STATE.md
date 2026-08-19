<!-- Written 2026-08-15. Read this BEFORE building any collateral.
     It is the state of the renderers; DESIGN.md is the look and FORMATS.md is
     the container. This file exists because the other two described a system
     that was two-thirds true. -->

# Collateral — what is on Carta, what is not, and what to do about it

Paul, 2026-08-15: *"i'll let cowork remake any collateral that needs remaking. I
just want to be sure that any docs or collateral made in app are using the same
DL."*

So the division is settled: **you remake collateral; the app is prevented from
shipping anything off-language.** This file tells you what state each renderer
is actually in, so you are not guessing — and so you do not "fix" something the
wrong way.

---

## 1. Read this first: the law that keeps getting broken

**Never hand-roll a layout.** If a one-pager comes out in the wrong palette, the
fix is **not** to write HTML that looks Carta. The fix is to convert the
*builder*, once, so every future one-pager is right.

This is FORMATS.md law 1 and it is the single most common drift. A hand-rolled
document looks correct on the day and is wrong differently every time after. A
converted builder is right forever and can be checked by a test.

**The worked example is the report.** On 2026-08-15 `build-report.mts` and the
app had two implementations of the same artifact in two different design
languages. The conversion was:

1. Lift the grammar — cover, stylesheet, document skeleton — into `house/`
   (`house/report.ts`), keeping it **pure**: no fs, no db, no env, no clock.
   Images arrive as data URIs through an assets parameter, so the local builder
   resolves them off disk and the app resolves them from its database, and
   neither has to care.
2. Point both consumers at it.
3. Add `assertCarta` to the builder.
4. Switch the font embed to `cartaFontFaceCss()`.

Step 4 is not optional and is the easiest to miss — see §4.

---

## 1A. The figure layout — the one-pager default (2026-08-18)

Paul: *"Def full axis correction! Let's lock that in for carousel and single
image formats… don't remove the other types, but this can be the default."*

- `build-onepager.mts` now defaults to `layout: 'figure'`: the full-length
  founder cutout (`assets/brand/founder-standing.png`), copy wrapping the
  silhouette, φ geometry, Fibonacci spacing, the SANCTIONED green bloom on
  dark, bright-white CTA. The dark default is the **C treatment** (2026-08-18,
  after the first posted card read too dark): bloom aimed at the figure +
  a 1.16/1.05 exposure lift applied in the renderer, never the asset —
  FORMATS §2.0 carries the numbers, `pop: false` opts out. A spec naming `image` with no `layout` still
  renders the old split — that inference is what keeps `rebuild-all.sh` from
  silently changing the back catalogue. FORMATS §2.0 has the full contract.
- **The carousel figure cover is NOT built yet** — it lives in
  `house/deck.ts` (Claude Code's side; parity-guarded). The contract is
  written: `FIGURE_COVER_WORK_ORDER.md`. Until it lands, decks keep their
  current covers.
- **A no-Chromium session can still ship a figure one-pager**:
  `scripts/studio/figure-fallback.py` — same spec, live tokens, converted
  repo fonts, PIL raster. Subordinate by design: its BUILD.txt names itself a
  fallback and the next `build-onepager.mts` render replaces it. First use
  2026-08-18 (`day-four-questions`, posted).

## 1C. The figure CAROUSEL — `figure-deck.py` (2026-08-19)

The one-pager grounds have a carousel sibling. `scripts/studio/figure-deck.py`
renders a deck spec with the figure-card ground on the COVER and CLOSER and the
house light grammar on every page between — the bookend law, applied. Both
grounds work: `--ground monolith-dark|portal-light|both`.

**Its header carries eight measured corrections** and they are the file's real
value; each one is a thing that looked right in the abstract and failed on the
page (logo lost in the corner, hook colliding with the figure, a numeral
stranded from its own sentence, a closer that mirrored the cover, a round frame
that cropped Paul's neck off). Read them before touching a number.

Same standing as `figure-fallback.py`: a PIL raster, subordinate to
`build-deck.mts`, which does not yet know this family — `FIGURE_COVER_WORK_ORDER.md`
is the engine change that would retire it.

## 2. State of the four builders

| Builder | Makes | Grammar | Faces | Guard |
|---|---|---|---|---|
| `build-deck.mts` | LinkedIn carousel | `house/deck.ts` — Carta | Carta | yes |
| `build-report.mts` | long-form PDF report | `house/report.ts` — Carta | Carta | yes |
| `build-onepager.mts` | single-image post | Carta | Carta | yes |
| `build-og-card.mts` | link-preview card | Carta | Carta | yes |

**All four are on Carta as of 2026-08-15** (Paul: *"no ledger at all. carta"*).
`DESIGN.md` carries the same table and `npm run test:design` derives it from the
source, so it cannot go stale — it previously claimed all four when two were
still Ledger, as plain prose that nothing checked.

**What the last two lost, so you recognise the old output if you see it.** These
were not remapped colour-for-colour, because Carta has no slot for most of what
they carried:

- **Amber and honey are gone**, not replaced. Carta has exactly one accent, so
  every kicker takes green on light and mint on the band.
- **The boardroom texture is gone.** The band is a flat colour now. Note the
  trap if you ever touch a background stack: a texture image sits ABOVE the
  colour and wins outright, so swapping the token while leaving the texture in
  place renders *identically* and shows a clean diff.
- **The radial glazes are gone.** A wash over a flat ground just makes a
  slightly different flat ground, and adds a transparency group the
  renderer-proof law forbids.
- **Pill rules and rounded image frames are square**, and the drop shadows are
  deleted. A 99px pill on a 5px bar was the single most visible Ledger tell.
- `build-og-card.mts` also had its **three typefaces hard-coded as string
  literals**, so no font change could ever have reached it. That is a second,
  quieter way to be stranded on a retired system — and it looks nothing like a
  palette bug.

**The model briefs moved too**, which matters because a model follows the last
palette it was given, faithfully, forever. `brandPaletteLines()` in
`house/tokens.ts` (which writes the app's deck-designer contract) and the Gemini
artwork clause were both still Ledger — the artwork prompt was asking for *"one
small brass-gold accent"* on every illustration.

## 3. The app can no longer ship off-language

You do not have to police the app. `server/services/paletteGate.ts` sits on
every artifact-producing function there — report, both carousel paths, the
single-image card, the announcement card, the post card. A document carrying a
retired hex or a retired typeface **throws** rather than rendering, and the
error names the local builder that produces that artifact correctly.

Two consequences worth knowing:

- **The app's Ledger cards now fail their downloads.** That is intended: those
  artifacts are yours now.
- **The app's Claude-designed carousel is now briefed in Carta.**
  `deckDesigner.ts` has a model write the deck HTML, and that path *wins* over
  the house grammar at every caller — so while its brand contract said Ledger,
  the app's default carousel was the designed Ledger one. It now specifies the
  flat band, the Carta faces and the single accent, and it names the retired
  faces and colours as **rejects** rather than merely omitting them: a model
  handed a palette with two accents uses two, and one handed no instruction
  reaches for whatever it has seen most.

---

## 4. The trap that cost a week, so you do not repeat it

`house/deck.ts` asks for `CARTA_TYPE` — **Source Serif 4** and **Schibsted
Grotesk**. Both consumers were embedding `fontFaceCss()`, the *Ledger* font set:
Inter, Fraunces, IBM Plex Mono. Neither Carta face was in the document.

Every carousel built since the Carta restyle rendered its display type in the
CSS fallback and its working type in the system sans. On a Mac it silently
borrowed whatever was installed; in the app's container it fell all the way
through to Noto.

**It never errored and never appeared in a diff, because a missing `@font-face`
is a substitution, not a failure.** And it was wrong *identically on both
sides*, so comparing the two renderers to each other would have passed it.

The general lesson: **a shared grammar module is not a shared output.** The
whole seam has to match — grammar, tokens, fonts, guard. When you convert a
builder, check all four, and check the *rendered* document rather than the
source, because a colour can arrive through a function three files away.

---

## 5. Client documents: same house, one extra line

There is **no client template**. A client deliverable is the house document plus
`for:` in the cover block:

```
<!--cover
byline: Paul Baker
role:   smbX.ai · Buy-side corporate development
for:    Ridgeline Capital Partners
-->
```

It renders as a plated `PREPARED FOR / {name}` at the right-hand end of the
cover's byline rule, so the cover reads *by … / for …*. Omit the key and nothing
renders — a published report cannot grow a client's name by defaulting.

Three rules, all of which matter more than the mechanic:

1. **A name, not a mandate.** THE LINE's engagement-confidentiality rule is not
   suspended because the client is the reader. Hold period, check size, equity
   available, leverage tolerance — none of those reach a page. **Nothing
   mechanical catches this:** no figure in a mandate is uncited, so it would
   pass the citation audit perfectly clean. It is on the person writing.
2. **`for:` makes the document client-direct, so it files to `decks/`**, never
   `collateral/`. Collateral is publishable anywhere; a document naming a client
   is not.
3. **It is on the cover, not the footer and not a watermark**, so a reader who
   opens the PDF at page 4 and forwards it can still see who commissioned it.

---

## 6. Where to check, in order

1. `FORMATS.md` — which builder, which fields, what size the image slot is.
2. `DESIGN.md` — the look: palette, type, layout grammar, the dead-systems table
   with hexes. §2 of that file is how you catch yourself: a hex that is not in
   its §4 is not ours.
3. This file — what the renderers actually do today.
4. `house/tokens.ts` in the repo — **if a document and that file disagree, the
   file wins and the document is a bug.** Say so rather than working around it.

The gates, if you have a shell: `npm run test:design`, `npm run test:engine-parity`.
