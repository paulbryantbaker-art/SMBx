/**
 * DEFINITIVE V18c — Real Property & Contract Law state tables (2026-07-16).
 *
 * Anchor-state variation encoded as DATA, not logic (V18c Recommendation 5):
 * recording-act type, risk-of-loss default, transfer-tax/reassessment regime,
 * and lease-consent reasonableness are per-state lookups (anchors DE/NY/CA/TX)
 * so new states are added as rows, never as branches. The runtime models
 * (M224–M234, MODEL.RE.*) read these tables and emit classifications, red
 * flags, and defer_to_counsel routing — never legal opinions, enforceability
 * judgments, or transaction-document drafts (THE LINE).
 *
 * Source pass: methodology/DEFINITIVE_V18C_REAL_PROPERTY_PASS.md.
 * Date-stamped; re-verify on a fixed cadence (Prop 19, NYC step-transaction
 * application, Garn/Fannie LLC policies all move).
 */

export const REAL_PROPERTY_LAW_VERSION = 'V18c.2026-07-16';

/* ── Recording acts ────────────────────────────────────────────────────── */

export type RecordingActType = 'race' | 'notice' | 'race_notice';

export interface RecordingActRule {
  type: RecordingActType;
  citation: string;
  note?: string;
}

/** DE is one of only three pure-race jurisdictions (with LA and NC). TX is a
 *  NOTICE state — Tex. Prop. Code § 13.001 protects a subsequent purchaser
 *  "without notice" with no first-to-record requirement; secondary lists
 *  calling TX race-notice are wrong (V18c resolved-conflict caveat). */
export const RECORDING_ACTS: Record<string, RecordingActRule> = {
  DE: { type: 'race', citation: '25 Del. C. § 153', note: 'Pure race (with LA, NC): first to record wins even with actual notice of a prior conveyance.' },
  NC: { type: 'race', citation: 'N.C. Gen. Stat. § 47-18' },
  LA: { type: 'race', citation: 'La. Civ. Code arts. 3338-3340 (public records doctrine)' },
  NY: { type: 'race_notice', citation: 'N.Y. Real Prop. Law § 291' },
  CA: { type: 'race_notice', citation: 'Cal. Civ. Code § 1214' },
  TX: { type: 'notice', citation: 'Tex. Prop. Code § 13.001', note: 'Notice state: a later BFP without notice prevails regardless of recording order.' },
};

/* ── Risk of loss between signing and closing ──────────────────────────── */

export type RiskOfLossRegime = 'equitable_conversion_buyer' | 'uvpra_seller' | 'ny_risk_act_seller';

export interface RiskOfLossRule {
  regime: RiskOfLossRegime;
  citation: string;
  note?: string;
}

/** Common-law majority default (equitable conversion) puts risk on the BUYER
 *  at signing. NY rejects that for risk purposes (Gen. Oblig. Law § 5-1311);
 *  CA/TX (and HI/MI/NV among others) adopted the UVPRA — risk stays on the
 *  vendor until legal title or possession passes. The contract almost always
 *  overrides; the model detects the override first. */
export const RISK_OF_LOSS: Record<string, RiskOfLossRule> = {
  NY: { regime: 'ny_risk_act_seller', citation: 'N.Y. Gen. Oblig. Law § 5-1311' },
  CA: { regime: 'uvpra_seller', citation: 'Cal. Civ. Code § 1662 (UVPRA)' },
  TX: { regime: 'uvpra_seller', citation: 'Tex. Prop. Code § 5.007 (UVPRA)' },
  HI: { regime: 'uvpra_seller', citation: 'UVPRA (adopted)' },
  MI: { regime: 'uvpra_seller', citation: 'UVPRA (adopted)' },
  NV: { regime: 'uvpra_seller', citation: 'UVPRA (adopted)' },
};

export const RISK_OF_LOSS_DEFAULT: RiskOfLossRule = {
  regime: 'equitable_conversion_buyer',
  citation: 'Equitable conversion (common-law majority rule)',
  note: 'Risk passes to the buyer at signing absent statute or contract override.',
};

