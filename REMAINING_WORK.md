# Remaining Work — smbX.ai

## FIXED
- ~~Notification schema mismatch~~ — Fixed in `274d26d`

---

## Part 1: THE DELTA — Concrete Changes to What's Already Built

These are specific, scoped changes to existing sessions. Organized by delta, with exact files, schema, and logic.

### DELTA 1: Exit Type as a First-Class Field
**Affects:** Session 3 (DB schema), Session 4 (journey detection), Session 5 (VRR)

**What's built:** `journey = 'sell'` is a single bucket. All sellers go through the same S0 path.

**What needs to change:**

#### DB Migration
```sql
-- Exit type on all relevant tables
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS exit_type TEXT;
-- values: 'full_exit' | 'partner_buyout' | 'capital_raise' | 'esop' | 'majority_sale' | 'structured' | null

ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS exit_type TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS exit_type TEXT;
```

#### Session 4 — Haiku Classification Call
Update the return JSON to include exit_type:
```typescript
// OLD
{ "journey": "SELL|BUY|RAISE|PMI|UNKNOWN", "extracted": {...} }

// NEW
{
  "journey": "SELL|BUY|RAISE|PMI|UNKNOWN",
  "exit_type": "full_exit|partner_buyout|capital_raise|esop|majority_sale|structured|unknown",
  "extracted": {...}
}
```
When exit_type is detected, update `conversation.exit_type` and `company_profiles.exit_type`.

#### Session 4 — S0 Gate Prompt Addition
In `server/prompts/gatePrompts.ts`, add to the S0 prompt after initial business basics, before financials:

> "Before we dig in — what does your ideal outcome look like? Are you looking to walk away completely, stay involved in some capacity, bring in a partner or investor, or something else?"

Map their answer:
- "walk away / sell it all / retire" → `full_exit`
- "buy out my partner / partner wants out" → `partner_buyout`
- "raise money / bring in investors / growth capital" → `capital_raise`
- "sell to my employees / ESOP" → `esop`
- "sell majority but stay involved / keep some equity" → `majority_sale`
- "not sure / complicated / partial" → `structured`

Store exit_type on the conversation and company_profile.

#### Session 5 — VRR Exit Path Section
Add this section to the VRR template AFTER the preliminary value range:

```markdown
### Your Exit Path

Based on your goals, here's what your transaction looks like:

**Exit type:** {exit_type_label}
**Likely buyer universe:** {buyer_universe}
**Typical deal structure:** {deal_structure}
**Realistic timeline:** {timeline}

**What buyers in this category pay:**
{buyer_type_pricing_context}

**What they'll scrutinize most:**
{due_diligence_focus}

**One negotiation reality for this exit type:**
{negotiation_insight}
```

Populate dynamically per exit_type:

**full_exit:**
- buyer_universe: "Individual buyers (SBA-financed), search fund operators, PE add-on acquirers, strategic acquirers — depending on your deal size"
- typical_structure: "Asset sale (most common for SMBs) or stock sale. Seller note of 10-15% is common."
- timeline: "6-12 months to close from the time you go to market"
- buyer_type_pricing: "Individual/SBA buyers: 2.5-3.5x SDE. PE add-on: 4-6x EBITDA. Strategic: 5-10x EBITDA if synergies exist."
- dd_focus: "Owner dependency, customer concentration, revenue quality, transferability of key relationships"
- negotiation_insight: "Price is only half the negotiation. Terms — seller note amount, transition period, non-compete scope — often matter as much as the headline number."

**capital_raise:**
- buyer_universe: "Growth equity funds, family offices, PE firms taking minority positions, angel syndicates for smaller raises"
- typical_structure: "Preferred equity or convertible notes. Board seat common above $2M raise. Pro-rata rights, information rights standard."
- timeline: "4-8 months from first pitch to close"
- buyer_type_pricing: "Valuation driven by revenue multiple (SaaS: 3-6x ARR; services: 1-2x revenue; product: 2-4x revenue) adjusted for growth rate"
- dd_focus: "Growth trajectory, unit economics, management team depth, market size, path to profitability"
- negotiation_insight: "Valuation is less important than liquidation preferences and control provisions. A high valuation with a 2x participating preferred can net you less than a lower valuation with clean terms."

