import postgres from 'postgres';
import type { Tool } from '@anthropic-ai/sdk/resources/messages';
import { checkGateReadinessSync as checkReadiness, isPaywallGate } from './gateReadinessService.js';
import { isExecutionFeePaid, calculateExecutionFee } from './dealExecutionFee.js';
import { generateProviderRecommendation, findProviders, trackReferral } from './providerMatchingService.js';
import { matchFranchises } from './franchiseMatchingService.js';
import { matchBuyersForSeller } from './buyerSourcingService.js';
import { generateOptimizationPlan, saveOptimizationPlan, createOptimizationMilestone } from './optimizationPlanService.js';
import { sendGateAdvancementEmail } from './emailService.js';
import { handleGateTransition } from './gateConversationService.js';
import { snapshotDealFinancials, checkDealFreshness } from './dealFreshnessService.js';

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require', prepare: false });

// ─── Tool Definitions (for Claude API) ─────────────────────

export const TOOL_DEFINITIONS: Tool[] = [
  {
    name: 'create_deal',
    description: 'Create a new deal for the current user. Call this when the user indicates they want to sell, buy, raise capital, or handle post-acquisition integration.',
    input_schema: {
      type: 'object' as const,
      properties: {
        journeyType: { type: 'string', enum: ['sell', 'buy', 'raise', 'pmi'], description: 'The type of M&A journey' },
        initialGate: { type: 'string', description: 'Starting gate (S0, B0, R0, or PMI0)' },
      },
      required: ['journeyType', 'initialGate'],
    },
  },
  {
    name: 'update_deal_field',
    description: 'Update a field on the deal record. Call this EVERY TIME the user provides information about their business. Fields: business_name, industry, location, revenue (in cents), sde (in cents), ebitda (in cents), asking_price (in cents). For other fields like years_in_business, employee_count, reason_for_selling, owner_compensation, growth_rate, gross_margin — these are stored in the financials JSON.',
    input_schema: {
      type: 'object' as const,
      properties: {
        dealId: { type: 'number', description: 'The deal ID' },
        field: { type: 'string', description: 'Field name to update' },
        value: { description: 'The value to set. Use cents for financial amounts.' },
      },
      required: ['dealId', 'field', 'value'],
    },
  },
  {
    name: 'classify_league',
    description: 'Classify the deal into a league (L1-L6) based on financial data. Call this when you have enough financial data (revenue + SDE or EBITDA). Updates both the deal and user records.',
    input_schema: {
      type: 'object' as const,
      properties: {
        dealId: { type: 'number', description: 'The deal ID to classify' },
      },
      required: ['dealId'],
    },
  },
  {
    name: 'get_deal_context',
    description: 'Get the full deal record to see what data has been collected so far. Call this to avoid asking redundant questions.',
    input_schema: {
      type: 'object' as const,
      properties: {
        dealId: { type: 'number', description: 'The deal ID' },
      },
      required: ['dealId'],
    },
  },
  {
    name: 'advance_gate',
    description: 'Advance the deal to the next gate. Only call when gate criteria are met.',
    input_schema: {
      type: 'object' as const,
      properties: {
        dealId: { type: 'number', description: 'The deal ID' },
        fromGate: { type: 'string', description: 'Current gate (e.g. S0)' },
        toGate: { type: 'string', description: 'Target gate (e.g. S1)' },
      },
      required: ['dealId', 'fromGate', 'toGate'],
    },
  },
  {
    name: 'generate_free_deliverable',
    description: 'Generate a free deliverable based on deal data. Call proactively when enough data is available.',
    input_schema: {
      type: 'object' as const,
      properties: {
        dealId: { type: 'number', description: 'The deal ID' },
        deliverableType: {
          type: 'string',
          enum: ['business_profile', 'league_card', 'journey_roadmap'],
          description: 'Type of deliverable to generate',
        },
      },
      required: ['dealId', 'deliverableType'],
    },
  },
  {
    name: 'recommend_providers',
    description: 'Recommend service providers (attorneys, CPAs, appraisers, etc.) based on the deal context. Call this when the user asks about finding a service provider, or proactively at gate transitions that typically require professional services. Can also search by type and location directly.',
    input_schema: {
      type: 'object' as const,
      properties: {
        dealId: { type: 'number', description: 'The deal ID for contextual recommendations. If provided, returns providers matched to the current gate.' },
        type: { type: 'string', enum: ['attorney', 'cpa', 'appraiser', 're_agent', 'insurance', 'consultant'], description: 'Specific provider type to search for. If dealId is not provided, this is required.' },
        state: { type: 'string', description: 'State to filter providers (e.g., "TX", "CA")' },
      },
      required: [],
    },
  },
  {
    name: 'analyze_buyer_demand',
    description: 'Analyze buyer demand for a seller\'s business. Returns matching active buyer count (anonymized), buyer type analysis, and demand signal strength. Call this when a seller asks "who would buy my business?" or wants to understand their market of potential buyers.',
    input_schema: {
      type: 'object' as const,
      properties: {
        dealId: { type: 'number', description: 'The deal ID to analyze buyer demand for' },
      },
      required: ['dealId'],
    },
  },
  {
    name: 'match_franchises',
    description: 'Match franchise opportunities for a buyer based on their budget, preferences, and interests. Call this when a buyer is exploring franchise options, or when no suitable existing business listings match their criteria. Helps buyers discover franchise alternatives.',
    input_schema: {
      type: 'object' as const,
      properties: {
        budget: { type: 'number', description: 'Total investment budget in cents' },
        liquidCapital: { type: 'number', description: 'Available liquid capital in cents' },
        modelType: { type: 'string', enum: ['owner_operator', 'semi_absentee', 'absentee', 'executive'], description: 'Preferred ownership model' },
        category: { type: 'string', description: 'Industry category (e.g., QSR, fitness, home_services, automotive, cleaning, education, health, pet)' },
        state: { type: 'string', description: 'State for franchise registration check (e.g., "TX")' },
      },
      required: [],
    },
  },
  {
    name: 'generate_optimization_plan',
    description: 'Generate a value optimization plan for a seller. Creates personalized improvement actions with timeline and dollar impact estimates. Call this when a seller asks about increasing their business value, preparing for sale, or when they reach S1 with financial data.',
    input_schema: {
      type: 'object' as const,
      properties: {
        dealId: { type: 'number', description: 'The deal ID for the sell journey' },
      },
      required: ['dealId'],
    },
  },
  {
    name: 'list_user_deals',
    description: 'List all deals for the current user. Call this when: the user asks about their deals, portfolio, or pipeline; when you need to understand what deals they have; when the user wants to switch to a different deal; or when you detect they may be a broker/advisor managing multiple clients. Returns summary of all active deals with journey type, gate, financials, and business name.',
    input_schema: {
      type: 'object' as const,
      properties: {
        journeyFilter: { type: 'string', enum: ['sell', 'buy', 'raise', 'pmi'], description: 'Optional filter by journey type' },
        includeParticipant: { type: 'boolean', description: 'Include deals where user is a participant (not owner). Useful for advisors/brokers.' },
      },
      required: [],
    },
  },
  {
    name: 'switch_deal_context',
    description: 'Switch this conversation to a different deal. Call this when the user asks to work on a specific deal, or when they reference a deal by name or ID. This updates the conversation\'s deal_id so all subsequent tool calls operate on the new deal.',
    input_schema: {
      type: 'object' as const,
      properties: {
        dealId: { type: 'number', description: 'The deal ID to switch to' },
      },
      required: ['dealId'],
    },
  },
];

