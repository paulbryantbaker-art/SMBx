# Rebuild imagery brief — the art blocking `rebuild-all.sh`

**Written 2026-08-18**, after the ONE CLONE move left this workspace with 0 rendered
PDFs and 0 page JPGs. `rebuild-all.sh` re-renders 15 of 18 specs; **three are blocked
on four missing images**, and they are listed here with paste-ready prompts.

This is a **rebuild artifact spanning two markets**, not a market's standing brief.
The standing briefs stay where they are — `markets/<m>/collateral/image-brief.md`.

---

## READ THIS BEFORE YOU GENERATE ANYTHING

**The existing elevator brief is on a retired ground and will reproduce the failure.**
`markets/elevator/collateral/image-brief.md` blocks 6, 7 and 8 already cover three of
the four images below — and every one of them asks for a background of **`#FCFAF6`**,
the Aurora/Ledger bone. Carta wants **`#FFFFFF`**. This is not cosmetic and it is not
a small drift:

```
carta-guard: 24 illustration(s) failing
  FAIL  assets/trades/hvac-ac.png    ground drifts: (252, 250, 246) on 100% of the border,
                                     want (255, 255, 255)
```

`(252, 250, 246)` **is** `#FCFAF6`. The entire house illustration library was generated
from a brief naming that ground, which is why 24 assets fail today and why all fifteen
home-services band photographs fail too. **Generating from the old brief adds a
twenty-fifth.**

Every prompt below was printed by `art-prompt.mts`, which reads the palette live from
`house/tokens.ts` and contains no hex literal at all. Do not hand-edit the PALETTE,
STYLE, NOTHING, BACKGROUND or COMPOSITION paragraphs — those are the house brief, and a
prompt transcribed by hand is a palette written down in two places. The subject line is
the only per-image part.

To regenerate any block, or to brief an image not listed here:

```bash
npx tsx $REPO/scripts/studio/art-prompt.mts "<subject sentence>" --slot carousel-cover
npx tsx $REPO/scripts/studio/art-prompt.mts --slots     # the slot list
```

**Accept by measurement, never by eye:**

```bash
npx tsx $REPO/scripts/studio/art-prompt.mts --check markets/elevator/media
```

**Illustration is allowed. Photography is real or absent.** Every image here is an
illustration. Never generate a photograph, and never a generated photograph of Paul.

---

## 1. Carousel cover — Elevator Teardown Nº1

```
file:     elevator-teardown-1-cover.png     → save to markets/elevator/media/
slot:     carousel cover panel · 476 × 1102 px (0.43) · request 9:16
imagePos: 50% 40%
spec:     markets/elevator/specs/elevator-teardown-1.deck.mts
```

**PROMPT**

```
a single closed elevator car door with a call button panel on the wall beside it

PALETTE, STRICT. Flat solid background exactly #FFFFFF (255, 255, 255) with no gradient,
vignette, texture, border or drop shadow. Bright green #0FA97C for the main masses. Deep
green #0A7A58 for shading. Near-black #16181A for linework. Pure white #FFFFFF only for
highlight surfaces — window glass, a van panel. NO amber, no gold, no brass, no warm
accent of any kind. Use no other colours: no additional greens, no greys, no
off-whites, no blues, no skin tones.

STYLE. Flat editorial vector illustration, isometric 3/4 view, clean geometric
shapes, even weight linework, matte. Not photorealistic, not 3D, not stock-photo.
No lighting, no gradients, no shading within shapes, no ambient occlusion, no cast
shadows, no gloss.

NOTHING IN THE FRAME. No text, no lettering, no numbers, no people, no faces, no
logos, no charts, no graphs.

BACKGROUND. A single uniform fill to all four edges, exactly #FFFFFF. The drawing may
touch the frame; the background behind it must never vary — no vignette, no edge
fade, no gradient background, no drop shadow, no border, no frame, no darkening at
the corners.

COMPOSITION. 9:16 portrait. The art is cropped FROM THE CENTRE into a 476 × 1102 px slot (0.43 (≈3:7)), so keep the subject centred with generous empty background to the LEFT and RIGHT; nothing important within 8% of any edge.
```

---

## 2. Carousel cover — Elevator Teardown Nº2

```
file:     elevator-teardown-2-cover.png     → save to markets/elevator/media/
slot:     carousel cover panel · 476 × 1102 px (0.43) · request 9:16
imagePos: 50% 40%
spec:     markets/elevator/specs/elevator-teardown-2.deck.mts
```

**PROMPT**

```
an elevator controller cabinet standing open, showing relay boards and wiring looms

PALETTE, STRICT. Flat solid background exactly #FFFFFF (255, 255, 255) with no gradient,
vignette, texture, border or drop shadow. Bright green #0FA97C for the main masses. Deep
green #0A7A58 for shading. Near-black #16181A for linework. Pure white #FFFFFF only for
highlight surfaces — window glass, a van panel. NO amber, no gold, no brass, no warm
accent of any kind. Use no other colours: no additional greens, no greys, no
off-whites, no blues, no skin tones.

STYLE. Flat editorial vector illustration, isometric 3/4 view, clean geometric
shapes, even weight linework, matte. Not photorealistic, not 3D, not stock-photo.
No lighting, no gradients, no shading within shapes, no ambient occlusion, no cast
shadows, no gloss.

NOTHING IN THE FRAME. No text, no lettering, no numbers, no people, no faces, no
logos, no charts, no graphs.

BACKGROUND. A single uniform fill to all four edges, exactly #FFFFFF. The drawing may
touch the frame; the background behind it must never vary — no vignette, no edge
fade, no gradient background, no drop shadow, no border, no frame, no darkening at
the corners.

COMPOSITION. 9:16 portrait. The art is cropped FROM THE CENTRE into a 476 × 1102 px slot (0.43 (≈3:7)), so keep the subject centred with generous empty background to the LEFT and RIGHT; nothing important within 8% of any edge.
```

