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
  if (!row) return null;
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

function safeArray(value: unknown): any[] {
  return Array.isArray(value) ? value : [];
}

function safeRecord(value: unknown): Record<string, any> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, any> : {};
}
