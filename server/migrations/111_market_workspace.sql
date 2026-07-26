-- The market is the workspace (Paul, 2026-07-26).
--
-- He rejected the Finder IA outright: "i dont think i like the process at all
-- from how it looks. i need to: 1 - Add all research and artifacts, 2 -
-- synthesize and compile, 3 - create collateral, 4 - do other work — market
-- maps, who's who, thesis building or other corp dev beginning work."
--
-- Step 4 is the reframe. A lane is not a marketing-content pipeline; it is the
-- KNOWLEDGE BASE FOR A MARKET. Collateral is one thing you draw off it, and
-- the corp-dev documents — the actual practice work — are others. So work
-- scopes to a market rather than sitting in folders beside it.
--
-- What gets lane_id and what deliberately does NOT:
--   research_runs       yes — a run researches a market
--   research_schedules  yes — a campaign covers a market
--   studio_artifacts    already has lane_id (108/109)
--   studio_assets       NO — a photo of Paul is used across every market
--   studio_analytics    NO — a LinkedIn export is account-wide, not per-market;
--                       forcing it into one market would be a lie about the data

ALTER TABLE research_runs ADD COLUMN IF NOT EXISTS lane_id INTEGER;
CREATE INDEX IF NOT EXISTS research_runs_lane ON research_runs (lane_id) WHERE lane_id IS NOT NULL;

ALTER TABLE research_schedules ADD COLUMN IF NOT EXISTS lane_id INTEGER;
CREATE INDEX IF NOT EXISTS research_schedules_lane ON research_schedules (lane_id) WHERE lane_id IS NOT NULL;

-- Corp-dev documents are artifacts derived FROM a master, and they record which
-- master version they were drawn from in the existing lane_version column — a
-- thesis written off v2 is not the same claim as one written off v4. No new
-- column: lane_version already means "which version of this lane's master",
-- which is exactly right for both a filed master and a document derived from it.
