# smbX.ai — Pricing Strategy & Recommendation

**Status:** Canonical pricing document. Supersedes all prior pricing decisions.
**Date:** April 2026.
**Paired with:** `SMBX_STRATEGIC_POSITIONING_AND_AUDIENCE_DOC.md`, `SMBX_FEATURE_AUDIENCE_VALUE_MATRIX.md`
**Purpose:** Resolve pricing. One recommendation, defensible against the research, structurally stable, launch-ready.

**How to read this:** Part 1 is the recommendation. Part 2 is why — the research-grounded reasoning. Part 3 is the operational implementation (page layout, packaging rules, upgrade triggers, edge cases). Part 4 is what changes if early signals tell us we're wrong, and how to respond without re-pricing from scratch.

---

# PART 1 — THE RECOMMENDATION

## The ladder

| Tier | Price | Who it's for | Seats | What's in it |
|---|---|---|---|---|
| **Free** | $0 | Anyone who wants to meet Yulia | 1 | Unlimited chat. One deliverable, ever. Email required. |
| **Solo** | $79/mo | Self-funded searchers, principal sellers and buyers, first-time acquirers, sole-operator brokers | 1 | Everything. One active deal at a time. |
| **Pro** | $199/mo | Practitioners running multiple deals — independent sponsors, search funders, LMM advisors, solo bankers | 1 | Everything. Unlimited active deals. |
| **Team** | $499/mo | Boutique firms, small corp dev teams, small family office direct-investing shops | Up to 5 | Everything in Pro + team workspace, shared deal vault, collaboration |
| **Enterprise** | Custom, starts at $2,500/mo | Corp dev at serial acquirers, mid-market PE, multi-family offices, large advisory boutiques | 6+ | Everything in Team + SSO, single-tenant option, audit trails, custom onboarding, SLA |

**All tiers include all hero capabilities** — add-back / QoE Lite analysis, regulatory & structure modeling, deal screening, CIM drafting, LOI drafting, investor memos, due diligence coordination. No hero feature is ever gated behind a higher tier. The ladder scales on deal volume, seat count, and enterprise infrastructure — never on core Yulia capability.

**No annual pricing at launch.** Introduce annual in month 3–6 at ~16% discount (pay for 10, get 12). No annual until the product is proven to retain.

**No per-deal fees, no success fees, no take-rate, ever.** Canonical, non-negotiable, documented in THE LINE.

**Post-close subscription continues at same tier.** Searchers who become CEOs, IS who become board members, principals who become operators — they all keep the subscription at whatever tier they're on. PMI workflows, investor updates, and portfolio ops are part of the platform. This is the retention mechanism.

**One-time credit pack, optional add-on:** $99 for "deliverable pack" — available to anyone who wants a second deliverable without committing to Solo. Intended as a soft conversion step from Free for price-sensitive principals. Cap at three packs per email before forced upgrade.

## The three-sentence summary

> *smbX prices against the cost of building it yourself, not the cost of not having it.*
>
> *Every tier delivers every hero capability. You pay for volume, seats, and enterprise infrastructure — never for the work Yulia does.*
>
> *$79 for solo operators, $199 for practitioners, $499 for boutique teams, custom for enterprise. One deliverable free forever. No success fees, ever.*

## What moved and why

| Current | Recommended | Why |
|---|---|---|
| Free / $49 / $149 / $999 | Free / $79 / $199 / $499 / $2,500+ | Added intermediate Team tier; raised Solo above consumer-grade threshold; raised Pro to better match practitioner identity; uncapped Enterprise floor |
| No team tier | $499 Team (5 seats) | Captures boutique/corp-dev WTP cluster the matrix exposed |
| $999 Enterprise as "unlimited users" | Team at $499 for 5 / Enterprise custom from $2,500 | Unlimited users at $999 undershoots real enterprise WTP by 10–40x |
| Hero features gated by tier | No hero feature gating | Matrix shows hero capabilities drive signup; gating them kills conversion |
| No annual | Annual introduced month 3–6 | Avoid locking in early churn; get retention data first |
| Deal-specific pricing | Deal volume as tier differentiator | Clean, no carveouts, scales naturally |

