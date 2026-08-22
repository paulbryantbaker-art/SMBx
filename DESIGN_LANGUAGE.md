# smbX — Design Language

**Version: OXBLOOD, 2026-08-22.** Supersedes CARTA (2026-08-07), AURORA
(2026-07-31), LEDGER (2026-07-17) and every system before them.

**Hand THIS FILE to any design tool.** It is self-contained on purpose — a tool
working from it has no repo access, so every value, ratio and law it needs is
here rather than cited. Where a number appears twice in this repo, this file and
`house/tokens.ts` are the two, and `npm run test:design` checks they agree.

> **STATUS: the values below are decided and verified; the code has not landed
> yet.** `house/tokens.ts` still carries Deal Green. Design against this file;
> do not read the current source for colour.

---

## 1. The paste block

*If you copy one thing into another prompt, copy this.*

> smbX is a buy-side corporate development practice. The design language is
> **white paper, oxblood fields, one warm accent, square corners, hairlines.**
> Ground `#FFFFFF`. Field `#8A2B32` oxblood — this is the dark surface; there is
> **no black band**. Accent `#B8431E` on light, `#FF7D55` on the field. Ink
> `#16181A`. Type is **Source Serif 4** for display, **Schibsted Grotesk** for
> working text, **IBM Plex Mono** for labels and data. Radius 0 everywhere except
> buttons and inputs. **The accent is never a resting button fill** — primary
> buttons are ink on light, bone on the field. No gradients, no drop shadows, no
> rounded cards, no emoji, no stock photography.
> **Never:** any green, any teal, any blue, amber, gold, brass, hot pink, coral
> `#FF385C`, terracotta `#D4714E`. If your output is warm-and-yellow rather than
> warm-and-red, you have drifted into a retired system.

---

## 2. Dead systems — the actual antidote to drift

A tool cannot catch itself drifting unless it knows what the wrong answer looks
like. Every hex below appears in this repo's committed history and **none of it
is live**.

| Hex | System | Retired |
|---|---|---|
| `#0A7A58` `#086348` `#DFF5EC` | Deal Green, hover, chip tint | 2026-08-22 — this document |
| `#A8F0CE` `#0FA97C` `#0A6A4C` | mint, jade, jade block | 2026-08-22 |
| `#16624C` `#0F4E3C` `#0F1A16` | Ledger green-black | 2026-07-31 |
| `#E8A62B` `#F5C452` `#B08637` | Aurora amber, honey, Ledger brass | 2026-08-07 |
| `#185ABD` `#124A9E` `#9EC1FF` | Office blue | 2026-07-17 |
| `#FF385C` `#E61E4D` `#D70466` | coral site v1 | 2026-07-17 |
| `#D4714E` | terra cotta | 2026-07-08 |
| `#D44A78` | V3/V4 hot pink | superseded |
| `#00D632` | liquid-glass neon | superseded |
| `#181818` `#131512` | near-black bands | 2026-08-22 — replaced by oxblood |

**Retired typefaces: Fraunces, Newsreader.** Do not name either.

**The variable-name trap:** older CSS calls the accent `--pd-coral*`. The name is
historical and means *accent*. Never restore an actual coral value to it.

---

## 3. Palette

### 3.1 The 60 / 30 / 10

| Share | Role | Value |
|---|---|---|
| **60** | ground — paper, the canvas everything sits on | `#FFFFFF` white |
| **30** | field — bands, covers, section breaks | `#8A2B32` oxblood |
| **10** | accent — chips, marks, rules, the two-tone turn | `#B8431E` light · `#FF7D55` field |

There is **one accent with two surface values**, not two accents. Which value you
use is decided by the ground it sits on, never by preference.

### 3.2 Light surfaces

> **THE GROUND IS WHITE, NOT BONE — and that is a decision on the record.**
> Paul, 2026-08-12, side by side against carta.com: *"the background is
> definitely darker still"* — our warm `#FCFAF6` read dingy beside Carta's pure
> white. The Scheme B swatch showed bone, so this is the one value where the
> proposal and the standing decision disagree, and the standing decision wins
> until it is revisited by looking. It is a one-token change either way.

| Token | Hex | Contrast on bone | Use |
|---|---|---|---|
| ground | `#FFFFFF` | — | the page. See the note below |
| card | `#FFFFFF` | — | lift above the ground; square, hairline edge |
| panel | `#F3F0E9` | — | recess; quiet grouping, code, inset rows |
| rule | `#E4DFD3` | — | hairlines. Never a fill |
| ink | `#16181A` | 17.09:1 | headlines, primary button fill |
| body | `#4A4F54` | 7.72:1 | running text |
| muted | `#7C8187` | 4.62:1 | labels, captions, meta |
| **accent** | `#B8431E` | 5.22:1 | text, marks *and* fills — all three |
| accent hover | `#9C3717` | 7.05:1 | hover only |
| accent tint | `#FBE7DF` | — | chip fill under `#9C3717` text (5.92:1) |

