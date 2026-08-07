# smbX studio workspace

This folder is Paul Baker's corp-dev practice, on his machine. Claude Code
drives it. There is no app, no server, no database — the folders below are the
system of record, and the SMBx repo is the engine you run against them.

**Set `REPO` once per session** to wherever the SMBx repo is cloned, e.g.
`~/code/SMBx`. Every command below uses it.

## Layout

```
markets/<market>/     a knowledge base for one market
    research/         the reads gathered anywhere — Claude, Gemini, PDFs
    master.md         THE one synthesized document, built from all of research/
    versions/         master-v1.md, master-v2.md … the history
    documents/        derived: market-map.md, whos-who.md, target-map.md,
                      thesis-<buyer profile>.md (one per profile)
    screen/           the target board — screen.md (buy-box + queries),
                      consolidators.md (who already owns what),
                      benchmarks.md, candidates.csv
    collateral/       rendered output for this market
clients/<client>/<engagement>/  what we're doing for a client, and where it stands
                      engagement.md  stage, next move, log
                      documents/     what they sent us
                      analysis/      what we produced

deals/<deal>/
    documents/        what the seller sent
    analysis/         what we produced
    notes.md          the running record
media/                per-slot artwork (Gemini exports, photos)
assets/               recurring images — headshot, brand shots
collateral/           general rendered output
decks/                deck specs
posting-plan.md       what to build next
THESES.md             every position we hold and what it rests on (generated)
```

## The rule files in this folder — and when to read which

These sit beside this file. They are not background reading; each one exists
because work drifted without it.

```
PLAYBOOK.md   the SPEC for each client document — market map, who's who,
              target map, investment thesis. Section by section.
RESEARCH.md   the METHOD for gathering. THREE SEPARATE HUNTS — do not mix
              them: (A) clients to serve, (B) how a market works, (C) targets
              for a client to buy. Different sources, different scorers,
              different outputs. 15–25 runs each, several hours, usually more
              than one session.
FORMATS.md    the collateral containers — which builder, which fields, and the
              exact image slot dimensions.
DESIGN.md     the house LOOK — palette, type, layout grammar, and the retired
              design systems named with their hexes.
```

**Route by what you were asked for:**

| Asked to… | Read FIRST |
|---|---|
| find **clients** — acquirers to pitch, a prospect list for us | **RESEARCH.md § A** |
| research a **market** / build a market map from scratch | **RESEARCH.md § B** |
| build a **target list** of companies for a client to buy | **RESEARCH.md § C** |
| fold new research into a master | job 1 below |
| write a market map, who's who, target map or thesis | **PLAYBOOK.md** |
| build a carousel, one-pager or report | **FORMATS.md**, then **DESIGN.md** |
| anything, and you are about to hand-write HTML or CSS | **DESIGN.md** — stop, you are drifting |

**Three hunts, and they are not interchangeable.** A "list of companies" means
something different in each: A is acquirers we want as clients, C is companies a
client should buy, and B is not a list at all. Getting this wrong produces an
authoritative-looking artifact that answers a question nobody asked.

The engagement order is **B → thesis → C**. And never derive C from B alone: a
market master contains no target list, so building one from it invents companies.

**The hard precondition.** Every client document is DERIVED from
`markets/<m>/master.md`, which is derived from `markets/<m>/research/`. So:

> If `research/` is empty or thin, you cannot write the document you were asked
> for. Building a market map from an empty research folder does not produce a
> thin map — it produces an invented one, which is the worst failure this
> practice has. Go to **RESEARCH.md** and do that job first, and say so plainly
> rather than producing the document shape with nothing behind it.

Check before you start:

```
ls markets/<m>/research/ | wc -l      # 0 or 1 → you are at RESEARCH.md, not here
cat markets/<m>/research/_log.md      # mid-job? resume from the first row not `done`
```

## The six jobs

### 1. Fold new research into a market's master

**If the research does not exist yet, read `RESEARCH.md` first.** Building a
market map from scratch is six passes and roughly twenty runs across several
hours — usually more than one session. That file carries the procedure, the
coverage ledger that makes it resumable, and the stop condition. This job here
assumes `research/` is already populated.


Read every file in `markets/<m>/research/`, plus the current `master.md` if one
exists, and write a new master. Then **audit it before anything else happens**:

```
npx tsx $REPO/scripts/studio/audit.mts markets/<m>/master.md
```

Copy the previous master to `versions/master-v<n>.md` before overwriting.

### 2. Derive a corp-dev document from the master

**Market map · who's who · target map · investment thesis.** These are the
practice's work product — what a client is paying for. Collateral is the
byproduct.

**`PLAYBOOK.md` in this folder is the specification.** Read it before building
any of them: it carries each document's section structure, THE LINE as it
applies to client-facing work, and the per-target rules for the target map.

They land in `markets/<m>/documents/`. Audit before sending:

