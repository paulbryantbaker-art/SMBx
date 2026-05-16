import { sql } from '../db.js';

export type AnalysisRunStatus = 'queued' | 'running' | 'complete' | 'failed';

interface AnalysisRunInput {
  userId: number;
  dealId?: number | null;
  conversationId?: number | null;
  definitionSlug?: string | null;
  analysisType: string;
  title: string;
  status?: AnalysisRunStatus;
  scope?: 'deal' | 'portfolio' | 'comparison' | 'document';
  source?: 'yulia_tool' | 'ui_action' | 'scheduled_brief' | 'system';
  inputPayload?: Record<string, any>;
  assumptions?: Record<string, any>;
  outputs?: Record<string, any>;
  commentaryMarkdown?: string | null;
  marketContext?: Record<string, any>;
  riskFlags?: unknown[];
  missingData?: unknown[];
  professionalTriggers?: unknown[];
  canvasTabId?: string | null;
  deliverableId?: number | null;
  modelPreference?: string | null;
  modelUsed?: string | null;
}

interface AnalysisRunRow {
  id: number;
  canvas_tab_id: string | null;
  version_number: number;
}

interface AnalysisRunSnapshot {
  id: number;
  dealId: number | null;
  analysisType: string | null;
  canvasTabId: string | null;
  versionNumber: number;
  inputPayload: Record<string, any>;
  assumptions: Record<string, any>;
  outputs: Record<string, any>;
  commentaryMarkdown: string | null;
  evidence: AnalysisEvidenceItem[];
}

interface EvidenceSyncRow {
  sourceType: string;
  sourceId: string | null;
  title: string | null;
  citation: string | null;
  excerpt: string | null;
  confidence: number | null;
}

export interface AnalysisEvidenceItem {
  id: number;
  sourceType: string;
  sourceId: string | null;
  title: string | null;
  citation: string | null;
  excerpt: string | null;
  confidence: number | null;
  createdAt: string;
}

export interface AnalysisVersionSummary {
  versionNumber: number;
  changeReason: string | null;
  createdAt: string;
  scenarioName: string | null;
  summary: string | null;
}

export interface ModelTabSnapshot {
  tabId: string;
  title: string;
  modelType: string;
  state: Record<string, any>;
  sourcePayload: Record<string, any>;
  analysisRunId: number | null;
  analysisRun?: AnalysisRunSnapshot | null;
  versionNumber?: number | null;
}

const MISSING_ANALYSIS_SCHEMA = /relation .*analysis_|relation .*model_tabs|does not exist/i;

function safeRecord(value: Record<string, any> | undefined): Record<string, any> {
  return value && typeof value === 'object' ? value : {};
}

function safeArray(value: unknown[] | undefined): any[] {
  return Array.isArray(value) ? value : [];
}

function evidenceConfidence(value: unknown): number | null {
  if (value === 'high') return 0.9;
  if (value === 'medium') return 0.65;
  if (value === 'low') return 0.35;
  return null;
}

function evidenceRefsFromOutputs(outputs: Record<string, any>): EvidenceSyncRow[] {
  const structured = safeRecord(outputs.structuredAnalysis);
  const refs = Array.isArray(structured.evidenceRefs) ? structured.evidenceRefs : [];
  return refs
    .map((raw: any) => {
      const ref = safeRecord(raw);
      const label = typeof ref.label === 'string' ? ref.label.trim() : '';
      const source = typeof ref.source === 'string' ? ref.source.trim() : '';
      const value = typeof ref.value === 'string' ? ref.value.trim() : '';
      const detail = typeof ref.detail === 'string' ? ref.detail.trim() : '';
      const sourceType = typeof ref.type === 'string' && ref.type.trim() ? ref.type.trim() : 'analysis_evidence';
      if (!label && !source && !value && !detail) return null;
      return {
        sourceType,
        sourceId: typeof ref.sourceId === 'string' ? ref.sourceId : null,
        title: label || null,
        citation: source || null,
        excerpt: [value, detail].filter(Boolean).join(' — ') || null,
        confidence: evidenceConfidence(ref.confidence),
      };
    })
    .filter((item): item is EvidenceSyncRow => item != null)
    .slice(0, 50);
}

