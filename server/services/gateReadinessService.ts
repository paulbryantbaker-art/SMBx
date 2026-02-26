/**
 * Gate Readiness Service — Determines when a deal can advance to the next gate.
 *
 * Each gate has specific data requirements and conditions.
 * Paywall gates (S2, B2, R2) require wallet balance.
 * Free gates (S0-S1, B0-B1, R0-R1, PMI0) advance automatically when conditions are met.
 */
import { GATE_MAP, getNextGate, isGateFree } from '../../shared/gateRegistry.js';

export interface GateReadinessResult {
  ready: boolean;
  missing: string[];
  paywallRequired: boolean;
  paywallGate?: string;
  nextGate: string | null;
}

/**
 * Check whether a deal is ready to advance from its current gate.
 * Returns missing fields, paywall status, and next gate.
 */
export function checkGateReadiness(
  currentGate: string,
  deal: {
    industry?: string | null;
    location?: string | null;
    revenue?: number | null;
    sde?: number | null;
    ebitda?: number | null;
    league?: string | null;
    asking_price?: number | null;
    business_name?: string | null;
    financials?: Record<string, any> | null;
  },
): GateReadinessResult {
  const nextGate = getNextGate(currentGate);
  const missing: string[] = [];

  // Gate-specific field requirements
  const checker = GATE_CHECKS[currentGate];
  if (checker) {
    checker(deal, missing);
  }

  // Check if the NEXT gate is a paywall
  const paywallRequired = nextGate ? !isGateFree(nextGate) : false;

  return {
    ready: missing.length === 0,
    missing,
    paywallRequired,
    paywallGate: paywallRequired && nextGate ? nextGate : undefined,
    nextGate,
  };
}

// ─── Gate completion checks ─────────────────────────────────

type GateChecker = (deal: Record<string, any>, missing: string[]) => void;

const f = (deal: Record<string, any>) => deal.financials || {};

