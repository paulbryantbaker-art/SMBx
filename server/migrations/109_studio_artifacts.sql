-- The third repository: ARTIFACTS (Paul, 2026-07-24).
--
-- "Just like in Google Drive, we need repositories for different types of
-- data. We need one for artifacts — artifacts are the reports, LinkedIn post
-- copy, etcetera, text documents that are used to generate collateral. This is
-- the researches. We need one for assets — assets are the pictures, images used
-- in the documents. And then another place for collateral — collateral is the
-- completed finished output product that is posted on LinkedIn or sent to a
-- potential customer."
--
-- Two of the three already existed, in studio_assets:
--     ASSETS      studio_assets WHERE kind = 'photo'
--     COLLATERAL  studio_assets WHERE kind = 'collateral'
-- ARTIFACTS had no home — report and master markdown was scattered across
-- research_runs.report_md and research_lanes.master_md with no way to browse,
-- label, or hand-write one. This table is that repository.
--
-- The chain the three form is the point:
--     ARTIFACT (the words)  +  ASSET (the pictures)  ->  COLLATERAL (the output)
-- so studio_assets gains artifact_id, letting a finished PDF point back at the
-- document it was rendered from.

CREATE TABLE IF NOT EXISTS studio_artifacts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  kind TEXT NOT NULL DEFAULT 'document',   -- report | post_copy | research | caption | spec | document
  label TEXT NOT NULL,
  body_md TEXT NOT NULL DEFAULT '',
  notes TEXT,
  -- provenance: where these words came from, when they came from the app
  lane_id INTEGER,                         -- research_lanes.id  (a synthesized master)
  lane_version INTEGER,                    -- which version of that master
  run_id INTEGER,                          -- research_runs.id   (an agent run)
  schedule_id INTEGER,                     -- research_schedules.id (a campaign)
  archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS studio_artifacts_user ON studio_artifacts (user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS studio_artifacts_kind ON studio_artifacts (user_id, kind) WHERE archived = FALSE;
CREATE INDEX IF NOT EXISTS studio_artifacts_lane ON studio_artifacts (lane_id) WHERE lane_id IS NOT NULL;

-- Close the chain: a rendered PDF/PNG can name the artifact it came from.
ALTER TABLE studio_assets ADD COLUMN IF NOT EXISTS artifact_id INTEGER;
CREATE INDEX IF NOT EXISTS studio_assets_artifact ON studio_assets (artifact_id) WHERE artifact_id IS NOT NULL;
