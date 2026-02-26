/**
 * Capital Stack Decision Tree — Deterministic engine for deal financing.
 *
 * 7 tiers covering $300K to $1B+ deals.
 * Tiers 1-4: fully deterministic (code).
 * Tiers 5-7: deterministic base + Claude reasoning for complex structures.
 *
 * All financial values in CENTS (integers).
 */

export interface CapitalStackInput {
  dealSize: number;            // cents — total enterprise value / purchase price
  ebitda?: number;             // cents
  sde?: number;                // cents
  buyerEquity?: number;        // cents — cash + ROBS + HELOC available
  buyerCreditScore?: number;
  isUSCitizen?: boolean;
  hasRealEstate?: boolean;     // business includes real estate
  sellerFinancingAvailable?: boolean;
  sellerStandbyWilling?: boolean;
  industry?: string;
  league?: string;
}

export interface CapitalStackLayer {
  name: string;
  amount: number;        // cents
  percentage: number;    // 0-100
  rate?: string;         // e.g. "Prime + 2.75%"
  term?: string;         // e.g. "10 years"
  notes?: string;
}

export interface CapitalStackResult {
  tier: number;
  tierName: string;
  layers: CapitalStackLayer[];
  totalDebtService: number;    // annual, cents
  dscr: number | null;         // DSCR ratio
  dscrMeetsThreshold: boolean;
  monthlyPayment: number;      // cents
  warnings: string[];
  recommendations: string[];
  sbaEligible: boolean;
  requiresComplexAnalysis: boolean;  // true for tiers 5-7
}

// ─── SBA constants (2025 rules) ─────────────────────────────

const SBA_MAX = 500_000_000;           // $5M in cents
const SBA_EQUITY_MIN = 0.10;           // 10% minimum equity injection
const SBA_DSCR_MIN = 1.25;
const SBA_MIN_CREDIT = 690;
const PRIME_RATE = 7.50;               // current prime (update periodically)
const SBA_SPREAD_SMALL = 4.75;         // spread for loans < $50K
const SBA_SPREAD_STANDARD = 2.75;      // spread for loans $50K-$350K
const SBA_SPREAD_LARGE = 2.25;         // spread for loans > $350K
const SBA_TERM_BUSINESS = 10;          // years
const SBA_TERM_REAL_ESTATE = 25;       // years

// ─── Main decision tree ─────────────────────────────────────

export function buildCapitalStack(input: CapitalStackInput): CapitalStackResult {
  const dealDollars = input.dealSize / 100;

  // Route to the correct tier
  if (dealDollars <= 5_000_000) return tier1SBA(input);
  if (dealDollars <= 15_000_000) return tier2ConventionalMezz(input);
  if (dealDollars <= 40_000_000) return tier3SeniorMezz(input);
  if (dealDollars <= 100_000_000) return tier4StructuredCredit(input);
  if (dealDollars <= 250_000_000) return tier5Unitranche(input);
  if (dealDollars <= 1_000_000_000) return tier6Syndicated(input);
  return tier7CapitalMarkets(input);
}

// ─── Tier 1: SBA 7(a) — $300K to $5M ───────────────────────

