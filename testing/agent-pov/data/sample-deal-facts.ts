/**
 * Canonical anonymized deal fact patterns shared across simulations.
 *
 * Each constant here represents one underlying transaction. Simulation fixtures
 * derive both-side payloads from these constants so the "ground truth" is
 * unambiguous and both parties' substrate output can be compared against it.
 *
 * All money values are in cents. (See CLAUDE.md Critical Rule #10.)
 */

import type { CanonicalDealFacts } from '../types.js';

/**
 * L4 healthy B2B services acquisition. $5M SDE, $25M ask, TX, seller LLC.
 * Anchor scenario used by SIM-L4-BUY-SELL-HEALTHY-001 (worked example).
 */
export const SAMPLE_L4_HEALTHY_B2B_SERVICES: CanonicalDealFacts = {
  summary: 'L4 healthy B2B services acquisition — $5M SDE target in Austin TX, $25M ask, seller is LLC pass-through, buyer is LMM PE sponsor.',
  industry: 'B2B services',
  naics: '541512',
  jurisdiction: 'US-TX',
  targetRevenue: 1800_000_00, // $18M
  targetEbitda: 500_000_000,  // $5M
  targetSde: 500_000_000,     // $5M (assume similar for this scenario)
  purchasePrice: 2500_000_000, // $25M
  sponsorEquity: 1600_000_000, // $16M
  senorDebt: 900_000_000,      // $9M (SBA 7(a) + senior bank)
  taxClassification: 'llc_partnership',
  electionType: 'none',
  assetClass: 'operating_co',
  foreignSeller: false,
  extra: {
    sbaEligible: true,
    sponsorType: 'lmm_pe',
    multiYearPnlAvailable: true,
    ownerPerksAddBacks: 250_000_00, // $250K
  },
};

/**
 * L2 micro-LMM SBA-financed acquisition. $1M SDE restaurant, single-state.
 */
export const SAMPLE_L2_SBA_RESTAURANT: CanonicalDealFacts = {
  summary: 'L2 SBA-financed restaurant acquisition — $1M SDE, single-state TX, seller LLC, first-time buyer with SBA 7(a) + seller note.',
  industry: 'restaurant',
  naics: '722511',
  jurisdiction: 'US-TX',
  targetRevenue: 350_000_000,  // $3.5M
  targetSde: 100_000_000,      // $1M
  purchasePrice: 400_000_000,  // $4M (4x SDE)
  sponsorEquity: 50_000_000,   // $500K (12.5% down)
  senorDebt: 320_000_000,      // $3.2M SBA 7(a)
  subordinatedDebt: 30_000_000, // $300K seller note
  taxClassification: 'llc_partnership',
  assetClass: 'operating_co',
  foreignSeller: false,
  extra: { sbaEligible: true, sponsorType: 'first_time_buyer' },
};

/**
 * L6 LMM strategic tuck-in. $25M EBITDA target, $200M deal, strategic acquirer.
 */
export const SAMPLE_L6_STRATEGIC_TUCKIN: CanonicalDealFacts = {
  summary: 'L6 strategic tuck-in — $25M EBITDA target in B2B SaaS, $200M deal, strategic acquirer with synergies. Stock deal with §338(h)(10).',
  industry: 'SaaS',
  naics: '511210',
  jurisdiction: 'US-DE',
  targetRevenue: 1200_000_000, // $120M ARR
  targetEbitda: 2500_000_000,  // $25M
  purchasePrice: 20000_000_000, // $200M (8x EBITDA)
  sponsorEquity: 20000_000_000, // 100% cash (strategic acquirer)
  taxClassification: 'c_corp',
  electionType: '338(h)(10)',
  assetClass: 'operating_co',
  extra: { acquirerType: 'strategic', synergyExpected: true, ipHeavy: true },
};

/**
 * L4 distressed acquisition — 363 sale of operating co with secured debt distress.
 */
