/**
 * Subscription Service — Monthly subscription model.
 *
 * Plans: free (default), starter ($49), professional ($149), enterprise ($999).
 * Free tier: S0-S1, B0-B1, R0-R1, PMI0 + one free deliverable per deal.
 * Starter: Unlimited analysis, valuations, financial models, document exports.
 * Professional: Everything — CIM, deal room, matching, sourcing, and more.
 * Enterprise: Teams, API, white-label, portfolio tools.
 */
import Stripe from 'stripe';
import { sql } from '../db.js';

// ─── Plan hierarchy ─────────────────────────────────────────
export type Plan = 'free' | 'starter' | 'professional' | 'enterprise';

const PLAN_RANK: Record<Plan, number> = {
  free: 0,
  starter: 1,
  professional: 2,
  enterprise: 3,
};

export interface PlanInfo {
  plan: Plan;
  name: string;
  priceCents: number;
  priceDisplay: string;
  note: string;
}

export const PLANS: Record<Plan, PlanInfo> = {
  free: { plan: 'free', name: 'Free', priceCents: 0, priceDisplay: 'Free', note: 'Explore and analyze with Yulia' },
  starter: { plan: 'starter', name: 'Starter', priceCents: 4900, priceDisplay: '$49/month', note: 'Unlimited analysis and document exports' },
  professional: { plan: 'professional', name: 'Professional', priceCents: 14900, priceDisplay: '$149/month', note: 'CIM, deal room, matching, and more' },
  enterprise: { plan: 'enterprise', name: 'Enterprise', priceCents: 99900, priceDisplay: '$999/month', note: 'Teams, API, white-label, portfolio' },
};

// ─── Stripe price IDs (set via env vars or fall back to test mode) ──
function getStripePriceId(plan: Plan): string | null {
  const envKey = `STRIPE_PRICE_${plan.toUpperCase()}`;
  return process.env[envKey] || null;
}

function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY not set');
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

// ─── Core access logic ──────────────────────────────────────

/** Get user's current plan */
export async function getUserPlan(userId: number): Promise<Plan> {
  if (process.env.TEST_MODE === 'true' || process.env.DEV_NO_PAYWALL === 'true') {
    return 'professional';
  }
  const [user] = await sql`SELECT plan FROM users WHERE id = ${userId}`;
  return (user?.plan as Plan) || 'free';
}

/** Check if user's plan meets or exceeds a required plan */
export function planMeetsRequirement(userPlan: Plan, requiredPlan: Plan): boolean {
  return PLAN_RANK[userPlan] >= PLAN_RANK[requiredPlan];
}

/** Determine the minimum plan required for a deliverable type */
export function getRequiredPlan(deliverableType: string, gate?: string | null): Plan {
  const dt = deliverableType.toLowerCase();

  // Always-free deliverables (any plan)
  const FREE_TYPES = new Set([
    'valuelens', 'value_lens', 'bizestimate',
    'value_readiness_report',
    'investment_thesis', 'buy_investment_thesis',
    'preliminary_sde', 'preliminary_ebitda',
    'capital_stack_template', 'buy_capital_stack_template',
    'deal_scoring',
  ]);
  if (FREE_TYPES.has(dt)) return 'free';

  // Free gates — deliverables in S0-S1, B0-B1, R0-R1, PMI0 are free
  const FREE_GATES = new Set(['S0', 'S1', 'B0', 'B1', 'R0', 'R1', 'PMI0']);
  if (gate && FREE_GATES.has(gate)) return 'free';

  // Starter-tier deliverables
  const STARTER_TYPES = new Set([
    'valuation_report', 'sell_valuation_report', 'buy_valuation_model',
    'sba_bankability_report', 'buy_sba_bankability',
    'capital_structure_analysis', 'buy_capital_structure',
    'financial_model', 'sell_financial_model',
    'intelligence_report',
    'blind_teaser', 'sell_blind_teaser',
    'deal_scoring', 'buy_deal_screening_memo',
    'working_capital_analysis',
    'tax_impact_analysis',
    'sector_analysis',
  ]);
  if (STARTER_TYPES.has(dt)) return 'starter';

  // Professional-tier deliverables
  const PROFESSIONAL_TYPES = new Set([
    'cim', 'sell_cim_draft',
    'loi', 'buy_loi_draft',
    'dd_package', 'buy_dd_checklist',
    'buyer_list', 'sell_buyer_list',
    'pitch_deck', 'raise_pitch_deck',
    'executive_summary', 'raise_executive_summary',
    'closing_checklist', 'sell_closing_checklist', 'buy_closing_checklist',
    'funds_flow_statement', 'sell_funds_flow',
    'outreach_strategy',
    'lbo_model',
    'value_creation_plan',
    'data_room_structure',
    'pmi_integration_plan',
  ]);
  if (PROFESSIONAL_TYPES.has(dt)) return 'professional';

  // Default: starter for analysis-type, professional for documents
  return 'starter';
}

