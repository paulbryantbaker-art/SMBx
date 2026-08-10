# smbX studio workspace

This folder is Paul Baker's corp-dev practice, on his machine. Claude Code
drives it. There is no app, no server, no database — the folders below are the
system of record, and the SMBx repo is the engine you run against them.

**The paths on this machine (LOCKED, Paul 2026-07-27):**

```
REPO      /Users/paulbaker/Documents/GitHubRepos/SMBx-main    # the engine
STUDIO    /Users/paulbaker/Documents/smbx-studio              # this folder
```

Set `REPO` once per session — every command below uses it:

```
export REPO=/Users/paulbaker/Documents/GitHubRepos/SMBx-main
```

`$REPO` is the checkout that has `package.json`, `scripts/`, `house/` and
`server/` in it — the one `npm install` was run in. The builders live at
`$REPO/scripts/studio/`.

## Layout

**Market first, then category.** Everything that belongs to a market lives
inside that market's folder, and every market has the same seven subfolders.
The image library is the one shared thing.

```
assets/               THE HOUSE LIBRARY — shared by every market, never copied
    brand/            founder-portrait.jpg — the byline headshot
    trades/           lane illustrations: hvac-ac, plumbing-van, roofing,
                      garage-doors, electrical-ev, homes, elevator,
                      solar-house, service-van-dark, service-van-commercial
    mep/              commercial mechanical photography: chilled-water-plant,
                      cooling-towers, pipe-gallery, rooftop-units
    concept/          tree-roots
    INDEX.md          what every image shows and where it is used
    PROMPTS.md        the Gemini prompt that made each one

markets/<market>/     everything about one market, in one place
    research/         RESEARCH — the reads gathered anywhere: Claude, Gemini,
                      PDFs, pasted text, and the verification passes. FLAT.
        _meta/        the hunt's own process files — frame.md, log.md. The one
                      deliberate subfolder: audit.mts does not recurse, so a
                      buy-box range in a frame cannot launder into the master.
    master.md         THE one synthesized document, built from all of research/
    versions/         master-v1.md, master-v2.md … the history
    documents/        DERIVED SOURCE — market-map.md, whos-who.md, thesis.md,
                      and the .md a report renders from
    screen/           the target board — buy-box, consolidator register,
                      candidates.csv
    specs/            the build specs — <name>.deck.mts, <name>.post.mts
    media/            MEDIA — the pictures used on THIS market's collateral:
                      report cover, section bands, per-slot artwork
    collateral/<slug>/<date>/   COLLATERAL — finished work that can be posted
                                publicly, anywhere
    decks/<slug>/<date>/        DECKS — client-specific, client-direct
                                material. Not publicly shareable.

clients/              THE PROSPECT BOARD — who we want as a client. Hunt A's
                      output. A house asset, nothing in it confidential.
    register.csv      firm · buyer_moment · grade · evidence · source_url …
                      seeded and scored by leads.mts

deals/<engagement>/   ONE CLIENT MANDATE — confidential, never a public source
    engagement.md     stage, who owes the next move, and the dated log
    thesis-<market>.md    the position held FOR THIS CLIENT, one per market
    documents/        what the seller sent
    analysis/         what we produced, including the TIERED target board:
                      target-map-<market>.md
    notes.md          the running record

posting-plan.md       what to build next
ENGAGEMENTS.md        the board, generated — edit the engagements, not this
```

**`clients/` and `deals/` are two different things (2026-07-31, Paul).**
`clients/register.csv` is a list of firms we would like to work for; nobody in it
has hired us. `deals/<engagement>/` is a mandate we hold. A firm moves from one
to the other when there is an engagement, and that is the only relationship
between the two folders.

The engagement folder stayed `deals/` rather than becoming `clients/<client>/`
for a mechanical reason worth knowing: **`thesis.mts` and `screen.mts` both scan
`deals/`.** A client thesis filed anywhere else is invisible to
`thesis.mts check`, which would then print a clean board while checking an empty
folder — a false green light, which this workspace treats as worse than no check.
If that layout ever does change, the two scripts change in the same commit.

**Filing law (2026-07-29, Paul).** The two output folders split on **audience**,
not on file type.

- **`collateral/`** is posting content — anywhere it can be posted. A carousel
  files here whole: the `.pdf`, the `-pNN.jpg` page previews and the
  `-caption.txt` stay together in one dated folder, because they are one post.
  A publicly shareable report PDF files here too.
- **`decks/`** is client-specific, client-direct material — cut for a named
  acquirer or a live conversation, not for an audience. It never gets posted.

When you cannot tell which one an artifact is, **ask before filing it**. A
client-direct deck that lands in `collateral/` is the kind of mistake that only
becomes visible after it has been posted.

