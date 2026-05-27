-- 059_merger_lite.sql — Merger Lite scaffolding (B4.5)
--
-- Adds the minimum schema to support a "merger" journey type and pair two
-- deals as the two sides of a single transaction. Per the autonomous-run
-- plan: this is the structural spine. Merger Pro (MergerExchangeModel,
-- §368 tax analysis, HSR checklist generator) lands as Phase 5.
--
-- Idempotent: safe to re-run.

-- 1. parent_deal_id on deals — for spawned PMI deals (already used by
--    close_deal in B2.6) and for merger pairings where one deal references
--    the surviving entity.
ALTER TABLE deals
  ADD COLUMN IF NOT EXISTS parent_deal_id INTEGER REFERENCES deals(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_deals_parent_deal_id ON deals(parent_deal_id);

-- 2. merger_pairings — links two deal records as the two sides of a merger.
--    deal_a is conventionally the surviving entity; structure determines the
--    legal mechanics (forward triangular, reverse triangular, share exchange,
--    merger of equals).
CREATE TABLE IF NOT EXISTS merger_pairings (
  id SERIAL PRIMARY KEY,
  deal_a_id INTEGER NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  deal_b_id INTEGER NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  structure VARCHAR(50) NOT NULL,
  -- 'forward_triangular_merger' | 'reverse_triangular_merger'
  -- | 'share_exchange' | 'merger_of_equals'
  exchange_ratio NUMERIC(10, 4),
  -- shares of A per share of B (or share-equivalent for cash deals)
  surviving_entity VARCHAR(20) NOT NULL DEFAULT 'A',
  -- 'A' | 'B' | 'NEW' (NEW = newly formed parent for MOE)
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (deal_a_id, deal_b_id)
);

CREATE INDEX IF NOT EXISTS idx_merger_pairings_user_id ON merger_pairings(user_id);
CREATE INDEX IF NOT EXISTS idx_merger_pairings_deal_a ON merger_pairings(deal_a_id);
CREATE INDEX IF NOT EXISTS idx_merger_pairings_deal_b ON merger_pairings(deal_b_id);

-- 3. closed_deals — referenced by close_deal in B2.6 (best-effort INSERT,
--    silently skipped if missing). Defining it here so the archive lights up
--    once the migration runs. Keep schema minimal — this is an archive view,
--    not the operational source of truth.
CREATE TABLE IF NOT EXISTS closed_deals (
  id SERIAL PRIMARY KEY,
  deal_id INTEGER NOT NULL UNIQUE REFERENCES deals(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  closing_date TIMESTAMP NOT NULL,
  final_price_cents BIGINT NOT NULL,
  journey_type VARCHAR(20) NOT NULL,
  business_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 028_closed_deals created the synthetic comparable-transaction corpus first
-- in many environments. If that table already exists, backfill the operational
-- close/archive columns expected by close_deal instead of failing on indexes.
ALTER TABLE closed_deals
  ADD COLUMN IF NOT EXISTS deal_id INTEGER REFERENCES deals(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS closing_date TIMESTAMP,
  ADD COLUMN IF NOT EXISTS journey_type VARCHAR(20),
  ADD COLUMN IF NOT EXISTS business_name VARCHAR(255);

CREATE UNIQUE INDEX IF NOT EXISTS idx_closed_deals_deal_id_unique
  ON closed_deals(deal_id)
  WHERE deal_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_closed_deals_user_id ON closed_deals(user_id);

-- NOTE: journey_type column on deals is VARCHAR (no enum constraint) per
-- inspection of 001_initial_schema.sql, so 'merger' is already accepted at
-- the DB level. No ALTER needed for that.
