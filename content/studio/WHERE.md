# Which system does this — the settled answer

> **GENERATED from `house/where.ts` by `scripts/studio/where.mts render`.**
> Do not hand-edit: a test fails when this file and the table disagree.
> To change a routing decision, change the table and re-render.

**The app is the one place. Cowork keeps research, the documents derived from it, and collateral.**

Research is the only path that spends real money, and it is a quarterly
batch per market rather than something done mid-deal — a different season,
not back-and-forth. Everything that **interleaves in one sitting** —
sourcing, the model, deal state, the CRM, the call — lives in the app
together, because splitting interleaved work is what made moving between
systems painful.

## Why, in four measured findings

1. **DEFINITIVE cannot leave the app** — 169 gate/slot references, 132
   `MODEL.*` definitions, 385 conformance cases, and no local equivalent.
   It is a stateful substrate; files are the wrong shape for it.
2. **Interactive valuation is a UI problem.** A what-if wants a slider, not
   a regenerated file. The app has eleven canvas models and they call no
   model at all.
3. **Only research ever cost real money** — ~$18 a press at `deep`.
   Modelling, CRM, deal state, comms and exports all measure at zero.
4. **Sourcing was never expensive either** — Haiku per candidate, and
   Places on a separate key, free under 5k lookups a month.

## The table

| Process | Where | Cost |
|---|---|---|
| Market research — build a master from scratch | **Here** — this workspace | **can spend dollars** |
| Fold research into the market master | **Here** — this workspace | **can spend dollars** |
| Market map · who's who · target map · thesis | **Here** — this workspace | free |
| Build the candidate list for a market | **Here** — this workspace | free |
| The 5-stage sourcing engine | **The app** | a drip |
| DEFINITIVE — gates, model slots, DealState | **The app** | free |
| Valuation and deal modelling | **The app** | free |
| Deal pipeline — stage, owner, next action | **The app** | free |
| Deal memo · diligence plan · term framework | **Here** — this workspace | free |
| Client register and pipeline | **The app** | free |
| Outreach queue and sends | **The app** | free |
| Lawyers, CPAs, lenders, sellers' advisors | **The app** | free |
| LinkedIn carousels, one-pagers, reports | **Here** — this workspace | free |
| The public site and published research | **The app** | free |
| LinkedIn analytics import | **The app** | free |
| The Saturday research sweep | **Here** — this workspace | **can spend dollars** |
| The citation audit | **Either** — identical either side | free |

## Sourcing — finding markets and targets

### Market research — build a master from scratch

**Here — this workspace** · one press can spend dollars

The only path that spends dollars per press, and it is a quarterly batch rather than something you do mid-deal.

- Read RESEARCH.md § B. A full hunt is ~20 runs over several hours.
- Sources land in markets/<m>/research/, logged in _log.md — it is resumable.
- Never run this in the app: the studio lane is off precisely because of this path.

### Fold research into the market master

**Here — this workspace** · one press can spend dollars

Every source's full text in one call, plus a retry when the citation audit fails. Document-shaped and wants a diff.

- Synthesize into markets/<m>/master.md, version into versions/master-vN.md.
- npx tsx $REPO/scripts/studio/audit.mts markets/<m>/master.md
- The master is the source of truth. Never copy it — derive from it.

### Market map · who's who · target map · thesis

**Here — this workspace** · free, calls no model

Documents someone reads later. They want a file, a version and a diff, and the citation audit lives here.

- PLAYBOOK.md §1–4 carries each one section by section.
- npx tsx $REPO/scripts/studio/thesis.mts new <market> <profile>
- npx tsx $REPO/scripts/studio/thesis.mts check   # staleness against the master

### Build the candidate list for a market

**Here — this workspace** · free, calls no model

A CSV Paul manages in Sheets. Discovery, not commitment — it becomes app rows only when a target goes live.

- npx tsx $REPO/scripts/studio/screen.mts init <market>
- npx tsx $REPO/scripts/studio/screen.mts pull <market>   # needs GOOGLE_PLACES_API_KEY
- npx tsx $REPO/scripts/studio/screen.mts rank <market>   # free, offline
- Places is DISCOVERY, not evidence — verify against the licence registry before a name reaches a client.

### The 5-stage sourcing engine

**The app** · a drip — cents

Haiku per candidate on a separate Places key that is free under 5k/month. It feeds the deal pipeline directly, so it interleaves.

- App → Sourcing. Needs the `sourcing` lane in API_LANES.
- Was switched off for having a local equivalent, not for cost.

## The deal — from a live target to close

### DEFINITIVE — gates, model slots, DealState

**The app** · free, calls no model

App-only and not portable: 169 gate/slot references, 132 MODEL.* definitions, 385 conformance cases. A stateful substrate, not a document.

