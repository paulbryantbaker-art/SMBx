# DEFINITIVE — how a deal runs

**The deal layer, on disk · 14 August 2026**

This folder is the DEFINITIVE layer lifted out of the app and written down so a
Cowork session can run a deal without it. It is the same substrate the app's
`server/services/definitive*.ts` and `v19ModelRuntime.ts` implement — the
classification cascade, the gates, the model catalog, and the tax / legal /
real-property engines — restated as method rather than as code.

**Why it is here.** THE SPLIT (2026-07-31) put documents on disk and pipelines
in the app. A deal analysis is a document. `WHERE_THE_WORK_HAPPENS.md §0` asks
one question — does the ANSWER get looked up later, or does the DOCUMENT get
read later? — and for deal work the answer is the document: an IOI, a diligence
request list, a structure memo, a target underwrite. The app's Studio is out of
the chrome and its deal-mechanics catalog was never a UI at all; it was always
knowledge with an API in front of it. So the knowledge travels and the API
stays behind.

**What this is not.** It is not a rewrite and not an improvement. Where this
folder and the repo disagree, the repo is right and this folder has drifted —
`methodology/METHODOLOGY_V19.md §§9–13`,
`server/services/definitiveDealMechanicsCatalog.ts` and
`server/prompts/{taxEngine,legalEngine}.ts` are the sources these files were
transcribed from, and they are named at the top of each one.

---

## The files

| File | What it answers |
|---|---|
| **DEFINITIVE.md** (this) | How a deal runs end to end. Classification, stages, the deal file. |
| **GATES.md** | Which gates a deal trips, what each one activates, where counsel takes over. |
| **MODELS.md** | The 134-slot catalog and the 114 executable models — what each computes. |
| **VALUATION.md** | Leagues, the metric fork, valuation methods, the math engine, stack composition. |
| **TAX.md** | The six-lens framework, entity fork, F-reorg, §1060, §453, §382, §280G, SALT. |
| **LEGAL.md** | The three modes, the defer triggers, agreement architecture, governance, SBA, HSR. |
| **REAL_ESTATE.md** | The V18c layer — title, leases, transfer tax, CITT, fixtures, 1031, FIRPTA. |

Read this file first, then **GATES.md**. The other five are reference: you open
them when the deal trips into them, not front to back.

---

## THE LINE binds every page of this

The practice is **buy-side only**. Everything below describes work done for an
acquirer client who has engaged us, and the perimeter does not move because a
model exists for something:

- **Buy-side only.** Never sell-side, never two-sided, never a neutral
  intermediary. One buyer per target.
- **Targets under $250M revenue.** This is a hard ceiling, and it cuts the
  league table (below) roughly in half.
- **No unlicensed opinions** — securities, tax, legal, appraisal. Name the
  specialist and what to ask them. That is the correct move, not a hedge.
- **We analyse; the client decides, signs, and files.** No contacting or
  negotiating with a counterparty on our own, no custody, no signature.
- **No fee talk** in any client-facing document.

**The valuation distinction, stated precisely, because it is the one people get
wrong.** Underwriting a named target for the client who is buying it *is* the
work — that is what a buy-side mandate is. What is out of lane is a **formal
opinion of value**: an appraisal, a fairness opinion, or a value on a named
company published into a market document or anything in `collateral/`. The
catalog knows this — M135 fairness-opinion scaffolding is classed
`professional_handoff`, not `deterministic`, precisely so the model produces the
supporting record for someone licensed to sign it and never the opinion itself.
So: underwrite the target for your client, in `deals/<engagement>/analysis/`,
in a range, with the arithmetic shown. Do not sign a number, and do not let one
leave the engagement folder.

---

## Leagues — and which ones the practice actually plays in

Every downstream choice keys off the league. It is set by earnings first,
revenue second.

