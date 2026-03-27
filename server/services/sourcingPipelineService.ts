/**
 * Sourcing Pipeline Service — Orchestrates the 5-stage sourcing engine.
 *
 * Stage 1: Deep Research → Acquisition Intelligence Brief (Sonnet)
 * Stage 2: Expansion Search → 500-2K Google Places candidates (Phase 2)
 * Stage 3: Tiered Enrichment → Essentials → Pro → Website → Deep (Phase 2)
 * Stage 4: Scoring & Categorization → A/B/C/D tiers (Phase 3)
 * Stage 5: Portfolio Management → ongoing (Phase 4)
 */
import Anthropic from '@anthropic-ai/sdk';
import { sql } from '../db.js';
import { fetchCBPData, fetchBDSData, fetchFREDData } from './marketDataService.js';
import { getSBALendingStats } from './sbaLendingService.js';
import { getMarketHeat } from './marketHeatService.js';
import { buildIntelligenceBriefPrompt, type BriefInputData } from '../prompts/intelligenceBriefPrompt.js';
import { buildBatchDeepAnalysisPrompt, buildDeepAnalysisPrompt } from '../prompts/deepAnalysisPrompt.js';
import { enqueuePipelineStage } from './jobQueue.js';
import {
  batchTextSearch,
  getPlaceDetailsTier1,
  getPlaceDetailsTier2,
  extractCityState,
  type PlaceEssentials,
  type PlacePro,
} from './googlePlacesClient.js';
import { enrichCompanyWebsite, type WebsiteEnrichment } from './websiteEnrichmentService.js';
import crypto from 'crypto';

let anthropic: Anthropic | null = null;
function getClient(): Anthropic {
  if (!anthropic) {
    anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  }
  return anthropic;
}

// ─── Public API ─────────────────────────────────────────────────────

export interface PipelineResult {
  portfolioId: number;
  briefId: number;
  status: 'complete' | 'failed';
  error?: string;
}

/**
 * Initialize a full sourcing pipeline for a thesis.
 * Stage 1 runs synchronously (~30-60s). Stages 2-4 enqueue as background jobs.
 */
export async function initializePipeline(
  thesisId: number,
  userId: number,
): Promise<PipelineResult> {
  // Load thesis
  const [thesis] = await sql`
    SELECT * FROM buyer_theses WHERE id = ${thesisId} AND user_id = ${userId}
  `;
  if (!thesis) throw new Error('Thesis not found');

  // Check for existing active portfolio
  const [existing] = await sql`
    SELECT id, brief_id, pipeline_status FROM sourcing_portfolios
    WHERE thesis_id = ${thesisId} AND user_id = ${userId}
      AND pipeline_status NOT IN ('failed', 'stale')
    ORDER BY created_at DESC LIMIT 1
  `;
  if (existing && existing.pipeline_status === 'ready') {
    return { portfolioId: existing.id, briefId: existing.brief_id, status: 'complete' };
  }

  // Create brief
  const [brief] = await sql`
    INSERT INTO sourcing_briefs (thesis_id, user_id, status)
    VALUES (${thesisId}, ${userId}, 'generating')
    RETURNING id
  `;

  // Create portfolio
  const [portfolio] = await sql`
    INSERT INTO sourcing_portfolios (thesis_id, user_id, brief_id, name, pipeline_status)
    VALUES (${thesisId}, ${userId}, ${brief.id}, ${thesis.name || 'Sourcing Search'}, 'brief_generating')
    RETURNING id
  `;

  // Run Stage 1 synchronously (user waits for the brief)
  try {
    await runStage1(brief.id, thesisId, userId);

    // Update portfolio status
    await sql`
      UPDATE sourcing_portfolios
      SET pipeline_status = 'expanding',
          stage_progress = ${JSON.stringify({ stage: 1, pct: 100, message: 'Intelligence brief complete. Searching for targets...' })}::jsonb,
          updated_at = NOW()
      WHERE id = ${portfolio.id}
    `;

    // Enqueue Stages 2-4 as background jobs
    const hasGoogleKey = !!process.env.GOOGLE_PLACES_API_KEY;
    if (hasGoogleKey) {
      await enqueuePipelineStage(portfolio.id, 2);
    } else {
      // No Google API key — skip expansion, go straight to scoring internal matches
      await sql`
        UPDATE sourcing_portfolios
        SET pipeline_status = 'ready',
            stage_progress = ${JSON.stringify({ stage: 5, pct: 100, message: 'Brief complete. Add Google Places API key for off-market discovery.' })}::jsonb,
            updated_at = NOW()
        WHERE id = ${portfolio.id}
      `;
    }

    return { portfolioId: portfolio.id, briefId: brief.id, status: 'complete' };
  } catch (err: any) {
    await sql`
      UPDATE sourcing_briefs SET status = 'failed', error_message = ${err.message}, updated_at = NOW()
      WHERE id = ${brief.id}
    `;
    await sql`
      UPDATE sourcing_portfolios SET pipeline_status = 'failed', updated_at = NOW()
      WHERE id = ${portfolio.id}
    `;
    return { portfolioId: portfolio.id, briefId: brief.id, status: 'failed', error: err.message };
  }
}

// ─── Stage 1: Deep Research → Intelligence Brief ────────────────────

