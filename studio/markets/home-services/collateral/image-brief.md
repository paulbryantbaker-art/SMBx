# Home services — imagery brief

One block per image. Sized to the slot tables in `FORMATS.md` §4. Save each
Gemini export into `markets/home-services/media/`, named for what it SHOWS.

## Existing bands, in use

`band-hvac` `band-plumbing` `band-commercial` `band-garage` `band-fleet`
`band-retrofit` `band-electrical` `band-roofing` — all eight are assigned to a
section in `documents/market-assessment.md`. `cover-homes.jpg` is the report
cover hero.

## 1. Part XI accent band — Dallas–Fort Worth · OUTSTANDING

**Why this is open.** Part XI was added to the report on 2026-08-03 and there is
no ninth band, so §11.1 currently renders with no accent. A missing band does
not error — it simply does not draw — so this is invisible until someone
compares the parts. The `accent:` line is deliberately NOT in the cover block
yet; add it when the file lands:

```
accent: 11.1 The metro in aggregate | band-dfw.jpg | 50% 50%
```

```
file:     band-dfw.jpg               ← markets/home-services/media/
slot:     report accent band · compose at 1700×520 px (3.27:1) · request 16:9
          print box 7.0 × 2.2in (3.18:1); the render trims ≈3% off the sides,
          so keep the subject clear of the outer 2%
imagePos: 50% 50%
weight:   JPEG q88, ≈45KB. Not a 4–5MB PNG — nine of those took one report to 11MB.
compose:  bone canvas · illustration at FULL BAND HEIGHT sitting right of centre
          · a short Accent rule anchoring the left third.
          Full band height or no band: an illustration floating in the middle of
          an empty bone field reads as a mistake even at the right dimensions.

PROMPT
A flat editorial illustration of a low, wide Sun Belt metro skyline — a cluster
of mid-rise buildings and water towers spread horizontally across a flat plain,
with two service vans on a road in the foreground. Drawn in clean geometric line
work. Oxblood accent (#B8431E) and amber (#B8431E) on a warm bone background
(#FCFAF6), with bright accent (#FF7D55) for secondary planes. Subject spread across the
full width and the full height of the frame, with generous empty background
above and below. Uniform flat background to all four edges. No text, no
lettering, no numbers, no people, no faces, no logos, no charts, no graphs, no
vignette, no edge fade, no gradient background, no drop shadow, no border, no
frame. 16:9 landscape.
```

**Then compose the band** — the raw Gemini export is not the band. Bone canvas
at 1700×520, the illustration scaled to the full 520px height and placed right
of centre, a short Accent rule on the left third. Save as JPEG q88.

**Then look at the render.** `pdftoppm -png -r 55 -f <page> -l <page>` on the
Part XI page and check the crop before calling it done.

## A note on the existing library

Every illustration in `assets/` was generated from prompts baking in the retired
bone `#FCFAF6` and landed warmer still. `ARTWORK_LIFT` in `house/tokens.ts`
compensates with `brightness(1.041)`; a residual warmth remains. New art
generated from the Aurora hexes above will read slightly cooler than the
existing bands. That is the correct direction — the library is what needs
regenerating, not the new file.
