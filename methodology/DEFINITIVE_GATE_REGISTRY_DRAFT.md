# DEFINITIVE Gate Registry — DRAFT for founder approval (Punch List §3 / Phase 2)

**Status:** DRAFT 2026-07-16 — awaiting Paul's one-pass approval. Nothing here
enters the public build until approved; the generator keeps honest
"pending founder approval" stubs meanwhile.

Names and purposes below are **derived from each gate's routed models** (the
only ground truth in the substrate — G1–G27 were never named in code or
docs). Trigger predicates are drafted over the published deal-fact dictionary
and marked machine-evaluable. Approve, edit inline, or rename — one pass is
enough; the generator then renders every gate at the G28–G30 standard.

## A. Routed gates needing names (14)

| Gate | Routed models (basis) | DRAFT name | DRAFT purpose | DRAFT trigger predicate |
|---|---|---|---|---|
| G1 | Indemnification ladder, survival periods, standard IP rep set | **Reps, Warranties & Indemnification** | Activates the representation/warranty architecture and indemnification-ladder mechanics of the definitive agreement. | `definitive_agreement_stage = true` |
| G2 | Asset-vs-entity election, PPA bifurcation, 338(h)(10)/336(e) gross-up, 1374 BIG, transaction tax master, OpCo/PropCo | **Transaction Form & Purchase-Price Allocation** | Activates the asset/stock/merger form fork and the allocation mechanics that follow from it. | `deal_form in {asset, stock, merger} AND purchase_price_cents > 0` |
| G6 | Conditions-to-close logic engine | **Closing Conditions** | Activates condition-precedent tracking between signing and closing. | `signed = true AND closed = false` |
| G7 | RWI primary architecture, MAE durational significance, HSR reportability, carve-out TSA, closing true-up, conditions engine | **Execution & Closing Certainty** | Activates the execution-risk stack: regulatory reportability, MAE, insurance architecture, transition services, and closing mechanics. | `signed = true OR loi_executed = true` |
| G8 | Indemnification ladder, survival, escrow/holdback sizing, RWI stack | **Post-Closing Recourse** | Activates escrow, holdback, survival, and insurance-backed recourse sizing. | `indemnity_structure_required = true` |
| G9 | Earnout architecture and dispute | **Contingent Consideration** | Activates earnout design, measurement, and dispute mechanics. | `contingent_consideration = true` |
| G10 | IP chain-of-title, encumbrance search, license dependency, IP reps, carve-out/license-back, source-code escrow, OSS exposure, employee assignment, IP 1060, domain/TM transfer | **Intellectual Property Mechanics** | Activates IP diligence, transfer, and allocation mechanics. | `ip_material_to_value = true` |
| G14 | QSBS post-OBBBA, working capital peg | **Seller Proceeds & Price Adjustment** *(low confidence — odd pairing; consider splitting QSBS→G15 only)* | Activates seller-side proceeds tax treatment and price-adjustment pegs. | `sell_side_context = true` |
| G15 | 42 models — QSBS, ESOP, F-reorg, installment sale, 338(h)(10), reorganizations, 251(h), tender mechanics, spins, contributions, cap table, PIPE, DGCL 170, CODI/382… | **Tax & Corporate Structure** | The master structuring gate: tax elections, reorganization qualification, corporate-law mechanics, and equity-structure math. | `deal_form is set` (structure analysis always runs) |
| G19 | Transfer/controlling-interest tax, SALT engine, CITT screen, permit/CO/bulk-sales | **State & Local Transaction Tax** | Activates state/local transfer-tax, SALT, and clearance mechanics. | `us_state_jurisdictions.length > 0` |
| G23 | English W&I, international merger control, English MAC | **Cross-Border Deal Terms** | Activates non-US deal-term and merger-control overlays. | `non_us_jurisdiction = true` |
| G24 | EU AI Act tier, cyber, privacy, sanctions, ESG, climate | **Regulatory & Compliance Diligence Overlays** | Activates the regulatory-diligence overlay family. | `regulated_data_or_operations = true` |
| G26 | Continuation-fund waterfall, LP secondary + ECI, strip sale, NAV facility | **Fund Secondaries & GP-Led Transactions** | Activates fund-level and secondaries mechanics. | `counterparty_type in {fund_lp, fund_gp} OR transaction_type in {secondary, continuation, strip, nav}` |
| G27 | ESOP deferral, independent-sponsor promote, search-fund step-up, leveraged ESOP | **Sponsor, Search & Employee-Ownership Economics** | Activates acquirer-archetype economics (sponsor promotes, search step-ups, ESOP structures). | `buyer_archetype in {independent_sponsor, search_fund, esop}` |

## B. Unrouted gate IDs (13): G3, G4, G5, G11, G12, G13, G16, G17, G18, G20, G21, G22, G25

No models route through these IDs and no internal definition exists.
**Recommendation (punch list option b): publish as `Reserved — activation
criteria published, model routing scheduled`** — but note we cannot publish
activation criteria we don't have. Practical form: one-line reserved entries
("Reserved gate ID; family and activation criteria to be specified"), which
is honest roadmap signal without fabricating criteria. Alternative (option c)
is to publish the framework as "30 gate IDs, 17 active" and list reserved IDs
in one table — lighter, same honesty.

**FOUNDER decisions on this page:**
1. Approve/edit the 14 names + purposes + predicates above.
2. G14: keep as drafted, or re-route QSBS to G15-only and rename G14 "Price Adjustment Mechanics".
3. Unrouted-gate form: per-gate reserved pages vs. one reserved table.
