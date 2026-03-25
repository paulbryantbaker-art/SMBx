-- 000_base_schema.sql
-- Creates the 4 core tables that predate the migration system.
-- All columns include those added by later ALTER TABLE migrations,
-- so subsequent IF NOT EXISTS checks become safe no-ops.

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255),
  display_name VARCHAR(255),
  google_id VARCHAR(255),
  league VARCHAR(10),
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  is_advisor BOOLEAN DEFAULT false,
  advisor_trial_journeys_used INTEGER DEFAULT 0,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- DEALS
-- ============================================================
CREATE TABLE IF NOT EXISTS deals (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  journey_type VARCHAR(10),
  current_gate VARCHAR(10),
  league VARCHAR(10),
  industry VARCHAR(255),
  location VARCHAR(255),
  business_name VARCHAR(255),
  name VARCHAR(255),
  revenue BIGINT,
  sde BIGINT,
  ebitda BIGINT,
  asking_price BIGINT,
  financials JSONB,
  financial_snapshot JSONB,
  financial_snapshot_at TIMESTAMPTZ,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  naics_code VARCHAR(10),
  employee_count INTEGER,
  seven_factor_scores JSONB,
  seven_factor_composite INTEGER,
  -- buyer profile columns (004)
  buyer_credit_score_range VARCHAR(20),
  buyer_liquid_assets_cents BIGINT,
  buyer_retirement_funds_cents BIGINT,
  buyer_home_equity_cents BIGINT,
  buyer_citizenship_status VARCHAR(20),
  buyer_industry_experience_years INTEGER,
  buyer_existing_debt_annual_cents BIGINT,
  seller_financing_willingness VARCHAR(20),
  seller_standby_willingness VARCHAR(20),
  -- exit type (026)
  exit_type TEXT,
  -- platform/execution fee (033, 036)
  platform_fee_cents INTEGER,
  platform_fee_paid BOOLEAN DEFAULT FALSE,
  platform_fee_paid_at TIMESTAMPTZ,
  stripe_payment_intent_id TEXT,
  execution_stripe_id VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deals_user_id ON deals(user_id);

-- ============================================================
-- CONVERSATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS conversations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title VARCHAR(255),
  is_archived BOOLEAN DEFAULT false,
  session_id VARCHAR(36),
  deal_id INTEGER REFERENCES deals(id),
  company_profile_id INTEGER,
  thesis_id INTEGER,
  journey TEXT,
  current_gate TEXT,
  league TEXT,
  extracted_data JSONB DEFAULT '{}',
  journey_context TEXT,
  exit_type TEXT,
  pmi_phase TEXT,
  pmi_close_date DATE,
  summary TEXT,
  gate_status VARCHAR(20) DEFAULT 'active',
  gate_label VARCHAR(10),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_deal_id ON conversations(deal_id);

-- ============================================================
-- MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL,
  content TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
