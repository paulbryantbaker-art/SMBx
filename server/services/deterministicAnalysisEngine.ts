type Tone = 'pursue' | 'watch' | 'pass' | 'neutral';
type Severity = 'low' | 'medium' | 'high';
type Priority = 'low' | 'medium' | 'high';

export interface DeterministicDealRow {
  id: number;
  business_name?: string | null;
  journey_type?: string | null;
  current_gate?: string | null;
  league?: string | null;
  industry?: string | null;
  location?: string | null;
  revenue?: number | null;
  sde?: number | null;
  ebitda?: number | null;
  asking_price?: number | null;
  financials?: unknown;
  status?: string | null;
}

export interface AnalysisMetric {
  key: string;
  label: string;
  value: number | string | null;
  displayValue: string;
  sub?: string;
  tone?: Tone;
}

export interface AnalysisEvidenceRef {
  label: string;
  type: 'deal_fact' | 'financial_fact' | 'market_signal' | 'methodology' | 'user_assumption';
  source: string;
  value?: string;
  detail?: string;
  confidence?: 'high' | 'medium' | 'low';
}

export interface AnalysisOutput {
  schemaVersion: 'analysis-runtime-v1';
  analysisType: string;
  title: string;
  summary: string;
  verdict: {
    label: string;
    tone: Tone;
    score?: number;
    rationale: string;
  };
  methodologyRefs: string[];
  evidenceRefs: AnalysisEvidenceRef[];
  inputs: Array<{ key: string; label: string; value: unknown; displayValue: string; source: string }>;
  assumptions: Array<{ key: string; label: string; value: unknown; displayValue: string }>;
  metrics: AnalysisMetric[];
  charts: Array<{ type: 'bar' | 'range' | 'matrix'; title: string; data: Array<Record<string, unknown>> }>;
  tables: Array<{ title: string; columns: string[]; rows: Array<Array<string | number | null>> }>;
  risks: Array<{ label: string; detail: string; severity: Severity; trigger?: string }>;
  missingData: Array<{ label: string; why: string; priority: Priority }>;
  professionalTriggers: Array<{ role: string; trigger: string; why: string }>;
  nextActions: Array<{
    label: string;
    actionType: string;
    prompt: string;
    surfaceActionId?: string;
    analysisType?: string;
    fileScope?: 'all' | 'data-room' | 'shared';
    targetDealId?: number;
    targetDealTitle?: string;
  }>;
  yuliaRead: string;
  calculations: Record<string, unknown>;
}

interface DealFacts {
  deal: DeterministicDealRow;
  financials: Record<string, unknown>;
  name: string;
  league: string;
  metric: 'SDE' | 'EBITDA';
  revenueCents: number | null;
  sdeCents: number | null;
  ebitdaCents: number | null;
  earningsCents: number | null;
  askingCents: number | null;
  impliedMultiple: number | null;
  margin: number | null;
  recurringRevenuePct: number | null;
  customerConcentrationPct: number | null;
  addBacksCents: number;
  adjustedEarningsCents: number | null;
  dealSizeCents: number | null;
  multipleRange: { low: number; high: number | null };
  fitScore: number;
  fitTone: Tone;
}

const LEAGUE_MULTIPLES: Record<string, { low: number; high: number | null }> = {
  L1: { low: 2.0, high: 3.5 },
  L2: { low: 3.0, high: 5.0 },
  L3: { low: 4.0, high: 6.0 },
  L4: { low: 6.0, high: 8.0 },
  L5: { low: 8.0, high: 12.0 },
  L6: { low: 10.0, high: null },
};

const ANALYSIS_LABELS: Record<string, string> = {
  deal_scorecard: 'Deal scorecard',
  buyer_fit: 'Buyer fit',
  comps: 'Comparable deal read',
  valuation: 'Valuation model',
  qoe: 'Quality of earnings',
  lbo: 'LBO model',
  dcf: 'DCF model',
  sensitivity: 'Sensitivity model',
  recast: 'Recast analysis',
  market_intelligence: 'Market intelligence',
  sba: 'SBA bankability',
  capital_structure: 'Capital structure',
  covenant: 'Covenant model',
  red_flags: 'Red flags',
  working_capital: 'Working capital',
  tax_impact: 'Tax impact',
  purchase_price_allocation: 'Purchase-price allocation',
  tax_structure: 'Tax structure',
  legal_structure: 'Legal structure',
  tax_legal_structure: 'Tax and legal structure',
  term_sheet: 'Term sheet structure',
  earnout: 'Earnout model',
  cap_table: 'Cap table',
  pmi_value_creation: 'PMI value creation',
  deal_comparison: 'Deal comparison',
  auto: 'Deal analysis',
};

export function buildDeterministicAnalysis(params: {
  analysisType: string;
  deal: DeterministicDealRow;
  menuItemSlug?: string | null;
  assumptionOverrides?: Record<string, unknown>;
}): AnalysisOutput {
  const analysisType = params.analysisType === 'auto' ? inferAutoAnalysisType(params.deal) : params.analysisType;
  const facts = buildDealFacts(params.deal, params.assumptionOverrides);
  const common = commonAnalysisParts(facts, analysisType, params.menuItemSlug);

    switch (analysisType) {
      case 'valuation':
      case 'comps':
        return buildValuationAnalysis(facts, analysisType, common);
      case 'qoe':
        return buildQoeAnalysis(facts, common);
      case 'lbo':
        return buildLboAnalysis(facts, common);
      case 'dcf':
        return buildDcfAnalysis(facts, common);
      case 'sensitivity':
        return buildSensitivityAnalysis(facts, common);
      case 'recast':
        return buildRecastAnalysis(facts, common);
      case 'capital_structure':
      case 'sba':
        return buildCapitalStructureAnalysis(facts, analysisType, common);
      case 'covenant':
        return buildCovenantAnalysis(facts, common);
      case 'working_capital':
        return buildWorkingCapitalAnalysis(facts, common);
      case 'market_intelligence':
        return buildMarketIntelligenceAnalysis(facts, common);
      case 'tax_impact':
      case 'purchase_price_allocation':
        return buildTaxImpactAnalysis(facts, analysisType, common);
      case 'tax_structure':
        return buildTaxStructureAnalysis(facts, common);
    case 'tax_legal_structure':
      return buildTaxLegalStructureAnalysis(facts, common);
    case 'legal_structure':
    case 'term_sheet':
      return buildLegalStructureAnalysis(facts, analysisType, common);
    case 'red_flags':
      return buildRedFlagsAnalysis(facts, common);
      case 'pmi_value_creation':
        return buildPmiAnalysis(facts, common);
      case 'earnout':
        return buildEarnoutAnalysis(facts, common);
      case 'cap_table':
        return buildCapTableAnalysis(facts, common);
      case 'buyer_fit':
    case 'deal_scorecard':
    default:
      return buildScorecardAnalysis(facts, analysisType, common);
  }
}

export function buildDealComparisonAnalysis(deals: DeterministicDealRow[], title = 'Deal comparison'): AnalysisOutput {
  const facts = deals.map((deal) => buildDealFacts(deal));
  const ranked = [...facts].sort((a, b) => b.fitScore - a.fitScore);
  const top = ranked[0];

  return {
    schemaVersion: 'analysis-runtime-v1',
    analysisType: 'deal_comparison',
    title,
    summary: top
      ? `${top.name} currently screens strongest on fit, valuation sanity, and available facts.`
      : 'No comparable deals were available.',
    verdict: {
      label: top ? `${top.name} leads` : 'Not enough deals',
      tone: top?.fitTone || 'neutral',
      score: top?.fitScore,
      rationale: top
        ? `${top.name} has the highest deterministic fit score in this set. Use the comparison as a triage view, then open the deal with the best risk-adjusted path.`
        : 'Yulia needs at least two valid deal rows to compare.',
    },
    methodologyRefs: [
      'METHODOLOGY_V17 §2 League-aware scoring',
      'METHODOLOGY_V17 §8 Evidence before recommendation',
      'METHODOLOGY_V17 §11 Interactive canvas',
    ],
    evidenceRefs: facts.flatMap(f => commonEvidenceRefs(f, 'deal_comparison')).slice(0, 14),
    inputs: facts.flatMap(f => commonInputs(f)).slice(0, 18),
    assumptions: [
      { key: 'ranking_basis', label: 'Ranking basis', value: 'fit_score', displayValue: 'Fit score, value, margin, completeness, and concentration risk' },
    ],
    metrics: ranked.map(f => ({
      key: `fit_${f.deal.id}`,
      label: f.name,
      value: f.fitScore,
      displayValue: `${f.fitScore}`,
      sub: `${f.metric} ${fmtMoney(f.earningsCents)} · ${fmtMultiple(f.impliedMultiple)} implied`,
      tone: f.fitTone,
    })),
    charts: [{
      type: 'bar',
      title: 'Fit ranking',
      data: ranked.map(f => ({ label: f.name, value: f.fitScore, displayValue: `${f.fitScore}`, tone: f.fitTone })),
    }],
    tables: [{
      title: 'Side-by-side read',
      columns: ['Deal', 'League', 'Revenue', 'Earnings', 'Asking', 'Multiple', 'Fit'],
      rows: facts.map(f => [
        f.name,
        f.league,
        fmtMoney(f.revenueCents),
        fmtMoney(f.earningsCents),
        fmtMoney(f.askingCents),
        fmtMultiple(f.impliedMultiple),
        f.fitScore,
      ]),
    }],
    risks: facts.flatMap(f => commonRisks(f)).slice(0, 6),
    missingData: facts.flatMap(f => commonMissingData(f)).slice(0, 6),
    professionalTriggers: facts.flatMap(f => commonProfessionalTriggers(f, 'deal_comparison')).slice(0, 6),
    nextActions: [
      {
        label: 'Open lead deal',
        actionType: 'open_deal',
        surfaceActionId: 'open_deal',
        targetDealId: top?.deal.id,
        targetDealTitle: top?.name,
        prompt: `Open ${top?.name || 'the highest-ranked deal'} and show the evidence behind the ranking.`,
      },
      {
        label: 'Run diligence comparison',
        actionType: 'run_analysis',
        surfaceActionId: 'run_red_flags_analysis',
        analysisType: 'red_flags',
        targetDealId: top?.deal.id,
        targetDealTitle: top?.name,
        prompt: 'Compare diligence gaps, legal issues, tax structure, buyer fit, and financing feasibility for these deals.',
      },
    ],
    yuliaRead: top
      ? `${top.name} is the first deal I would inspect because it has the strongest current fit score. I am not making the decision for you; the canvas is showing where the evidence is strongest and where the remaining diligence gaps sit.`
      : 'I need at least two deals with usable financial facts before this comparison becomes meaningful.',
    calculations: {
      rankedDealIds: ranked.map(f => f.deal.id),
      fitScores: Object.fromEntries(facts.map(f => [String(f.deal.id), f.fitScore])),
    },
  };
}

function buildScorecardAnalysis(facts: DealFacts, analysisType: string, common: Partial<AnalysisOutput>): AnalysisOutput {
  return finalizeAnalysis(facts, analysisType, common, {
    summary: `${facts.name} screens at ${facts.fitScore}/100 on the deterministic fit model.`,
    metrics: [
      metric('fit_score', 'Fit score', facts.fitScore, `${facts.fitScore}`, fitScoreSub(facts), facts.fitTone),
      metric('revenue', 'Revenue', facts.revenueCents, fmtMoney(facts.revenueCents), 'TTM or latest period'),
      metric('earnings', facts.metric, facts.earningsCents, fmtMoney(facts.earningsCents), 'Primary league metric'),
      metric('multiple', 'Implied multiple', facts.impliedMultiple, fmtMultiple(facts.impliedMultiple), `${facts.league} range ${fmtRange(facts.multipleRange)}`, multipleTone(facts)),
      metric('margin', `${facts.metric} margin`, facts.margin, fmtPct(facts.margin), 'Earnings divided by revenue', marginTone(facts.margin)),
    ],
    charts: [{
      type: 'bar',
      title: 'Fit drivers',
      data: [
        { label: 'Financial quality', value: driverFinancialQuality(facts), displayValue: `${driverFinancialQuality(facts)}/25` },
        { label: 'Value sanity', value: driverValueSanity(facts), displayValue: `${driverValueSanity(facts)}/25` },
        { label: 'Evidence depth', value: driverEvidence(facts), displayValue: `${driverEvidence(facts)}/25` },
        { label: 'Risk pressure', value: driverRiskPressure(facts), displayValue: `${driverRiskPressure(facts)}/25` },
      ],
    }],
    tables: [{
      title: 'Scorecard basis',
      columns: ['Factor', 'Read', 'Why it matters'],
      rows: [
        ['League', facts.league, 'Sets expected metric, buyer sophistication, diligence depth, and multiple range.'],
        ['Value', fmtMultiple(facts.impliedMultiple), `Compared with ${facts.league} range ${fmtRange(facts.multipleRange)}.`],
        ['Evidence', evidenceRead(facts), 'Yulia should not recommend action beyond the facts currently in the workspace.'],
      ],
    }],
  });
}

