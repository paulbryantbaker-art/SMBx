/**
 * Deliverable Processor — Shared generation logic for deliverables.
 *
 * Called by both the pg-boss worker (server/worker.ts) and inline
 * via setImmediate() when the worker isn't running.
 *
 * Includes an idempotency guard so the same deliverable is never
 * processed twice, even if both paths race.
 */
import { sql } from '../db.js';
import { callClaude, callClaudeWithModel } from './aiService.js';
import { getModelForDeliverable, getMaxTokens } from './modelRouter.js';
import { sendDeliverableReadyEmail } from './emailService.js';
import { generateValuationReport } from './generators/valuationReport.js';
import { generateSBAReport } from './generators/sbaBankability.js';
import { generateCapitalStructureAnalysis } from './generators/capitalStructure.js';
import { generateCIM } from './generators/cimGenerator.js';
import { generateLOI } from './generators/loiGenerator.js';
import { generateFinancialModel } from './generators/financialModel.js';
import { generateBlindTeaser } from './generators/blindTeaser.js';
import { generateDDPackage } from './generators/ddPackage.js';
import { generateWorkingCapitalAnalysis } from './generators/workingCapital.js';
import { generateDealScreeningMemo } from './generators/dealScreeningMemo.js';
import { generateIntelligenceReport } from './generators/intelligenceReport.js';
import { generateFundsFlowStatement } from './generators/fundsFlowStatement.js';
import { generateClosingChecklist } from './generators/closingChecklist.js';
import { generateTaxImpactAnalysis } from './generators/taxImpactAnalysis.js';
import { generatePitchDeck } from './generators/pitchDeckGenerator.js';
import { generateIntegrationPlan } from './generators/integrationPlanGenerator.js';
import { generateExecutiveSummary } from './generators/executiveSummary.js';
import { generateDealScoring } from './generators/dealScoring.js';
import { generateOutreachStrategy } from './generators/outreachStrategy.js';
import { generateBuyerList } from './generators/buyerList.js';
import { generateLBOModel } from './generators/lboModel.js';
import { generateValueCreationPlan } from './generators/valueCreationPlan.js';
import { generateDataRoomStructure } from './generators/dataRoomStructure.js';

export interface DeliverableJobData {
  deliverableId: number;
  dealId: number;
  userId: number;
  menuItemSlug: string;
  deliverableType: string;
}

/**
 * Normalizes a slug-derived deliverable type to a known generator case.
 * Handles the mismatch between menu_items.slug (kebab → underscore)
 * and the switch cases in processDeliverable.
 *
 * Returns the normalized type, or the original if no mapping exists
 * (will hit generic category generator or Claude fallback).
 */
function normalizeDeliverableType(raw: string): string {
  // Direct match aliases — slugs that need remapping to existing generator cases
  const ALIASES: Record<string, string> = {
    // Universal items → existing generators
    universal_market_intelligence: 'intelligence_report',
    universal_sba_analysis: 'sba_bankability_report',
    universal_cap_stack_model: 'capital_structure_analysis',
    universal_comp_analysis: 'intelligence_report', // uses comp analysis section
    universal_industry_report: 'intelligence_report',
    // Raise items → existing generators
    raise_blind_teaser: 'blind_teaser',
    raise_financial_model: 'financial_model',
    // Buy items → existing generators
    buy_sources_uses: 'buy_capital_structure', // financing model with sources/uses
    buy_day_one_checklist: 'pmi_integration_plan', // day-one is integration subset
    // Sell items
    sell_financial_summary_package: 'sell_financial_spread', // category generator
  };
  return ALIASES[raw] || raw;
}

// ─── Category slug sets for category generators ─────────────────
// Types NOT handled by a dedicated generator go through category generators.
// These are grouped by the kind of output they produce.

const CATEGORY_PROFILE: Set<string> = new Set([
  'sell_business_profile', 'sell_league_card', 'sell_journey_roadmap',
  'buy_investment_thesis', 'buy_capital_stack_template', 'buy_target_criteria',
  'buy_readiness_scorecard', 'buy_sourcing_strategy',
  'raise_readiness_assessment', 'raise_pre_post_model',
]);

const CATEGORY_FINANCIAL_SPREAD: Set<string> = new Set([
  'sell_financial_spread', 'sell_add_back_schedule', 'sell_earnings_summary',
  'sell_financial_summary_package',
  'raise_financial_projections', 'raise_unit_economics', 'raise_use_of_funds',
  'pmi_financial_deep_dive',
]);

const CATEGORY_ANALYSIS: Set<string> = new Set([
  'sell_seven_factor_analysis', 'sell_market_snapshot',
  'sell_price_gap_analysis', 'sell_probability_of_sale',
  'sell_deal_structure_analysis',
  'buy_dd_summary', 'buy_red_flag_report',
  'buy_earnout_analysis', 'buy_post_close_cash_flow',
  'pmi_swot', 'pmi_ops_assessment', 'pmi_people_assessment',
  'pmi_quick_wins',
]);

const CATEGORY_CHECKLIST: Set<string> = new Set([
  'pmi_day_zero_checklist', 'pmi_seller_training_schedule',
  'sell_buyer_brief', 'sell_loi_comparison',
  'buy_day_one_checklist',
  'raise_closing_coordination',
]);

const CATEGORY_COMMS_TEMPLATE: Set<string> = new Set([
  'buy_employee_comms', 'buy_transition_plan',
  'pmi_employee_comms', 'pmi_customer_outreach', 'pmi_vendor_intro',
  'pmi_metrics_dashboard', 'pmi_monthly_review',
  'raise_outreach_messaging', 'raise_meeting_prep',
  'raise_investor_update_template',
]);

const CATEGORY_PMI_PLAN: Set<string> = new Set([
  'pmi_100_day_plan', 'pmi_execution_plan',
  'pmi_strategic_roadmap', 'pmi_kpi_dashboard',
]);

const CATEGORY_CAP_TABLE: Set<string> = new Set([
  'raise_cap_table', 'raise_cap_table_final',
  'raise_dilution_model',
]);

const CATEGORY_TERM_SHEET: Set<string> = new Set([
  'raise_term_sheet_analysis', 'raise_term_sheet_comparison',
  'raise_counter_proposal',
]);