function tier1SBA(input: CapitalStackInput): CapitalStackResult {
  const warnings: string[] = [];
  const recommendations: string[] = [];
  const deal = input.dealSize;
  const earnings = input.ebitda || input.sde || 0;

  // SBA eligibility checks
  let sbaEligible = true;
  if (deal > SBA_MAX) {
    sbaEligible = false;
    warnings.push(`Deal size $${(deal/100).toLocaleString()} exceeds SBA 7(a) max of $5M`);
  }
  if (input.buyerCreditScore && input.buyerCreditScore < SBA_MIN_CREDIT) {
    warnings.push(`Credit score ${input.buyerCreditScore} is below SBA minimum of ${SBA_MIN_CREDIT}`);
  }
  if (input.isUSCitizen === false) {
    sbaEligible = false;
    warnings.push('SBA 7(a) requires 100% U.S. ownership (2025 rule)');
  }

  // Calculate layers
  const equityPct = SBA_EQUITY_MIN;
  const sellerNotePct = input.sellerStandbyWilling ? 0.05 : 0;
  const sbaPct = 1 - equityPct - sellerNotePct;

  const sbaLoan = Math.round(deal * sbaPct);
  const equity = Math.round(deal * equityPct);
  const sellerNote = Math.round(deal * sellerNotePct);

  // SBA rate
  const spread = sbaLoan > 35_000_000 ? SBA_SPREAD_LARGE : SBA_SPREAD_STANDARD;
  const rate = PRIME_RATE + spread;
  const term = input.hasRealEstate ? SBA_TERM_REAL_ESTATE : SBA_TERM_BUSINESS;

  const layers: CapitalStackLayer[] = [
    {
      name: 'SBA 7(a) Loan',
      amount: sbaLoan,
      percentage: Math.round(sbaPct * 100),
      rate: `${rate.toFixed(2)}% (Prime + ${spread}%)`,
      term: `${term} years`,
      notes: sbaLoan > 35_000_000 ? 'SBA guarantee fee: 3.75%' : 'SBA guarantee fee: 2-3%',
    },
    {
      name: 'Buyer Equity',
      amount: equity,
      percentage: Math.round(equityPct * 100),
      notes: input.buyerEquity
        ? `Available: $${(input.buyerEquity / 100).toLocaleString()}`
        : 'Cash, ROBS, or HELOC',
    },
  ];

  if (sellerNote > 0) {
    layers.push({
      name: 'Seller Note (Full Standby)',
      amount: sellerNote,
      percentage: Math.round(sellerNotePct * 100),
      rate: '0% (full standby — no payments during SBA term)',
      term: `${term} years (standby)`,
      notes: '2025 SBA rule: seller notes as equity must be on FULL STANDBY for entire loan term',
    });
  }

  // Calculate debt service (SBA loan only — seller note is on standby)
  const annualDebtService = calculateAnnualPayment(sbaLoan, rate, term);
  const monthlyPayment = Math.round(annualDebtService / 12);

  // DSCR check
  let dscr: number | null = null;
  let dscrMeets = false;
  if (earnings > 0) {
    dscr = Math.round((earnings / annualDebtService) * 100) / 100;
    dscrMeets = dscr >= SBA_DSCR_MIN;
    if (!dscrMeets) {
      warnings.push(`DSCR of ${dscr.toFixed(2)}x is below SBA minimum of ${SBA_DSCR_MIN}x — deal doesn't cash flow at this price`);
      recommendations.push('Consider: (1) lower purchase price, (2) larger equity injection, (3) negotiate seller earnout to reduce upfront price');
    }
  }

  // Equity gap check
  if (input.buyerEquity && input.buyerEquity < equity) {
    const gap = equity - input.buyerEquity;
    warnings.push(`Equity gap: need $${(equity / 100).toLocaleString()} but have $${(input.buyerEquity / 100).toLocaleString()} available`);
    recommendations.push(`Gap of $${(gap / 100).toLocaleString()}. Options: ROBS (401k rollover), HELOC, investor equity, or negotiate seller financing`);
  }

  if (input.sellerFinancingAvailable && !input.sellerStandbyWilling) {
    recommendations.push('Seller willing to finance but not full standby — negotiate: full standby lets you count it as equity injection under 2025 SBA rules');
  }

  return {
    tier: 1,
    tierName: 'SBA 7(a)',
    layers,
    totalDebtService: annualDebtService,
    dscr,
    dscrMeetsThreshold: dscrMeets,
    monthlyPayment,
    warnings,
    recommendations,
    sbaEligible,
    requiresComplexAnalysis: false,
  };
}

// ─── Tier 2: Conventional + Mezz — $5M to $15M ─────────────