**Market law (2026-07-29).** Nothing that belongs to a market lives at the
studio root. There is no top-level `collateral/`, `decks/` or `media/` any
more — all three moved into the markets on 2026-07-29, because a flat root gave
no way to tell which of three `home-services-*` slugs belonged to what, and a
second market would have made it unreadable. `assets/` is the deliberate
exception: the brand images are house-wide, and copying 90MB of them into every
market is how one INDEX.md becomes three that disagree.

**Asset naming law (2026-07-27).** Every image is named for what it SHOWS.
No `Gemini_Generated_Image_xi1nbxi1nbxi1nbx.png` — a name nobody can act on
costs a look-at-every-thumbnail step on every future build, and it is how the
old home-services spec came to point at `pest.png`, `plumbing.png` and
`electrical.png`, none of which existed. A spec references the subpath:
`image: 'trades/hvac-ac.png'` (the resolver joins the whole ref onto `./media`,
then `./assets`). New art lands in the right subfolder with a descriptive
name on the way in, not later. `assets/INDEX.md` says what every image shows
and where it is used; `assets/PROMPTS.md` holds the Gemini prompt that made it.

**Prompt law (2026-07-27).** An image does not land in `assets/` without its
prompt landing in `assets/PROMPTS.md`. The PNG is one roll of the dice; the
prompt is the ability to roll again, match the set, or extend it after the file
is gone. That file carries the base style block — paste it verbatim after a
one-sentence subject line and new art belongs to the set instead of merely
being about the same subject.

**Output law (2026-07-27, re-pathed 2026-07-29).** Always pass
`--out markets/<m>/collateral/<slug>/<date>/` (or `.../decks/...` when it is
client-direct).
The builders default to a flat `./collateral`, which means a rebuild silently
overwrites the previous one — and for a deck whose figures ARE the product,
losing the ability to diff July's numbers against September's is the expensive
kind of tidy. One dated folder per build; nothing is ever overwritten.

**Slug law (2026-07-28).** One artifact, one slug — a report and a deck about
the same market never share one. `home-services-teardown` is the carousel;
`home-services-market-assessment` is the report. This cost an hour: a 58-page
report was written into the deck's slug folder, so `2026-07-27/` held a
carousel and `2026-07-28/` held a report, and the two adjacent date folders
read as "the house template changed overnight." It had not. Nothing about the
palette moved — `house/tokens.ts` is the single definition and every builder
imports it. The confusion was entirely the shared name.

```
npx tsx $REPO/scripts/studio/build-deck.mts markets/<m>/specs/<name>.deck.mts \
  --media markets/<m>/media \
  --out markets/<m>/collateral/<slug>/$(date +%F)
```

## Where this session is running — check first

If you can see this folder through `mcp__remote-devices__*` tools rather than
as ordinary local paths, you are a **cloud** Cowork session, and `device_bash`
is a sandboxed Linux VM on Paul's Mac with **no Chromium and no network**. The
builders cannot render there. Read **`CLOUD_BOOTSTRAP.md`** in this folder — it
has the two-minute setup that puts the engine in the cloud container where
Chromium lives, plus the transfer gotchas (30MB upload ceiling; `tar -x` fails
on the mount, `cp` works; `device_bash` cannot delete).

If you are running on Paul's machine, ignore all of that — the builders find
Chrome themselves and the commands below work as written.

`audit.mts` runs anywhere. It is pure computation with no browser.

## The rule files beside this one — and which to read first

They are not background reading. Each exists because work drifted without it.

```
RESEARCH.md          the METHOD for gathering. THREE SEPARATE HUNTS — do not
                     mix them: (A) clients to serve, (B) how a market works,
                     (C) targets for a client to buy.
PLAYBOOK.md          the SPEC for each client document — market map, who's who,
                     target map, investment thesis. Section by section. It
                     assumes research/ is already populated.
FORMATS.md           the collateral containers — which builder, which fields,
                     the exact image slot dimensions.
DESIGN_LANGUAGE.md   the house LOOK — palette, type, and the dead systems named
                     with their hexes. Canonical.
REPORT_TEMPLATE.md   the cover block, the body rules, the standing appendix.
CLOUD_BOOTSTRAP.md   only if you are a cloud session and a builder will not run.
```

**Route by what you were asked for:**

| Asked to… | Read FIRST |
|---|---|
| find **clients** — acquirers to pitch, a prospect list for us | **RESEARCH.md § A** |
| research a **market** / build a market map from scratch | **RESEARCH.md § B** |
| build a **target list** of companies for a client to buy | **RESEARCH.md § C** |
| fold new research into a master | job 1 below |
| write a market map, who's who, target map or thesis | **PLAYBOOK.md** |
| build a carousel, one-pager or report | **FORMATS.md**, then **DESIGN_LANGUAGE.md** |
| anything, and you are about to hand-write HTML or CSS | **DESIGN_LANGUAGE.md** — stop, you are drifting |

