-- Research lanes: the living master document per lane (Paul, 2026-07-24).
--
-- Paul runs research OUTSIDE the app — Claude web, Gemini, other tools — so he
-- gets a variety of reads rather than one model's view. He then wants the app
-- to hold all of it, synthesize one master document, and keep that document
-- updated as new research arrives, "maybe once a quarter."
--
-- So: research_sources keeps every uploaded document forever (raw, attributed
-- to the tool that produced it); research_lanes holds the current master; and
-- research_master_versions keeps every prior master so a quarterly refresh
-- never destroys the read it replaces.
--
-- The synthesized master is ALSO written to a research_runs row, so everything
-- downstream — report PDF, carousel, review sheet, collateral — works with no
-- changes at all.

CREATE TABLE IF NOT EXISTS research_lanes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  slug TEXT NOT NULL,                        -- 'commercial-mechanical'
  label TEXT NOT NULL,                       -- 'Commercial mechanical, HVAC & plumbing'
  notes TEXT,                                -- standing guidance for the synthesis
  master_md TEXT,                            -- THE living document
  master_title TEXT,
  master_version INTEGER NOT NULL DEFAULT 0,
  synthesized_at TIMESTAMPTZ,
  synthesis_status TEXT NOT NULL DEFAULT 'idle',  -- idle | running | failed
  synthesis_error TEXT,
  archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS research_lanes_user_slug ON research_lanes (user_id, slug);

-- Every uploaded research document, kept raw and forever. PDFs land in `data`
-- (bytea, like studio_assets); markdown / plain text / pasted content lands in
-- `text_content`. `tool` records which engine produced it so the synthesis can
-- attribute a figure to its source rather than blending them anonymously.
CREATE TABLE IF NOT EXISTS research_sources (
  id SERIAL PRIMARY KEY,
  lane_id INTEGER NOT NULL REFERENCES research_lanes(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  tool TEXT,                                 -- claude | gemini | chatgpt | other | (free text)
  mime TEXT NOT NULL,                        -- application/pdf | text/markdown | text/plain
  data BYTEA,                                -- PDFs
  text_content TEXT,                         -- markdown / text / pasted
  bytes INTEGER,
  gathered_on DATE,                          -- when the research was actually run
  incorporated_version INTEGER,              -- null = not yet folded into a master
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS research_sources_lane ON research_sources (lane_id, created_at DESC);
CREATE INDEX IF NOT EXISTS research_sources_pending ON research_sources (lane_id) WHERE incorporated_version IS NULL;

-- Master history. A quarterly refresh appends; it never overwrites, so an
-- earlier read stays available for comparison and for audit.
CREATE TABLE IF NOT EXISTS research_master_versions (
  id SERIAL PRIMARY KEY,
  lane_id INTEGER NOT NULL REFERENCES research_lanes(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  title TEXT,
  master_md TEXT NOT NULL,
  source_ids INTEGER[],                      -- what fed THIS version
  change_note TEXT,                          -- what the refresh changed, in prose
  run_id INTEGER,                            -- the research_runs row it produced
  usage JSONB,
  audit JSONB,                               -- mechanical citation audit for THIS version
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS research_master_versions_uniq ON research_master_versions (lane_id, version);

-- Safe if 108 already ran before the audit column existed.
ALTER TABLE research_master_versions ADD COLUMN IF NOT EXISTS audit JSONB;
