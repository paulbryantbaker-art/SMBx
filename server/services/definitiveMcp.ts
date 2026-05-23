import {
  DEFINITIVE_METHODOLOGY_URI,
  DEFINITIVE_METHODOLOGY_VERSION,
  DEFINITIVE_SPEC_URI,
  DEFINITIVE_SPEC_VERSION,
} from '../constants/definitive.js';
import { buildDefinitiveConformanceStatus } from './definitiveConformanceStatus.js';
import {
  DEFINITIVE_DEAL_STATE_PROTOCOL,
  executeDefinitiveDealStateTool,
  isDefinitiveDealStateTool,
} from './definitiveDealState.js';
import {
  getDefinitiveDealMappingCoverage,
  getDefinitiveDealMechanicsSummary,
  getDefinitivePassThroughSurface,
} from './definitiveDealMechanicsCatalog.js';
import {
  composeDefinitiveApplicableMechanics,
  getDefinitiveDealRouteMapSummary,
  summarizeDefinitiveApplicableMechanics,
  type DefinitiveJourney,
} from './definitiveDealRouteMap.js';
import { buildDefinitiveSchemaRegistry } from './definitiveSchemas.js';
import { getDefinitiveSubstrateArchitecturePlan } from './definitiveSubstrateArchitecturePlan.js';
import {
  buildDefinitiveDealRunbooksSurface,
  getDefinitiveDealRunbook,
} from './definitiveDealRunbooks.js';
import {
  buildDefinitiveModelCatalogSurface,
  getDefinitiveModelSlotSurface,
} from './definitiveModelCatalogSurface.js';
import {
  getDefinitiveLineContract,
  inputHasExplicitConfirmation,
  type DefinitiveLineContract,
} from './agencyActionRegistry.js';

const DEFINITIVE_MCP_PROTOCOL = 'DEFINITIVE.mcp.v0.1';

const DEFINITIVE_MCP_TOOLS = [
  'ingest_deal_payload',
  'update_deal_payload',
  'check_completeness',
  'get_definition_of_done',
  'get_deal_state',
  'introspect_capabilities',
  'describe_methodology',
  'estimate_deal_cost',
  'get_deal_runbook',
  'lookup_model_slot',
  'compose_deal_plan',
  'diff_deal_state',
  'compose_deal_package',
  'resume_deal',
  'compose_lifecycle_trace',
  'prepare_ioi_packet',
  'prepare_loi_packet',
  'compose_data_room_index',
  'prepare_diligence_request',
  'disclose_subset',
  'compose_document_draft',
  'prepare_negotiation_brief',
  'compose_close_readiness',
  'generate_funds_flow',
  'compose_pmi_plan',
  'lookup_citation',
  'fetch_market_data',
  'defer_to_counsel',
  'compose_model_stack',
  'execute_model',
  'record_corpus_observation',
  'validate_conformance',
  'close_deal',
  'update_tax_position',
  'query_admin_data',
] as const;

type DefinitiveMcpToolName = typeof DEFINITIVE_MCP_TOOLS[number];

