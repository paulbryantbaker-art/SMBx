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
}

const SELL_GATES: GateDef[] = [
  { id: 'S0', journey: 'sell', index: 0, name: 'Intake', free: true,
    requiredFields: ['business_name', 'industry', 'location', 'revenue'] },
  { id: 'S1', journey: 'sell', index: 1, name: 'Financials', free: true,
    requiredFields: ['sde', 'owner_salary', 'net_income'] },
  { id: 'S2', journey: 'sell', index: 2, name: 'Valuation', free: false,
    requiredFields: ['valuation_range', 'multiple_range'] },
  { id: 'S3', journey: 'sell', index: 3, name: 'Packaging', free: false,
    requiredFields: ['cim_generated'] },
  { id: 'S4', journey: 'sell', index: 4, name: 'Market Matching', free: false,
    requiredFields: ['buyer_list_generated'] },
  { id: 'S5', journey: 'sell', index: 5, name: 'Closing', free: false,
    requiredFields: [] },
];

const BUY_GATES: GateDef[] = [
  { id: 'B0', journey: 'buy', index: 0, name: 'Thesis', free: true,
    requiredFields: ['target_industry', 'target_size_range', 'financing_approach'] },
  { id: 'B1', journey: 'buy', index: 1, name: 'Sourcing', free: true,
    requiredFields: ['target_criteria_set'] },
  { id: 'B2', journey: 'buy', index: 2, name: 'Valuation', free: false,
    requiredFields: ['target_valuation_range'] },
  { id: 'B3', journey: 'buy', index: 3, name: 'Due Diligence', free: false,
    requiredFields: ['dd_checklist_generated'] },
  { id: 'B4', journey: 'buy', index: 4, name: 'Structuring', free: false,
    requiredFields: ['deal_structure_modeled'] },
  { id: 'B5', journey: 'buy', index: 5, name: 'Closing', free: false,
    requiredFields: [] },
];

const RAISE_GATES: GateDef[] = [
  { id: 'R0', journey: 'raise', index: 0, name: 'Intake', free: true,
    requiredFields: ['raise_amount', 'capital_use', 'current_revenue'] },
  { id: 'R1', journey: 'raise', index: 1, name: 'Financial Package', free: true,
    requiredFields: ['financial_package_prepared'] },
  { id: 'R2', journey: 'raise', index: 2, name: 'Investor Materials', free: false,
    requiredFields: ['pitch_deck_generated'] },
  { id: 'R3', journey: 'raise', index: 3, name: 'Outreach', free: false,
    requiredFields: ['investor_list_generated'] },
  { id: 'R4', journey: 'raise', index: 4, name: 'Terms', free: false,
    requiredFields: ['term_sheet_analyzed'] },
  { id: 'R5', journey: 'raise', index: 5, name: 'Closing', free: false,
    requiredFields: [] },
];

const PMI_GATES: GateDef[] = [
  { id: 'PMI0', journey: 'pmi', index: 0, name: 'Day Zero', free: true,
    requiredFields: ['acquisition_details', 'close_date'] },
  { id: 'PMI1', journey: 'pmi', index: 1, name: 'Stabilization', free: false,
    requiredFields: ['day_zero_checklist_complete'] },
  { id: 'PMI2', journey: 'pmi', index: 2, name: 'Assessment', free: false,
    requiredFields: ['assessment_complete'] },
  { id: 'PMI3', journey: 'pmi', index: 3, name: 'Optimization', free: false,
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
