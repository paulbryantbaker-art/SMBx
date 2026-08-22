# Gemini image prompts — the house art library

Every generated image in `assets/` came from a prompt. Those prompts are the
real asset: the PNG is one roll of the dice, the prompt is the ability to roll
again, match a set, or extend it a year from now when the file is gone.

**The law: an image does not land in `assets/` without its prompt landing here.**
Add a row when you add art. Note the date and the model — Gemini's output drifts
between versions, and a prompt that matched the set in July may need a nudge later.

Two families live here. Do not cross them.

- **`trades/` and `concept/` — generated ILLUSTRATION.** Obviously drawn. Safe
  under house law because nobody could mistake it for a photograph.
- **`mep/` — PHOTOGRAPHY.** Real plant, real equipment. House law is *real or
  none*: a generated photograph implies something happened that did not. Never
  generate a photo of a specific business, and never generate or alter a photo
  of Paul.

---

> **Aurora, 2026-08-01.** The style block below was updated from the retired
> green-black palette (its hexes are in DESIGN.md §2, deliberately not repeated
> here — a retired hex quoted in a live file is a retired hex a session can
> copy). Note the
> wording change as well as the hexes: the old block asked for a "deep forest
> green", and a green so deep it reads as a forest is precisely the drift tell
> named in `DESIGN.md` §2. Ask for Deal Green by name.
>
> **The existing artwork in `assets/` predates this and was generated from the
> old block.** Every PNG in `trades/`, `mep/` and `concept/` is drawn in
> the green-black forest green with brass, and now sits against a jade
> block it no longer matches. Regenerating that library is a separate decision —
> it is not implied by this edit.

> **Aurora, 2026-08-06 — the palette now lives in ONE place.** The style block
> below is retired. `artworkPaletteClause()` in `house/tokens.ts` was written so
> a prompt could never disagree with the renderer, and then nothing ever called
> it: the prompts stayed hand-typed here and drifted exactly as predicted. They
> are now printed by `scripts/studio/art-prompt.mts`, which reads the same tokens
> the pages render from. **Do not retype a hex into this file.**

## The base style block

Paste this verbatim at the end of every `trades/` or `concept/` prompt. It is
what makes a new image belong to the set instead of merely being about the same
subject.

```
RETIRED 2026-08-06 — DO NOT PASTE THIS. Kept only to show what the existing
library was generated from, and why it does not match the pages.

Three faults, all measurable:
  · "Warm off-white background" — an instruction to drift warm, and it did.
    trades/homes.png measures rgb(243,239,229) against bone's rgb(252,250,246).
  · field accent #FFAA90 — retired with the jade block on 2026-08-06.
  · "Soft ambient occlusion, gentle long shadows" — shading on the background
    is a gradient, and a gradient can never match a flat page at any brightness.
    Every file in the library fails the corner check for exactly this reason.

The block is no longer stored here. It is PRINTED from house/tokens.ts:

    npx tsx $REPO/scripts/studio/art-prompt.mts "<subject sentence>"

and generated artwork is ACCEPTED by measurement, not by eye:

    npx tsx $REPO/scripts/studio/art-prompt.mts --check assets/trades

All four corners of every PNG must read exactly (252, 250, 246). Corners that
differ from each other mean a gradient — re-prompt, do not post-process.
```

Why each constraint earns its place: the bone background must bleed to the frame
edge because the deck crops these into panels — a white margin shows as a seam.
"No text, no lettering" because the renderer sets all type, and generated
lettering is always subtly wrong. "No people, no faces" because house law says
Paul's real photo or nothing, and a generated face in the corner of a trade
illustration is exactly the kind of thing that gets noticed. Brass "on small
details only" because brass is jewelry in this system — it marks signature
numerals, and if it spreads across an illustration it stops meaning anything.

## The subject line

One sentence, concrete, in front of the style block:

```
A <subject>, <arrangement>, <one or two identifying details>.
```

Concrete beats evocative every time. "A residential air-conditioning condenser
unit beside a house wall, with a round wall thermostat mounted above it" gets
you the set. "The feeling of home comfort" gets you a mood board.

---

## Existing art

Reconstructed from the rendered images 2026-07-27. These reproduce the set;
they are not necessarily byte-for-byte the originals.