const DEFINITIVE_MCP_TOOL_DEFINITIONS: Record<DefinitiveMcpToolName, { description: string; inputSchema: Record<string, any> }> = {
  ingest_deal_payload: {
    description: 'Accept a partial or complete agent-provided DealPayload, classify journey/league/overlays, create a content-addressed DealState, return a MissingInputContract, completeness score, and next_suggested_calls so the agent can keep working the entire deal lifecycle instead of being rejected for incomplete information.',
    inputSchema: {
      type: 'object',
      properties: {
        payload: { type: 'object', description: 'Partial or complete deal facts. Money values must be cents. May include journey, targetName, thesis, industry, jurisdiction, revenueCents, ebitdaCents, sdeCents, dealType, structure, documents, files, sourceIndex, and V20 routing signals.' },
        idempotencyKey: { type: 'string', description: 'Optional caller-generated idempotency key for repeat-safe DealState creation.' },
      },
    },
  },
  update_deal_payload: {
    description: 'Merge a patch into an existing DealState or partial payload, recompute ClassificationKey, MissingInputContract, completeness report, state hash, and next_suggested_calls for the recursive M&A lifecycle: information, IOI, LOI, diligence, modeling, negotiation, close, and PMI.',
    inputSchema: {
      type: 'object',
      properties: {
        dealState: { type: 'object', description: 'Prior content-addressed DealState returned by ingest_deal_payload or update_deal_payload.' },
        payload: { type: 'object', description: 'Optional base payload when no prior DealState exists.' },
        patch: { type: 'object', description: 'Structured facts to merge into the current DealPayload. Money values must be cents.' },
        idempotencyKey: { type: 'string', description: 'Optional caller-generated idempotency key.' },
      },
    },
  },
  check_completeness: {
    description: 'Score a DealState or DealPayload against DEFINITIVE deal-lifecycle definitions of done, returning DRL level, missing inputs, blockers, next gate, and next_suggested_calls without crossing THE LINE.',
    inputSchema: {
      type: 'object',
      properties: {
        dealState: { type: 'object', description: 'DealState to evaluate.' },
        payload: { type: 'object', description: 'DealPayload to evaluate if a DealState is not available.' },
        objective: { type: 'string', description: 'Optional objective, such as ioi, loi, diligence, model, negotiation, close, or pmi.' },
      },
    },
  },
  get_definition_of_done: {
    description: 'Return the versioned DEFINITIVE definitions of done for the iterative Deal OS lifecycle, including how humans and agents move from intake to IOI, LOI, diligence, modeling, negotiation, close, and PMI.',
    inputSchema: {
      type: 'object',
      properties: {
        objective: { type: 'string', description: 'Optional objective or gate to explain.' },
      },
    },
  },
  get_deal_state: {
    description: 'Read the latest persisted DealState snapshot by dealId, conversationId, or stateCid so an external agent can return to smbX as the Deal OS home, resume the recursive loop, and take back the current state without scraping app pages.',
    inputSchema: {
      type: 'object',
      properties: {
        dealId: { type: 'number', description: 'Optional deal id to read the latest DealState snapshot for.' },
        conversationId: { type: 'number', description: 'Optional conversation id to read the latest DealState snapshot for.' },
        stateCid: { type: 'string', description: 'Optional content-addressed DealState CID to read exactly.' },
      },
    },
  },
  introspect_capabilities: {
    description: 'Return a contextual CapabilityCatalog for an external agent entering smbX as the Deal OS. It explains relevant lifecycle stages, work surfaces, portable take-back artifacts, matching M101-M223 deal mechanics, and next_suggested_calls without dumping the full corpus into context.',
    inputSchema: {
      type: 'object',
      properties: {
        objective: { type: 'string', description: 'Optional objective, such as start a deal, prepare IOI, prepare LOI, diligence, modeling, negotiation, close, PMI, or verify package.' },
        journey: { type: 'string', enum: ['sell', 'buy', 'raise', 'pmi'], description: 'Optional deal journey.' },
        league: { type: 'string', enum: ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9', 'L10'], description: 'Optional V19 league.' },
        dealType: { type: 'string', description: 'Optional deal type or structure, such as asset purchase, 363 sale, real estate, LME, IP-heavy acquisition, or continuation fund.' },
        industry: { type: 'string', description: 'Optional industry profile.' },
        jurisdiction: { type: 'string', description: 'Optional jurisdiction, such as US-DE, US-TX, UK, or EU.' },
        triggeredGates: { type: 'array', items: { type: 'string' }, description: 'Optional triggered gates such as G28, G29, and G30.' },
        includeTools: { type: 'boolean', description: 'When true, include a compact tool inventory for the matching surface.' },
      },
    },
  },
  describe_methodology: {
    description: 'Describe The Diligence Standard / DEFINITIVE methodology for agents: version pins, Deal OS lifecycle, M101-M223 model catalog, G1-G30 gate routing, schemas, authority target, conformance status, and THE LINE compute-not-advise boundary.',
    inputSchema: {
      type: 'object',
      properties: {
        section: { type: 'string', description: 'Optional section: overview, lifecycle, models, gates, schemas, pass_through, conformance, line, or agent_access.' },
        includeModelCatalog: { type: 'boolean', description: 'When true, include model-catalog summary and mapping coverage.' },
        includeAuthorityPlan: { type: 'boolean', description: 'When true, include authority-register target and versioned source posture.' },
      },
    },
  },
  estimate_deal_cost: {
    description: 'Estimate the monthly workspace level and THE LINE-safe software/data pass-through posture for agentic deal work. Uses monthly subscription levels only; no wallet, no success fee, no referral fee, and no fee tied to deal value or outcome.',
    inputSchema: {
      type: 'object',
      properties: {
        monthlyModelRuns: { type: 'number', description: 'Expected deterministic model runs per month.' },
        monthlyApiCalls: { type: 'number', description: 'Expected MCP/API calls per month.' },
        monthlyStudioBooks: { type: 'number', description: 'Expected Studio books per month.' },
        monthlyStudioExports: { type: 'number', description: 'Expected Studio exports per month.' },
        teamSeats: { type: 'number', description: 'Expected workspace seats.' },
        needsApiMcp: { type: 'boolean', description: 'Whether the user/agent needs API or MCP access.' },
        supervisedAgents: { type: 'number', description: 'Number of supervised agent workflows.' },
        autonomousAgents: { type: 'number', description: 'Number of governed autonomous agent workflows.' },
        singleTenant: { type: 'boolean', description: 'Whether single-tenant deployment is required.' },
        sso: { type: 'boolean', description: 'Whether SSO is required.' },
        passThroughCalls: {
          type: 'array',
          description: 'Optional software/data pass-through calls to explain, billed at-cost or cost-plus-fixed per call regardless of deal outcome.',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Pass-through catalog id, such as PASS.RE_MARKET_DATA or PASS.OSS_SCA.' },
              quantity: { type: 'number', description: 'Expected call count.' },
            },
          },
        },
      },
    },
  },
  get_deal_runbook: {
    description: 'Return the buy, sell, raise, or PMI Deal OS runbook so an external agent knows how to work the full iterative lifecycle: intake, IOI, diligence, LOI, confirmatory diligence, modeling, negotiation prep, close, and PMI. If no journey is supplied, returns all runbooks.',
    inputSchema: {
      type: 'object',
      properties: {
        journey: { type: 'string', enum: ['buy', 'sell', 'raise', 'pmi'], description: 'Optional journey. Omit to return the full runbook catalog.' },
        limit: { type: 'number', description: 'Optional page size for representative model slots. Defaults to 24 and caps at 50.' },
        cursor: { type: 'string', description: 'Optional pagination cursor/offset for representative model slots.' },
      },
    },
  },
  lookup_model_slot: {
    description: 'Look up a stable DEFINITIVE M101-M223 model slot by id, including gates, deal types, authority anchors, runtime model id when implemented, route surfaces, next_suggested_calls, and THE LINE boundary. If no slotId is supplied, returns the compact model catalog.',
    inputSchema: {
      type: 'object',
      properties: {
        slotId: { type: 'string', description: 'Optional model slot id such as M109, M148, M200, M206, or M221.' },
        limit: { type: 'number', description: 'Optional model catalog page size when slotId is omitted. Defaults to 50 and caps at 50.' },
        cursor: { type: 'string', description: 'Optional pagination cursor/offset when slotId is omitted.' },
      },
    },
  },
  compose_deal_plan: {
    description: 'Compose a portable DealPlan from a DealState or DealPayload, showing the full M&A lifecycle from intake to IOI, LOI, due diligence, model, negotiation, close, and PMI with current stage, blocked stages, work surfaces, and next actions.',
    inputSchema: {
      type: 'object',
      properties: {
        dealState: { type: 'object', description: 'Optional DealState returned by ingest_deal_payload or update_deal_payload.' },
        payload: { type: 'object', description: 'Optional DealPayload when a DealState is not yet available.' },
        idempotencyKey: { type: 'string', description: 'Optional caller-generated idempotency key.' },
      },
    },
  },
  diff_deal_state: {
    description: 'Compare two DealState or DealPayload snapshots and return a portable DealStateDiff with changed paths, completeness delta, resolved missing inputs, new missing inputs, and overlay-gate changes for agent take-back.',
    inputSchema: {
      type: 'object',
      properties: {
        previousDealState: { type: 'object', description: 'Prior DealState snapshot.' },
        nextDealState: { type: 'object', description: 'Next DealState snapshot.' },
        previousPayload: { type: 'object', description: 'Prior DealPayload if a prior DealState is not available.' },
        nextPayload: { type: 'object', description: 'Next DealPayload if a next DealState is not available.' },
      },
    },
  },
  compose_deal_package: {
    description: 'Compose a portable DealPackage from DealState or DealPayload so an external agent can take back the current classification, completeness report, missing-input contract, deal plan, source index, next_suggested_calls, and THE LINE deferrals.',
    inputSchema: {
      type: 'object',
      properties: {
        dealState: { type: 'object', description: 'Optional DealState returned by ingest_deal_payload or update_deal_payload.' },
        payload: { type: 'object', description: 'Optional DealPayload when a DealState is not yet available.' },
        idempotencyKey: { type: 'string', description: 'Optional caller-generated idempotency key.' },
      },
    },
  },
  resume_deal: {
    description: 'Resume iterative Deal OS work from a DealState or DealPayload, returning current stage, DealPlan, DealPackage, completeness report, missing-input contract, next_suggested_calls, and portable take-back artifacts so the agent can keep working IOI, LOI, diligence, modeling, negotiation, close, and PMI.',
    inputSchema: {
      type: 'object',
      properties: {
        dealState: { type: 'object', description: 'Optional content-addressed DealState from a prior call.' },
        dealPackage: { type: 'object', description: 'Optional DealPackage reference; include the companion DealState when available.' },
        payload: { type: 'object', description: 'Optional DealPayload if a prior DealState is not available.' },
        idempotencyKey: { type: 'string', description: 'Optional caller-generated idempotency key.' },
      },
    },
  },
  compose_lifecycle_trace: {
    description: 'Compose a portable LifecycleTrace from a DealState or DealPayload so humans and agents can understand the iterative deal history, current stage, stage trace, source/artifact refs, blockers, loop contract, and next_suggested_calls across IOI, LOI, diligence, model, negotiation, close, and PMI.',
    inputSchema: {
      type: 'object',
      properties: {
        dealState: { type: 'object', description: 'Optional content-addressed DealState from a prior call.' },
        payload: { type: 'object', description: 'Optional DealPayload with dealEvents, lifecycleEvents, activityLog, history, milestones, timeline, sources, model outputs, or documents.' },
        idempotencyKey: { type: 'string', description: 'Optional caller-generated idempotency key.' },
      },
    },
  },
  prepare_ioi_packet: {
    description: 'Prepare a portable IOIPacket from a DealState or DealPayload for pre-LOI indication work, organizing known facts, preliminary economics, source gaps, model dependencies, and next_suggested_calls. It does not make an offer, provide a valuation opinion, recommend economics, or transmit externally.',
    inputSchema: {
      type: 'object',
      properties: {
        dealState: { type: 'object', description: 'Optional content-addressed DealState from a prior call.' },
        payload: { type: 'object', description: 'Optional DealPayload with target, thesis, economics, sources, model outputs, or documents.' },
        objective: { type: 'string', description: 'Optional IOI objective or topic.' },
        audience: { type: 'string', description: 'Optional audience label. Defaults to internal_deal_team.' },
      },
    },
  },
  prepare_loi_packet: {
    description: 'Prepare a portable LOIPacket from a DealState or DealPayload for LOI architecture work, organizing deal structure, economic terms, closing conditions, source gaps, model dependencies, handoffs, and next_suggested_calls. It does not make a binding offer, draft clause language, provide a legal or tax opinion, negotiate terms, or transmit externally.',
    inputSchema: {
      type: 'object',
      properties: {
        dealState: { type: 'object', description: 'Optional content-addressed DealState from a prior call.' },
        payload: { type: 'object', description: 'Optional DealPayload with target, structure, key terms, sources, model outputs, or documents.' },
        objective: { type: 'string', description: 'Optional LOI objective or topic.' },
        audience: { type: 'string', description: 'Optional audience label. Defaults to internal_deal_team_and_counsel.' },
      },
    },
  },
  compose_data_room_index: {
    description: 'Compose a portable DataRoomIndex from DealState or DealPayload source files, grouping documents into diligence buckets, identifying source gaps, and returning next_suggested_calls so humans or agents can manage Files and Data Room work as part of the full Deal OS lifecycle.',
    inputSchema: {
      type: 'object',
      properties: {
        dealState: { type: 'object', description: 'Optional content-addressed DealState from a prior call.' },
        payload: { type: 'object', description: 'Optional DealPayload with documents, files, sources, or sourceIndex.' },
        idempotencyKey: { type: 'string', description: 'Optional caller-generated idempotency key.' },
      },
    },
  },
  prepare_diligence_request: {
    description: 'Prepare a portable DiligenceRequest from a DealState or DealPayload, organizing source-backed diligence asks by data-room bucket, source gaps, missing inputs, model dependencies, THE LINE handoffs, and next_suggested_calls. It does not transmit externally, make legal demands, or decide what the user should send.',
    inputSchema: {
      type: 'object',
      properties: {
        dealState: { type: 'object', description: 'Optional content-addressed DealState from a prior call.' },
        payload: { type: 'object', description: 'Optional DealPayload when a DealState is not yet available.' },
        categories: { type: 'array', items: { type: 'string' }, description: 'Optional diligence buckets to emphasize, such as financials, legal, tax, commercial, ip, real_estate, financing, restructuring, or regulatory.' },
        objective: { type: 'string', description: 'Optional diligence objective or stage.' },
        audience: { type: 'string', description: 'Optional audience label. Defaults to deal_team_and_counterparty.' },
      },
    },
  },
  disclose_subset: {
    description: 'Compose a portable DisclosureSubset from a DealState, source IDs, diligence categories, or lifecycle objective. This creates a selective-disclosure manifest and proof for agent take-back, but does not transmit externally; actual external sharing requires a separate A5 approval action.',
    inputSchema: {
      type: 'object',
      properties: {
        dealState: { type: 'object', description: 'Optional content-addressed DealState from a prior call.' },
        payload: { type: 'object', description: 'Optional DealPayload with documents, files, sources, or sourceIndex.' },
        categories: { type: 'array', items: { type: 'string' }, description: 'Optional diligence categories to include, such as financials, legal, tax, commercial, ip, real_estate, financing, or restructuring.' },
        sourceIds: { type: 'array', items: { type: 'string' }, description: 'Optional explicit source IDs to include.' },
        objective: { type: 'string', description: 'Optional lifecycle objective such as IOI, LOI, diligence, model, negotiation, close, or PMI.' },
        audience: { type: 'string', description: 'Optional receiving audience label for the composed subset manifest.' },
        maxSources: { type: 'integer', description: 'Optional cap on selected sources, default 20, max 50.' },
      },
    },
  },
  compose_document_draft: {
    description: 'Compose a portable DocumentDraft scaffold for Studio from a DealState or DealPayload, preserving source requirements, model dependencies, THE LINE boundaries, and next_suggested_calls for iterative document creation without external export.',
    inputSchema: {
      type: 'object',
      properties: {
        dealState: { type: 'object', description: 'Optional content-addressed DealState from a prior call.' },
        payload: { type: 'object', description: 'Optional DealPayload when a DealState is not yet available.' },
        documentType: { type: 'string', description: 'Draft type: deal_brief, ioi, loi_outline, ic_memo, diligence_request, negotiation_brief, close_readiness, funds_flow, or pmi_plan.' },
        audience: { type: 'string', description: 'Optional audience label for the Studio draft scaffold.' },
      },
    },
  },
  prepare_negotiation_brief: {
    description: 'Prepare a portable NegotiationBrief from a DealState or DealPayload, organizing open terms, source gaps, model-backed range status, THE LINE handoffs, and next_suggested_calls. It does not negotiate, recommend concessions, draft binding language, or transmit externally.',
    inputSchema: {
      type: 'object',
      properties: {
        dealState: { type: 'object', description: 'Optional content-addressed DealState from a prior call.' },
        payload: { type: 'object', description: 'Optional DealPayload when a DealState is not yet available.' },
        objective: { type: 'string', description: 'Optional negotiation objective or topic.' },
        audience: { type: 'string', description: 'Optional audience label. Defaults to internal_deal_team.' },
      },
    },
  },
  compose_close_readiness: {
    description: 'Compose a portable CloseReadiness packet from a DealState or DealPayload for late-stage closing orchestration, showing readiness checks, blockers, source gaps, deterministic model dependencies, funds-flow status, approval handoffs, and next_suggested_calls. It does not authorize closing, move money, issue wire instructions, act as escrow/closing agent, provide legal/tax opinions, or transmit externally.',
    inputSchema: {
      type: 'object',
      properties: {
        dealState: { type: 'object', description: 'Optional content-addressed DealState from a prior call.' },
        payload: { type: 'object', description: 'Optional DealPayload with closing conditions, consents, approvals, model outputs, funds-flow rows, professional clearances, source index, or data-room facts.' },
        objective: { type: 'string', description: 'Optional close-readiness objective or topic.' },
        audience: { type: 'string', description: 'Optional audience label. Defaults to internal_deal_team_and_closing_advisors.' },
      },
    },
  },
  generate_funds_flow: {
    description: 'Generate a portable FundsFlow from a DealState or DealPayload for closing arithmetic, organizing funding sources, uses, adjustments, reconciliation, source gaps, model dependencies, handoffs, and next_suggested_calls. It does not move money, provide wire instructions, act as escrow/closing agent, provide legal/tax opinions, or transmit externally.',
    inputSchema: {
      type: 'object',
      properties: {
        dealState: { type: 'object', description: 'Optional content-addressed DealState from a prior call.' },
        payload: { type: 'object', description: 'Optional DealPayload with purchase price, debt proceeds, equity contribution, payoff amounts, escrow, working-capital adjustment, tax withholding, model outputs, or source index.' },
        objective: { type: 'string', description: 'Optional funds-flow objective or topic.' },
        audience: { type: 'string', description: 'Optional audience label. Defaults to internal_deal_team_and_closing_advisors.' },
      },
    },
  },
  compose_pmi_plan: {
    description: 'Compose a portable PMIPlan from a DealState or DealPayload for post-close integration work, organizing Day 0 controls, stabilization, assessment, optimization, source gaps, model dependencies, risk tracking, and next_suggested_calls. It does not make operating decisions, provide employment/legal/tax advice, or transmit externally.',
    inputSchema: {
      type: 'object',
      properties: {
        dealState: { type: 'object', description: 'Optional content-addressed DealState from a prior call.' },
        payload: { type: 'object', description: 'Optional DealPayload with close date, PMI facts, operations, financials, commercial, HR, model outputs, or source index.' },
        objective: { type: 'string', description: 'Optional PMI objective or topic.' },
        audience: { type: 'string', description: 'Optional audience label. Defaults to operators_and_integration_team.' },
      },
    },
  },
  lookup_citation: {
    description: 'Resolve a claim or citation tag against the DEFINITIVE Authority Register and legacy V19 citation registry.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Citation tag, authority id, source name, or claim text to resolve.' },
        category: { type: 'string', description: 'Optional authority/category filter.' },
        jurisdiction: { type: 'string', description: 'Optional jurisdiction filter, for example US-DE.' },
      },
      required: ['query'],
    },
  },
  fetch_market_data: {
    description: 'Fetch timestamped market/regulatory data from the market-data cache with source and freshness metadata.',
    inputSchema: {
      type: 'object',
      properties: {
        key: { type: 'string', description: 'Market data key, for example SOFR, PRIME, HSR_SIZE_OF_TRANSACTION.' },
      },
      required: ['key'],
    },
  },
  defer_to_counsel: {
    description: 'Create a structured THE LINE deferral packet for legal, tax, regulatory, or professional-review questions.',
    inputSchema: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'Deferral category, such as tax, legal, regulatory, broker_dealer, or securities.' },
        issue: { type: 'string', description: 'The issue that requires qualified review.' },
        jurisdiction: { type: 'string', description: 'Optional jurisdiction.' },
        dealId: { type: 'number', description: 'Optional deal ID.' },
      },
      required: ['category', 'issue'],
    },
  },
  compose_model_stack: {
    description: 'Compose and persist the canonical V19 model stack for a deal, with DEFINITIVE v1.1/V20 overlay routing for G28 distressed/restructuring, G29 capital structure/liability management, and G30 real estate/asset-class overlays. Returns applicable M101-M223 mechanics with readiness, tool surfaces, and THE LINE boundaries. Unimplemented catalog models are surfaced as planning/readiness, not executable runtime models.',
    inputSchema: {
      type: 'object',
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
  execute_model: {
    description: 'Execute a deterministic server-side V19 model by MODEL.*.v1 id and return output hash, citations, missing inputs, and audit payload.',
    inputSchema: {
      type: 'object',
      properties: {
        modelId: { type: 'string', description: 'Canonical model ID, for example MODEL.VAL.EBITDA.v1 or MODEL.DSCR.STRESS.v1.' },
        input: { type: 'object', description: 'Model inputs. Financial values must be cents.' },
        dealId: { type: 'number', description: 'Optional deal ID for audit context.' },
      },
      required: ['modelId', 'input'],
    },
  },
  record_corpus_observation: {
    description: 'Record a structured anonymized deal-term observation only when an active data-rights grant exists. Raw document text and party identifiers are stripped.',
    inputSchema: {
      type: 'object',
      properties: {
        dealId: { type: 'number', description: 'Optional deal ID owned by the beneficial customer.' },
        observationType: {
          type: 'string',
          enum: ['nwc_peg', 'add_back', 'earnout', 'rwi_policy', 'indemnity', 'escrow', 'financing_terms', 'valuation_multiple', 'tax_structure', 'legal_clause', 'closing_condition', 'diligence_finding'],
          description: 'Structured benchmark observation type.',
        },
        observation: { type: 'object', description: 'Structured observation fields only; raw text and party identifiers are not allowed.' },
        anonymizationBucket: { type: 'object', description: 'Non-identifying bucket fields such as industry, league, deal-size band, region, and year.' },
        sourceArtifactType: { type: 'string', description: 'Optional source artifact kind, for example model_execution or studio_export.' },
        sourceArtifactId: { type: 'string', description: 'Optional source artifact id.' },
        sourceHash: { type: 'string', description: 'Optional existing source hash.' },
      },
      required: ['observationType', 'observation'],
    },
  },
  validate_conformance: {
    description: 'Return the current DB-free DEFINITIVE conformance status, case count, categories, and validation command.',
    inputSchema: {
      type: 'object',
      properties: {
        suite: { type: 'string', enum: ['model-runtime'], description: 'Optional suite filter. Current DB-free suite is model-runtime.' },
      },
    },
  },
  close_deal: {
    description: 'Mark a transaction closed only after explicit human approval. Used by agents to prove THE LINE approval envelopes.',
    inputSchema: {
      type: 'object',
      properties: {
        dealId: { type: 'number', description: 'Deal ID to close.' },
        closedDate: { type: 'string', description: 'ISO closing date.' },
        finalPrice: { type: 'number', description: 'Final price in cents.' },
        spawnPmi: { type: 'boolean', description: 'Whether to spawn a PMI workspace after close.' },
        confirmed: { type: 'boolean', description: 'Explicit user confirmation flag.' },
      },
      required: ['dealId'],
    },
  },
  update_tax_position: {
    description: 'Organize transaction tax-position facts only after qualified tax/counsel review clearance.',
    inputSchema: {
      type: 'object',
      properties: {
        dealId: { type: 'number', description: 'Deal ID.' },
        taxPosition: { type: 'string', description: 'Tax position label.' },
        facts: { type: 'object', description: 'Structured tax facts only.' },
      },
      required: ['dealId', 'taxPosition'],
    },
  },
  query_admin_data: {
    description: 'Privileged administrative query surface requiring governed enterprise scope.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Administrative query intent.' },
      },
      required: ['query'],
    },
  },
};

