-- Migration 035: Gate conversations + living documents
-- Phase 4: conversation lifecycle for gate advancement
-- Phase 5: deal financial snapshots + deliverable freshness tracking

-- Phase 4: conversations
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS gate_status VARCHAR(20) DEFAULT 'active';
CREATE INDEX IF NOT EXISTS idx_conversations_deal_gate ON conversations(deal_id, gate_status);

-- Phase 5: deals
ALTER TABLE deals ADD COLUMN IF NOT EXISTS financial_snapshot JSONB;

-- Phase 5: deliverables
ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS version_number INTEGER NOT NULL DEFAULT 1;
ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS is_stale BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS stale_reason TEXT;
ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS generated_from_snapshot JSONB;
ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS last_regenerated_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_deliverables_stale ON deliverables(deal_id, is_stale) WHERE is_stale = true;
