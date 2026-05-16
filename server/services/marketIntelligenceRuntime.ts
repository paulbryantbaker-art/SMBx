import { sql } from '../db.js';
import { fetchBDSData, fetchCBPData, fetchFREDData } from './marketDataService.js';
import { getMarketHeat } from './marketHeatService.js';
import { getSBALendingStats } from './sbaLendingService.js';
import type { AnalysisEvidenceRef, AnalysisOutput } from './deterministicAnalysisEngine.js';

type SourceSurface = 'chat' | 'ui' | 'background' | 'system' | 'analysis_canvas' | string;

interface DealMarketRow {
  id: number;
  user_id: number;
  business_name?: string | null;
  journey_type?: string | null;
  current_gate?: string | null;
  league?: string | null;
  industry?: string | null;
  location?: string | null;
  revenue?: number | null;
  sde?: number | null;
  ebitda?: number | null;
  asking_price?: number | null;
  financials?: unknown;
  status?: string | null;
}

interface MarketSourceDraft {
  sourceType: string;
  title: string;
  publisher?: string | null;
  url?: string | null;
  reliability?: string;
  summary?: string | null;
  citationTag?: string | null;
  metadata?: Record<string, unknown>;
}

export interface MarketIntelligenceProfile {
  id: number;
  userId: number | null;
  organizationId: number | null;
  dealId: number | null;
  scope: string;
  profileKey: string;
  industry: string | null;
  naicsCode: string | null;
  geography: string | null;
  league: string | null;
  roleContext: string | null;
  transactionType: string | null;
  freshnessStatus: string;
  confidence: number | null;
  sourceCount: number;
  marketSummary: string | null;
  buyerUniverseSummary: string | null;
  capitalAvailabilitySummary: string | null;
  forecastSummary: string | null;
  ruleChangeSummary: string | null;
  sourceGapSummary: string | null;
  signals: Array<Record<string, unknown>>;
  sourceGaps: Array<Record<string, unknown>>;
  ruleChanges: Array<Record<string, unknown>>;
  forecasts: Array<Record<string, unknown>>;
  buyerUniverse: Record<string, unknown>;
  capitalStack: Record<string, unknown>;
  citations: Array<Record<string, unknown>>;
  evidenceRefs: AnalysisEvidenceRef[];
  lastResearchedAt: string | null;
  nextRefreshAt: string | null;
  researchJobId?: number | null;
}

interface EnsureProfileInput {
  userId: number;
  dealId: number;
  triggerReason?: string;
  sourceSurface?: SourceSurface;
  sourceAgent?: string;
  actionEventId?: number | null;
}

interface QueueJobInput extends EnsureProfileInput {
  profileId?: number | null;
}

const INDUSTRY_NAICS: Record<string, string> = {
  hvac: '2382',
  plumbing: '2381',
  electrical: '2382',
  construction: '2389',
  roofing: '2381',
  'home services': '2389',
  'pest control': '5612',
  landscaping: '5617',
  cleaning: '5617',
  dental: '6213',
  veterinary: '5413',
  medical: '6211',
  healthcare: '6211',
  'physical therapy': '6213',
  optometry: '6213',
  restaurant: '7225',
  food: '7225',
  coffee: '7225',
  bar: '7224',
  'auto repair': '8111',
  mechanic: '8111',
  automotive: '8111',
  salon: '8121',
  barber: '8121',
  spa: '8121',
  accounting: '5412',
  cpa: '5412',
  law: '5411',
  legal: '5411',
  insurance: '5242',
  staffing: '5613',
  consulting: '5416',
  it: '5415',
  msp: '5415',
  software: '5112',
  saas: '5112',
  ecommerce: '4541',
  retail: '4529',
  grocery: '4451',
  manufacturing: '3111',
  fitness: '7139',
  gym: '7139',
  'property management': '5312',
  'real estate': '5312',
};

