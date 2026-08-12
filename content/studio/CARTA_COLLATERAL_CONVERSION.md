# Phase 2 — move the collateral onto CARTA

**A work order for one Cowork session, opened on the SMBx repo** (not on
`~/Documents/smbx-studio` — everything you change is repo code).

The public site was rebuilt in the Carta language on 2026-08-07/08. The
collateral renderers were deliberately left behind, and `DESIGN.md` carries an
interim box saying so. This document is how that split gets closed. When you
are done, a deck, a one-pager, a report and an OG card all look like
smbx.ai, and the interim box is gone because it is no longer true.

Everything below was verified against the repo on 2026-08-08. Where a value is
stated, it came out of `house/tokens.ts` or out of the shipped site — none of
it is remembered or inferred. **If you find this document disagreeing with the
code, the code wins and this document is the bug.**

---

## 0. Two things are already done — do not rebuild them

A previous pass left you more than the doc history suggests. Check before you
build anything.

1. **The tokens exist.** `house/tokens.ts` already exports `CARTA`,
   `CARTA_TYPE`, `CARTA_DISPLAY_WEIGHT` (550) and `CARTA_HANDLE`
   (`{size: 8, offset: -4, sizeSmall: 7, offsetSmall: -4}`), sitting beside
   `LEDGER`. You are not choosing a palette. You are changing which one the
   renderers import.

2. **The fonts are solved.** `CARTA_TYPE`'s own comment used to say phase 2
   was blocked until `@fontsource` packages existed for Source Serif 4 and
   Schibsted Grotesk. **That blocker is cleared** —
   `server/services/fontEmbeds.ts` exports `cartaFontFaceCss()`, which inlines
   Source Serif 4 (variable, 200–900), Schibsted Grotesk 400/500/600/700 and
   IBM Plex Mono 400/500 as base64 `@font-face` rules. It is already proven in
   production by the practice market-map PDF.

   The renderers currently call `fontFaceCss()` (the Ledger set: Fraunces,
   Inter, Plex). **Swap the call, not the mechanism.** Never let a renderer
   reach the Google Fonts CDN — Railway blocks it and the Docker image carries
   only Noto, so a CDN link renders as typewriter mono in production. That has
   already happened once.

---

## 1. The exact conversion surface

Six files carry Ledger values. Nothing else does.

| File | What it imports today | Job |
|---|---|---|
| `house/deck.ts` | `LEDGER, TYPE, DISPLAY_WEIGHT, MINT_RING, GREEN_HALO, blockBackground, rgba` | The carousel grammar — `deckPages`, `deckCss`, `deckDocument`, and the four page kinds `numeral` · `statement` · `diagram` · `trade` |
| `scripts/studio/build-deck.mts` | `LEDGER, TYPE` + `fontFaceCss` | Carousel CLI |
| `scripts/studio/build-onepager.mts` | `LEDGER, TYPE, blockBackground` + `fontFaceCss` | Single-image post CLI |
| `scripts/studio/build-report.mts` | `LEDGER, REPORT, TYPE, blockBackground` + `fontFaceCss` | Long-form report CLI |
| `scripts/studio/build-og-card.mts` | `LEDGER, REPORT, blockBackground` + `fontFaceCss` | 1200×630 link-preview card |
| `content/studio/DESIGN.md` | — | The law that travels to every workspace. Rewritten LAST (§6). |

Four more carry it as PROSE inside image prompts — see §1a, and do not skip
them or the pictures stay Ledger.

Plus one gate: `house/__tests__/design.test.mts` (see §6).

### 1a. The artwork prompts — a second surface, easy to miss

Converting only the renderers leaves you with Carta layouts holding
**Ledger-coloured pictures**, because the palette also travels into
image-generation prompts. Three places state it in prose, and prose does not
get caught by a token swap:

