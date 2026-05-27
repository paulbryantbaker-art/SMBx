-- Migration 034: Fix menu item prices (internal accounting only)
-- Users never see these internal accounting prices. User-facing pricing is monthly subscriptions only.

UPDATE menu_items SET base_price_cents = 35000 WHERE slug = 'sell-valuation-report';
UPDATE menu_items SET base_price_cents = 70000 WHERE slug = 'sell-cim';
UPDATE menu_items SET base_price_cents = 20000 WHERE slug = 'buy-sba-bankability';
UPDATE menu_items SET base_price_cents = 15000 WHERE slug = 'buy-deal-scorecard';
UPDATE menu_items SET base_price_cents = 20000 WHERE slug = 'universal-market-intelligence';
UPDATE menu_items SET base_price_cents = 12500 WHERE slug = 'buy-loi-draft';
UPDATE menu_items SET base_price_cents = 15000 WHERE slug = 'sell-working-capital-analysis';
