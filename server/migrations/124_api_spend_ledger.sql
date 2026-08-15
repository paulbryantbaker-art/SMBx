-- Migration 124: the global model-spend ledger (2026-08-14)
--
-- WHY. `API_LANES` (server/services/apiSpend.ts) answers "may this path call a
-- model at all". It does not answer "how much has been spent this month", and
-- until now nothing did: RESEARCH_MONTHLY_CAP_CENTS covers the studio lane only,
-- reading `research_runs.usage->costCents`, so chat, marketing and sourcing had
-- no accounting of any kind. A lane switch is a boolean; a ceiling needs a number.
--
-- ONE ROW PER MODEL CALL. Deliberately not a running total in `system_settings`:
-- a counter cannot be audited after the fact, and the first question anyone asks
-- when a ceiling trips is "spent on WHAT". `lane` + `source` + `model` answer it.
--
-- `cost_cents` is INTEGER and money is in cents (rule 10). It is computed from
-- token counts at the call site using the model's published rate — an estimate,
-- and named as one. It will not reconcile to the Anthropic invoice exactly
-- (prompt caching, batch discounts and search billing all move it); it is meant
-- to stop a runaway, not to close the books.
--
-- `user_id` is nullable ON PURPOSE and NOT a foreign key cascade target: the
-- marketing lane has no user, and a deleted user must not take their spend
-- history with them — that is the record of money already gone.

CREATE TABLE IF NOT EXISTS api_spend_ledger (
  id            BIGSERIAL PRIMARY KEY,
  lane          TEXT NOT NULL,              -- chat · marketing · studio · sourcing
  source        TEXT NOT NULL,              -- the call site, e.g. 'chat.stream', 'practice.intake'
  model         TEXT,
  input_tokens  INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  cost_cents    INTEGER NOT NULL DEFAULT 0, -- ESTIMATE. See the note above.
  user_id       INTEGER,                    -- NULL for unauthenticated marketing calls
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- The only hot query is "sum cost_cents for the current calendar month", run on
-- a cache refresh rather than per request.
CREATE INDEX IF NOT EXISTS idx_api_spend_ledger_created ON api_spend_ledger(created_at);
CREATE INDEX IF NOT EXISTS idx_api_spend_ledger_lane_created ON api_spend_ledger(lane, created_at);