| Where | What it says today | Job |
|---|---|---|
| `house/tokens.ts` → `brandPaletteLines()` | Builds the palette lines from `LEDGER`, naming amber, honey, the jade block — and asserting *"nothing in this system is near-black"*, which is exactly backwards for Carta | Feeds `server/services/deckDesigner.ts` (the Claude deck designer's brand contract) |
| `house/tokens.ts` → `artworkPaletteClause()` | `bone … deep green …` — both values survive the move, so this one needs checking, not rewriting | Image-prompt clause |
| `server/services/artworkService.ts` (~line 49) | Hardcodes `"one small brass-gold accent ${LEDGER.brass}"` into the Gemini prompt | Generated story artwork |
| `scripts/studio/briefs/site-hero.image-brief.md` | *"amber #E8A62B for small accents only"* | A worked image brief |

Rewrite these to the Carta palette: green as the dominant colour, ink
outlines, bone ground, **no amber and no brass-gold accent at all**, and drop
the "nothing is near-black" clause — Carta's band is `#131512`.

`brandPaletteLines()` carries a note worth heeding: the deck cache key hashes
the prompt, so editing it invalidates every cached deck. On a palette change
**that is the correct outcome** — a cached deck is a deck in the old colours.

(`artworkService.ts` is app-side. Unlike `researchComposer.ts` it is worth
doing anyway, because its prompt text is what a local session copies when
briefing Gemini by hand.)

**Out of scope, deliberately:** `server/services/researchComposer.ts` still
holds 12 `LEDGER` references. That is the APP's Studio composer, and Studio is
retired from the app chrome (`STUDIO_IN_APP = false`). The practice builds
collateral from the local CLIs. Leave it in Ledger; converting it is dead work
unless Paul reopens Studio. Say so in your summary rather than silently
skipping it.

---

## 2. The translation, token by token

Verified against both exports. **Six values do not move at all** — the accent
survived the restyle intact, which is why the conversion is smaller than it
looks.

| Role | LEDGER (now) | CARTA (target) | |
|---|---|---|---|
| Page canvas | `bone #FFFFFF` | `bone #FFFFFF` | white since 2026-08-12 (was #FCFAF6) |
| Headline ink | `ink #16181A` | `ink #16181A` | unchanged |
| The accent | `green #0A7A58` | `green #0A7A58` | unchanged |
| Accent hover | `greenHover #086348` | `greenHover #086348` | unchanged |
| Chip fill | `greenTint #DFF5EC` | `greenTint #DFF5EC` | unchanged |
| Accent on dark | `mint #A8F0CE` | `mint #A8F0CE` | unchanged |
| Body text | `slate #5A6169` | `body #4A4F54` | cooler, deeper |
| Captions / sources | `muted #83898F` | `muted #7C8187` | |
| Hairline | `hair #EAE5DC` | `hair #E4DFD3` | |
| Heavier divider | `rule #DED8CC` | `chipBorder #D8D3C6` | nearest role |
| Reading text on dark | `ivory #F2FBF6` | `darkInk #F4F5F1` | |
| **The dark band** | **`dark #0A6A4C`** (saturated jade) | **`dark #131512`** (flat near-black) | **the big one** |
| Vivid highlight | `jade #0FA97C` | `greenBright #0FA97C` | same hex, rare use only — never small text |
| **Warm on light** | **`brass #E8A62B`** | **— none —** | **DELETED** |
| **Warm on block** | **`honey #F5C452`** | **— none —** | **DELETED** |

New roles Ledger had no equivalent for, all real `CARTA` keys:
`boneAlt #F9F7F1` · `panel #F3F0E9` · `white #FFFFFF` (cards) ·
`darkSeam #2A2E29` · `darkPlate #22261F` (label plates) · `darkSub #D7DBD2` ·
`darkMuted #ABB2AB` · `darkLegal #8A9088` · `darkBtnBorder #4A4F44`.

### Type

| | LEDGER | CARTA |
|---|---|---|
| Display | `'Fraunces', Georgia, serif` @ **545** | `'Source Serif 4', Georgia, serif` @ **550** (600 for card titles) |
| Working | `'Inter', -apple-system, sans-serif` | `'Schibsted Grotesk', -apple-system, sans-serif` |
| Mono | `'IBM Plex Mono'` | `'IBM Plex Mono'` — unchanged |

`REPORT.body #3F464C` stays as-is: long-form reading wants more contrast than a
slide, and the site's own report pages already use that exact ink.

---

## 3. The grammar, not just the colours

Swapping hexes alone produces a Ledger layout in Carta colours, which will look
wrong and you will not be able to say why. These are the shape rules:

- **Radius 0.** Everywhere. Cards, panels, image frames, plates — all square.
  The ONLY exceptions are buttons and inputs at 10px. Ledger's 12–16px cards
  are the single loudest tell that a surface did not convert.
- **Corner handles replace curved crests.** The house gesture is now four
  ink squares, `CARTA_HANDLE.size` at `CARTA_HANDLE.offset` (8px at −4px; 7px
  at −4px on small cards). They go on framed things — cover panels, image
  frames, cards. On a dark surface they are `darkInk`, not ink.
- **The dark band is FLAT.** No texture, no glaze, no halo, no gradient. This
  is the biggest single change and it deletes machinery: the Ledger block was a
  composite built by `blockBackground(textureUrl)` — an 0.84 glaze over the
  blackbleed texture. Carta bands are `background: CARTA.dark` and nothing
  else. Every `blockBackground()` call in the four builders goes away. Do not
  keep the texture "for depth."
- **One accent, no jewelry.** Brass bars, brass rules, honey numerals and the
  brass stat tab are gone. Where Ledger put a brass bar under a big numeral,
  Carta puts a **4px × 52px green bar, 10px below the numeral** — that is the
  live site's stat treatment, lifted from the About page's proof trio, not
  invented for you.
- **The kicker** is an 8px green square + Plex Mono 12.5px at 0.16em tracking
  in `muted`. Same construction on light and dark; on dark the label reads
  `darkMuted`.
- **Cards** are `white` with a 1px `ink` border, square, wearing handles.
  Hairline separators are `hair`.
- **THE BUTTON LAW: green is NEVER a resting fill.** Primary is ink-on-light
  or bone-on-dark; green appears on hover, on chips, on kickers and on links.
  A green button is the fastest way to make collateral look off-brand while
  every individual hex checks out.

**Keep:** the mint-ringed headshot disc (mint is Carta's on-dark accent, so it
survives untouched), the byline construction, the rasterised PDF path in
`build-deck.mts` (screenshot each page at 2× and rebuild the PDF as flat
images — vector gradients get seamed by Preview and LinkedIn's rasteriser),
and every slot dimension.

---

## 4. What must NOT change

- **FORMATS.md is untouched.** It owns the container: which builder, which
  fields, and the exact pixel slot each image lands in. This conversion changes
  the LOOK, never the shape. If you find yourself editing a slot dimension,
  stop — you have wandered out of scope.
- **THE LINE**, the attribution law (always "led or co-led"; "selected
  transactions"; the shield travels with the names; employers NAMED on client
  surfaces), the citation law (a rounded figure is a different figure;
  conflicting sources keep both), real-photos-only, and the headshot law all
  govern exactly as before. None of them is a design rule and none of them
  bends for a layout.
- **`LEDGER` is retired, not deleted.** Leave the export in `house/tokens.ts`
  and record it in DESIGN.md's dead table with its hexes. It is the rollback
  path, and the dead table is what lets a future session catch itself using
  `#E8A62B`.

---

## 5. Traps — each of these RENDERS rather than errors

None of them throws. All of them ship silently if you are not looking.

1. **`background: DARK url(texture)` ignores the colour.** The texture image
   sits above the colour in the background stack, so swapping the token to
   `#131512` while leaving the texture layer in place changes nothing on
   screen and shows a clean diff. Delete the texture layer, don't re-point it.
2. **The variable names lie.** The site's CSS holds Deal Green in variables
   called `--pd-coral*` — a historical name kept to avoid churn. `--pd-coral`
   is green. Do not "fix" it, and do not read a coral value out of it.
3. **Handles sit OUTSIDE their frame.** They are at −4px, so any
   `overflow: hidden` on the framed element shears them off. Clip the texture,
   never the frame.
4. **An absolutely-positioned ornament paints above static text.** If you add
   a dot field behind copy, the copy needs its own stacking context or the
   dots land on top of the words.
5. **Fonts must be embedded, never linked** — see §0.2. The failure mode is
   silent typewriter mono in production, correct fonts locally.
6. **The retired hexes are the tell.** If `#E8A62B`, `#F5C452` or `#0A6A4C`
   survives anywhere in a renderer, that surface did not convert. Grep for
   them before you call it done.

---

## 6. Order of work, and how you know you are finished

Convert **one builder end to end and look at its output** before touching the
others. `build-onepager.mts` is the smallest and the fastest to judge.

1. `house/deck.ts` + `build-deck.mts` — carousel (the four page kinds).
2. `build-onepager.mts` — do this one FIRST in practice; it is listed second
   only because the deck is the bigger job.
3. `build-report.mts` — long-form; watch the GFM tables (hairline, mono
   uppercase heads) and the cover.
4. `build-og-card.mts` — the link-preview card.
5. **The artwork prompts (§1a)** — `brandPaletteLines()`,
   `artworkPaletteClause()`, `artworkService.ts`, and the worked image brief.
   Do this before you judge the finished decks: artwork generated under the
   old clause will make a correctly-converted deck look wrong.
6. **`content/studio/DESIGN.md`** — rewrite §1–§10 in Carta and **delete the
   interim box at the top**, which exists solely to warn that this conversion
   had not happened. Move `LEDGER` into the dead table with its hexes. Do not
   restate FORMATS.md's slot dimensions — the gate actively fails on that,
   because two copies of a measurement is how one goes stale.
7. **`house/__tests__/design.test.mts`** — its `TOKENS` map is built from
   `{...LEDGER, ...REPORT}`; flip it to `{...CARTA, ...REPORT}`. Two
   assertions exist only to police the interim split ("DESIGN.md declares the
   interim site/collateral split", "names both token exports") and should come
   out with the box they describe. The gate's real job survives: every hex in
   DESIGN.md is a real token, every token is documented, no retired hex appears
   as live guidance, and the live stylesheet still matches.

**Done means all four of these, not just the first:**

- `npm run test:design` passes (it was 77/77 before you started).
- Each of the four builders runs and produces a file. Worked specs to render:
  `scripts/studio/decks/elevator-teardown-1.deck.mts`,
  `scripts/studio/decks/2-open-seats.post.mts`, and
  `scripts/studio/reports/commercial-mep-buy-side-assessment.md`.
- You have **looked at every output** beside smbx.ai. Same serif, same green,
  same flat black band, same square corners, same handles. The gate checks
  values; only your eye checks that it looks like the practice.
- `grep -rn "E8A62B\|F5C452\|0A6A4C" house/ scripts/studio/ server/services/artworkService.ts`
  returns **only** the `LEDGER` definition block in `house/tokens.ts` and its
  neighbouring comment. Those two stay by design (§4 — retired, not deleted);
  everything else is a miss. As of 2026-08-08 that grep also returns
  `scripts/studio/briefs/site-hero.image-brief.md` and the brass accent in
  `artworkService.ts`, both of which are yours to fix (§1a).

Report what you did NOT convert (researchComposer.ts, per §1) rather than
leaving it to be discovered.
