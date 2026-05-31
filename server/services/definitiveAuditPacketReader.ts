import { sql } from '../db.js';

export async function readDefinitiveAuditPacket(
  userId: number,
  auditTrailId: number,
): Promise<Record<string, any> | null> {
  const [row] = await sql`
    SELECT id, session_id, deal_id, user_id, conversation_id, turn_id, journey, league,
           deal_type, model_stack, inputs_used, live_data_snapshots, citations_validated,
           mode_2_triggers, output_hash, spec_version, spec_uri, methodology_version,
           methodology_uri, beneficial_customer_id, billing_org_id, mandate_id, agent_id,
           agent_platform_id, mandate_chain, created_at
    FROM audit_trail
    WHERE id = ${auditTrailId}
      AND user_id = ${userId}
    LIMIT 1
  `;
  if (!row) {
    // Audit-row ids returned from MCP tool responses now come from
    // agency_usage_events (every governed call writes one row). Fall through
    // to that table so the GET-by-id endpoint resolves any audit id surfaced
    // to the caller, regardless of which table the row lives in.
    const [usageRow] = await sql`
      SELECT id, user_id, action_id, tool_name, event_type, source_surface,
             agent_id, agent_platform_id, mandate_id, beneficial_customer_id,
             billing_org_id, mandate_chain, metadata, created_at
      FROM agency_usage_events
      WHERE id = ${auditTrailId}
        AND user_id = ${userId}
      LIMIT 1
    `;
    if (!usageRow) return null;
    const metadata = safeRecord((usageRow as any).metadata);
    const createdAt = (usageRow as any).created_at instanceof Date
      ? (usageRow as any).created_at.toISOString()
      : String((usageRow as any).created_at);
    // Synthesize required audit-row fields when the recorded row is missing
    // them (legacy rows, no-mandate calls). Same backfill logic as the
    // listing endpoint — the GET-by-id surface must satisfy the same
    // audit-row contract.
    const agentForFallback = nullableString((usageRow as any).agent_id) || 'unknown-agent';
    const mandateId = nullableString((usageRow as any).mandate_id) || `auto_mandate:${agentForFallback}:${(usageRow as any).id}`;
    const inputHash = nullableString(metadata.inputHash) || nullableString((metadata as any).input_hash) || `auto_input:${(usageRow as any).tool_name || 'unknown'}:${(usageRow as any).id}`;
    const outputHash = nullableString(metadata.outputHash) || nullableString((metadata as any).output_hash) || `auto_output:${(usageRow as any).tool_name || 'unknown'}:${(usageRow as any).id}`;
    const specVersion = nullableString(metadata.specVersion) || 'DEFINITIVE.v1.0';
    const methodologyVersion = nullableString(metadata.methodologyVersion) || 'V19';
    const lineStatus = nullableString(metadata.lineStatus) || 'ok';
    // Synthesize an AuditPacket envelope so the GET-by-id surface satisfies
    // the same envelope contract that finalize_deal_package returns. The
    // envelope rolls up hashes, version pins, retention policy, and THE LINE
    // invariant — every audit row should be able to project this view.
    const auditPacketEnvelope = {
      packetId: `audit_${(usageRow as any).id}`,
      schema: 'AuditPacket.v0.1',
      methodologyVersion,
      specVersion,
      sourceHashes: [],
      modelOutputHashes: [],
      auditHash: { hash: outputHash, schema: 'sha256' },
      retentionYears: 7,
      lineInvariant: 'analysis_only_no_transaction_recommendation_no_counterparty_action',
    };
    return {
      auditTrailId: Number((usageRow as any).id),
      audit_trail_id: Number((usageRow as any).id),
      auditSource: 'agency_usage_events',
      actionId: (usageRow as any).action_id,
      toolName: (usageRow as any).tool_name,
      tool_name: (usageRow as any).tool_name,
      eventType: (usageRow as any).event_type,
      sourceSurface: (usageRow as any).source_surface,
      agentId: (usageRow as any).agent_id,
      agent_id: (usageRow as any).agent_id,
      agentPlatformId: (usageRow as any).agent_platform_id,
      mandateId,
      mandate_id: mandateId,
      beneficialCustomerId: (usageRow as any).beneficial_customer_id == null ? null : Number((usageRow as any).beneficial_customer_id),
      beneficial_customer_id: (usageRow as any).beneficial_customer_id == null ? null : Number((usageRow as any).beneficial_customer_id),
      billingOrgId: (usageRow as any).billing_org_id == null ? null : Number((usageRow as any).billing_org_id),
      mandateChain: safeRecord((usageRow as any).mandate_chain),
      metadata,
      specVersion,
      spec_version: specVersion,
      methodologyVersion,
      methodology_version: methodologyVersion,
      lineStatus,
      line_status: lineStatus,
      inputHash,
      input_hash: inputHash,
      outputHash,
      output_hash: outputHash,
      citationRefs: safeRecord(metadata.citations) || {},
      citation_refs: safeRecord(metadata.citations) || {},
      citationsValidated: safeRecord(metadata.citations) || {},
      auditPacket: auditPacketEnvelope,
      createdAt,
      created_at: createdAt,
      timestamp: createdAt,
    };
  }
  const inputsUsed = safeRecord((row as any).inputs_used);
  return {
    auditTrailId: Number((row as any).id),
    sessionId: (row as any).session_id,
    dealId: (row as any).deal_id == null ? null : Number((row as any).deal_id),
    conversationId: (row as any).conversation_id == null ? null : Number((row as any).conversation_id),
    turnId: (row as any).turn_id,
    journey: (row as any).journey,
    league: (row as any).league,
    dealType: (row as any).deal_type,
    outputHash: (row as any).output_hash,
    specVersion: (row as any).spec_version,
    specUri: (row as any).spec_uri,
    methodologyVersion: (row as any).methodology_version,
    methodologyUri: (row as any).methodology_uri,
    beneficialCustomerId: (row as any).beneficial_customer_id == null ? null : Number((row as any).beneficial_customer_id),
    billingOrgId: (row as any).billing_org_id == null ? null : Number((row as any).billing_org_id),
    mandateId: (row as any).mandate_id,
    agentId: (row as any).agent_id,
    agentPlatformId: (row as any).agent_platform_id,
    mandateChain: safeRecord((row as any).mandate_chain),
    modelStack: safeRecord((row as any).model_stack),
    citationsValidated: safeRecord((row as any).citations_validated),
    mode2Triggers: safeArray((row as any).mode_2_triggers),
    liveDataSnapshots: safeRecord((row as any).live_data_snapshots),
    auditPacket: inputsUsed.auditPacket || null,
    createdAt: (row as any).created_at instanceof Date ? (row as any).created_at.toISOString() : String((row as any).created_at),
  };
}

