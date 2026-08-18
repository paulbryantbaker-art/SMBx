> ## ⚠ THIS SPEC IS LEDGER. DO NOT BUILD FROM IT UNCONVERTED. (2026-08-08)
>
> **CARTA-HOLDOUT** — declared, tracked by `carta-guard.mts`, still owed a pass.
>
> **Carta is canon.** This document still describes the Aurora/Ledger system
> throughout — not in one palette table but in roughly sixty places, woven into
> the layout description page by page: honey numerals, brass keylines, ivory
> block text, `blockBackground()` bookends, Fraunces and Inter, rounded rules,
> `opacity` ladders, and a `#B00` red that was never a house colour in any
> system.
>
> Rendering this as written produces a document in a retired palette that will
> pass its own internal checks, because its checks are written against itself.
>
> **What has to change when it is converted** — the band is flat `#131512` with
> no `blockBackground()`, no texture and no glaze; there is no honey and no
> brass, so every accent becomes green on paper and mint on the band; the
> signature numeral goes to reading ink over a 4px green bar; type becomes
> Source Serif 4 550 / Schibsted Grotesk / IBM Plex Mono; every radius goes to
> 0 except buttons and inputs at 10px; framed things gain the four corner
> handles; `REPORT.ivorySub` and `REPORT.statLabel` no longer exist and become
> `CARTA.darkSub` and `CARTA.darkMuted`. The three-state driver column has no
> red available — Carta has one accent, so **the words carry the states**:
> Strength in green, Watch and Fix before sale in ink and muted, distinguished
> by the label rather than the hue.
>
> `DESIGN.md` §4 and §5 are the authority. This banner comes off when the spec
> is rewritten against them.

# SAMPLE-VALUATION-SPEC.md — the "Free Full Valuation" sample report

**What this is:** the complete, no-guessing specification for the 5-page
branded sample valuation (Acme Mechanical Group). A Cowork session with this
file, the five brand assets, and a local Chromium can reproduce the artifact
byte-for-byte in intent — content, layout, palette, and law. File it in the
workspace beside FORMATS.md.

**Revised 2026-08-04 (expansion pass) — the artifact is now SIXTEEN pages.**
See §9 at the foot of this file for the page map, the new arithmetic and the
three build guards. §2–§7 below describe the original five-page structure; where
they conflict with §9, §9 wins.

**Revised 2026-08-04 (bookend pass).** Paul: *"the cover and last page are
close but not what we have been doing for LinkedIn marketing."* Pages 2–4 are
unchanged and verified byte-identical to the first build (0 differing pixels at
96dpi). Only the two bookends moved, and §1, §2 and §3 below are rewritten for
them. §4–§7 — the bridge, the band, the drivers, the parity check — are
untouched. Builder: `specs/buildacmesample.mts`.

---

## 0 · The laws this document obeys (non-negotiable)

1. **The company is fictional and says so.** Acme Mechanical Group is an
   illustrative company. The disclosure sentence (§6) appears on the COVER,
   in every body-page FOOTER, and on the CLOSER. Never present the company
   or its figures as a real engagement.
2. **Every market figure is real and cited.** The 5–11x band, the
   project-led 5–6x vs 8–11x service-book spread, and the readiness
   thresholds come from the practice's published assessments (§5 verbatim
   citations). Company figures may be invented; market figures may not.
3. **Range, never a point estimate.** No single valuation number appears
   anywhere. Two ranges only (full band, where-the-market-clears).
4. **THE LINE:** the not-an-appraisal disclaimer (§6) prints on page 4 and
   the closer. Real estate is a separate asset valued by a licensed
   appraiser — never estimated. No fee talk directed at owners beyond
   "free" / "never a fee from an owner."
5. **Real photos only:** the byline headshot is Paul's real portrait
   (`founder-portrait.jpg`). Never a stock or generated face.
6. **Internal consistency (§7):** the bridge must sum exactly; the range
   must be basis × band endpoints; the readiness profile must score
   "upper third" under the live engine's own rules.

---

## 1 · Format & build

- **Page:** US Letter, 8.5in × 11in, 5 pages, `printBackground: true`,
  each page a `page-break-after: always` block, `overflow: hidden`.
- **Renderer:** local Chromium (Puppeteer/Playwright — no model, no API key).

### THE RENDERER-PROOF LAW APPLIES HERE. It is not carousel-only.

**This spec used to say the opposite** — *"Vector PDF via `page.pdf()` is fine
for this Letter format (the rasterize-every-page law applies to 1080×1350
LinkedIn carousels, not Letter reports)."* That sentence was wrong, and it is
the single reason this artifact keeps coming back broken: every session reads
it, believes it, ships a vector PDF, and the bookends crack open in Preview.

The law is not about canvas size. It is about what Skia emits and what the
opening renderer does with it. Rendered live, these two bookends put **22
transparency groups, 8 soft masks and 16 shadings** into the PDF — the block's
layered gradient stack, the glass cards, the art panel's `box-shadow`, the
ghost. Poppler composites that one way and macOS Preview another, and Preview
draws the panel's shadow group as a hard-edged lighter rectangle running most
of the height of the page. The CSS is not wrong. Nothing is wrong that any
local check can see.

