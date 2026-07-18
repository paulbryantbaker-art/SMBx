-- Post angle (2026-07-18): which of the weekly LinkedIn formats the collateral
-- is framed as — teardown, contrarian take, how-buyers-think, practitioner
-- note — independent of the research type. 'auto' lets the feed writer choose.
ALTER TABLE research_runs ADD COLUMN IF NOT EXISTS post_angle TEXT NOT NULL DEFAULT 'auto';
ALTER TABLE research_schedules ADD COLUMN IF NOT EXISTS post_angle TEXT NOT NULL DEFAULT 'auto';
