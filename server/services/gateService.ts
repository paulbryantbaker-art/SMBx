/**
 * Gate Service — Anonymous gate advancement for conversations.
 *
 * Checks whether extracted conversation data meets gate requirements,
 * determines the completion deliverable, and advances the gate.
 */
import postgres from 'postgres';
import { checkGateReadiness } from './gateReadinessService.js';

const sql = postgres(process.env.DATABASE_URL!, {
  ssl: 'require',
  prepare: false,
});

// ─── Types ───────────────────────────────────────────────────

export type DeliverableType = 'value_readiness_report' | 'thesis_document' | 'sde_analysis';

export interface GateAdvancementResult {
  shouldAdvance: boolean;
  nextGate: string | null;
  completionDeliverable: DeliverableType | null;
}

// Map from current gate → deliverable generated on completion
const GATE_COMPLETION_DELIVERABLES: Record<string, DeliverableType> = {
  S0: 'value_readiness_report',
  B0: 'thesis_document',
  S1: 'sde_analysis',
};

// ─── Check Gate Advancement ──────────────────────────────────

/**
 * Check whether the anonymous conversation has met its current gate's
 * requirements, using extracted_data mapped into a deal-like shape.
 */
export function checkAnonymousGateAdvancement(
  currentGate: string | null,
  extractedData: Record<string, any>,
  journey: string | null,
  league: string | null,
): GateAdvancementResult {
  if (!currentGate || !journey) {
    return { shouldAdvance: false, nextGate: null, completionDeliverable: null };
  }

  // Build a deal-like object that the existing gate checker understands
  const dealLike = buildDealLikeFromExtracted(extractedData, journey, league);
  const readiness = checkGateReadiness(currentGate, dealLike);

  if (!readiness.ready || !readiness.nextGate) {
    return { shouldAdvance: false, nextGate: null, completionDeliverable: null };
  }

  const deliverable = GATE_COMPLETION_DELIVERABLES[currentGate] || null;

  return {
    shouldAdvance: true,
    nextGate: readiness.nextGate,
    completionDeliverable: deliverable,
  };
}

// ─── Advance Gate ────────────────────────────────────────────

/**
 * Advance the conversation's current_gate to the next gate.
 */
export async function advanceAnonymousGate(
  convId: number,
  nextGate: string,
): Promise<void> {
  await sql`
    UPDATE conversations
    SET current_gate = ${nextGate}, updated_at = NOW()
    WHERE id = ${convId}
  `;
}

// ─── Helper: Map extracted_data → deal-like object ───────────

function buildDealLikeFromExtracted(
  data: Record<string, any>,
  journey: string,
  league: string | null,
): Record<string, any> {
  if (journey === 'buy') {
    return {
      industry: data.target_industry || data.industry || null,
      location: data.target_geography || data.location || null,
      revenue: data.revenue || null,
      league,
      sde: data.sde || null,
      ebitda: data.ebitda || null,
      owner_salary: null,
      financials: {
        capital_available: data.capital_available,
        acquisition_budget: data.capital_available,
        financing_preference: data.financing_approach,
        financing_approach: data.financing_approach,
        target_industry: data.target_industry,
        target_geography: data.target_geography,
        target_size_range: data.target_size_range,
        buyer_type: data.buyer_type,
        pipeline_started: data.pipeline_started,
        target_criteria_set: data.target_criteria_set,
      },
    };
  }

  // Sell / Raise / PMI
  return {
    industry: data.industry || null,
    location: data.location || null,
    revenue: data.revenue || null,
    league,
    sde: data.sde || null,
    ebitda: data.ebitda || null,
    asking_price: data.asking_price || null,
    business_name: data.business_name || null,
    owner_salary: data.owner_compensation || data.owner_salary || null,
    financials: {
      exit_motivation: data.exit_motivation,
      reason_for_selling: data.exit_motivation,
      timeline_preference: data.timeline_preference,
      timeline: data.timeline_preference,
      owner_compensation: data.owner_compensation || data.owner_salary,
      net_income: data.net_income,
      add_backs_confirmed: data.add_backs_confirmed,
      add_backs_documented: data.add_backs_confirmed,
      // Raise fields
      raise_amount: data.raise_amount,
      equity_range: data.equity_range,
      capital_use: data.capital_use,
      use_of_funds: data.capital_use,
      investor_type_preference: data.investor_type_preference,
    },
  };
}
