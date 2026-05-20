import { createHash } from 'crypto';
import {
  DEFINITIVE_METHODOLOGY_URI,
  DEFINITIVE_METHODOLOGY_VERSION,
  DEFINITIVE_SPEC_URI,
  DEFINITIVE_SPEC_VERSION,
  definitiveVersionPayload,
} from '../constants/definitive.js';
import { HSR_2026, SBA_SOP_50_10_8 } from '../constants/v19Regulatory.js';
import { resolveDefinitiveMandateContext } from './definitiveMandateService.js';
import { canonicalizeModelId, getRegisteredModel } from './modelRegistry.js';

export type V19ModelStatus = 'complete' | 'needs_inputs';

export interface V19ModelExecutionInput {
  modelId: string;
  input?: Record<string, any>;
  dealId?: number | null;
  userId?: number | null;
  conversationId?: number | null;
}

export interface V19ModelExecution {
  modelId: string;
  version: string;
  status: V19ModelStatus;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  missingInputs: string[];
  citationTags: string[];
  outputHash: string;
  auditPayload: {
    modelId: string;
    version: string;
    specVersion: string;
    specUri: string;
    methodologyVersion: string;
    methodologyUri: string;
    dealId: number | null;
    userId: number | null;
    conversationId: number | null;
    inputHash: string;
    outputHash: string;
    missingInputs: string[];
    executedAt: string;
  };
}

export interface V19ModelExecutionRecord {
  id: number;
  createdAt: string;
}

export interface V19ModelExecutionPersistenceInput {
  studioBookId?: number | null;
  studioVersionId?: number | null;
  toolName?: string | null;
  organizationId?: number | null;
  billingOrgId?: number | null;
  beneficialCustomerId?: number | null;
  mandateId?: string | null;
  agentId?: string | number | null;
  agentPlatformId?: string | null;
  requestedScopes?: string[];
  sourceSurface?: string | null;
}

interface V19ModelDefinition {
  id: string;
  version: string;
  inputSchema: Record<string, any>;
  citationTags: string[];
  run: (input: Record<string, any>) => { outputs: Record<string, any>; missingInputs?: string[] };
}