**And that is the trap: a PNG screenshot never travels the PDF path at all.**
`page.screenshot()` rasterizes the DOM directly. Reviewing the PNGs proves
nothing about the PDF, and reviewing the PDF through `pdftoppm` proves only
what *poppler* does with it. This failure passed both and reached Paul.

`build-onepager.mts` says it plainly in its own comment: *"Wrap the flat PNG
into a single-page PDF — one image, no vector object edges, so Preview /
LinkedIn have nothing to crack."*

**So: two passes.**

1. Render live at `deviceScaleFactor: 2`, screenshot all five `.pg` elements.
2. Re-set the document with pages 1 and 5 replaced by a full-bleed `<img>` of
   their own bitmaps, then `page.pdf()`.

Pages 2–4 stay vector — they carry no alpha, gradient or shadow, so there is
nothing for a renderer to disagree about, and vector keeps the body text
selectable and searchable. Bookends land at 192dpi. Output ≈6.9MB, which is in
line with the house (`smbx-open-for-business-dark.pdf` is 5.8MB for one page).
Keep the bitmaps PNG; JPEG q94 is visually identical and would save 4.5MB, but
the house uses PNG and this is not the artifact to diverge on.

**Use `waitUntil: 'domcontentloaded'`, never `networkidle0`.** Every asset is a
data URI, so there is no network to go idle; `networkidle0` simply waits out
its own timeout on a heavy document. Await `document.fonts.ready` and every
`img.decode()` explicitly instead, then settle ~160ms.

### The guard, which runs on every build

The builder counts `/Group` and `/Shading` in the finished PDF and exits 3 if
either is non-zero. Those two are the renderer-dependent structures: a
transparency group is a nested compositing context, a shading is a gradient. An
image `/SMask` is just a PNG's alpha channel and every renderer agrees about
it, so it is reported and not failed.

```
transparency: /Group=0  /Shading=0  (image /SMask=1, benign)
✓ renderer-proof: no transparency groups, no shadings.
```

### KNOWN, UNFIXED: `build-report.mts` has this same defect

Measured 2026-08-04 on the shipped artifacts:

| Artifact | Builder | `/Group` | `/Shading` |
|---|---|---|---|
| `home-services-market-assessment.pdf` | `build-report.mts` | 24 | 8 |
| `dfw-home-services-market-map.pdf` | `build-report.mts` | 20 | 8 |
| `smbx-open-for-business-dark.pdf` | `build-onepager.mts` | 0 | 0 |
| `home-services-teardown.pdf` | `build-deck.mts` | 0 | 0 |

`build-report.mts` line 164 puts `blockBackground()` on its cover and line 268
goes straight to `page.pdf()` with no rasterizing pass. So **every market
assessment PDF rendered to date carries the same latent seam on its cover.**
Fixing it is a house-builder change with blast radius across every report, so
it is Paul's call, not a session's — but do not let a future session
"discover" this again from scratch.
- **Fonts, embedded as base64 @font-face — never a CDN:**
  Fraunces (display, weight 560), Inter (body), IBM Plex Mono (labels).
- **Assets (base64-inline all five):**
  - White logo: repo `client/public/logo-green-x-dark.png` (4:1 mark — never stretch; height 23px cover / 19px footer bar / 20px crumb)
  - Green logo: repo `client/public/logo-green-x.png`
  - Dark texture: repo `client/public/textures/blackbleed.webp`
  - Headshot: repo `client/public/founder-portrait.jpg`
  - Cover art: `assets/concept/owner-books-desk.png` — pre-composed to the panel
    box, 732×1648, 0.44MB. **Never inline the 5.9MB source**; at that weight
    `setContent` exceeds its 30s timeout and the build exits 0 with no output,
    because the `finally` block swallows the throw. See `assets/INDEX.md`.

### Palette (Aurora/Ledger tokens — use these hexes exactly)

| Role | Hex |
|---|---|
| Ink (body headings, light pages) | `#16181A` |
| Body text on light | `#3F464C` |
| Deal Green (numerals, total rule) | `#0A7A58` |
| Brass (accent keylines) | `#E8A62B` |
| Honey (on-dark accent: kickers, turns, rules, stat labels) | `#F5C452` |
| Bone (light page background) | `#FCFAF6` |
| Ivory (on-dark text) | `#F3F1EA` |
| Hairline | `#EAE5DC` |
| Muted (captions, footers) | `#8A9099` |
| Ivory-sub (numeral labels on the block) | `#C9E8DA` |
| Glass card on the block | 1px `rgba(243,241,234,0.26)` edge over `rgba(243,241,234,0.05)` fill |
| Dark bookend surface | **`blockBackground()` from `house/tokens.ts`** — never a literal |