### 3.3 The field, and its depth ramp

Every step is oxblood mixed toward black or white by a fixed fraction, so
surfaces read as **the same material under different light** rather than as
different colours stacked up. If the field ever moves, the ramp regenerates.

| Token | Hex | vs field | Use |
|---|---|---|---|
| well | `#50191D` | 1.65:1 | recessed — inputs, insets, dense text |
| shade | `#6C2227` | 1.30:1 | subtle recess — alternating rows |
| **FIELD** | `#8A2B32` | — | the 30% |
| plate | `#964046` | 1.26:1 | subtle lift — chips, label plates, cards |
| rim | `#AF6F74` | 2.16:1 | **an edge, never a fill** |
| border | `#C08D90` | 3.02:1 | ghost button outlines |

**Text on the field** — warm, never neutral grey. Grey goes dirty on red.

| Tier | Hex | On well | On field | On plate |
|---|---|---|---|---|
| ink | `#FFF3F0` | 12.91:1 | 7.82:1 | 6.20:1 |
| sub | `#F0D8D4` | 10.33:1 | 6.26:1 | 4.96:1 |
| muted | `#DCB8B4` | 7.72:1 | 4.68:1 | 3.71:1 |
| legal | `#D6B2AF` | 5.77:1 | 4.39:1 | 3.48:1 |

**Accent on the field:** `#FF7D55` at 3.36:1 — **display sizes only** (≥24px
regular, ≥18.7px bold). For small text on the field use `#FFAA90` (4.61:1).
Chips are `#FF7D55` fill with `#1A1A1A` text (6.89:1).

### 3.4 The three depth rules

1. **Lift comes from an edge, not a fill.** A 1px `#AF6F74` rim on a `#964046`
   plate reads as raised and costs the text nothing. Raising the *fill* to the
   rim value drops `sub` to 2.89:1 — under AA. On a coloured field, edges are
   cheap and fills are expensive.
2. **The recessed well is the most legible surface.** It carries all four text
   tiers; the field carries three; a plate carries two. Dense reading — a table,
   fine print, a long caption — belongs in the **well**, not on a raised card.
3. **The accent lives at field level and below.** `#FF7D55` is 5.55:1 on the
   well, 3.36:1 on the field, 2.67:1 on a plate, 1.55:1 on a rim. A raised
   surface carries content, never the accent.

### 3.5 THE BUTTON LAW

**The accent is never a resting button fill.** Primary is **ink on light** and
**bone on the field**. The accent appears on hover, in chips, in kickers, in
links and in marks. This is not a preference; a green-then-red accent has been
tried as a button fill in two prior systems and it reads as a warning both times.

---

## 4. Type

| Role | Face | Notes |
|---|---|---|
| Display | **Source Serif 4**, weight 550 | Headlines; 600 for card titles |
| Working | **Schibsted Grotesk** 400/500/600/700 | All body, UI, buttons |
| Data & labels | **IBM Plex Mono** 400/500/600 | Kickers, stat labels, page numbers, sources. 0.08–0.13em tracking |

**TYPE IS NOT CHANGING IN THIS PASS, AND THIS IS LOAD-BEARING.** Every renderer
embeds its woff2s locally from `@fontsource` packages, because Railway blocks the
Google Fonts CDN and the Docker image carries only Noto. Only `ibm-plex-mono`,
`schibsted-grotesk` and the variable `source-serif-4` are installed. **A template
built in any other face renders as Noto in production.** A serif change is a
separate job: add the package, extend `server/services/fontEmbeds.ts`, then
update this table.

**Floor: nothing customer-facing below 13px.** Mono label voice runs 13–13.5px.
Headings take `text-wrap: balance` when centred, `pretty` when left-aligned.
Body measure ~65 characters. Tabular figures wherever digits align in columns.

**No decorative eyebrows.** Do not add small uppercase kickers or micro status
lines by default — lead with the title alone. A label earns its place only when
it carries information the reader cannot infer.

---

## 5. Shape and marks

- **Radius 0** everywhere except buttons and inputs (6–8px). The one sanctioned
  exception is the phone bottom-sheet's 22px top corners.
