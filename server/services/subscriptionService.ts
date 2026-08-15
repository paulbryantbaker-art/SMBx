/**
 * Entitlements. NOT billing — the app charges nothing and never will.
 *
 * Paul, 2026-08-15: *"this is old from when I was going to sell the app - not
 * relevant any more."*
 *
 * This file was 467 lines of Stripe: a five-tier price ladder ($99 / $249 /
 * $749 / $3,000+), checkout sessions, a customer portal, webhook handling,
 * cancellation, and a per-deliverable paywall that returned 402 with a
 * checkout URL. All of it was already unreachable — `/api/stripe` returns 410
 * in practice mode and `getUserPlan` short-circuits to `enterprise` — but
 * unreachable is not the same as gone, and THE LINE v2 rule 1 is not "the app
 * does not currently charge money", it is that **nothing in the app charges
 * money**, permanently, because the app is Paul's private instrument and will
 * never be sold. Rule 2 says the same thing about the wallet and adds "never
 * recreate". Retaining a working billing implementation behind a flag is one
 * env var away from contradicting both.
 *
 * WHAT SURVIVES, AND WHY EACH ONE HAD TO.
 *
 * `Plan` and `PLAN_RANK` — `v19EntitlementService` keys its whole capability
 * matrix on `Record<Plan, …>`, and DEFINITIVE's conformance suite reads that
 * matrix. The ladder is now a capability ordering with no prices attached,
 * which is what it always was underneath the money.
 *
 * `getUserPlan` — still the one place that answers "what may this user do".
 * It returns `enterprise` for everyone, because practice mode is the permanent
 * posture and only the team allowlist can authenticate at all.
 *
 * `normalizePlan` / `planMeetsRequirement` — read by the entitlement service
 * and by admin's user table, which shows a plan column.
 *
 * WHAT IS GONE: `PlanInfo.priceCents` / `.priceDisplay`, `createCheckout`,
 * `createSubscriptionCheckout`, `createCustomerPortal`, `handleSubscriptionWebhook`,
 * `cancelSubscription`, `getSubscription`, `setUserPlan`, `isEligibleFreeDeliverable`,
 * `getRequiredPlan`, `markFreeDeliverableUsed`, `buildDeliverablePaywall`, the
 * Stripe client, and `hasActiveSubscription`.
 *
 * `canGenerateDeliverable` survives as a constant `true`, deliberately rather
 * than being deleted: `tools.ts` and `routes/deliverables.ts` both branch on
 * it, and a function that answers "yes" is a smaller change than unpicking two
 * call sites — and it leaves one obvious place to look if a gate is ever
 * wanted again for a non-money reason.
 */
import { sql } from '../db.js';

export type Plan = 'free' | 'solo' | 'pro' | 'team' | 'enterprise';

/** Capability ordering. Not a price ladder — there are no prices. */
const PLAN_RANK: Record<Plan, number> = {
  free: 0,
  solo: 1,
  pro: 2,
  team: 3,
  enterprise: 4,
};

export function normalizePlan(plan?: string | null): Plan {
  if (plan === 'starter') return 'solo';
  if (plan === 'professional') return 'pro';
  if (plan === 'solo' || plan === 'pro' || plan === 'team' || plan === 'enterprise') return plan;
  return 'free';
}

/**
 * `priceCents` and `priceDisplay` are GONE from this shape.
 *
 * They were not decoration. `promptBuilder` interpolated them into Yulia's
 * system prompt — a layer that told her the user was on Free and quoted all
 * three upgrade prices at her — and `admin.ts` multiplied them by a user count
 * to report MRR. Both are deleted rather than zeroed: a `$0.00/month` in an
 * upsell script is still an upsell script.
 */
export interface PlanInfo {
  plan: Plan;
  name: string;
  note: string;
}

export const PLANS: Record<Plan, PlanInfo> = {
  free: { plan: 'free', name: 'Free', note: 'Unlimited Yulia conversation' },
  solo: { plan: 'solo', name: 'Solo', note: 'Analysis, valuations, exports, solo deal desk workflows' },
  pro: { plan: 'pro', name: 'Pro', note: 'CIM, deal room, market discovery, source routing, parallel deal work' },
  team: { plan: 'team', name: 'Team', note: 'Seats, shared vaults, firm templates, specialist handoffs' },
  enterprise: { plan: 'enterprise', name: 'Enterprise', note: 'Everything. What the practice runs on.' },
};

/**
 * What this user may do.
 *
 * Everyone is `enterprise`. Practice mode is the permanent posture (rule 3),
 * `TEAM_ALLOWLIST` gates registration and login, and `practicePerimeter` 403s
 * any JWT that is not a team identity — so by the time a request reaches here
 * it belongs to the practice, and the practice runs unmetered.
 *
 * THE DATABASE READ IS GONE. This used to fall through to
 * `SELECT plan, trial_ends_at FROM users`, honour an early-access trial, and
 * carry a defensive fallback to the `subscriptions` table for the case where
 * the `plan` column had not been migrated yet. Migration 126 drops that table,
 * so the fallback would now throw on the path that exists to stop a throw.
 * `async` is kept so the six call sites do not all have to change.
 */
export async function getUserPlan(_userId: number): Promise<Plan> {
  return 'enterprise';
}

/** Does this plan meet or exceed a required one? */
export function planMeetsRequirement(userPlan: Plan, requiredPlan: Plan): boolean {
  return PLAN_RANK[userPlan] >= PLAN_RANK[requiredPlan];
}

/**
 * Always yes. Kept as a function, not deleted — see the header.
 *
 * The shape is preserved so `tools.ts` and `routes/deliverables.ts` keep
 * compiling unchanged; both branch on `.allowed` and neither now takes the
 * false branch. `requiredPlan`/`currentPlan` stay on the result because the
 * entitlement service reads the same shape.
 */
export async function canGenerateDeliverable(
  _userId: number,
  _deliverableType: string,
): Promise<{ allowed: boolean; requiredPlan: Plan; currentPlan: Plan; reason?: string }> {
  return { allowed: true, requiredPlan: 'free', currentPlan: 'enterprise' };
}

/** Kept only so `getSubscription`-shaped callers do not need a null check. */
export async function getPlanRow(userId: number): Promise<{ plan: Plan } | null> {
  const [row] = await sql`SELECT id FROM users WHERE id = ${userId}`;
  return row ? { plan: 'enterprise' } : null;
}