## The three hunts are not interchangeable (2026-07-31)

Paul: *"I don't want to get market research mixed up with 1. building out a
potential client list, 2. building out an acquisition target list for clients
when I get a client… they all need to be spot on."*

**"A list of companies" means something different in each.** A is acquirers we
want as clients. C is companies a client should buy. B is not a list at all.
Getting this wrong produces an authoritative-looking artifact that answers a
question nobody asked — and it is not obvious from the artifact which mistake
was made.

The engagement order is **B → thesis → C**. A runs on its own clock and is how
the client arrives in the first place.

**Never derive C from B alone.** A market master contains no target list — the
good independents are precisely the companies nobody wrote a report about — so
building one from the master invents companies. RESEARCH.md § C has the sources
that produce a real one.

**The hard precondition.** Every client document is derived from
`markets/<m>/master.md`, which is derived from `markets/<m>/research/`. So:

> If `research/` is empty or thin, you cannot write the document you were asked
> for. An empty research folder does not produce a thin market map — it produces
> an invented one. Go to **RESEARCH.md** and do that job first, and say so
> plainly rather than producing the document shape with nothing behind it.

```
ls markets/<m>/research/ | wc -l           # 0 or 1 → you are at RESEARCH.md, not here
cat markets/<m>/research/_meta/log.md      # mid-hunt? resume at the first row not `done`
```

## The order of work (2026-07-29, extended 2026-07-31)

The buy-box is a **consequence**, not a starting point, and until 2026-07-29
nothing on disk said so:

```
research/  →  master.md  →  VERIFY  →  the mandate  →  thesis  →  screen.md  →  pull  →  the tiered board
   job 0        job 1       job 2      ask the client   job 3      job 3b      job 3b     job 3b
   ╰──────────── HUNT B ─────────────╯                            ╰────────── HUNT C ──────────────────╯

clients/register.csv  →  leads.mts rank  →  a conversation  →  deals/<engagement>/
   ╰────────────── HUNT A, on its own clock ──────────────╯          job 7 tracks it
```

`screen.mts init` refuses to seed a buy-box for a market with no thesis. A thesis
is held for a client — `deals/<engagement>/thesis-<market>.md` — and the client's
mandate is the half of it the research cannot supply. PLAYBOOK.md section 4
carries the interview.

## The jobs

### 0. Start a market

```
cp -R markets/_example-market markets/<name>
```

Then fill `research/`. That is the step that does not happen by itself: a new
market has nothing in it, and the master is only ever as good as what you put
there. Gather from wherever — web search in session, a Gemini deep-research
export, a PDF, pasted text — and save each read as its own `.md` or `.txt` in
`research/`. **Keep the source URLs inside the file.** `audit.mts` checks that
they survive into the master, and it will tell you when they have not.

One read is not research. Conflicting sources are the normal case, and the
citation law below depends on having both of them on disk.

### 1. Fold research into the market's master

Read every file in `markets/<m>/research/`, plus the current `master.md` if one
exists, and write a new master. Copy the previous master to
`versions/master-v<n>.md` before overwriting. Then audit:

```
npx tsx $REPO/scripts/studio/audit.mts markets/<m>/master.md
```

### 2. Verify the master against primary sources — DO NOT SKIP

**A clean audit is not proof the figures are true.** `audit.mts` checks
*traceability*: that every number in the master appears in a document in
`research/`, or is registered under `## Derivations`. It cannot tell you the
research itself is wrong. Faithfully carry a fabricated figure and the audit
goes green.

That is not hypothetical. On 2026-07-27 the home-services master audited clean
and **six of its load-bearing figures did not survive primary-source
verification** — a "$1.2T of dry powder hunting essential services" line that
was an all-sector buyout total relabeled; a "$392B" market size attributed to
the Census that is not in the Census table and traces to a commercial
aggregator; a pest-control "74% recurring" with no source at all; an electrical
trade size that had already been "corrected" once, from one unsourced figure to
another. All four would have gone out under Paul's name on a public post.

So, before anything derives from a master and before anything renders:

1. **List the load-bearing figures** — the ones that will be large on a page,
   quoted in a caption, or relied on in a client document. Usually ten to twenty.
2. **Check each against a live primary source.** Prefer the issuing body over
   anyone citing it: BLS over a trade blog, the Census API over an aggregator,
   the 10-K over the press release, Reuters over a site summarising Reuters.
3. **Write the findings to `research/verification-pass-<date>.md`** as a source
   document — each figure quoted exactly as its source states it, with URL and
   publication date. It then becomes a source the audit can check against, which
   is what lets corrected figures pass honestly.
