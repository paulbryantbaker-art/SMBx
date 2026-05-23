import {
  DEFINITIVE_METHODOLOGY_URI,
  DEFINITIVE_METHODOLOGY_VERSION,
  DEFINITIVE_SPEC_URI,
  DEFINITIVE_SPEC_VERSION,
} from '../constants/definitive.js';
import { createDefinitiveHash } from './definitiveAuditPacket.js';
import { isDefinitiveDealStateTool } from './definitiveDealState.js';
import { resolveDefinitiveMandateContext, type DefinitiveMandateContext } from './definitiveMandateService.js';

interface PersistDealStateCallInput {
  userId: number;
  toolName: string;
  toolInput: Record<string, any>;
  envelope?: Record<string, any>;
  responseBody: Record<string, any>;
}

interface ReadDealStateInput {
  userId: number;
  dealId?: number | null;
  conversationId?: number | null;
  stateCid?: string | null;
}

interface ListPacketsInput extends ReadDealStateInput {
  limit?: number | null;
  packetRowId?: number | null;
}

export async function persistDefinitiveDealStateCall(input: PersistDealStateCallInput) {
  if (!isDefinitiveDealStateTool(input.toolName)) {
    return { ok: false, skipped: true, reason: 'not_deal_state_tool' };
  }
  if (input.responseBody?.ok !== true) {
    return { ok: false, skipped: true, reason: 'tool_not_ok' };
  }

  const toolResult = asRecord(input.responseBody.result);
  const state = extractDealState(toolResult);
  if (!state) {
    return { ok: false, skipped: true, reason: 'no_deal_state_returned' };
  }

  const envelope = asRecord(input.envelope);
  const requestedScopes = Array.isArray(input.responseBody.requiredScopes)
    ? input.responseBody.requiredScopes.map(String)
    : [];
  const mandateContext = await resolveDefinitiveMandateContext({
    userId: input.userId,
    organizationId: nullableNumber(envelope.organizationId),
    billingOrgId: nullableNumber(envelope.billingOrgId),
    sourceAgent: nullableString(envelope.sourceAgent) || 'definitive-mcp-v0.1',
    agentId: envelope.agentId ?? envelope.agent?.agentId ?? null,
    agentPlatformId: nullableString(envelope.agentPlatformId) || nullableString(envelope.agent?.platformId),
    mandateId: nullableString(envelope.mandateId) || nullableString(envelope.mandate?.id),
    requestedScopes,
    sourceSurface: 'mcp',
    metadata: {
      protocol: input.responseBody.protocol || null,
      toolName: input.toolName,
      client: envelope.client || null,
      persistence: 'definitive_deal_state_packets',
    },
  });

  const sql = await getSql();
  const dealId = nullableNumber(envelope.dealId)
    ?? nullableNumber(input.toolInput?.dealId)
    ?? nullableNumber(input.toolInput?.payload?.dealId)
    ?? nullableNumber(state.payload?.dealId);
  const conversationId = nullableNumber(envelope.conversationId)
    ?? nullableNumber(input.toolInput?.conversationId)
    ?? nullableNumber(input.toolInput?.payload?.conversationId)
    ?? nullableNumber(state.payload?.conversationId);
  const sourceSurface = nullableString(envelope.sourceSurface) || 'mcp';
  const inputHash = createDefinitiveHash({
    toolName: input.toolName,
    toolInput: input.toolInput || {},
    envelope: persistenceEnvelope(envelope),
    specVersion: DEFINITIVE_SPEC_VERSION,
    methodologyVersion: DEFINITIVE_METHODOLOGY_VERSION,
  });
  const outputHash = createDefinitiveHash({
    toolName: input.toolName,
    action: toolResult.action || null,
    stateHash: state.stateHash,
    result: toolResult.result || {},
    specVersion: DEFINITIVE_SPEC_VERSION,
    methodologyVersion: DEFINITIVE_METHODOLOGY_VERSION,
  });

  const [snapshot] = await sql`
    INSERT INTO definitive_deal_state_snapshots (
      user_id, deal_id, conversation_id, beneficial_customer_id, billing_org_id,
      mandate_id, agent_id, agent_platform_id, source_surface, tool_name,
      state_id, state_cid, state_hash, revision, parent_cids, idempotency_key,
      payload, classification_key, overlays, signals, missing_input_contract,
      completeness_report, source_index, input_hash, output_hash,
      spec_version, spec_uri, methodology_version, methodology_uri, mandate_chain
    )
    VALUES (
      ${input.userId}, ${dealId}, ${conversationId}, ${mandateContext.beneficialCustomerId},
      ${mandateContext.billingOrgId}, ${mandateContext.mandateId}, ${mandateContext.agentId},
      ${mandateContext.agentPlatformId}, ${sourceSurface}, ${input.toolName},
      ${state.stateId}, ${state.cid}, ${state.stateHash}, ${Number(state.revision || 1)},
      ${sql.json(safeArray(state.parentCids))}::jsonb, ${nullableString(state.idempotencyKey)},
      ${sql.json(asRecord(state.payload))}::jsonb,
      ${sql.json(asRecord(state.classificationKey))}::jsonb,
      ${sql.json(safeArray(state.overlays))}::jsonb,
      ${state.signals == null ? null : sql.json(state.signals)}::jsonb,
      ${sql.json(asRecord(state.missingInputContract))}::jsonb,
      ${sql.json(asRecord(state.completenessReport))}::jsonb,
      ${sql.json(safeArray(state.sourceIndex))}::jsonb,
      ${inputHash}, ${outputHash},
      ${DEFINITIVE_SPEC_VERSION}, ${DEFINITIVE_SPEC_URI},
      ${DEFINITIVE_METHODOLOGY_VERSION}, ${DEFINITIVE_METHODOLOGY_URI},
      ${sql.json(mandateContext.mandateChain)}::jsonb
    )
    RETURNING id, created_at
  `;

  const packet = extractPrimaryPacket(input.toolName, toolResult);
  let packetRow: any = null;
  if (packet) {
    const packetHash = createDefinitiveHash({
      toolName: input.toolName,
      action: toolResult.action || null,
      packetType: packet.packetType,
      packet: packet.payload,
      stateHash: state.stateHash,
      specVersion: DEFINITIVE_SPEC_VERSION,
      methodologyVersion: DEFINITIVE_METHODOLOGY_VERSION,
    });
    const [row] = await sql`
      INSERT INTO definitive_deal_packets (
        state_snapshot_id, user_id, deal_id, conversation_id, beneficial_customer_id, billing_org_id,
        mandate_id, agent_id, agent_platform_id, source_surface, tool_name, action,
        packet_type, packet_id, packet_cid, deal_state_cid, deal_state_hash, packet_hash,
        payload, take_back_artifacts, next_suggested_calls, line_invariant,
        input_hash, output_hash, spec_version, spec_uri, methodology_version, methodology_uri,
        mandate_chain
      )
      VALUES (
        ${Number(snapshot.id)}, ${input.userId}, ${dealId}, ${conversationId},
        ${mandateContext.beneficialCustomerId}, ${mandateContext.billingOrgId},
        ${mandateContext.mandateId}, ${mandateContext.agentId}, ${mandateContext.agentPlatformId},
        ${sourceSurface}, ${input.toolName}, ${nullableString(toolResult.action)},
        ${packet.packetType}, ${packet.packetId}, ${packet.packetCid}, ${state.cid}, ${state.stateHash},
        ${packetHash}, ${sql.json(packet.payload)}::jsonb,
        ${sql.json(packet.takeBackArtifacts)}::jsonb,
        ${sql.json(packet.nextSuggestedCalls)}::jsonb,
        ${nullableString(toolResult.the_line_invariant) || nullableString((packet.payload as Record<string, any>).lineInvariant)},
        ${inputHash}, ${outputHash}, ${DEFINITIVE_SPEC_VERSION}, ${DEFINITIVE_SPEC_URI},
        ${DEFINITIVE_METHODOLOGY_VERSION}, ${DEFINITIVE_METHODOLOGY_URI},
        ${sql.json(mandateContext.mandateChain)}::jsonb
      )
      RETURNING id, packet_type, packet_hash, created_at
    `;
    packetRow = row;
  }

  return {
    ok: true,
    stateSnapshotId: Number(snapshot.id),
    stateCid: state.cid,
    stateHash: state.stateHash,
    packetId: packetRow ? Number(packetRow.id) : null,
    packetType: packetRow?.packet_type || packet?.packetType || null,
    inputHash,
    outputHash,
    mandateChain: mandateContext.mandateChain,
    createdAt: toIso(snapshot.created_at),
  };
}