**The bookend composite law — call the function, never rebuild the stack.**
The bookends use `blockBackground(TEXTURE, '760px 460px at 62% -8%')` from
`house/tokens.ts`. Only the halo geometry is local, because a Letter page is not
a 1080 deck canvas; everything else — glaze colour, glaze alpha, layer order,
fallback — comes from the house and moves when the house moves.

The first build hand-rolled this: a texture layer under a flat
`rgba(10,106,76,0.84)` glaze, no jade in the glaze and no halo. It rendered a
dead flat `rgb(16,97,73)` — within a point of the RETIRED pre-Aurora `#16624C`,
and visibly darker and flatter than every carousel posted since 2026-08-01,
which composite to `rgb(19–30, 101–112, 78–90)`. `tokens.ts` names 0.84
explicitly: *"0.84 was always the outlier, not the house value."* The current
render samples `rgb(20,101,79)` to `rgb(26,107,85)` against the carousel's
`rgb(21,102,80)` to `rgb(30,112,90)`.

The old warning still holds and is now the function's problem, not yours: never
write `background: color url(texture)`, because the texture sits above the base
colour in the stack and wins outright, and the page reads near-black while the
code reads as jade.

### Type ladder used

- Cover numeral: Fraunces 660, 73px/0.92, honey, tabular, `nowrap`
- Cover numeral label: Plex Mono 9.5px/1.75, tracking 0.15em, ivory-sub, caps
- Cover H1: Fraunces 545, 40px/1.07, `text-wrap:balance`, second line in honey
- Cover taglines: Inter 13.5px/1.62 ivory 90%; the catch lead-in is honey 600
- Cover stat caption: Plex Mono 8px/1.7, tracking 0.13em, ivory-sub, caps
- Closer H1: Fraunces 545, 44px/1.07, second line in honey
- Kicker/labels: IBM Plex Mono 10.5px, letter-spacing 0.2em, honey
- Body-page h2: Fraunces 560, 22px
- Body: Inter 12.5px/1.62, color #3F464C
- Tables: 11.5px; notes under labels 10px muted
- Stat-card numerals: Fraunces 23px white (cover) / 19px green (facts)
- Range numerals: Fraunces 27px green
- Footers/crumbs: Plex Mono 8.5–9.5px, tracking 0.08–0.15em, muted

---

## 2 · Page-by-page layout grammar

**P1 — COVER (dark bookend). This is the CAROUSEL cover budget, not the
report cover budget, and that is deliberate.** FORMATS.md §3.2 bans stat bands
on a report cover. That budget governs the long-form MARKET ASSESSMENT, whose
cover has to open a fifty-page read and earns its restraint. This is a
one-artifact marketing sample whose only job is to stop a scroll, so it takes
the carousel cover grammar (FORMATS.md §1) instead: numeral, up to THREE
hairline stat cards, art panel, ghost, footer bar. The geometry ports almost
unchanged — the carousel canvas is 0.800 and Letter is 0.773, so the panel lands
at 0.44 of the width against the house 0.43.

Padding 0.5in top / 0.58in sides / 0.42in bottom. Stack:

- **Top bar** — white logo 23px left; mono honey kicker right,
  `SAMPLE REPORT · WHAT EVERY OWNER RECEIVES`.
- **Two-column row**, 30px gap, filling the page.
  - *Copy column:* numeral `$37–51M` → mono label `WHERE THE MARKET CLEARS /
    8–11X ADJUSTED EBITDA` → 72×4px honey rule → H1 "Free Full Business
    Valuation / **You Can Bank On**" (turn in honey) → tagline → catch line →
    mono stat caption → **3-up** stat cards.
  - *Portrait panel:* 3.15in wide, full row height, radius 22px,
    `object-fit:cover`, drop shadow `0 18px 44px rgba(0,0,0,0.20)`.
- **Ghost** — the logo's own X, window-cropped out of the wordmark so no second
  asset has to exist: a 186×248 `overflow:hidden` box at `left:-40px;
  bottom:1.05in`, holding the logo at `height:248px; left:-496px`, opacity 0.085.
- **Sample-disclosure line** (9px ivory 55%).
- **Footer bar** — 1px `rgba(ivory,0.18)` top rule, then white logo 19px ·
  "Paul Baker" bold + "Buy-side corporate development" · mono honey
  `August 2026` pushed right. **No headshot disc** — the portrait fills the
  panel, and the same face twice on one page reads as a mistake.

### Cover copy (verbatim, Paul 2026-08-04)

| Slot | Copy |
|---|---|
| Kicker | `SAMPLE REPORT · WHAT EVERY OWNER RECEIVES` |
| H1 | Free Full Business Valuation / **You Can Bank On** |
| Tagline | Not a guess with a handful of data points — a full walkthrough for your business. |
| Catch line | **What's the catch?** Someday, we may have a buyer that is looking for you. |
| Stat caption | `ACME MECHANICAL GROUP, LLC · DALLAS, TEXAS` / `COMMERCIAL MECHANICAL, HVAC & PLUMBING · TTM JUNE 2026` |

Two notes on that copy.

