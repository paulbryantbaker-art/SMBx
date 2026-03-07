/**
 * Stripe Routes — Wallet top-up via Stripe Checkout.
 *
 * Flow:
 * 1. User selects a wallet block (e.g., "Builder $100")
 * 2. POST /api/stripe/checkout creates a Checkout Session
 * 3. User pays on Stripe's hosted page
 * 4. Stripe sends webhook → we credit the wallet
 * 5. User redirected back to the app
 */
import { Router } from 'express';
import Stripe from 'stripe';
import { sql } from '../db.js';
import { creditWallet, getOrCreateWallet } from '../services/walletService.js';

export const stripeRouter = Router();

// Wallet blocks: amount user pays → total they receive (includes bonus)
const WALLET_BLOCKS = [
  { id: 'starter', name: 'Exploratory', priceCents: 5000, bonusCents: 0, totalCents: 5000, discount: '0%' },
  { id: 'builder', name: 'Early Commit', priceCents: 10000, bonusCents: 500, totalCents: 10500, discount: '5%' },
  { id: 'momentum', name: 'Active Deal', priceCents: 25000, bonusCents: 1500, totalCents: 26500, discount: '6%' },
  { id: 'accelerator', name: 'Serious', priceCents: 50000, bonusCents: 4000, totalCents: 54000, discount: '8%' },
  { id: 'professional', name: 'Full Journey', priceCents: 100000, bonusCents: 10000, totalCents: 110000, discount: '10%' },
  { id: 'scale', name: 'Advisor', priceCents: 250000, bonusCents: 30000, totalCents: 280000, discount: '12%' },
];

function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY not set');
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

// ─── Get wallet blocks (public) ─────────────────────────────

stripeRouter.get('/blocks', (_req, res) => {
  res.json(WALLET_BLOCKS.map(b => ({
    id: b.id,
    name: b.name,
    price: `$${(b.priceCents / 100).toFixed(0)}`,
    priceCents: b.priceCents,
    bonus: b.bonusCents > 0 ? `$${(b.bonusCents / 100).toFixed(0)}` : null,
    total: `$${(b.totalCents / 100).toFixed(0)}`,
    totalCents: b.totalCents,
    discount: b.discount,
  })));
});

// ─── Get wallet balance (authenticated) ─────────────────────

stripeRouter.get('/wallet', async (req, res) => {
  const userId = (req as any).userId;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const wallet = await getOrCreateWallet(userId);
    return res.json({
      balance: wallet.balance_cents,
      balanceDisplay: `$${(wallet.balance_cents / 100).toFixed(2)}`,
      totalDeposited: wallet.total_deposited_cents,
      totalSpent: wallet.total_spent_cents,
    });
  } catch (err: any) {
    console.error('Wallet fetch error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch wallet' });
  }
});

// ─── Get transaction history ─────────────────────────────────

stripeRouter.get('/transactions', async (req, res) => {
  const userId = (req as any).userId;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const transactions = await sql`
      SELECT id, type, amount_cents, description, created_at
      FROM wallet_transactions
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 50
    `;
    return res.json(transactions);
  } catch (err: any) {
    console.error('Transaction history error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// ─── Create Checkout Session ────────────────────────────────

stripeRouter.post('/checkout', async (req, res) => {
  const userId = (req as any).userId;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  const { blockId } = req.body;
  const block = WALLET_BLOCKS.find(b => b.id === blockId);
  if (!block) return res.status(400).json({ error: 'Invalid wallet block' });

  try {
    // TEST_MODE bypass — skip Stripe, credit wallet directly
    if (process.env.TEST_MODE === 'true') {
      await getOrCreateWallet(userId);
      await creditWallet(
        userId,
        block.totalCents,
        `Wallet top-up: ${block.name} ($${(block.totalCents / 100).toFixed(2)}) [TEST]`,
        `test_${Date.now()}`,
      );
      console.log(`[TEST_MODE] Wallet credited: user ${userId}, $${(block.totalCents / 100).toFixed(2)} (${block.id})`);
      const appUrl = process.env.APP_URL || 'https://smbx.ai';
      return res.json({ url: `${appUrl}?wallet=success&amount=${block.totalCents}`, test: true });
    }

    const stripe = getStripe();
    const appUrl = process.env.APP_URL || 'https://smbx.ai';

    // Get user email for Stripe
    const [user] = await sql`SELECT email FROM users WHERE id = ${userId}`;
    if (!user) return res.status(404).json({ error: 'User not found' });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: user.email as string,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `smbx.ai Wallet — ${block.name}`,
              description: block.bonusCents > 0
                ? `$${(block.priceCents / 100).toFixed(0)} + $${(block.bonusCents / 100).toFixed(0)} bonus = $${(block.totalCents / 100).toFixed(0)} total`
                : `$${(block.priceCents / 100).toFixed(0)} wallet credit`,
            },
            unit_amount: block.priceCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: String(userId),
        blockId: block.id,
        totalCents: String(block.totalCents),
      },
      success_url: `${appUrl}?wallet=success&amount=${block.totalCents}`,
      cancel_url: `${appUrl}?wallet=cancelled`,
    });

    return res.json({ url: session.url, sessionId: session.id });
  } catch (err: any) {
    console.error('Stripe checkout error:', err.message);
    return res.status(500).json({ error: 'Failed to create checkout session' });
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
    const userId = parseInt(session.metadata?.userId || '0');
    const blockId = session.metadata?.blockId || '';
    const totalCents = parseInt(session.metadata?.totalCents || '0');

    if (userId && totalCents > 0) {
      try {
        // Check for duplicate webhook
        const [existing] = await sql`
          SELECT id FROM wallet_transactions
          WHERE stripe_session_id = ${session.id} AND type = 'credit'
        `;

        if (!existing) {
          await creditWallet(
            userId,
            totalCents,
            `Wallet top-up: ${blockId} ($${(totalCents / 100).toFixed(2)})`,
            session.id,
          );
          console.log(`Wallet credited: user ${userId}, $${(totalCents / 100).toFixed(2)} (${blockId})`);
        } else {
          console.log(`Duplicate webhook ignored: session ${session.id}`);
        }
      } catch (err: any) {
        console.error('Wallet credit error:', err.message);
        return res.status(500).send('Failed to credit wallet');
      }
    }
  }

  return res.json({ received: true });
}
