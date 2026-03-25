/**
 * Deal Execution Fee — 0.1% of SDE or EBITDA, $999 minimum.
 * One-time payment per deal. Unlocks all deliverables through closing + 180 days.
 *
 * All amounts in CENTS (integers).
 */
import { sql } from '../db.js';

const FEE_RATE = 0.001;           // 0.1%
const MINIMUM_FEE_CENTS = 99900;  // $999

export interface ExecutionFeeResult {
  feeCents: number;
  feeDisplay: string;
  basis: 'SDE' | 'EBITDA';
  basisAmountCents: number;
  basisDisplay: string;
  isMinimum: boolean;
}

/**
 * Calculate the deal execution fee from deal financials.
 * Uses EBITDA if available (L3+), otherwise SDE.
 */
export function calculateExecutionFee(deal: {
  sde?: number | null;      // cents
  ebitda?: number | null;   // cents
}): ExecutionFeeResult {
  const ebitda = deal.ebitda || 0;
  const sde = deal.sde || 0;

  // Use EBITDA if available and > 0, otherwise SDE
  const useEbitda = ebitda > 0;
  const basisCents = useEbitda ? ebitda : sde;
  const basis: 'SDE' | 'EBITDA' = useEbitda ? 'EBITDA' : 'SDE';

  const rawFeeCents = Math.round(basisCents * FEE_RATE);
  const feeCents = Math.max(MINIMUM_FEE_CENTS, rawFeeCents);
  const isMinimum = rawFeeCents < MINIMUM_FEE_CENTS;

  return {
    feeCents,
    feeDisplay: `$${(feeCents / 100).toLocaleString('en-US')}`,
    basis,
    basisAmountCents: basisCents,
    basisDisplay: `$${(basisCents / 100).toLocaleString('en-US')}`,
    isMinimum,
  };
}

/**
 * Check if a deal's execution fee has been paid.
 */
export async function isExecutionFeePaid(dealId: number): Promise<boolean> {
  if (process.env.TEST_MODE === 'true' || process.env.DEV_NO_PAYWALL === 'true') return true;
  const [deal] = await sql`SELECT platform_fee_paid FROM deals WHERE id = ${dealId}`;
  return deal?.platform_fee_paid === true;
}

/**
 * Mark a deal's execution fee as paid.
 */
export async function markExecutionFeePaid(
  dealId: number,
  amountCents: number,
  stripePaymentId?: string,
): Promise<void> {
  await sql`
    UPDATE deals SET
      platform_fee_paid = true,
      platform_fee_cents = ${amountCents},
      platform_fee_paid_at = NOW(),
      stripe_payment_intent_id = ${stripePaymentId || null}
    WHERE id = ${dealId}
  `;
}

// ─── Free-tier deliverable classification ──────────────────

const FREE_GATES = new Set(['S0', 'S1', 'B0', 'B1', 'R0', 'R1', 'PMI0']);

/** Deliverables that are always free regardless of gate */
const ALWAYS_FREE_TYPES = new Set([
  'valuelens',
  'value_lens',
  'bizestimate',       // legacy alias
  'value_readiness_report',
  'deal_scoring',
  // CIM is PAID — behind S2/B2 paywall, included in platform fee
]);

/**
 * Check if a deliverable is free-tier (no payment required).
 */
export function isFreeTierDeliverable(gate: string | null, deliverableType?: string): boolean {
  if (deliverableType && ALWAYS_FREE_TYPES.has(deliverableType.toLowerCase())) return true;
  if (!gate) return false;
  return FREE_GATES.has(gate);
}
