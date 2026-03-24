/**
 * Paywall Service — Generates execution fee prompts when users
 * hit the paywall gate (S2/B2/R2).
 *
 * NEW MODEL: 0.1% of SDE or EBITDA, $999 minimum.
 * One-time payment per deal. No wallet, no per-deliverable pricing.
 * All amounts in CENTS.
 */
import { calculateExecutionFee } from './dealExecutionFee.js';
import { getAdvisoryCostComparison } from './platformFeeService.js';

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
  comparisonText: string;
  previewInsight: string;
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
    const comparisonText = getAdvisoryCostComparison(ctx.league, ctx.journeyType);
    return {
      priceCents: fee.feeCents,
      priceDisplay: fee.feeDisplay,
      basis: fee.basis,
      basisDisplay: fee.basisDisplay,
      isMinimum: fee.isMinimum,
      valueProps: ['Full deal execution platform access'],
      comparisonText,
      previewInsight: '',
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
  comparisonText: string,
  previewInsight: string,
  journeyType: string,
): PaywallPrompt {
  return {
    priceCents: fee.feeCents,
    priceDisplay: fee.feeDisplay,
    basis: fee.basis,
    basisDisplay: fee.basisDisplay,
    isMinimum: fee.isMinimum,
    valueProps,
    comparisonText,
    previewInsight,
    callToAction: `Your deal execution fee is ${fee.feeDisplay} — 0.1% of your ${fee.basis}. One payment, everything included through closing.`,
    systemPromptAddition: buildPaywallSystemPrompt(ctx, fee),
    whatYouGet: getWhatYouGet(journeyType),
  };
}

const PAYWALL_GENERATORS: Record<string, PaywallGenerator> = {
  S2: (ctx, fee) => {
    const earningsDollars = fee.basisAmountCents / 100;

    let previewInsight = '';
    if (earningsDollars > 0 && ctx.dealData.industry) {
      const lowMultiple = ctx.league === 'L1' ? 2.0 : ctx.league === 'L2' ? 3.0 : 4.0;
      const highMultiple = ctx.league === 'L1' ? 3.5 : ctx.league === 'L2' ? 5.0 : 6.0;
      const lowVal = Math.round(earningsDollars * lowMultiple);
      const highVal = Math.round(earningsDollars * highMultiple);
      previewInsight = `Based on your ${fee.basis} of ${fee.basisDisplay} and ${ctx.dealData.industry} industry benchmarks, your preliminary range is $${lowVal.toLocaleString()} – $${highVal.toLocaleString()}. The full valuation will refine this with growth premiums, margin analysis, and risk adjustments.`;
    }

    const comparisonText = `A traditional advisor would charge ${getAdvisoryCostComparison(ctx.league, 'sell')}. Your all-inclusive execution fee is ${fee.feeDisplay} — 0.1% of your ${fee.basis}, covering everything through closing.`;

    return makeResult(fee, ctx, [
      'Multi-methodology valuation (market comps + financial analysis)',
      'Defensible price range (conservative / likely / optimistic)',
      'Industry-specific multiple analysis with growth premiums',
      'Go/no-go recommendation with probability of sale score',
    ], comparisonText, previewInsight, 'sell');
  },

  B2: (ctx, fee) => {
    const earningsDollars = fee.basisAmountCents / 100;

    let previewInsight = '';
    if (earningsDollars > 0 && ctx.dealData.asking_price) {
      const askingDollars = ctx.dealData.asking_price / 100;
      const impliedMultiple = earningsDollars > 0 ? (askingDollars / earningsDollars).toFixed(1) : '?';
      previewInsight = `The asking price of $${askingDollars.toLocaleString()} implies a ${impliedMultiple}x multiple. The full model will tell you if that's reasonable and whether the deal cash flows with your financing structure.`;
    }

    const comparisonText = `Hiring an advisor would cost ${getAdvisoryCostComparison(ctx.league, 'buy')}. Your all-inclusive execution fee is ${fee.feeDisplay} — 0.1% of your ${fee.basis}, covering everything through closing and 180-day PMI.`;

    return makeResult(fee, ctx, [
      'Buyer\'s valuation model (what the business is worth TO YOU)',
      'DSCR analysis with your actual financing terms',
      'Cash-on-cash and IRR projections (Year 1 through Year 5)',
      'Due diligence checklists and deal-breaker identification',
    ], comparisonText, previewInsight, 'buy');
  },

  R2: (ctx, fee) => {
    let previewInsight = '';
    if (ctx.dealData.revenue) {
      const revDollars = ctx.dealData.revenue / 100;
      previewInsight = `At $${revDollars.toLocaleString()} in revenue, your investor materials need to tell a compelling growth story. The pitch deck will position your business for maximum valuation.`;
    }

    const comparisonText = `An investment bank would charge ${getAdvisoryCostComparison(ctx.league, 'raise')}. Your all-inclusive execution fee is ${fee.feeDisplay} — 0.1% of your ${fee.basis}.`;

    return makeResult(fee, ctx, [
      '10-15 slide pitch deck tailored to your raise',
      'Executive summary and blind teaser for outreach',
      'Financial model with 3-5 year projections',
      'Investor list with outreach strategy',
    ], comparisonText, previewInsight, 'raise');
  },
};

function buildPaywallSystemPrompt(
  ctx: PaywallContext,
  fee: ReturnType<typeof calculateExecutionFee>,
): string {
  const advisorCost = getAdvisoryCostComparison(ctx.league, ctx.journeyType);
  const minimumNote = fee.isMinimum ? '\nNote: The minimum execution fee is $999, which gives full access to everything.' : '';

  return `
## PAYWALL — Deal Execution Fee at Gate ${ctx.gate}
The user has completed the free gates and is ready for the paid execution phase.

PRICE: ${fee.feeDisplay} (0.1% of ${fee.basis}: ${fee.basisDisplay})${minimumNote}
THIS IS A ONE-TIME FEE — everything from here through closing + 180-day integration is included.

YOUR APPROACH:
1. Acknowledge what they've received for free — ValueLens, Value Readiness Report, CIM, preliminary analysis
2. Present the fee transparently: "Your deal execution fee is ${fee.feeDisplay} — that's 0.1% of your ${fee.basis}"
3. Compare: "${advisorCost} from a traditional advisor vs ${fee.feeDisplay} all-inclusive"
4. Emphasize: one payment, everything included through closing — no surprise charges, no subscriptions
5. Ask once. If they decline, respect it and continue helping with free guidance

NEVER:
- Mention "wallet" or "balance" or "credits" — this is a one-time execution fee
- Quote per-deliverable prices — everything is included
- Be pushy or repeat the offer
- Make them feel bad for declining
- Withhold useful free advice because they haven't paid
- Mention the league label (L1, L2, etc.) to the user
- Mention subscriptions or recurring charges

IF THEY ACCEPT:
- Confirm: "Processing your execution fee. Once confirmed, I'll generate your [deliverable name]."
- The system will redirect to Stripe checkout
- After payment, all gates through closing + 180 days are unlocked

IF THEY DECLINE:
- "No problem. I can still help you think through [topic] — I just can't generate formal deliverables or unlock the deal execution tools. What questions do you have?"
- Continue providing valuable conversational guidance
`;
}

export function isTestMode(): boolean {
  return process.env.TEST_MODE === 'true';
}