// ─── Tool Execution ────────────────────────────────────────

// Direct column fields on the deals table
const DEAL_COLUMNS = new Set([
  'business_name', 'industry', 'location', 'revenue', 'sde', 'ebitda',
  'asking_price', 'league', 'current_gate', 'journey_type', 'status',
]);

export async function executeTool(
  toolName: string,
  input: Record<string, any>,
  userId: number,
  conversationId: number,
): Promise<string> {
  try {
    switch (toolName) {
      case 'create_deal':
        return await createDeal(input, userId, conversationId);
      case 'update_deal_field':
        return await updateDealField(input, userId);
      case 'classify_league':
        return await classifyLeague(input, userId);
      case 'get_deal_context':
        return await getDealContext(input, userId);
      case 'advance_gate':
        return await advanceGate(input, userId);
      case 'generate_free_deliverable':
        return await generateFreeDeliverable(input, userId);
      case 'recommend_providers':
        return await recommendProviders(input, userId);
      case 'analyze_buyer_demand':
        return await analyzeBuyerDemandTool(input, userId);
      case 'match_franchises':
        return await matchFranchiseTool(input);
      case 'generate_optimization_plan':
        return await generateOptimizationPlanTool(input, userId);
      case 'list_user_deals':
        return await listUserDeals(input, userId);
      case 'switch_deal_context':
        return await switchDealContext(input, userId, conversationId);
      default:
        return JSON.stringify({ error: `Unknown tool: ${toolName}` });
    }
  } catch (err: any) {
    console.error(`Tool ${toolName} error:`, err.message);
    return JSON.stringify({ error: err.message });
  }
}

