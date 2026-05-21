export const DEFINITIVE_DEAL_MECHANICS_VERSION = 'DEFINITIVE.v1.1';
export const DEFINITIVE_DEAL_MECHANICS_URI = 'definitive://v1.1/deal-mechanics';
export const DEFINITIVE_DEAL_MECHANICS_MODEL_SLOT_COUNT = 123;
export const DEFINITIVE_DEAL_MECHANICS_GATE_COUNT = 30;
export const DEFINITIVE_DEAL_MECHANICS_AUTHORITY_TARGET = 800;

export type DefinitiveModelStatus =
  | 'v1_0_core'
  | 'v1_1'
  | 'v1_1_research'
  | 'v1_2_research'
  | 'reserved';

export type DefinitiveLineCategory =
  | 'deterministic'
  | 'professional_handoff'
  | 'research_only'
  | 'reserved';

export interface DefinitiveModelCatalogEntry {
  slotId: string;
  uri: string;
  name: string;
  status: DefinitiveModelStatus;
  lineCategory: DefinitiveLineCategory;
  gates: string[];
  dealTypes: string[];
  authorityAnchors: string[];
  deterministicComputation: string;
  notes?: string;
  implementedRuntimeModelId?: string | null;
}

export interface DefinitiveGateExpansion {
  gateId: 'G28' | 'G29' | 'G30';
  name: string;
  purpose: string;
  primaryModels: string[];
  triggerSummary: string[];
  lineNotes: string;
}

export interface DefinitivePassThroughSurface {
  pricingRule: string;
  allowed: string[];
  prohibited: string[];
  humanDirectory: string;
  dependentModelSlots: string[];
  substrateCategories: string[];
}

function entry(
  slotId: string,
  name: string,
  status: DefinitiveModelStatus,
  lineCategory: DefinitiveLineCategory,
  gates: string[],
  dealTypes: string[],
  authorityAnchors: string[],
  deterministicComputation: string,
  notes?: string,
  implementedRuntimeModelId?: string | null,
): DefinitiveModelCatalogEntry {
  return {
    slotId,
    uri: `${DEFINITIVE_DEAL_MECHANICS_URI}/models/${slotId.toLowerCase()}`,
    name,
    status,
    lineCategory,
    gates,
    dealTypes,
    authorityAnchors,
    deterministicComputation,
    ...(notes ? { notes } : {}),
    implementedRuntimeModelId: implementedRuntimeModelId ?? null,
  };
}