const CATEGORY_RAISE_DOCS: Set<string> = new Set([
  'raise_investor_list',
  'raise_form_d_guide',
]);

function getCategoryForType(deliverableType: string): string | null {
  if (CATEGORY_PROFILE.has(deliverableType)) return 'profile';
  if (CATEGORY_FINANCIAL_SPREAD.has(deliverableType)) return 'financial_spread';
  if (CATEGORY_ANALYSIS.has(deliverableType)) return 'analysis';
  if (CATEGORY_CHECKLIST.has(deliverableType)) return 'checklist';
  if (CATEGORY_COMMS_TEMPLATE.has(deliverableType)) return 'comms_template';
  if (CATEGORY_PMI_PLAN.has(deliverableType)) return 'pmi_plan';
  if (CATEGORY_CAP_TABLE.has(deliverableType)) return 'cap_table';
  if (CATEGORY_TERM_SHEET.has(deliverableType)) return 'term_sheet';
  if (CATEGORY_RAISE_DOCS.has(deliverableType)) return 'raise_docs';
  return null;
}

/**
 * Process a deliverable: claim it atomically, generate content, save result.
 * Safe to call from multiple paths — only one will actually process.
 */
export async function processDeliverable(data: DeliverableJobData): Promise<void> {
  const { deliverableId, dealId, menuItemSlug, deliverableType } = data;

  // ─── Idempotency guard: atomically claim the deliverable ───
  const [claimed] = await sql`
    UPDATE deliverables
    SET status = 'generating'
    WHERE id = ${deliverableId} AND status = 'queued'
    RETURNING id
  `;
  if (!claimed) {
    // Already claimed by another process — skip
    return;
  }

  console.log(`[deliverableProcessor] Generating ${deliverableId}: ${menuItemSlug}`);
  const startTime = Date.now();

  try {
    // Get deal context
    const [deal] = await sql`SELECT * FROM deals WHERE id = ${dealId}`;
    if (!deal) throw new Error(`Deal ${dealId} not found`);

    // Get menu item for generation instructions
    const [menuItem] = await sql`SELECT * FROM menu_items WHERE slug = ${menuItemSlug}`;

    const financials = deal.financials || {};
    let result: Record<string, any>;
    let model = 'deterministic';

    // Normalize slug-derived type to a known generator case
    const normalizedType = normalizeDeliverableType(deliverableType);

    // Dispatch to specialized generator or fall back to generic Claude
    switch (normalizedType) {
      case 'valuation_report':
      case 'sell_valuation_report':
      case 'buy_valuation_model':
        result = await generateValuationReport({
          business_name: deal.business_name, industry: deal.industry, location: deal.location,
          revenue: deal.revenue || 0, sde: deal.sde, ebitda: deal.ebitda, league: deal.league || 'L1',
          owner_salary: financials.owner_salary, growth_rate: financials.growth_rate,
          recurring_revenue_pct: financials.recurring_revenue_pct,
          customer_concentration: financials.customer_concentration,
          owner_dependency: financials.owner_dependency,
          asking_price: deal.asking_price, seven_factor_scores: financials.seven_factor_scores,
          financials,
        });
        model = 'claude-sonnet + deterministic';
        break;

      case 'sba_bankability_report':
      case 'buy_sba_bankability':
        result = generateSBAReport({
          deal_size: deal.asking_price || deal.revenue || 0,
          ebitda: deal.ebitda, sde: deal.sde,
          buyer_credit_score: financials.buyer_credit_score,
          buyer_liquid_assets: financials.buyer_liquid_assets,
          buyer_retirement_funds: financials.buyer_retirement_funds,
          buyer_home_equity: financials.buyer_home_equity,
          buyer_citizenship: financials.buyer_citizenship,
          seller_financing_available: financials.seller_financing_available,
          seller_standby_willing: financials.seller_standby_willing,
          has_real_estate: financials.has_real_estate,
          industry: deal.industry, business_name: deal.business_name,
        });
        break;

      case 'capital_structure_analysis':
      case 'buy_capital_structure':
        result = generateCapitalStructureAnalysis({
          deal_size: deal.asking_price || deal.revenue || 0,
          ebitda: deal.ebitda, sde: deal.sde,
          buyer_equity: financials.buyer_equity,
          buyer_credit_score: financials.buyer_credit_score,
          is_us_citizen: financials.buyer_citizenship !== 'other',
          has_real_estate: financials.has_real_estate,
          seller_financing: financials.seller_financing_available,
          seller_standby: financials.seller_standby_willing,
          industry: deal.industry, league: deal.league,
          business_name: deal.business_name,
        });
        break;

      case 'cim':
      case 'sell_cim_draft':
        result = await generateCIM({
          business_name: deal.business_name || 'Business',
          industry: deal.industry || '', location: deal.location || '',
          league: deal.league || 'L1',
          revenue: deal.revenue || 0, sde: deal.sde, ebitda: deal.ebitda,
          owner_salary: financials.owner_salary,
          employee_count: financials.employee_count,
          years_in_business: financials.years_in_business,
          growth_rate: financials.growth_rate,
          products_services: financials.products_services,
          customer_profile: financials.customer_profile,
          competitive_advantages: financials.competitive_advantages,
          growth_opportunities: financials.growth_opportunities,
          reason_for_selling: financials.reason_for_selling,
          facilities: financials.facilities,
          technology: financials.technology,
          key_employees: financials.key_employees,
          asking_price: deal.asking_price,
          financials, seven_factor_scores: financials.seven_factor_scores,
        });
        model = 'claude-opus-4-6';
        break;

      case 'loi':
      case 'buy_loi_draft':
        result = await generateLOI({
          buyer_name: financials.buyer_name || 'Buyer',
          seller_name: financials.seller_name || deal.business_name || 'Seller',
          business_name: deal.business_name || 'Business',
          purchase_price: deal.asking_price || 0,
          deal_structure: financials.deal_structure || 'asset',
          earnout_pct: financials.earnout_pct,
          earnout_period_months: financials.earnout_period_months,
          seller_note_pct: financials.seller_note_pct,
          seller_note_terms: financials.seller_note_terms,
          equity_injection: financials.buyer_equity,
          sba_loan: financials.sba_eligible,
          transition_period_months: financials.transition_months,
          non_compete_years: financials.non_compete_years,
          due_diligence_days: financials.dd_days,
          closing_deadline_days: financials.closing_days,
          exclusivity_days: financials.exclusivity_days,
          league: deal.league, industry: deal.industry,
        });
        model = 'claude-sonnet';
        break;

      case 'financial_model':
      case 'sell_financial_model':
        result = generateFinancialModel({
          business_name: deal.business_name,
          revenue: deal.revenue || 0,
          cogs: financials.cogs, operating_expenses: financials.operating_expenses,
          sde: deal.sde, ebitda: deal.ebitda,
          owner_salary: financials.owner_salary,
          growth_rate: financials.growth_rate,
          gross_margin: financials.gross_margin,
          capex_annual: financials.capex_annual,
          debt_service_annual: financials.debt_service_annual,
          tax_rate: financials.tax_rate,
          league: deal.league,
        });
        break;

      case 'blind_teaser':
      case 'sell_blind_teaser':
        result = generateBlindTeaser({
          industry: deal.industry || 'Business Services',
          region: deal.location || 'United States',
          revenue: deal.revenue || 0,
          sde: deal.sde, ebitda: deal.ebitda,
          growth_rate: financials.growth_rate,
          years_in_business: financials.years_in_business,
          employee_count: financials.employee_count,
          recurring_revenue_pct: financials.recurring_revenue_pct,
          gross_margin: financials.gross_margin,
          asking_price: deal.asking_price,
          league: deal.league || 'L1',
          highlights: financials.highlights,
        });
        break;

      case 'dd_package':
      case 'buy_dd_checklist':
        result = generateDDPackage({
          business_name: deal.business_name,
          industry: deal.industry,
          league: deal.league || 'L1',
          deal_structure: financials.deal_structure || 'asset',
          has_real_estate: financials.has_real_estate,
          has_ip: financials.has_ip,
          has_employees: (financials.employee_count || 0) > 0,
          has_inventory: (financials.inventory || 0) > 0,
          is_franchise: financials.is_franchise,
          is_regulated: financials.is_regulated,
          deal_size: deal.asking_price,
          buyer_type: financials.buyer_type,
        });
        break;

      case 'working_capital_analysis':
        result = generateWorkingCapitalAnalysis({
          business_name: deal.business_name,
          revenue: deal.revenue || 0,
          current_assets: {
            cash: financials.cash, accounts_receivable: financials.accounts_receivable,
            inventory: financials.inventory, prepaid_expenses: financials.prepaid_expenses,
          },
          current_liabilities: {
            accounts_payable: financials.accounts_payable, accrued_expenses: financials.accrued_expenses,
            deferred_revenue: financials.deferred_revenue, current_debt: financials.current_debt,
          },
          historical_nwc: financials.historical_nwc,
          industry: deal.industry, league: deal.league,
        });
        break;

      case 'intelligence_report':
        result = await generateIntelligenceReport({
          naicsCode: financials.naics_code || deal.naics_code || '',
          stateCode: financials.state_code || '',
          countyCode: financials.county_code,
          purchasePrice: deal.asking_price,
          ebitda: deal.ebitda,
          sde: deal.sde,
          revenue: deal.revenue,
          industry: deal.industry,
          businessName: deal.business_name,
          league: deal.league,
        });
        model = 'claude-sonnet + government-data';
        break;

      case 'buy_deal_screening_memo':
        result = await generateDealScreeningMemo({
          business_name: deal.business_name,
          industry: deal.industry,
          location: deal.location,
          revenue: deal.revenue || 0,
          sde: deal.sde,
          ebitda: deal.ebitda,
          league: deal.league || 'L1',
          asking_price: deal.asking_price,
          owner_salary: financials.owner_salary,
          growth_rate: financials.growth_rate,
          gross_margin: financials.gross_margin,
          employee_count: financials.employee_count,
          years_in_business: financials.years_in_business,
          recurring_revenue_pct: financials.recurring_revenue_pct,
          customer_concentration: financials.customer_concentration,
          owner_dependency: financials.owner_dependency,
          financials,
        });
        model = 'claude-sonnet + deterministic';
        break;

      case 'funds_flow_statement':
      case 'sell_funds_flow': {
        const markdown = await generateFundsFlowStatement({
          business_name: deal.business_name,
          industry: deal.industry,
          purchase_price: deal.asking_price,
          sde: deal.sde, ebitda: deal.ebitda,
          league: deal.league || 'L1',
          financing_structure: financials.financing_structure,
          seller_note_percent: financials.seller_note_pct,
          sba_loan: financials.sba_eligible,
          earnout_percent: financials.earnout_pct,
          working_capital_target: financials.working_capital_target,
          transaction_fee_percent: financials.transaction_fee_pct,
          escrow_percent: financials.escrow_pct,
          broker_commission_percent: financials.broker_commission_pct,
        });
        result = { markdown };
        model = 'claude-sonnet';
        break;
      }

      case 'closing_checklist':
      case 'sell_closing_checklist':
      case 'buy_closing_checklist': {
        const markdown = await generateClosingChecklist({
          business_name: deal.business_name,
          industry: deal.industry,
          journey_type: deal.journey_type || 'sell',
          league: deal.league || 'L1',
          deal_structure: financials.deal_structure,
          has_real_estate: financials.has_real_estate,
          has_employees: (financials.employee_count || 0) > 0,
          employee_count: financials.employee_count,
          sba_loan: financials.sba_eligible,
          has_franchise: financials.is_franchise,
          has_ip: financials.has_ip,
          state: financials.state_code,
        });
        result = { markdown };
        model = 'claude-sonnet';
        break;
      }

      case 'pitch_deck':
      case 'raise_pitch_deck': {
        result = await generatePitchDeck({
          business_name: deal.business_name,
          industry: deal.industry,
          location: deal.location,
          revenue: deal.revenue,
          ebitda: deal.ebitda,
          sde: deal.sde,
          growth_rate: financials.growth_rate,
          employee_count: financials.employee_count,
          years_in_business: financials.years_in_business,
          league: deal.league || 'L1',
          raise_amount: financials.raise_amount,
          raise_purpose: financials.raise_purpose,
          valuation: financials.valuation,
          equity_offered: financials.equity_offered,
          use_of_funds: financials.use_of_funds,
          competitive_advantages: financials.competitive_advantages,
          customer_profile: financials.customer_profile,
          tam_sam_som: financials.tam_sam_som,
          team_highlights: financials.team_highlights,
          financials,
        });
        model = 'claude-sonnet';
        break;
      }

      case 'integration_plan':
      case 'pmi_integration_plan': {
        const markdown = await generateIntegrationPlan({
          business_name: deal.business_name,
          industry: deal.industry,
          employee_count: financials.employee_count,
          revenue: deal.revenue,
          deal_structure: financials.deal_structure,
          seller_transition_months: financials.transition_months,
          league: deal.league || 'L1',
          has_key_employees: financials.has_key_employees,
          has_real_estate: financials.has_real_estate,
          customer_concentration: financials.customer_concentration,
          is_franchise: financials.is_franchise,
          buyer_type: financials.buyer_type,
          financials,
        });
        result = { markdown };
        model = 'claude-sonnet';
        break;
      }

      case 'tax_impact_analysis':
      case 'sell_tax_impact': {
        const markdown = await generateTaxImpactAnalysis({
          business_name: deal.business_name,
          industry: deal.industry,
          journey_type: deal.journey_type || 'sell',
          league: deal.league || 'L1',
          purchase_price: deal.asking_price,
          entity_type: financials.entity_type,
          deal_structure: financials.deal_structure,
          seller_note_percent: financials.seller_note_pct,
          years_held: financials.years_in_business,
          state: financials.state_code,
          has_real_estate: financials.has_real_estate,
          goodwill_estimate: financials.goodwill_estimate,
          tangible_assets: financials.tangible_assets,
        });
        result = { markdown };
        model = 'claude-sonnet';
        break;
      }

      // ─── Executive Summary ──────────────────────────────────
      case 'sell_executive_summary':
      case 'raise_executive_summary': {
        const markdown = await generateExecutiveSummary({
          business_name: deal.business_name, industry: deal.industry, location: deal.location,
          league: deal.league || 'L1', revenue: deal.revenue || 0,
          sde: deal.sde, ebitda: deal.ebitda, asking_price: deal.asking_price,
          owner_salary: financials.owner_salary, growth_rate: financials.growth_rate,
          years_in_business: financials.years_in_business, employee_count: financials.employee_count,
          recurring_revenue_pct: financials.recurring_revenue_pct, gross_margin: financials.gross_margin,
          competitive_advantages: financials.competitive_advantages,
          growth_opportunities: financials.growth_opportunities,
          reason_for_selling: financials.reason_for_selling,
          products_services: financials.products_services,
          customer_profile: financials.customer_profile, financials,
        });
        result = { markdown };
        model = 'claude-sonnet';
        break;
      }

      // ─── Deal Scoring ───────────────────────────────────────
      case 'buy_deal_scorecard': {
        result = await generateDealScoring({
          business_name: deal.business_name, industry: deal.industry, location: deal.location,
          league: deal.league || 'L1', revenue: deal.revenue || 0,
          sde: deal.sde, ebitda: deal.ebitda, asking_price: deal.asking_price,
          growth_rate: financials.growth_rate, gross_margin: financials.gross_margin,
          recurring_revenue_pct: financials.recurring_revenue_pct,
          customer_concentration: financials.customer_concentration,
          owner_dependency: financials.owner_dependency,
          years_in_business: financials.years_in_business,
          employee_count: financials.employee_count, financials,
        });
        model = 'claude-sonnet + deterministic';
        break;
      }

      // ─── Outreach Strategy ──────────────────────────────────
      case 'sell_outreach_strategy': {
        const markdown = await generateOutreachStrategy({
          business_name: deal.business_name, industry: deal.industry, location: deal.location,
          league: deal.league || 'L1', revenue: deal.revenue || 0,
          sde: deal.sde, ebitda: deal.ebitda, asking_price: deal.asking_price,
          growth_rate: financials.growth_rate, employee_count: financials.employee_count,
          competitive_advantages: financials.competitive_advantages,
          buyer_types: financials.buyer_types, financials,
        });
        result = { markdown };
        model = 'claude-sonnet';
        break;
      }

      // ─── Buyer List ─────────────────────────────────────────
      case 'sell_buyer_list': {
        const markdown = await generateBuyerList({
          business_name: deal.business_name, industry: deal.industry, location: deal.location,
          league: deal.league || 'L1', revenue: deal.revenue || 0,
          sde: deal.sde, ebitda: deal.ebitda, asking_price: deal.asking_price,
          employee_count: financials.employee_count, growth_rate: financials.growth_rate,
          recurring_revenue_pct: financials.recurring_revenue_pct,
          competitive_advantages: financials.competitive_advantages,
          products_services: financials.products_services, financials,
        });
        result = { markdown };
        model = 'claude-sonnet';
        break;
      }

      // ─── LBO Model ─────────────────────────────────────────
      case 'lbo_model': {
        result = generateLBOModel({
          business_name: deal.business_name, industry: deal.industry,
          league: deal.league || 'L1', revenue: deal.revenue || 0,
          ebitda: deal.ebitda, sde: deal.sde,
          purchase_price: deal.asking_price,
          growth_rate: financials.growth_rate,
          margin_improvement: financials.margin_improvement,
          capex_pct: financials.capex_pct,
          tax_rate: financials.tax_rate,
          exit_multiple: financials.exit_multiple,
          hold_period: financials.hold_period,
          senior_debt_multiple: financials.senior_debt_multiple,
          senior_debt_rate: financials.senior_debt_rate,
          mezzanine_pct: financials.mezzanine_pct,
          mezzanine_rate: financials.mezzanine_rate,
          equity_pct: financials.equity_pct, financials,
        });
        break;
      }

      // ─── Value Creation Plan ────────────────────────────────
      case 'pmi_value_creation': {
        const markdown = await generateValueCreationPlan({
          business_name: deal.business_name, industry: deal.industry,
          league: deal.league || 'L1', revenue: deal.revenue || 0,
          ebitda: deal.ebitda, sde: deal.sde,
          purchase_price: deal.asking_price,
          growth_rate: financials.growth_rate, gross_margin: financials.gross_margin,
          employee_count: financials.employee_count,
          years_in_business: financials.years_in_business,
          customer_concentration: financials.customer_concentration,
          recurring_revenue_pct: financials.recurring_revenue_pct,
          competitive_advantages: financials.competitive_advantages,
          deal_structure: financials.deal_structure,
          buyer_type: financials.buyer_type, financials,
        });
        result = { markdown };
        model = 'claude-sonnet';
        break;
      }

      // ─── Data Room Structure ────────────────────────────────
      case 'sell_data_room_structure':
      case 'raise_data_room_structure': {
        result = generateDataRoomStructure({
          business_name: deal.business_name, industry: deal.industry,
          journey_type: deliverableType.startsWith('raise') ? 'raise' : 'sell',
          league: deal.league || 'L1',
          has_real_estate: financials.has_real_estate,
          has_employees: (financials.employee_count || 0) > 0,
          employee_count: financials.employee_count,
          has_ip: financials.has_ip,
          is_franchise: financials.is_franchise,
          has_inventory: (financials.inventory || 0) > 0,
          entity_type: financials.entity_type, financials,
        });
        break;
      }

      // ─── Aliases for existing generators (slug-based routing) ─
      case 'sell_cim':
        // Route sell-cim slug to existing CIM generator
        result = await generateCIM({
          business_name: deal.business_name || 'Business',
          industry: deal.industry || '', location: deal.location || '',
          league: deal.league || 'L1',
          revenue: deal.revenue || 0, sde: deal.sde, ebitda: deal.ebitda,
          owner_salary: financials.owner_salary,
          employee_count: financials.employee_count,
          years_in_business: financials.years_in_business,
          growth_rate: financials.growth_rate,
          products_services: financials.products_services,
          customer_profile: financials.customer_profile,
          competitive_advantages: financials.competitive_advantages,
          growth_opportunities: financials.growth_opportunities,
          reason_for_selling: financials.reason_for_selling,
          facilities: financials.facilities,
          technology: financials.technology,
          key_employees: financials.key_employees,
          asking_price: deal.asking_price,
          financials, seven_factor_scores: financials.seven_factor_scores,
        });
        model = 'claude-opus-4-6';
        break;

      case 'sell_dd_checklist':
        result = generateDDPackage({
          business_name: deal.business_name, industry: deal.industry,
          league: deal.league || 'L1', deal_structure: financials.deal_structure || 'asset',
          has_real_estate: financials.has_real_estate, has_ip: financials.has_ip,
          has_employees: (financials.employee_count || 0) > 0,
          has_inventory: (financials.inventory || 0) > 0,
          is_franchise: financials.is_franchise, is_regulated: financials.is_regulated,
          deal_size: deal.asking_price, buyer_type: financials.buyer_type,
        });
        break;

      case 'sell_working_capital_analysis':
      case 'buy_working_capital_model':
        result = generateWorkingCapitalAnalysis({
          business_name: deal.business_name, revenue: deal.revenue || 0,
          current_assets: {
            cash: financials.cash, accounts_receivable: financials.accounts_receivable,
            inventory: financials.inventory, prepaid_expenses: financials.prepaid_expenses,
          },
          current_liabilities: {
            accounts_payable: financials.accounts_payable, accrued_expenses: financials.accrued_expenses,
            deferred_revenue: financials.deferred_revenue, current_debt: financials.current_debt,
          },
          historical_nwc: financials.historical_nwc,
          industry: deal.industry, league: deal.league,
        });
        break;

      case 'buy_funds_flow':
        // Route to existing funds flow generator
        result = { markdown: await generateFundsFlowStatement({
          business_name: deal.business_name, industry: deal.industry,
          purchase_price: deal.asking_price, sde: deal.sde, ebitda: deal.ebitda,
          league: deal.league || 'L1', financing_structure: financials.financing_structure,
          seller_note_percent: financials.seller_note_pct, sba_loan: financials.sba_eligible,
          earnout_percent: financials.earnout_pct,
          working_capital_target: financials.working_capital_target,
          transaction_fee_percent: financials.transaction_fee_pct,
          escrow_percent: financials.escrow_pct,
          broker_commission_percent: financials.broker_commission_pct,
        })};
        model = 'claude-sonnet';
        break;

      default: {
        // ─── Category generators: route by category before generic fallback ───
        const category = getCategoryForType(normalizedType);
        const routedModel = getModelForDeliverable(normalizedType);
        const modelId = routedModel === 'deterministic' ? 'claude-sonnet-4-6' : routedModel;
        const maxTokens = getMaxTokens(routedModel) || 4096;

        if (category) {
          // Category-aware generation with structured prompt
          const categoryPrompt = buildCategoryPrompt(category, deal, menuItem, normalizedType);
          const content = await callClaudeWithModel(modelId, categoryPrompt, [
            { role: 'user', content: `Generate the "${menuItem?.name || normalizedType}" deliverable. Use all available deal data. Output professional markdown with clear sections.` },
          ], maxTokens);
          result = { markdown: content, category, format: 'markdown' };
          model = modelId;
        } else {
          // Generic Claude fallback for truly unknown types
          const systemPrompt = buildGenerationPrompt(deal, menuItem, normalizedType);
          const content = await callClaudeWithModel(modelId, systemPrompt, [
            { role: 'user', content: `Generate the ${normalizedType} deliverable. Use all available deal data. Output as structured JSON.` },
          ], maxTokens);
          try {
            const cleaned = content.replace(/```json\n?|\n?```/g, '').trim();
            result = JSON.parse(cleaned);
          } catch {
            result = { markdown: content, format: 'markdown' };
          }
          model = modelId;
        }
        break;
      }
    }

    const generationTime = Date.now() - startTime;

    await sql`
      UPDATE deliverables
      SET status = 'complete',
          content = ${JSON.stringify(result)}::jsonb,
          generation_model = ${model},
          generation_time_ms = ${generationTime},
          completed_at = NOW()
      WHERE id = ${deliverableId}
    `;

    console.log(`[deliverableProcessor] Deliverable ${deliverableId} complete (${generationTime}ms)`);

    // Auto-file into data room folder
    try {
      await autoFileDeliverable(deliverableId, dealId, data.userId, deal.journey_type, deal.current_gate, normalizedType);
    } catch (err: any) {
      console.error(`[deliverableProcessor] Auto-file failed for ${deliverableId}:`, err.message);
    }

    // Notify user via email (fire-and-forget)
    if (data.userId) {
      sendDeliverableReadyEmail(data.userId, menuItem?.name || normalizedType, deal.business_name).catch(() => {});
    }
  } catch (err: any) {
    console.error(`[deliverableProcessor] Deliverable ${deliverableId} failed:`, err.message);
    await sql`
      UPDATE deliverables
      SET status = 'failed',
          content = ${JSON.stringify({ error: err.message })}::jsonb
      WHERE id = ${deliverableId}
    `;
    throw err;
  }
}

