-- 071: V19 model execution records
-- Stores canonical MODEL.*.v1 runs as durable objects for Studio, chat,
-- tools, future MCP/API callers, and audit packet generation.

CREATE TABLE IF NOT EXISTS model_executions (
  id BIGSERIAL PRIMARY KEY,
  model_id TEXT NOT NULL,
  version TEXT NOT NULL,
  status TEXT NOT NULL,
  deal_id INTEGER REFERENCES deals(id) ON DELETE SET NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  conversation_id INTEGER REFERENCES conversations(id) ON DELETE SET NULL,
  studio_book_id BIGINT REFERENCES studio_books(id) ON DELETE SET NULL,
  studio_version_id BIGINT REFERENCES studio_book_versions(id) ON DELETE SET NULL,
  tool_name TEXT,
  input_hash TEXT NOT NULL,
  output_hash TEXT NOT NULL,
  inputs JSONB NOT NULL DEFAULT '{}'::jsonb,
  outputs JSONB NOT NULL DEFAULT '{}'::jsonb,
  missing_inputs JSONB NOT NULL DEFAULT '[]'::jsonb,
  citation_tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  audit_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_model_executions_deal
  ON model_executions(deal_id, created_at DESC)
  WHERE deal_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_model_executions_user
  ON model_executions(user_id, created_at DESC)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_model_executions_conversation
  ON model_executions(conversation_id, created_at DESC)
  WHERE conversation_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_model_executions_studio_book
  ON model_executions(studio_book_id, created_at DESC)
  WHERE studio_book_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_model_executions_model
  ON model_executions(model_id, version, created_at DESC);