async function syncAnalysisEvidence(analysisRunId: number, outputs: Record<string, any>): Promise<void> {
  const refs = evidenceRefsFromOutputs(outputs);
  await sql`DELETE FROM analysis_evidence WHERE analysis_run_id = ${analysisRunId}`;
  for (const ref of refs) {
    await sql`
      INSERT INTO analysis_evidence (
        analysis_run_id,
        source_type,
        source_id,
        title,
        citation,
        excerpt,
        permissions,
        confidence
      )
      VALUES (
        ${analysisRunId},
        ${ref.sourceType},
        ${ref.sourceId},
        ${ref.title},
        ${ref.citation},
        ${ref.excerpt},
        ${sql.json({ source: 'structuredAnalysis.evidenceRefs', visibility: 'analysis_run_owner' })}::jsonb,
        ${ref.confidence}
      )
    `;
  }
}

function formatAnalysisEvidence(row: any): AnalysisEvidenceItem {
  return {
    id: Number(row.id),
    sourceType: row.source_type,
    sourceId: row.source_id ?? null,
    title: row.title ?? null,
    citation: row.citation ?? null,
    excerpt: row.excerpt ?? null,
    confidence: row.confidence == null ? null : Number(row.confidence),
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
  };
}

export async function listAnalysisEvidence(
  analysisRunId: number,
  userId: number,
): Promise<AnalysisEvidenceItem[]> {
  try {
    const rows = await sql`
      SELECT
        e.id,
        e.source_type,
        e.source_id,
        e.title,
        e.citation,
        e.excerpt,
        e.confidence,
        e.created_at
      FROM analysis_evidence e
      JOIN analysis_runs r ON r.id = e.analysis_run_id
      WHERE e.analysis_run_id = ${analysisRunId}
        AND r.user_id = ${userId}
      ORDER BY e.id ASC
    `;
    return rows.map(formatAnalysisEvidence);
  } catch (err) {
    if (isMissingAnalysisSchemaError(err)) return [];
    throw err;
  }
}

function versionScenarioName(assumptions: Record<string, any>, changeReason?: string | null): string | null {
  if (typeof assumptions._scenario_name === 'string' && assumptions._scenario_name.trim()) {
    return assumptions._scenario_name.trim();
  }
  const reason = changeReason || '';
  const match = reason.match(/^Saved (?:mobile )?scenario:\s*(.+)$/i);
  return match?.[1]?.trim() || null;
}

function versionSummary(outputs: Record<string, any>): string | null {
  const structured = safeRecord(outputs.structuredAnalysis);
  if (typeof structured.summary === 'string' && structured.summary.trim()) return structured.summary.trim();
  if (typeof structured.yuliaRead === 'string' && structured.yuliaRead.trim()) return structured.yuliaRead.trim();
  return null;
}

function isMissingAnalysisSchemaError(err: unknown): boolean {
  return MISSING_ANALYSIS_SCHEMA.test((err as Error)?.message || '');
}

async function resolveDefinitionId(slug: string | null | undefined, title: string): Promise<number | null> {
  if (!slug) return null;

  const [existing] = await sql`
    SELECT id
    FROM analysis_definitions
    WHERE slug = ${slug}
    LIMIT 1
  `;
  if (existing?.id) return Number(existing.id);

  const [created] = await sql`
    INSERT INTO analysis_definitions (
      slug,
      title,
      category,
      description,
      default_tool_name,
      methodology_refs,
      guardrail_tags
    )
    VALUES (
      ${slug},
      ${title},
      'analysis',
      'Runtime-created analysis definition. Promote this to a seeded definition if it becomes a core workflow.',
      'run_analysis',
      ${sql.json(['METHODOLOGY_V17 §11 Interactive Canvas'])}::jsonb,
      ${sql.json(['analysis_only'])}::jsonb
    )
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title,
      updated_at = NOW()
    RETURNING id
  `;

  return created?.id ? Number(created.id) : null;
}