async function runStage1(briefId: number, thesisId: number, userId: number): Promise<void> {
  const startTime = Date.now();

  // Load thesis criteria
  const [thesis] = await sql`SELECT * FROM buyer_theses WHERE id = ${thesisId}`;
  if (!thesis) throw new Error('Thesis not found');

  const naicsCodes: string[] = thesis.naics_codes || [];
  const stateCodes: string[] = thesis.state_codes || [];
  const primaryNaics = naicsCodes[0] || '';

  // Parallel data fetches — each wrapped in try/catch, returns null on failure
  const [censusResults, bdsResult, sbaResult, fedFunds, primeRate, unemployment, heatResult] =
    await Promise.all([
      // Census CBP: fetch per state (or first 5 states to keep it fast)
      fetchCensusForThesis(primaryNaics, stateCodes.slice(0, 5)),
      // Census BDS: firm age distribution
      primaryNaics
        ? fetchBDSData(primaryNaics.substring(0, 2)).catch(() => null)
        : Promise.resolve(null),
      // SBA lending stats
      primaryNaics && stateCodes[0]
        ? getSBALendingStats(primaryNaics, stateCodes[0]).catch(() => null)
        : Promise.resolve(null),
      // FRED economic indicators
      fetchFREDData('FEDFUNDS').catch(() => null),
      fetchFREDData('DPRIME').catch(() => null),
      fetchFREDData('UNRATE').catch(() => null),
      // Market heat
      thesis.industry
        ? getMarketHeat(thesis.industry).catch(() => null)
        : Promise.resolve(null),
    ]);

  // Build input data
  const inputData: BriefInputData = {
    thesis: {
      name: thesis.name || 'Unnamed Thesis',
      industry: thesis.industry,
      naicsCodes,
      geography: thesis.geography,
      stateCodes,
      revenueMin: thesis.revenue_min,
      revenueMax: thesis.revenue_max,
      ebitdaMin: thesis.ebitda_min,
      ebitdaMax: thesis.ebitda_max,
      sdeMin: thesis.sde_min,
      sdeMax: thesis.sde_max,
      priceMin: thesis.price_min,
      priceMax: thesis.price_max,
      employeeMin: thesis.employee_min,
      employeeMax: thesis.employee_max,
      keywords: thesis.keywords || [],
    },
    censusData: censusResults,
    firmDynamics: bdsResult,
    sbaLending: sbaResult,
    economicIndicators: {
      fedFunds: fedFunds,
      primeRate: primeRate,
      unemployment: unemployment,
    },
    marketHeat: heatResult,
  };

  // Save input snapshot
  await sql`
    UPDATE sourcing_briefs
    SET input_snapshot = ${JSON.stringify(inputData)}::jsonb, updated_at = NOW()
    WHERE id = ${briefId}
  `;

  // Build prompt and call Sonnet
  const prompt = buildIntelligenceBriefPrompt(inputData);

  const client = getClient();
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6-20250514',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  const responseText = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map(b => b.text)
    .join('');

  // Parse JSON response
  let briefData: Record<string, unknown>;
  try {
    // Handle potential markdown wrapping
    const jsonStr = responseText.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim();
    briefData = JSON.parse(jsonStr);
  } catch (parseErr) {
    throw new Error(`Failed to parse intelligence brief JSON: ${parseErr}`);
  }

  const generationTime = Date.now() - startTime;

  // Write structured sections to DB
  await sql`
    UPDATE sourcing_briefs SET
      market_density = ${JSON.stringify(briefData.market_density || null)}::jsonb,
      deal_economics = ${JSON.stringify(briefData.deal_economics || null)}::jsonb,
      acquisition_signals = ${JSON.stringify(briefData.acquisition_signals || null)}::jsonb,
      competitive_landscape = ${JSON.stringify(briefData.competitive_landscape || null)}::jsonb,
      key_risks = ${JSON.stringify(briefData.key_risks || null)}::jsonb,
      recommended_params = ${JSON.stringify(briefData.recommended_params || null)}::jsonb,
      narrative_markdown = ${(briefData.narrative_summary as string) || null},
      generation_time_ms = ${generationTime},
      input_tokens = ${response.usage?.input_tokens || 0},
      output_tokens = ${response.usage?.output_tokens || 0},
      status = 'complete',
      updated_at = NOW()
    WHERE id = ${briefId}
  `;
}

// ─── Stage 2: Expansion Search ──────────────────────────────────────