| League | Metric | Range | Buyer | Financing | In lane? |
|---|---|---|---|---|---|
| **L1** | SDE | SDE < $300K · rev < $1M | Individual operator | SBA 7(a) small + seller note | yes |
| **L2** | SDE | SDE $300K–$1M · rev $1–5M | Searcher, individual | SBA 7(a) to $5M + seller note | yes |
| **L3** | EBITDA | EBITDA $1–5M · rev $5–25M | Independent sponsor, search fund | SBA + mezz + sponsor equity | **the core** |
| **L4** | EBITDA | EBITDA $5–25M · rev $25–100M | Lower-middle-market PE | Unitranche + sponsor + rollover | **the core** |
| **L5** | EBITDA | EBITDA $25–100M · rev $100–500M | Middle-market PE | TLB + 2L/mezz + sponsor | **only to $250M rev** |
| L6 | EBITDA | rev $500M–$2B | Upper-middle-market PE | Syndicated TLB + 2L | out of lane |
| L7–L10 | EBITDA | rev $2B+ | Mega-fund, strategic, public | HY, bridge, consortium | out of lane |

**The $250M ceiling cuts through L5.** L5 runs $100M–$500M of revenue, so its
bottom half is in lane and its top half is not. L6 and above are out entirely.

**Why the out-of-lane rows are still written down.** The methodology is
league-complete and the mechanics cascade downward — the L4 model stack is the
L5 stack with the mega-deal layers removed, and knowing what got removed is how
you know the stack is right. Read L6–L10 as context. Never open an engagement
there.

**The metric fork.** SDE below roughly $1M of earnings, adjusted EBITDA above.
SDE adds the owner's full compensation back because the buyer is buying a job
plus a business; EBITDA does not, because the buyer is buying a business that
must pay a manager. Getting this backwards overstates a small deal by roughly
one full turn.

Full ranges, multiple floors and ceilings, and the stack-complexity ladder are
in **VALUATION.md**.

---

## The classification cascade — seven steps, in order

Nothing composes until the deal is classified. Run these in order; each one
narrows the next.

**1 — Journey.** Buy, sell, raise, or PMI. For this practice it is **buy**, or
it is **PMI** on a deal we closed. If a conversation reads sell-side, that is
not a classification result, it is a conflict — stop and re-read THE LINE.

**2 — Sub-journey.** Platform or add-on. First acquisition or tenth. Proprietary
or intermediated. This is what makes two L3 deals need different stacks.

**3 — League.** From SDE / EBITDA plus revenue, per the table above. If earnings
are unknown, classify from revenue and mark the league `inferred` — an inferred
league is workable, a wrong one is not.

**4 — Deal type.** Asset purchase · stock purchase · merger (forward, reverse
triangular, two-step) · §338(h)(10) · §336(e) · F-reorg · §351 · §368 variant ·
§355 spin · LBO (SBA / PE) · MBO · dividend recap · carve-out · JV · distress
(§363, ABC, receivership, LME). In lane, the overwhelming majority is: asset
purchase, stock purchase, or F-reorg.

**5 — Structure.** Rollover (size, vehicle) · earnout (size, duration, metric) ·
seller note · financing (SBA / unitranche / TLB) · RWI vs traditional indemnity ·
escrow · working-capital peg method.

**6 — Industry.** NAICS 6-digit where you have it. Drives sector overlays —
healthcare CHOW, cannabis §280E, manufacturing §168(n), tech §174A — and the
comp set.

**7 — Jurisdiction.** Target state, buyer state, seller state, all three. Drives
non-compete enforceability, QSBS conformity, transfer tax and CITT, PTE
election, bulk sales, and the SBA rules. Three states means three answers, not
one.

**Conflicts are first-class.** When two axes disagree — a buy journey with a
seller role, a distressed posture on a healthy balance sheet, an entity type
that contradicts the elected structure — record the conflict and name the fields
that would resolve it. Do not average them and do not pick the more convenient
one. The app models this as a typed `ClassificationConflict` on the deal state
for exactly this reason.

**Missing facts are normal and are not a blocker.** Classify from what exists,
name what is missing, and keep going. The whole substrate is built to run on
partial state — the failure mode it was designed against is a deal that stalls
waiting for a fact nobody has asked the seller for yet.

---

## Readiness — the five levels

Readiness is what you have earned, not how long you have worked. It answers one
question: what am I allowed to produce right now?

