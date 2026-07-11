-- Practice-site lead capture (corpdevservices landing, 2026-07-11).
-- Every Yulia-intake or form submission persists here even if the visitor
-- never books (README rule). Public, rate-limited endpoint: /api/practice/leads.
CREATE TABLE IF NOT EXISTS practice_leads (
  id SERIAL PRIMARY KEY,
  persona TEXT,
  thesis TEXT,
  size_geo TEXT,
  email TEXT,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_practice_leads_created ON practice_leads (created_at DESC);
