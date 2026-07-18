-- Research activity trail (2026-07-18): Claude-style live progress per run.
-- Each entry is { t, kind: 'phase'|'search'|'read'|'done'|'error', text } —
-- what the researcher searched, which pages it read, and where it is in the
-- pipeline. Written as the run executes; kept on completion as the run's
-- "what it did" record.
ALTER TABLE research_runs ADD COLUMN IF NOT EXISTS activity JSONB NOT NULL DEFAULT '[]'::jsonb;
