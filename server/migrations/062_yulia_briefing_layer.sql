-- 062: Yulia briefing layer
-- Cached LLM-authored intelligence reads that sit between raw deal/market data
-- and product surfaces. These records make Today, deal pages, and chat consume
-- the same current "Yulia read" instead of each surface inventing its own copy.

CREATE TABLE IF NOT EXISTS yulia_portfolio_briefs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_fingerprint TEXT NOT NULL,
  source_payload JSONB NOT NULL DEFAULT '{}',
  brief JSONB NOT NULL DEFAULT '{}',
  narrative_markdown TEXT,
  model_used TEXT,
  status TEXT NOT NULL DEFAULT 'complete',
  error_message TEXT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '6 hours'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_yulia_portfolio_briefs_user
  ON yulia_portfolio_briefs(user_id);

CREATE INDEX IF NOT EXISTS idx_yulia_portfolio_briefs_fresh
  ON yulia_portfolio_briefs(user_id, expires_at DESC);

CREATE TABLE IF NOT EXISTS yulia_deal_briefs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  deal_id INTEGER NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  source_fingerprint TEXT NOT NULL,
  source_payload JSONB NOT NULL DEFAULT '{}',
  brief JSONB NOT NULL DEFAULT '{}',
  narrative_markdown TEXT,
  model_used TEXT,
  status TEXT NOT NULL DEFAULT 'complete',
  error_message TEXT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '6 hours'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_yulia_deal_briefs_user_deal
  ON yulia_deal_briefs(user_id, deal_id);

CREATE INDEX IF NOT EXISTS idx_yulia_deal_briefs_fresh
  ON yulia_deal_briefs(user_id, deal_id, expires_at DESC);
