/**
 * Gate Registry — 22 gates across 4 journeys.
 * Single source of truth for gate definitions, ordering, and pricing.
 */

export interface GateDef {
  id: string;
  journey: 'sell' | 'buy' | 'raise' | 'pmi';
  index: number;
  name: string;
  free: boolean;
  /** Fields Yulia must extract before this gate can be considered complete */
  requiredFields: string[];
  /** V19 server-side models required before model-backed claims or exports at this gate */
  requiredModels?: string[];
  /** V19 citation tags that should be validated before external-fact claims at this gate */
  requiredCitations?: string[];
  /** Legal/tax/regulated triggers that always halt to approval or counsel deferral */
  alwaysHaltTriggers?: string[];
}

export interface GateV19Requirements {
  requiredModels: string[];
  requiredCitations: string[];
  alwaysHaltTriggers: string[];
}

/**
 * Subscription model: S2/B2/R2 require at least Solo plan ($79/mo).
 * Gates before the paywall are free. Gates after the paywall are included
 * in the subscription. PMI gates are always free.
 * The `free` field marks gates accessible without a subscription.
 */
const SELL_GATES: GateDef[] = [
  { id: 'S0', journey: 'sell', index: 0, name: 'Intake', free: true,
    requiredFields: ['business_name', 'industry', 'location', 'revenue'] },
  { id: 'S1', journey: 'sell', index: 1, name: 'Financials', free: true,
    requiredFields: ['sde', 'owner_salary', 'net_income'] },
  { id: 'S2', journey: 'sell', index: 2, name: 'Valuation', free: false,
    requiredFields: ['valuation_range', 'multiple_range'] },
  { id: 'S3', journey: 'sell', index: 3, name: 'Packaging', free: true,
    requiredFields: ['cim_generated'] },
  { id: 'S4', journey: 'sell', index: 4, name: 'Market Matching', free: true,
    requiredFields: ['buyer_list_generated'] },
  { id: 'S5', journey: 'sell', index: 5, name: 'Closing', free: true,
    requiredFields: [] },
];

const BUY_GATES: GateDef[] = [
  { id: 'B0', journey: 'buy', index: 0, name: 'Thesis', free: true,
    requiredFields: ['target_industry', 'target_size_range', 'financing_approach'] },
  { id: 'B1', journey: 'buy', index: 1, name: 'Sourcing', free: true,
    requiredFields: ['target_criteria_set'] },
  { id: 'B2', journey: 'buy', index: 2, name: 'Valuation', free: false,
    requiredFields: ['target_valuation_range'] },
  { id: 'B3', journey: 'buy', index: 3, name: 'Due Diligence', free: true,
    requiredFields: ['dd_checklist_generated'] },
  { id: 'B4', journey: 'buy', index: 4, name: 'Structuring', free: true,
    requiredFields: ['deal_structure_modeled'] },
  { id: 'B5', journey: 'buy', index: 5, name: 'Closing', free: true,
    requiredFields: [] },
];

const RAISE_GATES: GateDef[] = [
  { id: 'R0', journey: 'raise', index: 0, name: 'Intake', free: true,
    requiredFields: ['raise_amount', 'capital_use', 'current_revenue'] },
  { id: 'R1', journey: 'raise', index: 1, name: 'Financial Package', free: true,
    requiredFields: ['financial_package_prepared'] },
  { id: 'R2', journey: 'raise', index: 2, name: 'Investor Materials', free: false,
    requiredFields: ['pitch_deck_generated'] },
  { id: 'R3', journey: 'raise', index: 3, name: 'Outreach', free: true,
    requiredFields: ['investor_list_generated'] },
  { id: 'R4', journey: 'raise', index: 4, name: 'Terms', free: true,
    requiredFields: ['term_sheet_analyzed'] },
  { id: 'R5', journey: 'raise', index: 5, name: 'Closing', free: true,
    requiredFields: [] },
];

const PMI_GATES: GateDef[] = [
  { id: 'PMI0', journey: 'pmi', index: 0, name: 'Day Zero', free: true,
    requiredFields: ['acquisition_details', 'close_date'] },
  { id: 'PMI1', journey: 'pmi', index: 1, name: 'Stabilization', free: true,
    requiredFields: ['day_zero_checklist_complete'] },
  { id: 'PMI2', journey: 'pmi', index: 2, name: 'Assessment', free: true,
    requiredFields: ['assessment_complete'] },
  { id: 'PMI3', journey: 'pmi', index: 3, name: 'Optimization', free: true,
    requiredFields: [] },
];

