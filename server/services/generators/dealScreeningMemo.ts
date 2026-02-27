/**
 * Deal Screening Memo Generator
 *
 * Go/no-go assessment of a potential acquisition:
 * financial health, valuation sanity, strategic fit, and risk factors.
 *
 * Pattern: deterministic scoring + AI narrative (same as valuationReport).
 * All financial values in CENTS.
 */
import { callClaude } from '../aiService.js';
import { getLeagueMultipleRange } from '../leagueClassifier.js';

export interface DealScreeningInput {
  business_name?: string;
  industry?: string;
  location?: string;
  revenue: number;              // cents
  sde?: number;                 // cents
  ebitda?: number;              // cents
  league: string;
  asking_price?: number;        // cents
  owner_salary?: number;        // cents
  growth_rate?: number;         // percentage
  gross_margin?: number;        // percentage
  employee_count?: number;
  years_in_business?: number;
  recurring_revenue_pct?: number;
  customer_concentration?: number; // top customer % of revenue
  owner_dependency?: number;    // 1-10
  financials?: Record<string, any>;
}

export interface DealScreeningMemo {
  type: 'deal_screening_memo';
  summary: {
    business_name: string;
    industry: string;
    location: string;
    league: string;
    overall_score: number;       // 0-100
    verdict: 'PURSUE' | 'INVESTIGATE' | 'PASS';
    verdict_rationale: string;
  };
  financial_health: {
    score: number;               // 0-100
    revenue_display: string;
    earnings_metric: string;
    earnings_display: string;
    margins: string;
    growth: string;
    flags: string[];
  };
  valuation_sanity: {
    score: number;               // 0-100
    implied_multiple: number | null;
    league_range: { min: number; max: number | null };
    assessment: string;
    flags: string[];
  };
  strategic_fit: {
    score: number;               // 0-100
    factors: Array<{ factor: string; score: number; note: string }>;
  };
  risk_factors: Array<{
    category: string;
    severity: 'high' | 'medium' | 'low';
    description: string;
  }>;
  key_questions: string[];
  narrative: string;             // AI-generated
  generated_at: string;
}

