-- 068: Saved model artifacts and export readiness
-- A saved canvas/model becomes a private file-library artifact first.
-- Separate data-room filing remains an explicit user action.

ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

UPDATE deliverables
SET updated_at = COALESCE(completed_at, created_at, NOW())
WHERE updated_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_deliverables_folder_category
  ON deliverables(deal_id, folder_category, updated_at DESC);