export async function readLatestDefinitiveDealStateSnapshot(input: ReadDealStateInput) {
  const filters = normalizeReadFilters(input);
  if (!filters.ok) return filters;

  const sql = await getSql();
  const rows = await sql`
    SELECT *
    FROM definitive_deal_state_snapshots
    WHERE user_id = ${input.userId}
      AND (${filters.dealId}::integer IS NULL OR deal_id = ${filters.dealId})
      AND (${filters.conversationId}::integer IS NULL OR conversation_id = ${filters.conversationId})
      AND (${filters.stateCid}::text IS NULL OR state_cid = ${filters.stateCid})
    ORDER BY created_at DESC
    LIMIT 1
  `;
  const row = rows[0];
  if (!row) return { ok: false, error: 'not_found' };
  return { ok: true, snapshot: formatSnapshot(row) };
}

export async function listDefinitiveDealPackets(input: ListPacketsInput) {
  const packetRowId = nullableNumber(input.packetRowId);
  const filters = packetRowId
    ? { ok: true as const, dealId: null, conversationId: null, stateCid: null }
    : normalizeReadFilters(input);
  if (!filters.ok) return filters;

  const sql = await getSql();
  const limit = packetRowId ? 1 : Math.min(Math.max(Number(input.limit || 25), 1), 100);
  const rows = await sql`
    SELECT *
    FROM definitive_deal_packets
    WHERE user_id = ${input.userId}
      AND (${packetRowId}::integer IS NULL OR id = ${packetRowId})
      AND (${filters.dealId}::integer IS NULL OR deal_id = ${filters.dealId})
      AND (${filters.conversationId}::integer IS NULL OR conversation_id = ${filters.conversationId})
      AND (${filters.stateCid}::text IS NULL OR deal_state_cid = ${filters.stateCid})
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  return {
    ok: true,
    packets: rows.map(formatPacket),
  };
}

function extractDealState(toolResult: Record<string, any>) {
  const result = asRecord(toolResult.result);
  return asDealState(result.dealState)
    || asDealState(result.nextDealState)
    || asDealState(result.dealPackage?.dealState)
    || asDealState(result.closeReadiness?.dealState)
    || null;
}

function asDealState(value: unknown): Record<string, any> | null {
  const record = asRecord(value);
  if (!record.cid || !record.stateHash || !record.payload) return null;
  return record;
}

function extractPrimaryPacket(toolName: string, toolResult: Record<string, any>) {
  const result = asRecord(toolResult.result);
  const packetKey = primaryPacketKey(toolName);
  const payload = (packetKey ? asRecord(result[packetKey]) : fallbackPacketPayload(toolName, result)) as Record<string, any>;
  if (!payload || !Object.keys(payload).length) return null;

  const packetType = String(payload.schema || packetTypeForTool(toolName));
  return {
    packetType,
    packetId: nullableString(payload.packetId)
      || nullableString(payload.packageId)
      || nullableString(payload.planId)
      || nullableString(payload.traceId)
      || `${toolName}_${createDefinitiveHash(payload).slice(0, 16)}`,
    packetCid: nullableString(payload.packageCid) || nullableString(payload.cid),
    payload,
    takeBackArtifacts: safeArray(payload.takeBackArtifacts || result.portableTakeBackArtifacts),
    nextSuggestedCalls: safeArray(payload.next_suggested_calls || result.next_suggested_calls),
  };
}

function primaryPacketKey(toolName: string): string | null {
  return ({
    compose_deal_plan: 'dealPlan',
    diff_deal_state: 'dealStateDiff',
    compose_deal_package: 'dealPackage',
    verify_package: 'packageVerification',
    finalize_deal_package: 'finalizedPackage',
    reopen_deal_package: 'reopenRecord',
    resume_deal: 'dealPackage',
    compose_lifecycle_trace: 'lifecycleTrace',
    prepare_ioi_packet: 'ioiPacket',
    prepare_loi_packet: 'loiPacket',
    compose_data_room_index: 'dataRoomIndex',
    prepare_diligence_request: 'diligenceRequest',
    disclose_subset: 'disclosureSubset',
    compose_document_draft: 'documentDraft',
    prepare_negotiation_brief: 'negotiationBrief',
    compose_close_readiness: 'closeReadiness',
    generate_funds_flow: 'fundsFlow',
    compose_pmi_plan: 'pmiPlan',
  } as Record<string, string>)[toolName] || null;
}

function fallbackPacketPayload(toolName: string, result: Record<string, any>) {
  if (toolName === 'ingest_deal_payload' || toolName === 'update_deal_payload' || toolName === 'check_completeness' || toolName === 'clone_deal_state') {
    return {
      schema: 'DealStateControlPacket.v0.1',
      packetId: `${toolName}_${createDefinitiveHash(result).slice(0, 16)}`,
      dealStateCid: result.dealState?.cid,
      dealStateHash: result.dealState?.stateHash,
      classificationKey: result.classificationKey,
      completenessReport: result.completenessReport,
      missingInputContract: result.missingInputContract,
      next_suggested_calls: result.next_suggested_calls,
      takeBackArtifacts: result.portableTakeBackArtifacts || ['DealState', 'CompletenessReport', 'MissingInputContract'],
    };
  }
  return null;
}

function packetTypeForTool(toolName: string) {
  return ({
    compose_deal_plan: 'DealPlan.v0.1',
    diff_deal_state: 'DealStateDiff.v0.1',
    compose_deal_package: 'DealPackage.v0.1',
    verify_package: 'PackageVerification.v0.1',
    finalize_deal_package: 'FinalizedDealPackage.v0.1',
    reopen_deal_package: 'ReopenedDealPackage.v0.1',
    resume_deal: 'DealPackage.v0.1',
    compose_lifecycle_trace: 'LifecycleTrace.v0.1',
    prepare_ioi_packet: 'IOIPacket.v0.1',
    prepare_loi_packet: 'LOIPacket.v0.1',
    compose_data_room_index: 'DataRoomIndex.v0.1',
    prepare_diligence_request: 'DiligenceRequest.v0.1',
    disclose_subset: 'DisclosureSubset.v0.1',
    compose_document_draft: 'DocumentDraft.v0.1',
    prepare_negotiation_brief: 'NegotiationBrief.v0.1',
    compose_close_readiness: 'CloseReadiness.v0.1',
    generate_funds_flow: 'FundsFlow.v0.1',
    compose_pmi_plan: 'PMIPlan.v0.1',
  } as Record<string, string>)[toolName] || 'DealStateControlPacket.v0.1';
}

function normalizeReadFilters(input: ReadDealStateInput) {
  const dealId = nullableNumber(input.dealId);
  const conversationId = nullableNumber(input.conversationId);
  const stateCid = nullableString(input.stateCid);
  if (!dealId && !conversationId && !stateCid) {
    return { ok: false as const, error: 'dealId, conversationId, or stateCid is required' };
  }
  return { ok: true as const, dealId, conversationId, stateCid };
}

function formatSnapshot(row: any) {
  return {
    id: Number(row.id),
    userId: row.user_id == null ? null : Number(row.user_id),
    dealId: row.deal_id == null ? null : Number(row.deal_id),
    conversationId: row.conversation_id == null ? null : Number(row.conversation_id),
    beneficialCustomerId: row.beneficial_customer_id == null ? null : Number(row.beneficial_customer_id),
    billingOrgId: row.billing_org_id == null ? null : Number(row.billing_org_id),
    mandateId: row.mandate_id,
    agentId: row.agent_id,
    agentPlatformId: row.agent_platform_id,
    sourceSurface: row.source_surface,
    toolName: row.tool_name,
    stateId: row.state_id,
    stateCid: row.state_cid,
    stateHash: row.state_hash,
    revision: Number(row.revision || 1),
    parentCids: row.parent_cids || [],
    payload: row.payload || {},
    classificationKey: row.classification_key || {},
    overlays: row.overlays || [],
    signals: row.signals || null,
    missingInputContract: row.missing_input_contract || {},
    completenessReport: row.completeness_report || {},
    sourceIndex: row.source_index || [],
    inputHash: row.input_hash,
    outputHash: row.output_hash,
    specVersion: row.spec_version,
    specUri: row.spec_uri,
    methodologyVersion: row.methodology_version,
    methodologyUri: row.methodology_uri,
    mandateChain: row.mandate_chain || {},
    createdAt: toIso(row.created_at),
  };
}

function formatPacket(row: any) {
  return {
    id: Number(row.id),
    stateSnapshotId: row.state_snapshot_id == null ? null : Number(row.state_snapshot_id),
    userId: row.user_id == null ? null : Number(row.user_id),
    dealId: row.deal_id == null ? null : Number(row.deal_id),
    conversationId: row.conversation_id == null ? null : Number(row.conversation_id),
    toolName: row.tool_name,
    action: row.action,
    packetType: row.packet_type,
    packetId: row.packet_id,
    packetCid: row.packet_cid,
    dealStateCid: row.deal_state_cid,
    dealStateHash: row.deal_state_hash,
    packetHash: row.packet_hash,
    payload: row.payload || {},
    takeBackArtifacts: row.take_back_artifacts || [],
    nextSuggestedCalls: row.next_suggested_calls || [],
    lineInvariant: row.line_invariant,
    inputHash: row.input_hash,
    outputHash: row.output_hash,
    specVersion: row.spec_version,
    methodologyVersion: row.methodology_version,
    mandateChain: row.mandate_chain || {},
    createdAt: toIso(row.created_at),
  };
}

function persistenceEnvelope(envelope: Record<string, any>) {
  return {
    specVersion: envelope.specVersion || null,
    specUri: envelope.specUri || null,
    methodologyVersion: envelope.methodologyVersion || null,
    methodologyUri: envelope.methodologyUri || null,
    sourceAgent: envelope.sourceAgent || null,
    agentId: envelope.agentId ?? envelope.agent?.agentId ?? null,
    agentPlatformId: envelope.agentPlatformId ?? envelope.agent?.platformId ?? null,
    mandateId: envelope.mandateId ?? envelope.mandate?.id ?? null,
    requestedScopes: Array.isArray(envelope.requestedScopes) ? envelope.requestedScopes : [],
    dealId: envelope.dealId ?? null,
    conversationId: envelope.conversationId ?? null,
  };
}

function asRecord(value: unknown): Record<string, any> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, any> : {};
}

function safeArray(value: unknown): any[] {
  return Array.isArray(value) ? value : [];
}

function nullableString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function nullableNumber(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function toIso(value: unknown) {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : String(value);
}

async function getSql() {
  const db = await import('../db.js');
  return db.sql;
}
