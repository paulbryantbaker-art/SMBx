import { sql } from '../db.js';
import type { AgencyActionContract } from './agencyActionRegistry.js';

export interface AgencyStagedAction {
  id: number;
  user_id: number;
  conversation_id: number | null;
  action_id?: string | null;
  tool_name: string;
  action_label: string;
  permission_level: string | null;
  risk_level: string | null;
  write_scope: string | null;
  input: Record<string, any>;
  status: 'pending' | 'confirmed' | 'canceled' | 'executed' | 'blocked' | 'failed';
  result?: Record<string, any> | null;
  reason?: string | null;
  created_at: string;
  updated_at: string;
}

function normalizeAction(row: any): AgencyStagedAction {
  return {
    ...row,
    input: typeof row.input === 'string' ? JSON.parse(row.input) : (row.input || {}),
    result: typeof row.result === 'string' ? JSON.parse(row.result) : row.result,
  };
}

function safeJson(value: unknown): any {
  try {
    return JSON.parse(JSON.stringify(value ?? null));
  } catch {
    return { unserializable: true };
  }
}

export async function createStagedAction({
  userId,
  conversationId,
  contract,
  input,
}: {
  userId: number;
  conversationId: number;
  contract: AgencyActionContract;
  input: Record<string, any>;
}): Promise<AgencyStagedAction | null> {
  const canonical = contract as any;

  try {
    const [row] = await sql`
      INSERT INTO agency_staged_actions (
        user_id,
        conversation_id,
        action_id,
        tool_name,
        action_label,
        permission_level,
        risk_level,
        write_scope,
        required_scopes,
        allowed_surfaces,
        citation_requirement,
        billing_event_type,
        billing_credit_cost,
        source_surface,
        input
      )
      VALUES (
        ${userId},
        ${conversationId},
        ${canonical.actionId ?? contract.toolName},
        ${contract.toolName},
        ${contract.label},
        ${contract.permissionLevel},
        ${contract.riskLevel},
        ${contract.writeScope},
        ${canonical.requiredScopes ?? []},
        ${canonical.allowedSurfaces ?? []},
        ${canonical.citationRequirement ?? null},
        ${canonical.billing?.eventType ?? null},
        ${canonical.billing?.creditCost ?? 0},
        ${input.sourceSurface ?? 'chat'},
        ${safeJson(input)}::jsonb
      )
      RETURNING *
    `;
    return normalizeAction(row);
  } catch (err: any) {
    try {
      const [row] = await sql`
        INSERT INTO agency_staged_actions (
          user_id,
          conversation_id,
          tool_name,
          action_label,
          permission_level,
          risk_level,
          write_scope,
          input
        )
        VALUES (
          ${userId},
          ${conversationId},
          ${contract.toolName},
          ${contract.label},
          ${contract.permissionLevel},
          ${contract.riskLevel},
          ${contract.writeScope},
          ${safeJson(input)}::jsonb
        )
        RETURNING *
      `;
      return normalizeAction(row);
    } catch {
      // Fall through to the dev warning below.
    }

    if (process.env.NODE_ENV !== 'production') {
      console.warn('[agencyStagedActions] create skipped:', err.message);
    }
    return null;
  }
}

export async function listPendingStagedActions(userId: number, conversationId?: number): Promise<AgencyStagedAction[]> {
  const rows = conversationId
    ? await sql`
        SELECT * FROM agency_staged_actions
        WHERE user_id = ${userId}
          AND conversation_id = ${conversationId}
          AND status = 'pending'
        ORDER BY created_at DESC
      `
    : await sql`
        SELECT * FROM agency_staged_actions
        WHERE user_id = ${userId}
          AND status = 'pending'
        ORDER BY created_at DESC
      `;
  return rows.map(normalizeAction);
}

export async function getPendingStagedActionForUser(id: number, userId: number): Promise<AgencyStagedAction | null> {
  const [row] = await sql`
    SELECT * FROM agency_staged_actions
    WHERE id = ${id}
      AND user_id = ${userId}
      AND status = 'pending'
    LIMIT 1
  `;
  return row ? normalizeAction(row) : null;
}

export async function markStagedActionConfirmed(id: number, userId: number): Promise<void> {
  await sql`
    UPDATE agency_staged_actions
    SET status = 'confirmed',
        confirmed_at = NOW(),
        updated_at = NOW()
    WHERE id = ${id}
      AND user_id = ${userId}
      AND status = 'pending'
  `;
}

export async function markStagedActionCanceled(id: number, userId: number): Promise<AgencyStagedAction | null> {
  const [row] = await sql`
    UPDATE agency_staged_actions
    SET status = 'canceled',
        canceled_at = NOW(),
        updated_at = NOW()
    WHERE id = ${id}
      AND user_id = ${userId}
      AND status = 'pending'
    RETURNING *
  `;
  return row ? normalizeAction(row) : null;
}

export async function markStagedActionResult({
  id,
  userId,
  status,
  result,
  reason,
}: {
  id: number;
  userId: number;
  status: 'executed' | 'blocked' | 'failed';
  result?: unknown;
  reason?: string;
}): Promise<void> {
  await sql`
    UPDATE agency_staged_actions
    SET status = ${status},
        result = ${safeJson(result)}::jsonb,
        reason = ${reason ?? null},
        executed_at = CASE WHEN ${status} = 'executed' THEN NOW() ELSE executed_at END,
        updated_at = NOW()
    WHERE id = ${id}
      AND user_id = ${userId}
  `;
}
