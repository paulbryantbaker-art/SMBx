/**
 * Paywall Service — Generates contextual paywall prompts when users
 * hit paid gates (S2, B2, R2). Includes value demonstration,
 * comparison pricing, and preview deliverables.
 *
 * All prices in CENTS.
 */
import { getLeagueMultiplier } from './leagueClassifier.js';
import { getPaywallBasePrice } from './gateReadinessService.js';

export interface PaywallContext {
  gate: string;
  league: string;
  journeyType: string;
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
}

/**
 * Generate a contextual paywall prompt based on deal data.
 * This is injected into Yulia's system prompt when approaching a paywall.
 */
export function generatePaywallPrompt(ctx: PaywallContext): PaywallPrompt {
  const basePriceCents = getPaywallBasePrice(ctx.gate);
  const multiplier = getLeagueMultiplier(ctx.league);
  const priceCents = Math.round(basePriceCents * multiplier);
  const priceDisplay = `$${(priceCents / 100).toFixed(2)}`;

  const generator = PAYWALL_GENERATORS[ctx.gate];
  if (!generator) {
    return {
      priceCents,
      priceDisplay,
      valueProps: ['Detailed analysis tailored to your deal'],
      comparisonText: 'A typical advisor would charge $5,000+ for this analysis.',
      previewInsight: '',
      callToAction: `Ready to unlock? It's ${priceDisplay}.`,
      systemPromptAddition: `The user is at a paywall gate (${ctx.gate}). Price: ${priceDisplay}. Present value before asking for payment.`,
    };
  }

  return generator(ctx, priceCents, priceDisplay);
}

// ─── Gate-specific paywall generators ───────────────────────

type PaywallGenerator = (ctx: PaywallContext, priceCents: number, priceDisplay: string) => PaywallPrompt;

