# Asset index — `smbx-studio/assets/`

Every recurring image, what it shows, and where it is used. Reference these
from a spec by subpath: `image: 'trades/hvac-ac.png'`.

The resolver order is: absolute path → `--media` dir if passed → `./media` →
`./assets` → the spec's own folder → CWD. It joins the *whole* reference, so
`trades/hvac-ac.png` resolves to `./assets/trades/hvac-ac.png`.

**Naming law:** an image is named for what it shows. Never leave a generator's
filename on a file.

---

## `brand/`

| File | Shows | Used by |
|---|---|---|
| `founder-portrait.jpg` | Paul Baker byline headshot, 1200×1944 | Every deck, one-pager and report byline. Note the builders fall back to the repo copy at `client/public/founder-portrait.jpg` if this is missing, so a broken path here fails quietly. |

## `trades/` — lane illustrations

The green isometric set. One per trade, reusable across every home-services post.

| File | Shows | Used by |
|---|---|---|
| `hvac-ac.png` | Condenser unit + thermostat dial against a house wall | Home services deck, p5 |
| `plumbing-van.png` | Service van with faucet livery outside a house | Home services deck, p6 |
| `roofing.png` | Shingled roof, chimney, ladder | Home services deck, p7 |
| `garage-doors.png` | Two-storey house with garage bays | Home services deck, p9 |
| `electrical-ev.png` | EV charger on a driveway | Home services deck, p10 |
| `homes.png` | Cluster of houses | Home services deck, cover |
| `elevator.png` | Elevator shaft cutaway with floor numbers | Elevator teardown Nº1 (D02) |
| `solar-house.png` | House with a roof solar array | unused |
| `service-van-dark.png` | Dark green service van | unused |
| `service-van-commercial.png` | White van outside a commercial building | unused |

## `mep/` — commercial mechanical photography

Real plant photography for commercial-mechanical work. Report art (`mep-cover.jpg`,
`mep-accent-*.jpg`, `qr-*.jpg`) still lives in the repo at
`scripts/studio/reports/media/` — worth consolidating here one day.

| File | Shows | Used by |
|---|---|---|
| `chilled-water-plant.png` | Chiller hall, blue and green pumps | unused |
| `cooling-towers.png` | Rooftop cooling towers against a skyline | unused |
| `pipe-gallery.png` | Long pipe gallery corridor | unused |
| `rooftop-units.png` | Rooftop air handlers, city skyline | unused |

## `concept/`

| File | Shows | Used by |
|---|---|---|
| `tree-roots.png` | Tree with an exposed root system | unused — reads as a compounding/holding metaphor |
| `owner-books-desk.png` | An owner's books on a desk — a return in a tray, an open filing drawer, a ledger and a calculator | Sample valuation cover panel (`specs/buildacmesample.mts`) |

`owner-books-desk.png` is **already composed**, not a raw generation: 732×1648
(the 2× cover panel box), 96-colour palette, 0.44MB, with its paper level-shifted
per channel onto Aurora bone `#FCFAF6`. Two things to know before reusing it.

- **Do not apply `ARTWORK_LIFT` to it.** That factor is calibrated to the
  `trades/` set, which was baked at the retired bone and measures
  `rgb(242,238,229)`. This one was baked at `rgb(251,248,241)` — five points off
  Aurora bone already — so ×1.041 overshoots it to near-white and the panel reads
  brighter than every other bone surface in the system.
- **Its source is landscape.** The original is
  `extraImages/Gemini_Generated_Image_587i2l587i2l587i.png`, 2752×1536, 5.9MB. A
  1.79 landscape cannot fill a 0.44 panel: cropping to fill shows a six-inch
  calculator key. The composed file carries the subject scaled to the panel WIDTH
  at 68% of its height, padded top and bottom in the same bone. That padding is
  the composition. Re-compose from the source if the panel geometry changes;
  never inline the raw source — at 5.9MB it takes Puppeteer's `setContent` past
  its default 30s timeout and the build dies silently.

---

## Report bands — `markets/<m>/media/`

`build-report.mts` cannot see this folder. It resolves images from the `.md`'s
own directory, that directory's `media/`, or `$REPO/client/public/` — the deck
builder's `./media` → `./assets` chain does not apply to reports. So a report's
art is **composed into the market's own `media/`** and referenced by bare
filename.

The composition, for the home-services report and any that follow:

| Output | Built from | Recipe |
|---|---|---|
| `cover-<subject>.jpg` | a `trades/` illustration | 1800×640, centre crop at 42% vertical offset, q88 — ≈150KB |
| `band-<name>.jpg` | a `trades/` illustration | 1700×520 bone canvas; illustration at 102% band height, centred on x=62%; a 4px Deal Green rule at x=6–16%, y=42%; q88 — ≈45KB |

Composed rather than cropped because the trade set is square and an accent band
is roughly 3.2:1 — a centre crop slices the illustration into an unreadable
strip, and letterboxing strands it in an empty field. The offset composition
reads as a designed band and stays consistent across every section.

Print weight matters: the raw PNGs are 4–5MB each, and nine of them took one
report to 11MB. The composed set is 0.3MB total for the same nine.

## Gaps

- **No pest control illustration.** That page in the home-services deck runs
  text-only. Correct under house law (real or none — never stock), but a lane
  illustration would complete the set.
- **No purpose-made home-services cover art.** `cover-homes.jpg` in
  `markets/home-services/media/` is composed from `trades/homes.png` and works,
  but the set would be better with art made for the hero band's aspect.

## Retired 2026-07-27

Moved to `_to_delete/redundant-assets/`. About 25MB of duplication across 22 files.

| File | Why |
|---|---|
| `Chilled Water Supply Small.jpg` | JPG copy of `mep/chilled-water-plant.png` — RMS 0.55, same image |
| `Chiller small.jpg` | JPG copy of `mep/cooling-towers.png` — RMS 0.54, same image |
| `Factory Building.jpg` | Byte-identical to `Chiller small.jpg`. Not a factory — the same cooling towers. |
| `Large Room with Machines.jpg` | JPG copy of `mep/pipe-gallery.png` — RMS 0.53, same image |
| `paul-headshot-site-portrait.jpg` | Byte-identical to `founder-portrait.jpg` |
| `screenshot-2026-07-17.png` | A screenshot, not collateral art |
| `media-copy-*.png` | Six copies of the trade art that briefly lived in `media/` before the `assets/trades/` split |
