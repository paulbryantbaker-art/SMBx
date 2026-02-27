-- Sourcing Engine: buyer theses, deal matching, scoring

-- Buyer theses (buy boxes)
CREATE TABLE IF NOT EXISTS buyer_theses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(100),
  naics_codes VARCHAR(10)[], -- array of NAICS codes
  geography VARCHAR(255), -- state, metro area, region
  state_codes VARCHAR(5)[], -- FIPS state codes
  revenue_min INTEGER, -- in dollars
  revenue_max INTEGER,
  ebitda_min INTEGER,
  ebitda_max INTEGER,
  sde_min INTEGER,
  sde_max INTEGER,
  price_min INTEGER,
  price_max INTEGER,
  employee_min INTEGER,
  employee_max INTEGER,
  keywords TEXT[], -- additional search terms
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_theses_user ON buyer_theses(user_id);
CREATE INDEX IF NOT EXISTS idx_theses_active ON buyer_theses(user_id) WHERE is_active = true;

-- Thesis matches (scored opportunities)
CREATE TABLE IF NOT EXISTS thesis_matches (
  id SERIAL PRIMARY KEY,
  thesis_id INTEGER NOT NULL REFERENCES buyer_theses(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source VARCHAR(50) NOT NULL DEFAULT 'manual', -- 'manual', 'scraped', 'intelligence', 'referral'
  title VARCHAR(255) NOT NULL,
  description TEXT,
  industry VARCHAR(100),
  location VARCHAR(255),
  asking_price INTEGER,
  revenue INTEGER,
  ebitda INTEGER,
  sde INTEGER,
  listing_url TEXT,
  score INTEGER, -- 0-100 match score
  score_breakdown JSONB, -- { revenue: 90, location: 80, industry: 100, ... }
  status VARCHAR(20) NOT NULL DEFAULT 'new', -- 'new', 'reviewing', 'pursuing', 'passed', 'archived'
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_matches_thesis ON thesis_matches(thesis_id);
CREATE INDEX IF NOT EXISTS idx_matches_user ON thesis_matches(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON thesis_matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_score ON thesis_matches(score DESC);