export const DEFINITIVE_DEAL_MECHANICS_CATALOG: DefinitiveModelCatalogEntry[] = [
  entry('M101', 'QSBS post-OBBBA', 'v1_0_core', 'deterministic', ['G14', 'G15'], ['founder sale', 'rollover'], ['IRC 1202', 'OBBBA 2025'], 'Per-issuer cap, holding period, and exclusion percentage.'),
  entry('M102', 'ESOP deferral', 'v1_0_core', 'deterministic', ['G15', 'G27'], ['ESOP sale'], ['IRC 1042'], '30 percent post-sale ownership and qualified replacement property timing.'),
  entry('M103', 'F-reorg plus 721 contribution', 'v1_0_core', 'deterministic', ['G15'], ['carve-out', 'joint venture'], ['IRC 368(a)(1)(F)', 'IRC 721'], 'F-reorg sequence and contribution qualification checks.'),
  entry('M104', 'Installment sale', 'v1_0_core', 'deterministic', ['G15'], ['deferred consideration'], ['IRC 453'], 'Gross-profit ratio, recapture, pledge, and recognition schedule.'),
  entry('M105', '338(h)(10) election', 'v1_0_core', 'deterministic', ['G15'], ['stock purchase'], ['IRC 338'], 'Deemed asset sale, adjusted grossed-up basis, and class allocation bridge.'),
  entry('M106', 'English warranty and indemnity architecture', 'v1_0_core', 'professional_handoff', ['G23'], ['UK M&A'], ['UK market practice'], 'Coverage limit, de minimis, basket, and exclusion schedule.'),
  entry('M107', 'International merger-control thresholds', 'v1_0_core', 'deterministic', ['G23'], ['international M&A'], ['EU Merger Regulation 139/2004', 'UK Enterprise Act 2002'], 'Turnover, asset, and substantial-lessening tests by jurisdiction.'),
  entry('M108', 'RWI primary architecture', 'v1_0_core', 'professional_handoff', ['G7', 'G15'], ['insured M&A'], ['SRS Acquiom', 'RWI market studies'], 'Limit, retention, exclusions, and broker-ready architecture.'),
  entry('M109', 'Working capital peg', 'v1_0_core', 'deterministic', ['G14', 'G15'], ['cash deals'], ['ABA Deal Points'], 'Target, peg, true-up, and collar math.', undefined, 'MODEL.STRUCT.NWC.PEG.v1'),
  entry('M110', 'English MAC', 'v1_0_core', 'research_only', ['G23'], ['UK M&A'], ['English MAC case law'], 'Framework mapping for durational-significance research.'),
  entry('M111', 'Revenue earnout', 'v1_0_core', 'deterministic', ['G15'], ['earnout'], ['ABA Deal Points', 'SRS Acquiom'], 'Metric threshold, period, probability, and expected-value schedule.', undefined, 'MODEL.STRUCT.EARNOUT.MC.v1'),
  entry('M112', 'EBITDA earnout', 'v1_0_core', 'deterministic', ['G15'], ['earnout'], ['ABA Deal Points', 'SRS Acquiom'], 'EBITDA target, add-back policy, and expected-value schedule.', undefined, 'MODEL.STRUCT.EARNOUT.MC.v1'),
  entry('M113', 'Gross-profit earnout', 'v1_0_core', 'deterministic', ['G15'], ['earnout'], ['ABA Deal Points', 'SRS Acquiom'], 'Gross-profit threshold and payout sensitivity.'),
  entry('M114', 'Customer-retention earnout', 'v1_0_core', 'deterministic', ['G15'], ['earnout'], ['ABA Deal Points', 'SRS Acquiom'], 'Retention cohort, payout tiers, and probability-weighted value.'),
  entry('M115', 'Regulatory-milestone earnout', 'v1_0_core', 'deterministic', ['G15'], ['earnout'], ['ABA Deal Points', 'SRS Acquiom'], 'Milestone trigger, date window, and payout schedule.'),
  entry('M116', 'Independent-sponsor tiered promote', 'v1_0_core', 'deterministic', ['G27'], ['independent sponsor', 'search fund'], ['fund formation market practice'], 'Carry tiers, catch-up, and promote allocation.'),
  entry('M117', 'Search-fund step-up', 'v1_0_core', 'deterministic', ['G27'], ['search fund'], ['ETA market norms'], 'Search investor step-up and promote conversion math.'),
  entry('M118', 'Leveraged ESOP cash flow', 'v1_0_core', 'deterministic', ['G27'], ['ESOP'], ['DOL ESOP guidance'], 'ESOP debt-service and trustee-facing cash-flow schedule.'),
  entry('M119', 'SBA 7(a) post-SOP 50 10 8', 'v1_0_core', 'deterministic', ['G15'], ['SMB acquisition'], ['SBA SOP 50 10 8'], 'Eligibility, cap, equity injection, and amortization checks.', undefined, 'MODEL.LBO.SBA.v1'),
  entry('M120', 'Continuation-fund LP waterfall', 'v1_0_core', 'professional_handoff', ['G26'], ['GP-led secondary'], ['ILPA continuation-fund guidance'], 'Preference, carry reset, and rollover economics for counsel review.'),
  entry('M121', 'Up-C and TRA', 'v1_0_core', 'professional_handoff', ['G15'], ['Up-C IPO', 'tax receivable agreement'], ['IRC 754', 'TRA market practice'], 'Basis step-up and 85/15 tax receivable agreement value.'),
  entry('M122', 'Unitranche intercreditor', 'v1_0_core', 'professional_handoff', ['G15'], ['unitranche financing'], ['LSTA model AAL'], 'First-out/last-out payment waterfall and AAL economics.'),
  entry('M123', 'MAE durational significance', 'v1_0_core', 'research_only', ['G7', 'G15'], ['M&A litigation research'], ['Akorn', 'Frontier', 'Channel Medsystems'], 'Research scaffold for MAE facts and duration flags.'),
  entry('M124', 'Ordinary-course covenant', 'v1_0_core', 'research_only', ['G15'], ['M&A litigation research'], ['AB Stable'], 'Research scaffold for ordinary-course operating deviations.'),
  entry('M125', 'Specific performance', 'v1_0_core', 'research_only', ['G15'], ['M&A litigation research'], ['Delaware equitable-remedy case law'], 'Research scaffold for remedy availability.'),
  entry('M126', 'SB 21 cleansing', 'v1_0_core', 'research_only', ['G15'], ['Delaware controller deal'], ['DGCL SB 21', 'Rutledge v. Clearway'], 'Controller-cleansing decision tree for counsel review.'),
  entry('M127', 'MFW dual-prong', 'v1_0_core', 'professional_handoff', ['G15'], ['controller deal'], ['MFW', 'Match Group'], 'Independent-committee and majority-of-minority process checklist.'),
  entry('M128', 'HSR reportability', 'v1_0_core', 'deterministic', ['G7'], ['M&A regulatory'], ['15 U.S.C. 18a'], 'Size-of-transaction, size-of-person, and exemption triage.', undefined, 'MODEL.HSR.TRIAGE.v1'),
  entry('M129', 'EU AI Act risk tier', 'v1_0_core', 'research_only', ['G24'], ['EU target', 'AI diligence'], ['Regulation (EU) 2024/1689'], 'Research scaffold for EU AI Act tiering.'),
  entry('M130', 'Cyber diligence', 'v1_0_core', 'professional_handoff', ['G24'], ['cyber diligence'], ['NIST CSF'], 'Control maturity, incident, and exposure scoring.'),
  entry('M131', 'Privacy diligence', 'v1_0_core', 'professional_handoff', ['G24'], ['privacy diligence'], ['GDPR', 'CPRA'], 'Data-map, lawful-basis, and breach-risk scoring.'),
  entry('M132', 'Sanctions diligence', 'v1_0_core', 'professional_handoff', ['G24'], ['sanctions diligence'], ['OFAC'], 'Party, geography, and control-screening workflow.'),
  entry('M133', 'ESG diligence', 'v1_0_core', 'professional_handoff', ['G24'], ['ESG diligence'], ['SEC climate and ESG references'], 'ESG exposure and disclosure-support scoring.'),
  entry('M134', 'Climate diligence', 'v1_0_core', 'professional_handoff', ['G24'], ['climate diligence'], ['SEC climate disclosure references'], 'Climate exposure, transition risk, and reporting scaffold.'),
  entry('M135', 'Fairness-opinion scaffolding', 'v1_0_core', 'professional_handoff', ['G15'], ['public deal'], ['fairness opinion case law', 'market practice'], 'Process and supporting-analysis record for the user advisor.'),
  entry('M136', 'Fraudulent-transfer baseline', 'v1_0_core', 'professional_handoff', ['G15', 'G29'], ['recap', 'LBO'], ['11 U.S.C. 548', 'UFTA', 'UVTA'], 'Baseline solvency/fraudulent-transfer schedule paired with M148.'),
  entry('M137', 'Reserved', 'reserved', 'reserved', [], [], [], 'Reserved model slot.'),
  entry('M138', 'Reserved', 'reserved', 'reserved', [], [], [], 'Reserved model slot.'),
  entry('M139', '1060 seven-class allocation', 'v1_0_core', 'deterministic', ['G15'], ['asset purchase'], ['IRC 1060', 'Treas. Reg. 1.1060'], 'Class I through VII residual allocation.', undefined, 'MODEL.TAX.1060.ALLOCATION.v1'),
  entry('M140', 'Tax-free reorganization qualification', 'v1_0_core', 'deterministic', ['G15'], ['reorganization'], ['IRC 368', 'Treas. Reg. 1.368'], 'Type A/B/C/D/E/F/G plus continuity checks.'),
  entry('M141', '251(h) eligibility and top-up', 'v1_0_core', 'deterministic', ['G15'], ['public stock deal'], ['DGCL 251(h)'], 'Eligibility and top-up requirement checks.'),
  entry('M142', 'Tender offer mechanics', 'v1_0_core', 'deterministic', ['G15'], ['tender offer'], ['Rule 14d-10', 'Rule 14e-1'], 'Proration, all-holders/best-price, and 20-business-day timing.'),
  entry('M143', '355 spin and 355(e) test', 'v1_1', 'research_only', ['G15'], ['spin-off', 'split-off', 'Reverse Morris Trust'], ['IRC 355', 'IRC 355(e)'], 'Active-trade/business, device, and 50 percent acquisition-test scaffold.'),
  entry('M144', 'Carve-out stranded-cost and TSA scoping', 'v1_0_core', 'deterministic', ['G7', 'G15'], ['carve-out'], ['market practice'], 'Allocated overhead, stranded cost, and transition-service schedule.'),
  entry('M145', '721/351 contribution plus 704(c)', 'v1_0_core', 'deterministic', ['G15'], ['joint venture', 'Up-C'], ['IRC 721', 'IRC 351', 'IRC 704(c)'], 'Built-in gain, ceiling method, and remedial-allocation math.'),
  entry('M146', 'Cap-table waterfall', 'v1_0_core', 'deterministic', ['G15'], ['growth equity', 'venture'], ['NVCA term sheet'], 'Liquidation preference, participation, seniority, and anti-dilution waterfall.', undefined, 'MODEL.CAPTABLE.DILUTION.v1'),
  entry('M147', 'PIPE 19.99 percent approval trigger', 'v1_0_core', 'deterministic', ['G15'], ['PIPE'], ['Nasdaq Rule 5635'], 'Shareholder-approval threshold and discount trigger.'),
  entry('M148', 'Three-prong solvency', 'v1_0_core', 'professional_handoff', ['G15', 'G28', 'G29'], ['recap', 'LBO', 'fraudulent transfer'], ['11 U.S.C. 548', 'UVTA', 'Tribune'], 'Balance-sheet, cash-flow, and capital-adequacy tests at user inputs.', undefined, 'MODEL.RESTRUCTURING.SOLVENCY.THREE_PRONG.v1'),
  entry('M149', 'DGCL 170 distributable surplus', 'v1_0_core', 'deterministic', ['G15'], ['dividend recap'], ['DGCL 170', 'Klang'], 'Surplus/net-profits computation at user-supplied fair value.'),
  entry('M150', '108 CODI plus 382 limitation', 'v1_0_core', 'deterministic', ['G15', 'G29'], ['debt-for-equity', 'distressed exchange'], ['IRC 108', 'IRC 382'], 'CODI inclusion, reduction attributes, and ownership-change limitation.'),
  entry('M151', '363 asset sale mechanics', 'v1_0_core', 'professional_handoff', ['G28'], ['distressed sale', '363 sale'], ['11 U.S.C. 363', '11 U.S.C. 365', 'RadLAX', 'Fisker'], 'Sale timeline, bid-protection cost, free-and-clear prongs, and credit-bid eligibility.', undefined, 'MODEL.RESTRUCTURING.363_SALE.v1'),
  entry('M152', 'Plan feasibility', 'v1_0_core', 'professional_handoff', ['G28'], ['Chapter 11 plan'], ['11 U.S.C. 1129(a)(11)'], 'Cash flow, DSCR, liquidity, covenant, and EBITDA-sensitivity table.', undefined, 'MODEL.RESTRUCTURING.PLAN_FEASIBILITY.v1'),
  entry('M153', 'Best-interests-of-creditors', 'v1_0_core', 'professional_handoff', ['G28'], ['Chapter 11 plan'], ['11 U.S.C. 1129(a)(7)', '11 U.S.C. 726'], 'Per-class plan recovery versus hypothetical Chapter 7 recovery.', undefined, 'MODEL.RESTRUCTURING.BIOC.v1'),
  entry('M154', 'Absolute priority rule and new value', 'v1_0_core', 'professional_handoff', ['G28'], ['Chapter 11 cramdown'], ['11 U.S.C. 1129(b)', '203 N. LaSalle', 'Castleton Plaza'], 'Priority waterfall and new-value decision tree.', undefined, 'MODEL.RESTRUCTURING.APR_NEW_VALUE.v1'),
  entry('M155', 'Cramdown interest rate', 'v1_0_core', 'professional_handoff', ['G28'], ['Chapter 11 cramdown'], ['Till', 'MPM Silicones', 'Texas Grand Prairie', 'Topp'], 'Efficient-market/Till formula range and circuit flag.', undefined, 'MODEL.RESTRUCTURING.CRAMDOWN_RATE.v1'),
  entry('M156', '1111(b) election trade-off', 'v1_0_core', 'professional_handoff', ['G28'], ['undersecured Chapter 11 creditor'], ['11 U.S.C. 1111(b)'], 'Election eligibility and no-election versus election value comparison.', undefined, 'MODEL.RESTRUCTURING.1111B_ELECTION.v1'),
  entry('M157', '726 Chapter 7 waterfall', 'v1_0_core', 'deterministic', ['G28'], ['Chapter 7', 'liquidation analysis'], ['11 U.S.C. 507', '11 U.S.C. 726'], 'Distribution by statutory priority and trustee-fee schedule.', undefined, 'MODEL.RESTRUCTURING.CH7_WATERFALL.v1'),
  entry('M158', '364 DIP sizing', 'v1_0_core', 'professional_handoff', ['G28', 'G29'], ['DIP financing'], ['11 U.S.C. 364', 'Collier 364.06'], '13-week cash, minimum liquidity, roll-up, carve-out, and priming schedule.', undefined, 'MODEL.RESTRUCTURING.DIP_SIZING.v1'),
  entry('M159', 'Fulcrum security', 'v1_1', 'professional_handoff', ['G28'], ['distressed-for-control'], ['market practice'], 'Enterprise value through capital stack and recovery by tranche.', undefined, 'MODEL.RESTRUCTURING.FULCRUM_SECURITY.v1'),
  entry('M160', 'Exchange offer and distressed-debt exchange', 'v1_0_core', 'professional_handoff', ['G29'], ['out-of-court restructuring'], ['Securities Act 3(a)(9)', 'TIA 316(b)'], 'Participation threshold, holdout economics, and CODI exposure.', undefined, 'MODEL.RESTRUCTURING.EXCHANGE_OFFER.v1'),
  entry('M161', 'Uptier capacity and sacred rights', 'v1_1_research', 'research_only', ['G29'], ['LME uptier'], ['Serta Simmons', 'Mitel'], 'Required-lender percentage, open-market-purchase language, and contract-risk flags.'),
  entry('M162', 'Drop-down basket capacity', 'v1_1_research', 'research_only', ['G29'], ['LME drop-down'], ['J. Crew', 'Envision', 'Pluralsight'], 'Investment-basket, unrestricted-subsidiary, and blocker capacity.'),
  entry('M163', 'Double-dip and pari-plus claim multiplier', 'v1_1_research', 'research_only', ['G29'], ['LME double-dip', 'pari-plus'], ['At Home', 'Trinseo', 'Sabre', 'ABA Business Law Today'], 'Claim multiplier and structural-seniority math.'),
  entry('M164', 'RSA economics', 'v1_1', 'professional_handoff', ['G28', 'G29'], ['restructuring support agreement'], ['11 U.S.C. 1125', 'Indianapolis Downs'], 'Class support, milestones, termination, fiduciary-out, and toggle schedule.', undefined, 'MODEL.RESTRUCTURING.RSA_ECONOMICS.v1'),
  entry('M165', 'ABC and Article 9 foreclosure recovery', 'v1_0_core', 'professional_handoff', ['G28'], ['out-of-court liquidation'], ['UCC 9-610', 'UCC 9-611', 'UCC 9-615', 'state ABC law'], 'Notice, sale, waterfall, assignee fee, and recovery schedule.', undefined, 'MODEL.RESTRUCTURING.ABC_ARTICLE9.v1'),
  entry('M166', 'Claims trading recovery', 'v1_0_core', 'deterministic', ['G28'], ['claims trading'], ['Moody\'s Ultimate Recovery Database', 'FRBP 3001'], 'Claim-purchase IRR and ultimate-recovery regression.', undefined, 'MODEL.RESTRUCTURING.CLAIMS_TRADING.v1'),
  entry('M167', 'Subchapter V eligibility', 'v1_0_core', 'deterministic', ['G28'], ['small business Chapter 11'], ['11 U.S.C. 1181-1195'], 'Debt-limit and small-business engagement checks.', undefined, 'MODEL.RESTRUCTURING.SUBCHAPTER_V_ELIGIBILITY.v1'),
  entry('M168', 'Chapter 22 recidivism score', 'v1_1', 'professional_handoff', ['G28'], ['post-emergence'], ['LoPucki Bankruptcy Research Database'], 'Recidivism-risk score from supplied operating and capital-structure inputs.', undefined, 'MODEL.RESTRUCTURING.CHAPTER22.RECIDIVISM.v1'),
  entry('M169', 'FIRPTA withholding', 'v1_0_core', 'deterministic', ['G30'], ['real estate M&A'], ['IRC 1445', 'Forms 8288 and 8288-A'], '15 percent, 10 percent, or exemption withholding path.', undefined, 'MODEL.RE.FIRPTA.WITHHOLDING.v1'),
  entry('M170', '1031 like-kind exchange timing', 'v1_0_core', 'deterministic', ['G30'], ['real estate exchange'], ['IRC 1031'], '45-day/180-day timing, identification rules, and boot recognition.', undefined, 'MODEL.RE.1031.TIMING.v1'),
  entry('M171', 'Sale-leaseback and ASC 842', 'v1_0_core', 'professional_handoff', ['G30'], ['OpCo/PropCo', 'sale-leaseback'], ['ASC 842'], 'Cap rate, residual value, and finance-versus-operating classification scaffold.', undefined, 'MODEL.RE.SALE_LEASEBACK.ASC842.v1'),
  entry('M172', 'REIT 75/75/90 compliance triad', 'v1_0_core', 'deterministic', ['G30'], ['REIT M&A'], ['IRC 856-860'], 'Income, asset, and distribution compliance tests.', undefined, 'MODEL.RE.REIT.COMPLIANCE.v1'),
  entry('M173', 'Project-finance coverage suite', 'v1_2_research', 'research_only', ['G30'], ['project finance', 'infrastructure'], ['project-finance market practice'], 'DSCR, LLCR, PLCR, and concession-model scaffold.'),
  entry('M174', 'Crypto token taxonomy', 'v1_2_research', 'research_only', ['G30'], ['crypto M&A'], ['SEC Project Crypto', 'Howey'], 'Howey and Project Crypto classification scaffold.'),
  entry('M175', 'GENIUS Act stablecoin PPS test', 'v1_2_research', 'research_only', ['G30'], ['stablecoin issuer'], ['GENIUS Act'], 'Permitted payment stablecoin framework scaffold.'),
  entry('M176', 'Digital-asset broker reporting', 'v1_2_research', 'research_only', ['G30'], ['crypto M&A'], ['IRC 6045', 'T.D. 10000', 'Form 1099-DA'], 'Broker-reporting and data-field scaffold.'),
  entry('M177', 'LP-secondary plus ECI withholding', 'v1_1', 'professional_handoff', ['G26', 'G30'], ['LP secondary'], ['IRC 1446(f)', 'ILPA guidance'], 'PSA, tri-party transfer, and withholding scaffold.', undefined, 'MODEL.SECONDARIES.LP_ECI.v1'),
  entry('M178', 'Strip-sale pricing', 'v1_1', 'deterministic', ['G26', 'G30'], ['strip sale'], ['market practice'], 'Proportionate interest pricing and retained-exposure schedule.', undefined, 'MODEL.SECONDARIES.STRIP_SALE.v1'),
  entry('M179', 'NAV facility LTV', 'v1_1', 'professional_handoff', ['G26', 'G30'], ['NAV financing'], ['NAV facility market practice'], 'Loan-to-value, cushion, and collateral pool schedule.', undefined, 'MODEL.FINANCE.NAV_FACILITY.v1'),
  entry('M180', 'Convertible and SAFE conversion', 'v1_0_core', 'deterministic', ['G15', 'G29'], ['convertible', 'SAFE'], ['YC SAFE', 'market practice'], 'Cap, discount, pre/post-money, and if-converted math.', undefined, 'MODEL.FINANCE.CONVERTIBLE_SAFE.v1'),
  entry('M181', 'Venture-debt warrant coverage', 'v1_1', 'deterministic', ['G15', 'G29'], ['venture debt'], ['venture-debt market practice'], 'Warrant coverage, exercise price, and lender IRR.', undefined, 'MODEL.FINANCE.VENTURE_DEBT_WARRANT.v1'),
  entry('M182', 'ABL borrowing base', 'v1_0_core', 'deterministic', ['G15', 'G29'], ['ABL'], ['ABL market practice'], 'Eligible A/R and inventory advance-rate calculation.', undefined, 'MODEL.FINANCE.ABL.BORROWING_BASE.v1'),
  entry('M183', 'Make-whole and call protection', 'v1_0_core', 'deterministic', ['G15', 'G29'], ['high-yield bonds', 'term loans'], ['indenture practice'], 'Treasury-plus-spread make-whole and call schedule.', undefined, 'MODEL.FINANCE.MAKE_WHOLE_CALL.v1'),
  entry('M184', 'Covenant basket engine', 'v1_0_core', 'deterministic', ['G15', 'G29'], ['credit agreement'], ['LSTA model provisions'], 'Restricted payment, debt, lien, and investment basket capacity.', undefined, 'MODEL.FINANCE.COVENANT_BASKETS.v1'),
  entry('M185', '280G golden parachute', 'v1_0_core', 'deterministic', ['G15'], ['M&A executive compensation'], ['IRC 280G'], 'Three-times base amount, excise-tax, deduction, and cleansing-vote math.', undefined, 'MODEL.TAX.280G.PARACHUTE.v1'),
  entry('M186', '382 NOL limitation', 'v1_0_core', 'deterministic', ['G15'], ['NOL target'], ['IRC 382'], 'Long-term tax-exempt rate times loss-corporation value.', undefined, 'MODEL.TAX.382.NOL_LIMIT.v1'),
  entry('M187', 'RE-heavy asset-vs-entity election', 'v1_0_core', 'deterministic', ['G30', 'G2'], ['real estate M&A'], ['IRC 1001', 'IRC 1060', 'IRC 197'], 'Asset-deal step-up, entity-deal basis, transfer-tax incidence, debt assumability, and in-place lease treatment.', undefined, 'MODEL.RE.ASSET_ENTITY.ELECTION.v1'),
  entry('M188', 'RE/operating-business purchase price bifurcation', 'v1_0_core', 'deterministic', ['G30', 'G2'], ['real estate M&A', 'operating business with real property'], ['Treas. Reg. 1.338-6', 'IRS Form 8594'], 'NOI/cap-rate real-estate value, residual operating-business value, and 1060 Class V/VI/VII reconciliation.', undefined, 'MODEL.RE.OPBUS.BIFURCATION.v1'),
  entry('M189', 'Rent-roll normalization engine', 'v1_0_core', 'deterministic', ['G30'], ['real estate diligence'], ['real estate industry practice'], 'Occupancy, WALT, expiry buckets, tenant concentration, market-rent delta, and stabilized rent.', undefined, 'MODEL.RE.RENT_ROLL.NORMALIZE.v1'),
  entry('M190', 'NOI normalization and cap-rate bridge', 'v1_0_core', 'deterministic', ['G30'], ['real estate valuation'], ['Appraisal Institute practice'], 'Effective gross income less operating expenses to NOI, value equals NOI divided by cap rate, and implied cap rate. Market cap rate is pass-through input.', undefined, 'MODEL.RE.NOI.CAP_RATE_BRIDGE.v1'),
  entry('M191', 'Real estate transfer and controlling-interest tax', 'v1_1', 'professional_handoff', ['G30', 'G19'], ['real estate M&A'], ['CT 12-638', 'MD Tax-Prop 12-117', 'WA RCW 82.45', 'NY Publication 576'], 'Jurisdictional CITT tax base, rate, aggregation window, and exemption checks. Contested state positions route to specialist review.'),
  entry('M192', 'CAM reconciliation mechanics', 'v1_0_core', 'deterministic', ['G30'], ['commercial real estate diligence'], ['BOMA', 'real estate industry practice'], 'Gross-up, base-year, expense-stop, pro-rata share, and closing-date true-up.', undefined, 'MODEL.RE.CAM.TRUEUP.v1'),
  entry('M193', 'Lease abstraction schema', 'v1_0_core', 'deterministic', ['G30'], ['lease diligence'], ['lease abstraction industry practice'], 'Structured capture of critical lease fields without interpreting legal enforceability.', undefined, 'MODEL.RE.LEASE_ABSTRACTION.v1'),
  entry('M194', 'OpCo/PropCo separation mechanics', 'v1_1', 'professional_handoff', ['G30', 'G2'], ['OpCo/PropCo', 'sale-leaseback'], ['IRC 163(j)', 'IRC 856', 'ASC 842'], 'Bifurcated balance sheet, intercompany lease, interest limitation, and recharacterization-risk threshold schedule.'),
  entry('M195', 'Property-level escrow and holdback sizing', 'v1_0_core', 'professional_handoff', ['G30'], ['real estate diligence'], ['ALTA endorsements', 'real estate practice norms'], 'Issue-specific escrow sizing for environmental, PCA, title, tenant, and cost-to-cure inputs.', undefined, 'MODEL.RE.PROPERTY_ESCROW.HOLDBACK.v1'),
  entry('M196', 'Title and survey process checklist', 'v1_0_core', 'professional_handoff', ['G30'], ['real estate closing'], ['ALTA forms', 'state title statutes'], 'Title commitment, Schedule B-II, survey, policy, endorsement, curative-plan, and closing-protection sequencing.', undefined, 'MODEL.RE.TITLE_SURVEY.CHECKLIST.v1'),
  entry('M197', 'Ground lease vs. fee simple mechanics', 'v1_1', 'professional_handoff', ['G30'], ['ground lease', 'real estate financing'], ['lender practice norms'], 'Remaining term, rent reset, reversion, leasehold mortgageability, cure rights, and financeability flag.'),
  entry('M198', 'PCA reserve modeling', 'v1_0_core', 'professional_handoff', ['G30'], ['property condition assessment'], ['ASTM E2018', 'lender practice'], 'PCA-driven one-, five-, and twelve-year reserves plus immediate-repair escrow from pass-through report inputs.', undefined, 'MODEL.RE.PCA.RESERVES.v1'),
  entry('M199', 'FIRPTA withholding v1.1', 'v1_0_core', 'deterministic', ['G15', 'G30'], ['real estate M&A', 'foreign seller'], ['IRC 897', 'IRC 1445', 'Forms 8288', 'Forms 8288-A', 'Form 8288-B'], 'FIRPTA 15 percent default, residence exemption/reduced rate, 20-day filing, reduced-withholding certificate, and 1031 timing interaction.', undefined, 'MODEL.RE.FIRPTA.WITHHOLDING.V11.v1'),
  entry('M200', 'Transaction tax master engine', 'v1_0_core', 'deterministic', ['G2', 'G19'], ['asset deal', 'stock deal', 'merger', 'rollover'], ['IRC 1001', 'IRC 338', 'IRC 336', 'IRC 351', 'IRC 368', 'IRC 721', 'IRC 1060'], 'Integrated buyer basis, seller tax, seller after-tax proceeds, gross-up gap, and fired sub-model schedule.', undefined, 'MODEL.TAX.TRANSACTION.MASTER.v1'),
  entry('M201', '338(h)(10) and 336(e) gross-up math', 'v1_0_core', 'deterministic', ['G2'], ['S-corp sale', 'deemed asset sale'], ['IRC 338(h)(10)', 'IRC 336(e)', 'Treas. Reg. 1.336-2'], 'Seller asset-treatment tax delta, buyer step-up benefit, and breakeven gross-up.', undefined, 'MODEL.TAX.GROSSUP.338_336.v1'),
  entry('M202', '1374 built-in gains tax', 'v1_0_core', 'deterministic', ['G2'], ['S-corp former C-corp'], ['IRC 1374', 'PATH Act 2015'], 'Net unrealized built-in gain, five-year recognition-period cap, corporate tax, taxable-income limitation, and installment-sale treatment.', undefined, 'MODEL.TAX.BIG.1374.v1'),
  entry('M203', 'Transaction cost capitalization', 'v1_0_core', 'professional_handoff', ['G2'], ['transaction tax'], ['IRC 195', 'IRC 263', 'Treas. Reg. 1.263(a)-5', 'Rev. Proc. 2011-29', 'INDOPCO', 'Letter Ruling 202308010'], 'Bright-line date, inherently facilitative costs, success-based fee 70/30 safe harbor, and PE-owned target risk flag.', undefined, 'MODEL.TAX.TRANSACTION_COSTS.v1'),
  entry('M204', 'Imputed interest, OID, and 453A', 'v1_0_core', 'deterministic', ['G2'], ['seller note', 'installment sale', 'earnout'], ['IRC 483', 'IRC 1274', 'IRC 1274A', 'IRC 453A'], 'AFR-based imputed interest, OID, contingent-payment characterization, and installment receivable interest charge.', undefined, 'MODEL.TAX.IMPUTED_INTEREST_OID.v1'),
  entry('M205', 'SALT transaction engine', 'v1_1', 'professional_handoff', ['G2', 'G19'], ['transaction tax', 'state tax'], ['UDITPA', 'state nexus statutes', 'bulk-sale acts'], 'State apportionment, bulk-sale compliance, successor-liability clearances, sales/use tax, and payroll-tax successor elections.'),
  entry('M206', 'Indemnification ladder engine', 'v1_0_core', 'deterministic', ['G1', 'G8'], ['purchase agreement economics'], ['ABA Private Target Deal Points Study 2023', 'ABA Model SPA'], 'Cap, basket, materiality scrape, sandbagging, carve-out, and deal-size-band math.', undefined, 'MODEL.LEGAL.INDEMNITY.LADDER.v1'),
  entry('M207', 'Survival period engine', 'v1_0_core', 'deterministic', ['G1', 'G8'], ['purchase agreement economics'], ['SRS Acquiom 2024', 'SRS Acquiom 2025', 'ABA Private Target Deal Points Study 2023'], 'General, fundamental, tax, fraud, and exclusive-remedy survival schedule.', undefined, 'MODEL.LEGAL.SURVIVAL.PERIODS.v1'),
  entry('M208', 'Escrow and holdback sizing', 'v1_0_core', 'deterministic', ['G8'], ['purchase agreement economics'], ['SRS Acquiom Deal Terms Study 2024', 'SRS Acquiom Deal Terms Study 2025', 'ABA Private Target Deal Points Study 2023'], 'General indemnity, RWI, PPA, special-purpose, and aggregate escrow sizing.', undefined, 'MODEL.LEGAL.ESCROW.HOLDBACK.v1'),
  entry('M209', 'RWI stack architecture', 'v1_1', 'professional_handoff', ['G8'], ['insured M&A'], ['ABA Private Target Deal Points Study 2023', 'Marsh RWI reports', 'Aon RWI reports', 'Lockton RWI reports'], 'Retention, tower size, excess layers, exclusions, and seller-indemnity interaction.'),
  entry('M210', 'Closing-statement true-up sequence', 'v1_0_core', 'deterministic', ['G7'], ['working capital true-up'], ['SRS Acquiom Working Capital PPA Study', 'ABA Private Target Deal Points Study 2023'], 'Estimated statement, buyer approval, actual statement, dispute notice, negotiation, and accounting-arbitrator timeline.', undefined, 'MODEL.LEGAL.CLOSING_TRUEUP.SEQUENCE.v1'),
  entry('M211', 'Conditions-to-close logic engine', 'v1_0_core', 'professional_handoff', ['G6', 'G7'], ['purchase agreement conditions'], ['ABA Model SPA', 'HSR Act', 'CFIUS regulations'], 'Bring-down, MAE, financing, marketing-period, regulatory approval, third-party consent, and condition node logic.', undefined, 'MODEL.LEGAL.CONDITIONS.LOGIC.v1'),
  entry('M212', 'Termination and break/reverse-break fee engine', 'v1_0_core', 'deterministic', ['G7'], ['public M&A', 'private M&A termination'], ['Houlihan Lokey 2023 Transaction Termination Fee Study', 'Fenwick 2023 ARBF analysis', 'Brazen v. Bell Atlantic', 'In re Topps'], 'Break-up, reverse break-up, antitrust reverse break-up, fiduciary-out, go-shop, ticking-fee, drag, and tag economics.', undefined, 'MODEL.LEGAL.TERMINATION.FEES.v1'),
  entry('M213', 'Earnout architecture and dispute', 'v1_1', 'professional_handoff', ['G9'], ['earnout'], ['SRS Acquiom Earnout data', 'IRC 453', 'IRC 483', 'IRC 1274', 'ABA earnout reports'], 'EBITDA-definition lock, acceleration triggers, post-closing covenants, dispute forum, and tax-characterization selector.'),
  entry('M214', 'IP chain-of-title verification', 'v1_0_core', 'professional_handoff', ['G10'], ['IP diligence'], ['35 U.S.C. 261', 'Lanham Act 10', '17 U.S.C. 205', 'Clorox v. Chemical Bank'], 'USPTO, trademark, copyright, employee, contractor, and intervening assignment sequence.', undefined, 'MODEL.IP.CHAIN_OF_TITLE.v1'),
  entry('M215', 'IP encumbrance and lien search', 'v1_0_core', 'professional_handoff', ['G10'], ['IP diligence', 'secured financing'], ['UCC Article 9', '17 U.S.C. 205', 'In re Peregrine', 'Rhone-Poulenc Agro v. DeKalb'], 'UCC, USPTO security agreement, and copyright office lien-search tracks.', undefined, 'MODEL.IP.ENCUMBRANCE_LIEN_SEARCH.v1'),
  entry('M216', 'License in/out dependency map', 'v1_0_core', 'deterministic', ['G10'], ['IP diligence'], ['IP licensing industry practice'], 'Material license parties, scope, exclusivity, royalty, term, termination, change-of-control, sublicensing, and consent dependencies.', undefined, 'MODEL.IP.LICENSE.DEPENDENCY.v1'),
  entry('M217', 'Standard IP representation set', 'v1_0_core', 'professional_handoff', ['G1', 'G10'], ['IP purchase agreement'], ['ABA Model SPA IP representations'], 'Industry-scaled IP rep checklist and schedule structure for counsel drafting.', undefined, 'MODEL.IP.REPRESENTATION_SET.v1'),
  entry('M218', 'Carve-out and license-back mechanics', 'v1_1', 'professional_handoff', ['G10'], ['carve-out', 'IP license-back'], ['IP carve-out practice norms'], 'Assigned IP, transition license, perpetual license-back, and TSA-IP overlay.'),
  entry('M219', 'Source-code and IP escrow mechanics', 'v1_0_core', 'deterministic', ['G10'], ['software M&A'], ['Escode', 'Codekeeper', 'Iron Mountain escrow templates'], 'Release triggers, deposit verification tier, and update schedule.', undefined, 'MODEL.IP.SOURCE_CODE_ESCROW.v1'),
  entry('M220', 'Employee IP assignment verification', 'v1_0_core', 'professional_handoff', ['G10'], ['IP diligence'], ['California Labor Code 2870', 'state employee-IP statutes'], 'Contributor-by-contributor assignment and work-for-hire verification with state enforceability flag.', undefined, 'MODEL.IP.EMPLOYEE_ASSIGNMENT.VERIFICATION.v1'),
  entry('M221', 'OSS exposure diligence process', 'v1_0_core', 'professional_handoff', ['G10'], ['software M&A', 'OSS diligence'], ['GPL', 'AGPL', 'LGPL', 'MIT', 'Apache', 'BSD', 'Morgan Lewis OSS guidance', 'Nixon Peabody OSS guidance', 'Morse OSS guidance'], 'SCA pass-through, permissive/weak/strong copyleft classification, AGPL SaaS flag, indemnity carve-out, and escrow sizing.', undefined, 'MODEL.IP.OSS.EXPOSURE.v1'),
  entry('M222', 'IP-specific 1060 allocation', 'v1_0_core', 'deterministic', ['G2', 'G10'], ['IP-heavy acquisition'], ['IRC 1060', 'Treas. Reg. 1.338-6(b)', 'Treas. Reg. 1.1060-1', 'IRS Form 8594'], 'Class V/VI/VII sub-allocation and residual-method cap ordering for IP-heavy deals.', undefined, 'MODEL.IP.1060.ALLOCATION.v1'),
  entry('M223', 'Domain and trademark transfer mechanics', 'v1_0_core', 'deterministic', ['G10'], ['domain transfer', 'trademark transfer'], ['ICANN transfer rules', 'USPTO Form PTO-1594'], 'Registrar auth-code, 60-day lock, trademark assignment recording, state trademark, social-handle, and SSL transfer steps.', undefined, 'MODEL.IP.DOMAIN_TM.TRANSFER.v1'),
];

