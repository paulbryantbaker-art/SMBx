import { V19_ARTIFACT_SCHEMAS, V19_RESOURCE_KINDS } from '../../shared/v19Artifacts.js';

export const V19_RESOURCE_TEMPLATES = [
  {
    uriTemplate: 'methodology://v19',
    name: 'V19 methodology doctrine',
    description: 'Current methodology, model, citation, gate, and audit doctrine.',
  },
  {
    uriTemplate: 'deal://{dealId}/state',
    name: 'Deal state',
    description: 'Journey, league, gate, active model stack, and next-action state.',
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
    description: 'Canonical MODEL.*.v1 run with input hash, output hash, missing inputs, and citations.',
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
  'create_pitch_book',
  'revise_pitch_book',
  'add_pitch_book_section',
  'refresh_pitch_book_from_models',
  'export_pitch_book',
  'compose_model_stack',
  'execute_model',
  'lookup_citation',
  'fetch_market_data',
  'read_v19_readiness',
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
