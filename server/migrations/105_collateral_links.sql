-- Collateral provenance (2026-07-19): exported artifacts file into the
-- library linked to the run and campaign they came from, so campaign
-- folders can show their own collateral.
ALTER TABLE studio_assets ADD COLUMN IF NOT EXISTS run_id INTEGER;
ALTER TABLE studio_assets ADD COLUMN IF NOT EXISTS schedule_id INTEGER;