function buildValuationAnalysis(facts: DealFacts, analysisType: string, common: Partial<AnalysisOutput>): AnalysisOutput {
  const low = facts.earningsCents ? facts.earningsCents * facts.multipleRange.low : null;
  const highMultiple = facts.multipleRange.high ?? facts.multipleRange.low + 4;
  const high = facts.earningsCents ? facts.earningsCents * highMultiple : null;
  const midpoint = facts.earningsCents ? facts.earningsCents * ((facts.multipleRange.low + highMultiple) / 2) : null;
  const askingVariance = facts.askingCents && midpoint ? (facts.askingCents - midpoint) / midpoint : null;

  return finalizeAnalysis(facts, analysisType, common, {
    summary: `${facts.name} valuation range is anchored to ${facts.league} ${facts.metric} multiples and current normalized earnings.`,
    metrics: [
      metric('low_case', 'Low case', low, fmtMoney(low), `${facts.multipleRange.low.toFixed(1)}x ${facts.metric}`),
      metric('base_case', 'Base case', midpoint, fmtMoney(midpoint), 'Midpoint of league range', 'neutral'),
      metric('high_case', 'High case', high, fmtMoney(high), `${highMultiple.toFixed(1)}x ${facts.metric}`),
      metric('asking_variance', 'Asking vs base', askingVariance, fmtPct(askingVariance), facts.askingCents ? 'Current ask against midpoint' : 'No asking price yet', varianceTone(askingVariance)),
    ],
    charts: [{
      type: 'range',
      title: 'Valuation range',
      data: [
        { label: 'Low', value: centsToMillions(low), displayValue: fmtMoney(low) },
        { label: 'Base', value: centsToMillions(midpoint), displayValue: fmtMoney(midpoint) },
        { label: 'High', value: centsToMillions(high), displayValue: fmtMoney(high) },
        ...(facts.askingCents ? [{ label: 'Ask', value: centsToMillions(facts.askingCents), displayValue: fmtMoney(facts.askingCents), tone: 'watch' }] : []),
      ],
    }],
    tables: [{
      title: 'Valuation bridge',
      columns: ['Case', 'Multiple', 'Metric', 'Value'],
      rows: [
        ['Low', `${facts.multipleRange.low.toFixed(1)}x`, facts.metric, fmtMoney(low)],
        ['Base', `${((facts.multipleRange.low + highMultiple) / 2).toFixed(1)}x`, facts.metric, fmtMoney(midpoint)],
        ['High', `${highMultiple.toFixed(1)}x`, facts.metric, fmtMoney(high)],
      ],
    }],
    calculations: { low, midpoint, high, askingVariance },
    });
  }

function buildQoeAnalysis(facts: DealFacts, common: Partial<AnalysisOutput>): AnalysisOutput {
  const reported = facts.earningsCents;
  const adjusted = facts.adjustedEarningsCents;
  const addBackLift = reported && adjusted ? (adjusted - reported) / reported : null;
  const concentration = facts.customerConcentrationPct;
  const wcPeg = centsFrom(numberFromUnknown(facts.financials.working_capital_peg));
  const evidence = evidenceScore(facts);

  return finalizeAnalysis(facts, 'qoe', common, {
    summary: `${facts.name} quality of earnings is being read across add-back support, customer concentration, working capital, and evidence depth.`,
    metrics: [
      metric('reported', `Reported ${facts.metric}`, reported, fmtMoney(reported), 'Starting financial base'),
      metric('adjusted', `Normalized ${facts.metric}`, adjusted, fmtMoney(adjusted), 'After supported add-backs'),
      metric('addback_lift', 'Add-back lift', addBackLift, fmtPct(addBackLift), 'Higher lift needs stronger backup', addBackLift != null && addBackLift > 0.25 ? 'watch' : 'neutral'),
      metric('evidence_depth', 'Evidence depth', evidence, `${evidence}%`, 'Support visible in current workspace', signalTone(evidence)),
      metric('customer_concentration', 'Top customer', concentration, fmtPct(concentration), 'Quality and durability pressure', concentration != null && concentration >= 0.3 ? 'pass' : 'neutral'),
    ],
    charts: [{
      type: 'bar',
      title: 'QoE pressure',
      data: [
        { label: 'Reported', value: centsToMillions(reported), displayValue: fmtMoney(reported) },
        { label: 'Add-backs', value: centsToMillions(facts.addBacksCents), displayValue: fmtMoney(facts.addBacksCents), tone: 'watch' },
        { label: 'Normalized', value: centsToMillions(adjusted), displayValue: fmtMoney(adjusted), tone: facts.fitTone },
      ],
    }],
    tables: [{
      title: 'QoE checklist',
      columns: ['Area', 'Current read', 'Evidence Yulia wants'],
      rows: [
        ['Add-backs', addBackLift == null ? 'Not enough facts' : fmtPct(addBackLift), 'Invoices, payroll detail, owner comp support, and one-time-expense backup.'],
        ['Working capital', fmtMoney(wcPeg), 'A/R aging, inventory detail, deferred revenue, and peg support.'],
        ['Revenue quality', fmtPct(facts.recurringRevenuePct), 'Cohorts, retention, gross margin by customer, and concentration support.'],
      ],
    }],
    calculations: { reported, adjusted, addBackLift, wcPeg, evidence },
  });
}

function buildDcfAnalysis(facts: DealFacts, common: Partial<AnalysisOutput>): AnalysisOutput {
  const revenue = facts.revenueCents;
  const margin = pctFromUnknown(facts.financials.ebitda_margin_pct) ?? facts.margin ?? 0.18;
  const growth = pctFromUnknown(facts.financials.revenue_growth_pct) ?? 0.04;
  const taxRate = pctFromUnknown(facts.financials.tax_rate_pct) ?? 0.26;
  const capexPct = pctFromUnknown(facts.financials.capex_pct) ?? 0.025;
  const wcInvestmentPct = pctFromUnknown(facts.financials.working_capital_investment_pct) ?? 0.01;
  const wacc = pctFromUnknown(facts.financials.wacc_pct) ?? 0.14;
  const terminalGrowth = pctFromUnknown(facts.financials.terminal_growth_pct) ?? 0.025;
  const rows = forecastRows(revenue, growth, margin, taxRate, capexPct, wcInvestmentPct);
  const terminalValue = rows.length && wacc > terminalGrowth
    ? rows[rows.length - 1].fcf * (1 + terminalGrowth) / (wacc - terminalGrowth)
    : null;
  const pvFcf = rows.reduce((sum, row) => sum + row.fcf / Math.pow(1 + wacc, row.year), 0);
  const pvTerminal = terminalValue == null ? null : terminalValue / Math.pow(1 + wacc, 5);
  const enterpriseValue = pvTerminal == null ? (pvFcf || null) : pvFcf + pvTerminal;

  return finalizeAnalysis(facts, 'dcf', common, {
    summary: `${facts.name} DCF is modeled from revenue growth, margin, reinvestment, discount rate, and terminal value assumptions.`,
    metrics: [
      metric('enterprise_value', 'DCF enterprise value', enterpriseValue, fmtMoney(enterpriseValue), `${fmtPct(wacc)} WACC · ${fmtPct(terminalGrowth)} terminal growth`, varianceTone(enterpriseValue && facts.askingCents ? (facts.askingCents - enterpriseValue) / enterpriseValue : null)),
      metric('year_5_revenue', 'Year 5 revenue', rows[4]?.revenue ?? null, fmtMoney(rows[4]?.revenue), `${fmtPct(growth)} annual growth`),
      metric('terminal_value', 'PV terminal value', pvTerminal, fmtMoney(pvTerminal), 'Discounted terminal value'),
      metric('fcf_conversion', 'FCF conversion', 1 - taxRate - capexPct - wcInvestmentPct, fmtPct(1 - taxRate - capexPct - wcInvestmentPct), 'From EBITDA to unlevered FCF'),
    ],
    charts: [{
      type: 'bar',
      title: 'Forecast free cash flow',
      data: rows.map(row => ({ label: `Y${row.year}`, value: centsToMillions(row.fcf), displayValue: fmtMoney(row.fcf) })),
    }],
    tables: [{
      title: 'Five-year DCF',
      columns: ['Year', 'Revenue', 'EBITDA', 'FCF', 'PV FCF'],
      rows: rows.map(row => [
        row.year,
        fmtMoney(row.revenue),
        fmtMoney(row.ebitda),
        fmtMoney(row.fcf),
        fmtMoney(row.fcf / Math.pow(1 + wacc, row.year)),
      ]),
    }],
    calculations: { growth, margin, taxRate, capexPct, wcInvestmentPct, wacc, terminalGrowth, pvFcf, pvTerminal, terminalValue, enterpriseValue },
  });
}

function buildLboAnalysis(facts: DealFacts, common: Partial<AnalysisOutput>): AnalysisOutput {
  const dealSize = facts.dealSizeCents;
  const seniorDebtPct = pctFromUnknown(facts.financials.senior_debt_pct) ?? 0.6;
  const sellerNotePct = pctFromUnknown(facts.financials.seller_note_pct) ?? 0.1;
  const equityPct = Math.max(0, 1 - seniorDebtPct - sellerNotePct);
  const growth = pctFromUnknown(facts.financials.revenue_growth_pct) ?? 0.04;
  const margin = pctFromUnknown(facts.financials.ebitda_margin_pct) ?? facts.margin ?? 0.18;
  const exitMultiple = numberFromUnknown(facts.financials.exit_multiple) ?? facts.multipleRange.high ?? facts.multipleRange.low + 1.5;
  const holdPeriod = numberFromUnknown(facts.financials.hold_period_years) ?? 5;
  const initialEquity = dealSize == null ? null : dealSize * equityPct;
  const seniorDebt = dealSize == null ? null : dealSize * seniorDebtPct;
  const exitEbitda = facts.revenueCents == null ? null : facts.revenueCents * Math.pow(1 + growth, holdPeriod) * margin;
  const exitValue = exitEbitda == null ? null : exitEbitda * exitMultiple;
  const debtPaydown = seniorDebt == null ? null : seniorDebt * clamp(0.12 * holdPeriod, 0.25, 0.75);
  const remainingDebt = seniorDebt == null || debtPaydown == null ? null : Math.max(0, seniorDebt - debtPaydown);
  const exitEquity = exitValue == null ? null : exitValue - (remainingDebt || 0);
  const moic = initialEquity && exitEquity ? exitEquity / initialEquity : null;
  const irr = moic != null && holdPeriod > 0 ? Math.pow(moic, 1 / holdPeriod) - 1 : null;

  return finalizeAnalysis(facts, 'lbo', common, {
    summary: `${facts.name} LBO read sizes equity, debt paydown, exit value, MOIC, and IRR against current deal facts.`,
    metrics: [
      metric('initial_equity', 'Initial equity', initialEquity, fmtMoney(initialEquity), `${fmtPct(equityPct)} of deal size`),
      metric('senior_debt', 'Opening senior debt', seniorDebt, fmtMoney(seniorDebt), `${fmtPct(seniorDebtPct)} leverage`),
      metric('exit_equity', 'Exit equity value', exitEquity, fmtMoney(exitEquity), `${fmtMultiple(exitMultiple)} exit multiple`),
      metric('moic', 'MOIC', moic, moic == null ? '—' : `${moic.toFixed(1)}x`, `${holdPeriod}-year hold`, moic != null && moic >= 2 ? 'pursue' : 'watch'),
      metric('irr', 'IRR', irr, fmtPct(irr), 'Illustrative sponsor return', irr != null && irr >= 0.25 ? 'pursue' : irr != null && irr >= 0.15 ? 'watch' : 'pass'),
    ],
    charts: [{
      type: 'bar',
      title: 'Equity bridge',
      data: [
        { label: 'Initial equity', value: centsToMillions(initialEquity), displayValue: fmtMoney(initialEquity) },
        { label: 'Debt paydown', value: centsToMillions(debtPaydown), displayValue: fmtMoney(debtPaydown), tone: 'pursue' },
        { label: 'Exit equity', value: centsToMillions(exitEquity), displayValue: fmtMoney(exitEquity), tone: moic != null && moic >= 2 ? 'pursue' : 'watch' },
      ],
    }],
    tables: [{
      title: 'LBO assumptions',
      columns: ['Driver', 'Assumption', 'Why it matters'],
      rows: [
        ['Hold period', `${holdPeriod} years`, 'Sets compounding and exit timing.'],
        ['Revenue growth', fmtPct(growth), 'Drives exit EBITDA.'],
        ['Exit multiple', fmtMultiple(exitMultiple), 'Controls terminal value.'],
        ['Debt paydown', fmtMoney(debtPaydown), 'Turns cash flow into sponsor equity value.'],
      ],
    }],
    calculations: { dealSize, seniorDebtPct, sellerNotePct, equityPct, growth, margin, exitMultiple, holdPeriod, initialEquity, seniorDebt, exitEbitda, exitValue, debtPaydown, remainingDebt, exitEquity, moic, irr },
  });
}