const TOOL_SCOPE: Record<DefinitiveMcpToolName, string[]> = {
  ingest_deal_payload: ['deal-state:write', 'deal:classify'],
  update_deal_payload: ['deal-state:write', 'deal:classify'],
  check_completeness: ['deal-state:read', 'completeness:read'],
  get_definition_of_done: ['methodology:read', 'completeness:read'],
  get_deal_state: ['deal-state:read'],
  introspect_capabilities: ['capability:read', 'methodology:read'],
  describe_methodology: ['methodology:read', 'authority:read'],
  estimate_deal_cost: ['pricing:read', 'pass-through:read'],
  get_deal_runbook: ['methodology:read', 'deal-plan:read'],
  lookup_model_slot: ['methodology:read', 'model-catalog:read'],
  compose_deal_plan: ['deal-state:read', 'deal-plan:read'],
  diff_deal_state: ['deal-state:read', 'deal-state:diff'],
  compose_deal_package: ['deal-state:read', 'deal-package:read'],
  resume_deal: ['deal-state:read', 'deal-plan:read', 'deal-package:read'],
  compose_lifecycle_trace: ['deal-state:read', 'deal-plan:read'],
  prepare_ioi_packet: ['deal-state:read', 'studio:draft', 'model-stack:compose'],
  prepare_loi_packet: ['deal-state:read', 'studio:draft', 'model-stack:compose'],
  compose_data_room_index: ['deal-state:read', 'data-room:read'],
  prepare_diligence_request: ['deal-state:read', 'data-room:read', 'studio:draft'],
  disclose_subset: ['deal-state:read', 'data-room:read', 'deal-package:compose'],
  compose_document_draft: ['deal-state:read', 'studio:draft'],
  prepare_negotiation_brief: ['deal-state:read', 'studio:draft', 'model-stack:compose'],
  compose_close_readiness: ['deal-state:read', 'completeness:read', 'deal-package:read'],
  generate_funds_flow: ['deal-state:read', 'studio:draft', 'model-stack:compose'],
  compose_pmi_plan: ['deal-state:read', 'studio:draft', 'model-stack:compose'],
  lookup_citation: ['citation:read', 'authority:read'],
  fetch_market_data: ['market-data:read'],
  defer_to_counsel: ['counsel:deferral:create'],
  compose_model_stack: ['model-stack:compose', 'deal:read'],
  execute_model: ['model:execute', 'audit:write'],
  record_corpus_observation: ['corpus:write', 'data-rights:read'],
  validate_conformance: ['conformance:read'],
  close_deal: ['deal:write', 'immutable:write'],
  update_tax_position: ['deal:write', 'counsel:review'],
  query_admin_data: ['admin:read', 'enterprise:scope'],
};