**esop:**
- buyer_universe: "ESOP trustee (represents the employees). Transaction financed via SBA ESOP loan or seller financing."
- typical_structure: "Company borrows to buy shares. Seller receives cash + possible seller note. Owner often stays 1-3 years post-close."
- timeline: "12-18 months minimum due to ESOP formation and IRS qualification requirements"
- buyer_type_pricing: "Fair market value determined by independent appraiser — typically in line with strategic sale value"
- dd_focus: "Company's ability to service ESOP loan from cash flow. Employee census. Qualified plan compliance."
- negotiation_insight: "The 'buyer' is a trustee with a fiduciary duty to employees — they cannot overpay. Price is non-negotiable in the traditional sense. Structure and financing terms are where deals get done."

**partner_buyout:**
- buyer_universe: "Your existing partner(s) or key employees"
- typical_structure: "Installment sale (seller-financed) or SBA 7(a) loan taken by buying partner. Buy-sell agreement terms usually govern."
- timeline: "3-6 months if buy-sell agreement exists; 6-12 months if not"
- buyer_type_pricing: "Governed by existing buy-sell agreement formula, or negotiated independently. Appraisal often required."
- dd_focus: "Existing partnership agreement terms, any right of first refusal provisions, tax implications of buyout structure"
- negotiation_insight: "This is a relationship negotiation first, financial negotiation second. Preserving the working relationship (especially if you're staying on) matters more than squeezing the last dollar."

**majority_sale:**
- buyer_universe: "PE platform companies, search fund operators, family offices who want an operating partner"
- typical_structure: "Seller rolls 20-40% equity into the new entity. Cash at close + equity upside in the 'second bite.'"
- timeline: "9-18 months"
- buyer_type_pricing: "Initial close: 4-6x EBITDA. Second bite (PE exit in 4-7 years): potential 2-3x on rolled equity"
- dd_focus: "Owner's role post-close, management team depth, EBITDA quality, add-on acquisition potential"
- negotiation_insight: "The rolled equity terms matter as much as the day-one price. What's the liquidation waterfall? What's the target hold period? A 20% roll at the right structure can double your total proceeds."

**structured:**
- buyer_universe: "Strategic acquirers, asset buyers, or hybrid structures — depends on what's being sold"
- typical_structure: "Asset sale of specific business lines, earnout components, IP licensing combined with sale, or phased acquisition"
- timeline: "Highly variable — 6-24 months depending on complexity"
- buyer_type_pricing: "Negotiated based on what's being transferred and what's retained"
- dd_focus: "Asset vs. liability allocation, IP ownership, customer contract transferability, employee assignment"
- negotiation_insight: "Define exactly what's being sold before pricing it. Ambiguity in scope is the #1 source of deal disputes in structured transactions."

---

### DELTA 2: PMI Journey (Post-Close, 180 Days)
**Affects:** Session 4 (journey detection), needs new session between 13 and 14

**What's built:** PMI is mentioned as `journeyContext = 'integrate'` in Session 2 and referenced as `PMI0` in Session 4, but there's no actual PMI gate structure, no 180-day plan, no deliverables.

**What needs to change:**

#### DB Migration
```sql
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS pmi_phase TEXT;
-- values: 'stabilize' (day 1-30) | 'understand' (day 31-90) | 'optimize' (day 91-180) | null

ALTER TABLE conversations ADD COLUMN IF NOT EXISTS pmi_close_date DATE;
```

