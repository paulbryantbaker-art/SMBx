# SELLER_EVALUATION_PLAN.md — the free owner evaluation

2026-08-04. Paul: *"free evaluation for sellers… they get something for free
and we can call them if we have a buyer in their lane… plan it thoroughly —
front marketing pages look and feel, how they would create a Google account,
how we would do the valuation based on their business type (we have the
internal code), and how we get permission — we're not going to save
financials… we will only save their information and the evaluation report."*

**The trade, in one line:** an owner gives us twenty minutes and their
numbers; they get a professional market evaluation free; we get a
lane-tagged, size-banded, permissioned first-call list that makes every
future buyer mandate faster. The seller is never a client, never pays us
anything, and is never onboarded into the deal app — they are the
practice's proprietary deal flow.

---

## 1 · The loop (CHAT-FIRST — Paul, 2026-08-04 second pass: "use the Agent
chat pill for all of the business intake and valuation… full valuation
after the user logs in with Google… a link in the menu for Get Free
Valuation")

1. **Ad / post** (LinkedIn, the research reports' own traffic): "We work
   for buyers. If you own a business in one of our lanes, get the market
   read buyers are using — free, in fifteen minutes, no broker, no fee."
2. **Landing page** `/owners` — practice-site language, one job: the chat
   pill. **"Get Free Valuation" joins the nav menu** pointing here — a
   sanctioned addition to the locked v3 IA, same class of decision as
   Research (2026-07-29). The HOMEPAGE keeps its buyer engine pure: one
   starter chip under the home pill — *"I own a business — what's it
   worth?"* — routes to `/owners`. One chat per job; the funnels never
   blend.
3. **The chat runs the whole evaluation** (the Acquisition Engine
   grammar: Haiku conversation, SSE, scripted fail-soft, sheet hardening
   on phones — all reused). Stage A, no login: trade, geography, rough
   size, situation → the free taste, immediately: the lane's cited
   multiple band. Stage B, **the Google gate sits exactly where the
   numbers start**: "To run your full evaluation I need your actual
   figures — sign in with Google so the report has somewhere to go."
   Stage C, financials in-chat; the math runs in `house/evaluate.ts`
   underneath — chat is the collection UX, never the calculator.
4. **The report arrives by email** (the report-gate rail: delivery IS the
   verification). Nothing financial is released to the browser.
5. **The permission close, in chat:** the storage sentence (§5) and the
   first-call checkbox — "When a buyer engages us in your lane, do you
   want to be on the first-call list?"
6. **The register:** a lane-tagged seller/target record lands in the
   pipeline. When a mandate opens: one query — *who raised their hand in
   this lane at this size* — and the first calls are warm.

**Chat-first changes one privacy mechanic (see §5): financial turns are
never persisted.** The stored transcript ends at Stage A; Stage C figures
stream through to the calculator and evaporate. Otherwise "we don't save
your financials" would be false by transcript.

`ENGAGED_LANES` honesty carries over: a lane with a live mandate closes
with "we have an active buyer in your lane today"; every other lane closes
with "registered owners hear first when one engages." Never promise a
buyer who doesn't exist.

---

## 2 · The front door — `/owners` look and feel

Same `.pd` scope, Aurora values, unified type ladder. No new design
language. IA mirrors the landing's proven rhythm:

- **Hero** (bone, ambient bloom): H1 in Fraunces — *"Know what buyers are
  actually paying for businesses like yours."* Sub: one sentence naming
  the trade lanes + "free, fifteen minutes, and your financials are never
  stored." One primary pill: **Start the free evaluation** (opens the
  guided intake inline, mobile sheet on phones — the YuliaIntake drawer
  hardening is already built and reusable).
- **"Why free" band** (jade block, honey band title, centered — current
  band law): the honest positioning, stated plainly. *We are buy-side
  corporate development. We never take a fee from an owner. We built this
  because when a buyer engages us in your lane, we want to already know
  you.* This candor IS the differentiator against every broker lead-magnet
  they've seen; copy law still applies — describe the work, never the
  competitor.
- **What you get** — three hairline cards: the market range for your lane
  (with the sources named on the card — our published research is the
  credibility), the readiness read (what moves a business inside the
  range), the PDF you can put in front of your banker or CPA.
- **Privacy band** — see §5; this earns its own section on the page, in
  plain sentences, because it's the objection the whole funnel dies on.
- **FAQ + footer CTA.** Routed in the practice shell; linked from ads
  first, chrome later if it earns it (the v3 IA is locked — adding it to
  the nav is a deliberate Paul decision, same as Research was).

