-- Deal archive (2026-07-31): retire dead or test deals out of the working board
-- without deleting them. Paul: "all of the deals in the app are test dummies,
-- i want a way to delete all of them" — archive rather than DELETE, because a
-- real DELETE FROM deals cannot run: 11 foreign keys reference deals(id) with
-- no ON DELETE clause (conversations, deliverables, gate_progress, theses,
-- wallet_transactions, support_issues, referrals, service_referrals,
-- anonymous_sessions, company_profiles), so Postgres RESTRICTs the delete.
-- Archiving hides them from every board and keeps the graph intact.
--
-- Mirrors the house pattern already used for research_runs.archived (103) and
-- research_schedules.archived (104): a plain boolean, default false.
--
-- NOT `status` and NOT `disposition`: `status` carries deal lifecycle
-- ('active'/…) and `disposition` ('active'|'deferred') controls whether Yulia
-- reads the deal in the background. Archived is a third, orthogonal question —
-- "is this in my working set at all" — so it gets its own column.

ALTER TABLE deals ADD COLUMN IF NOT EXISTS archived BOOLEAN NOT NULL DEFAULT FALSE;

-- The deals list is always scoped by user_id and now always filtered by
-- archived, so index the pair.
CREATE INDEX IF NOT EXISTS idx_deals_user_archived ON deals(user_id, archived);
