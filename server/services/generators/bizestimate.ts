/**
 * ValueLens Generator — Free Living Valuation Card
 *
 * One-page shareable business value summary.
 * Deterministic (no AI call) — uses extracted financials + league multiples.
 */
import { getLeagueMultipleRange } from '../leagueClassifier.js';

export interface ValueLensInput {
  business_name?: string;
  industry?: string;
  location?: string;
  revenue?: number;            // cents
  sde?: number;                // cents
  ebitda?: number;             // cents
  owner_compensation?: number; // cents
  employee_count?: number;
  years_in_business?: number;
  league: string;
  exit_type?: string;
}

function centsToDisplay(cents: number | undefined | null): string {
  if (!cents) return 'Not provided';
  const dollars = cents / 100;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1)}M`;
  if (dollars >= 1_000) return `$${(dollars / 1_000).toFixed(0)}K`;
  return `$${dollars.toLocaleString()}`;
}

const EXIT_TYPE_LABELS: Record<string, string> = {
  full_exit: 'Full Sale / Complete Exit',
  partner_buyout: 'Partner Buyout',
  capital_raise: 'Capital Raise / Growth Investment',
  esop: 'Employee Ownership Transition (ESOP/MBO)',
  majority_sale: 'Majority Sale (Retain Minority)',
  structured: 'Structured / Custom Transaction',
};

/**
 * Generate a ValueLens card.
 * Returns markdown content for display and sharing.
 */
export function generateValueLens(input: ValueLensInput): string {
  const {
    business_name, industry, location, revenue, league,
    sde, ebitda, owner_compensation, employee_count,
    years_in_business, exit_type,
  } = input;

  const multipleRange = getLeagueMultipleRange(league);
  const metric = multipleRange.metric;

  // Calculate earnings
  let earningsCents = metric === 'SDE' ? (sde || 0) : (ebitda || 0);
  if (!earningsCents && revenue && owner_compensation) {
    // Rough SDE estimate
    earningsCents = owner_compensation + Math.round(revenue * 0.15);
  }
  const earningsDollars = earningsCents / 100;

  // Valuation range
  const lowVal = earningsDollars * multipleRange.min;
  const midVal = earningsDollars * ((multipleRange.min + (multipleRange.max || multipleRange.min * 1.5)) / 2);
  const highVal = earningsDollars * (multipleRange.max || multipleRange.min * 1.5);

  const fmtVal = (v: number) => {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `$${Math.round(v / 1_000)}K`;
    return `$${Math.round(v).toLocaleString()}`;
  };

  const now = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const lines: string[] = [];

  lines.push(`# ValueLens\u2122 \u2014 ${business_name || 'Your Business'}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Business overview
  lines.push('## Business Overview');
  lines.push('');
  lines.push(`| | |`);
  lines.push(`|---|---|`);
  if (industry) lines.push(`| **Industry** | ${industry} |`);
  if (location) lines.push(`| **Location** | ${location} |`);
  if (years_in_business) lines.push(`| **Years Operating** | ${years_in_business} |`);
  if (employee_count) lines.push(`| **Employees** | ${employee_count} |`);
  lines.push(`| **Revenue** | ${centsToDisplay(revenue)} |`);
  lines.push(`| **${metric}** | ${centsToDisplay(earningsCents || undefined)} |`);
  if (exit_type) lines.push(`| **Exit Path** | ${EXIT_TYPE_LABELS[exit_type] || exit_type} |`);
  lines.push('');

  // Valuation range
  if (earningsDollars > 0) {
    lines.push('## Estimated Value Range');
    lines.push('');
    lines.push(`| Low | Mid | High |`);
    lines.push(`|:---:|:---:|:---:|`);
    lines.push(`| ${fmtVal(lowVal)} | **${fmtVal(midVal)}** | ${fmtVal(highVal)} |`);
    lines.push('');
    lines.push(`> Based on ${metric} of ${centsToDisplay(earningsCents)} at ${multipleRange.min.toFixed(1)}\u2013${(multipleRange.max || multipleRange.min * 1.5).toFixed(1)}x (${league} range)`);
    lines.push('');
  } else {
    lines.push('## Estimated Value Range');
    lines.push('');
    lines.push('> Provide revenue and owner compensation to calculate your valuation range.');
    lines.push('');
  }

  // What this means
  lines.push('## What This Means');
  lines.push('');
  if (earningsDollars > 0) {
    const isSmall = earningsDollars < 200_000;
    lines.push(`Your business generates ${centsToDisplay(earningsCents)} in annual ${metric}. ` +
      `In the current market, ${industry || 'businesses in your segment'} typically trade at ` +
      `${multipleRange.min.toFixed(1)}\u2013${(multipleRange.max || multipleRange.min * 1.5).toFixed(1)}x ${metric}.`);
    lines.push('');
    if (isSmall) {
      lines.push(`At this size, your most likely buyer is an individual using SBA financing. ` +
        `The SBA requires a DSCR of 1.25x, meaning the business needs to generate enough cash flow to cover debt service with a 25% cushion.`);
    } else {
      lines.push(`At this level, your buyer pool includes private equity firms, funded searchers, and strategic acquirers. ` +
        `Competitive processes at this size typically yield premium multiples.`);
    }
  } else {
    lines.push('Once we have your financial details, this section will include buyer pool analysis and market context.');
  }
  lines.push('');

  // Footer
  lines.push('---');
  lines.push('');
  lines.push(`*Powered by smbX.ai Engine \u00B7 Last updated: ${now}*`);
  lines.push('');
  lines.push('*This is a preliminary estimate based on limited information. A full valuation considers add-backs, customer concentration, growth trajectory, and market conditions. Continue your conversation with Yulia for a comprehensive analysis.*');

  return lines.join('\n');
}
