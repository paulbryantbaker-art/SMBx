# Collateral formats — the exact spec, and the imagery brief

Two jobs live here, and they are the same job: **what goes in the container, and
what shape the container is.** Drift happens when a session improvises either.

---

# LAW 1 — Never hand-roll a layout

There are three builders. They are deterministic: the same spec renders the same
pixels every time. **Do not write HTML, do not write CSS, do not "match the
style" by hand.** If the output looks different from the last one, the *spec* is
wrong, not the renderer.

```
build-report.mts    <doc.md>          long-form PDF report      (Letter)
build-deck.mts      <spec.deck.mts>   LinkedIn carousel         (1080×1350/page)
build-onepager.mts  <spec.post.mts>   single-image LinkedIn post (1080×1350)
```

Run them from the workspace root. They default to `./media` + `./assets` for
images and `./collateral` for output — no flags needed.

If a layout genuinely cannot express something, say so and stop. Do not invent a
page.

---

# LAW 2 — Only certain slots take an image

This is the single most common failure. An `image:` key on a page kind that has
no image slot is **silently dropped** — the build succeeds, the picture is gone.

## Carousel (`build-deck.mts`)

```ts
export const deck = {
  slug: 'home-services-map',
  kicker: 'MARKET MAP',                    // mono header label
  cover: { hook, sub?, image?, imagePos? },   // ← IMAGE SLOT
  pages: [ … ],
  closer: { tag?, head, body? },
  headshot?: string,
  caption?: string,                        // the LinkedIn post text
}
```

Page kinds:

| kind | fields | image? |
|---|---|---|
| `numeral` | `numeral, unit?, head, body?, source?` | **no** |
| `statement` | `tag, tagColor?:'green'\|'brass', head, body?, source?` | **no** |
| `diagram` | `tag, head, body?, source?, connector?, bars:[{label,sub,style:'ink'\|'green',h}]` | **no** |
| `trade` | `name, image?, imagePos?, numeral?, unit?, head, body?, source?` | **YES** |

**To put a photo on a body page, the page kind must be `trade`.** There is no
other option. Cover and closer are dark bookends and are added automatically —
never write them as pages.

## One-pager (`build-onepager.mts`)

```ts
export const post = {
  kicker?, numeral?, numeralLabel?, hook, body?, invite?, cta?,
  byline?: { name?, title? },
  image?, imagePos?,                       // ← IMAGE SLOT (omit for a full-width text card)
  variants?: ['dark','light'],             // default: both
  caption?,
}
```

## Report (`build-report.mts`)

Plain markdown, plus an HTML comment block at the very top:

```
<!--cover
byline: Paul Baker
role: smbX.ai · Buy-side corporate development
headshot: founder-portrait.jpg
image: home-services-cover.jpg          ← COVER IMAGE SLOT
imagePos: 50% 50%
eyebrow: MARKET ASSESSMENT
footer: Home Services — Market Assessment
stat: $753–768B | Six trades, U.S. revenue
stat: 50.6% | PE share of HVAC deals
accent: Where the openings are | openings.jpg | 50% 40%   ← SECTION IMAGE SLOT
-->
```

`stat:` and `accent:` repeat. `accent:` is `<heading substring> | <image> | [position]`
and drops a banner right after the matching `## ` header.

Everything before the first `---` is the cover; everything after flows as the
body. Lead with one `# Title`.

---

# LAW 3 — The container dimensions are fixed. Compose for them.

Every image slot is `object-fit: cover` — the image is scaled to fill and the
overflow is **cropped from the centre**. A square image in a tall slot loses over
half its width. This is why images "don't fit."

| Artifact | Slot | Box (px or in) | Ratio | Ask Gemini for |
|---|---|---|---|---|
| Carousel | cover panel | 476 × 1102 px | 0.43 (≈3:7) | **9:16** |
| Carousel | `trade` page | 404 × 604 px | 0.67 (2:3) | **3:4** |
| One-pager | photo column | 470 × 1350 px | 0.35 (≈1:2.9) | **9:16** |
| Report | cover hero | 5.84 × 2.05 in | 2.85:1 wide | **16:9** |
| Report | `accent:` band | 7.0 × 2.2 in | 3.18:1 wide | **16:9** |

Gemini only emits standard ratios, so **none of these match exactly** — every
image gets cropped. Two rules make that survivable:

1. **Compose for the centre band.** Tell Gemini to keep the subject in the middle
   with generous empty space on the axis that will be cropped — top and bottom
   for the wide report banners, left and right for the tall carousel panels.
2. **Steer the crop with `imagePos`.** It is a CSS `object-position`: `50% 30%`
   keeps the upper-middle, `50% 70%` the lower. Adjust it after looking at the
   render rather than guessing.

Render, look at the actual output, adjust `imagePos`, render again. One pass of
this is the difference between "fits" and "doesn't."

---

# LAW 4 — Every production run produces an imagery brief first

**This step is not optional and not conditional.** After the research is
synthesized and before any collateral is built, work out what imagery the piece
needs and write the Gemini prompts. Skipping it is how a deck ends up with a
cover photo and five bare text pages.

Write it to `markets/<market>/collateral/image-brief.md`. One block per image:

```markdown
## 1. Carousel cover
file:   home-services-cover.png        ← save the Gemini export here, in media/
slot:   carousel cover panel · 476×1102 · request 9:16
imagePos: 50% 45%

PROMPT
A flat editorial illustration of a residential HVAC condenser unit beside a
suburban house wall, drawn in clean geometric line work. Deep green (#16624C)
and brass (#B08637) on a warm bone background (#F6F4EF). Subject centred with
generous empty background to the left and right. Uniform flat background to all
four edges. No text, no lettering, no people, no logos, no charts, no vignette,
no drop shadow, no edge fade. 9:16 portrait.
```

### The prompt rules, every time

These are learned constraints — each one exists because breaking it produced an
unusable image:

- **Palette, always named:** Deal Green `#16624C`, brass `#B08637`, ink
  `#14181C`, bone `#F6F4EF`, dark `#0F1A16`.
- **Flat editorial illustration.** Not photorealistic, not 3D, not a stock-photo
  look.
- **Ban, in every prompt:** text, lettering, numbers, people, faces, logos,
  charts, graphs.
- **Ban baked-in effects:** vignette, edge fade, gradient background, drop
  shadow, border, frame. The layout applies its own framing; an image that
  arrives pre-faded prints as a smudge against the page.
- **Uniform flat background to all four edges** — this is what makes the crop
  survivable.
- **State the aspect ratio** from the table above.
- **Name the composition margin:** which side has empty space, so the crop takes
  background rather than subject.

### Photographs are different

Generated *illustration* is fine because it is obviously illustration. A
photograph that implies something happened is not. **Real or none.**

**Never AI-generate or alter a photo of Paul.** The headshot is
`$REPO/client/public/founder-portrait.jpg`; the walking shot is
`founder-walking.webp`. Those are the only photos of him that exist.

---

# The order of operations

```
1. master.md synthesized + audited
2. image-brief.md written          ← LAW 4, every time
3. Paul generates in Gemini, saves into media/
4. spec written (deck / post / report cover block)
5. build → look at the render → fix imagePos → build again
6. audit any document that carries figures
```

Step 5 is not optional either. Look at the output before calling it done.