// ─── Auto-filing: map deliverable types → folder name preferences ───

const AUTO_FILE_MAP: Record<string, string[]> = {
  // Financials
  value_readiness_report: ['Financials'],
  sde_analysis: ['Financials'],
  sba_bankability_report: ['Financials', 'Thesis & Criteria'],
  financial_model: ['Financials', 'Thesis & Criteria'],
  sell_financial_model: ['Financials'],
  working_capital_analysis: ['Financials'],
  // Valuation
  valuation_report: ['Valuation', 'Target Analysis'],
  sell_valuation_report: ['Valuation'],
  buy_valuation_model: ['Target Analysis', 'Valuation'],
  // Marketing / Packaging
  cim: ['Marketing'],
  sell_cim_draft: ['Marketing'],
  blind_teaser: ['Marketing'],
  sell_blind_teaser: ['Marketing'],
  // Deal structure
  capital_structure_analysis: ['Deal Structure', 'Buyer Management'],
  loi: ['Deal Structure', 'Buyer Management'],
  buy_loi_draft: ['Deal Structure'],
  // Due diligence
  dd_package: ['Due Diligence'],
  buy_dd_checklist: ['Due Diligence'],
  // Research / thesis
  buy_deal_screening_memo: ['Target Analysis', 'Thesis & Criteria'],
  thesis_document: ['Thesis & Criteria'],
  intelligence_report: ['Financials', 'Thesis & Criteria'],
  // Raise / Investor
  pitch_deck: ['Investor Materials'],
  raise_pitch_deck: ['Investor Materials'],
  // PMI / Integration
  integration_plan: ['Integration Plan', 'Acquisition Docs'],
  pmi_integration_plan: ['Integration Plan', 'Acquisition Docs'],
  // Closing
  funds_flow_statement: ['Closing'],
  sell_funds_flow: ['Closing'],
  closing_checklist: ['Closing'],
  sell_closing_checklist: ['Closing'],
  buy_closing_checklist: ['Closing'],
  tax_impact_analysis: ['Closing', 'Financials'],
  sell_tax_impact: ['Closing', 'Financials'],
  // New generators
  sell_executive_summary: ['Marketing'],
  raise_executive_summary: ['Investor Materials'],
  buy_deal_scorecard: ['Target Analysis', 'Thesis & Criteria'],
  sell_outreach_strategy: ['Buyer Management', 'Marketing'],
  sell_buyer_list: ['Buyer Management'],
  lbo_model: ['Deal Structure', 'Target Analysis'],
  pmi_value_creation: ['Optimization', 'Assessment'],
  sell_data_room_structure: ['Marketing'],
  raise_data_room_structure: ['Investor Materials'],
  // Aliases for slug-based routing
  sell_cim: ['Marketing'],
  sell_dd_checklist: ['Due Diligence', 'Closing'],
  sell_working_capital_analysis: ['Closing', 'Financials'],
  buy_working_capital_model: ['Deal Structure'],
  buy_funds_flow: ['Closing'],
  buy_sba_bankability: ['Financials', 'Thesis & Criteria'],
  buy_capital_structure: ['Deal Structure', 'Buyer Management'],
  // ─── Category-generated deliverables ──────────────────────
  // Profiles (free)
  sell_business_profile: ['Financials'],
  sell_league_card: ['Financials'],
  sell_journey_roadmap: ['Financials'],
  buy_investment_thesis: ['Thesis & Criteria'],
  buy_capital_stack_template: ['Thesis & Criteria'],
  buy_target_criteria: ['Thesis & Criteria'],
  buy_readiness_scorecard: ['Thesis & Criteria'],
  buy_sourcing_strategy: ['Thesis & Criteria'],
  raise_readiness_assessment: ['Financials'],
  raise_pre_post_model: ['Financials'],
  // Financial spreads
  sell_financial_spread: ['Financials'],
  sell_add_back_schedule: ['Financials'],
  sell_earnings_summary: ['Financials'],
  sell_financial_summary_package: ['Financials', 'Marketing'],
  raise_financial_projections: ['Financials'],
  raise_unit_economics: ['Financials'],
  raise_use_of_funds: ['Financials'],
  pmi_financial_deep_dive: ['Assessment', 'Financials'],
  // Analysis
  sell_seven_factor_analysis: ['Valuation'],
  sell_market_snapshot: ['Valuation'],
  sell_price_gap_analysis: ['Valuation'],
  sell_probability_of_sale: ['Valuation'],
  sell_deal_structure_analysis: ['Closing'],
  buy_dd_summary: ['Due Diligence'],
  buy_red_flag_report: ['Due Diligence'],
  buy_earnout_analysis: ['Deal Structure'],
  buy_post_close_cash_flow: ['Deal Structure'],
  pmi_swot: ['Assessment'],
  pmi_ops_assessment: ['Assessment'],
  pmi_people_assessment: ['Assessment'],
  pmi_quick_wins: ['Assessment'],
  // Checklists
  pmi_day_zero_checklist: ['Integration Plan'],
  pmi_seller_training_schedule: ['Integration Plan'],
  sell_buyer_brief: ['Buyer Management'],
  sell_loi_comparison: ['Buyer Management'],
  buy_day_one_checklist: ['Closing'],
  raise_closing_coordination: ['Closing'],
  // Comms templates
  buy_employee_comms: ['Closing'],
  buy_transition_plan: ['Closing'],
  pmi_employee_comms: ['Integration Plan'],
  pmi_customer_outreach: ['Integration Plan'],
  pmi_vendor_intro: ['Integration Plan'],
  pmi_metrics_dashboard: ['Integration Plan'],
  pmi_monthly_review: ['Optimization'],
  raise_outreach_messaging: ['Outreach'],
  raise_meeting_prep: ['Outreach'],
  raise_investor_update_template: ['Closing'],
  // PMI plans
  pmi_100_day_plan: ['Integration Plan'],
  pmi_execution_plan: ['Optimization'],
  pmi_strategic_roadmap: ['Optimization'],
  pmi_kpi_dashboard: ['Optimization'],
  // Cap table & term sheets
  raise_cap_table: ['Financials'],
  raise_cap_table_final: ['Closing'],
  raise_dilution_model: ['Term Sheets'],
  raise_term_sheet_analysis: ['Term Sheets'],
  raise_term_sheet_comparison: ['Term Sheets'],
  raise_counter_proposal: ['Term Sheets'],
  // Raise docs
  raise_investor_list: ['Outreach'],
  raise_form_d_guide: ['Closing'],
  // Universal
  universal_market_intelligence: ['Financials'],
  universal_sba_analysis: ['Financials'],
  universal_cap_stack_model: ['Deal Structure'],
  universal_comp_analysis: ['Valuation'],
  universal_industry_report: ['Financials'],
};