export async function createAnalysisRun(input: AnalysisRunInput): Promise<AnalysisRunRow | null> {
  try {
    const definitionId = await resolveDefinitionId(input.definitionSlug ?? input.analysisType, input.title);
    const canvasTabId = input.canvasTabId || `analysis-${input.analysisType}-${Date.now()}`;
    const status = input.status || 'queued';

    const [row] = await sql`
      INSERT INTO analysis_runs (
        user_id,
        deal_id,
        conversation_id,
        definition_id,
        analysis_type,
        title,
        status,
        scope,
        source,
        input_payload,
        assumptions,
        outputs,
        commentary_markdown,
        market_context,
        risk_flags,
        missing_data,
        professional_triggers,
        canvas_tab_id,
        deliverable_id,
        model_preference,
        model_used,
        completed_at
      )
      VALUES (
        ${input.userId},
        ${input.dealId ?? null},
        ${input.conversationId ?? null},
        ${definitionId},
        ${input.analysisType},
        ${input.title},
        ${status},
        ${input.scope || 'deal'},
        ${input.source || 'yulia_tool'},
        ${sql.json(safeRecord(input.inputPayload))}::jsonb,
        ${sql.json(safeRecord(input.assumptions))}::jsonb,
        ${sql.json(safeRecord(input.outputs))}::jsonb,
        ${input.commentaryMarkdown ?? null},
        ${sql.json(safeRecord(input.marketContext))}::jsonb,
        ${sql.json(safeArray(input.riskFlags))}::jsonb,
        ${sql.json(safeArray(input.missingData))}::jsonb,
        ${sql.json(safeArray(input.professionalTriggers))}::jsonb,
        ${canvasTabId},
        ${input.deliverableId ?? null},
        ${input.modelPreference ?? null},
        ${input.modelUsed ?? null},
        ${status === 'complete' ? new Date() : null}
      )
      RETURNING id, canvas_tab_id, version_number
    `;

    await sql`
      INSERT INTO analysis_versions (
        analysis_run_id,
        version_number,
        input_payload,
        assumptions,
        outputs,
        commentary_markdown,
        changed_by_user_id,
        change_reason
      )
      VALUES (
        ${row.id},
        ${row.version_number ?? 1},
        ${sql.json(safeRecord(input.inputPayload))}::jsonb,
        ${sql.json(safeRecord(input.assumptions))}::jsonb,
        ${sql.json(safeRecord(input.outputs))}::jsonb,
        ${input.commentaryMarkdown ?? null},
        ${input.userId},
        'Initial analysis run'
      )
      ON CONFLICT (analysis_run_id, version_number) DO NOTHING
    `;

    await syncAnalysisEvidence(Number(row.id), safeRecord(input.outputs));

    return {
      id: Number(row.id),
      canvas_tab_id: row.canvas_tab_id ?? canvasTabId,
      version_number: Number(row.version_number ?? 1),
    };
  } catch (err: any) {
    if (isMissingAnalysisSchemaError(err)) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[analysisRuntime] analysis schema missing; run migration 063_analysis_runtime.sql');
      }
      return null;
    }
    throw err;
  }
}

export async function updateAnalysisRunStatus(
  analysisRunId: number,
  status: AnalysisRunStatus,
  outputs?: Record<string, any>,
  commentaryMarkdown?: string | null,
): Promise<void> {
  try {
    await sql`
      UPDATE analysis_runs
      SET status = ${status},
          outputs = CASE WHEN ${outputs ? true : false} THEN ${sql.json(outputs || {})}::jsonb ELSE outputs END,
          commentary_markdown = COALESCE(${commentaryMarkdown ?? null}, commentary_markdown),
          completed_at = CASE WHEN ${status} = 'complete' THEN NOW() ELSE completed_at END,
          updated_at = NOW()
      WHERE id = ${analysisRunId}
    `;
    if (outputs) await syncAnalysisEvidence(analysisRunId, safeRecord(outputs));
  } catch (err) {
    if (!isMissingAnalysisSchemaError(err)) throw err;
  }
}

export async function readAnalysisRunSnapshot(analysisRunId: number, userId: number): Promise<AnalysisRunSnapshot | null> {
  try {
    const [row] = await sql`
      SELECT id, deal_id, analysis_type, input_payload, canvas_tab_id, version_number, assumptions, outputs, commentary_markdown
      FROM analysis_runs
      WHERE id = ${analysisRunId} AND user_id = ${userId}
      LIMIT 1
    `;
    if (!row?.id) return null;
    const evidence = await listAnalysisEvidence(Number(row.id), userId);
    return {
      id: Number(row.id),
      dealId: row.deal_id ? Number(row.deal_id) : null,
      analysisType: row.analysis_type ?? null,
      canvasTabId: row.canvas_tab_id ?? null,
      versionNumber: Number(row.version_number ?? 1),
      inputPayload: safeRecord(row.input_payload),
      assumptions: safeRecord(row.assumptions),
      outputs: safeRecord(row.outputs),
      commentaryMarkdown: row.commentary_markdown ?? null,
      evidence,
    };
  } catch (err) {
    if (isMissingAnalysisSchemaError(err)) return null;
    throw err;
  }
}