async function createDeal(input: Record<string, any>, userId: number, conversationId: number): Promise<string> {
  const { journeyType, initialGate } = input;

  const [deal] = await sql`
    INSERT INTO deals (user_id, journey_type, current_gate, status)
    VALUES (${userId}, ${journeyType}, ${initialGate}, 'active')
    RETURNING id, journey_type, current_gate
  `;

  // Link conversation to deal
  await sql`UPDATE conversations SET deal_id = ${deal.id} WHERE id = ${conversationId}`;

  return JSON.stringify({ success: true, dealId: deal.id, journeyType, gate: initialGate });
}

const FINANCIAL_FIELDS = new Set(['revenue', 'sde', 'ebitda', 'asking_price']);

async function updateDealField(input: Record<string, any>, userId: number): Promise<string> {
  const { dealId, field, value } = input;

  // Verify ownership
  const [deal] = await sql`SELECT id, financials FROM deals WHERE id = ${dealId} AND user_id = ${userId} LIMIT 1`;
  if (!deal) return JSON.stringify({ error: 'Deal not found' });

  // Snapshot financials before update for freshness tracking
  const isFinancialUpdate = FINANCIAL_FIELDS.has(field) || (field === 'financials' && typeof value === 'object');
  if (isFinancialUpdate) {
    await snapshotDealFinancials(dealId).catch(() => {});
  }

  if (field === 'financials' && typeof value === 'object') {
    // Merge entire object into financials jsonb
    const existing = typeof deal.financials === 'string' ? JSON.parse(deal.financials) : (deal.financials || {});
    const merged = { ...existing, ...value };
    await sql`UPDATE deals SET financials = ${JSON.stringify(merged)}::jsonb, updated_at = NOW() WHERE id = ${dealId}`;
  } else if (DEAL_COLUMNS.has(field)) {
    // Direct column update
    await sql`UPDATE deals SET ${sql(field)} = ${value}, updated_at = NOW() WHERE id = ${dealId}`;
  } else {
    // Store as sub-field in financials jsonb
    const existing = typeof deal.financials === 'string' ? JSON.parse(deal.financials) : (deal.financials || {});
    existing[field] = value;
    await sql`UPDATE deals SET financials = ${JSON.stringify(existing)}::jsonb, updated_at = NOW() WHERE id = ${dealId}`;
  }

  // Check freshness after financial updates (non-blocking)
  if (isFinancialUpdate) {
    setImmediate(() => checkDealFreshness(dealId).catch(() => {}));
  }

  return JSON.stringify({ success: true, field, value });
}

