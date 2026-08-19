# Claude Design brief — the smbX social one-pager ("figure card")

**Client:** Paul Baker · smbX.ai · buy-side corporate development practice.
**Date:** 2026-08-18. **This bundle is self-contained** — every law, token,
asset and reference you need is inside it.

## What to build

A **1080 × 1350 px LinkedIn single-image post template** in the practice's
CARTA design language. The fixed idea, already approved and in production:
Paul's full-length figure stands oversized on the card, the copy wraps his
silhouette, and the card reads as *his* — a practitioner speaking, not a firm
broadcasting.

What Paul wants from YOU is the part iteration hasn't cracked: **make the
card's ground and composition genuinely interesting — engaging, catchy,
scroll-stopping in a LinkedIn feed — without leaving Carta.** Every attempt so
far either stayed correct-but-flat or drifted into the retired Ledger
atmosphere (gradients, glows, textures). The answer is structural, not
atmospheric, and finding it is the assignment.

Design it around the working copy in `laws/day-four-questions.post.mts`
(hook · lede · three numbered questions · mono source line · byline foot with
headshot + `smbx.ai →`). The template must generalize: next week the same
slots carry different copy.

## Deliverables

- 3–6 distinct directions, EACH as a **single self-contained HTML file at
  exactly 1080 × 1350** (inline CSS, images by relative path to `assets/`,
  fonts from `assets/fonts/` via @font-face — Source Serif 4 variable,
  Schibsted Grotesk 400/600/700, IBM Plex Mono 400/600). No JS needed.
- Both a **light** and a **dark** expression of the winning direction.
- A short `TOKENS-USED.md`: every hex in your output, mapped to the token
  name in `laws/tokens.ts` it came from.
- Why HTML at exact size: the practice's renderer transcribes handoffs 1:1
  into its builders (that is how the current site was built from the last
  Claude Design handoff), so a file we can measure is a file we can ship.

## The design language, in one paragraph

CARTA (full law: `laws/DESIGN.md`, tokens: `laws/tokens.ts`). White canvas
`#FFFFFF`, warm panels `#F3F0E9`, cooler ink scale (`#16181A` / `#4A4F54` /
`#7C8187`), **one accent** — Deal Green `#0A7A58`, tint `#DFF5EC`, mint
`#A8F0CE` on dark — flat near-black bands `#181818`, hairlines `#E4DFD3`,
**radius 0 everywhere** except buttons/inputs, and the house gesture: **four
8px ink corner handles at −4px** on frames and plates. Type: Source Serif 4
(display, weight 545–600), Schibsted Grotesk (working), IBM Plex Mono
(kickers, sources, tickers). Structure carries the drama — oversized serif,
hard-edged flat blocks, hairline grids, dot-fields, the orbit ring with
square nodes sitting ON the arc.

## Hard laws — violations make the work unusable

1. **No gradients, no textures, no glazes, no glows, no drop shadows, no
   vignettes.** That is the retired Ledger language; `laws/DESIGN.md` §2
   names every dead system with hexes. ONE sanctioned exception exists and is
   already designed (the dark card's radial green bloom — see
   `reference/approved-dark-C.png`); do not invent others by default. If a
   direction truly needs a new mechanic, deliver it clearly FLAGGED as a
   proposed amendment — Paul sanctions those personally.
2. **Every color is a token from `laws/tokens.ts` (the CARTA block).** No new
   hues. One accent family: the greens. No amber, no brass, no warm accent.
3. **Radius 0.** Square corners on plates, frames, chips, images. A rounded
   card is Ledger.
4. **The three faces only** — Source Serif 4 · Schibsted Grotesk · IBM Plex
   Mono, from the bundled files.
5. **The figure is `assets/founder-standing.png`, unaltered** — no recolor,
   no effects on the person, never a generated or stock human anywhere.
   Exposure lift up to brightness 1.16 / contrast 1.05 is pre-approved on
   dark grounds only.
6. **The logo is used as shipped** (`logo-green-x.png` light /
   `logo-green-x-dark.png` dark) — never redrawn, recolored, or stretched.
7. **Real headshot in the byline foot** (`founder-portrait.jpg`), round crop,
   **opaque neutral ring — never green next to a face**, name + "Buy-side
   corporate development", `smbx.ai →` as the CTA (bright white on dark
   grounds, Deal Green on light).
8. **Copy is verbatim** from the spec — figures may not be restyled into
   new claims, the mono source line must survive legibly, and nothing may
   imply a fee, a client, or sell-side work.

## Open territory — be bold here

Composition and ground are yours: flat color-block plates the figure overlaps,
hard splits (the site uses golden-ratio splits — 61.8% is a house number),
banded grounds echoing carta.com's section rhythm, the orbit ring
(`reference/edge-compare-v2.png`, tile A — Paul approved this ornament), dot
fields, ghost X, oversized ghost numerals, mono tickers, asymmetric frames,
type-as-architecture. The figure's placement, scale and which side he stands
on are all negotiable. The wrap-the-silhouette idea may be reinterpreted if a
stronger structure wants the copy elsewhere. Surprise him — the note that
triggered this brief was *"don't make the background boring as hell."*

## References, with Paul's actual reactions

- `reference/approved-dark-C.png` — the shipped dark card. Approved, posted;
  he then found it **"too dark"** in the feed — that complaint started this.
- `reference/edge-compare-v2.png` — ornament studies. **A (orbit) chosen.**
- `reference/block-compare.png` — flat color-block studies. B1 (tint plate
  with handles) was the best received: *"ok"*, not *"catchy."*
- Gradient studies were shown and **rejected as Ledger drift** — that
  rejection is the strongest signal in this brief.

## Acceptance

Every hex in the deliverable must resolve to a CARTA token (the practice runs
an automated palette guard); square corners throughout; the working copy set
in full with nothing truncated; and the winning direction expressible as
parameters (positions, sizes, colors) so it can be coded into a deterministic
builder. Files that meet that ship the same week.