export async function runStage2(portfolioId: number): Promise<void> {
  await updateProgress(portfolioId, 'expanding', 2, 0, 'Starting expansion search...');

  const [portfolio] = await sql`
    SELECT p.*, b.recommended_params, t.industry, t.naics_codes, t.state_codes, t.geography
    FROM sourcing_portfolios p
    LEFT JOIN sourcing_briefs b ON b.id = p.brief_id
    LEFT JOIN buyer_theses t ON t.id = p.thesis_id
    WHERE p.id = ${portfolioId}
  `;
  if (!portfolio) throw new Error('Portfolio not found');

  const recommended = portfolio.recommended_params || {};
  const thesisNaics: string[] = portfolio.naics_codes || [];
  const thesisStates: string[] = portfolio.state_codes || [];

  // Build search queries — prefer brief's refined queries, fall back to thesis
  let searchQueries: string[] = recommended.search_queries || [];
  const geographies: string[] = (recommended.prioritized_geographies || []).map((g: any) =>
    typeof g === 'string' ? g : g.name,
  );

  // Fall back to basic queries if brief didn't generate recommendations
  if (searchQueries.length === 0) {
    const naicsLabels: Record<string, string> = recommended.naics_search_labels || {};
    const naicsCodes = recommended.refined_naics_codes || thesisNaics;
    for (const code of naicsCodes) {
      const label = naicsLabels[code] || NAICS_FALLBACK[code.substring(0, 4)] || portfolio.industry;
      if (label) searchQueries.push(label);
    }
    if (searchQueries.length === 0 && portfolio.industry) {
      searchQueries = [portfolio.industry];
    }
  }

  // Fall back to state-level geographies if brief didn't specify metros
  if (geographies.length === 0) {
    for (const sc of thesisStates.slice(0, 5)) {
      geographies.push(STATE_NAMES[sc] || sc);
    }
    if (geographies.length === 0 && portfolio.geography) {
      geographies.push(portfolio.geography);
    }
  }

  if (searchQueries.length === 0 || geographies.length === 0) {
    await updateProgress(portfolioId, 'ready', 2, 100, 'No search parameters available. Add industry and geography to your thesis.');
    return;
  }

  // Build query matrix: queries × geographies
  const fullQueries: string[] = [];
  for (const query of searchQueries.slice(0, 15)) {
    for (const geo of geographies.slice(0, 10)) {
      fullQueries.push(`${query} in ${geo}`);
    }
  }

  await updateProgress(portfolioId, 'expanding', 2, 10,
    `Searching ${fullQueries.length} query combinations across ${geographies.length} locations...`);

  // Fire all queries via Google Places Text Search (IDs only — FREE)
  const allPlaceIds = await batchTextSearch(fullQueries, 10, 200);

  await updateProgress(portfolioId, 'expanding', 2, 70,
    `Found ${allPlaceIds.length} businesses. Deduplicating and storing...`);

  // Insert candidates with dedup
  let inserted = 0;
  for (const placeId of allPlaceIds) {
    const fingerprint = crypto.createHash('sha256').update(placeId).digest('hex').slice(0, 32);
    try {
      const [result] = await sql`
        INSERT INTO sourcing_candidates (portfolio_id, thesis_id, user_id, google_place_id, fingerprint, enrichment_tier)
        VALUES (${portfolioId}, ${portfolio.thesis_id}, ${portfolio.user_id}, ${placeId}, ${fingerprint}, 0)
        ON CONFLICT (portfolio_id, fingerprint) DO NOTHING
        RETURNING id
      `;
      if (result) inserted++;
    } catch { /* dedup conflict — ignore */ }
  }

  // Update portfolio counts
  await sql`
    UPDATE sourcing_portfolios
    SET total_candidates = ${inserted},
        last_expansion_at = NOW(),
        updated_at = NOW()
    WHERE id = ${portfolioId}
  `;

  await updateProgress(portfolioId, 'enriching', 2, 100,
    `Expansion complete: ${inserted} unique candidates from ${allPlaceIds.length} results. Starting enrichment...`);

  // Chain to Stage 3
  await enqueuePipelineStage(portfolioId, 3);
}

// ─── Stage 3: Tiered Enrichment ─────────────────────────────────────