| Level | Name | You can produce | Done when |
|---|---|---|---|
| **DRL0** | Unclassified | Nothing but questions | — |
| **DRL1** | Classified | A deal plan, a question list | Journey, league and subject are set |
| **DRL2** | Indication ready | **An IOI, with caveats** | Subject + journey known · economic scale and jurisdiction present · at least one source document |
| **DRL3** | LOI architecture ready | **An LOI economic architecture** | Structure or key terms present · risk/overlay gates classified · economics organisable without drafting clauses |
| **DRL4** | Diligence ready | **A diligence request list, a data-room index, a close-readiness read** | Core document categories indexed · model outputs and open source gaps tracked · specialist blockers explicit |

**DRL0–DRL3 can all proceed on partial state. DRL4 cannot** — that is the level
where "we do not have it yet" stops being a note and becomes the finding.

The failure this prevents: writing an LOI architecture at DRL1. It reads
complete, every number is arithmetically fine, and every one of them rests on an
assumption nobody wrote down.

---

## The seven stages

The runbook the app ships (`definitiveDealRunbooks.ts`) as it applies to a
buy-side mandate. Each stage says what goes in, what comes out, and when it is
finished. **Done-when is a test, not a feeling.**

### 1 · Intake
**Purpose.** Classify from partial information. Create the deal file. Do not
block on missing facts.
**Minimum in.** Intent · target if known · industry if known · size or range if
known.
**Out.** The deal file with a classification key, the current stage, the source
gaps, and the next three things to ask for.
**Done when.** The classification key is written and the missing-input list
names what unlocks the next level.

### 2 · IOI
**Purpose.** The first indication, with the assumptions and the gaps visible.
**Minimum in.** High-level financials · the thesis · valuation or financing
constraints · whatever documents exist.
**Out.** The IOI packet · the deal plan · the first model stack · the assumption
log.
**Done when.** The packet is source-aware, caveated, and explicit about what
must be learned before an LOI. An IOI that hides its assumptions is worse than
no IOI — it gets negotiated against.

### 3 · Deeper diligence
**Purpose.** Add documents, market facts, model outputs and specialist status,
iteratively.
**Minimum in.** Uploaded documents · open asks · the current blocker · updated
economics.
**Out.** The data-room index · the diligence request list · the source index ·
what changed since last read.
**Done when.** You can either advance the next gate or name the specific
document, specialist or third-party report that is blocking it. "More
diligence" is not a blocker; "the 2024 tax return and a landlord estoppel" is.