4. **Register every correction** in the master's `## A.0.x` table: what it was,
   what it is now, and the source that overturned it.
5. **Re-run the audit.**

Worked example: `markets/home-services/research/verification-pass-2026-07-27.md`
and the `## A.0.2` table in that market's `master.md`.

Three failure patterns worth knowing by name, all of them seen in one document:

- **The relabelled total.** A real figure with its scope quietly changed —
  all-sector dry powder retold as sector-specific. Ask what population the
  source actually measured.
- **The laundered citation.** A commercial aggregator says "Census Bureau" with
  no table ID; the figure gets recorded as a Census figure. If a citation has no
  table, no page and no date, it is not a citation.
- **The corrected-to-another-guess.** A wrong figure replaced by a second figure
  nobody sourced either, with the correction logged so it reads as settled. A
  correction needs a source, or it needs to say the figure is unavailable.

When a figure cannot be sourced, **say so on the page**. The home-services deck
has an electrical page carrying no dollar figure and stating why. It reads as
the strongest page in the set, because refusing to quote a number is something
only someone who checked would do.

### 3. Derive a document from the master

Market map · who's who · target map · investment thesis. Read `master.md`, write
to `documents/`. Audit it against the master:

**`PLAYBOOK.md` is the specification — read it before building any of them.** It
carries each document's section structure, THE LINE as it applies to
client-facing work, the mandate interview, and the per-target rules.

**The target map is the one to be careful with.** A market master describes a
market; it does not contain a list of acquisition targets. Building one from the
master alone produces plausible companies that do not exist. If there is no
target-level research, build the SCREEN SPECIFICATION instead — PLAYBOOK.md
carries both shapes, and RESEARCH.md § C is how you get real target data.

```
npx tsx $REPO/scripts/studio/audit.mts markets/<m>/documents/thesis.md --against markets/<m>/master.md
```

### 4. Produce collateral

**Read `FORMATS.md` and `DESIGN_LANGUAGE.md` first, every time.** They are two
halves of one spec and neither works alone:

- **`FORMATS.md` is the container** — which builder, the exact field grammar,
  the image slot dimensions and ratios, the cover budget, the imagery brief.
- **`DESIGN_LANGUAGE.md` is the look** — palette, type, and the dead systems
  named with their hexes. It is canonical: "if a doc, screenshot, or memory
  disagrees with this file, this file wins."

Collateral drifts when a session works from memory instead of those two files,
and it drifts toward a *specific* place. This practice has run seven visual
systems, so the gap does not get filled with nothing — it gets filled with terra
cotta, coral, office blue or hot pink. Every one of those was a real smbX
system once, every one is dead, and every one is listed with its hex in
`DESIGN.md` §2 — which is the single graveyard, and the reason the hexes are
not repeated here. If a colour, a typeface or a layout is about to be decided,
it has already been decided. Go and read it rather than deciding again.

**Verify the spec before you render it.** The builders check nothing — they
print whatever the spec says, at 300dpi, with whatever you typed in the
`source:` line underneath. `verify-spec.mts` is the guard rail:

**It exists as of 2026-07-29.** For two days this section named a script that
was not in the repo, which is worse than naming nothing: the rule read as
enforced and nothing was enforcing it.

```
npx tsx $REPO/scripts/studio/verify-spec.mts markets/<m>/specs/<name>.deck.mts
```

With no `--against` it finds `markets/<m>/master.md` two levels up, which is the
layout — so the common case needs no flag. Pass `--against <doc.md>` when a spec
rests on something other than the master.

Every figure in copy that reaches a page must appear in the master, or be
registered under the master's `## Derivations` — which is part of the master's
text, so it passes for free. Otherwise it exits 1. It reads the spec as a
**module**, so header comments and commented-out drafts are not scanned, only
what reaches a page. It also flags any page carrying a figure with no `source:`
line, and notes figures on the cover or closer, where the format gives no
`source:` slot at all and the check therefore has to be your eyes.

It imports `figuresNotIn` from `house/audit.ts` rather than defining its own
figure regex. One notion of "a figure" in the codebase, and it is the one with a
test suite behind it.

This exists because the market pipeline had a guard rail and the
spec-straight-to-deck path had none — which is how a deck reached LinkedIn
carrying "$700B", "$1.2T", "74%" and "~$250B", none of them verified.

**What it found on its first run against the live specs (2026-07-29):** the
teardown carousel clean at 22 figures, `hs-teaser-rerate` and
`hs-teaser-fragmentation` clean — and **`hs-teaser-dealflow` carrying `9.5x` and
`13.3x` on the card with no attribution.** The caption names Capstone, 27 July
2026; the card does not, and the card is what a reader scrolling a feed
actually sees. That one-pager is already rendered in `collateral/2026-07-29/`.

