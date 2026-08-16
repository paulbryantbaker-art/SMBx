# THE FRONT-END REBUILD — two functions, one spine

**Status:** PLAN. Nothing below is built.
**Date:** 2026-08-16
**Scope:** the internal app's FRONT END only. The server, the schema,
DEFINITIVE and THE LINE are untouched.

> Paul, 2026-08-16: *"what if kept Definitive as the spec and the Line as it
> currently is.. but scrapped the internal build and just completely rebuilt
> it? … we need 2 main functions 1, CRM like salesforce, 2, Dealflow (where
> definitive lives)."* Then, confirming: *"in this case I do mean the front
> end… that is what I meant by keeping Definitive."*

---

## 0. The one-sentence version

**The server is the asset and the client is the liability.** Rebuild the
client around two functions, delete the four modules that are already dark or
dead, and let DEFINITIVE — which today is an engine hidden behind a chat — become
the thing you actually look at.

---

## 1. What is actually here, measured

| | lines |
|---|---|
| **Server** | 97,486 |
| — DEFINITIVE substrate (v19ModelRuntime · dealMechanicsCatalog · modelRegistry · deterministicAnalysisEngine · tax/legal prompts · v19 constants) | 8,905 |
| — `house/` (pure; the app and a Cowork session compute identically) | 8,022 |
| — routes | 15,410 |
| **Client** | 60,041 |
| — `v6/desktop` | 24,209 |
| — `v6/atlasmobile` (a SECOND, parallel app) | 12,386 |
| — `practice/` (the public site — **not** the internal app) | 12,036 |
| — `hooks/` (the data layer) | 4,173 |
| — `components/models` (11 canvas models) | 2,636 |
| — `lib/` | 2,298 |
| **Schema** | 132 migrations · **154 tables** |

**The internal app's front end is ~47,000 lines.** The practice site is not
part of it and does not move.

### The 154 tables, bucketed

| bucket | n | fate |
|---|---|---|
| CRM + outreach (`crm_*`, `service_providers`, `service_referrals`, `practice_leads`) | 11 | **Function 1** |
| Deal + DEFINITIVE (`deals`, `deal_*`, `gate_*`, `model_*`, `analysis_*`, `pmi_*`) | 24 | **Function 2** |
| Studio / research / collateral (`studio_*`, `research_*`, `market_*`, `post_queue`) | 19 | dark — no UI |
| Sourcing (`sourcing_*`, `franchise_brands`) | 5 | dark — no UI |
| Product-era dead (`wallets`, `wallet_transactions`, `subscriptions`, `platform_fee_schedule`, `direct_threads`, `direct_messages`) | 6 | drop |
| Auth, data room, deliverables, exports, misc | ~89 | keep, mostly untouched |

