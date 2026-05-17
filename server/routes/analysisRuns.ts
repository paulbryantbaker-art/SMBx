import { Router } from 'express';
import {
  createAnalysisRun,
  listAnalysisRunVersions,
  readAnalysisRunSnapshot,
  restoreAnalysisRunVersion,
  updateAnalysisRunSnapshot,
} from '../services/analysisRuntime.js';
import { buildDealComparisonAnalysis, buildDeterministicAnalysis } from '../services/deterministicAnalysisEngine.js';
import type { DeterministicDealRow } from '../services/deterministicAnalysisEngine.js';
import { sql } from '../db.js';

export const analysisRunsRouter = Router();

const ANALYSIS_TYPES = new Set([
  'auto',
  'deal_scorecard',
    'buyer_fit',
    'comps',
    'valuation',
    'qoe',
    'lbo',
    'dcf',
    'sensitivity',
    'recast',
    'market_intelligence',
    'sba',
    'capital_structure',
    'covenant',
    'red_flags',
    'working_capital',
    'tax_impact',
    'purchase_price_allocation',
    'tax_structure',
    'legal_structure',
    'tax_legal_structure',
    'term_sheet',
    'earnout',
    'cap_table',
    'pmi_value_creation',
  ]);

function safeRecord(value: unknown): Record<string, any> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, any> : {};
}

function safeArray(value: unknown): any[] {
  return Array.isArray(value) ? value : [];
}

function evidenceRefsFromRows(evidence: Array<Record<string, any>>) {
  return evidence.map(item => ({
    label: item.title || item.sourceType || 'Evidence',
    type: item.sourceType || 'analysis_evidence',
    source: item.citation || 'analysis_evidence',
    value: item.excerpt || undefined,
    detail: item.sourceId ? `source ${item.sourceId}` : undefined,
    confidence: item.confidence == null
      ? undefined
      : item.confidence >= 0.8
        ? 'high'
        : item.confidence >= 0.5
          ? 'medium'
          : 'low',
  }));
}

function hydrateAnalysisEvidence(analysisData: unknown, evidence: Array<Record<string, any>>) {
  const structured = safeRecord(analysisData);
  if (structured.schemaVersion !== 'analysis-runtime-v1') return analysisData ?? null;
  if (Array.isArray(structured.evidenceRefs) && structured.evidenceRefs.length > 0) return structured;
  if (!evidence.length) return structured;
  return {
    ...structured,
    evidenceRefs: evidenceRefsFromRows(evidence),
  };
}

function normalizeAnalysisType(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase().replace(/[\s-]+/g, '_');
  return ANALYSIS_TYPES.has(normalized) ? normalized : null;
}