const STATE_FIPS: Record<string, string> = {
  al: '01', alaska: '02', ak: '02', arizona: '04', az: '04', arkansas: '05', ar: '05',
  california: '06', ca: '06', colorado: '08', co: '08', connecticut: '09', ct: '09',
  delaware: '10', de: '10', florida: '12', fl: '12', georgia: '13', ga: '13',
  hawaii: '15', hi: '15', idaho: '16', id: '16', illinois: '17', il: '17',
  indiana: '18', in: '18', iowa: '19', ia: '19', kansas: '20', ks: '20',
  kentucky: '21', ky: '21', louisiana: '22', la: '22', maine: '23', me: '23',
  maryland: '24', md: '24', massachusetts: '25', ma: '25', michigan: '26', mi: '26',
  minnesota: '27', mn: '27', mississippi: '28', ms: '28', missouri: '29', mo: '29',
  montana: '30', mt: '30', nebraska: '31', ne: '31', nevada: '32', nv: '32',
  'new hampshire': '33', nh: '33', 'new jersey': '34', nj: '34', 'new mexico': '35', nm: '35',
  'new york': '36', ny: '36', 'north carolina': '37', nc: '37', 'north dakota': '38', nd: '38',
  ohio: '39', oh: '39', oklahoma: '40', ok: '40', oregon: '41', or: '41',
  pennsylvania: '42', pa: '42', 'rhode island': '44', ri: '44', 'south carolina': '45', sc: '45',
  'south dakota': '46', sd: '46', tennessee: '47', tn: '47', texas: '48', tx: '48',
  utah: '49', ut: '49', vermont: '50', vt: '50', virginia: '51', va: '51',
  washington: '53', wa: '53', 'west virginia': '54', wv: '54', wisconsin: '55', wi: '55',
  wyoming: '56', wy: '56',
};

export async function ensureMarketIntelligenceProfileForDeal(
  input: EnsureProfileInput,
): Promise<MarketIntelligenceProfile | null> {
  try {
    const deal = await loadDeal(input.userId, input.dealId);
    if (!deal) return null;

    const profileDraft = await buildProfileDraft(deal);
    const [profileRow] = await sql`
      INSERT INTO market_intelligence_profiles (
        user_id,
        deal_id,
        scope,
        profile_key,
        industry,
        naics_code,
        geography,
        league,
        role_context,
        transaction_type,
        freshness_status,
        confidence,
        source_count,
        market_summary,
        buyer_universe_summary,
        capital_availability_summary,
        forecast_summary,
        rule_change_summary,
        source_gap_summary,
        signals,
        source_gaps,
        rule_changes,
        forecasts,
        buyer_universe,
        capital_stack,
        citations,
        evidence_refs,
        last_researched_at,
        next_refresh_at,
        updated_at
      )
      VALUES (
        ${deal.user_id},
        ${deal.id},
        'deal',
        ${profileDraft.profileKey},
        ${profileDraft.industry},
        ${profileDraft.naicsCode},
        ${profileDraft.geography},
        ${deal.league || null},
        ${deal.journey_type || null},
        ${deal.current_gate || null},
        ${profileDraft.freshnessStatus},
        ${profileDraft.confidence},
        ${profileDraft.sources.length},
        ${profileDraft.marketSummary},
        ${profileDraft.buyerUniverseSummary},
        ${profileDraft.capitalAvailabilitySummary},
        ${profileDraft.forecastSummary},
        ${profileDraft.ruleChangeSummary},
        ${profileDraft.sourceGapSummary},
        ${JSON.stringify(profileDraft.signals)}::jsonb,
        ${JSON.stringify(profileDraft.sourceGaps)}::jsonb,
        ${JSON.stringify(profileDraft.ruleChanges)}::jsonb,
        ${JSON.stringify(profileDraft.forecasts)}::jsonb,
        ${JSON.stringify(profileDraft.buyerUniverse)}::jsonb,
        ${JSON.stringify(profileDraft.capitalStack)}::jsonb,
        ${JSON.stringify(profileDraft.citations)}::jsonb,
        ${JSON.stringify(profileDraft.evidenceRefs)}::jsonb,
        NOW(),
        NOW() + INTERVAL '7 days',
        NOW()
      )
      ON CONFLICT (user_id, deal_id, scope) WHERE deal_id IS NOT NULL
      DO UPDATE SET
        profile_key = EXCLUDED.profile_key,
        industry = EXCLUDED.industry,
        naics_code = EXCLUDED.naics_code,
        geography = EXCLUDED.geography,
        league = EXCLUDED.league,
        role_context = EXCLUDED.role_context,
        transaction_type = EXCLUDED.transaction_type,
        freshness_status = EXCLUDED.freshness_status,
        confidence = EXCLUDED.confidence,
        source_count = EXCLUDED.source_count,
        market_summary = EXCLUDED.market_summary,
        buyer_universe_summary = EXCLUDED.buyer_universe_summary,
        capital_availability_summary = EXCLUDED.capital_availability_summary,
        forecast_summary = EXCLUDED.forecast_summary,
        rule_change_summary = EXCLUDED.rule_change_summary,
        source_gap_summary = EXCLUDED.source_gap_summary,
        signals = EXCLUDED.signals,
        source_gaps = EXCLUDED.source_gaps,
        rule_changes = EXCLUDED.rule_changes,
        forecasts = EXCLUDED.forecasts,
        buyer_universe = EXCLUDED.buyer_universe,
        capital_stack = EXCLUDED.capital_stack,
        citations = EXCLUDED.citations,
        evidence_refs = EXCLUDED.evidence_refs,
        last_researched_at = EXCLUDED.last_researched_at,
        next_refresh_at = EXCLUDED.next_refresh_at,
        updated_at = NOW()
      RETURNING *
    `;

    const profileId = Number(profileRow.id);
    await syncProfileSources(profileId, profileDraft.sources);
    const researchJobId = await queueIndustryDeepResearchJob({
      ...input,
      profileId,
      triggerReason: input.triggerReason || 'market_profile_refresh',
    });

    return { ...mapProfileRow(profileRow), researchJobId };
  } catch (error) {
    if (isMissingMarketRuntimeSchema(error)) return null;
    console.error('[market-intelligence-runtime] profile refresh failed:', error);
    return null;
  }
}

