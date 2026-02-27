-- Fix deliverables schema: rename column to match code, relax NOT NULL on type
ALTER TABLE deliverables RENAME COLUMN price_paid_cents TO price_charged_cents;
ALTER TABLE deliverables ALTER COLUMN type DROP NOT NULL;
ALTER TABLE deliverables ALTER COLUMN type SET DEFAULT NULL;

-- Add Deal Screening Memo to menu items (Buy journey, B1 gate)
INSERT INTO menu_items (slug, name, description, tier, base_price_cents, category, journey, gate, deliverable_type) VALUES
('buy-deal-screening-memo', 'Deal Screening Memo', 'Go/no-go assessment of a potential acquisition: financial health, valuation sanity, strategic fit, and risk factors.', 'analyst', 1500, 'sourcing', 'buy', 'B1', 'report')
ON CONFLICT (slug) DO NOTHING;
