import postgres from 'postgres';
import type { AgencyActionContract } from './agencyActionRegistry.js';

const sql = postgres(process.env.DATABASE_URL!, {
  ssl: process.env.NODE_ENV === 'production' ? 'require' : false as any,
  prepare: false,
});

interface AgencyActionEventInput {
  userId: number;
  conversationId: number;
  toolName: string;
  contract?: AgencyActionContract;
  outcome: 'staged' | 'blocked' | 'executed' | 'error';
  input?: Record<string, any>;
  result?: unknown;
  reason?: string;
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
        ${event.contract?.label ?? null},
        ${event.contract?.permissionLevel ?? null},
        ${event.contract?.riskLevel ?? null},
        ${event.outcome},
        ${event.contract?.confirmation === 'required'},
        ${safeJson(event.input)}::jsonb,
        ${safeJson(event.result)}::jsonb,
        ${event.reason ?? null}
      )
    `;
  } catch (err: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[agencyAuditLog] skipped:', err.message);
    }
  }
}
