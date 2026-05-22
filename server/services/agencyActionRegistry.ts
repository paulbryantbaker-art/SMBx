import type { ActionClass } from './actionGate.js';

export type AgencyMode =
  | 'read'
  | 'author'
  | 'auditor'
  | 'modeler'
  | 'navigator'
  | 'coordinator'
  | 'handoff';

export type PermissionLevel =
  | 'A0_READ'
  | 'A1_NAVIGATE'
  | 'A2_INTERNAL_WRITE'
  | 'A3_GENERATE_WORK_PRODUCT'
  | 'A4_SHARED_WORKFLOW'
  | 'A5_EXTERNAL_DISCLOSURE'
  | 'A6_IMMUTABLE_OR_CLOSE';

export type RiskLevel =
  | 'safe'
  | 'internal_write'
  | 'shared_workspace'
  | 'external_disclosure'
  | 'regulated_or_irreversible';

export type ConfirmationPolicy = 'none' | 'required';

export type AgencySurface =
  | 'chat'
  | 'desktop'
  | 'mobile'
  | 'background_job'
  | 'analysis_canvas'
  | 'document'
  | 'files'
  | 'external_agent';

export type CitationRequirement = 'none' | 'optional' | 'required';
export type AuditRequirement = 'required';
export type DefinitiveLineStatus =
  | 'ok'
  | 'human_approval_required'
  | 'counsel_review_required'
  | 'enterprise_scope_required'
  | 'credit_budget_required'
  | 'LINE_VIOLATION';

export type DefinitiveLineRefusalBehavior =
  | 'allow'
  | 'stage_for_approval'
  | 'route_to_counsel'
  | 'require_enterprise_scope'
  | 'require_credit_budget'
  | 'refuse';

export type AgencyUsageEventType =
  | 'action_run'
  | 'model_run'
  | 'document_generation'
  | 'market_research'
  | 'data_room_ingest'
  | 'file_operation'
  | 'export'
  | 'external_agent_api_call';

export interface AgencyBillingPolicy {
  eventType: AgencyUsageEventType;
  creditCost: number;
  billable: boolean;
  unit: 'run' | 'document' | 'research_job' | 'file' | 'export' | 'api_call';
}

export type JsonSchemaLite = Record<string, unknown>;

export interface AgencyActionContract {
  toolName: string;
  actionId?: string;
  label: string;
  methodologyRefs: string[];
  mode: AgencyMode;
  permissionLevel: PermissionLevel;
  riskLevel: RiskLevel;
  confirmation: ConfirmationPolicy;
  writeScope: 'none' | 'conversation' | 'deal' | 'deliverable' | 'data_room' | 'review' | 'share' | 'sourcing' | 'support' | 'model' | 'corpus';
  actionClass?: ActionClass | 'dynamic_share';
  description: string;
  inputSchema?: JsonSchemaLite;
  outputSchema?: JsonSchemaLite;
  requiredScopes?: string[];
  billing?: AgencyBillingPolicy;
  citationRequirement?: CitationRequirement;
  auditRequirement?: AuditRequirement;
  allowedSurfaces?: AgencySurface[];
  externalAgentReady?: boolean;
}

export interface CanonicalAgencyActionContract extends AgencyActionContract {
  actionId: string;
  inputSchema: JsonSchemaLite;
  outputSchema: JsonSchemaLite;
  requiredScopes: string[];
  billing: AgencyBillingPolicy;
  citationRequirement: CitationRequirement;
  auditRequirement: AuditRequirement;
  allowedSurfaces: AgencySurface[];
  externalAgentReady: boolean;
}

export interface DefinitiveLineContract extends CanonicalAgencyActionContract {
  lineStatus: DefinitiveLineStatus;
  lineReason: string;
  refusalBehavior: DefinitiveLineRefusalBehavior;
  lineRisks: string[];
}

