/**
 * Worker Service — pg-boss job queue processor for deliverable generation.
 *
 * Runs as a separate process alongside the web server.
 * On Railway: deploy as a Worker service (same repo, different start command).
 *
 * Jobs:
 * - generate-deliverable: AI-powered document generation
 * - extract-document: Financial document extraction
 * - score-seven-factors: Seven-factor business scoring
 */
import 'dotenv/config';
import { PgBoss } from 'pg-boss';
import { sql } from './db.js';
import { callClaude } from './services/aiService.js';
import { generateValuationReport } from './services/generators/valuationReport.js';
import { generateSBAReport } from './services/generators/sbaBankability.js';
import { generateCapitalStructureAnalysis } from './services/generators/capitalStructure.js';
import { generateCIM } from './services/generators/cimGenerator.js';
import { generateLOI } from './services/generators/loiGenerator.js';
import { generateFinancialModel } from './services/generators/financialModel.js';
import { generateBlindTeaser } from './services/generators/blindTeaser.js';
import { generateDDPackage } from './services/generators/ddPackage.js';
import { generateWorkingCapitalAnalysis } from './services/generators/workingCapital.js';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

// ─── pg-boss setup ──────────────────────────────────────────

const boss = new (PgBoss as any)({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  retryLimit: 2,
  retryDelay: 5,
  expireInHours: 1,
  archiveCompletedAfterSeconds: 86400,
  deleteAfterDays: 7,
});

boss.on('error', (err: Error) => {
  console.error('pg-boss error:', err);
});

// ─── Job Handlers ───────────────────────────────────────────

interface GenerateDeliverableJob {
  deliverableId: number;
  dealId: number;
  userId: number;
  menuItemSlug: string;
  deliverableType: string;
}

async function handleGenerateDeliverable(job: { data: GenerateDeliverableJob }) {
  const { deliverableId, dealId, userId, menuItemSlug, deliverableType } = job.data;
  console.log(`Generating deliverable ${deliverableId}: ${menuItemSlug}`);

  const startTime = Date.now();

  try {
    // Mark as generating
    await sql`UPDATE deliverables SET status = 'generating' WHERE id = ${deliverableId}`;

    // Get deal context
    const [deal] = await sql`SELECT * FROM deals WHERE id = ${dealId}`;
    if (!deal) throw new Error(`Deal ${dealId} not found`);

    // Get menu item for generation instructions
    const [menuItem] = await sql`SELECT * FROM menu_items WHERE slug = ${menuItemSlug}`;

    const financials = deal.financials || {};
    let result: Record<string, any>;
    let model = 'deterministic';

    // Dispatch to specialized generator or fall back to generic Claude
    switch (deliverableType) {
      case 'valuation_report':
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
        model = 'claude-opus-4-20250514';
        break;

      case 'loi':
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

      default: {
        // Generic Claude fallback for any other deliverable type
        const systemPrompt = buildGenerationPrompt(deal, menuItem, deliverableType);
        const content = await callClaude(systemPrompt, [
          { role: 'user', content: `Generate the ${deliverableType} deliverable. Use all available deal data. Output as structured JSON.` },
        ]);
        try {
          const cleaned = content.replace(/```json\n?|\n?```/g, '').trim();
          result = JSON.parse(cleaned);
        } catch {
          result = { raw_text: content, format: 'text' };
        }
        model = 'claude-sonnet';
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

    console.log(`Deliverable ${deliverableId} complete (${generationTime}ms)`);
  } catch (err: any) {
    console.error(`Deliverable ${deliverableId} failed:`, err.message);
    await sql`
      UPDATE deliverables
      SET status = 'failed',
          content = ${JSON.stringify({ error: err.message })}::jsonb
      WHERE id = ${deliverableId}
    `;
    throw err; // pg-boss will retry
  }
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

// ─── Start worker ───────────────────────────────────────────

async function start() {
  console.log('Starting pg-boss worker...');
  await boss.start();
  console.log('pg-boss started');

  // Register handlers
  await (boss as any).work('generate-deliverable', { teamSize: 3, teamConcurrency: 1 }, handleGenerateDeliverable);
  console.log('Registered job handlers: generate-deliverable');

  console.log('Worker ready — listening for jobs');
}

start().catch((err) => {
  console.error('Worker startup error:', err);
  process.exit(1);
});

// ─── Queue helper (used by web server to enqueue jobs) ──────

export async function enqueueDeliverable(data: GenerateDeliverableJob): Promise<string | null> {
  const jobId = await boss.send('generate-deliverable', data);
  return jobId;
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received — shutting down worker');
  await boss.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received — shutting down worker');
  await boss.stop();
  process.exit(0);
});