/** All 22 gates in a flat array, ordered by journey then index */
export const ALL_GATES: GateDef[] = [
  ...SELL_GATES,
  ...BUY_GATES,
  ...RAISE_GATES,
  ...PMI_GATES,
];

/** Lookup by gate ID (e.g. 'S0', 'B2', 'PMI1') */
export const GATE_MAP: Record<string, GateDef> = Object.fromEntries(
  ALL_GATES.map(g => [g.id, g])
);

/** Get all gates for a journey */
export function getJourneyGates(journey: string): GateDef[] {
  return ALL_GATES.filter(g => g.journey === journey);
}

/** Get the first gate for a journey */
export function getFirstGate(journey: string): string {
  const gates = getJourneyGates(journey);
  return gates.length > 0 ? gates[0].id : 'S0';
}

/** Get the next gate ID, or null if at the end */
export function getNextGate(currentGate: string): string | null {
  const gate = GATE_MAP[currentGate];
  if (!gate) return null;
  const journeyGates = getJourneyGates(gate.journey);
  const next = journeyGates.find(g => g.index === gate.index + 1);
  return next ? next.id : null;
}

/** Check if a gate is free (no payment required) */
export function isGateFree(gateId: string): boolean {
  return GATE_MAP[gateId]?.free ?? false;
}

/** Map journey context strings from the frontend to journey types */
export function contextToJourney(context?: string): 'sell' | 'buy' | 'raise' | 'pmi' | null {
  if (!context) return null;
  const map: Record<string, 'sell' | 'buy' | 'raise' | 'pmi'> = {
    sell: 'sell',
    buy: 'buy',
    raise: 'raise',
    integrate: 'pmi',
    agency: 'sell',       // default to sell for agency context
    intelligence: 'sell', // default to sell for intelligence context
  };
  return map[context] || null;
}

const COMMON_HALT_TRIGGERS = [
  'legal_opinion_required',
  'tax_position_required',
  'regulated_industry_transfer',
  'consent_or_assignment_issue',
  'closing_document_signoff',
];