function humanizeAnalysisType(value: string): string {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function dealScopedTitle(dealName: string, rawTitle: string | null | undefined, fallback: string): string {
  const dealKey = titleKey(dealName);
  const parts = String(rawTitle || fallback)
    .replace(/\s+/g, ' ')
    .trim()
    .split(/\s*[·:]\s*/)
    .map(part => part.trim())
    .filter(Boolean);
  while (parts.length > 0 && titleKey(parts[0]) === dealKey) {
    parts.shift();
  }
  return `${dealName} · ${(parts.join(' · ') || fallback).trim()}`;
}

function titleKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function modelArtifactMenuSlug(analysisType: string | null): string {
  if (analysisType === 'capital_structure' || analysisType === 'covenant') return 'buy-capital-structure';
  if (analysisType === 'sba') return 'universal-sba-analysis';
  if (analysisType === 'comps' || analysisType === 'deal_comparison') return 'universal-comp-analysis';
  return 'buy-valuation-model';
}

function artifactDealRows(artifactPayload: Record<string, any>) {
  const rawDeals = safeArray(artifactPayload.deals);
  return rawDeals.map((item) => {
    const data = safeRecord(item?.data);
    const calculations = safeRecord(data.calculations);
    const metrics = safeArray(data.metrics);
    const metric = (key: string) => metrics.find((candidate: any) => candidate?.key === key)?.displayValue;
    return {
      title: String(item?.title || calculations.dealName || data.title || 'Deal'),
      score: String(item?.modelScore ?? data.verdict?.score ?? metric('fit') ?? metric('score') ?? '—'),
      verdict: String(data.verdict?.label || 'Model read'),
      valuation: String(metric('valuation') || metric('ask') || '—'),
      earnings: String(metric('ebitda') || metric('sde') || '—'),
    };
  });
}

function numericDealIdsFromPayload(value: unknown): number[] {
  const ids = new Set<number>();
  const payload = safeRecord(value);

  for (const id of safeArray(payload.dealIds)) {
    const numeric = Number(id);
    if (Number.isFinite(numeric)) ids.add(numeric);
  }

  for (const item of safeArray(payload.deals)) {
    const data = safeRecord(item?.data);
    const rawId = safeRecord(data.calculations).dealId;
    const numeric = Number(rawId);
    if (Number.isFinite(numeric)) ids.add(numeric);
  }

  return Array.from(ids);
}

function buildModelArtifactContent(input: {
  run: Record<string, any>;
  artifactTitle: string;
  artifactPayload: Record<string, any>;
  dealIds: number[];
  savedAt: string;
}) {
  const primaryData = safeRecord(input.artifactPayload.primaryData);
  const structured = Object.keys(primaryData).length > 0
    ? primaryData
    : safeRecord(safeRecord(input.run.outputs).structuredAnalysis);
  const yuliaRead = String(input.artifactPayload.yuliaRead || structured.yuliaRead || input.run.commentary_markdown || '');
  const rows = artifactDealRows(input.artifactPayload);
  const scope = input.artifactPayload.comparisonActive ? 'Saved comparison model' : 'Saved model snapshot';
  const relatedDeals = input.dealIds.length
    ? input.dealIds.map(id => `Deal #${id}`).join(', ')
    : 'Related deal workspace';
  const modelRows = rows.length
    ? rows
    : [{
        title: String(structured.title || input.run.title || 'Model'),
        score: String(structured.verdict?.score ?? '—'),
        verdict: String(structured.verdict?.label || 'Model read'),
        valuation: '—',
        earnings: '—',
      }];

  const markdownRows = modelRows
    .map(row => `| ${row.title} | ${row.score} | ${row.verdict} | ${row.valuation} | ${row.earnings} |`)
    .join('\n');
  const markdown = [
    `# ${input.artifactTitle}`,
    '',
    `Saved: ${new Date(input.savedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}`,
    `Source: Analysis run #${input.run.id}, v${input.run.version_number ?? 1}`,
    `Scope: ${scope}`,
    '',
    '> Model output only. This is not legal, tax, investment, or transaction advice.',
    '',
    '## Yulia read',
    yuliaRead || 'Saved from the interactive model canvas.',
    '',
    '## Model output',
    '| Deal | Score | Read | Value range | Earnings |',
    '|---|---:|---|---:|---:|',
    markdownRows,
    '',
    '## File boundary',
    `This artifact was saved privately to ${relatedDeals} under Models. It was not added to any data room.`,
  ].join('\n');

  return {
    artifactKind: input.artifactPayload.comparisonActive ? 'saved_model_comparison' : 'saved_model_snapshot',
    artifactTitle: input.artifactTitle,
    savedAt: input.savedAt,
    source: 'analysis_run',
    analysisRunId: Number(input.run.id),
    analysisVersion: Number(input.run.version_number ?? 1),
    canvasTabId: input.run.canvas_tab_id ?? null,
    relatedDealIds: input.dealIds,
    markdown,
    sections: [
      {
        title: 'Model snapshot',
        body: yuliaRead || 'Saved from the interactive model canvas.',
        bullets: [
          `Saved ${new Date(input.savedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}`,
          `Analysis run #${input.run.id}, version ${input.run.version_number ?? 1}`,
          'Private model artifact. Not added to the data room.',
        ],
      },
      {
        title: 'Compared model output',
        table: modelRows.map(row => ({
          Deal: row.title,
          Score: row.score,
          Read: row.verdict,
          Valuation: row.valuation,
          Earnings: row.earnings,
        })),
      },
      {
        title: 'Sharing boundary',
        body: 'This output is saved to the related deal file library under Models for internal sharing. Data-room publication requires a separate file-to-data-room action from the deal workspace.',
      },
    ],
    artifactPayload: input.artifactPayload,
  };
}

function resolveAnalysisMenuItemSlug({
  analysisType,
  journeyType,
  currentGate,
}: {
  analysisType: string;
  journeyType?: string | null;
  currentGate?: string | null;
}): string {
  const journey = journeyType || 'buy';

  switch (analysisType) {
    case 'deal_scorecard':
      return journey === 'sell' ? 'sell-seven-factor-analysis' : 'buy-deal-scorecard';
    case 'buyer_fit':
      return journey === 'sell' ? 'sell-buyer-list' : 'buy-deal-scorecard';
      case 'comps':
        return 'universal-comp-analysis';
      case 'valuation':
        return journey === 'sell' ? 'sell-valuation-report' : journey === 'raise' ? 'raise-pre-post-model' : 'buy-valuation-model';
      case 'qoe':
        return journey === 'sell' ? 'sell-financial-spread' : journey === 'pmi' ? 'pmi-financial-deep-dive' : 'buy-deal-scorecard';
      case 'lbo':
      case 'dcf':
      case 'sensitivity':
        return journey === 'sell' ? 'sell-valuation-report' : journey === 'raise' ? 'raise-pre-post-model' : 'buy-valuation-model';
      case 'recast':
        return journey === 'sell' ? 'sell-financial-spread' : journey === 'pmi' ? 'pmi-financial-deep-dive' : 'buy-deal-scorecard';
    case 'market_intelligence':
      return 'universal-market-intelligence';
    case 'sba':
      return 'universal-sba-analysis';
      case 'capital_structure':
        return journey === 'sell' ? 'sell-deal-structure-analysis' : journey === 'raise' ? 'raise-use-of-funds' : 'buy-capital-structure';
      case 'covenant':
        return journey === 'raise' ? 'raise-use-of-funds' : 'buy-capital-structure';
    case 'red_flags':
      return journey === 'buy' ? 'buy-red-flag-report' : journey === 'pmi' ? 'pmi-ops-assessment' : 'sell-price-gap-analysis';
      case 'working_capital':
        return journey === 'sell' ? 'sell-working-capital-analysis' : 'buy-working-capital-model';
      case 'tax_impact':
      case 'purchase_price_allocation':
        return journey === 'sell' ? 'sell-deal-structure-analysis' : 'buy-capital-structure';
      case 'tax_structure':
      case 'legal_structure':
      case 'tax_legal_structure':
        return journey === 'sell' ? 'sell-deal-structure-analysis' : 'buy-capital-structure';
    case 'term_sheet':
      return journey === 'raise' ? 'raise-term-sheet-analysis' : journey === 'sell' ? 'sell-loi-comparison' : 'buy-loi-draft';
      case 'pmi_value_creation':
        return 'pmi-value-creation';
      case 'earnout':
        return journey === 'sell' ? 'sell-deal-structure-analysis' : 'buy-earnout-analysis';
      case 'cap_table':
        return 'raise-cap-table';
    case 'auto':
    default:
      return resolveDefaultAnalysisSlug(journey, currentGate);
  }
}

function resolveDefaultAnalysisSlug(journey?: string | null, currentGate?: string | null): string {
  if (journey === 'sell') {
    if (currentGate === 'S5' || currentGate === 'S6') return 'sell-deal-structure-analysis';
    if (currentGate === 'S4') return 'sell-loi-comparison';
    if (currentGate === 'S2' || currentGate === 'S3') return 'sell-seven-factor-analysis';
    return 'sell-financial-spread';
  }

  if (journey === 'raise') {
    if (currentGate === 'R4') return 'raise-term-sheet-analysis';
    if (currentGate === 'R2' || currentGate === 'R3') return 'raise-investor-list';
    return 'raise-unit-economics';
  }

  if (journey === 'pmi') {
    if (currentGate === 'PMI3') return 'pmi-value-creation';
    if (currentGate === 'PMI2') return 'pmi-financial-deep-dive';
    return 'pmi-swot';
  }

  if (currentGate === 'B4' || currentGate === 'B5') return 'buy-capital-structure';
  if (currentGate === 'B3') return 'buy-red-flag-report';
  if (currentGate === 'B2') return 'buy-valuation-model';
  return 'buy-deal-scorecard';
}

function patchStructuredAnalysisAssumptions(analysisData: any, updates: Record<string, any>) {
  if (!analysisData || analysisData.schemaVersion !== 'analysis-runtime-v1') return analysisData;
  if (!Array.isArray(analysisData.assumptions)) return analysisData;

  return {
    ...analysisData,
    assumptions: analysisData.assumptions.map((assumption: Record<string, any>) => {
      if (!assumption?.key || updates[assumption.key] === undefined) return assumption;
      const value = updates[assumption.key];
      return {
        ...assumption,
        value,
        displayValue: String(value),
      };
    }),
  };
}

function assumptionOverridesFromSnapshot(snapshot: Record<string, any>, updates: Record<string, any>) {
  const overrides: Record<string, any> = {};
  const items = Array.isArray(snapshot.items) ? snapshot.items : [];
  for (const item of items) {
    if (item?.key) overrides[item.key] = item.value ?? item.displayValue;
  }
  for (const [key, value] of Object.entries(snapshot)) {
    if (key !== 'items') overrides[key] = value;
  }
  return { ...overrides, ...updates };
}

async function rebuildStructuredAnalysis(input: {
  current: Awaited<ReturnType<typeof readAnalysisRunSnapshot>>;
  updates: Record<string, any>;
  userId: number;
}) {
  const { current, updates, userId } = input;
  if (!current?.dealId || !current.analysisType) return null;

  const [deal] = await sql`
    SELECT id, business_name, journey_type, current_gate, user_id, league,
           industry, location, revenue, sde, ebitda, asking_price, financials, status
    FROM deals
    WHERE id = ${current.dealId} AND user_id = ${userId}
    LIMIT 1
  `;

  return deal ? buildDeterministicAnalysis({
    analysisType: current.analysisType,
    deal: deal as DeterministicDealRow,
    menuItemSlug: current.inputPayload?.resolvedMenuItemSlug ?? null,
    assumptionOverrides: assumptionOverridesFromSnapshot(current.assumptions, updates),
  }) : null;
}

analysisRunsRouter.post('/deals/:dealId/analysis', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const dealId = Number(req.params.dealId);
    if (!Number.isFinite(dealId)) return res.status(400).json({ error: 'Invalid deal id' });

    const analysisType = normalizeAnalysisType(req.body?.analysisType ?? 'auto');
    if (!analysisType) return res.status(400).json({ error: 'Invalid analysis type' });

    const [deal] = await sql`
      SELECT id, business_name, journey_type, current_gate, user_id, league,
             industry, location, revenue, sde, ebitda, asking_price, financials, status
      FROM deals
      WHERE id = ${dealId} AND user_id = ${userId}
      LIMIT 1
    `;
    if (!deal) return res.status(404).json({ error: 'Deal not found' });

    const menuItemSlug = typeof req.body?.menuItemSlug === 'string' && req.body.menuItemSlug.trim()
      ? req.body.menuItemSlug.trim()
      : resolveAnalysisMenuItemSlug({
          analysisType,
          journeyType: deal.journey_type,
          currentGate: deal.current_gate,
        });
    const analysisData = buildDeterministicAnalysis({
      analysisType,
      deal: deal as DeterministicDealRow,
      menuItemSlug,
      assumptionOverrides: safeRecord(req.body?.assumptionOverrides),
    });

    const tabTitle = dealScopedTitle(
      deal.business_name || 'Deal',
      analysisData.title,
      humanizeAnalysisType(analysisType),
    );
    const canvasTabId = `analysis-${dealId}-${analysisType}-${Date.now()}`;
    const analysisRun = await createAnalysisRun({
      userId,
      dealId,
      conversationId: Number.isFinite(Number(req.body?.conversationId)) ? Number(req.body.conversationId) : null,
      definitionSlug: analysisType,
      analysisType,
      title: tabTitle,
      status: 'complete',
      scope: 'deal',
      source: 'ui_action',
      inputPayload: {
        dealId,
        analysisType,
        resolvedMenuItemSlug: menuItemSlug,
        analysisSchemaVersion: analysisData.schemaVersion,
        requestedFrom: req.body?.requestedFrom || 'deal_recommended_action',
        requestedAt: new Date().toISOString(),
      },
      assumptions: { items: analysisData.assumptions },
      outputs: { structuredAnalysis: analysisData },
      commentaryMarkdown: analysisData.yuliaRead,
      marketContext: analysisData.analysisType === 'market_intelligence'
        ? { summary: analysisData.summary, metrics: analysisData.metrics, charts: analysisData.charts }
        : {},
      riskFlags: analysisData.risks,
      missingData: analysisData.missingData,
      professionalTriggers: analysisData.professionalTriggers,
      canvasTabId,
      modelPreference: req.body?.modelPreference ?? null,
    });

    return res.json({
      ok: true,
      canvas_action: 'open_tab',
      tab: {
        id: analysisRun?.canvas_tab_id || canvasTabId,
        kind: 'analysis',
        title: tabTitle,
        dealId: Number(deal.id),
        dealTitle: deal.business_name || 'Deal',
        tool: analysisType,
        analysisRunId: analysisRun?.id ?? null,
        resolvedMenuItemSlug: menuItemSlug,
        status: 'analysis complete',
        markdown: analysisData.yuliaRead,
        analysisData,
      },
      analysisRunId: analysisRun?.id ?? null,
      analysisStatus: 'complete',
      analysisType,
      resolvedMenuItemSlug: menuItemSlug,
      analysisData,
      message: `${analysisData.title || humanizeAnalysisType(analysisType)} is open as a structured analysis canvas.`,
    });
  } catch (err: any) {
    console.error('[analysis-runs] create analysis error:', err.message);
    return res.status(500).json({ error: 'Failed to run analysis' });
  }
});