function tier2ConventionalMezz(input: CapitalStackInput): CapitalStackResult {
  const deal = input.dealSize;
  const earnings = input.ebitda || input.sde || 0;
  const warnings: string[] = [];
  const recommendations: string[] = [];

  const seniorPct = 0.60;
  const mezzPct = 0.20;
  const equityPct = 0.20;

  const senior = Math.round(deal * seniorPct);
  const mezz = Math.round(deal * mezzPct);
  const equity = Math.round(deal * equityPct);

  const seniorRate = PRIME_RATE + 1.50;
  const mezzRate = 14.0;

  const layers: CapitalStackLayer[] = [
    {
      name: 'Senior Bank Debt',
      amount: senior,
      percentage: Math.round(seniorPct * 100),
      rate: `${seniorRate.toFixed(2)}% variable`,
      term: '7 years',
      notes: 'Personal guarantee required. Covenants: DSCR 1.50x, leverage ≤ 3.0x',
    },
    {
      name: 'Mezzanine Debt',
      amount: mezz,
      percentage: Math.round(mezzPct * 100),
      rate: `${mezzRate}% (cash pay + PIK)`,
      term: '5-7 years, interest-only',
      notes: 'Subordinated to senior. No personal guarantee. Minimum $3M.',
    },
    {
      name: 'Buyer Equity',
      amount: equity,
      percentage: Math.round(equityPct * 100),
      notes: 'Cash equity, rollover equity from seller, or investor equity',
    },
  ];

  const seniorDebt = calculateAnnualPayment(senior, seniorRate, 7);
  const mezzDebt = Math.round(mezz * (mezzRate / 100)); // interest-only
  const totalDebt = seniorDebt + mezzDebt;
  const monthlyPayment = Math.round(totalDebt / 12);

  let dscr: number | null = null;
  let dscrMeets = false;
  if (earnings > 0) {
    dscr = Math.round((earnings / totalDebt) * 100) / 100;
    dscrMeets = dscr >= 1.50;
    if (!dscrMeets) {
      warnings.push(`DSCR ${dscr.toFixed(2)}x is below conventional threshold of 1.50x`);
    }
  }

  if (mezz < 300_000_000) {
    warnings.push('Most mezzanine lenders have a $3M minimum — may need to increase mezz tranche or find alternative subordinated debt');
  }

  return {
    tier: 2,
    tierName: 'Conventional + Mezzanine',
    layers,
    totalDebtService: totalDebt,
    dscr,
    dscrMeetsThreshold: dscrMeets,
    monthlyPayment,
    warnings,
    recommendations,
    sbaEligible: false,
    requiresComplexAnalysis: false,
  };
}

// ─── Tier 3: Senior + Mezz + PE Equity — $15M to $40M ──────

function tier3SeniorMezz(input: CapitalStackInput): CapitalStackResult {
  const deal = input.dealSize;
  const earnings = input.ebitda || 0;
  const warnings: string[] = [];
  const recommendations: string[] = [];

  const seniorPct = 0.50;
  const mezzPct = 0.20;
  const equityPct = 0.30;

  const senior = Math.round(deal * seniorPct);
  const mezz = Math.round(deal * mezzPct);
  const equity = Math.round(deal * equityPct);

  const seniorRate = PRIME_RATE + 2.00;
  const mezzRate = 16.0;

  const layers: CapitalStackLayer[] = [
    {
      name: 'Senior Bank Debt',
      amount: senior,
      percentage: Math.round(seniorPct * 100),
      rate: `${seniorRate.toFixed(2)}% variable`,
      term: '5-7 years',
      notes: 'Covenants: DSCR 1.50x, leverage ≤ 3.5x, fixed charge coverage 1.20x',
    },
    {
      name: 'Mezzanine / Subordinated Debt',
      amount: mezz,
      percentage: Math.round(mezzPct * 100),
      rate: `${mezzRate}% all-in (cash + PIK)`,
      term: '5-7 years',
      notes: 'No personal guarantee. May include warrant coverage (1-2% of equity).',
    },
    {
      name: 'Sponsor / Investor Equity',
      amount: equity,
      percentage: Math.round(equityPct * 100),
      notes: 'PE sponsor, family office, or co-investment structure. Seller rollover common (10-20%).',
    },
  ];

  const seniorDebt = calculateAnnualPayment(senior, seniorRate, 6);
  const mezzDebt = Math.round(mezz * (mezzRate / 100));
  const totalDebt = seniorDebt + mezzDebt;

  let dscr: number | null = null;
  if (earnings > 0) {
    dscr = Math.round((earnings / totalDebt) * 100) / 100;
  }

  recommendations.push('R&W insurance recommended at this deal size — typical cost 2-3% of policy limit');
  recommendations.push('Working capital revolving line: plan for $' + ((deal * 0.05 / 100).toLocaleString()) + ' day-one revolver');

  return {
    tier: 3,
    tierName: 'Senior + Mezzanine + PE Equity',
    layers,
    totalDebtService: totalDebt,
    dscr,
    dscrMeetsThreshold: dscr ? dscr >= 1.50 : false,
    monthlyPayment: Math.round(totalDebt / 12),
    warnings,
    recommendations,
    sbaEligible: false,
    requiresComplexAnalysis: false,
  };
}