const TOOL_INTERNAL_API_METER = new Set<DefinitiveMcpToolName>([
  'fetch_market_data',
  'validate_conformance',
  'introspect_capabilities',
  'describe_methodology',
  'estimate_deal_cost',
  'get_deal_runbook',
  'lookup_model_slot',
]);

const WORKSPACE_PLANS = [
  {
    id: 'free',
    label: 'Free',
    monthlyPriceCents: 0,
    priceLabel: '$0/mo',
    builtFor: 'Trying Yulia on one real deal with one free deliverable.',
  },
  {
    id: 'solo',
    label: 'Solo',
    monthlyPriceCents: 7900,
    priceLabel: '$79/mo',
    builtFor: 'One operator, one deal at a time.',
  },
  {
    id: 'pro',
    label: 'Pro',
    monthlyPriceCents: 19900,
    priceLabel: '$199/mo',
    builtFor: 'Active dealmakers running the full deal stack, Studio output, models, and API/MCP access.',
  },
  {
    id: 'team',
    label: 'Team',
    monthlyPriceCents: 49900,
    priceLabel: '$499/mo',
    builtFor: 'Boutiques and partner-led firms with shared vaults, templates, seats, and supervised agent work.',
  },
  {
    id: 'enterprise',
    label: 'Enterprise',
    monthlyPriceCents: 250000,
    priceLabel: 'From $2,500/mo',
    builtFor: 'Larger teams and regulated environments needing SSO, single-tenant deployment, API controls, portfolio infrastructure, and governed autonomous agents.',
  },
] as const;

interface DefinitiveToolCallInput {
  userId: number;
  toolName: string;
  input: Record<string, any>;
  envelope?: Record<string, any>;
}

type DefinitiveLineGateResult =
  | { allowed: true }
  | {
      allowed: false;
      status: number;
      code: string;
      message: string;
      tollgate: Record<string, any>;
    };

export function listDefinitiveMcpTools() {
  return {
    protocol: DEFINITIVE_MCP_PROTOCOL,
    status: 'internal_v0_1',
    specVersion: DEFINITIVE_SPEC_VERSION,
    specUri: DEFINITIVE_SPEC_URI,
    methodologyVersion: DEFINITIVE_METHODOLOGY_VERSION,
    methodologyUri: DEFINITIVE_METHODOLOGY_URI,
    auth: {
      mode: 'oauth_ready_jwt_dev',
      productionTarget: 'OAuth 2.1 + PKCE + audience-bound scoped tokens',
      localDev: 'Use the existing smbX JWT bearer token while the MCP transport is internal.',
    },
    identity: {
      actor: 'agent_id',
      platform: 'agent_platform_id',
      principal: 'beneficial_customer_id',
      billing: 'billing_org_id',
      mandate: 'mandate_id',
    },
    tools: DEFINITIVE_MCP_TOOLS.map(name => {
      const tool = DEFINITIVE_MCP_TOOL_DEFINITIONS[name];
      const line = getDefinitiveLineContract(name);
      return {
        name,
        description: tool.description,
        inputSchema: tool.inputSchema,
        lineStatus: line?.lineStatus || 'ok',
        lineReason: line?.lineReason || '',
        refusalBehavior: line?.refusalBehavior || 'allow',
        lineRisks: line?.lineRisks || [],
        requiredScopes: TOOL_SCOPE[name],
        metering: {
          eventType: 'api_call',
          internalToolMeter: TOOL_INTERNAL_API_METER.has(name),
        },
      };
    }),
    responseShape: {
      ok: 'boolean',
      requestId: 'string',
      toolName: 'string',
      result: 'object',
      mandateChain: 'object',
      specVersion: DEFINITIVE_SPEC_VERSION,
      methodologyVersion: DEFINITIVE_METHODOLOGY_VERSION,
    },
  };
}

export function isDefinitiveMcpToolName(value: string): value is DefinitiveMcpToolName {
  return (DEFINITIVE_MCP_TOOLS as readonly string[]).includes(value);
}