**The em dash in the tagline is an edit.** Paul wrote it with a comma, which
splices two independent clauses. House voice takes the dash.

**"You Can Bank On" sits against THE LINE and that is Paul's call, not a
session's.** Page 4 and the closer both carry *"not an appraisal or opinion of
value."* A headline promising bankability and a disclaimer denying an opinion of
value are pulling in opposite directions on the same artifact. The defence is
real — the walk is a full normalization against cited published multiples, not
a three-input estimator, which is exactly what the tagline says — but if the
line is ever softened, soften it here and not in the disclaimer.

### The portrait panel

The panel carries `client/public/founder-portrait.jpg`, not an illustration.
This follows the one-pager's own precedent, recorded in FORMATS.md §2:
`smbx-open-for-business` runs *"the headshot on the block, where eye contact is
doing the work, and the walking shot on paper."* A cover whose catch line says a
buyer may someday be looking for the reader should show the person who would
make that call.

**The panel ratio moved from 0.44 to 0.38, deliberately.** 0.44 is the carousel
cover's *illustration* panel. A photo column is a different slot — the
one-pager's is 470×1350, ratio 0.348. 3.15in lands between them, which is what a
Letter page can carry once the copy column holds a headline, two taglines and a
caption. Source is 1200×1944 (0.617), so `cover` scales by height and keeps the
middle 62% of the width: shoulders crop, face does not.

`assets/concept/owner-books-desk.png` stays in the library and stays indexed. It
is still the right panel for an owner-facing piece that should not lead with a
face.

**Three stat cards, not four.** The fourth figure was `$37–51M`, and on a
carousel cover the signature figure is the numeral, not a card. Promoting it
is what freed the strip to three and gave the cover something to lead with.

**P2 — company + bridge (light).** Every light page: crumb row (green
logo 20px left; mono right `SAMPLE OWNER VALUATION · n OF 5`) over a
1.5px ink rule; mono footer row pinned 0.32in from bottom:
`SMBX.AI · SAMPLE — ILLUSTRATIVE COMPANY` left, `FREE FULL VALUATION`
right. Content: h2 "The company" + profile paragraph → 4-up facts cards
(white, hairline, radius 10; green numeral + mono label) → h2 "Earnings,
normalized the way a buyer will" + intro line → the BRIDGE table: label
column with bold line name + 10px muted note underneath; right-aligned
amount column (tabular numerals, explicit +/− signs, width 110px);
subtotal row (1.5px ink top rule, bold); total row (2.5px GREEN top rule,
amount in green, bold).

**P3 — the band (light).** h2 "What buyers are paying for commercial MEP"
+ paragraph → TWO range cards side by side (white, hairline, radius 12;
Fraunces 27px green numerals; mono label under). The second card carries a
3px BRASS left keyline — it is the hero ("where the market clears").
→ 9.5px muted source block → h2 "Why the service book carries the
multiple" + paragraph → h2 "What underwrites the range" + paragraph.

**P4 — readiness (light).** h2 "Where Acme sits, and why" + position line
→ 5-row drivers table: driver name (bold, 118px) · status (bold 10.5px:
Strength `#0A7A58`, Watch `#E8A62B`, Fix before sale `#B00` dark red) ·
note (11px) → attribution line (muted 9.5px) → h2 "The real estate" +
paragraph → h2 "What moves the number" + paragraph → disclaimer box
pinned at bottom (white, hairline, 3px brass left keyline, 10px).

**P5 — CLOSER (dark bookend).** The carousel close panel: everything centred,
the whole stack vertically centred as ONE block, no art, no ghost, no top bar.
Padding 0.7in/0.72in/0.42in.

