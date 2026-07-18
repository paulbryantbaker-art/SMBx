-- Campaign manager (2026-07-18): archive runs out of the working set without
-- deleting them, and classify studio assets so produced collateral (rendered
-- announcement/post cards) lives in the same managed library as photos.
ALTER TABLE research_runs ADD COLUMN IF NOT EXISTS archived BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE studio_assets ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'photo';
