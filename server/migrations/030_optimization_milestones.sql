-- Optimization Milestones — Track seller value enhancement progress over time
CREATE TABLE IF NOT EXISTS optimization_milestones (
  id SERIAL PRIMARY KEY,
  deal_id INTEGER NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  milestone_type TEXT NOT NULL CHECK (milestone_type IN ('plan_created', 'action_completed', 'valuation_refresh', 'quarterly_review')),
  description TEXT NOT NULL,
  valuation_snapshot_low BIGINT,
  valuation_snapshot_high BIGINT,
  actions_completed INTEGER,
  actions_total INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_optimization_milestones_deal ON optimization_milestones(deal_id);
CREATE INDEX IF NOT EXISTS idx_optimization_milestones_type ON optimization_milestones(milestone_type);