export const DEFINITIVE_GATE_EXPANSIONS: DefinitiveGateExpansion[] = [
  {
    gateId: 'G28',
    name: 'Distressed / Restructuring',
    purpose: 'Runs the distressed-sale, Chapter 11, Chapter 7, DIP, claims, solvency, and recovery mechanics.',
    primaryModels: ['M148', 'M151', 'M152', 'M153', 'M154', 'M155', 'M156', 'M157', 'M158', 'M159', 'M164', 'M165', 'M166', 'M167', 'M168'],
    triggerSummary: [
      'M148 fails any solvency prong',
      'cash runway below 90 days or FCCR below 1.0x',
      'secured debt trades below 60 cents',
      'bankruptcy filing, RSA, forbearance, DIP lender, stalking horse, distressed fund, or trustee appears',
    ],
    lineNotes: 'DEFINITIVE computes the mechanics; courts, counsel, CROs, and financial advisors make legal, feasibility, and opinion determinations.',
  },
  {
    gateId: 'G29',
    name: 'Capital Structure & Liability Management',
    purpose: 'Runs recap, exchange-offer, covenant, DIP, convertible, ABL, make-whole, and LME mechanics.',
    primaryModels: ['M148', 'M158', 'M160', 'M161', 'M162', 'M163', 'M164', 'M180', 'M181', 'M182', 'M183', 'M184'],
    triggerSummary: [
      'maintenance-covenant breach projected within four quarters',
      'secured debt trades below 80 cents',
      'balance-sheet alteration, LME, recap, exchange offer, or covenant amendment appears',
    ],
    lineNotes: 'LME models ship research-only until case law stabilizes; outputs are math and contract-language flags for counsel.',
  },
  {
    gateId: 'G30',
    name: 'Real Estate & Asset-Class Overlays',
    purpose: 'Runs real estate, project-finance, digital-asset, LP-secondary, strip-sale, NAV-facility, and real-estate pass-through overlays.',
    primaryModels: ['M169', 'M170', 'M171', 'M172', 'M173', 'M174', 'M175', 'M176', 'M177', 'M178', 'M179', 'M187', 'M188', 'M189', 'M190', 'M191', 'M192', 'M193', 'M194', 'M195', 'M196', 'M197', 'M198', 'M199'],
    triggerSummary: [
      'real estate equals or exceeds 25 percent of enterprise value',
      'digital assets equal or exceed 10 percent of enterprise value',
      'infrastructure/project-finance, REIT, LP/GP secondary, strip sale, NAV facility, title, survey, lease, CITT, FIRPTA, 1031, OpCo/PropCo, or PCA appears',
    ],
    lineNotes: 'Digital-asset and industry-regulated overlays remain research-only until rulemaking and counsel templates are stable.',
  },
];

