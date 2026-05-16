-- 065: V1 public-go-live agent substrate
-- Adds canonical action-contract, caller identity, citation, and metering fields.

ALTER TABLE agency_action_events
  ADD COLUMN IF NOT EXISTS action_id TEXT,
  ADD COLUMN IF NOT EXISTS required_scopes TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS allowed_surfaces TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS citation_requirement TEXT,
  ADD COLUMN IF NOT EXISTS audit_requirement TEXT NOT NULL DEFAULT 'required',
  ADD COLUMN IF NOT EXISTS billing_event_type TEXT,
  ADD COLUMN IF NOT EXISTS billing_credit_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS usage_event_id INTEGER,
  ADD COLUMN IF NOT EXISTS actor_type TEXT NOT NULL DEFAULT 'yulia',
  ADD COLUMN IF NOT EXISTS actor_id TEXT,
  ADD COLUMN IF NOT EXISTS acting_on_behalf_of_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS organization_id INTEGER,
  ADD COLUMN IF NOT EXISTS source_surface TEXT NOT NULL DEFAULT 'chat',
  ADD COLUMN IF NOT EXISTS source_agent TEXT,
  ADD COLUMN IF NOT EXISTS mandate_scope TEXT;

UPDATE agency_action_events
SET action_id = COALESCE(action_id, tool_name)
WHERE action_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_agency_action_events_action_id
  ON agency_action_events(action_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_agency_action_events_actor
  ON agency_action_events(actor_type, actor_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_agency_action_events_source_surface
  ON agency_action_events(source_surface, created_at DESC);

CREATE TABLE IF NOT EXISTS agency_usage_events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  organization_id INTEGER,
  action_event_id INTEGER REFERENCES agency_action_events(id) ON DELETE SET NULL,
  action_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  event_type TEXT NOT NULL,
  credit_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  plan_key TEXT,
  billing_period_key TEXT,
  source_surface TEXT NOT NULL DEFAULT 'chat',
  actor_type TEXT NOT NULL DEFAULT 'yulia',
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agency_usage_events_user
  ON agency_usage_events(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_agency_usage_events_action
  ON agency_usage_events(action_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_agency_usage_events_period
  ON agency_usage_events(user_id, billing_period_key, created_at DESC);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'agency_action_events_usage_event_fk'
  ) THEN
    ALTER TABLE agency_action_events
      ADD CONSTRAINT agency_action_events_usage_event_fk
      FOREIGN KEY (usage_event_id)
      REFERENCES agency_usage_events(id)
      ON DELETE SET NULL;
  END IF;
END
$$;

ALTER TABLE agency_staged_actions
  ADD COLUMN IF NOT EXISTS action_id TEXT,
  ADD COLUMN IF NOT EXISTS required_scopes TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS allowed_surfaces TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS citation_requirement TEXT,
  ADD COLUMN IF NOT EXISTS billing_event_type TEXT,
  ADD COLUMN IF NOT EXISTS billing_credit_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS source_surface TEXT NOT NULL DEFAULT 'chat';

UPDATE agency_staged_actions
SET action_id = COALESCE(action_id, tool_name)
WHERE action_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_agency_staged_actions_action_id
  ON agency_staged_actions(action_id, status, created_at DESC);
