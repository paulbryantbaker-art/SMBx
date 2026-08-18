# smbX Studio — local workspace

> **ONE CLONE (2026-08-18) — read before acting on any path in this document.**
> This workspace now lives at **`studio/` inside the SMBx repo** — the one
> clone at `~/Documents/GitHubRepos/smbx-prod`; the engine is `..`. The old
> `~/Documents/smbx-studio` folder and its remote `smbx-ai/smbx-studio` are
> history. Where this document says `$REPO`, that is now the parent of this
> folder; where it says "the workspace repo" or "the engine repo", they are
> the same repo. **Nobody commits to `main`** — branch (`cowork/<topic>` ·
> `claude/<topic>`), PR, Paul merges; a cloud session cannot push. Full
> statement: the ONE CLONE section at the top of `CLAUDE.md` in this folder.
> Everything below is otherwise unchanged and still binding.


Everything runs on this computer. No SMBX app, no app API key.

```
media/        per-slot artwork (Gemini exports, photos)
assets/       recurring images (headshots, brand shots)
collateral/   rendered outputs — post the .pdf, paste the -caption.txt
decks/        your deck specs (start from example.deck.mts)
clients/      one folder per client — engagements, their stage, and the log
markets/      one folder per market — research in, master out, documents derived
deals/        one folder per deal — what they sent, what we produced
definitive/   the deal method — gates, models, tax, legal, real estate
posting-plan.md   what to build next
THESES.md     every position we hold and what it rests on (generated)
```

## The rule files — read the right one first
```
CLAUDE.md     the laws + the four jobs. A session here loads this automatically.
RESEARCH.md   HOW to gather a market: six passes, ~20 runs, several hours.
              Start here when a market has no research/ yet.
PLAYBOOK.md   WHAT each client document contains, section by section.
              The spec, not the method — it assumes research/ is populated.
FORMATS.md    collateral containers: which builder, which fields, slot sizes.
DESIGN.md     the house look — palette, type, and the retired systems by hex.
THE_LINE.md   the perimeter, and whose lane each question is in. Read it
              before anything client-facing, and whenever a question turns
              tax, legal, real estate, valuation, licensing or insurance.
COLLATERAL_STATE.md
              which renderers are on Carta and what to do about it. Read
              before building collateral, not after it looks wrong.
WHERE.md      WHICH SYSTEM owns a piece of work — here or the app.
definitive/DEFINITIVE.md
              HOW A DEAL RUNS. Read it before any work in deals/. The other
              six files in that folder are reference, opened on demand.
```

## Research a market from scratch
```
# in a session opened on this folder:
#   "Build the research for <trade> in <geography>. Read RESEARCH.md first."
```
It is resumable: read markets/<m>/research/_log.md and continue from the first
row that is not `done`.

## Build a deck
```
npx tsx <path-to-SMBx-repo>/scripts/studio/build-deck.mts decks/<name>.deck.mts
```
Reads images from ./media + ./assets, writes to ./collateral.

## Track the theses
```
npx tsx <path-to-SMBx-repo>/scripts/studio/thesis.mts check
```
Tells you which positions rest on a master that has since moved.

Full guide: STUDIO_COWORK.md in the SMBx repo; the laws and the document
specs are in CLAUDE.md and PLAYBOOK.md right here.