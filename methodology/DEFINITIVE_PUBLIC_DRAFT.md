<!-- GENERATED review draft — built by scripts/build-definitive-public.ts from the live substrate.
     Do not hand-edit; regenerate instead. This copy exists so the draft is readable on GitHub
     (methodology/DEFINITIVE_PUBLIC_EDITION_PLAN.md is the plan; the publishable tree lands in
     github.com/smbx-ai/definitive after Paul's review). -->

# DEFINITIVE M&A Specification — v1.0.0 (DRAFT — internal review build)

Released 2026-07-16 · https://definitive.smbx.ai · License: CC BY 4.0 (text) / MIT (code)

> **DRAFT — internal review build. Not yet published; do not cite.**

# DEFINITIVE M&A Specification — Overview

DEFINITIVE is an open, versioned specification for the deterministic mechanics
of mergers and acquisitions: the computations, classifications, routing gates,
and authority citations that govern how a transaction's quantitative and
rule-driven questions are answered. It spans valuation normalization, quality
of earnings, financing and DSCR mechanics, purchase-price allocation, tax and
reorganization structure, distressed and restructuring waterfalls, capital
structure and liability management, IP transfer mechanics, and a real
property & contract law layer with anchor-state law encoded as data.

The specification is organized as:

- **134 model slots** (M101–M234) — each a named computation or
  classification with a boundary classification, gate routing, deal contexts,
  authority anchors, and (for most) a reference implementation binding
- **A 30-gate routing framework** — the conditions under which model families
  activate for a given transaction. G28–G30 are fully specified in this
  volume; 17 gates carry catalog-routed models today, and the
  complete gate registry (names and trigger narratives for the remainder) is
  pending curation for publication
- **Anchor-state law tables** — statutory variation (recording acts, risk of
  loss, transfer tax, lease consent) encoded as per-state data, never as
  hidden branching logic
- **A conformance suite** — 655 cases
  (385 model-runtime) that a
  conforming implementation must pass

Three design rules run through everything. **Determinism**: a model computes
from supplied facts and cited constants — same inputs, same outputs, no
estimation dressed as calculation. **Data over logic**: jurisdictional
variation lives in versioned lookup tables; an implementation confronted with
an untabled jurisdiction must surface the gap rather than guess. **Boundary
honesty**: every model declares whether it is arithmetic, a schedule feeding a
licensed professional's determination, or a research scaffold — and
conforming implementations route accordingly.

DEFINITIVE is published for practitioners, tool builders, and AI agents that
need a citable, versioned reference for M&A deal mechanics.

## What this specification is not

This specification is an educational and engineering reference. It is not
legal, tax, accounting, investment, or appraisal advice; it renders no
opinions; and nothing in it creates a professional relationship. Questions it
classifies as specialist determinations belong to licensed professionals.


---

> **DRAFT — internal review build. Not yet published; do not cite.**

# Professional-Boundary Classification

Every model slot in this specification carries one of three boundary
classifications. The classification is part of the specification itself —
implementations that surface DEFINITIVE computations are expected to preserve
it.

**Deterministic computation.** Arithmetic and rule application on supplied
facts and cited constants. Examples: a §1060 seven-class allocation, a DSCR
stress grid, recording-act priority ordering given a state's statute and the
recording facts. These produce answers.

**Deterministic schedules with a specialist boundary.** The model computes
real schedules — a three-prong solvency table, a marketability triage of
title exceptions, a lease consent-path classification — but the *governing
determination* (Is this transfer a fraudulent conveyance? Is title
marketable? Is this clause enforceable?) is a legal, tax, accounting,
appraisal, or judicial conclusion that belongs to a licensed professional.
These models produce the workpapers and the routing, never the conclusion.

**Research scaffolds.** Organized authorities and considerations for areas
where rulemaking or market practice is still moving. These produce oriented
reading, not determinations.

The specification also publishes explicit **professional-determination
boundary catalogs** (for example, the ten real-property triggers in the
state-law chapter): questions that a conforming implementation must classify
and route rather than answer. This is a correctness feature, not a
disclaimer — a system that answers an enforceability question has not
implemented the specification; it has violated it.


---

> **DRAFT — internal review build. Not yet published; do not cite.**

# Methodology

**Zero-hallucination architecture.** Financial figures are extracted or
supplied, never invented; monetary values are integer cents; every published
constant carries a citation anchor; models that lack a required input return
a named missing-input list instead of a guess.

**Model anatomy.** A model slot specifies: identity (slot + name), boundary
classification, gate routing, deal contexts, authority anchors, a
deterministic-computation description, and — where implemented — a reference
binding with required inputs. Implementations execute models as pure
functions over a supplied input record and emit outputs plus an audit payload
(spec version, input/output hashes, timestamps).

**Gate routing.** Transactions activate model families through gates —
predicates over deal facts (asset vs. entity form, distress markers, real
property share of enterprise value, regulated-industry flags). Gates make
coverage inspectable: for a given transaction shape, the set of applicable
models is enumerable in advance.

**Jurisdictional data tables.** Where the law varies by state, the variation
is a versioned data table (see the state-law chapter). Adding a jurisdiction
is a data change with its own conformance cases, not a code change. Unknown
jurisdictions produce explicit table-gap flags.

**Conformance.** The specification ships with a
655-case conformance suite
(385 model-runtime cases across
42 categories).
Expected values are derived from the governing authorities independently of
any implementation. A conforming implementation passes all cases and never
emits an answer to a question the specification classifies as a specialist
determination.


---

# Gates

> **DRAFT — internal review build. Not yet published; do not cite.**


# G1 — Gate G1

> **Editorial gap (pre-publish):** this gate's public name and purpose narrative are pending curation from the internal methodology. The routed models below are authoritative.

## Models routed through G1

| Slot | Model | Classification |
|---|---|---|
| M206 | Indemnification ladder engine | deterministic |
| M207 | Survival period engine | deterministic |
| M217 | Standard IP representation set | professional handoff |

> **DRAFT — internal review build. Not yet published; do not cite.**


# G2 — Gate G2

> **Editorial gap (pre-publish):** this gate's public name and purpose narrative are pending curation from the internal methodology. The routed models below are authoritative.

## Models routed through G2

| Slot | Model | Classification |
|---|---|---|
| M187 | RE-heavy asset-vs-entity election | deterministic |
| M188 | RE/operating-business purchase price bifurcation | deterministic |
| M194 | OpCo/PropCo separation mechanics | professional handoff |
| M200 | Transaction tax master engine | deterministic |
| M201 | 338(h)(10) and 336(e) gross-up math | deterministic |
| M202 | 1374 built-in gains tax | deterministic |
| M203 | Transaction cost capitalization | professional handoff |
| M204 | Imputed interest, OID, and 453A | deterministic |
| M205 | SALT transaction engine | professional handoff |
| M222 | IP-specific 1060 allocation | deterministic |
| M234 | Fixture classification and UCC 9-334 priority | deterministic |

> **DRAFT — internal review build. Not yet published; do not cite.**


# G6 — Gate G6

> **Editorial gap (pre-publish):** this gate's public name and purpose narrative are pending curation from the internal methodology. The routed models below are authoritative.

## Models routed through G6

| Slot | Model | Classification |
|---|---|---|
| M211 | Conditions-to-close logic engine | professional handoff |

> **DRAFT — internal review build. Not yet published; do not cite.**


# G7 — Gate G7

> **Editorial gap (pre-publish):** this gate's public name and purpose narrative are pending curation from the internal methodology. The routed models below are authoritative.

## Models routed through G7

| Slot | Model | Classification |
|---|---|---|
| M108 | RWI primary architecture | professional handoff |
| M123 | MAE durational significance | research only |
| M128 | HSR reportability | deterministic |
| M144 | Carve-out stranded-cost and TSA scoping | deterministic |
| M210 | Closing-statement true-up sequence | deterministic |
| M211 | Conditions-to-close logic engine | professional handoff |
| M212 | Termination and break/reverse-break fee engine | deterministic |

> **DRAFT — internal review build. Not yet published; do not cite.**


# G8 — Gate G8

> **Editorial gap (pre-publish):** this gate's public name and purpose narrative are pending curation from the internal methodology. The routed models below are authoritative.

## Models routed through G8

| Slot | Model | Classification |
|---|---|---|
| M206 | Indemnification ladder engine | deterministic |
| M207 | Survival period engine | deterministic |
| M208 | Escrow and holdback sizing | deterministic |
| M209 | RWI stack architecture | professional handoff |

> **DRAFT — internal review build. Not yet published; do not cite.**


# G9 — Gate G9

> **Editorial gap (pre-publish):** this gate's public name and purpose narrative are pending curation from the internal methodology. The routed models below are authoritative.

## Models routed through G9

| Slot | Model | Classification |
|---|---|---|
| M213 | Earnout architecture and dispute | professional handoff |

> **DRAFT — internal review build. Not yet published; do not cite.**


# G10 — Gate G10

> **Editorial gap (pre-publish):** this gate's public name and purpose narrative are pending curation from the internal methodology. The routed models below are authoritative.

## Models routed through G10

| Slot | Model | Classification |
|---|---|---|
| M214 | IP chain-of-title verification | professional handoff |
| M215 | IP encumbrance and lien search | professional handoff |
| M216 | License in/out dependency map | deterministic |
| M217 | Standard IP representation set | professional handoff |
| M218 | Carve-out and license-back mechanics | professional handoff |
| M219 | Source-code and IP escrow mechanics | deterministic |
| M220 | Employee IP assignment verification | professional handoff |
| M221 | OSS exposure diligence process | professional handoff |
| M222 | IP-specific 1060 allocation | deterministic |
| M223 | Domain and trademark transfer mechanics | deterministic |

> **DRAFT — internal review build. Not yet published; do not cite.**


# G14 — Gate G14

> **Editorial gap (pre-publish):** this gate's public name and purpose narrative are pending curation from the internal methodology. The routed models below are authoritative.

## Models routed through G14

| Slot | Model | Classification |
|---|---|---|
| M101 | QSBS post-OBBBA | deterministic |
| M109 | Working capital peg | deterministic |

> **DRAFT — internal review build. Not yet published; do not cite.**


# G15 — Gate G15

> **Editorial gap (pre-publish):** this gate's public name and purpose narrative are pending curation from the internal methodology. The routed models below are authoritative.

## Models routed through G15

| Slot | Model | Classification |
|---|---|---|
| M101 | QSBS post-OBBBA | deterministic |
| M102 | ESOP deferral | deterministic |
| M103 | F-reorg plus 721 contribution | deterministic |
| M104 | Installment sale | deterministic |
| M105 | 338(h)(10) election | deterministic |
| M108 | RWI primary architecture | professional handoff |
| M109 | Working capital peg | deterministic |
| M111 | Revenue earnout | deterministic |
| M112 | EBITDA earnout | deterministic |
| M113 | Gross-profit earnout | deterministic |
| M114 | Customer-retention earnout | deterministic |
| M115 | Regulatory-milestone earnout | deterministic |
| M119 | SBA 7(a) post-SOP 50 10 8 | deterministic |
| M121 | Up-C and TRA | professional handoff |
| M122 | Unitranche intercreditor | professional handoff |
| M123 | MAE durational significance | research only |
| M124 | Ordinary-course covenant | research only |
| M125 | Specific performance | research only |
| M126 | SB 21 cleansing | research only |
| M127 | MFW dual-prong | professional handoff |
| M135 | Fairness-opinion scaffolding | professional handoff |
| M136 | Fraudulent-transfer baseline | professional handoff |
| M139 | 1060 seven-class allocation | deterministic |
| M140 | Tax-free reorganization qualification | deterministic |
| M141 | 251(h) eligibility and top-up | deterministic |
| M142 | Tender offer mechanics | deterministic |
| M143 | 355 spin and 355(e) test | research only |
| M144 | Carve-out stranded-cost and TSA scoping | deterministic |
| M145 | 721/351 contribution plus 704(c) | deterministic |
| M146 | Cap-table waterfall | deterministic |
| M147 | PIPE 19.99 percent approval trigger | deterministic |
| M148 | Three-prong solvency | professional handoff |
| M149 | DGCL 170 distributable surplus | deterministic |
| M150 | 108 CODI plus 382 limitation | deterministic |
| M180 | Convertible and SAFE conversion | deterministic |
| M181 | Venture-debt warrant coverage | deterministic |
| M182 | ABL borrowing base | deterministic |
| M183 | Make-whole and call protection | deterministic |
| M184 | Covenant basket engine | deterministic |
| M185 | 280G golden parachute | deterministic |
| M186 | 382 NOL limitation | deterministic |
| M199 | FIRPTA withholding v1.1 | deterministic |

> **DRAFT — internal review build. Not yet published; do not cite.**


# G19 — Gate G19

> **Editorial gap (pre-publish):** this gate's public name and purpose narrative are pending curation from the internal methodology. The routed models below are authoritative.

## Models routed through G19

| Slot | Model | Classification |
|---|---|---|
| M191 | Real estate transfer and controlling-interest tax | professional handoff |
| M200 | Transaction tax master engine | deterministic |
| M205 | SALT transaction engine | professional handoff |
| M232 | Controlling-interest transfer-tax and reassessment screener | deterministic |
| M233 | Permit/CO transferability and bulk-sales screener | deterministic |

> **DRAFT — internal review build. Not yet published; do not cite.**


# G23 — Gate G23

> **Editorial gap (pre-publish):** this gate's public name and purpose narrative are pending curation from the internal methodology. The routed models below are authoritative.

## Models routed through G23

| Slot | Model | Classification |
|---|---|---|
| M106 | English warranty and indemnity architecture | professional handoff |
| M107 | International merger-control thresholds | deterministic |
| M110 | English MAC | research only |

> **DRAFT — internal review build. Not yet published; do not cite.**


# G24 — Gate G24

> **Editorial gap (pre-publish):** this gate's public name and purpose narrative are pending curation from the internal methodology. The routed models below are authoritative.

## Models routed through G24

| Slot | Model | Classification |
|---|---|---|
| M129 | EU AI Act risk tier | research only |
| M130 | Cyber diligence | professional handoff |
| M131 | Privacy diligence | professional handoff |
| M132 | Sanctions diligence | professional handoff |
| M133 | ESG diligence | professional handoff |
| M134 | Climate diligence | professional handoff |

> **DRAFT — internal review build. Not yet published; do not cite.**


# G26 — Gate G26

> **Editorial gap (pre-publish):** this gate's public name and purpose narrative are pending curation from the internal methodology. The routed models below are authoritative.

## Models routed through G26

| Slot | Model | Classification |
|---|---|---|
| M120 | Continuation-fund LP waterfall | professional handoff |
| M177 | LP-secondary plus ECI withholding | professional handoff |
| M178 | Strip-sale pricing | deterministic |
| M179 | NAV facility LTV | professional handoff |

> **DRAFT — internal review build. Not yet published; do not cite.**


# G27 — Gate G27

> **Editorial gap (pre-publish):** this gate's public name and purpose narrative are pending curation from the internal methodology. The routed models below are authoritative.

## Models routed through G27

| Slot | Model | Classification |
|---|---|---|
| M102 | ESOP deferral | deterministic |
| M116 | Independent-sponsor tiered promote | deterministic |
| M117 | Search-fund step-up | deterministic |
| M118 | Leveraged ESOP cash flow | deterministic |

> **DRAFT — internal review build. Not yet published; do not cite.**


# G28 — Distressed / Restructuring

Runs the distressed-sale, Chapter 11, Chapter 7, DIP, claims, solvency, and recovery mechanics.

## Trigger conditions

- M148 fails any solvency prong
- cash runway below 90 days or FCCR below 1.0x
- secured debt trades below 60 cents
- bankruptcy filing, RSA, forbearance, DIP lender, stalking horse, distressed fund, or trustee appears

## Boundary notes

DEFINITIVE computes the mechanics; courts, counsel, CROs, and financial advisors make legal, feasibility, and opinion determinations.

## Models routed through G28

| Slot | Model | Classification |
|---|---|---|
| M148 | Three-prong solvency | professional handoff |
| M151 | 363 asset sale mechanics | professional handoff |
| M152 | Plan feasibility | professional handoff |
| M153 | Best-interests-of-creditors | professional handoff |
| M154 | Absolute priority rule and new value | professional handoff |
| M155 | Cramdown interest rate | professional handoff |
| M156 | 1111(b) election trade-off | professional handoff |
| M157 | 726 Chapter 7 waterfall | deterministic |
| M158 | 364 DIP sizing | professional handoff |
| M159 | Fulcrum security | professional handoff |
| M164 | RSA economics | professional handoff |
| M165 | ABC and Article 9 foreclosure recovery | professional handoff |
| M166 | Claims trading recovery | deterministic |
| M167 | Subchapter V eligibility | deterministic |
| M168 | Chapter 22 recidivism score | professional handoff |

> **DRAFT — internal review build. Not yet published; do not cite.**


# G29 — Capital Structure & Liability Management

Runs recap, exchange-offer, covenant, DIP, convertible, ABL, make-whole, and LME mechanics.

## Trigger conditions

- maintenance-covenant breach projected within four quarters
- secured debt trades below 80 cents
- balance-sheet alteration, LME, recap, exchange offer, or covenant amendment appears

## Boundary notes

LME models ship research-only until case law stabilizes; outputs are math and contract-language flags for counsel.

## Models routed through G29

| Slot | Model | Classification |
|---|---|---|
| M136 | Fraudulent-transfer baseline | professional handoff |
| M148 | Three-prong solvency | professional handoff |
| M150 | 108 CODI plus 382 limitation | deterministic |
| M158 | 364 DIP sizing | professional handoff |
| M160 | Exchange offer and distressed-debt exchange | professional handoff |
| M161 | Uptier capacity and sacred rights | research only |
| M162 | Drop-down basket capacity | research only |
| M163 | Double-dip and pari-plus claim multiplier | research only |
| M164 | RSA economics | professional handoff |
| M180 | Convertible and SAFE conversion | deterministic |
| M181 | Venture-debt warrant coverage | deterministic |
| M182 | ABL borrowing base | deterministic |
| M183 | Make-whole and call protection | deterministic |
| M184 | Covenant basket engine | deterministic |

> **DRAFT — internal review build. Not yet published; do not cite.**


# G30 — Real Estate & Asset-Class Overlays

Runs real estate, project-finance, digital-asset, LP-secondary, strip-sale, NAV-facility, and real-estate pass-through overlays.

## Trigger conditions

- real estate equals or exceeds 25 percent of enterprise value
- digital assets equal or exceed 10 percent of enterprise value
- infrastructure/project-finance, REIT, LP/GP secondary, strip sale, NAV facility, title, survey, lease, CITT, FIRPTA, 1031, OpCo/PropCo, or PCA appears
- a deed, lease assignment, change of control with property, preemptive right, due-on-transfer loan, or title exception appears (V18c property/contract-law layer)

## Boundary notes

Digital-asset and industry-regulated overlays remain research-only until rulemaking and counsel templates are stable.

## Models routed through G30

| Slot | Model | Classification |
|---|---|---|
| M169 | FIRPTA withholding | deterministic |
| M170 | 1031 like-kind exchange timing | deterministic |
| M171 | Sale-leaseback and ASC 842 | professional handoff |
| M172 | REIT 75/75/90 compliance triad | deterministic |
| M173 | Project-finance coverage suite | research only |
| M174 | Crypto token taxonomy | research only |
| M175 | GENIUS Act stablecoin PPS test | research only |
| M176 | Digital-asset broker reporting | research only |
| M177 | LP-secondary plus ECI withholding | professional handoff |
| M178 | Strip-sale pricing | deterministic |
| M179 | NAV facility LTV | professional handoff |
| M187 | RE-heavy asset-vs-entity election | deterministic |
| M188 | RE/operating-business purchase price bifurcation | deterministic |
| M189 | Rent-roll normalization engine | deterministic |
| M190 | NOI normalization and cap-rate bridge | deterministic |
| M191 | Real estate transfer and controlling-interest tax | professional handoff |
| M192 | CAM reconciliation mechanics | deterministic |
| M193 | Lease abstraction schema | deterministic |
| M194 | OpCo/PropCo separation mechanics | professional handoff |
| M195 | Property-level escrow and holdback sizing | professional handoff |
| M196 | Title and survey process checklist | professional handoff |
| M197 | Ground lease vs. fee simple mechanics | professional handoff |
| M198 | PCA reserve modeling | professional handoff |
| M199 | FIRPTA withholding v1.1 | deterministic |
| M224 | Recording-act and priority engine | deterministic |
| M225 | Title-covenant and estate/signatory model | deterministic |
| M226 | Marketability triage | professional handoff |
| M227 | Risk-of-loss allocator | deterministic |
| M228 | Survival and merger tracker | deterministic |
| M229 | Lease anti-assignment and change-of-control parser | professional handoff |
| M230 | Due-on-sale screener | deterministic |
| M231 | Option/ROFR/ROFO trigger detector | professional handoff |
| M232 | Controlling-interest transfer-tax and reassessment screener | deterministic |
| M233 | Permit/CO transferability and bulk-sales screener | deterministic |
| M234 | Fixture classification and UCC 9-334 priority | deterministic |


---

# Model Catalog

> **DRAFT — internal review build. Not yet published; do not cite.**


# M101 — QSBS post-OBBBA

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G14, G15

**Deal contexts.** founder sale · rollover

## Computation

Per-issuer cap, holding period, and exclusion percentage.

## Authorities

- IRC 1202
- OBBBA 2025

> **DRAFT — internal review build. Not yet published; do not cite.**


# M102 — ESOP deferral

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G15, G27

**Deal contexts.** ESOP sale

## Computation

30 percent post-sale ownership and qualified replacement property timing.

## Authorities

- IRC 1042

> **DRAFT — internal review build. Not yet published; do not cite.**


# M103 — F-reorg plus 721 contribution

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G15

**Deal contexts.** carve-out · joint venture

## Computation

F-reorg sequence and contribution qualification checks.

## Authorities

- IRC 368(a)(1)(F)
- IRC 721

> **DRAFT — internal review build. Not yet published; do not cite.**


# M104 — Installment sale

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G15

**Deal contexts.** deferred consideration

## Computation

Gross-profit ratio, recapture, pledge, and recognition schedule.

## Authorities

- IRC 453

> **DRAFT — internal review build. Not yet published; do not cite.**


# M105 — 338(h)(10) election

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G15

**Deal contexts.** stock purchase

## Computation

Deemed asset sale, adjusted grossed-up basis, and class allocation bridge.

## Authorities

- IRC 338

> **DRAFT — internal review build. Not yet published; do not cite.**


# M106 — English warranty and indemnity architecture

**Boundary classification.** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G23

**Deal contexts.** UK M&A

## Computation

Coverage limit, de minimis, basket, and exclusion schedule.

## Authorities

- UK market practice

> **DRAFT — internal review build. Not yet published; do not cite.**


# M107 — International merger-control thresholds

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G23

**Deal contexts.** international M&A

## Computation

Turnover, asset, and substantial-lessening tests by jurisdiction.

## Authorities

- EU Merger Regulation 139/2004
- UK Enterprise Act 2002

> **DRAFT — internal review build. Not yet published; do not cite.**


# M108 — RWI primary architecture

**Boundary classification.** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G7, G15

**Deal contexts.** insured M&A

## Computation

Limit, retention, exclusions, and broker-ready architecture.

## Authorities

- SRS Acquiom
- RWI market studies

> **DRAFT — internal review build. Not yet published; do not cite.**


# M109 — Working capital peg

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G14, G15

**Deal contexts.** cash deals

## Computation

Target, peg, true-up, and collar math.

## Authorities

- ABA Deal Points

## Reference implementation

Implemented as `MODEL.STRUCT.NWC.PEG.v1` (Working Capital Peg).

**Required inputs:** `monthly_nwc_cents`, `seasonality_notes`, `closing_balance_cents`

Builds a trailing-period NWC peg and flags deal-structure language for counsel review.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M110 — English MAC

**Boundary classification.** Research scaffold — organizes authorities and considerations; not an executable determination.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G23

**Deal contexts.** UK M&A

## Computation

Framework mapping for durational-significance research.

## Authorities

- English MAC case law

> **DRAFT — internal review build. Not yet published; do not cite.**


# M111 — Revenue earnout

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G15

**Deal contexts.** earnout

## Computation

Metric threshold, period, probability, and expected-value schedule.

## Authorities

- ABA Deal Points
- SRS Acquiom

## Reference implementation

Implemented as `MODEL.STRUCT.EARNOUT.MC.v1` (Earnout Expected Value).

**Required inputs:** `earnout_targets`, `probabilities`, `discount_rate`

Calculates probability-weighted earnout value and negotiation sensitivity.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M112 — EBITDA earnout

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G15

**Deal contexts.** earnout

## Computation

EBITDA target, add-back policy, and expected-value schedule.

## Authorities

- ABA Deal Points
- SRS Acquiom

## Reference implementation

Implemented as `MODEL.STRUCT.EARNOUT.MC.v1` (Earnout Expected Value).

**Required inputs:** `earnout_targets`, `probabilities`, `discount_rate`

Calculates probability-weighted earnout value and negotiation sensitivity.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M113 — Gross-profit earnout

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G15

**Deal contexts.** earnout

## Computation

Gross-profit threshold and payout sensitivity.

## Authorities

- ABA Deal Points
- SRS Acquiom

> **DRAFT — internal review build. Not yet published; do not cite.**


# M114 — Customer-retention earnout

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G15

**Deal contexts.** earnout

## Computation

Retention cohort, payout tiers, and probability-weighted value.

## Authorities

- ABA Deal Points
- SRS Acquiom

> **DRAFT — internal review build. Not yet published; do not cite.**


# M115 — Regulatory-milestone earnout

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G15

**Deal contexts.** earnout

## Computation

Milestone trigger, date window, and payout schedule.

## Authorities

- ABA Deal Points
- SRS Acquiom

> **DRAFT — internal review build. Not yet published; do not cite.**


# M116 — Independent-sponsor tiered promote

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G27

**Deal contexts.** independent sponsor · search fund

## Computation

Carry tiers, catch-up, and promote allocation.

## Authorities

- fund formation market practice

> **DRAFT — internal review build. Not yet published; do not cite.**


# M117 — Search-fund step-up

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G27

**Deal contexts.** search fund

## Computation

Search investor step-up and promote conversion math.

## Authorities

- ETA market norms

> **DRAFT — internal review build. Not yet published; do not cite.**


# M118 — Leveraged ESOP cash flow

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G27

**Deal contexts.** ESOP

## Computation

ESOP debt-service and trustee-facing cash-flow schedule.

## Authorities

- DOL ESOP guidance

> **DRAFT — internal review build. Not yet published; do not cite.**


# M119 — SBA 7(a) post-SOP 50 10 8

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G15

**Deal contexts.** SMB acquisition

## Computation

Eligibility, cap, equity injection, and amortization checks.

## Authorities

- SBA SOP 50 10 8

## Reference implementation

Implemented as `MODEL.LBO.SBA.v1` (SBA Bankability).

**Required inputs:** `purchase_price_cents`, `cash_flow_cents`, `buyer_equity_cents`, `seller_note_cents`

Checks SBA acquisition debt capacity, equity injection, citizenship, seller-note standby, and DSCR.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M120 — Continuation-fund LP waterfall

**Boundary classification.** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G26

**Deal contexts.** GP-led secondary

## Computation

Preference, carry reset, and rollover economics for counsel review.

## Authorities

- ILPA continuation-fund guidance

> **DRAFT — internal review build. Not yet published; do not cite.**


# M121 — Up-C and TRA

**Boundary classification.** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G15

**Deal contexts.** Up-C IPO · tax receivable agreement

## Computation

Basis step-up and 85/15 tax receivable agreement value.

## Authorities

- IRC 754
- TRA market practice

> **DRAFT — internal review build. Not yet published; do not cite.**


# M122 — Unitranche intercreditor

**Boundary classification.** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G15

**Deal contexts.** unitranche financing

## Computation

First-out/last-out payment waterfall and AAL economics.

## Authorities

- LSTA model AAL

> **DRAFT — internal review build. Not yet published; do not cite.**


# M123 — MAE durational significance

**Boundary classification.** Research scaffold — organizes authorities and considerations; not an executable determination.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G7, G15

**Deal contexts.** M&A litigation research

## Computation

Research scaffold for MAE facts and duration flags.

## Authorities

- Akorn
- Frontier
- Channel Medsystems

> **DRAFT — internal review build. Not yet published; do not cite.**


# M124 — Ordinary-course covenant

**Boundary classification.** Research scaffold — organizes authorities and considerations; not an executable determination.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G15

**Deal contexts.** M&A litigation research

## Computation

Research scaffold for ordinary-course operating deviations.

## Authorities

- AB Stable

> **DRAFT — internal review build. Not yet published; do not cite.**


# M125 — Specific performance

**Boundary classification.** Research scaffold — organizes authorities and considerations; not an executable determination.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G15

**Deal contexts.** M&A litigation research

## Computation

Research scaffold for remedy availability.

## Authorities

- Delaware equitable-remedy case law

> **DRAFT — internal review build. Not yet published; do not cite.**


# M126 — SB 21 cleansing

**Boundary classification.** Research scaffold — organizes authorities and considerations; not an executable determination.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G15

**Deal contexts.** Delaware controller deal

## Computation

Controller-cleansing decision tree for counsel review.

## Authorities

- DGCL SB 21
- Rutledge v. Clearway

> **DRAFT — internal review build. Not yet published; do not cite.**


# M127 — MFW dual-prong

**Boundary classification.** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G15

**Deal contexts.** controller deal

## Computation

Independent-committee and majority-of-minority process checklist.

## Authorities

- MFW
- Match Group

> **DRAFT — internal review build. Not yet published; do not cite.**


# M128 — HSR reportability

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G7

**Deal contexts.** M&A regulatory

## Computation

Size-of-transaction, size-of-person, and exemption triage.

## Authorities

- 15 U.S.C. 18a

## Reference implementation

Implemented as `MODEL.HSR.TRIAGE.v1` (HSR Triage).

**Required inputs:** `enterprise_value_cents`

Checks transaction size against current HSR thresholds and flags filing-tier review.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M129 — EU AI Act risk tier

**Boundary classification.** Research scaffold — organizes authorities and considerations; not an executable determination.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G24

**Deal contexts.** EU target · AI diligence

## Computation

Research scaffold for EU AI Act tiering.

## Authorities

- Regulation (EU) 2024/1689

> **DRAFT — internal review build. Not yet published; do not cite.**


# M130 — Cyber diligence

**Boundary classification.** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G24

**Deal contexts.** cyber diligence

## Computation

Control maturity, incident, and exposure scoring.

## Authorities

- NIST CSF

> **DRAFT — internal review build. Not yet published; do not cite.**


# M131 — Privacy diligence

**Boundary classification.** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G24

**Deal contexts.** privacy diligence

## Computation

Data-map, lawful-basis, and breach-risk scoring.

## Authorities

- GDPR
- CPRA

> **DRAFT — internal review build. Not yet published; do not cite.**


# M132 — Sanctions diligence

**Boundary classification.** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G24

**Deal contexts.** sanctions diligence

## Computation

Party, geography, and control-screening workflow.

## Authorities

- OFAC

> **DRAFT — internal review build. Not yet published; do not cite.**


# M133 — ESG diligence

**Boundary classification.** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G24

**Deal contexts.** ESG diligence

## Computation

ESG exposure and disclosure-support scoring.

## Authorities

- SEC climate and ESG references

> **DRAFT — internal review build. Not yet published; do not cite.**


# M134 — Climate diligence

**Boundary classification.** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G24

**Deal contexts.** climate diligence

## Computation

Climate exposure, transition risk, and reporting scaffold.

## Authorities

- SEC climate disclosure references

> **DRAFT — internal review build. Not yet published; do not cite.**


# M135 — Fairness-opinion scaffolding

**Boundary classification.** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G15

**Deal contexts.** public deal

## Computation

Process and supporting-analysis record for the user advisor.

## Authorities

- fairness opinion case law
- market practice

> **DRAFT — internal review build. Not yet published; do not cite.**


# M136 — Fraudulent-transfer baseline

**Boundary classification.** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G15, G29

**Deal contexts.** recap · LBO

## Computation

Baseline solvency/fraudulent-transfer schedule paired with M148.

## Authorities

- 11 U.S.C. 548
- UFTA
- UVTA

> **DRAFT — internal review build. Not yet published; do not cite.**


# M137 — Reserved

**Boundary classification.** Reserved slot — allocated, not yet specified.

**Lineage.** Reserved.

**Gates.** 

## Computation

Reserved model slot.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M138 — Reserved

**Boundary classification.** Reserved slot — allocated, not yet specified.

**Lineage.** Reserved.

**Gates.** 

## Computation

Reserved model slot.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M139 — 1060 seven-class allocation

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G15

**Deal contexts.** asset purchase

## Computation

Class I through VII residual allocation.

## Authorities

- IRC 1060
- Treas. Reg. 1.1060

## Reference implementation

Implemented as `MODEL.TAX.1060.ALLOCATION.v1` (1060 Seven-Class Allocation).

**Required inputs:** `purchase_price_cents`, `asset_classes`

Allocates purchase price across Class I through VII using residual-method ordering and Form 8594-ready class output.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M140 — Tax-free reorganization qualification

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G15

**Deal contexts.** reorganization

## Computation

Type A/B/C/D/E/F/G plus continuity checks.

## Authorities

- IRC 368
- Treas. Reg. 1.368

> **DRAFT — internal review build. Not yet published; do not cite.**


# M141 — 251(h) eligibility and top-up

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G15

**Deal contexts.** public stock deal

## Computation

Eligibility and top-up requirement checks.

## Authorities

- DGCL 251(h)

> **DRAFT — internal review build. Not yet published; do not cite.**


# M142 — Tender offer mechanics

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G15

**Deal contexts.** tender offer

## Computation

Proration, all-holders/best-price, and 20-business-day timing.

## Authorities

- Rule 14d-10
- Rule 14e-1

> **DRAFT — internal review build. Not yet published; do not cite.**


# M143 — 355 spin and 355(e) test

**Boundary classification.** Research scaffold — organizes authorities and considerations; not an executable determination.

**Lineage.** Added in internal lineage v1.1.

**Gates.** G15

**Deal contexts.** spin-off · split-off · Reverse Morris Trust

## Computation

Active-trade/business, device, and 50 percent acquisition-test scaffold.

## Authorities

- IRC 355
- IRC 355(e)

## Reference implementation

Implemented as `MODEL.TAX.355.SPIN_RESEARCH.v1` (355 Spin and 355(e) Research Scaffold).

**Required inputs:** `distributing_atb_years`, `controlled_atb_years`, `acquisition_pct_within_two_years`

Computes active-trade/business, 355(e) acquisition percentage, device indicators, and tax-counsel handoff flags.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M144 — Carve-out stranded-cost and TSA scoping

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G7, G15

**Deal contexts.** carve-out

## Computation

Allocated overhead, stranded cost, and transition-service schedule.

## Authorities

- market practice

> **DRAFT — internal review build. Not yet published; do not cite.**


# M145 — 721/351 contribution plus 704(c)

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G15

**Deal contexts.** joint venture · Up-C

## Computation

Built-in gain, ceiling method, and remedial-allocation math.

## Authorities

- IRC 721
- IRC 351
- IRC 704(c)

> **DRAFT — internal review build. Not yet published; do not cite.**


# M146 — Cap-table waterfall

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G15

**Deal contexts.** growth equity · venture

## Computation

Liquidation preference, participation, seniority, and anti-dilution waterfall.

## Authorities

- NVCA term sheet

## Reference implementation

Implemented as `MODEL.CAPTABLE.DILUTION.v1` (Cap Table Dilution).

**Required inputs:** `pre_money_cents`, `round_size_cents`, `option_pool_pct`, `security_terms`

Models dilution, option pool, convertible securities, and exit waterfall economics.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M147 — PIPE 19.99 percent approval trigger

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G15

**Deal contexts.** PIPE

## Computation

Shareholder-approval threshold and discount trigger.

## Authorities

- Nasdaq Rule 5635

> **DRAFT — internal review build. Not yet published; do not cite.**


# M148 — Three-prong solvency

**Boundary classification.** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G15, G28, G29

**Deal contexts.** recap · LBO · fraudulent transfer

## Computation

Balance-sheet, cash-flow, and capital-adequacy tests at user inputs.

## Authorities

- 11 U.S.C. 548
- UVTA
- Tribune

## Reference implementation

Implemented as `MODEL.RESTRUCTURING.SOLVENCY.THREE_PRONG.v1` (Three-Prong Solvency).

**Required inputs:** `fair_value_assets_cents`, `liabilities_cents`, `projected_cash_flow_cents`, `debts_due_cents`, `available_capital_cents`, `required_capital_cents`

Computes balance-sheet, cash-flow, and capital-adequacy prongs from user-supplied valuation and liquidity inputs.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M149 — DGCL 170 distributable surplus

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G15

**Deal contexts.** dividend recap

## Computation

Surplus/net-profits computation at user-supplied fair value.

## Authorities

- DGCL 170
- Klang

> **DRAFT — internal review build. Not yet published; do not cite.**


# M150 — 108 CODI plus 382 limitation

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G15, G29

**Deal contexts.** debt-for-equity · distressed exchange

## Computation

CODI inclusion, reduction attributes, and ownership-change limitation.

## Authorities

- IRC 108
- IRC 382

> **DRAFT — internal review build. Not yet published; do not cite.**


# M151 — 363 asset sale mechanics

**Boundary classification.** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G28

**Deal contexts.** distressed sale · 363 sale

## Computation

Sale timeline, bid-protection cost, free-and-clear prongs, and credit-bid eligibility.

## Authorities

- 11 U.S.C. 363
- 11 U.S.C. 365
- RadLAX
- Fisker

## Reference implementation

Implemented as `MODEL.RESTRUCTURING.363_SALE.v1` (363 Asset Sale Mechanics).

**Required inputs:** `purchase_price_cents`, `lien_amount_cents`

Computes bid-protection economics, free-and-clear prongs, lien coverage, and credit-bid eligibility from supplied sale facts.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M152 — Plan feasibility

**Boundary classification.** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G28

**Deal contexts.** Chapter 11 plan

## Computation

Cash flow, DSCR, liquidity, covenant, and EBITDA-sensitivity table.

## Authorities

- 11 U.S.C. 1129(a)(11)

## Reference implementation

Implemented as `MODEL.RESTRUCTURING.PLAN_FEASIBILITY.v1` (Plan Feasibility).

**Required inputs:** `forecast_periods`

Computes forecast-period DSCR, liquidity-floor compliance, and downside cash-flow sensitivity for Chapter 11 plan feasibility.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M153 — Best-interests-of-creditors

**Boundary classification.** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G28

**Deal contexts.** Chapter 11 plan

## Computation

Per-class plan recovery versus hypothetical Chapter 7 recovery.

## Authorities

- 11 U.S.C. 1129(a)(7)
- 11 U.S.C. 726

## Reference implementation

Implemented as `MODEL.RESTRUCTURING.BIOC.v1` (Best-Interests-of-Creditors).

**Required inputs:** `creditor_classes`

Compares per-class plan distributions against Chapter 7 liquidation distributions and flags shortfalls.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M154 — Absolute priority rule and new value

**Boundary classification.** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G28

**Deal contexts.** Chapter 11 cramdown

## Computation

Priority waterfall and new-value decision tree.

## Authorities

- 11 U.S.C. 1129(b)
- 203 N. LaSalle
- Castleton Plaza

## Reference implementation

Implemented as `MODEL.RESTRUCTURING.APR_NEW_VALUE.v1` (Absolute Priority and New Value).

**Required inputs:** `classes`

Computes impaired dissenting senior-class recovery, junior-value leakage, and a new-value scaffold for court/counsel review.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M155 — Cramdown interest rate

**Boundary classification.** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G28

**Deal contexts.** Chapter 11 cramdown

## Computation

Efficient-market/Till formula range and circuit flag.

## Authorities

- Till
- MPM Silicones
- Texas Grand Prairie
- Topp

## Reference implementation

Implemented as `MODEL.RESTRUCTURING.CRAMDOWN_RATE.v1` (Cramdown Interest Rate).

**Required inputs:** `base_rate`, `risk_premium`

Computes Till formula and efficient-market framework outputs, with circuit support and court-rate handoff flags.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M156 — 1111(b) election trade-off

**Boundary classification.** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G28

**Deal contexts.** undersecured Chapter 11 creditor

## Computation

Election eligibility and no-election versus election value comparison.

## Authorities

- 11 U.S.C. 1111(b)

## Reference implementation

Implemented as `MODEL.RESTRUCTURING.1111B_ELECTION.v1` (1111(b) Election Trade-Off).

**Required inputs:** `allowed_claim_cents`, `collateral_value_cents`, `plan_payment_stream_cents`, `discount_rate`

Computes no-election value, election NPV, aggregate face test, collateral NPV test, eligibility, and vote threshold flags.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M157 — 726 Chapter 7 waterfall

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G28

**Deal contexts.** Chapter 7 · liquidation analysis

## Computation

Distribution by statutory priority and trustee-fee schedule.

## Authorities

- 11 U.S.C. 507
- 11 U.S.C. 726

## Reference implementation

Implemented as `MODEL.RESTRUCTURING.CH7_WATERFALL.v1` (726 Chapter 7 Waterfall).

**Required inputs:** `estate_value_cents`, `claims`

Computes a priority-ranked liquidation distribution and recovery schedule under supplied claim classes.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M158 — 364 DIP sizing

**Boundary classification.** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G28, G29

**Deal contexts.** DIP financing

## Computation

13-week cash, minimum liquidity, roll-up, carve-out, and priming schedule.

## Authorities

- 11 U.S.C. 364
- Collier 364.06

## Reference implementation

Implemented as `MODEL.RESTRUCTURING.DIP_SIZING.v1` (364 DIP Sizing).

**Required inputs:** `thirteen_week_cash_need_cents`, `minimum_liquidity_cents`

Computes required DIP commitment from 13-week need, minimum liquidity, opening cash, roll-up, carve-out, and new-money inputs.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M159 — Fulcrum security

**Boundary classification.** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.

**Lineage.** Added in internal lineage v1.1.

**Gates.** G28

**Deal contexts.** distressed-for-control

## Computation

Enterprise value through capital stack and recovery by tranche.

## Authorities

- market practice

## Reference implementation

Implemented as `MODEL.RESTRUCTURING.FULCRUM_SECURITY.v1` (Fulcrum Security).

**Required inputs:** `enterprise_value_cents`, `tranches`

Applies enterprise value down the capital stack and identifies the fulcrum tranche at supplied EV.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M160 — Exchange offer and distressed-debt exchange

**Boundary classification.** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G29

**Deal contexts.** out-of-court restructuring

## Computation

Participation threshold, holdout economics, and CODI exposure.

## Authorities

- Securities Act 3(a)(9)
- TIA 316(b)

## Reference implementation

Implemented as `MODEL.RESTRUCTURING.EXCHANGE_OFFER.v1` (Exchange Offer and Distressed-Debt Exchange).

**Required inputs:** `outstanding_debt_cents`, `participating_debt_cents`, `new_security_value_cents`

Computes participation, holdout debt, exchange discount, CODI exposure, and minimum-participation satisfaction.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M161 — Uptier capacity and sacred rights

**Boundary classification.** Research scaffold — organizes authorities and considerations; not an executable determination.

**Lineage.** Research addition (internal lineage v1.1).

**Gates.** G29

**Deal contexts.** LME uptier

## Computation

Required-lender percentage, open-market-purchase language, and contract-risk flags.

## Authorities

- Serta Simmons
- Mitel

## Reference implementation

Implemented as `MODEL.LME.UPTIER.RESEARCH.v1` (LME Uptier Research Scaffold).

**Required inputs:** `required_lender_pct`, `participating_lender_pct`

Computes required-lender threshold, participating-lender threshold, purchase-language flags, and sacred-rights count.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M162 — Drop-down basket capacity

**Boundary classification.** Research scaffold — organizes authorities and considerations; not an executable determination.

**Lineage.** Research addition (internal lineage v1.1).

**Gates.** G29

**Deal contexts.** LME drop-down

## Computation

Investment-basket, unrestricted-subsidiary, and blocker capacity.

## Authorities

- J. Crew
- Envision
- Pluralsight

## Reference implementation

Implemented as `MODEL.LME.DROPDOWN.RESEARCH.v1` (LME Drop-Down Research Scaffold).

**Required inputs:** `asset_transfer_value_cents`, `investment_basket_cents`

Computes aggregate basket capacity, transfer fit, blocker presence, and drop-down vulnerability flag.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M163 — Double-dip and pari-plus claim multiplier

**Boundary classification.** Research scaffold — organizes authorities and considerations; not an executable determination.

**Lineage.** Research addition (internal lineage v1.1).

**Gates.** G29

**Deal contexts.** LME double-dip · pari-plus

## Computation

Claim multiplier and structural-seniority math.

## Authorities

- At Home
- Trinseo
- Sabre
- ABA Business Law Today

## Reference implementation

Implemented as `MODEL.LME.DOUBLEDIP.RESEARCH.v1` (LME Double-Dip and Pari-Plus Research Scaffold).

**Required inputs:** `new_money_cents`

Computes direct and guarantee claims, claim multiplier, and pari-plus structural-seniority flag.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M164 — RSA economics

**Boundary classification.** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.

**Lineage.** Added in internal lineage v1.1.

**Gates.** G28, G29

**Deal contexts.** restructuring support agreement

## Computation

Class support, milestones, termination, fiduciary-out, and toggle schedule.

## Authorities

- 11 U.S.C. 1125
- Indianapolis Downs

## Reference implementation

Implemented as `MODEL.RESTRUCTURING.RSA_ECONOMICS.v1` (RSA Economics).

**Required inputs:** `classes`

Computes class support thresholds, milestone status, termination-event count, fiduciary-out flag, and toggle type.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M165 — ABC and Article 9 foreclosure recovery

**Boundary classification.** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G28

**Deal contexts.** out-of-court liquidation

## Computation

Notice, sale, waterfall, assignee fee, and recovery schedule.

## Authorities

- UCC 9-610
- UCC 9-611
- UCC 9-615
- state ABC law

## Reference implementation

Implemented as `MODEL.RESTRUCTURING.ABC_ARTICLE9.v1` (ABC and Article 9 Foreclosure Recovery).

**Required inputs:** `liquidation_value_cents`, `claims`

Computes liquidation value after sale costs, Article 9 notice-floor compliance, and priority recovery waterfall.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M166 — Claims trading recovery

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G28

**Deal contexts.** claims trading

## Computation

Claim-purchase IRR and ultimate-recovery regression.

## Authorities

- Moody's Ultimate Recovery Database
- FRBP 3001

## Reference implementation

Implemented as `MODEL.RESTRUCTURING.CLAIMS_TRADING.v1` (Claims Trading Recovery).

**Required inputs:** `face_amount_cents`, `purchase_price_cents`, `time_to_recovery_years`

Computes expected recovery from post-default trading price or supplied recovery rate, gross profit, and estimated IRR.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M167 — Subchapter V eligibility

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G28

**Deal contexts.** small business Chapter 11

## Computation

Debt-limit and small-business engagement checks.

## Authorities

- 11 U.S.C. 1181-1195

## Reference implementation

Implemented as `MODEL.RESTRUCTURING.SUBCHAPTER_V_ELIGIBILITY.v1` (Subchapter V Eligibility).

**Required inputs:** `aggregate_noncontingent_liquidated_debt_cents`, `engaged_in_commercial_activity`

Checks supplied debt, commercial-activity, and public-issuer affiliate facts against the current Subchapter V threshold.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M168 — Chapter 22 recidivism score

**Boundary classification.** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.

**Lineage.** Added in internal lineage v1.1.

**Gates.** G28

**Deal contexts.** post-emergence

## Computation

Recidivism-risk score from supplied operating and capital-structure inputs.

## Authorities

- LoPucki Bankruptcy Research Database

## Reference implementation

Implemented as `MODEL.RESTRUCTURING.CHAPTER22.RECIDIVISM.v1` (Chapter 22 Recidivism Score).

**Required inputs:** `exit_leverage`, `liquidity_months`, `ebitda_growth_pct`

Scores post-emergence repeat-filing risk from exit leverage, liquidity runway, EBITDA growth, and prior bankruptcy count.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M169 — FIRPTA withholding

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G30

**Deal contexts.** real estate M&A

## Computation

15 percent, 10 percent, or exemption withholding path.

## Authorities

- IRC 1445
- Forms 8288 and 8288-A

## Reference implementation

Implemented as `MODEL.RE.FIRPTA.WITHHOLDING.v1` (FIRPTA Withholding).

**Required inputs:** `amount_realized_cents`, `seller_foreign_person`

Computes FIRPTA withholding rate, amount, residence exception path, and form timing from supplied transaction facts.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M170 — 1031 like-kind exchange timing

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G30

**Deal contexts.** real estate exchange

## Computation

45-day/180-day timing, identification rules, and boot recognition.

## Authorities

- IRC 1031

## Reference implementation

Implemented as `MODEL.RE.1031.TIMING.v1` (1031 Exchange Timing).

**Required inputs:** `transfer_date`, `relinquished_property_value_cents`, `replacement_property_value_cents`

Computes 45-day identification and 180-day exchange deadlines plus boot/value-shortfall recognition floor.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M171 — Sale-leaseback and ASC 842

**Boundary classification.** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G30

**Deal contexts.** OpCo/PropCo · sale-leaseback

## Computation

Cap rate, residual value, and finance-versus-operating classification scaffold.

## Authorities

- ASC 842

## Reference implementation

Implemented as `MODEL.RE.SALE_LEASEBACK.ASC842.v1` (Sale-Leaseback / ASC 842 Mechanics).

**Required inputs:** `sale_price_cents`, `annual_rent_cents`, `lease_term_years`

Computes sale-leaseback cap rate, nominal rent burden, and ASC 842 finance-lease indicator flags from supplied facts.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M172 — REIT 75/75/90 compliance triad

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G30

**Deal contexts.** REIT M&A

## Computation

Income, asset, and distribution compliance tests.

## Authorities

- IRC 856-860

## Reference implementation

Implemented as `MODEL.RE.REIT.COMPLIANCE.v1` (REIT 75/75/90 Compliance Triad).

**Required inputs:** `real_estate_income_cents`, `total_income_cents`, `real_estate_assets_cents`, `total_assets_cents`, `distributions_cents`, `taxable_income_cents`

Checks REIT income, asset, and distribution percentages against 75/75/90 threshold mechanics.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M173 — Project-finance coverage suite

**Boundary classification.** Research scaffold — organizes authorities and considerations; not an executable determination.

**Lineage.** Research addition (internal lineage v1.2).

**Gates.** G30

**Deal contexts.** project finance · infrastructure

## Computation

DSCR, LLCR, PLCR, and concession-model scaffold.

## Authorities

- project-finance market practice

## Reference implementation

Implemented as `MODEL.PROJECT_FINANCE.COVERAGE_RESEARCH.v1` (Project Finance Coverage Research Scaffold).

**Required inputs:** `cfads_periods_cents`, `debt_service_periods_cents`, `debt_balance_cents`, `remaining_project_cash_flow_cents`

Computes DSCR periods, min/average DSCR, LLCR, PLCR, and lender model review flag.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M174 — Crypto token taxonomy

**Boundary classification.** Research scaffold — organizes authorities and considerations; not an executable determination.

**Lineage.** Research addition (internal lineage v1.2).

**Gates.** G30

**Deal contexts.** crypto M&A

## Computation

Howey and Project Crypto classification scaffold.

## Authorities

- SEC Project Crypto
- Howey

## Reference implementation

Implemented as `MODEL.CRYPTO.TOKEN_TAXONOMY.RESEARCH.v1` (Crypto Token Taxonomy Research Scaffold).

**Required inputs:** `investment_of_money`, `common_enterprise`, `expectation_of_profits`, `efforts_of_others`

Computes Howey prong count, securities-law review flag, and Project Crypto pending-rulemaking flag.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M175 — GENIUS Act stablecoin PPS test

**Boundary classification.** Research scaffold — organizes authorities and considerations; not an executable determination.

**Lineage.** Research addition (internal lineage v1.2).

**Gates.** G30

**Deal contexts.** stablecoin issuer

## Computation

Permitted payment stablecoin framework scaffold.

## Authorities

- GENIUS Act

## Reference implementation

Implemented as `MODEL.CRYPTO.STABLECOIN_PPS.RESEARCH.v1` (GENIUS Act Stablecoin PPS Research Scaffold).

**Required inputs:** `issuer_type`, `reserves_cents`, `stablecoins_outstanding_cents`

Computes permitted issuer type, reserve coverage ratio, and reserve coverage satisfaction.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M176 — Digital-asset broker reporting

**Boundary classification.** Research scaffold — organizes authorities and considerations; not an executable determination.

**Lineage.** Research addition (internal lineage v1.2).

**Gates.** G30

**Deal contexts.** crypto M&A

## Computation

Broker-reporting and data-field scaffold.

## Authorities

- IRC 6045
- T.D. 10000
- Form 1099-DA

## Reference implementation

Implemented as `MODEL.CRYPTO.BROKER_REPORTING.RESEARCH.v1` (Digital-Asset Broker Reporting Research Scaffold).

**Required inputs:** `gross_proceeds_cents`, `customer_tin_collected`

Computes likely Form 1099-DA reporting status and missing reporting data flags.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M177 — LP-secondary plus ECI withholding

**Boundary classification.** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.

**Lineage.** Added in internal lineage v1.1.

**Gates.** G26, G30

**Deal contexts.** LP secondary

## Computation

PSA, tri-party transfer, and withholding scaffold.

## Authorities

- IRC 1446(f)
- ILPA guidance

## Reference implementation

Implemented as `MODEL.SECONDARIES.LP_ECI.v1` (LP Secondary and ECI Withholding).

**Required inputs:** `purchase_price_cents`, `seller_foreign_person`

Computes 1446(f) default withholding, PSA requirement, tri-party transfer requirement, and tax specialist handoff flag.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M178 — Strip-sale pricing

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Added in internal lineage v1.1.

**Gates.** G26, G30

**Deal contexts.** strip sale

## Computation

Proportionate interest pricing and retained-exposure schedule.

## Authorities

- market practice

## Reference implementation

Implemented as `MODEL.SECONDARIES.STRIP_SALE.v1` (Strip Sale Pricing).

**Required inputs:** `fund_nav_cents`, `strip_percentage`, `sale_price_cents`

Computes sold NAV, retained NAV, implied total value, and discount or premium to fund NAV.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M179 — NAV facility LTV

**Boundary classification.** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.

**Lineage.** Added in internal lineage v1.1.

**Gates.** G26, G30

**Deal contexts.** NAV financing

## Computation

Loan-to-value, cushion, and collateral pool schedule.

## Authorities

- NAV facility market practice

## Reference implementation

Implemented as `MODEL.FINANCE.NAV_FACILITY.v1` (NAV Facility LTV).

**Required inputs:** `fund_nav_cents`, `loan_amount_cents`

Computes fund NAV LTV, cushion, required cushion, and lender-handoff flag.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M180 — Convertible and SAFE conversion

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G15, G29

**Deal contexts.** convertible · SAFE

## Computation

Cap, discount, pre/post-money, and if-converted math.

## Authorities

- YC SAFE
- market practice

## Reference implementation

Implemented as `MODEL.FINANCE.CONVERTIBLE_SAFE.v1` (Convertible / SAFE Conversion).

**Required inputs:** `investment_cents`, `priced_round_share_price_cents`

Computes conversion price and converted shares using priced-round price, discount, and valuation-cap mechanics.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M181 — Venture-debt warrant coverage

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Added in internal lineage v1.1.

**Gates.** G15, G29

**Deal contexts.** venture debt

## Computation

Warrant coverage, exercise price, and lender IRR.

## Authorities

- venture-debt market practice

## Reference implementation

Implemented as `MODEL.FINANCE.VENTURE_DEBT_WARRANT.v1` (Venture-Debt Warrant Coverage).

**Required inputs:** `loan_amount_cents`, `warrant_coverage_pct`, `exercise_price_cents`, `fair_value_share_price_cents`

Computes warrant coverage amount, shares, intrinsic warrant value, simple interest, gross return, and estimated lender IRR.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M182 — ABL borrowing base

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G15, G29

**Deal contexts.** ABL

## Computation

Eligible A/R and inventory advance-rate calculation.

## Authorities

- ABL market practice

## Reference implementation

Implemented as `MODEL.FINANCE.ABL.BORROWING_BASE.v1` (ABL Borrowing Base).

**Required inputs:** `eligible_ar_cents`, `eligible_inventory_cents`

Computes eligible A/R and inventory advance amounts, reserves, and net borrowing-base availability.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M183 — Make-whole and call protection

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G15, G29

**Deal contexts.** high-yield bonds · term loans

## Computation

Treasury-plus-spread make-whole and call schedule.

## Authorities

- indenture practice

## Reference implementation

Implemented as `MODEL.FINANCE.MAKE_WHOLE_CALL.v1` (Make-Whole and Call Protection).

**Required inputs:** `principal_cents`, `coupon_rate`, `treasury_rate`, `spread_bps`, `remaining_years`

Computes a treasury-plus-spread make-whole amount and compares it to stated call-price economics.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M184 — Covenant basket engine

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G15, G29

**Deal contexts.** credit agreement

## Computation

Restricted payment, debt, lien, and investment basket capacity.

## Authorities

- LSTA model provisions

## Reference implementation

Implemented as `MODEL.FINANCE.COVENANT_BASKETS.v1` (Covenant Basket Engine).

**Required inputs:** `baskets`

Computes fixed, grower, builder, ratio, used, and remaining basket capacity across credit-agreement baskets.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M185 — 280G golden parachute

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G15

**Deal contexts.** M&A executive compensation

## Computation

Three-times base amount, excise-tax, deduction, and cleansing-vote math.

## Authorities

- IRC 280G

## Reference implementation

Implemented as `MODEL.TAX.280G.PARACHUTE.v1` (280G Golden Parachute).

**Required inputs:** `base_amount_cents`, `parachute_payments_cents`

Computes three-times-base trigger, excess parachute payment, 20 percent excise tax, lost deduction, and shareholder-cleansing threshold.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M186 — 382 NOL limitation

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G15

**Deal contexts.** NOL target

## Computation

Long-term tax-exempt rate times loss-corporation value.

## Authorities

- IRC 382

## Reference implementation

Implemented as `MODEL.TAX.382.NOL_LIMIT.v1` (382 NOL Limitation).

**Required inputs:** `loss_corporation_value_cents`, `long_term_tax_exempt_rate`

Computes annual Section 382 limitation as loss-corporation value times the long-term tax-exempt rate.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M187 — RE-heavy asset-vs-entity election

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G30, G2

**Deal contexts.** real estate M&A

## Computation

Asset-deal step-up, entity-deal basis, transfer-tax incidence, debt assumability, and in-place lease treatment.

## Authorities

- IRC 1001
- IRC 1060
- IRC 197

## Reference implementation

Implemented as `MODEL.RE.ASSET_ENTITY.ELECTION.v1` (RE-Heavy Asset-vs-Entity Election).

**Required inputs:** `enterprise_value_cents`, `real_property_value_cents`

Computes real-estate percentage of EV, asset/entity basis paths, step-up, transfer tax, debt assumability, and lease treatment flags.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M188 — RE/operating-business purchase price bifurcation

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G30, G2

**Deal contexts.** real estate M&A · operating business with real property

## Computation

NOI/cap-rate real-estate value, residual operating-business value, and 1060 Class V/VI/VII reconciliation.

## Authorities

- Treas. Reg. 1.338-6
- IRS Form 8594

## Reference implementation

Implemented as `MODEL.RE.OPBUS.BIFURCATION.v1` (RE / Operating Business Bifurcation).

**Required inputs:** `enterprise_value_cents`, `noi_cents`, `cap_rate`

Bifurcates enterprise value into NOI/cap-rate real estate value, operating-business residual, and Form 8594 Class V/VI/VII reconciliation.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M189 — Rent-roll normalization engine

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G30

**Deal contexts.** real estate diligence

## Computation

Occupancy, WALT, expiry buckets, tenant concentration, market-rent delta, and stabilized rent.

## Authorities

- real estate industry practice

## Reference implementation

Implemented as `MODEL.RE.RENT_ROLL.NORMALIZE.v1` (Rent Roll Normalization).

**Required inputs:** `rent_roll`

Normalizes rent roll into occupancy, WALT, rent, and tenant-concentration metrics.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M190 — NOI normalization and cap-rate bridge

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G30

**Deal contexts.** real estate valuation

## Computation

Effective gross income less operating expenses to NOI, value equals NOI divided by cap rate, and implied cap rate. Market cap rate is pass-through input.

## Authorities

- Appraisal Institute practice

## Reference implementation

Implemented as `MODEL.RE.NOI.CAP_RATE_BRIDGE.v1` (NOI Normalization and Cap-Rate Bridge).

**Required inputs:** `effective_gross_income_cents`, `operating_expenses_cents`, `cap_rate`

Computes normalized NOI, cap-rate value, implied cap rate, and pass-through market-rate dependency from supplied inputs.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M191 — Real estate transfer and controlling-interest tax

**Boundary classification.** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.

**Lineage.** Added in internal lineage v1.1.

**Gates.** G30, G19

**Deal contexts.** real estate M&A

## Computation

Jurisdictional CITT tax base, rate, aggregation window, and exemption checks. Contested state positions route to specialist review.

## Authorities

- CT 12-638
- MD Tax-Prop 12-117
- WA RCW 82.45
- NY Publication 576

## Reference implementation

Implemented as `MODEL.RE.CITT.TRANSFER_TAX.v1` (Real Estate Transfer and CITT Engine).

**Required inputs:** `jurisdiction`, `fmv_real_property_cents`, `interest_transferred_pct`

Computes real-property transfer or controlling-interest tax base, rate, aggregation window, exemption, and specialist handoff flag.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M192 — CAM reconciliation mechanics

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G30

**Deal contexts.** commercial real estate diligence

## Computation

Gross-up, base-year, expense-stop, pro-rata share, and closing-date true-up.

## Authorities

- BOMA
- real estate industry practice

## Reference implementation

Implemented as `MODEL.RE.CAM.TRUEUP.v1` (CAM Reconciliation True-Up).

**Required inputs:** `recoverable_expenses_cents`

Computes tenant pro-rata recoverable expense share and closing-date CAM true-up.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M193 — Lease abstraction schema

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G30

**Deal contexts.** lease diligence

## Computation

Structured capture of critical lease fields without interpreting legal enforceability.

## Authorities

- lease abstraction industry practice

## Reference implementation

Implemented as `MODEL.RE.LEASE_ABSTRACTION.v1` (Lease Abstraction Schema).

**Required inputs:** `leases`

Normalizes supplied lease facts into WALT, rent, consent, option, exclusive-use, co-tenancy, and go-dark fields without legal interpretation.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M194 — OpCo/PropCo separation mechanics

**Boundary classification.** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.

**Lineage.** Added in internal lineage v1.1.

**Gates.** G30, G2

**Deal contexts.** OpCo/PropCo · sale-leaseback

## Computation

Bifurcated balance sheet, intercompany lease, interest limitation, and recharacterization-risk threshold schedule.

## Authorities

- IRC 163(j)
- IRC 856
- ASC 842

## Reference implementation

Implemented as `MODEL.RE.OPCO_PROPCO.SEPARATION.v1` (OpCo/PropCo Separation Mechanics).

**Required inputs:** `real_property_value_cents`, `target_cap_rate`, `opco_ebitda_cents`

Computes master lease rent, rent yield, OpCo EBITDA after rent, and tax/accounting review flags.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M195 — Property-level escrow and holdback sizing

**Boundary classification.** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G30

**Deal contexts.** real estate diligence

## Computation

Issue-specific escrow sizing for environmental, PCA, title, tenant, and cost-to-cure inputs.

## Authorities

- ALTA endorsements
- real estate practice norms

## Reference implementation

Implemented as `MODEL.RE.PROPERTY_ESCROW.HOLDBACK.v1` (Property-Level Escrow and Holdback Sizing).

**Required inputs:** `issues`

Computes environmental, PCA, title, tenant, cost-to-cure, and other property-specific escrow buckets from supplied issue costs.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M196 — Title and survey process checklist

**Boundary classification.** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G30

**Deal contexts.** real estate closing

## Computation

Title commitment, Schedule B-II, survey, policy, endorsement, curative-plan, and closing-protection sequencing.

## Authorities

- ALTA forms
- state title statutes

## Reference implementation

Implemented as `MODEL.RE.TITLE_SURVEY.CHECKLIST.v1` (Title and Survey Process Checklist).

**Required inputs:** `title_commitment_received`, `survey_received`

Computes title/survey process status, Schedule B exception counts, endorsements, curative items, and closing-protection requirements.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M197 — Ground lease vs. fee simple mechanics

**Boundary classification.** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.

**Lineage.** Added in internal lineage v1.1.

**Gates.** G30

**Deal contexts.** ground lease · real estate financing

## Computation

Remaining term, rent reset, reversion, leasehold mortgageability, cure rights, and financeability flag.

## Authorities

- lender practice norms

## Reference implementation

Implemented as `MODEL.RE.GROUND_LEASE.MECHANICS.v1` (Ground Lease Mechanics).

**Required inputs:** `ground_lease_expiry_date`, `loan_maturity_date`, `annual_ground_rent_cents`

Computes remaining ground-lease tail after loan maturity, lender tail requirement, and leasehold mortgageability flag.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M198 — PCA reserve modeling

**Boundary classification.** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G30

**Deal contexts.** property condition assessment

## Computation

PCA-driven one-, five-, and twelve-year reserves plus immediate-repair escrow from pass-through report inputs.

## Authorities

- ASTM E2018
- lender practice

## Reference implementation

Implemented as `MODEL.RE.PCA.RESERVES.v1` (PCA Reserve Modeling).

**Required inputs:** `pca_items`

Structures pass-through PCA report items into immediate repair escrow and 1/3, 4/5, and 6/12-year reserve buckets.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M199 — FIRPTA withholding v1.1

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G15, G30

**Deal contexts.** real estate M&A · foreign seller

## Computation

FIRPTA 15 percent default, residence exemption/reduced rate, 20-day filing, reduced-withholding certificate, and 1031 timing interaction.

## Authorities

- IRC 897
- IRC 1445
- Forms 8288
- Forms 8288-A
- Form 8288-B

## Reference implementation

Implemented as `MODEL.RE.FIRPTA.WITHHOLDING.V11.v1` (FIRPTA Withholding v1.1).

**Required inputs:** `amount_realized_cents`, `seller_foreign_person`

Computes FIRPTA withholding ladder, 8288 due date, 8288-B reduced certificate timing, and 1031 timing-gap flag.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M200 — Transaction tax master engine

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G2, G19

**Deal contexts.** asset deal · stock deal · merger · rollover

## Computation

Integrated buyer basis, seller tax, seller after-tax proceeds, gross-up gap, and fired sub-model schedule.

## Authorities

- IRC 1001
- IRC 338
- IRC 336
- IRC 351
- IRC 368
- IRC 721
- IRC 1060

## Reference implementation

Implemented as `MODEL.TAX.TRANSACTION.MASTER.v1` (Transaction Tax Master Engine).

**Required inputs:** `seller_entity_type`, `deal_form`, `purchase_price_cents`

Integrates entity type, deal form, consideration mix, basis, tax rates, buyer basis, seller tax, after-tax proceeds, gross-up gap, and fired tax sub-models.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M201 — 338(h)(10) and 336(e) gross-up math

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G2

**Deal contexts.** S-corp sale · deemed asset sale

## Computation

Seller asset-treatment tax delta, buyer step-up benefit, and breakeven gross-up.

## Authorities

- IRC 338(h)(10)
- IRC 336(e)
- Treas. Reg. 1.336-2

## Reference implementation

Implemented as `MODEL.TAX.GROSSUP.338_336.v1` (338(h)(10) / 336(e) Gross-Up Math).

**Required inputs:** `seller_tax_delta_cents`, `seller_marginal_tax_rate`

Computes seller tax delta, breakeven gross-up, buyer step-up PV benefit, and 336(e) 80%-within-12-month window flag.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M202 — 1374 built-in gains tax

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G2

**Deal contexts.** S-corp former C-corp

## Computation

Net unrealized built-in gain, five-year recognition-period cap, corporate tax, taxable-income limitation, and installment-sale treatment.

## Authorities

- IRC 1374
- PATH Act 2015

## Reference implementation

Implemented as `MODEL.TAX.BIG.1374.v1` (1374 Built-In Gains Tax).

**Required inputs:** `fmv_at_conversion_cents`, `basis_at_conversion_cents`, `conversion_date`, `sale_date`, `recognized_gain_cents`

Computes NUBIG, five-year recognition-period status, recognized BIG tax base, and federal corporate-level tax.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M203 — Transaction cost capitalization

**Boundary classification.** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G2

**Deal contexts.** transaction tax

## Computation

Bright-line date, inherently facilitative costs, success-based fee 70/30 safe harbor, and PE-owned target risk flag.

## Authorities

- IRC 195
- IRC 263
- Treas. Reg. 1.263(a)-5
- Rev. Proc. 2011-29
- INDOPCO
- Letter Ruling 202308010

## Reference implementation

Implemented as `MODEL.TAX.TRANSACTION_COSTS.v1` (Transaction Cost Capitalization).

**Required inputs:** `transaction_costs`, `bright_line_date`

Classifies transaction costs under bright-line, inherently facilitative, success-based fee safe harbor, capitalization, deduction, and Section 195 amortization buckets.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M204 — Imputed interest, OID, and 453A

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G2

**Deal contexts.** seller note · installment sale · earnout

## Computation

AFR-based imputed interest, OID, contingent-payment characterization, and installment receivable interest charge.

## Authorities

- IRC 483
- IRC 1274
- IRC 1274A
- IRC 453A

## Reference implementation

Implemented as `MODEL.TAX.IMPUTED_INTEREST_OID.v1` (Imputed Interest / OID / 453A).

**Required inputs:** `principal_cents`, `stated_interest_rate`, `afr_rate`, `term_months`

Computes AFR shortfall, imputed interest/OID floor, and Section 453A installment receivable threshold exposure.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M205 — SALT transaction engine

**Boundary classification.** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.

**Lineage.** Added in internal lineage v1.1.

**Gates.** G2, G19

**Deal contexts.** transaction tax · state tax

## Computation

State apportionment, bulk-sale compliance, successor-liability clearances, sales/use tax, and payroll-tax successor elections.

## Authorities

- UDITPA
- state nexus statutes
- bulk-sale acts

## Reference implementation

Implemented as `MODEL.TAX.SALT_TRANSACTION.v1` (SALT Transaction Engine).

**Required inputs:** `gain_cents`, `state_apportionment_pct`

Computes apportioned gain, state income tax, sales/use tax, bulk-sale clearance flag, and SALT specialist handoff.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M206 — Indemnification ladder engine

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G1, G8

**Deal contexts.** purchase agreement economics

## Computation

Cap, basket, materiality scrape, sandbagging, carve-out, and deal-size-band math.

## Authorities

- ABA Private Target Deal Points Study 2023
- ABA Model SPA

## Reference implementation

Implemented as `MODEL.LEGAL.INDEMNITY.LADDER.v1` (Indemnification Ladder).

**Required inputs:** `transaction_value_cents`

Computes indemnity cap, basket, fundamental cap, scrape default, and carve-out framing from deal value and RWI facts.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M207 — Survival period engine

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G1, G8

**Deal contexts.** purchase agreement economics

## Computation

General, fundamental, tax, fraud, and exclusive-remedy survival schedule.

## Authorities

- SRS Acquiom 2024
- SRS Acquiom 2025
- ABA Private Target Deal Points Study 2023

## Reference implementation

Implemented as `MODEL.LEGAL.SURVIVAL.PERIODS.v1` (Survival Period Engine).

**Required inputs:** `closing_date`

Computes general, fundamental, tax, and fraud survival period dates from closing date and RWI facts.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M208 — Escrow and holdback sizing

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G8

**Deal contexts.** purchase agreement economics

## Computation

General indemnity, RWI, PPA, special-purpose, and aggregate escrow sizing.

## Authorities

- SRS Acquiom Deal Terms Study 2024
- SRS Acquiom Deal Terms Study 2025
- ABA Private Target Deal Points Study 2023

## Reference implementation

Implemented as `MODEL.LEGAL.ESCROW.HOLDBACK.v1` (Escrow and Holdback Sizing).

**Required inputs:** `transaction_value_cents`

Computes general indemnity escrow, PPA escrow, special escrows, and aggregate holdback sizing.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M209 — RWI stack architecture

**Boundary classification.** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.

**Lineage.** Added in internal lineage v1.1.

**Gates.** G8

**Deal contexts.** insured M&A

## Computation

Retention, tower size, excess layers, exclusions, and seller-indemnity interaction.

## Authorities

- ABA Private Target Deal Points Study 2023
- Marsh RWI reports
- Aon RWI reports
- Lockton RWI reports

## Reference implementation

Implemented as `MODEL.LEGAL.RWI_STACK.v1` (RWI Stack Architecture).

**Required inputs:** `enterprise_value_cents`

Computes retention, primary and excess tower limit, seller indemnity cap, exclusion count, and broker handoff flag.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M210 — Closing-statement true-up sequence

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G7

**Deal contexts.** working capital true-up

## Computation

Estimated statement, buyer approval, actual statement, dispute notice, negotiation, and accounting-arbitrator timeline.

## Authorities

- SRS Acquiom Working Capital PPA Study
- ABA Private Target Deal Points Study 2023

## Reference implementation

Implemented as `MODEL.LEGAL.CLOSING_TRUEUP.SEQUENCE.v1` (Closing Statement True-Up Sequence).

**Required inputs:** `closing_date`, `peg_cents`, `actual_nwc_cents`

Computes working-capital true-up economics and the actual statement, dispute notice, and negotiation timeline.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M211 — Conditions-to-close logic engine

**Boundary classification.** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G6, G7

**Deal contexts.** purchase agreement conditions

## Computation

Bring-down, MAE, financing, marketing-period, regulatory approval, third-party consent, and condition node logic.

## Authorities

- ABA Model SPA
- HSR Act
- CFIUS regulations

## Reference implementation

Implemented as `MODEL.LEGAL.CONDITIONS.LOGIC.v1` (Conditions-to-Close Logic).

**Required inputs:** `conditions`

Computes condition-node satisfaction, waiver, open blockers, closing readiness, and professional-review flags.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M212 — Termination and break/reverse-break fee engine

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G7

**Deal contexts.** public M&A · private M&A termination

## Computation

Break-up, reverse break-up, antitrust reverse break-up, fiduciary-out, go-shop, ticking-fee, drag, and tag economics.

## Authorities

- Houlihan Lokey 2023 Transaction Termination Fee Study
- Fenwick 2023 ARBF analysis
- Brazen v. Bell Atlantic
- In re Topps

## Reference implementation

Implemented as `MODEL.LEGAL.TERMINATION.FEES.v1` (Termination and Break Fee Economics).

**Required inputs:** `transaction_value_cents`

Computes target break-up fee, go-shop discounted fee, reverse termination fee, and antitrust reverse fee from transaction value.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M213 — Earnout architecture and dispute

**Boundary classification.** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.

**Lineage.** Added in internal lineage v1.1.

**Gates.** G9

**Deal contexts.** earnout

## Computation

EBITDA-definition lock, acceleration triggers, post-closing covenants, dispute forum, and tax-characterization selector.

## Authorities

- SRS Acquiom Earnout data
- IRC 453
- IRC 483
- IRC 1274
- ABA earnout reports

## Reference implementation

Implemented as `MODEL.LEGAL.EARNOUT_ARCHITECTURE.v1` (Earnout Architecture and Dispute).

**Required inputs:** `earnout_value_cents`, `metrics`

Computes earnout metrics, acceleration triggers, covenant count, dispute forum, and tax/counsel handoff.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M214 — IP chain-of-title verification

**Boundary classification.** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G10

**Deal contexts.** IP diligence

## Computation

USPTO, trademark, copyright, employee, contractor, and intervening assignment sequence.

## Authorities

- 35 U.S.C. 261
- Lanham Act 10
- 17 U.S.C. 205
- Clorox v. Chemical Bank

## Reference implementation

Implemented as `MODEL.IP.CHAIN_OF_TITLE.v1` (IP Chain-of-Title Verification).

**Required inputs:** `assets`

Computes assignment-chain, recording, contributor-assignment, and ITU-assignment risk counts from supplied IP asset facts.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M215 — IP encumbrance and lien search

**Boundary classification.** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G10

**Deal contexts.** IP diligence · secured financing

## Computation

UCC, USPTO security agreement, and copyright office lien-search tracks.

## Authorities

- UCC Article 9
- 17 U.S.C. 205
- In re Peregrine
- Rhone-Poulenc Agro v. DeKalb

## Reference implementation

Implemented as `MODEL.IP.ENCUMBRANCE_LIEN_SEARCH.v1` (IP Encumbrance and Lien Search).

**Required inputs:** `searches`

Computes UCC, USPTO, and Copyright Office hit counts and release requirements from pass-through lien-search outputs.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M216 — License in/out dependency map

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G10

**Deal contexts.** IP diligence

## Computation

Material license parties, scope, exclusivity, royalty, term, termination, change-of-control, sublicensing, and consent dependencies.

## Authorities

- IP licensing industry practice

## Reference implementation

Implemented as `MODEL.IP.LICENSE.DEPENDENCY.v1` (License In/Out Dependency Map).

**Required inputs:** `licenses`

Computes inbound/outbound license counts, annual royalty, change-of-control consent, termination, sublicensing, and dependency flags.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M217 — Standard IP representation set

**Boundary classification.** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G1, G10

**Deal contexts.** IP purchase agreement

## Computation

Industry-scaled IP rep checklist and schedule structure for counsel drafting.

## Authorities

- ABA Model SPA IP representations

## Reference implementation

Implemented as `MODEL.IP.REPRESENTATION_SET.v1` (Standard IP Representation Set).

**Required inputs:** `deal_type`, `material_ip_categories`

Computes an industry-scaled IP representation and schedule set for counsel drafting without drafting clause language.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M218 — Carve-out and license-back mechanics

**Boundary classification.** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.

**Lineage.** Added in internal lineage v1.1.

**Gates.** G10

**Deal contexts.** carve-out · IP license-back

## Computation

Assigned IP, transition license, perpetual license-back, and TSA-IP overlay.

## Authorities

- IP carve-out practice norms

## Reference implementation

Implemented as `MODEL.IP.CARVEOUT_LICENSE_BACK.v1` (Carve-Out and License-Back Mechanics).

**Required inputs:** `ip_assets`

Computes assigned, licensed-to-buyer, licensed-back-to-seller, transition-license, and TSA-IP overlay counts.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M219 — Source-code and IP escrow mechanics

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G10

**Deal contexts.** software M&A

## Computation

Release triggers, deposit verification tier, and update schedule.

## Authorities

- Escode
- Codekeeper
- Iron Mountain escrow templates

## Reference implementation

Implemented as `MODEL.IP.SOURCE_CODE_ESCROW.v1` (Source-Code and IP Escrow Mechanics).

**Required inputs:** `release_triggers`, `deposit_verification_tier`

Computes release trigger count, deposit verification tier, build/run-test flags, and next deposit due date.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M220 — Employee IP assignment verification

**Boundary classification.** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G10

**Deal contexts.** IP diligence

## Computation

Contributor-by-contributor assignment and work-for-hire verification with state enforceability flag.

## Authorities

- California Labor Code 2870
- state employee-IP statutes

## Reference implementation

Implemented as `MODEL.IP.EMPLOYEE_ASSIGNMENT.VERIFICATION.v1` (Employee IP Assignment Verification).

**Required inputs:** `contributors`

Computes contributor assignment, work-for-hire, and state carve-out flags from supplied contributor records.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M221 — OSS exposure diligence process

**Boundary classification.** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G10

**Deal contexts.** software M&A · OSS diligence

## Computation

SCA pass-through, permissive/weak/strong copyleft classification, AGPL SaaS flag, indemnity carve-out, and escrow sizing.

## Authorities

- GPL
- AGPL
- LGPL
- MIT
- Apache
- BSD
- Morgan Lewis OSS guidance
- Nixon Peabody OSS guidance
- Morse OSS guidance

## Reference implementation

Implemented as `MODEL.IP.OSS.EXPOSURE.v1` (OSS Exposure Diligence Process).

**Required inputs:** `components`

Classifies OSS components by license family and computes AGPL, strong-copyleft, indemnity, and remediation escrow flags.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M222 — IP-specific 1060 allocation

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G2, G10

**Deal contexts.** IP-heavy acquisition

## Computation

Class V/VI/VII sub-allocation and residual-method cap ordering for IP-heavy deals.

## Authorities

- IRC 1060
- Treas. Reg. 1.338-6(b)
- Treas. Reg. 1.1060-1
- IRS Form 8594

## Reference implementation

Implemented as `MODEL.IP.1060.ALLOCATION.v1` (IP-Specific 1060 Allocation).

**Required inputs:** `purchase_price_cents`, `tangible_assets_cents`, `ip_intangibles_cents`

Allocates IP-heavy purchase price across Class V tangible assets, Class VI IP intangibles, and Class VII goodwill/going concern.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M223 — Domain and trademark transfer mechanics

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Core (since spec v1.0 internal lineage).

**Gates.** G10

**Deal contexts.** domain transfer · trademark transfer

## Computation

Registrar auth-code, 60-day lock, trademark assignment recording, state trademark, social-handle, and SSL transfer steps.

## Authorities

- ICANN transfer rules
- USPTO Form PTO-1594

## Reference implementation

Implemented as `MODEL.IP.DOMAIN_TM.TRANSFER.v1` (Domain and Trademark Transfer Mechanics).

**Required inputs:** `transfer_assets`

Computes domain auth-code, ICANN lock, USPTO assignment, state trademark, social-handle, and SSL transfer counts.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M224 — Recording-act and priority engine

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Added in internal lineage v1.2 (real property & contract law layer).

**Gates.** G30

**Deal contexts.** real estate M&A · title diligence

## Computation

State-typed race/notice/race-notice priority ordering from recording and notice facts; DE pure race, NY/CA race-notice, TX notice; unknown states defer with a table-gap flag.

## Authorities

- N.Y. Real Prop. Law 291
- Cal. Civ. Code 1214
- Tex. Prop. Code 13.001
- 25 Del. C. 153

## Reference implementation

Implemented as `MODEL.RE.RECORDING_PRIORITY.v1` (Recording-Act Priority Engine).

**Required inputs:** `state`, `later_purchaser_for_value`, `later_took_without_notice`, `later_recorded_first`

State-typed (race/notice/race-notice) priority ordering between a prior interest and a later purchaser from recording and notice facts; unknown states defer with a table-gap flag.

## Notes

V18c #1 (was M154 in the pass).

> **DRAFT — internal review build. Not yet published; do not cite.**


# M225 — Title-covenant and estate/signatory model

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Added in internal lineage v1.2 (real property & contract law layer).

**Gates.** G30

**Deal contexts.** real estate M&A · title diligence

## Computation

Deed-type to covenant-set map (six covenants; after-acquired title), TX seisin narrowing, and the concurrent-ownership signatory matrix incl. tenancy-by-entirety both-spouses rule.

## Authorities

- Common-law deed covenants
- Tex. Prop. Code 5.023

## Reference implementation

Implemented as `MODEL.RE.TITLE_COVENANT_SIGNATORY.v1` (Title Covenant & Estate/Signatory Model).

**Required inputs:** `deed_type`, `vesting_form`

Deed-type to covenant-set mapping (present/future covenants, after-acquired title) plus the concurrent-ownership signature matrix with missed-signatory red flags.

## Notes

V18c #2 (was M155).

> **DRAFT — internal review build. Not yet published; do not cite.**


# M226 — Marketability triage

**Boundary classification.** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.

**Lineage.** Added in internal lineage v1.2 (real property & contract law layer).

**Gates.** G30

**Deal contexts.** title diligence

## Computation

Curable / insurable-over / deal-killing bucketing of title exceptions; insurable-only contract-standard flag; any deal-killer is a hard defer — the marketability judgment is never emitted.

## Authorities

- Marketable-title common law
- ALTA title practice

## Reference implementation

Implemented as `MODEL.RE.MARKETABILITY_TRIAGE.v1` (Marketability Triage).

**Required inputs:** `exceptions`

Buckets title exceptions curable / insurable-over / deal-killing and flags insurable-only contract standards; any deal-killer routes to counsel — the marketability judgment is never emitted.

## Notes

V18c #3 (was M156).

> **DRAFT — internal review build. Not yet published; do not cite.**


# M227 — Risk-of-loss allocator

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Added in internal lineage v1.2 (real property & contract law layer).

**Gates.** G30

**Deal contexts.** real estate purchase agreement

## Computation

Contract-override detection plus state default lookup: NY Risk Act seller-risk, CA/TX UVPRA, common-law equitable-conversion buyer-risk.

## Authorities

- N.Y. Gen. Oblig. Law 5-1311
- Tex. Prop. Code 5.007
- Cal. Civ. Code 1662
- equitable conversion

## Reference implementation

Implemented as `MODEL.RE.RISK_OF_LOSS.v1` (Risk-of-Loss Allocator).

**Required inputs:** `state`, `contract_allocates_risk`

Contract-override detection plus the state default lookup (NY Risk Act / UVPRA / equitable conversion) for casualty risk between signing and closing.

## Notes

V18c #4 (was M157).

> **DRAFT — internal review build. Not yet published; do not cite.**


# M228 — Survival and merger tracker

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Added in internal lineage v1.2 (real property & contract law layer).

**Gates.** G30

**Deal contexts.** real estate purchase agreement · M&A closing

## Computation

Flags every relied-on rep/indemnity/covenant lacking an express survival hook or collateral character — merger extinguishes it at closing; fraud exception noted.

## Authorities

- merger doctrine (common law)

## Reference implementation

Implemented as `MODEL.RE.SURVIVAL_MERGER.v1` (Survival/Merger Tracker).

**Required inputs:** `items`

Flags every relied-on rep, indemnity, or covenant lacking an express survival hook or collateral character — merger extinguishes it at closing; fraud exception noted.

## Notes

V18c #5 (was M158).

> **DRAFT — internal review build. Not yet published; do not cite.**


# M229 — Lease anti-assignment and change-of-control parser

**Boundary classification.** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.

**Lineage.** Added in internal lineage v1.2 (real property & contract law layer).

**Gates.** G30

**Deal contexts.** OpCo/PropCo · entity deal with leases

## Computation

Deemed-assignment detection for control transfers, consent-standard classification against the state table (CA Kendall reasonableness vs. NY as-written), recapture interplay; enforceability always routes.

## Authorities

- Kendall v. Ernest Pestana 40 Cal.3d 488
- NY assignment common law

## Reference implementation

Implemented as `MODEL.RE.LEASE_COC_ASSIGNMENT.v1` (Lease Anti-Assignment / Change-of-Control Parser).

**Required inputs:** `transfer_type`, `consent_clause`

Classifies the consent path from parsed clause facts: deemed-assignment detection for control transfers, consent-standard classification against the state table (Kendall vs. NY as-written), recapture interplay.

## Notes

V18c #6 (was M159); ground-lease financeability lives in M198/MODEL.RE.GROUND_LEASE.MECHANICS.v1.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M230 — Due-on-sale screener

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Added in internal lineage v1.2 (real property & contract law layer).

**Gates.** G30

**Deal contexts.** real estate financing · entity deal with property debt

## Computation

Garn-St. Germain residential-under-5-units exception filter; commercial and entity transfers get no consumer protection — lender consent flagged as closing critical path.

## Authorities

- 12 U.S.C. 1701j-3

## Reference implementation

Implemented as `MODEL.RE.DUE_ON_SALE.v1` (Due-on-Sale Screener).

**Required inputs:** `loan_has_due_on_transfer_clause`, `residential_under_5_units`

Garn-St. Germain residential-exception filter: consumer protections apply only under 5 residential units; commercial/entity transfers flag lender consent as the closing critical path.

## Notes

V18c #7 (was M160).

> **DRAFT — internal review build. Not yet published; do not cite.**


# M231 — Option/ROFR/ROFO trigger detector

**Boundary classification.** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.

**Lineage.** Added in internal lineage v1.2 (real property & contract law layer).

**Gates.** G30

**Deal contexts.** real estate M&A · entity deal

## Computation

Sale vs. entity-transfer trigger analysis in both directions — the sale that triggers the right and the entity structure that may avoid it; the legal conclusion always routes to counsel.

## Authorities

- ROFR/option common law
- TX strict-match construction

## Reference implementation

Implemented as `MODEL.RE.PREEMPTIVE_RIGHT_TRIGGER.v1` (Option/ROFR/ROFO Trigger Detector).

**Required inputs:** `right_type`, `transaction_form`, `right_captures_entity_transfers`

Sale vs. entity-transfer trigger analysis in BOTH directions — a sale that triggers the right and an entity structure that may avoid it; always routes the legal conclusion to counsel.

## Notes

V18c #8 (was M161).

> **DRAFT — internal review build. Not yet published; do not cite.**


# M232 — Controlling-interest transfer-tax and reassessment screener

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Added in internal lineage v1.2 (real property & contract law layer).

**Gates.** G30, G19

**Deal contexts.** entity deal · merger with real property

## Computation

The 50-percent entity screen: NY controlling-interest tax with 3-year aggregation, CA Prop 13 change-in-control 100-percent reassessment, TX constitutional prohibition, DE deed tax; step-transaction flag on mere-change claims.

## Authorities

- NYC Admin. Code 11-2101
- NY Tax Law 1405(b)(6)
- Cal. Rev. & Tax. Code 60-64
- Tex. Const. art. VIII 29
- Matter of 105-02 Forest Hills (2025)

## Reference implementation

Implemented as `MODEL.RE.CITT_REASSESSMENT_SCREEN.v1` (Controlling-Interest Transfer-Tax & Reassessment Screener).

**Required inputs:** `state`, `is_entity_transfer`, `transfer_pct`

The ≥50% entity-transfer screen (NY controlling interest, CA Prop 13 § 64 change-in-control, TX constitutional prohibition, DE deed tax) with aggregation and step-transaction flags; complements MODEL.RE.CITT.TRANSFER_TAX.v1.

## Notes

V18c #9 (was M162); complements M191.

> **DRAFT — internal review build. Not yet published; do not cite.**


# M233 — Permit/CO transferability and bulk-sales screener

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Added in internal lineage v1.2 (real property & contract law layer).

**Gates.** G30, G19

**Deal contexts.** asset deal · entity deal

## Computation

CO-on-transfer and use-change screens, non-transferable permit flags by deal form, CA/NY/NJ/PA bulk-sales tax-notification applicability, CERCLA successor flag.

## Authorities

- municipal CO ordinances
- UCC Art. 6 (as retained)
- CERCLA 107
- 72 P.S. 1403

## Reference implementation

Implemented as `MODEL.RE.PERMIT_CO_BULK_SALES.v1` (Permit/CO Transferability & Bulk-Sales Screener).

**Required inputs:** `deal_form`, `jurisdiction_requires_co_on_transfer`

CO-on-transfer and use-change screens, non-transferable permit flags by deal form, bulk-sales/tax-clearance state applicability, and CERCLA successor-liability flag.

## Notes

V18c #10 (was M163).

> **DRAFT — internal review build. Not yet published; do not cite.**


# M234 — Fixture classification and UCC 9-334 priority

**Boundary classification.** Deterministic computation — arithmetic and rule application on supplied facts.

**Lineage.** Added in internal lineage v1.2 (real property & contract law layer).

**Gates.** G30, G2

**Deal contexts.** asset deal with fixtures · equipment-heavy real estate

## Computation

Subsection (c) real-property default, the (d) PMSI 20-day fixture-filing exception, and the (h) construction-mortgage override, with PPA reconciliation note.

## Authorities

- UCC 9-334

## Reference implementation

Implemented as `MODEL.RE.FIXTURE_9334.v1` (Fixture Classification & UCC § 9-334 Priority).

**Required inputs:** `pmsi`, `fixture_filing_made`, `prior_recorded_real_property_interest`

UCC § 9-334 fixture priority: subsection (c) default to the real-property interest, the (d) PMSI 20-day fixture-filing exception, and the (h) construction-mortgage override, with PPA reconciliation note.

## Notes

V18c #11 (was M164).


---

> **DRAFT — internal review build. Not yet published; do not cite.**


# Anchor-State Law Tables — Real Property & Contract Law

Table version: `V18c.2026-07-16`. Anchor states DE / NY / CA / TX; other states are added as data rows. Where a state is not tabled, the specification's models emit a table-gap flag rather than guessing.

## Recording acts

| State | Type | Citation | Note |
|---|---|---|---|
| DE | race | 25 Del. C. § 153 | Pure race (with LA, NC): first to record wins even with actual notice of a prior conveyance. |
| NC | race | N.C. Gen. Stat. § 47-18 |  |
| LA | race | La. Civ. Code arts. 3338-3340 (public records doctrine) |  |
| NY | race-notice | N.Y. Real Prop. Law § 291 |  |
| CA | race-notice | Cal. Civ. Code § 1214 |  |
| TX | notice | Tex. Prop. Code § 13.001 | Notice state: a later BFP without notice prevails regardless of recording order. |

## Risk of loss between signing and closing

| State | Regime | Citation |
|---|---|---|
| NY | ny risk act seller | N.Y. Gen. Oblig. Law § 5-1311 |
| CA | uvpra seller | Cal. Civ. Code § 1662 (UVPRA) |
| TX | uvpra seller | Tex. Prop. Code § 5.007 (UVPRA) |
| HI | uvpra seller | UVPRA (adopted) |
| MI | uvpra seller | UVPRA (adopted) |
| NV | uvpra seller | UVPRA (adopted) |
| (default) | equitable conversion buyer | Equitable conversion (common-law majority rule) |

## Deed types and title covenants

| Deed type | Covenants | Scope | After-acquired title |
|---|---|---|---|
| general warranty | seisin, right_to_convey, against_encumbrances, quiet_enjoyment, warranty, further_assurances | all defects | yes |
| special warranty | seisin, right_to_convey, against_encumbrances, quiet_enjoyment, warranty, further_assurances | grantor acts only | yes |
| bargain and sale | — | none | no |
| quitclaim | — | none | no |

## Concurrent ownership — signatory requirements

| Vesting | Who must sign | Gap risk |
|---|---|---|
| sole | The sole record owner (plus spousal joinder where homestead/community-property law requires). | Homestead or marital joinder missed. |
| tenancy in common | EVERY cotenant for a conveyance of the whole; one cotenant conveys only its undivided share. | A missing cotenant leaves a fractional interest outstanding. |
| joint tenancy | All joint tenants for the whole; one joint tenant can sever and convey only its share. | Unilateral severance; survivorship defeats a devise. |
| tenancy by entirety | BOTH spouses — neither can convey or encumber alone in entirety states. | Classic missed-signatory deal-killer: a one-spouse signature conveys nothing. |
| community property | Both spouses for community real property (e.g., Cal. Fam. Code § 1102; Tex. Fam. Code § 5.001 for homestead). | One-spouse conveyance voidable. |
| entity | Officers/managers per the entity's organizational documents and any required member/board consents. | Authority defect: resolutions or consents missing. |

## Lease consent standards (consent required, no standard stated)

| State | Default | Citation |
|---|---|---|
| CA | implied reasonableness | Kendall v. Ernest Pestana, Inc., 40 Cal.3d 488 (1985) |
| NY | as written sole discretion enforced | NY common law: absolute-consent/sole-discretion clauses enforced as written |
| (other) | unsettled check state | State law varies; verify before relying on an implied reasonableness standard |

## Transfer tax and reassessment regimes

| State | Deed tax | Controlling-interest tax | Threshold | Aggregation | Reassessment on control change | Citation |
|---|---|---|---|---|---|---|
| NY | yes | yes | ≥50% | 3 yr | no | NYC Admin. Code § 11-2101 (controlling interest = 50% or more); § 11-2106(b)(8) & NY Tax Law § 1405(b)(6) (mere-change exemption); NY Pub. 576 (3-year acting-in-concert aggregation) |
| CA | yes | yes | ≥50% | — | yes | Documentary transfer tax (Rev. & Tax. Code § 11911); Prop 13 change-in-ownership — change in control >50% of an entity triggers 100% reassessment (Rev. & Tax. Code § 64); cumulative transfers of original co-owner interests >50% also trigger. |
| DE | yes | no | — | — | no | 30 Del. C. § 5401 et seq. (realty transfer tax — among the highest combined state+local rates) |
| TX | no | no | — | — | no | No real estate transfer tax — constitutionally prohibited (Tex. Const. art. VIII § 29) |

## Due-on-sale — federal overlay

12 U.S.C. § 1701j-3: consumer transfer protections apply only to residential real property of fewer than 5 dwelling units. Protected transfer kinds:

- transfer to spouse or child
- transfer on death to relative
- divorce decree transfer to spouse
- inter vivos trust borrower beneficiary
- junior lien creation
- leasehold under 3y no option

## Ground-lease financeability thresholds

Minimum remaining term beyond loan maturity: 20 years (institutional standards run 20–25). Required protections: mortgagee notice and cure; new lease on termination; no merger of fee and leasehold; assignable mortgageable tenant interest.

Institutional leasehold-mortgagee standards: remaining term (with unilateral extensions) of at least 20–25 years beyond loan maturity plus the four protections; missing any is a financing deal-killer or repricing event.

## Bulk-sales / tax-clearance notification states

| State | Regime |
|---|---|
| CA | Cal. U. Com. Code §§ 6101-6111 (retained, actively enforced) + tax clearance |
| NY | N.Y. Tax Law § 1141(c) bulk-sale notification |
| NJ | N.J.S.A. 54:50-38 bulk-sale notification |
| PA | 69 P.S. § 529; 72 P.S. § 1403 — clearance reaches real-estate-only transfers |

## Professional-determination boundaries (real property)

The following questions are legal determinations. Conforming implementations classify and route them to licensed counsel; they do not answer them:

- **DTC.RE.01** — Any request to judge whether title is marketable or whether a defect is fatal.
- **DTC.RE.02** — Any request to opine on enforceability of any clause (liquidated damages, anti-assignment, consent standard, survival, option/ROFR, due-on-sale).
- **DTC.RE.03** — Any drafting of a transaction document (PSA, deed, lease, SNDA, estoppel as an instrument, title instrument, guaranty).
- **DTC.RE.04** — Any conclusion about whether a specific transfer legally triggers transfer tax, reassessment, due-on-sale, a preemptive right, or a deemed assignment.
- **DTC.RE.05** — Any question about whether a covenant of title has been breached or what remedy lies.
- **DTC.RE.06** — Any recommendation on deal structure to achieve a legal/tax result (carve-out, F-reorg, drop-down).
- **DTC.RE.07** — Any adverse-possession, boundary, quiet-title, or easement-scope dispute.
- **DTC.RE.08** — Any bulk-sales/successor-liability or CERCLA successor determination.
- **DTC.RE.09** — Any zoning/entitlement compliance or nonconforming-use continuation opinion.
- **DTC.RE.10** — Any interpretation of ambiguous contract language or resolution of a conflict between the contract and the deed.


---

# Authority Register (as referenced)

- 11 U.S.C. 1111(b)
- 11 U.S.C. 1125
- 11 U.S.C. 1129(a)(11)
- 11 U.S.C. 1129(a)(7)
- 11 U.S.C. 1129(b)
- 11 U.S.C. 1129(b)(2)
- 11 U.S.C. 1181-1195
- 11 U.S.C. 363
- 11 U.S.C. 364
- 11 U.S.C. 365
- 11 U.S.C. 507
- 11 U.S.C. 548
- 11 U.S.C. 726
- 12 U.S.C. 1701j-3
- 15 U.S.C. 18a
- 17 U.S.C. 205
- 203 N. LaSalle
- 25 Del. C. 153
- 35 U.S.C. 261
- 72 P.S. 1403
- AB Stable
- ABA 2025
- ABA Business Law Today
- ABA Deal Points
- ABA earnout reports
- ABA Earnout Reports
- ABA Model SPA
- ABA Model SPA IP representations
- ABA Model SPA IP Representations
- ABA Private Target Deal Points Study 2023
- ABL market practice
- ABL Market Practice
- AGPL
- Akorn
- ALTA endorsements
- ALTA Endorsements
- ALTA forms
- ALTA Forms
- ALTA title practice
- Aon RWI reports
- Aon RWI Reports
- Apache
- Appraisal Institute practice
- Appraisal Institute Practice
- ASC 842
- ASTM E2018
- At Home
- BOMA
- Brazen v. Bell Atlantic
- BSD
- Bulk Sale Acts
- bulk-sale acts
- Cal. Civ. Code 1214
- Cal. Civ. Code 1662
- Cal. Rev. & Tax. Code 60-64
- California Labor Code 2870
- Castleton Plaza
- CERCLA 107
- CFIUS regulations
- Channel Medsystems
- Clorox v. Chemical Bank
- Codekeeper
- Collier 364.06
- Common-law deed covenants
- Convertible Financing Market Practice
- CPRA
- Credit Agreement Market Practice
- CT 12-638
- Damodaran 2026
- Delaware equitable-remedy case law
- DGCL 170
- DGCL 251(h)
- DGCL SB 21
- DOL ESOP guidance
- English MAC case law
- Envision
- equitable conversion
- Escode
- ETA market norms
- EU Merger Regulation 139/2004
- fairness opinion case law
- Fenwick 2023 ARBF analysis
- Fisker
- Form 1099-DA
- Form 8288-B
- Forms 8288
- Forms 8288 and 8288-A
- Forms 8288-A
- FRBP 3001
- FRED:BAMLC0A0CM
- FRED:BAMLH0A0HYM2
- FRED:DGS10
- FRED:DPRIME
- FRED:SOFR
- FRED:VIXCLS
- Frontier
- FTC 2026 HSR - Auto-Reportable
- FTC 2026 HSR - Size of Transaction
- fund formation market practice
- GDPR
- GENIUS Act
- GPL
- Ground Lease Lender Practice
- Houlihan Lokey 2023 Transaction Termination Fee Study
- Howey
- HSR Act
- ICANN transfer rules
- ICANN Transfer Rules
- ILPA continuation-fund guidance
- ILPA guidance
- ILPA Guidance
- In re Peregrine
- In re Topps
- indenture practice
- Indenture Practice
- Indianapolis Downs
- INDOPCO
- IP carve-out practice norms
- IP Carve-Out Practice Norms
- IP licensing industry practice
- IP Licensing Industry Practice
- IRC 1001
- IRC 1031
- IRC 1042
- IRC 1060
- IRC 108
- IRC 1202
- IRC 1274
- IRC 1274A
- IRC 1374
- IRC 1445
- IRC 1446(f)
- IRC 163(j)
- IRC 195
- IRC 197
- IRC 263
- IRC 280G
- IRC 336
- IRC 336(e)
- IRC 338
- IRC 338(h)(10)
- IRC 351
- IRC 355
- IRC 355(e)
- IRC 368
- IRC 368(a)(1)(F)
- IRC 382
- IRC 382(b)(1)
- IRC 453
- IRC 453A
- IRC 483
- IRC 4999
- IRC 6045
- IRC 704(c)
- IRC 721
- IRC 754
- IRC 856
- IRC 856-860
- IRC 857
- IRC 858
- IRC 859
- IRC 860
- IRC 897
- Iron Mountain escrow templates
- Iron Mountain Escrow Templates
- IRS Form 8288
- IRS Form 8288-A
- IRS Form 8288-B
- IRS Form 8594
- J. Crew
- Kendall v. Ernest Pestana 40 Cal.3d 488
- Kendall v. Ernest Pestana, 40 Cal.3d 488
- Klang
- Kroll 2024
- Lanham Act 10
- lease abstraction industry practice
- Lease Abstraction Industry Practice
- lender practice
- Lender Practice
- lender practice norms
- Letter Ruling 202308010
- LGPL
- Lockton RWI reports
- Lockton RWI Reports
- LoPucki Bankruptcy Research Database
- LSTA model AAL
- LSTA model provisions
- LSTA Model Provisions
- market practice
- Marketable-title common law
- Marsh RWI reports
- Marsh RWI Reports
- Match Group
- Matter of 105-02 Forest Hills (2025)
- MD Tax-Prop 12-117
- merger doctrine (common law)
- Merger doctrine (common law)
- MFW
- MIT
- Mitel
- Moody's Ultimate Recovery Database
- Morgan Lewis OSS guidance
- Morgan Lewis OSS Guidance
- Morse OSS guidance
- Morse OSS Guidance
- MPM Silicones
- municipal CO ordinances
- Municipal CO ordinances
- N.Y. Gen. Oblig. Law 5-1311
- N.Y. Real Prop. Law 291
- Nasdaq Rule 5635
- NAV facility market practice
- NAV Facility Market Practice
- NIST CSF
- Nixon Peabody OSS guidance
- Nixon Peabody OSS Guidance
- NVCA term sheet
- NY assignment common law
- NY Publication 576
- NY Tax Law 1405(b)(6)
- NYC Admin. Code 11-2101
- OBBBA 2025
- OBBBA Sec. 70301
- OBBBA Sec. 70302
- OBBBA Sec. 70425
- OBBBA Sec. 70505
- OFAC
- PATH Act 2015
- Pepperdine PCAP 2025
- Pluralsight
- Project Finance Market Practice
- project-finance market practice
- RadLAX
- real estate industry practice
- Real Estate Industry Practice
- real estate practice norms
- Real Estate Practice Norms
- Regulation (EU) 2024/1689
- Restructuring Market Practice
- Rev. Proc. 2011-29
- Rhone-Poulenc Agro v. DeKalb
- ROFR/option common law
- Rule 14d-10
- Rule 14e-1
- Rutledge v. Clearway
- RWI market studies
- Sabre
- SBA SOP 50 10 8
- SEC climate and ESG references
- SEC climate disclosure references
- SEC Project Crypto
- Secondary Market Practice
- Securities Act 3(a)(9)
- Serta Simmons
- SRS 2025
- SRS Acquiom
- SRS Acquiom 2024
- SRS Acquiom 2025
- SRS Acquiom Deal Terms Study 2024
- SRS Acquiom Deal Terms Study 2025
- SRS Acquiom Earnout data
- SRS Acquiom Earnout Data
- SRS Acquiom Working Capital PPA Study
- state ABC law
- State ABC Law
- State CITT Statutes
- state employee-IP statutes
- State Employee-IP Statutes
- state nexus statutes
- State Nexus Statutes
- state title statutes
- State Title Statutes
- T.D. 10000
- Tex. Const. art. VIII 29
- Tex. Prop. Code 13.001
- Tex. Prop. Code 5.007
- Tex. Prop. Code 5.023
- Texas Grand Prairie
- TIA 316(b)
- Till
- Topp
- TRA market practice
- Treas. Reg. 1.1060
- Treas. Reg. 1.1060-1
- Treas. Reg. 1.263(a)-5
- Treas. Reg. 1.336-2
- Treas. Reg. 1.338-6
- Treas. Reg. 1.338-6(b)
- Treas. Reg. 1.368
- Tribune
- Trinseo
- TX strict-match construction
- TX strict-match ROFR construction
- UCC 9-334
- UCC 9-610
- UCC 9-611
- UCC 9-615
- UCC Art. 6 (as retained)
- UCC Article 9
- UDITPA
- UFTA
- UK Enterprise Act 2002
- UK market practice
- USPTO Form PTO-1594
- UVTA
- Venture Debt Market Practice
- venture-debt market practice
- WA RCW 82.45
- YC SAFE


---

# Conformance

655 cases (385 model-runtime) across 42 categories.
