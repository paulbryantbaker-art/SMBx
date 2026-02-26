-- Menu items catalog: all purchasable deliverables
CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  tier VARCHAR(20) NOT NULL DEFAULT 'analyst',  -- analyst, associate, vp
  base_price_cents INTEGER NOT NULL,             -- before league multiplier
  category VARCHAR(50) NOT NULL,                 -- valuation, packaging, sourcing, diligence, structuring, closing, raise, pmi
  journey VARCHAR(20),                           -- sell, buy, raise, pmi, or NULL for universal
  gate VARCHAR(10),                              -- gate where this deliverable becomes available
  deliverable_type VARCHAR(50),                  -- report, document, analysis, model, checklist
  estimated_minutes INTEGER DEFAULT 1,           -- estimated generation time
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Wallets: user balance tracking
CREATE TABLE IF NOT EXISTS wallets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
  balance_cents INTEGER NOT NULL DEFAULT 0,
  total_deposited_cents INTEGER NOT NULL DEFAULT 0,
  total_spent_cents INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Wallet transactions: audit trail
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  type VARCHAR(20) NOT NULL,           -- credit, debit, refund
  amount_cents INTEGER NOT NULL,
  description TEXT,
  deal_id INTEGER REFERENCES deals(id),
  menu_item_id INTEGER REFERENCES menu_items(id),
  stripe_session_id VARCHAR(200),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Deliverables: generated work products