const FOLDER_TEMPLATES: Record<string, { name: string; gate: string | null; sort: number }[]> = {
  sell: [
    { name: 'Financials', gate: null, sort: 0 },
    { name: 'Valuation', gate: 'S2', sort: 1 },
    { name: 'Marketing', gate: 'S3', sort: 2 },
    { name: 'Buyer Management', gate: 'S4', sort: 3 },
    { name: 'Closing', gate: 'S5', sort: 4 },
  ],
  buy: [
    { name: 'Thesis & Criteria', gate: null, sort: 0 },
    { name: 'Target Analysis', gate: 'B2', sort: 1 },
    { name: 'Due Diligence', gate: 'B3', sort: 2 },
    { name: 'Deal Structure', gate: 'B4', sort: 3 },
    { name: 'Closing', gate: 'B5', sort: 4 },
  ],
  raise: [
    { name: 'Financials', gate: null, sort: 0 },
    { name: 'Investor Materials', gate: 'R2', sort: 1 },
    { name: 'Outreach', gate: 'R3', sort: 2 },
    { name: 'Term Sheets', gate: 'R4', sort: 3 },
    { name: 'Closing', gate: 'R5', sort: 4 },
  ],
  pmi: [
    { name: 'Acquisition Docs', gate: null, sort: 0 },
    { name: 'Integration Plan', gate: 'PMI1', sort: 1 },
    { name: 'Assessment', gate: 'PMI2', sort: 2 },
    { name: 'Optimization', gate: 'PMI3', sort: 3 },
  ],
};

