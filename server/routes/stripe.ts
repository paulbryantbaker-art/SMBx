/**
 * Stripe Routes — Deal execution fee payment via Stripe Checkout.
 *
 * Flow:
 * 1. User hits S2/B2/R2 paywall gate
 * 2. POST /api/stripe/deal-checkout creates a Checkout Session
 * 3. User pays on Stripe's hosted page
 * 4. Stripe sends webhook → we mark deal execution fee as paid
 * 5. User redirected back to the app, gate advances
 */
import { Router } from 'express';
import Stripe from 'stripe';
import { sql } from '../db.js';
import { calculateExecutionFee, isExecutionFeePaid, markExecutionFeePaid } from '../services/dealExecutionFee.js';

export const stripeRouter = Router();

function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY not set');
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

// ─── Get execution fee for a deal ─────────────────────────────

stripeRouter.get('/platform-fee/:dealId', async (req, res) => {
  const userId = (req as any).userId;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  const dealId = parseInt(req.params.dealId);
  if (!dealId) return res.status(400).json({ error: 'Invalid deal ID' });

  try {
    const [deal] = await sql`SELECT id, sde, ebitda, league, platform_fee_paid, platform_fee_cents, platform_fee_paid_at FROM deals WHERE id = ${dealId} AND user_id = ${userId}`;
    if (!deal) return res.status(404).json({ error: 'Deal not found' });

    const paid = deal.platform_fee_paid || false;
    if (paid && deal.platform_fee_cents) {
      const basis = (deal.ebitda && deal.ebitda > 0) ? 'EBITDA' : 'SDE';
      const basisCents = basis === 'EBITDA' ? (deal.ebitda || 0) : (deal.sde || 0);
      return res.json({
        feeCents: deal.platform_fee_cents,
        feeDisplay: `$${(deal.platform_fee_cents / 100).toLocaleString('en-US')}`,
        basis,
        basisDisplay: `$${(basisCents / 100).toLocaleString('en-US')}`,
        isMinimum: false,
        league: deal.league || 'L1',
        isPaid: true,
        paidAt: deal.platform_fee_paid_at,
      });
    }

    const fee = calculateExecutionFee({ sde: deal.sde, ebitda: deal.ebitda });
    return res.json({
      ...fee,
      league: deal.league || 'L1',
      isPaid: false,
      paidAt: null,
    });
  } catch (err: any) {
    console.error('Execution fee fetch error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch execution fee' });
  }
});

// ─── Create Checkout Session for deal execution fee ────────────

stripeRouter.post('/deal-checkout', async (req, res) => {
  const userId = (req as any).userId;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  const { dealId } = req.body;
  if (!dealId) return res.status(400).json({ error: 'dealId required' });

  try {
    const parsedDealId = parseInt(dealId);

    // TEST_MODE bypass — mark as paid immediately
    if (process.env.TEST_MODE === 'true') {
      const [deal] = await sql`SELECT sde, ebitda FROM deals WHERE id = ${parsedDealId} AND user_id = ${userId}`;
      if (!deal) return res.status(404).json({ error: 'Deal not found' });
      const fee = calculateExecutionFee({ sde: deal.sde, ebitda: deal.ebitda });
      await markExecutionFeePaid(parsedDealId, fee.feeCents, 'test_' + Date.now());
      const appUrl = process.env.APP_URL || 'https://smbx.ai';
      return res.json({ url: `${appUrl}/chat?payment=success&dealId=${parsedDealId}`, test: true });
    }

    // Verify ownership
    const [deal] = await sql`SELECT id, sde, ebitda, business_name, journey_type, platform_fee_paid FROM deals WHERE id = ${parsedDealId} AND user_id = ${userId}`;
    if (!deal) return res.status(404).json({ error: 'Deal not found' });
    if (deal.platform_fee_paid) return res.status(400).json({ error: 'Execution fee already paid for this deal' });

    const fee = calculateExecutionFee({ sde: deal.sde, ebitda: deal.ebitda });
    const [user] = await sql`SELECT email FROM users WHERE id = ${userId}`;
    if (!user) return res.status(404).json({ error: 'User not found' });

    const dealName = deal.business_name || 'Your Deal';
    const stripe = getStripe();
    const appUrl = process.env.APP_URL || 'https://smbx.ai';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: user.email as string,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `smbX.ai Deal Execution — ${dealName}`,
            description: `0.1% of ${fee.basis} ($${(fee.feeCents / 100).toLocaleString()}). Full platform access through closing + 180-day integration.`,
          },
          unit_amount: fee.feeCents,
        },
        quantity: 1,
      }],
      metadata: {
        type: 'platform_fee',
        dealId: parsedDealId.toString(),
        userId: userId.toString(),
        feeCents: fee.feeCents.toString(),
      },
      success_url: `${appUrl}/chat?payment=success&dealId=${parsedDealId}`,
      cancel_url: `${appUrl}/chat?payment=cancelled&dealId=${parsedDealId}`,
    });

    return res.json({ url: session.url! });
  } catch (err: any) {
    console.error('Deal checkout error:', err.message);
    return res.status(500).json({ error: err.message || 'Failed to create checkout session' });
  }
});

// Legacy alias — keep for backward compatibility
stripeRouter.post('/platform-fee', async (req, res) => {
  // Forward to deal-checkout
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
            await markExecutionFeePaid(dealId, feeCents, paymentIntentId);
            console.log(`Execution fee paid: deal ${dealId}, $${feeCents / 100}, PI ${paymentIntentId}`);
          } else {
            console.log(`Duplicate webhook ignored: deal ${dealId}`);
          }
        } catch (err: any) {
          console.error('Execution fee webhook error:', err.message);
          return res.status(500).send('Failed to process payment');
        }
      }
    }
  }

  return res.json({ received: true });
}