export const SAMPLE_L4_DISTRESSED_363: CanonicalDealFacts = {
  summary: 'L4 distressed 363 sale — $5M EBITDA target in industrial services, secured debt trading at 55¢, cash runway 75 days, stalking-horse bidder.',
  industry: 'industrial services',
  naics: '561720',
  jurisdiction: 'US-DE',
  targetEbitda: 500_000_000, // $5M
  purchasePrice: 1500_000_000, // $15M (3x — distressed multiple)
  sponsorEquity: 1500_000_000,
  cashRunwayDays: 75,
  fccr: 0.85,
  securedDebtPriceCents: 55,
  taxClassification: 'c_corp',
  assetClass: 'operating_co',
  extra: { distressType: 'pre_filing', stalkingHorse: true },
};

/**
 * RAISE seed SAFE round — $2M raise on $10M cap.
 */
export const SAMPLE_RAISE_SEED_SAFE: CanonicalDealFacts = {
  summary: 'Seed SAFE — $2M raise on $10M post-money cap, 20% discount, MFN. SaaS issuer, multi-investor party.',
  industry: 'SaaS',
  naics: '511210',
  jurisdiction: 'US-DE',
  targetRevenue: 30_000_000, // $300K ARR
  taxClassification: 'c_corp',
  assetClass: 'operating_co',
  extra: { raiseAmount: 200_000_000, postMoneyCap: 1000_000_000, discount: 0.20, mfn: true, instrument: 'safe' },
};

/**
 * RAISE debt — $30M ABL facility, working capital line for distributor.
 */
export const SAMPLE_RAISE_DEBT_ABL: CanonicalDealFacts = {
  summary: 'ABL facility — $30M committed against eligible receivables + inventory, $10M revolver outstanding at close, distributor borrower.',
  industry: 'wholesale distribution',
  naics: '423000',
  jurisdiction: 'US-IL',
  targetRevenue: 8000_000_000, // $80M
  taxClassification: 'c_corp',
  assetClass: 'operating_co',
  extra: { facilityType: 'abl', commitment: 3000_000_000, advance_rate_ar: 0.85, advance_rate_inventory: 0.50 },
};

/**
 * PMI post-close — $5M EBITDA target post-close, 100-day plan needed.
 */
export const SAMPLE_PMI_INTEGRATION: CanonicalDealFacts = {
  summary: 'Post-close PMI — same target as SAMPLE_L4_HEALTHY_B2B_SERVICES, 30 days post-close, need 100-day plan + workstream charters.',
  industry: 'B2B services',
  naics: '541512',
  jurisdiction: 'US-TX',
  targetEbitda: 500_000_000,
  taxClassification: 'llc_partnership',
  assetClass: 'operating_co',
  extra: { daysPostClose: 30, integrationType: 'tuck_in', tsaActive: false },
};

/**
 * L2 micro-LMM SBA + seller note + 5-year earnout variation.
 * Used by SIM-L2-BUY-SELL-SBA-002.
 */
export const SAMPLE_L2_SBA_RESTAURANT_EARNOUT: CanonicalDealFacts = {
  summary: 'L2 SBA-financed restaurant acquisition with $300K seller note and 5-year EBITDA earnout — $1M SDE, single-state TX, seller LLC, first-time buyer.',
  industry: 'restaurant',
  naics: '722511',
  jurisdiction: 'US-TX',
  targetRevenue: 350_000_000,  // $3.5M
  targetSde: 100_000_000,      // $1M
  purchasePrice: 450_000_000,  // $4.5M total ($4M base + $500K earnout potential)
  sponsorEquity: 50_000_000,   // $500K (11.1% down)
  senorDebt: 320_000_000,      // $3.2M SBA 7(a)
  subordinatedDebt: 30_000_000, // $300K seller note (5-yr, 7%)
  earnout: 50_000_000,         // $500K max earnout (5-year EBITDA-based)
  taxClassification: 'llc_partnership',
  assetClass: 'operating_co',
  foreignSeller: false,
  extra: {
    sbaEligible: true,
    sponsorType: 'first_time_buyer',
    sellerNoteTermYears: 5,
    sellerNoteRatePct: 0.07,
    earnoutMetric: 'ebitda',
    earnoutYears: 5,
    earnoutTargetCents: 100_000_000, // $1M EBITDA target
    earnoutProbabilities: [0.6, 0.55, 0.5, 0.45, 0.4],
  },
};

