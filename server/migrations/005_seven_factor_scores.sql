-- Seven-factor valuation scoring columns
ALTER TABLE deals ADD COLUMN IF NOT EXISTS seven_factor_scores JSONB;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS seven_factor_composite INTEGER;

-- Also add to anonymous_sessions.data support (already JSONB, no migration needed)