---

## 3. Carousel `trade` page — Elevator Teardown Nº2

```
file:     elevator-route-book.png           → save to markets/elevator/media/
slot:     carousel `trade` page · 404 × 604 px (2:3) · request 3:4
imagePos: 50% 50%
spec:     markets/elevator/specs/elevator-teardown-2.deck.mts
```

**PROMPT**

```
a stack of building service records and a route clipboard on a workbench beside a governor

PALETTE, STRICT. Flat solid background exactly #FFFFFF (255, 255, 255) with no gradient,
vignette, texture, border or drop shadow. Bright green #0FA97C for the main masses. Deep
green #0A7A58 for shading. Near-black #16181A for linework. Pure white #FFFFFF only for
highlight surfaces — window glass, a van panel. NO amber, no gold, no brass, no warm
accent of any kind. Use no other colours: no additional greens, no greys, no
off-whites, no blues, no skin tones.

STYLE. Flat editorial vector illustration, isometric 3/4 view, clean geometric
shapes, even weight linework, matte. Not photorealistic, not 3D, not stock-photo.
No lighting, no gradients, no shading within shapes, no ambient occlusion, no cast
shadows, no gloss.

NOTHING IN THE FRAME. No text, no lettering, no numbers, no people, no faces, no
logos, no charts, no graphs.

BACKGROUND. A single uniform fill to all four edges, exactly #FFFFFF. The drawing may
touch the frame; the background behind it must never vary — no vignette, no edge
fade, no gradient background, no drop shadow, no border, no frame, no darkening at
the corners.

COMPOSITION. 3:4 portrait. The art is cropped FROM THE CENTRE into a 404 × 604 px slot (0.67 (2:3)), so keep the subject centred with generous empty background to the LEFT and RIGHT; nothing important within 8% of any edge.
```

---

## 4. Carousel `trade` page — home-services teardown preview

```
file:     hvac-condensers.png               → save to markets/home-services/media/
slot:     carousel `trade` page · 404 × 604 px (2:3) · request 3:4
imagePos: 50% 50%
spec:     specs/hs-teardown-preview.deck.mts
```

**PROMPT**

```
three rooftop air-conditioning condenser units in a row on a flat commercial roof deck

PALETTE, STRICT. Flat solid background exactly #FFFFFF (255, 255, 255) with no gradient,
vignette, texture, border or drop shadow. Bright green #0FA97C for the main masses. Deep
green #0A7A58 for shading. Near-black #16181A for linework. Pure white #FFFFFF only for
highlight surfaces — window glass, a van panel. NO amber, no gold, no brass, no warm
accent of any kind. Use no other colours: no additional greens, no greys, no
off-whites, no blues, no skin tones.

STYLE. Flat editorial vector illustration, isometric 3/4 view, clean geometric
shapes, even weight linework, matte. Not photorealistic, not 3D, not stock-photo.
No lighting, no gradients, no shading within shapes, no ambient occlusion, no cast
shadows, no gloss.

NOTHING IN THE FRAME. No text, no lettering, no numbers, no people, no faces, no
logos, no charts, no graphs.

BACKGROUND. A single uniform fill to all four edges, exactly #FFFFFF. The drawing may
touch the frame; the background behind it must never vary — no vignette, no edge
fade, no gradient background, no drop shadow, no border, no frame, no darkening at
the corners.

COMPOSITION. 3:4 portrait. The art is cropped FROM THE CENTRE into a 404 × 604 px slot (0.67 (2:3)), so keep the subject centred with generous empty background to the LEFT and RIGHT; nothing important within 8% of any edge.
```

---

## A fifth gap, which is a path bug rather than a missing file

`specs/hs-teardown-preview.deck.mts` also carries `bandImage: 'rooftop-units.png'`.
**That file exists** — at `assets/mep/rooftop-units.png` — but it is referenced bare,
and the resolver looks in `assets/` rather than walking its subfolders. The sibling
elevator spec gets this right by writing `mep/cooling-towers.png` with the prefix. So
the fix is one line in the spec, not a generation:

```
bandImage: 'mep/rooftop-units.png'
```

Left for Paul to make, because it is a spec edit on a preview artifact and nothing
here should quietly rewrite a spec it was not asked to touch. Note also that
`rebuild-all.sh` only pre-checks `image:` keys, so a missing `bandImage:` surfaces at
render rather than in the dry run.

---

## When they come back

1. **Measure, do not eyeball** — `art-prompt.mts --check markets/elevator/media`.
   The ground has to read `(255, 255, 255)` on the border, not `(252, 250, 246)`.
2. **File the prompt.** An image does not land in `assets/` without its prompt landing
   in `assets/PROMPTS.md` and a row in `assets/INDEX.md`. These four go to a market's
   `media/`, not to `assets/`, so that rule does not bind them — but the prompts are
   recorded here for the same reason.
3. **Build, open, adjust `imagePos`, build again.** Every slot is `object-fit: cover`
   and none of Gemini's ratios match the slot exactly. One pass of that is the
   difference between fitting and not.
4. Then `bash rebuild-all.sh --go --only elevator`.

## Still outstanding after these four

The **24 failing house illustrations** in `assets/` and the **15 failing home-services
band photographs** are a separate and larger job — they are why `dead-deal-economics`,
`hvac-2026-read` and `corp-dev-cost-sheet` all run text-only. Regenerating them against
the white ground would unblock imagery across the whole market. Not started; not
required for the rebuild.
