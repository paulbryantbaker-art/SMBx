# smbX colour palette — for Gemini image generation

**Generated from `house/tokens.ts`. CARTA, 2026-08-08.**
**Do not hand-edit — `npx tsx $REPO/scripts/studio/art-prompt.mts "<subject>"`
prints the current block straight from the tokens, which is the only copy that
cannot drift.**

**Was:** These are the exact values
the pages render with. Anything else will not match.

---

## 1 · Paste this before your subject sentence

```
PALETTE, STRICT. Flat solid background exactly #FCFAF6 with no gradient,
vignette, texture or drop shadow. Oxblood accent #B8431E. Bright accent #FF7D55.
NO amber, no gold, no brass — Carta has one colour. Near-black linework #16181A. Use no other colours: no
additional greens, no greys, no off-whites, no blues, no skin tones.

STYLE. Flat isometric vector illustration, 3/4 top-down view, clean geometric
shapes, even weight linework, no text, no lettering, no logos, no people, no
faces. Matte finish. No gloss, no gradients, no ambient occlusion, no cast
shadows, no lighting of any kind.

BACKGROUND. A single uniform fill, edge to edge, exactly #FCFAF6. The drawing
may touch the frame; the background behind it must never vary — no vignette, no
texture, no drop shadow, no border, no darkening at the corners.

COMPOSITION. Centred with generous negative space. Nothing important within 8%
of any edge. Square, 2048 x 2048.
```

For a **landscape** image (report cover bands), swap the last paragraph for:

```
COMPOSITION. Wide landscape, 2752 x 1536, subject weighted to the lower two
thirds with clear space above for a title overlay.
```

The subject sentence goes FIRST, and concrete beats evocative every time.
"A residential air-conditioning condenser beside a house wall, with a round wall
thermostat above it" gets you the set. "The feeling of home comfort" gets you a
mood board.

## 1b · Then cut the background out — this is the important step

**A transparent PNG beats a matched background, and it retires the whole
problem.** With no baked background there is nothing to mismatch: the page bloom
runs behind the drawing, on bone and on ink alike, and no amount of palette
drift can produce a visible rectangle. Everything this document used to be about
— matching bone exactly, ARTWORK_LIFT, blooming the panel — was work to make a
rectangle disappear. Removing the rectangle retires all of it.

Gemini will not reliably emit transparency, so the flow is three steps:

1. Generate on the flat bone background from §1 (a flat, known colour is what
   makes the cut clean — this is why §1 still specifies it).
2. **Remove the background** and re-download as PNG.
3. Normalise (§5b). It preserves alpha, skips transparent pixels, and leaves
   soft edges blended so nothing fringes.

Measured on a real cut-out: 87% transparent, 1.8% soft edge, the rest snapped
exactly to palette.

**The covers no longer frame the art.** On light it sits directly on the bloomed
page. On ink it gets a soft bone glow behind it and no edge — a hairline or a
plate reads as a card and puts the rectangle straight back.

## 2 · The colours

| Role | Hex | RGB | Use |
|---|---|---|---|
| **Background — the one that matters** | `#FCFAF6` | 252, 250, 246 | The whole canvas, flat, edge to edge |
| Oxblood accent, dominant | `#B8431E` | 10, 122, 88 | Main masses — roofs, bodywork, large planes |
| Bright accent, highlight | `#FF7D55` | 15, 169, 124 | Secondary planes, lighter faces |
| ~~Amber~~ | **RETIRED 2026-08-08** | — | Carta has no warm colour and no replacement for one. See DESIGN.md §2. |
| Near-black, linework | `#16181A` | 22, 24, 26 | Structure, deep shadow, outlines |

Pure white `#FFFFFF` is allowed for highlight surfaces — window glass, van panels.

## 3 · Do NOT use — retired

the bright accent block, honey and ivory — all retired 2026-08-08; DESIGN.md §2 holds the hexes so this file does not have to
— the emerald ground, withdrawn 2026-08-06.

the green-black era's forest green, brass, bone and near-black — older still, and also in DESIGN.md §2.

Art generated with any of these will not match anything currently shipping.

## 4 · Why the current library doesn't match

| | R | G | B |
|---|---|---|---|
| `trades/homes.png` background, measured | 243 | 239 | 229 |
| Target `#FCFAF6` | 252 | 250 | 246 |
| **Short by** | 9 | 11 | **17** |

Two phrases caused most of it. The old prompt asked for a **"warm off-white"**
background — an instruction to drift warm, which it did — and for **"soft
ambient occlusion, gentle long shadows"**, which puts a gradient on the
background. A gradient cannot match a flat page at any brightness, however close
the average gets.

That is why the block in §1 says *flat solid*, names an exact hex, and forbids
shadows outright.

## 5 · Accepting the images — measure, don't eyeball

```bash
npx tsx $REPO/scripts/studio/art-prompt.mts --check assets/trades
```

Every corner of every PNG must read exactly **(252, 250, 246)**. If the four
corners differ from each other the model added a gradient, and the file is
unusable however close the average is — re-prompt, do not post-process.

**All ten files in the current library fail this check today.**

## 5b · Then normalise — the model cannot hit an exact hex

A diffusion model approximates; it does not fill. A test image generated from the
block in §1 came back with the background mean at rgb(250,248,241) — much closer
than the old library's rgb(243,239,229), but still short, and carrying **443
distinct background values across 67% of the frame**. The whole image used 30,846
colours. No prompt wording fixes that.

So the prompt gets it close, and this makes it exact:

```bash
npx tsx $REPO/scripts/studio/art-normalize.mts assets/trades
```

Every pixel within tolerance of a palette colour becomes that colour exactly.
Pixels further away are anti-aliased edges — real blends between two shapes — and
are left alone, because snapping those would put jaggies on every outline. On the
test image: bone 66.4%, bright accent 10.7%, ink 9.9%, green 5.0%, amber 2.1%, white 0.2%,
with 5.7% left as edges. Corner (251,248,243) becomes (252,250,246) and the check
passes.

**It is a quantiser, not an art director.** If the model painted the body bright accent
where the brief said Accent, this makes it *exactly* bright accent. Read the report it
prints — the percentages tell you whether the drawing used the palette the way
you asked.

When the whole set passes, set `ARTWORK_LIFT = 1` in `house/tokens.ts` and
delete its comment. That constant is a brightness bandage for the old art;
leaving it on would push corrected art *above* bone and give the same dingy edge
in the other direction.

## 6 · One background serves both light and dark

Do not commission a dark variant. The house has two grounds — bone `#FCFAF6`
and ink `#16181A` — and the same bone-backed art works on both: continuous
with the page on light, a deliberate bone plate against near-black on dark. A
dark-background version would have to guess the bloom behind it and be wrong in
every position.

## 7 · Files to regenerate

Everything in `assets/trades/`, as one set so nothing lands half-matched:

`homes.png` · `hvac-ac.png` · `plumbing-van.png` · `roofing.png` ·
`garage-doors.png` · `electrical-ev.png` · `elevator.png` ·
`service-van-commercial.png` · `service-van-dark.png` · `solar-house.png`

**Keep the filenames.** Every spec references them by name, and a rename is a
silent missing-art failure at build time.

---

*Do not retype these hexes anywhere. This file is generated; `art-prompt.mts`
prints the same block from the same tokens. A palette written down in two places
is a palette that will disagree with itself — which is exactly how the current
library ended up off by seventeen points of blue.*
