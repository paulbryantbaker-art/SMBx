/**
 * Subscription Service — CORE pricing engine for smbX.ai.
 *
 * Replaces: walletService, paywallService, dealExecutionFee, platformFeeService.
 *
 * Pricing model:
 *   Free     — $0      — Unlimited Yulia conversation + ONE structured deliverable (email required)
 *   Starter  — $49/mo  — Unlimited ValueLens, deal scoring, VRR, SDE/EBITDA, exports
 *   Professional — $149/mo — Everything + CIM, deal room, matching, sourcing, DD/LOI, living docs
 *   Enterprise   — $999/mo — Everything + unlimited users, white-label, API, portfolio dashboard
 *
 * Rules:
 *   - Monthly billing only. No annual pricing until 90 days of churn data.
 *   - 30-day free trial of Professional available.
 *   - No per-deal fees. No success fees. No hidden charges.
 *   - Free deliverable is per-USER, not per-session/deal. Tracked on users table.
 *   - Email capture required for the free deliverable (account creation moment).
 *   - Paywall triggers after first free deliverable, NOT at a fixed gate.
 *   - TEST_MODE=true bypasses all checks and grants enterprise access.
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
  free: { plan: 'free', name: 'Free', priceCents: 0, priceDisplay: 'Free', note: 'Unlimited Yulia conversation + one free deliverable' },
  starter: { plan: 'starter', name: 'Starter', priceCents: 4900, priceDisplay: '$49/month', note: 'Unlimited analysis, valuations, and exports' },
  professional: { plan: 'professional', name: 'Professional', priceCents: 14900, priceDisplay: '$149/month', note: 'CIM, deal room, matching, sourcing, living docs' },
  enterprise: { plan: 'enterprise', name: 'Enterprise', priceCents: 99900, priceDisplay: '$999/month', note: 'Unlimited users, white-label, API, portfolio' },
};

// ─── Deliverable tier classification ────────────────────────

const STARTER_TYPES = new Set([
  'valuelens', 'value_lens', 'value_readiness_report',
  'sde_analysis', 'ebitda_analysis',
  'investment_thesis', 'buy_investment_thesis',
  'capital_stack', 'capital_stack_template', 'buy_capital_stack_template',
  'deal_scoring', 'deal_score',
  'add_back_schedule', 'financial_spread', 'earnings_summary',
  'business_profile', 'league_card', 'journey_roadmap',
  'readiness_scorecard', 'target_criteria', 'sourcing_strategy',
  'raise_readiness', 'pre_post_model', 'financial_projections',
  'cap_table', 'unit_economics', 'use_of_funds',
  'day_zero_checklist', 'integration_plan', 'seller_training_schedule',
  'preliminary_sde', 'preliminary_ebitda',
]);

const PROFESSIONAL_TYPES = new Set([
  'cim', 'sell_cim_draft',
  'valuation_report', 'sell_valuation_report', 'buy_valuation_model',
  'seven_factor', 'seven_factor_analysis',
  'blind_teaser', 'sell_blind_teaser',
  'executive_summary', 'raise_executive_summary',
  'data_room_structure',
  'buyer_list', 'sell_buyer_list',
  'outreach_strategy',
  'dd_checklist', 'dd_package', 'buy_dd_checklist',
  'deal_structure_analysis',
  'funds_flow_statement', 'sell_funds_flow', 'funds_flow',
  'closing_checklist', 'sell_closing_checklist', 'buy_closing_checklist',
  'working_capital_analysis', 'sell_working_capital',
  'loi', 'loi_draft', 'buy_loi_draft',
  'sba_bankability_report', 'buy_sba_bankability', 'sba_bankability',
  'pitch_deck', 'raise_pitch_deck',
  'financial_model', 'sell_financial_model', 'raise_financial_model',
  'capital_structure_analysis', 'buy_capital_structure',
  'intelligence_report',
  'tax_impact_analysis',
  'sector_analysis',
  'lbo_model',
  'value_creation_plan',
  'pmi_integration_plan',
  'deal_screening_memo', 'buy_deal_screening_memo',
]);

// ─── Stripe helpers ─────────────────────────────────────────

function getStripePriceId(plan: Plan): string | null {
  const envKey = `STRIPE_PRICE_${plan.toUpperCase()}`;
  return process.env[envKey] || null;
}

function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY not set');
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

// ─── Core access logic ──────────────────────────────────────

/** Get user's current plan. TEST_MODE → enterprise. */
export async function getUserPlan(userId: number): Promise<Plan> {
  if (process.env.TEST_MODE === 'true' || process.env.DEV_NO_PAYWALL === 'true') {
    return 'enterprise';
  }
  const [user] = await sql`SELECT plan, trial_ends_at FROM users WHERE id = ${userId}`;
  if (!user) return 'free';

  // Early-access trial: grants Professional until trial_ends_at
  if (user.trial_ends_at && new Date(user.trial_ends_at) > new Date()) {
    const basePlan = (user.plan as Plan) || 'free';
    return PLAN_RANK[basePlan] >= PLAN_RANK.professional ? basePlan : 'professional';
  }

  return (user.plan as Plan) || 'free';
}

