/**
 * DEFINITIVE Public Edition — AUTHORED overlay (v2 delta punch list, §§1–9).
 *
 * The v2 generator EXTRACTED the reference implementation. This module carries
 * the parts of a specification that cannot be extracted and must be authored:
 * RFC-2119 algorithms, typed contracts with real enums and descriptions,
 * constants hoisted out of fixtures with pin-cites, golden worked examples,
 * de-boilerplated boundary statements, purpose prose, authority de-duplication,
 * and hand-tagged authority types. The generator MERGES this over the
 * empirical extraction; where an overlay exists the authored content wins.
 *
 * Governing rule (printed at the top of every build and shipped to
 * dist/definitive-internal/GOVERNANCE.md):
 */
export const GOVERNING_RULE =
  'The specification is the law of the model; the reference implementation ' +
  'conforms to it. Never publish what the code happens to do as if it were ' +
  'what the spec requires. If the code and the M&A concept diverge, either ' +
  'scope the spec honestly or extend the code — never silently narrow the ' +
  'spec to the code.';

/* ── Enum vocabulary (§3) ─────────────────────────────────────────────────
 * Enum values are part of the normative contract. Values below match what the
 * reference implementation accepts/emits (spec ⇔ code, per the governing rule).
 */
export interface EnumSpec { values: string[]; description: string }
export const ENUMS: Record<string, EnumSpec> = {
  // Inputs
  deed_type: { values: ['general_warranty', 'special_warranty', 'bargain_and_sale', 'quitclaim'], description: 'The deed instrument type, which fixes the title-covenant set conveyed.' },
  vesting_form: { values: ['sole', 'tenancy_in_common', 'joint_tenancy', 'tenancy_by_entirety', 'community_property', 'entity'], description: 'How record title is held, which fixes whose signature a conveyance of the whole requires.' },
  contract_title_standard: { values: ['marketable', 'insurable'], description: 'The title standard the purchase contract promises the buyer.' },
  lease_transfer_type: { values: ['asset_assignment', 'sublease', 'change_of_control', 'merger'], description: 'The form of the transfer being tested against the lease transfer-restriction terms.' },
  consent_clause: { values: ['none_silent', 'consent_no_standard', 'reasonableness', 'sole_discretion'], description: 'The lease consent provision as parsed: silent, consent required with no stated standard, express reasonableness, or express sole discretion.' },
  transfer_kind: { values: ['deed_sale', 'entity_transfer', 'transfer_to_spouse_or_child', 'transfer_on_death_to_relative', 'divorce_decree_transfer_to_spouse', 'inter_vivos_trust_borrower_beneficiary', 'junior_lien_creation', 'leasehold_under_3y_no_option'], description: 'The nature of the transfer being screened against the loan\'s due-on-transfer clause; the last six are the Garn-St. Germain § 1701j-3(d) protected consumer transfers.' },
  right_type: { values: ['option', 'rofr', 'rofo'], description: 'The preemptive right at issue: a purchase option, a right of first refusal, or a right of first offer.' },
  preemptive_transaction_form: { values: ['asset_sale', 'entity_transfer', 'merger'], description: 'The transaction form tested for whether it triggers the preemptive right.' },
  permit_deal_form: { values: ['asset', 'entity', 'merger'], description: 'The acquisition form, which governs whether permits and certificates re-issue and whether bulk-sales notification applies.' },
  contract_risk_on: { values: ['seller', 'buyer'], description: 'The party the contract expressly places pre-closing casualty risk on, when it allocates risk.' },
  survival_item_type: { values: ['representation', 'warranty', 'covenant', 'indemnity'], description: 'The kind of relied-on obligation being tracked for survival past closing.' },
  // Outputs
  recording_act_type: { values: ['race', 'notice', 'race_notice', 'unknown'], description: 'The recording-act family the state applies; unknown means the state is not in the table and the result defers.' },
  prevailing_interest: { values: ['later_purchaser', 'prior_interest', 'undetermined'], description: 'Which competing interest the recording act favors on the supplied facts.' },
  risk_on: { values: ['buyer', 'seller', 'per_contract_terms'], description: 'The party carrying pre-closing casualty risk under the governing rule.' },
  risk_basis: { values: ['contract_override', 'equitable_conversion_default', 'uvpra_seller', 'ny_risk_act_seller'], description: 'The legal basis for the risk allocation: an express contract term, or a named state default regime.' },
  lease_classification: { values: ['deemed_assignment_consent_path_applies', 'generally_not_assignment_by_operation_of_law', 'assignment_restriction_applies', 'no_restriction_freely_assignable'], description: 'How the transfer classifies against the lease transfer-restriction terms.' },
  consent_standard: { values: ['reasonableness_express', 'sole_discretion_as_written', 'sole_discretion_written_verify_ca_limits', 'implied_reasonableness', 'as_written_sole_discretion_enforced', 'unsettled_check_state'], description: 'The consent standard that governs, resolved from the clause and the state consent-standard table.' },
  acceleration_risk: { values: ['none_no_clause', 'barred_by_garn_exception', 'lender_option_on_transfer'], description: 'The lender\'s acceleration posture on the transfer.' },
  trigger_status: { values: ['triggered_property_sale', 'triggered_entity_capture_language', 'likely_not_triggered_structural'], description: 'Whether and why the transaction form implicates the preemptive right.' },
  fixture_priority: { values: ['fixture_secured_party', 'first_to_perfect', 'real_property_interest'], description: 'Which competing interest holds priority in the fixture under UCC § 9-334.' },
  triage_bucket: { values: ['curable', 'insurable_over', 'deal_killing'], description: 'The disposition bucket for a single title exception.' },
};

/* ── Authority de-duplication + hand-tagged types (§7) ─────────────────────
 * AUTHORITY_MERGES: alias → canonical, applied AFTER the generator's own
 * canonicalization and BEFORE de-dup. Every one of the 34 exact
 * case-variant collisions is collapsed here (gate-blocking), plus the safe
 * shorthand/containment families. AUTHORITY_TYPES hand-tags override the
 * heuristic classifier (Paul's flagged failures + the practice-norm labels).
 */
export const AUTHORITY_MERGES: Record<string, string> = {
  // 34 exact case-variant collisions → single canonical form
  'ABA earnout reports': 'ABA Earnout Reports',
  'ABA Model SPA IP representations': 'ABA Model SPA IP Representations',
  'ABL market practice': 'ABL Market Practice',
  'ALTA endorsements': 'ALTA Endorsements',
  'ALTA forms': 'ALTA Forms',
  'Aon RWI reports': 'Aon RWI Reports',
  'Appraisal Institute practice': 'Appraisal Institute Practice',
  'bulk-sale acts': 'Bulk Sale Acts',
  'ICANN transfer rules': 'ICANN Transfer Rules',
  'ILPA guidance': 'ILPA Guidance',
  'indenture practice': 'Indenture Practice',
  'IP carve-out practice norms': 'IP Carve-Out Practice Norms',
  'IP licensing industry practice': 'IP Licensing Industry Practice',
  'Iron Mountain escrow templates': 'Iron Mountain Escrow Templates',
  'lease abstraction industry practice': 'Lease Abstraction Industry Practice',
  'lender practice': 'Lender Practice',
  'Lockton RWI reports': 'Lockton RWI Reports',
  'LSTA model provisions': 'LSTA Model Provisions',
  'Marsh RWI reports': 'Marsh RWI Reports',
  'merger doctrine (common law)': 'Merger doctrine (common law)',
  'Morgan Lewis OSS guidance': 'Morgan Lewis OSS Guidance',
  'Morse OSS guidance': 'Morse OSS Guidance',
  'municipal CO ordinances': 'Municipal CO Ordinances',
  'Municipal CO ordinances': 'Municipal CO Ordinances',
  'NAV facility market practice': 'NAV Facility Market Practice',
  'Nixon Peabody OSS guidance': 'Nixon Peabody OSS Guidance',
  'project-finance market practice': 'Project Finance Market Practice',
  'real estate industry practice': 'Real Estate Industry Practice',
  'real estate practice norms': 'Real Estate Practice Norms',
  'SRS Acquiom Earnout data': 'SRS Acquiom Earnout Data',
  'state ABC law': 'State ABC Law',
  'state employee-IP statutes': 'State Employee-IP Statutes',
  'state nexus statutes': 'State Nexus Statutes',
  'state title statutes': 'State Title Statutes',
  'venture-debt market practice': 'Venture Debt Market Practice',
  // Shorthand tags → the named authority they abbreviate
  'ABA 2025': 'ABA Private Target Deal Points Study',
  'SRS 2025': 'SRS Acquiom Deal Terms Study 2025',
  'SRS 2024': 'SRS Acquiom Deal Terms Study 2024',
  'SRS Acquiom': 'SRS Acquiom Deal Terms Study 2025',
  'SRS Acquiom 2024': 'SRS Acquiom Deal Terms Study 2024',
  'SRS Acquiom 2025': 'SRS Acquiom Deal Terms Study 2025',
  // Forms 8288 family → three canonical forms
  'Forms 8288': 'IRS Form 8288',
  'Forms 8288 and 8288-A': 'IRS Form 8288',
  'Forms 8288-A': 'IRS Form 8288-A',
  'Form 8288-B': 'IRS Form 8288-B',
  // Treas. Reg. granularity → the section actually in force
  'Treas. Reg. 1.1060': 'Treas. Reg. 1.1060-1',
  'Treas. Reg. 1.338-6(b)': 'Treas. Reg. 1.338-6',
  // Lender-practice family (Ground Lease Lender Practice stays distinct)
  'lender practice norms': 'Lender Practice',
};

