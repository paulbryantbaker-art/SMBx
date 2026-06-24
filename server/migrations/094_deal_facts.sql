-- 094_deal_facts.sql
-- Durable per-deal FACTS: cross-conversation memory so Yulia returns to a deal
-- already knowing what's established, instead of re-deriving it every time.
-- Written fire-and-forget post-conversation by dealFactsExtractor; injected into
-- the deal context by promptBuilder (buildDealFactsLayer).

CREATE TABLE IF NOT EXISTS deal_facts (
  id BIGSERIAL PRIMARY KEY,
  deal_id INTEGER NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(40) NOT NULL DEFAULT 'general',
  fact TEXT NOT NULL,
  fact_hash VARCHAR(32) NOT NULL,                 -- md5(normalized fact) for dedup
  source_conversation_id INTEGER REFERENCES conversations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (deal_id, fact_hash)
);

CREATE INDEX IF NOT EXISTS idx_deal_facts_deal ON deal_facts(deal_id);

-- Watermark: message count at last fact extraction (mirrors summary_message_count).
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS facts_message_count INTEGER NOT NULL DEFAULT 0;