export async function getMarketIntelligenceProfileForDeal(
  userId: number,
  dealId: number,
): Promise<MarketIntelligenceProfile | null> {
  try {
    const [row] = await sql`
      SELECT *
      FROM market_intelligence_profiles
      WHERE user_id = ${userId}
        AND deal_id = ${dealId}
        AND scope = 'deal'
      ORDER BY updated_at DESC
      LIMIT 1
    `;
    return row ? mapProfileRow(row) : null;
  } catch (error) {
    if (isMissingMarketRuntimeSchema(error)) return null;
    console.error('[market-intelligence-runtime] profile load failed:', error);
    return null;
  }
}

export async function queueIndustryDeepResearchJob(input: QueueJobInput): Promise<number | null> {
  try {
    const deal = await loadDeal(input.userId, input.dealId);
    if (!deal) return null;
    const profileId = input.profileId ?? await loadProfileId(input.userId, input.dealId);
    const industry = normalizeIndustryLabel(deal.industry);
    const naicsCode = inferNaicsCode(industry);
    const geography = deal.location || 'national';
    const triggerReason = input.triggerReason || 'industry_deep_research';

    const [existing] = await sql`
      SELECT id
      FROM market_intelligence_jobs
      WHERE user_id = ${input.userId}
        AND deal_id = ${input.dealId}
        AND status IN ('queued', 'running')
        AND trigger_reason = ${triggerReason}
      ORDER BY requested_at DESC
      LIMIT 1
    `;
    if (existing?.id) return Number(existing.id);

    const [job] = await sql`
      INSERT INTO market_intelligence_jobs (
        user_id,
        deal_id,
        profile_id,
        status,
        trigger_reason,
        source_surface,
        source_agent,
        action_event_id,
        job_input
      )
      VALUES (
        ${input.userId},
        ${input.dealId},
        ${profileId},
        'queued',
        ${triggerReason},
        ${input.sourceSurface || 'background'},
        ${input.sourceAgent || 'yulia-market-intelligence'},
        ${input.actionEventId || null},
        ${JSON.stringify({
          dealId: input.dealId,
          industry,
          naicsCode,
          geography,
          roleContext: deal.journey_type,
          transactionType: deal.current_gate,
          requestedTasks: [
            'industry_trends',
            'buyer_universe',
            'capital_availability',
            'valuation_comps',
            'tax_legal_rule_changes',
            'forecast_impacts',
            'source_gaps',
          ],
        })}::jsonb
      )
      RETURNING id
    `;
    return job?.id ? Number(job.id) : null;
  } catch (error) {
    if (isMissingMarketRuntimeSchema(error)) return null;
    console.error('[market-intelligence-runtime] deep research queue failed:', error);
    return null;
  }
}

