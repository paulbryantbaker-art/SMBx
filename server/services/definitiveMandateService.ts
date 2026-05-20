export interface DefinitiveMandateContextInput {
  userId: number;
  organizationId?: number | null;
  billingOrgId?: number | null;
  sourceAgent?: string | null;
  agentId?: string | number | null;
  agentPlatformId?: string | null;
  mandateId?: string | null;
  requestedScopes?: string[];
  sourceSurface?: string | null;
  metadata?: Record<string, any>;
}

export interface DefinitiveMandateContext {
  beneficialCustomerId: number | null;
  billingOrgId: number | null;
  mandateId: string | null;
  agentId: string | null;
  agentPlatformId: string | null;
  mandateChain: {
    spec: 'DEFINITIVE.v1.0';
    principal: {
      userId: number;
      beneficialCustomerId: number | null;
      organizationId: number | null;
      billingOrgId: number | null;
    };
    agent: {
      agentId: string | null;
      agentPlatformId: string | null;
      sourceAgent: string | null;
    };
    mandate: {
      mandateId: string | null;
      status: 'human_session' | 'active' | 'missing' | 'expired' | 'revoked' | 'not_found';
      scope: string[];
      requestedScopes: string[];
      expiresAt: string | null;
      spendCapCredits: number | null;
    };
    sourceSurface: string | null;
  };
}

export async function resolveDefinitiveMandateContext(
  input: DefinitiveMandateContextInput,
): Promise<DefinitiveMandateContext> {
  const requestedScopes = normalizeScopes(input.requestedScopes);
  const agentId = input.agentId == null ? null : String(input.agentId);
  const agentPlatformId = input.agentPlatformId || null;
  const sourceAgent = input.sourceAgent || null;

  try {
    const customer = await ensureBeneficialCustomer(input);
    const agentIdentityId = agentId
      ? await ensureAgentIdentity({ agentId, agentPlatformId, sourceAgent, metadata: input.metadata })
      : null;
    const mandate = input.mandateId
      ? await readMandate(input.mandateId, customer.id)
      : null;

    return buildContext({
      input,
      beneficialCustomerId: customer.id,
      billingOrgId: input.billingOrgId ?? customer.billingOrgId ?? input.organizationId ?? null,
      agentId,
      agentPlatformId,
      sourceAgent,
      requestedScopes,
      mandate,
      agentIdentityId,
    });
  } catch (err: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[definitiveMandate] fallback:', err.message);
    }
    return buildContext({
      input,
      beneficialCustomerId: null,
      billingOrgId: input.billingOrgId ?? input.organizationId ?? null,
      agentId,
      agentPlatformId,
      sourceAgent,
      requestedScopes,
      mandate: null,
      agentIdentityId: null,
    });
  }
}

async function ensureBeneficialCustomer(input: DefinitiveMandateContextInput): Promise<{
  id: number;
  billingOrgId: number | null;
}> {
  const sql = await getSql();
  const customerKey = input.organizationId != null
    ? `org:${input.organizationId}`
    : `user:${input.userId}`;
  const [row] = await sql`
    INSERT INTO definitive_beneficial_customers (
      customer_key, user_id, organization_id, billing_org_id, display_name, customer_type, metadata
    )
    VALUES (
      ${customerKey},
      ${input.userId},
      ${input.organizationId ?? null},
      ${input.billingOrgId ?? input.organizationId ?? null},
      ${input.organizationId != null ? `Organization ${input.organizationId}` : `User ${input.userId}`},
      ${input.organizationId != null ? 'organization' : 'user'},
      ${sql.json({ sourceSurface: input.sourceSurface ?? null })}::jsonb
    )
    ON CONFLICT (customer_key) DO UPDATE SET
      user_id = COALESCE(definitive_beneficial_customers.user_id, EXCLUDED.user_id),
      organization_id = COALESCE(EXCLUDED.organization_id, definitive_beneficial_customers.organization_id),
      billing_org_id = COALESCE(EXCLUDED.billing_org_id, definitive_beneficial_customers.billing_org_id),
      updated_at = NOW()
    RETURNING id, billing_org_id
  `;
  return {
    id: Number(row.id),
    billingOrgId: row.billing_org_id == null ? null : Number(row.billing_org_id),
  };
}

