> **RETIRED (2026-07-11) — business-model pivot.** smbX is no longer a software
> product; it is a buy-side corp-dev-as-a-service practice governed by
> [`THE_LINE_POLICY.md`](THE_LINE_POLICY.md) (v2). Practice compensation is
> per-engagement — buy-side retainer + buy-side success fee paid by the acquirer
> client, papered in the engagement letter — not a product price list. The
> subscription ladder below is **dormant, not unwound**: `subscriptionService.ts`
> and Stripe stay in the tree, but practice mode grants the team full entitlements
> and disables checkout. The 2026-07-11 "July 10 flat-fee" addendum below reached
> the marketing surface for one day, was never ratified for billing, and is retired
> with the pivot. Nothing in this file should gate new work.

# smbX Pricing — LOCKED

**Status:** Canonical pricing record. This file is the source of truth for what smbX charges.
**Locked:** 2026-05-27.
**Last reviewed:** 2026-07-11 (addendum added; ladder unchanged).
**Supersedes:** all earlier pricing tables in `SMBX_PRICING_STRATEGY_AND_RECOMMENDATION.md`, `methodology/METHODOLOGY_V19.md`, and any prior `subscriptionService.ts` constants.

If any other document, marketing page, or code constant disagrees with this file, this file wins. Open a change request before changing prices in code — do not let docs and code drift again. (One sanctioned in-flight exception: the marketing surface on the retool branch — see the 2026-07-11 addendum immediately below.)

---

## 2026-07-11 addendum — July 10 flat-fee-per-deal model (marketing live; ratification pending)

The 2026-07-10 marketing copy deck (CD handoff, implemented on branch
`claude/ui-ux-redesign-93s3y6`) moves the **public marketing story** to a new
commercial model:

- **One flat fee to run the whole deal**, sized by deal league (the existing six
  leagues, detected during onboarding), covering everything from first valuation
  to signed close, however long it takes.
- **Non-contingent, never a percentage.** The fee is a fixed number set before
  the engagement starts and does not move with what the deal closes at.