export function enrichAnalysisWithMarketIntelligenceProfile(
  analysis: AnalysisOutput,
  profile: MarketIntelligenceProfile | null,
): AnalysisOutput {
  if (!profile || analysis.analysisType !== 'market_intelligence') return analysis;

  const profileTableRows = [
    ['Market trend', profile.marketSummary || 'Market profile is queued for refresh.'],
    ['Buyer universe', profile.buyerUniverseSummary || 'Buyer universe research is queued.'],
    ['Capital availability', profile.capitalAvailabilitySummary || 'Capital read is queued.'],
    ['Forecast', profile.forecastSummary || 'Forecast research is queued.'],
    ['Rule/risk watch', profile.ruleChangeSummary || 'Rule-change research is queued.'],
    ['Source gaps', profile.sourceGapSummary || 'No source gaps logged.'],
  ];

  const signalChartData = profile.signals.slice(0, 6).map((signal, index) => ({
    label: String(signal.label || `Signal ${index + 1}`),
    value: typeof signal.score === 'number' ? signal.score : 50,
    tone: signal.tone || 'neutral',
  }));

  return {
    ...analysis,
    summary: profile.marketSummary || analysis.summary,
    evidenceRefs: mergeEvidenceRefs(analysis.evidenceRefs, profile.evidenceRefs),
    metrics: [
      ...analysis.metrics,
      {
        key: 'source_count',
        label: 'Sources attached',
        value: profile.sourceCount,
        displayValue: String(profile.sourceCount),
        sub: profile.freshnessStatus.replace(/_/g, ' '),
        tone: profile.sourceCount > 2 ? 'pursue' : 'watch',
      },
      {
        key: 'freshness',
        label: 'Market freshness',
        value: profile.freshnessStatus,
        displayValue: humanizeStatus(profile.freshnessStatus),
        sub: profile.lastResearchedAt ? `Last refreshed ${formatDate(profile.lastResearchedAt)}` : 'Queued for research',
        tone: profile.freshnessStatus.includes('pending') ? 'watch' : 'pursue',
      },
    ],
    charts: signalChartData.length > 0
      ? [
          ...analysis.charts,
          {
            type: 'bar',
            title: 'Yulia market signals',
            data: signalChartData,
          },
        ]
      : analysis.charts,
    tables: [
      {
        title: 'Yulia market intelligence profile',
        columns: ['Read', 'Current signal'],
        rows: profileTableRows,
      },
      ...analysis.tables,
    ],
    missingData: [
      ...analysis.missingData,
      ...profile.sourceGaps.slice(0, 4).map(gap => ({
        label: String(gap.label || 'Market source gap'),
        why: String(gap.detail || gap.why || 'Yulia needs deeper source coverage before relying on this signal.'),
        priority: ((gap.priority === 'high' || gap.priority === 'medium' || gap.priority === 'low') ? gap.priority : 'medium') as 'high' | 'medium' | 'low',
      })),
    ],
    yuliaRead: buildProfileYuliaRead(profile),
    calculations: {
      ...analysis.calculations,
      marketIntelligenceRuntime: summarizeMarketIntelligenceProfile(profile),
    },
  };
}

export function summarizeMarketIntelligenceProfile(profile: MarketIntelligenceProfile | null): Record<string, unknown> | null {
  if (!profile) return null;
  return {
    profileId: profile.id,
    dealId: profile.dealId,
    industry: profile.industry,
    naicsCode: profile.naicsCode,
    geography: profile.geography,
    freshnessStatus: profile.freshnessStatus,
    sourceCount: profile.sourceCount,
    confidence: profile.confidence,
    lastResearchedAt: profile.lastResearchedAt,
    nextRefreshAt: profile.nextRefreshAt,
    researchJobId: profile.researchJobId ?? null,
    citations: profile.citations,
    sourceGaps: profile.sourceGaps,
  };
}

async function loadDeal(userId: number, dealId: number): Promise<DealMarketRow | null> {
  const [deal] = await sql`
    SELECT id, user_id, business_name, journey_type, current_gate, league,
           industry, location, revenue, sde, ebitda, asking_price, financials, status
    FROM deals
    WHERE id = ${dealId} AND user_id = ${userId}
    LIMIT 1
  `;
  return deal ? (deal as DealMarketRow) : null;
}

async function loadProfileId(userId: number, dealId: number): Promise<number | null> {
  const [profile] = await sql`
    SELECT id
    FROM market_intelligence_profiles
    WHERE user_id = ${userId} AND deal_id = ${dealId} AND scope = 'deal'
    ORDER BY updated_at DESC
    LIMIT 1
  `;
  return profile?.id ? Number(profile.id) : null;
}