// ─── Tier 4: Structured Credit — $40M to $100M ─────────────

function tier4StructuredCredit(input: CapitalStackInput): CapitalStackResult {
  const deal = input.dealSize;
  const earnings = input.ebitda || 0;

  const seniorPct = 0.45;
  const subDebtPct = 0.15;
  const equityPct = 0.40;

  const senior = Math.round(deal * seniorPct);
  const subDebt = Math.round(deal * subDebtPct);
  const equity = Math.round(deal * equityPct);

  const layers: CapitalStackLayer[] = [
    {
      name: 'Senior Secured Term Loan',
      amount: senior,
      percentage: Math.round(seniorPct * 100),
      rate: 'SOFR + 300-450bps',
      term: '5-7 years',
      notes: 'Direct lender or BDC. Leverage: 3.0-4.0x EBITDA. Maintenance covenants.',
    },
    {
      name: 'Second Lien / Subordinated',
      amount: subDebt,
      percentage: Math.round(subDebtPct * 100),
      rate: 'SOFR + 600-800bps',
      term: '6-8 years',
      notes: 'Subordinated to senior. May be interest-only with bullet maturity.',
    },
    {
      name: 'Sponsor Equity',
      amount: equity,
      percentage: Math.round(equityPct * 100),
      notes: 'PE sponsor equity. Seller rollover 10-25% common. Management co-invest typical.',
    },
  ];

  const sofrRate = 4.30; // approximate current SOFR
  const seniorRate = sofrRate + 3.75;
  const subRate = sofrRate + 7.0;
  const seniorDebt = calculateAnnualPayment(senior, seniorRate, 6);
  const subDebtService = Math.round(subDebt * (subRate / 100));
  const totalDebt = seniorDebt + subDebtService;

  let dscr: number | null = null;
  if (earnings > 0) {
    dscr = Math.round((earnings / totalDebt) * 100) / 100;
  }

  return {
    tier: 4,
    tierName: 'Structured Credit',
    layers,
    totalDebtService: totalDebt,
    dscr,
    dscrMeetsThreshold: dscr ? dscr >= 1.30 : false,
    monthlyPayment: Math.round(totalDebt / 12),
    warnings: ['Deal size requires institutional capital — expect 60-90 day financing timeline'],
    recommendations: [
      'Engage placement agent or investment bank for debt syndication',
      'QoE report required — budget $50K-$100K',
      'R&W insurance: $150K-$300K policy cost, replaces most escrow holdbacks',
    ],
    sbaEligible: false,
    requiresComplexAnalysis: true,
  };
}

// ─── Tier 5: Unitranche — $100M to $250M ───────────────────

function tier5Unitranche(input: CapitalStackInput): CapitalStackResult {
  const deal = input.dealSize;
  const earnings = input.ebitda || 0;

  const debtPct = 0.50;
  const equityPct = 0.50;

  const debt = Math.round(deal * debtPct);
  const equity = Math.round(deal * equityPct);

  const layers: CapitalStackLayer[] = [
    {
      name: 'Unitranche (Senior + Sub Combined)',
      amount: debt,
      percentage: Math.round(debtPct * 100),
      rate: 'SOFR + 500-700bps',
      term: '6-7 years',
      notes: 'Single facility combining senior and sub debt. Direct lender or BDC. Incurrence covenants (springing). Leverage: 4.0-5.5x EBITDA.',
    },
    {
      name: 'Sponsor Equity',
      amount: equity,
      percentage: Math.round(equityPct * 100),
      notes: 'PE sponsor + co-investors. Management rollover/co-invest 5-10%. LP co-invest common at this size.',
    },
  ];

  const unitrancheRate = 4.30 + 6.0;
  const totalDebt = calculateAnnualPayment(debt, unitrancheRate, 6);

  let dscr: number | null = null;
  if (earnings > 0) {
    dscr = Math.round((earnings / totalDebt) * 100) / 100;
  }

  return {
    tier: 5,
    tierName: 'Unitranche',
    layers,
    totalDebtService: totalDebt,
    dscr,
    dscrMeetsThreshold: dscr ? dscr >= 1.20 : false,
    monthlyPayment: Math.round(totalDebt / 12),
    warnings: ['Requires investment bank advisory — Yulia can model but not execute'],
    recommendations: [
      'Unitranche simplifies debt structure — single lender, single set of covenants',
      'Direct lenders (Golub, Owl Rock, Ares) active at this size',
      'Consider bilateral vs. club deal structure',
    ],
    sbaEligible: false,
    requiresComplexAnalysis: true,
  };
}

