# The practice, local — run the work on your computer, not the app

**The move (Paul, 2026-07-27):** *"I'm no longer using the app for anything but
marketing. All work produced will be in Cowork from now on."*

Everything the practice produces — research masters, market maps, who's who,
target maps, theses, deal analysis, and all collateral — is produced in a Cowork
session against **folders on your own machine**. The app is marketing only.

The trigger was concrete: the org's Anthropic key hit its spend ceiling
mid-synthesis and *every* authoring function stopped at once, because the app
routes all of them through that one metered key. But the renderers, the model
math and the citation audit never needed an API — only the *writing* did, and
the writing is what a Cowork session does on your own subscription.

## The layout

Two folders on your machine.

**1. The repo** (clone of `paulbryantbaker-art/SMBx`) — the **engine**. The house
design system (Ledger palette, Fraunces/Inter/Plex, textures, logo), the
builders, the audit, brand assets in `client/public/`. You run it; you don't edit
it to do the work.

**2. A studio workspace** (e.g. `~/Documents/smbx-studio/`) — the **system of
record**:

```
markets/<market>/     a knowledge base for one market
    research/         the reads you gathered anywhere — Claude, Gemini, PDFs
    master.md         THE one synthesized document, built from all of research/
    versions/         master-v1.md, master-v2.md … the history
    documents/        derived: market-map.md, whos-who.md, target-map.md,
                      thesis-<buyer profile>.md
    collateral/       rendered output for this market
deals/<deal>/
    documents/        what the seller sent
    analysis/         what we produced
media/  assets/  collateral/  decks/     images in, renders out
posting-plan.md       what to build next
THESES.md             every position we hold and what it rests on (generated)
CLAUDE.md             the laws       ┐ copied in by init-workspace, so a
PLAYBOOK.md           the doc specs  │ session opened here behaves correctly
FORMATS.md            the containers │ on its own — nothing else enforces
DESIGN.md             the look       ┘ any of it
```

Create it in one command (from the repo dir, target your workspace path):

```
npx tsx scripts/studio/init-workspace.mts ~/Documents/smbx-studio
```

Those four matter. With the app out of the loop, no server prompt enforces the
citation law, THE LINE, the document structures, or the house style any more —
so they travel *with the workspace*. Re-run with `--update` after pulling the
repo to refresh them; without it, a workspace quietly keeps whatever version it
was first created with, and a fix in the repo never arrives.

**FORMATS.md and DESIGN.md are two halves of one spec.** FORMATS.md is the
container — which builder, the field grammar, the image slot dimensions.
DESIGN.md is the look — palette, type, the page-by-page layout grammar, and the
retired systems named with their hexes. DESIGN.md was added 2026-07-30 because
FORMATS.md alone was not enough: collateral kept drifting toward last year's
palettes, and nothing that travelled to the workspace described the current one.

## One-time setup

1. Clone the repo locally and `npm install`.
2. Run `init-workspace.mts` (above).
3. Open **Cowork** on the workspace folder. Set `REPO` to wherever the repo is
   cloned — every command below uses it.
