-- WHOSE BUY-BOX IS THIS (2026-07-31).
--
-- Paul: "the only thing we're adding on top of this is that I will be working
-- for a client… if we source deals from the internet or from whatever for a
-- client it's the same thing we were doing originally. Nothing else has changed."
--
-- Correct, and this is the whole change. The chain already exists and works:
--
--   buyer_theses (the buy-box)
--     → sourcing_portfolios (the search)
--       → sourcing_candidates (the 100 companies)
--         → deals (the one you pursue, and every gate after it)
--
-- Every one of those tables is scoped to `user_id` and NOTHING in the chain knew
-- about a client. That is the only gap. So: one column at the TOP of the chain,
-- and everything downstream inherits it — the search belongs to the thesis, the
-- candidates belong to the search, the deal comes out of the candidates.
--
-- No new objects. The sourcing engine, the gates, the models, the data room and
-- the deliverables are unchanged and already do the work.
--
-- ON DELETE SET NULL: removing a client must never delete the research done for
-- them.

ALTER TABLE buyer_theses ADD COLUMN IF NOT EXISTS crm_account_id INTEGER
  REFERENCES crm_accounts(id) ON DELETE SET NULL;

-- "Show me everything I'm hunting for this client."
CREATE INDEX IF NOT EXISTS idx_buyer_theses_client
  ON buyer_theses(crm_account_id) WHERE crm_account_id IS NOT NULL;