const CONTRACTS: Record<string, AgencyActionContract> = {
  create_deal: {
    toolName: 'create_deal',
    label: 'Create deal workspace',
    methodologyRefs: ['v17 §4 Functional Lifecycle', 'v17 §2.5 Context Injection'],
    mode: 'coordinator',
    permissionLevel: 'A2_INTERNAL_WRITE',
    riskLevel: 'internal_write',
    confirmation: 'none',
    writeScope: 'deal',
    description: 'Create an internal deal record so Yulia can organize the work.',
  },
  update_deal_field: {
    toolName: 'update_deal_field',
    label: 'Update deal fact',
    methodologyRefs: ['v17 §2.5 Context Injection', 'v17 §5 Math Engine'],
    mode: 'coordinator',
    permissionLevel: 'A2_INTERNAL_WRITE',
    riskLevel: 'internal_write',
    confirmation: 'none',
    writeScope: 'deal',
    description: 'Save user-provided or directly observed internal deal facts.',
  },
  classify_league: {
    toolName: 'classify_league',
    label: 'Classify league',
    methodologyRefs: ['v17 §3 League Governance'],
    mode: 'modeler',
    permissionLevel: 'A2_INTERNAL_WRITE',
    riskLevel: 'internal_write',
    confirmation: 'none',
    writeScope: 'deal',
    description: 'Classify deal size/complexity from available financials.',
  },
  get_deal_context: {
    toolName: 'get_deal_context',
    label: 'Read deal context',
    methodologyRefs: ['v17 §2.5 Context Injection'],
    mode: 'read',
    permissionLevel: 'A0_READ',
    riskLevel: 'safe',
    confirmation: 'none',
    writeScope: 'none',
    description: 'Read permitted deal context to avoid redundant questions.',
  },
  advance_gate: {
    toolName: 'advance_gate',
    label: 'Advance deal gate',
    methodologyRefs: ['v17 §4 Functional Lifecycle', 'v17 §3 League Governance'],
    mode: 'coordinator',
    permissionLevel: 'A4_SHARED_WORKFLOW',
    riskLevel: 'shared_workspace',
    confirmation: 'required',
    writeScope: 'deal',
    description: 'Move a deal to the next methodology gate after readiness is satisfied.',
  },
  generate_free_deliverable: {
    toolName: 'generate_free_deliverable',
    label: 'Generate starter deliverable',
    methodologyRefs: ['v17 §13 Premium Exports', 'v17 §15 Subscription Model'],
    mode: 'author',
    permissionLevel: 'A3_GENERATE_WORK_PRODUCT',
    riskLevel: 'internal_write',
    confirmation: 'none',
    writeScope: 'deliverable',
    description: 'Generate internal work product for the user to review.',
  },
  generate_deal_deliverable: {
    toolName: 'generate_deal_deliverable',
    label: 'Generate deal deliverable',
    methodologyRefs: ['v17 §4 Functional Lifecycle', 'v17 §13 Premium Exports'],
    mode: 'author',
    permissionLevel: 'A3_GENERATE_WORK_PRODUCT',
    riskLevel: 'internal_write',
    confirmation: 'none',
    writeScope: 'deliverable',
    description: 'Queue a real document or analysis deliverable from deal data.',
  },
  create_pitch_book: {
    toolName: 'create_pitch_book',
    label: 'Create Pitch Book Studio book',
    methodologyRefs: ['DEFINITIVE Studio', 'V19 source-grounded work product'],
    mode: 'author',
    permissionLevel: 'A3_GENERATE_WORK_PRODUCT',
    riskLevel: 'internal_write',
    confirmation: 'none',
    writeScope: 'deliverable',
    description: 'Create an internal Studio book with slide-level provenance and readiness state.',
  },
  revise_pitch_book: {
    toolName: 'revise_pitch_book',
    label: 'Revise Pitch Book Studio book',
    methodologyRefs: ['DEFINITIVE Studio', 'V19 source-grounded work product'],
    mode: 'author',
    permissionLevel: 'A3_GENERATE_WORK_PRODUCT',
    riskLevel: 'internal_write',
    confirmation: 'none',
    writeScope: 'deliverable',
    description: 'Create a new audited Studio version from user instructions.',
  },
  add_pitch_book_section: {
    toolName: 'add_pitch_book_section',
    label: 'Add Studio book section',
    methodologyRefs: ['DEFINITIVE Studio', 'V19 source-grounded work product'],
    mode: 'author',
    permissionLevel: 'A3_GENERATE_WORK_PRODUCT',
    riskLevel: 'internal_write',
    confirmation: 'none',
    writeScope: 'deliverable',
    description: 'Add a Studio slide/section and mark it for source review until grounded.',
  },
  ingest_deal_payload: {
    toolName: 'ingest_deal_payload',
    label: 'Ingest agent deal payload',
    methodologyRefs: ['DEFINITIVE DealPayload', 'DEFINITIVE DealState', 'DEFINITIVE no-rejection contract'],
    mode: 'coordinator',
    permissionLevel: 'A2_INTERNAL_WRITE',
    riskLevel: 'internal_write',
    confirmation: 'none',
    writeScope: 'deal',
    requiredScopes: ['deal-state:write', 'deal:classify'],
    billing: { eventType: 'external_agent_api_call', creditCost: 0, billable: false, unit: 'api_call' },
    citationRequirement: 'optional',
    description: 'Accept a partial or complete agent-provided DealPayload, classify it, and return a content-addressed DealState with missing-input and next-call guidance.',
  },
  update_deal_payload: {
    toolName: 'update_deal_payload',
    label: 'Update agent deal payload',
    methodologyRefs: ['DEFINITIVE DealPayload', 'DEFINITIVE DealState', 'DEFINITIVE recursive work loop'],
    mode: 'coordinator',
    permissionLevel: 'A2_INTERNAL_WRITE',
    riskLevel: 'internal_write',
    confirmation: 'none',
    writeScope: 'deal',
    requiredScopes: ['deal-state:write', 'deal:classify'],
    billing: { eventType: 'external_agent_api_call', creditCost: 0, billable: false, unit: 'api_call' },
    citationRequirement: 'optional',
    description: 'Merge new deal facts into DealState and recompute classification, completeness, missing inputs, and next suggested calls.',
  },
  check_completeness: {
    toolName: 'check_completeness',
    label: 'Check deal completeness',
    methodologyRefs: ['DEFINITIVE CompletenessSpec', 'DEFINITIVE definition of done'],
    mode: 'auditor',
    permissionLevel: 'A0_READ',
    riskLevel: 'safe',
    confirmation: 'none',
    writeScope: 'none',
    requiredScopes: ['deal-state:read', 'completeness:read'],
    billing: { eventType: 'external_agent_api_call', creditCost: 0, billable: false, unit: 'api_call' },
    citationRequirement: 'optional',
    description: 'Evaluate a DealState or DealPayload against the lifecycle definition of done and return blockers, missing inputs, and next gate guidance.',
  },
  get_definition_of_done: {
    toolName: 'get_definition_of_done',
    label: 'Read deal definition of done',
    methodologyRefs: ['DEFINITIVE CompletenessSpec', 'DEFINITIVE Deal OS lifecycle'],
    mode: 'read',
    permissionLevel: 'A0_READ',
    riskLevel: 'safe',
    confirmation: 'none',
    writeScope: 'none',
    requiredScopes: ['methodology:read', 'completeness:read'],
    billing: { eventType: 'external_agent_api_call', creditCost: 0, billable: false, unit: 'api_call' },
    citationRequirement: 'optional',
    description: 'Return the versioned definition of done for iterative deal work from intake through IOI, LOI, diligence, modeling, negotiation, close, and PMI.',
  },
  compose_deal_plan: {
    toolName: 'compose_deal_plan',
    label: 'Compose portable deal plan',
    methodologyRefs: ['DEFINITIVE DealPlan', 'DEFINITIVE Deal OS lifecycle', 'DEFINITIVE recursive work loop'],
    mode: 'navigator',
    permissionLevel: 'A0_READ',
    riskLevel: 'safe',
    confirmation: 'none',
    writeScope: 'none',
    requiredScopes: ['deal-state:read', 'deal-plan:read'],
    billing: { eventType: 'external_agent_api_call', creditCost: 0, billable: false, unit: 'api_call' },
    citationRequirement: 'optional',
    description: 'Create a portable lifecycle plan from current DealState so humans and agents understand the current stage, blockers, surfaces, and next actions.',
  },
  diff_deal_state: {
    toolName: 'diff_deal_state',
    label: 'Diff deal state',
    methodologyRefs: ['DEFINITIVE DealStateDiff', 'DEFINITIVE portable take-back artifacts'],
    mode: 'auditor',
    permissionLevel: 'A0_READ',
    riskLevel: 'safe',
    confirmation: 'none',
    writeScope: 'none',
    requiredScopes: ['deal-state:read', 'deal-state:diff'],
    billing: { eventType: 'external_agent_api_call', creditCost: 0, billable: false, unit: 'api_call' },
    citationRequirement: 'optional',
    description: 'Compare two DealState snapshots and return changed paths, completeness delta, resolved missing inputs, and overlay-gate changes.',
  },
  compose_deal_package: {
    toolName: 'compose_deal_package',
    label: 'Compose portable deal package',
    methodologyRefs: ['DEFINITIVE DealPackage', 'DEFINITIVE portable take-back artifacts', 'DEFINITIVE Deal OS lifecycle'],
    mode: 'navigator',
    permissionLevel: 'A0_READ',
    riskLevel: 'safe',
    confirmation: 'none',
    writeScope: 'none',
    requiredScopes: ['deal-state:read', 'deal-package:read'],
    billing: { eventType: 'external_agent_api_call', creditCost: 0, billable: false, unit: 'api_call' },
    citationRequirement: 'optional',
    description: 'Package current DealState, DealPlan, completeness, missing inputs, source index, and next-call hints for external agent take-back.',
  },
  resume_deal: {
    toolName: 'resume_deal',
    label: 'Resume deal loop',
    methodologyRefs: ['DEFINITIVE Deal OS lifecycle', 'DEFINITIVE DealState', 'DEFINITIVE DealPackage'],
    mode: 'navigator',
    permissionLevel: 'A0_READ',
    riskLevel: 'safe',
    confirmation: 'none',
    writeScope: 'none',
    requiredScopes: ['deal-state:read', 'deal-plan:read', 'deal-package:read'],
    billing: { eventType: 'external_agent_api_call', creditCost: 0, billable: false, unit: 'api_call' },
    citationRequirement: 'optional',
    description: 'Resume iterative deal work and return current stage, completeness, plan, package, missing inputs, and next calls.',
  },
  compose_data_room_index: {
    toolName: 'compose_data_room_index',
    label: 'Compose data room index',
    methodologyRefs: ['DEFINITIVE DataRoomIndex', 'DEFINITIVE Files surface', 'DEFINITIVE Deal OS lifecycle'],
    mode: 'navigator',
    permissionLevel: 'A0_READ',
    riskLevel: 'safe',
    confirmation: 'none',
    writeScope: 'none',
    requiredScopes: ['deal-state:read', 'data-room:read'],
    billing: { eventType: 'external_agent_api_call', creditCost: 0, billable: false, unit: 'api_call' },
    citationRequirement: 'optional',
    description: 'Group indexed files into diligence buckets, surface missing data-room categories, and return next calls for Files/Data Room work.',
  },
  disclose_subset: {
    toolName: 'disclose_subset',
    label: 'Compose disclosure subset',
    methodologyRefs: ['DEFINITIVE DisclosureSubset', 'DEFINITIVE selective disclosure', 'DEFINITIVE DealPackage'],
    mode: 'auditor',
    permissionLevel: 'A0_READ',
    riskLevel: 'safe',
    confirmation: 'none',
    writeScope: 'none',
    requiredScopes: ['deal-state:read', 'data-room:read', 'deal-package:compose'],
    billing: { eventType: 'external_agent_api_call', creditCost: 0, billable: false, unit: 'api_call' },
    citationRequirement: 'optional',
    description: 'Compose a scoped source subset and selective-disclosure proof for agent take-back. This does not send, share, or transmit externally; actual sharing remains an A5 approval action.',
  },
  compose_document_draft: {
    toolName: 'compose_document_draft',
    label: 'Compose Studio document draft',
    methodologyRefs: ['DEFINITIVE DocumentDraft', 'DEFINITIVE Studio surface', 'DEFINITIVE Deal OS lifecycle'],
    mode: 'author',
    permissionLevel: 'A3_GENERATE_WORK_PRODUCT',
    riskLevel: 'internal_write',
    confirmation: 'none',
    writeScope: 'none',
    requiredScopes: ['deal-state:read', 'studio:draft'],
    billing: { eventType: 'external_agent_api_call', creditCost: 0, billable: false, unit: 'api_call' },
    citationRequirement: 'required',
    description: 'Compose a source-aware Studio draft scaffold with section-level source requirements, model dependencies, and next calls. External export remains a separate approval action.',
  },
  refresh_pitch_book_from_models: {
    toolName: 'refresh_pitch_book_from_models',
    label: 'Refresh Studio book from models',
    methodologyRefs: ['DEFINITIVE Studio', 'V19 server-side model runtime'],
    mode: 'auditor',
    permissionLevel: 'A3_GENERATE_WORK_PRODUCT',
    riskLevel: 'internal_write',
    confirmation: 'none',
    writeScope: 'deliverable',
    description: 'Refresh a Studio book against linked deterministic model outputs and readiness states.',
  },
  export_pitch_book: {
    toolName: 'export_pitch_book',
    label: 'Export Pitch Book Studio book',
    methodologyRefs: ['DEFINITIVE Studio', 'V19 audit appendix'],
    mode: 'author',
    permissionLevel: 'A5_EXTERNAL_DISCLOSURE',
    riskLevel: 'external_disclosure',
    confirmation: 'required',
    writeScope: 'deliverable',
    description: 'Prepare a PPTX/PDF export after source grounding and explicit user approval.',
  },
  compose_model_stack: {
    toolName: 'compose_model_stack',
    label: 'Compose model stack',
    methodologyRefs: ['V19 model stack', 'DEFINITIVE model contract'],
    mode: 'modeler',
    permissionLevel: 'A3_GENERATE_WORK_PRODUCT',
    riskLevel: 'internal_write',
    confirmation: 'none',
    writeScope: 'model',
    description: 'Compose the required model stack plus applicable DEFINITIVE M101-M223 mechanics, readiness, tool surfaces, and THE LINE boundaries by journey, league, deal type, and gate.',
  },
  execute_model: {
    toolName: 'execute_model',
    label: 'Execute deterministic model',
    methodologyRefs: ['V19 server-side model runtime', 'DEFINITIVE deterministic compute'],
    mode: 'modeler',
    permissionLevel: 'A3_GENERATE_WORK_PRODUCT',
    riskLevel: 'internal_write',
    confirmation: 'none',
    writeScope: 'model',
    description: 'Run a version-pinned deterministic model and persist input/output hashes and audit metadata.',
  },
  lookup_citation: {
    toolName: 'lookup_citation',
    label: 'Lookup citation',
    methodologyRefs: ['DEFINITIVE Authority Register', 'V19 citation validation'],
    mode: 'auditor',
    permissionLevel: 'A0_READ',
    riskLevel: 'safe',
    confirmation: 'none',
    writeScope: 'none',
    description: 'Resolve claims to registered authority/source entries and freshness state.',
  },
  fetch_market_data: {
    toolName: 'fetch_market_data',
    label: 'Fetch market data',
    methodologyRefs: ['DEFINITIVE market snapshot', 'V19 market-data cache'],
    mode: 'auditor',
    permissionLevel: 'A0_READ',
    riskLevel: 'safe',
    confirmation: 'none',
    writeScope: 'none',
    description: 'Return timestamped market/regulatory data with source and freshness state.',
  },
  read_v19_readiness: {
    toolName: 'read_v19_readiness',
    label: 'Read readiness state',
    methodologyRefs: ['V19 readiness', 'DEFINITIVE audit gates'],
    mode: 'auditor',
    permissionLevel: 'A0_READ',
    riskLevel: 'safe',
    confirmation: 'none',
    writeScope: 'none',
    description: 'Read model/source/citation/export readiness for a deal or Studio book.',
  },
  read_v19_entitlements: {
    toolName: 'read_v19_entitlements',
    label: 'Read entitlement state',
    methodologyRefs: ['V19 credits and tollgates', 'DEFINITIVE agent billing'],
    mode: 'read',
    permissionLevel: 'A0_READ',
    riskLevel: 'safe',
    confirmation: 'none',
    writeScope: 'none',
    description: 'Read plan allowances, credits, and tollgate states for the current user.',
  },
  validate_conformance: {
    toolName: 'validate_conformance',
    label: 'Read DEFINITIVE conformance status',
    methodologyRefs: ['DEFINITIVE conformance harness', 'DEFINITIVE public spec'],
    mode: 'auditor',
    permissionLevel: 'A0_READ',
    riskLevel: 'safe',
    confirmation: 'none',
    writeScope: 'none',
    requiredScopes: ['conformance:read'],
    billing: { eventType: 'external_agent_api_call', creditCost: 0, billable: false, unit: 'api_call' },
    citationRequirement: 'optional',
    description: 'Return the current DB-free conformance suite status, case count, categories, and validation command.',
  },
  update_firm_memory: {
    toolName: 'update_firm_memory',
    label: 'Update firm memory',
    methodologyRefs: ['DEFINITIVE firm memory', 'V19 Today operating surface'],
    mode: 'coordinator',
    permissionLevel: 'A4_SHARED_WORKFLOW',
    riskLevel: 'shared_workspace',
    confirmation: 'required',
    writeScope: 'deal',
    description: 'Save reusable firm assumptions, patterns, or house preferences under governed scope.',
  },
  defer_to_counsel: {
    toolName: 'defer_to_counsel',
    label: 'Defer to counsel',
    methodologyRefs: ['THE LINE', 'V19 legal/tax counsel halt rules'],
    mode: 'handoff',
    permissionLevel: 'A4_SHARED_WORKFLOW',
    riskLevel: 'shared_workspace',
    confirmation: 'none',
    writeScope: 'review',
    description: 'Create a structured legal/tax/professional-review routing packet.',
  },
  update_tax_position: {
    toolName: 'update_tax_position',
    label: 'Update tax position registry',
    methodologyRefs: ['V19 tax position registry', 'THE LINE'],
    mode: 'auditor',
    permissionLevel: 'A4_SHARED_WORKFLOW',
    riskLevel: 'shared_workspace',
    confirmation: 'required',
    writeScope: 'deal',
    description: 'Track tax issue-spotting state and review status without giving tax conclusions.',
  },
  write_audit_trail: {
    toolName: 'write_audit_trail',
    label: 'Write audit trail',
    methodologyRefs: ['DEFINITIVE audit trail', 'V19 audit records'],
    mode: 'auditor',
    permissionLevel: 'A2_INTERNAL_WRITE',
    riskLevel: 'internal_write',
    confirmation: 'none',
    writeScope: 'deal',
    description: 'Write a structured audit event with methodology/spec pins and supporting metadata.',
  },
  record_corpus_observation: {
    toolName: 'record_corpus_observation',
    label: 'Record anonymized corpus observation',
    methodologyRefs: ['DEFINITIVE corpus', 'DEFINITIVE data rights'],
    mode: 'auditor',
    permissionLevel: 'A2_INTERNAL_WRITE',
    riskLevel: 'internal_write',
    confirmation: 'none',
    writeScope: 'corpus',
    requiredScopes: ['corpus:write', 'data-rights:read'],
    billing: { eventType: 'external_agent_api_call', creditCost: 0, billable: false, unit: 'api_call' },
    citationRequirement: 'optional',
    description: 'Store a structured, anonymized deal-term observation only when a data-rights grant exists; raw documents and party identifiers are stripped.',
  },
  run_analysis: {
    toolName: 'run_analysis',
    label: 'Run analysis',
    methodologyRefs: ['v17 §5 Math Engine', 'v17 §11 Interactive Canvas', 'v17 §13 Premium Exports'],
    mode: 'modeler',
    permissionLevel: 'A3_GENERATE_WORK_PRODUCT',
    riskLevel: 'internal_write',
    confirmation: 'none',
    writeScope: 'deliverable',
    description: 'Resolve an analysis intent to a real deliverable, queue generation, and open the live canvas tab.',
  },
  file_deliverable_to_data_room: {
    toolName: 'file_deliverable_to_data_room',
    label: 'File deliverable to data room',
    methodologyRefs: ['v17 §6 Data Sovereignty', 'v17 §4.5 Collaboration'],
    mode: 'coordinator',
    permissionLevel: 'A4_SHARED_WORKFLOW',
    riskLevel: 'shared_workspace',
    confirmation: 'required',
    writeScope: 'data_room',
    description: 'Move a private deliverable into the shared diligence drive.',
  },
  recommend_providers: {
    toolName: 'recommend_providers',
    label: 'Recommend deal professionals',
    methodologyRefs: ['v17 §4 Functional Lifecycle', 'v17 §10 Legal Framework'],
    mode: 'coordinator',
    permissionLevel: 'A0_READ',
    riskLevel: 'safe',
    confirmation: 'none',
    writeScope: 'none',
    description: 'Find relevant professionals without engaging or sharing documents.',
  },
  analyze_buyer_demand: {
    toolName: 'analyze_buyer_demand',
    label: 'Analyze buyer demand',
    methodologyRefs: ['v17 §2 Market Intelligence', 'v17 §12 Sourcing Engine'],
    mode: 'modeler',
    permissionLevel: 'A3_GENERATE_WORK_PRODUCT',
    riskLevel: 'internal_write',
    confirmation: 'none',
    writeScope: 'deliverable',
    description: 'Analyze anonymized buyer demand for a seller deal.',
  },
  match_franchises: {
    toolName: 'match_franchises',
    label: 'Match franchises',
    methodologyRefs: ['v17 §12 Sourcing Engine'],
    mode: 'modeler',
    permissionLevel: 'A0_READ',
    riskLevel: 'safe',
    confirmation: 'none',
    writeScope: 'none',
    description: 'Surface franchise alternatives for a buyer.',
  },
  generate_optimization_plan: {
    toolName: 'generate_optimization_plan',
    label: 'Generate optimization plan',
    methodologyRefs: ['v17 §4 Functional Lifecycle', 'v17 §5 Math Engine'],
    mode: 'author',
    permissionLevel: 'A3_GENERATE_WORK_PRODUCT',
    riskLevel: 'internal_write',
    confirmation: 'none',
    writeScope: 'deliverable',
    description: 'Prepare internal value-improvement work product.',
  },
  list_user_deals: {
    toolName: 'list_user_deals',
    label: 'List user deals',
    methodologyRefs: ['v17 §2.5 Context Injection'],
    mode: 'read',
    permissionLevel: 'A0_READ',
    riskLevel: 'safe',
    confirmation: 'none',
    writeScope: 'none',
    description: 'Read the user portfolio for navigation and comparison.',
  },
  switch_deal_context: {
    toolName: 'switch_deal_context',
    label: 'Switch deal context',
    methodologyRefs: ['v17 §11 Interactive Canvas'],
    mode: 'navigator',
    permissionLevel: 'A1_NAVIGATE',
    riskLevel: 'safe',
    confirmation: 'none',
    writeScope: 'conversation',
    description: 'Navigate the conversation to an existing deal.',
  },
  scan_market: {
    toolName: 'scan_market',
    label: 'Scan market',
    methodologyRefs: ['v17 §2 Market Intelligence'],
    mode: 'modeler',
    permissionLevel: 'A3_GENERATE_WORK_PRODUCT',
    riskLevel: 'internal_write',
    confirmation: 'none',
    writeScope: 'deliverable',
    description: 'Run internal market intelligence analysis.',
  },
  enrich_target: {
    toolName: 'enrich_target',
    label: 'Enrich target',
    methodologyRefs: ['v17 §12 Sourcing Engine'],
    mode: 'auditor',
    permissionLevel: 'A3_GENERATE_WORK_PRODUCT',
    riskLevel: 'internal_write',
    confirmation: 'none',
    writeScope: 'sourcing',
    description: 'Enrich a sourced target for internal evaluation.',
  },
  get_sourcing_portfolio: {
    toolName: 'get_sourcing_portfolio',
    label: 'Read sourcing portfolio',
    methodologyRefs: ['v17 §12 Sourcing Engine'],
    mode: 'read',
    permissionLevel: 'A0_READ',
    riskLevel: 'safe',
    confirmation: 'none',
    writeScope: 'none',
    description: 'Read sourcing run and candidate state.',
  },
  create_model_tab: {
    toolName: 'create_model_tab',
    label: 'Create model tab',
    methodologyRefs: ['v17 §11 Interactive Canvas', 'v17 §5 Math Engine'],
    mode: 'modeler',
    permissionLevel: 'A1_NAVIGATE',
    riskLevel: 'safe',
    confirmation: 'none',
    writeScope: 'model',
    description: 'Open deterministic model surface for analysis.',
  },
  update_model: {
    toolName: 'update_model',
    label: 'Update model assumptions',
    methodologyRefs: ['v17 §11 Interactive Canvas', 'v17 §5 Math Engine'],
    mode: 'modeler',
    permissionLevel: 'A2_INTERNAL_WRITE',
    riskLevel: 'internal_write',
    confirmation: 'none',
    writeScope: 'model',
    description: 'Update assumptions in an internal model tab.',
  },
  read_tab_state: {
    toolName: 'read_tab_state',
    label: 'Read model tab',
    methodologyRefs: ['v17 §11 Interactive Canvas'],
    mode: 'read',
    permissionLevel: 'A0_READ',
    riskLevel: 'safe',
    confirmation: 'none',
    writeScope: 'none',
    description: 'Read current model surface state.',
  },
  optimize_scenario: {
    toolName: 'optimize_scenario',
    label: 'Optimize scenario',
    methodologyRefs: ['v17 §5 Math Engine', 'v17 §11 Interactive Canvas', 'v18 Tax Framework', 'v18 Legal Framework'],
    mode: 'modeler',
    permissionLevel: 'A0_READ',
    riskLevel: 'safe',
    confirmation: 'none',
    writeScope: 'none',
    description: 'Read a saved analysis/model scenario and have Yulia recommend the best risk-adjusted path plus negotiation, diligence, tax/legal, and work-product steps.',
  },
  create_support_issue: {
    toolName: 'create_support_issue',
    label: 'Create support issue',
    methodologyRefs: ['Product support runtime'],
    mode: 'coordinator',
    permissionLevel: 'A2_INTERNAL_WRITE',
    riskLevel: 'internal_write',
    confirmation: 'none',
    writeScope: 'support',
    description: 'Capture a bug, feature request, or user feedback internally.',
  },
  query_admin_data: {
    toolName: 'query_admin_data',
    label: 'Query admin data',
    methodologyRefs: ['Admin runtime'],
    mode: 'read',
    permissionLevel: 'A0_READ',
    riskLevel: 'safe',
    confirmation: 'none',
    writeScope: 'none',
    description: 'Read admin data through tool-level authorization.',
  },
  request_review: {
    toolName: 'request_review',
    label: 'Request document review',
    methodologyRefs: ['v17 §4.5 Collaboration', 'v18 Legal Framework'],
    mode: 'handoff',
    permissionLevel: 'A4_SHARED_WORKFLOW',
    riskLevel: 'shared_workspace',
    confirmation: 'required',
    writeScope: 'review',
    description: 'Notify a participant and assign review responsibility.',
  },
  share_document: {
    toolName: 'share_document',
    label: 'Share document',
    methodologyRefs: ['v17 §6 Data Sovereignty', 'v17 §4.5 Collaboration'],
    mode: 'handoff',
    permissionLevel: 'A5_EXTERNAL_DISCLOSURE',
    riskLevel: 'external_disclosure',
    confirmation: 'required',
    writeScope: 'share',
    actionClass: 'dynamic_share',
    description: 'Send a platform link to another person. Must be confirmed and may require gate approval.',
  },
  start_new_chapter: {
    toolName: 'start_new_chapter',
    label: 'Start conversation chapter',
    methodologyRefs: ['v17 §2.5 Context Injection'],
    mode: 'coordinator',
    permissionLevel: 'A2_INTERNAL_WRITE',
    riskLevel: 'internal_write',
    confirmation: 'none',
    writeScope: 'conversation',
    description: 'Summarize and archive the current conversation chapter.',
  },
  promote_sourcing_target_to_deal: {
    toolName: 'promote_sourcing_target_to_deal',
    label: 'Promote target to deal',
    methodologyRefs: ['v17 §12 Sourcing Engine', 'v17 §4 Functional Lifecycle'],
    mode: 'coordinator',
    permissionLevel: 'A2_INTERNAL_WRITE',
    riskLevel: 'internal_write',
    confirmation: 'required',
    writeScope: 'deal',
    description: 'Turn a sourced target into an active deal workspace.',
  },
  record_dd_complete: {
    toolName: 'record_dd_complete',
    label: 'Record diligence complete',
    methodologyRefs: ['v17 §4 Functional Lifecycle'],
    mode: 'coordinator',
    permissionLevel: 'A4_SHARED_WORKFLOW',
    riskLevel: 'shared_workspace',
    confirmation: 'required',
    writeScope: 'deal',
    description: 'Record a material workflow milestone.',
  },
  record_loi_executed: {
    toolName: 'record_loi_executed',
    label: 'Record LOI executed',
    methodologyRefs: ['v17 §4 Phase 5 Negotiation', 'v18 Legal Framework'],
    mode: 'handoff',
    permissionLevel: 'A6_IMMUTABLE_OR_CLOSE',
    riskLevel: 'regulated_or_irreversible',
    confirmation: 'required',
    writeScope: 'deal',
    actionClass: 'execute_legal_doc',
    description: 'Record that a legal negotiation document has been countersigned.',
  },
  record_financing_secured: {
    toolName: 'record_financing_secured',
    label: 'Record financing secured',
    methodologyRefs: ['v17 §4 Phase 6 Closing', 'v17 §5 Math Engine'],
    mode: 'coordinator',
    permissionLevel: 'A4_SHARED_WORKFLOW',
    riskLevel: 'shared_workspace',
    confirmation: 'required',
    writeScope: 'deal',
    description: 'Record lender approval or financing milestone.',
  },
  close_deal: {
    toolName: 'close_deal',
    label: 'Close deal',
    methodologyRefs: ['v17 §4 Phase 6 Closing'],
    mode: 'handoff',
    permissionLevel: 'A6_IMMUTABLE_OR_CLOSE',
    riskLevel: 'regulated_or_irreversible',
    confirmation: 'required',
    writeScope: 'deal',
    description: 'Mark a transaction closed and optionally spawn PMI workflow.',
  },
  start_sourcing_run: {
    toolName: 'start_sourcing_run',
    label: 'Start sourcing run',
    methodologyRefs: ['v17 §12 Sourcing Engine'],
    mode: 'modeler',
    permissionLevel: 'A3_GENERATE_WORK_PRODUCT',
    riskLevel: 'internal_write',
    confirmation: 'none',
    writeScope: 'sourcing',
    description: 'Run sourcing pipeline against a thesis.',
  },
  compare_deals: {
    toolName: 'compare_deals',
    label: 'Compare deals',
    methodologyRefs: ['v17 §5 Math Engine', 'v17 §11 Interactive Canvas'],
    mode: 'modeler',
    permissionLevel: 'A3_GENERATE_WORK_PRODUCT',
    riskLevel: 'internal_write',
    confirmation: 'none',
    writeScope: 'deliverable',
    description: 'Compare deals for internal user decision support.',
  },
  pair_merger_deals: {
    toolName: 'pair_merger_deals',
    label: 'Pair merger deals',
    methodologyRefs: ['v17 §4 Functional Lifecycle', 'v18 Legal Framework'],
    mode: 'coordinator',
    permissionLevel: 'A4_SHARED_WORKFLOW',
    riskLevel: 'shared_workspace',
    confirmation: 'required',
    writeScope: 'deal',
    description: 'Link two deals into a merger pairing workflow.',
  },
};

