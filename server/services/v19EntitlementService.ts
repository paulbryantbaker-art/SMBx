import { sql } from '../db.js';
import {
  getUserPlan,
  normalizePlan,
  planMeetsRequirement,
  type Plan,
} from './subscriptionService.js';

export type V19UsageEventType =
  | 'model_run'
  | 'studio_export'
  | 'studio_book'
  | 'api_call'
  | 'tool_call'
  | 'enterprise_agent_action';

export type V19TollgateCode =
  | 'credit_budget_required'
  | 'human_approval_required'
  | 'enterprise_scope_required';

export interface V19PlanEntitlements {
  plan: Plan;
  monthlyCreditBudget: number | null;
  monthlyModelRuns: number | null;
  monthlyStudioExports: number | null;
  monthlyStudioBooks: number | null;
  monthlyApiCalls: number | null;
  monthlyToolCalls: number | null;
  monthlyEnterpriseAgentActions: number | null;
  apiMcpAccess: boolean;
  agentUsage: 'none' | 'supervised' | 'autonomous';
  humanApproval: 'required_for_sensitive_actions' | 'enterprise_policy';
}

export interface V19UsageCounter {
  used: number;
  requested: number;
  limit: number | null;
  remaining: number | null;
}

export interface V19UsageMeter {
  plan: Plan;
  periodKey: string;
  periodStart: string;
  periodEnd: string;
  entitlements: V19PlanEntitlements;
  credits: V19UsageCounter;
  events: Record<V19UsageEventType, V19UsageCounter>;
}

export interface V19TollgateState {
  code: V19TollgateCode;
  state: V19TollgateCode;
  title: string;
  message: string;
  eventType?: V19UsageEventType;
  actionId?: string;
  currentPlan: Plan;
  requiredPlan?: Plan;
  usage?: V19UsageCounter;
  resetAt?: string;
  resolution: string;
}

export interface V19EntitlementCheck {
  allowed: boolean;
  plan: Plan;
  entitlements: V19PlanEntitlements;
  meter: V19UsageMeter;
  tollgate: V19TollgateState | null;
}

interface V19EntitlementCheckInput {
  quantity?: number;
  actionId?: string;
  toolName?: string;
  sourceSurface?: string;
  resourceType?: string;
  resourceId?: string | number | null;
  requiredPlan?: Plan;
  requiresHumanApproval?: boolean;
  requiresEnterpriseScope?: boolean;
  metadata?: Record<string, any>;
}

interface V19UsageRecordInput extends V19EntitlementCheckInput {
  userId: number;
  eventType: V19UsageEventType;
  actionId: string;
  toolName?: string;
  creditCost?: number;
  actorType?: string;
  organizationId?: number | null;
}

const EVENT_TYPES: V19UsageEventType[] = [
  'model_run',
  'studio_export',
  'studio_book',
  'api_call',
  'tool_call',
  'enterprise_agent_action',
];

const EVENT_TYPE_KEY: Record<V19UsageEventType, string> = {
  model_run: 'v19.model_run',
  studio_export: 'v19.studio_export',
  studio_book: 'v19.studio_book',
  api_call: 'v19.api_call',
  tool_call: 'v19.tool_call',
  enterprise_agent_action: 'v19.enterprise_agent_action',
};

const EVENT_CREDIT_COST: Record<V19UsageEventType, number> = {
  model_run: 1,
  studio_export: 5,
  studio_book: 8,
  api_call: 1,
  tool_call: 0.25,
  enterprise_agent_action: 10,
};

