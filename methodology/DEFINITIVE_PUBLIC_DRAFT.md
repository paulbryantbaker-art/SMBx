<!-- GENERATED review draft (generator v4, DEPTH pass: publish gate + Conventions/precision + honest counts + gate registry + first tax family) —
     built by scripts/build-definitive-public.ts over scripts/definitivePublicOverlay.ts. Do not hand-edit; regenerate instead.
     Governance + publish gate: dist/definitive-internal/GOVERNANCE.md. Burndown: dist/definitive-internal/GAP_LEDGER.md.
     Founder actions: dist/definitive-internal/GATE_REGISTRY_FOR_FOUNDER_APPROVAL.md -->

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

**At a glance:** **134 model slots mapped** · **17 implementable from this document today** · 68 normative scheduled (authoring by family) · 47 catalog · 2 reserved · **30-gate routing framework** (17 routed; 3 specified) · **262 authority anchors** (as referenced) · **655-case conformance suite** (385 model-runtime).

The specification publishes at two maturity tiers, labeled on every entry and
in the index. **Normative** entries carry the full contract — input and output
schemas, algorithm, worked example, error semantics, and conformance
bindings — and each carries its contract in full; entries marked **implementable from this document alone** have a complete authored contract today, while the remainder are being authored family by family (see the changelog). **Catalog** entries
are informative maps of scope, boundary, routing, and authorities whose
normative contracts are scheduled. The breadth claim (134 slots
mapped) and the rigor claim (17 implementable from
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
| `acceleration_risk` | enum(acceleration_risk) | The lender's acceleration posture. |
| `act_type` | enum(recording_act_type) | The recording-act family applied. |
| `after_acquired_title_applies` | boolean | Whether estoppel-by-deed vests later-acquired title in the grantee. |
| `aggregation_years` | integer | null | The acting-in-concert aggregation window in years, or null. |
| `all_required_signers_present` | boolean | Whether every party the vesting form requires is on the signature page; explicit false raises a signatory gap. |
| `allocated_cents` | integer (cents) | Total amount allocated across the classes. |
| `allocations` | object[] | Per-class schedule: `{ class_number, class_name, fair_market_value_cents, allocated_cents, capped_at_fmv }`. |
| `annual_debt_service_cents` | integer (cents) | Annual principal-and-interest debt service on the acquisition debt. |
| `annual_section_382_limitation_cents` | integer (cents) | The annual §382 limitation on pre-change NOL use. |
| `asset_classes` | object[] | The asset classes with fair market values; each object carries `class_number` (1–7), `class_name` (string), and `fair_market_value_cents` (integer cents). |
| `auto_reportable_cents` | integer (cents) | The current HSR auto-reportable ceiling, in cents. |
| `base_amount_cents` | integer (cents) | The executive's §280G base amount (five-year average W-2 compensation). |
| `basis` | enum(risk_basis) | The basis for the allocation. |
| `bfp_protected` | boolean | Whether the later purchaser takes free of the prior interest as a protected bona-fide purchaser. |
| `bulk_sales_citations` | string[] | Per-state bulk-sales citations for the applicable states. |
| `bulk_sales_notification_states` | string[] | Applicable bulk-sales notification states. |
| `buyer_equity_cents` | integer (cents) | Buyer equity injection into the transaction. |
| `buyer_equity_pct` | number | Buyer equity as a fraction of purchase price (0–1). |
| `buyer_expects_warranty` | boolean | Whether the buyer is negotiating for title warranties (default true); drives the warranty-gap flag. |
| `cash_flow_cents` | integer (cents) | Post-acquisition annual free cash flow available for debt service. |
| `cercla_linked_property` | boolean | Whether the property has a CERCLA/environmental linkage (default false). |
| `cercla_successor_flag` | boolean | Whether CERCLA successor liability is flagged. |
| `citation` | string | The statutory citation for the state's recording act. |
| `citt_screen_triggered` | boolean | Whether the controlling-interest transfer-tax screen fires. |
| `class_v_tangible_cents` | integer (cents) | Amount allocated to Class V tangible/§1231 assets. |
| `class_vi_section_197_intangibles_cents` | integer (cents) | Amount allocated to Class VI §197 intangibles (excluding goodwill). |
| `class_vii_goodwill_cents` | integer (cents) | Residual allocated to Class VII goodwill and going-concern value. |
| `classification` | enum(lease_classification) | How the transfer classifies against the restriction. |
| `cleansing_vote_passed` | boolean | null | Whether the supplied vote exceeds the threshold, or null when no vote is supplied. |
| `cleansing_vote_threshold_pct` | number | The disinterested-shareholder approval threshold (0.75). |
| `co_required_on_transfer` | boolean | Whether a certificate of occupancy must be re-issued on this transfer. |
| `coc_default_note` | string | null | The change-of-control default note when a control transfer is not deemed an assignment, else null. |
| `consent_clause` | enum(consent_clause) | The lease consent provision as parsed. |
| `consent_required` | boolean | Whether landlord consent is required for the transfer. |
| `consent_standard` | enum(consent_standard) | The governing consent standard when consent is required, else null. |
| `consent_standard_citation` | string | null | Citation for the state default when the clause states no standard, else null. |
| `construction_mortgage` | boolean | Whether the prior interest is a construction mortgage (default false); triggers the § 9-334(h) override. |
| `contract_allocates_risk` | boolean | Whether the purchase contract expressly allocates pre-closing casualty risk. |
| `contract_override_applied` | boolean | Whether an express contract allocation controls. |
| `contract_risk_on` | enum(contract_risk_on) | The party the contract places risk on, when it allocates. |
| `contract_title_standard` | enum(contract_title_standard) | The title standard the purchase contract promises (default marketable). |
| `controlling_interest_threshold_pct` | number | null | The controlling-interest threshold for the state, or null. |
| `counsel_handoff` | string | null | The routing sentence when a signatory gap defers, else null. |
| `covenant_scope` | string | Whether covenants reach all defects or only the grantor's own acts, or none. |
| `covenants_present` | string[] | The title covenants this deed conveys (empty for bargain-and-sale and quitclaim). |
| `cumulative_related_transfers_pct` | number | Cumulative percentage transferred across related steps within the aggregation window (0–100); defaults to transfer_pct. |
| `curable_count` | integer | Number of exceptions triaged curable. |
| `deal_form` | enum(permit_deal_form) | The acquisition form. |
| `deal_killing_count` | integer | Number triaged deal-killing (unmarketable and uninsurable). |
| `deed_note` | string | Plain-language description of the deed's covenant coverage. |
| `deed_type` | enum(deed_type) | The deed instrument type being conveyed. |
| `default_regime` | enum(risk_basis) | The state default regime that would govern absent a contract term. |
| `defer_to_counsel` | boolean | True only when the state is untabled; the ordering then defers. |
| `dscr` | number | Debt-service coverage ratio: cash flow ÷ annual debt service. |
| `enterprise_value_cents` | integer (cents) | The size of the transaction being tested against the HSR thresholds. |
| `estimated_years_to_use_nol` | integer | null | Whole-year ceiling to absorb the NOL at the annual limitation, or null. |
| `exceptions` | object[] | Title-commitment exceptions; each object carries `label` (string), `curable` (boolean), and `insurer_will_insure_over` (boolean). |
| `excess_parachute_payment_cents` | integer (cents) | The excess parachute payment (payments over one times base) when triggered, else 0. |
| `excise_tax_20pct_cents` | integer (cents) | The §4999 excise tax on the excess (20%). |
| `filing_days_after_affixation` | integer | Days between affixation and the fixture filing; decisive for the 20-day PMSI window. |
| `fixture_filing_made` | boolean | Whether a fixture filing was made in the real-property records (a UCC-1 alone does not suffice). |
| `fraud_exception_note` | string | Standing note that fraud claims survive merger regardless of survival language. |
| `high_cents` | integer (cents) | Maximum observed monthly net working capital. |
| `hsr_size_triggered` | boolean | Whether the transaction meets or exceeds the size-of-transaction threshold. |
| `insurable_over_count` | integer | Number triaged insurable-over. |
| `is_entity_transfer` | boolean | Whether the transaction moves interests in an entity that owns the property (rather than a deed). |
| `items` | object[] | Relied-on obligations; each object carries `label` (string), `type` (a survival_item_type value), `express_survival` (boolean), and `collateral_obligation` (boolean). |
| `jurisdiction_requires_co_on_transfer` | boolean | Whether the jurisdiction requires a certificate of occupancy to be re-issued on transfer. |
| `landlord_recapture_right` | boolean | Whether the landlord holds a recapture right triggered by a consent request (default false). |
| `later_purchaser_for_value` | boolean | Whether the later-in-time purchaser gave value (a threshold for bona-fide-purchaser protection in every act). |
| `later_recorded_first` | boolean | Whether the later purchaser recorded before the prior interest (decisive in race and race-notice states). |
| `later_took_without_notice` | boolean | Whether the later purchaser took without actual or constructive notice of the prior interest (decisive in notice and race-notice states). |
| `lease_deems_change_of_control_assignment` | boolean | Whether the lease expressly deems a control transfer an assignment (default false). |
| `legal_title_or_possession_passed` | boolean | Whether legal title or possession has passed to the buyer (default false); decisive under UVPRA/NY regimes. |
| `lender_consent_critical_path` | boolean | Whether lender consent (or payoff/refinance) is a closing-condition critical path. |
| `loan_has_due_on_transfer_clause` | boolean | Whether the loan documents contain a due-on-sale/due-on-transfer clause. |
| `long_term_tax_exempt_rate` | number | The IRS long-term tax-exempt rate for the change month (a fraction, e.g. 0.0435); supplied at runtime. |
| `loss_corporation_value_cents` | integer (cents) | The equity value of the loss corporation immediately before the ownership change (§382(e)). |
| `lost_employer_deduction_cents` | integer (cents) | The employer deduction disallowed under §280G (equal to the excess). |
| `low_cents` | integer (cents) | Minimum observed monthly net working capital. |
| `material_casualty_or_condemnation_pending` | boolean | Whether a material casualty or condemnation is pending (default false); drives the silent-contract red flag. |
| `max_7a_loan_cents` | integer (cents) | The statutory 7(a) maximum loan amount, in cents. |
| `meets_sba_dscr_floor` | boolean | Whether the coverage ratio meets or exceeds the SBA 7(a) DSCR floor. |
| `meets_sba_equity_floor` | boolean | Whether buyer equity meets or exceeds the SBA 7(a) minimum equity injection. |
| `mere_change_exemption_claimed` | boolean | Whether a mere-change-of-identity exemption is being claimed (default false). |
| `merged_away_count` | integer | Number that merge into the deed at closing. |
| `monthly_nwc_cents` | integer (cents)[] | Trailing monthly net-working-capital observations, one integer-cents value per month; order is immaterial to the peg. |
| `nol_carryforward_cents` | integer (cents) | The pre-change NOL carryforward balance; optional, drives the years-to-absorb estimate. |
| `non_transferable_permits` | string[] | Labels of permits that do not travel with the transfer. |
| `observed_months` | integer | Number of monthly observations the peg was computed over. |
| `parachute_payments_cents` | integer (cents) | Aggregate contingent-on-change-in-control payments to the executive. |
| `peg_cents` | integer (cents) | The working-capital peg: the trailing arithmetic mean of the observations, to the nearest cent. |
| `permits` | object[] | Operating permits; each object carries `label` (string) and `transferable` (boolean). |
| `pmsi` | boolean | Whether the fixture interest is a purchase-money security interest. |
| `ppa_note` | string | Standing note that the fixture-versus-personalty line shifts purchase-price allocation, transfer-tax base, and depreciation. |
| `prevailing_interest` | enum(prevailing_interest) | Which competing interest the act favors on the facts. |
| `prior_recorded_real_property_interest` | boolean | Whether a conflicting real-property interest (e.g., a mortgage) was recorded first. |
| `priority` | enum(fixture_priority) | Which interest holds priority in the fixture. |
| `purchase_price_cents` | integer (cents) | Total acquisition purchase price. |
| `reassessment_screen_triggered` | boolean | Whether the property-tax reassessment screen fires. |
| `red_flags` | string[] | Priority-hygiene warnings (unrecorded interests; race-state notice anomaly). |
| `regime_known` | boolean | Whether the state is in the transfer-tax regime table. |
| `related_steps_planned` | boolean | Whether related transfer steps are planned (default false); with a mere-change claim this drives step-transaction risk. |
| `required_signatories` | string | Who must sign for a conveyance of the whole. |
| `residential_under_5_units` | boolean | Whether the collateral is residential real property of fewer than five dwelling units. |
| `right_captures_entity_transfers` | boolean | Whether the right's language expressly captures entity-level (indirect) transfers. |
| `right_type` | enum(right_type) | The preemptive right at issue. |
| `risk_on` | enum(risk_on) | The party bearing pre-closing casualty risk. |
| `section_280g_triggered` | boolean | Whether the payments meet or exceed three times the base amount. |
| `shareholder_cleansing_vote_pct` | number | Fraction of disinterested shareholders approving the payments (0–1); optional. |
| `signatory_gap` | boolean | Whether a required signatory is missing. |
| `size_of_transaction_cents` | integer (cents) | The transaction size under test, in cents. |
| `state` | string (US state code) | Two-letter code of the situs state, used to select the recording act. |
| `states_involved` | string[] | Two-letter state codes touched by the deal, screened against the bulk-sales table. |
| `step_transaction_risk` | boolean | Whether a mere-change claim plus related steps raises step-transaction risk. |
| `surviving_count` | integer | Number of items that survive closing. |
| `three_times_base_threshold_cents` | integer (cents) | The three-times-base-amount safe-harbor threshold. |
| `threshold_cents` | integer (cents) | The current HSR size-of-transaction threshold, in cents. |
| `transaction_form` | enum(preemptive_transaction_form) | The transaction form being tested. |
| `transfer_kind` | enum(transfer_kind) | The nature of the transfer (default deed_sale); the last six enum values are the Garn-protected consumer transfers. |
| `transfer_pct` | number | Percentage of entity interests transferred in this step (0–100). |
| `transfer_type` | enum(lease_transfer_type) | The form of the transfer being tested. |
| `triage` | object[] | One row per exception: `{ label, bucket }` where bucket is a triage_bucket value. |
| `trigger_status` | enum(trigger_status) | Whether and why the transaction implicates the right. |
| `tx_seisin_note` | string | null | The Texas seisin-narrowing note when the state is TX, else null. |
| `tx_strict_match_note` | string | null | The Texas strict-match note when applicable, else null. |
| `unallocated_cents` | integer (cents) | Non-negative residual when supplied fair market values exceed the price (normally zero). |
| `use_change` | boolean | Whether the transaction involves a change of use (default false); can require a CO even in an entity deal. |
| `vesting_form` | enum(vesting_form) | How record title is held. |
| `within_20_day_window` | boolean | Whether the fixture filing fell within the 20-day PMSI window. |

## Enumerations

Enumerated values are part of the normative contract — a conforming implementation accepts and emits only these values for the field types below.

- **`acceleration_risk`** — The lender's acceleration posture on the transfer.
  - Values: `none_no_clause`, `barred_by_garn_exception`, `lender_option_on_transfer`
- **`consent_clause`** — The lease consent provision as parsed: silent, consent required with no stated standard, express reasonableness, or express sole discretion.
  - Values: `none_silent`, `consent_no_standard`, `reasonableness`, `sole_discretion`
- **`consent_standard`** — The consent standard that governs, resolved from the clause and the state consent-standard table.
  - Values: `reasonableness_express`, `sole_discretion_as_written`, `sole_discretion_written_verify_ca_limits`, `implied_reasonableness`, `as_written_sole_discretion_enforced`, `unsettled_check_state`
- **`contract_risk_on`** — The party the contract expressly places pre-closing casualty risk on, when it allocates risk.
  - Values: `seller`, `buyer`
- **`contract_title_standard`** — The title standard the purchase contract promises the buyer.
  - Values: `marketable`, `insurable`
- **`deed_type`** — The deed instrument type, which fixes the title-covenant set conveyed.
  - Values: `general_warranty`, `special_warranty`, `bargain_and_sale`, `quitclaim`
- **`fixture_priority`** — Which competing interest holds priority in the fixture under UCC § 9-334.
  - Values: `fixture_secured_party`, `first_to_perfect`, `real_property_interest`
- **`lease_classification`** — How the transfer classifies against the lease transfer-restriction terms.
  - Values: `deemed_assignment_consent_path_applies`, `generally_not_assignment_by_operation_of_law`, `assignment_restriction_applies`, `no_restriction_freely_assignable`
- **`lease_transfer_type`** — The form of the transfer being tested against the lease transfer-restriction terms.
  - Values: `asset_assignment`, `sublease`, `change_of_control`, `merger`
- **`permit_deal_form`** — The acquisition form, which governs whether permits and certificates re-issue and whether bulk-sales notification applies.
  - Values: `asset`, `entity`, `merger`
- **`preemptive_transaction_form`** — The transaction form tested for whether it triggers the preemptive right.
  - Values: `asset_sale`, `entity_transfer`, `merger`
- **`prevailing_interest`** — Which competing interest the recording act favors on the supplied facts.
  - Values: `later_purchaser`, `prior_interest`, `undetermined`
- **`recording_act_type`** — The recording-act family the state applies; unknown means the state is not in the table and the result defers.
  - Values: `race`, `notice`, `race_notice`, `unknown`
- **`right_type`** — The preemptive right at issue: a purchase option, a right of first refusal, or a right of first offer.
  - Values: `option`, `rofr`, `rofo`
- **`risk_basis`** — The legal basis for the risk allocation: an express contract term, or a named state default regime.
  - Values: `contract_override`, `equitable_conversion_default`, `uvpra_seller`, `ny_risk_act_seller`
- **`risk_on`** — The party carrying pre-closing casualty risk under the governing rule.
  - Values: `buyer`, `seller`, `per_contract_terms`
- **`survival_item_type`** — The kind of relied-on obligation being tracked for survival past closing.
  - Values: `representation`, `warranty`, `covenant`, `indemnity`
- **`transfer_kind`** — The nature of the transfer being screened against the loan's due-on-transfer clause; the last six are the Garn-St. Germain § 1701j-3(d) protected consumer transfers.
  - Values: `deed_sale`, `entity_transfer`, `transfer_to_spouse_or_child`, `transfer_on_death_to_relative`, `divorce_decree_transfer_to_spouse`, `inter_vivos_trust_borrower_beneficiary`, `junior_lien_creation`, `leasehold_under_3y_no_option`
- **`triage_bucket`** — The disposition bucket for a single title exception.
  - Values: `curable`, `insurable_over`, `deal_killing`
- **`trigger_status`** — Whether and why the transaction form implicates the preemptive right.
  - Values: `triggered_property_sale`, `triggered_entity_capture_language`, `likely_not_triggered_structural`
- **`vesting_form`** — How record title is held, which fixes whose signature a conveyance of the whole requires.
  - Values: `sole`, `tenancy_in_common`, `joint_tenancy`, `tenancy_by_entirety`, `community_property`, `entity`

## Fields pending normative authoring

These field names appear in models whose normative contracts are still being authored; they are listed for completeness and are **not** yet part of the designed vocabulary. Their types and descriptions land as each model's overlay is authored.

`acceleration_triggers` · `actual_nwc_cents` · `afr_rate` · `aggregate_noncontingent_liquidated_debt_cents` · `allowed_claim_cents` · `alta_endorsements_requested` · `amount_realized_cents` · `annual_ground_rent_cents` · `annual_rent_cents` · `assets` · `assignee_fee_cents` · `available_capital_cents` · `base_rate` · `basis_at_conversion_cents` · `basket_pct` · `baskets` · `boot_received_cents` · `breakup_fee_cents` · `bright_line_date` · `bulk_sale_clearance_required` · `buyer_step_up_pv_benefit_cents` · `buyer_will_use_as_residence` · `call_price_pct` · `cap_rate` · `cash_interest_rate` · `circuit` · `claims` · `class_vi_intangibles_cents` · `class_vote_amount_pct` · `class_vote_number_pct` · `classes` · `closing_date` · `closing_day_of_period` · `collateral_value_cents` · `commitment_cents` · `components` · `conditions` · `consideration_mix` · `contributors` · `conversion_date` · `corporate_tax_rate` · `coupon_rate` · `credit_bid_claim_cents` · `creditor_classes` · `curative_items` · `deal_type` · `debt_assumable` · `debts_due_cents` · `deposit_verification_tier` · `discount_pct` · `discount_rate` · `disposition_months` · `disposition_pct` · `dispute_forum` · `distributions_cents` · `earnout_targets` · `earnout_value_cents` · `ebitda_growth_pct` · `economic_life_years` · `effective_gross_income_cents` · `efficient_market_exists` · `efficient_market_rate` · `eligible_ar_cents` · `eligible_inventory_cents` · `engaged_in_commercial_activity` · `entity_carried_basis_cents` · `estate_value_cents` · `estimated_nwc_cents` · `excess_layers` · `exclusions` · `exercise_price_cents` · `exit_leverage` · `face_amount_cents` · `fair_value_assets_cents` · `fair_value_share_price_cents` · `federal_tax_rate` · `fiduciary_out_present` · `fmv_at_conversion_cents` · `fmv_real_property_cents` · `forecast_periods` · `form_8288_b_reduced_withholding_requested` · `fund_nav_cents` · `gain_cents` · `general_buffer_rate` · `general_cap_pct` · `general_reps_months` · `ground_lease_expiry_date` · `guc_recovery_pct` · `installment_receivable_cents` · `interest_inconsequential` · `interest_transferred_pct` · `investment_cents` · `ip_assets` · `ip_intangibles_cents` · `issues` · `jurisdiction` · `last_deposit_date` · `lease_term_years` · `leases` · `lender_policy_required` · `lender_recognition_agreement` · `liabilities_cents` · `licenses` · `lien_amount_cents` · `liquidation_value_cents` · `liquidity_months` · `loan_amount_cents` · `loan_maturity_date` · `market_cap_rate_from_pass_through_source` · `material_ip_categories` · `metrics` · `milestones` · `minimum_dscr` · `minimum_liquidity_cents` · `minimum_participation_pct` · `new_money_minimum_cents` · `new_security_value_cents` · `new_value` · `noi_cents` · `notice_days` · `old_security_value_cents` · `opco_ebitda_cents` · `opening_cash_cents` · `operating_expenses_cents` · `option_pool_pct` · `outstanding_debt_cents` · `participating_debt_cents` · `pca_items` · `pe_owned_target` · `period_days` · `plan_payment_stream_cents` · `policy_tower_pct` · `post_closing_covenants` · `post_default_trading_price` · `pre_money_cents` · `pre_money_share_count` · `priced_round_share_price_cents` · `priming_requested` · `principal_cents` · `prior_bankruptcy_count` · `probabilities` · `professional_fee_carveout_cents` · `projected_cash_flow_cents` · `property_sold_under_363_or_plan` · `pv_lease_payments_cents` · `real_estate_assets_cents` · `real_estate_income_cents` · `real_property_value_cents` · `recognized_gain_cents` · `recourse` · `recoverable_expenses_cents` · `release_triggers` · `relinquished_property_value_cents` · `remaining_years` · `rent_roll` · `replacement_property_value_cents` · `replacement_reserve_cents` · `required_capital_cents` · `required_cushion_pct` · `reserves_cents` · `residual_value_pct` · `retention_pct` · `rev_proc_2011_29_safe_harbor_elected` · `risk_premium` · `rollup_amount_cents` · `round_size_cents` · `rwi_present` · `sale_costs_cents` · `sale_date` · `sale_price_cents` · `sales_use_tax_base_cents` · `sales_use_tax_rate` · `schedule_b_exceptions` · `searches` · `section_1031_exchange` · `section_363f_prongs` · `security_terms` · `seller_entity_type` · `seller_foreign_person` · `seller_indemnity_cap_pct` · `seller_marginal_tax_rate` · `seller_structure_tax_delta_cents` · `seller_tax_basis_cents` · `seller_tax_delta_cents` · `special_escrows_cents` · `spread_bps` · `state_apportionment_pct` · `state_tax_rate` · `stated_interest_rate` · `step_up_benefit_rate` · `strip_percentage` · `survey_received` · `tangible_assets_cents` · `target_cap_rate` · `tax_characterization` · `taxable_income_cents` · `tenant_payments_cents` · `tenant_pro_rata_pct` · `term_months` · `term_years` · `termination_events` · `thirteen_week_cash_need_cents` · `time_to_recovery_years` · `title_commitment_received` · `toggle_type` · `total_assets_cents` · `total_income_cents` · `tranches` · `transaction_costs` · `transaction_value_cents` · `transfer_assets` · `transfer_date` · `transfer_tax_rate` · `treasury_rate` · `trustee_fee_cents` · `update_frequency_months` · `valuation_cap_cents` · `warrant_coverage_pct`


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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| ABA Private Target Deal Points Study | AUTH-0026 | study/dataset |
| SRS Acquiom Deal Terms Study 2025 | AUTH-0221 | study/dataset |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| ABA Private Target Deal Points Study | AUTH-0026 | study/dataset |
| SRS Acquiom Deal Terms Study 2025 | AUTH-0221 | study/dataset |

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
| `buyer_equity_cents` | integer (cents) | MUST | Buyer equity injection into the transaction. |
| `cash_flow_cents` | integer (cents) | MUST | Post-acquisition annual free cash flow available for debt service. |
| `purchase_price_cents` | integer (cents) | MUST | Total acquisition purchase price. |
| `annual_debt_service_cents` | integer (cents) | MAY | Annual principal-and-interest debt service on the acquisition debt. |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| NVCA term sheet | AUTH-0185 | practice-or-guidance |

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

- AUTH-0181 — Nasdaq Rule 5635


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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| 11 U.S.C. 548 | AUTH-0012 | statute |
| UVTA | AUTH-0259 | practice-or-guidance |
| Tribune | AUTH-0244 | practice-or-guidance |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| 11 U.S.C. 363 | AUTH-0008 | statute |
| 11 U.S.C. 365 | AUTH-0010 | statute |
| RadLAX | AUTH-0200 | practice-or-guidance |
| Fisker | AUTH-0073 | practice-or-guidance |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| 11 U.S.C. 1129(a)(11) | AUTH-0003 | statute |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| 11 U.S.C. 1129(a)(7) | AUTH-0004 | statute |
| 11 U.S.C. 726 | AUTH-0013 | statute |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| 11 U.S.C. 1129(b) | AUTH-0005 | statute |
| 203 N. LaSalle | AUTH-0017 | practice-or-guidance |
| Castleton Plaza | AUTH-0047 | practice-or-guidance |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| Till | AUTH-0236 | practice-or-guidance |
| MPM Silicones | AUTH-0177 | practice-or-guidance |
| Texas Grand Prairie | AUTH-0234 | practice-or-guidance |
| Topp | AUTH-0237 | practice-or-guidance |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| 11 U.S.C. 1111(b) | AUTH-0001 | statute |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| 11 U.S.C. 507 | AUTH-0011 | statute |
| 11 U.S.C. 726 | AUTH-0013 | statute |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| 11 U.S.C. 364 | AUTH-0009 | statute |
| Collier 364.06 | AUTH-0053 | practice-or-guidance |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| market practice | AUTH-0164 | practice-or-guidance |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| Securities Act 3(a)(9) | AUTH-0218 | statute |
| TIA 316(b) | AUTH-0235 | practice-or-guidance |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| 11 U.S.C. 1125 | AUTH-0002 | statute |
| Indianapolis Downs | AUTH-0099 | practice-or-guidance |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| UCC 9-610 | AUTH-0249 | statute |
| UCC 9-611 | AUTH-0250 | statute |
| UCC 9-615 | AUTH-0251 | statute |
| State ABC Law | AUTH-0224 | statute |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| Moody's Ultimate Recovery Database | AUTH-0174 | practice-or-guidance |
| FRBP 3001 | AUTH-0075 | practice-or-guidance |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| 11 U.S.C. 1181-1195 | AUTH-0007 | statute |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| LoPucki Bankruptcy Research Database | AUTH-0161 | practice-or-guidance |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| IRC 1445 | AUTH-0112 | statute |
| IRS Form 8288 | AUTH-0146 | form |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| IRC 1031 | AUTH-0104 | statute |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| ASC 842 | AUTH-0036 | practice-or-guidance |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| IRC 856-860 | AUTH-0139 | statute |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| IRC 1446(f) | AUTH-0113 | statute |
| ILPA Guidance | AUTH-0095 | practice-norm |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| market practice | AUTH-0164 | practice-or-guidance |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| NAV Facility Market Practice | AUTH-0182 | practice-norm |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| YC SAFE | AUTH-0262 | practice-or-guidance |
| market practice | AUTH-0164 | practice-or-guidance |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| Venture Debt Market Practice | AUTH-0260 | practice-norm |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| ABL Market Practice | AUTH-0027 | practice-norm |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| Indenture Practice | AUTH-0098 | practice-norm |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| LSTA Model Provisions | AUTH-0163 | practice-norm |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| IRC 1001 | AUTH-0103 | statute |
| IRC 1060 | AUTH-0106 | statute |
| IRC 197 | AUTH-0116 | statute |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| Treas. Reg. 1.338-6 | AUTH-0242 | regulation |
| IRS Form 8594 | AUTH-0149 | form |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| Real Estate Industry Practice | AUTH-0201 | practice-norm |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| Appraisal Institute Practice | AUTH-0035 | practice-norm |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| CT 12-638 | AUTH-0058 | practice-or-guidance |
| MD Tax-Prop 12-117 | AUTH-0169 | practice-or-guidance |
| WA RCW 82.45 | AUTH-0261 | practice-or-guidance |
| NY Publication 576 | AUTH-0187 | study/dataset |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| BOMA | AUTH-0039 | practice-or-guidance |
| Real Estate Industry Practice | AUTH-0201 | practice-norm |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| Lease Abstraction Industry Practice | AUTH-0156 | practice-norm |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| IRC 163(j) | AUTH-0114 | statute |
| IRC 856 | AUTH-0138 | statute |
| ASC 842 | AUTH-0036 | practice-or-guidance |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| ALTA Endorsements | AUTH-0030 | practice-norm |
| Real Estate Practice Norms | AUTH-0202 | practice-norm |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| ALTA Forms | AUTH-0031 | practice-norm |
| State Title Statutes | AUTH-0228 | statute |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| Lender Practice | AUTH-0157 | practice-norm |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| ASTM E2018 | AUTH-0037 | practice-or-guidance |
| Lender Practice | AUTH-0157 | practice-norm |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| IRC 897 | AUTH-0144 | statute |
| IRC 1445 | AUTH-0112 | statute |
| IRS Form 8288 | AUTH-0146 | form |
| IRS Form 8288-A | AUTH-0147 | form |
| IRS Form 8288-B | AUTH-0148 | form |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| IRC 338(h)(10) | AUTH-0122 | statute |
| IRC 336(e) | AUTH-0120 | statute |
| Treas. Reg. 1.336-2 | AUTH-0241 | regulation |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| IRC 1374 | AUTH-0111 | statute |
| PATH Act 2015 | AUTH-0196 | statute |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| IRC 483 | AUTH-0132 | statute |
| IRC 1274 | AUTH-0109 | statute |
| IRC 1274A | AUTH-0110 | statute |
| IRC 453A | AUTH-0131 | statute |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| UDITPA | AUTH-0254 | practice-or-guidance |
| State Nexus Statutes | AUTH-0227 | statute |
| Bulk Sale Acts | AUTH-0042 | statute |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| ABA Private Target Deal Points Study | AUTH-0026 | study/dataset |
| ABA Model SPA | AUTH-0024 | practice-norm |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| SRS Acquiom Deal Terms Study 2024 | AUTH-0220 | study/dataset |
| SRS Acquiom Deal Terms Study 2025 | AUTH-0221 | study/dataset |
| ABA Private Target Deal Points Study | AUTH-0026 | study/dataset |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| SRS Acquiom Deal Terms Study 2024 | AUTH-0220 | study/dataset |
| SRS Acquiom Deal Terms Study 2025 | AUTH-0221 | study/dataset |
| ABA Private Target Deal Points Study | AUTH-0026 | study/dataset |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| ABA Private Target Deal Points Study | AUTH-0026 | study/dataset |
| Marsh RWI Reports | AUTH-0166 | practice-norm |
| Aon RWI Reports | AUTH-0033 | practice-norm |
| Lockton RWI Reports | AUTH-0160 | practice-norm |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| SRS Acquiom Working Capital PPA Study | AUTH-0223 | study/dataset |
| ABA Private Target Deal Points Study | AUTH-0026 | study/dataset |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| ABA Model SPA | AUTH-0024 | practice-norm |
| HSR Act | AUTH-0092 | statute |
| CFIUS regulations | AUTH-0049 | practice-or-guidance |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| Houlihan Lokey 2023 Transaction Termination Fee Study | AUTH-0090 | study/dataset |
| Fenwick 2023 ARBF analysis | AUTH-0072 | practice-or-guidance |
| Brazen v. Bell Atlantic | AUTH-0040 | case |
| In re Topps | AUTH-0097 | case |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| SRS Acquiom Earnout Data | AUTH-0222 | study/dataset |
| IRC 453 | AUTH-0130 | statute |
| IRC 483 | AUTH-0132 | statute |
| IRC 1274 | AUTH-0109 | statute |
| ABA Earnout Reports | AUTH-0023 | practice-norm |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| 35 U.S.C. 261 | AUTH-0019 | statute |
| Lanham Act 10 | AUTH-0155 | statute |
| 17 U.S.C. 205 | AUTH-0016 | statute |
| Clorox v. Chemical Bank | AUTH-0051 | case |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| UCC Article 9 | AUTH-0253 | statute |
| 17 U.S.C. 205 | AUTH-0016 | statute |
| In re Peregrine | AUTH-0096 | case |
| Rhone-Poulenc Agro v. DeKalb | AUTH-0206 | case |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| IP Licensing Industry Practice | AUTH-0102 | practice-norm |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| ABA Model SPA IP Representations | AUTH-0025 | practice-norm |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| IP Carve-Out Practice Norms | AUTH-0101 | practice-norm |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| Escode | AUTH-0068 | practice-norm |
| Codekeeper | AUTH-0052 | practice-norm |
| Iron Mountain Escrow Templates | AUTH-0145 | practice-norm |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| California Labor Code 2870 | AUTH-0046 | statute |
| State Employee-IP Statutes | AUTH-0226 | statute |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| IRC 1060 | AUTH-0106 | statute |
| Treas. Reg. 1.338-6 | AUTH-0242 | regulation |
| Treas. Reg. 1.1060-1 | AUTH-0239 | regulation |
| IRS Form 8594 | AUTH-0149 | form |

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

> **Pin-cite pass pending (draft gap):** section-level pin-cites, effective dates, and `next_check_due` land with the Authority Register export.


**Authorities**

| Authority | ID | Type |
|---|---|---|
| ICANN Transfer Rules | AUTH-0093 | practice-norm |
| USPTO Form PTO-1594 | AUTH-0258 | form |

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
