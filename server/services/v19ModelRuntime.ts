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
  'MODEL.RE.FIRPTA.WITHHOLDING.v1': defineModel('MODEL.RE.FIRPTA.WITHHOLDING.v1', ['amount_realized_cents', 'seller_foreign_person'], ['[IRC 1445]', '[IRS Form 8288]', '[IRS Form 8288-A]'], input => {
    const amountRealized = cents(input.amount_realized_cents);
    const sellerForeign = booleanInput(input.seller_foreign_person);
    const residenceUse = booleanInput(input.buyer_will_use_as_residence) ?? false;
    const missing = requireInputs({ amount_realized_cents: amountRealized, seller_foreign_person: sellerForeign });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    let withholdingRate = 0;
    let path = 'not_foreign_seller';
    if (sellerForeign) {
      if (residenceUse && amountRealized! <= 30000000) {
        withholdingRate = 0;
        path = 'personal_residence_300k_or_less_exemption';
      } else if (residenceUse && amountRealized! <= 100000000) {
        withholdingRate = 0.10;
        path = 'personal_residence_300k_to_1m_reduced_rate';
      } else {
        withholdingRate = 0.15;
        path = 'default_firpta_withholding';
      }
    }
    return {
      outputs: {
        amount_realized_cents: amountRealized,
        seller_foreign_person: sellerForeign,
        buyer_will_use_as_residence: residenceUse,
        withholding_rate: withholdingRate,
        withholding_amount_cents: Math.round(amountRealized! * withholdingRate),
        path,
        forms_due_within_days: sellerForeign && withholdingRate > 0 ? 20 : null,
      },
    };
  }),
  'MODEL.RE.1031.TIMING.v1': defineModel('MODEL.RE.1031.TIMING.v1', ['transfer_date', 'relinquished_property_value_cents', 'replacement_property_value_cents'], ['[IRC 1031]'], input => {
    const transferDate = dateText(input.transfer_date);
    const relinquishedValue = cents(input.relinquished_property_value_cents);
    const replacementValue = cents(input.replacement_property_value_cents);
    const bootReceived = cents(input.boot_received_cents) ?? 0;
    const missing = requireInputs({ transfer_date: transferDate, relinquished_property_value_cents: relinquishedValue, replacement_property_value_cents: replacementValue });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const valueShortfall = Math.max(0, relinquishedValue! - replacementValue!);
    return {
      outputs: {
        transfer_date: transferDate,
        identification_deadline: addDays(transferDate!, 45),
        exchange_deadline: addDays(transferDate!, 180),
        replacement_value_cents: replacementValue,
        relinquished_value_cents: relinquishedValue,
        boot_received_cents: bootReceived,
        value_shortfall_cents: valueShortfall,
        recognized_gain_floor_cents: Math.max(bootReceived, valueShortfall),
      },
    };
  }),
  'MODEL.RE.RENT_ROLL.NORMALIZE.v1': defineModel('MODEL.RE.RENT_ROLL.NORMALIZE.v1', ['rent_roll'], ['[Real Estate Industry Practice]'], input => {
    const rentRoll = objectArray(input.rent_roll);
    const missing = requireInputs({ rent_roll: rentRoll.length ? rentRoll : null });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const asOfDate = dateText(input.as_of_date);
    const rows = rentRoll.map((tenant, index) => {
      const annualRent = cents(tenant.annual_rent_cents ?? tenant.rent_cents ?? tenant.base_rent_cents) ?? 0;
      const area = number(tenant.square_feet) ?? number(tenant.area) ?? null;
      const monthsRemaining = number(tenant.lease_months_remaining) ?? monthsUntil(text(tenant.lease_expiry_date), asOfDate);
      const occupied = booleanInput(tenant.occupied) ?? annualRent > 0;
      return {
        tenant: String(tenant.tenant || tenant.name || `Tenant ${index + 1}`),
        annual_rent_cents: annualRent,
        square_feet: area,
        lease_months_remaining: monthsRemaining,
        occupied,
      };
    });
    const occupiedRows = rows.filter(row => row.occupied);
    const totalRent = rows.reduce((sum, row) => sum + row.annual_rent_cents, 0);
    const occupiedRent = occupiedRows.reduce((sum, row) => sum + row.annual_rent_cents, 0);
    const totalArea = rows.reduce((sum, row) => sum + (row.square_feet ?? 0), 0);
    const occupiedArea = occupiedRows.reduce((sum, row) => sum + (row.square_feet ?? 0), 0);
    const topTenantRent = Math.max(0, ...rows.map(row => row.annual_rent_cents));
    const waltNumerator = occupiedRows.reduce((sum, row) => sum + row.annual_rent_cents * (row.lease_months_remaining ?? 0), 0);
    return {
      outputs: {
        tenant_count: rows.length,
        occupied_tenant_count: occupiedRows.length,
        annual_rent_cents: totalRent,
        occupied_annual_rent_cents: occupiedRent,
        occupancy_pct: rows.length ? round(occupiedRows.length / rows.length, 4) : null,
        area_occupancy_pct: totalArea > 0 ? round(occupiedArea / totalArea, 4) : null,
        walt_months: occupiedRent > 0 ? round(waltNumerator / occupiedRent, 1) : null,
        top_tenant_rent_pct: totalRent > 0 ? round(topTenantRent / totalRent, 4) : null,
        tenant_concentration_flag: totalRent > 0 ? topTenantRent / totalRent > 0.2 : false,
      },
    };
  }),
  'MODEL.RE.CAM.TRUEUP.v1': defineModel('MODEL.RE.CAM.TRUEUP.v1', ['recoverable_expenses_cents'], ['[BOMA]', '[Real Estate Industry Practice]'], input => {
    const recoverableExpenses = cents(input.recoverable_expenses_cents);
    const tenantProRataPct = number(input.tenant_pro_rata_pct)
      ?? proRataFromArea(number(input.tenant_area), number(input.total_area));
    const tenantPayments = cents(input.tenant_payments_cents) ?? 0;
    const closingDay = number(input.closing_day_of_period) ?? 0;
    const periodDays = number(input.period_days) ?? 365;
    const missing = requireInputs({ recoverable_expenses_cents: recoverableExpenses, tenant_pro_rata_pct: tenantProRataPct });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const annualShare = Math.round(recoverableExpenses! * tenantProRataPct!);
    const proratedShare = Math.round(annualShare * clamp(closingDay / periodDays, 0, 1));
    return {
      outputs: {
        recoverable_expenses_cents: recoverableExpenses,
        tenant_pro_rata_pct: round(tenantProRataPct!, 4),
        annual_tenant_share_cents: annualShare,
        prorated_tenant_share_through_closing_cents: proratedShare,
        tenant_payments_cents: tenantPayments,
        closing_true_up_cents: proratedShare - tenantPayments,
      },
    };
  }),
  'MODEL.LEGAL.INDEMNITY.LADDER.v1': defineModel('MODEL.LEGAL.INDEMNITY.LADDER.v1', ['transaction_value_cents'], ['[ABA Private Target Deal Points Study 2023]', '[ABA Model SPA]'], input => {
    const transactionValue = cents(input.transaction_value_cents);
    const rwiPresent = booleanInput(input.rwi_present) ?? false;
    const generalCapPct = number(input.general_cap_pct) ?? (rwiPresent ? 0.005 : 0.105);
    const basketPct = number(input.basket_pct) ?? 0.005;
    const missing = requireInputs({ transaction_value_cents: transactionValue });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    return {
      outputs: {
        transaction_value_cents: transactionValue,
        rwi_present: rwiPresent,
        general_cap_pct: round(generalCapPct, 4),
        general_cap_cents: Math.round(transactionValue! * generalCapPct),
        basket_pct: round(basketPct, 4),
        basket_cents: Math.round(transactionValue! * basketPct),
        basket_type: String(input.basket_type || (rwiPresent ? 'deductible' : 'deductible_or_tipping_to_confirm')),
        fundamental_reps_cap_cents: transactionValue,
        fraud_tax_carveout: 'uncapped_or_counsel_defined',
        materiality_scrape_default: true,
        sandbagging_default: 'silent_or_state_default',
      },
    };
  }),
  'MODEL.LEGAL.ESCROW.HOLDBACK.v1': defineModel('MODEL.LEGAL.ESCROW.HOLDBACK.v1', ['transaction_value_cents'], ['[SRS Acquiom 2024]', '[SRS Acquiom 2025]', '[ABA Private Target Deal Points Study 2023]'], input => {
    const transactionValue = cents(input.transaction_value_cents);
    const rwiPresent = booleanInput(input.rwi_present) ?? false;
    const generalEscrowPct = number(input.general_escrow_pct) ?? (rwiPresent ? 0.005 : 0.10);
    const ppaEscrowPct = number(input.ppa_escrow_pct) ?? 0.01;
    const specialEscrows = arrayOfCents(input.special_escrows_cents);
    const missing = requireInputs({ transaction_value_cents: transactionValue });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const generalEscrow = Math.round(transactionValue! * generalEscrowPct);
    const ppaEscrow = Math.round(transactionValue! * ppaEscrowPct);
    const specialEscrow = specialEscrows.reduce((sum, value) => sum + value, 0);
    return {
      outputs: {
        transaction_value_cents: transactionValue,
        rwi_present: rwiPresent,
        general_escrow_pct: round(generalEscrowPct, 4),
        general_escrow_cents: generalEscrow,
        ppa_escrow_pct: round(ppaEscrowPct, 4),
        ppa_escrow_cents: ppaEscrow,
        special_escrow_cents: specialEscrow,
        aggregate_escrow_cents: generalEscrow + ppaEscrow + specialEscrow,
      },
    };
  }),
  'MODEL.TAX.TRANSACTION.MASTER.v1': defineModel('MODEL.TAX.TRANSACTION.MASTER.v1', ['seller_entity_type', 'deal_form', 'purchase_price_cents'], ['[IRC 1001]', '[IRC 338]', '[IRC 336]', '[IRC 351]', '[IRC 368]', '[IRC 721]', '[IRC 1060]'], input => {
    const sellerEntityType = text(input.seller_entity_type);
    const dealForm = text(input.deal_form);
    const purchasePrice = cents(input.purchase_price_cents);
    const sellerTaxBasis = cents(input.seller_tax_basis_cents) ?? 0;
    const consideration = safeObject(input.consideration_mix);
    const federalRate = number(input.federal_tax_rate) ?? 0;
    const stateRate = number(input.state_tax_rate) ?? 0;
    const sellerStructureTaxDelta = cents(input.seller_structure_tax_delta_cents) ?? 0;
    const missing = requireInputs({ seller_entity_type: sellerEntityType, deal_form: dealForm, purchase_price_cents: purchasePrice });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const cash = cents(consideration.cash_cents) ?? purchasePrice!;
    const note = cents(consideration.seller_note_cents) ?? cents(consideration.note_cents) ?? 0;
    const stock = cents(consideration.stock_cents) ?? 0;
    const earnout = cents(consideration.earnout_cents) ?? 0;
    const rollover = cents(consideration.rollover_cents) ?? 0;
    const taxableConsideration = Math.max(0, cash + note + stock + earnout);
    const combinedRate = clamp(federalRate + stateRate, 0, 1);
    const taxableGain = Math.max(0, taxableConsideration - sellerTaxBasis);
    const dealFormLower = dealForm!.toLowerCase();
    const buyerAssetBasis = /asset|338|336|deemed/.test(dealFormLower) ? purchasePrice : null;
    const firedSubModels = [
      /asset|1060/.test(dealFormLower) && 'M139',
      /338|336|deemed/.test(dealFormLower) && 'M201',
      /reorg|368/.test(dealFormLower) && 'M140',
      rollover > 0 && 'M145',
      (note > 0 || earnout > 0) && 'M204',
      sellerStructureTaxDelta > 0 && 'M201',
      safeObject(input.tax_facts).loss_carryforwards && 'M186',
      safeObject(input.tax_facts).qsbs && 'M101',
      objectArray(input.transaction_costs).length > 0 && 'M203',
    ].filter(Boolean);
    return {
      outputs: {
        seller_entity_type: sellerEntityType,
        deal_form: dealForm,
        total_consideration_cents: purchasePrice,
        taxable_consideration_cents: taxableConsideration,
        deferred_or_rollover_consideration_cents: rollover,
        buyer_asset_basis_cents: buyerAssetBasis,
        seller_tax_basis_cents: sellerTaxBasis,
        seller_taxable_gain_cents: taxableGain,
        combined_seller_tax_rate: round(combinedRate, 4),
        seller_tax_cents: Math.round(taxableGain * combinedRate),
        seller_after_tax_proceeds_cents: taxableConsideration - Math.round(taxableGain * combinedRate) + rollover,
        gross_up_gap_cents: combinedRate < 1 ? Math.round(sellerStructureTaxDelta / (1 - combinedRate)) : null,
        fired_sub_models: firedSubModels,
        professional_review_flags: ['Tax counsel confirms entity classification, elections, state treatment, and facts.'],
      },
    };
  }),
  'MODEL.TAX.GROSSUP.338_336.v1': defineModel('MODEL.TAX.GROSSUP.338_336.v1', ['seller_tax_delta_cents', 'seller_marginal_tax_rate'], ['[IRC 338(h)(10)]', '[IRC 336(e)]', '[Treas. Reg. 1.336-2]'], input => {
    const sellerTaxDelta = cents(input.seller_tax_delta_cents);
    const sellerRate = number(input.seller_marginal_tax_rate);
    const buyerStepUpBenefit = cents(input.buyer_step_up_pv_benefit_cents) ?? 0;
    const dispositionPct = number(input.disposition_pct);
    const dispositionMonths = number(input.disposition_months);
    const missing = requireInputs({ seller_tax_delta_cents: sellerTaxDelta, seller_marginal_tax_rate: sellerRate });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const grossUp = sellerRate! < 1 ? Math.round(sellerTaxDelta! / (1 - sellerRate!)) : null;
    const qualifies336eDispositionWindow = dispositionPct == null || dispositionMonths == null
      ? null
      : dispositionPct >= 0.8 && dispositionMonths <= 12;
    return {
      outputs: {
        seller_tax_delta_cents: sellerTaxDelta,
        seller_marginal_tax_rate: round(sellerRate!, 4),
        breakeven_gross_up_cents: grossUp,
        buyer_step_up_pv_benefit_cents: buyerStepUpBenefit,
        buyer_net_benefit_after_gross_up_cents: grossUp == null ? null : buyerStepUpBenefit - grossUp,
        section_336e_80pct_12mo_test_passed: qualifies336eDispositionWindow,
        election_review_flags: ['Confirm target/shareholder eligibility and election mechanics with tax counsel.'],
      },
    };
  }),
  'MODEL.TAX.BIG.1374.v1': defineModel('MODEL.TAX.BIG.1374.v1', ['fmv_at_conversion_cents', 'basis_at_conversion_cents', 'conversion_date', 'sale_date', 'recognized_gain_cents'], ['[IRC 1374]', '[PATH Act 2015]'], input => {
    const fmvAtConversion = cents(input.fmv_at_conversion_cents);
    const basisAtConversion = cents(input.basis_at_conversion_cents);
    const conversionDate = dateText(input.conversion_date);
    const saleDate = dateText(input.sale_date);
    const recognizedGain = cents(input.recognized_gain_cents);
    const taxableIncomeLimit = cents(input.taxable_income_cents);
    const corporateRate = number(input.corporate_tax_rate) ?? 0.21;
    const missing = requireInputs({
      fmv_at_conversion_cents: fmvAtConversion,
      basis_at_conversion_cents: basisAtConversion,
      conversion_date: conversionDate,
      sale_date: saleDate,
      recognized_gain_cents: recognizedGain,
    });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const years = yearsBetween(conversionDate!, saleDate!);
    const withinRecognitionPeriod = years < 5;
    const nubig = Math.max(0, fmvAtConversion! - basisAtConversion!);
    const taxableLimit = taxableIncomeLimit ?? recognizedGain!;
    const bigBase = withinRecognitionPeriod ? Math.min(nubig, recognizedGain!, taxableLimit) : 0;
    return {
      outputs: {
        net_unrealized_built_in_gain_cents: nubig,
        years_since_conversion: round(years, 2),
        recognition_period_years: 5,
        within_recognition_period: withinRecognitionPeriod,
        recognized_big_tax_base_cents: bigBase,
        corporate_tax_rate: round(corporateRate, 4),
        section_1374_tax_cents: Math.round(bigBase * corporateRate),
        state_nonconformity_review_required: booleanInput(input.state_nonconformity_possible) ?? false,
      },
    };
  }),
  'MODEL.TAX.TRANSACTION_COSTS.v1': defineModel('MODEL.TAX.TRANSACTION_COSTS.v1', ['transaction_costs', 'bright_line_date'], ['[IRC 195]', '[IRC 263]', '[Treas. Reg. 1.263(a)-5]', '[Rev. Proc. 2011-29]', '[INDOPCO]', '[Letter Ruling 202308010]'], input => {
    const transactionCosts = objectArray(input.transaction_costs);
    const brightLineDate = dateText(input.bright_line_date);
    const safeHarborElected = booleanInput(input.rev_proc_2011_29_safe_harbor_elected) ?? true;
    const peOwnedTarget = booleanInput(input.pe_owned_target) ?? false;
    const missing = requireInputs({ transaction_costs: transactionCosts.length ? transactionCosts : null, bright_line_date: brightLineDate });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const rows = transactionCosts.map((cost, index) => {
      const amount = cents(cost.amount_cents ?? cost.value_cents) ?? 0;
      const incurredDate = dateText(cost.incurred_date);
      const successBased = booleanInput(cost.success_based) ?? false;
      const inherentlyFacilitative = booleanInput(cost.inherently_facilitative) ?? false;
      const postBrightLine = incurredDate ? incurredDate >= brightLineDate! : false;
      let classification = 'pre_bright_line_investigatory_195';
      let deductible = 0;
      let capitalized = 0;
      let amortizable195 = amount;
      if (successBased && safeHarborElected) {
        classification = 'success_based_fee_70_30_safe_harbor';
        deductible = Math.round(amount * 0.70);
        capitalized = amount - deductible;
        amortizable195 = 0;
      } else if (inherentlyFacilitative || postBrightLine) {
        classification = inherentlyFacilitative ? 'inherently_facilitative_capitalized' : 'post_bright_line_facilitative_capitalized';
        capitalized = amount;
        amortizable195 = 0;
      }
      return {
        label: String(cost.label || cost.name || `Cost ${index + 1}`),
        amount_cents: amount,
        incurred_date: incurredDate,
        classification,
        deductible_cents: deductible,
        capitalized_cents: capitalized,
        amortizable_195_cents: amortizable195,
      };
    });
    return {
      outputs: {
        cost_count: rows.length,
        deductible_cents: rows.reduce((sum, row) => sum + row.deductible_cents, 0),
        capitalized_cents: rows.reduce((sum, row) => sum + row.capitalized_cents, 0),
        amortizable_195_cents: rows.reduce((sum, row) => sum + row.amortizable_195_cents, 0),
        pe_owned_target_success_fee_risk_flag: peOwnedTarget && rows.some(row => row.classification === 'success_based_fee_70_30_safe_harbor'),
        rows,
      },
    };
  }),
  'MODEL.TAX.IMPUTED_INTEREST_OID.v1': defineModel('MODEL.TAX.IMPUTED_INTEREST_OID.v1', ['principal_cents', 'stated_interest_rate', 'afr_rate', 'term_months'], ['[IRC 483]', '[IRC 1274]', '[IRC 1274A]', '[IRC 453A]'], input => {
    const principal = cents(input.principal_cents);
    const statedRate = number(input.stated_interest_rate);
    const afrRate = number(input.afr_rate);
    const termMonths = number(input.term_months);
    const installmentReceivable = cents(input.installment_receivable_cents) ?? 0;
    const threshold = cents(input.installment_receivable_threshold_cents) ?? 500000000;
    const missing = requireInputs({ principal_cents: principal, stated_interest_rate: statedRate, afr_rate: afrRate, term_months: termMonths });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const imputedRate = Math.max(0, afrRate! - statedRate!);
    const imputedInterest = Math.round(principal! * imputedRate * (termMonths! / 12));
    const section = termMonths! > 12 ? 'section_483_or_1274_review' : 'adequate_stated_interest_short_term_check';
    return {
      outputs: {
        principal_cents: principal,
        stated_interest_rate: round(statedRate!, 4),
        afr_rate: round(afrRate!, 4),
        imputed_rate_delta: round(imputedRate, 4),
        imputed_interest_cents: imputedInterest,
        oid_floor_cents: imputedInterest,
        characterization: section,
        installment_453a_threshold_cents: threshold,
        installment_receivable_cents: installmentReceivable,
        section_453a_applies: installmentReceivable > threshold,
        section_453a_excess_receivable_cents: Math.max(0, installmentReceivable - threshold),
      },
    };
  }),
  'MODEL.LEGAL.SURVIVAL.PERIODS.v1': defineModel('MODEL.LEGAL.SURVIVAL.PERIODS.v1', ['closing_date'], ['[SRS Acquiom 2024]', '[SRS Acquiom 2025]', '[ABA Private Target Deal Points Study 2023]'], input => {
    const closingDate = dateText(input.closing_date);
    const rwiPresent = booleanInput(input.rwi_present) ?? false;
    const generalMonths = number(input.general_reps_months) ?? (rwiPresent ? 0 : 12);
    const fundamentalYears = number(input.fundamental_reps_years) ?? 6;
    const taxYears = number(input.tax_reps_years) ?? 6;
    const fraudCarveout = booleanInput(input.fraud_carveout) ?? true;
    const missing = requireInputs({ closing_date: closingDate });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    return {
      outputs: {
        closing_date: closingDate,
        rwi_present: rwiPresent,
        general_reps_months: generalMonths,
        general_reps_expiry: generalMonths > 0 ? addMonths(closingDate!, generalMonths) : null,
        fundamental_reps_years: fundamentalYears,
        fundamental_reps_expiry: addMonths(closingDate!, fundamentalYears * 12),
        tax_reps_years: taxYears,
        tax_reps_expiry: addMonths(closingDate!, taxYears * 12),
        fraud_carveout_from_exclusive_remedy: fraudCarveout,
        counsel_review_flags: ['Confirm governing-law statute of limitations, fraud definition, and RWI policy interaction.'],
      },
    };
  }),
  'MODEL.LEGAL.CLOSING_TRUEUP.SEQUENCE.v1': defineModel('MODEL.LEGAL.CLOSING_TRUEUP.SEQUENCE.v1', ['closing_date', 'peg_cents', 'actual_nwc_cents'], ['[SRS Acquiom Working Capital PPA Study]', '[ABA Private Target Deal Points Study 2023]'], input => {
    const closingDate = dateText(input.closing_date);
    const peg = cents(input.peg_cents);
    const actualNwc = cents(input.actual_nwc_cents);
    const estimatedNwc = cents(input.estimated_nwc_cents);
    const statementDays = number(input.actual_statement_due_days) ?? 90;
    const disputeDays = number(input.dispute_notice_days) ?? 30;
    const negotiationDays = number(input.good_faith_negotiation_days) ?? 30;
    const missing = requireInputs({ closing_date: closingDate, peg_cents: peg, actual_nwc_cents: actualNwc });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const actualAdjustment = actualNwc! - peg!;
    return {
      outputs: {
        closing_date: closingDate,
        peg_cents: peg,
        estimated_nwc_cents: estimatedNwc,
        actual_nwc_cents: actualNwc,
        estimated_adjustment_cents: estimatedNwc == null ? null : estimatedNwc - peg!,
        final_purchase_price_adjustment_cents: actualAdjustment,
        buyer_receivable_cents: Math.max(0, -actualAdjustment),
        seller_receivable_cents: Math.max(0, actualAdjustment),
        actual_statement_due_date: addDays(closingDate!, statementDays),
        dispute_notice_due_date: addDays(addDays(closingDate!, statementDays), disputeDays),
        good_faith_negotiation_end_date: addDays(addDays(addDays(closingDate!, statementDays), disputeDays), negotiationDays),
      },
    };
  }),
  'MODEL.LEGAL.CONDITIONS.LOGIC.v1': defineModel('MODEL.LEGAL.CONDITIONS.LOGIC.v1', ['conditions'], ['[ABA Model SPA]', '[HSR Act]', '[CFIUS regulations]'], input => {
    const conditions = objectArray(input.conditions);
    const missing = requireInputs({ conditions: conditions.length ? conditions : null });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const nodes = conditions.map((condition, index) => {
      const satisfied = booleanInput(condition.satisfied) ?? false;
      const waived = booleanInput(condition.waived) ?? false;
      const type = String(condition.type || condition.category || 'general');
      return {
        name: String(condition.name || condition.label || `Condition ${index + 1}`),
        type,
        satisfied,
        waived,
        blocks_closing: !(satisfied || waived),
        professional_review_required: /regulatory|legal|counsel|mae|financing|consent|cfius|hsr/i.test(type),
      };
    });
    return {
      outputs: {
        condition_count: nodes.length,
        satisfied_count: nodes.filter(node => node.satisfied).length,
        waived_count: nodes.filter(node => node.waived).length,
        open_condition_count: nodes.filter(node => node.blocks_closing).length,
        closing_ready: nodes.every(node => !node.blocks_closing),
        professional_review_required: nodes.some(node => node.professional_review_required),
        open_conditions: nodes.filter(node => node.blocks_closing).map(node => node.name),
        condition_nodes: nodes,
      },
    };
  }),
  'MODEL.LEGAL.TERMINATION.FEES.v1': defineModel('MODEL.LEGAL.TERMINATION.FEES.v1', ['transaction_value_cents'], ['[Houlihan Lokey 2023 Transaction Termination Fee Study]', '[Fenwick 2023 ARBF analysis]', '[Brazen v. Bell Atlantic]', '[In re Topps]'], input => {
    const transactionValue = cents(input.transaction_value_cents);
    const targetFeePct = number(input.target_break_fee_pct) ?? 0.027;
    const reverseFeePct = number(input.reverse_termination_fee_pct) ?? 0.042;
    const antitrustFeePct = number(input.antitrust_reverse_fee_pct) ?? 0.05;
    const goShopDiscountPct = number(input.go_shop_discount_pct) ?? 0.5;
    const missing = requireInputs({ transaction_value_cents: transactionValue });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const targetFee = Math.round(transactionValue! * targetFeePct);
    return {
      outputs: {
        transaction_value_cents: transactionValue,
        target_break_fee_pct: round(targetFeePct, 4),
        target_break_fee_cents: targetFee,
        go_shop_break_fee_cents: Math.round(targetFee * goShopDiscountPct),
        reverse_termination_fee_pct: round(reverseFeePct, 4),
        reverse_termination_fee_cents: Math.round(transactionValue! * reverseFeePct),
        antitrust_reverse_fee_pct: round(antitrustFeePct, 4),
        antitrust_reverse_fee_cents: Math.round(transactionValue! * antitrustFeePct),
        counsel_review_flags: ['Confirm fiduciary-out, go-shop/no-shop, regulatory covenant, and enforceability framing with counsel.'],
      },
    };
  }),
  'MODEL.TAX.1060.ALLOCATION.v1': defineModel('MODEL.TAX.1060.ALLOCATION.v1', ['purchase_price_cents', 'asset_classes'], ['[IRC 1060]', '[Treas. Reg. 1.1060-1]', '[IRS Form 8594]'], input => {
    const purchasePrice = cents(input.purchase_price_cents);
    const rows = objectArray(input.asset_classes);
    const missing = requireInputs({ purchase_price_cents: purchasePrice, asset_classes: rows.length ? rows : null });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    let remaining = purchasePrice!;
    const sorted = rows.map((row, index) => ({
      class_number: assetClassNumber(row.class_number ?? row.class ?? row.class_name),
      class_name: String(row.class_name || row.name || row.class || `Class ${index + 1}`),
      fair_market_value_cents: cents(row.fair_market_value_cents ?? row.fmv_cents ?? row.value_cents ?? row.amount_cents) ?? 0,
    })).sort((a, b) => a.class_number - b.class_number);
    const allocations = sorted.map(row => {
      const allocation = row.class_number >= 7 ? Math.max(0, remaining) : Math.min(Math.max(0, remaining), row.fair_market_value_cents);
      remaining -= allocation;
      return {
        ...row,
        allocated_cents: allocation,
        capped_at_fmv: row.class_number < 7,
      };
    });
    return {
      outputs: {
        purchase_price_cents: purchasePrice,
        allocated_cents: allocations.reduce((sum, row) => sum + row.allocated_cents, 0),
        unallocated_cents: Math.max(0, remaining),
        class_v_tangible_cents: allocations.filter(row => row.class_number === 5).reduce((sum, row) => sum + row.allocated_cents, 0),
        class_vi_section_197_intangibles_cents: allocations.filter(row => row.class_number === 6).reduce((sum, row) => sum + row.allocated_cents, 0),
        class_vii_goodwill_cents: allocations.filter(row => row.class_number === 7).reduce((sum, row) => sum + row.allocated_cents, 0),
        allocations,
      },
    };
  }),
  'MODEL.RE.SALE_LEASEBACK.ASC842.v1': defineModel('MODEL.RE.SALE_LEASEBACK.ASC842.v1', ['sale_price_cents', 'annual_rent_cents', 'lease_term_years'], ['[ASC 842]', '[Real Estate Industry Practice]'], input => {
    const salePrice = cents(input.sale_price_cents);
    const annualRent = cents(input.annual_rent_cents);
    const leaseTermYears = number(input.lease_term_years);
    const economicLifeYears = number(input.economic_life_years);
    const pvLeasePayments = cents(input.pv_lease_payments_cents);
    const transfersOwnership = booleanInput(input.transfers_ownership) ?? false;
    const bargainPurchase = booleanInput(input.bargain_purchase_option) ?? false;
    const specializedAsset = booleanInput(input.specialized_asset) ?? false;
    const missing = requireInputs({ sale_price_cents: salePrice, annual_rent_cents: annualRent, lease_term_years: leaseTermYears });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const leaseTermPct = economicLifeYears && economicLifeYears > 0 ? leaseTermYears! / economicLifeYears : null;
    const pvPct = pvLeasePayments != null && salePrice! > 0 ? pvLeasePayments / salePrice! : null;
    const financeIndicators = [
      transfersOwnership && 'transfers_ownership',
      bargainPurchase && 'bargain_purchase_option',
      leaseTermPct != null && leaseTermPct >= 0.75 && 'lease_term_substantially_all_economic_life',
      pvPct != null && pvPct >= 0.90 && 'pv_payments_substantially_all_fair_value',
      specializedAsset && 'specialized_asset',
    ].filter(Boolean);
    return {
      outputs: {
        sale_price_cents: salePrice,
        annual_rent_cents: annualRent,
        cap_rate: round(annualRent! / salePrice!, 4),
        lease_term_years: leaseTermYears,
        total_nominal_rent_cents: Math.round(annualRent! * leaseTermYears!),
        lease_term_pct_of_economic_life: leaseTermPct == null ? null : round(leaseTermPct, 4),
        pv_payments_pct_of_fair_value: pvPct == null ? null : round(pvPct, 4),
        asc842_indicator_classification: financeIndicators.length ? 'finance_lease_indicator_present' : 'operating_lease_indicator_on_supplied_facts',
        finance_lease_indicators: financeIndicators,
        accounting_review_flags: ['ASC 842 sale accounting and lease classification require accountant review on the final facts.'],
      },
    };
  }),
  'MODEL.RE.REIT.COMPLIANCE.v1': defineModel('MODEL.RE.REIT.COMPLIANCE.v1', ['real_estate_income_cents', 'total_income_cents', 'real_estate_assets_cents', 'total_assets_cents', 'distributions_cents', 'taxable_income_cents'], ['[IRC 856]', '[IRC 857]', '[IRC 858]', '[IRC 859]', '[IRC 860]'], input => {
    const realEstateIncome = cents(input.real_estate_income_cents);
    const totalIncome = cents(input.total_income_cents);
    const realEstateAssets = cents(input.real_estate_assets_cents);
    const totalAssets = cents(input.total_assets_cents);
    const distributions = cents(input.distributions_cents);
    const taxableIncome = cents(input.taxable_income_cents);
    const missing = requireInputs({
      real_estate_income_cents: realEstateIncome,
      total_income_cents: totalIncome,
      real_estate_assets_cents: realEstateAssets,
      total_assets_cents: totalAssets,
      distributions_cents: distributions,
      taxable_income_cents: taxableIncome,
    });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const incomePct = totalIncome! > 0 ? realEstateIncome! / totalIncome! : 0;
    const assetPct = totalAssets! > 0 ? realEstateAssets! / totalAssets! : 0;
    const distributionPct = taxableIncome! > 0 ? distributions! / taxableIncome! : 0;
    return {
      outputs: {
        income_75_pct: round(incomePct, 4),
        income_75_test_passed: incomePct >= 0.75,
        asset_75_pct: round(assetPct, 4),
        asset_75_test_passed: assetPct >= 0.75,
        distribution_90_pct: round(distributionPct, 4),
        distribution_90_test_passed: distributionPct >= 0.90,
        all_tests_passed: incomePct >= 0.75 && assetPct >= 0.75 && distributionPct >= 0.90,
      },
    };
  }),
  'MODEL.FINANCE.CONVERTIBLE_SAFE.v1': defineModel('MODEL.FINANCE.CONVERTIBLE_SAFE.v1', ['investment_cents', 'priced_round_share_price_cents'], ['[YC SAFE]', '[Convertible Financing Market Practice]'], input => {
    const investment = cents(input.investment_cents);
    const sharePrice = cents(input.priced_round_share_price_cents);
    const valuationCap = cents(input.valuation_cap_cents);
    const preMoneyShares = number(input.pre_money_share_count);
    const discountPct = number(input.discount_pct) ?? 0;
    const missing = requireInputs({ investment_cents: investment, priced_round_share_price_cents: sharePrice });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const discountPrice = Math.round(sharePrice! * (1 - clamp(discountPct, 0, 1)));
    const capPrice = valuationCap != null && preMoneyShares && preMoneyShares > 0 ? Math.round(valuationCap / preMoneyShares) : null;
    const candidates = [sharePrice!, discountPrice, capPrice].filter((value): value is number => value != null && value > 0);
    const conversionPrice = Math.min(...candidates);
    return {
      outputs: {
        investment_cents: investment,
        priced_round_share_price_cents: sharePrice,
        discount_pct: round(discountPct, 4),
        discount_price_cents: discountPrice,
        valuation_cap_cents: valuationCap,
        cap_price_cents: capPrice,
        conversion_price_cents: conversionPrice,
        converted_share_count: round(investment! / conversionPrice, 4),
        conversion_driver: capPrice != null && capPrice === conversionPrice ? 'valuation_cap' : discountPrice === conversionPrice ? 'discount' : 'priced_round_price',
      },
    };
  }),
  'MODEL.FINANCE.ABL.BORROWING_BASE.v1': defineModel('MODEL.FINANCE.ABL.BORROWING_BASE.v1', ['eligible_ar_cents', 'eligible_inventory_cents'], ['[ABL Market Practice]'], input => {
    const eligibleAr = cents(input.eligible_ar_cents);
    const eligibleInventory = cents(input.eligible_inventory_cents);
    const arAdvanceRate = number(input.ar_advance_rate) ?? 0.85;
    const inventoryAdvanceRate = number(input.inventory_advance_rate) ?? 0.50;
    const reserves = cents(input.reserves_cents) ?? 0;
    const commitment = cents(input.commitment_cents);
    const missing = requireInputs({ eligible_ar_cents: eligibleAr, eligible_inventory_cents: eligibleInventory });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const grossBase = Math.round(eligibleAr! * arAdvanceRate) + Math.round(eligibleInventory! * inventoryAdvanceRate);
    const netBase = Math.max(0, grossBase - reserves);
    return {
      outputs: {
        eligible_ar_cents: eligibleAr,
        eligible_inventory_cents: eligibleInventory,
        ar_advance_rate: round(arAdvanceRate, 4),
        inventory_advance_rate: round(inventoryAdvanceRate, 4),
        gross_borrowing_base_cents: grossBase,
        reserves_cents: reserves,
        net_borrowing_base_cents: netBase,
        availability_cents: commitment == null ? netBase : Math.min(netBase, commitment),
      },
    };
  }),
  'MODEL.FINANCE.MAKE_WHOLE_CALL.v1': defineModel('MODEL.FINANCE.MAKE_WHOLE_CALL.v1', ['principal_cents', 'coupon_rate', 'treasury_rate', 'spread_bps', 'remaining_years'], ['[Indenture Practice]'], input => {
    const principal = cents(input.principal_cents);
    const couponRate = number(input.coupon_rate);
    const treasuryRate = number(input.treasury_rate);
    const spreadBps = number(input.spread_bps);
    const remainingYears = number(input.remaining_years);
    const callPricePct = number(input.call_price_pct) ?? 1;
    const missing = requireInputs({ principal_cents: principal, coupon_rate: couponRate, treasury_rate: treasuryRate, spread_bps: spreadBps, remaining_years: remainingYears });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const discountRate = treasuryRate! + (spreadBps! / 10000);
    let pvCoupons = 0;
    const fullYears = Math.ceil(remainingYears!);
    for (let year = 1; year <= fullYears; year += 1) {
      const period = Math.min(year, remainingYears!);
      const periodCoupon = Math.round(principal! * couponRate! * (year <= remainingYears! ? 1 : remainingYears! - Math.floor(remainingYears!)));
      pvCoupons += periodCoupon / ((1 + discountRate) ** period);
    }
    const pvPrincipal = principal! / ((1 + discountRate) ** remainingYears!);
    const makeWholePrice = Math.max(principal!, Math.round(pvCoupons + pvPrincipal));
    return {
      outputs: {
        principal_cents: principal,
        coupon_rate: round(couponRate!, 4),
        treasury_rate: round(treasuryRate!, 4),
        spread_bps: spreadBps,
        make_whole_discount_rate: round(discountRate, 4),
        make_whole_price_cents: makeWholePrice,
        make_whole_premium_cents: Math.max(0, makeWholePrice - principal!),
        stated_call_price_cents: Math.round(principal! * callPricePct),
        lower_cost_redemption_path: makeWholePrice <= Math.round(principal! * callPricePct) ? 'make_whole' : 'stated_call',
      },
    };
  }),
  'MODEL.FINANCE.COVENANT_BASKETS.v1': defineModel('MODEL.FINANCE.COVENANT_BASKETS.v1', ['baskets'], ['[LSTA Model Provisions]', '[Credit Agreement Market Practice]'], input => {
    const baskets = objectArray(input.baskets);
    const missing = requireInputs({ baskets: baskets.length ? baskets : null });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const rows = baskets.map((basket, index) => {
      const fixed = cents(basket.fixed_capacity_cents ?? basket.opening_capacity_cents) ?? 0;
      const growerBasis = cents(basket.grower_basis_cents) ?? 0;
      const growerPct = number(basket.grower_pct) ?? 0;
      const builder = cents(basket.builder_amount_cents) ?? 0;
      const ratioCapacity = cents(basket.ratio_capacity_cents) ?? 0;
      const used = cents(basket.used_cents) ?? 0;
      const proposedUse = cents(basket.proposed_use_cents) ?? 0;
      const totalCapacity = fixed + Math.round(growerBasis * growerPct) + builder + ratioCapacity;
      const remaining = totalCapacity - used;
      return {
        name: String(basket.name || basket.label || `Basket ${index + 1}`),
        basket_type: String(basket.type || 'general'),
        total_capacity_cents: totalCapacity,
        used_cents: used,
        remaining_capacity_cents: remaining,
        proposed_use_cents: proposedUse,
        proposed_use_fits: proposedUse <= remaining,
      };
    });
    return {
      outputs: {
        basket_count: rows.length,
        aggregate_remaining_capacity_cents: rows.reduce((sum, row) => sum + row.remaining_capacity_cents, 0),
        blocked_basket_count: rows.filter(row => !row.proposed_use_fits).length,
        baskets: rows,
      },
    };
  }),
  'MODEL.TAX.280G.PARACHUTE.v1': defineModel('MODEL.TAX.280G.PARACHUTE.v1', ['base_amount_cents', 'parachute_payments_cents'], ['[IRC 280G]', '[IRC 4999]'], input => {
    const baseAmount = cents(input.base_amount_cents);
    const parachutePayments = cents(input.parachute_payments_cents);
    const cleansingVotePct = number(input.shareholder_cleansing_vote_pct);
    const missing = requireInputs({ base_amount_cents: baseAmount, parachute_payments_cents: parachutePayments });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const threshold = baseAmount! * 3;
    const triggered = parachutePayments! >= threshold;
    const excess = triggered ? Math.max(0, parachutePayments! - baseAmount!) : 0;
    return {
      outputs: {
        base_amount_cents: baseAmount,
        parachute_payments_cents: parachutePayments,
        three_times_base_threshold_cents: threshold,
        section_280g_triggered: triggered,
        excess_parachute_payment_cents: excess,
        excise_tax_20pct_cents: Math.round(excess * 0.20),
        lost_employer_deduction_cents: excess,
        shareholder_cleansing_vote_pct: cleansingVotePct,
        cleansing_vote_threshold_pct: 0.75,
        cleansing_vote_passed: cleansingVotePct == null ? null : cleansingVotePct > 0.75,
      },
    };
  }),
  'MODEL.TAX.382.NOL_LIMIT.v1': defineModel('MODEL.TAX.382.NOL_LIMIT.v1', ['loss_corporation_value_cents', 'long_term_tax_exempt_rate'], ['[IRC 382(b)(1)]'], input => {
    const value = cents(input.loss_corporation_value_cents);
    const rate = number(input.long_term_tax_exempt_rate);
    const nol = cents(input.nol_carryforward_cents);
    const missing = requireInputs({ loss_corporation_value_cents: value, long_term_tax_exempt_rate: rate });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const annualLimit = Math.round(value! * rate!);
    return {
      outputs: {
        loss_corporation_value_cents: value,
        long_term_tax_exempt_rate: round(rate!, 4),
        annual_section_382_limitation_cents: annualLimit,
        nol_carryforward_cents: nol,
        estimated_years_to_use_nol: nol == null || annualLimit <= 0 ? null : Math.ceil(nol / annualLimit),
      },
    };
  }),
  'MODEL.RESTRUCTURING.SOLVENCY.THREE_PRONG.v1': defineModel('MODEL.RESTRUCTURING.SOLVENCY.THREE_PRONG.v1', ['fair_value_assets_cents', 'liabilities_cents', 'projected_cash_flow_cents', 'debts_due_cents', 'available_capital_cents', 'required_capital_cents'], ['[11 U.S.C. 548]', '[UVTA]', '[Tribune]'], input => {
    const assets = cents(input.fair_value_assets_cents);
    const liabilities = cents(input.liabilities_cents);
    const projectedCashFlow = cents(input.projected_cash_flow_cents);
    const debtsDue = cents(input.debts_due_cents);
    const availableCapital = cents(input.available_capital_cents);
    const requiredCapital = cents(input.required_capital_cents);
    const missing = requireInputs({
      fair_value_assets_cents: assets,
      liabilities_cents: liabilities,
      projected_cash_flow_cents: projectedCashFlow,
      debts_due_cents: debtsDue,
      available_capital_cents: availableCapital,
      required_capital_cents: requiredCapital,
    });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const balanceSheetSurplus = assets! - liabilities!;
    const cashFlowSurplus = projectedCashFlow! - debtsDue!;
    const capitalSurplus = availableCapital! - requiredCapital!;
    return {
      outputs: {
        balance_sheet_surplus_cents: balanceSheetSurplus,
        balance_sheet_prong_passed: balanceSheetSurplus >= 0,
        cash_flow_surplus_cents: cashFlowSurplus,
        cash_flow_prong_passed: cashFlowSurplus >= 0,
        capital_adequacy_surplus_cents: capitalSurplus,
        capital_adequacy_prong_passed: capitalSurplus >= 0,
        all_prongs_passed: balanceSheetSurplus >= 0 && cashFlowSurplus >= 0 && capitalSurplus >= 0,
        solvency_opinion_handoff_required: true,
      },
    };
  }),
  'MODEL.RESTRUCTURING.363_SALE.v1': defineModel('MODEL.RESTRUCTURING.363_SALE.v1', ['purchase_price_cents', 'lien_amount_cents'], ['[11 U.S.C. 363]', '[11 U.S.C. 365]', '[RadLAX]', '[Fisker]'], input => {
    const purchasePrice = cents(input.purchase_price_cents);
    const liens = cents(input.lien_amount_cents);
    const breakupFee = cents(input.breakup_fee_cents) ?? 0;
    const creditBidClaim = cents(input.credit_bid_claim_cents) ?? 0;
    const causeToDenyCreditBid = booleanInput(input.cause_to_deny_credit_bid) ?? false;
    const prongs = safeObject(input.section_363f_prongs);
    const missing = requireInputs({ purchase_price_cents: purchasePrice, lien_amount_cents: liens });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const computedPriceExceedsLiens = purchasePrice! > liens!;
    const prongRows = [
      ['applicable_non_bankruptcy_law_permits', booleanInput(prongs.applicable_non_bankruptcy_law_permits)],
      ['consent', booleanInput(prongs.consent)],
      ['price_exceeds_liens', booleanInput(prongs.price_exceeds_liens) ?? computedPriceExceedsLiens],
      ['bona_fide_dispute', booleanInput(prongs.bona_fide_dispute)],
      ['could_be_compelled_to_accept_money_satisfaction', booleanInput(prongs.could_be_compelled_to_accept_money_satisfaction)],
    ].map(([name, passed]) => ({ prong: name, passed: passed === true }));
    return {
      outputs: {
        purchase_price_cents: purchasePrice,
        lien_amount_cents: liens,
        breakup_fee_cents: breakupFee,
        breakup_fee_pct_of_purchase_price: purchasePrice! > 0 ? round(breakupFee / purchasePrice!, 4) : null,
        free_and_clear_prong_count: prongRows.filter(row => row.passed).length,
        free_and_clear_path_available: prongRows.some(row => row.passed),
        price_exceeds_aggregate_liens: computedPriceExceedsLiens,
        credit_bid_claim_cents: creditBidClaim,
        credit_bid_eligible: creditBidClaim > 0 && !causeToDenyCreditBid,
        court_approval_required: true,
        section_363f_prongs: prongRows,
      },
    };
  }),
  'MODEL.RESTRUCTURING.CH7_WATERFALL.v1': defineModel('MODEL.RESTRUCTURING.CH7_WATERFALL.v1', ['estate_value_cents', 'claims'], ['[11 U.S.C. 507]', '[11 U.S.C. 726]'], input => {
    const estateValue = cents(input.estate_value_cents);
    const claims = objectArray(input.claims);
    const trusteeFee = cents(input.trustee_fee_cents) ?? 0;
    const missing = requireInputs({ estate_value_cents: estateValue, claims: claims.length ? claims : null });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    let remaining = Math.max(0, estateValue! - trusteeFee);
    const rows = claims
      .map((claim, index) => ({
        class_name: String(claim.class_name || claim.name || `Class ${index + 1}`),
        priority_rank: number(claim.priority_rank) ?? 3,
        allowed_claim_cents: cents(claim.allowed_claim_cents) ?? 0,
      }))
      .sort((left, right) => left.priority_rank - right.priority_rank)
      .map(claim => {
        const distribution = Math.min(remaining, claim.allowed_claim_cents);
        remaining -= distribution;
        return {
          ...claim,
          distribution_cents: distribution,
          recovery_pct: claim.allowed_claim_cents > 0 ? round(distribution / claim.allowed_claim_cents, 4) : 0,
        };
      });
    return {
      outputs: {
        estate_value_cents: estateValue,
        trustee_fee_cents: trusteeFee,
        distributable_estate_cents: Math.max(0, estateValue! - trusteeFee),
        total_claims_cents: rows.reduce((sum, row) => sum + row.allowed_claim_cents, 0),
        total_distributed_cents: rows.reduce((sum, row) => sum + row.distribution_cents, 0),
        residual_to_equity_cents: remaining,
        waterfall_rows: rows,
      },
    };
  }),
  'MODEL.RESTRUCTURING.DIP_SIZING.v1': defineModel('MODEL.RESTRUCTURING.DIP_SIZING.v1', ['thirteen_week_cash_need_cents', 'minimum_liquidity_cents'], ['[11 U.S.C. 364]', '[Collier 364.06]'], input => {
    const cashNeed = cents(input.thirteen_week_cash_need_cents);
    const minimumLiquidity = cents(input.minimum_liquidity_cents);
    const openingCash = cents(input.opening_cash_cents) ?? 0;
    const rollup = cents(input.rollup_amount_cents) ?? 0;
    const professionalFeeCarveout = cents(input.professional_fee_carveout_cents) ?? 0;
    const newMoneyMinimum = cents(input.new_money_minimum_cents) ?? 0;
    const primingRequested = booleanInput(input.priming_requested) ?? false;
    const missing = requireInputs({ thirteen_week_cash_need_cents: cashNeed, minimum_liquidity_cents: minimumLiquidity });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const liquidityNeed = Math.max(0, cashNeed! + minimumLiquidity! - openingCash);
    const requiredCommitment = Math.max(liquidityNeed + rollup + professionalFeeCarveout, newMoneyMinimum + rollup + professionalFeeCarveout);
    return {
      outputs: {
        thirteen_week_cash_need_cents: cashNeed,
        opening_cash_cents: openingCash,
        minimum_liquidity_cents: minimumLiquidity,
        liquidity_need_cents: liquidityNeed,
        rollup_amount_cents: rollup,
        professional_fee_carveout_cents: professionalFeeCarveout,
        required_dip_commitment_cents: requiredCommitment,
        new_money_component_cents: Math.max(newMoneyMinimum, liquidityNeed),
        rollup_pct_of_commitment: requiredCommitment > 0 ? round(rollup / requiredCommitment, 4) : null,
        priming_requested: primingRequested,
        court_approval_required: true,
      },
    };
  }),
  'MODEL.RESTRUCTURING.EXCHANGE_OFFER.v1': defineModel('MODEL.RESTRUCTURING.EXCHANGE_OFFER.v1', ['outstanding_debt_cents', 'participating_debt_cents', 'new_security_value_cents'], ['[Securities Act 3(a)(9)]', '[TIA 316(b)]'], input => {
    const outstandingDebt = cents(input.outstanding_debt_cents);
    const participatingDebt = cents(input.participating_debt_cents);
    const newSecurityValue = cents(input.new_security_value_cents);
    const minParticipationPct = number(input.minimum_participation_pct) ?? 0;
    const oldSecurityValue = cents(input.old_security_value_cents) ?? participatingDebt ?? 0;
    const missing = requireInputs({ outstanding_debt_cents: outstandingDebt, participating_debt_cents: participatingDebt, new_security_value_cents: newSecurityValue });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const participationPct = outstandingDebt! > 0 ? participatingDebt! / outstandingDebt! : 0;
    return {
      outputs: {
        outstanding_debt_cents: outstandingDebt,
        participating_debt_cents: participatingDebt,
        holdout_debt_cents: Math.max(0, outstandingDebt! - participatingDebt!),
        participation_pct: round(participationPct, 4),
        minimum_participation_pct: round(minParticipationPct, 4),
        minimum_participation_satisfied: participationPct >= minParticipationPct,
        old_security_value_cents: oldSecurityValue,
        new_security_value_cents: newSecurityValue,
        exchange_discount_cents: Math.max(0, oldSecurityValue - newSecurityValue!),
        codi_exposure_cents: Math.max(0, participatingDebt! - newSecurityValue!),
        counsel_review_required: true,
      },
    };
  }),
  'MODEL.RE.ASSET_ENTITY.ELECTION.v1': defineModel('MODEL.RE.ASSET_ENTITY.ELECTION.v1', ['enterprise_value_cents', 'real_property_value_cents'], ['[IRC 1001]', '[IRC 1060]', '[IRC 197]'], input => {
    const enterpriseValue = cents(input.enterprise_value_cents);
    const realPropertyValue = cents(input.real_property_value_cents);
    const entityCarriedBasis = cents(input.entity_carried_basis_cents) ?? 0;
    const transferTaxRate = number(input.transfer_tax_rate) ?? 0;
    const stepUpBenefitRate = number(input.step_up_benefit_rate) ?? 0;
    const debtAssumable = booleanInput(input.debt_assumable);
    const missing = requireInputs({ enterprise_value_cents: enterpriseValue, real_property_value_cents: realPropertyValue });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const realEstatePct = enterpriseValue! > 0 ? realPropertyValue! / enterpriseValue! : 0;
    const transferTax = Math.round(realPropertyValue! * transferTaxRate);
    const stepUp = Math.max(0, enterpriseValue! - entityCarriedBasis);
    return {
      outputs: {
        enterprise_value_cents: enterpriseValue,
        real_property_value_cents: realPropertyValue,
        real_estate_pct_of_ev: round(realEstatePct, 4),
        g30_real_estate_overlay_triggered: realEstatePct >= 0.25,
        asset_deal_buyer_basis_cents: enterpriseValue,
        entity_deal_buyer_outside_basis_cents: enterpriseValue,
        entity_carried_basis_cents: entityCarriedBasis,
        buyer_step_up_cents: stepUp,
        buyer_step_up_pv_benefit_cents: Math.round(stepUp * stepUpBenefitRate),
        transfer_tax_rate: round(transferTaxRate, 4),
        transfer_tax_cents: transferTax,
        debt_assumability: debtAssumable == null ? 'not_supplied' : debtAssumable ? 'assumable_on_supplied_facts' : 'consent_or_refinance_required',
        in_place_lease_treatment: String(input.in_place_lease_treatment || 'assumption_or_assignment_to_confirm'),
      },
    };
  }),
  'MODEL.RE.OPBUS.BIFURCATION.v1': defineModel('MODEL.RE.OPBUS.BIFURCATION.v1', ['enterprise_value_cents', 'noi_cents', 'cap_rate'], ['[Treas. Reg. 1.338-6]', '[IRS Form 8594]'], input => {
    const enterpriseValue = cents(input.enterprise_value_cents);
    const noi = cents(input.noi_cents);
    const capRate = number(input.cap_rate);
    const classViIntangibles = cents(input.class_vi_intangibles_cents) ?? 0;
    const missing = requireInputs({ enterprise_value_cents: enterpriseValue, noi_cents: noi, cap_rate: capRate });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const uncappedRealEstateValue = capRate! > 0 ? Math.round(noi! / capRate!) : 0;
    const realEstateValue = Math.min(enterpriseValue!, uncappedRealEstateValue);
    const remainingAfterClassV = Math.max(0, enterpriseValue! - realEstateValue);
    const classVi = Math.min(classViIntangibles, remainingAfterClassV);
    const classVii = Math.max(0, enterpriseValue! - realEstateValue - classVi);
    return {
      outputs: {
        enterprise_value_cents: enterpriseValue,
        noi_cents: noi,
        cap_rate: round(capRate!, 4),
        uncapped_real_estate_value_cents: uncappedRealEstateValue,
        real_estate_value_cents: realEstateValue,
        operating_business_residual_value_cents: Math.max(0, enterpriseValue! - realEstateValue),
        class_v_real_property_and_tangible_cents: realEstateValue,
        class_vi_section_197_intangibles_cents: classVi,
        class_vii_goodwill_going_concern_cents: classVii,
        form_8594_reconciliation_total_cents: realEstateValue + classVi + classVii,
      },
    };
  }),
  'MODEL.RE.NOI.CAP_RATE_BRIDGE.v1': defineModel('MODEL.RE.NOI.CAP_RATE_BRIDGE.v1', ['effective_gross_income_cents', 'operating_expenses_cents', 'cap_rate'], ['[Appraisal Institute Practice]', '[Real Estate Industry Practice]'], input => {
    const effectiveGrossIncome = cents(input.effective_gross_income_cents);
    const operatingExpenses = cents(input.operating_expenses_cents);
    const capRate = number(input.cap_rate);
    const purchasePrice = cents(input.purchase_price_cents);
    const replacementReserve = cents(input.replacement_reserve_cents) ?? 0;
    const missing = requireInputs({ effective_gross_income_cents: effectiveGrossIncome, operating_expenses_cents: operatingExpenses, cap_rate: capRate });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const normalizedNoi = effectiveGrossIncome! - operatingExpenses! - replacementReserve;
    return {
      outputs: {
        effective_gross_income_cents: effectiveGrossIncome,
        operating_expenses_cents: operatingExpenses,
        replacement_reserve_cents: replacementReserve,
        normalized_noi_cents: normalizedNoi,
        cap_rate: round(capRate!, 4),
        value_from_cap_rate_cents: capRate! > 0 ? Math.round(normalizedNoi / capRate!) : null,
        purchase_price_cents: purchasePrice,
        implied_cap_rate: purchasePrice && purchasePrice > 0 ? round(normalizedNoi / purchasePrice, 4) : null,
        pass_through_market_rate_required: booleanInput(input.market_cap_rate_from_pass_through_source) !== true,
      },
    };
  }),
  'MODEL.RE.LEASE_ABSTRACTION.v1': defineModel('MODEL.RE.LEASE_ABSTRACTION.v1', ['leases'], ['[Lease Abstraction Industry Practice]'], input => {
    const leases = objectArray(input.leases);
    const asOfDate = dateText(input.as_of_date);
    const missing = requireInputs({ leases: leases.length ? leases : null });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const rows = leases.map((lease, index) => {
      const annualRent = cents(lease.annual_rent_cents) ?? 0;
      const monthsRemaining = number(lease.months_remaining) ?? monthsUntil(dateText(lease.expiry_date), asOfDate);
      const cocConsent = booleanInput(lease.change_of_control_consent_required) ?? false;
      return {
        tenant: String(lease.tenant || lease.name || `Lease ${index + 1}`),
        annual_rent_cents: annualRent,
        expiry_date: dateText(lease.expiry_date),
        months_remaining: monthsRemaining,
        assignment_consent_required: booleanInput(lease.assignment_consent_required) ?? false,
        change_of_control_consent_required: cocConsent,
        renewal_options_count: number(lease.renewal_options_count) ?? 0,
        exclusive_use: booleanInput(lease.exclusive_use) ?? false,
        co_tenancy: booleanInput(lease.co_tenancy) ?? false,
        go_dark: booleanInput(lease.go_dark) ?? false,
      };
    });
    const totalRent = rows.reduce((sum, row) => sum + row.annual_rent_cents, 0);
    const waltNumerator = rows.reduce((sum, row) => sum + row.annual_rent_cents * (row.months_remaining ?? 0), 0);
    return {
      outputs: {
        lease_count: rows.length,
        annual_rent_cents: totalRent,
        walt_months: totalRent > 0 ? round(waltNumerator / totalRent, 1) : null,
        assignment_consent_required_count: rows.filter(row => row.assignment_consent_required).length,
        change_of_control_consent_required_count: rows.filter(row => row.change_of_control_consent_required).length,
        exclusives_count: rows.filter(row => row.exclusive_use).length,
        co_tenancy_count: rows.filter(row => row.co_tenancy).length,
        go_dark_count: rows.filter(row => row.go_dark).length,
        abstraction_rows: rows,
      },
    };
  }),
  'MODEL.RE.PROPERTY_ESCROW.HOLDBACK.v1': defineModel('MODEL.RE.PROPERTY_ESCROW.HOLDBACK.v1', ['issues'], ['[ALTA Endorsements]', '[Real Estate Practice Norms]'], input => {
    const issues = objectArray(input.issues);
    const generalBufferRate = number(input.general_buffer_rate) ?? 0;
    const missing = requireInputs({ issues: issues.length ? issues : null });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const rows = issues.map((issue, index) => {
      const rawType = String(issue.type || issue.category || 'other').toLowerCase();
      const amount = cents(issue.amount_cents ?? issue.estimated_cost_cents ?? issue.cost_to_cure_cents) ?? 0;
      const holdbackPct = number(issue.holdback_pct) ?? 1;
      const category = /env|phase|remediation/.test(rawType) ? 'environmental'
        : /pca|maintenance|deferred|capex/.test(rawType) ? 'pca'
          : /title|survey|alta|lien/.test(rawType) ? 'title'
            : /tenant|lease|rent/.test(rawType) ? 'tenant'
              : /cure|repair/.test(rawType) ? 'cost_to_cure'
                : 'other';
      return {
        issue: String(issue.name || issue.issue || `Property issue ${index + 1}`),
        category,
        source: String(issue.source || (category === 'other' ? 'user_supplied' : 'pass_through_report')),
        amount_cents: amount,
        holdback_pct: round(holdbackPct, 4),
        escrow_cents: Math.round(amount * holdbackPct * (1 + generalBufferRate)),
        pass_through_source_required: booleanInput(issue.pass_through_source_required) ?? ['environmental', 'pca', 'title'].includes(category),
      };
    });
    const totalFor = (category: string) => rows.filter(row => row.category === category).reduce((sum, row) => sum + row.escrow_cents, 0);
    return {
      outputs: {
        property_issue_count: rows.length,
        general_buffer_rate: round(generalBufferRate, 4),
        environmental_escrow_cents: totalFor('environmental'),
        pca_reserve_escrow_cents: totalFor('pca'),
        title_exception_escrow_cents: totalFor('title'),
        tenant_dispute_escrow_cents: totalFor('tenant'),
        cost_to_cure_escrow_cents: totalFor('cost_to_cure'),
        other_property_escrow_cents: totalFor('other'),
        total_property_escrow_cents: rows.reduce((sum, row) => sum + row.escrow_cents, 0),
        pass_through_source_required_count: rows.filter(row => row.pass_through_source_required).length,
        escrow_rows: rows,
      },
    };
  }),
  'MODEL.RE.TITLE_SURVEY.CHECKLIST.v1': defineModel('MODEL.RE.TITLE_SURVEY.CHECKLIST.v1', ['title_commitment_received', 'survey_received'], ['[ALTA Forms]', '[State Title Statutes]'], input => {
    const titleCommitmentReceived = booleanInput(input.title_commitment_received);
    const surveyReceived = booleanInput(input.survey_received);
    const scheduleB = objectArray(input.schedule_b_exceptions);
    const curativeItems = objectArray(input.curative_items);
    const endorsements = stringArray(input.alta_endorsements_requested);
    const missing = requireInputs({ title_commitment_received: titleCommitmentReceived, survey_received: surveyReceived });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const curativeRows = curativeItems.map((item, index) => {
      const status = String(item.status || 'open').toLowerCase();
      return {
        item: String(item.item || item.name || `Curative item ${index + 1}`),
        status,
        cost_to_cure_cents: cents(item.cost_to_cure_cents) ?? 0,
        open: !['closed', 'resolved', 'waived'].includes(status),
      };
    });
    return {
      outputs: {
        title_commitment_received: titleCommitmentReceived,
        survey_received: surveyReceived,
        schedule_b_exception_count: scheduleB.length,
        survey_review_required: surveyReceived === true,
        owner_policy_required: booleanInput(input.owner_policy_required) ?? true,
        lender_policy_required: booleanInput(input.lender_policy_required) ?? false,
        alta_endorsements_requested_count: endorsements.length,
        curative_item_count: curativeRows.length,
        open_curative_item_count: curativeRows.filter(row => row.open).length,
        curative_cost_to_cure_cents: curativeRows.reduce((sum, row) => sum + row.cost_to_cure_cents, 0),
        closing_protection_letter_required: booleanInput(input.closing_protection_letter_required) ?? true,
        title_pass_through_source_required: true,
        process_steps: ['title_commitment', 'schedule_b_exception_review', 'survey_review', 'policy_and_endorsement_selection', 'curative_work_plan', 'closing_protection_letter'],
        curative_rows: curativeRows,
      },
    };
  }),
  'MODEL.RE.PCA.RESERVES.v1': defineModel('MODEL.RE.PCA.RESERVES.v1', ['pca_items'], ['[ASTM E2018]', '[Lender Practice]'], input => {
    const items = objectArray(input.pca_items);
    const lenderReservePct = number(input.lender_reserve_pct) ?? 1;
    const missing = requireInputs({ pca_items: items.length ? items : null });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const rows = items.map((item, index) => {
      const immediate = cents(item.immediate_repair_cents) ?? 0;
      const year1To3 = cents(item.year_1_3_cents) ?? cents(item.near_term_cents) ?? 0;
      const year4To5 = cents(item.year_4_5_cents) ?? 0;
      const year6To12 = cents(item.year_6_12_cents) ?? 0;
      return {
        item: String(item.item || item.name || `PCA item ${index + 1}`),
        immediate_repair_cents: immediate,
        year_1_3_cents: year1To3,
        year_4_5_cents: year4To5,
        year_6_12_cents: year6To12,
        total_reserve_cents: immediate + year1To3 + year4To5 + year6To12,
        source: String(item.source || 'pass_through_pca_report'),
      };
    });
    const immediateTotal = rows.reduce((sum, row) => sum + row.immediate_repair_cents, 0);
    return {
      outputs: {
        pca_item_count: rows.length,
        immediate_repair_escrow_cents: Math.round(immediateTotal * lenderReservePct),
        year_1_3_reserve_cents: rows.reduce((sum, row) => sum + row.year_1_3_cents, 0),
        year_4_5_reserve_cents: rows.reduce((sum, row) => sum + row.year_4_5_cents, 0),
        year_6_12_reserve_cents: rows.reduce((sum, row) => sum + row.year_6_12_cents, 0),
        total_replacement_reserve_cents: rows.reduce((sum, row) => sum + row.total_reserve_cents, 0),
        pca_pass_through_source_required: true,
        reserve_rows: rows,
      },
    };
  }),
  'MODEL.RE.FIRPTA.WITHHOLDING.V11.v1': defineModel('MODEL.RE.FIRPTA.WITHHOLDING.V11.v1', ['amount_realized_cents', 'seller_foreign_person'], ['[IRC 897]', '[IRC 1445]', '[IRS Form 8288]', '[IRS Form 8288-A]', '[IRS Form 8288-B]'], input => {
    const amountRealized = cents(input.amount_realized_cents);
    const sellerForeign = booleanInput(input.seller_foreign_person);
    const residenceUse = booleanInput(input.buyer_will_use_as_residence) ?? false;
    const closingDate = dateText(input.closing_date);
    const reducedCertificateRequested = booleanInput(input.form_8288_b_reduced_withholding_requested) ?? false;
    const exchange1031 = booleanInput(input.section_1031_exchange) ?? false;
    const missing = requireInputs({ amount_realized_cents: amountRealized, seller_foreign_person: sellerForeign });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    let withholdingRate = 0;
    let path = 'not_foreign_seller';
    if (sellerForeign) {
      if (residenceUse && amountRealized! <= 30000000) {
        path = 'personal_residence_300k_or_less_exemption';
      } else if (residenceUse && amountRealized! <= 100000000) {
        withholdingRate = 0.10;
        path = 'personal_residence_300k_to_1m_reduced_rate';
      } else {
        withholdingRate = 0.15;
        path = 'default_firpta_withholding';
      }
    }
    return {
      outputs: {
        amount_realized_cents: amountRealized,
        seller_foreign_person: sellerForeign,
        buyer_will_use_as_residence: residenceUse,
        withholding_rate: withholdingRate,
        withholding_amount_cents: Math.round(amountRealized! * withholdingRate),
        path,
        forms_8288_due_date: sellerForeign && withholdingRate > 0 && closingDate ? addDays(closingDate, 20) : null,
        form_8288_b_reduced_withholding_requested: reducedCertificateRequested,
        reduced_certificate_processing_days_estimate: reducedCertificateRequested ? 90 : null,
        section_1031_timing_gap_flag: exchange1031 && sellerForeign && withholdingRate > 0,
      },
    };
  }),
  'MODEL.IP.CHAIN_OF_TITLE.v1': defineModel('MODEL.IP.CHAIN_OF_TITLE.v1', ['assets'], ['[35 U.S.C. 261]', '[Lanham Act 10]', '[17 U.S.C. 205]', '[Clorox v. Chemical Bank]'], input => {
    const assets = objectArray(input.assets);
    const missing = requireInputs({ assets: assets.length ? assets : null });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const rows = assets.map((asset, index) => {
      const type = String(asset.type || asset.asset_type || 'ip').toLowerCase();
      const assignmentCount = number(asset.assignment_count) ?? objectArray(asset.assignments).length;
      const currentOwnerMatches = booleanInput(asset.current_owner_matches) ?? false;
      const recordedWithinThreeMonths = booleanInput(asset.recorded_within_three_months) ?? false;
      const contributorAssignmentsComplete = booleanInput(asset.contributor_assignments_complete) ?? false;
      const ituAssignedAfterAllegationOfUse = booleanInput(asset.itu_assigned_after_allegation_of_use);
      return {
        name: String(asset.name || asset.identifier || `IP asset ${index + 1}`),
        type,
        assignment_count: assignmentCount,
        current_owner_matches: currentOwnerMatches,
        recorded_within_three_months: recordedWithinThreeMonths,
        contributor_assignments_complete: contributorAssignmentsComplete,
        assignment_gap: assignmentCount <= 0 || !currentOwnerMatches,
        late_recording_flag: assignmentCount > 0 && !recordedWithinThreeMonths,
        contributor_gap: !contributorAssignmentsComplete,
        itu_assignment_risk: type.includes('trademark') && ituAssignedAfterAllegationOfUse === false,
      };
    });
    return {
      outputs: {
        ip_asset_count: rows.length,
        patent_asset_count: rows.filter(row => row.type.includes('patent')).length,
        trademark_asset_count: rows.filter(row => row.type.includes('trademark')).length,
        copyright_asset_count: rows.filter(row => row.type.includes('copyright')).length,
        assignment_gap_count: rows.filter(row => row.assignment_gap).length,
        late_recording_count: rows.filter(row => row.late_recording_flag).length,
        contributor_assignment_gap_count: rows.filter(row => row.contributor_gap).length,
        itu_assignment_risk_count: rows.filter(row => row.itu_assignment_risk).length,
        counsel_review_required: rows.some(row => row.assignment_gap || row.late_recording_flag || row.contributor_gap || row.itu_assignment_risk),
        chain_rows: rows,
      },
    };
  }),
  'MODEL.IP.ENCUMBRANCE_LIEN_SEARCH.v1': defineModel('MODEL.IP.ENCUMBRANCE_LIEN_SEARCH.v1', ['searches'], ['[UCC Article 9]', '[17 U.S.C. 205]', '[In re Peregrine]', '[Rhone-Poulenc Agro v. DeKalb]'], input => {
    const searches = objectArray(input.searches);
    const missing = requireInputs({ searches: searches.length ? searches : null });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const rows = searches.map((search, index) => {
      const track = String(search.track || search.type || 'ucc').toLowerCase();
      const hitCount = number(search.hit_count) ?? (booleanInput(search.hit_found) ? 1 : 0);
      const releaseRequired = hitCount > 0 && (booleanInput(search.release_obtained) !== true);
      return {
        search: String(search.name || search.jurisdiction || `Search ${index + 1}`),
        track: track.includes('copyright') ? 'copyright' : track.includes('uspto') || track.includes('patent') || track.includes('trademark') ? 'uspto' : 'ucc',
        hit_count: hitCount,
        release_obtained: booleanInput(search.release_obtained) ?? false,
        release_required: releaseRequired,
        pass_through_search_source: String(search.source || 'pass_through_lien_search'),
      };
    });
    return {
      outputs: {
        search_track_count: rows.length,
        ucc_lien_hit_count: rows.filter(row => row.track === 'ucc').reduce((sum, row) => sum + row.hit_count, 0),
        uspto_security_hit_count: rows.filter(row => row.track === 'uspto').reduce((sum, row) => sum + row.hit_count, 0),
        copyright_security_hit_count: rows.filter(row => row.track === 'copyright').reduce((sum, row) => sum + row.hit_count, 0),
        open_lien_count: rows.filter(row => row.release_required).reduce((sum, row) => sum + row.hit_count, 0),
        release_required_count: rows.filter(row => row.release_required).length,
        pass_through_search_source_required: true,
        lien_search_rows: rows,
      },
    };
  }),
  'MODEL.IP.REPRESENTATION_SET.v1': defineModel('MODEL.IP.REPRESENTATION_SET.v1', ['deal_type', 'material_ip_categories'], ['[ABA Model SPA IP Representations]'], input => {
    const dealType = text(input.deal_type);
    const categories = stringArray(input.material_ip_categories).map(item => item.toLowerCase());
    const missing = requireInputs({ deal_type: dealType, material_ip_categories: categories.length ? categories : null });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const hasSoftware = categories.some(item => /software|source|code|oss|saas/.test(item));
    const hasPatent = categories.some(item => /patent|life science|device/.test(item));
    const hasTrademark = categories.some(item => /trademark|brand|domain/.test(item));
    const reps = [
      'ownership',
      'no_encumbrances',
      'sufficiency',
      'registered_ip_schedule',
      'license_schedule',
      ...(hasPatent ? ['limited_validity_patent_schedule'] : []),
      ...(hasTrademark ? ['trademark_domain_schedule'] : []),
      ...(hasSoftware ? ['oss_compliance', 'source_code_control'] : []),
    ];
    return {
      outputs: {
        deal_type: dealType,
        material_ip_category_count: categories.length,
        representation_count: reps.length,
        schedule_count: reps.filter(rep => rep.includes('schedule')).length,
        includes_oss_rep: hasSoftware,
        includes_sufficiency_rep: reps.includes('sufficiency'),
        enforceability_opinion_pass_through: true,
        counsel_drafting_required: true,
        representation_set: reps,
      },
    };
  }),
  'MODEL.IP.LICENSE.DEPENDENCY.v1': defineModel('MODEL.IP.LICENSE.DEPENDENCY.v1', ['licenses'], ['[IP Licensing Industry Practice]'], input => {
    const licenses = objectArray(input.licenses);
    const missing = requireInputs({ licenses: licenses.length ? licenses : null });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const rows = licenses.map((license, index) => {
      const direction = String(license.direction || license.type || 'inbound').toLowerCase().includes('out') ? 'outbound' : 'inbound';
      const annualRoyalty = cents(license.annual_royalty_cents ?? license.royalty_cents) ?? 0;
      const cocConsent = booleanInput(license.change_of_control_consent_required) ?? false;
      const terminates = booleanInput(license.terminates_on_change_of_control) ?? false;
      const sublicensing = booleanInput(license.sublicensing_allowed) ?? false;
      return {
        name: String(license.name || license.license_name || `License ${index + 1}`),
        direction,
        scope: String(license.scope || 'not_supplied'),
        exclusive: booleanInput(license.exclusive) ?? false,
        annual_royalty_cents: annualRoyalty,
        change_of_control_consent_required: cocConsent,
        terminates_on_change_of_control: terminates,
        sublicensing_allowed: sublicensing,
        material_dependency_flag: direction === 'inbound' && (cocConsent || terminates || !sublicensing),
      };
    });
    return {
      outputs: {
        license_count: rows.length,
        inbound_license_count: rows.filter(row => row.direction === 'inbound').length,
        outbound_license_count: rows.filter(row => row.direction === 'outbound').length,
        annual_royalty_cents: rows.reduce((sum, row) => sum + row.annual_royalty_cents, 0),
        change_of_control_consent_required_count: rows.filter(row => row.change_of_control_consent_required).length,
        terminates_on_change_of_control_count: rows.filter(row => row.terminates_on_change_of_control).length,
        material_dependency_count: rows.filter(row => row.material_dependency_flag).length,
        license_rows: rows,
      },
    };
  }),
  'MODEL.IP.SOURCE_CODE_ESCROW.v1': defineModel('MODEL.IP.SOURCE_CODE_ESCROW.v1', ['release_triggers', 'deposit_verification_tier'], ['[Escode]', '[Codekeeper]', '[Iron Mountain Escrow Templates]'], input => {
    const triggers = stringArray(input.release_triggers);
    const tier = text(input.deposit_verification_tier);
    const lastDepositDate = dateText(input.last_deposit_date);
    const updateFrequencyMonths = number(input.update_frequency_months) ?? 3;
    const missing = requireInputs({ release_triggers: triggers.length ? triggers : null, deposit_verification_tier: tier });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const normalizedTier = tier!.toLowerCase().replace(/\s+/g, '_');
    return {
      outputs: {
        release_trigger_count: triggers.length,
        release_triggers: triggers,
        deposit_verification_tier: normalizedTier,
        build_verified: /build|run|tested/.test(normalizedTier),
        run_tested: /run|tested/.test(normalizedTier),
        update_frequency_months: updateFrequencyMonths,
        last_deposit_date: lastDepositDate,
        next_deposit_due_date: lastDepositDate ? addMonths(lastDepositDate, updateFrequencyMonths) : null,
      },
    };
  }),
  'MODEL.IP.EMPLOYEE_ASSIGNMENT.VERIFICATION.v1': defineModel('MODEL.IP.EMPLOYEE_ASSIGNMENT.VERIFICATION.v1', ['contributors'], ['[California Labor Code 2870]', '[State Employee-IP Statutes]'], input => {
    const contributors = objectArray(input.contributors);
    const missing = requireInputs({ contributors: contributors.length ? contributors : null });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const rows = contributors.map((contributor, index) => {
      const state = String(contributor.state || contributor.work_state || '').toUpperCase();
      const assignmentExecuted = booleanInput(contributor.ip_assignment_executed) ?? false;
      const workForHireExecuted = booleanInput(contributor.work_for_hire_executed) ?? false;
      const outsideScope = booleanInput(contributor.outside_scope_invention) ?? false;
      return {
        contributor: String(contributor.name || `Contributor ${index + 1}`),
        role: String(contributor.role || 'not_supplied'),
        state,
        ip_assignment_executed: assignmentExecuted,
        work_for_hire_executed: workForHireExecuted,
        missing_assignment: !assignmentExecuted,
        missing_work_for_hire: !workForHireExecuted,
        california_2870_carveout_flag: state === 'CA' && outsideScope,
      };
    });
    return {
      outputs: {
        contributor_count: rows.length,
        executed_assignment_count: rows.filter(row => row.ip_assignment_executed).length,
        missing_assignment_count: rows.filter(row => row.missing_assignment).length,
        missing_work_for_hire_count: rows.filter(row => row.missing_work_for_hire).length,
        california_2870_carveout_count: rows.filter(row => row.california_2870_carveout_flag).length,
        all_contributors_papered: rows.every(row => !row.missing_assignment && !row.missing_work_for_hire),
        counsel_review_required: rows.some(row => row.missing_assignment || row.missing_work_for_hire || row.california_2870_carveout_flag),
        contributor_rows: rows,
      },
    };
  }),
  'MODEL.IP.OSS.EXPOSURE.v1': defineModel('MODEL.IP.OSS.EXPOSURE.v1', ['components'], ['[GPL]', '[AGPL]', '[LGPL]', '[MIT]', '[Apache]', '[BSD]', '[Morgan Lewis OSS Guidance]', '[Nixon Peabody OSS Guidance]', '[Morse OSS Guidance]'], input => {
    const components = objectArray(input.components);
    const missing = requireInputs({ components: components.length ? components : null });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const rows = components.map((component, index) => {
      const license = String(component.license || component.license_name || '').toLowerCase();
      const licenseClass = /\blgpl\b|\bmpl\b|\bepl\b/.test(license) ? 'weak_copyleft'
        : /\bagpl\b|\bgpl\b|cc-by-sa/.test(license) ? 'strong_copyleft'
          : /mit|bsd|apache|isc|unlicense/.test(license) ? 'permissive'
            : 'unknown';
      const networkUse = booleanInput(component.network_use) ?? false;
      const proprietaryLinking = booleanInput(component.proprietary_linking) ?? false;
      const remediationCost = cents(component.remediation_cost_cents) ?? 0;
      return {
        component: String(component.name || `OSS component ${index + 1}`),
        license: license || 'not_supplied',
        license_class: licenseClass,
        network_use: networkUse,
        proprietary_linking: proprietaryLinking,
        agpl_network_flag: /agpl/.test(license) && networkUse,
        strong_copyleft_embedded_flag: licenseClass === 'strong_copyleft' && proprietaryLinking,
        remediation_cost_cents: remediationCost,
      };
    });
    return {
      outputs: {
        component_count: rows.length,
        permissive_count: rows.filter(row => row.license_class === 'permissive').length,
        weak_copyleft_count: rows.filter(row => row.license_class === 'weak_copyleft').length,
        strong_copyleft_count: rows.filter(row => row.license_class === 'strong_copyleft').length,
        unknown_license_count: rows.filter(row => row.license_class === 'unknown').length,
        agpl_network_count: rows.filter(row => row.agpl_network_flag).length,
        proprietary_strong_copyleft_count: rows.filter(row => row.strong_copyleft_embedded_flag).length,
        oss_specific_rep_required: true,
        indemnity_carveout_review_required: rows.some(row => row.license_class === 'strong_copyleft' || row.license_class === 'unknown'),
        special_escrow_sizing_cents: rows.reduce((sum, row) => sum + row.remediation_cost_cents, 0),
        sca_pass_through_source_required: true,
        oss_rows: rows,
      },
    };
  }),
  'MODEL.IP.1060.ALLOCATION.v1': defineModel('MODEL.IP.1060.ALLOCATION.v1', ['purchase_price_cents', 'tangible_assets_cents', 'ip_intangibles_cents'], ['[IRC 1060]', '[Treas. Reg. 1.338-6(b)]', '[Treas. Reg. 1.1060-1]', '[IRS Form 8594]'], input => {
    const purchasePrice = cents(input.purchase_price_cents);
    const tangible = cents(input.tangible_assets_cents);
    const ip = cents(input.ip_intangibles_cents);
    const missing = requireInputs({ purchase_price_cents: purchasePrice, tangible_assets_cents: tangible, ip_intangibles_cents: ip });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const classV = Math.min(purchasePrice!, tangible!);
    const remainingAfterV = Math.max(0, purchasePrice! - classV);
    const classVi = Math.min(remainingAfterV, ip!);
    const classVii = Math.max(0, purchasePrice! - classV - classVi);
    return {
      outputs: {
        purchase_price_cents: purchasePrice,
        class_v_tangible_assets_cents: classV,
        class_vi_ip_section_197_intangibles_cents: classVi,
        class_vii_goodwill_going_concern_cents: classVii,
        ip_value_excess_over_purchase_price_cents: Math.max(0, ip! - remainingAfterV),
        form_8594_reconciliation_total_cents: classV + classVi + classVii,
      },
    };
  }),
  'MODEL.IP.DOMAIN_TM.TRANSFER.v1': defineModel('MODEL.IP.DOMAIN_TM.TRANSFER.v1', ['transfer_assets'], ['[ICANN Transfer Rules]', '[USPTO Form PTO-1594]'], input => {
    const assets = objectArray(input.transfer_assets);
    const missing = requireInputs({ transfer_assets: assets.length ? assets : null });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const rows = assets.map((asset, index) => {
      const type = String(asset.type || asset.asset_type || 'domain').toLowerCase();
      return {
        name: String(asset.name || asset.identifier || `Asset ${index + 1}`),
        type,
        auth_code_required: type.includes('domain'),
        transfer_lock_days_remaining: number(asset.transfer_lock_days_remaining) ?? 0,
        uspto_assignment_recording_required: type.includes('trademark'),
        state_assignment_required: booleanInput(asset.state_registered) ?? false,
        social_handle_transfer_required: type.includes('social'),
        ssl_reissue_required: type.includes('ssl') || booleanInput(asset.ssl_certificate_attached) === true,
      };
    });
    return {
      outputs: {
        transfer_asset_count: rows.length,
        domain_count: rows.filter(row => row.type.includes('domain')).length,
        trademark_count: rows.filter(row => row.type.includes('trademark')).length,
        auth_code_required_count: rows.filter(row => row.auth_code_required).length,
        locked_domain_count: rows.filter(row => row.transfer_lock_days_remaining > 0).length,
        uspto_assignment_recording_count: rows.filter(row => row.uspto_assignment_recording_required).length,
        state_assignment_required_count: rows.filter(row => row.state_assignment_required).length,
        social_handle_transfer_count: rows.filter(row => row.social_handle_transfer_required).length,
        ssl_reissue_count: rows.filter(row => row.ssl_reissue_required).length,
        transfer_rows: rows,
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

function booleanInput(value: unknown): boolean | null {
  if (typeof value === 'boolean') return value;
  if (value === null || value === undefined || value === '') return null;
  const normalized = String(value).trim().toLowerCase();
  if (['true', 'yes', '1', 'y'].includes(normalized)) return true;
  if (['false', 'no', '0', 'n'].includes(normalized)) return false;
  return null;
}

function dateText(value: unknown): string | null {
  const normalized = text(value);
  if (!normalized) return null;
  const date = new Date(`${normalized}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : normalized;
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

function assetClassNumber(value: unknown): number {
  const parsed = number(value);
  if (parsed != null) return clamp(Math.round(parsed), 1, 7);
  const normalized = String(value ?? '').trim().toLowerCase();
  if (/class\s*vii|\bvii\b|goodwill|going concern/.test(normalized)) return 7;
  if (/class\s*vi|\bvi\b|section 197|intangible|intellectual property|\bip\b|customer/.test(normalized)) return 6;
  if (/class\s*iv|\biv\b|inventory/.test(normalized)) return 4;
  if (/class\s*iii|\biii\b|receivable/.test(normalized)) return 3;
  if (/class\s*ii|\bii\b|actively traded|security/.test(normalized)) return 2;
  if (/class\s*v(?!i)|\bv\b|real property|equipment|tangible|land|building/.test(normalized)) return 5;
  if (/class\s*i(?![iv])|\bi\b|cash|deposit/.test(normalized)) return 1;
  return 7;
}

function addDays(dateValue: string, days: number): string {
  const date = new Date(`${dateValue}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function addMonths(dateValue: string, months: number): string {
  const date = new Date(`${dateValue}T00:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + Math.round(months));
  return date.toISOString().slice(0, 10);
}

function monthsUntil(dateValue: string | null, asOfDateValue: string | null): number | null {
  if (!dateValue || !asOfDateValue) return null;
  const expiry = new Date(`${dateValue}T00:00:00Z`);
  const asOf = new Date(`${asOfDateValue}T00:00:00Z`);
  if (Number.isNaN(expiry.getTime())) return null;
  if (Number.isNaN(asOf.getTime())) return null;
  const years = expiry.getUTCFullYear() - asOf.getUTCFullYear();
  const months = expiry.getUTCMonth() - asOf.getUTCMonth();
  return Math.max(0, years * 12 + months);
}

function yearsBetween(startDateValue: string, endDateValue: string): number {
  const start = new Date(`${startDateValue}T00:00:00Z`);
  const end = new Date(`${endDateValue}T00:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  return Math.max(0, (end.getTime() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}

function proRataFromArea(tenantArea: number | null, totalArea: number | null): number | null {
  if (tenantArea == null || totalArea == null || totalArea <= 0) return null;
  return tenantArea / totalArea;
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