const LINE_OVERRIDES: Record<string, Partial<Pick<DefinitiveLineContract, 'lineStatus' | 'lineReason' | 'refusalBehavior' | 'lineRisks'>>> = {
  query_admin_data: {
    lineStatus: 'enterprise_scope_required',
    refusalBehavior: 'require_enterprise_scope',
    lineReason: 'Administrative data is not a general agent surface and requires privileged enterprise/operator scope.',
    lineRisks: ['admin_data', 'operator_only'],
  },
  update_firm_memory: {
    lineStatus: 'enterprise_scope_required',
    refusalBehavior: 'require_enterprise_scope',
    lineReason: 'Firm memory changes affect reusable institutional context and require governed workspace scope.',
    lineRisks: ['firm_memory', 'persistent_context'],
  },
  defer_to_counsel: {
    lineStatus: 'counsel_review_required',
    refusalBehavior: 'route_to_counsel',
    lineReason: 'This tool exists to route legal, tax, regulated, or boundary-sensitive questions to counsel review.',
    lineRisks: ['legal_tax_boundary', 'counsel_handoff'],
  },
  update_tax_position: {
    lineStatus: 'counsel_review_required',
    refusalBehavior: 'route_to_counsel',
    lineReason: 'Tax-position tracking may organize facts, but tax conclusions require qualified counsel/CPA review.',
    lineRisks: ['tax_position', 'professional_review'],
  },
  optimize_scenario: {
    lineStatus: 'counsel_review_required',
    refusalBehavior: 'route_to_counsel',
    lineReason: 'Scenario optimization can rank model outputs for decision support, but tax/legal/negotiation conclusions must remain options and go to counsel when regulated.',
    lineRisks: ['transaction_recommendation_boundary', 'tax_legal_boundary'],
  },
  record_loi_executed: {
    lineStatus: 'counsel_review_required',
    refusalBehavior: 'route_to_counsel',
    lineReason: 'Recording a signed LOI is allowed only as workflow state after human confirmation; legal effect belongs with counsel.',
    lineRisks: ['legal_document', 'irreversible_record'],
  },
  close_deal: {
    lineStatus: 'human_approval_required',
    refusalBehavior: 'stage_for_approval',
    lineReason: 'Closing is an irreversible workflow state and must be explicitly confirmed by the user.',
    lineRisks: ['irreversible_record', 'closing_state'],
  },
};