| File | Subject line |
|---|---|
| `trades/hvac-ac.png` | A residential air-conditioning condenser unit standing beside a house wall, with a round wall thermostat mounted above it and a few leafy trees behind. |
| `trades/plumbing-van.png` | A plumbing service van parked in front of a suburban house, with a faucet emblem on the van's side panel and a ladder rack on the roof. |
| `trades/roofing.png` | A pitched residential roof with shingle courses clearly visible, a brick chimney at the ridge, and a ladder leaning against the eave. |
| `trades/garage-doors.png` | A two-storey suburban house seen from the driveway corner, with two sectional garage doors on the ground floor. |
| `trades/electrical-ev.png` | A wall-mounted electric-vehicle charging station on a driveway, cable coiled on its hook, with evergreen trees behind. |
| `trades/homes.png` | A cluster of eight or nine suburban houses of varying rooflines arranged on an irregular plot, seen from above. |
| `trades/elevator.png` | A cutaway cross-section of a low-rise elevator shaft showing the cab between floors, with numbered floor plates. |
| `trades/solar-house.png` | A suburban house with a full photovoltaic solar array covering the south-facing roof plane. |
| `trades/service-van-dark.png` | A panel service van in three-quarter view, no livery, parked on a plain ground plane. |
| `trades/service-van-commercial.png` | A white service van parked in front of a low commercial building with a flat roof and rooftop mechanical units. |
| `concept/tree-roots.png` | A mature broadleaf tree with its root system exposed below a cutaway ground line, roots spreading as wide as the canopy. |

**`mep/` — not generated.** `chilled-water-plant`, `cooling-towers`,
`pipe-gallery` and `rooftop-units` are photography and stay that way.

---

## Ready to paste — the two known gaps

### 1. Pest control (`trades/pest-control.png`)

The home-services deck runs its pest page text-only because this does not exist.

```
A pest-control service van parked at the kerb in front of a suburban house,
with a small shield emblem on the van's side panel and a technician's
backpack sprayer standing upright on the ground beside the rear door.

RETIRED 2026-08-06 — DO NOT PASTE THIS. Kept only to show what the existing
library was generated from, and why it does not match the pages.

Three faults, all measurable:
  · "Warm off-white background" — an instruction to drift warm, and it did.
    trades/homes.png measures rgb(243,239,229) against bone's rgb(252,250,246).
  · field accent #FFAA90 — retired with the jade block on 2026-08-06.
  · "Soft ambient occlusion, gentle long shadows" — shading on the background
    is a gradient, and a gradient can never match a flat page at any brightness.
    Every file in the library fails the corner check for exactly this reason.

The block is no longer stored here. It is PRINTED from house/tokens.ts:

    npx tsx $REPO/scripts/studio/art-prompt.mts "<subject sentence>"

and generated artwork is ACCEPTED by measurement, not by eye:

    npx tsx $REPO/scripts/studio/art-prompt.mts --check assets/trades

All four corners of every PNG must read exactly (252, 250, 246). Corners that
differ from each other mean a gradient — re-prompt, do not post-process.
```

Deliberately no insect in the frame — the trade set is equipment and buildings,
and a bug would read as pest-control marketing rather than as a lane marker.

### 2. Home services report cover (`trades/home-services-cover.jpg`)

`markets/home-services/master.md` references `home-services-cover.jpg` in its
cover config, so the report currently renders with no hero band. Report covers
are landscape, not square.

```
A wide neighbourhood view of a dozen suburban houses with varied rooflines,
seen from a low three-quarter aerial angle, with a service van on the street
in the middle distance and rooftop mechanical details visible on two of the
houses.

RETIRED 2026-08-06 — see the note at the top of this file. Generate the block
with art-prompt.mts, then append the landscape framing:

    npx tsx $REPO/scripts/studio/art-prompt.mts "<subject sentence>"

  ... replacing the COMPOSITION paragraph with:
  COMPOSITION. Wide landscape, 2752 x 1536, subject weighted to the lower two
  thirds with clear space above for a title overlay.
```

The clear upper third matters: the report cover sets the title over this band,
and a busy top edge makes the display type unreadable. (Fraunces was retired 2026-08-05; the display face is Newsreader — but the constraint is about the art, not the font, and holds either way.)

---

## Adding a new one

1. Write the subject line. Concrete nouns, one sentence.
2. Append the base style block unchanged.
3. Generate. Reroll until it sits beside the existing set — the tell is usually
   background tone and shadow direction, not the subject.
4. Save straight into the right subfolder with a name that says what it shows.
   `assets/trades/`, `assets/mep/`, `assets/concept/`.
5. Add a row to this file and to `INDEX.md`.
6. Reference it from a spec by subpath: `image: 'trades/<name>.png'`.

**Check before you ship it.** Render the deck and look at the page. Generated
art fails in ways that are invisible at thumbnail size — stray lettering along
an edge, a fifth colour in a shadow, a shadow falling the wrong way against the
rest of the set.
