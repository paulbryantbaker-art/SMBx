-- 076: DEFINITIVE corpus and data-rights foundation
-- Prepares the sub-$1B deal-terms moat without collecting raw customer
-- documents or identifying parties. Only structured observations may become
-- benchmark candidates, and only when a rights grant is active.

CREATE TABLE IF NOT EXISTS definitive_data_rights_grants (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  organization_id INTEGER,
  beneficial_customer_id BIGINT REFERENCES definitive_beneficial_customers(id) ON DELETE SET NULL,
  billing_org_id INTEGER,
  grant_type TEXT NOT NULL DEFAULT 'anonymized_benchmark_observations',
  status TEXT NOT NULL DEFAULT 'active',
  scope JSONB NOT NULL DEFAULT '{}'::jsonb,
  source TEXT NOT NULL DEFAULT 'user',
  source_reference TEXT,
  accepted_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  effective_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (status IN ('active', 'revoked', 'expired', 'superseded')),
  CHECK (grant_type IN ('anonymized_benchmark_observations', 'enterprise_benchmark_pool', 'research_excluded'))
);

CREATE INDEX IF NOT EXISTS idx_definitive_data_rights_user
  ON definitive_data_rights_grants(user_id, status, effective_at DESC);

CREATE INDEX IF NOT EXISTS idx_definitive_data_rights_customer
  ON definitive_data_rights_grants(beneficial_customer_id, status, effective_at DESC);

CREATE INDEX IF NOT EXISTS idx_definitive_data_rights_org
  ON definitive_data_rights_grants(organization_id, status, effective_at DESC);

CREATE TABLE IF NOT EXISTS definitive_corpus_observations (
  id BIGSERIAL PRIMARY KEY,
  observation_id TEXT UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  organization_id INTEGER,
  beneficial_customer_id BIGINT REFERENCES definitive_beneficial_customers(id) ON DELETE SET NULL,
  billing_org_id INTEGER,
  deal_id INTEGER REFERENCES deals(id) ON DELETE SET NULL,
  grant_id BIGINT REFERENCES definitive_data_rights_grants(id) ON DELETE SET NULL,
  observation_type TEXT NOT NULL,
  observation JSONB NOT NULL,
  anonymization_bucket JSONB NOT NULL DEFAULT '{}'::jsonb,
  source_artifact_type TEXT,
  source_artifact_id TEXT,
  source_hash TEXT,
  observation_hash TEXT UNIQUE NOT NULL,
  spec_version TEXT NOT NULL DEFAULT 'DEFINITIVE.v1.0',
  spec_uri TEXT NOT NULL DEFAULT 'definitive://v1',
  methodology_version TEXT NOT NULL DEFAULT 'V19',
  methodology_uri TEXT NOT NULL DEFAULT 'methodology://v19',
  eligibility_status TEXT NOT NULL DEFAULT 'pending',
  exclusion_reason TEXT,
  min_release_count INTEGER NOT NULL DEFAULT 10,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (eligibility_status IN ('pending', 'eligible', 'excluded', 'released')),
  CHECK (min_release_count >= 5)
);

CREATE INDEX IF NOT EXISTS idx_definitive_corpus_observations_customer
  ON definitive_corpus_observations(beneficial_customer_id, observation_type, eligibility_status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_definitive_corpus_observations_deal
  ON definitive_corpus_observations(deal_id, observation_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_definitive_corpus_observations_type
  ON definitive_corpus_observations(observation_type, eligibility_status, created_at DESC);

CREATE TABLE IF NOT EXISTS definitive_benchmark_release_controls (
  id BIGSERIAL PRIMARY KEY,
  benchmark_key TEXT UNIQUE NOT NULL,
  observation_type TEXT NOT NULL,
  anonymization_bucket JSONB NOT NULL DEFAULT '{}'::jsonb,
  eligible_observation_count INTEGER NOT NULL DEFAULT 0,
  min_release_count INTEGER NOT NULL DEFAULT 10,
  release_status TEXT NOT NULL DEFAULT 'withheld',
  last_counted_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (release_status IN ('withheld', 'eligible', 'released', 'retired')),
  CHECK (min_release_count >= 5)
);

CREATE INDEX IF NOT EXISTS idx_definitive_benchmark_release_type
  ON definitive_benchmark_release_controls(observation_type, release_status, updated_at DESC);
