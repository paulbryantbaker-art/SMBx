-- 091_pmi_value_capture.sql
-- Real 100-day PMI value-capture plan: execution tracker for post-merger integration.
-- HONESTY: targets are ILLUSTRATIVE (labeled). There is NO captured/realized $ column —
-- verified synergy actuals require a finance/GL connector that does not exist yet, so we
-- never store a "captured value" number. We track EXECUTION (workstream % / status) only.
-- Money in integer cents (BIGINT) per Critical Rule #10.

-- Plan header — one active plan per deal.
CREATE TABLE IF NOT EXISTS pmi_value_capture_plans (
  id BIGSERIAL PRIMARY KEY,
  deal_id INTEGER NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  horizon_days INTEGER NOT NULL DEFAULT 100,
  summary TEXT,
  target_value_cents BIGINT,                 -- total ILLUSTRATIVE target synergy (annualized)
  value_levers JSONB NOT NULL DEFAULT '[]'::jsonb,  -- [{name, category, target_value_cents, confidence}]
  source_analysis_run_id BIGINT,
  status TEXT NOT NULL DEFAULT 'active',      -- active | archived
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (deal_id)                           -- real idempotency: regenerate upserts, never dupes
);
CREATE INDEX IF NOT EXISTS idx_pmi_vc_plans_deal ON pmi_value_capture_plans(deal_id);
CREATE INDEX IF NOT EXISTS idx_pmi_vc_plans_user ON pmi_value_capture_plans(user_id);

-- Workstreams — the trackable execution rows (map 1:1 to the UI IntegrationWorkstream).
CREATE TABLE IF NOT EXISTS pmi_workstreams (
  id BIGSERIAL PRIMARY KEY,
  plan_id BIGINT NOT NULL REFERENCES pmi_value_capture_plans(id) ON DELETE CASCADE,
  deal_id INTEGER NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  detail TEXT,
  owner TEXT,                                -- role/owner (self-reported)
  first_move TEXT,                           -- the headline next action
  evidence_link TEXT,                        -- where the evidence lives (data room / model)
  status TEXT NOT NULL DEFAULT 'not_started', -- not_started | in_progress | on_track | at_risk | complete
  pct INTEGER NOT NULL DEFAULT 0 CHECK (pct BETWEEN 0 AND 100),  -- self-reported progress
  sort_order INTEGER NOT NULL DEFAULT 0,
  due_at DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pmi_workstreams_deal ON pmi_workstreams(deal_id);
CREATE INDEX IF NOT EXISTS idx_pmi_workstreams_plan ON pmi_workstreams(plan_id);

-- Milestones — progress snapshots over time (plan created, progress, quarterly review).
CREATE TABLE IF NOT EXISTS pmi_value_capture_milestones (
  id BIGSERIAL PRIMARY KEY,
  deal_id INTEGER NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  plan_id BIGINT REFERENCES pmi_value_capture_plans(id) ON DELETE CASCADE,
  milestone_type TEXT NOT NULL,             -- plan_created | workstream_completed | progress_snapshot | quarterly_review
  description TEXT NOT NULL,
  target_value_cents BIGINT,
  workstreams_complete INTEGER,
  workstreams_total INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pmi_vc_milestones_deal ON pmi_value_capture_milestones(deal_id);