**A clean verify-spec is not a clean bill of health.** It proves the spec is
faithful to the master. It cannot tell you the master is right — a
faithfully-carried fabrication passes here exactly as it passes `audit.mts`.
Job 2 is still the step that catches that.

**A deck with no market behind it still needs a source of truth.** If you are
writing a spec straight from research with no market folder, make the folder
and do jobs 0–2 first. That is the whole point.

```
npx tsx $REPO/scripts/studio/build-report.mts    <doc.md>          # long report PDF
npx tsx $REPO/scripts/studio/build-deck.mts      <spec.deck.mts>   # LinkedIn carousel
npx tsx $REPO/scripts/studio/build-onepager.mts  <spec.post.mts>   # single-image post
```

Run these **from the workspace root**. That is what makes `./assets` resolve
the house library, so a spec can keep saying `trades/hvac-ac.png`. Pass
`--media markets/<m>/media` so the market's own artwork resolves by bare
filename, and **always pass `--out markets/<m>/collateral/<slug>/$(date +%F)`**
— or `.../decks/<slug>/$(date +%F)` when the artifact is client-direct. See the
filing law and the output law above. The bare default is a flat `./collateral`
at the root: it overwrites the last build AND files it outside its market.

### 5. Deal analysis

Read what's in `deals/<d>/documents/`, write to `analysis/`. Same citation
discipline: a number in the analysis comes from a document in `documents/`, or
it says where it came from.

### 6. Find clients — the prospect board (2026-07-31)

**Hunt A. Read `RESEARCH.md § A` first.** This is prospecting for the practice's
own business, and it is neither market research nor a target list. It lands in
`clients/register.csv`.

```
npx tsx $REPO/scripts/studio/leads.mts init            # seed the register
npx tsx $REPO/scripts/studio/leads.mts rank --top 25   # the board — free, offline
```

`buyer_moment` is the whole job. **`thesis_no_flow` is the sale** — they have
declared what they want to own and cannot fill it. `has_both` is an impressive
firm and the hardest sale on the list; do not let the first read as the second.

**Read the composition block, not just the top of the list.** If most of the
register comes back `has_both`, you found active consolidators rather than
prospects and the hunt needs re-aiming, not extending.

The scorer ranks FIT and cannot tell you a buyer is real. `last_deal_on` is the
column that fixes that; it flags every row where it is empty rather than scoring
around the gap.

*The job numbers are labels, not an order. Hunt A comes before everything, but
renumbering would break every "job 2" reference on disk and in the skill.*

### 7. Track the client work (2026-07-31)

`deals/<engagement>/engagement.md` records what we are doing for someone and
where it stands. Front matter carries the stage, who the next move belongs to,
and what that move is; the body carries the mandate, the current picture, and a
dated log.

```
node engagements.mjs list                          the board
node engagements.mjs new "<client>" "<engagement>"  scaffold one
node engagements.mjs stage <path> <stage> [note]    advance it, stamped + logged
node engagements.mjs note  <path> "<note>"          append to the log
node engagements.mjs board                          rewrite ENGAGEMENTS.md
node engagements.mjs check                          exit 1 if anything stalled
```

Stages: `prospect → engaged → thesis → sourcing → outreach → diligence →
structuring → closing → closed`, plus `parked` and `ended`, which never read as
stalled. It is plain node on built-ins — no install, no tsx, no network — and it
lives in the workspace so a cloud session has it without cloning the repo.

Three things to hold onto:

- **`waiting_on` is the honest field.** Most engagements do not stall because
  the work is hard; they stall because someone is waiting on someone. `board`
  prints an "Ours to move" list off exactly that, and it is the only part of the
  page worth reading most mornings.
- **The script is optional.** These are markdown files. Edit them by hand, or
  ask a session to. `check` and `board` are conveniences, not gatekeepers.
- **A stage is what WE are doing, never what the client did.** "closing" means
  we are supporting a close the client runs and signs. THE LINE does not bend
  because a status field is shorter that way.

---

# THE LAWS

These are not style preferences. Each one exists because breaking it costs
something real.

## Citation law

**Every figure must be traceable.** In a master: it appears in a source, or it
is registered in a `## Derivations` section with its inputs, arithmetic and
assumption. In a derived document: it appears in the master, or same.

**A rounded figure is a different figure.** `$835B` is not `$835.5B`. Do not
round, restate in different units, or approximate a number into a new one —
`audit.mts` will flag it, correctly.

**Conflicting sources keep BOTH values.** If one source says $700M and another
says $600M, the document says exactly that and cites both. A range citing both
endpoints is legitimate. **An invented midpoint is not** — never split the
difference into a number no source reported.

**Every source document is acknowledged** in a `## Sources` register, and
source URLs carry through.

