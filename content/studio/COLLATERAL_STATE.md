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

## 2. State of the four builders

| Builder | Makes | Grammar | Faces | Guard |
|---|---|---|---|---|
| `build-deck.mts` | LinkedIn carousel | `house/deck.ts` — **Carta** | Carta | yes |
| `build-report.mts` | long-form PDF report | `house/report.ts` — **Carta** | Carta | yes |
| `build-onepager.mts` | single-image post | its own — **LEDGER** | Ledger | **no** |
| `build-og-card.mts` | link-preview card | its own — **LEDGER** | Ledger | **no** |

**The bottom two produce retired-palette output today and nothing stops them.**
If you build a one-pager right now it comes out in Ledger — amber, brass,
Fraunces, the jade block — and the PDF will look wrong beside a report built the
same afternoon.

Until they are converted, one of two things is true and you must pick
deliberately:

- **Converting them is the work.** Follow §1's four steps. `house/onepager.ts`
  is the obvious name. This is the right answer if you are producing more than
  one.
- **You need a single one-pager today.** Build it and know the output is
  off-language, or render the same content as a one-page report instead —
  `build-report.mts` is on Carta and a short `.md` produces a clean single
  document. Never patch the palette by editing the builder's CSS in place for
  one post; that is the hand-roll wearing a disguise.

`DESIGN.md`'s notice carries this same table and `npm run test:design` derives
it from the source, so it cannot go stale. It previously claimed all four were
on Carta, which was false for two of them for a week.

---

## 3. The app can no longer ship off-language

You do not have to police the app. `server/services/paletteGate.ts` sits on
every artifact-producing function there — report, both carousel paths, the
single-image card, the announcement card, the post card. A document carrying a
retired hex or a retired typeface **throws** rather than rendering, and the
error names the local builder that produces that artifact correctly.

Two consequences worth knowing:

- **The app's Ledger cards now fail their downloads.** That is intended: those
  artifacts are yours now.
- **The app's Claude-designed carousel falls back to the house template.**
  `deckDesigner.ts` briefs a model to write the deck HTML and its brand contract
  is still Ledger. That path used to *win* over the house grammar at every
  caller, so the app's default carousel was the designed Ledger one. The gate
  now rejects it and the Carta template renders instead. Correct outcome,
  unfinished job — rewriting that contract in Carta is still open.

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
