-- Session 0: Extended NAICS benchmarks with valuation multiples and market data

-- Add missing columns to naics_benchmarks
ALTER TABLE naics_benchmarks ADD COLUMN IF NOT EXISTS naics_label TEXT;
ALTER TABLE naics_benchmarks ADD COLUMN IF NOT EXISTS sde_multiple_low NUMERIC(4,2);
ALTER TABLE naics_benchmarks ADD COLUMN IF NOT EXISTS sde_multiple_mid NUMERIC(4,2);
ALTER TABLE naics_benchmarks ADD COLUMN IF NOT EXISTS sde_multiple_high NUMERIC(4,2);
ALTER TABLE naics_benchmarks ADD COLUMN IF NOT EXISTS ebitda_multiple_low NUMERIC(4,2);
ALTER TABLE naics_benchmarks ADD COLUMN IF NOT EXISTS ebitda_multiple_mid NUMERIC(4,2);
ALTER TABLE naics_benchmarks ADD COLUMN IF NOT EXISTS ebitda_multiple_high NUMERIC(4,2);
ALTER TABLE naics_benchmarks ADD COLUMN IF NOT EXISTS revenue_multiple_low NUMERIC(4,2);
ALTER TABLE naics_benchmarks ADD COLUMN IF NOT EXISTS revenue_multiple_high NUMERIC(4,2);
ALTER TABLE naics_benchmarks ADD COLUMN IF NOT EXISTS typical_sde_margin_low NUMERIC(5,2);
ALTER TABLE naics_benchmarks ADD COLUMN IF NOT EXISTS typical_sde_margin_high NUMERIC(5,2);
ALTER TABLE naics_benchmarks ADD COLUMN IF NOT EXISTS consolidation_level TEXT;
ALTER TABLE naics_benchmarks ADD COLUMN IF NOT EXISTS sba_approval_rate TEXT;
ALTER TABLE naics_benchmarks ADD COLUMN IF NOT EXISTS buyer_competition TEXT;
ALTER TABLE naics_benchmarks ADD COLUMN IF NOT EXISTS boomer_ownership_pct INTEGER;
ALTER TABLE naics_benchmarks ADD COLUMN IF NOT EXISTS data_sources TEXT[];
ALTER TABLE naics_benchmarks ADD COLUMN IF NOT EXISTS notes TEXT;
