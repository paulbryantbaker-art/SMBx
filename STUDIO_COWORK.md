# Studio, local — run the content engine on your computer, not the app

**The move (Paul, 2026-07-22):** retire the SMBX app as the content engine and
run everything on your computer. All the design and build work is kept — it's
the repo's house system — you just drive it from **local folders** (media,
assets, collateral) in a Cowork session on your Claude subscription. No app,
no app `ANTHROPIC_API_KEY`, no monthly-dollar cap.

> **Prefer the lean kit.** `studio-kit/` is a self-contained copy of this whole
> pipeline (~5 dependencies, installs in seconds, its own Chrome auto-detect and
> bundled fonts/brand assets) — no need to clone the 471MB app. Copy that folder
> out, `cd studio-kit && npm install`, and follow its `README.md`. The rest of
> this doc applies verbatim; the kit just spares you the app baggage.

## The layout

Two folders on your machine, that's it:

**1. The repo** (clone of `paulbryantbaker-art/SMBx`) — holds the *engine*:
the house design system (Ledger palette, Fraunces/Inter/Plex, textures, logo),
the builder, the plan, and the brand assets (`client/public/`). You don't edit
this to make posts; you run it.

**2. A studio workspace** (any folder, e.g. `~/smbx-studio/`) — holds *your*
stuff:
```
media/        per-slot artwork you make (Gemini exports, photos)
assets/       recurring images (headshots, brand shots you keep on disk)
collateral/   rendered outputs land here — post the .pdf, paste the -caption.txt
decks/        your deck specs (start from the example)
posting-plan.md   what to build next
```
Create it in one command (from the repo dir, target your workspace path):
```
npx tsx scripts/studio/init-workspace.mts ~/smbx-studio
```

That mirrors what the app housed — its Media library is your `media/`+`assets/`,
its Collateral folder is your `collateral/` — on disk, under your control.

## One-time setup

1. Clone the repo locally and `npm install` (installs Node deps + Chromium).
2. Run `init-workspace.mts` (above) to make your studio folder.
3. Open **Cowork** (Claude desktop app or claude.ai/code) on the repo. Done —
   nothing from the app is required.

## The loop for one slot

From your workspace folder, the whole thing is:

1. **Say "build the next slot and research it out."** Cowork reads
   `posting-plan.md`, takes the `next` slot, **verifies every number** (web
   search), and writes a spec to `decks/<name>.deck.mts`.
2. **Review render** (zero flags — it uses your local folders):
   ```
   cd ~/smbx-studio
   npx tsx <repo>/scripts/studio/build-deck.mts decks/<name>.deck.mts
   ```
   Reads images from `./media` + `./assets`, writes the deck to `./collateral`.
   You get the PDF + page JPGs to review.
3. **Image.** Cowork hands you a copy-ready **Gemini prompt** for the cover art.
   Generate it in the Gemini app, save the file into `~/smbx-studio/media/`.
4. **Point the spec at it** (`cover: { image: 'yourfile.png' }` — a bare
   filename resolves against `./media`) and re-run the same build command.
5. **Post.** Upload `collateral/<slug>.pdf` as a LinkedIn document post, paste
   `collateral/<slug>-caption.txt`. Mark the slot `posted` in `posting-plan.md`.

## The spec shape

Every deck is a small file that `export const deck = {...}`. See
`scripts/studio/decks/elevator-teardown-1.deck.mts` in the repo for the full
field reference and the page kinds (`numeral`, `statement`, `diagram`; cover +
closer are the auto dark bookends). Copy it, change the copy, point the images.

## Images — where they resolve

The builder looks for a spec's image, in order: an absolute path → `--media`
dir if you pass one → **`./media`** → **`./assets`** → the spec's folder → CWD.
So just drop files in `media/` (per-slot art) or `assets/` (recurring), name
them in the spec, and build. Brand assets (logo, headshots, textures) are
already in the repo and used automatically.

## Why this dodges the limit (honest version)

- The render step (`build-deck.mts`) is **pure local Chromium — zero model
  cost.** It works with every API on earth capped.
- The thinking steps (research, writing copy) run on **your Claude
  subscription** via the Cowork session, not the app's metered key. That's a
  much larger, faster-resetting allowance — not a hard monthly dollar ceiling.
- Assisted, not unattended: this is a session with you in the loop. Truly
  hands-off weekly automation is a later step (a scheduled Cowork routine).

## Cloud fallback (only if you're not on your own machine)

If you ever run this in a *remote* Cowork environment (a cloud session that
can't see your disk), swap local folders for **Google Drive**: drop art in a
Drive folder, and the session downloads it, then builds with
`--media <download-dir>`. Same builder, same output. On your own computer you
never need this — local folders are the default.