- **Free first.** Unlimited conversation + the free Baseline™; Yulia quotes the
  exact fee in-conversation right after the Baseline. **No public price grid** —
  the page shows only the shape ("a few thousand dollars to the low tens of
  thousands, start to close"). The league→fee mapping is not committed to any
  client surface or to this repo's marketing code.
- **Subscription demoted to a volume plan** for repeat acquirers (PE, family
  offices, search funds, advisors at 3+ deals/year) — one quiet "running deals
  regularly?" section, no tier table. Advisors: first three client deals free.

**What this addendum does and does not change:**

- `client/src/marketing/pages/Pricing.tsx` now implements the July 10 model and
  renders no ladder digits.
- The ladder below remains the live **billing** truth: `subscriptionService.ts`,
  `STRIPE_PRICE_*`, in-app Settings, and plan gating are unchanged. Nothing in
  the product charges per deal yet.
- `client/src/lib/pricing.ts` stays canonical for every app surface that shows
  plan labels or digits.

**Ratification checklist before the billing side ships** (the change procedure
at the bottom of this file still applies):

1. **THE LINE check (drift trigger — route to counsel).**
   `THE_LINE_POLICY.md` → Pricing Firewall currently forbids "any pricing tier
   based on deal size, deal value, or deal outcome." The July 10 model passes
   the four-layer test's compensation layer — flat, set up front, never varying
   with outcome or close — but collides with that bullet **as written**. Counsel
   must bless an amendment (e.g. forbid pricing that varies with deal *outcome*
   or is expressed as a *percentage of value*, with an explicit carve-out for
   pre-set flat engagement fees sized by league/complexity) before any per-deal
   fee is charged.
2. **League→fee memo.** Write the mapping (server-side only, never shipped to a
   client bundle), link it from this file.
3. **Per-deal purchase + entitlement rail** for principals; the volume plan for
   repeat acquirers stays on the existing subscription rail.
4. **Re-lock.** Replace the ladder section below with the ratified model and
   update `CLAUDE.md` rule 1.

Until all four are done, the ladder below stays authoritative for anything that
actually charges money.

---

## The ladder

| Tier | Price | Who it's for | Seats | What's in it |
|---|---|---|---|---|
| **Free** | $0 | Anyone who wants to meet Yulia | 1 | Unlimited Yulia conversation. ONE free deliverable, ever. Email required. |
| **Solo** | $99 / mo | Self-funded searchers, principal sellers and buyers, first-time acquirers, sole-operator brokers | 1 | Unlimited ValueLens, deal scoring, VRR, SDE/EBITDA, exports. 1 supervised MCP/agent key. |
| **Pro** | $249 / mo | Practitioners running multiple deals — independent sponsors, search funders, LMM advisors, solo bankers | 1 | Everything in Solo + CIM, deal room, market discovery, source routing, DD/LOI scaffolds, living docs. 3 supervised MCP/agent keys. Unlimited active deals. |
| **Team** | $749 / mo | Boutique firms, small corp-dev teams, small family-office direct-investing shops | Up to 5 | Everything in Pro + shared deal vault, firm templates, seats, specialist handoff coordination, supervised agent workflows. |
| **Enterprise** | From $3,000 / mo | Corp dev at serial acquirers, mid-market PE, multi-family offices, large advisory boutiques | 6+ | Everything in Team + single-tenant, SSO, API controls, portfolio infrastructure, custom governance, governed autonomous agent scope, SLA. |

All prices are USD, billed monthly. Annual billing may apply a single-digit-percent discount; annual pricing is not a separate tier.

---

## What did NOT lock

The May 2026 Hybrid Access-Fee analysis proposed two mechanics on top of monthly tiers:

1. **Per-artifact à-la-carte SKUs** ($49–$499 list, e.g. working-capital peg, full QoE-replacement memo, LBO model, FIRPTA withholding, IP chain-of-title).
2. **Credit overage rail** ($0.10 per credit, Salesforce Agentforce-style anchor).

Neither is in scope right now. The current ladder is **pure monthly subscription**. If hybrid mechanics get reopened, write a new memo, link it from this file, and re-lock.

Same for the agent-economy L2 Yulia API SKU layer (per-call `yulia.*` pricing). Out of scope for now; reopen separately.

---

## Stripe configuration

Live prices are configured via environment variables:

| Variable | Maps to |
|---|---|
| `STRIPE_PRICE_SOLO` | Solo $99 / mo |
| `STRIPE_PRICE_PRO` | Pro $249 / mo |
| `STRIPE_PRICE_TEAM` | Team $749 / mo |
| `STRIPE_PRICE_ENTERPRISE` | Enterprise $3,000+ / mo (assisted enterprise can leave this unset) |

Before any paid traffic:

- [ ] All four `STRIPE_PRICE_*` env vars set in Railway production
- [ ] `TEST_MODE=false`
- [ ] One end-to-end paid path smoke (signup → first deliverable → paywall → Stripe checkout → webhook → entitlement granted → second deliverable served)
- [ ] Stripe webhook signing secret rotated and confirmed

---

## THE LINE — pricing firewall

All pricing must continue to respect [THE_LINE_POLICY.md](THE_LINE_POLICY.md):

- No percentage of deal value.
- No success, closing, deferred, or contingent fees.
- No equity, warrants, or deal-linked consideration.
- No referral fees from buyers, sellers, lenders, brokers, or service providers.
- No tier or price that varies with deal size, deal value, or deal outcome.
- Included plan credits are software budget controls, not a wallet.

If a future pricing change touches any of the above, it is a drift trigger. Route to counsel before shipping.

---

## Where the old pricing lived (so the next reader knows what changed)

| Surface | Old value | New value |
|---|---|---|
| `server/services/subscriptionService.ts` PLANS | $79 / $199 / $499 / $2,500 | $99 / $249 / $749 / $3,000 |
| `SMBX_PRICING_STRATEGY_AND_RECOMMENDATION.md` | $79 / $199 / $499 / $2,500 (with reasoning) | Reasoning kept as historical record; banner points here |
| `methodology/METHODOLOGY_V19.md` § pricing tables | $79 / $199 / $499 / $2,500 | $99 / $249 / $749 / $3,000 |
| `CLAUDE.md` Critical Rules | $99 / $249 / $749 / $3,000+ (already correct) | unchanged |

The reasoning history in `SMBX_PRICING_STRATEGY_AND_RECOMMENDATION.md` is still worth reading — the section on why $79 "reads honest" and $99 "reads rounded-up-to-look-premium" is a real argument and may matter again. It just isn't load-bearing for today's lock.

---

## Change procedure

To change any price, seat count, or tier shape:

1. Write a one-page memo: what's changing, why, what data triggered the change, what THE LINE check passed.
2. Update this file first. This file is the source of truth.
3. Update `server/services/subscriptionService.ts` PLANS constant.
4. Update `STRIPE_PRICE_*` env vars in Railway.
5. Update marketing/pricing UI copy in `client/src/components/v6/` and `client/src/pages/public/`.
6. Ship and verify with one full paid-path smoke.

Skipping step 2 — updating code first — is what produced the May 2026 three-way pricing drift. Don't.
