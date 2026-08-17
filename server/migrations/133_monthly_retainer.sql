-- 133 — THE RETAINER BILLS MONTHLY AGAIN
--
-- Paul, 2026-08-17: *"I want the monthly fee to be 5k per month in addition to
-- the scale. All credit towards close just like we have it."*
--
-- Migration 129 stored the retainer as `quarter_rate_cents`, defaulted to the
-- then-published $15,000 a quarter paid up front. In dollars-per-month that
-- was already $5,000; what it also was, and what has now changed, is a QUARTER
-- of committed retainer at a time. The schedule bills monthly: $5,000 a month,
-- the first month IS the engagement, step away at any month's end.
--
-- WHAT DID NOT CHANGE, and is the reason this migration is only a column: the
-- success-fee bands (5/4/3/2), the $100,000 floor, and every credit rule —
-- every retainer dollar credits at close, credit caps at the fee, no close no
-- credit. house/engagement.ts still computes all of it from the FACTS in this
-- table; nothing derived is stored, so no fee can go stale against the
-- schedule that defines it.
--
-- ── EXISTING ROWS KEEP THEIR RATE, WHICH IS WHY THIS DIVIDES ────────────
-- 129's own comment: *"stored per-row anyway: if the published schedule ever
-- moves, existing letters keep the rate they were papered at instead of
-- silently repricing."* That rule is honoured here rather than overridden. A
-- letter papered at $15,000 a quarter is a letter at $5,000 a month — the same
-- money per unit time — so the value is CONVERTED (÷3), not overwritten with
-- the new default. Overwriting would have been indistinguishable in the data
-- while quietly repricing any letter that had ever been papered at anything
-- else, and this column exists precisely so that cannot happen.
--
-- The billing CADENCE a given client is actually on lives in their engagement
-- letter, not in this column; the column carries the rate the arithmetic uses.
--
-- ── IDEMPOTENT BY GUARD, NOT BY HOPE ───────────────────────────────────
-- The rename and the ÷3 must happen exactly once — a second pass would divide
-- an already-monthly rate down to $1,667 and look like data, not an error. So
-- both sit inside one guard on the OLD column's existence: if it is gone, this
-- migration has already run and the block is skipped whole. (`_migrations`
-- normally guarantees a single run; a failure part-way through leaves the row
-- unrecorded and the file re-runs next boot, which is exactly the case this
-- guard is for.)

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'engagements' AND column_name = 'quarter_rate_cents'
  ) THEN
    ALTER TABLE engagements RENAME COLUMN quarter_rate_cents TO month_rate_cents;
    UPDATE engagements SET month_rate_cents = ROUND(month_rate_cents / 3.0)::BIGINT;
    ALTER TABLE engagements ALTER COLUMN month_rate_cents SET DEFAULT 500000;
  END IF;
END $$;

-- Belt and braces for a database that somehow has neither column: the app
-- reads `month_rate_cents` on every engagement, and a missing column is an
-- HTTP 500 on the Clients screen rather than a wrong number.
ALTER TABLE engagements ADD COLUMN IF NOT EXISTS month_rate_cents BIGINT NOT NULL DEFAULT 500000;