/** Type vocabulary: statute | regulation | guidance | case | form | study/dataset | practice-norm. */
export const AUTHORITY_TYPES: Record<string, string> = {
  // Paul's flagged classifier failures — none survivable in public
  'Codekeeper': 'practice-norm',
  'Escode': 'practice-norm',
  'Cal. Civ. Code 1214': 'statute',
  'Rev. Proc. 2011-29': 'guidance',
  '25 Del. C. 153': 'statute',
  'EU Merger Regulation 139/2004': 'regulation',
  'Real Estate Industry Practice': 'practice-norm',
  // IRS sub-regulatory guidance (classifier reads Rev./Proc. as case/other)
  'Rev. Rul. 59-60': 'guidance',
  // Practice-norm labels (market conventions, not controlling authority)
  'ABA Earnout Reports': 'practice-norm', 'ABL Market Practice': 'practice-norm',
  'Aon RWI Reports': 'practice-norm', 'Appraisal Institute Practice': 'practice-norm',
  'Indenture Practice': 'practice-norm', 'IP Carve-Out Practice Norms': 'practice-norm',
  'IP Licensing Industry Practice': 'practice-norm', 'Iron Mountain Escrow Templates': 'practice-norm',
  'Lease Abstraction Industry Practice': 'practice-norm', 'Lender Practice': 'practice-norm',
  'Ground Lease Lender Practice': 'practice-norm', 'Lockton RWI Reports': 'practice-norm',
  'Marsh RWI Reports': 'practice-norm', 'NAV Facility Market Practice': 'practice-norm',
  'Morgan Lewis OSS Guidance': 'practice-norm', 'Morse OSS Guidance': 'practice-norm',
  'Nixon Peabody OSS Guidance': 'practice-norm', 'Project Finance Market Practice': 'practice-norm',
  'Real Estate Practice Norms': 'practice-norm', 'Venture Debt Market Practice': 'practice-norm',
  'ALTA title practice': 'practice-norm', 'ALTA Endorsements': 'practice-norm', 'ALTA Forms': 'practice-norm',
  'ICANN Transfer Rules': 'practice-norm', 'ILPA Guidance': 'practice-norm',
  'LSTA Model Provisions': 'practice-norm', 'Municipal CO Ordinances': 'statute',
  'Marketable-title common law': 'case', 'merger doctrine (common law)': 'case',
  'Merger doctrine (common law)': 'case', 'ROFR/option common law': 'case',
  'NY assignment common law': 'case', 'TX strict-match construction': 'case',
  'equitable conversion': 'case', 'Common-law deed covenants': 'case',
  'Bulk Sale Acts': 'statute', 'State ABC Law': 'statute', 'State Employee-IP Statutes': 'statute',
  'State Nexus Statutes': 'statute', 'State Title Statutes': 'statute',
  // Named studies
  'ABA Private Target Deal Points Study': 'study/dataset',
  'ABA Model SPA': 'practice-norm', 'ABA Model SPA IP Representations': 'practice-norm',
  'SRS Acquiom Deal Terms Study 2024': 'study/dataset', 'SRS Acquiom Deal Terms Study 2025': 'study/dataset',
  'SRS Acquiom Earnout Data': 'study/dataset', 'SRS Acquiom Working Capital PPA Study': 'study/dataset',
  'IRS Form 8288': 'form', 'IRS Form 8288-A': 'form', 'IRS Form 8288-B': 'form',
  // State/federal statutes the "§"-less heuristic misreads (proof-page anchors)
  'N.Y. Real Prop. Law 291': 'statute', 'N.Y. Gen. Oblig. Law 5-1311': 'statute',
  'NY Tax Law 1405(b)(6)': 'statute', 'Cal. Rev. & Tax. Code 60-64': 'statute',
  'NYC Admin. Code 11-2101': 'statute', 'Tex. Const. art. VIII 29': 'statute',
  'Tex. Prop. Code 13.001': 'statute', 'Tex. Prop. Code 5.023': 'statute',
  'Tex. Prop. Code 5.007': 'statute', 'Cal. Civ. Code 1662': 'statute',
  'N.C. Gen. Stat. 47-18': 'statute', 'CERCLA 107': 'statute', '72 P.S. 1403': 'statute',
  'UCC 9-334': 'statute', 'UCC Art. 6 (as retained)': 'statute', '12 U.S.C. 1701j-3': 'statute',
  '15 U.S.C. 18a': 'statute', 'Tex. Prop. Code 5.007 (UVPRA)': 'statute',
  'SBA SOP 50 10 8': 'guidance', 'FRED:DPRIME': 'study/dataset',
  'Matter of 105-02 Forest Hills (2025)': 'case',
};

/* ── Model overlay contract ────────────────────────────────────────────────
 * `kind` on a constant:
 *   statutory_must     — a binding value from a governing authority (statute,
 *                        regulation, or agency program rule such as the SBA
 *                        SOP). Computation MUST use it.
 *   cited_median_should— a market-median default from a named study. A
 *                        SHOULD-strength default, distinct from a MUST.
 *   table_data         — a jurisdictional lookup value (the state-law tables);
 *                        selected by the deal's facts, cited to its source.
 * traceValues: raw numeric forms that may legitimately appear in a worked
 * example's OUTPUT (e.g. a dollar cap and its cents scaling), so the
 * untraceable-literal gate can prove every output number is a constant, an
 * input, or an algorithm-derived value.
 */
export type ConstantKind = 'statutory_must' | 'cited_median_should' | 'table_data';
export interface ConstantSpec {
  name: string; value: string; kind: ConstantKind;
  citation: string; pin?: string; effective?: string; nextCheck?: string;
  traceValues?: number[];
}
export interface FieldSpec { type: string; desc: string; enum?: string; unit?: string; precision?: number }
export interface GoldenSpec { narrative: string; input: Record<string, any> }
export interface ModelOverlay {
  purpose: string;            // §8 — 2–3 sentences
  algorithm: string[];        // §1 — RFC-2119 steps; constants referenced by name
  constants: ConstantSpec[];  // §2/§5 — [] = attested "no numeric constants"
  inputs: Record<string, FieldSpec>;
  outputs: Record<string, FieldSpec>;
  boundary: string;           // §6 — authored, specific professional + conclusion
  golden: GoldenSpec;         // §5 — realistic magnitudes + narrative sentence
  derivedOutputs?: string[];  // output fields whose numeric values are algorithm-derived
  precisionRule?: string;     // §4 — the rounding rule stated for this model
  scopeFlag?: string;         // §1 — scope-honesty note when contract < purpose
}

const CENTS_RULE = 'Monetary values are exact integer cents. Ratios and percentages are rounded half-up to the per-field precision noted in the output contract; a single global half-even rule is scheduled (delta §4). Dates are ISO-8601.';