kicker `FOR OWNERS` → H1 "This report is free. / **Yours included.**" (turn in
honey) → 72×4px honey rule, centred → body paragraph (14px ivory, max-width
5.5in) → 3-up numbered step cards, left-aligned inside a centred grid
(glass edge + fill; honey Fraunces numeral; 10.5px body) → mono URL line 17px:
`SMBX.AI ` + honey `→ FREE VALUATION` → byline (44px disc, honey ring, "Paul
Baker / Founder · two decades on the buy side") → centred white logo 25px →
mono credits `EVERY MARKET FIGURE CITED · BUY-SIDE ONLY · NEVER A FEE FROM AN
OWNER` → disclosure + disclaimer line (8.5px ivory 50%).

**Do not put `margin-top:auto` on the closing note.** It fights
`justify-content:center` — the note pins to the foot, everything else rides to
the top, and the page renders with a hole through its lower third. A fixed
46px margin lets the stack centre as one block, which is what the carousel
closer does.

---

## 3 · The company (all values, verbatim)

**Acme Mechanical Group, LLC** — commercial mechanical, HVAC & plumbing ·
Dallas, Texas, working nationally · TTM to June 30, 2026.

- Founded 2004 · **178 employees** · 62-vehicle fleet · work delivered in
  **22 states** (national grocery/retail rollout programs, healthcare,
  light industrial)
- Revenue **$35.2M** = service & maintenance **$13.4M (38%)** +
  construction/projects **$21.8M (62%)**
- Gross margin: **34%** service book, **20%** project work
- Backlog **$28.4M**, POC schedules current
- Surety: **$15M single / $40M aggregate**
- WIP: **net overbilled $1.1M** (cash-positive billing discipline)
- Top customer: national grocery rollout program, **14% of revenue**
- HQ + fabrication shop owned by a **related entity**; rent expensed
  $180,000 vs $340,000 market
- Books: accrual, outside CPA review, POC schedules
- Management: GM + PM bench runs delivery; owner holds key program
  relationships (manager-in-place, not absentee)

### Cover numeral (1) + stat cards (3)

| Slot | Figure | Label (mono) |
|---|---|---|
| **Numeral** (Fraunces 73px honey) | $37–51M | WHERE THE MARKET CLEARS / 8–11X ADJUSTED EBITDA |
| Card 1 | $35.2M | REVENUE · 38% SERVICE |
| Card 2 | $4.64M | ADJUSTED EBITDA · 13.2% |
| Card 3 | Upper third | READINESS READ |

The stat strip follows the copy at a fixed 34px — **it is not pinned to the foot
of the column.** Pinned, it leaves a 400px hole in the middle of the page. The
empty green belongs BELOW the strip, where the ghost sits; that is the carousel
cover's own rhythm (see `hs-buybox` p01).

FORMATS.md §1: *"Every figure on a cover must survive the same audit as a body
figure. It is the most-screenshotted surface you make and the one most likely to
travel without its deck."* The numeral is `$4,640,000 × 8.0` and `× 11.0`, which
is the same arithmetic as the hero range card on page 3 — the cover cannot drift
from the body because it is the body's own number. Re-derive it with §4 and §5
if any input moves.

### P2 facts cards (4)

38% service & maintenance mix · $28.4M backlog, POC schedule current ·
22 states, national programs · 178 employees, 62-vehicle fleet

---

## 4 · The adjusted-EBITDA bridge (must sum exactly)

| Line | Note under the label | Amount |
|---|---|---|
| **Reported pre-tax income** | Per CPA-reviewed accrual statements, TTM June 2026 | $2,120,000 |
| Interest expense | Line of credit + equipment notes | +$410,000 |
| Depreciation & amortization | Fleet, fabrication equipment, leaseholds | +$1,290,000 |
| **EBITDA (10.9% of revenue)** — subtotal rule | | **$3,820,000** |
| Owner compensation above market | Owner-CEO total comp $750,000 vs. $375,000 market replacement | +$375,000 |
| One-time litigation settlement | 2024 project dispute — resolved, no recurrence | +$240,000 |
| Non-working family payroll | Two family members not active in the business | +$165,000 |
| One-time ERP implementation | 2025 system migration; run-rate support stays in overhead | +$112,000 |
| Personal expenses run through the business | Vehicles, travel, memberships | +$88,000 |
| Occupancy restated to market rent | HQ + fab shop owned by a related entity; $180,000 expensed vs. $340,000 market | −$160,000 |
| **ADJUSTED EBITDA (13.2% of revenue)** — total rule, green | | **$4,640,000** |

Check: 3,820,000 + 375,000 + 240,000 + 165,000 + 112,000 + 88,000 − 160,000
= **4,640,000** exactly.

Intro sentence above the table, verbatim: *"Buyers don't price the tax
return — their accountants rebuild it, adding back what won't recur under
new ownership and restating what isn't at market. This is that walk:"*

---

## 5 · The band, the ranges, the citations (REAL market data)

- Band: commercial mechanical, **5.0x–11.0x adjusted EBITDA**;
  project-led (<~15% service) clears **5–6x**; a real contracted service
  book commands **8–11x**.
- Applied to $4,640,000:
  - **Full published band: $23.2M – $51.0M** (5.0x–11.0x)
  - **Where the market clears: $37.1M – $51.0M** (8.0x–11.0x, brass-keyline hero card)
  - Check: 4.64 × 5.0 = 23.2 · × 8.0 = 37.12 → 37.1 · × 11.0 = 51.04 → 51.0
- Source block, verbatim: *"Band: smbX, 'The U.S. Commercial Mechanical,
  HVAC & Plumbing Services Market' (July 2026) — project-led lower-middle-
  market contractor 5–6x; 8–11x with a real service book. Underlying
  multiples carried from CT Acquisitions and the report's own source
  register. A range, never a single number: the exact landing point is
  priced in diligence."*
- Drivers attribution, verbatim: *"Readiness thresholds carried from smbX
  published assessments: 'Home Services — State of the Market' (Aug 2026)
  and 'Commercial MEP Buy-Side Assessment' (Aug 2026)."*
- "Each turn is worth roughly **$4.6M** of enterprise value" (= 1 × the
  adjusted EBITDA; keep consistent if values change).

### The five readiness drivers (P4 table, verbatim)

| Driver | Status | Note |
|---|---|---|
| Recurring revenue | Strength (green) | 38% contracted service & maintenance — above the ~30% mark where buyers re-rate a contractor, and the single largest reason this profile prices in the 8–11x tier rather than the project-led 5–6x. |
| Owner dependence | Watch (brass) | A GM and PM bench runs delivery; the owner still holds key program relationships. Buyers will test whether the business transfers — expect the question, and expect part of the answer to be priced. |
| Customer concentration | Watch (brass) | Top account (a national grocery rollout program) at 14% of revenue — inside the range buyers accept, but close to the 15–20% line they price against as the program grows. |
| Financial records | Strength (green) | Accrual books, outside CPA review, current POC schedules — the record-keeping that defends a multiple in quality-of-earnings. |
| Project weighting | Fix before sale (dark red) | 62% of revenue is project work. The published spread prices project-led books at 5–6x — every point of mix shifted toward contracted service moves this business deeper into the 8–11x tier. |

### P4 closing sections (verbatim)

**The real estate:** *"The headquarters and fabrication shop are owned by a
related entity, so two things hold. First, the range on page 3 values the
operating business at market rent — earnings were restated as if a
third-party landlord charged the $340,000 market rate. Second, the property
is a separate asset with its own value: buyers typically lease it back at
market or purchase it separately, and its value comes from a licensed real
estate appraiser — it is not included in the range and we do not estimate
it."*

**What moves the number:** *"Grow the service book past 45% — the published
spread says mix, more than size, is what separates 6x from 10x in this
trade. Name a president — the owner-dependence discount is the most fixable
line on the table above. Hold the rollout program under 15% of revenue as
it scales, or pair it with a second program of similar weight."*

### P3 prose sections (verbatim)

**Why the service book carries the multiple:** *"Project revenue re-wins
itself every year; a maintenance contract renews. Buyers underwrite the
renewal: contracted service revenue survives ownership change, smooths the
bid cycle, and feeds the project pipeline from inside customer buildings.
That is why the published spread between a project-led book and a
service-led book is measured in full turns of EBITDA — on Acme's earnings,
each turn is worth roughly $4.6M of enterprise value."*

**What underwrites the range:** *"Three things a buyer's diligence will
test, and where Acme stands in this sample: the work-in-progress schedule
(net overbilled $1.1M — cash-positive discipline, no borrowed margin);
surety ($15M single / $40M aggregate — capacity transfers with a
well-structured deal); and percentage-of-completion accounting reviewed by
an outside CPA firm, so the earnings above survive a quality-of-earnings
rebuild largely intact."*

---

## 6 · Standing sentences (verbatim, placed per §0)

- **Sample disclosure:** *"Acme Mechanical Group is an illustrative company
  created for this sample — its figures are hypothetical. Every market
  figure in this report is real, published, and cited."*
- **Disclaimer:** *"Market context from published transaction data applied
  to company-provided figures — not an appraisal or opinion of value.
  Actual transactions are priced in diligence."*
- **Closer body:** *"We are buy-side corporate development — acquirers pay
  us, owners never do. We built this because when a buyer engages us in
  your lane, we want to already know you. Run your valuation in the chat;
  your report lands in your inbox the same sitting."*
- **Closer steps:** 1. *"Pick your trade and answer the walk — about
  fifteen minutes, in plain chat."* 2. *"Your figures run the calculation
  and are never stored — the finished report is the one record, kept only
  if you say keep it."* 3. *"The report arrives by email — and when a buyer
  engages us in your lane, registered owners are the first call."*
- **Credits strip:** `EVERY MARKET FIGURE CITED · BUY-SIDE ONLY · NEVER A
  FEE FROM AN OWNER`

---

## 7 · Why these exact numbers (change any → re-check all)

The profile is tuned so the LIVE engine (`house/evaluate.ts`) would score
it identically — the sample never promises more than the product delivers:

- recurring 38% → +12 (30–40 tier) · manager-in-place → +8 ·
  top customer 14% → watch, +0 · books reviewed → +10 ·
  project/new-construction 62% > 20% → −8
- Score = 50 + 12 + 8 + 0 + 10 − 8 = **72 → upper third** ✓
- Revenue $35.2M ≥ $3M → **adjusted EBITDA basis** (not SDE) ✓
- Bridge sums to $4,640,000 ✓ · ranges = basis × 5/8/11 ✓
- Margin sanity: 38% service at 34% GM + 62% projects at 20% GM ⇒ 25.3%
  blended GP ($8.9M); adjusted EBITDA 13.2% is defensible ONLY because of
  the service mix — don't reuse this margin for a project-led example.

If you change the company profile, re-tune so the engine parity holds, the
bridge sums, and the ranges recompute — those three checks are the
difference between a sample and a fabrication.


---

## 9 · THE SIXTEEN-PAGE EXPANSION (2026-08-04)

Paul, against Experian/BizEquity's 29-page sample: *"we need to be more
thorough."* And on the closer: *"of course it is free… this is only a teaser
sample, it is marketing. The actual report done with them will be free."*

**On Experian, for the record.** It is long but thin. Six pages are generic
education, thirteen are one-ratio-per-page with a "give me an example" box, the
Value Map contains no company data at all, and its four value conclusions come
from *rules of thumb*. There is no add-back bridge, no comps, no readiness
assessment and nothing about what moves the number. The instruction here was
never to copy its padding — it was to add the architecture that signals depth
plus the sections it has nothing comparable to.

### 9.1 The page map

| # | Page | New? |
|---|---|---|
| 1 | Cover (block bookend) | — |
| 2 | Contents · how to read this report · the three approaches · why a range | **new** |
| 3 | Executive summary | **new** |
| 4 | The company · revenue by line | expanded |
| 5 | Earnings, normalized · which add-backs survive | expanded |
| 6 | Three years · trend in revenue, mix, margin | **new** |
| 7 | What buyers are paying · the band, applied · the tier table | expanded |
| 8 | Where this business sits · drivers · the two watch items priced · real estate | expanded |
| 9 | The numbers a buyer runs · ten ratios | **new** |
| 10 | What moves the number · the 24-month bridge | **new** |
| 11 | What the owner actually walks away with · the proceeds waterfall | **new** |
| 12 | What an offer looks like · structure · the working-capital peg | **new** |
| 13 | Who buys a business like this · four buyer types | **new** |
| 14 | What diligence will test · the QoE preview · maintenance capex | **new** |
| 15 | What happens next · the timeline · if you do only three things | **new** |
| 16 | Closer (block bookend) | — |

### 9.2 The new arithmetic — every figure derived, none invented free-hand

Three-year trend, built backwards from the TTM anchors so the blended gross
margin lands exactly on the 25.3% / $8.9M the original spec §7 already fixed:

| | FY2024 | FY2025 | TTM Jun-26 |
|---|---|---|---|
| Revenue | $28,600,000 | $31,900,000 | $35,200,000 |
| Service & maintenance | $9,400,000 | $11,300,000 | $13,400,000 |
| Service mix | 33% | 35% | 38% |
| Blended gross margin | 24.6% | 25.0% | 25.3% |
| EBITDA | $2,660,000 | $3,280,000 | $3,820,000 |
| **Adjusted EBITDA** | **$3,310,000** | **$4,020,000** | **$4,640,000** |
| Backlog | $21,200,000 | $24,900,000 | $28,400,000 |
| Employees | 141 | 159 | 178 |

Revenue CAGR 10.9%; adjusted EBITDA CAGR 18.4%.

Balance sheet, invented to be consistent with figures the original already
carried — interest expense implies the debt, WIP implies the billing position:

- Cash $1.85M · A/R $6.9M (**72 days**, the stated DSO) · underbillings $1.6M ·
  inventory $0.9M · fixed assets $4.2M
- Overbillings $2.7M — **net overbilled $1.1M**, matching §5 verbatim
- A/P and accrued $5.4M
- Line of credit $1.9M + equipment notes $3.3M = **$5.2M funded debt**, which
  implies a 7.9% blended rate against the $410,000 interest add-back
- Working capital **$3.15M = 8.9% of revenue**; net debt/adj EBITDA **0.72x**;
  total debt/adj EBITDA **1.12x**; backlog coverage **1.30x ≈ 16 months**;
  revenue per employee **$197,800**

Proceeds waterfall (page 11), at both ends of the clearing range:

| | 8.0x | 11.0x |
|---|---|---|
| Enterprise value | $37,120,000 | $51,040,000 |
| Less funded debt | −$5,200,000 | −$5,200,000 |
| Equity value | $31,920,000 | $45,840,000 |
| Less transaction costs @ 4% of EV | −$1,480,000 | −$2,040,000 |
| Gross proceeds | $30,440,000 | $43,800,000 |
| Less escrow @ 10% of EV | −$3,710,000 | −$5,100,000 |
| **Cash at close** | **$26,730,000** | **$38,700,000** |

24-month value bridge (page 10): revenue to $39.5M — **5.9% compound, below the
10.9% already achieved, deliberately** — with mix at 45%. Blended gross margin
26.3% (+1.0pt from mix alone, margins unchanged in each line). Adjusted EBITDA
$5,610,000 at 14.2%. Multiple 9.5–11.0x, which is **the upper half of the same
published 8–11x tier — no new band is introduced.** Range $53.3M – $61.7M;
midpoint moves $44.1M → $57.5M, **+$13.4M**.

**Where figures are practitioner norms rather than published data, the page says
so.** The structure percentages on page 12 and the cost/escrow percentages on
page 11 are sourced to "smbX buy-side practice", not dressed as market data.

**Page 9 deliberately has no "industry average" column.** Ratio benchmarks for
privately held mechanical contractors are widely republished and thinly sourced.
A comparison dot the reader cannot trace is exactly what Experian does and
exactly what law 2 forbids. The page says why, in the page.

### 9.3 Tax and real estate — still named, never estimated

Page 11 names the five facts that decide an owner's after-tax outcome (asset vs
equity sale, entity type, basis, state, price allocation), says they can move the
result by more than the negotiating range does, and sends the owner to their CPA
*before* the letter of intent. No figure. The real estate is a separate asset
valued by a licensed appraiser and is excluded from every number in the
waterfall. Both per §0 law 4.

