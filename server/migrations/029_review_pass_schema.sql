-- Migration 029: Review pass schema additions
-- Safe to run multiple times (IF NOT EXISTS everywhere)

-- Bizestimate shareable token + valuation reason
ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE;
ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS valuation_update_reason TEXT;

-- Advisor trial tracking
ALTER TABLE anonymous_sessions ADD COLUMN IF NOT EXISTS is_advisor BOOLEAN DEFAULT false;
ALTER TABLE anonymous_sessions ADD COLUMN IF NOT EXISTS advisor_trial_journeys_used INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_advisor BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS advisor_trial_journeys_used INTEGER DEFAULT 0;

-- Deliverable organization
ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS folder_category TEXT;
ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE;

-- Improvement actions extras
ALTER TABLE improvement_actions ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE improvement_actions ADD COLUMN IF NOT EXISTS deal_id UUID;