CREATE TABLE IF NOT EXISTS deliverables (
  id SERIAL PRIMARY KEY,
  deal_id INTEGER REFERENCES deals(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  menu_item_id INTEGER REFERENCES menu_items(id),
  type VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',  -- pending, generating, complete, failed
  content JSONB,
  pdf_url TEXT,
  price_paid_cents INTEGER DEFAULT 0,
  generation_model VARCHAR(50),
  generation_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_deal ON deliverables(deal_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_user ON deliverables(user_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_journey ON menu_items(journey);
CREATE INDEX IF NOT EXISTS idx_menu_items_gate ON menu_items(gate);

-- ═══════════════════════════════════════════════════════════
-- SEED: Menu Items Catalog (~91 deliverables)
-- Base prices BEFORE league multiplier
-- ═══════════════════════════════════════════════════════════

-- ─── SELL JOURNEY ──────────────────────────────────────────

-- S0: Intake (FREE)
INSERT INTO menu_items (slug, name, description, tier, base_price_cents, category, journey, gate, deliverable_type) VALUES
('sell-business-profile', 'Business Profile Summary', 'Snapshot of your business: industry, location, financials, and key characteristics.', 'analyst', 0, 'valuation', 'sell', 'S0', 'report'),
('sell-league-card', 'League Classification Card', 'Your league classification with metric ranges, typical buyers, and deal structure.', 'analyst', 0, 'valuation', 'sell', 'S0', 'report'),
('sell-journey-roadmap', 'Journey Roadmap', 'Step-by-step roadmap from intake to closing with timeline estimates.', 'analyst', 0, 'valuation', 'sell', 'S0', 'report')
ON CONFLICT (slug) DO NOTHING;

-- S1: Financials (FREE)
INSERT INTO menu_items (slug, name, description, tier, base_price_cents, category, journey, gate, deliverable_type) VALUES
('sell-financial-spread', 'Financial Spread (3-Year)', 'Normalized P&L across 3 years with trend analysis and margin benchmarks.', 'analyst', 0, 'valuation', 'sell', 'S1', 'report'),
('sell-add-back-schedule', 'Add-Back Schedule', 'Documented add-backs with verification status and SDE/EBITDA impact.', 'analyst', 0, 'valuation', 'sell', 'S1', 'report'),
('sell-earnings-summary', 'Earnings Summary Card', 'One-page adjusted SDE/EBITDA calculation with supporting detail.', 'analyst', 0, 'valuation', 'sell', 'S1', 'report')
ON CONFLICT (slug) DO NOTHING;

-- S2: Valuation (PAYWALL)
INSERT INTO menu_items (slug, name, description, tier, base_price_cents, category, journey, gate, deliverable_type) VALUES
('sell-valuation-report', 'Business Valuation Report', 'Multi-methodology valuation with defensible price range, industry comps, and premium/discount analysis.', 'analyst', 1500, 'valuation', 'sell', 'S2', 'report'),
('sell-seven-factor-analysis', 'Seven-Factor Quality Analysis', 'Deep-dive into the 7 factors that drive your multiple: recurring revenue, concentration, dependency, growth, margins, financials, timing.', 'analyst', 1000, 'valuation', 'sell', 'S2', 'analysis'),
('sell-market-snapshot', 'Market Snapshot', 'Industry-specific market data: recent transactions, buyer activity, multiple trends.', 'analyst', 1000, 'valuation', 'sell', 'S2', 'report'),
('sell-price-gap-analysis', 'Price Gap Analysis', 'Comparison of your target price vs market reality with strategy recommendations.', 'analyst', 800, 'valuation', 'sell', 'S2', 'analysis'),
('sell-probability-of-sale', 'Probability of Sale Score', 'Scored assessment (0-100) of your likelihood of successful sale with improvement recommendations.', 'analyst', 500, 'valuation', 'sell', 'S2', 'analysis')
ON CONFLICT (slug) DO NOTHING;

-- S3: Packaging
INSERT INTO menu_items (slug, name, description, tier, base_price_cents, category, journey, gate, deliverable_type) VALUES
('sell-cim', 'Confidential Information Memorandum', 'Full CIM: executive summary, business overview, financials, growth opportunities, transaction overview. Length adapted to league.', 'associate', 7500, 'packaging', 'sell', 'S3', 'document'),
('sell-blind-teaser', 'Blind Teaser (1-Page)', 'Anonymized one-page profile for initial buyer outreach.', 'analyst', 1000, 'packaging', 'sell', 'S3', 'document'),
('sell-executive-summary', 'Executive Summary', '2-page executive summary for targeted buyer outreach.', 'analyst', 1500, 'packaging', 'sell', 'S3', 'document'),
('sell-data-room-structure', 'Data Room Structure', 'Organized data room checklist with document categories and upload guide.', 'analyst', 500, 'packaging', 'sell', 'S3', 'checklist'),
('sell-financial-summary-package', 'Financial Summary Package', 'Formatted financial summary for buyer presentation: normalized P&L, balance sheet, key metrics.', 'analyst', 2000, 'packaging', 'sell', 'S3', 'document')
ON CONFLICT (slug) DO NOTHING;

-- S4: Market Matching
INSERT INTO menu_items (slug, name, description, tier, base_price_cents, category, journey, gate, deliverable_type) VALUES
('sell-buyer-list', 'Qualified Buyer List', 'Targeted list of potential buyers matched to your business profile and league.', 'associate', 3000, 'sourcing', 'sell', 'S4', 'report'),
('sell-outreach-strategy', 'Outreach Strategy', 'Multi-channel outreach plan with messaging templates and timeline.', 'analyst', 1500, 'sourcing', 'sell', 'S4', 'report'),
('sell-buyer-brief', 'Buyer Qualification Brief', 'Assessment template for evaluating buyer quality: financial capability, operational fit, strategic fit.', 'analyst', 1000, 'sourcing', 'sell', 'S4', 'document'),
('sell-loi-comparison', 'LOI Comparison Matrix', 'Side-by-side comparison of received LOIs with recommendation.', 'associate', 2500, 'sourcing', 'sell', 'S4', 'analysis')
ON CONFLICT (slug) DO NOTHING;

-- S5: Closing
INSERT INTO menu_items (slug, name, description, tier, base_price_cents, category, journey, gate, deliverable_type) VALUES
('sell-dd-checklist', 'Due Diligence Coordination Checklist', 'Comprehensive DD checklist organized by workstream with status tracking.', 'associate', 2500, 'closing', 'sell', 'S5', 'checklist'),
('sell-deal-structure-analysis', 'Deal Structure Analysis', 'Tax-optimized deal structure recommendation: asset vs stock, earnout terms, seller financing.', 'associate', 5000, 'structuring', 'sell', 'S5', 'analysis'),
('sell-funds-flow', 'Funds Flow Statement', 'Detailed funds flow: purchase price, adjustments, costs, net proceeds to seller.', 'vp', 10000, 'closing', 'sell', 'S5', 'document'),
('sell-closing-checklist', 'Closing Checklist', 'Pre-closing and closing day checklist with all deliverables and deadlines.', 'associate', 2500, 'closing', 'sell', 'S5', 'checklist'),
('sell-working-capital-analysis', 'Working Capital Analysis', 'NWC peg calculation with adjustment mechanism and historical analysis.', 'vp', 7500, 'closing', 'sell', 'S5', 'analysis')
ON CONFLICT (slug) DO NOTHING;

-- ─── BUY JOURNEY ──────────────────────────────────────────

-- B0: Thesis (FREE)
INSERT INTO menu_items (slug, name, description, tier, base_price_cents, category, journey, gate, deliverable_type) VALUES
('buy-investment-thesis', 'Investment Thesis Document', 'Formalized acquisition thesis: target criteria, financing strategy, return expectations.', 'analyst', 0, 'sourcing', 'buy', 'B0', 'document'),
('buy-capital-stack-template', 'Capital Stack Template', 'Financing structure model for your target deal size with DSCR analysis.', 'analyst', 0, 'structuring', 'buy', 'B0', 'model'),
('buy-target-criteria', 'Target Criteria Summary', 'Documented search criteria: industry, geography, size, characteristics.', 'analyst', 0, 'sourcing', 'buy', 'B0', 'report'),
('buy-readiness-scorecard', 'Acquisition Readiness Scorecard', 'Assessment of buyer readiness: capital, experience, financing, timeline.', 'analyst', 0, 'sourcing', 'buy', 'B0', 'report')
ON CONFLICT (slug) DO NOTHING;

-- B1: Sourcing (FREE)
INSERT INTO menu_items (slug, name, description, tier, base_price_cents, category, journey, gate, deliverable_type) VALUES
('buy-deal-scorecard', 'Deal Scorecard', 'Scored assessment of a specific opportunity against your thesis.', 'analyst', 0, 'sourcing', 'buy', 'B1', 'analysis'),
('buy-sourcing-strategy', 'Sourcing Strategy', 'Multi-channel deal sourcing plan tailored to your criteria and league.', 'analyst', 0, 'sourcing', 'buy', 'B1', 'report')
ON CONFLICT (slug) DO NOTHING;

-- B2: Valuation (PAYWALL)
INSERT INTO menu_items (slug, name, description, tier, base_price_cents, category, journey, gate, deliverable_type) VALUES
('buy-valuation-model', 'Buyer Valuation Model', 'Financial model: what the business is worth TO YOU. Includes DSCR, cash-on-cash, IRR, MOIC projections.', 'analyst', 1500, 'valuation', 'buy', 'B2', 'model'),
('buy-sba-bankability', 'SBA Bankability Report', 'SBA eligibility assessment: credit, equity injection sources, DSCR analysis, lender matching.', 'analyst', 2000, 'structuring', 'buy', 'B2', 'report'),
('buy-capital-structure', 'Capital Structure Analysis', 'Full financing model: sources & uses, multiple scenarios, sensitivity analysis.', 'associate', 5000, 'structuring', 'buy', 'B2', 'analysis'),
('buy-loi-draft', 'LOI Draft', 'Letter of Intent draft with recommended terms and negotiation notes.', 'associate', 3000, 'structuring', 'buy', 'B2', 'document')
ON CONFLICT (slug) DO NOTHING;

-- B3: Due Diligence
INSERT INTO menu_items (slug, name, description, tier, base_price_cents, category, journey, gate, deliverable_type) VALUES
('buy-dd-checklist', 'Due Diligence Checklist', 'Comprehensive DD checklist by workstream: financial, legal, operational, tax.', 'associate', 2500, 'diligence', 'buy', 'B3', 'checklist'),
('buy-dd-summary', 'DD Summary Report', 'Summary of DD findings with risk scores (minor/major/deal-breaker) and price adjustments.', 'associate', 5000, 'diligence', 'buy', 'B3', 'report'),
('buy-red-flag-report', 'Red Flag Report', 'Identified risks with quantified valuation impact and mitigation strategies.', 'analyst', 2000, 'diligence', 'buy', 'B3', 'analysis')
ON CONFLICT (slug) DO NOTHING;

-- B4: Structuring
INSERT INTO menu_items (slug, name, description, tier, base_price_cents, category, journey, gate, deliverable_type) VALUES
('buy-sources-uses', 'Sources & Uses Model', 'Final financing structure with all sources, uses, and closing costs.', 'associate', 5000, 'structuring', 'buy', 'B4', 'model'),
('buy-earnout-analysis', 'Earnout Structure Analysis', 'Earnout modeling: targets, measurement periods, payment schedules, risk allocation.', 'associate', 3000, 'structuring', 'buy', 'B4', 'analysis'),
('buy-working-capital-model', 'Working Capital Model', 'NWC target calculation with seasonal adjustment and measurement methodology.', 'associate', 3000, 'structuring', 'buy', 'B4', 'model'),
('buy-post-close-cash-flow', 'Post-Close Cash Flow Projections', '12-month post-close cash flow model with debt service and working capital needs.', 'vp', 7500, 'structuring', 'buy', 'B4', 'model')
ON CONFLICT (slug) DO NOTHING;

-- B5: Closing
INSERT INTO menu_items (slug, name, description, tier, base_price_cents, category, journey, gate, deliverable_type) VALUES
('buy-closing-checklist', 'Closing Checklist', 'Pre-closing and closing day checklist with deadlines and responsible parties.', 'associate', 2500, 'closing', 'buy', 'B5', 'checklist'),
('buy-funds-flow', 'Funds Flow Statement (Buyer)', 'Buyer-side funds flow: all sources, all uses, wiring instructions, timing.', 'vp', 10000, 'closing', 'buy', 'B5', 'document'),
('buy-day-one-checklist', 'Day 1 Integration Checklist', 'Immediate post-close actions: security, banking, insurance, employee communication.', 'analyst', 1500, 'closing', 'buy', 'B5', 'checklist'),
('buy-employee-comms', 'Employee Communication Templates', 'All-hands script, 1:1 talking points, benefits confirmation letter.', 'analyst', 1000, 'closing', 'buy', 'B5', 'document'),
('buy-transition-plan', 'Customer/Vendor Transition Plan', 'Outreach plan for key customers and vendors with messaging templates.', 'analyst', 1500, 'closing', 'buy', 'B5', 'document')
ON CONFLICT (slug) DO NOTHING;

-- ─── RAISE JOURNEY ────────────────────────────────────────

-- R0: Intake (FREE)
INSERT INTO menu_items (slug, name, description, tier, base_price_cents, category, journey, gate, deliverable_type) VALUES
('raise-readiness-assessment', 'Raise Readiness Assessment', 'Assessment of investor readiness: financials, metrics, story, team.', 'analyst', 0, 'raise', 'raise', 'R0', 'report'),
('raise-pre-post-model', 'Pre/Post Valuation Model', 'Pre-money and post-money valuation with ownership dilution analysis.', 'analyst', 0, 'raise', 'raise', 'R0', 'model')
ON CONFLICT (slug) DO NOTHING;

-- R1: Financial Package (FREE)
INSERT INTO menu_items (slug, name, description, tier, base_price_cents, category, journey, gate, deliverable_type) VALUES
('raise-financial-projections', 'Financial Projections (3-5 Year)', '3-5 year revenue, margin, and cash flow projections with assumptions.', 'analyst', 0, 'raise', 'raise', 'R1', 'model'),
('raise-cap-table', 'Cap Table Model', 'Pre-raise and post-raise cap table with fully diluted calculations.', 'analyst', 0, 'raise', 'raise', 'R1', 'model'),
('raise-unit-economics', 'Unit Economics Analysis', 'CAC, LTV, margins, and payback period analysis.', 'analyst', 0, 'raise', 'raise', 'R1', 'analysis'),
('raise-use-of-funds', 'Use of Funds Breakdown', 'Detailed allocation with milestones and runway analysis.', 'analyst', 0, 'raise', 'raise', 'R1', 'report')
ON CONFLICT (slug) DO NOTHING;

-- R2: Investor Materials (PAYWALL)
INSERT INTO menu_items (slug, name, description, tier, base_price_cents, category, journey, gate, deliverable_type) VALUES
('raise-pitch-deck', 'AI Pitch Deck (10-15 Slides)', 'Investor pitch deck: problem, solution, market, traction, team, financials, the ask.', 'associate', 5000, 'raise', 'raise', 'R2', 'document'),
('raise-executive-summary', 'Executive Summary (1-2 Pages)', 'Concise executive summary for email outreach to investors.', 'analyst', 1500, 'raise', 'raise', 'R2', 'document'),
('raise-blind-teaser', 'Blind Teaser', 'Anonymized teaser for initial investor approaches.', 'analyst', 1000, 'raise', 'raise', 'R2', 'document'),
('raise-data-room-structure', 'Data Room Structure', 'Investor data room checklist with document categories.', 'analyst', 500, 'raise', 'raise', 'R2', 'checklist'),
('raise-financial-model', 'Investor Financial Model', 'Detailed financial model with scenarios for investor diligence.', 'associate', 5000, 'raise', 'raise', 'R2', 'model')
ON CONFLICT (slug) DO NOTHING;

-- R3: Outreach
INSERT INTO menu_items (slug, name, description, tier, base_price_cents, category, journey, gate, deliverable_type) VALUES
('raise-investor-list', 'Target Investor List', 'Matched investor profiles based on stage, industry, geography, and check size.', 'analyst', 1500, 'raise', 'raise', 'R3', 'report'),
('raise-outreach-messaging', 'Outreach Messaging Templates', 'Personalized email templates for investor outreach.', 'analyst', 1000, 'raise', 'raise', 'R3', 'document'),
('raise-meeting-prep', 'Investor Meeting Prep', 'Likely questions, model answers, and presentation coaching notes.', 'analyst', 1500, 'raise', 'raise', 'R3', 'report')
ON CONFLICT (slug) DO NOTHING;

-- R4: Terms
INSERT INTO menu_items (slug, name, description, tier, base_price_cents, category, journey, gate, deliverable_type) VALUES
('raise-term-sheet-analysis', 'Term Sheet Analysis', 'Plain-language breakdown of term sheet with flags for unusual or aggressive terms.', 'associate', 2500, 'raise', 'raise', 'R4', 'analysis'),
('raise-term-sheet-comparison', 'Term Sheet Comparison', 'Side-by-side comparison of multiple term sheets with recommendation.', 'associate', 3000, 'raise', 'raise', 'R4', 'analysis'),
('raise-dilution-model', 'Dilution Scenario Model', 'Ownership modeling across current round and future rounds.', 'analyst', 2000, 'raise', 'raise', 'R4', 'model'),
('raise-counter-proposal', 'Counter-Proposal Suggestions', 'Negotiation strategy with specific counter-terms and rationale.', 'associate', 2500, 'raise', 'raise', 'R4', 'document')
ON CONFLICT (slug) DO NOTHING;

-- R5: Closing
INSERT INTO menu_items (slug, name, description, tier, base_price_cents, category, journey, gate, deliverable_type) VALUES
('raise-closing-coordination', 'Closing Coordination', 'Document checklist, timeline, and coordination plan for closing the raise.', 'vp', 7500, 'closing', 'raise', 'R5', 'checklist'),
('raise-cap-table-final', 'Final Cap Table', 'Updated cap table with final terms, fully diluted ownership, and option pool.', 'analyst', 1500, 'raise', 'raise', 'R5', 'model'),
('raise-form-d-guide', 'Form D Filing Guide', 'Step-by-step guidance for Reg D filing requirements.', 'analyst', 1000, 'raise', 'raise', 'R5', 'document'),
('raise-investor-update-template', 'Investor Update Templates', 'Monthly/quarterly investor update templates with KPI tracking.', 'analyst', 1000, 'raise', 'raise', 'R5', 'document')
ON CONFLICT (slug) DO NOTHING;

-- ─── PMI JOURNEY ──────────────────────────────────────────

-- PMI0: Day Zero (FREE)
INSERT INTO menu_items (slug, name, description, tier, base_price_cents, category, journey, gate, deliverable_type) VALUES
('pmi-day-zero-checklist', 'Day Zero Security Checklist', 'Immediate post-close checklist: physical, digital, financial, legal security.', 'analyst', 0, 'pmi', 'pmi', 'PMI0', 'checklist'),
('pmi-100-day-plan', '100-Day Integration Plan', 'Phased integration plan: stabilize (0-30), assess (31-60), optimize (61-100).', 'analyst', 0, 'pmi', 'pmi', 'PMI0', 'report'),
('pmi-seller-training-schedule', 'Seller Training Schedule', 'Structured training and transition schedule with the previous owner.', 'analyst', 0, 'pmi', 'pmi', 'PMI0', 'checklist')
ON CONFLICT (slug) DO NOTHING;

-- PMI1: Stabilization
INSERT INTO menu_items (slug, name, description, tier, base_price_cents, category, journey, gate, deliverable_type) VALUES
('pmi-employee-comms', 'Employee Communication Package', 'All-hands script, individual 1:1 talking points, benefits confirmation.', 'analyst', 1500, 'pmi', 'pmi', 'PMI1', 'document'),
('pmi-customer-outreach', 'Customer Outreach Plan', 'Top-customer contact strategy with talking points and retention assessment.', 'analyst', 1500, 'pmi', 'pmi', 'PMI1', 'report'),
('pmi-vendor-intro', 'Vendor Introduction Plan', 'Key vendor contact list with introduction letters and terms review.', 'analyst', 1000, 'pmi', 'pmi', 'PMI1', 'document'),
('pmi-metrics-dashboard', 'Daily Metrics Template', 'Revenue, cash flow, and operational metrics tracking template.', 'analyst', 1000, 'pmi', 'pmi', 'PMI1', 'report')
ON CONFLICT (slug) DO NOTHING;

-- PMI2: Assessment
INSERT INTO menu_items (slug, name, description, tier, base_price_cents, category, journey, gate, deliverable_type) VALUES
('pmi-swot', 'SWOT Analysis', 'Comprehensive SWOT with actionable recommendations for each quadrant.', 'associate', 2500, 'pmi', 'pmi', 'PMI2', 'analysis'),
('pmi-financial-deep-dive', 'Financial Deep-Dive', 'Revenue by customer, margin by product, cost structure vs industry benchmarks.', 'associate', 3000, 'pmi', 'pmi', 'PMI2', 'analysis'),
('pmi-ops-assessment', 'Operations Assessment', 'Process mapping, technology audit, capacity analysis.', 'associate', 2500, 'pmi', 'pmi', 'PMI2', 'analysis'),
('pmi-people-assessment', 'People Assessment', 'Org review, key person mapping, skill gaps, compensation benchmarking.', 'associate', 2500, 'pmi', 'pmi', 'PMI2', 'analysis'),
('pmi-quick-wins', 'Quick Win Identification', '5-10 quick wins with expected impact, timeline, and effort required.', 'analyst', 1500, 'pmi', 'pmi', 'PMI2', 'report')
ON CONFLICT (slug) DO NOTHING;

-- PMI3: Optimization
INSERT INTO menu_items (slug, name, description, tier, base_price_cents, category, journey, gate, deliverable_type) VALUES
('pmi-execution-plan', 'Quick Win Execution Plan', 'Prioritized execution plan with milestones and owner assignment.', 'associate', 3000, 'pmi', 'pmi', 'PMI3', 'report'),
('pmi-strategic-roadmap', '12-Month Strategic Roadmap', 'Growth, cost, hiring, technology, and marketing strategy for Year 1.', 'associate', 5000, 'pmi', 'pmi', 'PMI3', 'report'),
('pmi-kpi-dashboard', 'KPI Dashboard Setup', 'Financial, operational, customer, and employee KPIs with targets.', 'associate', 2500, 'pmi', 'pmi', 'PMI3', 'report'),
('pmi-value-creation', 'Value Creation Plan', 'EBITDA bridge, synergy tracking, add-on targets, exit timeline (PE buyers).', 'vp', 7500, 'pmi', 'pmi', 'PMI3', 'analysis'),
('pmi-monthly-review', 'Monthly Review Templates', 'Board reporting, management review agenda, KPI scorecard templates.', 'analyst', 1500, 'pmi', 'pmi', 'PMI3', 'document')
ON CONFLICT (slug) DO NOTHING;

-- ─── UNIVERSAL DELIVERABLES ────────────────────────────────

INSERT INTO menu_items (slug, name, description, tier, base_price_cents, category, journey, gate, deliverable_type) VALUES
('universal-market-intelligence', 'Market Intelligence Brief', 'Industry landscape: competitor density, PE activity, recent transactions, NAICS analysis.', 'analyst', 2000, 'valuation', NULL, NULL, 'report'),
('universal-sba-analysis', 'SBA Eligibility Analysis', 'Full SBA 7(a) eligibility check with DSCR modeling and lender recommendations.', 'analyst', 2000, 'structuring', NULL, NULL, 'analysis'),
('universal-cap-stack-model', 'Capital Stack Model', 'Complete financing structure with multiple scenarios and sensitivity analysis.', 'associate', 5000, 'structuring', NULL, NULL, 'model'),
('universal-comp-analysis', 'Comparable Transaction Analysis', 'Recent M&A transactions in the industry with multiple analysis.', 'analyst', 2500, 'valuation', NULL, NULL, 'analysis'),
('universal-industry-report', 'Industry Report', 'Deep industry analysis: size, growth, trends, key players, regulatory environment.', 'associate', 3000, 'valuation', NULL, NULL, 'report')
ON CONFLICT (slug) DO NOTHING;