async function buildProfileDraft(deal: DealMarketRow): Promise<{
  profileKey: string;
  industry: string;
  naicsCode: string;
  geography: string;
  freshnessStatus: string;
  confidence: number;
  marketSummary: string;
  buyerUniverseSummary: string;
  capitalAvailabilitySummary: string;
  forecastSummary: string;
  ruleChangeSummary: string;
  sourceGapSummary: string;
  signals: Array<Record<string, unknown>>;
  sourceGaps: Array<Record<string, unknown>>;
  ruleChanges: Array<Record<string, unknown>>;
  forecasts: Array<Record<string, unknown>>;
  buyerUniverse: Record<string, unknown>;
  capitalStack: Record<string, unknown>;
  citations: Array<Record<string, unknown>>;
  evidenceRefs: AnalysisEvidenceRef[];
  sources: MarketSourceDraft[];
}> {
  const industry = normalizeIndustryLabel(deal.industry);
  const naicsCode = inferNaicsCode(industry);
  const geography = deal.location || 'national';
  const stateCode = inferStateFips(geography);

  const [heat, cbp, bds, sba, prime, fedFunds] = await Promise.all([
    getMarketHeat(industry).catch(() => null),
    stateCode ? fetchCBPData(naicsCode, stateCode).catch(() => null) : Promise.resolve(null),
    fetchBDSData(naicsCode, stateCode || undefined).catch(() => null),
    getSBALendingStats(naicsCode, stateCode || undefined).catch(() => null),
    fetchFREDData('DPRIME').catch(() => null),
    fetchFREDData('FEDFUNDS').catch(() => null),
  ]);

  const buyerUniverse = {
    strategicCountEstimate: estimateStrategicCount(heat?.score, bds?.totalFirms),
    sponsorCountEstimate: estimateSponsorCount(heat?.score),
    likelyBuyerTypes: likelyBuyerTypes(industry, heat?.score),
    source: 'Yulia market heat + platform thesis baseline',
  };
  const capitalStack = {
    sbaAverageLoanCents: sba?.avgLoanCents ?? null,
    sbaApprovalRate: sba?.approvalRate ?? null,
    sbaAverageTermMonths: sba?.avgTermMonths ?? null,
    primeRate: prime?.latestValue ?? null,
    fedFundsRate: fedFunds?.latestValue ?? null,
  };

  const marketSummary = heat
    ? `${industry} is currently a ${heat.label.toLowerCase()} market for M&A attention. ${heat.peActivity}; multiples are ${heat.multipleDirection}.`
    : `${industry} market intelligence is queued for deeper research. Yulia has enough deal context to begin the profile, but needs a refreshed industry read before relying on market conclusions.`;
  const buyerUniverseSummary = `${buyerUniverse.likelyBuyerTypes.join(', ')} are the first buyer pools Yulia should test for this deal.`;
  const capitalAvailabilitySummary = sba
    ? `${sba.context}${prime?.latestValue ? ` Prime rate is ${prime.latestValue}% as of ${prime.latestDate}.` : ''}`
    : `Capital availability research is queued for ${industry}; Yulia should not lean on financing appetite until the lending read is refreshed.`;
  const forecastSummary = bds
    ? `Census BDS shows ${formatNumber(bds.totalFirms)} sector firms with ${bds.netGrowthRate}% net firm-growth rate; Yulia should treat this as a directional supply/demand signal, not a standalone forecast.`
    : `Forecast work is queued; Yulia needs fresh industry and financing inputs before producing a forward market view.`;
  const ruleChangeSummary = `Rule-change watch is queued. Yulia should not claim a tax, legal, regulatory, labor, privacy, environmental, antitrust, SBA, HSR, CFIUS, or state-law change until a cited source is attached.`;
  const sourceGaps = buildSourceGaps(deal, Boolean(heat), Boolean(bds), Boolean(sba));
  const sourceGapSummary = sourceGaps.length
    ? sourceGaps.map(gap => String(gap.label)).join('; ')
    : 'No immediate market-source gaps after the seeded runtime read.';

  const signals = [
    heat ? {
      label: 'Market heat',
      score: heat.score * 20,
      tone: heat.score >= 4 ? 'pursue' : heat.score === 3 ? 'watch' : 'neutral',
      detail: `${heat.label}; ${heat.peActivity}; multiples ${heat.multipleDirection}`,
      source: 'market_heat',
    } : null,
    bds ? {
      label: 'Firm dynamics',
      score: clamp(Math.round(50 + bds.netGrowthRate * 5), 5, 95),
      tone: bds.netGrowthRate >= 0 ? 'pursue' : 'watch',
      detail: `${formatNumber(bds.totalFirms)} firms; ${bds.netGrowthRate}% net firm growth`,
      source: 'census_bds',
    } : null,
    sba ? {
      label: 'Lending baseline',
      score: clamp(sba.approvalRate ?? 65, 5, 95),
      tone: (sba.approvalRate ?? 65) >= 70 ? 'pursue' : 'watch',
      detail: sba.context,
      source: 'sba_lending',
    } : null,
  ].filter(Boolean) as Array<Record<string, unknown>>;

  const forecasts = [
    {
      label: 'Multiple direction',
      detail: heat ? `Market heat service currently reads multiples as ${heat.multipleDirection}.` : 'Multiple-direction read queued.',
      source: heat ? 'market_heat' : 'pending_deep_research',
      confidence: heat ? 'medium' : 'low',
    },
    {
      label: 'Sector formation',
      detail: bds ? `${bds.entryRate}% entry rate, ${bds.exitRate}% exit rate, ${bds.netGrowthRate}% net.` : 'Census BDS sector read queued.',
      source: bds ? 'census_bds' : 'pending_deep_research',
      confidence: bds ? 'medium' : 'low',
    },
  ];

  const ruleChanges = [
    {
      label: 'Rule-change research queued',
      detail: ruleChangeSummary,
      source: 'pending_deep_research',
      priority: 'high',
    },
  ];

  const sources = buildSourceDrafts({ heat, cbp, bds, sba, prime, fedFunds, industry, naicsCode, stateCode });
  const citations = sources.map((source, index) => ({
    id: source.citationTag || `MI-${index + 1}`,
    title: source.title,
    publisher: source.publisher,
    sourceType: source.sourceType,
    reliability: source.reliability,
    retrievedAt: new Date().toISOString(),
    url: source.url || null,
  }));
  const evidenceRefs: AnalysisEvidenceRef[] = [
    ...sources.slice(0, 8).map(source => ({
      label: source.title,
      type: source.sourceType === 'methodology' ? 'methodology' : 'market_signal',
      source: source.publisher || source.sourceType,
      detail: source.summary || undefined,
      confidence: source.reliability === 'source-backed' ? 'high' : source.reliability === 'system' ? 'medium' : 'low',
    } satisfies AnalysisEvidenceRef)),
    {
      label: 'Industry Deep Research job',
      type: 'market_signal',
      source: 'Yulia market intelligence runtime',
      detail: 'Queued to attach deeper sources, rule changes, forecasts, comps, buyer appetite, and source gaps to this deal profile.',
      confidence: 'medium',
    },
  ];

  return {
    profileKey: `deal:${deal.id}:${naicsCode}:${slugify(geography)}`,
    industry,
    naicsCode,
    geography,
    freshnessStatus: sources.length > 1 ? 'runtime_seeded_pending_deep_research' : 'seeded_pending_deep_research',
    confidence: sources.length > 3 ? 0.72 : 0.52,
    marketSummary,
    buyerUniverseSummary,
    capitalAvailabilitySummary,
    forecastSummary,
    ruleChangeSummary,
    sourceGapSummary,
    signals,
    sourceGaps,
    ruleChanges,
    forecasts,
    buyerUniverse,
    capitalStack,
    citations,
    evidenceRefs,
    sources,
  };
}