analysisRunsRouter.post('/deals/compare', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const rawDealIds = Array.isArray(req.body?.dealIds) ? req.body.dealIds : [];
    const dealIds = rawDealIds
      .map((id: unknown) => Number(id))
      .filter((id: number) => Number.isFinite(id))
      .slice(0, 4);

    if (dealIds.length < 2) {
      return res.status(400).json({ error: 'Need at least two deals to compare' });
    }

    const rows = await sql`
      SELECT id, business_name, journey_type, current_gate, user_id, league,
             industry, location, revenue, sde, ebitda, asking_price, financials, status
      FROM deals
      WHERE user_id = ${userId}
        AND id = ANY(${dealIds})
    `;

    const rowById = new Map(rows.map((row: any) => [Number(row.id), row]));
    const deals = dealIds.map((id: number) => rowById.get(id)).filter(Boolean);
    if (deals.length < 2) {
      return res.status(404).json({ error: 'Could not find at least two owned deals to compare' });
    }

    const requestedTitle = typeof req.body?.title === 'string' && req.body.title.trim()
      ? req.body.title.trim()
      : null;
    const tabTitle = requestedTitle || 'Deal comparison';
    const analysisData = buildDealComparisonAnalysis(deals, tabTitle);
    const canvasTabId = `analysis-comparison-${deals.map((deal: any) => deal.id).join('-')}-${Date.now()}`;

    const analysisRun = await createAnalysisRun({
      userId,
      dealId: null,
      conversationId: Number.isFinite(Number(req.body?.conversationId)) ? Number(req.body.conversationId) : null,
      definitionSlug: 'deal_comparison',
      analysisType: 'deal_comparison',
      title: tabTitle,
      status: 'complete',
      scope: 'comparison',
      source: 'ui_action',
      inputPayload: {
        dealIds: deals.map((deal: any) => Number(deal.id)),
        analysisSchemaVersion: analysisData.schemaVersion,
        requestedFrom: req.body?.requestedFrom || 'analysis_root',
        requestedAt: new Date().toISOString(),
      },
      assumptions: { items: analysisData.assumptions },
      outputs: { structuredAnalysis: analysisData },
      commentaryMarkdown: analysisData.yuliaRead,
      marketContext: { summary: analysisData.summary, metrics: analysisData.metrics, charts: analysisData.charts },
      riskFlags: analysisData.risks,
      missingData: analysisData.missingData,
      professionalTriggers: analysisData.professionalTriggers,
      canvasTabId,
      modelPreference: req.body?.modelPreference ?? null,
    });

    return res.json({
      ok: true,
      canvas_action: 'open_tab',
      tab: {
        id: analysisRun?.canvas_tab_id || canvasTabId,
        kind: 'analysis',
        title: tabTitle,
        tool: 'tool-compare',
        analysisRunId: analysisRun?.id ?? null,
        status: 'comparison complete',
        markdown: analysisData.yuliaRead,
        comparisonData: deals,
        analysisData,
      },
      analysisRunId: analysisRun?.id ?? null,
      analysisStatus: 'complete',
      analysisType: 'deal_comparison',
      analysisData,
      message: `${tabTitle} is open as a structured comparison canvas.`,
    });
  } catch (err: any) {
    console.error('[analysis-runs] compare deals error:', err.message);
    return res.status(500).json({ error: 'Failed to compare deals' });
  }
});

