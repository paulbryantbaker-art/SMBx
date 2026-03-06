/**
 * Value Readiness Report Generator — S0 Completion Deliverable
 *
 * Generates a personalized strategic document that makes the seller
 * understand exactly what they need to do and why the platform is valuable.
 * Uses Claude Sonnet for the improvement roadmap and dimensional scoring.
 */
import { callClaude } from '../aiService.js';
import { getLeagueMultipleRange } from '../leagueClassifier.js';
import { getBuyerDemandSignals } from '../knowledgeGraphService.js';

export interface VRRInput {
  business_name?: string;
  industry?: string;
  location?: string;
  revenue?: number;          // cents
  owner_compensation?: number; // cents
  owner_salary?: number;     // cents
  sde?: number;              // cents
  ebitda?: number;           // cents
  employee_count?: number;
  years_in_business?: number;
  exit_motivation?: string;
  timeline_preference?: string;
  league: string;
  naics_code?: string;
  location_state?: string;
}

function centsToDisplay(cents: number | undefined | null): string {
  if (!cents) return 'Not provided';
  const dollars = cents / 100;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1)}M`;
  if (dollars >= 1_000) return `$${(dollars / 1_000).toFixed(0)}K`;
  return `$${dollars.toLocaleString()}`;
}

function centsToNumber(cents: number | undefined | null): number {
  return cents ? cents / 100 : 0;
}

/**
 * Generate the Value Readiness Report.
 * Returns markdown content suitable for saving as an assistant message.
 */
export async function generateValueReadinessReport(input: VRRInput): Promise<string> {
  const {
    business_name, industry, location, revenue, league,
    owner_compensation, owner_salary, sde, ebitda,
    employee_count, years_in_business, exit_motivation,
    timeline_preference, location_state,
  } = input;

  const ownerComp = owner_compensation || owner_salary || 0;
  const revenueDollars = centsToNumber(revenue);
  const ownerCompDollars = centsToNumber(ownerComp);

  // Calculate preliminary SDE if not already provided
  let sdeDollars = centsToNumber(sde);
  if (!sdeDollars && revenueDollars && ownerCompDollars) {
    // Rough SDE estimate: owner comp + estimated net income (15% of revenue)
    sdeDollars = ownerCompDollars + (revenueDollars * 0.15);
  }

  // Get league multiples
  const multipleRange = getLeagueMultipleRange(league);

  // Calculate preliminary valuation range
  const earningsMetric = sdeDollars || centsToNumber(ebitda);
  const lowVal = earningsMetric * multipleRange.min;
  const highVal = earningsMetric * (multipleRange.max || multipleRange.min * 1.5);

  // Fetch buyer demand signals
  let demandSection = '';
  try {
    const signals = await getBuyerDemandSignals({
      industry: industry || null,
      location_state: location_state || null,
      revenue_reported: revenue || null,
    });
    if (signals) {
      const parts: string[] = [];
      if (signals.strongMatches > 0) {
        parts.push(`**${signals.strongMatches} active buyer${signals.strongMatches > 1 ? 's' : ''}** on our platform match your business profile (industry, geography, and size).`);
      }
      if (signals.industryMatches > signals.strongMatches) {
        parts.push(`**${signals.industryMatches} buyer${signals.industryMatches > 1 ? 's' : ''}** are actively looking in the ${industry} space.`);
      }
      if (signals.totalActiveBuyers > 0) {
        parts.push(`**${signals.totalActiveBuyers} total active buyer${signals.totalActiveBuyers > 1 ? 's' : ''}** on the platform.`);
      }
      if (parts.length > 0) {
        demandSection = `\n---\n\n### Buyer Demand Intelligence\n\n${parts.join('\n')}`;
      }
    }
  } catch (_e) { /* non-critical */ }

  // Use Claude Sonnet to generate the personalized scoring and improvement roadmap
  const aiPrompt = buildAIPrompt({
    business_name: business_name || 'Your Business',
    industry: industry || 'Business Services',
    location: location || 'Unknown',
    revenueDollars,
    ownerCompDollars,
    sdeDollars,
    earningsMetric,
    league,
    employee_count,
    years_in_business,
    exit_motivation,
    timeline_preference,
    multipleRange,
    lowVal,
    highVal,
  });

  const aiContent = await callClaude(aiPrompt, [
    { role: 'user', content: 'Generate the Value Readiness Score dimensions and Improvement Roadmap for this business.' },
  ]);

  // Assemble the full report
  const displayName = business_name || 'Your Business';
  const report = `## Your Business Value Readiness Report
### ${displayName} | ${industry || 'Business Services'} | ${location || 'Location TBD'}

**Summary:** Based on your inputs, here is your personalized assessment and roadmap to maximize your exit value.

---

### Current Financial Snapshot

| Metric | Your Numbers | Notes |
|--------|-------------|-------|
| Annual Revenue | ${centsToDisplay(revenue)} | — |
| Owner Compensation | ${centsToDisplay(ownerComp)} | — |
| Preliminary ${multipleRange.metric} | ${earningsMetric > 0 ? centsToDisplay(Math.round(earningsMetric * 100)) : 'Needs more data'} | — |
| Employees | ${employee_count || 'Not provided'} | — |
| Years in Operation | ${years_in_business || 'Not provided'} | — |

*Note: Full ${multipleRange.metric} calculation with verified add-backs happens in the next phase.*

---

### Your Preliminary Value Range

Based on industry comparables for **${industry || 'your'}** businesses in your revenue range:

**Estimated Range: ${lowVal > 0 ? centsToDisplay(Math.round(lowVal * 100)) : 'N/A'} – ${highVal > 0 ? centsToDisplay(Math.round(highVal * 100)) : 'N/A'}**
*(Based on ${multipleRange.min}x – ${multipleRange.max || '?'}x ${multipleRange.metric} for ${industry || 'your industry'})*

This is a preliminary range. Your actual number will be higher or lower based on:
- Financial documentation quality
- Customer concentration
- Owner dependency
- Revenue trend
- Business systems and processes

---

${aiContent}
${demandSection}

---

### Next Steps

Your profile is complete — now let's dig into your financials. In the next phase, I'll:
1. Calculate your exact ${multipleRange.metric} with verified add-backs
2. Identify every dollar of hidden earnings
3. Give you a defensible valuation backed by comparable transactions

Let's get into the numbers.`;

  return report;
}

