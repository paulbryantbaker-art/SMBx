/**
 * Model Router — Maps deliverable types to the appropriate Claude model.
 *
 * Tier-based routing:
 *   - VP tier (high-value, complex documents): claude-opus-4-6
 *   - Associate tier (substantial analysis): claude-sonnet-4-6
 *   - Analyst tier (quick reports, scorecards): claude-haiku-4-5-20251001 or deterministic
 *   - Deterministic generators bypass Claude entirely
 */

export type ModelId =
  | 'claude-opus-4-6'
  | 'claude-sonnet-4-6'
  | 'claude-haiku-4-5-20251001'
  | 'deterministic';

// ─── Deterministic generators (no AI call needed) ───────────────
const DETERMINISTIC_TYPES = new Set([
  'sba_bankability_report', 'buy_sba_bankability',
  'capital_structure_analysis', 'buy_capital_structure',
  'financial_model', 'sell_financial_model',
  'blind_teaser', 'sell_blind_teaser',
  'dd_package', 'buy_dd_checklist', 'sell_dd_checklist',
  'working_capital_analysis', 'sell_working_capital_analysis', 'buy_working_capital_model',
  'lbo_model',
  'sell_data_room_structure', 'raise_data_room_structure',
]);

// ─── Opus tier (VP-level, high-value, long-form documents) ──────
const OPUS_TYPES = new Set([
  'cim', 'sell_cim_draft', 'sell_cim',
  'sell_funds_flow', 'buy_funds_flow', 'funds_flow_statement',
  'sell_deal_structure_analysis',
  'buy_post_close_cash_flow',
  'pmi_strategic_roadmap',
  'raise_financial_model',
]);

// ─── Haiku tier (lightweight, analyst-level, fast) ──────────────
const HAIKU_TYPES = new Set([
  // Free deliverables
  'sell_business_profile', 'sell_league_card', 'sell_journey_roadmap',
  'sell_financial_spread', 'sell_add_back_schedule', 'sell_earnings_summary',
  'buy_investment_thesis', 'buy_capital_stack_template', 'buy_target_criteria',
  'buy_readiness_scorecard', 'buy_sourcing_strategy',
  'raise_readiness_assessment', 'raise_pre_post_model',
  'raise_financial_projections', 'raise_cap_table', 'raise_unit_economics', 'raise_use_of_funds',
  'pmi_day_zero_checklist', 'pmi_100_day_plan', 'pmi_seller_training_schedule',
  // Cheap analyst items
  'sell_probability_of_sale', 'sell_price_gap_analysis',
  'sell_market_snapshot', 'sell_seven_factor_analysis',
  'buy_deal_scorecard',
  'pmi_metrics_dashboard', 'pmi_quick_wins',
  'raise_outreach_messaging', 'raise_form_d_guide',
  'raise_investor_update_template', 'pmi_monthly_review',
  'universal_sba_analysis',
]);

/**
 * Returns the appropriate model for a given deliverable type.
 * Falls back to Sonnet for anything not explicitly categorized.
 */
export function getModelForDeliverable(deliverableType: string): ModelId {
  if (DETERMINISTIC_TYPES.has(deliverableType)) return 'deterministic';
  if (OPUS_TYPES.has(deliverableType)) return 'claude-opus-4-6';
  if (HAIKU_TYPES.has(deliverableType)) return 'claude-haiku-4-5-20251001';
  return 'claude-sonnet-4-6'; // default for Associate-tier
}

/**
 * Returns max_tokens appropriate for the model tier.
 */
export function getMaxTokens(model: ModelId): number {
  switch (model) {
    case 'claude-opus-4-6': return 8192;
    case 'claude-sonnet-4-6': return 4096;
    case 'claude-haiku-4-5-20251001': return 4096;
    case 'deterministic': return 0;
  }
}
