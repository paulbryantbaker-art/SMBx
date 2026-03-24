/**
 * Stripe Routes — Platform fee payment via Stripe Checkout.
 *
 * NEW MODEL: One-time per-deal platform fee (replaces wallet top-ups).
 *
 * Flow:
 * 1. User hits S2/B2/R2 paywall gate
 * 2. POST /api/stripe/platform-fee creates a Checkout Session
 * 3. User pays on Stripe's hosted page
 * 4. Stripe sends webhook → we mark deal.platform_fee_paid = true
 * 5. User redirected back to the app, gate advances
 */
import { Router } from 'express';
import Stripe from 'stripe';
import { sql } from '../db.js';
import { createPlatformFeeCheckout, markPlatformFeePaid, getPlatformFee } from '../services/platformFeeService.js';

export const stripeRouter = Router();

function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY not set');
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

// ─── Get platform fee for a deal ─────────────────────────────

stripeRouter.get('/platform-fee/:dealId', async (req, res) => {
  const userId = (req as any).userId;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  const dealId = parseInt(req.params.dealId);
  if (!dealId) return res.status(400).json({ error: 'Invalid deal ID' });

  try {
    // Verify ownership
    const [deal] = await sql`SELECT id FROM deals WHERE id = ${dealId} AND user_id = ${userId}`;
    if (!deal) return res.status(404).json({ error: 'Deal not found' });

    const fee = await getPlatformFee(dealId);
    return res.json(fee);
  } catch (err: any) {
    console.error('Platform fee fetch error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch platform fee' });
  }
});

// ─── Create Checkout Session for platform fee ────────────────

stripeRouter.post('/platform-fee', async (req, res) => {
  const userId = (req as any).userId;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  const { dealId } = req.body;
  if (!dealId) return res.status(400).json({ error: 'dealId required' });

  try {
    const result = await createPlatformFeeCheckout(parseInt(dealId), userId);
    return res.json(result);
  } catch (err: any) {
    console.error('Platform fee checkout error:', err.message);
    return res.status(500).json({ error: err.message || 'Failed to create checkout session' });
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

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const type = session.metadata?.type;

    if (type === 'platform_fee') {
      const dealId = parseInt(session.metadata?.dealId || '0');
      const paymentIntentId = session.payment_intent as string;

      if (dealId && paymentIntentId) {
        try {
          // Check for duplicate webhook
          const [existing] = await sql`
            SELECT id FROM deals
            WHERE id = ${dealId} AND stripe_payment_intent_id = ${paymentIntentId}
          `;

          if (!existing) {
            const feeCents = parseInt(session.metadata?.feeCents || '0') || (session.amount_total || 0);
            await markPlatformFeePaid(dealId, feeCents, paymentIntentId);
            console.log(`Execution fee paid: deal ${dealId}, $${feeCents / 100}, PI ${paymentIntentId}`);
          } else {
            console.log(`Duplicate webhook ignored: deal ${dealId}`);
          }
        } catch (err: any) {
          console.error('Platform fee webhook error:', err.message);
          return res.status(500).send('Failed to process payment');
        }
      }
    }

    // Handle advisor subscription webhooks (future)
    if (type === 'advisor_subscription') {
      // TODO: Handle advisor subscription creation
      console.log('Advisor subscription webhook received');
    }
  }

  return res.json({ received: true });
}
