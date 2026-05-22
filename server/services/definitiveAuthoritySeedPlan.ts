import {
  DEFINITIVE_DEAL_MECHANICS_AUTHORITY_TARGET,
  DEFINITIVE_DEAL_MECHANICS_URI,
} from './definitiveDealMechanicsCatalog.js';

export const DEFINITIVE_AUTHORITY_SEED_PLAN_VERSION = 'DEFINITIVE.authority-seed-plan.v1';
export const DEFINITIVE_AUTHORITY_SEED_PLAN_URI = `${DEFINITIVE_DEAL_MECHANICS_URI}/authority-seed-plan`;
export const DEFINITIVE_AUTHORITY_REGISTER_TARGET = DEFINITIVE_DEAL_MECHANICS_AUTHORITY_TARGET;

export type DefinitiveAuthoritySeedPhase = 'v1_0_seed' | 'v1_1_seed' | 'v1_2_seed';
export type DefinitiveAuthoritySeedStatus =
  | 'ready_to_seed'
  | 'requires_subscription_or_vendor_source'
  | 'research_queue';

export interface DefinitiveAuthoritySeedCategory {
  id: string;
  label: string;
  targetEntries: number;
  phase: DefinitiveAuthoritySeedPhase;
  status: DefinitiveAuthoritySeedStatus;
  sourceTypes: string[];
  modelSlots: string[];
  gates: string[];
  examples: string[];
  freshnessPolicy: string;
  lineBoundary: string;
}

export const DEFINITIVE_REQUIRED_AUTHORITY_SEED_CATEGORIES = [
  'bankruptcy_code',
  'bankruptcy_case_law',
  'restructuring_lme',
  'irc_sections',
  'treasury_regulations',
  'real_estate',
  'connected_tax',
  'agreement_architecture',
  'ip_authorities',
  'pass_through_pricing_boundary',
  'recovery_data',
  'digital_assets',
  'regulated_industries',
] as const;