export const TOOL_NAMES_REQUIRING_CONFIRMATION = new Set(
  Object.values(CONTRACTS)
    .filter(contract => contract.confirmation === 'required')
    .map(contract => contract.toolName),
);

const BASE_INPUT_SCHEMA: JsonSchemaLite = {
  type: 'object',
  additionalProperties: true,
  description: 'Tool-specific payload. Future public agent surfaces must validate the concrete schema before execution.',
};

const BASE_OUTPUT_SCHEMA: JsonSchemaLite = {
  type: 'object',
  additionalProperties: true,
  properties: {
    success: { type: 'boolean' },
    governed: { type: 'boolean' },
    message: { type: 'string' },
  },
};

function defaultScopes(contract: AgencyActionContract): string[] {
  const scopes = new Set<string>(['workspace:read']);
  if (contract.writeScope !== 'none') scopes.add(`${contract.writeScope}:write`);
  if (contract.permissionLevel === 'A3_GENERATE_WORK_PRODUCT') scopes.add('work_product:generate');
  if (contract.permissionLevel === 'A4_SHARED_WORKFLOW') scopes.add('workflow:share');
  if (contract.permissionLevel === 'A5_EXTERNAL_DISCLOSURE') scopes.add('external:share');
  if (contract.permissionLevel === 'A6_IMMUTABLE_OR_CLOSE') scopes.add('immutable:write');
  return Array.from(scopes);
}

