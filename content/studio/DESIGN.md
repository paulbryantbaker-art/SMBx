# The house design language — collateral

> ## ⚠ INTERIM: the WEBSITE has moved and the collateral has not (2026-08-07)
>
> The public site is being rebuilt in a new language (the Carta-restyle handoff:
> Source Serif 4 + Schibsted Grotesk, flat near-black bands, square corners,
> corner-handle frames, no warm second accent). **The collateral you build from
> this document still uses the Ledger/Aurora system and will NOT match the
> website until the phase-2 renderer pass.**
>
> This is a deliberate, time-boxed split — Paul's call was site first, collateral
> right after — and it is written here because the sentence directly below this
> box would otherwise be a lie, and because a session that noticed the mismatch
> would reasonably "fix" it by inventing values.
>
> **What to do meanwhile: keep building collateral exactly as this file says.**
> `house/tokens.ts` holds both systems side by side — `LEDGER` (collateral, what
> this document describes) and `CARTA` (the site). Do not read CARTA values into
> a deck, a report or a one-pager; the builders import LEDGER and that is
> correct until phase 2 moves them together.
>
> **The phase-2 work order now exists:**
> `content/studio/CARTA_COLLATERAL_CONVERSION.md` (repo, not the workspace —
> it changes renderer code). It carries the token-by-token translation, the
> six files that change, the traps, and the order of work. **Closing it
> includes rewriting THIS document and deleting this box**, which is the last
> step in that order. Until someone runs it, this box is still true.

Everything smbX produces looks like one practice because every renderer reads
the same values. This file is what those values are, what they came from, and
what is retired.

**FORMATS.md is the container: which builder, which fields, what size the image
slot is. This file is the look: colour, type, layout grammar, marks.** Read
FORMATS.md to know where a thing goes. Read this to know what it looks like when
it gets there. Neither repeats the other.

## Where the truth is

`house/tokens.ts` in the repo holds every colour and typeface as code, and all
three builders import it. **If this document and that file disagree, the file
wins and this document is a bug** — say so rather than working around it.
`house/__tests__/design.test.mts` checks the two against each other, and against
the website's stylesheet, on every run.

So: you never pick a colour. You never pick a size. Those decisions are already
made, in code, and the renderer applies them whether you know them or not. This
file exists so that when you *describe* the work — an image prompt, a caption, a
note to Paul — you describe the real thing.

---

# 1. Paste this into anything that needs the short version

