-- 072: V19 Today operating surface + Firm Memory
-- Adds a durable daily brief substrate without replacing the existing V6 shell.

CREATE TABLE IF NOT EXISTS firm_memory (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id INTEGER,
  memory_type TEXT NOT NULL,
  label TEXT NOT NULL,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  source TEXT NOT NULL DEFAULT 'yulia',
  confidence NUMERIC NOT NULL DEFAULT 0.7,
  status TEXT NOT NULL DEFAULT 'active',
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, memory_type, label)
);

CREATE INDEX IF NOT EXISTS idx_firm_memory_user_type
  ON firm_memory(user_id, memory_type, updated_at DESC)
  WHERE status = 'active';

CREATE TABLE IF NOT EXISTS today_operating_briefs (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_fingerprint TEXT NOT NULL,
  morning_brief JSONB NOT NULL DEFAULT '{}'::jsonb,
  gate_countdown JSONB NOT NULL DEFAULT '[]'::jsonb,
  deal_pulse JSONB NOT NULL DEFAULT '[]'::jsonb,
  files_needing_review JSONB NOT NULL DEFAULT '[]'::jsonb,
  studio_refresh_needs JSONB NOT NULL DEFAULT '[]'::jsonb,
  firm_memory_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '8 hours'),
  status TEXT NOT NULL DEFAULT 'complete',
  UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_today_operating_briefs_user_fresh
  ON today_operating_briefs(user_id, expires_at DESC);