Report/PDF look: the Ledger report grammar (dark cover, brass rules,
Fraunces heads) via the existing report builder — the seller's deliverable
looks like the published assessments, because that's the brand promise.

## 3 · Identity — how "an account" works without breaking the perimeter

Two laws collide with a full account: practice mode gates
register/login/Google to `TEAM_ALLOWLIST`, and law #3 says third parties
are corresponded with, never onboarded. The resolution the app already
invented is the **reader identity**: `reportAccess` mints a signed
HttpOnly `smbx_reader` JWT when someone confirms their email. Sellers get
the same class of thing, one step richer:

- **"Continue with Google" AT LAUNCH (Paul, 2026-08-04 second pass —
  promoted from P2).** Placed mid-chat, at the Stage B gate before
  financials — value first, friction exactly once. Google is used purely
  to verify the address in one tap; success mints an `smbx_owner` JWT
  (180d, separate audience) and a `seller_registry` row — NEVER a `users`
  row. Implementation is a walled-off OAuth route (own callback, own
  cookie, cannot mint an app session), so `practicePerimeter` and the
  TEAM_ALLOWLIST gate need no carve-out and the app's account system
  stays team-only.
- **Magic-link fallback on the same gate** ("no Google? we'll email you a
  link") — the `smbx_reader` pattern, one template away, and it doubles
  as the return-visit mechanism for updating numbers or re-downloading.

Either way: this is a **funnel identity**, scoped to `/owners` and report
retrieval. It cannot see or touch the deal app. Law #3's intent — no
counterparty inside the practice's instrument — is preserved.

## 4 · The evaluation engine — reusing the internal code

The app already knows how to do this; the work is packaging, not math.

- **Home:** `house/evaluate.ts` — pure, no db, no API key, like
  `house/audit.ts` and `house/screen.ts`, re-exported to the server route
  and testable in isolation. The app and any future local CLI compute
  identical answers (house doctrine).
- **Tiering by size, mirroring `client/src/lib/calculations/core.ts`:**
  - Sub-$3M revenue / owner-operated → **SDE basis** (`calculateSDE`
    logic: earnings + owner comp + add-backs) against SDE multiple bands.
  - Above → **Adjusted-EBITDA basis** against EBITDA bands
    (`calculateEBITDA`, `calculateValuation` grammar).
- **Lane bands are the published research, cited.** A
  `house/laneBenchmarks.ts` register: per lane (HVAC, plumbing,
  electrical, roofing, pest, garage doors, commercial mechanical, …) the
  low/market/premium multiple bands **with source and vintage on every
  row** — CT Acquisitions April 2026, GF Data, Capstone's series, the
  bands already carried in the assessments. Zero hallucination: if a lane
  has no published band, the tool says so and captures the lead anyway
  ("your lane's read is being built — you'll get it first").
- **Readiness score moves them inside the band** — the exact drivers the
  research names, each with its stated effect: recurring-revenue mix (the
  ±3–4 turn swing), non-owner management, customer concentration,
  books quality (cash vs accrual), technician/roster transferability,
  new-construction dependence. Output: position-in-band + "what fixing
  each is worth in turns," which is the content that keeps sellers warm
  for months.
- **Output is a RANGE + readiness, never a point estimate.** Their inputs
  × the cited band endpoints. Standing disclaimer on page and PDF:
  *"Market context from published transaction data applied to figures you
  provided — not an appraisal or opinion of value. Transactions are priced
  in diligence."* This is the THE LINE guardrail (appraisal → licensed
  specialist) and the negotiation guardrail (never hand a future
  counterparty a number to quote back).
- **No model call anywhere in the loop.** Deterministic math + template
  narrative composed from computed facts. Costs nothing per lead, cannot
  be taken down by an API cap, cannot hallucinate. (An optional
  Haiku-polished narrative paragraph is a P3 luxury, not a dependency.)
- **PDF:** rendered through `premiumPdfRenderer` with the report cover
  grammar; delivered as attachment + link via `sendEmail`, exactly the
  report-gate flow.

## 5 · Privacy — the "we don't keep your financials" promise, kept honestly

Paul's instinct is the funnel's unlock: owners won't type revenue into a
stranger's website unless the data promise is loud and true. The
architecture makes it true:

- **Raw financials are ephemeral.** Revenue, earnings, add-backs, payroll
  — computed against in one request, **never written to the database,
  never logged**. The evaluation route is built so there is no code path
  that persists them (and the plan's test suite asserts it: submit, then
  prove the db contains no raw figures).