**Run the audit before anything leaves this folder.** It is mechanical, free,
and it is the whole reason these documents can be defended.

**What the audit cannot do — two blind spots, both real:**

1. **It checks numbers, not prose.** A fabricated qualitative claim carries no
   figure and passes clean.
2. **It checks traceability, not truth.** It proves a figure came from your
   research; it cannot tell you the research is wrong. A faithfully-carried
   fabrication audits green. This is why job 2 exists and why it is not
   optional — a clean audit on unverified research is a false green light, and
   more dangerous than no audit at all, because it feels like the check was done.

## Report voice law (2026-07-28)

**A report states what is true. It does not narrate how it came to know.**

The audit trail is real work and it belongs on file — in `research/`, and in
the appendix correction ledger. It does not belong in the body. A reader who
came for the market does not want to watch the fact-check happen, and a
document that keeps announcing its own diligence reads as anxious rather than
authoritative.

So the body carries **no** "NOT FOUND", no "RETIRED", no "not re-verified", no
"vendor-interested", no "prior versions carried", no "see A.0.2". If a figure
did not survive verification, it is simply absent — the reader never needed to
meet it. If two live sources disagree, say so in one clean sentence and carry
both: that is analysis, not audit trail.

What the body does carry is a **concise attribution** where a figure lands —
`(Capstone, 2026-07-27)`, `(IBISWorld, January 2026)`. Publisher and date, then
move on. That is the footnote; nothing more is needed.

One distinction the body DOES keep, because it changes what a number means:
most large transaction figures in this market reach print through trade press
citing unnamed sources, with the parties declining to disclose terms. Name the
outlet when you use one. Say it once, near the table it governs — not on every
row.

Scale of the difference, measured on the home-services master: stripping the
narration took the body from 136K characters to 92K. A third of it was the
document talking about itself.

## Standing appendix (2026-07-28)

**Every report ends with the same block**, and `REPORT_TEMPLATE.md` in this
folder holds it ready to paste. Four things, in this order:

1. **Information basis** — everything drawn from publicly available sources,
   named by family.
2. **Confidentiality** — no proprietary or confidential information obtained or
   used; nothing from an NDA, a data room, management access or a client
   engagement; no company named provided information for it.
3. **The three-class convention** — Reported / Verified / Derived, as a table,
   so the body never has to label a figure inline.
4. **The correction record** — `A.0.1`, `A.0.2`, `A.0.3`… numbered by pass,
   each entry stating what the figure was, what it became, and the named source
   that overturned it. Retired figures stay named so they are recognisable if
   they resurface from an older copy.

Corrections are recorded, never quietly absorbed. Two of the entries in the
home-services ledger are cases where a *previous correction* was itself wrong,
and one is a figure removed as unsourced that turned out to be sourced and was
restored. That history is the reason the document can be trusted; hiding it
would not make it truer.

## Render law (2026-07-28)

**House collateral comes out of a builder. Always.**

`build-report.mts`, `build-deck.mts`, `build-onepager.mts` — these import
`house/tokens.ts`, which is why every surface matches. Hand-rolling HTML and CSS
for "just this one PDF" produces something off-brand that looks close enough to
ship, and it happened on this workspace: a 52-page report went out in
terra-orange and Georgia because a session could not find the template and
wrote its own instead of looking harder. The CARTA palette (2026-08-08) is bone
`#FCFAF6`, ink `#16181A`, Deal Green `#0A7A58`, mint `#A8F0CE` on dark, and a
FLAT band `#131512`, in Source Serif 4 / Schibsted Grotesk / IBM Plex Mono.
Radius 0 except buttons and inputs at 10px; framed things wear four ink corner
handles. If the output does not look like that, it did not come from a builder.

**There is no warm colour in this system.** Amber and honey were retired on
2026-08-08 and have no replacement — amber was a working house colour for eight
days, which makes it the single most likely wrong hex in a draft. The jade block
and the whole green-black era before it are retired too.

**Their hexes are deliberately not written here.** `DESIGN.md` §2 is the one
graveyard, this paragraph says of itself that it is a pointer and not a second
source, and a retired hex quoted in a live file is a retired hex a session can
copy. `carta-guard.mts` enforces that: it exempts §2 and flags everywhere else.

## Carta is canon, and reversion is a build failure

Paul, 2026-08-08: *"make the style sticky and eliminate reversion to any
previous style. Any previously generated docs will be re-rendered in Carta if
they are updated or asked to redo."*

**THE RE-RENDER LAW. A pre-Carta artifact is never patched — it is rebuilt.**
If a deck, a one-pager or a report needs to change, re-render it from its spec
into a **new dated folder**. Never edit an old output, never lift a page out of
one, never reuse its images, and never "just fix the one slide". Every dated
folder before `2026-08-08` carries a `RETIRED-PALETTE.txt` saying exactly this;
they are history, not a starting point.