async function autoFileDeliverable(
  deliverableId: number, dealId: number, userId: number,
  journeyType: string, currentGate: string, deliverableType: string,
) {
  const folderPrefs = AUTO_FILE_MAP[deliverableType];
  if (!folderPrefs) return; // Unknown type — leave unfiled

  // Ensure folders exist for this deal
  const templates = FOLDER_TEMPLATES[journeyType] || FOLDER_TEMPLATES.sell;
  const gateIndex = parseInt(currentGate.replace(/[A-Z]+/g, ''), 10) || 0;

  for (const tmpl of templates) {
    if (tmpl.gate) {
      const folderGateIndex = parseInt(tmpl.gate.replace(/[A-Z]+/g, ''), 10) || 0;
      if (gateIndex < folderGateIndex) continue;
    }
    await sql`
      INSERT INTO data_room_folders (deal_id, name, gate, sort_order)
      VALUES (${dealId}, ${tmpl.name}, ${tmpl.gate}, ${tmpl.sort})
      ON CONFLICT (deal_id, name) DO NOTHING
    `.catch(() => {});
  }

  // Find the target folder by preference order
  const allFolders = await sql`
    SELECT id, name FROM data_room_folders WHERE deal_id = ${dealId}
  `;
  let targetFolderId: number | null = null;
  for (const pref of folderPrefs) {
    const match = (allFolders as any[]).find(f => f.name === pref);
    if (match) { targetFolderId = match.id; break; }
  }
  if (!targetFolderId) return; // No matching folder available yet

  // Get deliverable name from menu item
  const [menuItem] = await sql`
    SELECT m.name FROM menu_items m
    JOIN deliverables d ON d.menu_item_id = m.id
    WHERE d.id = ${deliverableId}
  `;
  const docName = menuItem?.name || 'Deliverable';

  // Insert data room document (skip if already filed)
  await sql`
    INSERT INTO data_room_documents (deal_id, folder_id, user_id, deliverable_id, name, file_type, status)
    VALUES (${dealId}, ${targetFolderId}, ${userId}, ${deliverableId}, ${docName}, 'deliverable', 'draft')
    ON CONFLICT DO NOTHING
  `.catch(() => {});

  console.log(`[deliverableProcessor] Auto-filed ${deliverableId} → folder ${targetFolderId}`);
}