export const V19_PLAN_ENTITLEMENTS: Record<Plan, V19PlanEntitlements> = {
  free: {
    plan: 'free',
    monthlyCreditBudget: 30,
    monthlyModelRuns: 20,
    monthlyStudioExports: 1,
    monthlyStudioBooks: 1,
    monthlyApiCalls: 0,
    monthlyToolCalls: 60,
    monthlyEnterpriseAgentActions: 0,
    apiMcpAccess: false,
    agentUsage: 'none',
    humanApproval: 'required_for_sensitive_actions',
  },
  solo: {
    plan: 'solo',
    monthlyCreditBudget: 600,
    monthlyModelRuns: 300,
    monthlyStudioExports: 30,
    monthlyStudioBooks: 12,
    monthlyApiCalls: 0,
    monthlyToolCalls: 600,
    monthlyEnterpriseAgentActions: 0,
    apiMcpAccess: false,
    agentUsage: 'none',
    humanApproval: 'required_for_sensitive_actions',
  },
  pro: {
    plan: 'pro',
    monthlyCreditBudget: 2500,
    monthlyModelRuns: 1200,
    monthlyStudioExports: 150,
    monthlyStudioBooks: 60,
    monthlyApiCalls: 2500,
    monthlyToolCalls: 2500,
    monthlyEnterpriseAgentActions: 0,
    apiMcpAccess: true,
    agentUsage: 'none',
    humanApproval: 'required_for_sensitive_actions',
  },
  team: {
    plan: 'team',
    monthlyCreditBudget: 12000,
    monthlyModelRuns: 6000,
    monthlyStudioExports: 600,
    monthlyStudioBooks: 300,
    monthlyApiCalls: 15000,
    monthlyToolCalls: 10000,
    monthlyEnterpriseAgentActions: 250,
    apiMcpAccess: true,
    agentUsage: 'supervised',
    humanApproval: 'required_for_sensitive_actions',
  },
  enterprise: {
    plan: 'enterprise',
    monthlyCreditBudget: null,
    monthlyModelRuns: null,
    monthlyStudioExports: null,
    monthlyStudioBooks: null,
    monthlyApiCalls: null,
    monthlyToolCalls: null,
    monthlyEnterpriseAgentActions: null,
    apiMcpAccess: true,
    agentUsage: 'autonomous',
    humanApproval: 'enterprise_policy',
  },
};

export async function getV19PlanEntitlements(userId: number): Promise<V19PlanEntitlements> {
  const plan = await getUserPlan(userId);
  return V19_PLAN_ENTITLEMENTS[plan] || V19_PLAN_ENTITLEMENTS.free;
}

export async function readV19UsageMeter(userId: number): Promise<V19UsageMeter> {
  const entitlements = await getV19PlanEntitlements(userId);
  const period = currentBillingPeriod();
  const eventKeys = EVENT_TYPES.map(type => EVENT_TYPE_KEY[type]);
  const rows = await sql`
    SELECT event_type, COALESCE(SUM(quantity), 0)::float AS quantity, COALESCE(SUM(credit_cost * quantity), 0)::float AS credits
    FROM agency_usage_events
    WHERE user_id = ${userId}
      AND billing_period_key = ${period.key}
      AND event_type = ANY(${eventKeys})
    GROUP BY event_type
  `.catch(() => []);

  const usageByEvent = new Map<string, { quantity: number; credits: number }>();
  for (const row of rows as any[]) {
    usageByEvent.set(String(row.event_type), {
      quantity: Number(row.quantity || 0),
      credits: Number(row.credits || 0),
    });
  }

  const events = {} as Record<V19UsageEventType, V19UsageCounter>;
  let creditsUsed = 0;
  for (const type of EVENT_TYPES) {
    const used = usageByEvent.get(EVENT_TYPE_KEY[type])?.quantity || 0;
    creditsUsed += usageByEvent.get(EVENT_TYPE_KEY[type])?.credits || 0;
    events[type] = counter(used, 0, limitForEvent(entitlements, type));
  }

  return {
    plan: entitlements.plan,
    periodKey: period.key,
    periodStart: period.start.toISOString(),
    periodEnd: period.end.toISOString(),
    entitlements,
    credits: counter(creditsUsed, 0, entitlements.monthlyCreditBudget),
    events,
  };
}

