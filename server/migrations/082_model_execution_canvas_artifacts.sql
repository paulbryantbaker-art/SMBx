-- 082: Durable model canvas execution artifacts
-- Extends canonical MODEL.* execution records so iterative human/agent model
-- runs can be replayed, compared, and carried back out as audit-stamped
-- deal artifacts.

ALTER TABLE model_executions
  ADD COLUMN IF NOT EXISTS canvas_tab_id TEXT,
  ADD COLUMN IF NOT EXISTS model_type TEXT,
  ADD COLUMN IF NOT EXISTS model_title TEXT,
  ADD COLUMN IF NOT EXISTS client_version_number INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS parent_output_hash TEXT,
  ADD COLUMN IF NOT EXISTS deal_state_cid TEXT,
  ADD COLUMN IF NOT EXISTS source_surface TEXT NOT NULL DEFAULT 'model_canvas',
  ADD COLUMN IF NOT EXISTS line_boundary TEXT,
  ADD COLUMN IF NOT EXISTS model_output JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS version_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

CREATE INDEX IF NOT EXISTS idx_model_executions_canvas_tab
  ON model_executions(user_id, canvas_tab_id, created_at DESC)
  WHERE canvas_tab_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_model_executions_deal_canvas
  ON model_executions(deal_id, canvas_tab_id, client_version_number DESC)
  WHERE deal_id IS NOT NULL AND canvas_tab_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_model_executions_deal_state_cid
  ON model_executions(deal_state_cid, created_at DESC)
  WHERE deal_state_cid IS NOT NULL;
