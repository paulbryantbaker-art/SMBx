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
  inputs: Array<{ key: string; label: string; value: unknown; displayValue: string; source: string }>;
  assumptions: Array<{ key: string; label: string; value: unknown; displayValue: string }>;
  metrics: AnalysisMetric[];
  charts: Array<{ type: 'bar' | 'range' | 'matrix'; title: string; data: Array<Record<string, unknown>> }>;
  tables: Array<{ title: string; columns: string[]; rows: Array<Array<string | number | null>> }>;
  risks: Array<{ label: string; detail: string; severity: Severity; trigger?: string }>;
  missingData: Array<{ label: string; why: string; priority: Priority }>;
  professionalTriggers: Array<{ role: string; trigger: string; why: string }>;
  nextActions: Array<{ label: string; actionType: string; prompt: string }>;
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
  recast: 'Recast analysis',
  market_intelligence: 'Market intelligence',
  sba: 'SBA bankability',
  capital_structure: 'Capital structure',
  red_flags: 'Red flags',
  working_capital: 'Working capital',
  tax_structure: 'Tax structure',
  legal_structure: 'Legal structure',
  tax_legal_structure: 'Tax and legal structure',
  term_sheet: 'Term sheet structure',
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
    case 'recast':
      return buildRecastAnalysis(facts, common);
    case 'capital_structure':
    case 'sba':
      return buildCapitalStructureAnalysis(facts, analysisType, common);
    case 'working_capital':
      return buildWorkingCapitalAnalysis(facts, common);
    case 'market_intelligence':
      return buildMarketIntelligenceAnalysis(facts, common);
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
    case 'buyer_fit':
    case 'deal_scorecard':
    default:
      return buildScorecardAnalysis(facts, analysisType, common);
  }
}

