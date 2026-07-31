# WHERE THE WORK HAPPENS — Cowork vs the app
Last updated: 2026-07-31

> The decision doc for one question: when a piece of work lands, does it go in a
> Cowork session against `~/Documents/smbx-studio`, or into the app?
>
> **Settled by Paul, 2026-07-31:** *"i think i want all Studio work to be on
> disc Cowork — ill do CRM and Deal management in the app."*
>
> **Studio → disk. CRM and deals → the app.** `CLAUDE.md` rule 0 has been
> rewritten to match (it previously read "marketing only… do not build new
> internal app features," which was right about the cost problem and wrong about
> the scope). Studio is retired from the app's navigation but not deleted — one
> constant, `STUDIO_IN_APP` in `client/src/components/v6/appSurfaces.ts`.

---

## 1. The rule

**Documents are files. Pipelines are rows.**

Not app-vs-Cowork by task type, and not by cost. By the shape of the thing
being produced:

| The work produces | Where | Why |
|---|---|---|
| A **document** — written once, versioned, read later | **Cowork**, against the workspace | Files are the right container; the builders are local and take no API key |
| A **record** — state that changes and gets queried | **The app** (Postgres) | A folder cannot answer "who do I owe a touch to this week" |
| **Deterministic compute** — model math, renderers, audits, screening | Either; free on both sides | No API key involved anywhere in it |

The cost question is real but narrow, and it is answered in §4. It is not the
dividing line, because the two most expensive things in the app were also the
two most document-shaped.

## 2. The register — one home per kind of thing

Nothing appears in two rows. Where something has two homes today, that is
named as a defect.