### 9.4 The closer

Paul's line, verbatim: **"Preparation is key for a smooth transaction. Buyers
will appreciate it too."** The old headline — *"This report is free. Yours
included."* — was cut because free is not the news. The body now carries the
teaser/real-report distinction: *"This is the short version, built on an
illustrative company. The one we build with you runs on your figures and goes
further than these sixteen pages — and it costs you nothing, because acquirers
pay us and owners never do."*

### 9.5 PALETTE CORRECTIONS — read DESIGN.md, not just this file

FORMATS.md line 15 says DESIGN.md is the other half of the system and to read
both before building. A session that read only FORMATS re-derived the palette
from `tokens.ts` plus memory and shipped all five of these:

| Shipped | DESIGN.md says | Fixed to |
|---|---|---|
| Stat-card labels in **honey at 8px** | §4: honey is "large-text-only… never a caption" | `REPORT.statLabel` `#BFE3D2`, the token that exists for this job |
| Hook rule in **honey**, 72×4 square | §6.1: "a **mint** rule (70×6, fully rounded)" | mint `#A8F0CE`, 70×6, `border-radius:99px` |
| Headshot ring in **honey** | §6.1: "a 72px **mint**-ringed disc" | mint |
| Right-edge mono + closing CTA in **honey** | §4: mint carries "SWIPE and FOLLOW" | mint |
| `opacity:0.9` / `0.78` on block text | §4: "hierarchy comes from size and weight, not colour… the text is ivory, the secondary is `#DED8CC`, and that is the whole ladder" | removed entirely; two solid rungs |
| `#B00` for "Fix before sale" | §10: "a hex appears that is not in §4"; FORMATS §1: green is neutral, brass is caution — there is no third level | brass; the *word* carries the distinction |
| No bar under the signature numeral | §6.1: "the signature figure in honey **over an amber bar**" | 132×8 honey bar, fully rounded |