function buildSensitivityAnalysis(facts: DealFacts, common: Partial<AnalysisOutput>): AnalysisOutput {
  const baseEarnings = facts.adjustedEarningsCents;
  const baseMultiple = facts.impliedMultiple ?? (facts.multipleRange.low + (facts.multipleRange.high ?? facts.multipleRange.low + 3)) / 2;
  const marginCases = [-0.02, 0, 0.02].map(delta => Math.max(0.03, (facts.margin ?? 0.18) + delta));
  const multipleCases = [Math.max(1, baseMultiple - 1), baseMultiple, baseMultiple + 1];
  const rows = marginCases.map(marginCase => {
    const earnings = facts.revenueCents ? facts.revenueCents * marginCase : baseEarnings;
    return multipleCases.map(multipleCase => earnings == null ? null : earnings * multipleCase);
  });

  return finalizeAnalysis(facts, 'sensitivity', common, {
    summary: `${facts.name} sensitivity model shows how value moves when margin and multiple assumptions change.`,
    metrics: [
      metric('low_case', 'Low case', rows[0][0], fmtMoney(rows[0][0]), `${fmtPct(marginCases[0])} margin · ${fmtMultiple(multipleCases[0])}`),
      metric('base_case', 'Base case', rows[1][1], fmtMoney(rows[1][1]), `${fmtPct(marginCases[1])} margin · ${fmtMultiple(multipleCases[1])}`),
      metric('high_case', 'High case', rows[2][2], fmtMoney(rows[2][2]), `${fmtPct(marginCases[2])} margin · ${fmtMultiple(multipleCases[2])}`),
    ],
    charts: [{
      type: 'matrix',
      title: 'Value sensitivity',
      data: marginCases.flatMap((marginCase, rowIndex) => multipleCases.map((multipleCase, colIndex) => ({
        row: fmtPct(marginCase),
        column: fmtMultiple(multipleCase),
        value: centsToMillions(rows[rowIndex][colIndex]),
        displayValue: fmtMoney(rows[rowIndex][colIndex]),
      }))),
    }],
    tables: [{
      title: 'Margin / multiple table',
      columns: ['Margin', ...multipleCases.map(fmtMultiple)],
      rows: marginCases.map((marginCase, rowIndex) => [
        fmtPct(marginCase),
        ...rows[rowIndex].map(fmtMoney),
      ]),
    }],
    calculations: { baseEarnings, marginCases, multipleCases, values: rows },
  });
}

function buildRecastAnalysis(facts: DealFacts, common: Partial<AnalysisOutput>): AnalysisOutput {
  const base = facts.earningsCents;
  const adjusted = facts.adjustedEarningsCents;
  const delta = base != null && adjusted != null ? adjusted - base : null;

  return finalizeAnalysis(facts, 'recast', common, {
    summary: `${facts.name} recast starts with reported ${facts.metric} and separates known add-backs from items still needing support.`,
    metrics: [
      metric('reported', `Reported ${facts.metric}`, base, fmtMoney(base), 'Before known adjustments'),
      metric('known_addbacks', 'Known add-backs', facts.addBacksCents, fmtMoney(facts.addBacksCents), 'Owner comp, non-recurring, or normalized expenses'),
      metric('adjusted', `Adjusted ${facts.metric}`, adjusted, fmtMoney(adjusted), 'Current deterministic recast', adjusted && base && adjusted > base ? 'pursue' : 'neutral'),
      metric('delta', 'Recast lift', delta, fmtMoney(delta), delta ? `${fmtPct(delta / Math.max(base || 1, 1))} lift` : 'No supported add-backs yet'),
    ],
    charts: [{
      type: 'bar',
      title: 'Recast bridge',
      data: [
        { label: `Reported ${facts.metric}`, value: centsToMillions(base), displayValue: fmtMoney(base) },
        { label: 'Known add-backs', value: centsToMillions(facts.addBacksCents), displayValue: fmtMoney(facts.addBacksCents) },
        { label: `Adjusted ${facts.metric}`, value: centsToMillions(adjusted), displayValue: fmtMoney(adjusted) },
      ],
    }],
    tables: [{
      title: 'Supported adjustments',
      columns: ['Item', 'Amount', 'Status'],
      rows: recastRows(facts),
    }],
    calculations: { reported: base, knownAddBacks: facts.addBacksCents, adjusted, delta },
  });
}

function buildCapitalStructureAnalysis(facts: DealFacts, analysisType: string, common: Partial<AnalysisOutput>): AnalysisOutput {
  const dealSize = facts.dealSizeCents;
  const seniorDebtPct = numberFromUnknown(facts.financials.senior_debt_pct) ?? (analysisType === 'sba' ? 0.8 : 0.65);
  const sellerNotePct = numberFromUnknown(facts.financials.seller_note_pct) ?? (analysisType === 'sba' ? 0.1 : 0.15);
  const equityPct = Math.max(0, 1 - seniorDebtPct - sellerNotePct);
  const seniorDebt = dealSize != null ? dealSize * seniorDebtPct : null;
  const sellerNote = dealSize != null ? dealSize * sellerNotePct : null;
  const equity = dealSize != null ? dealSize * equityPct : null;
  const rate = numberFromUnknown(facts.financials.interest_rate) ?? (analysisType === 'sba' ? 0.115 : 0.105);
  const seniorService = annualDebtService(seniorDebt, rate, 10);
  const dscr = facts.adjustedEarningsCents && seniorService ? facts.adjustedEarningsCents / seniorService : null;

  return finalizeAnalysis(facts, analysisType, common, {
    summary: `${facts.name} capital stack is modeled against senior debt, seller paper, buyer equity, and debt-service coverage.`,
    metrics: [
      metric('purchase_price', 'Deal size', dealSize, fmtMoney(dealSize), facts.askingCents ? 'Current asking price' : 'Inferred from league range'),
      metric('equity', 'Equity need', equity, fmtMoney(equity), `${fmtPct(equityPct)} of deal size`),
      metric('senior_debt', 'Senior debt', seniorDebt, fmtMoney(seniorDebt), `${fmtPct(seniorDebtPct)} at ${fmtPct(rate)} interest`),
      metric('seller_note', 'Seller note', sellerNote, fmtMoney(sellerNote), `${fmtPct(sellerNotePct)} seller paper`),
      metric('dscr', 'DSCR', dscr, dscr == null ? '—' : dscr.toFixed(2), 'Coverage on modeled senior debt', dscrTone(dscr)),
    ],
    charts: [{
      type: 'bar',
      title: 'Sources of capital',
      data: [
        { label: 'Buyer equity', value: centsToMillions(equity), displayValue: fmtMoney(equity), tone: 'watch' },
        { label: 'Senior debt', value: centsToMillions(seniorDebt), displayValue: fmtMoney(seniorDebt), tone: 'neutral' },
        { label: 'Seller note', value: centsToMillions(sellerNote), displayValue: fmtMoney(sellerNote), tone: 'pursue' },
      ],
    }],
    tables: [{
      title: 'Bankability checks',
      columns: ['Check', 'Read', 'Decision impact'],
      rows: [
        ['DSCR', dscr == null ? 'Missing earnings/debt size' : dscr.toFixed(2), 'Senior debt generally needs clear repayment support.'],
        ['Equity injection', fmtPct(equityPct), 'Thin equity increases lender and seller risk.'],
        ['Seller note', fmtPct(sellerNotePct), 'Can bridge price gaps but changes legal and tax review.'],
      ],
    }],
    calculations: { dealSize, seniorDebtPct, sellerNotePct, equityPct, seniorDebt, sellerNote, equity, rate, seniorService, dscr },
    });
  }

function buildCovenantAnalysis(facts: DealFacts, common: Partial<AnalysisOutput>): AnalysisOutput {
  const dealSize = facts.dealSizeCents;
  const seniorDebtPct = pctFromUnknown(facts.financials.senior_debt_pct) ?? 0.65;
  const interestRate = pctFromUnknown(facts.financials.interest_rate) ?? 0.105;
  const seniorDebt = dealSize == null ? null : dealSize * seniorDebtPct;
  const debtService = annualDebtService(seniorDebt, interestRate, 10);
  const dscr = facts.adjustedEarningsCents && debtService ? facts.adjustedEarningsCents / debtService : null;
  const debtToEbitda = facts.adjustedEarningsCents && seniorDebt ? seniorDebt / facts.adjustedEarningsCents : null;
  const minDscr = numberFromUnknown(facts.financials.min_dscr) ?? 1.25;
  const maxDebtToEbitda = numberFromUnknown(facts.financials.max_debt_to_ebitda) ?? 3.5;
  const maxLtv = pctFromUnknown(facts.financials.max_ltv_pct) ?? 0.75;
  const ltv = dealSize && seniorDebt ? seniorDebt / dealSize : null;

  return finalizeAnalysis(facts, 'covenant', common, {
    summary: `${facts.name} covenant model checks DSCR, debt-to-EBITDA, loan-to-value, and lender pressure before financing terms harden.`,
    metrics: [
      metric('dscr', 'DSCR', dscr, dscr == null ? '—' : dscr.toFixed(2), `Minimum ${minDscr.toFixed(2)}x`, dscr != null && dscr >= minDscr ? 'pursue' : 'pass'),
      metric('debt_to_ebitda', 'Debt / EBITDA', debtToEbitda, fmtMultiple(debtToEbitda), `Maximum ${fmtMultiple(maxDebtToEbitda)}`, debtToEbitda != null && debtToEbitda <= maxDebtToEbitda ? 'pursue' : 'watch'),
      metric('ltv', 'Loan-to-value', ltv, fmtPct(ltv), `Maximum ${fmtPct(maxLtv)}`, ltv != null && ltv <= maxLtv ? 'pursue' : 'watch'),
      metric('annual_debt_service', 'Annual debt service', debtService, fmtMoney(debtService), `${fmtPct(interestRate)} senior rate`),
    ],
    charts: [{
      type: 'bar',
      title: 'Covenant headroom',
      data: [
        { label: 'DSCR', value: dscr ?? 0, displayValue: dscr == null ? '—' : `${dscr.toFixed(2)}x`, tone: dscr != null && dscr >= minDscr ? 'pursue' : 'pass' },
        { label: 'Debt / EBITDA', value: debtToEbitda ?? 0, displayValue: fmtMultiple(debtToEbitda), tone: debtToEbitda != null && debtToEbitda <= maxDebtToEbitda ? 'pursue' : 'watch' },
        { label: 'LTV', value: (ltv ?? 0) * 100, displayValue: fmtPct(ltv), tone: ltv != null && ltv <= maxLtv ? 'pursue' : 'watch' },
      ],
    }],
    tables: [{
      title: 'Covenant checks',
      columns: ['Check', 'Modeled read', 'Lender implication'],
      rows: [
        ['DSCR', dscr == null ? 'Missing' : `${dscr.toFixed(2)}x`, 'Below threshold usually requires price, debt, or seller-paper adjustment.'],
        ['Debt / EBITDA', fmtMultiple(debtToEbitda), 'Higher leverage raises underwriting pressure.'],
        ['Loan-to-value', fmtPct(ltv), 'Controls collateral and equity injection pressure.'],
      ],
    }],
    calculations: { dealSize, seniorDebtPct, interestRate, seniorDebt, debtService, dscr, debtToEbitda, minDscr, maxDebtToEbitda, maxLtv, ltv },
  });
}

function buildWorkingCapitalAnalysis(facts: DealFacts, common: Partial<AnalysisOutput>): AnalysisOutput {
  const revenue = facts.revenueCents;
  const peg = numberFromUnknown(facts.financials.working_capital_peg)
    ?? (revenue != null ? Math.max(revenue * 0.08, revenue / 12) : null);
  const collar = peg != null ? peg * 0.1 : null;

  return finalizeAnalysis(facts, 'working_capital', common, {
    summary: `${facts.name} needs a working-capital peg before LOI or purchase-agreement language gets too specific.`,
    metrics: [
      metric('peg', 'Suggested peg', peg, fmtMoney(peg), 'Higher of 8% revenue or one month of revenue'),
      metric('collar', 'Collar', collar, fmtMoney(collar), 'Illustrative 10% band'),
      metric('ar', 'A/R', numberFromUnknown(facts.financials.accounts_receivable), fmtMoney(numberFromUnknown(facts.financials.accounts_receivable)), 'Needs aging support'),
      metric('inventory', 'Inventory', numberFromUnknown(facts.financials.inventory), fmtMoney(numberFromUnknown(facts.financials.inventory)), 'Needs count and obsolescence review'),
    ],
    charts: [{
      type: 'bar',
      title: 'Working-capital components',
      data: [
        { label: 'A/R', value: centsToMillions(numberFromUnknown(facts.financials.accounts_receivable)), displayValue: fmtMoney(numberFromUnknown(facts.financials.accounts_receivable)) },
        { label: 'Inventory', value: centsToMillions(numberFromUnknown(facts.financials.inventory)), displayValue: fmtMoney(numberFromUnknown(facts.financials.inventory)) },
        { label: 'Suggested peg', value: centsToMillions(peg), displayValue: fmtMoney(peg) },
      ],
    }],
    tables: [{
      title: 'Working-capital diligence',
      columns: ['Item', 'Ask', 'Why'],
      rows: [
        ['A/R aging', 'Request aging schedule', 'Confirms collectability and cutoff.'],
        ['Inventory', 'Request count and obsolescence policy', 'Avoids paying for unusable stock.'],
        ['Deferred revenue', 'Request deferred revenue schedule', 'Can create post-close delivery obligations.'],
      ],
    }],
    calculations: { peg, collar },
  });
}