| Thing | Home | State |
|---|---|---|
| Market research, sources, masters | Files — `markets/<m>/{research,master.md,versions}` | Working |
| Investment theses (one per buyer profile) | Files — `documents/thesis-<profile>.md`, staleness gated by `thesis.mts check` | Working |
| Corp-dev documents (market map · who's who · target map) | Files, derived from the master per `PLAYBOOK.md` | Working |
| Collateral (carousels, one-pagers, reports) | Files — `collateral/`, built by `scripts/studio/build-*.mts` | Working |
| Target screen (companies to acquire) | `screen/candidates.csv` → app sourcing when a deal forms | Working |
| **Buyer/client register (the acquirers we serve)** | **App** | **Missing — §5** |
| **Contacts and touches** | **App** | **Missing — §5** |
| Deals and deal state | App — `deals` + ~62 related tables | Exists; archive shipped 2026-07-31 |
| Deal analysis and model math | App — `v19ModelRuntime`, canvas models (free) or Cowork for the memo | Working |
| Published research pages + PDFs | Repo — `scripts/studio/reports/*.md`, one markdown per report | Working |
| Inbound leads from the site | App — `practice_leads` | Working |

### Known double home
The market master lives BOTH in `research_lanes.master_md` (Postgres) and as
`markets/<m>/master.md` on disk. Under this doc the **file wins**; the app's
copy is legacy. Do not re-adopt the app as the master's home, and do not build
new features that write to `research_lanes`.

### Studio, retired in place (2026-07-31)

`STUDIO_IN_APP = false` in `client/src/components/v6/appSurfaces.ts` takes Studio
out of the desktop header tab strip and the mobile More → Modules list. Nothing
else changes: every screen, service, route and migration stays where it is and
still compiles, `/api/research` and `/api/studio` remain mounted, direct URLs and
existing exports still work. Flip the constant to `true` and Studio returns
intact — no restoration work.

It is a build-time constant, not an env var, deliberately: this is a product
decision with a written rationale, and an env var would let two environments
disagree about what the app is for.

**The one real gap.** `server/services/linkedinAnalytics.ts` — the
dependency-free XLSX reader that parses LinkedIn's aggregate export mechanically
(zip central directory → worksheet XML → sharedStrings, zero hallucination, every
stored number verbatim) plus Yulia's read of it — has **no local equivalent**.
Everything else Studio did has one: `build-deck`/`build-onepager`/`build-report`/
`build-og-card` for collateral, `audit.mts` for citations, `thesis.mts` for the
thesis register, `PLAYBOOK.md` for the document specs. Analytics does not. Until
a local CLI exists, an analytics import is the one legitimate reason to open the
app's Studio, and the mechanical parse is the part worth porting — the read is a
Cowork session's job anyway.

### The email-campaign seam already exists

Worth knowing before building sequences: `scripts/studio/export-leads.mts` (PR
#183, 2026-07-29) already pulls the MAILABLE list — consented, never opted out,
deduplicated — and migration 109 stores `consent_text` **verbatim**, so an old
row still says what *that person* agreed to.

**That list and the CRM register are different legal objects and must not be
merged.** The consented list is inbound: people who downloaded a report or used
the intake and were shown a notice. The 77-firm register is **cold outbound to
businesses** — a different posture with different obligations. A sequence that
pooled them would break a promise those readers were given at capture, and the
download card previously promised "no list, no sequence." Campaign work should
read `crm_contacts` for outbound and leave `export-leads.mts` owning the
consented list.

## 3. What runs in the app

Everything on this list is either free or a drip. None of it can exhaust a
spend ceiling in one unattended click.

**Free — no API call at all:**
- `v19ModelRuntime.ts` + `definitiveDealMechanicsCatalog.ts` — the DEFINITIVE
  gates and model slots. Verified: no API key reference in either file.
- `client/src/lib/calculations/core.ts` — the 11 interactive canvas models.
- `premiumPdfRenderer.ts` and every composer render path — local Chromium.
- All CRM and deal reads/writes. Forms and SQL.
- Sourcing/Places screening — a different key (`GOOGLE_PLACES_API_KEY`), free
  under 5k Place Details a month.

**Cheap — Haiku, per-item:** `fieldExtractor`, `dealFactsExtractor`,
`gateSummaryService`, `websiteEnrichmentService`, `sourcingPipelineService`,
`sevenFactorScoring`, `conversationNamer`, `yuliaBriefingService`,
`practiceIntake`, `reportQA`, `postcardFiller`.

**A drip — Sonnet, per turn:** Yulia chat (`aiService.ts`, `max_tokens: 4096`
per turn, 35 tools). This is the main working surface for deal work and it is
not what broke anything.

**Rare and expensive:** `cimGenerator` (Opus) and the Opus-routed deliverables.
Sell-side shaped; largely out of scope for a buy-side practice.

## 4. What stays in Cowork, and the actual reason

Two things in the app could spend real money. Both are document-shaped, so they
belong in Cowork on the doctrine above, and the cost is a second reason rather
than the only one.

1. **`researchAgent.ts` — web research runs.** At `deep`: 40 searches, 25 page
   fetches at 20k content tokens each, resumed across up to 12 `pause_turn`
   rounds. Its own pricing note puts searches at **$10 per 1,000** on top of
   tokens, and every fetched page re-enters the context on each resume round.
   This is the only path that can spend dollars per click, and the only one
   that **runs unattended on a schedule**.
2. **`researchLanes.ts` — master synthesis.** Every source's full text in one
   call, plus a complete retry when the citation audit fails.

Studio is NOT on this list. `deckDesigner` is one Sonnet call per deck, cached
on the run by an input hash so previews don't re-bill; `artworkService` is
Gemini on a separate key and defaults off; the renderers are free. Studio stays
local because the builders are already local and iterate in ~30 seconds — not
because of spend.

**Two operational settings that follow from this:**
- Set `RESEARCH_SCHEDULES_DISABLED=true`. The scheduler is the only thing that
  can spend without a person present, and `RESEARCH_MONTHLY_CAP_CENTS` is unset
  by default, so there is currently no gate behind it.
- Give the two lead-facing surfaces (`practiceIntake`, `reportQA`) their own
  key. The 2026-07-27 outage took down chat, extraction AND the public funnel
  at once because all of it shares one `ANTHROPIC_API_KEY`. The blast radius is
  the defect; the spend was only the trigger.

## 5. The CRM gap — what the app does not have

The app has a **deal** pipeline. It has no **client** pipeline. Those are
different objects: a deal is a target being underwritten; a client is an
acquirer paying a retainer. The buy-side register (77 firms across independent
sponsors, family offices, permanent capital, holdcos, PE funds, platforms and
strategics) is the second kind, and nothing in the schema holds it.

### What already exists and should be reused, not rebuilt

| Need | Existing | Fit |
|---|---|---|
| Referral network (the warm-intro engine) | `service_providers` + `service_referrals` — typed people with `practice_areas`, `industries`, `deal_size_min/max`, and a `sent → viewed → engaged → completed` ladder | Strong. This is already the week-3 outbound engine |
| Inbound leads | `practice_leads` (persona, thesis, size_geo, email, source) | Capture only — 6 columns, no owner, status or next step |
| Deal-scoped history | `deal_activity_log`, `deal_messages`, `deal_offers`, `deal_buyers`, `deal_participants` | Good, but scoped to a deal |
| Threads and alerts | `direct_threads`, `direct_messages`, `notifications`, Resend `sendEmail` | Usable bones for comms |
| Scheduled nudges | `follow_up_queue` + `follow_up_rules` | Real scheduler, but its templates are keyed to product-era journeys/gates |
| Target companies | `sourcing_candidates`, `sourcing_portfolios`, `buyer_theses`, `thesis_matches`, `discovery_targets` | The buy-side target machinery, distinct from clients |

### What is genuinely missing

1. **Accounts (firms).** No table. `company_profiles` and `firm_memory` are the
   only firm-shaped tables and `company_profiles` carries a `deal_id` — it
   describes a target inside a deal, not a standing relationship. The register's
   own 16 columns are already the schema: `firm, segment, website, hq_city,
   hq_state, trades, dfw, grade, buyer_moment, product_fit, key_person,
   key_person_title, sponsor, evidence, source_url, notes`.
2. **Contacts (people).** No contacts table anywhere. `key_person` /
   `key_person_title` have nowhere to live, and a firm has several over time.
3. **A touch log against a firm.** Every history table in the schema hangs off
   `deal_id`. Before an engagement exists there is no deal, which is exactly
   the period a client pipeline covers.
4. **Next action, owner, due date.** The one field that makes a pipeline a
   pipeline rather than a list.
5. **Client-engagement stage.** Distinct from `deals.current_gate`: prospect →
   conversation → proposal → engaged → mandate live. A deal gate describes a
   target; this describes a relationship.
6. **Evidence and provenance per record.** The register carries `evidence` +
   `source_url` per row, which is the same citation discipline the research
   masters run on. Nothing in the CRM-adjacent schema has a place for it.
7. **The engaged-lane register.** `ENGAGED_LANES` is read from
   `process.env` in `practiceIntake.ts` — a comma-separated deploy variable.
   "One buyer per target" is a THE LINE commitment (§12) and it is currently
   enforced by an environment string that no one can query, audit or date. For
   a practice taking real mandates this has to become a table with the client,
   the lane and the dates on it.

### The column decision

All 16 register columns are imported. Nothing is dropped, because the groups
that don't rank are the ones that make a ranking usable:

| Group | Columns | Role |
|---|---|---|
| **Ranks** | `buyer_moment` · `dfw` · `trades` · `key_person`(+`_title`) · `segment` | The five scales |
| **Routes** | `product_fit` · `sponsor` | Which service to pitch; who owns them |
| **Proves** | `grade` · `evidence` · `source_url` | Provenance, stored verbatim |
| **Identifies** | `firm` · `website` · `hq_city` · `hq_state` · `notes` | Who and where |

Two are added: `last_deal_on` (see the limit below) and `disqualified`, which a
human sets. Import ignores any other column and **reports which**, so a rename
in the Sheet surfaces instead of going quietly missing.

`notes` is never dropped — it carries the sharpest judgement in the file
("MOST EXPLICITLY DFW-ACTIVE SPONSOR IN THE SCAN", "WEAKEST ENTRY").

### The scoring model

`house/leads.ts`, pure and dependency-free, so the app and
`scripts/studio/leads.mts` rank identically. **need 35 · lane 25 · reach 15 ·
structure 10 · activity 15**, then a confidence multiplier from `grade`.

- **`buyer_moment` is the buy signal**, and the register's own notes say so: MRE
  Capital is "BEST-FIT NAME ON THE LIST" because "add-on cadence not yet
  established, which is exactly the flow gap"; FSP is "a genuine
  flow-constrained buyer, which is the fit signal". So `thesis_no_flow` carries
  the largest weight and **`has_both` is the hardest sale, not the best lead** —
  a buyer with thesis and flow already has the function in-house.
- **Evidence quality gates, it does not weight.** `grade` applies a visible
  discount (directory-only ×0.80) rather than floating a thinly-evidenced firm
  up the list. Scored as a bonus it would do the reverse — the same mistake
  `screen.ts` made in its first cut.
- **Disqualification is a human act.** The register marks APi Group "Not a
  client; competitive context" in prose; the model does not read prose for
  intent, it reads the `disqualified` column.

**The known limit:** the model ranks FIT, not whether a buyer is real. No
register column recorded whether a firm has ever closed a deal, so a
well-written site with zero acquisitions scores like an active buyer — Homestead
Service Partners is the live example. `last_deal_on` closes it as it gets
verified; while absent, every row takes the same neutral-low activity figure, so
a missing column shifts no row relative to another and the detail string says
so outright.

### Build order

Each step is independently useful and none of it calls an API.

1. ~~**`crm_accounts` + `crm_contacts` + `crm_activity`** with CSV import for the
   existing register and CSV export so Google Sheets still works.~~ **Shipped
   2026-07-31** — migration 113, `server/routes/crm.ts`, `house/leads.ts`
   (61 tests, `npm run test:leads`). Import upserts by `(user_id, lower(firm))`
   and **never touches the pipeline fields a human set in the app**: the Sheet
   owns the research, the app owns the pipeline.
2. ~~**Next action + owner + stage**~~ — shipped with step 1: `stage`
   (prospect → conversation → proposal → engaged → mandate_live → passed),
   `owner_email`, `next_action`, `next_action_on`, plus `?due=1` on the board.
   A stage move writes itself to `crm_activity`.
3. **A UI for it.** The API and the ranking exist; nothing renders them yet.
4. **Email campaigns.** Sequences against `crm_contacts`, drafted and logged as
   `crm_activity` with `kind='email'`. THE LINE: the practitioner sends; the app
   drafts, records, and never contacts a counterparty on its own.
5. **`engaged_lanes` as a table**, with `practiceIntake` reading it instead of
   `process.env`, falling back to the env var so nothing breaks mid-deploy.
6. **Wire `service_providers` in as the referral source** on an account, so a
   warm intro is a record and not a memory.

## 6. Deals: archive, not delete (shipped 2026-07-31)

A real `DELETE FROM deals` cannot run. 62 foreign keys reference `deals(id)`:
37 cascade, 14 set null, and **11 have no `ON DELETE` clause**, so Postgres
RESTRICTs the delete. The blockers span `conversations`, `deliverables`,
`gate_progress`, `theses`, `wallet_transactions`, `support_issues`, `referrals`,
`service_referrals`, `anonymous_sessions` and `company_profiles` — and
`conversations`, `deliverables` and `gate_progress` will hold rows for any deal
that has been opened, so the delete fails on the first attempt.

So the working set is managed by archiving:
- Migration 112 adds `deals.archived` (the house pattern from
  `research_runs.archived` / `research_schedules.archived`), deliberately NOT
  reusing `status` (deal lifecycle) or `disposition` (whether Yulia reads it in
  the background) — archived is a third, orthogonal question.
- `GET /api/deals` filters to the working set by default; `?archived=1` returns
  the archive instead. Every existing caller gains the filter silently.
- `PATCH /api/deals` takes `{ids, archived}` for bulk select-all, scoped by
  `user_id`, capped at 1000 ids.
- Desktop Deals gains a Board/Table toggle; the table is the bulk surface
  (row checkboxes, a header box that takes the whole filtered set, and a bulk
  bar that reads Archive in the working set and Restore in the archive).

There is deliberately no "delete all deals" button. Archiving is reversible;
deletion of a real deal's conversations and deliverables is not.

## 7. Doctrine status

`CLAUDE.md` rule 0 and its "THE WORK IS LOCAL" section were rewritten on
2026-07-31 to match this doc: **THE SPLIT** — documents are files, pipelines are
rows; all Studio work is local; CRM and deal management are the app's job and
building there is expected; research and synthesis stay local because they are
the only paths that can spend real money.

The Studio section further down `CLAUDE.md` is a **record of what was built, not
a roadmap**. That includes the surfaces added in the last week of July —
`MarketWorkspace`, `CollateralBuilder`, `studioRepos`, `researchLanes`,
`corpDevDocs`, `marketKnowledgeTools`. They work; they are simply not where the
work happens, and `PLAYBOOK.md` is canonical over `corpDevDocs.ts`.

## 8. What the app is FOR (Paul, 2026-07-31)

> *"It's just for me to run corp dev through. I need it to be a CRM tool and then
> a deal management tool. I will need to communicate with lawyers, attorneys,
> etcetera, and third-party folks, but it will not be outsourced and used by
> other firms."*

Two jobs, in that order: **CRM, then deal management.** Plus a communication
layer that reaches outward without ever letting anyone in.

**Never multi-tenant** — no orgs, no workspaces, no tenant column, no seats.
Multi-USER yes (a partner may join; `TEAM_ALLOWLIST` is the mechanism), multi-
TENANT never. Enforced in code: practice mode defaults ON, the perimeter 403s
non-team JWTs, Stripe and anonymous chat 410, `/mcp` and agent discovery 410.

**The communication layer is with professionals, not a marketing list.** That is
a different build from the campaign work in §5 and it changes the shape:

| Who | How they receive | Never |
|---|---|---|
| Acquirer prospects (the register) | Cold outbound to `crm_contacts`, logged as `crm_activity` | Pooled with the consented inbound list |
| Report readers / intake leads | The consented list, via `export-leads.mts` | Cold-mailed |
| Lawyers, CPAs, appraisers, lenders, sellers' advisors | **Email out + token share links** — `emailService.sendEmail`, `documentShareService`, `document_shares`, `transaction_tokens` | Given an account |

`service_providers` + `service_referrals` (migration 021) is the typed register
for the professionals — attorney/CPA/appraiser with `practice_areas`,
`industries`, `deal_size_min/max` and a `sent → viewed → engaged → completed`
ladder. It already exists and should be extended, not duplicated.

**Do not build counterparty comms on `direct_threads`/`direct_messages`**
(migration 085). That is a product-era social DM feature presuming both sides
have accounts — the exact shape this rule forbids. Token links are why the
practice perimeter deliberately lets tokenless requests fall through to each
route's own auth: an outsider can receive a document without ever becoming a
user.

THE LINE governs the content regardless of the channel: Yulia drafts, records and
sends on the practitioner's instruction. She never initiates or negotiates with a
counterparty on her own, and never quotes or collects a fee.

### Next

1. ~~**A UI for the CRM.**~~ Shipped — `Clients` tab, desktop + mobile.
2. **Deal management, second job.** The pipeline exists and is now clean of test
   rows; what it lacks is the same next-action/owner discipline the CRM just got.
3. **Communications.** Two separate builds, per the table above: cold outbound
   against `crm_contacts`, and professional correspondence on the token-link +
   email path. Both log to `crm_activity` / `deal_activity_log`; neither creates
   an account for anyone outside the team.
4. **A local LinkedIn-analytics CLI**, to close the one Studio capability with no
   equivalent on disk.
5. **`engaged_lanes` as a table** — "one buyer per target" is a THE LINE
   commitment currently enforced by `process.env.ENGAGED_LANES`, which nothing
   can query, audit or date.
