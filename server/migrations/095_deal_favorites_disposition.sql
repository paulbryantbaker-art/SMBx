-- Favorite + workflow disposition for deals.
--
-- RENAME needs no new column: deals.name already exists and dealDisplayName()
-- prefers it over business_name — so a rename just sets deals.name.
--
-- is_favorite  → user starred the deal; it sorts to the top of the Deals board.
-- disposition  → user's workflow state: 'active' | 'deferred'. A DEFERRED deal
--                gets NO background reading (the nightly brief/market-intel job
--                skips it, and Yulia's prompt is told it's deferred). This is kept
--                SEPARATE from `status` (system lifecycle: active/closed/archived)
--                so the two never fight.

ALTER TABLE deals
  ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS disposition VARCHAR(20) NOT NULL DEFAULT 'active';

CREATE INDEX IF NOT EXISTS idx_deals_user_favorite
  ON deals (user_id, is_favorite DESC, updated_at DESC);

COMMENT ON COLUMN deals.is_favorite IS 'User starred this deal — sorts to the top of the Deals board.';
COMMENT ON COLUMN deals.disposition IS 'User workflow disposition: active | deferred. Deferred = no background market reading.';