function buildMarketIntelligenceAnalysis(facts: DealFacts, common: Partial<AnalysisOutput>): AnalysisOutput {
  return finalizeAnalysis(facts, 'market_intelligence', common, {
    summary: `${facts.name} is being read against industry demand, buyer universe, financing appetite, and diligence gaps.`,
    metrics: [
      metric('buyer_appetite', 'Buyer appetite', facts.fitScore, `${facts.fitScore}% signal`, `${facts.deal.industry || 'Industry'} read from current deal facts`, facts.fitTone),
      metric('financing_fit', 'Financing fit', financingSignal(facts), `${financingSignal(facts)}% signal`, 'Based on margin, deal size, and DSCR proxy', signalTone(financingSignal(facts))),
      metric('source_depth', 'Source depth', evidenceScore(facts), `${evidenceScore(facts)}%`, 'Completeness of current workspace facts', signalTone(evidenceScore(facts))),
    ],
    charts: [{
      type: 'bar',
      title: 'Market signals',
      data: [
        { label: 'Buyer appetite', value: facts.fitScore, displayValue: `${facts.fitScore}%`, tone: facts.fitTone },
        { label: 'Financing climate', value: financingSignal(facts), displayValue: `${financingSignal(facts)}%`, tone: signalTone(financingSignal(facts)) },
        { label: 'Diligence depth', value: evidenceScore(facts), displayValue: `${evidenceScore(facts)}%`, tone: signalTone(evidenceScore(facts)) },
      ],
    }],
    tables: [{
      title: 'Market read',
      columns: ['Signal', 'Current read', 'Next proof point'],
      rows: [
        ['Buyer universe', buyerUniverseRead(facts), 'Identify strategic roll-ups, sponsor platforms, and local operators.'],
        ['Financing appetite', financingRead(facts), 'Model debt service, seller paper, and working-capital reserve.'],
        ['Source gap', sourceGapRead(facts), 'Request the first missing schedule before the next buyer touch.'],
      ],
    }],
    });
  }

function buildTaxImpactAnalysis(facts: DealFacts, analysisType: string, common: Partial<AnalysisOutput>): AnalysisOutput {
  const purchasePrice = facts.dealSizeCents;
  const assetPurchasePct = pctFromUnknown(facts.financials.asset_purchase_pct) ?? 0.7;
  const goodwillPct = pctFromUnknown(facts.financials.goodwill_allocation_pct) ?? 0.55;
  const inventoryPct = pctFromUnknown(facts.financials.inventory_allocation_pct) ?? 0.08;
  const equipmentPct = pctFromUnknown(facts.financials.equipment_allocation_pct) ?? 0.17;
  const taxRate = pctFromUnknown(facts.financials.tax_rate_pct) ?? 0.26;
  const stateTaxRate = pctFromUnknown(facts.financials.state_tax_rate_pct) ?? 0.04;
  const ordinaryRate = pctFromUnknown(facts.financials.ordinary_income_tax_rate_pct) ?? 0.37;
  const capitalGainsRate = pctFromUnknown(facts.financials.capital_gains_tax_rate_pct) ?? 0.2;
  const goodwill = purchasePrice == null ? null : purchasePrice * goodwillPct;
  const inventory = purchasePrice == null ? null : purchasePrice * inventoryPct;
  const equipment = purchasePrice == null ? null : purchasePrice * equipmentPct;
  const goodwillAnnualShield = goodwill == null ? null : (goodwill / 15) * taxRate;
  const sellerTaxPressure = purchasePrice == null ? null : purchasePrice * ((ordinaryRate * inventoryPct) + (capitalGainsRate * Math.max(0, 1 - inventoryPct)) + stateTaxRate);

  return finalizeAnalysis(facts, analysisType, common, {
    summary: `${facts.name} tax impact model frames asset/equity weighting, allocation, amortization shield, and seller tax pressure for CPA and tax-counsel review.`,
    metrics: [
      metric('asset_purchase_pct', 'Asset-purchase weighting', assetPurchasePct, fmtPct(assetPurchasePct), 'Working assumption, not tax advice'),
      metric('goodwill', 'Goodwill allocation', goodwill, fmtMoney(goodwill), `${fmtPct(goodwillPct)} of purchase price`),
      metric('annual_tax_shield', 'Annual goodwill tax shield', goodwillAnnualShield, fmtMoney(goodwillAnnualShield), '15-year illustrative amortization shield'),
      metric('seller_tax_pressure', 'Illustrative seller tax pressure', sellerTaxPressure, fmtMoney(sellerTaxPressure), 'Rough issue spot only; CPA/tax counsel signs off', 'watch'),
    ],
    charts: [{
      type: 'bar',
      title: 'Purchase-price allocation',
      data: [
        { label: 'Goodwill', value: centsToMillions(goodwill), displayValue: fmtMoney(goodwill), tone: 'pursue' },
        { label: 'Equipment', value: centsToMillions(equipment), displayValue: fmtMoney(equipment), tone: 'neutral' },
        { label: 'Inventory', value: centsToMillions(inventory), displayValue: fmtMoney(inventory), tone: 'watch' },
      ],
    }],
    tables: [{
      title: analysisType === 'purchase_price_allocation' ? 'Allocation issue map' : 'Tax impact issue map',
      columns: ['Issue', 'Modeled read', 'Sign-off owner'],
      rows: [
        ['Asset vs equity', `${fmtPct(assetPurchasePct)} asset weighting`, 'Tax counsel / CPA'],
        ['Goodwill amortization', fmtMoney(goodwillAnnualShield), 'CPA / tax counsel'],
        ['Inventory and ordinary income', fmtMoney(inventory), 'CPA'],
        ['State tax exposure', fmtPct(stateTaxRate), 'State/local tax specialist as needed'],
      ],
    }],
    professionalTriggers: [
      { role: 'CPA / tax counsel', trigger: 'Purchase-price allocation, asset/equity treatment, state tax, installment sale, or earnout character affects economics.', why: 'Yulia can model scenarios and issue spot; tax professionals sign off on tax treatment.' },
      { role: 'M&A attorney', trigger: 'Tax structure must match deal docs, allocation schedules, seller note, and earnout terms.', why: 'Legal terms determine how the tax model is actually implemented.' },
    ],
    calculations: { purchasePrice, assetPurchasePct, goodwillPct, inventoryPct, equipmentPct, taxRate, stateTaxRate, ordinaryRate, capitalGainsRate, goodwill, inventory, equipment, goodwillAnnualShield, sellerTaxPressure },
  });
}

function buildTaxStructureAnalysis(facts: DealFacts, common: Partial<AnalysisOutput>): AnalysisOutput {
  return finalizeAnalysis(facts, 'tax_structure', common, {
    summary: `${facts.name} needs a structure read before price, allocation, earnout, seller paper, and working-capital terms harden.`,
    metrics: [
      metric('structure', 'Likely structure', dealStructure(facts), dealStructure(facts), 'Analysis only; user and tax counsel decide'),
      metric('seller_note', 'Seller note', numberFromUnknown(facts.financials.seller_note_pct), fmtPct(numberFromUnknown(facts.financials.seller_note_pct)), 'May affect installment-sale treatment'),
      metric('earnout', 'Earnout', numberFromUnknown(facts.financials.earnout_pct), fmtPct(numberFromUnknown(facts.financials.earnout_pct)), 'Timing and characterization need review'),
    ],
    charts: [],
    tables: [{
      title: 'Tax-sensitive terms',
      columns: ['Term', 'Why it matters', 'Who signs off'],
      rows: [
        ['Asset vs equity', 'Changes basis, allocation, liabilities, and buyer/seller tax outcomes.', 'Tax counsel / CPA'],
        ['Purchase-price allocation', 'Creates tax consequences and should tie to diligence evidence.', 'CPA / tax counsel'],
        ['Earnout / seller note', 'Timing, character, and collectability require review.', 'Tax counsel'],
      ],
    }],
  });
}

function buildTaxLegalStructureAnalysis(facts: DealFacts, common: Partial<AnalysisOutput>): AnalysisOutput {
  const taxTriggers = commonProfessionalTriggers(facts, 'tax_structure').filter(trigger => /tax|cpa/i.test(trigger.role));
  const legalTriggers = commonProfessionalTriggers(facts, 'legal_structure').filter(trigger => /counsel|attorney|legal/i.test(trigger.role));

  return finalizeAnalysis(facts, 'tax_legal_structure', common, {
    summary: `${facts.name} needs a combined tax and legal issue map before structure, price, allocation, diligence sharing, review routing, or execution becomes decision-ready.`,
    metrics: [
      metric('structure', 'Working deal form', dealStructure(facts), dealStructure(facts), 'Analysis only; user and professionals decide'),
      metric('tax_sensitivity', 'Tax sensitivity', taxSensitivityScore(facts), `${taxSensitivityScore(facts)}%`, 'Allocation, entity type, earnout, seller note, state exposure', signalTone(taxSensitivityScore(facts))),
      metric('legal_execution', 'Legal execution load', legalExecutionScore(facts), `${legalExecutionScore(facts)}%`, 'Approvals, diligence scope, review queue, and closing records', signalTone(legalExecutionScore(facts))),
      metric('diligence_depth', 'Evidence depth', evidenceScore(facts), `${evidenceScore(facts)}%`, 'Current file completeness before external sharing', signalTone(evidenceScore(facts))),
    ],
    charts: [{
      type: 'bar',
      title: 'Issue pressure',
      data: [
        { label: 'Tax sensitivity', value: taxSensitivityScore(facts), displayValue: `${taxSensitivityScore(facts)}%`, tone: signalTone(taxSensitivityScore(facts)) },
        { label: 'Legal execution', value: legalExecutionScore(facts), displayValue: `${legalExecutionScore(facts)}%`, tone: signalTone(legalExecutionScore(facts)) },
        { label: 'Evidence depth', value: evidenceScore(facts), displayValue: `${evidenceScore(facts)}%`, tone: signalTone(evidenceScore(facts)) },
      ],
    }],
    tables: [
      {
        title: 'Tax issue map',
        columns: ['Issue', 'Why it matters', 'Who signs off'],
        rows: [
          ['Asset vs equity', 'Changes basis, allocation, liabilities, and buyer/seller tax outcomes.', 'Tax counsel / CPA'],
          ['Purchase-price allocation', 'Creates tax consequences and should tie to diligence evidence.', 'CPA / tax counsel'],
          ['Earnout / seller note', 'Timing, character, and collectability require review before terms harden.', 'Tax counsel'],
          ['State and local tax', 'Nexus, transfer taxes, sales/use tax, payroll, and successor-liability exposure vary by state.', 'CPA / tax counsel'],
        ],
      },
      {
        title: 'Legal execution map',
        columns: ['Area', 'Current issue', 'Action'],
        rows: [
          ['LOI / term sheet', 'Separate non-binding business terms from binding confidentiality, exclusivity, and expense provisions.', 'Attorney review before signature.'],
          ['Diligence / data room', 'Shared materials need permissioning, source traceability, and action routing by recipient.', 'Tie each shared item to a data-room status.'],
          ['Approvals and consents', 'Landlord, lender, customer, franchise, regulatory, or board approvals can change timeline and leverage.', 'Create a consent checklist.'],
          ['Executed records', 'Countersigned legal docs need immutable custody and audit trail.', 'Store final docs as locked executed records.'],
        ],
      },
    ],
    risks: [
      ...commonRisks(facts),
      { label: 'Tax/legal signoff gap', detail: 'The model can spot issues and options; final positions, filings, opinions, and executed instruments belong with licensed professionals.', severity: 'medium' as Severity },
    ].slice(0, 6),
    professionalTriggers: [...taxTriggers, ...legalTriggers].slice(0, 6),
    nextActions: [
      {
        label: 'Model structure scenarios',
        actionType: 'update_model',
        surfaceActionId: 'update_model_assumption',
        prompt: 'Open structure assumptions and model asset vs equity, seller note, earnout, and working-capital outcomes.',
      },
      {
        label: 'Route to counsel/CPA',
        actionType: 'request_review',
        surfaceActionId: 'request_review',
        prompt: 'Prepare a counsel and CPA review package with the tax/legal issue map and files needing sign-off.',
      },
      {
        label: 'Open files needing action',
        actionType: 'open_files',
        surfaceActionId: 'open_files_needing_action',
        fileScope: 'shared',
        prompt: 'Show the deal files that need review, signature, execution, or professional sign-off.',
      },
    ],
  });
}