async function classifyLeague(input: Record<string, any>, userId: number): Promise<string> {
  const { dealId } = input;

  const [deal] = await sql`SELECT * FROM deals WHERE id = ${dealId} AND user_id = ${userId} LIMIT 1`;
  if (!deal) return JSON.stringify({ error: 'Deal not found' });

  const sde = deal.sde ? deal.sde / 100 : null; // convert cents to dollars
  const ebitda = deal.ebitda ? deal.ebitda / 100 : null;
  const revenue = deal.revenue ? deal.revenue / 100 : null;
  const financials = (deal.financials as Record<string, any>) || {};
  const industry = deal.industry?.toLowerCase() || '';

  // Roll-up override
  const rollUpIndustries = ['veterinary', 'dental', 'hvac', 'msp', 'pest control'];
  const isRollUp = rollUpIndustries.some(ri => industry.includes(ri)) && revenue && revenue > 1500000;

  let league: string;
  let reason: string;
  let explanation: string;

  if (isRollUp) {
    // Roll-up override: L3 floor for roll-up industries with revenue >$1.5M
    const baseLeague = ebitda ? classifyByEbitda(ebitda) : (sde ? classifyBySde(sde) : 'L3');
    const leagueRank = { L1: 1, L2: 2, L3: 3, L4: 4, L5: 5, L6: 6 };
    league = (leagueRank[baseLeague as keyof typeof leagueRank] || 0) >= 3 ? baseLeague : 'L3';
    reason = 'roll_up_override';
    explanation = `Classified as ${league} via roll-up override: ${deal.industry} is an active consolidation sector, and your $${revenue!.toLocaleString()} revenue qualifies you for institutional-level buyer interest despite EBITDA below the standard L3 threshold. PE roll-ups evaluate businesses like yours as platform or bolt-on acquisitions, which means you'll be valued on institutional metrics.`;
  } else if (ebitda && ebitda >= 2000000) {
    league = classifyByEbitda(ebitda);
    reason = 'standard';
    explanation = `Classified as ${league} via standard EBITDA classification: EBITDA of $${ebitda.toLocaleString()}.`;
  } else if (sde) {
    league = classifyBySde(sde);
    reason = 'standard';
    explanation = `Classified as ${league} via standard SDE classification: SDE of $${sde.toLocaleString()}.`;
  } else if (financials.owner_compensation && revenue) {
    const estSde = parseFloat(financials.owner_compensation) || 0;
    league = classifyBySde(estSde);
    reason = 'standard';
    explanation = `Classified as ${league} via estimated SDE from owner compensation of $${estSde.toLocaleString()}.`;
  } else {
    return JSON.stringify({ error: 'Not enough financial data. Need SDE or EBITDA to classify.' });
  }

  // Save league + classification reason to deal
  const classificationMeta = { reason, explanation, classified_at: new Date().toISOString() };
  const existingFinancials = typeof deal.financials === 'string' ? JSON.parse(deal.financials) : (deal.financials || {});
  const updatedFinancials = { ...existingFinancials, league_classification: classificationMeta };
  await sql`UPDATE deals SET league = ${league}, financials = ${JSON.stringify(updatedFinancials)}::jsonb, updated_at = NOW() WHERE id = ${dealId}`;
  await sql`UPDATE users SET league = ${league}, updated_at = NOW() WHERE id = ${userId}`;

  return JSON.stringify({ success: true, league, reason, explanation });
}

function classifyBySde(sde: number): string {
  if (sde >= 500000) return 'L2';
  return 'L1';
}

function classifyByEbitda(ebitda: number): string {
  if (ebitda >= 50000000) return 'L6';
  if (ebitda >= 10000000) return 'L5';
  if (ebitda >= 5000000) return 'L4';
  if (ebitda >= 2000000) return 'L3';
  return 'L2';
}

