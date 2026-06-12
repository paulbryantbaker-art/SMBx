-- Rolling conversation summaries: track how many messages the conversation
-- had when its summary was last refreshed, so the refresh re-fires every
-- ~25 new messages instead of once-ever (the old `IF summary IS NULL` guard
-- made "periodic summarization" one-shot, freezing memory at message ~50).
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS summary_message_count INTEGER NOT NULL DEFAULT 0;

-- Composite indexes for the RECENT ACTIVITY prompt layer (per-branch
-- ORDER BY deal_id/created_at DESC LIMIT 10 on every chat message).
-- model_executions already has (deal_id, created_at DESC) from migration 071.
CREATE INDEX IF NOT EXISTS idx_gate_events_deal_created ON gate_events(deal_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_deal_created ON deal_activity_log(deal_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deliverables_deal_created ON deliverables(deal_id, created_at DESC);
