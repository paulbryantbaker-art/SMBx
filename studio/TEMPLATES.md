# TEMPLATES — the five, and what goes inside each

**The menu Paul picks from.** He names one of five; CC has to know which
content pages and which CTA page belong to it. Paul, 2026-08-20:
*"CC just needs to know which I will pick from."*

**There is a card deck of this file** —
`studio/collateral/_reference/smbx-templates-reference.pdf`, every thumbnail a
real render cropped from filed collateral. Built by
`scripts/studio/templates-card.py`; regenerate it when this file changes.

This file NAMES things and says what parts go with them. It never restates a
dimension or a hex — `FORMATS.md` owns the slot tables, `DESIGN.md` owns the
look. If they disagree with this file, they win and this is a bug.

Never hand-roll a layout. The builders are deterministic: a different-looking
output means a wrong spec, never a wrong renderer.

---

## THE FIVE

| Say | What it is | Pages |
|---|---|---|
| **Carousel** | the house multi-page LinkedIn post | cover + body + CTA |
| **One page** | a single image post | one |
| **Monolith** | the DARK figure look — as a carousel or as a one page | either |
| **Portal** | the LIGHT figure look — as a carousel or as a one page | either |
| **Report** | long-form assessment as a PDF | cover + sections |

**Monolith and Portal are LOOKS, not lengths.** Each can arrive as a carousel
or as a single image; say which. **The offer document is Portal** — a Portal
carousel whose content happens to be the offering. Content varies with the
need; the template does not.

---

## 1 · CAROUSEL

The house deck. `build-deck.mts`, 1080×1350, `--bookend dark|light|both`.

- **Cover** — auto-added. Hook, sub, optional `numeral` / `stats` proof strip.
  Never author it as a page.
- **Content pages — four kinds, nothing else exists.**

  | Kind | Reads as | Use it for |
  |---|---|---|
  | `numeral` | giant figure, green bar, serif sub-head | one number that carries a whole idea |
  | `statement` | mono eyebrow, serif headline, green rule | a claim with no figure attached |
  | `diagram` | two bars with a connector | a comparison |
  | `trade` | copy left, framed image panel right | a sub-vertical with its art |

  `trade` is the ONLY body page with an image slot — an `image:` key on the
  other three is silently dropped. Any page with a figure and no `source:` is
  a defect. One idea per page.
- **CTA page** — auto-added, `closer: {tag, head, body}`. Mono tag, serif
  payoff, green rule, body, byline foot with FOLLOW. It wears the same
  surface as the cover: exactly two bookends, and they match.

---

## 2 · ONE PAGE

A single image post. `build-onepager.mts`, same canvas, dark and light
rendered by default.

- **No content pages and no CTA page** — everything is on the one surface:
  kicker, hook, lede, numbered points, source note, and the foot bar carrying
  the byline and `smbx.ai →`. The foot IS the CTA.
- **Layouts** — `figure` (the default: the standing cutout at 834px, copy
  wrapping the silhouette) · `split` (copy column + full-bleed photo) · text
  card (a split spec with no `image`).
- A spec naming `image` with no `layout` stays split, so rebuilding the back
  catalogue cannot silently restyle what was already published.

---

## 3 · MONOLITH — the dark look

Deal Green monolith on the dark band, greenBright offset rim plate, aimed
bloom, gradient copy panel. Claude Design, `design_handoff_smbx_figure_card/`.

- **As a one page** — the dark figure card. The C treatment is its default:
  bloom aimed at the torso plus a renderer-side 1.16/1.05 lift, never baked
  into the asset. `pop:false` opts out.
- **As a carousel** — `figure-deck.py --ground monolith-dark`.
  - **Cover** wears the monolith.
  - **Content pages are the house LIGHT grammar** — bone ground, mono kicker
    over a hairline rule, serif head, green rule, then either prose with a
    source line or a dash / numbered list, ghost numeral behind, dark strip
    foot. **The monolith is a cover treatment, not a page style**; a first cut
    wore it on all ten pages and it was wrong.
  - **CTA page is FRAME C** — the portrait in a golden rectangle with corner
    handles and a 14px green offset plate, payoff line, the green action bar
    (`BOOK A CALL — SMBX.AI`), proof line, logo lower-left. Never a second
    cover.

---

## 4 · PORTAL — the light look

Four receding green portal steps on paper, gradient copy panel, dot field. A
different mechanic from the monolith, not a recolour. **The offer document is
this template.**

- **As a one page** — the light figure card, 1.08/1.02 lift.
- **As a carousel or document** — `offer-docs.py` is the worked example.
  - **Cover** wears the portal steps; optional numeral, plate label and ruled
    stat rows in the copy column.
  - **Content pages** — the same house light grammar as Monolith's: top
    strip, kicker, serif headline, green rule, lede, then a dash list or a
    numbered list, note at the foot, ghost numeral behind.
  - **CTA page is FRAME C**, light: the payoff, the plate pair when the
    content calls for it (`smbX Core` / `smbX Premium`), the action bar, the
    proof line, the portrait framed right with its byline.

**Bookend law, both looks:** the ground is worn by the cover and the CTA page
only. Every page between is light. Never a third bookend, never two in a row.

---

## 5 · REPORT

The long-form assessment. `build-report.mts`, Letter, rendered from plain
markdown — the same file the site publishes, so page and PDF cannot drift.

- **Cover** — dark band, kicker, serif title, byline with the headshot, the
  stat band, an optional hero image.
- **Content pages** — markdown sections. `# ` parts (or `## ` sections if the
  report has no parts) break the page; `accent:` drops a framed photo band
  under a named heading. Tables are hairline with mono headers.
- **No CTA page.** It closes on the required skeleton: `Sources`,
  `Derivations`, and **What we don't know yet** — every client-facing document
  ends there.
- Reports keep the BANNER grammar. A report is not a figure card.

---

## 6 · WHERE THE ANSWER IS, WHEN IT IS NOT HERE

1. `FORMATS.md` — containers, slots, dimensions, the mobile floor
2. `DESIGN.md` — palette, type ladder, layout grammar, the dead-systems table
3. `COLLATERAL_STATE.md` — what is built, what is not
4. `house/tokens.ts` — the values. Every hex resolves here or it is dead

Builders: `build-deck.mts` · `build-onepager.mts` · `build-report.mts` ·
`build-og-card.mts` (the link-preview card for a published report). The `.py`
renderers — `figure-deck.py`, `offer-docs.py`, `figure-fallback.py`,
`templates-card.py` — read the same specs and the same live tokens for
sessions with no browser; where a `.mts` builder covers the job, it is the
builder of record.
