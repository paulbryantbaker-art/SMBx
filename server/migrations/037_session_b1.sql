-- Migration 037: Session B1 — gate labels, financial snapshot timestamp, auditor support
-- B1.1: gate_label on conversations for gate sequence tracking
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS gate_label VARCHAR(10);
CREATE INDEX IF NOT EXISTS idx_conversations_deal_gate_label ON conversations(deal_id, gate_label);

-- B1.4: financial_snapshot_at timestamp (snapshot JSONB already exists from 035)
ALTER TABLE deals ADD COLUMN IF NOT EXISTS financial_snapshot_at TIMESTAMPTZ;

-- B1.6: system settings for FRED rate monitoring
CREATE TABLE IF NOT EXISTS system_settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