export const DEFINITIVE_PASS_THROUGH_SURFACE: DefinitivePassThroughSurface = {
  pricingRule: 'External data/software APIs may be billed per call at cost or cost-plus-fixed margin, paid regardless of deal outcome. Human-service routing is editorial only and never success-tied, deal-value-tied, or referral-fee compensated.',
  allowed: [
    'Data/software API calls billed per call regardless of outcome',
    'Fixed margin on pass-through API cost with published price list',
    'Free specialist directory with no compensation to DEFINITIVE for routing',
  ],
  prohibited: [
    'Success fee for routing a user or deal to a human service provider',
    'Deal-value percentage for law, accounting, appraisal, environmental, banker, broker, or diligence referrals',
    'Any compensation that varies with deal closing, securities sale, financing outcome, or professional-service fee',
  ],
  humanDirectory: 'Specialist routing is a free editorial directory. Any retention, advice, opinion, appraisal, remediation estimate, or legal/tax/accounting conclusion belongs to the user and the specialist.',
  dependentModelSlots: ['M190', 'M195', 'M196', 'M214', 'M215', 'M221'],
  substrateCategories: [
    'property appraisal and real estate market data',
    'environmental, PCA, engineering, title, and lien data',
    'UCC, USPTO, trademark, copyright, and domain records',
    'software composition analysis',
    'SALT, tax, deal-comparable, and market-data research',
  ],
};

