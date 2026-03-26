/**
 * Paywall Service — Generates subscription upgrade prompts when users
 * hit the paywall gate (S2/B2/R2) or try to access paid features.
 *
 * NEW MODEL: Monthly subscriptions — Starter $49, Professional $149, Enterprise $999.
 * No per-deal fees, no wallet, no credits.
 */
import { getUserPlan, getRequiredPlan, PLANS, type Plan } from './subscriptionService.js';

export interface PaywallContext {
  gate: string;
  league: string;
  journeyType: string;
  dealId?: number;
  userId?: number;
  dealData: {
    industry?: string;
    revenue?: number;
    sde?: number;
    ebitda?: number;
    business_name?: string;
    asking_price?: number;
  };
}

export interface PaywallPrompt {
  requiredPlan: Plan;
  priceDisplay: string;
  valueProps: string[];
  callToAction: string;
  systemPromptAddition: string;
  whatYouGet: string[];
}

/**
 * Generate a subscription paywall prompt based on the gate/deliverable.
 */
export function generatePaywallPrompt(ctx: PaywallContext): PaywallPrompt {
  const generator = PAYWALL_GENERATORS[ctx.gate];
  const requiredPlan: Plan = generator ? getGateRequiredPlan(ctx.gate) : 'starter';
  const planInfo = PLANS[requiredPlan];

  if (!generator) {
    return {
      requiredPlan,
      priceDisplay: planInfo.priceDisplay,
      valueProps: ['Full deal execution platform access'],
      callToAction: `Upgrade to ${planInfo.name} for ${planInfo.priceDisplay} to unlock all features.`,
      systemPromptAddition: buildPaywallSystemPrompt(ctx, requiredPlan),
      whatYouGet: getWhatYouGet(ctx.journeyType),
    };
  }

  return generator(ctx, requiredPlan);
}

function getGateRequiredPlan(gate: string): Plan {
  // S2/B2/R2 and beyond need at least starter
  return 'starter';
}

// ─── What's included per journey ─────────────────────────────

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

type PaywallGenerator = (ctx: PaywallContext, requiredPlan: Plan) => PaywallPrompt;

function makeResult(
  ctx: PaywallContext,
  requiredPlan: Plan,
  valueProps: string[],
  journeyType: string,
): PaywallPrompt {
  const planInfo = PLANS[requiredPlan];
  return {
    requiredPlan,
    priceDisplay: planInfo.priceDisplay,
    valueProps,
    callToAction: `Upgrade to ${planInfo.name} for ${planInfo.priceDisplay} to unlock everything for this deal and beyond.`,
    systemPromptAddition: buildPaywallSystemPrompt(ctx, requiredPlan),
    whatYouGet: getWhatYouGet(journeyType),
  };
}

const PAYWALL_GENERATORS: Record<string, PaywallGenerator> = {
  S2: (ctx, plan) => makeResult(ctx, plan, [
    'Multi-methodology valuation (market comps + financial analysis)',
    'Defensible price range (conservative / likely / optimistic)',
    'Industry-specific multiple analysis with growth premiums',
    'Go/no-go recommendation with probability of sale score',
  ], 'sell'),

  B2: (ctx, plan) => makeResult(ctx, plan, [
    'Buyer\'s valuation model (what the business is worth TO YOU)',
    'DSCR analysis with your actual financing terms',
    'Cash-on-cash and IRR projections (Year 1 through Year 5)',
    'Due diligence checklists and deal-breaker identification',
  ], 'buy'),

  R2: (ctx, plan) => makeResult(ctx, plan, [
    '10-15 slide pitch deck tailored to your raise',
    'Executive summary and blind teaser for outreach',
    'Financial model with 3-5 year projections',
    'Investor list with outreach strategy',
  ], 'raise'),
};

function buildPaywallSystemPrompt(ctx: PaywallContext, requiredPlan: Plan): string {
  const planInfo = PLANS[requiredPlan];

  return `
## PAYWALL — Subscription Required at Gate ${ctx.gate}
The user has completed the free gates and is ready for paid features.

REQUIRED PLAN: ${planInfo.name} (${planInfo.priceDisplay})
This is a monthly subscription — all features at this tier and below are included for all deals.

YOUR APPROACH:
Everything generated so far — the ValueLens audit, the Value Readiness Report, the preliminary analysis — is yours to keep, no payment required.

To unlock the full execution platform — your deal room, professional deal documents, legal templates, closing support, and more — you'll need a ${planInfo.name} subscription at ${planInfo.priceDisplay}. It covers all your deals, cancel anytime.

NEVER:
- Mention "wallet" or "balance" or "credits" — this is a subscription
- Mention "execution fee" or "platform fee" — those are deprecated
- Quote per-deliverable prices — everything at the tier is included
- Be pushy or repeat the offer
- Make them feel bad for declining
- Mention the league label (L1, L2, etc.) to the user

IF THEY ACCEPT:
- Confirm: "Let me set up your ${planInfo.name} subscription."
- The system will redirect to Stripe checkout
- After subscribing, all features at this tier are unlocked for all deals

IF THEY DECLINE:
- "No problem. I can still help you think through any questions — I just can't generate the paid deliverables. What would you like to explore?"
- Continue providing valuable conversational guidance
`;
}

export function isTestMode(): boolean {
  return process.env.TEST_MODE === 'true';
}