async function getDealContext(input: Record<string, any>, userId: number): Promise<string> {
  const { dealId } = input;
  const [deal] = await sql`SELECT * FROM deals WHERE id = ${dealId} AND user_id = ${userId} LIMIT 1`;
  if (!deal) return JSON.stringify({ error: 'Deal not found' });

  // Format for readability
  const ctx: Record<string, any> = { ...deal };
  if (ctx.revenue) ctx.revenue_display = `$${(ctx.revenue / 100).toLocaleString()}`;
  if (ctx.sde) ctx.sde_display = `$${(ctx.sde / 100).toLocaleString()}`;
  if (ctx.ebitda) ctx.ebitda_display = `$${(ctx.ebitda / 100).toLocaleString()}`;
  if (ctx.asking_price) ctx.asking_price_display = `$${(ctx.asking_price / 100).toLocaleString()}`;
  delete ctx.password; // safety

  return JSON.stringify(ctx);
}

async function advanceGate(input: Record<string, any>, userId: number): Promise<string> {
  const { dealId, fromGate, toGate } = input;

  const [deal] = await sql`SELECT * FROM deals WHERE id = ${dealId} AND user_id = ${userId} LIMIT 1`;
  if (!deal) return JSON.stringify({ error: 'Deal not found' });
  if (deal.current_gate !== fromGate) {
    return JSON.stringify({ error: `Current gate is ${deal.current_gate}, not ${fromGate}` });
  }

  // Check readiness for current gate completion
  const readiness = checkReadiness(fromGate, deal);
  if (!readiness.ready) {
    return JSON.stringify({
      ready: false,
      missing: readiness.missing,
      message: `Cannot advance from ${fromGate}. Missing: ${readiness.missing.join(', ')}`,
    });
  }

  // Check paywall — if next gate requires execution fee payment
  if (isPaywallGate(toGate)) {
    const paid = await isExecutionFeePaid(dealId);
    if (!paid) {
      const fee = calculateExecutionFee(deal);
      return JSON.stringify({
        ready: true,
        paywallRequired: true,
        gate: toGate,
        feeCents: fee.feeCents,
        feeDisplay: fee.feeDisplay,
        basis: fee.basis,
        basisDisplay: fee.basisDisplay,
        message: `To continue, the deal execution fee is ${fee.feeDisplay} (0.1% of your ${fee.basis}).`,
      });
    }
  }

  // Advance the gate
  await sql`UPDATE deals SET current_gate = ${toGate}, updated_at = NOW() WHERE id = ${dealId}`;

  // Update gate_progress if it exists
  await sql`
    UPDATE gate_progress SET status = 'completed', completed_at = NOW()
    WHERE deal_id = ${dealId} AND gate = ${fromGate}
  `.catch(() => {});
  await sql`
    UPDATE gate_progress SET status = 'active'
    WHERE deal_id = ${dealId} AND gate = ${toGate}
  `.catch(() => {});

  // Notify user via email (fire-and-forget)
  sendGateAdvancementEmail(userId, toGate, deal.journey_type || 'sell', deal.business_name).catch(() => {});

  // Gate conversation lifecycle: summarize old, create new
  const transition = await handleGateTransition(dealId, userId, fromGate, toGate).catch(() => null);

  return JSON.stringify({ success: true, newGate: toGate, newConversationId: transition?.newConversationId ?? null });
}

async function generateFreeDeliverable(input: Record<string, any>, userId: number): Promise<string> {
  const { dealId, deliverableType } = input;

  const [deal] = await sql`SELECT * FROM deals WHERE id = ${dealId} AND user_id = ${userId} LIMIT 1`;
  if (!deal) return JSON.stringify({ error: 'Deal not found' });

  let content: Record<string, any> = {};

  switch (deliverableType) {
    case 'business_profile':
      content = {
        type: 'business_profile',
        business_name: deal.business_name || 'Unnamed Business',
        industry: deal.industry || 'Not specified',
        location: deal.location || 'Not specified',
        revenue: deal.revenue ? `$${(deal.revenue / 100).toLocaleString()}` : 'Not provided',
        sde: deal.sde ? `$${(deal.sde / 100).toLocaleString()}` : null,
        ebitda: deal.ebitda ? `$${(deal.ebitda / 100).toLocaleString()}` : null,
        league: deal.league,
        ...(deal.financials || {}),
      };
      break;

    case 'league_card':
      content = {
        type: 'league_card',
        league: deal.league,
        metric: ['L1', 'L2'].includes(deal.league) ? 'SDE' : 'EBITDA',
        multiple_range: getMultipleRange(deal.league),
        typical_buyer: getTypicalBuyer(deal.league),
      };
      break;

    case 'journey_roadmap':
      content = {
        type: 'journey_roadmap',
        journey: deal.journey_type,
        current_gate: deal.current_gate,
        gates: getJourneyGates(deal.journey_type),
      };
      break;
  }

  // Save deliverable
  const [deliverable] = await sql`
    INSERT INTO deliverables (deal_id, user_id, type, status, content, price_charged_cents)
    VALUES (${dealId}, ${userId}, ${deliverableType}, 'complete', ${JSON.stringify(content)}::jsonb, 0)
    RETURNING id, type
  `;

  return JSON.stringify({ success: true, deliverableId: deliverable.id, content });
}