export function listDefinitiveDealMechanicsCatalog() {
  return DEFINITIVE_DEAL_MECHANICS_CATALOG;
}

export function listDefinitiveGateExpansions() {
  return DEFINITIVE_GATE_EXPANSIONS;
}

export function getDefinitivePassThroughSurface() {
  return DEFINITIVE_PASS_THROUGH_SURFACE;
}

export function getDefinitiveDealMappingCoverage() {
  const reserved = DEFINITIVE_DEAL_MECHANICS_CATALOG.filter(model => model.status === 'reserved');
  const unmapped = DEFINITIVE_DEAL_MECHANICS_CATALOG.filter(model => (
    model.status !== 'reserved' && (model.gates.length === 0 || model.dealTypes.length === 0)
  ));
  const coveredGates = [
    ...new Set(DEFINITIVE_DEAL_MECHANICS_CATALOG.flatMap(model => model.gates)),
  ].sort((left, right) => {
    const leftNumber = Number(left.replace(/^G/, ''));
    const rightNumber = Number(right.replace(/^G/, ''));
    return leftNumber - rightNumber;
  });

  return {
    totalModelSlots: DEFINITIVE_DEAL_MECHANICS_MODEL_SLOT_COUNT,
    catalogedModelSlots: DEFINITIVE_DEAL_MECHANICS_CATALOG.length,
    activeModelSlots: DEFINITIVE_DEAL_MECHANICS_CATALOG.length - reserved.length,
    reservedModelSlots: reserved.length,
    mappedActiveModelSlots: DEFINITIVE_DEAL_MECHANICS_CATALOG.length - reserved.length - unmapped.length,
    unmappedModelSlots: unmapped.length,
    unmappedModelIds: unmapped.map(model => model.slotId),
    coveredGates,
    status: unmapped.length === 0 ? 'complete' : 'needs_mapping',
  };
}