// ─── Tier 6: Syndicated — $250M to $1B ──────────────────────

function tier6Syndicated(input: CapitalStackInput): CapitalStackResult {
  const deal = input.dealSize;
  const earnings = input.ebitda || 0;

  const seniorPct = 0.40;
  const highYieldPct = 0.15;
  const equityPct = 0.45;

  const senior = Math.round(deal * seniorPct);
  const highYield = Math.round(deal * highYieldPct);
  const equity = Math.round(deal * equityPct);

  const layers: CapitalStackLayer[] = [
    {
      name: 'Syndicated Senior Term Loan + Revolver',
      amount: senior,
      percentage: Math.round(seniorPct * 100),
      rate: 'SOFR + 350-500bps',
      term: '7 years (TL), 5 years (revolver)',
      notes: 'Syndicated among 3-5 lenders. Lead arranger takes 15-25%. Leverage: 3.5-5.0x EBITDA.',
    },
    {
      name: 'High-Yield Bond / Second Lien',
      amount: highYield,
      percentage: Math.round(highYieldPct * 100),
      rate: '8-12% fixed coupon',
      term: '7-10 years, bullet maturity',
      notes: 'Public or 144A placement. Rating agencies engaged (Moody\'s, S&P).',
    },
    {
      name: 'Sponsor Equity',
      amount: equity,
      percentage: Math.round(equityPct * 100),
      notes: 'Large PE sponsor or club deal (2-3 sponsors). Minimum fund size: $1B+.',
    },
  ];

  const seniorRate = 4.30 + 4.25;
  const bondRate = 10.0;
  const seniorDebt = calculateAnnualPayment(senior, seniorRate, 7);
  const bondDebt = Math.round(highYield * (bondRate / 100));
  const totalDebt = seniorDebt + bondDebt;

  let dscr: number | null = null;
  if (earnings > 0) {
    dscr = Math.round((earnings / totalDebt) * 100) / 100;
  }

  return {
    tier: 6,
    tierName: 'Syndicated Leveraged Finance',
    layers,
    totalDebtService: totalDebt,
    dscr,
    dscrMeetsThreshold: dscr ? dscr >= 1.15 : false,
    monthlyPayment: Math.round(totalDebt / 12),
    warnings: [
      'Requires bulge-bracket or elite middle-market investment bank',
      'Financing timeline: 90-120 days for syndication',
      'HSR filing likely required (review antitrust thresholds)',
    ],
    recommendations: [
      'Club deal with 2-3 PE sponsors reduces individual capital commitment',
      'Consider dividend recapitalization within 18-24 months post-close',
      'Stapled financing from sell-side advisor can accelerate process',
    ],
    sbaEligible: false,
    requiresComplexAnalysis: true,
  };
}

// ─── Tier 7: Capital Markets — $1B+ ────────────────────────