/* ── Deed types → title covenants ──────────────────────────────────────── */

export type DeedType = 'general_warranty' | 'special_warranty' | 'bargain_and_sale' | 'quitclaim';

export const PRESENT_COVENANTS = ['seisin', 'right_to_convey', 'against_encumbrances'] as const;
export const FUTURE_COVENANTS = ['quiet_enjoyment', 'warranty', 'further_assurances'] as const;

export interface DeedCovenantRule {
  covenants: string[];
  scope: 'all_defects' | 'grantor_acts_only' | 'none';
  afterAcquiredTitle: boolean;
  note: string;
}

export const DEED_COVENANTS: Record<DeedType, DeedCovenantRule> = {
  general_warranty: {
    covenants: [...PRESENT_COVENANTS, ...FUTURE_COVENANTS],
    scope: 'all_defects',
    afterAcquiredTitle: true,
    note: 'All six covenants; warrants against all defects whenever arising. After-acquired title (estoppel by deed) vests later-acquired title in the grantee.',
  },
  special_warranty: {
    covenants: [...PRESENT_COVENANTS, ...FUTURE_COVENANTS],
    scope: 'grantor_acts_only',
    afterAcquiredTitle: true,
    note: 'Covenants limited to defects arising by, through, or under the grantor.',
  },
  bargain_and_sale: {
    covenants: [],
    scope: 'none',
    afterAcquiredTitle: false,
    note: 'Conveys the estate with no title covenants.',
  },
  quitclaim: {
    covenants: [],
    scope: 'none',
    afterAcquiredTitle: false,
    note: 'Releases whatever interest the grantor holds, if any; no covenants, no after-acquired title.',
  },
};

/** TX modifies the statutory covenant of seisin to a narrower "grantor has
 *  not previously conveyed" formulation. */
export const TX_SEISIN_NOTE = 'Tex. Prop. Code § 5.023 narrows the statutory seisin covenant to a "grantor has not previously conveyed" formulation.';

/* ── Concurrent ownership → signatory matrix ───────────────────────────── */

export type VestingForm = 'sole' | 'tenancy_in_common' | 'joint_tenancy' | 'tenancy_by_entirety' | 'community_property' | 'entity';

export interface SignatoryRule {
  required: string;
  gapRisk: string;
}

export const SIGNATORY_MATRIX: Record<VestingForm, SignatoryRule> = {
  sole: { required: 'The sole record owner (plus spousal joinder where homestead/community-property law requires).', gapRisk: 'Homestead or marital joinder missed.' },
  tenancy_in_common: { required: 'EVERY cotenant for a conveyance of the whole; one cotenant conveys only its undivided share.', gapRisk: 'A missing cotenant leaves a fractional interest outstanding.' },
  joint_tenancy: { required: 'All joint tenants for the whole; one joint tenant can sever and convey only its share.', gapRisk: 'Unilateral severance; survivorship defeats a devise.' },
  tenancy_by_entirety: { required: 'BOTH spouses — neither can convey or encumber alone in entirety states.', gapRisk: 'Classic missed-signatory deal-killer: a one-spouse signature conveys nothing.' },
  community_property: { required: 'Both spouses for community real property (e.g., Cal. Fam. Code § 1102; Tex. Fam. Code § 5.001 for homestead).', gapRisk: 'One-spouse conveyance voidable.' },
  entity: { required: 'Officers/managers per the entity\'s organizational documents and any required member/board consents.', gapRisk: 'Authority defect: resolutions or consents missing.' },
};

/* ── Lease consent-standard defaults (assignment/CoC) ──────────────────── */

export type ConsentStandardDefault = 'implied_reasonableness' | 'as_written_sole_discretion_enforced' | 'unsettled_check_state';

export interface LeaseConsentRule {
  whenConsentRequiredNoStandard: ConsentStandardDefault;
  citation: string;
}

