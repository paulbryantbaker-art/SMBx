> **STATUS: APPROVED (Paul, 2026-07-17) and merged into `DEFINITIVE_GATE_EXPANSIONS`** in
> `server/services/definitiveDealMechanicsCatalog.ts`. G14 kept as drafted (option A); the
> optional QSBS→G15 re-route was declined. `--publish` now passes. This file is retained as
> the approval record.

# Gate Registry — FOR FOUNDER APPROVAL (do not publish; do not merge without sign-off)

> The publish gate blocks any build with an unnamed routed gate, so the specification CANNOT ship until these names, purposes, and predicates are approved and merged into DEFINITIVE_GATE_EXPANSIONS. CC drafts; founder approves. Predicates are machine-evaluable over the deal-fact data-dictionary vocabulary.

## Routed gates needing names (14)

| Gate | Routed models | Draft name | Draft purpose | Draft trigger predicate |
|---|---|---|---|---|
| G1 | 3 | **Reps, Warranties & Indemnification** | Activates the representation and warranty architecture and the indemnification-ladder mechanics of the definitive agreement once the deal reaches definitive-agreement drafting. | `definitive_agreement_stage == true` |
| G2 | 11 | **Transaction Form & Purchase-Price Allocation** | Activates the asset/stock/merger form fork and the purchase-price-allocation mechanics that follow from the chosen form. | `deal_form in {asset, stock, merger} AND purchase_price_cents > 0` |
| G6 | 1 | **Closing Conditions** | Activates condition-precedent tracking for the period between signing and closing. | `signed == true AND closed == false` |
| G7 | 7 | **Execution & Closing Certainty** | Activates the execution-risk stack — regulatory reportability, MAE durational significance, insurance architecture, transition services, and closing mechanics. | `signed == true OR loi_executed == true` |
| G8 | 4 | **Post-Closing Recourse** | Activates escrow, holdback, survival, and insurance-backed recourse sizing after closing. | `indemnity_structure_required == true` |
| G9 | 1 | **Contingent Consideration** | Activates earnout design, measurement, and dispute mechanics when part of the price is contingent. | `contingent_consideration == true` |
| G10 | 10 | **Intellectual Property Mechanics** | Activates IP diligence, chain-of-title, transfer, and allocation mechanics when IP is material to value. | `ip_material_to_value == true` |
| G14 | 2 | **Seller Proceeds & Price Adjustment** | Activates seller-side proceeds tax treatment (e.g., QSBS) and price-adjustment pegs on the sell side. _(LOW CONFIDENCE — QSBS + working-capital-peg pairing is odd; founder option to re-route QSBS to G15 only and rename this "Price Adjustment Mechanics".)_ | `sell_side_context == true` |
| G15 | 42 | **Tax & Corporate Structure** | The master structuring gate: tax elections, reorganization qualification, corporate-law mechanics, and equity-structure math. Runs whenever a deal form is set (structure analysis always applies). | `deal_form is set` |
| G19 | 5 | **State & Local Transaction Tax** | Activates state/local transfer-tax, controlling-interest, SALT, and clearance mechanics when US state jurisdictions are involved. | `us_state_jurisdictions.length > 0` |
| G23 | 3 | **Cross-Border Deal Terms** | Activates non-US deal-term and merger-control overlays when a non-US jurisdiction is in play. | `non_us_jurisdiction == true` |
| G24 | 6 | **Regulatory & Compliance Diligence Overlays** | Activates the regulatory-diligence overlay family (privacy, cyber, sanctions, ESG, sector regulation) for regulated data or operations. | `regulated_data_or_operations == true` |
| G26 | 4 | **Fund Secondaries & GP-Led Transactions** | Activates fund-level and secondaries mechanics (continuation funds, LP secondaries, strip sales, NAV facilities). | `counterparty_type in {fund_lp, fund_gp} OR transaction_type in {secondary, continuation, strip, nav}` |
| G27 | 4 | **Sponsor, Search & Employee-Ownership Economics** | Activates acquirer-archetype economics — independent-sponsor promotes, search-fund step-ups, and ESOP structures. | `buyer_archetype in {independent_sponsor, search_fund, esop}` |

## Reserved gate IDs (13)

No models route through these; no activation criteria are fabricated. Recommended published form: `Reserved — activation criteria published, model routing scheduled`.

- **G3** — Reserved gate ID — family and activation criteria to be specified; no models route here yet.
- **G4** — Reserved gate ID — family and activation criteria to be specified; no models route here yet.
- **G5** — Reserved gate ID — family and activation criteria to be specified; no models route here yet.
- **G11** — Reserved gate ID — family and activation criteria to be specified; no models route here yet.
- **G12** — Reserved gate ID — family and activation criteria to be specified; no models route here yet.
- **G13** — Reserved gate ID — family and activation criteria to be specified; no models route here yet.
- **G16** — Reserved gate ID — family and activation criteria to be specified; no models route here yet.
- **G17** — Reserved gate ID — family and activation criteria to be specified; no models route here yet.
- **G18** — Reserved gate ID — family and activation criteria to be specified; no models route here yet.
- **G20** — Reserved gate ID — family and activation criteria to be specified; no models route here yet.
- **G21** — Reserved gate ID — family and activation criteria to be specified; no models route here yet.
- **G22** — Reserved gate ID — family and activation criteria to be specified; no models route here yet.
- **G25** — Reserved gate ID — family and activation criteria to be specified; no models route here yet.

## Founder decisions

1. Approve/edit each name, purpose, and predicate above.
2. G14: keep as drafted, or re-route QSBS to G15-only and rename G14 "Price Adjustment Mechanics".
3. Reserved-gate form: per-gate reserved pages vs. one reserved table.

On approval, these merge into DEFINITIVE_GATE_EXPANSIONS (a deliberate, founder-signed step) and the publish gate for gates clears.

