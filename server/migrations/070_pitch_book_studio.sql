-- 070: Pitch Book Studio + V19 cache repair
-- Keeps the existing market_data_cache shape working while adding the V19
-- series/value fields that migration 067 expected on already-migrated DBs.

ALTER TABLE market_data_cache
  ADD COLUMN IF NOT EXISTS series_id TEXT,
  ADD COLUMN IF NOT EXISTS value NUMERIC,
  ADD COLUMN IF NOT EXISTS as_of_date DATE,
  ADD COLUMN IF NOT EXISTS source_url TEXT,
  ADD COLUMN IF NOT EXISTS cite_tag TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB;

ALTER TABLE market_data_cache
  ALTER COLUMN data DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_market_data_cache_v19_unique
  ON market_data_cache(series_id, as_of_date)
  WHERE series_id IS NOT NULL AND as_of_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_market_data_cache_series
  ON market_data_cache(series_id, as_of_date DESC)
  WHERE series_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS citation_registry (
  id BIGSERIAL PRIMARY KEY,
  cite_tag TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  current_value TEXT,
  source_url TEXT,
  as_of_date DATE,
  validated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS model_registry (
  id BIGSERIAL PRIMARY KEY,
  model_id TEXT NOT NULL,
  version TEXT NOT NULL,
  hash TEXT NOT NULL,
  deployed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deprecated_at TIMESTAMPTZ,
  change_log TEXT,
  test_status TEXT NOT NULL DEFAULT 'pending',
  hallucination_test_status TEXT,
  UNIQUE (model_id, version)
);

CREATE TABLE IF NOT EXISTS audit_trail (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  deal_id INTEGER REFERENCES deals(id) ON DELETE SET NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  conversation_id INTEGER REFERENCES conversations(id) ON DELETE SET NULL,
  turn_id TEXT NOT NULL,
  journey TEXT,
  league TEXT,
  deal_type TEXT,
  model_stack JSONB,
  inputs_used JSONB,
  live_data_snapshots JSONB,
  citations_validated JSONB,
  mode_2_triggers JSONB,
  output_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deal_model_stack (
  id BIGSERIAL PRIMARY KEY,
  deal_id INTEGER NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  journey TEXT NOT NULL,
  league TEXT NOT NULL,
  deal_type TEXT NOT NULL,
  primary_models JSONB NOT NULL,
  supporting JSONB NOT NULL,
  tax_legal JSONB NOT NULL,
  sensitivity JSONB NOT NULL,
  composed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version INTEGER NOT NULL DEFAULT 1,
  UNIQUE (deal_id, version)
);

CREATE TABLE IF NOT EXISTS tax_position_registry (
  id BIGSERIAL PRIMARY KEY,
  deal_id INTEGER NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  deal_type TEXT NOT NULL,
  structure_notes TEXT,
  rollover_pct NUMERIC,
  rollover_path TEXT,
  earnout_method TEXT,
  qsbs_eligible BOOLEAN,
  qsbs_state_conformity TEXT,
  s382_relevant BOOLEAN,
  s163j_relevant BOOLEAN,
  s168k_pct NUMERIC DEFAULT 100,
  international BOOLEAN DEFAULT FALSE,
  notes_jsonb JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS legal_defer_log (
  id BIGSERIAL PRIMARY KEY,
  deal_id INTEGER REFERENCES deals(id) ON DELETE SET NULL,
  session_id TEXT,
  trigger_code TEXT NOT NULL,
  context_text TEXT,
  briefing_packet JSONB,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE deals
  ADD COLUMN IF NOT EXISTS league TEXT,
  ADD COLUMN IF NOT EXISTS deal_type TEXT,
  ADD COLUMN IF NOT EXISTS jurisdiction TEXT,
  ADD COLUMN IF NOT EXISTS buyer_state TEXT,
  ADD COLUMN IF NOT EXISTS naics_6digit TEXT,
  ADD COLUMN IF NOT EXISTS sic_code TEXT,
  ADD COLUMN IF NOT EXISTS entity_type TEXT,
  ADD COLUMN IF NOT EXISTS s_election_years INTEGER,
  ADD COLUMN IF NOT EXISTS rollover_pct NUMERIC,
  ADD COLUMN IF NOT EXISTS earnout_present BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS rwi_eligible BOOLEAN;

ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS current_gate TEXT,
  ADD COLUMN IF NOT EXISTS journey TEXT,
  ADD COLUMN IF NOT EXISTS league TEXT;

CREATE TABLE IF NOT EXISTS studio_drafts (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  deal_id INTEGER REFERENCES deals(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  format TEXT NOT NULL,
  brief TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft',
  local_draft_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS studio_books (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  deal_id INTEGER REFERENCES deals(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  format TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  brief TEXT,
  current_version_id BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS studio_book_versions (
  id BIGSERIAL PRIMARY KEY,
  book_id BIGINT NOT NULL REFERENCES studio_books(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  title TEXT NOT NULL,
  outline JSONB NOT NULL DEFAULT '[]'::jsonb,
  slides JSONB NOT NULL DEFAULT '[]'::jsonb,
  assumptions JSONB NOT NULL DEFAULT '[]'::jsonb,
  model_outputs JSONB NOT NULL DEFAULT '[]'::jsonb,
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  audit JSONB NOT NULL DEFAULT '{}'::jsonb,
  speaker_notes JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by TEXT NOT NULL DEFAULT 'yulia',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (book_id, version)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'studio_books_current_version_fk'
  ) THEN
    ALTER TABLE studio_books
      ADD CONSTRAINT studio_books_current_version_fk
      FOREIGN KEY (current_version_id)
      REFERENCES studio_book_versions(id)
      ON DELETE SET NULL;
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS studio_sources (
  id BIGSERIAL PRIMARY KEY,
  book_id BIGINT NOT NULL REFERENCES studio_books(id) ON DELETE CASCADE,
  version_id BIGINT REFERENCES studio_book_versions(id) ON DELETE SET NULL,
  source_type TEXT NOT NULL,
  source_id TEXT,
  label TEXT NOT NULL,
  citation_tag TEXT,
  source_url TEXT,
  status TEXT NOT NULL DEFAULT 'linked',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS studio_exports (
  id BIGSERIAL PRIMARY KEY,
  book_id BIGINT NOT NULL REFERENCES studio_books(id) ON DELETE CASCADE,
  version_id BIGINT REFERENCES studio_book_versions(id) ON DELETE SET NULL,
  format TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ready',
  file_url TEXT,
  output_hash TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_studio_books_user
  ON studio_books(user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_studio_books_deal
  ON studio_books(deal_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_studio_versions_book
  ON studio_book_versions(book_id, version DESC);

CREATE INDEX IF NOT EXISTS idx_studio_sources_book
  ON studio_sources(book_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_studio_exports_book
  ON studio_exports(book_id, created_at DESC);
