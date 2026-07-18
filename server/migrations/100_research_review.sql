-- Review workflow for research runs (2026-07-18): every run lands as a DRAFT
-- the practitioner reviews — edits ride in feed_override (never mutating the
-- agent's original studio_feed) — then approves for posting.
ALTER TABLE research_runs ADD COLUMN IF NOT EXISTS review_status TEXT NOT NULL DEFAULT 'draft';
ALTER TABLE research_runs ADD COLUMN IF NOT EXISTS feed_override JSONB;
