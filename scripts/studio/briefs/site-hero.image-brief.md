# Image brief — the landing hero band

Written 2026-08-01, after eight attempts to put an existing report
illustration in the fold failed. Follows the standing brief discipline in
`content/studio/FORMATS.md` §"The imagery brief"; read that first if you have
not. This file is the site-side equivalent of a market's
`collateral/image-brief.md`.

**One image. Paul generates it in Gemini and saves it as
`client/public/industries/hero-band.jpg`.**

---

## Why a new image rather than a crop

The `hs-accent-*` set cannot do this job, and the reasons are the brief:

1. **They are banners with an internal backdrop panel.** Each is 1700×520: a
   flat field on the left, a warm sand panel on the right, subject on the
   panel. Inside a frame that panel reads as a card and looks right — which is
   why the landing's `.pd-accentband` placements work. The hero wants an image
   that sits ON the page with no frame, and there the panel draws a visible
   rectangle.
2. **Their field is the pre-Aurora bone** (`#F5F4EF`, seven points off the
   current `#FFFFFF`). Invisible inside a frame, obvious without one.
   `scripts/studio/rebone.mts` repaints that field, and it should still be run
   over whatever Gemini returns — but it cannot remove a composed panel, and it
   should not try. That is the artist's decision, not paper.
3. **They are one trade each.** The hero speaks for the whole practice, so a
   single condenser or a single van under-claims it.

---

## The slot — measured, not assumed

The fold is `min-height: calc(100svh - 86px)` and its contents already fill it,
so this band only fits once the hero's own gaps tighten by ~20px (part of
shipping the image, not a separate change).

| Where | Rendered slot | Aspect |
|---|---|---|
| Desktop ≥1024px | 1040 × 190 | 5.47 : 1 |
| Phone ≤760px | 358 × 116 | 3.09 : 1 |

**Ask Gemini for 16:9.** Both slots are WIDER than 16:9, so `object-fit: cover`
crops the top and bottom only — never the sides. The full width always
survives; the height does not.

**The binding constraint:** at the desktop slot only the **centre 33%** of the
artwork's height is visible (1.78 ÷ 5.47). Phone keeps the centre 58%.
Everything that matters must live inside a centred horizontal band occupying no
more than the middle third of the frame, with the top and bottom thirds left as
empty background.

---

## The prompt

```
A flat editorial illustration in isometric line style: a low horizontal row of
small light-industrial and trade subjects standing side by side on a single
implied ground line, like a skyline of service businesses. Include a rooftop
condenser unit, a service van, a pitched roof section, a water tower, an
electrical panel cabinet, and a low warehouse with a loading dock. Each object
is separate, evenly spaced, and roughly the same visual weight — a row, not a
scene, with clear air between the objects.

Palette, exactly: deep green #0A7A58 as the dominant colour, amber #E8A62B for
small accents only (a handle, a hinge, a stripe), ink #16181A for outlines,
background bone #FFFFFF.

Composition: the row of objects sits in a narrow horizontal band across the
MIDDLE THIRD of the frame. The top third and the bottom third are empty
background, uniform and flat, with no objects, no ground shadow and no texture
in them. Wide margins of empty background at the left and right edges too.

Uniform flat background colour #FFFFFF all the way to all four edges.

Do not include: text, lettering, numbers, people, faces, logos, charts, graphs.
Do not include: vignette, edge fade, gradient background, drop shadow, border,
frame, or any background panel or card behind the subjects — the background
must be one flat colour edge to edge.

16:9 aspect ratio.
```

---

## Accepting it

Reject and regenerate if any of these is true — each has produced an unusable
image before:

- [ ] Any text, lettering or numerals appear anywhere.
- [ ] The background is not one flat colour to all four edges (a panel, a card,
      a gradient, a vignette or a soft fade behind the subjects).
- [ ] The objects stray out of the middle third — anything in the top or bottom
      third will be cropped away at the desktop slot.
- [ ] A retired hex appears: `#16624C`, `#B08637`, `#0F1A16`, `#FF385C`,
      `#D4714E`, `#185ABD`. The tell is a warm accent where a green belongs.
- [ ] It reads as a photograph or a 3D render rather than as flat illustration.
      Generated illustration is honest; a generated photograph is not.

## After it is accepted

```bash
npx tsx scripts/studio/rebone.mts <gemini-output.jpg> \
  client/public/industries/hero-band.jpg
```

Then place it, tighten the hero gaps, and **look at the render before
believing it** — check the desktop crop first, because that is the one that
keeps only a third of the height.