// ─── Category-specific prompt templates ─────────────────────────

const CATEGORY_INSTRUCTIONS: Record<string, string> = {
  profile: `You are generating a business/deal profile document. Focus on:
- Clear summary of the business/deal/investor
- Key metrics and characteristics in a scannable format
- Classification and categorization details
- Actionable next steps or roadmap
Output as clean markdown with headers, bullet points, and key metric callouts.`,

  financial_spread: `You are generating a financial analysis document. Focus on:
- Present all financial data in clear tables with proper formatting
- Show year-over-year trends and growth rates
- Calculate key metrics (margins, ratios, growth rates)
- Normalize adjustments with clear documentation
- Include industry benchmarking where possible
Use markdown tables for data presentation. All dollar amounts should be formatted with commas and 2 decimal places. Never invent numbers — use only provided data.`,

  analysis: `You are generating a professional M&A analysis document. Focus on:
- Executive summary with key findings upfront
- Structured analysis with clear methodology
- Quantitative scoring where appropriate (use 1-10 scales or letter grades)
- Risk identification with severity ratings (Low/Medium/High/Critical)
- Specific, actionable recommendations
- Supporting data and rationale for each conclusion
Output as professional markdown with clear section hierarchy.`,

  checklist: `You are generating a professional checklist/coordination document. Focus on:
- Organized by workstream or category
- Each item has: description, responsible party, deadline/timing, status placeholder
- Priority ordering within each category
- Include notes/tips for critical items
- Adapt complexity to deal league
Format as markdown with checkbox syntax (- [ ]) for actionable items.`,

  comms_template: `You are generating communication templates for business transitions. Focus on:
- Professional, empathetic tone appropriate for the audience
- Multiple templates for different audiences (employees, customers, vendors, partners)
- Fill-in-the-blank sections marked with [BRACKETS]
- Talking points for verbal communications
- FAQ sections for anticipated questions
- Timing recommendations for each communication
Output as markdown with clear section headers and template formatting.`,

  pmi_plan: `You are generating a post-merger integration plan. Focus on:
- Phased timeline (Day 1, Week 1, 30-60-90 day milestones)
- Specific action items with owners and deadlines
- KPIs and success metrics for each phase
- Risk factors and mitigation strategies
- Resource requirements and budget estimates
- Dependencies between workstreams
Output as professional markdown with clear phasing and milestones.`,

  cap_table: `You are generating a capitalization table or equity model. Focus on:
- Pre-money and post-money ownership percentages
- All share classes with rights and preferences
- Dilution analysis across scenarios
- Option pool calculations
- Waterfall analysis for exit scenarios
Present data in clean markdown tables. All percentages to 2 decimal places. Show both share counts and percentages.`,

  term_sheet: `You are generating term sheet analysis or negotiation guidance. Focus on:
- Plain-language explanation of each term
- Market-standard benchmarks for comparison
- Red flags and unusual terms highlighted
- Negotiation leverage points and strategies
- Side-by-side comparison format if multiple terms
- Specific counter-proposal language where appropriate
Output as professional markdown with term-by-term analysis.`,

  raise_docs: `You are generating fundraising support documents. Focus on:
- Investor targeting criteria and match quality
- Outreach strategy and messaging
- Regulatory and compliance guidance
- Professional formatting suitable for external sharing
- Specific, actionable content (not generic advice)
Output as professional markdown.`,
};

