# Which system does this — the settled answer

> **GENERATED from `house/where.ts` by `scripts/studio/where.mts render`.**
> Do not hand-edit: a test fails when this file and the table disagree.
> To change a routing decision, change the table and re-render.

**The seam is the IoI. Market-shaped work is the studio; deal-shaped work is the app. CRM is app-side from the first touch.**

> **Not to be confused with `WHAT_LIVES_WHERE.md`**, which answers a
> different question. That file maps the two REPOSITORIES on the Mac —
> engine vs workspace, and which clones are debris. This file decides
> which SYSTEM does a piece of work — this workspace or the app.
> Repo question → that file. Process question → this one.

> **Switched on 2026-08-14.** Corp-dev documents, deal documents and
> collateral moved to the app and the app now serves them: `STUDIO_IN_APP`
> is true, and `API_LANES` gained a separate `research` lane so the cheap
> composition paths could be enabled WITHOUT arming the ~$18-a-press
> research agent. One lane could not say that, which is why the move was
> blocked for a day. The local builders still work and stay supported.

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

| Process | Where | Cost | Ready? |
|---|---|---|---|
| Market research — build a master from scratch | **Here** — this workspace | **can spend dollars** | yes |
| Fold research into the market master | **Here** — this workspace | **can spend dollars** | yes |
| Market map · who's who · target map · thesis | **Here** — this workspace | free | ⚠️ partly — see below |
| Build the candidate list for a market | **Here** — this workspace | free | yes |
| Data wrangling — messy input into something structured | **Here** — this workspace | free | yes |
| Pre-IoI screening math — is this candidate worth an IoI? | **Here** — this workspace | free | ⚠️ partly — see below |
| Target sourcing and screening | **Here** — this workspace | free | ⚠️ partly — see below |
| DEFINITIVE — gates, model slots, DealState | **The app** | free | yes |
| Valuation and deal modelling | **The app** | free | yes |
| The data room and financial documents | **The app** | free | yes |
| The IoI promotion — a candidate becomes a deal | **Either** — identical either side | free | ⚠️ partly — see below |
| Deal pipeline — stage, owner, next action | **The app** | free | yes |
| Deal memo · diligence plan · term framework | **The app** | a drip | ⚠️ partly — see below |
| Client register and pipeline | **The app** | free | yes |
| Outreach queue and sends | **The app** | free | yes |
| Lawyers, CPAs, lenders, sellers' advisors | **The app** | free | yes |
| LinkedIn carousels, one-pagers, reports | **Here** — this workspace | free | yes |
| The public site and published research | **The app** | free | yes |
| LinkedIn analytics import | **The app** | free | yes |
| The Saturday research sweep | **Here** — this workspace | **can spend dollars** | yes |
| The citation audit | **Either** — identical either side | free | yes |

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

MARKET-shaped: derived from the master, written before any counterparty exists. THE_IOI_SEAM.md returns these to the studio with research and verification, which is where the master and the citation audit already live.