/** Check if user's plan meets or exceeds a required plan */
export function planMeetsRequirement(userPlan: Plan, requiredPlan: Plan): boolean {
  return PLAN_RANK[userPlan] >= PLAN_RANK[requiredPlan];
}

/** True if the user has a paid subscription (starter+) */
export function hasActiveSubscription(userPlan: Plan): boolean {
  return PLAN_RANK[userPlan] >= PLAN_RANK.starter;
}

/** Determine the minimum plan required for a deliverable type */
export function getRequiredPlan(deliverableType: string): Plan {
  const dt = deliverableType.toLowerCase();
  if (STARTER_TYPES.has(dt)) return 'starter';
  if (PROFESSIONAL_TYPES.has(dt)) return 'professional';
  // Default to starter — if it's a known type it should be in one of the sets
  return 'starter';
}

/**
 * Check if user can generate a deliverable.
 *
 * Logic:
 *   1. If user has a paid plan that meets the requirement → allowed
 *   2. If user is free and hasn't used their one free deliverable → allowed (isFreeDeliverable=true)
 *   3. Otherwise → not allowed, returns requiredPlan
 */
export async function canGenerateDeliverable(
  userId: number,
  deliverableType: string,
): Promise<{
  allowed: boolean;
  requiredPlan: Plan;
  currentPlan: Plan;
  isFreeDeliverable: boolean;
}> {
  const currentPlan = await getUserPlan(userId);
  const requiredPlan = getRequiredPlan(deliverableType);

  // Paid user with sufficient plan → allowed
  if (planMeetsRequirement(currentPlan, requiredPlan)) {
    return { allowed: true, requiredPlan, currentPlan, isFreeDeliverable: false };
  }

  // Free user — check if they still have their one free deliverable
  if (currentPlan === 'free') {
    const [user] = await sql`SELECT free_deliverable_used FROM users WHERE id = ${userId}`;
    if (user && !user.free_deliverable_used) {
      return { allowed: true, requiredPlan, currentPlan, isFreeDeliverable: true };
    }
  }

  return { allowed: false, requiredPlan, currentPlan, isFreeDeliverable: false };
}

/** Mark the user's one free deliverable as used */
export async function markFreeDeliverableUsed(userId: number, deliverableType: string): Promise<void> {
  await sql`
    UPDATE users SET
      free_deliverable_used = TRUE,
      free_deliverable_type = ${deliverableType},
      free_deliverable_at = NOW(),
      updated_at = NOW()
    WHERE id = ${userId}
  `;
}

// ─── Stripe subscription management ─────────────────────────