const MODEL_DEFINITIONS: Record<string, V19ModelDefinition> = {
  'MODEL.VAL.SDE.v1': defineModel('MODEL.VAL.SDE.v1', ['seller_discretionary_earnings_cents'], ['[Pepperdine PCAP 2025]'], input => {
    const sde = cents(input.seller_discretionary_earnings_cents ?? input.sde_cents);
    const addBacks = cents(input.add_backs_cents) ?? 0;
    const ownerComp = cents(input.owner_comp_cents) ?? 0;
    const missing = requireInputs({ seller_discretionary_earnings_cents: sde });
    return {
      missingInputs: missing,
      outputs: missing.length ? {} : { normalized_sde_cents: sde! + addBacks + ownerComp },
    };
  }),
  'MODEL.VAL.EBITDA.v1': defineModel('MODEL.VAL.EBITDA.v1', ['ebitda_cents'], ['[Damodaran 2026]', '[Kroll 2024]'], input => {
    const ebitda = cents(input.ebitda_cents);
    const adjustments = cents(input.adjustments_cents) ?? 0;
    const missing = requireInputs({ ebitda_cents: ebitda });
    return {
      missingInputs: missing,
      outputs: missing.length ? {} : { adjusted_ebitda_cents: ebitda! + adjustments },
    };
  }),
  'MODEL.VAL.TRIANGULATION.v1': defineModel('MODEL.VAL.TRIANGULATION.v1', ['normalized_earnings_cents', 'low_multiple', 'high_multiple'], ['[Damodaran 2026]', '[Pepperdine PCAP 2025]'], input => {
    const earnings = cents(input.normalized_earnings_cents ?? input.adjusted_ebitda_cents ?? input.normalized_sde_cents);
    const lowMultiple = number(input.low_multiple);
    const highMultiple = number(input.high_multiple);
    const missing = requireInputs({ normalized_earnings_cents: earnings, low_multiple: lowMultiple, high_multiple: highMultiple });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const low = Math.round(earnings! * lowMultiple!);
    const high = Math.round(earnings! * highMultiple!);
    return { outputs: { enterprise_value_low_cents: low, enterprise_value_mid_cents: Math.round((low + high) / 2), enterprise_value_high_cents: high } };
  }),
  'MODEL.DSCR.STRESS.v1': defineModel('MODEL.DSCR.STRESS.v1', ['cash_flow_cents', 'annual_debt_service_cents'], ['[SBA SOP 50 10 8]', '[FRED:DPRIME]'], input => {
    const cashFlow = cents(input.cash_flow_cents ?? input.adjusted_ebitda_cents ?? input.normalized_sde_cents);
    const debtService = cents(input.annual_debt_service_cents);
    const missing = requireInputs({ cash_flow_cents: cashFlow, annual_debt_service_cents: debtService });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const scenarios = [0, -0.1, -0.2, -0.3].map(change => {
      const stressedCashFlow = Math.round(cashFlow! * (1 + change));
      return {
        revenue_change_pct: change,
        cash_flow_cents: stressedCashFlow,
        dscr: round(stressedCashFlow / debtService!, 2),
      };
    });
    return { outputs: { base_dscr: scenarios[0].dscr, stressed_cases: scenarios, lender_floor: SBA_SOP_50_10_8.DSCR_LENDER_STD } };
  }),
  'MODEL.STRUCT.NWC.PEG.v1': defineModel('MODEL.STRUCT.NWC.PEG.v1', ['monthly_nwc_cents'], ['[ABA 2025]', '[SRS 2025]'], input => {
    const monthly = arrayOfCents(input.monthly_nwc_cents);
    if (!monthly.length) return { missingInputs: ['monthly_nwc_cents'], outputs: {} };
    const sum = monthly.reduce((acc, value) => acc + value, 0);
    return {
      outputs: {
        peg_cents: Math.round(sum / monthly.length),
        observed_months: monthly.length,
        low_cents: Math.min(...monthly),
        high_cents: Math.max(...monthly),
      },
    };
  }),
  'MODEL.SOURCES.USES.v1': defineModel('MODEL.SOURCES.USES.v1', ['sources_cents', 'uses_cents'], [], input => {
    const sources = sumCents(input.sources_cents);
    const uses = sumCents(input.uses_cents);
    const missing = requireInputs({ sources_cents: sources, uses_cents: uses });
    return {
      missingInputs: missing,
      outputs: missing.length ? {} : { total_sources_cents: sources!, total_uses_cents: uses!, funding_gap_cents: uses! - sources! },
    };
  }),
  'MODEL.LBO.SBA.v1': defineModel('MODEL.LBO.SBA.v1', ['purchase_price_cents', 'cash_flow_cents', 'buyer_equity_cents', 'annual_debt_service_cents'], ['[SBA SOP 50 10 8]', '[FRED:DPRIME]'], input => {
    const purchasePrice = cents(input.purchase_price_cents);
    const cashFlow = cents(input.cash_flow_cents);
    const equity = cents(input.buyer_equity_cents);
    const debtService = cents(input.annual_debt_service_cents);
    const missing = requireInputs({ purchase_price_cents: purchasePrice, cash_flow_cents: cashFlow, buyer_equity_cents: equity, annual_debt_service_cents: debtService });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const equityPct = equity! / purchasePrice!;
    const dscr = cashFlow! / debtService!;
    return {
      outputs: {
        buyer_equity_pct: round(equityPct, 4),
        dscr: round(dscr, 2),
        meets_sba_equity_floor: equityPct >= SBA_SOP_50_10_8.EQUITY_INJECTION_PCT,
        meets_sba_dscr_floor: dscr >= SBA_SOP_50_10_8.DSCR_SBA_FLOOR,
        max_7a_loan_cents: SBA_SOP_50_10_8.LOAN_7A_MAX * 100,
      },
    };
  }),
  'MODEL.HSR.TRIAGE.v1': defineModel('MODEL.HSR.TRIAGE.v1', ['enterprise_value_cents'], ['[FTC 2026 HSR - Size of Transaction]'], input => {
    const enterpriseValue = cents(input.enterprise_value_cents);
    const missing = requireInputs({ enterprise_value_cents: enterpriseValue });
    return {
      missingInputs: missing,
      outputs: missing.length ? {} : {
        size_of_transaction_cents: enterpriseValue,
        threshold_cents: HSR_2026.SIZE_OF_TRANSACTION * 100,
        hsr_size_triggered: enterpriseValue! >= HSR_2026.SIZE_OF_TRANSACTION * 100,
        auto_reportable_cents: HSR_2026.AUTO_REPORTABLE * 100,
      },
    };
  }),
  'MODEL.QOE.LITE.v1': defineModel('MODEL.QOE.LITE.v1', ['financial_facts'], ['[ABA 2025]', '[SRS 2025]'], input => {
    const facts = Array.isArray(input.financial_facts) ? input.financial_facts : [];
    const adjustments = Array.isArray(input.adjustments) ? input.adjustments : [];
    const missing = facts.length ? [] : ['financial_facts'];
    return {
      missingInputs: missing,
      outputs: missing.length ? {} : {
        fact_count: facts.length,
        adjustment_count: adjustments.length,
        unsupported_adjustments: adjustments.filter((item: any) => !item?.source_id && !item?.citation_tag).length,
      },
    };
  }),
  'MODEL.TAX.STRUCTURE.v1': defineModel('MODEL.TAX.STRUCTURE.v1', ['deal_type', 'entity_type', 'purchase_price_cents'], ['[OBBBA Sec. 70301]', '[OBBBA Sec. 70302]', '[OBBBA Sec. 70425]', '[OBBBA Sec. 70505]'], input => {
    const dealType = text(input.deal_type);
    const entityType = text(input.entity_type);
    const purchasePrice = cents(input.purchase_price_cents);
    const rolloverPct = number(input.rollover_pct) ?? 0;
    const taxFacts = safeObject(input.tax_facts);
    const missing = requireInputs({ deal_type: dealType, entity_type: entityType, purchase_price_cents: purchasePrice });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const structure = /stock|equity/i.test(dealType!)
      ? 'stock_or_equity_sale'
      : /asset|338|1060/i.test(dealType!)
        ? 'asset_sale_allocation'
        : 'structure_to_confirm';
    const counselFlags = [
      /c[-\s]?corp/i.test(entityType!) && 'QSBS review if original issuance and holding-period facts exist.',
      rolloverPct > 0 && 'Rollover tax path requires counsel review before external conclusion.',
      taxFacts.international && 'International tax facts require specialist tax review.',
      taxFacts.loss_carryforwards && 'Loss carryforwards may trigger Section 382 review.',
    ].filter(Boolean);
    return {
      outputs: {
        structure,
        purchase_price_cents: purchasePrice,
        rollover_pct: round(rolloverPct, 4),
        bonus_depreciation_pct: 1,
        interest_limitation_basis: 'EBITDA-based ATI per registered V19 tax citation',
        counsel_flags: counselFlags,
        counsel_required: counselFlags.length > 0,
      },
    };
  }),
  'MODEL.LEGAL.HALTSCAN.v1': defineModel('MODEL.LEGAL.HALTSCAN.v1', ['deal_type', 'industry', 'jurisdiction', 'enterprise_value_cents'], ['[FTC 2026 HSR - Size of Transaction]', '[FTC 2026 HSR - Auto-Reportable]'], input => {
    const dealType = text(input.deal_type);
    const industry = text(input.industry);
    const jurisdiction = text(input.jurisdiction);
    const enterpriseValue = cents(input.enterprise_value_cents);
    const legalFacts = safeObject(input.legal_facts);
    const missing = requireInputs({ deal_type: dealType, industry, jurisdiction, enterprise_value_cents: enterpriseValue });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const regulated = /(health|dental|veterinary|insurance|bank|lending|defense|government|utility|cannabis|alcohol|franchise)/i.test(`${industry} ${dealType}`);
    const hsrTriggered = enterpriseValue! >= HSR_2026.SIZE_OF_TRANSACTION * 100;
    const haltTriggers = [
      regulated && 'regulated_industry_or_license_transfer',
      hsrTriggered && 'hsr_size_of_transaction_review',
      legalFacts.foreign_buyer && 'foreign_buyer_cfius_screen',
      legalFacts.consent_required && 'material_contract_consent_required',
      legalFacts.professional_license && 'professional_license_transfer_review',
    ].filter(Boolean);
    return {
      outputs: {
        jurisdiction,
        hsr_size_triggered: hsrTriggered,
        threshold_cents: HSR_2026.SIZE_OF_TRANSACTION * 100,
        halt_triggers: haltTriggers,
        counsel_required: haltTriggers.length > 0,
      },
    };
  }),
  'MODEL.LBO.LMM.v1': defineModel('MODEL.LBO.LMM.v1', ['purchase_price_cents', 'debt_cents', 'sponsor_equity_cents', 'entry_ebitda_cents', 'exit_multiple'], ['[FRED:SOFR]', '[FRED:BAMLH0A0HYM2]'], input => {
    const purchasePrice = cents(input.purchase_price_cents);
    const debt = cents(input.debt_cents);
    const equity = cents(input.sponsor_equity_cents);
    const entryEbitda = cents(input.entry_ebitda_cents);
    const exitMultiple = number(input.exit_multiple);
    const holdYears = number(input.hold_years) ?? 5;
    const ebitdaGrowth = number(input.ebitda_growth_pct) ?? 0;
    const debtPaydown = cents(input.debt_paydown_cents) ?? 0;
    const missing = requireInputs({ purchase_price_cents: purchasePrice, debt_cents: debt, sponsor_equity_cents: equity, entry_ebitda_cents: entryEbitda, exit_multiple: exitMultiple });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const exitEbitda = Math.round(entryEbitda! * ((1 + ebitdaGrowth) ** holdYears));
    const exitEnterpriseValue = Math.round(exitEbitda * exitMultiple!);
    const exitDebt = Math.max(0, debt! - debtPaydown);
    const exitEquity = exitEnterpriseValue - exitDebt;
    const moic = equity! > 0 ? exitEquity / equity! : null;
    return {
      outputs: {
        entry_leverage: round(debt! / entryEbitda!, 2),
        sponsor_equity_pct: round(equity! / purchasePrice!, 4),
        exit_ebitda_cents: exitEbitda,
        exit_enterprise_value_cents: exitEnterpriseValue,
        exit_equity_value_cents: exitEquity,
        moic: moic == null ? null : round(moic, 2),
        simple_irr: moic == null ? null : round((moic ** (1 / holdYears)) - 1, 4),
      },
    };
  }),
  'MODEL.STRUCT.PPA.v1': defineModel('MODEL.STRUCT.PPA.v1', ['purchase_price_cents', 'asset_classes'], ['[OBBBA Sec. 70301]', '[OBBBA Sec. 70302]'], input => {
    const purchasePrice = cents(input.purchase_price_cents);
    const classes = assetClassAllocations(input.asset_classes);
    const missing = requireInputs({ purchase_price_cents: purchasePrice, asset_classes: classes.length ? classes : null });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const allocated = classes.reduce((sum, item) => sum + item.amount_cents, 0);
    return {
      outputs: {
        purchase_price_cents: purchasePrice,
        allocated_cents: allocated,
        unallocated_cents: purchasePrice! - allocated,
        allocation: classes,
        requires_form_8594_consistency_review: true,
      },
    };
  }),
  'MODEL.STRUCT.ROLLOVER.v1': defineModel('MODEL.STRUCT.ROLLOVER.v1', ['rollover_pct', 'entity_type', 'deal_type'], ['[OBBBA Sec. 70505]'], input => {
    const rolloverPct = number(input.rollover_pct);
    const entityType = text(input.entity_type);
    const dealType = text(input.deal_type);
    const missing = requireInputs({ rollover_pct: rolloverPct, entity_type: entityType, deal_type: dealType });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const likelyTaxReview = rolloverPct! > 0 || /stock|equity|partnership|llc/i.test(`${dealType} ${entityType}`);
    return {
      outputs: {
        rollover_pct: round(rolloverPct!, 4),
        rollover_present: rolloverPct! > 0,
        tax_review_required: likelyTaxReview,
        counsel_flags: likelyTaxReview ? ['Confirm rollover security, basis, entity classification, and boot treatment.'] : [],
      },
    };
  }),
  'MODEL.STRUCT.EARNOUT.MC.v1': defineModel('MODEL.STRUCT.EARNOUT.MC.v1', ['earnout_targets', 'probabilities', 'discount_rate'], ['[ABA 2025]', '[SRS 2025]'], input => {
    const targets = arrayOfCents(input.earnout_targets);
    const probabilities = numberArray(input.probabilities);
    const discountRate = number(input.discount_rate);
    const missing = requireInputs({ earnout_targets: targets.length ? targets : null, probabilities: probabilities.length ? probabilities : null, discount_rate: discountRate });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const expectedGross = targets.reduce((sum, target, index) => sum + target * clamp(probabilities[index] ?? 0, 0, 1), 0);
    const termYears = number(input.term_years) ?? 1;
    return {
      outputs: {
        expected_gross_cents: Math.round(expectedGross),
        expected_present_value_cents: Math.round(expectedGross / ((1 + discountRate!) ** termYears)),
        scenarios: targets.map((target, index) => ({ target_cents: target, probability: round(clamp(probabilities[index] ?? 0, 0, 1), 4) })),
      },
    };
  }),
  'MODEL.STRUCT.ANALYSIS.v1': defineModel('MODEL.STRUCT.ANALYSIS.v1', ['deal_type', 'structure_facts'], ['[SBA SOP 50 10 8]', '[FTC 2026 HSR - Size of Transaction]'], input => {
    const dealType = text(input.deal_type);
    const facts = safeObject(input.structure_facts);
    const missing = requireInputs({ deal_type: dealType, structure_facts: Object.keys(facts).length ? facts : null });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const issueMap = [
      facts.sba_financing && { issue: 'SBA financing', action: 'Confirm equity injection, standby seller note, citizenship, and DSCR.' },
      facts.rollover_pct && { issue: 'Seller rollover', action: 'Confirm rollover security, tax path, and governance rights.' },
      facts.asset_sale && { issue: 'Asset sale', action: 'Prepare PPA and Form 8594 consistency review.' },
      facts.enterprise_value_cents && cents(facts.enterprise_value_cents)! >= HSR_2026.SIZE_OF_TRANSACTION * 100 && { issue: 'HSR threshold', action: 'Run HSR triage and counsel review.' },
    ].filter(Boolean);
    return {
      outputs: {
        deal_type: dealType,
        issue_map: issueMap,
        action_count: issueMap.length,
        counsel_required: issueMap.some((item: any) => /tax|HSR|counsel|governance/i.test(`${item.issue} ${item.action}`)),
      },
    };
  }),
  'MODEL.BUYER.FIT.v1': defineModel('MODEL.BUYER.FIT.v1', ['industry', 'location', 'deal_size_cents', 'buyer_thesis', 'operating_needs'], ['[Pepperdine PCAP 2025]'], input => {
    const industry = text(input.industry);
    const location = text(input.location);
    const dealSize = cents(input.deal_size_cents);
    const thesis = text(input.buyer_thesis);
    const operatingNeeds = stringArray(input.operating_needs);
    const buyerCriteria = safeObject(input.buyer_criteria);
    const missing = requireInputs({
      industry,
      location,
      deal_size_cents: dealSize,
      buyer_thesis: thesis,
      operating_needs: operatingNeeds.length ? operatingNeeds : null,
    });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const thesisText = `${thesis} ${buyerCriteria.thesis || ''}`.toLowerCase();
    const strategicFit = thesisText.includes(industry!.toLowerCase()) ? 90 : thesisText.length > 30 ? 72 : 58;
    const geographyFit = thesisText.includes(location!.toLowerCase()) || text(buyerCriteria.location)?.toLowerCase().includes(location!.toLowerCase()) ? 88 : 66;
    const operatingFit = Math.max(45, 86 - operatingNeeds.length * 6);
    const financingFit = scoreFromRange(dealSize!, cents(buyerCriteria.min_deal_size_cents), cents(buyerCriteria.max_deal_size_cents));
    const fitScore = weightedScore([
      [strategicFit, 0.34],
      [geographyFit, 0.18],
      [operatingFit, 0.22],
      [financingFit, 0.26],
    ]);
    return {
      outputs: {
        fit_score: fitScore,
        fit_band: gradeFromScore(fitScore),
        strategic_fit: strategicFit,
        geography_fit: geographyFit,
        operating_fit: operatingFit,
        financing_fit: financingFit,
        risk_flags: operatingNeeds.map(item => `Operating need: ${item}`),
        recommended_next_action: fitScore >= 75 ? 'Prioritize outreach and diligence.' : 'Keep in watch list until fit gaps are resolved.',
      },
    };
  }),
  'MODEL.DEAL.SCORE.v1': defineModel('MODEL.DEAL.SCORE.v1', ['fit_score', 'earnings_quality_score', 'evidence_score', 'risk_score'], ['[Pepperdine PCAP 2025]', '[ABA 2025]'], input => {
    const fit = scoreInput(input.fit_score);
    const earnings = scoreInput(input.earnings_quality_score);
    const evidence = scoreInput(input.evidence_score);
    const risk = scoreInput(input.risk_score);
    const missing = requireInputs({ fit_score: fit, earnings_quality_score: earnings, evidence_score: evidence, risk_score: risk });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const score = weightedScore([
      [fit!, 0.30],
      [earnings!, 0.25],
      [evidence!, 0.25],
      [100 - risk!, 0.20],
    ]);
    return {
      outputs: {
        deal_score: score,
        score_band: gradeFromScore(score),
        pursue_watch_pass: score >= 75 ? 'pursue' : score >= 55 ? 'watch' : 'pass',
        component_scores: { fit, earnings_quality: earnings, evidence, risk },
      },
    };
  }),
  'MODEL.MARKET.CONTEXT.v1': defineModel('MODEL.MARKET.CONTEXT.v1', ['series_ids', 'as_of_date'], ['[FRED:SOFR]', '[FRED:DGS10]', '[FRED:BAMLH0A0HYM2]', '[FRED:BAMLC0A0CM]', '[FRED:VIXCLS]'], input => {
    const seriesIds = stringArray(input.series_ids);
    const asOfDate = text(input.as_of_date);
    const values = safeObject(input.series_values);
    const missing = requireInputs({ series_ids: seriesIds.length ? seriesIds : null, as_of_date: asOfDate });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const snapshots = seriesIds.map(seriesId => ({
      series_id: seriesId,
      value: number(values[seriesId] ?? values[seriesId.toLowerCase()]),
      as_of_date: asOfDate,
      citation_tag: `[FRED:${seriesId}]`,
      status: number(values[seriesId] ?? values[seriesId.toLowerCase()]) == null ? 'missing_value' : 'current',
    }));
    return {
      outputs: {
        as_of_date: asOfDate,
        series_count: seriesIds.length,
        missing_value_series: snapshots.filter(item => item.status === 'missing_value').map(item => item.series_id),
        snapshots,
      },
    };
  }),
  'MODEL.SENSITIVITY.MATRIX.v1': defineModel('MODEL.SENSITIVITY.MATRIX.v1', ['base_case', 'x_axis', 'y_axis', 'output_metric'], [], input => {
    const base = safeObject(input.base_case);
    const xAxis = axisValues(input.x_axis);
    const yAxis = axisValues(input.y_axis);
    const metric = text(input.output_metric);
    const baseValue = number(base.value ?? base.base_value ?? input.base_value);
    const missing = requireInputs({ base_case: baseValue, x_axis: xAxis.length ? xAxis : null, y_axis: yAxis.length ? yAxis : null, output_metric: metric });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const matrix = yAxis.map(y => xAxis.map(x => round(baseValue! * (1 + x) * (1 + y), 2)));
    return {
      outputs: {
        output_metric: metric,
        x_axis: xAxis,
        y_axis: yAxis,
        matrix,
        low_case: Math.min(...matrix.flat()),
        high_case: Math.max(...matrix.flat()),
      },
    };
  }),
  'MODEL.DEAL.COMPARISON.v1': defineModel('MODEL.DEAL.COMPARISON.v1', ['deal_ids', 'comparison_lens', 'assumption_scope'], [], input => {
    const dealIds = stringArray(input.deal_ids);
    const comparisonLens = text(input.comparison_lens);
    const assumptionScope = text(input.assumption_scope) || (Object.keys(safeObject(input.assumption_scope)).length ? JSON.stringify(input.assumption_scope) : null);
    const deals = objectArray(input.deals);
    const missing = requireInputs({ deal_ids: dealIds.length ? dealIds : null, comparison_lens: comparisonLens, assumption_scope: assumptionScope });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const rows = (deals.length ? deals : dealIds.map(id => ({ id } as Record<string, any>))).map((deal: Record<string, any>, index) => {
      const score = scoreInput(deal.score ?? deal.deal_score ?? deal.fit_score) ?? null;
      const price = cents(deal.purchase_price_cents ?? deal.asking_price_cents);
      const earnings = cents(deal.ebitda_cents ?? deal.sde_cents ?? deal.cash_flow_cents);
      return {
        id: String(deal.id ?? deal.deal_id ?? dealIds[index] ?? index + 1),
        name: String(deal.name ?? deal.business_name ?? `Deal ${index + 1}`),
        score,
        purchase_price_cents: price,
        earnings_cents: earnings,
        multiple: price != null && earnings ? round(price / earnings, 2) : null,
      };
    });
    const ranked = [...rows].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    return {
      outputs: {
        comparison_lens: comparisonLens,
        assumption_scope: assumptionScope,
        deal_count: rows.length,
        rows,
        ranked_ids: ranked.map(row => row.id),
        top_deal_id: ranked[0]?.id ?? null,
      },
    };
  }),
  'MODEL.CAPTABLE.DILUTION.v1': defineModel('MODEL.CAPTABLE.DILUTION.v1', ['pre_money_cents', 'round_size_cents', 'option_pool_pct', 'security_terms'], [], input => {
    const preMoney = cents(input.pre_money_cents);
    const roundSize = cents(input.round_size_cents);
    const optionPoolPct = number(input.option_pool_pct);
    const securityTerms = safeObject(input.security_terms);
    const missing = requireInputs({ pre_money_cents: preMoney, round_size_cents: roundSize, option_pool_pct: optionPoolPct, security_terms: Object.keys(securityTerms).length ? securityTerms : null });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const postMoney = preMoney! + roundSize!;
    const investorOwnership = roundSize! / postMoney;
    const optionPoolOwnership = clamp(optionPoolPct!, 0, 1);
    const founderOwnership = Math.max(0, 1 - investorOwnership - optionPoolOwnership);
    return {
      outputs: {
        post_money_cents: postMoney,
        investor_ownership_pct: round(investorOwnership, 4),
        option_pool_pct: round(optionPoolOwnership, 4),
        founder_ownership_pct: round(founderOwnership, 4),
        liquidation_preference_cents: Math.round(roundSize! * (number(securityTerms.liquidation_pref_multiple) ?? 1)),
      },
    };
  }),
  'MODEL.COVENANT.COMPLIANCE.v1': defineModel('MODEL.COVENANT.COMPLIANCE.v1', ['forecast_periods', 'covenant_terms', 'debt_schedule'], ['[FRED:SOFR]', '[FRED:BAMLC0A0CM]'], input => {
    const periods = objectArray(input.forecast_periods);
    const terms = safeObject(input.covenant_terms);
    const debtSchedule = objectArray(input.debt_schedule);
    const missing = requireInputs({ forecast_periods: periods.length ? periods : null, covenant_terms: Object.keys(terms).length ? terms : null, debt_schedule: debtSchedule.length ? debtSchedule : null });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const maxLeverage = number(terms.max_leverage) ?? Infinity;
    const minDscr = number(terms.min_dscr) ?? 0;
    const minLiquidity = cents(terms.min_liquidity_cents) ?? 0;
    const tested = periods.map((period, index) => {
      const ebitda = cents(period.ebitda_cents);
      const debt = cents(period.total_debt_cents ?? debtSchedule[index]?.total_debt_cents);
      const cashFlow = cents(period.cash_flow_cents ?? period.ebitda_cents);
      const debtService = cents(period.debt_service_cents ?? debtSchedule[index]?.debt_service_cents);
      const liquidity = cents(period.liquidity_cents) ?? 0;
      const leverage = ebitda && debt != null ? debt / ebitda : null;
      const dscr = cashFlow && debtService ? cashFlow / debtService : null;
      const breaches = [
        leverage != null && leverage > maxLeverage && 'max_leverage',
        dscr != null && dscr < minDscr && 'min_dscr',
        liquidity < minLiquidity && 'min_liquidity',
      ].filter(Boolean);
      return {
        period: String(period.period ?? index + 1),
        leverage: leverage == null ? null : round(leverage, 2),
        dscr: dscr == null ? null : round(dscr, 2),
        liquidity_cents: liquidity,
        breaches,
      };
    });
    return {
      outputs: {
        status: tested.some(period => period.breaches.length) ? 'breach' : 'compliant',
        breach_count: tested.reduce((sum, period) => sum + period.breaches.length, 0),
        periods: tested,
      },
    };
  }),
  'MODEL.VAL.DCF.TWOSTAGE.v1': defineModel('MODEL.VAL.DCF.TWOSTAGE.v1', ['free_cash_flows_cents', 'discount_rate', 'terminal_growth_rate'], ['[Damodaran 2026]', '[Kroll 2024]'], input => {
    const cashFlows = arrayOfCents(input.free_cash_flows_cents);
    const discountRate = number(input.discount_rate);
    const terminalGrowth = number(input.terminal_growth_rate);
    const missing = requireInputs({ free_cash_flows_cents: cashFlows.length ? cashFlows : null, discount_rate: discountRate, terminal_growth_rate: terminalGrowth });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    if (discountRate! <= terminalGrowth!) return { missingInputs: ['discount_rate_above_terminal_growth_rate'], outputs: {} };
    const pvCashFlows = cashFlows.map((cashFlow, index) => Math.round(cashFlow / ((1 + discountRate!) ** (index + 1))));
    const terminalValue = Math.round(cashFlows[cashFlows.length - 1] * (1 + terminalGrowth!) / (discountRate! - terminalGrowth!));
    const pvTerminalValue = Math.round(terminalValue / ((1 + discountRate!) ** cashFlows.length));
    return {
      outputs: {
        pv_cash_flows_cents: pvCashFlows,
        terminal_value_cents: terminalValue,
        pv_terminal_value_cents: pvTerminalValue,
        enterprise_value_cents: pvCashFlows.reduce((sum, value) => sum + value, 0) + pvTerminalValue,
      },
    };
  }),
  'MODEL.PMI.VALUE.CREATION.v1': defineModel('MODEL.PMI.VALUE.CREATION.v1', ['deal_findings', 'integration_risks', 'value_levers'], [], input => {
    const findings = stringArray(input.deal_findings);
    const risks = stringArray(input.integration_risks);
    const levers = objectArray(input.value_levers);
    const missing = requireInputs({ deal_findings: findings.length ? findings : null, integration_risks: risks.length ? risks : null, value_levers: levers.length ? levers : null });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const leverValue = levers.reduce((sum, lever) => sum + (cents(lever.value_cents) ?? 0), 0);
    return {
      outputs: {
        finding_count: findings.length,
        risk_count: risks.length,
        lever_count: levers.length,
        identified_value_cents: leverValue,
        first_100_day_actions: [
          ...risks.slice(0, 2).map(risk => `Stabilize risk: ${risk}`),
          ...levers.slice(0, 2).map(lever => `Capture lever: ${lever.name || lever.label || 'value lever'}`),
        ],
      },
    };
  }),
  'MODEL.DEALKILL.PROB.v1': defineModel('MODEL.DEALKILL.PROB.v1', ['risk_factors'], [], input => {
    const riskFactors = objectArray(input.risk_factors);
    const missing = requireInputs({ risk_factors: riskFactors.length ? riskFactors : null });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const weightedRisk = riskFactors.reduce((sum, factor) => {
      const severity = scoreInput(factor.severity ?? factor.score) ?? 50;
      const probability = clamp(number(factor.probability) ?? 0.5, 0, 1);
      return sum + severity * probability;
    }, 0) / riskFactors.length;
    return {
      outputs: {
        deal_kill_probability: round(clamp(weightedRisk / 100, 0, 1), 4),
        risk_band: weightedRisk >= 70 ? 'high' : weightedRisk >= 45 ? 'medium' : 'low',
        top_risks: riskFactors
          .map(factor => ({ label: String(factor.label || factor.name || 'Risk'), severity: scoreInput(factor.severity ?? factor.score) ?? 50 }))
          .sort((a, b) => b.severity - a.severity)
          .slice(0, 3),
      },
    };
  }),
  'MODEL.TIMELINE.MC.v1': defineModel('MODEL.TIMELINE.MC.v1', ['milestones'], [], input => {
    const milestones = objectArray(input.milestones);
    const missing = requireInputs({ milestones: milestones.length ? milestones : null });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const rows = milestones.map((milestone, index) => {
      const optimistic = number(milestone.optimistic_days) ?? number(milestone.days) ?? 0;
      const base = number(milestone.base_days) ?? number(milestone.days) ?? optimistic;
      const downside = number(milestone.downside_days) ?? base;
      const expected = (optimistic + (4 * base) + downside) / 6;
      return {
        name: String(milestone.name || milestone.label || `Milestone ${index + 1}`),
        expected_days: round(expected, 1),
      };
    });
    return {
      outputs: {
        expected_days: round(rows.reduce((sum, row) => sum + row.expected_days, 0), 1),
        milestone_count: rows.length,
        milestones: rows,
      },
    };
  }),
};