/** Check if user can generate a deliverable */
export async function canGenerateDeliverable(
  userId: number,
  deliverableType: string,
  gate?: string | null,
): Promise<{ allowed: boolean; requiredPlan: Plan; userPlan: Plan }> {
  const userPlan = await getUserPlan(userId);
  const requiredPlan = getRequiredPlan(deliverableType, gate);
  return {
    allowed: planMeetsRequirement(userPlan, requiredPlan),
    requiredPlan,
    userPlan,
  };
}

/** Check if user has access to a gate */
export function canAccessGate(userPlan: Plan, gateId: string): boolean {
  const FREE_GATES = new Set(['S0', 'S1', 'B0', 'B1', 'R0', 'R1', 'PMI0', 'PMI1', 'PMI2', 'PMI3']);
  if (FREE_GATES.has(gateId)) return true;

  // S2+ B2+ R2+ require at least starter
  return PLAN_RANK[userPlan] >= PLAN_RANK.starter;
}

// ─── Stripe subscription management ─────────────────────────

/** Create a Stripe Checkout Session for subscription */
export async function createSubscriptionCheckout(
  userId: number,
  plan: Plan,
): Promise<{ url: string; test?: boolean }> {
  if (plan === 'free') throw new Error('Cannot create checkout for free plan');

  // TEST_MODE: mark as subscribed immediately
  if (process.env.TEST_MODE === 'true') {
    await setUserPlan(userId, plan, 'test_sub_' + Date.now(), 'test_cust_' + Date.now());
    const appUrl = process.env.APP_URL || 'https://smbx.ai';
    return { url: `${appUrl}/chat?subscription=success&plan=${plan}`, test: true };
  }

  const [user] = await sql`SELECT email, stripe_customer_id FROM users WHERE id = ${userId}`;
  if (!user) throw new Error('User not found');

  const stripe = getStripe();
  const appUrl = process.env.APP_URL || 'https://smbx.ai';

  const priceId = getStripePriceId(plan);
  if (!priceId) throw new Error(`Stripe price not configured for plan: ${plan}`);

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: {
      type: 'subscription',
      userId: userId.toString(),
      plan,
    },
    success_url: `${appUrl}/chat?subscription=success&plan=${plan}`,
    cancel_url: `${appUrl}/chat?subscription=cancelled`,
  };

  // Reuse existing Stripe customer if available
  if (user.stripe_customer_id) {
    sessionParams.customer = user.stripe_customer_id;
  } else {
    sessionParams.customer_email = user.email as string;
  }

  const session = await stripe.checkout.sessions.create(sessionParams);
  return { url: session.url! };
}

/** Create a Stripe Customer Portal session for managing subscription */
export async function createCustomerPortal(userId: number): Promise<string> {
  const [user] = await sql`SELECT stripe_customer_id FROM users WHERE id = ${userId}`;
  if (!user?.stripe_customer_id) throw new Error('No Stripe customer found');

  const stripe = getStripe();
  const appUrl = process.env.APP_URL || 'https://smbx.ai';

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripe_customer_id,
    return_url: `${appUrl}/chat`,
  });

  return session.url;
}

/** Set user plan (called from webhook or TEST_MODE) */
export async function setUserPlan(
  userId: number,
  plan: Plan,
  stripeSubscriptionId?: string,
  stripeCustomerId?: string,
): Promise<void> {
  await sql`
    UPDATE users SET
      plan = ${plan},
      stripe_customer_id = COALESCE(${stripeCustomerId || null}, stripe_customer_id),
      updated_at = NOW()
    WHERE id = ${userId}
  `;

  // Upsert subscription record
  if (stripeSubscriptionId) {
    await sql`
      INSERT INTO subscriptions (user_id, plan, status, stripe_subscription_id, stripe_customer_id)
      VALUES (${userId}, ${plan}, 'active', ${stripeSubscriptionId}, ${stripeCustomerId || null})
      ON CONFLICT (user_id) DO UPDATE SET
        plan = ${plan},
        status = 'active',
        stripe_subscription_id = ${stripeSubscriptionId},
        stripe_customer_id = COALESCE(${stripeCustomerId || null}, subscriptions.stripe_customer_id),
        updated_at = NOW()
    `;
  }
}

/** Handle subscription cancellation */
export async function cancelSubscription(userId: number): Promise<void> {
  await sql`UPDATE users SET plan = 'free', updated_at = NOW() WHERE id = ${userId}`;
  await sql`
    UPDATE subscriptions SET status = 'canceled', updated_at = NOW()
    WHERE user_id = ${userId} AND status = 'active'
  `;
}

/** Get subscription details */
export async function getSubscription(userId: number) {
  const [sub] = await sql`
    SELECT * FROM subscriptions WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 1
  `;
  return sub || null;
}
