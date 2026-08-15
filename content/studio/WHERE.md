# Which system does this — the settled answer

> **GENERATED from `house/where.ts` by `scripts/studio/where.mts render`.**
> Do not hand-edit: a test fails when this file and the table disagree.
> To change a routing decision, change the table and re-render.

**The app is the one place. Cowork is the input layer — research, aggregation, deep search, data wrangling.**

> **Not to be confused with `WHAT_LIVES_WHERE.md`**, which answers a
> different question. That file maps the two REPOSITORIES on the Mac —
> engine vs workspace, and which clones are debris. This file decides
> which SYSTEM does a piece of work — this workspace or the app.
> Repo question → that file. Process question → this one.

> ⚠️ **Three of these are decided but NOT YET SWITCHED ON.** Corp-dev
> documents, deal documents and collateral moved to the app on
> 2026-08-14, and the app cannot serve them yet: `STUDIO_IN_APP` is
> `false`, and the single `studio` lane in `API_LANES` bundles those
> cheap composition paths together with the expensive research agent,
> so it cannot be switched on without also arming the thing that costs
> ~$18 a press. The lane needs splitting first. **Until that ships,
> keep doing those three here** — the local builders and the PLAYBOOK
> specs are unchanged and still correct. This file states where the
> work is going, and says plainly where it still is.

Cowork is the INPUT layer: gathering sources, aggregating them into a
master, deep search, and wrangling messy data into something structured.
Everything the practice PRODUCES or TRACKS — the deal, the CRM, the
documents, the collateral — is the app, in one place, because that is
the work that interleaves and splitting it is what made moving between
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
| Market map · who's who · target map · thesis | **The app** | a drip |
| Build the candidate list for a market | **Here** — this workspace | free |
| Data wrangling — messy input into something structured | **Here** — this workspace | free |
| The 5-stage sourcing engine | **The app** | a drip |
| DEFINITIVE — gates, model slots, DealState | **The app** | free |
| Valuation and deal modelling | **The app** | free |
| Deal pipeline — stage, owner, next action | **The app** | free |
| Deal memo · diligence plan · term framework | **The app** | a drip |
| Client register and pipeline | **The app** | free |
| Outreach queue and sends | **The app** | free |
| Lawyers, CPAs, lenders, sellers' advisors | **The app** | free |
| LinkedIn carousels, one-pagers, reports | **The app** | a drip |
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

**The app** · a drip — cents

Moved to the app 2026-08-14 (Paul). These are practice OUTPUT, and they interleave with the deal and the client they are written for — a thesis is held for one buyer profile.

- NOT YET ON: needs STUDIO_IN_APP = true and the studio lane split. Until
- then keep building these here — the local path is unchanged and correct.
- App → Studio → the market. corpDevDocs.ts already generates all three.
- PLAYBOOK.md §1–4 remains the SPEC for what each contains, wherever it renders.
- The master these derive from still lives on disk and is read, never copied.

### Build the candidate list for a market

**Here — this workspace** · free, calls no model

A CSV Paul manages in Sheets. Discovery, not commitment — it becomes app rows only when a target goes live.

- npx tsx $REPO/scripts/studio/screen.mts init <market>
- npx tsx $REPO/scripts/studio/screen.mts pull <market>   # needs GOOGLE_PLACES_API_KEY
- npx tsx $REPO/scripts/studio/screen.mts rank <market>   # free, offline
- Places is DISCOVERY, not evidence — verify against the licence registry before a name reaches a client.

### Data wrangling — messy input into something structured

**Here — this workspace** · free, calls no model

Named by Paul 2026-08-14 as Cowork work. Reading a messy sheet, reconciling exports, mapping columns, bucketing records — judgement over unstructured input, which is what a session is good at and what a form is bad at.

- Do the reading and the mapping here, where the raw files are.
- Push the RESULT into the app rather than working the app by hand:
-   npx tsx $REPO/scripts/studio/push-crm.mts
- The endpoint calls no model — the intelligence is the mapping, and it
- happens on your own subscription rather than the metered org key.
- Never invent a row to fill a column. A fabricated CRM contact gets EMAILED.

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

**The app** · a drip — cents

Moved to the app 2026-08-14 (Paul). These sit inside the deal sitting — written from the model, the gates and the diligence state, all of which are app rows. Exporting to write them elsewhere was the back-and-forth.

- NOT YET ON: the app cannot serve these until the studio lane is split.
- Until then write them here to PLAYBOOK §5b–5d, which is the spec either way.
- App → the deal → documents, alongside the model they are written from.
- PLAYBOOK.md §5b–5d remains the SPEC for what each one contains.
- Never restate the model's figures by hand — reference the model.
- Confidential to the engagement: never a source for anything public.

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

**The app** · a drip — cents

Moved to the app 2026-08-14 (Paul). It is practice output, and the app already has the whole surface — CollateralBuilder, the composers, the media library, the review sheet. Nothing needed porting; Studio was hidden, not removed.

- NOT YET ON: needs STUDIO_IN_APP = true and the studio lane split.
- Until then build here with the builders below — same tokens, same output.
- App → Studio → Collateral.
- FORMATS.md (containers) and DESIGN.md (the look) remain the spec either side.
- The local builders still work and stay supported — same house/ design tokens,
- so a render away from the app is identical, not an approximation:
-   npx tsx $REPO/scripts/studio/build-deck.mts <spec.deck.mts>

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

- Is it RAW INPUT being gathered, aggregated or wrangled? → the workspace.
- Is it something the practice PRODUCES or TRACKS? → the app.
- Can one press spend dollars? → the workspace, and say so out loud.
- Still unclear? Ask Paul and add a row here. Do not decide it twice.

`where.json` beside this file is the same data, machine-readable.