export const DEFINITIVE_AUTHORITY_SEED_CATEGORIES: DefinitiveAuthoritySeedCategory[] = [
  {
    id: 'federal_mna_regulatory',
    label: 'US federal M&A regulatory statutes and rules',
    targetEntries: 45,
    phase: 'v1_0_seed',
    status: 'ready_to_seed',
    sourceTypes: ['statute', 'regulation', 'agency_threshold'],
    modelSlots: ['M128', 'M141', 'M142', 'M147'],
    gates: ['G7', 'G15', 'G23'],
    examples: ['15 U.S.C. 18a', 'DGCL 251(h)', 'Rule 14d-10', 'Rule 14e-1', 'Nasdaq Rule 5635'],
    freshnessPolicy: 'Annual or agency-threshold refresh; immediate refresh on final rule or statutory amendment.',
    lineBoundary: 'Threshold computation only; regulatory strategy and filing advice route to counsel.',
  },
  {
    id: 'bankruptcy_code',
    label: 'Bankruptcy Code and procedural anchors',
    targetEntries: 40,
    phase: 'v1_0_seed',
    status: 'ready_to_seed',
    sourceTypes: ['statute', 'federal_rule'],
    modelSlots: ['M151', 'M152', 'M153', 'M154', 'M156', 'M157', 'M158', 'M164', 'M167'],
    gates: ['G28'],
    examples: ['11 U.S.C. 363', '11 U.S.C. 364', '11 U.S.C. 365', '11 U.S.C. 507', '11 U.S.C. 726', '11 U.S.C. 1129', 'FRBP 3001'],
    freshnessPolicy: 'Refresh on Bankruptcy Code amendment, rules amendment, or Subchapter V threshold change.',
    lineBoundary: 'DEFINITIVE computes statutory mechanics; bankruptcy filings, opinions, and court positions route to counsel/CRO/FA.',
  },
  {
    id: 'bankruptcy_case_law',
    label: 'Bankruptcy and restructuring case law',
    targetEntries: 55,
    phase: 'v1_0_seed',
    status: 'ready_to_seed',
    sourceTypes: ['case_law', 'court_opinion'],
    modelSlots: ['M151', 'M154', 'M155', 'M156', 'M158', 'M164', 'M165'],
    gates: ['G28'],
    examples: ['Till', 'RadLAX', 'Jevic', '203 N. LaSalle', 'MPM Silicones', 'Fisker', 'Free Lance-Star'],
    freshnessPolicy: 'Quarterly refresh; immediate refresh on Supreme Court, circuit, or Delaware/SDNY bankruptcy precedent.',
    lineBoundary: 'Case anchors validate research scaffolds; court application remains outside DEFINITIVE.',
  },
  {
    id: 'restructuring_lme',
    label: 'LME, distressed-exchange, and credit-agreement authorities',
    targetEntries: 45,
    phase: 'v1_1_seed',
    status: 'research_queue',
    sourceTypes: ['case_law', 'credit_agreement_market_practice', 'practitioner_analysis'],
    modelSlots: ['M160', 'M161', 'M162', 'M163', 'M164', 'M184'],
    gates: ['G29'],
    examples: ['Serta Simmons', 'Mitel / Ocean Trails CLO VII', 'J. Crew', 'Envision', 'At Home', 'Trinseo', 'Sabre'],
    freshnessPolicy: 'Monthly LME watch while litigation is moving; mark jurisdiction and agreement-language dependency.',
    lineBoundary: 'Outputs are structural math and verbatim contract flags; execution viability routes to counsel.',
  },
  {
    id: 'irc_sections',
    label: 'IRC sections for M&A, tax, and asset-class mechanics',
    targetEntries: 55,
    phase: 'v1_0_seed',
    status: 'ready_to_seed',
    sourceTypes: ['statute'],
    modelSlots: ['M101', 'M102', 'M104', 'M105', 'M139', 'M140', 'M145', 'M150', 'M169', 'M170', 'M185', 'M186', 'M199', 'M200', 'M202', 'M204', 'M222'],
    gates: ['G2', 'G15', 'G19', 'G30'],
    examples: ['IRC 1001', 'IRC 338', 'IRC 336', 'IRC 351', 'IRC 368', 'IRC 453', 'IRC 1060', 'IRC 1374', 'IRC 1445'],
    freshnessPolicy: 'Refresh on statutory change, budget act, IRS annual update, or model-specific tax-law update.',
    lineBoundary: 'Tax arithmetic only; opinions, positions, controversy, and international structuring route to tax counsel.',
  },
  {
    id: 'treasury_regulations',
    label: 'Treasury Regulations and IRS forms/instructions',
    targetEntries: 60,
    phase: 'v1_0_seed',
    status: 'ready_to_seed',
    sourceTypes: ['treasury_regulation', 'irs_form', 'irs_instruction'],
    modelSlots: ['M105', 'M139', 'M140', 'M145', 'M169', 'M199', 'M200', 'M201', 'M203', 'M204', 'M222'],
    gates: ['G2', 'G15', 'G30'],
    examples: ['Treas. Reg. 1.338-6', 'Treas. Reg. 1.1060-1', 'Treas. Reg. 1.263(a)-5', 'Treas. Reg. 1.483-4', 'Form 8594', 'Forms 8288/8288-A/8288-B'],
    freshnessPolicy: 'Refresh on IRS form/instruction revision, final regulation, or revenue procedure update.',
    lineBoundary: 'Form and regulation mechanics are computed; filing positions and advice remain professional work.',
  },
  {
    id: 'tax_guidance_and_rates',
    label: 'IRS guidance, AFR/LTTE rates, and transaction tax sources',
    targetEntries: 45,
    phase: 'v1_0_seed',
    status: 'ready_to_seed',
    sourceTypes: ['revenue_procedure', 'revenue_ruling', 'private_letter_ruling', 'rate_table'],
    modelSlots: ['M101', 'M186', 'M200', 'M203', 'M204'],
    gates: ['G2', 'G15', 'G19'],
    examples: ['Rev. Proc. 2011-29', 'monthly AFR Rev. Rul.', 'monthly long-term tax-exempt rate', 'LR 202308010'],
    freshnessPolicy: 'Monthly rate refresh; immediate refresh on published IRS guidance affecting model formulas.',
    lineBoundary: 'Live rates and safe-harbor mechanics only; contested application routes to tax counsel.',
  },
  {
    id: 'real_estate',
    label: 'Real estate deal mechanics, ALTA, ASTM, lease, and FIRPTA anchors',
    targetEntries: 60,
    phase: 'v1_0_seed',
    status: 'ready_to_seed',
    sourceTypes: ['statute', 'standard_form', 'industry_standard', 'public_record'],
    modelSlots: ['M169', 'M170', 'M171', 'M172', 'M187', 'M188', 'M189', 'M190', 'M192', 'M193', 'M195', 'M196', 'M197', 'M198', 'M199'],
    gates: ['G30'],
    examples: ['IRC 1031', 'IRC 1445', 'ASC 842', 'ALTA endorsements', 'ASTM E2018', 'BOMA CAM conventions'],
    freshnessPolicy: 'Annual standard refresh plus immediate refresh on tax/statutory change or form update.',
    lineBoundary: 'DEFINITIVE structures mechanics from inputs; appraisal, title exception, zoning, environmental, and engineering conclusions route out.',
  },
  {
    id: 'connected_tax',
    label: 'Connected transaction tax and gross-up architecture',
    targetEntries: 60,
    phase: 'v1_0_seed',
    status: 'ready_to_seed',
    sourceTypes: ['statute', 'treasury_regulation', 'tax_guidance', 'state_tax_source'],
    modelSlots: ['M200', 'M201', 'M202', 'M203', 'M204', 'M205'],
    gates: ['G2', 'G19'],
    examples: ['IRC 336(e)', 'IRC 338(h)(10)', 'IRC 1374', 'IRC 263', 'IRC 453A', 'UDITPA'],
    freshnessPolicy: 'Refresh on federal tax change, state nexus update, or source database update.',
    lineBoundary: 'Connected arithmetic and gross-up gap only; tax opinions and contested state positions route to specialists.',
  },
  {
    id: 'state_transfer_salt_citt',
    label: 'State transfer tax, CITT, SALT, and bulk-sale authorities',
    targetEntries: 60,
    phase: 'v1_1_seed',
    status: 'requires_subscription_or_vendor_source',
    sourceTypes: ['state_statute', 'state_guidance', 'tax_research_database'],
    modelSlots: ['M191', 'M205'],
    gates: ['G19', 'G30'],
    examples: ['CT 12-638', 'MD Tax-Prop 12-117', 'WA RCW 82.45', 'NY Pub 576', 'bulk-sale tax clearance statutes'],
    freshnessPolicy: 'Quarterly state-law refresh; immediate refresh on state tax legislation or agency guidance.',
    lineBoundary: 'Jurisdictional computation and routing flags only; contested nexus/apportionment routes to SALT specialist.',
  },
  {
    id: 'agreement_architecture',
    label: 'Agreement economics, escrow, RWI, earnout, and termination authorities',
    targetEntries: 60,
    phase: 'v1_0_seed',
    status: 'ready_to_seed',
    sourceTypes: ['market_study', 'model_form', 'case_law', 'broker_report'],
    modelSlots: ['M108', 'M109', 'M111', 'M112', 'M113', 'M114', 'M115', 'M206', 'M207', 'M208', 'M209', 'M210', 'M211', 'M212', 'M213'],
    gates: ['G1', 'G6', 'G7', 'G8', 'G9', 'G15'],
    examples: ['ABA Private Target Deal Points Study', 'SRS Acquiom Deal Terms Study', 'Houlihan Lokey termination fee study', 'Fenwick ARBF analysis', 'ABA Model SPA'],
    freshnessPolicy: 'Refresh within 30 days of new ABA/SRS/Houlihan/Fenwick data publication.',
    lineBoundary: 'Economic-term computation only; drafting, negotiation, enforceability, and legal opinions route to counsel.',
  },
  {
    id: 'ip_authorities',
    label: 'IP ownership, lien, license, OSS, and transfer authorities',
    targetEntries: 65,
    phase: 'v1_0_seed',
    status: 'ready_to_seed',
    sourceTypes: ['statute', 'public_record_system', 'license_text', 'case_law', 'practice_guidance'],
    modelSlots: ['M214', 'M215', 'M216', 'M217', 'M218', 'M219', 'M220', 'M221', 'M222', 'M223'],
    gates: ['G10'],
    examples: ['35 U.S.C. 261', '17 U.S.C. 205', 'Lanham Act 10', 'UCC Article 9', 'GPL', 'AGPL', 'Clorox v. Chemical Bank', 'In re Peregrine'],
    freshnessPolicy: 'Quarterly public-record/license guidance refresh; immediate refresh on statute, case, or material license update.',
    lineBoundary: 'Chain, lien, dependency, and OSS exposure schedules only; validity, enforceability, FTO, claim construction, and copyleft legal opinions route to IP counsel.',
  },
  {
    id: 'pass_through_pricing_boundary',
    label: 'THE LINE pass-through pricing and referral-fee boundaries',
    targetEntries: 35,
    phase: 'v1_0_seed',
    status: 'ready_to_seed',
    sourceTypes: ['statute', 'sec_order', 'no_action_letter', 'model_rule', 'state_exemption_map'],
    modelSlots: ['M190', 'M195', 'M196', 'M205', 'M214', 'M215', 'M221'],
    gates: ['G2', 'G10', 'G19', 'G30'],
    examples: ['Exchange Act 15(a)', 'Exchange Act 15(b)(13)', 'Exchange Act 29(b)', 'Ranieri Partners', 'Paul Anka NAL', 'ABA Model Rule 7.2(b)', 'NASAA model rule'],
    freshnessPolicy: 'Quarterly legal-boundary refresh; immediate refresh on SEC finder/M&A broker rule or state exemption change.',
    lineBoundary: 'Software/data API calls can be per-call cost-plus-fixed; paid human referral, success, and deal-value fees are prohibited.',
  },
  {
    id: 'recovery_data',
    label: 'Recovery, default, credit, and claims-market datasets',
    targetEntries: 35,
    phase: 'v1_1_seed',
    status: 'requires_subscription_or_vendor_source',
    sourceTypes: ['subscription_dataset', 'index', 'rating_agency_report'],
    modelSlots: ['M152', 'M153', 'M157', 'M159', 'M166', 'M168', 'M179'],
    gates: ['G28', 'G29', 'G30'],
    examples: ['Moody\'s Ultimate Recovery Database', 'S&P LossStats', 'Morningstar LSTA Leveraged Loan Index', 'LoPucki Bankruptcy Research Database'],
    freshnessPolicy: 'Refresh on vendor dataset update; snapshot source and as-of date for each model run.',
    lineBoundary: 'Dataset-driven recovery math only; valuation opinions and litigation positions route to user professionals.',
  },
  {
    id: 'digital_assets',
    label: 'Digital-asset, crypto, stablecoin, tokenization, and reporting authorities',
    targetEntries: 45,
    phase: 'v1_2_seed',
    status: 'research_queue',
    sourceTypes: ['statute', 'agency_statement', 'rulemaking', 'tax_regulation'],
    modelSlots: ['M174', 'M175', 'M176'],
    gates: ['G30'],
    examples: ['GENIUS Act', 'CLARITY Act', 'SEC Project Crypto', 'SEC Staff Tokenization Statement', 'T.D. 10000', 'Form 1099-DA'],
    freshnessPolicy: 'Monthly rulemaking watch; revalidate before moving any crypto model out of research-only status.',
    lineBoundary: 'Research scaffold only until rulemaking stabilizes; legal/regulatory conclusions route to counsel.',
  },
  {
    id: 'regulated_industries',
    label: 'Industry-regulated overlays',
    targetEntries: 65,
    phase: 'v1_2_seed',
    status: 'research_queue',
    sourceTypes: ['statute', 'regulation', 'agency_form', 'state_rule'],
    modelSlots: ['M107', 'M128', 'M130', 'M131', 'M132', 'M133', 'M134'],
    gates: ['G23', 'G24', 'G30'],
    examples: ['CFIUS 31 C.F.R. Part 800', 'FERC 203', 'FCC 214/310', 'BHCA Regulation Y', 'state insurance Form A', 'Stark', 'AKS', 'HIPAA', 'ITAR/EAR'],
    freshnessPolicy: 'Quarterly regulatory watch; immediate refresh on agency final rule or threshold/form change.',
    lineBoundary: 'Screening and deterministic threshold flags only; filings, regulated approvals, and legal opinions route to specialists.',
  },
  {
    id: 'delaware_mna_case_law',
    label: 'Delaware M&A, fiduciary, MAE, ordinary-course, and remedy case law',
    targetEntries: 45,
    phase: 'v1_0_seed',
    status: 'ready_to_seed',
    sourceTypes: ['case_law', 'statute'],
    modelSlots: ['M123', 'M124', 'M125', 'M126', 'M127', 'M135'],
    gates: ['G7', 'G15'],
    examples: ['Akorn', 'AB Stable', 'Channel Medsystems', 'Frontier Oil', 'MFW', 'Match Group', 'DGCL SB 21', 'Rutledge v. Clearway'],
    freshnessPolicy: 'Quarterly Delaware case refresh; immediate refresh on Delaware Supreme Court or DGCL amendment.',
    lineBoundary: 'Research and process scaffolding only; legal determinations and litigation strategy route to counsel.',
  },
  {
    id: 'market_data_live_series',
    label: 'Live market data, rate tables, and benchmark series',
    targetEntries: 45,
    phase: 'v1_0_seed',
    status: 'requires_subscription_or_vendor_source',
    sourceTypes: ['market_data_series', 'public_data_series', 'subscription_dataset'],
    modelSlots: ['M155', 'M166', 'M179', 'M182', 'M183', 'M190', 'M209'],
    gates: ['G15', 'G28', 'G29', 'G30'],
    examples: ['FRED SOFR', 'Treasury curve', 'Kroll ERP', 'Damodaran datasets', 'Marsh/Aon/Lockton RWI reports', 'FactSet/PitchBook/Capital IQ'],
    freshnessPolicy: 'Use source-specific TTL; store snapshot and as-of timestamp with every output.',
    lineBoundary: 'Market snapshots are inputs; investment, valuation, and fairness conclusions remain with users/advisors.',
  },
  {
    id: 'methodology_internal',
    label: 'Internal methodology, gate, model, and THE LINE URIs',
    targetEntries: 25,
    phase: 'v1_0_seed',
    status: 'ready_to_seed',
    sourceTypes: ['internal_methodology_uri', 'spec_uri'],
    modelSlots: ['M101-M223'],
    gates: ['G1-G30'],
    examples: ['methodology://v19', 'definitive://v1.1/deal-mechanics', 'definitive://v1.1/deal-mechanics/models/m200'],
    freshnessPolicy: 'Refresh on methodology/spec semver change; never mutate old version pins.',
    lineBoundary: 'Internal authority links prove version and methodology context, not professional conclusions.',
  },
  {
    id: 'compliance_audit_ai_governance',
    label: 'Compliance, audit, AI governance, and enterprise trust authorities',
    targetEntries: 35,
    phase: 'v1_1_seed',
    status: 'ready_to_seed',
    sourceTypes: ['standard', 'rule', 'enforcement_release', 'framework'],
    modelSlots: ['M129', 'M130', 'M131', 'M132', 'M133', 'M134'],
    gates: ['G24'],
    examples: ['SEC AI-washing releases', 'SOC 2', 'ISO 27001', 'ISO 42001', 'EU AI Act', 'FINRA 4511', 'SEC Rule 17a-4'],
    freshnessPolicy: 'Quarterly compliance refresh; immediate refresh on enforcement or standards update.',
    lineBoundary: 'Governance evidence and audit metadata only; compliance opinions remain with customer counsel/compliance.',
  },
];