export async function generateDealScreeningMemo(input: DealScreeningInput): Promise<DealScreeningMemo> {
  const range = getLeagueMultipleRange(input.league);
  const earnings = input.ebitda || input.sde || 0;
  const earningsDollars = earnings / 100;
  const revenueDollars = input.revenue / 100;
  const askingDollars = input.asking_price ? input.asking_price / 100 : null;

  // ─── 1. Financial Health Score (0-100) ────────────────────
  let financialScore = 50; // baseline
  const financialFlags: string[] = [];

  // Revenue signal
  if (revenueDollars > 0) {
    financialScore += 10;
  } else {
    financialScore -= 20;
    financialFlags.push('No revenue data provided');
  }

  // Earnings signal
  if (earningsDollars > 0) {
    financialScore += 15;
  } else {
    financialScore -= 15;
    financialFlags.push('No earnings data (SDE/EBITDA) available');
  }

  // Growth
  if (input.growth_rate !== undefined && input.growth_rate !== null) {
    if (input.growth_rate > 10) {
      financialScore += 10;
    } else if (input.growth_rate > 0) {
      financialScore += 5;
    } else if (input.growth_rate < -5) {
      financialScore -= 15;
      financialFlags.push(`Revenue declining at ${input.growth_rate}%`);
    } else if (input.growth_rate < 0) {
      financialScore -= 5;
      financialFlags.push(`Slight revenue decline (${input.growth_rate}%)`);
    }
  }

  // Margins
  if (input.gross_margin !== undefined && input.gross_margin !== null) {
    if (input.gross_margin > 60) financialScore += 10;
    else if (input.gross_margin > 40) financialScore += 5;
    else if (input.gross_margin < 20) {
      financialScore -= 10;
      financialFlags.push(`Thin gross margins (${input.gross_margin}%)`);
    }
  }

  financialScore = Math.max(0, Math.min(100, financialScore));

  // ─── 2. Valuation Sanity Score (0-100) ────────────────────
  let valuationScore = 60; // baseline
  const valuationFlags: string[] = [];
  let impliedMultiple: number | null = null;

  if (askingDollars && earningsDollars > 0) {
    impliedMultiple = Math.round((askingDollars / earningsDollars) * 100) / 100;
    const rangeMax = range.max || range.min * 1.5;

    if (impliedMultiple >= range.min && impliedMultiple <= rangeMax) {
      valuationScore = 85;
    } else if (impliedMultiple < range.min) {
      valuationScore = 90; // below market = good for buyer
    } else if (impliedMultiple <= rangeMax * 1.15) {
      valuationScore = 60;
      valuationFlags.push(`Asking multiple (${impliedMultiple}x) slightly above league range`);
    } else if (impliedMultiple <= rangeMax * 1.3) {
      valuationScore = 40;
      valuationFlags.push(`Asking multiple (${impliedMultiple}x) above league range — negotiate down`);
    } else {
      valuationScore = 20;
      valuationFlags.push(`Asking multiple (${impliedMultiple}x) significantly above market — likely overpriced`);
    }
  } else if (!askingDollars) {
    valuationScore = 50;
    valuationFlags.push('No asking price provided — cannot assess valuation');
  } else {
    valuationScore = 30;
    valuationFlags.push('No earnings data to compute implied multiple');
  }

  let valuationAssessment: string;
  if (valuationScore >= 80) valuationAssessment = 'Asking price is at or below market — attractive entry point.';
  else if (valuationScore >= 60) valuationAssessment = 'Asking price is reasonable, within negotiable range.';
  else if (valuationScore >= 40) valuationAssessment = 'Asking price is aggressive — plan to negotiate.';
  else valuationAssessment = 'Asking price appears disconnected from fundamentals — significant gap.';

  // ─── 3. Strategic Fit Score (0-100) ───────────────────────
  const strategicFactors: DealScreeningMemo['strategic_fit']['factors'] = [];

  // Years in business
  if (input.years_in_business) {
    if (input.years_in_business >= 10) {
      strategicFactors.push({ factor: 'Business Maturity', score: 90, note: `${input.years_in_business} years — well-established` });
    } else if (input.years_in_business >= 5) {
      strategicFactors.push({ factor: 'Business Maturity', score: 70, note: `${input.years_in_business} years — established` });
    } else {
      strategicFactors.push({ factor: 'Business Maturity', score: 40, note: `${input.years_in_business} years — relatively young` });
    }
  }

  // Employee count (team = transferability)
  if (input.employee_count) {
    if (input.employee_count >= 10) {
      strategicFactors.push({ factor: 'Team Depth', score: 80, note: `${input.employee_count} employees — operational depth` });
    } else if (input.employee_count >= 3) {
      strategicFactors.push({ factor: 'Team Depth', score: 60, note: `${input.employee_count} employees — small team` });
    } else {
      strategicFactors.push({ factor: 'Team Depth', score: 30, note: `${input.employee_count} employees — very lean, high owner dependency risk` });
    }
  }

  // Owner dependency
  if (input.owner_dependency !== undefined && input.owner_dependency !== null) {
    if (input.owner_dependency <= 3) {
      strategicFactors.push({ factor: 'Owner Dependency', score: 90, note: 'Low dependency — smooth transition likely' });
    } else if (input.owner_dependency <= 6) {
      strategicFactors.push({ factor: 'Owner Dependency', score: 60, note: 'Moderate dependency — transition plan needed' });
    } else {
      strategicFactors.push({ factor: 'Owner Dependency', score: 25, note: 'High dependency — significant key-person risk' });
    }
  }

  // Recurring revenue
  if (input.recurring_revenue_pct !== undefined && input.recurring_revenue_pct !== null) {
    if (input.recurring_revenue_pct >= 70) {
      strategicFactors.push({ factor: 'Revenue Quality', score: 95, note: `${input.recurring_revenue_pct}% recurring — excellent predictability` });
    } else if (input.recurring_revenue_pct >= 40) {
      strategicFactors.push({ factor: 'Revenue Quality', score: 70, note: `${input.recurring_revenue_pct}% recurring — good base` });
    } else {
      strategicFactors.push({ factor: 'Revenue Quality', score: 40, note: `${input.recurring_revenue_pct}% recurring — mostly transactional` });
    }
  }

  const strategicScore = strategicFactors.length > 0
    ? Math.round(strategicFactors.reduce((sum, f) => sum + f.score, 0) / strategicFactors.length)
    : 50;

  // ─── 4. Risk Factors ──────────────────────────────────────
  const risks: DealScreeningMemo['risk_factors'] = [];

  if (input.customer_concentration && input.customer_concentration > 30) {
    risks.push({
      category: 'Customer Concentration',
      severity: input.customer_concentration > 50 ? 'high' : 'medium',
      description: `Top customer represents ${input.customer_concentration}% of revenue — loss would significantly impact earnings.`,
    });
  }

  if (input.owner_dependency && input.owner_dependency >= 7) {
    risks.push({
      category: 'Key Person',
      severity: 'high',
      description: `Owner dependency rated ${input.owner_dependency}/10 — business value is heavily tied to the current owner.`,
    });
  }

  if (input.growth_rate !== undefined && input.growth_rate !== null && input.growth_rate < -5) {
    risks.push({
      category: 'Revenue Decline',
      severity: input.growth_rate < -15 ? 'high' : 'medium',
      description: `Revenue declining at ${input.growth_rate}% — investigate structural causes vs. cyclical.`,
    });
  }

  if (input.gross_margin !== undefined && input.gross_margin !== null && input.gross_margin < 25) {
    risks.push({
      category: 'Thin Margins',
      severity: input.gross_margin < 15 ? 'high' : 'medium',
      description: `Gross margin at ${input.gross_margin}% leaves little room for debt service or operational issues.`,
    });
  }

  if (!input.sde && !input.ebitda) {
    risks.push({
      category: 'Data Quality',
      severity: 'medium',
      description: 'No verified earnings data — cannot confirm actual cash flow to service acquisition debt.',
    });
  }

  // ─── 5. Key Questions ─────────────────────────────────────
  const questions: string[] = [];

  if (!input.sde && !input.ebitda) {
    questions.push('What are the actual SDE/EBITDA figures for the last 3 years?');
  }
  if (!input.growth_rate) {
    questions.push('What is the revenue growth trend over the past 3 years?');
  }
  if (input.owner_dependency && input.owner_dependency >= 6) {
    questions.push('What does a realistic transition plan look like? How long would the seller stay on?');
  }
  if (input.customer_concentration && input.customer_concentration > 25) {
    questions.push('Are customer contracts in place? What is the retention rate?');
  }
  questions.push('Are there any pending legal, regulatory, or environmental issues?');
  questions.push('What is the condition and age of key equipment/assets?');
  if (earnings > 0 && askingDollars) {
    questions.push('Is the seller open to seller financing or earnout structure?');
  }

  // ─── 6. Overall Score & Verdict ───────────────────────────
  const overallScore = Math.round(
    financialScore * 0.35 +
    valuationScore * 0.30 +
    strategicScore * 0.25 +
    (risks.filter(r => r.severity === 'high').length === 0 ? 70 : 30) * 0.10,
  );

  let verdict: DealScreeningMemo['summary']['verdict'];
  let verdictRationale: string;

  if (overallScore >= 70) {
    verdict = 'PURSUE';
    verdictRationale = 'This deal scores well across financial health, valuation, and strategic fit. Proceed to detailed due diligence.';
  } else if (overallScore >= 50) {
    verdict = 'INVESTIGATE';
    verdictRationale = 'This deal has potential but needs more information before committing. Address the identified questions and risks first.';
  } else {
    verdict = 'PASS';
    verdictRationale = 'Significant concerns across multiple dimensions. The risk/reward profile does not justify further investment of time and capital at this price point.';
  }

  // ─── 7. AI Narrative ──────────────────────────────────────
  const narrativePrompt = `Write a 2-3 paragraph deal screening memo summary for a potential acquisition:

Business: ${input.business_name || input.industry || 'Undisclosed'} in ${input.location || 'undisclosed location'}
Industry: ${input.industry || 'Not specified'}
Revenue: $${revenueDollars.toLocaleString()}
${earningsDollars > 0 ? `${range.metric}: $${earningsDollars.toLocaleString()}` : 'Earnings: Not provided'}
${askingDollars ? `Asking Price: $${askingDollars.toLocaleString()}` : ''}
${impliedMultiple ? `Implied Multiple: ${impliedMultiple}x (league range: ${range.min}x–${range.max || 'N/A'}x)` : ''}
League: ${input.league}

Overall Score: ${overallScore}/100 — Verdict: ${verdict}
Financial Health: ${financialScore}/100
Valuation Sanity: ${valuationScore}/100
Strategic Fit: ${strategicScore}/100
${risks.length > 0 ? `Key Risks: ${risks.map(r => `${r.category} (${r.severity})`).join(', ')}` : 'No major risks identified'}

Write as Yulia, the M&A advisor. Be direct and specific. Focus on whether the buyer should invest more time in this deal and what they need to watch out for.`;

  const narrative = await callClaude(
    'You are Yulia, an M&A advisor writing a deal screening memo. Be concise, data-driven, and direct. Address the buyer.',
    [{ role: 'user', content: narrativePrompt }],
  );

  return {
    type: 'deal_screening_memo',
    summary: {
      business_name: input.business_name || 'Target Business',
      industry: input.industry || 'Not specified',
      location: input.location || 'Not specified',
      league: input.league,
      overall_score: overallScore,
      verdict,
      verdict_rationale: verdictRationale,
    },
    financial_health: {
      score: financialScore,
      revenue_display: `$${revenueDollars.toLocaleString()}`,
      earnings_metric: range.metric,
      earnings_display: earningsDollars > 0 ? `$${earningsDollars.toLocaleString()}` : 'Not provided',
      margins: input.gross_margin ? `${input.gross_margin}% gross` : 'Not provided',
      growth: input.growth_rate !== undefined && input.growth_rate !== null ? `${input.growth_rate}%` : 'Not provided',
      flags: financialFlags,
    },
    valuation_sanity: {
      score: valuationScore,
      implied_multiple: impliedMultiple,
      league_range: { min: range.min, max: range.max },
      assessment: valuationAssessment,
      flags: valuationFlags,
    },
    strategic_fit: {
      score: strategicScore,
      factors: strategicFactors,
    },
    risk_factors: risks,
    key_questions: questions,
    narrative,
    generated_at: new Date().toISOString(),
  };
}
