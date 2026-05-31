/**
 * Client-side pricing constants for smbX.
 *
 * SOURCE OF TRUTH: `SMBX_PRICING_LOCKED.md` at the repo root.
 * Server twin: `server/services/subscriptionService.ts` PLANS constant.
 *
 * If this file disagrees with either of those, the lock doc wins. Update both at the same time.
 *
 * This module exists so client-side pricing surfaces (paywall, pricing tiles, Learn page,
 * Settings page, public Terms) all consume one canonical table instead of redeclaring strings.
 * Pre-2026-05-27 drift produced three different price ladders across code, docs, and UI —
 * keep all client pricing UI importing from here.
 */

export type TierId = 'free' | 'solo' | 'pro' | 'team' | 'enterprise';

export interface PricingTier {
  id: TierId;
  name: string;
  /** Price in cents. Used for math and Stripe checkout. */
  priceCents: number;
  /** Long form for prose. e.g. "$99/month". */
  priceDisplay: string;
  /** Short form for chips/tiles. e.g. "$99/mo" or "From $3,000/mo". */
  priceLabelShort: string;
  /** One-line description for tier cards. */
  note: string;
  /** Bundled MCP/agent allowances. These are software allowances, not metered fees.
   *  Canonical source: methodology/V19_BUILD_PLAN.md § V19 entitlement baseline. */
  allowances: {
    /** Total monthly V19 credits. */
    creditsMonthly: number | 'custom';
    /** Deterministic model runs per month. */
    modelRuns: number | 'custom';
    /** Studio book exports per month. */
    studioExports: number | 'custom';
    /** Studio books per month. */
    studioBooks: number | 'custom';
    /** API + MCP calls per month (any agent caller — Claude, ChatGPT, Copilot, direct). */
    apiMcpCalls: number | 'custom' | 0;
    /** Number of supervised MCP / agent keys (an agent identity tied to this account). */
    mcpAgentKeys: number | 'shared firm scope' | 'custom';
    /** Agent governance posture. */
    agentPosture: 'none' | 'supervised' | 'autonomous';
  };
}

export const PRICING_TIERS: Record<TierId, PricingTier> = {
  free: {
    id: 'free',
    name: 'Free',
    priceCents: 0,
    priceDisplay: 'Free',
    priceLabelShort: 'Free',
    note: 'Unlimited Yulia conversation. One free deliverable, ever. Email required.',
    allowances: {
      creditsMonthly: 100,
      modelRuns: 20,
      studioExports: 1,
      studioBooks: 1,
      apiMcpCalls: 0,
      mcpAgentKeys: 0,
      agentPosture: 'none',
    },
  },
  solo: {
    id: 'solo',
    name: 'Solo',
    priceCents: 9900,
    priceDisplay: '$99/month',
    priceLabelShort: '$99/mo',
    note: 'Unlimited ValueLens, deal scoring, VRR, SDE/EBITDA, exports. One supervised MCP/agent key. One active deal at a time.',
    allowances: {
      creditsMonthly: 2000,
      modelRuns: 300,
      studioExports: 30,
      studioBooks: 12,
      apiMcpCalls: 1000,
      mcpAgentKeys: 1,
      agentPosture: 'supervised',
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    priceCents: 24900,
    priceDisplay: '$249/month',
    priceLabelShort: '$249/mo',
    note: 'Everything in Solo + CIM, deal room, market discovery, source routing, DD/LOI scaffolds, living docs. Three supervised MCP/agent keys. Unlimited active deals.',
    allowances: {
      creditsMonthly: 6000,
      modelRuns: 1200,
      studioExports: 150,
      studioBooks: 60,
      apiMcpCalls: 6000,
      mcpAgentKeys: 3,
      agentPosture: 'supervised',
    },
  },
  team: {
    id: 'team',
    name: 'Team',
    priceCents: 74900,
    priceDisplay: '$749/month',
    priceLabelShort: '$749/mo',
    note: 'Everything in Pro + shared deal vault, firm templates, up to 5 seats, specialist handoff coordination, supervised agent workflows.',
    allowances: {
      creditsMonthly: 25000,
      modelRuns: 6000,
      studioExports: 600,
      studioBooks: 300,
      apiMcpCalls: 15000,
      mcpAgentKeys: 'shared firm scope',
      agentPosture: 'supervised',
    },
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    priceCents: 300000,
    priceDisplay: '$3,000+/month',
    priceLabelShort: 'From $3,000/mo',
    note: 'Everything in Team + single-tenant, SSO, API controls, portfolio infrastructure, custom governance, governed autonomous agent scope, SLA.',
    allowances: {
      creditsMonthly: 'custom',
      modelRuns: 'custom',
      studioExports: 'custom',
      studioBooks: 'custom',
      apiMcpCalls: 'custom',
      mcpAgentKeys: 'custom',
      agentPosture: 'autonomous',
    },
  },
};

/** Tier order used by the pricing UI top-to-bottom / left-to-right. */
export const TIER_ORDER: readonly TierId[] = ['free', 'solo', 'pro', 'team', 'enterprise'];

/** Get a tier by id, normalizing legacy plan names ('starter' -> 'solo', 'professional' -> 'pro'). */
export function getPricingTier(planId: string | null | undefined): PricingTier {
  if (planId === 'starter') return PRICING_TIERS.solo;
  if (planId === 'professional') return PRICING_TIERS.pro;
  if (planId && planId in PRICING_TIERS) return PRICING_TIERS[planId as TierId];
  return PRICING_TIERS.free;
}
