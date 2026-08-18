# Artwork regeneration brief — for Gemini

**Written 2026-08-06.** Paste §1 into every image prompt, unchanged. Everything
after it is the reasoning and the checks, for you, not for the model.

---

## 1 · The prompt block — paste this verbatim

> **Palette, strict.** Flat solid background exactly **#FCFAF6** with no
> gradient, no vignette, no texture, no drop shadow and no border. Deep green
> **#0A7A58** for shading. Bright green **#0FA97C** for the main masses.
> **NO amber, no gold, no brass — this palette has one colour.** Near-black linework
> **#16181A**. Use no other colours — no additional greens, no greys, no
> off-whites, no blues, no skin tones.
>
> **Style.** Flat vector illustration, isometric, even weight linework, no
> lighting, no gradients, no shading within shapes, no photographic texture. The
> background must be a single uniform fill from edge to edge — the drawing may
> touch the edges but the background behind it never varies.
>
> **Composition.** Square, 2048 × 2048. The subject sits centred with clear
> margin on all four sides; nothing important within 8% of any edge.

Add the subject sentence after that block. Nothing else.

## 2 · Why the exact hex, and why "flat"

The current library does not match the pages it sits on, and the gap is
measurable rather than a matter of taste:

| | R | G | B |
|---|---|---|---|
| `trades/homes.png` background, measured | 243 | 239 | 229 |
| Aurora bone `#FCFAF6` | 252 | 250 | 246 |
| **Short by** | **9** | **11** | **17** |

The old prompts named a retired bone (see DESIGN.md §2), and the model landed warmer
still. So on a light page the art panel sits up to seventeen points below the
paper around it and reads as a dingy rectangle.

`ARTWORK_LIFT = 1.041` in `house/tokens.ts` is the bandage — a brightness
multiply. It cannot fully work, and the arithmetic says why: 1.041 × (243, 239,
229) = (253, 249, 238). Red and green land on bone; **blue is still eight points
short**, because a multiply lifts the yellow cast along with everything else. The
panel stops being dark and stays warm.

**Two words matter more than the hex.** "Off-white" invites a gradient, and a
gradient can never match a flat page at any brightness — that is why the block
says *flat solid* and *no vignette*. And a drop shadow reintroduces the same
problem at the edges.

## 3 · One background serves both grounds

The house now has exactly two grounds: **bone `#FCFAF6`** and **ink `#16181A`**.
Art does not need two versions.

- **On bone** the illustration is edge-to-edge continuous with the page — which
  only works if the hex is exact. This is the demanding case.
- **On ink** the same art reads as a deliberate bone plate against near-black.
  That is a designed contrast, not a mismatch, and it is what the report cover
  already does successfully.

Do **not** ask for a dark-background variant. A dark version would have to guess
the bloom behind it and would be wrong in every position.

Transparent PNG would be more flexible still, but only if the subject carries its
own silhouette. The `inversion` cover style bleeds art to the page edge as a full
column, and a transparent file has nothing to bleed. Bone-exact is the safer
default; reach for transparency only for spot objects that will always be framed.

## 4 · What to regenerate

Everything in `smbx-studio/assets/trades/` — the whole set, so nothing lands
half-matched:

`homes.png` · `hvac-ac.png` · `plumbing-van.png` · `roofing.png` ·
`garage-doors.png` · `electrical-ev.png` · `elevator.png` ·
`service-van-commercial.png` · `service-van-dark.png` · `solar-house.png`

Keep the filenames. Every spec references them by name and a rename is a silent
missing-art failure.

## 5 · Accepting the output — measure, don't eyeball

```bash
python3 - <<'PY'
from PIL import Image
import sys, glob
for f in sorted(glob.glob('assets/trades/*.png')):
    im = Image.open(f).convert('RGB'); w, h = im.size
    corners = [im.getpixel(p) for p in ((4,4), (w-5,4), (4,h-5), (w-5,h-5))]
    ok = all(c == (252, 250, 246) for c in corners)
    print(('ok   ' if ok else 'FAIL '), f, corners[0], '' if ok else '<- want (252, 250, 246)')
PY
```

All four corners must read exactly `(252, 250, 246)`. If they differ from each
other, the model added a gradient and the image is unusable no matter how close
the average is — re-prompt rather than post-processing.

## 6 · When the set passes

1. Set `ARTWORK_LIFT = 1` in `house/tokens.ts` and delete its comment block —
   the comment says to do exactly this, and leaving the lift on would push the
   corrected art *above* bone and produce the opposite dingy edge.
2. Rebuild every deck that carries trade art — at minimum
   `home-services-teardown` and the three cover-style previews.
3. Re-measure a rendered cover: the art panel and the page margin beside it
   should be indistinguishable on the light bookend.

## 7 · The rule this exists to protect

`artworkPaletteClause()` in `house/tokens.ts` generates the palette sentence so a
prompt cannot disagree with the renderer. **The clause above is generated from
the same tokens the pages use** — do not retype these hexes into a prompt file.
When the palette moves, the prompt moves with it.

That function had been stale since the ink ground landed: it still described the
retired jade block and asserted "nothing in this system is near-black", which
became false the moment ink was adopted. Corrected 2026-08-06 — which is the
whole failure mode in one line. **A palette written down in two places is a
palette that will disagree with itself.**
