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
| Screens | Accounts (list/detail) · Contacts · Outreach queue · Leads |

**FULL FUNCTION AT BOTH WIDTHS** (Paul, 2026-08-16: *"i want a fully functional
CRM … on desktop"*). Phone-first authoring (§9) is about which width the layout
is SOLVED at, not about which width gets the features. The desktop is not a
stretched phone: `ListDetail` expands into the multi-column density a working
CRM needs — list, record, and related lists visible at once — while the same
components stack on a phone. One implementation, two compositions, no feature
gap in either direction.

### The two object-model gaps, measured

A CRM is not a list of firms with scores. Two things are structurally missing,
and both have to exist before "fully functional" means anything:

**1 · THERE IS NO ENGAGEMENT OBJECT.** §3 calls the mandate "the seam" and
there is no table for it. `definitive_agent_mandates` is the mothballed MCP
agent surface, not this. So the app can record a firm (`crm_accounts`) and a
target (`deals`) but **not the contract between them** — which client engaged
us, on what terms, when it started, when it renews, what the retainer credit
stands at. That is Salesforce's *Opportunity*, and it is the single most
load-bearing missing row in the schema. The published fee schedule
(quarterly $15K, banded success fee, every retainer dollar credited at close)
is arithmetic that currently lives nowhere.

**2 · `practice_leads` NEVER REACHES THE CRM.** Zero references in
`routes/crm.ts` or `crmOutreachSeed.ts`. The public funnel captures a lead and
it dies in its own table — there is no Lead → Account conversion, which is the
one flow every CRM has. The Acquisition Engine on the practice site is
generating rows nobody works.

`crm_accounts` itself is in good shape — `stage · owner_email · next_action ·
next_action_on · score · tier · pitch · score_detail` are already there. The
gap is the two objects above, not the columns.

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

**Phase E — the phone.** Absorb `v6/atlasmobile` into the one app: the kit
gains its width behaviour, CRM is authored phone-first (Phase C, not E — see
§9), and Dealflow gets its own short list of phone surfaces (inbox · read ·
respond). `v6/atlasmobile` and `mobileTokens.ts` stop existing.

A and B are independent of C and D. C and D are independent of each other.
**Phase C is authored at 390px from the first line** — CRM is the phone's
primary surface, so building it desktop-first and narrowing it later reproduces
the exact inversion §9 measures.

---

## 9. Mobile — ANSWERED, and it is not "responsive"

> Paul, 2026-08-16: *"phone is for checking and reviewing, responding to
> communications and alerts on Deal Flow IoI > Integration. Mobile should be
> completely functional for CRM, as is the biggest phone function."*

That is a better answer than either option I offered, because **it splits the
two functions in opposite directions**:

| | phone | desktop |
|---|---|---|
| **CRM** | **full function** — the primary surface | full function |
| **Dealflow** | check · review · respond to comms and alerts | full function, incl. the gate stack |

### The finding that settles the architecture

Bucket the existing 11,990 mobile lines against what Paul just said:

| | lines |
|---|---|
| Studio + Sourcing (dark, deleted in Phase A regardless) | 3,531 |
| Dealflow — Deals · Cockpit · Integration · Files | 3,044 |
| shell / chrome | 2,380 |
| Today · Agent · Settings · More · Canvas | 2,103 |
| **CRM — ClientsM + OutreachM** | **932** |

**The function Paul calls the biggest phone function has the least mobile code
in the app** — 932 lines, less than dead Studio's 2,584. And `ClientsM.tsx` is
656 lines against the desktop `Clients.tsx`'s 954, so the phone's most important
surface is also its most abridged. The mobile app's weight is distributed almost
exactly inversely to its value.

That is an argument FOR the rebuild, not against it. A responsive squeeze of the
desktop would preserve the same inversion.

### THREE SURFACES, ONE APPLICATION

Not "responsive" (the same screens, narrower) and not "two apps" (what exists).
A third thing, and the distinction is load-bearing:

**1 · CRM IS BUILT PHONE-FIRST, ONE IMPLEMENTATION.**
If it must be fully functional at 390px then the phone is the CONSTRAINT, and a
layout that works there works at 1440 with more room. The current 656-line
`ClientsM` that does less than its desktop twin is the predictable result of
building desktop-first and squeezing — which is exactly what a "responsive"
answer would have institutionalised. One CRM, authored at the hard width.

**2 · DEALFLOW ON A PHONE IS A DIFFERENT SET OF SCREENS, NOT SMALLER ONES.**
The 134-slot gate stack does not belong on a phone at any width. What Paul
described is *checking, reviewing, responding* — so the phone gets its own
short list of surfaces built from the same kit and the same hooks:

- **a deal read view** — the state, the binding gate, the next action. Read.
- **respond** — approve, reschedule, hand off, mark a task done

and it does NOT get: the gate stack editor, the canvas models, bulk anything —
**nor an inbox.** An earlier draft of this section gave the phone a
what-needs-your-answer inbox; §10 deletes it. With comms external, the inbox
Paul opens on his phone is his mail app, and building a second one inside this
app would recreate exactly the surface §10 exists to remove.
A SUBSET OF SURFACES, not a subset of pixels. Reaching a full deal page from a
phone stays possible by URL; it is simply not what the phone is composed for.

**3 · THE KIT CARRIES THE WIDTH BEHAVIOUR, so no screen re-implements it.**
`ListDetail` becomes a push/stack below 900. `CompareStrip` scrolls. The Yulia
rail and `YuliaSheet` (697 lines today, a second implementation of the same
conversation) become one component with two presentations.

### What that deletes

Everything in the mobile column above except the CRM pair and the pieces the
Dealflow inbox reuses — call it **~9,000 of the 11,990**, most of it already
going in Phase A. What survives is absorbed, not kept as a parallel tree:
`v6/atlasmobile` stops existing as a directory.

**`mobileTokens.ts` goes with it.** Two token files (`atlasTokens` violet-era
`M`, `mobileTokens`) for one design system is how the phone drifted off Carta
in the first place.

### THE LINE IS STRICTER ON A PHONE, NOT LOOSER

"Responding to communications" with a thumb is the highest-risk input surface
this practice has: a press is cheap, the screen is small, and the context above
the fold is thin. So the draft → review → **send** affordance from §5 is
*more* deliberate on mobile, not less — the send control is the one thing on the
screen that asks for intent, and it never sits under a thumb by accident.

And the perimeter is unchanged: the counterparties in that inbox are the deal
TEAM and the practitioner's own specialists. Third parties are still
corresponded with by email and token link, never onboarded, and Yulia still
drafts rather than sends.

## 10. COMMS ARE EXTERNAL — the app sends and records, it is never an inbox

> Paul, 2026-08-16: *"maybe every comm should be an email.. lets just link to
> and send everything by email and keep coms external."*

### The finding: this is not a new direction, it is finishing one

Measured, expecting to find in-app messaging to delete. There is almost none:

| | server refs | client refs |
|---|---|---|
| `direct_threads` / `direct_messages` | **0** | **0** |
| `deal_messages` | 3 | **0** |
| `deal_invitations` | 2 | 0 |
| `notifications` | 16 | **10** |

`direct_threads` — the product-era social DM feature THE LINE already forbids —
is referenced **nowhere in the codebase**. It is a table and nothing else, so
dropping it costs nothing. `deal_messages` has server plumbing and **no client
UI at all**. Meanwhile the email rail is already everywhere: eleven server files
call `sendEmail`, token share links are built (`documentShareService`,
`document_shares`, `transaction_tokens`), and `ownerDigest.ts` already exists.

**The one thing that contradicts "comms external" is the notification centre** —
10 client references, an in-app inbox under a different name. That is the
surface this decision actually removes.

### The rule

**The app is a SENDER and a RECORDER. It is never a MAILBOX.**

- Everything that leaves goes as **email**, from the practitioner, one press.
- Everything the app produces is reachable by **token link** — a document, a
  report, a market map. The recipient never gets an account (THE LINE §3:
  third parties are corresponded with, never onboarded).
- **Alerts are email**, not a bell. `ownerDigest.ts` is the precedent.
- Replies land in Paul's real mailbox, where they already were.

### What this deletes

- The notification centre as a comms surface (`useNotifications` in Today,
  mobile Today, mobile More).
- `direct_threads` + `direct_messages` — free, nothing references them.
- **The mobile Dealflow inbox proposed in §9.** If comms are email then
  "responding to communications and alerts on the phone" is the mail app, not a
  screen this plan has to build. §9's phone surface list drops to **deal read
  view + respond-to-task**; the inbox is the user's own client.

### Two things this costs, stated plainly

**1 · THE APP LOSES THE REPLY.** A drafted email to a CPA gets answered into
Paul's mailbox, and the deal's record shows `sent` forever and never
`answered`. `crm_activity` has exactly this gap today, so the decision does not
create it — but going all-in on email makes it permanent unless something
closes the loop. Two ways, neither in this plan's scope: BCC a logging address
and reconcile by thread id, or publish an inbound forwarding address. **Worth
deciding before the CRM is called finished**, because a CRM whose activity log
only records outbound is a send log, not a history.

**2 · ALERT VOLUME.** Every alert as its own email is a firehose that trains
you to ignore it — the same failure as a warning that fires on every deal. The
answer is the shape `ownerDigest.ts` already has: **one digest on a cadence,
plus an immediate email only for things carrying a deadline.** A digest that
says nothing on a quiet day is a correct digest.

---

## 11. What this does not change

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