const GENERIC_MODELS = new Set([
  'MODEL.TAX.STRUCTURE.v1',
  'MODEL.LEGAL.HALTSCAN.v1',
  'MODEL.BUYER.FIT.v1',
  'MODEL.DEAL.SCORE.v1',
  'MODEL.MARKET.CONTEXT.v1',
  'MODEL.SENSITIVITY.MATRIX.v1',
  'MODEL.DEAL.COMPARISON.v1',
  'MODEL.LBO.LMM.v1',
  'MODEL.CAPTABLE.DILUTION.v1',
  'MODEL.STRUCT.EARNOUT.MC.v1',
  'MODEL.COVENANT.COMPLIANCE.v1',
  'MODEL.VAL.DCF.TWOSTAGE.v1',
  'MODEL.PMI.VALUE.CREATION.v1',
  'MODEL.STRUCT.PPA.v1',
  'MODEL.STRUCT.ROLLOVER.v1',
  'MODEL.STRUCT.ANALYSIS.v1',
  'MODEL.DEALKILL.PROB.v1',
  'MODEL.TIMELINE.MC.v1',
]);

export async function executeV19Model(args: V19ModelExecutionInput): Promise<V19ModelExecution> {
  const modelId = canonicalizeModelId(args.modelId);
  const registered = getRegisteredModel(modelId);
  const definition = MODEL_DEFINITIONS[modelId] || genericDefinition(modelId, registered?.citationTags || []);
  if (!definition) {
    throw new Error(`Unknown V19 model: ${args.modelId}`);
  }

  const inputs = sanitizeInputs(args.input || {});
  const run = definition.run(inputs);
  const missingInputs = [...new Set(run.missingInputs || [])];
  const status: V19ModelStatus = missingInputs.length ? 'needs_inputs' : 'complete';
  const outputs = run.outputs || {};
  const versionPins = definitiveVersionPayload();
  const inputHash = hash({ modelId, specVersion: versionPins.specVersion, methodologyVersion: versionPins.methodologyVersion, inputs });
  const outputHash = hash({ modelId, specVersion: versionPins.specVersion, methodologyVersion: versionPins.methodologyVersion, status, outputs, missingInputs });
  const auditPayload = {
    modelId,
    version: definition.version,
    ...versionPins,
    dealId: args.dealId ?? null,
    userId: args.userId ?? null,
    conversationId: args.conversationId ?? null,
    inputHash,
    outputHash,
    missingInputs,
    executedAt: new Date().toISOString(),
  };

  return {
    modelId,
    version: definition.version,
    status,
    inputs,
    outputs,
    missingInputs,
    citationTags: definition.citationTags,
    outputHash,
    auditPayload,
  };
}