function buildCategoryPrompt(category: string, deal: any, menuItem: any, deliverableType: string): string {
  const categoryInstructions = CATEGORY_INSTRUCTIONS[category] || CATEGORY_INSTRUCTIONS.analysis;

  const dealContext = [
    deal.business_name && `Business: ${deal.business_name}`,
    deal.industry && `Industry: ${deal.industry}`,
    deal.location && `Location: ${deal.location}`,
    deal.revenue && `Revenue: $${(deal.revenue / 100).toLocaleString()}`,
    deal.sde && `SDE: $${(deal.sde / 100).toLocaleString()}`,
    deal.ebitda && `EBITDA: $${(deal.ebitda / 100).toLocaleString()}`,
    deal.league && `League: ${deal.league}`,
    deal.journey_type && `Journey: ${deal.journey_type}`,
    deal.current_gate && `Gate: ${deal.current_gate}`,
    deal.asking_price && `Asking Price: $${(deal.asking_price / 100).toLocaleString()}`,
  ].filter(Boolean).join('\n');

  const financials = deal.financials ? JSON.stringify(deal.financials, null, 2) : 'None provided';

  return `You are Yulia, an expert M&A advisor at smbx.ai. You are generating a professional deliverable for a client.

## DELIVERABLE
Name: ${menuItem?.name || deliverableType}
Type: ${deliverableType}
Description: ${menuItem?.description || 'Professional M&A work product'}

## CATEGORY INSTRUCTIONS
${categoryInstructions}

## DEAL CONTEXT
${dealContext}

## EXTENDED FINANCIALS
${financials}

## RULES
- Use ONLY the data provided — never invent or hallucinate numbers
- If data is insufficient for a section, note what's missing and provide a framework
- Adapt depth and complexity to the deal's league (${deal.league || 'L1'})
- Be thorough and professional — this is a paid deliverable
- Financial amounts in dollars with proper formatting
- Write in direct, authoritative prose — not hedging or generic
- Output clean markdown ready for rendering`;
}

