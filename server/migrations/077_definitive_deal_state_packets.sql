-- 077: DEFINITIVE deal-state packet journal
-- Stores the agent-native Deal OS control packets as durable, version-pinned
-- artifacts so humans and external agents can resume the same deal loop.

CREATE TABLE IF NOT EXISTS definitive_deal_state_snapshots (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  deal_id INTEGER REFERENCES deals(id) ON DELETE SET NULL,
  conversation_id INTEGER REFERENCES conversations(id) ON DELETE SET NULL,
  beneficial_customer_id BIGINT REFERENCES definitive_beneficial_customers(id) ON DELETE SET NULL,
  billing_org_id INTEGER,
  mandate_id TEXT,
  agent_id TEXT,
  agent_platform_id TEXT,
  source_surface TEXT NOT NULL DEFAULT 'mcp',
  tool_name TEXT NOT NULL,
  state_id TEXT NOT NULL,
  state_cid TEXT NOT NULL,
  state_hash TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  parent_cids JSONB NOT NULL DEFAULT '[]'::jsonb,
  idempotency_key TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  classification_key JSONB NOT NULL DEFAULT '{}'::jsonb,
  overlays JSONB NOT NULL DEFAULT '[]'::jsonb,
  signals JSONB,
  missing_input_contract JSONB NOT NULL DEFAULT '{}'::jsonb,
  completeness_report JSONB NOT NULL DEFAULT '{}'::jsonb,
  source_index JSONB NOT NULL DEFAULT '[]'::jsonb,
  input_hash TEXT NOT NULL,
  output_hash TEXT NOT NULL,
  spec_version TEXT NOT NULL DEFAULT 'DEFINITIVE.v1.0',
  spec_uri TEXT NOT NULL DEFAULT 'definitive://v1',
  methodology_version TEXT NOT NULL DEFAULT 'V19',
  methodology_uri TEXT NOT NULL DEFAULT 'methodology://v19',
  mandate_chain JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_definitive_deal_state_snapshots_user
  ON definitive_deal_state_snapshots(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_definitive_deal_state_snapshots_deal
  ON definitive_deal_state_snapshots(deal_id, created_at DESC)
  WHERE deal_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_definitive_deal_state_snapshots_conversation
  ON definitive_deal_state_snapshots(conversation_id, created_at DESC)
  WHERE conversation_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_definitive_deal_state_snapshots_state_cid
  ON definitive_deal_state_snapshots(state_cid, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_definitive_deal_state_snapshots_customer
  ON definitive_deal_state_snapshots(beneficial_customer_id, created_at DESC)
  WHERE beneficial_customer_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS definitive_deal_packets (
  id BIGSERIAL PRIMARY KEY,
  state_snapshot_id BIGINT REFERENCES definitive_deal_state_snapshots(id) ON DELETE SET NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  deal_id INTEGER REFERENCES deals(id) ON DELETE SET NULL,
  conversation_id INTEGER REFERENCES conversations(id) ON DELETE SET NULL,
  beneficial_customer_id BIGINT REFERENCES definitive_beneficial_customers(id) ON DELETE SET NULL,
  billing_org_id INTEGER,
  mandate_id TEXT,
  agent_id TEXT,
  agent_platform_id TEXT,
  source_surface TEXT NOT NULL DEFAULT 'mcp',
  tool_name TEXT NOT NULL,
  action TEXT,
  packet_type TEXT NOT NULL,
  packet_id TEXT,
  packet_cid TEXT,
  deal_state_cid TEXT,
  deal_state_hash TEXT,
  packet_hash TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  take_back_artifacts JSONB NOT NULL DEFAULT '[]'::jsonb,
  next_suggested_calls JSONB NOT NULL DEFAULT '[]'::jsonb,
  line_invariant TEXT,
  input_hash TEXT NOT NULL,
  output_hash TEXT NOT NULL,
  spec_version TEXT NOT NULL DEFAULT 'DEFINITIVE.v1.0',
  spec_uri TEXT NOT NULL DEFAULT 'definitive://v1',
  methodology_version TEXT NOT NULL DEFAULT 'V19',
  methodology_uri TEXT NOT NULL DEFAULT 'methodology://v19',
  mandate_chain JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_definitive_deal_packets_user
  ON definitive_deal_packets(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_definitive_deal_packets_deal
  ON definitive_deal_packets(deal_id, created_at DESC)
  WHERE deal_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_definitive_deal_packets_conversation
  ON definitive_deal_packets(conversation_id, created_at DESC)
  WHERE conversation_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_definitive_deal_packets_state_cid
  ON definitive_deal_packets(deal_state_cid, created_at DESC)
  WHERE deal_state_cid IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_definitive_deal_packets_type
  ON definitive_deal_packets(packet_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_definitive_deal_packets_customer
  ON definitive_deal_packets(beneficial_customer_id, created_at DESC)
  WHERE beneficial_customer_id IS NOT NULL;
