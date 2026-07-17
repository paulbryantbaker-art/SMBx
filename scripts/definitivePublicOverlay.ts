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
  // Gate-predicate vocabulary (B5) — the deal-fact enums the routing gates evaluate.
  counterparty_type: { values: ['strategic', 'financial_sponsor', 'individual', 'fund_lp', 'fund_gp', 'esop_trust'], description: 'The counterparty archetype. A fund counterparty (fund_lp/fund_gp) activates the secondaries gate (G26).' },
  buyer_archetype: { values: ['strategic', 'financial_sponsor', 'independent_sponsor', 'search_fund', 'esop', 'family_office'], description: 'The acquirer archetype. Independent-sponsor, search-fund, and ESOP archetypes activate the acquirer-economics gate (G27).' },
  deal_type: { values: ['asset_purchase', 'stock_purchase', 'merger', 'secondary', 'continuation', 'strip', 'nav'], description: 'The transaction type. The secondary/continuation/strip/nav values activate the secondaries gate (G26). Canonical name for the transaction-type deal fact.' },
  deal_form: { values: ['asset', 'stock', 'merger', 'asset_sale', 'stock_sale', '338h10'], description: 'The transaction form. The gate predicates test membership in {asset, stock, merger} (G2) and set-ness (G15); model contracts may carry the finer forms (asset_sale/stock_sale/338h10). Unifying deal_form and deal_type onto one canonical granularity is a scheduled cleanup.' },
  // Inputs
  deed_type: { values: ['general_warranty', 'special_warranty', 'bargain_and_sale', 'quitclaim', 'grant_deed', 'bargain_and_sale_with_covenant'], description: 'The deed instrument type, which fixes the title-covenant set conveyed. Includes the two dominant anchor-state instruments: the California grant deed (Cal. Civ. Code § 1113, two implied covenants) and the New York bargain-and-sale deed with covenant against grantor\'s acts (N.Y. RPL § 258, one covenant).' },
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
  // Legal / agreement-economics family
  basket_type: { values: ['deductible', 'tipping', 'deductible_or_tipping_to_confirm'], description: 'How the indemnification basket operates: a true deductible (recovery only above the threshold), a tipping basket (first-dollar recovery once the threshold is crossed), or unresolved pending confirmation.' },
  condition_type: { values: ['general', 'regulatory', 'mae', 'financing', 'consent', 'cfius', 'hsr', 'legal'], description: 'The category of a closing condition; regulatory/MAE/financing/consent/CFIUS/HSR/legal types route to specialist review.' },
  dispute_forum: { values: ['accounting_arbitrator', 'expert_determination', 'arbitration', 'courts'], description: 'The forum designated to resolve an earnout or true-up dispute.' },
  tax_characterization: { values: ['requires_tax_review', 'installment_sale', 'imputed_interest', 'compensation'], description: 'The earnout\'s tax-characterization selector; the binding treatment is a tax-advisor determination.' },
  // Finance / structure families
  conversion_driver: { values: ['valuation_cap', 'discount', 'priced_round_price'], description: 'Which term set the lowest (governing) conversion price for a convertible/SAFE: the valuation cap, the discount, or the priced-round share price itself.' },
  redemption_path: { values: ['make_whole', 'stated_call'], description: 'The cheaper of the two redemption routes: the make-whole (Treasury-plus-spread present value) or the stated call price.' },
  // IP family (row sub-field vocabularies)
  lien_search_track: { values: ['ucc', 'uspto', 'copyright'], description: 'The lien-search record system a search row runs against: UCC filing office, USPTO assignment/security record, or the U.S. Copyright Office.' },
  license_direction: { values: ['inbound', 'outbound'], description: 'Whether a license is taken in (inbound — a dependency of the target) or granted out (outbound).' },
  oss_license_class: { values: ['permissive', 'weak_copyleft', 'strong_copyleft', 'unknown'], description: 'The copyleft class of an open-source component: permissive (MIT/BSD/Apache), weak copyleft (LGPL/MPL/EPL), strong copyleft (GPL/AGPL), or unknown/unclassified.' },
  // Real-estate family
  firpta_path: { values: ['not_foreign_seller', 'personal_residence_300k_or_less_exemption', 'personal_residence_300k_to_1m_reduced_rate', 'default_firpta_withholding'], description: 'The FIRPTA withholding path taken: not a foreign seller (no withholding), the $300k-or-less personal-residence exemption, the $300k–$1M reduced-rate residence path, or the default 15% withholding.' },
  asc842_classification: { values: ['finance_lease_indicator_present', 'operating_lease_indicator_on_supplied_facts'], description: 'Whether at least one ASC 842 finance-lease indicator is present on the supplied facts, or none is (pointing to operating-lease/sale accounting) — an indicator screen, not a classification opinion.' },
  debt_assumability: { values: ['not_supplied', 'assumable_on_supplied_facts', 'consent_or_refinance_required'], description: 'Whether existing property debt is assumable on the supplied facts, requires lender consent or a refinance, or was not supplied.' },
  property_escrow_category: { values: ['environmental', 'pca', 'title', 'tenant', 'cost_to_cure', 'other'], description: 'The category a property-level escrow issue is bucketed into for sizing: environmental, physical-condition (PCA), title, tenant, cost-to-cure, or other.' },
  // Restructuring family
  cramdown_framework: { values: ['efficient_market', 'till_formula'], description: 'Which cramdown-rate framework governs: the efficient-market rate (where a market exists and the circuit applies it) or the Till formula (prime plus a risk premium).' },
  chapter22_risk_band: { values: ['high', 'watch', 'lower'], description: 'The Chapter 22 (repeat-filing) recidivism-risk band a computed score falls into.' },
  // Tax family
  transaction_cost_classification: { values: ['pre_bright_line_investigatory_195', 'success_based_fee_70_30_safe_harbor', 'inherently_facilitative_capitalized', 'post_bright_line_facilitative_capitalized'], description: 'How a transaction cost is classified for tax: pre-bright-line §195 investigatory (amortizable), a success-based fee under the Rev. Proc. 2011-29 70/30 safe harbor, an inherently facilitative cost (capitalized), or a post-bright-line facilitative cost (capitalized).' },
  imputed_interest_characterization: { values: ['section_483_or_1274_review', 'adequate_stated_interest_short_term_check'], description: 'Which imputed-interest regime a deferred-payment obligation routes to: the §483/§1274 review for terms over a year, or the short-term adequate-stated-interest check.' },
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
  // ── B8 retype pass (2026-07-17): every row the heuristic dropped into the
  // non-vocabulary `practice-or-guidance` bucket, hand-tagged to the stated
  // vocabulary. Short case names (no "v."/reporter) and §-less statutes are the
  // two families the classifier could not see.
  // Controlling decisions → case
  '203 N. LaSalle': 'case', 'AB Stable': 'case', 'Akorn': 'case', 'At Home': 'case',
  'Castleton Plaza': 'case', 'Channel Medsystems': 'case', 'Delaware equitable-remedy case law': 'case',
  'English MAC case law': 'case', 'Envision': 'case', 'fairness opinion case law': 'case',
  'Fisker': 'case', 'Frontier': 'case', 'Howey': 'case', 'Indianapolis Downs': 'case',
  'INDOPCO': 'case', 'Klang': 'case', 'Match Group': 'case', 'MFW': 'case', 'Mitel': 'case',
  'MPM Silicones': 'case', 'Pluralsight': 'case', 'RadLAX': 'case', 'Sabre': 'case', 'Serta Simmons': 'case',
  'Texas Grand Prairie': 'case', 'Till': 'case', 'Topp': 'case', 'Tribune': 'case', 'Trinseo': 'case',
  // Statutes / promulgated law → statute
  'CT 12-638': 'statute', 'MD Tax-Prop 12-117': 'statute', 'WA RCW 82.45': 'statute',
  'OBBBA 2025': 'statute', 'OBBBA Sec. 70301': 'statute', 'OBBBA Sec. 70302': 'statute',
  'OBBBA Sec. 70425': 'statute', 'OBBBA Sec. 70505': 'statute', 'TIA 316(b)': 'statute',
  'UDITPA': 'statute', 'UFTA': 'statute', 'UVTA': 'statute', 'CPRA': 'statute', 'FRBP 3001': 'statute',
  // Regulations (federal/EU/SRO) → regulation
  'Regulation (EU) 2024/1689': 'regulation', 'CFIUS regulations': 'regulation', 'GDPR': 'regulation',
  'Rule 14d-10': 'regulation', 'Rule 14e-1': 'regulation', 'Nasdaq Rule 5635': 'regulation',
  'OFAC': 'regulation', 'T.D. 10000': 'regulation',
  // Agency guidance / treatises / accounting standards → guidance
  'Letter Ruling 202308010': 'guidance', 'DOL ESOP guidance': 'guidance',
  'ILPA continuation-fund guidance': 'guidance', 'SEC climate and ESG references': 'guidance',
  'SEC climate disclosure references': 'guidance', 'SEC Project Crypto': 'guidance', 'NIST CSF': 'guidance',
  'Collier 364.06': 'guidance', 'ASC 842': 'guidance',
  'FTC 2026 HSR - Auto-Reportable': 'guidance', 'FTC 2026 HSR - Size of Transaction': 'guidance',
  // Named studies / datasets → study/dataset
  'LoPucki Bankruptcy Research Database': 'study/dataset', 'Moody\'s Ultimate Recovery Database': 'study/dataset',
  'Fenwick 2023 ARBF analysis': 'study/dataset', 'RWI market studies': 'study/dataset',
  // Market conventions / standard instruments (no controlling citation) → practice-norm
  'ABA Business Law Today': 'practice-norm', 'Convertible Financing Market Practice': 'practice-norm',
  'Credit Agreement Market Practice': 'practice-norm', 'ETA market norms': 'practice-norm',
  'market practice': 'practice-norm', 'Restructuring Market Practice': 'practice-norm',
  'Secondary Market Practice': 'practice-norm', 'TRA market practice': 'practice-norm',
  'UK market practice': 'practice-norm', 'LSTA model AAL': 'practice-norm', 'NVCA term sheet': 'practice-norm',
  'YC SAFE': 'practice-norm', 'BOMA': 'practice-norm', 'ASTM E2018': 'practice-norm', 'J. Crew': 'practice-norm',
  // Standardized OSS license instruments (the M221 license→class authorities) → practice-norm
  'AGPL': 'practice-norm', 'Apache': 'practice-norm', 'BSD': 'practice-norm',
  'GPL': 'practice-norm', 'LGPL': 'practice-norm', 'MIT': 'practice-norm',
};

/* ── Gate registry drafts (Item 7 — FOUNDER-GATED) ─────────────────────────
 * CC drafts candidate names, purpose narratives, and machine-evaluable trigger
 * predicates over data-dictionary fields for every routed-but-unnamed gate;
 * unrouted IDs are Reserved. These are NOT published and NOT merged into the
 * spec's DEFINITIVE_GATE_EXPANSIONS — the generator emits them only to
 * dist/definitive-internal/GATE_REGISTRY_FOR_FOUNDER_APPROVAL.md. The publish
 * gate blocks on any unnamed routed gate, so the spec cannot ship until the
 * founder approves these and they are merged deliberately.
 */
export interface GateDraft {
  gate: string; name: string; purpose: string; predicate: string;
  reserved?: boolean; note?: string;
}
export const GATE_REGISTRY_DRAFTS: GateDraft[] = [
  { gate: 'G1', name: 'Reps, Warranties & Indemnification', purpose: 'Activates the representation and warranty architecture and the indemnification-ladder mechanics of the definitive agreement once the deal reaches definitive-agreement drafting.', predicate: 'definitive_agreement_stage == true' },
  { gate: 'G2', name: 'Transaction Form & Purchase-Price Allocation', purpose: 'Activates the asset/stock/merger form fork and the purchase-price-allocation mechanics that follow from the chosen form.', predicate: 'deal_form in {asset, stock, merger} AND purchase_price_cents > 0' },
  { gate: 'G6', name: 'Closing Conditions', purpose: 'Activates condition-precedent tracking for the period between signing and closing.', predicate: 'signed == true AND closed == false' },
  { gate: 'G7', name: 'Execution & Closing Certainty', purpose: 'Activates the execution-risk stack — regulatory reportability, MAE durational significance, insurance architecture, transition services, and closing mechanics.', predicate: 'signed == true OR loi_executed == true' },
  { gate: 'G8', name: 'Post-Closing Recourse', purpose: 'Activates escrow, holdback, survival, and insurance-backed recourse sizing after closing.', predicate: 'indemnity_structure_required == true' },
  { gate: 'G9', name: 'Contingent Consideration', purpose: 'Activates earnout design, measurement, and dispute mechanics when part of the price is contingent.', predicate: 'contingent_consideration == true' },
  { gate: 'G10', name: 'Intellectual Property Mechanics', purpose: 'Activates IP diligence, chain-of-title, transfer, and allocation mechanics when IP is material to value.', predicate: 'ip_material_to_value == true' },
  { gate: 'G14', name: 'Seller Proceeds & Price Adjustment', purpose: 'Activates seller-side proceeds tax treatment (e.g., QSBS) and price-adjustment pegs on the sell side.', predicate: 'sell_side_context == true', note: 'LOW CONFIDENCE — QSBS + working-capital-peg pairing is odd; founder option to re-route QSBS to G15 only and rename this "Price Adjustment Mechanics".' },
  { gate: 'G15', name: 'Tax & Corporate Structure', purpose: 'The master structuring gate: tax elections, reorganization qualification, corporate-law mechanics, and equity-structure math. Runs whenever a deal form is set (structure analysis always applies).', predicate: 'deal_form is set' },
  { gate: 'G19', name: 'State & Local Transaction Tax', purpose: 'Activates state/local transfer-tax, controlling-interest, SALT, and clearance mechanics when US state jurisdictions are involved.', predicate: 'states_involved.length > 0' },
  { gate: 'G23', name: 'Cross-Border Deal Terms', purpose: 'Activates non-US deal-term and merger-control overlays when a non-US jurisdiction is in play.', predicate: 'non_us_jurisdiction == true' },
  { gate: 'G24', name: 'Regulatory & Compliance Diligence Overlays', purpose: 'Activates the regulatory-diligence overlay family (privacy, cyber, sanctions, ESG, sector regulation) for regulated data or operations.', predicate: 'regulated_data_or_operations == true' },
  { gate: 'G26', name: 'Fund Secondaries & GP-Led Transactions', purpose: 'Activates fund-level and secondaries mechanics (continuation funds, LP secondaries, strip sales, NAV facilities).', predicate: 'counterparty_type in {fund_lp, fund_gp} OR deal_type in {secondary, continuation, strip, nav}' },
  { gate: 'G27', name: 'Sponsor, Search & Employee-Ownership Economics', purpose: 'Activates acquirer-archetype economics — independent-sponsor promotes, search-fund step-ups, and ESOP structures.', predicate: 'buyer_archetype in {independent_sponsor, search_fund, esop}' },
  // Unrouted IDs — Reserved (no models route through them; no activation criteria fabricated)
  ...['G3', 'G4', 'G5', 'G11', 'G12', 'G13', 'G16', 'G17', 'G18', 'G20', 'G21', 'G22', 'G25'].map(g => ({
    gate: g, name: 'Reserved', reserved: true,
    purpose: 'Reserved gate ID — family and activation criteria to be specified; no models route here yet.',
    predicate: 'n/a (reserved)',
  })),
];

/* ── Model overlay contract ────────────────────────────────────────────────
 * `kind` on a constant:
 *   statutory_must     — a binding value from a governing authority (statute,
 *                        regulation, or agency program rule such as the SBA
 *                        SOP). Computation MUST use it.
 *   cited_median_should— a market-median default from a named study. A
 *                        SHOULD-strength default, distinct from a MUST.
 *   table_data         — a jurisdictional lookup value (the state-law tables);
 *                        selected by the deal's facts, cited to its source.
 *   pass_through       — L5 live data supplied at runtime with an asof
 *                        timestamp (HSR thresholds, AFRs, FRED series, the
 *                        IRS §382 rate); carries no static value.
 * traceValues: raw numeric forms that may legitimately appear in a worked
 * example's OUTPUT (e.g. a dollar cap and its cents scaling), so the
 * untraceable-literal gate can prove every output number is a constant, an
 * input, or an algorithm-derived value.
 */
export type ConstantKind = 'statutory_must' | 'cited_median_should' | 'table_data' | 'pass_through';
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
  founderReview?: boolean;    // tax/legal-sensitive — awaits founder algorithm verification
  staticOutputs?: string[];   // P0.5 — output fields that are echoes/static, not computed by a step
}

export const MODEL_OVERLAYS: Record<string, ModelOverlay> = {

  /* ══ M109 — Working-capital peg (SCOPE-HONESTY FLAG) ══════════════════ */
  M109: {
    purpose:
      'Computes the working-capital peg — the reference net-working-capital level a purchase agreement locks in at signing — as the trailing arithmetic mean of a company\'s supplied monthly NWC observations, and reports the observed low–high range around it. The peg answers, for the buyer and seller negotiating the price adjustment, "what normalized level of working capital should be delivered at close?" It establishes the peg and its dispersion only; the post-closing estimated-versus-actual true-up sequence and any collar are specified separately by M210.',
    scopeFlag:
      'Scope: this model computes the working-capital peg as the trailing-mean of the supplied observations and reports the observed minimum and maximum. It does not compute a negotiated target, a post-closing true-up, or a collar; the closing-statement true-up sequence is specified by M210 (Closing-statement true-up sequence), cross-referenced here.',
    algorithm: [
      'Given `monthly_nwc_cents`, a list of integer-cents net-working-capital observations, one per trailing month:',
      '1. The implementation SHALL coerce each element to integer cents and discard non-numeric elements. If no numeric observation remains, it SHALL return `status: "needs_inputs"` with `monthly_nwc_cents` in `missingInputs` and emit no outputs.',
      '2. `observed_months` SHALL be the count of retained observations.',
      '3. `peg_cents` SHALL be the arithmetic mean of the retained observations, rounded to the nearest integer cent (see precision rule).',
      '4. `low_cents` SHALL be the minimum retained observation; `high_cents` SHALL be the maximum.',
      '5. The model SHALL NOT emit a target, a true-up, or a collar; those are out of scope for this slot (see scope note; M210 owns the true-up).',
    ],
    constants: [],
    precisionRule: 'All outputs are exact integer cents or counts (see the Conventions chapter); peg_cents is the mean rounded to the nearest integer cent.',
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
    scopeFlag: 'Scope: the equity-injection floor is measured here against `purchase_price_cents`. SOP 50 10 8 measures the 10% minimum against **total project cost** (purchase price plus financed closing costs, working capital, and the guaranty fee). Where project cost exceeds the price, this screen reports a higher equity percentage than the program test and can pass a deal the real test fails — supply a project-cost figure as the denominator (or treat a marginal pass as a lender question).',
    algorithm: [
      'Given `purchase_price_cents`, `cash_flow_cents` (post-acquisition free cash flow available for debt service), `buyer_equity_cents`, and `annual_debt_service_cents`:',
      '1. If any of the four is missing or non-numeric, the implementation SHALL return `status: "needs_inputs"` naming the missing fields and emit no outputs.',
      '2. `buyer_equity_pct` SHALL be `buyer_equity_cents ÷ purchase_price_cents`, rounded half to even to 4 decimals (the global precision rule — see the Conventions chapter).',
      '3. `dscr` SHALL be `cash_flow_cents ÷ annual_debt_service_cents`, rounded half to even to 4 decimals (the global precision rule — see the Conventions chapter).',
      '4. `meets_sba_equity_floor` SHALL be true iff `buyer_equity_pct ≥ SBA equity-injection floor` (constants: SBA 7(a) minimum equity injection).',
      '5. `meets_sba_dscr_floor` SHALL be true iff `dscr ≥ SBA debt-service-coverage floor` (constants: SBA 7(a) DSCR floor).',
      '6. `max_7a_loan_cents` SHALL be the 7(a) maximum loan amount in cents (constants: SBA 7(a) maximum loan amount).',
    ],
    constants: [
      { name: 'SBA 7(a) maximum loan amount', value: '$5,000,000', kind: 'statutory_must', citation: 'SBA SOP 50 10 8', pin: 'Subpart B — 7(a) maximum loan amount; 15 U.S.C. § 636(a)(3)(A)', effective: '2025-06-01', nextCheck: 'on next SOP revision', traceValues: [5_000_000, 500_000_000] },
      { name: 'SBA 7(a) minimum equity injection', value: '10% (0.10)', kind: 'statutory_must', citation: 'SBA SOP 50 10 8', pin: 'Subpart B — minimum equity injection for change-of-ownership', effective: '2025-06-01', nextCheck: 'on next SOP revision', traceValues: [0.1, 10] },
      { name: 'SBA 7(a) DSCR floor', value: '1.15×', kind: 'statutory_must', citation: 'SBA SOP 50 10 8', pin: 'Subpart B — business-acquisition debt-service-coverage floor', effective: '2025-06-01', nextCheck: 'on next SOP revision', traceValues: [1.15] },
    ],
    precisionRule: 'Rates and ratios follow the global precision rule (half-even to 4 decimals at the output boundary — see the Conventions chapter): buyer_equity_pct and dscr are 4-decimal; max_7a_loan_cents is exact integer cents.',
    inputs: {
      purchase_price_cents: { type: 'integer (cents)', desc: 'Total acquisition purchase price.', unit: 'cents' },
      cash_flow_cents: { type: 'integer (cents)', desc: 'Post-acquisition annual free cash flow available for debt service.', unit: 'cents' },
      buyer_equity_cents: { type: 'integer (cents)', desc: 'Buyer equity injection into the transaction.', unit: 'cents' },
      annual_debt_service_cents: { type: 'integer (cents)', desc: 'Annual principal-and-interest debt service on the acquisition debt.', unit: 'cents' },
    },
    outputs: {
      buyer_equity_pct: { type: 'number', desc: 'Buyer equity as a fraction of purchase price (0–1).', precision: 4 },
      dscr: { type: 'number', desc: 'Debt-service coverage ratio: cash flow ÷ annual debt service.', precision: 4 },
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
    precisionRule: 'All values are exact integer cents (see the Conventions chapter); no rounding.',
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
      '5. **Validity guard:** if `vesting_form = tenancy_by_entirety` and `state` is a community-property state (which does not recognize the entirety estate), it SHALL set `vesting_state_validity_gap: true`, `defer_to_counsel: true`, and raise a red flag — the vesting cannot legally exist in that state and is likely miscoded, so the model routes rather than answering a covenant/signatory question on an impossible fact pattern.',
      '6. It SHALL raise a warranty red flag if `buyer_expects_warranty` is true but the deed carries no covenants; and if `all_required_signers_present` is explicitly false OR the validity guard fired it SHALL set `defer_to_counsel: true` and emit a counsel-handoff.',
    ],
    constants: [
      { name: 'Deed-covenant table', value: 'general/special warranty → six covenants (all-defects vs grantor-acts-only); CA grant deed (§1113) → two implied covenants; NY bargain-and-sale with covenant (RPL §258) → one covenant; bargain-and-sale and quitclaim → none', kind: 'table_data', citation: 'Common-law deed covenants; Cal. Civ. Code § 1113; N.Y. Real Prop. Law § 258', pin: 'present covenants (seisin, right-to-convey, against-encumbrances) + future covenants (quiet enjoyment, warranty, further assurances); anchor-state grant deed / §258 covenant sets' },
      { name: 'TX seisin narrowing', value: 'seisin narrowed to "grantor has not previously conveyed"', kind: 'table_data', citation: 'Tex. Prop. Code § 5.023', pin: '§ 5.023' },
      { name: 'Signatory matrix', value: 'tenancy-by-entirety and community property → both spouses; tenancy-in-common/joint tenancy → all cotenants for the whole; entity → per organizational documents', kind: 'table_data', citation: 'Common-law concurrent-ownership rules; e.g., Cal. Fam. Code § 1102, Tex. Fam. Code § 5.001', pin: 'both-spouses rule for entireties' },
    ],
    inputs: {
      deed_type: { type: 'enum', enum: 'deed_type', desc: 'The deed instrument type being conveyed, including the CA grant deed (§1113) and NY §258 bargain-and-sale-with-covenant.' },
      vesting_form: { type: 'enum', enum: 'vesting_form', desc: 'How record title is held.' },
      state: { type: 'string (US state code)', desc: 'Optional situs state; enables the Texas seisin-narrowing note and the tenancy-by-entirety validity guard.' },
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
      vesting_state_validity_gap: { type: 'boolean', desc: 'True when the vesting form is tenancy by the entirety in a community-property state that does not recognize it — an impossible pairing that routes to counsel.' },
      required_signatories: { type: 'string', desc: 'Who must sign for a conveyance of the whole.' },
      signatory_gap: { type: 'boolean', desc: 'Whether a required signatory is missing.' },
      defer_to_counsel: { type: 'boolean', desc: 'True on a signatory gap or an impossible vesting/state pairing; the question routes to counsel.' },
      counsel_handoff: { type: 'string | null', desc: 'The routing sentence when a signatory gap defers, else null.' },
      red_flags: { type: 'string[]', desc: 'Warranty-gap and signatory-gap warnings.' },
    },
    boundary:
      'This model maps a deed type to its covenant set and a vesting form to the parties whose signatures a conveyance of the whole requires. Whether a specific person must join a specific deed — homestead, marital, or entity-authority questions — and whether a covenant has been breached are legal determinations for real-estate counsel; on a signatory gap the model routes them and does not resolve them.',
    golden: {
      narrative: 'A New York property held by a married couple as tenants by the entirety — a valid entireties state — is conveyed by a bargain-and-sale deed with covenant against grantor\'s acts (the dominant NY commercial instrument, one covenant under RPL §258), but only one spouse is on the signature page, and in an entireties state a one-spouse signature conveys nothing.',
      input: { deed_type: 'bargain_and_sale_with_covenant', vesting_form: 'tenancy_by_entirety', state: 'NY', buyer_expects_warranty: true, all_required_signers_present: false },
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
      '4. Else if the regime is equitable conversion, `risk_on` SHALL be `buyer` with basis `equitable_conversion_default` (for a tabled state) or `equitable_conversion_common_law_baseline_unverified` (for an untabled state).',
      '5. Else (a seller-protective statutory regime), `risk_on` SHALL be `buyer` if legal title or possession has passed, otherwise `seller`, with basis equal to the regime name.',
      '6. **Untabled state (never guess):** if the contract is silent AND the state is not in the anchor-state table, the implementation SHALL set `state_table_gap: true`, `defer_to_counsel: true`, and emit a `counsel_handoff` and a red flag. The equitable-conversion baseline is the common-law DEFAULT only — roughly twenty UVPRA states and the Massachusetts rule place pre-closing casualty risk on the SELLER — so the allocation for an untabled state routes to counsel rather than being asserted. For a tabled state, `defer_to_counsel` SHALL be false.',
      '7. If the contract is silent and a casualty or condemnation is pending, it SHALL raise a red flag to allocate expressly before signing.',
    ],
    constants: [
      { name: 'NY risk-of-loss regime', value: 'seller bears risk until title/possession (NY Risk Act)', kind: 'table_data', citation: 'N.Y. Gen. Oblig. Law § 5-1311', pin: '§ 5-1311' },
      { name: 'CA risk-of-loss regime', value: 'seller bears risk until title/possession (UVPRA)', kind: 'table_data', citation: 'Cal. Civ. Code § 1662', pin: '§ 1662 (UVPRA)' },
      { name: 'TX risk-of-loss regime', value: 'seller bears risk until title/possession (UVPRA)', kind: 'table_data', citation: 'Tex. Prop. Code § 5.007', pin: '§ 5.007 (UVPRA)' },
      { name: 'Default risk-of-loss regime', value: 'buyer bears risk at signing (equitable conversion) — the common-law baseline, displaced by UVPRA (~20 states) and the Massachusetts rule', kind: 'table_data', citation: 'Equitable conversion (common-law baseline)', pin: 'common-law baseline (not a nationwide majority — verify the situs state)' },
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
      basis: { type: 'string', desc: 'The basis for the allocation: contract_override, equitable_conversion_default, a statutory regime name, or equitable_conversion_common_law_baseline_unverified for an untabled state.' },
      state_table_gap: { type: 'boolean', desc: 'True when the contract is silent and the state is not in the anchor-state risk-of-loss table — the baseline is unverified and the allocation routes to counsel.' },
      defer_to_counsel: { type: 'boolean', desc: 'True on an untabled-state gap (the allocation routes to counsel); false for a tabled state, where the model computes the allocation deterministically.' },
      counsel_handoff: { type: 'string | null', desc: 'The routing sentence when an untabled-state gap defers, else null.' },
      red_flags: { type: 'string[]', desc: 'Untabled-state and silent-contract-with-pending-casualty warnings.' },
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
      { name: 'UCC § 9-334(d) 20-day window', value: '20 days after affixation', kind: 'statutory_must', citation: 'U.C.C. § 9-334(d)', pin: '§ 9-334(d)', effective: 'U.C.C. Article 9 (2010 revision), current', nextCheck: 'on uniform-act amendment', traceValues: [20] },
      { name: 'UCC § 9-334(h) construction-mortgage override', value: 'construction mortgage primes a fixture interest arising during construction', kind: 'statutory_must', citation: 'U.C.C. § 9-334(h)', pin: '§ 9-334(h)', effective: 'U.C.C. Article 9 (2010 revision), current', nextCheck: 'on uniform-act amendment' },
      { name: 'UCC § 9-334(c) default', value: 'the conflicting real-property interest prevails absent a qualifying exception', kind: 'statutory_must', citation: 'U.C.C. § 9-334(c)', pin: '§ 9-334(c)', effective: 'U.C.C. Article 9 (2010 revision), current', nextCheck: 'on uniform-act amendment' },
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

  /* ══ TAX FAMILY — sensitive batch (AWAITING FOUNDER REVIEW) ═══════════ */

  /* ══ M139 — §1060 seven-class allocation ═════════════════════════════ */
  M139: {
    founderReview: true,
    purpose:
      'Computes the residual-method allocation of an asset-deal purchase price across the seven asset classes of §1060, cascading each dollar down the class ordering and dropping the residual into Class VII goodwill. It answers, for a buyer and seller papering an asset purchase, "how does this price split across the classes that drive the buyer\'s depreciation and amortization and the parties\' consistent Form 8594?" It allocates from supplied fair market values only; the values themselves and their class assignments are the advisors\' calls.',
    algorithm: [
      'Given `purchase_price_cents` and `asset_classes` (a list of `{ class_number, class_name, fair_market_value_cents }`):',
      '1. If either is missing or `asset_classes` is empty, the implementation SHALL return `status: "needs_inputs"` naming the missing fields.',
      '2. It SHALL sort the asset classes by class number ascending (Class I → Class VII), per the residual-method ordering (constants: §1060 seven-class ordering).',
      '3. It SHALL initialize a running remainder equal to `purchase_price_cents` and, for each class in order, allocate: for Classes I–VI, the lesser of the remainder and that class\'s fair market value (capped at FMV); for Class VII, the entire remaining amount (the residual). It SHALL subtract each allocation from the remainder.',
      '4. `allocated_cents` SHALL be the sum of all class allocations; `unallocated_cents` SHALL be the non-negative remainder (nonzero only when supplied FMVs exceed the price).',
      '5. It SHALL report the Class V (tangible), Class VI (§197 intangibles), and Class VII (goodwill and going concern) subtotals and the full per-class allocation schedule.',
    ],
    constants: [
      { name: '§1060 seven-class ordering', value: 'Classes I (cash) → II (marketable securities) → III (A/R and mark-to-market) → IV (inventory) → V (other tangible/§1231) → VI (§197 intangibles ex-goodwill) → VII (goodwill and going-concern value)', kind: 'table_data', citation: 'Treas. Reg. § 1.1060-1(c); § 1.338-6(b)', pin: '§ 1.338-6(b)(2) (seven-class residual method)', effective: 'current (Treas. Reg. as amended)', nextCheck: 'on Treasury amendment' },
    ],
    precisionRule: 'All allocations are exact integer cents (see the Conventions chapter); no rounding.',
    inputs: {
      purchase_price_cents: { type: 'integer (cents)', desc: 'Total consideration to be allocated across the asset classes.', unit: 'cents' },
      asset_classes: { type: 'object[]', desc: 'The asset classes with fair market values; each object carries `class_number` (1–7), `class_name` (string), and `fair_market_value_cents` (integer cents).' },
    },
    outputs: {
      purchase_price_cents: { type: 'integer (cents)', desc: 'The price allocated, echoed.', unit: 'cents' },
      allocated_cents: { type: 'integer (cents)', desc: 'Total amount allocated across the classes.', unit: 'cents' },
      unallocated_cents: { type: 'integer (cents)', desc: 'Non-negative residual when supplied fair market values exceed the price (normally zero).', unit: 'cents' },
      class_v_tangible_cents: { type: 'integer (cents)', desc: 'Amount allocated to Class V tangible/§1231 assets.', unit: 'cents' },
      class_vi_section_197_intangibles_cents: { type: 'integer (cents)', desc: 'Amount allocated to Class VI §197 intangibles (excluding goodwill).', unit: 'cents' },
      class_vii_goodwill_cents: { type: 'integer (cents)', desc: 'Residual allocated to Class VII goodwill and going-concern value.', unit: 'cents' },
      allocations: { type: 'object[]', desc: 'Per-class schedule: `{ class_number, class_name, fair_market_value_cents, allocated_cents, capped_at_fmv }`.' },
    },
    derivedOutputs: ['purchase_price_cents', 'allocated_cents', 'unallocated_cents', 'class_v_tangible_cents', 'class_vi_section_197_intangibles_cents', 'class_vii_goodwill_cents', 'allocations'],
    boundary:
      'This model computes the residual-method allocation of purchase price across the seven asset classes from supplied fair market values. Whether a given asset belongs in a given class, whether the supplied fair market values are supportable, and the binding Form 8594 positions the parties will file are determinations for the parties\' tax advisors; the model computes the allocation the supplied values imply and renders no valuation or classification opinion.',
    golden: {
      narrative: 'A $10M asset purchase carries $500k of cash, $2M of equipment, and $1.5M of identified customer relationships; the residual method drops the remaining $6M into Class VII goodwill.',
      input: { purchase_price_cents: 1_000_000_000, asset_classes: [ { class_number: 1, class_name: 'Cash', fair_market_value_cents: 50_000_000 }, { class_number: 5, class_name: 'Equipment', fair_market_value_cents: 200_000_000 }, { class_number: 6, class_name: 'Customer relationships (§197)', fair_market_value_cents: 150_000_000 }, { class_number: 7, class_name: 'Goodwill', fair_market_value_cents: 0 } ] },
    },
  },

  /* ══ M185 — §280G golden parachute ═══════════════════════════════════ */
  M185: {
    founderReview: true,
    purpose:
      'Computes the §280G golden-parachute analysis for a change-in-control payment: the three-times-base-amount threshold, whether it is crossed, the excess parachute payment, the 20% §4999 excise tax, the employer\'s lost deduction, and whether a shareholder cleansing vote clears the disinterested-holder bar. It answers, for a deal team sizing executive change-in-control cost, "does this package trip §280G, and what does it cost if it does?" It computes the arithmetic from supplied figures; the parachute-payment characterization and the vote mechanics are counsel\'s.',
    algorithm: [
      'Given `base_amount_cents`, `parachute_payments_cents`, and optional `shareholder_cleansing_vote_pct`:',
      '1. If either required cents input is missing, the implementation SHALL return `status: "needs_inputs"`.',
      '2. `three_times_base_threshold_cents` SHALL be `base_amount_cents × 3` (constants: §280G three-times-base multiple).',
      '3. `section_280g_triggered` SHALL be true iff `parachute_payments_cents ≥ three_times_base_threshold_cents`.',
      '4. `excess_parachute_payment_cents` SHALL be `max(0, parachute_payments_cents − base_amount_cents)` when triggered, else 0 (the excess is measured against one times base, not three).',
      '5. `excise_tax_20pct_cents` SHALL be the excess times the §4999 excise rate, rounded to the nearest cent (constants: §4999 excise-tax rate); `lost_employer_deduction_cents` SHALL equal the excess (§280G disallows the employer deduction for the excess).',
      '6. When a cleansing-vote percentage is supplied, `cleansing_vote_passed` SHALL be true iff it exceeds the disinterested-shareholder threshold (constants: §280G cleansing-vote threshold); when absent it SHALL be null.',
    ],
    constants: [
      { name: '§280G three-times-base multiple', value: '3×', kind: 'statutory_must', citation: 'IRC § 280G(b)(2)(A)(ii)', pin: '§ 280G(b)(2)(A)(ii)', effective: 'current (IRC as amended)', nextCheck: 'on IRC amendment', traceValues: [3] },
      { name: '§4999 excise-tax rate', value: '20%', kind: 'statutory_must', citation: 'IRC § 4999(a)', pin: '§ 4999(a)', effective: 'current (IRC as amended)', nextCheck: 'on IRC amendment', traceValues: [0.2] },
      { name: '§280G cleansing-vote threshold', value: 'more than 75% of disinterested shareholders', kind: 'statutory_must', citation: 'IRC § 280G(b)(5); Treas. Reg. § 1.280G-1', pin: 'Q&A-7 (more-than-75% disinterested approval)', effective: 'current (Treas. Reg. as amended)', nextCheck: 'on Treasury amendment', traceValues: [0.75] },
    ],
    precisionRule: 'Monetary values are exact integer cents (see the Conventions chapter); the excise tax is the excess times 20% rounded to the nearest cent; vote percentages are fractions on a 0–1 scale.',
    inputs: {
      base_amount_cents: { type: 'integer (cents)', desc: 'The executive\'s §280G base amount (five-year average W-2 compensation).', unit: 'cents' },
      parachute_payments_cents: { type: 'integer (cents)', desc: 'Aggregate contingent-on-change-in-control payments to the executive.', unit: 'cents' },
      shareholder_cleansing_vote_pct: { type: 'number', desc: 'Fraction of disinterested shareholders approving the payments (0–1); optional.', precision: 4 },
    },
    outputs: {
      base_amount_cents: { type: 'integer (cents)', desc: 'The base amount, echoed.', unit: 'cents' },
      parachute_payments_cents: { type: 'integer (cents)', desc: 'The parachute payments, echoed.', unit: 'cents' },
      three_times_base_threshold_cents: { type: 'integer (cents)', desc: 'The three-times-base-amount safe-harbor threshold.', unit: 'cents' },
      section_280g_triggered: { type: 'boolean', desc: 'Whether the payments meet or exceed three times the base amount.' },
      excess_parachute_payment_cents: { type: 'integer (cents)', desc: 'The excess parachute payment (payments over one times base) when triggered, else 0.', unit: 'cents' },
      excise_tax_20pct_cents: { type: 'integer (cents)', desc: 'The §4999 excise tax on the excess (20%).', unit: 'cents' },
      lost_employer_deduction_cents: { type: 'integer (cents)', desc: 'The employer deduction disallowed under §280G (equal to the excess).', unit: 'cents' },
      shareholder_cleansing_vote_pct: { type: 'number | null', desc: 'The supplied cleansing-vote fraction, echoed, or null.', precision: 4 },
      cleansing_vote_threshold_pct: { type: 'number', desc: 'The disinterested-shareholder approval threshold (0.75).', precision: 4 },
      cleansing_vote_passed: { type: 'boolean | null', desc: 'Whether the supplied vote exceeds the threshold, or null when no vote is supplied.' },
    },
    derivedOutputs: ['base_amount_cents', 'parachute_payments_cents', 'three_times_base_threshold_cents', 'excess_parachute_payment_cents', 'excise_tax_20pct_cents', 'lost_employer_deduction_cents', 'shareholder_cleansing_vote_pct'],
    boundary:
      'This model computes the §280G three-times-base threshold, the excess parachute payment, the §4999 excise tax, and the lost employer deduction from supplied figures, and screens the cleansing-vote percentage. Whether a payment is a parachute payment, the reasonable-compensation offset that can reduce the excess, and the availability and mechanics of the shareholder cleansing vote are determinations for tax counsel; the model computes the arithmetic and renders no §280G opinion.',
    golden: {
      narrative: 'An executive with an $800k base amount is set to receive $3.0M on the sale; the package clears three times base, creating a $2.2M excess parachute payment and a $440k excise tax.',
      input: { base_amount_cents: 80_000_000, parachute_payments_cents: 300_000_000, shareholder_cleansing_vote_pct: 0.9 },
    },
  },

  /* ══ M186 — §382 NOL limitation ══════════════════════════════════════ */
  M186: {
    founderReview: true,
    purpose:
      'Computes the annual §382 limitation on a loss corporation\'s pre-change net operating losses — the loss-corporation equity value times the IRS long-term tax-exempt rate — and, given an NOL balance, the approximate number of years to absorb it. It answers, for a buyer valuing a target\'s carryforwards, "after the ownership change, how much of the NOL can be used each year?" It computes the base limitation from supplied figures; whether an ownership change occurred and the value and adjustments that feed the limitation are counsel\'s.',
    algorithm: [
      'Given `loss_corporation_value_cents` and `long_term_tax_exempt_rate`, and optional `nol_carryforward_cents`:',
      '1. If either required input is missing, the implementation SHALL return `status: "needs_inputs"`.',
      '2. `annual_section_382_limitation_cents` SHALL be `loss_corporation_value_cents × long_term_tax_exempt_rate`, rounded to the nearest cent (the §382(b)(1) base limitation).',
      '3. `long_term_tax_exempt_rate` SHALL be echoed rounded to four decimals (see the Conventions chapter); the rate is a supplied pass-through value (the IRS publishes it monthly).',
      '4. When `nol_carryforward_cents` is supplied and the annual limitation is positive, `estimated_years_to_use_nol` SHALL be the NOL balance divided by the annual limitation, rounded up to the next whole year; otherwise null.',
      '5. The model computes the base limitation only; it SHALL NOT determine whether a §382 ownership change occurred, nor apply built-in gain/loss (§382(h)) or continuity-of-business adjustments.',
    ],
    constants: [
      { name: 'IRS long-term tax-exempt rate', value: 'supplied at runtime (IRS publishes monthly under §382(f))', kind: 'pass_through', citation: 'IRC § 382(f); IRS monthly §382 rate release', pin: '§ 382(f)', effective: 'monthly', nextCheck: 'monthly (per IRS release)' },
    ],
    precisionRule: 'The limitation is exact integer cents; the long-term tax-exempt rate echoes at four decimals; years-to-absorb is a whole-year ceiling (see the Conventions chapter).',
    inputs: {
      loss_corporation_value_cents: { type: 'integer (cents)', desc: 'The equity value of the loss corporation immediately before the ownership change (§382(e)).', unit: 'cents' },
      long_term_tax_exempt_rate: { type: 'number', desc: 'The IRS long-term tax-exempt rate for the change month (a fraction, e.g. 0.0435); supplied at runtime.', precision: 4 },
      nol_carryforward_cents: { type: 'integer (cents)', desc: 'The pre-change NOL carryforward balance; optional, drives the years-to-absorb estimate.', unit: 'cents' },
    },
    outputs: {
      loss_corporation_value_cents: { type: 'integer (cents)', desc: 'The loss-corporation value, echoed.', unit: 'cents' },
      long_term_tax_exempt_rate: { type: 'number', desc: 'The long-term tax-exempt rate used, at four decimals.', precision: 4 },
      annual_section_382_limitation_cents: { type: 'integer (cents)', desc: 'The annual §382 limitation on pre-change NOL use.', unit: 'cents' },
      nol_carryforward_cents: { type: 'integer (cents) | null', desc: 'The NOL balance, echoed, or null when not supplied.', unit: 'cents' },
      estimated_years_to_use_nol: { type: 'integer | null', desc: 'Whole-year ceiling to absorb the NOL at the annual limitation, or null.', unit: 'years' },
    },
    derivedOutputs: ['loss_corporation_value_cents', 'long_term_tax_exempt_rate', 'annual_section_382_limitation_cents', 'nol_carryforward_cents', 'estimated_years_to_use_nol'],
    boundary:
      'This model computes the annual §382 limitation as the loss-corporation value times the supplied long-term tax-exempt rate. Whether an ownership change has in fact occurred under §382(g), the correct loss-corporation value, the §382(h) built-in gain/loss adjustments, and the continuity-of-business-enterprise requirement are determinations for tax counsel; the model computes the base limitation and renders no §382 opinion.',
    golden: {
      narrative: 'A target worth $50M undergoes an ownership change when the long-term tax-exempt rate is 4.35%; roughly $2.175M of the pre-change NOL becomes usable each year, absorbing a $10M carryforward over five years.',
      input: { loss_corporation_value_cents: 5_000_000_000, long_term_tax_exempt_rate: 0.0435, nol_carryforward_cents: 1_000_000_000 },
    },
  },

  /* ══ LEGAL FAMILY — agreement economics (M206–M213) ══════════════════ */

  /* ══ M206 — Indemnification ladder engine ════════════════════════════ */
  M206: {
    purpose:
      'Sizes the indemnification ladder of a private acquisition agreement — the general cap, the basket, and the fundamental-representation cap — from the transaction value and either supplied percentages or cited-median market defaults. It answers, for a buyer or seller negotiating recourse, "how large is the indemnity backstop, and where does the basket sit?" It computes the magnitudes and surfaces the standard toggles (materiality scrape, sandbagging); the terms themselves are the parties\' negotiation.',
    algorithm: [
      'Given `transaction_value_cents` and optional `rwi_present` (default false), `general_cap_pct`, `basket_pct`, `basket_type`:',
      '1. If `transaction_value_cents` is missing, the implementation SHALL return `status: "needs_inputs"`.',
      '2. `general_cap_pct` SHALL be the supplied value, else the cited-median default for the RWI posture — the RWI-present cap or the no-RWI cap (constants: general indemnity cap medians).',
      '3. `basket_pct` SHALL be the supplied value, else the cited-median basket default (constants: indemnity basket median).',
      '4. `general_cap_cents` and `basket_cents` SHALL be the transaction value times the respective percentage, rounded to the nearest cent.',
      '5. `fundamental_reps_cap_cents` SHALL be the full transaction value; the fraud/tax carve-out SHALL be reported as uncapped or counsel-defined.',
      '6. The model SHALL report the default posture of the materiality scrape and sandbagging toggles as market-standard flags, not determinations.',
    ],
    constants: [
      { name: 'General indemnity cap — no RWI', value: '10.5% of transaction value', kind: 'cited_median_should', citation: 'ABA Private Target Deal Points Study 2023', pin: 'median general indemnity cap, private targets without RWI', effective: '2023 study', nextCheck: 'on next ABA study (biennial)', traceValues: [0.105] },
      { name: 'General indemnity cap — RWI present', value: '0.5% of transaction value', kind: 'cited_median_should', citation: 'ABA Private Target Deal Points Study 2023', pin: 'median general indemnity cap, RWI-backed deals', effective: '2023 study', nextCheck: 'on next ABA study (biennial)', traceValues: [0.005] },
      { name: 'Indemnity basket', value: '0.5% of transaction value', kind: 'cited_median_should', citation: 'ABA Private Target Deal Points Study 2023', pin: 'median basket/deductible threshold', effective: '2023 study', nextCheck: 'on next ABA study (biennial)', traceValues: [0.005] },
    ],
    precisionRule: 'Percentages are 4-decimal fractions; cap and basket amounts are exact integer cents (see the Conventions chapter).',
    inputs: {
      transaction_value_cents: { type: 'integer (cents)', desc: 'Total transaction value the ladder is sized against.', unit: 'cents' },
      rwi_present: { type: 'boolean', desc: 'Whether representation-and-warranty insurance backs the deal (default false); shifts the cited-median cap default.' },
      general_cap_pct: { type: 'number', desc: 'Override for the general indemnity cap as a fraction of value; defaults to the cited median.', precision: 4 },
      basket_pct: { type: 'number', desc: 'Override for the basket as a fraction of value; defaults to the cited median.', precision: 4 },
      basket_type: { type: 'enum', enum: 'basket_type', desc: 'Override for how the basket operates; defaults by RWI posture.' },
    },
    outputs: {
      transaction_value_cents: { type: 'integer (cents)', desc: 'The transaction value, echoed.', unit: 'cents' },
      rwi_present: { type: 'boolean', desc: 'The RWI posture used.' },
      general_cap_pct: { type: 'number', desc: 'The general indemnity cap as a fraction of value.', precision: 4 },
      general_cap_cents: { type: 'integer (cents)', desc: 'The general indemnity cap in cents.', unit: 'cents' },
      basket_pct: { type: 'number', desc: 'The basket as a fraction of value.', precision: 4 },
      basket_cents: { type: 'integer (cents)', desc: 'The basket threshold in cents.', unit: 'cents' },
      basket_type: { type: 'enum', enum: 'basket_type', desc: 'How the basket operates.' },
      fundamental_reps_cap_cents: { type: 'integer (cents)', desc: 'The cap on fundamental-representation claims (the full transaction value).', unit: 'cents' },
      fraud_tax_carveout: { type: 'string', desc: 'The fraud and tax carve-out posture — uncapped or counsel-defined.' },
      materiality_scrape_default: { type: 'boolean', desc: 'Whether a materiality scrape is the market-standard default here.' },
      sandbagging_default: { type: 'string', desc: 'The default sandbagging posture — silent or governed by state default.' },
    },
    derivedOutputs: ['transaction_value_cents', 'general_cap_cents', 'basket_cents', 'fundamental_reps_cap_cents'],
    boundary:
      'This model sizes the indemnification ladder — cap, basket, fundamental-rep cap — from the transaction value and either supplied or cited-median default percentages. The default percentages are market medians (SHOULD), not law; whether a given cap, basket type (deductible vs. tipping), materiality scrape, or sandbagging posture is right for this deal is a negotiation and drafting judgment for deal counsel, which the model does not make.',
    golden: {
      narrative: 'An $80M private deal without RWI carries a 10.5%-of-value indemnity cap ($8.4M) over a 0.5% basket ($400k), with fundamental representations capped at the full price.',
      input: { transaction_value_cents: 8_000_000_000, rwi_present: false },
    },
  },

  /* ══ M207 — Survival period engine ═══════════════════════════════════ */
  M207: {
    purpose:
      'Builds the survival schedule of a purchase agreement — when the general, fundamental, and tax representations expire — from the closing date and either supplied periods or cited-median defaults, and dates each expiry. It answers, for the parties papering recourse, "how long is each class of representation on the hook?" It schedules the dates and flags the governing-law and fraud interactions for counsel.',
    algorithm: [
      'Given `closing_date` and optional `rwi_present` (default false), `general_reps_months`, `fundamental_reps_years`, `tax_reps_years`, `fraud_carveout`:',
      '1. If `closing_date` is missing or not a valid ISO date, the implementation SHALL return `status: "needs_inputs"`.',
      '2. `general_reps_months` SHALL be the supplied value, else the cited-median default — zero when RWI is present, otherwise the no-RWI general survival period (constants: general survival medians).',
      '3. `fundamental_reps_years` and `tax_reps_years` SHALL be the supplied values, else the cited-median fundamental and tax survival periods (constants: fundamental/tax survival medians).',
      '4. Each expiry SHALL be the closing date advanced by the corresponding period (general in months; fundamental and tax in years × 12 months); a zero general period yields a null expiry.',
      '5. It SHALL carry a counsel-review flag to confirm the governing-law statute of limitations, the fraud definition, and the RWI-policy interaction.',
    ],
    constants: [
      { name: 'General survival — no RWI', value: '12 months', kind: 'cited_median_should', citation: 'SRS Acquiom Deal Terms Study 2024; 2025', pin: 'median general representation survival, non-RWI deals', effective: '2024–2025 studies', nextCheck: 'on next SRS Acquiom study (annual)', traceValues: [12] },
      { name: 'General survival — RWI present', value: '0 months (reps do not survive to the seller)', kind: 'cited_median_should', citation: 'SRS Acquiom Deal Terms Study 2024; 2025', pin: 'median general survival, RWI-backed deals', effective: '2024–2025 studies', nextCheck: 'on next SRS Acquiom study (annual)', traceValues: [0] },
      { name: 'Fundamental representation survival', value: '6 years', kind: 'cited_median_should', citation: 'ABA Private Target Deal Points Study 2023', pin: 'median fundamental-rep survival', effective: '2023 study', nextCheck: 'on next ABA study (biennial)', traceValues: [6] },
      { name: 'Tax representation survival', value: '6 years', kind: 'cited_median_should', citation: 'ABA Private Target Deal Points Study 2023', pin: 'median tax-rep survival (statute-of-limitations linked)', effective: '2023 study', nextCheck: 'on next ABA study (biennial)', traceValues: [6] },
    ],
    precisionRule: 'Periods are whole months or years; expiries are ISO-8601 dates (see the Conventions chapter).',
    inputs: {
      closing_date: { type: 'string (ISO date)', desc: 'The closing date from which survival periods run.' },
      rwi_present: { type: 'boolean', desc: 'Whether RWI backs the deal (default false); zeroes the general survival default.' },
      general_reps_months: { type: 'integer', desc: 'Override for general-representation survival in months; defaults to the cited median.', unit: 'months' },
      fundamental_reps_years: { type: 'integer', desc: 'Override for fundamental-representation survival in years; defaults to the cited median.', unit: 'years' },
      tax_reps_years: { type: 'integer', desc: 'Override for tax-representation survival in years; defaults to the cited median.', unit: 'years' },
      fraud_carveout: { type: 'boolean', desc: 'Whether fraud is carved out of the exclusive-remedy provision (default true).' },
    },
    outputs: {
      closing_date: { type: 'string (ISO date)', desc: 'The closing date, echoed.' },
      rwi_present: { type: 'boolean', desc: 'The RWI posture used.' },
      general_reps_months: { type: 'integer', desc: 'General-representation survival in months.', unit: 'months' },
      general_reps_expiry: { type: 'string (ISO date) | null', desc: 'General-representation expiry date, or null when the period is zero.' },
      fundamental_reps_years: { type: 'integer', desc: 'Fundamental-representation survival in years.', unit: 'years' },
      fundamental_reps_expiry: { type: 'string (ISO date)', desc: 'Fundamental-representation expiry date.' },
      tax_reps_years: { type: 'integer', desc: 'Tax-representation survival in years.', unit: 'years' },
      tax_reps_expiry: { type: 'string (ISO date)', desc: 'Tax-representation expiry date.' },
      fraud_carveout_from_exclusive_remedy: { type: 'boolean', desc: 'Whether fraud is carved out of the exclusive remedy.' },
      counsel_review_flags: { type: 'string[]', desc: 'Items counsel must confirm (limitations period, fraud definition, RWI interaction).' },
    },
    derivedOutputs: ['general_reps_months', 'fundamental_reps_years', 'tax_reps_years'],
    boundary:
      'This model builds the survival schedule — general, fundamental, tax — from the closing date and cited-median or supplied periods. The governing-law statute of limitations, the fraud definition, and the exclusive-remedy/RWI interaction are legal determinations for counsel; the model schedules the dates and flags the review, and renders no enforceability conclusion.',
    golden: {
      narrative: 'A deal closing March 31, 2026 without RWI runs general representations 12 months (to March 31, 2027) and fundamental and tax representations six years (to March 31, 2032).',
      input: { closing_date: '2026-03-31', rwi_present: false },
    },
  },

  /* ══ M208 — Escrow and holdback sizing ═══════════════════════════════ */
  M208: {
    purpose:
      'Sizes the escrows a purchase agreement holds back — the general indemnity escrow, the purchase-price-adjustment escrow, and any special escrows — from the transaction value and either supplied percentages or cited-median defaults, and totals them. It answers, for the parties funding the closing, "how much cash is held back, and in which buckets?" The default percentages are market medians; the protective amount is a negotiation.',
    algorithm: [
      'Given `transaction_value_cents` and optional `rwi_present` (default false), `general_escrow_pct`, `ppa_escrow_pct`, `special_escrows_cents`:',
      '1. If `transaction_value_cents` is missing, the implementation SHALL return `status: "needs_inputs"`.',
      '2. `general_escrow_pct` SHALL be the supplied value, else the cited-median default for the RWI posture (constants: general escrow medians).',
      '3. `ppa_escrow_pct` SHALL be the supplied value, else the cited-median PPA escrow default (constants: PPA escrow median).',
      '4. `general_escrow_cents` and `ppa_escrow_cents` SHALL be the transaction value times the respective percentage, rounded to the nearest cent; `special_escrow_cents` SHALL be the sum of any supplied special-escrow amounts.',
      '5. `aggregate_escrow_cents` SHALL be the sum of the three.',
    ],
    constants: [
      { name: 'General escrow — no RWI', value: '10% of transaction value', kind: 'cited_median_should', citation: 'SRS Acquiom Deal Terms Study 2024; 2025', pin: 'median general indemnity escrow, non-RWI', effective: '2024–2025 studies', nextCheck: 'on next SRS Acquiom study (annual)', traceValues: [0.1] },
      { name: 'General escrow — RWI present', value: '0.5% of transaction value', kind: 'cited_median_should', citation: 'SRS Acquiom Deal Terms Study 2024; 2025', pin: 'median general escrow, RWI-backed', effective: '2024–2025 studies', nextCheck: 'on next SRS Acquiom study (annual)', traceValues: [0.005] },
      { name: 'Purchase-price-adjustment escrow', value: '1% of transaction value', kind: 'cited_median_should', citation: 'SRS Acquiom Deal Terms Study 2024; 2025', pin: 'median working-capital/PPA escrow', effective: '2024–2025 studies', nextCheck: 'on next SRS Acquiom study (annual)', traceValues: [0.01] },
    ],
    precisionRule: 'Percentages are 4-decimal fractions; escrow amounts are exact integer cents (see the Conventions chapter).',
    inputs: {
      transaction_value_cents: { type: 'integer (cents)', desc: 'Total transaction value the escrows are sized against.', unit: 'cents' },
      rwi_present: { type: 'boolean', desc: 'Whether RWI backs the deal (default false); shifts the general escrow default.' },
      general_escrow_pct: { type: 'number', desc: 'Override for the general escrow as a fraction of value; defaults to the cited median.', precision: 4 },
      ppa_escrow_pct: { type: 'number', desc: 'Override for the PPA escrow as a fraction of value; defaults to the cited median.', precision: 4 },
      special_escrows_cents: { type: 'integer (cents)[]', desc: 'Any special-purpose escrow amounts (environmental, litigation, etc.) to add to the aggregate.', unit: 'cents' },
    },
    outputs: {
      transaction_value_cents: { type: 'integer (cents)', desc: 'The transaction value, echoed.', unit: 'cents' },
      rwi_present: { type: 'boolean', desc: 'The RWI posture used.' },
      general_escrow_pct: { type: 'number', desc: 'The general escrow as a fraction of value.', precision: 4 },
      general_escrow_cents: { type: 'integer (cents)', desc: 'The general indemnity escrow in cents.', unit: 'cents' },
      ppa_escrow_pct: { type: 'number', desc: 'The PPA escrow as a fraction of value.', precision: 4 },
      ppa_escrow_cents: { type: 'integer (cents)', desc: 'The purchase-price-adjustment escrow in cents.', unit: 'cents' },
      special_escrow_cents: { type: 'integer (cents)', desc: 'The sum of special-purpose escrows.', unit: 'cents' },
      aggregate_escrow_cents: { type: 'integer (cents)', desc: 'Total cash held back across all escrows.', unit: 'cents' },
    },
    derivedOutputs: ['transaction_value_cents', 'general_escrow_cents', 'ppa_escrow_cents', 'special_escrow_cents', 'aggregate_escrow_cents'],
    boundary:
      'This model sizes general, PPA, and special escrows from the transaction value and cited-median or supplied percentages. The default percentages are market medians (SHOULD); the escrow that actually protects this buyer, and the release mechanics, are negotiation and drafting judgments for counsel.',
    golden: {
      narrative: 'An $80M deal without RWI holds a 10% general escrow ($8M) plus a 1% PPA escrow ($800k), $8.8M held back in aggregate.',
      input: { transaction_value_cents: 8_000_000_000, rwi_present: false },
    },
  },

  /* ══ M209 — RWI stack architecture ═══════════════════════════════════ */
  M209: {
    purpose:
      'Lays out the representation-and-warranty-insurance stack — the retention, the primary policy tower, any excess layers, and the interaction with the seller indemnity cap — from the enterprise value and either supplied or cited-median terms. It answers, for a deal team pricing insured recourse, "how big is the tower, where does the retention sit, and how much seller indemnity remains behind it?" Binding terms belong to the broker and underwriter.',
    algorithm: [
      'Given `enterprise_value_cents` and optional `retention_pct`, `policy_tower_pct`, `seller_indemnity_cap_pct`, `exclusions`, `excess_layers`:',
      '1. If `enterprise_value_cents` is missing, the implementation SHALL return `status: "needs_inputs"`.',
      '2. `retention_cents` SHALL be the enterprise value times the retention percentage (supplied or cited median — constants: RWI retention median), rounded to the nearest cent.',
      '3. `primary_policy_limit_cents` SHALL be the enterprise value times the tower percentage (supplied or cited median — constants: RWI tower median).',
      '4. `excess_policy_limit_cents` SHALL be the sum of any supplied excess-layer limits; `excess_layer_count` SHALL be their number; `total_policy_limit_cents` SHALL be primary plus excess.',
      '5. `seller_indemnity_cap_cents` SHALL be the enterprise value times the seller-indemnity-cap percentage (supplied or cited median — constants: seller indemnity cap median).',
      '6. It SHALL count exclusions and set `broker_handoff_required` true — binding terms route to the broker and underwriter.',
    ],
    constants: [
      { name: 'RWI retention', value: '0.75% of enterprise value', kind: 'cited_median_should', citation: 'Marsh, Aon, Lockton RWI market reports 2023–2024', pin: 'median retention (dropping to ~0.5% at higher EV)', effective: '2023–2024 market reports', nextCheck: 'on next annual broker reports', traceValues: [0.0075] },
      { name: 'RWI primary tower', value: '10% of enterprise value', kind: 'cited_median_should', citation: 'ABA Private Target Deal Points Study 2023; Marsh/Aon/Lockton reports 2023–2024', pin: 'median primary policy limit', effective: '2023–2024', nextCheck: 'on next annual broker reports', traceValues: [0.1] },
      { name: 'Seller indemnity cap behind RWI', value: '0.5% of enterprise value', kind: 'cited_median_should', citation: 'ABA Private Target Deal Points Study 2023', pin: 'median seller indemnity cap, RWI deals', effective: '2023 study', nextCheck: 'on next ABA study (biennial)', traceValues: [0.005] },
    ],
    precisionRule: 'Percentages are 4-decimal fractions; retention and policy limits are exact integer cents (see the Conventions chapter).',
    inputs: {
      enterprise_value_cents: { type: 'integer (cents)', desc: 'Enterprise value the RWI stack is sized against.', unit: 'cents' },
      retention_pct: { type: 'number', desc: 'Override for the retention as a fraction of EV; defaults to the cited median.', precision: 4 },
      policy_tower_pct: { type: 'number', desc: 'Override for the primary tower as a fraction of EV; defaults to the cited median.', precision: 4 },
      seller_indemnity_cap_pct: { type: 'number', desc: 'Override for the seller indemnity cap as a fraction of EV; defaults to the cited median.', precision: 4 },
      exclusions: { type: 'string[]', desc: 'Named policy exclusions being tracked.' },
      excess_layers: { type: 'object[]', desc: 'Excess layers above the primary tower; each object carries `limit_cents` (integer cents).' },
    },
    outputs: {
      enterprise_value_cents: { type: 'integer (cents)', desc: 'The enterprise value, echoed.', unit: 'cents' },
      retention_pct: { type: 'number', desc: 'The retention as a fraction of EV.', precision: 4 },
      retention_cents: { type: 'integer (cents)', desc: 'The retention (deductible) in cents.', unit: 'cents' },
      primary_policy_limit_cents: { type: 'integer (cents)', desc: 'The primary RWI tower limit in cents.', unit: 'cents' },
      excess_layer_count: { type: 'integer', desc: 'Number of excess layers supplied.' },
      excess_policy_limit_cents: { type: 'integer (cents)', desc: 'Total excess-layer limit in cents.', unit: 'cents' },
      total_policy_limit_cents: { type: 'integer (cents)', desc: 'Primary plus excess policy limit.', unit: 'cents' },
      seller_indemnity_cap_pct: { type: 'number', desc: 'The seller indemnity cap as a fraction of EV.', precision: 4 },
      seller_indemnity_cap_cents: { type: 'integer (cents)', desc: 'The seller indemnity cap in cents.', unit: 'cents' },
      exclusion_count: { type: 'integer', desc: 'Number of tracked exclusions.' },
      broker_handoff_required: { type: 'boolean', desc: 'Always true — binding terms route to the broker/underwriter.' },
    },
    derivedOutputs: ['enterprise_value_cents', 'retention_cents', 'primary_policy_limit_cents', 'excess_layer_count', 'excess_policy_limit_cents', 'total_policy_limit_cents', 'seller_indemnity_cap_cents', 'exclusion_count'],
    boundary:
      'This model lays out the RWI stack — retention, primary tower, excess layers, seller-indemnity interaction — from cited-median or supplied terms. Binding pricing, the retention the underwriter will actually offer, the exclusions, and the policy wording are the broker\'s and underwriter\'s; the model produces the architecture and routes to them (broker_handoff_required), and quotes no policy.',
    golden: {
      narrative: 'A $150M insured deal sets a 0.75% retention ($1.125M) beneath a $15M primary RWI tower, with the seller indemnity capped at 0.5% ($750k) behind the policy.',
      input: { enterprise_value_cents: 15_000_000_000 },
    },
  },

  /* ══ M210 — Closing-statement true-up sequence ═══════════════════════ */
  M210: {
    purpose:
      'Computes the working-capital true-up that follows closing — the estimated and final purchase-price adjustments against the peg, which party owes the receivable — and dates the estimated-statement, dispute-notice, and negotiation deadlines. It answers, after closing, "how much does the price move on the true-up, who pays, and by when must each step happen?" It owns the true-up that M109 (the peg) deliberately does not.',
    algorithm: [
      'Given `closing_date`, `peg_cents`, `actual_nwc_cents`, and optional `estimated_nwc_cents`, `actual_statement_due_days`, `dispute_notice_days`, `good_faith_negotiation_days`:',
      '1. If `closing_date`, `peg_cents`, or `actual_nwc_cents` is missing, the implementation SHALL return `status: "needs_inputs"`.',
      '2. `final_purchase_price_adjustment_cents` SHALL be `actual_nwc_cents − peg_cents`; `estimated_adjustment_cents` SHALL be `estimated_nwc_cents − peg_cents` when an estimate is supplied, else null.',
      '3. `buyer_receivable_cents` SHALL be `max(0, −adjustment)` (working capital delivered below the peg); `seller_receivable_cents` SHALL be `max(0, adjustment)` (above the peg).',
      '4. `actual_statement_due_date` SHALL be the closing date advanced by the statement-due days (supplied or cited median — constants: true-up timeline medians).',
      '5. `dispute_notice_due_date` SHALL be the statement-due date advanced by the dispute-notice days; `good_faith_negotiation_end_date` SHALL be that date advanced by the negotiation days.',
    ],
    constants: [
      { name: 'Actual-statement due window', value: '90 days after closing', kind: 'cited_median_should', citation: 'SRS Acquiom Working Capital PPA Study 2024', pin: 'median days to deliver the closing statement', effective: '2024 study', nextCheck: 'on next SRS Acquiom study', traceValues: [90] },
      { name: 'Dispute-notice window', value: '30 days after the statement', kind: 'cited_median_should', citation: 'SRS Acquiom Working Capital PPA Study 2024', pin: 'median dispute-notice period', effective: '2024 study', nextCheck: 'on next SRS Acquiom study', traceValues: [30] },
      { name: 'Good-faith negotiation window', value: '30 days after the dispute notice', kind: 'cited_median_should', citation: 'SRS Acquiom Working Capital PPA Study 2024', pin: 'median good-faith negotiation period before arbitrator', effective: '2024 study', nextCheck: 'on next SRS Acquiom study', traceValues: [30] },
    ],
    precisionRule: 'Adjustments and receivables are exact integer cents; timeline outputs are ISO-8601 dates (see the Conventions chapter).',
    inputs: {
      closing_date: { type: 'string (ISO date)', desc: 'The closing date the timeline runs from.' },
      peg_cents: { type: 'integer (cents)', desc: 'The working-capital peg (see M109).', unit: 'cents' },
      actual_nwc_cents: { type: 'integer (cents)', desc: 'Actual net working capital per the final closing statement.', unit: 'cents' },
      estimated_nwc_cents: { type: 'integer (cents)', desc: 'Estimated net working capital per the estimated statement; optional.', unit: 'cents' },
      actual_statement_due_days: { type: 'integer', desc: 'Days after closing to deliver the actual statement; defaults to the cited median.', unit: 'days' },
      dispute_notice_days: { type: 'integer', desc: 'Days after the statement to notice a dispute; defaults to the cited median.', unit: 'days' },
      good_faith_negotiation_days: { type: 'integer', desc: 'Days of good-faith negotiation before the arbitrator; defaults to the cited median.', unit: 'days' },
    },
    outputs: {
      closing_date: { type: 'string (ISO date)', desc: 'The closing date, echoed.' },
      peg_cents: { type: 'integer (cents)', desc: 'The peg, echoed.', unit: 'cents' },
      estimated_nwc_cents: { type: 'integer (cents) | null', desc: 'The estimated NWC, echoed, or null.', unit: 'cents' },
      actual_nwc_cents: { type: 'integer (cents)', desc: 'The actual NWC, echoed.', unit: 'cents' },
      estimated_adjustment_cents: { type: 'integer (cents) | null', desc: 'Estimated adjustment against the peg, or null.', unit: 'cents' },
      final_purchase_price_adjustment_cents: { type: 'integer (cents)', desc: 'Final adjustment: actual NWC minus peg (positive = above peg).', unit: 'cents' },
      buyer_receivable_cents: { type: 'integer (cents)', desc: 'Amount owed to the buyer when NWC lands below the peg.', unit: 'cents' },
      seller_receivable_cents: { type: 'integer (cents)', desc: 'Amount owed to the seller when NWC lands above the peg.', unit: 'cents' },
      actual_statement_due_date: { type: 'string (ISO date)', desc: 'Deadline to deliver the actual closing statement.' },
      dispute_notice_due_date: { type: 'string (ISO date)', desc: 'Deadline to notice a dispute.' },
      good_faith_negotiation_end_date: { type: 'string (ISO date)', desc: 'End of the good-faith negotiation window before the accounting arbitrator.' },
    },
    derivedOutputs: ['peg_cents', 'estimated_nwc_cents', 'actual_nwc_cents', 'estimated_adjustment_cents', 'final_purchase_price_adjustment_cents', 'buyer_receivable_cents', 'seller_receivable_cents'],
    boundary:
      'This model computes the working-capital true-up — estimated vs. actual adjustment and the buyer/seller receivable — and the dispute-timeline dates from the peg and cited-median or supplied day counts. Whether the actual statement is correct, and the accounting judgments inside it, are for the parties\' accountants and the neutral accounting arbitrator; the model computes the arithmetic and the schedule.',
    golden: {
      narrative: 'Actual working capital of $4.6M lands $400k below the $5.0M peg, creating a $400k buyer receivable, with the dispute clock running from a closing-plus-90-day statement.',
      input: { closing_date: '2026-03-31', peg_cents: 500_000_000, actual_nwc_cents: 460_000_000, estimated_nwc_cents: 480_000_000 },
    },
  },

  /* ══ M211 — Conditions-to-close logic engine ═════════════════════════ */
  M211: {
    purpose:
      'Tallies the conditions to closing — which are satisfied, which are waived, which still block — and flags the ones that need specialist review (regulatory, MAE, financing, consent, CFIUS, HSR). It answers, in the signing-to-closing window, "is the deal closing-ready, and what is still open?" It tracks the node logic; whether a condition is truly met or waivable is counsel\'s call.',
    algorithm: [
      'Given `conditions` (a list of objects, each with `name`, `type`, `satisfied`, `waived`):',
      '1. If `conditions` is empty, the implementation SHALL return `status: "needs_inputs"`.',
      '2. For each condition, `blocks_closing` SHALL be true iff it is neither satisfied nor waived; `professional_review_required` SHALL be true iff its type matches a specialist category (regulatory, legal, counsel, MAE, financing, consent, CFIUS, HSR).',
      '3. It SHALL count conditions, satisfied, waived, and open (blocking) conditions.',
      '4. `closing_ready` SHALL be true iff no condition blocks closing; `professional_review_required` (aggregate) SHALL be true iff any node requires specialist review.',
      '5. It SHALL list the open conditions by name and return the full node detail.',
    ],
    constants: [],
    inputs: {
      conditions: { type: 'object[]', desc: 'Closing conditions; each object carries `name` (string), `type` (a condition_type value), `satisfied` (boolean), and `waived` (boolean).' },
    },
    outputs: {
      condition_count: { type: 'integer', desc: 'Total number of conditions.' },
      satisfied_count: { type: 'integer', desc: 'Number satisfied.' },
      waived_count: { type: 'integer', desc: 'Number waived.' },
      open_condition_count: { type: 'integer', desc: 'Number still blocking closing.' },
      closing_ready: { type: 'boolean', desc: 'Whether no condition blocks closing.' },
      professional_review_required: { type: 'boolean', desc: 'Whether any condition needs specialist review.' },
      open_conditions: { type: 'string[]', desc: 'Names of the conditions still blocking closing.' },
      condition_nodes: { type: 'object[]', desc: 'Per-condition detail: `{ name, type, satisfied, waived, blocks_closing, professional_review_required }`.' },
    },
    derivedOutputs: ['condition_count', 'satisfied_count', 'waived_count', 'open_condition_count'],
    boundary:
      'This model tallies conditions to close and flags which block closing and which need specialist review (regulatory, MAE, financing, consent, CFIUS, HSR). Whether a condition is in fact satisfied or waivable, and the MAE and regulatory judgments, are determinations for counsel; the model tracks the node logic and routes the flagged conditions, and clears none of them itself.',
    golden: {
      narrative: 'Of four conditions, the reps bring-down and the no-MAE condition are met, but HSR clearance and financing remain open — the deal is not closing-ready and needs specialist review.',
      input: { conditions: [ { name: 'HSR clearance', type: 'hsr', satisfied: false, waived: false }, { name: 'Bring-down of representations', type: 'general', satisfied: true, waived: false }, { name: 'No material adverse effect', type: 'mae', satisfied: true, waived: false }, { name: 'Debt financing funded', type: 'financing', satisfied: false, waived: false } ] },
    },
  },

  /* ══ M212 — Termination and break/reverse-break fee engine ═══════════ */
  M212: {
    purpose:
      'Sizes the termination-fee package — the target break-up fee (and its go-shop discount), the reverse termination fee, and the antitrust reverse fee — from the transaction value and either supplied percentages or cited-median study defaults. It answers, for deal counsel and bankers, "what do the exit fees cost on each side of this deal?" It computes the magnitudes; enforceability and the fiduciary-out architecture are counsel\'s.',
    algorithm: [
      'Given `transaction_value_cents` and optional `target_break_fee_pct`, `reverse_termination_fee_pct`, `antitrust_reverse_fee_pct`, `go_shop_discount_pct`:',
      '1. If `transaction_value_cents` is missing, the implementation SHALL return `status: "needs_inputs"`.',
      '2. `target_break_fee_cents` SHALL be the transaction value times the target break-fee percentage (supplied or cited median — constants: break-fee median).',
      '3. `go_shop_break_fee_cents` SHALL be the target break fee times the go-shop discount (supplied or cited median — constants: go-shop discount median).',
      '4. `reverse_termination_fee_cents` and `antitrust_reverse_fee_cents` SHALL be the transaction value times the respective percentages (supplied or cited medians — constants: reverse and antitrust reverse fee medians).',
      '5. It SHALL carry counsel-review flags for the fiduciary-out, go-shop/no-shop, regulatory covenant, and liquidated-damages enforceability framing.',
    ],
    constants: [
      { name: 'Target break-up fee', value: '2.7% of transaction value', kind: 'cited_median_should', citation: 'Houlihan Lokey 2023 Transaction Termination Fee Study', pin: 'median target break-up fee, %-of-equity-value', effective: '2023 study', nextCheck: 'on next Houlihan Lokey study', traceValues: [0.027] },
      { name: 'Reverse termination fee', value: '4.2% of transaction value', kind: 'cited_median_should', citation: 'Houlihan Lokey 2023 Transaction Termination Fee Study', pin: 'median reverse termination fee', effective: '2023 study', nextCheck: 'on next Houlihan Lokey study', traceValues: [0.042] },
      { name: 'Antitrust reverse termination fee', value: '5.0% of transaction value', kind: 'cited_median_should', citation: 'Fenwick 2023 antitrust reverse-break-fee (ARBF) analysis', pin: 'median antitrust reverse break fee', effective: '2023 analysis', nextCheck: 'on next Fenwick analysis', traceValues: [0.05] },
      { name: 'Go-shop break-fee discount', value: '50% of the base break fee', kind: 'cited_median_should', citation: 'Houlihan Lokey 2023 Transaction Termination Fee Study', pin: 'typical go-shop period fee reduction', effective: '2023 study', nextCheck: 'on next Houlihan Lokey study', traceValues: [0.5] },
    ],
    precisionRule: 'Percentages are 4-decimal fractions; fee amounts are exact integer cents (see the Conventions chapter).',
    inputs: {
      transaction_value_cents: { type: 'integer (cents)', desc: 'Transaction (equity) value the fees are sized against.', unit: 'cents' },
      target_break_fee_pct: { type: 'number', desc: 'Override for the target break-up fee as a fraction of value; defaults to the cited median.', precision: 4 },
      reverse_termination_fee_pct: { type: 'number', desc: 'Override for the reverse termination fee as a fraction of value; defaults to the cited median.', precision: 4 },
      antitrust_reverse_fee_pct: { type: 'number', desc: 'Override for the antitrust reverse fee as a fraction of value; defaults to the cited median.', precision: 4 },
      go_shop_discount_pct: { type: 'number', desc: 'Override for the go-shop fee discount as a fraction of the base fee; defaults to the cited median.', precision: 4 },
    },
    outputs: {
      transaction_value_cents: { type: 'integer (cents)', desc: 'The transaction value, echoed.', unit: 'cents' },
      target_break_fee_pct: { type: 'number', desc: 'The target break-up fee as a fraction of value.', precision: 4 },
      target_break_fee_cents: { type: 'integer (cents)', desc: 'The target break-up fee in cents.', unit: 'cents' },
      go_shop_break_fee_cents: { type: 'integer (cents)', desc: 'The reduced break fee during a go-shop period.', unit: 'cents' },
      reverse_termination_fee_pct: { type: 'number', desc: 'The reverse termination fee as a fraction of value.', precision: 4 },
      reverse_termination_fee_cents: { type: 'integer (cents)', desc: 'The reverse termination fee in cents.', unit: 'cents' },
      antitrust_reverse_fee_pct: { type: 'number', desc: 'The antitrust reverse fee as a fraction of value.', precision: 4 },
      antitrust_reverse_fee_cents: { type: 'integer (cents)', desc: 'The antitrust reverse fee in cents.', unit: 'cents' },
      counsel_review_flags: { type: 'string[]', desc: 'Items counsel must confirm (fiduciary-out, go-shop, regulatory covenant, enforceability).' },
    },
    derivedOutputs: ['transaction_value_cents', 'target_break_fee_cents', 'go_shop_break_fee_cents', 'reverse_termination_fee_cents', 'antitrust_reverse_fee_cents'],
    boundary:
      'This model sizes break-up, reverse-break-up, and antitrust reverse-termination fees from the transaction value and cited-median or supplied percentages (Houlihan Lokey / Fenwick study medians — SHOULD, not law). Enforceability (the Brazen liquidated-damages framing), the fiduciary-out, and the go-shop/no-shop architecture are legal determinations for counsel; the model computes the fee magnitudes and flags the review.',
    golden: {
      narrative: 'On an $80M deal the target break fee runs 2.7% ($2.16M), halved in a go-shop ($1.08M), against a 4.2% reverse fee ($3.36M) and a 5% antitrust reverse fee ($4.0M).',
      input: { transaction_value_cents: 8_000_000_000 },
    },
  },

  /* ══ M213 — Earnout architecture and dispute ═════════════════════════ */
  M213: {
    purpose:
      'Structures the earnout — how many metrics gate it, the acceleration triggers, the post-closing covenants, the dispute forum, and the tax-characterization selector — from supplied facts, and routes the binding legal and tax calls to the specialists. It answers, for parties designing contingent consideration, "how is this earnout built and where does it go for review?" It organizes the architecture; it decides no enforceable term or tax treatment.',
    algorithm: [
      'Given `earnout_value_cents` and `metrics`, and optional `acceleration_triggers`, `post_closing_covenants`, `dispute_forum`, `tax_characterization`:',
      '1. If `earnout_value_cents` is missing or `metrics` is empty, the implementation SHALL return `status: "needs_inputs"`.',
      '2. `metric_count` SHALL be the number of metrics; `multiple_metric_earnout` SHALL be true iff more than one.',
      '3. `acceleration_trigger_count` and `post_closing_covenant_count` SHALL be the counts of the supplied lists.',
      '4. `dispute_forum` SHALL default to the accounting arbitrator when not supplied; `accounting_arbitrator_selected` SHALL be true iff the forum names an accounting arbitrator.',
      '5. `tax_characterization` SHALL default to "requires_tax_review"; `counsel_and_tax_handoff_required` SHALL be true — the EBITDA-definition lock and the §453/§483/§1274 characterization route to counsel and the tax advisor.',
    ],
    constants: [],
    inputs: {
      earnout_value_cents: { type: 'integer (cents)', desc: 'Maximum contingent consideration payable under the earnout.', unit: 'cents' },
      metrics: { type: 'string[]', desc: 'The performance metrics that gate the earnout (e.g., EBITDA, revenue).' },
      acceleration_triggers: { type: 'string[]', desc: 'Events that accelerate the earnout (e.g., change of control, termination without cause).' },
      post_closing_covenants: { type: 'string[]', desc: 'Covenants governing the buyer\'s post-closing operation of the business.' },
      dispute_forum: { type: 'enum', enum: 'dispute_forum', desc: 'The forum designated to resolve earnout disputes; defaults to the accounting arbitrator.' },
      tax_characterization: { type: 'enum', enum: 'tax_characterization', desc: 'The earnout tax-characterization selector; defaults to requires_tax_review.' },
    },
    outputs: {
      earnout_value_cents: { type: 'integer (cents)', desc: 'The earnout value, echoed.', unit: 'cents' },
      metric_count: { type: 'integer', desc: 'Number of performance metrics.' },
      multiple_metric_earnout: { type: 'boolean', desc: 'Whether more than one metric gates the earnout.' },
      acceleration_trigger_count: { type: 'integer', desc: 'Number of acceleration triggers.' },
      post_closing_covenant_count: { type: 'integer', desc: 'Number of post-closing covenants.' },
      dispute_forum: { type: 'enum', enum: 'dispute_forum', desc: 'The designated dispute forum.' },
      accounting_arbitrator_selected: { type: 'boolean', desc: 'Whether the forum is an accounting arbitrator.' },
      tax_characterization: { type: 'enum', enum: 'tax_characterization', desc: 'The tax-characterization selector.' },
      counsel_and_tax_handoff_required: { type: 'boolean', desc: 'Always true — binding legal and tax calls route to the specialists.' },
    },
    derivedOutputs: ['earnout_value_cents', 'metric_count', 'acceleration_trigger_count', 'post_closing_covenant_count'],
    boundary:
      'This model structures the earnout — metric count, acceleration triggers, post-closing covenants, dispute forum, tax-characterization selector — from supplied facts. The EBITDA-definition lock, the enforceable covenant set, and the §453/§483/§1274 tax characterization are legal and tax determinations for counsel and the tax advisor; the model organizes the architecture and routes (counsel_and_tax_handoff_required), and selects no binding treatment.',
    golden: {
      narrative: 'A $20M two-metric earnout (EBITDA and revenue) with a change-of-control accelerator routes disputes to an accounting arbitrator and both counsel and tax review.',
      input: { earnout_value_cents: 2_000_000_000, metrics: ['EBITDA', 'revenue'], acceleration_triggers: ['change_of_control'], post_closing_covenants: ['operate_in_ordinary_course'] },
    },
  },

  /* ══ STRUCT FAMILY — earnout expected-value engine (M111, M112) ═══════ */

  /* ══ M111 — Revenue earnout (SCOPE-HONESTY FLAG) ═════════════════════ */
  M111: {
    purpose:
      'Computes the expected value of a revenue-metric earnout as the probability-weighted sum of its supplied payout scenarios, and discounts that expected value to present value over the earnout term. It answers, for a buyer and seller pricing contingent consideration, "what is this revenue earnout worth today, and what does each scenario contribute?" It values the earnout from supplied scenario payouts and their probabilities; it does not itself model the revenue thresholds that generate those payouts.',
    scopeFlag:
      'Scope: this model computes a probability-weighted expected value and present value over already-quantified payout scenarios and their probabilities (the reference binding MODEL.STRUCT.EARNOUT.MC.v1 is shared with M112). It does not gate payouts off a revenue metric and threshold, and does not build a period-by-period schedule beyond a single-term discount — the revenue-metric measurement is the caller\'s input, not a computation of this model.',
    algorithm: [
      'Given `earnout_targets` (a list of integer-cents scenario payouts), `probabilities` (a parallel list of scenario probabilities), and `discount_rate`, plus optional `term_years` (default 1):',
      '1. The implementation SHALL coerce `earnout_targets` to integer cents and `probabilities` to numbers; if either list is empty or `discount_rate` is missing, it SHALL return `status: "needs_inputs"` naming the missing fields and emit no outputs.',
      '2. For each scenario it SHALL clamp the probability to the closed interval [0, 1] and weight the scenario payout by it.',
      '3. `expected_gross_cents` SHALL be the sum of the probability-weighted payouts, rounded to the nearest integer cent.',
      '4. `expected_present_value_cents` SHALL be `expected_gross_cents ÷ (1 + discount_rate)^term_years`, rounded to the nearest integer cent.',
      '5. `scenarios` SHALL echo each scenario as `{ target_cents, probability }` with the probability at the global 4-decimal precision.',
    ],
    constants: [],
    precisionRule: 'Monetary outputs are exact integer cents; scenario probabilities are rounded per the global rule (half-even to 4 decimals — see the Conventions chapter).',
    inputs: {
      earnout_targets: { type: 'integer (cents)[]', desc: 'The scenario payout amounts, one integer-cents value per scenario.', unit: 'cents' },
      probabilities: { type: 'number[]', desc: 'The probability of each scenario (0–1), positionally aligned to earnout_targets.' },
      discount_rate: { type: 'number', desc: 'The annual discount rate applied to the expected value (a fraction, e.g. 0.12).', precision: 4 },
      term_years: { type: 'number', desc: 'The earnout term in years over which the expected value is discounted (default 1).', unit: 'years' },
    },
    outputs: {
      expected_gross_cents: { type: 'integer (cents)', desc: 'Probability-weighted expected earnout payout, undiscounted.', unit: 'cents' },
      expected_present_value_cents: { type: 'integer (cents)', desc: 'The expected payout discounted to present value over the term.', unit: 'cents' },
      scenarios: { type: 'object[]', desc: 'Per-scenario echo: `{ target_cents (integer cents), probability (number, 0–1) }`.' },
    },
    derivedOutputs: ['expected_gross_cents', 'expected_present_value_cents', 'scenarios'],
    boundary:
      'This model values a revenue earnout as the probability-weighted, discounted expected value of supplied scenario payouts. Whether the scenario payouts and probabilities are reasonable, how the revenue metric is defined and measured, and the earnout\'s enforceability and tax characterization are determinations for the parties, their accountants, and counsel (see M213); the model computes the expected value and renders no view on the assumptions behind it.',
    golden: {
      narrative: 'A revenue earnout with three payout scenarios — $2.0M at 50%, $3.5M at 30%, $5.0M at 20% — carries a $3.05M probability-weighted expected value, discounted three years at 12% to about $2.17M today.',
      input: { earnout_targets: [200_000_000, 350_000_000, 500_000_000], probabilities: [0.5, 0.3, 0.2], discount_rate: 0.12, term_years: 3 },
    },
  },

  /* ══ M112 — EBITDA earnout (SCOPE-HONESTY FLAG) ══════════════════════ */
  M112: {
    purpose:
      'Computes the expected value of an EBITDA-metric earnout as the probability-weighted sum of its supplied payout scenarios, and discounts that expected value to present value over the earnout term. It answers, for parties pricing contingent consideration tied to EBITDA, "what is this EBITDA earnout worth today?" It values the earnout from supplied scenario payouts and probabilities; it does not itself define the EBITDA target or apply an add-back policy.',
    scopeFlag:
      'Scope: this model computes a probability-weighted expected value and present value over already-quantified payout scenarios and their probabilities (the reference binding MODEL.STRUCT.EARNOUT.MC.v1 is shared with M111). It does not compute an EBITDA target and applies no add-back or normalization policy — that normalization is a QoE and accounting matter, baked into the supplied scenario payouts before they reach this model.',
    algorithm: [
      'Given `earnout_targets` (a list of integer-cents scenario payouts), `probabilities` (a parallel list of scenario probabilities), and `discount_rate`, plus optional `term_years` (default 1):',
      '1. The implementation SHALL coerce `earnout_targets` to integer cents and `probabilities` to numbers; if either list is empty or `discount_rate` is missing, it SHALL return `status: "needs_inputs"` naming the missing fields and emit no outputs.',
      '2. For each scenario it SHALL clamp the probability to the closed interval [0, 1] and weight the scenario payout by it.',
      '3. `expected_gross_cents` SHALL be the sum of the probability-weighted payouts, rounded to the nearest integer cent.',
      '4. `expected_present_value_cents` SHALL be `expected_gross_cents ÷ (1 + discount_rate)^term_years`, rounded to the nearest integer cent.',
      '5. `scenarios` SHALL echo each scenario as `{ target_cents, probability }` with the probability at the global 4-decimal precision.',
    ],
    constants: [],
    precisionRule: 'Monetary outputs are exact integer cents; scenario probabilities are rounded per the global rule (half-even to 4 decimals — see the Conventions chapter).',
    inputs: {
      earnout_targets: { type: 'integer (cents)[]', desc: 'The scenario payout amounts, one integer-cents value per EBITDA scenario.', unit: 'cents' },
      probabilities: { type: 'number[]', desc: 'The probability of each scenario (0–1), positionally aligned to earnout_targets.' },
      discount_rate: { type: 'number', desc: 'The annual discount rate applied to the expected value (a fraction, e.g. 0.15).', precision: 4 },
      term_years: { type: 'number', desc: 'The earnout term in years over which the expected value is discounted (default 1).', unit: 'years' },
    },
    outputs: {
      expected_gross_cents: { type: 'integer (cents)', desc: 'Probability-weighted expected earnout payout, undiscounted.', unit: 'cents' },
      expected_present_value_cents: { type: 'integer (cents)', desc: 'The expected payout discounted to present value over the term.', unit: 'cents' },
      scenarios: { type: 'object[]', desc: 'Per-scenario echo: `{ target_cents (integer cents), probability (number, 0–1) }`.' },
    },
    derivedOutputs: ['expected_gross_cents', 'expected_present_value_cents', 'scenarios'],
    boundary:
      'This model values an EBITDA earnout as the probability-weighted, discounted expected value of supplied scenario payouts. The EBITDA definition, the add-back policy that normalizes it, and the earnout\'s enforceability and tax characterization are determinations for the parties\' accountants and counsel (see M213); the model computes the expected value and renders no view on the normalization behind the scenario payouts.',
    golden: {
      narrative: 'An EBITDA earnout with two payout scenarios — $2.5M if EBITDA hits the base target (60%) and $4.0M at the stretch target (40%) — carries a $3.1M expected value, discounted two years at 15% to about $2.34M today.',
      input: { earnout_targets: [250_000_000, 400_000_000], probabilities: [0.6, 0.4], discount_rate: 0.15, term_years: 2 },
    },
  },

  /* ══ CAPTABLE FAMILY — round dilution (M146) ═════════════════════════ */

  /* ══ M146 — Cap-table waterfall (SCOPE-HONESTY FLAG) ═════════════════ */
  M146: {
    purpose:
      'Computes the ownership split a single priced financing round produces — post-money valuation, and the investor, option-pool, and founder ownership percentages — and the round\'s liquidation preference at the supplied multiple. It answers, for a founder or investor sizing a round, "after this round and pool, who owns what, and how large is the preference stack on the new money?" It models one round\'s dilution and its preference; it is not a multi-class exit waterfall.',
    scopeFlag:
      'Scope: this model computes a single-round post-money dilution split (investor / option-pool / founder) and a single-security liquidation preference (round size × preference multiple). It does not model participation rights, multi-class seniority ordering, anti-dilution adjustments, or a full exit-proceeds waterfall — those are outside the single-round dilution-and-preference view specified here.',
    algorithm: [
      'Given `pre_money_cents`, `round_size_cents`, `option_pool_pct` (as a fraction), and `security_terms` (an object):',
      '1. If any of the four is missing or non-numeric (or `security_terms` is empty), the implementation SHALL return `status: "needs_inputs"` naming the missing fields and emit no outputs.',
      '2. `post_money_cents` SHALL be `pre_money_cents + round_size_cents`.',
      '3. `investor_ownership_pct` SHALL be `round_size_cents ÷ post_money_cents` at full precision, reported at the global 4-decimal precision.',
      '4. `option_pool_pct` SHALL be the supplied option-pool fraction clamped to [0, 1], reported at 4 decimals.',
      '5. `founder_ownership_pct` SHALL be `max(0, 1 − investor_ownership − option_pool)` (computed from the full-precision investor share), reported at 4 decimals.',
      '6. `liquidation_preference_cents` SHALL be `round_size_cents × liquidation_pref_multiple` (from `security_terms`, default 1×), rounded to the nearest cent.',
    ],
    constants: [],
    precisionRule: 'Monetary outputs are exact integer cents; ownership fractions are rounded per the global rule (half-even to 4 decimals — see the Conventions chapter).',
    inputs: {
      pre_money_cents: { type: 'integer (cents)', desc: 'Pre-money valuation of the round.', unit: 'cents' },
      round_size_cents: { type: 'integer (cents)', desc: 'New money raised in the round.', unit: 'cents' },
      option_pool_pct: { type: 'number', desc: 'The post-round option-pool ownership as a fraction (0–1).', precision: 4 },
      security_terms: { type: 'object', desc: 'Security economics for the round; recognizes `liquidation_pref_multiple` (number, default 1×).' },
    },
    outputs: {
      post_money_cents: { type: 'integer (cents)', desc: 'Post-money valuation (pre-money plus round size).', unit: 'cents' },
      investor_ownership_pct: { type: 'number', desc: 'New-investor ownership as a fraction of the post-money cap table.', precision: 4 },
      option_pool_pct: { type: 'number', desc: 'Option-pool ownership as a fraction, clamped to [0, 1].', precision: 4 },
      founder_ownership_pct: { type: 'number', desc: 'Residual founder/existing-holder ownership as a fraction.', precision: 4 },
      liquidation_preference_cents: { type: 'integer (cents)', desc: 'The round\'s liquidation preference (round size × multiple).', unit: 'cents' },
    },
    derivedOutputs: ['post_money_cents', 'investor_ownership_pct', 'option_pool_pct', 'founder_ownership_pct', 'liquidation_preference_cents'],
    boundary:
      'This model computes one round\'s dilution split and its liquidation preference from supplied round economics. Participation, multi-class seniority, anti-dilution mechanics, and the exit-proceeds waterfall across the full cap table are not modeled here; the terms that govern them, and their enforceability, are determinations for the parties and counsel drafting the financing documents.',
    golden: {
      narrative: 'A $20M pre-money Series A raising $8M with a 15% option pool leaves founders at 56.4%; the new investors take 28.6% with a 1× liquidation preference of $8M.',
      input: { pre_money_cents: 2_000_000_000, round_size_cents: 800_000_000, option_pool_pct: 0.15, security_terms: { liquidation_pref_multiple: 1 } },
    },
  },

  /* ══ FINANCE FAMILY — capital-stack mechanics (M179–M184) ════════════ */

  /* ══ M179 — NAV facility LTV ═════════════════════════════════════════ */
  M179: {
    purpose:
      'Computes a fund-level NAV facility\'s loan-to-value and equity cushion from the fund NAV and drawn loan amount, and tests the cushion against the required minimum. It answers, for a GP or lender sizing a NAV loan, "where does LTV sit, how much cushion remains, and does it clear the covenant floor?" It performs the ratio screen; the binding facility terms and collateral-pool eligibility are the lender\'s.',
    algorithm: [
      'Given `fund_nav_cents` and `loan_amount_cents`, plus optional `required_cushion_pct` (default: the NAV facility minimum cushion constant):',
      '1. If either required input is missing or non-numeric, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.',
      '2. `nav_ltv` SHALL be `loan_amount_cents ÷ fund_nav_cents` (zero when NAV is non-positive), at the global 4-decimal precision.',
      '3. `cushion_pct` SHALL be `1 − nav_ltv`, at 4 decimals.',
      '4. `required_cushion_pct` SHALL be the supplied value, else the NAV facility minimum cushion (constants: NAV facility minimum cushion), at 4 decimals.',
      '5. `cushion_requirement_satisfied` SHALL be true iff `cushion_pct ≥ required_cushion_pct`.',
      '6. `lender_handoff_required` SHALL always be true — binding facility terms route to the lender.',
    ],
    constants: [
      { name: 'NAV facility minimum cushion', value: '25% (0.25)', kind: 'cited_median_should', citation: 'NAV facility market practice — conventional minimum equity cushion (2024)', pin: 'conventional minimum cushion (LTV ceiling near 75%)', effective: '2024 market practice', nextCheck: 'on next NAV-facility market review', traceValues: [0.25] },
    ],
    precisionRule: 'Ratios are rounded per the global rule (half-even to 4 decimals — see the Conventions chapter); monetary echoes are exact integer cents.',
    inputs: {
      fund_nav_cents: { type: 'integer (cents)', desc: 'Net asset value of the fund pledged to the facility.', unit: 'cents' },
      loan_amount_cents: { type: 'integer (cents)', desc: 'Drawn (or committed) loan amount under the facility.', unit: 'cents' },
      required_cushion_pct: { type: 'number', desc: 'Minimum equity cushion the covenant requires as a fraction; defaults to the cited market minimum.', precision: 4 },
    },
    outputs: {
      fund_nav_cents: { type: 'integer (cents)', desc: 'The fund NAV, echoed.', unit: 'cents' },
      loan_amount_cents: { type: 'integer (cents)', desc: 'The loan amount, echoed.', unit: 'cents' },
      nav_ltv: { type: 'number', desc: 'Loan-to-value: loan ÷ NAV.', precision: 4 },
      cushion_pct: { type: 'number', desc: 'Equity cushion: 1 − LTV.', precision: 4 },
      required_cushion_pct: { type: 'number', desc: 'The required minimum cushion applied.', precision: 4 },
      cushion_requirement_satisfied: { type: 'boolean', desc: 'Whether the cushion meets or exceeds the required minimum.' },
      lender_handoff_required: { type: 'boolean', desc: 'Always true — binding facility terms route to the lender.' },
    },
    derivedOutputs: ['nav_ltv', 'cushion_pct'],
    boundary:
      'This model computes NAV-facility LTV and cushion and screens them against a required minimum. The binding advance rate, collateral-pool eligibility, concentration limits, and cure mechanics are the lender\'s and are set in the facility agreement; the model produces the ratio screen and routes the binding terms to the lender (lender_handoff_required), quoting no facility.',
    golden: {
      narrative: 'A $500M-NAV fund draws a $150M NAV facility: LTV lands at 30%, leaving a 70% cushion that clears the 25% minimum comfortably.',
      input: { fund_nav_cents: 50_000_000_000, loan_amount_cents: 15_000_000_000, required_cushion_pct: 0.25 },
    },
  },

  /* ══ M180 — Convertible / SAFE conversion ════════════════════════════ */
  M180: {
    purpose:
      'Computes the price at which a convertible note or SAFE converts in a priced round — the lower of the discount price, the valuation-cap price, and the round\'s own share price — and the resulting share count, and reports which term governed. It answers, for a founder or investor modeling a conversion, "at what price does this instrument convert, and does the cap or the discount win?" It computes the conversion arithmetic from supplied terms; it renders no view on the fairness of the cap or discount.',
    scopeFlag: 'Scope: the cap price is computed as `valuation_cap ÷ pre_money_share_count` — the legacy **pre-money** SAFE mechanic. It does not implement the post-2018 YC **post-money** SAFE (which sizes the cap on a post-money basis), convertible-note interest accrual, or interaction across multiple instruments converting together; it prices one instrument in isolation on the pre-money cap.',
    algorithm: [
      'Given `investment_cents` and `priced_round_share_price_cents`, plus optional `valuation_cap_cents`, `pre_money_share_count`, and `discount_pct` (default 0):',
      '1. If either required input is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.',
      '2. `discount_price_cents` SHALL be `priced_round_share_price_cents × (1 − discount_pct)` (the discount clamped to [0, 1]), rounded to the nearest cent.',
      '3. `cap_price_cents` SHALL be `valuation_cap_cents ÷ pre_money_share_count`, rounded to the nearest cent, when both are supplied and positive; otherwise null.',
      '4. `conversion_price_cents` SHALL be the minimum of the priced-round price, the discount price, and (when present) the cap price, among the positive candidates.',
      '5. `converted_share_count` SHALL be `investment_cents ÷ conversion_price_cents`, at the global 4-decimal precision.',
      '6. `conversion_driver` SHALL name which term produced the governing price: the valuation cap, the discount, or the priced-round price.',
    ],
    constants: [],
    precisionRule: 'Monetary outputs are exact integer cents; the discount fraction and the share count are rounded per the global rule (half-even to 4 decimals — see the Conventions chapter).',
    inputs: {
      investment_cents: { type: 'integer (cents)', desc: 'Principal (or SAFE amount) converting into the round.', unit: 'cents' },
      priced_round_share_price_cents: { type: 'integer (cents)', desc: 'The new priced-round price per share.', unit: 'cents' },
      valuation_cap_cents: { type: 'integer (cents)', desc: 'The instrument\'s valuation cap; optional, drives the cap price.', unit: 'cents' },
      pre_money_share_count: { type: 'number', desc: 'Fully-diluted pre-money share count used to convert the cap into a per-share price; optional.' },
      discount_pct: { type: 'number', desc: 'The conversion discount as a fraction (0–1); default 0 (no discount).', precision: 4 },
    },
    outputs: {
      investment_cents: { type: 'integer (cents)', desc: 'The converting investment, echoed.', unit: 'cents' },
      priced_round_share_price_cents: { type: 'integer (cents)', desc: 'The priced-round share price, echoed.', unit: 'cents' },
      discount_pct: { type: 'number', desc: 'The discount fraction applied.', precision: 4 },
      discount_price_cents: { type: 'integer (cents)', desc: 'The discounted per-share price.', unit: 'cents' },
      valuation_cap_cents: { type: 'integer (cents) | null', desc: 'The valuation cap, echoed, or null.', unit: 'cents' },
      cap_price_cents: { type: 'integer (cents) | null', desc: 'The cap-implied per-share price, or null when the cap or share count is absent.', unit: 'cents' },
      conversion_price_cents: { type: 'integer (cents)', desc: 'The governing (lowest) conversion price per share.', unit: 'cents' },
      converted_share_count: { type: 'number', desc: 'Shares the investment converts into at the conversion price.', precision: 4 },
      conversion_driver: { type: 'enum', enum: 'conversion_driver', desc: 'Which term produced the governing conversion price.' },
    },
    derivedOutputs: ['discount_price_cents', 'cap_price_cents', 'conversion_price_cents', 'converted_share_count'],
    boundary:
      'This model computes a convertible/SAFE conversion price and share count from supplied cap, discount, and priced-round terms. Whether the cap or discount is market, how the fully-diluted share count is defined, and the instrument\'s enforceability and tax treatment are determinations for the parties and counsel; the model computes the conversion the supplied terms imply and renders no view on them.',
    golden: {
      narrative: 'A $500k SAFE with a $10M cap and a 20% discount converts into a $5.00 priced round on 8,000,000 pre-money shares: the $1.25 cap price beats the $4.00 discount price, so the cap governs and the SAFE takes 400,000 shares.',
      input: { investment_cents: 50_000_000, priced_round_share_price_cents: 500, valuation_cap_cents: 1_000_000_000, pre_money_share_count: 8_000_000, discount_pct: 0.20 },
    },
  },

  /* ══ M181 — Venture-debt warrant coverage ════════════════════════════ */
  M181: {
    purpose:
      'Sizes a venture-debt warrant package — the warrant coverage amount, the implied share count, and the warrants\' intrinsic value — and estimates the lender\'s all-in IRR including cash interest and the warrant upside. It answers, for a lender or borrower pricing venture debt, "how many warrant shares does this coverage buy, what are they worth, and what return does the package imply for the lender?" It computes the arithmetic from supplied terms; the fair-value share price and IRR are estimates, not a valuation.',
    algorithm: [
      'Given `loan_amount_cents`, `warrant_coverage_pct`, `exercise_price_cents`, and `fair_value_share_price_cents`, plus optional `term_years` (default 3) and `cash_interest_rate` (default 0):',
      '1. If any of the four required inputs is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.',
      '2. `warrant_coverage_amount_cents` SHALL be `loan_amount_cents × warrant_coverage_pct`, rounded to the nearest cent.',
      '3. `warrant_shares` SHALL be `warrant_coverage_amount_cents ÷ exercise_price_cents` (zero if the exercise price is non-positive), rounded to the nearest whole share.',
      '4. `intrinsic_warrant_value_cents` SHALL be `max(0, warrant_shares × (fair_value_share_price_cents − exercise_price_cents))`, rounded to the nearest cent.',
      '5. `simple_interest_cents` SHALL be `loan_amount_cents × cash_interest_rate × term_years`, rounded to the nearest cent; `lender_gross_return_cents` SHALL be `loan_amount_cents + simple_interest_cents + intrinsic_warrant_value_cents`.',
      '6. `estimated_lender_irr` SHALL be `(lender_gross_return_cents ÷ loan_amount_cents)^(1 ÷ term_years) − 1` when the term is positive, else null, at the global 4-decimal precision. This is a money-multiple CAGR (annualized return on the total return multiple); it does NOT discount the interim coupon timing, so it is an annualized-return proxy, not a cash-flow IRR.',
    ],
    constants: [],
    precisionRule: 'Monetary outputs are exact integer cents; the coverage fraction and the IRR are rounded per the global rule (half-even to 4 decimals — see the Conventions chapter); warrant shares are whole shares.',
    inputs: {
      loan_amount_cents: { type: 'integer (cents)', desc: 'The venture-debt principal.', unit: 'cents' },
      warrant_coverage_pct: { type: 'number', desc: 'Warrant coverage as a fraction of the loan (e.g., 0.10 for 10% coverage).', precision: 4 },
      exercise_price_cents: { type: 'integer (cents)', desc: 'The warrant exercise (strike) price per share.', unit: 'cents' },
      fair_value_share_price_cents: { type: 'integer (cents)', desc: 'Assumed fair-value price per share used to value the warrants.', unit: 'cents' },
      term_years: { type: 'number', desc: 'Loan term in years used for interest and IRR (default 3).', unit: 'years' },
      cash_interest_rate: { type: 'number', desc: 'Annual cash coupon as a fraction (default 0).', precision: 4 },
    },
    outputs: {
      loan_amount_cents: { type: 'integer (cents)', desc: 'The loan principal, echoed.', unit: 'cents' },
      warrant_coverage_pct: { type: 'number', desc: 'The warrant coverage fraction applied.', precision: 4 },
      warrant_coverage_amount_cents: { type: 'integer (cents)', desc: 'Dollar coverage: loan × coverage.', unit: 'cents' },
      warrant_shares: { type: 'integer', desc: 'Warrant shares: coverage amount ÷ exercise price.' },
      intrinsic_warrant_value_cents: { type: 'integer (cents)', desc: 'Intrinsic value of the warrants at the assumed fair value.', unit: 'cents' },
      simple_interest_cents: { type: 'integer (cents)', desc: 'Total simple cash interest over the term.', unit: 'cents' },
      lender_gross_return_cents: { type: 'integer (cents)', desc: 'Principal plus interest plus warrant intrinsic value.', unit: 'cents' },
      estimated_lender_irr: { type: 'number | null', desc: 'Estimated annualized lender return — a money-multiple CAGR ((gross return ÷ principal)^(1/term) − 1); it does not time the interim coupons, so it is an annualized-return proxy, not a cash-flow IRR. Null when the term is non-positive.', precision: 4 },
    },
    derivedOutputs: ['warrant_coverage_amount_cents', 'warrant_shares', 'intrinsic_warrant_value_cents', 'simple_interest_cents', 'lender_gross_return_cents', 'estimated_lender_irr'],
    boundary:
      'This model sizes a venture-debt warrant package and estimates the lender\'s IRR from supplied loan, coverage, and price assumptions. The fair-value share price is an assumption, not a valuation, and the IRR is an estimate; the enforceable warrant terms, the true share count on a fully-diluted basis, and the instrument\'s tax treatment are determinations for the parties and counsel.',
    golden: {
      narrative: 'A $10M venture loan with 10% warrant coverage, a $2.00 strike, and an assumed $5.00 fair value buys 500,000 warrant shares worth $1.5M intrinsic; with an 11% cash coupon over three years the lender\'s estimated annualized all-in return runs about 14% (a money-multiple CAGR over the three-year term).',
      input: { loan_amount_cents: 1_000_000_000, warrant_coverage_pct: 0.10, exercise_price_cents: 200, fair_value_share_price_cents: 500, term_years: 3, cash_interest_rate: 0.11 },
    },
  },

  /* ══ M182 — ABL borrowing base ═══════════════════════════════════════ */
  M182: {
    purpose:
      'Computes an asset-based lending borrowing base — advance-rate value against eligible accounts receivable and eligible inventory, less reserves — and the availability under any commitment cap. It answers, for a borrower or lender monitoring an ABL line, "how much can be drawn against the current collateral after reserves and the commitment?" It applies supplied or market-standard advance rates to supplied eligible balances; eligibility itself is the lender\'s determination.',
    algorithm: [
      'Given `eligible_ar_cents` and `eligible_inventory_cents`, plus optional `ar_advance_rate` (default: the eligible-A/R advance-rate constant), `inventory_advance_rate` (default: the eligible-inventory advance-rate constant), `reserves_cents` (default 0), and `commitment_cents`:',
      '1. If either required eligible balance is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.',
      '2. `gross_borrowing_base_cents` SHALL be `round(eligible_ar_cents × ar_advance_rate) + round(eligible_inventory_cents × inventory_advance_rate)`.',
      '3. `net_borrowing_base_cents` SHALL be `max(0, gross_borrowing_base_cents − reserves_cents)`.',
      '4. `availability_cents` SHALL be `net_borrowing_base_cents` when no commitment is supplied, else `min(net_borrowing_base_cents, commitment_cents)`.',
      '5. `ar_advance_rate` and `inventory_advance_rate` SHALL echo the applied rates (supplied or the constants) at the global 4-decimal precision.',
    ],
    constants: [
      { name: 'ABL eligible-A/R advance rate', value: '85% (0.85)', kind: 'cited_median_should', citation: 'ABL market practice — conventional advance rate on eligible accounts receivable (2024)', pin: 'eligible-A/R advance-rate convention', effective: '2024 market practice', nextCheck: 'on next annual ABL market survey', traceValues: [0.85] },
      { name: 'ABL eligible-inventory advance rate', value: '50% (0.50)', kind: 'cited_median_should', citation: 'ABL market practice — conventional advance rate on eligible inventory (2024)', pin: 'eligible-inventory advance-rate convention', effective: '2024 market practice', nextCheck: 'on next annual ABL market survey', traceValues: [0.5] },
    ],
    precisionRule: 'Advance rates are rounded per the global rule (half-even to 4 decimals — see the Conventions chapter); all dollar outputs are exact integer cents.',
    inputs: {
      eligible_ar_cents: { type: 'integer (cents)', desc: 'Eligible accounts receivable in the borrowing base.', unit: 'cents' },
      eligible_inventory_cents: { type: 'integer (cents)', desc: 'Eligible inventory in the borrowing base.', unit: 'cents' },
      ar_advance_rate: { type: 'number', desc: 'Advance rate against eligible A/R as a fraction; defaults to the market-standard rate.', precision: 4 },
      inventory_advance_rate: { type: 'number', desc: 'Advance rate against eligible inventory as a fraction; defaults to the market-standard rate.', precision: 4 },
      reserves_cents: { type: 'integer (cents)', desc: 'Lender reserves deducted from the gross base (default 0).', unit: 'cents' },
      commitment_cents: { type: 'integer (cents)', desc: 'Facility commitment cap; when supplied, availability is capped at it.', unit: 'cents' },
    },
    outputs: {
      eligible_ar_cents: { type: 'integer (cents)', desc: 'Eligible A/R, echoed.', unit: 'cents' },
      eligible_inventory_cents: { type: 'integer (cents)', desc: 'Eligible inventory, echoed.', unit: 'cents' },
      ar_advance_rate: { type: 'number', desc: 'The A/R advance rate applied.', precision: 4 },
      inventory_advance_rate: { type: 'number', desc: 'The inventory advance rate applied.', precision: 4 },
      gross_borrowing_base_cents: { type: 'integer (cents)', desc: 'Advance-rate value of eligible collateral before reserves.', unit: 'cents' },
      reserves_cents: { type: 'integer (cents)', desc: 'Reserves applied, echoed.', unit: 'cents' },
      net_borrowing_base_cents: { type: 'integer (cents)', desc: 'Gross base less reserves, floored at zero.', unit: 'cents' },
      availability_cents: { type: 'integer (cents)', desc: 'Drawable availability after the commitment cap.', unit: 'cents' },
    },
    derivedOutputs: ['gross_borrowing_base_cents', 'net_borrowing_base_cents', 'availability_cents'],
    boundary:
      'This model computes an ABL borrowing base and availability from supplied eligible balances and advance rates. Which receivables and inventory are eligible, the reserves the lender imposes, and the definitions in the credit agreement are the lender\'s determinations; the model applies the arithmetic to the supplied eligible figures and renders no eligibility conclusion.',
    golden: {
      narrative: 'A borrower with $10M eligible A/R and $4M eligible inventory, at standard 85% and 50% advance rates less a $500k reserve, has a $10M net borrowing base — capped to a $9M commitment.',
      input: { eligible_ar_cents: 1_000_000_000, eligible_inventory_cents: 400_000_000, ar_advance_rate: 0.85, inventory_advance_rate: 0.5, reserves_cents: 50_000_000, commitment_cents: 900_000_000 },
    },
  },

  /* ══ M183 — Make-whole / call protection ═════════════════════════════ */
  M183: {
    purpose:
      'Computes a bond or term-loan make-whole redemption price — the present value of remaining coupons and principal discounted at the Treasury rate plus the make-whole spread, floored at par — and compares it to the stated call price to identify the cheaper redemption route. It answers, for an issuer weighing an early redemption, "what does calling this cost under the make-whole versus the stated call, and which is cheaper?" It computes the make-whole arithmetic from supplied terms; the governing indenture language controls.',
    algorithm: [
      'Given `principal_cents`, `coupon_rate`, `treasury_rate`, `spread_bps`, and `remaining_years`, plus optional `call_price_pct` (default 1 = par):',
      '1. If any of the five required inputs is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.',
      '2. The `make_whole_discount_rate` SHALL be `treasury_rate + spread_bps ÷ 10,000` (basis points to a decimal), at the global 4-decimal precision.',
      '3. It SHALL present-value each remaining annual coupon (`principal_cents × coupon_rate`, the final period pro-rated for a fractional year) at the make-whole discount rate, and present-value the principal at that rate over the remaining years.',
      '4. `make_whole_price_cents` SHALL be `max(principal_cents, round(PV of coupons + PV of principal))`; `make_whole_premium_cents` SHALL be `max(0, make_whole_price_cents − principal_cents)`.',
      '5. `stated_call_price_cents` SHALL be `round(principal_cents × call_price_pct)`.',
      '6. `lower_cost_redemption_path` SHALL be `make_whole` when the make-whole price is at or below the stated call price, else `stated_call`.',
    ],
    constants: [],
    precisionRule: 'The discount rate and input rates are rounded per the global rule (half-even to 4 decimals — see the Conventions chapter); all dollar outputs are exact integer cents.',
    inputs: {
      principal_cents: { type: 'integer (cents)', desc: 'Outstanding principal being redeemed.', unit: 'cents' },
      coupon_rate: { type: 'number', desc: 'Annual coupon rate as a fraction (e.g., 0.08).', precision: 4 },
      treasury_rate: { type: 'number', desc: 'Reference Treasury yield as a fraction.', precision: 4 },
      spread_bps: { type: 'number', desc: 'Make-whole spread over Treasury in basis points.' },
      remaining_years: { type: 'number', desc: 'Years remaining to maturity (may be fractional).', unit: 'years' },
      call_price_pct: { type: 'number', desc: 'Stated call price as a fraction of par (default 1 = par).', precision: 4 },
    },
    outputs: {
      principal_cents: { type: 'integer (cents)', desc: 'The principal, echoed.', unit: 'cents' },
      coupon_rate: { type: 'number', desc: 'The coupon rate applied.', precision: 4 },
      treasury_rate: { type: 'number', desc: 'The Treasury rate applied.', precision: 4 },
      spread_bps: { type: 'number', desc: 'The make-whole spread in basis points, echoed.' },
      make_whole_discount_rate: { type: 'number', desc: 'Treasury rate plus the spread, as a decimal.', precision: 4 },
      make_whole_price_cents: { type: 'integer (cents)', desc: 'The make-whole redemption price (PV of coupons and principal, floored at par).', unit: 'cents' },
      make_whole_premium_cents: { type: 'integer (cents)', desc: 'The make-whole premium over par.', unit: 'cents' },
      stated_call_price_cents: { type: 'integer (cents)', desc: 'The stated call price (principal × call price).', unit: 'cents' },
      lower_cost_redemption_path: { type: 'enum', enum: 'redemption_path', desc: 'The cheaper redemption route.' },
    },
    derivedOutputs: ['make_whole_discount_rate', 'make_whole_price_cents', 'make_whole_premium_cents', 'stated_call_price_cents'],
    boundary:
      'This model computes a make-whole redemption price and compares it to the stated call from supplied rate and maturity facts. The exact make-whole formula, the reference security, the day-count, and the redemption conditions are set by the indenture or credit agreement and control over this approximation; the model produces the comparison and the drafting language remains counsel\'s.',
    golden: {
      narrative: 'A $50M 8% note five years from maturity, redeemed against a 4% Treasury plus 50 basis points: the make-whole price of roughly $57.7M exceeds the 103 stated call ($51.5M), so the stated call is the cheaper route.',
      input: { principal_cents: 5_000_000_000, coupon_rate: 0.08, treasury_rate: 0.04, spread_bps: 50, remaining_years: 5, call_price_pct: 1.03 },
    },
  },

  /* ══ M184 — Covenant basket engine ═══════════════════════════════════ */
  M184: {
    purpose:
      'Computes the capacity of each negotiated covenant basket — fixed plus grower plus builder plus ratio capacity, less amounts used — and tests whether a proposed use fits, aggregating remaining capacity and counting blocked baskets. It answers, for a borrower or lender working a credit agreement, "how much restricted-payment, debt, lien, or investment capacity is left, and does the proposed action fit?" It totals capacity from supplied basket terms; whether a specific action qualifies under a basket is a credit-agreement construction question.',
    algorithm: [
      'Given `baskets` (a list of basket objects, each with fixed/grower/builder/ratio capacity, amount used, and a proposed use):',
      '1. If `baskets` is empty, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.',
      '2. For each basket, `total_capacity_cents` SHALL be `fixed_capacity + round(grower_basis × grower_pct) + builder_amount + ratio_capacity` (each defaulting to zero when omitted).',
      '3. `remaining_capacity_cents` SHALL be `total_capacity_cents − used_cents`; `proposed_use_fits` SHALL be true iff `proposed_use_cents ≤ remaining_capacity_cents`.',
      '4. `basket_count` SHALL be the number of baskets; `aggregate_remaining_capacity_cents` SHALL be the sum of the per-basket remaining capacities.',
      '5. `blocked_basket_count` SHALL be the number of baskets whose proposed use does not fit.',
    ],
    constants: [],
    precisionRule: 'All capacity outputs are exact integer cents (see the Conventions chapter); no rounding beyond the grower-capacity product.',
    inputs: {
      baskets: { type: 'object[]', desc: 'Covenant baskets; each object carries `name`/`type` (strings) and integer-cents `fixed_capacity_cents` (or `opening_capacity_cents`), `grower_basis_cents`, `builder_amount_cents`, `ratio_capacity_cents`, `used_cents`, and `proposed_use_cents`, plus a `grower_pct` (number).' },
    },
    outputs: {
      basket_count: { type: 'integer', desc: 'Number of baskets evaluated.' },
      aggregate_remaining_capacity_cents: { type: 'integer (cents)', desc: 'Sum of remaining capacity across all baskets.', unit: 'cents' },
      blocked_basket_count: { type: 'integer', desc: 'Number of baskets whose proposed use exceeds remaining capacity.' },
      baskets: { type: 'object[]', desc: 'Per-basket result: `{ name, basket_type, total_capacity_cents, used_cents, remaining_capacity_cents, proposed_use_cents, proposed_use_fits }`.' },
    },
    derivedOutputs: ['basket_count', 'aggregate_remaining_capacity_cents', 'blocked_basket_count', 'baskets'],
    boundary:
      'This model totals covenant-basket capacity and tests proposed uses from supplied basket terms. Whether a specific payment, debt, lien, or investment qualifies under a given basket, how the grower and builder amounts are defined, and the ratio-capacity mechanics are credit-agreement construction questions for counsel; the model computes the capacity arithmetic and renders no qualification opinion.',
    golden: {
      narrative: 'Two baskets: a restricted-payments basket with $18M of capacity ($16M free) that accommodates a $10M dividend, and a permitted-debt basket with $11M free that cannot absorb a proposed $20M draw — one basket blocked, $27M free in aggregate.',
      input: { baskets: [ { name: 'Restricted Payments', type: 'restricted_payments', fixed_capacity_cents: 500_000_000, grower_basis_cents: 2_000_000_000, grower_pct: 0.5, builder_amount_cents: 300_000_000, used_cents: 200_000_000, proposed_use_cents: 1_000_000_000 }, { name: 'Permitted Debt', type: 'debt', fixed_capacity_cents: 1_000_000_000, ratio_capacity_cents: 500_000_000, used_cents: 400_000_000, proposed_use_cents: 2_000_000_000 } ] },
    },
  },

  /* ══ SECONDARIES FAMILY — fund-interest transfers (M177, M178) ═══════ */

  /* ══ M177 — LP-secondary + §1446(f) ECI withholding ══════════════════ */
  M177: {
    purpose:
      'Screens a limited-partnership secondary sale for the §1446(f) 10% withholding that applies when a foreign partner transfers a partnership interest, computes the default withholding, and flags the purchase-and-sale-agreement and tri-party transfer mechanics. It answers, for a secondary buyer or seller, "does this LP transfer trigger ECI withholding, and how much?" It computes the default withholding from the price; the withholding-certificate exception and the ECI determination are the tax specialist\'s.',
    algorithm: [
      'Given `purchase_price_cents` and `seller_foreign_person`, plus optional `withholding_certificate_provided` (default false) and `eci_gain_cents`:',
      '1. If either required input is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.',
      '2. `section_1446f_default_withholding_cents` SHALL be `round(purchase_price_cents × the §1446(f) default withholding rate)` when the seller is a foreign person and no withholding certificate is provided, else 0 (constants: §1446(f) default withholding rate).',
      '3. `psa_required` and `tri_party_transfer_required` SHALL always be true — the transfer runs through a purchase-and-sale agreement and a tri-party (buyer, seller, fund) transfer.',
      '4. `tax_specialist_handoff_required` SHALL be true iff the seller is a foreign person.',
      '5. The model SHALL echo the price, the foreign-person flag, the certificate flag, and any supplied ECI gain.',
    ],
    constants: [
      { name: '§1446(f) default withholding rate', value: '10%', kind: 'statutory_must', citation: 'IRC § 1446(f)', pin: '§ 1446(f)(1) (10% of amount realized)', effective: 'current (IRC as amended)', nextCheck: 'on IRC amendment', traceValues: [0.1] },
    ],
    precisionRule: 'The withholding amount is exact integer cents (see the Conventions chapter); no rounding of ratios.',
    inputs: {
      purchase_price_cents: { type: 'integer (cents)', desc: 'The price paid for the transferred partnership interest.', unit: 'cents' },
      seller_foreign_person: { type: 'boolean', desc: 'Whether the transferring partner is a foreign person (the §1446(f) trigger).' },
      withholding_certificate_provided: { type: 'boolean', desc: 'Whether a §1446(f) withholding certificate/exception is provided (default false).' },
      eci_gain_cents: { type: 'integer (cents)', desc: 'Estimated effectively-connected gain on the transfer; optional context.', unit: 'cents' },
    },
    outputs: {
      purchase_price_cents: { type: 'integer (cents)', desc: 'The purchase price, echoed.', unit: 'cents' },
      seller_foreign_person: { type: 'boolean', desc: 'The foreign-person flag, echoed.' },
      withholding_certificate_provided: { type: 'boolean', desc: 'The certificate flag, echoed.' },
      section_1446f_default_withholding_cents: { type: 'integer (cents)', desc: 'The default 10% §1446(f) withholding, or 0 when not triggered.', unit: 'cents' },
      eci_gain_cents: { type: 'integer (cents) | null', desc: 'The supplied ECI gain, echoed, or null.', unit: 'cents' },
      psa_required: { type: 'boolean', desc: 'Always true — a purchase-and-sale agreement papers the transfer.' },
      tri_party_transfer_required: { type: 'boolean', desc: 'Always true — the transfer is executed tri-party with the fund.' },
      tax_specialist_handoff_required: { type: 'boolean', desc: 'True when the seller is a foreign person.' },
    },
    derivedOutputs: ['section_1446f_default_withholding_cents'],
    boundary:
      'This model screens an LP secondary for §1446(f) withholding and computes the 10% default from the price. Whether the seller is in fact a foreign person, whether a withholding certificate or exception applies, and the effectively-connected-income determination are tax determinations for a tax specialist; on a foreign-seller transfer the model routes them (tax_specialist_handoff_required) and renders no withholding opinion beyond the default arithmetic.',
    golden: {
      narrative: 'A foreign LP sells its fund interest for $20M with no withholding certificate on file; §1446(f) requires the buyer to withhold 10% — $2M — pending the tax specialist\'s ECI analysis.',
      input: { purchase_price_cents: 2_000_000_000, seller_foreign_person: true, withholding_certificate_provided: false, eci_gain_cents: 300_000_000 },
    },
  },

  /* ══ M178 — Strip-sale pricing ═══════════════════════════════════════ */
  M178: {
    purpose:
      'Prices a strip sale of a fund or portfolio — the NAV sold and retained at the strip percentage, the total value implied by the strip price, and the discount or premium to NAV. It answers, for a GP or LP running a strip sale, "how much NAV are we selling, what total value does the strip price imply, and at what discount to NAV?" It computes the pricing arithmetic from the supplied NAV, strip percentage, and sale price.',
    algorithm: [
      'Given `fund_nav_cents`, `strip_percentage` (a fraction), and `sale_price_cents`:',
      '1. If any of the three is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.',
      '2. `sold_nav_cents` SHALL be `round(fund_nav_cents × strip_percentage)`; `retained_nav_cents` SHALL be `fund_nav_cents − sold_nav_cents`.',
      '3. `implied_total_value_cents` SHALL be `round(sale_price_cents ÷ strip_percentage)` when the strip percentage is positive, else 0.',
      '4. `discount_to_nav_pct` SHALL be `1 − (implied_total_value_cents ÷ fund_nav_cents)` when NAV is positive, else null, at the global 4-decimal precision (a positive value is a discount, a negative value a premium).',
      '5. `strip_percentage` SHALL echo at 4 decimals.',
    ],
    constants: [],
    precisionRule: 'Monetary outputs are exact integer cents; the strip percentage and discount are rounded per the global rule (half-even to 4 decimals — see the Conventions chapter).',
    inputs: {
      fund_nav_cents: { type: 'integer (cents)', desc: 'Total net asset value of the fund or portfolio.', unit: 'cents' },
      strip_percentage: { type: 'number', desc: 'Fraction of the NAV sold in the strip (0–1).', precision: 4 },
      sale_price_cents: { type: 'integer (cents)', desc: 'Price paid for the strip.', unit: 'cents' },
    },
    outputs: {
      fund_nav_cents: { type: 'integer (cents)', desc: 'The fund NAV, echoed.', unit: 'cents' },
      strip_percentage: { type: 'number', desc: 'The strip percentage applied.', precision: 4 },
      sold_nav_cents: { type: 'integer (cents)', desc: 'NAV sold in the strip.', unit: 'cents' },
      retained_nav_cents: { type: 'integer (cents)', desc: 'NAV retained after the strip.', unit: 'cents' },
      sale_price_cents: { type: 'integer (cents)', desc: 'The strip sale price, echoed.', unit: 'cents' },
      implied_total_value_cents: { type: 'integer (cents)', desc: 'Total fund value the strip price implies (price ÷ strip).', unit: 'cents' },
      discount_to_nav_pct: { type: 'number | null', desc: 'Discount (positive) or premium (negative) to NAV, or null when NAV is non-positive.', precision: 4 },
    },
    derivedOutputs: ['sold_nav_cents', 'retained_nav_cents', 'implied_total_value_cents', 'discount_to_nav_pct'],
    boundary:
      'This model prices a strip sale from supplied NAV, strip percentage, and sale price. Whether the NAV is correctly struck, the fairness of the strip price, and the LP/GP consent and tax mechanics are determinations for the fund\'s valuation process, its advisers, and counsel; the model computes the implied value and discount and renders no valuation.',
    golden: {
      narrative: 'A 30% strip of a $100M-NAV fund sells for $27M, implying a $90M total value — a 10% discount to NAV; $30M of NAV is sold and $70M retained.',
      input: { fund_nav_cents: 10_000_000_000, strip_percentage: 0.30, sale_price_cents: 2_700_000_000 },
    },
  },

  /* ══ IP FAMILY — chain-of-title, encumbrance, license, and transfer ══ */

  /* ══ M214 — IP chain-of-title verification ═══════════════════════════ */
  M214: {
    purpose:
      'Walks each supplied IP asset\'s assignment chain and flags the four failure modes that break clean title — a broken or unmatched assignment, a late-recorded assignment, incomplete contributor assignments, and an intent-to-use trademark assigned before an allegation of use. It answers, in IP diligence, "does the target actually own what it says it owns, and where are the gaps?" It spots and counts the issues from supplied chain facts; the ownership and validity conclusions are counsel\'s.',
    algorithm: [
      'Given `assets` (a list of IP-asset objects, each carrying a type, an assignment count, and the chain booleans):',
      '1. If `assets` is empty, the implementation SHALL return `status: "needs_inputs"` naming `assets`.',
      '2. For each asset it SHALL set `assignment_gap` true iff the assignment count is not positive OR the current owner does not match; `late_recording_flag` true iff there is at least one assignment but it was not recorded within three months; `contributor_gap` true iff contributor assignments are not complete; and `itu_assignment_risk` true iff the asset is a trademark and an intent-to-use mark was assigned before an allegation of use.',
      '3. It SHALL count assets by type (patent, trademark, copyright) and count each flag across the assets.',
      '4. `counsel_review_required` SHALL be true iff any asset raises any of the four flags.',
      '5. It SHALL return the full per-asset chain detail.',
    ],
    constants: [],
    precisionRule: 'All outputs are counts and booleans (see the Conventions chapter); no rounding.',
    inputs: {
      assets: { type: 'object[]', desc: 'IP assets under diligence; each object carries `name` (string), `type` (string, e.g. patent/trademark/copyright), `assignment_count` (integer), `current_owner_matches` (boolean), `recorded_within_three_months` (boolean), `contributor_assignments_complete` (boolean), and, for trademarks, `itu_assigned_after_allegation_of_use` (boolean).' },
    },
    outputs: {
      ip_asset_count: { type: 'integer', desc: 'Number of IP assets examined.' },
      patent_asset_count: { type: 'integer', desc: 'Number typed as patents.' },
      trademark_asset_count: { type: 'integer', desc: 'Number typed as trademarks.' },
      copyright_asset_count: { type: 'integer', desc: 'Number typed as copyrights.' },
      assignment_gap_count: { type: 'integer', desc: 'Number with a broken or unmatched assignment chain.' },
      late_recording_count: { type: 'integer', desc: 'Number with an assignment not recorded within three months.' },
      contributor_assignment_gap_count: { type: 'integer', desc: 'Number with incomplete contributor assignments.' },
      itu_assignment_risk_count: { type: 'integer', desc: 'Number of trademarks with intent-to-use assignment risk.' },
      counsel_review_required: { type: 'boolean', desc: 'Whether any asset raises a chain-of-title flag.' },
      chain_rows: { type: 'object[]', desc: 'Per-asset detail: `{ name, type, assignment_count, current_owner_matches, recorded_within_three_months, contributor_assignments_complete, assignment_gap, late_recording_flag, contributor_gap, itu_assignment_risk }`.' },
    },
    derivedOutputs: ['ip_asset_count', 'patent_asset_count', 'trademark_asset_count', 'copyright_asset_count', 'assignment_gap_count', 'late_recording_count', 'contributor_assignment_gap_count', 'itu_assignment_risk_count', 'chain_rows'],
    boundary:
      'This model spots and counts chain-of-title gaps from supplied assignment facts. Whether title in fact passed, whether a late recording is curable, and whether an intent-to-use assignment is void are legal determinations for IP counsel; the model surfaces the gaps and routes them (counsel_review_required) and renders no ownership conclusion.',
    golden: {
      narrative: 'Three IP assets in a software deal: the core patent\'s chain is clean, the wordmark was recorded late, and the source-code copyrights are missing contributor assignments — two flags plus the trademark route to counsel.',
      input: { assets: [ { name: 'Core platform patent', type: 'patent', assignment_count: 2, current_owner_matches: true, recorded_within_three_months: true, contributor_assignments_complete: true }, { name: 'Company wordmark', type: 'trademark', assignment_count: 1, current_owner_matches: true, recorded_within_three_months: false, contributor_assignments_complete: true, itu_assigned_after_allegation_of_use: false }, { name: 'Product source code', type: 'copyright', assignment_count: 1, current_owner_matches: true, recorded_within_three_months: true, contributor_assignments_complete: false } ] },
    },
  },

  /* ══ M215 — IP encumbrance & lien search ═════════════════════════════ */
  M215: {
    purpose:
      'Tallies the hits across the three IP lien-search tracks — UCC financing statements, USPTO patent/trademark security records, and Copyright Office recordations — and flags which hits still need a release before closing. It answers, in secured-financing and acquisition diligence, "is the IP pledged anywhere, and what has to be released to deliver clean collateral?" It counts hits and release requirements from supplied search results; the priority and enforceability conclusions are counsel\'s.',
    algorithm: [
      'Given `searches` (a list of search-result objects, each with a track, a hit count, and whether a release was obtained):',
      '1. If `searches` is empty, the implementation SHALL return `status: "needs_inputs"` naming `searches`.',
      '2. For each search it SHALL normalize the track to `ucc`, `uspto`, or `copyright` (constants: none — track vocabulary), take the hit count (a boolean hit counting as one), and set `release_required` true iff there is at least one hit and no release was obtained.',
      '3. It SHALL sum hits per track and sum the open (release-required) hits across all searches.',
      '4. `release_required_count` SHALL be the number of searches needing a release; `pass_through_search_source_required` SHALL always be true — the underlying search is a pass-through record pull.',
      '5. It SHALL return the full per-search detail.',
    ],
    constants: [],
    precisionRule: 'All outputs are counts and booleans (see the Conventions chapter); no rounding.',
    inputs: {
      searches: { type: 'object[]', desc: 'Lien-search results; each object carries `name`/`jurisdiction` (string), `track` (a lien_search_track value), `hit_count` (integer) or `hit_found` (boolean), `release_obtained` (boolean), and `source` (string).' },
    },
    outputs: {
      search_track_count: { type: 'integer', desc: 'Number of search rows.' },
      ucc_lien_hit_count: { type: 'integer', desc: 'Total UCC-track hits.' },
      uspto_security_hit_count: { type: 'integer', desc: 'Total USPTO-track security hits.' },
      copyright_security_hit_count: { type: 'integer', desc: 'Total Copyright-Office-track hits.' },
      open_lien_count: { type: 'integer', desc: 'Total hits still lacking a release.' },
      release_required_count: { type: 'integer', desc: 'Number of searches whose hits require a release.' },
      pass_through_search_source_required: { type: 'boolean', desc: 'Always true — the search itself is a pass-through record pull.' },
      lien_search_rows: { type: 'object[]', desc: 'Per-search detail: `{ search, track (a lien_search_track value), hit_count, release_obtained, release_required, pass_through_search_source }`.' },
    },
    derivedOutputs: ['search_track_count', 'ucc_lien_hit_count', 'uspto_security_hit_count', 'copyright_security_hit_count', 'open_lien_count', 'release_required_count', 'lien_search_rows'],
    boundary:
      'This model tallies IP lien-search hits and release requirements from supplied results. Lien priority, whether a filing in fact encumbers the IP, and whether a release is legally effective are determinations for counsel and the searcher; the model normalizes the hit counts and routes the release requirements and renders no priority opinion.',
    golden: {
      narrative: 'Three lien-search tracks: a Delaware UCC financing statement with an open lien needs a release, the USPTO patent-security search is clean, and the Copyright Office hit already has a recorded release.',
      input: { searches: [ { name: 'DE UCC search', track: 'ucc', hit_count: 1, release_obtained: false, source: 'CSC' }, { name: 'USPTO patent security', track: 'uspto', hit_count: 0, source: 'USPTO Assignment Search' }, { name: 'Copyright Office recordation', track: 'copyright', hit_count: 1, release_obtained: true, source: 'US Copyright Office' } ] },
    },
  },

  /* ══ M216 — License in/out dependency map ════════════════════════════ */
  M216: {
    purpose:
      'Maps the target\'s material in- and out-bound license portfolio — direction, scope, exclusivity, royalty, change-of-control consent and termination, and sublicensing — and flags inbound licenses whose terms make them a deal-critical dependency. It answers, in IP diligence, "which licenses does the business depend on, and which of those could a change of control break?" It captures and flags from supplied license terms; whether a clause is in fact triggered is counsel\'s call.',
    algorithm: [
      'Given `licenses` (a list of license objects, each with direction, scope, exclusivity, royalty, and the change-of-control/sublicensing booleans):',
      '1. If `licenses` is empty, the implementation SHALL return `status: "needs_inputs"` naming `licenses`.',
      '2. For each license it SHALL normalize direction to `inbound` or `outbound`, take the annual royalty in cents, and set `material_dependency_flag` true iff the license is inbound AND (change-of-control consent is required OR it terminates on change of control OR sublicensing is not allowed).',
      '3. It SHALL count licenses, inbound and outbound licenses, change-of-control-consent and termination licenses, and material dependencies.',
      '4. `annual_royalty_cents` SHALL be the sum of the per-license annual royalties.',
      '5. It SHALL return the full per-license detail.',
    ],
    constants: [],
    precisionRule: 'Royalties are exact integer cents; the rest are counts and booleans (see the Conventions chapter).',
    inputs: {
      licenses: { type: 'object[]', desc: 'Material licenses; each object carries `name` (string), `direction` (a license_direction value), `scope` (string), `exclusive` (boolean), `annual_royalty_cents` (integer cents), `change_of_control_consent_required` (boolean), `terminates_on_change_of_control` (boolean), and `sublicensing_allowed` (boolean).' },
    },
    outputs: {
      license_count: { type: 'integer', desc: 'Number of licenses mapped.' },
      inbound_license_count: { type: 'integer', desc: 'Number of inbound (taken-in) licenses.' },
      outbound_license_count: { type: 'integer', desc: 'Number of outbound (granted-out) licenses.' },
      annual_royalty_cents: { type: 'integer (cents)', desc: 'Total annual royalty across all licenses.', unit: 'cents' },
      change_of_control_consent_required_count: { type: 'integer', desc: 'Number requiring change-of-control consent.' },
      terminates_on_change_of_control_count: { type: 'integer', desc: 'Number that terminate on change of control.' },
      material_dependency_count: { type: 'integer', desc: 'Number of inbound licenses flagged deal-critical.' },
      license_rows: { type: 'object[]', desc: 'Per-license detail: `{ name, direction (a license_direction value), scope, exclusive, annual_royalty_cents, change_of_control_consent_required, terminates_on_change_of_control, sublicensing_allowed, material_dependency_flag }`.' },
    },
    derivedOutputs: ['license_count', 'inbound_license_count', 'outbound_license_count', 'annual_royalty_cents', 'change_of_control_consent_required_count', 'terminates_on_change_of_control_count', 'material_dependency_count', 'license_rows'],
    boundary:
      'This model maps the license portfolio and flags material inbound dependencies from supplied terms. Whether a change-of-control clause is in fact triggered by the deal structure, and how a consent or termination right applies, are determinations for counsel; the model captures the terms and flags the dependencies and renders no enforceability conclusion.',
    golden: {
      narrative: 'Two licenses: an inbound database-engine license that requires consent and terminates on change of control is a material dependency; the outbound reseller license is not.',
      input: { licenses: [ { name: 'Core DB engine license', direction: 'inbound', scope: 'worldwide', exclusive: false, annual_royalty_cents: 12_000_000, change_of_control_consent_required: true, terminates_on_change_of_control: true, sublicensing_allowed: false }, { name: 'Reseller OEM license', direction: 'outbound', scope: 'north_america', exclusive: false, annual_royalty_cents: 5_000_000, sublicensing_allowed: true } ] },
    },
  },

  /* ══ M217 — Standard IP representation set ═══════════════════════════ */
  M217: {
    purpose:
      'Assembles the IP representation-and-warranty set a purchase agreement needs, scaling the base reps (ownership, no-encumbrances, sufficiency, registered-IP and license schedules) with patent-, trademark-, and software-specific reps when those categories are material. It answers, for counsel drafting the agreement, "which IP reps and schedules does this deal require given what IP is material?" It builds the checklist; the drafting and the enforceability opinion are counsel\'s.',
    algorithm: [
      'Given `deal_type` and `material_ip_categories` (a list of category strings):',
      '1. If `deal_type` is missing or `material_ip_categories` is empty, the implementation SHALL return `status: "needs_inputs"` naming the missing fields.',
      '2. It SHALL detect software (source/code/oss/saas), patent (patent/life-science/device), and trademark (trademark/brand/domain) materiality from the categories.',
      '3. It SHALL start from the five base reps (ownership, no-encumbrances, sufficiency, registered-IP schedule, license schedule) and append a limited-validity patent schedule when patents are material, a trademark/domain schedule when trademarks are material, and OSS-compliance and source-code-control reps when software is material.',
      '4. `representation_count` and `schedule_count` (reps whose name includes "schedule") SHALL be counted; `includes_oss_rep` and `includes_sufficiency_rep` SHALL be reported.',
      '5. `enforceability_opinion_pass_through` and `counsel_drafting_required` SHALL always be true.',
    ],
    constants: [],
    precisionRule: 'All outputs are counts, booleans, and a rep-name list (see the Conventions chapter); no rounding.',
    inputs: {
      deal_type: { type: 'string', desc: 'The transaction type (e.g., asset_purchase, stock_purchase, merger).' },
      material_ip_categories: { type: 'string[]', desc: 'The IP categories material to the deal (e.g., software, patents, trademarks); drive the category-specific reps.' },
    },
    outputs: {
      deal_type: { type: 'string', desc: 'The deal type, echoed.' },
      material_ip_category_count: { type: 'integer', desc: 'Number of material IP categories supplied.' },
      representation_count: { type: 'integer', desc: 'Number of representations in the assembled set.' },
      schedule_count: { type: 'integer', desc: 'Number of reps that carry a disclosure schedule.' },
      includes_oss_rep: { type: 'boolean', desc: 'Whether the set includes the OSS-compliance rep.' },
      includes_sufficiency_rep: { type: 'boolean', desc: 'Whether the set includes the IP-sufficiency rep.' },
      enforceability_opinion_pass_through: { type: 'boolean', desc: 'Always true — any enforceability opinion is a pass-through to counsel.' },
      counsel_drafting_required: { type: 'boolean', desc: 'Always true — the reps are drafted by counsel.' },
      representation_set: { type: 'string[]', desc: 'The assembled representation identifiers.' },
    },
    derivedOutputs: ['material_ip_category_count', 'representation_count', 'schedule_count'],
    boundary:
      'This model assembles the IP representation checklist scaled to the material IP categories. The drafting of each representation, the disclosure schedules, and any enforceability or non-infringement opinion are counsel\'s work; the model produces the checklist and routes the drafting (counsel_drafting_required) and drafts no operative language.',
    golden: {
      narrative: 'An asset purchase covering software, patents, and trademarks generates a nine-representation IP set with four schedules, including the OSS-compliance and source-code-control reps software deals require.',
      input: { deal_type: 'asset_purchase', material_ip_categories: ['software', 'patents', 'trademarks'] },
    },
  },

  /* ══ M218 — Carve-out & license-back mechanics ═══════════════════════ */
  M218: {
    purpose:
      'Organizes the IP disposition map of a carve-out — which assets are assigned to the buyer, which are licensed to the buyer, and which are licensed back to the seller — and flags when a transition license triggers a TSA-IP overlay. It answers, in a carve-out, "who ends up owning or licensing each IP asset, and does the separation need a transition-services IP schedule?" It organizes the dispositions; the drafting is counsel\'s.',
    algorithm: [
      'Given `ip_assets` (a list of asset objects, each with a disposition and an optional transition-license term) and optional `tsa_ip_overlay_required` (default false):',
      '1. If `ip_assets` is empty, the implementation SHALL return `status: "needs_inputs"` naming `ip_assets`.',
      '2. For each asset it SHALL read the disposition (default `assigned_to_buyer`), set `assigned_to_buyer`/`licensed_to_buyer` from it, set `licensed_back_to_seller` from the explicit flag or a `license_back_to_seller` disposition, and take the transition-license months.',
      '3. It SHALL count assets, assigned-to-buyer, licensed-to-buyer, licensed-back-to-seller, and transition-license assets (months > 0).',
      '4. `tsa_ip_overlay_required` SHALL be true iff the input flag is set OR any asset carries a positive transition-license term.',
      '5. `counsel_drafting_handoff_required` SHALL always be true.',
    ],
    constants: [],
    precisionRule: 'Outputs are counts, month terms, and booleans (see the Conventions chapter); no rounding.',
    inputs: {
      ip_assets: { type: 'object[]', desc: 'Carve-out IP assets; each object carries `asset_name` (string), `disposition` (string, e.g. assigned_to_buyer/licensed_to_buyer/license_back_to_seller), `licensed_back_to_seller` (boolean), and `transition_license_months` (integer).' },
      tsa_ip_overlay_required: { type: 'boolean', desc: 'Whether a TSA-IP overlay is already required (default false); the model also sets it true on any transition license.' },
    },
    outputs: {
      asset_count: { type: 'integer', desc: 'Number of IP assets in the carve-out.' },
      assigned_to_buyer_count: { type: 'integer', desc: 'Number assigned outright to the buyer.' },
      licensed_to_buyer_count: { type: 'integer', desc: 'Number licensed to the buyer.' },
      licensed_back_to_seller_count: { type: 'integer', desc: 'Number licensed back to the seller.' },
      transition_license_count: { type: 'integer', desc: 'Number carrying a transition license (positive term).' },
      tsa_ip_overlay_required: { type: 'boolean', desc: 'Whether a transition-services IP overlay is required.' },
      counsel_drafting_handoff_required: { type: 'boolean', desc: 'Always true — the assignment and license documents are drafted by counsel.' },
      asset_rows: { type: 'object[]', desc: 'Per-asset detail: `{ asset_name, disposition, assigned_to_buyer, licensed_to_buyer, licensed_back_to_seller, transition_license_months }`.' },
    },
    derivedOutputs: ['asset_count', 'assigned_to_buyer_count', 'licensed_to_buyer_count', 'licensed_back_to_seller_count', 'transition_license_count', 'asset_rows'],
    boundary:
      'This model organizes the carve-out IP disposition map and flags the TSA-IP overlay from supplied dispositions. The assignment and license agreements, the license-back scope, and the transition-services terms are drafted by counsel; the model organizes the map and routes the drafting (counsel_drafting_handoff_required) and drafts no operative language.',
    golden: {
      narrative: 'A carve-out assigning the divested product IP to the buyer with a six-month transition license, licensing shared platform IP, and licensing the parent brand back to the seller — the transition license triggers the TSA-IP overlay.',
      input: { ip_assets: [ { asset_name: 'Divested product IP', disposition: 'assigned_to_buyer', transition_license_months: 6 }, { asset_name: 'Shared platform IP', disposition: 'licensed_to_buyer' }, { asset_name: 'Parent brand', disposition: 'license_back_to_seller', licensed_back_to_seller: true } ], tsa_ip_overlay_required: false },
    },
  },

  /* ══ M219 — Source-code & IP escrow mechanics ════════════════════════ */
  M219: {
    purpose:
      'Structures a source-code escrow — the release triggers, the deposit-verification tier, and the deposit-update cadence — and dates the next deposit from the last one. It answers, in software diligence, "on what events does the code release, how deeply was the deposit verified, and when is the next update due?" It organizes the escrow schedule from supplied facts; the escrow agreement itself is counsel\'s and the escrow agent\'s.',
    algorithm: [
      'Given `release_triggers` (a list of trigger strings) and `deposit_verification_tier`, plus optional `last_deposit_date` and `update_frequency_months` (default 3):',
      '1. If `release_triggers` is empty or `deposit_verification_tier` is missing, the implementation SHALL return `status: "needs_inputs"` naming the missing fields.',
      '2. It SHALL normalize the verification tier to a lower-case token and set `build_verified` iff the tier mentions build/run/tested and `run_tested` iff it mentions run/tested.',
      '3. `release_trigger_count` SHALL be the number of triggers.',
      '4. When a last-deposit date is supplied, `next_deposit_due_date` SHALL be that date advanced by the update frequency in months; otherwise null.',
      '5. It SHALL echo the triggers, the normalized tier, the update frequency, and the last-deposit date.',
    ],
    constants: [],
    precisionRule: 'The update cadence is whole months; dates are ISO-8601 (see the Conventions chapter).',
    inputs: {
      release_triggers: { type: 'string[]', desc: 'The events that release the deposit (e.g., bankruptcy, material breach, support discontinuation).' },
      deposit_verification_tier: { type: 'string', desc: 'How deeply the deposit was verified (e.g., inventory-only, build-verified, build-and-run-tested).' },
      last_deposit_date: { type: 'string (ISO date)', desc: 'Date of the most recent deposit; drives the next-due date.' },
      update_frequency_months: { type: 'integer', desc: 'Deposit-update cadence in months (default 3, i.e. quarterly).', unit: 'months' },
    },
    outputs: {
      release_trigger_count: { type: 'integer', desc: 'Number of release triggers.' },
      release_triggers: { type: 'string[]', desc: 'The release triggers, echoed.' },
      deposit_verification_tier: { type: 'string', desc: 'The normalized verification tier.' },
      build_verified: { type: 'boolean', desc: 'Whether the deposit was at least build-verified.' },
      run_tested: { type: 'boolean', desc: 'Whether the deposit was run-tested.' },
      update_frequency_months: { type: 'integer', desc: 'The deposit-update cadence in months.', unit: 'months' },
      last_deposit_date: { type: 'string (ISO date) | null', desc: 'The last-deposit date, echoed, or null.' },
      next_deposit_due_date: { type: 'string (ISO date) | null', desc: 'The next deposit due date, or null when no last-deposit date is supplied.' },
    },
    derivedOutputs: ['release_trigger_count', 'update_frequency_months'],
    boundary:
      'This model structures the source-code escrow schedule from supplied triggers, tier, and cadence. The enforceability of the release conditions, the adequacy of the verification, and the escrow-agreement terms are for counsel and the escrow agent; the model organizes the schedule and dates the next deposit and renders no enforceability conclusion.',
    golden: {
      narrative: 'A source-code escrow with three release triggers, verified at the build-and-run-tested tier, with quarterly deposits — the January 15 deposit sets the next due date at April 15.',
      input: { release_triggers: ['bankruptcy', 'material_breach', 'support_discontinuation'], deposit_verification_tier: 'build and run tested', last_deposit_date: '2026-01-15', update_frequency_months: 3 },
    },
  },

  /* ══ M220 — Employee IP assignment verification ══════════════════════ */
  M220: {
    purpose:
      'Verifies, contributor by contributor, that every person who touched the IP executed an assignment and a work-for-hire, and flags California §2870 outside-scope carve-outs and any missing paper. It answers, in IP diligence, "is the IP actually assigned in from everyone who built it, and where are the enforceability wrinkles?" It counts and flags from supplied contributor facts; the enforceability conclusion, including the §2870 carve-out, is counsel\'s.',
    algorithm: [
      'Given `contributors` (a list of contributor objects, each with a state and the assignment/work-for-hire booleans):',
      '1. If `contributors` is empty, the implementation SHALL return `status: "needs_inputs"` naming `contributors`.',
      '2. For each contributor it SHALL set `missing_assignment` iff no IP assignment was executed, `missing_work_for_hire` iff no work-for-hire was executed, and `california_2870_carveout_flag` iff the work state is CA and the contributor claims an outside-scope invention (constants: California Labor Code § 2870).',
      '3. It SHALL count contributors, executed assignments, missing assignments, missing work-for-hires, and California §2870 carve-outs.',
      '4. `all_contributors_papered` SHALL be true iff no contributor is missing either the assignment or the work-for-hire.',
      '5. `counsel_review_required` SHALL be true iff any contributor has a missing assignment, a missing work-for-hire, or a §2870 carve-out flag.',
    ],
    constants: [
      { name: 'California Labor Code § 2870', value: 'employee inventions developed entirely on own time without employer resources and unrelated to employer business are not assignable', kind: 'statutory_must', citation: 'Cal. Lab. Code § 2870', pin: '§ 2870(a)', effective: 'current (Cal. Lab. Code as amended)', nextCheck: 'on statutory amendment' },
    ],
    precisionRule: 'All outputs are counts and booleans (see the Conventions chapter); no rounding.',
    inputs: {
      contributors: { type: 'object[]', desc: 'IP contributors; each object carries `name` (string), `role` (string), `state`/`work_state` (US state code), `ip_assignment_executed` (boolean), `work_for_hire_executed` (boolean), and `outside_scope_invention` (boolean).' },
    },
    outputs: {
      contributor_count: { type: 'integer', desc: 'Number of contributors verified.' },
      executed_assignment_count: { type: 'integer', desc: 'Number with an executed IP assignment.' },
      missing_assignment_count: { type: 'integer', desc: 'Number missing an IP assignment.' },
      missing_work_for_hire_count: { type: 'integer', desc: 'Number missing a work-for-hire.' },
      california_2870_carveout_count: { type: 'integer', desc: 'Number with a California §2870 outside-scope carve-out flag.' },
      all_contributors_papered: { type: 'boolean', desc: 'Whether every contributor has both the assignment and the work-for-hire.' },
      counsel_review_required: { type: 'boolean', desc: 'Whether any contributor raises a gap or §2870 flag.' },
      contributor_rows: { type: 'object[]', desc: 'Per-contributor detail: `{ contributor, role, state, ip_assignment_executed, work_for_hire_executed, missing_assignment, missing_work_for_hire, california_2870_carveout_flag }`.' },
    },
    derivedOutputs: ['contributor_count', 'executed_assignment_count', 'missing_assignment_count', 'missing_work_for_hire_count', 'california_2870_carveout_count'],
    boundary:
      'This model verifies contributor IP assignments and flags §2870 carve-outs from supplied facts. Whether an assignment is enforceable, whether the §2870 carve-out in fact applies, and whether a work-for-hire is valid for the work type are legal determinations for counsel; the model counts the gaps and routes them (counsel_review_required) and renders no enforceability conclusion.',
    golden: {
      narrative: 'Three contributors: one California engineer fully papered, a California contractor missing both the assignment and the work-for-hire with a §2870 outside-scope flag, and a New York designer missing the work-for-hire — one §2870 carve-out and open assignments route to counsel.',
      input: { contributors: [ { name: 'Engineer A', role: 'senior_engineer', state: 'CA', ip_assignment_executed: true, work_for_hire_executed: true, outside_scope_invention: false }, { name: 'Engineer B', role: 'contractor', state: 'CA', ip_assignment_executed: false, work_for_hire_executed: false, outside_scope_invention: true }, { name: 'Designer C', role: 'designer', state: 'NY', ip_assignment_executed: true, work_for_hire_executed: false } ] },
    },
  },

  /* ══ M221 — OSS exposure diligence ═══════════════════════════════════ */
  M221: {
    purpose:
      'Classifies each open-source component by copyleft strength (permissive, weak, strong, unknown), flags AGPL components used over a network and strong-copyleft code linked into proprietary software, and sizes the special escrow from supplied remediation costs. It answers, in software diligence, "what OSS obligations does this codebase carry, and where is the copyleft exposure?" It classifies and sizes from a supplied component list; the copyleft-trigger opinion is IP counsel\'s.',
    algorithm: [
      'Given `components` (a list of component objects, each with a license and use booleans):',
      '1. If `components` is empty, the implementation SHALL return `status: "needs_inputs"` naming `components`.',
      '2. For each component it SHALL classify the license into `permissive`, `weak_copyleft`, `strong_copyleft`, or `unknown` per the OSS license classification table (constants), evaluated in table order — the license family is matched against weak-copyleft first, then strong-copyleft, then permissive, else unknown (so an LGPL license classifies weak before the GPL rule can reach it). It SHALL set `agpl_network_flag` iff the license is AGPL and used over a network, and `strong_copyleft_embedded_flag` iff a strong-copyleft component is linked into proprietary code.',
      '3. It SHALL count components in each class, AGPL-network components, and proprietary-strong-copyleft components.',
      '4. `special_escrow_sizing_cents` SHALL be the sum of the supplied per-component remediation costs.',
      '5. `oss_specific_rep_required`, `sca_pass_through_source_required` SHALL always be true; `indemnity_carveout_review_required` SHALL be true iff any component is strong-copyleft or unknown.',
    ],
    constants: [
      { name: 'OSS license classification', value: 'weak_copyleft: LGPL, MPL, EPL · strong_copyleft: AGPL, GPL, CC-BY-SA · permissive: MIT, BSD, Apache, ISC, Unlicense · anything unmatched: unknown. Evaluated in that order (weak → strong → permissive → unknown), so LGPL — though it contains "GPL" — classifies weak_copyleft, not strong.', kind: 'table_data', citation: 'SPDX license identifiers and the underlying license texts; Morgan Lewis / Nixon Peabody / Morse OSS diligence guidance', pin: 'copyleft-strength classification by SPDX license family, in table order' },
    ],
    precisionRule: 'Escrow sizing is exact integer cents; the rest are counts and booleans (see the Conventions chapter).',
    inputs: {
      components: { type: 'object[]', desc: 'OSS components; each object carries `name` (string), `license` (string, e.g. MIT/LGPL-2.1/AGPL-3.0), `network_use` (boolean), `proprietary_linking` (boolean), and `remediation_cost_cents` (integer cents).' },
    },
    outputs: {
      component_count: { type: 'integer', desc: 'Number of OSS components.' },
      permissive_count: { type: 'integer', desc: 'Number classified permissive.' },
      weak_copyleft_count: { type: 'integer', desc: 'Number classified weak copyleft.' },
      strong_copyleft_count: { type: 'integer', desc: 'Number classified strong copyleft.' },
      unknown_license_count: { type: 'integer', desc: 'Number whose license could not be classified.' },
      agpl_network_count: { type: 'integer', desc: 'Number of AGPL components used over a network.' },
      proprietary_strong_copyleft_count: { type: 'integer', desc: 'Number of strong-copyleft components linked into proprietary code.' },
      oss_specific_rep_required: { type: 'boolean', desc: 'Always true — an OSS-specific representation is required.' },
      indemnity_carveout_review_required: { type: 'boolean', desc: 'Whether any strong-copyleft or unknown component warrants an indemnity carve-out review.' },
      special_escrow_sizing_cents: { type: 'integer (cents)', desc: 'Sum of supplied remediation costs for special escrow sizing.', unit: 'cents' },
      sca_pass_through_source_required: { type: 'boolean', desc: 'Always true — the software-composition-analysis scan is a pass-through source.' },
      oss_rows: { type: 'object[]', desc: 'Per-component detail: `{ component, license, license_class (an oss_license_class value), network_use, proprietary_linking, agpl_network_flag, strong_copyleft_embedded_flag, remediation_cost_cents }`.' },
    },
    derivedOutputs: ['component_count', 'permissive_count', 'weak_copyleft_count', 'strong_copyleft_count', 'unknown_license_count', 'agpl_network_count', 'proprietary_strong_copyleft_count', 'special_escrow_sizing_cents', 'oss_rows'],
    boundary:
      'This model classifies OSS copyleft exposure and sizes the escrow from supplied component facts. Whether a copyleft obligation is in fact triggered by the way the code is combined and distributed, and the remediation required, are determinations for IP counsel; the model classifies the components and routes the review (indemnity_carveout_review_required) and renders no copyleft-trigger opinion.',
    golden: {
      narrative: 'Three OSS components: a permissive MIT library, a weak-copyleft LGPL library linked into proprietary code, and an AGPL analytics package used over the network — the AGPL network flag and a $250k remediation reserve drive an indemnity carve-out review.',
      input: { components: [ { name: 'libfoo', license: 'MIT' }, { name: 'barlib', license: 'LGPL-2.1', proprietary_linking: true }, { name: 'analytics', license: 'AGPL-3.0', network_use: true, remediation_cost_cents: 25_000_000 } ] },
    },
  },

  /* ══ M222 — IP-specific §1060 allocation ═════════════════════════════ */
  M222: {
    founderReview: true,
    purpose:
      'Allocates an IP-heavy asset-deal purchase price down the residual-method class ordering — Class V tangible, then Class VI §197 intangibles (the IP), then Class VII goodwill — capping each class at its supplied value and dropping the residual into goodwill. It answers, for a buyer and seller papering an IP-heavy asset purchase, "how does the price split across the tangible, IP-intangible, and goodwill classes for the buyer\'s amortization and the parties\' Form 8594?" It allocates from supplied values; the values and classifications are the advisors\' calls.',
    algorithm: [
      'Given `purchase_price_cents`, `tangible_assets_cents` (Class V), and `ip_intangibles_cents` (Class VI §197 intangibles):',
      '1. If any of the three is missing, the implementation SHALL return `status: "needs_inputs"` naming the missing fields.',
      '2. Following the residual-method ordering (constants: §1060 residual-method class ordering), `class_v_tangible_assets_cents` SHALL be `min(purchase_price_cents, tangible_assets_cents)`.',
      '3. The remainder after Class V SHALL be `max(0, purchase_price_cents − class_v)`; `class_vi_ip_section_197_intangibles_cents` SHALL be `min(remainder, ip_intangibles_cents)`.',
      '4. `class_vii_goodwill_going_concern_cents` SHALL be the residual `max(0, purchase_price_cents − class_v − class_vi)`.',
      '5. `ip_value_excess_over_purchase_price_cents` SHALL be `max(0, ip_intangibles_cents − remainder)` (IP value that does not fit under the price); `form_8594_reconciliation_total_cents` SHALL be the sum of the three classes.',
    ],
    constants: [
      { name: '§1060 residual-method class ordering', value: 'Class V (tangible/§1231) → Class VI (§197 intangibles ex-goodwill, incl. IP) → Class VII (goodwill and going-concern value)', kind: 'table_data', citation: 'Treas. Reg. § 1.1060-1(c); § 1.338-6(b)', pin: '§ 1.338-6(b)(2) (residual-method ordering)', effective: 'current (Treas. Reg. as amended)', nextCheck: 'on Treasury amendment' },
    ],
    precisionRule: 'All allocations are exact integer cents (see the Conventions chapter); no rounding.',
    inputs: {
      purchase_price_cents: { type: 'integer (cents)', desc: 'Total consideration to be allocated.', unit: 'cents' },
      tangible_assets_cents: { type: 'integer (cents)', desc: 'Class V tangible/§1231 asset value.', unit: 'cents' },
      ip_intangibles_cents: { type: 'integer (cents)', desc: 'Class VI §197 IP-intangible value.', unit: 'cents' },
    },
    outputs: {
      purchase_price_cents: { type: 'integer (cents)', desc: 'The price allocated, echoed.', unit: 'cents' },
      class_v_tangible_assets_cents: { type: 'integer (cents)', desc: 'Amount allocated to Class V tangible assets.', unit: 'cents' },
      class_vi_ip_section_197_intangibles_cents: { type: 'integer (cents)', desc: 'Amount allocated to Class VI §197 IP intangibles.', unit: 'cents' },
      class_vii_goodwill_going_concern_cents: { type: 'integer (cents)', desc: 'Residual allocated to Class VII goodwill and going-concern value.', unit: 'cents' },
      ip_value_excess_over_purchase_price_cents: { type: 'integer (cents)', desc: 'IP value that exceeds the price available after Class V (normally zero).', unit: 'cents' },
      form_8594_reconciliation_total_cents: { type: 'integer (cents)', desc: 'Sum of the three classes (should reconcile to the price).', unit: 'cents' },
    },
    derivedOutputs: ['class_v_tangible_assets_cents', 'class_vi_ip_section_197_intangibles_cents', 'class_vii_goodwill_going_concern_cents', 'ip_value_excess_over_purchase_price_cents', 'form_8594_reconciliation_total_cents'],
    boundary:
      'This model computes the Class V/VI/VII residual allocation for an IP-heavy deal from supplied values. Whether an asset belongs in a given class, whether the supplied fair market values are supportable, and the binding Form 8594 positions are determinations for the parties\' tax advisors; the model computes the allocation the supplied values imply and renders no valuation or classification opinion.',
    golden: {
      narrative: 'A $50M IP-heavy asset deal with $8M of tangible assets and $30M of identified IP intangibles allocates $8M to Class V, $30M to Class VI, and the $12M residual to Class VII goodwill.',
      input: { purchase_price_cents: 5_000_000_000, tangible_assets_cents: 800_000_000, ip_intangibles_cents: 3_000_000_000 },
    },
  },

  /* ══ M223 — Domain & trademark transfer mechanics ════════════════════ */
  M223: {
    purpose:
      'Builds the transfer task list for domains, trademarks, social handles, and SSL certificates — registrar auth codes and transfer locks for domains, USPTO and state assignment recordings for trademarks, handle transfers, and certificate reissuance — and counts what each asset type needs. It answers, at closing of a deal with digital assets, "what are the concrete steps to move each domain, mark, and handle, and which domains are still locked?" It sequences the mechanical steps from supplied asset facts.',
    algorithm: [
      'Given `transfer_assets` (a list of asset objects, each with a type and transfer facts):',
      '1. If `transfer_assets` is empty, the implementation SHALL return `status: "needs_inputs"` naming `transfer_assets`.',
      '2. For each asset it SHALL set `auth_code_required` iff it is a domain, `uspto_assignment_recording_required` iff it is a trademark, `state_assignment_required` from the state-registered flag, `social_handle_transfer_required` iff it is a social handle, and `ssl_reissue_required` iff it is an SSL asset or a certificate is attached; it SHALL take the transfer-lock days remaining (the ICANN 60-day post-transfer lock is the governing window).',
      '3. It SHALL count assets, domains, trademarks, auth-code-required assets, locked domains (lock days > 0), USPTO recordings, state assignments, social-handle transfers, and SSL reissuances.',
      '4. It SHALL return the full per-asset transfer detail.',
    ],
    constants: [],
    precisionRule: 'All outputs are counts and day terms (see the Conventions chapter); no rounding.',
    inputs: {
      transfer_assets: { type: 'object[]', desc: 'Digital/brand assets to transfer; each object carries `name` (string), `type` (string, e.g. domain/trademark/social/ssl), `transfer_lock_days_remaining` (integer), `state_registered` (boolean), and `ssl_certificate_attached` (boolean).' },
    },
    outputs: {
      transfer_asset_count: { type: 'integer', desc: 'Number of transfer assets.' },
      domain_count: { type: 'integer', desc: 'Number of domains.' },
      trademark_count: { type: 'integer', desc: 'Number of trademarks.' },
      auth_code_required_count: { type: 'integer', desc: 'Number of assets needing a registrar auth code.' },
      locked_domain_count: { type: 'integer', desc: 'Number of domains still within a transfer lock.' },
      uspto_assignment_recording_count: { type: 'integer', desc: 'Number needing USPTO assignment recording.' },
      state_assignment_required_count: { type: 'integer', desc: 'Number needing a state trademark assignment.' },
      social_handle_transfer_count: { type: 'integer', desc: 'Number of social handles to transfer.' },
      ssl_reissue_count: { type: 'integer', desc: 'Number of SSL certificates to reissue.' },
      transfer_rows: { type: 'object[]', desc: 'Per-asset detail: `{ name, type, auth_code_required, transfer_lock_days_remaining, uspto_assignment_recording_required, state_assignment_required, social_handle_transfer_required, ssl_reissue_required }`.' },
    },
    derivedOutputs: ['transfer_asset_count', 'domain_count', 'trademark_count', 'auth_code_required_count', 'locked_domain_count', 'uspto_assignment_recording_count', 'state_assignment_required_count', 'social_handle_transfer_count', 'ssl_reissue_count', 'transfer_rows'],
    boundary:
      'This model sequences the mechanical transfer steps for domains, marks, handles, and certificates from supplied asset facts. Whether a trademark assignment is valid without the associated goodwill, and the enforceability of any transfer, are legal determinations for counsel; the model builds the task list and the counts and renders no validity conclusion.',
    golden: {
      narrative: 'Four transfer assets: a domain still 15 days inside its ICANN transfer lock needs an auth code, a state-registered trademark needs USPTO and state assignment recording, a social handle needs manual transfer, and an SSL certificate needs reissuance.',
      input: { transfer_assets: [ { name: 'example.com', type: 'domain', transfer_lock_days_remaining: 15 }, { name: 'Company wordmark', type: 'trademark', state_registered: true }, { name: '@company', type: 'social_handle' }, { name: 'wildcard SSL', type: 'ssl' } ] },
    },
  },

  /* ══ RE FAMILY — real-estate tax, valuation, and diligence ═══════════ */

  /* ══ M169 — FIRPTA withholding ═══════════════════════════════════════ */
  M169: {
    founderReview: true,
    purpose:
      'Determines the FIRPTA withholding a buyer must remit on a purchase of U.S. real property from a foreign seller — the 15% default, the reduced 10% and zero residence paths, or none for a domestic seller — and the amount and filing deadline. It answers, at a real-estate closing, "must the buyer withhold on this seller, how much, and by when?" It computes the withholding from supplied facts; whether the seller is in fact a foreign person and whether an exemption or certificate applies are the tax advisor\'s calls.',
    algorithm: [
      'Given `amount_realized_cents` and `seller_foreign_person`, plus optional `buyer_will_use_as_residence` (default false):',
      '1. If either required input is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.',
      '2. If the seller is not a foreign person, `withholding_rate` SHALL be 0 and `path` SHALL be `not_foreign_seller`.',
      '3. Else if the buyer will use the property as a residence and the amount realized is at or below the personal-residence exemption ceiling (constants: FIRPTA personal-residence exemption ceiling), `withholding_rate` SHALL be 0 (`personal_residence_300k_or_less_exemption`).',
      '4. Else if the buyer will use it as a residence and the amount realized is at or below the reduced-rate ceiling (constants: FIRPTA reduced-rate residence ceiling), `withholding_rate` SHALL be the reduced residence rate (constants: FIRPTA reduced residence rate) with path `personal_residence_300k_to_1m_reduced_rate`.',
      '5. Otherwise `withholding_rate` SHALL be the default FIRPTA rate (constants: FIRPTA default withholding rate) with path `default_firpta_withholding`.',
      '6. `withholding_amount_cents` SHALL be `round(amount_realized_cents × withholding_rate)`; `forms_due_within_days` SHALL be the Form 8288 filing/remittance deadline when a foreign seller is withheld upon, else null (constants: FIRPTA Form 8288 filing deadline).',
    ],
    constants: [
      { name: 'FIRPTA default withholding rate', value: '15% (0.15)', kind: 'statutory_must', citation: 'IRC § 1445(a)', pin: '§ 1445(a)', effective: 'current (IRC as amended)', nextCheck: 'on IRC amendment', traceValues: [0.15] },
      { name: 'FIRPTA reduced residence rate', value: '10% (0.10)', kind: 'statutory_must', citation: 'IRC § 1445', pin: '§ 1445(c)(4) reduced-rate residence path', effective: 'current (IRC as amended)', nextCheck: 'on IRC amendment', traceValues: [0.1] },
      { name: 'FIRPTA personal-residence exemption ceiling', value: '$300,000 (30,000,000 cents)', kind: 'statutory_must', citation: 'IRC § 1445(b)(5)', pin: '§ 1445(b)(5)', effective: 'current (IRC as amended)', nextCheck: 'on IRC amendment' },
      { name: 'FIRPTA reduced-rate residence ceiling', value: '$1,000,000 (100,000,000 cents)', kind: 'statutory_must', citation: 'IRC § 1445; Treas. Reg. § 1.1445-1', pin: 'reduced-rate residence ceiling', effective: 'current (Treas. Reg. as amended)', nextCheck: 'on Treasury amendment' },
      { name: 'FIRPTA Form 8288 filing deadline', value: '20 days', kind: 'statutory_must', citation: 'IRC § 1445; Treas. Reg. § 1.1445-1', pin: 'remit and file by the 20th day after transfer', effective: 'current (Treas. Reg. as amended)', nextCheck: 'on Treasury amendment', traceValues: [20] },
    ],
    precisionRule: 'The withholding amount is exact integer cents (see the Conventions chapter); the rate is an exact statutory fraction.',
    inputs: {
      amount_realized_cents: { type: 'integer (cents)', desc: 'The amount realized by the seller (the FIRPTA withholding base).', unit: 'cents' },
      seller_foreign_person: { type: 'boolean', desc: 'Whether the seller is a foreign person (the FIRPTA trigger).' },
      buyer_will_use_as_residence: { type: 'boolean', desc: 'Whether the buyer will use the property as a residence (default false); opens the exemption and reduced-rate paths.' },
    },
    outputs: {
      amount_realized_cents: { type: 'integer (cents)', desc: 'The amount realized, echoed.', unit: 'cents' },
      seller_foreign_person: { type: 'boolean', desc: 'The foreign-person flag, echoed.' },
      buyer_will_use_as_residence: { type: 'boolean', desc: 'The residence-use flag, echoed.' },
      withholding_rate: { type: 'number', desc: 'The FIRPTA withholding rate applied (0, 0.10, or 0.15).' },
      withholding_amount_cents: { type: 'integer (cents)', desc: 'The withholding the buyer must remit.', unit: 'cents' },
      path: { type: 'enum', enum: 'firpta_path', desc: 'The withholding path taken.' },
      forms_due_within_days: { type: 'integer | null', desc: 'Days within which Form 8288/8288-A must be filed and the tax remitted, or null when no withholding applies.', unit: 'days' },
    },
    derivedOutputs: ['withholding_amount_cents'],
    boundary:
      'This model computes FIRPTA withholding and the filing deadline from supplied facts. Whether the seller is in fact a foreign person, whether the residence exemption or a withholding certificate applies, and the seller\'s ultimate tax liability are determinations for the parties\' tax advisors; the model computes the buyer\'s withholding obligation and renders no opinion on the seller\'s tax.',
    golden: {
      narrative: 'A foreign seller disposes of a $2.5M commercial property that the buyer will not occupy as a residence: FIRPTA requires 15% withholding — $375,000 — remitted with Form 8288 within 20 days of closing.',
      input: { amount_realized_cents: 250_000_000, seller_foreign_person: true, buyer_will_use_as_residence: false },
    },
  },

  /* ══ M170 — §1031 like-kind exchange timing ══════════════════════════ */
  M170: {
    founderReview: true,
    purpose:
      'Dates the two hard §1031 deadlines from the relinquished-property transfer — the 45-day identification window and the 180-day exchange window — and computes the recognized-gain floor from any boot received and any value shortfall in the replacement property. It answers, for a taxpayer running a like-kind exchange, "by when must I identify and close, and how much gain can I not defer?" It computes the timing and the gain floor; whether the properties are like-kind and the exchange qualifies is the tax advisor\'s call.',
    algorithm: [
      'Given `transfer_date`, `relinquished_property_value_cents`, and `replacement_property_value_cents`, plus optional `boot_received_cents` (default 0):',
      '1. If any required input is missing (or the date is invalid), the implementation SHALL return `status: "needs_inputs"` and emit no outputs.',
      '2. `identification_deadline` SHALL be the transfer date advanced by the §1031 identification period (constants: §1031 identification period).',
      '3. `exchange_deadline` SHALL be the transfer date advanced by the §1031 exchange period (constants: §1031 exchange period).',
      '4. `value_shortfall_cents` SHALL be `max(0, relinquished_property_value_cents − replacement_property_value_cents)` (trading down).',
      '5. `recognized_gain_floor_cents` SHALL be `max(boot_received_cents, value_shortfall_cents)` — the gain that cannot be deferred.',
    ],
    constants: [
      { name: '§1031 identification period', value: '45 days', kind: 'statutory_must', citation: 'IRC § 1031(a)(3)(A)', pin: '§ 1031(a)(3)(A)', effective: 'current (IRC as amended)', nextCheck: 'on IRC amendment', traceValues: [45] },
      { name: '§1031 exchange period', value: '180 days', kind: 'statutory_must', citation: 'IRC § 1031(a)(3)(B)', pin: '§ 1031(a)(3)(B)', effective: 'current (IRC as amended)', nextCheck: 'on IRC amendment', traceValues: [180] },
    ],
    precisionRule: 'Monetary outputs are exact integer cents; deadlines are ISO-8601 dates (see the Conventions chapter).',
    inputs: {
      transfer_date: { type: 'string (ISO date)', desc: 'The date the relinquished property was transferred; the clock start.' },
      relinquished_property_value_cents: { type: 'integer (cents)', desc: 'Value of the relinquished property.', unit: 'cents' },
      replacement_property_value_cents: { type: 'integer (cents)', desc: 'Value of the replacement property.', unit: 'cents' },
      boot_received_cents: { type: 'integer (cents)', desc: 'Non-like-kind consideration received (default 0).', unit: 'cents' },
    },
    outputs: {
      transfer_date: { type: 'string (ISO date)', desc: 'The transfer date, echoed.' },
      identification_deadline: { type: 'string (ISO date)', desc: 'The 45-day identification deadline.' },
      exchange_deadline: { type: 'string (ISO date)', desc: 'The 180-day exchange deadline.' },
      replacement_value_cents: { type: 'integer (cents)', desc: 'The replacement-property value, echoed.', unit: 'cents' },
      relinquished_value_cents: { type: 'integer (cents)', desc: 'The relinquished-property value, echoed.', unit: 'cents' },
      boot_received_cents: { type: 'integer (cents)', desc: 'Boot received, echoed.', unit: 'cents' },
      value_shortfall_cents: { type: 'integer (cents)', desc: 'Shortfall from trading down (relinquished over replacement).', unit: 'cents' },
      recognized_gain_floor_cents: { type: 'integer (cents)', desc: 'The greater of boot and shortfall — gain that cannot be deferred.', unit: 'cents' },
    },
    derivedOutputs: ['value_shortfall_cents', 'recognized_gain_floor_cents'],
    boundary:
      'This model dates the §1031 windows and computes the recognized-gain floor from supplied values. Whether the properties are like-kind, whether the exchange structure (qualified intermediary, identification rules) qualifies, and the taxpayer\'s actual gain and basis are determinations for the tax advisor; the model computes the deadlines and the floor and renders no qualification opinion.',
    golden: {
      narrative: 'A $5M relinquished property is exchanged for $4.5M of replacement plus $200k of boot: the $500k trade-down shortfall exceeds the boot, so at least $500k of gain is recognized; identification closes 45 days out and the exchange 180 days out.',
      input: { transfer_date: '2026-03-01', relinquished_property_value_cents: 500_000_000, replacement_property_value_cents: 450_000_000, boot_received_cents: 20_000_000 },
    },
  },

  /* ══ M171 — Sale-leaseback & ASC 842 classification screen ═══════════ */
  M171: {
    purpose:
      'Screens a sale-leaseback against the ASC 842 finance-lease indicators — ownership transfer, a bargain purchase option, a lease term covering substantially all the economic life, present value covering substantially all the fair value, and a specialized asset — and reports the implied cap rate and nominal rent. It answers, in an OpCo/PropCo or sale-leaseback deal, "do any finance-lease indicators show up, or does this look like a true sale and operating lease?" It screens the indicators; the binding sale and lease-classification accounting is the accountant\'s.',
    algorithm: [
      'Given `sale_price_cents`, `annual_rent_cents`, and `lease_term_years`, plus optional `economic_life_years`, `pv_lease_payments_cents`, `transfers_ownership` (default false), `bargain_purchase_option` (default false), `specialized_asset` (default false):',
      '1. If any required input is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.',
      '2. `cap_rate` SHALL be `annual_rent_cents ÷ sale_price_cents` at the global 4-decimal precision; `total_nominal_rent_cents` SHALL be `round(annual_rent_cents × lease_term_years)`.',
      '3. `lease_term_pct_of_economic_life` SHALL be `lease_term_years ÷ economic_life_years` (or null); `pv_payments_pct_of_fair_value` SHALL be `pv_lease_payments_cents ÷ sale_price_cents` (or null).',
      '4. A finance-lease indicator SHALL be flagged for: ownership transfer; a bargain purchase option; a lease term at or above the economic-life threshold (constants: ASC 842 lease-term indicator); PV at or above the fair-value threshold (constants: ASC 842 PV indicator); or a specialized asset.',
      '5. `asc842_indicator_classification` SHALL be `finance_lease_indicator_present` iff any indicator fired, else `operating_lease_indicator_on_supplied_facts`; an accountant-review flag SHALL always attach.',
    ],
    constants: [
      { name: 'ASC 842 lease-term indicator', value: '75% of economic life (0.75)', kind: 'statutory_must', citation: 'ASC 842-10-25', pin: 'lease term is a major part (customary 75%) of remaining economic life', effective: 'ASC 842 (current)', nextCheck: 'on standard amendment', traceValues: [0.75] },
      { name: 'ASC 842 PV indicator', value: '90% of fair value (0.90)', kind: 'statutory_must', citation: 'ASC 842-10-25', pin: 'PV of payments is substantially all (customary 90%) of fair value', effective: 'ASC 842 (current)', nextCheck: 'on standard amendment', traceValues: [0.9] },
    ],
    precisionRule: 'Cap rate and percentages are rounded per the global rule (half-even to 4 decimals — see the Conventions chapter); nominal rent is exact integer cents.',
    inputs: {
      sale_price_cents: { type: 'integer (cents)', desc: 'The sale-leaseback sale price.', unit: 'cents' },
      annual_rent_cents: { type: 'integer (cents)', desc: 'Annual leaseback rent.', unit: 'cents' },
      lease_term_years: { type: 'number', desc: 'The leaseback term in years.', unit: 'years' },
      economic_life_years: { type: 'number', desc: 'Remaining economic life of the asset; enables the lease-term indicator.', unit: 'years' },
      pv_lease_payments_cents: { type: 'integer (cents)', desc: 'Present value of the lease payments; enables the fair-value indicator.', unit: 'cents' },
      transfers_ownership: { type: 'boolean', desc: 'Whether the lease transfers ownership at term end (default false).' },
      bargain_purchase_option: { type: 'boolean', desc: 'Whether the lessee holds a bargain purchase option (default false).' },
      specialized_asset: { type: 'boolean', desc: 'Whether the asset is so specialized it has no alternative use to the lessor (default false).' },
    },
    outputs: {
      sale_price_cents: { type: 'integer (cents)', desc: 'The sale price, echoed.', unit: 'cents' },
      annual_rent_cents: { type: 'integer (cents)', desc: 'The annual rent, echoed.', unit: 'cents' },
      cap_rate: { type: 'number', desc: 'Implied cap rate: annual rent ÷ sale price.', precision: 4 },
      lease_term_years: { type: 'number', desc: 'The lease term, echoed.', unit: 'years' },
      total_nominal_rent_cents: { type: 'integer (cents)', desc: 'Total undiscounted rent over the term.', unit: 'cents' },
      lease_term_pct_of_economic_life: { type: 'number | null', desc: 'Lease term as a fraction of economic life, or null.', precision: 4 },
      pv_payments_pct_of_fair_value: { type: 'number | null', desc: 'PV of payments as a fraction of fair value, or null.', precision: 4 },
      asc842_indicator_classification: { type: 'enum', enum: 'asc842_classification', desc: 'Whether any finance-lease indicator is present.' },
      finance_lease_indicators: { type: 'string[]', desc: 'The finance-lease indicators that fired (empty when none).' },
      accounting_review_flags: { type: 'string[]', desc: 'Standing accountant-review note on ASC 842 sale and lease classification.' },
    },
    derivedOutputs: ['cap_rate', 'total_nominal_rent_cents', 'lease_term_pct_of_economic_life', 'pv_payments_pct_of_fair_value'],
    boundary:
      'This model screens the ASC 842 finance-lease indicators and computes the implied cap rate from supplied facts. Whether the sale qualifies for sale accounting and whether the leaseback is a finance or operating lease are accounting determinations for the accountant on the final facts; the model produces the indicator screen and always routes the classification, rendering no accounting conclusion.',
    golden: {
      narrative: 'A $20M sale-leaseback at $1.6M annual rent (an 8% cap) on a 15-year lease of a 40-year-life asset with $12M PV of payments: none of the ASC 842 finance-lease indicators fires on these facts, pointing toward sale and operating-lease accounting subject to accountant review.',
      input: { sale_price_cents: 2_000_000_000, annual_rent_cents: 160_000_000, lease_term_years: 15, economic_life_years: 40, pv_lease_payments_cents: 1_200_000_000 },
    },
  },

  /* ══ M172 — REIT 75/75/90 compliance triad ═══════════════════════════ */
  M172: {
    founderReview: true,
    purpose:
      'Runs the three REIT qualification gates from supplied figures — the 75% gross-income test, the 75% asset test, and the 90% distribution test — and reports each ratio, each pass/fail, and whether all three clear. It answers, for a REIT (or a target being tested for REIT status), "do the income, asset, and distribution numbers keep it qualified?" It computes the ratios and the pass/fail; the underlying income and asset characterizations are the tax advisor\'s.',
    scopeFlag: 'Scope: this is the 75/75/90 triad only. It does NOT run the separate **§856(c)(2) 95%-of-gross-income test**, the quarterly asset-test timing, or the ownership tests — a REIT can clear all three tabled tests here and still fail qualification on the 95% test. The distribution-test denominator is REIT taxable income before the dividends-paid deduction and excluding net capital gain. Treat a clean pass as necessary, not sufficient.',
    algorithm: [
      'Given `real_estate_income_cents`, `total_income_cents`, `real_estate_assets_cents`, `total_assets_cents`, `distributions_cents`, and `taxable_income_cents`:',
      '1. If any of the six is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.',
      '2. `income_75_pct` SHALL be `real_estate_income_cents ÷ total_income_cents`; `income_75_test_passed` SHALL be true iff it is at or above the income-test threshold (constants: REIT 75% income test).',
      '3. `asset_75_pct` SHALL be `real_estate_assets_cents ÷ total_assets_cents`; `asset_75_test_passed` SHALL be true iff it is at or above the asset-test threshold (constants: REIT 75% asset test).',
      '4. `distribution_90_pct` SHALL be `distributions_cents ÷ taxable_income_cents`; `distribution_90_test_passed` SHALL be true iff it is at or above the distribution-test threshold (constants: REIT 90% distribution test).',
      '5. `all_tests_passed` SHALL be true iff all three tests pass; the ratios are reported at the global 4-decimal precision.',
    ],
    constants: [
      { name: 'REIT 75% income test', value: '75% (0.75)', kind: 'statutory_must', citation: 'IRC § 856(c)(3)', pin: '§ 856(c)(3)', effective: 'current (IRC as amended)', nextCheck: 'on IRC amendment', traceValues: [0.75] },
      { name: 'REIT 75% asset test', value: '75% (0.75)', kind: 'statutory_must', citation: 'IRC § 856(c)(4)', pin: '§ 856(c)(4)', effective: 'current (IRC as amended)', nextCheck: 'on IRC amendment', traceValues: [0.75] },
      { name: 'REIT 90% distribution test', value: '90% (0.90)', kind: 'statutory_must', citation: 'IRC § 857(a)(1)', pin: '§ 857(a)(1)', effective: 'current (IRC as amended)', nextCheck: 'on IRC amendment', traceValues: [0.9] },
    ],
    precisionRule: 'Ratios are rounded per the global rule (half-even to 4 decimals — see the Conventions chapter).',
    inputs: {
      real_estate_income_cents: { type: 'integer (cents)', desc: 'Qualifying real-estate gross income.', unit: 'cents' },
      total_income_cents: { type: 'integer (cents)', desc: 'Total gross income.', unit: 'cents' },
      real_estate_assets_cents: { type: 'integer (cents)', desc: 'Qualifying real-estate assets.', unit: 'cents' },
      total_assets_cents: { type: 'integer (cents)', desc: 'Total assets.', unit: 'cents' },
      distributions_cents: { type: 'integer (cents)', desc: 'Distributions made to shareholders.', unit: 'cents' },
      taxable_income_cents: { type: 'integer (cents)', desc: 'REIT taxable income (the distribution-test denominator).', unit: 'cents' },
    },
    outputs: {
      income_75_pct: { type: 'number', desc: 'Real-estate income as a fraction of total income.', precision: 4 },
      income_75_test_passed: { type: 'boolean', desc: 'Whether the 75% income test passes.' },
      asset_75_pct: { type: 'number', desc: 'Real-estate assets as a fraction of total assets.', precision: 4 },
      asset_75_test_passed: { type: 'boolean', desc: 'Whether the 75% asset test passes.' },
      distribution_90_pct: { type: 'number', desc: 'Distributions as a fraction of taxable income.', precision: 4 },
      distribution_90_test_passed: { type: 'boolean', desc: 'Whether the 90% distribution test passes.' },
      all_tests_passed: { type: 'boolean', desc: 'Whether all three tests pass.' },
    },
    derivedOutputs: ['income_75_pct', 'asset_75_pct', 'distribution_90_pct'],
    boundary:
      'This model runs the three REIT ratio tests from supplied figures. Which income and assets qualify as real-estate for §856, the many other REIT requirements, and the ultimate qualification conclusion are determinations for the tax advisor; the model computes the ratios and pass/fail and renders no qualification opinion.',
    golden: {
      narrative: 'A REIT with 95% of income and 95% of assets in real estate and a 90% distribution of taxable income clears all three §856/§857 tests.',
      input: { real_estate_income_cents: 950_000_000, total_income_cents: 1_000_000_000, real_estate_assets_cents: 9_500_000_000, total_assets_cents: 10_000_000_000, distributions_cents: 900_000_000, taxable_income_cents: 1_000_000_000 },
    },
  },

  /* ══ M187 — RE-heavy asset-vs-entity election ════════════════════════ */
  M187: {
    founderReview: true,
    purpose:
      'Compares the asset-deal and entity-deal consequences for a real-estate-heavy target — the buyer basis and step-up each form delivers, the transfer-tax cost the asset form triggers, and whether the G30 real-estate overlay applies — and reports debt-assumability and in-place-lease treatment. It answers, when a target is real-estate-heavy, "what does each deal form do to basis, step-up value, and transfer tax?" It computes the comparison from supplied values and rates; the binding tax structuring is the advisor\'s.',
    algorithm: [
      'Given `enterprise_value_cents` and `real_property_value_cents`, plus optional `entity_carried_basis_cents` (default 0), `transfer_tax_rate` (default 0), `step_up_benefit_rate` (default 0), `debt_assumable`, `in_place_lease_treatment`:',
      '1. If either required input is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.',
      '2. `real_estate_pct_of_ev` SHALL be `real_property_value_cents ÷ enterprise_value_cents`; `g30_real_estate_overlay_triggered` SHALL be true iff it is at or above the overlay threshold (constants: G30 real-estate overlay trigger).',
      '3. `asset_deal_buyer_basis_cents` and `entity_deal_buyer_outside_basis_cents` SHALL both echo the enterprise value; `buyer_step_up_cents` SHALL be `max(0, enterprise_value_cents − entity_carried_basis_cents)`; `buyer_step_up_pv_benefit_cents` SHALL be `round(buyer_step_up_cents × step_up_benefit_rate)`.',
      '4. `transfer_tax_cents` SHALL be `round(real_property_value_cents × transfer_tax_rate)` (the asset-form transfer-tax cost).',
      '5. `debt_assumability` and `in_place_lease_treatment` SHALL report the supplied posture (or `not_supplied` / a default note).',
    ],
    constants: [
      { name: 'G30 real-estate overlay trigger', value: '25% of enterprise value (0.25)', kind: 'table_data', citation: 'DEFINITIVE G30 gate — Real Estate & Asset-Class Overlays trigger', pin: 'real estate ≥ 25% of enterprise value', effective: 'DEFINITIVE v1.1', nextCheck: 'on gate-framework revision', traceValues: [0.25] },
    ],
    precisionRule: 'Monetary outputs are exact integer cents; the real-estate share and transfer-tax rate are rounded per the global rule (half-even to 4 decimals — see the Conventions chapter).',
    inputs: {
      enterprise_value_cents: { type: 'integer (cents)', desc: 'Total enterprise value of the target.', unit: 'cents' },
      real_property_value_cents: { type: 'integer (cents)', desc: 'Value of the real property inside the target.', unit: 'cents' },
      entity_carried_basis_cents: { type: 'integer (cents)', desc: 'The target\'s carried (inside) tax basis in an entity deal (default 0).', unit: 'cents' },
      transfer_tax_rate: { type: 'number', desc: 'The real-estate transfer-tax rate applied in an asset deal, as a fraction (default 0).', precision: 4 },
      step_up_benefit_rate: { type: 'number', desc: 'The present-value benefit rate applied to the step-up (default 0).', precision: 4 },
      debt_assumable: { type: 'boolean', desc: 'Whether existing property debt is assumable; drives debt_assumability.' },
      in_place_lease_treatment: { type: 'string', desc: 'How in-place leases are treated on transfer (default: assumption/assignment to confirm).' },
    },
    outputs: {
      enterprise_value_cents: { type: 'integer (cents)', desc: 'Enterprise value, echoed.', unit: 'cents' },
      real_property_value_cents: { type: 'integer (cents)', desc: 'Real-property value, echoed.', unit: 'cents' },
      real_estate_pct_of_ev: { type: 'number', desc: 'Real property as a fraction of enterprise value.', precision: 4 },
      g30_real_estate_overlay_triggered: { type: 'boolean', desc: 'Whether the G30 real-estate overlay applies.' },
      asset_deal_buyer_basis_cents: { type: 'integer (cents)', desc: 'Buyer basis in an asset deal (the enterprise value).', unit: 'cents' },
      entity_deal_buyer_outside_basis_cents: { type: 'integer (cents)', desc: 'Buyer outside basis in an entity deal (the enterprise value).', unit: 'cents' },
      entity_carried_basis_cents: { type: 'integer (cents)', desc: 'The entity\'s carried inside basis, echoed.', unit: 'cents' },
      buyer_step_up_cents: { type: 'integer (cents)', desc: 'Step-up an asset deal delivers over the carried basis.', unit: 'cents' },
      buyer_step_up_pv_benefit_cents: { type: 'integer (cents)', desc: 'Present-value benefit of the step-up at the supplied rate.', unit: 'cents' },
      transfer_tax_rate: { type: 'number', desc: 'The transfer-tax rate applied.', precision: 4 },
      transfer_tax_cents: { type: 'integer (cents)', desc: 'Transfer tax on the real property in an asset deal.', unit: 'cents' },
      debt_assumability: { type: 'enum', enum: 'debt_assumability', desc: 'Whether property debt is assumable, needs consent/refinance, or was not supplied.' },
      in_place_lease_treatment: { type: 'string', desc: 'The in-place-lease treatment on transfer.' },
    },
    derivedOutputs: ['real_estate_pct_of_ev', 'buyer_step_up_cents', 'buyer_step_up_pv_benefit_cents', 'transfer_tax_cents'],
    boundary:
      'This model compares the asset- and entity-deal consequences from supplied values and rates. The binding transfer-tax incidence, the availability and value of a step-up, the debt-assumption terms, and the lease treatment are legal and tax determinations for the parties\' advisors; the model computes the comparison and renders no structuring opinion.',
    golden: {
      narrative: 'A $30M target with $12M of real property (40% of value, tripping the G30 overlay): an asset deal gives the buyer a $10M step-up worth ~$2.5M in present-value benefit but costs $168k in transfer tax on the real property, versus a carryover-basis entity deal.',
      input: { enterprise_value_cents: 3_000_000_000, real_property_value_cents: 1_200_000_000, entity_carried_basis_cents: 2_000_000_000, transfer_tax_rate: 0.014, step_up_benefit_rate: 0.25, debt_assumable: true },
    },
  },

  /* ══ M188 — RE / operating-business price bifurcation ════════════════ */
  M188: {
    founderReview: true,
    purpose:
      'Splits a mixed real-estate-and-operating-business purchase price into its real-estate value (NOI capitalized at the supplied cap rate, capped at the price) and the residual operating-business value, then reconciles the split into §1060 Class V, VI, and VII. It answers, for a deal with both a building and a business inside it, "how much of the price is the real estate versus the operating business, and how does that map to the tax classes?" It computes the bifurcation from supplied values; the valuations and classifications are the advisors\' calls.',
    scopeFlag: 'Scope: the split is a simplified real-estate-vs-goodwill bifurcation. The operating-business residual is reconciled into Class V/VI/VII only; it does not carve out the opco\'s Class III (receivables), Class IV (inventory), or non-RE Class V (equipment/FF&E), which in a full §1060 allocation absorb value AHEAD of goodwill — so this model overstates Class VII goodwill for an opco with those assets. Use M139 for a complete seven-class allocation.',
    algorithm: [
      'Given `enterprise_value_cents`, `noi_cents`, and `cap_rate`, plus optional `class_vi_intangibles_cents` (default 0):',
      '1. If any required input is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.',
      '2. `uncapped_real_estate_value_cents` SHALL be `round(noi_cents ÷ cap_rate)`; `real_estate_value_cents` SHALL be `min(enterprise_value_cents, uncapped_real_estate_value_cents)` and fills Class V.',
      '3. `operating_business_residual_value_cents` SHALL be `max(0, enterprise_value_cents − real_estate_value_cents)`.',
      '4. `class_vi_section_197_intangibles_cents` SHALL be `min(class_vi_intangibles_cents, residual)`; `class_vii_goodwill_going_concern_cents` SHALL be the remaining residual, following the residual-method ordering (constants: §1060 residual-method class ordering).',
      '5. `form_8594_reconciliation_total_cents` SHALL be the sum of Class V, VI, and VII.',
    ],
    constants: [
      { name: '§1060 residual-method class ordering', value: 'Class V (real property/tangible) → Class VI (§197 intangibles) → Class VII (goodwill and going-concern value)', kind: 'table_data', citation: 'Treas. Reg. § 1.1060-1(c); § 1.338-6(b)', pin: '§ 1.338-6(b)(2) (residual-method ordering)', effective: 'current (Treas. Reg. as amended)', nextCheck: 'on Treasury amendment' },
    ],
    precisionRule: 'All values are exact integer cents; the cap rate echoes at the global 4-decimal precision (see the Conventions chapter).',
    inputs: {
      enterprise_value_cents: { type: 'integer (cents)', desc: 'Total purchase price to be bifurcated.', unit: 'cents' },
      noi_cents: { type: 'integer (cents)', desc: 'Stabilized net operating income of the real property.', unit: 'cents' },
      cap_rate: { type: 'number', desc: 'The capitalization rate applied to NOI (a fraction, e.g. 0.08).', precision: 4 },
      class_vi_intangibles_cents: { type: 'integer (cents)', desc: 'Identified Class VI §197 intangible value (default 0).', unit: 'cents' },
    },
    outputs: {
      enterprise_value_cents: { type: 'integer (cents)', desc: 'The price, echoed.', unit: 'cents' },
      noi_cents: { type: 'integer (cents)', desc: 'The NOI, echoed.', unit: 'cents' },
      cap_rate: { type: 'number', desc: 'The cap rate applied.', precision: 4 },
      uncapped_real_estate_value_cents: { type: 'integer (cents)', desc: 'NOI capitalized at the cap rate, before the price cap.', unit: 'cents' },
      real_estate_value_cents: { type: 'integer (cents)', desc: 'Real-estate value after the price cap (Class V).', unit: 'cents' },
      operating_business_residual_value_cents: { type: 'integer (cents)', desc: 'Price remaining after the real estate.', unit: 'cents' },
      class_v_real_property_and_tangible_cents: { type: 'integer (cents)', desc: 'Class V real property and tangible allocation.', unit: 'cents' },
      class_vi_section_197_intangibles_cents: { type: 'integer (cents)', desc: 'Class VI §197 intangibles allocation.', unit: 'cents' },
      class_vii_goodwill_going_concern_cents: { type: 'integer (cents)', desc: 'Class VII goodwill/going-concern residual.', unit: 'cents' },
      form_8594_reconciliation_total_cents: { type: 'integer (cents)', desc: 'Sum of the three classes (reconciles to the price).', unit: 'cents' },
    },
    derivedOutputs: ['uncapped_real_estate_value_cents', 'real_estate_value_cents', 'operating_business_residual_value_cents', 'class_v_real_property_and_tangible_cents', 'class_vi_section_197_intangibles_cents', 'class_vii_goodwill_going_concern_cents', 'form_8594_reconciliation_total_cents'],
    boundary:
      'This model bifurcates a mixed price into real-estate and operating-business value and reconciles it to the §1060 classes from supplied figures. Whether the NOI, cap rate, and intangible values are supportable, and the binding Form 8594 positions, are determinations for the parties\' appraisers and tax advisors; the model computes the split and renders no valuation or classification opinion.',
    golden: {
      narrative: 'A $40M operating-business-with-real-estate deal: $2.4M of NOI at an 8% cap values the real property at $30M (Class V), $5M of identified intangibles fills Class VI, and the $5M residual becomes Class VII goodwill — Form 8594 reconciles to $40M.',
      input: { enterprise_value_cents: 4_000_000_000, noi_cents: 240_000_000, cap_rate: 0.08, class_vi_intangibles_cents: 500_000_000 },
    },
  },

  /* ══ M189 — Rent-roll normalization ══════════════════════════════════ */
  M189: {
    purpose:
      'Normalizes a rent roll into the metrics that drive an income-property read — occupancy by count and by area, total and occupied rent, weighted-average lease term (WALT), and top-tenant concentration — and flags single-tenant concentration above the market threshold. It answers, in real-estate diligence, "how full is the property, how long is the income locked in, and how exposed is it to one tenant?" It computes the metrics from a supplied rent roll.',
    algorithm: [
      'Given `rent_roll` (a list of tenant rows) and optional `as_of_date`:',
      '1. If `rent_roll` is empty, the implementation SHALL return `status: "needs_inputs"` naming `rent_roll`.',
      '2. For each tenant it SHALL read annual rent, area, and months remaining (from the field or computed from a lease-expiry date and the as-of date), and treat a tenant as occupied when marked so or when annual rent is positive.',
      '3. `occupancy_pct` SHALL be occupied tenants ÷ tenants; `area_occupancy_pct` SHALL be occupied area ÷ total area (or null).',
      '4. `walt_months` SHALL be the rent-weighted average of the occupied tenants\' months remaining (occupied-rent-weighted), or null.',
      '5. `top_tenant_rent_pct` SHALL be the largest single tenant\'s rent ÷ total rent; `tenant_concentration_flag` SHALL be true iff it exceeds the single-tenant concentration threshold (constants: single-tenant concentration threshold).',
    ],
    constants: [
      { name: 'Single-tenant concentration threshold', value: '20% of total rent (0.20)', kind: 'cited_median_should', citation: 'Real estate industry practice — single-tenant concentration flag (2024)', pin: 'single tenant > 20% of total rent', effective: '2024 industry practice', nextCheck: 'on industry-practice review', traceValues: [0.2] },
    ],
    precisionRule: 'Occupancy and concentration ratios round per the global rule (half-even to 4 decimals — see the Conventions chapter); WALT is in months at 4 decimals; rents are exact integer cents.',
    inputs: {
      rent_roll: { type: 'object[]', desc: 'Tenant rows; each carries `tenant` (string), `annual_rent_cents` (integer cents), `square_feet`/`area` (number), `lease_months_remaining` (number) or `lease_expiry_date` (ISO date), and `occupied` (boolean).' },
      as_of_date: { type: 'string (ISO date)', desc: 'The as-of date used to compute months remaining from lease-expiry dates.' },
    },
    outputs: {
      tenant_count: { type: 'integer', desc: 'Number of tenant rows.' },
      occupied_tenant_count: { type: 'integer', desc: 'Number of occupied tenants.' },
      annual_rent_cents: { type: 'integer (cents)', desc: 'Total annual rent across all rows.', unit: 'cents' },
      occupied_annual_rent_cents: { type: 'integer (cents)', desc: 'Annual rent from occupied tenants.', unit: 'cents' },
      occupancy_pct: { type: 'number | null', desc: 'Occupied tenants ÷ total tenants.', precision: 4 },
      area_occupancy_pct: { type: 'number | null', desc: 'Occupied area ÷ total area, or null.', precision: 4 },
      walt_months: { type: 'number | null', desc: 'Rent-weighted average lease term in months, or null.', unit: 'months' },
      top_tenant_rent_pct: { type: 'number | null', desc: 'Largest tenant\'s rent ÷ total rent, or null.', precision: 4 },
      tenant_concentration_flag: { type: 'boolean', desc: 'Whether one tenant exceeds the concentration threshold.' },
    },
    derivedOutputs: ['tenant_count', 'occupied_tenant_count', 'annual_rent_cents', 'occupied_annual_rent_cents', 'occupancy_pct', 'area_occupancy_pct', 'walt_months', 'top_tenant_rent_pct'],
    boundary:
      'This model normalizes a rent roll into occupancy, WALT, and concentration metrics from supplied rows. The creditworthiness of the tenants, the collectability of the rent, and the market-rent read are underwriting judgments for the buyer and its advisers; the model computes the metrics and flags concentration and renders no underwriting conclusion.',
    golden: {
      narrative: 'A four-tenant office rent roll: three tenants occupied and one vacant suite, $1.20M in occupied rent, an anchor tenant at 50% of rent (over the concentration threshold), and a WALT weighted by the occupied rent.',
      input: { rent_roll: [ { tenant: 'Anchor Corp', annual_rent_cents: 60_000_000, square_feet: 20_000, lease_months_remaining: 72, occupied: true }, { tenant: 'Suite 200', annual_rent_cents: 36_000_000, square_feet: 12_000, lease_months_remaining: 36, occupied: true }, { tenant: 'Suite 300', annual_rent_cents: 24_000_000, square_feet: 8_000, lease_months_remaining: 24, occupied: true }, { tenant: 'Suite 400 (vacant)', annual_rent_cents: 0, square_feet: 8_000, occupied: false } ] },
    },
  },

  /* ══ M190 — NOI normalization & cap-rate bridge ══════════════════════ */
  M190: {
    purpose:
      'Bridges from a property\'s income to value and back — normalized NOI (effective gross income less operating expenses and a replacement reserve), the value that NOI supports at the market cap rate, and the cap rate a supplied purchase price implies. It answers, in a property valuation, "what NOI does this property produce, what value does the market cap rate put on it, and what cap rate is the ask really at?" The market cap rate is a pass-through input, not a model output.',
    algorithm: [
      'Given `effective_gross_income_cents`, `operating_expenses_cents`, and `cap_rate`, plus optional `purchase_price_cents`, `replacement_reserve_cents` (default 0), `market_cap_rate_from_pass_through_source`:',
      '1. If any required input is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.',
      '2. `normalized_noi_cents` SHALL be `effective_gross_income_cents − operating_expenses_cents − replacement_reserve_cents`.',
      '3. `value_from_cap_rate_cents` SHALL be `round(normalized_noi_cents ÷ cap_rate)` when the cap rate is positive, else null.',
      '4. `implied_cap_rate` SHALL be `normalized_noi_cents ÷ purchase_price_cents` at the global 4-decimal precision when a purchase price is supplied, else null.',
      '5. `pass_through_market_rate_required` SHALL be true unless the market cap rate is explicitly flagged as sourced from a pass-through provider.',
    ],
    constants: [],
    precisionRule: 'NOI and value are exact integer cents; cap rates round per the global rule (half-even to 4 decimals — see the Conventions chapter).',
    inputs: {
      effective_gross_income_cents: { type: 'integer (cents)', desc: 'Effective gross income (gross potential less vacancy/credit loss).', unit: 'cents' },
      operating_expenses_cents: { type: 'integer (cents)', desc: 'Operating expenses.', unit: 'cents' },
      cap_rate: { type: 'number', desc: 'The market capitalization rate (a fraction); a pass-through input.', precision: 4 },
      purchase_price_cents: { type: 'integer (cents)', desc: 'A purchase price to test; enables the implied cap rate.', unit: 'cents' },
      replacement_reserve_cents: { type: 'integer (cents)', desc: 'Replacement reserve deducted from NOI (default 0).', unit: 'cents' },
      market_cap_rate_from_pass_through_source: { type: 'boolean', desc: 'Whether the cap rate came from a pass-through market-data source; suppresses the pass-through-required flag.' },
    },
    outputs: {
      effective_gross_income_cents: { type: 'integer (cents)', desc: 'EGI, echoed.', unit: 'cents' },
      operating_expenses_cents: { type: 'integer (cents)', desc: 'Operating expenses, echoed.', unit: 'cents' },
      replacement_reserve_cents: { type: 'integer (cents)', desc: 'Replacement reserve, echoed.', unit: 'cents' },
      normalized_noi_cents: { type: 'integer (cents)', desc: 'Normalized NOI (EGI less expenses and reserve).', unit: 'cents' },
      cap_rate: { type: 'number', desc: 'The market cap rate applied.', precision: 4 },
      value_from_cap_rate_cents: { type: 'integer (cents) | null', desc: 'Value the NOI supports at the cap rate, or null.', unit: 'cents' },
      purchase_price_cents: { type: 'integer (cents) | null', desc: 'The purchase price tested, echoed, or null.', unit: 'cents' },
      implied_cap_rate: { type: 'number | null', desc: 'Cap rate implied by the purchase price, or null.', precision: 4 },
      pass_through_market_rate_required: { type: 'boolean', desc: 'Whether a pass-through market cap rate is still required.' },
    },
    derivedOutputs: ['normalized_noi_cents', 'value_from_cap_rate_cents', 'implied_cap_rate'],
    boundary:
      'This model bridges NOI to value and back from supplied income and a cap rate. The market cap rate itself is a pass-through input the model does not produce, and the appraised value and expense normalization are the appraiser\'s and accountant\'s determinations; the model computes the arithmetic bridge and renders no value opinion.',
    golden: {
      narrative: 'A property with $5M of effective gross income, $1.8M of operating expenses, and a $200k replacement reserve normalizes to $3M NOI; at a 6.5% market cap rate that supports about a $46.2M value, and against a $48M asking price the implied cap rate is 6.25%.',
      input: { effective_gross_income_cents: 500_000_000, operating_expenses_cents: 180_000_000, cap_rate: 0.065, purchase_price_cents: 4_800_000_000, replacement_reserve_cents: 20_000_000, market_cap_rate_from_pass_through_source: true },
    },
  },

  /* ══ M191 — Real-estate transfer & controlling-interest tax ══════════ */
  M191: {
    founderReview: true,
    purpose:
      'Computes the state real-estate transfer / controlling-interest transfer tax for a jurisdiction with a tabled rate — the tax base (fair value times the interest transferred), the tax at the state rate, and any controlling-interest aggregation window — and routes a contested state position when no rate is tabled. It answers, in a real-estate or entity deal, "what transfer tax does this state charge on this transfer, and over what aggregation window?" It computes the tax from the state table; contested or untabled positions route to a specialist.',
    algorithm: [
      'Given `jurisdiction`, `fmv_real_property_cents`, and `interest_transferred_pct` (a fraction), plus optional `transfer_tax_rate`, `exemption_applies` (default false):',
      '1. If any required input is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.',
      '2. It SHALL upper-case the jurisdiction and select the transfer-tax rate: the supplied rate, else the tabled state rate (constants: state transfer-tax rate table), else zero.',
      '3. `tax_base_cents` SHALL be `round(fmv_real_property_cents × interest_transferred_pct)`.',
      '4. `transfer_tax_cents` SHALL be 0 when an exemption applies, else `round(tax_base_cents × transfer_tax_rate)`.',
      '5. `aggregation_window_months` SHALL be the tabled controlling-interest aggregation window for the state, or null (constants: controlling-interest aggregation windows).',
      '6. `contested_state_position_handoff_required` SHALL be true iff no rate was supplied and the state is not in the rate table.',
    ],
    constants: [
      { name: 'State transfer-tax rate table', value: 'CT 1.11%, ME 0.44%, DC 1.45%, MD 1.00%, NY 0.65% (single-point default rates). WA is NOT tabled as a flat rate — its REET has been graduated since 2020 (state bands 1.10/1.28/2.75/3.00% + local), so a WA transfer routes to the state-tax specialist. DC/MD/NY are single-point simplifications of bracketed/combined levies — verify the specific bracket before relying on them.', kind: 'table_data', citation: 'CT § 12-638; MD Tax-Prop § 12-117; NY Publication 576; DC/ME transfer-tax statutes; WA RCW 82.45 (graduated — routes)', pin: 'per-state default controlling-interest/deed transfer-tax rates (single-point; WA graduated/routes)', effective: '2024 rate table', nextCheck: 'on state-rate review', traceValues: [0.0111, 0.0044, 0.0145, 0.01, 0.0065] },
      { name: 'Controlling-interest aggregation windows', value: 'MD 12 months, WA 12 months (RCW 82.45.033)', kind: 'table_data', citation: 'MD Tax-Prop § 12-117; WA RCW 82.45.033', pin: 'controlling-interest acting-in-concert aggregation windows', effective: '2024 table', nextCheck: 'on state-rate review', traceValues: [12] },
    ],
    precisionRule: 'Tax base and tax are exact integer cents; the rate and interest percentage round per the global rule (half-even to 4 decimals — see the Conventions chapter).',
    inputs: {
      jurisdiction: { type: 'string (US state code)', desc: 'The taxing jurisdiction (state/DC code).' },
      fmv_real_property_cents: { type: 'integer (cents)', desc: 'Fair market value of the real property.', unit: 'cents' },
      interest_transferred_pct: { type: 'number', desc: 'Fraction of the interest transferred (0–1).', precision: 4 },
      transfer_tax_rate: { type: 'number', desc: 'An override transfer-tax rate as a fraction; defaults to the state table.', precision: 4 },
      exemption_applies: { type: 'boolean', desc: 'Whether a transfer-tax exemption applies (default false); zeroes the tax.' },
    },
    outputs: {
      jurisdiction: { type: 'string (US state code)', desc: 'The jurisdiction, upper-cased.' },
      fmv_real_property_cents: { type: 'integer (cents)', desc: 'The fair market value, echoed.', unit: 'cents' },
      interest_transferred_pct: { type: 'number', desc: 'The interest transferred, as a fraction.', precision: 4 },
      transfer_tax_rate: { type: 'number', desc: 'The transfer-tax rate applied.', precision: 4 },
      tax_base_cents: { type: 'integer (cents)', desc: 'The tax base (value times interest transferred).', unit: 'cents' },
      transfer_tax_cents: { type: 'integer (cents)', desc: 'The transfer tax (zero when exempt).', unit: 'cents' },
      exemption_applies: { type: 'boolean', desc: 'Whether an exemption applied.' },
      aggregation_window_months: { type: 'integer | null', desc: 'The controlling-interest aggregation window in months, or null.', unit: 'months' },
      contested_state_position_handoff_required: { type: 'boolean', desc: 'True when the state is untabled and no rate was supplied.' },
    },
    derivedOutputs: ['tax_base_cents', 'transfer_tax_cents'],
    boundary:
      'This model computes state transfer / controlling-interest tax from a tabled rate and supplied values. Whether a transfer is taxable, whether an exemption applies, and the contested state positions (especially controlling-interest aggregation) are tax determinations for a state-tax specialist; on an untabled state the model routes the position and renders no taxability opinion.',
    golden: {
      narrative: 'A 100% controlling-interest transfer of a $10M Connecticut property: at Connecticut\'s 1.11% controlling-interest rate the base is the full $10M and the transfer tax is $111,000. (A Washington transfer, by contrast, routes to the specialist — WA\'s REET has been graduated since 2020, so no flat rate applies.)',
      input: { jurisdiction: 'CT', fmv_real_property_cents: 1_000_000_000, interest_transferred_pct: 1, exemption_applies: false },
    },
  },

  /* ══ M192 — CAM reconciliation mechanics ═════════════════════════════ */
  M192: {
    purpose:
      'Computes a tenant\'s CAM (common-area maintenance) reconciliation — the tenant\'s annual pro-rata share of recoverable expenses, the share prorated through a mid-period closing, and the true-up against what the tenant already paid. It answers, at a closing or year-end, "what does this tenant owe on CAM through the closing date, and is there a credit or a bill?" It computes the reconciliation from supplied figures.',
    algorithm: [
      'Given `recoverable_expenses_cents` and `tenant_pro_rata_pct` (supplied or computed from `tenant_area ÷ total_area`), plus optional `tenant_payments_cents` (default 0), `closing_day_of_period` (default 0), `period_days` (default 365):',
      '1. If recoverable expenses are missing and no pro-rata share can be resolved, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.',
      '2. `annual_tenant_share_cents` SHALL be `round(recoverable_expenses_cents × tenant_pro_rata_pct)`.',
      '3. `prorated_tenant_share_through_closing_cents` SHALL be `round(annual_tenant_share_cents × clamp(closing_day_of_period ÷ period_days, 0, 1))`.',
      '4. `closing_true_up_cents` SHALL be `prorated_tenant_share_through_closing_cents − tenant_payments_cents` (positive = tenant owes; negative = credit to tenant).',
      '5. `tenant_pro_rata_pct` SHALL echo at the global 4-decimal precision.',
    ],
    constants: [],
    precisionRule: 'Shares and true-up are exact integer cents; the pro-rata share rounds per the global rule (half-even to 4 decimals — see the Conventions chapter).',
    inputs: {
      recoverable_expenses_cents: { type: 'integer (cents)', desc: 'Total recoverable CAM expenses for the period.', unit: 'cents' },
      tenant_pro_rata_pct: { type: 'number', desc: 'The tenant\'s pro-rata share as a fraction; if omitted, computed from tenant_area ÷ total_area.', precision: 4 },
      tenant_area: { type: 'number', desc: 'The tenant\'s leased area (used with total_area when the share is omitted).' },
      total_area: { type: 'number', desc: 'Total leasable area (used with tenant_area when the share is omitted).' },
      tenant_payments_cents: { type: 'integer (cents)', desc: 'CAM the tenant has already paid for the period (default 0).', unit: 'cents' },
      closing_day_of_period: { type: 'number', desc: 'Day of the period at closing, for proration (default 0).', unit: 'days' },
      period_days: { type: 'number', desc: 'Days in the reconciliation period (default 365).', unit: 'days' },
    },
    outputs: {
      recoverable_expenses_cents: { type: 'integer (cents)', desc: 'Recoverable expenses, echoed.', unit: 'cents' },
      tenant_pro_rata_pct: { type: 'number', desc: 'The pro-rata share applied.', precision: 4 },
      annual_tenant_share_cents: { type: 'integer (cents)', desc: 'The tenant\'s full-period share.', unit: 'cents' },
      prorated_tenant_share_through_closing_cents: { type: 'integer (cents)', desc: 'The share prorated through the closing day.', unit: 'cents' },
      tenant_payments_cents: { type: 'integer (cents)', desc: 'Payments already made, echoed.', unit: 'cents' },
      closing_true_up_cents: { type: 'integer (cents)', desc: 'Prorated share less payments (positive = owed by tenant; negative = credit).', unit: 'cents' },
    },
    derivedOutputs: ['annual_tenant_share_cents', 'prorated_tenant_share_through_closing_cents', 'closing_true_up_cents'],
    boundary:
      'This model computes the CAM reconciliation from supplied figures. Which expenses are recoverable, the gross-up and base-year mechanics in the lease, and any dispute over the calculation are lease-interpretation questions for the parties and counsel; the model computes the arithmetic and renders no interpretation of the CAM clause.',
    golden: {
      narrative: 'A tenant with an 8% pro-rata share of $1.2M in recoverable expenses owes $96,000 for the year; prorated to about $47,342 through a mid-year (day-180) closing against $60,000 already paid, the closing true-up is a ~$12,658 credit back to the tenant.',
      input: { recoverable_expenses_cents: 120_000_000, tenant_pro_rata_pct: 0.08, tenant_payments_cents: 6_000_000, closing_day_of_period: 180, period_days: 365 },
    },
  },

  /* ══ M193 — Lease abstraction schema ═════════════════════════════════ */
  M193: {
    purpose:
      'Abstracts a set of leases into a structured schema — tenant, rent, expiry, months remaining, assignment and change-of-control consent, renewal options, and the exclusive-use / co-tenancy / go-dark flags — and rolls up total rent, WALT, and the counts of each restriction. It answers, in lease diligence, "what do these leases actually say on the fields that matter, and where are the restrictions?" It captures the fields without interpreting enforceability.',
    algorithm: [
      'Given `leases` (a list of lease objects) and optional `as_of_date`:',
      '1. If `leases` is empty, the implementation SHALL return `status: "needs_inputs"` naming `leases`.',
      '2. For each lease it SHALL capture annual rent, expiry date, months remaining (from the field or computed from the expiry and the as-of date), the assignment and change-of-control consent flags, the renewal-option count, and the exclusive-use, co-tenancy, and go-dark flags.',
      '3. `annual_rent_cents` SHALL be the sum of the per-lease rents.',
      '4. `walt_months` SHALL be the rent-weighted average of months remaining, or null.',
      '5. It SHALL count leases and the assignment-consent, change-of-control-consent, exclusive-use, co-tenancy, and go-dark leases, and return the full abstraction detail.',
    ],
    constants: [],
    precisionRule: 'Rents are exact integer cents; WALT is in months at the global 4-decimal precision (see the Conventions chapter).',
    inputs: {
      leases: { type: 'object[]', desc: 'Leases to abstract; each carries `tenant` (string), `annual_rent_cents` (integer cents), `expiry_date` (ISO date), `months_remaining` (number), `assignment_consent_required` (boolean), `change_of_control_consent_required` (boolean), `renewal_options_count` (integer), `exclusive_use` (boolean), `co_tenancy` (boolean), and `go_dark` (boolean).' },
      as_of_date: { type: 'string (ISO date)', desc: 'As-of date to compute months remaining from expiry dates.' },
    },
    outputs: {
      lease_count: { type: 'integer', desc: 'Number of leases abstracted.' },
      annual_rent_cents: { type: 'integer (cents)', desc: 'Total annual rent across all leases.', unit: 'cents' },
      walt_months: { type: 'number | null', desc: 'Rent-weighted average lease term in months, or null.', unit: 'months' },
      assignment_consent_required_count: { type: 'integer', desc: 'Number requiring assignment consent.' },
      change_of_control_consent_required_count: { type: 'integer', desc: 'Number requiring change-of-control consent.' },
      exclusives_count: { type: 'integer', desc: 'Number with an exclusive-use clause.' },
      co_tenancy_count: { type: 'integer', desc: 'Number with a co-tenancy clause.' },
      go_dark_count: { type: 'integer', desc: 'Number with a go-dark right.' },
      abstraction_rows: { type: 'object[]', desc: 'Per-lease detail: `{ tenant, annual_rent_cents, expiry_date, months_remaining, assignment_consent_required, change_of_control_consent_required, renewal_options_count, exclusive_use, co_tenancy, go_dark }`.' },
    },
    derivedOutputs: ['lease_count', 'annual_rent_cents', 'walt_months', 'assignment_consent_required_count', 'change_of_control_consent_required_count', 'exclusives_count', 'co_tenancy_count', 'go_dark_count', 'abstraction_rows'],
    boundary:
      'This model captures lease fields into a structured schema without interpreting them. Whether a consent clause is triggered, how an exclusive-use or co-tenancy provision operates, and the enforceability of any term are legal determinations for counsel; the model abstracts the fields and rolls up the counts and renders no interpretation.',
    golden: {
      narrative: 'Three retail leases abstracted: $2.4M of total rent, two requiring change-of-control consent, one exclusive-use and one co-tenancy clause, and a rent-weighted lease term rolled up across the three.',
      input: { leases: [ { tenant: 'Anchor', annual_rent_cents: 120_000_000, months_remaining: 96, assignment_consent_required: true, change_of_control_consent_required: true, renewal_options_count: 2, exclusive_use: true }, { tenant: 'Inline A', annual_rent_cents: 72_000_000, months_remaining: 48, change_of_control_consent_required: true, co_tenancy: true }, { tenant: 'Inline B', annual_rent_cents: 48_000_000, months_remaining: 24, go_dark: true } ] },
    },
  },

  /* ══ M194 — OpCo/PropCo separation mechanics ═════════════════════════ */
  M194: {
    founderReview: true,
    purpose:
      'Sizes an OpCo/PropCo separation — the arm\'s-length master-lease rent (property value at the target cap rate, or supplied), the OpCo EBITDA before and after rent, the rent coverage, and whether the lease term or residual value trips a true-lease recharacterization review. It answers, in a sale-leaseback or OpCo/PropCo split, "what rent does the property carry, can the operating business cover it, and does the lease risk being recharacterized?" It computes the mechanics; the tax and accounting characterization is the specialist\'s.',
    algorithm: [
      'Given `real_property_value_cents`, `target_cap_rate`, and `opco_ebitda_cents`, plus optional `annual_master_lease_rent_cents`, `lease_term_years`, `residual_value_pct`:',
      '1. If any required input is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.',
      '2. `annual_master_lease_rent_cents` SHALL be the supplied rent, else `round(real_property_value_cents × target_cap_rate)`.',
      '3. `implied_rent_yield` SHALL be `rent ÷ real_property_value_cents`; `opco_ebitda_after_rent_cents` SHALL be `opco_ebitda_cents − rent`; `rent_to_ebitda_pct` SHALL be `rent ÷ opco_ebitda_cents` (both at the global 4-decimal precision, or null).',
      '4. `recharacterization_review_required` SHALL be true iff the lease term is at or above the recharacterization term threshold (constants: true-lease term threshold) OR the residual value is below the residual threshold (constants: true-lease residual threshold).',
      '5. `tax_accounting_handoff_required` SHALL always be true.',
    ],
    constants: [
      { name: 'True-lease term threshold', value: '30 years', kind: 'cited_median_should', citation: 'OpCo/PropCo master-lease characterization market practice (2024)', pin: 'lease term ≥ 30 years triggers recharacterization review', effective: '2024 market practice', nextCheck: 'on practice review', traceValues: [30] },
      { name: 'True-lease residual threshold', value: '20% residual value (0.20)', kind: 'cited_median_should', citation: 'True-lease residual-value convention; cf. Rev. Proc. 2001-28 (2001)', pin: 'residual value < 20% triggers recharacterization review', effective: '2024 market practice', nextCheck: 'on practice review', traceValues: [0.2] },
    ],
    precisionRule: 'Monetary outputs are exact integer cents; yields and coverage round per the global rule (half-even to 4 decimals — see the Conventions chapter).',
    inputs: {
      real_property_value_cents: { type: 'integer (cents)', desc: 'Value of the property held in PropCo.', unit: 'cents' },
      target_cap_rate: { type: 'number', desc: 'Target cap rate used to set the master-lease rent (a fraction).', precision: 4 },
      opco_ebitda_cents: { type: 'integer (cents)', desc: 'OpCo EBITDA before rent.', unit: 'cents' },
      annual_master_lease_rent_cents: { type: 'integer (cents)', desc: 'Override master-lease rent; defaults to value × cap rate.', unit: 'cents' },
      lease_term_years: { type: 'number', desc: 'Master-lease term in years; drives the recharacterization term test.', unit: 'years' },
      residual_value_pct: { type: 'number', desc: 'Projected residual value as a fraction; drives the recharacterization residual test.', precision: 4 },
    },
    outputs: {
      real_property_value_cents: { type: 'integer (cents)', desc: 'Property value, echoed.', unit: 'cents' },
      annual_master_lease_rent_cents: { type: 'integer (cents)', desc: 'The master-lease rent (supplied or computed).', unit: 'cents' },
      implied_rent_yield: { type: 'number | null', desc: 'Rent ÷ property value, or null.', precision: 4 },
      opco_ebitda_before_rent_cents: { type: 'integer (cents)', desc: 'OpCo EBITDA before rent, echoed.', unit: 'cents' },
      opco_ebitda_after_rent_cents: { type: 'integer (cents)', desc: 'OpCo EBITDA after the master-lease rent.', unit: 'cents' },
      rent_to_ebitda_pct: { type: 'number | null', desc: 'Rent as a fraction of OpCo EBITDA, or null.', precision: 4 },
      lease_term_years: { type: 'number | null', desc: 'The lease term, echoed, or null.', unit: 'years' },
      residual_value_pct: { type: 'number | null', desc: 'The residual-value fraction, echoed, or null.', precision: 4 },
      recharacterization_review_required: { type: 'boolean', desc: 'Whether the lease term or residual trips a true-lease recharacterization review.' },
      tax_accounting_handoff_required: { type: 'boolean', desc: 'Always true — the characterization routes to specialists.' },
    },
    derivedOutputs: ['annual_master_lease_rent_cents', 'implied_rent_yield', 'opco_ebitda_after_rent_cents', 'rent_to_ebitda_pct'],
    boundary:
      'This model sizes the OpCo/PropCo master lease and screens the recharacterization thresholds from supplied facts. Whether the lease is a true lease or a financing for tax and accounting, the §163(j) interest consequences, and any REIT interaction are determinations for tax and accounting specialists; the model computes the mechanics and always routes the characterization, rendering no conclusion.',
    golden: {
      narrative: 'A $50M property master-leased to the OpCo at a 7% yield ($3.5M rent) leaves $4.5M of OpCo EBITDA after rent (a 44% rent-to-EBITDA); a 20-year term with 25% residual value stays clear of the true-lease recharacterization thresholds — the characterization still routes to specialists.',
      input: { real_property_value_cents: 5_000_000_000, target_cap_rate: 0.07, opco_ebitda_cents: 800_000_000, lease_term_years: 20, residual_value_pct: 0.25 },
    },
  },

  /* ══ M195 — Property-level escrow & holdback sizing ══════════════════ */
  M195: {
    purpose:
      'Sizes the property-level escrows a deal holds back — bucketing each supplied issue into environmental, PCA, title, tenant, cost-to-cure, or other, applying its holdback percentage and a general buffer, and totaling each bucket and the aggregate. It answers, at a real-estate closing, "how much do we hold back for each open property issue, and where do specialist reports back the number?" It sizes the escrows from supplied issues; the underlying cost estimates are the specialists\'.',
    algorithm: [
      'Given `issues` (a list of issue objects) and optional `general_buffer_rate` (default 0):',
      '1. If `issues` is empty, the implementation SHALL return `status: "needs_inputs"` naming `issues`.',
      '2. For each issue it SHALL classify the category (environmental, pca, title, tenant, cost_to_cure, or other) from the type, take the amount, and compute `escrow_cents = round(amount × holdback_pct × (1 + general_buffer_rate))` (holdback defaulting to 1).',
      '3. It SHALL total the escrow by category into the environmental, PCA, title, tenant, cost-to-cure, and other bucket outputs, and sum the aggregate.',
      '4. `pass_through_source_required` SHALL default true for environmental, PCA, and title issues (report-backed); `pass_through_source_required_count` SHALL count them.',
      '5. It SHALL return the full per-issue escrow detail.',
    ],
    constants: [],
    precisionRule: 'Escrow amounts are exact integer cents; the holdback and buffer round per the global rule (half-even to 4 decimals — see the Conventions chapter).',
    inputs: {
      issues: { type: 'object[]', desc: 'Property issues; each carries `name` (string), `type`/`category` (string), `amount_cents`/`cost_to_cure_cents` (integer cents), `holdback_pct` (number, default 1), `source` (string), and `pass_through_source_required` (boolean).' },
      general_buffer_rate: { type: 'number', desc: 'A general buffer added to every escrow as a fraction (default 0).', precision: 4 },
    },
    outputs: {
      property_issue_count: { type: 'integer', desc: 'Number of property issues.' },
      general_buffer_rate: { type: 'number', desc: 'The general buffer applied.', precision: 4 },
      environmental_escrow_cents: { type: 'integer (cents)', desc: 'Total environmental escrow.', unit: 'cents' },
      pca_reserve_escrow_cents: { type: 'integer (cents)', desc: 'Total PCA/physical-condition escrow.', unit: 'cents' },
      title_exception_escrow_cents: { type: 'integer (cents)', desc: 'Total title-exception escrow.', unit: 'cents' },
      tenant_dispute_escrow_cents: { type: 'integer (cents)', desc: 'Total tenant-dispute escrow.', unit: 'cents' },
      cost_to_cure_escrow_cents: { type: 'integer (cents)', desc: 'Total cost-to-cure escrow.', unit: 'cents' },
      other_property_escrow_cents: { type: 'integer (cents)', desc: 'Total other-category escrow.', unit: 'cents' },
      total_property_escrow_cents: { type: 'integer (cents)', desc: 'Aggregate property escrow.', unit: 'cents' },
      pass_through_source_required_count: { type: 'integer', desc: 'Number of issues needing a pass-through specialist report.' },
      escrow_rows: { type: 'object[]', desc: 'Per-issue detail: `{ issue, category (a property_escrow_category value), source, amount_cents, holdback_pct, escrow_cents, pass_through_source_required }`.' },
    },
    derivedOutputs: ['property_issue_count', 'general_buffer_rate', 'environmental_escrow_cents', 'pca_reserve_escrow_cents', 'title_exception_escrow_cents', 'tenant_dispute_escrow_cents', 'cost_to_cure_escrow_cents', 'other_property_escrow_cents', 'total_property_escrow_cents', 'pass_through_source_required_count', 'escrow_rows'],
    boundary:
      'This model sizes property escrows by category from supplied issues and holdback percentages. The underlying cost estimates (Phase II, PCA, cure costs) are the specialists\' work, and the escrow that actually protects the buyer is a negotiation for the parties and counsel; the model applies the arithmetic and routes the report-backed issues, and sets no binding escrow.',
    golden: {
      narrative: 'Three property issues escrowed at closing: a $500k Phase II environmental holdback, a $200k roof reserve, and a $100k title exception held back at 50% — $750k in aggregate, three of them backed by pass-through specialist reports.',
      input: { issues: [ { name: 'Phase II environmental', type: 'environmental', amount_cents: 50_000_000, holdback_pct: 1 }, { name: 'Roof replacement', type: 'pca', amount_cents: 20_000_000, holdback_pct: 1 }, { name: 'Title exception', type: 'title', amount_cents: 10_000_000, holdback_pct: 0.5 } ], general_buffer_rate: 0 },
    },
  },

  /* ══ M196 — Title & survey process checklist ═════════════════════════ */
  M196: {
    purpose:
      'Sequences the title-and-survey workstream — commitment and survey receipt, Schedule B-II exception count, policy and endorsement selection, the curative work plan with its open items and cost-to-cure, and the closing-protection letter — into a checklist with the counts that show where the work stands. It answers, in a real-estate closing, "what title and survey steps remain, how many exceptions and curative items are open, and what will cure cost?" It sequences the process from supplied facts.',
    algorithm: [
      'Given `title_commitment_received` and `survey_received`, plus optional `schedule_b_exceptions`, `curative_items`, `alta_endorsements_requested`, and the policy/closing-protection flags:',
      '1. If either required boolean is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.',
      '2. It SHALL count Schedule B-II exceptions and requested ALTA endorsements.',
      '3. For each curative item it SHALL take a status and cost-to-cure and mark it open unless closed/resolved/waived; it SHALL count items and open items and sum the cost-to-cure.',
      '4. `survey_review_required` SHALL be true iff a survey was received; the owner-policy, lender-policy, and closing-protection-letter flags SHALL default per practice.',
      '5. It SHALL return the ordered process steps and the full curative detail; `title_pass_through_source_required` SHALL always be true.',
    ],
    constants: [],
    precisionRule: 'Cost-to-cure is exact integer cents; the rest are counts and booleans (see the Conventions chapter).',
    inputs: {
      title_commitment_received: { type: 'boolean', desc: 'Whether the title commitment is in hand.' },
      survey_received: { type: 'boolean', desc: 'Whether the survey is in hand.' },
      schedule_b_exceptions: { type: 'object[]', desc: 'Schedule B-II exception rows (counted).' },
      curative_items: { type: 'object[]', desc: 'Curative items; each carries `item` (string), `status` (string), and `cost_to_cure_cents` (integer cents).' },
      alta_endorsements_requested: { type: 'string[]', desc: 'ALTA endorsements requested (counted).' },
      owner_policy_required: { type: 'boolean', desc: 'Whether an owner\'s policy is required (default true).' },
      lender_policy_required: { type: 'boolean', desc: 'Whether a lender\'s policy is required (default false).' },
      closing_protection_letter_required: { type: 'boolean', desc: 'Whether a closing-protection letter is required (default true).' },
    },
    outputs: {
      title_commitment_received: { type: 'boolean', desc: 'The commitment-received flag, echoed.' },
      survey_received: { type: 'boolean', desc: 'The survey-received flag, echoed.' },
      schedule_b_exception_count: { type: 'integer', desc: 'Number of Schedule B-II exceptions.' },
      survey_review_required: { type: 'boolean', desc: 'Whether survey review is required.' },
      owner_policy_required: { type: 'boolean', desc: 'Whether an owner\'s policy is required.' },
      lender_policy_required: { type: 'boolean', desc: 'Whether a lender\'s policy is required.' },
      alta_endorsements_requested_count: { type: 'integer', desc: 'Number of ALTA endorsements requested.' },
      curative_item_count: { type: 'integer', desc: 'Number of curative items.' },
      open_curative_item_count: { type: 'integer', desc: 'Number of open curative items.' },
      curative_cost_to_cure_cents: { type: 'integer (cents)', desc: 'Total cost to cure the curative items.', unit: 'cents' },
      closing_protection_letter_required: { type: 'boolean', desc: 'Whether a closing-protection letter is required.' },
      title_pass_through_source_required: { type: 'boolean', desc: 'Always true — the title work is a pass-through source.' },
      process_steps: { type: 'string[]', desc: 'The ordered title/survey process steps.' },
      curative_rows: { type: 'object[]', desc: 'Per-curative-item detail: `{ item, status, cost_to_cure_cents, open }`.' },
    },
    derivedOutputs: ['schedule_b_exception_count', 'alta_endorsements_requested_count', 'curative_item_count', 'open_curative_item_count', 'curative_cost_to_cure_cents', 'curative_rows'],
    boundary:
      'This model sequences the title and survey process and counts the open items from supplied facts. Whether a Schedule B-II exception is acceptable, how to cure it, and the legal effect of the survey are determinations for title counsel and the title insurer; the model organizes the workstream and totals the cost-to-cure and renders no title conclusion.',
    golden: {
      narrative: 'Title commitment and survey both in hand: three Schedule B-II exceptions, three ALTA endorsements requested, and two curative items — one open $300k mortgage payoff — with the owner policy and closing-protection letter required.',
      input: { title_commitment_received: true, survey_received: true, schedule_b_exceptions: [ { exception: 'Utility easement' }, { exception: 'Setback line' }, { exception: 'CC&Rs' } ], alta_endorsements_requested: ['zoning', 'access', 'survey'], curative_items: [ { item: 'Old mortgage payoff', status: 'open', cost_to_cure_cents: 30_000_000 }, { item: 'Mechanic lien release', status: 'resolved', cost_to_cure_cents: 0 } ] },
    },
  },

  /* ══ M197 — Ground lease vs. fee simple mechanics ════════════════════ */
  M197: {
    purpose:
      'Computes the financeability tail on a ground lease — the years remaining after loan maturity — and tests it against the lender\'s minimum, then combines it with a lender recognition agreement to flag leasehold mortgageability. It answers, for a leasehold acquisition or financing, "does the ground lease run long enough past the loan, and are the lender protections in place to make the leasehold mortgageable?" It computes the tail and the flags; the financeability judgment routes to counsel.',
    algorithm: [
      'Given `ground_lease_expiry_date`, `loan_maturity_date`, and `annual_ground_rent_cents`, plus optional `required_tail_years` (default: the minimum-tail constant), `rent_reset_type`, `lender_recognition_agreement` (default false):',
      '1. If any required input is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.',
      '2. `tail_years_after_loan_maturity` SHALL be the years between loan maturity and lease expiry, at the global 4-decimal precision.',
      '3. `required_tail_years` SHALL be the supplied value, else the minimum financeable tail (constants: minimum financeable ground-lease tail).',
      '4. `lender_tail_requirement_satisfied` SHALL be true iff the tail meets or exceeds the required tail.',
      '5. `leasehold_mortgageability_flag` SHALL be true iff the tail requirement is satisfied AND a lender recognition agreement is in place; `counsel_review_required` SHALL always be true.',
    ],
    constants: [
      { name: 'Minimum financeable ground-lease tail', value: '25 years', kind: 'cited_median_should', citation: 'Ground-lease lender financeability practice — minimum tail beyond loan maturity (2024)', pin: 'institutional minimum tail beyond loan maturity (20–25 years)', effective: '2024 lender practice', nextCheck: 'on lender-practice review', traceValues: [25] },
    ],
    precisionRule: 'The tail is in years at the global 4-decimal precision (see the Conventions chapter); rent is exact integer cents.',
    inputs: {
      ground_lease_expiry_date: { type: 'string (ISO date)', desc: 'When the ground lease expires.' },
      loan_maturity_date: { type: 'string (ISO date)', desc: 'When the leasehold loan matures.' },
      annual_ground_rent_cents: { type: 'integer (cents)', desc: 'Annual ground rent.', unit: 'cents' },
      required_tail_years: { type: 'number', desc: 'The lender\'s minimum tail beyond loan maturity in years; defaults to the market minimum.', unit: 'years' },
      rent_reset_type: { type: 'string', desc: 'How the ground rent resets (e.g., CPI, fair-market, fixed); echoed.' },
      lender_recognition_agreement: { type: 'boolean', desc: 'Whether a lender recognition (SNDA-style) agreement is in place (default false).' },
    },
    outputs: {
      ground_lease_expiry_date: { type: 'string (ISO date)', desc: 'The lease expiry, echoed.' },
      loan_maturity_date: { type: 'string (ISO date)', desc: 'The loan maturity, echoed.' },
      annual_ground_rent_cents: { type: 'integer (cents)', desc: 'The annual ground rent, echoed.', unit: 'cents' },
      rent_reset_type: { type: 'string', desc: 'The rent-reset type, echoed.' },
      tail_years_after_loan_maturity: { type: 'number', desc: 'Years the lease runs past loan maturity.', unit: 'years' },
      required_tail_years: { type: 'number', desc: 'The required minimum tail applied.', unit: 'years' },
      lender_tail_requirement_satisfied: { type: 'boolean', desc: 'Whether the tail meets the requirement.' },
      lender_recognition_agreement: { type: 'boolean', desc: 'Whether a lender recognition agreement is in place.' },
      leasehold_mortgageability_flag: { type: 'boolean', desc: 'Whether the leasehold is mortgageable on these facts.' },
      counsel_review_required: { type: 'boolean', desc: 'Always true — the financeability judgment routes to counsel.' },
    },
    derivedOutputs: ['tail_years_after_loan_maturity'],
    boundary:
      'This model computes the ground-lease financeability tail and the mortgageability flag from supplied dates and facts. Whether the lease is in fact financeable — the estoppel, cure, and recognition provisions, and the leasehold-mortgagee protections — is a legal determination for counsel and the leasehold lender; the model computes the tail and always routes the judgment, rendering no financeability conclusion.',
    golden: {
      narrative: 'A ground lease running to 2075 against a loan maturing in 2036 leaves roughly a 39-year tail — well beyond the 25-year minimum — and with a lender recognition agreement in place the leasehold reads as mortgageable, subject to counsel review.',
      input: { ground_lease_expiry_date: '2075-01-01', loan_maturity_date: '2036-01-01', annual_ground_rent_cents: 50_000_000, required_tail_years: 25, rent_reset_type: 'cpi', lender_recognition_agreement: true },
    },
  },

  /* ══ M198 — PCA reserve modeling ═════════════════════════════════════ */
  M198: {
    purpose:
      'Rolls a property-condition-assessment item list into the reserve schedule a lender underwrites — the immediate-repair escrow (scaled by the lender reserve percentage) and the year-1–3, year-4–5, and year-6–12 replacement reserves — plus the total per item. It answers, from a PCA report, "what immediate-repair escrow and multi-year replacement reserves does this property need?" It rolls up the reserves from supplied PCA figures; the condition findings are the engineer\'s.',
    algorithm: [
      'Given `pca_items` (a list of PCA item objects) and optional `lender_reserve_pct` (default 1):',
      '1. If `pca_items` is empty, the implementation SHALL return `status: "needs_inputs"` naming `pca_items`.',
      '2. For each item it SHALL take the immediate-repair, year-1–3, year-4–5, and year-6–12 amounts, and set `total_reserve_cents` to their sum.',
      '3. `immediate_repair_escrow_cents` SHALL be `round(total immediate repair × lender_reserve_pct)`.',
      '4. The `year_1_3_reserve_cents`, `year_4_5_reserve_cents`, and `year_6_12_reserve_cents` SHALL be the sums of the respective per-item amounts; `total_replacement_reserve_cents` SHALL be the sum of all item totals.',
      '5. `pca_pass_through_source_required` SHALL always be true; it SHALL return the full per-item detail.',
    ],
    constants: [],
    precisionRule: 'All reserves are exact integer cents; the lender reserve percentage rounds per the global rule (half-even to 4 decimals — see the Conventions chapter).',
    inputs: {
      pca_items: { type: 'object[]', desc: 'PCA items; each carries `item` (string) and integer-cents `immediate_repair_cents`, `year_1_3_cents` (or `near_term_cents`), `year_4_5_cents`, and `year_6_12_cents`, plus a `source` string.' },
      lender_reserve_pct: { type: 'number', desc: 'Fraction of immediate-repair cost the lender escrows (default 1 = 100%).', precision: 4 },
    },
    outputs: {
      pca_item_count: { type: 'integer', desc: 'Number of PCA items.' },
      immediate_repair_escrow_cents: { type: 'integer (cents)', desc: 'Immediate-repair escrow at the lender reserve percentage.', unit: 'cents' },
      year_1_3_reserve_cents: { type: 'integer (cents)', desc: 'Year-1–3 replacement reserve.', unit: 'cents' },
      year_4_5_reserve_cents: { type: 'integer (cents)', desc: 'Year-4–5 replacement reserve.', unit: 'cents' },
      year_6_12_reserve_cents: { type: 'integer (cents)', desc: 'Year-6–12 replacement reserve.', unit: 'cents' },
      total_replacement_reserve_cents: { type: 'integer (cents)', desc: 'Total replacement reserve across all items and horizons.', unit: 'cents' },
      pca_pass_through_source_required: { type: 'boolean', desc: 'Always true — the PCA report is a pass-through source.' },
      reserve_rows: { type: 'object[]', desc: 'Per-item detail: `{ item, immediate_repair_cents, year_1_3_cents, year_4_5_cents, year_6_12_cents, total_reserve_cents, source }`.' },
    },
    derivedOutputs: ['pca_item_count', 'immediate_repair_escrow_cents', 'year_1_3_reserve_cents', 'year_4_5_reserve_cents', 'year_6_12_reserve_cents', 'total_replacement_reserve_cents', 'reserve_rows'],
    boundary:
      'This model rolls PCA figures into an immediate-repair escrow and multi-year reserves from supplied amounts. The condition findings, the useful-life estimates, and the repair scope are the engineer\'s determinations, and the reserve the lender actually requires is its underwriting call; the model totals the reserves and renders no engineering or underwriting conclusion.',
    golden: {
      narrative: 'A PCA with two items — a $150k immediate roof repair and a $400k year-4–5 HVAC replacement, plus $80k of near-term parking work — yields a $150k immediate-repair escrow at full lender reserve and a $630k total replacement reserve.',
      input: { pca_items: [ { item: 'Roof repair', immediate_repair_cents: 15_000_000, year_1_3_cents: 8_000_000 }, { item: 'HVAC replacement', year_4_5_cents: 40_000_000 } ], lender_reserve_pct: 1 },
    },
  },

  /* ══ M199 — FIRPTA withholding v1.1 ══════════════════════════════════ */
  M199: {
    founderReview: true,
    purpose:
      'Determines FIRPTA withholding on a foreign seller\'s disposition with the v1.1 refinements — the 15% default, the reduced 10% and zero residence paths, the dated Form 8288 deadline, the reduced-withholding-certificate path, and a §1031 timing-gap flag when an exchange collides with the withholding. It answers, at a closing with a foreign seller, "how much must the buyer withhold, by what date, and does a certificate or a 1031 exchange change the timing?" It computes the withholding and the timing flags; the certificate and exchange determinations are the tax advisor\'s.',
    algorithm: [
      'Given `amount_realized_cents` and `seller_foreign_person`, plus optional `buyer_will_use_as_residence` (default false), `closing_date`, `form_8288_b_reduced_withholding_requested` (default false), `section_1031_exchange` (default false):',
      '1. If either required input is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.',
      '2. It SHALL resolve `withholding_rate` and `path` exactly as in M169: zero for a domestic seller; the residence exemption at or below the exemption ceiling; the reduced residence rate at or below the reduced-rate ceiling; else the default rate (constants: FIRPTA default withholding rate, FIRPTA reduced residence rate, FIRPTA residence ceilings).',
      '3. `withholding_amount_cents` SHALL be `round(amount_realized_cents × withholding_rate)`.',
      '4. `forms_8288_due_date` SHALL be the closing date advanced by the Form 8288 deadline when a foreign seller is withheld upon and a closing date is supplied, else null (constants: FIRPTA Form 8288 filing deadline).',
      '5. `reduced_certificate_processing_days_estimate` SHALL be the IRS Form 8288-B processing estimate when a reduced-withholding certificate is requested, else null (a planning estimate, not a statutory period); `section_1031_timing_gap_flag` SHALL be true iff a §1031 exchange coincides with withholding on a foreign seller.',
    ],
    constants: [
      { name: 'FIRPTA default withholding rate', value: '15% (0.15)', kind: 'statutory_must', citation: 'IRC § 1445(a); IRC § 897', pin: '§ 1445(a)', effective: 'current (IRC as amended)', nextCheck: 'on IRC amendment', traceValues: [0.15] },
      { name: 'FIRPTA reduced residence rate', value: '10% (0.10)', kind: 'statutory_must', citation: 'IRC § 1445', pin: '§ 1445(c)(4) reduced-rate residence path', effective: 'current (IRC as amended)', nextCheck: 'on IRC amendment', traceValues: [0.1] },
      { name: 'FIRPTA personal-residence exemption ceiling', value: '$300,000 (30,000,000 cents)', kind: 'statutory_must', citation: 'IRC § 1445(b)(5)', pin: '§ 1445(b)(5)', effective: 'current (IRC as amended)', nextCheck: 'on IRC amendment' },
      { name: 'FIRPTA reduced-rate residence ceiling', value: '$1,000,000 (100,000,000 cents)', kind: 'statutory_must', citation: 'IRC § 1445; Treas. Reg. § 1.1445-1', pin: 'reduced-rate residence ceiling', effective: 'current (Treas. Reg. as amended)', nextCheck: 'on Treasury amendment' },
      { name: 'FIRPTA Form 8288 filing deadline', value: '20 days', kind: 'statutory_must', citation: 'IRC § 1445; Treas. Reg. § 1.1445-1', pin: 'remit and file by the 20th day after transfer', effective: 'current (Treas. Reg. as amended)', nextCheck: 'on Treasury amendment', traceValues: [20] },
    ],
    precisionRule: 'The withholding amount is exact integer cents; the deadline is an ISO-8601 date (see the Conventions chapter).',
    inputs: {
      amount_realized_cents: { type: 'integer (cents)', desc: 'The amount realized (the withholding base).', unit: 'cents' },
      seller_foreign_person: { type: 'boolean', desc: 'Whether the seller is a foreign person.' },
      buyer_will_use_as_residence: { type: 'boolean', desc: 'Whether the buyer will use the property as a residence (default false).' },
      closing_date: { type: 'string (ISO date)', desc: 'The closing date; dates the Form 8288 deadline.' },
      form_8288_b_reduced_withholding_requested: { type: 'boolean', desc: 'Whether a Form 8288-B reduced-withholding certificate is requested (default false).' },
      section_1031_exchange: { type: 'boolean', desc: 'Whether the disposition is part of a §1031 exchange (default false); drives the timing-gap flag.' },
    },
    outputs: {
      amount_realized_cents: { type: 'integer (cents)', desc: 'The amount realized, echoed.', unit: 'cents' },
      seller_foreign_person: { type: 'boolean', desc: 'The foreign-person flag, echoed.' },
      buyer_will_use_as_residence: { type: 'boolean', desc: 'The residence-use flag, echoed.' },
      withholding_rate: { type: 'number', desc: 'The FIRPTA withholding rate applied (0, 0.10, or 0.15).' },
      withholding_amount_cents: { type: 'integer (cents)', desc: 'The withholding the buyer must remit.', unit: 'cents' },
      path: { type: 'enum', enum: 'firpta_path', desc: 'The withholding path taken.' },
      forms_8288_due_date: { type: 'string (ISO date) | null', desc: 'The Form 8288 filing/remittance deadline, or null.' },
      form_8288_b_reduced_withholding_requested: { type: 'boolean', desc: 'The reduced-certificate-requested flag, echoed.' },
      reduced_certificate_processing_days_estimate: { type: 'integer | null', desc: 'IRS Form 8288-B processing estimate in days (a planning estimate), or null.', unit: 'days' },
      section_1031_timing_gap_flag: { type: 'boolean', desc: 'Whether a §1031 exchange collides with FIRPTA withholding timing.' },
    },
    derivedOutputs: ['withholding_amount_cents'],
    boundary:
      'This model computes FIRPTA withholding, the dated deadline, and the certificate/1031 timing flags from supplied facts. Whether the seller is a foreign person, whether the residence exemption or a reduced-withholding certificate applies, and how a §1031 exchange interacts with withholding are determinations for the tax advisor; the model computes the buyer\'s obligation and the timing and renders no opinion on the seller\'s tax.',
    golden: {
      narrative: 'A foreign seller closes a $2.5M non-residence disposition on May 1: FIRPTA requires 15% withholding — $375,000 — with Form 8288 due May 21, no reduced-withholding certificate requested and no §1031 timing gap.',
      input: { amount_realized_cents: 250_000_000, seller_foreign_person: true, buyer_will_use_as_residence: false, closing_date: '2026-05-01', form_8288_b_reduced_withholding_requested: false, section_1031_exchange: false },
    },
  },

  /* ══ RESTRUCTURING FAMILY — distressed / Chapter 11 / Chapter 7 ══════ */

  /* ══ M148 — Three-prong solvency ═════════════════════════════════════ */
  M148: {
    founderReview: true,
    purpose:
      'Runs the three-prong solvency test that underlies fraudulent-transfer analysis — the balance-sheet (assets over liabilities), cash-flow (projected cash flow over debts due), and capital-adequacy (available over required capital) prongs — from supplied figures, reporting each surplus and pass/fail. It answers, before a leveraged recap or dividend, "does the company clear all three solvency prongs at these numbers?" It computes the prongs; the solvency opinion itself is the financial advisor\'s.',
    algorithm: [
      'Given `fair_value_assets_cents`, `liabilities_cents`, `projected_cash_flow_cents`, `debts_due_cents`, `available_capital_cents`, and `required_capital_cents`:',
      '1. If any of the six is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.',
      '2. `balance_sheet_surplus_cents` SHALL be `fair_value_assets_cents − liabilities_cents`; `balance_sheet_prong_passed` SHALL be true iff it is non-negative.',
      '3. `cash_flow_surplus_cents` SHALL be `projected_cash_flow_cents − debts_due_cents`; `cash_flow_prong_passed` SHALL be true iff it is non-negative.',
      '4. `capital_adequacy_surplus_cents` SHALL be `available_capital_cents − required_capital_cents`; `capital_adequacy_prong_passed` SHALL be true iff it is non-negative.',
      '5. `all_prongs_passed` SHALL be true iff all three prongs pass; `solvency_opinion_handoff_required` SHALL always be true.',
    ],
    constants: [],
    precisionRule: 'All surpluses are exact integer cents (see the Conventions chapter); no rounding.',
    inputs: {
      fair_value_assets_cents: { type: 'integer (cents)', desc: 'Fair value of assets.', unit: 'cents' },
      liabilities_cents: { type: 'integer (cents)', desc: 'Total liabilities.', unit: 'cents' },
      projected_cash_flow_cents: { type: 'integer (cents)', desc: 'Projected cash flow available to service debt.', unit: 'cents' },
      debts_due_cents: { type: 'integer (cents)', desc: 'Debts coming due over the projection.', unit: 'cents' },
      available_capital_cents: { type: 'integer (cents)', desc: 'Capital available to the business.', unit: 'cents' },
      required_capital_cents: { type: 'integer (cents)', desc: 'Capital the business reasonably requires.', unit: 'cents' },
    },
    outputs: {
      balance_sheet_surplus_cents: { type: 'integer (cents)', desc: 'Assets less liabilities.', unit: 'cents' },
      balance_sheet_prong_passed: { type: 'boolean', desc: 'Whether the balance-sheet prong passes.' },
      cash_flow_surplus_cents: { type: 'integer (cents)', desc: 'Projected cash flow less debts due.', unit: 'cents' },
      cash_flow_prong_passed: { type: 'boolean', desc: 'Whether the cash-flow prong passes.' },
      capital_adequacy_surplus_cents: { type: 'integer (cents)', desc: 'Available less required capital.', unit: 'cents' },
      capital_adequacy_prong_passed: { type: 'boolean', desc: 'Whether the capital-adequacy prong passes.' },
      all_prongs_passed: { type: 'boolean', desc: 'Whether all three prongs pass.' },
      solvency_opinion_handoff_required: { type: 'boolean', desc: 'Always true — the solvency opinion routes to the financial advisor.' },
    },
    derivedOutputs: ['balance_sheet_surplus_cents', 'cash_flow_surplus_cents', 'capital_adequacy_surplus_cents'],
    boundary:
      'This model runs the three solvency prongs from supplied figures. The fair-value determinations, the reasonableness of the capital and cash-flow assumptions, and the binding solvency opinion are the financial advisor\'s and counsel\'s; the model computes the prongs and always routes the opinion, rendering no solvency conclusion.',
    golden: {
      narrative: 'A company weighing a recap clears all three solvency prongs: $50M of assets over $45M of liabilities, $8M of projected cash flow over $7M of debts due, and $10M of available capital over $8M required.',
      input: { fair_value_assets_cents: 5_000_000_000, liabilities_cents: 4_500_000_000, projected_cash_flow_cents: 800_000_000, debts_due_cents: 700_000_000, available_capital_cents: 1_000_000_000, required_capital_cents: 800_000_000 },
    },
  },

  /* ══ M151 — §363 asset-sale mechanics ════════════════════════════════ */
  M151: {
    purpose:
      'Screens a §363 bankruptcy sale — whether a free-and-clear path is available under any of the five §363(f) prongs, whether the price exceeds the aggregate liens, whether the secured creditor is credit-bid eligible, and the break-up fee as a percentage of price. It answers, in a distressed sale, "can this sell free and clear, is the stalking horse\'s credit bid allowed, and is the bid protection in range?" It screens the prongs; court approval and the legal conclusions are for the court and counsel.',
    algorithm: [
      'Given `purchase_price_cents` and `lien_amount_cents`, plus optional `breakup_fee_cents` (default 0), `credit_bid_claim_cents` (default 0), `cause_to_deny_credit_bid` (default false), `section_363f_prongs`:',
      '1. If either required input is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.',
      '2. `price_exceeds_aggregate_liens` SHALL be true iff `purchase_price_cents > lien_amount_cents`.',
      '3. It SHALL evaluate the five §363(f) prongs (non-bankruptcy law permits; consent; price exceeds liens — defaulting to the computed comparison; bona-fide dispute; could be compelled to accept a money satisfaction); `free_and_clear_prong_count` SHALL be the number satisfied and `free_and_clear_path_available` SHALL be true iff any is satisfied.',
      '4. `credit_bid_eligible` SHALL be true iff a positive credit-bid claim exists and there is no cause to deny it.',
      '5. `breakup_fee_pct_of_purchase_price` SHALL be `breakup_fee_cents ÷ purchase_price_cents`; `court_approval_required` SHALL always be true.',
    ],
    constants: [],
    precisionRule: 'The break-up-fee percentage rounds per the global rule (half-even to 4 decimals — see the Conventions chapter); amounts are exact integer cents.',
    inputs: {
      purchase_price_cents: { type: 'integer (cents)', desc: 'The §363 sale price.', unit: 'cents' },
      lien_amount_cents: { type: 'integer (cents)', desc: 'Aggregate liens on the assets.', unit: 'cents' },
      breakup_fee_cents: { type: 'integer (cents)', desc: 'Stalking-horse break-up fee (default 0).', unit: 'cents' },
      credit_bid_claim_cents: { type: 'integer (cents)', desc: 'Secured claim available to credit bid (default 0).', unit: 'cents' },
      cause_to_deny_credit_bid: { type: 'boolean', desc: 'Whether cause exists to deny the credit bid (default false).' },
      section_363f_prongs: { type: 'object', desc: 'Booleans for the §363(f) prongs: `applicable_non_bankruptcy_law_permits`, `consent`, `price_exceeds_liens`, `bona_fide_dispute`, `could_be_compelled_to_accept_money_satisfaction`.' },
    },
    outputs: {
      purchase_price_cents: { type: 'integer (cents)', desc: 'The sale price, echoed.', unit: 'cents' },
      lien_amount_cents: { type: 'integer (cents)', desc: 'Aggregate liens, echoed.', unit: 'cents' },
      breakup_fee_cents: { type: 'integer (cents)', desc: 'Break-up fee, echoed.', unit: 'cents' },
      breakup_fee_pct_of_purchase_price: { type: 'number | null', desc: 'Break-up fee as a fraction of price, or null.', precision: 4 },
      free_and_clear_prong_count: { type: 'integer', desc: 'Number of §363(f) prongs satisfied.' },
      free_and_clear_path_available: { type: 'boolean', desc: 'Whether any §363(f) prong is satisfied.' },
      price_exceeds_aggregate_liens: { type: 'boolean', desc: 'Whether the price exceeds the liens.' },
      credit_bid_claim_cents: { type: 'integer (cents)', desc: 'Credit-bid claim, echoed.', unit: 'cents' },
      credit_bid_eligible: { type: 'boolean', desc: 'Whether the secured creditor may credit bid.' },
      court_approval_required: { type: 'boolean', desc: 'Always true — the sale requires court approval.' },
      section_363f_prongs: { type: 'object[]', desc: 'Per-prong result: `{ prong, passed }`.' },
    },
    derivedOutputs: ['breakup_fee_pct_of_purchase_price', 'free_and_clear_prong_count'],
    boundary:
      'This model screens the §363(f) prongs, the credit-bid eligibility, and the bid protection from supplied facts. Whether a prong is in fact met, whether cause exists to deny a credit bid, and whether the sale should be approved are determinations for the court and counsel; the model screens the prongs and always routes court approval, rendering no legal conclusion.',
    golden: {
      narrative: 'A $30M stalking-horse §363 bid over $25M of liens: the price exceeds the liens and the debtor consents, so a free-and-clear path is available; the $20M secured claim is credit-bid eligible and the 3% break-up fee is in range — all subject to court approval.',
      input: { purchase_price_cents: 3_000_000_000, lien_amount_cents: 2_500_000_000, breakup_fee_cents: 90_000_000, credit_bid_claim_cents: 2_000_000_000, cause_to_deny_credit_bid: false, section_363f_prongs: { consent: true } },
    },
  },

  /* ══ M152 — Plan feasibility ═════════════════════════════════════════ */
  M152: {
    founderReview: true,
    purpose:
      'Tests a Chapter 11 plan\'s feasibility across a multi-period forecast — the DSCR and ending-liquidity floors each period, the minimum projected DSCR and liquidity, and a downside cash-flow sensitivity — from supplied projections. It answers, for a plan proponent, "does the plan service its debt and hold liquidity every period, and how much cushion is there against a downturn?" It computes the floors and sensitivity; the §1129(a)(11) feasibility opinion is the financial advisor\'s.',
    algorithm: [
      'Given `forecast_periods` (a list of period objects), plus optional `minimum_dscr` (default 1.0) and `minimum_liquidity_cents` (default 0):',
      '1. If `forecast_periods` is empty, the implementation SHALL return `status: "needs_inputs"` naming `forecast_periods`.',
      '2. For each period, cash available for debt service SHALL be `cash_flow − capex − working_capital_need`; `dscr` SHALL be that over debt service (or null when debt service is zero); `dscr_floor_passed` and `liquidity_floor_passed` SHALL test the period against the DSCR and liquidity floors.',
      '3. `minimum_projected_dscr` and `minimum_projected_liquidity_cents` SHALL be the minima across periods; `dscr_floor_breached` and `liquidity_floor_breached` SHALL be true iff any period fails; `feasible_under_inputs` SHALL be true iff every period clears both floors.',
      '4. It SHALL compute a −10% and a −20% cash-flow downside sensitivity, reporting each case\'s minimum DSCR and whether it still clears the floor.',
      '5. `feasibility_opinion_handoff_required` SHALL always be true; it SHALL return the full per-period and sensitivity detail.',
    ],
    constants: [],
    precisionRule: 'DSCRs round per the global rule (half-even to 4 decimals — see the Conventions chapter); liquidity is exact integer cents.',
    inputs: {
      forecast_periods: { type: 'object[]', desc: 'Forecast periods; each carries `period`/`year` (string), and integer-cents `cash_flow_cents` (or `ebitda_cents`), `capex_cents`, `working_capital_need_cents`, `debt_service_cents`, and `ending_liquidity_cents`.' },
      minimum_dscr: { type: 'number', desc: 'The DSCR floor the plan must clear each period (default 1.0).', precision: 4 },
      minimum_liquidity_cents: { type: 'integer (cents)', desc: 'The ending-liquidity floor each period (default 0).', unit: 'cents' },
    },
    outputs: {
      period_count: { type: 'integer', desc: 'Number of forecast periods.' },
      minimum_dscr_floor: { type: 'number', desc: 'The DSCR floor applied.', precision: 4 },
      minimum_liquidity_floor_cents: { type: 'integer (cents)', desc: 'The liquidity floor applied.', unit: 'cents' },
      minimum_projected_dscr: { type: 'number | null', desc: 'The lowest DSCR across periods, or null.', precision: 4 },
      minimum_projected_liquidity_cents: { type: 'integer (cents)', desc: 'The lowest ending liquidity across periods.', unit: 'cents' },
      dscr_floor_breached: { type: 'boolean', desc: 'Whether any period breaches the DSCR floor.' },
      liquidity_floor_breached: { type: 'boolean', desc: 'Whether any period breaches the liquidity floor.' },
      feasible_under_inputs: { type: 'boolean', desc: 'Whether every period clears both floors.' },
      feasibility_opinion_handoff_required: { type: 'boolean', desc: 'Always true — the feasibility opinion routes to the financial advisor.' },
      forecast_rows: { type: 'object[]', desc: 'Per-period detail: `{ period, cash_flow_cents, capex_cents, working_capital_need_cents, available_for_debt_service_cents, debt_service_cents, dscr, ending_liquidity_cents, dscr_floor_passed, liquidity_floor_passed }`.' },
      cash_flow_sensitivity_cases: { type: 'object[]', desc: 'Downside cases: `{ cash_flow_change_pct, minimum_dscr, dscr_floor_passed }` for −10% and −20%.' },
    },
    derivedOutputs: ['period_count', 'minimum_projected_dscr', 'minimum_projected_liquidity_cents', 'forecast_rows', 'cash_flow_sensitivity_cases'],
    boundary:
      'This model tests the DSCR and liquidity floors and the downside sensitivity from supplied projections. Whether the projections are reasonable and whether the plan is feasible under §1129(a)(11) are determinations for the financial advisor and the court; the model computes the floors and always routes the feasibility opinion, rendering no conclusion.',
    golden: {
      narrative: 'A two-year plan forecast holds DSCR above the 1.1× floor (1.42× then 1.15×), but year-two ending liquidity of $750k breaches the $1.0M floor, so the plan is not feasible under the inputs — the feasibility opinion routes out, with −10%/−20% downside cases computed.',
      input: { minimum_dscr: 1.1, minimum_liquidity_cents: 100_000_000, forecast_periods: [ { year: '2026', cash_flow_cents: 1_000_000_000, capex_cents: 100_000_000, working_capital_need_cents: 50_000_000, debt_service_cents: 600_000_000, ending_liquidity_cents: 200_000_000 }, { year: '2027', cash_flow_cents: 900_000_000, capex_cents: 100_000_000, working_capital_need_cents: 50_000_000, debt_service_cents: 650_000_000, ending_liquidity_cents: 75_000_000 } ] },
    },
  },

  /* ══ M153 — Best-interests-of-creditors test ═════════════════════════ */
  M153: {
    founderReview: true,
    purpose:
      'Runs the §1129(a)(7) best-interests test class by class — each class\'s plan recovery versus its hypothetical Chapter 7 liquidation recovery — and flags any class that would do better in liquidation. It answers, for a plan proponent, "does every class get at least as much under the plan as it would in a Chapter 7?" It computes the per-class comparison and the shortfall; the liquidation valuation and the legal conclusion are the advisor\'s and counsel\'s.',
    algorithm: [
      'Given `creditor_classes` (a list of class objects, each with an allowed claim, a plan distribution, and a Chapter 7 distribution):',
      '1. If `creditor_classes` is empty, the implementation SHALL return `status: "needs_inputs"` naming `creditor_classes`.',
      '2. For each class, `plan_recovery_pct` and `chapter7_recovery_pct` SHALL be the plan and Chapter 7 distributions over the allowed claim; `best_interests_shortfall_cents` SHALL be `max(0, chapter7_distribution − plan_distribution)`; `best_interests_passed` SHALL be true iff the plan distribution is at or above the Chapter 7 distribution.',
      '3. It SHALL total allowed claims, plan distributions, and Chapter 7 distributions.',
      '4. `all_classes_pass_best_interests` SHALL be true iff every class passes; `failing_class_count` SHALL count the failures.',
      '5. `disclosure_statement_exhibit_handoff_required` SHALL always be true; it SHALL return the full per-class detail.',
    ],
    constants: [],
    precisionRule: 'Recovery percentages round per the global rule (half-even to 4 decimals — see the Conventions chapter); amounts are exact integer cents.',
    inputs: {
      creditor_classes: { type: 'object[]', desc: 'Creditor classes; each carries `class_name` (string), `allowed_claim_cents`, `plan_distribution_cents`, and `chapter7_distribution_cents` (integer cents).' },
    },
    outputs: {
      class_count: { type: 'integer', desc: 'Number of creditor classes.' },
      total_allowed_claims_cents: { type: 'integer (cents)', desc: 'Total allowed claims.', unit: 'cents' },
      total_plan_distribution_cents: { type: 'integer (cents)', desc: 'Total plan distributions.', unit: 'cents' },
      total_chapter7_distribution_cents: { type: 'integer (cents)', desc: 'Total hypothetical Chapter 7 distributions.', unit: 'cents' },
      all_classes_pass_best_interests: { type: 'boolean', desc: 'Whether every class passes the best-interests test.' },
      failing_class_count: { type: 'integer', desc: 'Number of classes that fail.' },
      disclosure_statement_exhibit_handoff_required: { type: 'boolean', desc: 'Always true — the liquidation-analysis exhibit routes to counsel.' },
      class_rows: { type: 'object[]', desc: 'Per-class detail: `{ class_name, allowed_claim_cents, plan_distribution_cents, chapter7_distribution_cents, plan_recovery_pct, chapter7_recovery_pct, best_interests_shortfall_cents, best_interests_passed }`.' },
    },
    derivedOutputs: ['class_count', 'total_allowed_claims_cents', 'total_plan_distribution_cents', 'total_chapter7_distribution_cents', 'failing_class_count', 'class_rows'],
    boundary:
      'This model runs the best-interests comparison from supplied plan and liquidation figures. The hypothetical Chapter 7 valuation, and whether the plan satisfies §1129(a)(7), are determinations for the financial advisor and the court; the model computes the comparison and always routes the exhibit, rendering no legal conclusion.',
    golden: {
      narrative: 'Two classes tested against a hypothetical Chapter 7: the secured class recovers 100% under the plan versus 90% in liquidation and passes, but the unsecured class\'s 25% plan recovery falls below its 30% liquidation recovery — a $1M best-interests shortfall — so one class fails and the exhibit routes out.',
      input: { creditor_classes: [ { class_name: 'Secured', allowed_claim_cents: 1_000_000_000, plan_distribution_cents: 1_000_000_000, chapter7_distribution_cents: 900_000_000 }, { class_name: 'Unsecured', allowed_claim_cents: 2_000_000_000, plan_distribution_cents: 500_000_000, chapter7_distribution_cents: 600_000_000 } ] },
    },
  },

  /* ══ M154 — Absolute priority rule & new value ═══════════════════════ */
  M154: {
    founderReview: true,
    purpose:
      'Tests a cramdown plan against the absolute priority rule — for each impaired, non-accepting class not paid in full, whether any junior class receives value — and scaffolds the new-value exception (contribution, new money, necessity, market test, reasonable equivalence). It answers, in a cramdown, "does any junior class get value over the head of a senior class that isn\'t paid in full?" It flags the APR issues and organizes the new-value elements; the court determines APR compliance.',
    algorithm: [
      'Given `classes` (a list of class objects) and optional `new_value` (an object):',
      '1. If `classes` is empty, the implementation SHALL return `status: "needs_inputs"` naming `classes`.',
      '2. It SHALL sort classes by priority rank and, for each impaired class that has not accepted, is not paid in full, and has a positive claim, sum the plan distributions to all junior classes; a positive junior value SHALL raise an absolute-priority issue naming the senior class, its recovery, and the junior value.',
      '3. `absolute_priority_issue_count` SHALL be the number of issues; `apr_clear_under_inputs` SHALL be true iff there are none.',
      '4. It SHALL assemble the new-value scaffold from the supplied contribution and the four qualitative elements; `new_value_scaffold_complete` SHALL be true iff all five elements are affirmatively present.',
      '5. `court_determination_required` SHALL always be true; it SHALL return the full ranked class detail.',
    ],
    constants: [],
    precisionRule: 'Recovery percentages round per the global rule (half-even to 4 decimals — see the Conventions chapter); amounts are exact integer cents.',
    inputs: {
      classes: { type: 'object[]', desc: 'Plan classes; each carries `class_name` (string), `priority_rank` (integer), `allowed_claim_cents`, `plan_distribution_cents` (integer cents), `impaired` (boolean), and `accepted` (boolean).' },
      new_value: { type: 'object', desc: 'The new-value exception scaffold: `contribution_cents` (integer cents) and the booleans `new_money_or_money_worth`, `necessary_to_reorganization`, `market_test_completed`, `reasonably_equivalent_value`.' },
    },
    outputs: {
      class_count: { type: 'integer', desc: 'Number of classes.' },
      absolute_priority_issue_count: { type: 'integer', desc: 'Number of absolute-priority issues found.' },
      absolute_priority_issues: { type: 'object[]', desc: 'Per-issue detail: `{ senior_class_name, senior_recovery_pct, junior_value_cents }`.' },
      apr_clear_under_inputs: { type: 'boolean', desc: 'Whether the plan clears the absolute priority rule under the inputs.' },
      new_value_scaffold: { type: 'object', desc: 'The new-value elements: `{ contribution_cents, new_money_or_money_worth, necessary_to_reorganization, market_test_completed, reasonably_equivalent_value }`.' },
      new_value_scaffold_complete: { type: 'boolean', desc: 'Whether all five new-value elements are affirmatively present.' },
      court_determination_required: { type: 'boolean', desc: 'Always true — APR compliance is a court determination.' },
      class_rows: { type: 'object[]', desc: 'Per-class detail (rank-sorted): `{ class_name, priority_rank, allowed_claim_cents, plan_distribution_cents, recovery_pct, impaired, accepted }`.' },
    },
    derivedOutputs: ['class_count', 'absolute_priority_issue_count', 'absolute_priority_issues', 'new_value_scaffold', 'class_rows'],
    boundary:
      'This model flags absolute-priority issues and organizes the new-value elements from supplied class facts. Whether the absolute priority rule is in fact violated and whether the new-value exception is available are determinations for the court; the model surfaces the issues and always routes the determination, rendering no legal conclusion.',
    golden: {
      narrative: 'A three-class plan: the senior secured class is unimpaired, but the unsecured class is crammed down to 20% while the equity class beneath it keeps $1M — an absolute-priority violation the plan must cure — so the court determination is required.',
      input: { classes: [ { class_name: 'Senior secured', priority_rank: 1, allowed_claim_cents: 1_500_000_000, plan_distribution_cents: 1_500_000_000, accepted: true }, { class_name: 'Unsecured', priority_rank: 2, allowed_claim_cents: 1_000_000_000, plan_distribution_cents: 200_000_000, impaired: true, accepted: false }, { class_name: 'Equity', priority_rank: 3, allowed_claim_cents: 0, plan_distribution_cents: 100_000_000 } ] },
    },
  },

  /* ══ M155 — Cramdown interest rate ═══════════════════════════════════ */
  M155: {
    founderReview: true,
    purpose:
      'Computes the cramdown interest rate under both frameworks — the Till formula (a base rate plus a risk premium) and, where the circuit applies it and a market exists, the efficient-market rate — and selects which governs, reporting the indicated rate. It answers, in a cramdown, "what rate does the plan owe a crammed-down secured creditor, and which framework does this circuit use?" It computes both and selects per the circuit; the court sets the final rate.',
    algorithm: [
      'Given `base_rate` and `risk_premium`, plus optional `efficient_market_rate`, `efficient_market_exists`, `circuit`:',
      '1. If either required rate is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.',
      '2. `till_formula_rate` SHALL be `base_rate + risk_premium`.',
      '3. `efficient_market_framework_supported` SHALL be true iff the circuit is one that applies the efficient-market framework (2d, 5th, 6th, 8th).',
      '4. The efficient-market rate SHALL govern iff a market exists, an efficient-market rate is supplied, and the circuit supports the framework; `selected_framework` SHALL be `efficient_market` or `till_formula` accordingly.',
      '5. `indicated_cramdown_rate` SHALL be the selected framework\'s rate (all rates at the global 4-decimal precision); `court_sets_final_rate` SHALL always be true.',
    ],
    constants: [],
    precisionRule: 'All rates round per the global rule (half-even to 4 decimals — see the Conventions chapter).',
    inputs: {
      base_rate: { type: 'number', desc: 'The Till base rate (e.g., prime), as a fraction.', precision: 4 },
      risk_premium: { type: 'number', desc: 'The Till risk premium, as a fraction.', precision: 4 },
      efficient_market_rate: { type: 'number', desc: 'An observed efficient-market rate, as a fraction; optional.', precision: 4 },
      efficient_market_exists: { type: 'boolean', desc: 'Whether an efficient market exists (defaults to whether a rate is supplied).' },
      circuit: { type: 'string', desc: 'The federal circuit (e.g., 2d, 5th, 6th, 8th); selects the framework.' },
    },
    outputs: {
      base_rate: { type: 'number', desc: 'The base rate, echoed.', precision: 4 },
      risk_premium: { type: 'number', desc: 'The risk premium, echoed.', precision: 4 },
      till_formula_rate: { type: 'number', desc: 'Base rate plus risk premium.', precision: 4 },
      efficient_market_rate: { type: 'number | null', desc: 'The efficient-market rate, or null.', precision: 4 },
      circuit: { type: 'string | null', desc: 'The circuit, echoed, or null.' },
      efficient_market_framework_supported: { type: 'boolean', desc: 'Whether the circuit applies the efficient-market framework.' },
      selected_framework: { type: 'enum', enum: 'cramdown_framework', desc: 'Which framework governs.' },
      indicated_cramdown_rate: { type: 'number', desc: 'The rate the selected framework indicates.', precision: 4 },
      court_sets_final_rate: { type: 'boolean', desc: 'Always true — the court sets the final rate.' },
    },
    derivedOutputs: ['till_formula_rate', 'indicated_cramdown_rate'],
    boundary:
      'This model computes the Till and efficient-market rates and selects per the circuit from supplied inputs. Whether an efficient market in fact exists, the correct risk premium, and the final cramdown rate are determinations for the court; the model computes both frameworks and always defers the final rate, rendering no rate determination.',
    golden: {
      narrative: 'A Sixth Circuit cramdown with an available 10% efficient-market rate: because the circuit applies the efficient-market framework and a market exists, the 10% market rate governs over the 11% Till formula rate (8% base plus a 3% risk premium) — the court sets the final rate.',
      input: { base_rate: 0.08, risk_premium: 0.03, efficient_market_rate: 0.10, efficient_market_exists: true, circuit: '6th' },
    },
  },

  /* ══ M156 — §1111(b) election trade-off ══════════════════════════════ */
  M156: {
    founderReview: true,
    purpose:
      'Evaluates an undersecured creditor\'s §1111(b) election — the no-election value (collateral value plus deficiency recovery) against the election value (the plan payment stream\'s aggregate and present value) — and screens eligibility, the two election tests, and the class vote. It answers, for an undersecured creditor, "am I better off electing §1111(b) to keep my full-claim lien, or taking the deficiency recovery?" It computes the trade-off; the election filing is counsel\'s.',
    algorithm: [
      'Given `allowed_claim_cents`, `collateral_value_cents`, `plan_payment_stream_cents` (a list), and `discount_rate`, plus optional `guc_recovery_pct` (default 0), `recourse` (default true), `property_sold_under_363_or_plan` (default false), `interest_inconsequential` (default false), the class-vote percentages:',
      '1. If any required input is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.',
      '2. `deficiency_claim_cents` SHALL be `max(0, allowed_claim_cents − collateral_value_cents)`; `no_election_value_cents` SHALL be `collateral_value_cents + round(deficiency × guc_recovery_pct)`.',
      '3. `election_aggregate_payments_cents` SHALL be the sum of the payment stream; `election_npv_cents` SHALL be its present value at the discount rate.',
      '4. `election_eligible` SHALL be false when the interest is inconsequential or the claim is recourse and the property is sold; `aggregate_face_test_passed` (aggregate ≥ claim) and `collateral_npv_test_passed` (NPV ≥ collateral value) SHALL be reported; the class vote passes iff it clears the §1126(c) acceptance thresholds (constants: §1126(c) class-acceptance thresholds).',
      '5. `value_delta_election_vs_no_election_cents` SHALL be `election_npv_cents − no_election_value_cents`; `election_filing_handoff_required` SHALL always be true.',
    ],
    constants: [
      { name: '§1126(c) class-acceptance thresholds', value: 'at least two-thirds in amount and more than one-half in number of claims actually voting', kind: 'statutory_must', citation: '11 U.S.C. § 1126(c)', pin: '§ 1126(c)', effective: 'current (Bankruptcy Code as amended)', nextCheck: 'on statutory amendment' },
    ],
    precisionRule: 'Values and NPV are exact integer cents; the deficiency-recovery percentage rounds per the global rule (half-even to 4 decimals — see the Conventions chapter).',
    inputs: {
      allowed_claim_cents: { type: 'integer (cents)', desc: 'The creditor\'s total allowed claim.', unit: 'cents' },
      collateral_value_cents: { type: 'integer (cents)', desc: 'Value of the collateral (the secured portion).', unit: 'cents' },
      plan_payment_stream_cents: { type: 'integer (cents)[]', desc: 'The plan\'s payment stream, one integer-cents payment per period.', unit: 'cents' },
      discount_rate: { type: 'number', desc: 'The discount rate for the payment-stream NPV (a fraction).', precision: 4 },
      guc_recovery_pct: { type: 'number', desc: 'General-unsecured recovery on the deficiency, as a fraction (default 0).', precision: 4 },
      recourse: { type: 'boolean', desc: 'Whether the claim is recourse (default true).' },
      property_sold_under_363_or_plan: { type: 'boolean', desc: 'Whether the property is sold under §363 or the plan (default false); with recourse, defeats eligibility.' },
      interest_inconsequential: { type: 'boolean', desc: 'Whether the secured interest is of inconsequential value (default false); defeats eligibility.' },
      class_vote_amount_pct: { type: 'number', desc: 'Class support by amount, as a fraction; optional.', precision: 4 },
      class_vote_number_pct: { type: 'number', desc: 'Class support by number, as a fraction; optional.', precision: 4 },
    },
    outputs: {
      allowed_claim_cents: { type: 'integer (cents)', desc: 'The allowed claim, echoed.', unit: 'cents' },
      collateral_value_cents: { type: 'integer (cents)', desc: 'The collateral value, echoed.', unit: 'cents' },
      deficiency_claim_cents: { type: 'integer (cents)', desc: 'The deficiency (claim over collateral).', unit: 'cents' },
      guc_recovery_pct: { type: 'number', desc: 'The deficiency recovery rate applied.', precision: 4 },
      no_election_value_cents: { type: 'integer (cents)', desc: 'Value without electing (collateral plus deficiency recovery).', unit: 'cents' },
      election_aggregate_payments_cents: { type: 'integer (cents)', desc: 'Aggregate face of the payment stream.', unit: 'cents' },
      election_npv_cents: { type: 'integer (cents)', desc: 'Present value of the payment stream.', unit: 'cents' },
      election_eligible: { type: 'boolean', desc: 'Whether the §1111(b) election is available.' },
      election_vote_passed: { type: 'boolean | null', desc: 'Whether the class vote clears §1126(c), or null when votes are not supplied.' },
      aggregate_face_test_passed: { type: 'boolean', desc: 'Whether aggregate payments meet or exceed the allowed claim.' },
      collateral_npv_test_passed: { type: 'boolean', desc: 'Whether the payment-stream NPV meets or exceeds the collateral value.' },
      value_delta_election_vs_no_election_cents: { type: 'integer (cents)', desc: 'Election NPV less no-election value (positive favors electing).', unit: 'cents' },
      election_filing_handoff_required: { type: 'boolean', desc: 'Always true — the election filing routes to counsel.' },
    },
    derivedOutputs: ['deficiency_claim_cents', 'no_election_value_cents', 'election_aggregate_payments_cents', 'election_npv_cents', 'value_delta_election_vs_no_election_cents'],
    boundary:
      'This model computes the §1111(b) trade-off from supplied figures. Whether the election is available on the facts, the correct collateral valuation and discount rate, and the filing decision are determinations for counsel and the financial advisor; the model computes the comparison and always routes the filing, rendering no election recommendation.',
    golden: {
      narrative: 'An undersecured creditor with a $10M claim against $6M collateral weighs the election: without electing it recovers $6.4M (collateral plus a 10% deficiency recovery); electing gives up the deficiency, but the $7.5M payment stream\'s ~$5.69M present value falls short of the collateral value, so the election destroys value here — the filing routes to counsel.',
      input: { allowed_claim_cents: 1_000_000_000, collateral_value_cents: 600_000_000, plan_payment_stream_cents: [150_000_000, 150_000_000, 150_000_000, 150_000_000, 150_000_000], discount_rate: 0.10, guc_recovery_pct: 0.10, class_vote_amount_pct: 0.75, class_vote_number_pct: 0.6 },
    },
  },

  /* ══ M157 — §726 Chapter 7 waterfall ═════════════════════════════════ */
  M157: {
    founderReview: true,
    purpose:
      'Distributes a Chapter 7 estate down the §507/§726 priority ladder — net of the trustee fee, paying each priority rank in turn until the estate is exhausted — and reports each class\'s distribution and recovery and any residual to equity. It answers, in a liquidation, "how far down the priority waterfall does the estate reach, and what does each class recover?" It computes the waterfall; the claim allowances and priorities are legal determinations.',
    algorithm: [
      'Given `estate_value_cents` and `claims` (a list of class objects), plus optional `trustee_fee_cents` (default 0):',
      '1. If either required input is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.',
      '2. `distributable_estate_cents` SHALL be `max(0, estate_value_cents − trustee_fee_cents)`.',
      '3. It SHALL sort claims by priority rank and, for each in turn, distribute `min(remaining, allowed_claim)` and reduce the remainder; `recovery_pct` SHALL be the distribution over the allowed claim.',
      '4. `total_claims_cents` and `total_distributed_cents` SHALL be the sums; `residual_to_equity_cents` SHALL be the remainder after all claims.',
      '5. It SHALL return the full per-class waterfall detail.',
    ],
    constants: [],
    precisionRule: 'Recovery percentages round per the global rule (half-even to 4 decimals — see the Conventions chapter); amounts are exact integer cents.',
    inputs: {
      estate_value_cents: { type: 'integer (cents)', desc: 'The gross Chapter 7 estate value.', unit: 'cents' },
      claims: { type: 'object[]', desc: 'Claim classes; each carries `class_name` (string), `priority_rank` (integer), and `allowed_claim_cents` (integer cents).' },
      trustee_fee_cents: { type: 'integer (cents)', desc: 'Trustee fee deducted before distribution (default 0).', unit: 'cents' },
    },
    outputs: {
      estate_value_cents: { type: 'integer (cents)', desc: 'The estate value, echoed.', unit: 'cents' },
      trustee_fee_cents: { type: 'integer (cents)', desc: 'The trustee fee, echoed.', unit: 'cents' },
      distributable_estate_cents: { type: 'integer (cents)', desc: 'Estate net of the trustee fee.', unit: 'cents' },
      total_claims_cents: { type: 'integer (cents)', desc: 'Total allowed claims.', unit: 'cents' },
      total_distributed_cents: { type: 'integer (cents)', desc: 'Total distributed across all classes.', unit: 'cents' },
      residual_to_equity_cents: { type: 'integer (cents)', desc: 'Remainder to equity after all claims.', unit: 'cents' },
      waterfall_rows: { type: 'object[]', desc: 'Per-class detail (rank-sorted): `{ class_name, priority_rank, allowed_claim_cents, distribution_cents, recovery_pct }`.' },
    },
    derivedOutputs: ['distributable_estate_cents', 'total_claims_cents', 'total_distributed_cents', 'residual_to_equity_cents', 'waterfall_rows'],
    boundary:
      'This model computes the Chapter 7 distribution waterfall from supplied estate and claim figures. The allowance and priority ranking of claims, and the trustee-fee determination, are legal and court determinations; the model computes the waterfall the supplied ranks and amounts imply and renders no allowance or priority conclusion.',
    golden: {
      narrative: 'A $10M Chapter 7 estate, net of a $500k trustee fee, distributes $9.5M by statutory priority: the $6M secured and $1M priority claims are paid in full and the $8M unsecured class recovers about 31%, with nothing left for equity.',
      input: { estate_value_cents: 1_000_000_000, trustee_fee_cents: 50_000_000, claims: [ { class_name: 'Secured', priority_rank: 1, allowed_claim_cents: 600_000_000 }, { class_name: 'Priority', priority_rank: 2, allowed_claim_cents: 100_000_000 }, { class_name: 'Unsecured', priority_rank: 3, allowed_claim_cents: 800_000_000 } ] },
    },
  },

  /* ══ M158 — §364 DIP sizing ══════════════════════════════════════════ */
  M158: {
    purpose:
      'Sizes a debtor-in-possession facility — the new liquidity need (13-week cash need plus the minimum-liquidity cushion, net of opening cash), the required commitment including any roll-up and professional-fee carve-out, the new-money component, and the roll-up as a percentage of the facility. It answers, at the front of a Chapter 11, "how big does the DIP need to be, and how much of it is new money versus a roll-up?" It sizes the facility; court approval and the priming fight are for the court and counsel.',
    algorithm: [
      'Given `thirteen_week_cash_need_cents` and `minimum_liquidity_cents`, plus optional `opening_cash_cents` (default 0), `rollup_amount_cents` (default 0), `professional_fee_carveout_cents` (default 0), `new_money_minimum_cents` (default 0), `priming_requested` (default false):',
      '1. If either required input is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.',
      '2. `liquidity_need_cents` SHALL be `max(0, thirteen_week_cash_need_cents + minimum_liquidity_cents − opening_cash_cents)`.',
      '3. `required_dip_commitment_cents` SHALL be the greater of (`liquidity_need + rollup + carveout`) and (`new_money_minimum + rollup + carveout`).',
      '4. `new_money_component_cents` SHALL be `max(new_money_minimum_cents, liquidity_need_cents)`; `rollup_pct_of_commitment` SHALL be `rollup ÷ required_commitment` (or null).',
      '5. `court_approval_required` SHALL always be true.',
    ],
    constants: [],
    precisionRule: 'The roll-up percentage rounds per the global rule (half-even to 4 decimals — see the Conventions chapter); amounts are exact integer cents.',
    inputs: {
      thirteen_week_cash_need_cents: { type: 'integer (cents)', desc: 'Net cash need over the 13-week budget.', unit: 'cents' },
      minimum_liquidity_cents: { type: 'integer (cents)', desc: 'Minimum-liquidity cushion the facility must maintain.', unit: 'cents' },
      opening_cash_cents: { type: 'integer (cents)', desc: 'Cash on hand at filing (default 0).', unit: 'cents' },
      rollup_amount_cents: { type: 'integer (cents)', desc: 'Prepetition debt rolled into the DIP (default 0).', unit: 'cents' },
      professional_fee_carveout_cents: { type: 'integer (cents)', desc: 'Professional-fee carve-out (default 0).', unit: 'cents' },
      new_money_minimum_cents: { type: 'integer (cents)', desc: 'A floor on the new-money component (default 0).', unit: 'cents' },
      priming_requested: { type: 'boolean', desc: 'Whether the DIP primes existing liens (default false).' },
    },
    outputs: {
      thirteen_week_cash_need_cents: { type: 'integer (cents)', desc: 'The 13-week cash need, echoed.', unit: 'cents' },
      opening_cash_cents: { type: 'integer (cents)', desc: 'Opening cash, echoed.', unit: 'cents' },
      minimum_liquidity_cents: { type: 'integer (cents)', desc: 'Minimum liquidity, echoed.', unit: 'cents' },
      liquidity_need_cents: { type: 'integer (cents)', desc: 'New liquidity the DIP must supply.', unit: 'cents' },
      rollup_amount_cents: { type: 'integer (cents)', desc: 'Roll-up amount, echoed.', unit: 'cents' },
      professional_fee_carveout_cents: { type: 'integer (cents)', desc: 'Professional-fee carve-out, echoed.', unit: 'cents' },
      required_dip_commitment_cents: { type: 'integer (cents)', desc: 'Total required DIP commitment.', unit: 'cents' },
      new_money_component_cents: { type: 'integer (cents)', desc: 'The new-money portion of the facility.', unit: 'cents' },
      rollup_pct_of_commitment: { type: 'number | null', desc: 'Roll-up as a fraction of the commitment, or null.', precision: 4 },
      priming_requested: { type: 'boolean', desc: 'Whether priming is requested.' },
      court_approval_required: { type: 'boolean', desc: 'Always true — the DIP requires court approval.' },
    },
    derivedOutputs: ['liquidity_need_cents', 'required_dip_commitment_cents', 'new_money_component_cents', 'rollup_pct_of_commitment'],
    boundary:
      'This model sizes the DIP facility from supplied budget and structure figures. The adequacy of the budget, whether priming is warranted, and the approval of the facility are determinations for the court and the parties; the model computes the sizing and always routes court approval, rendering no approval conclusion.',
    golden: {
      narrative: 'A DIP for an $8M 13-week cash need plus a $2M liquidity cushion against $1M of opening cash needs $9M of new liquidity; with a $10M roll-up and a $1.5M professional-fee carve-out the facility totals $20.5M (about 49% roll-up), and priming is requested — subject to court approval.',
      input: { thirteen_week_cash_need_cents: 800_000_000, minimum_liquidity_cents: 200_000_000, opening_cash_cents: 100_000_000, rollup_amount_cents: 1_000_000_000, professional_fee_carveout_cents: 150_000_000, new_money_minimum_cents: 500_000_000, priming_requested: true },
    },
  },

  /* ══ M159 — Fulcrum security ═════════════════════════════════════════ */
  M159: {
    purpose:
      'Allocates enterprise value down the capital stack by priority to find the fulcrum security — the tranche where value breaks, recovering more than zero but less than par — reporting each tranche\'s recovery and any residual value. It answers, in a distressed-for-control situation, "at this enterprise value, which tranche is the fulcrum that converts to the equity?" It computes the break from supplied tranches; the enterprise valuation is the financial advisor\'s.',
    algorithm: [
      'Given `enterprise_value_cents` and `tranches` (a list of tranche objects):',
      '1. If either required input is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.',
      '2. It SHALL sort tranches by priority rank and, for each in turn, allocate `min(remaining_value, claim)` and reduce the remaining value; `recovery_pct` SHALL be the allocation over the claim.',
      '3. `fulcrum_tranche` SHALL be the first tranche whose recovery is strictly between zero and par; if none, it SHALL fall back to the first fully-unpaid tranche, else the last fully-paid tranche.',
      '4. `total_claims_cents` SHALL be the sum of claims; `residual_value_cents` SHALL be the value left after all tranches.',
      '5. `financial_advisor_ev_handoff_required` SHALL always be true; it SHALL return the full per-tranche detail.',
    ],
    constants: [],
    precisionRule: 'Recovery percentages round per the global rule (half-even to 4 decimals — see the Conventions chapter); amounts are exact integer cents.',
    inputs: {
      enterprise_value_cents: { type: 'integer (cents)', desc: 'The enterprise value to distribute.', unit: 'cents' },
      tranches: { type: 'object[]', desc: 'Capital-stack tranches; each carries `tranche_name` (string), `priority_rank` (integer), and `claim_cents` (integer cents).' },
    },
    outputs: {
      enterprise_value_cents: { type: 'integer (cents)', desc: 'The enterprise value, echoed.', unit: 'cents' },
      total_claims_cents: { type: 'integer (cents)', desc: 'Total claims across the stack.', unit: 'cents' },
      residual_value_cents: { type: 'integer (cents)', desc: 'Value remaining after all tranches.', unit: 'cents' },
      fulcrum_tranche: { type: 'string | null', desc: 'The fulcrum tranche name, or null.' },
      financial_advisor_ev_handoff_required: { type: 'boolean', desc: 'Always true — the enterprise valuation routes to the financial advisor.' },
      tranche_rows: { type: 'object[]', desc: 'Per-tranche detail (rank-sorted): `{ tranche_name, priority_rank, claim_cents, value_allocated_cents, recovery_pct }`.' },
    },
    derivedOutputs: ['total_claims_cents', 'residual_value_cents', 'tranche_rows'],
    boundary:
      'This model finds the fulcrum security by allocating a supplied enterprise value down the stack. The enterprise valuation itself — the hardest and most contested input — is the financial advisor\'s determination, not the model\'s; the model computes the break the supplied value implies and always routes the valuation.',
    golden: {
      narrative: 'At a $50M enterprise value across an $80M capital stack, the revolver and term loan recover in full, the senior notes recover 40% — the fulcrum security where value breaks — and the sub notes are out of the money; the valuation routes to the financial advisor.',
      input: { enterprise_value_cents: 5_000_000_000, tranches: [ { tranche_name: 'Revolver', priority_rank: 1, claim_cents: 1_000_000_000 }, { tranche_name: 'Term Loan', priority_rank: 2, claim_cents: 3_000_000_000 }, { tranche_name: 'Senior Notes', priority_rank: 3, claim_cents: 2_500_000_000 }, { tranche_name: 'Sub Notes', priority_rank: 4, claim_cents: 1_500_000_000 } ] },
    },
  },

  /* ══ M160 — Exchange offer / distressed-debt exchange ════════════════ */
  M160: {
    founderReview: true,
    purpose:
      'Sizes a distressed-debt exchange — the participation rate against any minimum, the holdout debt, the exchange discount (old over new security value), and the CODI exposure (participating debt over new security value). It answers, in an out-of-court restructuring, "does the exchange clear its minimum participation, how much debt holds out, and what cancellation-of-debt income does it create?" It computes the economics; the CODI and holdout treatment are counsel\'s and the tax advisor\'s.',
    algorithm: [
      'Given `outstanding_debt_cents`, `participating_debt_cents`, and `new_security_value_cents`, plus optional `minimum_participation_pct` (default 0), `old_security_value_cents` (default: participating debt):',
      '1. If any required input is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.',
      '2. `participation_pct` SHALL be `participating_debt_cents ÷ outstanding_debt_cents`; `minimum_participation_satisfied` SHALL be true iff it meets or exceeds the minimum.',
      '3. `holdout_debt_cents` SHALL be `max(0, outstanding_debt_cents − participating_debt_cents)`.',
      '4. `exchange_discount_cents` SHALL be `max(0, old_security_value_cents − new_security_value_cents)`.',
      '5. `codi_exposure_cents` SHALL be `max(0, participating_debt_cents − new_security_value_cents)`; `counsel_review_required` SHALL always be true.',
    ],
    constants: [],
    precisionRule: 'The participation percentage rounds per the global rule (half-even to 4 decimals — see the Conventions chapter); amounts are exact integer cents.',
    inputs: {
      outstanding_debt_cents: { type: 'integer (cents)', desc: 'Total outstanding debt eligible to exchange.', unit: 'cents' },
      participating_debt_cents: { type: 'integer (cents)', desc: 'Debt tendered into the exchange.', unit: 'cents' },
      new_security_value_cents: { type: 'integer (cents)', desc: 'Value of the new securities issued.', unit: 'cents' },
      minimum_participation_pct: { type: 'number', desc: 'Minimum participation condition, as a fraction (default 0).', precision: 4 },
      old_security_value_cents: { type: 'integer (cents)', desc: 'Market value of the old securities; defaults to participating debt.', unit: 'cents' },
    },
    outputs: {
      outstanding_debt_cents: { type: 'integer (cents)', desc: 'Outstanding debt, echoed.', unit: 'cents' },
      participating_debt_cents: { type: 'integer (cents)', desc: 'Participating debt, echoed.', unit: 'cents' },
      holdout_debt_cents: { type: 'integer (cents)', desc: 'Debt that does not tender.', unit: 'cents' },
      participation_pct: { type: 'number', desc: 'Participating over outstanding debt.', precision: 4 },
      minimum_participation_pct: { type: 'number', desc: 'The minimum participation condition applied.', precision: 4 },
      minimum_participation_satisfied: { type: 'boolean', desc: 'Whether participation meets the minimum.' },
      old_security_value_cents: { type: 'integer (cents)', desc: 'Old-security value used.', unit: 'cents' },
      new_security_value_cents: { type: 'integer (cents)', desc: 'New-security value, echoed.', unit: 'cents' },
      exchange_discount_cents: { type: 'integer (cents)', desc: 'Old-security value over new-security value.', unit: 'cents' },
      codi_exposure_cents: { type: 'integer (cents)', desc: 'Cancellation-of-debt income exposure.', unit: 'cents' },
      counsel_review_required: { type: 'boolean', desc: 'Always true — the CODI and holdout analysis routes to counsel.' },
    },
    derivedOutputs: ['holdout_debt_cents', 'participation_pct', 'exchange_discount_cents', 'codi_exposure_cents'],
    boundary:
      'This model sizes the exchange economics from supplied figures. The CODI computation and its exclusions, the §3(a)(9) and TIA §316(b) analysis, and the holdout strategy are determinations for the tax advisor and counsel; the model computes the participation, discount, and CODI exposure and always routes the review, rendering no tax or legal conclusion.',
    golden: {
      narrative: 'A distressed exchange: $85M of $100M notes tender (85%, short of the 90% minimum), leaving $15M of holdouts; swapping $85M of old debt for $70M of new securities creates a $15M exchange discount and $15M of CODI exposure — the tax and holdout analysis routes to counsel.',
      input: { outstanding_debt_cents: 10_000_000_000, participating_debt_cents: 8_500_000_000, new_security_value_cents: 7_000_000_000, minimum_participation_pct: 0.90 },
    },
  },

  /* ══ M164 — RSA economics ════════════════════════════════════════════ */
  M164: {
    purpose:
      'Reads a restructuring support agreement\'s class support against the §1126(c) acceptance thresholds, and tallies the milestone schedule, termination events, fiduciary-out, and toggle structure. It answers, before signing an RSA, "which classes already clear the confirmation thresholds, and what are the milestone and termination terms?" It computes the support screen and the counts; the enforceability and adequacy of the RSA are counsel\'s.',
    algorithm: [
      'Given `classes` (a list of class objects), plus optional `milestones`, `termination_events`, `fiduciary_out_present` (default false), `toggle_type`:',
      '1. If `classes` is empty, the implementation SHALL return `status: "needs_inputs"` naming `classes`.',
      '2. For each class, `section_1126c_threshold_met` SHALL be true iff support by amount and by number clears the §1126(c) acceptance thresholds (constants: §1126(c) class-acceptance thresholds).',
      '3. `support_threshold_class_count` SHALL count the classes clearing the thresholds; `all_classes_meet_support_thresholds` SHALL be true iff every class clears them.',
      '4. `milestone_count` and `open_milestone_count` (incomplete milestones) and `termination_event_count` SHALL be counted.',
      '5. `counsel_review_required` SHALL always be true; it SHALL return the full per-class support detail.',
    ],
    constants: [
      { name: '§1126(c) class-acceptance thresholds', value: 'at least two-thirds in amount and more than one-half in number of claims actually voting', kind: 'statutory_must', citation: '11 U.S.C. § 1126(c)', pin: '§ 1126(c)', effective: 'current (Bankruptcy Code as amended)', nextCheck: 'on statutory amendment' },
    ],
    precisionRule: 'Support percentages round per the global rule (half-even to 4 decimals — see the Conventions chapter); the rest are counts and booleans.',
    inputs: {
      classes: { type: 'object[]', desc: 'Supporting classes; each carries `class_name` (string) and `support_amount_pct` and `support_number_pct` (numbers, fractions).' },
      milestones: { type: 'object[]', desc: 'RSA milestones; each carries a `name` (string) and `completed` (boolean).' },
      termination_events: { type: 'string[]', desc: 'Named termination events.' },
      fiduciary_out_present: { type: 'boolean', desc: 'Whether the RSA contains a fiduciary out (default false).' },
      toggle_type: { type: 'string', desc: 'The plan-toggle structure (e.g., free-fall, prearranged); echoed.' },
    },
    outputs: {
      class_count: { type: 'integer', desc: 'Number of supporting classes.' },
      support_threshold_class_count: { type: 'integer', desc: 'Classes clearing the §1126(c) thresholds.' },
      all_classes_meet_support_thresholds: { type: 'boolean', desc: 'Whether every class clears the thresholds.' },
      milestone_count: { type: 'integer', desc: 'Number of milestones.' },
      open_milestone_count: { type: 'integer', desc: 'Number of incomplete milestones.' },
      termination_event_count: { type: 'integer', desc: 'Number of termination events.' },
      fiduciary_out_present: { type: 'boolean', desc: 'Whether a fiduciary out is present.' },
      toggle_type: { type: 'string', desc: 'The toggle structure, echoed.' },
      counsel_review_required: { type: 'boolean', desc: 'Always true — the RSA routes to counsel.' },
      class_rows: { type: 'object[]', desc: 'Per-class detail: `{ class_name, support_amount_pct, support_number_pct, section_1126c_threshold_met }`.' },
    },
    derivedOutputs: ['class_count', 'support_threshold_class_count', 'milestone_count', 'open_milestone_count', 'termination_event_count', 'class_rows'],
    boundary:
      'This model screens RSA class support against §1126(c) and tallies the milestone and termination terms. Whether the RSA is enforceable, whether the solicitation complies with §1125, and the adequacy of the fiduciary out are determinations for counsel; the model computes the support screen and always routes the review, rendering no enforceability conclusion.',
    golden: {
      narrative: 'An RSA with two classes: the secured class clears the §1126(c) thresholds (85% by amount, 75% by number) but the unsecured class does not (60% by amount); two milestones (one open), two termination events, a fiduciary out, and a free-fall toggle — counsel reviews.',
      input: { classes: [ { class_name: 'Secured', support_amount_pct: 0.85, support_number_pct: 0.75 }, { class_name: 'Unsecured', support_amount_pct: 0.60, support_number_pct: 0.55 } ], milestones: [ { name: 'File plan', completed: true }, { name: 'Confirmation', completed: false } ], termination_events: ['missed_milestone', 'material_adverse_change'], fiduciary_out_present: true, toggle_type: 'free_fall' },
    },
  },

  /* ══ M165 — ABC / Article 9 foreclosure recovery ═════════════════════ */
  M165: {
    purpose:
      'Distributes an out-of-court liquidation — an assignment for the benefit of creditors or an Article 9 foreclosure — down the priority ladder net of the assignee fee and sale costs, and checks the disposition notice against the Article 9 floor. It answers, in an out-of-court wind-down, "what does each creditor class recover, and does the sale notice satisfy Article 9?" It computes the waterfall and the notice screen; commercial reasonableness and the legal conclusions are counsel\'s.',
    algorithm: [
      'Given `liquidation_value_cents` and `claims` (a list of class objects), plus optional `assignee_fee_cents` (default 0), `sale_costs_cents` (default 0), `notice_days` (default 10), `commercially_reasonable_sale`:',
      '1. If either required input is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.',
      '2. `distributable_value_cents` SHALL be `max(0, liquidation_value_cents − assignee_fee_cents − sale_costs_cents)`.',
      '3. It SHALL sort claims by priority rank and distribute `min(remaining, claim)` down the ladder; `recovery_pct` SHALL be the distribution over the claim.',
      '4. `notice_floor_satisfied` SHALL be true iff `notice_days` meets or exceeds the Article 9 notice floor (constants: Article 9 disposition-notice floor).',
      '5. `total_distributed_cents` and `residual_value_cents` SHALL be reported; `counsel_review_required` SHALL always be true.',
    ],
    constants: [
      { name: 'Article 9 disposition-notice floor', value: '10 days', kind: 'statutory_must', citation: 'U.C.C. § 9-612(b)', pin: '§ 9-612(b) (non-consumer 10-day safe harbor)', effective: 'U.C.C. Article 9 (2010 revision), current', nextCheck: 'on uniform-act amendment', traceValues: [10] },
    ],
    precisionRule: 'Recovery percentages round per the global rule (half-even to 4 decimals — see the Conventions chapter); amounts are exact integer cents.',
    inputs: {
      liquidation_value_cents: { type: 'integer (cents)', desc: 'Gross liquidation proceeds.', unit: 'cents' },
      claims: { type: 'object[]', desc: 'Claim classes; each carries `class_name` (string), `priority_rank` (integer), and `claim_cents` (integer cents).' },
      assignee_fee_cents: { type: 'integer (cents)', desc: 'Assignee/foreclosure fee (default 0).', unit: 'cents' },
      sale_costs_cents: { type: 'integer (cents)', desc: 'Sale costs (default 0).', unit: 'cents' },
      notice_days: { type: 'number', desc: 'Days of disposition notice given (default 10).', unit: 'days' },
      commercially_reasonable_sale: { type: 'boolean', desc: 'Whether the sale is asserted commercially reasonable; echoed for counsel.' },
    },
    outputs: {
      liquidation_value_cents: { type: 'integer (cents)', desc: 'Liquidation value, echoed.', unit: 'cents' },
      assignee_fee_cents: { type: 'integer (cents)', desc: 'Assignee fee, echoed.', unit: 'cents' },
      sale_costs_cents: { type: 'integer (cents)', desc: 'Sale costs, echoed.', unit: 'cents' },
      distributable_value_cents: { type: 'integer (cents)', desc: 'Proceeds net of fee and costs.', unit: 'cents' },
      notice_days: { type: 'integer', desc: 'Notice days given, echoed.', unit: 'days' },
      article9_notice_floor_days: { type: 'integer', desc: 'The Article 9 notice floor.', unit: 'days' },
      notice_floor_satisfied: { type: 'boolean', desc: 'Whether the notice clears the Article 9 floor.' },
      commercially_reasonable_sale: { type: 'boolean | null', desc: 'The commercial-reasonableness assertion, echoed, or null.' },
      total_distributed_cents: { type: 'integer (cents)', desc: 'Total distributed across classes.', unit: 'cents' },
      residual_value_cents: { type: 'integer (cents)', desc: 'Value remaining after all claims.', unit: 'cents' },
      counsel_review_required: { type: 'boolean', desc: 'Always true — the disposition routes to counsel.' },
      distribution_rows: { type: 'object[]', desc: 'Per-class detail (rank-sorted): `{ class_name, priority_rank, claim_cents, distribution_cents, recovery_pct }`.' },
    },
    derivedOutputs: ['distributable_value_cents', 'total_distributed_cents', 'residual_value_cents', 'distribution_rows'],
    boundary:
      'This model computes the out-of-court recovery waterfall and the notice screen from supplied figures. Whether the disposition is commercially reasonable, the validity of the assignment or foreclosure, and the priority of claims are legal determinations for counsel; the model computes the waterfall and the notice screen and always routes the review, rendering no legal conclusion.',
    golden: {
      narrative: 'An out-of-court Article 9 / ABC liquidation of an $8M estate, net of a $400k assignee fee and $200k of sale costs, distributes $7.4M: the $5M secured claim is paid in full and the $6M unsecured class recovers 40%; the 15-day notice clears the 10-day Article 9 floor — counsel confirms commercial reasonableness.',
      input: { liquidation_value_cents: 800_000_000, assignee_fee_cents: 40_000_000, sale_costs_cents: 20_000_000, notice_days: 15, commercially_reasonable_sale: true, claims: [ { class_name: 'Secured', priority_rank: 1, claim_cents: 500_000_000 }, { class_name: 'Unsecured', priority_rank: 2, claim_cents: 600_000_000 } ] },
    },
  },

  /* ══ M166 — Claims-trading recovery ══════════════════════════════════ */
  M166: {
    purpose:
      'Prices a bankruptcy-claim purchase — the expected ultimate recovery on the face amount, the gross profit over the purchase price, and the annualized IRR over the time to resolution. It answers, for a claims trader, "what does this claim return if it recovers as expected, and by when?" It computes the return from a supplied (or regression-implied) recovery rate; the Rule 3001 transfer mechanics are for counsel.',
    algorithm: [
      'Given `face_amount_cents`, `purchase_price_cents`, `time_to_recovery_years`, and `expected_recovery_rate` (supplied, or implied from a post-default trading price via the recovery regression — constants: Moody\'s ultimate-recovery regression):',
      '1. If any of the four is missing (and no recovery rate can be resolved), the implementation SHALL return `status: "needs_inputs"` and emit no outputs.',
      '2. `expected_recovery_cents` SHALL be `round(face_amount_cents × expected_recovery_rate)`.',
      '3. `gross_profit_cents` SHALL be `expected_recovery_cents − purchase_price_cents`.',
      '4. `estimated_irr` SHALL be `(expected_recovery_cents ÷ purchase_price_cents)^(1 ÷ time_to_recovery_years) − 1` when the price and horizon are positive, else null.',
      '5. `frbp_transfer_review_required` SHALL always be true; rates and the IRR are at the global 4-decimal precision.',
    ],
    constants: [
      { name: 'Moody\'s ultimate-recovery regression', value: 'expected recovery ≈ 0.90 × post-default trading price + 0.06 (fallback when no recovery rate is supplied)', kind: 'cited_median_should', citation: 'Moody\'s Ultimate Recovery Database (2024)', pin: 'post-default-price-to-ultimate-recovery regression', effective: '2024 dataset', nextCheck: 'on dataset update', traceValues: [0.9, 0.06] },
    ],
    precisionRule: 'The recovery rate and IRR round per the global rule (half-even to 4 decimals — see the Conventions chapter); amounts are exact integer cents.',
    inputs: {
      face_amount_cents: { type: 'integer (cents)', desc: 'Face amount of the claim.', unit: 'cents' },
      purchase_price_cents: { type: 'integer (cents)', desc: 'Price paid for the claim.', unit: 'cents' },
      time_to_recovery_years: { type: 'number', desc: 'Years to expected resolution.', unit: 'years' },
      expected_recovery_rate: { type: 'number', desc: 'Expected ultimate recovery as a fraction of face; if omitted, implied from a post-default trading price.', precision: 4 },
      post_default_trading_price: { type: 'number', desc: 'Post-default trading price (fraction of face); drives the regression when no rate is supplied.', precision: 4 },
    },
    outputs: {
      face_amount_cents: { type: 'integer (cents)', desc: 'Face amount, echoed.', unit: 'cents' },
      purchase_price_cents: { type: 'integer (cents)', desc: 'Purchase price, echoed.', unit: 'cents' },
      post_default_trading_price: { type: 'number | null', desc: 'The post-default trading price, echoed, or null.', precision: 4 },
      expected_recovery_rate: { type: 'number', desc: 'The expected recovery rate applied.', precision: 4 },
      expected_recovery_cents: { type: 'integer (cents)', desc: 'Expected ultimate recovery on the face.', unit: 'cents' },
      gross_profit_cents: { type: 'integer (cents)', desc: 'Expected recovery less purchase price.', unit: 'cents' },
      estimated_irr: { type: 'number | null', desc: 'Annualized IRR to resolution, or null.', precision: 4 },
      frbp_transfer_review_required: { type: 'boolean', desc: 'Always true — the Rule 3001 transfer routes to counsel.' },
    },
    derivedOutputs: ['expected_recovery_cents', 'gross_profit_cents', 'estimated_irr'],
    boundary:
      'This model prices a claim purchase from a supplied or regression-implied recovery rate. The actual ultimate recovery, the resolution timing, and the Rule 3001 transfer-of-claim mechanics are uncertain and legal; the model computes the return the assumptions imply and always routes the transfer review, rendering no recovery guarantee.',
    golden: {
      narrative: 'Buying a $10M defaulted claim for $4M with an expected 55% ultimate recovery ($5.5M) over two years to resolution: the $1.5M gross profit implies about a 17% annualized IRR — the Rule 3001 transfer review is required.',
      input: { face_amount_cents: 1_000_000_000, purchase_price_cents: 400_000_000, time_to_recovery_years: 2, expected_recovery_rate: 0.55 },
    },
  },

  /* ══ M167 — Subchapter V eligibility ═════════════════════════════════ */
  M167: {
    purpose:
      'Screens Subchapter V small-business eligibility — whether aggregate noncontingent, liquidated debt is at or below the debt limit, whether the debtor is engaged in commercial activity, and whether it is disqualified as an affiliate of a public issuer. It answers, for a small business considering Subchapter V, "do we fit under the debt limit and the eligibility gates?" It runs the screen; the current debt limit and the eligibility conclusion are the debtor\'s counsel\'s.',
    algorithm: [
      'Given `aggregate_noncontingent_liquidated_debt_cents` and `engaged_in_commercial_activity`, plus optional `affiliate_of_public_issuer` (default false), `debt_limit_cents` (default: the Subchapter V debt limit):',
      '1. If either required input is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.',
      '2. `debt_limit_cents` SHALL be the supplied override, else the Subchapter V debt limit (constants: Subchapter V debt limit).',
      '3. `debt_limit_satisfied` SHALL be true iff the aggregate debt is at or below the limit.',
      '4. `subchapter_v_eligible_under_inputs` SHALL be true iff the debt limit is satisfied AND the debtor is engaged in commercial activity AND it is not an affiliate of a public issuer.',
      '5. It SHALL emit a note that the reverted debt limit is used unless overridden.',
    ],
    constants: [
      { name: 'Subchapter V debt limit', value: '$3,024,725 (302,472,500 cents)', kind: 'statutory_must', citation: '11 U.S.C. § 1182(1)', pin: '§ 1182(1) (reverted debt limit after the SBRA increase lapsed)', effective: 'current (post-2024 sunset)', nextCheck: 'on Congressional reauthorization', traceValues: [302472500] },
    ],
    precisionRule: 'All amounts are exact integer cents (see the Conventions chapter); no rounding.',
    inputs: {
      aggregate_noncontingent_liquidated_debt_cents: { type: 'integer (cents)', desc: 'Aggregate noncontingent, liquidated debt.', unit: 'cents' },
      engaged_in_commercial_activity: { type: 'boolean', desc: 'Whether the debtor is engaged in commercial or business activity.' },
      affiliate_of_public_issuer: { type: 'boolean', desc: 'Whether the debtor is an affiliate of an SEC issuer (default false); a disqualifier.' },
      debt_limit_cents: { type: 'integer (cents)', desc: 'Override for the debt limit; defaults to the reverted statutory limit.', unit: 'cents' },
    },
    outputs: {
      aggregate_noncontingent_liquidated_debt_cents: { type: 'integer (cents)', desc: 'The aggregate debt, echoed.', unit: 'cents' },
      debt_limit_cents: { type: 'integer (cents)', desc: 'The debt limit applied.', unit: 'cents' },
      debt_limit_satisfied: { type: 'boolean', desc: 'Whether the debt is within the limit.' },
      engaged_in_commercial_activity: { type: 'boolean', desc: 'The commercial-activity flag, echoed.' },
      affiliate_of_public_issuer: { type: 'boolean', desc: 'The public-issuer-affiliate flag, echoed.' },
      subchapter_v_eligible_under_inputs: { type: 'boolean', desc: 'Whether the debtor is eligible under the inputs.' },
      current_threshold_handoff_note: { type: 'string', desc: 'Note that the reverted limit is used unless overridden.' },
    },
    derivedOutputs: [],
    boundary:
      'This model screens Subchapter V eligibility against the debt limit and the eligibility gates. The current debt limit (which has shifted with legislation), whether debts are noncontingent and liquidated, and the ultimate eligibility conclusion are determinations for the debtor\'s counsel; the model runs the screen and renders no eligibility opinion.',
    golden: {
      narrative: 'A small business with $2.5M of noncontingent, liquidated debt, engaged in commercial activity and not an affiliate of a public issuer, sits under the reverted $3,024,725 Subchapter V debt limit and is eligible under the inputs.',
      input: { aggregate_noncontingent_liquidated_debt_cents: 250_000_000, engaged_in_commercial_activity: true, affiliate_of_public_issuer: false },
    },
  },

  /* ══ M168 — Chapter 22 recidivism score ══════════════════════════════ */
  M168: {
    purpose:
      'Scores a reorganized company\'s risk of a repeat filing (a "Chapter 22") from four post-emergence drivers — exit leverage, months of liquidity, EBITDA growth, and prior-bankruptcy history — into a 0–100 recidivism score and a risk band. It answers, at emergence, "how likely is this company to be back in bankruptcy, on these post-emergence fundamentals?" It computes a calibrated heuristic score; the underlying judgment is the financial advisor\'s.',
    algorithm: [
      'Given `exit_leverage`, `liquidity_months`, and `ebitda_growth_pct`, plus optional `prior_bankruptcy_count` (default 0):',
      '1. If any required input is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.',
      '2. It SHALL compute four risk components from the recidivism scoring calibration (constants: Chapter 22 recidivism scoring calibration): a leverage component rising with exit leverage above the baseline, a liquidity component rising as liquidity falls below a year, a growth component rising with negative EBITDA growth, and a repeat component rising with prior-filing count — each capped.',
      '3. `chapter22_recidivism_score` SHALL be the base plus the four components, clamped to 0–100 and rounded to the nearest whole number.',
      '4. `risk_band` SHALL be `high` at or above the high threshold, `watch` at or above the watch threshold, else `lower` (constants: Chapter 22 recidivism scoring calibration).',
      '5. `financial_advisor_handoff_required` SHALL always be true; the driver inputs are echoed at the global 4-decimal precision.',
    ],
    constants: [
      { name: 'Chapter 22 recidivism scoring calibration', value: 'base 20; leverage = clamp((exit_leverage − 3) × 12, 0, 35); liquidity = clamp((12 − liquidity_months) × 2.5, 0, 30); growth = clamp(−ebitda_growth_pct × 100, 0, 20); repeat = clamp(prior_bankruptcy_count × 10, 0, 15); score = round(clamp(sum, 0, 100)); bands high ≥ 70, watch ≥ 45', kind: 'cited_median_should', citation: 'DEFINITIVE Chapter 22 recidivism scoring calibration (heuristic; LoPucki Bankruptcy Research Database is the empirical reference, 2024)', pin: 'scoring weights, caps, and band thresholds', effective: '2024 calibration', nextCheck: 'on recalibration' },
    ],
    precisionRule: 'The score is a whole number 0–100; the driver echoes round per the global rule (half-even to 4 decimals — see the Conventions chapter).',
    inputs: {
      exit_leverage: { type: 'number', desc: 'Net debt / EBITDA at emergence.' },
      liquidity_months: { type: 'number', desc: 'Months of liquidity runway at emergence.', unit: 'months' },
      ebitda_growth_pct: { type: 'number', desc: 'Projected EBITDA growth as a fraction (negative = decline).', precision: 4 },
      prior_bankruptcy_count: { type: 'number', desc: 'Number of prior bankruptcy filings (default 0).' },
    },
    outputs: {
      exit_leverage: { type: 'number', desc: 'Exit leverage, echoed.' },
      liquidity_months: { type: 'number', desc: 'Liquidity months, echoed.', unit: 'months' },
      ebitda_growth_pct: { type: 'number', desc: 'EBITDA growth, echoed.', precision: 4 },
      prior_bankruptcy_count: { type: 'number', desc: 'Prior-bankruptcy count, echoed.' },
      chapter22_recidivism_score: { type: 'integer', desc: 'The 0–100 recidivism score.' },
      risk_band: { type: 'enum', enum: 'chapter22_risk_band', desc: 'The risk band the score falls into.' },
      financial_advisor_handoff_required: { type: 'boolean', desc: 'Always true — the judgment routes to the financial advisor.' },
    },
    derivedOutputs: ['chapter22_recidivism_score'],
    boundary:
      'This model computes a calibrated recidivism heuristic from supplied post-emergence drivers. It is a screening score, not a prediction; the reorganized company\'s actual prospects, the reasonableness of the exit capital structure, and the going-concern judgment are the financial advisor\'s and the board\'s determinations, which the model routes and does not replace.',
    golden: {
      narrative: 'A company emerging at 5.0× leverage with six months of liquidity, −5% EBITDA growth, and one prior bankruptcy scores 74 on the Chapter 22 recidivism model — a high repeat-filing risk that routes to the financial advisor.',
      input: { exit_leverage: 5, liquidity_months: 6, ebitda_growth_pct: -0.05, prior_bankruptcy_count: 1 },
    },
  },

  /* ══ TAX FAMILY — transaction-tax master and sub-engines (M200–M205) ═ */

  /* ══ M200 — Transaction tax master engine ════════════════════════════ */
  M200: {
    founderReview: true,
    purpose:
      'Computes the integrated transaction-tax picture from the deal form and consideration mix — the taxable consideration, the seller\'s gain and tax at the combined rate, the seller\'s after-tax proceeds including any rollover, the buyer\'s asset basis, and any gross-up gap — and fires the applicable sub-models (allocation, elections, imputed interest, and others) that the facts trigger. It answers, for a deal team pricing the tax cost, "what does the seller net after tax, what basis does the buyer get, and which tax sub-analyses does this deal require?" It orchestrates the arithmetic and the routing; the entity classification, elections, and state treatment are tax counsel\'s.',
    algorithm: [
      'Given `seller_entity_type`, `deal_form`, and `purchase_price_cents`, plus optional `seller_tax_basis_cents` (default 0), `consideration_mix`, `federal_tax_rate` (default 0), `state_tax_rate` (default 0), `seller_structure_tax_delta_cents` (default 0), `tax_facts`, `transaction_costs`:',
      '1. If any required input is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.',
      '2. `taxable_consideration_cents` SHALL be `max(0, cash + seller_note + stock + earnout)` from the consideration mix (cash defaulting to the full price); `deferred_or_rollover_consideration_cents` SHALL be the rollover amount.',
      '3. `combined_seller_tax_rate` SHALL be `clamp(federal_tax_rate + state_tax_rate, 0, 1)`; `seller_taxable_gain_cents` SHALL be `max(0, taxable_consideration − seller_tax_basis)`; `seller_tax_cents` SHALL be `round(gain × combined_rate)`.',
      '4. `seller_after_tax_proceeds_cents` SHALL be `taxable_consideration − seller_tax + rollover`; `buyer_asset_basis_cents` SHALL be the purchase price for asset/338/336/deemed forms, else null; `gross_up_gap_cents` SHALL be `round(seller_structure_tax_delta ÷ (1 − combined_rate))` when the rate is below one, else null.',
      '5. `fired_sub_models` SHALL list the sub-models the facts trigger (e.g., §1060 allocation, the §338/§336 gross-up, reorganization qualification, contribution, imputed interest, NOL limitation, QSBS, transaction costs) by their model IDs.',
    ],
    constants: [],
    precisionRule: 'The combined rate rounds per the global rule (half-even to 4 decimals — see the Conventions chapter); all monetary outputs are exact integer cents.',
    inputs: {
      seller_entity_type: { type: 'string', desc: 'The seller\'s entity type (e.g., S-corp, C-corp, partnership, individual).' },
      deal_form: { type: 'string', desc: 'The transaction form (e.g., asset_sale, stock_sale, merger, 338h10); drives basis and sub-model routing.' },
      purchase_price_cents: { type: 'integer (cents)', desc: 'Total purchase price.', unit: 'cents' },
      seller_tax_basis_cents: { type: 'integer (cents)', desc: 'Seller\'s tax basis in what is sold (default 0).', unit: 'cents' },
      consideration_mix: { type: 'object', desc: 'The consideration split: integer-cents `cash_cents`, `seller_note_cents`, `stock_cents`, `earnout_cents`, `rollover_cents`.' },
      federal_tax_rate: { type: 'number', desc: 'Seller federal tax rate as a fraction (default 0).', precision: 4 },
      state_tax_rate: { type: 'number', desc: 'Seller state tax rate as a fraction (default 0).', precision: 4 },
      seller_structure_tax_delta_cents: { type: 'integer (cents)', desc: 'Incremental seller tax from the buyer\'s preferred structure (default 0); drives the gross-up gap.', unit: 'cents' },
      tax_facts: { type: 'object', desc: 'Flags that fire sub-models: `loss_carryforwards`, `qsbs` (booleans).' },
      transaction_costs: { type: 'object[]', desc: 'Transaction-cost rows; a non-empty list fires the transaction-cost sub-model.' },
    },
    outputs: {
      seller_entity_type: { type: 'string', desc: 'The seller entity type, echoed.' },
      deal_form: { type: 'string', desc: 'The deal form, echoed.' },
      total_consideration_cents: { type: 'integer (cents)', desc: 'Total consideration (the purchase price).', unit: 'cents' },
      taxable_consideration_cents: { type: 'integer (cents)', desc: 'Taxable (non-rollover) consideration.', unit: 'cents' },
      deferred_or_rollover_consideration_cents: { type: 'integer (cents)', desc: 'Rollover/deferred consideration.', unit: 'cents' },
      buyer_asset_basis_cents: { type: 'integer (cents) | null', desc: 'Buyer asset basis for asset/deemed-asset forms, else null.', unit: 'cents' },
      seller_tax_basis_cents: { type: 'integer (cents)', desc: 'Seller tax basis, echoed.', unit: 'cents' },
      seller_taxable_gain_cents: { type: 'integer (cents)', desc: 'Seller taxable gain.', unit: 'cents' },
      combined_seller_tax_rate: { type: 'number', desc: 'Combined federal-plus-state seller rate.', precision: 4 },
      seller_tax_cents: { type: 'integer (cents)', desc: 'Seller tax on the gain.', unit: 'cents' },
      seller_after_tax_proceeds_cents: { type: 'integer (cents)', desc: 'Seller proceeds after tax, including rollover.', unit: 'cents' },
      gross_up_gap_cents: { type: 'integer (cents) | null', desc: 'Gross-up needed to offset the structure tax delta, or null.', unit: 'cents' },
      fired_sub_models: { type: 'string[]', desc: 'Model IDs of the sub-analyses the facts trigger.' },
      professional_review_flags: { type: 'string[]', desc: 'Standing tax-counsel review note.' },
    },
    derivedOutputs: ['total_consideration_cents', 'taxable_consideration_cents', 'deferred_or_rollover_consideration_cents', 'buyer_asset_basis_cents', 'seller_taxable_gain_cents', 'combined_seller_tax_rate', 'seller_tax_cents', 'seller_after_tax_proceeds_cents', 'gross_up_gap_cents'],
    boundary:
      'This model computes the integrated transaction-tax picture and routes the sub-analyses from supplied facts and rates. The entity classification, the availability and mechanics of every election, the state treatment, and the binding tax positions are determinations for tax counsel; the model orchestrates the arithmetic and the routing and renders no tax opinion.',
    golden: {
      narrative: 'An asset sale of an S-corp for $10M ($8M cash, $1M seller note, $1M earnout) over a $3M basis: the $7M gain at a combined 26% rate is $1.82M of tax, leaving $8.18M after-tax; the buyer takes a $10M asset basis, and the §1060 allocation and imputed-interest sub-models fire.',
      input: { seller_entity_type: 'S-corp', deal_form: 'asset_sale', purchase_price_cents: 1_000_000_000, seller_tax_basis_cents: 300_000_000, consideration_mix: { cash_cents: 800_000_000, seller_note_cents: 100_000_000, earnout_cents: 100_000_000 }, federal_tax_rate: 0.21, state_tax_rate: 0.05 },
    },
  },

  /* ══ M201 — §338(h)(10) / §336(e) gross-up math ══════════════════════ */
  M201: {
    founderReview: true,
    purpose:
      'Computes the gross-up a buyer must pay to make a seller whole for the extra tax of a deemed-asset-sale election, and nets it against the buyer\'s step-up benefit, while screening the §336(e) 80%/12-month disposition test. It answers, in a §338(h)(10) or §336(e) deal, "how much gross-up does the seller need, and is the step-up still worth it to the buyer after paying it?" It computes the trade-off; target/shareholder eligibility and the election mechanics are tax counsel\'s.',
    algorithm: [
      'Given `seller_tax_delta_cents` and `seller_marginal_tax_rate`, plus optional `buyer_step_up_pv_benefit_cents` (default 0), `disposition_pct`, `disposition_months`:',
      '1. If either required input is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.',
      '2. `breakeven_gross_up_cents` SHALL be `round(seller_tax_delta_cents ÷ (1 − seller_marginal_tax_rate))` when the rate is below one, else null (the gross-up is itself taxable, so it is grossed up).',
      '3. `buyer_net_benefit_after_gross_up_cents` SHALL be `buyer_step_up_pv_benefit_cents − breakeven_gross_up_cents`, or null.',
      '4. `section_336e_80pct_12mo_test_passed` SHALL be true iff the disposition percentage and window clear the §336(e) qualified-stock-disposition thresholds (constants: §336(e) qualified-stock-disposition test), or null when not supplied.',
      '5. The seller rate SHALL echo at the global 4-decimal precision.',
    ],
    constants: [
      { name: '§336(e) qualified-stock-disposition test', value: '80% of stock disposed within a 12-month window', kind: 'statutory_must', citation: 'IRC § 336(e); Treas. Reg. § 1.336-2', pin: '§ 1.336-1(b) (80% vote-and-value within 12 months)', effective: 'current (Treas. Reg. as amended)', nextCheck: 'on Treasury amendment', traceValues: [0.8, 12] },
    ],
    precisionRule: 'The gross-up and net benefit are exact integer cents; the seller rate rounds per the global rule (half-even to 4 decimals — see the Conventions chapter).',
    inputs: {
      seller_tax_delta_cents: { type: 'integer (cents)', desc: 'The seller\'s incremental tax from the deemed-asset-sale treatment.', unit: 'cents' },
      seller_marginal_tax_rate: { type: 'number', desc: 'The seller\'s marginal tax rate as a fraction.', precision: 4 },
      buyer_step_up_pv_benefit_cents: { type: 'integer (cents)', desc: 'Present-value benefit of the buyer\'s step-up (default 0).', unit: 'cents' },
      disposition_pct: { type: 'number', desc: 'Fraction of stock disposed; drives the §336(e) test.', precision: 4 },
      disposition_months: { type: 'number', desc: 'Length of the disposition window in months; drives the §336(e) test.', unit: 'months' },
    },
    outputs: {
      seller_tax_delta_cents: { type: 'integer (cents)', desc: 'The seller tax delta, echoed.', unit: 'cents' },
      seller_marginal_tax_rate: { type: 'number', desc: 'The seller marginal rate applied.', precision: 4 },
      breakeven_gross_up_cents: { type: 'integer (cents) | null', desc: 'The grossed-up amount that makes the seller whole, or null.', unit: 'cents' },
      buyer_step_up_pv_benefit_cents: { type: 'integer (cents)', desc: 'The buyer step-up benefit, echoed.', unit: 'cents' },
      buyer_net_benefit_after_gross_up_cents: { type: 'integer (cents) | null', desc: 'Buyer benefit net of the gross-up, or null.', unit: 'cents' },
      section_336e_80pct_12mo_test_passed: { type: 'boolean | null', desc: 'Whether the §336(e) disposition test passes, or null.' },
      election_review_flags: { type: 'string[]', desc: 'Standing tax-counsel review note on eligibility and mechanics.' },
    },
    derivedOutputs: ['breakeven_gross_up_cents', 'buyer_net_benefit_after_gross_up_cents'],
    boundary:
      'This model computes the gross-up and the buyer\'s net benefit and screens the §336(e) test from supplied figures. Whether the target and shareholders are eligible, the election mechanics and filings, and the binding tax positions are determinations for tax counsel; the model computes the trade-off and renders no election opinion.',
    golden: {
      narrative: 'A §338(h)(10) gross-up: a $500k seller tax delta at a 30% marginal rate needs a $714k gross-up to make the seller whole, leaving the buyer about $86k of net step-up benefit after paying it; the 85%/10-month disposition clears the §336(e) 80%/12-month test.',
      input: { seller_tax_delta_cents: 50_000_000, seller_marginal_tax_rate: 0.30, buyer_step_up_pv_benefit_cents: 80_000_000, disposition_pct: 0.85, disposition_months: 10 },
    },
  },

  /* ══ M202 — §1374 built-in gains tax ═════════════════════════════════ */
  M202: {
    founderReview: true,
    purpose:
      'Computes the §1374 built-in-gains tax on an S-corporation that converted from C-corporation status — the net unrealized built-in gain, whether the sale falls within the five-year recognition period, the recognized tax base (capped at the NUBIG, the recognized gain, and the taxable-income limitation), and the corporate-level tax. It answers, for a former C-corp selling appreciated assets, "does the built-in-gains tax bite, and how much?" It computes the tax; the recognition-period facts and state nonconformity are tax counsel\'s.',
    algorithm: [
      'Given `fmv_at_conversion_cents`, `basis_at_conversion_cents`, `conversion_date`, `sale_date`, and `recognized_gain_cents`, plus optional `taxable_income_cents`, `corporate_tax_rate` (default: the federal corporate rate):',
      '1. If any required input is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.',
      '2. `net_unrealized_built_in_gain_cents` SHALL be `max(0, fmv_at_conversion_cents − basis_at_conversion_cents)`; `years_since_conversion` SHALL be the years between conversion and sale.',
      '3. `within_recognition_period` SHALL be true iff `years_since_conversion` is below the recognition period (constants: §1374 recognition period).',
      '4. `recognized_big_tax_base_cents` SHALL be `min(NUBIG, recognized_gain, taxable-income limitation)` when within the period, else 0 (the taxable-income limitation defaults to the recognized gain).',
      '5. `section_1374_tax_cents` SHALL be `round(recognized_big_tax_base × corporate_tax_rate)` (constants: federal corporate tax rate).',
      '6. `recognition_period_years` SHALL be the §1374 recognition period (constants). `state_nonconformity_review_required` SHALL default to `within_recognition_period` — true while §1374 is live, because many states do not conform to §1374 or run their own built-in-gains/entity-level regime; it is never silently false. A caller with confirmed state conformity MAY supply `state_nonconformity_possible: false` to suppress it.',
    ],
    constants: [
      { name: '§1374 recognition period', value: '5 years', kind: 'statutory_must', citation: 'IRC § 1374(d)(7); PATH Act 2015', pin: '§ 1374(d)(7) (5-year recognition period, made permanent by the PATH Act)', effective: 'current (IRC as amended)', nextCheck: 'on IRC amendment', traceValues: [5] },
      { name: 'Federal corporate tax rate', value: '21% (0.21)', kind: 'statutory_must', citation: 'IRC § 11(b)', pin: '§ 11(b)', effective: 'current (IRC as amended)', nextCheck: 'on IRC amendment', traceValues: [0.21] },
    ],
    precisionRule: 'Years and the corporate rate round per the global rule (half-even to 4 decimals — see the Conventions chapter); the tax and gain are exact integer cents.',
    inputs: {
      fmv_at_conversion_cents: { type: 'integer (cents)', desc: 'Fair market value of assets at S-election conversion.', unit: 'cents' },
      basis_at_conversion_cents: { type: 'integer (cents)', desc: 'Tax basis of assets at conversion.', unit: 'cents' },
      conversion_date: { type: 'string (ISO date)', desc: 'The S-election conversion date.' },
      sale_date: { type: 'string (ISO date)', desc: 'The asset-sale date.' },
      recognized_gain_cents: { type: 'integer (cents)', desc: 'Gain recognized on the sale.', unit: 'cents' },
      taxable_income_cents: { type: 'integer (cents)', desc: 'Taxable income for the §1374 limitation; defaults to the recognized gain.', unit: 'cents' },
      corporate_tax_rate: { type: 'number', desc: 'Corporate tax rate as a fraction; defaults to the federal corporate rate.', precision: 4 },
      state_nonconformity_possible: { type: 'boolean', desc: 'Optional override for the state-nonconformity flag. Omitted, the flag defaults to `within_recognition_period` (never silently false); supply `false` only with confirmed state conformity.' },
    },
    outputs: {
      net_unrealized_built_in_gain_cents: { type: 'integer (cents)', desc: 'NUBIG at conversion (FMV over basis).', unit: 'cents' },
      years_since_conversion: { type: 'number', desc: 'Years between conversion and sale.', unit: 'years' },
      recognition_period_years: { type: 'integer', desc: 'The §1374 recognition period.', unit: 'years' },
      within_recognition_period: { type: 'boolean', desc: 'Whether the sale is within the recognition period.' },
      recognized_big_tax_base_cents: { type: 'integer (cents)', desc: 'The built-in-gains tax base after the caps.', unit: 'cents' },
      corporate_tax_rate: { type: 'number', desc: 'The corporate rate applied.', precision: 4 },
      section_1374_tax_cents: { type: 'integer (cents)', desc: 'The §1374 built-in-gains tax.', unit: 'cents' },
      state_nonconformity_review_required: { type: 'boolean', desc: 'Whether state nonconformity to §1374 needs review.' },
    },
    derivedOutputs: ['net_unrealized_built_in_gain_cents', 'years_since_conversion', 'recognized_big_tax_base_cents', 'section_1374_tax_cents'],
    boundary:
      'This model computes the §1374 built-in-gains tax from supplied conversion and sale figures. Whether the recognition period is correctly measured, the asset-by-asset NUBIG determination, the taxable-income limitation and its carryover, and state nonconformity are determinations for tax counsel; the model computes the tax and renders no §1374 opinion.',
    golden: {
      narrative: 'An S-corp that converted from C-corp status on Jan 1, 2023 sells assets in June 2026, inside the five-year recognition period: with $3M of net unrealized built-in gain and $4M of recognized gain, the §1374 tax base is $3M and the built-in-gains tax at 21% is $630,000.',
      input: { fmv_at_conversion_cents: 800_000_000, basis_at_conversion_cents: 500_000_000, conversion_date: '2023-01-01', sale_date: '2026-06-01', recognized_gain_cents: 400_000_000 },
    },
  },

  /* ══ M203 — Transaction cost capitalization ══════════════════════════ */
  M203: {
    founderReview: true,
    purpose:
      'Classifies each transaction cost for tax — deductible now, capitalized, or §195 amortizable — using the bright-line date, the inherently-facilitative rule, and the Rev. Proc. 2011-29 70/30 success-based-fee safe harbor, and totals each bucket. It answers, for a deal\'s tax accounting, "how does each cost split between deduction, capitalization, and amortization, and where is the documentation risk?" It classifies from supplied cost facts; the binding characterization and the documentation are tax counsel\'s.',
    algorithm: [
      'Given `transaction_costs` (a list of cost objects) and `bright_line_date`, plus optional `rev_proc_2011_29_safe_harbor_elected` (default true), `pe_owned_target` (default false):',
      '1. If `transaction_costs` is empty or the bright-line date is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.',
      '2. For each cost: a success-based fee with the safe harbor elected splits under the Rev. Proc. 2011-29 70/30 safe harbor (constants: Rev. Proc. 2011-29 success-based-fee safe harbor) — the deductible share and the capitalized remainder; an inherently facilitative cost, or one incurred on or after the bright-line date, is fully capitalized; otherwise the cost is pre-bright-line §195 investigatory and fully amortizable.',
      '3. It SHALL total the deductible, capitalized, and §195-amortizable amounts across all costs.',
      '4. `pe_owned_target_success_fee_risk_flag` SHALL be true iff the target is PE-owned and any cost took the success-based safe harbor (a documentation-risk flag).',
      '5. It SHALL return the full per-cost classification detail.',
    ],
    constants: [
      { name: 'Rev. Proc. 2011-29 success-based-fee safe harbor', value: '70% deductible / 30% capitalized', kind: 'statutory_must', citation: 'Rev. Proc. 2011-29', pin: '§ 3.01 (70/30 success-based-fee safe harbor)', effective: 'current', nextCheck: 'on IRS guidance update', traceValues: [0.7, 0.3] },
    ],
    precisionRule: 'All amounts are exact integer cents (see the Conventions chapter); the safe-harbor split is applied at the cost level and rounded to the nearest cent.',
    inputs: {
      transaction_costs: { type: 'object[]', desc: 'Transaction costs; each carries `label` (string), `amount_cents` (integer cents), `incurred_date` (ISO date), `success_based` (boolean), and `inherently_facilitative` (boolean).' },
      bright_line_date: { type: 'string (ISO date)', desc: 'The bright-line date (the earlier of the LOI and board approval); costs on or after it are facilitative.' },
      rev_proc_2011_29_safe_harbor_elected: { type: 'boolean', desc: 'Whether the 70/30 success-based-fee safe harbor is elected (default true).' },
      pe_owned_target: { type: 'boolean', desc: 'Whether the target is PE-owned (default false); drives the success-fee documentation-risk flag.' },
    },
    outputs: {
      cost_count: { type: 'integer', desc: 'Number of costs classified.' },
      deductible_cents: { type: 'integer (cents)', desc: 'Total currently deductible.', unit: 'cents' },
      capitalized_cents: { type: 'integer (cents)', desc: 'Total capitalized.', unit: 'cents' },
      amortizable_195_cents: { type: 'integer (cents)', desc: 'Total §195-amortizable.', unit: 'cents' },
      pe_owned_target_success_fee_risk_flag: { type: 'boolean', desc: 'Whether a PE-owned-target success-fee documentation risk is flagged.' },
      rows: { type: 'object[]', desc: 'Per-cost detail: `{ label, amount_cents, incurred_date, classification (a transaction_cost_classification value), deductible_cents, capitalized_cents, amortizable_195_cents }`.' },
    },
    derivedOutputs: ['cost_count', 'deductible_cents', 'capitalized_cents', 'amortizable_195_cents', 'rows'],
    boundary:
      'This model classifies transaction costs into the deduction, capitalization, and §195 buckets from supplied facts. Whether a cost is in fact facilitative, whether the safe harbor is properly elected and documented, and the binding characterization are determinations for tax counsel; the model computes the split and flags the documentation risk and renders no characterization opinion.',
    golden: {
      narrative: 'Three costs against an April 1 bright-line date: a $3M success-based banker fee splits 70/30 under the Rev. Proc. 2011-29 safe harbor ($2.1M deductible, $900k capitalized), $500k of pre-bright-line diligence is §195 investigatory, and $1M of inherently facilitative legal is capitalized — with a PE-owned-target success-fee documentation flag.',
      input: { transaction_costs: [ { label: 'Success-based banker fee', amount_cents: 300_000_000, success_based: true }, { label: 'Pre-LOI diligence', amount_cents: 50_000_000, incurred_date: '2026-01-15' }, { label: 'Facilitative legal', amount_cents: 100_000_000, incurred_date: '2026-06-01', inherently_facilitative: true } ], bright_line_date: '2026-04-01', rev_proc_2011_29_safe_harbor_elected: true, pe_owned_target: true },
    },
  },

  /* ══ M204 — Imputed interest, OID, and §453A ═════════════════════════ */
  M204: {
    founderReview: true,
    purpose:
      'Screens a deferred-payment obligation for imputed interest and OID — the shortfall of the stated rate below the applicable federal rate, the imputed interest that shortfall generates, and the §483/§1274 routing — and tests whether a large installment receivable triggers the §453A interest charge. It answers, for a seller note or installment sale, "does the note carry adequate stated interest, and does §453A bite?" It computes the imputed interest and the §453A screen; the AFR is live data and the characterization is tax counsel\'s.',
    algorithm: [
      'Given `principal_cents`, `stated_interest_rate`, `afr_rate`, and `term_months`, plus optional `installment_receivable_cents` (default 0), `installment_receivable_threshold_cents` (default: the §453A threshold):',
      '1. If any required input is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.',
      '2. `imputed_rate_delta` SHALL be `max(0, afr_rate − stated_interest_rate)` (constants: Applicable Federal Rate); `imputed_interest_cents` SHALL be `round(principal_cents × imputed_rate_delta × (term_months ÷ 12))`, and `oid_floor_cents` SHALL equal it.',
      '3. `characterization` SHALL route to the §483/§1274 review for terms over twelve months, else to the short-term adequate-stated-interest check.',
      '4. `section_453a_applies` SHALL be true iff `installment_receivable_cents` exceeds the §453A threshold (constants: §453A installment-receivable threshold).',
      '5. `section_453a_excess_receivable_cents` SHALL be `max(0, installment_receivable_cents − threshold)`.',
    ],
    constants: [
      { name: '§453A installment-receivable threshold', value: '$5,000,000 (500,000,000 cents)', kind: 'statutory_must', citation: 'IRC § 453A(b)', pin: '§ 453A(b)(2)(B) ($5M aggregate face threshold)', effective: 'current (IRC as amended)', nextCheck: 'on IRC amendment', traceValues: [500000000] },
      { name: 'Applicable Federal Rate', value: 'supplied at runtime (IRS publishes AFRs monthly)', kind: 'pass_through', citation: 'IRC § 1274(d); IRS monthly AFR release', pin: '§ 1274(d)', effective: 'monthly', nextCheck: 'monthly (per IRS release)' },
    ],
    precisionRule: 'Rates round per the global rule (half-even to 4 decimals — see the Conventions chapter); interest and receivable amounts are exact integer cents.',
    inputs: {
      principal_cents: { type: 'integer (cents)', desc: 'Principal of the deferred-payment obligation.', unit: 'cents' },
      stated_interest_rate: { type: 'number', desc: 'The obligation\'s stated interest rate, as a fraction.', precision: 4 },
      afr_rate: { type: 'number', desc: 'The applicable federal rate for the term, as a fraction; supplied at runtime.', precision: 4 },
      term_months: { type: 'number', desc: 'Term of the obligation in months.', unit: 'months' },
      installment_receivable_cents: { type: 'integer (cents)', desc: 'Aggregate face of installment receivables (default 0); drives the §453A test.', unit: 'cents' },
      installment_receivable_threshold_cents: { type: 'integer (cents)', desc: 'Override for the §453A threshold; defaults to the statutory $5M.', unit: 'cents' },
    },
    outputs: {
      principal_cents: { type: 'integer (cents)', desc: 'The principal, echoed.', unit: 'cents' },
      stated_interest_rate: { type: 'number', desc: 'The stated rate, echoed.', precision: 4 },
      afr_rate: { type: 'number', desc: 'The AFR used.', precision: 4 },
      imputed_rate_delta: { type: 'number', desc: 'AFR shortfall (AFR less stated rate, floored at zero).', precision: 4 },
      imputed_interest_cents: { type: 'integer (cents)', desc: 'Imputed interest over the term.', unit: 'cents' },
      oid_floor_cents: { type: 'integer (cents)', desc: 'The OID floor (equal to the imputed interest).', unit: 'cents' },
      characterization: { type: 'enum', enum: 'imputed_interest_characterization', desc: 'Which imputed-interest regime the term routes to.' },
      installment_453a_threshold_cents: { type: 'integer (cents)', desc: 'The §453A threshold applied.', unit: 'cents' },
      installment_receivable_cents: { type: 'integer (cents)', desc: 'The installment receivable, echoed.', unit: 'cents' },
      section_453a_applies: { type: 'boolean', desc: 'Whether the §453A interest charge applies.' },
      section_453a_excess_receivable_cents: { type: 'integer (cents)', desc: 'Receivable in excess of the threshold.', unit: 'cents' },
    },
    derivedOutputs: ['imputed_rate_delta', 'imputed_interest_cents', 'oid_floor_cents', 'section_453a_excess_receivable_cents'],
    boundary:
      'This model computes imputed interest and the §453A screen from supplied rates and figures. The correct AFR, whether the obligation carries adequate stated interest, the contingent-payment characterization, and the §453A computation are determinations for tax counsel; the model computes the shortfall and the screen and renders no characterization opinion.',
    golden: {
      narrative: 'A $2M seller note at a 3% stated rate against a 5% AFR over 36 months imputes a 2% rate delta and about $120,000 of imputed interest (the OID floor); the over-12-month term routes to §483/§1274 review, and the $6M installment receivable exceeds the $5M §453A threshold by $1M.',
      input: { principal_cents: 200_000_000, stated_interest_rate: 0.03, afr_rate: 0.05, term_months: 36, installment_receivable_cents: 600_000_000 },
    },
  },

  /* ══ M205 — SALT transaction engine ══════════════════════════════════ */
  M205: {
    founderReview: true,
    purpose:
      'Computes the state-and-local transaction tax on a deal — the apportioned gain and state income tax, any sales/use tax on the transferred base, and the total — and flags when a contested nexus position or a bulk-sale clearance routes the deal to a SALT specialist. It answers, for a multistate deal, "what state income and sales/use tax does this transaction carry, and where does it need specialist clearance?" It computes the tax from supplied apportionment and rates; the nexus and clearance positions are the specialist\'s.',
    algorithm: [
      'Given `gain_cents` and `state_apportionment_pct`, plus optional `state_tax_rate` (default 0), `sales_use_tax_base_cents` (default 0), `sales_use_tax_rate` (default 0), `bulk_sale_clearance_required` (default false), `contested_nexus_position` (default false):',
      '1. If either required input is missing, the implementation SHALL return `status: "needs_inputs"` and emit no outputs.',
      '2. `apportioned_gain_cents` SHALL be `round(gain_cents × state_apportionment_pct)`; `state_income_tax_cents` SHALL be `round(apportioned_gain × state_tax_rate)`.',
      '3. `sales_use_tax_cents` SHALL be `round(sales_use_tax_base_cents × sales_use_tax_rate)`.',
      '4. `total_state_transaction_tax_cents` SHALL be the sum of the state income and sales/use tax.',
      '5. `salt_specialist_handoff_required` SHALL be true iff a contested nexus position or a bulk-sale clearance is present.',
    ],
    constants: [],
    precisionRule: 'Apportionment and rates round per the global rule (half-even to 4 decimals — see the Conventions chapter); all tax amounts are exact integer cents.',
    inputs: {
      gain_cents: { type: 'integer (cents)', desc: 'The gain subject to state income tax.', unit: 'cents' },
      state_apportionment_pct: { type: 'number', desc: 'The state apportionment factor as a fraction.', precision: 4 },
      state_tax_rate: { type: 'number', desc: 'The state income tax rate as a fraction (default 0).', precision: 4 },
      sales_use_tax_base_cents: { type: 'integer (cents)', desc: 'Base subject to sales/use tax (default 0).', unit: 'cents' },
      sales_use_tax_rate: { type: 'number', desc: 'Sales/use tax rate as a fraction (default 0).', precision: 4 },
      bulk_sale_clearance_required: { type: 'boolean', desc: 'Whether a bulk-sale tax clearance is required (default false).' },
      contested_nexus_position: { type: 'boolean', desc: 'Whether a contested nexus position is present (default false).' },
    },
    outputs: {
      gain_cents: { type: 'integer (cents)', desc: 'The gain, echoed.', unit: 'cents' },
      state_apportionment_pct: { type: 'number', desc: 'The apportionment factor applied.', precision: 4 },
      apportioned_gain_cents: { type: 'integer (cents)', desc: 'Gain apportioned to the state.', unit: 'cents' },
      state_tax_rate: { type: 'number', desc: 'The state income tax rate applied.', precision: 4 },
      state_income_tax_cents: { type: 'integer (cents)', desc: 'State income tax on the apportioned gain.', unit: 'cents' },
      sales_use_tax_base_cents: { type: 'integer (cents)', desc: 'The sales/use tax base, echoed.', unit: 'cents' },
      sales_use_tax_cents: { type: 'integer (cents)', desc: 'Sales/use tax on the base.', unit: 'cents' },
      total_state_transaction_tax_cents: { type: 'integer (cents)', desc: 'Total state transaction tax.', unit: 'cents' },
      bulk_sale_clearance_required: { type: 'boolean', desc: 'Whether a bulk-sale clearance is required.' },
      contested_nexus_position: { type: 'boolean', desc: 'Whether a contested nexus position is present.' },
      salt_specialist_handoff_required: { type: 'boolean', desc: 'True on a contested nexus position or a bulk-sale clearance.' },
    },
    derivedOutputs: ['apportioned_gain_cents', 'state_income_tax_cents', 'sales_use_tax_cents', 'total_state_transaction_tax_cents'],
    boundary:
      'This model computes state income and sales/use transaction tax from supplied apportionment and rates. The correct apportionment factor, whether nexus exists, the taxability of the transfer, and the bulk-sale clearance requirements are determinations for a SALT specialist; on a contested position or a required clearance the model routes them and renders no state-tax opinion.',
    golden: {
      narrative: 'A $10M gain apportioned 40% to a state at a 6% rate is $240,000 of state income tax, plus $140,000 of sales/use tax on a $2M taxable base — $380,000 of state transaction tax; a required bulk-sale clearance routes the deal to a SALT specialist.',
      input: { gain_cents: 1_000_000_000, state_apportionment_pct: 0.40, state_tax_rate: 0.06, sales_use_tax_base_cents: 200_000_000, sales_use_tax_rate: 0.07, bulk_sale_clearance_required: true, contested_nexus_position: false },
    },
  },
};
