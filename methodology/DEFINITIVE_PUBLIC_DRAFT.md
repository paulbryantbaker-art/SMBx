<!-- GENERATED — do not hand-edit; regenerate via scripts/build-definitive-public.ts. Governance/gate: dist/definitive-internal/. -->

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

**At a glance:** **134 model slots mapped** · **85 implementable from this document today** · 0 normative scheduled (authoring by family) · 47 catalog · 2 reserved · **30-gate routing framework** (17 routed; 3 specified) · **262 authority anchors** (as referenced) · **655-case conformance suite** (385 model-runtime).

The specification publishes at two maturity tiers, labeled on every entry and
in the index. **Normative** entries carry the full contract — input and output
schemas, algorithm, worked example, error semantics, and conformance
bindings — and each carries its contract in full; entries marked **implementable from this document alone** have a complete authored contract today, while the remainder are being authored family by family (see the changelog). **Catalog** entries
are informative maps of scope, boundary, routing, and authorities whose
normative contracts are scheduled. The breadth claim (134 slots
mapped) and the rigor claim (85 implementable from
this document today) are distinct claims, made separately and never blurred —
the second number leads, and it climbs family by family in public.

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

# Conventions

These conventions are normative and global. Every model contract in this
specification is read subject to them; per-entry notes reference this chapter
rather than restating divergent rules.

## Monetary values

All monetary values are integer cents — a whole number of United States cents.
Implementations MUST represent money as integers, never floating-point dollars.
A field whose name ends in `_cents` carries integer cents.

## Dates

All dates are ISO-8601 strings (`YYYY-MM-DD`).

## Jurisdictions

United States jurisdictions are two-letter state codes (`NY`, `CA`, `TX`,
`DE`). Where a model reads a jurisdictional data table and the supplied
jurisdiction is not tabled, the implementation MUST surface an explicit
table-gap and route to the appropriate professional — it MUST NOT guess a rule.

## Numeric precision

This is the single global rounding rule; every "see the Conventions chapter"
precision note refers here.

- **Monetary outputs** are exact integer cents.
- **Rates and ratios** — coverage ratios (DSCR), returns (IRR, MOIC),
  ownership and equity percentages, cap rates, and the like — are rounded
  **half to even** (banker's rounding) to **four (4) decimal places**, at the
  **output boundary only**. Intermediate values are carried at full precision;
  rounding is applied once, when the output is produced.
- **Dates** are ISO-8601 as above.

Half-to-even means a value exactly halfway between two representable results
rounds to the one whose last retained digit is even (0.00005 → 0.0000;
0.00015 → 0.0002). This single rule lets an independent implementation
reproduce every published expected value from the rule alone, with no shared
rounding code — which is the property the conformance suite depends on.

## Live (pass-through) constants

Some constants are live data supplied at runtime with an `asof` timestamp
rather than fixed in the specification — HSR thresholds, applicable federal
rates, the IRS long-term tax-exempt rate, published market-data series. These
are marked `pass-through (live data)` in a model's constants table and carry
no static value; a conforming implementation supplies the current figure and
records the `asof` date in its audit payload.


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

The designed field vocabulary used by model input and output contracts and by gate predicates. Each field carries an authored type and description; enumerated fields carry their values (below). This is the specification's vocabulary, not a usage report.

**Conventions (normative):** monetary values are integer cents; percentages are numbers on a 0–100 scale unless the field name ends in \_pct as a fraction; rates are 0–1; dates are ISO-8601 strings; US jurisdictions are two-letter state codes.

| Field | Type | Description |
|---|---|---|
| `absolute_priority_issue_count` | integer | Number of absolute-priority issues found. |
| `absolute_priority_issues` | object[] | Per-issue detail: `{ senior_class_name, senior_recovery_pct, junior_value_cents }`. |
| `abstraction_rows` | object[] | Per-lease detail: `{ tenant, annual_rent_cents, expiry_date, months_remaining, assignment_consent_required, change_of_control_consent_required, renewal_options_count, exclusive_use, co_tenancy, go_dark }`. |
| `acceleration_risk` | enum(acceleration_risk) | The lender's acceleration posture. |
| `acceleration_trigger_count` | integer | Number of acceleration triggers. |
| `acceleration_triggers` | string[] | Events that accelerate the earnout (e.g., change of control, termination without cause). |
| `accounting_arbitrator_selected` | boolean | Whether the forum is an accounting arbitrator. |
| `accounting_review_flags` | string[] | Standing accountant-review note on ASC 842 sale and lease classification. |
| `act_type` | enum(recording_act_type) | The recording-act family applied. |
| `actual_nwc_cents` | integer (cents) | Actual net working capital per the final closing statement. |
| `actual_statement_due_date` | string (ISO date) | Deadline to deliver the actual closing statement. |
| `actual_statement_due_days` | integer | Days after closing to deliver the actual statement; defaults to the cited median. |
| `affiliate_of_public_issuer` | boolean | Whether the debtor is an affiliate of an SEC issuer (default false); a disqualifier. |
| `afr_rate` | number | The applicable federal rate for the term, as a fraction; supplied at runtime. |
| `after_acquired_title_applies` | boolean | Whether estoppel-by-deed vests later-acquired title in the grantee. |
| `aggregate_escrow_cents` | integer (cents) | Total cash held back across all escrows. |
| `aggregate_face_test_passed` | boolean | Whether aggregate payments meet or exceed the allowed claim. |
| `aggregate_noncontingent_liquidated_debt_cents` | integer (cents) | Aggregate noncontingent, liquidated debt. |
| `aggregate_remaining_capacity_cents` | integer (cents) | Sum of remaining capacity across all baskets. |
| `aggregation_window_months` | integer | null | The controlling-interest aggregation window in months, or null. |
| `aggregation_years` | integer | null | The acting-in-concert aggregation window in years, or null. |
| `agpl_network_count` | integer | Number of AGPL components used over a network. |
| `all_classes_meet_support_thresholds` | boolean | Whether every class clears the thresholds. |
| `all_classes_pass_best_interests` | boolean | Whether every class passes the best-interests test. |
| `all_contributors_papered` | boolean | Whether every contributor has both the assignment and the work-for-hire. |
| `all_prongs_passed` | boolean | Whether all three prongs pass. |
| `all_required_signers_present` | boolean | Whether every party the vesting form requires is on the signature page; explicit false raises a signatory gap. |
| `all_tests_passed` | boolean | Whether all three tests pass. |
| `allocated_cents` | integer (cents) | Total amount allocated across the classes. |
| `allocations` | object[] | Per-class schedule: `{ class_number, class_name, fair_market_value_cents, allocated_cents, capped_at_fmv }`. |
| `allowed_claim_cents` | integer (cents) | The creditor's total allowed claim. |
| `alta_endorsements_requested` | string[] | ALTA endorsements requested (counted). |
| `alta_endorsements_requested_count` | integer | Number of ALTA endorsements requested. |
| `amortizable_195_cents` | integer (cents) | Total §195-amortizable. |
| `amount_realized_cents` | integer (cents) | The amount realized by the seller (the FIRPTA withholding base). |
| `annual_debt_service_cents` | integer (cents) | Annual principal-and-interest debt service on the acquisition debt. |
| `annual_ground_rent_cents` | integer (cents) | Annual ground rent. |
| `annual_master_lease_rent_cents` | integer (cents) | Override master-lease rent; defaults to value × cap rate. |
| `annual_rent_cents` | integer (cents) | Annual leaseback rent. |
| `annual_royalty_cents` | integer (cents) | Total annual royalty across all licenses. |
| `annual_section_382_limitation_cents` | integer (cents) | The annual §382 limitation on pre-change NOL use. |
| `annual_tenant_share_cents` | integer (cents) | The tenant's full-period share. |
| `antitrust_reverse_fee_cents` | integer (cents) | The antitrust reverse fee in cents. |
| `antitrust_reverse_fee_pct` | number | Override for the antitrust reverse fee as a fraction of value; defaults to the cited median. |
| `apportioned_gain_cents` | integer (cents) | Gain apportioned to the state. |
| `apr_clear_under_inputs` | boolean | Whether the plan clears the absolute priority rule under the inputs. |
| `ar_advance_rate` | number | Advance rate against eligible A/R as a fraction; defaults to the market-standard rate. |
| `area_occupancy_pct` | number | null | Occupied area ÷ total area, or null. |
| `article9_notice_floor_days` | integer | The Article 9 notice floor. |
| `as_of_date` | string (ISO date) | The as-of date used to compute months remaining from lease-expiry dates. |
| `asc842_indicator_classification` | enum(asc842_classification) | Whether any finance-lease indicator is present. |
| `asset_75_pct` | number | Real-estate assets as a fraction of total assets. |
| `asset_75_test_passed` | boolean | Whether the 75% asset test passes. |
| `asset_classes` | object[] | The asset classes with fair market values; each object carries `class_number` (1–7), `class_name` (string), and `fair_market_value_cents` (integer cents). |
| `asset_count` | integer | Number of IP assets in the carve-out. |
| `asset_deal_buyer_basis_cents` | integer (cents) | Buyer basis in an asset deal (the enterprise value). |
| `asset_rows` | object[] | Per-asset detail: `{ asset_name, disposition, assigned_to_buyer, licensed_to_buyer, licensed_back_to_seller, transition_license_months }`. |
| `assets` | object[] | IP assets under diligence; each object carries `name` (string), `type` (string, e.g. patent/trademark/copyright), `assignment_count` (integer), `current_owner_matches` (boolean), `recorded_within_three_months` (boolean), `contributor_assignments_complete` (boolean), and, for trademarks, `itu_assigned_after_allegation_of_use` (boolean). |
| `assigned_to_buyer_count` | integer | Number assigned outright to the buyer. |
| `assignee_fee_cents` | integer (cents) | Assignee/foreclosure fee (default 0). |
| `assignment_consent_required_count` | integer | Number requiring assignment consent. |
| `assignment_gap_count` | integer | Number with a broken or unmatched assignment chain. |
| `auth_code_required_count` | integer | Number of assets needing a registrar auth code. |
| `auto_reportable_cents` | integer (cents) | The current HSR auto-reportable ceiling, in cents. |
| `availability_cents` | integer (cents) | Drawable availability after the commitment cap. |
| `available_capital_cents` | integer (cents) | Capital available to the business. |
| `balance_sheet_prong_passed` | boolean | Whether the balance-sheet prong passes. |
| `balance_sheet_surplus_cents` | integer (cents) | Assets less liabilities. |
| `bargain_purchase_option` | boolean | Whether the lessee holds a bargain purchase option (default false). |
| `base_amount_cents` | integer (cents) | The executive's §280G base amount (five-year average W-2 compensation). |
| `base_rate` | number | The Till base rate (e.g., prime), as a fraction. |
| `basis` | enum(risk_basis) | The basis for the allocation. |
| `basis_at_conversion_cents` | integer (cents) | Tax basis of assets at conversion. |
| `basket_cents` | integer (cents) | The basket threshold in cents. |
| `basket_count` | integer | Number of baskets evaluated. |
| `basket_pct` | number | Override for the basket as a fraction of value; defaults to the cited median. |
| `basket_type` | enum(basket_type) | Override for how the basket operates; defaults by RWI posture. |
| `baskets` | object[] | Covenant baskets; each object carries `name`/`type` (strings) and integer-cents `fixed_capacity_cents` (or `opening_capacity_cents`), `grower_basis_cents`, `builder_amount_cents`, `ratio_capacity_cents`, `used_cents`, and `proposed_use_cents`, plus a `grower_pct` (number). |
| `bfp_protected` | boolean | Whether the later purchaser takes free of the prior interest as a protected bona-fide purchaser. |
| `blocked_basket_count` | integer | Number of baskets whose proposed use exceeds remaining capacity. |
| `boot_received_cents` | integer (cents) | Non-like-kind consideration received (default 0). |
| `breakeven_gross_up_cents` | integer (cents) | null | The grossed-up amount that makes the seller whole, or null. |
| `breakup_fee_cents` | integer (cents) | Stalking-horse break-up fee (default 0). |
| `breakup_fee_pct_of_purchase_price` | number | null | Break-up fee as a fraction of price, or null. |
| `bright_line_date` | string (ISO date) | The bright-line date (the earlier of the LOI and board approval); costs on or after it are facilitative. |
| `broker_handoff_required` | boolean | Always true — binding terms route to the broker/underwriter. |
| `build_verified` | boolean | Whether the deposit was at least build-verified. |
| `bulk_sale_clearance_required` | boolean | Whether a bulk-sale tax clearance is required (default false). |
| `bulk_sales_citations` | string[] | Per-state bulk-sales citations for the applicable states. |
| `bulk_sales_notification_states` | string[] | Applicable bulk-sales notification states. |
| `buyer_asset_basis_cents` | integer (cents) | null | Buyer asset basis for asset/deemed-asset forms, else null. |
| `buyer_equity_cents` | integer (cents) | Buyer equity injection into the transaction. |
| `buyer_equity_pct` | number | Buyer equity as a fraction of purchase price (0–1). |
| `buyer_expects_warranty` | boolean | Whether the buyer is negotiating for title warranties (default true); drives the warranty-gap flag. |
| `buyer_net_benefit_after_gross_up_cents` | integer (cents) | null | Buyer benefit net of the gross-up, or null. |
| `buyer_receivable_cents` | integer (cents) | Amount owed to the buyer when NWC lands below the peg. |
| `buyer_step_up_cents` | integer (cents) | Step-up an asset deal delivers over the carried basis. |
| `buyer_step_up_pv_benefit_cents` | integer (cents) | Present-value benefit of the step-up at the supplied rate. |
| `buyer_will_use_as_residence` | boolean | Whether the buyer will use the property as a residence (default false); opens the exemption and reduced-rate paths. |
| `california_2870_carveout_count` | integer | Number with a California §2870 outside-scope carve-out flag. |
| `call_price_pct` | number | Stated call price as a fraction of par (default 1 = par). |
| `cap_price_cents` | integer (cents) | null | The cap-implied per-share price, or null when the cap or share count is absent. |
| `cap_rate` | number | Implied cap rate: annual rent ÷ sale price. |
| `capital_adequacy_prong_passed` | boolean | Whether the capital-adequacy prong passes. |
| `capital_adequacy_surplus_cents` | integer (cents) | Available less required capital. |
| `capitalized_cents` | integer (cents) | Total capitalized. |
| `cash_flow_cents` | integer (cents) | Post-acquisition annual free cash flow available for debt service. |
| `cash_flow_prong_passed` | boolean | Whether the cash-flow prong passes. |
| `cash_flow_sensitivity_cases` | object[] | Downside cases: `{ cash_flow_change_pct, minimum_dscr, dscr_floor_passed }` for −10% and −20%. |
| `cash_flow_surplus_cents` | integer (cents) | Projected cash flow less debts due. |
| `cash_interest_rate` | number | Annual cash coupon as a fraction (default 0). |
| `cause_to_deny_credit_bid` | boolean | Whether cause exists to deny the credit bid (default false). |
| `cercla_linked_property` | boolean | Whether the property has a CERCLA/environmental linkage (default false). |
| `cercla_successor_flag` | boolean | Whether CERCLA successor liability is flagged. |
| `chain_rows` | object[] | Per-asset detail: `{ name, type, assignment_count, current_owner_matches, recorded_within_three_months, contributor_assignments_complete, assignment_gap, late_recording_flag, contributor_gap, itu_assignment_risk }`. |
| `change_of_control_consent_required_count` | integer | Number requiring change-of-control consent. |
| `chapter22_recidivism_score` | integer | The 0–100 recidivism score. |
| `characterization` | enum(imputed_interest_characterization) | Which imputed-interest regime the term routes to. |
| `circuit` | string | The federal circuit (e.g., 2d, 5th, 6th, 8th); selects the framework. |
| `citation` | string | The statutory citation for the state's recording act. |
| `citt_screen_triggered` | boolean | Whether the controlling-interest transfer-tax screen fires. |
| `claims` | object[] | Claim classes; each carries `class_name` (string), `priority_rank` (integer), and `allowed_claim_cents` (integer cents). |
| `class_count` | integer | Number of creditor classes. |
| `class_rows` | object[] | Per-class detail: `{ class_name, allowed_claim_cents, plan_distribution_cents, chapter7_distribution_cents, plan_recovery_pct, chapter7_recovery_pct, best_interests_shortfall_cents, best_interests_passed }`. |
| `class_v_real_property_and_tangible_cents` | integer (cents) | Class V real property and tangible allocation. |
| `class_v_tangible_assets_cents` | integer (cents) | Amount allocated to Class V tangible assets. |
| `class_v_tangible_cents` | integer (cents) | Amount allocated to Class V tangible/§1231 assets. |
| `class_vi_intangibles_cents` | integer (cents) | Identified Class VI §197 intangible value (default 0). |
| `class_vi_ip_section_197_intangibles_cents` | integer (cents) | Amount allocated to Class VI §197 IP intangibles. |
| `class_vi_section_197_intangibles_cents` | integer (cents) | Amount allocated to Class VI §197 intangibles (excluding goodwill). |
| `class_vii_goodwill_cents` | integer (cents) | Residual allocated to Class VII goodwill and going-concern value. |
| `class_vii_goodwill_going_concern_cents` | integer (cents) | Class VII goodwill/going-concern residual. |
| `class_vote_amount_pct` | number | Class support by amount, as a fraction; optional. |
| `class_vote_number_pct` | number | Class support by number, as a fraction; optional. |
| `classes` | object[] | Plan classes; each carries `class_name` (string), `priority_rank` (integer), `allowed_claim_cents`, `plan_distribution_cents` (integer cents), `impaired` (boolean), and `accepted` (boolean). |
| `classification` | enum(lease_classification) | How the transfer classifies against the restriction. |
| `cleansing_vote_passed` | boolean | null | Whether the supplied vote exceeds the threshold, or null when no vote is supplied. |
| `cleansing_vote_threshold_pct` | number | The disinterested-shareholder approval threshold (0.75). |
| `closing_date` | string (ISO date) | The closing date; dates the Form 8288 deadline. |
| `closing_day_of_period` | number | Day of the period at closing, for proration (default 0). |
| `closing_protection_letter_required` | boolean | Whether a closing-protection letter is required (default true). |
| `closing_ready` | boolean | Whether no condition blocks closing. |
| `closing_true_up_cents` | integer (cents) | Prorated share less payments (positive = owed by tenant; negative = credit). |
| `co_required_on_transfer` | boolean | Whether a certificate of occupancy must be re-issued on this transfer. |
| `co_tenancy_count` | integer | Number with a co-tenancy clause. |
| `coc_default_note` | string | null | The change-of-control default note when a control transfer is not deemed an assignment, else null. |
| `codi_exposure_cents` | integer (cents) | Cancellation-of-debt income exposure. |
| `collateral_npv_test_passed` | boolean | Whether the payment-stream NPV meets or exceeds the collateral value. |
| `collateral_value_cents` | integer (cents) | Value of the collateral (the secured portion). |
| `combined_seller_tax_rate` | number | Combined federal-plus-state seller rate. |
| `commercially_reasonable_sale` | boolean | Whether the sale is asserted commercially reasonable; echoed for counsel. |
| `commitment_cents` | integer (cents) | Facility commitment cap; when supplied, availability is capped at it. |
| `component_count` | integer | Number of OSS components. |
| `components` | object[] | OSS components; each object carries `name` (string), `license` (string, e.g. MIT/LGPL-2.1/AGPL-3.0), `network_use` (boolean), `proprietary_linking` (boolean), and `remediation_cost_cents` (integer cents). |
| `condition_count` | integer | Total number of conditions. |
| `condition_nodes` | object[] | Per-condition detail: `{ name, type, satisfied, waived, blocks_closing, professional_review_required }`. |
| `conditions` | object[] | Closing conditions; each object carries `name` (string), `type` (a condition_type value), `satisfied` (boolean), and `waived` (boolean). |
| `consent_clause` | enum(consent_clause) | The lease consent provision as parsed. |
| `consent_required` | boolean | Whether landlord consent is required for the transfer. |
| `consent_standard` | enum(consent_standard) | The governing consent standard when consent is required, else null. |
| `consent_standard_citation` | string | null | Citation for the state default when the clause states no standard, else null. |
| `consideration_mix` | object | The consideration split: integer-cents `cash_cents`, `seller_note_cents`, `stock_cents`, `earnout_cents`, `rollover_cents`. |
| `construction_mortgage` | boolean | Whether the prior interest is a construction mortgage (default false); triggers the § 9-334(h) override. |
| `contested_nexus_position` | boolean | Whether a contested nexus position is present (default false). |
| `contested_state_position_handoff_required` | boolean | True when the state is untabled and no rate was supplied. |
| `contract_allocates_risk` | boolean | Whether the purchase contract expressly allocates pre-closing casualty risk. |
| `contract_override_applied` | boolean | Whether an express contract allocation controls. |
| `contract_risk_on` | enum(contract_risk_on) | The party the contract places risk on, when it allocates. |
| `contract_title_standard` | enum(contract_title_standard) | The title standard the purchase contract promises (default marketable). |
| `contributor_assignment_gap_count` | integer | Number with incomplete contributor assignments. |
| `contributor_count` | integer | Number of contributors verified. |
| `contributor_rows` | object[] | Per-contributor detail: `{ contributor, role, state, ip_assignment_executed, work_for_hire_executed, missing_assignment, missing_work_for_hire, california_2870_carveout_flag }`. |
| `contributors` | object[] | IP contributors; each object carries `name` (string), `role` (string), `state`/`work_state` (US state code), `ip_assignment_executed` (boolean), `work_for_hire_executed` (boolean), and `outside_scope_invention` (boolean). |
| `controlling_interest_threshold_pct` | number | null | The controlling-interest threshold for the state, or null. |
| `conversion_date` | string (ISO date) | The S-election conversion date. |
| `conversion_driver` | enum(conversion_driver) | Which term produced the governing conversion price. |
| `conversion_price_cents` | integer (cents) | The governing (lowest) conversion price per share. |
| `converted_share_count` | number | Shares the investment converts into at the conversion price. |
| `copyright_asset_count` | integer | Number typed as copyrights. |
| `copyright_security_hit_count` | integer | Total Copyright-Office-track hits. |
| `corporate_tax_rate` | number | Corporate tax rate as a fraction; defaults to the federal corporate rate. |
| `cost_count` | integer | Number of costs classified. |
| `cost_to_cure_escrow_cents` | integer (cents) | Total cost-to-cure escrow. |
| `counsel_and_tax_handoff_required` | boolean | Always true — binding legal and tax calls route to the specialists. |
| `counsel_drafting_handoff_required` | boolean | Always true — the assignment and license documents are drafted by counsel. |
| `counsel_drafting_required` | boolean | Always true — the reps are drafted by counsel. |
| `counsel_handoff` | string | null | The routing sentence when a signatory gap defers, else null. |
| `counsel_review_flags` | string[] | Items counsel must confirm (limitations period, fraud definition, RWI interaction). |
| `counsel_review_required` | boolean | Always true — the CODI and holdout analysis routes to counsel. |
| `coupon_rate` | number | Annual coupon rate as a fraction (e.g., 0.08). |
| `court_approval_required` | boolean | Always true — the sale requires court approval. |
| `court_determination_required` | boolean | Always true — APR compliance is a court determination. |
| `court_sets_final_rate` | boolean | Always true — the court sets the final rate. |
| `covenant_scope` | string | Whether covenants reach all defects or only the grantor's own acts, or none. |
| `covenants_present` | string[] | The title covenants this deed conveys (empty for bargain-and-sale and quitclaim). |
| `credit_bid_claim_cents` | integer (cents) | Secured claim available to credit bid (default 0). |
| `credit_bid_eligible` | boolean | Whether the secured creditor may credit bid. |
| `creditor_classes` | object[] | Creditor classes; each carries `class_name` (string), `allowed_claim_cents`, `plan_distribution_cents`, and `chapter7_distribution_cents` (integer cents). |
| `cumulative_related_transfers_pct` | number | Cumulative percentage transferred across related steps within the aggregation window (0–100); defaults to transfer_pct. |
| `curable_count` | integer | Number of exceptions triaged curable. |
| `curative_cost_to_cure_cents` | integer (cents) | Total cost to cure the curative items. |
| `curative_item_count` | integer | Number of curative items. |
| `curative_items` | object[] | Curative items; each carries `item` (string), `status` (string), and `cost_to_cure_cents` (integer cents). |
| `curative_rows` | object[] | Per-curative-item detail: `{ item, status, cost_to_cure_cents, open }`. |
| `current_threshold_handoff_note` | string | Note that the reverted limit is used unless overridden. |
| `cushion_pct` | number | Equity cushion: 1 − LTV. |
| `cushion_requirement_satisfied` | boolean | Whether the cushion meets or exceeds the required minimum. |
| `deal_form` | string | The transaction form (e.g., asset_sale, stock_sale, merger, 338h10); drives basis and sub-model routing. |
| `deal_killing_count` | integer | Number triaged deal-killing (unmarketable and uninsurable). |
| `deal_type` | string | The transaction type (e.g., asset_purchase, stock_purchase, merger). |
| `debt_assumability` | enum(debt_assumability) | Whether property debt is assumable, needs consent/refinance, or was not supplied. |
| `debt_assumable` | boolean | Whether existing property debt is assumable; drives debt_assumability. |
| `debt_limit_cents` | integer (cents) | Override for the debt limit; defaults to the reverted statutory limit. |
| `debt_limit_satisfied` | boolean | Whether the debt is within the limit. |
| `debts_due_cents` | integer (cents) | Debts coming due over the projection. |
| `deductible_cents` | integer (cents) | Total currently deductible. |
| `deed_note` | string | Plain-language description of the deed's covenant coverage. |
| `deed_type` | enum(deed_type) | The deed instrument type being conveyed. |
| `default_regime` | enum(risk_basis) | The state default regime that would govern absent a contract term. |
| `defer_to_counsel` | boolean | True only when the state is untabled; the ordering then defers. |
| `deferred_or_rollover_consideration_cents` | integer (cents) | Rollover/deferred consideration. |
| `deficiency_claim_cents` | integer (cents) | The deficiency (claim over collateral). |
| `deposit_verification_tier` | string | How deeply the deposit was verified (e.g., inventory-only, build-verified, build-and-run-tested). |
| `disclosure_statement_exhibit_handoff_required` | boolean | Always true — the liquidation-analysis exhibit routes to counsel. |
| `discount_pct` | number | The conversion discount as a fraction (0–1); default 0 (no discount). |
| `discount_price_cents` | integer (cents) | The discounted per-share price. |
| `discount_rate` | number | The annual discount rate applied to the expected value (a fraction, e.g. 0.12). |
| `discount_to_nav_pct` | number | null | Discount (positive) or premium (negative) to NAV, or null when NAV is non-positive. |
| `disposition_months` | number | Length of the disposition window in months; drives the §336(e) test. |
| `disposition_pct` | number | Fraction of stock disposed; drives the §336(e) test. |
| `dispute_forum` | enum(dispute_forum) | The forum designated to resolve earnout disputes; defaults to the accounting arbitrator. |
| `dispute_notice_days` | integer | Days after the statement to notice a dispute; defaults to the cited median. |
| `dispute_notice_due_date` | string (ISO date) | Deadline to notice a dispute. |
| `distributable_estate_cents` | integer (cents) | Estate net of the trustee fee. |
| `distributable_value_cents` | integer (cents) | Proceeds net of fee and costs. |
| `distribution_90_pct` | number | Distributions as a fraction of taxable income. |
| `distribution_90_test_passed` | boolean | Whether the 90% distribution test passes. |
| `distribution_rows` | object[] | Per-class detail (rank-sorted): `{ class_name, priority_rank, claim_cents, distribution_cents, recovery_pct }`. |
| `distributions_cents` | integer (cents) | Distributions made to shareholders. |
| `domain_count` | integer | Number of domains. |
| `dscr` | number | Debt-service coverage ratio: cash flow ÷ annual debt service. |
| `dscr_floor_breached` | boolean | Whether any period breaches the DSCR floor. |
| `earnout_targets` | integer (cents)[] | The scenario payout amounts, one integer-cents value per scenario. |
| `earnout_value_cents` | integer (cents) | Maximum contingent consideration payable under the earnout. |
| `ebitda_growth_pct` | number | Projected EBITDA growth as a fraction (negative = decline). |
| `eci_gain_cents` | integer (cents) | Estimated effectively-connected gain on the transfer; optional context. |
| `economic_life_years` | number | Remaining economic life of the asset; enables the lease-term indicator. |
| `effective_gross_income_cents` | integer (cents) | Effective gross income (gross potential less vacancy/credit loss). |
| `efficient_market_exists` | boolean | Whether an efficient market exists (defaults to whether a rate is supplied). |
| `efficient_market_framework_supported` | boolean | Whether the circuit applies the efficient-market framework. |
| `efficient_market_rate` | number | An observed efficient-market rate, as a fraction; optional. |
| `election_aggregate_payments_cents` | integer (cents) | Aggregate face of the payment stream. |
| `election_eligible` | boolean | Whether the §1111(b) election is available. |
| `election_filing_handoff_required` | boolean | Always true — the election filing routes to counsel. |
| `election_npv_cents` | integer (cents) | Present value of the payment stream. |
| `election_review_flags` | string[] | Standing tax-counsel review note on eligibility and mechanics. |
| `election_vote_passed` | boolean | null | Whether the class vote clears §1126(c), or null when votes are not supplied. |
| `eligible_ar_cents` | integer (cents) | Eligible accounts receivable in the borrowing base. |
| `eligible_inventory_cents` | integer (cents) | Eligible inventory in the borrowing base. |
| `enforceability_opinion_pass_through` | boolean | Always true — any enforceability opinion is a pass-through to counsel. |
| `engaged_in_commercial_activity` | boolean | Whether the debtor is engaged in commercial or business activity. |
| `enterprise_value_cents` | integer (cents) | The size of the transaction being tested against the HSR thresholds. |
| `entity_carried_basis_cents` | integer (cents) | The target's carried (inside) tax basis in an entity deal (default 0). |
| `entity_deal_buyer_outside_basis_cents` | integer (cents) | Buyer outside basis in an entity deal (the enterprise value). |
| `environmental_escrow_cents` | integer (cents) | Total environmental escrow. |
| `escrow_rows` | object[] | Per-issue detail: `{ issue, category (a property_escrow_category value), source, amount_cents, holdback_pct, escrow_cents, pass_through_source_required }`. |
| `estate_value_cents` | integer (cents) | The gross Chapter 7 estate value. |
| `estimated_adjustment_cents` | integer (cents) | null | Estimated adjustment against the peg, or null. |
| `estimated_irr` | number | null | Annualized IRR to resolution, or null. |
| `estimated_lender_irr` | number | null | Estimated annualized lender IRR, or null when the term is non-positive. |
| `estimated_nwc_cents` | integer (cents) | Estimated net working capital per the estimated statement; optional. |
| `estimated_years_to_use_nol` | integer | null | Whole-year ceiling to absorb the NOL at the annual limitation, or null. |
| `exceptions` | object[] | Title-commitment exceptions; each object carries `label` (string), `curable` (boolean), and `insurer_will_insure_over` (boolean). |
| `excess_layer_count` | integer | Number of excess layers supplied. |
| `excess_layers` | object[] | Excess layers above the primary tower; each object carries `limit_cents` (integer cents). |
| `excess_parachute_payment_cents` | integer (cents) | The excess parachute payment (payments over one times base) when triggered, else 0. |
| `excess_policy_limit_cents` | integer (cents) | Total excess-layer limit in cents. |
| `exchange_deadline` | string (ISO date) | The 180-day exchange deadline. |
| `exchange_discount_cents` | integer (cents) | Old-security value over new-security value. |
| `excise_tax_20pct_cents` | integer (cents) | The §4999 excise tax on the excess (20%). |
| `exclusion_count` | integer | Number of tracked exclusions. |
| `exclusions` | string[] | Named policy exclusions being tracked. |
| `exclusives_count` | integer | Number with an exclusive-use clause. |
| `executed_assignment_count` | integer | Number with an executed IP assignment. |
| `exemption_applies` | boolean | Whether a transfer-tax exemption applies (default false); zeroes the tax. |
| `exercise_price_cents` | integer (cents) | The warrant exercise (strike) price per share. |
| `exit_leverage` | number | Net debt / EBITDA at emergence. |
| `expected_gross_cents` | integer (cents) | Probability-weighted expected earnout payout, undiscounted. |
| `expected_present_value_cents` | integer (cents) | The expected payout discounted to present value over the term. |
| `expected_recovery_cents` | integer (cents) | Expected ultimate recovery on the face. |
| `expected_recovery_rate` | number | Expected ultimate recovery as a fraction of face; if omitted, implied from a post-default trading price. |
| `face_amount_cents` | integer (cents) | Face amount of the claim. |
| `failing_class_count` | integer | Number of classes that fail. |
| `fair_value_assets_cents` | integer (cents) | Fair value of assets. |
| `fair_value_share_price_cents` | integer (cents) | Assumed fair-value price per share used to value the warrants. |
| `feasibility_opinion_handoff_required` | boolean | Always true — the feasibility opinion routes to the financial advisor. |
| `feasible_under_inputs` | boolean | Whether every period clears both floors. |
| `federal_tax_rate` | number | Seller federal tax rate as a fraction (default 0). |
| `fiduciary_out_present` | boolean | Whether the RSA contains a fiduciary out (default false). |
| `filing_days_after_affixation` | integer | Days between affixation and the fixture filing; decisive for the 20-day PMSI window. |
| `final_purchase_price_adjustment_cents` | integer (cents) | Final adjustment: actual NWC minus peg (positive = above peg). |
| `finance_lease_indicators` | string[] | The finance-lease indicators that fired (empty when none). |
| `financial_advisor_ev_handoff_required` | boolean | Always true — the enterprise valuation routes to the financial advisor. |
| `financial_advisor_handoff_required` | boolean | Always true — the judgment routes to the financial advisor. |
| `fired_sub_models` | string[] | Model IDs of the sub-analyses the facts trigger. |
| `fixture_filing_made` | boolean | Whether a fixture filing was made in the real-property records (a UCC-1 alone does not suffice). |
| `fmv_at_conversion_cents` | integer (cents) | Fair market value of assets at S-election conversion. |
| `fmv_real_property_cents` | integer (cents) | Fair market value of the real property. |
| `forecast_periods` | object[] | Forecast periods; each carries `period`/`year` (string), and integer-cents `cash_flow_cents` (or `ebitda_cents`), `capex_cents`, `working_capital_need_cents`, `debt_service_cents`, and `ending_liquidity_cents`. |
| `forecast_rows` | object[] | Per-period detail: `{ period, cash_flow_cents, capex_cents, working_capital_need_cents, available_for_debt_service_cents, debt_service_cents, dscr, ending_liquidity_cents, dscr_floor_passed, liquidity_floor_passed }`. |
| `form_8288_b_reduced_withholding_requested` | boolean | Whether a Form 8288-B reduced-withholding certificate is requested (default false). |
| `form_8594_reconciliation_total_cents` | integer (cents) | Sum of the three classes (reconciles to the price). |
| `forms_8288_due_date` | string (ISO date) | null | The Form 8288 filing/remittance deadline, or null. |
| `forms_due_within_days` | integer | null | Days within which Form 8288/8288-A must be filed and the tax remitted, or null when no withholding applies. |
| `founder_ownership_pct` | number | Residual founder/existing-holder ownership as a fraction. |
| `fraud_carveout` | boolean | Whether fraud is carved out of the exclusive-remedy provision (default true). |
| `fraud_carveout_from_exclusive_remedy` | boolean | Whether fraud is carved out of the exclusive remedy. |
| `fraud_exception_note` | string | Standing note that fraud claims survive merger regardless of survival language. |
| `fraud_tax_carveout` | string | The fraud and tax carve-out posture — uncapped or counsel-defined. |
| `frbp_transfer_review_required` | boolean | Always true — the Rule 3001 transfer routes to counsel. |
| `free_and_clear_path_available` | boolean | Whether any §363(f) prong is satisfied. |
| `free_and_clear_prong_count` | integer | Number of §363(f) prongs satisfied. |
| `fulcrum_tranche` | string | null | The fulcrum tranche name, or null. |
| `fund_nav_cents` | integer (cents) | Total net asset value of the fund or portfolio. |
| `fundamental_reps_cap_cents` | integer (cents) | The cap on fundamental-representation claims (the full transaction value). |
| `fundamental_reps_expiry` | string (ISO date) | Fundamental-representation expiry date. |
| `fundamental_reps_years` | integer | Override for fundamental-representation survival in years; defaults to the cited median. |
| `g30_real_estate_overlay_triggered` | boolean | Whether the G30 real-estate overlay applies. |
| `gain_cents` | integer (cents) | The gain subject to state income tax. |
| `general_buffer_rate` | number | A general buffer added to every escrow as a fraction (default 0). |
| `general_cap_cents` | integer (cents) | The general indemnity cap in cents. |
| `general_cap_pct` | number | Override for the general indemnity cap as a fraction of value; defaults to the cited median. |
| `general_escrow_cents` | integer (cents) | The general indemnity escrow in cents. |
| `general_escrow_pct` | number | Override for the general escrow as a fraction of value; defaults to the cited median. |
| `general_reps_expiry` | string (ISO date) | null | General-representation expiry date, or null when the period is zero. |
| `general_reps_months` | integer | Override for general-representation survival in months; defaults to the cited median. |
| `go_dark_count` | integer | Number with a go-dark right. |
| `go_shop_break_fee_cents` | integer (cents) | The reduced break fee during a go-shop period. |
| `go_shop_discount_pct` | number | Override for the go-shop fee discount as a fraction of the base fee; defaults to the cited median. |
| `good_faith_negotiation_days` | integer | Days of good-faith negotiation before the arbitrator; defaults to the cited median. |
| `good_faith_negotiation_end_date` | string (ISO date) | End of the good-faith negotiation window before the accounting arbitrator. |
| `gross_borrowing_base_cents` | integer (cents) | Advance-rate value of eligible collateral before reserves. |
| `gross_profit_cents` | integer (cents) | Expected recovery less purchase price. |
| `gross_up_gap_cents` | integer (cents) | null | Gross-up needed to offset the structure tax delta, or null. |
| `ground_lease_expiry_date` | string (ISO date) | When the ground lease expires. |
| `guc_recovery_pct` | number | General-unsecured recovery on the deficiency, as a fraction (default 0). |
| `high_cents` | integer (cents) | Maximum observed monthly net working capital. |
| `holdout_debt_cents` | integer (cents) | Debt that does not tender. |
| `hsr_size_triggered` | boolean | Whether the transaction meets or exceeds the size-of-transaction threshold. |
| `identification_deadline` | string (ISO date) | The 45-day identification deadline. |
| `immediate_repair_escrow_cents` | integer (cents) | Immediate-repair escrow at the lender reserve percentage. |
| `implied_cap_rate` | number | null | Cap rate implied by the purchase price, or null. |
| `implied_rent_yield` | number | null | Rent ÷ property value, or null. |
| `implied_total_value_cents` | integer (cents) | Total fund value the strip price implies (price ÷ strip). |
| `imputed_interest_cents` | integer (cents) | Imputed interest over the term. |
| `imputed_rate_delta` | number | AFR shortfall (AFR less stated rate, floored at zero). |
| `in_place_lease_treatment` | string | How in-place leases are treated on transfer (default: assumption/assignment to confirm). |
| `inbound_license_count` | integer | Number of inbound (taken-in) licenses. |
| `includes_oss_rep` | boolean | Whether the set includes the OSS-compliance rep. |
| `includes_sufficiency_rep` | boolean | Whether the set includes the IP-sufficiency rep. |
| `income_75_pct` | number | Real-estate income as a fraction of total income. |
| `income_75_test_passed` | boolean | Whether the 75% income test passes. |
| `indemnity_carveout_review_required` | boolean | Whether any strong-copyleft or unknown component warrants an indemnity carve-out review. |
| `indicated_cramdown_rate` | number | The rate the selected framework indicates. |
| `installment_453a_threshold_cents` | integer (cents) | The §453A threshold applied. |
| `installment_receivable_cents` | integer (cents) | Aggregate face of installment receivables (default 0); drives the §453A test. |
| `installment_receivable_threshold_cents` | integer (cents) | Override for the §453A threshold; defaults to the statutory $5M. |
| `insurable_over_count` | integer | Number triaged insurable-over. |
| `interest_inconsequential` | boolean | Whether the secured interest is of inconsequential value (default false); defeats eligibility. |
| `interest_transferred_pct` | number | Fraction of the interest transferred (0–1). |
| `intrinsic_warrant_value_cents` | integer (cents) | Intrinsic value of the warrants at the assumed fair value. |
| `inventory_advance_rate` | number | Advance rate against eligible inventory as a fraction; defaults to the market-standard rate. |
| `investment_cents` | integer (cents) | Principal (or SAFE amount) converting into the round. |
| `investor_ownership_pct` | number | New-investor ownership as a fraction of the post-money cap table. |
| `ip_asset_count` | integer | Number of IP assets examined. |
| `ip_assets` | object[] | Carve-out IP assets; each object carries `asset_name` (string), `disposition` (string, e.g. assigned_to_buyer/licensed_to_buyer/license_back_to_seller), `licensed_back_to_seller` (boolean), and `transition_license_months` (integer). |
| `ip_intangibles_cents` | integer (cents) | Class VI §197 IP-intangible value. |
| `ip_value_excess_over_purchase_price_cents` | integer (cents) | IP value that exceeds the price available after Class V (normally zero). |
| `is_entity_transfer` | boolean | Whether the transaction moves interests in an entity that owns the property (rather than a deed). |
| `issues` | object[] | Property issues; each carries `name` (string), `type`/`category` (string), `amount_cents`/`cost_to_cure_cents` (integer cents), `holdback_pct` (number, default 1), `source` (string), and `pass_through_source_required` (boolean). |
| `items` | object[] | Relied-on obligations; each object carries `label` (string), `type` (a survival_item_type value), `express_survival` (boolean), and `collateral_obligation` (boolean). |
| `itu_assignment_risk_count` | integer | Number of trademarks with intent-to-use assignment risk. |
| `jurisdiction` | string (US state code) | The taxing jurisdiction (state/DC code). |
| `jurisdiction_requires_co_on_transfer` | boolean | Whether the jurisdiction requires a certificate of occupancy to be re-issued on transfer. |
| `landlord_recapture_right` | boolean | Whether the landlord holds a recapture right triggered by a consent request (default false). |
| `last_deposit_date` | string (ISO date) | Date of the most recent deposit; drives the next-due date. |
| `late_recording_count` | integer | Number with an assignment not recorded within three months. |
| `later_purchaser_for_value` | boolean | Whether the later-in-time purchaser gave value (a threshold for bona-fide-purchaser protection in every act). |
| `later_recorded_first` | boolean | Whether the later purchaser recorded before the prior interest (decisive in race and race-notice states). |
| `later_took_without_notice` | boolean | Whether the later purchaser took without actual or constructive notice of the prior interest (decisive in notice and race-notice states). |
| `lease_count` | integer | Number of leases abstracted. |
| `lease_deems_change_of_control_assignment` | boolean | Whether the lease expressly deems a control transfer an assignment (default false). |
| `lease_term_pct_of_economic_life` | number | null | Lease term as a fraction of economic life, or null. |
| `lease_term_years` | number | The leaseback term in years. |
| `leasehold_mortgageability_flag` | boolean | Whether the leasehold is mortgageable on these facts. |
| `leases` | object[] | Leases to abstract; each carries `tenant` (string), `annual_rent_cents` (integer cents), `expiry_date` (ISO date), `months_remaining` (number), `assignment_consent_required` (boolean), `change_of_control_consent_required` (boolean), `renewal_options_count` (integer), `exclusive_use` (boolean), `co_tenancy` (boolean), and `go_dark` (boolean). |
| `legal_title_or_possession_passed` | boolean | Whether legal title or possession has passed to the buyer (default false); decisive under UVPRA/NY regimes. |
| `lender_consent_critical_path` | boolean | Whether lender consent (or payoff/refinance) is a closing-condition critical path. |
| `lender_gross_return_cents` | integer (cents) | Principal plus interest plus warrant intrinsic value. |
| `lender_handoff_required` | boolean | Always true — binding facility terms route to the lender. |
| `lender_policy_required` | boolean | Whether a lender's policy is required (default false). |
| `lender_recognition_agreement` | boolean | Whether a lender recognition (SNDA-style) agreement is in place (default false). |
| `lender_reserve_pct` | number | Fraction of immediate-repair cost the lender escrows (default 1 = 100%). |
| `lender_tail_requirement_satisfied` | boolean | Whether the tail meets the requirement. |
| `liabilities_cents` | integer (cents) | Total liabilities. |
| `license_count` | integer | Number of licenses mapped. |
| `license_rows` | object[] | Per-license detail: `{ name, direction (a license_direction value), scope, exclusive, annual_royalty_cents, change_of_control_consent_required, terminates_on_change_of_control, sublicensing_allowed, material_dependency_flag }`. |
| `licensed_back_to_seller_count` | integer | Number licensed back to the seller. |
| `licensed_to_buyer_count` | integer | Number licensed to the buyer. |
| `licenses` | object[] | Material licenses; each object carries `name` (string), `direction` (a license_direction value), `scope` (string), `exclusive` (boolean), `annual_royalty_cents` (integer cents), `change_of_control_consent_required` (boolean), `terminates_on_change_of_control` (boolean), and `sublicensing_allowed` (boolean). |
| `lien_amount_cents` | integer (cents) | Aggregate liens on the assets. |
| `lien_search_rows` | object[] | Per-search detail: `{ search, track (a lien_search_track value), hit_count, release_obtained, release_required, pass_through_search_source }`. |
| `liquidation_preference_cents` | integer (cents) | The round's liquidation preference (round size × multiple). |
| `liquidation_value_cents` | integer (cents) | Gross liquidation proceeds. |
| `liquidity_floor_breached` | boolean | Whether any period breaches the liquidity floor. |
| `liquidity_months` | number | Months of liquidity runway at emergence. |
| `liquidity_need_cents` | integer (cents) | New liquidity the DIP must supply. |
| `loan_amount_cents` | integer (cents) | Drawn (or committed) loan amount under the facility. |
| `loan_has_due_on_transfer_clause` | boolean | Whether the loan documents contain a due-on-sale/due-on-transfer clause. |
| `loan_maturity_date` | string (ISO date) | When the leasehold loan matures. |
| `locked_domain_count` | integer | Number of domains still within a transfer lock. |
| `long_term_tax_exempt_rate` | number | The IRS long-term tax-exempt rate for the change month (a fraction, e.g. 0.0435); supplied at runtime. |
| `loss_corporation_value_cents` | integer (cents) | The equity value of the loss corporation immediately before the ownership change (§382(e)). |
| `lost_employer_deduction_cents` | integer (cents) | The employer deduction disallowed under §280G (equal to the excess). |
| `low_cents` | integer (cents) | Minimum observed monthly net working capital. |
| `lower_cost_redemption_path` | enum(redemption_path) | The cheaper redemption route. |
| `make_whole_discount_rate` | number | Treasury rate plus the spread, as a decimal. |
| `make_whole_premium_cents` | integer (cents) | The make-whole premium over par. |
| `make_whole_price_cents` | integer (cents) | The make-whole redemption price (PV of coupons and principal, floored at par). |
| `market_cap_rate_from_pass_through_source` | boolean | Whether the cap rate came from a pass-through market-data source; suppresses the pass-through-required flag. |
| `material_casualty_or_condemnation_pending` | boolean | Whether a material casualty or condemnation is pending (default false); drives the silent-contract red flag. |
| `material_dependency_count` | integer | Number of inbound licenses flagged deal-critical. |
| `material_ip_categories` | string[] | The IP categories material to the deal (e.g., software, patents, trademarks); drive the category-specific reps. |
| `material_ip_category_count` | integer | Number of material IP categories supplied. |
| `materiality_scrape_default` | boolean | Whether a materiality scrape is the market-standard default here. |
| `max_7a_loan_cents` | integer (cents) | The statutory 7(a) maximum loan amount, in cents. |
| `meets_sba_dscr_floor` | boolean | Whether the coverage ratio meets or exceeds the SBA 7(a) DSCR floor. |
| `meets_sba_equity_floor` | boolean | Whether buyer equity meets or exceeds the SBA 7(a) minimum equity injection. |
| `mere_change_exemption_claimed` | boolean | Whether a mere-change-of-identity exemption is being claimed (default false). |
| `merged_away_count` | integer | Number that merge into the deed at closing. |
| `metric_count` | integer | Number of performance metrics. |
| `metrics` | string[] | The performance metrics that gate the earnout (e.g., EBITDA, revenue). |
| `milestone_count` | integer | Number of milestones. |
| `milestones` | object[] | RSA milestones; each carries a `name` (string) and `completed` (boolean). |
| `minimum_dscr` | number | The DSCR floor the plan must clear each period (default 1.0). |
| `minimum_dscr_floor` | number | The DSCR floor applied. |
| `minimum_liquidity_cents` | integer (cents) | The ending-liquidity floor each period (default 0). |
| `minimum_liquidity_floor_cents` | integer (cents) | The liquidity floor applied. |
| `minimum_participation_pct` | number | Minimum participation condition, as a fraction (default 0). |
| `minimum_participation_satisfied` | boolean | Whether participation meets the minimum. |
| `minimum_projected_dscr` | number | null | The lowest DSCR across periods, or null. |
| `minimum_projected_liquidity_cents` | integer (cents) | The lowest ending liquidity across periods. |
| `missing_assignment_count` | integer | Number missing an IP assignment. |
| `missing_work_for_hire_count` | integer | Number missing a work-for-hire. |
| `monthly_nwc_cents` | integer (cents)[] | Trailing monthly net-working-capital observations, one integer-cents value per month; order is immaterial to the peg. |
| `multiple_metric_earnout` | boolean | Whether more than one metric gates the earnout. |
| `nav_ltv` | number | Loan-to-value: loan ÷ NAV. |
| `net_borrowing_base_cents` | integer (cents) | Gross base less reserves, floored at zero. |
| `net_unrealized_built_in_gain_cents` | integer (cents) | NUBIG at conversion (FMV over basis). |
| `new_money_component_cents` | integer (cents) | The new-money portion of the facility. |
| `new_money_minimum_cents` | integer (cents) | A floor on the new-money component (default 0). |
| `new_security_value_cents` | integer (cents) | Value of the new securities issued. |
| `new_value` | object | The new-value exception scaffold: `contribution_cents` (integer cents) and the booleans `new_money_or_money_worth`, `necessary_to_reorganization`, `market_test_completed`, `reasonably_equivalent_value`. |
| `new_value_scaffold` | object | The new-value elements: `{ contribution_cents, new_money_or_money_worth, necessary_to_reorganization, market_test_completed, reasonably_equivalent_value }`. |
| `new_value_scaffold_complete` | boolean | Whether all five new-value elements are affirmatively present. |
| `next_deposit_due_date` | string (ISO date) | null | The next deposit due date, or null when no last-deposit date is supplied. |
| `no_election_value_cents` | integer (cents) | Value without electing (collateral plus deficiency recovery). |
| `noi_cents` | integer (cents) | Stabilized net operating income of the real property. |
| `nol_carryforward_cents` | integer (cents) | The pre-change NOL carryforward balance; optional, drives the years-to-absorb estimate. |
| `non_transferable_permits` | string[] | Labels of permits that do not travel with the transfer. |
| `normalized_noi_cents` | integer (cents) | Normalized NOI (EGI less expenses and reserve). |
| `notice_days` | number | Days of disposition notice given (default 10). |
| `notice_floor_satisfied` | boolean | Whether the notice clears the Article 9 floor. |
| `observed_months` | integer | Number of monthly observations the peg was computed over. |
| `occupancy_pct` | number | null | Occupied tenants ÷ total tenants. |
| `occupied_annual_rent_cents` | integer (cents) | Annual rent from occupied tenants. |
| `occupied_tenant_count` | integer | Number of occupied tenants. |
| `oid_floor_cents` | integer (cents) | The OID floor (equal to the imputed interest). |
| `old_security_value_cents` | integer (cents) | Market value of the old securities; defaults to participating debt. |
| `opco_ebitda_after_rent_cents` | integer (cents) | OpCo EBITDA after the master-lease rent. |
| `opco_ebitda_before_rent_cents` | integer (cents) | OpCo EBITDA before rent, echoed. |
| `opco_ebitda_cents` | integer (cents) | OpCo EBITDA before rent. |
| `open_condition_count` | integer | Number still blocking closing. |
| `open_conditions` | string[] | Names of the conditions still blocking closing. |
| `open_curative_item_count` | integer | Number of open curative items. |
| `open_lien_count` | integer | Total hits still lacking a release. |
| `open_milestone_count` | integer | Number of incomplete milestones. |
| `opening_cash_cents` | integer (cents) | Cash on hand at filing (default 0). |
| `operating_business_residual_value_cents` | integer (cents) | Price remaining after the real estate. |
| `operating_expenses_cents` | integer (cents) | Operating expenses. |
| `option_pool_pct` | number | The post-round option-pool ownership as a fraction (0–1). |
| `oss_rows` | object[] | Per-component detail: `{ component, license, license_class (an oss_license_class value), network_use, proprietary_linking, agpl_network_flag, strong_copyleft_embedded_flag, remediation_cost_cents }`. |
| `oss_specific_rep_required` | boolean | Always true — an OSS-specific representation is required. |
| `other_property_escrow_cents` | integer (cents) | Total other-category escrow. |
| `outbound_license_count` | integer | Number of outbound (granted-out) licenses. |
| `outstanding_debt_cents` | integer (cents) | Total outstanding debt eligible to exchange. |
| `owner_policy_required` | boolean | Whether an owner's policy is required (default true). |
| `parachute_payments_cents` | integer (cents) | Aggregate contingent-on-change-in-control payments to the executive. |
| `participating_debt_cents` | integer (cents) | Debt tendered into the exchange. |
| `participation_pct` | number | Participating over outstanding debt. |
| `pass_through_market_rate_required` | boolean | Whether a pass-through market cap rate is still required. |
| `pass_through_search_source_required` | boolean | Always true — the search itself is a pass-through record pull. |
| `pass_through_source_required_count` | integer | Number of issues needing a pass-through specialist report. |
| `patent_asset_count` | integer | Number typed as patents. |
| `path` | enum(firpta_path) | The withholding path taken. |
| `pca_item_count` | integer | Number of PCA items. |
| `pca_items` | object[] | PCA items; each carries `item` (string) and integer-cents `immediate_repair_cents`, `year_1_3_cents` (or `near_term_cents`), `year_4_5_cents`, and `year_6_12_cents`, plus a `source` string. |
| `pca_pass_through_source_required` | boolean | Always true — the PCA report is a pass-through source. |
| `pca_reserve_escrow_cents` | integer (cents) | Total PCA/physical-condition escrow. |
| `pe_owned_target` | boolean | Whether the target is PE-owned (default false); drives the success-fee documentation-risk flag. |
| `pe_owned_target_success_fee_risk_flag` | boolean | Whether a PE-owned-target success-fee documentation risk is flagged. |
| `peg_cents` | integer (cents) | The working-capital peg: the trailing arithmetic mean of the observations, to the nearest cent. |
| `period_count` | integer | Number of forecast periods. |
| `period_days` | number | Days in the reconciliation period (default 365). |
| `permissive_count` | integer | Number classified permissive. |
| `permits` | object[] | Operating permits; each object carries `label` (string) and `transferable` (boolean). |
| `plan_payment_stream_cents` | integer (cents)[] | The plan's payment stream, one integer-cents payment per period. |
| `pmsi` | boolean | Whether the fixture interest is a purchase-money security interest. |
| `policy_tower_pct` | number | Override for the primary tower as a fraction of EV; defaults to the cited median. |
| `post_closing_covenant_count` | integer | Number of post-closing covenants. |
| `post_closing_covenants` | string[] | Covenants governing the buyer's post-closing operation of the business. |
| `post_default_trading_price` | number | Post-default trading price (fraction of face); drives the regression when no rate is supplied. |
| `post_money_cents` | integer (cents) | Post-money valuation (pre-money plus round size). |
| `ppa_escrow_cents` | integer (cents) | The purchase-price-adjustment escrow in cents. |
| `ppa_escrow_pct` | number | Override for the PPA escrow as a fraction of value; defaults to the cited median. |
| `ppa_note` | string | Standing note that the fixture-versus-personalty line shifts purchase-price allocation, transfer-tax base, and depreciation. |
| `pre_money_cents` | integer (cents) | Pre-money valuation of the round. |
| `pre_money_share_count` | number | Fully-diluted pre-money share count used to convert the cap into a per-share price; optional. |
| `prevailing_interest` | enum(prevailing_interest) | Which competing interest the act favors on the facts. |
| `price_exceeds_aggregate_liens` | boolean | Whether the price exceeds the liens. |
| `priced_round_share_price_cents` | integer (cents) | The new priced-round price per share. |
| `primary_policy_limit_cents` | integer (cents) | The primary RWI tower limit in cents. |
| `priming_requested` | boolean | Whether the DIP primes existing liens (default false). |
| `principal_cents` | integer (cents) | Outstanding principal being redeemed. |
| `prior_bankruptcy_count` | number | Number of prior bankruptcy filings (default 0). |
| `prior_recorded_real_property_interest` | boolean | Whether a conflicting real-property interest (e.g., a mortgage) was recorded first. |
| `priority` | enum(fixture_priority) | Which interest holds priority in the fixture. |
| `probabilities` | number[] | The probability of each scenario (0–1), positionally aligned to earnout_targets. |
| `process_steps` | string[] | The ordered title/survey process steps. |
| `professional_fee_carveout_cents` | integer (cents) | Professional-fee carve-out (default 0). |
| `professional_review_flags` | string[] | Standing tax-counsel review note. |
| `professional_review_required` | boolean | Whether any condition needs specialist review. |
| `projected_cash_flow_cents` | integer (cents) | Projected cash flow available to service debt. |
| `property_issue_count` | integer | Number of property issues. |
| `property_sold_under_363_or_plan` | boolean | Whether the property is sold under §363 or the plan (default false); with recourse, defeats eligibility. |
| `proprietary_strong_copyleft_count` | integer | Number of strong-copyleft components linked into proprietary code. |
| `prorated_tenant_share_through_closing_cents` | integer (cents) | The share prorated through the closing day. |
| `psa_required` | boolean | Always true — a purchase-and-sale agreement papers the transfer. |
| `purchase_price_cents` | integer (cents) | Total acquisition purchase price. |
| `pv_lease_payments_cents` | integer (cents) | Present value of the lease payments; enables the fair-value indicator. |
| `pv_payments_pct_of_fair_value` | number | null | PV of payments as a fraction of fair value, or null. |
| `real_estate_assets_cents` | integer (cents) | Qualifying real-estate assets. |
| `real_estate_income_cents` | integer (cents) | Qualifying real-estate gross income. |
| `real_estate_pct_of_ev` | number | Real property as a fraction of enterprise value. |
| `real_estate_value_cents` | integer (cents) | Real-estate value after the price cap (Class V). |
| `real_property_value_cents` | integer (cents) | Value of the real property inside the target. |
| `reassessment_screen_triggered` | boolean | Whether the property-tax reassessment screen fires. |
| `recharacterization_review_required` | boolean | Whether the lease term or residual trips a true-lease recharacterization review. |
| `recognition_period_years` | integer | The §1374 recognition period. |
| `recognized_big_tax_base_cents` | integer (cents) | The built-in-gains tax base after the caps. |
| `recognized_gain_cents` | integer (cents) | Gain recognized on the sale. |
| `recognized_gain_floor_cents` | integer (cents) | The greater of boot and shortfall — gain that cannot be deferred. |
| `recourse` | boolean | Whether the claim is recourse (default true). |
| `recoverable_expenses_cents` | integer (cents) | Total recoverable CAM expenses for the period. |
| `red_flags` | string[] | Priority-hygiene warnings (unrecorded interests; race-state notice anomaly). |
| `reduced_certificate_processing_days_estimate` | integer | null | IRS Form 8288-B processing estimate in days (a planning estimate), or null. |
| `regime_known` | boolean | Whether the state is in the transfer-tax regime table. |
| `related_steps_planned` | boolean | Whether related transfer steps are planned (default false); with a mere-change claim this drives step-transaction risk. |
| `release_required_count` | integer | Number of searches whose hits require a release. |
| `release_trigger_count` | integer | Number of release triggers. |
| `release_triggers` | string[] | The events that release the deposit (e.g., bankruptcy, material breach, support discontinuation). |
| `relinquished_property_value_cents` | integer (cents) | Value of the relinquished property. |
| `relinquished_value_cents` | integer (cents) | The relinquished-property value, echoed. |
| `remaining_years` | number | Years remaining to maturity (may be fractional). |
| `rent_reset_type` | string | How the ground rent resets (e.g., CPI, fair-market, fixed); echoed. |
| `rent_roll` | object[] | Tenant rows; each carries `tenant` (string), `annual_rent_cents` (integer cents), `square_feet`/`area` (number), `lease_months_remaining` (number) or `lease_expiry_date` (ISO date), and `occupied` (boolean). |
| `rent_to_ebitda_pct` | number | null | Rent as a fraction of OpCo EBITDA, or null. |
| `replacement_property_value_cents` | integer (cents) | Value of the replacement property. |
| `replacement_reserve_cents` | integer (cents) | Replacement reserve deducted from NOI (default 0). |
| `replacement_value_cents` | integer (cents) | The replacement-property value, echoed. |
| `representation_count` | integer | Number of representations in the assembled set. |
| `representation_set` | string[] | The assembled representation identifiers. |
| `required_capital_cents` | integer (cents) | Capital the business reasonably requires. |
| `required_cushion_pct` | number | Minimum equity cushion the covenant requires as a fraction; defaults to the cited market minimum. |
| `required_dip_commitment_cents` | integer (cents) | Total required DIP commitment. |
| `required_signatories` | string | Who must sign for a conveyance of the whole. |
| `required_tail_years` | number | The lender's minimum tail beyond loan maturity in years; defaults to the market minimum. |
| `reserve_rows` | object[] | Per-item detail: `{ item, immediate_repair_cents, year_1_3_cents, year_4_5_cents, year_6_12_cents, total_reserve_cents, source }`. |
| `reserves_cents` | integer (cents) | Lender reserves deducted from the gross base (default 0). |
| `residential_under_5_units` | boolean | Whether the collateral is residential real property of fewer than five dwelling units. |
| `residual_to_equity_cents` | integer (cents) | Remainder to equity after all claims. |
| `residual_value_cents` | integer (cents) | Value remaining after all tranches. |
| `residual_value_pct` | number | Projected residual value as a fraction; drives the recharacterization residual test. |
| `retained_nav_cents` | integer (cents) | NAV retained after the strip. |
| `retention_cents` | integer (cents) | The retention (deductible) in cents. |
| `retention_pct` | number | Override for the retention as a fraction of EV; defaults to the cited median. |
| `rev_proc_2011_29_safe_harbor_elected` | boolean | Whether the 70/30 success-based-fee safe harbor is elected (default true). |
| `reverse_termination_fee_cents` | integer (cents) | The reverse termination fee in cents. |
| `reverse_termination_fee_pct` | number | Override for the reverse termination fee as a fraction of value; defaults to the cited median. |
| `right_captures_entity_transfers` | boolean | Whether the right's language expressly captures entity-level (indirect) transfers. |
| `right_type` | enum(right_type) | The preemptive right at issue. |
| `risk_band` | enum(chapter22_risk_band) | The risk band the score falls into. |
| `risk_on` | enum(risk_on) | The party bearing pre-closing casualty risk. |
| `risk_premium` | number | The Till risk premium, as a fraction. |
| `rollup_amount_cents` | integer (cents) | Prepetition debt rolled into the DIP (default 0). |
| `rollup_pct_of_commitment` | number | null | Roll-up as a fraction of the commitment, or null. |
| `round_size_cents` | integer (cents) | New money raised in the round. |
| `rows` | object[] | Per-cost detail: `{ label, amount_cents, incurred_date, classification (a transaction_cost_classification value), deductible_cents, capitalized_cents, amortizable_195_cents }`. |
| `run_tested` | boolean | Whether the deposit was run-tested. |
| `rwi_present` | boolean | Whether representation-and-warranty insurance backs the deal (default false); shifts the cited-median cap default. |
| `sale_costs_cents` | integer (cents) | Sale costs (default 0). |
| `sale_date` | string (ISO date) | The asset-sale date. |
| `sale_price_cents` | integer (cents) | The sale-leaseback sale price. |
| `sales_use_tax_base_cents` | integer (cents) | Base subject to sales/use tax (default 0). |
| `sales_use_tax_cents` | integer (cents) | Sales/use tax on the base. |
| `sales_use_tax_rate` | number | Sales/use tax rate as a fraction (default 0). |
| `salt_specialist_handoff_required` | boolean | True on a contested nexus position or a bulk-sale clearance. |
| `sandbagging_default` | string | The default sandbagging posture — silent or governed by state default. |
| `satisfied_count` | integer | Number satisfied. |
| `sca_pass_through_source_required` | boolean | Always true — the software-composition-analysis scan is a pass-through source. |
| `scenarios` | object[] | Per-scenario echo: `{ target_cents (integer cents), probability (number, 0–1) }`. |
| `schedule_b_exception_count` | integer | Number of Schedule B-II exceptions. |
| `schedule_b_exceptions` | object[] | Schedule B-II exception rows (counted). |
| `schedule_count` | integer | Number of reps that carry a disclosure schedule. |
| `search_track_count` | integer | Number of search rows. |
| `searches` | object[] | Lien-search results; each object carries `name`/`jurisdiction` (string), `track` (a lien_search_track value), `hit_count` (integer) or `hit_found` (boolean), `release_obtained` (boolean), and `source` (string). |
| `section_1031_exchange` | boolean | Whether the disposition is part of a §1031 exchange (default false); drives the timing-gap flag. |
| `section_1031_timing_gap_flag` | boolean | Whether a §1031 exchange collides with FIRPTA withholding timing. |
| `section_1374_tax_cents` | integer (cents) | The §1374 built-in-gains tax. |
| `section_1446f_default_withholding_cents` | integer (cents) | The default 10% §1446(f) withholding, or 0 when not triggered. |
| `section_280g_triggered` | boolean | Whether the payments meet or exceed three times the base amount. |
| `section_336e_80pct_12mo_test_passed` | boolean | null | Whether the §336(e) disposition test passes, or null. |
| `section_363f_prongs` | object | Booleans for the §363(f) prongs: `applicable_non_bankruptcy_law_permits`, `consent`, `price_exceeds_liens`, `bona_fide_dispute`, `could_be_compelled_to_accept_money_satisfaction`. |
| `section_453a_applies` | boolean | Whether the §453A interest charge applies. |
| `section_453a_excess_receivable_cents` | integer (cents) | Receivable in excess of the threshold. |
| `security_terms` | object | Security economics for the round; recognizes `liquidation_pref_multiple` (number, default 1×). |
| `selected_framework` | enum(cramdown_framework) | Which framework governs. |
| `seller_after_tax_proceeds_cents` | integer (cents) | Seller proceeds after tax, including rollover. |
| `seller_entity_type` | string | The seller's entity type (e.g., S-corp, C-corp, partnership, individual). |
| `seller_foreign_person` | boolean | Whether the seller is a foreign person (the FIRPTA trigger). |
| `seller_indemnity_cap_cents` | integer (cents) | The seller indemnity cap in cents. |
| `seller_indemnity_cap_pct` | number | Override for the seller indemnity cap as a fraction of EV; defaults to the cited median. |
| `seller_marginal_tax_rate` | number | The seller's marginal tax rate as a fraction. |
| `seller_receivable_cents` | integer (cents) | Amount owed to the seller when NWC lands above the peg. |
| `seller_structure_tax_delta_cents` | integer (cents) | Incremental seller tax from the buyer's preferred structure (default 0); drives the gross-up gap. |
| `seller_tax_basis_cents` | integer (cents) | Seller's tax basis in what is sold (default 0). |
| `seller_tax_cents` | integer (cents) | Seller tax on the gain. |
| `seller_tax_delta_cents` | integer (cents) | The seller's incremental tax from the deemed-asset-sale treatment. |
| `seller_taxable_gain_cents` | integer (cents) | Seller taxable gain. |
| `shareholder_cleansing_vote_pct` | number | Fraction of disinterested shareholders approving the payments (0–1); optional. |
| `signatory_gap` | boolean | Whether a required signatory is missing. |
| `simple_interest_cents` | integer (cents) | Total simple cash interest over the term. |
| `size_of_transaction_cents` | integer (cents) | The transaction size under test, in cents. |
| `social_handle_transfer_count` | integer | Number of social handles to transfer. |
| `sold_nav_cents` | integer (cents) | NAV sold in the strip. |
| `solvency_opinion_handoff_required` | boolean | Always true — the solvency opinion routes to the financial advisor. |
| `special_escrow_cents` | integer (cents) | The sum of special-purpose escrows. |
| `special_escrow_sizing_cents` | integer (cents) | Sum of supplied remediation costs for special escrow sizing. |
| `special_escrows_cents` | integer (cents)[] | Any special-purpose escrow amounts (environmental, litigation, etc.) to add to the aggregate. |
| `specialized_asset` | boolean | Whether the asset is so specialized it has no alternative use to the lessor (default false). |
| `spread_bps` | number | Make-whole spread over Treasury in basis points. |
| `ssl_reissue_count` | integer | Number of SSL certificates to reissue. |
| `state` | string (US state code) | Two-letter code of the situs state, used to select the recording act. |
| `state_apportionment_pct` | number | The state apportionment factor as a fraction. |
| `state_assignment_required_count` | integer | Number needing a state trademark assignment. |
| `state_income_tax_cents` | integer (cents) | State income tax on the apportioned gain. |
| `state_nonconformity_review_required` | boolean | Whether state nonconformity to §1374 needs review. |
| `state_tax_rate` | number | Seller state tax rate as a fraction (default 0). |
| `stated_call_price_cents` | integer (cents) | The stated call price (principal × call price). |
| `stated_interest_rate` | number | The obligation's stated interest rate, as a fraction. |
| `states_involved` | string[] | Two-letter state codes touched by the deal, screened against the bulk-sales table. |
| `step_transaction_risk` | boolean | Whether a mere-change claim plus related steps raises step-transaction risk. |
| `step_up_benefit_rate` | number | The present-value benefit rate applied to the step-up (default 0). |
| `strip_percentage` | number | Fraction of the NAV sold in the strip (0–1). |
| `strong_copyleft_count` | integer | Number classified strong copyleft. |
| `subchapter_v_eligible_under_inputs` | boolean | Whether the debtor is eligible under the inputs. |
| `support_threshold_class_count` | integer | Classes clearing the §1126(c) thresholds. |
| `survey_received` | boolean | Whether the survey is in hand. |
| `survey_review_required` | boolean | Whether survey review is required. |
| `surviving_count` | integer | Number of items that survive closing. |
| `tail_years_after_loan_maturity` | number | Years the lease runs past loan maturity. |
| `tangible_assets_cents` | integer (cents) | Class V tangible/§1231 asset value. |
| `target_break_fee_cents` | integer (cents) | The target break-up fee in cents. |
| `target_break_fee_pct` | number | Override for the target break-up fee as a fraction of value; defaults to the cited median. |
| `target_cap_rate` | number | Target cap rate used to set the master-lease rent (a fraction). |
| `tax_accounting_handoff_required` | boolean | Always true — the characterization routes to specialists. |
| `tax_base_cents` | integer (cents) | The tax base (value times interest transferred). |
| `tax_characterization` | enum(tax_characterization) | The earnout tax-characterization selector; defaults to requires_tax_review. |
| `tax_facts` | object | Flags that fire sub-models: `loss_carryforwards`, `qsbs` (booleans). |
| `tax_reps_expiry` | string (ISO date) | Tax-representation expiry date. |
| `tax_reps_years` | integer | Override for tax-representation survival in years; defaults to the cited median. |
| `tax_specialist_handoff_required` | boolean | True when the seller is a foreign person. |
| `taxable_consideration_cents` | integer (cents) | Taxable (non-rollover) consideration. |
| `taxable_income_cents` | integer (cents) | REIT taxable income (the distribution-test denominator). |
| `tenant_area` | number | The tenant's leased area (used with total_area when the share is omitted). |
| `tenant_concentration_flag` | boolean | Whether one tenant exceeds the concentration threshold. |
| `tenant_count` | integer | Number of tenant rows. |
| `tenant_dispute_escrow_cents` | integer (cents) | Total tenant-dispute escrow. |
| `tenant_payments_cents` | integer (cents) | CAM the tenant has already paid for the period (default 0). |
| `tenant_pro_rata_pct` | number | The tenant's pro-rata share as a fraction; if omitted, computed from tenant_area ÷ total_area. |
| `term_months` | number | Term of the obligation in months. |
| `term_years` | number | The earnout term in years over which the expected value is discounted (default 1). |
| `terminates_on_change_of_control_count` | integer | Number that terminate on change of control. |
| `termination_event_count` | integer | Number of termination events. |
| `termination_events` | string[] | Named termination events. |
| `thirteen_week_cash_need_cents` | integer (cents) | Net cash need over the 13-week budget. |
| `three_times_base_threshold_cents` | integer (cents) | The three-times-base-amount safe-harbor threshold. |
| `threshold_cents` | integer (cents) | The current HSR size-of-transaction threshold, in cents. |
| `till_formula_rate` | number | Base rate plus risk premium. |
| `time_to_recovery_years` | number | Years to expected resolution. |
| `title_commitment_received` | boolean | Whether the title commitment is in hand. |
| `title_exception_escrow_cents` | integer (cents) | Total title-exception escrow. |
| `title_pass_through_source_required` | boolean | Always true — the title work is a pass-through source. |
| `toggle_type` | string | The plan-toggle structure (e.g., free-fall, prearranged); echoed. |
| `top_tenant_rent_pct` | number | null | Largest tenant's rent ÷ total rent, or null. |
| `total_allowed_claims_cents` | integer (cents) | Total allowed claims. |
| `total_area` | number | Total leasable area (used with tenant_area when the share is omitted). |
| `total_assets_cents` | integer (cents) | Total assets. |
| `total_chapter7_distribution_cents` | integer (cents) | Total hypothetical Chapter 7 distributions. |
| `total_claims_cents` | integer (cents) | Total allowed claims. |
| `total_consideration_cents` | integer (cents) | Total consideration (the purchase price). |
| `total_distributed_cents` | integer (cents) | Total distributed across all classes. |
| `total_income_cents` | integer (cents) | Total gross income. |
| `total_nominal_rent_cents` | integer (cents) | Total undiscounted rent over the term. |
| `total_plan_distribution_cents` | integer (cents) | Total plan distributions. |
| `total_policy_limit_cents` | integer (cents) | Primary plus excess policy limit. |
| `total_property_escrow_cents` | integer (cents) | Aggregate property escrow. |
| `total_replacement_reserve_cents` | integer (cents) | Total replacement reserve across all items and horizons. |
| `total_state_transaction_tax_cents` | integer (cents) | Total state transaction tax. |
| `trademark_asset_count` | integer | Number typed as trademarks. |
| `trademark_count` | integer | Number of trademarks. |
| `tranche_rows` | object[] | Per-tranche detail (rank-sorted): `{ tranche_name, priority_rank, claim_cents, value_allocated_cents, recovery_pct }`. |
| `tranches` | object[] | Capital-stack tranches; each carries `tranche_name` (string), `priority_rank` (integer), and `claim_cents` (integer cents). |
| `transaction_costs` | object[] | Transaction-cost rows; a non-empty list fires the transaction-cost sub-model. |
| `transaction_form` | enum(preemptive_transaction_form) | The transaction form being tested. |
| `transaction_value_cents` | integer (cents) | Total transaction value the ladder is sized against. |
| `transfer_asset_count` | integer | Number of transfer assets. |
| `transfer_assets` | object[] | Digital/brand assets to transfer; each object carries `name` (string), `type` (string, e.g. domain/trademark/social/ssl), `transfer_lock_days_remaining` (integer), `state_registered` (boolean), and `ssl_certificate_attached` (boolean). |
| `transfer_date` | string (ISO date) | The date the relinquished property was transferred; the clock start. |
| `transfer_kind` | enum(transfer_kind) | The nature of the transfer (default deed_sale); the last six enum values are the Garn-protected consumer transfers. |
| `transfer_pct` | number | Percentage of entity interests transferred in this step (0–100). |
| `transfer_rows` | object[] | Per-asset detail: `{ name, type, auth_code_required, transfer_lock_days_remaining, uspto_assignment_recording_required, state_assignment_required, social_handle_transfer_required, ssl_reissue_required }`. |
| `transfer_tax_cents` | integer (cents) | Transfer tax on the real property in an asset deal. |
| `transfer_tax_rate` | number | The real-estate transfer-tax rate applied in an asset deal, as a fraction (default 0). |
| `transfer_type` | enum(lease_transfer_type) | The form of the transfer being tested. |
| `transfers_ownership` | boolean | Whether the lease transfers ownership at term end (default false). |
| `transition_license_count` | integer | Number carrying a transition license (positive term). |
| `treasury_rate` | number | Reference Treasury yield as a fraction. |
| `tri_party_transfer_required` | boolean | Always true — the transfer is executed tri-party with the fund. |
| `triage` | object[] | One row per exception: `{ label, bucket }` where bucket is a triage_bucket value. |
| `trigger_status` | enum(trigger_status) | Whether and why the transaction implicates the right. |
| `trustee_fee_cents` | integer (cents) | Trustee fee deducted before distribution (default 0). |
| `tsa_ip_overlay_required` | boolean | Whether a TSA-IP overlay is already required (default false); the model also sets it true on any transition license. |
| `tx_seisin_note` | string | null | The Texas seisin-narrowing note when the state is TX, else null. |
| `tx_strict_match_note` | string | null | The Texas strict-match note when applicable, else null. |
| `ucc_lien_hit_count` | integer | Total UCC-track hits. |
| `unallocated_cents` | integer (cents) | Non-negative residual when supplied fair market values exceed the price (normally zero). |
| `uncapped_real_estate_value_cents` | integer (cents) | NOI capitalized at the cap rate, before the price cap. |
| `unknown_license_count` | integer | Number whose license could not be classified. |
| `update_frequency_months` | integer | Deposit-update cadence in months (default 3, i.e. quarterly). |
| `use_change` | boolean | Whether the transaction involves a change of use (default false); can require a CO even in an entity deal. |
| `uspto_assignment_recording_count` | integer | Number needing USPTO assignment recording. |
| `uspto_security_hit_count` | integer | Total USPTO-track security hits. |
| `valuation_cap_cents` | integer (cents) | The instrument's valuation cap; optional, drives the cap price. |
| `value_delta_election_vs_no_election_cents` | integer (cents) | Election NPV less no-election value (positive favors electing). |
| `value_from_cap_rate_cents` | integer (cents) | null | Value the NOI supports at the cap rate, or null. |
| `value_shortfall_cents` | integer (cents) | Shortfall from trading down (relinquished over replacement). |
| `vesting_form` | enum(vesting_form) | How record title is held. |
| `waived_count` | integer | Number waived. |
| `walt_months` | number | null | Rent-weighted average lease term in months, or null. |
| `warrant_coverage_amount_cents` | integer (cents) | Dollar coverage: loan × coverage. |
| `warrant_coverage_pct` | number | Warrant coverage as a fraction of the loan (e.g., 0.10 for 10% coverage). |
| `warrant_shares` | integer | Warrant shares: coverage amount ÷ exercise price. |
| `waterfall_rows` | object[] | Per-class detail (rank-sorted): `{ class_name, priority_rank, allowed_claim_cents, distribution_cents, recovery_pct }`. |
| `weak_copyleft_count` | integer | Number classified weak copyleft. |
| `withholding_amount_cents` | integer (cents) | The withholding the buyer must remit. |
| `withholding_certificate_provided` | boolean | Whether a §1446(f) withholding certificate/exception is provided (default false). |
| `withholding_rate` | number | The FIRPTA withholding rate applied (0, 0.10, or 0.15). |
| `within_20_day_window` | boolean | Whether the fixture filing fell within the 20-day PMSI window. |
| `within_recognition_period` | boolean | Whether the sale is within the recognition period. |
| `year_1_3_reserve_cents` | integer (cents) | Year-1–3 replacement reserve. |
| `year_4_5_reserve_cents` | integer (cents) | Year-4–5 replacement reserve. |
| `year_6_12_reserve_cents` | integer (cents) | Year-6–12 replacement reserve. |
| `years_since_conversion` | number | Years between conversion and sale. |

## Enumerations

Enumerated values are part of the normative contract — a conforming implementation accepts and emits only these values for the field types below.

- **`acceleration_risk`** — The lender's acceleration posture on the transfer.
  - Values: `none_no_clause`, `barred_by_garn_exception`, `lender_option_on_transfer`
- **`asc842_classification`** — Whether at least one ASC 842 finance-lease indicator is present on the supplied facts, or none is (pointing to operating-lease/sale accounting) — an indicator screen, not a classification opinion.
  - Values: `finance_lease_indicator_present`, `operating_lease_indicator_on_supplied_facts`
- **`basket_type`** — How the indemnification basket operates: a true deductible (recovery only above the threshold), a tipping basket (first-dollar recovery once the threshold is crossed), or unresolved pending confirmation.
  - Values: `deductible`, `tipping`, `deductible_or_tipping_to_confirm`
- **`chapter22_risk_band`** — The Chapter 22 (repeat-filing) recidivism-risk band a computed score falls into.
  - Values: `high`, `watch`, `lower`
- **`condition_type`** — The category of a closing condition; regulatory/MAE/financing/consent/CFIUS/HSR/legal types route to specialist review.
  - Values: `general`, `regulatory`, `mae`, `financing`, `consent`, `cfius`, `hsr`, `legal`
- **`consent_clause`** — The lease consent provision as parsed: silent, consent required with no stated standard, express reasonableness, or express sole discretion.
  - Values: `none_silent`, `consent_no_standard`, `reasonableness`, `sole_discretion`
- **`consent_standard`** — The consent standard that governs, resolved from the clause and the state consent-standard table.
  - Values: `reasonableness_express`, `sole_discretion_as_written`, `sole_discretion_written_verify_ca_limits`, `implied_reasonableness`, `as_written_sole_discretion_enforced`, `unsettled_check_state`
- **`contract_risk_on`** — The party the contract expressly places pre-closing casualty risk on, when it allocates risk.
  - Values: `seller`, `buyer`
- **`contract_title_standard`** — The title standard the purchase contract promises the buyer.
  - Values: `marketable`, `insurable`
- **`conversion_driver`** — Which term set the lowest (governing) conversion price for a convertible/SAFE: the valuation cap, the discount, or the priced-round share price itself.
  - Values: `valuation_cap`, `discount`, `priced_round_price`
- **`cramdown_framework`** — Which cramdown-rate framework governs: the efficient-market rate (where a market exists and the circuit applies it) or the Till formula (prime plus a risk premium).
  - Values: `efficient_market`, `till_formula`
- **`debt_assumability`** — Whether existing property debt is assumable on the supplied facts, requires lender consent or a refinance, or was not supplied.
  - Values: `not_supplied`, `assumable_on_supplied_facts`, `consent_or_refinance_required`
- **`deed_type`** — The deed instrument type, which fixes the title-covenant set conveyed.
  - Values: `general_warranty`, `special_warranty`, `bargain_and_sale`, `quitclaim`
- **`dispute_forum`** — The forum designated to resolve an earnout or true-up dispute.
  - Values: `accounting_arbitrator`, `expert_determination`, `arbitration`, `courts`
- **`firpta_path`** — The FIRPTA withholding path taken: not a foreign seller (no withholding), the $300k-or-less personal-residence exemption, the $300k–$1M reduced-rate residence path, or the default 15% withholding.
  - Values: `not_foreign_seller`, `personal_residence_300k_or_less_exemption`, `personal_residence_300k_to_1m_reduced_rate`, `default_firpta_withholding`
- **`fixture_priority`** — Which competing interest holds priority in the fixture under UCC § 9-334.
  - Values: `fixture_secured_party`, `first_to_perfect`, `real_property_interest`
- **`imputed_interest_characterization`** — Which imputed-interest regime a deferred-payment obligation routes to: the §483/§1274 review for terms over a year, or the short-term adequate-stated-interest check.
  - Values: `section_483_or_1274_review`, `adequate_stated_interest_short_term_check`
- **`lease_classification`** — How the transfer classifies against the lease transfer-restriction terms.
  - Values: `deemed_assignment_consent_path_applies`, `generally_not_assignment_by_operation_of_law`, `assignment_restriction_applies`, `no_restriction_freely_assignable`
- **`lease_transfer_type`** — The form of the transfer being tested against the lease transfer-restriction terms.
  - Values: `asset_assignment`, `sublease`, `change_of_control`, `merger`
- **`license_direction`** — Whether a license is taken in (inbound — a dependency of the target) or granted out (outbound).
  - Values: `inbound`, `outbound`
- **`lien_search_track`** — The lien-search record system a search row runs against: UCC filing office, USPTO assignment/security record, or the U.S. Copyright Office.
  - Values: `ucc`, `uspto`, `copyright`
- **`oss_license_class`** — The copyleft class of an open-source component: permissive (MIT/BSD/Apache), weak copyleft (LGPL/MPL/EPL), strong copyleft (GPL/AGPL), or unknown/unclassified.
  - Values: `permissive`, `weak_copyleft`, `strong_copyleft`, `unknown`
- **`permit_deal_form`** — The acquisition form, which governs whether permits and certificates re-issue and whether bulk-sales notification applies.
  - Values: `asset`, `entity`, `merger`
- **`preemptive_transaction_form`** — The transaction form tested for whether it triggers the preemptive right.
  - Values: `asset_sale`, `entity_transfer`, `merger`
- **`prevailing_interest`** — Which competing interest the recording act favors on the supplied facts.
  - Values: `later_purchaser`, `prior_interest`, `undetermined`
- **`property_escrow_category`** — The category a property-level escrow issue is bucketed into for sizing: environmental, physical-condition (PCA), title, tenant, cost-to-cure, or other.
  - Values: `environmental`, `pca`, `title`, `tenant`, `cost_to_cure`, `other`
- **`recording_act_type`** — The recording-act family the state applies; unknown means the state is not in the table and the result defers.
  - Values: `race`, `notice`, `race_notice`, `unknown`
- **`redemption_path`** — The cheaper of the two redemption routes: the make-whole (Treasury-plus-spread present value) or the stated call price.
  - Values: `make_whole`, `stated_call`
- **`right_type`** — The preemptive right at issue: a purchase option, a right of first refusal, or a right of first offer.
  - Values: `option`, `rofr`, `rofo`
- **`risk_basis`** — The legal basis for the risk allocation: an express contract term, or a named state default regime.
  - Values: `contract_override`, `equitable_conversion_default`, `uvpra_seller`, `ny_risk_act_seller`
- **`risk_on`** — The party carrying pre-closing casualty risk under the governing rule.
  - Values: `buyer`, `seller`, `per_contract_terms`
- **`survival_item_type`** — The kind of relied-on obligation being tracked for survival past closing.
  - Values: `representation`, `warranty`, `covenant`, `indemnity`
- **`tax_characterization`** — The earnout's tax-characterization selector; the binding treatment is a tax-advisor determination.
  - Values: `requires_tax_review`, `installment_sale`, `imputed_interest`, `compensation`
- **`transaction_cost_classification`** — How a transaction cost is classified for tax: pre-bright-line §195 investigatory (amortizable), a success-based fee under the Rev. Proc. 2011-29 70/30 safe harbor, an inherently facilitative cost (capitalized), or a post-bright-line facilitative cost (capitalized).
  - Values: `pre_bright_line_investigatory_195`, `success_based_fee_70_30_safe_harbor`, `inherently_facilitative_capitalized`, `post_bright_line_facilitative_capitalized`
- **`transfer_kind`** — The nature of the transfer being screened against the loan's due-on-transfer clause; the last six are the Garn-St. Germain § 1701j-3(d) protected consumer transfers.
  - Values: `deed_sale`, `entity_transfer`, `transfer_to_spouse_or_child`, `transfer_on_death_to_relative`, `divorce_decree_transfer_to_spouse`, `inter_vivos_trust_borrower_beneficiary`, `junior_lien_creation`, `leasehold_under_3y_no_option`
- **`triage_bucket`** — The disposition bucket for a single title exception.
  - Values: `curable`, `insurable_over`, `deal_killing`
- **`trigger_status`** — Whether and why the transaction form implicates the preemptive right.
  - Values: `triggered_property_sale`, `triggered_entity_capture_language`, `likely_not_triggered_structural`
- **`vesting_form`** — How record title is held, which fixes whose signature a conveyance of the whole requires.
  - Values: `sole`, `tenancy_in_common`, `joint_tenancy`, `tenancy_by_entirety`, `community_property`, `entity`


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

- AUTH-0108 — IRC 1202
- AUTH-0190 — OBBBA 2025


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

- AUTH-0105 — IRC 1042


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

- AUTH-0127 — IRC 368(a)(1)(F)
- AUTH-0136 — IRC 721


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

- AUTH-0130 — IRC 453


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

- AUTH-0121 — IRC 338


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

- AUTH-0257 — UK market practice


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

- AUTH-0070 — EU Merger Regulation 139/2004
- AUTH-0256 — UK Enterprise Act 2002


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

- AUTH-0221 — SRS Acquiom Deal Terms Study 2025
- AUTH-0211 — RWI market studies


# M109 — Working capital peg

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G14, G15
**Deal contexts:** cash deals

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Computes the working-capital peg — the reference net-working-capital level a purchase agreement locks in at signing — as the trailing arithmetic mean of a company's supplied monthly NWC observations, and reports the observed low–high range around it. The peg answers, for the buyer and seller negotiating the price adjustment, "what normalized level of working capital should be delivered at close?" It establishes the peg and its dispersion only; the post-closing estimated-versus-actual true-up sequence and any collar are specified separately by M210.

> **Scope note.** SCOPE (delta §1, option (a) — rescope for v1.0): the catalog purpose read "Target, peg, true-up, and collar math," but the reference implementation computes only the trailing-mean peg and the observed min/max. It does NOT compute a negotiated target, a post-closing true-up, or a collar. Per the governing rule the published contract is scoped to what the model specifies; the closing-statement true-up sequence is owned by M210 (Closing-statement true-up sequence), cross-referenced here. Founder decision recorded: rescope (a), not extend the code, for v1.0.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M109.schema.json`](M109.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `monthly_nwc_cents` | integer (cents)[] | MUST | Trailing monthly net-working-capital observations, one integer-cents value per month; order is immaterial to the peg. |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `peg_cents` | integer (cents) | The working-capital peg: the trailing arithmetic mean of the observations, to the nearest cent. |
| `observed_months` | integer | Number of monthly observations the peg was computed over. |
| `low_cents` | integer (cents) | Minimum observed monthly net working capital. |
| `high_cents` | integer (cents) | Maximum observed monthly net working capital. |

## 4. Algorithm

Given `monthly_nwc_cents`, a list of integer-cents net-working-capital observations, one per trailing month:
1. The implementation SHALL coerce each element to integer cents and discard non-numeric elements. If no numeric observation remains, it SHALL return `status: "needs_inputs"` with `monthly_nwc_cents` in `missingInputs` and emit no outputs.
2. `observed_months` SHALL be the count of retained observations.
3. `peg_cents` SHALL be the arithmetic mean of the retained observations, rounded to the nearest integer cent (see precision rule).
4. `low_cents` SHALL be the minimum retained observation; `high_cents` SHALL be the maximum.
5. The model SHALL NOT emit a target, a true-up, or a collar; those are out of scope for this slot (see scope note; M210 owns the true-up).

## 5. Constants & authorities

_No numeric constants — this model computes from supplied facts and cited rule text only (attested: `constants: []`)._


**Authorities**

| Authority | ID | Type |
|---|---|---|
| ABA Private Target Deal Points Study | AUTH-0026 | study/dataset |

## 6. Worked example

*A lower-middle-market distributor's last six months of net working capital run between $1.74M and $1.88M; the peg is set at the trailing mean of roughly $1.80M.*

**Inputs**

```json
{
  "monthly_nwc_cents": [
    176000000,
    182000000,
    179500000,
    188000000,
    174000000,
    181500000
  ]
}
```

**Outputs (executed against the reference implementation `MODEL.STRUCT.NWC.PEG.v1`)**

```json
{
  "peg_cents": 180166667,
  "observed_months": 6,
  "low_cents": 174000000,
  "high_cents": 188000000
}
```

Precision: All outputs are exact integer cents or counts (see the Conventions chapter); peg_cents is the mean rounded to the nearest integer cent.

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["monthly_nwc_cents"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model computes the working-capital peg and its observed dispersion from supplied monthly figures. It renders no view on the negotiated target, the post-closing true-up (specified by M210), or a collar; the peg it produces is an input to the purchase-agreement negotiation, not a determination of the final price adjustment, which is an accounting and legal matter for the parties and their advisors.

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

- AUTH-0065 — English MAC case law


# M111 — Revenue earnout

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G15
**Deal contexts:** earnout

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Computes the expected value of a revenue-metric earnout as the probability-weighted sum of its supplied payout scenarios, and discounts that expected value to present value over the earnout term. It answers, for a buyer and seller pricing contingent consideration, "what is this revenue earnout worth today, and what does each scenario contribute?" It values the earnout from supplied scenario payouts and their probabilities; it does not itself model the revenue thresholds that generate those payouts.

> **Scope note.** SCOPE (governing rule): the catalog purpose reads "Metric threshold, period, probability, and expected-value schedule," but the reference implementation (MODEL.STRUCT.EARNOUT.MC.v1 — shared with M112) is a metric-agnostic probability-weighted expected-value + present-value engine. It consumes already-quantified payout scenarios and their probabilities; it does NOT gate payouts off a revenue metric and a threshold, nor build a period-by-period schedule beyond a single-term discount. Founder decision: (a) rescope the published contract to the expected-value engine it is (recommended — one binding serves M111 and M112), or (b) extend the code with a revenue-threshold payout front-end. Recorded pending founder sign-off.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M111.schema.json`](M111.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `discount_rate` | number | MUST | The annual discount rate applied to the expected value (a fraction, e.g. 0.12). |
| `earnout_targets` | integer (cents)[] | MUST | The scenario payout amounts, one integer-cents value per scenario. |
| `probabilities` | number[] | MUST | The probability of each scenario (0–1), positionally aligned to earnout_targets. |
| `term_years` | number | MAY | The earnout term in years over which the expected value is discounted (default 1). |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `expected_gross_cents` | integer (cents) | Probability-weighted expected earnout payout, undiscounted. |
| `expected_present_value_cents` | integer (cents) | The expected payout discounted to present value over the term. |
| `scenarios` | object[] | Per-scenario echo: `{ target_cents (integer cents), probability (number, 0–1) }`. |

## 4. Algorithm

Given `earnout_targets` (a list of integer-cents scenario payouts), `probabilities` (a parallel list of scenario probabilities), and `discount_rate`, plus optional `term_years` (default 1):
1. The implementation SHALL coerce `earnout_targets` to integer cents and `probabilities` to numbers; if either list is empty or `discount_rate` is missing, it SHALL return `status: "needs_inputs"` naming the missing fields and emit no outputs.
2. For each scenario it SHALL clamp the probability to the closed interval [0, 1] and weight the scenario payout by it.
3. `expected_gross_cents` SHALL be the sum of the probability-weighted payouts, rounded to the nearest integer cent.
4. `expected_present_value_cents` SHALL be `expected_gross_cents ÷ (1 + discount_rate)^term_years`, rounded to the nearest integer cent.
5. `scenarios` SHALL echo each scenario as `{ target_cents, probability }` with the probability at the global 4-decimal precision.

## 5. Constants & authorities

_No numeric constants — this model computes from supplied facts and cited rule text only (attested: `constants: []`)._


**Authorities**

| Authority | ID | Type |
|---|---|---|
| ABA Private Target Deal Points Study | AUTH-0026 | study/dataset |
| SRS Acquiom Deal Terms Study 2025 | AUTH-0221 | study/dataset |

## 6. Worked example

*A revenue earnout with three payout scenarios — $2.0M at 50%, $3.5M at 30%, $5.0M at 20% — carries a $3.05M probability-weighted expected value, discounted three years at 12% to about $2.17M today.*

**Inputs**

```json
{
  "earnout_targets": [
    200000000,
    350000000,
    500000000
  ],
  "probabilities": [
    0.5,
    0.3,
    0.2
  ],
  "discount_rate": 0.12,
  "term_years": 3
}
```

**Outputs (executed against the reference implementation `MODEL.STRUCT.EARNOUT.MC.v1`)**

```json
{
  "expected_gross_cents": 305000000,
  "expected_present_value_cents": 217092976,
  "scenarios": [
    {
      "target_cents": 200000000,
      "probability": 0.5
    },
    {
      "target_cents": 350000000,
      "probability": 0.3
    },
    {
      "target_cents": 500000000,
      "probability": 0.2
    }
  ]
}
```

Precision: Monetary outputs are exact integer cents; scenario probabilities are rounded per the global rule (half-even to 4 decimals — see the Conventions chapter).

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["earnout_targets","probabilities","discount_rate"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model values a revenue earnout as the probability-weighted, discounted expected value of supplied scenario payouts. Whether the scenario payouts and probabilities are reasonable, how the revenue metric is defined and measured, and the earnout's enforceability and tax characterization are determinations for the parties, their accountants, and counsel (see M213); the model computes the expected value and renders no view on the assumptions behind it.

## 9. Conformance bindings

Requirement `REQ-M111` is verified by 1 published case(s): `CONF.MODEL.STRUCT.EARNOUT.MC.001`.

## 10. Version

Reference binding `MODEL.STRUCT.EARNOUT.MC.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M112 — EBITDA earnout

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G15
**Deal contexts:** earnout

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Computes the expected value of an EBITDA-metric earnout as the probability-weighted sum of its supplied payout scenarios, and discounts that expected value to present value over the earnout term. It answers, for parties pricing contingent consideration tied to EBITDA, "what is this EBITDA earnout worth today?" It values the earnout from supplied scenario payouts and probabilities; it does not itself define the EBITDA target or apply an add-back policy.

> **Scope note.** SCOPE (governing rule): the catalog purpose reads "EBITDA target, add-back policy, and expected-value schedule," but the reference implementation (MODEL.STRUCT.EARNOUT.MC.v1 — shared with M111) is a metric-agnostic probability-weighted expected-value + present-value engine. It consumes already-quantified payout scenarios and probabilities; it does NOT compute an EBITDA target, and it applies NO add-back/normalization policy — that normalization is baked into the supplied scenario payouts and is a QoE and accounting matter. Founder decision: (a) rescope the published contract to the expected-value engine it is (recommended — one binding serves M111 and M112), or (b) extend the code with an EBITDA add-back front-end. Recorded pending founder sign-off.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M112.schema.json`](M112.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `discount_rate` | number | MUST | The annual discount rate applied to the expected value (a fraction, e.g. 0.15). |
| `earnout_targets` | integer (cents)[] | MUST | The scenario payout amounts, one integer-cents value per EBITDA scenario. |
| `probabilities` | number[] | MUST | The probability of each scenario (0–1), positionally aligned to earnout_targets. |
| `term_years` | number | MAY | The earnout term in years over which the expected value is discounted (default 1). |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `expected_gross_cents` | integer (cents) | Probability-weighted expected earnout payout, undiscounted. |
| `expected_present_value_cents` | integer (cents) | The expected payout discounted to present value over the term. |
| `scenarios` | object[] | Per-scenario echo: `{ target_cents (integer cents), probability (number, 0–1) }`. |

## 4. Algorithm

Given `earnout_targets` (a list of integer-cents scenario payouts), `probabilities` (a parallel list of scenario probabilities), and `discount_rate`, plus optional `term_years` (default 1):
1. The implementation SHALL coerce `earnout_targets` to integer cents and `probabilities` to numbers; if either list is empty or `discount_rate` is missing, it SHALL return `status: "needs_inputs"` naming the missing fields and emit no outputs.
2. For each scenario it SHALL clamp the probability to the closed interval [0, 1] and weight the scenario payout by it.
3. `expected_gross_cents` SHALL be the sum of the probability-weighted payouts, rounded to the nearest integer cent.
4. `expected_present_value_cents` SHALL be `expected_gross_cents ÷ (1 + discount_rate)^term_years`, rounded to the nearest integer cent.
5. `scenarios` SHALL echo each scenario as `{ target_cents, probability }` with the probability at the global 4-decimal precision.

## 5. Constants & authorities

_No numeric constants — this model computes from supplied facts and cited rule text only (attested: `constants: []`)._


**Authorities**

| Authority | ID | Type |
|---|---|---|
| ABA Private Target Deal Points Study | AUTH-0026 | study/dataset |
| SRS Acquiom Deal Terms Study 2025 | AUTH-0221 | study/dataset |

## 6. Worked example

*An EBITDA earnout with two payout scenarios — $2.5M if EBITDA hits the base target (60%) and $4.0M at the stretch target (40%) — carries a $3.1M expected value, discounted two years at 15% to about $2.34M today.*

**Inputs**

```json
{
  "earnout_targets": [
    250000000,
    400000000
  ],
  "probabilities": [
    0.6,
    0.4
  ],
  "discount_rate": 0.15,
  "term_years": 2
}
```

**Outputs (executed against the reference implementation `MODEL.STRUCT.EARNOUT.MC.v1`)**

```json
{
  "expected_gross_cents": 310000000,
  "expected_present_value_cents": 234404537,
  "scenarios": [
    {
      "target_cents": 250000000,
      "probability": 0.6
    },
    {
      "target_cents": 400000000,
      "probability": 0.4
    }
  ]
}
```

Precision: Monetary outputs are exact integer cents; scenario probabilities are rounded per the global rule (half-even to 4 decimals — see the Conventions chapter).

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["earnout_targets","probabilities","discount_rate"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model values an EBITDA earnout as the probability-weighted, discounted expected value of supplied scenario payouts. The EBITDA definition, the add-back policy that normalizes it, and the earnout's enforceability and tax characterization are determinations for the parties' accountants and counsel (see M213); the model computes the expected value and renders no view on the normalization behind the scenario payouts.

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

- AUTH-0026 — ABA Private Target Deal Points Study
- AUTH-0221 — SRS Acquiom Deal Terms Study 2025


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

- AUTH-0026 — ABA Private Target Deal Points Study
- AUTH-0221 — SRS Acquiom Deal Terms Study 2025


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

- AUTH-0026 — ABA Private Target Deal Points Study
- AUTH-0221 — SRS Acquiom Deal Terms Study 2025


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

- AUTH-0085 — fund formation market practice


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

- AUTH-0069 — ETA market norms


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

- AUTH-0064 — DOL ESOP guidance


# M119 — SBA 7(a) post-SOP 50 10 8

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G15
**Deal contexts:** SMB acquisition

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Checks whether an SBA 7(a) change-of-ownership acquisition clears the program's two hard financing floors — the minimum equity injection and the debt-service-coverage minimum — and reports the buyer's equity percentage, the coverage ratio, and the 7(a) loan ceiling. It answers, for a searcher or SMB buyer structuring an SBA-backed acquisition, "does this capital stack meet the SOP's gating requirements before we take it to a lender?" It performs the arithmetic screen only; the eligibility and credit decisions remain the lender's and the SBA's.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M119.schema.json`](M119.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `annual_debt_service_cents` | integer (cents) | MUST | Annual principal-and-interest debt service on the acquisition debt. |
| `buyer_equity_cents` | integer (cents) | MUST | Buyer equity injection into the transaction. |
| `cash_flow_cents` | integer (cents) | MUST | Post-acquisition annual free cash flow available for debt service. |
| `purchase_price_cents` | integer (cents) | MUST | Total acquisition purchase price. |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `buyer_equity_pct` | number | Buyer equity as a fraction of purchase price (0–1). |
| `dscr` | number | Debt-service coverage ratio: cash flow ÷ annual debt service. |
| `meets_sba_equity_floor` | boolean | Whether buyer equity meets or exceeds the SBA 7(a) minimum equity injection. |
| `meets_sba_dscr_floor` | boolean | Whether the coverage ratio meets or exceeds the SBA 7(a) DSCR floor. |
| `max_7a_loan_cents` | integer (cents) | The statutory 7(a) maximum loan amount, in cents. |

## 4. Algorithm

Given `purchase_price_cents`, `cash_flow_cents` (post-acquisition free cash flow available for debt service), `buyer_equity_cents`, and `annual_debt_service_cents`:
1. If any of the four is missing or non-numeric, the implementation SHALL return `status: "needs_inputs"` naming the missing fields and emit no outputs.
2. `buyer_equity_pct` SHALL be `buyer_equity_cents ÷ purchase_price_cents`, rounded half-up to 4 decimals.
3. `dscr` SHALL be `cash_flow_cents ÷ annual_debt_service_cents`, rounded half-up to 2 decimals.
4. `meets_sba_equity_floor` SHALL be true iff `buyer_equity_pct ≥ SBA equity-injection floor` (constants: SBA 7(a) minimum equity injection).
5. `meets_sba_dscr_floor` SHALL be true iff `dscr ≥ SBA debt-service-coverage floor` (constants: SBA 7(a) DSCR floor).
6. `max_7a_loan_cents` SHALL be the 7(a) maximum loan amount in cents (constants: SBA 7(a) maximum loan amount).

## 5. Constants & authorities

| Constant | Value | Strength | Authority | Pin-cite | Effective | Next check |
|---|---|---|---|---|---|---|
| SBA 7(a) maximum loan amount | $5,000,000 | MUST (binding) | SBA SOP 50 10 8 | Subpart B — 7(a) maximum loan amount; 15 U.S.C. § 636(a)(3)(A) | 2025-06-01 | on next SOP revision |
| SBA 7(a) minimum equity injection | 10% (0.10) | MUST (binding) | SBA SOP 50 10 8 | Subpart B — minimum equity injection for change-of-ownership | 2025-06-01 | on next SOP revision |
| SBA 7(a) DSCR floor | 1.15× | MUST (binding) | SBA SOP 50 10 8 | Subpart B — business-acquisition debt-service-coverage floor | 2025-06-01 | on next SOP revision |


**Authorities**

| Authority | ID | Type |
|---|---|---|
| SBA SOP 50 10 8 | AUTH-0213 | guidance |

## 6. Worked example

*A $1.2M SMB acquisition funded with $150k of buyer equity (12.5%) and $300k of free cash flow against $180k of annual debt service clears both SBA floors.*

**Inputs**

```json
{
  "purchase_price_cents": 120000000,
  "buyer_equity_cents": 15000000,
  "cash_flow_cents": 30000000,
  "annual_debt_service_cents": 18000000
}
```

**Outputs (executed against the reference implementation `MODEL.LBO.SBA.v1`)**

```json
{
  "buyer_equity_pct": 0.125,
  "dscr": 1.6667,
  "meets_sba_equity_floor": true,
  "meets_sba_dscr_floor": true,
  "max_7a_loan_cents": 500000000
}
```

Precision: Rates and ratios follow the global precision rule (half-even to 4 decimals at the output boundary — see the Conventions chapter): buyer_equity_pct and dscr are 4-decimal; max_7a_loan_cents is exact integer cents.

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["purchase_price_cents","cash_flow_cents","buyer_equity_cents","annual_debt_service_cents"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model checks an SBA 7(a) change-of-ownership financing against the program's equity-injection and debt-service-coverage floors and the 7(a) loan ceiling. Eligibility, the credit-elsewhere test, and the final credit decision are the lender's and the SBA's; the model computes the ratios and the pass/fail against the published floors and renders no eligibility determination.

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

- AUTH-0094 — ILPA continuation-fund guidance


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

- AUTH-0137 — IRC 754
- AUTH-0238 — TRA market practice


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

- AUTH-0162 — LSTA model AAL


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

- AUTH-0029 — Akorn
- AUTH-0082 — Frontier
- AUTH-0050 — Channel Medsystems


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

- AUTH-0060 — Delaware equitable-remedy case law


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

- AUTH-0063 — DGCL SB 21
- AUTH-0210 — Rutledge v. Clearway


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

- AUTH-0171 — MFW
- AUTH-0167 — Match Group


# M128 — HSR reportability

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G7
**Deal contexts:** M&A regulatory

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Screens a transaction's size against the current Hart-Scott-Rodino size-of-transaction threshold and the auto-reportable ceiling, so a deal team knows early whether an antitrust filing analysis is in play. It answers, at the size-screen level, "is this deal above the line that makes HSR reportability a live question?" It is the first gate only; the size-of-person tests, exemptions, and ultimate-parent-entity analysis that determine whether a filing is actually required are left to antitrust counsel.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M128.schema.json`](M128.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `enterprise_value_cents` | integer (cents) | MUST | The size of the transaction being tested against the HSR thresholds. |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `size_of_transaction_cents` | integer (cents) | The transaction size under test, in cents. |
| `threshold_cents` | integer (cents) | The current HSR size-of-transaction threshold, in cents. |
| `hsr_size_triggered` | boolean | Whether the transaction meets or exceeds the size-of-transaction threshold. |
| `auto_reportable_cents` | integer (cents) | The current HSR auto-reportable ceiling, in cents. |

## 4. Algorithm

Given `enterprise_value_cents` (the size of the transaction being tested):
1. If `enterprise_value_cents` is missing or non-numeric, the implementation SHALL return `status: "needs_inputs"` with `enterprise_value_cents` in `missingInputs`.
2. `size_of_transaction_cents` SHALL echo the supplied enterprise value in cents.
3. `threshold_cents` SHALL be the current HSR size-of-transaction threshold in cents (constants: HSR size-of-transaction threshold).
4. `hsr_size_triggered` SHALL be true iff `size_of_transaction_cents ≥ threshold_cents`.
5. `auto_reportable_cents` SHALL be the current HSR auto-reportable ceiling in cents (constants: HSR auto-reportable ceiling), above which the size-of-person test no longer applies.

## 5. Constants & authorities

| Constant | Value | Strength | Authority | Pin-cite | Effective | Next check |
|---|---|---|---|---|---|---|
| HSR size-of-transaction threshold | $133,900,000 | MUST (binding) | 15 U.S.C. § 18a; 16 C.F.R. § 801.1 | FTC 2026 annual threshold revision (eff. 2026-02-17) | 2026-02-17 | 2027-Q1 (FTC revises annually, typically January–February) |
| HSR auto-reportable ceiling | $535,500,000 | MUST (binding) | 15 U.S.C. § 18a; 16 C.F.R. § 801.1 | FTC 2026 annual threshold revision (eff. 2026-02-17) | 2026-02-17 | 2027-Q1 (FTC revises annually) |


**Authorities**

| Authority | ID | Type |
|---|---|---|
| 15 U.S.C. 18a | AUTH-0015 | statute |

## 6. Worked example

*A $140M acquisition sits just above the 2026 HSR size-of-transaction threshold of $133.9M, so a reportability analysis is required.*

**Inputs**

```json
{
  "enterprise_value_cents": 14000000000
}
```

**Outputs (executed against the reference implementation `MODEL.HSR.TRIAGE.v1`)**

```json
{
  "size_of_transaction_cents": 14000000000,
  "threshold_cents": 13390000000,
  "hsr_size_triggered": true,
  "auto_reportable_cents": 53550000000
}
```

Precision: All values are exact integer cents (see the Conventions chapter); no rounding.

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["enterprise_value_cents"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model compares a transaction's size against the current HSR size-of-transaction and auto-reportable thresholds. Whether a filing is in fact required — the size-of-person tests, the exemptions, and the ultimate-parent-entity analysis — is an antitrust determination for counsel; the model performs the size screen and routes the reportability conclusion, and does not render it.

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

- AUTH-0203 — Regulation (EU) 2024/1689


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

- AUTH-0183 — NIST CSF


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

- AUTH-0086 — GDPR
- AUTH-0056 — CPRA


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

- AUTH-0195 — OFAC


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

- AUTH-0214 — SEC climate and ESG references


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

- AUTH-0215 — SEC climate disclosure references


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

- AUTH-0071 — fairness opinion case law
- AUTH-0164 — market practice


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
- AUTH-0255 — UFTA
- AUTH-0259 — UVTA


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

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Computes the residual-method allocation of an asset-deal purchase price across the seven asset classes of §1060, cascading each dollar down the class ordering and dropping the residual into Class VII goodwill. It answers, for a buyer and seller papering an asset purchase, "how does this price split across the classes that drive the buyer's depreciation and amortization and the parties' consistent Form 8594?" It allocates from supplied fair market values only; the values themselves and their class assignments are the advisors' calls.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M139.schema.json`](M139.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `asset_classes` | object[] | MUST | The asset classes with fair market values; each object carries `class_number` (1–7), `class_name` (string), and `fair_market_value_cents` (integer cents). |
| `purchase_price_cents` | integer (cents) | MUST | Total consideration to be allocated across the asset classes. |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `purchase_price_cents` | integer (cents) | The price allocated, echoed. |
| `allocated_cents` | integer (cents) | Total amount allocated across the classes. |
| `unallocated_cents` | integer (cents) | Non-negative residual when supplied fair market values exceed the price (normally zero). |
| `class_v_tangible_cents` | integer (cents) | Amount allocated to Class V tangible/§1231 assets. |
| `class_vi_section_197_intangibles_cents` | integer (cents) | Amount allocated to Class VI §197 intangibles (excluding goodwill). |
| `class_vii_goodwill_cents` | integer (cents) | Residual allocated to Class VII goodwill and going-concern value. |
| `allocations` | object[] | Per-class schedule: `{ class_number, class_name, fair_market_value_cents, allocated_cents, capped_at_fmv }`. |

## 4. Algorithm

Given `purchase_price_cents` and `asset_classes` (a list of `{ class_number, class_name, fair_market_value_cents }`):
1. If either is missing or `asset_classes` is empty, the implementation SHALL return `status: "needs_inputs"` naming the missing fields.
2. It SHALL sort the asset classes by class number ascending (Class I → Class VII), per the residual-method ordering (constants: §1060 seven-class ordering).
3. It SHALL initialize a running remainder equal to `purchase_price_cents` and, for each class in order, allocate: for Classes I–VI, the lesser of the remainder and that class's fair market value (capped at FMV); for Class VII, the entire remaining amount (the residual). It SHALL subtract each allocation from the remainder.
4. `allocated_cents` SHALL be the sum of all class allocations; `unallocated_cents` SHALL be the non-negative remainder (nonzero only when supplied FMVs exceed the price).
5. It SHALL report the Class V (tangible), Class VI (§197 intangibles), and Class VII (goodwill and going concern) subtotals and the full per-class allocation schedule.

## 5. Constants & authorities

| Constant | Value | Strength | Authority | Pin-cite | Effective | Next check |
|---|---|---|---|---|---|---|
| §1060 seven-class ordering | Classes I (cash) → II (marketable securities) → III (A/R and mark-to-market) → IV (inventory) → V (other tangible/§1231) → VI (§197 intangibles ex-goodwill) → VII (goodwill and going-concern value) | table (jurisdictional) | Treas. Reg. § 1.1060-1(c); § 1.338-6(b) | § 1.338-6(b)(2) (seven-class residual method) | current (Treas. Reg. as amended) | on Treasury amendment |


**Authorities**

| Authority | ID | Type |
|---|---|---|
| IRC 1060 | AUTH-0106 | statute |
| Treas. Reg. 1.1060-1 | AUTH-0239 | regulation |

## 6. Worked example

*A $10M asset purchase carries $500k of cash, $2M of equipment, and $1.5M of identified customer relationships; the residual method drops the remaining $6M into Class VII goodwill.*

**Inputs**

```json
{
  "purchase_price_cents": 1000000000,
  "asset_classes": [
    {
      "class_number": 1,
      "class_name": "Cash",
      "fair_market_value_cents": 50000000
    },
    {
      "class_number": 5,
      "class_name": "Equipment",
      "fair_market_value_cents": 200000000
    },
    {
      "class_number": 6,
      "class_name": "Customer relationships (§197)",
      "fair_market_value_cents": 150000000
    },
    {
      "class_number": 7,
      "class_name": "Goodwill",
      "fair_market_value_cents": 0
    }
  ]
}
```

**Outputs (executed against the reference implementation `MODEL.TAX.1060.ALLOCATION.v1`)**

```json
{
  "purchase_price_cents": 1000000000,
  "allocated_cents": 1000000000,
  "unallocated_cents": 0,
  "class_v_tangible_cents": 200000000,
  "class_vi_section_197_intangibles_cents": 150000000,
  "class_vii_goodwill_cents": 600000000,
  "allocations": [
    {
      "class_number": 1,
      "class_name": "Cash",
      "fair_market_value_cents": 50000000,
      "allocated_cents": 50000000,
      "capped_at_fmv": true
    },
    {
      "class_number": 5,
      "class_name": "Equipment",
      "fair_market_value_cents": 200000000,
      "allocated_cents": 200000000,
      "capped_at_fmv": true
    },
    {
      "class_number": 6,
      "class_name": "Customer relationships (§197)",
      "fair_market_value_cents": 150000000,
      "allocated_cents": 150000000,
      "capped_at_fmv": true
    },
    {
      "class_number": 7,
      "class_name": "Goodwill",
      "fair_market_value_cents": 0,
      "allocated_cents": 600000000,
      "capped_at_fmv": false
    }
  ]
}
```

Precision: All allocations are exact integer cents (see the Conventions chapter); no rounding.

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["purchase_price_cents","asset_classes"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model computes the residual-method allocation of purchase price across the seven asset classes from supplied fair market values. Whether a given asset belongs in a given class, whether the supplied fair market values are supportable, and the binding Form 8594 positions the parties will file are determinations for the parties' tax advisors; the model computes the allocation the supplied values imply and renders no valuation or classification opinion.

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

- AUTH-0126 — IRC 368
- AUTH-0243 — Treas. Reg. 1.368


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

- AUTH-0062 — DGCL 251(h)


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

- AUTH-0208 — Rule 14d-10
- AUTH-0209 — Rule 14e-1


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

- AUTH-0124 — IRC 355
- AUTH-0125 — IRC 355(e)


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

- AUTH-0164 — market practice


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

- AUTH-0136 — IRC 721
- AUTH-0123 — IRC 351
- AUTH-0135 — IRC 704(c)


# M146 — Cap-table waterfall

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G15
**Deal contexts:** growth equity · venture

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Computes the ownership split a single priced financing round produces — post-money valuation, and the investor, option-pool, and founder ownership percentages — and the round's liquidation preference at the supplied multiple. It answers, for a founder or investor sizing a round, "after this round and pool, who owns what, and how large is the preference stack on the new money?" It models one round's dilution and its preference; it is not a multi-class exit waterfall.

> **Scope note.** SCOPE (governing rule): the catalog purpose reads "Liquidation preference, participation, seniority, and anti-dilution waterfall," but the reference implementation (MODEL.CAPTABLE.DILUTION.v1) computes only a single-round post-money dilution split (investor / option-pool / founder) and a single-security liquidation preference (round size × preference multiple). It does NOT model participation rights, multi-class seniority ordering, anti-dilution adjustments, or a full exit-proceeds waterfall. Founder decision: (a) rescope the published contract to the single-round dilution + preference model it is (recommended for v1.0), or (b) extend the code to a multi-class exit waterfall. Recorded pending founder sign-off.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M146.schema.json`](M146.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `option_pool_pct` | number | MUST | The post-round option-pool ownership as a fraction (0–1). |
| `pre_money_cents` | integer (cents) | MUST | Pre-money valuation of the round. |
| `round_size_cents` | integer (cents) | MUST | New money raised in the round. |
| `security_terms` | object | MUST | Security economics for the round; recognizes `liquidation_pref_multiple` (number, default 1×). |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `post_money_cents` | integer (cents) | Post-money valuation (pre-money plus round size). |
| `investor_ownership_pct` | number | New-investor ownership as a fraction of the post-money cap table. |
| `option_pool_pct` | number | Option-pool ownership as a fraction, clamped to [0, 1]. |
| `founder_ownership_pct` | number | Residual founder/existing-holder ownership as a fraction. |
| `liquidation_preference_cents` | integer (cents) | The round's liquidation preference (round size × multiple). |

## 4. Algorithm

Given `pre_money_cents`, `round_size_cents`, `option_pool_pct` (as a fraction), and `security_terms` (an object):
1. If any of the four is missing or non-numeric (or `security_terms` is empty), the implementation SHALL return `status: "needs_inputs"` naming the missing fields and emit no outputs.
2. `post_money_cents` SHALL be `pre_money_cents + round_size_cents`.
3. `investor_ownership_pct` SHALL be `round_size_cents ÷ post_money_cents` at full precision, reported at the global 4-decimal precision.
4. `option_pool_pct` SHALL be the supplied option-pool fraction clamped to [0, 1], reported at 4 decimals.
5. `founder_ownership_pct` SHALL be `max(0, 1 − investor_ownership − option_pool)` (computed from the full-precision investor share), reported at 4 decimals.
6. `liquidation_preference_cents` SHALL be `round_size_cents × liquidation_pref_multiple` (from `security_terms`, default 1×), rounded to the nearest cent.

## 5. Constants & authorities

_No numeric constants — this model computes from supplied facts and cited rule text only (attested: `constants: []`)._


**Authorities**

| Authority | ID | Type |
|---|---|---|
| NVCA term sheet | AUTH-0185 | practice-or-guidance |

## 6. Worked example

*A $20M pre-money Series A raising $8M with a 15% option pool leaves founders at 56.4%; the new investors take 28.6% with a 1× liquidation preference of $8M.*

**Inputs**

```json
{
  "pre_money_cents": 2000000000,
  "round_size_cents": 800000000,
  "option_pool_pct": 0.15,
  "security_terms": {
    "liquidation_pref_multiple": 1
  }
}
```

**Outputs (executed against the reference implementation `MODEL.CAPTABLE.DILUTION.v1`)**

```json
{
  "post_money_cents": 2800000000,
  "investor_ownership_pct": 0.2857,
  "option_pool_pct": 0.15,
  "founder_ownership_pct": 0.5643,
  "liquidation_preference_cents": 800000000
}
```

Precision: Monetary outputs are exact integer cents; ownership fractions are rounded per the global rule (half-even to 4 decimals — see the Conventions chapter).

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["pre_money_cents","round_size_cents","option_pool_pct","security_terms"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model computes one round's dilution split and its liquidation preference from supplied round economics. Participation, multi-class seniority, anti-dilution mechanics, and the exit-proceeds waterfall across the full cap table are not modeled here; the terms that govern them, and their enforceability, are determinations for the parties and counsel drafting the financing documents.

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

- AUTH-0181 — Nasdaq Rule 5635


# M148 — Three-prong solvency

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G15, G28, G29
**Deal contexts:** recap · LBO · fraudulent transfer

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Runs the three-prong solvency test that underlies fraudulent-transfer analysis — the balance-sheet (assets over liabilities), cash-flow (projected cash flow over debts due), and capital-adequacy (available over required capital) prongs — from supplied figures, reporting each surplus and pass/fail. It answers, before a leveraged recap or dividend, "does the company clear all three solvency prongs at these numbers?" It computes the prongs; the solvency opinion itself is the financial advisor's.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M148.schema.json`](M148.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `available_capital_cents` | integer (cents) | MUST | Capital available to the business. |
| `debts_due_cents` | integer (cents) | MUST | Debts coming due over the projection. |
| `fair_value_assets_cents` | integer (cents) | MUST | Fair value of assets. |
| `liabilities_cents` | integer (cents) | MUST | Total liabilities. |
| `projected_cash_flow_cents` | integer (cents) | MUST | Projected cash flow available to service debt. |
| `required_capital_cents` | integer (cents) | MUST | Capital the business reasonably requires. |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `balance_sheet_surplus_cents` | integer (cents) | Assets less liabilities. |
| `balance_sheet_prong_passed` | boolean | Whether the balance-sheet prong passes. |
| `cash_flow_surplus_cents` | integer (cents) | Projected cash flow less debts due. |
| `cash_flow_prong_passed` | boolean | Whether the cash-flow prong passes. |
| `capital_adequacy_surplus_cents` | integer (cents) | Available less required capital. |
| `capital_adequacy_prong_passed` | boolean | Whether the capital-adequacy prong passes. |
| `all_prongs_passed` | boolean | Whether all three prongs pass. |
| `solvency_opinion_handoff_required` | boolean | Always true — the solvency opinion routes to the financial advisor. |

## 4. Algorithm

Given `fair_value_assets_cents`, `liabilities_cents`, `projected_cash_flow_cents`, `debts_due_cents`, `available_capital_cents`, and `required_capital_cents`:
1. If any of the six is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.
2. `balance_sheet_surplus_cents` SHALL be `fair_value_assets_cents − liabilities_cents`; `balance_sheet_prong_passed` SHALL be true iff it is non-negative.
3. `cash_flow_surplus_cents` SHALL be `projected_cash_flow_cents − debts_due_cents`; `cash_flow_prong_passed` SHALL be true iff it is non-negative.
4. `capital_adequacy_surplus_cents` SHALL be `available_capital_cents − required_capital_cents`; `capital_adequacy_prong_passed` SHALL be true iff it is non-negative.
5. `all_prongs_passed` SHALL be true iff all three prongs pass; `solvency_opinion_handoff_required` SHALL always be true.

## 5. Constants & authorities

_No numeric constants — this model computes from supplied facts and cited rule text only (attested: `constants: []`)._


**Authorities**

| Authority | ID | Type |
|---|---|---|
| 11 U.S.C. 548 | AUTH-0012 | statute |
| UVTA | AUTH-0259 | practice-or-guidance |
| Tribune | AUTH-0244 | practice-or-guidance |

## 6. Worked example

*A company weighing a recap clears all three solvency prongs: $50M of assets over $45M of liabilities, $8M of projected cash flow over $7M of debts due, and $10M of available capital over $8M required.*

**Inputs**

```json
{
  "fair_value_assets_cents": 5000000000,
  "liabilities_cents": 4500000000,
  "projected_cash_flow_cents": 800000000,
  "debts_due_cents": 700000000,
  "available_capital_cents": 1000000000,
  "required_capital_cents": 800000000
}
```

**Outputs (executed against the reference implementation `MODEL.RESTRUCTURING.SOLVENCY.THREE_PRONG.v1`)**

```json
{
  "balance_sheet_surplus_cents": 500000000,
  "balance_sheet_prong_passed": true,
  "cash_flow_surplus_cents": 100000000,
  "cash_flow_prong_passed": true,
  "capital_adequacy_surplus_cents": 200000000,
  "capital_adequacy_prong_passed": true,
  "all_prongs_passed": true,
  "solvency_opinion_handoff_required": true
}
```

Precision: All surpluses are exact integer cents (see the Conventions chapter); no rounding.

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["fair_value_assets_cents","liabilities_cents","projected_cash_flow_cents","debts_due_cents","available_capital_cents","required_capital_cents"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model runs the three solvency prongs from supplied figures. The fair-value determinations, the reasonableness of the capital and cash-flow assumptions, and the binding solvency opinion are the financial advisor's and counsel's; the model computes the prongs and always routes the opinion, rendering no solvency conclusion.

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

- AUTH-0061 — DGCL 170
- AUTH-0153 — Klang


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

- AUTH-0107 — IRC 108
- AUTH-0128 — IRC 382


# M151 — 363 asset sale mechanics

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G28
**Deal contexts:** distressed sale · 363 sale

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Screens a §363 bankruptcy sale — whether a free-and-clear path is available under any of the five §363(f) prongs, whether the price exceeds the aggregate liens, whether the secured creditor is credit-bid eligible, and the break-up fee as a percentage of price. It answers, in a distressed sale, "can this sell free and clear, is the stalking horse's credit bid allowed, and is the bid protection in range?" It screens the prongs; court approval and the legal conclusions are for the court and counsel.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M151.schema.json`](M151.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `lien_amount_cents` | integer (cents) | MUST | Aggregate liens on the assets. |
| `purchase_price_cents` | integer (cents) | MUST | The §363 sale price. |
| `breakup_fee_cents` | integer (cents) | MAY | Stalking-horse break-up fee (default 0). |
| `cause_to_deny_credit_bid` | boolean | MAY | Whether cause exists to deny the credit bid (default false). |
| `credit_bid_claim_cents` | integer (cents) | MAY | Secured claim available to credit bid (default 0). |
| `section_363f_prongs` | object | MAY | Booleans for the §363(f) prongs: `applicable_non_bankruptcy_law_permits`, `consent`, `price_exceeds_liens`, `bona_fide_dispute`, `could_be_compelled_to_accept_money_satisfaction`. |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `purchase_price_cents` | integer (cents) | The sale price, echoed. |
| `lien_amount_cents` | integer (cents) | Aggregate liens, echoed. |
| `breakup_fee_cents` | integer (cents) | Break-up fee, echoed. |
| `breakup_fee_pct_of_purchase_price` | number | null | Break-up fee as a fraction of price, or null. |
| `free_and_clear_prong_count` | integer | Number of §363(f) prongs satisfied. |
| `free_and_clear_path_available` | boolean | Whether any §363(f) prong is satisfied. |
| `price_exceeds_aggregate_liens` | boolean | Whether the price exceeds the liens. |
| `credit_bid_claim_cents` | integer (cents) | Credit-bid claim, echoed. |
| `credit_bid_eligible` | boolean | Whether the secured creditor may credit bid. |
| `court_approval_required` | boolean | Always true — the sale requires court approval. |
| `section_363f_prongs` | object[] | Per-prong result: `{ prong, passed }`. |

## 4. Algorithm

Given `purchase_price_cents` and `lien_amount_cents`, plus optional `breakup_fee_cents` (default 0), `credit_bid_claim_cents` (default 0), `cause_to_deny_credit_bid` (default false), `section_363f_prongs`:
1. If either required input is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.
2. `price_exceeds_aggregate_liens` SHALL be true iff `purchase_price_cents > lien_amount_cents`.
3. It SHALL evaluate the five §363(f) prongs (non-bankruptcy law permits; consent; price exceeds liens — defaulting to the computed comparison; bona-fide dispute; could be compelled to accept a money satisfaction); `free_and_clear_prong_count` SHALL be the number satisfied and `free_and_clear_path_available` SHALL be true iff any is satisfied.
4. `credit_bid_eligible` SHALL be true iff a positive credit-bid claim exists and there is no cause to deny it.
5. `breakup_fee_pct_of_purchase_price` SHALL be `breakup_fee_cents ÷ purchase_price_cents`; `court_approval_required` SHALL always be true.

## 5. Constants & authorities

_No numeric constants — this model computes from supplied facts and cited rule text only (attested: `constants: []`)._


**Authorities**

| Authority | ID | Type |
|---|---|---|
| 11 U.S.C. 363 | AUTH-0008 | statute |
| 11 U.S.C. 365 | AUTH-0010 | statute |
| RadLAX | AUTH-0200 | practice-or-guidance |
| Fisker | AUTH-0073 | practice-or-guidance |

## 6. Worked example

*A $30M stalking-horse §363 bid over $25M of liens: the price exceeds the liens and the debtor consents, so a free-and-clear path is available; the $20M secured claim is credit-bid eligible and the 3% break-up fee is in range — all subject to court approval.*

**Inputs**

```json
{
  "purchase_price_cents": 3000000000,
  "lien_amount_cents": 2500000000,
  "breakup_fee_cents": 90000000,
  "credit_bid_claim_cents": 2000000000,
  "cause_to_deny_credit_bid": false,
  "section_363f_prongs": {
    "consent": true
  }
}
```

**Outputs (executed against the reference implementation `MODEL.RESTRUCTURING.363_SALE.v1`)**

```json
{
  "purchase_price_cents": 3000000000,
  "lien_amount_cents": 2500000000,
  "breakup_fee_cents": 90000000,
  "breakup_fee_pct_of_purchase_price": 0.03,
  "free_and_clear_prong_count": 2,
  "free_and_clear_path_available": true,
  "price_exceeds_aggregate_liens": true,
  "credit_bid_claim_cents": 2000000000,
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

Precision: The break-up-fee percentage rounds per the global rule (half-even to 4 decimals — see the Conventions chapter); amounts are exact integer cents.

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["purchase_price_cents","lien_amount_cents"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model screens the §363(f) prongs, the credit-bid eligibility, and the bid protection from supplied facts. Whether a prong is in fact met, whether cause exists to deny a credit bid, and whether the sale should be approved are determinations for the court and counsel; the model screens the prongs and always routes court approval, rendering no legal conclusion.

## 9. Conformance bindings

Requirement `REQ-M151` is verified by 2 published case(s): `CONF.MODEL.RESTRUCT.363.001`, `CONF.MODEL.RESTRUCT.363.002`.

## 10. Version

Reference binding `MODEL.RESTRUCTURING.363_SALE.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M152 — Plan feasibility

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G28
**Deal contexts:** Chapter 11 plan

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Tests a Chapter 11 plan's feasibility across a multi-period forecast — the DSCR and ending-liquidity floors each period, the minimum projected DSCR and liquidity, and a downside cash-flow sensitivity — from supplied projections. It answers, for a plan proponent, "does the plan service its debt and hold liquidity every period, and how much cushion is there against a downturn?" It computes the floors and sensitivity; the §1129(a)(11) feasibility opinion is the financial advisor's.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M152.schema.json`](M152.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `forecast_periods` | object[] | MUST | Forecast periods; each carries `period`/`year` (string), and integer-cents `cash_flow_cents` (or `ebitda_cents`), `capex_cents`, `working_capital_need_cents`, `debt_service_cents`, and `ending_liquidity_cents`. |
| `minimum_dscr` | number | MAY | The DSCR floor the plan must clear each period (default 1.0). |
| `minimum_liquidity_cents` | integer (cents) | MAY | The ending-liquidity floor each period (default 0). |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `period_count` | integer | Number of forecast periods. |
| `minimum_dscr_floor` | number | The DSCR floor applied. |
| `minimum_liquidity_floor_cents` | integer (cents) | The liquidity floor applied. |
| `minimum_projected_dscr` | number | null | The lowest DSCR across periods, or null. |
| `minimum_projected_liquidity_cents` | integer (cents) | The lowest ending liquidity across periods. |
| `dscr_floor_breached` | boolean | Whether any period breaches the DSCR floor. |
| `liquidity_floor_breached` | boolean | Whether any period breaches the liquidity floor. |
| `feasible_under_inputs` | boolean | Whether every period clears both floors. |
| `feasibility_opinion_handoff_required` | boolean | Always true — the feasibility opinion routes to the financial advisor. |
| `forecast_rows` | object[] | Per-period detail: `{ period, cash_flow_cents, capex_cents, working_capital_need_cents, available_for_debt_service_cents, debt_service_cents, dscr, ending_liquidity_cents, dscr_floor_passed, liquidity_floor_passed }`. |
| `cash_flow_sensitivity_cases` | object[] | Downside cases: `{ cash_flow_change_pct, minimum_dscr, dscr_floor_passed }` for −10% and −20%. |

## 4. Algorithm

Given `forecast_periods` (a list of period objects), plus optional `minimum_dscr` (default 1.0) and `minimum_liquidity_cents` (default 0):
1. If `forecast_periods` is empty, the implementation SHALL return `status: "needs_inputs"` naming `forecast_periods`.
2. For each period, cash available for debt service SHALL be `cash_flow − capex − working_capital_need`; `dscr` SHALL be that over debt service (or null when debt service is zero); `dscr_floor_passed` and `liquidity_floor_passed` SHALL test the period against the DSCR and liquidity floors.
3. `minimum_projected_dscr` and `minimum_projected_liquidity_cents` SHALL be the minima across periods; `dscr_floor_breached` and `liquidity_floor_breached` SHALL be true iff any period fails; `feasible_under_inputs` SHALL be true iff every period clears both floors.
4. It SHALL compute a −10% and a −20% cash-flow downside sensitivity, reporting each case's minimum DSCR and whether it still clears the floor.
5. `feasibility_opinion_handoff_required` SHALL always be true; it SHALL return the full per-period and sensitivity detail.

## 5. Constants & authorities

_No numeric constants — this model computes from supplied facts and cited rule text only (attested: `constants: []`)._


**Authorities**

| Authority | ID | Type |
|---|---|---|
| 11 U.S.C. 1129(a)(11) | AUTH-0003 | statute |

## 6. Worked example

*A two-year plan forecast holds DSCR above the 1.1× floor (1.42× then 1.15×), but year-two ending liquidity of $750k breaches the $1.0M floor, so the plan is not feasible under the inputs — the feasibility opinion routes out, with −10%/−20% downside cases computed.*

**Inputs**

```json
{
  "minimum_dscr": 1.1,
  "minimum_liquidity_cents": 100000000,
  "forecast_periods": [
    {
      "year": "2026",
      "cash_flow_cents": 1000000000,
      "capex_cents": 100000000,
      "working_capital_need_cents": 50000000,
      "debt_service_cents": 600000000,
      "ending_liquidity_cents": 200000000
    },
    {
      "year": "2027",
      "cash_flow_cents": 900000000,
      "capex_cents": 100000000,
      "working_capital_need_cents": 50000000,
      "debt_service_cents": 650000000,
      "ending_liquidity_cents": 75000000
    }
  ]
}
```

**Outputs (executed against the reference implementation `MODEL.RESTRUCTURING.PLAN_FEASIBILITY.v1`)**

```json
{
  "period_count": 2,
  "minimum_dscr_floor": 1.1,
  "minimum_liquidity_floor_cents": 100000000,
  "minimum_projected_dscr": 1.1538,
  "minimum_projected_liquidity_cents": 75000000,
  "dscr_floor_breached": false,
  "liquidity_floor_breached": true,
  "feasible_under_inputs": false,
  "feasibility_opinion_handoff_required": true,
  "forecast_rows": [
    {
      "period": "2026",
      "cash_flow_cents": 1000000000,
      "capex_cents": 100000000,
      "working_capital_need_cents": 50000000,
      "available_for_debt_service_cents": 850000000,
      "debt_service_cents": 600000000,
      "dscr": 1.4167,
      "ending_liquidity_cents": 200000000,
      "dscr_floor_passed": true,
      "liquidity_floor_passed": true
    },
    {
      "period": "2027",
      "cash_flow_cents": 900000000,
      "capex_cents": 100000000,
      "working_capital_need_cents": 50000000,
      "available_for_debt_service_cents": 750000000,
      "debt_service_cents": 650000000,
      "dscr": 1.1538,
      "ending_liquidity_cents": 75000000,
      "dscr_floor_passed": true,
      "liquidity_floor_passed": false
    }
  ],
  "cash_flow_sensitivity_cases": [
    {
      "cash_flow_change_pct": -0.1,
      "minimum_dscr": 1.0154,
      "dscr_floor_passed": false
    },
    {
      "cash_flow_change_pct": -0.2,
      "minimum_dscr": 0.8769,
      "dscr_floor_passed": false
    }
  ]
}
```

Precision: DSCRs round per the global rule (half-even to 4 decimals — see the Conventions chapter); liquidity is exact integer cents.

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["forecast_periods"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model tests the DSCR and liquidity floors and the downside sensitivity from supplied projections. Whether the projections are reasonable and whether the plan is feasible under §1129(a)(11) are determinations for the financial advisor and the court; the model computes the floors and always routes the feasibility opinion, rendering no conclusion.

## 9. Conformance bindings

Requirement `REQ-M152` is verified by 2 published case(s): `CONF.MODEL.RESTRUCT.FEASIBILITY.001`, `CONF.MODEL.RESTRUCT.FEASIBILITY.002`.

## 10. Version

Reference binding `MODEL.RESTRUCTURING.PLAN_FEASIBILITY.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M153 — Best-interests-of-creditors

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G28
**Deal contexts:** Chapter 11 plan

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Runs the §1129(a)(7) best-interests test class by class — each class's plan recovery versus its hypothetical Chapter 7 liquidation recovery — and flags any class that would do better in liquidation. It answers, for a plan proponent, "does every class get at least as much under the plan as it would in a Chapter 7?" It computes the per-class comparison and the shortfall; the liquidation valuation and the legal conclusion are the advisor's and counsel's.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M153.schema.json`](M153.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `creditor_classes` | object[] | MUST | Creditor classes; each carries `class_name` (string), `allowed_claim_cents`, `plan_distribution_cents`, and `chapter7_distribution_cents` (integer cents). |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `class_count` | integer | Number of creditor classes. |
| `total_allowed_claims_cents` | integer (cents) | Total allowed claims. |
| `total_plan_distribution_cents` | integer (cents) | Total plan distributions. |
| `total_chapter7_distribution_cents` | integer (cents) | Total hypothetical Chapter 7 distributions. |
| `all_classes_pass_best_interests` | boolean | Whether every class passes the best-interests test. |
| `failing_class_count` | integer | Number of classes that fail. |
| `disclosure_statement_exhibit_handoff_required` | boolean | Always true — the liquidation-analysis exhibit routes to counsel. |
| `class_rows` | object[] | Per-class detail: `{ class_name, allowed_claim_cents, plan_distribution_cents, chapter7_distribution_cents, plan_recovery_pct, chapter7_recovery_pct, best_interests_shortfall_cents, best_interests_passed }`. |

## 4. Algorithm

Given `creditor_classes` (a list of class objects, each with an allowed claim, a plan distribution, and a Chapter 7 distribution):
1. If `creditor_classes` is empty, the implementation SHALL return `status: "needs_inputs"` naming `creditor_classes`.
2. For each class, `plan_recovery_pct` and `chapter7_recovery_pct` SHALL be the plan and Chapter 7 distributions over the allowed claim; `best_interests_shortfall_cents` SHALL be `max(0, chapter7_distribution − plan_distribution)`; `best_interests_passed` SHALL be true iff the plan distribution is at or above the Chapter 7 distribution.
3. It SHALL total allowed claims, plan distributions, and Chapter 7 distributions.
4. `all_classes_pass_best_interests` SHALL be true iff every class passes; `failing_class_count` SHALL count the failures.
5. `disclosure_statement_exhibit_handoff_required` SHALL always be true; it SHALL return the full per-class detail.

## 5. Constants & authorities

_No numeric constants — this model computes from supplied facts and cited rule text only (attested: `constants: []`)._


**Authorities**

| Authority | ID | Type |
|---|---|---|
| 11 U.S.C. 1129(a)(7) | AUTH-0004 | statute |
| 11 U.S.C. 726 | AUTH-0013 | statute |

## 6. Worked example

*Two classes tested against a hypothetical Chapter 7: the secured class recovers 100% under the plan versus 90% in liquidation and passes, but the unsecured class's 25% plan recovery falls below its 30% liquidation recovery — a $1M best-interests shortfall — so one class fails and the exhibit routes out.*

**Inputs**

```json
{
  "creditor_classes": [
    {
      "class_name": "Secured",
      "allowed_claim_cents": 1000000000,
      "plan_distribution_cents": 1000000000,
      "chapter7_distribution_cents": 900000000
    },
    {
      "class_name": "Unsecured",
      "allowed_claim_cents": 2000000000,
      "plan_distribution_cents": 500000000,
      "chapter7_distribution_cents": 600000000
    }
  ]
}
```

**Outputs (executed against the reference implementation `MODEL.RESTRUCTURING.BIOC.v1`)**

```json
{
  "class_count": 2,
  "total_allowed_claims_cents": 3000000000,
  "total_plan_distribution_cents": 1500000000,
  "total_chapter7_distribution_cents": 1500000000,
  "all_classes_pass_best_interests": false,
  "failing_class_count": 1,
  "disclosure_statement_exhibit_handoff_required": true,
  "class_rows": [
    {
      "class_name": "Secured",
      "allowed_claim_cents": 1000000000,
      "plan_distribution_cents": 1000000000,
      "chapter7_distribution_cents": 900000000,
      "plan_recovery_pct": 1,
      "chapter7_recovery_pct": 0.9,
      "best_interests_shortfall_cents": 0,
      "best_interests_passed": true
    },
    {
      "class_name": "Unsecured",
      "allowed_claim_cents": 2000000000,
      "plan_distribution_cents": 500000000,
      "chapter7_distribution_cents": 600000000,
      "plan_recovery_pct": 0.25,
      "chapter7_recovery_pct": 0.3,
      "best_interests_shortfall_cents": 100000000,
      "best_interests_passed": false
    }
  ]
}
```

Precision: Recovery percentages round per the global rule (half-even to 4 decimals — see the Conventions chapter); amounts are exact integer cents.

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["creditor_classes"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model runs the best-interests comparison from supplied plan and liquidation figures. The hypothetical Chapter 7 valuation, and whether the plan satisfies §1129(a)(7), are determinations for the financial advisor and the court; the model computes the comparison and always routes the exhibit, rendering no legal conclusion.

## 9. Conformance bindings

Requirement `REQ-M153` is verified by 2 published case(s): `CONF.MODEL.RESTRUCT.BIOC.001`, `CONF.MODEL.RESTRUCT.BIOC.002`.

## 10. Version

Reference binding `MODEL.RESTRUCTURING.BIOC.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M154 — Absolute priority rule and new value

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G28
**Deal contexts:** Chapter 11 cramdown

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Tests a cramdown plan against the absolute priority rule — for each impaired, non-accepting class not paid in full, whether any junior class receives value — and scaffolds the new-value exception (contribution, new money, necessity, market test, reasonable equivalence). It answers, in a cramdown, "does any junior class get value over the head of a senior class that isn't paid in full?" It flags the APR issues and organizes the new-value elements; the court determines APR compliance.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M154.schema.json`](M154.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `classes` | object[] | MUST | Plan classes; each carries `class_name` (string), `priority_rank` (integer), `allowed_claim_cents`, `plan_distribution_cents` (integer cents), `impaired` (boolean), and `accepted` (boolean). |
| `new_value` | object | MAY | The new-value exception scaffold: `contribution_cents` (integer cents) and the booleans `new_money_or_money_worth`, `necessary_to_reorganization`, `market_test_completed`, `reasonably_equivalent_value`. |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `class_count` | integer | Number of classes. |
| `absolute_priority_issue_count` | integer | Number of absolute-priority issues found. |
| `absolute_priority_issues` | object[] | Per-issue detail: `{ senior_class_name, senior_recovery_pct, junior_value_cents }`. |
| `apr_clear_under_inputs` | boolean | Whether the plan clears the absolute priority rule under the inputs. |
| `new_value_scaffold` | object | The new-value elements: `{ contribution_cents, new_money_or_money_worth, necessary_to_reorganization, market_test_completed, reasonably_equivalent_value }`. |
| `new_value_scaffold_complete` | boolean | Whether all five new-value elements are affirmatively present. |
| `court_determination_required` | boolean | Always true — APR compliance is a court determination. |
| `class_rows` | object[] | Per-class detail (rank-sorted): `{ class_name, priority_rank, allowed_claim_cents, plan_distribution_cents, recovery_pct, impaired, accepted }`. |

## 4. Algorithm

Given `classes` (a list of class objects) and optional `new_value` (an object):
1. If `classes` is empty, the implementation SHALL return `status: "needs_inputs"` naming `classes`.
2. It SHALL sort classes by priority rank and, for each impaired class that has not accepted, is not paid in full, and has a positive claim, sum the plan distributions to all junior classes; a positive junior value SHALL raise an absolute-priority issue naming the senior class, its recovery, and the junior value.
3. `absolute_priority_issue_count` SHALL be the number of issues; `apr_clear_under_inputs` SHALL be true iff there are none.
4. It SHALL assemble the new-value scaffold from the supplied contribution and the four qualitative elements; `new_value_scaffold_complete` SHALL be true iff all five elements are affirmatively present.
5. `court_determination_required` SHALL always be true; it SHALL return the full ranked class detail.

## 5. Constants & authorities

_No numeric constants — this model computes from supplied facts and cited rule text only (attested: `constants: []`)._


**Authorities**

| Authority | ID | Type |
|---|---|---|
| 11 U.S.C. 1129(b) | AUTH-0005 | statute |
| 203 N. LaSalle | AUTH-0017 | practice-or-guidance |
| Castleton Plaza | AUTH-0047 | practice-or-guidance |

## 6. Worked example

*A three-class plan: the senior secured class is unimpaired, but the unsecured class is crammed down to 20% while the equity class beneath it keeps $1M — an absolute-priority violation the plan must cure — so the court determination is required.*

**Inputs**

```json
{
  "classes": [
    {
      "class_name": "Senior secured",
      "priority_rank": 1,
      "allowed_claim_cents": 1500000000,
      "plan_distribution_cents": 1500000000,
      "accepted": true
    },
    {
      "class_name": "Unsecured",
      "priority_rank": 2,
      "allowed_claim_cents": 1000000000,
      "plan_distribution_cents": 200000000,
      "impaired": true,
      "accepted": false
    },
    {
      "class_name": "Equity",
      "priority_rank": 3,
      "allowed_claim_cents": 0,
      "plan_distribution_cents": 100000000
    }
  ]
}
```

**Outputs (executed against the reference implementation `MODEL.RESTRUCTURING.APR_NEW_VALUE.v1`)**

```json
{
  "class_count": 3,
  "absolute_priority_issue_count": 1,
  "absolute_priority_issues": [
    {
      "senior_class_name": "Unsecured",
      "senior_recovery_pct": 0.2,
      "junior_value_cents": 100000000
    }
  ],
  "apr_clear_under_inputs": false,
  "new_value_scaffold": {
    "contribution_cents": 0,
    "new_money_or_money_worth": null,
    "necessary_to_reorganization": null,
    "market_test_completed": null,
    "reasonably_equivalent_value": null
  },
  "new_value_scaffold_complete": false,
  "court_determination_required": true,
  "class_rows": [
    {
      "class_name": "Senior secured",
      "priority_rank": 1,
      "allowed_claim_cents": 1500000000,
      "plan_distribution_cents": 1500000000,
      "recovery_pct": 1,
      "impaired": false,
      "accepted": true
    },
    {
      "class_name": "Unsecured",
      "priority_rank": 2,
      "allowed_claim_cents": 1000000000,
      "plan_distribution_cents": 200000000,
      "recovery_pct": 0.2,
      "impaired": true,
      "accepted": false
    },
    {
      "class_name": "Equity",
      "priority_rank": 3,
      "allowed_claim_cents": 0,
      "plan_distribution_cents": 100000000,
      "recovery_pct": 0,
      "impaired": false,
      "accepted": false
    }
  ]
}
```

Precision: Recovery percentages round per the global rule (half-even to 4 decimals — see the Conventions chapter); amounts are exact integer cents.

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["classes"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model flags absolute-priority issues and organizes the new-value elements from supplied class facts. Whether the absolute priority rule is in fact violated and whether the new-value exception is available are determinations for the court; the model surfaces the issues and always routes the determination, rendering no legal conclusion.

## 9. Conformance bindings

Requirement `REQ-M154` is verified by 2 published case(s): `CONF.MODEL.RESTRUCT.APR.001`, `CONF.MODEL.RESTRUCT.APR.002`.

## 10. Version

Reference binding `MODEL.RESTRUCTURING.APR_NEW_VALUE.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M155 — Cramdown interest rate

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G28
**Deal contexts:** Chapter 11 cramdown

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Computes the cramdown interest rate under both frameworks — the Till formula (a base rate plus a risk premium) and, where the circuit applies it and a market exists, the efficient-market rate — and selects which governs, reporting the indicated rate. It answers, in a cramdown, "what rate does the plan owe a crammed-down secured creditor, and which framework does this circuit use?" It computes both and selects per the circuit; the court sets the final rate.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M155.schema.json`](M155.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `base_rate` | number | MUST | The Till base rate (e.g., prime), as a fraction. |
| `risk_premium` | number | MUST | The Till risk premium, as a fraction. |
| `circuit` | string | MAY | The federal circuit (e.g., 2d, 5th, 6th, 8th); selects the framework. |
| `efficient_market_exists` | boolean | MAY | Whether an efficient market exists (defaults to whether a rate is supplied). |
| `efficient_market_rate` | number | MAY | An observed efficient-market rate, as a fraction; optional. |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `base_rate` | number | The base rate, echoed. |
| `risk_premium` | number | The risk premium, echoed. |
| `till_formula_rate` | number | Base rate plus risk premium. |
| `efficient_market_rate` | number | null | The efficient-market rate, or null. |
| `circuit` | string | null | The circuit, echoed, or null. |
| `efficient_market_framework_supported` | boolean | Whether the circuit applies the efficient-market framework. |
| `selected_framework` | enum(cramdown_framework) | Which framework governs. One of `efficient_market`, `till_formula`. |
| `indicated_cramdown_rate` | number | The rate the selected framework indicates. |
| `court_sets_final_rate` | boolean | Always true — the court sets the final rate. |

## 4. Algorithm

Given `base_rate` and `risk_premium`, plus optional `efficient_market_rate`, `efficient_market_exists`, `circuit`:
1. If either required rate is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.
2. `till_formula_rate` SHALL be `base_rate + risk_premium`.
3. `efficient_market_framework_supported` SHALL be true iff the circuit is one that applies the efficient-market framework (2d, 5th, 6th, 8th).
4. The efficient-market rate SHALL govern iff a market exists, an efficient-market rate is supplied, and the circuit supports the framework; `selected_framework` SHALL be `efficient_market` or `till_formula` accordingly.
5. `indicated_cramdown_rate` SHALL be the selected framework's rate (all rates at the global 4-decimal precision); `court_sets_final_rate` SHALL always be true.

## 5. Constants & authorities

_No numeric constants — this model computes from supplied facts and cited rule text only (attested: `constants: []`)._


**Authorities**

| Authority | ID | Type |
|---|---|---|
| Till | AUTH-0236 | practice-or-guidance |
| MPM Silicones | AUTH-0177 | practice-or-guidance |
| Texas Grand Prairie | AUTH-0234 | practice-or-guidance |
| Topp | AUTH-0237 | practice-or-guidance |

## 6. Worked example

*A Sixth Circuit cramdown with an available 10% efficient-market rate: because the circuit applies the efficient-market framework and a market exists, the 10% market rate governs over the 11% Till formula rate (8% base plus a 3% risk premium) — the court sets the final rate.*

**Inputs**

```json
{
  "base_rate": 0.08,
  "risk_premium": 0.03,
  "efficient_market_rate": 0.1,
  "efficient_market_exists": true,
  "circuit": "6th"
}
```

**Outputs (executed against the reference implementation `MODEL.RESTRUCTURING.CRAMDOWN_RATE.v1`)**

```json
{
  "base_rate": 0.08,
  "risk_premium": 0.03,
  "till_formula_rate": 0.11,
  "efficient_market_rate": 0.1,
  "circuit": "6th",
  "efficient_market_framework_supported": true,
  "selected_framework": "efficient_market",
  "indicated_cramdown_rate": 0.1,
  "court_sets_final_rate": true
}
```

Precision: All rates round per the global rule (half-even to 4 decimals — see the Conventions chapter).

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["base_rate","risk_premium"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model computes the Till and efficient-market rates and selects per the circuit from supplied inputs. Whether an efficient market in fact exists, the correct risk premium, and the final cramdown rate are determinations for the court; the model computes both frameworks and always defers the final rate, rendering no rate determination.

## 9. Conformance bindings

Requirement `REQ-M155` is verified by 2 published case(s): `CONF.MODEL.RESTRUCT.CRAMDOWN.001`, `CONF.MODEL.RESTRUCT.CRAMDOWN.002`.

## 10. Version

Reference binding `MODEL.RESTRUCTURING.CRAMDOWN_RATE.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M156 — 1111(b) election trade-off

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G28
**Deal contexts:** undersecured Chapter 11 creditor

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Evaluates an undersecured creditor's §1111(b) election — the no-election value (collateral value plus deficiency recovery) against the election value (the plan payment stream's aggregate and present value) — and screens eligibility, the two election tests, and the class vote. It answers, for an undersecured creditor, "am I better off electing §1111(b) to keep my full-claim lien, or taking the deficiency recovery?" It computes the trade-off; the election filing is counsel's.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M156.schema.json`](M156.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `allowed_claim_cents` | integer (cents) | MUST | The creditor's total allowed claim. |
| `collateral_value_cents` | integer (cents) | MUST | Value of the collateral (the secured portion). |
| `discount_rate` | number | MUST | The discount rate for the payment-stream NPV (a fraction). |
| `plan_payment_stream_cents` | integer (cents)[] | MUST | The plan's payment stream, one integer-cents payment per period. |
| `class_vote_amount_pct` | number | MAY | Class support by amount, as a fraction; optional. |
| `class_vote_number_pct` | number | MAY | Class support by number, as a fraction; optional. |
| `guc_recovery_pct` | number | MAY | General-unsecured recovery on the deficiency, as a fraction (default 0). |
| `interest_inconsequential` | boolean | MAY | Whether the secured interest is of inconsequential value (default false); defeats eligibility. |
| `property_sold_under_363_or_plan` | boolean | MAY | Whether the property is sold under §363 or the plan (default false); with recourse, defeats eligibility. |
| `recourse` | boolean | MAY | Whether the claim is recourse (default true). |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `allowed_claim_cents` | integer (cents) | The allowed claim, echoed. |
| `collateral_value_cents` | integer (cents) | The collateral value, echoed. |
| `deficiency_claim_cents` | integer (cents) | The deficiency (claim over collateral). |
| `guc_recovery_pct` | number | The deficiency recovery rate applied. |
| `no_election_value_cents` | integer (cents) | Value without electing (collateral plus deficiency recovery). |
| `election_aggregate_payments_cents` | integer (cents) | Aggregate face of the payment stream. |
| `election_npv_cents` | integer (cents) | Present value of the payment stream. |
| `election_eligible` | boolean | Whether the §1111(b) election is available. |
| `election_vote_passed` | boolean | null | Whether the class vote clears §1126(c), or null when votes are not supplied. |
| `aggregate_face_test_passed` | boolean | Whether aggregate payments meet or exceed the allowed claim. |
| `collateral_npv_test_passed` | boolean | Whether the payment-stream NPV meets or exceeds the collateral value. |
| `value_delta_election_vs_no_election_cents` | integer (cents) | Election NPV less no-election value (positive favors electing). |
| `election_filing_handoff_required` | boolean | Always true — the election filing routes to counsel. |

## 4. Algorithm

Given `allowed_claim_cents`, `collateral_value_cents`, `plan_payment_stream_cents` (a list), and `discount_rate`, plus optional `guc_recovery_pct` (default 0), `recourse` (default true), `property_sold_under_363_or_plan` (default false), `interest_inconsequential` (default false), the class-vote percentages:
1. If any required input is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.
2. `deficiency_claim_cents` SHALL be `max(0, allowed_claim_cents − collateral_value_cents)`; `no_election_value_cents` SHALL be `collateral_value_cents + round(deficiency × guc_recovery_pct)`.
3. `election_aggregate_payments_cents` SHALL be the sum of the payment stream; `election_npv_cents` SHALL be its present value at the discount rate.
4. `election_eligible` SHALL be false when the interest is inconsequential or the claim is recourse and the property is sold; `aggregate_face_test_passed` (aggregate ≥ claim) and `collateral_npv_test_passed` (NPV ≥ collateral value) SHALL be reported; the class vote passes iff it clears the §1126(c) acceptance thresholds (constants: §1126(c) class-acceptance thresholds).
5. `value_delta_election_vs_no_election_cents` SHALL be `election_npv_cents − no_election_value_cents`; `election_filing_handoff_required` SHALL always be true.

## 5. Constants & authorities

| Constant | Value | Strength | Authority | Pin-cite | Effective | Next check |
|---|---|---|---|---|---|---|
| §1126(c) class-acceptance thresholds | at least two-thirds in amount and more than one-half in number of claims actually voting | MUST (binding) | 11 U.S.C. § 1126(c) | § 1126(c) | current (Bankruptcy Code as amended) | on statutory amendment |


**Authorities**

| Authority | ID | Type |
|---|---|---|
| 11 U.S.C. 1111(b) | AUTH-0001 | statute |

## 6. Worked example

*An undersecured creditor with a $10M claim against $6M collateral weighs the election: without electing it recovers $6.4M (collateral plus a 10% deficiency recovery); electing gives up the deficiency, but the $7.5M payment stream's ~$5.69M present value falls short of the collateral value, so the election destroys value here — the filing routes to counsel.*

**Inputs**

```json
{
  "allowed_claim_cents": 1000000000,
  "collateral_value_cents": 600000000,
  "plan_payment_stream_cents": [
    150000000,
    150000000,
    150000000,
    150000000,
    150000000
  ],
  "discount_rate": 0.1,
  "guc_recovery_pct": 0.1,
  "class_vote_amount_pct": 0.75,
  "class_vote_number_pct": 0.6
}
```

**Outputs (executed against the reference implementation `MODEL.RESTRUCTURING.1111B_ELECTION.v1`)**

```json
{
  "allowed_claim_cents": 1000000000,
  "collateral_value_cents": 600000000,
  "deficiency_claim_cents": 400000000,
  "guc_recovery_pct": 0.1,
  "no_election_value_cents": 640000000,
  "election_aggregate_payments_cents": 750000000,
  "election_npv_cents": 568618015,
  "election_eligible": true,
  "election_vote_passed": true,
  "aggregate_face_test_passed": false,
  "collateral_npv_test_passed": false,
  "value_delta_election_vs_no_election_cents": -71381985,
  "election_filing_handoff_required": true
}
```

Precision: Values and NPV are exact integer cents; the deficiency-recovery percentage rounds per the global rule (half-even to 4 decimals — see the Conventions chapter).

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["allowed_claim_cents","collateral_value_cents","plan_payment_stream_cents","discount_rate"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model computes the §1111(b) trade-off from supplied figures. Whether the election is available on the facts, the correct collateral valuation and discount rate, and the filing decision are determinations for counsel and the financial advisor; the model computes the comparison and always routes the filing, rendering no election recommendation.

## 9. Conformance bindings

Requirement `REQ-M156` is verified by 2 published case(s): `CONF.MODEL.RESTRUCT.1111B.001`, `CONF.MODEL.RESTRUCT.1111B.002`.

## 10. Version

Reference binding `MODEL.RESTRUCTURING.1111B_ELECTION.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M157 — 726 Chapter 7 waterfall

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G28
**Deal contexts:** Chapter 7 · liquidation analysis

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Distributes a Chapter 7 estate down the §507/§726 priority ladder — net of the trustee fee, paying each priority rank in turn until the estate is exhausted — and reports each class's distribution and recovery and any residual to equity. It answers, in a liquidation, "how far down the priority waterfall does the estate reach, and what does each class recover?" It computes the waterfall; the claim allowances and priorities are legal determinations.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M157.schema.json`](M157.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `claims` | object[] | MUST | Claim classes; each carries `class_name` (string), `priority_rank` (integer), and `allowed_claim_cents` (integer cents). |
| `estate_value_cents` | integer (cents) | MUST | The gross Chapter 7 estate value. |
| `trustee_fee_cents` | integer (cents) | MAY | Trustee fee deducted before distribution (default 0). |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `estate_value_cents` | integer (cents) | The estate value, echoed. |
| `trustee_fee_cents` | integer (cents) | The trustee fee, echoed. |
| `distributable_estate_cents` | integer (cents) | Estate net of the trustee fee. |
| `total_claims_cents` | integer (cents) | Total allowed claims. |
| `total_distributed_cents` | integer (cents) | Total distributed across all classes. |
| `residual_to_equity_cents` | integer (cents) | Remainder to equity after all claims. |
| `waterfall_rows` | object[] | Per-class detail (rank-sorted): `{ class_name, priority_rank, allowed_claim_cents, distribution_cents, recovery_pct }`. |

## 4. Algorithm

Given `estate_value_cents` and `claims` (a list of class objects), plus optional `trustee_fee_cents` (default 0):
1. If either required input is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.
2. `distributable_estate_cents` SHALL be `max(0, estate_value_cents − trustee_fee_cents)`.
3. It SHALL sort claims by priority rank and, for each in turn, distribute `min(remaining, allowed_claim)` and reduce the remainder; `recovery_pct` SHALL be the distribution over the allowed claim.
4. `total_claims_cents` and `total_distributed_cents` SHALL be the sums; `residual_to_equity_cents` SHALL be the remainder after all claims.
5. It SHALL return the full per-class waterfall detail.

## 5. Constants & authorities

_No numeric constants — this model computes from supplied facts and cited rule text only (attested: `constants: []`)._


**Authorities**

| Authority | ID | Type |
|---|---|---|
| 11 U.S.C. 507 | AUTH-0011 | statute |
| 11 U.S.C. 726 | AUTH-0013 | statute |

## 6. Worked example

*A $10M Chapter 7 estate, net of a $500k trustee fee, distributes $9.5M by statutory priority: the $6M secured and $1M priority claims are paid in full and the $8M unsecured class recovers about 31%, with nothing left for equity.*

**Inputs**

```json
{
  "estate_value_cents": 1000000000,
  "trustee_fee_cents": 50000000,
  "claims": [
    {
      "class_name": "Secured",
      "priority_rank": 1,
      "allowed_claim_cents": 600000000
    },
    {
      "class_name": "Priority",
      "priority_rank": 2,
      "allowed_claim_cents": 100000000
    },
    {
      "class_name": "Unsecured",
      "priority_rank": 3,
      "allowed_claim_cents": 800000000
    }
  ]
}
```

**Outputs (executed against the reference implementation `MODEL.RESTRUCTURING.CH7_WATERFALL.v1`)**

```json
{
  "estate_value_cents": 1000000000,
  "trustee_fee_cents": 50000000,
  "distributable_estate_cents": 950000000,
  "total_claims_cents": 1500000000,
  "total_distributed_cents": 950000000,
  "residual_to_equity_cents": 0,
  "waterfall_rows": [
    {
      "class_name": "Secured",
      "priority_rank": 1,
      "allowed_claim_cents": 600000000,
      "distribution_cents": 600000000,
      "recovery_pct": 1
    },
    {
      "class_name": "Priority",
      "priority_rank": 2,
      "allowed_claim_cents": 100000000,
      "distribution_cents": 100000000,
      "recovery_pct": 1
    },
    {
      "class_name": "Unsecured",
      "priority_rank": 3,
      "allowed_claim_cents": 800000000,
      "distribution_cents": 250000000,
      "recovery_pct": 0.3125
    }
  ]
}
```

Precision: Recovery percentages round per the global rule (half-even to 4 decimals — see the Conventions chapter); amounts are exact integer cents.

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["estate_value_cents","claims"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model computes the Chapter 7 distribution waterfall from supplied estate and claim figures. The allowance and priority ranking of claims, and the trustee-fee determination, are legal and court determinations; the model computes the waterfall the supplied ranks and amounts imply and renders no allowance or priority conclusion.

## 9. Conformance bindings

Requirement `REQ-M157` is verified by 2 published case(s): `CONF.MODEL.RESTRUCT.CH7.001`, `CONF.MODEL.RESTRUCT.CH7.002`.

## 10. Version

Reference binding `MODEL.RESTRUCTURING.CH7_WATERFALL.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M158 — 364 DIP sizing

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G28, G29
**Deal contexts:** DIP financing

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Sizes a debtor-in-possession facility — the new liquidity need (13-week cash need plus the minimum-liquidity cushion, net of opening cash), the required commitment including any roll-up and professional-fee carve-out, the new-money component, and the roll-up as a percentage of the facility. It answers, at the front of a Chapter 11, "how big does the DIP need to be, and how much of it is new money versus a roll-up?" It sizes the facility; court approval and the priming fight are for the court and counsel.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M158.schema.json`](M158.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `minimum_liquidity_cents` | integer (cents) | MUST | Minimum-liquidity cushion the facility must maintain. |
| `thirteen_week_cash_need_cents` | integer (cents) | MUST | Net cash need over the 13-week budget. |
| `new_money_minimum_cents` | integer (cents) | MAY | A floor on the new-money component (default 0). |
| `opening_cash_cents` | integer (cents) | MAY | Cash on hand at filing (default 0). |
| `priming_requested` | boolean | MAY | Whether the DIP primes existing liens (default false). |
| `professional_fee_carveout_cents` | integer (cents) | MAY | Professional-fee carve-out (default 0). |
| `rollup_amount_cents` | integer (cents) | MAY | Prepetition debt rolled into the DIP (default 0). |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `thirteen_week_cash_need_cents` | integer (cents) | The 13-week cash need, echoed. |
| `opening_cash_cents` | integer (cents) | Opening cash, echoed. |
| `minimum_liquidity_cents` | integer (cents) | Minimum liquidity, echoed. |
| `liquidity_need_cents` | integer (cents) | New liquidity the DIP must supply. |
| `rollup_amount_cents` | integer (cents) | Roll-up amount, echoed. |
| `professional_fee_carveout_cents` | integer (cents) | Professional-fee carve-out, echoed. |
| `required_dip_commitment_cents` | integer (cents) | Total required DIP commitment. |
| `new_money_component_cents` | integer (cents) | The new-money portion of the facility. |
| `rollup_pct_of_commitment` | number | null | Roll-up as a fraction of the commitment, or null. |
| `priming_requested` | boolean | Whether priming is requested. |
| `court_approval_required` | boolean | Always true — the DIP requires court approval. |

## 4. Algorithm

Given `thirteen_week_cash_need_cents` and `minimum_liquidity_cents`, plus optional `opening_cash_cents` (default 0), `rollup_amount_cents` (default 0), `professional_fee_carveout_cents` (default 0), `new_money_minimum_cents` (default 0), `priming_requested` (default false):
1. If either required input is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.
2. `liquidity_need_cents` SHALL be `max(0, thirteen_week_cash_need_cents + minimum_liquidity_cents − opening_cash_cents)`.
3. `required_dip_commitment_cents` SHALL be the greater of (`liquidity_need + rollup + carveout`) and (`new_money_minimum + rollup + carveout`).
4. `new_money_component_cents` SHALL be `max(new_money_minimum_cents, liquidity_need_cents)`; `rollup_pct_of_commitment` SHALL be `rollup ÷ required_commitment` (or null).
5. `court_approval_required` SHALL always be true.

## 5. Constants & authorities

_No numeric constants — this model computes from supplied facts and cited rule text only (attested: `constants: []`)._


**Authorities**

| Authority | ID | Type |
|---|---|---|
| 11 U.S.C. 364 | AUTH-0009 | statute |
| Collier 364.06 | AUTH-0053 | practice-or-guidance |

## 6. Worked example

*A DIP for an $8M 13-week cash need plus a $2M liquidity cushion against $1M of opening cash needs $9M of new liquidity; with a $10M roll-up and a $1.5M professional-fee carve-out the facility totals $20.5M (about 49% roll-up), and priming is requested — subject to court approval.*

**Inputs**

```json
{
  "thirteen_week_cash_need_cents": 800000000,
  "minimum_liquidity_cents": 200000000,
  "opening_cash_cents": 100000000,
  "rollup_amount_cents": 1000000000,
  "professional_fee_carveout_cents": 150000000,
  "new_money_minimum_cents": 500000000,
  "priming_requested": true
}
```

**Outputs (executed against the reference implementation `MODEL.RESTRUCTURING.DIP_SIZING.v1`)**

```json
{
  "thirteen_week_cash_need_cents": 800000000,
  "opening_cash_cents": 100000000,
  "minimum_liquidity_cents": 200000000,
  "liquidity_need_cents": 900000000,
  "rollup_amount_cents": 1000000000,
  "professional_fee_carveout_cents": 150000000,
  "required_dip_commitment_cents": 2050000000,
  "new_money_component_cents": 900000000,
  "rollup_pct_of_commitment": 0.4878,
  "priming_requested": true,
  "court_approval_required": true
}
```

Precision: The roll-up percentage rounds per the global rule (half-even to 4 decimals — see the Conventions chapter); amounts are exact integer cents.

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["thirteen_week_cash_need_cents","minimum_liquidity_cents"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model sizes the DIP facility from supplied budget and structure figures. The adequacy of the budget, whether priming is warranted, and the approval of the facility are determinations for the court and the parties; the model computes the sizing and always routes court approval, rendering no approval conclusion.

## 9. Conformance bindings

Requirement `REQ-M158` is verified by 2 published case(s): `CONF.MODEL.RESTRUCT.DIP.001`, `CONF.MODEL.RESTRUCT.DIP.002`.

## 10. Version

Reference binding `MODEL.RESTRUCTURING.DIP_SIZING.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M159 — Fulcrum security

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G28
**Deal contexts:** distressed-for-control

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Allocates enterprise value down the capital stack by priority to find the fulcrum security — the tranche where value breaks, recovering more than zero but less than par — reporting each tranche's recovery and any residual value. It answers, in a distressed-for-control situation, "at this enterprise value, which tranche is the fulcrum that converts to the equity?" It computes the break from supplied tranches; the enterprise valuation is the financial advisor's.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M159.schema.json`](M159.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `enterprise_value_cents` | integer (cents) | MUST | The enterprise value to distribute. |
| `tranches` | object[] | MUST | Capital-stack tranches; each carries `tranche_name` (string), `priority_rank` (integer), and `claim_cents` (integer cents). |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `enterprise_value_cents` | integer (cents) | The enterprise value, echoed. |
| `total_claims_cents` | integer (cents) | Total claims across the stack. |
| `residual_value_cents` | integer (cents) | Value remaining after all tranches. |
| `fulcrum_tranche` | string | null | The fulcrum tranche name, or null. |
| `financial_advisor_ev_handoff_required` | boolean | Always true — the enterprise valuation routes to the financial advisor. |
| `tranche_rows` | object[] | Per-tranche detail (rank-sorted): `{ tranche_name, priority_rank, claim_cents, value_allocated_cents, recovery_pct }`. |

## 4. Algorithm

Given `enterprise_value_cents` and `tranches` (a list of tranche objects):
1. If either required input is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.
2. It SHALL sort tranches by priority rank and, for each in turn, allocate `min(remaining_value, claim)` and reduce the remaining value; `recovery_pct` SHALL be the allocation over the claim.
3. `fulcrum_tranche` SHALL be the first tranche whose recovery is strictly between zero and par; if none, it SHALL fall back to the first fully-unpaid tranche, else the last fully-paid tranche.
4. `total_claims_cents` SHALL be the sum of claims; `residual_value_cents` SHALL be the value left after all tranches.
5. `financial_advisor_ev_handoff_required` SHALL always be true; it SHALL return the full per-tranche detail.

## 5. Constants & authorities

_No numeric constants — this model computes from supplied facts and cited rule text only (attested: `constants: []`)._


**Authorities**

| Authority | ID | Type |
|---|---|---|
| market practice | AUTH-0164 | practice-or-guidance |

## 6. Worked example

*At a $50M enterprise value across an $80M capital stack, the revolver and term loan recover in full, the senior notes recover 40% — the fulcrum security where value breaks — and the sub notes are out of the money; the valuation routes to the financial advisor.*

**Inputs**

```json
{
  "enterprise_value_cents": 5000000000,
  "tranches": [
    {
      "tranche_name": "Revolver",
      "priority_rank": 1,
      "claim_cents": 1000000000
    },
    {
      "tranche_name": "Term Loan",
      "priority_rank": 2,
      "claim_cents": 3000000000
    },
    {
      "tranche_name": "Senior Notes",
      "priority_rank": 3,
      "claim_cents": 2500000000
    },
    {
      "tranche_name": "Sub Notes",
      "priority_rank": 4,
      "claim_cents": 1500000000
    }
  ]
}
```

**Outputs (executed against the reference implementation `MODEL.RESTRUCTURING.FULCRUM_SECURITY.v1`)**

```json
{
  "enterprise_value_cents": 5000000000,
  "total_claims_cents": 8000000000,
  "residual_value_cents": 0,
  "fulcrum_tranche": "Senior Notes",
  "financial_advisor_ev_handoff_required": true,
  "tranche_rows": [
    {
      "tranche_name": "Revolver",
      "priority_rank": 1,
      "claim_cents": 1000000000,
      "value_allocated_cents": 1000000000,
      "recovery_pct": 1
    },
    {
      "tranche_name": "Term Loan",
      "priority_rank": 2,
      "claim_cents": 3000000000,
      "value_allocated_cents": 3000000000,
      "recovery_pct": 1
    },
    {
      "tranche_name": "Senior Notes",
      "priority_rank": 3,
      "claim_cents": 2500000000,
      "value_allocated_cents": 1000000000,
      "recovery_pct": 0.4
    },
    {
      "tranche_name": "Sub Notes",
      "priority_rank": 4,
      "claim_cents": 1500000000,
      "value_allocated_cents": 0,
      "recovery_pct": 0
    }
  ]
}
```

Precision: Recovery percentages round per the global rule (half-even to 4 decimals — see the Conventions chapter); amounts are exact integer cents.

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["enterprise_value_cents","tranches"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model finds the fulcrum security by allocating a supplied enterprise value down the stack. The enterprise valuation itself — the hardest and most contested input — is the financial advisor's determination, not the model's; the model computes the break the supplied value implies and always routes the valuation.

## 9. Conformance bindings

Requirement `REQ-M159` is verified by 2 published case(s): `CONF.MODEL.RESTRUCT.FULCRUM.001`, `CONF.MODEL.RESTRUCT.FULCRUM.002`.

## 10. Version

Reference binding `MODEL.RESTRUCTURING.FULCRUM_SECURITY.v1` · entered the specification at internal lineage stage `v1_1` · spec v1.0.0.


# M160 — Exchange offer and distressed-debt exchange

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G29
**Deal contexts:** out-of-court restructuring

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Sizes a distressed-debt exchange — the participation rate against any minimum, the holdout debt, the exchange discount (old over new security value), and the CODI exposure (participating debt over new security value). It answers, in an out-of-court restructuring, "does the exchange clear its minimum participation, how much debt holds out, and what cancellation-of-debt income does it create?" It computes the economics; the CODI and holdout treatment are counsel's and the tax advisor's.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M160.schema.json`](M160.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `new_security_value_cents` | integer (cents) | MUST | Value of the new securities issued. |
| `outstanding_debt_cents` | integer (cents) | MUST | Total outstanding debt eligible to exchange. |
| `participating_debt_cents` | integer (cents) | MUST | Debt tendered into the exchange. |
| `minimum_participation_pct` | number | MAY | Minimum participation condition, as a fraction (default 0). |
| `old_security_value_cents` | integer (cents) | MAY | Market value of the old securities; defaults to participating debt. |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `outstanding_debt_cents` | integer (cents) | Outstanding debt, echoed. |
| `participating_debt_cents` | integer (cents) | Participating debt, echoed. |
| `holdout_debt_cents` | integer (cents) | Debt that does not tender. |
| `participation_pct` | number | Participating over outstanding debt. |
| `minimum_participation_pct` | number | The minimum participation condition applied. |
| `minimum_participation_satisfied` | boolean | Whether participation meets the minimum. |
| `old_security_value_cents` | integer (cents) | Old-security value used. |
| `new_security_value_cents` | integer (cents) | New-security value, echoed. |
| `exchange_discount_cents` | integer (cents) | Old-security value over new-security value. |
| `codi_exposure_cents` | integer (cents) | Cancellation-of-debt income exposure. |
| `counsel_review_required` | boolean | Always true — the CODI and holdout analysis routes to counsel. |

## 4. Algorithm

Given `outstanding_debt_cents`, `participating_debt_cents`, and `new_security_value_cents`, plus optional `minimum_participation_pct` (default 0), `old_security_value_cents` (default: participating debt):
1. If any required input is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.
2. `participation_pct` SHALL be `participating_debt_cents ÷ outstanding_debt_cents`; `minimum_participation_satisfied` SHALL be true iff it meets or exceeds the minimum.
3. `holdout_debt_cents` SHALL be `max(0, outstanding_debt_cents − participating_debt_cents)`.
4. `exchange_discount_cents` SHALL be `max(0, old_security_value_cents − new_security_value_cents)`.
5. `codi_exposure_cents` SHALL be `max(0, participating_debt_cents − new_security_value_cents)`; `counsel_review_required` SHALL always be true.

## 5. Constants & authorities

_No numeric constants — this model computes from supplied facts and cited rule text only (attested: `constants: []`)._


**Authorities**

| Authority | ID | Type |
|---|---|---|
| Securities Act 3(a)(9) | AUTH-0218 | statute |
| TIA 316(b) | AUTH-0235 | practice-or-guidance |

## 6. Worked example

*A distressed exchange: $85M of $100M notes tender (85%, short of the 90% minimum), leaving $15M of holdouts; swapping $85M of old debt for $70M of new securities creates a $15M exchange discount and $15M of CODI exposure — the tax and holdout analysis routes to counsel.*

**Inputs**

```json
{
  "outstanding_debt_cents": 10000000000,
  "participating_debt_cents": 8500000000,
  "new_security_value_cents": 7000000000,
  "minimum_participation_pct": 0.9
}
```

**Outputs (executed against the reference implementation `MODEL.RESTRUCTURING.EXCHANGE_OFFER.v1`)**

```json
{
  "outstanding_debt_cents": 10000000000,
  "participating_debt_cents": 8500000000,
  "holdout_debt_cents": 1500000000,
  "participation_pct": 0.85,
  "minimum_participation_pct": 0.9,
  "minimum_participation_satisfied": false,
  "old_security_value_cents": 8500000000,
  "new_security_value_cents": 7000000000,
  "exchange_discount_cents": 1500000000,
  "codi_exposure_cents": 1500000000,
  "counsel_review_required": true
}
```

Precision: The participation percentage rounds per the global rule (half-even to 4 decimals — see the Conventions chapter); amounts are exact integer cents.

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["outstanding_debt_cents","participating_debt_cents","new_security_value_cents"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model sizes the exchange economics from supplied figures. The CODI computation and its exclusions, the §3(a)(9) and TIA §316(b) analysis, and the holdout strategy are determinations for the tax advisor and counsel; the model computes the participation, discount, and CODI exposure and always routes the review, rendering no tax or legal conclusion.

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

- AUTH-0219 — Serta Simmons
- AUTH-0173 — Mitel


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

- AUTH-0150 — J. Crew
- AUTH-0066 — Envision
- AUTH-0198 — Pluralsight


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

- AUTH-0038 — At Home
- AUTH-0245 — Trinseo
- AUTH-0212 — Sabre
- AUTH-0022 — ABA Business Law Today


# M164 — RSA economics

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G28, G29
**Deal contexts:** restructuring support agreement

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Reads a restructuring support agreement's class support against the §1126(c) acceptance thresholds, and tallies the milestone schedule, termination events, fiduciary-out, and toggle structure. It answers, before signing an RSA, "which classes already clear the confirmation thresholds, and what are the milestone and termination terms?" It computes the support screen and the counts; the enforceability and adequacy of the RSA are counsel's.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M164.schema.json`](M164.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `classes` | object[] | MUST | Supporting classes; each carries `class_name` (string) and `support_amount_pct` and `support_number_pct` (numbers, fractions). |
| `fiduciary_out_present` | boolean | MAY | Whether the RSA contains a fiduciary out (default false). |
| `milestones` | object[] | MAY | RSA milestones; each carries a `name` (string) and `completed` (boolean). |
| `termination_events` | string[] | MAY | Named termination events. |
| `toggle_type` | string | MAY | The plan-toggle structure (e.g., free-fall, prearranged); echoed. |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `class_count` | integer | Number of supporting classes. |
| `support_threshold_class_count` | integer | Classes clearing the §1126(c) thresholds. |
| `all_classes_meet_support_thresholds` | boolean | Whether every class clears the thresholds. |
| `milestone_count` | integer | Number of milestones. |
| `open_milestone_count` | integer | Number of incomplete milestones. |
| `termination_event_count` | integer | Number of termination events. |
| `fiduciary_out_present` | boolean | Whether a fiduciary out is present. |
| `toggle_type` | string | The toggle structure, echoed. |
| `counsel_review_required` | boolean | Always true — the RSA routes to counsel. |
| `class_rows` | object[] | Per-class detail: `{ class_name, support_amount_pct, support_number_pct, section_1126c_threshold_met }`. |

## 4. Algorithm

Given `classes` (a list of class objects), plus optional `milestones`, `termination_events`, `fiduciary_out_present` (default false), `toggle_type`:
1. If `classes` is empty, the implementation SHALL return `status: "needs_inputs"` naming `classes`.
2. For each class, `section_1126c_threshold_met` SHALL be true iff support by amount and by number clears the §1126(c) acceptance thresholds (constants: §1126(c) class-acceptance thresholds).
3. `support_threshold_class_count` SHALL count the classes clearing the thresholds; `all_classes_meet_support_thresholds` SHALL be true iff every class clears them.
4. `milestone_count` and `open_milestone_count` (incomplete milestones) and `termination_event_count` SHALL be counted.
5. `counsel_review_required` SHALL always be true; it SHALL return the full per-class support detail.

## 5. Constants & authorities

| Constant | Value | Strength | Authority | Pin-cite | Effective | Next check |
|---|---|---|---|---|---|---|
| §1126(c) class-acceptance thresholds | at least two-thirds in amount and more than one-half in number of claims actually voting | MUST (binding) | 11 U.S.C. § 1126(c) | § 1126(c) | current (Bankruptcy Code as amended) | on statutory amendment |


**Authorities**

| Authority | ID | Type |
|---|---|---|
| 11 U.S.C. 1125 | AUTH-0002 | statute |
| Indianapolis Downs | AUTH-0099 | practice-or-guidance |

## 6. Worked example

*An RSA with two classes: the secured class clears the §1126(c) thresholds (85% by amount, 75% by number) but the unsecured class does not (60% by amount); two milestones (one open), two termination events, a fiduciary out, and a free-fall toggle — counsel reviews.*

**Inputs**

```json
{
  "classes": [
    {
      "class_name": "Secured",
      "support_amount_pct": 0.85,
      "support_number_pct": 0.75
    },
    {
      "class_name": "Unsecured",
      "support_amount_pct": 0.6,
      "support_number_pct": 0.55
    }
  ],
  "milestones": [
    {
      "name": "File plan",
      "completed": true
    },
    {
      "name": "Confirmation",
      "completed": false
    }
  ],
  "termination_events": [
    "missed_milestone",
    "material_adverse_change"
  ],
  "fiduciary_out_present": true,
  "toggle_type": "free_fall"
}
```

**Outputs (executed against the reference implementation `MODEL.RESTRUCTURING.RSA_ECONOMICS.v1`)**

```json
{
  "class_count": 2,
  "support_threshold_class_count": 1,
  "all_classes_meet_support_thresholds": false,
  "milestone_count": 2,
  "open_milestone_count": 1,
  "termination_event_count": 2,
  "fiduciary_out_present": true,
  "toggle_type": "free_fall",
  "counsel_review_required": true,
  "class_rows": [
    {
      "class_name": "Secured",
      "support_amount_pct": 0.85,
      "support_number_pct": 0.75,
      "section_1126c_threshold_met": true
    },
    {
      "class_name": "Unsecured",
      "support_amount_pct": 0.6,
      "support_number_pct": 0.55,
      "section_1126c_threshold_met": false
    }
  ]
}
```

Precision: Support percentages round per the global rule (half-even to 4 decimals — see the Conventions chapter); the rest are counts and booleans.

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["classes"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model screens RSA class support against §1126(c) and tallies the milestone and termination terms. Whether the RSA is enforceable, whether the solicitation complies with §1125, and the adequacy of the fiduciary out are determinations for counsel; the model computes the support screen and always routes the review, rendering no enforceability conclusion.

## 9. Conformance bindings

Requirement `REQ-M164` is verified by 2 published case(s): `CONF.MODEL.RESTRUCT.RSA.001`, `CONF.MODEL.RESTRUCT.RSA.002`.

## 10. Version

Reference binding `MODEL.RESTRUCTURING.RSA_ECONOMICS.v1` · entered the specification at internal lineage stage `v1_1` · spec v1.0.0.


# M165 — ABC and Article 9 foreclosure recovery

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G28
**Deal contexts:** out-of-court liquidation

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Distributes an out-of-court liquidation — an assignment for the benefit of creditors or an Article 9 foreclosure — down the priority ladder net of the assignee fee and sale costs, and checks the disposition notice against the Article 9 floor. It answers, in an out-of-court wind-down, "what does each creditor class recover, and does the sale notice satisfy Article 9?" It computes the waterfall and the notice screen; commercial reasonableness and the legal conclusions are counsel's.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M165.schema.json`](M165.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `claims` | object[] | MUST | Claim classes; each carries `class_name` (string), `priority_rank` (integer), and `claim_cents` (integer cents). |
| `liquidation_value_cents` | integer (cents) | MUST | Gross liquidation proceeds. |
| `assignee_fee_cents` | integer (cents) | MAY | Assignee/foreclosure fee (default 0). |
| `commercially_reasonable_sale` | boolean | MAY | Whether the sale is asserted commercially reasonable; echoed for counsel. |
| `notice_days` | number | MAY | Days of disposition notice given (default 10). |
| `sale_costs_cents` | integer (cents) | MAY | Sale costs (default 0). |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `liquidation_value_cents` | integer (cents) | Liquidation value, echoed. |
| `assignee_fee_cents` | integer (cents) | Assignee fee, echoed. |
| `sale_costs_cents` | integer (cents) | Sale costs, echoed. |
| `distributable_value_cents` | integer (cents) | Proceeds net of fee and costs. |
| `notice_days` | integer | Notice days given, echoed. |
| `article9_notice_floor_days` | integer | The Article 9 notice floor. |
| `notice_floor_satisfied` | boolean | Whether the notice clears the Article 9 floor. |
| `commercially_reasonable_sale` | boolean | null | The commercial-reasonableness assertion, echoed, or null. |
| `total_distributed_cents` | integer (cents) | Total distributed across classes. |
| `residual_value_cents` | integer (cents) | Value remaining after all claims. |
| `counsel_review_required` | boolean | Always true — the disposition routes to counsel. |
| `distribution_rows` | object[] | Per-class detail (rank-sorted): `{ class_name, priority_rank, claim_cents, distribution_cents, recovery_pct }`. |

## 4. Algorithm

Given `liquidation_value_cents` and `claims` (a list of class objects), plus optional `assignee_fee_cents` (default 0), `sale_costs_cents` (default 0), `notice_days` (default 10), `commercially_reasonable_sale`:
1. If either required input is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.
2. `distributable_value_cents` SHALL be `max(0, liquidation_value_cents − assignee_fee_cents − sale_costs_cents)`.
3. It SHALL sort claims by priority rank and distribute `min(remaining, claim)` down the ladder; `recovery_pct` SHALL be the distribution over the claim.
4. `notice_floor_satisfied` SHALL be true iff `notice_days` meets or exceeds the Article 9 notice floor (constants: Article 9 disposition-notice floor).
5. `total_distributed_cents` and `residual_value_cents` SHALL be reported; `counsel_review_required` SHALL always be true.

## 5. Constants & authorities

| Constant | Value | Strength | Authority | Pin-cite | Effective | Next check |
|---|---|---|---|---|---|---|
| Article 9 disposition-notice floor | 10 days | MUST (binding) | U.C.C. § 9-612(b) | § 9-612(b) (non-consumer 10-day safe harbor) | U.C.C. Article 9 (2010 revision), current | on uniform-act amendment |


**Authorities**

| Authority | ID | Type |
|---|---|---|
| UCC 9-610 | AUTH-0249 | statute |
| UCC 9-611 | AUTH-0250 | statute |
| UCC 9-615 | AUTH-0251 | statute |
| State ABC Law | AUTH-0224 | statute |

## 6. Worked example

*An out-of-court Article 9 / ABC liquidation of an $8M estate, net of a $400k assignee fee and $200k of sale costs, distributes $7.4M: the $5M secured claim is paid in full and the $6M unsecured class recovers 40%; the 15-day notice clears the 10-day Article 9 floor — counsel confirms commercial reasonableness.*

**Inputs**

```json
{
  "liquidation_value_cents": 800000000,
  "assignee_fee_cents": 40000000,
  "sale_costs_cents": 20000000,
  "notice_days": 15,
  "commercially_reasonable_sale": true,
  "claims": [
    {
      "class_name": "Secured",
      "priority_rank": 1,
      "claim_cents": 500000000
    },
    {
      "class_name": "Unsecured",
      "priority_rank": 2,
      "claim_cents": 600000000
    }
  ]
}
```

**Outputs (executed against the reference implementation `MODEL.RESTRUCTURING.ABC_ARTICLE9.v1`)**

```json
{
  "liquidation_value_cents": 800000000,
  "assignee_fee_cents": 40000000,
  "sale_costs_cents": 20000000,
  "distributable_value_cents": 740000000,
  "notice_days": 15,
  "article9_notice_floor_days": 10,
  "notice_floor_satisfied": true,
  "commercially_reasonable_sale": true,
  "total_distributed_cents": 740000000,
  "residual_value_cents": 0,
  "counsel_review_required": true,
  "distribution_rows": [
    {
      "class_name": "Secured",
      "priority_rank": 1,
      "claim_cents": 500000000,
      "distribution_cents": 500000000,
      "recovery_pct": 1
    },
    {
      "class_name": "Unsecured",
      "priority_rank": 2,
      "claim_cents": 600000000,
      "distribution_cents": 240000000,
      "recovery_pct": 0.4
    }
  ]
}
```

Precision: Recovery percentages round per the global rule (half-even to 4 decimals — see the Conventions chapter); amounts are exact integer cents.

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["liquidation_value_cents","claims"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model computes the out-of-court recovery waterfall and the notice screen from supplied figures. Whether the disposition is commercially reasonable, the validity of the assignment or foreclosure, and the priority of claims are legal determinations for counsel; the model computes the waterfall and the notice screen and always routes the review, rendering no legal conclusion.

## 9. Conformance bindings

Requirement `REQ-M165` is verified by 2 published case(s): `CONF.MODEL.RESTRUCT.ABC_ARTICLE9.001`, `CONF.MODEL.RESTRUCT.ABC_ARTICLE9.002`.

## 10. Version

Reference binding `MODEL.RESTRUCTURING.ABC_ARTICLE9.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M166 — Claims trading recovery

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G28
**Deal contexts:** claims trading

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Prices a bankruptcy-claim purchase — the expected ultimate recovery on the face amount, the gross profit over the purchase price, and the annualized IRR over the time to resolution. It answers, for a claims trader, "what does this claim return if it recovers as expected, and by when?" It computes the return from a supplied (or regression-implied) recovery rate; the Rule 3001 transfer mechanics are for counsel.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M166.schema.json`](M166.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `expected_recovery_rate` | number | MUST | Expected ultimate recovery as a fraction of face; if omitted, implied from a post-default trading price. |
| `face_amount_cents` | integer (cents) | MUST | Face amount of the claim. |
| `purchase_price_cents` | integer (cents) | MUST | Price paid for the claim. |
| `time_to_recovery_years` | number | MUST | Years to expected resolution. |
| `post_default_trading_price` | number | MAY | Post-default trading price (fraction of face); drives the regression when no rate is supplied. |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `face_amount_cents` | integer (cents) | Face amount, echoed. |
| `purchase_price_cents` | integer (cents) | Purchase price, echoed. |
| `post_default_trading_price` | number | null | The post-default trading price, echoed, or null. |
| `expected_recovery_rate` | number | The expected recovery rate applied. |
| `expected_recovery_cents` | integer (cents) | Expected ultimate recovery on the face. |
| `gross_profit_cents` | integer (cents) | Expected recovery less purchase price. |
| `estimated_irr` | number | null | Annualized IRR to resolution, or null. |
| `frbp_transfer_review_required` | boolean | Always true — the Rule 3001 transfer routes to counsel. |

## 4. Algorithm

Given `face_amount_cents`, `purchase_price_cents`, `time_to_recovery_years`, and `expected_recovery_rate` (supplied, or implied from a post-default trading price via the recovery regression — constants: Moody's ultimate-recovery regression):
1. If any of the four is missing (and no recovery rate can be resolved), the implementation SHALL return `status: "needs_inputs"` and emit no outputs.
2. `expected_recovery_cents` SHALL be `round(face_amount_cents × expected_recovery_rate)`.
3. `gross_profit_cents` SHALL be `expected_recovery_cents − purchase_price_cents`.
4. `estimated_irr` SHALL be `(expected_recovery_cents ÷ purchase_price_cents)^(1 ÷ time_to_recovery_years) − 1` when the price and horizon are positive, else null.
5. `frbp_transfer_review_required` SHALL always be true; rates and the IRR are at the global 4-decimal precision.

## 5. Constants & authorities

| Constant | Value | Strength | Authority | Pin-cite | Effective | Next check |
|---|---|---|---|---|---|---|
| Moody's ultimate-recovery regression | expected recovery ≈ 0.90 × post-default trading price + 0.06 (fallback when no recovery rate is supplied) | SHOULD (cited median) | Moody's Ultimate Recovery Database (2024) | post-default-price-to-ultimate-recovery regression | 2024 dataset | on dataset update |


**Authorities**

| Authority | ID | Type |
|---|---|---|
| Moody's Ultimate Recovery Database | AUTH-0174 | practice-or-guidance |
| FRBP 3001 | AUTH-0075 | practice-or-guidance |

## 6. Worked example

*Buying a $10M defaulted claim for $4M with an expected 55% ultimate recovery ($5.5M) over two years to resolution: the $1.5M gross profit implies about a 17% annualized IRR — the Rule 3001 transfer review is required.*

**Inputs**

```json
{
  "face_amount_cents": 1000000000,
  "purchase_price_cents": 400000000,
  "time_to_recovery_years": 2,
  "expected_recovery_rate": 0.55
}
```

**Outputs (executed against the reference implementation `MODEL.RESTRUCTURING.CLAIMS_TRADING.v1`)**

```json
{
  "face_amount_cents": 1000000000,
  "purchase_price_cents": 400000000,
  "post_default_trading_price": null,
  "expected_recovery_rate": 0.55,
  "expected_recovery_cents": 550000000,
  "gross_profit_cents": 150000000,
  "estimated_irr": 0.1726,
  "frbp_transfer_review_required": true
}
```

Precision: The recovery rate and IRR round per the global rule (half-even to 4 decimals — see the Conventions chapter); amounts are exact integer cents.

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["face_amount_cents","purchase_price_cents","time_to_recovery_years","expected_recovery_rate"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model prices a claim purchase from a supplied or regression-implied recovery rate. The actual ultimate recovery, the resolution timing, and the Rule 3001 transfer-of-claim mechanics are uncertain and legal; the model computes the return the assumptions imply and always routes the transfer review, rendering no recovery guarantee.

## 9. Conformance bindings

Requirement `REQ-M166` is verified by 2 published case(s): `CONF.MODEL.RESTRUCT.CLAIMS.001`, `CONF.MODEL.RESTRUCT.CLAIMS.002`.

## 10. Version

Reference binding `MODEL.RESTRUCTURING.CLAIMS_TRADING.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M167 — Subchapter V eligibility

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G28
**Deal contexts:** small business Chapter 11

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Screens Subchapter V small-business eligibility — whether aggregate noncontingent, liquidated debt is at or below the debt limit, whether the debtor is engaged in commercial activity, and whether it is disqualified as an affiliate of a public issuer. It answers, for a small business considering Subchapter V, "do we fit under the debt limit and the eligibility gates?" It runs the screen; the current debt limit and the eligibility conclusion are the debtor's counsel's.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M167.schema.json`](M167.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `aggregate_noncontingent_liquidated_debt_cents` | integer (cents) | MUST | Aggregate noncontingent, liquidated debt. |
| `engaged_in_commercial_activity` | boolean | MUST | Whether the debtor is engaged in commercial or business activity. |
| `affiliate_of_public_issuer` | boolean | MAY | Whether the debtor is an affiliate of an SEC issuer (default false); a disqualifier. |
| `debt_limit_cents` | integer (cents) | MAY | Override for the debt limit; defaults to the reverted statutory limit. |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `aggregate_noncontingent_liquidated_debt_cents` | integer (cents) | The aggregate debt, echoed. |
| `debt_limit_cents` | integer (cents) | The debt limit applied. |
| `debt_limit_satisfied` | boolean | Whether the debt is within the limit. |
| `engaged_in_commercial_activity` | boolean | The commercial-activity flag, echoed. |
| `affiliate_of_public_issuer` | boolean | The public-issuer-affiliate flag, echoed. |
| `subchapter_v_eligible_under_inputs` | boolean | Whether the debtor is eligible under the inputs. |
| `current_threshold_handoff_note` | string | Note that the reverted limit is used unless overridden. |

## 4. Algorithm

Given `aggregate_noncontingent_liquidated_debt_cents` and `engaged_in_commercial_activity`, plus optional `affiliate_of_public_issuer` (default false), `debt_limit_cents` (default: the Subchapter V debt limit):
1. If either required input is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.
2. `debt_limit_cents` SHALL be the supplied override, else the Subchapter V debt limit (constants: Subchapter V debt limit).
3. `debt_limit_satisfied` SHALL be true iff the aggregate debt is at or below the limit.
4. `subchapter_v_eligible_under_inputs` SHALL be true iff the debt limit is satisfied AND the debtor is engaged in commercial activity AND it is not an affiliate of a public issuer.
5. It SHALL emit a note that the reverted debt limit is used unless overridden.

## 5. Constants & authorities

| Constant | Value | Strength | Authority | Pin-cite | Effective | Next check |
|---|---|---|---|---|---|---|
| Subchapter V debt limit | $3,024,725 (302,472,500 cents) | MUST (binding) | 11 U.S.C. § 1182(1) | § 1182(1) (reverted debt limit after the SBRA increase lapsed) | current (post-2024 sunset) | on Congressional reauthorization |


**Authorities**

| Authority | ID | Type |
|---|---|---|
| 11 U.S.C. 1181-1195 | AUTH-0007 | statute |

## 6. Worked example

*A small business with $2.5M of noncontingent, liquidated debt, engaged in commercial activity and not an affiliate of a public issuer, sits under the reverted $3,024,725 Subchapter V debt limit and is eligible under the inputs.*

**Inputs**

```json
{
  "aggregate_noncontingent_liquidated_debt_cents": 250000000,
  "engaged_in_commercial_activity": true,
  "affiliate_of_public_issuer": false
}
```

**Outputs (executed against the reference implementation `MODEL.RESTRUCTURING.SUBCHAPTER_V_ELIGIBILITY.v1`)**

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

Precision: All amounts are exact integer cents (see the Conventions chapter); no rounding.

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["aggregate_noncontingent_liquidated_debt_cents","engaged_in_commercial_activity"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model screens Subchapter V eligibility against the debt limit and the eligibility gates. The current debt limit (which has shifted with legislation), whether debts are noncontingent and liquidated, and the ultimate eligibility conclusion are determinations for the debtor's counsel; the model runs the screen and renders no eligibility opinion.

## 9. Conformance bindings

Requirement `REQ-M167` is verified by 2 published case(s): `CONF.MODEL.RESTRUCT.SUBV.001`, `CONF.MODEL.RESTRUCT.SUBV.002`.

## 10. Version

Reference binding `MODEL.RESTRUCTURING.SUBCHAPTER_V_ELIGIBILITY.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M168 — Chapter 22 recidivism score

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G28
**Deal contexts:** post-emergence

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Scores a reorganized company's risk of a repeat filing (a "Chapter 22") from four post-emergence drivers — exit leverage, months of liquidity, EBITDA growth, and prior-bankruptcy history — into a 0–100 recidivism score and a risk band. It answers, at emergence, "how likely is this company to be back in bankruptcy, on these post-emergence fundamentals?" It computes a calibrated heuristic score; the underlying judgment is the financial advisor's.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M168.schema.json`](M168.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `ebitda_growth_pct` | number | MUST | Projected EBITDA growth as a fraction (negative = decline). |
| `exit_leverage` | number | MUST | Net debt / EBITDA at emergence. |
| `liquidity_months` | number | MUST | Months of liquidity runway at emergence. |
| `prior_bankruptcy_count` | number | MAY | Number of prior bankruptcy filings (default 0). |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `exit_leverage` | number | Exit leverage, echoed. |
| `liquidity_months` | number | Liquidity months, echoed. |
| `ebitda_growth_pct` | number | EBITDA growth, echoed. |
| `prior_bankruptcy_count` | number | Prior-bankruptcy count, echoed. |
| `chapter22_recidivism_score` | integer | The 0–100 recidivism score. |
| `risk_band` | enum(chapter22_risk_band) | The risk band the score falls into. One of `high`, `watch`, `lower`. |
| `financial_advisor_handoff_required` | boolean | Always true — the judgment routes to the financial advisor. |

## 4. Algorithm

Given `exit_leverage`, `liquidity_months`, and `ebitda_growth_pct`, plus optional `prior_bankruptcy_count` (default 0):
1. If any required input is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.
2. It SHALL compute four risk components from the recidivism scoring calibration (constants: Chapter 22 recidivism scoring calibration): a leverage component rising with exit leverage above the baseline, a liquidity component rising as liquidity falls below a year, a growth component rising with negative EBITDA growth, and a repeat component rising with prior-filing count — each capped.
3. `chapter22_recidivism_score` SHALL be the base plus the four components, clamped to 0–100 and rounded to the nearest whole number.
4. `risk_band` SHALL be `high` at or above the high threshold, `watch` at or above the watch threshold, else `lower` (constants: Chapter 22 recidivism scoring calibration).
5. `financial_advisor_handoff_required` SHALL always be true; the driver inputs are echoed at the global 4-decimal precision.

## 5. Constants & authorities

| Constant | Value | Strength | Authority | Pin-cite | Effective | Next check |
|---|---|---|---|---|---|---|
| Chapter 22 recidivism scoring calibration | base 20; leverage = clamp((exit_leverage − 3) × 12, 0, 35); liquidity = clamp((12 − liquidity_months) × 2.5, 0, 30); growth = clamp(−ebitda_growth_pct × 100, 0, 20); repeat = clamp(prior_bankruptcy_count × 10, 0, 15); score = round(clamp(sum, 0, 100)); bands high ≥ 70, watch ≥ 45 | SHOULD (cited median) | DEFINITIVE Chapter 22 recidivism scoring calibration (heuristic; LoPucki Bankruptcy Research Database is the empirical reference, 2024) | scoring weights, caps, and band thresholds | 2024 calibration | on recalibration |


**Authorities**

| Authority | ID | Type |
|---|---|---|
| LoPucki Bankruptcy Research Database | AUTH-0161 | practice-or-guidance |

## 6. Worked example

*A company emerging at 5.0× leverage with six months of liquidity, −5% EBITDA growth, and one prior bankruptcy scores 74 on the Chapter 22 recidivism model — a high repeat-filing risk that routes to the financial advisor.*

**Inputs**

```json
{
  "exit_leverage": 5,
  "liquidity_months": 6,
  "ebitda_growth_pct": -0.05,
  "prior_bankruptcy_count": 1
}
```

**Outputs (executed against the reference implementation `MODEL.RESTRUCTURING.CHAPTER22.RECIDIVISM.v1`)**

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

Precision: The score is a whole number 0–100; the driver echoes round per the global rule (half-even to 4 decimals — see the Conventions chapter).

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["exit_leverage","liquidity_months","ebitda_growth_pct"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model computes a calibrated recidivism heuristic from supplied post-emergence drivers. It is a screening score, not a prediction; the reorganized company's actual prospects, the reasonableness of the exit capital structure, and the going-concern judgment are the financial advisor's and the board's determinations, which the model routes and does not replace.

## 9. Conformance bindings

Requirement `REQ-M168` is verified by 2 published case(s): `CONF.MODEL.RESTRUCT.CH22.001`, `CONF.MODEL.RESTRUCT.CH22.002`.

## 10. Version

Reference binding `MODEL.RESTRUCTURING.CHAPTER22.RECIDIVISM.v1` · entered the specification at internal lineage stage `v1_1` · spec v1.0.0.


# M169 — FIRPTA withholding

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G30
**Deal contexts:** real estate M&A

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Determines the FIRPTA withholding a buyer must remit on a purchase of U.S. real property from a foreign seller — the 15% default, the reduced 10% and zero residence paths, or none for a domestic seller — and the amount and filing deadline. It answers, at a real-estate closing, "must the buyer withhold on this seller, how much, and by when?" It computes the withholding from supplied facts; whether the seller is in fact a foreign person and whether an exemption or certificate applies are the tax advisor's calls.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M169.schema.json`](M169.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `amount_realized_cents` | integer (cents) | MUST | The amount realized by the seller (the FIRPTA withholding base). |
| `seller_foreign_person` | boolean | MUST | Whether the seller is a foreign person (the FIRPTA trigger). |
| `buyer_will_use_as_residence` | boolean | MAY | Whether the buyer will use the property as a residence (default false); opens the exemption and reduced-rate paths. |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `amount_realized_cents` | integer (cents) | The amount realized, echoed. |
| `seller_foreign_person` | boolean | The foreign-person flag, echoed. |
| `buyer_will_use_as_residence` | boolean | The residence-use flag, echoed. |
| `withholding_rate` | number | The FIRPTA withholding rate applied (0, 0.10, or 0.15). |
| `withholding_amount_cents` | integer (cents) | The withholding the buyer must remit. |
| `path` | enum(firpta_path) | The withholding path taken. One of `not_foreign_seller`, `personal_residence_300k_or_less_exemption`, `personal_residence_300k_to_1m_reduced_rate`, `default_firpta_withholding`. |
| `forms_due_within_days` | integer | null | Days within which Form 8288/8288-A must be filed and the tax remitted, or null when no withholding applies. |

## 4. Algorithm

Given `amount_realized_cents` and `seller_foreign_person`, plus optional `buyer_will_use_as_residence` (default false):
1. If either required input is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.
2. If the seller is not a foreign person, `withholding_rate` SHALL be 0 and `path` SHALL be `not_foreign_seller`.
3. Else if the buyer will use the property as a residence and the amount realized is at or below the personal-residence exemption ceiling (constants: FIRPTA personal-residence exemption ceiling), `withholding_rate` SHALL be 0 (`personal_residence_300k_or_less_exemption`).
4. Else if the buyer will use it as a residence and the amount realized is at or below the reduced-rate ceiling (constants: FIRPTA reduced-rate residence ceiling), `withholding_rate` SHALL be the reduced residence rate (constants: FIRPTA reduced residence rate) with path `personal_residence_300k_to_1m_reduced_rate`.
5. Otherwise `withholding_rate` SHALL be the default FIRPTA rate (constants: FIRPTA default withholding rate) with path `default_firpta_withholding`.
6. `withholding_amount_cents` SHALL be `round(amount_realized_cents × withholding_rate)`; `forms_due_within_days` SHALL be the Form 8288 filing/remittance deadline when a foreign seller is withheld upon, else null (constants: FIRPTA Form 8288 filing deadline).

## 5. Constants & authorities

| Constant | Value | Strength | Authority | Pin-cite | Effective | Next check |
|---|---|---|---|---|---|---|
| FIRPTA default withholding rate | 15% (0.15) | MUST (binding) | IRC § 1445(a) | § 1445(a) | current (IRC as amended) | on IRC amendment |
| FIRPTA reduced residence rate | 10% (0.10) | MUST (binding) | IRC § 1445 | § 1445(c)(4) reduced-rate residence path | current (IRC as amended) | on IRC amendment |
| FIRPTA personal-residence exemption ceiling | $300,000 (30,000,000 cents) | MUST (binding) | IRC § 1445(b)(5) | § 1445(b)(5) | current (IRC as amended) | on IRC amendment |
| FIRPTA reduced-rate residence ceiling | $1,000,000 (100,000,000 cents) | MUST (binding) | IRC § 1445; Treas. Reg. § 1.1445-1 | reduced-rate residence ceiling | current (Treas. Reg. as amended) | on Treasury amendment |
| FIRPTA Form 8288 filing deadline | 20 days | MUST (binding) | IRC § 1445; Treas. Reg. § 1.1445-1 | remit and file by the 20th day after transfer | current (Treas. Reg. as amended) | on Treasury amendment |


**Authorities**

| Authority | ID | Type |
|---|---|---|
| IRC 1445 | AUTH-0112 | statute |
| IRS Form 8288 | AUTH-0146 | form |

## 6. Worked example

*A foreign seller disposes of a $2.5M commercial property that the buyer will not occupy as a residence: FIRPTA requires 15% withholding — $375,000 — remitted with Form 8288 within 20 days of closing.*

**Inputs**

```json
{
  "amount_realized_cents": 250000000,
  "seller_foreign_person": true,
  "buyer_will_use_as_residence": false
}
```

**Outputs (executed against the reference implementation `MODEL.RE.FIRPTA.WITHHOLDING.v1`)**

```json
{
  "amount_realized_cents": 250000000,
  "seller_foreign_person": true,
  "buyer_will_use_as_residence": false,
  "withholding_rate": 0.15,
  "withholding_amount_cents": 37500000,
  "path": "default_firpta_withholding",
  "forms_due_within_days": 20
}
```

Precision: The withholding amount is exact integer cents (see the Conventions chapter); the rate is an exact statutory fraction.

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["amount_realized_cents","seller_foreign_person"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model computes FIRPTA withholding and the filing deadline from supplied facts. Whether the seller is in fact a foreign person, whether the residence exemption or a withholding certificate applies, and the seller's ultimate tax liability are determinations for the parties' tax advisors; the model computes the buyer's withholding obligation and renders no opinion on the seller's tax.

## 9. Conformance bindings

Requirement `REQ-M169` is verified by 2 published case(s): `CONF.MODEL.RE.FIRPTA.001`, `CONF.MODEL.RE.FIRPTA.002`.

## 10. Version

Reference binding `MODEL.RE.FIRPTA.WITHHOLDING.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M170 — 1031 like-kind exchange timing

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G30
**Deal contexts:** real estate exchange

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Dates the two hard §1031 deadlines from the relinquished-property transfer — the 45-day identification window and the 180-day exchange window — and computes the recognized-gain floor from any boot received and any value shortfall in the replacement property. It answers, for a taxpayer running a like-kind exchange, "by when must I identify and close, and how much gain can I not defer?" It computes the timing and the gain floor; whether the properties are like-kind and the exchange qualifies is the tax advisor's call.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M170.schema.json`](M170.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `relinquished_property_value_cents` | integer (cents) | MUST | Value of the relinquished property. |
| `replacement_property_value_cents` | integer (cents) | MUST | Value of the replacement property. |
| `transfer_date` | string (ISO date) | MUST | The date the relinquished property was transferred; the clock start. |
| `boot_received_cents` | integer (cents) | MAY | Non-like-kind consideration received (default 0). |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `transfer_date` | string (ISO date) | The transfer date, echoed. |
| `identification_deadline` | string (ISO date) | The 45-day identification deadline. |
| `exchange_deadline` | string (ISO date) | The 180-day exchange deadline. |
| `replacement_value_cents` | integer (cents) | The replacement-property value, echoed. |
| `relinquished_value_cents` | integer (cents) | The relinquished-property value, echoed. |
| `boot_received_cents` | integer (cents) | Boot received, echoed. |
| `value_shortfall_cents` | integer (cents) | Shortfall from trading down (relinquished over replacement). |
| `recognized_gain_floor_cents` | integer (cents) | The greater of boot and shortfall — gain that cannot be deferred. |

## 4. Algorithm

Given `transfer_date`, `relinquished_property_value_cents`, and `replacement_property_value_cents`, plus optional `boot_received_cents` (default 0):
1. If any required input is missing (or the date is invalid), the implementation SHALL return `status: "needs_inputs"` and emit no outputs.
2. `identification_deadline` SHALL be the transfer date advanced by the §1031 identification period (constants: §1031 identification period).
3. `exchange_deadline` SHALL be the transfer date advanced by the §1031 exchange period (constants: §1031 exchange period).
4. `value_shortfall_cents` SHALL be `max(0, relinquished_property_value_cents − replacement_property_value_cents)` (trading down).
5. `recognized_gain_floor_cents` SHALL be `max(boot_received_cents, value_shortfall_cents)` — the gain that cannot be deferred.

## 5. Constants & authorities

| Constant | Value | Strength | Authority | Pin-cite | Effective | Next check |
|---|---|---|---|---|---|---|
| §1031 identification period | 45 days | MUST (binding) | IRC § 1031(a)(3)(A) | § 1031(a)(3)(A) | current (IRC as amended) | on IRC amendment |
| §1031 exchange period | 180 days | MUST (binding) | IRC § 1031(a)(3)(B) | § 1031(a)(3)(B) | current (IRC as amended) | on IRC amendment |


**Authorities**

| Authority | ID | Type |
|---|---|---|
| IRC 1031 | AUTH-0104 | statute |

## 6. Worked example

*A $5M relinquished property is exchanged for $4.5M of replacement plus $200k of boot: the $500k trade-down shortfall exceeds the boot, so at least $500k of gain is recognized; identification closes 45 days out and the exchange 180 days out.*

**Inputs**

```json
{
  "transfer_date": "2026-03-01",
  "relinquished_property_value_cents": 500000000,
  "replacement_property_value_cents": 450000000,
  "boot_received_cents": 20000000
}
```

**Outputs (executed against the reference implementation `MODEL.RE.1031.TIMING.v1`)**

```json
{
  "transfer_date": "2026-03-01",
  "identification_deadline": "2026-04-15",
  "exchange_deadline": "2026-08-28",
  "replacement_value_cents": 450000000,
  "relinquished_value_cents": 500000000,
  "boot_received_cents": 20000000,
  "value_shortfall_cents": 50000000,
  "recognized_gain_floor_cents": 50000000
}
```

Precision: Monetary outputs are exact integer cents; deadlines are ISO-8601 dates (see the Conventions chapter).

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["transfer_date","relinquished_property_value_cents","replacement_property_value_cents"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model dates the §1031 windows and computes the recognized-gain floor from supplied values. Whether the properties are like-kind, whether the exchange structure (qualified intermediary, identification rules) qualifies, and the taxpayer's actual gain and basis are determinations for the tax advisor; the model computes the deadlines and the floor and renders no qualification opinion.

## 9. Conformance bindings

Requirement `REQ-M170` is verified by 2 published case(s): `CONF.MODEL.RE.1031.001`, `CONF.MODEL.RE.1031.002`.

## 10. Version

Reference binding `MODEL.RE.1031.TIMING.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M171 — Sale-leaseback and ASC 842

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G30
**Deal contexts:** OpCo/PropCo · sale-leaseback

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Screens a sale-leaseback against the ASC 842 finance-lease indicators — ownership transfer, a bargain purchase option, a lease term covering substantially all the economic life, present value covering substantially all the fair value, and a specialized asset — and reports the implied cap rate and nominal rent. It answers, in an OpCo/PropCo or sale-leaseback deal, "do any finance-lease indicators show up, or does this look like a true sale and operating lease?" It screens the indicators; the binding sale and lease-classification accounting is the accountant's.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M171.schema.json`](M171.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `annual_rent_cents` | integer (cents) | MUST | Annual leaseback rent. |
| `lease_term_years` | number | MUST | The leaseback term in years. |
| `sale_price_cents` | integer (cents) | MUST | The sale-leaseback sale price. |
| `bargain_purchase_option` | boolean | MAY | Whether the lessee holds a bargain purchase option (default false). |
| `economic_life_years` | number | MAY | Remaining economic life of the asset; enables the lease-term indicator. |
| `pv_lease_payments_cents` | integer (cents) | MAY | Present value of the lease payments; enables the fair-value indicator. |
| `specialized_asset` | boolean | MAY | Whether the asset is so specialized it has no alternative use to the lessor (default false). |
| `transfers_ownership` | boolean | MAY | Whether the lease transfers ownership at term end (default false). |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `sale_price_cents` | integer (cents) | The sale price, echoed. |
| `annual_rent_cents` | integer (cents) | The annual rent, echoed. |
| `cap_rate` | number | Implied cap rate: annual rent ÷ sale price. |
| `lease_term_years` | number | The lease term, echoed. |
| `total_nominal_rent_cents` | integer (cents) | Total undiscounted rent over the term. |
| `lease_term_pct_of_economic_life` | number | null | Lease term as a fraction of economic life, or null. |
| `pv_payments_pct_of_fair_value` | number | null | PV of payments as a fraction of fair value, or null. |
| `asc842_indicator_classification` | enum(asc842_classification) | Whether any finance-lease indicator is present. One of `finance_lease_indicator_present`, `operating_lease_indicator_on_supplied_facts`. |
| `finance_lease_indicators` | string[] | The finance-lease indicators that fired (empty when none). |
| `accounting_review_flags` | string[] | Standing accountant-review note on ASC 842 sale and lease classification. |

## 4. Algorithm

Given `sale_price_cents`, `annual_rent_cents`, and `lease_term_years`, plus optional `economic_life_years`, `pv_lease_payments_cents`, `transfers_ownership` (default false), `bargain_purchase_option` (default false), `specialized_asset` (default false):
1. If any required input is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.
2. `cap_rate` SHALL be `annual_rent_cents ÷ sale_price_cents` at the global 4-decimal precision; `total_nominal_rent_cents` SHALL be `round(annual_rent_cents × lease_term_years)`.
3. `lease_term_pct_of_economic_life` SHALL be `lease_term_years ÷ economic_life_years` (or null); `pv_payments_pct_of_fair_value` SHALL be `pv_lease_payments_cents ÷ sale_price_cents` (or null).
4. A finance-lease indicator SHALL be flagged for: ownership transfer; a bargain purchase option; a lease term at or above the economic-life threshold (constants: ASC 842 lease-term indicator); PV at or above the fair-value threshold (constants: ASC 842 PV indicator); or a specialized asset.
5. `asc842_indicator_classification` SHALL be `finance_lease_indicator_present` iff any indicator fired, else `operating_lease_indicator_on_supplied_facts`; an accountant-review flag SHALL always attach.

## 5. Constants & authorities

| Constant | Value | Strength | Authority | Pin-cite | Effective | Next check |
|---|---|---|---|---|---|---|
| ASC 842 lease-term indicator | 75% of economic life (0.75) | MUST (binding) | ASC 842-10-25 | lease term is a major part (customary 75%) of remaining economic life | ASC 842 (current) | on standard amendment |
| ASC 842 PV indicator | 90% of fair value (0.90) | MUST (binding) | ASC 842-10-25 | PV of payments is substantially all (customary 90%) of fair value | ASC 842 (current) | on standard amendment |


**Authorities**

| Authority | ID | Type |
|---|---|---|
| ASC 842 | AUTH-0036 | practice-or-guidance |

## 6. Worked example

*A $20M sale-leaseback at $1.6M annual rent (an 8% cap) on a 15-year lease of a 40-year-life asset with $12M PV of payments: none of the ASC 842 finance-lease indicators fires on these facts, pointing toward sale and operating-lease accounting subject to accountant review.*

**Inputs**

```json
{
  "sale_price_cents": 2000000000,
  "annual_rent_cents": 160000000,
  "lease_term_years": 15,
  "economic_life_years": 40,
  "pv_lease_payments_cents": 1200000000
}
```

**Outputs (executed against the reference implementation `MODEL.RE.SALE_LEASEBACK.ASC842.v1`)**

```json
{
  "sale_price_cents": 2000000000,
  "annual_rent_cents": 160000000,
  "cap_rate": 0.08,
  "lease_term_years": 15,
  "total_nominal_rent_cents": 2400000000,
  "lease_term_pct_of_economic_life": 0.375,
  "pv_payments_pct_of_fair_value": 0.6,
  "asc842_indicator_classification": "operating_lease_indicator_on_supplied_facts",
  "finance_lease_indicators": [],
  "accounting_review_flags": [
    "ASC 842 sale accounting and lease classification require accountant review on the final facts."
  ]
}
```

Precision: Cap rate and percentages are rounded per the global rule (half-even to 4 decimals — see the Conventions chapter); nominal rent is exact integer cents.

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["sale_price_cents","annual_rent_cents","lease_term_years"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model screens the ASC 842 finance-lease indicators and computes the implied cap rate from supplied facts. Whether the sale qualifies for sale accounting and whether the leaseback is a finance or operating lease are accounting determinations for the accountant on the final facts; the model produces the indicator screen and always routes the classification, rendering no accounting conclusion.

## 9. Conformance bindings

Requirement `REQ-M171` is verified by 2 published case(s): `CONF.MODEL.RE.SALELEASEBACK.001`, `CONF.MODEL.RE.SALELEASEBACK.002`.

## 10. Version

Reference binding `MODEL.RE.SALE_LEASEBACK.ASC842.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M172 — REIT 75/75/90 compliance triad

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G30
**Deal contexts:** REIT M&A

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Runs the three REIT qualification gates from supplied figures — the 75% gross-income test, the 75% asset test, and the 90% distribution test — and reports each ratio, each pass/fail, and whether all three clear. It answers, for a REIT (or a target being tested for REIT status), "do the income, asset, and distribution numbers keep it qualified?" It computes the ratios and the pass/fail; the underlying income and asset characterizations are the tax advisor's.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M172.schema.json`](M172.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `distributions_cents` | integer (cents) | MUST | Distributions made to shareholders. |
| `real_estate_assets_cents` | integer (cents) | MUST | Qualifying real-estate assets. |
| `real_estate_income_cents` | integer (cents) | MUST | Qualifying real-estate gross income. |
| `taxable_income_cents` | integer (cents) | MUST | REIT taxable income (the distribution-test denominator). |
| `total_assets_cents` | integer (cents) | MUST | Total assets. |
| `total_income_cents` | integer (cents) | MUST | Total gross income. |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `income_75_pct` | number | Real-estate income as a fraction of total income. |
| `income_75_test_passed` | boolean | Whether the 75% income test passes. |
| `asset_75_pct` | number | Real-estate assets as a fraction of total assets. |
| `asset_75_test_passed` | boolean | Whether the 75% asset test passes. |
| `distribution_90_pct` | number | Distributions as a fraction of taxable income. |
| `distribution_90_test_passed` | boolean | Whether the 90% distribution test passes. |
| `all_tests_passed` | boolean | Whether all three tests pass. |

## 4. Algorithm

Given `real_estate_income_cents`, `total_income_cents`, `real_estate_assets_cents`, `total_assets_cents`, `distributions_cents`, and `taxable_income_cents`:
1. If any of the six is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.
2. `income_75_pct` SHALL be `real_estate_income_cents ÷ total_income_cents`; `income_75_test_passed` SHALL be true iff it is at or above the income-test threshold (constants: REIT 75% income test).
3. `asset_75_pct` SHALL be `real_estate_assets_cents ÷ total_assets_cents`; `asset_75_test_passed` SHALL be true iff it is at or above the asset-test threshold (constants: REIT 75% asset test).
4. `distribution_90_pct` SHALL be `distributions_cents ÷ taxable_income_cents`; `distribution_90_test_passed` SHALL be true iff it is at or above the distribution-test threshold (constants: REIT 90% distribution test).
5. `all_tests_passed` SHALL be true iff all three tests pass; the ratios are reported at the global 4-decimal precision.

## 5. Constants & authorities

| Constant | Value | Strength | Authority | Pin-cite | Effective | Next check |
|---|---|---|---|---|---|---|
| REIT 75% income test | 75% (0.75) | MUST (binding) | IRC § 856(c)(3) | § 856(c)(3) | current (IRC as amended) | on IRC amendment |
| REIT 75% asset test | 75% (0.75) | MUST (binding) | IRC § 856(c)(4) | § 856(c)(4) | current (IRC as amended) | on IRC amendment |
| REIT 90% distribution test | 90% (0.90) | MUST (binding) | IRC § 857(a)(1) | § 857(a)(1) | current (IRC as amended) | on IRC amendment |


**Authorities**

| Authority | ID | Type |
|---|---|---|
| IRC 856-860 | AUTH-0139 | statute |

## 6. Worked example

*A REIT with 95% of income and 95% of assets in real estate and a 90% distribution of taxable income clears all three §856/§857 tests.*

**Inputs**

```json
{
  "real_estate_income_cents": 950000000,
  "total_income_cents": 1000000000,
  "real_estate_assets_cents": 9500000000,
  "total_assets_cents": 10000000000,
  "distributions_cents": 900000000,
  "taxable_income_cents": 1000000000
}
```

**Outputs (executed against the reference implementation `MODEL.RE.REIT.COMPLIANCE.v1`)**

```json
{
  "income_75_pct": 0.95,
  "income_75_test_passed": true,
  "asset_75_pct": 0.95,
  "asset_75_test_passed": true,
  "distribution_90_pct": 0.9,
  "distribution_90_test_passed": true,
  "all_tests_passed": true
}
```

Precision: Ratios are rounded per the global rule (half-even to 4 decimals — see the Conventions chapter).

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["real_estate_income_cents","total_income_cents","real_estate_assets_cents","total_assets_cents","distributions_cents","taxable_income_cents"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model runs the three REIT ratio tests from supplied figures. Which income and assets qualify as real-estate for §856, the many other REIT requirements, and the ultimate qualification conclusion are determinations for the tax advisor; the model computes the ratios and pass/fail and renders no qualification opinion.

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

- AUTH-0199 — Project Finance Market Practice


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

- AUTH-0216 — SEC Project Crypto
- AUTH-0091 — Howey


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

- AUTH-0087 — GENIUS Act


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

- AUTH-0134 — IRC 6045
- AUTH-0229 — T.D. 10000
- AUTH-0074 — Form 1099-DA


# M177 — LP-secondary plus ECI withholding

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G26, G30
**Deal contexts:** LP secondary

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Screens a limited-partnership secondary sale for the §1446(f) 10% withholding that applies when a foreign partner transfers a partnership interest, computes the default withholding, and flags the purchase-and-sale-agreement and tri-party transfer mechanics. It answers, for a secondary buyer or seller, "does this LP transfer trigger ECI withholding, and how much?" It computes the default withholding from the price; the withholding-certificate exception and the ECI determination are the tax specialist's.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M177.schema.json`](M177.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `purchase_price_cents` | integer (cents) | MUST | The price paid for the transferred partnership interest. |
| `seller_foreign_person` | boolean | MUST | Whether the transferring partner is a foreign person (the §1446(f) trigger). |
| `eci_gain_cents` | integer (cents) | MAY | Estimated effectively-connected gain on the transfer; optional context. |
| `withholding_certificate_provided` | boolean | MAY | Whether a §1446(f) withholding certificate/exception is provided (default false). |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `purchase_price_cents` | integer (cents) | The purchase price, echoed. |
| `seller_foreign_person` | boolean | The foreign-person flag, echoed. |
| `withholding_certificate_provided` | boolean | The certificate flag, echoed. |
| `section_1446f_default_withholding_cents` | integer (cents) | The default 10% §1446(f) withholding, or 0 when not triggered. |
| `eci_gain_cents` | integer (cents) | null | The supplied ECI gain, echoed, or null. |
| `psa_required` | boolean | Always true — a purchase-and-sale agreement papers the transfer. |
| `tri_party_transfer_required` | boolean | Always true — the transfer is executed tri-party with the fund. |
| `tax_specialist_handoff_required` | boolean | True when the seller is a foreign person. |

## 4. Algorithm

Given `purchase_price_cents` and `seller_foreign_person`, plus optional `withholding_certificate_provided` (default false) and `eci_gain_cents`:
1. If either required input is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.
2. `section_1446f_default_withholding_cents` SHALL be `round(purchase_price_cents × the §1446(f) default withholding rate)` when the seller is a foreign person and no withholding certificate is provided, else 0 (constants: §1446(f) default withholding rate).
3. `psa_required` and `tri_party_transfer_required` SHALL always be true — the transfer runs through a purchase-and-sale agreement and a tri-party (buyer, seller, fund) transfer.
4. `tax_specialist_handoff_required` SHALL be true iff the seller is a foreign person.
5. The model SHALL echo the price, the foreign-person flag, the certificate flag, and any supplied ECI gain.

## 5. Constants & authorities

| Constant | Value | Strength | Authority | Pin-cite | Effective | Next check |
|---|---|---|---|---|---|---|
| §1446(f) default withholding rate | 10% | MUST (binding) | IRC § 1446(f) | § 1446(f)(1) (10% of amount realized) | current (IRC as amended) | on IRC amendment |


**Authorities**

| Authority | ID | Type |
|---|---|---|
| IRC 1446(f) | AUTH-0113 | statute |
| ILPA Guidance | AUTH-0095 | practice-norm |

## 6. Worked example

*A foreign LP sells its fund interest for $20M with no withholding certificate on file; §1446(f) requires the buyer to withhold 10% — $2M — pending the tax specialist's ECI analysis.*

**Inputs**

```json
{
  "purchase_price_cents": 2000000000,
  "seller_foreign_person": true,
  "withholding_certificate_provided": false,
  "eci_gain_cents": 300000000
}
```

**Outputs (executed against the reference implementation `MODEL.SECONDARIES.LP_ECI.v1`)**

```json
{
  "purchase_price_cents": 2000000000,
  "seller_foreign_person": true,
  "withholding_certificate_provided": false,
  "section_1446f_default_withholding_cents": 200000000,
  "eci_gain_cents": 300000000,
  "psa_required": true,
  "tri_party_transfer_required": true,
  "tax_specialist_handoff_required": true
}
```

Precision: The withholding amount is exact integer cents (see the Conventions chapter); no rounding of ratios.

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["purchase_price_cents","seller_foreign_person"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model screens an LP secondary for §1446(f) withholding and computes the 10% default from the price. Whether the seller is in fact a foreign person, whether a withholding certificate or exception applies, and the effectively-connected-income determination are tax determinations for a tax specialist; on a foreign-seller transfer the model routes them (tax_specialist_handoff_required) and renders no withholding opinion beyond the default arithmetic.

## 9. Conformance bindings

Requirement `REQ-M177` is verified by 2 published case(s): `CONF.MODEL.SECONDARIES.LP_ECI.001`, `CONF.MODEL.SECONDARIES.LP_ECI.002`.

## 10. Version

Reference binding `MODEL.SECONDARIES.LP_ECI.v1` · entered the specification at internal lineage stage `v1_1` · spec v1.0.0.


# M178 — Strip-sale pricing

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G26, G30
**Deal contexts:** strip sale

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Prices a strip sale of a fund or portfolio — the NAV sold and retained at the strip percentage, the total value implied by the strip price, and the discount or premium to NAV. It answers, for a GP or LP running a strip sale, "how much NAV are we selling, what total value does the strip price imply, and at what discount to NAV?" It computes the pricing arithmetic from the supplied NAV, strip percentage, and sale price.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M178.schema.json`](M178.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `fund_nav_cents` | integer (cents) | MUST | Total net asset value of the fund or portfolio. |
| `sale_price_cents` | integer (cents) | MUST | Price paid for the strip. |
| `strip_percentage` | number | MUST | Fraction of the NAV sold in the strip (0–1). |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `fund_nav_cents` | integer (cents) | The fund NAV, echoed. |
| `strip_percentage` | number | The strip percentage applied. |
| `sold_nav_cents` | integer (cents) | NAV sold in the strip. |
| `retained_nav_cents` | integer (cents) | NAV retained after the strip. |
| `sale_price_cents` | integer (cents) | The strip sale price, echoed. |
| `implied_total_value_cents` | integer (cents) | Total fund value the strip price implies (price ÷ strip). |
| `discount_to_nav_pct` | number | null | Discount (positive) or premium (negative) to NAV, or null when NAV is non-positive. |

## 4. Algorithm

Given `fund_nav_cents`, `strip_percentage` (a fraction), and `sale_price_cents`:
1. If any of the three is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.
2. `sold_nav_cents` SHALL be `round(fund_nav_cents × strip_percentage)`; `retained_nav_cents` SHALL be `fund_nav_cents − sold_nav_cents`.
3. `implied_total_value_cents` SHALL be `round(sale_price_cents ÷ strip_percentage)` when the strip percentage is positive, else 0.
4. `discount_to_nav_pct` SHALL be `1 − (implied_total_value_cents ÷ fund_nav_cents)` when NAV is positive, else null, at the global 4-decimal precision (a positive value is a discount, a negative value a premium).
5. `strip_percentage` SHALL echo at 4 decimals.

## 5. Constants & authorities

_No numeric constants — this model computes from supplied facts and cited rule text only (attested: `constants: []`)._


**Authorities**

| Authority | ID | Type |
|---|---|---|
| market practice | AUTH-0164 | practice-or-guidance |

## 6. Worked example

*A 30% strip of a $100M-NAV fund sells for $27M, implying a $90M total value — a 10% discount to NAV; $30M of NAV is sold and $70M retained.*

**Inputs**

```json
{
  "fund_nav_cents": 10000000000,
  "strip_percentage": 0.3,
  "sale_price_cents": 2700000000
}
```

**Outputs (executed against the reference implementation `MODEL.SECONDARIES.STRIP_SALE.v1`)**

```json
{
  "fund_nav_cents": 10000000000,
  "strip_percentage": 0.3,
  "sold_nav_cents": 3000000000,
  "retained_nav_cents": 7000000000,
  "sale_price_cents": 2700000000,
  "implied_total_value_cents": 9000000000,
  "discount_to_nav_pct": 0.1
}
```

Precision: Monetary outputs are exact integer cents; the strip percentage and discount are rounded per the global rule (half-even to 4 decimals — see the Conventions chapter).

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["fund_nav_cents","strip_percentage","sale_price_cents"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model prices a strip sale from supplied NAV, strip percentage, and sale price. Whether the NAV is correctly struck, the fairness of the strip price, and the LP/GP consent and tax mechanics are determinations for the fund's valuation process, its advisers, and counsel; the model computes the implied value and discount and renders no valuation.

## 9. Conformance bindings

Requirement `REQ-M178` is verified by 2 published case(s): `CONF.MODEL.SECONDARIES.STRIP.001`, `CONF.MODEL.SECONDARIES.STRIP.002`.

## 10. Version

Reference binding `MODEL.SECONDARIES.STRIP_SALE.v1` · entered the specification at internal lineage stage `v1_1` · spec v1.0.0.


# M179 — NAV facility LTV

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G26, G30
**Deal contexts:** NAV financing

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Computes a fund-level NAV facility's loan-to-value and equity cushion from the fund NAV and drawn loan amount, and tests the cushion against the required minimum. It answers, for a GP or lender sizing a NAV loan, "where does LTV sit, how much cushion remains, and does it clear the covenant floor?" It performs the ratio screen; the binding facility terms and collateral-pool eligibility are the lender's.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M179.schema.json`](M179.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `fund_nav_cents` | integer (cents) | MUST | Net asset value of the fund pledged to the facility. |
| `loan_amount_cents` | integer (cents) | MUST | Drawn (or committed) loan amount under the facility. |
| `required_cushion_pct` | number | MAY | Minimum equity cushion the covenant requires as a fraction; defaults to the cited market minimum. |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `fund_nav_cents` | integer (cents) | The fund NAV, echoed. |
| `loan_amount_cents` | integer (cents) | The loan amount, echoed. |
| `nav_ltv` | number | Loan-to-value: loan ÷ NAV. |
| `cushion_pct` | number | Equity cushion: 1 − LTV. |
| `required_cushion_pct` | number | The required minimum cushion applied. |
| `cushion_requirement_satisfied` | boolean | Whether the cushion meets or exceeds the required minimum. |
| `lender_handoff_required` | boolean | Always true — binding facility terms route to the lender. |

## 4. Algorithm

Given `fund_nav_cents` and `loan_amount_cents`, plus optional `required_cushion_pct` (default: the NAV facility minimum cushion constant):
1. If either required input is missing or non-numeric, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.
2. `nav_ltv` SHALL be `loan_amount_cents ÷ fund_nav_cents` (zero when NAV is non-positive), at the global 4-decimal precision.
3. `cushion_pct` SHALL be `1 − nav_ltv`, at 4 decimals.
4. `required_cushion_pct` SHALL be the supplied value, else the NAV facility minimum cushion (constants: NAV facility minimum cushion), at 4 decimals.
5. `cushion_requirement_satisfied` SHALL be true iff `cushion_pct ≥ required_cushion_pct`.
6. `lender_handoff_required` SHALL always be true — binding facility terms route to the lender.

## 5. Constants & authorities

| Constant | Value | Strength | Authority | Pin-cite | Effective | Next check |
|---|---|---|---|---|---|---|
| NAV facility minimum cushion | 25% (0.25) | SHOULD (cited median) | NAV facility market practice — conventional minimum equity cushion (2024) | conventional minimum cushion (LTV ceiling near 75%) | 2024 market practice | on next NAV-facility market review |


**Authorities**

| Authority | ID | Type |
|---|---|---|
| NAV Facility Market Practice | AUTH-0182 | practice-norm |

## 6. Worked example

*A $500M-NAV fund draws a $150M NAV facility: LTV lands at 30%, leaving a 70% cushion that clears the 25% minimum comfortably.*

**Inputs**

```json
{
  "fund_nav_cents": 50000000000,
  "loan_amount_cents": 15000000000,
  "required_cushion_pct": 0.25
}
```

**Outputs (executed against the reference implementation `MODEL.FINANCE.NAV_FACILITY.v1`)**

```json
{
  "fund_nav_cents": 50000000000,
  "loan_amount_cents": 15000000000,
  "nav_ltv": 0.3,
  "cushion_pct": 0.7,
  "required_cushion_pct": 0.25,
  "cushion_requirement_satisfied": true,
  "lender_handoff_required": true
}
```

Precision: Ratios are rounded per the global rule (half-even to 4 decimals — see the Conventions chapter); monetary echoes are exact integer cents.

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["fund_nav_cents","loan_amount_cents"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model computes NAV-facility LTV and cushion and screens them against a required minimum. The binding advance rate, collateral-pool eligibility, concentration limits, and cure mechanics are the lender's and are set in the facility agreement; the model produces the ratio screen and routes the binding terms to the lender (lender_handoff_required), quoting no facility.

## 9. Conformance bindings

Requirement `REQ-M179` is verified by 2 published case(s): `CONF.MODEL.FINANCE.NAV.001`, `CONF.MODEL.FINANCE.NAV.002`.

## 10. Version

Reference binding `MODEL.FINANCE.NAV_FACILITY.v1` · entered the specification at internal lineage stage `v1_1` · spec v1.0.0.


# M180 — Convertible and SAFE conversion

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G15, G29
**Deal contexts:** convertible · SAFE

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Computes the price at which a convertible note or SAFE converts in a priced round — the lower of the discount price, the valuation-cap price, and the round's own share price — and the resulting share count, and reports which term governed. It answers, for a founder or investor modeling a conversion, "at what price does this instrument convert, and does the cap or the discount win?" It computes the conversion arithmetic from supplied terms; it renders no view on the fairness of the cap or discount.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M180.schema.json`](M180.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `investment_cents` | integer (cents) | MUST | Principal (or SAFE amount) converting into the round. |
| `priced_round_share_price_cents` | integer (cents) | MUST | The new priced-round price per share. |
| `discount_pct` | number | MAY | The conversion discount as a fraction (0–1); default 0 (no discount). |
| `pre_money_share_count` | number | MAY | Fully-diluted pre-money share count used to convert the cap into a per-share price; optional. |
| `valuation_cap_cents` | integer (cents) | MAY | The instrument's valuation cap; optional, drives the cap price. |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `investment_cents` | integer (cents) | The converting investment, echoed. |
| `priced_round_share_price_cents` | integer (cents) | The priced-round share price, echoed. |
| `discount_pct` | number | The discount fraction applied. |
| `discount_price_cents` | integer (cents) | The discounted per-share price. |
| `valuation_cap_cents` | integer (cents) | null | The valuation cap, echoed, or null. |
| `cap_price_cents` | integer (cents) | null | The cap-implied per-share price, or null when the cap or share count is absent. |
| `conversion_price_cents` | integer (cents) | The governing (lowest) conversion price per share. |
| `converted_share_count` | number | Shares the investment converts into at the conversion price. |
| `conversion_driver` | enum(conversion_driver) | Which term produced the governing conversion price. One of `valuation_cap`, `discount`, `priced_round_price`. |

## 4. Algorithm

Given `investment_cents` and `priced_round_share_price_cents`, plus optional `valuation_cap_cents`, `pre_money_share_count`, and `discount_pct` (default 0):
1. If either required input is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.
2. `discount_price_cents` SHALL be `priced_round_share_price_cents × (1 − discount_pct)` (the discount clamped to [0, 1]), rounded to the nearest cent.
3. `cap_price_cents` SHALL be `valuation_cap_cents ÷ pre_money_share_count`, rounded to the nearest cent, when both are supplied and positive; otherwise null.
4. `conversion_price_cents` SHALL be the minimum of the priced-round price, the discount price, and (when present) the cap price, among the positive candidates.
5. `converted_share_count` SHALL be `investment_cents ÷ conversion_price_cents`, at the global 4-decimal precision.
6. `conversion_driver` SHALL name which term produced the governing price: the valuation cap, the discount, or the priced-round price.

## 5. Constants & authorities

_No numeric constants — this model computes from supplied facts and cited rule text only (attested: `constants: []`)._


**Authorities**

| Authority | ID | Type |
|---|---|---|
| YC SAFE | AUTH-0262 | practice-or-guidance |
| market practice | AUTH-0164 | practice-or-guidance |

## 6. Worked example

*A $500k SAFE with a $10M cap and a 20% discount converts into an $5.00 priced round on 8,000,000 pre-money shares: the $1.25 cap price beats the $4.00 discount price, so the cap governs and the SAFE takes 400,000 shares.*

**Inputs**

```json
{
  "investment_cents": 50000000,
  "priced_round_share_price_cents": 500,
  "valuation_cap_cents": 1000000000,
  "pre_money_share_count": 8000000,
  "discount_pct": 0.2
}
```

**Outputs (executed against the reference implementation `MODEL.FINANCE.CONVERTIBLE_SAFE.v1`)**

```json
{
  "investment_cents": 50000000,
  "priced_round_share_price_cents": 500,
  "discount_pct": 0.2,
  "discount_price_cents": 400,
  "valuation_cap_cents": 1000000000,
  "cap_price_cents": 125,
  "conversion_price_cents": 125,
  "converted_share_count": 400000,
  "conversion_driver": "valuation_cap"
}
```

Precision: Monetary outputs are exact integer cents; the discount fraction and the share count are rounded per the global rule (half-even to 4 decimals — see the Conventions chapter).

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["investment_cents","priced_round_share_price_cents"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model computes a convertible/SAFE conversion price and share count from supplied cap, discount, and priced-round terms. Whether the cap or discount is market, how the fully-diluted share count is defined, and the instrument's enforceability and tax treatment are determinations for the parties and counsel; the model computes the conversion the supplied terms imply and renders no view on them.

## 9. Conformance bindings

Requirement `REQ-M180` is verified by 2 published case(s): `CONF.MODEL.FINANCE.SAFE.001`, `CONF.MODEL.FINANCE.SAFE.002`.

## 10. Version

Reference binding `MODEL.FINANCE.CONVERTIBLE_SAFE.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M181 — Venture-debt warrant coverage

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G15, G29
**Deal contexts:** venture debt

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Sizes a venture-debt warrant package — the warrant coverage amount, the implied share count, and the warrants' intrinsic value — and estimates the lender's all-in IRR including cash interest and the warrant upside. It answers, for a lender or borrower pricing venture debt, "how many warrant shares does this coverage buy, what are they worth, and what return does the package imply for the lender?" It computes the arithmetic from supplied terms; the fair-value share price and IRR are estimates, not a valuation.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M181.schema.json`](M181.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `exercise_price_cents` | integer (cents) | MUST | The warrant exercise (strike) price per share. |
| `fair_value_share_price_cents` | integer (cents) | MUST | Assumed fair-value price per share used to value the warrants. |
| `loan_amount_cents` | integer (cents) | MUST | The venture-debt principal. |
| `warrant_coverage_pct` | number | MUST | Warrant coverage as a fraction of the loan (e.g., 0.10 for 10% coverage). |
| `cash_interest_rate` | number | MAY | Annual cash coupon as a fraction (default 0). |
| `term_years` | number | MAY | Loan term in years used for interest and IRR (default 3). |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `loan_amount_cents` | integer (cents) | The loan principal, echoed. |
| `warrant_coverage_pct` | number | The warrant coverage fraction applied. |
| `warrant_coverage_amount_cents` | integer (cents) | Dollar coverage: loan × coverage. |
| `warrant_shares` | integer | Warrant shares: coverage amount ÷ exercise price. |
| `intrinsic_warrant_value_cents` | integer (cents) | Intrinsic value of the warrants at the assumed fair value. |
| `simple_interest_cents` | integer (cents) | Total simple cash interest over the term. |
| `lender_gross_return_cents` | integer (cents) | Principal plus interest plus warrant intrinsic value. |
| `estimated_lender_irr` | number | null | Estimated annualized lender IRR, or null when the term is non-positive. |

## 4. Algorithm

Given `loan_amount_cents`, `warrant_coverage_pct`, `exercise_price_cents`, and `fair_value_share_price_cents`, plus optional `term_years` (default 3) and `cash_interest_rate` (default 0):
1. If any of the four required inputs is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.
2. `warrant_coverage_amount_cents` SHALL be `loan_amount_cents × warrant_coverage_pct`, rounded to the nearest cent.
3. `warrant_shares` SHALL be `warrant_coverage_amount_cents ÷ exercise_price_cents` (zero if the exercise price is non-positive), rounded to the nearest whole share.
4. `intrinsic_warrant_value_cents` SHALL be `max(0, warrant_shares × (fair_value_share_price_cents − exercise_price_cents))`, rounded to the nearest cent.
5. `simple_interest_cents` SHALL be `loan_amount_cents × cash_interest_rate × term_years`, rounded to the nearest cent; `lender_gross_return_cents` SHALL be `loan_amount_cents + simple_interest_cents + intrinsic_warrant_value_cents`.
6. `estimated_lender_irr` SHALL be `(lender_gross_return_cents ÷ loan_amount_cents)^(1 ÷ term_years) − 1` when the term is positive, else null, at the global 4-decimal precision.

## 5. Constants & authorities

_No numeric constants — this model computes from supplied facts and cited rule text only (attested: `constants: []`)._


**Authorities**

| Authority | ID | Type |
|---|---|---|
| Venture Debt Market Practice | AUTH-0260 | practice-norm |

## 6. Worked example

*A $10M venture loan with 10% warrant coverage, a $2.00 strike, and an assumed $5.00 fair value buys 500,000 warrant shares worth $1.5M intrinsic; with an 11% cash coupon over three years the lender's estimated IRR runs about 21%.*

**Inputs**

```json
{
  "loan_amount_cents": 1000000000,
  "warrant_coverage_pct": 0.1,
  "exercise_price_cents": 200,
  "fair_value_share_price_cents": 500,
  "term_years": 3,
  "cash_interest_rate": 0.11
}
```

**Outputs (executed against the reference implementation `MODEL.FINANCE.VENTURE_DEBT_WARRANT.v1`)**

```json
{
  "loan_amount_cents": 1000000000,
  "warrant_coverage_pct": 0.1,
  "warrant_coverage_amount_cents": 100000000,
  "warrant_shares": 500000,
  "intrinsic_warrant_value_cents": 150000000,
  "simple_interest_cents": 330000000,
  "lender_gross_return_cents": 1480000000,
  "estimated_lender_irr": 0.1396
}
```

Precision: Monetary outputs are exact integer cents; the coverage fraction and the IRR are rounded per the global rule (half-even to 4 decimals — see the Conventions chapter); warrant shares are whole shares.

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["loan_amount_cents","warrant_coverage_pct","exercise_price_cents","fair_value_share_price_cents"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model sizes a venture-debt warrant package and estimates the lender's IRR from supplied loan, coverage, and price assumptions. The fair-value share price is an assumption, not a valuation, and the IRR is an estimate; the enforceable warrant terms, the true share count on a fully-diluted basis, and the instrument's tax treatment are determinations for the parties and counsel.

## 9. Conformance bindings

Requirement `REQ-M181` is verified by 2 published case(s): `CONF.MODEL.FINANCE.VD_WARRANT.001`, `CONF.MODEL.FINANCE.VD_WARRANT.002`.

## 10. Version

Reference binding `MODEL.FINANCE.VENTURE_DEBT_WARRANT.v1` · entered the specification at internal lineage stage `v1_1` · spec v1.0.0.


# M182 — ABL borrowing base

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G15, G29
**Deal contexts:** ABL

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Computes an asset-based lending borrowing base — advance-rate value against eligible accounts receivable and eligible inventory, less reserves — and the availability under any commitment cap. It answers, for a borrower or lender monitoring an ABL line, "how much can be drawn against the current collateral after reserves and the commitment?" It applies supplied or market-standard advance rates to supplied eligible balances; eligibility itself is the lender's determination.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M182.schema.json`](M182.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `eligible_ar_cents` | integer (cents) | MUST | Eligible accounts receivable in the borrowing base. |
| `eligible_inventory_cents` | integer (cents) | MUST | Eligible inventory in the borrowing base. |
| `ar_advance_rate` | number | MAY | Advance rate against eligible A/R as a fraction; defaults to the market-standard rate. |
| `commitment_cents` | integer (cents) | MAY | Facility commitment cap; when supplied, availability is capped at it. |
| `inventory_advance_rate` | number | MAY | Advance rate against eligible inventory as a fraction; defaults to the market-standard rate. |
| `reserves_cents` | integer (cents) | MAY | Lender reserves deducted from the gross base (default 0). |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `eligible_ar_cents` | integer (cents) | Eligible A/R, echoed. |
| `eligible_inventory_cents` | integer (cents) | Eligible inventory, echoed. |
| `ar_advance_rate` | number | The A/R advance rate applied. |
| `inventory_advance_rate` | number | The inventory advance rate applied. |
| `gross_borrowing_base_cents` | integer (cents) | Advance-rate value of eligible collateral before reserves. |
| `reserves_cents` | integer (cents) | Reserves applied, echoed. |
| `net_borrowing_base_cents` | integer (cents) | Gross base less reserves, floored at zero. |
| `availability_cents` | integer (cents) | Drawable availability after the commitment cap. |

## 4. Algorithm

Given `eligible_ar_cents` and `eligible_inventory_cents`, plus optional `ar_advance_rate` (default: the eligible-A/R advance-rate constant), `inventory_advance_rate` (default: the eligible-inventory advance-rate constant), `reserves_cents` (default 0), and `commitment_cents`:
1. If either required eligible balance is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.
2. `gross_borrowing_base_cents` SHALL be `round(eligible_ar_cents × ar_advance_rate) + round(eligible_inventory_cents × inventory_advance_rate)`.
3. `net_borrowing_base_cents` SHALL be `max(0, gross_borrowing_base_cents − reserves_cents)`.
4. `availability_cents` SHALL be `net_borrowing_base_cents` when no commitment is supplied, else `min(net_borrowing_base_cents, commitment_cents)`.
5. `ar_advance_rate` and `inventory_advance_rate` SHALL echo the applied rates (supplied or the constants) at the global 4-decimal precision.

## 5. Constants & authorities

| Constant | Value | Strength | Authority | Pin-cite | Effective | Next check |
|---|---|---|---|---|---|---|
| ABL eligible-A/R advance rate | 85% (0.85) | SHOULD (cited median) | ABL market practice — conventional advance rate on eligible accounts receivable (2024) | eligible-A/R advance-rate convention | 2024 market practice | on next annual ABL market survey |
| ABL eligible-inventory advance rate | 50% (0.50) | SHOULD (cited median) | ABL market practice — conventional advance rate on eligible inventory (2024) | eligible-inventory advance-rate convention | 2024 market practice | on next annual ABL market survey |


**Authorities**

| Authority | ID | Type |
|---|---|---|
| ABL Market Practice | AUTH-0027 | practice-norm |

## 6. Worked example

*A borrower with $10M eligible A/R and $4M eligible inventory, at standard 85% and 50% advance rates less a $500k reserve, has a $10M net borrowing base — capped to a $9M commitment.*

**Inputs**

```json
{
  "eligible_ar_cents": 1000000000,
  "eligible_inventory_cents": 400000000,
  "ar_advance_rate": 0.85,
  "inventory_advance_rate": 0.5,
  "reserves_cents": 50000000,
  "commitment_cents": 900000000
}
```

**Outputs (executed against the reference implementation `MODEL.FINANCE.ABL.BORROWING_BASE.v1`)**

```json
{
  "eligible_ar_cents": 1000000000,
  "eligible_inventory_cents": 400000000,
  "ar_advance_rate": 0.85,
  "inventory_advance_rate": 0.5,
  "gross_borrowing_base_cents": 1050000000,
  "reserves_cents": 50000000,
  "net_borrowing_base_cents": 1000000000,
  "availability_cents": 900000000
}
```

Precision: Advance rates are rounded per the global rule (half-even to 4 decimals — see the Conventions chapter); all dollar outputs are exact integer cents.

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["eligible_ar_cents","eligible_inventory_cents"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model computes an ABL borrowing base and availability from supplied eligible balances and advance rates. Which receivables and inventory are eligible, the reserves the lender imposes, and the definitions in the credit agreement are the lender's determinations; the model applies the arithmetic to the supplied eligible figures and renders no eligibility conclusion.

## 9. Conformance bindings

Requirement `REQ-M182` is verified by 2 published case(s): `CONF.MODEL.FINANCE.ABL.001`, `CONF.MODEL.FINANCE.ABL.002`.

## 10. Version

Reference binding `MODEL.FINANCE.ABL.BORROWING_BASE.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M183 — Make-whole and call protection

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G15, G29
**Deal contexts:** high-yield bonds · term loans

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Computes a bond or term-loan make-whole redemption price — the present value of remaining coupons and principal discounted at the Treasury rate plus the make-whole spread, floored at par — and compares it to the stated call price to identify the cheaper redemption route. It answers, for an issuer weighing an early redemption, "what does calling this cost under the make-whole versus the stated call, and which is cheaper?" It computes the make-whole arithmetic from supplied terms; the governing indenture language controls.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M183.schema.json`](M183.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `coupon_rate` | number | MUST | Annual coupon rate as a fraction (e.g., 0.08). |
| `principal_cents` | integer (cents) | MUST | Outstanding principal being redeemed. |
| `remaining_years` | number | MUST | Years remaining to maturity (may be fractional). |
| `spread_bps` | number | MUST | Make-whole spread over Treasury in basis points. |
| `treasury_rate` | number | MUST | Reference Treasury yield as a fraction. |
| `call_price_pct` | number | MAY | Stated call price as a fraction of par (default 1 = par). |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `principal_cents` | integer (cents) | The principal, echoed. |
| `coupon_rate` | number | The coupon rate applied. |
| `treasury_rate` | number | The Treasury rate applied. |
| `spread_bps` | number | The make-whole spread in basis points, echoed. |
| `make_whole_discount_rate` | number | Treasury rate plus the spread, as a decimal. |
| `make_whole_price_cents` | integer (cents) | The make-whole redemption price (PV of coupons and principal, floored at par). |
| `make_whole_premium_cents` | integer (cents) | The make-whole premium over par. |
| `stated_call_price_cents` | integer (cents) | The stated call price (principal × call price). |
| `lower_cost_redemption_path` | enum(redemption_path) | The cheaper redemption route. One of `make_whole`, `stated_call`. |

## 4. Algorithm

Given `principal_cents`, `coupon_rate`, `treasury_rate`, `spread_bps`, and `remaining_years`, plus optional `call_price_pct` (default 1 = par):
1. If any of the five required inputs is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.
2. The `make_whole_discount_rate` SHALL be `treasury_rate + spread_bps ÷ 10,000` (basis points to a decimal), at the global 4-decimal precision.
3. It SHALL present-value each remaining annual coupon (`principal_cents × coupon_rate`, the final period pro-rated for a fractional year) at the make-whole discount rate, and present-value the principal at that rate over the remaining years.
4. `make_whole_price_cents` SHALL be `max(principal_cents, round(PV of coupons + PV of principal))`; `make_whole_premium_cents` SHALL be `max(0, make_whole_price_cents − principal_cents)`.
5. `stated_call_price_cents` SHALL be `round(principal_cents × call_price_pct)`.
6. `lower_cost_redemption_path` SHALL be `make_whole` when the make-whole price is at or below the stated call price, else `stated_call`.

## 5. Constants & authorities

_No numeric constants — this model computes from supplied facts and cited rule text only (attested: `constants: []`)._


**Authorities**

| Authority | ID | Type |
|---|---|---|
| Indenture Practice | AUTH-0098 | practice-norm |

## 6. Worked example

*A $50M 8% note five years from maturity, redeemed against a 4% Treasury plus 50 basis points: the make-whole price of roughly $57.7M exceeds the 103 stated call ($51.5M), so the stated call is the cheaper route.*

**Inputs**

```json
{
  "principal_cents": 5000000000,
  "coupon_rate": 0.08,
  "treasury_rate": 0.04,
  "spread_bps": 50,
  "remaining_years": 5,
  "call_price_pct": 1.03
}
```

**Outputs (executed against the reference implementation `MODEL.FINANCE.MAKE_WHOLE_CALL.v1`)**

```json
{
  "principal_cents": 5000000000,
  "coupon_rate": 0.08,
  "treasury_rate": 0.04,
  "spread_bps": 50,
  "make_whole_discount_rate": 0.045,
  "make_whole_price_cents": 5768245930,
  "make_whole_premium_cents": 768245930,
  "stated_call_price_cents": 5150000000,
  "lower_cost_redemption_path": "stated_call"
}
```

Precision: The discount rate and input rates are rounded per the global rule (half-even to 4 decimals — see the Conventions chapter); all dollar outputs are exact integer cents.

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["principal_cents","coupon_rate","treasury_rate","spread_bps","remaining_years"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model computes a make-whole redemption price and compares it to the stated call from supplied rate and maturity facts. The exact make-whole formula, the reference security, the day-count, and the redemption conditions are set by the indenture or credit agreement and control over this approximation; the model produces the comparison and the drafting language remains counsel's.

## 9. Conformance bindings

Requirement `REQ-M183` is verified by 2 published case(s): `CONF.MODEL.FINANCE.MAKEWHOLE.001`, `CONF.MODEL.FINANCE.MAKEWHOLE.002`.

## 10. Version

Reference binding `MODEL.FINANCE.MAKE_WHOLE_CALL.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M184 — Covenant basket engine

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G15, G29
**Deal contexts:** credit agreement

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Computes the capacity of each negotiated covenant basket — fixed plus grower plus builder plus ratio capacity, less amounts used — and tests whether a proposed use fits, aggregating remaining capacity and counting blocked baskets. It answers, for a borrower or lender working a credit agreement, "how much restricted-payment, debt, lien, or investment capacity is left, and does the proposed action fit?" It totals capacity from supplied basket terms; whether a specific action qualifies under a basket is a credit-agreement construction question.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M184.schema.json`](M184.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `baskets` | object[] | MUST | Covenant baskets; each object carries `name`/`type` (strings) and integer-cents `fixed_capacity_cents` (or `opening_capacity_cents`), `grower_basis_cents`, `builder_amount_cents`, `ratio_capacity_cents`, `used_cents`, and `proposed_use_cents`, plus a `grower_pct` (number). |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `basket_count` | integer | Number of baskets evaluated. |
| `aggregate_remaining_capacity_cents` | integer (cents) | Sum of remaining capacity across all baskets. |
| `blocked_basket_count` | integer | Number of baskets whose proposed use exceeds remaining capacity. |
| `baskets` | object[] | Per-basket result: `{ name, basket_type, total_capacity_cents, used_cents, remaining_capacity_cents, proposed_use_cents, proposed_use_fits }`. |

## 4. Algorithm

Given `baskets` (a list of basket objects, each with fixed/grower/builder/ratio capacity, amount used, and a proposed use):
1. If `baskets` is empty, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.
2. For each basket, `total_capacity_cents` SHALL be `fixed_capacity + round(grower_basis × grower_pct) + builder_amount + ratio_capacity` (each defaulting to zero when omitted).
3. `remaining_capacity_cents` SHALL be `total_capacity_cents − used_cents`; `proposed_use_fits` SHALL be true iff `proposed_use_cents ≤ remaining_capacity_cents`.
4. `basket_count` SHALL be the number of baskets; `aggregate_remaining_capacity_cents` SHALL be the sum of the per-basket remaining capacities.
5. `blocked_basket_count` SHALL be the number of baskets whose proposed use does not fit.

## 5. Constants & authorities

_No numeric constants — this model computes from supplied facts and cited rule text only (attested: `constants: []`)._


**Authorities**

| Authority | ID | Type |
|---|---|---|
| LSTA Model Provisions | AUTH-0163 | practice-norm |

## 6. Worked example

*Two baskets: a restricted-payments basket with $1.8M of capacity ($1.6M free) that accommodates a $1.0M dividend, and a permitted-debt basket with $1.1M free that cannot absorb a proposed $2.0M draw — one basket blocked, $2.7M free in aggregate.*

**Inputs**

```json
{
  "baskets": [
    {
      "name": "Restricted Payments",
      "type": "restricted_payments",
      "fixed_capacity_cents": 500000000,
      "grower_basis_cents": 2000000000,
      "grower_pct": 0.5,
      "builder_amount_cents": 300000000,
      "used_cents": 200000000,
      "proposed_use_cents": 1000000000
    },
    {
      "name": "Permitted Debt",
      "type": "debt",
      "fixed_capacity_cents": 1000000000,
      "ratio_capacity_cents": 500000000,
      "used_cents": 400000000,
      "proposed_use_cents": 2000000000
    }
  ]
}
```

**Outputs (executed against the reference implementation `MODEL.FINANCE.COVENANT_BASKETS.v1`)**

```json
{
  "basket_count": 2,
  "aggregate_remaining_capacity_cents": 2700000000,
  "blocked_basket_count": 1,
  "baskets": [
    {
      "name": "Restricted Payments",
      "basket_type": "restricted_payments",
      "total_capacity_cents": 1800000000,
      "used_cents": 200000000,
      "remaining_capacity_cents": 1600000000,
      "proposed_use_cents": 1000000000,
      "proposed_use_fits": true
    },
    {
      "name": "Permitted Debt",
      "basket_type": "debt",
      "total_capacity_cents": 1500000000,
      "used_cents": 400000000,
      "remaining_capacity_cents": 1100000000,
      "proposed_use_cents": 2000000000,
      "proposed_use_fits": false
    }
  ]
}
```

Precision: All capacity outputs are exact integer cents (see the Conventions chapter); no rounding beyond the grower-capacity product.

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["baskets"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model totals covenant-basket capacity and tests proposed uses from supplied basket terms. Whether a specific payment, debt, lien, or investment qualifies under a given basket, how the grower and builder amounts are defined, and the ratio-capacity mechanics are credit-agreement construction questions for counsel; the model computes the capacity arithmetic and renders no qualification opinion.

## 9. Conformance bindings

Requirement `REQ-M184` is verified by 2 published case(s): `CONF.MODEL.FINANCE.BASKETS.001`, `CONF.MODEL.FINANCE.BASKETS.002`.

## 10. Version

Reference binding `MODEL.FINANCE.COVENANT_BASKETS.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M185 — 280G golden parachute

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G15
**Deal contexts:** M&A executive compensation

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Computes the §280G golden-parachute analysis for a change-in-control payment: the three-times-base-amount threshold, whether it is crossed, the excess parachute payment, the 20% §4999 excise tax, the employer's lost deduction, and whether a shareholder cleansing vote clears the disinterested-holder bar. It answers, for a deal team sizing executive change-in-control cost, "does this package trip §280G, and what does it cost if it does?" It computes the arithmetic from supplied figures; the parachute-payment characterization and the vote mechanics are counsel's.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M185.schema.json`](M185.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `base_amount_cents` | integer (cents) | MUST | The executive's §280G base amount (five-year average W-2 compensation). |
| `parachute_payments_cents` | integer (cents) | MUST | Aggregate contingent-on-change-in-control payments to the executive. |
| `shareholder_cleansing_vote_pct` | number | MAY | Fraction of disinterested shareholders approving the payments (0–1); optional. |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `base_amount_cents` | integer (cents) | The base amount, echoed. |
| `parachute_payments_cents` | integer (cents) | The parachute payments, echoed. |
| `three_times_base_threshold_cents` | integer (cents) | The three-times-base-amount safe-harbor threshold. |
| `section_280g_triggered` | boolean | Whether the payments meet or exceed three times the base amount. |
| `excess_parachute_payment_cents` | integer (cents) | The excess parachute payment (payments over one times base) when triggered, else 0. |
| `excise_tax_20pct_cents` | integer (cents) | The §4999 excise tax on the excess (20%). |
| `lost_employer_deduction_cents` | integer (cents) | The employer deduction disallowed under §280G (equal to the excess). |
| `shareholder_cleansing_vote_pct` | number | null | The supplied cleansing-vote fraction, echoed, or null. |
| `cleansing_vote_threshold_pct` | number | The disinterested-shareholder approval threshold (0.75). |
| `cleansing_vote_passed` | boolean | null | Whether the supplied vote exceeds the threshold, or null when no vote is supplied. |

## 4. Algorithm

Given `base_amount_cents`, `parachute_payments_cents`, and optional `shareholder_cleansing_vote_pct`:
1. If either required cents input is missing, the implementation SHALL return `status: "needs_inputs"`.
2. `three_times_base_threshold_cents` SHALL be `base_amount_cents × 3` (constants: §280G three-times-base multiple).
3. `section_280g_triggered` SHALL be true iff `parachute_payments_cents ≥ three_times_base_threshold_cents`.
4. `excess_parachute_payment_cents` SHALL be `max(0, parachute_payments_cents − base_amount_cents)` when triggered, else 0 (the excess is measured against one times base, not three).
5. `excise_tax_20pct_cents` SHALL be the excess times the §4999 excise rate, rounded to the nearest cent (constants: §4999 excise-tax rate); `lost_employer_deduction_cents` SHALL equal the excess (§280G disallows the employer deduction for the excess).
6. When a cleansing-vote percentage is supplied, `cleansing_vote_passed` SHALL be true iff it exceeds the disinterested-shareholder threshold (constants: §280G cleansing-vote threshold); when absent it SHALL be null.

## 5. Constants & authorities

| Constant | Value | Strength | Authority | Pin-cite | Effective | Next check |
|---|---|---|---|---|---|---|
| §280G three-times-base multiple | 3× | MUST (binding) | IRC § 280G(b)(2)(A)(ii) | § 280G(b)(2)(A)(ii) | current (IRC as amended) | on IRC amendment |
| §4999 excise-tax rate | 20% | MUST (binding) | IRC § 4999(a) | § 4999(a) | current (IRC as amended) | on IRC amendment |
| §280G cleansing-vote threshold | more than 75% of disinterested shareholders | MUST (binding) | IRC § 280G(b)(5); Treas. Reg. § 1.280G-1 | Q&A-7 (more-than-75% disinterested approval) | current (Treas. Reg. as amended) | on Treasury amendment |


**Authorities**

| Authority | ID | Type |
|---|---|---|
| IRC 280G | AUTH-0118 | statute |

## 6. Worked example

*An executive with an $800k base amount is set to receive $3.0M on the sale; the package clears three times base, creating a $2.2M excess parachute payment and a $440k excise tax.*

**Inputs**

```json
{
  "base_amount_cents": 80000000,
  "parachute_payments_cents": 300000000,
  "shareholder_cleansing_vote_pct": 0.9
}
```

**Outputs (executed against the reference implementation `MODEL.TAX.280G.PARACHUTE.v1`)**

```json
{
  "base_amount_cents": 80000000,
  "parachute_payments_cents": 300000000,
  "three_times_base_threshold_cents": 240000000,
  "section_280g_triggered": true,
  "excess_parachute_payment_cents": 220000000,
  "excise_tax_20pct_cents": 44000000,
  "lost_employer_deduction_cents": 220000000,
  "shareholder_cleansing_vote_pct": 0.9,
  "cleansing_vote_threshold_pct": 0.75,
  "cleansing_vote_passed": true
}
```

Precision: Monetary values are exact integer cents (see the Conventions chapter); the excise tax is the excess times 20% rounded to the nearest cent; vote percentages are fractions on a 0–1 scale.

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["base_amount_cents","parachute_payments_cents"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model computes the §280G three-times-base threshold, the excess parachute payment, the §4999 excise tax, and the lost employer deduction from supplied figures, and screens the cleansing-vote percentage. Whether a payment is a parachute payment, the reasonable-compensation offset that can reduce the excess, and the availability and mechanics of the shareholder cleansing vote are determinations for tax counsel; the model computes the arithmetic and renders no §280G opinion.

## 9. Conformance bindings

Requirement `REQ-M185` is verified by 2 published case(s): `CONF.MODEL.TAX.280G.001`, `CONF.MODEL.TAX.280G.002`.

## 10. Version

Reference binding `MODEL.TAX.280G.PARACHUTE.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M186 — 382 NOL limitation

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G15
**Deal contexts:** NOL target

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Computes the annual §382 limitation on a loss corporation's pre-change net operating losses — the loss-corporation equity value times the IRS long-term tax-exempt rate — and, given an NOL balance, the approximate number of years to absorb it. It answers, for a buyer valuing a target's carryforwards, "after the ownership change, how much of the NOL can be used each year?" It computes the base limitation from supplied figures; whether an ownership change occurred and the value and adjustments that feed the limitation are counsel's.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M186.schema.json`](M186.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `long_term_tax_exempt_rate` | number | MUST | The IRS long-term tax-exempt rate for the change month (a fraction, e.g. 0.0435); supplied at runtime. |
| `loss_corporation_value_cents` | integer (cents) | MUST | The equity value of the loss corporation immediately before the ownership change (§382(e)). |
| `nol_carryforward_cents` | integer (cents) | MAY | The pre-change NOL carryforward balance; optional, drives the years-to-absorb estimate. |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `loss_corporation_value_cents` | integer (cents) | The loss-corporation value, echoed. |
| `long_term_tax_exempt_rate` | number | The long-term tax-exempt rate used, at four decimals. |
| `annual_section_382_limitation_cents` | integer (cents) | The annual §382 limitation on pre-change NOL use. |
| `nol_carryforward_cents` | integer (cents) | null | The NOL balance, echoed, or null when not supplied. |
| `estimated_years_to_use_nol` | integer | null | Whole-year ceiling to absorb the NOL at the annual limitation, or null. |

## 4. Algorithm

Given `loss_corporation_value_cents` and `long_term_tax_exempt_rate`, and optional `nol_carryforward_cents`:
1. If either required input is missing, the implementation SHALL return `status: "needs_inputs"`.
2. `annual_section_382_limitation_cents` SHALL be `loss_corporation_value_cents × long_term_tax_exempt_rate`, rounded to the nearest cent (the §382(b)(1) base limitation).
3. `long_term_tax_exempt_rate` SHALL be echoed rounded to four decimals (see the Conventions chapter); the rate is a supplied pass-through value (the IRS publishes it monthly).
4. When `nol_carryforward_cents` is supplied and the annual limitation is positive, `estimated_years_to_use_nol` SHALL be the NOL balance divided by the annual limitation, rounded up to the next whole year; otherwise null.
5. The model computes the base limitation only; it SHALL NOT determine whether a §382 ownership change occurred, nor apply built-in gain/loss (§382(h)) or continuity-of-business adjustments.

## 5. Constants & authorities

| Constant | Value | Strength | Authority | Pin-cite | Effective | Next check |
|---|---|---|---|---|---|---|
| IRS long-term tax-exempt rate | supplied at runtime (IRS publishes monthly under §382(f)) | pass-through (live data) | IRC § 382(f); IRS monthly §382 rate release | § 382(f) | monthly | monthly (per IRS release) |


**Authorities**

| Authority | ID | Type |
|---|---|---|
| IRC 382 | AUTH-0128 | statute |

## 6. Worked example

*A target worth $50M undergoes an ownership change when the long-term tax-exempt rate is 4.35%; roughly $2.175M of the pre-change NOL becomes usable each year, absorbing a $10M carryforward over five years.*

**Inputs**

```json
{
  "loss_corporation_value_cents": 5000000000,
  "long_term_tax_exempt_rate": 0.0435,
  "nol_carryforward_cents": 1000000000
}
```

**Outputs (executed against the reference implementation `MODEL.TAX.382.NOL_LIMIT.v1`)**

```json
{
  "loss_corporation_value_cents": 5000000000,
  "long_term_tax_exempt_rate": 0.0435,
  "annual_section_382_limitation_cents": 217500000,
  "nol_carryforward_cents": 1000000000,
  "estimated_years_to_use_nol": 5
}
```

Precision: The limitation is exact integer cents; the long-term tax-exempt rate echoes at four decimals; years-to-absorb is a whole-year ceiling (see the Conventions chapter).

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["loss_corporation_value_cents","long_term_tax_exempt_rate"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model computes the annual §382 limitation as the loss-corporation value times the supplied long-term tax-exempt rate. Whether an ownership change has in fact occurred under §382(g), the correct loss-corporation value, the §382(h) built-in gain/loss adjustments, and the continuity-of-business-enterprise requirement are determinations for tax counsel; the model computes the base limitation and renders no §382 opinion.

## 9. Conformance bindings

Requirement `REQ-M186` is verified by 2 published case(s): `CONF.MODEL.TAX.382.001`, `CONF.MODEL.TAX.382.002`.

## 10. Version

Reference binding `MODEL.TAX.382.NOL_LIMIT.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M187 — RE-heavy asset-vs-entity election

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G30, G2
**Deal contexts:** real estate M&A

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Compares the asset-deal and entity-deal consequences for a real-estate-heavy target — the buyer basis and step-up each form delivers, the transfer-tax cost the asset form triggers, and whether the G30 real-estate overlay applies — and reports debt-assumability and in-place-lease treatment. It answers, when a target is real-estate-heavy, "what does each deal form do to basis, step-up value, and transfer tax?" It computes the comparison from supplied values and rates; the binding tax structuring is the advisor's.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M187.schema.json`](M187.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `enterprise_value_cents` | integer (cents) | MUST | Total enterprise value of the target. |
| `real_property_value_cents` | integer (cents) | MUST | Value of the real property inside the target. |
| `debt_assumable` | boolean | MAY | Whether existing property debt is assumable; drives debt_assumability. |
| `entity_carried_basis_cents` | integer (cents) | MAY | The target's carried (inside) tax basis in an entity deal (default 0). |
| `in_place_lease_treatment` | string | MAY | How in-place leases are treated on transfer (default: assumption/assignment to confirm). |
| `step_up_benefit_rate` | number | MAY | The present-value benefit rate applied to the step-up (default 0). |
| `transfer_tax_rate` | number | MAY | The real-estate transfer-tax rate applied in an asset deal, as a fraction (default 0). |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `enterprise_value_cents` | integer (cents) | Enterprise value, echoed. |
| `real_property_value_cents` | integer (cents) | Real-property value, echoed. |
| `real_estate_pct_of_ev` | number | Real property as a fraction of enterprise value. |
| `g30_real_estate_overlay_triggered` | boolean | Whether the G30 real-estate overlay applies. |
| `asset_deal_buyer_basis_cents` | integer (cents) | Buyer basis in an asset deal (the enterprise value). |
| `entity_deal_buyer_outside_basis_cents` | integer (cents) | Buyer outside basis in an entity deal (the enterprise value). |
| `entity_carried_basis_cents` | integer (cents) | The entity's carried inside basis, echoed. |
| `buyer_step_up_cents` | integer (cents) | Step-up an asset deal delivers over the carried basis. |
| `buyer_step_up_pv_benefit_cents` | integer (cents) | Present-value benefit of the step-up at the supplied rate. |
| `transfer_tax_rate` | number | The transfer-tax rate applied. |
| `transfer_tax_cents` | integer (cents) | Transfer tax on the real property in an asset deal. |
| `debt_assumability` | enum(debt_assumability) | Whether property debt is assumable, needs consent/refinance, or was not supplied. One of `not_supplied`, `assumable_on_supplied_facts`, `consent_or_refinance_required`. |
| `in_place_lease_treatment` | string | The in-place-lease treatment on transfer. |

## 4. Algorithm

Given `enterprise_value_cents` and `real_property_value_cents`, plus optional `entity_carried_basis_cents` (default 0), `transfer_tax_rate` (default 0), `step_up_benefit_rate` (default 0), `debt_assumable`, `in_place_lease_treatment`:
1. If either required input is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.
2. `real_estate_pct_of_ev` SHALL be `real_property_value_cents ÷ enterprise_value_cents`; `g30_real_estate_overlay_triggered` SHALL be true iff it is at or above the overlay threshold (constants: G30 real-estate overlay trigger).
3. `asset_deal_buyer_basis_cents` and `entity_deal_buyer_outside_basis_cents` SHALL both echo the enterprise value; `buyer_step_up_cents` SHALL be `max(0, enterprise_value_cents − entity_carried_basis_cents)`; `buyer_step_up_pv_benefit_cents` SHALL be `round(buyer_step_up_cents × step_up_benefit_rate)`.
4. `transfer_tax_cents` SHALL be `round(real_property_value_cents × transfer_tax_rate)` (the asset-form transfer-tax cost).
5. `debt_assumability` and `in_place_lease_treatment` SHALL report the supplied posture (or `not_supplied` / a default note).

## 5. Constants & authorities

| Constant | Value | Strength | Authority | Pin-cite | Effective | Next check |
|---|---|---|---|---|---|---|
| G30 real-estate overlay trigger | 25% of enterprise value (0.25) | table (jurisdictional) | DEFINITIVE G30 gate — Real Estate & Asset-Class Overlays trigger | real estate ≥ 25% of enterprise value | DEFINITIVE v1.1 | on gate-framework revision |


**Authorities**

| Authority | ID | Type |
|---|---|---|
| IRC 1001 | AUTH-0103 | statute |
| IRC 1060 | AUTH-0106 | statute |
| IRC 197 | AUTH-0116 | statute |

## 6. Worked example

*A $30M target with $12M of real property (40% of value, tripping the G30 overlay): an asset deal gives the buyer a $10M step-up worth ~$2.5M in present-value benefit but costs $168k in transfer tax on the real property, versus a carryover-basis entity deal.*

**Inputs**

```json
{
  "enterprise_value_cents": 3000000000,
  "real_property_value_cents": 1200000000,
  "entity_carried_basis_cents": 2000000000,
  "transfer_tax_rate": 0.014,
  "step_up_benefit_rate": 0.25,
  "debt_assumable": true
}
```

**Outputs (executed against the reference implementation `MODEL.RE.ASSET_ENTITY.ELECTION.v1`)**

```json
{
  "enterprise_value_cents": 3000000000,
  "real_property_value_cents": 1200000000,
  "real_estate_pct_of_ev": 0.4,
  "g30_real_estate_overlay_triggered": true,
  "asset_deal_buyer_basis_cents": 3000000000,
  "entity_deal_buyer_outside_basis_cents": 3000000000,
  "entity_carried_basis_cents": 2000000000,
  "buyer_step_up_cents": 1000000000,
  "buyer_step_up_pv_benefit_cents": 250000000,
  "transfer_tax_rate": 0.014,
  "transfer_tax_cents": 16800000,
  "debt_assumability": "assumable_on_supplied_facts",
  "in_place_lease_treatment": "assumption_or_assignment_to_confirm"
}
```

Precision: Monetary outputs are exact integer cents; the real-estate share and transfer-tax rate are rounded per the global rule (half-even to 4 decimals — see the Conventions chapter).

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["enterprise_value_cents","real_property_value_cents"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model compares the asset- and entity-deal consequences from supplied values and rates. The binding transfer-tax incidence, the availability and value of a step-up, the debt-assumption terms, and the lease treatment are legal and tax determinations for the parties' advisors; the model computes the comparison and renders no structuring opinion.

## 9. Conformance bindings

Requirement `REQ-M187` is verified by 2 published case(s): `CONF.MODEL.RE.ASSETENTITY.001`, `CONF.MODEL.RE.ASSETENTITY.002`.

## 10. Version

Reference binding `MODEL.RE.ASSET_ENTITY.ELECTION.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M188 — RE/operating-business purchase price bifurcation

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G30, G2
**Deal contexts:** real estate M&A · operating business with real property

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Splits a mixed real-estate-and-operating-business purchase price into its real-estate value (NOI capitalized at the supplied cap rate, capped at the price) and the residual operating-business value, then reconciles the split into §1060 Class V, VI, and VII. It answers, for a deal with both a building and a business inside it, "how much of the price is the real estate versus the operating business, and how does that map to the tax classes?" It computes the bifurcation from supplied values; the valuations and classifications are the advisors' calls.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M188.schema.json`](M188.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `cap_rate` | number | MUST | The capitalization rate applied to NOI (a fraction, e.g. 0.08). |
| `enterprise_value_cents` | integer (cents) | MUST | Total purchase price to be bifurcated. |
| `noi_cents` | integer (cents) | MUST | Stabilized net operating income of the real property. |
| `class_vi_intangibles_cents` | integer (cents) | MAY | Identified Class VI §197 intangible value (default 0). |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `enterprise_value_cents` | integer (cents) | The price, echoed. |
| `noi_cents` | integer (cents) | The NOI, echoed. |
| `cap_rate` | number | The cap rate applied. |
| `uncapped_real_estate_value_cents` | integer (cents) | NOI capitalized at the cap rate, before the price cap. |
| `real_estate_value_cents` | integer (cents) | Real-estate value after the price cap (Class V). |
| `operating_business_residual_value_cents` | integer (cents) | Price remaining after the real estate. |
| `class_v_real_property_and_tangible_cents` | integer (cents) | Class V real property and tangible allocation. |
| `class_vi_section_197_intangibles_cents` | integer (cents) | Class VI §197 intangibles allocation. |
| `class_vii_goodwill_going_concern_cents` | integer (cents) | Class VII goodwill/going-concern residual. |
| `form_8594_reconciliation_total_cents` | integer (cents) | Sum of the three classes (reconciles to the price). |

## 4. Algorithm

Given `enterprise_value_cents`, `noi_cents`, and `cap_rate`, plus optional `class_vi_intangibles_cents` (default 0):
1. If any required input is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.
2. `uncapped_real_estate_value_cents` SHALL be `round(noi_cents ÷ cap_rate)`; `real_estate_value_cents` SHALL be `min(enterprise_value_cents, uncapped_real_estate_value_cents)` and fills Class V.
3. `operating_business_residual_value_cents` SHALL be `max(0, enterprise_value_cents − real_estate_value_cents)`.
4. `class_vi_section_197_intangibles_cents` SHALL be `min(class_vi_intangibles_cents, residual)`; `class_vii_goodwill_going_concern_cents` SHALL be the remaining residual, following the residual-method ordering (constants: §1060 residual-method class ordering).
5. `form_8594_reconciliation_total_cents` SHALL be the sum of Class V, VI, and VII.

## 5. Constants & authorities

| Constant | Value | Strength | Authority | Pin-cite | Effective | Next check |
|---|---|---|---|---|---|---|
| §1060 residual-method class ordering | Class V (real property/tangible) → Class VI (§197 intangibles) → Class VII (goodwill and going-concern value) | table (jurisdictional) | Treas. Reg. § 1.1060-1(c); § 1.338-6(b) | § 1.338-6(b)(2) (residual-method ordering) | current (Treas. Reg. as amended) | on Treasury amendment |


**Authorities**

| Authority | ID | Type |
|---|---|---|
| Treas. Reg. 1.338-6 | AUTH-0242 | regulation |
| IRS Form 8594 | AUTH-0149 | form |

## 6. Worked example

*A $40M operating-business-with-real-estate deal: $2.4M of NOI at an 8% cap values the real property at $30M (Class V), $5M of identified intangibles fills Class VI, and the $5M residual becomes Class VII goodwill — Form 8594 reconciles to $40M.*

**Inputs**

```json
{
  "enterprise_value_cents": 4000000000,
  "noi_cents": 240000000,
  "cap_rate": 0.08,
  "class_vi_intangibles_cents": 500000000
}
```

**Outputs (executed against the reference implementation `MODEL.RE.OPBUS.BIFURCATION.v1`)**

```json
{
  "enterprise_value_cents": 4000000000,
  "noi_cents": 240000000,
  "cap_rate": 0.08,
  "uncapped_real_estate_value_cents": 3000000000,
  "real_estate_value_cents": 3000000000,
  "operating_business_residual_value_cents": 1000000000,
  "class_v_real_property_and_tangible_cents": 3000000000,
  "class_vi_section_197_intangibles_cents": 500000000,
  "class_vii_goodwill_going_concern_cents": 500000000,
  "form_8594_reconciliation_total_cents": 4000000000
}
```

Precision: All values are exact integer cents; the cap rate echoes at the global 4-decimal precision (see the Conventions chapter).

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["enterprise_value_cents","noi_cents","cap_rate"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model bifurcates a mixed price into real-estate and operating-business value and reconciles it to the §1060 classes from supplied figures. Whether the NOI, cap rate, and intangible values are supportable, and the binding Form 8594 positions, are determinations for the parties' appraisers and tax advisors; the model computes the split and renders no valuation or classification opinion.

## 9. Conformance bindings

Requirement `REQ-M188` is verified by 2 published case(s): `CONF.MODEL.RE.BIFURCATION.001`, `CONF.MODEL.RE.BIFURCATION.002`.

## 10. Version

Reference binding `MODEL.RE.OPBUS.BIFURCATION.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M189 — Rent-roll normalization engine

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G30
**Deal contexts:** real estate diligence

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Normalizes a rent roll into the metrics that drive an income-property read — occupancy by count and by area, total and occupied rent, weighted-average lease term (WALT), and top-tenant concentration — and flags single-tenant concentration above the market threshold. It answers, in real-estate diligence, "how full is the property, how long is the income locked in, and how exposed is it to one tenant?" It computes the metrics from a supplied rent roll.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M189.schema.json`](M189.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `rent_roll` | object[] | MUST | Tenant rows; each carries `tenant` (string), `annual_rent_cents` (integer cents), `square_feet`/`area` (number), `lease_months_remaining` (number) or `lease_expiry_date` (ISO date), and `occupied` (boolean). |
| `as_of_date` | string (ISO date) | MAY | The as-of date used to compute months remaining from lease-expiry dates. |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `tenant_count` | integer | Number of tenant rows. |
| `occupied_tenant_count` | integer | Number of occupied tenants. |
| `annual_rent_cents` | integer (cents) | Total annual rent across all rows. |
| `occupied_annual_rent_cents` | integer (cents) | Annual rent from occupied tenants. |
| `occupancy_pct` | number | null | Occupied tenants ÷ total tenants. |
| `area_occupancy_pct` | number | null | Occupied area ÷ total area, or null. |
| `walt_months` | number | null | Rent-weighted average lease term in months, or null. |
| `top_tenant_rent_pct` | number | null | Largest tenant's rent ÷ total rent, or null. |
| `tenant_concentration_flag` | boolean | Whether one tenant exceeds the concentration threshold. |

## 4. Algorithm

Given `rent_roll` (a list of tenant rows) and optional `as_of_date`:
1. If `rent_roll` is empty, the implementation SHALL return `status: "needs_inputs"` naming `rent_roll`.
2. For each tenant it SHALL read annual rent, area, and months remaining (from the field or computed from a lease-expiry date and the as-of date), and treat a tenant as occupied when marked so or when annual rent is positive.
3. `occupancy_pct` SHALL be occupied tenants ÷ tenants; `area_occupancy_pct` SHALL be occupied area ÷ total area (or null).
4. `walt_months` SHALL be the rent-weighted average of the occupied tenants' months remaining (occupied-rent-weighted), or null.
5. `top_tenant_rent_pct` SHALL be the largest single tenant's rent ÷ total rent; `tenant_concentration_flag` SHALL be true iff it exceeds the single-tenant concentration threshold (constants: single-tenant concentration threshold).

## 5. Constants & authorities

| Constant | Value | Strength | Authority | Pin-cite | Effective | Next check |
|---|---|---|---|---|---|---|
| Single-tenant concentration threshold | 20% of total rent (0.20) | SHOULD (cited median) | Real estate industry practice — single-tenant concentration flag (2024) | single tenant > 20% of total rent | 2024 industry practice | on industry-practice review |


**Authorities**

| Authority | ID | Type |
|---|---|---|
| Real Estate Industry Practice | AUTH-0201 | practice-norm |

## 6. Worked example

*A four-tenant office rent roll: three tenants occupied and one vacant suite, $1.20M in occupied rent, an anchor tenant at 50% of rent (over the concentration threshold), and a WALT weighted by the occupied rent.*

**Inputs**

```json
{
  "rent_roll": [
    {
      "tenant": "Anchor Corp",
      "annual_rent_cents": 60000000,
      "square_feet": 20000,
      "lease_months_remaining": 72,
      "occupied": true
    },
    {
      "tenant": "Suite 200",
      "annual_rent_cents": 36000000,
      "square_feet": 12000,
      "lease_months_remaining": 36,
      "occupied": true
    },
    {
      "tenant": "Suite 300",
      "annual_rent_cents": 24000000,
      "square_feet": 8000,
      "lease_months_remaining": 24,
      "occupied": true
    },
    {
      "tenant": "Suite 400 (vacant)",
      "annual_rent_cents": 0,
      "square_feet": 8000,
      "occupied": false
    }
  ]
}
```

**Outputs (executed against the reference implementation `MODEL.RE.RENT_ROLL.NORMALIZE.v1`)**

```json
{
  "tenant_count": 4,
  "occupied_tenant_count": 3,
  "annual_rent_cents": 120000000,
  "occupied_annual_rent_cents": 120000000,
  "occupancy_pct": 0.75,
  "area_occupancy_pct": 0.8333,
  "walt_months": 51.6,
  "top_tenant_rent_pct": 0.5,
  "tenant_concentration_flag": true
}
```

Precision: Occupancy and concentration ratios round per the global rule (half-even to 4 decimals — see the Conventions chapter); WALT is in months at 4 decimals; rents are exact integer cents.

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["rent_roll"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model normalizes a rent roll into occupancy, WALT, and concentration metrics from supplied rows. The creditworthiness of the tenants, the collectability of the rent, and the market-rent read are underwriting judgments for the buyer and its advisers; the model computes the metrics and flags concentration and renders no underwriting conclusion.

## 9. Conformance bindings

Requirement `REQ-M189` is verified by 2 published case(s): `CONF.MODEL.RE.RENT_ROLL.001`, `CONF.MODEL.RE.RENT_ROLL.002`.

## 10. Version

Reference binding `MODEL.RE.RENT_ROLL.NORMALIZE.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M190 — NOI normalization and cap-rate bridge

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G30
**Deal contexts:** real estate valuation

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Bridges from a property's income to value and back — normalized NOI (effective gross income less operating expenses and a replacement reserve), the value that NOI supports at the market cap rate, and the cap rate a supplied purchase price implies. It answers, in a property valuation, "what NOI does this property produce, what value does the market cap rate put on it, and what cap rate is the ask really at?" The market cap rate is a pass-through input, not a model output.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M190.schema.json`](M190.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `cap_rate` | number | MUST | The market capitalization rate (a fraction); a pass-through input. |
| `effective_gross_income_cents` | integer (cents) | MUST | Effective gross income (gross potential less vacancy/credit loss). |
| `operating_expenses_cents` | integer (cents) | MUST | Operating expenses. |
| `market_cap_rate_from_pass_through_source` | boolean | MAY | Whether the cap rate came from a pass-through market-data source; suppresses the pass-through-required flag. |
| `purchase_price_cents` | integer (cents) | MAY | A purchase price to test; enables the implied cap rate. |
| `replacement_reserve_cents` | integer (cents) | MAY | Replacement reserve deducted from NOI (default 0). |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `effective_gross_income_cents` | integer (cents) | EGI, echoed. |
| `operating_expenses_cents` | integer (cents) | Operating expenses, echoed. |
| `replacement_reserve_cents` | integer (cents) | Replacement reserve, echoed. |
| `normalized_noi_cents` | integer (cents) | Normalized NOI (EGI less expenses and reserve). |
| `cap_rate` | number | The market cap rate applied. |
| `value_from_cap_rate_cents` | integer (cents) | null | Value the NOI supports at the cap rate, or null. |
| `purchase_price_cents` | integer (cents) | null | The purchase price tested, echoed, or null. |
| `implied_cap_rate` | number | null | Cap rate implied by the purchase price, or null. |
| `pass_through_market_rate_required` | boolean | Whether a pass-through market cap rate is still required. |

## 4. Algorithm

Given `effective_gross_income_cents`, `operating_expenses_cents`, and `cap_rate`, plus optional `purchase_price_cents`, `replacement_reserve_cents` (default 0), `market_cap_rate_from_pass_through_source`:
1. If any required input is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.
2. `normalized_noi_cents` SHALL be `effective_gross_income_cents − operating_expenses_cents − replacement_reserve_cents`.
3. `value_from_cap_rate_cents` SHALL be `round(normalized_noi_cents ÷ cap_rate)` when the cap rate is positive, else null.
4. `implied_cap_rate` SHALL be `normalized_noi_cents ÷ purchase_price_cents` at the global 4-decimal precision when a purchase price is supplied, else null.
5. `pass_through_market_rate_required` SHALL be true unless the market cap rate is explicitly flagged as sourced from a pass-through provider.

## 5. Constants & authorities

_No numeric constants — this model computes from supplied facts and cited rule text only (attested: `constants: []`)._


**Authorities**

| Authority | ID | Type |
|---|---|---|
| Appraisal Institute Practice | AUTH-0035 | practice-norm |

## 6. Worked example

*A property with $5M of effective gross income, $1.8M of operating expenses, and a $200k replacement reserve normalizes to $3M NOI; at a 6.5% market cap rate that supports about a $46.2M value, and against a $48M asking price the implied cap rate is 6.25%.*

**Inputs**

```json
{
  "effective_gross_income_cents": 500000000,
  "operating_expenses_cents": 180000000,
  "cap_rate": 0.065,
  "purchase_price_cents": 4800000000,
  "replacement_reserve_cents": 20000000,
  "market_cap_rate_from_pass_through_source": true
}
```

**Outputs (executed against the reference implementation `MODEL.RE.NOI.CAP_RATE_BRIDGE.v1`)**

```json
{
  "effective_gross_income_cents": 500000000,
  "operating_expenses_cents": 180000000,
  "replacement_reserve_cents": 20000000,
  "normalized_noi_cents": 300000000,
  "cap_rate": 0.065,
  "value_from_cap_rate_cents": 4615384615,
  "purchase_price_cents": 4800000000,
  "implied_cap_rate": 0.0625,
  "pass_through_market_rate_required": false
}
```

Precision: NOI and value are exact integer cents; cap rates round per the global rule (half-even to 4 decimals — see the Conventions chapter).

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["effective_gross_income_cents","operating_expenses_cents","cap_rate"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model bridges NOI to value and back from supplied income and a cap rate. The market cap rate itself is a pass-through input the model does not produce, and the appraised value and expense normalization are the appraiser's and accountant's determinations; the model computes the arithmetic bridge and renders no value opinion.

## 9. Conformance bindings

Requirement `REQ-M190` is verified by 2 published case(s): `CONF.MODEL.RE.NOI.001`, `CONF.MODEL.RE.NOI.002`.

## 10. Version

Reference binding `MODEL.RE.NOI.CAP_RATE_BRIDGE.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M191 — Real estate transfer and controlling-interest tax

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G30, G19
**Deal contexts:** real estate M&A

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Computes the state real-estate transfer / controlling-interest transfer tax for a jurisdiction with a tabled rate — the tax base (fair value times the interest transferred), the tax at the state rate, and any controlling-interest aggregation window — and routes a contested state position when no rate is tabled. It answers, in a real-estate or entity deal, "what transfer tax does this state charge on this transfer, and over what aggregation window?" It computes the tax from the state table; contested or untabled positions route to a specialist.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M191.schema.json`](M191.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `fmv_real_property_cents` | integer (cents) | MUST | Fair market value of the real property. |
| `interest_transferred_pct` | number | MUST | Fraction of the interest transferred (0–1). |
| `jurisdiction` | string (US state code) | MUST | The taxing jurisdiction (state/DC code). |
| `exemption_applies` | boolean | MAY | Whether a transfer-tax exemption applies (default false); zeroes the tax. |
| `transfer_tax_rate` | number | MAY | An override transfer-tax rate as a fraction; defaults to the state table. |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `jurisdiction` | string (US state code) | The jurisdiction, upper-cased. |
| `fmv_real_property_cents` | integer (cents) | The fair market value, echoed. |
| `interest_transferred_pct` | number | The interest transferred, as a fraction. |
| `transfer_tax_rate` | number | The transfer-tax rate applied. |
| `tax_base_cents` | integer (cents) | The tax base (value times interest transferred). |
| `transfer_tax_cents` | integer (cents) | The transfer tax (zero when exempt). |
| `exemption_applies` | boolean | Whether an exemption applied. |
| `aggregation_window_months` | integer | null | The controlling-interest aggregation window in months, or null. |
| `contested_state_position_handoff_required` | boolean | True when the state is untabled and no rate was supplied. |

## 4. Algorithm

Given `jurisdiction`, `fmv_real_property_cents`, and `interest_transferred_pct` (a fraction), plus optional `transfer_tax_rate`, `exemption_applies` (default false):
1. If any required input is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.
2. It SHALL upper-case the jurisdiction and select the transfer-tax rate: the supplied rate, else the tabled state rate (constants: state transfer-tax rate table), else zero.
3. `tax_base_cents` SHALL be `round(fmv_real_property_cents × interest_transferred_pct)`.
4. `transfer_tax_cents` SHALL be 0 when an exemption applies, else `round(tax_base_cents × transfer_tax_rate)`.
5. `aggregation_window_months` SHALL be the tabled controlling-interest aggregation window for the state, or null (constants: controlling-interest aggregation windows).
6. `contested_state_position_handoff_required` SHALL be true iff no rate was supplied and the state is not in the rate table.

## 5. Constants & authorities

| Constant | Value | Strength | Authority | Pin-cite | Effective | Next check |
|---|---|---|---|---|---|---|
| State transfer-tax rate table | CT 1.11%, ME 0.44%, WA 1.78%, DC 1.45%, MD 1.00%, NY 0.65% (default rates) | table (jurisdictional) | CT § 12-638; WA RCW 82.45; MD Tax-Prop § 12-117; NY Publication 576; DC/ME transfer-tax statutes | per-state default controlling-interest/deed transfer-tax rates | 2024 rate table | on state-rate review |
| Controlling-interest aggregation windows | MD 12 months, WA 36 months | table (jurisdictional) | MD Tax-Prop § 12-117; WA RCW 82.45 | controlling-interest acting-in-concert aggregation windows | 2024 table | on state-rate review |


**Authorities**

| Authority | ID | Type |
|---|---|---|
| CT 12-638 | AUTH-0058 | practice-or-guidance |
| MD Tax-Prop 12-117 | AUTH-0169 | practice-or-guidance |
| WA RCW 82.45 | AUTH-0261 | practice-or-guidance |
| NY Publication 576 | AUTH-0187 | study/dataset |

## 6. Worked example

*A 100% controlling-interest transfer of a $10M Washington property: at Washington's default 1.78% REET rate the base is the full $10M and the transfer tax is $178,000, with a 36-month controlling-interest aggregation window.*

**Inputs**

```json
{
  "jurisdiction": "WA",
  "fmv_real_property_cents": 1000000000,
  "interest_transferred_pct": 1,
  "exemption_applies": false
}
```

**Outputs (executed against the reference implementation `MODEL.RE.CITT.TRANSFER_TAX.v1`)**

```json
{
  "jurisdiction": "WA",
  "fmv_real_property_cents": 1000000000,
  "interest_transferred_pct": 1,
  "transfer_tax_rate": 0.0178,
  "tax_base_cents": 1000000000,
  "transfer_tax_cents": 17800000,
  "exemption_applies": false,
  "aggregation_window_months": 36,
  "contested_state_position_handoff_required": false
}
```

Precision: Tax base and tax are exact integer cents; the rate and interest percentage round per the global rule (half-even to 4 decimals — see the Conventions chapter).

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["jurisdiction","fmv_real_property_cents","interest_transferred_pct"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model computes state transfer / controlling-interest tax from a tabled rate and supplied values. Whether a transfer is taxable, whether an exemption applies, and the contested state positions (especially controlling-interest aggregation) are tax determinations for a state-tax specialist; on an untabled state the model routes the position and renders no taxability opinion.

## 9. Conformance bindings

Requirement `REQ-M191` is verified by 2 published case(s): `CONF.MODEL.RE.CITT.001`, `CONF.MODEL.RE.CITT.002`.

## 10. Version

Reference binding `MODEL.RE.CITT.TRANSFER_TAX.v1` · entered the specification at internal lineage stage `v1_1` · spec v1.0.0.


# M192 — CAM reconciliation mechanics

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G30
**Deal contexts:** commercial real estate diligence

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Computes a tenant's CAM (common-area maintenance) reconciliation — the tenant's annual pro-rata share of recoverable expenses, the share prorated through a mid-period closing, and the true-up against what the tenant already paid. It answers, at a closing or year-end, "what does this tenant owe on CAM through the closing date, and is there a credit or a bill?" It computes the reconciliation from supplied figures.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M192.schema.json`](M192.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `recoverable_expenses_cents` | integer (cents) | MUST | Total recoverable CAM expenses for the period. |
| `tenant_pro_rata_pct` | number | MUST | The tenant's pro-rata share as a fraction; if omitted, computed from tenant_area ÷ total_area. |
| `closing_day_of_period` | number | MAY | Day of the period at closing, for proration (default 0). |
| `period_days` | number | MAY | Days in the reconciliation period (default 365). |
| `tenant_area` | number | MAY | The tenant's leased area (used with total_area when the share is omitted). |
| `tenant_payments_cents` | integer (cents) | MAY | CAM the tenant has already paid for the period (default 0). |
| `total_area` | number | MAY | Total leasable area (used with tenant_area when the share is omitted). |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `recoverable_expenses_cents` | integer (cents) | Recoverable expenses, echoed. |
| `tenant_pro_rata_pct` | number | The pro-rata share applied. |
| `annual_tenant_share_cents` | integer (cents) | The tenant's full-period share. |
| `prorated_tenant_share_through_closing_cents` | integer (cents) | The share prorated through the closing day. |
| `tenant_payments_cents` | integer (cents) | Payments already made, echoed. |
| `closing_true_up_cents` | integer (cents) | Prorated share less payments (positive = owed by tenant; negative = credit). |

## 4. Algorithm

Given `recoverable_expenses_cents` and `tenant_pro_rata_pct` (supplied or computed from `tenant_area ÷ total_area`), plus optional `tenant_payments_cents` (default 0), `closing_day_of_period` (default 0), `period_days` (default 365):
1. If recoverable expenses are missing and no pro-rata share can be resolved, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.
2. `annual_tenant_share_cents` SHALL be `round(recoverable_expenses_cents × tenant_pro_rata_pct)`.
3. `prorated_tenant_share_through_closing_cents` SHALL be `round(annual_tenant_share_cents × clamp(closing_day_of_period ÷ period_days, 0, 1))`.
4. `closing_true_up_cents` SHALL be `prorated_tenant_share_through_closing_cents − tenant_payments_cents` (positive = tenant owes; negative = credit to tenant).
5. `tenant_pro_rata_pct` SHALL echo at the global 4-decimal precision.

## 5. Constants & authorities

_No numeric constants — this model computes from supplied facts and cited rule text only (attested: `constants: []`)._


**Authorities**

| Authority | ID | Type |
|---|---|---|
| BOMA | AUTH-0039 | practice-or-guidance |
| Real Estate Industry Practice | AUTH-0201 | practice-norm |

## 6. Worked example

*A tenant with an 8% pro-rata share of $1.2M in recoverable expenses owes $96,000 for the year; prorated to about $47,342 through a mid-year (day-180) closing against $60,000 already paid, the closing true-up is a ~$12,658 credit back to the tenant.*

**Inputs**

```json
{
  "recoverable_expenses_cents": 120000000,
  "tenant_pro_rata_pct": 0.08,
  "tenant_payments_cents": 6000000,
  "closing_day_of_period": 180,
  "period_days": 365
}
```

**Outputs (executed against the reference implementation `MODEL.RE.CAM.TRUEUP.v1`)**

```json
{
  "recoverable_expenses_cents": 120000000,
  "tenant_pro_rata_pct": 0.08,
  "annual_tenant_share_cents": 9600000,
  "prorated_tenant_share_through_closing_cents": 4734247,
  "tenant_payments_cents": 6000000,
  "closing_true_up_cents": -1265753
}
```

Precision: Shares and true-up are exact integer cents; the pro-rata share rounds per the global rule (half-even to 4 decimals — see the Conventions chapter).

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["recoverable_expenses_cents","tenant_pro_rata_pct"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model computes the CAM reconciliation from supplied figures. Which expenses are recoverable, the gross-up and base-year mechanics in the lease, and any dispute over the calculation are lease-interpretation questions for the parties and counsel; the model computes the arithmetic and renders no interpretation of the CAM clause.

## 9. Conformance bindings

Requirement `REQ-M192` is verified by 2 published case(s): `CONF.MODEL.RE.CAM.001`, `CONF.MODEL.RE.CAM.002`.

## 10. Version

Reference binding `MODEL.RE.CAM.TRUEUP.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M193 — Lease abstraction schema

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G30
**Deal contexts:** lease diligence

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Abstracts a set of leases into a structured schema — tenant, rent, expiry, months remaining, assignment and change-of-control consent, renewal options, and the exclusive-use / co-tenancy / go-dark flags — and rolls up total rent, WALT, and the counts of each restriction. It answers, in lease diligence, "what do these leases actually say on the fields that matter, and where are the restrictions?" It captures the fields without interpreting enforceability.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M193.schema.json`](M193.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `leases` | object[] | MUST | Leases to abstract; each carries `tenant` (string), `annual_rent_cents` (integer cents), `expiry_date` (ISO date), `months_remaining` (number), `assignment_consent_required` (boolean), `change_of_control_consent_required` (boolean), `renewal_options_count` (integer), `exclusive_use` (boolean), `co_tenancy` (boolean), and `go_dark` (boolean). |
| `as_of_date` | string (ISO date) | MAY | As-of date to compute months remaining from expiry dates. |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `lease_count` | integer | Number of leases abstracted. |
| `annual_rent_cents` | integer (cents) | Total annual rent across all leases. |
| `walt_months` | number | null | Rent-weighted average lease term in months, or null. |
| `assignment_consent_required_count` | integer | Number requiring assignment consent. |
| `change_of_control_consent_required_count` | integer | Number requiring change-of-control consent. |
| `exclusives_count` | integer | Number with an exclusive-use clause. |
| `co_tenancy_count` | integer | Number with a co-tenancy clause. |
| `go_dark_count` | integer | Number with a go-dark right. |
| `abstraction_rows` | object[] | Per-lease detail: `{ tenant, annual_rent_cents, expiry_date, months_remaining, assignment_consent_required, change_of_control_consent_required, renewal_options_count, exclusive_use, co_tenancy, go_dark }`. |

## 4. Algorithm

Given `leases` (a list of lease objects) and optional `as_of_date`:
1. If `leases` is empty, the implementation SHALL return `status: "needs_inputs"` naming `leases`.
2. For each lease it SHALL capture annual rent, expiry date, months remaining (from the field or computed from the expiry and the as-of date), the assignment and change-of-control consent flags, the renewal-option count, and the exclusive-use, co-tenancy, and go-dark flags.
3. `annual_rent_cents` SHALL be the sum of the per-lease rents.
4. `walt_months` SHALL be the rent-weighted average of months remaining, or null.
5. It SHALL count leases and the assignment-consent, change-of-control-consent, exclusive-use, co-tenancy, and go-dark leases, and return the full abstraction detail.

## 5. Constants & authorities

_No numeric constants — this model computes from supplied facts and cited rule text only (attested: `constants: []`)._


**Authorities**

| Authority | ID | Type |
|---|---|---|
| Lease Abstraction Industry Practice | AUTH-0156 | practice-norm |

## 6. Worked example

*Three retail leases abstracted: $2.4M of total rent, two requiring change-of-control consent, one exclusive-use and one co-tenancy clause, and a rent-weighted lease term rolled up across the three.*

**Inputs**

```json
{
  "leases": [
    {
      "tenant": "Anchor",
      "annual_rent_cents": 120000000,
      "months_remaining": 96,
      "assignment_consent_required": true,
      "change_of_control_consent_required": true,
      "renewal_options_count": 2,
      "exclusive_use": true
    },
    {
      "tenant": "Inline A",
      "annual_rent_cents": 72000000,
      "months_remaining": 48,
      "change_of_control_consent_required": true,
      "co_tenancy": true
    },
    {
      "tenant": "Inline B",
      "annual_rent_cents": 48000000,
      "months_remaining": 24,
      "go_dark": true
    }
  ]
}
```

**Outputs (executed against the reference implementation `MODEL.RE.LEASE_ABSTRACTION.v1`)**

```json
{
  "lease_count": 3,
  "annual_rent_cents": 240000000,
  "walt_months": 67.2,
  "assignment_consent_required_count": 1,
  "change_of_control_consent_required_count": 2,
  "exclusives_count": 1,
  "co_tenancy_count": 1,
  "go_dark_count": 1,
  "abstraction_rows": [
    {
      "tenant": "Anchor",
      "annual_rent_cents": 120000000,
      "expiry_date": null,
      "months_remaining": 96,
      "assignment_consent_required": true,
      "change_of_control_consent_required": true,
      "renewal_options_count": 2,
      "exclusive_use": true,
      "co_tenancy": false,
      "go_dark": false
    },
    {
      "tenant": "Inline A",
      "annual_rent_cents": 72000000,
      "expiry_date": null,
      "months_remaining": 48,
      "assignment_consent_required": false,
      "change_of_control_consent_required": true,
      "renewal_options_count": 0,
      "exclusive_use": false,
      "co_tenancy": true,
      "go_dark": false
    },
    {
      "tenant": "Inline B",
      "annual_rent_cents": 48000000,
      "expiry_date": null,
      "months_remaining": 24,
      "assignment_consent_required": false,
      "change_of_control_consent_required": false,
      "renewal_options_count": 0,
      "exclusive_use": false,
      "co_tenancy": false,
      "go_dark": true
    }
  ]
}
```

Precision: Rents are exact integer cents; WALT is in months at the global 4-decimal precision (see the Conventions chapter).

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["leases"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model captures lease fields into a structured schema without interpreting them. Whether a consent clause is triggered, how an exclusive-use or co-tenancy provision operates, and the enforceability of any term are legal determinations for counsel; the model abstracts the fields and rolls up the counts and renders no interpretation.

## 9. Conformance bindings

Requirement `REQ-M193` is verified by 2 published case(s): `CONF.MODEL.RE.LEASES.001`, `CONF.MODEL.RE.LEASES.002`.

## 10. Version

Reference binding `MODEL.RE.LEASE_ABSTRACTION.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M194 — OpCo/PropCo separation mechanics

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G30, G2
**Deal contexts:** OpCo/PropCo · sale-leaseback

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Sizes an OpCo/PropCo separation — the arm's-length master-lease rent (property value at the target cap rate, or supplied), the OpCo EBITDA before and after rent, the rent coverage, and whether the lease term or residual value trips a true-lease recharacterization review. It answers, in a sale-leaseback or OpCo/PropCo split, "what rent does the property carry, can the operating business cover it, and does the lease risk being recharacterized?" It computes the mechanics; the tax and accounting characterization is the specialist's.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M194.schema.json`](M194.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `opco_ebitda_cents` | integer (cents) | MUST | OpCo EBITDA before rent. |
| `real_property_value_cents` | integer (cents) | MUST | Value of the property held in PropCo. |
| `target_cap_rate` | number | MUST | Target cap rate used to set the master-lease rent (a fraction). |
| `annual_master_lease_rent_cents` | integer (cents) | MAY | Override master-lease rent; defaults to value × cap rate. |
| `lease_term_years` | number | MAY | Master-lease term in years; drives the recharacterization term test. |
| `residual_value_pct` | number | MAY | Projected residual value as a fraction; drives the recharacterization residual test. |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `real_property_value_cents` | integer (cents) | Property value, echoed. |
| `annual_master_lease_rent_cents` | integer (cents) | The master-lease rent (supplied or computed). |
| `implied_rent_yield` | number | null | Rent ÷ property value, or null. |
| `opco_ebitda_before_rent_cents` | integer (cents) | OpCo EBITDA before rent, echoed. |
| `opco_ebitda_after_rent_cents` | integer (cents) | OpCo EBITDA after the master-lease rent. |
| `rent_to_ebitda_pct` | number | null | Rent as a fraction of OpCo EBITDA, or null. |
| `lease_term_years` | number | null | The lease term, echoed, or null. |
| `residual_value_pct` | number | null | The residual-value fraction, echoed, or null. |
| `recharacterization_review_required` | boolean | Whether the lease term or residual trips a true-lease recharacterization review. |
| `tax_accounting_handoff_required` | boolean | Always true — the characterization routes to specialists. |

## 4. Algorithm

Given `real_property_value_cents`, `target_cap_rate`, and `opco_ebitda_cents`, plus optional `annual_master_lease_rent_cents`, `lease_term_years`, `residual_value_pct`:
1. If any required input is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.
2. `annual_master_lease_rent_cents` SHALL be the supplied rent, else `round(real_property_value_cents × target_cap_rate)`.
3. `implied_rent_yield` SHALL be `rent ÷ real_property_value_cents`; `opco_ebitda_after_rent_cents` SHALL be `opco_ebitda_cents − rent`; `rent_to_ebitda_pct` SHALL be `rent ÷ opco_ebitda_cents` (both at the global 4-decimal precision, or null).
4. `recharacterization_review_required` SHALL be true iff the lease term is at or above the recharacterization term threshold (constants: true-lease term threshold) OR the residual value is below the residual threshold (constants: true-lease residual threshold).
5. `tax_accounting_handoff_required` SHALL always be true.

## 5. Constants & authorities

| Constant | Value | Strength | Authority | Pin-cite | Effective | Next check |
|---|---|---|---|---|---|---|
| True-lease term threshold | 30 years | SHOULD (cited median) | OpCo/PropCo master-lease characterization market practice (2024) | lease term ≥ 30 years triggers recharacterization review | 2024 market practice | on practice review |
| True-lease residual threshold | 20% residual value (0.20) | SHOULD (cited median) | True-lease residual-value convention; cf. Rev. Proc. 2001-28 (2001) | residual value < 20% triggers recharacterization review | 2024 market practice | on practice review |


**Authorities**

| Authority | ID | Type |
|---|---|---|
| IRC 163(j) | AUTH-0114 | statute |
| IRC 856 | AUTH-0138 | statute |
| ASC 842 | AUTH-0036 | practice-or-guidance |

## 6. Worked example

*A $50M property master-leased to the OpCo at a 7% yield ($3.5M rent) leaves $4.5M of OpCo EBITDA after rent (a 44% rent-to-EBITDA); a 20-year term with 25% residual value stays clear of the true-lease recharacterization thresholds — the characterization still routes to specialists.*

**Inputs**

```json
{
  "real_property_value_cents": 5000000000,
  "target_cap_rate": 0.07,
  "opco_ebitda_cents": 800000000,
  "lease_term_years": 20,
  "residual_value_pct": 0.25
}
```

**Outputs (executed against the reference implementation `MODEL.RE.OPCO_PROPCO.SEPARATION.v1`)**

```json
{
  "real_property_value_cents": 5000000000,
  "annual_master_lease_rent_cents": 350000000,
  "implied_rent_yield": 0.07,
  "opco_ebitda_before_rent_cents": 800000000,
  "opco_ebitda_after_rent_cents": 450000000,
  "rent_to_ebitda_pct": 0.4375,
  "lease_term_years": 20,
  "residual_value_pct": 0.25,
  "recharacterization_review_required": false,
  "tax_accounting_handoff_required": true
}
```

Precision: Monetary outputs are exact integer cents; yields and coverage round per the global rule (half-even to 4 decimals — see the Conventions chapter).

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["real_property_value_cents","target_cap_rate","opco_ebitda_cents"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model sizes the OpCo/PropCo master lease and screens the recharacterization thresholds from supplied facts. Whether the lease is a true lease or a financing for tax and accounting, the §163(j) interest consequences, and any REIT interaction are determinations for tax and accounting specialists; the model computes the mechanics and always routes the characterization, rendering no conclusion.

## 9. Conformance bindings

Requirement `REQ-M194` is verified by 2 published case(s): `CONF.MODEL.RE.OPCO_PROPCO.001`, `CONF.MODEL.RE.OPCO_PROPCO.002`.

## 10. Version

Reference binding `MODEL.RE.OPCO_PROPCO.SEPARATION.v1` · entered the specification at internal lineage stage `v1_1` · spec v1.0.0.


# M195 — Property-level escrow and holdback sizing

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G30
**Deal contexts:** real estate diligence

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Sizes the property-level escrows a deal holds back — bucketing each supplied issue into environmental, PCA, title, tenant, cost-to-cure, or other, applying its holdback percentage and a general buffer, and totaling each bucket and the aggregate. It answers, at a real-estate closing, "how much do we hold back for each open property issue, and where do specialist reports back the number?" It sizes the escrows from supplied issues; the underlying cost estimates are the specialists'.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M195.schema.json`](M195.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `issues` | object[] | MUST | Property issues; each carries `name` (string), `type`/`category` (string), `amount_cents`/`cost_to_cure_cents` (integer cents), `holdback_pct` (number, default 1), `source` (string), and `pass_through_source_required` (boolean). |
| `general_buffer_rate` | number | MAY | A general buffer added to every escrow as a fraction (default 0). |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `property_issue_count` | integer | Number of property issues. |
| `general_buffer_rate` | number | The general buffer applied. |
| `environmental_escrow_cents` | integer (cents) | Total environmental escrow. |
| `pca_reserve_escrow_cents` | integer (cents) | Total PCA/physical-condition escrow. |
| `title_exception_escrow_cents` | integer (cents) | Total title-exception escrow. |
| `tenant_dispute_escrow_cents` | integer (cents) | Total tenant-dispute escrow. |
| `cost_to_cure_escrow_cents` | integer (cents) | Total cost-to-cure escrow. |
| `other_property_escrow_cents` | integer (cents) | Total other-category escrow. |
| `total_property_escrow_cents` | integer (cents) | Aggregate property escrow. |
| `pass_through_source_required_count` | integer | Number of issues needing a pass-through specialist report. |
| `escrow_rows` | object[] | Per-issue detail: `{ issue, category (a property_escrow_category value), source, amount_cents, holdback_pct, escrow_cents, pass_through_source_required }`. |

## 4. Algorithm

Given `issues` (a list of issue objects) and optional `general_buffer_rate` (default 0):
1. If `issues` is empty, the implementation SHALL return `status: "needs_inputs"` naming `issues`.
2. For each issue it SHALL classify the category (environmental, pca, title, tenant, cost_to_cure, or other) from the type, take the amount, and compute `escrow_cents = round(amount × holdback_pct × (1 + general_buffer_rate))` (holdback defaulting to 1).
3. It SHALL total the escrow by category into the environmental, PCA, title, tenant, cost-to-cure, and other bucket outputs, and sum the aggregate.
4. `pass_through_source_required` SHALL default true for environmental, PCA, and title issues (report-backed); `pass_through_source_required_count` SHALL count them.
5. It SHALL return the full per-issue escrow detail.

## 5. Constants & authorities

_No numeric constants — this model computes from supplied facts and cited rule text only (attested: `constants: []`)._


**Authorities**

| Authority | ID | Type |
|---|---|---|
| ALTA Endorsements | AUTH-0030 | practice-norm |
| Real Estate Practice Norms | AUTH-0202 | practice-norm |

## 6. Worked example

*Three property issues escrowed at closing: a $500k Phase II environmental holdback, a $200k roof reserve, and a $100k title exception held back at 50% — $750k in aggregate, three of them backed by pass-through specialist reports.*

**Inputs**

```json
{
  "issues": [
    {
      "name": "Phase II environmental",
      "type": "environmental",
      "amount_cents": 50000000,
      "holdback_pct": 1
    },
    {
      "name": "Roof replacement",
      "type": "pca",
      "amount_cents": 20000000,
      "holdback_pct": 1
    },
    {
      "name": "Title exception",
      "type": "title",
      "amount_cents": 10000000,
      "holdback_pct": 0.5
    }
  ],
  "general_buffer_rate": 0
}
```

**Outputs (executed against the reference implementation `MODEL.RE.PROPERTY_ESCROW.HOLDBACK.v1`)**

```json
{
  "property_issue_count": 3,
  "general_buffer_rate": 0,
  "environmental_escrow_cents": 50000000,
  "pca_reserve_escrow_cents": 20000000,
  "title_exception_escrow_cents": 5000000,
  "tenant_dispute_escrow_cents": 0,
  "cost_to_cure_escrow_cents": 0,
  "other_property_escrow_cents": 0,
  "total_property_escrow_cents": 75000000,
  "pass_through_source_required_count": 3,
  "escrow_rows": [
    {
      "issue": "Phase II environmental",
      "category": "environmental",
      "source": "pass_through_report",
      "amount_cents": 50000000,
      "holdback_pct": 1,
      "escrow_cents": 50000000,
      "pass_through_source_required": true
    },
    {
      "issue": "Roof replacement",
      "category": "pca",
      "source": "pass_through_report",
      "amount_cents": 20000000,
      "holdback_pct": 1,
      "escrow_cents": 20000000,
      "pass_through_source_required": true
    },
    {
      "issue": "Title exception",
      "category": "title",
      "source": "pass_through_report",
      "amount_cents": 10000000,
      "holdback_pct": 0.5,
      "escrow_cents": 5000000,
      "pass_through_source_required": true
    }
  ]
}
```

Precision: Escrow amounts are exact integer cents; the holdback and buffer round per the global rule (half-even to 4 decimals — see the Conventions chapter).

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["issues"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model sizes property escrows by category from supplied issues and holdback percentages. The underlying cost estimates (Phase II, PCA, cure costs) are the specialists' work, and the escrow that actually protects the buyer is a negotiation for the parties and counsel; the model applies the arithmetic and routes the report-backed issues, and sets no binding escrow.

## 9. Conformance bindings

Requirement `REQ-M195` is verified by 2 published case(s): `CONF.MODEL.RE.PROPERTY_ESCROW.001`, `CONF.MODEL.RE.PROPERTY_ESCROW.002`.

## 10. Version

Reference binding `MODEL.RE.PROPERTY_ESCROW.HOLDBACK.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M196 — Title and survey process checklist

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G30
**Deal contexts:** real estate closing

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Sequences the title-and-survey workstream — commitment and survey receipt, Schedule B-II exception count, policy and endorsement selection, the curative work plan with its open items and cost-to-cure, and the closing-protection letter — into a checklist with the counts that show where the work stands. It answers, in a real-estate closing, "what title and survey steps remain, how many exceptions and curative items are open, and what will cure cost?" It sequences the process from supplied facts.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M196.schema.json`](M196.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `survey_received` | boolean | MUST | Whether the survey is in hand. |
| `title_commitment_received` | boolean | MUST | Whether the title commitment is in hand. |
| `alta_endorsements_requested` | string[] | MAY | ALTA endorsements requested (counted). |
| `closing_protection_letter_required` | boolean | MAY | Whether a closing-protection letter is required (default true). |
| `curative_items` | object[] | MAY | Curative items; each carries `item` (string), `status` (string), and `cost_to_cure_cents` (integer cents). |
| `lender_policy_required` | boolean | MAY | Whether a lender's policy is required (default false). |
| `owner_policy_required` | boolean | MAY | Whether an owner's policy is required (default true). |
| `schedule_b_exceptions` | object[] | MAY | Schedule B-II exception rows (counted). |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `title_commitment_received` | boolean | The commitment-received flag, echoed. |
| `survey_received` | boolean | The survey-received flag, echoed. |
| `schedule_b_exception_count` | integer | Number of Schedule B-II exceptions. |
| `survey_review_required` | boolean | Whether survey review is required. |
| `owner_policy_required` | boolean | Whether an owner's policy is required. |
| `lender_policy_required` | boolean | Whether a lender's policy is required. |
| `alta_endorsements_requested_count` | integer | Number of ALTA endorsements requested. |
| `curative_item_count` | integer | Number of curative items. |
| `open_curative_item_count` | integer | Number of open curative items. |
| `curative_cost_to_cure_cents` | integer (cents) | Total cost to cure the curative items. |
| `closing_protection_letter_required` | boolean | Whether a closing-protection letter is required. |
| `title_pass_through_source_required` | boolean | Always true — the title work is a pass-through source. |
| `process_steps` | string[] | The ordered title/survey process steps. |
| `curative_rows` | object[] | Per-curative-item detail: `{ item, status, cost_to_cure_cents, open }`. |

## 4. Algorithm

Given `title_commitment_received` and `survey_received`, plus optional `schedule_b_exceptions`, `curative_items`, `alta_endorsements_requested`, and the policy/closing-protection flags:
1. If either required boolean is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.
2. It SHALL count Schedule B-II exceptions and requested ALTA endorsements.
3. For each curative item it SHALL take a status and cost-to-cure and mark it open unless closed/resolved/waived; it SHALL count items and open items and sum the cost-to-cure.
4. `survey_review_required` SHALL be true iff a survey was received; the owner-policy, lender-policy, and closing-protection-letter flags SHALL default per practice.
5. It SHALL return the ordered process steps and the full curative detail; `title_pass_through_source_required` SHALL always be true.

## 5. Constants & authorities

_No numeric constants — this model computes from supplied facts and cited rule text only (attested: `constants: []`)._


**Authorities**

| Authority | ID | Type |
|---|---|---|
| ALTA Forms | AUTH-0031 | practice-norm |
| State Title Statutes | AUTH-0228 | statute |

## 6. Worked example

*Title commitment and survey both in hand: three Schedule B-II exceptions, three ALTA endorsements requested, and two curative items — one open $300k mortgage payoff — with the owner policy and closing-protection letter required.*

**Inputs**

```json
{
  "title_commitment_received": true,
  "survey_received": true,
  "schedule_b_exceptions": [
    {
      "exception": "Utility easement"
    },
    {
      "exception": "Setback line"
    },
    {
      "exception": "CC&Rs"
    }
  ],
  "alta_endorsements_requested": [
    "zoning",
    "access",
    "survey"
  ],
  "curative_items": [
    {
      "item": "Old mortgage payoff",
      "status": "open",
      "cost_to_cure_cents": 30000000
    },
    {
      "item": "Mechanic lien release",
      "status": "resolved",
      "cost_to_cure_cents": 0
    }
  ]
}
```

**Outputs (executed against the reference implementation `MODEL.RE.TITLE_SURVEY.CHECKLIST.v1`)**

```json
{
  "title_commitment_received": true,
  "survey_received": true,
  "schedule_b_exception_count": 3,
  "survey_review_required": true,
  "owner_policy_required": true,
  "lender_policy_required": false,
  "alta_endorsements_requested_count": 3,
  "curative_item_count": 2,
  "open_curative_item_count": 1,
  "curative_cost_to_cure_cents": 30000000,
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
      "item": "Old mortgage payoff",
      "status": "open",
      "cost_to_cure_cents": 30000000,
      "open": true
    },
    {
      "item": "Mechanic lien release",
      "status": "resolved",
      "cost_to_cure_cents": 0,
      "open": false
    }
  ]
}
```

Precision: Cost-to-cure is exact integer cents; the rest are counts and booleans (see the Conventions chapter).

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["title_commitment_received","survey_received"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model sequences the title and survey process and counts the open items from supplied facts. Whether a Schedule B-II exception is acceptable, how to cure it, and the legal effect of the survey are determinations for title counsel and the title insurer; the model organizes the workstream and totals the cost-to-cure and renders no title conclusion.

## 9. Conformance bindings

Requirement `REQ-M196` is verified by 2 published case(s): `CONF.MODEL.RE.TITLE_SURVEY.001`, `CONF.MODEL.RE.TITLE_SURVEY.002`.

## 10. Version

Reference binding `MODEL.RE.TITLE_SURVEY.CHECKLIST.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M197 — Ground lease vs. fee simple mechanics

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G30
**Deal contexts:** ground lease · real estate financing

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Computes the financeability tail on a ground lease — the years remaining after loan maturity — and tests it against the lender's minimum, then combines it with a lender recognition agreement to flag leasehold mortgageability. It answers, for a leasehold acquisition or financing, "does the ground lease run long enough past the loan, and are the lender protections in place to make the leasehold mortgageable?" It computes the tail and the flags; the financeability judgment routes to counsel.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M197.schema.json`](M197.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `annual_ground_rent_cents` | integer (cents) | MUST | Annual ground rent. |
| `ground_lease_expiry_date` | string (ISO date) | MUST | When the ground lease expires. |
| `loan_maturity_date` | string (ISO date) | MUST | When the leasehold loan matures. |
| `lender_recognition_agreement` | boolean | MAY | Whether a lender recognition (SNDA-style) agreement is in place (default false). |
| `rent_reset_type` | string | MAY | How the ground rent resets (e.g., CPI, fair-market, fixed); echoed. |
| `required_tail_years` | number | MAY | The lender's minimum tail beyond loan maturity in years; defaults to the market minimum. |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `ground_lease_expiry_date` | string (ISO date) | The lease expiry, echoed. |
| `loan_maturity_date` | string (ISO date) | The loan maturity, echoed. |
| `annual_ground_rent_cents` | integer (cents) | The annual ground rent, echoed. |
| `rent_reset_type` | string | The rent-reset type, echoed. |
| `tail_years_after_loan_maturity` | number | Years the lease runs past loan maturity. |
| `required_tail_years` | number | The required minimum tail applied. |
| `lender_tail_requirement_satisfied` | boolean | Whether the tail meets the requirement. |
| `lender_recognition_agreement` | boolean | Whether a lender recognition agreement is in place. |
| `leasehold_mortgageability_flag` | boolean | Whether the leasehold is mortgageable on these facts. |
| `counsel_review_required` | boolean | Always true — the financeability judgment routes to counsel. |

## 4. Algorithm

Given `ground_lease_expiry_date`, `loan_maturity_date`, and `annual_ground_rent_cents`, plus optional `required_tail_years` (default: the minimum-tail constant), `rent_reset_type`, `lender_recognition_agreement` (default false):
1. If any required input is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.
2. `tail_years_after_loan_maturity` SHALL be the years between loan maturity and lease expiry, at the global 4-decimal precision.
3. `required_tail_years` SHALL be the supplied value, else the minimum financeable tail (constants: minimum financeable ground-lease tail).
4. `lender_tail_requirement_satisfied` SHALL be true iff the tail meets or exceeds the required tail.
5. `leasehold_mortgageability_flag` SHALL be true iff the tail requirement is satisfied AND a lender recognition agreement is in place; `counsel_review_required` SHALL always be true.

## 5. Constants & authorities

| Constant | Value | Strength | Authority | Pin-cite | Effective | Next check |
|---|---|---|---|---|---|---|
| Minimum financeable ground-lease tail | 25 years | SHOULD (cited median) | Ground-lease lender financeability practice — minimum tail beyond loan maturity (2024) | institutional minimum tail beyond loan maturity (20–25 years) | 2024 lender practice | on lender-practice review |


**Authorities**

| Authority | ID | Type |
|---|---|---|
| Lender Practice | AUTH-0157 | practice-norm |

## 6. Worked example

*A ground lease running to 2075 against a loan maturing in 2036 leaves roughly a 39-year tail — well beyond the 25-year minimum — and with a lender recognition agreement in place the leasehold reads as mortgageable, subject to counsel review.*

**Inputs**

```json
{
  "ground_lease_expiry_date": "2075-01-01",
  "loan_maturity_date": "2036-01-01",
  "annual_ground_rent_cents": 50000000,
  "required_tail_years": 25,
  "rent_reset_type": "cpi",
  "lender_recognition_agreement": true
}
```

**Outputs (executed against the reference implementation `MODEL.RE.GROUND_LEASE.MECHANICS.v1`)**

```json
{
  "ground_lease_expiry_date": "2075-01-01",
  "loan_maturity_date": "2036-01-01",
  "annual_ground_rent_cents": 50000000,
  "rent_reset_type": "cpi",
  "tail_years_after_loan_maturity": 39.0007,
  "required_tail_years": 25,
  "lender_tail_requirement_satisfied": true,
  "lender_recognition_agreement": true,
  "leasehold_mortgageability_flag": true,
  "counsel_review_required": true
}
```

Precision: The tail is in years at the global 4-decimal precision (see the Conventions chapter); rent is exact integer cents.

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["ground_lease_expiry_date","loan_maturity_date","annual_ground_rent_cents"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model computes the ground-lease financeability tail and the mortgageability flag from supplied dates and facts. Whether the lease is in fact financeable — the estoppel, cure, and recognition provisions, and the leasehold-mortgagee protections — is a legal determination for counsel and the leasehold lender; the model computes the tail and always routes the judgment, rendering no financeability conclusion.

## 9. Conformance bindings

Requirement `REQ-M197` is verified by 2 published case(s): `CONF.MODEL.RE.GROUND_LEASE.001`, `CONF.MODEL.RE.GROUND_LEASE.002`.

## 10. Version

Reference binding `MODEL.RE.GROUND_LEASE.MECHANICS.v1` · entered the specification at internal lineage stage `v1_1` · spec v1.0.0.


# M198 — PCA reserve modeling

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G30
**Deal contexts:** property condition assessment

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Rolls a property-condition-assessment item list into the reserve schedule a lender underwrites — the immediate-repair escrow (scaled by the lender reserve percentage) and the year-1–3, year-4–5, and year-6–12 replacement reserves — plus the total per item. It answers, from a PCA report, "what immediate-repair escrow and multi-year replacement reserves does this property need?" It rolls up the reserves from supplied PCA figures; the condition findings are the engineer's.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M198.schema.json`](M198.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `pca_items` | object[] | MUST | PCA items; each carries `item` (string) and integer-cents `immediate_repair_cents`, `year_1_3_cents` (or `near_term_cents`), `year_4_5_cents`, and `year_6_12_cents`, plus a `source` string. |
| `lender_reserve_pct` | number | MAY | Fraction of immediate-repair cost the lender escrows (default 1 = 100%). |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `pca_item_count` | integer | Number of PCA items. |
| `immediate_repair_escrow_cents` | integer (cents) | Immediate-repair escrow at the lender reserve percentage. |
| `year_1_3_reserve_cents` | integer (cents) | Year-1–3 replacement reserve. |
| `year_4_5_reserve_cents` | integer (cents) | Year-4–5 replacement reserve. |
| `year_6_12_reserve_cents` | integer (cents) | Year-6–12 replacement reserve. |
| `total_replacement_reserve_cents` | integer (cents) | Total replacement reserve across all items and horizons. |
| `pca_pass_through_source_required` | boolean | Always true — the PCA report is a pass-through source. |
| `reserve_rows` | object[] | Per-item detail: `{ item, immediate_repair_cents, year_1_3_cents, year_4_5_cents, year_6_12_cents, total_reserve_cents, source }`. |

## 4. Algorithm

Given `pca_items` (a list of PCA item objects) and optional `lender_reserve_pct` (default 1):
1. If `pca_items` is empty, the implementation SHALL return `status: "needs_inputs"` naming `pca_items`.
2. For each item it SHALL take the immediate-repair, year-1–3, year-4–5, and year-6–12 amounts, and set `total_reserve_cents` to their sum.
3. `immediate_repair_escrow_cents` SHALL be `round(total immediate repair × lender_reserve_pct)`.
4. The `year_1_3_reserve_cents`, `year_4_5_reserve_cents`, and `year_6_12_reserve_cents` SHALL be the sums of the respective per-item amounts; `total_replacement_reserve_cents` SHALL be the sum of all item totals.
5. `pca_pass_through_source_required` SHALL always be true; it SHALL return the full per-item detail.

## 5. Constants & authorities

_No numeric constants — this model computes from supplied facts and cited rule text only (attested: `constants: []`)._


**Authorities**

| Authority | ID | Type |
|---|---|---|
| ASTM E2018 | AUTH-0037 | practice-or-guidance |
| Lender Practice | AUTH-0157 | practice-norm |

## 6. Worked example

*A PCA with two items — a $150k immediate roof repair and a $400k year-4–5 HVAC replacement, plus $80k of near-term parking work — yields a $150k immediate-repair escrow at full lender reserve and a $630k total replacement reserve.*

**Inputs**

```json
{
  "pca_items": [
    {
      "item": "Roof repair",
      "immediate_repair_cents": 15000000,
      "year_1_3_cents": 8000000
    },
    {
      "item": "HVAC replacement",
      "year_4_5_cents": 40000000
    }
  ],
  "lender_reserve_pct": 1
}
```

**Outputs (executed against the reference implementation `MODEL.RE.PCA.RESERVES.v1`)**

```json
{
  "pca_item_count": 2,
  "immediate_repair_escrow_cents": 15000000,
  "year_1_3_reserve_cents": 8000000,
  "year_4_5_reserve_cents": 40000000,
  "year_6_12_reserve_cents": 0,
  "total_replacement_reserve_cents": 63000000,
  "pca_pass_through_source_required": true,
  "reserve_rows": [
    {
      "item": "Roof repair",
      "immediate_repair_cents": 15000000,
      "year_1_3_cents": 8000000,
      "year_4_5_cents": 0,
      "year_6_12_cents": 0,
      "total_reserve_cents": 23000000,
      "source": "pass_through_pca_report"
    },
    {
      "item": "HVAC replacement",
      "immediate_repair_cents": 0,
      "year_1_3_cents": 0,
      "year_4_5_cents": 40000000,
      "year_6_12_cents": 0,
      "total_reserve_cents": 40000000,
      "source": "pass_through_pca_report"
    }
  ]
}
```

Precision: All reserves are exact integer cents; the lender reserve percentage rounds per the global rule (half-even to 4 decimals — see the Conventions chapter).

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["pca_items"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model rolls PCA figures into an immediate-repair escrow and multi-year reserves from supplied amounts. The condition findings, the useful-life estimates, and the repair scope are the engineer's determinations, and the reserve the lender actually requires is its underwriting call; the model totals the reserves and renders no engineering or underwriting conclusion.

## 9. Conformance bindings

Requirement `REQ-M198` is verified by 2 published case(s): `CONF.MODEL.RE.PCA.001`, `CONF.MODEL.RE.PCA.002`.

## 10. Version

Reference binding `MODEL.RE.PCA.RESERVES.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M199 — FIRPTA withholding v1.1

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G15, G30
**Deal contexts:** real estate M&A · foreign seller

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Determines FIRPTA withholding on a foreign seller's disposition with the v1.1 refinements — the 15% default, the reduced 10% and zero residence paths, the dated Form 8288 deadline, the reduced-withholding-certificate path, and a §1031 timing-gap flag when an exchange collides with the withholding. It answers, at a closing with a foreign seller, "how much must the buyer withhold, by what date, and does a certificate or a 1031 exchange change the timing?" It computes the withholding and the timing flags; the certificate and exchange determinations are the tax advisor's.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M199.schema.json`](M199.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `amount_realized_cents` | integer (cents) | MUST | The amount realized (the withholding base). |
| `seller_foreign_person` | boolean | MUST | Whether the seller is a foreign person. |
| `buyer_will_use_as_residence` | boolean | MAY | Whether the buyer will use the property as a residence (default false). |
| `closing_date` | string (ISO date) | MAY | The closing date; dates the Form 8288 deadline. |
| `form_8288_b_reduced_withholding_requested` | boolean | MAY | Whether a Form 8288-B reduced-withholding certificate is requested (default false). |
| `section_1031_exchange` | boolean | MAY | Whether the disposition is part of a §1031 exchange (default false); drives the timing-gap flag. |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `amount_realized_cents` | integer (cents) | The amount realized, echoed. |
| `seller_foreign_person` | boolean | The foreign-person flag, echoed. |
| `buyer_will_use_as_residence` | boolean | The residence-use flag, echoed. |
| `withholding_rate` | number | The FIRPTA withholding rate applied (0, 0.10, or 0.15). |
| `withholding_amount_cents` | integer (cents) | The withholding the buyer must remit. |
| `path` | enum(firpta_path) | The withholding path taken. One of `not_foreign_seller`, `personal_residence_300k_or_less_exemption`, `personal_residence_300k_to_1m_reduced_rate`, `default_firpta_withholding`. |
| `forms_8288_due_date` | string (ISO date) | null | The Form 8288 filing/remittance deadline, or null. |
| `form_8288_b_reduced_withholding_requested` | boolean | The reduced-certificate-requested flag, echoed. |
| `reduced_certificate_processing_days_estimate` | integer | null | IRS Form 8288-B processing estimate in days (a planning estimate), or null. |
| `section_1031_timing_gap_flag` | boolean | Whether a §1031 exchange collides with FIRPTA withholding timing. |

## 4. Algorithm

Given `amount_realized_cents` and `seller_foreign_person`, plus optional `buyer_will_use_as_residence` (default false), `closing_date`, `form_8288_b_reduced_withholding_requested` (default false), `section_1031_exchange` (default false):
1. If either required input is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.
2. It SHALL resolve `withholding_rate` and `path` exactly as in M169: zero for a domestic seller; the residence exemption at or below the exemption ceiling; the reduced residence rate at or below the reduced-rate ceiling; else the default rate (constants: FIRPTA default withholding rate, FIRPTA reduced residence rate, FIRPTA residence ceilings).
3. `withholding_amount_cents` SHALL be `round(amount_realized_cents × withholding_rate)`.
4. `forms_8288_due_date` SHALL be the closing date advanced by the Form 8288 deadline when a foreign seller is withheld upon and a closing date is supplied, else null (constants: FIRPTA Form 8288 filing deadline).
5. `reduced_certificate_processing_days_estimate` SHALL be the IRS Form 8288-B processing estimate when a reduced-withholding certificate is requested, else null (a planning estimate, not a statutory period); `section_1031_timing_gap_flag` SHALL be true iff a §1031 exchange coincides with withholding on a foreign seller.

## 5. Constants & authorities

| Constant | Value | Strength | Authority | Pin-cite | Effective | Next check |
|---|---|---|---|---|---|---|
| FIRPTA default withholding rate | 15% (0.15) | MUST (binding) | IRC § 1445(a); IRC § 897 | § 1445(a) | current (IRC as amended) | on IRC amendment |
| FIRPTA reduced residence rate | 10% (0.10) | MUST (binding) | IRC § 1445 | § 1445(c)(4) reduced-rate residence path | current (IRC as amended) | on IRC amendment |
| FIRPTA personal-residence exemption ceiling | $300,000 (30,000,000 cents) | MUST (binding) | IRC § 1445(b)(5) | § 1445(b)(5) | current (IRC as amended) | on IRC amendment |
| FIRPTA reduced-rate residence ceiling | $1,000,000 (100,000,000 cents) | MUST (binding) | IRC § 1445; Treas. Reg. § 1.1445-1 | reduced-rate residence ceiling | current (Treas. Reg. as amended) | on Treasury amendment |
| FIRPTA Form 8288 filing deadline | 20 days | MUST (binding) | IRC § 1445; Treas. Reg. § 1.1445-1 | remit and file by the 20th day after transfer | current (Treas. Reg. as amended) | on Treasury amendment |


**Authorities**

| Authority | ID | Type |
|---|---|---|
| IRC 897 | AUTH-0144 | statute |
| IRC 1445 | AUTH-0112 | statute |
| IRS Form 8288 | AUTH-0146 | form |
| IRS Form 8288-A | AUTH-0147 | form |
| IRS Form 8288-B | AUTH-0148 | form |

## 6. Worked example

*A foreign seller closes a $2.5M non-residence disposition on May 1: FIRPTA requires 15% withholding — $375,000 — with Form 8288 due May 21, no reduced-withholding certificate requested and no §1031 timing gap.*

**Inputs**

```json
{
  "amount_realized_cents": 250000000,
  "seller_foreign_person": true,
  "buyer_will_use_as_residence": false,
  "closing_date": "2026-05-01",
  "form_8288_b_reduced_withholding_requested": false,
  "section_1031_exchange": false
}
```

**Outputs (executed against the reference implementation `MODEL.RE.FIRPTA.WITHHOLDING.V11.v1`)**

```json
{
  "amount_realized_cents": 250000000,
  "seller_foreign_person": true,
  "buyer_will_use_as_residence": false,
  "withholding_rate": 0.15,
  "withholding_amount_cents": 37500000,
  "path": "default_firpta_withholding",
  "forms_8288_due_date": "2026-05-21",
  "form_8288_b_reduced_withholding_requested": false,
  "reduced_certificate_processing_days_estimate": null,
  "section_1031_timing_gap_flag": false
}
```

Precision: The withholding amount is exact integer cents; the deadline is an ISO-8601 date (see the Conventions chapter).

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["amount_realized_cents","seller_foreign_person"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model computes FIRPTA withholding, the dated deadline, and the certificate/1031 timing flags from supplied facts. Whether the seller is a foreign person, whether the residence exemption or a reduced-withholding certificate applies, and how a §1031 exchange interacts with withholding are determinations for the tax advisor; the model computes the buyer's obligation and the timing and renders no opinion on the seller's tax.

## 9. Conformance bindings

Requirement `REQ-M199` is verified by 2 published case(s): `CONF.MODEL.RE.FIRPTA11.001`, `CONF.MODEL.RE.FIRPTA11.002`.

## 10. Version

Reference binding `MODEL.RE.FIRPTA.WITHHOLDING.V11.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M200 — Transaction tax master engine

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G2, G19
**Deal contexts:** asset deal · stock deal · merger · rollover

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Computes the integrated transaction-tax picture from the deal form and consideration mix — the taxable consideration, the seller's gain and tax at the combined rate, the seller's after-tax proceeds including any rollover, the buyer's asset basis, and any gross-up gap — and fires the applicable sub-models (allocation, elections, imputed interest, and others) that the facts trigger. It answers, for a deal team pricing the tax cost, "what does the seller net after tax, what basis does the buyer get, and which tax sub-analyses does this deal require?" It orchestrates the arithmetic and the routing; the entity classification, elections, and state treatment are tax counsel's.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M200.schema.json`](M200.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `deal_form` | string | MUST | The transaction form (e.g., asset_sale, stock_sale, merger, 338h10); drives basis and sub-model routing. |
| `purchase_price_cents` | integer (cents) | MUST | Total purchase price. |
| `seller_entity_type` | string | MUST | The seller's entity type (e.g., S-corp, C-corp, partnership, individual). |
| `consideration_mix` | object | MAY | The consideration split: integer-cents `cash_cents`, `seller_note_cents`, `stock_cents`, `earnout_cents`, `rollover_cents`. |
| `federal_tax_rate` | number | MAY | Seller federal tax rate as a fraction (default 0). |
| `seller_structure_tax_delta_cents` | integer (cents) | MAY | Incremental seller tax from the buyer's preferred structure (default 0); drives the gross-up gap. |
| `seller_tax_basis_cents` | integer (cents) | MAY | Seller's tax basis in what is sold (default 0). |
| `state_tax_rate` | number | MAY | Seller state tax rate as a fraction (default 0). |
| `tax_facts` | object | MAY | Flags that fire sub-models: `loss_carryforwards`, `qsbs` (booleans). |
| `transaction_costs` | object[] | MAY | Transaction-cost rows; a non-empty list fires the transaction-cost sub-model. |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `seller_entity_type` | string | The seller entity type, echoed. |
| `deal_form` | string | The deal form, echoed. |
| `total_consideration_cents` | integer (cents) | Total consideration (the purchase price). |
| `taxable_consideration_cents` | integer (cents) | Taxable (non-rollover) consideration. |
| `deferred_or_rollover_consideration_cents` | integer (cents) | Rollover/deferred consideration. |
| `buyer_asset_basis_cents` | integer (cents) | null | Buyer asset basis for asset/deemed-asset forms, else null. |
| `seller_tax_basis_cents` | integer (cents) | Seller tax basis, echoed. |
| `seller_taxable_gain_cents` | integer (cents) | Seller taxable gain. |
| `combined_seller_tax_rate` | number | Combined federal-plus-state seller rate. |
| `seller_tax_cents` | integer (cents) | Seller tax on the gain. |
| `seller_after_tax_proceeds_cents` | integer (cents) | Seller proceeds after tax, including rollover. |
| `gross_up_gap_cents` | integer (cents) | null | Gross-up needed to offset the structure tax delta, or null. |
| `fired_sub_models` | string[] | Model IDs of the sub-analyses the facts trigger. |
| `professional_review_flags` | string[] | Standing tax-counsel review note. |

## 4. Algorithm

Given `seller_entity_type`, `deal_form`, and `purchase_price_cents`, plus optional `seller_tax_basis_cents` (default 0), `consideration_mix`, `federal_tax_rate` (default 0), `state_tax_rate` (default 0), `seller_structure_tax_delta_cents` (default 0), `tax_facts`, `transaction_costs`:
1. If any required input is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.
2. `taxable_consideration_cents` SHALL be `max(0, cash + seller_note + stock + earnout)` from the consideration mix (cash defaulting to the full price); `deferred_or_rollover_consideration_cents` SHALL be the rollover amount.
3. `combined_seller_tax_rate` SHALL be `clamp(federal_tax_rate + state_tax_rate, 0, 1)`; `seller_taxable_gain_cents` SHALL be `max(0, taxable_consideration − seller_tax_basis)`; `seller_tax_cents` SHALL be `round(gain × combined_rate)`.
4. `seller_after_tax_proceeds_cents` SHALL be `taxable_consideration − seller_tax + rollover`; `buyer_asset_basis_cents` SHALL be the purchase price for asset/338/336/deemed forms, else null; `gross_up_gap_cents` SHALL be `round(seller_structure_tax_delta ÷ (1 − combined_rate))` when the rate is below one, else null.
5. `fired_sub_models` SHALL list the sub-models the facts trigger (e.g., §1060 allocation, the §338/§336 gross-up, reorganization qualification, contribution, imputed interest, NOL limitation, QSBS, transaction costs) by their model IDs.

## 5. Constants & authorities

_No numeric constants — this model computes from supplied facts and cited rule text only (attested: `constants: []`)._


**Authorities**

| Authority | ID | Type |
|---|---|---|
| IRC 1001 | AUTH-0103 | statute |
| IRC 338 | AUTH-0121 | statute |
| IRC 336 | AUTH-0119 | statute |
| IRC 351 | AUTH-0123 | statute |
| IRC 368 | AUTH-0126 | statute |
| IRC 721 | AUTH-0136 | statute |
| IRC 1060 | AUTH-0106 | statute |

## 6. Worked example

*An asset sale of an S-corp for $10M ($8M cash, $1M seller note, $1M earnout) over a $3M basis: the $7M gain at a combined 26% rate is $1.82M of tax, leaving $8.18M after-tax; the buyer takes a $10M asset basis, and the §1060 allocation and imputed-interest sub-models fire.*

**Inputs**

```json
{
  "seller_entity_type": "S-corp",
  "deal_form": "asset_sale",
  "purchase_price_cents": 1000000000,
  "seller_tax_basis_cents": 300000000,
  "consideration_mix": {
    "cash_cents": 800000000,
    "seller_note_cents": 100000000,
    "earnout_cents": 100000000
  },
  "federal_tax_rate": 0.21,
  "state_tax_rate": 0.05
}
```

**Outputs (executed against the reference implementation `MODEL.TAX.TRANSACTION.MASTER.v1`)**

```json
{
  "seller_entity_type": "S-corp",
  "deal_form": "asset_sale",
  "total_consideration_cents": 1000000000,
  "taxable_consideration_cents": 1000000000,
  "deferred_or_rollover_consideration_cents": 0,
  "buyer_asset_basis_cents": 1000000000,
  "seller_tax_basis_cents": 300000000,
  "seller_taxable_gain_cents": 700000000,
  "combined_seller_tax_rate": 0.26,
  "seller_tax_cents": 182000000,
  "seller_after_tax_proceeds_cents": 818000000,
  "gross_up_gap_cents": 0,
  "fired_sub_models": [
    "M139",
    "M204"
  ],
  "professional_review_flags": [
    "Tax counsel confirms entity classification, elections, state treatment, and facts."
  ]
}
```

Precision: The combined rate rounds per the global rule (half-even to 4 decimals — see the Conventions chapter); all monetary outputs are exact integer cents.

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["seller_entity_type","deal_form","purchase_price_cents"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model computes the integrated transaction-tax picture and routes the sub-analyses from supplied facts and rates. The entity classification, the availability and mechanics of every election, the state treatment, and the binding tax positions are determinations for tax counsel; the model orchestrates the arithmetic and the routing and renders no tax opinion.

## 9. Conformance bindings

Requirement `REQ-M200` is verified by 2 published case(s): `CONF.MODEL.TAX.MASTER.001`, `CONF.MODEL.TAX.MASTER.002`.

## 10. Version

Reference binding `MODEL.TAX.TRANSACTION.MASTER.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M201 — 338(h)(10) and 336(e) gross-up math

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G2
**Deal contexts:** S-corp sale · deemed asset sale

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Computes the gross-up a buyer must pay to make a seller whole for the extra tax of a deemed-asset-sale election, and nets it against the buyer's step-up benefit, while screening the §336(e) 80%/12-month disposition test. It answers, in a §338(h)(10) or §336(e) deal, "how much gross-up does the seller need, and is the step-up still worth it to the buyer after paying it?" It computes the trade-off; target/shareholder eligibility and the election mechanics are tax counsel's.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M201.schema.json`](M201.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `seller_marginal_tax_rate` | number | MUST | The seller's marginal tax rate as a fraction. |
| `seller_tax_delta_cents` | integer (cents) | MUST | The seller's incremental tax from the deemed-asset-sale treatment. |
| `buyer_step_up_pv_benefit_cents` | integer (cents) | MAY | Present-value benefit of the buyer's step-up (default 0). |
| `disposition_months` | number | MAY | Length of the disposition window in months; drives the §336(e) test. |
| `disposition_pct` | number | MAY | Fraction of stock disposed; drives the §336(e) test. |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `seller_tax_delta_cents` | integer (cents) | The seller tax delta, echoed. |
| `seller_marginal_tax_rate` | number | The seller marginal rate applied. |
| `breakeven_gross_up_cents` | integer (cents) | null | The grossed-up amount that makes the seller whole, or null. |
| `buyer_step_up_pv_benefit_cents` | integer (cents) | The buyer step-up benefit, echoed. |
| `buyer_net_benefit_after_gross_up_cents` | integer (cents) | null | Buyer benefit net of the gross-up, or null. |
| `section_336e_80pct_12mo_test_passed` | boolean | null | Whether the §336(e) disposition test passes, or null. |
| `election_review_flags` | string[] | Standing tax-counsel review note on eligibility and mechanics. |

## 4. Algorithm

Given `seller_tax_delta_cents` and `seller_marginal_tax_rate`, plus optional `buyer_step_up_pv_benefit_cents` (default 0), `disposition_pct`, `disposition_months`:
1. If either required input is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.
2. `breakeven_gross_up_cents` SHALL be `round(seller_tax_delta_cents ÷ (1 − seller_marginal_tax_rate))` when the rate is below one, else null (the gross-up is itself taxable, so it is grossed up).
3. `buyer_net_benefit_after_gross_up_cents` SHALL be `buyer_step_up_pv_benefit_cents − breakeven_gross_up_cents`, or null.
4. `section_336e_80pct_12mo_test_passed` SHALL be true iff the disposition percentage and window clear the §336(e) qualified-stock-disposition thresholds (constants: §336(e) qualified-stock-disposition test), or null when not supplied.
5. The seller rate SHALL echo at the global 4-decimal precision.

## 5. Constants & authorities

| Constant | Value | Strength | Authority | Pin-cite | Effective | Next check |
|---|---|---|---|---|---|---|
| §336(e) qualified-stock-disposition test | 80% of stock disposed within a 12-month window | MUST (binding) | IRC § 336(e); Treas. Reg. § 1.336-2 | § 1.336-1(b) (80% vote-and-value within 12 months) | current (Treas. Reg. as amended) | on Treasury amendment |


**Authorities**

| Authority | ID | Type |
|---|---|---|
| IRC 338(h)(10) | AUTH-0122 | statute |
| IRC 336(e) | AUTH-0120 | statute |
| Treas. Reg. 1.336-2 | AUTH-0241 | regulation |

## 6. Worked example

*A §338(h)(10) gross-up: a $500k seller tax delta at a 30% marginal rate needs a $714k gross-up to make the seller whole, leaving the buyer about $86k of net step-up benefit after paying it; the 85%/10-month disposition clears the §336(e) 80%/12-month test.*

**Inputs**

```json
{
  "seller_tax_delta_cents": 50000000,
  "seller_marginal_tax_rate": 0.3,
  "buyer_step_up_pv_benefit_cents": 80000000,
  "disposition_pct": 0.85,
  "disposition_months": 10
}
```

**Outputs (executed against the reference implementation `MODEL.TAX.GROSSUP.338_336.v1`)**

```json
{
  "seller_tax_delta_cents": 50000000,
  "seller_marginal_tax_rate": 0.3,
  "breakeven_gross_up_cents": 71428571,
  "buyer_step_up_pv_benefit_cents": 80000000,
  "buyer_net_benefit_after_gross_up_cents": 8571429,
  "section_336e_80pct_12mo_test_passed": true,
  "election_review_flags": [
    "Confirm target/shareholder eligibility and election mechanics with tax counsel."
  ]
}
```

Precision: The gross-up and net benefit are exact integer cents; the seller rate rounds per the global rule (half-even to 4 decimals — see the Conventions chapter).

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["seller_tax_delta_cents","seller_marginal_tax_rate"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model computes the gross-up and the buyer's net benefit and screens the §336(e) test from supplied figures. Whether the target and shareholders are eligible, the election mechanics and filings, and the binding tax positions are determinations for tax counsel; the model computes the trade-off and renders no election opinion.

## 9. Conformance bindings

Requirement `REQ-M201` is verified by 2 published case(s): `CONF.MODEL.TAX.GROSSUP.001`, `CONF.MODEL.TAX.GROSSUP.002`.

## 10. Version

Reference binding `MODEL.TAX.GROSSUP.338_336.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M202 — 1374 built-in gains tax

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G2
**Deal contexts:** S-corp former C-corp

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Computes the §1374 built-in-gains tax on an S-corporation that converted from C-corporation status — the net unrealized built-in gain, whether the sale falls within the five-year recognition period, the recognized tax base (capped at the NUBIG, the recognized gain, and the taxable-income limitation), and the corporate-level tax. It answers, for a former C-corp selling appreciated assets, "does the built-in-gains tax bite, and how much?" It computes the tax; the recognition-period facts and state nonconformity are tax counsel's.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M202.schema.json`](M202.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `basis_at_conversion_cents` | integer (cents) | MUST | Tax basis of assets at conversion. |
| `conversion_date` | string (ISO date) | MUST | The S-election conversion date. |
| `fmv_at_conversion_cents` | integer (cents) | MUST | Fair market value of assets at S-election conversion. |
| `recognized_gain_cents` | integer (cents) | MUST | Gain recognized on the sale. |
| `sale_date` | string (ISO date) | MUST | The asset-sale date. |
| `corporate_tax_rate` | number | MAY | Corporate tax rate as a fraction; defaults to the federal corporate rate. |
| `taxable_income_cents` | integer (cents) | MAY | Taxable income for the §1374 limitation; defaults to the recognized gain. |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `net_unrealized_built_in_gain_cents` | integer (cents) | NUBIG at conversion (FMV over basis). |
| `years_since_conversion` | number | Years between conversion and sale. |
| `recognition_period_years` | integer | The §1374 recognition period. |
| `within_recognition_period` | boolean | Whether the sale is within the recognition period. |
| `recognized_big_tax_base_cents` | integer (cents) | The built-in-gains tax base after the caps. |
| `corporate_tax_rate` | number | The corporate rate applied. |
| `section_1374_tax_cents` | integer (cents) | The §1374 built-in-gains tax. |
| `state_nonconformity_review_required` | boolean | Whether state nonconformity to §1374 needs review. |

## 4. Algorithm

Given `fmv_at_conversion_cents`, `basis_at_conversion_cents`, `conversion_date`, `sale_date`, and `recognized_gain_cents`, plus optional `taxable_income_cents`, `corporate_tax_rate` (default: the federal corporate rate):
1. If any required input is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.
2. `net_unrealized_built_in_gain_cents` SHALL be `max(0, fmv_at_conversion_cents − basis_at_conversion_cents)`; `years_since_conversion` SHALL be the years between conversion and sale.
3. `within_recognition_period` SHALL be true iff `years_since_conversion` is below the recognition period (constants: §1374 recognition period).
4. `recognized_big_tax_base_cents` SHALL be `min(NUBIG, recognized_gain, taxable-income limitation)` when within the period, else 0 (the taxable-income limitation defaults to the recognized gain).
5. `section_1374_tax_cents` SHALL be `round(recognized_big_tax_base × corporate_tax_rate)` (constants: federal corporate tax rate).

## 5. Constants & authorities

| Constant | Value | Strength | Authority | Pin-cite | Effective | Next check |
|---|---|---|---|---|---|---|
| §1374 recognition period | 5 years | MUST (binding) | IRC § 1374(d)(7); PATH Act 2015 | § 1374(d)(7) (5-year recognition period, made permanent by the PATH Act) | current (IRC as amended) | on IRC amendment |
| Federal corporate tax rate | 21% (0.21) | MUST (binding) | IRC § 11(b) | § 11(b) | current (IRC as amended) | on IRC amendment |


**Authorities**

| Authority | ID | Type |
|---|---|---|
| IRC 1374 | AUTH-0111 | statute |
| PATH Act 2015 | AUTH-0196 | statute |

## 6. Worked example

*An S-corp that converted from C-corp status on Jan 1, 2023 sells assets in June 2026, inside the five-year recognition period: with $3M of net unrealized built-in gain and $4M of recognized gain, the §1374 tax base is $3M and the built-in-gains tax at 21% is $630,000.*

**Inputs**

```json
{
  "fmv_at_conversion_cents": 800000000,
  "basis_at_conversion_cents": 500000000,
  "conversion_date": "2023-01-01",
  "sale_date": "2026-06-01",
  "recognized_gain_cents": 400000000
}
```

**Outputs (executed against the reference implementation `MODEL.TAX.BIG.1374.v1`)**

```json
{
  "net_unrealized_built_in_gain_cents": 300000000,
  "years_since_conversion": 3.4141,
  "recognition_period_years": 5,
  "within_recognition_period": true,
  "recognized_big_tax_base_cents": 300000000,
  "corporate_tax_rate": 0.21,
  "section_1374_tax_cents": 63000000,
  "state_nonconformity_review_required": false
}
```

Precision: Years and the corporate rate round per the global rule (half-even to 4 decimals — see the Conventions chapter); the tax and gain are exact integer cents.

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["fmv_at_conversion_cents","basis_at_conversion_cents","conversion_date","sale_date","recognized_gain_cents"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model computes the §1374 built-in-gains tax from supplied conversion and sale figures. Whether the recognition period is correctly measured, the asset-by-asset NUBIG determination, the taxable-income limitation and its carryover, and state nonconformity are determinations for tax counsel; the model computes the tax and renders no §1374 opinion.

## 9. Conformance bindings

Requirement `REQ-M202` is verified by 2 published case(s): `CONF.MODEL.TAX.BIG1374.001`, `CONF.MODEL.TAX.BIG1374.002`.

## 10. Version

Reference binding `MODEL.TAX.BIG.1374.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M203 — Transaction cost capitalization

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G2
**Deal contexts:** transaction tax

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Classifies each transaction cost for tax — deductible now, capitalized, or §195 amortizable — using the bright-line date, the inherently-facilitative rule, and the Rev. Proc. 2011-29 70/30 success-based-fee safe harbor, and totals each bucket. It answers, for a deal's tax accounting, "how does each cost split between deduction, capitalization, and amortization, and where is the documentation risk?" It classifies from supplied cost facts; the binding characterization and the documentation are tax counsel's.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M203.schema.json`](M203.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `bright_line_date` | string (ISO date) | MUST | The bright-line date (the earlier of the LOI and board approval); costs on or after it are facilitative. |
| `transaction_costs` | object[] | MUST | Transaction costs; each carries `label` (string), `amount_cents` (integer cents), `incurred_date` (ISO date), `success_based` (boolean), and `inherently_facilitative` (boolean). |
| `pe_owned_target` | boolean | MAY | Whether the target is PE-owned (default false); drives the success-fee documentation-risk flag. |
| `rev_proc_2011_29_safe_harbor_elected` | boolean | MAY | Whether the 70/30 success-based-fee safe harbor is elected (default true). |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `cost_count` | integer | Number of costs classified. |
| `deductible_cents` | integer (cents) | Total currently deductible. |
| `capitalized_cents` | integer (cents) | Total capitalized. |
| `amortizable_195_cents` | integer (cents) | Total §195-amortizable. |
| `pe_owned_target_success_fee_risk_flag` | boolean | Whether a PE-owned-target success-fee documentation risk is flagged. |
| `rows` | object[] | Per-cost detail: `{ label, amount_cents, incurred_date, classification (a transaction_cost_classification value), deductible_cents, capitalized_cents, amortizable_195_cents }`. |

## 4. Algorithm

Given `transaction_costs` (a list of cost objects) and `bright_line_date`, plus optional `rev_proc_2011_29_safe_harbor_elected` (default true), `pe_owned_target` (default false):
1. If `transaction_costs` is empty or the bright-line date is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.
2. For each cost: a success-based fee with the safe harbor elected splits under the Rev. Proc. 2011-29 70/30 safe harbor (constants: Rev. Proc. 2011-29 success-based-fee safe harbor) — the deductible share and the capitalized remainder; an inherently facilitative cost, or one incurred on or after the bright-line date, is fully capitalized; otherwise the cost is pre-bright-line §195 investigatory and fully amortizable.
3. It SHALL total the deductible, capitalized, and §195-amortizable amounts across all costs.
4. `pe_owned_target_success_fee_risk_flag` SHALL be true iff the target is PE-owned and any cost took the success-based safe harbor (a documentation-risk flag).
5. It SHALL return the full per-cost classification detail.

## 5. Constants & authorities

| Constant | Value | Strength | Authority | Pin-cite | Effective | Next check |
|---|---|---|---|---|---|---|
| Rev. Proc. 2011-29 success-based-fee safe harbor | 70% deductible / 30% capitalized | MUST (binding) | Rev. Proc. 2011-29 | § 3.01 (70/30 success-based-fee safe harbor) | current | on IRS guidance update |


**Authorities**

| Authority | ID | Type |
|---|---|---|
| IRC 195 | AUTH-0115 | statute |
| IRC 263 | AUTH-0117 | statute |
| Treas. Reg. 1.263(a)-5 | AUTH-0240 | regulation |
| Rev. Proc. 2011-29 | AUTH-0205 | guidance |
| INDOPCO | AUTH-0100 | practice-or-guidance |
| Letter Ruling 202308010 | AUTH-0158 | practice-or-guidance |

## 6. Worked example

*Three costs against an April 1 bright-line date: a $3M success-based banker fee splits 70/30 under the Rev. Proc. 2011-29 safe harbor ($2.1M deductible, $900k capitalized), $500k of pre-bright-line diligence is §195 investigatory, and $1M of inherently facilitative legal is capitalized — with a PE-owned-target success-fee documentation flag.*

**Inputs**

```json
{
  "transaction_costs": [
    {
      "label": "Success-based banker fee",
      "amount_cents": 300000000,
      "success_based": true
    },
    {
      "label": "Pre-LOI diligence",
      "amount_cents": 50000000,
      "incurred_date": "2026-01-15"
    },
    {
      "label": "Facilitative legal",
      "amount_cents": 100000000,
      "incurred_date": "2026-06-01",
      "inherently_facilitative": true
    }
  ],
  "bright_line_date": "2026-04-01",
  "rev_proc_2011_29_safe_harbor_elected": true,
  "pe_owned_target": true
}
```

**Outputs (executed against the reference implementation `MODEL.TAX.TRANSACTION_COSTS.v1`)**

```json
{
  "cost_count": 3,
  "deductible_cents": 210000000,
  "capitalized_cents": 190000000,
  "amortizable_195_cents": 50000000,
  "pe_owned_target_success_fee_risk_flag": true,
  "rows": [
    {
      "label": "Success-based banker fee",
      "amount_cents": 300000000,
      "incurred_date": null,
      "classification": "success_based_fee_70_30_safe_harbor",
      "deductible_cents": 210000000,
      "capitalized_cents": 90000000,
      "amortizable_195_cents": 0
    },
    {
      "label": "Pre-LOI diligence",
      "amount_cents": 50000000,
      "incurred_date": "2026-01-15",
      "classification": "pre_bright_line_investigatory_195",
      "deductible_cents": 0,
      "capitalized_cents": 0,
      "amortizable_195_cents": 50000000
    },
    {
      "label": "Facilitative legal",
      "amount_cents": 100000000,
      "incurred_date": "2026-06-01",
      "classification": "inherently_facilitative_capitalized",
      "deductible_cents": 0,
      "capitalized_cents": 100000000,
      "amortizable_195_cents": 0
    }
  ]
}
```

Precision: All amounts are exact integer cents (see the Conventions chapter); the safe-harbor split is applied at the cost level and rounded to the nearest cent.

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["transaction_costs","bright_line_date"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model classifies transaction costs into the deduction, capitalization, and §195 buckets from supplied facts. Whether a cost is in fact facilitative, whether the safe harbor is properly elected and documented, and the binding characterization are determinations for tax counsel; the model computes the split and flags the documentation risk and renders no characterization opinion.

## 9. Conformance bindings

Requirement `REQ-M203` is verified by 2 published case(s): `CONF.MODEL.TAX.COSTS.001`, `CONF.MODEL.TAX.COSTS.002`.

## 10. Version

Reference binding `MODEL.TAX.TRANSACTION_COSTS.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M204 — Imputed interest, OID, and 453A

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G2
**Deal contexts:** seller note · installment sale · earnout

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Screens a deferred-payment obligation for imputed interest and OID — the shortfall of the stated rate below the applicable federal rate, the imputed interest that shortfall generates, and the §483/§1274 routing — and tests whether a large installment receivable triggers the §453A interest charge. It answers, for a seller note or installment sale, "does the note carry adequate stated interest, and does §453A bite?" It computes the imputed interest and the §453A screen; the AFR is live data and the characterization is tax counsel's.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M204.schema.json`](M204.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `afr_rate` | number | MUST | The applicable federal rate for the term, as a fraction; supplied at runtime. |
| `principal_cents` | integer (cents) | MUST | Principal of the deferred-payment obligation. |
| `stated_interest_rate` | number | MUST | The obligation's stated interest rate, as a fraction. |
| `term_months` | number | MUST | Term of the obligation in months. |
| `installment_receivable_cents` | integer (cents) | MAY | Aggregate face of installment receivables (default 0); drives the §453A test. |
| `installment_receivable_threshold_cents` | integer (cents) | MAY | Override for the §453A threshold; defaults to the statutory $5M. |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `principal_cents` | integer (cents) | The principal, echoed. |
| `stated_interest_rate` | number | The stated rate, echoed. |
| `afr_rate` | number | The AFR used. |
| `imputed_rate_delta` | number | AFR shortfall (AFR less stated rate, floored at zero). |
| `imputed_interest_cents` | integer (cents) | Imputed interest over the term. |
| `oid_floor_cents` | integer (cents) | The OID floor (equal to the imputed interest). |
| `characterization` | enum(imputed_interest_characterization) | Which imputed-interest regime the term routes to. One of `section_483_or_1274_review`, `adequate_stated_interest_short_term_check`. |
| `installment_453a_threshold_cents` | integer (cents) | The §453A threshold applied. |
| `installment_receivable_cents` | integer (cents) | The installment receivable, echoed. |
| `section_453a_applies` | boolean | Whether the §453A interest charge applies. |
| `section_453a_excess_receivable_cents` | integer (cents) | Receivable in excess of the threshold. |

## 4. Algorithm

Given `principal_cents`, `stated_interest_rate`, `afr_rate`, and `term_months`, plus optional `installment_receivable_cents` (default 0), `installment_receivable_threshold_cents` (default: the §453A threshold):
1. If any required input is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.
2. `imputed_rate_delta` SHALL be `max(0, afr_rate − stated_interest_rate)` (constants: Applicable Federal Rate); `imputed_interest_cents` SHALL be `round(principal_cents × imputed_rate_delta × (term_months ÷ 12))`, and `oid_floor_cents` SHALL equal it.
3. `characterization` SHALL route to the §483/§1274 review for terms over twelve months, else to the short-term adequate-stated-interest check.
4. `section_453a_applies` SHALL be true iff `installment_receivable_cents` exceeds the §453A threshold (constants: §453A installment-receivable threshold).
5. `section_453a_excess_receivable_cents` SHALL be `max(0, installment_receivable_cents − threshold)`.

## 5. Constants & authorities

| Constant | Value | Strength | Authority | Pin-cite | Effective | Next check |
|---|---|---|---|---|---|---|
| §453A installment-receivable threshold | $5,000,000 (500,000,000 cents) | MUST (binding) | IRC § 453A(b) | § 453A(b)(2)(B) ($5M aggregate face threshold) | current (IRC as amended) | on IRC amendment |
| Applicable Federal Rate | supplied at runtime (IRS publishes AFRs monthly) | pass-through (live data) | IRC § 1274(d); IRS monthly AFR release | § 1274(d) | monthly | monthly (per IRS release) |


**Authorities**

| Authority | ID | Type |
|---|---|---|
| IRC 483 | AUTH-0132 | statute |
| IRC 1274 | AUTH-0109 | statute |
| IRC 1274A | AUTH-0110 | statute |
| IRC 453A | AUTH-0131 | statute |

## 6. Worked example

*A $2M seller note at a 3% stated rate against a 5% AFR over 36 months imputes a 2% rate delta and about $120,000 of imputed interest (the OID floor); the over-12-month term routes to §483/§1274 review, and the $6M installment receivable exceeds the $5M §453A threshold by $1M.*

**Inputs**

```json
{
  "principal_cents": 200000000,
  "stated_interest_rate": 0.03,
  "afr_rate": 0.05,
  "term_months": 36,
  "installment_receivable_cents": 600000000
}
```

**Outputs (executed against the reference implementation `MODEL.TAX.IMPUTED_INTEREST_OID.v1`)**

```json
{
  "principal_cents": 200000000,
  "stated_interest_rate": 0.03,
  "afr_rate": 0.05,
  "imputed_rate_delta": 0.02,
  "imputed_interest_cents": 12000000,
  "oid_floor_cents": 12000000,
  "characterization": "section_483_or_1274_review",
  "installment_453a_threshold_cents": 500000000,
  "installment_receivable_cents": 600000000,
  "section_453a_applies": true,
  "section_453a_excess_receivable_cents": 100000000
}
```

Precision: Rates round per the global rule (half-even to 4 decimals — see the Conventions chapter); interest and receivable amounts are exact integer cents.

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["principal_cents","stated_interest_rate","afr_rate","term_months"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model computes imputed interest and the §453A screen from supplied rates and figures. The correct AFR, whether the obligation carries adequate stated interest, the contingent-payment characterization, and the §453A computation are determinations for tax counsel; the model computes the shortfall and the screen and renders no characterization opinion.

## 9. Conformance bindings

Requirement `REQ-M204` is verified by 2 published case(s): `CONF.MODEL.TAX.INTEREST.001`, `CONF.MODEL.TAX.INTEREST.002`.

## 10. Version

Reference binding `MODEL.TAX.IMPUTED_INTEREST_OID.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M205 — SALT transaction engine

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G2, G19
**Deal contexts:** transaction tax · state tax

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Computes the state-and-local transaction tax on a deal — the apportioned gain and state income tax, any sales/use tax on the transferred base, and the total — and flags when a contested nexus position or a bulk-sale clearance routes the deal to a SALT specialist. It answers, for a multistate deal, "what state income and sales/use tax does this transaction carry, and where does it need specialist clearance?" It computes the tax from supplied apportionment and rates; the nexus and clearance positions are the specialist's.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M205.schema.json`](M205.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `gain_cents` | integer (cents) | MUST | The gain subject to state income tax. |
| `state_apportionment_pct` | number | MUST | The state apportionment factor as a fraction. |
| `bulk_sale_clearance_required` | boolean | MAY | Whether a bulk-sale tax clearance is required (default false). |
| `contested_nexus_position` | boolean | MAY | Whether a contested nexus position is present (default false). |
| `sales_use_tax_base_cents` | integer (cents) | MAY | Base subject to sales/use tax (default 0). |
| `sales_use_tax_rate` | number | MAY | Sales/use tax rate as a fraction (default 0). |
| `state_tax_rate` | number | MAY | The state income tax rate as a fraction (default 0). |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `gain_cents` | integer (cents) | The gain, echoed. |
| `state_apportionment_pct` | number | The apportionment factor applied. |
| `apportioned_gain_cents` | integer (cents) | Gain apportioned to the state. |
| `state_tax_rate` | number | The state income tax rate applied. |
| `state_income_tax_cents` | integer (cents) | State income tax on the apportioned gain. |
| `sales_use_tax_base_cents` | integer (cents) | The sales/use tax base, echoed. |
| `sales_use_tax_cents` | integer (cents) | Sales/use tax on the base. |
| `total_state_transaction_tax_cents` | integer (cents) | Total state transaction tax. |
| `bulk_sale_clearance_required` | boolean | Whether a bulk-sale clearance is required. |
| `contested_nexus_position` | boolean | Whether a contested nexus position is present. |
| `salt_specialist_handoff_required` | boolean | True on a contested nexus position or a bulk-sale clearance. |

## 4. Algorithm

Given `gain_cents` and `state_apportionment_pct`, plus optional `state_tax_rate` (default 0), `sales_use_tax_base_cents` (default 0), `sales_use_tax_rate` (default 0), `bulk_sale_clearance_required` (default false), `contested_nexus_position` (default false):
1. If either required input is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.
2. `apportioned_gain_cents` SHALL be `round(gain_cents × state_apportionment_pct)`; `state_income_tax_cents` SHALL be `round(apportioned_gain × state_tax_rate)`.
3. `sales_use_tax_cents` SHALL be `round(sales_use_tax_base_cents × sales_use_tax_rate)`.
4. `total_state_transaction_tax_cents` SHALL be the sum of the state income and sales/use tax.
5. `salt_specialist_handoff_required` SHALL be true iff a contested nexus position or a bulk-sale clearance is present.

## 5. Constants & authorities

_No numeric constants — this model computes from supplied facts and cited rule text only (attested: `constants: []`)._


**Authorities**

| Authority | ID | Type |
|---|---|---|
| UDITPA | AUTH-0254 | practice-or-guidance |
| State Nexus Statutes | AUTH-0227 | statute |
| Bulk Sale Acts | AUTH-0042 | statute |

## 6. Worked example

*A $10M gain apportioned 40% to a state at a 6% rate is $240,000 of state income tax, plus $140,000 of sales/use tax on a $2M taxable base — $380,000 of state transaction tax; a required bulk-sale clearance routes the deal to a SALT specialist.*

**Inputs**

```json
{
  "gain_cents": 1000000000,
  "state_apportionment_pct": 0.4,
  "state_tax_rate": 0.06,
  "sales_use_tax_base_cents": 200000000,
  "sales_use_tax_rate": 0.07,
  "bulk_sale_clearance_required": true,
  "contested_nexus_position": false
}
```

**Outputs (executed against the reference implementation `MODEL.TAX.SALT_TRANSACTION.v1`)**

```json
{
  "gain_cents": 1000000000,
  "state_apportionment_pct": 0.4,
  "apportioned_gain_cents": 400000000,
  "state_tax_rate": 0.06,
  "state_income_tax_cents": 24000000,
  "sales_use_tax_base_cents": 200000000,
  "sales_use_tax_cents": 14000000,
  "total_state_transaction_tax_cents": 38000000,
  "bulk_sale_clearance_required": true,
  "contested_nexus_position": false,
  "salt_specialist_handoff_required": true
}
```

Precision: Apportionment and rates round per the global rule (half-even to 4 decimals — see the Conventions chapter); all tax amounts are exact integer cents.

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["gain_cents","state_apportionment_pct"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model computes state income and sales/use transaction tax from supplied apportionment and rates. The correct apportionment factor, whether nexus exists, the taxability of the transfer, and the bulk-sale clearance requirements are determinations for a SALT specialist; on a contested position or a required clearance the model routes them and renders no state-tax opinion.

## 9. Conformance bindings

Requirement `REQ-M205` is verified by 2 published case(s): `CONF.MODEL.TAX.SALT.001`, `CONF.MODEL.TAX.SALT.002`.

## 10. Version

Reference binding `MODEL.TAX.SALT_TRANSACTION.v1` · entered the specification at internal lineage stage `v1_1` · spec v1.0.0.


# M206 — Indemnification ladder engine

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G1, G8
**Deal contexts:** purchase agreement economics

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Sizes the indemnification ladder of a private acquisition agreement — the general cap, the basket, and the fundamental-representation cap — from the transaction value and either supplied percentages or cited-median market defaults. It answers, for a buyer or seller negotiating recourse, "how large is the indemnity backstop, and where does the basket sit?" It computes the magnitudes and surfaces the standard toggles (materiality scrape, sandbagging); the terms themselves are the parties' negotiation.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M206.schema.json`](M206.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `transaction_value_cents` | integer (cents) | MUST | Total transaction value the ladder is sized against. |
| `basket_pct` | number | MAY | Override for the basket as a fraction of value; defaults to the cited median. |
| `basket_type` | enum(basket_type) | MAY | Override for how the basket operates; defaults by RWI posture. One of `deductible`, `tipping`, `deductible_or_tipping_to_confirm`. |
| `general_cap_pct` | number | MAY | Override for the general indemnity cap as a fraction of value; defaults to the cited median. |
| `rwi_present` | boolean | MAY | Whether representation-and-warranty insurance backs the deal (default false); shifts the cited-median cap default. |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `transaction_value_cents` | integer (cents) | The transaction value, echoed. |
| `rwi_present` | boolean | The RWI posture used. |
| `general_cap_pct` | number | The general indemnity cap as a fraction of value. |
| `general_cap_cents` | integer (cents) | The general indemnity cap in cents. |
| `basket_pct` | number | The basket as a fraction of value. |
| `basket_cents` | integer (cents) | The basket threshold in cents. |
| `basket_type` | enum(basket_type) | How the basket operates. One of `deductible`, `tipping`, `deductible_or_tipping_to_confirm`. |
| `fundamental_reps_cap_cents` | integer (cents) | The cap on fundamental-representation claims (the full transaction value). |
| `fraud_tax_carveout` | string | The fraud and tax carve-out posture — uncapped or counsel-defined. |
| `materiality_scrape_default` | boolean | Whether a materiality scrape is the market-standard default here. |
| `sandbagging_default` | string | The default sandbagging posture — silent or governed by state default. |

## 4. Algorithm

Given `transaction_value_cents` and optional `rwi_present` (default false), `general_cap_pct`, `basket_pct`, `basket_type`:
1. If `transaction_value_cents` is missing, the implementation SHALL return `status: "needs_inputs"`.
2. `general_cap_pct` SHALL be the supplied value, else the cited-median default for the RWI posture — the RWI-present cap or the no-RWI cap (constants: general indemnity cap medians).
3. `basket_pct` SHALL be the supplied value, else the cited-median basket default (constants: indemnity basket median).
4. `general_cap_cents` and `basket_cents` SHALL be the transaction value times the respective percentage, rounded to the nearest cent.
5. `fundamental_reps_cap_cents` SHALL be the full transaction value; the fraud/tax carve-out SHALL be reported as uncapped or counsel-defined.
6. The model SHALL report the default posture of the materiality scrape and sandbagging toggles as market-standard flags, not determinations.

## 5. Constants & authorities

| Constant | Value | Strength | Authority | Pin-cite | Effective | Next check |
|---|---|---|---|---|---|---|
| General indemnity cap — no RWI | 10.5% of transaction value | SHOULD (cited median) | ABA Private Target Deal Points Study 2023 | median general indemnity cap, private targets without RWI | 2023 study | on next ABA study (biennial) |
| General indemnity cap — RWI present | 0.5% of transaction value | SHOULD (cited median) | ABA Private Target Deal Points Study 2023 | median general indemnity cap, RWI-backed deals | 2023 study | on next ABA study (biennial) |
| Indemnity basket | 0.5% of transaction value | SHOULD (cited median) | ABA Private Target Deal Points Study 2023 | median basket/deductible threshold | 2023 study | on next ABA study (biennial) |


**Authorities**

| Authority | ID | Type |
|---|---|---|
| ABA Private Target Deal Points Study | AUTH-0026 | study/dataset |
| ABA Model SPA | AUTH-0024 | practice-norm |

## 6. Worked example

*An $80M private deal without RWI carries a 10.5%-of-value indemnity cap ($8.4M) over a 0.5% basket ($400k), with fundamental representations capped at the full price.*

**Inputs**

```json
{
  "transaction_value_cents": 8000000000,
  "rwi_present": false
}
```

**Outputs (executed against the reference implementation `MODEL.LEGAL.INDEMNITY.LADDER.v1`)**

```json
{
  "transaction_value_cents": 8000000000,
  "rwi_present": false,
  "general_cap_pct": 0.105,
  "general_cap_cents": 840000000,
  "basket_pct": 0.005,
  "basket_cents": 40000000,
  "basket_type": "deductible_or_tipping_to_confirm",
  "fundamental_reps_cap_cents": 8000000000,
  "fraud_tax_carveout": "uncapped_or_counsel_defined",
  "materiality_scrape_default": true,
  "sandbagging_default": "silent_or_state_default"
}
```

Precision: Percentages are 4-decimal fractions; cap and basket amounts are exact integer cents (see the Conventions chapter).

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["transaction_value_cents"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model sizes the indemnification ladder — cap, basket, fundamental-rep cap — from the transaction value and either supplied or cited-median default percentages. The default percentages are market medians (SHOULD), not law; whether a given cap, basket type (deductible vs. tipping), materiality scrape, or sandbagging posture is right for this deal is a negotiation and drafting judgment for deal counsel, which the model does not make.

## 9. Conformance bindings

Requirement `REQ-M206` is verified by 2 published case(s): `CONF.MODEL.LEGAL.INDEMNITY.001`, `CONF.MODEL.LEGAL.INDEMNITY.002`.

## 10. Version

Reference binding `MODEL.LEGAL.INDEMNITY.LADDER.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M207 — Survival period engine

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G1, G8
**Deal contexts:** purchase agreement economics

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Builds the survival schedule of a purchase agreement — when the general, fundamental, and tax representations expire — from the closing date and either supplied periods or cited-median defaults, and dates each expiry. It answers, for the parties papering recourse, "how long is each class of representation on the hook?" It schedules the dates and flags the governing-law and fraud interactions for counsel.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M207.schema.json`](M207.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `closing_date` | string (ISO date) | MUST | The closing date from which survival periods run. |
| `fraud_carveout` | boolean | MAY | Whether fraud is carved out of the exclusive-remedy provision (default true). |
| `fundamental_reps_years` | integer | MAY | Override for fundamental-representation survival in years; defaults to the cited median. |
| `general_reps_months` | integer | MAY | Override for general-representation survival in months; defaults to the cited median. |
| `rwi_present` | boolean | MAY | Whether RWI backs the deal (default false); zeroes the general survival default. |
| `tax_reps_years` | integer | MAY | Override for tax-representation survival in years; defaults to the cited median. |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `closing_date` | string (ISO date) | The closing date, echoed. |
| `rwi_present` | boolean | The RWI posture used. |
| `general_reps_months` | integer | General-representation survival in months. |
| `general_reps_expiry` | string (ISO date) | null | General-representation expiry date, or null when the period is zero. |
| `fundamental_reps_years` | integer | Fundamental-representation survival in years. |
| `fundamental_reps_expiry` | string (ISO date) | Fundamental-representation expiry date. |
| `tax_reps_years` | integer | Tax-representation survival in years. |
| `tax_reps_expiry` | string (ISO date) | Tax-representation expiry date. |
| `fraud_carveout_from_exclusive_remedy` | boolean | Whether fraud is carved out of the exclusive remedy. |
| `counsel_review_flags` | string[] | Items counsel must confirm (limitations period, fraud definition, RWI interaction). |

## 4. Algorithm

Given `closing_date` and optional `rwi_present` (default false), `general_reps_months`, `fundamental_reps_years`, `tax_reps_years`, `fraud_carveout`:
1. If `closing_date` is missing or not a valid ISO date, the implementation SHALL return `status: "needs_inputs"`.
2. `general_reps_months` SHALL be the supplied value, else the cited-median default — zero when RWI is present, otherwise the no-RWI general survival period (constants: general survival medians).
3. `fundamental_reps_years` and `tax_reps_years` SHALL be the supplied values, else the cited-median fundamental and tax survival periods (constants: fundamental/tax survival medians).
4. Each expiry SHALL be the closing date advanced by the corresponding period (general in months; fundamental and tax in years × 12 months); a zero general period yields a null expiry.
5. It SHALL carry a counsel-review flag to confirm the governing-law statute of limitations, the fraud definition, and the RWI-policy interaction.

## 5. Constants & authorities

| Constant | Value | Strength | Authority | Pin-cite | Effective | Next check |
|---|---|---|---|---|---|---|
| General survival — no RWI | 12 months | SHOULD (cited median) | SRS Acquiom Deal Terms Study 2024; 2025 | median general representation survival, non-RWI deals | 2024–2025 studies | on next SRS Acquiom study (annual) |
| General survival — RWI present | 0 months (reps do not survive to the seller) | SHOULD (cited median) | SRS Acquiom Deal Terms Study 2024; 2025 | median general survival, RWI-backed deals | 2024–2025 studies | on next SRS Acquiom study (annual) |
| Fundamental representation survival | 6 years | SHOULD (cited median) | ABA Private Target Deal Points Study 2023 | median fundamental-rep survival | 2023 study | on next ABA study (biennial) |
| Tax representation survival | 6 years | SHOULD (cited median) | ABA Private Target Deal Points Study 2023 | median tax-rep survival (statute-of-limitations linked) | 2023 study | on next ABA study (biennial) |


**Authorities**

| Authority | ID | Type |
|---|---|---|
| SRS Acquiom Deal Terms Study 2024 | AUTH-0220 | study/dataset |
| SRS Acquiom Deal Terms Study 2025 | AUTH-0221 | study/dataset |
| ABA Private Target Deal Points Study | AUTH-0026 | study/dataset |

## 6. Worked example

*A deal closing March 31, 2026 without RWI runs general representations 12 months (to March 31, 2027) and fundamental and tax representations six years (to March 31, 2032).*

**Inputs**

```json
{
  "closing_date": "2026-03-31",
  "rwi_present": false
}
```

**Outputs (executed against the reference implementation `MODEL.LEGAL.SURVIVAL.PERIODS.v1`)**

```json
{
  "closing_date": "2026-03-31",
  "rwi_present": false,
  "general_reps_months": 12,
  "general_reps_expiry": "2027-03-31",
  "fundamental_reps_years": 6,
  "fundamental_reps_expiry": "2032-03-31",
  "tax_reps_years": 6,
  "tax_reps_expiry": "2032-03-31",
  "fraud_carveout_from_exclusive_remedy": true,
  "counsel_review_flags": [
    "Confirm governing-law statute of limitations, fraud definition, and RWI policy interaction."
  ]
}
```

Precision: Periods are whole months or years; expiries are ISO-8601 dates (see the Conventions chapter).

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["closing_date"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model builds the survival schedule — general, fundamental, tax — from the closing date and cited-median or supplied periods. The governing-law statute of limitations, the fraud definition, and the exclusive-remedy/RWI interaction are legal determinations for counsel; the model schedules the dates and flags the review, and renders no enforceability conclusion.

## 9. Conformance bindings

Requirement `REQ-M207` is verified by 2 published case(s): `CONF.MODEL.LEGAL.SURVIVAL.001`, `CONF.MODEL.LEGAL.SURVIVAL.002`.

## 10. Version

Reference binding `MODEL.LEGAL.SURVIVAL.PERIODS.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M208 — Escrow and holdback sizing

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G8
**Deal contexts:** purchase agreement economics

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Sizes the escrows a purchase agreement holds back — the general indemnity escrow, the purchase-price-adjustment escrow, and any special escrows — from the transaction value and either supplied percentages or cited-median defaults, and totals them. It answers, for the parties funding the closing, "how much cash is held back, and in which buckets?" The default percentages are market medians; the protective amount is a negotiation.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M208.schema.json`](M208.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `transaction_value_cents` | integer (cents) | MUST | Total transaction value the escrows are sized against. |
| `general_escrow_pct` | number | MAY | Override for the general escrow as a fraction of value; defaults to the cited median. |
| `ppa_escrow_pct` | number | MAY | Override for the PPA escrow as a fraction of value; defaults to the cited median. |
| `rwi_present` | boolean | MAY | Whether RWI backs the deal (default false); shifts the general escrow default. |
| `special_escrows_cents` | integer (cents)[] | MAY | Any special-purpose escrow amounts (environmental, litigation, etc.) to add to the aggregate. |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `transaction_value_cents` | integer (cents) | The transaction value, echoed. |
| `rwi_present` | boolean | The RWI posture used. |
| `general_escrow_pct` | number | The general escrow as a fraction of value. |
| `general_escrow_cents` | integer (cents) | The general indemnity escrow in cents. |
| `ppa_escrow_pct` | number | The PPA escrow as a fraction of value. |
| `ppa_escrow_cents` | integer (cents) | The purchase-price-adjustment escrow in cents. |
| `special_escrow_cents` | integer (cents) | The sum of special-purpose escrows. |
| `aggregate_escrow_cents` | integer (cents) | Total cash held back across all escrows. |

## 4. Algorithm

Given `transaction_value_cents` and optional `rwi_present` (default false), `general_escrow_pct`, `ppa_escrow_pct`, `special_escrows_cents`:
1. If `transaction_value_cents` is missing, the implementation SHALL return `status: "needs_inputs"`.
2. `general_escrow_pct` SHALL be the supplied value, else the cited-median default for the RWI posture (constants: general escrow medians).
3. `ppa_escrow_pct` SHALL be the supplied value, else the cited-median PPA escrow default (constants: PPA escrow median).
4. `general_escrow_cents` and `ppa_escrow_cents` SHALL be the transaction value times the respective percentage, rounded to the nearest cent; `special_escrow_cents` SHALL be the sum of any supplied special-escrow amounts.
5. `aggregate_escrow_cents` SHALL be the sum of the three.

## 5. Constants & authorities

| Constant | Value | Strength | Authority | Pin-cite | Effective | Next check |
|---|---|---|---|---|---|---|
| General escrow — no RWI | 10% of transaction value | SHOULD (cited median) | SRS Acquiom Deal Terms Study 2024; 2025 | median general indemnity escrow, non-RWI | 2024–2025 studies | on next SRS Acquiom study (annual) |
| General escrow — RWI present | 0.5% of transaction value | SHOULD (cited median) | SRS Acquiom Deal Terms Study 2024; 2025 | median general escrow, RWI-backed | 2024–2025 studies | on next SRS Acquiom study (annual) |
| Purchase-price-adjustment escrow | 1% of transaction value | SHOULD (cited median) | SRS Acquiom Deal Terms Study 2024; 2025 | median working-capital/PPA escrow | 2024–2025 studies | on next SRS Acquiom study (annual) |


**Authorities**

| Authority | ID | Type |
|---|---|---|
| SRS Acquiom Deal Terms Study 2024 | AUTH-0220 | study/dataset |
| SRS Acquiom Deal Terms Study 2025 | AUTH-0221 | study/dataset |
| ABA Private Target Deal Points Study | AUTH-0026 | study/dataset |

## 6. Worked example

*An $80M deal without RWI holds a 10% general escrow ($8M) plus a 1% PPA escrow ($800k), $8.8M held back in aggregate.*

**Inputs**

```json
{
  "transaction_value_cents": 8000000000,
  "rwi_present": false
}
```

**Outputs (executed against the reference implementation `MODEL.LEGAL.ESCROW.HOLDBACK.v1`)**

```json
{
  "transaction_value_cents": 8000000000,
  "rwi_present": false,
  "general_escrow_pct": 0.1,
  "general_escrow_cents": 800000000,
  "ppa_escrow_pct": 0.01,
  "ppa_escrow_cents": 80000000,
  "special_escrow_cents": 0,
  "aggregate_escrow_cents": 880000000
}
```

Precision: Percentages are 4-decimal fractions; escrow amounts are exact integer cents (see the Conventions chapter).

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["transaction_value_cents"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model sizes general, PPA, and special escrows from the transaction value and cited-median or supplied percentages. The default percentages are market medians (SHOULD); the escrow that actually protects this buyer, and the release mechanics, are negotiation and drafting judgments for counsel.

## 9. Conformance bindings

Requirement `REQ-M208` is verified by 2 published case(s): `CONF.MODEL.LEGAL.ESCROW.001`, `CONF.MODEL.LEGAL.ESCROW.002`.

## 10. Version

Reference binding `MODEL.LEGAL.ESCROW.HOLDBACK.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M209 — RWI stack architecture

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G8
**Deal contexts:** insured M&A

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Lays out the representation-and-warranty-insurance stack — the retention, the primary policy tower, any excess layers, and the interaction with the seller indemnity cap — from the enterprise value and either supplied or cited-median terms. It answers, for a deal team pricing insured recourse, "how big is the tower, where does the retention sit, and how much seller indemnity remains behind it?" Binding terms belong to the broker and underwriter.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M209.schema.json`](M209.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `enterprise_value_cents` | integer (cents) | MUST | Enterprise value the RWI stack is sized against. |
| `excess_layers` | object[] | MAY | Excess layers above the primary tower; each object carries `limit_cents` (integer cents). |
| `exclusions` | string[] | MAY | Named policy exclusions being tracked. |
| `policy_tower_pct` | number | MAY | Override for the primary tower as a fraction of EV; defaults to the cited median. |
| `retention_pct` | number | MAY | Override for the retention as a fraction of EV; defaults to the cited median. |
| `seller_indemnity_cap_pct` | number | MAY | Override for the seller indemnity cap as a fraction of EV; defaults to the cited median. |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `enterprise_value_cents` | integer (cents) | The enterprise value, echoed. |
| `retention_pct` | number | The retention as a fraction of EV. |
| `retention_cents` | integer (cents) | The retention (deductible) in cents. |
| `primary_policy_limit_cents` | integer (cents) | The primary RWI tower limit in cents. |
| `excess_layer_count` | integer | Number of excess layers supplied. |
| `excess_policy_limit_cents` | integer (cents) | Total excess-layer limit in cents. |
| `total_policy_limit_cents` | integer (cents) | Primary plus excess policy limit. |
| `seller_indemnity_cap_pct` | number | The seller indemnity cap as a fraction of EV. |
| `seller_indemnity_cap_cents` | integer (cents) | The seller indemnity cap in cents. |
| `exclusion_count` | integer | Number of tracked exclusions. |
| `broker_handoff_required` | boolean | Always true — binding terms route to the broker/underwriter. |

## 4. Algorithm

Given `enterprise_value_cents` and optional `retention_pct`, `policy_tower_pct`, `seller_indemnity_cap_pct`, `exclusions`, `excess_layers`:
1. If `enterprise_value_cents` is missing, the implementation SHALL return `status: "needs_inputs"`.
2. `retention_cents` SHALL be the enterprise value times the retention percentage (supplied or cited median — constants: RWI retention median), rounded to the nearest cent.
3. `primary_policy_limit_cents` SHALL be the enterprise value times the tower percentage (supplied or cited median — constants: RWI tower median).
4. `excess_policy_limit_cents` SHALL be the sum of any supplied excess-layer limits; `excess_layer_count` SHALL be their number; `total_policy_limit_cents` SHALL be primary plus excess.
5. `seller_indemnity_cap_cents` SHALL be the enterprise value times the seller-indemnity-cap percentage (supplied or cited median — constants: seller indemnity cap median).
6. It SHALL count exclusions and set `broker_handoff_required` true — binding terms route to the broker and underwriter.

## 5. Constants & authorities

| Constant | Value | Strength | Authority | Pin-cite | Effective | Next check |
|---|---|---|---|---|---|---|
| RWI retention | 0.75% of enterprise value | SHOULD (cited median) | Marsh, Aon, Lockton RWI market reports 2023–2024 | median retention (dropping to ~0.5% at higher EV) | 2023–2024 market reports | on next annual broker reports |
| RWI primary tower | 10% of enterprise value | SHOULD (cited median) | ABA Private Target Deal Points Study 2023; Marsh/Aon/Lockton reports 2023–2024 | median primary policy limit | 2023–2024 | on next annual broker reports |
| Seller indemnity cap behind RWI | 0.5% of enterprise value | SHOULD (cited median) | ABA Private Target Deal Points Study 2023 | median seller indemnity cap, RWI deals | 2023 study | on next ABA study (biennial) |


**Authorities**

| Authority | ID | Type |
|---|---|---|
| ABA Private Target Deal Points Study | AUTH-0026 | study/dataset |
| Marsh RWI Reports | AUTH-0166 | practice-norm |
| Aon RWI Reports | AUTH-0033 | practice-norm |
| Lockton RWI Reports | AUTH-0160 | practice-norm |

## 6. Worked example

*A $150M insured deal sets a 0.75% retention ($1.125M) beneath a $15M primary RWI tower, with the seller indemnity capped at 0.5% ($750k) behind the policy.*

**Inputs**

```json
{
  "enterprise_value_cents": 15000000000
}
```

**Outputs (executed against the reference implementation `MODEL.LEGAL.RWI_STACK.v1`)**

```json
{
  "enterprise_value_cents": 15000000000,
  "retention_pct": 0.0075,
  "retention_cents": 112500000,
  "primary_policy_limit_cents": 1500000000,
  "excess_layer_count": 0,
  "excess_policy_limit_cents": 0,
  "total_policy_limit_cents": 1500000000,
  "seller_indemnity_cap_pct": 0.005,
  "seller_indemnity_cap_cents": 75000000,
  "exclusion_count": 0,
  "broker_handoff_required": true
}
```

Precision: Percentages are 4-decimal fractions; retention and policy limits are exact integer cents (see the Conventions chapter).

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["enterprise_value_cents"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model lays out the RWI stack — retention, primary tower, excess layers, seller-indemnity interaction — from cited-median or supplied terms. Binding pricing, the retention the underwriter will actually offer, the exclusions, and the policy wording are the broker's and underwriter's; the model produces the architecture and routes to them (broker_handoff_required), and quotes no policy.

## 9. Conformance bindings

Requirement `REQ-M209` is verified by 2 published case(s): `CONF.MODEL.LEGAL.RWI_STACK.001`, `CONF.MODEL.LEGAL.RWI_STACK.002`.

## 10. Version

Reference binding `MODEL.LEGAL.RWI_STACK.v1` · entered the specification at internal lineage stage `v1_1` · spec v1.0.0.


# M210 — Closing-statement true-up sequence

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G7
**Deal contexts:** working capital true-up

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Computes the working-capital true-up that follows closing — the estimated and final purchase-price adjustments against the peg, which party owes the receivable — and dates the estimated-statement, dispute-notice, and negotiation deadlines. It answers, after closing, "how much does the price move on the true-up, who pays, and by when must each step happen?" It owns the true-up that M109 (the peg) deliberately does not.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M210.schema.json`](M210.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `actual_nwc_cents` | integer (cents) | MUST | Actual net working capital per the final closing statement. |
| `closing_date` | string (ISO date) | MUST | The closing date the timeline runs from. |
| `peg_cents` | integer (cents) | MUST | The working-capital peg (see M109). |
| `actual_statement_due_days` | integer | MAY | Days after closing to deliver the actual statement; defaults to the cited median. |
| `dispute_notice_days` | integer | MAY | Days after the statement to notice a dispute; defaults to the cited median. |
| `estimated_nwc_cents` | integer (cents) | MAY | Estimated net working capital per the estimated statement; optional. |
| `good_faith_negotiation_days` | integer | MAY | Days of good-faith negotiation before the arbitrator; defaults to the cited median. |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `closing_date` | string (ISO date) | The closing date, echoed. |
| `peg_cents` | integer (cents) | The peg, echoed. |
| `estimated_nwc_cents` | integer (cents) | null | The estimated NWC, echoed, or null. |
| `actual_nwc_cents` | integer (cents) | The actual NWC, echoed. |
| `estimated_adjustment_cents` | integer (cents) | null | Estimated adjustment against the peg, or null. |
| `final_purchase_price_adjustment_cents` | integer (cents) | Final adjustment: actual NWC minus peg (positive = above peg). |
| `buyer_receivable_cents` | integer (cents) | Amount owed to the buyer when NWC lands below the peg. |
| `seller_receivable_cents` | integer (cents) | Amount owed to the seller when NWC lands above the peg. |
| `actual_statement_due_date` | string (ISO date) | Deadline to deliver the actual closing statement. |
| `dispute_notice_due_date` | string (ISO date) | Deadline to notice a dispute. |
| `good_faith_negotiation_end_date` | string (ISO date) | End of the good-faith negotiation window before the accounting arbitrator. |

## 4. Algorithm

Given `closing_date`, `peg_cents`, `actual_nwc_cents`, and optional `estimated_nwc_cents`, `actual_statement_due_days`, `dispute_notice_days`, `good_faith_negotiation_days`:
1. If `closing_date`, `peg_cents`, or `actual_nwc_cents` is missing, the implementation SHALL return `status: "needs_inputs"`.
2. `final_purchase_price_adjustment_cents` SHALL be `actual_nwc_cents − peg_cents`; `estimated_adjustment_cents` SHALL be `estimated_nwc_cents − peg_cents` when an estimate is supplied, else null.
3. `buyer_receivable_cents` SHALL be `max(0, −adjustment)` (working capital delivered below the peg); `seller_receivable_cents` SHALL be `max(0, adjustment)` (above the peg).
4. `actual_statement_due_date` SHALL be the closing date advanced by the statement-due days (supplied or cited median — constants: true-up timeline medians).
5. `dispute_notice_due_date` SHALL be the statement-due date advanced by the dispute-notice days; `good_faith_negotiation_end_date` SHALL be that date advanced by the negotiation days.

## 5. Constants & authorities

| Constant | Value | Strength | Authority | Pin-cite | Effective | Next check |
|---|---|---|---|---|---|---|
| Actual-statement due window | 90 days after closing | SHOULD (cited median) | SRS Acquiom Working Capital PPA Study 2024 | median days to deliver the closing statement | 2024 study | on next SRS Acquiom study |
| Dispute-notice window | 30 days after the statement | SHOULD (cited median) | SRS Acquiom Working Capital PPA Study 2024 | median dispute-notice period | 2024 study | on next SRS Acquiom study |
| Good-faith negotiation window | 30 days after the dispute notice | SHOULD (cited median) | SRS Acquiom Working Capital PPA Study 2024 | median good-faith negotiation period before arbitrator | 2024 study | on next SRS Acquiom study |


**Authorities**

| Authority | ID | Type |
|---|---|---|
| SRS Acquiom Working Capital PPA Study | AUTH-0223 | study/dataset |
| ABA Private Target Deal Points Study | AUTH-0026 | study/dataset |

## 6. Worked example

*Actual working capital of $4.6M lands $400k below the $5.0M peg, creating a $400k buyer receivable, with the dispute clock running from a closing-plus-90-day statement.*

**Inputs**

```json
{
  "closing_date": "2026-03-31",
  "peg_cents": 500000000,
  "actual_nwc_cents": 460000000,
  "estimated_nwc_cents": 480000000
}
```

**Outputs (executed against the reference implementation `MODEL.LEGAL.CLOSING_TRUEUP.SEQUENCE.v1`)**

```json
{
  "closing_date": "2026-03-31",
  "peg_cents": 500000000,
  "estimated_nwc_cents": 480000000,
  "actual_nwc_cents": 460000000,
  "estimated_adjustment_cents": -20000000,
  "final_purchase_price_adjustment_cents": -40000000,
  "buyer_receivable_cents": 40000000,
  "seller_receivable_cents": 0,
  "actual_statement_due_date": "2026-06-29",
  "dispute_notice_due_date": "2026-07-29",
  "good_faith_negotiation_end_date": "2026-08-28"
}
```

Precision: Adjustments and receivables are exact integer cents; timeline outputs are ISO-8601 dates (see the Conventions chapter).

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["closing_date","peg_cents","actual_nwc_cents"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model computes the working-capital true-up — estimated vs. actual adjustment and the buyer/seller receivable — and the dispute-timeline dates from the peg and cited-median or supplied day counts. Whether the actual statement is correct, and the accounting judgments inside it, are for the parties' accountants and the neutral accounting arbitrator; the model computes the arithmetic and the schedule.

## 9. Conformance bindings

Requirement `REQ-M210` is verified by 2 published case(s): `CONF.MODEL.LEGAL.TRUEUP.001`, `CONF.MODEL.LEGAL.TRUEUP.002`.

## 10. Version

Reference binding `MODEL.LEGAL.CLOSING_TRUEUP.SEQUENCE.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M211 — Conditions-to-close logic engine

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G6, G7
**Deal contexts:** purchase agreement conditions

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Tallies the conditions to closing — which are satisfied, which are waived, which still block — and flags the ones that need specialist review (regulatory, MAE, financing, consent, CFIUS, HSR). It answers, in the signing-to-closing window, "is the deal closing-ready, and what is still open?" It tracks the node logic; whether a condition is truly met or waivable is counsel's call.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M211.schema.json`](M211.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `conditions` | object[] | MUST | Closing conditions; each object carries `name` (string), `type` (a condition_type value), `satisfied` (boolean), and `waived` (boolean). |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `condition_count` | integer | Total number of conditions. |
| `satisfied_count` | integer | Number satisfied. |
| `waived_count` | integer | Number waived. |
| `open_condition_count` | integer | Number still blocking closing. |
| `closing_ready` | boolean | Whether no condition blocks closing. |
| `professional_review_required` | boolean | Whether any condition needs specialist review. |
| `open_conditions` | string[] | Names of the conditions still blocking closing. |
| `condition_nodes` | object[] | Per-condition detail: `{ name, type, satisfied, waived, blocks_closing, professional_review_required }`. |

## 4. Algorithm

Given `conditions` (a list of objects, each with `name`, `type`, `satisfied`, `waived`):
1. If `conditions` is empty, the implementation SHALL return `status: "needs_inputs"`.
2. For each condition, `blocks_closing` SHALL be true iff it is neither satisfied nor waived; `professional_review_required` SHALL be true iff its type matches a specialist category (regulatory, legal, counsel, MAE, financing, consent, CFIUS, HSR).
3. It SHALL count conditions, satisfied, waived, and open (blocking) conditions.
4. `closing_ready` SHALL be true iff no condition blocks closing; `professional_review_required` (aggregate) SHALL be true iff any node requires specialist review.
5. It SHALL list the open conditions by name and return the full node detail.

## 5. Constants & authorities

_No numeric constants — this model computes from supplied facts and cited rule text only (attested: `constants: []`)._


**Authorities**

| Authority | ID | Type |
|---|---|---|
| ABA Model SPA | AUTH-0024 | practice-norm |
| HSR Act | AUTH-0092 | statute |
| CFIUS regulations | AUTH-0049 | practice-or-guidance |

## 6. Worked example

*Of four conditions, the reps bring-down and the no-MAE condition are met, but HSR clearance and financing remain open — the deal is not closing-ready and needs specialist review.*

**Inputs**

```json
{
  "conditions": [
    {
      "name": "HSR clearance",
      "type": "hsr",
      "satisfied": false,
      "waived": false
    },
    {
      "name": "Bring-down of representations",
      "type": "general",
      "satisfied": true,
      "waived": false
    },
    {
      "name": "No material adverse effect",
      "type": "mae",
      "satisfied": true,
      "waived": false
    },
    {
      "name": "Debt financing funded",
      "type": "financing",
      "satisfied": false,
      "waived": false
    }
  ]
}
```

**Outputs (executed against the reference implementation `MODEL.LEGAL.CONDITIONS.LOGIC.v1`)**

```json
{
  "condition_count": 4,
  "satisfied_count": 2,
  "waived_count": 0,
  "open_condition_count": 2,
  "closing_ready": false,
  "professional_review_required": true,
  "open_conditions": [
    "HSR clearance",
    "Debt financing funded"
  ],
  "condition_nodes": [
    {
      "name": "HSR clearance",
      "type": "hsr",
      "satisfied": false,
      "waived": false,
      "blocks_closing": true,
      "professional_review_required": true
    },
    {
      "name": "Bring-down of representations",
      "type": "general",
      "satisfied": true,
      "waived": false,
      "blocks_closing": false,
      "professional_review_required": false
    },
    {
      "name": "No material adverse effect",
      "type": "mae",
      "satisfied": true,
      "waived": false,
      "blocks_closing": false,
      "professional_review_required": true
    },
    {
      "name": "Debt financing funded",
      "type": "financing",
      "satisfied": false,
      "waived": false,
      "blocks_closing": true,
      "professional_review_required": true
    }
  ]
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["conditions"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model tallies conditions to close and flags which block closing and which need specialist review (regulatory, MAE, financing, consent, CFIUS, HSR). Whether a condition is in fact satisfied or waivable, and the MAE and regulatory judgments, are determinations for counsel; the model tracks the node logic and routes the flagged conditions, and clears none of them itself.

## 9. Conformance bindings

Requirement `REQ-M211` is verified by 2 published case(s): `CONF.MODEL.LEGAL.CONDITIONS.001`, `CONF.MODEL.LEGAL.CONDITIONS.002`.

## 10. Version

Reference binding `MODEL.LEGAL.CONDITIONS.LOGIC.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M212 — Termination and break/reverse-break fee engine

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G7
**Deal contexts:** public M&A · private M&A termination

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Sizes the termination-fee package — the target break-up fee (and its go-shop discount), the reverse termination fee, and the antitrust reverse fee — from the transaction value and either supplied percentages or cited-median study defaults. It answers, for deal counsel and bankers, "what do the exit fees cost on each side of this deal?" It computes the magnitudes; enforceability and the fiduciary-out architecture are counsel's.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M212.schema.json`](M212.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `transaction_value_cents` | integer (cents) | MUST | Transaction (equity) value the fees are sized against. |
| `antitrust_reverse_fee_pct` | number | MAY | Override for the antitrust reverse fee as a fraction of value; defaults to the cited median. |
| `go_shop_discount_pct` | number | MAY | Override for the go-shop fee discount as a fraction of the base fee; defaults to the cited median. |
| `reverse_termination_fee_pct` | number | MAY | Override for the reverse termination fee as a fraction of value; defaults to the cited median. |
| `target_break_fee_pct` | number | MAY | Override for the target break-up fee as a fraction of value; defaults to the cited median. |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `transaction_value_cents` | integer (cents) | The transaction value, echoed. |
| `target_break_fee_pct` | number | The target break-up fee as a fraction of value. |
| `target_break_fee_cents` | integer (cents) | The target break-up fee in cents. |
| `go_shop_break_fee_cents` | integer (cents) | The reduced break fee during a go-shop period. |
| `reverse_termination_fee_pct` | number | The reverse termination fee as a fraction of value. |
| `reverse_termination_fee_cents` | integer (cents) | The reverse termination fee in cents. |
| `antitrust_reverse_fee_pct` | number | The antitrust reverse fee as a fraction of value. |
| `antitrust_reverse_fee_cents` | integer (cents) | The antitrust reverse fee in cents. |
| `counsel_review_flags` | string[] | Items counsel must confirm (fiduciary-out, go-shop, regulatory covenant, enforceability). |

## 4. Algorithm

Given `transaction_value_cents` and optional `target_break_fee_pct`, `reverse_termination_fee_pct`, `antitrust_reverse_fee_pct`, `go_shop_discount_pct`:
1. If `transaction_value_cents` is missing, the implementation SHALL return `status: "needs_inputs"`.
2. `target_break_fee_cents` SHALL be the transaction value times the target break-fee percentage (supplied or cited median — constants: break-fee median).
3. `go_shop_break_fee_cents` SHALL be the target break fee times the go-shop discount (supplied or cited median — constants: go-shop discount median).
4. `reverse_termination_fee_cents` and `antitrust_reverse_fee_cents` SHALL be the transaction value times the respective percentages (supplied or cited medians — constants: reverse and antitrust reverse fee medians).
5. It SHALL carry counsel-review flags for the fiduciary-out, go-shop/no-shop, regulatory covenant, and liquidated-damages enforceability framing.

## 5. Constants & authorities

| Constant | Value | Strength | Authority | Pin-cite | Effective | Next check |
|---|---|---|---|---|---|---|
| Target break-up fee | 2.7% of transaction value | SHOULD (cited median) | Houlihan Lokey 2023 Transaction Termination Fee Study | median target break-up fee, %-of-equity-value | 2023 study | on next Houlihan Lokey study |
| Reverse termination fee | 4.2% of transaction value | SHOULD (cited median) | Houlihan Lokey 2023 Transaction Termination Fee Study | median reverse termination fee | 2023 study | on next Houlihan Lokey study |
| Antitrust reverse termination fee | 5.0% of transaction value | SHOULD (cited median) | Fenwick 2023 antitrust reverse-break-fee (ARBF) analysis | median antitrust reverse break fee | 2023 analysis | on next Fenwick analysis |
| Go-shop break-fee discount | 50% of the base break fee | SHOULD (cited median) | Houlihan Lokey 2023 Transaction Termination Fee Study | typical go-shop period fee reduction | 2023 study | on next Houlihan Lokey study |


**Authorities**

| Authority | ID | Type |
|---|---|---|
| Houlihan Lokey 2023 Transaction Termination Fee Study | AUTH-0090 | study/dataset |
| Fenwick 2023 ARBF analysis | AUTH-0072 | practice-or-guidance |
| Brazen v. Bell Atlantic | AUTH-0040 | case |
| In re Topps | AUTH-0097 | case |

## 6. Worked example

*On an $80M deal the target break fee runs 2.7% ($2.16M), halved in a go-shop ($1.08M), against a 4.2% reverse fee ($3.36M) and a 5% antitrust reverse fee ($4.0M).*

**Inputs**

```json
{
  "transaction_value_cents": 8000000000
}
```

**Outputs (executed against the reference implementation `MODEL.LEGAL.TERMINATION.FEES.v1`)**

```json
{
  "transaction_value_cents": 8000000000,
  "target_break_fee_pct": 0.027,
  "target_break_fee_cents": 216000000,
  "go_shop_break_fee_cents": 108000000,
  "reverse_termination_fee_pct": 0.042,
  "reverse_termination_fee_cents": 336000000,
  "antitrust_reverse_fee_pct": 0.05,
  "antitrust_reverse_fee_cents": 400000000,
  "counsel_review_flags": [
    "Confirm fiduciary-out, go-shop/no-shop, regulatory covenant, and enforceability framing with counsel."
  ]
}
```

Precision: Percentages are 4-decimal fractions; fee amounts are exact integer cents (see the Conventions chapter).

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["transaction_value_cents"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model sizes break-up, reverse-break-up, and antitrust reverse-termination fees from the transaction value and cited-median or supplied percentages (Houlihan Lokey / Fenwick study medians — SHOULD, not law). Enforceability (the Brazen liquidated-damages framing), the fiduciary-out, and the go-shop/no-shop architecture are legal determinations for counsel; the model computes the fee magnitudes and flags the review.

## 9. Conformance bindings

Requirement `REQ-M212` is verified by 2 published case(s): `CONF.MODEL.LEGAL.TERMINATION.001`, `CONF.MODEL.LEGAL.TERMINATION.002`.

## 10. Version

Reference binding `MODEL.LEGAL.TERMINATION.FEES.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M213 — Earnout architecture and dispute

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G9
**Deal contexts:** earnout

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Structures the earnout — how many metrics gate it, the acceleration triggers, the post-closing covenants, the dispute forum, and the tax-characterization selector — from supplied facts, and routes the binding legal and tax calls to the specialists. It answers, for parties designing contingent consideration, "how is this earnout built and where does it go for review?" It organizes the architecture; it decides no enforceable term or tax treatment.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M213.schema.json`](M213.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `earnout_value_cents` | integer (cents) | MUST | Maximum contingent consideration payable under the earnout. |
| `metrics` | string[] | MUST | The performance metrics that gate the earnout (e.g., EBITDA, revenue). |
| `acceleration_triggers` | string[] | MAY | Events that accelerate the earnout (e.g., change of control, termination without cause). |
| `dispute_forum` | enum(dispute_forum) | MAY | The forum designated to resolve earnout disputes; defaults to the accounting arbitrator. One of `accounting_arbitrator`, `expert_determination`, `arbitration`, `courts`. |
| `post_closing_covenants` | string[] | MAY | Covenants governing the buyer's post-closing operation of the business. |
| `tax_characterization` | enum(tax_characterization) | MAY | The earnout tax-characterization selector; defaults to requires_tax_review. One of `requires_tax_review`, `installment_sale`, `imputed_interest`, `compensation`. |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `earnout_value_cents` | integer (cents) | The earnout value, echoed. |
| `metric_count` | integer | Number of performance metrics. |
| `multiple_metric_earnout` | boolean | Whether more than one metric gates the earnout. |
| `acceleration_trigger_count` | integer | Number of acceleration triggers. |
| `post_closing_covenant_count` | integer | Number of post-closing covenants. |
| `dispute_forum` | enum(dispute_forum) | The designated dispute forum. One of `accounting_arbitrator`, `expert_determination`, `arbitration`, `courts`. |
| `accounting_arbitrator_selected` | boolean | Whether the forum is an accounting arbitrator. |
| `tax_characterization` | enum(tax_characterization) | The tax-characterization selector. One of `requires_tax_review`, `installment_sale`, `imputed_interest`, `compensation`. |
| `counsel_and_tax_handoff_required` | boolean | Always true — binding legal and tax calls route to the specialists. |

## 4. Algorithm

Given `earnout_value_cents` and `metrics`, and optional `acceleration_triggers`, `post_closing_covenants`, `dispute_forum`, `tax_characterization`:
1. If `earnout_value_cents` is missing or `metrics` is empty, the implementation SHALL return `status: "needs_inputs"`.
2. `metric_count` SHALL be the number of metrics; `multiple_metric_earnout` SHALL be true iff more than one.
3. `acceleration_trigger_count` and `post_closing_covenant_count` SHALL be the counts of the supplied lists.
4. `dispute_forum` SHALL default to the accounting arbitrator when not supplied; `accounting_arbitrator_selected` SHALL be true iff the forum names an accounting arbitrator.
5. `tax_characterization` SHALL default to "requires_tax_review"; `counsel_and_tax_handoff_required` SHALL be true — the EBITDA-definition lock and the §453/§483/§1274 characterization route to counsel and the tax advisor.

## 5. Constants & authorities

_No numeric constants — this model computes from supplied facts and cited rule text only (attested: `constants: []`)._


**Authorities**

| Authority | ID | Type |
|---|---|---|
| SRS Acquiom Earnout Data | AUTH-0222 | study/dataset |
| IRC 453 | AUTH-0130 | statute |
| IRC 483 | AUTH-0132 | statute |
| IRC 1274 | AUTH-0109 | statute |
| ABA Earnout Reports | AUTH-0023 | practice-norm |

## 6. Worked example

*A $20M two-metric earnout (EBITDA and revenue) with a change-of-control accelerator routes disputes to an accounting arbitrator and both counsel and tax review.*

**Inputs**

```json
{
  "earnout_value_cents": 2000000000,
  "metrics": [
    "EBITDA",
    "revenue"
  ],
  "acceleration_triggers": [
    "change_of_control"
  ],
  "post_closing_covenants": [
    "operate_in_ordinary_course"
  ]
}
```

**Outputs (executed against the reference implementation `MODEL.LEGAL.EARNOUT_ARCHITECTURE.v1`)**

```json
{
  "earnout_value_cents": 2000000000,
  "metric_count": 2,
  "multiple_metric_earnout": true,
  "acceleration_trigger_count": 1,
  "post_closing_covenant_count": 1,
  "dispute_forum": "accounting_arbitrator",
  "accounting_arbitrator_selected": true,
  "tax_characterization": "requires_tax_review",
  "counsel_and_tax_handoff_required": true
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["earnout_value_cents","metrics"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model structures the earnout — metric count, acceleration triggers, post-closing covenants, dispute forum, tax-characterization selector — from supplied facts. The EBITDA-definition lock, the enforceable covenant set, and the §453/§483/§1274 tax characterization are legal and tax determinations for counsel and the tax advisor; the model organizes the architecture and routes (counsel_and_tax_handoff_required), and selects no binding treatment.

## 9. Conformance bindings

Requirement `REQ-M213` is verified by 2 published case(s): `CONF.MODEL.LEGAL.EARNOUT_ARCH.001`, `CONF.MODEL.LEGAL.EARNOUT_ARCH.002`.

## 10. Version

Reference binding `MODEL.LEGAL.EARNOUT_ARCHITECTURE.v1` · entered the specification at internal lineage stage `v1_1` · spec v1.0.0.


# M214 — IP chain-of-title verification

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G10
**Deal contexts:** IP diligence

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Walks each supplied IP asset's assignment chain and flags the four failure modes that break clean title — a broken or unmatched assignment, a late-recorded assignment, incomplete contributor assignments, and an intent-to-use trademark assigned before an allegation of use. It answers, in IP diligence, "does the target actually own what it says it owns, and where are the gaps?" It spots and counts the issues from supplied chain facts; the ownership and validity conclusions are counsel's.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M214.schema.json`](M214.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `assets` | object[] | MUST | IP assets under diligence; each object carries `name` (string), `type` (string, e.g. patent/trademark/copyright), `assignment_count` (integer), `current_owner_matches` (boolean), `recorded_within_three_months` (boolean), `contributor_assignments_complete` (boolean), and, for trademarks, `itu_assigned_after_allegation_of_use` (boolean). |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `ip_asset_count` | integer | Number of IP assets examined. |
| `patent_asset_count` | integer | Number typed as patents. |
| `trademark_asset_count` | integer | Number typed as trademarks. |
| `copyright_asset_count` | integer | Number typed as copyrights. |
| `assignment_gap_count` | integer | Number with a broken or unmatched assignment chain. |
| `late_recording_count` | integer | Number with an assignment not recorded within three months. |
| `contributor_assignment_gap_count` | integer | Number with incomplete contributor assignments. |
| `itu_assignment_risk_count` | integer | Number of trademarks with intent-to-use assignment risk. |
| `counsel_review_required` | boolean | Whether any asset raises a chain-of-title flag. |
| `chain_rows` | object[] | Per-asset detail: `{ name, type, assignment_count, current_owner_matches, recorded_within_three_months, contributor_assignments_complete, assignment_gap, late_recording_flag, contributor_gap, itu_assignment_risk }`. |

## 4. Algorithm

Given `assets` (a list of IP-asset objects, each carrying a type, an assignment count, and the chain booleans):
1. If `assets` is empty, the implementation SHALL return `status: "needs_inputs"` naming `assets`.
2. For each asset it SHALL set `assignment_gap` true iff the assignment count is not positive OR the current owner does not match; `late_recording_flag` true iff there is at least one assignment but it was not recorded within three months; `contributor_gap` true iff contributor assignments are not complete; and `itu_assignment_risk` true iff the asset is a trademark and an intent-to-use mark was assigned before an allegation of use.
3. It SHALL count assets by type (patent, trademark, copyright) and count each flag across the assets.
4. `counsel_review_required` SHALL be true iff any asset raises any of the four flags.
5. It SHALL return the full per-asset chain detail.

## 5. Constants & authorities

_No numeric constants — this model computes from supplied facts and cited rule text only (attested: `constants: []`)._


**Authorities**

| Authority | ID | Type |
|---|---|---|
| 35 U.S.C. 261 | AUTH-0019 | statute |
| Lanham Act 10 | AUTH-0155 | statute |
| 17 U.S.C. 205 | AUTH-0016 | statute |
| Clorox v. Chemical Bank | AUTH-0051 | case |

## 6. Worked example

*Three IP assets in a software deal: the core patent's chain is clean, the wordmark was recorded late, and the source-code copyrights are missing contributor assignments — two flags plus the trademark route to counsel.*

**Inputs**

```json
{
  "assets": [
    {
      "name": "Core platform patent",
      "type": "patent",
      "assignment_count": 2,
      "current_owner_matches": true,
      "recorded_within_three_months": true,
      "contributor_assignments_complete": true
    },
    {
      "name": "Company wordmark",
      "type": "trademark",
      "assignment_count": 1,
      "current_owner_matches": true,
      "recorded_within_three_months": false,
      "contributor_assignments_complete": true,
      "itu_assigned_after_allegation_of_use": false
    },
    {
      "name": "Product source code",
      "type": "copyright",
      "assignment_count": 1,
      "current_owner_matches": true,
      "recorded_within_three_months": true,
      "contributor_assignments_complete": false
    }
  ]
}
```

**Outputs (executed against the reference implementation `MODEL.IP.CHAIN_OF_TITLE.v1`)**

```json
{
  "ip_asset_count": 3,
  "patent_asset_count": 1,
  "trademark_asset_count": 1,
  "copyright_asset_count": 1,
  "assignment_gap_count": 0,
  "late_recording_count": 1,
  "contributor_assignment_gap_count": 1,
  "itu_assignment_risk_count": 1,
  "counsel_review_required": true,
  "chain_rows": [
    {
      "name": "Core platform patent",
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
      "name": "Company wordmark",
      "type": "trademark",
      "assignment_count": 1,
      "current_owner_matches": true,
      "recorded_within_three_months": false,
      "contributor_assignments_complete": true,
      "assignment_gap": false,
      "late_recording_flag": true,
      "contributor_gap": false,
      "itu_assignment_risk": true
    },
    {
      "name": "Product source code",
      "type": "copyright",
      "assignment_count": 1,
      "current_owner_matches": true,
      "recorded_within_three_months": true,
      "contributor_assignments_complete": false,
      "assignment_gap": false,
      "late_recording_flag": false,
      "contributor_gap": true,
      "itu_assignment_risk": false
    }
  ]
}
```

Precision: All outputs are counts and booleans (see the Conventions chapter); no rounding.

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["assets"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model spots and counts chain-of-title gaps from supplied assignment facts. Whether title in fact passed, whether a late recording is curable, and whether an intent-to-use assignment is void are legal determinations for IP counsel; the model surfaces the gaps and routes them (counsel_review_required) and renders no ownership conclusion.

## 9. Conformance bindings

Requirement `REQ-M214` is verified by 2 published case(s): `CONF.MODEL.IP.CHAIN.001`, `CONF.MODEL.IP.CHAIN.002`.

## 10. Version

Reference binding `MODEL.IP.CHAIN_OF_TITLE.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M215 — IP encumbrance and lien search

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G10
**Deal contexts:** IP diligence · secured financing

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Tallies the hits across the three IP lien-search tracks — UCC financing statements, USPTO patent/trademark security records, and Copyright Office recordations — and flags which hits still need a release before closing. It answers, in secured-financing and acquisition diligence, "is the IP pledged anywhere, and what has to be released to deliver clean collateral?" It counts hits and release requirements from supplied search results; the priority and enforceability conclusions are counsel's.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M215.schema.json`](M215.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `searches` | object[] | MUST | Lien-search results; each object carries `name`/`jurisdiction` (string), `track` (a lien_search_track value), `hit_count` (integer) or `hit_found` (boolean), `release_obtained` (boolean), and `source` (string). |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `search_track_count` | integer | Number of search rows. |
| `ucc_lien_hit_count` | integer | Total UCC-track hits. |
| `uspto_security_hit_count` | integer | Total USPTO-track security hits. |
| `copyright_security_hit_count` | integer | Total Copyright-Office-track hits. |
| `open_lien_count` | integer | Total hits still lacking a release. |
| `release_required_count` | integer | Number of searches whose hits require a release. |
| `pass_through_search_source_required` | boolean | Always true — the search itself is a pass-through record pull. |
| `lien_search_rows` | object[] | Per-search detail: `{ search, track (a lien_search_track value), hit_count, release_obtained, release_required, pass_through_search_source }`. |

## 4. Algorithm

Given `searches` (a list of search-result objects, each with a track, a hit count, and whether a release was obtained):
1. If `searches` is empty, the implementation SHALL return `status: "needs_inputs"` naming `searches`.
2. For each search it SHALL normalize the track to `ucc`, `uspto`, or `copyright` (constants: none — track vocabulary), take the hit count (a boolean hit counting as one), and set `release_required` true iff there is at least one hit and no release was obtained.
3. It SHALL sum hits per track and sum the open (release-required) hits across all searches.
4. `release_required_count` SHALL be the number of searches needing a release; `pass_through_search_source_required` SHALL always be true — the underlying search is a pass-through record pull.
5. It SHALL return the full per-search detail.

## 5. Constants & authorities

_No numeric constants — this model computes from supplied facts and cited rule text only (attested: `constants: []`)._


**Authorities**

| Authority | ID | Type |
|---|---|---|
| UCC Article 9 | AUTH-0253 | statute |
| 17 U.S.C. 205 | AUTH-0016 | statute |
| In re Peregrine | AUTH-0096 | case |
| Rhone-Poulenc Agro v. DeKalb | AUTH-0206 | case |

## 6. Worked example

*Three lien-search tracks: a Delaware UCC financing statement with an open lien needs a release, the USPTO patent-security search is clean, and the Copyright Office hit already has a recorded release.*

**Inputs**

```json
{
  "searches": [
    {
      "name": "DE UCC search",
      "track": "ucc",
      "hit_count": 1,
      "release_obtained": false,
      "source": "CSC"
    },
    {
      "name": "USPTO patent security",
      "track": "uspto",
      "hit_count": 0,
      "source": "USPTO Assignment Search"
    },
    {
      "name": "Copyright Office recordation",
      "track": "copyright",
      "hit_count": 1,
      "release_obtained": true,
      "source": "US Copyright Office"
    }
  ]
}
```

**Outputs (executed against the reference implementation `MODEL.IP.ENCUMBRANCE_LIEN_SEARCH.v1`)**

```json
{
  "search_track_count": 3,
  "ucc_lien_hit_count": 1,
  "uspto_security_hit_count": 0,
  "copyright_security_hit_count": 1,
  "open_lien_count": 1,
  "release_required_count": 1,
  "pass_through_search_source_required": true,
  "lien_search_rows": [
    {
      "search": "DE UCC search",
      "track": "ucc",
      "hit_count": 1,
      "release_obtained": false,
      "release_required": true,
      "pass_through_search_source": "CSC"
    },
    {
      "search": "USPTO patent security",
      "track": "uspto",
      "hit_count": 0,
      "release_obtained": false,
      "release_required": false,
      "pass_through_search_source": "USPTO Assignment Search"
    },
    {
      "search": "Copyright Office recordation",
      "track": "copyright",
      "hit_count": 1,
      "release_obtained": true,
      "release_required": false,
      "pass_through_search_source": "US Copyright Office"
    }
  ]
}
```

Precision: All outputs are counts and booleans (see the Conventions chapter); no rounding.

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["searches"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model tallies IP lien-search hits and release requirements from supplied results. Lien priority, whether a filing in fact encumbers the IP, and whether a release is legally effective are determinations for counsel and the searcher; the model normalizes the hit counts and routes the release requirements and renders no priority opinion.

## 9. Conformance bindings

Requirement `REQ-M215` is verified by 2 published case(s): `CONF.MODEL.IP.LIENS.001`, `CONF.MODEL.IP.LIENS.002`.

## 10. Version

Reference binding `MODEL.IP.ENCUMBRANCE_LIEN_SEARCH.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M216 — License in/out dependency map

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G10
**Deal contexts:** IP diligence

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Maps the target's material in- and out-bound license portfolio — direction, scope, exclusivity, royalty, change-of-control consent and termination, and sublicensing — and flags inbound licenses whose terms make them a deal-critical dependency. It answers, in IP diligence, "which licenses does the business depend on, and which of those could a change of control break?" It captures and flags from supplied license terms; whether a clause is in fact triggered is counsel's call.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M216.schema.json`](M216.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `licenses` | object[] | MUST | Material licenses; each object carries `name` (string), `direction` (a license_direction value), `scope` (string), `exclusive` (boolean), `annual_royalty_cents` (integer cents), `change_of_control_consent_required` (boolean), `terminates_on_change_of_control` (boolean), and `sublicensing_allowed` (boolean). |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `license_count` | integer | Number of licenses mapped. |
| `inbound_license_count` | integer | Number of inbound (taken-in) licenses. |
| `outbound_license_count` | integer | Number of outbound (granted-out) licenses. |
| `annual_royalty_cents` | integer (cents) | Total annual royalty across all licenses. |
| `change_of_control_consent_required_count` | integer | Number requiring change-of-control consent. |
| `terminates_on_change_of_control_count` | integer | Number that terminate on change of control. |
| `material_dependency_count` | integer | Number of inbound licenses flagged deal-critical. |
| `license_rows` | object[] | Per-license detail: `{ name, direction (a license_direction value), scope, exclusive, annual_royalty_cents, change_of_control_consent_required, terminates_on_change_of_control, sublicensing_allowed, material_dependency_flag }`. |

## 4. Algorithm

Given `licenses` (a list of license objects, each with direction, scope, exclusivity, royalty, and the change-of-control/sublicensing booleans):
1. If `licenses` is empty, the implementation SHALL return `status: "needs_inputs"` naming `licenses`.
2. For each license it SHALL normalize direction to `inbound` or `outbound`, take the annual royalty in cents, and set `material_dependency_flag` true iff the license is inbound AND (change-of-control consent is required OR it terminates on change of control OR sublicensing is not allowed).
3. It SHALL count licenses, inbound and outbound licenses, change-of-control-consent and termination licenses, and material dependencies.
4. `annual_royalty_cents` SHALL be the sum of the per-license annual royalties.
5. It SHALL return the full per-license detail.

## 5. Constants & authorities

_No numeric constants — this model computes from supplied facts and cited rule text only (attested: `constants: []`)._


**Authorities**

| Authority | ID | Type |
|---|---|---|
| IP Licensing Industry Practice | AUTH-0102 | practice-norm |

## 6. Worked example

*Two licenses: an inbound database-engine license that requires consent and terminates on change of control is a material dependency; the outbound reseller license is not.*

**Inputs**

```json
{
  "licenses": [
    {
      "name": "Core DB engine license",
      "direction": "inbound",
      "scope": "worldwide",
      "exclusive": false,
      "annual_royalty_cents": 12000000,
      "change_of_control_consent_required": true,
      "terminates_on_change_of_control": true,
      "sublicensing_allowed": false
    },
    {
      "name": "Reseller OEM license",
      "direction": "outbound",
      "scope": "north_america",
      "exclusive": false,
      "annual_royalty_cents": 5000000,
      "sublicensing_allowed": true
    }
  ]
}
```

**Outputs (executed against the reference implementation `MODEL.IP.LICENSE.DEPENDENCY.v1`)**

```json
{
  "license_count": 2,
  "inbound_license_count": 1,
  "outbound_license_count": 1,
  "annual_royalty_cents": 17000000,
  "change_of_control_consent_required_count": 1,
  "terminates_on_change_of_control_count": 1,
  "material_dependency_count": 1,
  "license_rows": [
    {
      "name": "Core DB engine license",
      "direction": "inbound",
      "scope": "worldwide",
      "exclusive": false,
      "annual_royalty_cents": 12000000,
      "change_of_control_consent_required": true,
      "terminates_on_change_of_control": true,
      "sublicensing_allowed": false,
      "material_dependency_flag": true
    },
    {
      "name": "Reseller OEM license",
      "direction": "outbound",
      "scope": "north_america",
      "exclusive": false,
      "annual_royalty_cents": 5000000,
      "change_of_control_consent_required": false,
      "terminates_on_change_of_control": false,
      "sublicensing_allowed": true,
      "material_dependency_flag": false
    }
  ]
}
```

Precision: Royalties are exact integer cents; the rest are counts and booleans (see the Conventions chapter).

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["licenses"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model maps the license portfolio and flags material inbound dependencies from supplied terms. Whether a change-of-control clause is in fact triggered by the deal structure, and how a consent or termination right applies, are determinations for counsel; the model captures the terms and flags the dependencies and renders no enforceability conclusion.

## 9. Conformance bindings

Requirement `REQ-M216` is verified by 2 published case(s): `CONF.MODEL.IP.LICENSES.001`, `CONF.MODEL.IP.LICENSES.002`.

## 10. Version

Reference binding `MODEL.IP.LICENSE.DEPENDENCY.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M217 — Standard IP representation set

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G1, G10
**Deal contexts:** IP purchase agreement

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Assembles the IP representation-and-warranty set a purchase agreement needs, scaling the base reps (ownership, no-encumbrances, sufficiency, registered-IP and license schedules) with patent-, trademark-, and software-specific reps when those categories are material. It answers, for counsel drafting the agreement, "which IP reps and schedules does this deal require given what IP is material?" It builds the checklist; the drafting and the enforceability opinion are counsel's.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M217.schema.json`](M217.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `deal_type` | string | MUST | The transaction type (e.g., asset_purchase, stock_purchase, merger). |
| `material_ip_categories` | string[] | MUST | The IP categories material to the deal (e.g., software, patents, trademarks); drive the category-specific reps. |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `deal_type` | string | The deal type, echoed. |
| `material_ip_category_count` | integer | Number of material IP categories supplied. |
| `representation_count` | integer | Number of representations in the assembled set. |
| `schedule_count` | integer | Number of reps that carry a disclosure schedule. |
| `includes_oss_rep` | boolean | Whether the set includes the OSS-compliance rep. |
| `includes_sufficiency_rep` | boolean | Whether the set includes the IP-sufficiency rep. |
| `enforceability_opinion_pass_through` | boolean | Always true — any enforceability opinion is a pass-through to counsel. |
| `counsel_drafting_required` | boolean | Always true — the reps are drafted by counsel. |
| `representation_set` | string[] | The assembled representation identifiers. |

## 4. Algorithm

Given `deal_type` and `material_ip_categories` (a list of category strings):
1. If `deal_type` is missing or `material_ip_categories` is empty, the implementation SHALL return `status: "needs_inputs"` naming the missing fields.
2. It SHALL detect software (source/code/oss/saas), patent (patent/life-science/device), and trademark (trademark/brand/domain) materiality from the categories.
3. It SHALL start from the five base reps (ownership, no-encumbrances, sufficiency, registered-IP schedule, license schedule) and append a limited-validity patent schedule when patents are material, a trademark/domain schedule when trademarks are material, and OSS-compliance and source-code-control reps when software is material.
4. `representation_count` and `schedule_count` (reps whose name includes "schedule") SHALL be counted; `includes_oss_rep` and `includes_sufficiency_rep` SHALL be reported.
5. `enforceability_opinion_pass_through` and `counsel_drafting_required` SHALL always be true.

## 5. Constants & authorities

_No numeric constants — this model computes from supplied facts and cited rule text only (attested: `constants: []`)._


**Authorities**

| Authority | ID | Type |
|---|---|---|
| ABA Model SPA IP Representations | AUTH-0025 | practice-norm |

## 6. Worked example

*An asset purchase covering software, patents, and trademarks generates a nine-representation IP set with four schedules, including the OSS-compliance and source-code-control reps software deals require.*

**Inputs**

```json
{
  "deal_type": "asset_purchase",
  "material_ip_categories": [
    "software",
    "patents",
    "trademarks"
  ]
}
```

**Outputs (executed against the reference implementation `MODEL.IP.REPRESENTATION_SET.v1`)**

```json
{
  "deal_type": "asset_purchase",
  "material_ip_category_count": 3,
  "representation_count": 9,
  "schedule_count": 4,
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
    "limited_validity_patent_schedule",
    "trademark_domain_schedule",
    "oss_compliance",
    "source_code_control"
  ]
}
```

Precision: All outputs are counts, booleans, and a rep-name list (see the Conventions chapter); no rounding.

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["deal_type","material_ip_categories"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model assembles the IP representation checklist scaled to the material IP categories. The drafting of each representation, the disclosure schedules, and any enforceability or non-infringement opinion are counsel's work; the model produces the checklist and routes the drafting (counsel_drafting_required) and drafts no operative language.

## 9. Conformance bindings

Requirement `REQ-M217` is verified by 2 published case(s): `CONF.MODEL.IP.REPS.001`, `CONF.MODEL.IP.REPS.002`.

## 10. Version

Reference binding `MODEL.IP.REPRESENTATION_SET.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M218 — Carve-out and license-back mechanics

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G10
**Deal contexts:** carve-out · IP license-back

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Organizes the IP disposition map of a carve-out — which assets are assigned to the buyer, which are licensed to the buyer, and which are licensed back to the seller — and flags when a transition license triggers a TSA-IP overlay. It answers, in a carve-out, "who ends up owning or licensing each IP asset, and does the separation need a transition-services IP schedule?" It organizes the dispositions; the drafting is counsel's.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M218.schema.json`](M218.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `ip_assets` | object[] | MUST | Carve-out IP assets; each object carries `asset_name` (string), `disposition` (string, e.g. assigned_to_buyer/licensed_to_buyer/license_back_to_seller), `licensed_back_to_seller` (boolean), and `transition_license_months` (integer). |
| `tsa_ip_overlay_required` | boolean | MAY | Whether a TSA-IP overlay is already required (default false); the model also sets it true on any transition license. |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `asset_count` | integer | Number of IP assets in the carve-out. |
| `assigned_to_buyer_count` | integer | Number assigned outright to the buyer. |
| `licensed_to_buyer_count` | integer | Number licensed to the buyer. |
| `licensed_back_to_seller_count` | integer | Number licensed back to the seller. |
| `transition_license_count` | integer | Number carrying a transition license (positive term). |
| `tsa_ip_overlay_required` | boolean | Whether a transition-services IP overlay is required. |
| `counsel_drafting_handoff_required` | boolean | Always true — the assignment and license documents are drafted by counsel. |
| `asset_rows` | object[] | Per-asset detail: `{ asset_name, disposition, assigned_to_buyer, licensed_to_buyer, licensed_back_to_seller, transition_license_months }`. |

## 4. Algorithm

Given `ip_assets` (a list of asset objects, each with a disposition and an optional transition-license term) and optional `tsa_ip_overlay_required` (default false):
1. If `ip_assets` is empty, the implementation SHALL return `status: "needs_inputs"` naming `ip_assets`.
2. For each asset it SHALL read the disposition (default `assigned_to_buyer`), set `assigned_to_buyer`/`licensed_to_buyer` from it, set `licensed_back_to_seller` from the explicit flag or a `license_back_to_seller` disposition, and take the transition-license months.
3. It SHALL count assets, assigned-to-buyer, licensed-to-buyer, licensed-back-to-seller, and transition-license assets (months > 0).
4. `tsa_ip_overlay_required` SHALL be true iff the input flag is set OR any asset carries a positive transition-license term.
5. `counsel_drafting_handoff_required` SHALL always be true.

## 5. Constants & authorities

_No numeric constants — this model computes from supplied facts and cited rule text only (attested: `constants: []`)._


**Authorities**

| Authority | ID | Type |
|---|---|---|
| IP Carve-Out Practice Norms | AUTH-0101 | practice-norm |

## 6. Worked example

*A carve-out assigning the divested product IP to the buyer with a six-month transition license, licensing shared platform IP, and licensing the parent brand back to the seller — the transition license triggers the TSA-IP overlay.*

**Inputs**

```json
{
  "ip_assets": [
    {
      "asset_name": "Divested product IP",
      "disposition": "assigned_to_buyer",
      "transition_license_months": 6
    },
    {
      "asset_name": "Shared platform IP",
      "disposition": "licensed_to_buyer"
    },
    {
      "asset_name": "Parent brand",
      "disposition": "license_back_to_seller",
      "licensed_back_to_seller": true
    }
  ],
  "tsa_ip_overlay_required": false
}
```

**Outputs (executed against the reference implementation `MODEL.IP.CARVEOUT_LICENSE_BACK.v1`)**

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
      "asset_name": "Divested product IP",
      "disposition": "assigned_to_buyer",
      "assigned_to_buyer": true,
      "licensed_to_buyer": false,
      "licensed_back_to_seller": false,
      "transition_license_months": 6
    },
    {
      "asset_name": "Shared platform IP",
      "disposition": "licensed_to_buyer",
      "assigned_to_buyer": false,
      "licensed_to_buyer": true,
      "licensed_back_to_seller": false,
      "transition_license_months": 0
    },
    {
      "asset_name": "Parent brand",
      "disposition": "license_back_to_seller",
      "assigned_to_buyer": false,
      "licensed_to_buyer": false,
      "licensed_back_to_seller": true,
      "transition_license_months": 0
    }
  ]
}
```

Precision: Outputs are counts, month terms, and booleans (see the Conventions chapter); no rounding.

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["ip_assets"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model organizes the carve-out IP disposition map and flags the TSA-IP overlay from supplied dispositions. The assignment and license agreements, the license-back scope, and the transition-services terms are drafted by counsel; the model organizes the map and routes the drafting (counsel_drafting_handoff_required) and drafts no operative language.

## 9. Conformance bindings

Requirement `REQ-M218` is verified by 2 published case(s): `CONF.MODEL.IP.CARVEOUT_LICENSE_BACK.001`, `CONF.MODEL.IP.CARVEOUT_LICENSE_BACK.002`.

## 10. Version

Reference binding `MODEL.IP.CARVEOUT_LICENSE_BACK.v1` · entered the specification at internal lineage stage `v1_1` · spec v1.0.0.


# M219 — Source-code and IP escrow mechanics

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G10
**Deal contexts:** software M&A

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Structures a source-code escrow — the release triggers, the deposit-verification tier, and the deposit-update cadence — and dates the next deposit from the last one. It answers, in software diligence, "on what events does the code release, how deeply was the deposit verified, and when is the next update due?" It organizes the escrow schedule from supplied facts; the escrow agreement itself is counsel's and the escrow agent's.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M219.schema.json`](M219.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `deposit_verification_tier` | string | MUST | How deeply the deposit was verified (e.g., inventory-only, build-verified, build-and-run-tested). |
| `release_triggers` | string[] | MUST | The events that release the deposit (e.g., bankruptcy, material breach, support discontinuation). |
| `last_deposit_date` | string (ISO date) | MAY | Date of the most recent deposit; drives the next-due date. |
| `update_frequency_months` | integer | MAY | Deposit-update cadence in months (default 3, i.e. quarterly). |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `release_trigger_count` | integer | Number of release triggers. |
| `release_triggers` | string[] | The release triggers, echoed. |
| `deposit_verification_tier` | string | The normalized verification tier. |
| `build_verified` | boolean | Whether the deposit was at least build-verified. |
| `run_tested` | boolean | Whether the deposit was run-tested. |
| `update_frequency_months` | integer | The deposit-update cadence in months. |
| `last_deposit_date` | string (ISO date) | null | The last-deposit date, echoed, or null. |
| `next_deposit_due_date` | string (ISO date) | null | The next deposit due date, or null when no last-deposit date is supplied. |

## 4. Algorithm

Given `release_triggers` (a list of trigger strings) and `deposit_verification_tier`, plus optional `last_deposit_date` and `update_frequency_months` (default 3):
1. If `release_triggers` is empty or `deposit_verification_tier` is missing, the implementation SHALL return `status: "needs_inputs"` naming the missing fields.
2. It SHALL normalize the verification tier to a lower-case token and set `build_verified` iff the tier mentions build/run/tested and `run_tested` iff it mentions run/tested.
3. `release_trigger_count` SHALL be the number of triggers.
4. When a last-deposit date is supplied, `next_deposit_due_date` SHALL be that date advanced by the update frequency in months; otherwise null.
5. It SHALL echo the triggers, the normalized tier, the update frequency, and the last-deposit date.

## 5. Constants & authorities

_No numeric constants — this model computes from supplied facts and cited rule text only (attested: `constants: []`)._


**Authorities**

| Authority | ID | Type |
|---|---|---|
| Escode | AUTH-0068 | practice-norm |
| Codekeeper | AUTH-0052 | practice-norm |
| Iron Mountain Escrow Templates | AUTH-0145 | practice-norm |

## 6. Worked example

*A source-code escrow with three release triggers, verified at the build-and-run-tested tier, with quarterly deposits — the January 15 deposit sets the next due date at April 15.*

**Inputs**

```json
{
  "release_triggers": [
    "bankruptcy",
    "material_breach",
    "support_discontinuation"
  ],
  "deposit_verification_tier": "build and run tested",
  "last_deposit_date": "2026-01-15",
  "update_frequency_months": 3
}
```

**Outputs (executed against the reference implementation `MODEL.IP.SOURCE_CODE_ESCROW.v1`)**

```json
{
  "release_trigger_count": 3,
  "release_triggers": [
    "bankruptcy",
    "material_breach",
    "support_discontinuation"
  ],
  "deposit_verification_tier": "build_and_run_tested",
  "build_verified": true,
  "run_tested": true,
  "update_frequency_months": 3,
  "last_deposit_date": "2026-01-15",
  "next_deposit_due_date": "2026-04-15"
}
```

Precision: The update cadence is whole months; dates are ISO-8601 (see the Conventions chapter).

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["release_triggers","deposit_verification_tier"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model structures the source-code escrow schedule from supplied triggers, tier, and cadence. The enforceability of the release conditions, the adequacy of the verification, and the escrow-agreement terms are for counsel and the escrow agent; the model organizes the schedule and dates the next deposit and renders no enforceability conclusion.

## 9. Conformance bindings

Requirement `REQ-M219` is verified by 2 published case(s): `CONF.MODEL.IP.ESCROW.001`, `CONF.MODEL.IP.ESCROW.002`.

## 10. Version

Reference binding `MODEL.IP.SOURCE_CODE_ESCROW.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M220 — Employee IP assignment verification

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G10
**Deal contexts:** IP diligence

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Verifies, contributor by contributor, that every person who touched the IP executed an assignment and a work-for-hire, and flags California §2870 outside-scope carve-outs and any missing paper. It answers, in IP diligence, "is the IP actually assigned in from everyone who built it, and where are the enforceability wrinkles?" It counts and flags from supplied contributor facts; the enforceability conclusion, including the §2870 carve-out, is counsel's.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M220.schema.json`](M220.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `contributors` | object[] | MUST | IP contributors; each object carries `name` (string), `role` (string), `state`/`work_state` (US state code), `ip_assignment_executed` (boolean), `work_for_hire_executed` (boolean), and `outside_scope_invention` (boolean). |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `contributor_count` | integer | Number of contributors verified. |
| `executed_assignment_count` | integer | Number with an executed IP assignment. |
| `missing_assignment_count` | integer | Number missing an IP assignment. |
| `missing_work_for_hire_count` | integer | Number missing a work-for-hire. |
| `california_2870_carveout_count` | integer | Number with a California §2870 outside-scope carve-out flag. |
| `all_contributors_papered` | boolean | Whether every contributor has both the assignment and the work-for-hire. |
| `counsel_review_required` | boolean | Whether any contributor raises a gap or §2870 flag. |
| `contributor_rows` | object[] | Per-contributor detail: `{ contributor, role, state, ip_assignment_executed, work_for_hire_executed, missing_assignment, missing_work_for_hire, california_2870_carveout_flag }`. |

## 4. Algorithm

Given `contributors` (a list of contributor objects, each with a state and the assignment/work-for-hire booleans):
1. If `contributors` is empty, the implementation SHALL return `status: "needs_inputs"` naming `contributors`.
2. For each contributor it SHALL set `missing_assignment` iff no IP assignment was executed, `missing_work_for_hire` iff no work-for-hire was executed, and `california_2870_carveout_flag` iff the work state is CA and the contributor claims an outside-scope invention (constants: California Labor Code § 2870).
3. It SHALL count contributors, executed assignments, missing assignments, missing work-for-hires, and California §2870 carve-outs.
4. `all_contributors_papered` SHALL be true iff no contributor is missing either the assignment or the work-for-hire.
5. `counsel_review_required` SHALL be true iff any contributor has a missing assignment, a missing work-for-hire, or a §2870 carve-out flag.

## 5. Constants & authorities

| Constant | Value | Strength | Authority | Pin-cite | Effective | Next check |
|---|---|---|---|---|---|---|
| California Labor Code § 2870 | employee inventions developed entirely on own time without employer resources and unrelated to employer business are not assignable | MUST (binding) | Cal. Lab. Code § 2870 | § 2870(a) | current (Cal. Lab. Code as amended) | on statutory amendment |


**Authorities**

| Authority | ID | Type |
|---|---|---|
| California Labor Code 2870 | AUTH-0046 | statute |
| State Employee-IP Statutes | AUTH-0226 | statute |

## 6. Worked example

*Three contributors: one California engineer fully papered, a California contractor missing both the assignment and the work-for-hire with a §2870 outside-scope flag, and a New York designer missing the work-for-hire — one §2870 carve-out and open assignments route to counsel.*

**Inputs**

```json
{
  "contributors": [
    {
      "name": "Engineer A",
      "role": "senior_engineer",
      "state": "CA",
      "ip_assignment_executed": true,
      "work_for_hire_executed": true,
      "outside_scope_invention": false
    },
    {
      "name": "Engineer B",
      "role": "contractor",
      "state": "CA",
      "ip_assignment_executed": false,
      "work_for_hire_executed": false,
      "outside_scope_invention": true
    },
    {
      "name": "Designer C",
      "role": "designer",
      "state": "NY",
      "ip_assignment_executed": true,
      "work_for_hire_executed": false
    }
  ]
}
```

**Outputs (executed against the reference implementation `MODEL.IP.EMPLOYEE_ASSIGNMENT.VERIFICATION.v1`)**

```json
{
  "contributor_count": 3,
  "executed_assignment_count": 2,
  "missing_assignment_count": 1,
  "missing_work_for_hire_count": 2,
  "california_2870_carveout_count": 1,
  "all_contributors_papered": false,
  "counsel_review_required": true,
  "contributor_rows": [
    {
      "contributor": "Engineer A",
      "role": "senior_engineer",
      "state": "CA",
      "ip_assignment_executed": true,
      "work_for_hire_executed": true,
      "missing_assignment": false,
      "missing_work_for_hire": false,
      "california_2870_carveout_flag": false
    },
    {
      "contributor": "Engineer B",
      "role": "contractor",
      "state": "CA",
      "ip_assignment_executed": false,
      "work_for_hire_executed": false,
      "missing_assignment": true,
      "missing_work_for_hire": true,
      "california_2870_carveout_flag": true
    },
    {
      "contributor": "Designer C",
      "role": "designer",
      "state": "NY",
      "ip_assignment_executed": true,
      "work_for_hire_executed": false,
      "missing_assignment": false,
      "missing_work_for_hire": true,
      "california_2870_carveout_flag": false
    }
  ]
}
```

Precision: All outputs are counts and booleans (see the Conventions chapter); no rounding.

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["contributors"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model verifies contributor IP assignments and flags §2870 carve-outs from supplied facts. Whether an assignment is enforceable, whether the §2870 carve-out in fact applies, and whether a work-for-hire is valid for the work type are legal determinations for counsel; the model counts the gaps and routes them (counsel_review_required) and renders no enforceability conclusion.

## 9. Conformance bindings

Requirement `REQ-M220` is verified by 2 published case(s): `CONF.MODEL.IP.EMPLOYEE_ASSIGN.001`, `CONF.MODEL.IP.EMPLOYEE_ASSIGN.002`.

## 10. Version

Reference binding `MODEL.IP.EMPLOYEE_ASSIGNMENT.VERIFICATION.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M221 — OSS exposure diligence process

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G10
**Deal contexts:** software M&A · OSS diligence

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Classifies each open-source component by copyleft strength (permissive, weak, strong, unknown), flags AGPL components used over a network and strong-copyleft code linked into proprietary software, and sizes the special escrow from supplied remediation costs. It answers, in software diligence, "what OSS obligations does this codebase carry, and where is the copyleft exposure?" It classifies and sizes from a supplied component list; the copyleft-trigger opinion is IP counsel's.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M221.schema.json`](M221.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `components` | object[] | MUST | OSS components; each object carries `name` (string), `license` (string, e.g. MIT/LGPL-2.1/AGPL-3.0), `network_use` (boolean), `proprietary_linking` (boolean), and `remediation_cost_cents` (integer cents). |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `component_count` | integer | Number of OSS components. |
| `permissive_count` | integer | Number classified permissive. |
| `weak_copyleft_count` | integer | Number classified weak copyleft. |
| `strong_copyleft_count` | integer | Number classified strong copyleft. |
| `unknown_license_count` | integer | Number whose license could not be classified. |
| `agpl_network_count` | integer | Number of AGPL components used over a network. |
| `proprietary_strong_copyleft_count` | integer | Number of strong-copyleft components linked into proprietary code. |
| `oss_specific_rep_required` | boolean | Always true — an OSS-specific representation is required. |
| `indemnity_carveout_review_required` | boolean | Whether any strong-copyleft or unknown component warrants an indemnity carve-out review. |
| `special_escrow_sizing_cents` | integer (cents) | Sum of supplied remediation costs for special escrow sizing. |
| `sca_pass_through_source_required` | boolean | Always true — the software-composition-analysis scan is a pass-through source. |
| `oss_rows` | object[] | Per-component detail: `{ component, license, license_class (an oss_license_class value), network_use, proprietary_linking, agpl_network_flag, strong_copyleft_embedded_flag, remediation_cost_cents }`. |

## 4. Algorithm

Given `components` (a list of component objects, each with a license and use booleans):
1. If `components` is empty, the implementation SHALL return `status: "needs_inputs"` naming `components`.
2. For each component it SHALL classify the license into `permissive`, `weak_copyleft`, `strong_copyleft`, or `unknown` (constants: OSS license classification), set `agpl_network_flag` iff the license is AGPL and used over a network, and set `strong_copyleft_embedded_flag` iff a strong-copyleft component is linked into proprietary code.
3. It SHALL count components in each class, AGPL-network components, and proprietary-strong-copyleft components.
4. `special_escrow_sizing_cents` SHALL be the sum of the supplied per-component remediation costs.
5. `oss_specific_rep_required`, `sca_pass_through_source_required` SHALL always be true; `indemnity_carveout_review_required` SHALL be true iff any component is strong-copyleft or unknown.

## 5. Constants & authorities

_No numeric constants — this model computes from supplied facts and cited rule text only (attested: `constants: []`)._


**Authorities**

| Authority | ID | Type |
|---|---|---|
| GPL | AUTH-0088 | practice-or-guidance |
| AGPL | AUTH-0028 | practice-or-guidance |
| LGPL | AUTH-0159 | practice-or-guidance |
| MIT | AUTH-0172 | practice-or-guidance |
| Apache | AUTH-0034 | practice-or-guidance |
| BSD | AUTH-0041 | practice-or-guidance |
| Morgan Lewis OSS Guidance | AUTH-0175 | practice-norm |
| Nixon Peabody OSS Guidance | AUTH-0184 | practice-norm |
| Morse OSS Guidance | AUTH-0176 | practice-norm |

## 6. Worked example

*Three OSS components: a permissive MIT library, a weak-copyleft LGPL library linked into proprietary code, and an AGPL analytics package used over the network — the AGPL network flag and a $250k remediation reserve drive an indemnity carve-out review.*

**Inputs**

```json
{
  "components": [
    {
      "name": "libfoo",
      "license": "MIT"
    },
    {
      "name": "barlib",
      "license": "LGPL-2.1",
      "proprietary_linking": true
    },
    {
      "name": "analytics",
      "license": "AGPL-3.0",
      "network_use": true,
      "remediation_cost_cents": 25000000
    }
  ]
}
```

**Outputs (executed against the reference implementation `MODEL.IP.OSS.EXPOSURE.v1`)**

```json
{
  "component_count": 3,
  "permissive_count": 1,
  "weak_copyleft_count": 1,
  "strong_copyleft_count": 1,
  "unknown_license_count": 0,
  "agpl_network_count": 1,
  "proprietary_strong_copyleft_count": 0,
  "oss_specific_rep_required": true,
  "indemnity_carveout_review_required": true,
  "special_escrow_sizing_cents": 25000000,
  "sca_pass_through_source_required": true,
  "oss_rows": [
    {
      "component": "libfoo",
      "license": "mit",
      "license_class": "permissive",
      "network_use": false,
      "proprietary_linking": false,
      "agpl_network_flag": false,
      "strong_copyleft_embedded_flag": false,
      "remediation_cost_cents": 0
    },
    {
      "component": "barlib",
      "license": "lgpl-2.1",
      "license_class": "weak_copyleft",
      "network_use": false,
      "proprietary_linking": true,
      "agpl_network_flag": false,
      "strong_copyleft_embedded_flag": false,
      "remediation_cost_cents": 0
    },
    {
      "component": "analytics",
      "license": "agpl-3.0",
      "license_class": "strong_copyleft",
      "network_use": true,
      "proprietary_linking": false,
      "agpl_network_flag": true,
      "strong_copyleft_embedded_flag": false,
      "remediation_cost_cents": 25000000
    }
  ]
}
```

Precision: Escrow sizing is exact integer cents; the rest are counts and booleans (see the Conventions chapter).

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["components"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model classifies OSS copyleft exposure and sizes the escrow from supplied component facts. Whether a copyleft obligation is in fact triggered by the way the code is combined and distributed, and the remediation required, are determinations for IP counsel; the model classifies the components and routes the review (indemnity_carveout_review_required) and renders no copyleft-trigger opinion.

## 9. Conformance bindings

Requirement `REQ-M221` is verified by 2 published case(s): `CONF.MODEL.IP.OSS.001`, `CONF.MODEL.IP.OSS.002`.

## 10. Version

Reference binding `MODEL.IP.OSS.EXPOSURE.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M222 — IP-specific 1060 allocation

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G2, G10
**Deal contexts:** IP-heavy acquisition

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Allocates an IP-heavy asset-deal purchase price down the residual-method class ordering — Class V tangible, then Class VI §197 intangibles (the IP), then Class VII goodwill — capping each class at its supplied value and dropping the residual into goodwill. It answers, for a buyer and seller papering an IP-heavy asset purchase, "how does the price split across the tangible, IP-intangible, and goodwill classes for the buyer's amortization and the parties' Form 8594?" It allocates from supplied values; the values and classifications are the advisors' calls.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M222.schema.json`](M222.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `ip_intangibles_cents` | integer (cents) | MUST | Class VI §197 IP-intangible value. |
| `purchase_price_cents` | integer (cents) | MUST | Total consideration to be allocated. |
| `tangible_assets_cents` | integer (cents) | MUST | Class V tangible/§1231 asset value. |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `purchase_price_cents` | integer (cents) | The price allocated, echoed. |
| `class_v_tangible_assets_cents` | integer (cents) | Amount allocated to Class V tangible assets. |
| `class_vi_ip_section_197_intangibles_cents` | integer (cents) | Amount allocated to Class VI §197 IP intangibles. |
| `class_vii_goodwill_going_concern_cents` | integer (cents) | Residual allocated to Class VII goodwill and going-concern value. |
| `ip_value_excess_over_purchase_price_cents` | integer (cents) | IP value that exceeds the price available after Class V (normally zero). |
| `form_8594_reconciliation_total_cents` | integer (cents) | Sum of the three classes (should reconcile to the price). |

## 4. Algorithm

Given `purchase_price_cents`, `tangible_assets_cents` (Class V), and `ip_intangibles_cents` (Class VI §197 intangibles):
1. If any of the three is missing, the implementation SHALL return `status: "needs_inputs"` naming the missing fields.
2. Following the residual-method ordering (constants: §1060 residual-method class ordering), `class_v_tangible_assets_cents` SHALL be `min(purchase_price_cents, tangible_assets_cents)`.
3. The remainder after Class V SHALL be `max(0, purchase_price_cents − class_v)`; `class_vi_ip_section_197_intangibles_cents` SHALL be `min(remainder, ip_intangibles_cents)`.
4. `class_vii_goodwill_going_concern_cents` SHALL be the residual `max(0, purchase_price_cents − class_v − class_vi)`.
5. `ip_value_excess_over_purchase_price_cents` SHALL be `max(0, ip_intangibles_cents − remainder)` (IP value that does not fit under the price); `form_8594_reconciliation_total_cents` SHALL be the sum of the three classes.

## 5. Constants & authorities

| Constant | Value | Strength | Authority | Pin-cite | Effective | Next check |
|---|---|---|---|---|---|---|
| §1060 residual-method class ordering | Class V (tangible/§1231) → Class VI (§197 intangibles ex-goodwill, incl. IP) → Class VII (goodwill and going-concern value) | table (jurisdictional) | Treas. Reg. § 1.1060-1(c); § 1.338-6(b) | § 1.338-6(b)(2) (residual-method ordering) | current (Treas. Reg. as amended) | on Treasury amendment |


**Authorities**

| Authority | ID | Type |
|---|---|---|
| IRC 1060 | AUTH-0106 | statute |
| Treas. Reg. 1.338-6 | AUTH-0242 | regulation |
| Treas. Reg. 1.1060-1 | AUTH-0239 | regulation |
| IRS Form 8594 | AUTH-0149 | form |

## 6. Worked example

*A $50M IP-heavy asset deal with $8M of tangible assets and $30M of identified IP intangibles allocates $8M to Class V, $30M to Class VI, and the $12M residual to Class VII goodwill.*

**Inputs**

```json
{
  "purchase_price_cents": 5000000000,
  "tangible_assets_cents": 800000000,
  "ip_intangibles_cents": 3000000000
}
```

**Outputs (executed against the reference implementation `MODEL.IP.1060.ALLOCATION.v1`)**

```json
{
  "purchase_price_cents": 5000000000,
  "class_v_tangible_assets_cents": 800000000,
  "class_vi_ip_section_197_intangibles_cents": 3000000000,
  "class_vii_goodwill_going_concern_cents": 1200000000,
  "ip_value_excess_over_purchase_price_cents": 0,
  "form_8594_reconciliation_total_cents": 5000000000
}
```

Precision: All allocations are exact integer cents (see the Conventions chapter); no rounding.

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["purchase_price_cents","tangible_assets_cents","ip_intangibles_cents"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model computes the Class V/VI/VII residual allocation for an IP-heavy deal from supplied values. Whether an asset belongs in a given class, whether the supplied fair market values are supportable, and the binding Form 8594 positions are determinations for the parties' tax advisors; the model computes the allocation the supplied values imply and renders no valuation or classification opinion.

## 9. Conformance bindings

Requirement `REQ-M222` is verified by 2 published case(s): `CONF.MODEL.IP.1060.001`, `CONF.MODEL.IP.1060.002`.

## 10. Version

Reference binding `MODEL.IP.1060.ALLOCATION.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M223 — Domain and trademark transfer mechanics

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G10
**Deal contexts:** domain transfer · trademark transfer

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Builds the transfer task list for domains, trademarks, social handles, and SSL certificates — registrar auth codes and transfer locks for domains, USPTO and state assignment recordings for trademarks, handle transfers, and certificate reissuance — and counts what each asset type needs. It answers, at closing of a deal with digital assets, "what are the concrete steps to move each domain, mark, and handle, and which domains are still locked?" It sequences the mechanical steps from supplied asset facts.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M223.schema.json`](M223.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `transfer_assets` | object[] | MUST | Digital/brand assets to transfer; each object carries `name` (string), `type` (string, e.g. domain/trademark/social/ssl), `transfer_lock_days_remaining` (integer), `state_registered` (boolean), and `ssl_certificate_attached` (boolean). |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `transfer_asset_count` | integer | Number of transfer assets. |
| `domain_count` | integer | Number of domains. |
| `trademark_count` | integer | Number of trademarks. |
| `auth_code_required_count` | integer | Number of assets needing a registrar auth code. |
| `locked_domain_count` | integer | Number of domains still within a transfer lock. |
| `uspto_assignment_recording_count` | integer | Number needing USPTO assignment recording. |
| `state_assignment_required_count` | integer | Number needing a state trademark assignment. |
| `social_handle_transfer_count` | integer | Number of social handles to transfer. |
| `ssl_reissue_count` | integer | Number of SSL certificates to reissue. |
| `transfer_rows` | object[] | Per-asset detail: `{ name, type, auth_code_required, transfer_lock_days_remaining, uspto_assignment_recording_required, state_assignment_required, social_handle_transfer_required, ssl_reissue_required }`. |

## 4. Algorithm

Given `transfer_assets` (a list of asset objects, each with a type and transfer facts):
1. If `transfer_assets` is empty, the implementation SHALL return `status: "needs_inputs"` naming `transfer_assets`.
2. For each asset it SHALL set `auth_code_required` iff it is a domain, `uspto_assignment_recording_required` iff it is a trademark, `state_assignment_required` from the state-registered flag, `social_handle_transfer_required` iff it is a social handle, and `ssl_reissue_required` iff it is an SSL asset or a certificate is attached; it SHALL take the transfer-lock days remaining (the ICANN 60-day post-transfer lock is the governing window).
3. It SHALL count assets, domains, trademarks, auth-code-required assets, locked domains (lock days > 0), USPTO recordings, state assignments, social-handle transfers, and SSL reissuances.
4. It SHALL return the full per-asset transfer detail.

## 5. Constants & authorities

_No numeric constants — this model computes from supplied facts and cited rule text only (attested: `constants: []`)._


**Authorities**

| Authority | ID | Type |
|---|---|---|
| ICANN Transfer Rules | AUTH-0093 | practice-norm |
| USPTO Form PTO-1594 | AUTH-0258 | form |

## 6. Worked example

*Four transfer assets: a domain still 15 days inside its ICANN transfer lock needs an auth code, a state-registered trademark needs USPTO and state assignment recording, a social handle needs manual transfer, and an SSL certificate needs reissuance.*

**Inputs**

```json
{
  "transfer_assets": [
    {
      "name": "example.com",
      "type": "domain",
      "transfer_lock_days_remaining": 15
    },
    {
      "name": "Company wordmark",
      "type": "trademark",
      "state_registered": true
    },
    {
      "name": "@company",
      "type": "social_handle"
    },
    {
      "name": "wildcard SSL",
      "type": "ssl"
    }
  ]
}
```

**Outputs (executed against the reference implementation `MODEL.IP.DOMAIN_TM.TRANSFER.v1`)**

```json
{
  "transfer_asset_count": 4,
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
      "transfer_lock_days_remaining": 15,
      "uspto_assignment_recording_required": false,
      "state_assignment_required": false,
      "social_handle_transfer_required": false,
      "ssl_reissue_required": false
    },
    {
      "name": "Company wordmark",
      "type": "trademark",
      "auth_code_required": false,
      "transfer_lock_days_remaining": 0,
      "uspto_assignment_recording_required": true,
      "state_assignment_required": true,
      "social_handle_transfer_required": false,
      "ssl_reissue_required": false
    },
    {
      "name": "@company",
      "type": "social_handle",
      "auth_code_required": false,
      "transfer_lock_days_remaining": 0,
      "uspto_assignment_recording_required": false,
      "state_assignment_required": false,
      "social_handle_transfer_required": true,
      "ssl_reissue_required": false
    },
    {
      "name": "wildcard SSL",
      "type": "ssl",
      "auth_code_required": false,
      "transfer_lock_days_remaining": 0,
      "uspto_assignment_recording_required": false,
      "state_assignment_required": false,
      "social_handle_transfer_required": false,
      "ssl_reissue_required": true
    }
  ]
}
```

Precision: All outputs are counts and day terms (see the Conventions chapter); no rounding.

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["transfer_assets"]`. No partial outputs are emitted.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model sequences the mechanical transfer steps for domains, marks, handles, and certificates from supplied asset facts. Whether a trademark assignment is valid without the associated goodwill, and the enforceability of any transfer, are legal determinations for counsel; the model builds the task list and the counts and renders no validity conclusion.

## 9. Conformance bindings

Requirement `REQ-M223` is verified by 2 published case(s): `CONF.MODEL.IP.DOMAIN_TM.001`, `CONF.MODEL.IP.DOMAIN_TM.002`.

## 10. Version

Reference binding `MODEL.IP.DOMAIN_TM.TRANSFER.v1` · entered the specification at internal lineage stage `v1_0_core` · spec v1.0.0.


# M224 — Recording-act and priority engine

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G30
**Deal contexts:** real estate M&A · title diligence

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Orders the priority of competing real-property interests by applying the recording act of the situs state to the supplied value, notice, and recording-order facts. It answers, in title diligence, "on these facts, does the later purchaser or the prior interest prevail?" — the deterministic core beneath a title read. Anchor states are encoded as data (DE/LA/NC pure race, NY/CA race-notice, TX notice); an untabled state defers rather than guessing.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M224.schema.json`](M224.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `later_purchaser_for_value` | boolean | MUST | Whether the later-in-time purchaser gave value (a threshold for bona-fide-purchaser protection in every act). |
| `later_recorded_first` | boolean | MUST | Whether the later purchaser recorded before the prior interest (decisive in race and race-notice states). |
| `later_took_without_notice` | boolean | MUST | Whether the later purchaser took without actual or constructive notice of the prior interest (decisive in notice and race-notice states). |
| `state` | string (US state code) | MUST | Two-letter code of the situs state, used to select the recording act. |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `state` | string (US state code) | The situs state, echoed. |
| `act_type` | enum(recording_act_type) | The recording-act family applied. One of `race`, `notice`, `race_notice`, `unknown`. |
| `citation` | string | The statutory citation for the state's recording act. |
| `prevailing_interest` | enum(prevailing_interest) | Which competing interest the act favors on the facts. One of `later_purchaser`, `prior_interest`, `undetermined`. |
| `bfp_protected` | boolean | Whether the later purchaser takes free of the prior interest as a protected bona-fide purchaser. |
| `defer_to_counsel` | boolean | True only when the state is untabled; the ordering then defers. |
| `red_flags` | string[] | Priority-hygiene warnings (unrecorded interests; race-state notice anomaly). |

## 4. Algorithm

Given `state`, `later_purchaser_for_value`, `later_took_without_notice`, and `later_recorded_first`:
1. The implementation SHALL upper-case `state` and require all four inputs; a missing one yields `status: "needs_inputs"`.
2. It SHALL look up the state's recording-act type (constants: recording-act table). If the state is absent, it SHALL emit `act_type: "unknown"`, `prevailing_interest: "undetermined"`, `defer_to_counsel: true`, a table-gap red flag, and SHALL NOT order priority.
3. It SHALL compute whether the later purchaser prevails: for a race state, iff `later_purchaser_for_value AND later_recorded_first`; for a notice state, iff `later_purchaser_for_value AND later_took_without_notice`; for a race-notice state, iff `later_purchaser_for_value AND later_took_without_notice AND later_recorded_first`.
4. `prevailing_interest` SHALL be `later_purchaser` when that holds, else `prior_interest`; `bfp_protected` SHALL equal that boolean.
5. It SHALL raise a red flag if neither interest is recorded, and (race states) if the later purchaser prevails despite actual notice.

## 5. Constants & authorities

| Constant | Value | Strength | Authority | Pin-cite | Effective | Next check |
|---|---|---|---|---|---|---|
| DE recording act | pure race | table (jurisdictional) | 25 Del. C. § 153 | § 153 | — | on state-table review |
| NC recording act | pure race | table (jurisdictional) | N.C. Gen. Stat. § 47-18 | § 47-18 | — | — |
| LA recording act | pure race | table (jurisdictional) | La. Civ. Code arts. 3338–3340 | public-records doctrine | — | — |
| NY recording act | race-notice | table (jurisdictional) | N.Y. Real Prop. Law § 291 | § 291 | — | — |
| CA recording act | race-notice | table (jurisdictional) | Cal. Civ. Code § 1214 | § 1214 | — | — |
| TX recording act | notice | table (jurisdictional) | Tex. Prop. Code § 13.001 | § 13.001 | — | — |


**Authorities**

| Authority | ID | Type |
|---|---|---|
| N.Y. Real Prop. Law 291 | AUTH-0180 | statute |
| Cal. Civ. Code 1214 | AUTH-0043 | statute |
| Tex. Prop. Code 13.001 | AUTH-0231 | statute |
| 25 Del. C. 153 | AUTH-0018 | statute |

## 6. Worked example

*A California buyer records first but took with notice of a prior unrecorded deed; in a race-notice state, recording first does not rescue a purchaser who knew, so the prior interest prevails.*

**Inputs**

```json
{
  "state": "CA",
  "later_purchaser_for_value": true,
  "later_took_without_notice": false,
  "later_recorded_first": true
}
```

**Outputs (executed against the reference implementation `MODEL.RE.RECORDING_PRIORITY.v1`)**

```json
{
  "state": "CA",
  "act_type": "race_notice",
  "citation": "Cal. Civ. Code § 1214",
  "prevailing_interest": "prior_interest",
  "bfp_protected": false,
  "defer_to_counsel": false,
  "red_flags": []
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["state","later_purchaser_for_value","later_took_without_notice","later_recorded_first"]`. No partial outputs are emitted.
- **Specialist boundary:** outputs include `defer_to_counsel` (boolean) and, when true, `counsel_handoff` (string) — a conforming implementation MUST surface the routing and MUST NOT convert it into an answer.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model orders recording priority by applying the state's recording act to supplied notice, value, and recording facts. It does not adjudicate who in fact holds title, whether a conveyance is valid, or whether a party had constructive notice — those are determinations for title counsel and the title insurer. For a state absent from the recording-act table it emits a table-gap flag and routes, never a guessed ordering.

## 9. Conformance bindings

Requirement `REQ-M224` is verified by 25 published case(s): `CONF.MODEL.RE.V18C.RECORDING.001`, `CONF.MODEL.RE.V18C.RECORDING.002`, `CONF.MODEL.RE.V18C.RECORDING.003`, `CONF.MODEL.RE.V18C.RECORDING.004`, `CONF.MODEL.RE.V18C.RECORDING.005`, `CONF.MODEL.RE.V18C.RECORDING.006`, `CONF.MODEL.RE.V18C.RECORDING.007`, `CONF.MODEL.RE.V18C.RECORDING.008`, `CONF.MODEL.RE.V18C.RECORDING.009`, `CONF.MODEL.RE.V18C.RECORDING.010`, `CONF.MODEL.RE.V18C.RECORDING.011`, `CONF.MODEL.RE.V18C.RECORDING.012`, `CONF.MODEL.RE.V18C.RECORDING.013`, `CONF.MODEL.RE.V18C.RECORDING.014`, `CONF.MODEL.RE.V18C.RECORDING.015`, `CONF.MODEL.RE.V18C.RECORDING.016`, `CONF.MODEL.RE.V18C.RECORDING.017`, `CONF.MODEL.RE.V18C.RECORDING.018`, `CONF.MODEL.RE.V18C.RECORDING.019`, `CONF.MODEL.RE.V18C.RECORDING.020`, `CONF.MODEL.RE.V18C.RECORDING.021`, `CONF.MODEL.RE.V18C.RECORDING.022`, `CONF.MODEL.RE.V18C.RECORDING.023`, `CONF.MODEL.RE.V18C.RECORDING.024`, `CONF.MODEL.RE.V18C.RECORDING.025`.

## 10. Version

Reference binding `MODEL.RE.RECORDING_PRIORITY.v1` · entered the specification at internal lineage stage `v1_2` · spec v1.0.0.


# M225 — Title-covenant and estate/signatory model

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G30
**Deal contexts:** real estate M&A · title diligence

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Maps a deed type to the title covenants it conveys and a vesting form to the parties whose signatures a conveyance of the whole requires, surfacing warranty gaps and missed-signatory risk. It answers, in title diligence and closing preparation, "what protection does this deed give the buyer, and who has to sign for title to actually pass?" Deed-to-covenant and vesting-to-signatory relations are encoded as data, with the Texas seisin narrowing attached where relevant.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M225.schema.json`](M225.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `deed_type` | enum(deed_type) | MUST | The deed instrument type being conveyed. One of `general_warranty`, `special_warranty`, `bargain_and_sale`, `quitclaim`. |
| `vesting_form` | enum(vesting_form) | MUST | How record title is held. One of `sole`, `tenancy_in_common`, `joint_tenancy`, `tenancy_by_entirety`, `community_property`, `entity`. |
| `all_required_signers_present` | boolean | MAY | Whether every party the vesting form requires is on the signature page; explicit false raises a signatory gap. |
| `buyer_expects_warranty` | boolean | MAY | Whether the buyer is negotiating for title warranties (default true); drives the warranty-gap flag. |
| `state` | string (US state code) | MAY | Optional situs state; enables the Texas seisin-narrowing note. |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `deed_type` | enum(deed_type) | The deed type, echoed. One of `general_warranty`, `special_warranty`, `bargain_and_sale`, `quitclaim`. |
| `covenants_present` | string[] | The title covenants this deed conveys (empty for bargain-and-sale and quitclaim). |
| `covenant_scope` | string | Whether covenants reach all defects or only the grantor's own acts, or none. |
| `after_acquired_title_applies` | boolean | Whether estoppel-by-deed vests later-acquired title in the grantee. |
| `deed_note` | string | Plain-language description of the deed's covenant coverage. |
| `tx_seisin_note` | string | null | The Texas seisin-narrowing note when the state is TX, else null. |
| `vesting_form` | enum(vesting_form) | The vesting form, echoed. One of `sole`, `tenancy_in_common`, `joint_tenancy`, `tenancy_by_entirety`, `community_property`, `entity`. |
| `required_signatories` | string | Who must sign for a conveyance of the whole. |
| `signatory_gap` | boolean | Whether a required signatory is missing. |
| `defer_to_counsel` | boolean | True on a signatory gap; the joinder question routes to counsel. |
| `counsel_handoff` | string | null | The routing sentence when a signatory gap defers, else null. |
| `red_flags` | string[] | Warranty-gap and signatory-gap warnings. |

## 4. Algorithm

Given `deed_type` and `vesting_form` (and optional `state`, `buyer_expects_warranty` (default true), `all_required_signers_present`):
1. The implementation SHALL require `deed_type ∈ deed_type enum` and `vesting_form ∈ vesting_form enum`; otherwise `status: "needs_inputs"`.
2. It SHALL map the deed type to its covenant set, covenant scope, and after-acquired-title flag (constants: deed-covenant table).
3. It SHALL map the vesting form to the required signatories and the gap risk (constants: signatory matrix).
4. If `state = "TX"`, it SHALL attach the Texas seisin-narrowing note (constants: TX seisin narrowing).
5. It SHALL raise a warranty red flag if `buyer_expects_warranty` is true but the deed carries no covenants; and if `all_required_signers_present` is explicitly false it SHALL set `signatory_gap: true`, `defer_to_counsel: true`, and emit a counsel-handoff.

## 5. Constants & authorities

| Constant | Value | Strength | Authority | Pin-cite | Effective | Next check |
|---|---|---|---|---|---|---|
| Deed-covenant table | general/special warranty → six covenants (scope all-defects vs grantor-acts-only); bargain-and-sale and quitclaim → none | table (jurisdictional) | Common-law deed covenants | present covenants (seisin, right-to-convey, against-encumbrances) + future covenants (quiet enjoyment, warranty, further assurances) | — | — |
| TX seisin narrowing | seisin narrowed to "grantor has not previously conveyed" | table (jurisdictional) | Tex. Prop. Code § 5.023 | § 5.023 | — | — |
| Signatory matrix | tenancy-by-entirety and community property → both spouses; tenancy-in-common/joint tenancy → all cotenants for the whole; entity → per organizational documents | table (jurisdictional) | Common-law concurrent-ownership rules; e.g., Cal. Fam. Code § 1102, Tex. Fam. Code § 5.001 | both-spouses rule for entireties | — | — |


**Authorities**

| Authority | ID | Type |
|---|---|---|
| Common-law deed covenants | AUTH-0054 | case |
| Tex. Prop. Code 5.023 | AUTH-0233 | statute |

## 6. Worked example

*A Texas property held by a married couple as tenants by the entirety is being conveyed by special-warranty deed, but only one spouse is on the signature page — and a one-spouse signature conveys nothing in an entireties state.*

**Inputs**

```json
{
  "deed_type": "special_warranty",
  "vesting_form": "tenancy_by_entirety",
  "state": "TX",
  "buyer_expects_warranty": true,
  "all_required_signers_present": false
}
```

**Outputs (executed against the reference implementation `MODEL.RE.TITLE_COVENANT_SIGNATORY.v1`)**

```json
{
  "deed_type": "special_warranty",
  "covenants_present": [
    "seisin",
    "right_to_convey",
    "against_encumbrances",
    "quiet_enjoyment",
    "warranty",
    "further_assurances"
  ],
  "covenant_scope": "grantor_acts_only",
  "after_acquired_title_applies": true,
  "deed_note": "Covenants limited to defects arising by, through, or under the grantor.",
  "tx_seisin_note": "Tex. Prop. Code § 5.023 narrows the statutory seisin covenant to a \"grantor has not previously conveyed\" formulation.",
  "vesting_form": "tenancy_by_entirety",
  "required_signatories": "BOTH spouses — neither can convey or encumber alone in entirety states.",
  "signatory_gap": true,
  "defer_to_counsel": true,
  "counsel_handoff": "This raises a conveyance-authority issue that turns on who must join the conveyance under the vesting and marital-property facts. That's a legal determination for your real estate/transaction counsel — here are the options and implications for your decision.",
  "red_flags": [
    "Signatory gap under tenancy by entirety: Classic missed-signatory deal-killer: a one-spouse signature conveys nothing."
  ]
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["deed_type","vesting_form"]`. No partial outputs are emitted.
- **Specialist boundary:** outputs include `defer_to_counsel` (boolean) and, when true, `counsel_handoff` (string) — a conforming implementation MUST surface the routing and MUST NOT convert it into an answer.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model maps a deed type to its covenant set and a vesting form to the parties whose signatures a conveyance of the whole requires. Whether a specific person must join a specific deed — homestead, marital, or entity-authority questions — and whether a covenant has been breached are legal determinations for real-estate counsel; on a signatory gap the model routes them and does not resolve them.

## 9. Conformance bindings

Requirement `REQ-M225` is verified by 22 published case(s): `CONF.MODEL.RE.V18C.COVENANT.026`, `CONF.MODEL.RE.V18C.COVENANT.027`, `CONF.MODEL.RE.V18C.COVENANT.028`, `CONF.MODEL.RE.V18C.COVENANT.029`, `CONF.MODEL.RE.V18C.COVENANT.030`, `CONF.MODEL.RE.V18C.COVENANT.031`, `CONF.MODEL.RE.V18C.COVENANT.032`, `CONF.MODEL.RE.V18C.COVENANT.033`, `CONF.MODEL.RE.V18C.COVENANT.034`, `CONF.MODEL.RE.V18C.COVENANT.035`, `CONF.MODEL.RE.V18C.COVENANT.036`, `CONF.MODEL.RE.V18C.COVENANT.037`, `CONF.MODEL.RE.V18C.COVENANT.038`, `CONF.MODEL.RE.V18C.COVENANT.039`, `CONF.MODEL.RE.V18C.COVENANT.040`, `CONF.MODEL.RE.V18C.COVENANT.041`, `CONF.MODEL.RE.V18C.COVENANT.042`, `CONF.MODEL.RE.V18C.COVENANT.043`, `CONF.MODEL.RE.V18C.COVENANT.044`, `CONF.MODEL.RE.V18C.COVENANT.045`, `CONF.MODEL.RE.V18C.COVENANT.046`, `CONF.MODEL.RE.V18C.COVENANT.047`.

## 10. Version

Reference binding `MODEL.RE.TITLE_COVENANT_SIGNATORY.v1` · entered the specification at internal lineage stage `v1_2` · spec v1.0.0.


# M226 — Marketability triage

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G30
**Deal contexts:** title diligence

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Triages the exceptions on a title commitment into curable, insurable-over, and deal-killing buckets from supplied curability and insurability facts, and flags when a contract's "insurable" (rather than "marketable") title standard would force the buyer to accept insured-over defects. It answers, for a buyer reading a title commitment, "which of these exceptions can be cleared, which can be insured around, and which threaten the deal?" Any deal-killer is a hard defer — the marketability judgment itself is never emitted.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M226.schema.json`](M226.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `exceptions` | object[] | MUST | Title-commitment exceptions; each object carries `label` (string), `curable` (boolean), and `insurer_will_insure_over` (boolean). |
| `contract_title_standard` | enum(contract_title_standard) | MAY | The title standard the purchase contract promises (default marketable). One of `marketable`, `insurable`. |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `contract_title_standard` | enum(contract_title_standard) | The governing title standard, echoed. One of `marketable`, `insurable`. |
| `triage` | object[] | One row per exception: `{ label, bucket }` where bucket is a triage_bucket value. |
| `curable_count` | integer | Number of exceptions triaged curable. |
| `insurable_over_count` | integer | Number triaged insurable-over. |
| `deal_killing_count` | integer | Number triaged deal-killing (unmarketable and uninsurable). |
| `defer_to_counsel` | boolean | True when any exception is deal-killing. |
| `counsel_handoff` | string | null | The routing sentence when a deal-killer defers, else null. |
| `red_flags` | string[] | Deal-killer and insurable-standard warnings. |

## 4. Algorithm

Given `exceptions` (a list of objects, each with `label`, `curable`, `insurer_will_insure_over`) and optional `contract_title_standard` (default `marketable`):
1. The implementation SHALL require a non-empty `exceptions` list; otherwise `status: "needs_inputs"`.
2. For each exception it SHALL assign a bucket: `curable` if `curable` is true; else `insurable_over` if `insurer_will_insure_over` is true; else `deal_killing`.
3. It SHALL count each bucket.
4. If any exception is `deal_killing`, it SHALL set `defer_to_counsel: true`, emit a counsel-handoff, and raise a red flag naming the deal-killers.
5. If `contract_title_standard = "insurable"` and any exception is `insurable_over`, it SHALL raise a red flag that the buyer may be forced to accept insured-over defects that impair resale.

## 5. Constants & authorities

_No numeric constants — this model computes from supplied facts and cited rule text only (attested: `constants: []`)._


**Authorities**

| Authority | ID | Type |
|---|---|---|
| Marketable-title common law | AUTH-0165 | case |
| ALTA title practice | AUTH-0032 | practice-norm |

## 6. Worked example

*A commercial title commitment lists a payoff-ready first mortgage and a recorded access easement of disputed scope; the easement triages deal-killing and routes to counsel while the mortgage clears at closing.*

**Inputs**

```json
{
  "exceptions": [
    {
      "label": "First-lien mortgage (payoff at close)",
      "curable": true,
      "insurer_will_insure_over": false
    },
    {
      "label": "Recorded access easement, disputed scope",
      "curable": false,
      "insurer_will_insure_over": false
    }
  ],
  "contract_title_standard": "marketable"
}
```

**Outputs (executed against the reference implementation `MODEL.RE.MARKETABILITY_TRIAGE.v1`)**

```json
{
  "contract_title_standard": "marketable",
  "triage": [
    {
      "label": "First-lien mortgage (payoff at close)",
      "bucket": "curable"
    },
    {
      "label": "Recorded access easement, disputed scope",
      "bucket": "deal_killing"
    }
  ],
  "curable_count": 1,
  "insurable_over_count": 0,
  "deal_killing_count": 1,
  "defer_to_counsel": true,
  "counsel_handoff": "This raises a title-marketability issue that turns on whether the flagged defect is fatal and what cure path exists — the marketability judgment itself belongs to counsel/title. That's a legal determination for your real estate/transaction counsel — here are the options and implications for your decision.",
  "red_flags": [
    "1 exception(s) triaged deal-killing (unmarketable AND uninsurable): Recorded access easement, disputed scope."
  ]
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["exceptions"]`. No partial outputs are emitted.
- **Specialist boundary:** outputs include `defer_to_counsel` (boolean) and, when true, `counsel_handoff` (string) — a conforming implementation MUST surface the routing and MUST NOT convert it into an answer.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model triages title exceptions into curable, insurable-over, and deal-killing buckets from supplied curability and insurability facts. Whether title is in fact marketable, whether a specific defect is fatal, and what cure will clear it are marketability determinations for title counsel and the title insurer; any deal-killing exception routes that determination and the model never renders it.

## 9. Conformance bindings

Requirement `REQ-M226` is verified by 15 published case(s): `CONF.MODEL.RE.V18C.MARKET.048`, `CONF.MODEL.RE.V18C.MARKET.049`, `CONF.MODEL.RE.V18C.MARKET.050`, `CONF.MODEL.RE.V18C.MARKET.051`, `CONF.MODEL.RE.V18C.MARKET.052`, `CONF.MODEL.RE.V18C.MARKET.053`, `CONF.MODEL.RE.V18C.MARKET.054`, `CONF.MODEL.RE.V18C.MARKET.055`, `CONF.MODEL.RE.V18C.MARKET.056`, `CONF.MODEL.RE.V18C.MARKET.057`, `CONF.MODEL.RE.V18C.MARKET.058`, `CONF.MODEL.RE.V18C.MARKET.059`, `CONF.MODEL.RE.V18C.MARKET.060`, `CONF.MODEL.RE.V18C.MARKET.061`, `CONF.MODEL.RE.V18C.MARKET.062`.

## 10. Version

Reference binding `MODEL.RE.MARKETABILITY_TRIAGE.v1` · entered the specification at internal lineage stage `v1_2` · spec v1.0.0.


# M227 — Risk-of-loss allocator

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G30
**Deal contexts:** real estate purchase agreement

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Allocates the risk of a casualty or condemnation between signing and closing by first detecting an express contract allocation and otherwise applying the situs state's default regime. It answers, when a building burns or is condemned before closing, "who bears that loss — buyer or seller?" NY (Risk Act, seller), CA and TX (UVPRA, seller until title or possession), and the common-law equitable-conversion default (buyer at signing) are encoded as data.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M227.schema.json`](M227.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `contract_allocates_risk` | boolean | MUST | Whether the purchase contract expressly allocates pre-closing casualty risk. |
| `state` | string (US state code) | MUST | Situs state, used to select the default risk regime. |
| `contract_risk_on` | enum(contract_risk_on) | MAY | The party the contract places risk on, when it allocates. One of `seller`, `buyer`. |
| `legal_title_or_possession_passed` | boolean | MAY | Whether legal title or possession has passed to the buyer (default false); decisive under UVPRA/NY regimes. |
| `material_casualty_or_condemnation_pending` | boolean | MAY | Whether a material casualty or condemnation is pending (default false); drives the silent-contract red flag. |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `state` | string (US state code) | The situs state, echoed. |
| `default_regime` | enum(risk_basis) | The state default regime that would govern absent a contract term. One of `contract_override`, `equitable_conversion_default`, `uvpra_seller`, `ny_risk_act_seller`. |
| `citation` | string | The citation for the governing regime. |
| `contract_override_applied` | boolean | Whether an express contract allocation controls. |
| `risk_on` | enum(risk_on) | The party bearing pre-closing casualty risk. One of `buyer`, `seller`, `per_contract_terms`. |
| `basis` | enum(risk_basis) | The basis for the allocation. One of `contract_override`, `equitable_conversion_default`, `uvpra_seller`, `ny_risk_act_seller`. |
| `defer_to_counsel` | boolean | False; this model computes the allocation deterministically. |
| `red_flags` | string[] | Silent-contract-with-pending-casualty warning. |

## 4. Algorithm

Given `state`, `contract_allocates_risk`, and optional `contract_risk_on`, `legal_title_or_possession_passed` (default false), `material_casualty_or_condemnation_pending` (default false):
1. The implementation SHALL require `state` and `contract_allocates_risk`; otherwise `status: "needs_inputs"`.
2. It SHALL look up the state regime (constants: risk-of-loss table), defaulting to equitable conversion.
3. If `contract_allocates_risk` is true, `basis` SHALL be `contract_override` and `risk_on` SHALL follow `contract_risk_on` (`seller`, `buyer`, or `per_contract_terms`).
4. Else if the regime is equitable conversion, `risk_on` SHALL be `buyer` with basis `equitable_conversion_default`.
5. Else (a seller-protective statutory regime), `risk_on` SHALL be `buyer` if legal title or possession has passed, otherwise `seller`, with basis equal to the regime name.
6. If the contract is silent and a casualty or condemnation is pending, it SHALL raise a red flag to allocate expressly before signing.

## 5. Constants & authorities

| Constant | Value | Strength | Authority | Pin-cite | Effective | Next check |
|---|---|---|---|---|---|---|
| NY risk-of-loss regime | seller bears risk until title/possession (NY Risk Act) | table (jurisdictional) | N.Y. Gen. Oblig. Law § 5-1311 | § 5-1311 | — | — |
| CA risk-of-loss regime | seller bears risk until title/possession (UVPRA) | table (jurisdictional) | Cal. Civ. Code § 1662 | § 1662 (UVPRA) | — | — |
| TX risk-of-loss regime | seller bears risk until title/possession (UVPRA) | table (jurisdictional) | Tex. Prop. Code § 5.007 | § 5.007 (UVPRA) | — | — |
| Default risk-of-loss regime | buyer bears risk at signing (equitable conversion) | table (jurisdictional) | Equitable conversion (common-law majority rule) | majority rule | — | — |


**Authorities**

| Authority | ID | Type |
|---|---|---|
| N.Y. Gen. Oblig. Law 5-1311 | AUTH-0179 | statute |
| Tex. Prop. Code 5.007 | AUTH-0232 | statute |
| Cal. Civ. Code 1662 | AUTH-0044 | statute |
| equitable conversion | AUTH-0067 | case |

## 6. Worked example

*A Manhattan purchase contract is silent on risk of loss and a fire damages the building before closing; under the New York Risk Act the loss stays with the seller until title or possession passes.*

**Inputs**

```json
{
  "state": "NY",
  "contract_allocates_risk": false,
  "legal_title_or_possession_passed": false,
  "material_casualty_or_condemnation_pending": true
}
```

**Outputs (executed against the reference implementation `MODEL.RE.RISK_OF_LOSS.v1`)**

```json
{
  "state": "NY",
  "default_regime": "ny_risk_act_seller",
  "citation": "N.Y. Gen. Oblig. Law § 5-1311",
  "contract_override_applied": false,
  "risk_on": "seller",
  "basis": "ny_risk_act_seller",
  "defer_to_counsel": false,
  "red_flags": [
    "Contract is silent on risk of loss and a material casualty/condemnation is pending — the state default controls; allocate expressly before signing."
  ]
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["state","contract_allocates_risk"]`. No partial outputs are emitted.
- **Specialist boundary:** outputs include `defer_to_counsel` (boolean) and, when true, `counsel_handoff` (string) — a conforming implementation MUST surface the routing and MUST NOT convert it into an answer.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model allocates casualty risk between signing and closing by detecting a contract override and otherwise applying the state's default regime. It does not opine on whether a casualty is material, whether the contract's allocation is enforceable, or what remedy a party holds — those are determinations for real-estate counsel.

## 9. Conformance bindings

Requirement `REQ-M227` is verified by 12 published case(s): `CONF.MODEL.RE.V18C.RISKLOSS.063`, `CONF.MODEL.RE.V18C.RISKLOSS.064`, `CONF.MODEL.RE.V18C.RISKLOSS.065`, `CONF.MODEL.RE.V18C.RISKLOSS.066`, `CONF.MODEL.RE.V18C.RISKLOSS.067`, `CONF.MODEL.RE.V18C.RISKLOSS.068`, `CONF.MODEL.RE.V18C.RISKLOSS.069`, `CONF.MODEL.RE.V18C.RISKLOSS.070`, `CONF.MODEL.RE.V18C.RISKLOSS.071`, `CONF.MODEL.RE.V18C.RISKLOSS.072`, `CONF.MODEL.RE.V18C.RISKLOSS.073`, `CONF.MODEL.RE.V18C.RISKLOSS.074`.

## 10. Version

Reference binding `MODEL.RE.RISK_OF_LOSS.v1` · entered the specification at internal lineage stage `v1_2` · spec v1.0.0.


# M228 — Survival and merger tracker

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G30
**Deal contexts:** real estate purchase agreement · M&A closing

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Flags every relied-on representation, covenant, or indemnity that will merge into the deed at closing for lack of an express survival hook or collateral character, so nothing the buyer is counting on quietly disappears at the closing table. It answers, before signing a real-estate or M&A deal that closes by deed, "which of these promises survive closing, and which need survival language added?" The fraud exception is noted independently.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M228.schema.json`](M228.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `items` | object[] | MUST | Relied-on obligations; each object carries `label` (string), `type` (a survival_item_type value), `express_survival` (boolean), and `collateral_obligation` (boolean). |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `items` | object[] | Per-item result: `{ label, type, express_survival, collateral_obligation, survives_closing, basis }`. |
| `surviving_count` | integer | Number of items that survive closing. |
| `merged_away_count` | integer | Number that merge into the deed at closing. |
| `fraud_exception_note` | string | Standing note that fraud claims survive merger regardless of survival language. |
| `defer_to_counsel` | boolean | False; this model computes survival deterministically from the supplied clause facts. |
| `red_flags` | string[] | The list of items that will merge away without added survival language. |

## 4. Algorithm

Given `items` (a list of objects, each with `label`, `type`, `express_survival`, `collateral_obligation`):
1. The implementation SHALL require a non-empty `items` list; otherwise `status: "needs_inputs"`.
2. For each item, `survives_closing` SHALL be true iff `express_survival` OR `collateral_obligation`; `basis` SHALL be `express_survival_clause`, `collateral_obligation`, or `merges_into_deed_at_closing` accordingly.
3. It SHALL count surviving and merged-away items.
4. It SHALL always attach the fraud-exception note (fraud claims survive merger independent of survival language).
5. It SHALL raise a red flag listing every item that will merge away for lack of an express survival hook.

## 5. Constants & authorities

_No numeric constants — this model computes from supplied facts and cited rule text only (attested: `constants: []`)._


**Authorities**

| Authority | ID | Type |
|---|---|---|
| Merger doctrine (common law) | AUTH-0170 | case |

## 6. Worked example

*Three relied-on promises in a deed deal — a financial-statement representation with no survival clause, an express post-closing tax indemnity, and a collateral non-compete — resolve so that only the representation merges into the deed at closing.*

**Inputs**

```json
{
  "items": [
    {
      "label": "Seller financial-statement representation",
      "type": "representation",
      "express_survival": false,
      "collateral_obligation": false
    },
    {
      "label": "Post-closing tax indemnity",
      "type": "indemnity",
      "express_survival": true,
      "collateral_obligation": false
    },
    {
      "label": "Non-compete covenant",
      "type": "covenant",
      "express_survival": false,
      "collateral_obligation": true
    }
  ]
}
```

**Outputs (executed against the reference implementation `MODEL.RE.SURVIVAL_MERGER.v1`)**

```json
{
  "items": [
    {
      "label": "Seller financial-statement representation",
      "type": "representation",
      "express_survival": false,
      "collateral_obligation": false,
      "survives_closing": false,
      "basis": "merges_into_deed_at_closing"
    },
    {
      "label": "Post-closing tax indemnity",
      "type": "indemnity",
      "express_survival": true,
      "collateral_obligation": false,
      "survives_closing": true,
      "basis": "express_survival_clause"
    },
    {
      "label": "Non-compete covenant",
      "type": "covenant",
      "express_survival": false,
      "collateral_obligation": true,
      "survives_closing": true,
      "basis": "collateral_obligation"
    }
  ],
  "surviving_count": 2,
  "merged_away_count": 1,
  "fraud_exception_note": "Fraud claims survive merger independent of contract survival language.",
  "defer_to_counsel": false,
  "red_flags": [
    "1 relied-on item(s) lack an express survival hook and will merge into the deed at closing: Seller financial-statement representation. Add survival language before signing."
  ]
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["items"]`. No partial outputs are emitted.
- **Specialist boundary:** outputs include `defer_to_counsel` (boolean) and, when true, `counsel_handoff` (string) — a conforming implementation MUST surface the routing and MUST NOT convert it into an answer.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model flags every relied-on representation, covenant, or indemnity that will merge into the deed at closing for lack of an express survival hook. Whether a given obligation is in fact collateral, whether merger applies, and whether the fraud exception is available are legal determinations for counsel; the model surfaces the exposure and drafts the survival ask, and renders no enforceability conclusion.

## 9. Conformance bindings

Requirement `REQ-M228` is verified by 15 published case(s): `CONF.MODEL.RE.V18C.SURVIVAL.075`, `CONF.MODEL.RE.V18C.SURVIVAL.076`, `CONF.MODEL.RE.V18C.SURVIVAL.077`, `CONF.MODEL.RE.V18C.SURVIVAL.078`, `CONF.MODEL.RE.V18C.SURVIVAL.079`, `CONF.MODEL.RE.V18C.SURVIVAL.080`, `CONF.MODEL.RE.V18C.SURVIVAL.081`, `CONF.MODEL.RE.V18C.SURVIVAL.082`, `CONF.MODEL.RE.V18C.SURVIVAL.083`, `CONF.MODEL.RE.V18C.SURVIVAL.084`, `CONF.MODEL.RE.V18C.SURVIVAL.085`, `CONF.MODEL.RE.V18C.SURVIVAL.086`, `CONF.MODEL.RE.V18C.SURVIVAL.087`, `CONF.MODEL.RE.V18C.SURVIVAL.088`, `CONF.MODEL.RE.V18C.SURVIVAL.089`.

## 10. Version

Reference binding `MODEL.RE.SURVIVAL_MERGER.v1` · entered the specification at internal lineage stage `v1_2` · spec v1.0.0.


# M229 — Lease anti-assignment and change-of-control parser

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G30
**Deal contexts:** OpCo/PropCo · entity deal with leases

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Classifies the consent path a transfer must clear under a lease's anti-assignment and change-of-control terms, resolving the governing consent standard against the state table (CA Kendall implied reasonableness vs. NY as-written enforcement). It answers, in an OpCo/PropCo or leased-asset deal, "does this transfer trip the lease's transfer restriction, and how hard is the consent to get?" The enforceability judgment always routes to counsel.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M229.schema.json`](M229.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `consent_clause` | enum(consent_clause) | MUST | The lease consent provision as parsed. One of `none_silent`, `consent_no_standard`, `reasonableness`, `sole_discretion`. |
| `transfer_type` | enum(lease_transfer_type) | MUST | The form of the transfer being tested. One of `asset_assignment`, `sublease`, `change_of_control`, `merger`. |
| `landlord_recapture_right` | boolean | MAY | Whether the landlord holds a recapture right triggered by a consent request (default false). |
| `lease_deems_change_of_control_assignment` | boolean | MAY | Whether the lease expressly deems a control transfer an assignment (default false). |
| `state` | string (US state code) | MAY | Situs state, used to resolve the default consent standard. |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `transfer_type` | enum(lease_transfer_type) | The transfer type, echoed. One of `asset_assignment`, `sublease`, `change_of_control`, `merger`. |
| `state` | string (US state code) | null | The situs state, echoed, or null if not supplied. |
| `classification` | enum(lease_classification) | How the transfer classifies against the restriction. One of `deemed_assignment_consent_path_applies`, `generally_not_assignment_by_operation_of_law`, `assignment_restriction_applies`, `no_restriction_freely_assignable`. |
| `coc_default_note` | string | null | The change-of-control default note when a control transfer is not deemed an assignment, else null. |
| `consent_required` | boolean | Whether landlord consent is required for the transfer. |
| `consent_standard` | enum(consent_standard) | The governing consent standard when consent is required, else null. One of `reasonableness_express`, `sole_discretion_as_written`, `sole_discretion_written_verify_ca_limits`, `implied_reasonableness`, `as_written_sole_discretion_enforced`, `unsettled_check_state`. |
| `consent_standard_citation` | string | null | Citation for the state default when the clause states no standard, else null. |
| `landlord_recapture_right` | boolean | Whether a recapture right is present. |
| `defer_to_counsel` | boolean | True whenever the restriction applies. |
| `counsel_handoff` | string | null | The routing sentence when the restriction applies, else null. |
| `red_flags` | string[] | Sole-discretion, deemed-assignment, and recapture warnings. |

## 4. Algorithm

Given `transfer_type` and `consent_clause` (and optional `state`, `lease_deems_change_of_control_assignment` (default false), `landlord_recapture_right` (default false)):
1. The implementation SHALL require `transfer_type ∈ lease_transfer_type enum` and `consent_clause ∈ consent_clause enum`; otherwise `status: "needs_inputs"`.
2. For a `change_of_control` or `merger` transfer, the restriction applies iff the lease deems a control transfer an assignment; `classification` SHALL be `deemed_assignment_consent_path_applies` or `generally_not_assignment_by_operation_of_law` (attaching the change-of-control default note in the latter case).
3. For an `asset_assignment` or `sublease`, the restriction applies iff `consent_clause ≠ none_silent`; `classification` SHALL be `assignment_restriction_applies` or `no_restriction_freely_assignable`.
4. When the restriction applies, `consent_standard` SHALL be resolved: `reasonableness` → `reasonableness_express`; `sole_discretion` → `sole_discretion_written_verify_ca_limits` in CA else `sole_discretion_as_written`; `consent_no_standard` → the state default (constants: consent-standard table), with its citation.
5. `defer_to_counsel` SHALL be true whenever the restriction applies.
6. It SHALL raise red flags for a written sole-discretion standard, for an expressly deemed control-transfer assignment (entity structure does not avoid consent), and for a landlord recapture right on the consent request.

## 5. Constants & authorities

| Constant | Value | Strength | Authority | Pin-cite | Effective | Next check |
|---|---|---|---|---|---|---|
| CA lease consent default | implied reasonableness when consent required with no stated standard | table (jurisdictional) | Kendall v. Ernest Pestana, Inc., 40 Cal.3d 488 (1985) | 40 Cal.3d 488 | — | — |
| NY lease consent default | absolute/sole-discretion consent enforced as written | table (jurisdictional) | NY assignment common law | sole-discretion clauses enforced as written | — | — |
| Lease consent fallback | unsettled — verify the state before relying on implied reasonableness | table (jurisdictional) | State law varies | verify per state | — | — |


**Authorities**

| Authority | ID | Type |
|---|---|---|
| Kendall v. Ernest Pestana 40 Cal.3d 488 | AUTH-0151 | case |
| NY assignment common law | AUTH-0186 | case |

## 6. Worked example

*A New York OpCo/PropCo lease deems a change of control an assignment and requires landlord consent with no stated standard; the buyer's stock deal trips the clause, and New York enforces the consent as written.*

**Inputs**

```json
{
  "transfer_type": "change_of_control",
  "consent_clause": "consent_no_standard",
  "state": "NY",
  "lease_deems_change_of_control_assignment": true,
  "landlord_recapture_right": false
}
```

**Outputs (executed against the reference implementation `MODEL.RE.LEASE_COC_ASSIGNMENT.v1`)**

```json
{
  "transfer_type": "change_of_control",
  "state": "NY",
  "classification": "deemed_assignment_consent_path_applies",
  "coc_default_note": null,
  "consent_required": true,
  "consent_standard": "as_written_sole_discretion_enforced",
  "consent_standard_citation": "NY common law: absolute-consent/sole-discretion clauses enforced as written",
  "landlord_recapture_right": false,
  "defer_to_counsel": true,
  "counsel_handoff": "This raises a lease anti-assignment/consent issue that turns on whether this transfer triggers the clause and how the consent standard applies — the enforceability judgment belongs to counsel. That's a legal determination for your real estate/transaction counsel — here are the options and implications for your decision.",
  "red_flags": [
    "Lease expressly deems a control transfer an assignment — entity structure does NOT avoid the consent requirement."
  ]
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["transfer_type","consent_clause"]`. No partial outputs are emitted.
- **Specialist boundary:** outputs include `defer_to_counsel` (boolean) and, when true, `counsel_handoff` (string) — a conforming implementation MUST surface the routing and MUST NOT convert it into an answer.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model classifies the consent path a transfer must clear under a lease's anti-assignment and change-of-control terms and the state consent-standard table. Whether this transfer legally triggers the clause, and how the consent standard applies to it, are enforceability determinations for real-estate counsel; the model routes them with its classification and the consent facts and never answers them.

## 9. Conformance bindings

Requirement `REQ-M229` is verified by 24 published case(s): `CONF.MODEL.RE.V18C.LEASE.090`, `CONF.MODEL.RE.V18C.LEASE.091`, `CONF.MODEL.RE.V18C.LEASE.092`, `CONF.MODEL.RE.V18C.LEASE.093`, `CONF.MODEL.RE.V18C.LEASE.094`, `CONF.MODEL.RE.V18C.LEASE.095`, `CONF.MODEL.RE.V18C.LEASE.096`, `CONF.MODEL.RE.V18C.LEASE.097`, `CONF.MODEL.RE.V18C.LEASE.098`, `CONF.MODEL.RE.V18C.LEASE.099`, `CONF.MODEL.RE.V18C.LEASE.100`, `CONF.MODEL.RE.V18C.LEASE.101`, `CONF.MODEL.RE.V18C.LEASE.102`, `CONF.MODEL.RE.V18C.LEASE.103`, `CONF.MODEL.RE.V18C.LEASE.104`, `CONF.MODEL.RE.V18C.LEASE.105`, `CONF.MODEL.RE.V18C.LEASE.106`, `CONF.MODEL.RE.V18C.LEASE.107`, `CONF.MODEL.RE.V18C.LEASE.108`, `CONF.MODEL.RE.V18C.LEASE.109`, `CONF.MODEL.RE.V18C.LEASE.110`, `CONF.MODEL.RE.V18C.LEASE.111`, `CONF.MODEL.RE.V18C.LEASE.112`, `CONF.MODEL.RE.V18C.LEASE.113`.

## 10. Version

Reference binding `MODEL.RE.LEASE_COC_ASSIGNMENT.v1` · entered the specification at internal lineage stage `v1_2` · spec v1.0.0.


# M230 — Due-on-sale screener

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G30
**Deal contexts:** real estate financing · entity deal with property debt

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Screens a loan's due-on-transfer clause against the Garn-St. Germain consumer exceptions, which reach only residential collateral of fewer than five dwelling units, and flags lender consent as a closing-critical-path item wherever no exception applies. It answers, in any deal that takes property subject to existing debt, "can the lender accelerate on this transfer, and do we need consent or a payoff before closing?" Commercial and entity-level transfers get no consumer protection.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M230.schema.json`](M230.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `loan_has_due_on_transfer_clause` | boolean | MUST | Whether the loan documents contain a due-on-sale/due-on-transfer clause. |
| `residential_under_5_units` | boolean | MUST | Whether the collateral is residential real property of fewer than five dwelling units. |
| `transfer_kind` | enum(transfer_kind) | MAY | The nature of the transfer (default deed_sale); the last six enum values are the Garn-protected consumer transfers. One of `deed_sale`, `entity_transfer`, `transfer_to_spouse_or_child`, `transfer_on_death_to_relative`, `divorce_decree_transfer_to_spouse`, `inter_vivos_trust_borrower_beneficiary`, `junior_lien_creation`, `leasehold_under_3y_no_option`. |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `transfer_kind` | enum(transfer_kind) | The transfer kind, echoed. One of `deed_sale`, `entity_transfer`, `transfer_to_spouse_or_child`, `transfer_on_death_to_relative`, `divorce_decree_transfer_to_spouse`, `inter_vivos_trust_borrower_beneficiary`, `junior_lien_creation`, `leasehold_under_3y_no_option`. |
| `acceleration_risk` | enum(acceleration_risk) | The lender's acceleration posture. One of `none_no_clause`, `barred_by_garn_exception`, `lender_option_on_transfer`. |
| `basis` | string | Why the acceleration posture applies. |
| `citation` | string | The Garn-St. Germain citation. |
| `lender_consent_critical_path` | boolean | Whether lender consent (or payoff/refinance) is a closing-condition critical path. |
| `defer_to_counsel` | boolean | True when lender consent is on the critical path. |
| `counsel_handoff` | string | null | The routing sentence when consent is critical, else null. |
| `red_flags` | string[] | The consent-critical-path warning when applicable. |

## 4. Algorithm

Given `loan_has_due_on_transfer_clause` and `residential_under_5_units` (and optional `transfer_kind`, default `deed_sale`):
1. The implementation SHALL require both booleans; otherwise `status: "needs_inputs"`.
2. If there is no due-on-transfer clause, `acceleration_risk` SHALL be `none_no_clause`.
3. Else if `residential_under_5_units` is true AND `transfer_kind` is one of the Garn-St. Germain protected consumer transfers (constants: Garn-St. Germain residential unit ceiling and protected-transfer list), `acceleration_risk` SHALL be `barred_by_garn_exception`.
4. Otherwise `acceleration_risk` SHALL be `lender_option_on_transfer` (commercial/entity collateral, or a non-protected residential transfer kind).
5. `lender_consent_critical_path` and `defer_to_counsel` SHALL be true iff `acceleration_risk = lender_option_on_transfer`, with a red flag routing lender consent or payoff as a closing condition.

## 5. Constants & authorities

| Constant | Value | Strength | Authority | Pin-cite | Effective | Next check |
|---|---|---|---|---|---|---|
| Garn-St. Germain residential unit ceiling | fewer than 5 dwelling units | MUST (binding) | 12 U.S.C. § 1701j-3 | § 1701j-3(d) | federal, current | on federal amendment |
| Garn-St. Germain protected transfers | spouse/child; on-death to relative; divorce decree to spouse; inter-vivos trust with borrower beneficiary; junior-lien creation; leasehold under 3 years without option | MUST (binding) | 12 U.S.C. § 1701j-3 | § 1701j-3(d)(1)–(8) | federal, current | — |


**Authorities**

| Authority | ID | Type |
|---|---|---|
| 12 U.S.C. 1701j-3 | AUTH-0014 | statute |

## 6. Worked example

*A commercial mortgage carries a due-on-transfer clause; because Garn-St. Germain's consumer exceptions reach only small residential loans, lender consent becomes a closing-critical-path item.*

**Inputs**

```json
{
  "loan_has_due_on_transfer_clause": true,
  "residential_under_5_units": false,
  "transfer_kind": "deed_sale"
}
```

**Outputs (executed against the reference implementation `MODEL.RE.DUE_ON_SALE.v1`)**

```json
{
  "transfer_kind": "deed_sale",
  "acceleration_risk": "lender_option_on_transfer",
  "basis": "Commercial/entity collateral — Garn-St. Germain consumer exceptions do not apply",
  "citation": "12 U.S.C. § 1701j-3",
  "lender_consent_critical_path": true,
  "defer_to_counsel": true,
  "counsel_handoff": "This raises a due-on-transfer issue that turns on the loan's transfer definitions and whether this structure trips them — obtain lender consent or a payoff plan before signing. That's a legal determination for your real estate/transaction counsel — here are the options and implications for your decision.",
  "red_flags": [
    "Due-on-transfer clause + no Garn protection: lender consent (or payoff/refinance) is a closing-condition critical path."
  ]
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["loan_has_due_on_transfer_clause","residential_under_5_units"]`. No partial outputs are emitted.
- **Specialist boundary:** outputs include `defer_to_counsel` (boolean) and, when true, `counsel_handoff` (string) — a conforming implementation MUST surface the routing and MUST NOT convert it into an answer.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model screens a due-on-transfer clause against the Garn-St. Germain consumer exceptions, which reach only residential collateral of fewer than five units. Whether the loan documents' transfer definitions are in fact tripped by a given structure, and whether lender consent or a payoff is required, are determinations for counsel and the lender; where no consumer exception applies the model routes the consent question as a closing-critical-path item.

## 9. Conformance bindings

Requirement `REQ-M230` is verified by 12 published case(s): `CONF.MODEL.RE.V18C.DUEONSALE.114`, `CONF.MODEL.RE.V18C.DUEONSALE.115`, `CONF.MODEL.RE.V18C.DUEONSALE.116`, `CONF.MODEL.RE.V18C.DUEONSALE.117`, `CONF.MODEL.RE.V18C.DUEONSALE.118`, `CONF.MODEL.RE.V18C.DUEONSALE.119`, `CONF.MODEL.RE.V18C.DUEONSALE.120`, `CONF.MODEL.RE.V18C.DUEONSALE.121`, `CONF.MODEL.RE.V18C.DUEONSALE.122`, `CONF.MODEL.RE.V18C.DUEONSALE.123`, `CONF.MODEL.RE.V18C.DUEONSALE.124`, `CONF.MODEL.RE.V18C.DUEONSALE.125`.

## 10. Version

Reference binding `MODEL.RE.DUE_ON_SALE.v1` · entered the specification at internal lineage stage `v1_2` · spec v1.0.0.


# M231 — Option/ROFR/ROFO trigger detector

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic schedules with a specialist boundary — the governing determination (legal, tax, accounting, appraisal, or judicial) belongs to a licensed professional.
**Gates:** G30
**Deal contexts:** real estate M&A · entity deal

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Detects, in both directions, whether a transaction form implicates an option, right of first refusal, or right of first offer — the property sale that squarely triggers the right, and the entity structure that may (or may not) avoid it. It answers, when a target property carries a preemptive right, "does our deal have to run the notice-and-matching mechanics before we sign with a third party?" Because a court can look through form, the legal conclusion always routes to counsel.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M231.schema.json`](M231.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `right_captures_entity_transfers` | boolean | MUST | Whether the right's language expressly captures entity-level (indirect) transfers. |
| `right_type` | enum(right_type) | MUST | The preemptive right at issue. One of `option`, `rofr`, `rofo`. |
| `transaction_form` | enum(preemptive_transaction_form) | MUST | The transaction form being tested. One of `asset_sale`, `entity_transfer`, `merger`. |
| `state` | string (US state code) | MAY | Optional situs state; enables the Texas strict-match ROFR note. |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `right_type` | enum(right_type) | The right type, echoed. One of `option`, `rofr`, `rofo`. |
| `transaction_form` | enum(preemptive_transaction_form) | The transaction form, echoed. One of `asset_sale`, `entity_transfer`, `merger`. |
| `trigger_status` | enum(trigger_status) | Whether and why the transaction implicates the right. One of `triggered_property_sale`, `triggered_entity_capture_language`, `likely_not_triggered_structural`. |
| `tx_strict_match_note` | string | null | The Texas strict-match note when applicable, else null. |
| `defer_to_counsel` | boolean | Always true; the trigger conclusion is a legal determination. |
| `counsel_handoff` | string | The routing sentence. |
| `red_flags` | string[] | Direction-specific trigger warnings. |

## 4. Algorithm

Given `right_type`, `transaction_form`, and `right_captures_entity_transfers` (and optional `state`):
1. The implementation SHALL require `right_type ∈ right_type enum`, `transaction_form ∈ preemptive_transaction_form enum`, and `right_captures_entity_transfers`; otherwise `status: "needs_inputs"`.
2. If `transaction_form = asset_sale`, `trigger_status` SHALL be `triggered_property_sale` with a red flag to run the notice/matching mechanics.
3. Else if `right_captures_entity_transfers` is true, `trigger_status` SHALL be `triggered_entity_capture_language` (the entity form does not avoid the right).
4. Else `trigger_status` SHALL be `likely_not_triggered_structural`, with a double-edged red flag that a court may look through form and the counterparty will argue trigger.
5. If `state = "TX"` and `right_type = rofr`, it SHALL attach the Texas strict-match construction note (constants: TX strict-match ROFR).
6. `defer_to_counsel` SHALL always be true — whether a transaction legally triggers the right is a legal conclusion.

## 5. Constants & authorities

| Constant | Value | Strength | Authority | Pin-cite | Effective | Next check |
|---|---|---|---|---|---|---|
| TX strict-match ROFR | Texas courts construe ROFR matching strictly — exact match of third-party terms | table (jurisdictional) | TX strict-match construction | exact-match rule | — | — |


**Authorities**

| Authority | ID | Type |
|---|---|---|
| ROFR/option common law | AUTH-0207 | case |
| TX strict-match construction | AUTH-0246 | case |

## 6. Worked example

*A ground-lease ROFR sits over a Texas property; the deal is structured as an entity transfer the right does not expressly capture — but a court could still look through the form, so both readings route to counsel.*

**Inputs**

```json
{
  "right_type": "rofr",
  "transaction_form": "entity_transfer",
  "right_captures_entity_transfers": false,
  "state": "TX"
}
```

**Outputs (executed against the reference implementation `MODEL.RE.PREEMPTIVE_RIGHT_TRIGGER.v1`)**

```json
{
  "right_type": "rofr",
  "transaction_form": "entity_transfer",
  "trigger_status": "likely_not_triggered_structural",
  "tx_strict_match_note": "Texas courts construe ROFR matching strictly — exact-match of third-party terms.",
  "defer_to_counsel": true,
  "counsel_handoff": "This raises a preemptive-right trigger issue that turns on whether this specific transaction legally triggers the right — the legal conclusion belongs to counsel. That's a legal determination for your real estate/transaction counsel — here are the options and implications for your decision.",
  "red_flags": [
    "Double-edged: the entity transfer may avoid a property-level ROFR — but a court can look through form, and the counterparty will argue trigger. Both directions need counsel."
  ]
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["right_type","transaction_form","right_captures_entity_transfers"]`. No partial outputs are emitted.
- **Specialist boundary:** outputs include `defer_to_counsel` (boolean) and, when true, `counsel_handoff` (string) — a conforming implementation MUST surface the routing and MUST NOT convert it into an answer.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model detects, in both directions, whether a transaction form triggers an option, ROFR, or ROFO — the sale that squarely triggers the right and the entity structure that may avoid it. Whether a specific transaction legally triggers the right is always a legal conclusion for counsel; the model routes it with the trigger analysis and the notice/matching mechanics and never renders the conclusion itself.

## 9. Conformance bindings

Requirement `REQ-M231` is verified by 15 published case(s): `CONF.MODEL.RE.V18C.ROFR.126`, `CONF.MODEL.RE.V18C.ROFR.127`, `CONF.MODEL.RE.V18C.ROFR.128`, `CONF.MODEL.RE.V18C.ROFR.129`, `CONF.MODEL.RE.V18C.ROFR.130`, `CONF.MODEL.RE.V18C.ROFR.131`, `CONF.MODEL.RE.V18C.ROFR.132`, `CONF.MODEL.RE.V18C.ROFR.133`, `CONF.MODEL.RE.V18C.ROFR.134`, `CONF.MODEL.RE.V18C.ROFR.135`, `CONF.MODEL.RE.V18C.ROFR.136`, `CONF.MODEL.RE.V18C.ROFR.137`, `CONF.MODEL.RE.V18C.ROFR.138`, `CONF.MODEL.RE.V18C.ROFR.139`, `CONF.MODEL.RE.V18C.ROFR.140`.

## 10. Version

Reference binding `MODEL.RE.PREEMPTIVE_RIGHT_TRIGGER.v1` · entered the specification at internal lineage stage `v1_2` · spec v1.0.0.


# M232 — Controlling-interest transfer-tax and reassessment screener

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G30, G19
**Deal contexts:** entity deal · merger with real property

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Screens an entity-level transfer of a property-owning company for controlling-interest transfer tax and property-tax reassessment against the state regime table, and flags step-transaction exposure when a mere-change exemption is claimed alongside related steps. It answers, when real estate moves inside an entity deal, "does no deed still mean no transfer tax or reassessment here?" NY (50% controlling-interest tax with 3-year aggregation), CA (Prop 13 change-in-control reassessment), and TX (constitutional prohibition) are encoded as data.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M232.schema.json`](M232.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `is_entity_transfer` | boolean | MUST | Whether the transaction moves interests in an entity that owns the property (rather than a deed). |
| `state` | string (US state code) | MUST | Situs state of the property, used to select the transfer-tax regime. |
| `transfer_pct` | number | MUST | Percentage of entity interests transferred in this step (0–100). |
| `cumulative_related_transfers_pct` | number | MAY | Cumulative percentage transferred across related steps within the aggregation window (0–100); defaults to transfer_pct. |
| `mere_change_exemption_claimed` | boolean | MAY | Whether a mere-change-of-identity exemption is being claimed (default false). |
| `related_steps_planned` | boolean | MAY | Whether related transfer steps are planned (default false); with a mere-change claim this drives step-transaction risk. |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `state` | string (US state code) | The situs state, echoed. |
| `regime_known` | boolean | Whether the state is in the transfer-tax regime table. |
| `citation` | string | The citation for the state regime. |
| `controlling_interest_threshold_pct` | number | null | The controlling-interest threshold for the state, or null. |
| `citt_screen_triggered` | boolean | Whether the controlling-interest transfer-tax screen fires. |
| `reassessment_screen_triggered` | boolean | Whether the property-tax reassessment screen fires. |
| `aggregation_years` | integer | null | The acting-in-concert aggregation window in years, or null. |
| `step_transaction_risk` | boolean | Whether a mere-change claim plus related steps raises step-transaction risk. |
| `defer_to_counsel` | boolean | True when any screen or the step-transaction flag fires, or the state is untabled. |
| `counsel_handoff` | string | null | The routing sentence when a screen fires, else null. |
| `red_flags` | string[] | Per-trigger warnings. |

## 4. Algorithm

Given `state`, `is_entity_transfer`, `transfer_pct` (and optional `cumulative_related_transfers_pct`, `mere_change_exemption_claimed` (default false), `related_steps_planned` (default false)):
1. The implementation SHALL require `state`, `is_entity_transfer`, and `transfer_pct`; otherwise `status: "needs_inputs"`.
2. It SHALL look up the state regime (constants: transfer-tax regime table). If the state is absent, it SHALL emit `regime_known: false`, `defer_to_counsel: true`, and a table-gap flag.
3. `citt_screen_triggered` SHALL be true iff the regime imposes a controlling-interest tax, `is_entity_transfer` is true, a threshold exists, and `max(transfer_pct, cumulative_related_transfers_pct) ≥ threshold` (constants: NY controlling-interest threshold).
4. `reassessment_screen_triggered` SHALL be true iff the regime reassesses on control change, `is_entity_transfer` is true, and `transfer_pct` or the cumulative figure exceeds 50 (constants: CA Prop 13 change-in-control).
5. `step_transaction_risk` SHALL be true iff `mere_change_exemption_claimed` AND `related_steps_planned`.
6. `defer_to_counsel` SHALL be true if any screen or the step-transaction flag fires, with per-trigger red flags (and the Texas no-transfer-tax note).

## 5. Constants & authorities

| Constant | Value | Strength | Authority | Pin-cite | Effective | Next check |
|---|---|---|---|---|---|---|
| NY controlling-interest threshold | 50% | table (jurisdictional) | NYC Admin. Code § 11-2101 | controlling interest = 50% or more | — | — |
| NY controlling-interest aggregation window | 3 years | table (jurisdictional) | NY Pub. 576 | 3-year acting-in-concert aggregation | — | — |
| CA Prop 13 change-in-control | >50% control change → 100% reassessment | table (jurisdictional) | Cal. Rev. & Tax. Code § 64 | § 64(c)–(d) | — | — |
| TX transfer-tax prohibition | no real-estate transfer tax | table (jurisdictional) | Tex. Const. art. VIII § 29 | art. VIII § 29 | — | — |


**Authorities**

| Authority | ID | Type |
|---|---|---|
| NYC Admin. Code 11-2101 | AUTH-0189 | statute |
| NY Tax Law 1405(b)(6) | AUTH-0188 | statute |
| Cal. Rev. & Tax. Code 60-64 | AUTH-0045 | statute |
| Tex. Const. art. VIII 29 | AUTH-0230 | statute |
| Matter of 105-02 Forest Hills (2025) | AUTH-0168 | case |

## 6. Worked example

*A 100% membership-interest sale of a New York property-owning LLC claims the mere-change exemption while related steps are planned; the controlling-interest tax screen trips and the step-transaction doctrine threatens the exemption.*

**Inputs**

```json
{
  "state": "NY",
  "is_entity_transfer": true,
  "transfer_pct": 100,
  "mere_change_exemption_claimed": true,
  "related_steps_planned": true
}
```

**Outputs (executed against the reference implementation `MODEL.RE.CITT_REASSESSMENT_SCREEN.v1`)**

```json
{
  "state": "NY",
  "regime_known": true,
  "citation": "NYC Admin. Code § 11-2101 (controlling interest = 50% or more); § 11-2106(b)(8) & NY Tax Law § 1405(b)(6) (mere-change exemption); NY Pub. 576 (3-year acting-in-concert aggregation)",
  "controlling_interest_threshold_pct": 50,
  "citt_screen_triggered": true,
  "reassessment_screen_triggered": false,
  "aggregation_years": 3,
  "step_transaction_risk": true,
  "defer_to_counsel": true,
  "counsel_handoff": "This raises a controlling-interest tax/reassessment issue that turns on whether this specific transfer is taxable or reassessable and how to structure — a determination for tax counsel. That's a legal determination for your real estate/transaction counsel — here are the options and implications for your decision.",
  "red_flags": [
    "Controlling-interest transfer tax screen: 100% entity transfer meets the 50% threshold in NY — no deed does not mean no transfer tax.",
    "Mere-change exemption claimed with related steps planned: the step-transaction doctrine can collapse the steps and defeat the exemption (Forest Hills, 2025)."
  ]
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["state","is_entity_transfer","transfer_pct"]`. No partial outputs are emitted.
- **Specialist boundary:** outputs include `defer_to_counsel` (boolean) and, when true, `counsel_handoff` (string) — a conforming implementation MUST surface the routing and MUST NOT convert it into an answer.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model screens a transfer for controlling-interest transfer tax and property-tax reassessment against the state regime table. Whether a specific transfer is in fact taxable or reassessable, and how to structure around it, are tax determinations for tax counsel; on a positive screen the model routes them with the screen and the step-transaction flag and renders no taxability opinion.

## 9. Conformance bindings

Requirement `REQ-M232` is verified by 18 published case(s): `CONF.MODEL.RE.V18C.CITT.141`, `CONF.MODEL.RE.V18C.CITT.142`, `CONF.MODEL.RE.V18C.CITT.143`, `CONF.MODEL.RE.V18C.CITT.144`, `CONF.MODEL.RE.V18C.CITT.145`, `CONF.MODEL.RE.V18C.CITT.146`, `CONF.MODEL.RE.V18C.CITT.147`, `CONF.MODEL.RE.V18C.CITT.148`, `CONF.MODEL.RE.V18C.CITT.149`, `CONF.MODEL.RE.V18C.CITT.150`, `CONF.MODEL.RE.V18C.CITT.151`, `CONF.MODEL.RE.V18C.CITT.152`, `CONF.MODEL.RE.V18C.CITT.153`, `CONF.MODEL.RE.V18C.CITT.154`, `CONF.MODEL.RE.V18C.CITT.155`, `CONF.MODEL.RE.V18C.CITT.156`, `CONF.MODEL.RE.V18C.CITT.157`, `CONF.MODEL.RE.V18C.CITT.158`.

## 10. Version

Reference binding `MODEL.RE.CITT_REASSESSMENT_SCREEN.v1` · entered the specification at internal lineage stage `v1_2` · spec v1.0.0.


# M233 — Permit/CO transferability and bulk-sales screener

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G30, G19
**Deal contexts:** asset deal · entity deal

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Screens whether certificates of occupancy and operating permits re-issue on the transfer, whether specific permits fail to travel with an asset deal, and whether state bulk-sales tax-clearance notification applies, plus a CERCLA successor flag. It answers, in an asset or entity acquisition of an operating property, "what re-permitting and clearance filings sit on the closing critical path, and where does successor liability follow the buyer regardless of form?" CA/NY/NJ/PA bulk-sales regimes are encoded as data.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M233.schema.json`](M233.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `deal_form` | enum(permit_deal_form) | MUST | The acquisition form. One of `asset`, `entity`, `merger`. |
| `jurisdiction_requires_co_on_transfer` | boolean | MUST | Whether the jurisdiction requires a certificate of occupancy to be re-issued on transfer. |
| `cercla_linked_property` | boolean | MAY | Whether the property has a CERCLA/environmental linkage (default false). |
| `permits` | object[] | MAY | Operating permits; each object carries `label` (string) and `transferable` (boolean). |
| `states_involved` | string[] | MAY | Two-letter state codes touched by the deal, screened against the bulk-sales table. |
| `use_change` | boolean | MAY | Whether the transaction involves a change of use (default false); can require a CO even in an entity deal. |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `deal_form` | enum(permit_deal_form) | The deal form, echoed. One of `asset`, `entity`, `merger`. |
| `co_required_on_transfer` | boolean | Whether a certificate of occupancy must be re-issued on this transfer. |
| `non_transferable_permits` | string[] | Labels of permits that do not travel with the transfer. |
| `bulk_sales_notification_states` | string[] | Applicable bulk-sales notification states. |
| `bulk_sales_citations` | string[] | Per-state bulk-sales citations for the applicable states. |
| `cercla_successor_flag` | boolean | Whether CERCLA successor liability is flagged. |
| `defer_to_counsel` | boolean | True on a CERCLA link or an asset-deal bulk-sales trigger. |
| `counsel_handoff` | string | null | The routing sentence when successor/bulk-sales exposure defers, else null. |
| `red_flags` | string[] | CO, permit-transfer, bulk-sales, and CERCLA warnings. |

## 4. Algorithm

Given `deal_form` and `jurisdiction_requires_co_on_transfer` (and optional `use_change` (default false), `permits`, `states_involved`, `cercla_linked_property` (default false)):
1. The implementation SHALL require `deal_form ∈ permit_deal_form enum` and `jurisdiction_requires_co_on_transfer`; otherwise `status: "needs_inputs"`.
2. `co_required_on_transfer` SHALL be true iff a CO is required on transfer AND (`deal_form = asset` OR `use_change`).
3. `non_transferable_permits` SHALL be the labels of supplied permits marked non-transferable.
4. `bulk_sales_notification_states` SHALL be the supplied states that appear in the bulk-sales notification table (constants: bulk-sales notification states).
5. `defer_to_counsel` SHALL be true iff the property is CERCLA-linked OR (`deal_form = asset` AND at least one bulk-sales state applies).
6. It SHALL raise red flags for CO re-issuance, non-transferable permits (by deal form), applicable bulk-sales notification, and CERCLA successor liability.

## 5. Constants & authorities

| Constant | Value | Strength | Authority | Pin-cite | Effective | Next check |
|---|---|---|---|---|---|---|
| Bulk-sales notification states | CA, NY, NJ, PA (tax-clearance/notification regimes; PA reaches real-estate-only transfers) | table (jurisdictional) | Cal. U. Com. Code §§ 6101–6111; N.Y. Tax Law § 1141(c); N.J.S.A. 54:50-38; 69 P.S. § 529 / 72 P.S. § 1403 | per-state notification statutes | — | — |
| CERCLA successor liability | environmental successor liability survives regardless of deal form or bulk-sales repeal | table (jurisdictional) | CERCLA § 107 (42 U.S.C. § 9607) | § 107 | — | — |


**Authorities**

| Authority | ID | Type |
|---|---|---|
| Municipal CO Ordinances | AUTH-0178 | statute |
| UCC Art. 6 (as retained) | AUTH-0252 | statute |
| CERCLA 107 | AUTH-0048 | statute |
| 72 P.S. 1403 | AUTH-0020 | statute |

## 6. Worked example

*An asset purchase of a New Jersey restaurant property: the certificate of occupancy must be re-issued on transfer, the liquor license does not travel with the assets, and New Jersey's bulk-sales notification applies — miss it and the buyer inherits the seller's tax.*

**Inputs**

```json
{
  "deal_form": "asset",
  "jurisdiction_requires_co_on_transfer": true,
  "use_change": false,
  "permits": [
    {
      "label": "Liquor license",
      "transferable": false
    }
  ],
  "states_involved": [
    "NJ"
  ],
  "cercla_linked_property": false
}
```

**Outputs (executed against the reference implementation `MODEL.RE.PERMIT_CO_BULK_SALES.v1`)**

```json
{
  "deal_form": "asset",
  "co_required_on_transfer": true,
  "non_transferable_permits": [
    "Liquor license"
  ],
  "bulk_sales_notification_states": [
    "NJ"
  ],
  "bulk_sales_citations": [
    "N.J.S.A. 54:50-38 bulk-sale notification"
  ],
  "cercla_successor_flag": false,
  "defer_to_counsel": true,
  "counsel_handoff": "This raises a successor-liability/bulk-sales issue that turns on the clearance filings and successor-liability exposure for the states involved. That's a legal determination for your real estate/transaction counsel — here are the options and implications for your decision.",
  "red_flags": [
    "Certificate-of-occupancy requirement on transfer/use change — re-permitting and code-compliance upgrades can gate closing.",
    "Non-transferable permits in an asset deal: Liquor license — re-application timelines belong on the critical path.",
    "Bulk-sales/tax-clearance notification applies in: NJ — failure to notify makes the buyer liable for the seller's tax."
  ]
}
```

## 7. Error semantics

- **Missing inputs:** the model returns `status: "needs_inputs"` with `missingInputs` as a field-name list — for an empty input record: `["deal_form","jurisdiction_requires_co_on_transfer"]`. No partial outputs are emitted.
- **Specialist boundary:** outputs include `defer_to_counsel` (boolean) and, when true, `counsel_handoff` (string) — a conforming implementation MUST surface the routing and MUST NOT convert it into an answer.
- **Jurisdiction table gaps** (state-tabled models): untabled jurisdictions return an explicit table-gap flag with `defer_to_counsel: true`, never a guessed rule.

## 8. Boundary statement

This model screens permit and certificate-of-occupancy transferability and bulk-sales tax-clearance applicability by deal form and jurisdiction. Whether a specific permit survives the transfer, and the scope of successor and environmental liability, are determinations for counsel; on a CERCLA link or an asset-deal bulk-sales trigger the model routes them and does not resolve the exposure.

## 9. Conformance bindings

Requirement `REQ-M233` is verified by 13 published case(s): `CONF.MODEL.RE.V18C.PERMIT.159`, `CONF.MODEL.RE.V18C.PERMIT.160`, `CONF.MODEL.RE.V18C.PERMIT.161`, `CONF.MODEL.RE.V18C.PERMIT.162`, `CONF.MODEL.RE.V18C.PERMIT.163`, `CONF.MODEL.RE.V18C.PERMIT.164`, `CONF.MODEL.RE.V18C.PERMIT.165`, `CONF.MODEL.RE.V18C.PERMIT.166`, `CONF.MODEL.RE.V18C.PERMIT.167`, `CONF.MODEL.RE.V18C.PERMIT.168`, `CONF.MODEL.RE.V18C.PERMIT.169`, `CONF.MODEL.RE.V18C.PERMIT.170`, `CONF.MODEL.RE.V18C.PERMIT.171`.

## 10. Version

Reference binding `MODEL.RE.PERMIT_CO_BULK_SALES.v1` · entered the specification at internal lineage stage `v1_2` · spec v1.0.0.


# M234 — Fixture classification and UCC 9-334 priority

**Status:** Normative (v1.0.0)
**Boundary classification:** Deterministic computation — arithmetic and rule application on supplied facts.
**Gates:** G30, G2
**Deal contexts:** asset deal with fixtures · equipment-heavy real estate

> **Implementable from this document alone.** This entry carries the full authored contract — typed inputs and outputs, an RFC-2119 algorithm, constants with pin-cites, and a worked example whose every output literal traces to a constant, an input, or a derived field.

## 1. Purpose

Resolves the priority contest between a fixture secured party and a recorded real-property interest under UCC § 9-334, applying the subsection (c) real-property default, the (d) purchase-money 20-day fixture-filing exception, and the (h) construction-mortgage override. It answers, when financed equipment is affixed to mortgaged real estate, "whose lien wins — the equipment lender's or the mortgagee's?" It also flags the purchase-price-allocation consequence of the fixture-versus-personalty line.

## 2. Input contract

Conventions: monetary values are integer cents; dates are ISO-8601 strings; jurisdictions are two-letter US state codes (see the [data dictionary](../data-dictionary.md)). Machine-readable schema: [`M234.schema.json`](M234.schema.json).

| Field | Type | Required | Description |
|---|---|---|---|
| `fixture_filing_made` | boolean | MUST | Whether a fixture filing was made in the real-property records (a UCC-1 alone does not suffice). |
| `pmsi` | boolean | MUST | Whether the fixture interest is a purchase-money security interest. |
| `prior_recorded_real_property_interest` | boolean | MUST | Whether a conflicting real-property interest (e.g., a mortgage) was recorded first. |
| `construction_mortgage` | boolean | MAY | Whether the prior interest is a construction mortgage (default false); triggers the § 9-334(h) override. |
| `filing_days_after_affixation` | integer | MAY | Days between affixation and the fixture filing; decisive for the 20-day PMSI window. |

## 3. Output contract

| Field | Type | Description |
|---|---|---|
| `priority` | enum(fixture_priority) | Which interest holds priority in the fixture. One of `fixture_secured_party`, `first_to_perfect`, `real_property_interest`. |
| `basis` | string | The UCC § 9-334 subsection that governs the outcome. |
| `pmsi` | boolean | Whether the interest is a PMSI, echoed. |
| `fixture_filing_made` | boolean | Whether a fixture filing was made, echoed. |
| `filing_days_after_affixation` | integer | null | Days after affixation, echoed, or null if not supplied. |
| `within_20_day_window` | boolean | Whether the fixture filing fell within the 20-day PMSI window. |
| `construction_mortgage` | boolean | Whether a construction mortgage is present, echoed. |
| `ppa_note` | string | Standing note that the fixture-versus-personalty line shifts purchase-price allocation, transfer-tax base, and depreciation. |
| `defer_to_counsel` | boolean | False; the priority follows deterministically from the supplied facts. |
| `red_flags` | string[] | Window-missed and no-fixture-filing warnings. |

## 4. Algorithm

Given `pmsi`, `fixture_filing_made`, and `prior_recorded_real_property_interest` (and optional `filing_days_after_affixation`, `construction_mortgage` (default false)):
1. The implementation SHALL require the three booleans; otherwise `status: "needs_inputs"`.
2. `within_20_day_window` SHALL be true iff a fixture filing was made and `filing_days_after_affixation ≤ 20` (constants: UCC § 9-334(d) 20-day window).
3. If there is no prior recorded real-property interest, `priority` SHALL be `fixture_secured_party` when a fixture filing was made, else `first_to_perfect`.
4. Else if a construction mortgage is present, `priority` SHALL be `real_property_interest` (§ 9-334(h) override).
5. Else if the interest is a PMSI within the 20-day window, `priority` SHALL be `fixture_secured_party` (§ 9-334(d) primes the recorded interest).
6. Else `priority` SHALL be `real_property_interest` (§ 9-334(c) default).
7. It SHALL raise red flags for a PMSI filed outside the 20-day window against a prior interest, and for a PMSI with no fixture filing.

## 5. Constants & authorities

| Constant | Value | Strength | Authority | Pin-cite | Effective | Next check |
|---|---|---|---|---|---|---|
| UCC § 9-334(d) 20-day window | 20 days after affixation | MUST (binding) | U.C.C. § 9-334(d) | § 9-334(d) | U.C.C. Article 9 (2010 revision), current | on uniform-act amendment |
| UCC § 9-334(h) construction-mortgage override | construction mortgage primes a fixture interest arising during construction | MUST (binding) | U.C.C. § 9-334(h) | § 9-334(h) | U.C.C. Article 9 (2010 revision), current | on uniform-act amendment |
| UCC § 9-334(c) default | the conflicting real-property interest prevails absent a qualifying exception | MUST (binding) | U.C.C. § 9-334(c) | § 9-334(c) | U.C.C. Article 9 (2010 revision), current | on uniform-act amendment |


**Authorities**

| Authority | ID | Type |
|---|---|---|
| UCC 9-334 | AUTH-0248 | statute |

## 6. Worked example

*A lender takes a purchase-money security interest in rooftop HVAC units and perfects by fixture filing 15 days after installation; within the 20-day window, the PMSI primes the recorded mortgage.*

**Inputs**

```json
{
  "pmsi": true,
  "fixture_filing_made": true,
  "prior_recorded_real_property_interest": true,
  "filing_days_after_affixation": 15,
  "construction_mortgage": false
}
```

**Outputs (executed against the reference implementation `MODEL.RE.FIXTURE_9334.v1`)**

```json
{
  "priority": "fixture_secured_party",
  "basis": "UCC § 9-334(d): PMSI perfected by fixture filing before affixation or within 20 days thereafter primes the prior recorded real-property interest.",
  "pmsi": true,
  "fixture_filing_made": true,
  "filing_days_after_affixation": 15,
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

This model resolves fixture-versus-real-property priority under UCC § 9-334 from perfection and timing facts. Whether an item is in fact a fixture, and whether a filing is legally effective, are determinations for counsel and the title insurer; the model computes the priority the supplied facts imply and flags the purchase-price-allocation consequence for reconciliation.

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

The 262 distinct authorities referenced by published entries, with provisional stable IDs. This public register is deliberately the *cited subset*: the full curated register (supersession chains, citator treatment, pin-cite validation, `next_check_due` machinery) is maintained internally and exported here only as published entries cite it. Entries typed `practice-norm` are market conventions without a controlling citation and are labeled as such rather than dressed as authority.

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
| AUTH-0018 | 25 Del. C. 153 | statute |
| AUTH-0019 | 35 U.S.C. 261 | statute |
| AUTH-0020 | 72 P.S. 1403 | statute |
| AUTH-0021 | AB Stable | practice-or-guidance |
| AUTH-0022 | ABA Business Law Today | practice-or-guidance |
| AUTH-0023 | ABA Earnout Reports | practice-norm |
| AUTH-0024 | ABA Model SPA | practice-norm |
| AUTH-0025 | ABA Model SPA IP Representations | practice-norm |
| AUTH-0026 | ABA Private Target Deal Points Study | study/dataset |
| AUTH-0027 | ABL Market Practice | practice-norm |
| AUTH-0028 | AGPL | practice-or-guidance |
| AUTH-0029 | Akorn | practice-or-guidance |
| AUTH-0030 | ALTA Endorsements | practice-norm |
| AUTH-0031 | ALTA Forms | practice-norm |
| AUTH-0032 | ALTA title practice | practice-norm |
| AUTH-0033 | Aon RWI Reports | practice-norm |
| AUTH-0034 | Apache | practice-or-guidance |
| AUTH-0035 | Appraisal Institute Practice | practice-norm |
| AUTH-0036 | ASC 842 | practice-or-guidance |
| AUTH-0037 | ASTM E2018 | practice-or-guidance |
| AUTH-0038 | At Home | practice-or-guidance |
| AUTH-0039 | BOMA | practice-or-guidance |
| AUTH-0040 | Brazen v. Bell Atlantic | case |
| AUTH-0041 | BSD | practice-or-guidance |
| AUTH-0042 | Bulk Sale Acts | statute |
| AUTH-0043 | Cal. Civ. Code 1214 | statute |
| AUTH-0044 | Cal. Civ. Code 1662 | statute |
| AUTH-0045 | Cal. Rev. & Tax. Code 60-64 | statute |
| AUTH-0046 | California Labor Code 2870 | statute |
| AUTH-0047 | Castleton Plaza | practice-or-guidance |
| AUTH-0048 | CERCLA 107 | statute |
| AUTH-0049 | CFIUS regulations | practice-or-guidance |
| AUTH-0050 | Channel Medsystems | practice-or-guidance |
| AUTH-0051 | Clorox v. Chemical Bank | case |
| AUTH-0052 | Codekeeper | practice-norm |
| AUTH-0053 | Collier 364.06 | practice-or-guidance |
| AUTH-0054 | Common-law deed covenants | case |
| AUTH-0055 | Convertible Financing Market Practice | practice-or-guidance |
| AUTH-0056 | CPRA | practice-or-guidance |
| AUTH-0057 | Credit Agreement Market Practice | practice-or-guidance |
| AUTH-0058 | CT 12-638 | practice-or-guidance |
| AUTH-0059 | Damodaran 2026 | study/dataset |
| AUTH-0060 | Delaware equitable-remedy case law | practice-or-guidance |
| AUTH-0061 | DGCL 170 | statute |
| AUTH-0062 | DGCL 251(h) | statute |
| AUTH-0063 | DGCL SB 21 | statute |
| AUTH-0064 | DOL ESOP guidance | practice-or-guidance |
| AUTH-0065 | English MAC case law | practice-or-guidance |
| AUTH-0066 | Envision | practice-or-guidance |
| AUTH-0067 | equitable conversion | case |
| AUTH-0068 | Escode | practice-norm |
| AUTH-0069 | ETA market norms | practice-or-guidance |
| AUTH-0070 | EU Merger Regulation 139/2004 | regulation |
| AUTH-0071 | fairness opinion case law | practice-or-guidance |
| AUTH-0072 | Fenwick 2023 ARBF analysis | practice-or-guidance |
| AUTH-0073 | Fisker | practice-or-guidance |
| AUTH-0074 | Form 1099-DA | form |
| AUTH-0075 | FRBP 3001 | practice-or-guidance |
| AUTH-0076 | FRED:BAMLC0A0CM | study/dataset |
| AUTH-0077 | FRED:BAMLH0A0HYM2 | study/dataset |
| AUTH-0078 | FRED:DGS10 | study/dataset |
| AUTH-0079 | FRED:DPRIME | study/dataset |
| AUTH-0080 | FRED:SOFR | study/dataset |
| AUTH-0081 | FRED:VIXCLS | study/dataset |
| AUTH-0082 | Frontier | practice-or-guidance |
| AUTH-0083 | FTC 2026 HSR - Auto-Reportable | practice-or-guidance |
| AUTH-0084 | FTC 2026 HSR - Size of Transaction | practice-or-guidance |
| AUTH-0085 | fund formation market practice | form |
| AUTH-0086 | GDPR | practice-or-guidance |
| AUTH-0087 | GENIUS Act | statute |
| AUTH-0088 | GPL | practice-or-guidance |
| AUTH-0089 | Ground Lease Lender Practice | practice-norm |
| AUTH-0090 | Houlihan Lokey 2023 Transaction Termination Fee Study | study/dataset |
| AUTH-0091 | Howey | practice-or-guidance |
| AUTH-0092 | HSR Act | statute |
| AUTH-0093 | ICANN Transfer Rules | practice-norm |
| AUTH-0094 | ILPA continuation-fund guidance | practice-or-guidance |
| AUTH-0095 | ILPA Guidance | practice-norm |
| AUTH-0096 | In re Peregrine | case |
| AUTH-0097 | In re Topps | case |
| AUTH-0098 | Indenture Practice | practice-norm |
| AUTH-0099 | Indianapolis Downs | practice-or-guidance |
| AUTH-0100 | INDOPCO | practice-or-guidance |
| AUTH-0101 | IP Carve-Out Practice Norms | practice-norm |
| AUTH-0102 | IP Licensing Industry Practice | practice-norm |
| AUTH-0103 | IRC 1001 | statute |
| AUTH-0104 | IRC 1031 | statute |
| AUTH-0105 | IRC 1042 | statute |
| AUTH-0106 | IRC 1060 | statute |
| AUTH-0107 | IRC 108 | statute |
| AUTH-0108 | IRC 1202 | statute |
| AUTH-0109 | IRC 1274 | statute |
| AUTH-0110 | IRC 1274A | statute |
| AUTH-0111 | IRC 1374 | statute |
| AUTH-0112 | IRC 1445 | statute |
| AUTH-0113 | IRC 1446(f) | statute |
| AUTH-0114 | IRC 163(j) | statute |
| AUTH-0115 | IRC 195 | statute |
| AUTH-0116 | IRC 197 | statute |
| AUTH-0117 | IRC 263 | statute |
| AUTH-0118 | IRC 280G | statute |
| AUTH-0119 | IRC 336 | statute |
| AUTH-0120 | IRC 336(e) | statute |
| AUTH-0121 | IRC 338 | statute |
| AUTH-0122 | IRC 338(h)(10) | statute |
| AUTH-0123 | IRC 351 | statute |
| AUTH-0124 | IRC 355 | statute |
| AUTH-0125 | IRC 355(e) | statute |
| AUTH-0126 | IRC 368 | statute |
| AUTH-0127 | IRC 368(a)(1)(F) | statute |
| AUTH-0128 | IRC 382 | statute |
| AUTH-0129 | IRC 382(b)(1) | statute |
| AUTH-0130 | IRC 453 | statute |
| AUTH-0131 | IRC 453A | statute |
| AUTH-0132 | IRC 483 | statute |
| AUTH-0133 | IRC 4999 | statute |
| AUTH-0134 | IRC 6045 | statute |
| AUTH-0135 | IRC 704(c) | statute |
| AUTH-0136 | IRC 721 | statute |
| AUTH-0137 | IRC 754 | statute |
| AUTH-0138 | IRC 856 | statute |
| AUTH-0139 | IRC 856-860 | statute |
| AUTH-0140 | IRC 857 | statute |
| AUTH-0141 | IRC 858 | statute |
| AUTH-0142 | IRC 859 | statute |
| AUTH-0143 | IRC 860 | statute |
| AUTH-0144 | IRC 897 | statute |
| AUTH-0145 | Iron Mountain Escrow Templates | practice-norm |
| AUTH-0146 | IRS Form 8288 | form |
| AUTH-0147 | IRS Form 8288-A | form |
| AUTH-0148 | IRS Form 8288-B | form |
| AUTH-0149 | IRS Form 8594 | form |
| AUTH-0150 | J. Crew | practice-or-guidance |
| AUTH-0151 | Kendall v. Ernest Pestana 40 Cal.3d 488 | case |
| AUTH-0152 | Kendall v. Ernest Pestana, Inc., 40 Cal.3d 488 (1985) | case |
| AUTH-0153 | Klang | practice-or-guidance |
| AUTH-0154 | Kroll 2024 | study/dataset |
| AUTH-0155 | Lanham Act 10 | statute |
| AUTH-0156 | Lease Abstraction Industry Practice | practice-norm |
| AUTH-0157 | Lender Practice | practice-norm |
| AUTH-0158 | Letter Ruling 202308010 | practice-or-guidance |
| AUTH-0159 | LGPL | practice-or-guidance |
| AUTH-0160 | Lockton RWI Reports | practice-norm |
| AUTH-0161 | LoPucki Bankruptcy Research Database | practice-or-guidance |
| AUTH-0162 | LSTA model AAL | practice-or-guidance |
| AUTH-0163 | LSTA Model Provisions | practice-norm |
| AUTH-0164 | market practice | practice-or-guidance |
| AUTH-0165 | Marketable-title common law | case |
| AUTH-0166 | Marsh RWI Reports | practice-norm |
| AUTH-0167 | Match Group | practice-or-guidance |
| AUTH-0168 | Matter of 105-02 Forest Hills (2025) | case |
| AUTH-0169 | MD Tax-Prop 12-117 | practice-or-guidance |
| AUTH-0170 | Merger doctrine (common law) | case |
| AUTH-0171 | MFW | practice-or-guidance |
| AUTH-0172 | MIT | practice-or-guidance |
| AUTH-0173 | Mitel | practice-or-guidance |
| AUTH-0174 | Moody's Ultimate Recovery Database | practice-or-guidance |
| AUTH-0175 | Morgan Lewis OSS Guidance | practice-norm |
| AUTH-0176 | Morse OSS Guidance | practice-norm |
| AUTH-0177 | MPM Silicones | practice-or-guidance |
| AUTH-0178 | Municipal CO Ordinances | statute |
| AUTH-0179 | N.Y. Gen. Oblig. Law 5-1311 | statute |
| AUTH-0180 | N.Y. Real Prop. Law 291 | statute |
| AUTH-0181 | Nasdaq Rule 5635 | practice-or-guidance |
| AUTH-0182 | NAV Facility Market Practice | practice-norm |
| AUTH-0183 | NIST CSF | practice-or-guidance |
| AUTH-0184 | Nixon Peabody OSS Guidance | practice-norm |
| AUTH-0185 | NVCA term sheet | practice-or-guidance |
| AUTH-0186 | NY assignment common law | case |
| AUTH-0187 | NY Publication 576 | study/dataset |
| AUTH-0188 | NY Tax Law 1405(b)(6) | statute |
| AUTH-0189 | NYC Admin. Code 11-2101 | statute |
| AUTH-0190 | OBBBA 2025 | practice-or-guidance |
| AUTH-0191 | OBBBA Sec. 70301 | practice-or-guidance |
| AUTH-0192 | OBBBA Sec. 70302 | practice-or-guidance |
| AUTH-0193 | OBBBA Sec. 70425 | practice-or-guidance |
| AUTH-0194 | OBBBA Sec. 70505 | practice-or-guidance |
| AUTH-0195 | OFAC | practice-or-guidance |
| AUTH-0196 | PATH Act 2015 | statute |
| AUTH-0197 | Pepperdine PCAP 2025 | study/dataset |
| AUTH-0198 | Pluralsight | practice-or-guidance |
| AUTH-0199 | Project Finance Market Practice | practice-norm |
| AUTH-0200 | RadLAX | practice-or-guidance |
| AUTH-0201 | Real Estate Industry Practice | practice-norm |
| AUTH-0202 | Real Estate Practice Norms | practice-norm |
| AUTH-0203 | Regulation (EU) 2024/1689 | practice-or-guidance |
| AUTH-0204 | Restructuring Market Practice | practice-or-guidance |
| AUTH-0205 | Rev. Proc. 2011-29 | guidance |
| AUTH-0206 | Rhone-Poulenc Agro v. DeKalb | case |
| AUTH-0207 | ROFR/option common law | case |
| AUTH-0208 | Rule 14d-10 | practice-or-guidance |
| AUTH-0209 | Rule 14e-1 | practice-or-guidance |
| AUTH-0210 | Rutledge v. Clearway | case |
| AUTH-0211 | RWI market studies | practice-or-guidance |
| AUTH-0212 | Sabre | practice-or-guidance |
| AUTH-0213 | SBA SOP 50 10 8 | guidance |
| AUTH-0214 | SEC climate and ESG references | practice-or-guidance |
| AUTH-0215 | SEC climate disclosure references | practice-or-guidance |
| AUTH-0216 | SEC Project Crypto | practice-or-guidance |
| AUTH-0217 | Secondary Market Practice | practice-or-guidance |
| AUTH-0218 | Securities Act 3(a)(9) | statute |
| AUTH-0219 | Serta Simmons | practice-or-guidance |
| AUTH-0220 | SRS Acquiom Deal Terms Study 2024 | study/dataset |
| AUTH-0221 | SRS Acquiom Deal Terms Study 2025 | study/dataset |
| AUTH-0222 | SRS Acquiom Earnout Data | study/dataset |
| AUTH-0223 | SRS Acquiom Working Capital PPA Study | study/dataset |
| AUTH-0224 | State ABC Law | statute |
| AUTH-0225 | State CITT Statutes | statute |
| AUTH-0226 | State Employee-IP Statutes | statute |
| AUTH-0227 | State Nexus Statutes | statute |
| AUTH-0228 | State Title Statutes | statute |
| AUTH-0229 | T.D. 10000 | practice-or-guidance |
| AUTH-0230 | Tex. Const. art. VIII 29 | statute |
| AUTH-0231 | Tex. Prop. Code 13.001 | statute |
| AUTH-0232 | Tex. Prop. Code 5.007 | statute |
| AUTH-0233 | Tex. Prop. Code 5.023 | statute |
| AUTH-0234 | Texas Grand Prairie | practice-or-guidance |
| AUTH-0235 | TIA 316(b) | practice-or-guidance |
| AUTH-0236 | Till | practice-or-guidance |
| AUTH-0237 | Topp | practice-or-guidance |
| AUTH-0238 | TRA market practice | practice-or-guidance |
| AUTH-0239 | Treas. Reg. 1.1060-1 | regulation |
| AUTH-0240 | Treas. Reg. 1.263(a)-5 | regulation |
| AUTH-0241 | Treas. Reg. 1.336-2 | regulation |
| AUTH-0242 | Treas. Reg. 1.338-6 | regulation |
| AUTH-0243 | Treas. Reg. 1.368 | regulation |
| AUTH-0244 | Tribune | practice-or-guidance |
| AUTH-0245 | Trinseo | practice-or-guidance |
| AUTH-0246 | TX strict-match construction | case |
| AUTH-0247 | TX strict-match ROFR construction | statute |
| AUTH-0248 | UCC 9-334 | statute |
| AUTH-0249 | UCC 9-610 | statute |
| AUTH-0250 | UCC 9-611 | statute |
| AUTH-0251 | UCC 9-615 | statute |
| AUTH-0252 | UCC Art. 6 (as retained) | statute |
| AUTH-0253 | UCC Article 9 | statute |
| AUTH-0254 | UDITPA | practice-or-guidance |
| AUTH-0255 | UFTA | practice-or-guidance |
| AUTH-0256 | UK Enterprise Act 2002 | statute |
| AUTH-0257 | UK market practice | practice-or-guidance |
| AUTH-0258 | USPTO Form PTO-1594 | form |
| AUTH-0259 | UVTA | practice-or-guidance |
| AUTH-0260 | Venture Debt Market Practice | practice-norm |
| AUTH-0261 | WA RCW 82.45 | practice-or-guidance |
| AUTH-0262 | YC SAFE | practice-or-guidance |


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
