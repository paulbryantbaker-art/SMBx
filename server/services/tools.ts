import type { Tool } from '@anthropic-ai/sdk/resources/messages';
import { createHash } from 'crypto';
import { isSuperAdminUser } from '../adminAccess.js';
import { createSql } from '../dbConfig.js';
import { resolveDefinitiveMandateContext } from './definitiveMandateService.js';
import {
  DEFINITIVE_METHODOLOGY_URI,
  DEFINITIVE_METHODOLOGY_VERSION,
  DEFINITIVE_SPEC_URI,
  DEFINITIVE_SPEC_VERSION,
} from '../constants/definitive.js';
import { classifyV19LeagueFromCents, type League } from '../constants/v19Leagues.js';
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
import { enqueueDeliverableGeneration } from './jobQueue.js';
import { processDeliverable } from './deliverableProcessor.js';
import { canGenerateDeliverable, markFreeDeliverableUsed } from './subscriptionService.js';
import { hasDealAccess } from './dealAccessService.js';
import { TOOL_NAMES_REQUIRING_CONFIRMATION } from './agencyActionRegistry.js';
import { createAnalysisRun, createModelTabRecord, readAnalysisRunSnapshot, readModelTabState, updateAnalysisRunSnapshot, updateModelTabState } from './analysisRuntime.js';
import { buildDealComparisonAnalysis, buildDeterministicAnalysis } from './deterministicAnalysisEngine.js';
import type { DeterministicDealRow } from './deterministicAnalysisEngine.js';
import {
  ensureMarketIntelligenceProfileForDeal,
  enrichAnalysisWithMarketIntelligenceProfile,
  queueIndustryDeepResearchJob,
  summarizeMarketIntelligenceProfile,
} from './marketIntelligenceRuntime.js';
import {
  addPitchBookSection,
  createPitchBook,
  getPitchBookModelIds,
  getPitchBook,
  refreshPitchBookFromModels,
  revisePitchBook,
} from './pitchBookStudio.js';
import { composeModelStack, normalizeDefinitiveStackSignals, type V19Journey } from './modelStackComposer.js';
import { getDefinitiveModelSlotSurface } from './definitiveModelCatalogSurface.js';
import { executeV19Model, persistV19ModelExecution } from './v19ModelRuntime.js';
import { validateCitationTags } from './citationValidator.js';
import { lookupAuthority } from './authorityRegister.js';
import { readDealV19Readiness, readStudioBookV19Readiness } from './v19ReadinessService.js';
import {
  checkV19Entitlement,
  formatV19TollgateForYulia,
  readV19UsageMeter,
  recordV19UsageEvent,
  type V19EntitlementCheck,
} from './v19EntitlementService.js';
import { upsertFirmMemory, type FirmMemoryType } from './todayOperatingService.js';
import {
  buildModelFreshnessEnvelope,
  extractAssumptionsFromModelExecution,
} from '../../shared/modelStaleness.js';

const sql = createSql();

// ─── Tool Definitions (for Claude API) ─────────────────────