function defaultBilling(contract: AgencyActionContract): AgencyBillingPolicy {
  if (contract.permissionLevel === 'A0_READ' || contract.permissionLevel === 'A1_NAVIGATE') {
    return { eventType: 'action_run', creditCost: 0, billable: false, unit: 'run' };
  }

  if (contract.writeScope === 'share' || contract.writeScope === 'review' || contract.writeScope === 'data_room') {
    return { eventType: 'file_operation', creditCost: 1, billable: true, unit: 'file' };
  }

  if (contract.writeScope === 'sourcing' || contract.toolName === 'scan_market' || contract.toolName === 'analyze_buyer_demand') {
    return { eventType: 'market_research', creditCost: 2, billable: true, unit: 'research_job' };
  }

  if (contract.mode === 'author') {
    return { eventType: 'document_generation', creditCost: 2, billable: true, unit: 'document' };
  }

  if (contract.mode === 'modeler' || contract.writeScope === 'model') {
    return { eventType: 'model_run', creditCost: 1, billable: true, unit: 'run' };
  }

  return { eventType: 'action_run', creditCost: 1, billable: true, unit: 'run' };
}

function defaultCitationRequirement(contract: AgencyActionContract): CitationRequirement {
  if (contract.mode === 'modeler' || contract.mode === 'auditor' || contract.mode === 'author') return 'required';
  if (contract.permissionLevel === 'A5_EXTERNAL_DISCLOSURE' || contract.permissionLevel === 'A6_IMMUTABLE_OR_CLOSE') return 'required';
  if (contract.mode === 'read' || contract.mode === 'navigator') return 'optional';
  return 'optional';
}