**THREE THINGS ENFORCE IT, and none of them is a document.**

| | What it stops |
|---|---|
| `house/palette-guard.ts` | Every builder calls it on the document it is about to render. A retired hex or a retired typeface **fails the build** — exit 4, offender named, nothing written. |
| `scripts/studio/carta-guard.mts` | The preflight. Scans source for retired hexes and the artwork library for drifted grounds and amber masses. Photographs are detected by colour count and exempt. A file marked `CARTA-HOLDOUT` is reported every run without failing it. |
| `npm run test:design` | DESIGN.md and `house/tokens.ts` must agree, and the dead table must name every retired hex without quoting a live one. |

```bash
npx tsx $REPO/scripts/studio/carta-guard.mts --assets assets --src .
```

Run the preflight at the start of a build session. The palette guard runs
itself, on every render, whether you remember it or not.

**Why enforcement rather than instruction.** This practice has watched a written
palette rule fail three times in eight days: a handoff described a palette that
was never committed, a work order described one that was never on disk, and a
completed conversion shipped correct pages carrying retired pictures. A rule in
prose is read by whoever happens to read it. A build that will not produce the
wrong artifact is read by everyone.

**Rule files go stale too.** `init-workspace.mts --update` now actually
refreshes CLAUDE.md, DESIGN.md, FORMATS.md and the rest from the repo — it was
inert from 2026-07-29 to 2026-08-08, guarded by `!existsSync`, printing
"workspace ready" while the rules sat two palettes behind. It backs up what it
replaces into `_to_delete/rules-backup/`, because a workspace file may carry
local edits the seed does not have.


**Carta is canon until Paul says otherwise (2026-08-08, his words).** There is
no interim state and no "still on the old palette" surface that is allowed to
stay that way — if you find one, it is a bug to report, not a precedent to
follow. `npm run test:design` is the check.

If you are a cloud session and the builders will not run, that is what
`CLOUD_BOOTSTRAP.md` is for. Read it rather than improvising.

## Markdown hazards in a report (2026-07-28)

Two of these have already shipped. Both are silent — the render succeeds and
looks wrong.

- **Never use `~` for "approximately."** GFM reads paired tildes as
  strikethrough, so `"~8M units vs. ~6:1"` renders with everything between them
  struck out. It hit 51 lines of one master before anyone noticed. Use `≈` or
  the word "about".
- **Never end a sentence immediately after a bare figure** — `…drain/sewer $59.`
  The auditor tokenises `$59.` with the full stop attached and reports a figure
  that appears in no source. Add a unit or a word: `$59 per lead.`
- **A rounded figure is a different figure**, in the body and in the appendix
  alike. If the source says `$230.78 billion`, the report says `$230.78B`, not
  `$230.8B`.

## Cover budget (2026-07-28)

The dark cover is a fixed page and it will silently overflow — the byline and
headshot slide onto page 2 and the cover just looks like it has a hole in it.
The budget, at the current type scale:

- A **one-line title** affords a hero, three stat cards and four numbered cards.
- A **two-line title** costs one card. Three, then.
- Stat cards run three to a row. Six is two rows and eats a card's worth again.

**Look at page 1 of every render.** It is one command and it is the only way to
catch this:

```
pdftoppm -png -r 55 -f 1 -l 1 collateral/<slug>/<date>/<slug>.pdf /tmp/cover
```

Cover copy is **industry highlights** — the findings a reader should know before
anything else. Not a table of contents, and not a summary of the document's own
process.

## Derived artifacts do not follow the master (2026-07-28)

A deck spec, a one-pager and a thesis are **snapshots**. Re-synthesising the
master changes none of them, and nothing mechanical will tell you. The
home-services carousel sat on LinkedIn carrying "three quarters of
critical-trade operators are still true independents" — a misreading of
McKinsey's *76% of market share* — for a full day after the master had been
corrected.

So: when a master changes, list what was built from it and re-run
`verify-spec.mts` against every spec before anything is reposted. `thesis.mts
check` does this for theses; decks and one-pagers have no equivalent, so it is
a manual step and it is on the person changing the master.

## THE LINE — the practice perimeter

Full text in `THE_LINE_POLICY.md` in the repo. The parts that bind daily work:

- **Buy-side only.** Never sell-side, never two-sided, never a neutral
  intermediary. One buyer per target.
- **No specific-target valuations.** Market-level multiples and ranges with
  their sources, yes. A value on a named company, no.
- **No unlicensed opinions** — securities, tax, legal, appraisal. Name the
  specialist the client should engage and what to ask them. That is the correct
  move, not a hedge.
- **No fee talk** in any client-facing document.
- Targets under $250M revenue.

