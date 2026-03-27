/**
 * Intelligence Brief Prompt — Stage 1 of the Sourcing Pipeline.
 *
 * Sonnet analyzes real Census/SBA/FRED/BLS data injected into this prompt
 * and produces a structured Acquisition Intelligence Brief.
 */

export interface BriefInputData {
  thesis: {
    name: string;
    industry: string | null;
    naicsCodes: string[];
    geography: string | null;
    stateCodes: string[];
    revenueMin: number | null;
    revenueMax: number | null;
    ebitdaMin: number | null;
    ebitdaMax: number | null;
    sdeMin: number | null;
    sdeMax: number | null;
    priceMin: number | null;
    priceMax: number | null;
    employeeMin: number | null;
    employeeMax: number | null;
    keywords: string[];
  };
  censusData: any;
  firmDynamics: any;
  sbaLending: any;
  economicIndicators: {
    fedFunds: any;
    primeRate: any;
    unemployment: any;
  };
  marketHeat: any;
}

export function buildIntelligenceBriefPrompt(data: BriefInputData): string {
  const dataAvailability: string[] = [];
  if (data.censusData) dataAvailability.push('Census CBP (establishment counts, employment, payroll)');
  if (data.firmDynamics) dataAvailability.push('Census BDS (firm age, entry/exit rates)');
  if (data.sbaLending) dataAvailability.push('SBA 7(a) lending statistics');
  if (data.economicIndicators.primeRate) dataAvailability.push('FRED economic indicators (Prime rate, Fed Funds, unemployment)');
  if (data.marketHeat) dataAvailability.push('Market heat / PE activity signals');

  return `You are a senior M&A analyst preparing an Acquisition Intelligence Brief for a buyer.

Your job: analyze the real data provided below and produce a structured intelligence brief that will guide a targeted acquisition search. Every number you cite MUST come from the provided data. If data is missing for a section, say so explicitly — never fabricate statistics.

## BUYER'S ACQUISITION THESIS

Name: ${data.thesis.name}
Industry: ${data.thesis.industry || 'Not specified'}
NAICS Codes: ${data.thesis.naicsCodes.length > 0 ? data.thesis.naicsCodes.join(', ') : 'Not specified'}
Geography: ${data.thesis.geography || 'National'}
Target States: ${data.thesis.stateCodes.length > 0 ? data.thesis.stateCodes.join(', ') : 'All'}
Revenue Range: ${formatRange(data.thesis.revenueMin, data.thesis.revenueMax)}
EBITDA Range: ${formatRange(data.thesis.ebitdaMin, data.thesis.ebitdaMax)}
SDE Range: ${formatRange(data.thesis.sdeMin, data.thesis.sdeMax)}
Target Price Range: ${formatRange(data.thesis.priceMin, data.thesis.priceMax)}
Employee Range: ${formatIntRange(data.thesis.employeeMin, data.thesis.employeeMax)}
Keywords: ${data.thesis.keywords.length > 0 ? data.thesis.keywords.join(', ') : 'None'}

## DATA SOURCES AVAILABLE
${dataAvailability.length > 0 ? dataAvailability.map(s => `- ${s}`).join('\n') : '- No external data sources available. Generate brief from thesis criteria and general industry knowledge only.'}

${data.censusData ? `## CENSUS COUNTY BUSINESS PATTERNS (CBP)
${JSON.stringify(data.censusData, null, 2)}` : ''}

${data.firmDynamics ? `## BUSINESS DYNAMICS STATISTICS (BDS)
${JSON.stringify(data.firmDynamics, null, 2)}` : ''}

${data.sbaLending ? `## SBA 7(a) LENDING STATISTICS
${JSON.stringify(data.sbaLending, null, 2)}` : ''}

${data.economicIndicators.primeRate || data.economicIndicators.fedFunds || data.economicIndicators.unemployment ? `## ECONOMIC INDICATORS
${data.economicIndicators.primeRate ? `Prime Rate: ${JSON.stringify(data.economicIndicators.primeRate)}` : ''}
${data.economicIndicators.fedFunds ? `Fed Funds Rate: ${JSON.stringify(data.economicIndicators.fedFunds)}` : ''}
${data.economicIndicators.unemployment ? `Unemployment: ${JSON.stringify(data.economicIndicators.unemployment)}` : ''}` : ''}

${data.marketHeat ? `## MARKET HEAT & PE ACTIVITY
${JSON.stringify(data.marketHeat, null, 2)}` : ''}

## OUTPUT FORMAT

Return a JSON object with exactly these keys. Each section should be substantive — 3-8 bullet points with specific numbers from the data.

{
  "market_density": {
    "total_establishments": <number from CBP or null>,
    "total_employees": <number from CBP or null>,
    "avg_employees_per_firm": <calculated or null>,
    "avg_payroll_per_employee": <calculated or null>,
    "geographic_concentration": "<which states/counties have highest density>",
    "fragmentation_level": "<high/medium/low — based on firm count vs market size>",
    "key_findings": ["<finding 1>", "<finding 2>", ...]
  },
  "deal_economics": {
    "typical_valuation_multiple": "<range, e.g. 3.0x-5.0x SDE>",
    "median_deal_size_estimate": "<based on avg payroll and multiples>",
    "sba_feasibility": {
      "eligible": <true/false>,
      "typical_loan_size": <from SBA data or null>,
      "approval_rate": <from SBA data or null>,
      "current_rate_estimate": "<Prime + spread>"
    },
    "dscr_expectations": "<typical range for this industry>",
    "key_findings": ["<finding 1>", "<finding 2>", ...]
  },
  "acquisition_signals": {
    "aging_firm_count": <from BDS firm age data or null>,
    "exit_rate": <from BDS or null>,
    "succession_window_estimate": "<how many firms are 10-25 years old>",
    "demographic_indicators": ["<indicator 1>", ...],
    "key_findings": ["<finding 1>", "<finding 2>", ...]
  },
  "competitive_landscape": {
    "pe_activity_level": "<high/medium/low/none>",
    "pe_platforms_active": "<description of PE roll-up activity>",
    "search_fund_activity": "<estimated level>",
    "individual_buyer_density": "<based on thesis count or general>",
    "key_findings": ["<finding 1>", "<finding 2>", ...]
  },
  "key_risks": [
    {
      "risk": "<risk name>",
      "severity": "<high/medium/low>",
      "description": "<brief explanation>",
      "mitigation": "<how buyer can address>"
    }
  ],
  "recommended_params": {
    "refined_naics_codes": ["<primary NAICS>", "<adjacent NAICS 1>", ...],
    "naics_search_labels": {"<NAICS code>": "<human label for Google search>"},
    "prioritized_geographies": [
      {"name": "<city/metro, state>", "reason": "<why prioritized>"}
    ],
    "search_queries": ["<Google Places text query 1>", "<query 2>", ...],
    "adjacent_industries": ["<industry that shares acquisition characteristics>"],
    "size_indicators": {
      "min_reviews": <suggested Google review count floor as size proxy>,
      "min_rating": <suggested minimum rating>
    }
  },
  "narrative_summary": "<2-3 paragraph executive summary synthesizing all sections>"
}

CRITICAL RULES:
1. Every number must trace back to the provided data. If a data section is missing, set those fields to null and note the gap.
2. The recommended_params section is the most important — it directly drives the expansion search. Be specific: list 5-15 Google Places search queries, 3-10 prioritized metros, and refine NAICS to include adjacencies.
3. For search_queries, think like someone searching Google Maps: "HVAC contractor in Atlanta", "air conditioning repair near Tampa", "commercial HVAC company Jacksonville". Include variations.
4. For prioritized_geographies, rank by combination of establishment density (from CBP) and likely deal opportunity. Include specific cities, not just states.
5. Do not speculate about specific companies. This is market-level intelligence.
6. Return ONLY the JSON object. No markdown, no wrapping, no explanation outside the JSON.`;
}

function formatRange(min: number | null, max: number | null): string {
  if (min && max) return `$${(min / 100).toLocaleString()} - $${(max / 100).toLocaleString()}`;
  if (min) return `$${(min / 100).toLocaleString()}+`;
  if (max) return `Up to $${(max / 100).toLocaleString()}`;
  return 'Not specified';
}

function formatIntRange(min: number | null, max: number | null): string {
  if (min && max) return `${min} - ${max}`;
  if (min) return `${min}+`;
  if (max) return `Up to ${max}`;
  return 'Not specified';
}
