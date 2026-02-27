/**
 * Intelligence Report Generator — Seven-layer market intelligence analysis.
 * Composes data from Census CBP, FRED, transaction benchmarks, and AI analysis.
 */
import { sql } from '../../db.js';
import { generateMarketOverview, calculateSBABankability } from '../marketDataService.js';
import { callClaude } from '../aiService.js';

interface IntelligenceReportInput {
  naicsCode: string;
  stateCode: string;
  countyCode?: string;
  dealId?: number;
  purchasePrice?: number;
  ebitda?: number;
  sde?: number;
  revenue?: number;
  industry?: string;
  businessName?: string;
  league?: string;
}

export async function generateIntelligenceReport(input: IntelligenceReportInput): Promise<Record<string, any>> {
  const {
    naicsCode, stateCode, countyCode,
    purchasePrice, ebitda, sde, revenue,
    industry, businessName, league,
  } = input;

  // ─── Gather data from existing services ───
  const marketOverview = await generateMarketOverview(
    naicsCode,
    stateCode,
    countyCode,
    purchasePrice && (ebitda || sde)
      ? { purchasePrice, ebitda, sde }
      : undefined,
  );

  // Get transaction benchmarks for this NAICS
  const benchmarks = await sql`
    SELECT
      COUNT(*) as sample_size,
      ROUND(AVG(multiple)::numeric, 2) as avg_multiple,
      ROUND(PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY multiple)::numeric, 2) as p25_multiple,
      ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY multiple)::numeric, 2) as median_multiple,
      ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY multiple)::numeric, 2) as p75_multiple,
      ROUND(AVG(days_to_close)::numeric, 0) as avg_days_to_close,
      ROUND((COUNT(*) FILTER (WHERE sba_financed = true))::numeric / NULLIF(COUNT(*), 0) * 100, 1) as pct_sba_financed
    FROM transaction_benchmarks
    WHERE naics_code = ${naicsCode}
  `.catch(() => []);

  // Get industry health index if available
  const [healthIndex] = await sql`
    SELECT * FROM industry_health_index WHERE naics_code = ${naicsCode}
    ORDER BY period DESC LIMIT 1
  `.catch(() => [null]);

  // SBA analysis if we have price + earnings
  let sbaAnalysis = marketOverview.sbaAnalysis || null;
  if (!sbaAnalysis && purchasePrice && (ebitda || sde)) {
    sbaAnalysis = await calculateSBABankability({
      purchasePrice,
      ebitdaOrSde: ebitda || sde || 0,
    });
  }

  // ─── Build context for Claude analysis ───
  const dataContext = {
    industry: industry || marketOverview.industry,
    naicsCode,
    geography: marketOverview.geography,
    cbpData: marketOverview.cbpData,
    fredData: marketOverview.fredData,
    sbaAnalysis,
    benchmarks: benchmarks[0] || null,
    healthIndex,
    deal: { businessName, revenue, ebitda, sde, purchasePrice, league },
  };

  const prompt = `You are a senior M&A analyst generating a comprehensive market intelligence report. Use ONLY the data provided — never fabricate numbers.

## DATA CONTEXT
${JSON.stringify(dataContext, null, 2)}

## GENERATE A SEVEN-LAYER INTELLIGENCE REPORT

Produce a JSON object with these seven sections. Each section should have a "title", "summary" (1-2 sentences), "details" (array of bullet points), and "score" (1-10, where 10 is most favorable):

1. **industryStructure** — Porter's Five Forces analysis for NAICS ${naicsCode}. Competitive intensity, barriers to entry, supplier/buyer power, substitutes.

2. **marketGeography** — Local market conditions based on Census CBP data. Competitive density, employment base, payroll benchmarks. Is this market saturated or underserved?

3. **financialBenchmarking** — How does this deal compare to industry norms? Use transaction benchmarks for multiple comparisons, revenue/employee benchmarks from CBP. Flag if asking price is above/below market.

4. **financingFeasibility** — SBA eligibility, DSCR, LTV. Current interest rate environment from FRED data. Estimated monthly payment. Alternative financing paths if SBA doesn't work.

5. **riskAssessment** — Identify 3-5 key risks: customer concentration, owner dependency, industry cyclicality, regulatory exposure, geographic concentration. Use data signals where available.

6. **ownershipIntelligence** — Based on deal size and industry, what buyer types are typical? Individual operators, search funds, PE add-ons, strategics? What does this imply for pricing and terms?

7. **timingMomentum** — Interest rate trends from FRED, sector transaction velocity from benchmarks, CPI/inflation context. Is this a buyer's or seller's market?

Also include an "executiveSummary" (3-4 sentences), an "overallScore" (1-100), and "keyRecommendations" (array of 3-5 actionable bullet points).

Output valid JSON only — no markdown fences.`;

  try {
    const raw = await callClaude(prompt, [
      { role: 'user', content: 'Generate the intelligence report now.' },
    ]);

    const cleaned = raw.replace(/```json\n?|\n?```/g, '').trim();
    const report = JSON.parse(cleaned);

    return {
      type: 'intelligence_report',
      format: 'structured',
      generatedAt: new Date().toISOString(),
      input: { naicsCode, stateCode, countyCode, industry, businessName },
      rawData: {
        cbpData: marketOverview.cbpData,
        fredData: marketOverview.fredData,
        sbaAnalysis,
        benchmarks: benchmarks[0] || null,
        healthIndex,
      },
      ...report,
    };
  } catch (err: any) {
    // Fallback: return structured data without AI analysis
    return {
      type: 'intelligence_report',
      format: 'data_only',
      generatedAt: new Date().toISOString(),
      input: { naicsCode, stateCode, countyCode, industry, businessName },
      rawData: {
        cbpData: marketOverview.cbpData,
        fredData: marketOverview.fredData,
        sbaAnalysis,
        benchmarks: benchmarks[0] || null,
        healthIndex,
      },
      executiveSummary: marketOverview.summary,
      error: `AI analysis unavailable: ${err.message}`,
    };
  }
}