/** Create a Stripe Checkout Session for subscription */
export async function createCheckout(
  userId: number,
  plan: Plan,
  successUrl?: string,
  cancelUrl?: string,
  trial?: boolean,
): Promise<{ url: string; test?: boolean }> {
  if (plan === 'free') throw new Error('Cannot create checkout for free plan');

  const appUrl = process.env.APP_URL || 'https://smbx.ai';

  // TEST_MODE: mark as subscribed immediately
  if (process.env.TEST_MODE === 'true') {
    await setUserPlan(userId, plan, 'test_sub_' + Date.now(), 'test_cust_' + Date.now());
    return { url: `${appUrl}/chat?subscription=success&plan=${plan}`, test: true };
  }

  const [user] = await sql`SELECT email, stripe_customer_id FROM users WHERE id = ${userId}`;
  if (!user) throw new Error('User not found');

  const stripe = getStripe();
  const priceId = getStripePriceId(plan);
  if (!priceId) throw new Error(`Stripe price not configured for plan: ${plan}`);

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { type: 'subscription', userId: userId.toString(), plan },
    success_url: successUrl || `${appUrl}/chat?subscription=success&plan=${plan}`,
    cancel_url: cancelUrl || `${appUrl}/chat?subscription=cancelled`,
  };

  // 30-day free trial of Professional
  if (trial && plan === 'professional') {
    sessionParams.subscription_data = { trial_period_days: 30 };
  }

  // Reuse existing Stripe customer if available
  if (user.stripe_customer_id) {
    sessionParams.customer = user.stripe_customer_id;
  } else {
    sessionParams.customer_email = user.email as string;
  }

  const session = await stripe.checkout.sessions.create(sessionParams);
  return { url: session.url! };
}

// Keep legacy alias
export const createSubscriptionCheckout = createCheckout;

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

/** Handle Stripe subscription webhook events */
export async function handleSubscriptionWebhook(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.metadata?.type !== 'subscription') return;

      const userId = parseInt(session.metadata?.userId || '0');
      const plan = (session.metadata?.plan || 'starter') as Plan;
      const subscriptionId = session.subscription as string;
      const customerId = session.customer as string;

      if (userId) {
        await setUserPlan(userId, plan, subscriptionId, customerId);
        console.log(`Subscription activated: user ${userId}, plan ${plan}`);
      }
      break;
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const [user] = await sql`SELECT id FROM users WHERE stripe_customer_id = ${customerId}`;
      if (!user) return;

      if (subscription.status === 'active' || subscription.status === 'trialing') {
        const priceId = subscription.items.data[0]?.price?.id;
        const plan = getPlanFromPriceId(priceId) || 'starter';
        await setUserPlan(user.id, plan, subscription.id, customerId);

        // Update subscription record with period info
        await sql`
          UPDATE subscriptions SET
            status = ${subscription.status},
            current_period_start = ${new Date(subscription.current_period_start * 1000).toISOString()},
            current_period_end = ${new Date(subscription.current_period_end * 1000).toISOString()},
            cancel_at_period_end = ${subscription.cancel_at_period_end},
            trial_ends_at = ${subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null},
            updated_at = NOW()
          WHERE user_id = ${user.id}
        `.catch(() => {});
      } else if (subscription.status === 'past_due') {
        await sql`
          UPDATE subscriptions SET status = 'past_due', updated_at = NOW()
          WHERE user_id = ${user.id} AND status IN ('active', 'trialing')
        `.catch(() => {});
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const [user] = await sql`SELECT id FROM users WHERE stripe_customer_id = ${customerId}`;
      if (user) {
        await cancelSubscription(user.id);
        console.log(`Subscription canceled: user ${user.id}`);
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;
      const [user] = await sql`SELECT id FROM users WHERE stripe_customer_id = ${customerId}`;
      if (user) {
        await sql`
          UPDATE subscriptions SET status = 'past_due', updated_at = NOW()
          WHERE user_id = ${user.id} AND status IN ('active', 'trialing')
        `.catch(() => {});
        console.log(`Payment failed: user ${user.id}`);
      }
      break;
    }
  }
}

/** Handle subscription cancellation */
export async function cancelSubscription(userId: number): Promise<void> {
  await sql`UPDATE users SET plan = 'free', updated_at = NOW() WHERE id = ${userId}`;
  await sql`
    UPDATE subscriptions SET status = 'canceled', updated_at = NOW()
    WHERE user_id = ${userId} AND status IN ('active', 'trialing', 'past_due')
  `;
}

/** Get subscription details */
export async function getSubscription(userId: number) {
  const [sub] = await sql`
    SELECT * FROM subscriptions WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 1
  `;
  return sub || null;
}

/** Map Stripe price ID back to plan name */
function getPlanFromPriceId(priceId?: string): Plan | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_STARTER) return 'starter';
  if (priceId === process.env.STRIPE_PRICE_PROFESSIONAL) return 'professional';
  if (priceId === process.env.STRIPE_PRICE_ENTERPRISE) return 'enterprise';
  return null;
}
