import { DEFINITIVE_METHODOLOGY_URI, DEFINITIVE_METHODOLOGY_VERSION, DEFINITIVE_SPEC_VERSION } from '../constants/definitive.js';
import { buildDefinitiveSpecManifest } from './definitiveSpecManifest.js';
import { listDefinitiveMcpTools } from './definitiveMcp.js';
import { getDefinitiveSubstrateArchitecturePlan } from './definitiveSubstrateArchitecturePlan.js';
import { getDefinitiveToolSchemaMap } from './definitiveSchemas.js';

const MCP_DISCOVERY_PROTOCOL_VERSION = '2025-12-11';
const MCP_SERVER_NAME = 'smbx-ai/diligence';
const MCP_SERVER_TITLE = 'smbX DEFINITIVE Diligence Substrate';
const MCP_SERVER_DESCRIPTION =
  'Agent-ready M&A Deal OS and deterministic diligence substrate for working capital pegs, Section 1060 allocation, FIRPTA withholding, indemnification cap and basket, QoE adjustments, earnout construction, LBO model support, data rooms, audit packets, and recursive deal-state work.';

const WRITE_TOOLS = new Set([
  'ingest_deal_payload',
  'update_deal_payload',
  'defer_to_counsel',
  'compose_model_stack',
  'execute_model',
  'record_corpus_observation',
  'close_deal',
  'update_tax_position',
]);

const DESTRUCTIVE_TOOLS = new Set([
  'close_deal',
  'update_tax_position',
]);

const OPEN_WORLD_TOOLS = new Set([
  'lookup_citation',
  'fetch_market_data',
  'defer_to_counsel',
  'query_admin_data',
]);

function normalizeBaseUrl(baseUrl?: string) {
  return (baseUrl || process.env.APP_URL || 'http://127.0.0.1:3000').replace(/\/+$/, '');
}

function buildToolOutputSchema(toolName: string) {
  return {
    type: 'object',
    properties: {
      ok: { type: 'boolean' },
      toolName: { type: 'string', enum: [toolName] },
      protocol: { type: 'string' },
      result: { type: 'object' },
      error: { type: 'string' },
      tollgate: { type: 'object' },
      mandateChain: { type: 'object' },
      lineStatus: { type: 'string' },
      lineReason: { type: 'string' },
      requiredScopes: { type: 'array', items: { type: 'string' } },
      specVersion: { type: 'string' },
      methodologyVersion: { type: 'string' },
    },
    required: ['ok', 'toolName', 'specVersion', 'methodologyVersion'],
    additionalProperties: true,
  };
}

function buildToolAnnotations(toolName: string, lineStatus: string) {
  return {
    readOnlyHint: !WRITE_TOOLS.has(toolName),
    destructiveHint: DESTRUCTIVE_TOOLS.has(toolName),
    openWorldHint: OPEN_WORLD_TOOLS.has(toolName),
    lineStatus,
    methodologyPinned: true,
    citationProvenanceRequired: true,
  };
}

function buildDiscoveryTool(tool: ReturnType<typeof listDefinitiveMcpTools>['tools'][number]) {
  const toolSchemaMap = getDefinitiveToolSchemaMap();
  return {
    name: tool.name,
    title: tool.name.replace(/_/g, ' '),
    description: `${tool.description} Implements ${DEFINITIVE_SPEC_VERSION} / The Diligence Standard with THE LINE status ${tool.lineStatus}.`,
    inputSchema: tool.inputSchema,
    outputSchema: buildToolOutputSchema(tool.name),
    annotations: buildToolAnnotations(tool.name, tool.lineStatus),
    requiredScopes: tool.requiredScopes,
    lineStatus: tool.lineStatus,
    refusalBehavior: tool.refusalBehavior,
    metering: tool.metering,
    structuredContentSchemas: toolSchemaMap[tool.name] || null,
  };
}

