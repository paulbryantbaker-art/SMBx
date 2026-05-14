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

export interface AgencyActionContract {
  toolName: string;
  label: string;
  methodologyRefs: string[];
  mode: AgencyMode;
  permissionLevel: PermissionLevel;
  riskLevel: RiskLevel;
  confirmation: ConfirmationPolicy;
  writeScope: 'none' | 'conversation' | 'deal' | 'deliverable' | 'data_room' | 'review' | 'share' | 'sourcing' | 'support' | 'model';
  actionClass?: ActionClass | 'dynamic_share';
  description: string;
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

export const TOOL_NAMES_REQUIRING_CONFIRMATION = new Set(
  Object.values(CONTRACTS)
    .filter(contract => contract.confirmation === 'required')
    .map(contract => contract.toolName),
);

export function getAgencyActionContract(toolName: string): AgencyActionContract | undefined {
  return CONTRACTS[toolName];
}

export function listAgencyActionContracts(): AgencyActionContract[] {
  return Object.values(CONTRACTS);
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
    .map(contract => `- ${contract.toolName}: ${contract.label} (${contract.permissionLevel}). First call stages the action; after the user explicitly confirms, call the same tool with confirmed=true.`)
    .join('\n');

  return `
## YULIA EXECUTION LAYER — METHOD v17 RUNTIME
Every tool call is governed by an action contract derived from Methodology v17.

Runtime rule:
- Safe read, navigation, modeling, and internal drafting actions may execute directly.
- External, shared-workspace, workflow-stage, legal/tax-sensitive, irreversible, or closing actions must be confirmed before execution.
- If a confirm-first tool returns a staged action, do not claim it happened. Explain exactly what is staged and ask the user to confirm.
- After the user confirms, call the same tool again with confirmed=true and a short confirmationSummary.
- If an action gate blocks execution, tell the user what signoff or status is missing and offer the next safe step.

Confirm-first tools:
${confirmFirst}
`.trim();
}