function tier7CapitalMarkets(input: CapitalStackInput): CapitalStackResult {
  const deal = input.dealSize;
  const earnings = input.ebitda || 0;

  const seniorPct = 0.35;
  const unsecuredPct = 0.15;
  const equityPct = 0.50;

  const senior = Math.round(deal * seniorPct);
  const unsecured = Math.round(deal * unsecuredPct);
  const equity = Math.round(deal * equityPct);

  const layers: CapitalStackLayer[] = [
    {
      name: 'Senior Secured Credit Facility (TL + Revolver)',
      amount: senior,
      percentage: Math.round(seniorPct * 100),
      rate: 'SOFR + 250-400bps',
      term: '7 years (TL-B), 5 years (revolver)',
      notes: 'Syndicated across 5-10 institutional lenders. Broadly syndicated leveraged loan (BSL) market.',
    },
    {
      name: 'Senior Unsecured Notes / High-Yield Bonds',
      amount: unsecured,
      percentage: Math.round(unsecuredPct * 100),
      rate: '7-10% fixed coupon',
      term: '8-10 years, non-call 4-5',
      notes: 'Public offering or 144A. Full SEC registration possible. Multiple credit ratings required.',
    },
    {
      name: 'Megafund Sponsor Equity',
      amount: equity,
      percentage: Math.round(equityPct * 100),
      notes: 'Top-tier PE (KKR, Blackstone, Apollo, Carlyle, etc.). Consortium common. Management rollover 2-5%.',
    },
  ];

  const seniorRate = 4.30 + 3.25;
  const bondRate = 8.5;
  const seniorDebt = calculateAnnualPayment(senior, seniorRate, 7);
  const bondDebt = Math.round(unsecured * (bondRate / 100));
  const totalDebt = seniorDebt + bondDebt;

  let dscr: number | null = null;
  if (earnings > 0) {
    dscr = Math.round((earnings / totalDebt) * 100) / 100;
  }

  return {
    tier: 7,
    tierName: 'Capital Markets',
    layers,
    totalDebtService: totalDebt,
    dscr,
    dscrMeetsThreshold: dscr ? dscr >= 1.10 : false,
    monthlyPayment: Math.round(totalDebt / 12),
    warnings: [
      'Transaction of this scale requires full investment banking coverage',
      'Regulatory review: HSR filing mandatory, potential CFIUS review for cross-border',
      'Public company dynamics may apply (SEC reporting, SOX compliance)',
    ],
    recommendations: [
      'Yulia can model the capital structure and run sensitivity analysis',
      'Engage bulge-bracket IB (Goldman, Morgan Stanley, JPMorgan) or elite boutique (Lazard, Evercore)',
      'Board-level governance documentation required',
      'Consider dual-track process: strategic sale + IPO',
    ],
    sbaEligible: false,
    requiresComplexAnalysis: true,
  };
}

// ─── Utility functions ──────────────────────────────────────

/**
 * Calculate annual loan payment (amortizing, fixed rate).
 * Returns amount in cents.
 */
function calculateAnnualPayment(principal: number, annualRate: number, years: number): number {
  const monthlyRate = annualRate / 100 / 12;
  const months = years * 12;

  if (monthlyRate === 0) return Math.round(principal / years);

  const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);

  return Math.round(monthlyPayment * 12);
}

/**
 * Format a capital stack result into human-readable text for Yulia.
 */
export function formatCapitalStack(result: CapitalStackResult): string {
  const lines: string[] = [];

  lines.push(`**Capital Structure: ${result.tierName}**\n`);

  for (const layer of result.layers) {
    lines.push(`• **${layer.name}** (${layer.percentage}%): $${(layer.amount / 100).toLocaleString()}`);
    if (layer.rate) lines.push(`  Rate: ${layer.rate}`);
    if (layer.term) lines.push(`  Term: ${layer.term}`);
    if (layer.notes) lines.push(`  ${layer.notes}`);
  }

  lines.push('');
  lines.push(`**Monthly Payment:** $${(result.monthlyPayment / 100).toLocaleString()}`);
  lines.push(`**Annual Debt Service:** $${(result.totalDebtService / 100).toLocaleString()}`);

  if (result.dscr !== null) {
    const status = result.dscrMeetsThreshold ? '✓' : '⚠';
    lines.push(`**DSCR:** ${result.dscr.toFixed(2)}x ${status}`);
  }

  if (result.warnings.length > 0) {
    lines.push('\n**Warnings:**');
    for (const w of result.warnings) lines.push(`⚠ ${w}`);
  }

  if (result.recommendations.length > 0) {
    lines.push('\n**Recommendations:**');
    for (const r of result.recommendations) lines.push(`→ ${r}`);
  }

  return lines.join('\n');
}