async function syncProfileSources(profileId: number, sources: MarketSourceDraft[]): Promise<void> {
  await sql`DELETE FROM market_intelligence_sources WHERE profile_id = ${profileId}`;
  for (const source of sources) {
    await sql`
      INSERT INTO market_intelligence_sources (
        profile_id,
        source_type,
        title,
        publisher,
        url,
        reliability,
        summary,
        citation_tag,
        metadata
      )
      VALUES (
        ${profileId},
        ${source.sourceType},
        ${source.title},
        ${source.publisher || null},
        ${source.url || null},
        ${source.reliability || 'system'},
        ${source.summary || null},
        ${source.citationTag || null},
        ${JSON.stringify(source.metadata || {})}::jsonb
      )
    `;
  }
}

function buildSourceDrafts(input: {
  heat: Awaited<ReturnType<typeof getMarketHeat>> | null;
  cbp: Awaited<ReturnType<typeof fetchCBPData>> | null;
  bds: Awaited<ReturnType<typeof fetchBDSData>> | null;
  sba: Awaited<ReturnType<typeof getSBALendingStats>> | null;
  prime: Awaited<ReturnType<typeof fetchFREDData>> | null;
  fedFunds: Awaited<ReturnType<typeof fetchFREDData>> | null;
  industry: string;
  naicsCode: string;
  stateCode: string | null;
}): MarketSourceDraft[] {
  const sources: MarketSourceDraft[] = [{
    sourceType: 'methodology',
    title: 'V19 market intelligence runtime requirement',
    publisher: 'smbX methodology',
    reliability: 'system',
    summary: 'Market intelligence must be cited, fresh, and attached to deal, portfolio, analysis, document, and workflow surfaces.',
    citationTag: 'V19_MI_RUNTIME',
  }];

  if (input.heat) {
    sources.push({
      sourceType: 'market_heat',
      title: `${input.industry} market heat profile`,
      publisher: 'smbX market heat service',
      reliability: 'system',
      summary: `${input.heat.label} (${input.heat.score}/5). ${input.heat.peActivity}. Multiples ${input.heat.multipleDirection}.`,
      citationTag: 'SMBX_MARKET_HEAT',
      metadata: { signals: input.heat.signals, score: input.heat.score },
    });
  }
  if (input.cbp) {
    sources.push({
      sourceType: 'census_cbp',
      title: `Census CBP establishment read for NAICS ${input.naicsCode}`,
      publisher: 'U.S. Census County Business Patterns',
      reliability: 'source-backed',
      summary: `${formatNumber(input.cbp.establishments)} establishments and ${formatNumber(input.cbp.employees)} employees in geography ${input.cbp.geography}.`,
      citationTag: 'CENSUS_CBP',
      metadata: input.cbp as unknown as Record<string, unknown>,
    });
  }
  if (input.bds) {
    sources.push({
      sourceType: 'census_bds',
      title: `Census BDS firm dynamics for NAICS ${input.bds.naicsCode}`,
      publisher: 'U.S. Census Business Dynamics Statistics',
      reliability: 'source-backed',
      summary: `${formatNumber(input.bds.totalFirms)} firms; entry ${input.bds.entryRate}%, exit ${input.bds.exitRate}%, net ${input.bds.netGrowthRate}%.`,
      citationTag: 'CENSUS_BDS',
      metadata: input.bds as unknown as Record<string, unknown>,
    });
  }
  if (input.sba) {
    sources.push({
      sourceType: 'sba_lending',
      title: `SBA 7(a) lending baseline for NAICS ${input.sba.naicsCode}`,
      publisher: 'SBA lending service',
      reliability: 'source-backed',
      summary: input.sba.context,
      citationTag: 'SBA_7A',
      metadata: input.sba as unknown as Record<string, unknown>,
    });
  }
  for (const fred of [input.prime, input.fedFunds].filter(Boolean) as NonNullable<typeof input.prime>[]) {
    sources.push({
      sourceType: 'fred',
      title: fred.title || fred.seriesId,
      publisher: 'Federal Reserve Economic Data',
      reliability: 'source-backed',
      summary: `${fred.seriesId}: ${fred.latestValue} as of ${fred.latestDate}; ${fred.changePct}% change from prior observation.`,
      citationTag: `FRED_${fred.seriesId}`,
      metadata: fred as unknown as Record<string, unknown>,
    });
  }
  return sources;
}

