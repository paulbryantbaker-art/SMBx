/**
 * Blind Teaser (One-Page Profile) Generator
 *
 * Anonymized business overview for buyer marketing.
 * Deterministic — no AI calls needed.
 * All financial values in CENTS.
 */

export interface BlindTeaserInput {
  industry: string;
  sub_industry?: string;
  region: string;               // e.g., "Southeast", "Pacific Northwest"
  revenue: number;              // cents
  sde?: number;                 // cents
  ebitda?: number;              // cents
  growth_rate?: number;         // percentage
  years_in_business?: number;
  employee_count?: number;
  recurring_revenue_pct?: number;
  gross_margin?: number;        // percentage
  customer_count?: string;      // e.g., "500+", "2,000+"
  asking_price?: number;        // cents
  league: string;
  deal_structure_preference?: string;
  highlights?: string[];
}

export interface BlindTeaserDocument {
  type: 'blind_teaser';
  headline: string;
  sections: Array<{
    title: string;
    content: string;
  }>;
  key_metrics: Record<string, string>;
  generated_at: string;
}

export function generateBlindTeaser(input: BlindTeaserInput): BlindTeaserDocument {
  const earnings = input.ebitda || input.sde || 0;
  const metric = input.ebitda ? 'EBITDA' : 'SDE';
  const earningsDollars = earnings / 100;
  const revenueDollars = input.revenue / 100;

  // Anonymized headline
  const headline = `Established ${input.industry} Business — ${input.region}`;

  // Key metrics
  const keyMetrics: Record<string, string> = {
    'Industry': input.sub_industry ? `${input.industry} (${input.sub_industry})` : input.industry,
    'Region': input.region,
    'Revenue': `$${formatRoundNumber(revenueDollars)}`,
    [metric]: `$${formatRoundNumber(earningsDollars)}`,
  };

  if (input.growth_rate !== undefined) {
    keyMetrics['Revenue Growth'] = `${input.growth_rate}% YoY`;
  }
  if (input.gross_margin !== undefined) {
    keyMetrics['Gross Margin'] = `${input.gross_margin}%`;
  }
  if (input.years_in_business) {
    keyMetrics['Years Established'] = `${input.years_in_business}+`;
  }
  if (input.employee_count) {
    keyMetrics['Team Size'] = `${input.employee_count} employees`;
  }
  if (input.recurring_revenue_pct) {
    keyMetrics['Recurring Revenue'] = `${input.recurring_revenue_pct}%`;
  }
  if (input.asking_price) {
    keyMetrics['Asking Price'] = `$${formatRoundNumber(input.asking_price / 100)}`;
  }

  // Sections
  const sections: Array<{ title: string; content: string }> = [];

  // Business overview
  const overviewLines: string[] = [];
  overviewLines.push(`A well-established ${input.industry.toLowerCase()} business operating in the ${input.region} region.`);
  if (input.years_in_business) {
    overviewLines.push(`The company has been in continuous operation for over ${input.years_in_business} years, building a strong reputation and loyal customer base.`);
  }
  if (input.employee_count) {
    overviewLines.push(`The business employs a team of ${input.employee_count} professionals.`);
  }
  if (input.customer_count) {
    overviewLines.push(`The company serves ${input.customer_count} customers.`);
  }
  sections.push({ title: 'Business Overview', content: overviewLines.join(' ') });

  // Financial highlights
  const finLines: string[] = [];
  finLines.push(`- **Revenue**: $${formatRoundNumber(revenueDollars)}`);
  finLines.push(`- **${metric}**: $${formatRoundNumber(earningsDollars)}`);
  if (input.gross_margin) finLines.push(`- **Gross Margin**: ${input.gross_margin}%`);
  if (input.growth_rate !== undefined) {
    finLines.push(`- **Growth**: ${input.growth_rate > 0 ? '+' : ''}${input.growth_rate}% year-over-year`);
  }
  if (input.recurring_revenue_pct) {
    finLines.push(`- **Recurring Revenue**: ${input.recurring_revenue_pct}% of total revenue`);
  }
  if (earnings > 0 && input.revenue > 0) {
    const margin = Math.round((earnings / input.revenue) * 100);
    finLines.push(`- **${metric} Margin**: ${margin}%`);
  }
  sections.push({ title: 'Financial Highlights', content: finLines.join('\n') });

  // Investment highlights
  const highlights = input.highlights || generateDefaultHighlights(input);
  sections.push({
    title: 'Investment Highlights',
    content: highlights.map(h => `- ${h}`).join('\n'),
  });

  // Transaction overview
  const txnLines: string[] = [];
  if (input.asking_price) {
    txnLines.push(`- **Asking Price**: $${formatRoundNumber(input.asking_price / 100)}`);
    if (earnings > 0) {
      const multiple = Math.round((input.asking_price / earnings) * 10) / 10;
      txnLines.push(`- **Implied Multiple**: ${multiple}x ${metric}`);
    }
  }
  if (input.deal_structure_preference) {
    txnLines.push(`- **Preferred Structure**: ${input.deal_structure_preference}`);
  }
  txnLines.push(`- **Deal Size Category**: ${input.league}`);
  sections.push({ title: 'Transaction Overview', content: txnLines.join('\n') });

  // Confidentiality notice
  sections.push({
    title: 'Confidentiality Notice',
    content: 'This document is provided on a strictly confidential basis. The information contained herein is preliminary and subject to change. Recipients agree not to disclose this information or contact the business directly without prior written consent.',
  });

  return {
    type: 'blind_teaser',
    headline,
    sections,
    key_metrics: keyMetrics,
    generated_at: new Date().toISOString(),
  };
}

function generateDefaultHighlights(input: BlindTeaserInput): string[] {
  const highlights: string[] = [];

  if (input.years_in_business && input.years_in_business >= 10) {
    highlights.push(`${input.years_in_business}+ years of proven operations and market presence`);
  }
  if (input.recurring_revenue_pct && input.recurring_revenue_pct > 50) {
    highlights.push(`${input.recurring_revenue_pct}% recurring revenue provides predictable cash flows`);
  }
  if (input.growth_rate && input.growth_rate > 10) {
    highlights.push(`Strong ${input.growth_rate}% annual growth trajectory`);
  }
  if (input.gross_margin && input.gross_margin > 50) {
    highlights.push(`Healthy ${input.gross_margin}% gross margins`);
  }
  if (input.employee_count && input.employee_count > 5) {
    highlights.push('Experienced management team in place for smooth transition');
  }

  if (highlights.length === 0) {
    highlights.push('Established market position with growth potential');
    highlights.push('Opportunity for operational improvements under new ownership');
  }

  return highlights;
}

function formatRoundNumber(n: number): string {
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1)}M`;
  }
  if (n >= 1_000) {
    return `${Math.round(n / 1_000)}K`;
  }
  return n.toLocaleString();
}