/**
 * L2 micro-LMM SBA acquisition with owner-rep (broker) on sell side.
 * Used by SIM-L2-BUY-SELL-SBA-003.
 */
export const SAMPLE_L2_SBA_RESTAURANT_OWNER_REP: CanonicalDealFacts = {
  summary: 'L2 SBA-financed restaurant acquisition — same economics as base, but sell side represented by owner-rep / business broker, not principal.',
  industry: 'restaurant',
  naics: '722511',
  jurisdiction: 'US-TX',
  targetRevenue: 350_000_000,
  targetSde: 100_000_000,
  purchasePrice: 400_000_000,
  sponsorEquity: 50_000_000,
  senorDebt: 320_000_000,
  subordinatedDebt: 30_000_000,
  taxClassification: 'llc_partnership',
  assetClass: 'operating_co',
  foreignSeller: false,
  extra: {
    sbaEligible: true,
    sponsorType: 'first_time_buyer',
    sellerRepresentation: 'owner_rep',
    brokerEngagementType: 'success_only_listing',
  },
};

/**
 * L4 healthy B2B services with earnout structure.
 * Used by SIM-L4-BUY-SELL-HEALTHY-002.
 */
export const SAMPLE_L4_HEALTHY_EARNOUT_B2B_SERVICES: CanonicalDealFacts = {
  summary: 'L4 healthy B2B services with earnout — $5M SDE target in Austin TX, $22M cash + $3M earnout over 3 years tied to revenue growth, LLC pass-through seller.',
  industry: 'B2B services',
  naics: '541512',
  jurisdiction: 'US-TX',
  targetRevenue: 1800_000_00,
  targetEbitda: 500_000_000,
  targetSde: 500_000_000,
  purchasePrice: 2500_000_000, // $25M headline including earnout at full attainment
  sponsorEquity: 1300_000_000, // $13M
  senorDebt: 900_000_000,
  earnout: 300_000_000,        // $3M earnout potential
  taxClassification: 'llc_partnership',
  electionType: 'none',
  assetClass: 'operating_co',
  foreignSeller: false,
  extra: {
    sbaEligible: false,
    sponsorType: 'lmm_pe',
    earnoutMetric: 'revenue',
    earnoutYears: 3,
    earnoutTargets: [2000_000_00, 2200_000_00, 2400_000_00],
    earnoutProbabilities: [0.7, 0.55, 0.4],
  },
};

/**
 * L4 healthy B2B services with foreign (non-US) seller — triggers FIRPTA / §1446(f).
 * Used by SIM-L4-BUY-SELL-HEALTHY-003.
 */
export const SAMPLE_L4_HEALTHY_FOREIGN_SELLER_B2B_SERVICES: CanonicalDealFacts = {
  summary: 'L4 healthy B2B services with foreign seller — $5M EBITDA target in Austin TX, $25M cash deal, Cayman holdco seller with US real property holdings (FIRPTA exposure).',
  industry: 'B2B services',
  naics: '541512',
  jurisdiction: 'US-TX',
  targetRevenue: 1800_000_00,
  targetEbitda: 500_000_000,
  targetSde: 500_000_000,
  purchasePrice: 2500_000_000,
  sponsorEquity: 1600_000_000,
  senorDebt: 900_000_000,
  taxClassification: 'foreign_entity',
  electionType: 'none',
  assetClass: 'mixed',
  foreignSeller: true,
  extra: {
    sbaEligible: false,
    sponsorType: 'lmm_pe',
    sellerJurisdiction: 'KY', // Cayman
    usRealPropertyHoldings: true,
    usRealPropertyValueCents: 600_000_000, // $6M owned office building
    firptaWithholdingTriggered: true,
    section1446fTriggered: false, // not partnership interest sale
  },
};