function buildLegalStructureAnalysis(facts: DealFacts, analysisType: string, common: Partial<AnalysisOutput>): AnalysisOutput {
  return finalizeAnalysis(facts, analysisType, common, {
    summary: `${facts.name} legal structure should be mapped to deal form, diligence burden, approvals, and closing deliverables.`,
    metrics: [
      metric('structure', 'Deal form', dealStructure(facts), dealStructure(facts), 'Working assumption'),
      metric('dd_window', 'Diligence window', numberFromUnknown(facts.financials.dd_days), fmtDays(numberFromUnknown(facts.financials.dd_days)), 'LOI / purchase agreement input'),
      metric('exclusivity', 'Exclusivity', numberFromUnknown(facts.financials.exclusivity_days), fmtDays(numberFromUnknown(facts.financials.exclusivity_days)), 'Commercial leverage term'),
      metric('closing', 'Closing deadline', numberFromUnknown(facts.financials.closing_days), fmtDays(numberFromUnknown(facts.financials.closing_days)), 'Execution pressure'),
    ],
    charts: [],
    tables: [{
      title: 'Legal workplan',
      columns: ['Area', 'Current issue', 'Action'],
      rows: [
        ['LOI / term sheet', 'Confirm non-binding vs binding clauses.', 'Attorney review before signature.'],
        ['Diligence', 'Map source artifacts, data-room materials, and open requests.', 'Tie every issue to evidence.'],
        ['Closing', 'Define approvals, third-party consents, and executed record custody.', 'Track to immutable executed files.'],
      ],
    }],
  });
}

function buildRedFlagsAnalysis(facts: DealFacts, common: Partial<AnalysisOutput>): AnalysisOutput {
  const risks = commonRisks(facts);
  return finalizeAnalysis(facts, 'red_flags', common, {
    summary: `${facts.name} has ${risks.length} current risk flags that should be cleared, priced, or explicitly accepted.`,
    metrics: [
      metric('high_risks', 'High risks', risks.filter(r => r.severity === 'high').length, String(risks.filter(r => r.severity === 'high').length), 'Needs decision before next gate', 'pass'),
      metric('medium_risks', 'Medium risks', risks.filter(r => r.severity === 'medium').length, String(risks.filter(r => r.severity === 'medium').length), 'Needs diligence owner', 'watch'),
      metric('missing', 'Missing proof', commonMissingData(facts).length, String(commonMissingData(facts).length), 'Evidence requests open'),
    ],
    charts: [{
      type: 'bar',
      title: 'Risk pressure',
      data: [
        { label: 'High', value: risks.filter(r => r.severity === 'high').length, displayValue: String(risks.filter(r => r.severity === 'high').length), tone: 'pass' },
        { label: 'Medium', value: risks.filter(r => r.severity === 'medium').length, displayValue: String(risks.filter(r => r.severity === 'medium').length), tone: 'watch' },
        { label: 'Low', value: risks.filter(r => r.severity === 'low').length, displayValue: String(risks.filter(r => r.severity === 'low').length), tone: 'pursue' },
      ],
    }],
    tables: [{
      title: 'Risk register',
      columns: ['Risk', 'Severity', 'Trigger'],
      rows: risks.map(r => [r.label, r.severity, r.trigger || r.detail]),
    }],
    risks,
  });
}

function buildPmiAnalysis(facts: DealFacts, common: Partial<AnalysisOutput>): AnalysisOutput {
  const revenueSynergy = facts.revenueCents ? facts.revenueCents * 0.03 : null;
  const costSynergy = facts.revenueCents ? facts.revenueCents * 0.02 : null;
  return finalizeAnalysis(facts, 'pmi_value_creation', common, {
    summary: `${facts.name} post-close value plan should turn diligence findings into day-one controls, 100-day moves, and owner-visible value capture.`,
    metrics: [
      metric('revenue_synergy', 'Revenue upside', revenueSynergy, fmtMoney(revenueSynergy), 'Illustrative 3% revenue capture'),
      metric('cost_synergy', 'Cost capture', costSynergy, fmtMoney(costSynergy), 'Illustrative 2% cost opportunity'),
      metric('first_100_days', '100-day moves', 5, '5', 'Initial operating workstreams'),
    ],
    charts: [{
      type: 'bar',
      title: 'Value capture opportunities',
      data: [
        { label: 'Revenue', value: centsToMillions(revenueSynergy), displayValue: fmtMoney(revenueSynergy), tone: 'pursue' },
        { label: 'Cost', value: centsToMillions(costSynergy), displayValue: fmtMoney(costSynergy), tone: 'watch' },
      ],
    }],
    tables: [{
      title: '100-day agenda',
      columns: ['Workstream', 'First move', 'Evidence link'],
      rows: [
        ['Finance', 'Lock weekly cash and working-capital cadence.', 'Financial model / data room'],
        ['Customers', 'Protect top-account relationships.', 'Customer concentration schedule'],
        ['People', 'Confirm key employee retention and incentives.', 'Org chart / employment docs'],
      ],
    }],
    });
  }

function buildEarnoutAnalysis(facts: DealFacts, common: Partial<AnalysisOutput>): AnalysisOutput {
  const dealSize = facts.dealSizeCents;
  const earnoutPct = pctFromUnknown(facts.financials.earnout_pct) ?? 0.1;
  const probability = pctFromUnknown(facts.financials.earnout_probability_pct) ?? 0.6;
  const discountRate = pctFromUnknown(facts.financials.discount_rate_pct) ?? 0.14;
  const earnoutPeriodMonths = numberFromUnknown(facts.financials.earnout_period_months) ?? 24;
  const targetGrowth = pctFromUnknown(facts.financials.earnout_revenue_growth_pct) ?? pctFromUnknown(facts.financials.revenue_growth_pct) ?? 0.08;
  const maxEarnout = dealSize == null ? null : dealSize * earnoutPct;
  const expectedEarnout = maxEarnout == null ? null : maxEarnout * probability;
  const presentValue = expectedEarnout == null ? null : expectedEarnout / Math.pow(1 + discountRate, earnoutPeriodMonths / 12);

  return finalizeAnalysis(facts, 'earnout', common, {
    summary: `${facts.name} earnout model separates headline consideration from probability-weighted value, timing, and legal/tax review points.`,
    metrics: [
      metric('max_earnout', 'Maximum earnout', maxEarnout, fmtMoney(maxEarnout), `${fmtPct(earnoutPct)} of deal size`),
      metric('expected_earnout', 'Expected earnout', expectedEarnout, fmtMoney(expectedEarnout), `${fmtPct(probability)} modeled probability`),
      metric('present_value', 'PV of earnout', presentValue, fmtMoney(presentValue), `${fmtPct(discountRate)} discount rate`),
      metric('target_growth', 'Target growth', targetGrowth, fmtPct(targetGrowth), 'Illustrative performance hurdle'),
    ],
    charts: [{
      type: 'bar',
      title: 'Earnout economics',
      data: [
        { label: 'Maximum', value: centsToMillions(maxEarnout), displayValue: fmtMoney(maxEarnout), tone: 'watch' },
        { label: 'Expected', value: centsToMillions(expectedEarnout), displayValue: fmtMoney(expectedEarnout), tone: 'neutral' },
        { label: 'PV', value: centsToMillions(presentValue), displayValue: fmtMoney(presentValue), tone: 'pursue' },
      ],
    }],
    tables: [{
      title: 'Earnout structure checklist',
      columns: ['Term', 'Modeled read', 'Why Yulia flags it'],
      rows: [
        ['Performance hurdle', fmtPct(targetGrowth), 'Needs objective measurement and audit rights.'],
        ['Measurement period', `${earnoutPeriodMonths} months`, 'Longer periods increase operating-control disputes.'],
        ['Tax/legal character', 'Needs sign-off', 'Contingent value can change tax timing and agreement language.'],
      ],
    }],
    calculations: { dealSize, earnoutPct, probability, discountRate, earnoutPeriodMonths, targetGrowth, maxEarnout, expectedEarnout, presentValue },
  });
}

function buildCapTableAnalysis(facts: DealFacts, common: Partial<AnalysisOutput>): AnalysisOutput {
  const preMoney = centsFrom(numberFromUnknown(facts.financials.pre_money_cents)) ?? facts.dealSizeCents ?? facts.askingCents;
  const raiseAmount = centsFrom(numberFromUnknown(facts.financials.raise_amount_cents)) ?? (preMoney == null ? null : preMoney * 0.2);
  const optionPoolPct = pctFromUnknown(facts.financials.option_pool_pct) ?? 0.1;
  const liquidationPreferenceMultiple = numberFromUnknown(facts.financials.liquidation_preference_multiple) ?? numberFromUnknown(facts.financials.liquidation_preference_pct) ?? 1;
  const postMoney = preMoney == null || raiseAmount == null ? null : preMoney + raiseAmount;
  const investorOwnership = postMoney == null || raiseAmount == null ? null : raiseAmount / postMoney;
  const founderOwnership = investorOwnership == null ? null : Math.max(0, 1 - investorOwnership - optionPoolPct);
  const preferenceStack = raiseAmount == null ? null : raiseAmount * liquidationPreferenceMultiple;

  return finalizeAnalysis(facts, 'cap_table', common, {
    summary: `${facts.name} cap table model shows dilution, option pool pressure, and liquidation preference economics before fundraising terms become executable.`,
    metrics: [
      metric('pre_money', 'Pre-money value', preMoney, fmtMoney(preMoney), 'Working valuation assumption'),
      metric('raise_amount', 'Raise amount', raiseAmount, fmtMoney(raiseAmount), 'Primary capital'),
      metric('investor_ownership', 'Investor ownership', investorOwnership, fmtPct(investorOwnership), 'Post-money share'),
      metric('founder_ownership', 'Founder / existing ownership', founderOwnership, fmtPct(founderOwnership), `After ${fmtPct(optionPoolPct)} option pool`),
      metric('preference_stack', 'Preference stack', preferenceStack, fmtMoney(preferenceStack), `${liquidationPreferenceMultiple.toFixed(1)}x liquidation preference`),
    ],
    charts: [{
      type: 'bar',
      title: 'Post-money ownership',
      data: [
        { label: 'Investor', value: (investorOwnership ?? 0) * 100, displayValue: fmtPct(investorOwnership), tone: 'watch' },
        { label: 'Option pool', value: optionPoolPct * 100, displayValue: fmtPct(optionPoolPct), tone: 'neutral' },
        { label: 'Existing', value: (founderOwnership ?? 0) * 100, displayValue: fmtPct(founderOwnership), tone: 'pursue' },
      ],
    }],
    tables: [{
      title: 'Cap table terms',
      columns: ['Term', 'Modeled read', 'Decision issue'],
      rows: [
        ['Pre-money', fmtMoney(preMoney), 'Controls dilution and headline valuation.'],
        ['Option pool', fmtPct(optionPoolPct), 'Can shift dilution before or after investment.'],
        ['Liquidation preference', `${liquidationPreferenceMultiple.toFixed(1)}x`, 'Changes downside economics and exit proceeds.'],
      ],
    }],
    calculations: { preMoney, raiseAmount, optionPoolPct, liquidationPreferenceMultiple, postMoney, investorOwnership, founderOwnership, preferenceStack },
  });
}

function finalizeAnalysis(
  facts: DealFacts,
  analysisType: string,
  common: Partial<AnalysisOutput>,
  specific: Partial<AnalysisOutput>,
): AnalysisOutput {
  const label = ANALYSIS_LABELS[analysisType] || ANALYSIS_LABELS.auto;
  const risks = specific.risks || common.risks || commonRisks(facts);
  const missingData = specific.missingData || common.missingData || commonMissingData(facts);
  const professionalTriggers = specific.professionalTriggers || common.professionalTriggers || commonProfessionalTriggers(facts, analysisType);
  const nextActions = specific.nextActions || common.nextActions || commonNextActions(facts, analysisType);
  const summary = specific.summary || `${facts.name} analysis is ready.`;
  const evidenceRefs = specific.evidenceRefs || common.evidenceRefs || commonEvidenceRefs(facts, analysisType);

  return {
    schemaVersion: 'analysis-runtime-v1',
    analysisType,
    title: `${facts.name} · ${label}`,
    summary,
    verdict: specific.verdict || {
      label: verdictLabel(facts.fitTone),
      tone: facts.fitTone,
      score: facts.fitScore,
      rationale: verdictRationale(facts),
    },
    methodologyRefs: specific.methodologyRefs || common.methodologyRefs || [
      'METHODOLOGY_V17 §2 League-aware analysis',
      'METHODOLOGY_V17 §8 Evidence before recommendation',
      'METHODOLOGY_V18a Tax amendment',
      'METHODOLOGY_V18b Legal amendment',
    ],
    evidenceRefs,
    inputs: specific.inputs || common.inputs || commonInputs(facts),
    assumptions: specific.assumptions || common.assumptions || commonAssumptions(facts, analysisType),
    metrics: specific.metrics || common.metrics || [],
    charts: specific.charts || common.charts || [],
    tables: specific.tables || common.tables || [],
    risks,
    missingData,
    professionalTriggers,
    nextActions,
    yuliaRead: specific.yuliaRead || common.yuliaRead || yuliaRead(facts, analysisType, summary),
      calculations: {
        ...(common.calculations || {}),
        ...(specific.calculations || {}),
        dealId: facts.deal.id,
        dealName: facts.name,
        fitScore: facts.fitScore,
        impliedMultiple: facts.impliedMultiple,
        margin: facts.margin,
      adjustedEarningsCents: facts.adjustedEarningsCents,
    },
  };
}