### 4 · LOI
**Purpose.** Turn diligence into economics, structure, and conditions.
**Minimum in.** Price or range · structure · consideration mix · key conditions ·
known exclusions and handoffs.
**Out.** The LOI packet · the draft · the negotiation brief.
**Done when.** The packet separates the deterministic economics (ours) from the
clause language and enforceability (counsel's). If those two are interleaved in
the same paragraph, it is not done.

### 5 · Confirmatory diligence
**Purpose.** Refresh as new material arrives; invalidate stale assumptions
before they reach negotiation.
**Minimum in.** New documents · changed assumptions · specialist inputs · the
open-issues list.
**Out.** The diff · the disclosure subset · the refreshed completeness read.
**Done when.** Every changed fact has been traced to the models, documents and
issues it touches. **A changed fact with an untraced blast radius is the single
most expensive thing in this stage** — the number gets updated in one document
and quoted from three others.

### 6 · Model & negotiation prep
**Purpose.** Compute the scenarios. Not negotiate.
**Minimum in.** The issue · the client's preference and mandate · scenario
assumptions · specialist status.
**Out.** Scenario outputs · the negotiation brief · the tradeoff map.
**Done when.** Each option carries its economics and its risk, and none of them
carries a recommendation to a counterparty. We compute; the client decides and
speaks.

### 7 · Close & PMI
**Purpose.** Closing mechanics, then the first hundred days.
**Minimum in.** The closing checklist · conditions status · true-up mechanics ·
integration plan inputs.
**Out.** The close-readiness read · the closing-statement true-up · the PMI plan.
**Done when.** Conditions are tracked to their owners and the post-close
obligations — escrow release dates, earnout measurement periods, survival
expiry — are written down somewhere that will be read on the date they matter.

---

## The deal file

The app holds this as a `DealState` row with a hash and a revision number. On
disk it is a markdown file, and the discipline that makes it work is the same:
**one file is the state, it is dated, and everything else in the folder is
derived from it.**

```
deals/<engagement>/
  engagement.md            the mandate: who the client is, what they want to own
  thesis-<market>.md       the position held FOR THIS CLIENT (thesis.mts)
  deal-<target>.md         THE DEAL FILE — one per live target. Template below.
  documents/               what the seller sent. Never edited.
  analysis/                what we produced. Includes target-map-<market>.md
  notes.md                 the running record
```

`deal-<target>.md`:

```markdown
# <Target> — deal file
updated: 2026-08-14 · stage: deeper_diligence · readiness: DRL2

## Classification
journey: buy · sub-journey: platform · league: L3 (inferred from revenue)
deal type: asset purchase (assumed — not yet discussed)
structure: rollover TBD · earnout TBD · SBA 7(a) + seller note
industry: NAICS 238220 · jurisdiction: target TX, buyer DE, sellers TX

## Gates tripped
G2 · G15 · G14 · G7 (LOI executed)      see GATES.md
overlays: none

## The numbers
Every line: value, source, and confidence.
| Figure | Value | Source | Confidence |
|---|---|---|---|
| TTM revenue | $8.4M | 2025 P&L, p.1 | explicit |
| Adj. EBITDA | $1.1M | our bridge, analysis/ebitda-bridge.md | derived |
| Owner comp | $310K | 2025 W-2 | explicit |

## Assumptions
Numbered, each with what would confirm it, and what it moves if wrong.

## Open gaps
P0 blocks the next level. P1 tightens the answer. P2 is nice to have.

## Specialist handoffs
Who, what question, sent when, answered when.

## Log
Dated. What changed and what it moved.
```

**Three laws for the deal file.**

**Every figure carries its source.** Same law as a market master, and it matters
more here, because in a deal the numbers came from a counterparty with an
interest in them. `explicit` means a document says it. `derived` means we
computed it and the working is in `analysis/`. `inferred` means we guessed and
it is not yet real.

**A derived document does not follow the deal file.** Rebuild it, or date it and
say what it was built from. An IOI built at DRL2 does not silently become
correct when the deal reaches DRL3.

**The engagement folder is never a source.** No figure, quote or observation
from `deals/` enters a master, a market document, or anything in `collateral/`.
`audit.mts` cannot catch a breach here — it checks whether a figure traces, not
where it came from, so a client's check size in a public deck would audit
perfectly clean. This one is on the person writing.

---

## The loop

Every stage is the same four moves, and the substrate is built to be re-entered
rather than run once:

```
classify  →  what does this trip?   →  compute what is computable
   ↑                                              ↓
   └────  name what is missing and who owns it  ──┘
```

**Re-classify on every new document.** A tax return that shows a 2023 S-election
changes the entity fork, which changes the structure fork, which changes the tax
stack — and none of that happens if the classification key was written once at
intake and never read again.

**Name the owner of every gap.** "We need a QoE" is not an action. "The client's
accountant needs to confirm the add-back treatment on the two related-party
leases, and until then the EBITDA bridge holds a $180K range" is.

**Compute what is computable now.** The substrate's oldest rule and the one most
often broken: a partial answer with its gaps named beats a complete answer that
waited three weeks for one document.

---

## What still lives in the app

Honest limits, so nobody looks for these here:

- **Deterministic model execution.** `v19ModelRuntime.ts` computes 114 models
  with hashed, audit-stamped outputs. Here you do the arithmetic yourself and
  show the working in `analysis/`. MODELS.md gives the formula for each; it does
  not give you a calculator.
- **The audit packet.** Output hashes, spec-version pinning and the 7-year audit
  trail are app machinery. On disk the equivalent is the dated log and the
  citation discipline.
- **Sourcing.** The 5-stage Places pipeline is `scripts/studio/screen.mts` now —
  local, and documented in the workspace `CLAUDE.md` job list, not here.

None of the three is needed to run a deal. The first is arithmetic, the second
is a filing convention, and the third already moved.
