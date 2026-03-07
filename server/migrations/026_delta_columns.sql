-- Delta columns: exit type, PMI tracking, seller timeline, buyer conviction

-- Exit type on all relevant tables
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS exit_type TEXT;
ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS exit_type TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS exit_type TEXT;

-- PMI phase tracking
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS pmi_phase TEXT;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS pmi_close_date DATE;

-- Seller journey timeline
ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS estimated_exit_months INTEGER;
ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS journey_phase TEXT;

-- Buyer conviction check
ALTER TABLE discovery_targets ADD COLUMN IF NOT EXISTS conviction_check JSONB;