function commonAnalysisParts(facts: DealFacts, analysisType: string, menuItemSlug?: string | null): Partial<AnalysisOutput> {
  return {
    methodologyRefs: [
      'METHODOLOGY_V17 §2 League-aware analysis',
      'METHODOLOGY_V17 §8 Evidence before recommendation',
      'METHODOLOGY_V17 §11 Interactive canvas',
      'METHODOLOGY_V18a Tax amendment',
      'METHODOLOGY_V18b Legal amendment',
    ],
    inputs: commonInputs(facts),
    evidenceRefs: commonEvidenceRefs(facts, analysisType),
    assumptions: commonAssumptions(facts, analysisType),
    risks: commonRisks(facts),
    missingData: commonMissingData(facts),
    professionalTriggers: commonProfessionalTriggers(facts, analysisType),
    nextActions: commonNextActions(facts, analysisType),
    calculations: { menuItemSlug },
  };
}

function buildDealFacts(deal: DeterministicDealRow, assumptionOverrides?: Record<string, unknown>): DealFacts {
  const overrides = safeFinancials(assumptionOverrides);
  const financials = { ...safeFinancials(deal.financials), ...mapAssumptionOverridesToFinancials(overrides) };
  const league = String(deal.league || financials.league || 'L1').toUpperCase();
  const metric = ['L1', 'L2'].includes(league) ? 'SDE' : 'EBITDA';
  const revenueCents = centsOverride(overrides, 'revenue_cents') ?? centsFrom(deal.revenue);
  const sdeCents = centsOverride(overrides, 'sde_cents') ?? centsFrom(deal.sde);
  const ebitdaCents = centsOverride(overrides, 'ebitda_cents') ?? centsFrom(deal.ebitda);
  const fallbackEarnings = centsOverride(overrides, 'earnings_cents')
    ?? centsFrom(numberFromUnknown(financials.normalized_earnings) ?? numberFromUnknown(financials.earnings));
  const earningsCents = (metric === 'EBITDA' ? ebitdaCents || sdeCents : sdeCents || ebitdaCents) || fallbackEarnings;
  const askingCents = centsOverride(overrides, 'asking_cents')
    || centsFrom(deal.asking_price)
    || centsFrom(numberFromUnknown(financials.asking_price));
  const addBacksCents = addBackTotal(financials);
  const adjustedEarningsCents = centsOverride(overrides, 'adjusted_earnings_cents')
    ?? (earningsCents == null ? null : earningsCents + addBacksCents);
  const defaultMultipleRange = LEAGUE_MULTIPLES[league] || LEAGUE_MULTIPLES.L1;
  const multipleRange = multipleRangeOverride(overrides, defaultMultipleRange);
  const fallbackMultiple = numberFromUnknown(financials.multiple) ?? numberFromUnknown(financials.implied_multiple);
  const impliedMultiple = askingCents && adjustedEarningsCents
    ? askingCents / adjustedEarningsCents
    : fallbackMultiple;
  const margin = adjustedEarningsCents && revenueCents ? adjustedEarningsCents / revenueCents : null;
  const recurringRevenuePct = pctFromUnknown(financials.recurring_revenue_pct);
  const customerConcentrationPct = pctFromUnknown(
    financials.customer_concentration ?? financials.top_customer_pct ?? financials.top_customer_concentration,
  );
  const dealSizeCents = askingCents || (adjustedEarningsCents ? adjustedEarningsCents * ((multipleRange.low + (multipleRange.high ?? multipleRange.low + 4)) / 2) : null);
  const fitScore = scoreDeal({
    revenueCents,
    adjustedEarningsCents,
    impliedMultiple,
    margin,
    multipleRange,
    recurringRevenuePct,
    customerConcentrationPct,
    financials,
  });

  return {
    deal,
    financials,
    name: deal.business_name || `Deal #${deal.id}`,
    league,
    metric,
    revenueCents,
    sdeCents,
    ebitdaCents,
    earningsCents,
    askingCents,
    impliedMultiple,
    margin,
    recurringRevenuePct,
    customerConcentrationPct,
    addBacksCents,
    adjustedEarningsCents,
    dealSizeCents,
    multipleRange,
    fitScore,
    fitTone: scoreTone(fitScore),
  };
}

function commonInputs(facts: DealFacts): AnalysisOutput['inputs'] {
  return [
    { key: 'business_name', label: 'Deal', value: facts.name, displayValue: facts.name, source: 'deal record' },
    { key: 'journey', label: 'Journey', value: facts.deal.journey_type || 'buy', displayValue: String(facts.deal.journey_type || 'buy'), source: 'deal record' },
    { key: 'gate', label: 'Gate', value: facts.deal.current_gate || '—', displayValue: String(facts.deal.current_gate || '—'), source: 'deal record' },
    { key: 'league', label: 'League', value: facts.league, displayValue: facts.league, source: 'deal record' },
    { key: 'industry', label: 'Industry', value: facts.deal.industry || '—', displayValue: String(facts.deal.industry || '—'), source: 'deal record' },
    { key: 'location', label: 'Location', value: facts.deal.location || '—', displayValue: String(facts.deal.location || '—'), source: 'deal record' },
    { key: 'revenue', label: 'Revenue', value: facts.revenueCents, displayValue: fmtMoney(facts.revenueCents), source: 'deal record' },
    { key: 'earnings', label: facts.metric, value: facts.earningsCents, displayValue: fmtMoney(facts.earningsCents), source: 'deal record' },
    { key: 'asking', label: 'Asking price', value: facts.askingCents, displayValue: fmtMoney(facts.askingCents), source: 'deal record' },
  ];
}

function commonEvidenceRefs(facts: DealFacts, analysisType: string): AnalysisOutput['evidenceRefs'] {
  const refs: AnalysisOutput['evidenceRefs'] = [
    {
      label: 'Deal profile',
      type: 'deal_fact',
      source: 'deal record',
      value: `${facts.name} · ${facts.league}`,
      detail: `${facts.deal.journey_type || 'buy'} journey${facts.deal.current_gate ? ` · ${facts.deal.current_gate}` : ''}`,
      confidence: 'high',
    },
    {
      label: 'Financial base',
      type: 'financial_fact',
      source: 'deal financials',
      value: `${fmtMoney(facts.revenueCents)} revenue · ${fmtMoney(facts.earningsCents)} ${facts.metric}`,
      detail: 'Primary sizing facts used before Yulia surfaces a recommendation.',
      confidence: facts.revenueCents && facts.earningsCents ? 'high' : 'medium',
    },
    {
      label: 'Value signal',
      type: 'financial_fact',
      source: 'deal financials',
      value: `${fmtMoney(facts.askingCents)} asking · ${fmtMultiple(facts.impliedMultiple)} implied`,
      detail: `${facts.league} reference range ${fmtRange(facts.multipleRange)}`,
      confidence: facts.askingCents && facts.impliedMultiple ? 'high' : 'medium',
    },
    {
      label: 'Methodology guardrails',
      type: 'methodology',
      source: 'METHODOLOGY_V17, V18a, V18b',
      value: ANALYSIS_LABELS[analysisType] || analysisType,
      detail: 'Yulia surfaces facts and issues; users and licensed professionals make final calls.',
      confidence: 'high',
    },
  ];

  if (facts.deal.industry || facts.deal.location) {
    refs.push({
      label: 'Market context',
      type: 'market_signal',
      source: 'deal profile and market-read snapshot',
      value: [facts.deal.industry, facts.deal.location].filter(Boolean).join(' · '),
      detail: 'Used to frame buyer appetite, financing climate, and sourcing/comps questions.',
      confidence: 'medium',
    });
  }
  if (facts.addBacksCents > 0) {
    refs.push({
      label: 'Recast evidence',
      type: 'financial_fact',
      source: 'financial add-back schedule',
      value: `${fmtMoney(facts.addBacksCents)} add-backs`,
      detail: `Normalized ${facts.metric} becomes ${fmtMoney(facts.adjustedEarningsCents)} before valuation or debt sizing.`,
      confidence: 'medium',
    });
  }
  if (facts.customerConcentrationPct != null) {
    refs.push({
      label: 'Customer concentration',
      type: 'financial_fact',
      source: 'deal financials',
      value: fmtPct(facts.customerConcentrationPct),
      detail: 'Used for buyer-fit, lender appetite, diligence risk, and next-action priority.',
      confidence: 'medium',
    });
  }
  if (facts.recurringRevenuePct != null) {
    refs.push({
      label: 'Recurring revenue',
      type: 'financial_fact',
      source: 'deal financials',
      value: fmtPct(facts.recurringRevenuePct),
      detail: 'Used in market appetite, quality-of-revenue, and fit scoring.',
      confidence: 'medium',
    });
  }
  if (facts.financials.working_capital_peg) {
    refs.push({
      label: 'Working-capital peg',
      type: 'financial_fact',
      source: 'deal financials / diligence schedule',
      value: fmtMoney(centsFrom(numberFromUnknown(facts.financials.working_capital_peg))),
      detail: 'Used for LOI, QoE, covenant, and purchase-agreement issue spotting.',
      confidence: 'medium',
    });
  }

  return refs.slice(0, 9);
}

