-- Migration 056: Conversation cleanup + deal-first architecture (Phase 1)
--
-- 1. Garbage-collect abandoned conversations (<3 messages, no deal, >24h old)
-- 2. Add is_general flag for general (non-deal) chat bucket
-- 3. Add message_count cache for fast sidebar rendering

-- ─── General chat flag ─────────────────────────────────────
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS is_general BOOLEAN DEFAULT false;

-- ─── Cached message count for fast filtering ───────────────
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS message_count INTEGER DEFAULT 0;

-- Backfill message_count from actual counts
UPDATE conversations c
SET message_count = sub.cnt
FROM (
  SELECT conversation_id, COUNT(*) as cnt
  FROM messages
  GROUP BY conversation_id
) sub
WHERE c.id = sub.conversation_id;

-- ─── Garbage-collect abandoned conversations ───────────────
-- Delete conversations that are:
--   - More than 24 hours old
--   - Have fewer than 3 messages
--   - Are NOT linked to a deal
--   - Are NOT marked as general
-- Messages cascade-delete via FK.
DELETE FROM conversations
WHERE id IN (
  SELECT c.id
  FROM conversations c
  LEFT JOIN (
    SELECT conversation_id, COUNT(*) as cnt
    FROM messages
    GROUP BY conversation_id
  ) m ON c.id = m.conversation_id
  WHERE (m.cnt IS NULL OR m.cnt < 3)
    AND c.deal_id IS NULL
    AND c.is_general = false
    AND c.created_at < NOW() - INTERVAL '24 hours'
);

-- Index for efficient GC queries
CREATE INDEX IF NOT EXISTS idx_conversations_gc
  ON conversations(created_at, deal_id, is_general)
  WHERE deal_id IS NULL AND is_general = false;
