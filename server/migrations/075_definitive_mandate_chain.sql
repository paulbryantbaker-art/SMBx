-- 075: DEFINITIVE beneficial customer and mandate chain
-- Makes agent/API usage attributable to the real principal, not only the UI
-- user or calling platform.

CREATE TABLE IF NOT EXISTS definitive_beneficial_customers (
  id BIGSERIAL PRIMARY KEY,
  customer_key TEXT UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  organization_id INTEGER,
  billing_org_id INTEGER,
  display_name TEXT,
  customer_type TEXT NOT NULL DEFAULT 'user',
  plan_key TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_definitive_beneficial_customers_user
  ON definitive_beneficial_customers(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_definitive_beneficial_customers_org
  ON definitive_beneficial_customers(organization_id, created_at DESC);

CREATE TABLE IF NOT EXISTS definitive_agent_identities (
  id BIGSERIAL PRIMARY KEY,
  agent_id TEXT UNIQUE NOT NULL,
  agent_platform_id TEXT,
  platform_name TEXT,
  display_name TEXT,
  auth_subject TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_definitive_agent_identities_platform
  ON definitive_agent_identities(agent_platform_id, status);

CREATE TABLE IF NOT EXISTS definitive_agent_mandates (
  id BIGSERIAL PRIMARY KEY,
  mandate_id TEXT UNIQUE NOT NULL,
  beneficial_customer_id BIGINT REFERENCES definitive_beneficial_customers(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  billing_org_id INTEGER,
  agent_identity_id BIGINT REFERENCES definitive_agent_identities(id) ON DELETE SET NULL,
  source_agent TEXT,
  scope TEXT[] NOT NULL DEFAULT '{}',
  scope_summary TEXT,
  permission_level TEXT,
  spend_cap_credits NUMERIC(12,2),
  spend_period_key TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  expires_at TIMESTAMPTZ,
  approved_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  signed_at TIMESTAMPTZ,
  signature_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_definitive_agent_mandates_customer
  ON definitive_agent_mandates(beneficial_customer_id, status, expires_at);

CREATE INDEX IF NOT EXISTS idx_definitive_agent_mandates_agent
  ON definitive_agent_mandates(agent_identity_id, status, expires_at);

ALTER TABLE agency_action_events
  ADD COLUMN IF NOT EXISTS beneficial_customer_id BIGINT REFERENCES definitive_beneficial_customers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS billing_org_id INTEGER,
  ADD COLUMN IF NOT EXISTS mandate_id TEXT,
  ADD COLUMN IF NOT EXISTS agent_platform_id TEXT,
  ADD COLUMN IF NOT EXISTS mandate_chain JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE agency_usage_events
  ADD COLUMN IF NOT EXISTS beneficial_customer_id BIGINT REFERENCES definitive_beneficial_customers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS billing_org_id INTEGER,
  ADD COLUMN IF NOT EXISTS mandate_id TEXT,
  ADD COLUMN IF NOT EXISTS agent_id TEXT,
  ADD COLUMN IF NOT EXISTS agent_platform_id TEXT,
  ADD COLUMN IF NOT EXISTS mandate_chain JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE audit_trail
  ADD COLUMN IF NOT EXISTS beneficial_customer_id BIGINT REFERENCES definitive_beneficial_customers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS billing_org_id INTEGER,
  ADD COLUMN IF NOT EXISTS mandate_id TEXT,
  ADD COLUMN IF NOT EXISTS agent_id TEXT,
  ADD COLUMN IF NOT EXISTS agent_platform_id TEXT,
  ADD COLUMN IF NOT EXISTS mandate_chain JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE model_executions
  ADD COLUMN IF NOT EXISTS beneficial_customer_id BIGINT REFERENCES definitive_beneficial_customers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS billing_org_id INTEGER,
  ADD COLUMN IF NOT EXISTS mandate_id TEXT,
  ADD COLUMN IF NOT EXISTS agent_id TEXT,
  ADD COLUMN IF NOT EXISTS agent_platform_id TEXT,
  ADD COLUMN IF NOT EXISTS mandate_chain JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_agency_action_events_beneficial_customer
  ON agency_action_events(beneficial_customer_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_agency_usage_events_beneficial_customer
  ON agency_usage_events(beneficial_customer_id, billing_period_key, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_trail_beneficial_customer
  ON audit_trail(beneficial_customer_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_model_executions_beneficial_customer
  ON model_executions(beneficial_customer_id, created_at DESC);