function buildSourceGaps(
  deal: DealMarketRow,
  hasHeat: boolean,
  hasFirmDynamics: boolean,
  hasCapital: boolean,
): Array<Record<string, unknown>> {
  const gaps: Array<Record<string, unknown>> = [];
  if (!deal.industry) {
    gaps.push({
      label: 'Industry classification missing',
      detail: 'Yulia needs industry or NAICS before she can run a credible market read.',
      priority: 'high',
    });
  }
  if (!deal.location) {
    gaps.push({
      label: 'Geography missing',
      detail: 'Yulia needs deal geography to read local buyer density, labor, lending, and regulatory implications.',
      priority: 'medium',
    });
  }
  if (!hasHeat) {
    gaps.push({
      label: 'Buyer-appetite read needed',
      detail: 'Market heat was not available; Deep Research should pull buyer pool, sponsor, and strategic-acquirer signals.',
      priority: 'high',
    });
  }
  if (!hasFirmDynamics) {
    gaps.push({
      label: 'Sector trend evidence needed',
      detail: 'Firm dynamics were not available; Deep Research should attach sector growth, churn, and activity trend sources.',
      priority: 'medium',
    });
  }
  if (!hasCapital) {
    gaps.push({
      label: 'Financing climate needed',
      detail: 'Capital availability was not available; Deep Research should attach lender appetite, SBA/SBIC, rates, and spread context.',
      priority: 'medium',
    });
  }
  gaps.push({
    label: 'Recent rule-change sweep',
    detail: 'Yulia must source tax, legal, regulatory, labor, privacy/cyber, environmental, antitrust, SBA, HSR, CFIUS, and state-law changes before relying on them.',
    priority: 'high',
  });
  return gaps;
}

