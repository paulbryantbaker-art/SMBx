/**
 * Stripe Routes — DORMANT product-subscription checkout, portal, and webhook.
 *
 * 2026-07-11 pivot (THE LINE v2): smbX is a private buy-side practice; nothing
 * in the product charges money. In practice mode (the default) this router is
 * not mounted — /api/stripe returns 410 (server/index.ts) and only the webhook
 * stays live so legacy subscription events still settle. Practice compensation
 * (buy-side retainer + buy-side success fee) is an engagement-letter matter
 * between the practitioner and the client, never billed through the product.
 *
 * Retired product flow (kept in case a product motion returns):
 * 1. User generates a deliverable that requires a paid plan
 * 2. POST /api/stripe/subscribe creates a Stripe Checkout Session (subscription)
 * 3. User subscribes on Stripe's hosted page
 * 4. Stripe sends webhook → we update user's plan
 * 5. User redirected back to the app, features unlocked
 */
import { Router } from 'express';
import Stripe from 'stripe';
import {
  getUserPlan,
  createCheckout,
  createCustomerPortal,
  getSubscription,
  handleSubscriptionWebhook,
  PLANS,
  type Plan,
} from '../services/subscriptionService.js';

export const stripeRouter = Router();

function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY not set');
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

// ─── GET /subscription — current user plan + subscription details ──

stripeRouter.get('/subscription', async (req, res) => {
  const userId = (req as any).userId;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const plan = await getUserPlan(userId);
    const planInfo = PLANS[plan];
    const subscription = await getSubscription(userId);
    return res.json({ ...planInfo, plan, subscription });
  } catch (err: any) {
    console.error('Get subscription error:', err.message);
    return res.status(500).json({ error: 'Failed to get subscription' });
  }
});

// Legacy alias
stripeRouter.get('/plan', async (req, res) => {
  const userId = (req as any).userId;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const plan = await getUserPlan(userId);
    const planInfo = PLANS[plan];
    return res.json({ ...planInfo, plan });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to get plan' });
  }
});

// ─── POST /subscribe — create Stripe subscription checkout ──

stripeRouter.post('/subscribe', async (req, res) => {
  const userId = (req as any).userId;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  const { plan, trial } = req.body;
  if (!plan || !PLANS[plan as Plan]) return res.status(400).json({ error: 'Invalid plan' });
  if (plan === 'free') return res.status(400).json({ error: 'Cannot subscribe to free plan' });

  try {
    const result = await createCheckout(userId, plan as Plan, undefined, undefined, trial);
    return res.json(result);
  } catch (err: any) {
    console.error('Subscribe error:', err.message);
    return res.status(500).json({ error: err.message || 'Failed to create checkout' });
  }
});

// ─── POST /portal — Stripe Customer Portal (manage subscription) ──

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
    await handleSubscriptionWebhook(event);
  } catch (err: any) {
    console.error('Webhook processing error:', err.message);
    return res.status(500).send('Failed to process webhook');
  }

  return res.json({ received: true });
}