**Nothing is dropped from the database in this plan except the six product-era
tables.** Dark tables keep their data and their routes; they simply stop having
a screen. That is the standing rule since 2026-07-27 (*"let's don't delete
anything yet"*) and it has been right three times.

---

## 2. Why not rebuild the server

Because the server is the moat and the client is the mess.

- **154 tables and 132 migrations** encode years of domain shape.
- **DEFINITIVE** is 30 gates and 134 model slots with **385 conformance cases**
  passing. Rebuilding means re-deriving M101–M234 and landing somewhere worse.
- **`house/`** is already the right architecture — pure, no db, no key, no
  clock — so the app and a Cowork session compute identical answers. 991 test
  cases across 13 files depend on it.

None of the pain Paul has reported this week came from the server. All of it
came from the client: a shell named after a codename, seven dead design systems
in committed CSS, and a home screen that was a text box.

---

## 3. The two functions

### THEY SHARE A SPINE, AND THAT IS THE WHOLE IDEA

Salesforce's failure mode is that every object gets its own tab and the user
reassembles the story. This practice has exactly one story:

```
a CLIENT engages  →  a MANDATE  →  TARGETS  →  DEALS  →  DEFINITIVE gates  →  close  →  integration
└──────── Function 1: CRM ────────┘         └──────────── Function 2: Dealflow ────────────┘
                          the mandate is the seam
```

So: two tabs, **one object graph**. A deal always knows whose it is; a client
always shows what is running for them. `deals.crm_account_id` (migration 114)
already carries that edge — the front end has simply never made it the spine.

### Function 1 · CRM

The acquirer clients — the firms the practice serves. Not targets.

| | |
|---|---|
| Tables | `crm_accounts` · `crm_contacts` · `crm_activity` · `crm_waves` · `crm_sequence_steps` · `crm_templates` · `crm_touches` · `crm_events` |
| Hooks that survive | `useCrmAccounts` (253) · `useOutreach` (147) |
| Screens | Accounts (list/detail) · Contacts · Outreach queue |

**THE LINE, structural and already correct: one touch, one press, one human.**
There is no batch-send endpoint and the rebuild must not add one. The outreach
worker may *assemble* a batch; it may never *release* one.

### Function 2 · Dealflow — where DEFINITIVE lives

| | |
|---|---|
| Tables | `deals` + the 23 deal/gate/model/analysis/pmi tables |
| Hooks that survive | `useMobileDeals` (483, rename) · `useDealTasks` · `useDealOffers` · `useDealBuyers` · `useIntegrationPlan` · `useNextActions` · `usePipelineProgress` |
| Screens | Pipeline (the board) · **Deal** (the gate stack — see §4) · Data room · Integration |

Files and Integration stop being top-level tabs. A data room belongs to a deal;
an integration plan belongs to a closed deal. Both are *inside* Function 2.

---

## 4. THE IDEA WORTH BUILDING: DEFINITIVE is the deal screen

Today DEFINITIVE is an engine Yulia calls. You cannot look at it.

But **30 gates × 134 model slots, each either executable, professional-handoff,
research-only, or reserved**, is a field of options where every one carries
either a number or a reason there isn't one. That is *precisely* the grammar
the kit was built for — and the 2026-08-15 pass applied it to deal LISTS when
the far higher-value target was the deal INTERIOR.

**The deal page IS its gate stack:**

- **Gates as the comparison strip.** Which of the 30 apply to this deal type,
  each carrying its cleared/total. A gate that does not apply says so.
- **Model slots as rows.** M188 · *RE/operating purchase-price bifurcation* ·
  its output, or `Not available — needs the appraisal`, or `Refer — licensed
  appraiser`, or `Research only`. `house/valuation.ts` already routes methods by
  deal type; this is the same routing at slot granularity.
- **The endorsement band on the binding gate**, with grounds: *"G12 is what is
  holding this — QoE unstarted, and B3 cannot clear without it."*
- **The honest footer states which gates were skipped and why.**

Nobody else can render that page, because nobody else has the catalog. It is
the single most differentiated screen the practice could own, and it currently
does not exist in any form.

**Corollary for `house/valuation.ts`:** `MethodVerdict` needs a `slots` field so
a valuation verdict names the DEFINITIVE slots behind it, instead of dead-ending
at "coordinate an appraiser." That gap was flagged on 2026-08-15 and is still
open.

---

## 5. THE LINE as visible architecture

Today THE LINE is enforced in prompts and middleware: you discover it by being
refused. In the rebuild it is an **affordance** — the perimeter is drawn, not
discovered.

Every counterparty-facing action renders as a three-step object:

```
   DRAFT              REVIEW              SEND
   Yulia writes it    you read it         your press, your name
   ───────────────────────────────────────────────────────────
   automated          automated           NEVER automated
```

The send control is visibly the practitioner's — a different shape from every
other button in the app. Not a modal that appears to warn you; a permanent
statement of who does what. The outreach machine already works this way
mechanically (`sent_at` stamps only on a true return); this makes the mechanism
legible.

Same treatment for the unlicensed-opinion perimeter: a slot that requires a
licensed specialist renders as **Refer**, naming the specialist, rather than
producing a number with a disclaimer under it.

---

## 6. What is deleted

| what | lines | why |
|---|---|---|
| `v6/desktop/screens/Studio*` · `MarketWorkspace` · `CollateralBuilder` · `atlasmobile/StudioResearchM` | 6,558 | Collateral is market-shaped → the studio. Dark since 2026-07-31. |
| Studio/research services (`researchComposer` · `deckDesigner` · `collateralComposer` · `studioAssets` · `studioRepos` · `corpDevDocs` · `artworkService` · `sectorArt` · `linkedinAnalytics`) | 4,864 | Same. `corpDevDocs` is additionally a stale duplicate of `PLAYBOOK.md`. |
| `Sourcing.tsx` · `sourcingPipelineService` · `sevenFactorScoring` · `deepAnalysisPrompt` | 2,534 | The app begins at the IoI. `house/screen.ts` is the corrected reimplementation. |
| The six product-era tables + any residue | — | Never multi-tenant; nothing charges money. |
| The old view of each converted screen (Board/Table toggles) | ~4,000 | Kept on 2026-08-15 only so the two could be compared. Once the rebuild is the app, a second way to read the same rows is drift. **Bulk archive must move first** — it lives in the old Deals table. |

**Roughly 18,000 lines deleted before a line is written.** `house/retired.ts`
already carries most of these with a mechanical proof per entry; the sweep
follows its own rule (ORPHANED safe on sight · DARK reachable by URL, read the
note · SUPERSEDED most urgent and least obvious).

---

## 7. What is kept

- **Everything server-side that is live.** No route rewrites, no migrations
  beyond dropping the six dead tables.
- **`house/`** — 8,022 lines, unchanged. It is the reason a Cowork session and
  the app agree.
- **The hooks**, ~2,500 of the 4,173. They are the API contract, not UI. Some
  get renamed (`useMobileDeals` is not mobile-specific and never was).
- **The kit** (`v6/desktop/kit`) — 11 primitives, already Carta, already
  carrying the population rule the 2026-08-15 review pass forced in.
- **The 11 canvas models** (2,636). They are pure calculation UI over
  `house/deal.ts` and they work.
- **`ChatDock`**, one composer, one implementation.

---

## 8. Build order

**Phase A — the sweep.** Delete §6. Nothing new is written. The app gets
smaller and still works; every deletion is provable against `house/retired.ts`.
Bulk archive moves out of the old Deals table first.

**Phase B — the shell.** Two tabs, one spine. Header, nav, the Yulia rail
(already right-side and collapsible). `AtlasApp` → `AppShell`; identifiers stop
saying Atlas everywhere, not only in the wordmark.

**Phase C — Function 1.** CRM on the kit. Accounts · Contacts · Outreach. Fix
the two live bugs found on 2026-08-15 while in there: `contact_count` returned
as a string so `"0"` is truthy and the no-contact flag has never fired; and
`buyer_moment`, 35 of ~100 scorer points, with no writer anywhere in the app.

**Phase D — Function 2.** Pipeline, then **the deal page as the gate stack**
(§4) — the centrepiece, and the phase worth the most time. Data room and
Integration fold in underneath.

**Phase E — responsive, or the second shell.** See §9.

A and B are independent of C and D. C and D are independent of each other.

---

## 9. THE ONE OPEN DECISION: mobile

`v6/atlasmobile` is **12,386 lines — a second, parallel application** with its
own tokens, its own screens, its own navigation. It is a quarter of the
front-end weight and every feature must be built twice.

**Recommendation: one responsive shell, not two apps.** The kit's primitives
are already flexbox/grid and collapse cleanly; `ListDetail` becomes a stack, the
`CompareStrip` scrolls, the rail becomes a sheet. That deletes 12,386 lines and
halves the cost of every future screen.

**This is reversible and it is Paul's call**, because it turns on something
only he knows: whether the phone is for *checking* (responsive is plainly
right) or for *working* — assembling an outreach queue between meetings, which
`OutreachM` was built for and which a responsive desktop layout serves badly.

If the answer is "working," the second shell stays and Phase E is real work. If
it is "checking," Phase E is a deletion.

---

## 10. What this does not change

- **Never multi-tenant.** No orgs, no tenants, no seats. Multi-USER (owner
  columns, `user_id` scoping) stays; multi-TENANT is forbidden by law.
- **Third parties are corresponded with, never onboarded** — email out plus
  token share links. Not `direct_threads`, which presumes both sides have
  accounts and is on the delete list for exactly that reason.
- **Zero hallucination**, and its UI corollary from 2026-08-15: **a number's
  population must match the sentence around it.** Three independent authors
  broke that rule the same way in one afternoon; it belongs in the kit's
  contract, not in three files' comments.
- **THE SPLIT.** Documents are files, pipelines are rows. This plan is entirely
  on the rows side. Nothing here reopens Studio in the app.
- **The two-surface rule.** Logged-out visitors see `client/src/practice/`.
  Untouched, all 12,036 lines of it.
- **The Safari toolbar rule.** No `position: fixed` full-viewport coloured divs.
