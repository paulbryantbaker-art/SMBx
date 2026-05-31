# smbX Pricing — LOCKED

**Status:** Canonical pricing record. This file is the source of truth for what smbX charges.
**Locked:** 2026-05-27.
**Last reviewed:** 2026-05-27.
**Supersedes:** all earlier pricing tables in `SMBX_PRICING_STRATEGY_AND_RECOMMENDATION.md`, `methodology/METHODOLOGY_V19.md`, and any prior `subscriptionService.ts` constants.

If any other document, marketing page, or code constant disagrees with this file, this file wins. Open a change request before changing prices in code — do not let docs and code drift again.

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
