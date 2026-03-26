/**
 * Platform Fee Service — DEPRECATED. Now wraps subscription model.
 *
 * Kept for backward compatibility. All pricing is now handled by
 * subscriptionService.ts with monthly subscriptions.
 */
import { sql } from '../db.js';
import { getUserPlan, planMeetsRequirement, PLANS, type Plan } from './subscriptionService.js';

export interface PlatformFee {
  plan: Plan;
  planName: string;
  priceDisplay: string;
  isPaid: boolean;
}

/**
 * @deprecated Use subscriptionService.getUserPlan() instead.
 */
export async function getPlatformFee(dealId: number): Promise<PlatformFee> {
  const [deal] = await sql`SELECT user_id, platform_fee_paid FROM deals WHERE id = ${dealId}`;
  if (!deal) throw new Error(`Deal ${dealId} not found`);

  const plan = await getUserPlan(deal.user_id);
  const isPaid = planMeetsRequirement(plan, 'starter') || deal.platform_fee_paid;
  const planInfo = PLANS[plan];

  return {
    plan,
    planName: planInfo.name,
    priceDisplay: planInfo.priceDisplay,
    isPaid,
  };
}

/**
 * @deprecated Use subscriptionService.getUserPlan() instead.
 */
export async function isPlatformFeePaid(dealId: number): Promise<boolean> {
  if (process.env.TEST_MODE === 'true' || process.env.DEV_NO_PAYWALL === 'true') return true;

  const [deal] = await sql`SELECT user_id, platform_fee_paid FROM deals WHERE id = ${dealId}`;
  if (!deal) return false;

  if (deal.platform_fee_paid) return true;
  const plan = await getUserPlan(deal.user_id);
  return planMeetsRequirement(plan, 'starter');
}

/**
 * Get the traditional advisory cost comparison for a league.
 */
export function getAdvisoryCostComparison(league: string, journey: string): string {
  if (journey === 'sell') {
    if (league === 'L1' || league === 'L2') return '$15,000–$30,000 (typical business broker fee)';
    if (league === 'L3' || league === 'L4') return '$50,000–$150,000 (typical M&A advisory fee)';
    return '$200,000–$500,000+ (typical investment banking fee)';
  }
  if (journey === 'buy') {
    if (league === 'L1' || league === 'L2') return '$5,000–$15,000 (typical buy-side advisory)';
    if (league === 'L3' || league === 'L4') return '$25,000–$100,000 (typical acquisition advisory)';
    return '$100,000–$300,000+ (typical PE/IB advisory)';
  }
  if (league === 'L1' || league === 'L2') return '$10,000–$25,000 (typical capital raise advisory)';
  return '$50,000–$200,000+ (typical investment banking fee)';
}