---

# PART 2 — WHY (research-grounded reasoning)

## The five pricing constraints, resolved

### Constraint 1: The ChatGPT-plus-harness baseline

A resourceful practitioner with ChatGPT Plus ($20/mo) and a weekend can replicate *any single* smbX capability. The matrix quantifies this: build-it-yourself difficulty is 4–5 on every hero cell. The catch: they can do any *one* capability. They can't do twelve.

Translation to pricing: every smbX tier must cost less than the practitioner's own time to build the harness themselves. The engineering labor cost of replicating one hero workflow is roughly $5–15K in practitioner hours. Multiply by twelve capabilities = $60–180K. That is the real anchor, not Rogo's $3,300 or Harvey's $24K.

At $79, $199, $499, even $2,500/mo, smbX is priced at 1–5% of the alternative self-build cost. That's structurally stable. It survives a procurement review.

### Constraint 2: SaaS consolidation / "SaaSpocalypse"

Cledara's 2025 Software Spend Report: companies with 100–200 staff waste 34% of their software budget; 200+ staff waste 48%. Every new tool is now a defend-your-line-item meeting. 58% of companies plan to *increase* software spend in 2026, but most of that goes to AI tools that replace three existing tools, not additive stacks.

This is why smbX must be positioned as a *consolidator*, not an addition. Pro at $199 replaces:
- A CRM line item ($14–100/mo for Pipedrive/HubSpot/Salesforce)
- A sourcing tool line item ($500–1,700/mo for Grata/Sourcescrub if they have it)
- A VDR line item ($300–1,000/mo for Firmex/SecureDocs)
- Freelance CIM drafting ($3–16K per deliverable)
- Freelance QoE Lite ($5–15K per deliverable)
- Freelance analyst hours ($3–15K/mo fractional)

A practitioner can defend a $199 line item that replaces four other line items. They cannot defend a $199 line item that adds to the existing stack. All marketing and all sales conversations should center the consolidation story.

### Constraint 3: Advisors are customers, not competitors

Non-negotiable per strategic doc. This means:
- No pricing against advisory fee percentages
- No pricing tier named "Advisor" or "Broker" that implies a different product
- The boutique banker and the IS use the *same* tier at the same price

The answer is team-size-based pricing. A solo banker buys Pro ($199). A 3-person boutique buys Team ($499). A 15-person boutique buys Enterprise (custom). All get the same product, different configuration.

### Constraint 4: Full deal-size spectrum

The architecture serves $500K SDE through $1B EBITDA. Pricing cannot ladder against deal size — it would cap market expansion and create bad incentives (users underreporting deal size to stay in a cheaper tier).

Ladder on **who the user is** (solo vs. practitioner vs. team vs. enterprise), not on **what the deal is** (small vs. large). This is why Solo / Pro / Team / Enterprise naming works and why "Starter / Professional / Business" naming doesn't — the user identifies as a solo operator or a practitioner, not as a "professional plan buyer."

### Constraint 5: Regulatory posture (THE LINE)

Any pricing mechanism tied to deal outcomes — success fees, take-rates, rev-share, deal-close fees — triggers broker-dealer regulation. Pure subscription is the only structure that preserves the safe harbor. Non-negotiable.

This also rules out "pay more when you close" tiering, "platform fees on closed deals," and any revenue-contingent pricing. Subscription. Full stop.

## Why the new ladder works

### Why $79 Solo (up from $49)

The matrix scored principal sellers, principal buyers, and self-funded searchers at a WTP band of 2–3 (translated: $10–150/month). $49 is comfortably inside that band — but so is $79.

