-- Buyer profile columns for capital structure analysis
ALTER TABLE deals ADD COLUMN IF NOT EXISTS buyer_credit_score_range VARCHAR(20);
ALTER TABLE deals ADD COLUMN IF NOT EXISTS buyer_liquid_assets_cents BIGINT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS buyer_retirement_funds_cents BIGINT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS buyer_home_equity_cents BIGINT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS buyer_citizenship_status VARCHAR(20);
ALTER TABLE deals ADD COLUMN IF NOT EXISTS buyer_industry_experience_years INTEGER;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS buyer_existing_debt_annual_cents BIGINT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS seller_financing_willingness VARCHAR(20);
ALTER TABLE deals ADD COLUMN IF NOT EXISTS seller_standby_willingness VARCHAR(20);

-- Capital Structure Analysis deliverable
INSERT INTO menu_items (name, description, tier, base_price_cents, journey_type, gate, category, is_active, sort_order)
VALUES ('Capital Structure Analysis', 'Personalized capital stack recommendation with DSCR sensitivity at 3 rate scenarios, equity injection waterfall from your specific assets, and monthly debt service schedule.', 'associate', 12500, 'buy', 'B2', 'analysis', true, 20)
ON CONFLICT DO NOTHING;