export const TOOL_DEFINITIONS: Tool[] = [
  {
    name: 'create_deal',
    description: 'Create a new deal for the current user. Call this PROACTIVELY within the first 2-3 messages when the user mentions a real business or transaction. Don\'t wait for explicit "I want to sell" — if they share financials, mention their company, or describe a deal situation, create the deal immediately. Infer the journey type from context.',
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
    name: 'generate_deal_deliverable',
    description: 'Generate a real paid or included deal deliverable from the menu catalog. Use when the user asks Yulia to draft or run a deliverable such as an LOI, CIM, valuation, SBA analysis, buyer list, pitch deck, DD summary, or data-room structure. This queues generation and opens the live document tab.',
    input_schema: {
      type: 'object' as const,
      properties: {
        dealId: { type: 'number', description: 'Deal ID' },
        menuItemSlug: { type: 'string', description: 'Menu item slug, for example buy-loi-draft, sell-cim, sell-valuation-report, buy-sba-bankability, raise-pitch-deck, pmi-100-day-plan' },
        modelPreference: { type: 'string', enum: ['auto', 'fast', 'deep', 'drafting', 'research'], description: 'Optional model preference. Auto is default.' },
      },
      required: ['dealId', 'menuItemSlug'],
    },
  },
  {
    name: 'generate_output_doc',
    description: 'Agent-friendly document generation contract. Use when an external agent or Yulia asks for a business output by normal name, such as term_sheet, loi, ioi, diligence_request, funds_flow, data_room_index, negotiation_brief, pmi_plan, CIM, or IC memo. The tool resolves the internal menu item, queues the document, returns a Studio/Doc tab action, and includes model-dependency context so the agent does not need to know smbX menu slugs.',
    input_schema: {
      type: 'object' as const,
      properties: {
        dealId: { type: 'number', description: 'Deal ID' },
        documentType: { type: 'string', description: 'Human/agent-facing document type, for example term_sheet, loi, ioi, diligence_request, funds_flow, data_room_index, negotiation_brief, pmi_plan, cim, ic_memo, or valuation_report.' },
        audience: { type: 'string', description: 'Optional audience label, such as internal_deal_team, counsel, lender, seller, buyer, board, or investor.' },
        purpose: { type: 'string', description: 'Optional purpose or drafting objective.' },
        sourceModelExecutionIds: { type: 'array', items: { type: 'number' }, description: 'Optional saved model execution IDs this document should rely on.' },
        currentAssumptions: { type: 'object', description: 'Optional current assumptions for freshness checking before drafting.' },
        requireFreshModels: { type: 'boolean', description: 'When true, return a model refresh gate instead of generating if dependencies are missing, stale, superseded, or unknown.' },
        modelPreference: { type: 'string', enum: ['auto', 'fast', 'deep', 'drafting', 'research'], description: 'Optional model preference. Auto is default.' },
      },
      required: ['dealId', 'documentType'],
    },
  },
  {
    name: 'create_pitch_book',
    description: 'Create a source-grounded Pitch Book Studio book for a deal or blank mandate. Use for buyer pitch books, seller pitch books, IC decks, QoE preview books, CIM summary decks, board updates, and lender books. Returns a persisted Studio book with slide-level provenance.',
    input_schema: {
      type: 'object' as const,
      properties: {
        dealId: { type: 'number', description: 'Optional deal ID to ground the book in current deal facts and files.' },
        format: {
          type: 'string',
          enum: ['buyer-pitch-book', 'seller-pitch-book', 'ic-deck', 'qoe-preview-book', 'cim-summary-deck', 'board-update', 'lender-book'],
          description: 'Pitch book format.',
        },
        title: { type: 'string', description: 'Optional book title.' },
        brief: { type: 'string', description: 'User mandate or story instructions.' },
      },
      required: ['format'],
    },
  },
  {
    name: 'revise_pitch_book',
    description: 'Revise an existing Pitch Book Studio book by creating a new version with a revision instruction tracked in the audit trail.',
    input_schema: {
      type: 'object' as const,
      properties: {
        bookId: { type: 'number', description: 'Studio pitch book ID.' },
        instruction: { type: 'string', description: 'Revision instruction from the user.' },
      },
      required: ['bookId', 'instruction'],
    },
  },
  {
    name: 'add_pitch_book_section',
    description: 'Add a new section/slide to a Pitch Book Studio book. New sections are flagged as needing source review until grounded.',
    input_schema: {
      type: 'object' as const,
      properties: {
        bookId: { type: 'number', description: 'Studio pitch book ID.' },
        title: { type: 'string', description: 'New slide or section title.' },
        body: { type: 'string', description: 'Optional draft body.' },
        bullets: { type: 'array', items: { type: 'string' }, description: 'Optional bullets.' },
      },
      required: ['bookId', 'title'],
    },
  },
  {
    name: 'refresh_pitch_book_from_models',
    description: 'Refresh a Pitch Book Studio book against linked model outputs. Until the full V19 server runtime is complete, this flags linked model slots as stale and creates a new audited version.',
    input_schema: {
      type: 'object' as const,
      properties: {
        bookId: { type: 'number', description: 'Studio pitch book ID.' },
      },
      required: ['bookId'],
    },
  },
  {
    name: 'export_pitch_book',
    description: 'Prepare a Pitch Book Studio export. Returns authenticated download URLs for PPTX and PDF. Use after the user asks to export or share a pitch book.',
    input_schema: {
      type: 'object' as const,
      properties: {
        bookId: { type: 'number', description: 'Studio pitch book ID.' },
        format: { type: 'string', enum: ['pptx', 'pdf'], description: 'Preferred export format.' },
      },
      required: ['bookId', 'format'],
    },
  },
  {
    name: 'compose_model_stack',
    description: 'Compose and persist the canonical V19 model stack for a deal using journey, league, deal type, industry, and jurisdiction. Also evaluates DEFINITIVE v1.1/V20 overlay gates G28 distressed/restructuring, G29 capital structure/liability management, and G30 real estate/asset-class overlays, then returns applicable M101-M223 mechanics with readiness, tool surfaces, and THE LINE boundaries without treating unimplemented catalog models as executable.',
    input_schema: {
      type: 'object' as const,
      properties: {
        dealId: { type: 'number', description: 'Deal ID to compose the stack for.' },
        journey: { type: 'string', enum: ['sell', 'buy', 'raise', 'pmi'], description: 'Optional override when the deal journey is missing.' },
        league: { type: 'string', enum: ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9', 'L10'], description: 'Optional override when the deal league is missing.' },
        dealType: { type: 'string', description: 'Optional deal type or structure override.' },
        signals: {
          type: 'object',
          description: 'Optional deterministic V20 routing signals for G28/G29/G30, such as cashRunwayDays, fccr, securedDebtTradingPriceCents, maintenanceCovenantBreachWithinQuarters, realEstatePercentOfEv, digitalAssetsPercentOfEv, solvencyProngFailed, bankruptcyFilingPending, rsaInMarket, forbearanceExecuted, capitalStructureAction, liabilityManagementExercise, recapitalization, exchangeOffer, and covenantAmendment.',
        },
      },
      required: ['dealId'],
    },
  },
  {
    name: 'execute_model',
    description: 'Execute a deterministic server-side V19 model by MODEL.*.v1 id. Returns outputs, missing inputs, citation tags, output hash, and audit payload.',
    input_schema: {
      type: 'object' as const,
      properties: {
        modelId: { type: 'string', description: 'Canonical runtime model ID, for example MODEL.VAL.EBITDA.v1, or a public DEFINITIVE M-slot such as M200 when that slot has an executable runtime model.' },
        modelSlotId: { type: 'string', description: 'Optional public DEFINITIVE M-slot ID, such as M109, M148, M200, M206, or M221. The tool resolves it to implementedRuntimeModelId when available.' },
        input: { type: 'object', description: 'Model inputs. Financial values must be cents.' },
        dealId: { type: 'number', description: 'Optional deal ID for audit context.' },
      },
      required: ['input'],
    },
  },
  {
    name: 'run_model_iteration',
    description: 'Agent-friendly model execution contract. Run a first model pass or rerun a saved model execution with overrides. Returns a persisted execution ID, output hash, parent-output lineage, missing inputs, citations, and next_suggested_calls so agents can iteratively work the deal rather than treating modeling as one-and-done.',
    input_schema: {
      type: 'object' as const,
      properties: {
        dealId: { type: 'number', description: 'Optional deal ID for audit context.' },
        modelId: { type: 'string', description: 'Canonical MODEL.*.v1 id or public DEFINITIVE M-slot ID. Optional when executionId or modelSlotId is supplied.' },
        modelSlotId: { type: 'string', description: 'Optional public DEFINITIVE M-slot ID, such as M109, M148, M200, M206, or M221. The tool resolves it to implementedRuntimeModelId when available.' },
        executionId: { type: 'number', description: 'Optional prior model execution ID to rerun from.' },
        input: { type: 'object', description: 'New model inputs. Financial values must be cents.' },
        overrides: { type: 'object', description: 'Assumption overrides layered on top of the prior execution inputs.' },
        reason: { type: 'string', description: 'Why this iteration is being run, for audit and version history.' },
      },
    },
  },
  {
    name: 'lookup_citation',
    description: 'Look up a DEFINITIVE authority id or V19 citation tag from the Authority Register / citation registry and report whether it is active.',
    input_schema: {
      type: 'object' as const,
      properties: {
        citeTag: { type: 'string', description: 'Citation tag, such as [FRED:DPRIME] or [SBA SOP 50 10 8].' },
        authorityId: { type: 'string', description: 'Optional DEFINITIVE authority id, such as AUTH.FRED.DPRIME.' },
      },
      required: [],
    },
  },
  {
    name: 'fetch_market_data',
    description: 'Fetch the latest cached V19 market data series from market_data_cache.',
    input_schema: {
      type: 'object' as const,
      properties: {
        seriesId: { type: 'string', description: 'Market data series ID, for example SOFR, DPRIME, or DGS10.' },
      },
      required: ['seriesId'],
    },
  },
  {
    name: 'read_v19_readiness',
    description: 'Read V19 readiness for a deal gate and/or Studio book before making model-backed claims, exporting collateral, or deciding whether sources/models/citations need refresh.',
    input_schema: {
      type: 'object' as const,
      properties: {
        dealId: { type: 'number', description: 'Optional deal ID for gate/model/citation readiness.' },
        bookId: { type: 'number', description: 'Optional Studio book ID for export/source/model readiness.' },
      },
    },
  },
  {
    name: 'read_v19_entitlements',
    description: 'Read the user plan entitlements, current monthly V19 usage meter, and available tollgate states for model runs, Studio books, exports, API/MCP access, and agent usage.',
    input_schema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'update_firm_memory',
    description: 'Create or update a reusable Firm Memory item such as a preferred assumption, house style rule, provider preference, prior-deal pattern, or standard workflow. Use only for durable facts/preferences the user wants Yulia to remember.',
    input_schema: {
      type: 'object' as const,
      properties: {
        memoryType: {
          type: 'string',
          enum: ['assumption', 'house_style', 'provider', 'deal_pattern', 'workflow'],
          description: 'Kind of firm memory to create or update.',
        },
        label: { type: 'string', description: 'Short stable label, for example Apple Glass + Neo or QoE preview default.' },
        text: { type: 'string', description: 'Plain-English memory text. Use this for most memory writes.' },
        value: { type: 'object', description: 'Optional structured memory payload.' },
        confidence: { type: 'number', description: 'Confidence from 0 to 1. Defaults to 0.76.' },
        status: { type: 'string', enum: ['active', 'archived'], description: 'Archive to retire a memory without deleting it.' },
      },
      required: ['memoryType', 'label'],
    },
  },
  {
    name: 'defer_to_counsel',
    description: 'Record a Mode 2 defer-to-counsel trigger with a briefing packet. Use when tax/legal/regulated issues need human counsel.',
    input_schema: {
      type: 'object' as const,
      properties: {
        triggerCode: { type: 'string', description: 'Counsel halt or referral trigger code.' },
        contextText: { type: 'string', description: 'User-facing context that caused the deferral.' },
        dealId: { type: 'number', description: 'Optional deal ID.' },
      },
      required: ['triggerCode', 'contextText'],
    },
  },
  {
    name: 'update_tax_position',
    description: 'Record the current V19 tax position facts for a deal before tax-sensitive model execution.',
    input_schema: {
      type: 'object' as const,
      properties: {
        dealId: { type: 'number', description: 'Deal ID.' },
        dealType: { type: 'string', description: 'Deal type or structure.' },
        structureNotes: { type: 'string', description: 'Known tax structure notes.' },
        rolloverPct: { type: 'number', description: 'Rollover percentage, if known.' },
        rolloverPath: { type: 'string', description: 'Rollover path, if known.' },
        earnoutMethod: { type: 'string', description: 'Earnout method, if known.' },
        qsbsEligible: { type: 'boolean', description: 'Whether QSBS may be relevant.' },
        qsbsStateConformity: { type: 'string', description: 'State conformity note.' },
      },
      required: ['dealId', 'dealType'],
    },
  },
  {
    name: 'write_audit_trail',
    description: 'Write a V19 audit_trail record for a model-backed response, Studio action, export, or counsel deferral.',
    input_schema: {
      type: 'object' as const,
      properties: {
        sessionId: { type: 'string', description: 'Audit session ID.' },
        dealId: { type: 'number', description: 'Optional deal ID.' },
        turnId: { type: 'string', description: 'Turn/action ID.' },
        journey: { type: 'string', description: 'Journey context.' },
        league: { type: 'string', description: 'League context.' },
        dealType: { type: 'string', description: 'Deal type context.' },
        modelStack: { type: 'object', description: 'Model stack used.' },
        inputsUsed: { type: 'object', description: 'Inputs used.' },
        citationsValidated: { type: 'object', description: 'Citation validation results.' },
        mode2Triggers: { type: 'object', description: 'Mode 2 counsel triggers.' },
        outputHash: { type: 'string', description: 'Output hash if already computed.' },
      },
      required: ['sessionId', 'turnId'],
    },
  },
  {
    name: 'run_analysis',
    description: 'Run a real analysis for a deal and open it in the canvas. Use this instead of answering inline whenever the user asks to run, create, prepare, build, or open an analysis such as buyer fit, comps, valuation, DCF, LBO, sensitivity, QoE, recast, market intelligence, SBA, capital structure, covenant, red flags, working capital, earnout, cap table, tax impact, purchase-price allocation, or legal/deal structure. This resolves the analysis type to the right menu deliverable, queues generation, saves it, and opens the live analysis tab.',
    input_schema: {
      type: 'object' as const,
      properties: {
        dealId: { type: 'number', description: 'Deal ID' },
        analysisType: {
          type: 'string',
          enum: [
            'auto',
            'deal_scorecard',
            'buyer_fit',
              'comps',
              'valuation',
              'qoe',
              'lbo',
              'dcf',
              'sensitivity',
              'recast',
              'market_intelligence',
              'sba',
              'capital_structure',
              'covenant',
              'red_flags',
              'working_capital',
              'tax_impact',
              'purchase_price_allocation',
              'tax_structure',
              'legal_structure',
              'tax_legal_structure',
              'term_sheet',
              'earnout',
              'cap_table',
              'pmi_value_creation',
          ],
          description: 'The analysis the user wants. Use auto when the user asks generally to run analysis and the current deal journey/gate should choose the best first analysis.',
        },
        modelPreference: { type: 'string', enum: ['auto', 'fast', 'deep', 'drafting', 'research'], description: 'Optional model preference. Auto is default.' },
      },
      required: ['dealId', 'analysisType'],
    },
  },
  {
    name: 'file_deliverable_to_data_room',
    description: 'File an existing generated deliverable into the deal data room. Use only after user confirmation because it moves a private workspace item into the shared diligence drive.',
    input_schema: {
      type: 'object' as const,
      properties: {
        dealId: { type: 'number', description: 'Deal ID' },
        deliverableId: { type: 'number', description: 'Deliverable ID to file' },
        folderName: { type: 'string', description: 'Optional target data-room folder name. If omitted, Yulia will use the first available room folder.' },
      },
      required: ['dealId', 'deliverableId'],
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
    description: 'Create a new interactive, versioned financial model tab on the canvas. The model calculates instantly on the client with no API calls. Use when the user wants to model a scenario, run valuation, check SBA financing, analyze EV/purchase-price economics, or iterate deal assumptions. Returns the tab ID so later update_model calls can create additional scenario versions.',
    input_schema: {
      type: 'object' as const,
      properties: {
        modelType: { type: 'string', enum: ['valuation', 'lbo', 'sba_financing', 'dcf', 'sensitivity', 'comparison', 'cap_table', 'earnout', 'tax_impact', 'working_capital', 'covenant', 'sde_analysis'], description: 'Type of financial model' },
        title: { type: 'string', description: 'Tab title shown in the canvas tab bar' },
        initialAssumptions: { type: 'object', description: 'Starting assumptions. For valuation: { sde, ebitda, league, revenue, enterpriseValue, purchasePrice }. For lbo: { purchasePrice, ebitda, revenue, revenueGrowthRate, ebitdaMargin, exitMultiple, holdPeriod, seniorDebtPct, seniorRate }. For sba_financing: { purchasePrice, earnings, downPaymentPct, interestRate, termMonths }. All money in cents.' },
      },
      required: ['modelType', 'title', 'initialAssumptions'],
    },
  },
  {
    name: 'update_model',
    description: 'Update assumptions in an open financial model tab. The canvas recalculates and saves a new scenario version instantly (deterministic math, no API call). Use repeatedly when the user or calling agent says "what if EV is $12M", "change EBITDA to $1.5M", "adjust debt", or "try a 6x exit". Modeling is iterative, not one-and-done.',
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
    name: 'optimize_scenario',
    description: 'Optimize the currently open analysis/model scenario. Use when the user asks for the best scenario, best path, optimal structure, negotiation path, or how to improve the modeled outcome. Reads the active canvas, saved assumptions, evidence trail, user role, risk tolerance, and objective; then Yulia should recommend a risk-adjusted path plus the negotiation, diligence, reps/warranties, tax/legal, and work-product steps to get there.',
    input_schema: {
      type: 'object' as const,
      properties: {
        tabId: { type: 'string', description: 'Canvas tab to optimize. Use "active" for the currently visible analysis/model tab.' },
        analysisRunId: { type: 'number', description: 'Optional analysis run ID if the scenario is not currently the active tab.' },
        role: { type: 'string', enum: ['auto', 'buyer', 'seller', 'raiser', 'divestor', 'advisor'], description: 'User posture for this optimization. Auto is default.' },
        objective: { type: 'string', description: 'What the user wants optimized: price, DSCR, cash to close, certainty, speed, tax outcome, risk allocation, or another goal.' },
        riskTolerance: { type: 'string', enum: ['auto', 'conservative', 'balanced', 'aggressive'], description: 'How much execution/financing/legal risk the user is willing to tolerate.' },
        scenarioName: { type: 'string', description: 'Optional scenario/version label to optimize against.' },
      },
      required: [],
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
  {
    name: 'start_new_chapter',
    description: 'Start a new conversation chapter within the current deal. Call this when: (1) the topic shifts significantly (e.g., from valuation to LOI negotiation), (2) the conversation is getting very long (40+ exchanges), or (3) a major milestone is reached. This summarizes the current conversation, archives it, and creates a fresh chapter. The user stays in the same deal with full context carry-forward.',
    input_schema: {
      type: 'object' as const,
      properties: {
        reason: { type: 'string', description: 'Brief reason for starting a new chapter (e.g., "Moving to LOI negotiation", "Conversation getting long, archiving for context")' },
        newChapterTitle: { type: 'string', description: 'Title for the new chapter (e.g., "LOI Negotiation", "Due Diligence Review")' },
      },
      required: ['reason'],
    },
  },

  // ─── Lifecycle record tools (Phase A.1 — restored from autonomous run) ─
  // Chat-first flag-flippers that move deals through the gate-readiness
  // machine. None has a UI button; the user just tells Yulia.
  {
    name: 'promote_sourcing_target_to_deal',
    description: 'Convert a sourcing candidate into a real deal record. Copies the enriched fields (name, location, revenue/EBITDA estimates) onto the existing deal and flips financials.target_criteria_set so B1 readiness passes. Use when the user picks a sourced target and wants to start working it as the active deal.',
    input_schema: {
      type: 'object' as const,
      properties: {
        targetId: { type: 'number', description: 'Sourcing candidate ID' },
        dealId:   { type: 'number', description: 'Existing deal record to update' },
      },
      required: ['targetId', 'dealId'],
    },
  },
  {
    name: 'record_dd_complete',
    description: 'Mark due diligence as complete on a deal. Flips financials.dd_findings_documented so B3 → B4 readiness passes. Use when the user says "DD is done", "we\'re past diligence", or otherwise signals DD is finished. Optionally records a one-line summary of findings.',
    input_schema: {
      type: 'object' as const,
      properties: {
        dealId:          { type: 'number', description: 'The deal ID' },
        findingsSummary: { type: 'string', description: 'One-line summary of what DD turned up. Optional.' },
      },
      required: ['dealId'],
    },
  },
  {
    name: 'record_loi_executed',
    description: 'Record that the LOI is countersigned by both sides. Flips financials.deal_structure_agreed for B4 → B5 readiness. Use when the user says "LOI is signed", "Bob countersigned", etc.',
    input_schema: {
      type: 'object' as const,
      properties: {
        dealId:            { type: 'number', description: 'The deal ID' },
        loiDeliverableId:  { type: 'number', description: 'The deliverable record for the LOI, if known' },
        executionDate:     { type: 'string', description: 'ISO date the LOI was executed' },
        signers:           { type: 'array', items: { type: 'string' }, description: 'Names/emails of signers' },
      },
      required: ['dealId', 'executionDate'],
    },
  },
  {
    name: 'record_financing_secured',
    description: 'Record that financing is approved by the lender. Flips financials.financing_secured for B4 → B5 readiness. Use when the user says "financing is approved", "lender confirmed", "we got the term sheet".',
    input_schema: {
      type: 'object' as const,
      properties: {
        dealId:               { type: 'number', description: 'The deal ID' },
        lender:               { type: 'string', description: 'Lender name' },
        amountCents:          { type: 'number', description: 'Approved financing amount in cents' },
        commitmentLetterDate: { type: 'string', description: 'ISO date the commitment letter was issued' },
      },
      required: ['dealId', 'lender', 'amountCents', 'commitmentLetterDate'],
    },
  },
  {
    name: 'close_deal',
    description: 'Mark a deal closed at the final price on a given date. Sets status="closed", inserts into closed_deals (if the table exists), optionally spawns a PMI deal for BUY journeys. Returns canvas_action that opens a celebratory close-out tab. Use when the user says "we closed", "the deal closed yesterday", or signals the transaction is complete.',
    input_schema: {
      type: 'object' as const,
      properties: {
        dealId:          { type: 'number', description: 'The deal ID to close' },
        closingDate:     { type: 'string', description: 'ISO date the deal closed' },
        finalPriceCents: { type: 'number', description: 'Final transaction price, in cents' },
        spawnPmi:        { type: 'boolean', description: 'For BUY journeys, also create a PMI deal so the user can plan integration' },
      },
      required: ['dealId', 'closingDate', 'finalPriceCents'],
    },
  },

  // ─── Sourcing pipeline (Phase A.2 — restored from autonomous run) ─────
  // Server-side tool that kicks the 5-stage sourcing engine for a thesis.
  // Stage 1 (intelligence brief) runs synchronously ~30-60s; stages 2-4
  // run as background jobs. Returns canvas_action: 'open_sourcing' for
  // when the SourcingPanel UI lands; the action is a harmless no-op on
  // the current client (no listener for that action at fd1c6b4 + Phase A).
  {
    name: 'start_sourcing_run',
    description: 'Kick off the 5-stage sourcing pipeline for the user\'s active acquisition thesis. Stage 1 (intelligence brief) runs synchronously ~30-60s; stages 2-4 (target expansion + scoring) run as background jobs. Use when the user says "find me targets", "start sourcing", "go look", or otherwise asks to source a deal at B1. If thesisId is omitted, uses the user\'s most recent thesis. Returns canvas_action that opens the live sourcing panel.',
    input_schema: {
      type: 'object' as const,
      properties: {
        thesisId: { type: 'number', description: 'Buyer thesis to source against. Omit to use the most recent one.' },
        title: { type: 'string', description: 'Optional tab title; defaults to the thesis name.' },
      },
      required: [],
    },
  },

  // ─── Merger pairing (Phase A.4 — restored from autonomous-run B4.5) ──
  // Links two existing deals as the two sides of a merger transaction.
  // Schema (merger_pairings table + parent_deal_id column on deals)
  // comes from migration 059_merger_lite.sql.
  {
    name: 'pair_merger_deals',
    description: 'Pair two existing deals as the two sides of a merger transaction. Inserts a merger_pairings row linking deal A and deal B with structure (forward triangular, reverse triangular, share exchange, merger of equals), exchange ratio, and surviving entity. Use when the user has two deals and wants to merge them.',
    input_schema: {
      type: 'object' as const,
      properties: {
        dealAId:         { type: 'number', description: 'Deal ID for side A (typically the surviving entity)' },
        dealBId:         { type: 'number', description: 'Deal ID for side B' },
        structure:       { type: 'string', enum: ['forward_triangular_merger', 'reverse_triangular_merger', 'share_exchange', 'merger_of_equals'], description: 'Legal structure of the merger' },
        exchangeRatio:   { type: 'number', description: 'Shares of A per share of B (or share-equivalent for cash). Optional.' },
        survivingEntity: { type: 'string', enum: ['A', 'B', 'NEW'], description: 'Which entity survives. NEW = a newly formed parent (typical for MOE). Default: A.' },
        notes:           { type: 'string', description: 'Free-text notes about the pairing.' },
      },
      required: ['dealAId', 'dealBId', 'structure'],
    },
  },

  // ─── Compare deals (Phase A.3) ────────────────────────────────────────
  // Opens a structured side-by-side comparison surface in the canvas while
  // preserving markdown commentary for Yulia's short read.
  {
    name: 'compare_deals',
    description: 'Compare two or three deals side-by-side and open a structured comparison analysis in the canvas. Covers headline financials, current gate, league, risks, and next action. Use when the user says "compare these three", "which is the best of A B C", "side-by-side", etc. Do not leave the comparison only in chat.',
    input_schema: {
      type: 'object' as const,
      properties: {
        dealIds: {
          type: 'array',
          items: { type: 'number' },
          description: 'Two or three deal IDs to compare. More than three are silently truncated to the first three.',
        },
        title: { type: 'string', description: 'Optional comparison title (used in the table header).' },
      },
      required: ['dealIds'],
    },
  },
];

const CONFIRMATION_SCHEMA = {
  type: 'boolean',
  description: 'Set to true only after the user explicitly confirms this staged action. Do not set true on the first attempt.',
};

const CONFIRMATION_SUMMARY_SCHEMA = {
  type: 'string',
  description: 'Short summary of what the user explicitly confirmed, used for audit.',
};

for (const tool of TOOL_DEFINITIONS) {
  if (!TOOL_NAMES_REQUIRING_CONFIRMATION.has(tool.name)) continue;
  const schema = tool.input_schema as any;
  schema.properties = {
    ...(schema.properties || {}),
    confirmed: CONFIRMATION_SCHEMA,
    confirmationSummary: CONFIRMATION_SUMMARY_SCHEMA,
  };
}

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
      case 'generate_deal_deliverable':
        return await generateDealDeliverable(input, userId);
      case 'generate_output_doc':
        return await generateOutputDoc(input, userId);
      case 'create_pitch_book':
        return await createPitchBookTool(input, userId);
      case 'revise_pitch_book':
        return await revisePitchBookTool(input, userId);
      case 'add_pitch_book_section':
        return await addPitchBookSectionTool(input, userId);
      case 'refresh_pitch_book_from_models':
        return await refreshPitchBookFromModelsTool(input, userId);
      case 'export_pitch_book':
        return await exportPitchBookTool(input, userId);
      case 'compose_model_stack':
        return await composeModelStackTool(input, userId);
      case 'execute_model':
        return await executeModelTool(input, userId, conversationId);
      case 'run_model_iteration':
        return await runModelIterationTool(input, userId, conversationId);
      case 'lookup_citation':
        return await lookupCitationTool(input, userId);
      case 'fetch_market_data':
        return await fetchMarketDataTool(input, userId);
      case 'read_v19_readiness':
        return await readV19ReadinessTool(input, userId);
      case 'read_v19_entitlements':
        return await readV19EntitlementsTool(userId);
      case 'update_firm_memory':
        return await updateFirmMemoryTool(input, userId);
      case 'defer_to_counsel':
        return await deferToCounselTool(input, userId, conversationId);
      case 'update_tax_position':
        return await updateTaxPositionTool(input, userId);
      case 'write_audit_trail':
        return await writeAuditTrailTool(input, userId, conversationId);
      case 'run_analysis':
        return await runAnalysis(input, userId, conversationId);
      case 'file_deliverable_to_data_room':
        return await fileDeliverableToDataRoom(input, userId);
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
        return await createModelTab(input, userId, conversationId);
      case 'update_model':
        return await updateModel(input, userId, conversationId);
      case 'read_tab_state':
        return await readTabState(input, userId, conversationId);
      case 'optimize_scenario':
        return await optimizeScenario(input, userId, conversationId);
      case 'create_support_issue':
        return await createSupportIssue(input, userId, conversationId);
      case 'query_admin_data':
        return await queryAdminData(input, userId);
      case 'request_review':
        return await requestReviewTool(input, userId);
      case 'share_document':
        return await shareDocumentTool(input, userId);
      case 'start_new_chapter':
        return await startNewChapter(input, userId, conversationId);
      // Lifecycle record tools (Phase A.1 — see definitions above)
      case 'promote_sourcing_target_to_deal':
        return await promoteSourcingTargetToDeal(input, userId);
      case 'record_dd_complete':
        return await recordDdComplete(input, userId);
      case 'record_loi_executed':
        return await recordLoiExecuted(input, userId);
      case 'record_financing_secured':
        return await recordFinancingSecured(input, userId);
      case 'close_deal':
        return await closeDeal(input, userId);
      // Sourcing pipeline (Phase A.2)
      case 'start_sourcing_run':
        return await startSourcingRun(input, userId);
      // Comparison (Phase A.3 — text-only)
      case 'compare_deals':
        return await compareDealsTool(input, userId, conversationId);
      // Merger pairing (Phase A.4)
      case 'pair_merger_deals':
        return await pairMergerDeals(input, userId);
      default:
        return JSON.stringify({ error: `Unknown tool: ${toolName}` });
    }
  } catch (err: any) {
    console.error(`Tool ${toolName} error:`, err.message);
    return JSON.stringify({ error: err.message });
  }
}

async function startNewChapter(input: Record<string, any>, userId: number, conversationId: number): Promise<string> {
  const { reason, newChapterTitle } = input;

  // Get the current conversation's deal
  const [conv] = await sql`SELECT deal_id FROM conversations WHERE id = ${conversationId} AND user_id = ${userId} LIMIT 1`;
  if (!conv?.deal_id) {
    return JSON.stringify({ error: 'No deal linked to this conversation. Cannot start a chapter without a deal.' });
  }

  const dealId = conv.deal_id;
  const [deal] = await sql`SELECT current_gate, business_name FROM deals WHERE id = ${dealId} LIMIT 1`;

  // Import and run the gate conversation service for summarization + archival
  const { summarizeGateConversation, gateCompletionTitle } = await import('./gateSummaryService.js');

  // Summarize current conversation
  const summary = await summarizeGateConversation(conversationId, deal?.current_gate || 'ongoing').catch(() => null);

  // Archive current conversation with summary
  const archiveTitle = newChapterTitle
    ? `${newChapterTitle} (archived)`
    : gateCompletionTitle(deal?.current_gate || 'chapter', deal?.business_name);

  await sql`
    UPDATE conversations
    SET gate_status = 'completed',
        title = ${archiveTitle},
        summary = ${summary},
        updated_at = NOW()
    WHERE id = ${conversationId}
  `;

  // Create new conversation for the new chapter
  const title = newChapterTitle || `${deal?.business_name || 'Deal'} — continued`;
  const [newConvo] = await sql`
    INSERT INTO conversations (user_id, title, deal_id, gate_status, gate_label, created_at, updated_at)
    VALUES (${userId}, ${title}, ${dealId}, 'active', ${deal?.current_gate}, NOW(), NOW())
    RETURNING id, title
  `;

  return JSON.stringify({
    success: true,
    newConversationId: newConvo.id,
    newChapterTitle: newConvo.title,
    archivedConversationId: conversationId,
    summary: summary ? summary.substring(0, 200) + '...' : null,
    reason,
    canvas_action: { type: 'chapter_started', newConversationId: newConvo.id },
  });
}

async function createDeal(input: Record<string, any>, userId: number, conversationId: number): Promise<string> {
  const { journeyType, initialGate } = input;

  const [deal] = await sql`
    INSERT INTO deals (user_id, journey_type, current_gate, status)
    VALUES (${userId}, ${journeyType}, ${initialGate}, 'active')
    RETURNING id, journey_type, current_gate
  `;

  // Link conversation to deal and clear general flag (this is now a deal conversation)
  await sql`UPDATE conversations SET deal_id = ${deal.id}, is_general = false WHERE id = ${conversationId}`;

  setImmediate(() => {
    queueIndustryDeepResearchJob({
      userId,
      dealId: Number(deal.id),
      triggerReason: 'deal_created',
      sourceSurface: 'chat',
      sourceAgent: 'yulia-create-deal',
    }).catch(() => {});
  });

  return JSON.stringify({ success: true, dealId: deal.id, journeyType, gate: initialGate });
}

const FINANCIAL_FIELDS = new Set(['revenue', 'sde', 'ebitda', 'asking_price']);
const MARKET_INTELLIGENCE_TRIGGER_FIELDS = new Set([
  'business_name',
  'industry',
  'location',
  'league',
  'journey_type',
  'current_gate',
  'status',
]);

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

  if (isFinancialUpdate || MARKET_INTELLIGENCE_TRIGGER_FIELDS.has(field)) {
    setImmediate(() => {
      ensureMarketIntelligenceProfileForDeal({
        userId,
        dealId: Number(dealId),
        triggerReason: `deal_field_updated:${field}`,
        sourceSurface: 'chat',
        sourceAgent: 'yulia-update-deal-field',
      }).catch(() => {});
    });
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
  ctx.v19_readiness = await readDealV19Readiness(userId, Number(dealId)).catch(() => null);

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
    v19Readiness: await readDealV19Readiness(userId, Number(dealId)).catch(() => null),
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

async function generateDealDeliverable(input: Record<string, any>, userId: number): Promise<string> {
  const { dealId, menuItemSlug, modelPreference } = input;
  if (!dealId || !menuItemSlug) return JSON.stringify({ error: 'dealId and menuItemSlug are required' });

  const [deal] = await sql`
    SELECT id, business_name, user_id
    FROM deals
    WHERE id = ${dealId} AND user_id = ${userId}
    LIMIT 1
  `;
  if (!deal) return JSON.stringify({ error: 'Deal not found' });

  const [menuItem] = await sql`
    SELECT id, slug, name
    FROM menu_items
    WHERE slug = ${menuItemSlug} AND active = true
    LIMIT 1
  `;
  if (!menuItem) return JSON.stringify({ error: `Menu item not found: ${menuItemSlug}` });

  const deliverableType = menuItem.slug.replace(/-/g, '_');
  const access = await canGenerateDeliverable(userId, deliverableType);
  if (!access.allowed) {
    return JSON.stringify({
      error: 'Subscription required',
      requiredPlan: access.requiredPlan,
      currentPlan: access.currentPlan,
      message: `This deliverable requires a ${access.requiredPlan} subscription.`,
    });
  }

  const [deliverable] = await sql`
    INSERT INTO deliverables (deal_id, user_id, menu_item_id, status, price_charged_cents)
    VALUES (${dealId}, ${userId}, ${menuItem.id}, 'queued', 0)
    RETURNING id
  `;

  const jobData = {
    deliverableId: deliverable.id,
    dealId,
    userId,
    menuItemSlug,
    deliverableType,
    modelPreference,
  };
  const jobId = await enqueueDeliverableGeneration(jobData).catch(() => null);

  if (access.isFreeDeliverable) {
    await markFreeDeliverableUsed(userId, deliverableType).catch(() => {});
  }

  setImmediate(() => {
    processDeliverable(jobData).catch(err =>
      console.error('Tool deliverable generation error:', err.message),
    );
  });

  return JSON.stringify({
    success: true,
    deliverableId: deliverable.id,
    jobId,
    status: 'queued',
    title: menuItem.name,
    canvas_action: 'open_tab',
    tab: {
      id: String(deliverable.id),
      kind: 'doc',
      title: `${deal.business_name || 'Deal'} · ${menuItem.name}`,
    },
    v19Readiness: await readDealV19Readiness(userId, Number(dealId)).catch(() => null),
  });
}

async function generateOutputDoc(input: Record<string, any>, userId: number): Promise<string> {
  const dealId = Number(input.dealId);
  const documentType = normalizeOutputDocumentType(input.documentType || input.docType || input.kind);
  if (!Number.isFinite(dealId) || dealId <= 0) return JSON.stringify({ error: 'dealId is required' });
  if (!documentType) return JSON.stringify({ error: 'documentType is required' });

  const [deal] = await sql`
    SELECT id, business_name, user_id, journey_type, current_gate, league, industry, location,
           revenue, sde, ebitda, asking_price, deal_type, jurisdiction, financials
    FROM deals
    WHERE id = ${dealId} AND user_id = ${userId}
    LIMIT 1
  `;
  if (!deal) return JSON.stringify({ error: 'Deal not found' });

  const resolved = resolveOutputDocMenuItem(documentType, deal.journey_type);
  if (!resolved.menuItemSlug) {
    return JSON.stringify({
      error: 'unsupported_document_type',
      documentType,
      message: `No internal deliverable route is mapped for ${documentType} yet.`,
      supportedDocumentTypes: OUTPUT_DOC_TYPES,
    });
  }

  const dependencyIds = normalizeNumberArray(input.sourceModelExecutionIds);
  const currentAssumptions = Object.keys(asRecord(input.currentAssumptions)).length
    ? asRecord(input.currentAssumptions)
    : dealAssumptionsForModelFreshness(deal);
  const modelDependencies = dependencyIds.length
    ? await readModelDependencySummaries(userId, dependencyIds, currentAssumptions)
    : [];
  const dependencyGate = buildOutputDocDependencyGate(dependencyIds, modelDependencies);
  if (input.requireFreshModels === true && !dependencyGate.ready) {
    return JSON.stringify({
      success: false,
      schema: 'AgentOutputDocumentRun.v0.1',
      error: 'model_dependencies_not_current',
      documentType,
      definitiveDocumentType: resolved.definitiveDocumentType,
      menuItemSlug: resolved.menuItemSlug,
      modelDependencies,
      modelDependencyGate: dependencyGate,
      sourceModelExecutionIds: dependencyIds,
      next_suggested_calls: buildOutputDocNextCalls(documentType, dependencyIds, null, dependencyGate),
      lineBoundary:
        'generate_output_doc blocked generation because requireFreshModels=true and model dependencies are missing, stale, superseded, or unverifiable. This is a software freshness gate, not a professional reliance determination.',
      takeBackArtifacts: ['ModelExecutionHistory', 'MCPCallHint[]'],
    });
  }
  const draftPayload = payloadFromDealForAgentDoc(deal, modelDependencies);
  const { executeDefinitiveDealStateTool } = await import('./definitiveDealState.js');
  const draft = executeDefinitiveDealStateTool('compose_document_draft', {
    payload: draftPayload,
    documentType: resolved.definitiveDocumentType,
    audience: input.audience,
    objective: input.purpose,
  });

  const generated = parseJsonResult(await generateDealDeliverable({
    dealId,
    menuItemSlug: resolved.menuItemSlug,
    modelPreference: input.modelPreference || 'drafting',
  }, userId));

  return JSON.stringify({
    success: !generated?.error,
    schema: 'AgentOutputDocumentRun.v0.1',
    documentType,
    definitiveDocumentType: resolved.definitiveDocumentType,
    menuItemSlug: resolved.menuItemSlug,
    deliverable: generated,
    documentDraft: (draft as any)?.result?.documentDraft || null,
    modelDependencies,
    modelDependencyGate: dependencyGate,
    sourceModelExecutionIds: dependencyIds,
    next_suggested_calls: buildOutputDocNextCalls(documentType, dependencyIds, generated, dependencyGate),
    lineBoundary:
      'generate_output_doc queues an internal work product and composes a source-aware scaffold. It does not transmit externally, negotiate, draft enforceability opinions, or provide legal/tax advice.',
    takeBackArtifacts: ['deliverableId', 'DocumentDraft', 'ModelExecutionId[]', 'OutputHash[]', 'MCPCallHint[]'],
  });
}

async function createPitchBookTool(input: Record<string, any>, userId: number): Promise<string> {
  const gate = await checkV19Entitlement(userId, 'studio_book', {
    actionId: 'create_pitch_book',
    toolName: 'create_pitch_book',
    sourceSurface: 'chat',
    resourceType: 'studio_book',
    metadata: { format: input.format },
  });
  if (!gate.allowed) return stringifyV19Tollgate(gate);

  const book = await createPitchBook({
    userId,
    dealId: input.dealId == null ? null : Number(input.dealId),
    format: input.format,
    title: input.title,
    brief: input.brief,
  });
  await recordV19UsageEvent({
    userId,
    eventType: 'studio_book',
    actionId: 'create_pitch_book',
    toolName: 'create_pitch_book',
    sourceSurface: 'chat',
    resourceType: 'studio_book',
    resourceId: book.id,
    metadata: { format: book.format, dealId: book.dealId },
  });
  return JSON.stringify({
    success: true,
    bookId: book.id,
    version: book.version,
    title: book.title,
    format: book.format,
    slides: book.slides.length,
    warnings: book.slides.filter(slide => slide.warningState !== 'clean').length,
    v19Readiness: await readStudioBookV19Readiness(userId, book.id),
    v19Usage: await readV19UsageMeter(userId),
    canvas_action: 'open_tab',
    tab: {
      id: `studio-book-${book.id}`,
      kind: 'marketing-studio',
      title: book.title,
      studioView: 'canvas',
      studioFormat: book.format,
      studioBookId: book.id,
    },
  });
}

function stringifyV19Tollgate(check: V19EntitlementCheck): string {
  return JSON.stringify({
    success: false,
    error: check.tollgate?.message || 'This V19 action is not available on the current plan',
    tollgate: formatV19TollgateForYulia(check.tollgate),
    v19Usage: check.meter,
  });
}

async function revisePitchBookTool(input: Record<string, any>, userId: number): Promise<string> {
  const book = await revisePitchBook({
    userId,
    bookId: Number(input.bookId),
    instruction: String(input.instruction || ''),
  });
  return JSON.stringify({
    success: true,
    bookId: book.id,
    version: book.version,
    title: book.title,
    warnings: book.slides.filter(slide => slide.warningState !== 'clean').length,
    v19Readiness: await readStudioBookV19Readiness(userId, book.id),
  });
}

async function addPitchBookSectionTool(input: Record<string, any>, userId: number): Promise<string> {
  const book = await addPitchBookSection({
    userId,
    bookId: Number(input.bookId),
    title: String(input.title || ''),
    body: typeof input.body === 'string' ? input.body : null,
    bullets: Array.isArray(input.bullets) ? input.bullets.map(String) : [],
  });
  return JSON.stringify({
    success: true,
    bookId: book.id,
    version: book.version,
    title: book.title,
    slides: book.slides.length,
    v19Readiness: await readStudioBookV19Readiness(userId, book.id),
  });
}

async function refreshPitchBookFromModelsTool(input: Record<string, any>, userId: number): Promise<string> {
  const bookId = Number(input.bookId);
  const existing = await getPitchBook(userId, bookId);
  if (!existing) return JSON.stringify({ error: 'Pitch book not found' });
  const modelIds = getPitchBookModelIds(existing);
  const gate = await checkV19Entitlement(userId, 'model_run', {
    quantity: modelIds.length || 1,
    actionId: 'refresh_pitch_book_from_models',
    toolName: 'refresh_pitch_book_from_models',
    sourceSurface: 'chat',
    resourceType: 'studio_book',
    resourceId: bookId,
    metadata: { modelIds },
  });
  if (!gate.allowed) return stringifyV19Tollgate(gate);

  const book = await refreshPitchBookFromModels(userId, bookId);
  await recordV19UsageEvent({
    userId,
    eventType: 'model_run',
    quantity: modelIds.length || 1,
    actionId: 'refresh_pitch_book_from_models',
    toolName: 'refresh_pitch_book_from_models',
    sourceSurface: 'chat',
    resourceType: 'studio_book',
    resourceId: book.id,
    metadata: { modelIds },
  });
  return JSON.stringify({
    success: true,
    bookId: book.id,
    version: book.version,
    title: book.title,
    message: 'Pitch book model slots were refreshed against the V19 runtime.',
    warnings: book.slides.filter(slide => slide.warningState !== 'clean').length,
    v19Readiness: await readStudioBookV19Readiness(userId, book.id),
    v19Usage: await readV19UsageMeter(userId),
  });
}

async function exportPitchBookTool(input: Record<string, any>, userId: number): Promise<string> {
  const bookId = Number(input.bookId);
  const format = String(input.format || 'pptx').toLowerCase() === 'pdf' ? 'pdf' : 'pptx';
  const book = await getPitchBook(userId, bookId);
  if (!book) return JSON.stringify({ error: 'Pitch book not found' });
  const readiness = await readStudioBookV19Readiness(userId, book.id);
  const gate = await checkV19Entitlement(userId, 'studio_export', {
    actionId: 'export_pitch_book',
    toolName: 'export_pitch_book',
    sourceSurface: 'chat',
    resourceType: 'studio_book',
    resourceId: book.id,
    metadata: { format, readyForExternalDelivery: readiness.readyForExternalDelivery },
  });
  if (!gate.allowed) return stringifyV19Tollgate(gate);

  return JSON.stringify({
    success: true,
    bookId: book.id,
    title: book.title,
    format,
    downloadUrl: `/api/studio/pitch-books/${book.id}/export/${format}`,
    strictDownloadUrl: `/api/studio/pitch-books/${book.id}/export/${format}?strict=1`,
    alternateDownloadUrl: `/api/studio/pitch-books/${book.id}/export/${format === 'pptx' ? 'pdf' : 'pptx'}`,
    readyForExternalDelivery: readiness.readyForExternalDelivery,
    v19Readiness: readiness,
    v19Usage: gate.meter,
  });
}

async function composeModelStackTool(input: Record<string, any>, userId: number): Promise<string> {
  const dealId = Number(input.dealId);
  if (!Number.isFinite(dealId) || dealId <= 0) return JSON.stringify({ error: 'dealId is required' });
  if (!(await hasDealAccess(dealId, userId))) return JSON.stringify({ error: 'Deal not found' });

  const [deal] = await sql`
    SELECT id, journey_type, league, deal_type, industry, jurisdiction, revenue, sde, ebitda
    FROM deals
    WHERE id = ${dealId}
    LIMIT 1
  `;
  if (!deal) return JSON.stringify({ error: 'Deal not found' });

  const journey = normalizeV19Journey(input.journey || deal.journey_type);
  const league = normalizeV19League(input.league || deal.league)
    || classifyV19LeagueFromCents({
      revenueCents: deal.revenue == null ? null : Number(deal.revenue),
      sdeCents: deal.sde == null ? null : Number(deal.sde),
      ebitdaCents: deal.ebitda == null ? null : Number(deal.ebitda),
    });
  const stack = await composeModelStack({
    dealId,
    journey,
    league,
    dealType: String(input.dealType || deal.deal_type || 'unknown'),
    industry: deal.industry || null,
    jurisdiction: deal.jurisdiction || null,
    signals: normalizeDefinitiveStackSignals(input.signals || input),
  });

  return JSON.stringify({ success: true, dealId, stack });
}

function resolveExecutableModelReference(input: Record<string, any>, fallbackModelId?: string | null) {
  const requested = String(input.modelSlotId || input.modelId || fallbackModelId || '').trim();
  if (!requested) {
    return {
      ok: false as const,
      error: {
        error: 'modelId_required',
        message: 'Supply modelId/modelSlotId for a first run, or executionId for a rerun from a saved model execution.',
      },
    };
  }

  if (/^M\d{3}$/i.test(requested)) {
    const slot = getDefinitiveModelSlotSurface(requested);
    if (!slot) {
      return {
        ok: false as const,
        error: {
          error: 'model_slot_not_found',
          modelSlotId: requested.toUpperCase(),
          message: 'No DEFINITIVE model slot exists for the supplied M-slot id.',
          next_suggested_calls: ['lookup_model_slot', 'compose_model_stack'],
        },
      };
    }
    if (!slot.implementedRuntimeModelId) {
      return {
        ok: false as const,
        error: {
          error: 'model_slot_not_executable',
          modelSlotId: slot.slotId,
          modelName: slot.name,
          readiness: slot.route?.readiness || 'not_executable',
          lineCategory: slot.lineCategory,
          boundary: slot.route?.boundary || slot.the_line_invariant,
          message: 'This public DEFINITIVE M-slot is routable in the Deal OS but does not yet have an executable server runtime model. Use compose_model_stack or lookup_model_slot to route the work and return missing inputs/handoffs.',
          next_suggested_calls: ['lookup_model_slot', 'compose_model_stack', 'generate_output_doc'],
        },
      };
    }
    return {
      ok: true as const,
      modelId: slot.implementedRuntimeModelId,
      requestedModelId: requested,
      modelSlotId: slot.slotId,
      modelSlotName: slot.name,
      resolution: 'm_slot_to_runtime_model',
    };
  }

  return {
    ok: true as const,
    modelId: requested,
    requestedModelId: requested,
    modelSlotId: input.modelSlotId ? String(input.modelSlotId).toUpperCase() : null,
    modelSlotName: null,
    resolution: 'runtime_model_id',
  };
}

async function executeModelTool(input: Record<string, any>, userId: number, conversationId: number): Promise<string> {
  const dealId = input.dealId == null ? null : Number(input.dealId);
  if (dealId && !(await hasDealAccess(dealId, userId))) return JSON.stringify({ error: 'Deal not found' });
  const modelRef = resolveExecutableModelReference(input);
  if (!modelRef.ok) return JSON.stringify(modelRef.error);
  const effectiveConversationId = Number.isFinite(conversationId) && conversationId > 0 ? conversationId : null;

  const gate = await checkV19Entitlement(userId, 'model_run', {
    actionId: 'execute_model',
    toolName: 'execute_model',
    sourceSurface: 'chat',
    resourceType: 'model',
    resourceId: modelRef.modelId,
    metadata: { dealId, requestedModelId: modelRef.requestedModelId, modelSlotId: modelRef.modelSlotId },
  });
  if (!gate.allowed) return stringifyV19Tollgate(gate);

  const execution = await executeV19Model({
    modelId: modelRef.modelId,
    input: asRecord(input.input),
    dealId,
    userId,
    conversationId: effectiveConversationId,
  });
  const record = await persistV19ModelExecution(execution, { toolName: 'execute_model' });
  await recordV19UsageEvent({
    userId,
    eventType: 'model_run',
    actionId: 'execute_model',
    toolName: 'execute_model',
    sourceSurface: 'chat',
    resourceType: 'model_execution',
    resourceId: record.id,
    metadata: {
      dealId,
      modelId: execution.modelId,
      requestedModelId: modelRef.requestedModelId,
      modelSlotId: modelRef.modelSlotId,
      status: execution.status,
      outputHash: execution.outputHash,
    },
  });
  const readiness = dealId ? await readDealV19Readiness(userId, dealId).catch(() => null) : null;
  return JSON.stringify({
    success: true,
    modelExecutionId: record.id,
    modelResolution: {
      requestedModelId: modelRef.requestedModelId,
      modelId: modelRef.modelId,
      modelSlotId: modelRef.modelSlotId,
      modelSlotName: modelRef.modelSlotName,
      resolution: modelRef.resolution,
    },
    execution,
    v19Readiness: readiness,
    v19Usage: await readV19UsageMeter(userId),
  });
}

async function runModelIterationTool(input: Record<string, any>, userId: number, conversationId: number): Promise<string> {
  const dealId = input.dealId == null ? null : Number(input.dealId);
  if (dealId && !(await hasDealAccess(dealId, userId))) return JSON.stringify({ error: 'Deal not found' });
  const sourceSurface = String(input.sourceSurface || 'agent_model_iteration');
  const effectiveConversationId = Number.isFinite(conversationId) && conversationId > 0 ? conversationId : null;

  const prior = input.executionId == null
    ? null
    : await readModelExecutionForIteration(userId, Number(input.executionId));
  if (input.executionId != null && !prior) return JSON.stringify({ error: 'Model execution not found' });

  const modelRef = resolveExecutableModelReference(input, prior?.model_id);
  if (!modelRef.ok) return JSON.stringify(modelRef.error);
  const modelId = modelRef.modelId;

  const mergedInput = {
    ...(prior?.inputs && typeof prior.inputs === 'object' ? prior.inputs : {}),
    ...asRecord(input.input),
    ...asRecord(input.overrides),
  };

  const gate = await checkV19Entitlement(userId, 'model_run', {
      actionId: 'run_model_iteration',
      toolName: 'run_model_iteration',
      sourceSurface,
      resourceType: 'model',
      resourceId: modelId,
    metadata: {
      dealId,
      requestedModelId: modelRef.requestedModelId,
      modelSlotId: modelRef.modelSlotId,
      parentExecutionId: prior?.id ?? null,
      parentOutputHash: prior?.output_hash ?? null,
    },
  });
  if (!gate.allowed) return stringifyV19Tollgate(gate);

  try {
    const execution = await executeV19Model({
      modelId,
      input: mergedInput,
      dealId,
      userId,
      conversationId: effectiveConversationId,
    });
    const record = await persistV19ModelExecution(execution, { toolName: 'run_model_iteration', sourceSurface });
    if (prior) {
      await sql`
        UPDATE model_executions
        SET parent_output_hash = ${prior.output_hash},
            model_type = COALESCE(model_type, ${prior.model_type}),
            model_title = COALESCE(model_title, ${prior.model_title})
        WHERE id = ${Number(record.id)} AND user_id = ${userId}
      `;
    }

    await recordV19UsageEvent({
      userId,
      eventType: 'model_run',
      actionId: 'run_model_iteration',
      toolName: 'run_model_iteration',
      sourceSurface,
      resourceType: 'model_execution',
      resourceId: record.id,
      metadata: {
        dealId,
        modelId: execution.modelId,
        requestedModelId: modelRef.requestedModelId,
        modelSlotId: modelRef.modelSlotId,
        status: execution.status,
        outputHash: execution.outputHash,
        parentExecutionId: prior?.id ?? null,
        parentOutputHash: prior?.output_hash ?? null,
        reason: input.reason || null,
      },
    });

    return JSON.stringify({
      success: true,
      schema: 'AgentModelIteration.v0.1',
      modelExecutionId: record.id,
      parentExecutionId: prior?.id ?? null,
      parentOutputHash: prior?.output_hash ?? null,
      modelId: execution.modelId,
      modelResolution: {
        requestedModelId: modelRef.requestedModelId,
        modelId: modelRef.modelId,
        modelSlotId: modelRef.modelSlotId,
        modelSlotName: modelRef.modelSlotName,
        resolution: modelRef.resolution,
      },
      status: execution.status,
      inputs: execution.inputs,
      outputs: execution.outputs,
      missingInputs: execution.missingInputs,
      citationTags: execution.citationTags,
      outputHash: execution.outputHash,
      auditPayload: execution.auditPayload,
      iterationBoundary:
        'Modeling is iterative. This run is one version in a lineage; agents should test changed assumptions, compare versions, and regenerate dependent documents when outputs change.',
      next_suggested_calls: execution.status === 'needs_inputs'
        ? ['update_deal_payload', 'run_model_iteration']
        : ['list_model_executions', 'generate_output_doc', 'compose_model_stack'],
      v19Readiness: dealId ? await readDealV19Readiness(userId, dealId).catch(() => null) : null,
      v19Usage: await readV19UsageMeter(userId),
    });
  } catch (err: any) {
    if (prior?.canvas_tab_id || prior?.model_type) {
      return JSON.stringify({
        success: true,
        schema: 'AgentModelIteration.v0.1',
        status: 'prepared_for_canvas_execution',
        modelId,
        modelResolution: {
          requestedModelId: modelRef.requestedModelId,
          modelId: modelRef.modelId,
          modelSlotId: modelRef.modelSlotId,
          modelSlotName: modelRef.modelSlotName,
          resolution: modelRef.resolution,
        },
        parentExecutionId: prior.id,
        parentOutputHash: prior.output_hash,
        canvas_action: 'create_model_tab',
        modelType: prior.model_type,
        title: prior.model_title || `${prior.model_type || 'Model'} rerun`,
        initialAssumptions: mergedInput,
        message: 'This saved execution belongs to an interactive canvas model. The rerun has been prepared with merged assumptions; the browser canvas performs the deterministic UI calculation and persists the next version.',
        next_suggested_calls: ['create_model_tab', 'update_model', 'list_model_executions'],
        lineBoundary: 'Canvas reruns are internal model work. The agent receives the rerun packet and parent hash; the user/advisor decides reliance.',
      });
    }
    return JSON.stringify({ error: 'model_iteration_failed', message: err.message, modelId });
  }
}

async function readV19ReadinessTool(input: Record<string, any>, userId: number): Promise<string> {
  const dealId = input.dealId == null ? null : Number(input.dealId);
  const bookId = input.bookId == null ? null : Number(input.bookId);
  if (!dealId && !bookId) return JSON.stringify({ error: 'dealId or bookId is required' });
  const dealReadiness = dealId ? await readDealV19Readiness(userId, dealId) : null;
  const studioReadiness = bookId ? await readStudioBookV19Readiness(userId, bookId) : null;
  return JSON.stringify({
    success: true,
    dealReadiness,
    studioReadiness,
  });
}

async function readV19EntitlementsTool(userId: number): Promise<string> {
  const meter = await readV19UsageMeter(userId);
  await recordV19UsageEvent({
    userId,
    eventType: 'tool_call',
    actionId: 'read_v19_entitlements',
    toolName: 'read_v19_entitlements',
    sourceSurface: 'chat',
    metadata: { plan: meter.plan },
  });
  return JSON.stringify({
    success: true,
    usage: meter,
    tollgateStates: ['credit_budget_required', 'human_approval_required', 'enterprise_scope_required'],
  });
}

async function updateFirmMemoryTool(input: Record<string, any>, userId: number): Promise<string> {
  const memoryType = String(input.memoryType || '').trim() as FirmMemoryType;
  const label = String(input.label || '').trim();
  if (!memoryType || !label) return JSON.stringify({ error: 'memoryType and label are required' });

  const memory = await upsertFirmMemory(userId, {
    memoryType,
    label,
    text: input.text == null ? undefined : String(input.text),
    value: input.value && typeof input.value === 'object' && !Array.isArray(input.value) ? input.value : undefined,
    confidence: input.confidence == null ? undefined : Number(input.confidence),
    status: input.status === 'archived' ? 'archived' : 'active',
  });

  await recordV19UsageEvent({
    userId,
    eventType: 'tool_call',
    actionId: 'update_firm_memory',
    toolName: 'update_firm_memory',
    sourceSurface: 'chat',
    resourceType: 'firm_memory',
    resourceId: memory.id,
    metadata: {
      memoryType: memory.memoryType,
      label: memory.label,
      status: memory.status,
    },
  });

  return JSON.stringify({
    success: true,
    memory,
    v19Usage: await readV19UsageMeter(userId),
  });
}

async function lookupCitationTool(input: Record<string, any>, userId: number): Promise<string> {
  const citeTag = String(input.authorityId || input.citeTag || '').trim();
  if (!citeTag) return JSON.stringify({ error: 'citeTag or authorityId is required' });
  await recordV19UsageEvent({
    userId,
    eventType: 'tool_call',
    actionId: 'lookup_citation',
    toolName: 'lookup_citation',
    sourceSurface: 'chat',
    resourceType: citeTag.startsWith('AUTH.') ? 'authority' : 'citation',
    resourceId: citeTag,
  });
  const validation = await validateCitationTags([citeTag]);
  const authority = await lookupAuthority(citeTag);
  const [row] = await sql`
    SELECT cite_tag, authority_id, category, description, current_value, source_url, as_of_date, validated_at, status
    FROM citation_registry
    WHERE cite_tag = ${citeTag}
       OR authority_id = ${citeTag}
    LIMIT 1
  `;
  return JSON.stringify({
    found: !!authority || !!row,
    active: validation.active.includes(citeTag) || authority?.status === 'active',
    authority,
    citation: row || null,
    validation,
  });
}

async function fetchMarketDataTool(input: Record<string, any>, userId: number): Promise<string> {
  const seriesId = String(input.seriesId || '').trim();
  if (!seriesId) return JSON.stringify({ error: 'seriesId is required' });
  const gate = await checkV19Entitlement(userId, 'api_call', {
    actionId: 'fetch_market_data',
    toolName: 'fetch_market_data',
    sourceSurface: 'chat',
    resourceType: 'market_data_series',
    resourceId: seriesId,
  });
  if (!gate.allowed) return stringifyV19Tollgate(gate);

  const [row] = await sql`
    SELECT series_id, value, as_of_date, source, source_url, cite_tag, fetched_at, metadata
    FROM market_data_cache
    WHERE series_id = ${seriesId}
    ORDER BY as_of_date DESC NULLS LAST, fetched_at DESC
    LIMIT 1
  `;
  await recordV19UsageEvent({
    userId,
    eventType: 'api_call',
    actionId: 'fetch_market_data',
    toolName: 'fetch_market_data',
    sourceSurface: 'chat',
    resourceType: 'market_data_series',
    resourceId: seriesId,
    metadata: { found: !!row },
  });
  return JSON.stringify({ found: !!row, seriesId, data: row || null, v19Usage: await readV19UsageMeter(userId) });
}

async function deferToCounselTool(input: Record<string, any>, userId: number, conversationId: number): Promise<string> {
  const triggerCode = String(input.triggerCode || '').trim();
  const contextText = String(input.contextText || '').trim();
  const dealId = input.dealId == null ? null : Number(input.dealId);
  if (!triggerCode || !contextText) return JSON.stringify({ error: 'triggerCode and contextText are required' });
  if (dealId && !(await hasDealAccess(dealId, userId))) return JSON.stringify({ error: 'Deal not found' });

  const briefingPacket = {
    triggerCode,
    contextText,
    userInstruction: 'Defer legal/tax conclusion to qualified counsel. Yulia may summarize facts and prepare questions.',
    createdAt: new Date().toISOString(),
  };
  const [row] = await sql`
    INSERT INTO legal_defer_log (deal_id, session_id, trigger_code, context_text, briefing_packet, user_id)
    VALUES (
      ${dealId || null},
      ${`conversation:${conversationId}`},
      ${triggerCode},
      ${contextText},
      ${JSON.stringify(briefingPacket)}::jsonb,
      ${userId}
    )
    RETURNING id, created_at
  `;

  return JSON.stringify({ success: true, deferLogId: row.id, briefingPacket });
}

async function updateTaxPositionTool(input: Record<string, any>, userId: number): Promise<string> {
  const dealId = Number(input.dealId);
  if (!Number.isFinite(dealId) || dealId <= 0) return JSON.stringify({ error: 'dealId is required' });
  if (!(await hasDealAccess(dealId, userId))) return JSON.stringify({ error: 'Deal not found' });
  const dealType = String(input.dealType || '').trim();
  if (!dealType) return JSON.stringify({ error: 'dealType is required' });

  const notes = {
    entityType: input.entityType ?? null,
    sElectionYears: input.sElectionYears ?? null,
    recordedBy: 'yulia-tool',
  };
  const [row] = await sql`
    INSERT INTO tax_position_registry (
      deal_id, deal_type, structure_notes, rollover_pct, rollover_path, earnout_method,
      qsbs_eligible, qsbs_state_conformity, s382_relevant, s163j_relevant, s168k_pct,
      international, notes_jsonb
    )
    VALUES (
      ${dealId},
      ${dealType},
      ${nullableString(input.structureNotes)},
      ${nullableNumber(input.rolloverPct)},
      ${nullableString(input.rolloverPath)},
      ${nullableString(input.earnoutMethod)},
      ${nullableBoolean(input.qsbsEligible)},
      ${nullableString(input.qsbsStateConformity)},
      ${nullableBoolean(input.s382Relevant)},
      ${nullableBoolean(input.s163jRelevant)},
      ${nullableNumber(input.s168kPct)},
      ${nullableBoolean(input.international) ?? false},
      ${JSON.stringify(notes)}::jsonb
    )
    RETURNING id, updated_at
  `;
  return JSON.stringify({ success: true, taxPositionId: row.id });
}

async function writeAuditTrailTool(input: Record<string, any>, userId: number, conversationId: number): Promise<string> {
  const payload = {
    modelStack: asRecord(input.modelStack),
    inputsUsed: asRecord(input.inputsUsed),
    liveDataSnapshots: asRecord(input.liveDataSnapshots),
    citationsValidated: asRecord(input.citationsValidated),
    mode2Triggers: asRecord(input.mode2Triggers),
  };
  const outputHash = String(input.outputHash || hashForAudit(payload));
  const mandateContext = await resolveDefinitiveMandateContext({
    userId,
    organizationId: input.organizationId == null ? null : Number(input.organizationId),
    billingOrgId: input.billingOrgId == null ? null : Number(input.billingOrgId),
    sourceAgent: nullableString(input.sourceAgent),
    agentId: input.agentId == null ? null : String(input.agentId),
    agentPlatformId: nullableString(input.agentPlatformId),
    mandateId: nullableString(input.mandateId),
    requestedScopes: Array.isArray(input.requiredScopes) ? input.requiredScopes.map(String) : [],
    sourceSurface: nullableString(input.sourceSurface) || 'chat',
    metadata: asRecord(input.metadata),
  });
  const [row] = await sql`
    INSERT INTO audit_trail (
      session_id, deal_id, user_id, conversation_id, turn_id, journey, league, deal_type,
      model_stack, inputs_used, live_data_snapshots, citations_validated, mode_2_triggers, output_hash,
      spec_version, spec_uri, methodology_version, methodology_uri,
      beneficial_customer_id, billing_org_id, mandate_id, agent_id, agent_platform_id, mandate_chain
    )
    VALUES (
      ${String(input.sessionId || `conversation:${conversationId}`)},
      ${input.dealId == null ? null : Number(input.dealId)},
      ${userId},
      ${conversationId},
      ${String(input.turnId || `tool:${Date.now()}`)},
      ${nullableString(input.journey)},
      ${nullableString(input.league)},
      ${nullableString(input.dealType)},
      ${JSON.stringify(payload.modelStack)}::jsonb,
      ${JSON.stringify(payload.inputsUsed)}::jsonb,
      ${JSON.stringify(payload.liveDataSnapshots)}::jsonb,
      ${JSON.stringify(payload.citationsValidated)}::jsonb,
      ${JSON.stringify(payload.mode2Triggers)}::jsonb,
      ${outputHash},
      ${DEFINITIVE_SPEC_VERSION},
      ${DEFINITIVE_SPEC_URI},
      ${DEFINITIVE_METHODOLOGY_VERSION},
      ${DEFINITIVE_METHODOLOGY_URI},
      ${input.beneficialCustomerId == null ? mandateContext.beneficialCustomerId : Number(input.beneficialCustomerId)},
      ${input.billingOrgId == null ? mandateContext.billingOrgId : Number(input.billingOrgId)},
      ${nullableString(input.mandateId) || mandateContext.mandateId},
      ${input.agentId == null ? mandateContext.agentId : String(input.agentId)},
      ${nullableString(input.agentPlatformId) || mandateContext.agentPlatformId},
      ${JSON.stringify(input.mandateChain || mandateContext.mandateChain)}::jsonb
    )
    RETURNING id, created_at
  `;
  return JSON.stringify({ success: true, auditTrailId: row.id, outputHash });
}

function normalizeV19Journey(value: unknown): V19Journey {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'sell' || normalized === 'buy' || normalized === 'raise' || normalized === 'pmi') {
    return normalized;
  }
  return 'buy';
}

function normalizeV19League(value: unknown): League | null {
  const normalized = String(value || '').trim().toUpperCase();
  return /^L([1-9]|10)$/.test(normalized) ? normalized as League : null;
}

function asRecord(value: unknown): Record<string, any> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, any> : {};
}

