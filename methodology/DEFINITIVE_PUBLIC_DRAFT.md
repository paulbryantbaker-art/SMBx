<!-- GENERATED review draft (generator v2, punch-list build) — built by scripts/build-definitive-public.ts.
     Do not hand-edit; regenerate instead. Gap ledger: dist/definitive-internal/GAP_LEDGER.md -->

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

**At a glance:** **134 model slots** (85 Normative · 47 Catalog · 2 Reserved) · **30-gate routing framework** (17 gates carry routed models; 3 fully specified) · **308 authority anchors** (as referenced) · **655-case conformance suite** (385 model-runtime).

The specification publishes at two maturity tiers, labeled on every entry and
in the index. **Normative** entries carry the full contract — input and output
schemas, algorithm, worked example, error semantics, and conformance
bindings — and are implementable from this document alone. **Catalog** entries
are informative maps of scope, boundary, routing, and authorities whose
normative contracts are scheduled. The breadth claim (134 slots
mapped) and the rigor claim (85 slots normative) are distinct
claims, made separately and never blurred.

Three design rules run through everything. **Determinism**: a model computes
from supplied facts and cited constants — same inputs, same outputs, no
estimation dressed as calculation. **Data over logic**: jurisdictional
variation lives in versioned lookup tables; an implementation confronted with
an untabled jurisdiction must surface the gap rather than guess. **Boundary
honesty**: every model declares whether it is arithmetic, a schedule feeding a
licensed professional's determination, or a research scaffold — and
conforming implementations route accordingly.

## Normative language

The key words MUST, MUST NOT, SHALL, SHOULD, and MAY in this specification are
to be interpreted as described in RFC 2119 and RFC 8174 when, and only when,
they appear in all capitals.

## What this specification is not

This specification is an educational and engineering reference. It is not
legal, tax, accounting, investment, or appraisal advice; it renders no
opinions; and nothing in it creates a professional relationship. Questions it
classifies as specialist determinations belong to licensed professionals.


---

# Professional-Boundary Classification

Every model slot carries one of three boundary classifications. The
classification is normative — implementations that surface DEFINITIVE
computations MUST preserve it.

**Deterministic computation.** Arithmetic and rule application on supplied
facts and cited constants. These produce answers.

**Deterministic schedules with a specialist boundary.** The model computes
real schedules — a three-prong solvency table, a marketability triage, a
consent-path classification — but the *governing determination* is a legal,
tax, accounting, appraisal, or judicial conclusion that belongs to a licensed
professional. These models produce the workpapers and the routing, never the
conclusion. Each such model's entry states which conclusion is out of scope
and to whom it routes.

**Research scaffolds.** Organized authorities and considerations for areas
where rulemaking or market practice is still moving. These produce oriented
reading, not determinations.

The specification also publishes explicit **professional-determination
boundary catalogs** (e.g., the ten real-property triggers in the state-law
chapter), each carrying a numbered conformance requirement. A system that
answers a question the specification routes has not implemented the
specification; it has violated it — and the conformance suite tests for it.


---

# Methodology

**Zero-hallucination architecture.** Financial figures are extracted or
supplied, never invented; monetary values are integer cents; published
constants carry citation anchors; models that lack a required input MUST
return a named missing-input list instead of a guess.

**Model anatomy.** A Normative entry specifies: identity, boundary
classification, gate routing, deal contexts, input contract, output contract,
algorithm, constants with authorities, a worked example (which is also a
published conformance case), error semantics, boundary statement, conformance
bindings, and version. Implementations execute models as pure functions over
a supplied input record and emit outputs plus an audit payload (spec version,
input/output hashes, timestamps).

**Gate routing.** Transactions activate model families through gates —
predicates over the deal-fact data dictionary. Gates make coverage
inspectable: for a given transaction shape, the set of applicable models is
enumerable in advance.

**Jurisdictional data tables.** Where the law varies by state, the variation
is a versioned data table. Adding a jurisdiction is a data change with its
own conformance cases, not a code change. Unknown jurisdictions MUST produce
explicit table-gap flags.

**Conformance.** 655 cases
(385 model-runtime across
42 categories), with
expected values derived from governing authorities independently of any
implementation. See the conformance chapter for the case format, the harness
contract, and the numbered requirements.


---


# Deal-Fact Data Dictionary

The common field vocabulary used by model input contracts and gate predicates, unioned from the Normative models' observed contracts.

**Conventions (normative):** monetary values are integer cents; percentages are numbers on a 0–100 scale unless the field name says \_rate (0–1); dates are ISO-8601 strings; US jurisdictions are two-letter state codes; fields observed only in fixtures are typed empirically and marked MAY.

| Field | Type(s) | Used by | Required by |
|---|---|---|---|
| `acceleration_triggers` | string[] | 1 model(s) | 0 |
| `actual_nwc_cents` | integer (cents) | 1 model(s) | 1 |
| `afr_rate` | number | 1 model(s) | 1 |
| `aggregate_noncontingent_liquidated_debt_cents` | integer (cents) | 1 model(s) | 1 |
| `all_required_signers_present` | boolean | 1 model(s) | 0 |
| `allowed_claim_cents` | integer (cents) | 1 model(s) | 1 |
| `alta_endorsements_requested` | string[] | 1 model(s) | 0 |
| `amount_realized_cents` | integer (cents) | 2 model(s) | 2 |
| `annual_debt_service_cents` | integer (cents) | 1 model(s) | 0 |
| `annual_ground_rent_cents` | integer (cents) | 1 model(s) | 1 |
| `annual_rent_cents` | integer (cents) | 1 model(s) | 1 |
| `asset_classes` | object[] | 1 model(s) | 1 |
| `assets` | object[] | 1 model(s) | 1 |
| `assignee_fee_cents` | integer (cents) | 1 model(s) | 0 |
| `available_capital_cents` | integer (cents) | 1 model(s) | 1 |
| `base_amount_cents` | integer (cents) | 1 model(s) | 1 |
| `base_rate` | number | 1 model(s) | 1 |
| `basis_at_conversion_cents` | integer (cents) | 1 model(s) | 1 |
| `basket_pct` | number | 1 model(s) | 0 |
| `baskets` | object[] | 1 model(s) | 1 |
| `boot_received_cents` | integer (cents) | 1 model(s) | 0 |
| `breakup_fee_cents` | integer (cents) | 1 model(s) | 0 |
| `bright_line_date` | string (ISO date) | 1 model(s) | 1 |
| `bulk_sale_clearance_required` | boolean | 1 model(s) | 0 |
| `buyer_equity_cents` | integer (cents) | 1 model(s) | 1 |
| `buyer_step_up_pv_benefit_cents` | integer (cents) | 1 model(s) | 0 |
| `buyer_will_use_as_residence` | boolean | 2 model(s) | 0 |
| `call_price_pct` | number | 1 model(s) | 0 |
| `cap_rate` | number | 2 model(s) | 2 |
| `cash_flow_cents` | integer (cents) | 1 model(s) | 1 |
| `cash_interest_rate` | number | 1 model(s) | 0 |
| `cercla_linked_property` | boolean | 1 model(s) | 0 |
| `circuit` | string | 1 model(s) | 0 |
| `claims` | object[] | 2 model(s) | 2 |
| `class_vi_intangibles_cents` | integer (cents) | 1 model(s) | 0 |
| `class_vote_amount_pct` | number | 1 model(s) | 0 |
| `class_vote_number_pct` | number | 1 model(s) | 0 |
| `classes` | object[] | 2 model(s) | 2 |
| `closing_balance_cents` | — | 1 model(s) | 1 |
| `closing_date` | string (ISO date) | 3 model(s) | 2 |
| `closing_day_of_period` | integer | 1 model(s) | 0 |
| `collateral_value_cents` | integer (cents) | 1 model(s) | 1 |
| `commitment_cents` | integer (cents) | 1 model(s) | 0 |
| `components` | object[] | 1 model(s) | 1 |
| `conditions` | object[] | 1 model(s) | 1 |
| `consent_clause` | string | 1 model(s) | 1 |
| `consideration_mix` | object | 1 model(s) | 0 |
| `construction_mortgage` | boolean | 1 model(s) | 0 |
| `contract_allocates_risk` | boolean | 1 model(s) | 1 |
| `contract_risk_on` | string | 1 model(s) | 0 |
| `contract_title_standard` | string | 1 model(s) | 0 |
| `contributors` | object[] | 1 model(s) | 1 |
| `conversion_date` | string (ISO date) | 1 model(s) | 1 |
| `corporate_tax_rate` | number | 1 model(s) | 0 |
| `coupon_rate` | number | 1 model(s) | 1 |
| `credit_bid_claim_cents` | integer (cents) | 1 model(s) | 0 |
| `creditor_classes` | object[] | 1 model(s) | 1 |
| `cumulative_related_transfers_pct` | integer | 1 model(s) | 0 |
| `curative_items` | object[] | 1 model(s) | 0 |
| `deal_form` | string | 2 model(s) | 2 |
| `deal_type` | string | 1 model(s) | 1 |
| `debt_assumable` | boolean | 1 model(s) | 0 |
| `debts_due_cents` | integer (cents) | 1 model(s) | 1 |
| `deed_type` | string | 1 model(s) | 1 |
| `deposit_verification_tier` | string | 1 model(s) | 1 |
| `discount_pct` | number | 1 model(s) | 0 |
| `discount_rate` | number | 3 model(s) | 3 |
| `disposition_months` | integer | 1 model(s) | 0 |
| `disposition_pct` | number | 1 model(s) | 0 |
| `dispute_forum` | string | 1 model(s) | 0 |
| `distributions_cents` | integer (cents) | 1 model(s) | 1 |
| `earnout_targets` | number[] | 2 model(s) | 2 |
| `earnout_value_cents` | integer (cents) | 1 model(s) | 1 |
| `ebitda_growth_pct` | number | 1 model(s) | 1 |
| `economic_life_years` | integer | 1 model(s) | 0 |
| `effective_gross_income_cents` | integer (cents) | 1 model(s) | 1 |
| `efficient_market_exists` | boolean | 1 model(s) | 0 |
| `efficient_market_rate` | number | 1 model(s) | 0 |
| `eligible_ar_cents` | integer (cents) | 1 model(s) | 1 |
| `eligible_inventory_cents` | integer (cents) | 1 model(s) | 1 |
| `engaged_in_commercial_activity` | boolean | 1 model(s) | 1 |
| `enterprise_value_cents` | integer (cents) | 5 model(s) | 5 |
| `entity_carried_basis_cents` | integer (cents) | 1 model(s) | 0 |
| `estate_value_cents` | integer (cents) | 1 model(s) | 1 |
| `estimated_nwc_cents` | integer (cents) | 1 model(s) | 0 |
| `exceptions` | object[] \| any[] | 1 model(s) | 1 |
| `excess_layers` | object[] | 1 model(s) | 0 |
| `exclusions` | string[] | 1 model(s) | 0 |
| `exercise_price_cents` | integer (cents) | 1 model(s) | 1 |
| `exit_leverage` | integer | 1 model(s) | 1 |
| `face_amount_cents` | integer (cents) | 1 model(s) | 1 |
| `fair_value_assets_cents` | integer (cents) | 1 model(s) | 1 |
| `fair_value_share_price_cents` | integer (cents) | 1 model(s) | 1 |
| `federal_tax_rate` | number | 1 model(s) | 0 |
| `fiduciary_out_present` | boolean | 1 model(s) | 0 |
| `filing_days_after_affixation` | integer | 1 model(s) | 0 |
| `fixture_filing_made` | boolean | 1 model(s) | 1 |
| `fmv_at_conversion_cents` | integer (cents) | 1 model(s) | 1 |
| `fmv_real_property_cents` | integer (cents) | 1 model(s) | 1 |
| `forecast_periods` | object[] | 1 model(s) | 1 |
| `form_8288_b_reduced_withholding_requested` | boolean | 1 model(s) | 0 |
| `fund_nav_cents` | integer (cents) | 2 model(s) | 2 |
| `gain_cents` | integer (cents) | 1 model(s) | 1 |
| `general_buffer_rate` | number | 1 model(s) | 0 |
| `general_cap_pct` | number | 1 model(s) | 0 |
| `general_reps_months` | integer | 1 model(s) | 0 |
| `ground_lease_expiry_date` | string (ISO date) | 1 model(s) | 1 |
| `guc_recovery_pct` | number | 1 model(s) | 0 |
| `installment_receivable_cents` | integer (cents) | 1 model(s) | 0 |
| `interest_inconsequential` | boolean | 1 model(s) | 0 |
| `interest_transferred_pct` | number | 1 model(s) | 1 |
| `investment_cents` | integer (cents) | 1 model(s) | 1 |
| `ip_assets` | object[] | 1 model(s) | 1 |
| `ip_intangibles_cents` | integer (cents) | 1 model(s) | 1 |
| `is_entity_transfer` | boolean | 1 model(s) | 1 |
| `issues` | object[] | 1 model(s) | 1 |
| `items` | object[] \| any[] | 1 model(s) | 1 |
| `jurisdiction` | string | 1 model(s) | 1 |
| `jurisdiction_requires_co_on_transfer` | boolean | 1 model(s) | 1 |
| `landlord_recapture_right` | boolean | 1 model(s) | 0 |
| `last_deposit_date` | string (ISO date) | 1 model(s) | 0 |
| `later_purchaser_for_value` | boolean | 1 model(s) | 1 |
| `later_recorded_first` | boolean | 1 model(s) | 1 |
| `later_took_without_notice` | boolean | 1 model(s) | 1 |
| `lease_deems_change_of_control_assignment` | boolean | 1 model(s) | 0 |
| `lease_term_years` | integer | 2 model(s) | 1 |
| `leases` | object[] | 1 model(s) | 1 |
| `legal_title_or_possession_passed` | boolean | 1 model(s) | 0 |
| `lender_policy_required` | boolean | 1 model(s) | 0 |
| `lender_recognition_agreement` | boolean | 1 model(s) | 0 |
| `liabilities_cents` | integer (cents) | 1 model(s) | 1 |
| `licenses` | object[] | 1 model(s) | 1 |
| `lien_amount_cents` | integer (cents) | 1 model(s) | 1 |
| `liquidation_value_cents` | integer (cents) | 1 model(s) | 1 |
| `liquidity_months` | integer | 1 model(s) | 1 |
| `loan_amount_cents` | integer (cents) | 2 model(s) | 2 |
| `loan_has_due_on_transfer_clause` | boolean | 1 model(s) | 1 |
| `loan_maturity_date` | string (ISO date) | 1 model(s) | 1 |
| `long_term_tax_exempt_rate` | number | 1 model(s) | 1 |
| `loss_corporation_value_cents` | integer (cents) | 1 model(s) | 1 |
| `market_cap_rate_from_pass_through_source` | boolean | 1 model(s) | 0 |
| `material_casualty_or_condemnation_pending` | boolean | 1 model(s) | 0 |
| `material_ip_categories` | string[] | 1 model(s) | 1 |
| `mere_change_exemption_claimed` | boolean | 1 model(s) | 0 |
| `metrics` | string[] | 1 model(s) | 1 |
| `milestones` | object[] | 1 model(s) | 0 |
| `minimum_dscr` | number | 1 model(s) | 0 |
| `minimum_liquidity_cents` | integer (cents) | 2 model(s) | 1 |
| `minimum_participation_pct` | number | 1 model(s) | 0 |
| `monthly_nwc_cents` | number[] \| any[] | 1 model(s) | 1 |
| `new_money_minimum_cents` | integer (cents) | 1 model(s) | 0 |
| `new_security_value_cents` | integer (cents) | 1 model(s) | 1 |
| `new_value` | object | 1 model(s) | 0 |
| `noi_cents` | integer (cents) | 1 model(s) | 1 |
| `nol_carryforward_cents` | integer (cents) | 1 model(s) | 0 |
| `notice_days` | integer | 1 model(s) | 0 |
| `old_security_value_cents` | integer (cents) | 1 model(s) | 0 |
| `opco_ebitda_cents` | integer (cents) | 1 model(s) | 1 |
| `opening_cash_cents` | integer (cents) | 1 model(s) | 0 |
| `operating_expenses_cents` | integer (cents) | 1 model(s) | 1 |
| `option_pool_pct` | number | 1 model(s) | 1 |
| `outstanding_debt_cents` | integer (cents) | 1 model(s) | 1 |
| `parachute_payments_cents` | integer (cents) | 1 model(s) | 1 |
| `participating_debt_cents` | integer (cents) | 1 model(s) | 1 |
| `pca_items` | object[] | 1 model(s) | 1 |
| `pe_owned_target` | boolean | 1 model(s) | 0 |
| `peg_cents` | integer (cents) | 1 model(s) | 1 |
| `period_days` | integer | 1 model(s) | 0 |
| `permits` | object[] | 1 model(s) | 0 |
| `plan_payment_stream_cents` | number[] | 1 model(s) | 1 |
| `pmsi` | boolean | 1 model(s) | 1 |
| `policy_tower_pct` | number | 1 model(s) | 0 |
| `post_closing_covenants` | string[] | 1 model(s) | 0 |
| `post_default_trading_price` | number | 1 model(s) | 0 |
| `pre_money_cents` | integer (cents) | 1 model(s) | 1 |
| `pre_money_share_count` | integer | 1 model(s) | 0 |
| `priced_round_share_price_cents` | integer (cents) | 1 model(s) | 1 |
| `priming_requested` | boolean | 1 model(s) | 0 |
| `principal_cents` | integer (cents) | 2 model(s) | 2 |
| `prior_bankruptcy_count` | integer | 1 model(s) | 0 |
| `prior_recorded_real_property_interest` | boolean | 1 model(s) | 1 |
| `probabilities` | number[] | 2 model(s) | 2 |
| `professional_fee_carveout_cents` | integer (cents) | 1 model(s) | 0 |
| `projected_cash_flow_cents` | integer (cents) | 1 model(s) | 1 |
| `property_sold_under_363_or_plan` | boolean | 1 model(s) | 0 |
| `purchase_price_cents` | integer (cents) | 8 model(s) | 7 |
| `pv_lease_payments_cents` | integer (cents) | 1 model(s) | 0 |
| `real_estate_assets_cents` | integer (cents) | 1 model(s) | 1 |
| `real_estate_income_cents` | integer (cents) | 1 model(s) | 1 |
| `real_property_value_cents` | integer (cents) | 2 model(s) | 2 |
| `recognized_gain_cents` | integer (cents) | 1 model(s) | 1 |
| `recourse` | boolean | 1 model(s) | 0 |
| `recoverable_expenses_cents` | integer (cents) | 1 model(s) | 1 |
| `related_steps_planned` | boolean | 1 model(s) | 0 |
| `release_triggers` | string[] | 1 model(s) | 1 |
| `relinquished_property_value_cents` | integer (cents) | 1 model(s) | 1 |
| `remaining_years` | integer | 1 model(s) | 1 |
| `rent_roll` | object[] | 1 model(s) | 1 |
| `replacement_property_value_cents` | integer (cents) | 1 model(s) | 1 |
| `replacement_reserve_cents` | integer (cents) | 1 model(s) | 0 |
| `required_capital_cents` | integer (cents) | 1 model(s) | 1 |
| `required_cushion_pct` | number | 1 model(s) | 0 |
| `reserves_cents` | integer (cents) | 1 model(s) | 0 |
| `residential_under_5_units` | boolean | 1 model(s) | 1 |
| `residual_value_pct` | number | 1 model(s) | 0 |
| `retention_pct` | number | 1 model(s) | 0 |
| `rev_proc_2011_29_safe_harbor_elected` | boolean | 1 model(s) | 0 |
| `right_captures_entity_transfers` | boolean | 1 model(s) | 1 |
| `right_type` | string | 1 model(s) | 1 |
| `risk_premium` | number | 1 model(s) | 1 |
| `rollup_amount_cents` | integer (cents) | 1 model(s) | 0 |
| `round_size_cents` | integer (cents) | 1 model(s) | 1 |
| `rwi_present` | boolean | 3 model(s) | 0 |
| `sale_costs_cents` | integer (cents) | 1 model(s) | 0 |
| `sale_date` | string (ISO date) | 1 model(s) | 1 |
| `sale_price_cents` | integer (cents) | 2 model(s) | 2 |
| `sales_use_tax_base_cents` | integer (cents) | 1 model(s) | 0 |
| `sales_use_tax_rate` | number | 1 model(s) | 0 |
| `schedule_b_exceptions` | object[] | 1 model(s) | 0 |
| `searches` | object[] | 1 model(s) | 1 |
| `seasonality_notes` | — | 1 model(s) | 1 |
| `section_1031_exchange` | boolean | 1 model(s) | 0 |
| `section_363f_prongs` | object | 1 model(s) | 0 |
| `security_terms` | object | 1 model(s) | 1 |
| `seller_entity_type` | string | 1 model(s) | 1 |
| `seller_foreign_person` | boolean | 3 model(s) | 3 |
| `seller_indemnity_cap_pct` | number | 1 model(s) | 0 |
| `seller_marginal_tax_rate` | number | 1 model(s) | 1 |
| `seller_note_cents` | — | 1 model(s) | 1 |
| `seller_structure_tax_delta_cents` | integer (cents) | 1 model(s) | 0 |
| `seller_tax_basis_cents` | integer (cents) | 1 model(s) | 0 |
| `seller_tax_delta_cents` | integer (cents) | 1 model(s) | 1 |
| `shareholder_cleansing_vote_pct` | number | 1 model(s) | 0 |
| `special_escrows_cents` | number[] | 1 model(s) | 0 |
| `spread_bps` | integer | 1 model(s) | 1 |
| `state` | string | 6 model(s) | 3 |
| `state_apportionment_pct` | number | 1 model(s) | 1 |
| `state_tax_rate` | number | 2 model(s) | 0 |
| `stated_interest_rate` | number | 1 model(s) | 1 |
| `states_involved` | string[] | 1 model(s) | 0 |
| `step_up_benefit_rate` | number | 1 model(s) | 0 |
| `strip_percentage` | number | 1 model(s) | 1 |
| `survey_received` | boolean | 1 model(s) | 1 |
| `tangible_assets_cents` | integer (cents) | 1 model(s) | 1 |
| `target_cap_rate` | number | 1 model(s) | 1 |
| `tax_characterization` | string | 1 model(s) | 0 |
| `taxable_income_cents` | integer (cents) | 2 model(s) | 1 |
| `tenant_payments_cents` | integer (cents) | 1 model(s) | 0 |
| `tenant_pro_rata_pct` | number | 1 model(s) | 0 |
| `term_months` | integer | 1 model(s) | 1 |
| `term_years` | integer | 3 model(s) | 0 |
| `termination_events` | string[] | 1 model(s) | 0 |
| `thirteen_week_cash_need_cents` | integer (cents) | 1 model(s) | 1 |
| `time_to_recovery_years` | integer | 1 model(s) | 1 |
| `title_commitment_received` | boolean | 1 model(s) | 1 |
| `toggle_type` | string | 1 model(s) | 0 |
| `total_assets_cents` | integer (cents) | 1 model(s) | 1 |
| `total_income_cents` | integer (cents) | 1 model(s) | 1 |
| `tranches` | object[] | 1 model(s) | 1 |
| `transaction_costs` | object[] | 1 model(s) | 1 |
| `transaction_form` | string | 1 model(s) | 1 |
| `transaction_value_cents` | integer (cents) | 3 model(s) | 3 |
| `transfer_assets` | object[] | 1 model(s) | 1 |
| `transfer_date` | string (ISO date) | 1 model(s) | 1 |
| `transfer_kind` | string | 1 model(s) | 0 |
| `transfer_pct` | integer | 1 model(s) | 1 |
| `transfer_tax_rate` | number | 1 model(s) | 0 |
| `transfer_type` | string | 1 model(s) | 1 |
| `treasury_rate` | number | 1 model(s) | 1 |
| `trustee_fee_cents` | integer (cents) | 1 model(s) | 0 |
| `update_frequency_months` | integer | 1 model(s) | 0 |
| `use_change` | boolean | 1 model(s) | 0 |
| `valuation_cap_cents` | integer (cents) | 1 model(s) | 0 |
| `vesting_form` | string | 1 model(s) | 1 |
| `warrant_coverage_pct` | number | 1 model(s) | 1 |


---

# Gates


# G1 — Gate G1

> **Registry narrative pending founder approval** — drafted name, purpose, and formal trigger predicate are in review (see the gate-registry draft). The routed models below are authoritative.

## Models routed through G1

| Slot | Model | Status |
|---|---|---|
| [M206](../models/M206.md) | Indemnification ladder engine | Normative |
| [M207](../models/M207.md) | Survival period engine | Normative |
| [M217](../models/M217.md) | Standard IP representation set | Normative |


# G2 — Gate G2

> **Registry narrative pending founder approval** — drafted name, purpose, and formal trigger predicate are in review (see the gate-registry draft). The routed models below are authoritative.

## Models routed through G2

| Slot | Model | Status |
|---|---|---|
| [M187](../models/M187.md) | RE-heavy asset-vs-entity election | Normative |
| [M188](../models/M188.md) | RE/operating-business purchase price bifurcation | Normative |
| [M194](../models/M194.md) | OpCo/PropCo separation mechanics | Normative |
| [M200](../models/M200.md) | Transaction tax master engine | Normative |
| [M201](../models/M201.md) | 338(h)(10) and 336(e) gross-up math | Normative |
| [M202](../models/M202.md) | 1374 built-in gains tax | Normative |
| [M203](../models/M203.md) | Transaction cost capitalization | Normative |
| [M204](../models/M204.md) | Imputed interest, OID, and 453A | Normative |
| [M205](../models/M205.md) | SALT transaction engine | Normative |
| [M222](../models/M222.md) | IP-specific 1060 allocation | Normative |
| [M234](../models/M234.md) | Fixture classification and UCC 9-334 priority | Normative |


# G6 — Gate G6

> **Registry narrative pending founder approval** — drafted name, purpose, and formal trigger predicate are in review (see the gate-registry draft). The routed models below are authoritative.

## Models routed through G6

| Slot | Model | Status |
|---|---|---|
| [M211](../models/M211.md) | Conditions-to-close logic engine | Normative |


# G7 — Gate G7

> **Registry narrative pending founder approval** — drafted name, purpose, and formal trigger predicate are in review (see the gate-registry draft). The routed models below are authoritative.

## Models routed through G7

| Slot | Model | Status |
|---|---|---|
| [M108](../models/M108.md) | RWI primary architecture | Catalog |
| [M123](../models/M123.md) | MAE durational significance | Catalog |
| [M128](../models/M128.md) | HSR reportability | Normative |
| [M144](../models/M144.md) | Carve-out stranded-cost and TSA scoping | Catalog |
| [M210](../models/M210.md) | Closing-statement true-up sequence | Normative |
| [M211](../models/M211.md) | Conditions-to-close logic engine | Normative |
| [M212](../models/M212.md) | Termination and break/reverse-break fee engine | Normative |


# G8 — Gate G8

> **Registry narrative pending founder approval** — drafted name, purpose, and formal trigger predicate are in review (see the gate-registry draft). The routed models below are authoritative.

## Models routed through G8

| Slot | Model | Status |
|---|---|---|
| [M206](../models/M206.md) | Indemnification ladder engine | Normative |
| [M207](../models/M207.md) | Survival period engine | Normative |
| [M208](../models/M208.md) | Escrow and holdback sizing | Normative |
| [M209](../models/M209.md) | RWI stack architecture | Normative |


# G9 — Gate G9

> **Registry narrative pending founder approval** — drafted name, purpose, and formal trigger predicate are in review (see the gate-registry draft). The routed models below are authoritative.

## Models routed through G9

| Slot | Model | Status |
|---|---|---|
| [M213](../models/M213.md) | Earnout architecture and dispute | Normative |


# G10 — Gate G10

> **Registry narrative pending founder approval** — drafted name, purpose, and formal trigger predicate are in review (see the gate-registry draft). The routed models below are authoritative.

## Models routed through G10

| Slot | Model | Status |
|---|---|---|
| [M214](../models/M214.md) | IP chain-of-title verification | Normative |
| [M215](../models/M215.md) | IP encumbrance and lien search | Normative |
| [M216](../models/M216.md) | License in/out dependency map | Normative |
| [M217](../models/M217.md) | Standard IP representation set | Normative |
| [M218](../models/M218.md) | Carve-out and license-back mechanics | Normative |
| [M219](../models/M219.md) | Source-code and IP escrow mechanics | Normative |
| [M220](../models/M220.md) | Employee IP assignment verification | Normative |
| [M221](../models/M221.md) | OSS exposure diligence process | Normative |
| [M222](../models/M222.md) | IP-specific 1060 allocation | Normative |
| [M223](../models/M223.md) | Domain and trademark transfer mechanics | Normative |


# G14 — Gate G14

> **Registry narrative pending founder approval** — drafted name, purpose, and formal trigger predicate are in review (see the gate-registry draft). The routed models below are authoritative.

## Models routed through G14

| Slot | Model | Status |
|---|---|---|
| [M101](../models/M101.md) | QSBS post-OBBBA | Catalog |
| [M109](../models/M109.md) | Working capital peg | Normative |


# G15 — Gate G15

> **Registry narrative pending founder approval** — drafted name, purpose, and formal trigger predicate are in review (see the gate-registry draft). The routed models below are authoritative.

## Models routed through G15

| Slot | Model | Status |
|---|---|---|
| [M101](../models/M101.md) | QSBS post-OBBBA | Catalog |
| [M102](../models/M102.md) | ESOP deferral | Catalog |
| [M103](../models/M103.md) | F-reorg plus 721 contribution | Catalog |
| [M104](../models/M104.md) | Installment sale | Catalog |
| [M105](../models/M105.md) | 338(h)(10) election | Catalog |
| [M108](../models/M108.md) | RWI primary architecture | Catalog |
| [M109](../models/M109.md) | Working capital peg | Normative |
| [M111](../models/M111.md) | Revenue earnout | Normative |
| [M112](../models/M112.md) | EBITDA earnout | Normative |
| [M113](../models/M113.md) | Gross-profit earnout | Catalog |
| [M114](../models/M114.md) | Customer-retention earnout | Catalog |
| [M115](../models/M115.md) | Regulatory-milestone earnout | Catalog |
| [M119](../models/M119.md) | SBA 7(a) post-SOP 50 10 8 | Normative |
| [M121](../models/M121.md) | Up-C and TRA | Catalog |
| [M122](../models/M122.md) | Unitranche intercreditor | Catalog |
| [M123](../models/M123.md) | MAE durational significance | Catalog |
| [M124](../models/M124.md) | Ordinary-course covenant | Catalog |
| [M125](../models/M125.md) | Specific performance | Catalog |
| [M126](../models/M126.md) | SB 21 cleansing | Catalog |
| [M127](../models/M127.md) | MFW dual-prong | Catalog |
| [M135](../models/M135.md) | Fairness-opinion scaffolding | Catalog |
| [M136](../models/M136.md) | Fraudulent-transfer baseline | Catalog |
| [M139](../models/M139.md) | 1060 seven-class allocation | Normative |
| [M140](../models/M140.md) | Tax-free reorganization qualification | Catalog |
| [M141](../models/M141.md) | 251(h) eligibility and top-up | Catalog |
| [M142](../models/M142.md) | Tender offer mechanics | Catalog |
| [M143](../models/M143.md) | 355 spin and 355(e) test | Catalog |
| [M144](../models/M144.md) | Carve-out stranded-cost and TSA scoping | Catalog |
| [M145](../models/M145.md) | 721/351 contribution plus 704(c) | Catalog |
| [M146](../models/M146.md) | Cap-table waterfall | Normative |
| [M147](../models/M147.md) | PIPE 19.99 percent approval trigger | Catalog |
| [M148](../models/M148.md) | Three-prong solvency | Normative |
| [M149](../models/M149.md) | DGCL 170 distributable surplus | Catalog |
| [M150](../models/M150.md) | 108 CODI plus 382 limitation | Catalog |
| [M180](../models/M180.md) | Convertible and SAFE conversion | Normative |
| [M181](../models/M181.md) | Venture-debt warrant coverage | Normative |
| [M182](../models/M182.md) | ABL borrowing base | Normative |
| [M183](../models/M183.md) | Make-whole and call protection | Normative |
| [M184](../models/M184.md) | Covenant basket engine | Normative |
| [M185](../models/M185.md) | 280G golden parachute | Normative |
| [M186](../models/M186.md) | 382 NOL limitation | Normative |
| [M199](../models/M199.md) | FIRPTA withholding v1.1 | Normative |


# G19 — Gate G19

> **Registry narrative pending founder approval** — drafted name, purpose, and formal trigger predicate are in review (see the gate-registry draft). The routed models below are authoritative.

## Models routed through G19

| Slot | Model | Status |
|---|---|---|
| [M191](../models/M191.md) | Real estate transfer and controlling-interest tax | Normative |
| [M200](../models/M200.md) | Transaction tax master engine | Normative |
| [M205](../models/M205.md) | SALT transaction engine | Normative |
| [M232](../models/M232.md) | Controlling-interest transfer-tax and reassessment screener | Normative |
| [M233](../models/M233.md) | Permit/CO transferability and bulk-sales screener | Normative |


# G23 — Gate G23

> **Registry narrative pending founder approval** — drafted name, purpose, and formal trigger predicate are in review (see the gate-registry draft). The routed models below are authoritative.

## Models routed through G23

| Slot | Model | Status |
|---|---|---|
| [M106](../models/M106.md) | English warranty and indemnity architecture | Catalog |
| [M107](../models/M107.md) | International merger-control thresholds | Catalog |
| [M110](../models/M110.md) | English MAC | Catalog |


# G24 — Gate G24

> **Registry narrative pending founder approval** — drafted name, purpose, and formal trigger predicate are in review (see the gate-registry draft). The routed models below are authoritative.

## Models routed through G24

| Slot | Model | Status |
|---|---|---|
| [M129](../models/M129.md) | EU AI Act risk tier | Catalog |
| [M130](../models/M130.md) | Cyber diligence | Catalog |
| [M131](../models/M131.md) | Privacy diligence | Catalog |
| [M132](../models/M132.md) | Sanctions diligence | Catalog |
| [M133](../models/M133.md) | ESG diligence | Catalog |
| [M134](../models/M134.md) | Climate diligence | Catalog |


# G26 — Gate G26

> **Registry narrative pending founder approval** — drafted name, purpose, and formal trigger predicate are in review (see the gate-registry draft). The routed models below are authoritative.

## Models routed through G26

| Slot | Model | Status |
|---|---|---|
| [M120](../models/M120.md) | Continuation-fund LP waterfall | Catalog |
| [M177](../models/M177.md) | LP-secondary plus ECI withholding | Normative |
| [M178](../models/M178.md) | Strip-sale pricing | Normative |
| [M179](../models/M179.md) | NAV facility LTV | Normative |


# G27 — Gate G27

> **Registry narrative pending founder approval** — drafted name, purpose, and formal trigger predicate are in review (see the gate-registry draft). The routed models below are authoritative.

## Models routed through G27

| Slot | Model | Status |
|---|---|---|
| [M102](../models/M102.md) | ESOP deferral | Catalog |
| [M116](../models/M116.md) | Independent-sponsor tiered promote | Catalog |
| [M117](../models/M117.md) | Search-fund step-up | Catalog |
| [M118](../models/M118.md) | Leveraged ESOP cash flow | Catalog |


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

| Slot | Model | Status |
|---|---|---|
| [M148](../models/M148.md) | Three-prong solvency | Normative |
| [M151](../models/M151.md) | 363 asset sale mechanics | Normative |
| [M152](../models/M152.md) | Plan feasibility | Normative |
| [M153](../models/M153.md) | Best-interests-of-creditors | Normative |
| [M154](../models/M154.md) | Absolute priority rule and new value | Normative |
| [M155](../models/M155.md) | Cramdown interest rate | Normative |
| [M156](../models/M156.md) | 1111(b) election trade-off | Normative |
| [M157](../models/M157.md) | 726 Chapter 7 waterfall | Normative |
| [M158](../models/M158.md) | 364 DIP sizing | Normative |
| [M159](../models/M159.md) | Fulcrum security | Normative |
| [M164](../models/M164.md) | RSA economics | Normative |
| [M165](../models/M165.md) | ABC and Article 9 foreclosure recovery | Normative |
| [M166](../models/M166.md) | Claims trading recovery | Normative |
| [M167](../models/M167.md) | Subchapter V eligibility | Normative |
| [M168](../models/M168.md) | Chapter 22 recidivism score | Normative |


# G29 — Capital Structure & Liability Management

Runs recap, exchange-offer, covenant, DIP, convertible, ABL, make-whole, and LME mechanics.

## Trigger conditions

- maintenance-covenant breach projected within four quarters
- secured debt trades below 80 cents
- balance-sheet alteration, LME, recap, exchange offer, or covenant amendment appears

## Boundary notes

LME models ship research-only until case law stabilizes; outputs are math and contract-language flags for counsel.

## Models routed through G29

| Slot | Model | Status |
|---|---|---|
| [M136](../models/M136.md) | Fraudulent-transfer baseline | Catalog |
| [M148](../models/M148.md) | Three-prong solvency | Normative |
| [M150](../models/M150.md) | 108 CODI plus 382 limitation | Catalog |
| [M158](../models/M158.md) | 364 DIP sizing | Normative |
| [M160](../models/M160.md) | Exchange offer and distressed-debt exchange | Normative |
| [M161](../models/M161.md) | Uptier capacity and sacred rights | Catalog |
| [M162](../models/M162.md) | Drop-down basket capacity | Catalog |
| [M163](../models/M163.md) | Double-dip and pari-plus claim multiplier | Catalog |
| [M164](../models/M164.md) | RSA economics | Normative |
| [M180](../models/M180.md) | Convertible and SAFE conversion | Normative |
| [M181](../models/M181.md) | Venture-debt warrant coverage | Normative |
| [M182](../models/M182.md) | ABL borrowing base | Normative |
| [M183](../models/M183.md) | Make-whole and call protection | Normative |
| [M184](../models/M184.md) | Covenant basket engine | Normative |


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

| Slot | Model | Status |
|---|---|---|
| [M169](../models/M169.md) | FIRPTA withholding | Normative |
| [M170](../models/M170.md) | 1031 like-kind exchange timing | Normative |
| [M171](../models/M171.md) | Sale-leaseback and ASC 842 | Normative |
| [M172](../models/M172.md) | REIT 75/75/90 compliance triad | Normative |
| [M173](../models/M173.md) | Project-finance coverage suite | Catalog |
| [M174](../models/M174.md) | Crypto token taxonomy | Catalog |
| [M175](../models/M175.md) | GENIUS Act stablecoin PPS test | Catalog |
| [M176](../models/M176.md) | Digital-asset broker reporting | Catalog |
| [M177](../models/M177.md) | LP-secondary plus ECI withholding | Normative |
| [M178](../models/M178.md) | Strip-sale pricing | Normative |
| [M179](../models/M179.md) | NAV facility LTV | Normative |
| [M187](../models/M187.md) | RE-heavy asset-vs-entity election | Normative |
| [M188](../models/M188.md) | RE/operating-business purchase price bifurcation | Normative |
| [M189](../models/M189.md) | Rent-roll normalization engine | Normative |
| [M190](../models/M190.md) | NOI normalization and cap-rate bridge | Normative |
| [M191](../models/M191.md) | Real estate transfer and controlling-interest tax | Normative |
| [M192](../models/M192.md) | CAM reconciliation mechanics | Normative |
| [M193](../models/M193.md) | Lease abstraction schema | Normative |
| [M194](../models/M194.md) | OpCo/PropCo separation mechanics | Normative |
| [M195](../models/M195.md) | Property-level escrow and holdback sizing | Normative |
| [M196](../models/M196.md) | Title and survey process checklist | Normative |
| [M197](../models/M197.md) | Ground lease vs. fee simple mechanics | Normative |
| [M198](../models/M198.md) | PCA reserve modeling | Normative |
| [M199](../models/M199.md) | FIRPTA withholding v1.1 | Normative |
| [M224](../models/M224.md) | Recording-act and priority engine | Normative |
| [M225](../models/M225.md) | Title-covenant and estate/signatory model | Normative |
| [M226](../models/M226.md) | Marketability triage | Normative |
| [M227](../models/M227.md) | Risk-of-loss allocator | Normative |
| [M228](../models/M228.md) | Survival and merger tracker | Normative |
| [M229](../models/M229.md) | Lease anti-assignment and change-of-control parser | Normative |
| [M230](../models/M230.md) | Due-on-sale screener | Normative |
| [M231](../models/M231.md) | Option/ROFR/ROFO trigger detector | Normative |
| [M232](../models/M232.md) | Controlling-interest transfer-tax and reassessment screener | Normative |
| [M233](../models/M233.md) | Permit/CO transferability and bulk-sales screener | Normative |
| [M234](../models/M234.md) | Fixture classification and UCC 9-334 priority | Normative |


---

# Model Catalog


# M101 — QSBS post-OBBBA

**Status:** Catalog (informative) — normative specification scheduled
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G14, G15
**Deal contexts:** founder sale · rollover

## 1. Purpose

Per-issuer cap, holding period, and exclusion percentage.

> **Catalog status.** This entry is informative: it maps the slot's purpose, boundary, routing, and authorities. It is NOT implementable from this document alone — the normative contract (I/O schemas, algorithm, worked example, conformance bindings) is scheduled for a future spec version.

## Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## Authorities

- AUTH-0126 — IRC 1202
- AUTH-0219 — OBBBA 2025


# M102 — ESOP deferral

**Status:** Catalog (informative) — normative specification scheduled
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G15, G27
**Deal contexts:** ESOP sale

## 1. Purpose

30 percent post-sale ownership and qualified replacement property timing.

> **Catalog status.** This entry is informative: it maps the slot's purpose, boundary, routing, and authorities. It is NOT implementable from this document alone — the normative contract (I/O schemas, algorithm, worked example, conformance bindings) is scheduled for a future spec version.

## Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## Authorities

- AUTH-0123 — IRC 1042


# M103 — F-reorg plus 721 contribution

**Status:** Catalog (informative) — normative specification scheduled
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G15
**Deal contexts:** carve-out · joint venture

## 1. Purpose

F-reorg sequence and contribution qualification checks.

> **Catalog status.** This entry is informative: it maps the slot's purpose, boundary, routing, and authorities. It is NOT implementable from this document alone — the normative contract (I/O schemas, algorithm, worked example, conformance bindings) is scheduled for a future spec version.

## Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## Authorities

- AUTH-0145 — IRC 368(a)(1)(F)
- AUTH-0154 — IRC 721


# M104 — Installment sale

**Status:** Catalog (informative) — normative specification scheduled
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G15
**Deal contexts:** deferred consideration

## 1. Purpose

Gross-profit ratio, recapture, pledge, and recognition schedule.

> **Catalog status.** This entry is informative: it maps the slot's purpose, boundary, routing, and authorities. It is NOT implementable from this document alone — the normative contract (I/O schemas, algorithm, worked example, conformance bindings) is scheduled for a future spec version.

## Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## Authorities

- AUTH-0148 — IRC 453


# M105 — 338(h)(10) election

**Status:** Catalog (informative) — normative specification scheduled
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G15
**Deal contexts:** stock purchase

## 1. Purpose

Deemed asset sale, adjusted grossed-up basis, and class allocation bridge.

> **Catalog status.** This entry is informative: it maps the slot's purpose, boundary, routing, and authorities. It is NOT implementable from this document alone — the normative contract (I/O schemas, algorithm, worked example, conformance bindings) is scheduled for a future spec version.

## Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## Authorities

- AUTH-0139 — IRC 338


# M106 — English warranty and indemnity architecture

**Status:** Catalog (informative) — normative specification scheduled
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G23
**Deal contexts:** UK M&A

## 1. Purpose

Coverage limit, de minimis, basket, and exclusion schedule.

> **Catalog status.** This entry is informative: it maps the slot's purpose, boundary, routing, and authorities. It is NOT implementable from this document alone — the normative contract (I/O schemas, algorithm, worked example, conformance bindings) is scheduled for a future spec version.

## Boundary statement

This model produces deterministic schedules and routing only. The governing determination for english warranty and indemnity architecture is a licensed-professional conclusion; a conforming implementation MUST route that determination (with the model's workpapers) and MUST NOT emit it.

## Authorities

- AUTH-0302 — UK market practice


# M107 — International merger-control thresholds

**Status:** Catalog (informative) — normative specification scheduled
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G23
**Deal contexts:** international M&A

## 1. Purpose

Turnover, asset, and substantial-lessening tests by jurisdiction.

> **Catalog status.** This entry is informative: it maps the slot's purpose, boundary, routing, and authorities. It is NOT implementable from this document alone — the normative contract (I/O schemas, algorithm, worked example, conformance bindings) is scheduled for a future spec version.

## Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## Authorities

- AUTH-0079 — EU Merger Regulation 139/2004
- AUTH-0301 — UK Enterprise Act 2002


# M108 — RWI primary architecture

**Status:** Catalog (informative) — normative specification scheduled
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G7, G15
**Deal contexts:** insured M&A

## 1. Purpose

Limit, retention, exclusions, and broker-ready architecture.

> **Catalog status.** This entry is informative: it maps the slot's purpose, boundary, routing, and authorities. It is NOT implementable from this document alone — the normative contract (I/O schemas, algorithm, worked example, conformance bindings) is scheduled for a future spec version.

## Boundary statement

This model produces deterministic schedules and routing only. The governing determination for rwi primary architecture is a licensed-professional conclusion; a conforming implementation MUST route that determination (with the model's workpapers) and MUST NOT emit it.

## Authorities

- AUTH-0255 — SRS Acquiom
- AUTH-0245 — RWI market studies


# M109 — Working capital peg

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G14, G15
**Deal contexts:** cash deals

## 1. Purpose

Target, peg, true-up, and collar math.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M109.schema.json`](M109.schema.json).

| Field | Type | Required |
|---|---|---|
| `closing_balance_cents` | — | MUST |
| `monthly_nwc_cents` | number[] \| any[] | MUST |
| `seasonality_notes` | — | MUST |

## 3. Output contract

| Field | Type |
|---|---|
| `high_cents` | integer (cents) |
| `low_cents` | integer (cents) |
| `observed_months` | integer |
| `peg_cents` | integer (cents) |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Target, peg, true-up, and collar math.

Builds a trailing-period NWC peg and flags deal-structure language for counsel review.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| ABA Private Target Deal Points Study | AUTH-0029 | study/dataset |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.STRUCT.NWC.PEG.001` — *Working capital peg averages supplied months*.

**Inputs**

```json
{
  "monthly_nwc_cents": [
    100000,
    200000,
    300000
  ]
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "peg_cents": 200000,
  "observed_months": 3,
  "low_cents": 100000,
  "high_cents": 300000
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["monthly_nwc_cents"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## 9. Conformance bindings

Requirement `REQ-M109` is verified by 2 published case(s): `CONF.MODEL.STRUCT.NWC.PEG.001`, `CONF.MODEL.STRUCT.NWC.PEG.002`.

## 10. Version

Reference binding `MODEL.STRUCT.NWC.PEG.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M110 — English MAC

**Status:** Catalog (informative) — normative specification scheduled
**Boundary classification:** Research scaffold — organizes authorities and considerations; not an executable determination.
**Gates:** G23
**Deal contexts:** UK M&A

## 1. Purpose

Framework mapping for durational-significance research.

> **Catalog status.** This entry is informative: it maps the slot's purpose, boundary, routing, and authorities. It is NOT implementable from this document alone — the normative contract (I/O schemas, algorithm, worked example, conformance bindings) is scheduled for a future spec version.

## Boundary statement

Research scaffold: organizes authorities and considerations. Produces oriented reading, not determinations.

## Authorities

- AUTH-0074 — English MAC case law


# M111 — Revenue earnout

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G15
**Deal contexts:** earnout

## 1. Purpose

Metric threshold, period, probability, and expected-value schedule.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M111.schema.json`](M111.schema.json).

| Field | Type | Required |
|---|---|---|
| `discount_rate` | number | MUST |
| `earnout_targets` | number[] | MUST |
| `probabilities` | number[] | MUST |
| `term_years` | integer | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `expected_gross_cents` | integer (cents) |
| `expected_present_value_cents` | integer (cents) |
| `scenarios` | object[] |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Metric threshold, period, probability, and expected-value schedule.

Calculates probability-weighted earnout value and negotiation sensitivity.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| ABA Private Target Deal Points Study | AUTH-0029 | study/dataset |
| SRS Acquiom | AUTH-0255 | practice-or-guidance |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.STRUCT.EARNOUT.MC.001` — *Earnout model computes probability-weighted present value*.

**Inputs**

```json
{
  "earnout_targets": [
    100000,
    200000
  ],
  "probabilities": [
    0.5,
    0.25
  ],
  "discount_rate": 0.1,
  "term_years": 1
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "expected_gross_cents": 100000,
  "expected_present_value_cents": 90909,
  "scenarios": [
    {
      "target_cents": 100000,
      "probability": 0.5
    },
    {
      "target_cents": 200000,
      "probability": 0.25
    }
  ]
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["earnout_targets","probabilities","discount_rate"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## 9. Conformance bindings

Requirement `REQ-M111` is verified by 1 published case(s): `CONF.MODEL.STRUCT.EARNOUT.MC.001`.

## 10. Version

Reference binding `MODEL.STRUCT.EARNOUT.MC.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M112 — EBITDA earnout

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G15
**Deal contexts:** earnout

## 1. Purpose

EBITDA target, add-back policy, and expected-value schedule.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M112.schema.json`](M112.schema.json).

| Field | Type | Required |
|---|---|---|
| `discount_rate` | number | MUST |
| `earnout_targets` | number[] | MUST |
| `probabilities` | number[] | MUST |
| `term_years` | integer | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `expected_gross_cents` | integer (cents) |
| `expected_present_value_cents` | integer (cents) |
| `scenarios` | object[] |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

EBITDA target, add-back policy, and expected-value schedule.

Calculates probability-weighted earnout value and negotiation sensitivity.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| ABA Private Target Deal Points Study | AUTH-0029 | study/dataset |
| SRS Acquiom | AUTH-0255 | practice-or-guidance |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.STRUCT.EARNOUT.MC.001` — *Earnout model computes probability-weighted present value*.

**Inputs**

```json
{
  "earnout_targets": [
    100000,
    200000
  ],
  "probabilities": [
    0.5,
    0.25
  ],
  "discount_rate": 0.1,
  "term_years": 1
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "expected_gross_cents": 100000,
  "expected_present_value_cents": 90909,
  "scenarios": [
    {
      "target_cents": 100000,
      "probability": 0.5
    },
    {
      "target_cents": 200000,
      "probability": 0.25
    }
  ]
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["earnout_targets","probabilities","discount_rate"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## 9. Conformance bindings

Requirement `REQ-M112` is verified by 1 published case(s): `CONF.MODEL.STRUCT.EARNOUT.MC.001`.

## 10. Version

Reference binding `MODEL.STRUCT.EARNOUT.MC.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M113 — Gross-profit earnout

**Status:** Catalog (informative) — normative specification scheduled
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G15
**Deal contexts:** earnout

## 1. Purpose

Gross-profit threshold and payout sensitivity.

> **Catalog status.** This entry is informative: it maps the slot's purpose, boundary, routing, and authorities. It is NOT implementable from this document alone — the normative contract (I/O schemas, algorithm, worked example, conformance bindings) is scheduled for a future spec version.

## Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## Authorities

- AUTH-0029 — ABA Private Target Deal Points Study
- AUTH-0255 — SRS Acquiom


# M114 — Customer-retention earnout

**Status:** Catalog (informative) — normative specification scheduled
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G15
**Deal contexts:** earnout

## 1. Purpose

Retention cohort, payout tiers, and probability-weighted value.

> **Catalog status.** This entry is informative: it maps the slot's purpose, boundary, routing, and authorities. It is NOT implementable from this document alone — the normative contract (I/O schemas, algorithm, worked example, conformance bindings) is scheduled for a future spec version.

## Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## Authorities

- AUTH-0029 — ABA Private Target Deal Points Study
- AUTH-0255 — SRS Acquiom


# M115 — Regulatory-milestone earnout

**Status:** Catalog (informative) — normative specification scheduled
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G15
**Deal contexts:** earnout

## 1. Purpose

Milestone trigger, date window, and payout schedule.

> **Catalog status.** This entry is informative: it maps the slot's purpose, boundary, routing, and authorities. It is NOT implementable from this document alone — the normative contract (I/O schemas, algorithm, worked example, conformance bindings) is scheduled for a future spec version.

## Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## Authorities

- AUTH-0029 — ABA Private Target Deal Points Study
- AUTH-0255 — SRS Acquiom


# M116 — Independent-sponsor tiered promote

**Status:** Catalog (informative) — normative specification scheduled
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G27
**Deal contexts:** independent sponsor · search fund

## 1. Purpose

Carry tiers, catch-up, and promote allocation.

> **Catalog status.** This entry is informative: it maps the slot's purpose, boundary, routing, and authorities. It is NOT implementable from this document alone — the normative contract (I/O schemas, algorithm, worked example, conformance bindings) is scheduled for a future spec version.

## Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## Authorities

- AUTH-0098 — fund formation market practice


# M117 — Search-fund step-up

**Status:** Catalog (informative) — normative specification scheduled
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G27
**Deal contexts:** search fund

## 1. Purpose

Search investor step-up and promote conversion math.

> **Catalog status.** This entry is informative: it maps the slot's purpose, boundary, routing, and authorities. It is NOT implementable from this document alone — the normative contract (I/O schemas, algorithm, worked example, conformance bindings) is scheduled for a future spec version.

## Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## Authorities

- AUTH-0078 — ETA market norms


# M118 — Leveraged ESOP cash flow

**Status:** Catalog (informative) — normative specification scheduled
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G27
**Deal contexts:** ESOP

## 1. Purpose

ESOP debt-service and trustee-facing cash-flow schedule.

> **Catalog status.** This entry is informative: it maps the slot's purpose, boundary, routing, and authorities. It is NOT implementable from this document alone — the normative contract (I/O schemas, algorithm, worked example, conformance bindings) is scheduled for a future spec version.

## Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## Authorities

- AUTH-0073 — DOL ESOP guidance


# M119 — SBA 7(a) post-SOP 50 10 8

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G15
**Deal contexts:** SMB acquisition

## 1. Purpose

Eligibility, cap, equity injection, and amortization checks.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M119.schema.json`](M119.schema.json).

| Field | Type | Required |
|---|---|---|
| `buyer_equity_cents` | integer (cents) | MUST |
| `cash_flow_cents` | integer (cents) | MUST |
| `purchase_price_cents` | integer (cents) | MUST |
| `seller_note_cents` | — | MUST |
| `annual_debt_service_cents` | integer (cents) | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `buyer_equity_pct` | number |
| `dscr` | number \| integer |
| `max_7a_loan_cents` | integer (cents) |
| `meets_sba_dscr_floor` | boolean |
| `meets_sba_equity_floor` | boolean |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Eligibility, cap, equity injection, and amortization checks.

Checks SBA acquisition debt capacity, equity injection, citizenship, seller-note standby, and DSCR.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| SBA SOP 50 10 8 | AUTH-0247 | practice-or-guidance |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.LBO.SBA.001` — *SBA LBO checks equity and DSCR floors*.

**Inputs**

```json
{
  "purchase_price_cents": 1000000,
  "cash_flow_cents": 200000,
  "buyer_equity_cents": 100000,
  "annual_debt_service_cents": 150000
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "buyer_equity_pct": 0.1,
  "dscr": 1.33,
  "meets_sba_equity_floor": true,
  "meets_sba_dscr_floor": true,
  "max_7a_loan_cents": 500000000
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["purchase_price_cents","cash_flow_cents","buyer_equity_cents","annual_debt_service_cents"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## 9. Conformance bindings

Requirement `REQ-M119` is verified by 2 published case(s): `CONF.MODEL.LBO.SBA.001`, `CONF.MODEL.LBO.SBA.002`.

## 10. Version

Reference binding `MODEL.LBO.SBA.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M120 — Continuation-fund LP waterfall

**Status:** Catalog (informative) — normative specification scheduled
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G26
**Deal contexts:** GP-led secondary

## 1. Purpose

Preference, carry reset, and rollover economics for counsel review.

> **Catalog status.** This entry is informative: it maps the slot's purpose, boundary, routing, and authorities. It is NOT implementable from this document alone — the normative contract (I/O schemas, algorithm, worked example, conformance bindings) is scheduled for a future spec version.

## Boundary statement

This model produces deterministic schedules and routing only. The governing determination for continuation-fund lp waterfall is a licensed-professional conclusion; a conforming implementation MUST route that determination (with the model's workpapers) and MUST NOT emit it.

## Authorities

- AUTH-0108 — ILPA continuation-fund guidance


# M121 — Up-C and TRA

**Status:** Catalog (informative) — normative specification scheduled
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G15
**Deal contexts:** Up-C IPO · tax receivable agreement

## 1. Purpose

Basis step-up and 85/15 tax receivable agreement value.

> **Catalog status.** This entry is informative: it maps the slot's purpose, boundary, routing, and authorities. It is NOT implementable from this document alone — the normative contract (I/O schemas, algorithm, worked example, conformance bindings) is scheduled for a future spec version.

## Boundary statement

This model produces deterministic schedules and routing only. The governing determination for up-c and tra is a licensed-professional conclusion; a conforming implementation MUST route that determination (with the model's workpapers) and MUST NOT emit it.

## Authorities

- AUTH-0155 — IRC 754
- AUTH-0281 — TRA market practice


# M122 — Unitranche intercreditor

**Status:** Catalog (informative) — normative specification scheduled
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G15
**Deal contexts:** unitranche financing

## 1. Purpose

First-out/last-out payment waterfall and AAL economics.

> **Catalog status.** This entry is informative: it maps the slot's purpose, boundary, routing, and authorities. It is NOT implementable from this document alone — the normative contract (I/O schemas, algorithm, worked example, conformance bindings) is scheduled for a future spec version.

## Boundary statement

This model produces deterministic schedules and routing only. The governing determination for unitranche intercreditor is a licensed-professional conclusion; a conforming implementation MUST route that determination (with the model's workpapers) and MUST NOT emit it.

## Authorities

- AUTH-0184 — LSTA model AAL


# M123 — MAE durational significance

**Status:** Catalog (informative) — normative specification scheduled
**Boundary classification:** Research scaffold — organizes authorities and considerations; not an executable determination.
**Gates:** G7, G15
**Deal contexts:** M&A litigation research

## 1. Purpose

Research scaffold for MAE facts and duration flags.

> **Catalog status.** This entry is informative: it maps the slot's purpose, boundary, routing, and authorities. It is NOT implementable from this document alone — the normative contract (I/O schemas, algorithm, worked example, conformance bindings) is scheduled for a future spec version.

## Boundary statement

Research scaffold: organizes authorities and considerations. Produces oriented reading, not determinations.

## Authorities

- AUTH-0033 — Akorn
- AUTH-0095 — Frontier
- AUTH-0059 — Channel Medsystems


# M124 — Ordinary-course covenant

**Status:** Catalog (informative) — normative specification scheduled
**Boundary classification:** Research scaffold — organizes authorities and considerations; not an executable determination.
**Gates:** G15
**Deal contexts:** M&A litigation research

## 1. Purpose

Research scaffold for ordinary-course operating deviations.

> **Catalog status.** This entry is informative: it maps the slot's purpose, boundary, routing, and authorities. It is NOT implementable from this document alone — the normative contract (I/O schemas, algorithm, worked example, conformance bindings) is scheduled for a future spec version.

## Boundary statement

Research scaffold: organizes authorities and considerations. Produces oriented reading, not determinations.

## Authorities

- AUTH-0021 — AB Stable


# M125 — Specific performance

**Status:** Catalog (informative) — normative specification scheduled
**Boundary classification:** Research scaffold — organizes authorities and considerations; not an executable determination.
**Gates:** G15
**Deal contexts:** M&A litigation research

## 1. Purpose

Research scaffold for remedy availability.

> **Catalog status.** This entry is informative: it maps the slot's purpose, boundary, routing, and authorities. It is NOT implementable from this document alone — the normative contract (I/O schemas, algorithm, worked example, conformance bindings) is scheduled for a future spec version.

## Boundary statement

Research scaffold: organizes authorities and considerations. Produces oriented reading, not determinations.

## Authorities

- AUTH-0069 — Delaware equitable-remedy case law


# M126 — SB 21 cleansing

**Status:** Catalog (informative) — normative specification scheduled
**Boundary classification:** Research scaffold — organizes authorities and considerations; not an executable determination.
**Gates:** G15
**Deal contexts:** Delaware controller deal

## 1. Purpose

Controller-cleansing decision tree for counsel review.

> **Catalog status.** This entry is informative: it maps the slot's purpose, boundary, routing, and authorities. It is NOT implementable from this document alone — the normative contract (I/O schemas, algorithm, worked example, conformance bindings) is scheduled for a future spec version.

## Boundary statement

Research scaffold: organizes authorities and considerations. Produces oriented reading, not determinations.

## Authorities

- AUTH-0072 — DGCL SB 21
- AUTH-0244 — Rutledge v. Clearway


# M127 — MFW dual-prong

**Status:** Catalog (informative) — normative specification scheduled
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G15
**Deal contexts:** controller deal

## 1. Purpose

Independent-committee and majority-of-minority process checklist.

> **Catalog status.** This entry is informative: it maps the slot's purpose, boundary, routing, and authorities. It is NOT implementable from this document alone — the normative contract (I/O schemas, algorithm, worked example, conformance bindings) is scheduled for a future spec version.

## Boundary statement

This model produces deterministic schedules and routing only. The governing determination for mfw dual-prong is a licensed-professional conclusion; a conforming implementation MUST route that determination (with the model's workpapers) and MUST NOT emit it.

## Authorities

- AUTH-0195 — MFW
- AUTH-0190 — Match Group


# M128 — HSR reportability

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G7
**Deal contexts:** M&A regulatory

## 1. Purpose

Size-of-transaction, size-of-person, and exemption triage.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M128.schema.json`](M128.schema.json).

| Field | Type | Required |
|---|---|---|
| `enterprise_value_cents` | integer (cents) | MUST |

## 3. Output contract

| Field | Type |
|---|---|
| `auto_reportable_cents` | integer (cents) |
| `hsr_size_triggered` | boolean |
| `size_of_transaction_cents` | integer (cents) |
| `threshold_cents` | integer (cents) |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Size-of-transaction, size-of-person, and exemption triage.

Checks transaction size against current HSR thresholds and flags filing-tier review.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| 15 U.S.C. 18a | AUTH-0015 | statute |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.HSR.TRIAGE.001` — *HSR triage flags size-of-transaction threshold*.

**Inputs**

```json
{
  "enterprise_value_cents": 13400000000
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "size_of_transaction_cents": 13400000000,
  "threshold_cents": 13390000000,
  "hsr_size_triggered": true,
  "auto_reportable_cents": 53550000000
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["enterprise_value_cents"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## 9. Conformance bindings

Requirement `REQ-M128` is verified by 2 published case(s): `CONF.MODEL.HSR.TRIAGE.001`, `CONF.MODEL.HSR.TRIAGE.002`.

## 10. Version

Reference binding `MODEL.HSR.TRIAGE.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M129 — EU AI Act risk tier

**Status:** Catalog (informative) — normative specification scheduled
**Boundary classification:** Research scaffold — organizes authorities and considerations; not an executable determination.
**Gates:** G24
**Deal contexts:** EU target · AI diligence

## 1. Purpose

Research scaffold for EU AI Act tiering.

> **Catalog status.** This entry is informative: it maps the slot's purpose, boundary, routing, and authorities. It is NOT implementable from this document alone — the normative contract (I/O schemas, algorithm, worked example, conformance bindings) is scheduled for a future spec version.

## Boundary statement

Research scaffold: organizes authorities and considerations. Produces oriented reading, not determinations.

## Authorities

- AUTH-0237 — Regulation (EU) 2024/1689


# M130 — Cyber diligence

**Status:** Catalog (informative) — normative specification scheduled
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G24
**Deal contexts:** cyber diligence

## 1. Purpose

Control maturity, incident, and exposure scoring.

> **Catalog status.** This entry is informative: it maps the slot's purpose, boundary, routing, and authorities. It is NOT implementable from this document alone — the normative contract (I/O schemas, algorithm, worked example, conformance bindings) is scheduled for a future spec version.

## Boundary statement

This model produces deterministic schedules and routing only. The governing determination for cyber diligence is a licensed-professional conclusion; a conforming implementation MUST route that determination (with the model's workpapers) and MUST NOT emit it.

## Authorities

- AUTH-0211 — NIST CSF


# M131 — Privacy diligence

**Status:** Catalog (informative) — normative specification scheduled
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G24
**Deal contexts:** privacy diligence

## 1. Purpose

Data-map, lawful-basis, and breach-risk scoring.

> **Catalog status.** This entry is informative: it maps the slot's purpose, boundary, routing, and authorities. It is NOT implementable from this document alone — the normative contract (I/O schemas, algorithm, worked example, conformance bindings) is scheduled for a future spec version.

## Boundary statement

This model produces deterministic schedules and routing only. The governing determination for privacy diligence is a licensed-professional conclusion; a conforming implementation MUST route that determination (with the model's workpapers) and MUST NOT emit it.

## Authorities

- AUTH-0099 — GDPR
- AUTH-0065 — CPRA


# M132 — Sanctions diligence

**Status:** Catalog (informative) — normative specification scheduled
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G24
**Deal contexts:** sanctions diligence

## 1. Purpose

Party, geography, and control-screening workflow.

> **Catalog status.** This entry is informative: it maps the slot's purpose, boundary, routing, and authorities. It is NOT implementable from this document alone — the normative contract (I/O schemas, algorithm, worked example, conformance bindings) is scheduled for a future spec version.

## Boundary statement

This model produces deterministic schedules and routing only. The governing determination for sanctions diligence is a licensed-professional conclusion; a conforming implementation MUST route that determination (with the model's workpapers) and MUST NOT emit it.

## Authorities

- AUTH-0224 — OFAC


# M133 — ESG diligence

**Status:** Catalog (informative) — normative specification scheduled
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G24
**Deal contexts:** ESG diligence

## 1. Purpose

ESG exposure and disclosure-support scoring.

> **Catalog status.** This entry is informative: it maps the slot's purpose, boundary, routing, and authorities. It is NOT implementable from this document alone — the normative contract (I/O schemas, algorithm, worked example, conformance bindings) is scheduled for a future spec version.

## Boundary statement

This model produces deterministic schedules and routing only. The governing determination for esg diligence is a licensed-professional conclusion; a conforming implementation MUST route that determination (with the model's workpapers) and MUST NOT emit it.

## Authorities

- AUTH-0248 — SEC climate and ESG references


# M134 — Climate diligence

**Status:** Catalog (informative) — normative specification scheduled
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G24
**Deal contexts:** climate diligence

## 1. Purpose

Climate exposure, transition risk, and reporting scaffold.

> **Catalog status.** This entry is informative: it maps the slot's purpose, boundary, routing, and authorities. It is NOT implementable from this document alone — the normative contract (I/O schemas, algorithm, worked example, conformance bindings) is scheduled for a future spec version.

## Boundary statement

This model produces deterministic schedules and routing only. The governing determination for climate diligence is a licensed-professional conclusion; a conforming implementation MUST route that determination (with the model's workpapers) and MUST NOT emit it.

## Authorities

- AUTH-0249 — SEC climate disclosure references


# M135 — Fairness-opinion scaffolding

**Status:** Catalog (informative) — normative specification scheduled
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G15
**Deal contexts:** public deal

## 1. Purpose

Process and supporting-analysis record for the user advisor.

> **Catalog status.** This entry is informative: it maps the slot's purpose, boundary, routing, and authorities. It is NOT implementable from this document alone — the normative contract (I/O schemas, algorithm, worked example, conformance bindings) is scheduled for a future spec version.

## Boundary statement

This model produces deterministic schedules and routing only. The governing determination for fairness-opinion scaffolding is a licensed-professional conclusion; a conforming implementation MUST route that determination (with the model's workpapers) and MUST NOT emit it.

## Authorities

- AUTH-0080 — fairness opinion case law
- AUTH-0228 — practice-norm (unanchored)


# M136 — Fraudulent-transfer baseline

**Status:** Catalog (informative) — normative specification scheduled
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G15, G29
**Deal contexts:** recap · LBO

## 1. Purpose

Baseline solvency/fraudulent-transfer schedule paired with M148.

> **Catalog status.** This entry is informative: it maps the slot's purpose, boundary, routing, and authorities. It is NOT implementable from this document alone — the normative contract (I/O schemas, algorithm, worked example, conformance bindings) is scheduled for a future spec version.

## Boundary statement

This model produces deterministic schedules and routing only. The governing determination for fraudulent-transfer baseline is a licensed-professional conclusion; a conforming implementation MUST route that determination (with the model's workpapers) and MUST NOT emit it.

## Authorities

- AUTH-0012 — 11 U.S.C. 548
- AUTH-0300 — UFTA
- AUTH-0304 — UVTA


# M137 — Reserved

**Status:** Reserved
**Boundary classification:** Reserved slot — allocated, not yet specified.
**Gates:** 

Reserved slot — allocated in the specification's numbering; contents to be specified in a future version.


# M138 — Reserved

**Status:** Reserved
**Boundary classification:** Reserved slot — allocated, not yet specified.
**Gates:** 

Reserved slot — allocated in the specification's numbering; contents to be specified in a future version.


# M139 — 1060 seven-class allocation

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G15
**Deal contexts:** asset purchase

## 1. Purpose

Class I through VII residual allocation.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M139.schema.json`](M139.schema.json).

| Field | Type | Required |
|---|---|---|
| `asset_classes` | object[] | MUST |
| `purchase_price_cents` | integer (cents) | MUST |

## 3. Output contract

| Field | Type |
|---|---|
| `allocated_cents` | integer (cents) |
| `allocations` | object[] |
| `class_v_tangible_cents` | integer (cents) |
| `class_vi_section_197_intangibles_cents` | integer (cents) |
| `class_vii_goodwill_cents` | integer (cents) |
| `purchase_price_cents` | integer (cents) |
| `unallocated_cents` | integer (cents) |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Class I through VII residual allocation.

Allocates purchase price across Class I through VII using residual-method ordering and Form 8594-ready class output.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| IRC 1060 | AUTH-0124 | statute |
| Treas. Reg. 1.1060 | AUTH-0282 | regulation |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.TAX.1060.001` — *1060 allocation applies residual method through Class VII*.

**Inputs**

```json
{
  "purchase_price_cents": 1000000,
  "asset_classes": [
    {
      "class_name": "Class V real property and equipment",
      "fair_market_value_cents": 600000
    },
    {
      "class_name": "Class VI customer intangibles",
      "fair_market_value_cents": 300000
    },
    {
      "class_name": "Class VII goodwill",
      "fair_market_value_cents": 0
    }
  ]
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "purchase_price_cents": 1000000,
  "allocated_cents": 1000000,
  "unallocated_cents": 0,
  "class_v_tangible_cents": 600000,
  "class_vi_section_197_intangibles_cents": 300000,
  "class_vii_goodwill_cents": 100000,
  "allocations": [
    {
      "class_number": 5,
      "class_name": "Class V real property and equipment",
      "fair_market_value_cents": 600000,
      "allocated_cents": 600000,
      "capped_at_fmv": true
    },
    {
      "class_number": 6,
      "class_name": "Class VI customer intangibles",
      "fair_market_value_cents": 300000,
      "allocated_cents": 300000,
      "capped_at_fmv": true
    },
    {
      "class_number": 7,
      "class_name": "Class VII goodwill",
      "fair_market_value_cents": 0,
      "allocated_cents": 100000,
      "capped_at_fmv": false
    }
  ]
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["purchase_price_cents","asset_classes"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## 9. Conformance bindings

Requirement `REQ-M139` is verified by 2 published case(s): `CONF.MODEL.TAX.1060.001`, `CONF.MODEL.TAX.1060.002`.

## 10. Version

Reference binding `MODEL.TAX.1060.ALLOCATION.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M140 — Tax-free reorganization qualification

**Status:** Catalog (informative) — normative specification scheduled
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G15
**Deal contexts:** reorganization

## 1. Purpose

Type A/B/C/D/E/F/G plus continuity checks.

> **Catalog status.** This entry is informative: it maps the slot's purpose, boundary, routing, and authorities. It is NOT implementable from this document alone — the normative contract (I/O schemas, algorithm, worked example, conformance bindings) is scheduled for a future spec version.

## Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## Authorities

- AUTH-0144 — IRC 368
- AUTH-0288 — Treas. Reg. 1.368


# M141 — 251(h) eligibility and top-up

**Status:** Catalog (informative) — normative specification scheduled
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G15
**Deal contexts:** public stock deal

## 1. Purpose

Eligibility and top-up requirement checks.

> **Catalog status.** This entry is informative: it maps the slot's purpose, boundary, routing, and authorities. It is NOT implementable from this document alone — the normative contract (I/O schemas, algorithm, worked example, conformance bindings) is scheduled for a future spec version.

## Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## Authorities

- AUTH-0071 — DGCL 251(h)


# M142 — Tender offer mechanics

**Status:** Catalog (informative) — normative specification scheduled
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G15
**Deal contexts:** tender offer

## 1. Purpose

Proration, all-holders/best-price, and 20-business-day timing.

> **Catalog status.** This entry is informative: it maps the slot's purpose, boundary, routing, and authorities. It is NOT implementable from this document alone — the normative contract (I/O schemas, algorithm, worked example, conformance bindings) is scheduled for a future spec version.

## Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## Authorities

- AUTH-0242 — Rule 14d-10
- AUTH-0243 — Rule 14e-1


# M143 — 355 spin and 355(e) test

**Status:** Catalog (informative) — normative specification scheduled
**Boundary classification:** Research scaffold — organizes authorities and considerations; not an executable determination.
**Gates:** G15
**Deal contexts:** spin-off · split-off · Reverse Morris Trust

## 1. Purpose

Active-trade/business, device, and 50 percent acquisition-test scaffold.

> **Catalog status.** This entry is informative: it maps the slot's purpose, boundary, routing, and authorities. It is NOT implementable from this document alone — the normative contract (I/O schemas, algorithm, worked example, conformance bindings) is scheduled for a future spec version.

## Boundary statement

Research scaffold: organizes authorities and considerations. Produces oriented reading, not determinations.

## Authorities

- AUTH-0142 — IRC 355
- AUTH-0143 — IRC 355(e)


# M144 — Carve-out stranded-cost and TSA scoping

**Status:** Catalog (informative) — normative specification scheduled
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G7, G15
**Deal contexts:** carve-out

## 1. Purpose

Allocated overhead, stranded cost, and transition-service schedule.

> **Catalog status.** This entry is informative: it maps the slot's purpose, boundary, routing, and authorities. It is NOT implementable from this document alone — the normative contract (I/O schemas, algorithm, worked example, conformance bindings) is scheduled for a future spec version.

## Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## Authorities

- AUTH-0228 — practice-norm (unanchored)


# M145 — 721/351 contribution plus 704(c)

**Status:** Catalog (informative) — normative specification scheduled
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G15
**Deal contexts:** joint venture · Up-C

## 1. Purpose

Built-in gain, ceiling method, and remedial-allocation math.

> **Catalog status.** This entry is informative: it maps the slot's purpose, boundary, routing, and authorities. It is NOT implementable from this document alone — the normative contract (I/O schemas, algorithm, worked example, conformance bindings) is scheduled for a future spec version.

## Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## Authorities

- AUTH-0154 — IRC 721
- AUTH-0141 — IRC 351
- AUTH-0153 — IRC 704(c)


# M146 — Cap-table waterfall

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G15
**Deal contexts:** growth equity · venture

## 1. Purpose

Liquidation preference, participation, seniority, and anti-dilution waterfall.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M146.schema.json`](M146.schema.json).

| Field | Type | Required |
|---|---|---|
| `option_pool_pct` | number | MUST |
| `pre_money_cents` | integer (cents) | MUST |
| `round_size_cents` | integer (cents) | MUST |
| `security_terms` | object | MUST |

## 3. Output contract

| Field | Type |
|---|---|
| `founder_ownership_pct` | number |
| `investor_ownership_pct` | number |
| `liquidation_preference_cents` | integer (cents) |
| `option_pool_pct` | number |
| `post_money_cents` | integer (cents) |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Liquidation preference, participation, seniority, and anti-dilution waterfall.

Models dilution, option pool, convertible securities, and exit waterfall economics.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| NVCA term sheet | AUTH-0214 | practice-or-guidance |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.CAPTABLE.DILUTION.001` — *Cap table dilution computes post-money ownership*.

**Inputs**

```json
{
  "pre_money_cents": 1000000,
  "round_size_cents": 250000,
  "option_pool_pct": 0.1,
  "security_terms": {
    "liquidation_pref_multiple": 1
  }
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "post_money_cents": 1250000,
  "investor_ownership_pct": 0.2,
  "option_pool_pct": 0.1,
  "founder_ownership_pct": 0.7,
  "liquidation_preference_cents": 250000
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["pre_money_cents","round_size_cents","option_pool_pct","security_terms"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## 9. Conformance bindings

Requirement `REQ-M146` is verified by 1 published case(s): `CONF.MODEL.CAPTABLE.DILUTION.001`.

## 10. Version

Reference binding `MODEL.CAPTABLE.DILUTION.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M147 — PIPE 19.99 percent approval trigger

**Status:** Catalog (informative) — normative specification scheduled
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G15
**Deal contexts:** PIPE

## 1. Purpose

Shareholder-approval threshold and discount trigger.

> **Catalog status.** This entry is informative: it maps the slot's purpose, boundary, routing, and authorities. It is NOT implementable from this document alone — the normative contract (I/O schemas, algorithm, worked example, conformance bindings) is scheduled for a future spec version.

## Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## Authorities

- AUTH-0208 — Nasdaq Rule 5635


# M148 — Three-prong solvency

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G15, G28, G29
**Deal contexts:** recap · LBO · fraudulent transfer

## 1. Purpose

Balance-sheet, cash-flow, and capital-adequacy tests at user inputs.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M148.schema.json`](M148.schema.json).

| Field | Type | Required |
|---|---|---|
| `available_capital_cents` | integer (cents) | MUST |
| `debts_due_cents` | integer (cents) | MUST |
| `fair_value_assets_cents` | integer (cents) | MUST |
| `liabilities_cents` | integer (cents) | MUST |
| `projected_cash_flow_cents` | integer (cents) | MUST |
| `required_capital_cents` | integer (cents) | MUST |

## 3. Output contract

| Field | Type |
|---|---|
| `all_prongs_passed` | boolean |
| `balance_sheet_prong_passed` | boolean |
| `balance_sheet_surplus_cents` | integer (cents) |
| `capital_adequacy_prong_passed` | boolean |
| `capital_adequacy_surplus_cents` | integer (cents) |
| `cash_flow_prong_passed` | boolean |
| `cash_flow_surplus_cents` | integer (cents) |
| `solvency_opinion_handoff_required` | boolean |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Balance-sheet, cash-flow, and capital-adequacy tests at user inputs.

Computes balance-sheet, cash-flow, and capital-adequacy prongs from user-supplied valuation and liquidity inputs.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| 11 U.S.C. 548 | AUTH-0012 | statute |
| UVTA | AUTH-0304 | practice-or-guidance |
| Tribune | AUTH-0289 | practice-or-guidance |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.RESTRUCT.SOLVENCY.001` — *Three-prong solvency computes balance sheet, cash flow, and capital adequacy*.

**Inputs**

```json
{
  "fair_value_assets_cents": 1000000,
  "liabilities_cents": 800000,
  "projected_cash_flow_cents": 250000,
  "debts_due_cents": 200000,
  "available_capital_cents": 150000,
  "required_capital_cents": 175000
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "balance_sheet_surplus_cents": 200000,
  "balance_sheet_prong_passed": true,
  "cash_flow_surplus_cents": 50000,
  "cash_flow_prong_passed": true,
  "capital_adequacy_surplus_cents": -25000,
  "capital_adequacy_prong_passed": false,
  "all_prongs_passed": false,
  "solvency_opinion_handoff_required": true
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["fair_value_assets_cents","liabilities_cents","projected_cash_flow_cents","debts_due_cents","available_capital_cents","required_capital_cents"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model produces deterministic schedules and routing only. The governing determination for three-prong solvency is a licensed-professional conclusion; a conforming implementation MUST route that determination (with the model's workpapers) and MUST NOT emit it.

## 9. Conformance bindings

Requirement `REQ-M148` is verified by 2 published case(s): `CONF.MODEL.RESTRUCT.SOLVENCY.001`, `CONF.MODEL.RESTRUCT.SOLVENCY.002`.

## 10. Version

Reference binding `MODEL.RESTRUCTURING.SOLVENCY.THREE_PRONG.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M149 — DGCL 170 distributable surplus

**Status:** Catalog (informative) — normative specification scheduled
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G15
**Deal contexts:** dividend recap

## 1. Purpose

Surplus/net-profits computation at user-supplied fair value.

> **Catalog status.** This entry is informative: it maps the slot's purpose, boundary, routing, and authorities. It is NOT implementable from this document alone — the normative contract (I/O schemas, algorithm, worked example, conformance bindings) is scheduled for a future spec version.

## Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## Authorities

- AUTH-0070 — DGCL 170
- AUTH-0172 — Klang


# M150 — 108 CODI plus 382 limitation

**Status:** Catalog (informative) — normative specification scheduled
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G15, G29
**Deal contexts:** debt-for-equity · distressed exchange

## 1. Purpose

CODI inclusion, reduction attributes, and ownership-change limitation.

> **Catalog status.** This entry is informative: it maps the slot's purpose, boundary, routing, and authorities. It is NOT implementable from this document alone — the normative contract (I/O schemas, algorithm, worked example, conformance bindings) is scheduled for a future spec version.

## Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## Authorities

- AUTH-0125 — IRC 108
- AUTH-0146 — IRC 382


# M151 — 363 asset sale mechanics

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G28
**Deal contexts:** distressed sale · 363 sale

## 1. Purpose

Sale timeline, bid-protection cost, free-and-clear prongs, and credit-bid eligibility.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M151.schema.json`](M151.schema.json).

| Field | Type | Required |
|---|---|---|
| `lien_amount_cents` | integer (cents) | MUST |
| `purchase_price_cents` | integer (cents) | MUST |
| `breakup_fee_cents` | integer (cents) | MAY |
| `credit_bid_claim_cents` | integer (cents) | MAY |
| `section_363f_prongs` | object | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `breakup_fee_cents` | integer (cents) |
| `breakup_fee_pct_of_purchase_price` | number |
| `court_approval_required` | boolean |
| `credit_bid_claim_cents` | integer (cents) |
| `credit_bid_eligible` | boolean |
| `free_and_clear_path_available` | boolean |
| `free_and_clear_prong_count` | integer |
| `lien_amount_cents` | integer (cents) |
| `price_exceeds_aggregate_liens` | boolean |
| `purchase_price_cents` | integer (cents) |
| `section_363f_prongs` | object[] |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Sale timeline, bid-protection cost, free-and-clear prongs, and credit-bid eligibility.

Computes bid-protection economics, free-and-clear prongs, lien coverage, and credit-bid eligibility from supplied sale facts.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| 11 U.S.C. 363 | AUTH-0008 | statute |
| 11 U.S.C. 365 | AUTH-0010 | statute |
| RadLAX | AUTH-0233 | practice-or-guidance |
| Fisker | AUTH-0082 | practice-or-guidance |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.RESTRUCT.363.001` — *363 sale mechanics computes bid protection and free-and-clear path*.

**Inputs**

```json
{
  "purchase_price_cents": 1000000,
  "lien_amount_cents": 900000,
  "breakup_fee_cents": 25000,
  "credit_bid_claim_cents": 500000,
  "section_363f_prongs": {
    "consent": true,
    "bona_fide_dispute": false
  }
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "purchase_price_cents": 1000000,
  "lien_amount_cents": 900000,
  "breakup_fee_cents": 25000,
  "breakup_fee_pct_of_purchase_price": 0.025,
  "free_and_clear_prong_count": 2,
  "free_and_clear_path_available": true,
  "price_exceeds_aggregate_liens": true,
  "credit_bid_claim_cents": 500000,
  "credit_bid_eligible": true,
  "court_approval_required": true,
  "section_363f_prongs": [
    {
      "prong": "applicable_non_bankruptcy_law_permits",
      "passed": false
    },
    {
      "prong": "consent",
      "passed": true
    },
    {
      "prong": "price_exceeds_liens",
      "passed": true
    },
    {
      "prong": "bona_fide_dispute",
      "passed": false
    },
    {
      "prong": "could_be_compelled_to_accept_money_satisfaction",
      "passed": false
    }
  ]
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["purchase_price_cents","lien_amount_cents"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model produces deterministic schedules and routing only. The governing determination for 363 asset sale mechanics is a licensed-professional conclusion; a conforming implementation MUST route that determination (with the model's workpapers) and MUST NOT emit it.

## 9. Conformance bindings

Requirement `REQ-M151` is verified by 2 published case(s): `CONF.MODEL.RESTRUCT.363.001`, `CONF.MODEL.RESTRUCT.363.002`.

## 10. Version

Reference binding `MODEL.RESTRUCTURING.363_SALE.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M152 — Plan feasibility

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G28
**Deal contexts:** Chapter 11 plan

## 1. Purpose

Cash flow, DSCR, liquidity, covenant, and EBITDA-sensitivity table.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M152.schema.json`](M152.schema.json).

| Field | Type | Required |
|---|---|---|
| `forecast_periods` | object[] | MUST |
| `minimum_dscr` | number | MAY |
| `minimum_liquidity_cents` | integer (cents) | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `cash_flow_sensitivity_cases` | object[] |
| `dscr_floor_breached` | boolean |
| `feasibility_opinion_handoff_required` | boolean |
| `feasible_under_inputs` | boolean |
| `forecast_rows` | object[] |
| `liquidity_floor_breached` | boolean |
| `minimum_dscr_floor` | number |
| `minimum_liquidity_floor_cents` | integer (cents) |
| `minimum_projected_dscr` | number |
| `minimum_projected_liquidity_cents` | integer (cents) |
| `period_count` | integer |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Cash flow, DSCR, liquidity, covenant, and EBITDA-sensitivity table.

Computes forecast-period DSCR, liquidity-floor compliance, and downside cash-flow sensitivity for Chapter 11 plan feasibility.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| 11 U.S.C. 1129(a)(11) | AUTH-0003 | statute |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.RESTRUCT.FEASIBILITY.001` — *Plan feasibility computes DSCR, liquidity floors, and sensitivity*.

**Inputs**

```json
{
  "minimum_dscr": 1.1,
  "minimum_liquidity_cents": 100000,
  "forecast_periods": [
    {
      "year": "2026",
      "cash_flow_cents": 1000000,
      "capex_cents": 100000,
      "working_capital_need_cents": 50000,
      "debt_service_cents": 600000,
      "ending_liquidity_cents": 200000
    },
    {
      "year": "2027",
      "cash_flow_cents": 900000,
      "capex_cents": 100000,
      "working_capital_need_cents": 50000,
      "debt_service_cents": 650000,
      "ending_liquidity_cents": 75000
    }
  ]
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "period_count": 2,
  "minimum_dscr_floor": 1.1,
  "minimum_liquidity_floor_cents": 100000,
  "minimum_projected_dscr": 1.15,
  "minimum_projected_liquidity_cents": 75000,
  "dscr_floor_breached": false,
  "liquidity_floor_breached": true,
  "feasible_under_inputs": false,
  "feasibility_opinion_handoff_required": true,
  "forecast_rows": [
    {
      "period": "2026",
      "cash_flow_cents": 1000000,
      "capex_cents": 100000,
      "working_capital_need_cents": 50000,
      "available_for_debt_service_cents": 850000,
      "debt_service_cents": 600000,
      "dscr": 1.42,
      "ending_liquidity_cents": 200000,
      "dscr_floor_passed": true,
      "liquidity_floor_passed": true
    },
    {
      "period": "2027",
      "cash_flow_cents": 900000,
      "capex_cents": 100000,
      "working_capital_need_cents": 50000,
      "available_for_debt_service_cents": 750000,
      "debt_service_cents": 650000,
      "dscr": 1.15,
      "ending_liquidity_cents": 75000,
      "dscr_floor_passed": true,
      "liquidity_floor_passed": false
    }
  ],
  "cash_flow_sensitivity_cases": [
    {
      "cash_flow_change_pct": -0.1,
      "minimum_dscr": 1.02,
      "dscr_floor_passed": false
    },
    {
      "cash_flow_change_pct": -0.2,
      "minimum_dscr": 0.88,
      "dscr_floor_passed": false
    }
  ]
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["forecast_periods"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model produces deterministic schedules and routing only. The governing determination for plan feasibility is a licensed-professional conclusion; a conforming implementation MUST route that determination (with the model's workpapers) and MUST NOT emit it.

## 9. Conformance bindings

Requirement `REQ-M152` is verified by 2 published case(s): `CONF.MODEL.RESTRUCT.FEASIBILITY.001`, `CONF.MODEL.RESTRUCT.FEASIBILITY.002`.

## 10. Version

Reference binding `MODEL.RESTRUCTURING.PLAN_FEASIBILITY.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M153 — Best-interests-of-creditors

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G28
**Deal contexts:** Chapter 11 plan

## 1. Purpose

Per-class plan recovery versus hypothetical Chapter 7 recovery.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M153.schema.json`](M153.schema.json).

| Field | Type | Required |
|---|---|---|
| `creditor_classes` | object[] | MUST |

## 3. Output contract

| Field | Type |
|---|---|
| `all_classes_pass_best_interests` | boolean |
| `class_count` | integer |
| `class_rows` | object[] |
| `disclosure_statement_exhibit_handoff_required` | boolean |
| `failing_class_count` | integer |
| `total_allowed_claims_cents` | integer (cents) |
| `total_chapter7_distribution_cents` | integer (cents) |
| `total_plan_distribution_cents` | integer (cents) |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Per-class plan recovery versus hypothetical Chapter 7 recovery.

Compares per-class plan distributions against Chapter 7 liquidation distributions and flags shortfalls.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| 11 U.S.C. 1129(a)(7) | AUTH-0004 | statute |
| 11 U.S.C. 726 | AUTH-0013 | statute |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.RESTRUCT.BIOC.001` — *Best-interests model flags class-level liquidation shortfall*.

**Inputs**

```json
{
  "creditor_classes": [
    {
      "class_name": "Secured",
      "allowed_claim_cents": 1000000,
      "plan_distribution_cents": 1000000,
      "chapter7_distribution_cents": 900000
    },
    {
      "class_name": "GUC",
      "allowed_claim_cents": 500000,
      "plan_distribution_cents": 200000,
      "chapter7_distribution_cents": 250000
    }
  ]
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "class_count": 2,
  "total_allowed_claims_cents": 1500000,
  "total_plan_distribution_cents": 1200000,
  "total_chapter7_distribution_cents": 1150000,
  "all_classes_pass_best_interests": false,
  "failing_class_count": 1,
  "disclosure_statement_exhibit_handoff_required": true,
  "class_rows": [
    {
      "class_name": "Secured",
      "allowed_claim_cents": 1000000,
      "plan_distribution_cents": 1000000,
      "chapter7_distribution_cents": 900000,
      "plan_recovery_pct": 1,
      "chapter7_recovery_pct": 0.9,
      "best_interests_shortfall_cents": 0,
      "best_interests_passed": true
    },
    {
      "class_name": "GUC",
      "allowed_claim_cents": 500000,
      "plan_distribution_cents": 200000,
      "chapter7_distribution_cents": 250000,
      "plan_recovery_pct": 0.4,
      "chapter7_recovery_pct": 0.5,
      "best_interests_shortfall_cents": 50000,
      "best_interests_passed": false
    }
  ]
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["creditor_classes"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model produces deterministic schedules and routing only. The governing determination for best-interests-of-creditors is a licensed-professional conclusion; a conforming implementation MUST route that determination (with the model's workpapers) and MUST NOT emit it.

## 9. Conformance bindings

Requirement `REQ-M153` is verified by 2 published case(s): `CONF.MODEL.RESTRUCT.BIOC.001`, `CONF.MODEL.RESTRUCT.BIOC.002`.

## 10. Version

Reference binding `MODEL.RESTRUCTURING.BIOC.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M154 — Absolute priority rule and new value

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G28
**Deal contexts:** Chapter 11 cramdown

## 1. Purpose

Priority waterfall and new-value decision tree.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M154.schema.json`](M154.schema.json).

| Field | Type | Required |
|---|---|---|
| `classes` | object[] | MUST |
| `new_value` | object | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `absolute_priority_issue_count` | integer |
| `absolute_priority_issues` | object[] |
| `apr_clear_under_inputs` | boolean |
| `class_count` | integer |
| `class_rows` | object[] |
| `court_determination_required` | boolean |
| `new_value_scaffold` | object |
| `new_value_scaffold_complete` | boolean |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Priority waterfall and new-value decision tree.

Computes impaired dissenting senior-class recovery, junior-value leakage, and a new-value scaffold for court/counsel review.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| 11 U.S.C. 1129(b) | AUTH-0005 | statute |
| 203 N. LaSalle | AUTH-0017 | practice-or-guidance |
| Castleton Plaza | AUTH-0056 | practice-or-guidance |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.RESTRUCT.APR.001` — *APR model flags junior value below dissenting impaired senior class*.

**Inputs**

```json
{
  "classes": [
    {
      "class_name": "Senior secured",
      "priority_rank": 1,
      "allowed_claim_cents": 1000000,
      "plan_distribution_cents": 800000,
      "impaired": true,
      "accepted": false
    },
    {
      "class_name": "Equity",
      "priority_rank": 3,
      "allowed_claim_cents": 0,
      "plan_distribution_cents": 100000
    }
  ],
  "new_value": {
    "contribution_cents": 150000,
    "new_money_or_money_worth": true,
    "necessary_to_reorganization": true,
    "market_test_completed": true,
    "reasonably_equivalent_value": true
  }
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "class_count": 2,
  "absolute_priority_issue_count": 1,
  "absolute_priority_issues": [
    {
      "senior_class_name": "Senior secured",
      "senior_recovery_pct": 0.8,
      "junior_value_cents": 100000
    }
  ],
  "apr_clear_under_inputs": false,
  "new_value_scaffold": {
    "contribution_cents": 150000,
    "new_money_or_money_worth": true,
    "necessary_to_reorganization": true,
    "market_test_completed": true,
    "reasonably_equivalent_value": true
  },
  "new_value_scaffold_complete": true,
  "court_determination_required": true,
  "class_rows": [
    {
      "class_name": "Senior secured",
      "priority_rank": 1,
      "allowed_claim_cents": 1000000,
      "plan_distribution_cents": 800000,
      "recovery_pct": 0.8,
      "impaired": true,
      "accepted": false
    },
    {
      "class_name": "Equity",
      "priority_rank": 3,
      "allowed_claim_cents": 0,
      "plan_distribution_cents": 100000,
      "recovery_pct": 0,
      "impaired": false,
      "accepted": false
    }
  ]
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["classes"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model produces deterministic schedules and routing only. The governing determination for absolute priority rule and new value is a licensed-professional conclusion; a conforming implementation MUST route that determination (with the model's workpapers) and MUST NOT emit it.

## 9. Conformance bindings

Requirement `REQ-M154` is verified by 2 published case(s): `CONF.MODEL.RESTRUCT.APR.001`, `CONF.MODEL.RESTRUCT.APR.002`.

## 10. Version

Reference binding `MODEL.RESTRUCTURING.APR_NEW_VALUE.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M155 — Cramdown interest rate

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G28
**Deal contexts:** Chapter 11 cramdown

## 1. Purpose

Efficient-market/Till formula range and circuit flag.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M155.schema.json`](M155.schema.json).

| Field | Type | Required |
|---|---|---|
| `base_rate` | number | MUST |
| `risk_premium` | number | MUST |
| `circuit` | string | MAY |
| `efficient_market_exists` | boolean | MAY |
| `efficient_market_rate` | number | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `base_rate` | number |
| `circuit` | string |
| `court_sets_final_rate` | boolean |
| `efficient_market_framework_supported` | boolean |
| `efficient_market_rate` | number |
| `indicated_cramdown_rate` | number |
| `risk_premium` | number |
| `selected_framework` | string |
| `till_formula_rate` | number |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Efficient-market/Till formula range and circuit flag.

Computes Till formula and efficient-market framework outputs, with circuit support and court-rate handoff flags.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| Till | AUTH-0279 | practice-or-guidance |
| MPM Silicones | AUTH-0203 | practice-or-guidance |
| Texas Grand Prairie | AUTH-0277 | practice-or-guidance |
| Topp | AUTH-0280 | practice-or-guidance |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.RESTRUCT.CRAMDOWN.001` — *Cramdown rate model applies efficient-market framework in supported circuit*.

**Inputs**

```json
{
  "base_rate": 0.08,
  "risk_premium": 0.015,
  "efficient_market_rate": 0.1025,
  "efficient_market_exists": true,
  "circuit": "2d"
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "base_rate": 0.08,
  "risk_premium": 0.015,
  "till_formula_rate": 0.095,
  "efficient_market_rate": 0.1025,
  "circuit": "2d",
  "efficient_market_framework_supported": true,
  "selected_framework": "efficient_market",
  "indicated_cramdown_rate": 0.1025,
  "court_sets_final_rate": true
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["base_rate","risk_premium"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model produces deterministic schedules and routing only. The governing determination for cramdown interest rate is a licensed-professional conclusion; a conforming implementation MUST route that determination (with the model's workpapers) and MUST NOT emit it.

## 9. Conformance bindings

Requirement `REQ-M155` is verified by 2 published case(s): `CONF.MODEL.RESTRUCT.CRAMDOWN.001`, `CONF.MODEL.RESTRUCT.CRAMDOWN.002`.

## 10. Version

Reference binding `MODEL.RESTRUCTURING.CRAMDOWN_RATE.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M156 — 1111(b) election trade-off

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G28
**Deal contexts:** undersecured Chapter 11 creditor

## 1. Purpose

Election eligibility and no-election versus election value comparison.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M156.schema.json`](M156.schema.json).

| Field | Type | Required |
|---|---|---|
| `allowed_claim_cents` | integer (cents) | MUST |
| `collateral_value_cents` | integer (cents) | MUST |
| `discount_rate` | number | MUST |
| `plan_payment_stream_cents` | number[] | MUST |
| `class_vote_amount_pct` | number | MAY |
| `class_vote_number_pct` | number | MAY |
| `guc_recovery_pct` | number | MAY |
| `interest_inconsequential` | boolean | MAY |
| `property_sold_under_363_or_plan` | boolean | MAY |
| `recourse` | boolean | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `aggregate_face_test_passed` | boolean |
| `allowed_claim_cents` | integer (cents) |
| `collateral_npv_test_passed` | boolean |
| `collateral_value_cents` | integer (cents) |
| `deficiency_claim_cents` | integer (cents) |
| `election_aggregate_payments_cents` | integer (cents) |
| `election_eligible` | boolean |
| `election_filing_handoff_required` | boolean |
| `election_npv_cents` | integer (cents) |
| `election_vote_passed` | boolean |
| `guc_recovery_pct` | number |
| `no_election_value_cents` | integer (cents) |
| `value_delta_election_vs_no_election_cents` | integer (cents) |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Election eligibility and no-election versus election value comparison.

Computes no-election value, election NPV, aggregate face test, collateral NPV test, eligibility, and vote threshold flags.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| 11 U.S.C. 1111(b) | AUTH-0001 | statute |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.RESTRUCT.1111B.001` — *1111(b) model computes election value trade-off and statutory vote flags*.

**Inputs**

```json
{
  "allowed_claim_cents": 1000000,
  "collateral_value_cents": 600000,
  "plan_payment_stream_cents": [
    250000,
    250000,
    250000,
    250000,
    250000
  ],
  "discount_rate": 0.1,
  "guc_recovery_pct": 0.2,
  "recourse": true,
  "property_sold_under_363_or_plan": false,
  "interest_inconsequential": false,
  "class_vote_amount_pct": 0.7,
  "class_vote_number_pct": 0.55
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "allowed_claim_cents": 1000000,
  "collateral_value_cents": 600000,
  "deficiency_claim_cents": 400000,
  "guc_recovery_pct": 0.2,
  "no_election_value_cents": 680000,
  "election_aggregate_payments_cents": 1250000,
  "election_npv_cents": 947697,
  "election_eligible": true,
  "election_vote_passed": true,
  "aggregate_face_test_passed": true,
  "collateral_npv_test_passed": true,
  "value_delta_election_vs_no_election_cents": 267697,
  "election_filing_handoff_required": true
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["allowed_claim_cents","collateral_value_cents","plan_payment_stream_cents","discount_rate"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model produces deterministic schedules and routing only. The governing determination for 1111(b) election trade-off is a licensed-professional conclusion; a conforming implementation MUST route that determination (with the model's workpapers) and MUST NOT emit it.

## 9. Conformance bindings

Requirement `REQ-M156` is verified by 2 published case(s): `CONF.MODEL.RESTRUCT.1111B.001`, `CONF.MODEL.RESTRUCT.1111B.002`.

## 10. Version

Reference binding `MODEL.RESTRUCTURING.1111B_ELECTION.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M157 — 726 Chapter 7 waterfall

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G28
**Deal contexts:** Chapter 7 · liquidation analysis

## 1. Purpose

Distribution by statutory priority and trustee-fee schedule.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M157.schema.json`](M157.schema.json).

| Field | Type | Required |
|---|---|---|
| `claims` | object[] | MUST |
| `estate_value_cents` | integer (cents) | MUST |
| `trustee_fee_cents` | integer (cents) | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `distributable_estate_cents` | integer (cents) |
| `estate_value_cents` | integer (cents) |
| `residual_to_equity_cents` | integer (cents) |
| `total_claims_cents` | integer (cents) |
| `total_distributed_cents` | integer (cents) |
| `trustee_fee_cents` | integer (cents) |
| `waterfall_rows` | object[] |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Distribution by statutory priority and trustee-fee schedule.

Computes a priority-ranked liquidation distribution and recovery schedule under supplied claim classes.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| 11 U.S.C. 507 | AUTH-0011 | statute |
| 11 U.S.C. 726 | AUTH-0013 | statute |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.RESTRUCT.CH7.001` — *Chapter 7 waterfall distributes estate by priority*.

**Inputs**

```json
{
  "estate_value_cents": 1000000,
  "trustee_fee_cents": 50000,
  "claims": [
    {
      "class_name": "Admin",
      "priority_rank": 1,
      "allowed_claim_cents": 200000
    },
    {
      "class_name": "Priority tax",
      "priority_rank": 2,
      "allowed_claim_cents": 300000
    },
    {
      "class_name": "GUC",
      "priority_rank": 3,
      "allowed_claim_cents": 600000
    }
  ]
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "estate_value_cents": 1000000,
  "trustee_fee_cents": 50000,
  "distributable_estate_cents": 950000,
  "total_claims_cents": 1100000,
  "total_distributed_cents": 950000,
  "residual_to_equity_cents": 0,
  "waterfall_rows": [
    {
      "class_name": "Admin",
      "priority_rank": 1,
      "allowed_claim_cents": 200000,
      "distribution_cents": 200000,
      "recovery_pct": 1
    },
    {
      "class_name": "Priority tax",
      "priority_rank": 2,
      "allowed_claim_cents": 300000,
      "distribution_cents": 300000,
      "recovery_pct": 1
    },
    {
      "class_name": "GUC",
      "priority_rank": 3,
      "allowed_claim_cents": 600000,
      "distribution_cents": 450000,
      "recovery_pct": 0.75
    }
  ]
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["estate_value_cents","claims"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## 9. Conformance bindings

Requirement `REQ-M157` is verified by 2 published case(s): `CONF.MODEL.RESTRUCT.CH7.001`, `CONF.MODEL.RESTRUCT.CH7.002`.

## 10. Version

Reference binding `MODEL.RESTRUCTURING.CH7_WATERFALL.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M158 — 364 DIP sizing

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G28, G29
**Deal contexts:** DIP financing

## 1. Purpose

13-week cash, minimum liquidity, roll-up, carve-out, and priming schedule.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M158.schema.json`](M158.schema.json).

| Field | Type | Required |
|---|---|---|
| `minimum_liquidity_cents` | integer (cents) | MUST |
| `thirteen_week_cash_need_cents` | integer (cents) | MUST |
| `new_money_minimum_cents` | integer (cents) | MAY |
| `opening_cash_cents` | integer (cents) | MAY |
| `priming_requested` | boolean | MAY |
| `professional_fee_carveout_cents` | integer (cents) | MAY |
| `rollup_amount_cents` | integer (cents) | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `court_approval_required` | boolean |
| `liquidity_need_cents` | integer (cents) |
| `minimum_liquidity_cents` | integer (cents) |
| `new_money_component_cents` | integer (cents) |
| `opening_cash_cents` | integer (cents) |
| `priming_requested` | boolean |
| `professional_fee_carveout_cents` | integer (cents) |
| `required_dip_commitment_cents` | integer (cents) |
| `rollup_amount_cents` | integer (cents) |
| `rollup_pct_of_commitment` | number |
| `thirteen_week_cash_need_cents` | integer (cents) |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

13-week cash, minimum liquidity, roll-up, carve-out, and priming schedule.

Computes required DIP commitment from 13-week need, minimum liquidity, opening cash, roll-up, carve-out, and new-money inputs.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| 11 U.S.C. 364 | AUTH-0009 | statute |
| Collier 364.06 | AUTH-0062 | practice-or-guidance |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.RESTRUCT.DIP.001` — *DIP sizing computes liquidity need, roll-up, and carve-out*.

**Inputs**

```json
{
  "thirteen_week_cash_need_cents": 500000,
  "minimum_liquidity_cents": 200000,
  "opening_cash_cents": 100000,
  "rollup_amount_cents": 150000,
  "professional_fee_carveout_cents": 50000,
  "new_money_minimum_cents": 650000,
  "priming_requested": true
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "thirteen_week_cash_need_cents": 500000,
  "opening_cash_cents": 100000,
  "minimum_liquidity_cents": 200000,
  "liquidity_need_cents": 600000,
  "rollup_amount_cents": 150000,
  "professional_fee_carveout_cents": 50000,
  "required_dip_commitment_cents": 850000,
  "new_money_component_cents": 650000,
  "rollup_pct_of_commitment": 0.1765,
  "priming_requested": true,
  "court_approval_required": true
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["thirteen_week_cash_need_cents","minimum_liquidity_cents"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model produces deterministic schedules and routing only. The governing determination for 364 dip sizing is a licensed-professional conclusion; a conforming implementation MUST route that determination (with the model's workpapers) and MUST NOT emit it.

## 9. Conformance bindings

Requirement `REQ-M158` is verified by 2 published case(s): `CONF.MODEL.RESTRUCT.DIP.001`, `CONF.MODEL.RESTRUCT.DIP.002`.

## 10. Version

Reference binding `MODEL.RESTRUCTURING.DIP_SIZING.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M159 — Fulcrum security

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G28
**Deal contexts:** distressed-for-control

## 1. Purpose

Enterprise value through capital stack and recovery by tranche.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M159.schema.json`](M159.schema.json).

| Field | Type | Required |
|---|---|---|
| `enterprise_value_cents` | integer (cents) | MUST |
| `tranches` | object[] | MUST |

## 3. Output contract

| Field | Type |
|---|---|
| `enterprise_value_cents` | integer (cents) |
| `financial_advisor_ev_handoff_required` | boolean |
| `fulcrum_tranche` | string |
| `residual_value_cents` | integer (cents) |
| `total_claims_cents` | integer (cents) |
| `tranche_rows` | object[] |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Enterprise value through capital stack and recovery by tranche.

Applies enterprise value down the capital stack and identifies the fulcrum tranche at supplied EV.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| practice-norm (unanchored) | AUTH-0228 | practice-norm |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.RESTRUCT.FULCRUM.001` — *Fulcrum model identifies the partially impaired tranche*.

**Inputs**

```json
{
  "enterprise_value_cents": 1200000,
  "tranches": [
    {
      "tranche_name": "First lien",
      "priority_rank": 1,
      "claim_cents": 800000
    },
    {
      "tranche_name": "Second lien",
      "priority_rank": 2,
      "claim_cents": 700000
    }
  ]
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "enterprise_value_cents": 1200000,
  "total_claims_cents": 1500000,
  "residual_value_cents": 0,
  "fulcrum_tranche": "Second lien",
  "financial_advisor_ev_handoff_required": true,
  "tranche_rows": [
    {
      "tranche_name": "First lien",
      "priority_rank": 1,
      "claim_cents": 800000,
      "value_allocated_cents": 800000,
      "recovery_pct": 1
    },
    {
      "tranche_name": "Second lien",
      "priority_rank": 2,
      "claim_cents": 700000,
      "value_allocated_cents": 400000,
      "recovery_pct": 0.5714
    }
  ]
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["enterprise_value_cents","tranches"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model produces deterministic schedules and routing only. The governing determination for fulcrum security is a licensed-professional conclusion; a conforming implementation MUST route that determination (with the model's workpapers) and MUST NOT emit it.

## 9. Conformance bindings

Requirement `REQ-M159` is verified by 2 published case(s): `CONF.MODEL.RESTRUCT.FULCRUM.001`, `CONF.MODEL.RESTRUCT.FULCRUM.002`.

## 10. Version

Reference binding `MODEL.RESTRUCTURING.FULCRUM_SECURITY.v1` · entered the specification at internal lineage stage `v1_1` · spec v1.0.0.


# M160 — Exchange offer and distressed-debt exchange

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G29
**Deal contexts:** out-of-court restructuring

## 1. Purpose

Participation threshold, holdout economics, and CODI exposure.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M160.schema.json`](M160.schema.json).

| Field | Type | Required |
|---|---|---|
| `new_security_value_cents` | integer (cents) | MUST |
| `outstanding_debt_cents` | integer (cents) | MUST |
| `participating_debt_cents` | integer (cents) | MUST |
| `minimum_participation_pct` | number | MAY |
| `old_security_value_cents` | integer (cents) | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `codi_exposure_cents` | integer (cents) |
| `counsel_review_required` | boolean |
| `exchange_discount_cents` | integer (cents) |
| `holdout_debt_cents` | integer (cents) |
| `minimum_participation_pct` | number |
| `minimum_participation_satisfied` | boolean |
| `new_security_value_cents` | integer (cents) |
| `old_security_value_cents` | integer (cents) |
| `outstanding_debt_cents` | integer (cents) |
| `participating_debt_cents` | integer (cents) |
| `participation_pct` | number |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Participation threshold, holdout economics, and CODI exposure.

Computes participation, holdout debt, exchange discount, CODI exposure, and minimum-participation satisfaction.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| Securities Act 3(a)(9) | AUTH-0252 | statute |
| TIA 316(b) | AUTH-0278 | practice-or-guidance |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.RESTRUCT.EXCHANGE.001` — *Exchange offer computes participation, holdout, and CODI exposure*.

**Inputs**

```json
{
  "outstanding_debt_cents": 1000000,
  "participating_debt_cents": 700000,
  "old_security_value_cents": 700000,
  "new_security_value_cents": 500000,
  "minimum_participation_pct": 0.66
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "outstanding_debt_cents": 1000000,
  "participating_debt_cents": 700000,
  "holdout_debt_cents": 300000,
  "participation_pct": 0.7,
  "minimum_participation_pct": 0.66,
  "minimum_participation_satisfied": true,
  "old_security_value_cents": 700000,
  "new_security_value_cents": 500000,
  "exchange_discount_cents": 200000,
  "codi_exposure_cents": 200000,
  "counsel_review_required": true
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["outstanding_debt_cents","participating_debt_cents","new_security_value_cents"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model produces deterministic schedules and routing only. The governing determination for exchange offer and distressed-debt exchange is a licensed-professional conclusion; a conforming implementation MUST route that determination (with the model's workpapers) and MUST NOT emit it.

## 9. Conformance bindings

Requirement `REQ-M160` is verified by 2 published case(s): `CONF.MODEL.RESTRUCT.EXCHANGE.001`, `CONF.MODEL.RESTRUCT.EXCHANGE.002`.

## 10. Version

Reference binding `MODEL.RESTRUCTURING.EXCHANGE_OFFER.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M161 — Uptier capacity and sacred rights

**Status:** Catalog (informative) — normative specification scheduled
**Boundary classification:** Research scaffold — organizes authorities and considerations; not an executable determination.
**Gates:** G29
**Deal contexts:** LME uptier

## 1. Purpose

Required-lender percentage, open-market-purchase language, and contract-risk flags.

> **Catalog status.** This entry is informative: it maps the slot's purpose, boundary, routing, and authorities. It is NOT implementable from this document alone — the normative contract (I/O schemas, algorithm, worked example, conformance bindings) is scheduled for a future spec version.

## Boundary statement

Research scaffold: organizes authorities and considerations. Produces oriented reading, not determinations.

## Authorities

- AUTH-0253 — Serta Simmons
- AUTH-0197 — Mitel


# M162 — Drop-down basket capacity

**Status:** Catalog (informative) — normative specification scheduled
**Boundary classification:** Research scaffold — organizes authorities and considerations; not an executable determination.
**Gates:** G29
**Deal contexts:** LME drop-down

## 1. Purpose

Investment-basket, unrestricted-subsidiary, and blocker capacity.

> **Catalog status.** This entry is informative: it maps the slot's purpose, boundary, routing, and authorities. It is NOT implementable from this document alone — the normative contract (I/O schemas, algorithm, worked example, conformance bindings) is scheduled for a future spec version.

## Boundary statement

Research scaffold: organizes authorities and considerations. Produces oriented reading, not determinations.

## Authorities

- AUTH-0169 — J. Crew
- AUTH-0075 — Envision
- AUTH-0227 — Pluralsight


# M163 — Double-dip and pari-plus claim multiplier

**Status:** Catalog (informative) — normative specification scheduled
**Boundary classification:** Research scaffold — organizes authorities and considerations; not an executable determination.
**Gates:** G29
**Deal contexts:** LME double-dip · pari-plus

## 1. Purpose

Claim multiplier and structural-seniority math.

> **Catalog status.** This entry is informative: it maps the slot's purpose, boundary, routing, and authorities. It is NOT implementable from this document alone — the normative contract (I/O schemas, algorithm, worked example, conformance bindings) is scheduled for a future spec version.

## Boundary statement

Research scaffold: organizes authorities and considerations. Produces oriented reading, not determinations.

## Authorities

- AUTH-0046 — At Home
- AUTH-0290 — Trinseo
- AUTH-0246 — Sabre
- AUTH-0023 — ABA Business Law Today


# M164 — RSA economics

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G28, G29
**Deal contexts:** restructuring support agreement

## 1. Purpose

Class support, milestones, termination, fiduciary-out, and toggle schedule.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M164.schema.json`](M164.schema.json).

| Field | Type | Required |
|---|---|---|
| `classes` | object[] | MUST |
| `fiduciary_out_present` | boolean | MAY |
| `milestones` | object[] | MAY |
| `termination_events` | string[] | MAY |
| `toggle_type` | string | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `all_classes_meet_support_thresholds` | boolean |
| `class_count` | integer |
| `class_rows` | object[] |
| `counsel_review_required` | boolean |
| `fiduciary_out_present` | boolean |
| `milestone_count` | integer |
| `open_milestone_count` | integer |
| `support_threshold_class_count` | integer |
| `termination_event_count` | integer |
| `toggle_type` | string |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Class support, milestones, termination, fiduciary-out, and toggle schedule.

Computes class support thresholds, milestone status, termination-event count, fiduciary-out flag, and toggle type.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| 11 U.S.C. 1125 | AUTH-0002 | statute |
| Indianapolis Downs | AUTH-0115 | practice-or-guidance |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.RESTRUCT.RSA.001` — *RSA economics computes class support, milestones, and fiduciary-out status*.

**Inputs**

```json
{
  "classes": [
    {
      "class_name": "Secured",
      "support_amount_pct": 0.7,
      "support_number_pct": 0.55
    },
    {
      "class_name": "GUC",
      "support_amount_pct": 0.6,
      "support_number_pct": 0.4
    }
  ],
  "milestones": [
    {
      "name": "petition",
      "completed": true
    },
    {
      "name": "confirmation"
    }
  ],
  "termination_events": [
    "missed milestone",
    "fiduciary out"
  ],
  "fiduciary_out_present": true,
  "toggle_type": "specified_plan"
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "class_count": 2,
  "support_threshold_class_count": 1,
  "all_classes_meet_support_thresholds": false,
  "milestone_count": 2,
  "open_milestone_count": 1,
  "termination_event_count": 2,
  "fiduciary_out_present": true,
  "toggle_type": "specified_plan",
  "counsel_review_required": true,
  "class_rows": [
    {
      "class_name": "Secured",
      "support_amount_pct": 0.7,
      "support_number_pct": 0.55,
      "section_1126c_threshold_met": true
    },
    {
      "class_name": "GUC",
      "support_amount_pct": 0.6,
      "support_number_pct": 0.4,
      "section_1126c_threshold_met": false
    }
  ]
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["classes"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model produces deterministic schedules and routing only. The governing determination for rsa economics is a licensed-professional conclusion; a conforming implementation MUST route that determination (with the model's workpapers) and MUST NOT emit it.

## 9. Conformance bindings

Requirement `REQ-M164` is verified by 2 published case(s): `CONF.MODEL.RESTRUCT.RSA.001`, `CONF.MODEL.RESTRUCT.RSA.002`.

## 10. Version

Reference binding `MODEL.RESTRUCTURING.RSA_ECONOMICS.v1` · entered the specification at internal lineage stage `v1_1` · spec v1.0.0.


# M165 — ABC and Article 9 foreclosure recovery

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G28
**Deal contexts:** out-of-court liquidation

## 1. Purpose

Notice, sale, waterfall, assignee fee, and recovery schedule.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M165.schema.json`](M165.schema.json).

| Field | Type | Required |
|---|---|---|
| `claims` | object[] | MUST |
| `liquidation_value_cents` | integer (cents) | MUST |
| `assignee_fee_cents` | integer (cents) | MAY |
| `notice_days` | integer | MAY |
| `sale_costs_cents` | integer (cents) | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `article9_notice_floor_days` | integer |
| `assignee_fee_cents` | integer (cents) |
| `commercially_reasonable_sale` | null |
| `counsel_review_required` | boolean |
| `distributable_value_cents` | integer (cents) |
| `distribution_rows` | object[] |
| `liquidation_value_cents` | integer (cents) |
| `notice_days` | integer |
| `notice_floor_satisfied` | boolean |
| `residual_value_cents` | integer (cents) |
| `sale_costs_cents` | integer (cents) |
| `total_distributed_cents` | integer (cents) |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Notice, sale, waterfall, assignee fee, and recovery schedule.

Computes liquidation value after sale costs, Article 9 notice-floor compliance, and priority recovery waterfall.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| UCC 9-610 | AUTH-0294 | statute |
| UCC 9-611 | AUTH-0295 | statute |
| UCC 9-615 | AUTH-0296 | statute |
| state ABC law | AUTH-0263 | statute |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.RESTRUCT.ABC_ARTICLE9.001` — *ABC and Article 9 model computes liquidation waterfall and notice floor*.

**Inputs**

```json
{
  "liquidation_value_cents": 1000000,
  "assignee_fee_cents": 50000,
  "sale_costs_cents": 50000,
  "notice_days": 9,
  "claims": [
    {
      "class_name": "Secured",
      "priority_rank": 1,
      "claim_cents": 300000
    },
    {
      "class_name": "Unsecured",
      "priority_rank": 2,
      "claim_cents": 700000
    }
  ]
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "liquidation_value_cents": 1000000,
  "assignee_fee_cents": 50000,
  "sale_costs_cents": 50000,
  "distributable_value_cents": 900000,
  "notice_days": 9,
  "article9_notice_floor_days": 10,
  "notice_floor_satisfied": false,
  "commercially_reasonable_sale": null,
  "total_distributed_cents": 900000,
  "residual_value_cents": 0,
  "counsel_review_required": true,
  "distribution_rows": [
    {
      "class_name": "Secured",
      "priority_rank": 1,
      "claim_cents": 300000,
      "distribution_cents": 300000,
      "recovery_pct": 1
    },
    {
      "class_name": "Unsecured",
      "priority_rank": 2,
      "claim_cents": 700000,
      "distribution_cents": 600000,
      "recovery_pct": 0.8571
    }
  ]
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["liquidation_value_cents","claims"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model produces deterministic schedules and routing only. The governing determination for abc and article 9 foreclosure recovery is a licensed-professional conclusion; a conforming implementation MUST route that determination (with the model's workpapers) and MUST NOT emit it.

## 9. Conformance bindings

Requirement `REQ-M165` is verified by 2 published case(s): `CONF.MODEL.RESTRUCT.ABC_ARTICLE9.001`, `CONF.MODEL.RESTRUCT.ABC_ARTICLE9.002`.

## 10. Version

Reference binding `MODEL.RESTRUCTURING.ABC_ARTICLE9.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M166 — Claims trading recovery

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G28
**Deal contexts:** claims trading

## 1. Purpose

Claim-purchase IRR and ultimate-recovery regression.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M166.schema.json`](M166.schema.json).

| Field | Type | Required |
|---|---|---|
| `face_amount_cents` | integer (cents) | MUST |
| `purchase_price_cents` | integer (cents) | MUST |
| `time_to_recovery_years` | integer | MUST |
| `post_default_trading_price` | number | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `estimated_irr` | number |
| `expected_recovery_cents` | integer (cents) |
| `expected_recovery_rate` | number |
| `face_amount_cents` | integer (cents) |
| `frbp_transfer_review_required` | boolean |
| `gross_profit_cents` | integer (cents) |
| `post_default_trading_price` | number |
| `purchase_price_cents` | integer (cents) |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Claim-purchase IRR and ultimate-recovery regression.

Computes expected recovery from post-default trading price or supplied recovery rate, gross profit, and estimated IRR.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| Moody's Ultimate Recovery Database | AUTH-0198 | practice-or-guidance |
| FRBP 3001 | AUTH-0088 | practice-or-guidance |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.RESTRUCT.CLAIMS.001` — *Claims trading model applies URD regression and computes IRR*.

**Inputs**

```json
{
  "face_amount_cents": 1000000,
  "purchase_price_cents": 400000,
  "post_default_trading_price": 0.4,
  "time_to_recovery_years": 2
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "face_amount_cents": 1000000,
  "purchase_price_cents": 400000,
  "post_default_trading_price": 0.4,
  "expected_recovery_rate": 0.42,
  "expected_recovery_cents": 420000,
  "gross_profit_cents": 20000,
  "estimated_irr": 0.0247,
  "frbp_transfer_review_required": true
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["face_amount_cents","purchase_price_cents","time_to_recovery_years","expected_recovery_rate"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## 9. Conformance bindings

Requirement `REQ-M166` is verified by 2 published case(s): `CONF.MODEL.RESTRUCT.CLAIMS.001`, `CONF.MODEL.RESTRUCT.CLAIMS.002`.

## 10. Version

Reference binding `MODEL.RESTRUCTURING.CLAIMS_TRADING.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M167 — Subchapter V eligibility

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G28
**Deal contexts:** small business Chapter 11

## 1. Purpose

Debt-limit and small-business engagement checks.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M167.schema.json`](M167.schema.json).

| Field | Type | Required |
|---|---|---|
| `aggregate_noncontingent_liquidated_debt_cents` | integer (cents) | MUST |
| `engaged_in_commercial_activity` | boolean | MUST |

## 3. Output contract

| Field | Type |
|---|---|
| `affiliate_of_public_issuer` | boolean |
| `aggregate_noncontingent_liquidated_debt_cents` | integer (cents) |
| `current_threshold_handoff_note` | string |
| `debt_limit_cents` | integer (cents) |
| `debt_limit_satisfied` | boolean |
| `engaged_in_commercial_activity` | boolean |
| `subchapter_v_eligible_under_inputs` | boolean |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Debt-limit and small-business engagement checks.

Checks supplied debt, commercial-activity, and public-issuer affiliate facts against the current Subchapter V threshold.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| 11 U.S.C. 1181-1195 | AUTH-0007 | statute |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.RESTRUCT.SUBV.001` — *Subchapter V eligibility uses current reverted debt threshold*.

**Inputs**

```json
{
  "aggregate_noncontingent_liquidated_debt_cents": 250000000,
  "engaged_in_commercial_activity": true
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "aggregate_noncontingent_liquidated_debt_cents": 250000000,
  "debt_limit_cents": 302472500,
  "debt_limit_satisfied": true,
  "engaged_in_commercial_activity": true,
  "affiliate_of_public_issuer": false,
  "subchapter_v_eligible_under_inputs": true,
  "current_threshold_handoff_note": "Uses the reverted $3,024,725 threshold unless a user-supplied debt_limit_cents overrides it."
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["aggregate_noncontingent_liquidated_debt_cents","engaged_in_commercial_activity"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## 9. Conformance bindings

Requirement `REQ-M167` is verified by 2 published case(s): `CONF.MODEL.RESTRUCT.SUBV.001`, `CONF.MODEL.RESTRUCT.SUBV.002`.

## 10. Version

Reference binding `MODEL.RESTRUCTURING.SUBCHAPTER_V_ELIGIBILITY.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M168 — Chapter 22 recidivism score

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G28
**Deal contexts:** post-emergence

## 1. Purpose

Recidivism-risk score from supplied operating and capital-structure inputs.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M168.schema.json`](M168.schema.json).

| Field | Type | Required |
|---|---|---|
| `ebitda_growth_pct` | number | MUST |
| `exit_leverage` | integer | MUST |
| `liquidity_months` | integer | MUST |
| `prior_bankruptcy_count` | integer | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `chapter22_recidivism_score` | integer |
| `ebitda_growth_pct` | number |
| `exit_leverage` | integer |
| `financial_advisor_handoff_required` | boolean |
| `liquidity_months` | integer |
| `prior_bankruptcy_count` | integer |
| `risk_band` | string |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Recidivism-risk score from supplied operating and capital-structure inputs.

Scores post-emergence repeat-filing risk from exit leverage, liquidity runway, EBITDA growth, and prior bankruptcy count.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| LoPucki Bankruptcy Research Database | AUTH-0183 | practice-or-guidance |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.RESTRUCT.CH22.001` — *Chapter 22 model scores recidivism from leverage, liquidity, growth, and history*.

**Inputs**

```json
{
  "exit_leverage": 5,
  "liquidity_months": 6,
  "ebitda_growth_pct": -0.05,
  "prior_bankruptcy_count": 1
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "exit_leverage": 5,
  "liquidity_months": 6,
  "ebitda_growth_pct": -0.05,
  "prior_bankruptcy_count": 1,
  "chapter22_recidivism_score": 74,
  "risk_band": "high",
  "financial_advisor_handoff_required": true
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["exit_leverage","liquidity_months","ebitda_growth_pct"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model produces deterministic schedules and routing only. The governing determination for chapter 22 recidivism score is a licensed-professional conclusion; a conforming implementation MUST route that determination (with the model's workpapers) and MUST NOT emit it.

## 9. Conformance bindings

Requirement `REQ-M168` is verified by 2 published case(s): `CONF.MODEL.RESTRUCT.CH22.001`, `CONF.MODEL.RESTRUCT.CH22.002`.

## 10. Version

Reference binding `MODEL.RESTRUCTURING.CHAPTER22.RECIDIVISM.v1` · entered the specification at internal lineage stage `v1_1` · spec v1.0.0.


# M169 — FIRPTA withholding

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G30
**Deal contexts:** real estate M&A

## 1. Purpose

15 percent, 10 percent, or exemption withholding path.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M169.schema.json`](M169.schema.json).

| Field | Type | Required |
|---|---|---|
| `amount_realized_cents` | integer (cents) | MUST |
| `seller_foreign_person` | boolean | MUST |
| `buyer_will_use_as_residence` | boolean | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `amount_realized_cents` | integer (cents) |
| `buyer_will_use_as_residence` | boolean |
| `forms_due_within_days` | integer |
| `path` | string |
| `seller_foreign_person` | boolean |
| `withholding_amount_cents` | integer (cents) |
| `withholding_rate` | number |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

15 percent, 10 percent, or exemption withholding path.

Computes FIRPTA withholding rate, amount, residence exception path, and form timing from supplied transaction facts.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| IRC 1445 | AUTH-0130 | statute |
| Forms 8288 and 8288-A | AUTH-0086 | form |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.RE.FIRPTA.001` — *FIRPTA computes reduced personal-residence withholding*.

**Inputs**

```json
{
  "amount_realized_cents": 80000000,
  "seller_foreign_person": true,
  "buyer_will_use_as_residence": true
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "amount_realized_cents": 80000000,
  "seller_foreign_person": true,
  "buyer_will_use_as_residence": true,
  "withholding_rate": 0.1,
  "withholding_amount_cents": 8000000,
  "path": "personal_residence_300k_to_1m_reduced_rate",
  "forms_due_within_days": 20
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["amount_realized_cents","seller_foreign_person"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## 9. Conformance bindings

Requirement `REQ-M169` is verified by 2 published case(s): `CONF.MODEL.RE.FIRPTA.001`, `CONF.MODEL.RE.FIRPTA.002`.

## 10. Version

Reference binding `MODEL.RE.FIRPTA.WITHHOLDING.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M170 — 1031 like-kind exchange timing

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G30
**Deal contexts:** real estate exchange

## 1. Purpose

45-day/180-day timing, identification rules, and boot recognition.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M170.schema.json`](M170.schema.json).

| Field | Type | Required |
|---|---|---|
| `relinquished_property_value_cents` | integer (cents) | MUST |
| `replacement_property_value_cents` | integer (cents) | MUST |
| `transfer_date` | string (ISO date) | MUST |
| `boot_received_cents` | integer (cents) | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `boot_received_cents` | integer (cents) |
| `exchange_deadline` | string |
| `identification_deadline` | string |
| `recognized_gain_floor_cents` | integer (cents) |
| `relinquished_value_cents` | integer (cents) |
| `replacement_value_cents` | integer (cents) |
| `transfer_date` | string (ISO date) |
| `value_shortfall_cents` | integer (cents) |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

45-day/180-day timing, identification rules, and boot recognition.

Computes 45-day identification and 180-day exchange deadlines plus boot/value-shortfall recognition floor.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| IRC 1031 | AUTH-0122 | statute |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.RE.1031.001` — *1031 timing computes statutory deadlines and boot floor*.

**Inputs**

```json
{
  "transfer_date": "2026-05-21",
  "relinquished_property_value_cents": 100000000,
  "replacement_property_value_cents": 90000000,
  "boot_received_cents": 5000000
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "transfer_date": "2026-05-21",
  "identification_deadline": "2026-07-05",
  "exchange_deadline": "2026-11-17",
  "replacement_value_cents": 90000000,
  "relinquished_value_cents": 100000000,
  "boot_received_cents": 5000000,
  "value_shortfall_cents": 10000000,
  "recognized_gain_floor_cents": 10000000
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["transfer_date","relinquished_property_value_cents","replacement_property_value_cents"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## 9. Conformance bindings

Requirement `REQ-M170` is verified by 2 published case(s): `CONF.MODEL.RE.1031.001`, `CONF.MODEL.RE.1031.002`.

## 10. Version

Reference binding `MODEL.RE.1031.TIMING.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M171 — Sale-leaseback and ASC 842

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G30
**Deal contexts:** OpCo/PropCo · sale-leaseback

## 1. Purpose

Cap rate, residual value, and finance-versus-operating classification scaffold.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M171.schema.json`](M171.schema.json).

| Field | Type | Required |
|---|---|---|
| `annual_rent_cents` | integer (cents) | MUST |
| `lease_term_years` | integer | MUST |
| `sale_price_cents` | integer (cents) | MUST |
| `economic_life_years` | integer | MAY |
| `pv_lease_payments_cents` | integer (cents) | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `accounting_review_flags` | string[] |
| `annual_rent_cents` | integer (cents) |
| `asc842_indicator_classification` | string |
| `cap_rate` | number |
| `finance_lease_indicators` | any[] |
| `lease_term_pct_of_economic_life` | number |
| `lease_term_years` | integer |
| `pv_payments_pct_of_fair_value` | number |
| `sale_price_cents` | integer (cents) |
| `total_nominal_rent_cents` | integer (cents) |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Cap rate, residual value, and finance-versus-operating classification scaffold.

Computes sale-leaseback cap rate, nominal rent burden, and ASC 842 finance-lease indicator flags from supplied facts.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| ASC 842 | AUTH-0044 | practice-or-guidance |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.RE.SALELEASEBACK.001` — *Sale-leaseback computes cap rate and ASC 842 indicators*.

**Inputs**

```json
{
  "sale_price_cents": 100000000,
  "annual_rent_cents": 7500000,
  "lease_term_years": 10,
  "economic_life_years": 20,
  "pv_lease_payments_cents": 80000000
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "sale_price_cents": 100000000,
  "annual_rent_cents": 7500000,
  "cap_rate": 0.075,
  "lease_term_years": 10,
  "total_nominal_rent_cents": 75000000,
  "lease_term_pct_of_economic_life": 0.5,
  "pv_payments_pct_of_fair_value": 0.8,
  "asc842_indicator_classification": "operating_lease_indicator_on_supplied_facts",
  "finance_lease_indicators": [],
  "accounting_review_flags": [
    "ASC 842 sale accounting and lease classification require accountant review on the final facts."
  ]
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["sale_price_cents","annual_rent_cents","lease_term_years"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model produces deterministic schedules and routing only. The governing determination for sale-leaseback and asc 842 is a licensed-professional conclusion; a conforming implementation MUST route that determination (with the model's workpapers) and MUST NOT emit it.

## 9. Conformance bindings

Requirement `REQ-M171` is verified by 2 published case(s): `CONF.MODEL.RE.SALELEASEBACK.001`, `CONF.MODEL.RE.SALELEASEBACK.002`.

## 10. Version

Reference binding `MODEL.RE.SALE_LEASEBACK.ASC842.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M172 — REIT 75/75/90 compliance triad

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G30
**Deal contexts:** REIT M&A

## 1. Purpose

Income, asset, and distribution compliance tests.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M172.schema.json`](M172.schema.json).

| Field | Type | Required |
|---|---|---|
| `distributions_cents` | integer (cents) | MUST |
| `real_estate_assets_cents` | integer (cents) | MUST |
| `real_estate_income_cents` | integer (cents) | MUST |
| `taxable_income_cents` | integer (cents) | MUST |
| `total_assets_cents` | integer (cents) | MUST |
| `total_income_cents` | integer (cents) | MUST |

## 3. Output contract

| Field | Type |
|---|---|
| `all_tests_passed` | boolean |
| `asset_75_pct` | number |
| `asset_75_test_passed` | boolean |
| `distribution_90_pct` | number |
| `distribution_90_test_passed` | boolean |
| `income_75_pct` | number |
| `income_75_test_passed` | boolean |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Income, asset, and distribution compliance tests.

Checks REIT income, asset, and distribution percentages against 75/75/90 threshold mechanics.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| IRC 856-860 | AUTH-0157 | statute |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.RE.REIT.001` — *REIT compliance triad passes 75/75/90 tests*.

**Inputs**

```json
{
  "real_estate_income_cents": 800000,
  "total_income_cents": 1000000,
  "real_estate_assets_cents": 900000,
  "total_assets_cents": 1000000,
  "distributions_cents": 950000,
  "taxable_income_cents": 1000000
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "income_75_pct": 0.8,
  "income_75_test_passed": true,
  "asset_75_pct": 0.9,
  "asset_75_test_passed": true,
  "distribution_90_pct": 0.95,
  "distribution_90_test_passed": true,
  "all_tests_passed": true
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["real_estate_income_cents","total_income_cents","real_estate_assets_cents","total_assets_cents","distributions_cents","taxable_income_cents"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## 9. Conformance bindings

Requirement `REQ-M172` is verified by 2 published case(s): `CONF.MODEL.RE.REIT.001`, `CONF.MODEL.RE.REIT.002`.

## 10. Version

Reference binding `MODEL.RE.REIT.COMPLIANCE.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M173 — Project-finance coverage suite

**Status:** Catalog (informative) — normative specification scheduled
**Boundary classification:** Research scaffold — organizes authorities and considerations; not an executable determination.
**Gates:** G30
**Deal contexts:** project finance · infrastructure

## 1. Purpose

DSCR, LLCR, PLCR, and concession-model scaffold.

> **Catalog status.** This entry is informative: it maps the slot's purpose, boundary, routing, and authorities. It is NOT implementable from this document alone — the normative contract (I/O schemas, algorithm, worked example, conformance bindings) is scheduled for a future spec version.

## Boundary statement

Research scaffold: organizes authorities and considerations. Produces oriented reading, not determinations.

## Authorities

- AUTH-0232 — project-finance market practice


# M174 — Crypto token taxonomy

**Status:** Catalog (informative) — normative specification scheduled
**Boundary classification:** Research scaffold — organizes authorities and considerations; not an executable determination.
**Gates:** G30
**Deal contexts:** crypto M&A

## 1. Purpose

Howey and Project Crypto classification scaffold.

> **Catalog status.** This entry is informative: it maps the slot's purpose, boundary, routing, and authorities. It is NOT implementable from this document alone — the normative contract (I/O schemas, algorithm, worked example, conformance bindings) is scheduled for a future spec version.

## Boundary statement

Research scaffold: organizes authorities and considerations. Produces oriented reading, not determinations.

## Authorities

- AUTH-0250 — SEC Project Crypto
- AUTH-0104 — Howey


# M175 — GENIUS Act stablecoin PPS test

**Status:** Catalog (informative) — normative specification scheduled
**Boundary classification:** Research scaffold — organizes authorities and considerations; not an executable determination.
**Gates:** G30
**Deal contexts:** stablecoin issuer

## 1. Purpose

Permitted payment stablecoin framework scaffold.

> **Catalog status.** This entry is informative: it maps the slot's purpose, boundary, routing, and authorities. It is NOT implementable from this document alone — the normative contract (I/O schemas, algorithm, worked example, conformance bindings) is scheduled for a future spec version.

## Boundary statement

Research scaffold: organizes authorities and considerations. Produces oriented reading, not determinations.

## Authorities

- AUTH-0100 — GENIUS Act


# M176 — Digital-asset broker reporting

**Status:** Catalog (informative) — normative specification scheduled
**Boundary classification:** Research scaffold — organizes authorities and considerations; not an executable determination.
**Gates:** G30
**Deal contexts:** crypto M&A

## 1. Purpose

Broker-reporting and data-field scaffold.

> **Catalog status.** This entry is informative: it maps the slot's purpose, boundary, routing, and authorities. It is NOT implementable from this document alone — the normative contract (I/O schemas, algorithm, worked example, conformance bindings) is scheduled for a future spec version.

## Boundary statement

Research scaffold: organizes authorities and considerations. Produces oriented reading, not determinations.

## Authorities

- AUTH-0152 — IRC 6045
- AUTH-0272 — T.D. 10000
- AUTH-0083 — Form 1099-DA


# M177 — LP-secondary plus ECI withholding

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G26, G30
**Deal contexts:** LP secondary

## 1. Purpose

PSA, tri-party transfer, and withholding scaffold.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M177.schema.json`](M177.schema.json).

| Field | Type | Required |
|---|---|---|
| `purchase_price_cents` | integer (cents) | MUST |
| `seller_foreign_person` | boolean | MUST |

## 3. Output contract

| Field | Type |
|---|---|
| `eci_gain_cents` | null |
| `psa_required` | boolean |
| `purchase_price_cents` | integer (cents) |
| `section_1446f_default_withholding_cents` | integer (cents) |
| `seller_foreign_person` | boolean |
| `tax_specialist_handoff_required` | boolean |
| `tri_party_transfer_required` | boolean |
| `withholding_certificate_provided` | boolean |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

PSA, tri-party transfer, and withholding scaffold.

Computes 1446(f) default withholding, PSA requirement, tri-party transfer requirement, and tax specialist handoff flag.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| IRC 1446(f) | AUTH-0131 | statute |
| ILPA guidance | AUTH-0109 | practice-or-guidance |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.SECONDARIES.LP_ECI.001` — *LP secondary model computes 1446(f) withholding and transfer documents*.

**Inputs**

```json
{
  "purchase_price_cents": 1000000,
  "seller_foreign_person": true
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "purchase_price_cents": 1000000,
  "seller_foreign_person": true,
  "withholding_certificate_provided": false,
  "section_1446f_default_withholding_cents": 100000,
  "eci_gain_cents": null,
  "psa_required": true,
  "tri_party_transfer_required": true,
  "tax_specialist_handoff_required": true
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["purchase_price_cents","seller_foreign_person"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model produces deterministic schedules and routing only. The governing determination for lp-secondary plus eci withholding is a licensed-professional conclusion; a conforming implementation MUST route that determination (with the model's workpapers) and MUST NOT emit it.

## 9. Conformance bindings

Requirement `REQ-M177` is verified by 2 published case(s): `CONF.MODEL.SECONDARIES.LP_ECI.001`, `CONF.MODEL.SECONDARIES.LP_ECI.002`.

## 10. Version

Reference binding `MODEL.SECONDARIES.LP_ECI.v1` · entered the specification at internal lineage stage `v1_1` · spec v1.0.0.


# M178 — Strip-sale pricing

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G26, G30
**Deal contexts:** strip sale

## 1. Purpose

Proportionate interest pricing and retained-exposure schedule.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M178.schema.json`](M178.schema.json).

| Field | Type | Required |
|---|---|---|
| `fund_nav_cents` | integer (cents) | MUST |
| `sale_price_cents` | integer (cents) | MUST |
| `strip_percentage` | number | MUST |

## 3. Output contract

| Field | Type |
|---|---|
| `discount_to_nav_pct` | number |
| `fund_nav_cents` | integer (cents) |
| `implied_total_value_cents` | integer (cents) |
| `retained_nav_cents` | integer (cents) |
| `sale_price_cents` | integer (cents) |
| `sold_nav_cents` | integer (cents) |
| `strip_percentage` | number |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Proportionate interest pricing and retained-exposure schedule.

Computes sold NAV, retained NAV, implied total value, and discount or premium to fund NAV.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| practice-norm (unanchored) | AUTH-0228 | practice-norm |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.SECONDARIES.STRIP.001` — *Strip-sale model computes implied value and retained NAV*.

**Inputs**

```json
{
  "fund_nav_cents": 1000000,
  "strip_percentage": 0.25,
  "sale_price_cents": 220000
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "fund_nav_cents": 1000000,
  "strip_percentage": 0.25,
  "sold_nav_cents": 250000,
  "retained_nav_cents": 750000,
  "sale_price_cents": 220000,
  "implied_total_value_cents": 880000,
  "discount_to_nav_pct": 0.12
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["fund_nav_cents","strip_percentage","sale_price_cents"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## 9. Conformance bindings

Requirement `REQ-M178` is verified by 2 published case(s): `CONF.MODEL.SECONDARIES.STRIP.001`, `CONF.MODEL.SECONDARIES.STRIP.002`.

## 10. Version

Reference binding `MODEL.SECONDARIES.STRIP_SALE.v1` · entered the specification at internal lineage stage `v1_1` · spec v1.0.0.


# M179 — NAV facility LTV

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G26, G30
**Deal contexts:** NAV financing

## 1. Purpose

Loan-to-value, cushion, and collateral pool schedule.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M179.schema.json`](M179.schema.json).

| Field | Type | Required |
|---|---|---|
| `fund_nav_cents` | integer (cents) | MUST |
| `loan_amount_cents` | integer (cents) | MUST |
| `required_cushion_pct` | number | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `cushion_pct` | number |
| `cushion_requirement_satisfied` | boolean |
| `fund_nav_cents` | integer (cents) |
| `lender_handoff_required` | boolean |
| `loan_amount_cents` | integer (cents) |
| `nav_ltv` | number |
| `required_cushion_pct` | number |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Loan-to-value, cushion, and collateral pool schedule.

Computes fund NAV LTV, cushion, required cushion, and lender-handoff flag.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| NAV facility market practice | AUTH-0209 | practice-or-guidance |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.FINANCE.NAV.001` — *NAV facility model computes LTV and cushion*.

**Inputs**

```json
{
  "fund_nav_cents": 1000000,
  "loan_amount_cents": 700000,
  "required_cushion_pct": 0.25
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "fund_nav_cents": 1000000,
  "loan_amount_cents": 700000,
  "nav_ltv": 0.7,
  "cushion_pct": 0.3,
  "required_cushion_pct": 0.25,
  "cushion_requirement_satisfied": true,
  "lender_handoff_required": true
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["fund_nav_cents","loan_amount_cents"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model produces deterministic schedules and routing only. The governing determination for nav facility ltv is a licensed-professional conclusion; a conforming implementation MUST route that determination (with the model's workpapers) and MUST NOT emit it.

## 9. Conformance bindings

Requirement `REQ-M179` is verified by 2 published case(s): `CONF.MODEL.FINANCE.NAV.001`, `CONF.MODEL.FINANCE.NAV.002`.

## 10. Version

Reference binding `MODEL.FINANCE.NAV_FACILITY.v1` · entered the specification at internal lineage stage `v1_1` · spec v1.0.0.


# M180 — Convertible and SAFE conversion

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G15, G29
**Deal contexts:** convertible · SAFE

## 1. Purpose

Cap, discount, pre/post-money, and if-converted math.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M180.schema.json`](M180.schema.json).

| Field | Type | Required |
|---|---|---|
| `investment_cents` | integer (cents) | MUST |
| `priced_round_share_price_cents` | integer (cents) | MUST |
| `discount_pct` | number | MAY |
| `pre_money_share_count` | integer | MAY |
| `valuation_cap_cents` | integer (cents) | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `cap_price_cents` | integer (cents) |
| `conversion_driver` | string |
| `conversion_price_cents` | integer (cents) |
| `converted_share_count` | integer |
| `discount_pct` | number |
| `discount_price_cents` | integer (cents) |
| `investment_cents` | integer (cents) |
| `priced_round_share_price_cents` | integer (cents) |
| `valuation_cap_cents` | integer (cents) |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Cap, discount, pre/post-money, and if-converted math.

Computes conversion price and converted shares using priced-round price, discount, and valuation-cap mechanics.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| YC SAFE | AUTH-0308 | practice-or-guidance |
| practice-norm (unanchored) | AUTH-0228 | practice-norm |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.FINANCE.SAFE.001` — *Convertible SAFE selects the best conversion price*.

**Inputs**

```json
{
  "investment_cents": 1000000,
  "priced_round_share_price_cents": 1000,
  "discount_pct": 0.2,
  "valuation_cap_cents": 80000000,
  "pre_money_share_count": 100000
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "investment_cents": 1000000,
  "priced_round_share_price_cents": 1000,
  "discount_pct": 0.2,
  "discount_price_cents": 800,
  "valuation_cap_cents": 80000000,
  "cap_price_cents": 800,
  "conversion_price_cents": 800,
  "converted_share_count": 1250,
  "conversion_driver": "valuation_cap"
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["investment_cents","priced_round_share_price_cents"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## 9. Conformance bindings

Requirement `REQ-M180` is verified by 2 published case(s): `CONF.MODEL.FINANCE.SAFE.001`, `CONF.MODEL.FINANCE.SAFE.002`.

## 10. Version

Reference binding `MODEL.FINANCE.CONVERTIBLE_SAFE.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M181 — Venture-debt warrant coverage

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G15, G29
**Deal contexts:** venture debt

## 1. Purpose

Warrant coverage, exercise price, and lender IRR.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M181.schema.json`](M181.schema.json).

| Field | Type | Required |
|---|---|---|
| `exercise_price_cents` | integer (cents) | MUST |
| `fair_value_share_price_cents` | integer (cents) | MUST |
| `loan_amount_cents` | integer (cents) | MUST |
| `warrant_coverage_pct` | number | MUST |
| `cash_interest_rate` | number | MAY |
| `term_years` | integer | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `estimated_lender_irr` | number |
| `intrinsic_warrant_value_cents` | integer (cents) |
| `lender_gross_return_cents` | integer (cents) |
| `loan_amount_cents` | integer (cents) |
| `simple_interest_cents` | integer (cents) |
| `warrant_coverage_amount_cents` | integer (cents) |
| `warrant_coverage_pct` | number |
| `warrant_shares` | integer |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Warrant coverage, exercise price, and lender IRR.

Computes warrant coverage amount, shares, intrinsic warrant value, simple interest, gross return, and estimated lender IRR.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| venture-debt market practice | AUTH-0306 | practice-or-guidance |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.FINANCE.VD_WARRANT.001` — *Venture-debt warrant model computes coverage, value, and lender return*.

**Inputs**

```json
{
  "loan_amount_cents": 1000000,
  "warrant_coverage_pct": 0.1,
  "exercise_price_cents": 200,
  "fair_value_share_price_cents": 300,
  "term_years": 3,
  "cash_interest_rate": 0.1
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "loan_amount_cents": 1000000,
  "warrant_coverage_pct": 0.1,
  "warrant_coverage_amount_cents": 100000,
  "warrant_shares": 500,
  "intrinsic_warrant_value_cents": 50000,
  "simple_interest_cents": 300000,
  "lender_gross_return_cents": 1350000,
  "estimated_lender_irr": 0.1052
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["loan_amount_cents","warrant_coverage_pct","exercise_price_cents","fair_value_share_price_cents"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## 9. Conformance bindings

Requirement `REQ-M181` is verified by 2 published case(s): `CONF.MODEL.FINANCE.VD_WARRANT.001`, `CONF.MODEL.FINANCE.VD_WARRANT.002`.

## 10. Version

Reference binding `MODEL.FINANCE.VENTURE_DEBT_WARRANT.v1` · entered the specification at internal lineage stage `v1_1` · spec v1.0.0.


# M182 — ABL borrowing base

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G15, G29
**Deal contexts:** ABL

## 1. Purpose

Eligible A/R and inventory advance-rate calculation.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M182.schema.json`](M182.schema.json).

| Field | Type | Required |
|---|---|---|
| `eligible_ar_cents` | integer (cents) | MUST |
| `eligible_inventory_cents` | integer (cents) | MUST |
| `commitment_cents` | integer (cents) | MAY |
| `reserves_cents` | integer (cents) | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `ar_advance_rate` | number |
| `availability_cents` | integer (cents) |
| `eligible_ar_cents` | integer (cents) |
| `eligible_inventory_cents` | integer (cents) |
| `gross_borrowing_base_cents` | integer (cents) |
| `inventory_advance_rate` | number |
| `net_borrowing_base_cents` | integer (cents) |
| `reserves_cents` | integer (cents) |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Eligible A/R and inventory advance-rate calculation.

Computes eligible A/R and inventory advance amounts, reserves, and net borrowing-base availability.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| ABL market practice | AUTH-0030 | practice-or-guidance |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.FINANCE.ABL.001` — *ABL borrowing base computes advance rates, reserves, and commitment cap*.

**Inputs**

```json
{
  "eligible_ar_cents": 10000000,
  "eligible_inventory_cents": 4000000,
  "reserves_cents": 500000,
  "commitment_cents": 9000000
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "eligible_ar_cents": 10000000,
  "eligible_inventory_cents": 4000000,
  "ar_advance_rate": 0.85,
  "inventory_advance_rate": 0.5,
  "gross_borrowing_base_cents": 10500000,
  "reserves_cents": 500000,
  "net_borrowing_base_cents": 10000000,
  "availability_cents": 9000000
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["eligible_ar_cents","eligible_inventory_cents"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## 9. Conformance bindings

Requirement `REQ-M182` is verified by 2 published case(s): `CONF.MODEL.FINANCE.ABL.001`, `CONF.MODEL.FINANCE.ABL.002`.

## 10. Version

Reference binding `MODEL.FINANCE.ABL.BORROWING_BASE.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M183 — Make-whole and call protection

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G15, G29
**Deal contexts:** high-yield bonds · term loans

## 1. Purpose

Treasury-plus-spread make-whole and call schedule.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M183.schema.json`](M183.schema.json).

| Field | Type | Required |
|---|---|---|
| `coupon_rate` | number | MUST |
| `principal_cents` | integer (cents) | MUST |
| `remaining_years` | integer | MUST |
| `spread_bps` | integer | MUST |
| `treasury_rate` | number | MUST |
| `call_price_pct` | number | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `coupon_rate` | number |
| `lower_cost_redemption_path` | string |
| `make_whole_discount_rate` | number |
| `make_whole_premium_cents` | integer (cents) |
| `make_whole_price_cents` | integer (cents) |
| `principal_cents` | integer (cents) |
| `spread_bps` | integer |
| `stated_call_price_cents` | integer (cents) |
| `treasury_rate` | number |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Treasury-plus-spread make-whole and call schedule.

Computes a treasury-plus-spread make-whole amount and compares it to stated call-price economics.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| indenture practice | AUTH-0113 | practice-or-guidance |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.FINANCE.MAKEWHOLE.001` — *Make-whole engine compares treasury-plus-spread and stated call economics*.

**Inputs**

```json
{
  "principal_cents": 100000000,
  "coupon_rate": 0.08,
  "treasury_rate": 0.05,
  "spread_bps": 300,
  "remaining_years": 1,
  "call_price_pct": 1.02
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "principal_cents": 100000000,
  "coupon_rate": 0.08,
  "treasury_rate": 0.05,
  "spread_bps": 300,
  "make_whole_discount_rate": 0.08,
  "make_whole_price_cents": 100000000,
  "make_whole_premium_cents": 0,
  "stated_call_price_cents": 102000000,
  "lower_cost_redemption_path": "make_whole"
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["principal_cents","coupon_rate","treasury_rate","spread_bps","remaining_years"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## 9. Conformance bindings

Requirement `REQ-M183` is verified by 2 published case(s): `CONF.MODEL.FINANCE.MAKEWHOLE.001`, `CONF.MODEL.FINANCE.MAKEWHOLE.002`.

## 10. Version

Reference binding `MODEL.FINANCE.MAKE_WHOLE_CALL.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M184 — Covenant basket engine

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G15, G29
**Deal contexts:** credit agreement

## 1. Purpose

Restricted payment, debt, lien, and investment basket capacity.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M184.schema.json`](M184.schema.json).

| Field | Type | Required |
|---|---|---|
| `baskets` | object[] | MUST |

## 3. Output contract

| Field | Type |
|---|---|
| `aggregate_remaining_capacity_cents` | integer (cents) |
| `basket_count` | integer |
| `baskets` | object[] |
| `blocked_basket_count` | integer |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Restricted payment, debt, lien, and investment basket capacity.

Computes fixed, grower, builder, ratio, used, and remaining basket capacity across credit-agreement baskets.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| LSTA model provisions | AUTH-0185 | practice-or-guidance |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.FINANCE.BASKETS.001` — *Covenant basket engine computes remaining capacity and blocked proposed uses*.

**Inputs**

```json
{
  "baskets": [
    {
      "name": "Investment basket",
      "fixed_capacity_cents": 1000000,
      "grower_basis_cents": 10000000,
      "grower_pct": 0.1,
      "used_cents": 500000,
      "proposed_use_cents": 1000000
    },
    {
      "name": "Restricted payment basket",
      "fixed_capacity_cents": 500000,
      "used_cents": 400000,
      "proposed_use_cents": 200000
    }
  ]
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "basket_count": 2,
  "aggregate_remaining_capacity_cents": 1600000,
  "blocked_basket_count": 1,
  "baskets": [
    {
      "name": "Investment basket",
      "basket_type": "general",
      "total_capacity_cents": 2000000,
      "used_cents": 500000,
      "remaining_capacity_cents": 1500000,
      "proposed_use_cents": 1000000,
      "proposed_use_fits": true
    },
    {
      "name": "Restricted payment basket",
      "basket_type": "general",
      "total_capacity_cents": 500000,
      "used_cents": 400000,
      "remaining_capacity_cents": 100000,
      "proposed_use_cents": 200000,
      "proposed_use_fits": false
    }
  ]
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["baskets"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## 9. Conformance bindings

Requirement `REQ-M184` is verified by 2 published case(s): `CONF.MODEL.FINANCE.BASKETS.001`, `CONF.MODEL.FINANCE.BASKETS.002`.

## 10. Version

Reference binding `MODEL.FINANCE.COVENANT_BASKETS.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M185 — 280G golden parachute

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G15
**Deal contexts:** M&A executive compensation

## 1. Purpose

Three-times base amount, excise-tax, deduction, and cleansing-vote math.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M185.schema.json`](M185.schema.json).

| Field | Type | Required |
|---|---|---|
| `base_amount_cents` | integer (cents) | MUST |
| `parachute_payments_cents` | integer (cents) | MUST |
| `shareholder_cleansing_vote_pct` | number | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `base_amount_cents` | integer (cents) |
| `cleansing_vote_passed` | boolean |
| `cleansing_vote_threshold_pct` | number |
| `excess_parachute_payment_cents` | integer (cents) |
| `excise_tax_20pct_cents` | integer (cents) |
| `lost_employer_deduction_cents` | integer (cents) |
| `parachute_payments_cents` | integer (cents) |
| `section_280g_triggered` | boolean |
| `shareholder_cleansing_vote_pct` | number |
| `three_times_base_threshold_cents` | integer (cents) |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Three-times base amount, excise-tax, deduction, and cleansing-vote math.

Computes three-times-base trigger, excess parachute payment, 20 percent excise tax, lost deduction, and shareholder-cleansing threshold.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| IRC 280G | AUTH-0136 | statute |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.TAX.280G.001` — *280G model computes trigger, excess payment, excise tax, and cleansing vote*.

**Inputs**

```json
{
  "base_amount_cents": 1000000,
  "parachute_payments_cents": 3500000,
  "shareholder_cleansing_vote_pct": 0.8
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "base_amount_cents": 1000000,
  "parachute_payments_cents": 3500000,
  "three_times_base_threshold_cents": 3000000,
  "section_280g_triggered": true,
  "excess_parachute_payment_cents": 2500000,
  "excise_tax_20pct_cents": 500000,
  "lost_employer_deduction_cents": 2500000,
  "shareholder_cleansing_vote_pct": 0.8,
  "cleansing_vote_threshold_pct": 0.75,
  "cleansing_vote_passed": true
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["base_amount_cents","parachute_payments_cents"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## 9. Conformance bindings

Requirement `REQ-M185` is verified by 2 published case(s): `CONF.MODEL.TAX.280G.001`, `CONF.MODEL.TAX.280G.002`.

## 10. Version

Reference binding `MODEL.TAX.280G.PARACHUTE.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M186 — 382 NOL limitation

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G15
**Deal contexts:** NOL target

## 1. Purpose

Long-term tax-exempt rate times loss-corporation value.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M186.schema.json`](M186.schema.json).

| Field | Type | Required |
|---|---|---|
| `long_term_tax_exempt_rate` | number | MUST |
| `loss_corporation_value_cents` | integer (cents) | MUST |
| `nol_carryforward_cents` | integer (cents) | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `annual_section_382_limitation_cents` | integer (cents) |
| `estimated_years_to_use_nol` | integer |
| `long_term_tax_exempt_rate` | number |
| `loss_corporation_value_cents` | integer (cents) |
| `nol_carryforward_cents` | integer (cents) |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Long-term tax-exempt rate times loss-corporation value.

Computes annual Section 382 limitation as loss-corporation value times the long-term tax-exempt rate.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| IRC 382 | AUTH-0146 | statute |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.TAX.382.001` — *382 model computes annual NOL limitation and estimated use period*.

**Inputs**

```json
{
  "loss_corporation_value_cents": 100000000,
  "long_term_tax_exempt_rate": 0.04,
  "nol_carryforward_cents": 10000000
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "loss_corporation_value_cents": 100000000,
  "long_term_tax_exempt_rate": 0.04,
  "annual_section_382_limitation_cents": 4000000,
  "nol_carryforward_cents": 10000000,
  "estimated_years_to_use_nol": 3
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["loss_corporation_value_cents","long_term_tax_exempt_rate"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## 9. Conformance bindings

Requirement `REQ-M186` is verified by 2 published case(s): `CONF.MODEL.TAX.382.001`, `CONF.MODEL.TAX.382.002`.

## 10. Version

Reference binding `MODEL.TAX.382.NOL_LIMIT.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M187 — RE-heavy asset-vs-entity election

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G30, G2
**Deal contexts:** real estate M&A

## 1. Purpose

Asset-deal step-up, entity-deal basis, transfer-tax incidence, debt assumability, and in-place lease treatment.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M187.schema.json`](M187.schema.json).

| Field | Type | Required |
|---|---|---|
| `enterprise_value_cents` | integer (cents) | MUST |
| `real_property_value_cents` | integer (cents) | MUST |
| `debt_assumable` | boolean | MAY |
| `entity_carried_basis_cents` | integer (cents) | MAY |
| `step_up_benefit_rate` | number | MAY |
| `transfer_tax_rate` | number | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `asset_deal_buyer_basis_cents` | integer (cents) |
| `buyer_step_up_cents` | integer (cents) |
| `buyer_step_up_pv_benefit_cents` | integer (cents) |
| `debt_assumability` | string |
| `enterprise_value_cents` | integer (cents) |
| `entity_carried_basis_cents` | integer (cents) |
| `entity_deal_buyer_outside_basis_cents` | integer (cents) |
| `g30_real_estate_overlay_triggered` | boolean |
| `in_place_lease_treatment` | string |
| `real_estate_pct_of_ev` | number |
| `real_property_value_cents` | integer (cents) |
| `transfer_tax_cents` | integer (cents) |
| `transfer_tax_rate` | number |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Asset-deal step-up, entity-deal basis, transfer-tax incidence, debt assumability, and in-place lease treatment.

Computes real-estate percentage of EV, asset/entity basis paths, step-up, transfer tax, debt assumability, and lease treatment flags.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| IRC 1001 | AUTH-0121 | statute |
| IRC 1060 | AUTH-0124 | statute |
| IRC 197 | AUTH-0134 | statute |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.RE.ASSETENTITY.001` — *RE-heavy asset-vs-entity election computes overlay, tax, and step-up mechanics*.

**Inputs**

```json
{
  "enterprise_value_cents": 100000000,
  "real_property_value_cents": 30000000,
  "entity_carried_basis_cents": 60000000,
  "transfer_tax_rate": 0.01,
  "step_up_benefit_rate": 0.12,
  "debt_assumable": false
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "enterprise_value_cents": 100000000,
  "real_property_value_cents": 30000000,
  "real_estate_pct_of_ev": 0.3,
  "g30_real_estate_overlay_triggered": true,
  "asset_deal_buyer_basis_cents": 100000000,
  "entity_deal_buyer_outside_basis_cents": 100000000,
  "entity_carried_basis_cents": 60000000,
  "buyer_step_up_cents": 40000000,
  "buyer_step_up_pv_benefit_cents": 4800000,
  "transfer_tax_rate": 0.01,
  "transfer_tax_cents": 300000,
  "debt_assumability": "consent_or_refinance_required",
  "in_place_lease_treatment": "assumption_or_assignment_to_confirm"
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["enterprise_value_cents","real_property_value_cents"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## 9. Conformance bindings

Requirement `REQ-M187` is verified by 2 published case(s): `CONF.MODEL.RE.ASSETENTITY.001`, `CONF.MODEL.RE.ASSETENTITY.002`.

## 10. Version

Reference binding `MODEL.RE.ASSET_ENTITY.ELECTION.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M188 — RE/operating-business purchase price bifurcation

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G30, G2
**Deal contexts:** real estate M&A · operating business with real property

## 1. Purpose

NOI/cap-rate real-estate value, residual operating-business value, and 1060 Class V/VI/VII reconciliation.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M188.schema.json`](M188.schema.json).

| Field | Type | Required |
|---|---|---|
| `cap_rate` | number | MUST |
| `enterprise_value_cents` | integer (cents) | MUST |
| `noi_cents` | integer (cents) | MUST |
| `class_vi_intangibles_cents` | integer (cents) | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `cap_rate` | number |
| `class_v_real_property_and_tangible_cents` | integer (cents) |
| `class_vi_section_197_intangibles_cents` | integer (cents) |
| `class_vii_goodwill_going_concern_cents` | integer (cents) |
| `enterprise_value_cents` | integer (cents) |
| `form_8594_reconciliation_total_cents` | integer (cents) |
| `noi_cents` | integer (cents) |
| `operating_business_residual_value_cents` | integer (cents) |
| `real_estate_value_cents` | integer (cents) |
| `uncapped_real_estate_value_cents` | integer (cents) |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

NOI/cap-rate real-estate value, residual operating-business value, and 1060 Class V/VI/VII reconciliation.

Bifurcates enterprise value into NOI/cap-rate real estate value, operating-business residual, and Form 8594 Class V/VI/VII reconciliation.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| Treas. Reg. 1.338-6 | AUTH-0286 | regulation |
| IRS Form 8594 | AUTH-0168 | form |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.RE.BIFURCATION.001` — *RE operating-business bifurcation reconciles NOI value to Class V/VI/VII*.

**Inputs**

```json
{
  "enterprise_value_cents": 100000000,
  "noi_cents": 6000000,
  "cap_rate": 0.075,
  "class_vi_intangibles_cents": 15000000
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "enterprise_value_cents": 100000000,
  "noi_cents": 6000000,
  "cap_rate": 0.075,
  "uncapped_real_estate_value_cents": 80000000,
  "real_estate_value_cents": 80000000,
  "operating_business_residual_value_cents": 20000000,
  "class_v_real_property_and_tangible_cents": 80000000,
  "class_vi_section_197_intangibles_cents": 15000000,
  "class_vii_goodwill_going_concern_cents": 5000000,
  "form_8594_reconciliation_total_cents": 100000000
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["enterprise_value_cents","noi_cents","cap_rate"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## 9. Conformance bindings

Requirement `REQ-M188` is verified by 2 published case(s): `CONF.MODEL.RE.BIFURCATION.001`, `CONF.MODEL.RE.BIFURCATION.002`.

## 10. Version

Reference binding `MODEL.RE.OPBUS.BIFURCATION.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M189 — Rent-roll normalization engine

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G30
**Deal contexts:** real estate diligence

## 1. Purpose

Occupancy, WALT, expiry buckets, tenant concentration, market-rent delta, and stabilized rent.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M189.schema.json`](M189.schema.json).

| Field | Type | Required |
|---|---|---|
| `rent_roll` | object[] | MUST |

## 3. Output contract

| Field | Type |
|---|---|
| `annual_rent_cents` | integer (cents) |
| `area_occupancy_pct` | number |
| `occupancy_pct` | number |
| `occupied_annual_rent_cents` | integer (cents) |
| `occupied_tenant_count` | integer |
| `tenant_concentration_flag` | boolean |
| `tenant_count` | integer |
| `top_tenant_rent_pct` | number |
| `walt_months` | integer |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Occupancy, WALT, expiry buckets, tenant concentration, market-rent delta, and stabilized rent.

Normalizes rent roll into occupancy, WALT, rent, and tenant-concentration metrics.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| practice-norm: real estate industry (unanchored) | AUTH-0230 | practice-norm |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.RE.RENT_ROLL.001` — *Rent roll normalizes occupancy, WALT, and concentration*.

**Inputs**

```json
{
  "rent_roll": [
    {
      "tenant": "A",
      "annual_rent_cents": 6000000,
      "square_feet": 6000,
      "lease_months_remaining": 36,
      "occupied": true
    },
    {
      "tenant": "B",
      "annual_rent_cents": 3000000,
      "square_feet": 3000,
      "lease_months_remaining": 24,
      "occupied": true
    },
    {
      "tenant": "Vacant",
      "annual_rent_cents": 0,
      "square_feet": 1000,
      "lease_months_remaining": 0,
      "occupied": false
    }
  ]
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "tenant_count": 3,
  "occupied_tenant_count": 2,
  "annual_rent_cents": 9000000,
  "occupied_annual_rent_cents": 9000000,
  "occupancy_pct": 0.6667,
  "area_occupancy_pct": 0.9,
  "walt_months": 32,
  "top_tenant_rent_pct": 0.6667,
  "tenant_concentration_flag": true
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["rent_roll"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## 9. Conformance bindings

Requirement `REQ-M189` is verified by 2 published case(s): `CONF.MODEL.RE.RENT_ROLL.001`, `CONF.MODEL.RE.RENT_ROLL.002`.

## 10. Version

Reference binding `MODEL.RE.RENT_ROLL.NORMALIZE.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M190 — NOI normalization and cap-rate bridge

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G30
**Deal contexts:** real estate valuation

## 1. Purpose

Effective gross income less operating expenses to NOI, value equals NOI divided by cap rate, and implied cap rate. Market cap rate is pass-through input.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M190.schema.json`](M190.schema.json).

| Field | Type | Required |
|---|---|---|
| `cap_rate` | number | MUST |
| `effective_gross_income_cents` | integer (cents) | MUST |
| `operating_expenses_cents` | integer (cents) | MUST |
| `market_cap_rate_from_pass_through_source` | boolean | MAY |
| `purchase_price_cents` | integer (cents) | MAY |
| `replacement_reserve_cents` | integer (cents) | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `cap_rate` | number |
| `effective_gross_income_cents` | integer (cents) |
| `implied_cap_rate` | number |
| `normalized_noi_cents` | integer (cents) |
| `operating_expenses_cents` | integer (cents) |
| `pass_through_market_rate_required` | boolean |
| `purchase_price_cents` | integer (cents) |
| `replacement_reserve_cents` | integer (cents) |
| `value_from_cap_rate_cents` | integer (cents) |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Effective gross income less operating expenses to NOI, value equals NOI divided by cap rate, and implied cap rate. Market cap rate is pass-through input.

Computes normalized NOI, cap-rate value, implied cap rate, and pass-through market-rate dependency from supplied inputs.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| Appraisal Institute practice | AUTH-0042 | practice-or-guidance |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.RE.NOI.001` — *NOI and cap-rate bridge computes normalized NOI, value, and implied cap*.

**Inputs**

```json
{
  "effective_gross_income_cents": 10000000,
  "operating_expenses_cents": 3500000,
  "replacement_reserve_cents": 500000,
  "cap_rate": 0.08,
  "purchase_price_cents": 80000000,
  "market_cap_rate_from_pass_through_source": true
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "effective_gross_income_cents": 10000000,
  "operating_expenses_cents": 3500000,
  "replacement_reserve_cents": 500000,
  "normalized_noi_cents": 6000000,
  "cap_rate": 0.08,
  "value_from_cap_rate_cents": 75000000,
  "purchase_price_cents": 80000000,
  "implied_cap_rate": 0.075,
  "pass_through_market_rate_required": false
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["effective_gross_income_cents","operating_expenses_cents","cap_rate"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## 9. Conformance bindings

Requirement `REQ-M190` is verified by 2 published case(s): `CONF.MODEL.RE.NOI.001`, `CONF.MODEL.RE.NOI.002`.

## 10. Version

Reference binding `MODEL.RE.NOI.CAP_RATE_BRIDGE.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M191 — Real estate transfer and controlling-interest tax

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G30, G19
**Deal contexts:** real estate M&A

## 1. Purpose

Jurisdictional CITT tax base, rate, aggregation window, and exemption checks. Contested state positions route to specialist review.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M191.schema.json`](M191.schema.json).

| Field | Type | Required |
|---|---|---|
| `fmv_real_property_cents` | integer (cents) | MUST |
| `interest_transferred_pct` | number | MUST |
| `jurisdiction` | string | MUST |

## 3. Output contract

| Field | Type |
|---|---|
| `aggregation_window_months` | null |
| `contested_state_position_handoff_required` | boolean |
| `exemption_applies` | boolean |
| `fmv_real_property_cents` | integer (cents) |
| `interest_transferred_pct` | number |
| `jurisdiction` | string |
| `tax_base_cents` | integer (cents) |
| `transfer_tax_cents` | integer (cents) |
| `transfer_tax_rate` | number |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Jurisdictional CITT tax base, rate, aggregation window, and exemption checks. Contested state positions route to specialist review.

Computes real-property transfer or controlling-interest tax base, rate, aggregation window, exemption, and specialist handoff flag.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| CT 12-638 | AUTH-0067 | practice-or-guidance |
| MD Tax-Prop 12-117 | AUTH-0192 | practice-or-guidance |
| WA RCW 82.45 | AUTH-0307 | practice-or-guidance |
| NY Publication 576 | AUTH-0216 | study/dataset |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.RE.CITT.001` — *CITT model computes jurisdictional transfer tax*.

**Inputs**

```json
{
  "jurisdiction": "CT",
  "fmv_real_property_cents": 1000000,
  "interest_transferred_pct": 0.8
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "jurisdiction": "CT",
  "fmv_real_property_cents": 1000000,
  "interest_transferred_pct": 0.8,
  "transfer_tax_rate": 0.0111,
  "tax_base_cents": 800000,
  "transfer_tax_cents": 8880,
  "exemption_applies": false,
  "aggregation_window_months": null,
  "contested_state_position_handoff_required": false
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["jurisdiction","fmv_real_property_cents","interest_transferred_pct"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model produces deterministic schedules and routing only. The governing determination for real estate transfer and controlling-interest tax is a licensed-professional conclusion; a conforming implementation MUST route that determination (with the model's workpapers) and MUST NOT emit it.

## 9. Conformance bindings

Requirement `REQ-M191` is verified by 2 published case(s): `CONF.MODEL.RE.CITT.001`, `CONF.MODEL.RE.CITT.002`.

## 10. Version

Reference binding `MODEL.RE.CITT.TRANSFER_TAX.v1` · entered the specification at internal lineage stage `v1_1` · spec v1.0.0.


# M192 — CAM reconciliation mechanics

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G30
**Deal contexts:** commercial real estate diligence

## 1. Purpose

Gross-up, base-year, expense-stop, pro-rata share, and closing-date true-up.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M192.schema.json`](M192.schema.json).

| Field | Type | Required |
|---|---|---|
| `recoverable_expenses_cents` | integer (cents) | MUST |
| `closing_day_of_period` | integer | MAY |
| `period_days` | integer | MAY |
| `tenant_payments_cents` | integer (cents) | MAY |
| `tenant_pro_rata_pct` | number | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `annual_tenant_share_cents` | integer (cents) |
| `closing_true_up_cents` | integer (cents) |
| `prorated_tenant_share_through_closing_cents` | integer (cents) |
| `recoverable_expenses_cents` | integer (cents) |
| `tenant_payments_cents` | integer (cents) |
| `tenant_pro_rata_pct` | number |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Gross-up, base-year, expense-stop, pro-rata share, and closing-date true-up.

Computes tenant pro-rata recoverable expense share and closing-date CAM true-up.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| BOMA | AUTH-0047 | practice-or-guidance |
| practice-norm: real estate industry (unanchored) | AUTH-0230 | practice-norm |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.RE.CAM.001` — *CAM true-up computes prorated recoverable share*.

**Inputs**

```json
{
  "recoverable_expenses_cents": 12000000,
  "tenant_pro_rata_pct": 0.25,
  "tenant_payments_cents": 2000000,
  "closing_day_of_period": 180,
  "period_days": 360
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "recoverable_expenses_cents": 12000000,
  "tenant_pro_rata_pct": 0.25,
  "annual_tenant_share_cents": 3000000,
  "prorated_tenant_share_through_closing_cents": 1500000,
  "tenant_payments_cents": 2000000,
  "closing_true_up_cents": -500000
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["recoverable_expenses_cents","tenant_pro_rata_pct"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## 9. Conformance bindings

Requirement `REQ-M192` is verified by 2 published case(s): `CONF.MODEL.RE.CAM.001`, `CONF.MODEL.RE.CAM.002`.

## 10. Version

Reference binding `MODEL.RE.CAM.TRUEUP.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M193 — Lease abstraction schema

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G30
**Deal contexts:** lease diligence

## 1. Purpose

Structured capture of critical lease fields without interpreting legal enforceability.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M193.schema.json`](M193.schema.json).

| Field | Type | Required |
|---|---|---|
| `leases` | object[] | MUST |

## 3. Output contract

| Field | Type |
|---|---|
| `abstraction_rows` | object[] |
| `annual_rent_cents` | integer (cents) |
| `assignment_consent_required_count` | integer |
| `change_of_control_consent_required_count` | integer |
| `co_tenancy_count` | integer |
| `exclusives_count` | integer |
| `go_dark_count` | integer |
| `lease_count` | integer |
| `walt_months` | number |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Structured capture of critical lease fields without interpreting legal enforceability.

Normalizes supplied lease facts into WALT, rent, consent, option, exclusive-use, co-tenancy, and go-dark fields without legal interpretation.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| practice-norm: lease abstraction (unanchored) | AUTH-0229 | practice-norm |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.RE.LEASES.001` — *Lease abstraction computes WALT, rent, and consent counts*.

**Inputs**

```json
{
  "leases": [
    {
      "tenant": "A",
      "annual_rent_cents": 600000,
      "months_remaining": 24,
      "assignment_consent_required": true,
      "exclusive_use": true
    },
    {
      "tenant": "B",
      "annual_rent_cents": 400000,
      "months_remaining": 12,
      "change_of_control_consent_required": true,
      "co_tenancy": true,
      "go_dark": true
    }
  ]
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "lease_count": 2,
  "annual_rent_cents": 1000000,
  "walt_months": 19.2,
  "assignment_consent_required_count": 1,
  "change_of_control_consent_required_count": 1,
  "exclusives_count": 1,
  "co_tenancy_count": 1,
  "go_dark_count": 1,
  "abstraction_rows": [
    {
      "tenant": "A",
      "annual_rent_cents": 600000,
      "expiry_date": null,
      "months_remaining": 24,
      "assignment_consent_required": true,
      "change_of_control_consent_required": false,
      "renewal_options_count": 0,
      "exclusive_use": true,
      "co_tenancy": false,
      "go_dark": false
    },
    {
      "tenant": "B",
      "annual_rent_cents": 400000,
      "expiry_date": null,
      "months_remaining": 12,
      "assignment_consent_required": false,
      "change_of_control_consent_required": true,
      "renewal_options_count": 0,
      "exclusive_use": false,
      "co_tenancy": true,
      "go_dark": true
    }
  ]
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["leases"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## 9. Conformance bindings

Requirement `REQ-M193` is verified by 2 published case(s): `CONF.MODEL.RE.LEASES.001`, `CONF.MODEL.RE.LEASES.002`.

## 10. Version

Reference binding `MODEL.RE.LEASE_ABSTRACTION.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M194 — OpCo/PropCo separation mechanics

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G30, G2
**Deal contexts:** OpCo/PropCo · sale-leaseback

## 1. Purpose

Bifurcated balance sheet, intercompany lease, interest limitation, and recharacterization-risk threshold schedule.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M194.schema.json`](M194.schema.json).

| Field | Type | Required |
|---|---|---|
| `opco_ebitda_cents` | integer (cents) | MUST |
| `real_property_value_cents` | integer (cents) | MUST |
| `target_cap_rate` | number | MUST |
| `lease_term_years` | integer | MAY |
| `residual_value_pct` | number | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `annual_master_lease_rent_cents` | integer (cents) |
| `implied_rent_yield` | number |
| `lease_term_years` | integer |
| `opco_ebitda_after_rent_cents` | integer (cents) |
| `opco_ebitda_before_rent_cents` | integer (cents) |
| `real_property_value_cents` | integer (cents) |
| `recharacterization_review_required` | boolean |
| `rent_to_ebitda_pct` | number |
| `residual_value_pct` | number |
| `tax_accounting_handoff_required` | boolean |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Bifurcated balance sheet, intercompany lease, interest limitation, and recharacterization-risk threshold schedule.

Computes master lease rent, rent yield, OpCo EBITDA after rent, and tax/accounting review flags.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| IRC 163(j) | AUTH-0132 | statute |
| IRC 856 | AUTH-0156 | statute |
| ASC 842 | AUTH-0044 | practice-or-guidance |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.RE.OPCO_PROPCO.001` — *OpCo/PropCo model computes lease economics and recharacterization flag*.

**Inputs**

```json
{
  "real_property_value_cents": 1000000,
  "target_cap_rate": 0.08,
  "opco_ebitda_cents": 300000,
  "lease_term_years": 35,
  "residual_value_pct": 0.15
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "real_property_value_cents": 1000000,
  "annual_master_lease_rent_cents": 80000,
  "implied_rent_yield": 0.08,
  "opco_ebitda_before_rent_cents": 300000,
  "opco_ebitda_after_rent_cents": 220000,
  "rent_to_ebitda_pct": 0.2667,
  "lease_term_years": 35,
  "residual_value_pct": 0.15,
  "recharacterization_review_required": true,
  "tax_accounting_handoff_required": true
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["real_property_value_cents","target_cap_rate","opco_ebitda_cents"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model produces deterministic schedules and routing only. The governing determination for opco/propco separation mechanics is a licensed-professional conclusion; a conforming implementation MUST route that determination (with the model's workpapers) and MUST NOT emit it.

## 9. Conformance bindings

Requirement `REQ-M194` is verified by 2 published case(s): `CONF.MODEL.RE.OPCO_PROPCO.001`, `CONF.MODEL.RE.OPCO_PROPCO.002`.

## 10. Version

Reference binding `MODEL.RE.OPCO_PROPCO.SEPARATION.v1` · entered the specification at internal lineage stage `v1_1` · spec v1.0.0.


# M195 — Property-level escrow and holdback sizing

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G30
**Deal contexts:** real estate diligence

## 1. Purpose

Issue-specific escrow sizing for environmental, PCA, title, tenant, and cost-to-cure inputs.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M195.schema.json`](M195.schema.json).

| Field | Type | Required |
|---|---|---|
| `issues` | object[] | MUST |
| `general_buffer_rate` | number | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `cost_to_cure_escrow_cents` | integer (cents) |
| `environmental_escrow_cents` | integer (cents) |
| `escrow_rows` | object[] |
| `general_buffer_rate` | number |
| `other_property_escrow_cents` | integer (cents) |
| `pass_through_source_required_count` | integer |
| `pca_reserve_escrow_cents` | integer (cents) |
| `property_issue_count` | integer |
| `tenant_dispute_escrow_cents` | integer (cents) |
| `title_exception_escrow_cents` | integer (cents) |
| `total_property_escrow_cents` | integer (cents) |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Issue-specific escrow sizing for environmental, PCA, title, tenant, and cost-to-cure inputs.

Computes environmental, PCA, title, tenant, cost-to-cure, and other property-specific escrow buckets from supplied issue costs.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| ALTA endorsements | AUTH-0034 | practice-or-guidance |
| real estate practice norms | AUTH-0235 | statute |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.RE.PROPERTY_ESCROW.001` — *Property escrow sizing computes issue-specific holdbacks*.

**Inputs**

```json
{
  "general_buffer_rate": 0.1,
  "issues": [
    {
      "type": "environmental",
      "amount_cents": 100000,
      "holdback_pct": 1
    },
    {
      "type": "PCA deferred maintenance",
      "estimated_cost_cents": 200000,
      "holdback_pct": 0.5
    },
    {
      "type": "title exception",
      "cost_to_cure_cents": 50000
    }
  ]
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "property_issue_count": 3,
  "general_buffer_rate": 0.1,
  "environmental_escrow_cents": 110000,
  "pca_reserve_escrow_cents": 110000,
  "title_exception_escrow_cents": 55000,
  "tenant_dispute_escrow_cents": 0,
  "cost_to_cure_escrow_cents": 0,
  "other_property_escrow_cents": 0,
  "total_property_escrow_cents": 275000,
  "pass_through_source_required_count": 3,
  "escrow_rows": [
    {
      "issue": "Property issue 1",
      "category": "environmental",
      "source": "pass_through_report",
      "amount_cents": 100000,
      "holdback_pct": 1,
      "escrow_cents": 110000,
      "pass_through_source_required": true
    },
    {
      "issue": "Property issue 2",
      "category": "pca",
      "source": "pass_through_report",
      "amount_cents": 200000,
      "holdback_pct": 0.5,
      "escrow_cents": 110000,
      "pass_through_source_required": true
    },
    {
      "issue": "Property issue 3",
      "category": "title",
      "source": "pass_through_report",
      "amount_cents": 50000,
      "holdback_pct": 1,
      "escrow_cents": 55000,
      "pass_through_source_required": true
    }
  ]
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["issues"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model produces deterministic schedules and routing only. The governing determination for property-level escrow and holdback sizing is a licensed-professional conclusion; a conforming implementation MUST route that determination (with the model's workpapers) and MUST NOT emit it.

## 9. Conformance bindings

Requirement `REQ-M195` is verified by 2 published case(s): `CONF.MODEL.RE.PROPERTY_ESCROW.001`, `CONF.MODEL.RE.PROPERTY_ESCROW.002`.

## 10. Version

Reference binding `MODEL.RE.PROPERTY_ESCROW.HOLDBACK.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M196 — Title and survey process checklist

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G30
**Deal contexts:** real estate closing

## 1. Purpose

Title commitment, Schedule B-II, survey, policy, endorsement, curative-plan, and closing-protection sequencing.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M196.schema.json`](M196.schema.json).

| Field | Type | Required |
|---|---|---|
| `survey_received` | boolean | MUST |
| `title_commitment_received` | boolean | MUST |
| `alta_endorsements_requested` | string[] | MAY |
| `curative_items` | object[] | MAY |
| `lender_policy_required` | boolean | MAY |
| `schedule_b_exceptions` | object[] | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `alta_endorsements_requested_count` | integer |
| `closing_protection_letter_required` | boolean |
| `curative_cost_to_cure_cents` | integer (cents) |
| `curative_item_count` | integer |
| `curative_rows` | object[] |
| `lender_policy_required` | boolean |
| `open_curative_item_count` | integer |
| `owner_policy_required` | boolean |
| `process_steps` | string[] |
| `schedule_b_exception_count` | integer |
| `survey_received` | boolean |
| `survey_review_required` | boolean |
| `title_commitment_received` | boolean |
| `title_pass_through_source_required` | boolean |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Title commitment, Schedule B-II, survey, policy, endorsement, curative-plan, and closing-protection sequencing.

Computes title/survey process status, Schedule B exception counts, endorsements, curative items, and closing-protection requirements.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| ALTA forms | AUTH-0036 | form |
| state title statutes | AUTH-0270 | statute |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.RE.TITLE_SURVEY.001` — *Title and survey checklist computes exception and curative status*.

**Inputs**

```json
{
  "title_commitment_received": true,
  "survey_received": true,
  "lender_policy_required": true,
  "schedule_b_exceptions": [
    {
      "name": "utility easement"
    },
    {
      "name": "old lien"
    }
  ],
  "alta_endorsements_requested": [
    "9",
    "3.1"
  ],
  "curative_items": [
    {
      "item": "Release old lien",
      "status": "open",
      "cost_to_cure_cents": 25000
    },
    {
      "item": "Survey update",
      "status": "resolved",
      "cost_to_cure_cents": 5000
    }
  ]
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "title_commitment_received": true,
  "survey_received": true,
  "schedule_b_exception_count": 2,
  "survey_review_required": true,
  "owner_policy_required": true,
  "lender_policy_required": true,
  "alta_endorsements_requested_count": 2,
  "curative_item_count": 2,
  "open_curative_item_count": 1,
  "curative_cost_to_cure_cents": 30000,
  "closing_protection_letter_required": true,
  "title_pass_through_source_required": true,
  "process_steps": [
    "title_commitment",
    "schedule_b_exception_review",
    "survey_review",
    "policy_and_endorsement_selection",
    "curative_work_plan",
    "closing_protection_letter"
  ],
  "curative_rows": [
    {
      "item": "Release old lien",
      "status": "open",
      "cost_to_cure_cents": 25000,
      "open": true
    },
    {
      "item": "Survey update",
      "status": "resolved",
      "cost_to_cure_cents": 5000,
      "open": false
    }
  ]
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["title_commitment_received","survey_received"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model produces deterministic schedules and routing only. The governing determination for title and survey process checklist is a licensed-professional conclusion; a conforming implementation MUST route that determination (with the model's workpapers) and MUST NOT emit it.

## 9. Conformance bindings

Requirement `REQ-M196` is verified by 2 published case(s): `CONF.MODEL.RE.TITLE_SURVEY.001`, `CONF.MODEL.RE.TITLE_SURVEY.002`.

## 10. Version

Reference binding `MODEL.RE.TITLE_SURVEY.CHECKLIST.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M197 — Ground lease vs. fee simple mechanics

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G30
**Deal contexts:** ground lease · real estate financing

## 1. Purpose

Remaining term, rent reset, reversion, leasehold mortgageability, cure rights, and financeability flag.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M197.schema.json`](M197.schema.json).

| Field | Type | Required |
|---|---|---|
| `annual_ground_rent_cents` | integer (cents) | MUST |
| `ground_lease_expiry_date` | string (ISO date) | MUST |
| `loan_maturity_date` | string (ISO date) | MUST |
| `lender_recognition_agreement` | boolean | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `annual_ground_rent_cents` | integer (cents) |
| `counsel_review_required` | boolean |
| `ground_lease_expiry_date` | string (ISO date) |
| `leasehold_mortgageability_flag` | boolean |
| `lender_recognition_agreement` | boolean |
| `lender_tail_requirement_satisfied` | boolean |
| `loan_maturity_date` | string (ISO date) |
| `rent_reset_type` | string |
| `required_tail_years` | integer |
| `tail_years_after_loan_maturity` | integer |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Remaining term, rent reset, reversion, leasehold mortgageability, cure rights, and financeability flag.

Computes remaining ground-lease tail after loan maturity, lender tail requirement, and leasehold mortgageability flag.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| lender practice norms | AUTH-0178 | practice-or-guidance |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.RE.GROUND_LEASE.001` — *Ground lease model computes lender tail and mortgageability*.

**Inputs**

```json
{
  "ground_lease_expiry_date": "2060-01-01",
  "loan_maturity_date": "2030-01-01",
  "annual_ground_rent_cents": 120000,
  "lender_recognition_agreement": true
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "ground_lease_expiry_date": "2060-01-01",
  "loan_maturity_date": "2030-01-01",
  "annual_ground_rent_cents": 120000,
  "rent_reset_type": "unspecified",
  "tail_years_after_loan_maturity": 30,
  "required_tail_years": 25,
  "lender_tail_requirement_satisfied": true,
  "lender_recognition_agreement": true,
  "leasehold_mortgageability_flag": true,
  "counsel_review_required": true
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["ground_lease_expiry_date","loan_maturity_date","annual_ground_rent_cents"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model produces deterministic schedules and routing only. The governing determination for ground lease vs. fee simple mechanics is a licensed-professional conclusion; a conforming implementation MUST route that determination (with the model's workpapers) and MUST NOT emit it.

## 9. Conformance bindings

Requirement `REQ-M197` is verified by 2 published case(s): `CONF.MODEL.RE.GROUND_LEASE.001`, `CONF.MODEL.RE.GROUND_LEASE.002`.

## 10. Version

Reference binding `MODEL.RE.GROUND_LEASE.MECHANICS.v1` · entered the specification at internal lineage stage `v1_1` · spec v1.0.0.


# M198 — PCA reserve modeling

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G30
**Deal contexts:** property condition assessment

## 1. Purpose

PCA-driven one-, five-, and twelve-year reserves plus immediate-repair escrow from pass-through report inputs.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M198.schema.json`](M198.schema.json).

| Field | Type | Required |
|---|---|---|
| `pca_items` | object[] | MUST |

## 3. Output contract

| Field | Type |
|---|---|
| `immediate_repair_escrow_cents` | integer (cents) |
| `pca_item_count` | integer |
| `pca_pass_through_source_required` | boolean |
| `reserve_rows` | object[] |
| `total_replacement_reserve_cents` | integer (cents) |
| `year_1_3_reserve_cents` | integer (cents) |
| `year_4_5_reserve_cents` | integer (cents) |
| `year_6_12_reserve_cents` | integer (cents) |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

PCA-driven one-, five-, and twelve-year reserves plus immediate-repair escrow from pass-through report inputs.

Structures pass-through PCA report items into immediate repair escrow and 1/3, 4/5, and 6/12-year reserve buckets.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| ASTM E2018 | AUTH-0045 | practice-or-guidance |
| lender practice | AUTH-0176 | practice-or-guidance |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.RE.PCA.001` — *PCA reserve modeling structures immediate and replacement reserve buckets*.

**Inputs**

```json
{
  "pca_items": [
    {
      "item": "Roof",
      "immediate_repair_cents": 100000,
      "year_1_3_cents": 200000
    },
    {
      "item": "HVAC",
      "year_4_5_cents": 300000,
      "year_6_12_cents": 400000
    }
  ]
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "pca_item_count": 2,
  "immediate_repair_escrow_cents": 100000,
  "year_1_3_reserve_cents": 200000,
  "year_4_5_reserve_cents": 300000,
  "year_6_12_reserve_cents": 400000,
  "total_replacement_reserve_cents": 1000000,
  "pca_pass_through_source_required": true,
  "reserve_rows": [
    {
      "item": "Roof",
      "immediate_repair_cents": 100000,
      "year_1_3_cents": 200000,
      "year_4_5_cents": 0,
      "year_6_12_cents": 0,
      "total_reserve_cents": 300000,
      "source": "pass_through_pca_report"
    },
    {
      "item": "HVAC",
      "immediate_repair_cents": 0,
      "year_1_3_cents": 0,
      "year_4_5_cents": 300000,
      "year_6_12_cents": 400000,
      "total_reserve_cents": 700000,
      "source": "pass_through_pca_report"
    }
  ]
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["pca_items"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model produces deterministic schedules and routing only. The governing determination for pca reserve modeling is a licensed-professional conclusion; a conforming implementation MUST route that determination (with the model's workpapers) and MUST NOT emit it.

## 9. Conformance bindings

Requirement `REQ-M198` is verified by 2 published case(s): `CONF.MODEL.RE.PCA.001`, `CONF.MODEL.RE.PCA.002`.

## 10. Version

Reference binding `MODEL.RE.PCA.RESERVES.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M199 — FIRPTA withholding v1.1

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G15, G30
**Deal contexts:** real estate M&A · foreign seller

## 1. Purpose

FIRPTA 15 percent default, residence exemption/reduced rate, 20-day filing, reduced-withholding certificate, and 1031 timing interaction.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M199.schema.json`](M199.schema.json).

| Field | Type | Required |
|---|---|---|
| `amount_realized_cents` | integer (cents) | MUST |
| `seller_foreign_person` | boolean | MUST |
| `buyer_will_use_as_residence` | boolean | MAY |
| `closing_date` | string (ISO date) | MAY |
| `form_8288_b_reduced_withholding_requested` | boolean | MAY |
| `section_1031_exchange` | boolean | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `amount_realized_cents` | integer (cents) |
| `buyer_will_use_as_residence` | boolean |
| `form_8288_b_reduced_withholding_requested` | boolean |
| `forms_8288_due_date` | string (ISO date) |
| `path` | string |
| `reduced_certificate_processing_days_estimate` | integer |
| `section_1031_timing_gap_flag` | boolean |
| `seller_foreign_person` | boolean |
| `withholding_amount_cents` | integer (cents) |
| `withholding_rate` | number |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

FIRPTA 15 percent default, residence exemption/reduced rate, 20-day filing, reduced-withholding certificate, and 1031 timing interaction.

Computes FIRPTA withholding ladder, 8288 due date, 8288-B reduced certificate timing, and 1031 timing-gap flag.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| IRC 897 | AUTH-0162 | statute |
| IRC 1445 | AUTH-0130 | statute |
| Forms 8288 | AUTH-0085 | form |
| Forms 8288-A | AUTH-0087 | form |
| Form 8288-B | AUTH-0084 | form |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.RE.FIRPTA11.001` — *FIRPTA v1.1 computes default withholding, form deadline, and 1031 gap flag*.

**Inputs**

```json
{
  "amount_realized_cents": 100000000,
  "seller_foreign_person": true,
  "buyer_will_use_as_residence": false,
  "closing_date": "2026-05-21",
  "form_8288_b_reduced_withholding_requested": true,
  "section_1031_exchange": true
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "amount_realized_cents": 100000000,
  "seller_foreign_person": true,
  "buyer_will_use_as_residence": false,
  "withholding_rate": 0.15,
  "withholding_amount_cents": 15000000,
  "path": "default_firpta_withholding",
  "forms_8288_due_date": "2026-06-10",
  "form_8288_b_reduced_withholding_requested": true,
  "reduced_certificate_processing_days_estimate": 90,
  "section_1031_timing_gap_flag": true
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["amount_realized_cents","seller_foreign_person"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## 9. Conformance bindings

Requirement `REQ-M199` is verified by 2 published case(s): `CONF.MODEL.RE.FIRPTA11.001`, `CONF.MODEL.RE.FIRPTA11.002`.

## 10. Version

Reference binding `MODEL.RE.FIRPTA.WITHHOLDING.V11.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M200 — Transaction tax master engine

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G2, G19
**Deal contexts:** asset deal · stock deal · merger · rollover

## 1. Purpose

Integrated buyer basis, seller tax, seller after-tax proceeds, gross-up gap, and fired sub-model schedule.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M200.schema.json`](M200.schema.json).

| Field | Type | Required |
|---|---|---|
| `deal_form` | string | MUST |
| `purchase_price_cents` | integer (cents) | MUST |
| `seller_entity_type` | string | MUST |
| `consideration_mix` | object | MAY |
| `federal_tax_rate` | number | MAY |
| `seller_structure_tax_delta_cents` | integer (cents) | MAY |
| `seller_tax_basis_cents` | integer (cents) | MAY |
| `state_tax_rate` | number | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `buyer_asset_basis_cents` | integer (cents) |
| `combined_seller_tax_rate` | number |
| `deal_form` | string |
| `deferred_or_rollover_consideration_cents` | integer (cents) |
| `fired_sub_models` | string[] |
| `gross_up_gap_cents` | integer (cents) |
| `professional_review_flags` | string[] |
| `seller_after_tax_proceeds_cents` | integer (cents) |
| `seller_entity_type` | string |
| `seller_tax_basis_cents` | integer (cents) |
| `seller_tax_cents` | integer (cents) |
| `seller_taxable_gain_cents` | integer (cents) |
| `taxable_consideration_cents` | integer (cents) |
| `total_consideration_cents` | integer (cents) |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Integrated buyer basis, seller tax, seller after-tax proceeds, gross-up gap, and fired sub-model schedule.

Integrates entity type, deal form, consideration mix, basis, tax rates, buyer basis, seller tax, after-tax proceeds, gross-up gap, and fired tax sub-models.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| IRC 1001 | AUTH-0121 | statute |
| IRC 338 | AUTH-0139 | statute |
| IRC 336 | AUTH-0137 | statute |
| IRC 351 | AUTH-0141 | statute |
| IRC 368 | AUTH-0144 | statute |
| IRC 721 | AUTH-0154 | statute |
| IRC 1060 | AUTH-0124 | statute |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.TAX.MASTER.001` — *Transaction tax master computes proceeds, tax, gross-up gap, and fired models*.

**Inputs**

```json
{
  "seller_entity_type": "S-Corp",
  "deal_form": "asset_sale",
  "purchase_price_cents": 100000000,
  "seller_tax_basis_cents": 40000000,
  "federal_tax_rate": 0.2,
  "state_tax_rate": 0.05,
  "seller_structure_tax_delta_cents": 5000000,
  "consideration_mix": {
    "cash_cents": 90000000,
    "rollover_cents": 10000000
  }
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "seller_entity_type": "S-Corp",
  "deal_form": "asset_sale",
  "total_consideration_cents": 100000000,
  "taxable_consideration_cents": 90000000,
  "deferred_or_rollover_consideration_cents": 10000000,
  "buyer_asset_basis_cents": 100000000,
  "seller_tax_basis_cents": 40000000,
  "seller_taxable_gain_cents": 50000000,
  "combined_seller_tax_rate": 0.25,
  "seller_tax_cents": 12500000,
  "seller_after_tax_proceeds_cents": 87500000,
  "gross_up_gap_cents": 6666667,
  "fired_sub_models": [
    "M139",
    "M145",
    "M201"
  ],
  "professional_review_flags": [
    "Tax counsel confirms entity classification, elections, state treatment, and facts."
  ]
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["seller_entity_type","deal_form","purchase_price_cents"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## 9. Conformance bindings

Requirement `REQ-M200` is verified by 2 published case(s): `CONF.MODEL.TAX.MASTER.001`, `CONF.MODEL.TAX.MASTER.002`.

## 10. Version

Reference binding `MODEL.TAX.TRANSACTION.MASTER.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M201 — 338(h)(10) and 336(e) gross-up math

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G2
**Deal contexts:** S-corp sale · deemed asset sale

## 1. Purpose

Seller asset-treatment tax delta, buyer step-up benefit, and breakeven gross-up.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M201.schema.json`](M201.schema.json).

| Field | Type | Required |
|---|---|---|
| `seller_marginal_tax_rate` | number | MUST |
| `seller_tax_delta_cents` | integer (cents) | MUST |
| `buyer_step_up_pv_benefit_cents` | integer (cents) | MAY |
| `disposition_months` | integer | MAY |
| `disposition_pct` | number | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `breakeven_gross_up_cents` | integer (cents) |
| `buyer_net_benefit_after_gross_up_cents` | integer (cents) |
| `buyer_step_up_pv_benefit_cents` | integer (cents) |
| `election_review_flags` | string[] |
| `section_336e_80pct_12mo_test_passed` | boolean |
| `seller_marginal_tax_rate` | number |
| `seller_tax_delta_cents` | integer (cents) |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Seller asset-treatment tax delta, buyer step-up benefit, and breakeven gross-up.

Computes seller tax delta, breakeven gross-up, buyer step-up PV benefit, and 336(e) 80%-within-12-month window flag.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| IRC 338(h)(10) | AUTH-0140 | statute |
| IRC 336(e) | AUTH-0138 | statute |
| Treas. Reg. 1.336-2 | AUTH-0285 | regulation |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.TAX.GROSSUP.001` — *338 and 336 gross-up computes breakeven and buyer net benefit*.

**Inputs**

```json
{
  "seller_tax_delta_cents": 8000000,
  "seller_marginal_tax_rate": 0.25,
  "buyer_step_up_pv_benefit_cents": 15000000,
  "disposition_pct": 0.85,
  "disposition_months": 10
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "seller_tax_delta_cents": 8000000,
  "seller_marginal_tax_rate": 0.25,
  "breakeven_gross_up_cents": 10666667,
  "buyer_step_up_pv_benefit_cents": 15000000,
  "buyer_net_benefit_after_gross_up_cents": 4333333,
  "section_336e_80pct_12mo_test_passed": true,
  "election_review_flags": [
    "Confirm target/shareholder eligibility and election mechanics with tax counsel."
  ]
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["seller_tax_delta_cents","seller_marginal_tax_rate"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## 9. Conformance bindings

Requirement `REQ-M201` is verified by 2 published case(s): `CONF.MODEL.TAX.GROSSUP.001`, `CONF.MODEL.TAX.GROSSUP.002`.

## 10. Version

Reference binding `MODEL.TAX.GROSSUP.338_336.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M202 — 1374 built-in gains tax

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G2
**Deal contexts:** S-corp former C-corp

## 1. Purpose

Net unrealized built-in gain, five-year recognition-period cap, corporate tax, taxable-income limitation, and installment-sale treatment.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M202.schema.json`](M202.schema.json).

| Field | Type | Required |
|---|---|---|
| `basis_at_conversion_cents` | integer (cents) | MUST |
| `conversion_date` | string (ISO date) | MUST |
| `fmv_at_conversion_cents` | integer (cents) | MUST |
| `recognized_gain_cents` | integer (cents) | MUST |
| `sale_date` | string (ISO date) | MUST |
| `corporate_tax_rate` | number | MAY |
| `taxable_income_cents` | integer (cents) | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `corporate_tax_rate` | number |
| `net_unrealized_built_in_gain_cents` | integer (cents) |
| `recognition_period_years` | integer |
| `recognized_big_tax_base_cents` | integer (cents) |
| `section_1374_tax_cents` | integer (cents) |
| `state_nonconformity_review_required` | boolean |
| `within_recognition_period` | boolean |
| `years_since_conversion` | integer |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Net unrealized built-in gain, five-year recognition-period cap, corporate tax, taxable-income limitation, and installment-sale treatment.

Computes NUBIG, five-year recognition-period status, recognized BIG tax base, and federal corporate-level tax.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| IRC 1374 | AUTH-0129 | statute |
| PATH Act 2015 | AUTH-0225 | statute |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.TAX.BIG1374.001` — *1374 BIG tax computes recognition-period tax base and tax*.

**Inputs**

```json
{
  "fmv_at_conversion_cents": 100000000,
  "basis_at_conversion_cents": 60000000,
  "conversion_date": "2023-01-01",
  "sale_date": "2026-01-01",
  "recognized_gain_cents": 50000000,
  "taxable_income_cents": 30000000,
  "corporate_tax_rate": 0.21
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "net_unrealized_built_in_gain_cents": 40000000,
  "years_since_conversion": 3,
  "recognition_period_years": 5,
  "within_recognition_period": true,
  "recognized_big_tax_base_cents": 30000000,
  "corporate_tax_rate": 0.21,
  "section_1374_tax_cents": 6300000,
  "state_nonconformity_review_required": false
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["fmv_at_conversion_cents","basis_at_conversion_cents","conversion_date","sale_date","recognized_gain_cents"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## 9. Conformance bindings

Requirement `REQ-M202` is verified by 2 published case(s): `CONF.MODEL.TAX.BIG1374.001`, `CONF.MODEL.TAX.BIG1374.002`.

## 10. Version

Reference binding `MODEL.TAX.BIG.1374.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M203 — Transaction cost capitalization

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G2
**Deal contexts:** transaction tax

## 1. Purpose

Bright-line date, inherently facilitative costs, success-based fee 70/30 safe harbor, and PE-owned target risk flag.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M203.schema.json`](M203.schema.json).

| Field | Type | Required |
|---|---|---|
| `bright_line_date` | string (ISO date) | MUST |
| `transaction_costs` | object[] | MUST |
| `pe_owned_target` | boolean | MAY |
| `rev_proc_2011_29_safe_harbor_elected` | boolean | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `amortizable_195_cents` | integer (cents) |
| `capitalized_cents` | integer (cents) |
| `cost_count` | integer |
| `deductible_cents` | integer (cents) |
| `pe_owned_target_success_fee_risk_flag` | boolean |
| `rows` | object[] |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Bright-line date, inherently facilitative costs, success-based fee 70/30 safe harbor, and PE-owned target risk flag.

Classifies transaction costs under bright-line, inherently facilitative, success-based fee safe harbor, capitalization, deduction, and Section 195 amortization buckets.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| IRC 195 | AUTH-0133 | statute |
| IRC 263 | AUTH-0135 | statute |
| Treas. Reg. 1.263(a)-5 | AUTH-0284 | regulation |
| Rev. Proc. 2011-29 | AUTH-0239 | case |
| INDOPCO | AUTH-0116 | practice-or-guidance |
| Letter Ruling 202308010 | AUTH-0179 | practice-or-guidance |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.TAX.COSTS.001` — *Transaction cost capitalization classifies safe-harbor, facilitative, and investigatory costs*.

**Inputs**

```json
{
  "bright_line_date": "2026-03-01",
  "rev_proc_2011_29_safe_harbor_elected": true,
  "pe_owned_target": true,
  "transaction_costs": [
    {
      "label": "Banker success fee",
      "amount_cents": 10000000,
      "success_based": true,
      "incurred_date": "2026-04-01"
    },
    {
      "label": "Legal drafting",
      "amount_cents": 2000000,
      "inherently_facilitative": true,
      "incurred_date": "2026-02-15"
    },
    {
      "label": "Market study",
      "amount_cents": 1000000,
      "incurred_date": "2026-01-15"
    }
  ]
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "cost_count": 3,
  "deductible_cents": 7000000,
  "capitalized_cents": 5000000,
  "amortizable_195_cents": 1000000,
  "pe_owned_target_success_fee_risk_flag": true,
  "rows": [
    {
      "label": "Banker success fee",
      "amount_cents": 10000000,
      "incurred_date": "2026-04-01",
      "classification": "success_based_fee_70_30_safe_harbor",
      "deductible_cents": 7000000,
      "capitalized_cents": 3000000,
      "amortizable_195_cents": 0
    },
    {
      "label": "Legal drafting",
      "amount_cents": 2000000,
      "incurred_date": "2026-02-15",
      "classification": "inherently_facilitative_capitalized",
      "deductible_cents": 0,
      "capitalized_cents": 2000000,
      "amortizable_195_cents": 0
    },
    {
      "label": "Market study",
      "amount_cents": 1000000,
      "incurred_date": "2026-01-15",
      "classification": "pre_bright_line_investigatory_195",
      "deductible_cents": 0,
      "capitalized_cents": 0,
      "amortizable_195_cents": 1000000
    }
  ]
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["transaction_costs","bright_line_date"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model produces deterministic schedules and routing only. The governing determination for transaction cost capitalization is a licensed-professional conclusion; a conforming implementation MUST route that determination (with the model's workpapers) and MUST NOT emit it.

## 9. Conformance bindings

Requirement `REQ-M203` is verified by 2 published case(s): `CONF.MODEL.TAX.COSTS.001`, `CONF.MODEL.TAX.COSTS.002`.

## 10. Version

Reference binding `MODEL.TAX.TRANSACTION_COSTS.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M204 — Imputed interest, OID, and 453A

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G2
**Deal contexts:** seller note · installment sale · earnout

## 1. Purpose

AFR-based imputed interest, OID, contingent-payment characterization, and installment receivable interest charge.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M204.schema.json`](M204.schema.json).

| Field | Type | Required |
|---|---|---|
| `afr_rate` | number | MUST |
| `principal_cents` | integer (cents) | MUST |
| `stated_interest_rate` | number | MUST |
| `term_months` | integer | MUST |
| `installment_receivable_cents` | integer (cents) | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `afr_rate` | number |
| `characterization` | string |
| `imputed_interest_cents` | integer (cents) |
| `imputed_rate_delta` | number |
| `installment_453a_threshold_cents` | integer (cents) |
| `installment_receivable_cents` | integer (cents) |
| `oid_floor_cents` | integer (cents) |
| `principal_cents` | integer (cents) |
| `section_453a_applies` | boolean |
| `section_453a_excess_receivable_cents` | integer (cents) |
| `stated_interest_rate` | number |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

AFR-based imputed interest, OID, contingent-payment characterization, and installment receivable interest charge.

Computes AFR shortfall, imputed interest/OID floor, and Section 453A installment receivable threshold exposure.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| IRC 483 | AUTH-0150 | statute |
| IRC 1274 | AUTH-0127 | statute |
| IRC 1274A | AUTH-0128 | statute |
| IRC 453A | AUTH-0149 | statute |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.TAX.INTEREST.001` — *Imputed interest and OID computes AFR shortfall and 453A threshold exposure*.

**Inputs**

```json
{
  "principal_cents": 10000000,
  "stated_interest_rate": 0.02,
  "afr_rate": 0.05,
  "term_months": 24,
  "installment_receivable_cents": 600000000
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "principal_cents": 10000000,
  "stated_interest_rate": 0.02,
  "afr_rate": 0.05,
  "imputed_rate_delta": 0.03,
  "imputed_interest_cents": 600000,
  "oid_floor_cents": 600000,
  "characterization": "section_483_or_1274_review",
  "installment_453a_threshold_cents": 500000000,
  "installment_receivable_cents": 600000000,
  "section_453a_applies": true,
  "section_453a_excess_receivable_cents": 100000000
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["principal_cents","stated_interest_rate","afr_rate","term_months"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## 9. Conformance bindings

Requirement `REQ-M204` is verified by 2 published case(s): `CONF.MODEL.TAX.INTEREST.001`, `CONF.MODEL.TAX.INTEREST.002`.

## 10. Version

Reference binding `MODEL.TAX.IMPUTED_INTEREST_OID.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M205 — SALT transaction engine

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G2, G19
**Deal contexts:** transaction tax · state tax

## 1. Purpose

State apportionment, bulk-sale compliance, successor-liability clearances, sales/use tax, and payroll-tax successor elections.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M205.schema.json`](M205.schema.json).

| Field | Type | Required |
|---|---|---|
| `gain_cents` | integer (cents) | MUST |
| `state_apportionment_pct` | number | MUST |
| `bulk_sale_clearance_required` | boolean | MAY |
| `sales_use_tax_base_cents` | integer (cents) | MAY |
| `sales_use_tax_rate` | number | MAY |
| `state_tax_rate` | number | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `apportioned_gain_cents` | integer (cents) |
| `bulk_sale_clearance_required` | boolean |
| `contested_nexus_position` | boolean |
| `gain_cents` | integer (cents) |
| `sales_use_tax_base_cents` | integer (cents) |
| `sales_use_tax_cents` | integer (cents) |
| `salt_specialist_handoff_required` | boolean |
| `state_apportionment_pct` | number |
| `state_income_tax_cents` | integer (cents) |
| `state_tax_rate` | number |
| `total_state_transaction_tax_cents` | integer (cents) |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

State apportionment, bulk-sale compliance, successor-liability clearances, sales/use tax, and payroll-tax successor elections.

Computes apportioned gain, state income tax, sales/use tax, bulk-sale clearance flag, and SALT specialist handoff.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| UDITPA | AUTH-0299 | practice-or-guidance |
| state nexus statutes | AUTH-0268 | statute |
| bulk-sale acts | AUTH-0051 | practice-or-guidance |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.TAX.SALT.001` — *SALT transaction model computes state income and sales tax*.

**Inputs**

```json
{
  "gain_cents": 1000000,
  "state_apportionment_pct": 0.4,
  "state_tax_rate": 0.06,
  "sales_use_tax_base_cents": 200000,
  "sales_use_tax_rate": 0.08,
  "bulk_sale_clearance_required": true
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "gain_cents": 1000000,
  "state_apportionment_pct": 0.4,
  "apportioned_gain_cents": 400000,
  "state_tax_rate": 0.06,
  "state_income_tax_cents": 24000,
  "sales_use_tax_base_cents": 200000,
  "sales_use_tax_cents": 16000,
  "total_state_transaction_tax_cents": 40000,
  "bulk_sale_clearance_required": true,
  "contested_nexus_position": false,
  "salt_specialist_handoff_required": true
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["gain_cents","state_apportionment_pct"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model produces deterministic schedules and routing only. The governing determination for salt transaction engine is a licensed-professional conclusion; a conforming implementation MUST route that determination (with the model's workpapers) and MUST NOT emit it.

## 9. Conformance bindings

Requirement `REQ-M205` is verified by 2 published case(s): `CONF.MODEL.TAX.SALT.001`, `CONF.MODEL.TAX.SALT.002`.

## 10. Version

Reference binding `MODEL.TAX.SALT_TRANSACTION.v1` · entered the specification at internal lineage stage `v1_1` · spec v1.0.0.


# M206 — Indemnification ladder engine

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G1, G8
**Deal contexts:** purchase agreement economics

## 1. Purpose

Cap, basket, materiality scrape, sandbagging, carve-out, and deal-size-band math.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M206.schema.json`](M206.schema.json).

| Field | Type | Required |
|---|---|---|
| `transaction_value_cents` | integer (cents) | MUST |
| `basket_pct` | number | MAY |
| `general_cap_pct` | number | MAY |
| `rwi_present` | boolean | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `basket_cents` | integer (cents) |
| `basket_pct` | number |
| `basket_type` | string |
| `fraud_tax_carveout` | string |
| `fundamental_reps_cap_cents` | integer (cents) |
| `general_cap_cents` | integer (cents) |
| `general_cap_pct` | number |
| `materiality_scrape_default` | boolean |
| `rwi_present` | boolean |
| `sandbagging_default` | string |
| `transaction_value_cents` | integer (cents) |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Cap, basket, materiality scrape, sandbagging, carve-out, and deal-size-band math.

Computes indemnity cap, basket, fundamental cap, scrape default, and carve-out framing from deal value and RWI facts.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| ABA Private Target Deal Points Study | AUTH-0029 | study/dataset |
| ABA Model SPA | AUTH-0026 | practice-or-guidance |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.LEGAL.INDEMNITY.001` — *Indemnity ladder computes cap and basket economics*.

**Inputs**

```json
{
  "transaction_value_cents": 500000000,
  "general_cap_pct": 0.105,
  "basket_pct": 0.005,
  "rwi_present": false
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "transaction_value_cents": 500000000,
  "rwi_present": false,
  "general_cap_pct": 0.105,
  "general_cap_cents": 52500000,
  "basket_pct": 0.005,
  "basket_cents": 2500000,
  "basket_type": "deductible_or_tipping_to_confirm",
  "fundamental_reps_cap_cents": 500000000,
  "fraud_tax_carveout": "uncapped_or_counsel_defined",
  "materiality_scrape_default": true,
  "sandbagging_default": "silent_or_state_default"
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["transaction_value_cents"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## 9. Conformance bindings

Requirement `REQ-M206` is verified by 2 published case(s): `CONF.MODEL.LEGAL.INDEMNITY.001`, `CONF.MODEL.LEGAL.INDEMNITY.002`.

## 10. Version

Reference binding `MODEL.LEGAL.INDEMNITY.LADDER.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M207 — Survival period engine

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G1, G8
**Deal contexts:** purchase agreement economics

## 1. Purpose

General, fundamental, tax, fraud, and exclusive-remedy survival schedule.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M207.schema.json`](M207.schema.json).

| Field | Type | Required |
|---|---|---|
| `closing_date` | string (ISO date) | MUST |
| `general_reps_months` | integer | MAY |
| `rwi_present` | boolean | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `closing_date` | string (ISO date) |
| `counsel_review_flags` | string[] |
| `fraud_carveout_from_exclusive_remedy` | boolean |
| `fundamental_reps_expiry` | string |
| `fundamental_reps_years` | integer |
| `general_reps_expiry` | string |
| `general_reps_months` | integer |
| `rwi_present` | boolean |
| `tax_reps_expiry` | string |
| `tax_reps_years` | integer |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

General, fundamental, tax, fraud, and exclusive-remedy survival schedule.

Computes general, fundamental, tax, and fraud survival period dates from closing date and RWI facts.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| SRS Acquiom 2024 | AUTH-0256 | practice-or-guidance |
| SRS Acquiom 2025 | AUTH-0257 | practice-or-guidance |
| ABA Private Target Deal Points Study | AUTH-0029 | study/dataset |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.LEGAL.SURVIVAL.001` — *Survival period engine computes rep expiry dates*.

**Inputs**

```json
{
  "closing_date": "2026-05-21",
  "rwi_present": false,
  "general_reps_months": 12
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "closing_date": "2026-05-21",
  "rwi_present": false,
  "general_reps_months": 12,
  "general_reps_expiry": "2027-05-21",
  "fundamental_reps_years": 6,
  "fundamental_reps_expiry": "2032-05-21",
  "tax_reps_years": 6,
  "tax_reps_expiry": "2032-05-21",
  "fraud_carveout_from_exclusive_remedy": true,
  "counsel_review_flags": [
    "Confirm governing-law statute of limitations, fraud definition, and RWI policy interaction."
  ]
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["closing_date"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## 9. Conformance bindings

Requirement `REQ-M207` is verified by 2 published case(s): `CONF.MODEL.LEGAL.SURVIVAL.001`, `CONF.MODEL.LEGAL.SURVIVAL.002`.

## 10. Version

Reference binding `MODEL.LEGAL.SURVIVAL.PERIODS.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M208 — Escrow and holdback sizing

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G8
**Deal contexts:** purchase agreement economics

## 1. Purpose

General indemnity, RWI, PPA, special-purpose, and aggregate escrow sizing.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M208.schema.json`](M208.schema.json).

| Field | Type | Required |
|---|---|---|
| `transaction_value_cents` | integer (cents) | MUST |
| `rwi_present` | boolean | MAY |
| `special_escrows_cents` | number[] | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `aggregate_escrow_cents` | integer (cents) |
| `general_escrow_cents` | integer (cents) |
| `general_escrow_pct` | number |
| `ppa_escrow_cents` | integer (cents) |
| `ppa_escrow_pct` | number |
| `rwi_present` | boolean |
| `special_escrow_cents` | integer (cents) |
| `transaction_value_cents` | integer (cents) |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

General indemnity, RWI, PPA, special-purpose, and aggregate escrow sizing.

Computes general indemnity escrow, PPA escrow, special escrows, and aggregate holdback sizing.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| SRS Acquiom Deal Terms Study 2024 | AUTH-0258 | study/dataset |
| SRS Acquiom Deal Terms Study 2025 | AUTH-0259 | study/dataset |
| ABA Private Target Deal Points Study | AUTH-0029 | study/dataset |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.LEGAL.ESCROW.001` — *Escrow sizing computes RWI, PPA, and special escrows*.

**Inputs**

```json
{
  "transaction_value_cents": 500000000,
  "rwi_present": true,
  "special_escrows_cents": [
    5000000,
    3000000
  ]
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "transaction_value_cents": 500000000,
  "rwi_present": true,
  "general_escrow_pct": 0.005,
  "general_escrow_cents": 2500000,
  "ppa_escrow_pct": 0.01,
  "ppa_escrow_cents": 5000000,
  "special_escrow_cents": 8000000,
  "aggregate_escrow_cents": 15500000
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["transaction_value_cents"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## 9. Conformance bindings

Requirement `REQ-M208` is verified by 2 published case(s): `CONF.MODEL.LEGAL.ESCROW.001`, `CONF.MODEL.LEGAL.ESCROW.002`.

## 10. Version

Reference binding `MODEL.LEGAL.ESCROW.HOLDBACK.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M209 — RWI stack architecture

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G8
**Deal contexts:** insured M&A

## 1. Purpose

Retention, tower size, excess layers, exclusions, and seller-indemnity interaction.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M209.schema.json`](M209.schema.json).

| Field | Type | Required |
|---|---|---|
| `enterprise_value_cents` | integer (cents) | MUST |
| `excess_layers` | object[] | MAY |
| `exclusions` | string[] | MAY |
| `policy_tower_pct` | number | MAY |
| `retention_pct` | number | MAY |
| `seller_indemnity_cap_pct` | number | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `broker_handoff_required` | boolean |
| `enterprise_value_cents` | integer (cents) |
| `excess_layer_count` | integer |
| `excess_policy_limit_cents` | integer (cents) |
| `exclusion_count` | integer |
| `primary_policy_limit_cents` | integer (cents) |
| `retention_cents` | integer (cents) |
| `retention_pct` | number |
| `seller_indemnity_cap_cents` | integer (cents) |
| `seller_indemnity_cap_pct` | number |
| `total_policy_limit_cents` | integer (cents) |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Retention, tower size, excess layers, exclusions, and seller-indemnity interaction.

Computes retention, primary and excess tower limit, seller indemnity cap, exclusion count, and broker handoff flag.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| ABA Private Target Deal Points Study | AUTH-0029 | study/dataset |
| Marsh RWI reports | AUTH-0188 | practice-or-guidance |
| Aon RWI reports | AUTH-0039 | practice-or-guidance |
| Lockton RWI reports | AUTH-0181 | practice-or-guidance |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.LEGAL.RWI_STACK.001` — *RWI stack model computes retention, tower, and seller indemnity cap*.

**Inputs**

```json
{
  "enterprise_value_cents": 1000000,
  "retention_pct": 0.005,
  "policy_tower_pct": 0.1,
  "seller_indemnity_cap_pct": 0.01,
  "exclusions": [
    "known tax",
    "forward-looking"
  ],
  "excess_layers": [
    {
      "limit_cents": 50000
    }
  ]
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "enterprise_value_cents": 1000000,
  "retention_pct": 0.005,
  "retention_cents": 5000,
  "primary_policy_limit_cents": 100000,
  "excess_layer_count": 1,
  "excess_policy_limit_cents": 50000,
  "total_policy_limit_cents": 150000,
  "seller_indemnity_cap_pct": 0.01,
  "seller_indemnity_cap_cents": 10000,
  "exclusion_count": 2,
  "broker_handoff_required": true
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["enterprise_value_cents"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model produces deterministic schedules and routing only. The governing determination for rwi stack architecture is a licensed-professional conclusion; a conforming implementation MUST route that determination (with the model's workpapers) and MUST NOT emit it.

## 9. Conformance bindings

Requirement `REQ-M209` is verified by 2 published case(s): `CONF.MODEL.LEGAL.RWI_STACK.001`, `CONF.MODEL.LEGAL.RWI_STACK.002`.

## 10. Version

Reference binding `MODEL.LEGAL.RWI_STACK.v1` · entered the specification at internal lineage stage `v1_1` · spec v1.0.0.


# M210 — Closing-statement true-up sequence

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G7
**Deal contexts:** working capital true-up

## 1. Purpose

Estimated statement, buyer approval, actual statement, dispute notice, negotiation, and accounting-arbitrator timeline.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M210.schema.json`](M210.schema.json).

| Field | Type | Required |
|---|---|---|
| `actual_nwc_cents` | integer (cents) | MUST |
| `closing_date` | string (ISO date) | MUST |
| `peg_cents` | integer (cents) | MUST |
| `estimated_nwc_cents` | integer (cents) | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `actual_nwc_cents` | integer (cents) |
| `actual_statement_due_date` | string (ISO date) |
| `buyer_receivable_cents` | integer (cents) |
| `closing_date` | string (ISO date) |
| `dispute_notice_due_date` | string (ISO date) |
| `estimated_adjustment_cents` | integer (cents) |
| `estimated_nwc_cents` | integer (cents) |
| `final_purchase_price_adjustment_cents` | integer (cents) |
| `good_faith_negotiation_end_date` | string (ISO date) |
| `peg_cents` | integer (cents) |
| `seller_receivable_cents` | integer (cents) |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Estimated statement, buyer approval, actual statement, dispute notice, negotiation, and accounting-arbitrator timeline.

Computes working-capital true-up economics and the actual statement, dispute notice, and negotiation timeline.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| SRS Acquiom Working Capital PPA Study | AUTH-0262 | study/dataset |
| ABA Private Target Deal Points Study | AUTH-0029 | study/dataset |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.LEGAL.TRUEUP.001` — *Closing statement true-up computes adjustment and dispute timeline*.

**Inputs**

```json
{
  "closing_date": "2026-05-21",
  "peg_cents": 1000000,
  "estimated_nwc_cents": 900000,
  "actual_nwc_cents": 800000
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "closing_date": "2026-05-21",
  "peg_cents": 1000000,
  "estimated_nwc_cents": 900000,
  "actual_nwc_cents": 800000,
  "estimated_adjustment_cents": -100000,
  "final_purchase_price_adjustment_cents": -200000,
  "buyer_receivable_cents": 200000,
  "seller_receivable_cents": 0,
  "actual_statement_due_date": "2026-08-19",
  "dispute_notice_due_date": "2026-09-18",
  "good_faith_negotiation_end_date": "2026-10-18"
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["closing_date","peg_cents","actual_nwc_cents"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## 9. Conformance bindings

Requirement `REQ-M210` is verified by 2 published case(s): `CONF.MODEL.LEGAL.TRUEUP.001`, `CONF.MODEL.LEGAL.TRUEUP.002`.

## 10. Version

Reference binding `MODEL.LEGAL.CLOSING_TRUEUP.SEQUENCE.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M211 — Conditions-to-close logic engine

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G6, G7
**Deal contexts:** purchase agreement conditions

## 1. Purpose

Bring-down, MAE, financing, marketing-period, regulatory approval, third-party consent, and condition node logic.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M211.schema.json`](M211.schema.json).

| Field | Type | Required |
|---|---|---|
| `conditions` | object[] | MUST |

## 3. Output contract

| Field | Type |
|---|---|
| `closing_ready` | boolean |
| `condition_count` | integer |
| `condition_nodes` | object[] |
| `open_condition_count` | integer |
| `open_conditions` | string[] |
| `professional_review_required` | boolean |
| `satisfied_count` | integer |
| `waived_count` | integer |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Bring-down, MAE, financing, marketing-period, regulatory approval, third-party consent, and condition node logic.

Computes condition-node satisfaction, waiver, open blockers, closing readiness, and professional-review flags.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| ABA Model SPA | AUTH-0026 | practice-or-guidance |
| HSR Act | AUTH-0105 | statute |
| CFIUS regulations | AUTH-0058 | practice-or-guidance |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.LEGAL.CONDITIONS.001` — *Conditions logic identifies open closing blockers and professional-review flags*.

**Inputs**

```json
{
  "conditions": [
    {
      "name": "Bring-down reps",
      "type": "general",
      "satisfied": true
    },
    {
      "name": "HSR approval",
      "type": "regulatory",
      "satisfied": false
    },
    {
      "name": "Key customer consent",
      "type": "consent",
      "waived": true
    }
  ]
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "condition_count": 3,
  "satisfied_count": 1,
  "waived_count": 1,
  "open_condition_count": 1,
  "closing_ready": false,
  "professional_review_required": true,
  "open_conditions": [
    "HSR approval"
  ],
  "condition_nodes": [
    {
      "name": "Bring-down reps",
      "type": "general",
      "satisfied": true,
      "waived": false,
      "blocks_closing": false,
      "professional_review_required": false
    },
    {
      "name": "HSR approval",
      "type": "regulatory",
      "satisfied": false,
      "waived": false,
      "blocks_closing": true,
      "professional_review_required": true
    },
    {
      "name": "Key customer consent",
      "type": "consent",
      "satisfied": false,
      "waived": true,
      "blocks_closing": false,
      "professional_review_required": true
    }
  ]
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["conditions"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model produces deterministic schedules and routing only. The governing determination for conditions-to-close logic engine is a licensed-professional conclusion; a conforming implementation MUST route that determination (with the model's workpapers) and MUST NOT emit it.

## 9. Conformance bindings

Requirement `REQ-M211` is verified by 2 published case(s): `CONF.MODEL.LEGAL.CONDITIONS.001`, `CONF.MODEL.LEGAL.CONDITIONS.002`.

## 10. Version

Reference binding `MODEL.LEGAL.CONDITIONS.LOGIC.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M212 — Termination and break/reverse-break fee engine

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G7
**Deal contexts:** public M&A · private M&A termination

## 1. Purpose

Break-up, reverse break-up, antitrust reverse break-up, fiduciary-out, go-shop, ticking-fee, drag, and tag economics.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M212.schema.json`](M212.schema.json).

| Field | Type | Required |
|---|---|---|
| `transaction_value_cents` | integer (cents) | MUST |

## 3. Output contract

| Field | Type |
|---|---|
| `antitrust_reverse_fee_cents` | integer (cents) |
| `antitrust_reverse_fee_pct` | number |
| `counsel_review_flags` | string[] |
| `go_shop_break_fee_cents` | integer (cents) |
| `reverse_termination_fee_cents` | integer (cents) |
| `reverse_termination_fee_pct` | number |
| `target_break_fee_cents` | integer (cents) |
| `target_break_fee_pct` | number |
| `transaction_value_cents` | integer (cents) |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Break-up, reverse break-up, antitrust reverse break-up, fiduciary-out, go-shop, ticking-fee, drag, and tag economics.

Computes target break-up fee, go-shop discounted fee, reverse termination fee, and antitrust reverse fee from transaction value.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| Houlihan Lokey 2023 Transaction Termination Fee Study | AUTH-0103 | study/dataset |
| Fenwick 2023 ARBF analysis | AUTH-0081 | practice-or-guidance |
| Brazen v. Bell Atlantic | AUTH-0048 | case |
| In re Topps | AUTH-0112 | case |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.LEGAL.TERMINATION.001` — *Termination fee engine computes break, reverse, antitrust, and go-shop fees*.

**Inputs**

```json
{
  "transaction_value_cents": 100000000
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "transaction_value_cents": 100000000,
  "target_break_fee_pct": 0.027,
  "target_break_fee_cents": 2700000,
  "go_shop_break_fee_cents": 1350000,
  "reverse_termination_fee_pct": 0.042,
  "reverse_termination_fee_cents": 4200000,
  "antitrust_reverse_fee_pct": 0.05,
  "antitrust_reverse_fee_cents": 5000000,
  "counsel_review_flags": [
    "Confirm fiduciary-out, go-shop/no-shop, regulatory covenant, and enforceability framing with counsel."
  ]
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["transaction_value_cents"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## 9. Conformance bindings

Requirement `REQ-M212` is verified by 2 published case(s): `CONF.MODEL.LEGAL.TERMINATION.001`, `CONF.MODEL.LEGAL.TERMINATION.002`.

## 10. Version

Reference binding `MODEL.LEGAL.TERMINATION.FEES.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M213 — Earnout architecture and dispute

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G9
**Deal contexts:** earnout

## 1. Purpose

EBITDA-definition lock, acceleration triggers, post-closing covenants, dispute forum, and tax-characterization selector.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M213.schema.json`](M213.schema.json).

| Field | Type | Required |
|---|---|---|
| `earnout_value_cents` | integer (cents) | MUST |
| `metrics` | string[] | MUST |
| `acceleration_triggers` | string[] | MAY |
| `dispute_forum` | string | MAY |
| `post_closing_covenants` | string[] | MAY |
| `tax_characterization` | string | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `acceleration_trigger_count` | integer |
| `accounting_arbitrator_selected` | boolean |
| `counsel_and_tax_handoff_required` | boolean |
| `dispute_forum` | string |
| `earnout_value_cents` | integer (cents) |
| `metric_count` | integer |
| `multiple_metric_earnout` | boolean |
| `post_closing_covenant_count` | integer |
| `tax_characterization` | string |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

EBITDA-definition lock, acceleration triggers, post-closing covenants, dispute forum, and tax-characterization selector.

Computes earnout metrics, acceleration triggers, covenant count, dispute forum, and tax/counsel handoff.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| SRS Acquiom Earnout data | AUTH-0260 | practice-or-guidance |
| IRC 453 | AUTH-0148 | statute |
| IRC 483 | AUTH-0150 | statute |
| IRC 1274 | AUTH-0127 | statute |
| ABA earnout reports | AUTH-0024 | practice-or-guidance |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.LEGAL.EARNOUT_ARCH.001` — *Earnout architecture model computes metrics, triggers, dispute forum, and tax handoff*.

**Inputs**

```json
{
  "earnout_value_cents": 500000,
  "metrics": [
    "EBITDA",
    "revenue"
  ],
  "acceleration_triggers": [
    "sale",
    "termination"
  ],
  "post_closing_covenants": [
    "commercially reasonable efforts"
  ],
  "dispute_forum": "accounting_arbitrator",
  "tax_characterization": "section_453_installment"
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "earnout_value_cents": 500000,
  "metric_count": 2,
  "multiple_metric_earnout": true,
  "acceleration_trigger_count": 2,
  "post_closing_covenant_count": 1,
  "dispute_forum": "accounting_arbitrator",
  "accounting_arbitrator_selected": true,
  "tax_characterization": "section_453_installment",
  "counsel_and_tax_handoff_required": true
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["earnout_value_cents","metrics"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model produces deterministic schedules and routing only. The governing determination for earnout architecture and dispute is a licensed-professional conclusion; a conforming implementation MUST route that determination (with the model's workpapers) and MUST NOT emit it.

## 9. Conformance bindings

Requirement `REQ-M213` is verified by 2 published case(s): `CONF.MODEL.LEGAL.EARNOUT_ARCH.001`, `CONF.MODEL.LEGAL.EARNOUT_ARCH.002`.

## 10. Version

Reference binding `MODEL.LEGAL.EARNOUT_ARCHITECTURE.v1` · entered the specification at internal lineage stage `v1_1` · spec v1.0.0.


# M214 — IP chain-of-title verification

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G10
**Deal contexts:** IP diligence

## 1. Purpose

USPTO, trademark, copyright, employee, contractor, and intervening assignment sequence.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M214.schema.json`](M214.schema.json).

| Field | Type | Required |
|---|---|---|
| `assets` | object[] | MUST |

## 3. Output contract

| Field | Type |
|---|---|
| `assignment_gap_count` | integer |
| `chain_rows` | object[] |
| `contributor_assignment_gap_count` | integer |
| `copyright_asset_count` | integer |
| `counsel_review_required` | boolean |
| `ip_asset_count` | integer |
| `itu_assignment_risk_count` | integer |
| `late_recording_count` | integer |
| `patent_asset_count` | integer |
| `trademark_asset_count` | integer |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

USPTO, trademark, copyright, employee, contractor, and intervening assignment sequence.

Computes assignment-chain, recording, contributor-assignment, and ITU-assignment risk counts from supplied IP asset facts.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| 35 U.S.C. 261 | AUTH-0019 | statute |
| Lanham Act 10 | AUTH-0174 | statute |
| 17 U.S.C. 205 | AUTH-0016 | statute |
| Clorox v. Chemical Bank | AUTH-0060 | case |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.IP.CHAIN.001` — *IP chain-of-title computes assignment and recording gaps*.

**Inputs**

```json
{
  "assets": [
    {
      "type": "patent",
      "name": "HVAC sensor",
      "assignment_count": 2,
      "current_owner_matches": true,
      "recorded_within_three_months": true,
      "contributor_assignments_complete": true
    },
    {
      "type": "trademark",
      "name": "BRAND",
      "assignment_count": 1,
      "current_owner_matches": false,
      "recorded_within_three_months": false,
      "contributor_assignments_complete": false,
      "itu_assigned_after_allegation_of_use": false
    }
  ]
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "ip_asset_count": 2,
  "patent_asset_count": 1,
  "trademark_asset_count": 1,
  "copyright_asset_count": 0,
  "assignment_gap_count": 1,
  "late_recording_count": 1,
  "contributor_assignment_gap_count": 1,
  "itu_assignment_risk_count": 1,
  "counsel_review_required": true,
  "chain_rows": [
    {
      "name": "HVAC sensor",
      "type": "patent",
      "assignment_count": 2,
      "current_owner_matches": true,
      "recorded_within_three_months": true,
      "contributor_assignments_complete": true,
      "assignment_gap": false,
      "late_recording_flag": false,
      "contributor_gap": false,
      "itu_assignment_risk": false
    },
    {
      "name": "BRAND",
      "type": "trademark",
      "assignment_count": 1,
      "current_owner_matches": false,
      "recorded_within_three_months": false,
      "contributor_assignments_complete": false,
      "assignment_gap": true,
      "late_recording_flag": true,
      "contributor_gap": true,
      "itu_assignment_risk": true
    }
  ]
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["assets"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model produces deterministic schedules and routing only. The governing determination for ip chain-of-title verification is a licensed-professional conclusion; a conforming implementation MUST route that determination (with the model's workpapers) and MUST NOT emit it.

## 9. Conformance bindings

Requirement `REQ-M214` is verified by 2 published case(s): `CONF.MODEL.IP.CHAIN.001`, `CONF.MODEL.IP.CHAIN.002`.

## 10. Version

Reference binding `MODEL.IP.CHAIN_OF_TITLE.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M215 — IP encumbrance and lien search

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G10
**Deal contexts:** IP diligence · secured financing

## 1. Purpose

UCC, USPTO security agreement, and copyright office lien-search tracks.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M215.schema.json`](M215.schema.json).

| Field | Type | Required |
|---|---|---|
| `searches` | object[] | MUST |

## 3. Output contract

| Field | Type |
|---|---|
| `copyright_security_hit_count` | integer |
| `lien_search_rows` | object[] |
| `open_lien_count` | integer |
| `pass_through_search_source_required` | boolean |
| `release_required_count` | integer |
| `search_track_count` | integer |
| `ucc_lien_hit_count` | integer |
| `uspto_security_hit_count` | integer |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

UCC, USPTO security agreement, and copyright office lien-search tracks.

Computes UCC, USPTO, and Copyright Office hit counts and release requirements from pass-through lien-search outputs.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| UCC Article 9 | AUTH-0298 | statute |
| 17 U.S.C. 205 | AUTH-0016 | statute |
| In re Peregrine | AUTH-0111 | case |
| Rhone-Poulenc Agro v. DeKalb | AUTH-0240 | case |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.IP.LIENS.001` — *IP lien search computes open lien and release requirements*.

**Inputs**

```json
{
  "searches": [
    {
      "track": "ucc",
      "jurisdiction": "DE",
      "hit_count": 2,
      "release_obtained": false
    },
    {
      "track": "uspto patent security",
      "hit_count": 1,
      "release_obtained": true
    },
    {
      "track": "copyright",
      "hit_count": 1,
      "release_obtained": false
    }
  ]
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "search_track_count": 3,
  "ucc_lien_hit_count": 2,
  "uspto_security_hit_count": 1,
  "copyright_security_hit_count": 1,
  "open_lien_count": 3,
  "release_required_count": 2,
  "pass_through_search_source_required": true,
  "lien_search_rows": [
    {
      "search": "DE",
      "track": "ucc",
      "hit_count": 2,
      "release_obtained": false,
      "release_required": true,
      "pass_through_search_source": "pass_through_lien_search"
    },
    {
      "search": "Search 2",
      "track": "uspto",
      "hit_count": 1,
      "release_obtained": true,
      "release_required": false,
      "pass_through_search_source": "pass_through_lien_search"
    },
    {
      "search": "Search 3",
      "track": "copyright",
      "hit_count": 1,
      "release_obtained": false,
      "release_required": true,
      "pass_through_search_source": "pass_through_lien_search"
    }
  ]
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["searches"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model produces deterministic schedules and routing only. The governing determination for ip encumbrance and lien search is a licensed-professional conclusion; a conforming implementation MUST route that determination (with the model's workpapers) and MUST NOT emit it.

## 9. Conformance bindings

Requirement `REQ-M215` is verified by 2 published case(s): `CONF.MODEL.IP.LIENS.001`, `CONF.MODEL.IP.LIENS.002`.

## 10. Version

Reference binding `MODEL.IP.ENCUMBRANCE_LIEN_SEARCH.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M216 — License in/out dependency map

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G10
**Deal contexts:** IP diligence

## 1. Purpose

Material license parties, scope, exclusivity, royalty, term, termination, change-of-control, sublicensing, and consent dependencies.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M216.schema.json`](M216.schema.json).

| Field | Type | Required |
|---|---|---|
| `licenses` | object[] | MUST |

## 3. Output contract

| Field | Type |
|---|---|
| `annual_royalty_cents` | integer (cents) |
| `change_of_control_consent_required_count` | integer |
| `inbound_license_count` | integer |
| `license_count` | integer |
| `license_rows` | object[] |
| `material_dependency_count` | integer |
| `outbound_license_count` | integer |
| `terminates_on_change_of_control_count` | integer |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Material license parties, scope, exclusivity, royalty, term, termination, change-of-control, sublicensing, and consent dependencies.

Computes inbound/outbound license counts, annual royalty, change-of-control consent, termination, sublicensing, and dependency flags.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| IP licensing industry practice | AUTH-0119 | practice-or-guidance |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.IP.LICENSES.001` — *License dependency map computes inbound, outbound, consent, and dependency counts*.

**Inputs**

```json
{
  "licenses": [
    {
      "name": "Core SDK",
      "direction": "inbound",
      "annual_royalty_cents": 100000,
      "terminates_on_change_of_control": true,
      "sublicensing_allowed": false
    },
    {
      "name": "OEM grant",
      "direction": "outbound",
      "annual_royalty_cents": 50000,
      "change_of_control_consent_required": true
    }
  ]
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "license_count": 2,
  "inbound_license_count": 1,
  "outbound_license_count": 1,
  "annual_royalty_cents": 150000,
  "change_of_control_consent_required_count": 1,
  "terminates_on_change_of_control_count": 1,
  "material_dependency_count": 1,
  "license_rows": [
    {
      "name": "Core SDK",
      "direction": "inbound",
      "scope": "not_supplied",
      "exclusive": false,
      "annual_royalty_cents": 100000,
      "change_of_control_consent_required": false,
      "terminates_on_change_of_control": true,
      "sublicensing_allowed": false,
      "material_dependency_flag": true
    },
    {
      "name": "OEM grant",
      "direction": "outbound",
      "scope": "not_supplied",
      "exclusive": false,
      "annual_royalty_cents": 50000,
      "change_of_control_consent_required": true,
      "terminates_on_change_of_control": false,
      "sublicensing_allowed": false,
      "material_dependency_flag": false
    }
  ]
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["licenses"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## 9. Conformance bindings

Requirement `REQ-M216` is verified by 2 published case(s): `CONF.MODEL.IP.LICENSES.001`, `CONF.MODEL.IP.LICENSES.002`.

## 10. Version

Reference binding `MODEL.IP.LICENSE.DEPENDENCY.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M217 — Standard IP representation set

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G1, G10
**Deal contexts:** IP purchase agreement

## 1. Purpose

Industry-scaled IP rep checklist and schedule structure for counsel drafting.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M217.schema.json`](M217.schema.json).

| Field | Type | Required |
|---|---|---|
| `deal_type` | string | MUST |
| `material_ip_categories` | string[] | MUST |

## 3. Output contract

| Field | Type |
|---|---|
| `counsel_drafting_required` | boolean |
| `deal_type` | string |
| `enforceability_opinion_pass_through` | boolean |
| `includes_oss_rep` | boolean |
| `includes_sufficiency_rep` | boolean |
| `material_ip_category_count` | integer |
| `representation_count` | integer |
| `representation_set` | string[] |
| `schedule_count` | integer |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Industry-scaled IP rep checklist and schedule structure for counsel drafting.

Computes an industry-scaled IP representation and schedule set for counsel drafting without drafting clause language.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| ABA Model SPA IP representations | AUTH-0027 | practice-or-guidance |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.IP.REPS.001` — *IP representation set computes software and trademark rep scaffold*.

**Inputs**

```json
{
  "deal_type": "software acquisition",
  "material_ip_categories": [
    "software",
    "trademark"
  ]
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "deal_type": "software acquisition",
  "material_ip_category_count": 2,
  "representation_count": 8,
  "schedule_count": 3,
  "includes_oss_rep": true,
  "includes_sufficiency_rep": true,
  "enforceability_opinion_pass_through": true,
  "counsel_drafting_required": true,
  "representation_set": [
    "ownership",
    "no_encumbrances",
    "sufficiency",
    "registered_ip_schedule",
    "license_schedule",
    "trademark_domain_schedule",
    "oss_compliance",
    "source_code_control"
  ]
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["deal_type","material_ip_categories"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model produces deterministic schedules and routing only. The governing determination for standard ip representation set is a licensed-professional conclusion; a conforming implementation MUST route that determination (with the model's workpapers) and MUST NOT emit it.

## 9. Conformance bindings

Requirement `REQ-M217` is verified by 2 published case(s): `CONF.MODEL.IP.REPS.001`, `CONF.MODEL.IP.REPS.002`.

## 10. Version

Reference binding `MODEL.IP.REPRESENTATION_SET.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M218 — Carve-out and license-back mechanics

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G10
**Deal contexts:** carve-out · IP license-back

## 1. Purpose

Assigned IP, transition license, perpetual license-back, and TSA-IP overlay.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M218.schema.json`](M218.schema.json).

| Field | Type | Required |
|---|---|---|
| `ip_assets` | object[] | MUST |

## 3. Output contract

| Field | Type |
|---|---|
| `asset_count` | integer |
| `asset_rows` | object[] |
| `assigned_to_buyer_count` | integer |
| `counsel_drafting_handoff_required` | boolean |
| `licensed_back_to_seller_count` | integer |
| `licensed_to_buyer_count` | integer |
| `transition_license_count` | integer |
| `tsa_ip_overlay_required` | boolean |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Assigned IP, transition license, perpetual license-back, and TSA-IP overlay.

Computes assigned, licensed-to-buyer, licensed-back-to-seller, transition-license, and TSA-IP overlay counts.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| IP carve-out practice norms | AUTH-0117 | practice-or-guidance |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.IP.CARVEOUT_LICENSE_BACK.001` — *IP carve-out model counts assigned, licensed, and license-back assets*.

**Inputs**

```json
{
  "ip_assets": [
    {
      "asset_name": "Brand",
      "disposition": "assigned_to_buyer"
    },
    {
      "asset_name": "Platform",
      "disposition": "licensed_to_buyer",
      "transition_license_months": 12
    },
    {
      "asset_name": "Shared mark",
      "disposition": "license_back_to_seller"
    }
  ]
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "asset_count": 3,
  "assigned_to_buyer_count": 1,
  "licensed_to_buyer_count": 1,
  "licensed_back_to_seller_count": 1,
  "transition_license_count": 1,
  "tsa_ip_overlay_required": true,
  "counsel_drafting_handoff_required": true,
  "asset_rows": [
    {
      "asset_name": "Brand",
      "disposition": "assigned_to_buyer",
      "assigned_to_buyer": true,
      "licensed_to_buyer": false,
      "licensed_back_to_seller": false,
      "transition_license_months": 0
    },
    {
      "asset_name": "Platform",
      "disposition": "licensed_to_buyer",
      "assigned_to_buyer": false,
      "licensed_to_buyer": true,
      "licensed_back_to_seller": false,
      "transition_license_months": 12
    },
    {
      "asset_name": "Shared mark",
      "disposition": "license_back_to_seller",
      "assigned_to_buyer": false,
      "licensed_to_buyer": false,
      "licensed_back_to_seller": true,
      "transition_license_months": 0
    }
  ]
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["ip_assets"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model produces deterministic schedules and routing only. The governing determination for carve-out and license-back mechanics is a licensed-professional conclusion; a conforming implementation MUST route that determination (with the model's workpapers) and MUST NOT emit it.

## 9. Conformance bindings

Requirement `REQ-M218` is verified by 2 published case(s): `CONF.MODEL.IP.CARVEOUT_LICENSE_BACK.001`, `CONF.MODEL.IP.CARVEOUT_LICENSE_BACK.002`.

## 10. Version

Reference binding `MODEL.IP.CARVEOUT_LICENSE_BACK.v1` · entered the specification at internal lineage stage `v1_1` · spec v1.0.0.


# M219 — Source-code and IP escrow mechanics

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G10
**Deal contexts:** software M&A

## 1. Purpose

Release triggers, deposit verification tier, and update schedule.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M219.schema.json`](M219.schema.json).

| Field | Type | Required |
|---|---|---|
| `deposit_verification_tier` | string | MUST |
| `release_triggers` | string[] | MUST |
| `last_deposit_date` | string (ISO date) | MAY |
| `update_frequency_months` | integer | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `build_verified` | boolean |
| `deposit_verification_tier` | string |
| `last_deposit_date` | string (ISO date) |
| `next_deposit_due_date` | string (ISO date) |
| `release_trigger_count` | integer |
| `release_triggers` | string[] |
| `run_tested` | boolean |
| `update_frequency_months` | integer |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Release triggers, deposit verification tier, and update schedule.

Computes release trigger count, deposit verification tier, build/run-test flags, and next deposit due date.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| Escode | AUTH-0077 | statute |
| Codekeeper | AUTH-0061 | statute |
| Iron Mountain escrow templates | AUTH-0163 | practice-or-guidance |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.IP.ESCROW.001` — *Source-code escrow computes trigger count, verification tier, and next deposit*.

**Inputs**

```json
{
  "release_triggers": [
    "insolvency",
    "support discontinuation",
    "material breach"
  ],
  "deposit_verification_tier": "build verified",
  "last_deposit_date": "2026-05-21",
  "update_frequency_months": 3
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "release_trigger_count": 3,
  "release_triggers": [
    "insolvency",
    "support discontinuation",
    "material breach"
  ],
  "deposit_verification_tier": "build_verified",
  "build_verified": true,
  "run_tested": false,
  "update_frequency_months": 3,
  "last_deposit_date": "2026-05-21",
  "next_deposit_due_date": "2026-08-21"
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["release_triggers","deposit_verification_tier"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## 9. Conformance bindings

Requirement `REQ-M219` is verified by 2 published case(s): `CONF.MODEL.IP.ESCROW.001`, `CONF.MODEL.IP.ESCROW.002`.

## 10. Version

Reference binding `MODEL.IP.SOURCE_CODE_ESCROW.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M220 — Employee IP assignment verification

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G10
**Deal contexts:** IP diligence

## 1. Purpose

Contributor-by-contributor assignment and work-for-hire verification with state enforceability flag.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M220.schema.json`](M220.schema.json).

| Field | Type | Required |
|---|---|---|
| `contributors` | object[] | MUST |

## 3. Output contract

| Field | Type |
|---|---|
| `all_contributors_papered` | boolean |
| `california_2870_carveout_count` | integer |
| `contributor_count` | integer |
| `contributor_rows` | object[] |
| `counsel_review_required` | boolean |
| `executed_assignment_count` | integer |
| `missing_assignment_count` | integer |
| `missing_work_for_hire_count` | integer |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Contributor-by-contributor assignment and work-for-hire verification with state enforceability flag.

Computes contributor assignment, work-for-hire, and state carve-out flags from supplied contributor records.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| California Labor Code 2870 | AUTH-0055 | statute |
| state employee-IP statutes | AUTH-0266 | statute |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.IP.EMPLOYEE_ASSIGN.001` — *Employee IP assignment verification computes contributor gaps*.

**Inputs**

```json
{
  "contributors": [
    {
      "name": "Founder",
      "state": "CA",
      "ip_assignment_executed": true,
      "work_for_hire_executed": true,
      "outside_scope_invention": true
    },
    {
      "name": "Contractor",
      "state": "TX",
      "ip_assignment_executed": false,
      "work_for_hire_executed": false
    }
  ]
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "contributor_count": 2,
  "executed_assignment_count": 1,
  "missing_assignment_count": 1,
  "missing_work_for_hire_count": 1,
  "california_2870_carveout_count": 1,
  "all_contributors_papered": false,
  "counsel_review_required": true,
  "contributor_rows": [
    {
      "contributor": "Founder",
      "role": "not_supplied",
      "state": "CA",
      "ip_assignment_executed": true,
      "work_for_hire_executed": true,
      "missing_assignment": false,
      "missing_work_for_hire": false,
      "california_2870_carveout_flag": true
    },
    {
      "contributor": "Contractor",
      "role": "not_supplied",
      "state": "TX",
      "ip_assignment_executed": false,
      "work_for_hire_executed": false,
      "missing_assignment": true,
      "missing_work_for_hire": true,
      "california_2870_carveout_flag": false
    }
  ]
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["contributors"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model produces deterministic schedules and routing only. The governing determination for employee ip assignment verification is a licensed-professional conclusion; a conforming implementation MUST route that determination (with the model's workpapers) and MUST NOT emit it.

## 9. Conformance bindings

Requirement `REQ-M220` is verified by 2 published case(s): `CONF.MODEL.IP.EMPLOYEE_ASSIGN.001`, `CONF.MODEL.IP.EMPLOYEE_ASSIGN.002`.

## 10. Version

Reference binding `MODEL.IP.EMPLOYEE_ASSIGNMENT.VERIFICATION.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M221 — OSS exposure diligence process

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G10
**Deal contexts:** software M&A · OSS diligence

## 1. Purpose

SCA pass-through, permissive/weak/strong copyleft classification, AGPL SaaS flag, indemnity carve-out, and escrow sizing.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M221.schema.json`](M221.schema.json).

| Field | Type | Required |
|---|---|---|
| `components` | object[] | MUST |

## 3. Output contract

| Field | Type |
|---|---|
| `agpl_network_count` | integer |
| `component_count` | integer |
| `indemnity_carveout_review_required` | boolean |
| `oss_rows` | object[] |
| `oss_specific_rep_required` | boolean |
| `permissive_count` | integer |
| `proprietary_strong_copyleft_count` | integer |
| `sca_pass_through_source_required` | boolean |
| `special_escrow_sizing_cents` | integer (cents) |
| `strong_copyleft_count` | integer |
| `unknown_license_count` | integer |
| `weak_copyleft_count` | integer |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

SCA pass-through, permissive/weak/strong copyleft classification, AGPL SaaS flag, indemnity carve-out, and escrow sizing.

Classifies OSS components by license family and computes AGPL, strong-copyleft, indemnity, and remediation escrow flags.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| GPL | AUTH-0101 | practice-or-guidance |
| AGPL | AUTH-0032 | practice-or-guidance |
| LGPL | AUTH-0180 | practice-or-guidance |
| MIT | AUTH-0196 | practice-or-guidance |
| Apache | AUTH-0041 | practice-or-guidance |
| BSD | AUTH-0049 | practice-or-guidance |
| Morgan Lewis OSS guidance | AUTH-0199 | practice-or-guidance |
| Nixon Peabody OSS guidance | AUTH-0212 | practice-or-guidance |
| Morse OSS guidance | AUTH-0201 | practice-or-guidance |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.IP.OSS.001` — *OSS exposure process classifies copyleft and escrow exposure*.

**Inputs**

```json
{
  "components": [
    {
      "name": "React",
      "license": "MIT",
      "remediation_cost_cents": 0
    },
    {
      "name": "Report lib",
      "license": "LGPL-3.0",
      "remediation_cost_cents": 50000
    },
    {
      "name": "Network tool",
      "license": "AGPL-3.0",
      "network_use": true,
      "proprietary_linking": true,
      "remediation_cost_cents": 250000
    }
  ]
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "component_count": 3,
  "permissive_count": 1,
  "weak_copyleft_count": 1,
  "strong_copyleft_count": 1,
  "unknown_license_count": 0,
  "agpl_network_count": 1,
  "proprietary_strong_copyleft_count": 1,
  "oss_specific_rep_required": true,
  "indemnity_carveout_review_required": true,
  "special_escrow_sizing_cents": 300000,
  "sca_pass_through_source_required": true,
  "oss_rows": [
    {
      "component": "React",
      "license": "mit",
      "license_class": "permissive",
      "network_use": false,
      "proprietary_linking": false,
      "agpl_network_flag": false,
      "strong_copyleft_embedded_flag": false,
      "remediation_cost_cents": 0
    },
    {
      "component": "Report lib",
      "license": "lgpl-3.0",
      "license_class": "weak_copyleft",
      "network_use": false,
      "proprietary_linking": false,
      "agpl_network_flag": false,
      "strong_copyleft_embedded_flag": false,
      "remediation_cost_cents": 50000
    },
    {
      "component": "Network tool",
      "license": "agpl-3.0",
      "license_class": "strong_copyleft",
      "network_use": true,
      "proprietary_linking": true,
      "agpl_network_flag": true,
      "strong_copyleft_embedded_flag": true,
      "remediation_cost_cents": 250000
    }
  ]
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["components"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model produces deterministic schedules and routing only. The governing determination for oss exposure diligence process is a licensed-professional conclusion; a conforming implementation MUST route that determination (with the model's workpapers) and MUST NOT emit it.

## 9. Conformance bindings

Requirement `REQ-M221` is verified by 2 published case(s): `CONF.MODEL.IP.OSS.001`, `CONF.MODEL.IP.OSS.002`.

## 10. Version

Reference binding `MODEL.IP.OSS.EXPOSURE.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M222 — IP-specific 1060 allocation

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G2, G10
**Deal contexts:** IP-heavy acquisition

## 1. Purpose

Class V/VI/VII sub-allocation and residual-method cap ordering for IP-heavy deals.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M222.schema.json`](M222.schema.json).

| Field | Type | Required |
|---|---|---|
| `ip_intangibles_cents` | integer (cents) | MUST |
| `purchase_price_cents` | integer (cents) | MUST |
| `tangible_assets_cents` | integer (cents) | MUST |

## 3. Output contract

| Field | Type |
|---|---|
| `class_v_tangible_assets_cents` | integer (cents) |
| `class_vi_ip_section_197_intangibles_cents` | integer (cents) |
| `class_vii_goodwill_going_concern_cents` | integer (cents) |
| `form_8594_reconciliation_total_cents` | integer (cents) |
| `ip_value_excess_over_purchase_price_cents` | integer (cents) |
| `purchase_price_cents` | integer (cents) |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Class V/VI/VII sub-allocation and residual-method cap ordering for IP-heavy deals.

Allocates IP-heavy purchase price across Class V tangible assets, Class VI IP intangibles, and Class VII goodwill/going concern.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| IRC 1060 | AUTH-0124 | statute |
| Treas. Reg. 1.338-6(b) | AUTH-0287 | regulation |
| Treas. Reg. 1.1060-1 | AUTH-0283 | regulation |
| IRS Form 8594 | AUTH-0168 | form |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.IP.1060.001` — *IP-specific 1060 allocation maps Class V, VI, and VII*.

**Inputs**

```json
{
  "purchase_price_cents": 1000000,
  "tangible_assets_cents": 200000,
  "ip_intangibles_cents": 600000
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "purchase_price_cents": 1000000,
  "class_v_tangible_assets_cents": 200000,
  "class_vi_ip_section_197_intangibles_cents": 600000,
  "class_vii_goodwill_going_concern_cents": 200000,
  "ip_value_excess_over_purchase_price_cents": 0,
  "form_8594_reconciliation_total_cents": 1000000
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["purchase_price_cents","tangible_assets_cents","ip_intangibles_cents"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## 9. Conformance bindings

Requirement `REQ-M222` is verified by 2 published case(s): `CONF.MODEL.IP.1060.001`, `CONF.MODEL.IP.1060.002`.

## 10. Version

Reference binding `MODEL.IP.1060.ALLOCATION.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M223 — Domain and trademark transfer mechanics

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G10
**Deal contexts:** domain transfer · trademark transfer

## 1. Purpose

Registrar auth-code, 60-day lock, trademark assignment recording, state trademark, social-handle, and SSL transfer steps.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M223.schema.json`](M223.schema.json).

| Field | Type | Required |
|---|---|---|
| `transfer_assets` | object[] | MUST |

## 3. Output contract

| Field | Type |
|---|---|
| `auth_code_required_count` | integer |
| `domain_count` | integer |
| `locked_domain_count` | integer |
| `social_handle_transfer_count` | integer |
| `ssl_reissue_count` | integer |
| `state_assignment_required_count` | integer |
| `trademark_count` | integer |
| `transfer_asset_count` | integer |
| `transfer_rows` | object[] |
| `uspto_assignment_recording_count` | integer |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Registrar auth-code, 60-day lock, trademark assignment recording, state trademark, social-handle, and SSL transfer steps.

Computes domain auth-code, ICANN lock, USPTO assignment, state trademark, social-handle, and SSL transfer counts.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| ICANN transfer rules | AUTH-0106 | practice-or-guidance |
| USPTO Form PTO-1594 | AUTH-0303 | form |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.IP.DOMAIN_TM.001` — *Domain and trademark transfer mechanics compute transfer requirements*.

**Inputs**

```json
{
  "transfer_assets": [
    {
      "type": "domain",
      "name": "example.com",
      "transfer_lock_days_remaining": 45,
      "ssl_certificate_attached": true
    },
    {
      "type": "trademark",
      "name": "EXAMPLE",
      "state_registered": true
    },
    {
      "type": "social",
      "name": "@example"
    }
  ]
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "transfer_asset_count": 3,
  "domain_count": 1,
  "trademark_count": 1,
  "auth_code_required_count": 1,
  "locked_domain_count": 1,
  "uspto_assignment_recording_count": 1,
  "state_assignment_required_count": 1,
  "social_handle_transfer_count": 1,
  "ssl_reissue_count": 1,
  "transfer_rows": [
    {
      "name": "example.com",
      "type": "domain",
      "auth_code_required": true,
      "transfer_lock_days_remaining": 45,
      "uspto_assignment_recording_required": false,
      "state_assignment_required": false,
      "social_handle_transfer_required": false,
      "ssl_reissue_required": true
    },
    {
      "name": "EXAMPLE",
      "type": "trademark",
      "auth_code_required": false,
      "transfer_lock_days_remaining": 0,
      "uspto_assignment_recording_required": true,
      "state_assignment_required": true,
      "social_handle_transfer_required": false,
      "ssl_reissue_required": false
    },
    {
      "name": "@example",
      "type": "social",
      "auth_code_required": false,
      "transfer_lock_days_remaining": 0,
      "uspto_assignment_recording_required": false,
      "state_assignment_required": false,
      "social_handle_transfer_required": true,
      "ssl_reissue_required": false
    }
  ]
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["transfer_assets"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## 9. Conformance bindings

Requirement `REQ-M223` is verified by 2 published case(s): `CONF.MODEL.IP.DOMAIN_TM.001`, `CONF.MODEL.IP.DOMAIN_TM.002`.

## 10. Version

Reference binding `MODEL.IP.DOMAIN_TM.TRANSFER.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M224 — Recording-act and priority engine

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G30
**Deal contexts:** real estate M&A · title diligence

## 1. Purpose

State-typed race/notice/race-notice priority ordering from recording and notice facts; DE pure race, NY/CA race-notice, TX notice; unknown states defer with a table-gap flag.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M224.schema.json`](M224.schema.json).

| Field | Type | Required |
|---|---|---|
| `later_purchaser_for_value` | boolean | MUST |
| `later_recorded_first` | boolean | MUST |
| `later_took_without_notice` | boolean | MUST |
| `state` | string | MUST |

## 3. Output contract

| Field | Type |
|---|---|
| `act_type` | string |
| `bfp_protected` | boolean |
| `citation` | string |
| `counsel_handoff` | string |
| `defer_to_counsel` | boolean |
| `prevailing_interest` | string |
| `red_flags` | any[] \| string[] |
| `state` | string |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

State-typed race/notice/race-notice priority ordering from recording and notice facts; DE pure race, NY/CA race-notice, TX notice; unknown states defer with a table-gap flag.

State-typed (race/notice/race-notice) priority ordering between a prior interest and a later purchaser from recording and notice facts; unknown states defer with a table-gap flag.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| N.Y. Real Prop. Law 291 | AUTH-0207 | practice-or-guidance |
| Cal. Civ. Code 1214 | AUTH-0052 | case |
| Tex. Prop. Code 13.001 | AUTH-0274 | statute |
| 25 Del. C. 153 | AUTH-0018 | practice-or-guidance |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.RE.V18C.RECORDING.001` — *DE (race): value=true noNotice=true recordedFirst=true → later_purchaser*.

**Inputs**

```json
{
  "state": "DE",
  "later_purchaser_for_value": true,
  "later_took_without_notice": true,
  "later_recorded_first": true
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "state": "DE",
  "act_type": "race",
  "citation": "25 Del. C. § 153",
  "prevailing_interest": "later_purchaser",
  "bfp_protected": true,
  "defer_to_counsel": false,
  "red_flags": []
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["state","later_purchaser_for_value","later_took_without_notice","later_recorded_first"]`. No partial outputs are emitted.
- **Specialist boundary:** outputs include `defer_to_counsel` (boolean) and, when true, `counsel_handoff` (string) — a conforming implementation MUST surface the routing and MUST NOT convert it into an answer.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## 9. Conformance bindings

Requirement `REQ-M224` is verified by 25 published case(s): `CONF.MODEL.RE.V18C.RECORDING.001`, `CONF.MODEL.RE.V18C.RECORDING.002`, `CONF.MODEL.RE.V18C.RECORDING.003`, `CONF.MODEL.RE.V18C.RECORDING.004`, `CONF.MODEL.RE.V18C.RECORDING.005`, `CONF.MODEL.RE.V18C.RECORDING.006`, `CONF.MODEL.RE.V18C.RECORDING.007`, `CONF.MODEL.RE.V18C.RECORDING.008`, `CONF.MODEL.RE.V18C.RECORDING.009`, `CONF.MODEL.RE.V18C.RECORDING.010`, `CONF.MODEL.RE.V18C.RECORDING.011`, `CONF.MODEL.RE.V18C.RECORDING.012`, `CONF.MODEL.RE.V18C.RECORDING.013`, `CONF.MODEL.RE.V18C.RECORDING.014`, `CONF.MODEL.RE.V18C.RECORDING.015`, `CONF.MODEL.RE.V18C.RECORDING.016`, `CONF.MODEL.RE.V18C.RECORDING.017`, `CONF.MODEL.RE.V18C.RECORDING.018`, `CONF.MODEL.RE.V18C.RECORDING.019`, `CONF.MODEL.RE.V18C.RECORDING.020`, `CONF.MODEL.RE.V18C.RECORDING.021`, `CONF.MODEL.RE.V18C.RECORDING.022`, `CONF.MODEL.RE.V18C.RECORDING.023`, `CONF.MODEL.RE.V18C.RECORDING.024`, `CONF.MODEL.RE.V18C.RECORDING.025`.

## 10. Version

Reference binding `MODEL.RE.RECORDING_PRIORITY.v1` · entered the specification at internal lineage stage `v1_2` · spec v1.0.0.


# M225 — Title-covenant and estate/signatory model

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G30
**Deal contexts:** real estate M&A · title diligence

## 1. Purpose

Deed-type to covenant-set map (six covenants; after-acquired title), TX seisin narrowing, and the concurrent-ownership signatory matrix incl. tenancy-by-entirety both-spouses rule.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M225.schema.json`](M225.schema.json).

| Field | Type | Required |
|---|---|---|
| `deed_type` | string | MUST |
| `vesting_form` | string | MUST |
| `all_required_signers_present` | boolean | MAY |
| `state` | string | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `after_acquired_title_applies` | boolean |
| `counsel_handoff` | null \| string |
| `covenant_scope` | string |
| `covenants_present` | string[] \| any[] |
| `deed_note` | string |
| `deed_type` | string |
| `defer_to_counsel` | boolean |
| `red_flags` | any[] \| string[] |
| `required_signatories` | string |
| `signatory_gap` | boolean |
| `tx_seisin_note` | null \| string |
| `vesting_form` | string |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Deed-type to covenant-set map (six covenants; after-acquired title), TX seisin narrowing, and the concurrent-ownership signatory matrix incl. tenancy-by-entirety both-spouses rule.

Deed-type to covenant-set mapping (present/future covenants, after-acquired title) plus the concurrent-ownership signature matrix with missed-signatory red flags.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| Common-law deed covenants | AUTH-0063 | practice-or-guidance |
| Tex. Prop. Code 5.023 | AUTH-0276 | statute |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.RE.V18C.COVENANT.026` — *general_warranty → scope all_defects, after-acquired true*.

**Inputs**

```json
{
  "deed_type": "general_warranty",
  "vesting_form": "sole",
  "all_required_signers_present": true
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "deed_type": "general_warranty",
  "covenants_present": [
    "seisin",
    "right_to_convey",
    "against_encumbrances",
    "quiet_enjoyment",
    "warranty",
    "further_assurances"
  ],
  "covenant_scope": "all_defects",
  "after_acquired_title_applies": true,
  "deed_note": "All six covenants; warrants against all defects whenever arising. After-acquired title (estoppel by deed) vests later-acquired title in the grantee.",
  "tx_seisin_note": null,
  "vesting_form": "sole",
  "required_signatories": "The sole record owner (plus spousal joinder where homestead/community-property law requires).",
  "signatory_gap": false,
  "defer_to_counsel": false,
  "counsel_handoff": null,
  "red_flags": []
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["deed_type","vesting_form"]`. No partial outputs are emitted.
- **Specialist boundary:** outputs include `defer_to_counsel` (boolean) and, when true, `counsel_handoff` (string) — a conforming implementation MUST surface the routing and MUST NOT convert it into an answer.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## 9. Conformance bindings

Requirement `REQ-M225` is verified by 22 published case(s): `CONF.MODEL.RE.V18C.COVENANT.026`, `CONF.MODEL.RE.V18C.COVENANT.027`, `CONF.MODEL.RE.V18C.COVENANT.028`, `CONF.MODEL.RE.V18C.COVENANT.029`, `CONF.MODEL.RE.V18C.COVENANT.030`, `CONF.MODEL.RE.V18C.COVENANT.031`, `CONF.MODEL.RE.V18C.COVENANT.032`, `CONF.MODEL.RE.V18C.COVENANT.033`, `CONF.MODEL.RE.V18C.COVENANT.034`, `CONF.MODEL.RE.V18C.COVENANT.035`, `CONF.MODEL.RE.V18C.COVENANT.036`, `CONF.MODEL.RE.V18C.COVENANT.037`, `CONF.MODEL.RE.V18C.COVENANT.038`, `CONF.MODEL.RE.V18C.COVENANT.039`, `CONF.MODEL.RE.V18C.COVENANT.040`, `CONF.MODEL.RE.V18C.COVENANT.041`, `CONF.MODEL.RE.V18C.COVENANT.042`, `CONF.MODEL.RE.V18C.COVENANT.043`, `CONF.MODEL.RE.V18C.COVENANT.044`, `CONF.MODEL.RE.V18C.COVENANT.045`, `CONF.MODEL.RE.V18C.COVENANT.046`, `CONF.MODEL.RE.V18C.COVENANT.047`.

## 10. Version

Reference binding `MODEL.RE.TITLE_COVENANT_SIGNATORY.v1` · entered the specification at internal lineage stage `v1_2` · spec v1.0.0.


# M226 — Marketability triage

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G30
**Deal contexts:** title diligence

## 1. Purpose

Curable / insurable-over / deal-killing bucketing of title exceptions; insurable-only contract-standard flag; any deal-killer is a hard defer — the marketability judgment is never emitted.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M226.schema.json`](M226.schema.json).

| Field | Type | Required |
|---|---|---|
| `exceptions` | object[] \| any[] | MUST |
| `contract_title_standard` | string | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `contract_title_standard` | string |
| `counsel_handoff` | null \| string |
| `curable_count` | integer |
| `deal_killing_count` | integer |
| `defer_to_counsel` | boolean |
| `insurable_over_count` | integer |
| `red_flags` | any[] \| string[] |
| `triage` | object[] |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Curable / insurable-over / deal-killing bucketing of title exceptions; insurable-only contract-standard flag; any deal-killer is a hard defer — the marketability judgment is never emitted.

Buckets title exceptions curable / insurable-over / deal-killing and flags insurable-only contract standards; any deal-killer routes to counsel — the marketability judgment is never emitted.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| Marketable-title common law | AUTH-0187 | practice-or-guidance |
| ALTA title practice | AUTH-0038 | practice-or-guidance |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.RE.V18C.MARKET.048` — *All curable → no defer*.

**Inputs**

```json
{
  "exceptions": [
    {
      "label": "Old mortgage payoff",
      "curable": true,
      "insurer_will_insure_over": true
    },
    {
      "label": "Tax lien payoff",
      "curable": true,
      "insurer_will_insure_over": false
    }
  ]
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "contract_title_standard": "marketable",
  "triage": [
    {
      "label": "Old mortgage payoff",
      "bucket": "curable"
    },
    {
      "label": "Tax lien payoff",
      "bucket": "curable"
    }
  ],
  "curable_count": 2,
  "insurable_over_count": 0,
  "deal_killing_count": 0,
  "defer_to_counsel": false,
  "counsel_handoff": null,
  "red_flags": []
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["exceptions"]`. No partial outputs are emitted.
- **Specialist boundary:** outputs include `defer_to_counsel` (boolean) and, when true, `counsel_handoff` (string) — a conforming implementation MUST surface the routing and MUST NOT convert it into an answer.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model produces deterministic schedules and routing only. The governing determination for marketability triage is a licensed-professional conclusion; a conforming implementation MUST route that determination (with the model's workpapers) and MUST NOT emit it.

## 9. Conformance bindings

Requirement `REQ-M226` is verified by 15 published case(s): `CONF.MODEL.RE.V18C.MARKET.048`, `CONF.MODEL.RE.V18C.MARKET.049`, `CONF.MODEL.RE.V18C.MARKET.050`, `CONF.MODEL.RE.V18C.MARKET.051`, `CONF.MODEL.RE.V18C.MARKET.052`, `CONF.MODEL.RE.V18C.MARKET.053`, `CONF.MODEL.RE.V18C.MARKET.054`, `CONF.MODEL.RE.V18C.MARKET.055`, `CONF.MODEL.RE.V18C.MARKET.056`, `CONF.MODEL.RE.V18C.MARKET.057`, `CONF.MODEL.RE.V18C.MARKET.058`, `CONF.MODEL.RE.V18C.MARKET.059`, `CONF.MODEL.RE.V18C.MARKET.060`, `CONF.MODEL.RE.V18C.MARKET.061`, `CONF.MODEL.RE.V18C.MARKET.062`.

## 10. Version

Reference binding `MODEL.RE.MARKETABILITY_TRIAGE.v1` · entered the specification at internal lineage stage `v1_2` · spec v1.0.0.


# M227 — Risk-of-loss allocator

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G30
**Deal contexts:** real estate purchase agreement

## 1. Purpose

Contract-override detection plus state default lookup: NY Risk Act seller-risk, CA/TX UVPRA, common-law equitable-conversion buyer-risk.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M227.schema.json`](M227.schema.json).

| Field | Type | Required |
|---|---|---|
| `contract_allocates_risk` | boolean | MUST |
| `state` | string | MUST |
| `contract_risk_on` | string | MAY |
| `legal_title_or_possession_passed` | boolean | MAY |
| `material_casualty_or_condemnation_pending` | boolean | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `basis` | string |
| `citation` | string |
| `contract_override_applied` | boolean |
| `default_regime` | string |
| `defer_to_counsel` | boolean |
| `red_flags` | any[] \| string[] |
| `risk_on` | string |
| `state` | string |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Contract-override detection plus state default lookup: NY Risk Act seller-risk, CA/TX UVPRA, common-law equitable-conversion buyer-risk.

Contract-override detection plus the state default lookup (NY Risk Act / UVPRA / equitable conversion) for casualty risk between signing and closing.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| N.Y. Gen. Oblig. Law 5-1311 | AUTH-0206 | practice-or-guidance |
| Tex. Prop. Code 5.007 | AUTH-0275 | statute |
| Cal. Civ. Code 1662 | AUTH-0053 | case |
| equitable conversion | AUTH-0076 | practice-or-guidance |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.RE.V18C.RISKLOSS.063` — *NY silent contract → seller (Risk Act)*.

**Inputs**

```json
{
  "state": "NY",
  "contract_allocates_risk": false
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "state": "NY",
  "default_regime": "ny_risk_act_seller",
  "citation": "N.Y. Gen. Oblig. Law § 5-1311",
  "contract_override_applied": false,
  "risk_on": "seller",
  "basis": "ny_risk_act_seller",
  "defer_to_counsel": false,
  "red_flags": []
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["state","contract_allocates_risk"]`. No partial outputs are emitted.
- **Specialist boundary:** outputs include `defer_to_counsel` (boolean) and, when true, `counsel_handoff` (string) — a conforming implementation MUST surface the routing and MUST NOT convert it into an answer.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## 9. Conformance bindings

Requirement `REQ-M227` is verified by 12 published case(s): `CONF.MODEL.RE.V18C.RISKLOSS.063`, `CONF.MODEL.RE.V18C.RISKLOSS.064`, `CONF.MODEL.RE.V18C.RISKLOSS.065`, `CONF.MODEL.RE.V18C.RISKLOSS.066`, `CONF.MODEL.RE.V18C.RISKLOSS.067`, `CONF.MODEL.RE.V18C.RISKLOSS.068`, `CONF.MODEL.RE.V18C.RISKLOSS.069`, `CONF.MODEL.RE.V18C.RISKLOSS.070`, `CONF.MODEL.RE.V18C.RISKLOSS.071`, `CONF.MODEL.RE.V18C.RISKLOSS.072`, `CONF.MODEL.RE.V18C.RISKLOSS.073`, `CONF.MODEL.RE.V18C.RISKLOSS.074`.

## 10. Version

Reference binding `MODEL.RE.RISK_OF_LOSS.v1` · entered the specification at internal lineage stage `v1_2` · spec v1.0.0.


# M228 — Survival and merger tracker

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G30
**Deal contexts:** real estate purchase agreement · M&A closing

## 1. Purpose

Flags every relied-on rep/indemnity/covenant lacking an express survival hook or collateral character — merger extinguishes it at closing; fraud exception noted.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M228.schema.json`](M228.schema.json).

| Field | Type | Required |
|---|---|---|
| `items` | object[] \| any[] | MUST |

## 3. Output contract

| Field | Type |
|---|---|
| `defer_to_counsel` | boolean |
| `fraud_exception_note` | string |
| `items` | object[] |
| `merged_away_count` | integer |
| `red_flags` | string[] \| any[] |
| `surviving_count` | integer |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Flags every relied-on rep/indemnity/covenant lacking an express survival hook or collateral character — merger extinguishes it at closing; fraud exception noted.

Flags every relied-on rep, indemnity, or covenant lacking an express survival hook or collateral character — merger extinguishes it at closing; fraud exception noted.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| merger doctrine (common law) | AUTH-0193 | practice-or-guidance |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.RE.V18C.SURVIVAL.075` — *Rep without survival merges away*.

**Inputs**

```json
{
  "items": [
    {
      "label": "Title rep",
      "type": "rep",
      "express_survival": false,
      "collateral_obligation": false
    }
  ]
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "items": [
    {
      "label": "Title rep",
      "type": "rep",
      "express_survival": false,
      "collateral_obligation": false,
      "survives_closing": false,
      "basis": "merges_into_deed_at_closing"
    }
  ],
  "surviving_count": 0,
  "merged_away_count": 1,
  "fraud_exception_note": "Fraud claims survive merger independent of contract survival language.",
  "defer_to_counsel": false,
  "red_flags": [
    "1 relied-on item(s) lack an express survival hook and will merge into the deed at closing: Title rep. Add survival language before signing."
  ]
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["items"]`. No partial outputs are emitted.
- **Specialist boundary:** outputs include `defer_to_counsel` (boolean) and, when true, `counsel_handoff` (string) — a conforming implementation MUST surface the routing and MUST NOT convert it into an answer.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## 9. Conformance bindings

Requirement `REQ-M228` is verified by 15 published case(s): `CONF.MODEL.RE.V18C.SURVIVAL.075`, `CONF.MODEL.RE.V18C.SURVIVAL.076`, `CONF.MODEL.RE.V18C.SURVIVAL.077`, `CONF.MODEL.RE.V18C.SURVIVAL.078`, `CONF.MODEL.RE.V18C.SURVIVAL.079`, `CONF.MODEL.RE.V18C.SURVIVAL.080`, `CONF.MODEL.RE.V18C.SURVIVAL.081`, `CONF.MODEL.RE.V18C.SURVIVAL.082`, `CONF.MODEL.RE.V18C.SURVIVAL.083`, `CONF.MODEL.RE.V18C.SURVIVAL.084`, `CONF.MODEL.RE.V18C.SURVIVAL.085`, `CONF.MODEL.RE.V18C.SURVIVAL.086`, `CONF.MODEL.RE.V18C.SURVIVAL.087`, `CONF.MODEL.RE.V18C.SURVIVAL.088`, `CONF.MODEL.RE.V18C.SURVIVAL.089`.

## 10. Version

Reference binding `MODEL.RE.SURVIVAL_MERGER.v1` · entered the specification at internal lineage stage `v1_2` · spec v1.0.0.


# M229 — Lease anti-assignment and change-of-control parser

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G30
**Deal contexts:** OpCo/PropCo · entity deal with leases

## 1. Purpose

Deemed-assignment detection for control transfers, consent-standard classification against the state table (CA Kendall reasonableness vs. NY as-written), recapture interplay; enforceability always routes.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M229.schema.json`](M229.schema.json).

| Field | Type | Required |
|---|---|---|
| `consent_clause` | string | MUST |
| `transfer_type` | string | MUST |
| `landlord_recapture_right` | boolean | MAY |
| `lease_deems_change_of_control_assignment` | boolean | MAY |
| `state` | string | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `classification` | string |
| `coc_default_note` | null \| string |
| `consent_required` | boolean |
| `consent_standard` | null \| string |
| `consent_standard_citation` | null \| string |
| `counsel_handoff` | null \| string |
| `defer_to_counsel` | boolean |
| `landlord_recapture_right` | boolean |
| `red_flags` | any[] \| string[] |
| `state` | null \| string |
| `transfer_type` | string |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Deemed-assignment detection for control transfers, consent-standard classification against the state table (CA Kendall reasonableness vs. NY as-written), recapture interplay; enforceability always routes.

Classifies the consent path from parsed clause facts: deemed-assignment detection for control transfers, consent-standard classification against the state table (Kendall vs. NY as-written), recapture interplay.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| Kendall v. Ernest Pestana 40 Cal.3d 488 | AUTH-0170 | case |
| NY assignment common law | AUTH-0215 | practice-or-guidance |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.RE.V18C.LEASE.090` — *Silent lease → freely assignable*.

**Inputs**

```json
{
  "transfer_type": "asset_assignment",
  "consent_clause": "none_silent"
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "transfer_type": "asset_assignment",
  "state": null,
  "classification": "no_restriction_freely_assignable",
  "coc_default_note": null,
  "consent_required": false,
  "consent_standard": null,
  "consent_standard_citation": null,
  "landlord_recapture_right": false,
  "defer_to_counsel": false,
  "counsel_handoff": null,
  "red_flags": []
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["transfer_type","consent_clause"]`. No partial outputs are emitted.
- **Specialist boundary:** outputs include `defer_to_counsel` (boolean) and, when true, `counsel_handoff` (string) — a conforming implementation MUST surface the routing and MUST NOT convert it into an answer.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model produces deterministic schedules and routing only. The governing determination for lease anti-assignment and change-of-control parser is a licensed-professional conclusion; a conforming implementation MUST route that determination (with the model's workpapers) and MUST NOT emit it.

## 9. Conformance bindings

Requirement `REQ-M229` is verified by 24 published case(s): `CONF.MODEL.RE.V18C.LEASE.090`, `CONF.MODEL.RE.V18C.LEASE.091`, `CONF.MODEL.RE.V18C.LEASE.092`, `CONF.MODEL.RE.V18C.LEASE.093`, `CONF.MODEL.RE.V18C.LEASE.094`, `CONF.MODEL.RE.V18C.LEASE.095`, `CONF.MODEL.RE.V18C.LEASE.096`, `CONF.MODEL.RE.V18C.LEASE.097`, `CONF.MODEL.RE.V18C.LEASE.098`, `CONF.MODEL.RE.V18C.LEASE.099`, `CONF.MODEL.RE.V18C.LEASE.100`, `CONF.MODEL.RE.V18C.LEASE.101`, `CONF.MODEL.RE.V18C.LEASE.102`, `CONF.MODEL.RE.V18C.LEASE.103`, `CONF.MODEL.RE.V18C.LEASE.104`, `CONF.MODEL.RE.V18C.LEASE.105`, `CONF.MODEL.RE.V18C.LEASE.106`, `CONF.MODEL.RE.V18C.LEASE.107`, `CONF.MODEL.RE.V18C.LEASE.108`, `CONF.MODEL.RE.V18C.LEASE.109`, `CONF.MODEL.RE.V18C.LEASE.110`, `CONF.MODEL.RE.V18C.LEASE.111`, `CONF.MODEL.RE.V18C.LEASE.112`, `CONF.MODEL.RE.V18C.LEASE.113`.

## 10. Version

Reference binding `MODEL.RE.LEASE_COC_ASSIGNMENT.v1` · entered the specification at internal lineage stage `v1_2` · spec v1.0.0.


# M230 — Due-on-sale screener

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G30
**Deal contexts:** real estate financing · entity deal with property debt

## 1. Purpose

Garn-St. Germain residential-under-5-units exception filter; commercial and entity transfers get no consumer protection — lender consent flagged as closing critical path.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M230.schema.json`](M230.schema.json).

| Field | Type | Required |
|---|---|---|
| `loan_has_due_on_transfer_clause` | boolean | MUST |
| `residential_under_5_units` | boolean | MUST |
| `transfer_kind` | string | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `acceleration_risk` | string |
| `basis` | string |
| `citation` | string |
| `counsel_handoff` | null \| string |
| `defer_to_counsel` | boolean |
| `lender_consent_critical_path` | boolean |
| `red_flags` | any[] \| string[] |
| `transfer_kind` | string |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Garn-St. Germain residential-under-5-units exception filter; commercial and entity transfers get no consumer protection — lender consent flagged as closing critical path.

Garn-St. Germain residential-exception filter: consumer protections apply only under 5 residential units; commercial/entity transfers flag lender consent as the closing critical path.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| 12 U.S.C. 1701j-3 | AUTH-0014 | statute |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.RE.V18C.DUEONSALE.114` — *No clause → no acceleration risk*.

**Inputs**

```json
{
  "loan_has_due_on_transfer_clause": false,
  "residential_under_5_units": false,
  "transfer_kind": "deed_sale"
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "transfer_kind": "deed_sale",
  "acceleration_risk": "none_no_clause",
  "basis": "loan_documents_carry_no_due_on_transfer_clause",
  "citation": "12 U.S.C. § 1701j-3",
  "lender_consent_critical_path": false,
  "defer_to_counsel": false,
  "counsel_handoff": null,
  "red_flags": []
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["loan_has_due_on_transfer_clause","residential_under_5_units"]`. No partial outputs are emitted.
- **Specialist boundary:** outputs include `defer_to_counsel` (boolean) and, when true, `counsel_handoff` (string) — a conforming implementation MUST surface the routing and MUST NOT convert it into an answer.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## 9. Conformance bindings

Requirement `REQ-M230` is verified by 12 published case(s): `CONF.MODEL.RE.V18C.DUEONSALE.114`, `CONF.MODEL.RE.V18C.DUEONSALE.115`, `CONF.MODEL.RE.V18C.DUEONSALE.116`, `CONF.MODEL.RE.V18C.DUEONSALE.117`, `CONF.MODEL.RE.V18C.DUEONSALE.118`, `CONF.MODEL.RE.V18C.DUEONSALE.119`, `CONF.MODEL.RE.V18C.DUEONSALE.120`, `CONF.MODEL.RE.V18C.DUEONSALE.121`, `CONF.MODEL.RE.V18C.DUEONSALE.122`, `CONF.MODEL.RE.V18C.DUEONSALE.123`, `CONF.MODEL.RE.V18C.DUEONSALE.124`, `CONF.MODEL.RE.V18C.DUEONSALE.125`.

## 10. Version

Reference binding `MODEL.RE.DUE_ON_SALE.v1` · entered the specification at internal lineage stage `v1_2` · spec v1.0.0.


# M231 — Option/ROFR/ROFO trigger detector

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G30
**Deal contexts:** real estate M&A · entity deal

## 1. Purpose

Sale vs. entity-transfer trigger analysis in both directions — the sale that triggers the right and the entity structure that may avoid it; the legal conclusion always routes to counsel.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M231.schema.json`](M231.schema.json).

| Field | Type | Required |
|---|---|---|
| `right_captures_entity_transfers` | boolean | MUST |
| `right_type` | string | MUST |
| `transaction_form` | string | MUST |
| `state` | string | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `counsel_handoff` | string |
| `defer_to_counsel` | boolean |
| `red_flags` | string[] |
| `right_type` | string |
| `transaction_form` | string |
| `trigger_status` | string |
| `tx_strict_match_note` | null \| string |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Sale vs. entity-transfer trigger analysis in both directions — the sale that triggers the right and the entity structure that may avoid it; the legal conclusion always routes to counsel.

Sale vs. entity-transfer trigger analysis in BOTH directions — a sale that triggers the right and an entity structure that may avoid it; always routes the legal conclusion to counsel.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| ROFR/option common law | AUTH-0241 | practice-or-guidance |
| TX strict-match construction | AUTH-0291 | statute |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.RE.V18C.ROFR.126` — *ROFR + asset sale → triggered*.

**Inputs**

```json
{
  "right_type": "rofr",
  "transaction_form": "asset_sale",
  "right_captures_entity_transfers": false
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "right_type": "rofr",
  "transaction_form": "asset_sale",
  "trigger_status": "triggered_property_sale",
  "tx_strict_match_note": null,
  "defer_to_counsel": true,
  "counsel_handoff": "This raises a preemptive-right trigger issue that turns on whether this specific transaction legally triggers the right — the legal conclusion belongs to counsel. That's a legal determination for your real estate/transaction counsel — here are the options and implications for your decision.",
  "red_flags": [
    "A property sale is squarely within a ROFR — run the notice/matching mechanics before signing with a third party."
  ]
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["right_type","transaction_form","right_captures_entity_transfers"]`. No partial outputs are emitted.
- **Specialist boundary:** outputs include `defer_to_counsel` (boolean) and, when true, `counsel_handoff` (string) — a conforming implementation MUST surface the routing and MUST NOT convert it into an answer.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model produces deterministic schedules and routing only. The governing determination for option/rofr/rofo trigger detector is a licensed-professional conclusion; a conforming implementation MUST route that determination (with the model's workpapers) and MUST NOT emit it.

## 9. Conformance bindings

Requirement `REQ-M231` is verified by 15 published case(s): `CONF.MODEL.RE.V18C.ROFR.126`, `CONF.MODEL.RE.V18C.ROFR.127`, `CONF.MODEL.RE.V18C.ROFR.128`, `CONF.MODEL.RE.V18C.ROFR.129`, `CONF.MODEL.RE.V18C.ROFR.130`, `CONF.MODEL.RE.V18C.ROFR.131`, `CONF.MODEL.RE.V18C.ROFR.132`, `CONF.MODEL.RE.V18C.ROFR.133`, `CONF.MODEL.RE.V18C.ROFR.134`, `CONF.MODEL.RE.V18C.ROFR.135`, `CONF.MODEL.RE.V18C.ROFR.136`, `CONF.MODEL.RE.V18C.ROFR.137`, `CONF.MODEL.RE.V18C.ROFR.138`, `CONF.MODEL.RE.V18C.ROFR.139`, `CONF.MODEL.RE.V18C.ROFR.140`.

## 10. Version

Reference binding `MODEL.RE.PREEMPTIVE_RIGHT_TRIGGER.v1` · entered the specification at internal lineage stage `v1_2` · spec v1.0.0.


# M232 — Controlling-interest transfer-tax and reassessment screener

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G30, G19
**Deal contexts:** entity deal · merger with real property

## 1. Purpose

The 50-percent entity screen: NY controlling-interest tax with 3-year aggregation, CA Prop 13 change-in-control 100-percent reassessment, TX constitutional prohibition, DE deed tax; step-transaction flag on mere-change claims.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M232.schema.json`](M232.schema.json).

| Field | Type | Required |
|---|---|---|
| `is_entity_transfer` | boolean | MUST |
| `state` | string | MUST |
| `transfer_pct` | integer | MUST |
| `cumulative_related_transfers_pct` | integer | MAY |
| `mere_change_exemption_claimed` | boolean | MAY |
| `related_steps_planned` | boolean | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `aggregation_years` | integer \| null |
| `citation` | string |
| `citt_screen_triggered` | boolean |
| `controlling_interest_threshold_pct` | integer \| null |
| `counsel_handoff` | string \| null |
| `defer_to_counsel` | boolean |
| `reassessment_screen_triggered` | boolean |
| `red_flags` | string[] \| any[] |
| `regime_known` | boolean |
| `state` | string |
| `step_transaction_risk` | boolean |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

The 50-percent entity screen: NY controlling-interest tax with 3-year aggregation, CA Prop 13 change-in-control 100-percent reassessment, TX constitutional prohibition, DE deed tax; step-transaction flag on mere-change claims.

The ≥50% entity-transfer screen (NY controlling interest, CA Prop 13 § 64 change-in-control, TX constitutional prohibition, DE deed tax) with aggregation and step-transaction flags; complements MODEL.RE.CITT.TRANSFER_TAX.v1.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| NYC Admin. Code 11-2101 | AUTH-0218 | statute |
| NY Tax Law 1405(b)(6) | AUTH-0217 | practice-or-guidance |
| Cal. Rev. & Tax. Code 60-64 | AUTH-0054 | case |
| Tex. Const. art. VIII 29 | AUTH-0273 | statute |
| Matter of 105-02 Forest Hills (2025) | AUTH-0191 | case |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.RE.V18C.CITT.141` — *NY entity 50% → controlling-interest screen fires*.

**Inputs**

```json
{
  "state": "NY",
  "is_entity_transfer": true,
  "transfer_pct": 50
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "state": "NY",
  "regime_known": true,
  "citation": "NYC Admin. Code § 11-2101 (controlling interest = 50% or more); § 11-2106(b)(8) & NY Tax Law § 1405(b)(6) (mere-change exemption); NY Pub. 576 (3-year acting-in-concert aggregation)",
  "controlling_interest_threshold_pct": 50,
  "citt_screen_triggered": true,
  "reassessment_screen_triggered": false,
  "aggregation_years": 3,
  "step_transaction_risk": false,
  "defer_to_counsel": true,
  "counsel_handoff": "This raises a controlling-interest tax/reassessment issue that turns on whether this specific transfer is taxable or reassessable and how to structure — a determination for tax counsel. That's a legal determination for your real estate/transaction counsel — here are the options and implications for your decision.",
  "red_flags": [
    "Controlling-interest transfer tax screen: 50% entity transfer meets the 50% threshold in NY — no deed does not mean no transfer tax."
  ]
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["state","is_entity_transfer","transfer_pct"]`. No partial outputs are emitted.
- **Specialist boundary:** outputs include `defer_to_counsel` (boolean) and, when true, `counsel_handoff` (string) — a conforming implementation MUST surface the routing and MUST NOT convert it into an answer.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## 9. Conformance bindings

Requirement `REQ-M232` is verified by 18 published case(s): `CONF.MODEL.RE.V18C.CITT.141`, `CONF.MODEL.RE.V18C.CITT.142`, `CONF.MODEL.RE.V18C.CITT.143`, `CONF.MODEL.RE.V18C.CITT.144`, `CONF.MODEL.RE.V18C.CITT.145`, `CONF.MODEL.RE.V18C.CITT.146`, `CONF.MODEL.RE.V18C.CITT.147`, `CONF.MODEL.RE.V18C.CITT.148`, `CONF.MODEL.RE.V18C.CITT.149`, `CONF.MODEL.RE.V18C.CITT.150`, `CONF.MODEL.RE.V18C.CITT.151`, `CONF.MODEL.RE.V18C.CITT.152`, `CONF.MODEL.RE.V18C.CITT.153`, `CONF.MODEL.RE.V18C.CITT.154`, `CONF.MODEL.RE.V18C.CITT.155`, `CONF.MODEL.RE.V18C.CITT.156`, `CONF.MODEL.RE.V18C.CITT.157`, `CONF.MODEL.RE.V18C.CITT.158`.

## 10. Version

Reference binding `MODEL.RE.CITT_REASSESSMENT_SCREEN.v1` · entered the specification at internal lineage stage `v1_2` · spec v1.0.0.


# M233 — Permit/CO transferability and bulk-sales screener

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G30, G19
**Deal contexts:** asset deal · entity deal

## 1. Purpose

CO-on-transfer and use-change screens, non-transferable permit flags by deal form, CA/NY/NJ/PA bulk-sales tax-notification applicability, CERCLA successor flag.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M233.schema.json`](M233.schema.json).

| Field | Type | Required |
|---|---|---|
| `deal_form` | string | MUST |
| `jurisdiction_requires_co_on_transfer` | boolean | MUST |
| `cercla_linked_property` | boolean | MAY |
| `permits` | object[] | MAY |
| `states_involved` | string[] | MAY |
| `use_change` | boolean | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `bulk_sales_citations` | any[] \| string[] |
| `bulk_sales_notification_states` | any[] \| string[] |
| `cercla_successor_flag` | boolean |
| `co_required_on_transfer` | boolean |
| `counsel_handoff` | null \| string |
| `deal_form` | string |
| `defer_to_counsel` | boolean |
| `non_transferable_permits` | any[] \| string[] |
| `red_flags` | string[] \| any[] |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

CO-on-transfer and use-change screens, non-transferable permit flags by deal form, CA/NY/NJ/PA bulk-sales tax-notification applicability, CERCLA successor flag.

CO-on-transfer and use-change screens, non-transferable permit flags by deal form, bulk-sales/tax-clearance state applicability, and CERCLA successor-liability flag.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| municipal CO ordinances | AUTH-0204 | practice-or-guidance |
| UCC Art. 6 (as retained) | AUTH-0297 | statute |
| CERCLA 107 | AUTH-0057 | practice-or-guidance |
| 72 P.S. 1403 | AUTH-0020 | practice-or-guidance |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.RE.V18C.PERMIT.159` — *Asset deal in CO-on-transfer town → CO required*.

**Inputs**

```json
{
  "deal_form": "asset",
  "jurisdiction_requires_co_on_transfer": true
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "deal_form": "asset",
  "co_required_on_transfer": true,
  "non_transferable_permits": [],
  "bulk_sales_notification_states": [],
  "bulk_sales_citations": [],
  "cercla_successor_flag": false,
  "defer_to_counsel": false,
  "counsel_handoff": null,
  "red_flags": [
    "Certificate-of-occupancy requirement on transfer/use change — re-permitting and code-compliance upgrades can gate closing."
  ]
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["deal_form","jurisdiction_requires_co_on_transfer"]`. No partial outputs are emitted.
- **Specialist boundary:** outputs include `defer_to_counsel` (boolean) and, when true, `counsel_handoff` (string) — a conforming implementation MUST surface the routing and MUST NOT convert it into an answer.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## 9. Conformance bindings

Requirement `REQ-M233` is verified by 13 published case(s): `CONF.MODEL.RE.V18C.PERMIT.159`, `CONF.MODEL.RE.V18C.PERMIT.160`, `CONF.MODEL.RE.V18C.PERMIT.161`, `CONF.MODEL.RE.V18C.PERMIT.162`, `CONF.MODEL.RE.V18C.PERMIT.163`, `CONF.MODEL.RE.V18C.PERMIT.164`, `CONF.MODEL.RE.V18C.PERMIT.165`, `CONF.MODEL.RE.V18C.PERMIT.166`, `CONF.MODEL.RE.V18C.PERMIT.167`, `CONF.MODEL.RE.V18C.PERMIT.168`, `CONF.MODEL.RE.V18C.PERMIT.169`, `CONF.MODEL.RE.V18C.PERMIT.170`, `CONF.MODEL.RE.V18C.PERMIT.171`.

## 10. Version

Reference binding `MODEL.RE.PERMIT_CO_BULK_SALES.v1` · entered the specification at internal lineage stage `v1_2` · spec v1.0.0.


# M234 — Fixture classification and UCC 9-334 priority

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G30, G2
**Deal contexts:** asset deal with fixtures · equipment-heavy real estate

## 1. Purpose

Subsection (c) real-property default, the (d) PMSI 20-day fixture-filing exception, and the (h) construction-mortgage override, with PPA reconciliation note.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M234.schema.json`](M234.schema.json).

| Field | Type | Required |
|---|---|---|
| `fixture_filing_made` | boolean | MUST |
| `pmsi` | boolean | MUST |
| `prior_recorded_real_property_interest` | boolean | MUST |
| `construction_mortgage` | boolean | MAY |
| `filing_days_after_affixation` | integer | MAY |

## 3. Output contract

| Field | Type |
|---|---|
| `basis` | string |
| `construction_mortgage` | boolean |
| `defer_to_counsel` | boolean |
| `filing_days_after_affixation` | integer \| null |
| `fixture_filing_made` | boolean |
| `pmsi` | boolean |
| `ppa_note` | string |
| `priority` | string |
| `red_flags` | any[] \| string[] |
| `within_20_day_window` | boolean |

## 4. Algorithm

> **Formalization pending (draft gap).** The informative computation description follows; the numbered RFC-2119 normative steps are being formalized from the reference implementation and will replace this note.

Subsection (c) real-property default, the (d) PMSI 20-day fixture-filing exception, and the (h) construction-mortgage override, with PPA reconciliation note.

UCC § 9-334 fixture priority: subsection (c) default to the real-property interest, the (d) PMSI 20-day fixture-filing exception, and the (h) construction-mortgage override, with PPA reconciliation note.

## 5. Constants & authorities

| Authority | ID | Type |
|---|---|---|
| UCC 9-334 | AUTH-0293 | statute |

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.

## 6. Worked example

Conformance case `CONF.MODEL.RE.V18C.FIXTURE.172` — *No conflicting recorded interest + filing → fixture party*.

**Inputs**

```json
{
  "pmsi": true,
  "fixture_filing_made": true,
  "prior_recorded_real_property_interest": false,
  "filing_days_after_affixation": 5
}
```

**Outputs (reference implementation, verified by the suite)**

```json
{
  "priority": "fixture_secured_party",
  "basis": "No conflicting recorded real-property interest; fixture filing perfects against later interests.",
  "pmsi": true,
  "fixture_filing_made": true,
  "filing_days_after_affixation": 5,
  "within_20_day_window": true,
  "construction_mortgage": false,
  "ppa_note": "Fixture vs. personal-property classification shifts purchase-price allocation, transfer-tax base, and depreciation — reconcile with the 1060 allocation models.",
  "defer_to_counsel": false,
  "red_flags": []
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["pmsi","fixture_filing_made","prior_recorded_real_property_interest"]`. No partial outputs are emitted.
- **Specialist boundary:** outputs include `defer_to_counsel` (boolean) and, when true, `counsel_handoff` (string) — a conforming implementation MUST surface the routing and MUST NOT convert it into an answer.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model answers its computational question from supplied facts and cited constants. It renders no legal, tax, accounting, investment, or appraisal opinion; classifications it emits (flags, routings) are inputs to professional judgment, not substitutes for it.

## 9. Conformance bindings

Requirement `REQ-M234` is verified by 12 published case(s): `CONF.MODEL.RE.V18C.FIXTURE.172`, `CONF.MODEL.RE.V18C.FIXTURE.173`, `CONF.MODEL.RE.V18C.FIXTURE.174`, `CONF.MODEL.RE.V18C.FIXTURE.175`, `CONF.MODEL.RE.V18C.FIXTURE.176`, `CONF.MODEL.RE.V18C.FIXTURE.177`, `CONF.MODEL.RE.V18C.FIXTURE.178`, `CONF.MODEL.RE.V18C.FIXTURE.179`, `CONF.MODEL.RE.V18C.FIXTURE.180`, `CONF.MODEL.RE.V18C.FIXTURE.181`, `CONF.MODEL.RE.V18C.FIXTURE.182`, `CONF.MODEL.RE.V18C.FIXTURE.183`.

## 10. Version

Reference binding `MODEL.RE.FIXTURE_9334.v1` · entered the specification at internal lineage stage `v1_2` · spec v1.0.0.


---


# Anchor-State Law Tables — Real Property & Contract Law

Table version: `V18c.2026-07-16`. Anchor states DE / NY / CA / TX; other states are added as data rows. Where a state is not tabled, conforming implementations MUST emit a table-gap flag rather than guessing.

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

The following are legal determinations. A conforming implementation MUST classify and route them (requirements `REQ-DTC-RE-01`…`REQ-DTC-RE-10`); answering one violates this specification:

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


# Authority Register — as referenced

The 308 distinct authorities referenced by published entries, with provisional stable IDs. This public register is deliberately the *cited subset*: the full curated register (supersession chains, citator treatment, pin-cite validation, `next_check_due` machinery) is maintained internally and exported here only as published entries cite it. Entries typed `practice-norm` are market conventions without a controlling citation and are labeled as such rather than dressed as authority.

| ID | Authority | Type |
|---|---|---|
| AUTH-0001 | 11 U.S.C. 1111(b) | statute |
| AUTH-0002 | 11 U.S.C. 1125 | statute |
| AUTH-0003 | 11 U.S.C. 1129(a)(11) | statute |
| AUTH-0004 | 11 U.S.C. 1129(a)(7) | statute |
| AUTH-0005 | 11 U.S.C. 1129(b) | statute |
| AUTH-0006 | 11 U.S.C. 1129(b)(2) | statute |
| AUTH-0007 | 11 U.S.C. 1181-1195 | statute |
| AUTH-0008 | 11 U.S.C. 363 | statute |
| AUTH-0009 | 11 U.S.C. 364 | statute |
| AUTH-0010 | 11 U.S.C. 365 | statute |
| AUTH-0011 | 11 U.S.C. 507 | statute |
| AUTH-0012 | 11 U.S.C. 548 | statute |
| AUTH-0013 | 11 U.S.C. 726 | statute |
| AUTH-0014 | 12 U.S.C. 1701j-3 | statute |
| AUTH-0015 | 15 U.S.C. 18a | statute |
| AUTH-0016 | 17 U.S.C. 205 | statute |
| AUTH-0017 | 203 N. LaSalle | practice-or-guidance |
| AUTH-0018 | 25 Del. C. 153 | practice-or-guidance |
| AUTH-0019 | 35 U.S.C. 261 | statute |
| AUTH-0020 | 72 P.S. 1403 | practice-or-guidance |
| AUTH-0021 | AB Stable | practice-or-guidance |
| AUTH-0022 | ABA 2025 | practice-or-guidance |
| AUTH-0023 | ABA Business Law Today | practice-or-guidance |
| AUTH-0024 | ABA earnout reports | practice-or-guidance |
| AUTH-0025 | ABA Earnout Reports | practice-or-guidance |
| AUTH-0026 | ABA Model SPA | practice-or-guidance |
| AUTH-0027 | ABA Model SPA IP representations | practice-or-guidance |
| AUTH-0028 | ABA Model SPA IP Representations | practice-or-guidance |
| AUTH-0029 | ABA Private Target Deal Points Study | study/dataset |
| AUTH-0030 | ABL market practice | practice-or-guidance |
| AUTH-0031 | ABL Market Practice | practice-or-guidance |
| AUTH-0032 | AGPL | practice-or-guidance |
| AUTH-0033 | Akorn | practice-or-guidance |
| AUTH-0034 | ALTA endorsements | practice-or-guidance |
| AUTH-0035 | ALTA Endorsements | practice-or-guidance |
| AUTH-0036 | ALTA forms | form |
| AUTH-0037 | ALTA Forms | form |
| AUTH-0038 | ALTA title practice | practice-or-guidance |
| AUTH-0039 | Aon RWI reports | practice-or-guidance |
| AUTH-0040 | Aon RWI Reports | practice-or-guidance |
| AUTH-0041 | Apache | practice-or-guidance |
| AUTH-0042 | Appraisal Institute practice | practice-or-guidance |
| AUTH-0043 | Appraisal Institute Practice | practice-or-guidance |
| AUTH-0044 | ASC 842 | practice-or-guidance |
| AUTH-0045 | ASTM E2018 | practice-or-guidance |
| AUTH-0046 | At Home | practice-or-guidance |
| AUTH-0047 | BOMA | practice-or-guidance |
| AUTH-0048 | Brazen v. Bell Atlantic | case |
| AUTH-0049 | BSD | practice-or-guidance |
| AUTH-0050 | Bulk Sale Acts | practice-or-guidance |
| AUTH-0051 | bulk-sale acts | practice-or-guidance |
| AUTH-0052 | Cal. Civ. Code 1214 | case |
| AUTH-0053 | Cal. Civ. Code 1662 | case |
| AUTH-0054 | Cal. Rev. & Tax. Code 60-64 | case |
| AUTH-0055 | California Labor Code 2870 | statute |
| AUTH-0056 | Castleton Plaza | practice-or-guidance |
| AUTH-0057 | CERCLA 107 | practice-or-guidance |
| AUTH-0058 | CFIUS regulations | practice-or-guidance |
| AUTH-0059 | Channel Medsystems | practice-or-guidance |
| AUTH-0060 | Clorox v. Chemical Bank | case |
| AUTH-0061 | Codekeeper | statute |
| AUTH-0062 | Collier 364.06 | practice-or-guidance |
| AUTH-0063 | Common-law deed covenants | practice-or-guidance |
| AUTH-0064 | Convertible Financing Market Practice | practice-or-guidance |
| AUTH-0065 | CPRA | practice-or-guidance |
| AUTH-0066 | Credit Agreement Market Practice | practice-or-guidance |
| AUTH-0067 | CT 12-638 | practice-or-guidance |
| AUTH-0068 | Damodaran 2026 | study/dataset |
| AUTH-0069 | Delaware equitable-remedy case law | practice-or-guidance |
| AUTH-0070 | DGCL 170 | statute |
| AUTH-0071 | DGCL 251(h) | statute |
| AUTH-0072 | DGCL SB 21 | statute |
| AUTH-0073 | DOL ESOP guidance | practice-or-guidance |
| AUTH-0074 | English MAC case law | practice-or-guidance |
| AUTH-0075 | Envision | practice-or-guidance |
| AUTH-0076 | equitable conversion | practice-or-guidance |
| AUTH-0077 | Escode | statute |
| AUTH-0078 | ETA market norms | practice-or-guidance |
| AUTH-0079 | EU Merger Regulation 139/2004 | practice-or-guidance |
| AUTH-0080 | fairness opinion case law | practice-or-guidance |
| AUTH-0081 | Fenwick 2023 ARBF analysis | practice-or-guidance |
| AUTH-0082 | Fisker | practice-or-guidance |
| AUTH-0083 | Form 1099-DA | form |
| AUTH-0084 | Form 8288-B | form |
| AUTH-0085 | Forms 8288 | form |
| AUTH-0086 | Forms 8288 and 8288-A | form |
| AUTH-0087 | Forms 8288-A | form |
| AUTH-0088 | FRBP 3001 | practice-or-guidance |
| AUTH-0089 | FRED:BAMLC0A0CM | study/dataset |
| AUTH-0090 | FRED:BAMLH0A0HYM2 | study/dataset |
| AUTH-0091 | FRED:DGS10 | study/dataset |
| AUTH-0092 | FRED:DPRIME | study/dataset |
| AUTH-0093 | FRED:SOFR | study/dataset |
| AUTH-0094 | FRED:VIXCLS | study/dataset |
| AUTH-0095 | Frontier | practice-or-guidance |
| AUTH-0096 | FTC 2026 HSR - Auto-Reportable | practice-or-guidance |
| AUTH-0097 | FTC 2026 HSR - Size of Transaction | practice-or-guidance |
| AUTH-0098 | fund formation market practice | form |
| AUTH-0099 | GDPR | practice-or-guidance |
| AUTH-0100 | GENIUS Act | statute |
| AUTH-0101 | GPL | practice-or-guidance |
| AUTH-0102 | Ground Lease Lender Practice | practice-or-guidance |
| AUTH-0103 | Houlihan Lokey 2023 Transaction Termination Fee Study | study/dataset |
| AUTH-0104 | Howey | practice-or-guidance |
| AUTH-0105 | HSR Act | statute |
| AUTH-0106 | ICANN transfer rules | practice-or-guidance |
| AUTH-0107 | ICANN Transfer Rules | practice-or-guidance |
| AUTH-0108 | ILPA continuation-fund guidance | practice-or-guidance |
| AUTH-0109 | ILPA guidance | practice-or-guidance |
| AUTH-0110 | ILPA Guidance | practice-or-guidance |
| AUTH-0111 | In re Peregrine | case |
| AUTH-0112 | In re Topps | case |
| AUTH-0113 | indenture practice | practice-or-guidance |
| AUTH-0114 | Indenture Practice | practice-or-guidance |
| AUTH-0115 | Indianapolis Downs | practice-or-guidance |
| AUTH-0116 | INDOPCO | practice-or-guidance |
| AUTH-0117 | IP carve-out practice norms | practice-or-guidance |
| AUTH-0118 | IP Carve-Out Practice Norms | practice-or-guidance |
| AUTH-0119 | IP licensing industry practice | practice-or-guidance |
| AUTH-0120 | IP Licensing Industry Practice | practice-or-guidance |
| AUTH-0121 | IRC 1001 | statute |
| AUTH-0122 | IRC 1031 | statute |
| AUTH-0123 | IRC 1042 | statute |
| AUTH-0124 | IRC 1060 | statute |
| AUTH-0125 | IRC 108 | statute |
| AUTH-0126 | IRC 1202 | statute |
| AUTH-0127 | IRC 1274 | statute |
| AUTH-0128 | IRC 1274A | statute |
| AUTH-0129 | IRC 1374 | statute |
| AUTH-0130 | IRC 1445 | statute |
| AUTH-0131 | IRC 1446(f) | statute |
| AUTH-0132 | IRC 163(j) | statute |
| AUTH-0133 | IRC 195 | statute |
| AUTH-0134 | IRC 197 | statute |
| AUTH-0135 | IRC 263 | statute |
| AUTH-0136 | IRC 280G | statute |
| AUTH-0137 | IRC 336 | statute |
| AUTH-0138 | IRC 336(e) | statute |
| AUTH-0139 | IRC 338 | statute |
| AUTH-0140 | IRC 338(h)(10) | statute |
| AUTH-0141 | IRC 351 | statute |
| AUTH-0142 | IRC 355 | statute |
| AUTH-0143 | IRC 355(e) | statute |
| AUTH-0144 | IRC 368 | statute |
| AUTH-0145 | IRC 368(a)(1)(F) | statute |
| AUTH-0146 | IRC 382 | statute |
| AUTH-0147 | IRC 382(b)(1) | statute |
| AUTH-0148 | IRC 453 | statute |
| AUTH-0149 | IRC 453A | statute |
| AUTH-0150 | IRC 483 | statute |
| AUTH-0151 | IRC 4999 | statute |
| AUTH-0152 | IRC 6045 | statute |
| AUTH-0153 | IRC 704(c) | statute |
| AUTH-0154 | IRC 721 | statute |
| AUTH-0155 | IRC 754 | statute |
| AUTH-0156 | IRC 856 | statute |
| AUTH-0157 | IRC 856-860 | statute |
| AUTH-0158 | IRC 857 | statute |
| AUTH-0159 | IRC 858 | statute |
| AUTH-0160 | IRC 859 | statute |
| AUTH-0161 | IRC 860 | statute |
| AUTH-0162 | IRC 897 | statute |
| AUTH-0163 | Iron Mountain escrow templates | practice-or-guidance |
| AUTH-0164 | Iron Mountain Escrow Templates | practice-or-guidance |
| AUTH-0165 | IRS Form 8288 | form |
| AUTH-0166 | IRS Form 8288-A | form |
| AUTH-0167 | IRS Form 8288-B | form |
| AUTH-0168 | IRS Form 8594 | form |
| AUTH-0169 | J. Crew | practice-or-guidance |
| AUTH-0170 | Kendall v. Ernest Pestana 40 Cal.3d 488 | case |
| AUTH-0171 | Kendall v. Ernest Pestana, Inc., 40 Cal.3d 488 (1985) | case |
| AUTH-0172 | Klang | practice-or-guidance |
| AUTH-0173 | Kroll 2024 | study/dataset |
| AUTH-0174 | Lanham Act 10 | statute |
| AUTH-0175 | Lease Abstraction Industry Practice | practice-or-guidance |
| AUTH-0176 | lender practice | practice-or-guidance |
| AUTH-0177 | Lender Practice | practice-or-guidance |
| AUTH-0178 | lender practice norms | practice-or-guidance |
| AUTH-0179 | Letter Ruling 202308010 | practice-or-guidance |
| AUTH-0180 | LGPL | practice-or-guidance |
| AUTH-0181 | Lockton RWI reports | practice-or-guidance |
| AUTH-0182 | Lockton RWI Reports | practice-or-guidance |
| AUTH-0183 | LoPucki Bankruptcy Research Database | practice-or-guidance |
| AUTH-0184 | LSTA model AAL | practice-or-guidance |
| AUTH-0185 | LSTA model provisions | practice-or-guidance |
| AUTH-0186 | LSTA Model Provisions | practice-or-guidance |
| AUTH-0187 | Marketable-title common law | practice-or-guidance |
| AUTH-0188 | Marsh RWI reports | practice-or-guidance |
| AUTH-0189 | Marsh RWI Reports | practice-or-guidance |
| AUTH-0190 | Match Group | practice-or-guidance |
| AUTH-0191 | Matter of 105-02 Forest Hills (2025) | case |
| AUTH-0192 | MD Tax-Prop 12-117 | practice-or-guidance |
| AUTH-0193 | merger doctrine (common law) | practice-or-guidance |
| AUTH-0194 | Merger doctrine (common law) | practice-or-guidance |
| AUTH-0195 | MFW | practice-or-guidance |
| AUTH-0196 | MIT | practice-or-guidance |
| AUTH-0197 | Mitel | practice-or-guidance |
| AUTH-0198 | Moody's Ultimate Recovery Database | practice-or-guidance |
| AUTH-0199 | Morgan Lewis OSS guidance | practice-or-guidance |
| AUTH-0200 | Morgan Lewis OSS Guidance | practice-or-guidance |
| AUTH-0201 | Morse OSS guidance | practice-or-guidance |
| AUTH-0202 | Morse OSS Guidance | practice-or-guidance |
| AUTH-0203 | MPM Silicones | practice-or-guidance |
| AUTH-0204 | municipal CO ordinances | practice-or-guidance |
| AUTH-0205 | Municipal CO ordinances | practice-or-guidance |
| AUTH-0206 | N.Y. Gen. Oblig. Law 5-1311 | practice-or-guidance |
| AUTH-0207 | N.Y. Real Prop. Law 291 | practice-or-guidance |
| AUTH-0208 | Nasdaq Rule 5635 | practice-or-guidance |
| AUTH-0209 | NAV facility market practice | practice-or-guidance |
| AUTH-0210 | NAV Facility Market Practice | practice-or-guidance |
| AUTH-0211 | NIST CSF | practice-or-guidance |
| AUTH-0212 | Nixon Peabody OSS guidance | practice-or-guidance |
| AUTH-0213 | Nixon Peabody OSS Guidance | practice-or-guidance |
| AUTH-0214 | NVCA term sheet | practice-or-guidance |
| AUTH-0215 | NY assignment common law | practice-or-guidance |
| AUTH-0216 | NY Publication 576 | study/dataset |
| AUTH-0217 | NY Tax Law 1405(b)(6) | practice-or-guidance |
| AUTH-0218 | NYC Admin. Code 11-2101 | statute |
| AUTH-0219 | OBBBA 2025 | practice-or-guidance |
| AUTH-0220 | OBBBA Sec. 70301 | practice-or-guidance |
| AUTH-0221 | OBBBA Sec. 70302 | practice-or-guidance |
| AUTH-0222 | OBBBA Sec. 70425 | practice-or-guidance |
| AUTH-0223 | OBBBA Sec. 70505 | practice-or-guidance |
| AUTH-0224 | OFAC | practice-or-guidance |
| AUTH-0225 | PATH Act 2015 | statute |
| AUTH-0226 | Pepperdine PCAP 2025 | study/dataset |
| AUTH-0227 | Pluralsight | practice-or-guidance |
| AUTH-0228 | practice-norm (unanchored) | practice-norm |
| AUTH-0229 | practice-norm: lease abstraction (unanchored) | practice-norm |
| AUTH-0230 | practice-norm: real estate industry (unanchored) | practice-norm |
| AUTH-0231 | Project Finance Market Practice | practice-or-guidance |
| AUTH-0232 | project-finance market practice | practice-or-guidance |
| AUTH-0233 | RadLAX | practice-or-guidance |
| AUTH-0234 | Real Estate Industry Practice | statute |
| AUTH-0235 | real estate practice norms | statute |
| AUTH-0236 | Real Estate Practice Norms | statute |
| AUTH-0237 | Regulation (EU) 2024/1689 | practice-or-guidance |
| AUTH-0238 | Restructuring Market Practice | practice-or-guidance |
| AUTH-0239 | Rev. Proc. 2011-29 | case |
| AUTH-0240 | Rhone-Poulenc Agro v. DeKalb | case |
| AUTH-0241 | ROFR/option common law | practice-or-guidance |
| AUTH-0242 | Rule 14d-10 | practice-or-guidance |
| AUTH-0243 | Rule 14e-1 | practice-or-guidance |
| AUTH-0244 | Rutledge v. Clearway | case |
| AUTH-0245 | RWI market studies | practice-or-guidance |
| AUTH-0246 | Sabre | practice-or-guidance |
| AUTH-0247 | SBA SOP 50 10 8 | practice-or-guidance |
| AUTH-0248 | SEC climate and ESG references | practice-or-guidance |
| AUTH-0249 | SEC climate disclosure references | practice-or-guidance |
| AUTH-0250 | SEC Project Crypto | practice-or-guidance |
| AUTH-0251 | Secondary Market Practice | practice-or-guidance |
| AUTH-0252 | Securities Act 3(a)(9) | statute |
| AUTH-0253 | Serta Simmons | practice-or-guidance |
| AUTH-0254 | SRS 2025 | practice-or-guidance |
| AUTH-0255 | SRS Acquiom | practice-or-guidance |
| AUTH-0256 | SRS Acquiom 2024 | practice-or-guidance |
| AUTH-0257 | SRS Acquiom 2025 | practice-or-guidance |
| AUTH-0258 | SRS Acquiom Deal Terms Study 2024 | study/dataset |
| AUTH-0259 | SRS Acquiom Deal Terms Study 2025 | study/dataset |
| AUTH-0260 | SRS Acquiom Earnout data | practice-or-guidance |
| AUTH-0261 | SRS Acquiom Earnout Data | practice-or-guidance |
| AUTH-0262 | SRS Acquiom Working Capital PPA Study | study/dataset |
| AUTH-0263 | state ABC law | statute |
| AUTH-0264 | State ABC Law | statute |
| AUTH-0265 | State CITT Statutes | statute |
| AUTH-0266 | state employee-IP statutes | statute |
| AUTH-0267 | State Employee-IP Statutes | statute |
| AUTH-0268 | state nexus statutes | statute |
| AUTH-0269 | State Nexus Statutes | statute |
| AUTH-0270 | state title statutes | statute |
| AUTH-0271 | State Title Statutes | statute |
| AUTH-0272 | T.D. 10000 | practice-or-guidance |
| AUTH-0273 | Tex. Const. art. VIII 29 | statute |
| AUTH-0274 | Tex. Prop. Code 13.001 | statute |
| AUTH-0275 | Tex. Prop. Code 5.007 | statute |
| AUTH-0276 | Tex. Prop. Code 5.023 | statute |
| AUTH-0277 | Texas Grand Prairie | practice-or-guidance |
| AUTH-0278 | TIA 316(b) | practice-or-guidance |
| AUTH-0279 | Till | practice-or-guidance |
| AUTH-0280 | Topp | practice-or-guidance |
| AUTH-0281 | TRA market practice | practice-or-guidance |
| AUTH-0282 | Treas. Reg. 1.1060 | regulation |
| AUTH-0283 | Treas. Reg. 1.1060-1 | regulation |
| AUTH-0284 | Treas. Reg. 1.263(a)-5 | regulation |
| AUTH-0285 | Treas. Reg. 1.336-2 | regulation |
| AUTH-0286 | Treas. Reg. 1.338-6 | regulation |
| AUTH-0287 | Treas. Reg. 1.338-6(b) | regulation |
| AUTH-0288 | Treas. Reg. 1.368 | regulation |
| AUTH-0289 | Tribune | practice-or-guidance |
| AUTH-0290 | Trinseo | practice-or-guidance |
| AUTH-0291 | TX strict-match construction | statute |
| AUTH-0292 | TX strict-match ROFR construction | statute |
| AUTH-0293 | UCC 9-334 | statute |
| AUTH-0294 | UCC 9-610 | statute |
| AUTH-0295 | UCC 9-611 | statute |
| AUTH-0296 | UCC 9-615 | statute |
| AUTH-0297 | UCC Art. 6 (as retained) | statute |
| AUTH-0298 | UCC Article 9 | statute |
| AUTH-0299 | UDITPA | practice-or-guidance |
| AUTH-0300 | UFTA | practice-or-guidance |
| AUTH-0301 | UK Enterprise Act 2002 | statute |
| AUTH-0302 | UK market practice | practice-or-guidance |
| AUTH-0303 | USPTO Form PTO-1594 | form |
| AUTH-0304 | UVTA | practice-or-guidance |
| AUTH-0305 | Venture Debt Market Practice | practice-or-guidance |
| AUTH-0306 | venture-debt market practice | practice-or-guidance |
| AUTH-0307 | WA RCW 82.45 | practice-or-guidance |
| AUTH-0308 | YC SAFE | practice-or-guidance |


---


# Conformance

A conforming implementation passes the published suite: **655 cases**, of which **385 model-runtime cases** ship in this repository ([`cases/model-runtime.cases.json`](cases/model-runtime.cases.json), MIT).

## Case format

```json
{
  "case_id": "string — stable identifier",
  "title": "string",
  "specVersion": "string — spec version the case targets",
  "modelId": "string — the reference-binding id (see each model page §10)",
  "input": "object — the model input record",
  "expect": {
    "status": "complete | needs_inputs",
    "outputs": "object — expected output fields (subset match, exact values)",
    "missingInputsIncludes": "string[] — required missing-input names"
  }
}
```

## Harness contract

An implementation exposes `execute(modelId, input) -> { status, outputs, missingInputs }`. The harness loads the case files, executes each case, and asserts: (1) `status` matches; (2) every field in `expect.outputs` matches exactly (deep equality; monetary values integer-cents); (3) every name in `expect.missingInputsIncludes` appears in `missingInputs`. All cases MUST pass; there is no partial conformance.

## Requirements

Each Normative model carries requirement `REQ-<slot>` (its I/O contract, worked example, and error semantics — verified by its bound cases, listed on the model page). Each professional-determination boundary carries `REQ-DTC-*` (the implementation routes, never answers — verified by boundary cases asserting `defer_to_counsel: true` outputs).

- `REQ-M109` — Working capital peg conforms to its published contract (2 case(s))
- `REQ-M111` — Revenue earnout conforms to its published contract (1 case(s))
- `REQ-M112` — EBITDA earnout conforms to its published contract (1 case(s))
- `REQ-M119` — SBA 7(a) post-SOP 50 10 8 conforms to its published contract (2 case(s))
- `REQ-M128` — HSR reportability conforms to its published contract (2 case(s))
- `REQ-M139` — 1060 seven-class allocation conforms to its published contract (2 case(s))
- `REQ-M146` — Cap-table waterfall conforms to its published contract (1 case(s))
- `REQ-M148` — Three-prong solvency conforms to its published contract (2 case(s))
- `REQ-M151` — 363 asset sale mechanics conforms to its published contract (2 case(s))
- `REQ-M152` — Plan feasibility conforms to its published contract (2 case(s))
- `REQ-M153` — Best-interests-of-creditors conforms to its published contract (2 case(s))
- `REQ-M154` — Absolute priority rule and new value conforms to its published contract (2 case(s))
- `REQ-M155` — Cramdown interest rate conforms to its published contract (2 case(s))
- `REQ-M156` — 1111(b) election trade-off conforms to its published contract (2 case(s))
- `REQ-M157` — 726 Chapter 7 waterfall conforms to its published contract (2 case(s))
- `REQ-M158` — 364 DIP sizing conforms to its published contract (2 case(s))
- `REQ-M159` — Fulcrum security conforms to its published contract (2 case(s))
- `REQ-M160` — Exchange offer and distressed-debt exchange conforms to its published contract (2 case(s))
- `REQ-M164` — RSA economics conforms to its published contract (2 case(s))
- `REQ-M165` — ABC and Article 9 foreclosure recovery conforms to its published contract (2 case(s))
- `REQ-M166` — Claims trading recovery conforms to its published contract (2 case(s))
- `REQ-M167` — Subchapter V eligibility conforms to its published contract (2 case(s))
- `REQ-M168` — Chapter 22 recidivism score conforms to its published contract (2 case(s))
- `REQ-M169` — FIRPTA withholding conforms to its published contract (2 case(s))
- `REQ-M170` — 1031 like-kind exchange timing conforms to its published contract (2 case(s))
- `REQ-M171` — Sale-leaseback and ASC 842 conforms to its published contract (2 case(s))
- `REQ-M172` — REIT 75/75/90 compliance triad conforms to its published contract (2 case(s))
- `REQ-M177` — LP-secondary plus ECI withholding conforms to its published contract (2 case(s))
- `REQ-M178` — Strip-sale pricing conforms to its published contract (2 case(s))
- `REQ-M179` — NAV facility LTV conforms to its published contract (2 case(s))
- `REQ-M180` — Convertible and SAFE conversion conforms to its published contract (2 case(s))
- `REQ-M181` — Venture-debt warrant coverage conforms to its published contract (2 case(s))
- `REQ-M182` — ABL borrowing base conforms to its published contract (2 case(s))
- `REQ-M183` — Make-whole and call protection conforms to its published contract (2 case(s))
- `REQ-M184` — Covenant basket engine conforms to its published contract (2 case(s))
- `REQ-M185` — 280G golden parachute conforms to its published contract (2 case(s))
- `REQ-M186` — 382 NOL limitation conforms to its published contract (2 case(s))
- `REQ-M187` — RE-heavy asset-vs-entity election conforms to its published contract (2 case(s))
- `REQ-M188` — RE/operating-business purchase price bifurcation conforms to its published contract (2 case(s))
- `REQ-M189` — Rent-roll normalization engine conforms to its published contract (2 case(s))
- `REQ-M190` — NOI normalization and cap-rate bridge conforms to its published contract (2 case(s))
- `REQ-M191` — Real estate transfer and controlling-interest tax conforms to its published contract (2 case(s))
- `REQ-M192` — CAM reconciliation mechanics conforms to its published contract (2 case(s))
- `REQ-M193` — Lease abstraction schema conforms to its published contract (2 case(s))
- `REQ-M194` — OpCo/PropCo separation mechanics conforms to its published contract (2 case(s))
- `REQ-M195` — Property-level escrow and holdback sizing conforms to its published contract (2 case(s))
- `REQ-M196` — Title and survey process checklist conforms to its published contract (2 case(s))
- `REQ-M197` — Ground lease vs. fee simple mechanics conforms to its published contract (2 case(s))
- `REQ-M198` — PCA reserve modeling conforms to its published contract (2 case(s))
- `REQ-M199` — FIRPTA withholding v1.1 conforms to its published contract (2 case(s))
- `REQ-M200` — Transaction tax master engine conforms to its published contract (2 case(s))
- `REQ-M201` — 338(h)(10) and 336(e) gross-up math conforms to its published contract (2 case(s))
- `REQ-M202` — 1374 built-in gains tax conforms to its published contract (2 case(s))
- `REQ-M203` — Transaction cost capitalization conforms to its published contract (2 case(s))
- `REQ-M204` — Imputed interest, OID, and 453A conforms to its published contract (2 case(s))
- `REQ-M205` — SALT transaction engine conforms to its published contract (2 case(s))
- `REQ-M206` — Indemnification ladder engine conforms to its published contract (2 case(s))
- `REQ-M207` — Survival period engine conforms to its published contract (2 case(s))
- `REQ-M208` — Escrow and holdback sizing conforms to its published contract (2 case(s))
- `REQ-M209` — RWI stack architecture conforms to its published contract (2 case(s))
- `REQ-M210` — Closing-statement true-up sequence conforms to its published contract (2 case(s))
- `REQ-M211` — Conditions-to-close logic engine conforms to its published contract (2 case(s))
- `REQ-M212` — Termination and break/reverse-break fee engine conforms to its published contract (2 case(s))
- `REQ-M213` — Earnout architecture and dispute conforms to its published contract (2 case(s))
- `REQ-M214` — IP chain-of-title verification conforms to its published contract (2 case(s))
- `REQ-M215` — IP encumbrance and lien search conforms to its published contract (2 case(s))
- `REQ-M216` — License in/out dependency map conforms to its published contract (2 case(s))
- `REQ-M217` — Standard IP representation set conforms to its published contract (2 case(s))
- `REQ-M218` — Carve-out and license-back mechanics conforms to its published contract (2 case(s))
- `REQ-M219` — Source-code and IP escrow mechanics conforms to its published contract (2 case(s))
- `REQ-M220` — Employee IP assignment verification conforms to its published contract (2 case(s))
- `REQ-M221` — OSS exposure diligence process conforms to its published contract (2 case(s))
- `REQ-M222` — IP-specific 1060 allocation conforms to its published contract (2 case(s))
- `REQ-M223` — Domain and trademark transfer mechanics conforms to its published contract (2 case(s))
- `REQ-M224` — Recording-act and priority engine conforms to its published contract (25 case(s))
- `REQ-M225` — Title-covenant and estate/signatory model conforms to its published contract (22 case(s))
- `REQ-M226` — Marketability triage conforms to its published contract (15 case(s))
- `REQ-M227` — Risk-of-loss allocator conforms to its published contract (12 case(s))
- `REQ-M228` — Survival and merger tracker conforms to its published contract (15 case(s))
- `REQ-M229` — Lease anti-assignment and change-of-control parser conforms to its published contract (24 case(s))
- `REQ-M230` — Due-on-sale screener conforms to its published contract (12 case(s))
- `REQ-M231` — Option/ROFR/ROFO trigger detector conforms to its published contract (15 case(s))
- `REQ-M232` — Controlling-interest transfer-tax and reassessment screener conforms to its published contract (18 case(s))
- `REQ-M233` — Permit/CO transferability and bulk-sales screener conforms to its published contract (13 case(s))
- `REQ-M234` — Fixture classification and UCC 9-334 priority conforms to its published contract (12 case(s))
- `REQ-DTC-RE-01` — implementations MUST route, not answer: Any request to judge whether title is marketable or whether a defect is fatal.
- `REQ-DTC-RE-02` — implementations MUST route, not answer: Any request to opine on enforceability of any clause (liquidated damages, anti-assignment, consent standard, survival, option/ROFR, due-on-sale).
- `REQ-DTC-RE-03` — implementations MUST route, not answer: Any drafting of a transaction document (PSA, deed, lease, SNDA, estoppel as an instrument, title instrument, guaranty).
- `REQ-DTC-RE-04` — implementations MUST route, not answer: Any conclusion about whether a specific transfer legally triggers transfer tax, reassessment, due-on-sale, a preemptive right, or a deemed assignment.
- `REQ-DTC-RE-05` — implementations MUST route, not answer: Any question about whether a covenant of title has been breached or what remedy lies.
- `REQ-DTC-RE-06` — implementations MUST route, not answer: Any recommendation on deal structure to achieve a legal/tax result (carve-out, F-reorg, drop-down).
- `REQ-DTC-RE-07` — implementations MUST route, not answer: Any adverse-possession, boundary, quiet-title, or easement-scope dispute.
- `REQ-DTC-RE-08` — implementations MUST route, not answer: Any bulk-sales/successor-liability or CERCLA successor determination.
- `REQ-DTC-RE-09` — implementations MUST route, not answer: Any zoning/entitlement compliance or nonconforming-use continuation opinion.
- `REQ-DTC-RE-10` — implementations MUST route, not answer: Any interpretation of ambiguous contract language or resolution of a conflict between the contract and the deed.