export const LEASE_CONSENT_DEFAULTS: Record<string, LeaseConsentRule> = {
  CA: { whenConsentRequiredNoStandard: 'implied_reasonableness', citation: 'Kendall v. Ernest Pestana, Inc., 40 Cal.3d 488 (1985)' },
  NY: { whenConsentRequiredNoStandard: 'as_written_sole_discretion_enforced', citation: 'NY common law: absolute-consent/sole-discretion clauses enforced as written' },
};

export const LEASE_CONSENT_FALLBACK: LeaseConsentRule = {
  whenConsentRequiredNoStandard: 'unsettled_check_state',
  citation: 'State law varies; verify before relying on an implied reasonableness standard',
};

/** Absent express lease language, a change of control of an entity tenant is
 *  generally NOT an assignment by operation of law (NY line of cases); the
 *  lease must expressly deem a control transfer an assignment. */
export const COC_NOT_ASSIGNMENT_DEFAULT_NOTE =
  'Absent express lease language, a change of control of a corporate/LLC tenant is generally not an assignment "by operation of law" — the lease must expressly deem a control transfer an assignment (NY rule; verify per state).';

/* ── Transfer tax / controlling interest / reassessment ────────────────── */

export interface TransferTaxRegime {
  deedTax: boolean;
  controllingInterestTax: boolean;
  controllingInterestThresholdPct: number | null;
  aggregationYears: number | null;
  reassessmentOnControlChange: boolean;
  citation: string;
  note?: string;
}

export const TRANSFER_TAX_REGIMES: Record<string, TransferTaxRegime> = {
  NY: {
    deedTax: true,
    controllingInterestTax: true,
    controllingInterestThresholdPct: 50,
    aggregationYears: 3,
    reassessmentOnControlChange: false,
    citation: 'NYC Admin. Code § 11-2101 (controlling interest = 50% or more); § 11-2106(b)(8) & NY Tax Law § 1405(b)(6) (mere-change exemption); NY Pub. 576 (3-year acting-in-concert aggregation)',
    note: 'Step-transaction doctrine can collapse a merger plus follow-on interest transfer and defeat the mere-change exemption (Matter of 105-02 Forest Hills, NYC Tax App. Trib. 2025).',
  },
  CA: {
    deedTax: true,
    controllingInterestTax: true,
    controllingInterestThresholdPct: 50,
    aggregationYears: null,
    reassessmentOnControlChange: true,
    citation: 'Documentary transfer tax (Rev. & Tax. Code § 11911); Prop 13 change-in-ownership — change in control >50% of an entity triggers 100% reassessment (Rev. & Tax. Code § 64); cumulative transfers of original co-owner interests >50% also trigger.',
    note: 'The entity-transfer reassessment trap is independent of documentary transfer tax and economically enormous.',
  },
  DE: {
    deedTax: true,
    controllingInterestTax: false,
    controllingInterestThresholdPct: null,
    aggregationYears: null,
    reassessmentOnControlChange: false,
    citation: '30 Del. C. § 5401 et seq. (realty transfer tax — among the highest combined state+local rates)',
  },
  TX: {
    deedTax: false,
    controllingInterestTax: false,
    controllingInterestThresholdPct: null,
    aggregationYears: null,
    reassessmentOnControlChange: false,
    citation: 'No real estate transfer tax — constitutionally prohibited (Tex. Const. art. VIII § 29)',
  },
};

/* ── Garn-St. Germain due-on-sale overlay ──────────────────────────────── */

/** 12 U.S.C. § 1701j-3(d): the consumer transfer exceptions apply ONLY to a
 *  loan secured by residential real property of fewer than five dwelling
 *  units (incl. co-op stock and residential manufactured homes). Commercial
 *  and entity-level transfers get no Garn protection — lender consent is the
 *  closing-condition critical path. */
export const GARN_ST_GERMAIN = {
  citation: '12 U.S.C. § 1701j-3',
  residentialUnitCeiling: 5,
  protectedTransferKinds: [
    'transfer_to_spouse_or_child',
    'transfer_on_death_to_relative',
    'divorce_decree_transfer_to_spouse',
    'inter_vivos_trust_borrower_beneficiary',
    'junior_lien_creation',
    'leasehold_under_3y_no_option',
  ],
} as const;

