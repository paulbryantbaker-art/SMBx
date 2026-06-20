-- Structured inbound offers (advisor sell-side cockpit, Phase 2).
--
-- A deal_offer is one structured IOI/LOI a buyer submits for a sell-side deal:
-- the actual TERMS (price, cash at close, seller note, earnout, rollover,
-- escrow/holdback, contingencies, exclusivity, expiration). This is the
-- inbound, captured counterpart to:
--   - deal_buyers (092): the marketing list / funnel STATUS — one row per buyer.
--   - loiGenerator (server/services/generators): an OUTBOUND draft Yulia writes.
-- A buyer submits MULTIPLE offers over time (IOI → LOI → revised LOI), so offers
-- are a CHILD table one-to-many under deal_buyers (buyer_id), not columns on it —
-- that preserves offer history and lets the comparison view compare versions.
--
-- All money is INTEGER CENTS (BIGINT), nullable so an un-stated term renders as
-- "—" (never a fabricated $0). THE LINE: this only CAPTURES and COMPARES terms;
-- it never recommends an offer, never transmits acceptance, never auto-contacts.
CREATE TABLE IF NOT EXISTS deal_offers (
  id SERIAL PRIMARY KEY,
  deal_id INTEGER NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  -- An offer can be logged before a formal buyer row exists, and deleting a
  -- buyer must NOT erase the captured offer — so nullable + SET NULL.
  buyer_id INTEGER REFERENCES deal_buyers(id) ON DELETE SET NULL,
  user_id INTEGER NOT NULL REFERENCES users(id),
  buyer_name TEXT,                                   -- denormalized display fallback when buyer_id is null
  offer_type TEXT NOT NULL DEFAULT 'ioi',            -- ioi | loi
  status TEXT NOT NULL DEFAULT 'received',           -- received | under_review | countered | accepted | declined | expired | withdrawn

  -- Consideration legs — all INTEGER CENTS, nullable (un-stated → "—").
  total_price_cents BIGINT,                          -- headline / total consideration
  cash_at_close_cents BIGINT,                        -- certain
  seller_note_cents BIGINT,                          -- deferred-but-fixed (principal)
  seller_note_rate_bps INTEGER,                      -- structured note rate (basis points) — descriptive term only; never discounted/PV'd inline (any PV is a separate, user-invoked, labeled worked-example)
  seller_note_term_months INTEGER,                   -- structured note term
  earnout_cents BIGINT,                              -- contingent (max payout / ceiling)
  earnout_term_months INTEGER,
  earnout_basis TEXT,                                -- what the earnout is measured on (free-text qualifier)
  rollover_cents BIGINT,                             -- equity rollover at stated value
  escrow_holdback_cents BIGINT,                      -- at-risk portion held back

  contingencies TEXT,                                -- financing / DD / other conditions (free text)
  exclusivity_days INTEGER,
  expires_at TIMESTAMPTZ,                            -- offer / exclusivity expiration
  notes TEXT,
  submitted_at TIMESTAMPTZ,                          -- when the buyer submitted it (advisor-entered)

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_deal_offers_deal ON deal_offers(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_offers_buyer ON deal_offers(buyer_id);