function commonAssumptions(facts: DealFacts, analysisType: string): AnalysisOutput['assumptions'] {
  const highMultiple = facts.multipleRange.high ?? facts.multipleRange.low + 4;
  const assumptions: AnalysisOutput['assumptions'] = [
    { key: 'adjusted_earnings_cents', label: `Normalized ${facts.metric}`, value: facts.adjustedEarningsCents, displayValue: fmtMoney(facts.adjustedEarningsCents) },
    { key: 'asking_cents', label: 'Deal size / asking', value: facts.askingCents ?? facts.dealSizeCents, displayValue: fmtMoney(facts.askingCents ?? facts.dealSizeCents) },
    { key: 'low_multiple', label: 'Low multiple', value: facts.multipleRange.low, displayValue: fmtMultiple(facts.multipleRange.low) },
    { key: 'high_multiple', label: 'High multiple', value: highMultiple, displayValue: fmtMultiple(highMultiple) },
    { key: 'customer_concentration_pct', label: 'Top-customer concentration', value: facts.customerConcentrationPct, displayValue: fmtPct(facts.customerConcentrationPct) },
  ];

  if (analysisType === 'capital_structure' || analysisType === 'sba' || analysisType === 'lbo' || analysisType === 'covenant') {
      assumptions.push(
        { key: 'senior_debt_pct', label: 'Senior debt', value: pctFromUnknown(facts.financials.senior_debt_pct) ?? (analysisType === 'sba' ? 0.8 : 0.65), displayValue: fmtPct(pctFromUnknown(facts.financials.senior_debt_pct) ?? (analysisType === 'sba' ? 0.8 : 0.65)) },
        { key: 'seller_note_pct', label: 'Seller note', value: pctFromUnknown(facts.financials.seller_note_pct) ?? (analysisType === 'sba' ? 0.1 : 0.15), displayValue: fmtPct(pctFromUnknown(facts.financials.seller_note_pct) ?? (analysisType === 'sba' ? 0.1 : 0.15)) },
        { key: 'interest_rate', label: 'Interest rate', value: pctFromUnknown(facts.financials.interest_rate) ?? (analysisType === 'sba' ? 0.115 : 0.105), displayValue: fmtPct(pctFromUnknown(facts.financials.interest_rate) ?? (analysisType === 'sba' ? 0.115 : 0.105)) },
      );
    }

  if (['valuation', 'dcf', 'lbo', 'sensitivity'].includes(analysisType)) {
    assumptions.push(
      { key: 'revenue_growth_pct', label: 'Revenue growth', value: pctFromUnknown(facts.financials.revenue_growth_pct) ?? 0.04, displayValue: fmtPct(pctFromUnknown(facts.financials.revenue_growth_pct) ?? 0.04) },
      { key: 'ebitda_margin_pct', label: 'EBITDA margin', value: pctFromUnknown(facts.financials.ebitda_margin_pct) ?? facts.margin ?? 0.18, displayValue: fmtPct(pctFromUnknown(facts.financials.ebitda_margin_pct) ?? facts.margin ?? 0.18) },
      { key: 'exit_multiple', label: 'Exit multiple', value: numberFromUnknown(facts.financials.exit_multiple) ?? highMultiple, displayValue: fmtMultiple(numberFromUnknown(facts.financials.exit_multiple) ?? highMultiple) },
      { key: 'wacc_pct', label: 'Discount rate / WACC', value: pctFromUnknown(facts.financials.wacc_pct) ?? 0.14, displayValue: fmtPct(pctFromUnknown(facts.financials.wacc_pct) ?? 0.14) },
    );
  }

  if (analysisType === 'working_capital' || analysisType === 'qoe') {
      assumptions.push(
        { key: 'working_capital_peg', label: 'Working-capital peg', value: centsFrom(numberFromUnknown(facts.financials.working_capital_peg)), displayValue: fmtMoney(centsFrom(numberFromUnknown(facts.financials.working_capital_peg))) },
        { key: 'accounts_receivable', label: 'A/R', value: centsFrom(numberFromUnknown(facts.financials.accounts_receivable)), displayValue: fmtMoney(centsFrom(numberFromUnknown(facts.financials.accounts_receivable))) },
        { key: 'inventory', label: 'Inventory', value: centsFrom(numberFromUnknown(facts.financials.inventory)), displayValue: fmtMoney(centsFrom(numberFromUnknown(facts.financials.inventory))) },
      );
    }

  if (['tax_structure', 'legal_structure', 'tax_legal_structure', 'term_sheet', 'tax_impact', 'purchase_price_allocation', 'earnout'].includes(analysisType)) {
      assumptions.push(
        { key: 'asset_purchase_pct', label: 'Asset-purchase weighting', value: pctFromUnknown(facts.financials.asset_purchase_pct) ?? 0.7, displayValue: fmtPct(pctFromUnknown(facts.financials.asset_purchase_pct) ?? 0.7) },
        { key: 'seller_note_pct', label: 'Seller note', value: pctFromUnknown(facts.financials.seller_note_pct) ?? 0.15, displayValue: fmtPct(pctFromUnknown(facts.financials.seller_note_pct) ?? 0.15) },
        { key: 'earnout_pct', label: 'Earnout / contingent value', value: pctFromUnknown(facts.financials.earnout_pct) ?? 0.05, displayValue: fmtPct(pctFromUnknown(facts.financials.earnout_pct) ?? 0.05) },
        { key: 'goodwill_allocation_pct', label: 'Goodwill allocation', value: pctFromUnknown(facts.financials.goodwill_allocation_pct) ?? 0.55, displayValue: fmtPct(pctFromUnknown(facts.financials.goodwill_allocation_pct) ?? 0.55) },
      { key: 'working_capital_peg', label: 'Working-capital peg', value: centsFrom(numberFromUnknown(facts.financials.working_capital_peg)), displayValue: fmtMoney(centsFrom(numberFromUnknown(facts.financials.working_capital_peg))) },
      );
    }

  if (analysisType === 'cap_table') {
    assumptions.push(
      { key: 'pre_money_cents', label: 'Pre-money value', value: centsFrom(numberFromUnknown(facts.financials.pre_money_cents)) ?? facts.dealSizeCents, displayValue: fmtMoney(centsFrom(numberFromUnknown(facts.financials.pre_money_cents)) ?? facts.dealSizeCents) },
      { key: 'raise_amount_cents', label: 'Raise amount', value: centsFrom(numberFromUnknown(facts.financials.raise_amount_cents)) ?? (facts.dealSizeCents ? facts.dealSizeCents * 0.2 : null), displayValue: fmtMoney(centsFrom(numberFromUnknown(facts.financials.raise_amount_cents)) ?? (facts.dealSizeCents ? facts.dealSizeCents * 0.2 : null)) },
      { key: 'option_pool_pct', label: 'Option pool', value: pctFromUnknown(facts.financials.option_pool_pct) ?? 0.1, displayValue: fmtPct(pctFromUnknown(facts.financials.option_pool_pct) ?? 0.1) },
      { key: 'liquidation_preference_multiple', label: 'Liquidation preference', value: numberFromUnknown(facts.financials.liquidation_preference_multiple) ?? numberFromUnknown(facts.financials.liquidation_preference_pct) ?? 1, displayValue: `${(numberFromUnknown(facts.financials.liquidation_preference_multiple) ?? numberFromUnknown(facts.financials.liquidation_preference_pct) ?? 1).toFixed(1)}x` },
      );
    }

  if (analysisType === 'market_intelligence' || analysisType === 'buyer_fit' || analysisType === 'deal_scorecard') {
    assumptions.push(
      { key: 'recurring_revenue_pct', label: 'Recurring revenue', value: facts.recurringRevenuePct, displayValue: fmtPct(facts.recurringRevenuePct) },
    );
  }

  return assumptions.filter(item => item.displayValue !== '—').slice(0, 12);
  }

function commonRisks(facts: DealFacts): AnalysisOutput['risks'] {
  const risks: AnalysisOutput['risks'] = [];
  if (!facts.revenueCents || !facts.earningsCents) {
    risks.push({ label: 'Incomplete financial base', detail: 'Revenue and primary earnings are required before valuation or financing analysis can be relied on.', severity: 'high', trigger: 'Missing revenue or earnings' });
  }
  if (facts.impliedMultiple && facts.multipleRange.high && facts.impliedMultiple > facts.multipleRange.high) {
    risks.push({ label: 'Price above league range', detail: `Current implied multiple is ${fmtMultiple(facts.impliedMultiple)} against ${facts.league} range ${fmtRange(facts.multipleRange)}.`, severity: 'medium', trigger: 'Valuation gap' });
  }
  if (facts.margin != null && facts.margin < 0.12) {
    risks.push({ label: 'Thin earnings margin', detail: `${facts.metric} margin is ${fmtPct(facts.margin)}, leaving little room for debt service or integration noise.`, severity: 'medium', trigger: 'Margin below 12%' });
  }
  if (facts.customerConcentrationPct != null && facts.customerConcentrationPct >= 0.3) {
    risks.push({ label: 'Customer concentration', detail: `Top-customer concentration appears to be ${fmtPct(facts.customerConcentrationPct)}.`, severity: 'high', trigger: 'Top customer > 30%' });
  }
  if (!facts.financials.working_capital_peg && facts.deal.current_gate && /B4|S4|S5/.test(String(facts.deal.current_gate))) {
    risks.push({ label: 'Working-capital peg unresolved', detail: 'The deal is late enough that peg language should be supported by schedules.', severity: 'medium', trigger: 'Late gate without peg' });
  }
  return risks;
}

function commonMissingData(facts: DealFacts): AnalysisOutput['missingData'] {
  const missing: AnalysisOutput['missingData'] = [];
  if (!facts.revenueCents) missing.push({ label: 'Revenue', why: 'Required to judge size, league, margin, and market context.', priority: 'high' });
  if (!facts.earningsCents) missing.push({ label: facts.metric, why: 'Required for valuation, debt capacity, and fit scoring.', priority: 'high' });
  if (!facts.askingCents) missing.push({ label: 'Asking price', why: 'Required to calculate implied multiple and financing structure.', priority: 'medium' });
  if (facts.customerConcentrationPct == null) missing.push({ label: 'Customer concentration', why: 'Material to buyer fit, risk, and lender appetite.', priority: 'medium' });
  if (!facts.financials.working_capital_peg) missing.push({ label: 'Working-capital peg', why: 'Needed before LOI or purchase-agreement terms become precise.', priority: 'medium' });
  return missing;
}

function commonProfessionalTriggers(facts: DealFacts, analysisType: string): AnalysisOutput['professionalTriggers'] {
    const triggers: AnalysisOutput['professionalTriggers'] = [];
    if (['tax_structure', 'legal_structure', 'tax_legal_structure', 'term_sheet', 'working_capital', 'tax_impact', 'purchase_price_allocation', 'earnout'].includes(analysisType) || (facts.dealSizeCents || 0) > 5_000_000_00) {
      triggers.push({ role: 'M&A attorney', trigger: 'Deal terms, diligence allocation, liability, or executed documents are being shaped.', why: 'Yulia can draft and analyze, but counsel signs off on legal terms.' });
    }
    if (['tax_structure', 'tax_legal_structure', 'tax_impact', 'purchase_price_allocation', 'valuation', 'dcf', 'lbo', 'sensitivity', 'recast', 'qoe', 'working_capital', 'earnout'].includes(analysisType) || facts.addBacksCents > 0) {
      triggers.push({ role: 'CPA / tax counsel', trigger: 'Recast, tax structure, allocation, or installment-sale consequences affect economics.', why: 'Yulia surfaces facts and issues; tax professionals sign off on tax treatment.' });
    }
    if (['sba', 'capital_structure', 'covenant', 'lbo'].includes(analysisType)) {
      triggers.push({ role: 'Lender', trigger: 'Debt sizing, DSCR, collateral, seller standby, and SBA eligibility are in scope.', why: 'Financing feasibility ultimately depends on lender underwriting.' });
    }
  return triggers;
}

function commonNextActions(facts: DealFacts, analysisType: string): AnalysisOutput['nextActions'] {
  return [
    {
      label: 'Ask Yulia for the read',
      actionType: 'chat',
      surfaceActionId: 'ask_yulia',
      prompt: `Explain the ${ANALYSIS_LABELS[analysisType] || analysisType} for ${facts.name}, including the facts, risks, missing data, and the next decision I need to make.`,
    },
    {
      label: 'Request missing evidence',
      actionType: 'request_evidence',
      surfaceActionId: 'request_review',
      prompt: `Create a short evidence request list for ${facts.name} based on this analysis.`,
    },
    {
      label: 'Open deal files',
      actionType: 'open_files',
      surfaceActionId: 'open_files_all',
      fileScope: 'all',
      prompt: `Open the files for ${facts.name} and show where the supporting evidence should live.`,
    },
  ];
}

function inferAutoAnalysisType(deal: DeterministicDealRow): string {
  const gate = String(deal.current_gate || '');
  if (/B4|B5|S4|S5/.test(gate)) return 'capital_structure';
  if (/B2|S2/.test(gate)) return 'valuation';
  return 'deal_scorecard';
}

function scoreDeal(input: {
  revenueCents: number | null;
  adjustedEarningsCents: number | null;
  impliedMultiple: number | null;
  margin: number | null;
  multipleRange: { low: number; high: number | null };
  recurringRevenuePct: number | null;
  customerConcentrationPct: number | null;
  financials: Record<string, unknown>;
}): number {
  let score = 55;
  score += driverFinancialQuality(input) - 12;
  score += driverValueSanity(input) - 12;
  score += driverEvidence(input) - 12;
  score += driverRiskPressure(input) - 12;
  return clamp(Math.round(score), 0, 100);
}

function driverFinancialQuality(facts: Pick<DealFacts, 'margin' | 'recurringRevenuePct'> | { margin: number | null; recurringRevenuePct: number | null }): number {
  let score = 12;
  if (facts.margin != null) score += facts.margin >= 0.25 ? 8 : facts.margin >= 0.18 ? 5 : facts.margin >= 0.12 ? 1 : -4;
  if (facts.recurringRevenuePct != null) score += facts.recurringRevenuePct >= 0.5 ? 5 : facts.recurringRevenuePct >= 0.25 ? 2 : 0;
  return clamp(score, 0, 25);
}

function driverValueSanity(facts: Pick<DealFacts, 'impliedMultiple' | 'multipleRange'> | { impliedMultiple: number | null; multipleRange: { low: number; high: number | null } }): number {
  if (!facts.impliedMultiple) return 10;
  const high = facts.multipleRange.high ?? facts.multipleRange.low + 4;
  if (facts.impliedMultiple >= facts.multipleRange.low && facts.impliedMultiple <= high) return 20;
  if (facts.impliedMultiple < facts.multipleRange.low) return 16;
  if (facts.impliedMultiple <= high + 1) return 12;
  return 6;
}

function driverEvidence(facts: Pick<DealFacts, 'revenueCents' | 'adjustedEarningsCents' | 'askingCents' | 'customerConcentrationPct'> | {
  revenueCents: number | null;
  adjustedEarningsCents: number | null;
  financials?: Record<string, unknown>;
}): number {
  let score = 5;
  if ('revenueCents' in facts && facts.revenueCents) score += 5;
  if ('adjustedEarningsCents' in facts && facts.adjustedEarningsCents) score += 5;
  if ('askingCents' in facts && facts.askingCents) score += 5;
  if ('customerConcentrationPct' in facts && facts.customerConcentrationPct != null) score += 5;
  if ('financials' in facts && facts.financials?.working_capital_peg) score += 3;
  return clamp(score, 0, 25);
}

function driverRiskPressure(facts: Pick<DealFacts, 'customerConcentrationPct' | 'margin'> | { customerConcentrationPct: number | null; margin: number | null }): number {
  let score = 19;
  if (facts.customerConcentrationPct != null) score -= facts.customerConcentrationPct >= 0.35 ? 10 : facts.customerConcentrationPct >= 0.2 ? 4 : 0;
  if (facts.margin != null && facts.margin < 0.12) score -= 5;
  return clamp(score, 0, 25);
}

function evidenceScore(facts: DealFacts): number {
  return Math.round((driverEvidence(facts) / 25) * 100);
}

function financingSignal(facts: DealFacts): number {
  let signal = 50;
  if (facts.margin != null) signal += facts.margin >= 0.22 ? 15 : facts.margin >= 0.14 ? 5 : -10;
  if (facts.impliedMultiple != null && facts.multipleRange.high != null) signal += facts.impliedMultiple <= facts.multipleRange.high ? 10 : -10;
  if ((facts.dealSizeCents || 0) > 15_000_000_00) signal -= 5;
  return clamp(signal, 0, 100);
}

