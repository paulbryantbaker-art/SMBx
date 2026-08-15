-- 127 — THE CLIENT'S CAPITAL STACK, ON THE DEAL
--
-- Paul, 2026-08-15: "we want the client to tell us their capital stack and
-- borrow costs so we can update WACC and we should update the prime rate."
--
-- WHY A COLUMN AND NOT A TABLE. A stack is a small ordered list that is only
-- ever read and written whole, always in the context of exactly one deal, and
-- it has no rows anyone queries across. Normalising it would buy nothing and
-- cost a join on every read. `deals.financial_snapshot` already sets this
-- precedent on the same table.
--
-- WHY IT IS NOT DERIVED FROM sourcing/capitalStackEngine. That engine PROPOSES
-- a stack from house assumptions. This column records what the client actually
-- HAS — signed term sheets, quoted coupons, their own equity. The two must not
-- share storage: an indicative stack overwriting a real one would put house
-- guesses into a client's WACC and there would be no way to tell afterwards.
--
-- SHAPE (validated in the route, and by house/capital.ts on read):
--   {
--     "layers": [
--       { "kind": "sba-7a", "label": "...", "amountCents": 58800000,
--         "ratePct": 0.0975, "termMonths": 120,
--         "floating": { "index": "prime", "spreadPct": 0.0275 },
--         "note": "..." }
--     ],
--     "purchasePriceCents": 84000000,
--     "equity": { "riskFreePct": ..., "equityRiskPremiumPct": ...,
--                 "sizePremiumPct": ..., "specificRiskPct": ...,
--                 "sourceNote": "..." },
--     "marginalTaxRatePct": 0.26,
--     "taxRateSource": "Client CPA, 2026-07 memo",
--     "updatedAt": "2026-08-15"
--   }
--
-- NO DEFAULTS ANYWHERE IN HERE. house/capital.ts refuses to compute a WACC
-- from a partial stack rather than filling a gap, and a column default would
-- reintroduce exactly the invented number that file exists to prevent. NULL
-- means "the client has not told us", which is a different and honest state.

ALTER TABLE deals ADD COLUMN IF NOT EXISTS capital_stack JSONB;

COMMENT ON COLUMN deals.capital_stack IS
  'Client-supplied capital stack and cost-of-capital inputs. Read by house/capital.ts. NULL = not yet supplied; never defaulted.';