#### Session 4 — PMI0 Gate Prompt (replace stub)
```
You are helping a buyer who just closed on an acquisition.
This is the Post-Merger Integration (PMI) phase — the 180 days after close.

Your job in PMI0 is to:
1. Understand what they acquired and when they closed
2. Assess which PMI phase they're in:
   - Day 1-30 (Stabilize): Don't change anything. Meet everyone. Listen.
   - Day 31-90 (Understand): Map actual business vs. what was represented. Find variances.
   - Day 91-180 (Optimize): Implement value creation plan. Execute quick wins.
3. Deliver the FREE PMI Kickoff Brief (see below)
4. Set up milestone check-ins at Day 30, 60, 90, 180

PMI Kickoff Brief format — deliver this when PMI0 intake is complete:

## PMI Kickoff Brief
### [Business Name] | Closed [Date] | Day [X] of 180

**Your PMI Phase:** [Stabilize / Understand / Optimize]

**The #1 Rule for Day 1-30:** Don't change anything you don't have to.
Sellers told employees you'd keep things the same. Honor that. Changes before
you've built trust create unnecessary departures and customer churn.

**Your First 10 Days:**
1. Meet every employee individually (30 min each — listen, don't pitch)
2. Meet your top 10 customers (thank them, ask about their experience)
3. Review the last 12 months of bank statements vs. P&L
4. Identify the 3 people the business cannot run without
5. Find the one thing that's working better than you expected
6. Find the one thing that's worse than represented

**What to Watch For (Variance Flags):**
- Key employee who was "not worried about the transition" gives notice
- Customer who "absolutely loves the business" doesn't re-sign
- Vendor terms that were "standard" turn out to require personal guarantee from prior owner
- Revenue that was "recurring" turns out to be renewal-dependent

**Your Next Milestone:** Day 30 check-in with Yulia
I'll ask you: What surprised you? What's better/worse than expected?
We'll update your plan based on what you've learned.

Available next steps:
- 100-Day Integration Plan ($275) — full roadmap with your specific milestones
- Key Employee Retention Plan ($150) — who's a flight risk and how to keep them
- Financial Baseline Report ($200) — actual performance vs. represented, variance analysis
```

Also add milestone check-in prompts for Day 30, 60, 90, 180 — each asks how the specific milestones from the previous phase went and updates the plan.

#### PMI Deliverables
- **PMI Kickoff Brief** (free at PMI0) — Day 1-30 playbook, stabilization checklist
- **100-Day Integration Plan** ($275) — structured roadmap with owner-specific milestones
- **Key Employee Retention Plan** ($150) — flight risk identification, retention strategies
- **Financial Baseline Report** ($200) — actual vs. represented performance, variance analysis

#### PMI Tracker
Similar to the Seller Improvement Tracker (Session 11):
- Milestone check-ins at Day 30, Day 60, Day 90, Day 180
- Each milestone: Yulia asks how it went, updates the plan
- Running value creation score: are they on track to hit the value they underwrote?

---

### DELTA 3: Negotiation Intelligence Layer
**Affects:** Sessions 4, 5, and buyer Sessions 12-13

**What's built:** Yulia knows about deal structure in prompts (from YULIA_PROMPTS_V2.md) but there's no explicit negotiation coaching wired into the gate flow. Gates S3/S4 (seller evaluating offers) and B3/B4 (buyer LOI and DD) don't exist yet.

**What needs to change:**

#### S3 Gate Prompt — Seller Evaluating IOIs
Add to `server/prompts/gatePrompts.ts`:
```
NEGOTIATION CONTEXT FOR S3:
When helping the seller evaluate IOIs, always cover:
1. Price vs. terms — an IOI at $1.2M with 0% seller note is often worth less
   than $1.1M with a 15% seller note (tax treatment, risk allocation)
2. Buyer quality signals — proof of funds, SBA pre-approval letter,
   timeline specificity. Vague IOIs = tire-kickers.
3. What's negotiable at IOI stage vs. LOI stage:
   - IOI: price range, basic structure, exclusivity intent
   - LOI: exact price, seller note terms, transition period, non-compete scope
4. Anchor reminder: never give your floor in response to an IOI.
   Counter at or above your ask with rationale.
5. BATNA signal: if multiple IOIs exist, it's acceptable to let each buyer
   know "we're in discussions with other parties" — this is true and creates urgency.
```

#### B3 Gate Prompt — Buyer Under LOI, Doing DD
```
NEGOTIATION CONTEXT FOR B3:
When helping the buyer navigate due diligence findings:
1. Findings triage: categorize everything found as:
   - Deal-killer: walk away if confirmed
   - Price-reduction lever: use to negotiate down, not walk away
   - Accepted risk: you knew this going in, price reflects it
   - Noise: irrelevant to business value
2. How to use findings as negotiation currency:
   "We found X. We're prepared to continue at $Y reduction or with seller
    note increased from 10% to 20% to reflect this risk."
3. Never dump findings all at once. Prioritize the 2-3 biggest.
   Resolving them one at a time keeps the deal moving.
4. Walk-away triggers — define these upfront with the buyer before DD starts:
   "If we find revenue is more than 20% owner-dependent, that's a walk-away."
   Having pre-defined triggers removes emotion from the decision later.
5. Re-trade etiquette: buyers who re-trade without findings lose credibility
   with sellers and brokers. Only re-trade when you have specific, documented
   findings that justify it.
```