export async function executeDefinitiveMcpTool(input: DefinitiveToolCallInput) {
  const envelope = input.envelope || {};
  const requestId = resolveRequestId(input, envelope);
  const idempotencyKey = resolveIdempotencyKey(input, envelope);
  const responseMeta = () => ({ requestId, idempotencyKey });
  const versionError = validateVersionEnvelope(envelope);
  if (versionError) return { status: 400, body: { ...versionError, ...responseMeta() } };

  if (!isDefinitiveMcpToolName(input.toolName)) {
    return {
      status: 404,
      body: {
        ok: false,
        ...responseMeta(),
        error: `Unsupported DEFINITIVE v0.1 tool: ${input.toolName}`,
        supportedTools: DEFINITIVE_MCP_TOOLS,
      },
    };
  }

  const explicitRequestedScopes = normalizeScopes(envelope.requestedScopes);
  const requestedScopes = normalizeScopes(envelope.requestedScopes).length
    ? normalizeScopes(envelope.requestedScopes)
    : TOOL_SCOPE[input.toolName];
  const missingScopes = explicitRequestedScopes.length
    ? TOOL_SCOPE[input.toolName].filter(scope => !explicitRequestedScopes.includes(scope))
    : [];
  if (missingScopes.length) {
    return {
      status: 403,
      body: {
        ok: false,
        ...responseMeta(),
        error: 'missing_required_scope',
        message: `${input.toolName} requires scopes not present in envelope.requestedScopes.`,
        toolName: input.toolName,
        protocol: DEFINITIVE_MCP_PROTOCOL,
        requiredScopes: TOOL_SCOPE[input.toolName],
        requestedScopes,
        missingScopes,
        ...versionPayload(),
      },
    };
  }
  const line = getDefinitiveLineContract(input.toolName);
  const lineGate = evaluateLineGate(input.toolName, input.input || {}, envelope, line);
  if (!lineGate.allowed) {
    return {
      status: lineGate.status,
      body: {
        ok: false,
        ...responseMeta(),
        error: lineGate.code,
        message: lineGate.message,
        tollgate: lineGate.tollgate,
        toolName: input.toolName,
        protocol: DEFINITIVE_MCP_PROTOCOL,
        lineStatus: line?.lineStatus || 'LINE_VIOLATION',
        lineReason: line?.lineReason || 'No DEFINITIVE action contract exists for this tool.',
        refusalBehavior: line?.refusalBehavior || 'refuse',
        lineRisks: line?.lineRisks || ['missing_action_contract'],
        requiredScopes: requestedScopes,
        ...versionPayload(),
      },
    };
  }

  if (input.toolName === 'validate_conformance') {
    return {
      status: 200,
      body: {
        ok: true,
        ...responseMeta(),
        toolName: input.toolName,
        protocol: DEFINITIVE_MCP_PROTOCOL,
        lineStatus: line?.lineStatus || 'ok',
        lineReason: line?.lineReason || '',
        refusalBehavior: line?.refusalBehavior || 'allow',
        lineRisks: line?.lineRisks || [],
        requiredScopes: requestedScopes,
        result: buildDefinitiveConformanceStatus(),
        ...versionPayload(),
      },
    };
  }

  if (isStaticDefinitiveDiscoveryTool(input.toolName)) {
    return {
      status: 200,
      body: {
        ok: true,
        ...responseMeta(),
        toolName: input.toolName,
        protocol: DEFINITIVE_MCP_PROTOCOL,
        lineStatus: line?.lineStatus || 'ok',
        lineReason: line?.lineReason || '',
        refusalBehavior: line?.refusalBehavior || 'allow',
        lineRisks: line?.lineRisks || [],
        requiredScopes: requestedScopes,
        result: executeStaticDefinitiveDiscoveryTool(input.toolName, input.input || {}),
        mandateChain: null,
        ...versionPayload(),
      },
    };
  }

  if (input.toolName === 'get_deal_state') {
    const { readLatestDefinitiveDealStateSnapshot } = await import('./definitiveDealStatePersistence.js');
    const read = await readLatestDefinitiveDealStateSnapshot({
      userId: input.userId,
      dealId: nullableNumber(input.input?.dealId),
      conversationId: nullableNumber(input.input?.conversationId),
      stateCid: nullableString(input.input?.stateCid),
    });
    const ok = read.ok === true;
    const snapshot = (ok && 'snapshot' in read && read.snapshot ? read.snapshot : null) as Record<string, any> | null;
    return {
      status: ok ? 200 : read.error === 'not_found' ? 404 : 400,
      body: {
        ok,
        ...responseMeta(),
        toolName: input.toolName,
        protocol: DEFINITIVE_MCP_PROTOCOL,
        lineStatus: line?.lineStatus || 'ok',
        lineReason: line?.lineReason || '',
        refusalBehavior: line?.refusalBehavior || 'allow',
        lineRisks: line?.lineRisks || [],
        requiredScopes: requestedScopes,
        result: ok
          ? buildPersistedDealStateReadResult(snapshot)
          : {
              schema: 'PersistedDealState.v0.1',
              error: read.error || 'deal_state_read_failed',
            },
        mandateChain: null,
        ...versionPayload(),
      },
    };
  }

  if (isDefinitiveDealStateTool(input.toolName)) {
    const result = executeDefinitiveDealStateTool(input.toolName, input.input || {});
    const ok = result.ok === true;
    return {
      status: ok ? 200 : 400,
      body: {
        ok,
        ...responseMeta(),
        toolName: input.toolName,
        protocol: DEFINITIVE_MCP_PROTOCOL,
        lineStatus: line?.lineStatus || 'ok',
        lineReason: line?.lineReason || '',
        refusalBehavior: line?.refusalBehavior || 'allow',
        lineRisks: line?.lineRisks || [],
        requiredScopes: requestedScopes,
        result,
        mandateChain: null,
        ...versionPayload(),
      },
    };
  }

  const [
    { resolveDefinitiveMandateContext },
    { checkV19Entitlement, formatV19TollgateForYulia, recordV19UsageEvent },
  ] = await Promise.all([
    import('./definitiveMandateService.js'),
    import('./v19EntitlementService.js'),
  ]);

  const mandateContext = await resolveDefinitiveMandateContext({
    userId: input.userId,
    organizationId: nullableNumber(envelope.organizationId),
    billingOrgId: nullableNumber(envelope.billingOrgId),
    sourceAgent: nullableString(envelope.sourceAgent) || 'definitive-mcp-v0.1',
    agentId: envelope.agentId ?? envelope.agent?.agentId ?? null,
    agentPlatformId: nullableString(envelope.agentPlatformId) || nullableString(envelope.agent?.platformId),
    mandateId: nullableString(envelope.mandateId) || nullableString(envelope.mandate?.id),
    requestedScopes,
    sourceSurface: 'mcp',
    metadata: {
      protocol: DEFINITIVE_MCP_PROTOCOL,
      toolName: input.toolName,
      client: envelope.client || null,
    },
  });

  const routeMetersCall = !TOOL_INTERNAL_API_METER.has(input.toolName);
  if (routeMetersCall) {
    const gate = await checkV19Entitlement(input.userId, 'api_call', {
      actionId: `definitive.${input.toolName}`,
      toolName: input.toolName,
      sourceSurface: 'mcp',
      resourceType: 'definitive_tool',
      resourceId: input.toolName,
      agentId: mandateContext.agentId,
      agentPlatformId: mandateContext.agentPlatformId,
      mandateId: mandateContext.mandateId,
      requestedScopes,
      metadata: {
        protocol: DEFINITIVE_MCP_PROTOCOL,
        lineStatus: line?.lineStatus || 'ok',
      },
    });
    if (!gate.allowed) {
      return {
        status: gate.tollgate?.code === 'credit_budget_required' ? 402 : 403,
        body: {
          ok: false,
          ...responseMeta(),
          error: gate.tollgate?.message || 'DEFINITIVE tool call is outside the current plan scope.',
          tollgate: formatV19TollgateForYulia(gate.tollgate),
          usage: gate.meter,
          mandateChain: mandateContext.mandateChain,
          ...versionPayload(),
        },
      };
    }
  }

  if (input.toolName === 'record_corpus_observation') {
    const { recordDefinitiveCorpusObservation } = await import('./definitiveCorpusService.js');
    const result = await recordDefinitiveCorpusObservation({
      userId: input.userId,
      organizationId: mandateContext.mandateChain.principal.organizationId,
      billingOrgId: mandateContext.billingOrgId,
      beneficialCustomerId: mandateContext.beneficialCustomerId,
      dealId: nullableNumber(input.input?.dealId),
      observationType: String(input.input?.observationType || ''),
      observation: input.input?.observation && typeof input.input.observation === 'object' ? input.input.observation : {},
      anonymizationBucket: input.input?.anonymizationBucket && typeof input.input.anonymizationBucket === 'object' ? input.input.anonymizationBucket : {},
      sourceArtifactType: nullableString(input.input?.sourceArtifactType),
      sourceArtifactId: input.input?.sourceArtifactId ?? null,
      sourceHash: nullableString(input.input?.sourceHash),
      minReleaseCount: nullableNumber(input.input?.minReleaseCount),
      metadata: input.input?.metadata && typeof input.input.metadata === 'object' ? input.input.metadata : {},
      mandateContext,
    });
    const ok = result.ok === true;
    if (routeMetersCall) {
      await recordV19UsageEvent({
        userId: input.userId,
        eventType: 'api_call',
        actionId: `definitive.${input.toolName}`,
        toolName: input.toolName,
        sourceSurface: 'mcp',
        actorType: 'agent',
        resourceType: 'definitive_tool',
        resourceId: input.toolName,
        agentId: mandateContext.agentId,
        agentPlatformId: mandateContext.agentPlatformId,
        mandateId: mandateContext.mandateId,
        requestedScopes,
        metadata: {
          protocol: DEFINITIVE_MCP_PROTOCOL,
          lineStatus: line?.lineStatus || 'ok',
          ok,
          corpusObservationType: input.input?.observationType || null,
        },
      });
    }
    return {
      status: ok ? 200 : result.error === 'data_rights_required' ? 428 : 400,
      body: {
        ok,
        ...responseMeta(),
        toolName: input.toolName,
        protocol: DEFINITIVE_MCP_PROTOCOL,
        lineStatus: line?.lineStatus || 'ok',
        lineReason: line?.lineReason || '',
        refusalBehavior: line?.refusalBehavior || 'allow',
        lineRisks: line?.lineRisks || [],
        requiredScopes: requestedScopes,
        result,
        mandateChain: mandateContext.mandateChain,
        ...versionPayload(),
      },
    };
  }

  const { executeGovernedTool } = await import('./governedToolExecutor.js');
  const raw = await executeGovernedTool(input.toolName, input.input || {}, input.userId, 0, {
    actorType: 'external_agent',
    actorId: mandateContext.agentId,
    actingOnBehalfOfUserId: input.userId,
    organizationId: mandateContext.mandateChain.principal.organizationId,
    sourceSurface: 'external_agent',
    sourceAgent: mandateContext.agentPlatformId || 'definitive-mcp-v0.1',
    mandateScope: mandateContext.mandateId,
  });
  const result = parseToolResult(raw);
  const ok = !(result && typeof result === 'object' && ('error' in result || 'tollgate' in result));

  if (routeMetersCall) {
    await recordV19UsageEvent({
      userId: input.userId,
      eventType: 'api_call',
      actionId: `definitive.${input.toolName}`,
      toolName: input.toolName,
      sourceSurface: 'mcp',
      actorType: 'agent',
      resourceType: 'definitive_tool',
      resourceId: input.toolName,
      agentId: mandateContext.agentId,
      agentPlatformId: mandateContext.agentPlatformId,
      mandateId: mandateContext.mandateId,
      requestedScopes,
      metadata: {
        protocol: DEFINITIVE_MCP_PROTOCOL,
        lineStatus: line?.lineStatus || 'ok',
        ok,
      },
    });
  }

  return {
    status: ok ? 200 : 400,
    body: {
      ok,
      ...responseMeta(),
      toolName: input.toolName,
      protocol: DEFINITIVE_MCP_PROTOCOL,
      lineStatus: line?.lineStatus || 'ok',
      lineReason: line?.lineReason || '',
      refusalBehavior: line?.refusalBehavior || 'allow',
      lineRisks: line?.lineRisks || [],
      requiredScopes: requestedScopes,
      result,
      mandateChain: mandateContext.mandateChain,
      ...versionPayload(),
    },
  };
}