4. For job 5 (pushing research into the app's CRM), get a token from the app —
   **Settings → Connections → "Show my token"** — and put it in the session's
   environment as `SMBX_TOKEN`. (Google sign-in has no password for a script
   to use; that pane is the answer to it.)

## The six jobs

### 0. Build the research in the first place

If a market has no `research/` yet, **that is its own job and it is the long
one** — six passes, roughly twenty runs, several hours, usually across more than
one session. The procedure is `RESEARCH.md` in the workspace (source:
`content/studio/RESEARCH.md`), and it exists because the two ways this goes wrong
are expensive: searching without a frame, so three of the seven sections the
client pays for end up empty; and synthesizing after two passes, which produces a
confident document about a market you have half-read.

It is built to be RESUMABLE — a frame file written before any searching, one file
per run with the query in its header, a coverage ledger mapping every market-map
section to the pass that fills it, and a stop condition (two consecutive runs
producing nothing new). Resuming is: read `00-frame.md`, then `_log.md`, then the
section table. No summary, no memory.

> Build the research for fire and life safety in DFW. Read RESEARCH.md first.

### 1. Fold new research into a market's master

Gather reads however you like — Claude, Gemini, a PDF someone sent — and drop
them in `markets/<m>/research/`. Then, in a session on the workspace:

> Fold the new research into the home-services master.

Copy the previous master to `versions/master-v<n>.md` first. Then **audit before
anything else happens**:

```
npx tsx $REPO/scripts/studio/audit.mts markets/<m>/master.md
```

No flags needed — it finds the sibling `research/` folder. Exit `0` clean, `1`
not clean, **`2` NOT AUDITED** (no machine-readable source to check against,
which is not the same as passing).

### 2. Derive a corp-dev document

**Market map · who's who · target map · investment thesis** — the work product a
client is paying for. `PLAYBOOK.md` in the workspace is the specification; read
it before building any of them.

```
npx tsx $REPO/scripts/studio/audit.mts markets/<m>/documents/<doc>.md \
  --against markets/<m>/master.md
```

**Two traps worth naming.**

*The target map.* A market master describes a market; it does **not** contain a
list of acquisition targets, because the good independents are precisely the
companies nobody wrote a report about. Build one from the master alone and you
get plausible companies that do not exist. Without target-level research in
`research/`, build the **screen specification** instead — PLAYBOOK has both
shapes, and the screen is a genuinely useful deliverable.

*The target map.* To get the target-level data it needs, run the screen — a
Google Places pull, tagged against a register of who is already consolidating:

```
npx tsx $REPO/scripts/studio/screen.mts init home-services   # seed screen/ config
npx tsx $REPO/scripts/studio/screen.mts pull home-services   # Places → screen/candidates.csv
npx tsx $REPO/scripts/studio/screen.mts rank home-services   # classify, size, score
```

`pull` uses `GOOGLE_PLACES_API_KEY` — a different key from the Anthropic one, so
a spend cap there does not touch this. Text search is free; Place Details is
$17/1k with the first 5,000 each month free, and the command tells you the count
before it spends anything. `rank` is free, offline, and instant — re-run it
after every edit to the register or the buy-box.

`screen/consolidators.md` is the load-bearing file: `rank` calls a business
independent when it is *not in that register*. Write it from the master's
who's-who. Left empty, everything comes back `unknown` rather than a market of
franchises being declared independent.

The board is a CSV because it belongs in a Google Sheet — import it, sort and
annotate, export back over the same file, re-run `rank`. Your columns survive.

Google's terms let you keep **place IDs indefinitely** but treat name, phone,
rating and review count as a **temporary cache**, so the board ages them out and
`rank` says when rows are past the window:

```
npx tsx $REPO/scripts/studio/screen.mts refresh home-services            re-pull
npx tsx $REPO/scripts/studio/screen.mts refresh home-services --forget   drop it
```

`--forget` clears only the borrowed columns; the place ID, your own columns and
the affiliation/score judgements are your analysis and stay. And the rule that
matters more than any of this: **Places is discovery, not evidence** — verify a
name against the licence registry or the company's own site before it reaches a
client document, and cite that instead.

*The thesis.* It is a position, held for a particular buyer, and it ages as the
master moves. So a market carries one per buyer profile, each stamped with the
master version it was built from:

```
npx tsx $REPO/scripts/studio/thesis.mts new home-services family-office
npx tsx $REPO/scripts/studio/thesis.mts check      # which positions went stale
npx tsx $REPO/scripts/studio/thesis.mts register   # rewrite THESES.md
```

Run `check` after every re-synthesis — that is the moment a thesis silently
starts resting on facts that have moved.

### 3. Produce collateral

```
npx tsx $REPO/scripts/studio/build-report.mts    <doc.md>          # long report PDF
npx tsx $REPO/scripts/studio/build-deck.mts      <spec.deck.mts>   # LinkedIn carousel
npx tsx $REPO/scripts/studio/build-onepager.mts  <spec.post.mts>   # single-image post
```

Run from the workspace root: they default to `./media` + `./assets` for images
and `./collateral` for output, so the common case takes no flags. A document
going to a client is a **report PDF**; the carousel and one-pager are LinkedIn.

Field references live beside the builders — `scripts/studio/decks/` for deck and
post specs, `scripts/studio/reports/` for report cover blocks.

### 4. Deal analysis — the post-LOI phase

What the seller sent goes in `deals/<d>/documents/`; what we produce goes in
`analysis/`. Same discipline — a number in the analysis comes from a document in
`documents/`, or it says where it came from.

Four documents, specced section by section in `PLAYBOOK.md` §5: the **model**
(mechanical, below), the **deal memo** (the recommendation the buyer decides
from), the **diligence plan** (written early — its job is to decide what would
change the answer while there is still time to find out), and the **term
framework** (the commercial position counsel papers; not legal language).

```
npx tsx $REPO/scripts/studio/deal.mts new <engagement> "<target>"
npx tsx $REPO/scripts/studio/deal.mts run deals/<d>/analysis/<t>.deal.mts
npx tsx $REPO/scripts/studio/deal.mts list          # which models are stale
```

**Model with the CLI, never by hand.** `house/deal.ts` is the same arithmetic
the app's canvas runs, and `npm run test:deal` imports both engines and fails
if they ever disagree. That gate exists because of a real near-miss: the
2026-08-14 Deal Explorer prototype reimplemented `amort`, `dscr` and `irr` in
browser JS and labelled itself *"mirrors the workbench; re-sync at vendoring"*
— a mirror kept in step by hand is a second engine, and two engines disagreeing
about what a deal is worth is the worst failure available here.

The `.deal.mts` spec is the artifact you maintain; the `-model.md` beside it is
output and the next run overwrites it. Money in cents, rates as decimals.

Two traps worth naming, both of which produce a number that looks fine:

- **The model inherits two shortcuts from the app's canvas and flags both in
  place** — a straight-line debt paydown that flatters exit equity on a long
  amortization, and an IRR solver that can fail to converge. It refuses to
  print a rate that did not converge. Read those notes before repeating a
  return that looks too good.
- **League multiples are house assumptions, not comps.** The document says so
  on the line that prints them. Cite a real comparable before that band informs
  a price you recommend.

**Tax is the CPA's.** `deal.mts` carries no tax surface on purpose — asset vs
stock, §338(h)(10), installment treatment and QSBS are jurisdictional and
material. A test asserts none of it leaks in.

Deal documents render to `deals/<d>/decks/<slug>/$(date +%F)`, never to
`collateral/` — collateral is publishable anywhere, and these name a live
target and a client's intentions.

### 5. Push a research run into the app's CRM

The one place this workspace WRITES into the app (2026-08-07). Paul: *"I'd like
to be able to do all of this in Cowork and just have that updated list put into
the app… without burning API."*

The session does the smart half — read the sheet or the research, map it into
the seven-table bundle (`01_contacts.csv`, `02_organizations.csv`,
`03_outreach_waves.csv`, `04_sequence_steps.csv`, `05_message_templates.csv`,
`06_events.csv`, `07_research_queue.csv`; copy the headers from
`content/crm-seed/`). Then one command delivers it:

```bash
SMBX_TOKEN=… npx tsx $REPO/scripts/studio/push-crm.mts <folder>
```

The token: app → **Settings → Connections → "Show my token"**. Google sign-in
means there is no password to script with, which is why that pane exists.

A partial bundle is legal — an updated contacts sheet alone is a valid push;
the loader upserts and never wipes what it wasn't given. The report prints what
landed and NAMES every unresolvable target rather than dropping it.

**The app side calls no model.** `POST /api/crm/import-bundle` is parse → map →
upsert, pure code. The intelligence is the mapping this session does, on the
subscription. That is why this loop costs nothing against the org key — the
same reason the rest of Studio lives here.

The full laws for this job (never invent a person; `bucket` decides the layer;
`tier` is conviction, not size) are in the workspace's own `CLAUDE.md` under
"6. Push a research run into the app's CRM".

### 6. The weekly sweep — the Saturday agent

Paul, 2026-08-10: *"All markets should update weekly starting in Saturday and
Email me the delta of what's new or changed on Sunday."*

The standing prompt is **`WEEKLY.md`**, which `init-workspace` copies into the
workspace beside the other laws — a scheduled session opens on that folder with
nothing but what is in it, so the job has to live there rather than in this repo
or in whoever set the schedule up.

The deterministic half is `weekly.mts`, and it calls no model:

```bash
# Saturday — WHOSE TURN is it? Exit 0 nothing due · 1 work it · 2 can't keep up
npx tsx <repo>/scripts/studio/weekly.mts due

# then the detail on that market — unfolded research, stale theses
npx tsx <repo>/scripts/studio/weekly.mts status

# Sunday — the delta, read out of git so it is exact rather than remembered
npx tsx <repo>/scripts/studio/weekly.mts digest --out digest.md
```

Exit `0` nothing needs you · `1` something does · `2` a market could not be read.

**Three things make this safe to leave running**, and all three are in
`WEEKLY.md` as laws rather than suggestions:

1. **It writes; it never publishes.** No LinkedIn, no client email, no
   counterparty contact, no CRM or outreach writes. The same *one touch, one
   press, one human* rule the outreach machine already enforces.
2. **Everything lands in a pull request.** That is the review gate and the whole
   reason this is safe — it is the one place you can say no. Which is also why
   the workspace wants to be in git: without it there is no diff to read and the
   digest can only report current state, not a delta.
3. **ONE MARKET A WEEK, quarterly per vertical** (Paul, 2026-08-10: *"once the
   market assessment is in place, it probably really only needs to be updated
   quarterly for each vertical (so 1 per week)"*). Markets do not move week to
   week. `due` names the one furthest past its 90-day cycle and exits 0 when
   nobody is — a quiet week is a correct week, and an agent that must produce a
   change every week eventually produces one that is not there. A market with
   NO master is not in the rotation at all: a first build is the full hunt in
   `RESEARCH.md`, which is your call to start, not a cron's.

   **Age is read from git, never from mtime** — git does not preserve
   modification times on clone, so a workspace checked out on a new Mac would
   read as if every master were refreshed today and the rotation would quietly
   decide nothing was ever due again.

   One per week over a 90-day cycle tops out at **12 markets**. Past that `due`
   exits 2 and says so rather than running later and later.

**Getting it onto your Mac — `sync.mjs`, in the workspace.** The PR is the
review gate; it is not delivery. **Git is a transport, not a destination:** a
merged PR puts nothing on your laptop, and until something pulls, every builder
here renders from a stale master with no error to tell you. So:

```bash
node sync.mjs              # pull the workspace AND the SMBx repo, refresh the laws
node sync.mjs --check      # report only, exit 1 if behind
node sync.mjs --install    # print the launchd job that runs it hourly
```

Install it and merging a PR on your phone lands the files here within the hour,
with nothing to remember. It pulls **both** repositories, because pulling only
the workspace leaves you building this week's master with last month's builder.
Pulls are `--ff-only` and it exits 2 rather than merging over an uncommitted
edit — the one thing worse than a stale master is a lost one.

**What it cannot do, and says so in every digest:** the citation audit checks
NUMBERS, not prose. A fabricated qualitative claim carries no figure and passes
clean, so a master that changed still wants your eyes before anything derived
from it reaches a client.

## The LinkedIn loop, specifically

1. **"Build the next slot and research it out."** Cowork reads
   `posting-plan.md`, takes the `next` slot, verifies every number, writes
   `decks/<name>.deck.mts`.
2. **Render** — `npx tsx $REPO/scripts/studio/build-deck.mts decks/<name>.deck.mts`
   → PDF + page JPGs in `./collateral` to review.
3. **Image.** Cowork hands you a copy-ready Gemini prompt for the cover art.
   Generate it in the Gemini app, save into `media/`.
4. **Point the spec at it** (`cover: { image: 'yourfile.png' }` — a bare filename
   resolves against `./media`) and re-run the same command.
5. **Post** the `.pdf`, paste the `-caption.txt`, mark the slot `posted`.

## Images — where they resolve

In order: absolute path → a `--media` dir if you pass one → `./media` →
`./assets` → the spec's folder → CWD. Brand assets (logo, headshot, textures)
are in the repo and used automatically.

To move images between your machine and the app's media library without Google
Drive in the middle: `npx tsx $REPO/scripts/studio/assets.mts push|pull|list`
(needs `SMBX_API_URL` + `SMBX_TOKEN`).

## What the audit cannot do

It checks **numbers, not prose.** A fabricated qualitative claim carries no
figure and passes clean. A rounded figure, though, is a *different* figure —
`$835B` is not `$835.5B`, and it will be flagged, correctly. Conflicting sources
keep **both** values; an invented midpoint is a fabrication.

## Why this dodges the limit (honest version)

- Rendering, the model math, and the audit are **pure local — zero model cost.**
  They work with every API on earth capped.
- The thinking steps (research, synthesis, writing) run on **your Claude
  subscription** in the Cowork session, not the app's metered key.
- Assisted, not unattended — for the jobs you run yourself. **The weekly sweep
  (job 6) IS unattended**, and it changes the failure mode rather than removing
  it: the risk stops being a bill and becomes a rate limit, so it stays a delta
  pass rather than a full hunt, and it writes to a PR rather than to your files.

## About `studio-kit/`

`studio-kit/` is a self-contained **deck builder only** — its own `package.json`,
vendored brand assets, Chrome auto-detect, ~5 dependencies, no clone of the
471MB app. Good if all you want is a carousel on a machine without the repo.

It does **not** carry the report or one-pager builders, the citation audit, the
thesis register, or the markets/deals workspace — and its `init-workspace` is the
older content-only version. **For the practice, use the repo.**

## Cloud fallback (only if you're not on your own machine)

In a *remote* Cowork session that can't see your disk, swap local folders for
Google Drive: drop art in a Drive folder, the session downloads it, then build
with `--media <download-dir>`. Same builder, same output. On your own computer
you never need this.