function defaultAllowedSurfaces(contract: AgencyActionContract): AgencySurface[] {
  const surfaces = new Set<AgencySurface>(['chat', 'desktop', 'mobile']);
  if (contract.mode === 'modeler' || contract.writeScope === 'model') surfaces.add('analysis_canvas');
  if (contract.writeScope === 'deliverable') surfaces.add('document');
  if (contract.writeScope === 'data_room' || contract.writeScope === 'share' || contract.writeScope === 'review') surfaces.add('files');
  if (contract.writeScope === 'sourcing' || contract.toolName === 'scan_market') surfaces.add('background_job');
  surfaces.add('external_agent');
  return Array.from(surfaces);
}

export function canonicalizeAgencyActionContract(contract: AgencyActionContract): CanonicalAgencyActionContract {
  return {
    ...contract,
    actionId: contract.actionId ?? contract.toolName,
    inputSchema: contract.inputSchema ?? BASE_INPUT_SCHEMA,
    outputSchema: contract.outputSchema ?? BASE_OUTPUT_SCHEMA,
    requiredScopes: contract.requiredScopes ?? defaultScopes(contract),
    billing: contract.billing ?? defaultBilling(contract),
    citationRequirement: contract.citationRequirement ?? defaultCitationRequirement(contract),
    auditRequirement: contract.auditRequirement ?? 'required',
    allowedSurfaces: contract.allowedSurfaces ?? defaultAllowedSurfaces(contract),
    externalAgentReady: contract.externalAgentReady ?? true,
  };
}

