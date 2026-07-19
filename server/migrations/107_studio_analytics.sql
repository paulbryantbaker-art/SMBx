-- Studio Performance (2026-07-19): imported LinkedIn analytics workbooks +
-- Yulia's performance analysis. The workbook is parsed MECHANICALLY server-
-- side (zero hallucination — data holds exactly what the export said); the
-- analysis is generated on demand and stored as markdown.
CREATE TABLE IF NOT EXISTS studio_analytics (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  label TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'linkedin',
  period_start DATE,
  period_end DATE,
  data JSONB NOT NULL,
  analysis TEXT,
  analysis_status TEXT NOT NULL DEFAULT 'none',
  analysis_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
