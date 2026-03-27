/**
 * Deep Analysis Prompt — Stage 3 Tier 4 of the Sourcing Pipeline.
 *
 * Sonnet analyzes enriched candidate data to produce acquisition-relevant
 * intelligence: estimated revenue, growth trajectory, risk factors.
 */

export interface DeepAnalysisInput {
  thesis: {
    name: string;
    industry: string | null;
    geography: string | null;
    revenueMin: number | null;
    revenueMax: number | null;
  };
  candidate: {
    name: string;
    address: string | null;
    city: string | null;
    state: string | null;
    phone: string | null;
    website: string | null;
    rating: number | null;
    reviewCount: number | null;
    yearFounded: number | null;
    teamSizeEstimate: string | null;
    services: string[] | null;
    certifications: string[] | null;
    successionSignals: string[] | null;
    recurringRevenueSignals: string[] | null;
    commercialVsResidential: string | null;
    ownerDependencySignals: string[] | null;
    sbaMatch: boolean;
    sbaLoanData: any;
  };
}

export function buildDeepAnalysisPrompt(input: DeepAnalysisInput): string {
  const c = input.candidate;
  return `You are an M&A analyst evaluating an acquisition target against a buyer's thesis.

## BUYER'S THESIS
Name: ${input.thesis.name}
Industry: ${input.thesis.industry || 'Not specified'}
Geography: ${input.thesis.geography || 'National'}
Target Revenue: ${formatRange(input.thesis.revenueMin, input.thesis.revenueMax)}

## TARGET BUSINESS
Name: ${c.name}
Location: ${[c.city, c.state].filter(Boolean).join(', ') || 'Unknown'}
Phone: ${c.phone || 'Unknown'}
Website: ${c.website || 'None'}
Google Rating: ${c.rating != null ? `${c.rating}/5 (${c.reviewCount || 0} reviews)` : 'Unknown'}
Year Founded: ${c.yearFounded || 'Unknown'}
Team Size: ${c.teamSizeEstimate || 'Unknown'}
Services: ${c.services?.join(', ') || 'Unknown'}
Certifications: ${c.certifications?.join(', ') || 'None detected'}
Commercial vs Residential: ${c.commercialVsResidential || 'Unknown'}
Recurring Revenue Signals: ${c.recurringRevenueSignals?.join(', ') || 'None detected'}
Succession Signals: ${c.successionSignals?.join(', ') || 'None detected'}
Owner Dependency Signals: ${c.ownerDependencySignals?.join(', ') || 'None detected'}
SBA Loan History: ${c.sbaMatch ? `Yes — ${JSON.stringify(c.sbaLoanData)}` : 'No match found'}

## ANALYSIS REQUIRED

Return a JSON object with exactly these fields:

{
  "estimated_revenue_low_cents": <number — conservative low estimate in cents, based on team size, review count, industry benchmarks, and any available signals. Use review count as a size proxy: <10 reviews typically = <$500K rev, 10-50 = $500K-$2M, 50-200 = $2M-$10M, 200+ = $10M+. Combine with team size and industry norms.>,
  "estimated_revenue_high_cents": <number — optimistic high estimate in cents>,
  "estimated_employees": <number or null — based on team size signals and industry norms>,
  "growth_indicators": [<strings — signs of growth: hiring, new locations, expanding services, increasing reviews over time, new certifications>],
  "risk_factors": [<strings — red flags: high owner dependency, single location, low reviews, no website, declining signals, customer concentration>],
  "acquisition_fit": "<strong_fit | good_fit | moderate_fit | weak_fit>",
  "ai_summary": "<2-3 sentences: why this business is or isn't a good acquisition target for this buyer. Be specific — reference actual data points from above, not generic statements.>",
  "recommended_next_steps": [<strings — specific actions: "Request P&L via outreach letter", "Check county business filings for ownership structure", "Verify maintenance contract count through service call">]
}

RULES:
1. Revenue estimates must be grounded in the signals provided. State your reasoning basis (e.g., "Based on ~45 reviews and 5-person team in HVAC, typical range is...").
2. Never estimate revenue above the industry norm for the team size and geography.
3. If insufficient data, widen the range rather than guessing precisely.
4. Be specific in risk_factors and growth_indicators — not "good reviews" but "4.8 rating with 127 reviews suggests strong reputation and customer base."
5. Return ONLY the JSON object. No markdown wrapping.`;
}

export function buildBatchDeepAnalysisPrompt(
  thesis: DeepAnalysisInput['thesis'],
  candidates: DeepAnalysisInput['candidate'][],
): string {
  return `You are an M&A analyst evaluating ${candidates.length} acquisition targets against a buyer's thesis.

## BUYER'S THESIS
Name: ${thesis.name}
Industry: ${thesis.industry || 'Not specified'}
Geography: ${thesis.geography || 'National'}
Target Revenue: ${formatRange(thesis.revenueMin, thesis.revenueMax)}

## TARGETS TO EVALUATE

${candidates.map((c, i) => `### Target ${i + 1}: ${c.name}
Location: ${[c.city, c.state].filter(Boolean).join(', ') || 'Unknown'}
Rating: ${c.rating != null ? `${c.rating}/5 (${c.reviewCount || 0} reviews)` : 'Unknown'}
Year Founded: ${c.yearFounded || 'Unknown'}
Team Size: ${c.teamSizeEstimate || 'Unknown'}
Services: ${c.services?.join(', ') || 'Unknown'}
Recurring Revenue: ${c.recurringRevenueSignals?.join(', ') || 'None'}
Succession Signals: ${c.successionSignals?.join(', ') || 'None'}
Owner Dependency: ${c.ownerDependencySignals?.join(', ') || 'None'}
SBA History: ${c.sbaMatch ? 'Yes' : 'No'}
`).join('\n')}

## REQUIRED OUTPUT

Return a JSON array with ${candidates.length} objects, one per target in order. Each object:
{
  "index": <0-based index matching input order>,
  "ai_summary": "<one sentence: specific fit assessment referencing actual data>",
  "score_flags": [<strings: notable positives and negatives>],
  "acquisition_fit": "<strong_fit | good_fit | moderate_fit | weak_fit>",
  "confidence": "<high | medium | low>"
}

Be specific — reference actual data points, not generic assessments. Return ONLY the JSON array.`;
}

function formatRange(min: number | null, max: number | null): string {
  if (min && max) return `$${(min / 100).toLocaleString()} - $${(max / 100).toLocaleString()}`;
  if (min) return `$${(min / 100).toLocaleString()}+`;
  if (max) return `Up to $${(max / 100).toLocaleString()}`;
  return 'Not specified';
}
