/**
 * Deal Execution Fee — DEPRECATED. Now uses subscription model.
 *
 * This file is kept for backward compatibility with existing code
 * that references these functions. All pricing is now handled by
 * subscriptionService.ts.
 */
import { sql } from '../db.js';
import { getUserPlan, planMeetsRequirement } from './subscriptionService.js';

/**
 * @deprecated Use subscriptionService.getUserPlan() instead.
 * Check if a deal's execution fee has been paid (or user has a subscription).
 */
export async function isExecutionFeePaid(dealId: number): Promise<boolean> {
  if (process.env.TEST_MODE === 'true' || process.env.DEV_NO_PAYWALL === 'true') return true;

  // Check if deal's owner has an active subscription
  const [deal] = await sql`SELECT user_id, platform_fee_paid FROM deals WHERE id = ${dealId}`;
  if (!deal) return false;

  // Legacy: if platform_fee_paid is true, honor it
  if (deal.platform_fee_paid) return true;

  // New: check subscription
  const plan = await getUserPlan(deal.user_id);
  return planMeetsRequirement(plan, 'starter');
}

/**
 * @deprecated Use subscriptionService.setUserPlan() instead.
 * Legacy function kept for backward compat.
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

/**
 * @deprecated No longer relevant — subscriptions replace per-deal fees.
 */
export interface ExecutionFeeResult {
  feeCents: number;
  feeDisplay: string;
  basis: 'SDE' | 'EBITDA';
  basisAmountCents: number;
  basisDisplay: string;
  isMinimum: boolean;
}

/**
 * @deprecated Kept for backward compat. Returns a stub result.
 */
export function calculateExecutionFee(deal: {
  sde?: number | null;
  ebitda?: number | null;
}): ExecutionFeeResult {
  return {
    feeCents: 0,
    feeDisplay: '$0',
    basis: 'SDE',
    basisAmountCents: 0,
    basisDisplay: '$0',
    isMinimum: false,
  };
}

// ─── Free-tier deliverable classification ──────────────────

const FREE_GATES = new Set(['S0', 'S1', 'B0', 'B1', 'R0', 'R1', 'PMI0']);

const ALWAYS_FREE_TYPES = new Set([
  'valuelens',
  'value_lens',
  'bizestimate',
  'value_readiness_report',
  'investment_thesis',
  'preliminary_sde',
  'preliminary_ebitda',
  'capital_stack_template',
  'deal_scoring',
]);

/**
 * Check if a deliverable is free-tier (no subscription required).
 */
export function isFreeTierDeliverable(gate: string | null, deliverableType?: string): boolean {
  if (deliverableType && ALWAYS_FREE_TYPES.has(deliverableType.toLowerCase())) return true;
  if (!gate) return false;
  return FREE_GATES.has(gate);
}
