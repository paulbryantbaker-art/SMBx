# TEMPLATES — the register of names

**One page, one purpose: the exact names to say.** Paul, 2026-08-19: *"what
are the names of the templates that we have? so CC can reference them."*

**There is a card deck of this file** —
`studio/collateral/_reference/smbx-templates-reference.pdf`, 6 Letter pages,
every thumbnail a real render cropped from filed collateral. Built by
`scripts/studio/templates-card.py`; regenerate it when this file changes.

This file NAMES things and points at the law. It never restates a dimension,
a hex or a rule — `FORMATS.md` owns the slot tables, `DESIGN.md` owns the
look, and two copies of a measurement is how one goes stale. If this file
and those disagree, they win and this is a bug.

Nothing here is a template in the "fill in the blanks" sense. Each is a
BUILDER plus a vocabulary of page kinds. You write a spec; the builder is
deterministic. A different-looking output means a wrong spec, never a wrong
renderer — and if you are writing HTML or CSS to "match the style", stop:
that is the first item on DESIGN.md's drift checklist.

---

## 1 · The four builders (the top-level names)

| Say | Builder | Canvas | Makes |
|---|---|---|---|
| **carousel** | `scripts/studio/build-deck.mts` | 1080×1350 | multi-page LinkedIn PDF + page JPGs + caption |
| **one-pager** | `scripts/studio/build-onepager.mts` | 1080×1350 | single-image post, dark + light PNG + PDF |
| **report** | `scripts/studio/build-report.mts` | Letter | long-form PDF from plain markdown |
| **OG card** | `scripts/studio/build-og-card.mts` | 1200×630 | the link-preview card for a published report |

Law: `FORMATS.md` §1 (carousel) · §2 (one-pager) · §3 (report) · §4 (image
slots for all of them). State of each: `COLLATERAL_STATE.md` §2.

---

## 2 · Grounds — the two figure-card treatments

Claude Design, 2026-08-19, `design_handoff_smbx_figure_card/`. A GROUND is
the surface a bookend wears. Both carry the standing figure.

| Say | What it is |
|---|---|
| **`monolith-dark`** | Deal Green monolith on the dark band, greenBright offset rim plate, aimed green bloom, gradient copy panel |
| **`portal-light`** | four receding green portal steps on paper, gradient copy panel, dot field |

They are DIFFERENT mechanics on the two grounds, on purpose — not one design
recoloured. Sanctioned scoped amendments (gradients, the aimed bloom, green
as a plate surface, renderer-side exposure lift): `DESIGN.md` §6.2.

**THE BOOKEND LAW governs where a ground may appear: cover and closer only,
every page between is the house light grammar.** A first cut wore the
monolith on all ten pages and Paul caught it — the monolith is a COVER
treatment, not a page style.

---

## 3 · Layouts — the one-pager's three

`layout:` in a `.post.mts` spec. `FORMATS.md` §2.0.

| Say | What it is |
|---|---|
| **figure** | THE DEFAULT (2026-08-18). Standing cutout at 834px = 1350×φ⁻¹, floating in flow so the copy wraps the silhouette |
| **split** | the older copy-column + full-bleed photo card. Still live, still supported — set `layout:'split'` explicitly in new specs |
| **text card** | omit `image` on a split spec: full-width copy, no photograph |

Back-compat inference: a spec naming `image` with NO `layout` is a
pre-2026-08-18 split spec and keeps rendering split, so `rebuild-all.sh`
cannot silently change what was already published.

The dark figure card's default is **the C treatment** — aimed bloom plus a
renderer-side 1.16/1.05 lift. `pop:false` opts out. `bloom:false` returns the
Carta-flat card.

---

## 4 · Page kinds — the carousel's four

`kind:` inside `deck.pages[]`. **There are four. Nothing else exists.**
Full field lists and the rules that hold across all of them: `FORMATS.md` §1.

| Say | Reads as | Use it for |
|---|---|---|
| **`numeral`** | giant figure, green bar, serif sub-head | one number that carries a whole idea |
| **`statement`** | mono eyebrow, serif headline, green rule | a claim with no figure attached |
| **`diagram`** | two bars with a connector | a comparison |
| **`trade`** | copy left, framed image panel right | a sub-vertical with its art |

`trade` is **the only body page with an image slot**. An `image:` key on
`numeral`/`statement`/`diagram` is SILENTLY DROPPED — the build succeeds and
the picture is gone.

Cover and closer are auto-added as the bookends; never author either, never
author a dark body page.

---

## 5 · The named devices

Parts that recur across builders and have earned a name.

| Say | What it is |
|---|---|
| **Frame C** | the closer's portrait: a φ RECTANGLE (`founder-portrait.jpg` is 1200×1944 = 1:1.620) with 12px ink corner handles and a 14px green offset plate. Shows the WHOLE photograph — a square frame discards 38% of it, all below the chin |
| **the foot disc** | the small round byline mark. Crops at 0.283 — measured crown 273 / eyes 664 / chin 1257 |
| **the bloom** | the dark ground's aimed green radial. Sanctioned, scoped; the boardroom texture stays retired everywhere |
| **corner handles** | 8px ink squares at −4px — the house gesture that replaced the curved band crests |
| **the ghost numeral** | the oversized page number behind the copy. Builder-drawn from page order; never put a page number in copy |
| **the proof strip** | up to three hairline stat cards at the foot of a cover's copy column |
| **the banner** | the report's cover hero band + `accent:` bands. Reports are NOT figure cards |

---

## 6 · One-offs — named, and deliberately outside the system

These exist for a specific surface and are NOT part of `rebuild-all.sh`.

| Say | Script | What and why |
|---|---|---|
| **the offer documents** | `scripts/studio/offer-docs.py` | the two 4:5 offer docs: no-pricing 5pp (postable) and pricing 7pp (the email-gated brochure). Claude Design build, `design_handoff_smbx_offer_docs/` |
| **the Featured doc** | `scripts/studio/featured-doc.py` | the same offer, 5pp LANDSCAPE 1200×630. Exists because LinkedIn's Featured card thumbnails page one at ~1.91:1 and a 4:5 cover gets beheaded |
| **the Featured thumbnail** | `scripts/studio/featured-thumb.py` | that landscape page one as a standalone image |
| **the figure carousel** | `scripts/studio/figure-deck.py` | a carousel whose bookends wear a ground, until the deck-cover half lands in `house/deck.ts` (`FIGURE_COVER_WORK_ORDER.md`). `FORMATS.md` §2.2 |
| **the figure fallback** | `scripts/studio/figure-fallback.py` | the one-pager figure layout with no Chromium. A fallback, never a reason to skip the real builder on a machine that has one |

The `.py` renderers are PIL rasterisers written for sandbox sessions with no
browser. They read the SAME specs and the SAME live tokens. Where a `.mts`
builder covers the job, it is the builder of record.

---

## 7 · Where a name comes from, when this file does not have it

1. `FORMATS.md` — containers, slots, dimensions, the mobile floor
2. `DESIGN.md` — palette, type ladder, layout grammar, the dead-systems table
3. `COLLATERAL_STATE.md` — what is built, what is not, what to do about it
4. `house/tokens.ts` — the values themselves. Every hex resolves here or it
   is a dead-system hex
