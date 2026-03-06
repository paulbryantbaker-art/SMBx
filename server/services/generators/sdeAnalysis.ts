/**
 * SDE Analysis Generator — S1 Completion Deliverable
 *
 * Generates a preliminary financial analysis with SDE/EBITDA calculation,
 * add-back schedule, and value range estimate.
 */
import { getLeagueMultipleRange } from '../leagueClassifier.js';

export interface SdeAnalysisInput {
  business_name?: string;
  industry?: string;
  location?: string;
  revenue?: number;            // cents
  owner_compensation?: number; // cents
  owner_salary?: number;       // cents
  sde?: number;                // cents
  ebitda?: number;             // cents
  net_income?: number;         // cents
  league: string;
  add_backs?: Record<string, number>; // name → cents
}

function centsToDisplay(cents: number | undefined | null): string {
  if (!cents) return '—';
  const dollars = cents / 100;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(2)}M`;
  if (dollars >= 1_000) return `$${(dollars / 1_000).toFixed(0)}K`;
  return `$${dollars.toLocaleString()}`;
}

/**
 * Generate the SDE Analysis deliverable.
 * Returns markdown content suitable for saving as an assistant message.
 */
export function generateSdeAnalysis(input: SdeAnalysisInput): string {
  const {
    business_name, industry, league,
    revenue, owner_compensation, owner_salary, sde, ebitda, net_income,
    add_backs,
  } = input;

  const multipleRange = getLeagueMultipleRange(league);
  const isEbitda = multipleRange.metric === 'EBITDA';
  const metricName = isEbitda ? 'EBITDA' : 'SDE';

  const ownerComp = owner_compensation || owner_salary || 0;

  // Calculate SDE/EBITDA
  let calculatedEarnings = sde || ebitda || 0;
  if (!calculatedEarnings && net_income && ownerComp) {
    // Basic SDE = Net Income + Owner Comp (without detailed add-backs)
    calculatedEarnings = net_income + ownerComp;
  } else if (!calculatedEarnings && revenue) {
    // Rough estimate from revenue
    calculatedEarnings = Math.round(revenue * 0.20); // 20% SDE margin estimate
  }

  const earningsDollars = calculatedEarnings / 100;
  const lowVal = earningsDollars * multipleRange.min;
  const highVal = earningsDollars * (multipleRange.max || multipleRange.min * 1.5);

  // Build add-back rows
  const addBackRows: string[] = [];
  let totalAddBacks = 0;
  if (add_backs && typeof add_backs === 'object') {
    for (const [name, cents] of Object.entries(add_backs)) {
      if (cents && typeof cents === 'number') {
        const label = name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        addBackRows.push(`| ${label} | ${centsToDisplay(cents)} | Identified |`);
        totalAddBacks += cents;
      }
    }
  }

  // Build the calculation section
  let calculationSection: string;

  if (isEbitda) {
    calculationSection = `### Adjusted EBITDA Calculation

| Line Item | Amount |
|-----------|--------|
| Revenue | ${centsToDisplay(revenue)} |
| Net Income | ${centsToDisplay(net_income) || 'Needs verification'} |
| + Depreciation & Amortization | *Needs verification* |
| + Interest | *Needs verification* |
| + Taxes | *Needs verification* |
${addBackRows.length > 0 ? '| **Verified Add-Backs:** | |' : ''}
${addBackRows.join('\n')}
| **Adjusted EBITDA** | **${centsToDisplay(calculatedEarnings)}** |

*This is a preliminary estimate. Full EBITDA calculation requires verified financial statements.*`;
  } else {
    calculationSection = `### Seller Discretionary Earnings (SDE) Calculation

| Line Item | Amount |
|-----------|--------|
| Revenue | ${centsToDisplay(revenue)} |
| Net Income | ${centsToDisplay(net_income) || 'Estimated from revenue'} |
| + Owner Compensation | ${centsToDisplay(ownerComp)} |
| + Depreciation & Amortization | *Needs verification* |
| + Interest | *Needs verification* |
${addBackRows.length > 0 ? '| **Verified Add-Backs:** | |' : ''}
${addBackRows.join('\n')}
| **Adjusted SDE** | **${centsToDisplay(calculatedEarnings)}** |

*This is a preliminary calculation. Final SDE requires verified tax returns and documented add-backs.*`;
  }

  const report = `## Your Preliminary Financial Analysis
### ${business_name || 'Your Business'} | ${industry || 'Business Services'}

${calculationSection}

---

### Preliminary Value Range

Based on your adjusted ${metricName} of **${centsToDisplay(calculatedEarnings)}** and industry comparables for **${industry || 'your industry'}**:

**Estimated Range: ${lowVal > 0 ? `$${(lowVal / 1_000_000).toFixed(2)}M` : 'N/A'} – ${highVal > 0 ? `$${(highVal / 1_000_000).toFixed(2)}M` : 'N/A'}**
*(Based on ${multipleRange.min}x – ${multipleRange.max || '?'}x ${metricName} for ${industry || 'your industry'})*

${totalAddBacks > 0 ? `\nIdentified add-backs of **${centsToDisplay(totalAddBacks)}** are already reflected above. There may be additional add-backs we haven't captured yet — personal expenses, one-time costs, and above-market rent to related parties are common.\n` : ''}
---

### What Affects Your Multiple

Your multiple within the ${multipleRange.min}x–${multipleRange.max || '?'}x range depends on:

| Factor | Impact on Multiple |
|--------|-------------------|
| Revenue growth trend (3-year) | +0.5x for consistent growth |
| Customer concentration | -0.5x if top client > 20% of revenue |
| Owner dependency | -0.5x if business can't run without you |
| Recurring/contract revenue | +0.5x for high recurring % |
| Clean financial documentation | +0.5x for 3+ years of clean P&Ls |
| Industry tailwinds | +0.5x if in an active M&A sector |

---

### Next Steps

For the full valuation with comparable transactions, 7-factor quality score, and specific multiple recommendation:

**Full Valuation Report — next phase**

This includes:
- Comparable transaction analysis
- 7-factor quality scoring
- Defensible multiple recommendation
- Market positioning strategy`;

  return report;
}
