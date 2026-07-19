-- Campaign archive (2026-07-19): retire campaigns from the sidebar without
-- deleting their history. Archived campaigns never fire.
ALTER TABLE research_schedules ADD COLUMN IF NOT EXISTS archived BOOLEAN NOT NULL DEFAULT FALSE;