**Client confidentiality (2026-07-29).** `deals/<engagement>/` is a client
mandate. It is confidential in both directions and the boundary is not soft:

- **It is never a source.** No figure, quote or observation from an engagement
  folder enters a master, a market document, or anything in `collateral/`. The
  standing appendix in every report states that no proprietary or confidential
  information was obtained or used, and that statement has to stay true.
- **A mandate never reaches a page.** Hold period, equity available, leverage
  tolerance, check size, what they walked away from — none of it appears in
  anything posted, and none of it appears in another client's thesis.
- **`audit.mts` will not catch a breach**, because it checks whether a figure
  traces, not where it came from. A client's check size quoted in a public deck
  would audit perfectly clean. This one is on the person writing.
- A client thesis is client-direct by construction: if it renders, it renders to
  `decks/`, never `collateral/`.
- **So is a tiered target board** (2026-07-31). `markets/<m>/screen/candidates.csv`
  is a public-source pull of a market and is reusable across engagements. The
  tiering, the ruled-out reasoning and the what-to-check-first notes are written
  against one client's buy-box, so that document is
  `deals/<engagement>/analysis/target-map-<market>.md` and it renders to
  `decks/`. Filing a tiered board in `markets/<m>/documents/` is how it gets
  reused for the next client, which is the breach nobody notices happening.

## Attribution law

The track record is **employment** deals, not smbX engagements.

- Always "**led or co-led**", never "closed" unqualified.
- Always "**selected transactions**".
- The attribution line appears **wherever the deal names appear** — never as a
  footnote.
- Employers are **never named**: "a global investment bank", "a world-class
  PE-backed aggregator". The total is **150 acquisitions**, no "+".
- Never "our clients" for an employment-era transaction.

## Imagery

**Real or none.** No stock photography, ever. Paul's real photos only — never
AI-generate or alter a photo of Paul. The headshot is
`$REPO/client/public/founder-portrait.jpg`; drop a copy in `assets/`.

Generated *illustration* is fine where it is obviously illustration. A
photograph that implies something happened is not. The two families are kept
apart in the library on exactly that line: `assets/trades/` and
`assets/concept/` are generated illustration with their prompts on file;
`assets/mep/` is photography and stays photography.

**The report builder does not see `assets/`.** `build-report.mts` resolves an
image from the `.md`'s own folder, that folder's `media/`, its **sibling**
`../media/`, or `$REPO/client/public/` — and nothing else. The deck builder's
`--media` → `./media` → `./assets` chain does not apply. So a report's art
lives in `markets/<m>/media/`, referenced by bare filename, and the report's
`.md` lives in `markets/<m>/documents/` beside it. The `../media` step was
added to the resolver on 2026-07-29: before it, a report `.md` filed in
`documents/` could not see its own market's `media/`, and every cover image and
section band resolved to nothing — silently, because a missing accent just does
not render.

**Compose bands; do not point a band at a raw asset.** An accent renders 2.2in
tall and full width, roughly 3.2:1, and the trade illustrations are square. A
centre crop slices them into an unreadable strip; letterboxing leaves the
artwork stranded in the middle of an empty field. What works is a composed
band — bone canvas, illustration at full band height sitting right of centre, a
short Deal Green rule anchoring the left third. Consistent across every band, so
they read as one system.

Compose at print weight while you are there: 1700×520 JPEG at q88 is about
45KB. The raw PNGs are 4–5MB each, and nine of them took one report to 11MB
before anyone asked why.

## Voice

Senior operator writing for a principal. Factual, specific, unhurried. No hype,
no consultant filler, **no AI self-reference of any kind**. Never criticize a
named competitor — describe the work, not other people's work.

**Plain language, always, on every surface (2026-08-03, Paul).** The reader is a
principal deciding whether to trust us against a bank running an auction. That
trust is earned by being understood, not by sounding expert. Explain the thing
rather than naming it — not "EV/EBITDA is 16.34x" but "compare the whole
business, debt included, to its operating earnings, and it is 16.34x". And
**write the one-sentence message before the pages**, in the spec header: a piece
can be perfectly sourced, pass every check, and still fail because it never says
what it is for. `voice-check.mts` catches the shorthand and the missing message;
`DESIGN.md` §9 has the full rule with worked examples. Neither can tell you
whether a sentence sounds like a person — read it aloud.

Every client-facing document ends on **what we don't know yet**. A named gap is
worth more than a confident guess.

---

## Why this is local

The app's Anthropic key hit its organization spend ceiling mid-synthesis, and
every authoring function stopped at once. The renderers, the model math and the
audit never needed an API — only the writing did, and the writing is what a
Claude Code session on this folder does for free.

Keep this folder in git. You get version history on every master, readable
without a database.
