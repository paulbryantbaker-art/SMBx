-- 063: Analysis runtime
-- Turns Yulia analysis from transient chat/canvas output into durable,
-- evidence-ready work product that can be reopened, versioned, cited, and
-- discussed across chat, Today, Pipeline, Files, Deal Detail, and Canvas.

CREATE TABLE IF NOT EXISTS analysis_definitions (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'analysis',
  description TEXT,
  model_family TEXT,
  output_kind TEXT NOT NULL DEFAULT 'interactive_canvas',
  default_tool_name TEXT,
  default_menu_item_slug TEXT,
  methodology_refs JSONB NOT NULL DEFAULT '[]'::jsonb,
  evidence_requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
  guardrail_tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analysis_definitions_active
  ON analysis_definitions(is_active, sort_order, slug);

CREATE TABLE IF NOT EXISTS analysis_runs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  deal_id INTEGER REFERENCES deals(id) ON DELETE CASCADE,
  conversation_id INTEGER REFERENCES conversations(id) ON DELETE SET NULL,
  definition_id INTEGER REFERENCES analysis_definitions(id) ON DELETE SET NULL,
  analysis_type TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  scope TEXT NOT NULL DEFAULT 'deal',
  source TEXT NOT NULL DEFAULT 'yulia_tool',
  input_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  assumptions JSONB NOT NULL DEFAULT '{}'::jsonb,
  outputs JSONB NOT NULL DEFAULT '{}'::jsonb,
  commentary_markdown TEXT,
  market_context JSONB NOT NULL DEFAULT '{}'::jsonb,
  risk_flags JSONB NOT NULL DEFAULT '[]'::jsonb,
  missing_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  professional_triggers JSONB NOT NULL DEFAULT '[]'::jsonb,
  canvas_tab_id TEXT,
  deliverable_id INTEGER REFERENCES deliverables(id) ON DELETE SET NULL,
  model_preference TEXT,
  model_used TEXT,
  version_number INTEGER NOT NULL DEFAULT 1,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analysis_runs_user_created
  ON analysis_runs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analysis_runs_deal_created
  ON analysis_runs(deal_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analysis_runs_type_status
  ON analysis_runs(analysis_type, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analysis_runs_deliverable
  ON analysis_runs(deliverable_id)
  WHERE deliverable_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS analysis_evidence (
  id SERIAL PRIMARY KEY,
  analysis_run_id INTEGER NOT NULL REFERENCES analysis_runs(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL,
  source_id TEXT,
  title TEXT,
  citation TEXT,
  excerpt TEXT,
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  confidence NUMERIC(4,3),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analysis_evidence_run
  ON analysis_evidence(analysis_run_id);

CREATE TABLE IF NOT EXISTS analysis_versions (
  id SERIAL PRIMARY KEY,
  analysis_run_id INTEGER NOT NULL REFERENCES analysis_runs(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  input_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  assumptions JSONB NOT NULL DEFAULT '{}'::jsonb,
  outputs JSONB NOT NULL DEFAULT '{}'::jsonb,
  commentary_markdown TEXT,
  changed_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  change_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (analysis_run_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_analysis_versions_run
  ON analysis_versions(analysis_run_id, version_number DESC);

CREATE TABLE IF NOT EXISTS model_tabs (
  id SERIAL PRIMARY KEY,
  analysis_run_id INTEGER REFERENCES analysis_runs(id) ON DELETE CASCADE,
  conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
  tab_id TEXT NOT NULL,
  model_type TEXT NOT NULL,
  title TEXT NOT NULL,
  state JSONB NOT NULL DEFAULT '{}'::jsonb,
  source_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (conversation_id, tab_id)
);

CREATE INDEX IF NOT EXISTS idx_model_tabs_analysis_run
  ON model_tabs(analysis_run_id);

CREATE INDEX IF NOT EXISTS idx_model_tabs_conversation_active
  ON model_tabs(conversation_id, is_active, updated_at DESC);

INSERT INTO analysis_definitions (
  slug,
  title,
  category,
  description,
  model_family,
  default_tool_name,
  default_menu_item_slug,
  methodology_refs,
  evidence_requirements,
  guardrail_tags,
  sort_order
) VALUES
  (
    'deal_scorecard',
    'Deal scorecard',
    'triage',
    'League-aware screening, fit score, current gate, risks, and next move.',
    'deal_triage',
    'run_analysis',
    'buy-deal-scorecard',
    '["METHODOLOGY_V17 §5 Math Engine", "METHODOLOGY_V17 §11 Interactive Canvas"]'::jsonb,
    '["deal_facts", "financials", "market_read"]'::jsonb,
    '["analysis_only"]'::jsonb,
    10
  ),
  (
    'buyer_fit',
    'Buyer fit',
    'market',
    'Score potential buyers or buyer pools against thesis, relationship angle, strategic fit, and execution likelihood.',
    'market_fit',
    'run_analysis',
    'buy-deal-scorecard',
    '["METHODOLOGY_V17 §12 Sourcing Engine"]'::jsonb,
    '["thesis", "buyer_pool", "market_sources"]'::jsonb,
    '["analysis_only", "no_broker_activity"]'::jsonb,
    20
  ),
  (
    'valuation',
    'Valuation model',
    'financial',
    'SDE/EBITDA bridge, multiple range, DCF or LBO context by league, and valuation sensitivity.',
    'valuation',
    'run_analysis',
    'buy-valuation-model',
    '["METHODOLOGY_V17 §5 Math Engine", "METHODOLOGY_V18a Tax Amendment"]'::jsonb,
    '["financials", "normalization", "comps", "market_context"]'::jsonb,
    '["analysis_only", "deterministic_math"]'::jsonb,
    30
  ),
  (
    'recast',
    'Recast and QoE lite',
    'financial',
    'Normalize SDE or EBITDA, identify add-backs, quality issues, and documentation gaps.',
    'financial_normalization',
    'run_analysis',
    'sell-financial-spread',
    '["METHODOLOGY_V17 §5 Math Engine"]'::jsonb,
    '["p_and_l", "tax_returns", "bank_statements", "add_back_support"]'::jsonb,
    '["analysis_only", "deterministic_math"]'::jsonb,
    40
  ),
  (
    'working_capital',
    'Working capital peg',
    'financial',
    'Analyze NWC methodology, peg, true-up mechanics, seasonality, and hidden value risk.',
    'working_capital',
    'run_analysis',
    'buy-working-capital-model',
    '["METHODOLOGY_V17 §10.9 Working Capital Mechanisms"]'::jsonb,
    '["balance_sheet", "monthly_working_capital", "closing_statement"]'::jsonb,
    '["analysis_only", "deterministic_math"]'::jsonb,
    50
  ),
  (
    'capital_structure',
    'Capital structure',
    'financing',
    'Sources and uses, debt capacity, seller note, rollover, earnout, DSCR, and capital stack tradeoffs.',
    'capital_structure',
    'run_analysis',
    'buy-capital-structure',
    '["METHODOLOGY_V17 §5 Math Engine", "METHODOLOGY_V18a Tax Amendment"]'::jsonb,
    '["purchase_price", "earnings", "debt_terms", "tax_profile"]'::jsonb,
    '["analysis_only", "lender_signoff"]'::jsonb,
    60
  ),
  (
    'sba',
    'SBA financing',
    'financing',
    'SBA bankability, eligibility, DSCR, equity injection, seller note, and covenant/risk screen.',
    'sba',
    'run_analysis',
    'universal-sba-analysis',
    '["METHODOLOGY_V18b Legal Amendment §5.1 SBA SOP 50 10 8"]'::jsonb,
    '["sba_terms", "earnings", "collateral", "ownership"]'::jsonb,
    '["analysis_only", "lender_signoff", "research_current_sop"]'::jsonb,
    70
  ),
  (
    'market_intelligence',
    'Market intelligence',
    'market',
    'Deal-specific or portfolio-wide market read with sources, recency, buyer appetite, financing climate, and diligence implications.',
    'market_intelligence',
    'run_analysis',
    'universal-market-intelligence',
    '["METHODOLOGY_V17 §12 Sourcing Engine"]'::jsonb,
    '["market_sources", "sector_data", "buyer_signals", "financing_data"]'::jsonb,
    '["source_citations", "recency_required"]'::jsonb,
    80
  ),
  (
    'tax_structure',
    'Tax structure comparison',
    'tax',
    'Compare asset sale, stock sale, §338(h)(10), §336(e), F-reorg, rollover, earnout, and SALT impacts where applicable.',
    'tax_structure',
    'run_analysis',
    'sell-deal-structure-analysis',
    '["METHODOLOGY_V18a Tax Amendment"]'::jsonb,
    '["entity_type", "seller_tax_profile", "buyer_profile", "purchase_price_allocation"]'::jsonb,
    '["analysis_only", "defer_to_cpa", "defer_to_tax_counsel"]'::jsonb,
    90
  ),
  (
    'legal_structure',
    'Legal issue matrix',
    'legal',
    'Issue-spot deal structure, approvals, transfer, regulatory, data room, diligence, and professional handoff triggers.',
    'legal_structure',
    'run_analysis',
    'sell-deal-structure-analysis',
    '["METHODOLOGY_V18b Legal Amendment"]'::jsonb,
    '["deal_structure", "jurisdiction", "industry", "documents"]'::jsonb,
    '["analysis_only", "defer_to_counsel", "no_legal_opinion"]'::jsonb,
    100
  ),
  (
    'deal_comparison',
    'Deal comparison',
    'comparison',
    'Compare multiple deals side by side with financials, fit, risk, stage, and next action.',
    'comparison',
    'compare_deals',
    NULL,
    '["METHODOLOGY_V17 §5 Math Engine", "METHODOLOGY_V17 §11 Interactive Canvas"]'::jsonb,
    '["deal_facts", "financials", "market_read"]'::jsonb,
    '["analysis_only"]'::jsonb,
    110
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  model_family = EXCLUDED.model_family,
  default_tool_name = EXCLUDED.default_tool_name,
  default_menu_item_slug = EXCLUDED.default_menu_item_slug,
  methodology_refs = EXCLUDED.methodology_refs,
  evidence_requirements = EXCLUDED.evidence_requirements,
  guardrail_tags = EXCLUDED.guardrail_tags,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
