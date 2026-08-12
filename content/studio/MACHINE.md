# MACHINE.md — the animated diagram element, for collateral

> The design language for THE MACHINE: the typed-diagram instrument built for
> the site (2026-08-12) and handed to the studio the same day (Paul: "can we
> give Cowork the DL for the new element to be used in collateral? I can
> create a video slide show with it."). The runnable element is
> **`machine.html`** in this folder — open it in Chrome, let it run, record.

## What it is

A dark panel on which a line of copy performs: the standing words hold in
mint while the rotating word **types** in ivory, connector elbows **draw**
through a dot grid, claim pills **enter as green bars** that then take their
labels, mint current **marches along the wires** while it holds, the word
**un-types**, and the next entry begins. The loop closes by typing a tagline
over a drawn figure, then resets through the boxed wordmark.

It is a rebuild of carta.com's Connect diagram, measured frame-by-frame from
Paul's recordings (CartaDesign.mp4, mroeCarta.mov — 60fps): typing ≈90ms per
character, pills bar-then-label, ~3s holds, un-type at half the typing speed.
The same instrument runs live on the site (landing `#why`, the /industries
hero), so collateral built from this element matches what a reader sees when
the post sends them to smbx.ai.

## The design language

All values are `house/tokens.ts` CARTA tokens — this element is the site's
own grammar, and it is the sanctioned **early arrival of the Carta language
in collateral, for MOTION pieces only** (DESIGN.md's interim notice keeps
LEDGER as the source for the static builders until phase 2; a video element
that mirrors the live site is the deliberate exception, Paul 2026-08-12).

- Panel: `#1A1B19` (dark), mint dot grid `rgba(168,240,206,.15)` on ~22px
  pitch, square corners, no texture.
- The line: Source Serif 4, weight 550 — standing words **mint `#A8F0CE`**,
  typed words **ivory `#F4F5F1`**, block caret in mint.
- Pills: **Deal Green `#0A7A58`** fill, `#FCFAF6` IBM Plex Mono labels,
  letter-spaced, square.
- Wires: `#3A3F38` hairlines; the current is mint marching dashes.
- Plate (bottom-left): mono `#8E948B` with a 9px green square.
- Never: warm accents, rounded pills, textures, or any retired palette hex
  (DESIGN.md carries the dead table).

## The content law (read this before editing SPEC)

**Every word and every pill RESTATES copy the accompanying document already
carries.** A pill is a claim; a claim that appears first inside a decoration
is how a fabrication ships. Draw pill text from the piece's own sentences
(the way the site's machine pills restate the industries page), never from
memory. No fees, no invented figures, no counterparty names — THE LINE binds
decorations exactly as hard as prose.

## How to use it

1. Copy `machine.html` into the piece's collateral folder (keep the copy
   beside the render so the piece can be re-recorded later).
2. Edit the `SPEC` object at the top: standing words, entries + pills,
   tagline, plate. Three pills per entry reads best; x>50 hangs the pill off
   the right anchor, x<50 off the left.
3. Pick the format with a URL query and open in Chrome:
   - `machine.html?fmt=wide` — 1920×1080, video slideshows / LinkedIn 16:9
   - `machine.html?fmt=square` — 1080×1080, LinkedIn square video
   - `machine.html?fmt=tall` — 1080×1350, the carousel/portrait ratio
4. Record with QuickTime (File → New Screen Recording, drag over the stage).
   One full cycle ≈ 5.5s per entry + ~7s for the tagline + reset — four
   entries ≈ 30 seconds, a clean loop length for a slideshow segment.
5. Slow it down for a calmer read by raising `holdMs`/`typeMs` in SPEC.

## For the video slideshow

Alternate machine segments with still pages from the deck builders — the
machine is the motion between the evidence, not the evidence itself. Keep
figures on the STILL pages where they carry their citations; the machine
carries verbs and claims-in-summary. The house cut: title still → machine
cycle (2–3 entries) → stat still → machine tagline finale → closer still
with the byline.