export async function listAnalysisRunVersions(
  analysisRunId: number,
  userId: number,
  limit = 12,
): Promise<AnalysisVersionSummary[]> {
  try {
    const rows = await sql`
      SELECT
        v.version_number,
        v.change_reason,
        v.created_at,
        v.assumptions,
        v.outputs
      FROM analysis_versions v
      JOIN analysis_runs r ON r.id = v.analysis_run_id
      WHERE v.analysis_run_id = ${analysisRunId}
        AND r.user_id = ${userId}
      ORDER BY v.version_number DESC
      LIMIT ${Math.max(1, Math.min(50, limit))}
    `;

    return rows.map((row: any) => {
      const assumptions = safeRecord(row.assumptions);
      const outputs = safeRecord(row.outputs);
      return {
        versionNumber: Number(row.version_number),
        changeReason: row.change_reason ?? null,
        createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
        scenarioName: versionScenarioName(assumptions, row.change_reason),
        summary: versionSummary(outputs),
      };
    });
  } catch (err) {
    if (isMissingAnalysisSchemaError(err)) return [];
    throw err;
  }
}

export async function restoreAnalysisRunVersion(input: {
  analysisRunId: number;
  userId: number;
  versionNumber: number;
}): Promise<AnalysisRunSnapshot | null> {
  try {
    const [current] = await sql`
      SELECT id, user_id, deal_id, analysis_type, canvas_tab_id, version_number
      FROM analysis_runs
      WHERE id = ${input.analysisRunId} AND user_id = ${input.userId}
      LIMIT 1
    `;
    if (!current?.id) return null;

    const [version] = await sql`
      SELECT input_payload, assumptions, outputs, commentary_markdown
      FROM analysis_versions
      WHERE analysis_run_id = ${input.analysisRunId}
        AND version_number = ${input.versionNumber}
      LIMIT 1
    `;
    if (!version) return null;

    const nextVersion = Number(current.version_number ?? 1) + 1;
    const nextInputPayload = safeRecord(version.input_payload);
    const nextAssumptions = safeRecord(version.assumptions);
    const nextOutputs = safeRecord(version.outputs);
    const nextCommentary = version.commentary_markdown ?? null;

    const [updated] = await sql`
      UPDATE analysis_runs
      SET input_payload = ${sql.json(nextInputPayload)}::jsonb,
          assumptions = ${sql.json(nextAssumptions)}::jsonb,
          outputs = ${sql.json(nextOutputs)}::jsonb,
          commentary_markdown = ${nextCommentary},
          version_number = ${nextVersion},
          updated_at = NOW()
      WHERE id = ${input.analysisRunId} AND user_id = ${input.userId}
      RETURNING id, deal_id, analysis_type, input_payload, canvas_tab_id, version_number, assumptions, outputs, commentary_markdown
    `;

    await sql`
      INSERT INTO analysis_versions (
        analysis_run_id,
        version_number,
        input_payload,
        assumptions,
        outputs,
        commentary_markdown,
        changed_by_user_id,
        change_reason
      )
      VALUES (
        ${input.analysisRunId},
        ${nextVersion},
        ${sql.json(nextInputPayload)}::jsonb,
        ${sql.json(nextAssumptions)}::jsonb,
        ${sql.json(nextOutputs)}::jsonb,
        ${nextCommentary},
        ${input.userId},
        ${`Restored version ${input.versionNumber}`}
      )
      ON CONFLICT (analysis_run_id, version_number) DO NOTHING
    `;

    await syncAnalysisEvidence(input.analysisRunId, nextOutputs);
    const evidence = await listAnalysisEvidence(input.analysisRunId, input.userId);

    return {
      id: Number(updated.id),
      dealId: updated.deal_id ? Number(updated.deal_id) : null,
      analysisType: updated.analysis_type ?? null,
      canvasTabId: updated.canvas_tab_id ?? null,
      versionNumber: Number(updated.version_number ?? nextVersion),
      inputPayload: safeRecord(updated.input_payload),
      assumptions: safeRecord(updated.assumptions),
      outputs: safeRecord(updated.outputs),
      commentaryMarkdown: updated.commentary_markdown ?? null,
      evidence,
    };
  } catch (err) {
    if (isMissingAnalysisSchemaError(err)) return null;
    throw err;
  }
}