analysisRunsRouter.post('/analysis-runs/:analysisRunId/assumptions', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const analysisRunId = Number(req.params.analysisRunId);
    if (!Number.isFinite(analysisRunId)) return res.status(400).json({ error: 'Invalid analysis run id' });

    const updates = safeRecord(req.body?.updates);
    if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No assumption updates provided' });

    const current = await readAnalysisRunSnapshot(analysisRunId, userId);
    if (!current) return res.status(404).json({ error: 'Analysis run not found' });

    const currentStructured = safeRecord(current.outputs).structuredAnalysis;
    const scenarioName = typeof req.body?.scenarioName === 'string' ? req.body.scenarioName.trim() : '';
    const recalculated = await rebuildStructuredAnalysis({ current, updates, userId });
    const structuredAnalysis = recalculated ?? patchStructuredAnalysisAssumptions(currentStructured, updates);
    const updated = await updateAnalysisRunSnapshot({
      analysisRunId,
      userId,
      assumptionUpdates: {
        ...updates,
        ...(scenarioName ? { _scenario_name: scenarioName } : {}),
        ...(structuredAnalysis ? { items: structuredAnalysis.assumptions } : {}),
      },
      outputUpdates: structuredAnalysis ? { structuredAnalysis } : {},
      changeReason: req.body?.changeReason || (scenarioName ? `Saved scenario: ${scenarioName}` : 'User updated analysis assumptions'),
    });
    const versions = await listAnalysisRunVersions(analysisRunId, userId);

    return res.json({
      ok: true,
      analysisRunId,
      versionNumber: updated?.versionNumber ?? current.versionNumber,
      assumptions: updated?.assumptions ?? current.assumptions,
      analysisData: hydrateAnalysisEvidence(structuredAnalysis, updated?.evidence ?? current.evidence ?? []),
      evidence: updated?.evidence ?? current.evidence ?? [],
      versions,
    });
  } catch (err: any) {
    console.error('[analysis-runs] update assumptions error:', err.message);
    return res.status(500).json({ error: 'Failed to update analysis assumptions' });
  }
});

