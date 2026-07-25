-- Collateral built FROM a master document (Paul, 2026-07-25).
--
-- "Ultimately after a master document is created using the various artifacts,
-- researchers, etc. — from the master document I need to be able to select
-- which output type I want: a one pager, a PDF carousel, or a full depth PDF
-- report. And then once the pages are rendered in preview I need to be able to
-- drag drop whichever images or assets on which pages, all on one screen."
--
-- The whole render/preview/per-page-artwork/export pipeline already hangs off
-- research_runs (studio_feed, feed_override deck cache, pageArt, ?save=1 into
-- Collateral). A composition needs every one of those, so it IS a run row —
-- just one where no research executed. These two columns keep that honest:
--
--   origin       'research' (an agent run) | 'composed' (built from a master)
--   artifact_id  which studio_artifacts row the words came from
--
-- so the library can label it truthfully instead of implying a search happened,
-- and a finished PDF can still answer "where did this come from".

ALTER TABLE research_runs ADD COLUMN IF NOT EXISTS origin TEXT NOT NULL DEFAULT 'research';
ALTER TABLE research_runs ADD COLUMN IF NOT EXISTS artifact_id INTEGER;
CREATE INDEX IF NOT EXISTS research_runs_artifact ON research_runs (artifact_id) WHERE artifact_id IS NOT NULL;
