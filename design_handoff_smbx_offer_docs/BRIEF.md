# Claude Design brief — the smbX CAROUSEL system (figure-card family)

**Client:** Paul Baker · smbX.ai · buy-side corporate development.
**Date:** 2026-08-19. Self-contained bundle. **This is round two:** round one
produced the figure-card one-pagers in `reference/approved-figure-card/` —
Paul approved them on sight, and they are now the practice's social template.
This round extends that family to the **multi-page LinkedIn carousel**, which
in-house iteration has not cracked (the attempts and Paul's verdicts are in
`reference/current-attempts/NOTES.md`).

## What to build

A complete **carousel page system** at 1080 × 1350 per page: how a 6–10 page
LinkedIn document post looks in the figure-card family. Two decks' worth of
real copy are supplied as the working examples in `laws/`:

- `smbx-corpdev-offering.deck.mts` — the OFFER deck: problem → model →
  FIND → DECIDE → CLOSE → OWN → choose. Products: **smbX Core** (thesis to
  close) and **smbX Premium** (Core, then ownership). Audience line for the
  cover: *"Outsourced Corporate Development for Private Equity and Family
  Offices."*
- `dead-deal-economics.deck.mts` — a data-led editorial deck: figures,
  a two-bar comparison, source lines with interest disclosures.

Design the SYSTEM: cover, 3–4 body-page patterns (statement · big-numeral ·
two-bar comparison · list/bullets), and the CTA closer. Then apply it to the
OFFER deck end-to-end as the proof.

## THE MOBILE FLOOR — the hard law this round exists for

LinkedIn renders a 1080px carousel at **~360px wide on a phone. Every size
divides by three.** The failed attempts set body copy at 21px (reads as 7px)
and sources at 13px (reads as 4px). Paul: *"none of this text is going to be
legible... think of it as mobile because even desktop is very small on
LinkedIn."*

- Reading text **≥40px on canvas**. Headlines 64–90px. Mono kickers ≥26px.
  Source/legal lines ≥22px. Nothing under 20px anywhere.
- **One idea per page, ≤45 words.** A page that needs more words is two pages.
- Judge every page at 360px wide before calling it done. If it does not read
  at 360, it does not exist.

## The family you are extending — transcribe, do not reinvent

`reference/approved-figure-card/` is your own approved prior work and its
parameter tables (`CLAUDE.md`, `TOKENS-USED.md`):

- **monolith-dark** — Deal Green monolith, greenBright offset rim plate,
  aimed bloom, gradient copy panel, full-length figure.
- **portal-light** — four receding green portal steps, gradient panel,
  dot field.

These are the COVER and CLOSER grounds. **The bookend law:** exactly two
plated/dark bookends — first page and last — and every page between them is
light. The failed attempts learned this the hard way (a first cut wore the
monolith on all ten pages).

Decisions already made and paid for — keep them:

- **The CTA closer** is Paul's portrait in **FRAME C** — a φ-rectangle
  (his portrait is 1200×1944 = 1:1.620; φ frames show the WHOLE photo, and a
  round crop amputates his neck) with corner handles and a 14px Deal Green
  offset plate — plus a payoff line, an engagement choice (**smbX Core /
  smbX Premium** as two plates, Premium marked as the fuller option), ONE
  filled action bar (`BOOK A CALL — SMBX.AI`), and proof line
  (*150 acquisitions. $5B+ enterprise value added. Zero sell-side deals.
  Ever.*). Paul rejected a closer that mirrored the cover: the end of the
  swipe must give the reader something new.
- **Bookend logos sit lower-left at φ²** of their panel width (monolith
  596→228px, portal 520→199px) — in the top corner at 26px the logo vanished.
- **The exposure lifts** on the figure are renderer-side: 1.16/1.05 dark,
  1.08/1.02 light. `founder-standing.png` is used as shipped — never
  regenerate, never re-matte.

## Hard laws (unchanged from round one)

Every hex resolves to a token in `laws/tokens.ts` (CARTA block); one accent
family (the greens), no ambers, no new hues; radius 0 except the round byline
disc; the three faces from `assets/fonts/`; the figure and headshot as
shipped, never a generated or stock human; copy VERBATIM from the specs —
figures keep their `source:` lines and interest disclosures legibly (≥22px);
no fee talk anywhere. Gradients remain sanctioned exactly as round one scoped
them (copy panels + the aimed bloom, token stops only). `laws/DESIGN.md` §2
names the dead systems with hexes.

## Open territory

Body-page architecture is yours: how a light page carries one 40px idea with
presence (the failed attempts read as sparse type floating in white — see
`offer-bodypage.jpg`); how a two-bar comparison looks at phone scale; how
page numbers, kickers and the foot strip work as a rhythm across a swipe; how
the plate/step grammar can ECHO on light pages without breaking the bookend
law. Make the swipe feel like one object in motion.

## Deliverables

- One self-contained HTML file **per page pattern** at exactly 1080×1350
  (inline CSS, assets by relative path, fonts via @font-face from
  `assets/fonts/`), named `page-cover-{dark,light}.html`,
  `page-body-statement.html`, `page-body-numeral.html`,
  `page-body-diagram.html`, `page-closer-{dark,light}.html`.
- The OFFER deck assembled: `offer-p01.html` … `offer-p08.html`.
- `TOKENS-USED.md` mapping every hex to its token, and a `CLAUDE.md`
  parameter table in the same format as round one — that format is what makes
  transcription into the practice's builders 1:1.

## Acceptance

Every hex a token; both bookends and only the bookends plated; every page
legible at 360px wide; copy verbatim with sources intact; the parameter
tables complete enough to code a deterministic builder from. Round one passed
all five — that is the bar.