```
npx tsx $REPO/scripts/studio/audit.mts markets/<m>/documents/thesis.md --against markets/<m>/master.md
```

**The target map is the one to be careful with.** A market master describes a
market; it does not contain a list of acquisition targets, because the good
independents are precisely the companies nobody wrote a report about. Building
a target map from the master alone produces plausible companies that do not
exist. If there is no target-level research in `research/`, build the SCREEN
instead — PLAYBOOK.md has both shapes.

**To get real target data, run the screen.** It pulls the market from Google
Places and tags who is already owned — no model, so nothing is invented:

```
npx tsx $REPO/scripts/studio/screen.mts init <market>   # seed screen/ config
npx tsx $REPO/scripts/studio/screen.mts pull <market>   # Places → screen/candidates.csv
npx tsx $REPO/scripts/studio/screen.mts rank <market>   # classify, size, score — free, offline
```

`pull` needs `GOOGLE_PLACES_API_KEY` — a different key from the Anthropic one,
and the search itself is free. `rank` needs nothing.

**`screen/consolidators.md` is the load-bearing file.** `rank` calls a business
independent when it is *not in that register*, so write it from the master's
who's-who before trusting a single row. An empty register tags everything
`unknown` rather than declaring a market of franchises independent — that is
deliberate, and it is the answer when you have not done the work yet.

The list is meant to live in a Google Sheet: import `candidates.csv`, sort and
annotate, export back over the same file, re-run `rank`. Columns you add survive.

**What you may keep.** Google's terms allow storing place IDs indefinitely but
treat name/phone/rating/reviews as a temporary cache, so the board ages them out:
`screen.mts refresh <market>` re-pulls them, `--forget` clears them. Your own
columns and the affiliation/score judgements are yours and survive either way.

**Places is discovery, not evidence.** Before a company name reaches a client
document, verify it against a primary source — the state licence registry, the
company's own site — and cite that. "Google rating 4.7" is weak work product
whatever the terms say.

**A thesis belongs to a buyer, so a market carries several.** The same research
makes a different case for a family office than for an independent sponsor. Each
is stamped with the master version it was built from, which is what lets
staleness be checked rather than remembered:

```
npx tsx $REPO/scripts/studio/thesis.mts new home-services family-office
npx tsx $REPO/scripts/studio/thesis.mts list      # every thesis, with standing
npx tsx $REPO/scripts/studio/thesis.mts check     # exits 1 if an ACTIVE one is behind its master
npx tsx $REPO/scripts/studio/thesis.mts register  # rewrite THESES.md
```

**Run `register` after writing or revising a thesis**, and **run `check` after
re-synthesizing a master** — that is the moment positions silently go stale.
`THESES.md` is generated; edit the theses, not that file.

### 3. Produce collateral

**Read `FORMATS.md` and `DESIGN.md` in this folder first, every time.** They are
two halves of one spec and neither works alone:

- **`FORMATS.md` is the container** — which builder, the exact field grammar,
  the image slot dimensions, the imagery brief.
- **`DESIGN.md` is the look** — palette, type, the layout grammar of the three
  formats, the standing marks, and the retired systems named with their hexes.

Collateral drifts when a session works from memory instead of those files, and
it drifts toward a *specific* place: this practice has run seven visual systems,
so the gap gets filled with coral, terra cotta or office blue rather than with
nothing. If a colour, a typeface or a layout is about to be decided, it has
already been decided — read DESIGN.md §2 and §4.

```
npx tsx $REPO/scripts/studio/build-report.mts    <doc.md>          # long report PDF
npx tsx $REPO/scripts/studio/build-deck.mts      <spec.deck.mts>   # LinkedIn carousel
npx tsx $REPO/scripts/studio/build-onepager.mts  <spec.post.mts>   # single-image post
```

Run these from the workspace root: they default to `./media` + `./assets` for
images and `./collateral` for output.

**Never hand-roll a layout.** The builders are deterministic — the same spec
renders the same pixels. If the output looks off, the spec is wrong, not the
renderer. Writing your own HTML/CSS to "match the style" is the drift — it is
the largest single tell, and the reason a 52-page report once shipped in the
wrong typeface.

**Write the imagery brief before building anything.** Every production run:
work out what images the piece needs and write the Gemini prompts to
`markets/<m>/collateral/image-brief.md`, sized to the slot table in FORMATS.md.
This is a standing step, not a conditional one.

**Then look at the render.** Every image slot is `object-fit: cover`, so the
image is cropped from the centre. Build, open the output, adjust `imagePos`,
build again. One pass of that is the difference between fitting and not.

### 4. Deal analysis

Read what's in `deals/<d>/documents/`, write to `analysis/`. Same citation
discipline: a number in the analysis comes from a document in `documents/`, or
it says where it came from.

### 5. Track the client work

