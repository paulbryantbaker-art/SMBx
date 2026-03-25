/**
 * Paywall Service — Generates execution fee prompts when users
 * hit the paywall gate (S2/B2/R2).
 *
 * NEW MODEL: 0.1% of SDE or EBITDA, $999 minimum.
 * One-time payment per deal. No wallet, no per-deliverable pricing.
 * All amounts in CENTS.
 */
import { calculateExecutionFee } from './dealExecutionFee.js';

export interface PaywallContext {
  gate: string;
  league: string;
  journeyType: string;
  dealId?: number;
  dealData: {
    industry?: string;
    revenue?: number;       // cents
    sde?: number;           // cents
    ebitda?: number;        // cents
    business_name?: string;
    asking_price?: number;  // cents
  };
}

export interface PaywallPrompt {
  priceCents: number;
  priceDisplay: string;
  basis: 'SDE' | 'EBITDA';
  basisDisplay: string;
  isMinimum: boolean;
  valueProps: string[];
  callToAction: string;
  systemPromptAddition: string;
  whatYouGet: string[];
}

/**
 * Generate an execution fee paywall prompt based on deal financials.
 */
export function generatePaywallPrompt(ctx: PaywallContext): PaywallPrompt {
  const fee = calculateExecutionFee({
    sde: ctx.dealData.sde,
    ebitda: ctx.dealData.ebitda,
  });

  const generator = PAYWALL_GENERATORS[ctx.gate];
  if (!generator) {
    return {
      priceCents: fee.feeCents,
      priceDisplay: fee.feeDisplay,
      basis: fee.basis,
      basisDisplay: fee.basisDisplay,
      isMinimum: fee.isMinimum,
      valueProps: ['Full deal execution platform access'],
      callToAction: `Your deal execution fee is ${fee.feeDisplay} — 0.1% of your ${fee.basis}. One payment, everything included.`,
      systemPromptAddition: buildPaywallSystemPrompt(ctx, fee),
      whatYouGet: getWhatYouGet(ctx.journeyType),
    };
  }

  return generator(ctx, fee);
}

// ─── What's included in the execution fee ─────────────────

function getWhatYouGet(journeyType: string): string[] {
  if (journeyType === 'sell') {
    return [
      'Multi-methodology business valuation with defensible price range',
      'Professional CIM (Confidential Information Memorandum)',
      'Buyer list with targeted outreach strategy',
      'Deal room with document management',
      'LOI templates and negotiation support',
      'Closing checklist and transaction coordination',
      '180-day post-close integration plan',
    ];
  }
  if (journeyType === 'buy') {
    return [
      'Buyer\'s valuation model with DSCR and cash-flow analysis',
      'Due diligence package with checklists and red flags',
      'SBA bankability assessment and financing models',
      'Deal room access with secure document sharing',
      'LOI drafting and deal structuring tools',
      'Closing support with funds flow and checklists',
      '180-day post-acquisition integration plan',
    ];
  }
  // raise
  return [
    'Investor-ready pitch deck and executive summary',
    'Financial model with 3-5 year projections',
    'Investor list with outreach strategy',
    'Data room setup with document checklist',
    'Term sheet analysis and negotiation support',
    'Closing coordination',
  ];
}

// ─── Gate-specific paywall generators ───────────────────────

type PaywallGenerator = (ctx: PaywallContext, fee: ReturnType<typeof calculateExecutionFee>) => PaywallPrompt;

function makeResult(
  fee: ReturnType<typeof calculateExecutionFee>,
  ctx: PaywallContext,
  valueProps: string[],
  journeyType: string,
): PaywallPrompt {
  return {
    priceCents: fee.feeCents,
    priceDisplay: fee.feeDisplay,
    basis: fee.basis,
    basisDisplay: fee.basisDisplay,
    isMinimum: fee.isMinimum,
    valueProps,
    callToAction: `Your deal execution fee is ${fee.feeDisplay} — 0.1% of your ${fee.basis}. One payment, everything included through closing.`,
    systemPromptAddition: buildPaywallSystemPrompt(ctx, fee),
    whatYouGet: getWhatYouGet(journeyType),
  };
}

const PAYWALL_GENERATORS: Record<string, PaywallGenerator> = {
  S2: (ctx, fee) => {
    return makeResult(fee, ctx, [
      'Multi-methodology valuation (market comps + financial analysis)',
      'Defensible price range (conservative / likely / optimistic)',
      'Industry-specific multiple analysis with growth premiums',
      'Go/no-go recommendation with probability of sale score',
    ], 'sell');
  },

  B2: (ctx, fee) => {
    return makeResult(fee, ctx, [
      'Buyer\'s valuation model (what the business is worth TO YOU)',
      'DSCR analysis with your actual financing terms',
      'Cash-on-cash and IRR projections (Year 1 through Year 5)',
      'Due diligence checklists and deal-breaker identification',
    ], 'buy');
  },

  R2: (ctx, fee) => {
    return makeResult(fee, ctx, [
      '10-15 slide pitch deck tailored to your raise',
      'Executive summary and blind teaser for outreach',
      'Financial model with 3-5 year projections',
      'Investor list with outreach strategy',
    ], 'raise');
  },
};

function buildPaywallSystemPrompt(
  ctx: PaywallContext,
  fee: ReturnType<typeof calculateExecutionFee>,
): string {
  const minimumNote = fee.isMinimum ? '\nNote: The minimum execution fee is $999, which gives full access to everything.' : '';

  return `
## PAYWALL — Deal Execution Fee at Gate ${ctx.gate}
The user has completed the free gates and is ready for the paid execution phase.

PRICE: ${fee.feeDisplay} (0.1% of ${fee.basis}: ${fee.basisDisplay})${minimumNote}
THIS IS A ONE-TIME FEE — everything from here through closing + 180-day integration is included.

YOUR APPROACH:
Based on the financials you've shared, I've calculated ${fee.basis === 'EBITDA' ? 'an' : 'a'} ${fee.basis} of ${fee.basisDisplay}. Everything I've generated so far — the ValueLens audit, the Value Readiness Report, the preliminary valuation — is yours to keep.

To unlock the full execution platform — your deal room, professional deal documents, legal templates, closing support, and your 180-day integration plan — the deal execution fee is ${fee.feeDisplay}. That's 0.1% of your ${fee.basis}, and it covers everything for this deal through closing day. No subscriptions, no additional charges.

NEVER:
- Mention "wallet" or "balance" or "credits" — this is a one-time execution fee
- Quote per-deliverable prices — everything is included
- Compare to traditional advisor fees — let the value speak for itself
- Be pushy or repeat the offer
- Make them feel bad for declining
- Mention the league label (L1, L2, etc.) to the user
- Mention subscriptions or recurring charges

IF THEY ACCEPT:
- Confirm: "Processing your execution fee. Once confirmed, I'll unlock your full deal execution platform."
- The system will redirect to Stripe checkout
- After payment, all gates through closing + 180 days are unlocked

IF THEY DECLINE:
- "No problem. I can still help you think through any questions — I just can't generate the execution-level deliverables. What would you like to explore?"
- Continue providing valuable conversational guidance
`;
}

export function isTestMode(): boolean {
  return process.env.TEST_MODE === 'true';
}