/* ── Ground-lease financeability thresholds ────────────────────────────── */

export const GROUND_LEASE_FINANCEABILITY = {
  minRemainingTermBeyondLoanMaturityYears: 20, // institutional standards run 20–25
  requiredProtections: ['mortgagee_notice_and_cure', 'new_lease_on_termination', 'no_merger_of_fee_and_leasehold', 'assignable_mortgageable_tenant_interest'] as const,
  note: 'Institutional leasehold-mortgagee standards: remaining term (with unilateral extensions) of at least 20–25 years beyond loan maturity plus the four protections; missing any is a financing deal-killer or repricing event.',
};

/* ── Bulk sales / successor liability ──────────────────────────────────── */

/** UCC Article 6 is repealed in most states but bulk-sales TAX-notification
 *  regimes survive; PA's clearance can be triggered by a real-estate-only
 *  transfer. Successor liability persists everywhere via fraudulent-transfer
 *  law, de-facto-merger/mere-continuation, CERCLA, and state tax statutes. */
export const BULK_SALES_NOTIFICATION_STATES: Record<string, string> = {
  CA: 'Cal. U. Com. Code §§ 6101-6111 (retained, actively enforced) + tax clearance',
  NY: 'N.Y. Tax Law § 1141(c) bulk-sale notification',
  NJ: 'N.J.S.A. 54:50-38 bulk-sale notification',
  PA: '69 P.S. § 529; 72 P.S. § 1403 — clearance reaches real-estate-only transfers',
};

/* ── defer_to_counsel trigger catalog (E.3 — hard gate) ────────────────── */

export interface DeferTrigger {
  id: string;
  trigger: string;
}

/** Must-stop moments: on match, the system routes to counsel with options/
 *  implications and a drafted information request — and structurally cannot
 *  emit an enforceability judgment or a transaction-document draft. */
export const DEFER_TO_COUNSEL_TRIGGERS: DeferTrigger[] = [
  { id: 'DTC.RE.01', trigger: 'Any request to judge whether title is marketable or whether a defect is fatal.' },
  { id: 'DTC.RE.02', trigger: 'Any request to opine on enforceability of any clause (liquidated damages, anti-assignment, consent standard, survival, option/ROFR, due-on-sale).' },
  { id: 'DTC.RE.03', trigger: 'Any drafting of a transaction document (PSA, deed, lease, SNDA, estoppel as an instrument, title instrument, guaranty).' },
  { id: 'DTC.RE.04', trigger: 'Any conclusion about whether a specific transfer legally triggers transfer tax, reassessment, due-on-sale, a preemptive right, or a deemed assignment.' },
  { id: 'DTC.RE.05', trigger: 'Any question about whether a covenant of title has been breached or what remedy lies.' },
  { id: 'DTC.RE.06', trigger: 'Any recommendation on deal structure to achieve a legal/tax result (carve-out, F-reorg, drop-down).' },
  { id: 'DTC.RE.07', trigger: 'Any adverse-possession, boundary, quiet-title, or easement-scope dispute.' },
  { id: 'DTC.RE.08', trigger: 'Any bulk-sales/successor-liability or CERCLA successor determination.' },
  { id: 'DTC.RE.09', trigger: 'Any zoning/entitlement compliance or nonconforming-use continuation opinion.' },
  { id: 'DTC.RE.10', trigger: 'Any interpretation of ambiguous contract language or resolution of a conflict between the contract and the deed.' },
];

export const DEFER_HANDOFF_TEMPLATE =
  'This raises a [doctrine] issue that turns on [specific facts/clause]. That\'s a legal determination for your real estate/transaction counsel. Here are the options and implications for your decision, and here is a drafted information/estoppel/consent request you can send.';

/** Standard hand-off line the runtime models attach when a defer flag fires. */
export function counselHandoff(doctrine: string, turnsOn: string): string {
  return `This raises a ${doctrine} issue that turns on ${turnsOn}. That's a legal determination for your real estate/transaction counsel — here are the options and implications for your decision.`;
}
