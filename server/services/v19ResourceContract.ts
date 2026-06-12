import { V19_ARTIFACT_SCHEMAS, V19_RESOURCE_KINDS } from '../../shared/v19Artifacts.js';

export const V19_RESOURCE_TEMPLATES = [
  {
    uriTemplate: 'methodology://v19',
    name: 'V19 methodology doctrine',
    description: 'Current methodology, model, citation, gate, and audit doctrine.',
  },
  {
    uriTemplate: 'methodology://yulia-prompts/v4',
    name: 'Yulia V4 prompt governance',
    description: 'Runtime rules for model-backed claims, Studio provenance, tollgates, counsel deferrals, and audit records.',
  },
  {
    uriTemplate: 'deal://{dealId}/state',
    name: 'Deal state',
    description: 'Journey, league, gate, active model stack, and next-action state.',
  },
  {
    uriTemplate: 'deal://{dealId}/dossier',
    name: 'Deal dossier',
    description: 'Full dated memory pack for returning to a deal after time away — any status, including dormant/completed: gate timeline, the caller\'s own conversation summaries, model runs, deliverables, activity, and staleness ages. Agent tokens require the deal:read scope.',
  },
  {
    uriTemplate: 'studio://book/{bookId}',
    name: 'Studio book',
    description: 'Source-grounded pitch book, IC deck, QoE book, memo, or lender book.',
  },
  {
    uriTemplate: 'source://{sourceType}/{sourceId}',
    name: 'Source card',
    description: 'Uploaded file, data-room item, market citation, or model-backed source.',
  },
  {
    uriTemplate: 'model://execution/{executionId}',
    name: 'Model execution',
    description: 'Canonical model run with runtime MODEL.*.v1 id or public DEFINITIVE M-slot resolution, input hash, output hash, missing inputs, freshness state, and citations.',
  },
  {
    uriTemplate: 'model://slot/{slotId}',
    name: 'DEFINITIVE model slot',
    description: 'Public M101-M223 model slot with runtime execution mapping, THE LINE boundary, authority anchors, readiness, and next-call hints.',
  },
  {
    uriTemplate: 'audit://record/{auditId}',
    name: 'Audit record',
    description: 'Append-only V19 audit event for model-backed answers, exports, and deferrals.',
  },
  {
    uriTemplate: 'gate://{journey}/{gateId}',
    name: 'Gate state',
    description: 'Required models, required citations, halt triggers, and readiness state.',
  },
] as const;

export const V19_TOOL_CONTRACTS = [
  'assess_deal_entry',
  'ingest_deal_payload',
  'update_deal_payload',
  'get_deal_state',
  'resume_deal',
  'compose_deal_plan',
  'check_completeness',
  'get_definition_of_done',
  'diff_deal_state',
  'clone_deal_state',
  'compose_deal_package',
  'verify_package',
  'finalize_deal_package',
  'reopen_deal_package',
  'introspect_capabilities',
  'describe_methodology',
  'get_deal_runbook',
  'lookup_model_slot',
  'create_pitch_book',
  'revise_pitch_book',
  'add_pitch_book_section',
  'refresh_pitch_book_from_models',
  'export_pitch_book',
  'compose_model_stack',
  'execute_model',
  'run_model_iteration',
  'list_model_executions',
  'generate_output_doc',
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
  'read_v19_readiness',
  'read_v19_entitlements',
  'update_firm_memory',
  'defer_to_counsel',
  'update_tax_position',
  'write_audit_trail',
] as const;

export function listV19ResourceContract() {
  return {
    version: 'v19.0',
    resourceKinds: V19_RESOURCE_KINDS,
    resourceTemplates: V19_RESOURCE_TEMPLATES,
    toolContracts: V19_TOOL_CONTRACTS,
    artifactSchemas: V19_ARTIFACT_SCHEMAS,
  };
}