export async function updateAnalysisRunSnapshot(input: {
  analysisRunId: number;
  userId: number;
  assumptionUpdates?: Record<string, any>;
  outputUpdates?: Record<string, any>;
  commentaryMarkdown?: string | null;
  changeReason?: string;
}): Promise<AnalysisRunSnapshot | null> {
  try {
    const [current] = await sql`
      SELECT id, user_id, deal_id, analysis_type, input_payload, assumptions, outputs, commentary_markdown, canvas_tab_id, version_number
      FROM analysis_runs
      WHERE id = ${input.analysisRunId} AND user_id = ${input.userId}
      LIMIT 1
    `;
    if (!current?.id) return null;

    const nextVersion = Number(current.version_number ?? 1) + 1;
    const nextAssumptions = {
      ...safeRecord(current.assumptions),
      ...safeRecord(input.assumptionUpdates),
    };
    const nextOutputs = {
      ...safeRecord(current.outputs),
      ...safeRecord(input.outputUpdates),
    };
    const nextCommentary = input.commentaryMarkdown ?? current.commentary_markdown ?? null;

    const [updated] = await sql`
      UPDATE analysis_runs
      SET assumptions = ${sql.json(nextAssumptions)}::jsonb,
          outputs = ${sql.json(nextOutputs)}::jsonb,
          commentary_markdown = ${nextCommentary},
          version_number = ${nextVersion},
          updated_at = NOW()
      WHERE id = ${input.analysisRunId} AND user_id = ${input.userId}
      RETURNING id, canvas_tab_id, version_number, assumptions, outputs, commentary_markdown
    `;

    await sql`
      INSERT INTO analysis_versions (
        analysis_run_id,
        version_number,
        input_payload,
        assumptions,
        outputs,
        commentary_markdown,
        changed_by_user_id,
        change_reason
      )
      VALUES (
        ${input.analysisRunId},
        ${nextVersion},
        ${sql.json(safeRecord(current.input_payload))}::jsonb,
        ${sql.json(nextAssumptions)}::jsonb,
        ${sql.json(nextOutputs)}::jsonb,
        ${nextCommentary},
        ${input.userId},
        ${input.changeReason || 'Updated analysis assumptions'}
      )
      ON CONFLICT (analysis_run_id, version_number) DO NOTHING
    `;

    await syncAnalysisEvidence(input.analysisRunId, nextOutputs);
    const evidence = await listAnalysisEvidence(input.analysisRunId, input.userId);

    return {
      id: Number(updated.id),
      dealId: current.deal_id ? Number(current.deal_id) : null,
      analysisType: current.analysis_type ?? null,
      canvasTabId: updated.canvas_tab_id ?? null,
      versionNumber: Number(updated.version_number ?? nextVersion),
      inputPayload: safeRecord(current.input_payload),
      assumptions: safeRecord(updated.assumptions),
      outputs: safeRecord(updated.outputs),
      commentaryMarkdown: updated.commentary_markdown ?? null,
      evidence,
    };
  } catch (err) {
    if (isMissingAnalysisSchemaError(err)) return null;
    throw err;
  }
}

export async function createModelTabRecord(input: {
  analysisRunId?: number | null;
  conversationId?: number | null;
  tabId: string;
  modelType: string;
  title: string;
  state?: Record<string, any>;
  sourcePayload?: Record<string, any>;
}): Promise<void> {
  if (!input.conversationId) return;

  try {
    await sql`
      INSERT INTO model_tabs (
        analysis_run_id,
        conversation_id,
        tab_id,
        model_type,
        title,
        state,
        source_payload,
        is_active
      )
      VALUES (
        ${input.analysisRunId ?? null},
        ${input.conversationId},
        ${input.tabId},
        ${input.modelType},
        ${input.title},
        ${sql.json(safeRecord(input.state))}::jsonb,
        ${sql.json(safeRecord(input.sourcePayload))}::jsonb,
        true
      )
      ON CONFLICT (conversation_id, tab_id) DO UPDATE SET
        analysis_run_id = EXCLUDED.analysis_run_id,
        model_type = EXCLUDED.model_type,
        title = EXCLUDED.title,
        state = EXCLUDED.state,
        source_payload = EXCLUDED.source_payload,
        is_active = true,
        updated_at = NOW()
    `;
  } catch (err) {
    if (!isMissingAnalysisSchemaError(err)) throw err;
  }
}