function defaultLineStatus(contract: CanonicalAgencyActionContract): DefinitiveLineStatus {
  if (contract.permissionLevel === 'A6_IMMUTABLE_OR_CLOSE') return 'human_approval_required';
  if (contract.permissionLevel === 'A5_EXTERNAL_DISCLOSURE') return 'human_approval_required';
  if (contract.confirmation === 'required') return 'human_approval_required';
  return 'ok';
}

function defaultRefusalBehavior(status: DefinitiveLineStatus): DefinitiveLineRefusalBehavior {
  switch (status) {
    case 'human_approval_required':
      return 'stage_for_approval';
    case 'counsel_review_required':
      return 'route_to_counsel';
    case 'enterprise_scope_required':
      return 'require_enterprise_scope';
    case 'credit_budget_required':
      return 'require_credit_budget';
    case 'LINE_VIOLATION':
      return 'refuse';
    case 'ok':
    default:
      return 'allow';
  }
}

function defaultLineRisks(contract: CanonicalAgencyActionContract): string[] {
  const risks = new Set<string>();
  if (contract.riskLevel !== 'safe') risks.add(contract.riskLevel);
  if (contract.confirmation === 'required') risks.add('explicit_confirmation');
  if (contract.permissionLevel === 'A5_EXTERNAL_DISCLOSURE') risks.add('external_disclosure');
  if (contract.permissionLevel === 'A6_IMMUTABLE_OR_CLOSE') risks.add('irreversible_or_close');
  if (contract.citationRequirement === 'required') risks.add('citation_required');
  if (contract.billing.billable) risks.add('metered');
  return Array.from(risks);
}