const PAYWALL_GENERATORS: Record<string, PaywallGenerator> = {
  S2: (ctx, priceCents, priceDisplay) => {
    const earnings = ctx.dealData.sde || ctx.dealData.ebitda || 0;
    const earningsDollars = earnings / 100;
    const metric = ctx.dealData.ebitda ? 'EBITDA' : 'SDE';

    // Generate a preview insight based on available data
    let previewInsight = '';
    if (earningsDollars > 0 && ctx.dealData.industry) {
      const lowMultiple = ctx.league === 'L1' ? 2.0 : ctx.league === 'L2' ? 3.0 : 4.0;
      const highMultiple = ctx.league === 'L1' ? 3.5 : ctx.league === 'L2' ? 5.0 : 6.0;
      const lowVal = Math.round(earningsDollars * lowMultiple);
      const highVal = Math.round(earningsDollars * highMultiple);
      previewInsight = `Based on your ${metric} of $${earningsDollars.toLocaleString()} and ${ctx.dealData.industry} industry benchmarks, your preliminary range is $${lowVal.toLocaleString()} – $${highVal.toLocaleString()}. The full valuation will refine this with growth premiums, margin analysis, and risk adjustments.`;
    }

    // Comparison pricing
    const advisorCost = ctx.league === 'L1' || ctx.league === 'L2' ? '$3,000–$5,000' : '$10,000–$25,000';

    return {
      priceCents,
      priceDisplay,
      valueProps: [
        'Multi-methodology valuation (market comps + financial analysis)',
        'Defensible price range (conservative / likely / optimistic)',
        'Industry-specific multiple analysis with growth premiums',
        'Price gap analysis vs. your target',
        'Go/no-go recommendation with probability of sale score',
      ],
      comparisonText: `A business broker or M&A advisor would charge ${advisorCost} for this analysis. You're getting institutional-quality work for ${priceDisplay}.`,
      previewInsight,
      callToAction: `Your valuation analysis is ${priceDisplay}. Want me to generate it?`,
      systemPromptAddition: buildPaywallSystemPrompt(ctx, priceCents, priceDisplay, previewInsight, advisorCost),
    };
  },

  B2: (ctx, priceCents, priceDisplay) => {
    const earnings = ctx.dealData.ebitda || ctx.dealData.sde || 0;
    const earningsDollars = earnings / 100;

    let previewInsight = '';
    if (earningsDollars > 0 && ctx.dealData.asking_price) {
      const askingDollars = ctx.dealData.asking_price / 100;
      const impliedMultiple = earningsDollars > 0 ? (askingDollars / earningsDollars).toFixed(1) : '?';
      previewInsight = `The asking price of $${askingDollars.toLocaleString()} implies a ${impliedMultiple}x multiple. The full model will tell you if that's reasonable for the industry and whether the deal cash flows with your financing structure.`;
    }

    const advisorCost = '$5,000–$15,000';

    return {
      priceCents,
      priceDisplay,
      valueProps: [
        'Buyer\'s valuation model (what the business is worth TO YOU)',
        'DSCR analysis with your actual financing terms',
        'Cash-on-cash and IRR projections (Year 1 through Year 5)',
        'Deal-breaker identification',
        'LOI-ready terms recommendation',
      ],
      comparisonText: `Hiring an analyst to build this model would cost ${advisorCost}. Yours is ${priceDisplay}.`,
      previewInsight,
      callToAction: `Your buyer's valuation model is ${priceDisplay}. Want me to build it?`,
      systemPromptAddition: buildPaywallSystemPrompt(ctx, priceCents, priceDisplay, previewInsight, advisorCost),
    };
  },

  R2: (ctx, priceCents, priceDisplay) => {
    let previewInsight = '';
    if (ctx.dealData.revenue) {
      const revDollars = ctx.dealData.revenue / 100;
      previewInsight = `At $${revDollars.toLocaleString()} in revenue, your investor materials need to tell a compelling growth story. The pitch deck will position your business for maximum valuation — including market sizing, competitive positioning, and a financial model investors will actually read.`;
    }

    const advisorCost = '$15,000–$50,000';

    return {
      priceCents,
      priceDisplay,
      valueProps: [
        '10-15 slide pitch deck tailored to your raise',
        'Executive summary for email outreach',
        'Blind teaser for initial approaches',
        'Financial model with 3-5 year projections',
        'Data room structure with document checklist',
      ],
      comparisonText: `An investment bank would charge ${advisorCost} for these materials. Yours is ${priceDisplay}.`,
      previewInsight,
      callToAction: `Your investor materials package is ${priceDisplay}. Want me to create it?`,
      systemPromptAddition: buildPaywallSystemPrompt(ctx, priceCents, priceDisplay, previewInsight, advisorCost),
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
## PAYWALL — Gate ${ctx.gate}
The user has completed the free gates and is ready for paid analysis.

PRICE: ${priceDisplay} (base $${(getPaywallBasePrice(ctx.gate) / 100).toFixed(2)} × ${ctx.league} multiplier ${getLeagueMultiplier(ctx.league)}x)

YOUR APPROACH:
1. SHOW VALUE FIRST — demonstrate you already understand their business deeply
2. Give them a FREE preview insight so they know you're not bluffing:
   ${previewInsight || 'Reference their specific data and what the analysis will reveal.'}
3. THEN present the price with comparison: "${advisorCost} from an advisor vs ${priceDisplay} from me"
4. List what they get (bullet points)
5. Ask once. If they decline, respect it and continue helping with free guidance

NEVER:
- Be pushy or repeat the offer
- Make them feel bad for declining
- Withhold useful free advice just because they haven't paid
- Say "you need to pay" — say "this analysis costs ${priceDisplay}"

IF THEY ACCEPT:
- Confirm: "Generating your [deliverable name]. This takes about 30 seconds."
- The system will check wallet balance and deduct automatically
- If insufficient funds, the system will prompt them to top up

IF THEY DECLINE:
- "No problem. I can still help you think through [topic] — I just can't generate the formal deliverable. What questions do you have?"
- Continue providing valuable conversational guidance
`;
}

/**
 * Format wallet top-up options for display.
 */
export const WALLET_BLOCKS = [
  { name: 'Starter', price: 5000, bonus: 0, total: 5000, discount: '0%' },
  { name: 'Builder', price: 10000, bonus: 500, total: 10500, discount: '5%' },
  { name: 'Momentum', price: 25000, bonus: 2500, total: 27500, discount: '10%' },
  { name: 'Accelerator', price: 50000, bonus: 7500, total: 57500, discount: '15%' },
  { name: 'Professional', price: 100000, bonus: 20000, total: 120000, discount: '20%' },
  { name: 'Scale', price: 250000, bonus: 62500, total: 312500, discount: '25%' },
  { name: 'Enterprise Lite', price: 500000, bonus: 150000, total: 650000, discount: '30%' },
  { name: 'Enterprise', price: 1000000, bonus: 300000, total: 1300000, discount: '30%' },
  { name: 'Enterprise Plus', price: 2500000, bonus: 750000, total: 3250000, discount: '30%' },
  { name: 'Institutional', price: 5000000, bonus: 1500000, total: 6500000, discount: '30%' },
];
