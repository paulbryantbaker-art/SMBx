-- Campaign groups (2026-07-19): top-level Finder-style folders that organize
-- campaigns in the manager sidebar. A group exists as long as a campaign
-- carries its name.
ALTER TABLE research_schedules ADD COLUMN IF NOT EXISTS folder TEXT;
