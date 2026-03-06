-- Session 11: Improvement Actions for Seller Value Roadmap

CREATE TABLE IF NOT EXISTS improvement_actions (
  id SERIAL PRIMARY KEY,
  company_profile_id INTEGER NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,

  -- Action details
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,           -- 'financial' | 'operations' | 'sales' | 'documentation'

  -- Impact
  ebitda_impact_cents BIGINT,      -- estimated EBITDA improvement in cents
  valuation_impact_cents BIGINT,   -- estimated sale price improvement in cents
  difficulty TEXT,                 -- 'easy' | 'medium' | 'hard'
  timeline_days INTEGER,           -- estimated days to complete

  -- Status
  status TEXT DEFAULT 'not_started',  -- 'not_started' | 'in_progress' | 'complete'
  completed_at TIMESTAMPTZ,
  completion_note TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_improvement_actions_profile ON improvement_actions(company_profile_id);
CREATE INDEX idx_improvement_actions_status ON improvement_actions(status);