export function buildDefinitiveMcpServerCard(baseUrl?: string) {
  const origin = normalizeBaseUrl(baseUrl);
  const manifest = buildDefinitiveSpecManifest();
  const tools = listDefinitiveMcpTools();
  const substrateArchitecture = getDefinitiveSubstrateArchitecturePlan();

  return {
    $schema: 'https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json',
    name: MCP_SERVER_NAME,
    title: MCP_SERVER_TITLE,
    description: MCP_SERVER_DESCRIPTION,
    version: manifest.version,
    protocolVersion: MCP_DISCOVERY_PROTOCOL_VERSION,
    serverUrl: `${origin}/api/definitive/tools/call`,
    serverInfo: {
      name: MCP_SERVER_NAME,
      title: MCP_SERVER_TITLE,
      version: manifest.version,
      publisher: 'smbX.ai',
      canonicalStandard: substrateArchitecture.publishedStandardDoctrine.name,
      methodology: DEFINITIVE_METHODOLOGY_VERSION,
      methodologyUri: DEFINITIVE_METHODOLOGY_URI,
    },
    transport: {
      type: 'http',
      status: 'internal_api_shape_oauth_ready',
      target: manifest.transport.target,
      endpoints: {
        toolsList: `${origin}${manifest.endpoints.toolsList}`,
        toolCall: `${origin}${manifest.endpoints.toolCall}`,
        serverCard: `${origin}/.well-known/mcp/server-card.json`,
        discoveryManifest: `${origin}/.well-known/mcp`,
        schemaRegistry: `${origin}/api/definitive/schemas`,
        wellKnownSchemaRegistry: `${origin}/.well-known/definitive-schemas.json`,
      },
    },
    capabilities: {
      tools: {
        listChanged: false,
      },
      resources: false,
      prompts: false,
      logging: false,
    },
    auth: tools.auth,
    tools: tools.tools.map(buildDiscoveryTool),
    definitive: {
      specManifest: `${origin}${manifest.endpoints.specManifest}`,
      agentCard: `${origin}${manifest.endpoints.agentCard}`,
      passThroughCatalog: `${origin}${manifest.endpoints.passThroughCatalog}`,
      authoritySeedPlan: `${origin}${manifest.endpoints.authoritySeedPlan}`,
      substrateArchitecture: `${origin}${manifest.endpoints.substrateArchitecture}`,
      dealRunbooks: `${origin}${manifest.endpoints.dealRunbooks}`,
      dealRunbook: `${origin}${manifest.endpoints.dealRunbook}`,
      modelCatalog: `${origin}${manifest.endpoints.modelCatalog}`,
      modelSlot: `${origin}${manifest.endpoints.modelSlot}`,
      dealMechanicsModelSlot: `${origin}${manifest.endpoints.dealMechanicsModelSlot}`,
      registryPackage: `${origin}${manifest.endpoints.registryPackage}`,
      enterpriseAllowLists: `${origin}${manifest.endpoints.enterpriseAllowLists}`,
      schemaRegistry: `${origin}/api/definitive/schemas`,
      wellKnownSchemaRegistry: `${origin}/.well-known/definitive-schemas.json`,
      toolMetadataDoctrine: substrateArchitecture.toolMetadataDoctrine,
      publishedStandardDoctrine: substrateArchitecture.publishedStandardDoctrine,
      agentDiscoverabilityLayers: substrateArchitecture.agentDiscoverabilityLayers.map(layer => layer.id),
      agentDesirabilitySignals: substrateArchitecture.agentDesirabilitySignals.map(signal => signal.id),
      lineDoctrine: substrateArchitecture.lineDoctrine,
    },
    security: {
      executionRequiresAuthentication: true,
      executionRequiresGovernedToolContract: true,
      corpusWritesRequireDataRightsGrant: true,
      noSuccessFees: true,
      noReferralCompensation: true,
      lineDeclaration: 'smbX is software and deterministic deal infrastructure; it does not advise, recommend, negotiate, represent, guarantee, execute payments, or take transaction-based compensation.',
    },
    conformance: manifest.conformanceSurface,
    generatedAt: new Date().toISOString(),
  };
}

export function buildDefinitiveMcpWellKnownManifest(baseUrl?: string) {
  const origin = normalizeBaseUrl(baseUrl);
  const manifest = buildDefinitiveSpecManifest();
  const substrateArchitecture = getDefinitiveSubstrateArchitecturePlan();

  return {
    mcp_version: MCP_DISCOVERY_PROTOCOL_VERSION,
    name: MCP_SERVER_NAME,
    title: MCP_SERVER_TITLE,
    description: MCP_SERVER_DESCRIPTION,
    server_card: `${origin}/.well-known/mcp/server-card.json`,
    endpoints: [
      { type: 'server-card', url: `${origin}/.well-known/mcp/server-card.json`, auth: 'none' },
      { type: 'mcp-discovery', url: `${origin}/.well-known/mcp`, auth: 'none' },
      { type: 'definitive-schema-registry', url: `${origin}/api/definitive/schemas`, auth: 'none' },
      { type: 'definitive-schema-registry-well-known', url: `${origin}/.well-known/definitive-schemas.json`, auth: 'none' },
      { type: 'definitive-manifest', url: `${origin}${manifest.endpoints.specManifest}`, auth: 'none' },
      { type: 'definitive-deal-runbooks', url: `${origin}${manifest.endpoints.dealRunbooks}`, auth: 'none' },
      { type: 'definitive-model-catalog', url: `${origin}${manifest.endpoints.modelCatalog}`, auth: 'none' },
      { type: 'agent-card', url: `${origin}${manifest.endpoints.agentCard}`, auth: 'none' },
      { type: 'tools-list', url: `${origin}${manifest.endpoints.toolsList}`, auth: 'bearer' },
      { type: 'tool-call', url: `${origin}${manifest.endpoints.toolCall}`, auth: 'bearer' },
    ],
    transport: {
      type: 'http',
      status: 'internal_api_shape_oauth_ready',
      target: manifest.transport.target,
    },
    capabilities: {
      tools: true,
      outputSchema: true,
      structuredContent: true,
      idempotencyRequired: true,
      auditTrail: true,
    },
    doctrine: {
      standard: substrateArchitecture.publishedStandardDoctrine.name,
      methodology: substrateArchitecture.publishedStandardDoctrine.methodology,
      namingConvention: substrateArchitecture.toolMetadataDoctrine.namingConvention,
      lineDeclaration: substrateArchitecture.lineDoctrine,
      discoveryLayers: substrateArchitecture.agentDiscoverabilityLayers.map(layer => layer.id),
      desirabilitySignals: substrateArchitecture.agentDesirabilitySignals.map(signal => signal.id),
    },
    generatedAt: new Date().toISOString(),
  };
}
