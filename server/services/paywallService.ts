/**
 * Paywall Service — Generates platform fee prompts when users
 * hit the paywall gate (S2/B2/R2).
 *
 * NEW MODEL: One-time per-deal platform fee. No wallet, no per-deliverable pricing.
 * Price determined by league via platform_fee_schedule table.
 * All amounts in CENTS.
 */
import { sql } from '../db.js';
import { getAdvisoryCostComparison } from './platformFeeService.js';

export interface PaywallContext {
  gate: string;
  league: string;
  journeyType: string;
  dealId: number;
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
  valueProps: string[];
  comparisonText: string;
  previewInsight: string;
  callToAction: string;
  systemPromptAddition: string;
  whatYouGet: string[];     // everything included in the platform fee
}

/**
 * Generate a platform fee paywall prompt based on deal data.
 */
export async function generatePaywallPrompt(ctx: PaywallContext): Promise<PaywallPrompt> {
  // Get platform fee from schedule
  const [feeRow] = await sql`
    SELECT fee_cents FROM platform_fee_schedule WHERE league = ${ctx.league}
  `;
  const priceCents = feeRow?.fee_cents || 99900; // fallback to L1
  const priceDisplay = `$${(priceCents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const generator = PAYWALL_GENERATORS[ctx.gate];
  if (!generator) {
    const comparisonText = getAdvisoryCostComparison(ctx.league, ctx.journeyType);
    return {
      priceCents,
      priceDisplay,
      valueProps: ['Full deal execution platform access'],
      comparisonText,
      previewInsight: '',
      callToAction: `Continue your deal for a one-time platform fee of ${priceDisplay}.`,
      systemPromptAddition: buildPaywallSystemPrompt(ctx, priceCents, priceDisplay, '', comparisonText),
      whatYouGet: getWhatYouGet(ctx.journeyType),
    };
  }

  return generator(ctx, priceCents, priceDisplay);
}

// ─── What's included in the platform fee ──────────────────

function getWhatYouGet(journeyType: string): string[] {
  if (journeyType === 'sell') {
    return [
      'Multi-methodology business valuation with defensible price range',
      'Professional CIM (Confidential Information Memorandum)',
      'Buyer list with targeted outreach strategy',
      'Deal room with document management',
      'LOI templates and negotiation support',
      'Closing checklist and transaction coordination',
      'Unlimited AI-guided support through closing',
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

type PaywallGenerator = (ctx: PaywallContext, priceCents: number, priceDisplay: string) => PaywallPrompt;

const PAYWALL_GENERATORS: Record<string, PaywallGenerator> = {
  S2: (ctx, priceCents, priceDisplay) => {
    const earnings = ctx.dealData.sde || ctx.dealData.ebitda || 0;
    const earningsDollars = earnings / 100;
    const metric = ctx.dealData.ebitda ? 'EBITDA' : 'SDE';

    let previewInsight = '';
    if (earningsDollars > 0 && ctx.dealData.industry) {
      const lowMultiple = ctx.league === 'L1' ? 2.0 : ctx.league === 'L2' ? 3.0 : 4.0;
      const highMultiple = ctx.league === 'L1' ? 3.5 : ctx.league === 'L2' ? 5.0 : 6.0;
      const lowVal = Math.round(earningsDollars * lowMultiple);
      const highVal = Math.round(earningsDollars * highMultiple);
      previewInsight = `Based on your ${metric} of $${earningsDollars.toLocaleString()} and ${ctx.dealData.industry} industry benchmarks, your preliminary range is $${lowVal.toLocaleString()} – $${highVal.toLocaleString()}. The full valuation will refine this with growth premiums, margin analysis, and risk adjustments.`;
    }

    const comparisonText = getAdvisoryCostComparison(ctx.league, 'sell');

    return {
      priceCents,
      priceDisplay,
      valueProps: [
        'Multi-methodology valuation (market comps + financial analysis)',
        'Defensible price range (conservative / likely / optimistic)',
        'Industry-specific multiple analysis with growth premiums',
        'Go/no-go recommendation with probability of sale score',
      ],
      comparisonText: `A traditional advisor would charge ${comparisonText}. Your all-inclusive platform fee is ${priceDisplay} — covering everything from valuation through closing.`,
      previewInsight,
      callToAction: `Ready to proceed? Your one-time platform fee is ${priceDisplay} — everything through closing is included.`,
      systemPromptAddition: buildPaywallSystemPrompt(ctx, priceCents, priceDisplay, previewInsight, comparisonText),
      whatYouGet: getWhatYouGet('sell'),
    };
  },

  B2: (ctx, priceCents, priceDisplay) => {
    const earnings = ctx.dealData.ebitda || ctx.dealData.sde || 0;
    const earningsDollars = earnings / 100;

    let previewInsight = '';
    if (earningsDollars > 0 && ctx.dealData.asking_price) {
      const askingDollars = ctx.dealData.asking_price / 100;
      const impliedMultiple = earningsDollars > 0 ? (askingDollars / earningsDollars).toFixed(1) : '?';
      previewInsight = `The asking price of $${askingDollars.toLocaleString()} implies a ${impliedMultiple}x multiple. The full model will tell you if that's reasonable and whether the deal cash flows with your financing structure.`;
    }

    const comparisonText = getAdvisoryCostComparison(ctx.league, 'buy');

    return {
      priceCents,
      priceDisplay,
      valueProps: [
        'Buyer\'s valuation model (what the business is worth TO YOU)',
        'DSCR analysis with your actual financing terms',
        'Cash-on-cash and IRR projections (Year 1 through Year 5)',
        'Due diligence checklists and deal-breaker identification',
      ],
      comparisonText: `Hiring an advisor for this would cost ${comparisonText}. Your all-inclusive platform fee is ${priceDisplay} — covering everything from valuation through closing and 180-day PMI.`,
      previewInsight,
      callToAction: `Ready to proceed? Your one-time platform fee is ${priceDisplay} — everything through closing is included.`,
      systemPromptAddition: buildPaywallSystemPrompt(ctx, priceCents, priceDisplay, previewInsight, comparisonText),
      whatYouGet: getWhatYouGet('buy'),
    };
  },

  R2: (ctx, priceCents, priceDisplay) => {
    let previewInsight = '';
    if (ctx.dealData.revenue) {
      const revDollars = ctx.dealData.revenue / 100;
      previewInsight = `At $${revDollars.toLocaleString()} in revenue, your investor materials need to tell a compelling growth story. The pitch deck will position your business for maximum valuation.`;
    }

    const comparisonText = getAdvisoryCostComparison(ctx.league, 'raise');

    return {
      priceCents,
      priceDisplay,
      valueProps: [
        '10-15 slide pitch deck tailored to your raise',
        'Executive summary and blind teaser for outreach',
        'Financial model with 3-5 year projections',
        'Investor list with outreach strategy',
      ],
      comparisonText: `An investment bank would charge ${comparisonText}. Your all-inclusive platform fee is ${priceDisplay}.`,
      previewInsight,
      callToAction: `Ready to proceed? Your one-time platform fee is ${priceDisplay} — everything through closing is included.`,
      systemPromptAddition: buildPaywallSystemPrompt(ctx, priceCents, priceDisplay, previewInsight, comparisonText),
      whatYouGet: getWhatYouGet('raise'),
    };
  },
};

