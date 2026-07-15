-- Internal Research Agent + Studio campaigns (Paul, 2026-07-15).
-- Deep, cited research runs that feed the practice's LinkedIn marketing.
-- research_runs: one row per run (manual or scheduled) — the report markdown,
-- the structured STUDIO FEED, sources, and usage/cost accounting live here.
-- research_schedules: Paul's campaigns — a topic on a cadence with chosen
-- depth + output format; the in-process scheduler ticks them.
CREATE TABLE IF NOT EXISTS research_runs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  schedule_id INTEGER,                          -- null = manual run
  research_type TEXT NOT NULL,                  -- vertical_scan | participant_map | buyer_roster | deal_monitor | thesis_validation | topic_brief
  topic TEXT NOT NULL,
  depth TEXT NOT NULL DEFAULT 'standard',       -- quick | standard | deep
  output_format TEXT NOT NULL DEFAULT 'report', -- report | card | both
  status TEXT NOT NULL DEFAULT 'queued',        -- queued | running | complete | failed
  progress TEXT,                                -- current step label for the UI
  report_title TEXT,
  report_md TEXT,
  studio_feed JSONB,                            -- {hooks[], dataPoints[], angles[], visual, accounts[]}
  sources JSONB,                                -- [{url, title}]
  usage JSONB,                                  -- {searches, fetches, inputTokens, outputTokens, costCents}
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_research_runs_user ON research_runs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_research_runs_status ON research_runs (status);

CREATE TABLE IF NOT EXISTS research_schedules (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,                           -- campaign name
  research_type TEXT NOT NULL,
  topic TEXT NOT NULL,
  depth TEXT NOT NULL DEFAULT 'standard',
  output_format TEXT NOT NULL DEFAULT 'report',
  cadence TEXT NOT NULL DEFAULT 'weekly',       -- weekly | biweekly | monthly
  active BOOLEAN NOT NULL DEFAULT TRUE,
  email_to TEXT,                                -- completion email (falls back to the owner's email)
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_research_schedules_due ON research_schedules (active, next_run_at);