- App → the deal. Gates advance as the deal advances.
- Calls no model — verified, no API key reference in v19ModelRuntime.ts.
- There is no local equivalent and building one is not a project, it is a year.

### Valuation and deal modelling

**The app** · free, calls no model

Interactive modelling is a UI problem — a what-if wants a slider, not a regenerated file. Eleven canvas models, none of which call a model.

- App → the canvas. Free, instant, and the assumption you change is the point.
- For a one-off away from the app, or to put the arithmetic in a document:
-   npx tsx $REPO/scripts/studio/deal.mts run deals/<d>/analysis/<t>.deal.mts
- Both surfaces run house/deal.ts, and npm run test:deal fails if they ever disagree.

### Deal pipeline — stage, owner, next action

**The app** · free, calls no model

"What stage is this at" is a question, and a question needs rows and SQL. A folder cannot answer it.

- App → Deals. Forms and SQL; nothing metered.

### Deal memo · diligence plan · term framework

**Here — this workspace** · free, calls no model

Documents someone reads and signs off. They draw FROM app rows, but the artifact is a file that wants a version history.

- PLAYBOOK.md §5b–5d carries each one section by section.
- Export the numbers from the app, write the memo on disk.
- Never restate the model's figures by hand — reference the model document.
- Renders to deals/<d>/decks/, never collateral/.

## CRM and communication — clients, and everyone else

### Client register and pipeline

**The app** · free, calls no model

A CRM is forms and SQL and calls no model at all. "Who owes a touch this week" is a query.

- App → Clients. crm_accounts / crm_contacts / crm_activity.
- Research the register in Cowork, push it in:
-   npx tsx $REPO/scripts/studio/push-crm.mts

### Outreach queue and sends

**The app** · free, calls no model

The queue is rows. THE LINE is structural here: one touch, one press, one human — there is no batch-send endpoint and there must not be.

- App → Clients → Outreach.
- A human presses send on every touch. The worker may assemble; it must never release.

### Lawyers, CPAs, lenders, sellers' advisors

**The app** · free, calls no model

Email out plus token share links — free, and it keeps third parties corresponded with rather than onboarded. Never build this on direct_threads.

- App → email + document share links. sendEmail / documentShareService.
- service_providers + service_referrals is the typed register for these people.
- Nobody outside the team ever gets an account.

## Collateral — what goes out

### LinkedIn carousels, one-pagers, reports

**Here — this workspace** · free, calls no model

Pure local Chromium, ~30s a build, no key. The builders are already here and the specs are versioned beside them.

- Read FORMATS.md (containers) and DESIGN.md (the look) first, every time.
- npx tsx $REPO/scripts/studio/build-deck.mts <spec.deck.mts>
- npx tsx $REPO/scripts/studio/build-onepager.mts <spec.post.mts>
- npx tsx $REPO/scripts/studio/build-report.mts <report.md>

### The public site and published research

**The app** · free, calls no model

Front end and marketing — the half that was never in question. Railway deploys on push to main.

- Engine repo → client/src/practice/.
- A report publishes by dropping the .md in scripts/studio/reports/ and registering it.

### LinkedIn analytics import

**The app** · free, calls no model

THE STANDING EXCEPTION — the XLSX parser has no local equivalent. It calls no model, so importing works whatever the lanes say.

- App → Studio → Performance → import the .xlsx.
- The mechanical parse is the part worth porting one day. The read is a session's job anyway.

## Ops — the standing jobs

### The Saturday research sweep

**Here — this workspace** · one press can spend dollars

Research on a schedule, so it belongs where research belongs. A quarterly rotation, one market a week.

- node weekly.mts due       # whose turn it is; exits 0 when nobody is
- WEEKLY.md is the standing prompt. It WRITES but never PUBLISHES.
- Everything lands in a pull request — that is the review gate.

### The citation audit

**Either — identical either side** · free, calls no model

house/audit.ts is pure and shared, so both sides compute an identical answer. Run it wherever the document is.

- npx tsx $REPO/scripts/studio/audit.mts <doc.md> --against <master.md>
- Exit 0 clean · 1 not clean · 2 NOT AUDITED (no machine-readable source).
- The honest limit: it checks NUMBERS, not prose. A fabricated claim with no figure passes.

## Something not on this list

An unlisted process is one nobody has decided about. **Do not pick a side
by feel** — that is how the same work ended up in two systems the first
time. The tiebreak:

- Does it INTERLEAVE with other work in one sitting? → the app.
- Is the artifact a DOCUMENT someone reads later? → the workspace.
- Can one press spend dollars? → the workspace, and say so out loud.
- Still unclear? Ask Paul and add a row here. Do not decide it twice.

`where.json` beside this file is the same data, machine-readable.
