import type { AgencyActionContract, AgencySurface } from './agencyActionRegistry.js';
import { createSql } from '../dbConfig.js';

const sql = createSql();

interface AgencyActionEventInput {
  userId: number;
  conversationId: number;
  toolName: string;
  contract?: AgencyActionContract;
  outcome: 'staged' | 'blocked' | 'executed' | 'error';
  input?: Record<string, any>;
  result?: unknown;
  reason?: string;
  actorType?: 'user' | 'yulia' | 'system' | 'external_agent';
  actorId?: string | number | null;
  actingOnBehalfOfUserId?: number | null;
  organizationId?: number | null;
  sourceSurface?: AgencySurface | 'confirmation_route' | string;
  sourceAgent?: string | null;
  mandateScope?: string | null;
}

function safeJson(value: unknown): any {
  if (value === undefined) return null;
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return { unserializable: true };
  }
}

export async function recordAgencyActionEvent(event: AgencyActionEventInput): Promise<void> {
  const contract = event.contract as any;
  const actionId = contract?.actionId ?? event.toolName;
  const sourceSurface = event.sourceSurface ?? 'chat';
  const actorType = event.actorType ?? 'yulia';
  const actorId = event.actorId != null ? String(event.actorId) : null;

  try {
    const [row] = await sql`
      INSERT INTO agency_action_events (
        action_id,
        user_id,
        conversation_id,
        tool_name,
        action_label,
        permission_level,
        risk_level,
        required_scopes,
        allowed_surfaces,
        citation_requirement,
        audit_requirement,
        billing_event_type,
        billing_credit_cost,
        actor_type,
        actor_id,
        acting_on_behalf_of_user_id,
        organization_id,
        source_surface,
        source_agent,
        mandate_scope,
        outcome,
        requires_confirmation,
        input,
        result,
        reason
      )
      VALUES (
        ${actionId},
        ${event.userId},
        ${event.conversationId},
        ${event.toolName},
        ${contract?.label ?? null},
        ${contract?.permissionLevel ?? null},
        ${contract?.riskLevel ?? null},
        ${contract?.requiredScopes ?? []},
        ${contract?.allowedSurfaces ?? []},
        ${contract?.citationRequirement ?? null},
        ${contract?.auditRequirement ?? null},
        ${contract?.billing?.eventType ?? null},
        ${contract?.billing?.creditCost ?? 0},
        ${actorType},
        ${actorId},
        ${event.actingOnBehalfOfUserId ?? event.userId ?? null},
        ${event.organizationId ?? null},
        ${sourceSurface},
        ${event.sourceAgent ?? null},
        ${event.mandateScope ?? null},
        ${event.outcome},
        ${contract?.confirmation === 'required'},
        ${safeJson(event.input)}::jsonb,
        ${safeJson(event.result)}::jsonb,
        ${event.reason ?? null}
      )
      RETURNING id
    `;

    await recordAgencyUsageEvent({
      actionEventId: row?.id ?? null,
      event,
      actionId,
      sourceSurface,
      actorType,
    });
  } catch (err: any) {
    try {
      await sql`
        INSERT INTO agency_action_events (
          user_id,
          conversation_id,
          tool_name,
          action_label,
          permission_level,
          risk_level,
          outcome,
          requires_confirmation,
          input,
          result,
          reason
        )
        VALUES (
          ${event.userId},
          ${event.conversationId},
          ${event.toolName},
          ${contract?.label ?? null},
          ${contract?.permissionLevel ?? null},
          ${contract?.riskLevel ?? null},
          ${event.outcome},
          ${contract?.confirmation === 'required'},
          ${safeJson(event.input)}::jsonb,
          ${safeJson(event.result)}::jsonb,
          ${event.reason ?? null}
        )
      `;
      return;
    } catch {
      // Fall through to the dev warning below.
    }

    if (process.env.NODE_ENV !== 'production') {
      console.warn('[agencyAuditLog] skipped:', err.message);
    }
  }
}

async function recordAgencyUsageEvent({
  actionEventId,
  event,
  actionId,
  sourceSurface,
  actorType,
}: {
  actionEventId: number | null;
  event: AgencyActionEventInput;
  actionId: string;
  sourceSurface: string;
  actorType: string;
}): Promise<void> {
  const contract = event.contract as any;
  const billing = contract?.billing;
  if (!billing || !billing.billable || Number(billing.creditCost) <= 0) return;

  try {
    const [usage] = await sql`
      INSERT INTO agency_usage_events (
        user_id,
        organization_id,
        action_event_id,
        action_id,
        tool_name,
        event_type,
        credit_cost,
        quantity,
        source_surface,
        actor_type,
        metadata
      )
      VALUES (
        ${event.userId},
        ${event.organizationId ?? null},
        ${actionEventId},
        ${actionId},
        ${event.toolName},
        ${billing.eventType},
        ${billing.creditCost},
        ${1},
        ${sourceSurface},
        ${actorType},
        ${safeJson({
          unit: billing.unit,
          outcome: event.outcome,
          sourceAgent: event.sourceAgent ?? null,
          mandateScope: event.mandateScope ?? null,
          citationRequirement: contract?.citationRequirement ?? null,
        })}::jsonb
      )
      RETURNING id
    `;

    if (usage?.id && actionEventId) {
      await sql`
        UPDATE agency_action_events
        SET usage_event_id = ${usage.id}
        WHERE id = ${actionEventId}
      `;
    }
  } catch (err: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[agencyUsageLog] skipped:', err.message);
    }
  }
}