export async function checkV19Entitlement(
  userId: number,
  eventType: V19UsageEventType,
  input: V19EntitlementCheckInput = {},
): Promise<V19EntitlementCheck> {
  const quantity = normalizeQuantity(input.quantity);
  const meter = await readV19UsageMeter(userId);
  const entitlements = meter.entitlements;
  const requiredPlan = input.requiredPlan ? normalizePlan(input.requiredPlan) : null;

  if (input.requiresHumanApproval) {
    return denied(meter, humanApprovalTollgate(meter.plan, input.actionId, eventType));
  }

  if (requiredPlan && !planMeetsRequirement(meter.plan, requiredPlan)) {
    return denied(meter, enterpriseScopeTollgate({
      plan: meter.plan,
      requiredPlan,
      actionId: input.actionId,
      eventType,
    }));
  }

  if (input.requiresEnterpriseScope && meter.plan !== 'enterprise') {
    return denied(meter, enterpriseScopeTollgate({
      plan: meter.plan,
      requiredPlan: 'enterprise',
      actionId: input.actionId,
      eventType,
    }));
  }

  if (eventType === 'api_call' && !entitlements.apiMcpAccess) {
    return denied(meter, enterpriseScopeTollgate({
      plan: meter.plan,
      requiredPlan: 'pro',
      actionId: input.actionId,
      eventType,
      message: 'API and MCP-style resource access are not included on this plan.',
    }));
  }

  if (eventType === 'enterprise_agent_action' && entitlements.agentUsage === 'none') {
    return denied(meter, enterpriseScopeTollgate({
      plan: meter.plan,
      requiredPlan: 'team',
      actionId: input.actionId,
      eventType,
      message: 'Agent usage requires a team or enterprise scope so the agent has an identity, audit boundary, and approval policy.',
    }));
  }

  const eventUsed = meter.events[eventType].used;
  const eventLimit = meter.events[eventType].limit;
  if (eventLimit !== null && eventUsed + quantity > eventLimit) {
    return denied(meter, creditBudgetTollgate({
      plan: meter.plan,
      actionId: input.actionId,
      eventType,
      usage: counter(eventUsed, quantity, eventLimit),
      resetAt: meter.periodEnd,
    }));
  }

  const creditCost = EVENT_CREDIT_COST[eventType] * quantity;
  const creditLimit = meter.credits.limit;
  if (creditLimit !== null && meter.credits.used + creditCost > creditLimit) {
    return denied(meter, creditBudgetTollgate({
      plan: meter.plan,
      actionId: input.actionId,
      eventType,
      usage: counter(meter.credits.used, creditCost, creditLimit),
      resetAt: meter.periodEnd,
      message: 'This action would exceed the included monthly V19 plan allowance.',
    }));
  }

  return { allowed: true, plan: meter.plan, entitlements, meter, tollgate: null };
}

export async function recordV19UsageEvent(input: V19UsageRecordInput): Promise<number | null> {
  const quantity = normalizeQuantity(input.quantity);
  const plan = await getUserPlan(input.userId);
  const period = currentBillingPeriod();
  const eventTypeKey = EVENT_TYPE_KEY[input.eventType];
  const creditCost = input.creditCost ?? EVENT_CREDIT_COST[input.eventType];
  const metadata = {
    ...(input.metadata || {}),
    v19: true,
    resourceType: input.resourceType ?? null,
    resourceId: input.resourceId == null ? null : String(input.resourceId),
    actionId: input.actionId,
  };

  const [row] = await sql`
    INSERT INTO agency_usage_events (
      user_id,
      organization_id,
      action_id,
      tool_name,
      event_type,
      credit_cost,
      quantity,
      plan_key,
      billing_period_key,
      source_surface,
      actor_type,
      metadata
    )
    VALUES (
      ${input.userId},
      ${input.organizationId ?? null},
      ${input.actionId},
      ${input.toolName || input.actionId},
      ${eventTypeKey},
      ${creditCost},
      ${quantity},
      ${plan},
      ${period.key},
      ${input.sourceSurface || 'chat'},
      ${input.actorType || 'yulia'},
      ${sql.json(metadata)}::jsonb
    )
    RETURNING id
  `.catch((err: any) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[v19UsageMeter] skipped:', err.message);
    }
    return [] as any[];
  });

  return row?.id == null ? null : Number(row.id);
}

