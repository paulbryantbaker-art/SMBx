/**
 * Platform Fee Service — One-time per-deal execution fee.
 *
 * NEW MODEL: 0.1% of SDE or EBITDA, $999 minimum.
 * One payment per deal. Unlocks everything through closing + 180 days.
 *
 * All amounts in CENTS (integers).
 */
import Stripe from 'stripe';
import { sql } from '../db.js';
import { calculateExecutionFee } from './dealExecutionFee.js';
import type { ExecutionFeeResult } from './dealExecutionFee.js';

function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY not set');
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export interface PlatformFee {
  feeCents: number;
  feeDisplay: string;
  basis: 'SDE' | 'EBITDA';
  basisDisplay: string;
  isMinimum: boolean;
  league: string;
  isPaid: boolean;
  paidAt: string | null;
}

/**
 * Get the execution fee for a deal based on 0.1% of SDE/EBITDA ($999 minimum).
 */
export async function getPlatformFee(dealId: number): Promise<PlatformFee> {
  const [deal] = await sql`
    SELECT league, sde, ebitda, platform_fee_paid, platform_fee_paid_at, platform_fee_cents
    FROM deals WHERE id = ${dealId}
  `;

  if (!deal) throw new Error(`Deal ${dealId} not found`);

  // If already paid, use stored amount; otherwise calculate from financials
  let fee: ExecutionFeeResult;
  if (deal.platform_fee_paid && deal.platform_fee_cents) {
    const basis = (deal.ebitda && deal.ebitda > 0) ? 'EBITDA' : 'SDE';
    const basisCents = basis === 'EBITDA' ? (deal.ebitda || 0) : (deal.sde || 0);
    fee = {
      feeCents: deal.platform_fee_cents,
      feeDisplay: `$${(deal.platform_fee_cents / 100).toLocaleString('en-US')}`,
      basis,
      basisAmountCents: basisCents,
      basisDisplay: `$${(basisCents / 100).toLocaleString('en-US')}`,
      isMinimum: false,
    };
  } else {
    fee = calculateExecutionFee({ sde: deal.sde, ebitda: deal.ebitda });
  }

  return {
    feeCents: fee.feeCents,
    feeDisplay: fee.feeDisplay,
    basis: fee.basis,
    basisDisplay: fee.basisDisplay,
    isMinimum: fee.isMinimum,
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
 * Create a Stripe Checkout Session for the deal execution fee.
 * Returns the checkout URL (or redirect in test mode).
 */
export async function createPlatformFeeCheckout(
  dealId: number,
  userId: number,
): Promise<{ url: string; test?: boolean }> {
  // TEST_MODE bypass — mark as paid immediately
  if (process.env.TEST_MODE === 'true') {
    const fee = await getPlatformFee(dealId);
    await markPlatformFeePaid(dealId, fee.feeCents, 'test_' + Date.now());
    const appUrl = process.env.APP_URL || 'https://smbx.ai';
    return { url: `${appUrl}/chat?payment=success&dealId=${dealId}`, test: true };
  }

  const fee = await getPlatformFee(dealId);
  if (fee.isPaid) throw new Error('Execution fee already paid for this deal');

  const [user] = await sql`SELECT email FROM users WHERE id = ${userId}`;
  if (!user) throw new Error('User not found');

  const [deal] = await sql`SELECT business_name, journey_type FROM deals WHERE id = ${dealId}`;
  const dealName = deal?.business_name || 'Your Deal';

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
      dealId: dealId.toString(),
      userId: userId.toString(),
      feeCents: fee.feeCents.toString(),
    },
    success_url: `${appUrl}/chat?payment=success&dealId=${dealId}`,
    cancel_url: `${appUrl}/chat?payment=cancelled&dealId=${dealId}`,
  });

  return { url: session.url! };
}

/**
 * Mark a deal's execution fee as paid (called from webhook or TEST_MODE).
 */
export async function markPlatformFeePaid(
  dealId: number,
  amountCents: number,
  stripePaymentIntentId?: string,
): Promise<void> {
  await sql`
    UPDATE deals SET
      platform_fee_paid = true,
      platform_fee_cents = ${amountCents},
      platform_fee_paid_at = NOW(),
      stripe_payment_intent_id = ${stripePaymentIntentId || null}
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
