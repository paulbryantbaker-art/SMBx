# smbX Studio Kit

> **ONE CLONE (2026-08-18) — read before acting on any path in this document.**
> The studio workspace now lives at **`studio/` inside this repo** (the one
> clone: `~/Documents/GitHubRepos/smbx-prod`). `~/Documents/smbx-studio` and
> its remote `smbx-ai/smbx-studio` are history (brought in by `git subtree`,
> history kept); `content/studio/` keeps only the app-read posting files
> (`POST_QUEUE.md`/`post-queue.json`, `CAMPAIGN_*.md`/`campaign-*.json`,
> `queue-export.mjs`); `init-workspace.mts` is retired. Where this document says
> `~/Documents/smbx-studio` read `studio/`; where it says "the workspace repo"
> read this repo. **Nobody commits to `main`** — branch (`claude/<topic>` ·
> `cowork/<topic>`), PR, Paul merges. Full statement: the ONE CLONE section of
> `CLAUDE.md`. Everything below is otherwise unchanged and still binding.


A **self-contained** house-style LinkedIn carousel builder. No SMBX app, no app
API key, no database — just this folder, your own Google Chrome, and Node. It
renders the same Ledger-brand decks (framed cover, giant numerals, diagrams,
dark bookends, rasterized renderer-proof PDF) that the app produced.

This folder is standalone: copy it anywhere and it works. ~5 dependencies,
installs in seconds.

## One-time setup

```bash
cd studio-kit
npm install            # ~5 deps, no browser download (uses your Chrome)
```

Requirements: **Node 18+** and **Google Chrome** (auto-detected on macOS; on
Linux/Windows install Chrome/Chromium or set `PUPPETEER_EXECUTABLE_PATH`).

Verify it works — this renders the bundled example into `./out`:

```bash
npm run example
```

## Make a studio workspace (your media + outputs)

```bash
npx tsx init-workspace.mts ~/smbx-studio
```

Creates on disk:

```
~/smbx-studio/
  media/        per-slot artwork you make (Gemini exports, photos)
  assets/       recurring images (headshots, brand shots)
  collateral/   rendered decks land here — post the .pdf, paste the -caption.txt
  decks/        your deck specs (example copied in)
  posting-plan.md   what to build next
```

## Build a deck

```bash
cd ~/smbx-studio
npx tsx <path-to>/studio-kit/build-deck.mts decks/<name>.deck.mts
```

Images resolve against `./media`, then `./assets`, then the kit's bundled
`brand/`. Output writes to `./collateral`. No flags needed from inside a
workspace. Overrides: `--media <dir>` and `--out <dir>`.

## Write a deck spec

Every deck is a small file that `export const deck = {...}`. See
`decks/example.deck.mts` for the full field reference and page kinds:

- `numeral` — a giant figure + brass bar + heading/body/source
- `statement` — a mono tag + Fraunces headline + body/source
- `diagram` — a labeled bar comparison (the "spread" grammar)

The cover and closer are the two dark bookends, added automatically.

**LAW:** every number and source must be verified before it ships (zero
hallucination). Keep headline copy tight; the deck carries the depth, the
caption hooks.

## The loop with Claude (Cowork)

Open a Cowork session on this folder and say *"build the next slot from the
plan and research it out."* Claude verifies the numbers, writes the spec,
renders a review deck, and hands you a Gemini prompt for the cover art. Drop
the image in `media/`, re-run the build, post the `.pdf` + `-caption.txt`.

## What's inside

```
build-deck.mts       the renderer (spec → carousel PDF + page JPGs + caption)
init-workspace.mts   scaffolds a media/assets/collateral/decks workspace
lib/render.mts       Puppeteer + local-Chrome launch (no download)
lib/fonts.mts        embeds Fraunces/Inter/IBM Plex Mono (no CDN)
brand/               logo (x2) + boardroom texture only — no photos of you
                     (drop your own headshot.jpg in media/ for the byline)
decks/example.deck.mts   worked example + field reference
posting-plan.md      the format vocabulary + slot list
```