function buildGenerationPrompt(deal: any, menuItem: any, deliverableType: string): string {
  const dealContext = [
    deal.business_name && `Business: ${deal.business_name}`,
    deal.industry && `Industry: ${deal.industry}`,
    deal.location && `Location: ${deal.location}`,
    deal.revenue && `Revenue: $${(deal.revenue / 100).toLocaleString()}`,
    deal.sde && `SDE: $${(deal.sde / 100).toLocaleString()}`,
    deal.ebitda && `EBITDA: $${(deal.ebitda / 100).toLocaleString()}`,
    deal.league && `League: ${deal.league}`,
    deal.journey_type && `Journey: ${deal.journey_type}`,
    deal.current_gate && `Gate: ${deal.current_gate}`,
  ].filter(Boolean).join('\n');

  const financials = deal.financials ? JSON.stringify(deal.financials, null, 2) : 'None provided';

  return `You are a deliverable generation engine for smbx.ai. Generate professional M&A work product.

## DELIVERABLE TYPE: ${deliverableType}
${menuItem?.description || ''}

## DEAL CONTEXT
${dealContext}

## EXTENDED FINANCIALS
${financials}

## RULES
- Use ONLY the data provided — never invent numbers
- Format output as structured JSON suitable for rendering
- Be thorough and professional — this is a paid deliverable
- Include all relevant sections based on the deliverable type
- Financial amounts should be in dollars (display format)
- Include caveats where data is insufficient

Output format: JSON with sections as keys, each section containing 'title' and 'content' fields.`;
}