function mapProfileRow(row: any): MarketIntelligenceProfile {
  return {
    id: Number(row.id),
    userId: row.user_id == null ? null : Number(row.user_id),
    organizationId: row.organization_id == null ? null : Number(row.organization_id),
    dealId: row.deal_id == null ? null : Number(row.deal_id),
    scope: row.scope,
    profileKey: row.profile_key,
    industry: row.industry,
    naicsCode: row.naics_code,
    geography: row.geography,
    league: row.league,
    roleContext: row.role_context,
    transactionType: row.transaction_type,
    freshnessStatus: row.freshness_status,
    confidence: row.confidence == null ? null : Number(row.confidence),
    sourceCount: Number(row.source_count || 0),
    marketSummary: row.market_summary,
    buyerUniverseSummary: row.buyer_universe_summary,
    capitalAvailabilitySummary: row.capital_availability_summary,
    forecastSummary: row.forecast_summary,
    ruleChangeSummary: row.rule_change_summary,
    sourceGapSummary: row.source_gap_summary,
    signals: asArray(row.signals),
    sourceGaps: asArray(row.source_gaps),
    ruleChanges: asArray(row.rule_changes),
    forecasts: asArray(row.forecasts),
    buyerUniverse: asRecord(row.buyer_universe),
    capitalStack: asRecord(row.capital_stack),
    citations: asArray(row.citations),
    evidenceRefs: asArray(row.evidence_refs) as unknown as AnalysisEvidenceRef[],
    lastResearchedAt: toIsoString(row.last_researched_at),
    nextRefreshAt: toIsoString(row.next_refresh_at),
  };
}

function buildProfileYuliaRead(profile: MarketIntelligenceProfile): string {
  const parts = [
    profile.marketSummary,
    profile.buyerUniverseSummary,
    profile.capitalAvailabilitySummary,
    profile.forecastSummary,
    `I have ${profile.sourceCount} source layer${profile.sourceCount === 1 ? '' : 's'} attached and an Industry Deep Research refresh queued for rule changes, comps, buyer appetite, forecasts, and source gaps.`,
  ].filter(Boolean);
  return `Yulia's market read: ${parts.join(' ')}`;
}

function mergeEvidenceRefs(base: AnalysisEvidenceRef[], additions: AnalysisEvidenceRef[]): AnalysisEvidenceRef[] {
  const seen = new Set<string>();
  const merged: AnalysisEvidenceRef[] = [];
  for (const ref of [...base, ...additions]) {
    const key = `${ref.label}:${ref.source}:${ref.type}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(ref);
  }
  return merged.slice(0, 18);
}

function normalizeIndustryLabel(industry: string | null | undefined): string {
  return (industry || 'general business services').trim();
}

function inferNaicsCode(industry: string): string {
  const lower = industry.toLowerCase();
  for (const [keyword, code] of Object.entries(INDUSTRY_NAICS)) {
    if (lower.includes(keyword)) return code;
  }
  return '81';
}

function inferStateFips(location: string | null | undefined): string | null {
  if (!location) return null;
  const normalized = location.toLowerCase().replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();
  const tokens = normalized.split(' ');
  for (const token of tokens) {
    if (STATE_FIPS[token]) return STATE_FIPS[token];
  }
  for (const [state, fips] of Object.entries(STATE_FIPS)) {
    if (state.length > 2 && normalized.includes(state)) return fips;
  }
  return null;
}

function likelyBuyerTypes(industry: string, heatScore = 2): string[] {
  const lower = industry.toLowerCase();
  if (heatScore >= 4) return ['strategic roll-ups', 'PE-backed platforms', 'family offices'];
  if (lower.includes('software') || lower.includes('saas')) return ['vertical software platforms', 'lower-middle-market sponsors', 'strategic product buyers'];
  if (lower.includes('professional') || lower.includes('consulting')) return ['strategic acquirers', 'partner-led groups', 'independent sponsors'];
  return ['strategic acquirers', 'independent sponsors', 'local operating buyers'];
}

function estimateStrategicCount(heatScore = 2, totalFirms?: number | null): number {
  const base = heatScore >= 5 ? 47 : heatScore >= 4 ? 28 : heatScore === 3 ? 16 : 8;
  if (!totalFirms) return base;
  return Math.max(base, Math.min(75, Math.round(totalFirms / 250)));
}

function estimateSponsorCount(heatScore = 2): number {
  return heatScore >= 5 ? 22 : heatScore >= 4 ? 14 : heatScore === 3 ? 7 : 3;
}

function asArray(value: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(value)) return value as Array<Record<string, unknown>>;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed as Array<Record<string, unknown>> : [];
    } catch {
      return [];
    }
  }
  return [];
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value as Record<string, unknown>;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {};
    } catch {
      return {};
    }
  }
  return {};
}

function isMissingMarketRuntimeSchema(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /market_intelligence_|relation .*does not exist|does not exist/i.test(message);
}

function formatNumber(value: number | null | undefined): string {
  if (typeof value !== 'number' || Number.isNaN(value)) return '0';
  return value.toLocaleString('en-US');
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function toIsoString(value: unknown): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') return value;
  return null;
}

function humanizeStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'national';
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