/**
 * L4 healthy B2B services with §338(h)(10) election (S-corp target).
 * Used by SIM-L4-BUY-SELL-HEALTHY-004.
 */
export const SAMPLE_L4_HEALTHY_338_H10_B2B_SERVICES: CanonicalDealFacts = {
  summary: 'L4 healthy B2B services with §338(h)(10) election — $5M EBITDA target in Austin TX, $25M deal, S-corp seller, joint election delivers stepped-up basis to buyer at cost of seller ordinary income gross-up.',
  industry: 'B2B services',
  naics: '541512',
  jurisdiction: 'US-TX',
  targetRevenue: 1800_000_00,
  targetEbitda: 500_000_000,
  targetSde: 500_000_000,
  purchasePrice: 2500_000_000,
  sponsorEquity: 1600_000_000,
  senorDebt: 900_000_000,
  taxClassification: 's_corp',
  electionType: '338(h)(10)',
  assetClass: 'operating_co',
  foreignSeller: false,
  extra: {
    sbaEligible: false,
    sponsorType: 'lmm_pe',
    sellerEntityType: 's_corp',
    sellerSCorpAge: 12, // years as S-corp
    builtInGainsExposure: false, // > 5-year recognition period
    grossUpRequested: true,
    sellerMarginalTaxRate: 0.37,
    section1060AllocationRequired: true,
  },
};

/**
 * L4 healthy QSBS-eligible C-corp seller — §1202 exclusion.
 * Used by SIM-L4-BUY-SELL-HEALTHY-005.
 */
export const SAMPLE_L4_HEALTHY_1202_QSBS_C_CORP: CanonicalDealFacts = {
  summary: 'L4 healthy SaaS C-corp acquisition — $4M EBITDA target in Austin TX, $30M stock deal, original-issuance C-corp with QSBS-qualifying shareholders (>5-year hold, sub-$50M gross assets at issuance, active business).',
  industry: 'SaaS',
  naics: '511210',
  jurisdiction: 'US-DE',
  targetRevenue: 2000_000_00, // $20M ARR
  targetEbitda: 400_000_000,  // $4M
  purchasePrice: 3000_000_000, // $30M
  sponsorEquity: 3000_000_000, // all-stock strategic buyer-equivalent / cash deal
  taxClassification: 'c_corp',
  electionType: 'none',
  assetClass: 'operating_co',
  foreignSeller: false,
  extra: {
    sbaEligible: false,
    sponsorType: 'strategic',
    originalIssuance: true,
    grossAssetsAtIssuanceCents: 4000_000_00, // $40M (under $50M cap)
    holdingPeriodYears: 7,
    activeBusinessTest: true,
    qsbsEligible: true,
    qsbsExclusionCapCents: 1000_000_000, // $10M per holder
    foundingShareholders: 3,
    perHolderExclusionCents: 1000_000_000,
  },
};

/**
 * L4 healthy with rollover equity + management retention package.
 * Used by SIM-L4-BUY-SELL-HEALTHY-006.
 */
