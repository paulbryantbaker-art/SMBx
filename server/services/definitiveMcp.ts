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
import {
  buildDefinitiveSchemaRegistry,
  getDefinitiveSchema,
  getDefinitiveToolSchemaMap,
} from './definitiveSchemas.js';
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
  'assess_deal_entry',
  'introspect_capabilities',
  'describe_methodology',
  'estimate_deal_cost',
  'get_deal_runbook',
  'lookup_model_slot',
  'compose_deal_plan',
  'diff_deal_state',
  'clone_deal_state',
  'compose_deal_package',
  'verify_package',
  'finalize_deal_package',
  'reopen_deal_package',
  'generate_permutations',
  'score_permutation',
  'set_objective_preference',
  'compute_best_vehicle',
  'expand_permutations',
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
  'run_model_iteration',
  'list_model_executions',
  'generate_output_doc',
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
  assess_deal_entry: {
    description: 'Assess where an external agent or human is entering the M&A lifecycle from partial facts, EV-only context, existing artifacts, or a prior DealState. Returns the likely Deal OS stage, accepted missing inputs, model/document routing, and exact next_suggested_calls so the agent is never rejected for not knowing the whole process.',
    inputSchema: {
      type: 'object',
      properties: {
        objective: { type: 'string', description: 'Optional objective, such as start a deal, IOI, LOI, diligence, model rerun, term sheet, negotiation, close, or PMI.' },
        journey: { type: 'string', enum: ['sell', 'buy', 'raise', 'pmi'], description: 'Optional expected journey.' },
        payload: { type: 'object', description: 'Partial DealPayload or loose deal facts. Money values must be cents.' },
        dealState: { type: 'object', description: 'Optional prior DealState when the agent is returning to a live deal.' },
        knownArtifacts: { type: 'array', items: { type: 'string' }, description: 'Artifacts already in hand, such as teaser, IOI, LOI, data_room, model_output, term_sheet, diligence_request, closing_checklist, or pmi_plan.' },
        enterpriseValueCents: { type: 'number', description: 'Known EV in cents. Agents often have this before full model inputs.' },
        ebitdaCents: { type: 'number', description: 'Known EBITDA in cents.' },
        revenueCents: { type: 'number', description: 'Known revenue in cents.' },
        dealType: { type: 'string', description: 'Optional deal type or structure, such as asset purchase, distressed sale, real estate, IP-heavy acquisition, or raise.' },
        industry: { type: 'string', description: 'Optional industry.' },
        jurisdiction: { type: 'string', description: 'Optional jurisdiction.' },
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
  clone_deal_state: {
    description: 'Clone a DealState into a new content-addressed revision for scenario work, parallel agent work, or branch-safe diligence updates. The clone preserves the parent CID and returns the same MissingInputContract, completeness, and next-call guidance pattern.',
    inputSchema: {
      type: 'object',
      properties: {
        dealState: { type: 'object', description: 'Source DealState to clone.' },
        payload: { type: 'object', description: 'Optional source payload when a DealState is not available.' },
        patch: { type: 'object', description: 'Optional patch to apply to the cloned payload, such as scenarioLabel or adjusted assumptions.' },
        cloneReason: { type: 'string', description: 'Optional reason for the clone, such as scenario_analysis or parallel_agent_review.' },
        idempotencyKey: { type: 'string', description: 'Optional caller-generated idempotency key.' },
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
  verify_package: {
    description: 'Verify a portable DealPackage before an external agent relies on it or takes it back. Recomputes the package CID from dealStateHash plus dealPlan.planId when possible, checks companion DealState identity, confirms take-back artifacts and THE LINE invariant, and returns PackageVerification.v0.1 without making a legal, tax, fairness, solvency, feasibility, negotiation, or closing determination.',
    inputSchema: {
      type: 'object',
      properties: {
        dealPackage: { type: 'object', description: 'DealPackage returned by compose_deal_package or resume_deal.' },
        dealState: { type: 'object', description: 'Optional companion DealState used to verify dealStateCid and dealStateHash.' },
        expectedPackageCid: { type: 'string', description: 'Optional caller-known package CID that must match.' },
        expectedDealStateCid: { type: 'string', description: 'Optional caller-known DealState CID that must match.' },
      },
    },
  },
  finalize_deal_package: {
    description: 'Finalize a verified DealPackage into portable take-back artifacts: PackageVerification, AuditPacket, SignedManifest, Attestation, and MerkleInclusionProof. This stamps the software package manifest only; it does not authorize closing, move funds, negotiate, or provide legal, tax, fairness, solvency, or feasibility advice.',
    inputSchema: {
      type: 'object',
      properties: {
        dealPackage: { type: 'object', description: 'DealPackage returned by compose_deal_package or resume_deal.' },
        dealState: { type: 'object', description: 'Optional companion DealState used for verification and persistence.' },
        expectedPackageCid: { type: 'string', description: 'Optional caller-known package CID that must match before finalization.' },
        expectedDealStateCid: { type: 'string', description: 'Optional caller-known DealState CID that must match before finalization.' },
        signedAt: { type: 'string', description: 'Optional ISO timestamp for deterministic replay tests.' },
        signer: { type: 'string', description: 'Optional software signer identifier.' },
      },
    },
  },
  reopen_deal_package: {
    description: 'Reopen a DealPackage into a new content-addressed DealState revision when a human or external agent brings back new facts, documents, model outputs, or diligence answers. Preserves package and prior-state lineage so the full Deal OS loop can continue iteratively rather than treating the package as a dead archive.',
    inputSchema: {
      type: 'object',
      properties: {
        dealPackage: { type: 'object', description: 'Prior DealPackage being reopened.' },
        dealState: { type: 'object', description: 'Optional companion DealState from the prior package.' },
        patch: { type: 'object', description: 'New facts, documents, assumptions, model outputs, or diligence answers to merge into the reopened state.' },
        reopenReason: { type: 'string', description: 'Reason the package is being reopened.' },
        idempotencyKey: { type: 'string', description: 'Optional caller-generated idempotency key.' },
      },
    },
  },
  generate_permutations: {
    description: 'Generate deterministic structure permutations for the current DealState and return a ParetoFrontier. This compares possible deal vehicles under a stated objectivePreference without recommending a transaction structure.',
    inputSchema: {
      type: 'object',
      properties: {
        dealState: { type: 'object', description: 'Optional DealState.' },
        payload: { type: 'object', description: 'Optional DealPayload.' },
        objectivePreference: { type: 'string', description: 'balanced, seller_cash, buyer_basis, certainty, speed, or simplicity.' },
        weights: { type: 'object', description: 'Optional custom score weights.' },
        includeExpanded: { type: 'boolean', description: 'Whether to include second-order structure variants.' },
      },
    },
  },
  score_permutation: {
    description: 'Score one structure permutation deterministically under a stated objectivePreference. Returns StructurePermutation plus ModelOutput; the user and advisors decide whether to rely on it.',
    inputSchema: {
      type: 'object',
      properties: {
        dealState: { type: 'object' },
        payload: { type: 'object' },
        structure: { type: 'string', description: 'Structure key such as asset_purchase, stock_purchase, section_363_sale, or sale_leaseback.' },
        objectivePreference: { type: 'string' },
        weights: { type: 'object' },
      },
    },
  },
  set_objective_preference: {
    description: 'Set the caller objectivePreference for the permutation engine and return the corresponding ParetoFrontier. This records preferences for computation only and does not recommend a structure.',
    inputSchema: {
      type: 'object',
      properties: {
        dealState: { type: 'object' },
        payload: { type: 'object' },
        objectivePreference: { type: 'string' },
        weights: { type: 'object' },
        includeExpanded: { type: 'boolean' },
      },
    },
  },
  compute_best_vehicle: {
    description: 'Compute the highest-scoring structure point under caller-stated preferences and return BestVehicleBlock with ParetoFrontier and unresolved handoffs. This is computed-best under supplied weights, not advice or a recommendation.',
    inputSchema: {
      type: 'object',
      properties: {
        dealState: { type: 'object' },
        payload: { type: 'object' },
        permutations: { type: 'array', items: { type: 'object' } },
        objectivePreference: { type: 'string' },
        weights: { type: 'object' },
        includeExpanded: { type: 'boolean' },
      },
    },
  },
  expand_permutations: {
    description: 'Expand the structure-permutation set with overlay and second-order variants, then return the updated ParetoFrontier. Use before packaging when agents need a broader vehicle search.',
    inputSchema: {
      type: 'object',
      properties: {
        dealState: { type: 'object' },
        payload: { type: 'object' },
        objectivePreference: { type: 'string' },
        weights: { type: 'object' },
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
    description: 'Fetch timestamped market/regulatory data from the market-data cache, or resolve a market-multiple packet for valuation/LBO/comps assumptions from NAICS benchmarks and closed-deal comps with source and freshness metadata.',
    inputSchema: {
      type: 'object',
      properties: {
        key: { type: 'string', description: 'Market data key, for example SOFR, PRIME, HSR_SIZE_OF_TRANSACTION. Equivalent to seriesId for cached series reads.' },
        seriesId: { type: 'string', description: 'Market data series ID, for example SOFR, DPRIME, or DGS10.' },
        dataType: { type: 'string', enum: ['series', 'market_multiples'], description: 'Use market_multiples when the agent needs target, entry, base, or exit multiple support.' },
        calculation: { type: 'string', description: 'Calculation needing market support, such as valuation, lbo, or comps.' },
        industry: { type: 'string', description: 'Industry name, used to infer NAICS when naicsCode is absent.' },
        naicsCode: { type: 'string', description: 'NAICS code for market multiple lookup.' },
        geography: { type: 'string', description: 'Market geography or jurisdiction, such as US-TX.' },
        league: { type: 'string', description: 'Optional deal-size league, such as L3 or L4.' },
        metric: { type: 'string', enum: ['sde', 'ebitda', 'revenue'], description: 'Multiple basis to resolve.' },
      },
      required: [],
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
    description: 'Execute a deterministic server-side V19 model by MODEL.*.v1 runtime id or a public DEFINITIVE M101-M223 slot when that slot has an implemented runtime model. Returns output hash, citations, missing inputs, and audit payload.',
    inputSchema: {
      type: 'object',
      properties: {
        modelId: { type: 'string', description: 'Canonical runtime model ID, for example MODEL.VAL.EBITDA.v1, or a public DEFINITIVE M-slot such as M200 when executable.' },
        modelSlotId: { type: 'string', description: 'Optional public DEFINITIVE M-slot ID, such as M109, M148, M200, M206, or M221. The tool resolves it to implementedRuntimeModelId when available.' },
        input: { type: 'object', description: 'Model inputs. Financial values must be cents.' },
        dealId: { type: 'number', description: 'Optional deal ID for audit context.' },
        marketMultiplePacket: { type: 'object', description: 'Optional MarketMultiplePacket.v0.1. For valuation/LBO models, the substrate uses this to populate low/high or exit multiples with provenance.' },
        industry: { type: 'string', description: 'Optional industry context for automatic market-multiple lookup when valuation/LBO multiples are missing.' },
        naicsCode: { type: 'string', description: 'Optional NAICS context for automatic market-multiple lookup.' },
        geography: { type: 'string', description: 'Optional geography or jurisdiction context for market-multiple lookup.' },
        league: { type: 'string', description: 'Optional deal-size league for market-multiple lookup.' },
        metric: { type: 'string', enum: ['sde', 'ebitda', 'revenue'], description: 'Optional multiple basis for market-multiple lookup.' },
      },
      required: ['input'],
    },
  },
  run_model_iteration: {
    description: 'Iteratively run a first deterministic model pass or rerun a saved model execution with input overrides. Returns persisted execution lineage, parent output hash, missing inputs, citations, output hash, and next_suggested_calls so external agents can iterate deal models instead of treating modeling as one-and-done.',
    inputSchema: {
      type: 'object',
      properties: {
        dealId: { type: 'number', description: 'Optional deal ID for audit context.' },
        modelId: { type: 'string', description: 'Canonical MODEL.*.v1 id or public DEFINITIVE M-slot ID. Optional when executionId or modelSlotId is supplied.' },
        modelSlotId: { type: 'string', description: 'Optional public DEFINITIVE M-slot ID, such as M109, M148, M200, M206, or M221. The tool resolves it to implementedRuntimeModelId when available.' },
        executionId: { type: 'number', description: 'Optional prior model execution ID to rerun from.' },
        input: { type: 'object', description: 'New model inputs. Financial values must be cents.' },
        overrides: { type: 'object', description: 'Assumption overrides layered on top of the prior execution inputs.' },
        reason: { type: 'string', description: 'Why this iteration is being run, for audit and version history.' },
        marketMultiplePacket: { type: 'object', description: 'Optional MarketMultiplePacket.v0.1. For valuation/LBO models, the substrate uses this to populate low/high or exit multiples with provenance.' },
        industry: { type: 'string', description: 'Optional industry context for automatic market-multiple lookup when valuation/LBO multiples are missing.' },
        naicsCode: { type: 'string', description: 'Optional NAICS context for automatic market-multiple lookup.' },
        geography: { type: 'string', description: 'Optional geography or jurisdiction context for market-multiple lookup.' },
        league: { type: 'string', description: 'Optional deal-size league for market-multiple lookup.' },
        metric: { type: 'string', enum: ['sde', 'ebitda', 'revenue'], description: 'Optional multiple basis for market-multiple lookup.' },
      },
    },
  },
  list_model_executions: {
    description: 'List persisted model executions and iterative model canvas versions for a deal, canvas tab, or model type. Returns output hashes, ModelOutput/runtime-output envelopes, version snapshots, parent-output lineage, dependency contracts, freshness/rerun status against optional current assumptions, and next_suggested_calls so agents can understand what has already been modeled before rerunning the deal.',
    inputSchema: {
      type: 'object',
      properties: {
        dealId: { type: 'number', description: 'Optional deal id to list saved model runs for.' },
        canvasTabId: { type: 'string', description: 'Optional model canvas tab id to read the saved version trail for.' },
        modelType: { type: 'string', description: 'Optional UI model type such as valuation, lbo, dcf, working_capital, or tax_impact.' },
        currentAssumptions: { type: 'object', description: 'Optional current model assumptions. When supplied, each saved execution is marked current, superseded, or needs_rerun against these assumptions.' },
        currentVersionNumber: { type: 'number', description: 'Optional current model canvas version number for version comparison.' },
        limit: { type: 'number', description: 'Optional page size. Defaults to 25 and caps at 100.' },
      },
    },
  },
  generate_output_doc: {
    description: 'Generate a deal output document by agent-friendly name such as Term Sheet, LOI, IOI, diligence_request, data_room_index, funds_flow, negotiation_brief, pmi_plan, CIM, IC memo, or valuation_report. Resolves the internal deliverable route from the current deal state and model lineage, queues the document, returns a Doc/Studio action, model-dependency context, and THE LINE boundaries without requiring agents to know smbX menu slugs.',
    inputSchema: {
      type: 'object',
      properties: {
        dealId: { type: 'number', description: 'Deal ID.' },
        documentType: { type: 'string', description: 'Output document type, for example term_sheet, loi, diligence_request, funds_flow, pmi_plan, cim, or ic_memo.' },
        audience: { type: 'string', description: 'Optional audience label.' },
        purpose: { type: 'string', description: 'Optional drafting purpose.' },
        sourceModelExecutionIds: { type: 'array', items: { type: 'number' }, description: 'Optional saved model executions this document should rely on.' },
        currentAssumptions: { type: 'object', description: 'Optional current assumptions for model freshness checking before document generation.' },
        requireFreshModels: { type: 'boolean', description: 'When true, return a model refresh gate instead of generating if dependencies are missing, stale, superseded, or unknown.' },
        modelPreference: { type: 'string', enum: ['auto', 'fast', 'deep', 'drafting', 'research'], description: 'Optional generation preference.' },
      },
      required: ['dealId', 'documentType'],
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
  assess_deal_entry: ['capability:read', 'methodology:read', 'deal-plan:read'],
  introspect_capabilities: ['capability:read', 'methodology:read'],
  describe_methodology: ['methodology:read', 'authority:read'],
  estimate_deal_cost: ['pricing:read', 'pass-through:read'],
  get_deal_runbook: ['methodology:read', 'deal-plan:read'],
  lookup_model_slot: ['methodology:read', 'model-catalog:read'],
  compose_deal_plan: ['deal-state:read', 'deal-plan:read'],
  diff_deal_state: ['deal-state:read', 'deal-state:diff'],
  clone_deal_state: ['deal-state:read', 'deal-state:write'],
  compose_deal_package: ['deal-state:read', 'deal-package:read'],
  verify_package: ['deal-package:read', 'deal-package:verify'],
  finalize_deal_package: ['deal-package:read', 'deal-package:verify', 'audit:write'],
  reopen_deal_package: ['deal-package:read', 'deal-state:write'],
  generate_permutations: ['deal-state:read', 'permutation:read'],
  score_permutation: ['deal-state:read', 'permutation:read'],
  set_objective_preference: ['deal-state:read', 'permutation:read'],
  compute_best_vehicle: ['deal-state:read', 'permutation:read'],
  expand_permutations: ['deal-state:read', 'permutation:read'],
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
  run_model_iteration: ['model:execute', 'audit:write', 'model:read'],
  list_model_executions: ['model:read', 'deal:read'],
  generate_output_doc: ['deal-state:read', 'studio:draft', 'model:read'],
  record_corpus_observation: ['corpus:write', 'data-rights:read'],
  validate_conformance: ['conformance:read'],
  close_deal: ['deal:write', 'immutable:write'],
  update_tax_position: ['deal:write', 'counsel:review'],
  query_admin_data: ['admin:read', 'enterprise:scope'],
};

const TOOL_INTERNAL_API_METER = new Set<DefinitiveMcpToolName>([
  'fetch_market_data',
  'validate_conformance',
  'assess_deal_entry',
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
    builtFor: 'One operator, one deal at a time, with one supervised MCP/agent key.',
  },
  {
    id: 'pro',
    label: 'Pro',
    monthlyPriceCents: 19900,
    priceLabel: '$199/mo',
    builtFor: 'Active dealmakers running the full deal stack, Studio output, models, and three supervised MCP/agent keys.',
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
      mode: 'jwt_internal_plus_scoped_agent_tokens',
      productionTarget: 'OAuth 2.1 + PKCE + audience-bound scoped tokens',
      localDev: 'Use the existing smbX JWT bearer token while the MCP transport is internal.',
      scopedAgentTokenBridge: {
        tokenUse: 'definitive_agent',
        requiredClaims: ['userId', 'scopes'],
        optionalClaims: ['agentId', 'agentPlatformId', 'beneficialCustomerId', 'billingOrgId', 'mandateId'],
        scopeEnforcement:
          'When a bearer token carries agent scopes, requestedScopes must be omitted or be a subset of token-bound scopes. Tool-required scopes are checked against that token-bound envelope before execution.',
      },
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
        outputSchema: buildToolOutputSchema(name),
        structuredContent: buildToolStructuredContent(name),
        annotations: buildToolAnnotations(name),
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

function buildToolOutputSchema(name: DefinitiveMcpToolName) {
  const schemaMap = getDefinitiveToolSchemaMap()[name];
  return {
    type: 'object',
    additionalProperties: true,
    description: `Structured result envelope for ${name}. The concrete result payload is mapped by DEFINITIVE schema names for agent tool-search and verifier use.`,
    properties: {
      ok: { type: 'boolean' },
      result: { type: 'object', additionalProperties: true },
    },
    definitiveOutputSchemas: schemaMap?.output || [],
    definitiveTakeBackSchemas: schemaMap?.takeBack || [],
  };
}

function buildToolStructuredContent(name: DefinitiveMcpToolName) {
  const schemaMap = getDefinitiveToolSchemaMap()[name];
  const outputSchemas = Object.fromEntries((schemaMap?.output || []).map(schemaName => [schemaName, getDefinitiveSchema(schemaName)]));
  return {
    schemaVersion: 'DEFINITIVE.structured-content.v0.1',
    outputSchemaNames: schemaMap?.output || [],
    takeBackSchemaNames: schemaMap?.takeBack || [],
    outputSchemas,
    methodologyVersion: DEFINITIVE_METHODOLOGY_VERSION,
    lineInvariant:
      'Structured content describes software/data outputs only. Users and qualified professionals make regulated determinations.',
  };
}

function buildToolAnnotations(name: DefinitiveMcpToolName) {
  const scopes = TOOL_SCOPE[name] || [];
  const writesInternally = scopes.some(scope => scope.endsWith(':write') || scope === 'audit:write' || scope === 'deal:write');
  return {
    readOnlyHint: !writesInternally,
    destructiveHint: name === 'close_deal',
    openWorldHint: ['fetch_market_data', 'lookup_citation', 'defer_to_counsel'].includes(name),
    idempotentHint: true,
    resultSize: 'bounded',
    methodologyPinned: DEFINITIVE_METHODOLOGY_VERSION,
    noSuccessFee: true,
    noPaidHumanReferral: true,
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

  if (input.toolName === 'list_model_executions') {
    const { listModelExecutions } = await import('./modelExecutionPersistence.js');
    const result = await listModelExecutions({
      userId: input.userId,
      dealId: nullableNumber(input.input?.dealId),
      canvasTabId: nullableString(input.input?.canvasTabId),
      modelType: nullableString(input.input?.modelType),
      currentAssumptions: safeRecord(input.input?.currentAssumptions),
      currentVersionNumber: nullableNumber(input.input?.currentVersionNumber),
      limit: nullableNumber(input.input?.limit),
    });
    if (routeMetersCall) {
      await recordV19UsageEvent({
        userId: input.userId,
        eventType: 'api_call',
        actionId: `definitive.${input.toolName}`,
        toolName: input.toolName,
        sourceSurface: 'mcp',
        actorType: 'agent',
        resourceType: 'model_execution',
        resourceId: nullableString(input.input?.canvasTabId) || String(input.input?.dealId || input.toolName),
        agentId: mandateContext.agentId,
        agentPlatformId: mandateContext.agentPlatformId,
        mandateId: mandateContext.mandateId,
        requestedScopes,
        metadata: {
          protocol: DEFINITIVE_MCP_PROTOCOL,
          lineStatus: line?.lineStatus || 'ok',
          count: Array.isArray((result as any).executions) ? (result as any).executions.length : 0,
        },
      });
    }
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
        result: {
          schema: 'ModelExecutionHistory.v0.1',
          filters: {
            dealId: nullableNumber(input.input?.dealId),
            canvasTabId: nullableString(input.input?.canvasTabId),
            modelType: nullableString(input.input?.modelType),
            freshnessCompared: Boolean(input.input?.currentAssumptions && typeof input.input.currentAssumptions === 'object'),
          },
          ...(result as Record<string, any>),
          next_suggested_calls: ['execute_model', 'compose_model_stack', 'get_deal_state', 'diff_deal_state'],
          lineBoundary:
            'Model execution history is software audit state. The user or qualified professional decides reliance and next transaction action.',
        },
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

function safeRecord(value: unknown): Record<string, any> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, any> : {};
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
): toolName is 'assess_deal_entry' | 'introspect_capabilities' | 'describe_methodology' | 'estimate_deal_cost' | 'get_deal_runbook' | 'lookup_model_slot' {
  return (
    toolName === 'assess_deal_entry' ||
    toolName === 'introspect_capabilities' ||
    toolName === 'describe_methodology' ||
    toolName === 'estimate_deal_cost' ||
    toolName === 'get_deal_runbook' ||
    toolName === 'lookup_model_slot'
  );
}

function executeStaticDefinitiveDiscoveryTool(
  toolName: 'assess_deal_entry' | 'introspect_capabilities' | 'describe_methodology' | 'estimate_deal_cost' | 'get_deal_runbook' | 'lookup_model_slot',
  toolInput: Record<string, any>,
) {
  if (toolName === 'assess_deal_entry') return buildAgentEntryAssessment(toolInput);
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

function buildAgentEntryAssessment(toolInput: Record<string, any>) {
  const payload = {
    ...safeRecord(toolInput.payload),
    ...safeRecord(toolInput.dealState?.payload),
  };
  const knownArtifacts = normalizeStringArray(toolInput.knownArtifacts || payload.knownArtifacts || payload.artifacts);
  const objective = nullableString(toolInput.objective) || nullableString(payload.objective) || 'continue_deal';
  const journey = normalizeJourney(toolInput.journey)
    || normalizeJourney(payload.journey)
    || normalizeJourney(payload.journeyType)
    || inferJourneyFromEntry(objective, payload, knownArtifacts);
  const dealType = nullableString(toolInput.dealType)
    || nullableString(payload.dealType)
    || nullableString(payload.dealStructure)
    || nullableString(payload.structure)
    || nullableString(objective);
  const industry = nullableString(toolInput.industry) || nullableString(payload.industry);
  const jurisdiction = nullableString(toolInput.jurisdiction) || nullableString(payload.jurisdiction);
  const enterpriseValueCents = nullableNonNegativeNumber(toolInput.enterpriseValueCents)
    || nullableNonNegativeNumber(payload.enterpriseValueCents)
    || nullableNonNegativeNumber(payload.evCents)
    || nullableNonNegativeNumber(payload.purchasePriceCents)
    || nullableNonNegativeNumber(payload.askingPriceCents);
  const ebitdaCents = nullableNonNegativeNumber(toolInput.ebitdaCents) || nullableNonNegativeNumber(payload.ebitdaCents);
  const revenueCents = nullableNonNegativeNumber(toolInput.revenueCents) || nullableNonNegativeNumber(payload.revenueCents);
  const stage = inferEntryStage(objective, payload, knownArtifacts);
  const mechanics = composeDefinitiveApplicableMechanics({
    journey,
    league: nullableString(payload.league),
    dealType,
    industry,
    jurisdiction,
    triggeredGates: normalizeStringArray(payload.triggeredGates || payload.overlays),
    includeResearchOnly: true,
    limit: 18,
  });
  const normalizedPayloadHint = {
    journey: journey || undefined,
    targetName: nullableString(payload.targetName) || nullableString(payload.businessName) || undefined,
    industry: industry || undefined,
    jurisdiction: jurisdiction || undefined,
    dealType: dealType || undefined,
    enterpriseValueCents: enterpriseValueCents || undefined,
    ebitdaCents: ebitdaCents || undefined,
    revenueCents: revenueCents || undefined,
  };

  return {
    schema: 'AgentEntryAssessment.v0.1',
    standard: 'The Diligence Standard',
    methodologyVersion: DEFINITIVE_METHODOLOGY_VERSION,
    methodologyUri: DEFINITIVE_METHODOLOGY_URI,
    objective,
    acceptedEntry:
      'Partial information is accepted. DEFINITIVE creates or resumes DealState, names missing inputs, and returns next calls instead of rejecting the agent.',
    entryClassification: {
      journey: journey || 'unknown',
      likelyStage: stage.stageId,
      stageLabel: stage.label,
      confidence: stage.confidence,
      basis: stage.basis,
      knownArtifacts,
      knownFacts: {
        enterpriseValueCents: enterpriseValueCents || null,
        ebitdaCents: ebitdaCents || null,
        revenueCents: revenueCents || null,
        dealType: dealType || null,
        industry: industry || null,
        jurisdiction: jurisdiction || null,
      },
    },
    missingInputPosture: {
      blockingForEntry: false,
      likelyMissingInputs: buildEntryMissingInputs({ journey, stageId: stage.stageId, enterpriseValueCents, ebitdaCents, revenueCents, payload }),
      responseRule: 'Return MissingInputContract plus executable next_suggested_calls. Do not make the agent start over.',
    },
    iterativeModelingContract: {
      rule: 'Modeling is versioned and recursive for humans and agents: humans can manually adjust model-canvas inputs, optimize_scenario reads the active canvas, run_model_iteration creates v1 or child versions with parent output hashes, and documents should use generate_output_doc(requireFreshModels=true) when relying on model outputs.',
      firstPassWhenOnlyEvKnown: enterpriseValueCents > 0,
      staleFactsRequire: ['list_model_executions', 'run_model_iteration', 'diff_deal_state'],
      optimizationRule:
        'If the user or calling agent asks to optimize an LBO, valuation, financing structure, tax case, or term architecture, call optimize_scenario first, then persist the chosen assumption case as a new model iteration before generating downstream documents.',
      documentDependencyRule:
        'Before term sheets, LOIs, IC memos, valuation reports, and funds-flow scaffolds, attach the latest sourceModelExecutionIds or let generate_output_doc return a freshness gate.',
    },
    relevantMechanics: mechanics,
    relevantMechanicsSummary: summarizeDefinitiveApplicableMechanics(mechanics),
    next_suggested_calls: buildEntryNextSuggestedCalls({
      journey,
      stageId: stage.stageId,
      payloadHint: normalizedPayloadHint,
      enterpriseValueCents,
      dealType,
      knownArtifacts,
    }),
    takeBackArtifacts: ['AgentEntryAssessment', 'DealState', 'MissingInputContract', 'DealPlan', 'ModelOutput', 'DocumentDraft', 'MCPCallHint[]'],
    the_line_invariant:
      'This assessment routes software work only. It does not advise, negotiate, represent, guarantee, move money, or make legal, tax, fairness, solvency, feasibility, or closing determinations.',
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
      {
        toolName: 'run_model_iteration',
        priority: 'P1',
        reason: 'Run or rerun a deterministic model version. Modeling is iterative; each version keeps input, output hash, and parent lineage.',
        inputHint: {
          dealId: '<deal id, if persisted>',
          modelId: '<modelId from compose_model_stack or lookup_model_slot>',
          input: {
            enterpriseValueCents: nullableNonNegativeNumber(toolInput.enterpriseValueCents) || '<known EV in cents, if available>',
          },
        },
      },
      {
        toolName: 'generate_output_doc',
        priority: 'P2',
        reason: 'Generate a source-aware Studio document after the current model version and source gaps are understood.',
        inputHint: {
          dealId: '<deal id>',
          documentType: '<term_sheet|loi|diligence_request|funds_flow|data_room_index|negotiation_brief|pmi_plan>',
          sourceModelExecutionIds: ['<latest model execution id>'],
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

function inferJourneyFromEntry(
  objective: string,
  payload: Record<string, any>,
  knownArtifacts: string[],
): DefinitiveJourney | null {
  const haystack = [
    objective,
    payload.intent,
    payload.role,
    payload.dealType,
    payload.dealStructure,
    payload.structure,
    ...knownArtifacts,
  ].map(value => String(value || '').toLowerCase()).join(' ');
  if (/\b(pmi|post[- ]?close|integration|day 0|day zero)\b/.test(haystack)) return 'pmi';
  if (/\b(raise|capital raise|investor|lender|debt|equity raise|recap)\b/.test(haystack)) return 'raise';
  if (/\b(sell|seller|exit|owner|cim|teaser)\b/.test(haystack)) return 'sell';
  if (/\b(buy|buyer|acquire|acquisition|target|ioi|loi|diligence)\b/.test(haystack)) return 'buy';
  return null;
}

function inferEntryStage(
  objective: string,
  payload: Record<string, any>,
  knownArtifacts: string[],
) {
  const artifacts = knownArtifacts.map(item => item.toLowerCase());
  const haystack = [
    objective,
    payload.currentStage,
    payload.stage,
    payload.status,
    payload.dealType,
    payload.dealStructure,
    payload.structure,
    ...artifacts,
  ].map(value => String(value || '').toLowerCase()).join(' ');

  if (/\b(pmi|post[- ]?close|integration|closed|day 0|day zero|funds flow|closing checklist)\b/.test(haystack)) {
    return {
      stageId: 'close_pmi',
      label: 'Close and PMI',
      confidence: artifacts.some(item => item.includes('closing') || item.includes('pmi')) ? 'high' : 'medium',
      basis: ['close_or_pmi_signal'],
    };
  }
  if (/\b(negotiat|counter|redline|price gap|concession|best vehicle|scenario)\b/.test(haystack)) {
    return {
      stageId: 'model_negotiation',
      label: 'Model and negotiation prep',
      confidence: 'medium',
      basis: ['negotiation_or_scenario_signal'],
    };
  }
  if (/\b(confirmatory|post[- ]?loi|data room|dataroom|qoe|quality of earnings|diligence|source gap|files)\b/.test(haystack)) {
    return {
      stageId: artifacts.some(item => item.includes('loi')) ? 'confirmatory_diligence' : 'deeper_diligence',
      label: artifacts.some(item => item.includes('loi')) ? 'Confirmatory diligence' : 'Deeper diligence',
      confidence: 'medium',
      basis: ['diligence_or_source_material_signal'],
    };
  }
  if (/\b(loi|letter of intent|term sheet|termsheet)\b/.test(haystack)) {
    return {
      stageId: 'loi',
      label: 'LOI / term architecture',
      confidence: 'high',
      basis: ['loi_or_term_sheet_signal'],
    };
  }
  if (/\b(ioi|indication|teaser|valuation|ev|enterprise value|first pass|model)\b/.test(haystack)) {
    return {
      stageId: 'ioi',
      label: 'IOI / first-pass model',
      confidence: 'medium',
      basis: ['early_value_or_indication_signal'],
    };
  }
  return {
    stageId: 'intake',
    label: 'Intake and classification',
    confidence: 'low',
    basis: ['default_partial_entry'],
  };
}

function buildEntryMissingInputs({
  journey,
  stageId,
  enterpriseValueCents,
  ebitdaCents,
  revenueCents,
  payload,
}: {
  journey: DefinitiveJourney | null;
  stageId: string;
  enterpriseValueCents: number;
  ebitdaCents: number;
  revenueCents: number;
  payload: Record<string, any>;
}) {
  const missing: Array<{ field: string; why: string; blocksEntry: boolean }> = [];
  const add = (field: string, why: string, blocksEntry = false) => missing.push({ field, why, blocksEntry });
  if (!journey) add('journey', 'Needed to choose buy, sell, raise, or PMI runbook. If absent, DEFINITIVE can still start with intake.');
  if (!nullableString(payload.targetName) && !nullableString(payload.businessName)) add('targetName', 'Needed for human-readable DealState and artifacts.');
  if (!nullableString(payload.industry)) add('industry', 'Improves model routing, market lanes, and diligence asks.');
  if (!nullableString(payload.jurisdiction)) add('jurisdiction', 'Needed for tax/legal/regulatory gates and THE LINE handoffs.');
  if (stageId !== 'intake' && enterpriseValueCents <= 0) add('enterpriseValueCents', 'EV is the fastest anchor for first-pass model routing and document scaffolds.');
  if (['ioi', 'loi', 'model_negotiation'].includes(stageId) && ebitdaCents <= 0 && revenueCents <= 0) {
    add('ebitdaCents or revenueCents', 'At least one operating scale input is needed for a useful first model pass.');
  }
  if (['deeper_diligence', 'confirmatory_diligence', 'close_pmi'].includes(stageId) && !Array.isArray(payload.documents) && !Array.isArray(payload.files)) {
    add('sourceIndex or documents', 'Diligence, close, and PMI loops should be tied to files or source references.');
  }
  if (stageId === 'model_negotiation' && !nullableString(payload.negotiationIssue)) {
    add('negotiationIssue', 'Needed to frame model scenarios without negotiating or recommending.');
  }
  return missing;
}

function buildEntryNextSuggestedCalls({
  journey,
  stageId,
  payloadHint,
  enterpriseValueCents,
  dealType,
  knownArtifacts,
}: {
  journey: DefinitiveJourney | null;
  stageId: string;
  payloadHint: Record<string, any>;
  enterpriseValueCents: number;
  dealType: string | null;
  knownArtifacts: string[];
}) {
  const calls: Array<Record<string, any>> = [
    {
      toolName: 'ingest_deal_payload',
      priority: 'P0',
      reason: 'Create or refresh the content-addressed DealState from whatever facts are known now.',
      inputHint: { payload: payloadHint },
    },
    {
      toolName: 'compose_deal_plan',
      priority: 'P1',
      reason: 'Turn the current DealState into the iterative IOI -> LOI -> diligence -> model -> negotiation -> close -> PMI plan.',
      inputHint: { dealState: '<DealState from ingest_deal_payload>' },
    },
    {
      toolName: 'compose_model_stack',
      priority: 'P1',
      reason: 'Map the deal to applicable M101-M223 mechanics before running or rerunning models.',
      inputHint: { journey: journey || undefined, dealType: dealType || undefined, signals: '<optional G28/G29/G30 signals>' },
    },
  ];
  if (enterpriseValueCents > 0) {
    calls.push({
      toolName: 'run_model_iteration',
      priority: 'P1',
      reason: 'Run the first model version from EV, then rerun as EBITDA, working capital, debt, or source facts change.',
      inputHint: {
        dealId: '<deal id if persisted>',
        modelId: '<runtime model id from compose_model_stack>',
        input: { enterpriseValueCents },
        reason: 'EV-only or first-pass entry',
      },
    });
  }
  if (stageId === 'ioi') {
    calls.push({ toolName: 'prepare_ioi_packet', priority: 'P2', reason: 'Create a non-binding indication packet plus source/model gaps.', inputHint: { dealState: '<DealState>' } });
  } else if (stageId === 'loi') {
    calls.push({ toolName: 'generate_output_doc', priority: 'P1', reason: 'Generate the LOI or term-sheet scaffold only after current model dependencies are fresh.', inputHint: { documentType: knownArtifacts.some(item => item.toLowerCase().includes('term')) ? 'term_sheet' : 'loi', sourceModelExecutionIds: ['<latest model execution id>'], requireFreshModels: true } });
  } else if (stageId === 'deeper_diligence' || stageId === 'confirmatory_diligence') {
    calls.push({ toolName: 'compose_data_room_index', priority: 'P1', reason: 'Index available files and expose source gaps for the next loop.', inputHint: { dealState: '<DealState>' } });
    calls.push({ toolName: 'prepare_diligence_request', priority: 'P2', reason: 'Turn missing sources into a diligence request scaffold.', inputHint: { dealState: '<DealState>' } });
  } else if (stageId === 'model_negotiation') {
    calls.push({ toolName: 'prepare_negotiation_brief', priority: 'P1', reason: 'Package scenario math and unresolved handoff flags without negotiating for the user.', inputHint: { dealState: '<DealState>', sourceModelExecutionIds: ['<latest model execution id>'] } });
  } else if (stageId === 'close_pmi') {
    calls.push({ toolName: 'compose_close_readiness', priority: 'P1', reason: 'Stage close readiness for human approval without authorizing close.', inputHint: { dealState: '<DealState>' } });
    calls.push({ toolName: 'compose_pmi_plan', priority: 'P2', reason: 'Carry surviving DealState into post-close value creation and risk tracking.', inputHint: { dealState: '<DealState>' } });
  }
  return calls;
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