function taxSensitivityScore(facts: DealFacts): number {
  let score = 42;
  if (facts.askingCents) score += 8;
  if (facts.impliedMultiple != null) score += facts.impliedMultiple >= 6 ? 10 : 4;
  if (numberFromUnknown(facts.financials.seller_note_pct)) score += 12;
  if (numberFromUnknown(facts.financials.earnout_pct)) score += 12;
  if ((pctFromUnknown(facts.financials.goodwill_allocation_pct) ?? 0) >= 0.5) score += 8;
  if ((pctFromUnknown(facts.financials.asset_purchase_pct) ?? 0) >= 0.65) score += 6;
  if (/c[-\s]?corp|corporation|stock/i.test(String(facts.financials.entity_type || facts.financials.deal_structure || ''))) score += 12;
  if (facts.deal.location && /ca|california|ny|new york|tx|texas|fl|florida/i.test(facts.deal.location)) score += 4;
  return clamp(score, 0, 100);
}

function legalExecutionScore(facts: DealFacts): number {
  let score = 40;
  if (facts.dealSizeCents && facts.dealSizeCents >= 10_000_000_00) score += 10;
  if (facts.deal.current_gate && /b4|b5|s4|s5|r4|pmi/i.test(facts.deal.current_gate)) score += 12;
  if (numberFromUnknown(facts.financials.dd_days)) score += 8;
  if (numberFromUnknown(facts.financials.exclusivity_days)) score += 8;
  if (facts.customerConcentrationPct != null && facts.customerConcentrationPct >= 0.25) score += 8;
  if (/regulated|health|financial|industrial|franchise|software|security/i.test(`${facts.deal.industry || ''} ${facts.financials.industry_notes || ''}`)) score += 8;
    return clamp(score, 0, 100);
  }

function forecastRows(
  revenueCents: number | null,
  growth: number,
  margin: number,
  taxRate: number,
  capexPct: number,
  workingCapitalInvestmentPct: number,
): Array<{ year: number; revenue: number; ebitda: number; fcf: number }> {
  if (!revenueCents) return [];
  const rows: Array<{ year: number; revenue: number; ebitda: number; fcf: number }> = [];
  for (let year = 1; year <= 5; year += 1) {
    const revenue = revenueCents * Math.pow(1 + growth, year);
    const ebitda = revenue * margin;
    const fcf = ebitda * Math.max(0, 1 - taxRate - capexPct - workingCapitalInvestmentPct);
    rows.push({ year, revenue, ebitda, fcf });
  }
  return rows;
}

function recastRows(facts: DealFacts): Array<Array<string | number | null>> {
  const rows: Array<Array<string | number | null>> = [];
  const add = (label: string, key: string) => {
    const value = centsFrom(numberFromUnknown(facts.financials[key]));
    if (value) rows.push([label, fmtMoney(value), 'Known input']);
  };
  add('Owner compensation adjustment', 'owner_salary');
  add('Non-recurring expense', 'non_recurring_expenses');
  add('Personal expenses', 'personal_expenses');
  add('One-time legal / professional fees', 'one_time_professional_fees');
  if (!rows.length) rows.push(['No supported add-backs yet', '—', 'Request support before crediting adjustments']);
  return rows;
}

function addBackTotal(financials: Record<string, unknown>): number {
  return [
    'owner_salary',
    'non_recurring_expenses',
    'personal_expenses',
    'one_time_professional_fees',
    'family_payroll_adjustment',
  ].reduce((sum, key) => sum + (centsFrom(numberFromUnknown(financials[key])) || 0), 0);
}

function safeFinancials(value: unknown): Record<string, unknown> {
  if (!value) return {};
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {};
    } catch {
      return {};
    }
  }
  return typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function mapAssumptionOverridesToFinancials(overrides: Record<string, unknown>): Record<string, unknown> {
  const financials: Record<string, unknown> = {};
    const moneyKeys = [
      'working_capital_peg',
      'accounts_receivable',
      'inventory',
      'owner_salary',
      'non_recurring_expenses',
      'personal_expenses',
      'one_time_professional_fees',
      'family_payroll_adjustment',
      'pre_money_cents',
      'raise_amount_cents',
    ];
  for (const key of moneyKeys) {
    const value = centsOverride(overrides, key);
    if (value != null) financials[key] = value;
  }

  for (const key of [
    'senior_debt_pct',
    'seller_note_pct',
    'earnout_pct',
    'asset_purchase_pct',
    'goodwill_allocation_pct',
      'interest_rate',
      'revenue_growth_pct',
      'ebitda_margin_pct',
      'tax_rate_pct',
      'capex_pct',
      'working_capital_investment_pct',
      'wacc_pct',
      'terminal_growth_pct',
      'discount_rate_pct',
      'earnout_probability_pct',
      'earnout_revenue_growth_pct',
      'inventory_allocation_pct',
      'equipment_allocation_pct',
      'state_tax_rate_pct',
      'ordinary_income_tax_rate_pct',
      'capital_gains_tax_rate_pct',
      'max_ltv_pct',
      'option_pool_pct',
      'recurring_revenue_pct',
      'customer_concentration_pct',
    ]) {
    const value = pctFromUnknown(overrides[key]);
    if (value != null) financials[key] = value;
    }

  for (const key of [
    'exit_multiple',
    'hold_period_years',
    'min_dscr',
    'max_debt_to_ebitda',
    'earnout_period_months',
    'liquidation_preference_multiple',
  ]) {
    const value = numberFromUnknown(overrides[key]);
    if (value != null) financials[key] = value;
  }

    return financials;
  }

function centsOverride(overrides: Record<string, unknown>, key: string): number | null {
  if (overrides[key] === undefined || overrides[key] === null || overrides[key] === '') return null;
  const raw = overrides[key];
  if (typeof raw === 'number' && Number.isFinite(raw)) return Math.round(raw);
  if (typeof raw !== 'string') return centsFrom(raw);

  const text = raw.trim().toLowerCase().replace(/,/g, '');
  const match = text.match(/-?\d+(?:\.\d+)?/);
  if (!match) return null;
  const n = Number(match[0]);
  if (!Number.isFinite(n)) return null;
  if (text.includes('m')) return Math.round(n * 1_000_000 * 100);
  if (text.includes('k')) return Math.round(n * 1_000 * 100);
  if (text.includes('$')) return Math.round(n * 100);
  return Math.round(n);
}

function multipleRangeOverride(
  overrides: Record<string, unknown>,
  fallback: { low: number; high: number | null },
): { low: number; high: number | null } {
  const range = overrides.league_range;
  let low = numberFromUnknown(overrides.low_multiple) ?? fallback.low;
  let high = numberFromUnknown(overrides.high_multiple) ?? fallback.high;

  if (range && typeof range === 'object' && !Array.isArray(range)) {
    const raw = range as Record<string, unknown>;
    low = numberFromUnknown(raw.low) ?? low;
    high = numberFromUnknown(raw.high) ?? high;
  } else if (typeof range === 'string') {
    const matches = range.match(/-?\d+(?:\.\d+)?/g)?.map(Number).filter(Number.isFinite) ?? [];
    if (matches.length >= 1) low = matches[0];
    if (matches.length >= 2) high = matches[1];
  }

  if (high != null && high < low) high = low;
  return { low, high };
}

function metric(key: string, label: string, value: number | string | null, displayValue: string, sub?: string, tone?: Tone): AnalysisMetric {
  return { key, label, value, displayValue, sub, tone };
}

function centsFrom(value: unknown): number | null {
  const n = numberFromUnknown(value);
  if (!Number.isFinite(n) || n === null || n === 0) return null;
  return Math.round(n);
}

function numberFromUnknown(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[$,%x,\s]/g, '');
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function pctFromUnknown(value: unknown): number | null {
  const n = numberFromUnknown(value);
  if (n == null) return null;
  return n > 1 ? n / 100 : n;
}

function centsToMillions(value: number | null | undefined): number {
  return value ? Number((value / 100 / 1_000_000).toFixed(3)) : 0;
}

function fmtMoney(cents: number | null | undefined): string {
  if (!cents) return '—';
  const dollars = cents / 100;
  if (Math.abs(dollars) >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(2).replace(/\.?0+$/, '')}M`;
  if (Math.abs(dollars) >= 1_000) return `$${Math.round(dollars / 1_000).toLocaleString()}K`;
  return `$${Math.round(dollars).toLocaleString()}`;
}

function fmtMultiple(value: number | null | undefined): string {
  return value == null || !Number.isFinite(value) ? '—' : `${value.toFixed(1)}x`;
}

function fmtPct(value: number | null | undefined): string {
  return value == null || !Number.isFinite(value) ? '—' : `${(value * 100).toFixed(value < 0.1 && value > -0.1 ? 1 : 0)}%`;
}

function fmtDays(value: number | null | undefined): string {
  return value == null || !Number.isFinite(value) ? '—' : `${Math.round(value)} days`;
}

function fmtRange(range: { low: number; high: number | null }): string {
  return range.high ? `${range.low.toFixed(1)}x-${range.high.toFixed(1)}x` : `${range.low.toFixed(1)}x+`;
}

function annualDebtService(principalCents: number | null, annualRate: number, years: number): number | null {
  if (!principalCents || annualRate <= 0 || years <= 0) return null;
  const monthlyRate = annualRate / 12;
  const months = years * 12;
  const monthly = principalCents * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
  return monthly * 12;
}

function scoreTone(score: number): Tone {
  if (score >= 78) return 'pursue';
  if (score >= 60) return 'watch';
  if (score > 0) return 'pass';
  return 'neutral';
}

function signalTone(score: number): Tone {
  if (score >= 70) return 'pursue';
  if (score >= 50) return 'watch';
  return 'pass';
}

function multipleTone(facts: DealFacts): Tone {
  if (!facts.impliedMultiple) return 'neutral';
  const high = facts.multipleRange.high ?? facts.multipleRange.low + 4;
  if (facts.impliedMultiple <= high && facts.impliedMultiple >= facts.multipleRange.low) return 'pursue';
  if (facts.impliedMultiple <= high + 1) return 'watch';
  return 'pass';
}

function marginTone(margin: number | null): Tone {
  if (margin == null) return 'neutral';
  if (margin >= 0.2) return 'pursue';
  if (margin >= 0.12) return 'watch';
  return 'pass';
}

function varianceTone(variance: number | null): Tone {
  if (variance == null) return 'neutral';
  if (variance <= 0.05) return 'pursue';
  if (variance <= 0.2) return 'watch';
  return 'pass';
}

function dscrTone(dscr: number | null): Tone {
  if (dscr == null) return 'neutral';
  if (dscr >= 1.3) return 'pursue';
  if (dscr >= 1.15) return 'watch';
  return 'pass';
}

function verdictLabel(tone: Tone): string {
  if (tone === 'pursue') return 'Pursue';
  if (tone === 'watch') return 'Watch';
  if (tone === 'pass') return 'Do not advance yet';
  return 'Needs facts';
}

function verdictRationale(facts: DealFacts): string {
  if (facts.fitTone === 'pursue') return 'Current facts support continued work, subject to the open diligence and professional-review triggers.';
  if (facts.fitTone === 'watch') return 'There is enough here to keep working, but the next move should clear the named gaps before commitment.';
  return 'The current facts do not support advancing without additional evidence or a changed structure.';
}

function yuliaRead(facts: DealFacts, analysisType: string, summary: string): string {
  return `${summary} I am using deterministic league-aware math for the model and keeping legal, tax, and financing sign-off with the user and professionals. The useful next step is to clear the highest-priority missing data before treating this as a decision-ready view.`;
}

function fitScoreSub(facts: DealFacts): string {
  return `${verdictLabel(facts.fitTone)} · ${facts.league} · ${fmtMultiple(facts.impliedMultiple)} implied`;
}

function evidenceRead(facts: DealFacts): string {
  return `${evidenceScore(facts)}% complete`;
}

function buyerUniverseRead(facts: DealFacts): string {
  const industry = facts.deal.industry || 'this sector';
  if (facts.fitTone === 'pursue') return `${industry} can support strategic and sponsor buyer outreach if diligence stays clean.`;
  if (facts.fitTone === 'watch') return `${industry} may be actionable, but buyer positioning should stay narrow until gaps clear.`;
  return `${industry} needs better proof before broad buyer outreach.`;
}

function financingRead(facts: DealFacts): string {
  const signal = financingSignal(facts);
  if (signal >= 70) return 'Financing read is constructive if the debt package has clean statements and working-cap support.';
  if (signal >= 50) return 'Financing read is workable but structure and seller support matter.';
  return 'Financing read is constrained until earnings, debt service, or price reset.';
}

function sourceGapRead(facts: DealFacts): string {
  const firstMissing = commonMissingData(facts)[0];
  return firstMissing ? `${firstMissing.label}: ${firstMissing.why}` : 'No critical source gap is visible from the current deal facts.';
}

function dealStructure(facts: DealFacts): string {
  return String(facts.financials.deal_structure || facts.financials.structure || 'Asset purchase');
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
