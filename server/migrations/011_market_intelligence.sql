-- Market Intelligence Engine: NAICS taxonomy, market data, intelligence cache

-- NAICS industry taxonomy
CREATE TABLE IF NOT EXISTS naics_codes (
  code VARCHAR(10) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  sector VARCHAR(10), -- 2-digit sector code
  level INTEGER NOT NULL DEFAULT 6, -- 2=sector, 3=subsector, 4=industry group, 5=industry, 6=national
  parent_code VARCHAR(10),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_naics_sector ON naics_codes(sector);
CREATE INDEX IF NOT EXISTS idx_naics_parent ON naics_codes(parent_code);

-- Market data cache (from Census CBP, BLS QCEW, FRED)
CREATE TABLE IF NOT EXISTS market_data_cache (
  id SERIAL PRIMARY KEY,
  source VARCHAR(30) NOT NULL, -- 'census_cbp', 'bls_qcew', 'fred'
  cache_key VARCHAR(255) NOT NULL, -- unique key for this query
  data JSONB NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  UNIQUE(source, cache_key)
);

CREATE INDEX IF NOT EXISTS idx_market_cache_key ON market_data_cache(source, cache_key);
CREATE INDEX IF NOT EXISTS idx_market_cache_expires ON market_data_cache(expires_at);

-- Intelligence reports (generated market analysis)
CREATE TABLE IF NOT EXISTS intelligence_reports (
  id SERIAL PRIMARY KEY,
  deal_id INTEGER REFERENCES deals(id) ON DELETE SET NULL,
  user_id INTEGER NOT NULL REFERENCES users(id),
  report_type VARCHAR(50) NOT NULL, -- 'market_overview', 'sba_analysis', 'industry_health', 'fragmentation_map'
  naics_code VARCHAR(10),
  geography VARCHAR(100), -- state, county, metro area
  content JSONB NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'generating', -- generating, complete, failed
  price_charged_cents INTEGER NOT NULL DEFAULT 0,
  generation_model VARCHAR(50),
  generation_time_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_intel_reports_user ON intelligence_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_intel_reports_deal ON intelligence_reports(deal_id);

-- FRED economic indicators cache
CREATE TABLE IF NOT EXISTS fred_indicators (
  id SERIAL PRIMARY KEY,
  series_id VARCHAR(30) NOT NULL UNIQUE, -- e.g. 'FEDFUNDS', 'UNRATE', 'CPIAUCSL'
  title VARCHAR(255) NOT NULL,
  latest_value DECIMAL(12,4),
  latest_date DATE,
  previous_value DECIMAL(12,4),
  previous_date DATE,
  change_pct DECIMAL(8,4),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed common FRED indicators
INSERT INTO fred_indicators (series_id, title) VALUES
  ('FEDFUNDS', 'Federal Funds Effective Rate'),
  ('PRIME', 'Bank Prime Loan Rate'),
  ('MORTGAGE30US', '30-Year Fixed Rate Mortgage Average'),
  ('UNRATE', 'Unemployment Rate'),
  ('CPIAUCSL', 'Consumer Price Index for All Urban Consumers'),
  ('GDP', 'Gross Domestic Product'),
  ('INDPRO', 'Industrial Production Index'),
  ('RSAFS', 'Advance Retail Sales: Retail and Food Services')
ON CONFLICT DO NOTHING;
