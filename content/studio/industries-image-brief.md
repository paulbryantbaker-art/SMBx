# Industries page — image brief (green & bone illustration set)

2026-08-03. Prompts for generating sector-band illustrations in the house
style, for the verticals that have none. Run each prompt 3–4 times in the
Gemini app so there is a set to choose from; upload keepers here or drop them
in Drive and they get filed, de-artifacted if needed, and wired in.

**The container** (from `Industries.tsx` / `.pd-accentband`): a wide band,
**1700×520** (≈3.3:1). No generator offers that ratio, so ask **16:9** and
compose for a wide horizontal strip through the middle — anything within
~25% of the top or bottom edge may be cropped away. The final crop is done
here; do not try to make Gemini output the exact ratio.

**The existing set** (for reference, all in this style): trade-home (modern
house + garage), trade-hvac (condenser + thermostat), trade-fleet (service
van with ladder rack), trade-roof (shingled roof + ladder), trade-power (EV
wall charger), trade-van (van in front of a house).

---

## STYLE BLOCK — paste this at the top of every prompt, verbatim

> Flat editorial vector illustration in an isometric or three-quarter view,
> drawn with clean dark ink outlines (#16181A) and flat color fills. Strict
> palette: warm bone paper background (#FCFAF6), deep greens (#0A7A58 and
> #0A6A4C) for the main fills, cream/off-white panels, and muted gold/brass
> (#E8A62B) as the single accent on small details. Subject composed in the
> RIGHT HALF of a wide 16:9 frame; the LEFT 40% of the frame is completely
> empty flat bone background. The background is one uniform flat color
> reaching all four edges — no gradient, no vignette, no texture, no
> baked-in shadows at the edges. ABSOLUTELY NO text, letters, numbers,
> labels, logos, watermarks, people, faces, charts, or decorative lines,
> strokes, dashes, or underline marks anywhere — especially not in the
> empty left area, which must stay pure background. Sophisticated,
> restrained, architectural line-art mood — like a premium financial
> journal illustration, not a cartoon.

---

## Per-vertical subject lines — append ONE to the style block

**Fire & life safety**
> Subject: a wall-mounted fire alarm control panel with a cabinet door ajar,
> beside a bright brass-accented sprinkler pipe run with two sprinkler heads
> and a pressure gauge, mounted on a cream commercial wall section.

**Elevator & escalator service**
> Subject: a pair of elegant elevator doors half-open on a machine-room view
> of a green traction sheave and counterweight rails, with a small brass
> service toolkit resting on the sill.

**Building automation & critical power services**
> Subject: a green electrical control cabinet with the door open showing neat
> rows of breakers and relay modules, conduit runs entering from above, and a
> small rack of network equipment beside it.

**Testing, inspection & certification / NDT**
> Subject: an industrial weld seam on a large green pipe section under a
> magnifier lens on an articulated arm, with an ultrasonic probe unit and
> calibration block sitting on a workbench beside it.

**Environmental & industrial cleaning services**
> Subject: an industrial vacuum truck with a green tank and brass fittings,
> its hose running toward an open ground access port, drawn small enough to
> read as equipment rather than a vehicle portrait.

**Water & wastewater contract O&M**
> Subject: a green municipal water tower on slender legs behind a low pump
> station building, with a run of large pipes and two brass valve wheels in
> the foreground.

**Specialty & MRO distribution**
> Subject: tall warehouse racking bays filled with neatly organized green and
> cream boxes and coiled hoses, with a hand pallet jack carrying one brass-
> strapped crate in the aisle.

**Machine shops & precision manufacturing**
> Subject: a CNC milling machine with its door open showing a brass workpiece
> in the chuck, a set of precision calipers and two turned metal parts on the
> table beside it.

**Food contract manufacturing & co-packing**
> Subject: a stainless conveyor line carrying identical cream jars with green
> lids past a filling head, with a control pendant and a stack of flattened
> cartons at the line's end.

**Non-emergency medical transport**
> Subject: a clean cream transport van with a deployed side wheelchair ramp
> and an open sliding door, parked in front of a low green clinic building
> with a simple awning.

**Revenue cycle management & medical billing**
> Subject: a tidy desk scene with a green ledger book, a document tray
> holding cream forms, a desk calculator, and a small filing cabinet with
> one drawer open — no readable text on anything, all papers blank.

**Commercial mechanical (rooftop alternative to the residential HVAC art)**
> Subject: two large rooftop HVAC units with green cabinets and brass piping
> connections on a flat commercial roof, ductwork dropping through the deck,
> a low parapet wall behind.

---

## After generation

1. Pick the keepers (3–4 runs per subject gives real choice).
2. They get checked for artifacts — today's lesson: every image in the first
   set carried a stray placeholder underline in the empty half, so the empty
   region gets inspected at full size before anything ships.
3. Center-crop to 1700×520 with the subject right-of-center, file as
   `client/public/industries/trade-<slug>.jpg`, and wire into the page.