async function findModelTab(conversationId: number, tabId: string): Promise<any | null> {
  const rows = tabId === 'active'
    ? await sql`
        SELECT *
        FROM model_tabs
        WHERE conversation_id = ${conversationId} AND is_active = true
        ORDER BY updated_at DESC
        LIMIT 1
      `
    : await sql`
        SELECT *
        FROM model_tabs
        WHERE conversation_id = ${conversationId} AND tab_id = ${tabId}
        LIMIT 1
      `;
  return rows[0] ?? null;
}

async function findAnalysisRunByTab(conversationId: number, tabId: string, userId?: number): Promise<any | null> {
  if (tabId === 'active') return null;
  const rows = userId
    ? await sql`
        SELECT *
        FROM analysis_runs
        WHERE conversation_id = ${conversationId}
          AND user_id = ${userId}
          AND canvas_tab_id = ${tabId}
        ORDER BY updated_at DESC
        LIMIT 1
      `
    : await sql`
        SELECT *
        FROM analysis_runs
        WHERE conversation_id = ${conversationId}
          AND canvas_tab_id = ${tabId}
        ORDER BY updated_at DESC
        LIMIT 1
      `;
  return rows[0] ?? null;
}

function formatModelTabSnapshot(
  tab: any,
  analysisRun?: any | null,
  evidence: AnalysisEvidenceItem[] = [],
): ModelTabSnapshot {
  const run = analysisRun
    ? {
        id: Number(analysisRun.id),
        dealId: analysisRun.deal_id ? Number(analysisRun.deal_id) : null,
        analysisType: analysisRun.analysis_type ?? null,
        canvasTabId: analysisRun.canvas_tab_id ?? null,
        versionNumber: Number(analysisRun.version_number ?? 1),
        inputPayload: safeRecord(analysisRun.input_payload),
        assumptions: safeRecord(analysisRun.assumptions),
        outputs: safeRecord(analysisRun.outputs),
        commentaryMarkdown: analysisRun.commentary_markdown ?? null,
        evidence,
      }
    : null;

  return {
    tabId: tab.tab_id,
    title: tab.title,
    modelType: tab.model_type,
    state: safeRecord(tab.state),
    sourcePayload: safeRecord(tab.source_payload),
    analysisRunId: tab.analysis_run_id ? Number(tab.analysis_run_id) : null,
    analysisRun: run,
    versionNumber: run?.versionNumber ?? null,
  };
}

export async function readModelTabState(input: {
  conversationId?: number | null;
  tabId: string;
  userId?: number;
}): Promise<ModelTabSnapshot | null> {
  if (!input.conversationId) return null;

  try {
    const tab = await findModelTab(input.conversationId, input.tabId);
    if (tab) {
      const [analysisRun] = tab.analysis_run_id
        ? await sql`
            SELECT id, deal_id, analysis_type, input_payload, canvas_tab_id, version_number, assumptions, outputs, commentary_markdown
            FROM analysis_runs
            WHERE id = ${tab.analysis_run_id}
              ${input.userId ? sql`AND user_id = ${input.userId}` : sql``}
            LIMIT 1
          `
        : [null];
      const evidence = analysisRun?.id && input.userId
        ? await listAnalysisEvidence(Number(analysisRun.id), input.userId)
        : [];
      return formatModelTabSnapshot(tab, analysisRun ?? null, evidence);
    }

    const analysisRun = await findAnalysisRunByTab(input.conversationId, input.tabId, input.userId);
    if (!analysisRun?.id) return null;

    return {
      tabId: analysisRun.canvas_tab_id,
      title: analysisRun.title,
      modelType: analysisRun.analysis_type,
      state: {
        assumptions: safeRecord(analysisRun.assumptions),
        outputs: safeRecord(analysisRun.outputs),
      },
      sourcePayload: safeRecord(analysisRun.input_payload),
      analysisRunId: Number(analysisRun.id),
      analysisRun: {
        id: Number(analysisRun.id),
        dealId: analysisRun.deal_id ? Number(analysisRun.deal_id) : null,
        analysisType: analysisRun.analysis_type ?? null,
        canvasTabId: analysisRun.canvas_tab_id ?? null,
        versionNumber: Number(analysisRun.version_number ?? 1),
        inputPayload: safeRecord(analysisRun.input_payload),
        assumptions: safeRecord(analysisRun.assumptions),
        outputs: safeRecord(analysisRun.outputs),
        commentaryMarkdown: analysisRun.commentary_markdown ?? null,
        evidence: input.userId ? await listAnalysisEvidence(Number(analysisRun.id), input.userId) : [],
      },
      versionNumber: Number(analysisRun.version_number ?? 1),
    };
  } catch (err) {
    if (isMissingAnalysisSchemaError(err)) return null;
    throw err;
  }
}

