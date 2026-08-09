-- STOP EVERY SCHEDULED RESEARCH CAMPAIGN (2026-08-09, Paul: "we need to kill
-- these bc they eat up API. ALL of them.")
--
-- A saved campaign fired unattended on the metered org key and emailed the
-- result — a `deep` run, 41 searches plus 25 page fetches, billed at 1c/search
-- and Sonnet token rates, with RESEARCH_MONTHLY_CAP_CENTS unset (so the cap
-- resolved to Infinity) and RESEARCH_SCHEDULES_DISABLED never set on Railway.
-- researchAgent.ts is one of the two paths CLAUDE.md names as able to spend
-- real money per click, and the ONLY one that runs on a timer.
--
-- Disarming the rows is deliberately BELT AND BRACES with the code change in
-- researchAgent.ts (the scheduler now needs an explicit opt-in). The code
-- change alone would leave every campaign armed the moment anyone flipped the
-- flag back — and the tick query fires on `active = TRUE AND next_run_at <=
-- NOW()`, so a re-enable would have started the whole set immediately.
-- Clearing BOTH columns means re-enabling the scheduler does nothing until a
-- campaign is deliberately switched back on and given a new run time.
--
-- NOTHING IS DELETED. The campaigns, their topics, cadences and run history
-- all remain; they are simply not armed. Re-arm one with:
--   UPDATE research_schedules SET active = TRUE, next_run_at = <ts> WHERE id = ?;
--
-- Manual runs are untouched: pressing Run in Studio still works, because that
-- path never consults this table.

UPDATE research_schedules
SET active = FALSE,
    next_run_at = NULL
WHERE active = TRUE OR next_run_at IS NOT NULL;