export async function persistV19ModelExecution(
  execution: V19ModelExecution,
  context: V19ModelExecutionPersistenceInput = {},
): Promise<V19ModelExecutionRecord> {
  const { sql } = await import('../db.js');
  const mandateContext = execution.auditPayload.userId == null
    ? null
    : await resolveDefinitiveMandateContext({
        userId: execution.auditPayload.userId,
        organizationId: context.organizationId,
        billingOrgId: context.billingOrgId,
        agentId: context.agentId,
        agentPlatformId: context.agentPlatformId,
        mandateId: context.mandateId,
        requestedScopes: context.requestedScopes,
        sourceSurface: context.sourceSurface || context.toolName || 'model_runtime',
      });
  const [row] = await sql`
    INSERT INTO model_executions (
      model_id, version, status, deal_id, user_id, conversation_id, studio_book_id,
      studio_version_id, tool_name, input_hash, output_hash, inputs, outputs,
      missing_inputs, citation_tags, audit_payload, spec_version, spec_uri, methodology_version, methodology_uri,
      beneficial_customer_id, billing_org_id, mandate_id, agent_id, agent_platform_id, mandate_chain
    )
    VALUES (
      ${execution.modelId},
      ${execution.version},
      ${execution.status},
      ${execution.auditPayload.dealId},
      ${execution.auditPayload.userId},
      ${execution.auditPayload.conversationId},
      ${context.studioBookId ?? null},
      ${context.studioVersionId ?? null},
      ${context.toolName ?? null},
      ${execution.auditPayload.inputHash},
      ${execution.outputHash},
      ${sql.json(execution.inputs)}::jsonb,
      ${sql.json(execution.outputs)}::jsonb,
      ${sql.json(execution.missingInputs)}::jsonb,
      ${sql.json(execution.citationTags)}::jsonb,
      ${sql.json(execution.auditPayload)}::jsonb,
      ${DEFINITIVE_SPEC_VERSION},
      ${DEFINITIVE_SPEC_URI},
      ${DEFINITIVE_METHODOLOGY_VERSION},
      ${DEFINITIVE_METHODOLOGY_URI},
      ${context.beneficialCustomerId ?? mandateContext?.beneficialCustomerId ?? null},
      ${context.billingOrgId ?? mandateContext?.billingOrgId ?? null},
      ${context.mandateId ?? mandateContext?.mandateId ?? null},
      ${context.agentId == null ? mandateContext?.agentId ?? null : String(context.agentId)},
      ${context.agentPlatformId ?? mandateContext?.agentPlatformId ?? null},
      ${sql.json(mandateContext?.mandateChain || {})}::jsonb
    )
    RETURNING id, created_at
  `;
  return { id: Number(row.id), createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at) };
}