const GATE_V19_REQUIREMENTS: Record<string, GateV19Requirements> = {
  S0: { requiredModels: [], requiredCitations: [], alwaysHaltTriggers: [] },
  S1: { requiredModels: ['MODEL.VAL.SDE.v1', 'MODEL.VAL.EBITDA.v1', 'MODEL.QOE.LITE.v1'], requiredCitations: ['[Pepperdine PCAP 2025]', '[ABA 2025]'], alwaysHaltTriggers: ['unsupported_add_back'] },
  S2: { requiredModels: ['MODEL.VAL.TRIANGULATION.v1', 'MODEL.MARKET.CONTEXT.v1'], requiredCitations: ['[Damodaran 2026]', '[Kroll 2024]', '[Pepperdine PCAP 2025]'], alwaysHaltTriggers: ['unsourced_valuation_metric'] },
  S3: { requiredModels: ['MODEL.QOE.LITE.v1', 'MODEL.STRUCT.NWC.PEG.v1', 'MODEL.BUYER.FIT.v1'], requiredCitations: ['[ABA 2025]', '[SRS 2025]'], alwaysHaltTriggers: ['customer_facing_unsourced_claim'] },
  S4: { requiredModels: ['MODEL.BUYER.FIT.v1', 'MODEL.MARKET.CONTEXT.v1'], requiredCitations: ['[Pepperdine PCAP 2025]'], alwaysHaltTriggers: [] },
  S5: { requiredModels: ['MODEL.LEGAL.HALTSCAN.v1', 'MODEL.TAX.STRUCTURE.v1'], requiredCitations: ['[SBA SOP 50 10 8]', '[FTC 2026 HSR - Size of Transaction]'], alwaysHaltTriggers: COMMON_HALT_TRIGGERS },

  B0: { requiredModels: ['MODEL.BUYER.FIT.v1', 'MODEL.MARKET.CONTEXT.v1'], requiredCitations: ['[Pepperdine PCAP 2025]'], alwaysHaltTriggers: [] },
  B1: { requiredModels: ['MODEL.BUYER.FIT.v1', 'MODEL.DEAL.SCORE.v1'], requiredCitations: ['[Pepperdine PCAP 2025]'], alwaysHaltTriggers: [] },
  B2: { requiredModels: ['MODEL.VAL.TRIANGULATION.v1', 'MODEL.DSCR.STRESS.v1', 'MODEL.SOURCES.USES.v1'], requiredCitations: ['[Damodaran 2026]', '[Kroll 2024]', '[SBA SOP 50 10 8]'], alwaysHaltTriggers: ['unsourced_valuation_metric'] },
  B3: { requiredModels: ['MODEL.QOE.LITE.v1', 'MODEL.STRUCT.NWC.PEG.v1', 'MODEL.LEGAL.HALTSCAN.v1'], requiredCitations: ['[ABA 2025]', '[SRS 2025]'], alwaysHaltTriggers: ['unsupported_add_back', 'missing_diligence_file'] },
  B4: { requiredModels: ['MODEL.TAX.STRUCTURE.v1', 'MODEL.STRUCT.ANALYSIS.v1', 'MODEL.STRUCT.ROLLOVER.v1', 'MODEL.STRUCT.EARNOUT.MC.v1'], requiredCitations: ['[OBBBA Sec. 70301]', '[OBBBA Sec. 70302]', '[OBBBA Sec. 70505]'], alwaysHaltTriggers: COMMON_HALT_TRIGGERS },
  B5: { requiredModels: ['MODEL.LEGAL.HALTSCAN.v1', 'MODEL.HSR.TRIAGE.v1'], requiredCitations: ['[FTC 2026 HSR - Size of Transaction]', '[FTC 2026 HSR - Auto-Reportable]'], alwaysHaltTriggers: COMMON_HALT_TRIGGERS },

  R0: { requiredModels: ['MODEL.MARKET.CONTEXT.v1'], requiredCitations: ['[FRED:SOFR]', '[FRED:DGS10]'], alwaysHaltTriggers: [] },
  R1: { requiredModels: ['MODEL.VAL.DCF.TWOSTAGE.v1', 'MODEL.CAPTABLE.DILUTION.v1'], requiredCitations: ['[Damodaran 2026]', '[Kroll 2024]'], alwaysHaltTriggers: ['unsourced_forecast'] },
  R2: { requiredModels: ['MODEL.CAPTABLE.DILUTION.v1', 'MODEL.VAL.DCF.TWOSTAGE.v1'], requiredCitations: ['[Damodaran 2026]', '[Kroll 2024]'], alwaysHaltTriggers: ['customer_facing_unsourced_claim'] },
  R3: { requiredModels: ['MODEL.MARKET.CONTEXT.v1'], requiredCitations: ['[FRED:SOFR]', '[FRED:DGS10]'], alwaysHaltTriggers: [] },
  R4: { requiredModels: ['MODEL.TAX.STRUCTURE.v1', 'MODEL.LEGAL.HALTSCAN.v1'], requiredCitations: ['[OBBBA Sec. 70425]', '[OBBBA Sec. 70505]'], alwaysHaltTriggers: COMMON_HALT_TRIGGERS },
  R5: { requiredModels: ['MODEL.LEGAL.HALTSCAN.v1'], requiredCitations: [], alwaysHaltTriggers: COMMON_HALT_TRIGGERS },

  PMI0: { requiredModels: ['MODEL.PMI.VALUE.CREATION.v1'], requiredCitations: [], alwaysHaltTriggers: ['closing_document_signoff'] },
  PMI1: { requiredModels: ['MODEL.PMI.VALUE.CREATION.v1', 'MODEL.COVENANT.COMPLIANCE.v1'], requiredCitations: [], alwaysHaltTriggers: [] },
  PMI2: { requiredModels: ['MODEL.PMI.VALUE.CREATION.v1', 'MODEL.DEAL.SCORE.v1'], requiredCitations: [], alwaysHaltTriggers: [] },
  PMI3: { requiredModels: ['MODEL.PMI.VALUE.CREATION.v1', 'MODEL.SENSITIVITY.MATRIX.v1'], requiredCitations: [], alwaysHaltTriggers: [] },
};

export function getGateV19Requirements(gateId: string): GateV19Requirements {
  const gate = GATE_MAP[gateId];
  const requirements = GATE_V19_REQUIREMENTS[gateId] || { requiredModels: [], requiredCitations: [], alwaysHaltTriggers: [] };
  return {
    requiredModels: gate?.requiredModels || requirements.requiredModels,
    requiredCitations: gate?.requiredCitations || requirements.requiredCitations,
    alwaysHaltTriggers: gate?.alwaysHaltTriggers || requirements.alwaysHaltTriggers,
  };
}