- **Corner-handle frames** — 8px ink squares at −4px on two opposite corners.
  This is the house gesture. Use it once per page, on the thing that matters.
- **Hairline grids**, 1px, at `#E4DFD3` on light and `#AF6F74` on the field.
- **The kicker mark** — an 8px accent square preceding a mono label.
- **No** drop shadows, gradients, glows, textures, rounded cards, or curves.

---

## 6. Collateral — the three builders

All three are **deterministic renderers**. A different-looking output means a
wrong *spec*, never a wrong renderer. **Never hand-roll a layout in HTML.**

### 6.1 Carousel — `build-deck.mts`, 1080 × 1350

**THE BOOKEND LAW: exactly two dark pages, the cover and the closer.** Never a
third, never two adjacent. Body pages are bone.

| Page kind | Ground | Takes an image? |
|---|---|---|
| cover | field | yes — full-height right panel |
| `numeral` | bone | **no** |
| `statement` | bone | **no** |
| `diagram` | bone | **no** |
| `trade` | bone | **yes** — the only body page with an image slot |
| closer | field | no |

**An `image:` key on `numeral` / `statement` / `diagram` is silently dropped** —
the build succeeds and the picture is gone. This is the most common failure.

### 6.2 One-pager — `build-onepager.mts`, 1080 × 1350
A vertical split: copy column (bone or field) plus a full-bleed photo column with
a recessed seam. Omit the image for a full-width text card.

### 6.3 Report — `build-report.mts`, Letter
Field cover with accent eyebrow, display title, accent rule, optional stat band
and a mint-ringed headshot byline. Body flows on bone: hairline tables with mono
uppercase headers, accent list markers, mono page-number footer.

### 6.4 Image slots — measured, not remembered

Everything is `object-fit: cover`, centre-cropped. No generated aspect matches
exactly, so **compose for the centre band** and steer with `imagePos` after
looking at the render.

| Container | Slot | Size | Ratio | Ask the generator for |
|---|---|---|---|---|
| Carousel | cover panel | 476 × 1102 px | 0.43 | **9:16** |
| Carousel | `trade` page | 404 × 604 px | 0.67 | **3:4** |
| One-pager | photo column | 470 × 1350 px | 0.35 | **9:16** |
| Report | cover hero | 5.84 × 2.05 in | 2.85:1 | **16:9** |
| Report | `accent:` band | 7.0 × 2.2 in | 3.18:1 | **16:9** |

### 6.5 Generated imagery — the standing prompt clauses
Flat editorial illustration in the house palette. Always state: no text, no
people, no logos, no charts; **no baked-in vignette, edge fade, gradient or
shadow**; uniform flat background to all four edges; name the hexes; state the
aspect ratio; state the composition margin.

**Real photographs only where a photograph implies something happened.** Generated
illustration is fine. A generated photo of a real person is never acceptable, and
never an AI photograph of Paul.

---

## 7. Copy laws that bind the design

- **Describe the work, never a competitor.** Every differentiator is a fact about
  us. Grievance copy is banned.
- **No public pricing.** No figure from the fee schedule appears on any public
  surface or in any chat.
- **Track record attribution:** always "led or co-led", always "selected
  transactions", and the attribution shield appears **wherever the deal names
  appear** — never as a footnote. Names, not logos.
- **Section labels are real headers**, not mono eyebrow micro-text.

---

## 8. Drift checklist

Stop if any of these is true of your output:

1. **You wrote HTML or CSS for a collateral page.** The builders own layout.
2. There is a **green, teal, blue, amber, gold or brass** value anywhere.
3. Your warm colour is **yellow-warm** rather than **red-warm** — amber sits at
   hue ~39–42°, the accent at 14°, the field at 356°.
4. A **rounded corner** on anything but a button or input.
5. A **gradient, glow, shadow or texture**.
6. The accent is **filling a resting button**.
7. There is a **black band** — there is no black band; the dark surface is oxblood.
8. You put an `image:` on a `numeral`, `statement` or `diagram` page.
9. There are **three dark pages**, or two adjacent.
10. A caption or label is **below 13px**.
11. You named **Fraunces** or **Newsreader**.

---

## 9. Where the other files sit

- **`house/tokens.ts`** — the values in code. This file and that one are the two
  copies; `npm run test:design` (103 cases) checks they agree.
- **`studio/DESIGN.md`** — the workspace copy of §3–§6, travelling with a studio
  session. Updated in the same commit as the tokens.
- **`studio/FORMATS.md`** — the container spec. It owns the slot table; §6.4 here
  restates it for tools with no repo access, and the two must move together.