export function buildDealComparisonAnalysis(deals: DeterministicDealRow[], title = 'Deal comparison'): AnalysisOutput {
  const facts = deals.map(buildDealFacts);
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
      { label: 'Open lead deal', actionType: 'open_deal', prompt: `Open ${top?.name || 'the highest-ranked deal'} and show the evidence behind the ranking.` },
      { label: 'Run diligence comparison', actionType: 'run_analysis', prompt: 'Compare diligence gaps, legal issues, tax structure, buyer fit, and financing feasibility for these deals.' },
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
      { label: 'Tax/legal signoff gap', detail: 'The model can spot issues and options; final positions, filings, opinions, and executed instruments belong with licensed professionals.', severity: 'medium' },
    ].slice(0, 6),
    professionalTriggers: [...taxTriggers, ...legalTriggers].slice(0, 6),
    nextActions: [
      { label: 'Model structure scenarios', actionType: 'update_model', prompt: 'Open structure assumptions and model asset vs equity, seller note, earnout, and working-capital outcomes.' },
      { label: 'Route to counsel/CPA', actionType: 'request_review', prompt: 'Prepare a counsel and CPA review package with the tax/legal issue map and files needing sign-off.' },
      { label: 'Open files needing action', actionType: 'open_files', prompt: 'Show the deal files that need review, signature, execution, or professional sign-off.' },
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

function commonAssumptions(facts: DealFacts, analysisType: string): AnalysisOutput['assumptions'] {
  const highMultiple = facts.multipleRange.high ?? facts.multipleRange.low + 4;
  const assumptions: AnalysisOutput['assumptions'] = [
    { key: 'adjusted_earnings_cents', label: `Normalized ${facts.metric}`, value: facts.adjustedEarningsCents, displayValue: fmtMoney(facts.adjustedEarningsCents) },
    { key: 'asking_cents', label: 'Deal size / asking', value: facts.askingCents ?? facts.dealSizeCents, displayValue: fmtMoney(facts.askingCents ?? facts.dealSizeCents) },
    { key: 'low_multiple', label: 'Low multiple', value: facts.multipleRange.low, displayValue: fmtMultiple(facts.multipleRange.low) },
    { key: 'high_multiple', label: 'High multiple', value: highMultiple, displayValue: fmtMultiple(highMultiple) },
    { key: 'customer_concentration_pct', label: 'Top-customer concentration', value: facts.customerConcentrationPct, displayValue: fmtPct(facts.customerConcentrationPct) },
  ];

  if (analysisType === 'capital_structure' || analysisType === 'sba') {
    assumptions.push(
      { key: 'senior_debt_pct', label: 'Senior debt', value: pctFromUnknown(facts.financials.senior_debt_pct) ?? (analysisType === 'sba' ? 0.8 : 0.65), displayValue: fmtPct(pctFromUnknown(facts.financials.senior_debt_pct) ?? (analysisType === 'sba' ? 0.8 : 0.65)) },
      { key: 'seller_note_pct', label: 'Seller note', value: pctFromUnknown(facts.financials.seller_note_pct) ?? (analysisType === 'sba' ? 0.1 : 0.15), displayValue: fmtPct(pctFromUnknown(facts.financials.seller_note_pct) ?? (analysisType === 'sba' ? 0.1 : 0.15)) },
      { key: 'interest_rate', label: 'Interest rate', value: pctFromUnknown(facts.financials.interest_rate) ?? (analysisType === 'sba' ? 0.115 : 0.105), displayValue: fmtPct(pctFromUnknown(facts.financials.interest_rate) ?? (analysisType === 'sba' ? 0.115 : 0.105)) },
    );
  }

  if (analysisType === 'working_capital') {
    assumptions.push(
      { key: 'working_capital_peg', label: 'Working-capital peg', value: centsFrom(numberFromUnknown(facts.financials.working_capital_peg)), displayValue: fmtMoney(centsFrom(numberFromUnknown(facts.financials.working_capital_peg))) },
      { key: 'accounts_receivable', label: 'A/R', value: centsFrom(numberFromUnknown(facts.financials.accounts_receivable)), displayValue: fmtMoney(centsFrom(numberFromUnknown(facts.financials.accounts_receivable))) },
      { key: 'inventory', label: 'Inventory', value: centsFrom(numberFromUnknown(facts.financials.inventory)), displayValue: fmtMoney(centsFrom(numberFromUnknown(facts.financials.inventory))) },
    );
  }

  if (['tax_structure', 'legal_structure', 'tax_legal_structure', 'term_sheet'].includes(analysisType)) {
    assumptions.push(
      { key: 'asset_purchase_pct', label: 'Asset-purchase weighting', value: pctFromUnknown(facts.financials.asset_purchase_pct) ?? 0.7, displayValue: fmtPct(pctFromUnknown(facts.financials.asset_purchase_pct) ?? 0.7) },
      { key: 'seller_note_pct', label: 'Seller note', value: pctFromUnknown(facts.financials.seller_note_pct) ?? 0.15, displayValue: fmtPct(pctFromUnknown(facts.financials.seller_note_pct) ?? 0.15) },
      { key: 'earnout_pct', label: 'Earnout / contingent value', value: pctFromUnknown(facts.financials.earnout_pct) ?? 0.05, displayValue: fmtPct(pctFromUnknown(facts.financials.earnout_pct) ?? 0.05) },
      { key: 'goodwill_allocation_pct', label: 'Goodwill allocation', value: pctFromUnknown(facts.financials.goodwill_allocation_pct) ?? 0.55, displayValue: fmtPct(pctFromUnknown(facts.financials.goodwill_allocation_pct) ?? 0.55) },
      { key: 'working_capital_peg', label: 'Working-capital peg', value: centsFrom(numberFromUnknown(facts.financials.working_capital_peg)), displayValue: fmtMoney(centsFrom(numberFromUnknown(facts.financials.working_capital_peg))) },
    );
  }

  if (analysisType === 'market_intelligence' || analysisType === 'buyer_fit' || analysisType === 'deal_scorecard') {
    assumptions.push(
      { key: 'recurring_revenue_pct', label: 'Recurring revenue', value: facts.recurringRevenuePct, displayValue: fmtPct(facts.recurringRevenuePct) },
    );
  }

  return assumptions.filter(item => item.displayValue !== '—').slice(0, 8);
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
  if (['tax_structure', 'legal_structure', 'tax_legal_structure', 'term_sheet', 'working_capital'].includes(analysisType) || (facts.dealSizeCents || 0) > 5_000_000_00) {
    triggers.push({ role: 'M&A attorney', trigger: 'Deal terms, diligence allocation, liability, or executed documents are being shaped.', why: 'Yulia can draft and analyze, but counsel signs off on legal terms.' });
  }
  if (['tax_structure', 'tax_legal_structure', 'valuation', 'recast', 'working_capital'].includes(analysisType) || facts.addBacksCents > 0) {
    triggers.push({ role: 'CPA / tax counsel', trigger: 'Recast, tax structure, allocation, or installment-sale consequences affect economics.', why: 'Yulia surfaces facts and issues; tax professionals sign off on tax treatment.' });
  }
  if (['sba', 'capital_structure'].includes(analysisType)) {
    triggers.push({ role: 'Lender', trigger: 'Debt sizing, DSCR, collateral, seller standby, and SBA eligibility are in scope.', why: 'Financing feasibility ultimately depends on lender underwriting.' });
  }
  return triggers;
}

function commonNextActions(facts: DealFacts, analysisType: string): AnalysisOutput['nextActions'] {
  return [
    { label: 'Ask Yulia for the read', actionType: 'chat', prompt: `Explain the ${ANALYSIS_LABELS[analysisType] || analysisType} for ${facts.name}, including the facts, risks, missing data, and the next decision I need to make.` },
    { label: 'Request missing evidence', actionType: 'request_evidence', prompt: `Create a short evidence request list for ${facts.name} based on this analysis.` },
    { label: 'Open deal files', actionType: 'open_files', prompt: `Open the files for ${facts.name} and show where the supporting evidence should live.` },
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
  if (facts.location && /ca|california|ny|new york|tx|texas|fl|florida/i.test(facts.location)) score += 4;
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
    'recurring_revenue_pct',
    'customer_concentration_pct',
  ]) {
    const value = pctFromUnknown(overrides[key]);
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