export const MODEL_OVERLAYS: Record<string, ModelOverlay> = {

  /* ══ M109 — Working-capital peg (SCOPE-HONESTY FLAG) ══════════════════ */
  M109: {
    purpose:
      'Computes the working-capital peg — the reference net-working-capital level a purchase agreement locks in at signing — as the trailing arithmetic mean of a company\'s supplied monthly NWC observations, and reports the observed low–high range around it. The peg answers, for the buyer and seller negotiating the price adjustment, "what normalized level of working capital should be delivered at close?" It establishes the peg and its dispersion only; the post-closing estimated-versus-actual true-up sequence and any collar are specified separately by M210.',
    scopeFlag:
      'SCOPE (delta §1, option (a) — rescope for v1.0): the catalog purpose read "Target, peg, true-up, and collar math," but the reference implementation computes only the trailing-mean peg and the observed min/max. It does NOT compute a negotiated target, a post-closing true-up, or a collar. Per the governing rule the published contract is scoped to what the model specifies; the closing-statement true-up sequence is owned by M210 (Closing-statement true-up sequence), cross-referenced here. Founder decision recorded: rescope (a), not extend the code, for v1.0.',
    algorithm: [
      'Given `monthly_nwc_cents`, a list of integer-cents net-working-capital observations, one per trailing month:',
      '1. The implementation SHALL coerce each element to integer cents and discard non-numeric elements. If no numeric observation remains, it SHALL return `status: "needs_inputs"` with `monthly_nwc_cents` in `missingInputs` and emit no outputs.',
      '2. `observed_months` SHALL be the count of retained observations.',
      '3. `peg_cents` SHALL be the arithmetic mean of the retained observations, rounded to the nearest integer cent (see precision rule).',
      '4. `low_cents` SHALL be the minimum retained observation; `high_cents` SHALL be the maximum.',
      '5. The model SHALL NOT emit a target, a true-up, or a collar; those are out of scope for this slot (see scope note; M210 owns the true-up).',
    ],
    constants: [],
    precisionRule: 'peg_cents rounds half-up to the nearest integer cent; low/high/observed_months are exact.',
    inputs: {
      monthly_nwc_cents: { type: 'integer (cents)[]', desc: 'Trailing monthly net-working-capital observations, one integer-cents value per month; order is immaterial to the peg.', unit: 'cents' },
    },
    outputs: {
      peg_cents: { type: 'integer (cents)', desc: 'The working-capital peg: the trailing arithmetic mean of the observations, to the nearest cent.', unit: 'cents' },
      observed_months: { type: 'integer', desc: 'Number of monthly observations the peg was computed over.' },
      low_cents: { type: 'integer (cents)', desc: 'Minimum observed monthly net working capital.', unit: 'cents' },
      high_cents: { type: 'integer (cents)', desc: 'Maximum observed monthly net working capital.', unit: 'cents' },
    },
    derivedOutputs: ['peg_cents', 'observed_months', 'low_cents', 'high_cents'],
    boundary:
      'This model computes the working-capital peg and its observed dispersion from supplied monthly figures. It renders no view on the negotiated target, the post-closing true-up (specified by M210), or a collar; the peg it produces is an input to the purchase-agreement negotiation, not a determination of the final price adjustment, which is an accounting and legal matter for the parties and their advisors.',
    golden: {
      narrative: 'A lower-middle-market distributor\'s last six months of net working capital run between $1.74M and $1.88M; the peg is set at the trailing mean of roughly $1.80M.',
      input: { monthly_nwc_cents: [176_000_000, 182_000_000, 179_500_000, 188_000_000, 174_000_000, 181_500_000] },
    },
  },

  /* ══ M119 — SBA 7(a) post-SOP 50 10 8 ════════════════════════════════ */
  M119: {
    purpose:
      'Checks whether an SBA 7(a) change-of-ownership acquisition clears the program\'s two hard financing floors — the minimum equity injection and the debt-service-coverage minimum — and reports the buyer\'s equity percentage, the coverage ratio, and the 7(a) loan ceiling. It answers, for a searcher or SMB buyer structuring an SBA-backed acquisition, "does this capital stack meet the SOP\'s gating requirements before we take it to a lender?" It performs the arithmetic screen only; the eligibility and credit decisions remain the lender\'s and the SBA\'s.',
    algorithm: [
      'Given `purchase_price_cents`, `cash_flow_cents` (post-acquisition free cash flow available for debt service), `buyer_equity_cents`, and `annual_debt_service_cents`:',
      '1. If any of the four is missing or non-numeric, the implementation SHALL return `status: "needs_inputs"` naming the missing fields and emit no outputs.',
      '2. `buyer_equity_pct` SHALL be `buyer_equity_cents ÷ purchase_price_cents`, rounded half-up to 4 decimals.',
      '3. `dscr` SHALL be `cash_flow_cents ÷ annual_debt_service_cents`, rounded half-up to 2 decimals.',
      '4. `meets_sba_equity_floor` SHALL be true iff `buyer_equity_pct ≥ SBA equity-injection floor` (constants: SBA 7(a) minimum equity injection).',
      '5. `meets_sba_dscr_floor` SHALL be true iff `dscr ≥ SBA debt-service-coverage floor` (constants: SBA 7(a) DSCR floor).',
      '6. `max_7a_loan_cents` SHALL be the 7(a) maximum loan amount in cents (constants: SBA 7(a) maximum loan amount).',
    ],
    constants: [
      { name: 'SBA 7(a) maximum loan amount', value: '$5,000,000', kind: 'statutory_must', citation: 'SBA SOP 50 10 8', pin: 'Subpart B — 7(a) maximum loan amount; 15 U.S.C. § 636(a)(3)(A)', effective: '2025-06-01', nextCheck: 'on next SOP revision', traceValues: [5_000_000, 500_000_000] },
      { name: 'SBA 7(a) minimum equity injection', value: '10% (0.10)', kind: 'statutory_must', citation: 'SBA SOP 50 10 8', pin: 'Subpart B — minimum equity injection for change-of-ownership', effective: '2025-06-01', nextCheck: 'on next SOP revision', traceValues: [0.1, 10] },
      { name: 'SBA 7(a) DSCR floor', value: '1.15×', kind: 'statutory_must', citation: 'SBA SOP 50 10 8', pin: 'Subpart B — business-acquisition debt-service-coverage floor', effective: '2025-06-01', nextCheck: 'on next SOP revision', traceValues: [1.15] },
    ],
    precisionRule: 'buyer_equity_pct rounds half-up to 4 decimals; dscr rounds half-up to 2 decimals; max_7a_loan_cents is exact integer cents.',
    inputs: {
      purchase_price_cents: { type: 'integer (cents)', desc: 'Total acquisition purchase price.', unit: 'cents' },
      cash_flow_cents: { type: 'integer (cents)', desc: 'Post-acquisition annual free cash flow available for debt service.', unit: 'cents' },
      buyer_equity_cents: { type: 'integer (cents)', desc: 'Buyer equity injection into the transaction.', unit: 'cents' },
      annual_debt_service_cents: { type: 'integer (cents)', desc: 'Annual principal-and-interest debt service on the acquisition debt.', unit: 'cents' },
    },
    outputs: {
      buyer_equity_pct: { type: 'number', desc: 'Buyer equity as a fraction of purchase price (0–1).', precision: 4 },
      dscr: { type: 'number', desc: 'Debt-service coverage ratio: cash flow ÷ annual debt service.', precision: 2 },
      meets_sba_equity_floor: { type: 'boolean', desc: 'Whether buyer equity meets or exceeds the SBA 7(a) minimum equity injection.' },
      meets_sba_dscr_floor: { type: 'boolean', desc: 'Whether the coverage ratio meets or exceeds the SBA 7(a) DSCR floor.' },
      max_7a_loan_cents: { type: 'integer (cents)', desc: 'The statutory 7(a) maximum loan amount, in cents.', unit: 'cents' },
    },
    derivedOutputs: ['buyer_equity_pct', 'dscr'],
    boundary:
      'This model checks an SBA 7(a) change-of-ownership financing against the program\'s equity-injection and debt-service-coverage floors and the 7(a) loan ceiling. Eligibility, the credit-elsewhere test, and the final credit decision are the lender\'s and the SBA\'s; the model computes the ratios and the pass/fail against the published floors and renders no eligibility determination.',
    golden: {
      narrative: 'A $1.2M SMB acquisition funded with $150k of buyer equity (12.5%) and $300k of free cash flow against $180k of annual debt service clears both SBA floors.',
      input: { purchase_price_cents: 120_000_000, buyer_equity_cents: 15_000_000, cash_flow_cents: 30_000_000, annual_debt_service_cents: 18_000_000 },
    },
  },

  /* ══ M128 — HSR reportability ════════════════════════════════════════ */
  M128: {
    purpose:
      'Screens a transaction\'s size against the current Hart-Scott-Rodino size-of-transaction threshold and the auto-reportable ceiling, so a deal team knows early whether an antitrust filing analysis is in play. It answers, at the size-screen level, "is this deal above the line that makes HSR reportability a live question?" It is the first gate only; the size-of-person tests, exemptions, and ultimate-parent-entity analysis that determine whether a filing is actually required are left to antitrust counsel.',
    algorithm: [
      'Given `enterprise_value_cents` (the size of the transaction being tested):',
      '1. If `enterprise_value_cents` is missing or non-numeric, the implementation SHALL return `status: "needs_inputs"` with `enterprise_value_cents` in `missingInputs`.',
      '2. `size_of_transaction_cents` SHALL echo the supplied enterprise value in cents.',
      '3. `threshold_cents` SHALL be the current HSR size-of-transaction threshold in cents (constants: HSR size-of-transaction threshold).',
      '4. `hsr_size_triggered` SHALL be true iff `size_of_transaction_cents ≥ threshold_cents`.',
      '5. `auto_reportable_cents` SHALL be the current HSR auto-reportable ceiling in cents (constants: HSR auto-reportable ceiling), above which the size-of-person test no longer applies.',
    ],
    constants: [
      { name: 'HSR size-of-transaction threshold', value: '$133,900,000', kind: 'statutory_must', citation: '15 U.S.C. § 18a; 16 C.F.R. § 801.1', pin: 'FTC 2026 annual threshold revision (eff. 2026-02-17)', effective: '2026-02-17', nextCheck: '2027-Q1 (FTC revises annually, typically January–February)', traceValues: [133_900_000, 13_390_000_000] },
      { name: 'HSR auto-reportable ceiling', value: '$535,500,000', kind: 'statutory_must', citation: '15 U.S.C. § 18a; 16 C.F.R. § 801.1', pin: 'FTC 2026 annual threshold revision (eff. 2026-02-17)', effective: '2026-02-17', nextCheck: '2027-Q1 (FTC revises annually)', traceValues: [535_500_000, 53_550_000_000] },
    ],
    precisionRule: 'All values are exact integer cents; no rounding.',
    inputs: {
      enterprise_value_cents: { type: 'integer (cents)', desc: 'The size of the transaction being tested against the HSR thresholds.', unit: 'cents' },
    },
    outputs: {
      size_of_transaction_cents: { type: 'integer (cents)', desc: 'The transaction size under test, in cents.', unit: 'cents' },
      threshold_cents: { type: 'integer (cents)', desc: 'The current HSR size-of-transaction threshold, in cents.', unit: 'cents' },
      hsr_size_triggered: { type: 'boolean', desc: 'Whether the transaction meets or exceeds the size-of-transaction threshold.' },
      auto_reportable_cents: { type: 'integer (cents)', desc: 'The current HSR auto-reportable ceiling, in cents.', unit: 'cents' },
    },
    derivedOutputs: ['size_of_transaction_cents'],
    boundary:
      'This model compares a transaction\'s size against the current HSR size-of-transaction and auto-reportable thresholds. Whether a filing is in fact required — the size-of-person tests, the exemptions, and the ultimate-parent-entity analysis — is an antitrust determination for counsel; the model performs the size screen and routes the reportability conclusion, and does not render it.',
    golden: {
      narrative: 'A $140M acquisition sits just above the 2026 HSR size-of-transaction threshold of $133.9M, so a reportability analysis is required.',
      input: { enterprise_value_cents: 14_000_000_000 },
    },
  },

  /* ══ M224 — Recording-act and priority engine ════════════════════════ */
  M224: {
    purpose:
      'Orders the priority of competing real-property interests by applying the recording act of the situs state to the supplied value, notice, and recording-order facts. It answers, in title diligence, "on these facts, does the later purchaser or the prior interest prevail?" — the deterministic core beneath a title read. Anchor states are encoded as data (DE/LA/NC pure race, NY/CA race-notice, TX notice); an untabled state defers rather than guessing.',
    algorithm: [
      'Given `state`, `later_purchaser_for_value`, `later_took_without_notice`, and `later_recorded_first`:',
      '1. The implementation SHALL upper-case `state` and require all four inputs; a missing one yields `status: "needs_inputs"`.',
      '2. It SHALL look up the state\'s recording-act type (constants: recording-act table). If the state is absent, it SHALL emit `act_type: "unknown"`, `prevailing_interest: "undetermined"`, `defer_to_counsel: true`, a table-gap red flag, and SHALL NOT order priority.',
      '3. It SHALL compute whether the later purchaser prevails: for a race state, iff `later_purchaser_for_value AND later_recorded_first`; for a notice state, iff `later_purchaser_for_value AND later_took_without_notice`; for a race-notice state, iff `later_purchaser_for_value AND later_took_without_notice AND later_recorded_first`.',
      '4. `prevailing_interest` SHALL be `later_purchaser` when that holds, else `prior_interest`; `bfp_protected` SHALL equal that boolean.',
      '5. It SHALL raise a red flag if neither interest is recorded, and (race states) if the later purchaser prevails despite actual notice.',
    ],
    constants: [
      { name: 'DE recording act', value: 'pure race', kind: 'table_data', citation: '25 Del. C. § 153', pin: '§ 153', nextCheck: 'on state-table review' },
      { name: 'NC recording act', value: 'pure race', kind: 'table_data', citation: 'N.C. Gen. Stat. § 47-18', pin: '§ 47-18' },
      { name: 'LA recording act', value: 'pure race', kind: 'table_data', citation: 'La. Civ. Code arts. 3338–3340', pin: 'public-records doctrine' },
      { name: 'NY recording act', value: 'race-notice', kind: 'table_data', citation: 'N.Y. Real Prop. Law § 291', pin: '§ 291' },
      { name: 'CA recording act', value: 'race-notice', kind: 'table_data', citation: 'Cal. Civ. Code § 1214', pin: '§ 1214' },
      { name: 'TX recording act', value: 'notice', kind: 'table_data', citation: 'Tex. Prop. Code § 13.001', pin: '§ 13.001' },
    ],
    inputs: {
      state: { type: 'string (US state code)', desc: 'Two-letter code of the situs state, used to select the recording act.' },
      later_purchaser_for_value: { type: 'boolean', desc: 'Whether the later-in-time purchaser gave value (a threshold for bona-fide-purchaser protection in every act).' },
      later_took_without_notice: { type: 'boolean', desc: 'Whether the later purchaser took without actual or constructive notice of the prior interest (decisive in notice and race-notice states).' },
      later_recorded_first: { type: 'boolean', desc: 'Whether the later purchaser recorded before the prior interest (decisive in race and race-notice states).' },
    },
    outputs: {
      state: { type: 'string (US state code)', desc: 'The situs state, echoed.' },
      act_type: { type: 'enum', enum: 'recording_act_type', desc: 'The recording-act family applied.' },
      citation: { type: 'string', desc: 'The statutory citation for the state\'s recording act.' },
      prevailing_interest: { type: 'enum', enum: 'prevailing_interest', desc: 'Which competing interest the act favors on the facts.' },
      bfp_protected: { type: 'boolean', desc: 'Whether the later purchaser takes free of the prior interest as a protected bona-fide purchaser.' },
      defer_to_counsel: { type: 'boolean', desc: 'True only when the state is untabled; the ordering then defers.' },
      red_flags: { type: 'string[]', desc: 'Priority-hygiene warnings (unrecorded interests; race-state notice anomaly).' },
    },
    boundary:
      'This model orders recording priority by applying the state\'s recording act to supplied notice, value, and recording facts. It does not adjudicate who in fact holds title, whether a conveyance is valid, or whether a party had constructive notice — those are determinations for title counsel and the title insurer. For a state absent from the recording-act table it emits a table-gap flag and routes, never a guessed ordering.',
    golden: {
      narrative: 'A California buyer records first but took with notice of a prior unrecorded deed; in a race-notice state, recording first does not rescue a purchaser who knew, so the prior interest prevails.',
      input: { state: 'CA', later_purchaser_for_value: true, later_took_without_notice: false, later_recorded_first: true },
    },
  },

  /* ══ M225 — Title-covenant and estate/signatory model ════════════════ */
  M225: {
    purpose:
      'Maps a deed type to the title covenants it conveys and a vesting form to the parties whose signatures a conveyance of the whole requires, surfacing warranty gaps and missed-signatory risk. It answers, in title diligence and closing preparation, "what protection does this deed give the buyer, and who has to sign for title to actually pass?" Deed-to-covenant and vesting-to-signatory relations are encoded as data, with the Texas seisin narrowing attached where relevant.',
    algorithm: [
      'Given `deed_type` and `vesting_form` (and optional `state`, `buyer_expects_warranty` (default true), `all_required_signers_present`):',
      '1. The implementation SHALL require `deed_type ∈ deed_type enum` and `vesting_form ∈ vesting_form enum`; otherwise `status: "needs_inputs"`.',
      '2. It SHALL map the deed type to its covenant set, covenant scope, and after-acquired-title flag (constants: deed-covenant table).',
      '3. It SHALL map the vesting form to the required signatories and the gap risk (constants: signatory matrix).',
      '4. If `state = "TX"`, it SHALL attach the Texas seisin-narrowing note (constants: TX seisin narrowing).',
      '5. It SHALL raise a warranty red flag if `buyer_expects_warranty` is true but the deed carries no covenants; and if `all_required_signers_present` is explicitly false it SHALL set `signatory_gap: true`, `defer_to_counsel: true`, and emit a counsel-handoff.',
    ],
    constants: [
      { name: 'Deed-covenant table', value: 'general/special warranty → six covenants (scope all-defects vs grantor-acts-only); bargain-and-sale and quitclaim → none', kind: 'table_data', citation: 'Common-law deed covenants', pin: 'present covenants (seisin, right-to-convey, against-encumbrances) + future covenants (quiet enjoyment, warranty, further assurances)' },
      { name: 'TX seisin narrowing', value: 'seisin narrowed to "grantor has not previously conveyed"', kind: 'table_data', citation: 'Tex. Prop. Code § 5.023', pin: '§ 5.023' },
      { name: 'Signatory matrix', value: 'tenancy-by-entirety and community property → both spouses; tenancy-in-common/joint tenancy → all cotenants for the whole; entity → per organizational documents', kind: 'table_data', citation: 'Common-law concurrent-ownership rules; e.g., Cal. Fam. Code § 1102, Tex. Fam. Code § 5.001', pin: 'both-spouses rule for entireties' },
    ],
    inputs: {
      deed_type: { type: 'enum', enum: 'deed_type', desc: 'The deed instrument type being conveyed.' },
      vesting_form: { type: 'enum', enum: 'vesting_form', desc: 'How record title is held.' },
      state: { type: 'string (US state code)', desc: 'Optional situs state; enables the Texas seisin-narrowing note.' },
      buyer_expects_warranty: { type: 'boolean', desc: 'Whether the buyer is negotiating for title warranties (default true); drives the warranty-gap flag.' },
      all_required_signers_present: { type: 'boolean', desc: 'Whether every party the vesting form requires is on the signature page; explicit false raises a signatory gap.' },
    },
    outputs: {
      deed_type: { type: 'enum', enum: 'deed_type', desc: 'The deed type, echoed.' },
      covenants_present: { type: 'string[]', desc: 'The title covenants this deed conveys (empty for bargain-and-sale and quitclaim).' },
      covenant_scope: { type: 'string', desc: 'Whether covenants reach all defects or only the grantor\'s own acts, or none.' },
      after_acquired_title_applies: { type: 'boolean', desc: 'Whether estoppel-by-deed vests later-acquired title in the grantee.' },
      deed_note: { type: 'string', desc: 'Plain-language description of the deed\'s covenant coverage.' },
      tx_seisin_note: { type: 'string | null', desc: 'The Texas seisin-narrowing note when the state is TX, else null.' },
      vesting_form: { type: 'enum', enum: 'vesting_form', desc: 'The vesting form, echoed.' },
      required_signatories: { type: 'string', desc: 'Who must sign for a conveyance of the whole.' },
      signatory_gap: { type: 'boolean', desc: 'Whether a required signatory is missing.' },
      defer_to_counsel: { type: 'boolean', desc: 'True on a signatory gap; the joinder question routes to counsel.' },
      counsel_handoff: { type: 'string | null', desc: 'The routing sentence when a signatory gap defers, else null.' },
      red_flags: { type: 'string[]', desc: 'Warranty-gap and signatory-gap warnings.' },
    },
    boundary:
      'This model maps a deed type to its covenant set and a vesting form to the parties whose signatures a conveyance of the whole requires. Whether a specific person must join a specific deed — homestead, marital, or entity-authority questions — and whether a covenant has been breached are legal determinations for real-estate counsel; on a signatory gap the model routes them and does not resolve them.',
    golden: {
      narrative: 'A Texas property held by a married couple as tenants by the entirety is being conveyed by special-warranty deed, but only one spouse is on the signature page — and a one-spouse signature conveys nothing in an entireties state.',
      input: { deed_type: 'special_warranty', vesting_form: 'tenancy_by_entirety', state: 'TX', buyer_expects_warranty: true, all_required_signers_present: false },
    },
  },

  /* ══ M226 — Marketability triage ═════════════════════════════════════ */
  M226: {
    purpose:
      'Triages the exceptions on a title commitment into curable, insurable-over, and deal-killing buckets from supplied curability and insurability facts, and flags when a contract\'s "insurable" (rather than "marketable") title standard would force the buyer to accept insured-over defects. It answers, for a buyer reading a title commitment, "which of these exceptions can be cleared, which can be insured around, and which threaten the deal?" Any deal-killer is a hard defer — the marketability judgment itself is never emitted.',
    algorithm: [
      'Given `exceptions` (a list of objects, each with `label`, `curable`, `insurer_will_insure_over`) and optional `contract_title_standard` (default `marketable`):',
      '1. The implementation SHALL require a non-empty `exceptions` list; otherwise `status: "needs_inputs"`.',
      '2. For each exception it SHALL assign a bucket: `curable` if `curable` is true; else `insurable_over` if `insurer_will_insure_over` is true; else `deal_killing`.',
      '3. It SHALL count each bucket.',
      '4. If any exception is `deal_killing`, it SHALL set `defer_to_counsel: true`, emit a counsel-handoff, and raise a red flag naming the deal-killers.',
      '5. If `contract_title_standard = "insurable"` and any exception is `insurable_over`, it SHALL raise a red flag that the buyer may be forced to accept insured-over defects that impair resale.',
    ],
    constants: [],
    inputs: {
      exceptions: { type: 'object[]', desc: 'Title-commitment exceptions; each object carries `label` (string), `curable` (boolean), and `insurer_will_insure_over` (boolean).' },
      contract_title_standard: { type: 'enum', enum: 'contract_title_standard', desc: 'The title standard the purchase contract promises (default marketable).' },
    },
    outputs: {
      contract_title_standard: { type: 'enum', enum: 'contract_title_standard', desc: 'The governing title standard, echoed.' },
      triage: { type: 'object[]', desc: 'One row per exception: `{ label, bucket }` where bucket is a triage_bucket value.' },
      curable_count: { type: 'integer', desc: 'Number of exceptions triaged curable.' },
      insurable_over_count: { type: 'integer', desc: 'Number triaged insurable-over.' },
      deal_killing_count: { type: 'integer', desc: 'Number triaged deal-killing (unmarketable and uninsurable).' },
      defer_to_counsel: { type: 'boolean', desc: 'True when any exception is deal-killing.' },
      counsel_handoff: { type: 'string | null', desc: 'The routing sentence when a deal-killer defers, else null.' },
      red_flags: { type: 'string[]', desc: 'Deal-killer and insurable-standard warnings.' },
    },
    derivedOutputs: ['curable_count', 'insurable_over_count', 'deal_killing_count'],
    boundary:
      'This model triages title exceptions into curable, insurable-over, and deal-killing buckets from supplied curability and insurability facts. Whether title is in fact marketable, whether a specific defect is fatal, and what cure will clear it are marketability determinations for title counsel and the title insurer; any deal-killing exception routes that determination and the model never renders it.',
    golden: {
      narrative: 'A commercial title commitment lists a payoff-ready first mortgage and a recorded access easement of disputed scope; the easement triages deal-killing and routes to counsel while the mortgage clears at closing.',
      input: { exceptions: [ { label: 'First-lien mortgage (payoff at close)', curable: true, insurer_will_insure_over: false }, { label: 'Recorded access easement, disputed scope', curable: false, insurer_will_insure_over: false } ], contract_title_standard: 'marketable' },
    },
  },

  /* ══ M227 — Risk-of-loss allocator ═══════════════════════════════════ */
  M227: {
    purpose:
      'Allocates the risk of a casualty or condemnation between signing and closing by first detecting an express contract allocation and otherwise applying the situs state\'s default regime. It answers, when a building burns or is condemned before closing, "who bears that loss — buyer or seller?" NY (Risk Act, seller), CA and TX (UVPRA, seller until title or possession), and the common-law equitable-conversion default (buyer at signing) are encoded as data.',
    algorithm: [
      'Given `state`, `contract_allocates_risk`, and optional `contract_risk_on`, `legal_title_or_possession_passed` (default false), `material_casualty_or_condemnation_pending` (default false):',
      '1. The implementation SHALL require `state` and `contract_allocates_risk`; otherwise `status: "needs_inputs"`.',
      '2. It SHALL look up the state regime (constants: risk-of-loss table), defaulting to equitable conversion.',
      '3. If `contract_allocates_risk` is true, `basis` SHALL be `contract_override` and `risk_on` SHALL follow `contract_risk_on` (`seller`, `buyer`, or `per_contract_terms`).',
      '4. Else if the regime is equitable conversion, `risk_on` SHALL be `buyer` with basis `equitable_conversion_default`.',
      '5. Else (a seller-protective statutory regime), `risk_on` SHALL be `buyer` if legal title or possession has passed, otherwise `seller`, with basis equal to the regime name.',
      '6. If the contract is silent and a casualty or condemnation is pending, it SHALL raise a red flag to allocate expressly before signing.',
    ],
    constants: [
      { name: 'NY risk-of-loss regime', value: 'seller bears risk until title/possession (NY Risk Act)', kind: 'table_data', citation: 'N.Y. Gen. Oblig. Law § 5-1311', pin: '§ 5-1311' },
      { name: 'CA risk-of-loss regime', value: 'seller bears risk until title/possession (UVPRA)', kind: 'table_data', citation: 'Cal. Civ. Code § 1662', pin: '§ 1662 (UVPRA)' },
      { name: 'TX risk-of-loss regime', value: 'seller bears risk until title/possession (UVPRA)', kind: 'table_data', citation: 'Tex. Prop. Code § 5.007', pin: '§ 5.007 (UVPRA)' },
      { name: 'Default risk-of-loss regime', value: 'buyer bears risk at signing (equitable conversion)', kind: 'table_data', citation: 'Equitable conversion (common-law majority rule)', pin: 'majority rule' },
    ],
    inputs: {
      state: { type: 'string (US state code)', desc: 'Situs state, used to select the default risk regime.' },
      contract_allocates_risk: { type: 'boolean', desc: 'Whether the purchase contract expressly allocates pre-closing casualty risk.' },
      contract_risk_on: { type: 'enum', enum: 'contract_risk_on', desc: 'The party the contract places risk on, when it allocates.' },
      legal_title_or_possession_passed: { type: 'boolean', desc: 'Whether legal title or possession has passed to the buyer (default false); decisive under UVPRA/NY regimes.' },
      material_casualty_or_condemnation_pending: { type: 'boolean', desc: 'Whether a material casualty or condemnation is pending (default false); drives the silent-contract red flag.' },
    },
    outputs: {
      state: { type: 'string (US state code)', desc: 'The situs state, echoed.' },
      default_regime: { type: 'enum', enum: 'risk_basis', desc: 'The state default regime that would govern absent a contract term.' },
      citation: { type: 'string', desc: 'The citation for the governing regime.' },
      contract_override_applied: { type: 'boolean', desc: 'Whether an express contract allocation controls.' },
      risk_on: { type: 'enum', enum: 'risk_on', desc: 'The party bearing pre-closing casualty risk.' },
      basis: { type: 'enum', enum: 'risk_basis', desc: 'The basis for the allocation.' },
      defer_to_counsel: { type: 'boolean', desc: 'False; this model computes the allocation deterministically.' },
      red_flags: { type: 'string[]', desc: 'Silent-contract-with-pending-casualty warning.' },
    },
    boundary:
      'This model allocates casualty risk between signing and closing by detecting a contract override and otherwise applying the state\'s default regime. It does not opine on whether a casualty is material, whether the contract\'s allocation is enforceable, or what remedy a party holds — those are determinations for real-estate counsel.',
    golden: {
      narrative: 'A Manhattan purchase contract is silent on risk of loss and a fire damages the building before closing; under the New York Risk Act the loss stays with the seller until title or possession passes.',
      input: { state: 'NY', contract_allocates_risk: false, legal_title_or_possession_passed: false, material_casualty_or_condemnation_pending: true },
    },
  },

  /* ══ M228 — Survival and merger tracker ══════════════════════════════ */
  M228: {
    purpose:
      'Flags every relied-on representation, covenant, or indemnity that will merge into the deed at closing for lack of an express survival hook or collateral character, so nothing the buyer is counting on quietly disappears at the closing table. It answers, before signing a real-estate or M&A deal that closes by deed, "which of these promises survive closing, and which need survival language added?" The fraud exception is noted independently.',
    algorithm: [
      'Given `items` (a list of objects, each with `label`, `type`, `express_survival`, `collateral_obligation`):',
      '1. The implementation SHALL require a non-empty `items` list; otherwise `status: "needs_inputs"`.',
      '2. For each item, `survives_closing` SHALL be true iff `express_survival` OR `collateral_obligation`; `basis` SHALL be `express_survival_clause`, `collateral_obligation`, or `merges_into_deed_at_closing` accordingly.',
      '3. It SHALL count surviving and merged-away items.',
      '4. It SHALL always attach the fraud-exception note (fraud claims survive merger independent of survival language).',
      '5. It SHALL raise a red flag listing every item that will merge away for lack of an express survival hook.',
    ],
    constants: [],
    inputs: {
      items: { type: 'object[]', desc: 'Relied-on obligations; each object carries `label` (string), `type` (a survival_item_type value), `express_survival` (boolean), and `collateral_obligation` (boolean).' },
    },
    outputs: {
      items: { type: 'object[]', desc: 'Per-item result: `{ label, type, express_survival, collateral_obligation, survives_closing, basis }`.' },
      surviving_count: { type: 'integer', desc: 'Number of items that survive closing.' },
      merged_away_count: { type: 'integer', desc: 'Number that merge into the deed at closing.' },
      fraud_exception_note: { type: 'string', desc: 'Standing note that fraud claims survive merger regardless of survival language.' },
      defer_to_counsel: { type: 'boolean', desc: 'False; this model computes survival deterministically from the supplied clause facts.' },
      red_flags: { type: 'string[]', desc: 'The list of items that will merge away without added survival language.' },
    },
    derivedOutputs: ['surviving_count', 'merged_away_count'],
    boundary:
      'This model flags every relied-on representation, covenant, or indemnity that will merge into the deed at closing for lack of an express survival hook. Whether a given obligation is in fact collateral, whether merger applies, and whether the fraud exception is available are legal determinations for counsel; the model surfaces the exposure and drafts the survival ask, and renders no enforceability conclusion.',
    golden: {
      narrative: 'Three relied-on promises in a deed deal — a financial-statement representation with no survival clause, an express post-closing tax indemnity, and a collateral non-compete — resolve so that only the representation merges into the deed at closing.',
      input: { items: [ { label: 'Seller financial-statement representation', type: 'representation', express_survival: false, collateral_obligation: false }, { label: 'Post-closing tax indemnity', type: 'indemnity', express_survival: true, collateral_obligation: false }, { label: 'Non-compete covenant', type: 'covenant', express_survival: false, collateral_obligation: true } ] },
    },
  },

  /* ══ M229 — Lease anti-assignment and change-of-control parser ════════ */
  M229: {
    purpose:
      'Classifies the consent path a transfer must clear under a lease\'s anti-assignment and change-of-control terms, resolving the governing consent standard against the state table (CA Kendall implied reasonableness vs. NY as-written enforcement). It answers, in an OpCo/PropCo or leased-asset deal, "does this transfer trip the lease\'s transfer restriction, and how hard is the consent to get?" The enforceability judgment always routes to counsel.',
    algorithm: [
      'Given `transfer_type` and `consent_clause` (and optional `state`, `lease_deems_change_of_control_assignment` (default false), `landlord_recapture_right` (default false)):',
      '1. The implementation SHALL require `transfer_type ∈ lease_transfer_type enum` and `consent_clause ∈ consent_clause enum`; otherwise `status: "needs_inputs"`.',
      '2. For a `change_of_control` or `merger` transfer, the restriction applies iff the lease deems a control transfer an assignment; `classification` SHALL be `deemed_assignment_consent_path_applies` or `generally_not_assignment_by_operation_of_law` (attaching the change-of-control default note in the latter case).',
      '3. For an `asset_assignment` or `sublease`, the restriction applies iff `consent_clause ≠ none_silent`; `classification` SHALL be `assignment_restriction_applies` or `no_restriction_freely_assignable`.',
      '4. When the restriction applies, `consent_standard` SHALL be resolved: `reasonableness` → `reasonableness_express`; `sole_discretion` → `sole_discretion_written_verify_ca_limits` in CA else `sole_discretion_as_written`; `consent_no_standard` → the state default (constants: consent-standard table), with its citation.',
      '5. `defer_to_counsel` SHALL be true whenever the restriction applies.',
      '6. It SHALL raise red flags for a written sole-discretion standard, for an expressly deemed control-transfer assignment (entity structure does not avoid consent), and for a landlord recapture right on the consent request.',
    ],
    constants: [
      { name: 'CA lease consent default', value: 'implied reasonableness when consent required with no stated standard', kind: 'table_data', citation: 'Kendall v. Ernest Pestana, Inc., 40 Cal.3d 488 (1985)', pin: '40 Cal.3d 488' },
      { name: 'NY lease consent default', value: 'absolute/sole-discretion consent enforced as written', kind: 'table_data', citation: 'NY assignment common law', pin: 'sole-discretion clauses enforced as written' },
      { name: 'Lease consent fallback', value: 'unsettled — verify the state before relying on implied reasonableness', kind: 'table_data', citation: 'State law varies', pin: 'verify per state' },
    ],
    inputs: {
      transfer_type: { type: 'enum', enum: 'lease_transfer_type', desc: 'The form of the transfer being tested.' },
      consent_clause: { type: 'enum', enum: 'consent_clause', desc: 'The lease consent provision as parsed.' },
      state: { type: 'string (US state code)', desc: 'Situs state, used to resolve the default consent standard.' },
      lease_deems_change_of_control_assignment: { type: 'boolean', desc: 'Whether the lease expressly deems a control transfer an assignment (default false).' },
      landlord_recapture_right: { type: 'boolean', desc: 'Whether the landlord holds a recapture right triggered by a consent request (default false).' },
    },
    outputs: {
      transfer_type: { type: 'enum', enum: 'lease_transfer_type', desc: 'The transfer type, echoed.' },
      state: { type: 'string (US state code) | null', desc: 'The situs state, echoed, or null if not supplied.' },
      classification: { type: 'enum', enum: 'lease_classification', desc: 'How the transfer classifies against the restriction.' },
      coc_default_note: { type: 'string | null', desc: 'The change-of-control default note when a control transfer is not deemed an assignment, else null.' },
      consent_required: { type: 'boolean', desc: 'Whether landlord consent is required for the transfer.' },
      consent_standard: { type: 'enum | null', enum: 'consent_standard', desc: 'The governing consent standard when consent is required, else null.' },
      consent_standard_citation: { type: 'string | null', desc: 'Citation for the state default when the clause states no standard, else null.' },
      landlord_recapture_right: { type: 'boolean', desc: 'Whether a recapture right is present.' },
      defer_to_counsel: { type: 'boolean', desc: 'True whenever the restriction applies.' },
      counsel_handoff: { type: 'string | null', desc: 'The routing sentence when the restriction applies, else null.' },
      red_flags: { type: 'string[]', desc: 'Sole-discretion, deemed-assignment, and recapture warnings.' },
    },
    boundary:
      'This model classifies the consent path a transfer must clear under a lease\'s anti-assignment and change-of-control terms and the state consent-standard table. Whether this transfer legally triggers the clause, and how the consent standard applies to it, are enforceability determinations for real-estate counsel; the model routes them with its classification and the consent facts and never answers them.',
    golden: {
      narrative: 'A New York OpCo/PropCo lease deems a change of control an assignment and requires landlord consent with no stated standard; the buyer\'s stock deal trips the clause, and New York enforces the consent as written.',
      input: { transfer_type: 'change_of_control', consent_clause: 'consent_no_standard', state: 'NY', lease_deems_change_of_control_assignment: true, landlord_recapture_right: false },
    },
  },

  /* ══ M230 — Due-on-sale screener ═════════════════════════════════════ */
  M230: {
    purpose:
      'Screens a loan\'s due-on-transfer clause against the Garn-St. Germain consumer exceptions, which reach only residential collateral of fewer than five dwelling units, and flags lender consent as a closing-critical-path item wherever no exception applies. It answers, in any deal that takes property subject to existing debt, "can the lender accelerate on this transfer, and do we need consent or a payoff before closing?" Commercial and entity-level transfers get no consumer protection.',
    algorithm: [
      'Given `loan_has_due_on_transfer_clause` and `residential_under_5_units` (and optional `transfer_kind`, default `deed_sale`):',
      '1. The implementation SHALL require both booleans; otherwise `status: "needs_inputs"`.',
      '2. If there is no due-on-transfer clause, `acceleration_risk` SHALL be `none_no_clause`.',
      '3. Else if `residential_under_5_units` is true AND `transfer_kind` is one of the Garn-St. Germain protected consumer transfers (constants: Garn-St. Germain residential unit ceiling and protected-transfer list), `acceleration_risk` SHALL be `barred_by_garn_exception`.',
      '4. Otherwise `acceleration_risk` SHALL be `lender_option_on_transfer` (commercial/entity collateral, or a non-protected residential transfer kind).',
      '5. `lender_consent_critical_path` and `defer_to_counsel` SHALL be true iff `acceleration_risk = lender_option_on_transfer`, with a red flag routing lender consent or payoff as a closing condition.',
    ],
    constants: [
      { name: 'Garn-St. Germain residential unit ceiling', value: 'fewer than 5 dwelling units', kind: 'statutory_must', citation: '12 U.S.C. § 1701j-3', pin: '§ 1701j-3(d)', effective: 'federal, current', nextCheck: 'on federal amendment', traceValues: [5] },
      { name: 'Garn-St. Germain protected transfers', value: 'spouse/child; on-death to relative; divorce decree to spouse; inter-vivos trust with borrower beneficiary; junior-lien creation; leasehold under 3 years without option', kind: 'statutory_must', citation: '12 U.S.C. § 1701j-3', pin: '§ 1701j-3(d)(1)–(8)', effective: 'federal, current' },
    ],
    inputs: {
      loan_has_due_on_transfer_clause: { type: 'boolean', desc: 'Whether the loan documents contain a due-on-sale/due-on-transfer clause.' },
      residential_under_5_units: { type: 'boolean', desc: 'Whether the collateral is residential real property of fewer than five dwelling units.' },
      transfer_kind: { type: 'enum', enum: 'transfer_kind', desc: 'The nature of the transfer (default deed_sale); the last six enum values are the Garn-protected consumer transfers.' },
    },
    outputs: {
      transfer_kind: { type: 'enum', enum: 'transfer_kind', desc: 'The transfer kind, echoed.' },
      acceleration_risk: { type: 'enum', enum: 'acceleration_risk', desc: 'The lender\'s acceleration posture.' },
      basis: { type: 'string', desc: 'Why the acceleration posture applies.' },
      citation: { type: 'string', desc: 'The Garn-St. Germain citation.' },
      lender_consent_critical_path: { type: 'boolean', desc: 'Whether lender consent (or payoff/refinance) is a closing-condition critical path.' },
      defer_to_counsel: { type: 'boolean', desc: 'True when lender consent is on the critical path.' },
      counsel_handoff: { type: 'string | null', desc: 'The routing sentence when consent is critical, else null.' },
      red_flags: { type: 'string[]', desc: 'The consent-critical-path warning when applicable.' },
    },
    boundary:
      'This model screens a due-on-transfer clause against the Garn-St. Germain consumer exceptions, which reach only residential collateral of fewer than five units. Whether the loan documents\' transfer definitions are in fact tripped by a given structure, and whether lender consent or a payoff is required, are determinations for counsel and the lender; where no consumer exception applies the model routes the consent question as a closing-critical-path item.',
    golden: {
      narrative: 'A commercial mortgage carries a due-on-transfer clause; because Garn-St. Germain\'s consumer exceptions reach only small residential loans, lender consent becomes a closing-critical-path item.',
      input: { loan_has_due_on_transfer_clause: true, residential_under_5_units: false, transfer_kind: 'deed_sale' },
    },
  },

  /* ══ M231 — Option/ROFR/ROFO trigger detector ════════════════════════ */
  M231: {
    purpose:
      'Detects, in both directions, whether a transaction form implicates an option, right of first refusal, or right of first offer — the property sale that squarely triggers the right, and the entity structure that may (or may not) avoid it. It answers, when a target property carries a preemptive right, "does our deal have to run the notice-and-matching mechanics before we sign with a third party?" Because a court can look through form, the legal conclusion always routes to counsel.',
    algorithm: [
      'Given `right_type`, `transaction_form`, and `right_captures_entity_transfers` (and optional `state`):',
      '1. The implementation SHALL require `right_type ∈ right_type enum`, `transaction_form ∈ preemptive_transaction_form enum`, and `right_captures_entity_transfers`; otherwise `status: "needs_inputs"`.',
      '2. If `transaction_form = asset_sale`, `trigger_status` SHALL be `triggered_property_sale` with a red flag to run the notice/matching mechanics.',
      '3. Else if `right_captures_entity_transfers` is true, `trigger_status` SHALL be `triggered_entity_capture_language` (the entity form does not avoid the right).',
      '4. Else `trigger_status` SHALL be `likely_not_triggered_structural`, with a double-edged red flag that a court may look through form and the counterparty will argue trigger.',
      '5. If `state = "TX"` and `right_type = rofr`, it SHALL attach the Texas strict-match construction note (constants: TX strict-match ROFR).',
      '6. `defer_to_counsel` SHALL always be true — whether a transaction legally triggers the right is a legal conclusion.',
    ],
    constants: [
      { name: 'TX strict-match ROFR', value: 'Texas courts construe ROFR matching strictly — exact match of third-party terms', kind: 'table_data', citation: 'TX strict-match construction', pin: 'exact-match rule' },
    ],
    inputs: {
      right_type: { type: 'enum', enum: 'right_type', desc: 'The preemptive right at issue.' },
      transaction_form: { type: 'enum', enum: 'preemptive_transaction_form', desc: 'The transaction form being tested.' },
      right_captures_entity_transfers: { type: 'boolean', desc: 'Whether the right\'s language expressly captures entity-level (indirect) transfers.' },
      state: { type: 'string (US state code)', desc: 'Optional situs state; enables the Texas strict-match ROFR note.' },
    },
    outputs: {
      right_type: { type: 'enum', enum: 'right_type', desc: 'The right type, echoed.' },
      transaction_form: { type: 'enum', enum: 'preemptive_transaction_form', desc: 'The transaction form, echoed.' },
      trigger_status: { type: 'enum', enum: 'trigger_status', desc: 'Whether and why the transaction implicates the right.' },
      tx_strict_match_note: { type: 'string | null', desc: 'The Texas strict-match note when applicable, else null.' },
      defer_to_counsel: { type: 'boolean', desc: 'Always true; the trigger conclusion is a legal determination.' },
      counsel_handoff: { type: 'string', desc: 'The routing sentence.' },
      red_flags: { type: 'string[]', desc: 'Direction-specific trigger warnings.' },
    },
    boundary:
      'This model detects, in both directions, whether a transaction form triggers an option, ROFR, or ROFO — the sale that squarely triggers the right and the entity structure that may avoid it. Whether a specific transaction legally triggers the right is always a legal conclusion for counsel; the model routes it with the trigger analysis and the notice/matching mechanics and never renders the conclusion itself.',
    golden: {
      narrative: 'A ground-lease ROFR sits over a Texas property; the deal is structured as an entity transfer the right does not expressly capture — but a court could still look through the form, so both readings route to counsel.',
      input: { right_type: 'rofr', transaction_form: 'entity_transfer', right_captures_entity_transfers: false, state: 'TX' },
    },
  },

  /* ══ M232 — Controlling-interest transfer-tax & reassessment screener ═ */
  M232: {
    purpose:
      'Screens an entity-level transfer of a property-owning company for controlling-interest transfer tax and property-tax reassessment against the state regime table, and flags step-transaction exposure when a mere-change exemption is claimed alongside related steps. It answers, when real estate moves inside an entity deal, "does no deed still mean no transfer tax or reassessment here?" NY (50% controlling-interest tax with 3-year aggregation), CA (Prop 13 change-in-control reassessment), and TX (constitutional prohibition) are encoded as data.',
    algorithm: [
      'Given `state`, `is_entity_transfer`, `transfer_pct` (and optional `cumulative_related_transfers_pct`, `mere_change_exemption_claimed` (default false), `related_steps_planned` (default false)):',
      '1. The implementation SHALL require `state`, `is_entity_transfer`, and `transfer_pct`; otherwise `status: "needs_inputs"`.',
      '2. It SHALL look up the state regime (constants: transfer-tax regime table). If the state is absent, it SHALL emit `regime_known: false`, `defer_to_counsel: true`, and a table-gap flag.',
      '3. `citt_screen_triggered` SHALL be true iff the regime imposes a controlling-interest tax, `is_entity_transfer` is true, a threshold exists, and `max(transfer_pct, cumulative_related_transfers_pct) ≥ threshold` (constants: NY controlling-interest threshold).',
      '4. `reassessment_screen_triggered` SHALL be true iff the regime reassesses on control change, `is_entity_transfer` is true, and `transfer_pct` or the cumulative figure exceeds 50 (constants: CA Prop 13 change-in-control).',
      '5. `step_transaction_risk` SHALL be true iff `mere_change_exemption_claimed` AND `related_steps_planned`.',
      '6. `defer_to_counsel` SHALL be true if any screen or the step-transaction flag fires, with per-trigger red flags (and the Texas no-transfer-tax note).',
    ],
    constants: [
      { name: 'NY controlling-interest threshold', value: '50%', kind: 'table_data', citation: 'NYC Admin. Code § 11-2101', pin: 'controlling interest = 50% or more', traceValues: [50] },
      { name: 'NY controlling-interest aggregation window', value: '3 years', kind: 'table_data', citation: 'NY Pub. 576', pin: '3-year acting-in-concert aggregation', traceValues: [3] },
      { name: 'CA Prop 13 change-in-control', value: '>50% control change → 100% reassessment', kind: 'table_data', citation: 'Cal. Rev. & Tax. Code § 64', pin: '§ 64(c)–(d)' },
      { name: 'TX transfer-tax prohibition', value: 'no real-estate transfer tax', kind: 'table_data', citation: 'Tex. Const. art. VIII § 29', pin: 'art. VIII § 29' },
    ],
    inputs: {
      state: { type: 'string (US state code)', desc: 'Situs state of the property, used to select the transfer-tax regime.' },
      is_entity_transfer: { type: 'boolean', desc: 'Whether the transaction moves interests in an entity that owns the property (rather than a deed).' },
      transfer_pct: { type: 'number', desc: 'Percentage of entity interests transferred in this step (0–100).', unit: 'percent' },
      cumulative_related_transfers_pct: { type: 'number', desc: 'Cumulative percentage transferred across related steps within the aggregation window (0–100); defaults to transfer_pct.', unit: 'percent' },
      mere_change_exemption_claimed: { type: 'boolean', desc: 'Whether a mere-change-of-identity exemption is being claimed (default false).' },
      related_steps_planned: { type: 'boolean', desc: 'Whether related transfer steps are planned (default false); with a mere-change claim this drives step-transaction risk.' },
    },
    outputs: {
      state: { type: 'string (US state code)', desc: 'The situs state, echoed.' },
      regime_known: { type: 'boolean', desc: 'Whether the state is in the transfer-tax regime table.' },
      citation: { type: 'string', desc: 'The citation for the state regime.' },
      controlling_interest_threshold_pct: { type: 'number | null', desc: 'The controlling-interest threshold for the state, or null.', unit: 'percent' },
      citt_screen_triggered: { type: 'boolean', desc: 'Whether the controlling-interest transfer-tax screen fires.' },
      reassessment_screen_triggered: { type: 'boolean', desc: 'Whether the property-tax reassessment screen fires.' },
      aggregation_years: { type: 'integer | null', desc: 'The acting-in-concert aggregation window in years, or null.', unit: 'years' },
      step_transaction_risk: { type: 'boolean', desc: 'Whether a mere-change claim plus related steps raises step-transaction risk.' },
      defer_to_counsel: { type: 'boolean', desc: 'True when any screen or the step-transaction flag fires, or the state is untabled.' },
      counsel_handoff: { type: 'string | null', desc: 'The routing sentence when a screen fires, else null.' },
      red_flags: { type: 'string[]', desc: 'Per-trigger warnings.' },
    },
    boundary:
      'This model screens a transfer for controlling-interest transfer tax and property-tax reassessment against the state regime table. Whether a specific transfer is in fact taxable or reassessable, and how to structure around it, are tax determinations for tax counsel; on a positive screen the model routes them with the screen and the step-transaction flag and renders no taxability opinion.',
    golden: {
      narrative: 'A 100% membership-interest sale of a New York property-owning LLC claims the mere-change exemption while related steps are planned; the controlling-interest tax screen trips and the step-transaction doctrine threatens the exemption.',
      input: { state: 'NY', is_entity_transfer: true, transfer_pct: 100, mere_change_exemption_claimed: true, related_steps_planned: true },
    },
  },

  /* ══ M233 — Permit/CO transferability & bulk-sales screener ══════════ */
  M233: {
    purpose:
      'Screens whether certificates of occupancy and operating permits re-issue on the transfer, whether specific permits fail to travel with an asset deal, and whether state bulk-sales tax-clearance notification applies, plus a CERCLA successor flag. It answers, in an asset or entity acquisition of an operating property, "what re-permitting and clearance filings sit on the closing critical path, and where does successor liability follow the buyer regardless of form?" CA/NY/NJ/PA bulk-sales regimes are encoded as data.',
    algorithm: [
      'Given `deal_form` and `jurisdiction_requires_co_on_transfer` (and optional `use_change` (default false), `permits`, `states_involved`, `cercla_linked_property` (default false)):',
      '1. The implementation SHALL require `deal_form ∈ permit_deal_form enum` and `jurisdiction_requires_co_on_transfer`; otherwise `status: "needs_inputs"`.',
      '2. `co_required_on_transfer` SHALL be true iff a CO is required on transfer AND (`deal_form = asset` OR `use_change`).',
      '3. `non_transferable_permits` SHALL be the labels of supplied permits marked non-transferable.',
      '4. `bulk_sales_notification_states` SHALL be the supplied states that appear in the bulk-sales notification table (constants: bulk-sales notification states).',
      '5. `defer_to_counsel` SHALL be true iff the property is CERCLA-linked OR (`deal_form = asset` AND at least one bulk-sales state applies).',
      '6. It SHALL raise red flags for CO re-issuance, non-transferable permits (by deal form), applicable bulk-sales notification, and CERCLA successor liability.',
    ],
    constants: [
      { name: 'Bulk-sales notification states', value: 'CA, NY, NJ, PA (tax-clearance/notification regimes; PA reaches real-estate-only transfers)', kind: 'table_data', citation: 'Cal. U. Com. Code §§ 6101–6111; N.Y. Tax Law § 1141(c); N.J.S.A. 54:50-38; 69 P.S. § 529 / 72 P.S. § 1403', pin: 'per-state notification statutes' },
      { name: 'CERCLA successor liability', value: 'environmental successor liability survives regardless of deal form or bulk-sales repeal', kind: 'table_data', citation: 'CERCLA § 107 (42 U.S.C. § 9607)', pin: '§ 107' },
    ],
    inputs: {
      deal_form: { type: 'enum', enum: 'permit_deal_form', desc: 'The acquisition form.' },
      jurisdiction_requires_co_on_transfer: { type: 'boolean', desc: 'Whether the jurisdiction requires a certificate of occupancy to be re-issued on transfer.' },
      use_change: { type: 'boolean', desc: 'Whether the transaction involves a change of use (default false); can require a CO even in an entity deal.' },
      permits: { type: 'object[]', desc: 'Operating permits; each object carries `label` (string) and `transferable` (boolean).' },
      states_involved: { type: 'string[]', desc: 'Two-letter state codes touched by the deal, screened against the bulk-sales table.' },
      cercla_linked_property: { type: 'boolean', desc: 'Whether the property has a CERCLA/environmental linkage (default false).' },
    },
    outputs: {
      deal_form: { type: 'enum', enum: 'permit_deal_form', desc: 'The deal form, echoed.' },
      co_required_on_transfer: { type: 'boolean', desc: 'Whether a certificate of occupancy must be re-issued on this transfer.' },
      non_transferable_permits: { type: 'string[]', desc: 'Labels of permits that do not travel with the transfer.' },
      bulk_sales_notification_states: { type: 'string[]', desc: 'Applicable bulk-sales notification states.' },
      bulk_sales_citations: { type: 'string[]', desc: 'Per-state bulk-sales citations for the applicable states.' },
      cercla_successor_flag: { type: 'boolean', desc: 'Whether CERCLA successor liability is flagged.' },
      defer_to_counsel: { type: 'boolean', desc: 'True on a CERCLA link or an asset-deal bulk-sales trigger.' },
      counsel_handoff: { type: 'string | null', desc: 'The routing sentence when successor/bulk-sales exposure defers, else null.' },
      red_flags: { type: 'string[]', desc: 'CO, permit-transfer, bulk-sales, and CERCLA warnings.' },
    },
    boundary:
      'This model screens permit and certificate-of-occupancy transferability and bulk-sales tax-clearance applicability by deal form and jurisdiction. Whether a specific permit survives the transfer, and the scope of successor and environmental liability, are determinations for counsel; on a CERCLA link or an asset-deal bulk-sales trigger the model routes them and does not resolve the exposure.',
    golden: {
      narrative: 'An asset purchase of a New Jersey restaurant property: the certificate of occupancy must be re-issued on transfer, the liquor license does not travel with the assets, and New Jersey\'s bulk-sales notification applies — miss it and the buyer inherits the seller\'s tax.',
      input: { deal_form: 'asset', jurisdiction_requires_co_on_transfer: true, use_change: false, permits: [ { label: 'Liquor license', transferable: false } ], states_involved: ['NJ'], cercla_linked_property: false },
    },
  },

  /* ══ M234 — Fixture classification & UCC § 9-334 priority ════════════ */
  M234: {
    purpose:
      'Resolves the priority contest between a fixture secured party and a recorded real-property interest under UCC § 9-334, applying the subsection (c) real-property default, the (d) purchase-money 20-day fixture-filing exception, and the (h) construction-mortgage override. It answers, when financed equipment is affixed to mortgaged real estate, "whose lien wins — the equipment lender\'s or the mortgagee\'s?" It also flags the purchase-price-allocation consequence of the fixture-versus-personalty line.',
    algorithm: [
      'Given `pmsi`, `fixture_filing_made`, and `prior_recorded_real_property_interest` (and optional `filing_days_after_affixation`, `construction_mortgage` (default false)):',
      '1. The implementation SHALL require the three booleans; otherwise `status: "needs_inputs"`.',
      '2. `within_20_day_window` SHALL be true iff a fixture filing was made and `filing_days_after_affixation ≤ 20` (constants: UCC § 9-334(d) 20-day window).',
      '3. If there is no prior recorded real-property interest, `priority` SHALL be `fixture_secured_party` when a fixture filing was made, else `first_to_perfect`.',
      '4. Else if a construction mortgage is present, `priority` SHALL be `real_property_interest` (§ 9-334(h) override).',
      '5. Else if the interest is a PMSI within the 20-day window, `priority` SHALL be `fixture_secured_party` (§ 9-334(d) primes the recorded interest).',
      '6. Else `priority` SHALL be `real_property_interest` (§ 9-334(c) default).',
      '7. It SHALL raise red flags for a PMSI filed outside the 20-day window against a prior interest, and for a PMSI with no fixture filing.',
    ],
    constants: [
      { name: 'UCC § 9-334(d) 20-day window', value: '20 days after affixation', kind: 'statutory_must', citation: 'U.C.C. § 9-334(d)', pin: '§ 9-334(d)', traceValues: [20] },
      { name: 'UCC § 9-334(h) construction-mortgage override', value: 'construction mortgage primes a fixture interest arising during construction', kind: 'statutory_must', citation: 'U.C.C. § 9-334(h)', pin: '§ 9-334(h)' },
      { name: 'UCC § 9-334(c) default', value: 'the conflicting real-property interest prevails absent a qualifying exception', kind: 'statutory_must', citation: 'U.C.C. § 9-334(c)', pin: '§ 9-334(c)' },
    ],
    inputs: {
      pmsi: { type: 'boolean', desc: 'Whether the fixture interest is a purchase-money security interest.' },
      fixture_filing_made: { type: 'boolean', desc: 'Whether a fixture filing was made in the real-property records (a UCC-1 alone does not suffice).' },
      prior_recorded_real_property_interest: { type: 'boolean', desc: 'Whether a conflicting real-property interest (e.g., a mortgage) was recorded first.' },
      filing_days_after_affixation: { type: 'integer', desc: 'Days between affixation and the fixture filing; decisive for the 20-day PMSI window.', unit: 'days' },
      construction_mortgage: { type: 'boolean', desc: 'Whether the prior interest is a construction mortgage (default false); triggers the § 9-334(h) override.' },
    },
    outputs: {
      priority: { type: 'enum', enum: 'fixture_priority', desc: 'Which interest holds priority in the fixture.' },
      basis: { type: 'string', desc: 'The UCC § 9-334 subsection that governs the outcome.' },
      pmsi: { type: 'boolean', desc: 'Whether the interest is a PMSI, echoed.' },
      fixture_filing_made: { type: 'boolean', desc: 'Whether a fixture filing was made, echoed.' },
      filing_days_after_affixation: { type: 'integer | null', desc: 'Days after affixation, echoed, or null if not supplied.', unit: 'days' },
      within_20_day_window: { type: 'boolean', desc: 'Whether the fixture filing fell within the 20-day PMSI window.' },
      construction_mortgage: { type: 'boolean', desc: 'Whether a construction mortgage is present, echoed.' },
      ppa_note: { type: 'string', desc: 'Standing note that the fixture-versus-personalty line shifts purchase-price allocation, transfer-tax base, and depreciation.' },
      defer_to_counsel: { type: 'boolean', desc: 'False; the priority follows deterministically from the supplied facts.' },
      red_flags: { type: 'string[]', desc: 'Window-missed and no-fixture-filing warnings.' },
    },
    boundary:
      'This model resolves fixture-versus-real-property priority under UCC § 9-334 from perfection and timing facts. Whether an item is in fact a fixture, and whether a filing is legally effective, are determinations for counsel and the title insurer; the model computes the priority the supplied facts imply and flags the purchase-price-allocation consequence for reconciliation.',
    golden: {
      narrative: 'A lender takes a purchase-money security interest in rooftop HVAC units and perfects by fixture filing 15 days after installation; within the 20-day window, the PMSI primes the recorded mortgage.',
      input: { pmsi: true, fixture_filing_made: true, prior_recorded_real_property_interest: true, filing_days_after_affixation: 15, construction_mortgage: false },
    },
  },
};