`clients/<client>/<engagement>/engagement.md` is the record of what we're doing
for someone and where it stands. Front matter carries the stage, who the next
move belongs to, and what that move is; the body carries the mandate, the
current picture, and a dated log.

```
node engagements.mjs list                          the board
node engagements.mjs new "<client>" "<engagement>"  scaffold one
node engagements.mjs stage <path> <stage> [note]    advance it, stamped + logged
node engagements.mjs note  <path> "<note>"          append to the log
node engagements.mjs board                          rewrite ENGAGEMENTS.md
node engagements.mjs check                          exit 1 if anything stalled
```

Stages: `prospect → engaged → thesis → sourcing → outreach → diligence →
structuring → closing → closed`, plus `parked` and `ended` which never read as
stalled.

Three things to hold onto:

- **`waiting_on` is the honest field.** Most engagements don't stall because
  the work is hard, they stall because someone is waiting on someone. `board`
  prints an "Ours to move" list off exactly that, and it is the only part of
  the page worth reading most mornings.
- **The script is optional.** These are markdown files. Edit them by hand, or
  ask a session to. `check` and `board` are conveniences, not gatekeepers.
- **A stage is what WE are doing, never what the client did.** "closing" means
  we are supporting a close the client runs and signs. THE LINE does not bend
  because a status field is shorter that way.

When an engagement produces a document, it goes in that engagement's
`analysis/`, the same split `deals/` uses: `documents/` is what they sent us,
`analysis/` is what we made.

### 6. Push a research run into the app's CRM

**Paul, 2026-08-07: "I'd like to be able to do all of this in Cowork and just
have that updated list put into the app… where we're not having to drop data
back and forth… but I don't want to burn up API."** So this is the ONE place
the local workspace writes into the app, and the division of labour is exactly
THE SPLIT's: **you do the smart half here on the subscription, the app does the
dumb half for free.**

When a research run produces buyers, capital partners, referral sources or an
updated contact list — from a Google Sheet, a scraped register, a fresh pass,
whatever shape it arrives in — the job is:

1. **Map it into the seven-table bundle.** One folder, CSVs, these names:

   ```
   01_contacts.csv        person rows      02_organizations.csv   firm rows
   03_outreach_waves.csv  the calendar     04_sequence_steps.csv  the plan's steps
   05_message_templates.csv  the copy      06_events.csv          conferences
   07_research_queue.csv  what's unknown
   ```

   `content/crm-seed/` in the repo is the worked example — copy its headers.
   **A partial bundle is legal**: an updated `01_contacts.csv` alone is a valid
   push. The loader upserts; it never wipes what it wasn't given.

2. **Push it.**

   ```
   SMBX_EMAIL=… SMBX_PASSWORD=… npx tsx scripts/studio/push-crm.mts <folder>
   ```

   (or `SMBX_TOKEN=…` to skip the login. `SMBX_APP_URL` defaults to
   https://smbx.ai.)

3. **Read the report back to Paul.** It prints firms new/refreshed, contacts
   added, how many still need a named person, the campaign tables, touches
   queued, and — the part that matters — **every target expression it could
   not resolve, by name.** Those are research tasks, not errors. Nothing is
   ever dropped silently.

**Three laws for this job:**

- **NEVER invent a person, a firm, an email or a title to fill a column.** The
  citation law applies to a CRM row exactly as it applies to a master. A record
  with no named individual goes in with the firm and a research-queue entry —
  the app parks it as "[NAME THE PERSON FIRST]" and it shows up as work to do.
  A plausible invented contact is the most expensive error this loop can make:
  it gets *emailed*.
- **The layer is a judgement, and it is yours to get right.** `bucket` decides
  where a firm lands: `CLIENT` / `CLIENT+REFERRAL` → the ranked board (people
  who might pay a retainer); `REFERRAL` → the address book (capital, lenders,
  counsel, bankers — reachable, never ranked); `ECOSYSTEM_DO_NOT_PITCH` →
  stored and permanently locked out of every send. Mis-bucketing a competitor
  as a client is how a do-not-pitch firm gets pitched.
- **`tier` is conviction (A/B/C), not size.** It ranks the board. Set it the
  way the plan set it, or leave it blank — never guess a tier to make a row
  look important.

**Why this costs nothing on the app side:** the endpoint the push hits
(`POST /api/crm/import-bundle`) is pure code — parse, map, upsert. It calls no
model. The intelligence is the session doing step 1 here, on Paul's
subscription. That is the whole point of the arrangement.

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

**What the audit cannot do:** it checks NUMBERS, not prose. A fabricated
qualitative claim carries no figure and passes clean. That part is on you.

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
photograph that implies something happened is not.

## Voice

Senior operator writing for a principal. Factual, specific, unhurried. No hype,
no consultant filler, **no AI self-reference of any kind**. Never criticize a
named competitor — describe the work, not other people's work.

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
