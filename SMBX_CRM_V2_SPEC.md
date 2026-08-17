# SMBX CRM V2 — THE FLOW AND THE MINIMAL BUILD (Paul's spec, verbatim)

Received 2026-08-16, with three directives alongside it:

1. **"i dont want to type in anyones name etc, so we'll figure out how to
   get it from the copy paste better later."** → Quick-add ships manual-first
   (≤15s, name is the only requirement); the paste assist returns LATER as an
   optional prefill from high-confidence signals only. house/linkedin.ts (54
   cases) waits for that job.
2. **"i dont want train UI -- can you just use the Carta UI that we have for
   the external site."** → The V2 front end (client/src/components/v2/) reads
   `house/tokens.ts` CARTA directly: white canvas, panel fills, hairlines,
   ink scale, Deal Green as the one accent, THE BUTTON LAW (green never a
   resting fill), Source Serif display · Schibsted working · IBM Plex Mono
   for counts/dates/aging. The Trainline kit is retired with the chrome it
   belonged to; its honesty grammar carries forward as law.
3. **His client workflow in his own words**: 1 after linkedin contact and
   initial meeting → 2 contract discussion → 3 close contract (generate
   contract with Cowork) → 4 define buy-box etc. → 5 start on Deal flow.
   This maps onto the spec's pipeline (Conversation→Won) with the contract
   generated in COWORK at Won — the app records the mandate, never papers it.

Build state: §8 steps 1–2 SHIPPED 2026-08-16 (migration 132 `crm_leads`,
routes/leads.ts, v2/ shell with Leads + Today). Steps 3–7 land one at a
time, each after live use of the last.

---

# 0. CONTEXT AND THE DECISION
The CRM and Campaign front-ends have been deleted. Deal-mechanics backend survives untouched. LinkedIn permits no lead/data export except to partner software on the expensive Sales Navigator tier — so **every contact enters this system by manual entry, regardless of what CRM sits behind it.** That fact decides the build-vs-buy question:
**Decision: build the thin version in-app.** Rationale: (1) entry is manual either way, so an external CRM adds cost without removing work; (2) the deal backend already lives here — a won mandate must flow into targets and deals without a second system; (3) the CRM is future product surface (broker dual-sided CRM on the roadmap) — dogfood it; (4) volume is small (200-org universe, tens of live threads) — the need is a follow-up queue, not Salesforce.
**Standing prohibition: no LinkedIn automation.** No scraper extensions, no auto-connect tools, no sequence bots touching LinkedIn. The account already absorbed one algorithmic throttling; a ToS restriction kills the content channel. All LinkedIn activity is manual. All entry into the app is manual quick-add, engineered to cost ≤15 seconds.

# 1. THE END-TO-END FLOW
STAGE 1 · UNIVERSE (studio / Cowork) — register of PE firms, family offices, search funds, built and verified externally, tiered, trigger-dated, P1–P4 screened → push-crm.mts pushes orgs into the app as Accounts (prospect_client) with a HUNT BRIEF per org.
STAGE 2 · HUNT (LinkedIn manual + app tracking) — find 1–3 people per org in Sales Navigator; the conversation happens IN LinkedIn; the tracking happens IN THE APP: each person engaged gets a 15-second Lead row.
STAGE 3 · GRADUATE (the paste moment = Lead conversion) — when a thread is ready for a real conversation: CONVERT: Lead → Contact (email/phone captured) + Opportunity at "Conversation."
STAGE 4 · PIPELINE (app) — Conversation → Qualified → Proposal → Negotiation → Won / Lost (+ Nurture). Email is now the channel: Yulia drafts 1:1, Paul sends from his own mailbox.
STAGE 5 · MANDATE (app — existing deal backend) — Won creates a Mandate; targets, waves, promotion at IOI, deals through integration.

# 2. OBJECT MODEL — ONE ADDITION
Seven objects stand (Contact, Account, Client Opportunity, Mandate, Target, Deal, Activity). ADD: **Lead** — a person in the LinkedIn stage. Fields: name · Account link (or free-text org) · LinkedIn URL · status · next-follow-up date · source note · running notes. No email/phone — those arrive at conversion. Convert action: one modal, four fields. Drop action: reason required; org's hunt count decrements.
Account addition: **hunt_brief** (studio-written, read-only in app). Account hunt status DERIVED, never typed: no leads / hunting / in conversation / client / dropped.

# 3. THE LINKEDIN STAGE LADDER
Identified (+2d: send invite) → Invited (+7d; 21d: withdraw, try second person) → Connected (+3d: open with something specific) → In Thread (+4d) → Ready (convert now).
Rules: EVERY open lead has a next-follow-up date — that date is what Today reads; past-due renders red. Defaults are prompts, not automation (+2d/+4d/+7d/custom, one tap). One-tap touches: invited / messaged / commented / replied.

# 4. EMAIL DOCTRINE — SEQUENCED 1:1, NEVER A BLAST
Channel opens at graduation. Yulia drafts, Paul sends from his own mailbox. Sequences are task cadences, not sends. Newsletter/broadcast explicitly deferred.

# 5. CAMPAIGNS, REDEFINED
Split: (1) CONTENT — a full Post Schedule (post_date, pillar, audience, format, collateral_style, hook, topic_summary, cta, video fields, asset_path pointing at disk, status, posted_url). Boundary law: rows are scheduling/tracking state; the rendered asset and canonical copy live on disk in the studio. Ingest through Yulia (paste the calendar; create/update, never silently delete). Posting stays manual, always. (2) SEQUENCES — template library of dated task cadences applied to Leads or Contacts.

# 6. V1 SCREENS — SIX
Today (queue: LinkedIn follow-ups due · pipeline next steps · content queued; movement footer; no charts) · Leads (quick-add headline; list sorted by next follow-up; inline log/reschedule/convert/drop) · Pipeline (board, drag with inline prompts, Won opens Mandate form) · Companies (universe + derived hunt status; "Needs contacts" preset) · People (contacts, post-graduation) · Campaigns (Content · Sequences). Global: ⌘K + Yulia dock, context-aware; she drafts and stages, Paul's confirmation executes.

# 7. WHAT STAYS DEAD / ALIVE
Deal backend alive untouched (front-end rebuild is a later phase). Old CRM front-end dead — do not resurrect components. Old Campaign module dead except research_schedules (Content tab reads it). No in-app sourcing, permanently. No customer gate machinery in workspace routes.

# 8. BUILD ORDER
1 Lead + quick-add + Leads list · 2 Today · 3 Convert + Pipeline · 4 Companies (+hunt_brief in push schema) · 5 People · 6 Campaigns (Content first) · 7 Yulia toolbelt threaded per screen.
Acceptance: from a Sales Navigator tab and an app tab, add a found lead ≤15s; next morning Today says which threads to touch; graduation is one modal; at no point does Paul wonder which screen he is on.

# 9. WHERE COLLATERAL IS GENERATED — THE SEAM
One test: counterparty-confidential for one deal → App. Speculative/reusable/audience-facing → Studio. (LinkedIn collateral, decks, pre-IOI math → Studio/Cowork. Outreach comms drafts, IOI letter, LOI, live models, DD, funds flow, deal memos, data room, PMI → App.) Nothing app-side flows back to the studio repo after promotion.

## Founder-gated
1 Lead status labels · 2 follow-up default offsets (tune after two weeks live) · 3 where Nurture lives · 4 newsletter (deferred; real trigger only).
