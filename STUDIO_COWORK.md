# Studio in Cowork — run the content engine on your computer, not the app

**The problem this solves:** the SMBX app's research + carousel pipeline bills
the app's `ANTHROPIC_API_KEY`, which has a hard monthly cap. This runbook does
the same work in a **Cowork session on your Claude subscription** — a much
larger, faster-resetting allowance — with no app API involved.

## The mental model

The app made three things look like one product. They live in three places now:

| What the app housed | Where it lives off-app |
|---|---|
| **Style / output system** (Ledger palette, fonts, textures, logo, the framed-cover grammar, the rasterized-PDF renderer) | **This repo** — `scripts/studio/build-deck.mts` + `server/services/fontEmbeds.ts` + `client/public/`. Already here. |
| **Posting plan** (what to build, the format vocabulary) | **This repo** — `content/studio/posting-plan.md` |
| **Media** (your photos, headshots, Gemini artwork) | **Google Drive** (Cowork reads it) + the brand assets already in `client/public/` |

So: **repo = style + plan + brand assets · Drive = media · Cowork = the engine.**
The app is fully bypassed.

## One-time setup

1. Open **Cowork** (Claude desktop app or claude.ai/code) pointed at this repo
   (`paulbryantbaker-art/SMBx`). A cloud/remote Cowork environment is the most
   turnkey — Node + Chromium + fonts are already installed. On a local desktop
   session you'd need Node and `npm install` once.
2. Make sure your **Google Drive** connector is on (it's how images come in).
3. That's it. Nothing else from the app is required.

## The loop for one slot (say "build the next slot")

1. **Plan → spec.** Claude reads `content/studio/posting-plan.md`, takes the
   slot marked `status: next`, **researches and verifies every number**
   (web search), and writes a spec file to `scripts/studio/decks/<name>.deck.mts`.
2. **Review render.** Claude runs the builder with a placeholder cover so you
   see the whole deck:
   ```
   npx tsx scripts/studio/build-deck.mts scripts/studio/decks/<name>.deck.mts \
     --out ./out
   ```
   It hands you the PDF + the page JPGs to review.
3. **Image.** Claude gives you a copy-ready **Gemini prompt** for the cover art
   (single flat scene, house palette, no baked-in fades). You generate it in the
   Gemini app.
4. **Assign.** Drop the image in your Drive studio folder and tell Claude the
   link (or the filename). Claude downloads it, points `cover.image` at it, and
   re-renders:
   ```
   npx tsx scripts/studio/build-deck.mts scripts/studio/decks/<name>.deck.mts \
     --media <downloaded-image-dir> --out ./out
   ```
5. **Post.** Claude hands you the final `<slug>.pdf` (upload as a LinkedIn
   document post) and `<slug>-caption.txt` (paste as the post text). Mark the
   slot `posted` in the plan.

You can also just say **"build D03 and research it out"** and Claude does 1–3 in
one pass, then waits for your image.

## Where media goes

- **Recurring brand assets** (logo, headshots, textures) already live in
  `client/public/` — the builder uses them automatically.
- **Per-slot artwork** you make in Gemini: keep it in a **Google Drive folder**
  (e.g. "smbX Studio Media"). Cowork downloads what it needs per slot.
- If you'd rather keep art in the repo, drop files under `content/media/` and
  point the spec's `cover.image` at `content/media/<file>`.

## Making a deck by hand (the spec shape)

Every deck is a small file that `export const deck = {...}`. See
`scripts/studio/decks/elevator-teardown-1.deck.mts` for the full field
reference and the available page kinds (`numeral`, `statement`, `diagram`;
cover + closer are the auto dark bookends). Copy it, change the copy, point the
images, render.

## Why this dodges the limit (and the honest caveat)

- The render step (`build-deck.mts`) is **pure local Chromium — zero model
  cost**. It works even with every API capped.
- The thinking steps (research, writing copy) run on **your Claude subscription**
  via the Cowork session, not the app's metered API key.
- Caveat: your subscription has usage limits too — they're just far more
  generous and reset on rolling windows, not a monthly dollar ceiling. And this
  is an *assisted* loop (a session, in the loop). True unattended weekly
  automation is a separate step (a scheduled Cowork routine) or waits for the
  app API to reset.