function defineModel(
  id: string,
  required: string[],
  citationTags: string[],
  run: V19ModelDefinition['run'],
): V19ModelDefinition {
  return {
    id,
    version: 'v1',
    inputSchema: { type: 'object', required },
    citationTags,
    run,
  };
}

function genericDefinition(id: string, citationTags: string[]): V19ModelDefinition | null {
  if (!GENERIC_MODELS.has(id) && !getRegisteredModel(id)) return null;
  return defineModel(id, [], citationTags, input => ({
    outputs: {
      status: 'framework_ready',
      input_keys: Object.keys(input).sort(),
      note: 'Deterministic runner registered. Specific calculations will be added in the Tier-0 model pass.',
    },
  }));
}

function requireInputs(values: Record<string, unknown>): string[] {
  return Object.entries(values)
    .filter(([, value]) => value === null || value === undefined || Number.isNaN(value))
    .map(([key]) => key);
}

function cents(value: unknown): number | null {
  const parsed = number(value);
  return parsed == null ? null : Math.round(parsed);
}

function number(value: unknown): number | null {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function arrayOfCents(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value.map(cents).filter((item): item is number => item !== null);
}

function sumCents(value: unknown): number | null {
  if (Array.isArray(value)) {
    const parsed = arrayOfCents(value);
    return parsed.length ? parsed.reduce((acc, item) => acc + item, 0) : null;
  }
  if (value && typeof value === 'object') {
    const parsed = Object.values(value).map(cents).filter((item): item is number => item !== null);
    return parsed.length ? parsed.reduce((acc, item) => acc + item, 0) : null;
  }
  return cents(value);
}

function text(value: unknown): string | null {
  const normalized = String(value ?? '').trim();
  return normalized ? normalized : null;
}

function safeObject(value: unknown): Record<string, any> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, any> : {};
}