function buildPaywallSystemPrompt(
  ctx: PaywallContext,
  priceCents: number,
  priceDisplay: string,
  previewInsight: string,
  advisorCost: string,
): string {
  return `
## PAYWALL — Platform Fee at Gate ${ctx.gate}
The user has completed the free gates and is ready for the paid execution phase.

PRICE: ${priceDisplay} (one-time platform fee for ${ctx.league} league)
THIS IS A ONE-TIME FEE — everything from here through closing is included.

YOUR APPROACH:
1. SHOW VALUE FIRST — demonstrate you already understand their business deeply
2. Give them a FREE preview insight so they know you're not bluffing:
   ${previewInsight || 'Reference their specific data and what the analysis will reveal.'}
3. THEN present the platform fee with comparison: "${advisorCost} from a traditional advisor vs ${priceDisplay} all-inclusive"
4. Emphasize: one payment, everything included through closing — no surprise charges
5. Ask once. If they decline, respect it and continue helping with free guidance

NEVER:
- Mention "wallet" or "balance" or "credits" — this is a one-time platform fee
- Quote per-deliverable prices — everything is included
- Be pushy or repeat the offer
- Make them feel bad for declining
- Withhold useful free advice just because they haven't paid
- Mention the league label (L1, L2, etc.) to the user

IF THEY ACCEPT:
- Confirm: "Processing your platform fee. Once confirmed, I'll generate your [deliverable name]."
- The system will redirect to Stripe checkout
- After payment, all gates through closing are unlocked

IF THEY DECLINE:
- "No problem. I can still help you think through [topic] — I just can't generate formal deliverables or unlock the deal execution tools. What questions do you have?"
- Continue providing valuable conversational guidance
`;
}

export function isTestMode(): boolean {
  return process.env.TEST_MODE === 'true';
}