function nullableString(value: unknown): string | null {
  const text = String(value ?? '').trim();
  return text ? text : null;
}

function nullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

const OUTPUT_DOC_TYPES = [
  'term_sheet',
  'loi',
  'ioi',
  'diligence_request',
  'data_room_index',
  'funds_flow',
  'negotiation_brief',
  'pmi_plan',
  'cim',
  'ic_memo',
  'valuation_report',
] as const;

function parseJsonResult(value: string): Record<string, any> {
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : { raw: parsed };
  } catch {
    return { raw: value };
  }
}

function normalizeNumberArray(value: unknown): number[] {
  return Array.isArray(value)
    ? value
        .map(item => Number(item))
        .filter(item => Number.isFinite(item) && item > 0)
        .map(item => Math.floor(item))
    : [];
}

function normalizeOutputDocumentType(value: unknown): string {
  const normalized = String(value || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (normalized === 'termsheet' || normalized === 'term_sheet_analysis') return 'term_sheet';
  if (normalized === 'letter_of_intent' || normalized === 'loi_draft' || normalized === 'loi_outline') return 'loi';
  if (normalized === 'indication_of_interest') return 'ioi';
  if (normalized === 'data_room' || normalized === 'data_room_structure') return 'data_room_index';
  if (normalized === 'fundsflow') return 'funds_flow';
  if (normalized === 'negotiation') return 'negotiation_brief';
  if (normalized === 'pmi' || normalized === '100_day_plan') return 'pmi_plan';
  if (normalized === 'confidential_information_memorandum') return 'cim';
  if (normalized === 'investment_committee_memo' || normalized === 'ic_deck') return 'ic_memo';
  if (normalized === 'valuation') return 'valuation_report';
  return normalized;
}

function resolveOutputDocMenuItem(documentType: string, journeyValue: unknown) {
  const journey = normalizeV19Journey(journeyValue);
  const forJourney = {
    sell: {
      term_sheet: 'sell-loi-comparison',
      loi: 'sell-loi-comparison',
      ioi: 'sell-buyer-brief',
      diligence_request: 'sell-dd-checklist',
      data_room_index: 'sell-data-room-structure',
      funds_flow: 'sell-funds-flow',
      negotiation_brief: 'sell-deal-structure-analysis',
      cim: 'sell-cim',
      valuation_report: 'sell-valuation-report',
    },
    buy: {
      term_sheet: 'buy-loi-draft',
      loi: 'buy-loi-draft',
      ioi: 'buy-deal-scorecard',
      diligence_request: 'buy-dd-checklist',
      data_room_index: 'buy-dd-checklist',
      funds_flow: 'buy-funds-flow',
      negotiation_brief: 'buy-capital-structure',
      ic_memo: 'buy-dd-summary',
      valuation_report: 'buy-valuation-model',
    },
    raise: {
      term_sheet: 'raise-term-sheet-analysis',
      loi: 'raise-term-sheet-analysis',
      ioi: 'raise-readiness-assessment',
      diligence_request: 'raise-data-room-structure',
      data_room_index: 'raise-data-room-structure',
      negotiation_brief: 'raise-counter-proposal',
      pmi_plan: 'pmi-100-day-plan',
      ic_memo: 'raise-pitch-deck',
      valuation_report: 'raise-pre-post-model',
    },
    pmi: {
      pmi_plan: 'pmi-100-day-plan',
      diligence_request: 'pmi-ops-assessment',
      data_room_index: 'pmi-day-zero-checklist',
      negotiation_brief: 'pmi-strategic-roadmap',
    },
  } as const;
  const menuItemSlug = (forJourney[journey] as Record<string, string | undefined> | undefined)?.[documentType]
    || (forJourney.buy as Record<string, string | undefined>)[documentType]
    || null;
  const definitiveDocumentType = documentType === 'term_sheet' ? 'loi_outline' : documentType;
  return { menuItemSlug, definitiveDocumentType };
}

function payloadFromDealForAgentDoc(deal: Record<string, any>, modelDependencies: Record<string, any>[]) {
  return {
    dealId: Number(deal.id),
    targetName: deal.business_name || null,
    journey: deal.journey_type || null,
    currentGate: deal.current_gate || null,
    league: deal.league || null,
    industry: deal.industry || null,
    location: deal.location || null,
    jurisdiction: deal.jurisdiction || null,
    revenueCents: nullableNumber(deal.revenue),
    sdeCents: nullableNumber(deal.sde),
    ebitdaCents: nullableNumber(deal.ebitda),
    enterpriseValueCents: nullableNumber(deal.asking_price),
    dealType: deal.deal_type || null,
    financials: asRecord(deal.financials),
    modelOutputs: modelDependencies,
  };
}

async function readModelDependencySummaries(userId: number, ids: number[], currentAssumptions: Record<string, any>) {
  if (!ids.length) return [];
  const rows = await sql`
    SELECT id, model_id, status, deal_id, model_type, model_title, input_hash, output_hash,
           missing_inputs, citation_tags, model_output, version_snapshot, client_version_number,
           parent_output_hash, deal_state_cid, source_surface, line_boundary, created_at
    FROM model_executions
    WHERE user_id = ${userId}
      AND id IN ${sql(ids)}
    ORDER BY created_at DESC
  `;
  return rows.map(row => {
    const execution = {
      executionId: Number(row.id),
      modelId: row.model_id,
      modelSlotId: row.model_output?.schema === 'ModelOutput.v0.1' ? row.model_output?.modelId || null : null,
      modelType: row.model_type || null,
      modelTitle: row.model_title || null,
      status: row.status,
      dealId: row.deal_id == null ? null : Number(row.deal_id),
      inputHash: row.input_hash,
      outputHash: row.output_hash,
      parentOutputHash: row.parent_output_hash || null,
      dealStateCid: row.deal_state_cid || null,
      sourceSurface: row.source_surface || null,
      lineBoundary: row.line_boundary || null,
      clientVersionNumber: Number(row.client_version_number || 1),
      modelOutput: row.model_output || {},
      versionSnapshot: row.version_snapshot || {},
      missingInputs: Array.isArray(row.missing_inputs) ? row.missing_inputs : [],
      citationTags: Array.isArray(row.citation_tags) ? row.citation_tags : [],
      createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    };
    const savedAssumptions = extractAssumptionsFromModelExecution(execution);
    return {
      ...execution,
      freshness: buildModelFreshnessEnvelope({
        modelType: execution.modelType,
        currentAssumptions,
        savedAssumptions,
        savedVersionNumber: execution.clientVersionNumber,
      }),
    };
  });
}

function buildOutputDocDependencyGate(dependencyIds: number[], modelDependencies: Array<Record<string, any>>) {
  const foundIds = new Set(modelDependencies.map(dep => Number(dep.executionId)));
  const missingExecutionIds = dependencyIds.filter(id => !foundIds.has(Number(id)));
  const notComplete = modelDependencies.filter(dep => dep.status && dep.status !== 'complete');
  const needsRerun = modelDependencies.filter(dep => dep.freshness?.status === 'needs_rerun');
  const superseded = modelDependencies.filter(dep => dep.freshness?.status === 'superseded');
  const unknown = modelDependencies.filter(dep => !dep.freshness || dep.freshness.status === 'unknown');
  const missingInputs = modelDependencies.filter(dep => Array.isArray(dep.missingInputs) && dep.missingInputs.length > 0);

  const status = !dependencyIds.length
    ? 'model_execution_required'
    : missingExecutionIds.length
      ? 'model_dependency_missing'
      : notComplete.length || missingInputs.length
        ? 'model_execution_not_ready'
        : needsRerun.length
          ? 'model_refresh_required'
          : superseded.length
            ? 'model_superseded'
            : unknown.length
              ? 'model_freshness_unknown'
              : 'ready';

  return {
    schema: 'ModelDependencyGate.v0.1',
    status,
    ready: status === 'ready',
    requestedExecutionIds: dependencyIds,
    foundExecutionIds: [...foundIds],
    missingExecutionIds,
    needsRerunExecutionIds: needsRerun.map(dep => dep.executionId),
    supersededExecutionIds: superseded.map(dep => dep.executionId),
    unknownFreshnessExecutionIds: unknown.map(dep => dep.executionId),
    notReadyExecutionIds: notComplete.map(dep => dep.executionId),
    missingInputExecutionIds: missingInputs.map(dep => dep.executionId),
    yuliaReadable: status === 'ready'
      ? 'Model dependencies are current against the compared assumptions.'
      : status === 'model_execution_required'
        ? 'No model execution is linked to this document request yet.'
        : status === 'model_dependency_missing'
          ? 'One or more requested model executions could not be found for this user.'
          : status === 'model_refresh_required'
            ? 'One or more linked model executions need a rerun before this document should be relied on.'
            : status === 'model_superseded'
              ? 'One or more linked model executions are superseded by newer assumptions or versions.'
              : status === 'model_freshness_unknown'
                ? 'One or more linked model executions cannot be freshness-checked against the current assumptions.'
                : 'One or more linked model executions are incomplete or have missing inputs.',
    next_suggested_calls: status === 'ready'
      ? ['generate_output_doc', 'compose_document_draft']
      : ['list_model_executions', 'run_model_iteration', 'compose_model_stack'],
  };
}

function buildOutputDocNextCalls(
  documentType: string,
  dependencyIds: number[],
  generated: Record<string, any> | null,
  dependencyGate?: Record<string, any>,
) {
  const calls = dependencyIds.length ? ['list_model_executions'] : ['compose_model_stack', 'run_model_iteration'];
  if (dependencyGate && dependencyGate.status !== 'ready') calls.push('run_model_iteration');
  if (generated?.deliverableId) calls.push('compose_document_draft');
  if (documentType === 'term_sheet' || documentType === 'loi') calls.push('prepare_negotiation_brief');
  return [...new Set(calls)];
}

function dealAssumptionsForModelFreshness(deal: Record<string, any>) {
  const financials = asRecord(deal.financials);
  const enterpriseValue = nullableNumber(deal.asking_price) ?? nullableNumber(financials.enterpriseValueCents) ?? nullableNumber(financials.enterpriseValue);
  return {
    ...financials,
    revenue: nullableNumber(deal.revenue) ?? nullableNumber(financials.revenue),
    revenueCents: nullableNumber(deal.revenue) ?? nullableNumber(financials.revenueCents),
    sde: nullableNumber(deal.sde) ?? nullableNumber(financials.sde),
    sdeCents: nullableNumber(deal.sde) ?? nullableNumber(financials.sdeCents),
    ebitda: nullableNumber(deal.ebitda) ?? nullableNumber(financials.ebitda),
    ebitdaCents: nullableNumber(deal.ebitda) ?? nullableNumber(financials.ebitdaCents),
    enterpriseValue,
    ev: enterpriseValue,
    askingPrice: nullableNumber(deal.asking_price) ?? nullableNumber(financials.askingPrice),
    purchasePrice: nullableNumber(financials.purchasePrice) ?? enterpriseValue,
    salePrice: nullableNumber(financials.salePrice) ?? enterpriseValue,
    league: deal.league || financials.league || null,
  };
}

async function readModelExecutionForIteration(userId: number, executionId: number) {
  if (!Number.isFinite(executionId) || executionId <= 0) return null;
  const [row] = await sql`
    SELECT id, model_id, status, deal_id, user_id, inputs, outputs, missing_inputs,
           citation_tags, output_hash, canvas_tab_id, model_type, model_title,
           client_version_number, version_snapshot
    FROM model_executions
    WHERE id = ${Math.floor(executionId)}
      AND user_id = ${userId}
    LIMIT 1
  `;
  return row || null;
}

function nullableBoolean(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null;
}

function hashForAudit(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

const ANALYSIS_TYPES = new Set([
  'auto',
  'deal_scorecard',
    'buyer_fit',
    'comps',
    'valuation',
    'qoe',
    'lbo',
    'dcf',
    'sensitivity',
    'recast',
    'market_intelligence',
    'sba',
    'capital_structure',
    'covenant',
    'red_flags',
    'working_capital',
    'tax_impact',
    'purchase_price_allocation',
    'tax_structure',
    'legal_structure',
    'tax_legal_structure',
    'term_sheet',
    'earnout',
    'cap_table',
    'pmi_value_creation',
  ]);

async function runAnalysis(input: Record<string, any>, userId: number, conversationId?: number | null): Promise<string> {
  const { dealId, modelPreference } = input;
  const analysisType = normalizeAnalysisType(input.analysisType);
  if (!dealId || !analysisType) {
    return JSON.stringify({ error: 'dealId and a valid analysisType are required' });
  }

  const [deal] = await sql`
    SELECT id, business_name, journey_type, current_gate, user_id, league,
           industry, location, revenue, sde, ebitda, asking_price, financials, status
    FROM deals
    WHERE id = ${dealId} AND user_id = ${userId}
    LIMIT 1
  `;
  if (!deal) return JSON.stringify({ error: 'Deal not found' });

  const menuItemSlug = resolveAnalysisMenuItemSlug({
    analysisType,
    journeyType: deal.journey_type,
    currentGate: deal.current_gate,
  });

  const marketProfile = analysisType === 'market_intelligence'
    ? await ensureMarketIntelligenceProfileForDeal({
        userId,
        dealId: Number(dealId),
        triggerReason: 'run_market_intelligence_analysis',
        sourceSurface: 'analysis_canvas',
        sourceAgent: 'yulia-run-analysis',
      })
    : null;

  const baseAnalysisData = buildDeterministicAnalysis({
    analysisType,
    deal: deal as DeterministicDealRow,
    menuItemSlug,
  });
  const analysisData = enrichAnalysisWithMarketIntelligenceProfile(baseAnalysisData, marketProfile);

  const resultText = await generateDealDeliverable({ dealId, menuItemSlug, modelPreference }, userId);
  let result: Record<string, any>;
  try {
    result = JSON.parse(resultText);
  } catch {
    return resultText;
  }

  if (result.error) {
    return JSON.stringify({
      ...result,
      analysisType,
      resolvedMenuItemSlug: menuItemSlug,
    });
  }

  const tabTitle = dealScopedTitle(
    deal.business_name || 'Deal',
    analysisData.title || result.title,
    humanizeAnalysisType(analysisType),
  );
  const canvasTabId = `analysis-${analysisType}-${result.deliverableId ?? Date.now()}`;
  const analysisRun = await createAnalysisRun({
    userId,
    dealId: Number(dealId),
    conversationId: conversationId ?? null,
    definitionSlug: analysisType,
    analysisType,
    title: tabTitle,
    status: 'complete',
    scope: 'deal',
    source: 'yulia_tool',
    inputPayload: {
      dealId,
      analysisType,
      resolvedMenuItemSlug: menuItemSlug,
      analysisSchemaVersion: analysisData.schemaVersion,
      requestedAt: new Date().toISOString(),
    },
    assumptions: { items: analysisData.assumptions },
    outputs: {
      deliverableId: result.deliverableId ?? null,
      jobId: result.jobId ?? null,
      deliverableStatus: result.status ?? 'queued',
      structuredAnalysis: analysisData,
    },
    commentaryMarkdown: analysisData.yuliaRead,
    marketContext: analysisData.analysisType === 'market_intelligence'
      ? {
          summary: analysisData.summary,
          metrics: analysisData.metrics,
          charts: analysisData.charts,
          runtimeProfile: summarizeMarketIntelligenceProfile(marketProfile),
        }
      : {},
    riskFlags: analysisData.risks,
    missingData: analysisData.missingData,
    professionalTriggers: analysisData.professionalTriggers,
    canvasTabId,
    deliverableId: result.deliverableId ?? null,
    modelPreference: modelPreference ?? null,
  });

  return JSON.stringify({
    ...result,
    canvas_action: 'open_tab',
    tab: {
      id: analysisRun?.canvas_tab_id || canvasTabId,
      kind: 'analysis',
      title: tabTitle,
      dealId: Number(deal.id),
      dealTitle: deal.business_name || 'Deal',
      tool: analysisType,
      analysisRunId: analysisRun?.id ?? null,
      deliverableId: result.deliverableId ?? null,
      resolvedMenuItemSlug: menuItemSlug,
      status: 'analysis complete',
      markdown: analysisData.yuliaRead,
      analysisData,
    },
    analysisRunId: analysisRun?.id ?? null,
    analysisStatus: 'complete',
    analysisType,
    resolvedMenuItemSlug: menuItemSlug,
    analysisData,
    message: `${result.title || 'Analysis'} is open as a structured analysis canvas. The supporting deliverable is ${result.status || 'queued'} in the background. Keep chat commentary short and guide the user through the live analysis tab.`,
  });
}

function normalizeAnalysisType(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase().replace(/[\s-]+/g, '_');
  return ANALYSIS_TYPES.has(normalized) ? normalized : null;
}

function dealScopedTitle(dealName: string, rawTitle: string | null | undefined, fallback: string): string {
  const parts = stripKnownTitleScopeParts(splitTitleParts(String(rawTitle || fallback)), dealName);
  return `${dealName} · ${(parts.join(' · ') || fallback).trim()}`;
}

function cleanRepeatedTitleScope(title: string): string {
  const parts = splitTitleParts(title);
  if (parts.length < 2) return title.replace(/\s+/g, ' ').trim();
  while (parts.length > 1 && titleKey(parts[0]) === titleKey(parts[1])) {
    parts.splice(1, 1);
  }
  return parts.join(' · ');
}

function titleKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function splitTitleParts(value: string): string[] {
  return value
    .replace(/\s+/g, ' ')
    .trim()
    .split(/\s*[·:]\s*/)
    .map(part => part.trim())
    .filter(Boolean);
}

function stripKnownTitleScopeParts(parts: string[], dealName: string): string[] {
  const scopes = [
    dealName,
    'Big Fake Deal',
    'Pest Control · FL',
    'HVAC platform · CO',
    'Electrical Contractor · TX',
    'Distribution · OH',
  ];
  const next = [...parts];
  let changed = true;
  while (changed && next.length > 0) {
    changed = false;
    for (const scope of scopes) {
      const scopeParts = splitTitleParts(scope);
      const candidate = next.slice(0, scopeParts.length).join(' ');
      if (scopeParts.length > 0 && titleKey(candidate) === titleKey(scopeParts.join(' '))) {
        next.splice(0, scopeParts.length);
        changed = true;
        break;
      }
    }
  }
  return next;
}

function resolveAnalysisMenuItemSlug({
  analysisType,
  journeyType,
  currentGate,
}: {
  analysisType: string;
  journeyType?: string | null;
  currentGate?: string | null;
}): string {
  const journey = journeyType || 'buy';

  switch (analysisType) {
    case 'deal_scorecard':
      return journey === 'sell' ? 'sell-seven-factor-analysis' : 'buy-deal-scorecard';
    case 'buyer_fit':
      return journey === 'sell' ? 'sell-buyer-list' : 'buy-deal-scorecard';
      case 'comps':
        return 'universal-comp-analysis';
      case 'valuation':
        return journey === 'sell' ? 'sell-valuation-report' : journey === 'raise' ? 'raise-pre-post-model' : 'buy-valuation-model';
      case 'qoe':
        return journey === 'sell' ? 'sell-financial-spread' : journey === 'pmi' ? 'pmi-financial-deep-dive' : 'buy-deal-scorecard';
      case 'lbo':
      case 'dcf':
      case 'sensitivity':
        return journey === 'sell' ? 'sell-valuation-report' : journey === 'raise' ? 'raise-pre-post-model' : 'buy-valuation-model';
      case 'recast':
        return journey === 'sell' ? 'sell-financial-spread' : journey === 'pmi' ? 'pmi-financial-deep-dive' : 'buy-deal-scorecard';
    case 'market_intelligence':
      return 'universal-market-intelligence';
    case 'sba':
      return 'universal-sba-analysis';
      case 'capital_structure':
        return journey === 'sell' ? 'sell-deal-structure-analysis' : journey === 'raise' ? 'raise-use-of-funds' : 'buy-capital-structure';
      case 'covenant':
        return journey === 'raise' ? 'raise-use-of-funds' : 'buy-capital-structure';
    case 'red_flags':
      return journey === 'buy' ? 'buy-red-flag-report' : journey === 'pmi' ? 'pmi-ops-assessment' : 'sell-price-gap-analysis';
      case 'working_capital':
        return journey === 'sell' ? 'sell-working-capital-analysis' : 'buy-working-capital-model';
      case 'tax_impact':
      case 'purchase_price_allocation':
        return journey === 'sell' ? 'sell-deal-structure-analysis' : 'buy-capital-structure';
      case 'tax_structure':
      case 'legal_structure':
      case 'tax_legal_structure':
        return journey === 'sell' ? 'sell-deal-structure-analysis' : 'buy-capital-structure';
    case 'term_sheet':
      return journey === 'raise' ? 'raise-term-sheet-analysis' : journey === 'sell' ? 'sell-loi-comparison' : 'buy-loi-draft';
      case 'pmi_value_creation':
        return 'pmi-value-creation';
      case 'earnout':
        return journey === 'sell' ? 'sell-deal-structure-analysis' : 'buy-earnout-analysis';
      case 'cap_table':
        return 'raise-cap-table';
    case 'auto':
    default:
      return resolveDefaultAnalysisSlug(journey, currentGate);
  }
}

function resolveDefaultAnalysisSlug(journey?: string | null, currentGate?: string | null): string {
  if (journey === 'sell') {
    if (currentGate === 'S5' || currentGate === 'S6') return 'sell-deal-structure-analysis';
    if (currentGate === 'S4') return 'sell-loi-comparison';
    if (currentGate === 'S2' || currentGate === 'S3') return 'sell-seven-factor-analysis';
    return 'sell-financial-spread';
  }

  if (journey === 'raise') {
    if (currentGate === 'R4') return 'raise-term-sheet-analysis';
    if (currentGate === 'R2' || currentGate === 'R3') return 'raise-investor-list';
    return 'raise-unit-economics';
  }

  if (journey === 'pmi') {
    if (currentGate === 'PMI3') return 'pmi-value-creation';
    if (currentGate === 'PMI2') return 'pmi-financial-deep-dive';
    return 'pmi-swot';
  }

  if (currentGate === 'B4' || currentGate === 'B5') return 'buy-capital-structure';
  if (currentGate === 'B3') return 'buy-red-flag-report';
  if (currentGate === 'B2') return 'buy-valuation-model';
  return 'buy-deal-scorecard';
}

function humanizeAnalysisType(value: string): string {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

async function fileDeliverableToDataRoom(input: Record<string, any>, userId: number): Promise<string> {
  const { dealId, deliverableId, folderName } = input;
  if (!dealId || !deliverableId) return JSON.stringify({ error: 'dealId and deliverableId are required' });

  const access = await hasDealAccess(dealId, userId);
  if (!access) return JSON.stringify({ error: 'Deal not found' });
  if (access.access_level === 'read') return JSON.stringify({ error: 'Read-only access cannot file documents' });

  const [deliverable] = await sql`
    SELECT d.id, d.status, d.menu_item_id, m.name
    FROM deliverables d
    JOIN menu_items m ON m.id = d.menu_item_id
    WHERE d.id = ${deliverableId} AND d.deal_id = ${dealId}
    LIMIT 1
  `;
  if (!deliverable) return JSON.stringify({ error: 'Deliverable not found' });

  let folderId: number | null = null;
  if (folderName) {
    const [folder] = await sql`
      SELECT id
      FROM data_room_folders
      WHERE deal_id = ${dealId} AND lower(name) = lower(${folderName})
      LIMIT 1
    `.catch(() => [null]);
    folderId = folder?.id ?? null;
  }
  if (!folderId) {
    const [folder] = await sql`
      SELECT id FROM data_room_folders
      WHERE deal_id = ${dealId}
      ORDER BY sort_order ASC, id ASC
      LIMIT 1
    `.catch(() => [null]);
    folderId = folder?.id ?? null;
  }

  const [doc] = await sql`
    INSERT INTO data_room_documents (deal_id, folder_id, user_id, deliverable_id, name, file_type, status)
    VALUES (${dealId}, ${folderId}, ${userId}, ${deliverableId}, ${deliverable.name || 'Deliverable'}, 'deliverable', 'draft')
    ON CONFLICT DO NOTHING
    RETURNING id, name, status
  `;

  return JSON.stringify({
    success: true,
    documentId: doc?.id ?? null,
    deliverableId,
    status: doc?.status || 'draft',
    message: `"${deliverable.name || 'Deliverable'}" is now filed in the data room.`,
    canvas_action: 'open_tab',
    tab: {
      id: String(dealId),
      kind: 'deal',
      title: `Deal #${dealId}`,
      fileScope: 'data-room',
    },
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
  lines.push(`**Market Heat:** ${result.demandSignal || 'moderate'}\n`);
  if (result.matchingThesesCount) {
    lines.push(`**Active buyer theses matching your profile:** ${result.matchingThesesCount}`);
  }
  if (result.summary) lines.push(`\n${result.summary}`);

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

async function createModelTab(input: Record<string, any>, userId: number, conversationId?: number | null): Promise<string> {
  const { modelType, title, initialAssumptions } = input;
  const [contextDeal] = conversationId
    ? await sql`
        SELECT d.id, d.business_name
        FROM analysis_runs ar
        JOIN deals d ON d.id = ar.deal_id
        WHERE ar.user_id = ${userId}
          AND ar.conversation_id = ${conversationId}
          AND ar.deal_id IS NOT NULL
        ORDER BY ar.created_at DESC
        LIMIT 1
      `
    : [];
  const rawModelTitle = cleanRepeatedTitleScope(String(title || `${modelType || 'Interactive'} model`));
  const modelTitle = contextDeal?.business_name
    ? dealScopedTitle(String(contextDeal.business_name), rawModelTitle, `${modelType || 'Interactive'} model`)
    : rawModelTitle;
  const tabId = `model-${modelType || 'analysis'}-${Date.now()}`;
  const analysisRun = await createAnalysisRun({
    userId,
    dealId: contextDeal?.id ? Number(contextDeal.id) : null,
    conversationId: conversationId ?? null,
    definitionSlug: modelType || 'interactive_model',
    analysisType: modelType || 'interactive_model',
    title: modelTitle,
    status: 'complete',
    scope: 'deal',
    source: 'yulia_tool',
    inputPayload: {
      modelType,
      requestedAt: new Date().toISOString(),
      dealId: contextDeal?.id ? Number(contextDeal.id) : null,
      dealTitle: contextDeal?.business_name ?? null,
    },
    assumptions: initialAssumptions || {},
    outputs: { modelType, state: initialAssumptions || {} },
    canvasTabId: tabId,
  });
  await createModelTabRecord({
    analysisRunId: analysisRun?.id ?? null,
    conversationId: conversationId ?? null,
    tabId,
    modelType: modelType || 'interactive_model',
    title: modelTitle,
    state: initialAssumptions || {},
    sourcePayload: {
      input,
      dealId: contextDeal?.id ? Number(contextDeal.id) : null,
      dealTitle: contextDeal?.business_name ?? null,
    },
  });

  return JSON.stringify({
    success: true,
    canvas_action: 'create_model_tab',
    modelType,
    title: modelTitle,
    dealId: contextDeal?.id ? Number(contextDeal.id) : null,
    dealTitle: contextDeal?.business_name ?? null,
    tabId,
    analysisRunId: analysisRun?.id ?? null,
    initialAssumptions: initialAssumptions || {},
    message: `I've opened a versioned ${modelTitle} model on your canvas. Adjust the assumptions with the inputs, or tell me what to change; each revision becomes another scenario Yulia can compare.`,
  });
}

function assumptionOverridesFromSavedState(snapshot: Record<string, any> | undefined, updates: Record<string, any>) {
  const assumptions = snapshot || {};
  const overrides: Record<string, any> = {};
  const items = Array.isArray(assumptions.items) ? assumptions.items : [];
  for (const item of items) {
    if (item?.key) overrides[item.key] = item.value ?? item.displayValue;
  }
  for (const [key, value] of Object.entries(assumptions)) {
    if (key !== 'items') overrides[key] = value;
  }
  return { ...overrides, ...updates };
}

async function rebuildAnalysisForModelUpdate(input: {
  snapshot: Awaited<ReturnType<typeof readModelTabState>> | null;
  updates: Record<string, any>;
  userId: number;
}) {
  const run = input.snapshot?.analysisRun;
  if (!run?.id || !run.dealId || !run.analysisType) return null;

  const [deal] = await sql`
    SELECT id, business_name, journey_type, current_gate, user_id, league,
           industry, location, revenue, sde, ebitda, asking_price, financials, status
    FROM deals
    WHERE id = ${run.dealId} AND user_id = ${input.userId}
    LIMIT 1
  `;
  if (!deal) return null;

  const analysisData = buildDeterministicAnalysis({
    analysisType: run.analysisType,
    deal: deal as DeterministicDealRow,
    menuItemSlug: run.inputPayload?.resolvedMenuItemSlug ?? null,
    assumptionOverrides: assumptionOverridesFromSavedState(run.assumptions, input.updates),
  });
  const updated = await updateAnalysisRunSnapshot({
    analysisRunId: run.id,
    userId: input.userId,
    assumptionUpdates: {
      ...input.updates,
      items: analysisData.assumptions,
    },
    outputUpdates: { structuredAnalysis: analysisData },
    commentaryMarkdown: analysisData.yuliaRead,
    changeReason: 'Yulia update_model recalculation',
  });

  return { analysisData, updated };
}

async function updateModel(input: Record<string, any>, userId: number, conversationId?: number | null): Promise<string> {
  const { tabId, updates } = input;
  const cleanUpdates = updates && typeof updates === 'object' && !Array.isArray(updates) ? updates : {};
  const before = await readModelTabState({
    conversationId: conversationId ?? null,
    userId,
    tabId: tabId || 'active',
  });
  const recalculated = await rebuildAnalysisForModelUpdate({ snapshot: before, updates: cleanUpdates, userId });
  const snapshot = await updateModelTabState({
    conversationId: conversationId ?? null,
    userId,
    tabId: tabId || 'active',
    updates: cleanUpdates,
    changeReason: 'Yulia update_model tool',
    skipAnalysisRunUpdate: Boolean(recalculated),
  });

  return JSON.stringify({
    success: true,
    canvas_action: 'update_model',
    tabId: tabId || 'active',
    updates: cleanUpdates,
    state: snapshot?.state ?? cleanUpdates,
    analysisRunId: recalculated?.updated?.id ?? snapshot?.analysisRunId ?? null,
    analysisData: recalculated?.analysisData ?? snapshot?.analysisRun?.outputs?.structuredAnalysis ?? null,
    versionNumber: recalculated?.updated?.versionNumber ?? snapshot?.versionNumber ?? snapshot?.analysisRun?.versionNumber ?? null,
    message: snapshot
      ? `I've updated the model and saved version ${recalculated?.updated?.versionNumber ?? snapshot.versionNumber ?? 'the latest'} on the canvas.`
      : `I've updated the visible canvas state. Save may be unavailable until this tab is linked to an analysis run.`,
  });
}

async function readTabState(input: Record<string, any>, userId: number, conversationId?: number | null): Promise<string> {
  const tabId = input.tabId || 'active';
  const snapshot = await readModelTabState({
    conversationId: conversationId ?? null,
    userId,
    tabId,
  });

  return JSON.stringify({
    success: Boolean(snapshot),
    canvas_action: 'read_tab_state',
    tabId,
    title: snapshot?.title ?? null,
    modelType: snapshot?.modelType ?? null,
    state: snapshot?.state ?? null,
    sourcePayload: snapshot?.sourcePayload ?? null,
    analysisRunId: snapshot?.analysisRunId ?? null,
    analysisData: snapshot?.analysisRun?.outputs?.structuredAnalysis ?? null,
    evidence: snapshot?.analysisRun?.evidence ?? [],
    versionNumber: snapshot?.versionNumber ?? snapshot?.analysisRun?.versionNumber ?? null,
    message: snapshot
      ? `I can see ${snapshot.title} on the canvas, including the latest saved assumptions, outputs, and evidence trail.`
      : `I couldn't find saved state for that canvas tab yet. I can still work from what's visible in the app surface context.`,
  });
}

function pickEnum(value: unknown, allowed: string[], fallback: string): string {
  return typeof value === 'string' && allowed.includes(value) ? value : fallback;
}

async function optimizeScenario(input: Record<string, any>, userId: number, conversationId?: number | null): Promise<string> {
  const tabId = typeof input.tabId === 'string' && input.tabId.trim() ? input.tabId.trim() : 'active';
  const role = pickEnum(input.role, ['auto', 'buyer', 'seller', 'raiser', 'divestor', 'advisor'], 'auto');
  const riskTolerance = pickEnum(input.riskTolerance, ['auto', 'conservative', 'balanced', 'aggressive'], 'auto');
  const objective = typeof input.objective === 'string' && input.objective.trim()
    ? input.objective.trim()
    : 'best risk-adjusted transaction outcome';
  const requestedScenario = typeof input.scenarioName === 'string' && input.scenarioName.trim()
    ? input.scenarioName.trim()
    : null;

  const snapshot = await readModelTabState({
    conversationId: conversationId ?? null,
    userId,
    tabId,
  });

  const fallbackRunId = Number(input.analysisRunId);
  const analysisRun = snapshot?.analysisRun
    ?? (Number.isFinite(fallbackRunId) && fallbackRunId > 0
      ? await readAnalysisRunSnapshot(fallbackRunId, userId)
      : null);
  const analysisData = analysisRun?.outputs?.structuredAnalysis ?? null;
  const assumptions = analysisRun?.assumptions ?? snapshot?.state ?? {};
  const savedScenarioName =
    requestedScenario
    ?? (typeof assumptions?.scenarioName === 'string' ? assumptions.scenarioName : null)
    ?? (typeof assumptions?.label === 'string' ? assumptions.label : null)
    ?? null;

  if (!snapshot && !analysisRun) {
    return JSON.stringify({
      success: false,
      canvas_action: 'optimize_scenario',
      tabId,
      role,
      objective,
      riskTolerance,
      message: `I could not find a saved analysis/model scenario to optimize. Ask the user which canvas or analysis run to use, or run the analysis first.`,
    });
  }

  return JSON.stringify({
    success: true,
    canvas_action: 'optimize_scenario',
    tabId,
    title: snapshot?.title ?? analysisData?.title ?? null,
    modelType: snapshot?.modelType ?? analysisRun?.analysisType ?? null,
    analysisRunId: analysisRun?.id ?? snapshot?.analysisRunId ?? null,
    versionNumber: analysisRun?.versionNumber ?? snapshot?.versionNumber ?? null,
    role,
    objective,
    riskTolerance,
    scenarioName: savedScenarioName,
    state: snapshot?.state ?? null,
    assumptions,
    analysisData,
    evidence: analysisRun?.evidence ?? [],
    optimizationBrief: {
      instruction: 'Use this saved canvas state as the source of truth. Do not invent a different model in chat.',
      outputShape: [
        'Name the scenario/path Yulia would choose and why.',
        'State the key tradeoffs and constraints from the model and evidence.',
        'Explain how to get there: negotiation asks, fallback positions, reps/warranties, diligence requests, tax/legal/professional signoffs, and concrete work products.',
        'Call out what is a fact from the model versus what requires user/professional approval.',
      ],
    },
    message: `I read the current scenario${savedScenarioName ? ` (${savedScenarioName})` : ''}. Optimize for ${objective} with ${riskTolerance} risk tolerance from the ${role} posture, and give the user the recommended path plus the execution steps to get there.`,
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

// Check if a table exists before querying
async function tableExists(name: string): Promise<boolean> {
  const [r] = await sql`SELECT to_regclass('public.' || ${name}) IS NOT NULL as exists`;
  return r.exists;
}

async function queryAdminData(input: Record<string, any>, userId: number): Promise<string> {
  // Verify admin
  const [user] = await sql`SELECT email, role FROM users WHERE id = ${userId}`;
  if (!isSuperAdminUser(user)) {
    return JSON.stringify({ error: 'Admin access required' });
  }

  const { query, timeRange = '7d', limit = 20 } = input;
  const intervalMap: Record<string, string> = { '24h': '24 hours', '7d': '7 days', '30d': '30 days', '90d': '90 days' };
  const interval = intervalMap[timeRange] || '7 days';
  const hasSubs = await tableExists('subscriptions');

  switch (query) {
    case 'metrics_overview': {
      const [users] = await sql`SELECT COUNT(*)::int as total FROM users`;
      const [active] = await sql`
        SELECT COUNT(DISTINCT user_id)::int as c FROM conversations
        WHERE updated_at > NOW() - ${interval}::interval AND user_id IS NOT NULL
      `;
      const [deals] = await sql`SELECT COUNT(*)::int as total FROM deals WHERE status = 'active'`;
      const [mrr] = hasSubs
        ? await sql`SELECT COALESCE(SUM(CASE WHEN plan IN ('solo', 'starter') THEN 7900 WHEN plan IN ('pro', 'professional') THEN 19900 WHEN plan = 'team' THEN 49900 WHEN plan = 'enterprise' THEN 250000 ELSE 0 END), 0)::bigint as mrr_cents FROM subscriptions WHERE status IN ('active', 'trialing')`
        : [{ mrr_cents: 0 }];
      const [msgs] = await sql`SELECT COUNT(*)::int as c FROM messages WHERE created_at > NOW() - ${interval}::interval`;
      const [delivs] = await sql`SELECT COUNT(*)::int as c FROM deliverables WHERE created_at > NOW() - ${interval}::interval`;
      const [errors] = await sql`
        SELECT COUNT(*)::int as c FROM support_issues WHERE type = 'system_error' AND created_at > NOW() - INTERVAL '24 hours'
      `.catch(() => [{ c: 0 }]);
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
      const [withSub] = hasSubs
        ? await sql`SELECT COUNT(DISTINCT user_id)::int as c FROM subscriptions WHERE status IN ('active', 'trialing')`
        : [{ c: 0 }];
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
      const breakdown = hasSubs
        ? await sql`SELECT plan, status, COUNT(*)::int as count FROM subscriptions GROUP BY plan, status ORDER BY plan`
        : [];
      const [mrr] = hasSubs
        ? await sql`SELECT COALESCE(SUM(CASE WHEN plan IN ('solo', 'starter') THEN 7900 WHEN plan IN ('pro', 'professional') THEN 19900 WHEN plan = 'team' THEN 49900 WHEN plan = 'enterprise' THEN 250000 ELSE 0 END), 0)::bigint as mrr_cents FROM subscriptions WHERE status IN ('active', 'trialing')`
        : [{ mrr_cents: 0 }];
      return JSON.stringify({ breakdown, mrrCents: Number(mrr.mrr_cents) });
    }

    case 'engagement_7d': {
      const [msgs] = await sql`SELECT COUNT(*)::int as c FROM messages WHERE created_at > NOW() - ${interval}::interval`;
      const [delivs] = await sql`SELECT COUNT(*)::int as c FROM deliverables WHERE created_at > NOW() - ${interval}::interval`;
      const events = await sql`
        SELECT event_type, COUNT(*)::int as c FROM analytics_events
        WHERE created_at > NOW() - ${interval}::interval
        GROUP BY event_type ORDER BY c DESC LIMIT 20
      `.catch(() => []);
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
        WHERE si.type = 'system_error' AND si.created_at > NOW() - ${interval}::interval
        ORDER BY si.created_at DESC LIMIT ${limit}
      `;
      return JSON.stringify({ errors, timeRange });
    }

    case 'user_growth': {
      const growth = await sql`
        SELECT DATE_TRUNC('day', created_at)::date as day, COUNT(*)::int as signups
        FROM users WHERE created_at > NOW() - ${interval}::interval
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

/**
 * Lifecycle record tools (Phase A.1, restored from autonomous-run B2.3-2.6)
 * — chat-first flag-flippers that move deals through the gate-readiness
 * machine. Each is a small server-side tool Yulia calls when the user
 * signals an event happened in the real world. None has a UI button;
 * the user just tells Yulia. All handlers follow the same shape:
 *   1. Verify deal ownership
 *   2. Merge into financials JSONB (the canonical gate-readiness store)
 *   3. UPDATE deals
 *   4. Return canvas_action: 'open_tab' so the deal tab refreshes
 */

async function promoteSourcingTargetToDeal(input: Record<string, any>, userId: number): Promise<string> {
  const { targetId, dealId } = input;

  const [deal] = await sql`SELECT id, financials, business_name FROM deals WHERE id = ${dealId} AND user_id = ${userId} LIMIT 1`;
  if (!deal) return JSON.stringify({ error: 'Deal not found' });

  let candidate: any = null;
  try {
    const rows = await sql`SELECT * FROM sourcing_candidates WHERE id = ${targetId} LIMIT 1`;
    candidate = rows[0];
  } catch {
    return JSON.stringify({ error: 'Sourcing candidate table not found in this deployment. Run sourcing migrations first.' });
  }
  if (!candidate) return JSON.stringify({ error: 'Sourcing candidate not found' });

  const existingFin = typeof deal.financials === 'string' ? JSON.parse(deal.financials) : (deal.financials || {});
  const merged = {
    ...existingFin,
    target_criteria_set: true,
    promoted_target_id: targetId,
    promoted_at: new Date().toISOString(),
  };

  const businessName = candidate.business_name || candidate.name || candidate.title || deal.business_name;
  const industry     = candidate.industry || candidate.naics_label || null;
  const location     = candidate.location || candidate.city || null;

  await sql`
    UPDATE deals
    SET business_name = COALESCE(${businessName}, business_name),
        industry      = COALESCE(${industry}, industry),
        location      = COALESCE(${location}, location),
        financials    = ${JSON.stringify(merged)}::jsonb,
        updated_at    = NOW()
    WHERE id = ${dealId}
  `;

  return JSON.stringify({
    success: true,
    dealId,
    businessName,
    canvas_action: 'open_tab',
    tab: { id: String(dealId), kind: 'deal', title: businessName || `Deal #${dealId}` },
  });
}

async function recordDdComplete(input: Record<string, any>, userId: number): Promise<string> {
  const { dealId, findingsSummary } = input;

  const [deal] = await sql`SELECT id, financials, business_name FROM deals WHERE id = ${dealId} AND user_id = ${userId} LIMIT 1`;
  if (!deal) return JSON.stringify({ error: 'Deal not found' });

  const existing = typeof deal.financials === 'string' ? JSON.parse(deal.financials) : (deal.financials || {});
  const merged = {
    ...existing,
    dd_findings_documented: true,
    dd_completed_at: new Date().toISOString(),
    ...(findingsSummary ? { dd_findings_summary: findingsSummary } : {}),
  };

  await sql`UPDATE deals SET financials = ${JSON.stringify(merged)}::jsonb, updated_at = NOW() WHERE id = ${dealId}`;

  return JSON.stringify({
    success: true,
    dealId,
    canvas_action: 'open_tab',
    tab: { id: String(dealId), kind: 'deal', title: deal.business_name || `Deal #${dealId}` },
  });
}

async function recordLoiExecuted(input: Record<string, any>, userId: number): Promise<string> {
  const { dealId, loiDeliverableId, executionDate, signers } = input;

  const [deal] = await sql`SELECT id, financials, business_name FROM deals WHERE id = ${dealId} AND user_id = ${userId} LIMIT 1`;
  if (!deal) return JSON.stringify({ error: 'Deal not found' });

  const existing = typeof deal.financials === 'string' ? JSON.parse(deal.financials) : (deal.financials || {});
  const merged = {
    ...existing,
    deal_structure_agreed: true,
    loi_executed_at: executionDate,
    loi_signers: signers ?? [],
    ...(loiDeliverableId ? { loi_deliverable_id: loiDeliverableId } : {}),
  };

  await sql`UPDATE deals SET financials = ${JSON.stringify(merged)}::jsonb, updated_at = NOW() WHERE id = ${dealId}`;

  return JSON.stringify({
    success: true,
    dealId,
    canvas_action: 'open_tab',
    tab: { id: String(dealId), kind: 'deal', title: deal.business_name || `Deal #${dealId}` },
  });
}

async function recordFinancingSecured(input: Record<string, any>, userId: number): Promise<string> {
  const { dealId, lender, amountCents, commitmentLetterDate } = input;

  const [deal] = await sql`SELECT id, financials, business_name FROM deals WHERE id = ${dealId} AND user_id = ${userId} LIMIT 1`;
  if (!deal) return JSON.stringify({ error: 'Deal not found' });

  const existing = typeof deal.financials === 'string' ? JSON.parse(deal.financials) : (deal.financials || {});
  const merged = {
    ...existing,
    financing_secured: true,
    financing: {
      lender,
      amount_cents: amountCents,
      commitment_letter_date: commitmentLetterDate,
    },
  };

  await sql`UPDATE deals SET financials = ${JSON.stringify(merged)}::jsonb, updated_at = NOW() WHERE id = ${dealId}`;

  return JSON.stringify({
    success: true,
    dealId,
    canvas_action: 'open_tab',
    tab: { id: String(dealId), kind: 'deal', title: deal.business_name || `Deal #${dealId}` },
  });
}

async function closeDeal(input: Record<string, any>, userId: number): Promise<string> {
  const { dealId, closingDate, finalPriceCents, spawnPmi } = input;

  const [deal] = await sql`SELECT id, financials, business_name, journey_type FROM deals WHERE id = ${dealId} AND user_id = ${userId} LIMIT 1`;
  if (!deal) return JSON.stringify({ error: 'Deal not found' });

  const existing = typeof deal.financials === 'string' ? JSON.parse(deal.financials) : (deal.financials || {});
  const merged = {
    ...existing,
    closing_date: closingDate,
    final_price_cents: finalPriceCents,
    closed_at: new Date().toISOString(),
  };

  await sql`
    UPDATE deals
    SET status = 'closed',
        asking_price = COALESCE(asking_price, ${finalPriceCents}),
        financials   = ${JSON.stringify(merged)}::jsonb,
        updated_at   = NOW()
    WHERE id = ${dealId}
  `;

  // Best-effort: insert into closed_deals archive if the table exists
  // (added by 059_merger_lite.sql which already ran in production 2026-05-07).
  try {
    await sql`
      INSERT INTO closed_deals (deal_id, user_id, closing_date, final_price_cents, journey_type, business_name)
      VALUES (${dealId}, ${userId}, ${closingDate}, ${finalPriceCents}, ${deal.journey_type}, ${deal.business_name || null})
      ON CONFLICT DO NOTHING
    `;
  } catch { /* table missing in this deployment; non-fatal */ }

  let pmiDealId: number | null = null;
  if (spawnPmi && deal.journey_type === 'buy') {
    try {
      const [pmi] = await sql`
        INSERT INTO deals (user_id, journey_type, current_gate, status, business_name, industry, location)
        VALUES (${userId}, 'pmi', 'PMI0', 'active',
                ${deal.business_name ? `${deal.business_name} — PMI` : null},
                ${existing.industry || null},
                ${existing.location || null})
        RETURNING id
      `;
      pmiDealId = pmi.id;
    } catch { /* unable to spawn PMI; non-fatal */ }
  }

  return JSON.stringify({
    success: true,
    dealId,
    closingDate,
    finalPriceCents,
    pmiDealId,
    canvas_action: 'open_tab',
    tab: {
      id: String(dealId),
      kind: 'deal',
      title: deal.business_name ? `${deal.business_name} · CLOSED` : `Deal #${dealId} · CLOSED`,
    },
  });
}

/**
 * Sourcing pipeline tool (Phase A.2, restored from autonomous-run B2.2).
 * Wraps the existing 5-stage sourcingPipelineService — Stage 1 (intelligence
 * brief) runs synchronously ~30-60s, stages 2-4 fire as background jobs.
 * Returns canvas_action: 'open_sourcing' so a future SourcingPanel can mount;
 * harmless no-op on the current client (no listener for that action at
 * fd1c6b4 + Phase A — the panel is deferred until CD specs the design).
 */
async function startSourcingRun(input: Record<string, any>, userId: number): Promise<string> {
  const { initializePipeline } = await import('./sourcingPipelineService.js');

  let thesisId: number | undefined = input.thesisId;
  if (!thesisId) {
    // Fall back to the user's most recent thesis
    const [latest] = await sql`
      SELECT id, name FROM buyer_theses
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 1
    `;
    if (!latest) {
      return JSON.stringify({
        error: 'No buyer thesis found. Walk the user through B0 first so we have a thesis to source against.',
      });
    }
    thesisId = latest.id;
  } else {
    // Validate ownership
    const [t] = await sql`SELECT id FROM buyer_theses WHERE id = ${thesisId} AND user_id = ${userId} LIMIT 1`;
    if (!t) return JSON.stringify({ error: 'Thesis not found' });
  }

  const finalThesisId = thesisId as number;
  try {
    const result = await initializePipeline(finalThesisId, userId);
    const [thesis] = await sql`SELECT name FROM buyer_theses WHERE id = ${finalThesisId} LIMIT 1`;
    const title = input.title || thesis?.name || 'Sourcing run';
    return JSON.stringify({
      success: true,
      portfolioId: result.portfolioId,
      briefId: result.briefId,
      status: result.status,
      canvas_action: 'open_sourcing',
      runId: result.portfolioId,
      tabTitle: title,
    });
  } catch (e: any) {
    return JSON.stringify({ error: `Sourcing run failed to start: ${e.message}` });
  }
}

/**
 * compare_deals (Phase A.3) — restored from autonomous-run B2.9.
 *
 * Loads 2-3 owned deals and opens a side-by-side analysis surface in the
 * canvas, while preserving markdown commentary for Yulia's read.
 */
async function compareDealsTool(input: Record<string, any>, userId: number, conversationId?: number | null): Promise<string> {
  const dealIds: number[] = Array.isArray(input.dealIds) ? input.dealIds.slice(0, 3) : [];
  if (dealIds.length < 2) {
    return JSON.stringify({ error: 'Need at least two dealIds to compare.' });
  }

  // Load each deal — verify ownership and gather headline numbers.
  const deals = await Promise.all(dealIds.map(async id => {
    const [d] = await sql`
      SELECT id, business_name, journey_type, current_gate, league,
             revenue, sde, ebitda, asking_price, financials
      FROM deals
      WHERE id = ${id} AND user_id = ${userId}
      LIMIT 1
    `;
    if (!d) return null;
    const fin = typeof d.financials === 'string' ? JSON.parse(d.financials) : (d.financials || {});
    return {
      dealId: d.id,
      title: d.business_name || `Deal #${d.id}`,
      league: d.league || 'L1',
      revenueCents: d.revenue,
      sdeCents: d.sde,
      ebitdaCents: d.ebitda,
      askingPriceCents: d.asking_price,
      multiple: fin?.multiple ?? null,
      currentGate: d.current_gate,
    };
  }));

  const valid = deals.filter((d): d is NonNullable<typeof d> => d !== null);
  if (valid.length < 2) {
    return JSON.stringify({ error: 'Could not find at least two of the requested deals (ownership check or missing rows).' });
  }

  // Render markdown table for Yulia to surface inline.
  const fmt = (cents: number | null | undefined): string => {
    if (cents == null) return '—';
    const dollars = cents / 100;
    if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(2)}M`;
    if (dollars >= 1_000)     return `$${Math.round(dollars / 1_000)}K`;
    return `$${Math.round(dollars).toLocaleString()}`;
  };
  const fmtMul = (m: number | null): string => m == null ? '—' : `${m.toFixed(1)}x`;

  const header  = `| Field | ${valid.map(d => d.title).join(' | ')} |`;
  const sep     = `|---${valid.map(() => '|---').join('')}|`;
  const rows = [
    `| **League**         | ${valid.map(d => d.league).join(' | ')} |`,
    `| **Current gate**   | ${valid.map(d => d.currentGate).join(' | ')} |`,
    `| **Revenue**        | ${valid.map(d => fmt(d.revenueCents)).join(' | ')} |`,
    `| **SDE**            | ${valid.map(d => fmt(d.sdeCents)).join(' | ')} |`,
    `| **EBITDA**         | ${valid.map(d => fmt(d.ebitdaCents)).join(' | ')} |`,
    `| **Asking price**   | ${valid.map(d => fmt(d.askingPriceCents)).join(' | ')} |`,
    `| **Implied multiple** | ${valid.map(d => fmtMul(d.multiple)).join(' | ')} |`,
  ];
  const titleLine = input.title ? `**${input.title}**\n\n` : '';
  const markdown = `${titleLine}${header}\n${sep}\n${rows.join('\n')}`;
  const comparisonTabId = `comparison-${valid.map(d => d.dealId).join('-')}`;
  const comparisonAnalysis = buildDealComparisonAnalysis(valid.map(d => ({
    id: d.dealId,
    business_name: d.title,
    journey_type: undefined,
    current_gate: d.currentGate,
    league: d.league,
    revenue: d.revenueCents,
    sde: d.sdeCents,
    ebitda: d.ebitdaCents,
    asking_price: d.askingPriceCents,
    financials: { multiple: d.multiple },
  })), input.title || 'Deal comparison');
  const analysisRun = await createAnalysisRun({
    userId,
    conversationId: conversationId ?? null,
    definitionSlug: 'deal_comparison',
    analysisType: 'deal_comparison',
    title: input.title || 'Deal comparison',
    status: 'complete',
    scope: 'comparison',
    source: 'yulia_tool',
    inputPayload: {
      dealIds: valid.map(d => d.dealId),
      requestedAt: new Date().toISOString(),
    },
    outputs: {
      deals: valid,
      markdown,
      structuredAnalysis: comparisonAnalysis,
    },
    commentaryMarkdown: comparisonAnalysis.yuliaRead || markdown,
    assumptions: { items: comparisonAnalysis.assumptions },
    riskFlags: comparisonAnalysis.risks,
    missingData: comparisonAnalysis.missingData,
    professionalTriggers: comparisonAnalysis.professionalTriggers,
    canvasTabId: comparisonTabId,
  });

  return JSON.stringify({
    success: true,
    analysisRunId: analysisRun?.id ?? null,
    analysisStatus: 'complete',
    deals: valid,
    markdown,
    canvas_action: 'open_tab',
    tab: {
      id: analysisRun?.canvas_tab_id || comparisonTabId,
      kind: 'analysis',
      title: input.title || 'Deal comparison',
      tool: 'tool-compare',
      analysisRunId: analysisRun?.id ?? null,
      markdown,
      comparisonData: valid,
      analysisData: comparisonAnalysis,
    },
  });
}

/**
 * pair_merger_deals (Phase A.4, restored from autonomous-run B4.5).
 * Links two existing deals as the two sides of a merger transaction.
 * INSERTs into merger_pairings + sets parent_deal_id on the non-
 * surviving side so the relationship is navigable from either deal.
 *
 * Schema: see server/migrations/059_merger_lite.sql.
 *
 * Chat-first: Yulia calls this when the user says "merge these two",
 * "pair PortCo A and PortCo B as a merger", etc. The handler is
 * idempotent on the (deal_a_id, deal_b_id) pair via ON CONFLICT
 * DO UPDATE — re-pairing the same two deals updates the structure
 * rather than creating a duplicate row.
 */
async function pairMergerDeals(input: Record<string, any>, userId: number): Promise<string> {
  const { dealAId, dealBId, structure, exchangeRatio, survivingEntity, notes } = input;

  if (dealAId === dealBId) {
    return JSON.stringify({ error: "Can't pair a deal with itself." });
  }

  // Verify ownership of both deals
  const owned = await sql`
    SELECT id, business_name, journey_type FROM deals
    WHERE id IN (${dealAId}, ${dealBId}) AND user_id = ${userId}
  `;
  if (owned.length !== 2) {
    return JSON.stringify({ error: 'Both deals must belong to the user. One or both not found.' });
  }
  const dealA = owned.find((d: any) => d.id === dealAId);
  const dealB = owned.find((d: any) => d.id === dealBId);

  const surviving = (survivingEntity || 'A') as 'A' | 'B' | 'NEW';

  try {
    const [row] = await sql`
      INSERT INTO merger_pairings (deal_a_id, deal_b_id, user_id, structure, exchange_ratio, surviving_entity, notes)
      VALUES (${dealAId}, ${dealBId}, ${userId}, ${structure}, ${exchangeRatio ?? null}, ${surviving}, ${notes ?? null})
      ON CONFLICT (deal_a_id, deal_b_id) DO UPDATE
        SET structure = EXCLUDED.structure,
            exchange_ratio = EXCLUDED.exchange_ratio,
            surviving_entity = EXCLUDED.surviving_entity,
            notes = EXCLUDED.notes,
            updated_at = NOW()
      RETURNING id
    `;

    // Set parent_deal_id on the non-surviving side (or neither for NEW)
    if (surviving === 'A') {
      await sql`UPDATE deals SET parent_deal_id = ${dealAId}, updated_at = NOW() WHERE id = ${dealBId}`;
    } else if (surviving === 'B') {
      await sql`UPDATE deals SET parent_deal_id = ${dealBId}, updated_at = NOW() WHERE id = ${dealAId}`;
    }
    // For NEW, neither A nor B is the parent — a fresh entity will be the
    // surviving record, which the user can create separately.

    return JSON.stringify({
      success: true,
      pairingId: row.id,
      structure,
      survivingEntity: surviving,
      exchangeRatio: exchangeRatio ?? null,
      // Open the surviving deal's tab so the user sees the pairing landed.
      canvas_action: 'open_tab',
      tab: surviving === 'B'
        ? { id: String(dealBId), kind: 'deal', title: dealB?.business_name || `Deal #${dealBId}` }
        : { id: String(dealAId), kind: 'deal', title: dealA?.business_name || `Deal #${dealAId}` },
    });
  } catch (e: any) {
    if (/relation .*merger_pairings.* does not exist/.test(e.message)) {
      return JSON.stringify({
        error: 'merger_pairings table not found. Run migration 059_merger_lite.sql first.',
      });
    }
    return JSON.stringify({ error: `Failed to pair deals: ${e.message}` });
  }
}