export function getDefinitiveDealMechanicsSummary() {
  const statusCounts = DEFINITIVE_DEAL_MECHANICS_CATALOG.reduce<Record<string, number>>((acc, model) => {
    acc[model.status] = (acc[model.status] || 0) + 1;
    return acc;
  }, {});
  const lineCategoryCounts = DEFINITIVE_DEAL_MECHANICS_CATALOG.reduce<Record<string, number>>((acc, model) => {
    acc[model.lineCategory] = (acc[model.lineCategory] || 0) + 1;
    return acc;
  }, {});
  const reservedModelSlots = statusCounts.reserved || 0;

  return {
    version: DEFINITIVE_DEAL_MECHANICS_VERSION,
    uri: DEFINITIVE_DEAL_MECHANICS_URI,
    totalModelSlots: DEFINITIVE_DEAL_MECHANICS_MODEL_SLOT_COUNT,
    catalogedModelSlots: DEFINITIVE_DEAL_MECHANICS_CATALOG.length,
    activeModelSlots: DEFINITIVE_DEAL_MECHANICS_CATALOG.length - reservedModelSlots,
    reservedModelSlots,
    statusCounts,
    lineCategoryCounts,
    totalGates: DEFINITIVE_DEAL_MECHANICS_GATE_COUNT,
    newGates: DEFINITIVE_GATE_EXPANSIONS.map(gate => gate.gateId),
    authorityRegisterTarget: DEFINITIVE_DEAL_MECHANICS_AUTHORITY_TARGET,
    stagedRanges: {
      core: 'M101-M158, M160, M165-M167, M169-M172, M180, M182-M186, M187-M190, M192-M193, M195-M196, M198-M204, M206-M208, M210-M212, M214-M217, M219-M223',
      v1_1: 'M143, M159, M161-M164, M168, M177-M179, M181, M191, M194, M197, M205, M209, M213, M218',
      v1_2: 'M173-M176 and industry-regulated overlays',
    },
  };
}