analysisRunsRouter.get('/analysis-runs/:analysisRunId/versions', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const analysisRunId = Number(req.params.analysisRunId);
    if (!Number.isFinite(analysisRunId)) return res.status(400).json({ error: 'Invalid analysis run id' });

    const versions = await listAnalysisRunVersions(analysisRunId, userId);
    return res.json({ ok: true, analysisRunId, versions });
  } catch (err: any) {
    console.error('[analysis-runs] list versions error:', err.message);
    return res.status(500).json({ error: 'Failed to list analysis versions' });
  }
});

analysisRunsRouter.post('/analysis-runs/:analysisRunId/versions/:versionNumber/restore', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const analysisRunId = Number(req.params.analysisRunId);
    const versionNumber = Number(req.params.versionNumber);
    if (!Number.isFinite(analysisRunId)) return res.status(400).json({ error: 'Invalid analysis run id' });
    if (!Number.isFinite(versionNumber)) return res.status(400).json({ error: 'Invalid version number' });

    const restored = await restoreAnalysisRunVersion({ analysisRunId, userId, versionNumber });
    if (!restored) return res.status(404).json({ error: 'Analysis version not found' });
    const versions = await listAnalysisRunVersions(analysisRunId, userId);
    const structuredAnalysis = safeRecord(restored.outputs).structuredAnalysis ?? null;

    return res.json({
      ok: true,
      analysisRunId,
      versionNumber: restored.versionNumber,
      assumptions: restored.assumptions,
      analysisData: hydrateAnalysisEvidence(structuredAnalysis, restored.evidence),
      evidence: restored.evidence,
      commentaryMarkdown: restored.commentaryMarkdown,
      versions,
    });
  } catch (err: any) {
    console.error('[analysis-runs] restore version error:', err.message);
    return res.status(500).json({ error: 'Failed to restore analysis version' });
  }
});