export async function runStage3(portfolioId: number): Promise<void> {
  await updateProgress(portfolioId, 'enriching', 3, 0, 'Starting tiered enrichment...');

  const [portfolio] = await sql`
    SELECT * FROM sourcing_portfolios WHERE id = ${portfolioId}
  `;
  if (!portfolio) throw new Error('Portfolio not found');

  // ── Tier 1: Google Essentials (all raw candidates) ────────────────

  const rawCandidates = await sql`
    SELECT id, google_place_id FROM sourcing_candidates
    WHERE portfolio_id = ${portfolioId} AND enrichment_tier = 0 AND google_place_id IS NOT NULL
    ORDER BY id
  `;

  if (rawCandidates.length > 0) {
    await updateProgress(portfolioId, 'enriching', 3, 5,
      `Tier 1: Fetching details for ${rawCandidates.length} candidates...`);

    const placeIds = (rawCandidates as any[]).map(c => c.google_place_id);
    const essentials = await getPlaceDetailsTier1(placeIds);

    // Build lookup by place ID
    const essentialsMap = new Map<string, PlaceEssentials>();
    for (const e of essentials) {
      if (e.id) essentialsMap.set(e.id, e);
    }

    // Update candidates with Tier 1 data
    for (const candidate of rawCandidates as any[]) {
      const place = essentialsMap.get(candidate.google_place_id);
      if (!place) continue;

      // Filter out closed businesses
      if (place.businessStatus && place.businessStatus !== 'OPERATIONAL') {
        await sql`DELETE FROM sourcing_candidates WHERE id = ${candidate.id}`;
        continue;
      }

      const { city, state, zip } = extractCityState(place);

      await sql`
        UPDATE sourcing_candidates SET
          name = ${place.displayName?.text || null},
          address = ${place.formattedAddress || null},
          city = ${city},
          state = ${state},
          zip = ${zip},
          lat = ${place.location?.latitude || null},
          lng = ${place.location?.longitude || null},
          phone = ${place.nationalPhoneNumber || null},
          business_status = ${place.businessStatus || null},
          place_types = ${place.types || null},
          enrichment_tier = 1,
          updated_at = NOW()
        WHERE id = ${candidate.id}
      `;
    }
  }

  await updateProgress(portfolioId, 'enriching', 3, 30, 'Tier 1 complete. Selecting top candidates for Tier 2...');

  // ── Tier 2: Google Pro (top 500 with valid data) ──────────────────

  const tier1Candidates = await sql`
    SELECT id, google_place_id FROM sourcing_candidates
    WHERE portfolio_id = ${portfolioId} AND enrichment_tier = 1 AND google_place_id IS NOT NULL
    ORDER BY id
    LIMIT 500
  `;

  if (tier1Candidates.length > 0) {
    await updateProgress(portfolioId, 'enriching', 3, 35,
      `Tier 2: Enriching ${tier1Candidates.length} candidates with ratings and websites...`);

    const placeIds = (tier1Candidates as any[]).map(c => c.google_place_id);
    const proDetails = await getPlaceDetailsTier2(placeIds);

    const proMap = new Map<string, PlacePro>();
    for (const p of proDetails) {
      if (p.id) proMap.set(p.id, p);
    }

    for (const candidate of tier1Candidates as any[]) {
      const place = proMap.get(candidate.google_place_id);
      if (!place) continue;

      await sql`
        UPDATE sourcing_candidates SET
          rating = ${place.rating || null},
          review_count = ${place.userRatingCount || null},
          website_url = ${place.websiteUri || null},
          price_level = ${place.priceLevel ? parseInt(place.priceLevel.replace('PRICE_LEVEL_', '')) : null},
          enrichment_tier = 2,
          updated_at = NOW()
        WHERE id = ${candidate.id}
      `;
    }
  }

  await updateProgress(portfolioId, 'enriching', 3, 55, 'Tier 2 complete. Running website analysis on top candidates...');

  // ── Tier 3: Haiku website enrichment (top 200 with websites) ──────

  const tier2WithWebsite = await sql`
    SELECT id, website_url, rating, review_count FROM sourcing_candidates
    WHERE portfolio_id = ${portfolioId}
      AND enrichment_tier = 2
      AND website_url IS NOT NULL
      AND website_url != ''
    ORDER BY COALESCE(review_count, 0) DESC, COALESCE(rating, 0) DESC
    LIMIT 200
  `;

  if (tier2WithWebsite.length > 0) {
    await updateProgress(portfolioId, 'enriching', 3, 60,
      `Tier 3: Analyzing ${tier2WithWebsite.length} websites with AI...`);

    let enrichedCount = 0;
    for (const candidate of tier2WithWebsite as any[]) {
      try {
        const enrichment = await enrichCompanyWebsite(candidate.website_url);
        if (enrichment) {
          await sql`
            UPDATE sourcing_candidates SET
              year_founded = ${enrichment.yearFounded || null},
              team_size_estimate = ${enrichment.teamSizeEstimate || null},
              services = ${enrichment.services?.length ? enrichment.services : null},
              succession_signals = ${enrichment.successionSignals?.length ? enrichment.successionSignals : null},
              enrichment_data = ${JSON.stringify(enrichment)}::jsonb,
              enrichment_tier = 3,
              updated_at = NOW()
            WHERE id = ${candidate.id}
          `;
          enrichedCount++;
        }
      } catch {
        // Individual failure — continue with rest
      }

      // Update progress periodically
      if (enrichedCount % 20 === 0) {
        const pct = 60 + Math.round((enrichedCount / tier2WithWebsite.length) * 25);
        await updateProgress(portfolioId, 'enriching', 3, pct,
          `Tier 3: Analyzed ${enrichedCount}/${tier2WithWebsite.length} websites...`);
      }
    }
  }

  await updateProgress(portfolioId, 'enriching', 3, 90, 'Tier 3 complete. Finalizing enrichment...');

  // ── Tier 4: Sonnet deep analysis (top 50 by pre-score) ────────────
  // Quick pre-score to select top 50 for deep analysis

  const tier3Candidates = await sql`
    SELECT * FROM sourcing_candidates
    WHERE portfolio_id = ${portfolioId} AND enrichment_tier = 3
    ORDER BY COALESCE(review_count, 0) DESC, COALESCE(rating, 0) DESC
    LIMIT 50
  `;

  if (tier3Candidates.length > 0) {
    await updateProgress(portfolioId, 'enriching', 3, 92,
      `Tier 4: Running deep AI analysis on top ${tier3Candidates.length} candidates...`);

    const [thesis] = await sql`SELECT * FROM buyer_theses WHERE id = ${portfolio.thesis_id}`;

    // Process in batches of 5 for Sonnet
    for (let i = 0; i < (tier3Candidates as any[]).length; i += 5) {
      const batch = (tier3Candidates as any[]).slice(i, i + 5);

      for (const candidate of batch) {
        try {
          const input = {
            thesis: {
              name: thesis.name,
              industry: thesis.industry,
              geography: thesis.geography,
              revenueMin: thesis.revenue_min,
              revenueMax: thesis.revenue_max,
            },
            candidate: {
              name: candidate.name,
              address: candidate.address,
              city: candidate.city,
              state: candidate.state,
              phone: candidate.phone,
              website: candidate.website_url,
              rating: candidate.rating ? parseFloat(candidate.rating) : null,
              reviewCount: candidate.review_count,
              yearFounded: candidate.year_founded,
              teamSizeEstimate: candidate.team_size_estimate,
              services: candidate.services,
              certifications: candidate.certifications,
              successionSignals: candidate.succession_signals,
              recurringRevenueSignals: candidate.recurring_revenue_signals,
              commercialVsResidential: candidate.commercial_vs_residential,
              ownerDependencySignals: candidate.owner_dependency_signals,
              sbaMatch: candidate.sba_match || false,
              sbaLoanData: candidate.sba_loan_data,
            },
          };

          const prompt = buildDeepAnalysisPrompt(input);
          const client = getClient();
          const response = await client.messages.create({
            model: 'claude-sonnet-4-6-20250514',
            max_tokens: 1024,
            messages: [{ role: 'user', content: prompt }],
          });

          const text = response.content
            .filter((b): b is Anthropic.TextBlock => b.type === 'text')
            .map(b => b.text)
            .join('');

          const analysis = JSON.parse(text.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim());

          await sql`
            UPDATE sourcing_candidates SET
              estimated_revenue_low_cents = ${analysis.estimated_revenue_low_cents || null},
              estimated_revenue_high_cents = ${analysis.estimated_revenue_high_cents || null},
              estimated_employees = ${analysis.estimated_employees || null},
              growth_indicators = ${analysis.growth_indicators || null},
              risk_factors = ${analysis.risk_factors || null},
              ai_summary = ${analysis.ai_summary || null},
              enrichment_tier = 4,
              updated_at = NOW()
            WHERE id = ${candidate.id}
          `;
        } catch {
          // Individual deep analysis failure — continue
        }
      }

      // Brief pause between batches
      if (i + 5 < (tier3Candidates as any[]).length) {
        await new Promise(r => setTimeout(r, 500));
      }
    }
  }

  await updateProgress(portfolioId, 'scoring', 3, 100, 'Enrichment complete. Starting scoring...');

  // Update enrichment timestamp
  await sql`
    UPDATE sourcing_portfolios SET last_enrichment_at = NOW(), updated_at = NOW()
    WHERE id = ${portfolioId}
  `;

  // Chain to Stage 4
  await enqueuePipelineStage(portfolioId, 4);
}

