-- 083: Today model freshness cascade
-- Stores the model-rerun queue in the cached Today operating brief so Today,
-- Pipeline, Files, and agent readbacks share the same stale-output view.

ALTER TABLE today_operating_briefs
  ADD COLUMN IF NOT EXISTS model_refresh_needs JSONB NOT NULL DEFAULT '[]'::jsonb;
