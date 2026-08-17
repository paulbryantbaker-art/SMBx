-- 134 — THE RETAINER GOES BACK TO QUARTERLY (133 REVERSED)
--
-- Paul, 2026-08-17, within the hour of 133 deploying: *"I should have asked
-- first. That's even better. Let's change back. I thought it was 3500/mo, not
-- 15k per quarter. It was always correct."*
--
-- 133 moved the billing unit to the month on a request for "$5,000 a month",
-- made believing the schedule was $3,500/month. It was $15,000 a quarter —
-- which IS $5,000 a month — so the ask was already satisfied on the money, and
-- the only thing 133 actually changed was the commitment: a quarter up front
-- became a month up front. That was the part worth keeping, so this puts it
-- back. The published schedule is QUARTERLY, $15,000 paid up front.
--
-- ── WHY THIS EXISTS AT ALL, RATHER THAN A GIT REVERT ────────────────────
-- 133 shipped and ran against production before the reversal, so the column is
-- named `month_rate_cents` in a live database. Reverting only the code would
-- have left `routes/engagements.ts` reading `row.quarter_rate_cents` — a column
-- that no longer exists — and postgres-js hands back `undefined` for a missing
-- key rather than throwing, so the `?? QUARTER_RETAINER_CENTS` fallback would
-- have swallowed it silently. Every engagement would have rendered the default
-- rate and looked entirely correct, while any per-row papered rate was ignored.
-- A schema change that reached production is undone by another migration, never
-- by deleting the file that made it. 133 stays on disk as history.
--
-- ── THE ROUND TRIP IS EXACT FOR EVERY RATE THE PRACTICE HAS ─────────────
-- 133 stored `ROUND(quarter / 3)`; this multiplies by 3. That returns the exact
-- original for any quarterly rate divisible by three, which is every rate that
-- can exist here: the published $15,000 (1500000 → 500000 → 1500000), and any
-- hand-papered figure, since nothing in the API or the UI can write this column
-- at all — one schedule, no negotiated pricing, deliberately no rate input.
-- A quarterly rate NOT divisible by 3 would come back up to two cents light.
-- Named rather than papered over, because the honest statement of a lossy
-- round trip is what tells a future reader which direction to trust: after
-- this migration the ENGAGEMENT LETTER is the authority on any odd rate, not
-- this column.
--
-- ── IDEMPOTENT BY GUARD, AND CORRECT IF 133 NEVER RAN ───────────────────
-- Everything sits inside one guard on `month_rate_cents` existing. Two cases,
-- both handled by the same test: if 133 applied, this reverses it; if a
-- database never got 133 (a deploy that had not run yet, or a fresh database
-- created after this commit, where 133 renames and 134 renames straight back),
-- the column is already `quarter_rate_cents` and the block is skipped whole.
-- A second pass would otherwise multiply $15,000 up to $45,000 — data, not an
-- error, and the expensive direction to get wrong.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'engagements' AND column_name = 'month_rate_cents'
  ) THEN
    ALTER TABLE engagements RENAME COLUMN month_rate_cents TO quarter_rate_cents;
    UPDATE engagements SET quarter_rate_cents = quarter_rate_cents * 3;
    ALTER TABLE engagements ALTER COLUMN quarter_rate_cents SET DEFAULT 1500000;
  END IF;
END $$;

-- Belt and braces for a database that somehow has neither column: the app
-- reads `quarter_rate_cents` on every engagement, and a missing column is a
-- silently defaulted rate rather than a loud failure.
ALTER TABLE engagements ADD COLUMN IF NOT EXISTS quarter_rate_cents BIGINT NOT NULL DEFAULT 1500000;