#### Negotiation Previews in Free Deliverables (Session 5)
At end of VRR for sellers:
> "When buyers come to the table, here's what they'll push on — and how to respond."
3-4 specific tactics relevant to their exit type and deal size.

At end of Thesis Document for buyers:
> "When you find the right deal, here's what the first negotiation looks like for a deal your size."

---

### DELTA 4: Buyer "Speed to Conviction" Reframe
**Affects:** Session 12 (Buyer Pipeline), Session 13 (Discovery)

**What's built:** Pipeline shows matches with scores. Screening Memo exists. But the framing is "find opportunities" rather than "decide fast."

**What needs to change:**

#### DB Migration
```sql
ALTER TABLE discovery_targets ADD COLUMN IF NOT EXISTS conviction_check JSONB;
-- structure: { checks: [{label, pass, reason}], verdict: 'pursue'|'pass'|'investigate' }
```

#### Conviction Check Logic
After scoring runs, compute conviction_check:
```typescript
function computeConvictionCheck(
  target: DiscoveryTarget,
  profile: CompanyProfile,
  thesis: Thesis
): ConvictionCheck {
  const checks = [];

  // Industry/experience match
  const industryMatch = thesis.industries?.some(i =>
    profile.naics_code?.startsWith(i.slice(0,4))
  );
  checks.push({
    label: 'Industry matches your criteria',
    pass: industryMatch,
    reason: industryMatch ? null : 'Outside your target industries'
  });

  // SBA financeable
  if (profile.revenue_estimated_high && thesis.equity_available) {
    const estimatedDealValue = profile.sde_reported
      ? profile.sde_reported * 3
      : (profile.revenue_estimated_high * 0.15);
    const loanAmount = estimatedDealValue * 0.9;
    const annualDebtService = loanAmount * 0.13;
    const dscr = profile.sde_reported
      ? profile.sde_reported / annualDebtService
      : null;

    const sbaOk = dscr ? dscr >= 1.25 : null;
    checks.push({
      label: 'SBA financeable at estimated price',
      pass: sbaOk,
      reason: sbaOk === false ? `Est. DSCR ${dscr?.toFixed(2)} below 1.25x minimum`
             : sbaOk === null ? 'Insufficient data to estimate'
             : `Est. DSCR ${dscr?.toFixed(2)}`
    });
  }

  // Revenue diversification (unknown until DD)
  checks.push({
    label: 'Revenue appears diversified',
    pass: null,
    reason: 'Verify customer concentration in due diligence'
  });

  // Verdict
  const hardFails = checks.filter(c => c.pass === false).length;
  const verdict = hardFails >= 2 ? 'pass'
    : hardFails === 1 ? 'investigate'
    : 'pursue';

  return { checks, verdict };
}
```

#### Pipeline Card UI Update
```
[Business Name] — HVAC — Dallas, TX
  HOT  |  Thesis Fit: 87/100

  QUICK CONVICTION:
  + Industry match
  + SBA financeable (est. 1.42x DSCR)
  ? Revenue concentration — verify in DD

  -> Worth a Screening Memo

  [Get Screening Memo — $150]  [Pass]  [Save]
```

Verdict language:
- `'pursue'` → "Worth a Screening Memo"
- `'investigate'` → "One concern to resolve first"
- `'pass'` → "Likely not a fit — here's why"

#### Discovery Message Reframe (Session 13)
Current: "Found 23 potential targets. 8 strongly match your thesis."

Should be: "Found 23 potential targets. I've done a quick conviction check on each. 5 are worth a closer look — here's why. 18 I'd pass on immediately — here's why those fail."

Yulia leads with the skip list, not the full list. That's the actual value.

---

### DELTA 5: Seller Journey Timeline Visualization
**Affects:** Session 11 (Seller Dashboard)

**What's built:** Seller Dashboard shows a value range and improvement actions. No sense of timeline or journey phase.

**What needs to change:**

