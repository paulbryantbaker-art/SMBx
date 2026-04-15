-- 057_user_doc_views.sql
-- Track every time a user opens a document (canvas tab) so the mobile
-- home's "Recent Documents" section can surface what they're actually
-- working on (engagement-centric, not generation-centric).
--
-- Storage is intentionally light — (user_id, doc_type, doc_id) is the
-- natural key; we UPSERT opened_at on each view so a single row per
-- (user, doc) is kept forever. Querying "recent 8" is a simple
-- ORDER BY opened_at DESC LIMIT 8 per user.

CREATE TABLE IF NOT EXISTS user_doc_views (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- canvas tab type: 'deliverable' | 'markdown' | 'model' | 'deal-messages' | 'comparison'
  doc_type TEXT NOT NULL,
  -- string id, since tab ids include type-prefixed keys like 'deliverable-42'
  -- OR the numeric deliverableId. We store the canonical tab.id to keep
  -- a 1:1 mapping with how canvas tabs are persisted.
  doc_id TEXT NOT NULL,
  -- Optional enrichment for surfacing — avoids a join at read time
  label TEXT,
  deal_id INT REFERENCES deals(id) ON DELETE SET NULL,
  opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, doc_type, doc_id)
);

CREATE INDEX IF NOT EXISTS idx_user_doc_views_recent
  ON user_doc_views (user_id, opened_at DESC);
