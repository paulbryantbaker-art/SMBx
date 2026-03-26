/**
 * Stripe Routes — Subscription checkout + webhook handling.
 *
 * Flow:
 * 1. User hits paywall at S2/B2/R2 (or any paid feature)
 * 2. POST /api/stripe/subscribe creates a Stripe Checkout Session (subscription)
 * 3. User subscribes on Stripe's hosted page
 * 4. Stripe sends webhook → we update user's plan
 * 5. User redirected back to the app, features unlocked
 */
import { Router } from 'express';
import Stripe from 'stripe';
import { sql } from '../db.js';
import {
  getUserPlan,
  createSubscriptionCheckout,
  createCustomerPortal,
  setUserPlan,
  cancelSubscription,
  PLANS,
  type Plan,
} from '../services/subscriptionService.js';

export const stripeRouter = Router();

function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY not set');
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

// ─── Get user's current plan ─────────────────────────────────

stripeRouter.get('/plan', async (req, res) => {
  const userId = (req as any).userId;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const plan = await getUserPlan(userId);
    const planInfo = PLANS[plan];
    return res.json({ plan, ...planInfo });
  } catch (err: any) {
    console.error('Get plan error:', err.message);
    return res.status(500).json({ error: 'Failed to get plan' });
  }
});

// ─── Create subscription checkout ────────────────────────────

stripeRouter.post('/subscribe', async (req, res) => {
  const userId = (req as any).userId;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  const { plan } = req.body;
  if (!plan || !PLANS[plan as Plan]) return res.status(400).json({ error: 'Invalid plan' });
  if (plan === 'free') return res.status(400).json({ error: 'Cannot subscribe to free plan' });

  try {
    const result = await createSubscriptionCheckout(userId, plan as Plan);
    return res.json(result);
  } catch (err: any) {
    console.error('Subscribe error:', err.message);
    return res.status(500).json({ error: err.message || 'Failed to create checkout' });
  }
});

// ─── Customer portal (manage subscription) ───────────────────

stripeRouter.post('/portal', async (req, res) => {
  const userId = (req as any).userId;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const url = await createCustomerPortal(userId);
    return res.json({ url });
  } catch (err: any) {
    console.error('Portal error:', err.message);
    return res.status(500).json({ error: err.message || 'Failed to create portal session' });
  }
});

// ─── Legacy: execution fee endpoint (backward compat) ────────

stripeRouter.get('/platform-fee/:dealId', async (req, res) => {
  const userId = (req as any).userId;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const plan = await getUserPlan(userId);
    const planInfo = PLANS[plan];
    return res.json({
      plan,
      planName: planInfo.name,
      priceDisplay: planInfo.priceDisplay,
      isPaid: plan !== 'free',
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch plan info' });
  }
});

// ─── Legacy: deal-checkout → redirect to subscribe ───────────

stripeRouter.post('/deal-checkout', async (req, res) => {
  const userId = (req as any).userId;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  try {
    // New model: redirect to subscription instead of per-deal fee
    const plan = await getUserPlan(userId);
    if (plan !== 'free') {
      return res.json({ success: true, message: 'Already subscribed' });
    }

    // Default to starter plan for legacy paywall flow
    const result = await createSubscriptionCheckout(userId, 'starter');
    return res.json({ url: result.url, test: result.test });
  } catch (err: any) {
    console.error('Legacy checkout error:', err.message);
    return res.status(500).json({ error: err.message || 'Failed to create checkout' });
  }
});

// Legacy alias
stripeRouter.post('/platform-fee', async (req, res) => {
  req.url = '/deal-checkout';
  return stripeRouter.handle(req, res, () => {});
});

// ─── Stripe Webhook ─────────────────────────────────────────

export async function handleStripeWebhook(req: any, res: any) {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not set');
    return res.status(500).send('Webhook secret not configured');
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const type = session.metadata?.type;

        if (type === 'subscription') {
          const userId = parseInt(session.metadata?.userId || '0');
          const plan = (session.metadata?.plan || 'starter') as Plan;
          const subscriptionId = session.subscription as string;
          const customerId = session.customer as string;

          if (userId) {
            await setUserPlan(userId, plan, subscriptionId, customerId);
            console.log(`Subscription activated: user ${userId}, plan ${plan}`);
          }
        }

        // Legacy: one-time platform fee
        if (type === 'platform_fee') {
          const dealId = parseInt(session.metadata?.dealId || '0');
          const userId = parseInt(session.metadata?.userId || '0');
          if (dealId && userId) {
            // Mark deal as paid + upgrade user to starter as migration path
            await sql`
              UPDATE deals SET platform_fee_paid = true, platform_fee_paid_at = NOW()
              WHERE id = ${dealId}
            `;
            const currentPlan = await getUserPlan(userId);
            if (currentPlan === 'free') {
              await setUserPlan(userId, 'starter');
            }
            console.log(`Legacy platform fee: deal ${dealId}, user upgraded to starter`);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const [user] = await sql`SELECT id FROM users WHERE stripe_customer_id = ${customerId}`;

        if (user) {
          if (subscription.status === 'active') {
            // Plan may have changed (upgrade/downgrade)
            const priceId = subscription.items.data[0]?.price?.id;
            const plan = getPlanFromPriceId(priceId) || 'starter';
            await setUserPlan(user.id, plan, subscription.id, customerId);
            console.log(`Subscription updated: user ${user.id}, plan ${plan}`);
          } else if (subscription.status === 'past_due') {
            // Keep current plan but flag status
            await sql`
              UPDATE subscriptions SET status = 'past_due', updated_at = NOW()
              WHERE user_id = ${user.id} AND status = 'active'
            `;
          }
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
    }
  } catch (err: any) {
    console.error('Webhook processing error:', err.message);
    return res.status(500).send('Failed to process webhook');
  }

  return res.json({ received: true });
}

/** Map Stripe price ID back to plan name */
function getPlanFromPriceId(priceId?: string): Plan | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_STARTER) return 'starter';
  if (priceId === process.env.STRIPE_PRICE_PROFESSIONAL) return 'professional';
  if (priceId === process.env.STRIPE_PRICE_ENTERPRISE) return 'enterprise';
  return null;
}