function numberArray(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value.map(number).filter((item): item is number => item !== null);
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    const single = text(value);
    return single ? [single] : [];
  }
  return value.map(text).filter((item): item is string => item !== null);
}

function objectArray(value: unknown): Array<Record<string, any>> {
  return Array.isArray(value)
    ? value.filter((item): item is Record<string, any> => item && typeof item === 'object' && !Array.isArray(item))
    : [];
}

function axisValues(value: unknown): number[] {
  if (Array.isArray(value)) return numberArray(value);
  const axis = safeObject(value);
  return numberArray(axis.values ?? axis.cases ?? axis.points);
}

function scoreInput(value: unknown): number | null {
  const parsed = number(value);
  if (parsed == null) return null;
  return clamp(parsed, 0, 100);
}

function scoreFromRange(value: number, min: number | null, max: number | null): number {
  if (min == null && max == null) return 70;
  if (min != null && value < min) return Math.max(35, 70 - ((min - value) / Math.max(min, 1)) * 60);
  if (max != null && value > max) return Math.max(35, 70 - ((value - max) / Math.max(max, 1)) * 60);
  return 88;
}

function weightedScore(parts: Array<[number, number]>): number {
  const totalWeight = parts.reduce((sum, [, weight]) => sum + weight, 0) || 1;
  return Math.round(parts.reduce((sum, [score, weight]) => sum + clamp(score, 0, 100) * weight, 0) / totalWeight);
}

