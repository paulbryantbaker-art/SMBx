/**
 * Platform Fee Service — One-time per-deal platform fee.
 *
 * Replaces the old wallet-based per-deliverable pricing model.
 * Users pay a single fee at S2/B2 gate based on league.
 * Everything after payment is included.
 *
 * All amounts in CENTS (integers).
 */
import Stripe from 'stripe';
import { sql } from '../db.js';

function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY not set');
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export interface PlatformFee {
  feeCents: number;
  feeDisplay: string;
  league: string;
  isPaid: boolean;
  paidAt: string | null;
}

/**
 * Get the platform fee for a deal based on its league.
 */
export async function getPlatformFee(dealId: number): Promise<PlatformFee> {
  const [deal] = await sql`
    SELECT d.league, d.platform_fee_paid, d.platform_fee_paid_at, d.platform_fee_cents,
           pfs.fee_cents as schedule_fee_cents
    FROM deals d
    LEFT JOIN platform_fee_schedule pfs ON pfs.league = d.league
    WHERE d.id = ${dealId}
  `;

  if (!deal) throw new Error(`Deal ${dealId} not found`);

  const feeCents = deal.platform_fee_cents || deal.schedule_fee_cents || 99900; // fallback to L1
  return {
    feeCents,
    feeDisplay: `$${(feeCents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
    league: deal.league || 'L1',
    isPaid: deal.platform_fee_paid || false,
    paidAt: deal.platform_fee_paid_at || null,
  };
}

/**
 * Check if a deal's platform fee has been paid (or bypassed via TEST_MODE).
 */
export async function isPlatformFeePaid(dealId: number): Promise<boolean> {
  if (process.env.TEST_MODE === 'true' || process.env.DEV_NO_PAYWALL === 'true') return true;

  const [deal] = await sql`SELECT platform_fee_paid FROM deals WHERE id = ${dealId}`;
  return deal?.platform_fee_paid || false;
}

/**
 * Create a Stripe Checkout Session for the platform fee.
 * Returns the checkout URL (or 'TEST_MODE_BYPASS' in test mode).
 */
export async function createPlatformFeeCheckout(
  dealId: number,
  userId: number,
): Promise<{ url: string; test?: boolean }> {
  // TEST_MODE bypass — mark as paid immediately
  if (process.env.TEST_MODE === 'true') {
    await markPlatformFeePaid(dealId, 'test_' + Date.now());
    const appUrl = process.env.APP_URL || 'https://smbx.ai';
    return { url: `${appUrl}/chat?payment=success&dealId=${dealId}`, test: true };
  }

  const fee = await getPlatformFee(dealId);
  if (fee.isPaid) throw new Error('Platform fee already paid for this deal');

  const [user] = await sql`SELECT email FROM users WHERE id = ${userId}`;
  if (!user) throw new Error('User not found');

  const [deal] = await sql`SELECT business_name, journey_type FROM deals WHERE id = ${dealId}`;
  const dealName = deal?.business_name || 'Your Deal';
  const journey = deal?.journey_type === 'buy' ? 'Acquisition' : deal?.journey_type === 'raise' ? 'Capital Raise' : 'Exit';

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
          name: `smbx.ai ${journey} Execution — ${fee.league}`,
          description: `Full deal execution for "${dealName}" — all deliverables, deal room, and closing support included`,
        },
        unit_amount: fee.feeCents,
      },
      quantity: 1,
    }],
    metadata: {
      type: 'platform_fee',
      dealId: dealId.toString(),
      userId: userId.toString(),
      league: fee.league,
    },
    success_url: `${appUrl}/chat?payment=success&dealId=${dealId}`,
    cancel_url: `${appUrl}/chat?payment=cancelled&dealId=${dealId}`,
  });

  return { url: session.url! };
}

/**
 * Mark a deal's platform fee as paid (called from webhook or TEST_MODE).
 */
export async function markPlatformFeePaid(
  dealId: number,
  stripePaymentIntentId: string,
): Promise<void> {
  await sql`
    UPDATE deals SET
      platform_fee_paid = true,
      platform_fee_paid_at = NOW(),
      stripe_payment_intent_id = ${stripePaymentIntentId},
      platform_fee_cents = COALESCE(platform_fee_cents, (
        SELECT fee_cents FROM platform_fee_schedule
        WHERE league = (SELECT league FROM deals WHERE id = ${dealId})
      ))
    WHERE id = ${dealId}
  `;
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
  // raise
  if (league === 'L1' || league === 'L2') return '$10,000–$25,000 (typical capital raise advisory)';
  return '$50,000–$200,000+ (typical investment banking fee)';
}