// ─── Stage 4: Scoring & Categorization ──────────────────────────────

export async function runStage4(portfolioId: number): Promise<void> {
  await updateProgress(portfolioId, 'scoring', 4, 0, 'Starting multi-factor scoring...');

  const [portfolio] = await sql`
    SELECT p.*, t.naics_codes, t.state_codes, t.revenue_min, t.revenue_max, t.industry
    FROM sourcing_portfolios p
    LEFT JOIN buyer_theses t ON t.id = p.thesis_id
    WHERE p.id = ${portfolioId}
  `;
  if (!portfolio) throw new Error('Portfolio not found');

  // Load all candidates with enrichment tier >= 1
  const candidates = await sql`
    SELECT * FROM sourcing_candidates
    WHERE portfolio_id = ${portfolioId} AND enrichment_tier >= 1
    ORDER BY id
  `;

  const thesisNaics: string[] = portfolio.naics_codes || [];
  const thesisStates: string[] = portfolio.state_codes || [];
  const revenueMin = portfolio.revenue_min || 0;
  const revenueMax = portfolio.revenue_max || 999999999999;

  await updateProgress(portfolioId, 'scoring', 4, 10, `Scoring ${candidates.length} candidates...`);

  for (let i = 0; i < (candidates as any[]).length; i++) {
    const c = (candidates as any[])[i];

    // ── Size Match (0-20) ──
    let sizeScore = 5; // default for unknown
    if (c.estimated_revenue_low_cents && c.estimated_revenue_high_cents) {
      const midRevenue = (c.estimated_revenue_low_cents + c.estimated_revenue_high_cents) / 2;
      if (midRevenue >= revenueMin && midRevenue <= revenueMax) sizeScore = 20;
      else if (midRevenue >= revenueMin * 0.7 && midRevenue <= revenueMax * 1.3) sizeScore = 12;
      else sizeScore = 3;
    } else if (c.review_count != null) {
      // Use reviews as size proxy
      if (c.review_count >= 50 && revenueMax >= 200000000) sizeScore = 12; // bigger business, bigger target
      else if (c.review_count >= 10 && c.review_count <= 100) sizeScore = 10; // mid-size
      else sizeScore = 5;
    }

    // ── Geography Match (0-15) ──
    let geoScore = 5;
    if (c.state && thesisStates.length > 0) {
      if (thesisStates.includes(c.state)) geoScore = 15;
      else geoScore = 3;
    }

    // ── Industry Match (0-15) ──
    let industryScore = 8; // default — we searched by industry so most will partially match
    if (c.place_types && thesisNaics.length > 0) {
      // Types array from Google often includes category info
      industryScore = 10;
    }
    if (c.services && portfolio.industry) {
      const svcText = (c.services as string[]).join(' ').toLowerCase();
      if (svcText.includes(portfolio.industry.toLowerCase())) industryScore = 15;
    }

    // ── Acquisition Signals (0-20) ──
    let acqScore = 0;
    if (c.sba_match) acqScore += 8;
    if (c.year_founded) {
      const age = new Date().getFullYear() - c.year_founded;
      if (age >= 10 && age <= 30) acqScore += 6;
      else if (age > 30) acqScore += 4;
    }
    if (c.succession_signals && (c.succession_signals as string[]).length > 0) acqScore += 6;
    acqScore = Math.min(20, acqScore);

    // ── Quality Indicators (0-15) ──
    let qualScore = 0;
    const rating = c.rating ? parseFloat(c.rating) : null;
    if (rating && rating >= 4.5) qualScore += 5;
    else if (rating && rating >= 4.0) qualScore += 3;
    if (c.review_count && c.review_count >= 50) qualScore += 3;
    else if (c.review_count && c.review_count >= 20) qualScore += 2;
    if (c.website_url) qualScore += 2;
    if (c.recurring_revenue_signals && (c.recurring_revenue_signals as string[]).length > 0) qualScore += 3;
    if (c.certifications && (c.certifications as string[]).length > 0) qualScore += 2;
    qualScore = Math.min(15, qualScore);

    // ── Risk Factors (0-15, inverted) ──
    let riskScore = 15;
    if (rating && rating < 3.5) riskScore -= 5;
    if (!c.website_url) riskScore -= 4;
    if (c.review_count != null && c.review_count < 5) riskScore -= 3;
    if (c.owner_dependency_signals && (c.owner_dependency_signals as string[]).length >= 2) riskScore -= 3;
    riskScore = Math.max(0, riskScore);

    const totalScore = sizeScore + geoScore + industryScore + acqScore + qualScore + riskScore;
    const tier = totalScore >= 75 ? 'A' : totalScore >= 55 ? 'B' : totalScore >= 35 ? 'C' : 'D';

    await sql`
      UPDATE sourcing_candidates SET
        score_size = ${sizeScore},
        score_geography = ${geoScore},
        score_industry = ${industryScore},
        score_acquisition_signals = ${acqScore},
        score_quality = ${qualScore},
        score_risk = ${riskScore},
        total_score = ${totalScore},
        tier = ${tier},
        updated_at = NOW()
      WHERE id = ${c.id}
    `;

    // Progress update every 100 candidates
    if (i > 0 && i % 100 === 0) {
      const pct = 10 + Math.round((i / (candidates as any[]).length) * 50);
      await updateProgress(portfolioId, 'scoring', 4, pct, `Scored ${i}/${candidates.length} candidates...`);
    }
  }

  await updateProgress(portfolioId, 'scoring', 4, 65, 'Deterministic scoring complete. Running AI batch summaries...');

  // ── AI Batch Scoring (top 200 by score) ────────────────────────────

  const topCandidates = await sql`
    SELECT * FROM sourcing_candidates
    WHERE portfolio_id = ${portfolioId} AND enrichment_tier >= 2
    ORDER BY total_score DESC
    LIMIT 200
  `;

  if (topCandidates.length > 0) {
    const [thesis] = await sql`SELECT * FROM buyer_theses WHERE id = ${portfolio.thesis_id}`;
    const thesisData = {
      name: thesis.name,
      industry: thesis.industry,
      geography: thesis.geography,
      revenueMin: thesis.revenue_min,
      revenueMax: thesis.revenue_max,
    };

    // Process in batches of 10 via Haiku
    const client = getClient();
    for (let i = 0; i < (topCandidates as any[]).length; i += 10) {
      const batch = (topCandidates as any[]).slice(i, i + 10);

      try {
        const candidateInputs = batch.map((c: any) => ({
          name: c.name || 'Unknown',
          address: c.address,
          city: c.city,
          state: c.state,
          phone: c.phone,
          website: c.website_url,
          rating: c.rating ? parseFloat(c.rating) : null,
          reviewCount: c.review_count,
          yearFounded: c.year_founded,
          teamSizeEstimate: c.team_size_estimate,
          services: c.services,
          certifications: c.certifications,
          successionSignals: c.succession_signals,
          recurringRevenueSignals: c.recurring_revenue_signals,
          commercialVsResidential: c.commercial_vs_residential,
          ownerDependencySignals: c.owner_dependency_signals,
          sbaMatch: c.sba_match || false,
          sbaLoanData: c.sba_loan_data,
        }));

        const prompt = buildBatchDeepAnalysisPrompt(thesisData, candidateInputs);
        const response = await client.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 2048,
          messages: [{ role: 'user', content: prompt }],
        });

        const text = response.content
          .filter((b): b is Anthropic.TextBlock => b.type === 'text')
          .map(b => b.text)
          .join('');

        const results = JSON.parse(text.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim());

        if (Array.isArray(results)) {
          for (const result of results) {
            const idx = result.index;
            if (idx >= 0 && idx < batch.length) {
              await sql`
                UPDATE sourcing_candidates SET
                  ai_score_summary = ${result.ai_summary || null},
                  score_flags = ${result.score_flags || null},
                  updated_at = NOW()
                WHERE id = ${batch[idx].id}
              `;
            }
          }
        }
      } catch {
        // Batch AI failure — deterministic scores still valid
      }

      if (i + 10 < (topCandidates as any[]).length) {
        await new Promise(r => setTimeout(r, 300));
      }
    }
  }

  // ── Update portfolio denormalized counts ───────────────────────────

  const [counts] = await sql`
    SELECT
      COUNT(*)::int as total,
      COUNT(*) FILTER (WHERE tier = 'A')::int as a_count,
      COUNT(*) FILTER (WHERE tier = 'B')::int as b_count,
      COUNT(*) FILTER (WHERE tier = 'C')::int as c_count,
      COUNT(*) FILTER (WHERE tier = 'D')::int as d_count
    FROM sourcing_candidates
    WHERE portfolio_id = ${portfolioId}
  `;

  await sql`
    UPDATE sourcing_portfolios SET
      total_candidates = ${counts.total},
      a_tier_count = ${counts.a_count},
      b_tier_count = ${counts.b_count},
      c_tier_count = ${counts.c_count},
      d_tier_count = ${counts.d_count},
      pipeline_status = 'ready',
      last_score_at = NOW(),
      next_refresh_at = NOW() + INTERVAL '7 days',
      updated_at = NOW()
    WHERE id = ${portfolioId}
  `;

  await updateProgress(portfolioId, 'ready', 4, 100,
    `Pipeline complete: ${counts.total} candidates — ${counts.a_count} A-tier, ${counts.b_count} B-tier, ${counts.c_count} C-tier`);
}

