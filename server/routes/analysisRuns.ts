import { Router } from 'express';
import {
  createAnalysisRun,
  listAnalysisRunVersions,
  readAnalysisRunSnapshot,
  restoreAnalysisRunVersion,
  updateAnalysisRunSnapshot,
} from '../services/analysisRuntime.js';
import { buildDealComparisonAnalysis, buildDeterministicAnalysis } from '../services/deterministicAnalysisEngine.js';
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
    deal,
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
      deal,
      menuItemSlug,
      assumptionOverrides: safeRecord(req.body?.assumptionOverrides),
    });

    const tabTitle = `${deal.business_name || 'Deal'} · ${analysisData.title || humanizeAnalysisType(analysisType)}`;
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
    const deals = dealIds.map(id => rowById.get(id)).filter(Boolean);
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
