-- Deep Data + Event Detection: EDGAR, news monitoring, event pipeline

-- SEC EDGAR company benchmarks by industry
CREATE TABLE IF NOT EXISTS edgar_benchmarks (
  id SERIAL PRIMARY KEY,
  naics_code VARCHAR(10),
  sic_code VARCHAR(10),
  metric VARCHAR(50) NOT NULL, -- 'revenue', 'net_income', 'total_assets', 'employees', 'gross_margin'
  percentile_25 DECIMAL(15,2),
  percentile_50 DECIMAL(15,2),
  percentile_75 DECIMAL(15,2),
  sample_size INTEGER,
  data_year INTEGER NOT NULL,
  source VARCHAR(50) NOT NULL DEFAULT 'edgar_frames',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_edgar_naics ON edgar_benchmarks(naics_code);
CREATE INDEX IF NOT EXISTS idx_edgar_year ON edgar_benchmarks(data_year);

-- News events from GDELT and other sources
CREATE TABLE IF NOT EXISTS market_events (
  id SERIAL PRIMARY KEY,
  source VARCHAR(30) NOT NULL DEFAULT 'gdelt', -- 'gdelt', 'sec_filing', 'fed_announcement', 'manual'
  title VARCHAR(500) NOT NULL,
  summary TEXT,
  url TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  naics_codes VARCHAR(10)[], -- affected industries
  geography VARCHAR(100),
  impact_score DECIMAL(3,1), -- 0-10 scale from Haiku classification
  sentiment VARCHAR(20), -- 'positive', 'negative', 'neutral'
  category VARCHAR(50), -- 'regulation', 'market', 'technology', 'competition', 'economic', 'legal'
  raw_data JSONB,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_naics ON market_events USING gin(naics_codes);
CREATE INDEX IF NOT EXISTS idx_events_date ON market_events(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_events_impact ON market_events(impact_score DESC);

-- Event-to-deal linkages (which events are relevant to which deals)
CREATE TABLE IF NOT EXISTS deal_event_links (
  id SERIAL PRIMARY KEY,
  deal_id INTEGER NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  event_id INTEGER NOT NULL REFERENCES market_events(id) ON DELETE CASCADE,
  relevance_score DECIMAL(3,1), -- 0-10
  surfaced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  dismissed_at TIMESTAMPTZ,
  UNIQUE(deal_id, event_id)
);

CREATE INDEX IF NOT EXISTS idx_deal_events_deal ON deal_event_links(deal_id);

-- Industry Health Index (6-component composite score)
CREATE TABLE IF NOT EXISTS industry_health_index (
  id SERIAL PRIMARY KEY,
  naics_code VARCHAR(10) NOT NULL,
  geography VARCHAR(100), -- NULL = national
  score DECIMAL(4,1) NOT NULL, -- 0-100 composite
  components JSONB NOT NULL, -- { growth: 72, employment: 65, margins: 58, concentration: 45, volatility: 38, outlook: 80 }
  data_sources JSONB, -- which sources contributed
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days')
);

CREATE INDEX IF NOT EXISTS idx_ihi_naics ON industry_health_index(naics_code);
CREATE INDEX IF NOT EXISTS idx_ihi_score ON industry_health_index(score DESC);

-- KPI templates per industry
CREATE TABLE IF NOT EXISTS industry_kpi_templates (
  id SERIAL PRIMARY KEY,
  naics_code VARCHAR(10),
  industry_name VARCHAR(100) NOT NULL,
  kpis JSONB NOT NULL, -- array of { name, description, formula, benchmark_low, benchmark_high, unit }
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed common industry KPI templates
INSERT INTO industry_kpi_templates (naics_code, industry_name, kpis) VALUES
  ('722511', 'Full-Service Restaurants', '[
    {"name":"Food Cost %","description":"Cost of food as % of revenue","benchmark_low":28,"benchmark_high":35,"unit":"%"},
    {"name":"Labor Cost %","description":"Total labor as % of revenue","benchmark_low":25,"benchmark_high":35,"unit":"%"},
    {"name":"Prime Cost %","description":"Food + labor combined","benchmark_low":55,"benchmark_high":65,"unit":"%"},
    {"name":"RevPASH","description":"Revenue per available seat hour","benchmark_low":15,"benchmark_high":35,"unit":"$"},
    {"name":"Table Turn Rate","description":"Average turns per table per service","benchmark_low":1.5,"benchmark_high":3.0,"unit":"x"}
  ]'::jsonb),
  ('561710', 'Pest Control', '[
    {"name":"Revenue per Tech","description":"Annual revenue per technician","benchmark_low":120000,"benchmark_high":200000,"unit":"$"},
    {"name":"Route Density","description":"Stops per route per day","benchmark_low":8,"benchmark_high":16,"unit":"stops"},
    {"name":"Recurring Revenue %","description":"Recurring contracts as % of total","benchmark_low":60,"benchmark_high":85,"unit":"%"},
    {"name":"Customer Retention","description":"Annual customer retention rate","benchmark_low":75,"benchmark_high":90,"unit":"%"},
    {"name":"Avg Revenue Per Customer","description":"Annual revenue per customer","benchmark_low":400,"benchmark_high":800,"unit":"$"}
  ]'::jsonb),
  ('238220', 'HVAC Contractors', '[
    {"name":"Service vs Install Mix","description":"Service revenue as % of total","benchmark_low":30,"benchmark_high":60,"unit":"%"},
    {"name":"Maintenance Agreement %","description":"Customers on maintenance plans","benchmark_low":15,"benchmark_high":40,"unit":"%"},
    {"name":"Revenue per Tech","description":"Annual revenue per technician","benchmark_low":150000,"benchmark_high":250000,"unit":"$"},
    {"name":"Avg Ticket Size","description":"Average service call revenue","benchmark_low":250,"benchmark_high":500,"unit":"$"},
    {"name":"Close Rate","description":"Estimate to close conversion","benchmark_low":40,"benchmark_high":70,"unit":"%"}
  ]'::jsonb),
  ('541511', 'IT Services / MSP', '[
    {"name":"MRR per Endpoint","description":"Monthly recurring revenue per managed endpoint","benchmark_low":75,"benchmark_high":200,"unit":"$"},
    {"name":"Recurring Revenue %","description":"MRR as % of total revenue","benchmark_low":60,"benchmark_high":90,"unit":"%"},
    {"name":"CSAT Score","description":"Customer satisfaction score","benchmark_low":85,"benchmark_high":95,"unit":"%"},
    {"name":"Revenue per Employee","description":"Annual revenue per FTE","benchmark_low":100000,"benchmark_high":200000,"unit":"$"},
    {"name":"Client Concentration","description":"Top 5 clients as % of revenue","benchmark_low":15,"benchmark_high":35,"unit":"%"}
  ]'::jsonb)
ON CONFLICT DO NOTHING;