export function formatV19TollgateForYulia(tollgate: V19TollgateState | null): Record<string, any> | null {
  if (!tollgate) return null;
  return {
    code: tollgate.code,
    state: tollgate.state,
    title: tollgate.title,
    message: tollgate.message,
    requiredPlan: tollgate.requiredPlan,
    currentPlan: tollgate.currentPlan,
    resolution: tollgate.resolution,
    resetAt: tollgate.resetAt,
    usage: tollgate.usage,
  };
}

function denied(meter: V19UsageMeter, tollgate: V19TollgateState): V19EntitlementCheck {
  return {
    allowed: false,
    plan: meter.plan,
    entitlements: meter.entitlements,
    meter,
    tollgate,
  };
}

function currentBillingPeriod(): { key: string; start: Date; end: Date } {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const key = `${start.getUTCFullYear()}-${String(start.getUTCMonth() + 1).padStart(2, '0')}`;
  return { key, start, end };
}

function normalizeQuantity(value: unknown): number {
  const parsed = Number(value ?? 1);
  if (!Number.isFinite(parsed) || parsed <= 0) return 1;
  return Math.ceil(parsed);
}

function counter(used: number, requested: number, limit: number | null): V19UsageCounter {
  return {
    used: round(used),
    requested: round(requested),
    limit,
    remaining: limit === null ? null : Math.max(0, round(limit - used)),
  };
}

function limitForEvent(entitlements: V19PlanEntitlements, eventType: V19UsageEventType): number | null {
  if (eventType === 'model_run') return entitlements.monthlyModelRuns;
  if (eventType === 'studio_export') return entitlements.monthlyStudioExports;
  if (eventType === 'studio_book') return entitlements.monthlyStudioBooks;
  if (eventType === 'api_call') return entitlements.monthlyApiCalls;
  if (eventType === 'tool_call') return entitlements.monthlyToolCalls;
  return entitlements.monthlyEnterpriseAgentActions;
}

function creditBudgetTollgate(input: {
  plan: Plan;
  actionId?: string;
  eventType?: V19UsageEventType;
  usage: V19UsageCounter;
  resetAt: string;
  message?: string;
}): V19TollgateState {
  return {
    code: 'credit_budget_required',
    state: 'credit_budget_required',
    title: 'Monthly V19 allowance reached',
    message: input.message || 'This action would exceed the included monthly allowance for the current plan.',
    currentPlan: input.plan,
    eventType: input.eventType,
    actionId: input.actionId,
    usage: input.usage,
    resetAt: input.resetAt,
    resolution: 'Upgrade the plan, reduce the requested action, or wait for the next monthly reset.',
  };
}

function humanApprovalTollgate(plan: Plan, actionId?: string, eventType?: V19UsageEventType): V19TollgateState {
  return {
    code: 'human_approval_required',
    state: 'human_approval_required',
    title: 'Human approval required',
    message: 'This action needs a human approval step before Yulia can continue.',
    currentPlan: plan,
    eventType,
    actionId,
    resolution: 'Ask the user to approve the specific action, or defer to counsel where legal, tax, or regulated advice is involved.',
  };
}

function enterpriseScopeTollgate(input: {
  plan: Plan;
  requiredPlan: Plan;
  actionId?: string;
  eventType?: V19UsageEventType;
  message?: string;
}): V19TollgateState {
  return {
    code: 'enterprise_scope_required',
    state: 'enterprise_scope_required',
    title: 'Plan scope required',
    message: input.message || 'This action is outside the governance scope of the current plan.',
    currentPlan: input.plan,
    requiredPlan: input.requiredPlan,
    eventType: input.eventType,
    actionId: input.actionId,
    resolution: `Move to ${input.requiredPlan} or use a lower-scope workflow.`,
  };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