function evaluateLineGate(
  toolName: string,
  toolInput: Record<string, any>,
  envelope: Record<string, any>,
  line?: DefinitiveLineContract,
): DefinitiveLineGateResult {
  if (!line) {
    return lineBlocked(
      403,
      'LINE_VIOLATION',
      'This tool is not registered in the DEFINITIVE action contract inventory.',
      'LINE_VIOLATION',
    );
  }

  if (line.lineStatus === 'ok') {
    return { allowed: true };
  }

  if (line.lineStatus === 'human_approval_required') {
    if (hasExplicitHumanApproval(toolInput, envelope)) return { allowed: true };
    return lineBlocked(
      428,
      'human_approval_required',
      `${line.label} needs explicit human approval before an external agent may execute it.`,
      line.lineStatus,
      {
        requiredAction: 'Ask the user to approve the action, then retry with confirmed=true or envelope.humanApproval.confirmed=true.',
      },
    );
  }

  if (line.lineStatus === 'counsel_review_required') {
    if (toolName === 'defer_to_counsel') return { allowed: true };
    if (hasCounselReviewClearance(envelope)) return { allowed: true };
    return lineBlocked(
      428,
      'counsel_review_required',
      `${line.label} needs counsel or qualified professional review before execution.`,
      line.lineStatus,
      {
        requiredAction: 'Create a counsel deferral packet or provide envelope.counselReview.cleared=true after qualified review.',
      },
    );
  }

  if (line.lineStatus === 'enterprise_scope_required') {
    if (hasEnterpriseScope(envelope)) return { allowed: true };
    return lineBlocked(
      403,
      'enterprise_scope_required',
      `${line.label} requires governed enterprise scope and cannot be run by a general external agent token.`,
      line.lineStatus,
      {
        requiredAction: 'Use an enterprise-scoped token with envelope.enterpriseScope.approved=true.',
      },
    );
  }

  if (line.lineStatus === 'credit_budget_required') {
    return lineBlocked(
      402,
      'credit_budget_required',
      `${line.label} requires available credits or a contracted compute budget before execution.`,
      line.lineStatus,
      {
        requiredAction: 'Check entitlements and retry after the budget gate clears.',
      },
    );
  }

  return lineBlocked(
    403,
    'LINE_VIOLATION',
    `${line.label} is refused by construction because it crosses THE LINE.`,
    line.lineStatus,
  );
}

function lineBlocked(status: number, code: string, message: string, lineStatus: string, extra: Record<string, any> = {}) {
  return {
    allowed: false,
    status,
    code,
    message,
    tollgate: {
      code,
      lineStatus,
      yuliaReadable: message,
      ...extra,
    },
  };
}

function hasExplicitHumanApproval(toolInput: Record<string, any>, envelope: Record<string, any>) {
  return (
    inputHasExplicitConfirmation(toolInput) ||
    envelope.confirmed === true ||
    envelope.userConfirmed === true ||
    envelope.humanApproval?.confirmed === true
  );
}

function hasCounselReviewClearance(envelope: Record<string, any>) {
  return envelope.counselReview?.cleared === true || envelope.counselReviewCleared === true;
}

function hasEnterpriseScope(envelope: Record<string, any>) {
  return envelope.enterpriseScope?.approved === true || envelope.enterpriseScopeApproved === true;
}

function validateVersionEnvelope(envelope: Record<string, any>) {
  const specVersion = nullableString(envelope.specVersion);
  const specUri = nullableString(envelope.specUri);
  const methodologyVersion = nullableString(envelope.methodologyVersion);
  const methodologyUri = nullableString(envelope.methodologyUri);

  if (specVersion && specVersion !== DEFINITIVE_SPEC_VERSION) {
    return unsupportedVersion('specVersion', specVersion, DEFINITIVE_SPEC_VERSION);
  }
  if (specUri && specUri !== DEFINITIVE_SPEC_URI) {
    return unsupportedVersion('specUri', specUri, DEFINITIVE_SPEC_URI);
  }
  if (methodologyVersion && methodologyVersion !== DEFINITIVE_METHODOLOGY_VERSION) {
    return unsupportedVersion('methodologyVersion', methodologyVersion, DEFINITIVE_METHODOLOGY_VERSION);
  }
  if (methodologyUri && methodologyUri !== DEFINITIVE_METHODOLOGY_URI) {
    return unsupportedVersion('methodologyUri', methodologyUri, DEFINITIVE_METHODOLOGY_URI);
  }
  return null;
}

function unsupportedVersion(field: string, received: string, expected: string) {
  return {
    ok: false,
    error: 'unsupported_version',
    field,
    received,
    expected,
    ...versionPayload(),
  };
}

function versionPayload() {
  return {
    specVersion: DEFINITIVE_SPEC_VERSION,
    specUri: DEFINITIVE_SPEC_URI,
    methodologyVersion: DEFINITIVE_METHODOLOGY_VERSION,
    methodologyUri: DEFINITIVE_METHODOLOGY_URI,
  };
}

function parseToolResult(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return { text: value };
  }
}

