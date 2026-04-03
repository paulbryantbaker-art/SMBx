import postgres from 'postgres';
import type { Tool } from '@anthropic-ai/sdk/resources/messages';
import { checkGateReadinessSync as checkReadiness } from './gateReadinessService.js';
import { generateProviderRecommendation, findProviders, trackReferral } from './providerMatchingService.js';
import { matchFranchises } from './franchiseMatchingService.js';
import { matchBuyersForSeller } from './buyerSourcingService.js';
import { generateOptimizationPlan, saveOptimizationPlan, createOptimizationMilestone } from './optimizationPlanService.js';
import { sendGateAdvancementEmail } from './emailService.js';
import { handleGateTransition } from './gateConversationService.js';
import { snapshotDealFinancials, checkDealFreshness } from './dealFreshnessService.js';
import { fetchCBPData, fetchBDSData, calculateSBABankability } from './marketDataService.js';
import { getSBALendingStats } from './sbaLendingService.js';
import { getMarketHeat } from './marketHeatService.js';
import { enrichCompanyWebsite } from './websiteEnrichmentService.js';

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
  {
    name: 'scan_market',
    description: 'Scan market data for a buyer thesis or deal evaluation. Combines Census CBP (establishment counts), Census BDS (firm age/turnover), SBA 7(a) lending stats, and market heat scoring. Call this when: a buyer asks about market conditions for an industry, a seller wants to understand their competitive landscape, or when evaluating a deal in a specific geography.',
    input_schema: {
      type: 'object' as const,
      properties: {
        industry: { type: 'string', description: 'Industry name (e.g., "HVAC", "dental practice")' },
        naicsCode: { type: 'string', description: 'NAICS code (2-6 digits). If unknown, provide industry name and we will infer.' },
        stateCode: { type: 'string', description: '2-digit FIPS state code (e.g., "48" for Texas, "06" for California)' },
        purchasePrice: { type: 'number', description: 'Estimated purchase price in cents for SBA analysis' },
        earnings: { type: 'number', description: 'SDE or EBITDA in cents for SBA analysis' },
      },
      required: ['industry'],
    },
  },
  {
    name: 'enrich_target',
    description: 'Enrich a discovery target or company profile by scraping and analyzing their website. Uses Claude Haiku to extract structured business data: years in business, services offered, team size, location details, and succession/sale signals. Call this when evaluating a specific business as a potential acquisition target.',
    input_schema: {
      type: 'object' as const,
      properties: {
        companyProfileId: { type: 'number', description: 'Company profile ID to enrich' },
        websiteUrl: { type: 'string', description: 'Website URL to scrape. If companyProfileId is given, will use stored URL.' },
      },
      required: [],
    },
  },
  {
    name: 'get_sourcing_portfolio',
    description: "Get the buyer's sourcing portfolio — their acquisition target pipeline with scored candidates. Returns portfolio stats, top A-tier candidates, and recent status changes. Call this when the user asks about their pipeline, deal flow, targets, or acquisition candidates.",
    input_schema: {
      type: 'object' as const,
      properties: {
        thesisId: { type: 'number', description: 'Specific thesis ID. If omitted, returns the most recent active portfolio.' },
      },
      required: [],
    },
  },
  {
    name: 'create_model_tab',
    description: 'Create a new interactive financial model tab on the canvas. The model calculates instantly on the client with no API calls. Use when the user wants to model a scenario, run valuation, check SBA financing, or analyze a deal. Returns the tab ID so you can reference it later.',
    input_schema: {
      type: 'object' as const,
      properties: {
        modelType: { type: 'string', enum: ['valuation', 'lbo', 'sba_financing', 'dcf', 'sensitivity', 'comparison', 'cap_table', 'earnout', 'tax_impact', 'working_capital', 'covenant', 'sde_analysis'], description: 'Type of financial model' },
        title: { type: 'string', description: 'Tab title shown in the canvas tab bar' },
        initialAssumptions: { type: 'object', description: 'Starting assumptions. For valuation: { sde, ebitda, league, revenue }. For lbo: { purchasePrice, ebitda, revenue, revenueGrowthRate, ebitdaMargin, exitMultiple, holdPeriod, seniorDebtPct, seniorRate }. For sba_financing: { purchasePrice, earnings, downPaymentPct, interestRate, termMonths }. All money in cents.' },
      },
      required: ['modelType', 'title', 'initialAssumptions'],
    },
  },
  {
    name: 'update_model',
    description: 'Update assumptions in an open financial model tab. The canvas recalculates and re-renders instantly (deterministic math, no API call). Use when the user says "what if EBITDA is $1.5M" or "change the exit multiple to 6x".',
    input_schema: {
      type: 'object' as const,
      properties: {
        tabId: { type: 'string', description: 'Target model tab ID. Use "active" for the currently visible model tab.' },
        updates: { type: 'object', description: 'Key-value pairs of assumptions to update. Example: { "ebitda": 150000000, "exitMultiple": 6.0 }. Money values in cents.' },
      },
      required: ['tabId', 'updates'],
    },
  },
  {
    name: 'read_tab_state',
    description: 'Read the current state of a canvas model tab — assumptions, calculated outputs, and what the user is looking at. Use when the user references canvas content ("what about this one", "what does the model show").',
    input_schema: {
      type: 'object' as const,
      properties: {
        tabId: { type: 'string', description: 'Tab to read. Use "active" for currently visible tab, "all" for all open model tabs.' },
      },
      required: ['tabId'],
    },
  },
  {
    name: 'query_admin_data',
    description: 'Admin-only tool for querying platform metrics, user activity, issues, and system health. Only available when the user is an admin. Use to answer questions like "how many users signed up this week?", "what are the top bugs?", "show me conversion metrics", "are there any critical issues?".',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          enum: [
            'metrics_overview', 'conversion_funnel', 'journey_distribution',
            'gate_heatmap', 'revenue_breakdown', 'engagement_7d',
            'open_issues', 'critical_issues', 'feature_requests',
            'recent_errors', 'user_growth', 'service_health',
          ],
          description: 'Predefined metric query to run',
        },
        timeRange: { type: 'string', enum: ['24h', '7d', '30d', '90d'], description: 'Time range filter (default: 7d)' },
        limit: { type: 'number', description: 'Max results for list queries (default: 20)' },
      },
      required: ['query'],
    },
  },
  {
    name: 'create_support_issue',
    description: 'Create a support ticket when the user reports a problem Yulia cannot resolve, when Yulia detects a system error, or when the user makes a feature request. TRY TO FIX THE ISSUE FIRST before creating a ticket. Only create a ticket if you genuinely cannot resolve it yourself.',
    input_schema: {
      type: 'object' as const,
      properties: {
        type: { type: 'string', enum: ['bug', 'feature_request', 'feedback', 'system_error'], description: 'Type of issue' },
        title: { type: 'string', description: 'Short summary — generate from conversation context' },
        description: { type: 'string', description: 'Detailed: what user was trying to do, what happened, what should have happened' },
        severity: { type: 'string', enum: ['critical', 'major', 'minor', 'enhancement'], description: 'critical = blocked, major = wrong behavior, minor = cosmetic, enhancement = feature request' },
        userMessage: { type: 'string', description: "The user's own words describing the problem (verbatim from chat)" },
      },
      required: ['type', 'title', 'description', 'severity'],
    },
  },
  {
    name: 'request_review',
    description: 'Send a document to a deal participant for review. Use this proactively when a deliverable is ready for legal, financial, or strategic review. Yulia should specify focus areas to guide the reviewer. The reviewer gets notified and the document opens for them with review tools.',
    input_schema: {
      type: 'object' as const,
      properties: {
        dealId: { type: 'number', description: 'Deal ID' },
        deliverableId: { type: 'number', description: 'Deliverable to review' },
        reviewerRole: { type: 'string', enum: ['attorney', 'cpa', 'broker', 'lender'], description: 'Role of the reviewer to assign' },
        focusAreas: { type: 'string', description: 'Specific areas the reviewer should focus on — be detailed: section numbers, specific terms, risk areas. Example: "Focus on non-compete scope in §4.2 — broader than typical for HVAC. Also review working capital peg methodology in §3.1."' },
      },
      required: ['dealId', 'deliverableId', 'reviewerRole'],
    },
  },
  {
    name: 'share_document',
    description: 'Share a document with someone — sends them an email with a link to view it in the platform. Use this to share CIMs with buyers, LOIs across the fence, reports with lenders, or any document with anyone. The recipient opens it in-browser on smbx.ai, not as a download.',
    input_schema: {
      type: 'object' as const,
      properties: {
        dealId: { type: 'number', description: 'Deal ID' },
        deliverableId: { type: 'number', description: 'Deliverable to share' },
        recipientEmail: { type: 'string', description: 'Email address of the recipient' },
        recipientName: { type: 'string', description: 'Name of the recipient (for the email)' },
        shareType: { type: 'string', enum: ['external', 'cross_fence', 'internal'], description: 'external = anyone, cross_fence = other side of deal, internal = my team' },
        accessLevel: { type: 'string', enum: ['view', 'comment'], description: 'What the recipient can do. Default: view' },
        authRequired: { type: 'string', enum: ['none', 'email', 'account', 'nda'], description: 'Auth required to view. Use nda for sensitive docs like CIMs.' },
        message: { type: 'string', description: 'Personal message from the sender, included in the email. Yulia should write this contextually.' },
        expiresInDays: { type: 'number', description: 'Days until link expires. Default: no expiration.' },
        downloadEnabled: { type: 'boolean', description: 'Allow download. Default: false.' },
      },
      required: ['dealId', 'deliverableId', 'recipientEmail'],
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
      case 'scan_market':
        return await scanMarket(input, userId);
      case 'enrich_target':
        return await enrichTarget(input, userId);
      case 'get_sourcing_portfolio':
        return await getSourcingPortfolio(input, userId);
      case 'create_model_tab':
        return createModelTab(input);
      case 'update_model':
        return updateModel(input);
      case 'read_tab_state':
        return readTabState(input);
      case 'create_support_issue':
        return await createSupportIssue(input, userId, conversationId);
      case 'query_admin_data':
        return await queryAdminData(input, userId);
      case 'request_review':
        return await requestReviewTool(input, userId);
      case 'share_document':
        return await shareDocumentTool(input, userId);
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

  // Gates are readiness-only — no payment checks here.
  // Subscription is enforced on deliverable generation, not gate advancement.

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

  // Show the pipeline view so user sees their progress
  return JSON.stringify({
    success: true,
    canvas_action: 'open_pipeline',
    title: `${deal.journey_type === 'sell' ? 'Sell' : deal.journey_type === 'buy' ? 'Buy' : deal.journey_type === 'raise' ? 'Raise' : 'PMI'} Journey`,
    newGate: toGate,
    newConversationId: transition?.newConversationId ?? null,
  });
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

  return JSON.stringify({
    success: true,
    canvas_action: 'open_deliverable',
    deliverableId: deliverable.id,
    title: deliverableType.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
    content,
  });
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

    // Build provider summary markdown for canvas display
    const providerLines: string[] = [];
    for (const [provType, providers] of Object.entries(result.recommendations)) {
      if ((providers as any[]).length > 0) {
        providerLines.push(`## ${provType.charAt(0).toUpperCase() + provType.slice(1)}s`);
        for (const p of providers as any[]) {
          providerLines.push(`**${p.name}**${p.firm_name ? ` — ${p.firm_name}` : ''}`);
          const details = [p.location_city, p.location_state].filter(Boolean).join(', ');
          if (details) providerLines.push(`${details}`);
          if (p.practice_areas?.length) providerLines.push(`Practice areas: ${p.practice_areas.join(', ')}`);
          if (p.client_rating) providerLines.push(`Rating: ${p.client_rating}/5`);
          providerLines.push('');
        }
      }
    }

    return JSON.stringify({
      success: true,
      canvas_action: 'show_content',
      title: 'Recommended Providers',
      content: `# Professional Services — ${result.context}\n\n${providerLines.join('\n')}`,
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

  // Build markdown summary for canvas
  const lines: string[] = ['# Buyer Demand Analysis\n'];
  if (result.buyerDemand) {
    lines.push(`**Market Heat:** ${result.buyerDemand.heat || 'Moderate'}\n`);
    if (result.buyerDemand.activeTheses) lines.push(`**Active buyer theses matching your profile:** ${result.buyerDemand.activeTheses}`);
    if (result.buyerDemand.summary) lines.push(`\n${result.buyerDemand.summary}`);
  }

  return JSON.stringify({
    success: true,
    canvas_action: 'show_content',
    title: 'Buyer Demand Analysis',
    content: lines.join('\n'),
    ...result,
  });
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

// ─── Market Intelligence Tools ─────────────────────────────

// Common NAICS lookup by industry keyword
const INDUSTRY_NAICS: Record<string, string> = {
  'hvac': '2382', 'plumbing': '2381', 'electrical': '2382', 'construction': '2389',
  'pest control': '5612', 'landscaping': '5617', 'cleaning': '5617',
  'dental': '6213', 'veterinary': '5413', 'medical': '6211', 'healthcare': '6211',
  'physical therapy': '6213', 'optometry': '6213',
  'restaurant': '7225', 'food': '7225', 'coffee': '7225', 'bar': '7224',
  'auto repair': '8111', 'mechanic': '8111', 'automotive': '8111',
  'salon': '8121', 'barber': '8121', 'spa': '8121',
  'accounting': '5412', 'cpa': '5412', 'law': '5411', 'legal': '5411',
  'insurance': '5242', 'staffing': '5613', 'consulting': '5416',
  'it': '5415', 'msp': '5415', 'software': '5112', 'saas': '5112',
  'ecommerce': '4541', 'retail': '4529', 'grocery': '4451',
  'manufacturing': '3111', 'fitness': '7139', 'gym': '7139',
  'property management': '5312', 'real estate': '5312',
  'home services': '2389', 'roofing': '2381',
};

function inferNaicsCode(industry: string): string {
  const lower = industry.toLowerCase();
  for (const [keyword, code] of Object.entries(INDUSTRY_NAICS)) {
    if (lower.includes(keyword)) return code;
  }
  return '81'; // Default: Other Services
}

async function scanMarket(input: Record<string, any>, _userId: number): Promise<string> {
  const { industry, naicsCode, stateCode, purchasePrice, earnings } = input;
  const naics = naicsCode || inferNaicsCode(industry);
  const results: Record<string, any> = { industry, naicsCode: naics };

  // 1. Market heat
  const heat = await getMarketHeat(industry).catch(() => null);
  if (heat) {
    results.marketHeat = {
      score: heat.score,
      label: heat.label,
      peActivity: heat.peActivity,
      multipleDirection: heat.multipleDirection,
      signals: heat.signals,
    };
  }

  // 2. Census CBP (establishment counts)
  if (stateCode) {
    const cbp = await fetchCBPData(naics, stateCode).catch(() => null);
    if (cbp) {
      results.establishments = {
        count: cbp.establishments,
        employees: cbp.employees,
        avgPayrollPerEmployee: cbp.payrollPerEmployee,
        geography: cbp.geography,
      };
    }
  }

  // 3. Census BDS (firm age / turnover)
  const bds = await fetchBDSData(naics, stateCode).catch(() => null);
  if (bds) {
    results.firmDynamics = {
      totalFirms: bds.totalFirms,
      entryRate: `${bds.entryRate}%`,
      exitRate: `${bds.exitRate}%`,
      netGrowthRate: `${bds.netGrowthRate}%`,
      firmAgeDistribution: bds.firmAgeDistribution,
    };
  }

  // 4. SBA lending stats
  const sba = await getSBALendingStats(naics, stateCode).catch(() => null);
  if (sba) {
    results.sbaLending = {
      context: sba.context,
      avgLoan: sba.avgLoanCents > 0 ? `$${(sba.avgLoanCents / 100).toLocaleString()}` : null,
      approvalRate: sba.approvalRate ? `${sba.approvalRate}%` : null,
      avgTermMonths: sba.avgTermMonths,
    };
  }

  // 5. SBA bankability if price/earnings provided
  if (purchasePrice && earnings) {
    const bankability = await calculateSBABankability({
      purchasePrice: purchasePrice / 100, // cents → dollars
      ebitdaOrSde: earnings / 100,
    }).catch(() => null);
    if (bankability) {
      results.sbaBankability = {
        eligible: bankability.eligible,
        dscr: bankability.dscr,
        ltv: bankability.ltv,
        monthlyPayment: `$${bankability.monthlyPayment.toLocaleString()}`,
        reasoning: bankability.reasoning,
      };
    }
  }

  // 6. Active buyer theses on platform
  try {
    const theses = await sql`
      SELECT COUNT(*)::int as cnt FROM buyer_theses
      WHERE status = 'active' AND (
        industries::text ILIKE ${`%${industry}%`}
        OR target_description ILIKE ${`%${industry}%`}
      )
    `;
    results.platformBuyerTheses = parseInt(theses[0]?.cnt || '0');
  } catch { results.platformBuyerTheses = 0; }

  // 7. Active listings on platform
  try {
    const listings = await sql`
      SELECT COUNT(*)::int as cnt FROM listings
      WHERE status = 'active' AND (
        industry ILIKE ${`%${industry}%`}
        OR title ILIKE ${`%${industry}%`}
      )
    `;
    results.platformListings = parseInt(listings[0]?.cnt || '0');
  } catch { results.platformListings = 0; }

  // Build summary
  const summaryParts: string[] = [];
  if (heat) summaryParts.push(`Market heat: ${heat.label} (${heat.score}/5)`);
  if (results.establishments) summaryParts.push(`${results.establishments.count.toLocaleString()} establishments in area`);
  if (bds) summaryParts.push(`Firm exit rate: ${bds.exitRate}% (potential acquisition targets)`);
  if (sba?.avgLoanCents) summaryParts.push(`Avg SBA loan: $${(sba.avgLoanCents / 100).toLocaleString()}`);
  results.summary = summaryParts.join('. ') + '.';

  return JSON.stringify({ success: true, ...results });
}

async function enrichTarget(input: Record<string, any>, userId: number): Promise<string> {
  const { companyProfileId, websiteUrl } = input;

  let url = websiteUrl;
  let profileId = companyProfileId;

  // If profileId given, look up stored website
  if (profileId && !url) {
    const [profile] = await sql`SELECT website FROM company_profiles WHERE id = ${profileId}`;
    if (!profile?.website) return JSON.stringify({ error: 'No website URL on file for this company' });
    url = profile.website;
  }

  if (!url) return JSON.stringify({ error: 'Provide websiteUrl or companyProfileId with a stored website' });

  const enrichment = await enrichCompanyWebsite(url, profileId || undefined);
  if (!enrichment) return JSON.stringify({ error: 'Could not enrich website — may be unreachable or blocked' });

  return JSON.stringify({ success: true, ...enrichment });
}

// ─── Sourcing Portfolio Tool ──────────────────────────────────

async function getSourcingPortfolio(input: Record<string, any>, userId: number): Promise<string> {
  const { thesisId } = input;

  // Find the portfolio
  let portfolio;
  if (thesisId) {
    [portfolio] = await sql`
      SELECT p.*, b.narrative_markdown
      FROM sourcing_portfolios p
      LEFT JOIN sourcing_briefs b ON b.id = p.brief_id
      WHERE p.thesis_id = ${thesisId} AND p.user_id = ${userId}
      ORDER BY p.created_at DESC LIMIT 1
    `;
  } else {
    [portfolio] = await sql`
      SELECT p.*, b.narrative_markdown
      FROM sourcing_portfolios p
      LEFT JOIN sourcing_briefs b ON b.id = p.brief_id
      WHERE p.user_id = ${userId} AND p.pipeline_status = 'ready'
      ORDER BY p.updated_at DESC LIMIT 1
    `;
  }

  if (!portfolio) {
    // Check if they have theses but no portfolio
    const theses = await sql`
      SELECT id, name, industry, geography FROM buyer_theses
      WHERE user_id = ${userId} AND status = 'active'
      ORDER BY updated_at DESC LIMIT 5
    `;
    if (theses.length > 0) {
      return JSON.stringify({
        hasPortfolio: false,
        message: `You have ${theses.length} active acquisition ${theses.length === 1 ? 'thesis' : 'theses'} but haven't run the sourcing pipeline yet. Open the Sourcing panel and click "Generate Intelligence Brief" on a thesis to start.`,
        theses: theses.map((t: any) => ({ id: t.id, name: t.name, industry: t.industry, geography: t.geography })),
      });
    }
    return JSON.stringify({
      hasPortfolio: false,
      message: 'No acquisition theses or sourcing portfolios found. Create a buy thesis first by telling me about what kind of business you want to acquire.',
    });
  }

  // Get top A-tier candidates
  const topCandidates = await sql`
    SELECT name, city, state, total_score, tier, rating, review_count,
           ai_summary, ai_score_summary, pipeline_status, year_founded,
           estimated_revenue_low_cents, estimated_revenue_high_cents,
           sba_match, succession_signals
    FROM sourcing_candidates
    WHERE portfolio_id = ${portfolio.id} AND tier = 'A'
    ORDER BY total_score DESC
    LIMIT 5
  `;

  // Get pipeline status counts
  const [statusCounts] = await sql`
    SELECT
      COUNT(*) FILTER (WHERE pipeline_status = 'pursuing')::int as pursuing,
      COUNT(*) FILTER (WHERE pipeline_status = 'reviewing')::int as reviewing,
      COUNT(*) FILTER (WHERE pipeline_status = 'contacted')::int as contacted,
      COUNT(*) FILTER (WHERE pipeline_status = 'new')::int as new_count
    FROM sourcing_candidates
    WHERE portfolio_id = ${portfolio.id}
  `;

  // Get recently changed candidates (last 7 days)
  const recentChanges = await sql`
    SELECT name, city, state, pipeline_status, pipeline_status_changed_at
    FROM sourcing_candidates
    WHERE portfolio_id = ${portfolio.id}
      AND pipeline_status_changed_at > NOW() - INTERVAL '7 days'
      AND pipeline_status != 'new'
    ORDER BY pipeline_status_changed_at DESC
    LIMIT 5
  `;

  const formatRevenue = (low: number | null, high: number | null) => {
    if (!low && !high) return null;
    const fmt = (c: number) => c >= 100000000 ? `$${(c / 100000000).toFixed(1)}M` : `$${(c / 100000).toFixed(0)}K`;
    if (low && high) return `${fmt(low)}–${fmt(high)}`;
    return low ? `${fmt(low)}+` : `up to ${fmt(high!)}`;
  };

  return JSON.stringify({
    hasPortfolio: true,
    canvas_action: 'open_sourcing',
    title: portfolio.name || 'Sourcing Pipeline',
    portfolioName: portfolio.name,
    pipelineStatus: portfolio.pipeline_status,
    stats: {
      total: portfolio.total_candidates,
      aTier: portfolio.a_tier_count,
      bTier: portfolio.b_tier_count,
      cTier: portfolio.c_tier_count,
      pursuing: statusCounts.pursuing,
      reviewing: statusCounts.reviewing,
      contacted: statusCounts.contacted,
      newUnreviewed: statusCounts.new_count,
    },
    briefSummary: portfolio.narrative_markdown ? portfolio.narrative_markdown.slice(0, 500) : null,
    topATierCandidates: (topCandidates as any[]).map(c => ({
      name: c.name,
      location: [c.city, c.state].filter(Boolean).join(', '),
      score: c.total_score,
      rating: c.rating ? `${parseFloat(c.rating).toFixed(1)}/5` : null,
      reviews: c.review_count,
      founded: c.year_founded,
      estRevenue: formatRevenue(c.estimated_revenue_low_cents, c.estimated_revenue_high_cents),
      status: c.pipeline_status,
      sbaHistory: c.sba_match || false,
      exitSignals: (c.succession_signals || []).length > 0,
      summary: c.ai_score_summary || c.ai_summary,
    })),
    recentActivity: (recentChanges as any[]).map(c => ({
      name: c.name,
      location: [c.city, c.state].filter(Boolean).join(', '),
      status: c.pipeline_status,
      changedAt: c.pipeline_status_changed_at,
    })),
  });
}

// ─── Interactive Model Tools ──────────────────────────────────

/**
 * These tools return canvas_action instructions that the frontend
 * applies to the zustand model store. The server doesn't run the
 * calculations — they're deterministic pure functions on the client.
 */

function createModelTab(input: Record<string, any>): string {
  const { modelType, title, initialAssumptions } = input;

  return JSON.stringify({
    success: true,
    canvas_action: 'create_model_tab',
    modelType,
    title,
    initialAssumptions: initialAssumptions || {},
    message: `I've opened a ${title} model on your canvas. You can adjust the assumptions with the sliders, or tell me what to change.`,
  });
}

function updateModel(input: Record<string, any>): string {
  const { tabId, updates } = input;

  return JSON.stringify({
    success: true,
    canvas_action: 'update_model',
    tabId: tabId || 'active',
    updates: updates || {},
    message: `I've updated the model. The canvas recalculated instantly — take a look at the new numbers.`,
  });
}

function readTabState(input: Record<string, any>): string {
  // This tool's response is handled by the frontend — it injects
  // the current tab state into the next prompt so Yulia can reference it.
  // The server returns a placeholder; the SSE handler on the frontend
  // intercepts this and injects actual tab state.
  return JSON.stringify({
    success: true,
    canvas_action: 'read_tab_state',
    tabId: input.tabId || 'active',
    message: 'Reading canvas state...',
    note: 'The frontend will inject actual model state into this response before Yulia sees it.',
  });
}

// ─── Support Issue Tool ───────────────────────────────────

async function createSupportIssue(
  input: Record<string, any>,
  userId: number,
  conversationId: number,
): Promise<string> {
  const { type, title, description, severity, userMessage } = input;

  // Auto-capture context
  let dealId: number | null = null;
  let context: Record<string, any> = {};

  try {
    // Get deal from conversation
    const [conv] = await sql`
      SELECT deal_id, journey_context, current_gate FROM conversations WHERE id = ${conversationId}
    `;
    if (conv) {
      dealId = conv.deal_id;
      context.journey = conv.journey_context;
      context.gate = conv.current_gate;
    }

    // Get deal details if available
    if (dealId) {
      const [deal] = await sql`
        SELECT business_name, industry, league, revenue, sde, ebitda
        FROM deals WHERE id = ${dealId}
      `;
      if (deal) {
        context.deal = {
          name: deal.business_name,
          industry: deal.industry,
          league: deal.league,
          revenue: deal.revenue,
          sde: deal.sde,
          ebitda: deal.ebitda,
        };
      }
    }

    // Get user subscription
    const [sub] = await sql`
      SELECT plan, status FROM subscriptions WHERE user_id = ${userId}
    `.catch(() => [null]);
    if (sub) context.subscription = sub.plan;

    context.timestamp = new Date().toISOString();
    context.conversationId = conversationId;
  } catch {
    // Context capture is best-effort — don't fail the ticket creation
  }

  // Create the issue
  const [issue] = await sql`
    INSERT INTO support_issues (user_id, deal_id, conversation_id, type, severity, title, description, user_message, context)
    VALUES (${userId}, ${dealId}, ${conversationId}, ${type}, ${severity}, ${title}, ${description}, ${userMessage || null}, ${JSON.stringify(context)}::jsonb)
    RETURNING id, type, severity
  `;

  const ref = `#${issue.id}`;
  const typeLabel = type === 'feature_request' ? 'feature request' : type === 'system_error' ? 'system issue' : type;

  return JSON.stringify({
    success: true,
    issueId: issue.id,
    reference: ref,
    message: type === 'feature_request'
      ? `I've captured that as ${ref}. Good idea — I've logged it with your deal context so we understand the use case.`
      : `I've logged this as ${ref}. Paul will look into it. In the meantime, let's keep working on everything else.`,
  });
}

// ─── Admin Query Tool ────────────────────────────────────────

const ADMIN_EMAILS = ['paulbryantbaker@gmail.com'];

async function queryAdminData(input: Record<string, any>, userId: number): Promise<string> {
  // Verify admin
  const [user] = await sql`SELECT email, role FROM users WHERE id = ${userId}`;
  if (!user || (user.role !== 'admin' && !ADMIN_EMAILS.includes(user.email))) {
    return JSON.stringify({ error: 'Admin access required' });
  }

  const { query, timeRange = '7d', limit = 20 } = input;
  const interval = { '24h': '24 hours', '7d': '7 days', '30d': '30 days', '90d': '90 days' }[timeRange] || '7 days';

  switch (query) {
    case 'metrics_overview': {
      const [users] = await sql`SELECT COUNT(*)::int as total FROM users`;
      const [active] = await sql`
        SELECT COUNT(DISTINCT user_id)::int as c FROM conversations
        WHERE updated_at > NOW() - INTERVAL ${interval} AND user_id IS NOT NULL
      `;
      const [deals] = await sql`SELECT COUNT(*)::int as total FROM deals WHERE status = 'active'`;
      const [mrr] = await sql`
        SELECT COALESCE(SUM(CASE
          WHEN plan = 'starter' THEN 4900 WHEN plan = 'professional' THEN 14900 WHEN plan = 'enterprise' THEN 99900 ELSE 0
        END), 0)::bigint as mrr_cents FROM subscriptions WHERE status IN ('active', 'trialing')
      `;
      const [msgs] = await sql`SELECT COUNT(*)::int as c FROM messages WHERE created_at > NOW() - INTERVAL ${interval}`;
      const [delivs] = await sql`SELECT COUNT(*)::int as c FROM deliverables WHERE created_at > NOW() - INTERVAL ${interval}`;
      const [errors] = await sql`
        SELECT COUNT(*)::int as c FROM support_issues WHERE type = 'system_error' AND created_at > NOW() - INTERVAL '24 hours'
      `;
      return JSON.stringify({
        totalUsers: users.total, activeUsers: active.c, activeDeals: deals.total,
        mrrCents: Number(mrr.mrr_cents), messages: msgs.c, deliverables: delivs.c,
        errors24h: errors.c, timeRange,
      });
    }

    case 'conversion_funnel': {
      const [total] = await sql`SELECT COUNT(*)::int as c FROM users`;
      const [withConv] = await sql`SELECT COUNT(DISTINCT user_id)::int as c FROM conversations WHERE user_id IS NOT NULL`;
      const [with3Msg] = await sql`
        SELECT COUNT(DISTINCT c.user_id)::int as c FROM conversations c
        JOIN (SELECT conversation_id, COUNT(*)::int as cnt FROM messages GROUP BY conversation_id HAVING COUNT(*) >= 3) m
        ON m.conversation_id = c.id WHERE c.user_id IS NOT NULL
      `;
      const [withDeal] = await sql`SELECT COUNT(DISTINCT user_id)::int as c FROM deals`;
      const [withDeliv] = await sql`SELECT COUNT(DISTINCT user_id)::int as c FROM deliverables`;
      const [withSub] = await sql`SELECT COUNT(DISTINCT user_id)::int as c FROM subscriptions WHERE status IN ('active', 'trialing')`;
      return JSON.stringify({
        funnel: [
          { stage: 'Registered', count: total.c },
          { stage: 'First Conversation', count: withConv.c },
          { stage: '3+ Messages', count: with3Msg.c },
          { stage: 'Deal Created', count: withDeal.c },
          { stage: 'Deliverable Generated', count: withDeliv.c },
          { stage: 'Subscribed', count: withSub.c },
        ],
      });
    }

    case 'journey_distribution': {
      const journeys = await sql`
        SELECT journey_type, COUNT(*)::int as count,
               AVG(CASE WHEN current_gate ~ '[0-9]' THEN CAST(SUBSTRING(current_gate FROM '[0-9]+') AS INTEGER) ELSE 0 END)::numeric(3,1) as avg_gate
        FROM deals WHERE status = 'active' GROUP BY journey_type ORDER BY count DESC
      `;
      return JSON.stringify({ journeys });
    }

    case 'gate_heatmap': {
      const gates = await sql`
        SELECT current_gate, COUNT(*)::int as count FROM deals
        WHERE status = 'active' AND current_gate IS NOT NULL
        GROUP BY current_gate ORDER BY current_gate
      `;
      return JSON.stringify({ gates });
    }

    case 'revenue_breakdown': {
      const breakdown = await sql`
        SELECT plan, status, COUNT(*)::int as count FROM subscriptions GROUP BY plan, status ORDER BY plan
      `;
      const [mrr] = await sql`
        SELECT COALESCE(SUM(CASE
          WHEN plan = 'starter' THEN 4900 WHEN plan = 'professional' THEN 14900 WHEN plan = 'enterprise' THEN 99900 ELSE 0
        END), 0)::bigint as mrr_cents FROM subscriptions WHERE status IN ('active', 'trialing')
      `;
      return JSON.stringify({ breakdown, mrrCents: Number(mrr.mrr_cents) });
    }

    case 'engagement_7d': {
      const [msgs] = await sql`SELECT COUNT(*)::int as c FROM messages WHERE created_at > NOW() - INTERVAL ${interval}`;
      const [delivs] = await sql`SELECT COUNT(*)::int as c FROM deliverables WHERE created_at > NOW() - INTERVAL ${interval}`;
      const events = await sql`
        SELECT event_type, COUNT(*)::int as c FROM analytics_events
        WHERE created_at > NOW() - INTERVAL ${interval}
        GROUP BY event_type ORDER BY c DESC LIMIT 20
      `;
      return JSON.stringify({ messages: msgs.c, deliverables: delivs.c, topEvents: events, timeRange });
    }

    case 'open_issues': {
      const issues = await sql`
        SELECT si.id, si.type, si.severity, si.title, si.status, si.created_at,
               u.email as user_email, d.business_name
        FROM support_issues si
        LEFT JOIN users u ON u.id = si.user_id
        LEFT JOIN deals d ON d.id = si.deal_id
        WHERE si.status = 'open'
        ORDER BY CASE si.severity WHEN 'critical' THEN 0 WHEN 'major' THEN 1 WHEN 'minor' THEN 2 ELSE 3 END,
                 si.created_at DESC
        LIMIT ${limit}
      `;
      const [stats] = await sql`
        SELECT COUNT(*) FILTER (WHERE status = 'open')::int as open_total,
               COUNT(*) FILTER (WHERE status = 'open' AND severity = 'critical')::int as critical
        FROM support_issues
      `;
      return JSON.stringify({ issues, openTotal: stats.open_total, critical: stats.critical });
    }

    case 'critical_issues': {
      const issues = await sql`
        SELECT si.id, si.type, si.severity, si.title, si.description, si.status, si.created_at,
               u.email as user_email, d.business_name, si.context
        FROM support_issues si
        LEFT JOIN users u ON u.id = si.user_id
        LEFT JOIN deals d ON d.id = si.deal_id
        WHERE si.severity = 'critical' AND si.status != 'resolved'
        ORDER BY si.created_at DESC LIMIT ${limit}
      `;
      return JSON.stringify({ issues });
    }

    case 'feature_requests': {
      const features = await sql`
        SELECT si.id, si.title, si.description, si.user_message, si.severity, si.status, si.created_at,
               u.email as user_email
        FROM support_issues si
        LEFT JOIN users u ON u.id = si.user_id
        WHERE si.type = 'feature_request'
        ORDER BY si.created_at DESC LIMIT ${limit}
      `;
      return JSON.stringify({ features });
    }

    case 'recent_errors': {
      const errors = await sql`
        SELECT si.id, si.title, si.description, si.severity, si.created_at, si.context,
               u.email as user_email
        FROM support_issues si
        LEFT JOIN users u ON u.id = si.user_id
        WHERE si.type = 'system_error' AND si.created_at > NOW() - INTERVAL ${interval}
        ORDER BY si.created_at DESC LIMIT ${limit}
      `;
      return JSON.stringify({ errors, timeRange });
    }

    case 'user_growth': {
      const growth = await sql`
        SELECT DATE_TRUNC('day', created_at)::date as day, COUNT(*)::int as signups
        FROM users WHERE created_at > NOW() - INTERVAL ${interval}
        GROUP BY day ORDER BY day
      `;
      const [total] = await sql`SELECT COUNT(*)::int as c FROM users`;
      return JSON.stringify({ dailySignups: growth, totalUsers: total.c, timeRange });
    }

    case 'service_health': {
      const services = await sql`
        SELECT related_service, COUNT(*)::int as error_count, MAX(created_at) as last_error
        FROM support_issues WHERE type = 'system_error' AND created_at > NOW() - INTERVAL '24 hours'
        GROUP BY related_service
      `;
      const [dbCheck] = await sql`SELECT 1 as ok`;
      return JSON.stringify({
        database: dbCheck ? 'healthy' : 'error',
        services: services || [],
        timestamp: new Date().toISOString(),
      });
    }

    default:
      return JSON.stringify({ error: `Unknown query: ${query}` });
  }
}

// ─── Review Request Tool ──────────────────────────────────────────

async function requestReviewTool(input: Record<string, any>, userId: number): Promise<string> {
  const { dealId, deliverableId, reviewerRole, focusAreas } = input;

  // Verify deal ownership
  const [deal] = await sql`SELECT id, business_name FROM deals WHERE id = ${dealId} AND user_id = ${userId}`;
  if (!deal) return JSON.stringify({ error: 'Deal not found' });

  // Find a participant with the specified role
  const [reviewer] = await sql`
    SELECT dp.user_id, u.display_name, u.email, dp.role
    FROM deal_participants dp
    JOIN users u ON u.id = dp.user_id
    WHERE dp.deal_id = ${dealId} AND dp.role = ${reviewerRole} AND dp.accepted_at IS NOT NULL
    LIMIT 1
  `;

  if (!reviewer) {
    return JSON.stringify({
      error: `No ${reviewerRole} found on this deal. Invite one first.`,
      suggestion: `The deal needs a ${reviewerRole}. Ask the user to invite one by sharing their email.`,
    });
  }

  // Create the review request
  const { createReviewRequest } = await import('./reviewService.js');
  const review = await createReviewRequest({
    dealId,
    deliverableId,
    requestedBy: userId,
    reviewerId: reviewer.user_id,
    reviewerRole: reviewer.role,
    focusAreas,
  });

  const reviewerName = reviewer.display_name || reviewer.email.split('@')[0];

  return JSON.stringify({
    success: true,
    canvas_action: 'open_deliverable',
    deliverableId,
    title: 'Document Under Review',
    reviewId: review.id,
    reviewerName,
    reviewerRole,
    message: `Review request sent to ${reviewerName} (${reviewerRole}). They'll be notified via email and in-app.`,
  });
}

// ─── Share Document Tool ──────────────────────────────────────────

async function shareDocumentTool(input: Record<string, any>, userId: number): Promise<string> {
  const {
    dealId, deliverableId, recipientEmail, recipientName,
    shareType, accessLevel, authRequired, message,
    expiresInDays, downloadEnabled,
  } = input;

  // Verify deal access
  const [deal] = await sql`SELECT id, business_name FROM deals WHERE id = ${dealId} AND user_id = ${userId}`;
  if (!deal) return JSON.stringify({ error: 'Deal not found' });

  // Get doc title for response
  let docTitle = 'Document';
  if (deliverableId) {
    const [d] = await sql`
      SELECT m.name FROM deliverables del
      LEFT JOIN menu_items m ON m.id = del.menu_item_id
      WHERE del.id = ${deliverableId}
    `;
    docTitle = d?.name || 'Document';
  }

  const { createDocumentShare } = await import('./documentShareService.js');
  const result = await createDocumentShare({
    dealId,
    deliverableId,
    sharedBy: userId,
    shareType: shareType || 'external',
    accessLevel: accessLevel || 'view',
    authRequired: authRequired || 'none',
    downloadEnabled: downloadEnabled ?? false,
    expiresInDays,
    recipientEmail,
    recipientName,
    message,
  });

  const name = recipientName || recipientEmail.split('@')[0];

  return JSON.stringify({
    success: true,
    shareUrl: result.shareUrl,
    recipientEmail,
    recipientName: name,
    docTitle,
    message: `Shared "${docTitle}" with ${name} at ${recipientEmail}. They'll receive an email with a link to view it on smbx.ai.`,
  });
}