function getMultipleRange(league: string): string {
  const ranges: Record<string, string> = {
    L1: '2.0x - 3.5x SDE', L2: '3.0x - 5.0x SDE', L3: '4.0x - 6.0x EBITDA',
    L4: '6.0x - 8.0x EBITDA', L5: '8.0x - 12.0x EBITDA', L6: '10.0x+ EBITDA',
  };
  return ranges[league] || 'Unknown';
}

function getTypicalBuyer(league: string): string {
  const buyers: Record<string, string> = {
    L1: 'Individual buyer (SBA loan)', L2: 'Experienced individual or search fund',
    L3: 'Small PE or strategic acquirer', L4: 'PE firm or family office',
    L5: 'Middle-market PE', L6: 'Large PE or public company',
  };
  return buyers[league] || 'Unknown';
}

function getJourneyGates(journey: string): string[] {
  const gates: Record<string, string[]> = {
    sell: ['S0 Intake', 'S1 Financials', 'S2 Valuation', 'S3 Packaging', 'S4 Market Matching', 'S5 Closing'],
    buy: ['B0 Thesis', 'B1 Sourcing', 'B2 Valuation', 'B3 Due Diligence', 'B4 Structuring', 'B5 Closing'],
    raise: ['R0 Intake', 'R1 Financial Package', 'R2 Investor Materials', 'R3 Outreach', 'R4 Terms', 'R5 Closing'],
    pmi: ['PMI0 Day Zero', 'PMI1 Stabilization', 'PMI2 Assessment', 'PMI3 Optimization'],
  };
  return gates[journey] || [];
}

async function recommendProviders(input: Record<string, any>, userId: number): Promise<string> {
  const { dealId, type, state } = input;

  // If dealId provided, use contextual recommendations
  if (dealId) {
    const [deal] = await sql`SELECT id FROM deals WHERE id = ${dealId} AND user_id = ${userId}`;
    if (!deal) return JSON.stringify({ error: 'Deal not found' });

    const result = await generateProviderRecommendation(dealId);

    // Track referrals for recommended providers
    for (const [, providers] of Object.entries(result.recommendations)) {
      for (const p of providers) {
        await trackReferral(dealId, p.id, userId, `AI recommendation at gate`).catch(() => {});
      }
    }

    return JSON.stringify({
      success: true,
      context: result.context,
      neededTypes: result.neededTypes,
      recommendations: result.recommendations,
    });
  }

  // Direct search by type
  if (type) {
    const providers = await findProviders({ type, state, limit: 5 });
    return JSON.stringify({
      success: true,
      type,
      state: state || 'all',
      providers,
    });
  }

  return JSON.stringify({ error: 'Provide dealId for contextual recommendations, or type for direct search' });
}

async function analyzeBuyerDemandTool(input: Record<string, any>, userId: number): Promise<string> {
  const { dealId } = input;
  const [deal] = await sql`SELECT id FROM deals WHERE id = ${dealId} AND user_id = ${userId}`;
  if (!deal) return JSON.stringify({ error: 'Deal not found' });

  const result = await matchBuyersForSeller(dealId);
  return JSON.stringify({ success: true, ...result });
}