function nullableString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function resolveRequestId(input: DefinitiveToolCallInput, envelope: Record<string, any>) {
  return (
    nullableString(envelope.requestId) ||
    nullableString(envelope.idempotencyKey) ||
    nullableString(input.input?.requestId) ||
    nullableString(input.input?.idempotencyKey) ||
    `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
  );
}

function resolveIdempotencyKey(input: DefinitiveToolCallInput, envelope: Record<string, any>) {
  return (
    nullableString(envelope.idempotencyKey) ||
    nullableString(input.input?.idempotencyKey) ||
    null
  );
}

function nullableNumber(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function buildPersistedDealStateReadResult(snapshot: Record<string, any> | null) {
  if (!snapshot) {
    return {
      schema: 'PersistedDealState.v0.1',
      snapshot: null,
      dealState: null,
      next_suggested_calls: [],
      portableTakeBackArtifacts: ['DealState'],
    };
  }
  const dealState = {
    protocol: DEFINITIVE_DEAL_STATE_PROTOCOL,
    stateId: snapshot.stateId,
    cid: snapshot.stateCid,
    stateHash: snapshot.stateHash,
    revision: snapshot.revision,
    parentCids: snapshot.parentCids || [],
    idempotencyKey: snapshot.idempotencyKey || null,
    payload: snapshot.payload || {},
    classificationKey: snapshot.classificationKey || {},
    overlays: snapshot.overlays || [],
    signals: snapshot.signals || null,
    missingInputContract: snapshot.missingInputContract || {},
    completenessReport: snapshot.completenessReport || {},
    sourceIndex: snapshot.sourceIndex || [],
    methodologyVersion: snapshot.methodologyVersion || DEFINITIVE_METHODOLOGY_VERSION,
    methodologyUri: snapshot.methodologyUri || DEFINITIVE_METHODOLOGY_URI,
    specVersion: snapshot.specVersion || DEFINITIVE_SPEC_VERSION,
    specUri: snapshot.specUri || DEFINITIVE_SPEC_URI,
  };
  return {
    schema: 'PersistedDealState.v0.1',
    snapshot,
    dealState,
    classificationKey: dealState.classificationKey,
    missingInputContract: dealState.missingInputContract,
    completenessReport: dealState.completenessReport,
    next_suggested_calls: [
      {
        toolName: 'check_completeness',
        label: 'Check Completeness',
        why: 'Re-score the persisted DealState before the next work step.',
        inputHint: { dealState: '<DealState>' },
      },
      {
        toolName: 'compose_deal_plan',
        label: 'Compose Deal Plan',
        why: 'Return the current lifecycle position and next work surfaces.',
        inputHint: { dealState: '<DealState>' },
      },
      {
        toolName: 'compose_model_stack',
        label: 'Compose Model Stack',
        why: 'Re-map applicable deterministic mechanics from the persisted deal profile.',
        inputHint: {
          journey: dealState.classificationKey?.journey,
          league: dealState.classificationKey?.league,
          dealType: dealState.payload?.dealType || dealState.payload?.dealStructure || dealState.payload?.structure,
        },
      },
    ],
    portableTakeBackArtifacts: [
      'DealState',
      'ClassificationKey',
      'MissingInputContract',
      'CompletenessReport',
      'MCPCallHint[]',
    ],
    lineInvariant:
      'DEFINITIVE reads and organizes persisted deal state. The user, counsel, advisor, or court makes legal, tax, fairness, feasibility, solvency, negotiation, and closing determinations.',
  };
}

function normalizeScopes(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map(String).map(scope => scope.trim()).filter(Boolean))];
}

function isStaticDefinitiveDiscoveryTool(
  toolName: DefinitiveMcpToolName,
): toolName is 'introspect_capabilities' | 'describe_methodology' | 'estimate_deal_cost' | 'get_deal_runbook' | 'lookup_model_slot' {
  return (
    toolName === 'introspect_capabilities' ||
    toolName === 'describe_methodology' ||
    toolName === 'estimate_deal_cost' ||
    toolName === 'get_deal_runbook' ||
    toolName === 'lookup_model_slot'
  );
}

function executeStaticDefinitiveDiscoveryTool(
  toolName: 'introspect_capabilities' | 'describe_methodology' | 'estimate_deal_cost' | 'get_deal_runbook' | 'lookup_model_slot',
  toolInput: Record<string, any>,
) {
  if (toolName === 'introspect_capabilities') return buildCapabilityCatalog(toolInput);
  if (toolName === 'describe_methodology') return buildMethodologyDescription(toolInput);
  if (toolName === 'get_deal_runbook') return buildDealRunbookToolResult(toolInput);
  if (toolName === 'lookup_model_slot') return buildModelSlotLookupToolResult(toolInput);
  return buildDealCostEstimate(toolInput);
}

function buildDealRunbookToolResult(toolInput: Record<string, any>) {
  const journey = normalizeJourney(toolInput.journey);
  const pageOptions = { limit: toolInput.limit, cursor: toolInput.cursor };
  if (!journey) return buildDefinitiveDealRunbooksSurface(pageOptions);
  const runbook = getDefinitiveDealRunbook(journey, pageOptions);
  return runbook || {
    schema: 'DEFINITIVE.deal-runbook.not-found.v0.1',
    ok: false,
    journey: toolInput.journey,
    supportedJourneys: ['buy', 'sell', 'raise', 'pmi'],
  };
}

function buildModelSlotLookupToolResult(toolInput: Record<string, any>) {
  const slotId = nullableString(toolInput.slotId);
  if (!slotId) return buildDefinitiveModelCatalogSurface({ limit: toolInput.limit, cursor: toolInput.cursor });
  const slot = getDefinitiveModelSlotSurface(slotId);
  return slot || {
    schema: 'DEFINITIVE.model-slot.not-found.v0.1',
    ok: false,
    slotId,
    examples: ['M109', 'M148', 'M200', 'M206', 'M221'],
  };
}

function buildCapabilityCatalog(toolInput: Record<string, any>) {
  const architecture = getDefinitiveSubstrateArchitecturePlan();
  const mechanics = composeDefinitiveApplicableMechanics({
    journey: normalizeJourney(toolInput.journey),
    league: nullableString(toolInput.league),
    dealType: nullableString(toolInput.dealType) || nullableString(toolInput.objective),
    industry: nullableString(toolInput.industry),
    jurisdiction: nullableString(toolInput.jurisdiction),
    triggeredGates: normalizeStringArray(toolInput.triggeredGates),
    includeResearchOnly: true,
    limit: 24,
  });
  const includeTools = toolInput.includeTools === true;

  return {
    schema: 'CapabilityCatalog.v0.1',
    standard: architecture.publishedStandardDoctrine.name,
    methodologyVersion: DEFINITIVE_METHODOLOGY_VERSION,
    methodologyUri: DEFINITIVE_METHODOLOGY_URI,
    objective: nullableString(toolInput.objective) || 'enter_or_continue_deal_os_work',
    scope: {
      journey: normalizeJourney(toolInput.journey) || 'unknown',
      league: nullableString(toolInput.league) || 'unknown',
      dealType: nullableString(toolInput.dealType) || 'unknown',
      industry: nullableString(toolInput.industry) || 'unknown',
      jurisdiction: nullableString(toolInput.jurisdiction) || 'unknown',
      triggeredGates: normalizeStringArray(toolInput.triggeredGates),
    },
    noRejectionContract: architecture.agentOperatingDoctrine.noRejectionContract,
    recursiveWorkLoop: architecture.agentOperatingDoctrine.recursiveWorkLoop,
    lifecycleStages: architecture.dealOsLifecycleStages,
    workSurfaces: architecture.dealOsWorkSurfaces,
    takeBackArtifacts: architecture.agentTakeBackArtifacts,
    relevantMechanics: mechanics,
    relevantMechanicsSummary: summarizeDefinitiveApplicableMechanics(mechanics),
    recommendedEntryTools: [
      'ingest_deal_payload',
      'resume_deal',
      'check_completeness',
      'compose_deal_plan',
      'compose_model_stack',
    ],
    tools: includeTools
      ? listDefinitiveMcpTools().tools.map(tool => ({
        name: tool.name,
        requiredScopes: tool.requiredScopes,
        lineStatus: tool.lineStatus,
        description: tool.description,
      }))
      : undefined,
    next_suggested_calls: [
      {
        toolName: 'ingest_deal_payload',
        priority: 'P0',
        reason: 'Create or refresh DealState from whatever the agent already knows. Partial payloads are accepted.',
        inputHint: { payload: { journey: normalizeJourney(toolInput.journey) || undefined, dealType: nullableString(toolInput.dealType) || undefined } },
      },
      {
        toolName: 'compose_deal_plan',
        priority: 'P1',
        reason: 'Turn the current DealState into the iterative IOI -> LOI -> diligence -> model -> negotiation -> close -> PMI work plan.',
        inputHint: { dealState: '<DealState from ingest_deal_payload>' },
      },
      {
        toolName: 'compose_model_stack',
        priority: mechanics.length ? 'P1' : 'P2',
        reason: 'Map the current deal facts to the applicable M101-M223 deterministic mechanics and THE LINE boundaries.',
        inputHint: {
          journey: normalizeJourney(toolInput.journey) || undefined,
          league: nullableString(toolInput.league) || undefined,
          dealType: nullableString(toolInput.dealType) || undefined,
        },
      },
    ],
    the_line_invariant: architecture.lineDoctrine,
  };
}

function buildMethodologyDescription(toolInput: Record<string, any>) {
  const section = nullableString(toolInput.section) || 'overview';
  const architecture = getDefinitiveSubstrateArchitecturePlan();
  const mechanicsSummary = getDefinitiveDealMechanicsSummary();
  const mappingCoverage = getDefinitiveDealMappingCoverage();
  const routeSummary = getDefinitiveDealRouteMapSummary();
  const schemaRegistry = buildDefinitiveSchemaRegistry();
  const conformance = buildDefinitiveConformanceStatus();
  const passThroughSurface = getDefinitivePassThroughSurface();

  return {
    schema: 'MethodologyDescription.v0.1',
    section,
    standard: architecture.publishedStandardDoctrine,
    specVersion: DEFINITIVE_SPEC_VERSION,
    specUri: DEFINITIVE_SPEC_URI,
    methodologyVersion: DEFINITIVE_METHODOLOGY_VERSION,
    methodologyUri: DEFINITIVE_METHODOLOGY_URI,
    doctrine: {
      dealOs: architecture.agentOperatingDoctrine.productDoctrine,
      agentHome: architecture.agentOperatingDoctrine.homeContract,
      noRejection: architecture.agentOperatingDoctrine.noRejectionContract,
      recursiveWorkLoop: architecture.agentOperatingDoctrine.recursiveWorkLoop,
      bidirectionalHandoff: architecture.agentOperatingDoctrine.bidirectionalHandoff,
      line: architecture.lineDoctrine,
    },
    lifecycleStages: section === 'overview' || section === 'lifecycle' || section === 'agent_access'
      ? architecture.dealOsLifecycleStages
      : undefined,
    workSurfaces: section === 'overview' || section === 'lifecycle' || section === 'agent_access'
      ? architecture.dealOsWorkSurfaces
      : undefined,
    modelCatalog: toolInput.includeModelCatalog === true || ['overview', 'models', 'gates'].includes(section)
      ? {
        summary: mechanicsSummary,
        mappingCoverage,
        routeSummary,
      }
      : undefined,
    schemas: ['overview', 'schemas', 'agent_access'].includes(section)
      ? {
        registryVersion: schemaRegistry.version,
        schemaCount: schemaRegistry.schemaCount,
        schemaNames: schemaRegistry.schemaNames,
        toolSchemaMap: schemaRegistry.toolSchemaMap,
      }
      : undefined,
    passThrough: ['overview', 'pass_through', 'line'].includes(section)
      ? {
        pricingRule: passThroughSurface.pricingRule,
        marginPolicy: passThroughSurface.marginPolicy,
        allowed: passThroughSurface.allowed,
        prohibited: passThroughSurface.prohibited,
        humanDirectory: passThroughSurface.humanDirectory,
      }
      : undefined,
    authorityPlan: toolInput.includeAuthorityPlan === true
      ? {
        authorityRegisterTarget: mechanicsSummary.authorityRegisterTarget,
        posture: 'authority refs are versioned, citation-validatable anchors; live specialist data remains pass-through when required.',
      }
      : undefined,
    conformance: ['overview', 'conformance'].includes(section) ? conformance : undefined,
    next_suggested_calls: [
      {
        toolName: 'introspect_capabilities',
        priority: 'P0',
        reason: 'Ask for the relevant subset of the methodology before choosing tools for a specific deal.',
        inputHint: { objective: 'continue deal', journey: '<sell|buy|raise|pmi>', dealType: '<known deal type>' },
      },
      {
        toolName: 'ingest_deal_payload',
        priority: 'P0',
        reason: 'Move from methodology description to actual DealState work.',
        inputHint: { payload: '<partial facts are okay>' },
      },
    ],
    the_line_invariant: architecture.lineDoctrine,
  };
}

function buildDealCostEstimate(toolInput: Record<string, any>) {
  const monthlyModelRuns = nullableNonNegativeNumber(toolInput.monthlyModelRuns);
  const monthlyApiCalls = nullableNonNegativeNumber(toolInput.monthlyApiCalls);
  const monthlyStudioBooks = nullableNonNegativeNumber(toolInput.monthlyStudioBooks);
  const monthlyStudioExports = nullableNonNegativeNumber(toolInput.monthlyStudioExports);
  const teamSeats = nullableNonNegativeNumber(toolInput.teamSeats) || 1;
  const supervisedAgents = nullableNonNegativeNumber(toolInput.supervisedAgents);
  const autonomousAgents = nullableNonNegativeNumber(toolInput.autonomousAgents);
  const passThroughSurface = getDefinitivePassThroughSurface();
  const recommendedPlan = chooseWorkspacePlan({
    monthlyModelRuns,
    monthlyApiCalls,
    monthlyStudioBooks,
    monthlyStudioExports,
    teamSeats,
    needsApiMcp: toolInput.needsApiMcp === true,
    supervisedAgents,
    autonomousAgents,
    singleTenant: toolInput.singleTenant === true,
    sso: toolInput.sso === true,
  });

  return {
    schema: 'DealCostEstimate.v0.1',
    pricingDoctrine: 'Monthly subscriptions plus outcome-independent credits and software/data pass-through only. No wallet, no success fee, no referral fee, and no fee tied to deal value or closing.',
    recommendedPlan,
    plans: WORKSPACE_PLANS,
    usageProfile: {
      monthlyModelRuns,
      monthlyApiCalls,
      monthlyStudioBooks,
      monthlyStudioExports,
      teamSeats,
      needsApiMcp: toolInput.needsApiMcp === true,
      supervisedAgents,
      autonomousAgents,
      singleTenant: toolInput.singleTenant === true,
      sso: toolInput.sso === true,
    },
    passThrough: {
      pricingRule: passThroughSurface.pricingRule,
      marginPolicy: passThroughSurface.marginPolicy,
      requestedCalls: summarizePassThroughCalls(toolInput.passThroughCalls),
      allowed: passThroughSurface.allowed,
      prohibited: passThroughSurface.prohibited,
      catalogStatus: passThroughSurface.priceListStatus,
    },
    next_suggested_calls: [
      {
        toolName: 'introspect_capabilities',
        priority: 'P1',
        reason: 'Map the user or agent workload to the exact deal mechanics and surfaces before estimating heavier usage.',
        inputHint: { objective: 'price the expected deal workflow' },
      },
      {
        toolName: 'check_completeness',
        priority: 'P2',
        reason: 'Completeness status usually determines whether the next cost is model work, Studio output, or pass-through data/software.',
        inputHint: { dealState: '<DealState when available>' },
      },
    ],
    the_line_invariant: 'DEFINITIVE may bill for software/data API consumption at per-call cost or cost-plus-fixed margin regardless of deal outcome. It may not receive success fees, deal-value fees, or human-service referral compensation.',
  };
}

function chooseWorkspacePlan(input: {
  monthlyModelRuns: number;
  monthlyApiCalls: number;
  monthlyStudioBooks: number;
  monthlyStudioExports: number;
  teamSeats: number;
  needsApiMcp: boolean;
  supervisedAgents: number;
  autonomousAgents: number;
  singleTenant: boolean;
  sso: boolean;
}) {
  if (input.singleTenant || input.sso || input.autonomousAgents > 0) {
    return { ...WORKSPACE_PLANS[4], reason: 'Enterprise governance, SSO, single-tenant deployment, or autonomous governed agent scope is required.' };
  }
  if (input.teamSeats > 1 || input.supervisedAgents > 0) {
    return { ...WORKSPACE_PLANS[3], reason: 'Shared seats, supervised agent work, firm templates, and shared deal vaults need Team.' };
  }
  if (
    input.needsApiMcp ||
    input.monthlyApiCalls > 0 ||
    input.monthlyModelRuns >= 10 ||
    input.monthlyStudioBooks > 0 ||
    input.monthlyStudioExports > 0
  ) {
    return { ...WORKSPACE_PLANS[2], reason: 'Active full-stack deal work and agent/API access belong on Pro.' };
  }
  if (input.monthlyModelRuns > 0) {
    return { ...WORKSPACE_PLANS[1], reason: 'Solo fits one operator running a real deal without shared agent governance.' };
  }
  return { ...WORKSPACE_PLANS[0], reason: 'Free is a low-risk test drive for unlimited Yulia Q&A and one deliverable.' };
}

function summarizePassThroughCalls(value: unknown) {
  const passThroughSurface = getDefinitivePassThroughSurface();
  if (!Array.isArray(value)) return [];
  return value.map(item => {
    const call = item && typeof item === 'object' ? item as Record<string, any> : {};
    const id = nullableString(call.id) || nullableString(call.substrateId) || 'unknown';
    const quantity = nullableNonNegativeNumber(call.quantity) || 1;
    const catalogEntry = passThroughSurface.catalog.find(entry => (
      entry.id === id ||
      entry.label.toLowerCase() === id.toLowerCase()
    ));
    return {
      id,
      quantity,
      catalogLabel: catalogEntry?.label || null,
      priceDisplay: catalogEntry?.priceDisplay || 'Use published vendor price plus fixed margin when cataloged.',
      pricingMode: catalogEntry?.pricingMode || 'vendor_cost_plus_fixed_margin',
      chargedRegardlessOfOutcome: true,
      humanReferralCompensationAllowed: false,
    };
  });
}

function normalizeJourney(value: unknown): DefinitiveJourney | null {
  if (value === 'sell' || value === 'buy' || value === 'raise' || value === 'pmi') return value;
  return null;
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map(String).map(item => item.trim()).filter(Boolean))];
}

function nullableNonNegativeNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}