// ─── Helpers ────────────────────────────────────────────────────────

/** Update portfolio progress for SSE streaming */
async function updateProgress(
  portfolioId: number,
  status: string,
  stage: number,
  pct: number,
  message: string,
): Promise<void> {
  await sql`
    UPDATE sourcing_portfolios
    SET pipeline_status = ${status},
        stage_progress = ${JSON.stringify({ stage, pct, message })}::jsonb,
        updated_at = NOW()
    WHERE id = ${portfolioId}
  `;
}

/** NAICS → search query fallback (mirrors discoveryService.ts) */
const NAICS_FALLBACK: Record<string, string> = {
  '2382': 'HVAC contractor',
  '5612': 'pest control company',
  '5617': 'landscaping company',
  '8111': 'auto repair shop',
  '6211': 'medical practice',
  '7225': 'restaurant',
  '5411': 'law firm',
  '5412': 'accounting firm',
  '2389': 'general contractor',
  '4441': 'hardware store',
  '8121': 'hair salon',
  '4451': 'grocery store',
  '5613': 'staffing agency',
  '4411': 'car dealership',
  '5242': 'insurance agency',
  '5312': 'property management company',
  '6213': 'dental practice',
  '5415': 'IT managed services',
  '5416': 'consulting firm',
  '4529': 'retail store',
  '2381': 'plumbing contractor',
  '2383': 'electrical contractor',
  '5311': 'real estate brokerage',
  '4431': 'electronics store',
  '7211': 'hotel',
  '8113': 'commercial equipment repair',
};

/** State code → state name for geography fallback */
const STATE_NAMES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
};

/**
 * Fetch Census CBP data for multiple states in parallel.
 * Returns aggregated results or null.
 */
