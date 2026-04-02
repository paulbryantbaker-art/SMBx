-- 042_support_issues.sql
-- Yulia-powered support: issues, feature requests, system errors

CREATE TABLE IF NOT EXISTS support_issues (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  deal_id INTEGER REFERENCES deals(id),
  conversation_id INTEGER REFERENCES conversations(id),

  type TEXT NOT NULL CHECK (type IN ('bug', 'feature_request', 'feedback', 'system_error')),
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'major', 'minor', 'enhancement')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'investigating', 'resolved', 'wont_fix', 'duplicate')),

  title TEXT NOT NULL,
  description TEXT NOT NULL,
  user_message TEXT,

  context JSONB DEFAULT '{}',
  resolution TEXT,
  internal_notes TEXT,

  related_file TEXT,
  related_service TEXT,

  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_issues_status ON support_issues(status);
CREATE INDEX IF NOT EXISTS idx_support_issues_type ON support_issues(type, severity);
CREATE INDEX IF NOT EXISTS idx_support_issues_user ON support_issues(user_id);
CREATE INDEX IF NOT EXISTS idx_support_issues_created ON support_issues(created_at DESC);
