-- 061: Yulia agency execution audit trail
-- Records governed tool outcomes so agentic actions are inspectable.

CREATE TABLE IF NOT EXISTS agency_action_events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  conversation_id INTEGER REFERENCES conversations(id) ON DELETE SET NULL,
  tool_name TEXT NOT NULL,
  action_label TEXT,
  permission_level TEXT,
  risk_level TEXT,
  outcome TEXT NOT NULL,
  requires_confirmation BOOLEAN NOT NULL DEFAULT false,
  input JSONB,
  result JSONB,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agency_action_events_user
  ON agency_action_events(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_agency_action_events_conversation
  ON agency_action_events(conversation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_agency_action_events_tool
  ON agency_action_events(tool_name, created_at DESC);

CREATE TABLE IF NOT EXISTS agency_staged_actions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  conversation_id INTEGER REFERENCES conversations(id) ON DELETE SET NULL,
  tool_name TEXT NOT NULL,
  action_label TEXT NOT NULL,
  permission_level TEXT,
  risk_level TEXT,
  write_scope TEXT,
  input JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  result JSONB,
  reason TEXT,
  confirmed_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agency_staged_actions_user_status
  ON agency_staged_actions(user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_agency_staged_actions_conversation_status
  ON agency_staged_actions(conversation_id, status, created_at DESC);