export function getDefinitiveAuthoritySeedPlan() {
  const totalPlannedEntries = DEFINITIVE_AUTHORITY_SEED_CATEGORIES.reduce((sum, category) => sum + category.targetEntries, 0);
  const categoryIds = DEFINITIVE_AUTHORITY_SEED_CATEGORIES.map(category => category.id);
  const missingRequiredCategories = DEFINITIVE_REQUIRED_AUTHORITY_SEED_CATEGORIES.filter(categoryId => !categoryIds.includes(categoryId));
  const phaseCounts = DEFINITIVE_AUTHORITY_SEED_CATEGORIES.reduce<Record<string, number>>((acc, category) => {
    acc[category.phase] = (acc[category.phase] || 0) + category.targetEntries;
    return acc;
  }, {});
  const statusCounts = DEFINITIVE_AUTHORITY_SEED_CATEGORIES.reduce<Record<string, number>>((acc, category) => {
    acc[category.status] = (acc[category.status] || 0) + category.targetEntries;
    return acc;
  }, {});

  return {
    version: DEFINITIVE_AUTHORITY_SEED_PLAN_VERSION,
    uri: DEFINITIVE_AUTHORITY_SEED_PLAN_URI,
    targetEntries: DEFINITIVE_AUTHORITY_REGISTER_TARGET,
    plannedEntries: totalPlannedEntries,
    categoryCount: DEFINITIVE_AUTHORITY_SEED_CATEGORIES.length,
    categoryIds,
    requiredCategoryIds: [...DEFINITIVE_REQUIRED_AUTHORITY_SEED_CATEGORIES],
    missingRequiredCategories,
    requiredCoverageSatisfied: missingRequiredCategories.length === 0,
    status: totalPlannedEntries >= DEFINITIVE_AUTHORITY_REGISTER_TARGET && missingRequiredCategories.length === 0
      ? 'ready_for_800_plus_seeding'
      : 'needs_seed_plan_expansion',
    phaseCounts,
    statusCounts,
    categories: DEFINITIVE_AUTHORITY_SEED_CATEGORIES,
    lineDoctrine: 'Authority entries support deterministic computation, citation validation, freshness, and THE LINE routing. They never convert software outputs into legal, tax, investment, brokerage, appraisal, fairness, solvency, feasibility, or court opinions.',
  };
}