export async function updateModelTabState(input: {
  conversationId?: number | null;
  userId: number;
  tabId: string;
  updates: Record<string, any>;
  changeReason?: string;
  skipAnalysisRunUpdate?: boolean;
}): Promise<ModelTabSnapshot | null> {
  if (!input.conversationId) return null;

  try {
    const tab = await findModelTab(input.conversationId, input.tabId);
    if (tab) {
      const nextState = {
        ...safeRecord(tab.state),
        ...safeRecord(input.updates),
      };
      await sql`
        UPDATE model_tabs
        SET state = ${sql.json(nextState)}::jsonb,
            updated_at = NOW()
        WHERE id = ${tab.id}
      `;

      let analysisRun: AnalysisRunSnapshot | null = null;
      if (tab.analysis_run_id && !input.skipAnalysisRunUpdate) {
        analysisRun = await updateAnalysisRunSnapshot({
          analysisRunId: Number(tab.analysis_run_id),
          userId: input.userId,
          assumptionUpdates: safeRecord(input.updates),
          outputUpdates: { state: nextState },
          changeReason: input.changeReason || 'Yulia updated model state',
        });
      }

      return {
        tabId: tab.tab_id,
        title: tab.title,
        modelType: tab.model_type,
        state: nextState,
        sourcePayload: safeRecord(tab.source_payload),
        analysisRunId: tab.analysis_run_id ? Number(tab.analysis_run_id) : null,
        analysisRun,
        versionNumber: analysisRun?.versionNumber ?? null,
      };
    }

    const analysisRun = await findAnalysisRunByTab(input.conversationId, input.tabId, input.userId);
    if (!analysisRun?.id) return null;
    if (input.skipAnalysisRunUpdate) {
      return {
        tabId: analysisRun.canvas_tab_id || input.tabId,
        title: analysisRun.title,
        modelType: analysisRun.analysis_type,
        state: { ...safeRecord(analysisRun.assumptions), ...safeRecord(input.updates) },
        sourcePayload: safeRecord(analysisRun.input_payload),
        analysisRunId: Number(analysisRun.id),
        analysisRun: {
          id: Number(analysisRun.id),
          dealId: analysisRun.deal_id ? Number(analysisRun.deal_id) : null,
          analysisType: analysisRun.analysis_type ?? null,
          canvasTabId: analysisRun.canvas_tab_id ?? null,
          versionNumber: Number(analysisRun.version_number ?? 1),
          inputPayload: safeRecord(analysisRun.input_payload),
          assumptions: safeRecord(analysisRun.assumptions),
          outputs: safeRecord(analysisRun.outputs),
          commentaryMarkdown: analysisRun.commentary_markdown ?? null,
          evidence: [],
        },
        versionNumber: Number(analysisRun.version_number ?? 1),
      };
    }

    const updatedRun = await updateAnalysisRunSnapshot({
      analysisRunId: Number(analysisRun.id),
      userId: input.userId,
      assumptionUpdates: safeRecord(input.updates),
      outputUpdates: { state: { ...safeRecord(analysisRun.assumptions), ...safeRecord(input.updates) } },
      changeReason: input.changeReason || 'Yulia updated analysis state',
    });
    if (!updatedRun) return null;

    return {
      tabId: updatedRun.canvasTabId || input.tabId,
      title: analysisRun.title,
      modelType: analysisRun.analysis_type,
      state: {
        assumptions: updatedRun.assumptions,
        outputs: updatedRun.outputs,
      },
      sourcePayload: safeRecord(analysisRun.input_payload),
      analysisRunId: updatedRun.id,
      analysisRun: updatedRun,
      versionNumber: updatedRun.versionNumber,
    };
  } catch (err) {
    if (isMissingAnalysisSchemaError(err)) return null;
    throw err;
  }
}
