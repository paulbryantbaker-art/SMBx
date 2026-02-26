/**
 * SBA Bankability Report Generator
 *
 * Deterministic SBA eligibility analysis + DSCR modeling + lender matching.
 * All financial values in CENTS.
 */

export interface SBAInput {
  deal_size: number;         // cents — purchase price
  ebitda?: number;           // cents
  sde?: number;              // cents
  buyer_credit_score?: number;
  buyer_liquid_assets?: number;   // cents
  buyer_retirement_funds?: number; // cents
  buyer_home_equity?: number;     // cents
  buyer_citizenship?: string;     // 'us_citizen', 'permanent_resident', 'other'
  buyer_existing_debt_annual?: number; // cents
  buyer_personal_income?: number; // cents
  seller_financing_available?: boolean;
  seller_standby_willing?: boolean;
  has_real_estate?: boolean;
  industry?: string;
  business_name?: string;
}

export interface SBAReport {
  type: 'sba_bankability_report';
  eligible: boolean;
  eligibility_checks: Array<{
    check: string;
    passed: boolean;
    detail: string;
  }>;
  financing_model: {
    purchase_price: number;    // cents
    sba_loan: number;          // cents
    sba_rate: string;
    sba_term: number;          // years
    buyer_equity: number;      // cents
    equity_sources: Array<{
      source: string;
      amount: number;          // cents
      priority: number;
      notes: string;
    }>;
    seller_note: number;       // cents
    seller_note_terms: string;
    total_monthly_payment: number; // cents
    annual_debt_service: number;   // cents
  };
  dscr_analysis: {
    earnings: number;          // cents
    earnings_metric: string;
    annual_debt_service: number; // cents
    dscr: number;
    meets_sba_threshold: boolean;
    global_dscr?: number;      // includes personal income/debt
    global_meets_threshold?: boolean;
  };
  equity_gap_analysis: {
    required: number;          // cents
    available: number;         // cents
    gap: number;               // cents (negative = surplus)
    sources_breakdown: Array<{
      source: string;
      amount: number;
      priority: number;
      notes: string;
    }>;
    robs_eligible: boolean;
    robs_notes: string;
  };
  risk_factors: string[];
  recommendations: string[];
  generated_at: string;
}