async function matchFranchiseTool(input: Record<string, any>): Promise<string> {
  const { budget, liquidCapital, modelType, category, state } = input;

  const results = await matchFranchises({
    budget: budget || undefined,
    liquidCapital: liquidCapital || undefined,
    modelType: modelType || undefined,
    category: category || undefined,
    state: state || undefined,
    limit: 5,
  });

  if (results.length === 0) {
    return JSON.stringify({
      success: true,
      message: 'No franchise matches found for the given criteria. Try broadening your search.',
      franchises: [],
    });
  }

  return JSON.stringify({
    success: true,
    count: results.length,
    franchises: results,
  });
}

async function generateOptimizationPlanTool(input: Record<string, any>, userId: number): Promise<string> {
  const { dealId } = input;
  const [deal] = await sql`
    SELECT d.*, d.financials FROM deals d
    WHERE d.id = ${dealId} AND d.user_id = ${userId} AND d.journey_type = 'sell'
  `;
  if (!deal) return JSON.stringify({ error: 'Sell deal not found' });

  // Get company profile
  const [profile] = await sql`
    SELECT * FROM company_profiles WHERE deal_id = ${dealId} LIMIT 1
  `;

  const plan = await generateOptimizationPlan({
    dealId: deal.id,
    userId,
    business_name: deal.business_name,
    industry: deal.industry,
    naics_code: deal.naics_code,
    revenue: deal.revenue,
    sde: deal.sde,
    ebitda: deal.ebitda,
    owner_salary: deal.financials?.owner_salary,
    employee_count: deal.employee_count,
    years_in_business: deal.financials?.years_in_business,
    gross_margin: deal.financials?.gross_margin,
    growth_rate: deal.financials?.growth_rate,
    league: deal.league || 'L1',
    exit_type: deal.exit_type,
    financials: deal.financials,
  });

  // Save to DB if profile exists
  if (profile) {
    await saveOptimizationPlan(profile.id, plan);
    await createOptimizationMilestone(deal.id, {
      milestone_type: 'plan_created',
      description: `Generated ${plan.actions.length} improvement actions`,
      valuation_snapshot_low: plan.currentValuationLow,
      valuation_snapshot_high: plan.currentValuationHigh,
      actions_completed: 0,
      actions_total: plan.actions.length,
    });
  }

  return JSON.stringify({
    success: true,
    summary: plan.summary,
    actionCount: plan.actions.length,
    currentValuation: `$${(plan.currentValuationLow / 100).toLocaleString()} – $${(plan.currentValuationHigh / 100).toLocaleString()}`,
    potentialValuation: `$${(plan.potentialValuationLow / 100).toLocaleString()} – $${(plan.potentialValuationHigh / 100).toLocaleString()}`,
    totalPotentialImpact: `$${(plan.totalPotentialImpact / 100).toLocaleString()}`,
    estimatedMonths: plan.estimatedMonthsToReady,
    topActions: plan.actions.slice(0, 3).map(a => ({
      title: a.title,
      impact: a.valuation_impact_cents ? `$${(a.valuation_impact_cents / 100).toLocaleString()}` : 'Qualitative',
      difficulty: a.difficulty,
      timeline: `${a.timeline_days} days`,
    })),
  });
}

// ─── Portfolio Tools ──────────────────────────────────────