**EVERY white-family text token on the block is `#FFFFFF` here, and that is a
knowing divergence.** Paul, 2026-08-04: *"All the white text should be bright
white"*, and then again on the footer: *"the bottom line is still a darker white
and not bright white."*

DESIGN.md §4 runs a two-rung block ladder — ivory `#F2FBF6` for reading text,
`#DED8CC` for secondary — plus two pale-mint label tokens, ivory-sub `#C9E8DA`
and stat-label `#BFE3D2`. All four are now white in this artifact.

Read carefully, that is a *tightening* of §4's own principle rather than a
rejection of it. The sentence is: "on the block, hierarchy comes from **size and
weight, not colour**." One white, sized and weighted, is that rule with nothing
left over — and a dimmed near-white on a green field reads as dirty rather than
as hierarchy, which is what Paul kept seeing at the foot of the page.

Honey and mint are untouched. They are not white text; they are the accent and
the jewelry, and they still carry every job §4 gives them. Making the white
change house-wide is an edit to `LEDGER.ivory`, `REPORT.ivorySub`,
`REPORT.statLabel` and DESIGN.md §4, and **has not been made.**

### 9.6 THE THREE GUARDS — why this should stop recurring

Paul: *"I don't understand how we're having to go back and make so many
corrections that we've corrected a hundred times already."*