#### DB Migration
```sql
ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS estimated_exit_months INTEGER;
ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS journey_phase TEXT;
-- values: 'assessing' | 'optimizing' | 'ready' | 'in_market' | 'under_loi' | 'closed'
```

#### Timeline Component
Add a journey phase indicator to Seller Dashboard, above improvement actions:

```
YOUR EXIT JOURNEY
Phase: Getting Ready  --------*--------------------------
          6 mo          12 mo         18 mo         Exit

CURRENT PHASE: Value Optimization (Month 3 of ~12)
Next milestone: Complete financial documentation (est. 6 weeks)
```

#### Timeline Estimation Logic
Add to `server/services/knowledgeGraphService.ts`:
```typescript
function estimateMonthsToReady(
  valueReadinessScore: number,
  pendingActions: ImprovementAction[],
  exitType: string
): number {
  // Base estimate from score
  let months = valueReadinessScore >= 80 ? 2
    : valueReadinessScore >= 60 ? 5
    : valueReadinessScore >= 40 ? 9
    : 14;

  // Adjust for pending action timelines
  const highImpactPending = pendingActions
    .filter(a => a.status !== 'complete' && a.difficulty === 'hard')
    .reduce((sum, a) => Math.max(sum, (a.timeline_days ?? 90) / 30), 0);

  months = Math.max(months, highImpactPending);

  // Exit type minimums
  if (exitType === 'esop') months = Math.max(months, 12);
  if (exitType === 'capital_raise') months = Math.max(months, 4);
  if (exitType === 'partner_buyout') months = Math.max(months, 2);

  return Math.round(months);
}
```

When actions are marked complete, recalculate and update `company_profiles.estimated_exit_months`. Show the change: "Your estimated timeline just moved from 8 months to 6 months."

This is the retention mechanic — every action moves their exit date closer.

---

### DELTA SUMMARY

| Delta | Sessions Affected | What to Change | Size |
|-------|-------------------|---------------|------|
| Exit type as first-class field | 3, 4, 5 | DB column, Haiku classifier, S0 question, VRR branching | Medium |
| PMI OS — 180-day plan | 4, new session between 13-14 | PMI gates, PMI deliverables, milestone tracker | Large (new session) |
| Negotiation intelligence | 4, 5, 12 | S3/B3 gate prompts, VRR/Thesis negotiation section, pipeline conviction check | Medium |
| Buyer speed-to-conviction reframe | 12, 13 | Pipeline card layout, skip list framing, conviction check logic | Small-Medium |
| Seller timeline visualization | 11 | Timeline component on seller dashboard, phase estimation logic | Small |

### DELTA VERIFICATION
After applying all changes:
1. `npm run build` — zero errors
2. DB: confirm all new columns exist:
   - `conversations.exit_type`, `pmi_phase`, `pmi_close_date`
   - `company_profiles.exit_type`, `estimated_exit_months`, `journey_phase`
   - `deals.exit_type`
   - `discovery_targets.conviction_check`
3. Start a sell conversation → Yulia asks exit type question in S0
4. Answer "walk away completely" → `exit_type = 'full_exit'` stored on conversation
5. Complete S0 → VRR includes "Your Exit Path" section with buyer universe + negotiation insight
6. Seller dashboard shows journey phase indicator + estimated timeline
7. Complete buy journey → pipeline cards show Quick Conviction Check
8. Start a PMI conversation → Yulia delivers PMI Kickoff Brief after PMI0 intake

---

## Part 2: Code Gaps (Sessions 11-15)

### Revenue estimation is orphaned
**File:** `server/services/revenueEstimationService.ts`

Service exists but is never called. Company profiles never get `revenue_estimated_low`/`revenue_estimated_high` populated.

**Fix:** Call from `discoveryService.upsertDiscoveryTarget()` after creating a company profile.

### Discovery routes use setImmediate instead of pg-boss
**Files:** `server/routes/discovery.ts:30`, `server/routes/buyerPipeline.ts:157`

Both routes fire-and-forget via `setImmediate`. The pg-boss worker and `enqueueDiscoveryScan()` exist but aren't wired in. Works for testing but scans won't survive server restarts.

**Fix:** Replace `setImmediate(() => runDiscoveryScan(...))` with `enqueueDiscoveryScan(thesisId)`.

### BizBuySell via Apify
**File:** `server/services/discoveryService.ts:154-161`

