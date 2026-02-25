-- Gate progress: tracks advancement through the 22-gate system
CREATE TABLE IF NOT EXISTS gate_progress (
  id SERIAL PRIMARY KEY,
  deal_id INTEGER NOT NULL REFERENCES deals(id),
  gate VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'locked',
  data JSONB DEFAULT '{}'::jsonb,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(deal_id, gate)
);

CREATE INDEX IF NOT EXISTS idx_gate_progress_deal ON gate_progress(deal_id);

CREATE INDEX IF NOT EXISTS idx_gate_progress_deal_gate ON gate_progress(deal_id, gate);

-- Link anonymous sessions to deals
ALTER TABLE anonymous_sessions ADD COLUMN IF NOT EXISTS deal_id INTEGER REFERENCES deals(id);

-- Add employee_count to deals for league classification
ALTER TABLE deals ADD COLUMN IF NOT EXISTS employee_count INTEGER;

-- Add naics_code to deals for industry classification
ALTER TABLE deals ADD COLUMN IF NOT EXISTS naics_code VARCHAR(10);