Because the rules live in prose a session has to remember, and this file is
hand-written CSS that inherits none of them. DESIGN.md §10 names it as drift
tell number one: *"You wrote HTML or CSS. The single largest tell."*
`design-check.mts`, `voice-check.mts` and `verify-spec.mts` all read a
`.deck.mts` / `.post.mts` spec — **none of them can see this file.**

So the builder now checks itself, and **exits non-zero** rather than warning:

1. **Preflight (exit 2)** — no `opacity` outside `.ghost`; no honey or amber on
   text under 18px except the sanctioned `.kicker` eyebrow; no hex outside
   DESIGN.md §4, scanned across the stylesheet **and the inline styles in the
   markup** (which is how `#B00` got in). It caught two violations on its first
   run.
2. **Overflow guard (exit 4)** — every `.pg` measured against its sheet.
   FORMATS.md §3.2: overflow is *silent*. Three pages were over on the first
   sixteen-page build and nothing else would have shown it.
3. **Renderer-proof guard (exit 3)** — `/Group` and `/Shading` counted in the
   finished PDF. See §1.

**The durable fix is still open and is Paul's call.** This artifact should move
onto `build-report.mts`, whose cover (DESIGN.md §6.3) already carries the logo,
eyebrow, title, rule, hero image, a three-card stat band and the byline — most
of what was hand-built here. The gap is the giant numeral and the ghost X, which
would be two optional cover slots on the house builder. That change also fixes
the renderer-proof defect every existing report PDF carries.