Two reasons to raise it to $79:

**Perception.** $49 reads consumer-grade. A self-funded searcher who budgets $100K+ for a two-year search will look at $49 and assume it's a toy. $79 reads "purpose-built tool." This is the Starbucks rule: $4.95 coffee reads cheap; $5.25 coffee reads premium. The difference is psychological, not economic.

**Searchfunder anchor.** Searchfunder.com charges $79/year — literally one month of smbX Solo — to access a community that searchers routinely complain isn't worth it. Pricing Solo at $79/*month* puts smbX at the "obvious substitute if it delivers a single useful deliverable per month" price point. Jim Stein Sharpe's searcher survey shows median CRM/outreach tool spend of $1,220/year (about $102/month). $79 lands just under that median — below the threshold where practitioners stop to think.

Why not $99? Because $99 signals "we rounded up to look premium." $79 signals "we priced it honestly." For price-sensitive buyers, honesty converts better than premium signaling.

### Why $199 Pro (up from $149)

This is the tier that matters most for revenue. It's where practitioners (IS, search funders, LMM advisors, boutique bankers) live.

The matrix scored these audiences at WTP 3–4 (translated: $50–500/month). $149 sits near the floor of that band. $199 sits mid-band.

**The strongest argument for $199:** on a $300K LMM advisor transaction fee, $199/month across 12 months is $2,388/year — 0.8% of a single deal's fee. The tool pays for itself on a single saved-hour of pitch prep. There is zero economic tension at $199 for this audience.

**The strongest argument against going higher ($249 or $299):** the upside from raising Pro is linear (~10–25% more ARPU); the downside is nonlinear (a segment of IS and search funders drops out). At $199, smbX is still the cheapest serious M&A tool in the category by 10x. The upside from preserving signup velocity outweighs the ARPU gain.

**Why not stay at $149?** Because the $150 threshold is a psychological cliff — under $150 reads consumer SaaS (Spotify Family is $19.99; Notion Business is $20; Framer Pro is $30), over $150 reads professional tool. $199 makes the tier feel like it belongs to the practitioner identity. The $50 delta annualized is $600/year — negligible for a practitioner, material for smbX unit economics.

### Why $499 Team (new tier)

