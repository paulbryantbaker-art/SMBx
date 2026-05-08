-- 060_conversations_is_general.sql — add `is_general` flag to conversations.
--
-- Pre-flight for the agentic-tools restore (Phase 0). Distinguishes
-- "general help" conversations (no associated deal) from deal-execution
-- threads. Existing chat code that references `is_general` (e.g. the
-- create_deal tool flow at server/services/tools.ts when looking up the
-- right conversation to attach a new deal to) needs this column to exist.
--
-- Safe shape: ADD COLUMN IF NOT EXISTS — idempotent, no-op if the column
-- already exists from any prior environment. DEFAULT false ensures every
-- existing row gets a sane value without a backfill step.
--
-- BLOCKER B-02 from the autonomous-run BLOCKERS log; addressed here so
-- the Phase A tools can run without a "column does not exist" crash.

ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS is_general BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_conversations_is_general
  ON conversations (is_general)
  WHERE is_general = true;