const GATE_CHECKS: Record<string, GateChecker> = {
  // ══════ SELL ══════
  S0: (deal, missing) => {
    if (!deal.industry) missing.push('industry');
    if (!deal.location) missing.push('location');
    if (!deal.revenue) missing.push('revenue');
    if (!deal.league) missing.push('league classification');
    const fin = f(deal);
    if (!fin.exit_motivation && !fin.reason_for_selling) missing.push('exit motivation');
    if (!fin.timeline_preference && !fin.timeline) missing.push('timeline preference');
  },

  S1: (deal, missing) => {
    if (!deal.sde && !deal.ebitda) missing.push('SDE or EBITDA calculation');
    // Need at least 1 year of financials verified
    const fin = f(deal);
    if (!fin.net_income && !deal.sde && !deal.ebitda) missing.push('verified financials (at least 1 year)');
    // Add-backs should be documented
    if (!fin.add_backs_confirmed && !fin.add_backs_documented) missing.push('add-backs documented');
  },

  S2: (deal, missing) => {
    const fin = f(deal);
    if (!fin.valuation_generated && !fin.valuation_range) missing.push('valuation deliverable');
    if (!fin.go_no_go_decision) missing.push('go/no-go decision');
  },

  S3: (deal, missing) => {
    const fin = f(deal);
    if (!fin.cim_generated) missing.push('CIM generated');
    if (!fin.marketing_materials_approved) missing.push('marketing materials approved');
  },

  S4: (deal, missing) => {
    const fin = f(deal);
    if (!fin.buyer_list_generated) missing.push('buyer list');
    if (!fin.outreach_strategy_set) missing.push('outreach strategy');
  },

  S5: (_deal, _missing) => {
    // Final gate — completion is manual (deal closed)
  },

  // ══════ BUY ══════
  B0: (deal, missing) => {
    const fin = f(deal);
    if (!fin.capital_available && !fin.acquisition_budget) missing.push('capital available');
    if (!fin.financing_preference && !fin.financing_approach) missing.push('financing preference');
    if (!fin.target_industry && !deal.industry) missing.push('target industry');
    if (!fin.target_geography && !deal.location) missing.push('target geography');
    if (!fin.target_size_range && !deal.revenue) missing.push('target size range');
    if (!deal.league) missing.push('league classification');
  },

  B1: (deal, missing) => {
    const fin = f(deal);
    if (!fin.pipeline_started && !fin.target_criteria_set) missing.push('active deal pipeline');
  },

  B2: (deal, missing) => {
    const fin = f(deal);
    if (!fin.valuation_model_generated && !fin.target_valuation_range) missing.push('valuation model');
    if (!fin.financing_modeled) missing.push('financing model with DSCR');
  },

  B3: (deal, missing) => {
    const fin = f(deal);
    if (!fin.dd_findings_documented) missing.push('DD findings documented');
  },

  B4: (deal, missing) => {
    const fin = f(deal);
    if (!fin.financing_secured) missing.push('financing secured');
    if (!fin.deal_structure_agreed) missing.push('deal structure agreed');
  },

  B5: (_deal, _missing) => {
    // Final gate — completion is manual
  },

  // ══════ RAISE ══════
  R0: (deal, missing) => {
    const fin = f(deal);
    if (!fin.raise_amount) missing.push('raise amount');
    if (!fin.equity_range && !fin.equity_percentage) missing.push('equity range');
    if (!fin.capital_use && !fin.use_of_funds) missing.push('use of funds');
    if (!fin.investor_type_preference) missing.push('investor type preference');
  },

  R1: (deal, missing) => {
    const fin = f(deal);
    if (!fin.financial_package_prepared && !fin.projections_validated) missing.push('financial package');
    if (!fin.cap_table_created) missing.push('cap table');
  },

  R2: (deal, missing) => {
    const fin = f(deal);
    if (!fin.pitch_deck_generated && !fin.pitch_deck_approved) missing.push('pitch deck');
    if (!fin.executive_summary_finalized) missing.push('executive summary');
  },

  R3: (deal, missing) => {
    const fin = f(deal);
    if (!fin.investor_list_built) missing.push('investor list');
    if (!fin.outreach_initiated) missing.push('outreach initiated');
  },

  R4: (deal, missing) => {
    const fin = f(deal);
    if (!fin.term_sheet_received) missing.push('term sheet received');
    if (!fin.term_sheet_analyzed) missing.push('term sheet analysis');
  },

  R5: (_deal, _missing) => {
    // Final gate — completion is manual
  },

  // ══════ PMI ══════
  PMI0: (deal, missing) => {
    const fin = f(deal);
    if (!fin.acquisition_details && !deal.business_name) missing.push('acquisition details');
    if (!fin.close_date) missing.push('close date');
    if (!fin.day_zero_checklist_generated) missing.push('Day Zero checklist');
  },

  PMI1: (deal, missing) => {
    const fin = f(deal);
    if (!fin.employee_comms_delivered) missing.push('employee communications');
    if (!fin.customer_outreach_completed) missing.push('customer outreach');
  },

  PMI2: (deal, missing) => {
    const fin = f(deal);
    if (!fin.swot_completed) missing.push('SWOT analysis');
    if (!fin.quick_wins_identified) missing.push('quick wins identified');
  },

  PMI3: (_deal, _missing) => {
    // Final gate — completion is manual
  },
};

/** PAYWALL GATES — gates where user must pay before entering */
export const PAYWALL_GATES = new Set(['S2', 'B2', 'R2']);

/** Check if advancing to a gate requires payment */
export function isPaywallGate(gateId: string): boolean {
  return PAYWALL_GATES.has(gateId);
}

/** Get the base price for a paywall gate (in cents) */
export function getPaywallBasePrice(gateId: string): number {
  const prices: Record<string, number> = {
    S2: 1500,  // $15 base (Analyst tier)
    B2: 1500,  // $15 base
    R2: 5000,  // $50 base (Associate tier — more complex deliverable)
  };
  return prices[gateId] ?? 0;
}