function gradeFromScore(score: number): 'strong' | 'workable' | 'weak' {
  if (score >= 75) return 'strong';
  if (score >= 55) return 'workable';
  return 'weak';
}

function assetClassAllocations(value: unknown): Array<{ class_name: string; amount_cents: number }> {
  if (Array.isArray(value)) {
    return value
      .map((item, index) => {
        if (item && typeof item === 'object') {
          const amount = cents((item as any).amount_cents ?? (item as any).value_cents ?? (item as any).amount);
          return amount == null ? null : { class_name: String((item as any).class_name || (item as any).name || `Class ${index + 1}`), amount_cents: amount };
        }
        const amount = cents(item);
        return amount == null ? null : { class_name: `Class ${index + 1}`, amount_cents: amount };
      })
      .filter((item): item is { class_name: string; amount_cents: number } => item !== null);
  }
  if (value && typeof value === 'object') {
    return Object.entries(value).map(([className, amount]) => {
      const parsed = cents(amount);
      return parsed == null ? null : { class_name: className, amount_cents: parsed };
    }).filter((item): item is { class_name: string; amount_cents: number } => item !== null);
  }
  return [];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function sanitizeInputs(input: Record<string, any>): Record<string, any> {
  return JSON.parse(JSON.stringify(input ?? {}));
}

function round(value: number, places: number): number {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

function hash(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}