analysisRunsRouter.post('/analysis-runs/:analysisRunId/save-model-artifact', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const analysisRunId = Number(req.params.analysisRunId);
    if (!Number.isFinite(analysisRunId)) return res.status(400).json({ error: 'Invalid analysis run id' });

    const [run] = await sql`
      SELECT id, user_id, deal_id, title, analysis_type, input_payload, assumptions, outputs,
             commentary_markdown, canvas_tab_id, version_number
      FROM analysis_runs
      WHERE id = ${analysisRunId} AND user_id = ${userId}
      LIMIT 1
    `;
    if (!run?.id) return res.status(404).json({ error: 'Analysis run not found' });

    const artifactPayload = safeRecord(req.body?.artifactPayload);
    const explicitDealIds = numericDealIdsFromPayload(req.body);
    const payloadDealIds = numericDealIdsFromPayload(artifactPayload);
    const runDealIds = [
      ...(run.deal_id ? [Number(run.deal_id)] : []),
      ...safeArray(safeRecord(run.input_payload).dealIds).map(Number).filter((id: number) => Number.isFinite(id)),
    ];
    const candidateIds = Array.from(new Set([...explicitDealIds, ...payloadDealIds, ...runDealIds]));
    if (candidateIds.length === 0) {
      return res.status(400).json({ error: 'No related deal found for this model artifact' });
    }

    const deals = await sql`
      SELECT id, business_name
      FROM deals
      WHERE user_id = ${userId}
        AND id = ANY(${candidateIds})
    `;
    if (deals.length === 0) return res.status(404).json({ error: 'No related deal found' });

    const menuSlug = typeof req.body?.menuItemSlug === 'string' && req.body.menuItemSlug.trim()
      ? req.body.menuItemSlug.trim()
      : modelArtifactMenuSlug(run.analysis_type ?? null);
    const [menuItem] = await sql`
      SELECT id, slug, name
      FROM menu_items
      WHERE slug = ${menuSlug}
      LIMIT 1
    `;
    if (!menuItem?.id) return res.status(404).json({ error: `Menu item not found: ${menuSlug}` });

    const savedAt = new Date().toISOString();
    const artifactTitle = typeof req.body?.title === 'string' && req.body.title.trim()
      ? req.body.title.trim()
      : `${run.title || menuItem.name} · saved model`;
    const content = buildModelArtifactContent({
      run,
      artifactTitle,
      artifactPayload,
      dealIds: deals.map((deal: any) => Number(deal.id)),
      savedAt,
    });

    const created = [];
    for (const deal of deals as any[]) {
      const [deliverable] = await sql`
        INSERT INTO deliverables (
          deal_id,
          user_id,
          menu_item_id,
          type,
          status,
          content,
          price_charged_cents,
          folder_category,
          doc_class,
          generated_from_snapshot,
          completed_at,
          updated_at
        )
        VALUES (
          ${Number(deal.id)},
          ${userId},
          ${Number(menuItem.id)},
          'model_artifact',
          'complete',
          ${sql.json(content)}::jsonb,
          0,
          'models',
          'working',
          ${sql.json({
            analysisRunId,
            analysisVersion: Number(run.version_number ?? 1),
            canvasTabId: run.canvas_tab_id ?? null,
            artifactKind: content.artifactKind,
            savedAt,
          })}::jsonb,
          NOW(),
          NOW()
        )
        RETURNING id, deal_id, status, created_at, completed_at
      `;
      created.push({
        id: Number(deliverable.id),
        dealId: Number(deliverable.deal_id),
        title: artifactTitle,
        status: deliverable.status,
        savedAt,
        exportUrls: {
          pdf: `/api/deliverables/${deliverable.id}/export/pdf`,
          pptx: `/api/deliverables/${deliverable.id}/export/pptx`,
        },
      });
    }

    await sql`
      UPDATE analysis_runs
      SET deliverable_id = COALESCE(deliverable_id, ${created[0]?.id ?? null}),
          updated_at = NOW()
      WHERE id = ${analysisRunId} AND user_id = ${userId}
    `;

    return res.json({
      ok: true,
      analysisRunId,
      artifactTitle,
      folder: 'Private workspace / Models',
      dataRoomFiled: false,
      deliverables: created,
      message: `Saved ${artifactTitle} to ${created.length} related deal ${created.length === 1 ? 'file library' : 'file libraries'} under Models. It was not added to the data room.`,
    });
  } catch (err: any) {
    console.error('[analysis-runs] save model artifact error:', err.message);
    return res.status(500).json({ error: 'Failed to save model artifact' });
  }
});

analysisRunsRouter.get('/analysis-runs/:analysisRunId', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const analysisRunId = Number(req.params.analysisRunId);
    if (!Number.isFinite(analysisRunId)) return res.status(400).json({ error: 'Invalid analysis run id' });

    const snapshot = await readAnalysisRunSnapshot(analysisRunId, userId);
    if (!snapshot) return res.status(404).json({ error: 'Analysis run not found' });

    const structuredAnalysis = safeRecord(snapshot.outputs).structuredAnalysis ?? null;
    return res.json({
      ok: true,
      analysisRunId,
      dealId: snapshot.dealId,
      analysisType: snapshot.analysisType,
      canvasTabId: snapshot.canvasTabId,
      versionNumber: snapshot.versionNumber,
      assumptions: snapshot.assumptions,
      analysisData: hydrateAnalysisEvidence(structuredAnalysis, snapshot.evidence),
      evidence: snapshot.evidence,
      commentaryMarkdown: snapshot.commentaryMarkdown,
    });
  } catch (err: any) {
    console.error('[analysis-runs] read snapshot error:', err.message);
    return res.status(500).json({ error: 'Failed to read analysis run' });
  }
});