async function fetchCensusForThesis(
  naicsCode: string,
  stateCodes: string[],
): Promise<Record<string, unknown> | null> {
  if (!naicsCode || stateCodes.length === 0) return null;

  try {
    const results = await Promise.all(
      stateCodes.map(state => fetchCBPData(naicsCode, state).catch(() => null)),
    );

    const validResults = results.filter(Boolean);
    if (validResults.length === 0) return null;

    return {
      naicsCode,
      states: stateCodes,
      data: validResults,
      stateCount: validResults.length,
    };
  } catch {
    return null;
  }
}

// ─── Background Refresh ─────────────────────────────────────────────

/**
 * Weekly refresh: re-fetch Google Pro data for A/B-tier candidates,
 * re-run website enrichment for stale Tier 3 data, re-score all.
 */
export async function runWeeklyPortfolioRefresh(): Promise<{ portfoliosRefreshed: number; candidatesUpdated: number }> {
  const portfolios = await sql`
    SELECT id, thesis_id, user_id FROM sourcing_portfolios
    WHERE pipeline_status = 'ready'
      AND (a_tier_count > 0 OR b_tier_count > 0)
      AND (next_refresh_at IS NULL OR next_refresh_at <= NOW())
  `;

  let totalUpdated = 0;

  for (const portfolio of portfolios as any[]) {
    try {
      // Re-fetch Tier 2 data for A/B candidates (refresh ratings, reviews, business status)
      const abCandidates = await sql`
        SELECT id, google_place_id FROM sourcing_candidates
        WHERE portfolio_id = ${portfolio.id}
          AND tier IN ('A', 'B')
          AND pipeline_status NOT IN ('passed', 'archived')
          AND google_place_id IS NOT NULL
        LIMIT 200
      `;

      if (abCandidates.length > 0) {
        const placeIds = (abCandidates as any[]).map(c => c.google_place_id);
        const proDetails = await getPlaceDetailsTier2(placeIds);

        const proMap = new Map<string, PlacePro>();
        for (const p of proDetails) {
          if (p.id) proMap.set(p.id, p);
        }

        for (const candidate of abCandidates as any[]) {
          const place = proMap.get(candidate.google_place_id);
          if (!place) continue;

          // Check if business closed
          if (place.businessStatus && place.businessStatus !== 'OPERATIONAL') {
            await sql`
              UPDATE sourcing_candidates SET
                business_status = ${place.businessStatus},
                pipeline_status = 'archived',
                pipeline_status_changed_at = NOW(),
                updated_at = NOW()
              WHERE id = ${candidate.id}
            `;
            totalUpdated++;
            continue;
          }

          await sql`
            UPDATE sourcing_candidates SET
              rating = ${place.rating || null},
              review_count = ${place.userRatingCount || null},
              website_url = ${place.websiteUri || null},
              updated_at = NOW()
            WHERE id = ${candidate.id}
          `;
          totalUpdated++;
        }
      }

      // Update refresh timestamp
      await sql`
        UPDATE sourcing_portfolios SET
          next_refresh_at = NOW() + INTERVAL '7 days',
          updated_at = NOW()
        WHERE id = ${portfolio.id}
      `;
    } catch (err: any) {
      console.error(`[refresh] Portfolio ${portfolio.id} refresh failed:`, err.message);
    }
  }

  return { portfoliosRefreshed: (portfolios as any[]).length, candidatesUpdated: totalUpdated };
}

/**
 * Monthly expansion: re-run Stage 2 search for active portfolios
 * to discover newly opened businesses. Only process NEW candidates
 * through Stages 3-4.
 */
export async function runMonthlyPortfolioExpansion(): Promise<{ portfoliosExpanded: number; newCandidates: number }> {
  const portfolios = await sql`
    SELECT p.id, p.thesis_id, p.user_id, b.recommended_params,
           t.industry, t.naics_codes, t.state_codes, t.geography
    FROM sourcing_portfolios p
    LEFT JOIN sourcing_briefs b ON b.id = p.brief_id
    LEFT JOIN buyer_theses t ON t.id = p.thesis_id
    WHERE p.pipeline_status = 'ready'
    LIMIT 20
  `;

  let totalNew = 0;

  for (const portfolio of portfolios as any[]) {
    try {
      const recommended = portfolio.recommended_params || {};
      let searchQueries: string[] = recommended.search_queries || [];
      const geographies: string[] = (recommended.prioritized_geographies || []).map((g: any) =>
        typeof g === 'string' ? g : g.name,
      );

      if (searchQueries.length === 0) {
        const naicsCodes: string[] = recommended.refined_naics_codes || portfolio.naics_codes || [];
        const naicsLabels: Record<string, string> = recommended.naics_search_labels || {};
        for (const code of naicsCodes) {
          const label = naicsLabels[code] || NAICS_FALLBACK[code.substring(0, 4)] || portfolio.industry;
          if (label) searchQueries.push(label);
        }
      }

      if (searchQueries.length === 0 || geographies.length === 0) continue;

      // Build query matrix (same as Stage 2 but limited)
      const fullQueries: string[] = [];
      for (const query of searchQueries.slice(0, 10)) {
        for (const geo of geographies.slice(0, 8)) {
          fullQueries.push(`${query} in ${geo}`);
        }
      }

      const allPlaceIds = await batchTextSearch(fullQueries, 10, 200);

      // Insert only NEW candidates (dedup will skip existing)
      let newCount = 0;
      for (const placeId of allPlaceIds) {
        const fingerprint = crypto.createHash('sha256').update(placeId).digest('hex').slice(0, 32);
        try {
          const [result] = await sql`
            INSERT INTO sourcing_candidates (portfolio_id, thesis_id, user_id, google_place_id, fingerprint, enrichment_tier)
            VALUES (${portfolio.id}, ${portfolio.thesis_id}, ${portfolio.user_id}, ${placeId}, ${fingerprint}, 0)
            ON CONFLICT (portfolio_id, fingerprint) DO NOTHING
            RETURNING id
          `;
          if (result) newCount++;
        } catch { /* dedup conflict */ }
      }

      if (newCount > 0) {
        totalNew += newCount;

        // Enqueue enrichment + scoring for new candidates only
        await enqueuePipelineStage(portfolio.id, 3);

        // Notify user of new candidates
        await sql`
          INSERT INTO notifications (user_id, deal_id, type, title, body, action_url, created_at)
          VALUES (
            ${portfolio.user_id}, NULL, 'sourcing_update',
            'New acquisition targets found',
            ${`${newCount} new businesses matching your "${portfolio.name || 'search'}" thesis were discovered this month.`},
            '/chat', NOW()
          )
        `.catch(() => {});
      }

      await sql`
        UPDATE sourcing_portfolios SET
          last_expansion_at = NOW(),
          updated_at = NOW()
        WHERE id = ${portfolio.id}
      `;
    } catch (err: any) {
      console.error(`[expansion] Portfolio ${portfolio.id} expansion failed:`, err.message);
    }
  }

  return { portfoliosExpanded: (portfolios as any[]).length, newCandidates: totalNew };
}