This is the tier the prior pricing was missing. The matrix exposed a WTP cluster at 3.5–4 (translated: $200–500/month) for boutique firms, small corp dev teams, and multi-person family offices. The prior $149 → $999 jump (6.7x) forced these buyers to either underpay at Pro (and expose themselves on seats) or overpay at Enterprise (and get features they don't need).

**Why $499 specifically:**
- 2.5x Pro, cleanly inside the SaaS benchmark mid-to-premium gap (2.4–3.2x)
- 5x Solo, also clean
- 5 seats at $499 = $99.80/seat/month — below Pro per-seat, which is the right incentive (scale economies, not tax for growing)
- A 3-person LMM advisory doing $1.5M/yr in fees spends $5,988/yr on smbX Team — 0.4% of revenue. Trivial defensibility.
- A 4-person corp dev team at a serial acquirer with a $50K+ tool budget closes this tier in one meeting.

**Why 5 seats, not 3 or 10:**
- 5 is the median size of a boutique M&A advisory firm per Axial data on LMM firms
- 5 captures the typical independent sponsor + operating partner + analyst team
- 5 is where a small family office direct-investing setup sits
- 10 seats would be too generous and would cannibalize Enterprise
- 3 seats would exclude most target teams

### Why Enterprise custom from $2,500

The prior $999 "Enterprise = unlimited users" pricing was the single biggest leak in the ladder. Corp dev benchmarks show tool budgets of $40–120K/yr for 5–15 person teams and $120K+/yr for 15+ person teams. DealCloud averages $505K/yr/firm. Datasite averages $68K/yr. Grata and Sourcescrub are $20–60K/yr. smbX at $999/yr (to use the "month × 12" framing) was leaving 10–40x WTP on the table.

**The $2,500/month floor:**
- $30K/yr — cleanly inside the sub-$50K band corp dev teams don't blink at
- 5x Team, slightly wide of benchmark (benchmark 3.7–5.8x premium-to-enterprise, this is at low end)
- Custom above this floor lets the specific configuration (single-tenant, SSO, SOC 2 Type II, audit trails, SLA, onboarding) drive real upside for the right accounts
- Priced low enough that Enterprise is a reasonable upgrade path from Team, not a cliff

**What Enterprise includes beyond Team:**
- 6+ seats (typical range 6–50; above that, custom pricing on volume)
- SSO integration (Okta, Google Workspace, Azure AD)
- Single-tenant deployment option (matters for family offices and PE)
- SOC 2 Type II audit trails (SOC 2 certification itself is a separate product-level investment, but audit trail surface is the feature)
- Custom onboarding (not a long implementation — a 2-4 hour session with the team)
- Named account manager
- SLA (99.9% uptime, defined support response times)
- API access for enterprise workflow integration
- Compliance review workflow for regulated entities

**What Enterprise does not include:**
- Custom feature development (not a services firm)
- White-label / reseller rights (strategic partnership conversation, priced separately)
- Anything that would require smbX to hold customer data under BD regulation (regulatory guardrail)

## Why Free stays (and why it matters more than it seems)

The Free tier is currently: unlimited chat + one deliverable ever, email required, no credit card.

This tier is strategically critical for two reasons:

**Conversion mechanics.** SaaS benchmarks: freemium self-serve converts 3–5%, exceptional performers 6–8%. AI tools specifically hit 15–20% per ProfitWell. smbX's structure — unlimited chat but capped at one deliverable — is freemium with a hard usage wall. This should convert higher than pure freemium because the "aha moment" is contained inside the free experience. Target: 8–15% at launch.

**Proof-point generation.** Every Free user who receives a genuinely useful deliverable is a potential LinkedIn post, case study, testimonial, referral. In the first 6 months before we have logos, the Free tier is the marketing engine.

Calibration check: if free-to-paid conversion is below 5% after 60 days of meaningful volume, the deliverable cap is too generous and we tighten it to "chat only, deliverables require Solo." If above 20%, the cap is too stingy and we relax it to "two deliverables free."

## Why the $99 credit pack

This is the only genuinely novel element in the ladder and it exists for one narrow but important use case: the principal seller or first-time buyer who received their first deliverable, values it, but isn't ready to subscribe.

Current behavior: they bounce. Revenue lost.

With the credit pack: they pay $99 for one more deliverable. We capture 50% of Solo's first-month value, de-risk their commitment, and give them a second touchpoint where they either convert to Solo (because they need more) or don't (because one more was enough).

Capped at three packs per email to prevent permanent free-riding. Not offered to logged-in paid users (they're already paying). Not advertised prominently — shown as a fallback when a Free user hits the paywall and doesn't want to commit.

This is the "try another coffee for $4" strategy. Low-risk second touch. Surprisingly high conversion.

## Where Annual fits

Not at launch. Here's why:

- We don't yet know the churn rate. Selling annual before knowing retention is how SaaS companies accidentally refund their first 6 months of revenue.
- Locked contracts feel heavy to price-sensitive practitioners. Free + month-to-month signals confidence.
- The research (First Page Sage 2026) shows annual pricing primarily wins on LTV, not signup conversion. Signup velocity matters more in the first 6 months.

**When to introduce:** once we have 3+ months of cohort retention data showing steady-state monthly churn <8%. At that point, introduce annual at 16% discount (pay for 10 months, get 12). This is the SaaS-standard annual discount that correlates with the strongest LTV uplift per ProfitWell data. Don't go to 20–25% discount — that signals desperation and prices in a churn risk that isn't there.

---

# PART 3 — OPERATIONAL IMPLEMENTATION

## Pricing page design

Per Dollarpocket analysis of 500+ SaaS pricing pages: **comparison-table layouts convert 28% better than card-based**. Use comparison table. Per benchmark: **3–4 tier pricing pages convert 23% better than 2 or 5+**. We have 4 visible tiers (Free, Solo, Pro, Team, Enterprise) — that's 5. But "Enterprise" as "Talk to us" doesn't count as a comparable tier for UI purposes, so effective comparison is 4 (Free, Solo, Pro, Team). Clean.

### Page structure

**Hero section:**
- Headline: *"Pricing that treats the tool as infrastructure, not a luxury."*
- Subhead: *"Every tier includes every capability. You pay for volume, seats, and enterprise features. Not for Yulia's work."*
- No price on screen yet. Trust before price.

**Tier comparison table (below hero):**

| | Free | Solo | Pro | Team | Enterprise |
|---|---|---|---|---|---|
| **Price** | $0 | $79/mo | $199/mo | $499/mo | From $2,500/mo |
| **Who** | Anyone | Solo operators | Practitioners | Small teams | Firms & enterprises |
| **Seats** | 1 | 1 | 1 | Up to 5 | 6+ |
| **Active deals** | 1 | 1 | Unlimited | Unlimited | Unlimited |
| **Deliverables** | 1 (ever) | Unlimited | Unlimited | Unlimited | Unlimited |
| **Add-back / QoE Lite analysis** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Regulatory & structure modeling** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Deal screening & triage** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **CIM / teaser drafting** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **LOI & term sheet drafting** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Due diligence coordination** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Investor memos & updates** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Deal pipeline & CRM** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Buyer list building** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Market & comp research** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Post-close / PMI workflows** | | ✓ | ✓ | ✓ | ✓ |
| **Team workspace** | | | | ✓ | ✓ |
| **Shared deal vault** | | | | ✓ | ✓ |
| **SSO (Okta, Google, Azure)** | | | | | ✓ |
| **Single-tenant deployment** | | | | | ✓ |
| **Audit trails** | | | | | ✓ |
| **SOC 2 Type II compliance** | | | | | ✓ |
| **Named account manager** | | | | | ✓ |
| **SLA (99.9% uptime)** | | | | | ✓ |
| **API access** | | | | | ✓ |

**Below the table:**
- Social proof (once we have it): logos, practitioner quotes, deliverable-count claim
- FAQ (next section)
- CTA: "Start with Free" (primary) / "Talk to sales" (secondary, for Enterprise)

## FAQ content (on pricing page)

**Q: What does the Free tier actually include?**
A: Unlimited chat with Yulia and one deliverable — ever — with email registration. No credit card. If you want to run a second deliverable, you either upgrade to Solo ($79/mo) or buy a $99 credit pack. No time limit on Free; the deliverable cap is total, not monthly.

**Q: What's a "deliverable"?**
A: Any finished document Yulia produces — an add-back analysis, a CIM draft, a screening memo, an LOI, a deal summary. One deliverable = one rendered, downloadable, or shareable artifact.

**Q: Why no success fees or deal-close fees?**
A: Two reasons. First, smbX does not hold the licenses required to charge success fees — we sit on the software side of the broker-dealer line under SEC Rule 15(b)(13). Second, success fees would fundamentally change what smbX is: a tool becomes a broker, and we're not that. Subscription only. Forever.

**Q: Why is Pro $199 but Team $499?**
A: Pro is for one practitioner working alone — an independent sponsor, a solo banker, a searcher. Team is for a 2–5 person firm where Yulia becomes the shared team resource. The difference isn't features; it's seats, team workspace, and shared deal vault.

**Q: What if I need 6 seats?**
A: That's Enterprise. We'll custom-price it based on seat count, infrastructure needs, and whether you need SSO, single-tenant deployment, SOC 2 audit trails, etc. Enterprise starts at $2,500/month.

**Q: Can I try Pro or Team for free?**
A: Yes — every paid tier has a 14-day full-feature trial. Credit card required to activate. Cancel anytime inside the 14 days and you're not charged. (Note: opt-out trials convert at 48.8% per First Page Sage vs. 18.2% for opt-in; we use opt-out.)

**Q: What happens after I close a deal?**
A: Your subscription continues at your current tier. You get 180 days of post-close PMI and portfolio ops support. Many users stay on permanently — Yulia becomes the ongoing chief-of-staff for the business they bought.

**Q: Do you offer a discount for multi-year commitment?**
A: Not at launch. We introduce annual pricing (16% discount) after we've earned it with retention data. Month-to-month, cancel anytime.

**Q: What about advisors and brokers? Do you have a special tier?**
A: Advisors and brokers are customers, not competitors. A solo broker uses Solo or Pro. A boutique advisory uses Team. A large middle-market advisory uses Enterprise. Same product, different configuration. No separate pricing.

## Upgrade trigger design

An upgrade trigger is the moment a user bumps against a tier limit and decides to pay more. Getting triggers right determines whether users upgrade or churn.

**Free → Solo ($79) trigger:** "This is your one free deliverable. Want another? Start Solo for $79/mo."
- Appears AFTER the first deliverable is delivered, not before
- Credit pack ($99) offered as secondary option
- Never blocks chat — Yulia continues to converse; only the deliverable is capped

**Solo ($79) → Pro ($199) trigger:** "You've got a deal in progress. Want to run a second in parallel? Upgrade to Pro."
- Appears when the user tries to start a second concurrent deal
- Soft trigger — user can finish current deal, then start a new one, without upgrading. Hard trigger only when they want parallel deals.

**Pro ($199) → Team ($499) trigger:** "Inviting a colleague? Add seats with Team."
- Appears when a Pro user tries to invite a second user
- Explicit about the benefit: "Share deals, collaborate on documents, see each other's work."
- Never auto-adds; always requires explicit upgrade.

**Team ($499) → Enterprise trigger:** "You've added 5 seats. Adding more? Let's talk."
- Appears when a Team admin tries to add a 6th seat
- Routes to calendar booking, not auto-purchase

Every upgrade trigger is permission-based, not coercive. No dark patterns. Users always see: "You can stay on [current tier]; here's what changes if you upgrade."

## Packaging rules (non-negotiable)

1. **Hero capabilities (add-back, regulatory, screening, CIM, LOI, memos, diligence coord) are in every paid tier.** Never gated. Violating this rule kills signup.

2. **Post-close / PMI is in every paid tier, not Free.** This is the retention feature — it must be part of what paying users get.

3. **Deal count is the Free/Solo vs. Pro differentiator.** Not feature availability.

4. **Seat count is the Pro vs. Team vs. Enterprise differentiator.** Not feature availability.

5. **Enterprise infrastructure (SSO, single-tenant, audit, SLA, API, account management) is the Team vs. Enterprise differentiator.** Not hero capability.

6. **No tier includes success fees, deal-close fees, rev-share, or take-rate.** Ever.

7. **No tier requires a minimum commitment beyond one month.** Cancel anytime, every tier.

8. **All prices in USD.** International expansion priced in USD at launch; localized currency only after material non-US volume.

## Edge cases and one-off pricing

**Referral credits.** Each paid user who refers a user who converts to Solo or Pro gets one month free of their current tier. Capped at 6 months of referral credit per user. Simple, defensible, stops short of multi-level structures that complicate revenue recognition.

**Student / academic pricing.** Stanford, Harvard, Wharton, IESE, Columbia, Booth, MIT Sloan, and similar M&A/ETA programs can apply for 50% off Pro for the duration of enrollment. Cheap marketing into future practitioners. Verify via .edu email; manually approve.

**Non-profit pricing.** None. smbX isn't a non-profit-use platform.

**Team overages.** If a Team subscriber exceeds 5 active seats, the 6th seat triggers a conversation with Enterprise, not an auto-charge. Never auto-upgrade a team to a higher tier price.

**Concurrent deal overages for Solo.** If a Solo user tries to start a second parallel deal, they see the Pro upgrade prompt. The existing deal is never locked or deleted.

**Deliverable quality dispute.** If a user believes Yulia produced a deliverable that was substantially wrong, they can flag it. If upheld, we credit that deliverable (Free users get their 1-deliverable restored; paid users get a month of credit). Capped to avoid abuse. Build the flagging surface in month 2.

**Pause subscription.** Users can pause for up to 90 days once per year. Pausing preserves their deal history and workspace. After 90 days, auto-resumes or auto-cancels based on user preference. This is churn prevention for practitioners between deals.

**Multiple smbX accounts.** One person, one account. No "family plan." An independent sponsor and their spouse who runs a search cannot share Solo. This is a principal who-pays question, not a usage-limit question.

## Launch pricing copy

**Homepage CTA (practitioner-inbound):**
> *"The analyst, associate, and VP you couldn't afford to hire. $199/month."*

**Homepage CTA (principal-inbound):**
> *"Yulia runs your deal. You make the decisions. From $79/month."*

**Pricing page headline:**
> *"Priced against the cost of building it yourself."*

**Pricing page subhead:**
> *"Not against the cost of not having it. That's how everyone else prices. We don't."*

---

# PART 4 — WHAT CHANGES IF THIS IS WRONG

A pricing recommendation that can't be wrong is a recommendation that isn't anchored to reality. Here's what to watch for and how to adjust without re-pricing from scratch.

## The four signals that would force a change

### Signal 1: Free-to-paid conversion < 5% after 90 days at meaningful volume

**What it means:** The Free tier is either (a) too generous (users get value without needing to pay) or (b) activating the wrong users (traffic isn't the target audience).

**What we do:**
- First, check activation: are Free users actually receiving a deliverable? If <50% complete one deliverable, the product experience is broken, not the price.
- If activation is fine but conversion is low: tighten Free to "chat only, deliverables require Solo."
- Do not raise Solo price in response to low Free conversion. That compounds the problem.

### Signal 2: Solo-to-Pro upgrade rate < 10% after 60 days at meaningful Solo volume

**What it means:** Solo is "good enough" and users have no reason to upgrade.

**What we do:**
- Check: are Solo users actually running to the 1-deal limit? If <30% hit the limit within 60 days, the limit is the wrong trigger.
- If users hit the limit but don't upgrade: the Pro price is perceived as too high relative to Solo. Reduce Pro to $179 and test.
- Alternative: add a deal count middle step — "Solo+ at $119 for 3 concurrent deals" — as a bridge. Only if the primary fix doesn't work.

### Signal 3: Team tier adoption is minimal (< 5% of paid accounts) after 6 months

**What it means:** Either (a) boutique firms and small corp dev teams aren't finding us, or (b) they're coming and routing into Pro (underpaying) or Enterprise (overpaying).

**What we do:**
- Check distribution: are multi-seat Pro accounts happening? If yes, our tier is misaligned — Pro shouldn't allow multi-seat workarounds. Enforce seat limits strictly.
- Check Enterprise funnel: are small teams hitting the Enterprise conversation but dropping? If yes, Enterprise floor is too high. Lower to $1,500/month starting price.
- If neither: Team tier is priced correctly but marketing isn't reaching the audience. Fix the marketing, not the price.

### Signal 4: Enterprise deals are closing but at prices below $30K/year

**What it means:** Our Enterprise floor is too high for the actual buyer appetite; we're discounting.

**What we do:**
- Track: what does the median closed Enterprise deal actually price at? If it's $18–25K/yr, the floor should be $1,500/month, not $2,500.
- Reset the floor to the median observed.
- This is *not* a failure — it's price discovery. Enterprise pricing is always custom; the public floor is a conversation opener, not a contract.

## The two signals that would NOT force a change

### Signal A: Individual practitioners complain Pro is too expensive

Ignore. If an IS complains about $199/month — a subscription that's 0.8% of a single deal fee — the problem is conversion copy, not price. Fix the value prop.

### Signal B: A competitor launches at a lower price point

Ignore. Unless that competitor has demonstrably better distribution and a demonstrably better product. In the matrix-defined positioning, smbX's moat is not price — it's the harness + regulatory posture + cross-side platform. A cheaper Rogo-alike doesn't threaten smbX. A cheaper ChatGPT-plus-prompts doesn't threaten smbX. Stay the course.

## The pricing review cadence

- **Month 1:** Watch Free signup and activation. Don't change anything.
- **Month 2:** Watch Solo-to-Pro upgrade. Don't change anything.
- **Month 3:** First pricing review. Apply Signal 1 & 2 logic. Introduce Annual if retention supports.
- **Month 6:** Major review. Apply all four signals. Adjust tier mix if needed.
- **Month 12:** Full re-evaluation, including whether the ladder shape is still correct (e.g., is the Team tier the right structure or does it want to split).

Until Month 3, resist the urge to tune. Pricing needs data, not sentiment.

---

# PART 5 — THE THREE THINGS THAT WOULD BE A MISTAKE

These are the pricing mistakes that would specifically undercut what this ladder is designed to do:

**Mistake 1: Putting a hero capability behind a higher tier.**
"Add-back analysis requires Pro" would gain $50 in revenue per Solo user while killing Solo signup conversion by half. The matrix shows add-back is the hero. Hero features are what convert users; don't gate them.

**Mistake 2: Introducing deal-size or deal-count pricing that varies with the business being analyzed.**
"Deals over $10M EV cost $99 extra" is where broker-dealer territory starts. Any pricing that scales with the underlying deal violates the safe harbor. The software costs what the software costs, regardless of whether Yulia is analyzing a $500K SDE auto shop or a $400M EBITDA roll-up platform.

**Mistake 3: Compensating for slow adoption by lowering prices.**
If Solo doesn't convert, the problem is never "it's $79; would be $49 be better." The problem is the messaging, the onboarding, the first-deliverable experience, or the audience targeting. Lowering price to chase volume creates a permanent value impression that's hard to reverse. Raise prices with confidence; never lower them with desperation.

---

# Summary — the one-page version

**Ladder:**
| Free | Solo $79 | Pro $199 | Team $499 (5 seats) | Enterprise custom from $2,500 |

**Every tier delivers every hero capability.** Differentiate on deal volume, seats, enterprise infrastructure. Never on core Yulia capability.

**No annual at launch.** Introduce month 3–6 at 16% discount once retention proven.

**No success fees, ever.** Subscription-only. Regulatory guardrail.

**Post-close subscription continues.** 180 days PMI included in all paid tiers. Many users stay permanently.

**One-time $99 credit pack** available for second-deliverable purchase without Solo commitment.

**14-day opt-out trial** on all paid tiers.

**What changed from prior pricing:**
- Solo $49 → $79 (perception)
- Pro $149 → $199 (practitioner identity)
- Team tier added at $499 (captures missing WTP cluster)
- Enterprise $999 → custom from $2,500 (stops leaking real enterprise WTP)
- Annual deferred to month 3–6
- Credit pack introduced

**The one-sentence positioning that makes the ladder defensible:**
*"We're priced against the cost of you building the harness yourself, not against the cost of you not having the work done."*

That's the story. That's what goes on the pricing page. That's what survives a SaaSpocalypse line-item review. That's what wins.

---

*End of document. This supersedes all prior pricing decisions. Pricing is now settled. Go build.*
