-- Gate event logging — tracks every gate transition with timestamp
CREATE TABLE IF NOT EXISTS gate_events (
  id SERIAL PRIMARY KEY,
  deal_id INTEGER NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  from_gate VARCHAR(10) NOT NULL,
  to_gate VARCHAR(10) NOT NULL,
  event_type VARCHAR(30) NOT NULL DEFAULT 'auto_advance', -- auto_advance, manual, paywall_unlock
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gate_events_deal ON gate_events(deal_id);
CREATE INDEX IF NOT EXISTS idx_gate_events_created ON gate_events(created_at);