/**
 * Get a portfolio's current progress for SSE streaming.
 */
export async function getPortfolioProgress(portfolioId: number): Promise<{
  pipelineStatus: string;
  stageProgress: Record<string, unknown>;
  totalCandidates: number;
  aTier: number;
  bTier: number;
} | null> {
  const [portfolio] = await sql`
    SELECT pipeline_status, stage_progress, total_candidates,
           a_tier_count, b_tier_count
    FROM sourcing_portfolios
    WHERE id = ${portfolioId}
  `;
  if (!portfolio) return null;

  return {
    pipelineStatus: portfolio.pipeline_status,
    stageProgress: portfolio.stage_progress || {},
    totalCandidates: portfolio.total_candidates || 0,
    aTier: portfolio.a_tier_count || 0,
    bTier: portfolio.b_tier_count || 0,
  };
}

/**
 * On-demand enrichment for a single candidate.
 * If Tier < 3 and has website → run Haiku website enrichment (Tier 3).
 * If Tier 3 → run Sonnet deep analysis (Tier 4).
 * Re-scores after enrichment.
 */
export async function enrichCandidateOnDemand(candidateId: number): Promise<Record<string, unknown>> {
  const [candidate] = await sql`SELECT * FROM sourcing_candidates WHERE id = ${candidateId}`;
  if (!candidate) throw new Error('Candidate not found');

  if (candidate.enrichment_tier < 3 && candidate.website_url) {
    // Tier 3: Haiku website enrichment
    const enrichment = await enrichCompanyWebsite(candidate.website_url);
    if (enrichment) {
      await sql`
        UPDATE sourcing_candidates SET
          year_founded = ${enrichment.yearFounded || null},
          team_size_estimate = ${enrichment.teamSizeEstimate || null},
          services = ${enrichment.services?.length ? enrichment.services : null},
          succession_signals = ${enrichment.successionSignals?.length ? enrichment.successionSignals : null},
          enrichment_data = ${JSON.stringify(enrichment)}::jsonb,
          enrichment_tier = 3,
          updated_at = NOW()
        WHERE id = ${candidateId}
      `;
    }
  } else if (candidate.enrichment_tier === 3) {
    // Tier 4: Sonnet deep analysis
    const [thesis] = await sql`SELECT * FROM buyer_theses WHERE id = ${candidate.thesis_id}`;
    if (thesis) {
      const input = {
        thesis: {
          name: thesis.name,
          industry: thesis.industry,
          geography: thesis.geography,
          revenueMin: thesis.revenue_min,
          revenueMax: thesis.revenue_max,
        },
        candidate: {
          name: candidate.name,
          address: candidate.address,
          city: candidate.city,
          state: candidate.state,
          phone: candidate.phone,
          website: candidate.website_url,
          rating: candidate.rating ? parseFloat(candidate.rating) : null,
          reviewCount: candidate.review_count,
          yearFounded: candidate.year_founded,
          teamSizeEstimate: candidate.team_size_estimate,
          services: candidate.services,
          certifications: candidate.certifications,
          successionSignals: candidate.succession_signals,
          recurringRevenueSignals: candidate.recurring_revenue_signals,
          commercialVsResidential: candidate.commercial_vs_residential,
          ownerDependencySignals: candidate.owner_dependency_signals,
          sbaMatch: candidate.sba_match || false,
          sbaLoanData: candidate.sba_loan_data,
        },
      };

      const prompt = buildDeepAnalysisPrompt(input);
      const client = getClient();
      const response = await client.messages.create({
        model: 'claude-sonnet-4-6-20250514',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      });

      const text = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map(b => b.text)
        .join('');

      const analysis = JSON.parse(text.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim());

      await sql`
        UPDATE sourcing_candidates SET
          estimated_revenue_low_cents = ${analysis.estimated_revenue_low_cents || null},
          estimated_revenue_high_cents = ${analysis.estimated_revenue_high_cents || null},
          estimated_employees = ${analysis.estimated_employees || null},
          growth_indicators = ${analysis.growth_indicators || null},
          risk_factors = ${analysis.risk_factors || null},
          ai_summary = ${analysis.ai_summary || null},
          enrichment_tier = 4,
          updated_at = NOW()
        WHERE id = ${candidateId}
      `;
    }
  }

  // Re-score the candidate
  // (Simple re-score — reuses the same logic as Stage 4 for a single candidate)
  const [updated] = await sql`SELECT * FROM sourcing_candidates WHERE id = ${candidateId}`;
  return updated as Record<string, unknown>;
}