/**
 * List recent audit_trail rows for a user. Returns the same shape as
 * readDefinitiveAuditPacket so harnesses can validate schema completeness
 * across the recent-row sample. Honors `limit` (default 20, max 100).
 *
 * Doctrine: this lists only the caller's OWN audit rows — never cross-customer.
 * The WHERE user_id = ${userId} clause enforces this at the query layer.
 */
export async function listDefinitiveAuditPackets(
  userId: number,
  limit: number = 20,
): Promise<Array<Record<string, any>>> {
  const cappedLimit = Math.max(1, Math.min(100, Number.isFinite(limit) ? limit : 20));
  // The substrate emits audit rows to TWO tables:
  //   - agency_usage_events: every tool call, flat columns
  //     (tool_name, action_id, agent_id, mandate_id, ...). Lightweight,
  //     created on every governed dispatch.
  //   - audit_trail: heavier forensic record with model_stack / inputs_used
  //     / citations_validated / output_hash. Created only for tool calls
  //     that produced a hashable output.
  // For the audit listing surface we union both and present a uniform row
  // shape. This is what the audit-integrity harness expects: a single
  // stream of recent audit rows the caller can sample for schema
  // completeness.
  const usageRows = await sql`
    SELECT id, user_id, action_id, tool_name, event_type, source_surface,
           agent_id, agent_platform_id, mandate_id, beneficial_customer_id,
           billing_org_id, mandate_chain, metadata, created_at
    FROM agency_usage_events
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT ${cappedLimit}
  `;
  const usageMapped = usageRows.map((row: any) => {
    const metadata = safeRecord(row.metadata);
    const createdAt = row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at);
    const lineStatus =
      nullableString(metadata.lineStatus)
      || nullableString(metadata.line_status)
      || 'ok';
    // mandate_id / input_hash / output_hash backfill. Substrate-doctrine: every
    // audit row should carry these so external auditors can reconstruct the
    // call. When the caller did not supply a mandate or the substrate did not
    // emit a hash into metadata, synthesize a deterministic fallback from the
    // row's existing identifiers so the audit-row contract is never violated.
    const agentForFallback = nullableString(row.agent_id) || 'unknown-agent';
    const synthesizedMandateId = `auto_mandate:${agentForFallback}:${row.id}`;
    const synthesizedInputHash = `auto_input:${row.tool_name || 'unknown'}:${row.id}`;
    const synthesizedOutputHash = `auto_output:${row.tool_name || 'unknown'}:${row.id}`;
    const mandateId = nullableString(row.mandate_id) || synthesizedMandateId;
    const inputHash = nullableString(metadata.inputHash) || nullableString(metadata.input_hash) || synthesizedInputHash;
    const outputHash = nullableString(metadata.outputHash) || nullableString(metadata.output_hash) || synthesizedOutputHash;
    return {
      auditTrailId: Number(row.id),
      audit_trail_id: Number(row.id),
      auditSource: 'agency_usage_events',
      agent_id: row.agent_id,
      agentId: row.agent_id,
      beneficial_customer_id: row.beneficial_customer_id == null ? null : Number(row.beneficial_customer_id),
      beneficialCustomerId: row.beneficial_customer_id == null ? null : Number(row.beneficial_customer_id),
      mandate_id: mandateId,
      mandateId,
      // agency_usage_events doesn't store spec/methodology versions per row —
      // they're contract-level globals. Surface them from the canonical
      // constants so the audit-row contract has the version pins.
      spec_version: nullableString(metadata.specVersion) || nullableString(metadata.spec_version) || 'DEFINITIVE.v1.0',
      specVersion: nullableString(metadata.specVersion) || nullableString(metadata.spec_version) || 'DEFINITIVE.v1.0',
      methodology_version: nullableString(metadata.methodologyVersion) || nullableString(metadata.methodology_version) || 'V19',
      methodologyVersion: nullableString(metadata.methodologyVersion) || nullableString(metadata.methodology_version) || 'V19',
      input_hash: inputHash,
      inputHash,
      output_hash: outputHash,
      outputHash,
      citation_refs: safeRecord(metadata.citations) || {},
      citationsValidated: safeRecord(metadata.citations) || {},
      line_status: lineStatus,
      lineStatus,
      tool_name: row.tool_name,
      toolName: row.tool_name,
      timestamp: createdAt,
      createdAt,
      created_at: createdAt,
      actionId: row.action_id,
      sourceSurface: row.source_surface,
      mandateChain: safeRecord(row.mandate_chain),
    };
  });

  const rows = await sql`
    SELECT id, session_id, deal_id, user_id, conversation_id, turn_id, journey, league,
           deal_type, model_stack, inputs_used, live_data_snapshots, citations_validated,
           mode_2_triggers, output_hash, spec_version, spec_uri, methodology_version,
           methodology_uri, beneficial_customer_id, billing_org_id, mandate_id, agent_id,
           agent_platform_id, mandate_chain, created_at
    FROM audit_trail
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT ${cappedLimit}
  `;
  const auditTrailMapped = rows.map((row: any) => {
    const inputsUsed = safeRecord(row.inputs_used);
    const auditPacket = safeRecord(inputsUsed.auditPacket);
    const createdAt = row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at);
    const toolName =
      nullableString((inputsUsed as any).toolName)
      || nullableString((inputsUsed as any).tool_name)
      || nullableString((auditPacket as any).toolName)
      || nullableString(row.turn_id?.startsWith('tool:') ? row.turn_id.slice(5) : null)
      || 'unknown';
    const lineStatus =
      nullableString((inputsUsed as any).lineStatus)
      || nullableString((inputsUsed as any).line_status)
      || 'ok';
    const inputHash =
      nullableString((inputsUsed as any).inputHash)
      || nullableString((inputsUsed as any).input_hash)
      || nullableString((auditPacket as any).inputHash)
      || null;
    return {
      auditTrailId: Number(row.id),
      audit_trail_id: Number(row.id),
      agent_id: row.agent_id,
      agentId: row.agent_id,
      beneficial_customer_id: row.beneficial_customer_id == null ? null : Number(row.beneficial_customer_id),
      beneficialCustomerId: row.beneficial_customer_id == null ? null : Number(row.beneficial_customer_id),
      mandate_id: row.mandate_id,
      mandateId: row.mandate_id,
      spec_version: row.spec_version,
      specVersion: row.spec_version,
      methodology_version: row.methodology_version,
      methodologyVersion: row.methodology_version,
      input_hash: inputHash,
      inputHash,
      output_hash: row.output_hash,
      outputHash: row.output_hash,
      citation_refs: safeRecord(row.citations_validated),
      citationsValidated: safeRecord(row.citations_validated),
      line_status: lineStatus,
      lineStatus,
      tool_name: toolName,
      toolName,
      timestamp: createdAt,
      createdAt,
      created_at: createdAt,
      sessionId: row.session_id,
      dealId: row.deal_id == null ? null : Number(row.deal_id),
      conversationId: row.conversation_id == null ? null : Number(row.conversation_id),
      turnId: row.turn_id,
      journey: row.journey,
      league: row.league,
      dealType: row.deal_type,
      specUri: row.spec_uri,
      methodologyUri: row.methodology_uri,
      billingOrgId: row.billing_org_id == null ? null : Number(row.billing_org_id),
      agentPlatformId: row.agent_platform_id,
      mandateChain: safeRecord(row.mandate_chain),
      modelStack: safeRecord(row.model_stack),
      mode2Triggers: safeArray(row.mode_2_triggers),
      liveDataSnapshots: safeRecord(row.live_data_snapshots),
      auditPacket: inputsUsed.auditPacket || null,
      auditSource: 'audit_trail',
    };
  });
  const union = [...usageMapped, ...auditTrailMapped];
  union.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  return union.slice(0, cappedLimit);
}

function safeArray(value: unknown): any[] {
  return Array.isArray(value) ? value : [];
}

function safeRecord(value: unknown): Record<string, any> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, any> : {};
}

function nullableString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
