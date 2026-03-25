-- Migration 036: Execution fee cleanup
-- Ensure execution_stripe_id column exists (supplements stripe_payment_intent_id)
-- Drop the platform_fee_schedule table — fee is now always 0.1% of SDE/EBITDA, $999 min

ALTER TABLE deals ADD COLUMN IF NOT EXISTS execution_stripe_id VARCHAR(255);

-- Reconfirm menu item base prices match Pricing Catalog v2 (internal accounting only)
UPDATE menu_items SET base_price_cents = 35000 WHERE slug = 'sell-valuation-report';
UPDATE menu_items SET base_price_cents = 70000 WHERE slug = 'sell-cim';
UPDATE menu_items SET base_price_cents = 20000 WHERE slug = 'buy-sba-bankability';
UPDATE menu_items SET base_price_cents = 15000 WHERE slug = 'buy-deal-scorecard';
UPDATE menu_items SET base_price_cents = 20000 WHERE slug = 'universal-market-intelligence';
UPDATE menu_items SET base_price_cents = 12500 WHERE slug = 'buy-loi-draft';
UPDATE menu_items SET base_price_cents = 15000 WHERE slug = 'sell-working-capital-analysis';