export function generateSBAReport(input: SBAInput): SBAReport {
  const dealDollars = input.deal_size / 100;
  const earnings = input.ebitda || input.sde || 0;
  const metric = input.ebitda ? 'EBITDA' : 'SDE';

  // ─── Eligibility checks ──────────────────────────────────
  const checks: SBAReport['eligibility_checks'] = [];

  // Deal size
  checks.push({
    check: 'Deal Size ≤ $5M',
    passed: dealDollars <= 5_000_000,
    detail: dealDollars <= 5_000_000
      ? `$${dealDollars.toLocaleString()} is within SBA 7(a) limit`
      : `$${dealDollars.toLocaleString()} exceeds SBA 7(a) max of $5M`,
  });

  // Credit score
  const creditPassed = !input.buyer_credit_score || input.buyer_credit_score >= 690;
  checks.push({
    check: 'Credit Score ≥ 690',
    passed: creditPassed,
    detail: input.buyer_credit_score
      ? `Score ${input.buyer_credit_score} ${creditPassed ? 'meets' : 'below'} SBA minimum`
      : 'Credit score not provided — most SBA lenders require 690+',
  });

  // US citizenship
  const citizenPassed = input.buyer_citizenship !== 'other';
  checks.push({
    check: 'U.S. Ownership (100%)',
    passed: citizenPassed,
    detail: citizenPassed
      ? '2025 SBA rule: 100% U.S. ownership required'
      : 'Non-U.S. citizens cannot qualify for SBA 7(a) under 2025 rules',
  });

  // DSCR check
  const equityPct = 0.10;
  const sellerNotePct = input.seller_standby_willing ? 0.05 : 0;
  const sbaPct = 1 - equityPct - sellerNotePct;
  const sbaLoan = Math.round(input.deal_size * sbaPct);
  const sbaRate = input.deal_size > 35_000_000 ? 9.75 : 10.25; // Prime + spread
  const term = input.has_real_estate ? 25 : 10;
  const monthlyPayment = calculateMonthlyPayment(sbaLoan, sbaRate, term);
  const annualDebt = monthlyPayment * 12;

  let dscr = 0;
  if (earnings > 0) {
    dscr = Math.round((earnings / annualDebt) * 100) / 100;
  }
  const dscrPassed = dscr >= 1.25;

  checks.push({
    check: 'DSCR ≥ 1.25',
    passed: dscrPassed,
    detail: earnings > 0
      ? `DSCR of ${dscr.toFixed(2)}x ${dscrPassed ? 'meets' : 'below'} SBA threshold`
      : 'Cannot calculate — earnings data needed',
  });

  const eligible = checks.every(c => c.passed);

  // ─── Equity gap analysis ─────────────────────────────────
  const equityRequired = Math.round(input.deal_size * equityPct);
  const cash = input.buyer_liquid_assets || 0;
  const retirement = input.buyer_retirement_funds || 0;
  const homeEquity = input.buyer_home_equity || 0;
  const totalAvailable = cash + retirement + homeEquity;
  const gap = equityRequired - totalAvailable;

  const sources: SBAReport['equity_gap_analysis']['sources_breakdown'] = [
    {
      source: 'Cash / Savings',
      amount: cash,
      priority: 1,
      notes: 'Primary equity source — lowest cost of capital',
    },
    {
      source: 'HELOC',
      amount: homeEquity,
      priority: 2,
      notes: `Avg 7.31% rate, up to 85% of home value minus mortgage`,
    },
    {
      source: 'ROBS (401k/IRA Rollover)',
      amount: retirement,
      priority: 3,
      notes: 'Setup ~$5K, $139/month admin. Requires C-Corp structure.',
    },
  ];

  const robsEligible = retirement > 0;

  // ─── Global DSCR (includes personal income/debt) ─────────
  let globalDscr: number | undefined;
  let globalMeets: boolean | undefined;
  if (input.buyer_personal_income) {
    const totalIncome = earnings + input.buyer_personal_income;
    const totalDebt = annualDebt + (input.buyer_existing_debt_annual || 0);
    if (totalDebt > 0) {
      globalDscr = Math.round((totalIncome / totalDebt) * 100) / 100;
      globalMeets = globalDscr >= 1.25;
    }
  }

  // ─── Risk factors & recommendations ──────────────────────
  const risks: string[] = [];
  const recs: string[] = [];

  if (!dscrPassed && earnings > 0) {
    risks.push(`DSCR of ${dscr.toFixed(2)}x is below SBA threshold — deal doesn't cash flow at this price`);
    recs.push('Negotiate a lower purchase price or larger seller note to improve DSCR');
  }

  if (gap > 0) {
    risks.push(`Equity gap of $${(gap / 100).toLocaleString()} — need additional injection sources`);
    if (robsEligible) recs.push(`ROBS eligible: $${(retirement / 100).toLocaleString()} in retirement funds available for rollover`);
    if (homeEquity > 0) recs.push(`HELOC: $${(homeEquity / 100).toLocaleString()} available at ~7.31% rate`);
  }

  if (input.seller_financing_available && !input.seller_standby_willing) {
    risks.push('Seller financing available but seller unwilling to go on full standby');
    recs.push('2025 SBA rule: seller notes used as equity injection must be on FULL STANDBY (no payments) for entire loan term. Negotiate with seller — businesses offering seller financing sell for 20-30% more.');
  }

  if (!input.buyer_credit_score) {
    recs.push('Get credit score ASAP — SBA minimum is 690, most preferred lenders want 700+');
  }

  const sellerNote = Math.round(input.deal_size * sellerNotePct);
  const buyerEquity = equityRequired;

  return {
    type: 'sba_bankability_report',
    eligible,
    eligibility_checks: checks,
    financing_model: {
      purchase_price: input.deal_size,
      sba_loan: sbaLoan,
      sba_rate: `${sbaRate}% (Prime ${7.50}% + ${sbaRate - 7.50}% spread)`,
      sba_term: term,
      buyer_equity: buyerEquity,
      equity_sources: sources.filter(s => s.amount > 0),
      seller_note: sellerNote,
      seller_note_terms: sellerNote > 0
        ? 'Full standby for entire loan term — no principal or interest payments (2025 SBA rule)'
        : 'No seller note',
      total_monthly_payment: monthlyPayment,
      annual_debt_service: annualDebt,
    },
    dscr_analysis: {
      earnings,
      earnings_metric: metric,
      annual_debt_service: annualDebt,
      dscr,
      meets_sba_threshold: dscrPassed,
      global_dscr: globalDscr,
      global_meets_threshold: globalMeets,
    },
    equity_gap_analysis: {
      required: equityRequired,
      available: totalAvailable,
      gap,
      sources_breakdown: sources,
      robs_eligible: robsEligible,
      robs_notes: robsEligible
        ? `$${(retirement / 100).toLocaleString()} available via ROBS. Setup cost ~$5K, ongoing $139/month. Requires C-Corp entity.`
        : 'No retirement funds identified for ROBS eligibility.',
    },
    risk_factors: risks,
    recommendations: recs,
    generated_at: new Date().toISOString(),
  };
}

function calculateMonthlyPayment(principal: number, annualRate: number, years: number): number {
  const monthlyRate = annualRate / 100 / 12;
  const months = years * 12;
  if (monthlyRate === 0) return Math.round(principal / months);
  return Math.round(
    principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1)
  );
}