Placeholder that logs "configure Apify actor ID". No actual scraping.

### Whoxy WHOIS lookups
Not implemented. Needed for domain age signals in sale-readiness scoring.

### Hunter.io email enrichment
Not implemented. Tier 2 enrichment for owner contact discovery.

### Apollo.io company enrichment
Not implemented. Tier 3 enrichment for employee count, revenue ranges, leadership.

### Bizestimate PDF/shareable card
Not implemented. Shareable one-page business value summary for sellers.

### Geographic subdivision for Google Places
Not implemented. Currently gets max 60 results per geography. Grid-cell subdivision would improve coverage.

---

## Part 3: Sessions 16-18 (prompts not yet written)

Per the playbook: "CC prompts for Sessions 16-18 will be written when Sessions 11-15 are verified complete."

| Session | What Ships | Priority | Est. Time |
|---------|-----------|----------|-----------|
| **16** | **Collaboration:** RBAC, deal rooms, advisor access, day passes | Medium | 5-6 hrs |
| **17** | **Pipeline view:** visual gate progression, deal cards, multi-deal management | Medium | 4-5 hrs |
| **18** | **Notifications:** email service, gate nudges, match alerts, weekly digest | High | 4-5 hrs |

### Session 16 — Collaboration
RBAC for deal rooms. Advisor/broker access with configurable permissions. Day passes for temporary access (schema exists in migration 009). Deal invitations with token-based acceptance (routes partially exist). **Must be designed around the buyer workflow** — inviting attorneys, CPAs, lenders, partners to specific deal rooms with appropriate visibility.

### Session 17 — Pipeline View
Visual gate progression (S0-S5 / B0-B5 / R0-R5). Deal cards with status indicators. Multi-deal management. Enhances existing `PipelinePanel`.

### Session 18 — Notifications
Email delivery service (SendGrid/Postmark/SES). Gate nudges. Match alerts for buyers. Weekly digest of pipeline activity and valuation changes.

---

## Part 4: Go-Live Prerequisites (not blocking testing)

- Email sending infrastructure (SendGrid/Postmark/SES)
- Auth flow polish (login/signup UX, password reset, email verification)
- Share links / public document access
- Production Stripe keys (currently TEST_MODE=true)
- SSL + custom domain on Railway
- Error monitoring (Sentry or similar)
- Analytics (Mixpanel/Amplitude/PostHog)

---

## Environment Variables Needed (for missing integrations)

```
APIFY_API_TOKEN=...          # apify.com — BizBuySell scraping
HUNTER_API_KEY=...           # hunter.io — email finding ($49/month)
APOLLO_API_KEY=...           # apollo.io — company enrichment (free tier)
WHOXY_API_KEY=...            # whoxy.com — WHOIS lookups ($0.002/lookup)
GOOGLE_PLACES_API_KEY=...   # Already defined — needed for discovery
```

---

## Summary

| # | Item | Severity | Category |
|---|------|----------|----------|
| — | **Deltas (journey intelligence)** | | |
| D1 | Exit type as first-class field — DB, classifier, S0 question, VRR branching | **Critical** | Delta |
| D2 | PMI OS — 180-day post-close journey, kickoff brief, milestone tracker | **Critical** | Delta |
| D3 | Negotiation intelligence — S3/B3 gate prompts, VRR/Thesis negotiation previews | **High** | Delta |
| D4 | Buyer speed-to-conviction — conviction check, skip list framing, pipeline cards | **High** | Delta |
| D5 | Seller timeline visualization — phase indicator, estimated months to ready | **Medium** | Delta |
| — | **Code gaps** | | |
| C1 | Revenue estimation orphaned | **Medium** | Code |
| C2 | setImmediate vs pg-boss | **Medium** | Code |
| C3 | BizBuySell stub | **Medium** | Code |
| C4 | Whoxy/Hunter/Apollo integrations | **Medium** | Code |
| C5 | Bizestimate PDF | **Medium** | Code |
| C6 | Geo subdivision | **Low** | Code |
| — | **Platform** | | |
| P1-3 | Sessions 16-18 (Collaboration, Pipeline View, Notifications) | **Pending** | Platform |
| P4+ | Go-live prerequisites (email, auth polish, Stripe prod, monitoring) | **Pending** | Go-live |