// ─── AI Prompt Builder ───────────────────────────────────────

function buildAIPrompt(params: {
  business_name: string;
  industry: string;
  location: string;
  revenueDollars: number;
  ownerCompDollars: number;
  sdeDollars: number;
  earningsMetric: number;
  league: string;
  employee_count?: number;
  years_in_business?: number;
  exit_motivation?: string;
  timeline_preference?: string;
  multipleRange: { metric: string; min: number; max: number | null };
  lowVal: number;
  highVal: number;
}): string {
  const {
    business_name, industry, location, revenueDollars, ownerCompDollars,
    sdeDollars, league, employee_count, years_in_business,
    exit_motivation, timeline_preference, multipleRange, lowVal, highVal,
  } = params;

  return `You are generating the personalized sections of a Value Readiness Report for an M&A client.

## BUSINESS DATA
- Name: ${business_name}
- Industry: ${industry}
- Location: ${location}
- Revenue: $${revenueDollars.toLocaleString()}
- Owner Compensation: $${ownerCompDollars.toLocaleString()}
- Preliminary ${multipleRange.metric}: $${sdeDollars.toLocaleString()}
- League: ${league}
- Employees: ${employee_count || 'unknown'}
- Years in Business: ${years_in_business || 'unknown'}
- Exit Motivation: ${exit_motivation || 'not stated'}
- Timeline: ${timeline_preference || 'not stated'}
- Value Range: $${Math.round(lowVal).toLocaleString()} – $${Math.round(highVal).toLocaleString()}

## TASK
Generate TWO sections in markdown:

### 1. Value Readiness Score: X/100

Score the business on 5 dimensions, 20 points each. Be realistic — if data is missing, score conservatively (8-12/20) and note what's needed. Use your industry knowledge to infer reasonable estimates.

| Dimension | Score | What It Means |
|-----------|-------|---------------|
| Financial Documentation | X/20 | [specific explanation based on what we know] |
| Owner Independence | X/20 | [assessment based on industry, employee count, revenue] |
| Customer Base Quality | X/20 | [assessment based on industry norms] |
| Revenue Trend | X/20 | [assessment or note that trend data is needed] |
| Business Systems | X/20 | [assessment based on industry, size, years in business] |

### 2. Your 12-Month Value Creation Roadmap

Generate exactly 3 high-impact, specific, dollar-quantified improvement actions based on the business's industry and size. Use these common value creation levers:

- Formalizing add-backs before sale: typically +15-25% to ${multipleRange.metric}
- Reducing owner dependency (documenting processes, hiring a manager): +10-20% to multiple
- Converting month-to-month clients to annual contracts: +5-15% ${multipleRange.metric}
- Cleaning up personal expenses run through business: +5-15% ${multipleRange.metric}
- Building 3 years of clean P&Ls: +0.5-1.0x to multiple
- For ${industry}: any industry-specific levers

For each action:
**Action N: [specific action]**
- Estimated impact: +$X to sale price
- Time to implement: [timeframe]
- Difficulty: [Easy/Medium/Hard]

End with:
**Total potential upside:** +$X to your exit value
**If you follow this plan:** $X – $Y estimated range

## RULES
- Be specific to ${industry} businesses
- Use real numbers based on the data provided — calculate dollar impacts from the ${multipleRange.metric} and multiples
- Be honest about unknowns — score conservatively where data is missing
- No fluff — every sentence should deliver value
- Output ONLY the two markdown sections, no preamble`;
}