export const SAMPLE_L4_HEALTHY_ROLLOVER_MANAGEMENT_RETENTION: CanonicalDealFacts = {
  summary: 'L4 healthy B2B services with management rollover — $5M EBITDA target in Austin TX, $25M deal, founder rolls 25% equity into NewCo, 3-year retention package + earnout, LLC pass-through.',
  industry: 'B2B services',
  naics: '541512',
  jurisdiction: 'US-TX',
  targetRevenue: 1800_000_00,
  targetEbitda: 500_000_000,
  targetSde: 500_000_000,
  purchasePrice: 2500_000_000,
  sponsorEquity: 1300_000_000, // $13M cash equity
  senorDebt: 900_000_000,
  rollover: 625_000_000,       // $6.25M rollover (25% of equity check)
  taxClassification: 'llc_partnership',
  electionType: 'none',
  assetClass: 'operating_co',
  foreignSeller: false,
  extra: {
    sbaEligible: false,
    sponsorType: 'lmm_pe',
    rolloverPct: 0.25,
    rolloverVehicle: 'newco_llc_units',
    rolloverTaxDeferred: true, // §721 contribution
    managementRetentionYears: 3,
    retentionPoolPct: 0.10, // 10% MIP
    vestingSchedule: '25%_cliff_4yr',
    nonCompeteYears: 3,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Tier-A extended fact patterns (added 2026-05-27 for SIM-L6/L8/RAISE/PMI/X-domain)
// All money values in cents.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * L6 carve-out from a public parent. $18M EBITDA non-core division, $150M deal,
 * 12-month TSA covering IT, payroll, and shared procurement.
 * Used by SIM-L6-BUY-SELL-CARVE-OUT-001.
 */
export const SAMPLE_L6_CARVE_OUT_WITH_TSA: CanonicalDealFacts = {
  summary: 'L6 carve-out — $18M EBITDA non-core industrial-tech division spun out of public parent, $150M deal, sponsor buyer, 12-month TSA on IT/payroll/procurement, stranded costs $4M.',
  industry: 'industrial technology',
  naics: '334513',
  jurisdiction: 'US-DE',
  targetRevenue: 9000_000_000,  // $90M
  targetEbitda: 1800_000_000,   // $18M
  purchasePrice: 15000_000_000, // $150M (8.3x)
  sponsorEquity: 6000_000_000,
  senorDebt: 9000_000_000,
  taxClassification: 'c_corp',
  electionType: '336(e)',
  assetClass: 'operating_co',
  foreignSeller: false,
  extra: {
    parentType: 'public',
    tsaActive: true,
    tsaDurationMonths: 12,
    tsaScope: ['it', 'payroll', 'shared_procurement'],
    strandedCostsCents: 400_000_000,
    sellerRetainedLiabilities: ['historical_environmental', 'pre_close_tax'],
  },
};

/**
 * L6 family-office direct investment — 70% control + founder rollover.
 * Used by SIM-L6-BUY-SELL-FAMILY-OFFICE-001.
 */
export const SAMPLE_L6_FAMILY_OFFICE_DIRECT: CanonicalDealFacts = {
  summary: 'L6 family-office direct — $20M EBITDA specialty manufacturer, $160M deal, family office takes 70% control with founder rollover, no sponsor intermediary.',
  industry: 'specialty manufacturing',
  naics: '332710',
  jurisdiction: 'US-OH',
  targetRevenue: 13000_000_000,
  targetEbitda: 2000_000_000,
  purchasePrice: 16000_000_000,
  sponsorEquity: 11200_000_000,
  rollover: 4800_000_000,
  taxClassification: 'llc_partnership',
  electionType: 'none',
  assetClass: 'operating_co',
  extra: {
    acquirerType: 'family_office',
    holdHorizonYears: 15,
    boardSeats: { fo: 3, founder: 2 },
    noFundManager: true,
  },
};

/**
 * L6 independent sponsor — syndicating equity from family offices.
 * Used by SIM-L6-BUY-SELL-IS-001.
 */
export const SAMPLE_L6_INDEPENDENT_SPONSOR: CanonicalDealFacts = {
  summary: 'L6 independent sponsor — $12M EBITDA HVAC services platform, $84M deal, IS has LOI and is syndicating equity from family offices; tiered promote 10/20/30 over 8/15/25% IRR hurdles.',
  industry: 'HVAC services',
  naics: '238220',
  jurisdiction: 'US-FL',
  targetRevenue: 6500_000_000,
  targetEbitda: 1200_000_000,
  purchasePrice: 8400_000_000,
  sponsorEquity: 3600_000_000,
  senorDebt: 4800_000_000,
  taxClassification: 'llc_partnership',
  electionType: '338(h)(10)',
  assetClass: 'operating_co',
  extra: {
    sponsorType: 'independent_sponsor',
    isClosingFeeCents: 84_000_000,
    isManagementFeeCents: 50_000_000,
    promoteTiers: [
      { hurdleIrr: 0.08, promotePct: 0.10 },
      { hurdleIrr: 0.15, promotePct: 0.20 },
      { hurdleIrr: 0.25, promotePct: 0.30 },
    ],
    catchUpPct: 1.0,
  },
};

/**
 * L6 ESOP — trustee-led leveraged ESOP buyout, §1042 rollover for sellers.
 * Used by SIM-L6-BUY-SELL-ESOP-001.
 */
export const SAMPLE_L6_ESOP_TRUSTEE_LED: CanonicalDealFacts = {
  summary: 'L6 leveraged ESOP — $15M EBITDA professional services firm, $105M EV, trustee-led, 100% ESOP at close with §1042 election by sellers, senior + mezz stack, repurchase obligation modeled.',
  industry: 'professional services',
  naics: '541611',
  jurisdiction: 'US-IL',
  targetRevenue: 8500_000_000,
  targetEbitda: 1500_000_000,
  purchasePrice: 10500_000_000,
  sponsorEquity: 0,
  senorDebt: 6300_000_000,
  subordinatedDebt: 4200_000_000,
  taxClassification: 'c_corp',
  electionType: 'none',
  assetClass: 'operating_co',
  extra: {
    transactionType: 'esop',
    trusteeRole: 'institutional_trustee',
    section1042Election: true,
    qrpRequired: true,
    warrantsPct: 0.35,
    repurchaseObligationYears: 10,
  },
};

/**
 * L8 mid-market PE-led acquisition — megafund sponsor, $540M deal.
 * Used by SIM-L8-BUY-SELL-MID-001.
 */
export const SAMPLE_L8_MID_MARKET_PE: CanonicalDealFacts = {
  summary: 'L8 mid-market PE — $60M EBITDA tech-enabled services platform, $540M deal (9x), megafund sponsor, two-step auction, 15% management rollover, unitranche + holdco PIK.',
  industry: 'tech-enabled services',
  naics: '541512',
  jurisdiction: 'US-DE',
  targetRevenue: 32000_000_000,
  targetEbitda: 6000_000_000,
  purchasePrice: 54000_000_000,
  sponsorEquity: 21600_000_000,
  senorDebt: 27000_000_000,
  subordinatedDebt: 5400_000_000,
  rollover: 8100_000_000,
  taxClassification: 'c_corp',
  electionType: '338(h)(10)',
  assetClass: 'operating_co',
  extra: {
    sponsorType: 'megafund_pe',
    processType: 'two_step_auction',
    bankerLed: true,
    rwiPresent: false,
    holdYears: 5,
    exitMultipleTarget: 11.0,
  },
};

/**
 * L8 mid-market with full RWI stack — walk-away indemnity, no escrow.
 * Used by SIM-L8-BUY-SELL-MID-002.
 */
export const SAMPLE_L8_WITH_RWI: CanonicalDealFacts = {
  summary: 'L8 with RWI — $45M EBITDA SaaS, $405M deal (9x), buyer-side RWI primary $40M + excess $20M, 0.5% retention, no indemnity escrow, walk-away indemnity except fundamentals.',
  industry: 'SaaS',
  naics: '511210',
  jurisdiction: 'US-DE',
  targetRevenue: 18000_000_000,
  targetEbitda: 4500_000_000,
  purchasePrice: 40500_000_000,
  sponsorEquity: 16200_000_000,
  senorDebt: 20250_000_000,
  rollover: 4050_000_000,
  taxClassification: 'c_corp',
  electionType: '338(h)(10)',
  assetClass: 'operating_co',
  extra: {
    rwiPresent: true,
    rwiPrimaryLimitCents: 4000_000_000,
    rwiExcessLimitCents: 2000_000_000,
    rwiRetentionPct: 0.005,
    rwiPremiumPct: 0.0265,
    indemnityStructure: 'walk_away_ex_fundamentals',
    escrowCents: 0,
  },
};

/**
 * L8 cross-border with HSR + UK CMA + EU EUMR clearances.
 * Used by SIM-L8-BUY-SELL-MID-003.
 */
export const SAMPLE_L8_CROSS_BORDER_HSR: CanonicalDealFacts = {
  summary: 'L8 cross-border — UK industrial-tech target ($55M EBITDA, £45M revenue) acquired by US public strategic for £400M ($500M); HSR + UK CMA + EU EUMR filings; FX hedge required; W&I (UK-style) primary.',
  industry: 'industrial technology',
  naics: '334513',
  jurisdiction: 'UK-GB',
  targetRevenue: 36000_000_000,
  targetEbitda: 5500_000_000,
  purchasePrice: 50000_000_000,
  sponsorEquity: 50000_000_000,
  taxClassification: 'foreign_entity',
  electionType: 'none',
  assetClass: 'operating_co',
  foreignSeller: true,
  extra: {
    acquirerType: 'us_strategic_public',
    hsrFilingRequired: true,
    cmaFilingRequired: true,
    eumrFilingRequired: true,
    fxHedge: 'gbp_forward',
    wiArchitecture: 'uk_market_practice',
    sellerJurisdiction: 'UK-GB',
  },
};

/**
 * RAISE seed priced round — $4M on $16M pre / $20M post.
 * Used by SIM-RAISE-SEED-PRICED-001.
 */
export const SAMPLE_RAISE_SEED_PRICED: CanonicalDealFacts = {
  summary: 'Seed priced round — $4M on $16M pre / $20M post, 1x non-participating preferred, 20% option pool top-up pre-money, single lead + 3 co-investors.',
  industry: 'SaaS',
  naics: '511210',
  jurisdiction: 'US-DE',
  targetRevenue: 80_000_000,
  taxClassification: 'c_corp',
  assetClass: 'operating_co',
  extra: {
    raiseAmountCents: 400_000_000,
    preMoneyCents: 1600_000_000,
    postMoneyCents: 2000_000_000,
    instrument: 'series_seed_preferred',
    liquidationPreference: '1x_non_participating',
    optionPoolTopUpPct: 0.20,
    optionPoolPlacement: 'pre_money',
    leadInvestor: true,
    coInvestorCount: 3,
  },
};

/**
 * RAISE Series A convertible — $8M bridge, $40M cap, 20% discount.
 * Used by SIM-RAISE-A-CONVERTIBLE-001.
 */
export const SAMPLE_RAISE_A_CONVERTIBLE: CanonicalDealFacts = {
  summary: 'Series A convertible note — $8M bridge on $40M cap, 20% discount, 8% interest, 18-month maturity, qualified financing trigger $10M. Issuer is a Series Seed SaaS at $3M ARR.',
  industry: 'SaaS',
  naics: '511210',
  jurisdiction: 'US-DE',
  targetRevenue: 300_000_000,
  taxClassification: 'c_corp',
  assetClass: 'operating_co',
  extra: {
    raiseAmountCents: 800_000_000,
    instrument: 'convertible_note',
    valuationCapCents: 4000_000_000,
    discountPct: 0.20,
    interestPct: 0.08,
    maturityMonths: 18,
    qualifiedFinancingThresholdCents: 1000_000_000,
    mfn: true,
  },
};

/**
 * PMI carve-out — same parent target as SAMPLE_L6_CARVE_OUT_WITH_TSA, 60 days
 * post-close, active TSA with IT cutover planning.
 * Used by SIM-PMI-CARVE-OUT-001.
 */
export const SAMPLE_PMI_CARVE_OUT_WITH_TSA: CanonicalDealFacts = {
  summary: 'Post-close PMI on carve-out — $18M EBITDA industrial-tech div carved from public parent, 60 days post-close, 12-month TSA active (IT/payroll/procurement), IT cutover at month 9, stranded costs being recovered.',
  industry: 'industrial technology',
  naics: '334513',
  jurisdiction: 'US-DE',
  targetEbitda: 1800_000_000,
  taxClassification: 'c_corp',
  assetClass: 'operating_co',
  extra: {
    daysPostClose: 60,
    integrationType: 'carve_out',
    tsaActive: true,
    tsaRemainingMonths: 10,
    tsaScope: ['it', 'payroll', 'shared_procurement'],
    cutoverPlan: { it: 270, payroll: 180, procurement: 365 },
    strandedCostRecoveryTarget: 400_000_000,
    parentExitDeadlineDays: 365,
  },
};

/**
 * Cross-domain L6 BUY — distressed + cap structure + RE-heavy overlays.
 * Used by SIM-CROSS-DOMAIN-001.
 */
export const SAMPLE_CROSS_DOMAIN_L6_DISTRESS_CAP_RE: CanonicalDealFacts = {
  summary: 'L6 cross-domain — $14M EBITDA hospitality OpCo with RE-heavy footprint (12 owned sites, foreign seller), in active LME with uptier/double-dip exposure, cash runway 95 days. Buyer pursuing OpCo/PropCo separation + 363/RSA path, FIRPTA on PropCo side, §1031 potential, §382 NOL preservation in scope.',
  industry: 'hospitality',
  naics: '721110',
  jurisdiction: 'US-NV',
  targetRevenue: 9500_000_000,
  targetEbitda: 1400_000_000,
  purchasePrice: 7000_000_000,
  sponsorEquity: 3500_000_000,
  senorDebt: 3500_000_000,
  cashRunwayDays: 95,
  fccr: 0.92,
  securedDebtPriceCents: 62,
  taxClassification: 'c_corp',
  electionType: '336(e)',
  assetClass: 'mixed',
  foreignSeller: true,
  extra: {
    distressType: 'pre_filing',
    rsaContemplated: true,
    sec363Path: true,
    capStructure: {
      uptierExposure: true,
      doubleDipExposure: true,
      dropDownCapacity: true,
      sacredRightsClass: 'required_lender_majority',
    },
    realEstate: {
      ownedSites: 12,
      opcoPropcoSeparation: true,
      firpta: true,
      sec1031Potential: true,
      capRateRange: { low: 0.075, high: 0.095 },
    },
    nolBalanceCents: 8500_000_000,
    sec382InScope: true,
  },
};

/**
 * L4 distressed — out-of-court restructuring with cash-flow buyer (363 alternative).
 * Used by SIM-L4-BUY-SELL-DISTRESSED-002.
 */
export const SAMPLE_L4_DISTRESSED_OUT_OF_COURT: CanonicalDealFacts = {
  summary: 'L4 distressed out-of-court restructuring — $4M EBITDA industrial services co, FCCR 0.9, cash runway 110 days, ABL maturity 90 days out, lender-blessed sale to cash-flow buyer (no Chapter 11 filing).',
  industry: 'industrial services',
  naics: '561720',
  jurisdiction: 'US-DE',
  targetEbitda: 400_000_000, // $4M (depressed from $6M run-rate)
  purchasePrice: 1800_000_000, // $18M (4.5x depressed EBITDA)
  sponsorEquity: 1800_000_000,
  cashRunwayDays: 110,
  fccr: 0.90,
  securedDebtPriceCents: 72, // not as deeply distressed as 363 case
  taxClassification: 'c_corp',
  assetClass: 'operating_co',
  foreignSeller: false,
  extra: {
    distressType: 'out_of_court',
    chapter11Filed: false,
    article9Sale: false,
    secured_lender_consent: true,
    forbearance_in_place: true,
    forbearance_expiry_days: 60,
    sponsorType: 'cash_flow_buyer',
    debtRefiCommitment: true,
  },
};