- **Chat-first corollary: the transcript is not a loophole.** Session
  persistence (the sessionStorage hydration the intake drawer uses, and
  any server-side lead capture) stores the conversation only through
  Stage A (lane/geography/size-band/situation). Stage C financial turns
  stream to `house/evaluate.ts` and are dropped — not in the db, not in
  logs, not in the stored transcript, and the client's own sessionStorage
  copy is scrubbed of figure turns on report delivery. The
  no-financials-persisted test covers the transcript tables too.
- **What we DO keep, disclosed in the same breath:** contact details,
  lane, geography, **broad size band** (checkbox ranges like "$1–3M
  revenue," which is all mandate-matching needs), the readiness grade,
  consent flags, and **a copy of the evaluation report PDF**.
- **The honest nuance, stated rather than buried:** the report itself
  contains the computed range, and a range divided by a multiple implies
  the input. So the promise is worded precisely — *"We don't store the
  financial figures you enter. We keep your contact details, your lane and
  size band, and a copy of your finished report so we can reference it if
  we call you."* That sentence is true, auditable, and still an easy yes.
  (Alternative if Paul prefers the stricter promise: don't retain the PDF
  either — email-only delivery, keep only bands + grade. One flag flips
  it; default per Paul's instruction is keep-the-report.)
- **The decision comes AFTER delivery (Paul, 2026-08-04 evening —
  supersedes the two-checkbox close above; migration 118):** up front the
  owner accepts only the minimum in one tap ("we process your answers and
  email you the report"). When the report is delivered, the chat renders
  the server's truthful inventory of what's on file — general business
  information and the report, nothing else — and the owner chooses:
  **Keep it** (row marked `kept`, first-call consent recorded) or
  **Delete my information** (every row for that email erased on the spot,
  report and all — a real button, not an email request). A `pending` row
  whose owner never answered expires after 30 days, because an unanswered
  question is not consent. The first-call query only ever reads `kept`
  rows.

## 6 · Where registrants land — pipeline, not CRM clients

`crm_accounts` is the CLIENT pipeline (acquirers) — sellers must not land
there. New migration: **`seller_registry`** — contact, lane(s), geography,
size band, readiness grade, consent flags, report pointer, `smbx_owner`
identity, provenance (`source: 'owner-evaluation'`), timestamps. Team
surfaces (P3): a lane/size filter view + "who to call" when a mandate
opens, and a Today attention row when a registrant matches an engaged
lane. Sourcing can join against it: a screen `pull` that finds a
registrant in-lane marks them **hand-raised** — the highest-value tag a
candidate row can carry.

## 7 · THE LINE checklist (build-time gates, not intentions)

- Range + readiness only; no point-estimate valuation anywhere (test
  asserts the render contains no single-figure "worth" sentence).
- Disclaimer present on page, in email, on PDF.
- No fee talk; no engagement language toward sellers; posture copy states
  buy-side plainly on every surface.
- One client per target unaffected — registry rows are targets, not
  clients.
- Counsel flag: the pending §15(b)(13)/M&A-broker review should see this
  funnel described exactly (free-to-seller evaluation + buyer-paid fees on
  eventual transactions). Nothing ships that contradicts the perimeter;
  the review is confirmation, not permission to skip the guardrails.

## 8 · Phases

- **P1 — the funnel (ship first):** `/owners` page + guided intake +
  `house/evaluate.ts` + `laneBenchmarks.ts` (six residential lanes +
  commercial mechanical to start) + PDF + email delivery + magic-link
  owner pass + `seller_registry` migration + consent capture + tests
  (no-financials-persisted, no-point-estimate, band citations resolve).
- **P2 — return & convenience:** owner re-entry via magic link to update
  numbers / re-download; "Continue with Google" if P1 shows email
  friction; lane-expansion as new research publishes bands.
- **P3 — team ops:** registry view in the app (CRM side, lane/size
  filters), engaged-lane match alerts on Today, sourcing `hand-raised`
  join, optional narrative polish.

## 9 · Open decisions (defaults chosen, Paul can override)

| # | Decision | Default |
|---|---|---|
| 1 | Identity at launch | **DECIDED (Paul): Google sign-in at the mid-chat gate**, magic-link fallback |
| 2 | Keep the report PDF on file? | Yes (per Paul), disclosed verbatim; strict email-only mode is one flag |
| 3 | Route name | `/owners` ("sellers" self-label poorly this early) — menu label **"Get Free Valuation"** |
| 4 | Nav placement | **DECIDED (Paul): menu link at launch**; homepage gets the owner starter chip routing to `/owners`, buyer engine untouched |
| 5 | Launch lanes | The seven with published bands; others capture-and-promise |
| 6 | Intake modality | **DECIDED (Paul): chat-first** (Acquisition Engine grammar), scripted fail-soft when the model is down |