function defaultLineReason(contract: CanonicalAgencyActionContract, status: DefinitiveLineStatus): string {
  if (status === 'ok') {
    return 'Inside the software boundary when supported by the action contract, citations where required, and normal audit logging.';
  }

  if (status === 'human_approval_required') {
    return 'Allowed only after explicit human approval because it changes shared, external, workflow, or irreversible state.';
  }

  if (status === 'counsel_review_required') {
    return 'Allowed as issue spotting, fact organization, or counsel packet preparation; legal/tax conclusions require qualified review.';
  }

  if (status === 'enterprise_scope_required') {
    return 'Requires governed enterprise scope because the action affects administrative, agent, connector, or firm-memory surfaces.';
  }

  if (status === 'credit_budget_required') {
    return 'Requires included credits or a contracted compute budget before execution.';
  }

  return 'Refused by construction because it would cross THE LINE.';
}

export function toDefinitiveLineContract(contract: AgencyActionContract): DefinitiveLineContract {
  const canonical = canonicalizeAgencyActionContract(contract);
  const override = LINE_OVERRIDES[canonical.toolName] || {};
  const lineStatus = override.lineStatus ?? defaultLineStatus(canonical);
  return {
    ...canonical,
    lineStatus,
    lineReason: override.lineReason ?? defaultLineReason(canonical, lineStatus),
    refusalBehavior: override.refusalBehavior ?? defaultRefusalBehavior(lineStatus),
    lineRisks: override.lineRisks ?? defaultLineRisks(canonical),
  };
}

export function getAgencyActionContract(toolName: string): CanonicalAgencyActionContract | undefined {
  const contract = CONTRACTS[toolName];
  return contract ? canonicalizeAgencyActionContract(contract) : undefined;
}

export function getDefinitiveLineContract(toolName: string): DefinitiveLineContract | undefined {
  const contract = CONTRACTS[toolName];
  return contract ? toDefinitiveLineContract(contract) : undefined;
}

export function listAgencyActionContracts(): CanonicalAgencyActionContract[] {
  return Object.values(CONTRACTS).map(canonicalizeAgencyActionContract);
}

export function listDefinitiveLineInventory(): DefinitiveLineContract[] {
  return Object.values(CONTRACTS).map(toDefinitiveLineContract);
}

export function inputHasExplicitConfirmation(input: Record<string, any>): boolean {
  return input.confirmed === true || input.userConfirmed === true || input.confirmationStatus === 'confirmed';
}

export function resolveGateActionClass(contract: AgencyActionContract, input: Record<string, any>): ActionClass | undefined {
  if (contract.actionClass === 'dynamic_share') {
    return input.shareType === 'cross_fence' ? 'share_cross_fence' : 'share_external';
  }
  return contract.actionClass;
}

export function formatAgencyActionContractsForPrompt(): string {
  const confirmFirst = listAgencyActionContracts()
    .filter(contract => contract.confirmation === 'required')
    .map(contract => `- ${contract.actionId}: ${contract.label} (${contract.permissionLevel}). First call stages the action; after the user explicitly confirms, call the same tool with confirmed=true.`)
    .join('\n');

  const publicReady = listAgencyActionContracts()
    .filter(contract => contract.externalAgentReady)
    .map(contract => `- ${contract.actionId}: scopes=${contract.requiredScopes.join(', ')}; citations=${contract.citationRequirement}; meter=${contract.billing.eventType}:${contract.billing.creditCost}; surfaces=${contract.allowedSurfaces.join(', ')}`)
    .join('\n');

  const lineSummary = listDefinitiveLineInventory()
    .map(contract => `- ${contract.actionId}: line=${contract.lineStatus}; behavior=${contract.refusalBehavior}; risks=${contract.lineRisks.join(', ') || 'none'}`)
    .join('\n');

  return `
## YULIA EXECUTION LAYER — V19 / V1 PUBLIC-GO-LIVE RUNTIME
Every tool call is governed by a canonical action contract. The same contract shape serves chat, UI buttons, background jobs, analysis canvases, document/file actions, billing, audit, and future public agent surfaces.

Runtime rule:
- Safe read, navigation, modeling, and internal drafting actions may execute directly.
- External, shared-workspace, workflow-stage, legal/tax-sensitive, irreversible, or closing actions must be confirmed before execution.
- If a confirm-first tool returns a staged action, do not claim it happened. Explain exactly what is staged and ask the user to confirm.
- After the user confirms, call the same tool again with confirmed=true and a short confirmationSummary.
- If an action gate blocks execution, tell the user what signoff or status is missing and offer the next safe step.
- Every material action must produce audit and usage records. Do not bypass the action contract by answering as freeform chat when a structured tool exists.
- Use citation-backed outputs for model, market intelligence, document, tax, legal, and diligence work.

Confirm-first tools:
${confirmFirst}

Public-agent-ready contracts:
${publicReady}

DEFINITIVE THE LINE inventory:
${lineSummary}
`.trim();
}