> smbX house style ("Ledger", Aurora pass) — a bright fintech-editorial
> system. White paper `#FFFFFF` (canvas moved bone→white 2026-08-12,
> matching carta.com's measured ground), ink `#16181A`, hairline cards.
> **Exactly one accent: Deal Green `#0A7A58`**, with vivid jade `#0FA97C`
> reserved for large numerals, edges and ambient blooms — never small text, it
> does not hold contrast. Amber `#E8A62B` is jewelry — the bar under a
> signature numeral, one mono label — never body text, never a button, never a
> second accent. **Nothing in this system is near-black.** The full-bleed
> rhythm break is a saturated jade block `#0A6A4C` with ivory text `#F2FBF6`,
> mint `#A8F0CE` rules and honey `#F5C452` numerals. Display type is
> **Fraunces** at weight **545**; working type is **Inter** with tabular
> figures; labels are **IBM Plex Mono** at 13px+ with ≤0.12em tracking. Buttons
> are pills, cards are 12–24px radius. A cited number rendered enormous IS the
> graphic. Photography is real or absent. **Never: coral `#FF385C`, terra cotta
> `#D4714E`, office blue `#185ABD`, neon `#00D632`, hot pink `#D44A78`, the
> retired Ledger greens `#16624C` `#0F4E3C` and the boardroom near-black
> `#0F1A16`, lavender, gradient CTAs, decorative micro-labels, stock
> photography.**

---

# 2. DEAD — if this is in your draft, you drifted

Every one of these was a real smbX system. Every one is retired. They are listed
with their hexes because that is how you catch yourself: a hex that is not in
§4 is not ours, and most of the wrong ones are here.

| Dead system | Signature | Died |
|---|---|---|
| Ledger green-black (the first Ledger pass) | Deal Green `#16624C`, hover `#0F4E3C`, boardroom band `#0F1A16` — a near-black with a green cast | 2026-07-31 |
| Coral practice site v1–v3 | `#FF385C` `#E61E4D` `#D70466`, pink/rose ambient washes | 2026-07-17 |
| Office-blue pivot (lasted one day) | `#185ABD` `#124A9E` `#9EC1FF` | 2026-07-17 |
| Terra cotta wireframe pass | `#D4714E`, clay / apricot / "warm" anything | 2026-07-10 |
| Liquid-glass product marketing | neon `#00D632`, canvas gradients, glass cards | 2026-07-11 |
| V6 slate / lavender / periwinkle | slate-blue chips, lavender surfaces | 2026-06-24 |
| Hot pink V3/V4 | `#D44A78` | 2026 spring |
| Warm-cream "Edition" era | cream editorial, serif columns | 2026 spring |

**The variable-name trap.** The live website stylesheet still calls the accent
`--pd-coral`, `--pd-coral-link`, `--pd-cta`. Those names are historical — the
system went coral → blue → green and the slots were reused rather than renamed.
**Their values are the greens in §4.** Never infer a colour from a variable name;
read the value.

**Why the drift happens, so you can see it coming.** This repo's history
contains all eight systems above, in committed CSS, in design bundles, in old
briefs. Anything reconstructing "the smbX look" from general familiarity rather
than from `house/tokens.ts` will surface one of them, confidently.

The old tell was "a warm accent where a green belongs", and as of the Aurora
pass that tell is **retired and actively misleading** — amber is now a working
house colour, so warmth on the page is no longer evidence of anything. The
current tells are darkness and dullness: a near-black band, or a green so deep
it reads as a forest. If a surface looks heavy, you are probably in the 2026-07
Ledger green-black, which is the newest dead system and therefore the easiest
one to mistake for current.

---

# 3. It looks like the website because it is the website's values

This is not a resemblance. It is the same numbers, and the same markdown.

**The report and the research page are one document.** `build-report.mts` turns
a `.md` into the PDF; `vite-plugins/report-markdown.ts` renders **that same
`.md`** into the page at `smbx.ai/research/<slug>`, reading the same
`<!--cover-->` block. The web page even adopts the PDF's darker reading ink
`#3F464C` instead of the site's own body grey, because it is holding parity with
a printed document. Page and PDF cannot drift, because there is nothing to drift
*from*.

The rest maps one-to-one:

| Website | Collateral | Value |
|---|---|---|
| Page canvas | light deck pages, light one-pager, report body | bone `#FFFFFF` (white since 2026-08-12) |
| `--pd-ink` headlines | heads on light pages | `#16181A` |
| `--pd-body` copy | body on decks and cards | slate `#5A6169` |
| `--pd-tert` | sources, page numbers, captions | muted `#83898F` |
| `--pd-hair` rules | hairlines, table rules, image frames | `#EAE5DC` |
| `--pd-coral` *(green)* | tags, rules, list markers, links | Deal Green `#0A7A58` |
| `--pd-jade` | ambient blooms, the hero mesh, large numerals | jade `#0FA97C` |
| `--pd-brass` | the bar under a numeral, KEY FINDINGS | amber `#E8A62B` |
| `--pd-dark-bg` blocks | cover, closer, dark one-pager, report cover | jade block `#0A6A4C` |
| Block ivory text | reading text on every block surface | `#F2FBF6` |
| `.pd-h1/.pd-h2` Fraunces 545 | every hook and head | Fraunces 545 |
| Site body Inter + `tnum` | all working copy and every figure | Inter, tabular |
| `.pd-num` giant numerals | the numeral page, the one-pager figure | Inter 800 |
| Dark-band texture | every dark surface | `/textures/blackbleed.webp` |

When someone opens the PDF you posted and then clicks through to the site, the
two have to read as the same practice. That is the whole point of the system,
and it is why none of it is yours to adjust.

---

# 4. The palette

Verbatim from `house/tokens.ts`. Nothing outside this table is a house colour.

### Canvas and ink

| Name | Hex | Where it goes |
|---|---|---|
| bone | `#FFFFFF` | page canvas on every light surface (the token keeps its historic NAME; the value moved to pure white 2026-08-12 — Paul, side-by-side with carta.com: "the background is definitely darker still") |
| ink | `#16181A` | headings and primary text on light |
| slate | `#5A6169` | body copy on decks and cards |
| muted | `#83898F` | sources, vintages, page numbers, captions |
| hair | `#EAE5DC` | hairline borders, table rules, image frames |
| rule | `#DED8CC` | heavier dividers; secondary text on the block |

### The one accent

| Name | Hex | Where it goes |
|---|---|---|
| **Deal Green** | `#0A7A58` | THE accent — tags, rules, list markers, links, solid bars, every button fill |
| green hover | `#086348` | pressed and hover states |
| green tint | `#DFF5EC` | chip fill, with green text on top |
| **jade** | `#0FA97C` | large numerals, block edges, ambient blooms, the hero mesh — **never small text** |
| mint | `#A8F0CE` | rules on the block, the headshot ring, SWIPE and FOLLOW |

One accent means one. A second colour introduced "for contrast" is the most
common way this system is broken. Jade is not a second accent — it is the same
green at a lightness that cannot carry text, which is why its row says so.

**Why jade is not the accent, when it obviously wants to be.** It fails
contrast, and it fails invisibly: white on jade is 2.97:1 and jade as link text
on bone is 2.85:1, both under the 4.5:1 floor, and neither shows up in a diff
or in a screenshot you are not squinting at. Deal Green sits deep enough to
hold white at 5.3:1. **If you find yourself reaching for jade because the green
looks dull, the answer is a bigger numeral, not a lighter green.**

### Jewelry

| Name | Hex | Where it goes |
|---|---|---|
| **amber** | `#E8A62B` | on LIGHT surfaces: the bar under a signature numeral · the cover eyebrow · report part-rules and table underlines · one mono tag · the notice rail |
| **honey** | `#F5C452` | the same jobs on the jade block, where amber drops to 3.8:1 |

Amber is not an accent, it is punctuation. Never body text, never a button,
never a fill. It is a large-text-only colour on both grounds — a numeral, a
rule, a tag — never a caption.

### The block

| Name | Hex | Where it goes |
|---|---|---|
| dark | `#0A6A4C` | the full-bleed rhythm break |
| ivory | `#F2FBF6` | all reading text on the block |

The token is still named `dark` because six renderers and the site stylesheet
reference it; it means "the rhythm break", not "near-black". **Nothing in this
system is near-black.**

**The block recipe**, identical on every such surface: base `#0A6A4C`, the
`blackbleed.webp` texture at `center/cover`, **an 0.84 glaze of the base colour
OVER the texture**, then a jade top halo. Never aubergine, never a flat
charcoal, never an unglazed texture.

**That 0.84 is the single most breakable number in this document.** The texture
is a near-black image and it sits ABOVE the colour in the stack, so it wins
outright at a low alpha — the colour underneath is only ever a no-image
fallback. Write the recipe the intuitive way and every block on every surface
renders near-black while the code reads as though it is jade. There is no error
and no visual diff to catch it; the palette change simply does not happen. Use
`blockBackground()` from `house/tokens.ts` and do not hand-roll the stack.

On the block, hierarchy comes from **size and weight, not colour** — the text
is ivory, the secondary is `#DED8CC`, and that is the whole ladder.

### Long-form reading

| Name | Hex | Where it goes |
|---|---|---|
| report body | `#3F464C` | report PDF body **and** the research web page |
| ivory-sub | `#C9E8DA` | cover sub-text on the block |
| stat label | `#BFE3D2` | cover stat-card labels |
| table head | `#F1ECE0` | GFM table header fill |

Report body is deliberately darker than slate: a page read for twenty minutes
wants more contrast than a slide glanced at for two seconds.

---

# 5. Type

Three faces, one job each. They are embedded as base64 in the renderers — no CDN,
no system fallback, no exceptions.

| Role | Face | Spec |
|---|---|---|
| Display — hooks, heads, pull-quotes, cover titles | **Fraunces** | weight **545** (not 600), tracking ≈ −0.012em, `text-wrap: balance` on hooks |
| Working — body, UI, bylines, everything else | **Inter** | 400–800, `font-variant-numeric: tabular-nums` globally |
| Labels — kickers, sources, page numbers, CTAs | **IBM Plex Mono** | uppercase; tracking by role, 0.03–0.05em on sources and table headers, 0.1–0.16em on kickers, 0.2em on the report cover eyebrow |
| Signature numerals | **Inter 800** | huge, tracking −0.03em, usually over a brass bar |

**Hard floor on screen: no customer-facing text below 13px.** The mono labels on
the carousel run 16–18px and never go under. Print is a separate scale — the
report's smallest type is 6.6pt on stat labels and 7pt in the running footer,
which is legible at print resolution and is the floor there.

**Fraunces has a swash ampersand** and it is the default glyph, not an optional
alternate. At title size "M&A" becomes something nobody recognises. The report
builder already sets the ampersand in Inter and switches ligatures off — if you
see a strange `&` in a render, that is the cause, not the font loading wrong.

---

# 6. The three formats, as they actually render

You do not build these. The builders do. This is here so you can tell whether
what came out is right, and so a spec you write lands in the shape you intended.

## 6.1 Carousel — `build-deck.mts`, 1080×1350 per page

**The bookend law: exactly two dark pages, the first and the last.** The cover
and closer are dark and are added automatically. Never write them as pages, and
never add a third dark page — a deck that ends on two darks in a row was the
defect this law was written to fix.

**Cover** (dark). A 544px copy column on the left over the boardroom band: white
logo and a **brass** mono kicker at the top, then, vertically centred, the hook
in Fraunces 52px ivory, a mint rule (70×6, fully rounded), and an optional sub
at 22px. The image bleeds in a framed white panel on the right — 24px radius,
faint ivory hairline. A 128px foot band carries the white logo, Paul's headshot
in a 72px mint-ringed disc with his name and "Buy-side corporate development",
and `SWIPE →` in mint mono at the right edge.

**Body pages** (light bone). Every one carries the same furniture: a top rail
with the ink logo and the mono kicker over a hairline; a bottom band 84px tall
in dark with the white logo and `n / total` in mono; and a ghost page numeral —
Fraunces at 360px in 5%-opacity ink, sitting behind the content. Four kinds:

| kind | what it is | image |
|---|---|---|
| `numeral` | the figure at 290px over a 132×8 brass bar, Fraunces head, source on a hairline rail at the foot | no |
| `statement` | mono tag (green or brass), Fraunces head at 58px, a 96×6 **green** rule, body, source | no |
| `diagram` | tag, head, then bars — 168px wide, ink outline or solid green, Fraunces figures, brass connector between them | no |
| `trade` | text left, framed image card right at 404×604 with a 24px radius | **yes** |

**`trade` is the only body page with an image slot.** An `image:` key on any
other kind is silently dropped — the build succeeds and the picture is gone.
This is the single most common failure and FORMATS.md says it too, because it
costs a full rebuild every time.

**Closer** (dark). Centred: brass tag, Fraunces head at 48px, mint rule, body,
then the headshot at 104px with the byline, the white logo, and
`FOLLOW FOR THE NEXT READ.` in mint mono.

## 6.2 One-pager — `build-onepager.mts`, 1080×1350

A vertical split: a 610px copy column and a 470px full-bleed photo. **Omit the
image and the copy fills the whole 1080** — that is a real format, not a
degraded one.

Renders **dark and light by default**, and both are house. Dark is the boardroom
band; light is bone with a whisper of green in the corner. The column runs:
logo and brass mono kicker at the top; centred, an optional giant Fraunces
numeral (mint on dark, green on light) with a mono label, the hook in Fraunces
45px, a mint rule, body, a bolded invitation line, and a mono CTA; at the foot,
above a hairline, the byline with the logo at the right.

**The seam is a dark gradient on the photo's left edge**, deliberately. Nothing
light sits near the join, so no renderer can crack it into a white line — which
is exactly what happened for three rounds when it was built the obvious way.

Outputs: a PNG to post, a flat single-image PDF, and `-caption.txt`.

## 6.3 Report — `build-report.mts`, Letter

**Cover** (dark boardroom, 12px radius, full page). White logo pinned
top-left — never stretched; it is a 4:1 mark. Then a **brass** mono eyebrow at
0.2em, the title in Fraunces 26pt ivory, a brass rule, an optional framed hero
image at 2.05in tall, and an optional stat band — three framed cards with brass
Fraunces numerals and mono labels, which is where "by the numbers" lives.
Paul's headshot, name and role pin to the bottom above a hairline.

**Body** (bone page, `#3F464C` ink at 10.5pt). `#` parts break to a new page
under a 2.5px brass top rule; `##` sections are Fraunces 14.5pt; `###` is Inter
700. List markers and links are **green**. Tables are hairline with a bone
header, mono uppercase column labels, and a 1.5px **brass** underline. A
blockquote is a **notice** — a brass left rail and the faintest brass
fill — because in these documents a blockquote is a correction or a caveat the
reader must not skim. Every page carries a mono footer: `smbX.ai · <label>` and
`Page n / N`.

An `accent:` image drops a framed 2.2in band under its section header. Framed,
always — a soft-edged image on bone paper prints as a smudge.

---

# 7. The standing marks

**Logo.** `logo-green-x.png` on light, `logo-green-x-dark.png` (white wordmark,
mint X) on dark. Never redraw it, recolour it, stretch it, or add an effect. If
you see `logo-coral-x.png` or `logo-blue-x.png` in the folder, those are history
kept on disk — using one is a drift, not a choice. Dead files you may see named
in old docs and will not find: `G3L.png`, `G3D.png`, `x-logo.png`, `GX.png`,
`redx.png`.

**The face is the trust layer.** Paul's real headshot appears on every artifact:
report cover byline, one-pager foot, carousel cover and closer. Round crop, mint
ring on dark. `client/public/founder-portrait.jpg` is the file; the walking shot
is `founder-walking.webp`. **Those are the only two photographs of him that
exist. Never generate or alter one.**

**Byline.** "Paul Baker" / "Buy-side corporate development". Not a title he does
not hold, not a company line that implies staff.

---

# 8. Graphics doctrine

**The number is the graphic.** A cited figure set enormous over a brass bar
beats any illustration, and it is the house signature. Every number on a surface
must be traceable to a source — the citation law in CLAUDE.md applies to
collateral exactly as it applies to a master. **Never a fabricated chart, never
an invented benchmark, never a figure that reads well.**

**Illustration is allowed. Photography is real or absent.** A generated image
that is obviously a drawing is fine. A photograph that implies something
happened is not — no stock, ever, and no photoreal people. FORMATS.md §4 has the
prompt rules and the slot dimensions; the parts that are *design* rather than
geometry: name the hexes from §4 in the prompt, ask for flat editorial
illustration, and ban baked-in vignettes, edge fades, gradient backgrounds and
drop shadows. The layout applies its own framing. An image that arrives
pre-faded fights it and loses.

**No decorative eyebrows.** A small uppercase label above a heading, saying
nothing the reader could not infer — `PIPELINE`, `MARKET INTELLIGENCE` — is
filler and reads as such. The mono kickers in these formats are real: they name
the document. A label earns its place only by carrying information.

---

# 9. Voice on a designed surface

The words are part of the design. Full laws in CLAUDE.md; these are the ones
that show up in collateral:

- Senior operator writing for a principal. Specific, unhurried, no hype.
- **No AI self-reference of any kind**, anywhere, ever.
- Describe the work, never a competitor. No grievance copy.
- The category is a corporate development function — not a cheaper bank.
- Buy-side loyalty stated warmly and **once**. Never a stacked oath.
- Track record: "led or co-led", "selected transactions", employers anonymised
  as "a global investment bank" and "a world-class PE-backed aggregator", total
  stated as **150 acquisitions**. The attribution line goes wherever the deal
  names go — never as a footnote.
- **No fee talk, no pricing, on any public surface.**
- Client-facing documents end on what we don't know yet.

---

# 10. Drift tells

Check your own output against these. Each one has actually happened.

- [ ] **You wrote HTML or CSS.** The single largest tell. House collateral comes
      out of the three builders. A 52-page report once shipped in the wrong
      typeface because a session could not find the template and wrote its own
      stylesheet to "match the style". If a builder will not run, stop and say
      so — do not approximate it.
- [ ] **A hex appears that is not in §4.** Especially a warm one.
- [ ] **The words "warm", "coral", "terracotta", "cream" describe an intent.**
      This palette is bone and green. Warmth is not a direction here.
- [ ] **A second accent** introduced for contrast, or brass used as one.
- [ ] **A gradient on a button or a card.** Ambient only, and only in the
      recipes above.
- [ ] **An `image:` key on a `numeral`, `statement` or `diagram` page.** Silently
      dropped.
- [ ] **A third dark page**, or a deck that ends on two darks.
- [ ] **A decorative micro-label** above a heading.
- [ ] **A stock photograph**, or any generated image of a person.
- [ ] **A number you cannot point at a source for.**
- [ ] **You inferred a colour from a variable name.** `--pd-coral` is green.

If several of these are true at once, you did not make a series of small
mistakes — you anchored on a retired system. Stop, re-read §2 and §4, and start
the surface again.