async function listUserDeals(input: Record<string, any>, userId: number): Promise<string> {
  const { journeyFilter, includeParticipant } = input;

  // Get owned deals
  let deals;
  if (journeyFilter) {
    deals = await sql`
      SELECT id, journey_type, current_gate, league, business_name, industry, location,
             revenue, sde, ebitda, asking_price, status, created_at, updated_at
      FROM deals WHERE user_id = ${userId} AND status = 'active' AND journey_type = ${journeyFilter}
      ORDER BY updated_at DESC
    `;
  } else {
    deals = await sql`
      SELECT id, journey_type, current_gate, league, business_name, industry, location,
             revenue, sde, ebitda, asking_price, status, created_at, updated_at
      FROM deals WHERE user_id = ${userId} AND status = 'active'
      ORDER BY updated_at DESC
    `;
  }

  // Optionally include deals where user is a participant (advisor/broker)
  let participantDeals: any[] = [];
  if (includeParticipant) {
    participantDeals = await sql`
      SELECT d.id, d.journey_type, d.current_gate, d.league, d.business_name, d.industry,
             d.revenue, d.sde, d.ebitda, d.asking_price, d.status, d.updated_at,
             dp.role as participant_role, dp.access_level
      FROM deals d
      JOIN deal_participants dp ON dp.deal_id = d.id
      WHERE dp.user_id = ${userId} AND dp.accepted_at IS NOT NULL AND d.status = 'active'
      ORDER BY d.updated_at DESC
    `;
  }

  const formatDeal = (d: any, role?: string) => ({
    dealId: d.id,
    journeyType: d.journey_type,
    currentGate: d.current_gate,
    league: d.league,
    businessName: d.business_name || 'Unnamed',
    industry: d.industry,
    revenue: d.revenue ? `$${(d.revenue / 100).toLocaleString()}` : null,
    sde: d.sde ? `$${(d.sde / 100).toLocaleString()}` : null,
    ebitda: d.ebitda ? `$${(d.ebitda / 100).toLocaleString()}` : null,
    askingPrice: d.asking_price ? `$${(d.asking_price / 100).toLocaleString()}` : null,
    role: role || 'owner',
    lastUpdated: d.updated_at,
  });

  const ownedFormatted = deals.map((d: any) => formatDeal(d));
  const participantFormatted = participantDeals.map((d: any) => formatDeal(d, d.participant_role));

  const totalDeals = ownedFormatted.length + participantFormatted.length;
  const isMultiDeal = totalDeals > 1;

  return JSON.stringify({
    totalDeals,
    isMultiDeal,
    isAdvisorPattern: participantFormatted.length > 0 || totalDeals >= 3,
    ownedDeals: ownedFormatted,
    participantDeals: participantFormatted,
    portfolioSummary: isMultiDeal ? {
      totalPipelineValue: deals.reduce((sum: number, d: any) => sum + (d.asking_price || d.revenue || 0), 0) / 100,
      journeyBreakdown: {
        sell: deals.filter((d: any) => d.journey_type === 'sell').length,
        buy: deals.filter((d: any) => d.journey_type === 'buy').length,
        raise: deals.filter((d: any) => d.journey_type === 'raise').length,
        pmi: deals.filter((d: any) => d.journey_type === 'pmi').length,
      },
    } : null,
  });
}

async function switchDealContext(input: Record<string, any>, userId: number, conversationId: number): Promise<string> {
  const { dealId } = input;

  // Verify user has access (owner or participant)
  const [owned] = await sql`SELECT id, business_name, journey_type, current_gate FROM deals WHERE id = ${dealId} AND user_id = ${userId} LIMIT 1`;
  if (!owned) {
    const [participant] = await sql`
      SELECT d.id, d.business_name, d.journey_type, d.current_gate
      FROM deals d JOIN deal_participants dp ON dp.deal_id = d.id
      WHERE d.id = ${dealId} AND dp.user_id = ${userId} AND dp.accepted_at IS NOT NULL
      LIMIT 1
    `;
    if (!participant) return JSON.stringify({ error: 'Deal not found or no access' });

    await sql`UPDATE conversations SET deal_id = ${dealId} WHERE id = ${conversationId}`;
    return JSON.stringify({ success: true, dealId, businessName: participant.business_name, journeyType: participant.journey_type, currentGate: participant.current_gate, role: 'participant' });
  }

  await sql`UPDATE conversations SET deal_id = ${dealId} WHERE id = ${conversationId}`;
  return JSON.stringify({ success: true, dealId, businessName: owned.business_name, journeyType: owned.journey_type, currentGate: owned.current_gate, role: 'owner' });
}