async function ensureAgentIdentity(input: {
  agentId: string;
  agentPlatformId: string | null;
  sourceAgent: string | null;
  metadata?: Record<string, any>;
}): Promise<number> {
  const sql = await getSql();
  const [row] = await sql`
    INSERT INTO definitive_agent_identities (
      agent_id, agent_platform_id, platform_name, display_name, metadata
    )
    VALUES (
      ${input.agentId},
      ${input.agentPlatformId},
      ${input.sourceAgent},
      ${input.sourceAgent || input.agentId},
      ${sql.json(input.metadata || {})}::jsonb
    )
    ON CONFLICT (agent_id) DO UPDATE SET
      agent_platform_id = COALESCE(EXCLUDED.agent_platform_id, definitive_agent_identities.agent_platform_id),
      platform_name = COALESCE(EXCLUDED.platform_name, definitive_agent_identities.platform_name),
      display_name = COALESCE(EXCLUDED.display_name, definitive_agent_identities.display_name),
      updated_at = NOW()
    RETURNING id
  `;
  return Number(row.id);
}

async function readMandate(mandateId: string, beneficialCustomerId: number): Promise<Record<string, any> | null> {
  const sql = await getSql();
  const [row] = await sql`
    SELECT mandate_id, beneficial_customer_id, scope, status, expires_at, spend_cap_credits
    FROM definitive_agent_mandates
    WHERE mandate_id = ${mandateId}
      AND beneficial_customer_id = ${beneficialCustomerId}
    LIMIT 1
  `;
  return row || null;
}

function buildContext(input: {
  input: DefinitiveMandateContextInput;
  beneficialCustomerId: number | null;
  billingOrgId: number | null;
  agentId: string | null;
  agentPlatformId: string | null;
  sourceAgent: string | null;
  requestedScopes: string[];
  mandate: Record<string, any> | null;
  agentIdentityId: number | null;
}): DefinitiveMandateContext {
  const status = mandateStatus(input.mandate, !!input.agentId || !!input.sourceAgent);
  const expiresAt = input.mandate?.expires_at
    ? (input.mandate.expires_at instanceof Date ? input.mandate.expires_at.toISOString() : String(input.mandate.expires_at))
    : null;
  const scope = normalizeScopes(input.mandate?.scope);
  const mandateId = input.mandate?.mandate_id || input.input.mandateId || null;

  return {
    beneficialCustomerId: input.beneficialCustomerId,
    billingOrgId: input.billingOrgId,
    mandateId,
    agentId: input.agentId,
    agentPlatformId: input.agentPlatformId,
    mandateChain: {
      spec: 'DEFINITIVE.v1.0',
      principal: {
        userId: input.input.userId,
        beneficialCustomerId: input.beneficialCustomerId,
        organizationId: input.input.organizationId ?? null,
        billingOrgId: input.billingOrgId,
      },
      agent: {
        agentId: input.agentId,
        agentPlatformId: input.agentPlatformId,
        sourceAgent: input.sourceAgent,
      },
      mandate: {
        mandateId,
        status,
        scope,
        requestedScopes: input.requestedScopes,
        expiresAt,
        spendCapCredits: input.mandate?.spend_cap_credits == null ? null : Number(input.mandate.spend_cap_credits),
      },
      sourceSurface: input.input.sourceSurface ?? null,
    },
  };
}

function mandateStatus(
  mandate: Record<string, any> | null,
  hasExternalAgent: boolean,
): DefinitiveMandateContext['mandateChain']['mandate']['status'] {
  if (!mandate) return hasExternalAgent ? 'missing' : 'human_session';
  if (mandate.status === 'revoked') return 'revoked';
  if (mandate.status && mandate.status !== 'active') return 'not_found';
  if (mandate.expires_at && new Date(mandate.expires_at) < new Date()) return 'expired';
  return 'active';
}

function normalizeScopes(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map(String).map(scope => scope.trim()).filter(Boolean))];
}

async function getSql() {
  const db = await import('../db.js');
  return db.sql;
}
