# CRM WORKFLOW SPEC — reconciled (2026-08-16)

Paul brought a workspace spec from a Cowork session ("SMBX WORKSPACE — CRM
WORKFLOW & SCREEN SPEC") the night the Trainline conversion landed. Its
diagnosis is CORRECT and is hereby adopted as doctrine; three of its details
were written from stale context and are corrected here so nobody builds
against them. This file is the reconciliation — the source spec's structure,
minus what contradicts the repo's own locked laws.

## THE DIAGNOSIS, ADOPTED

**Two funnels, never one surface.**

1. **The CLIENT funnel** — selling the practice. Lead → conversation →
   proposal → signed mandate. The win is a retainer client. This is the
   Clients tab.
2. **The DEAL funnel** — executing for a signed client. Target → outreach →
   NDA → financials → IoI → LOI → diligence → close → integration. The win
   is a closed acquisition. This is the Deals tab.

Different objects, different stages, different velocities, different screens.
The nav already splits them (Clients | Deals); the confusion was that neither
funnel stated its stages, criteria, or discipline on screen. That is what
gets built, not a new information architecture from scratch.

## THE OBJECT MODEL — spec objects mapped to what exists

| Spec object | This repo | Status |
|---|---|---|
| Contact | `crm_contacts` | exists |
| Account (typed) | `crm_accounts.kind`: acquirer / service_provider / target / other | exists; close enough to the spec's `account_type` |
| Client Opportunity | `crm_accounts` rows in the pipeline (stage + next_action + owner) | exists — a separate opportunity table is NOT created; at practice scale one pursuit per firm is the honest model, and a second object would double-enter every touch |
| Mandate (Engagement) | `engagements` (migration 129) | exists; buy-box fields are a named follow-up |
| Target | `crm_accounts.kind='target'` + the wave/touch schema | exists structurally; the target-origination BOARD is a named follow-up |
| Deal | `deals` (+62 tables, DEFINITIVE) | exists |
| Activity | `crm_activity` (touch/note) + `deal_tasks` (dated task w/ assignee) | exists; roll-up views are a follow-up |

## THE SEVEN CRM LAWS, ADOPTED

The spec's §4 is adopted verbatim as behavioral law, with the build status:

1. **Three screen patterns only** (List / Board / Record) — the kit already
   enforces this shape; keep it.
2. **Every record has a timeline** — exists (activity on the Board dossier).
3. **No open record without a next step** — BUILT 2026-08-16: red indicator
   on any open-stage account without a dated next action (list + board).
4. **Ten-second logging** — the Board's "Log it" is 3 interactions; a ⌘K
   global bar is a named follow-up.
5. **Stage moves are inline, never full-page forms** — holds today.
6. **Aging everywhere** — BUILT 2026-08-16: `stage_entered_at` (migration
   130), days-in-stage on rows and cards, amber at 14d / red at 28d for the
   client funnel.
7. **Today is a work queue, not a dashboard** — holds (Needs-you list from
   `nextActions`; no charts on Today).

Plus one the spec had that is now enforced server-side: **a lost pursuit
must say why.** `stage → passed` refuses without a `loss_reason` from the
fixed vocabulary (no_budget / internal_bd_owns_origination / timing /
lost_to_competitor / trigger_evaporated / unresponsive). The histogram of
these IS the P4-hypothesis evidence the spec wants Reports to show.

## THE THREE CORRECTIONS — where the source spec had stale context

1. **Design system.** The spec names "Sora ExtraBold, Inter, IBM Plex Mono,
   Terra as functional accent" — that is the RETIRED liquid-glass/product
   era. The workspace language is **Colour Carta, Shape Trainline**
   (kit/index.tsx styles block, 2026-08-16). Terra survives only as the
   danger semantic in `atlasTokens.ts`. Nothing from the spec's §5 design
   note may be built.
2. **The gate machinery stays.** The spec's §8 says to remove "customer gate
   machinery (S/B/R/PMI journeys)" from the workspace. The B-journey and the
   DEFINITIVE gate stack are not customer machinery any more — they are the
   practice's own dealflow spec (Paul, 2026-08-16: "2, Dealflow (where
   definitive lives)"), rendered in the Deals detail on purpose. The parts
   that ARE retired product surface (S/R journeys as customer flows, pricing
   pages) were already 410'd/unrouted by practice mode.
3. **The pre-IoI seam is narrower than the spec assumes.** WHERE_THE_WORK
   doctrine: enumeration, enrichment, screening and pre-IoI MATH live in
   Cowork; the app never re-grows a sourcing engine. But RELATIONSHIP state —
   who was called, what they said, which wave a target is in — is
   pipeline-shaped (rows, not documents) and belongs in the app. So targets
   arrive via `push-crm.mts` as `kind='target'` accounts, waves/touches run
   in-app, and the workbench's pre-IoI numbers land as STAMPED NOTES
   (run date + commit), never as live models.

## FOUNDER-GATED (staged for Paul, not decided overnight)

- **Stage names.** Current set: prospect / conversation / proposal / engaged /
  mandate_live / passed. The spec proposes Lead / Contacted / Conversation /
  Qualified / Proposal / Negotiation / Won (+ Nurture parking lot). The spec
  itself marks labels as Paul's call — the overnight build keeps the current
  enum and adds the discipline (aging, red dot, loss reasons), which survives
  any renaming.
- **A Nurture parking lot** (real fit, wrong timing, quarterly auto-task) —
  needs the stage-set decision first.
- **Deal creation at B0 vs at IoI.** Today "Open a deal" creates at B0; the
  spec creates a Deal only at the IoI with a promotion checklist and a frozen
  target record. Both are defensible; the promotion ceremony is worth
  building only if Paul wants the stricter seam.
- **Nav shape.** Spec proposes 7 items (adds Targets / People / Companies /
  Reports). Current: Today / Clients / Deals / Agent. Directory and report
  screens are thin once the object model holds; add when the volume demands
  them, not before.

## BUILD ORDER (remaining, per the spec's §9 adapted)

1. ~~Stage discipline: aging + red dot + loss reasons~~ — DONE 2026-08-16.
2. Today: countdown section (needs deal key-date columns: exclusivity expiry,
   financing commitment, target close — migration first).
3. Targets board (kind='target' accounts × wave membership) + the wave
   manager surfacing the existing five-table outreach schema.
4. Promotion flow (if Paul gates deals at IoI).
5. Buy-box fields on `engagements`; mandate switcher on Deals/Targets.
6. People / Companies directories; the four fixed reports (loss-reason
   histogram first — it tests the P4 hypothesis).