> ⚠️ **Not fully there yet.** The app CAN generate three of these (corpDevDocs.ts: market map, who's who, thesis) but not the target map — and under the IoI seam that no longer matters much, because all four are studio work now. Noted so nobody re-discovers the missing generator and reads it as a bug.

- App → Studio → the market. corpDevDocs.ts generates all three.
- LIVE since 2026-08-14: STUDIO_IN_APP is true and the studio lane is on.
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

### Pre-IoI screening math — is this candidate worth an IoI?

**Here — this workspace** · free, calls no model

MARKET-shaped. Screening thirty candidates off a register must not require thirty deal records in the app — it requires the same formulas the app would use, run over a list.

> ⚠️ **Not fully there yet.** The engine is NOT vendored yet. Today this reads $REPO directly, which is always-current but carries NO provenance stamp — an output cannot say which engine version produced it, and it breaks if the clone is missing or stale. THE_IOI_SEAM.md requires a vendored copy at a pinned commit with ENGINE_PROVENANCE.md. Open item.

- npx tsx $REPO/scripts/studio/deal.mts run <spec.deal.mts>   # same engine as the app
- Output is a DELIVERABLE — a document or workbook you can hand someone —
- never a live modelling surface. Live scenario work is in-app, full stop.
- At the IoI the candidate is PROMOTED and its runs move with it: see ioi-promotion.

### Target sourcing and screening

**Here — this workspace** · free, calls no model

PRE-IoI, therefore market-shaped (Paul, 2026-08-15: "there will be no sourcing in the app the app is internal now IoI to integration"). Finding candidates is one-to-many and speculative with no counterparty — the definition the seam splits on. The app begins at the IoI, when a named target becomes a deal.

> ⚠️ **Not fully there yet.** THE APP'S ENGINE IS RETIRED, NOT PORTED, and the difference matters because the app version had TWO CITATION-LAW DEFECTS: deepAnalysisPrompt.ts estimated revenue by asking a model to guess from Google review counts ("<10 reviews typically = <$500K rev"), and NOTHING in it decided whether a business was independent, so a franchise location could rank as a target — the expensive error, because it sends a client into diligence on a business a sponsor already owns. house/screen.ts is the CORRECTED reimplementation: affiliation is a register lookup, revenue is a band with its arithmetic attached, and neither guess can happen. sourcingPipelineService.ts and the Sourcing screen remain in the tree unrouted rather than deleted (the standing "do not delete anything yet" rule); nothing reaches them, and the `sourcing` lane is off.

- npx tsx $REPO/scripts/studio/screen.mts init   — buy-box, queries x geographies
- npx tsx $REPO/scripts/studio/screen.mts pull   — Places, cost printed before it spends
- npx tsx $REPO/scripts/studio/screen.mts rank   — free and offline
- The board is markets/<m>/screen/candidates.csv, managed in Google Sheets.
- A promoted candidate enters the app as a deal — that is the IoI.

## The deal — from a live target to close

### DEFINITIVE — gates, model slots, DealState

**The app** · free, calls no model

App-only and not portable: 169 gate/slot references, 132 MODEL.* definitions, 385 conformance cases. A stateful substrate, not a document.

- App → the deal. Gates advance as the deal advances.
- Calls no model — verified, no API key reference in v19ModelRuntime.ts.
- There is no local equivalent and building one is not a project, it is a year.

### Valuation and deal modelling

**The app** · free, calls no model

DEAL-shaped, and post-IoI. Paul: "in-app scenario modeling is going to be much more advantageous than a Google Sheet — plus that is where the data room and financial docs will be housed." A what-if wants a slider, and it wants to sit beside the documents it is priced from.

- App → the canvas, beside the data room and the financial documents.
- FROM THE IoI ONWARD. Before that it is screening math — see pre-ioi-math.
- Both surfaces run house/deal.ts and npm run test:deal fails if they disagree,
- so a pre-IoI figure and its post-promotion re-run are comparable by construction.

### The data room and financial documents

**The app** · free, calls no model

DEAL-shaped and counterparty-confidential by definition. It is also the reason the modelling is app-side: the figures are priced from these documents, and separating the two is what made the old split painful.

- App → the deal → data room. Files, share links, and the audit trail.
- Third parties receive documents by token link and never get an account.
- Nothing here crosses back into the studio repo after promotion.

### The IoI promotion — a candidate becomes a deal

**Either — identical either side** · free, calls no model

THE SEAM ITSELF. A defined event with a packet and a receipt on both sides — not a migration, and not a gradual drift of files across the boundary.

> ⚠️ **Not fully there yet.** NOT BUILT. There is no deal.json packet, no master@commit pointer on a deal, no receipt either side, and no read-only flip of the staging folder. The largest unbuilt piece of the seam.

- MOVES: the deal profile (deal.json, every figure carrying a source; add-backs
-   only when verified with evidence), documents so far, the screen record, and
-   the pre-IoI model runs (engine-stamped, so the app can verify continuity).
- LINKS but does not move: the market master. The app records master@commit,
-   so the deal knows what market context priced it. The master stays put.
- NEVER crosses back: nothing counterparty-confidential enters the studio repo.
- STUDIO/deals/<d>/ then goes read-only — stop writing, keep reading, drop nothing.

### Deal pipeline — stage, owner, next action

**The app** · free, calls no model

"What stage is this at" is a question, and a question needs rows and SQL. A folder cannot answer it.

- App → Deals. Forms and SQL; nothing metered.

### Deal memo · diligence plan · term framework

**The app** · a drip — cents

Moved to the app 2026-08-14 (Paul). These sit inside the deal sitting — written from the model, the gates and the diligence state, all of which are app rows. Exporting to write them elsewhere was the back-and-forth.

> ⚠️ **Not fully there yet.** NOT IMPLEMENTED ANYWHERE IN THE APP YET. The nearest deliverables are buy_deal_screening_memo (pre-LOI screening, not the §5b memo) and an LOI draft (which §5d deliberately is NOT — drafting is counsel's). Write all three HERE to PLAYBOOK §5 until the app has them.

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

**Here — this workspace** · free, calls no model

MARKET-shaped: one-to-many and speculative, with no counterparty. THE_IOI_SEAM.md returns it to the studio — it was briefly app-owned on 2026-08-14 under a different axis (input vs output), and the audience axis is the one that holds.

- Read FORMATS.md (containers) and DESIGN.md (the look) first, every time.
- npx tsx $REPO/scripts/studio/build-deck.mts <spec.deck.mts>
- npx tsx $REPO/scripts/studio/build-onepager.mts <spec.post.mts>
- npx tsx $REPO/scripts/studio/build-report.mts <report.md>
- Rendered by the engine on the Mac. Client-direct work files to decks/, never collateral/.

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

- Is it MARKET-shaped — one-to-many, speculative, no counterparty? → the studio.
- Is it DEAL-shaped — one-to-one and counterparty-confidential? → the app.
- Is it before the IoI or after it? Before is the studio, after is the app.
- CRM is the exception and runs app-side from the first touch.
- Still unclear? Ask Paul and add a row here. Do not decide it twice.

`where.json` beside this file is the same data, machine-readable.
