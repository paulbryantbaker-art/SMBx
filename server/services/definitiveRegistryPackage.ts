import {
  DEFINITIVE_METHODOLOGY_URI,
  DEFINITIVE_METHODOLOGY_VERSION,
  DEFINITIVE_SPEC_URI,
  DEFINITIVE_SPEC_VERSION,
} from '../constants/definitive.js';
import {
  buildDefinitiveMcpServerCard,
  buildDefinitiveMcpWellKnownManifest,
} from './definitiveMcpDiscovery.js';
import { listDefinitiveMcpTools } from './definitiveMcp.js';
import { getDefinitiveSubstrateArchitecturePlan } from './definitiveSubstrateArchitecturePlan.js';

const REGISTRY_PACKAGE_VERSION = 'DEFINITIVE.registry-package.v0.1';
const SERVER_ID = 'smbx-ai/diligence';
const SERVER_TITLE = 'smbX DEFINITIVE Diligence Substrate';

function normalizeBaseUrl(baseUrl?: string) {
  return (baseUrl || process.env.APP_URL || 'http://127.0.0.1:3000').replace(/\/+$/, '');
}

export function buildDefinitiveRegistryPackage(baseUrl?: string) {
  const origin = normalizeBaseUrl(baseUrl);
  const toolSurface = listDefinitiveMcpTools();
  const architecture = getDefinitiveSubstrateArchitecturePlan();
  const serverCard = buildDefinitiveMcpServerCard(origin);
  const wellKnown = buildDefinitiveMcpWellKnownManifest(origin);
  const allowListTemplates = buildDefinitiveEnterpriseAllowListTemplates(origin);
  const registrySubmissionPackages = buildDefinitiveRegistrySubmissionPackages(origin);
  const agentExecutionExamples = buildAgentExecutionExamples();
  const managedAgentTemplates = buildManagedAgentTemplates();

  return {
    schema: REGISTRY_PACKAGE_VERSION,
    server: baseServerDescriptor(origin),
    canonicalStandard: architecture.publishedStandardDoctrine,
    methodology: {
      version: DEFINITIVE_METHODOLOGY_VERSION,
      uri: DEFINITIVE_METHODOLOGY_URI,
      specVersion: DEFINITIVE_SPEC_VERSION,
      specUri: DEFINITIVE_SPEC_URI,
    },
    registryEntry: {
      namespace: SERVER_ID,
      name: SERVER_ID,
      title: SERVER_TITLE,
      description:
        'Deterministic M&A Deal OS and diligence substrate for sub-$1B and private-company deal work: DealState, IOI/LOI/diligence/modeling/negotiation/close/PMI workflow, M101-M223 model mechanics, citation provenance, audit packets, and THE LINE-safe agent access.',
      homepageUrl: origin,
      serverCardUrl: `${origin}/.well-known/mcp/server-card.json`,
      discoveryManifestUrl: `${origin}/.well-known/mcp`,
      toolListUrl: `${origin}/api/definitive/tools/list`,
      categories: ['finance', 'm-and-a', 'private-equity', 'diligence', 'deal-os'],
      tags: [
        'working capital peg',
        'section 1060 allocation',
        'FIRPTA withholding',
        'indemnification cap and basket',
        'QoE adjustments',
        'earnout construction',
        'LBO model',
        'data room',
        'audit packet',
      ],
      auth: toolSurface.auth,
      transport: serverCard.transport,
      trustSignals: {
        deterministicOutputs: true,
        structuredOutputs: true,
        methodologyVersionPinned: true,
        citationProvenanceRequired: true,
        theLineNeutrality: true,
        noSuccessFees: true,
        noReferralCompensation: true,
      },
    },
    serverCard,
    wellKnown,
    enterpriseAllowListTemplates: allowListTemplates,
    agentExecutionExamples,
    managedAgentTemplates,
    registrySubmissionPackages,
    marketplaceSubmissionChecklist: [
      'Use the canonical namespace smbx-ai/diligence.',
      'Submit /.well-known/mcp/server-card.json as the server-card URL.',
      'Submit /.well-known/mcp as the discovery manifest.',
      'Describe smbX as the Deal OS and deterministic diligence substrate; do not market it as legal, tax, investment, or brokerage advice.',
      'Include THE LINE declaration: software/data API access only; no success fee, deal-value fee, wallet, or paid human-service referral.',
      'Use the query-aligned tool language from the registry tags so agents can select the right tool without semantic drift.',
      'Include the EV-only and model-rerun examples so incoming agents understand that smbX accepts partial facts, runs iterative model versions, then generates source-aware documents.',
      'For direct external agents, mint a short-lived scoped bridge token from /api/definitive/agent-tokens; requestedScopes cannot exceed token-bound scopes.',
      'If a customer does not operate its own agents, position managed smbX agents as permission-scoped renters of the same Deal OS tools, not a separate product surface.',
    ],
    generatedAt: new Date().toISOString(),
  };
}

export function buildDefinitiveRegistrySubmissionPackages(baseUrl?: string) {
  const origin = normalizeBaseUrl(baseUrl);
  const server = baseServerDescriptor(origin);
  const commonEvidence = {
    serverCardUrl: server.serverCardUrl,
    discoveryManifestUrl: server.discoveryManifestUrl,
    definitiveManifestUrl: server.specManifestUrl,
    schemaRegistryUrl: server.schemaRegistryUrl,
    registryPackageUrl: server.registryPackageUrl,
    lineDeclaration:
      'smbX is deterministic software/data infrastructure: no legal, tax, investment, brokerage, or negotiation advice; no wallet, success fee, deal-value fee, or paid human-service referral.',
    standard: 'The Diligence Standard',
    methodology: DEFINITIVE_METHODOLOGY_VERSION,
    conformanceEvidence: `${origin}/api/definitive/tools/call#validate_conformance`,
  };
  const semanticKeywords = [
    'working capital peg',
    'section 1060 allocation',
    'FIRPTA withholding',
    'indemnification cap and basket',
    'QoE adjustments',
    'earnout construction',
    'LBO model',
    'IOI packet',
    'LOI architecture',
    'data room index',
      'audit packet',
      'M101-M223',
      'G28 restructuring',
      'G29 capital structure',
      'G30 real estate overlay',
      'model iteration',
      'term sheet generation',
      'agent-run deal lifecycle',
    ];

  return {
    schema: 'DEFINITIVE.registry-submissions.v0.1',
    canonicalNamespace: SERVER_ID,
    commonEvidence,
    canonicalMcpRegistry: {
      surfaceId: 'linux_foundation_mcp_registry',
      namespace: SERVER_ID,
      packageName: SERVER_TITLE,
      submissionType: 'canonical_registry_entry',
      serverJson: {
        name: SERVER_ID,
        title: SERVER_TITLE,
        description:
          'Deterministic M&A Deal OS and diligence substrate for private-company deal work, with M101-M223 model mechanics, recursive deal-state workflow, citation provenance, audit packets, and THE LINE-safe agent access.',
        homepageUrl: origin,
        serverCardUrl: server.serverCardUrl,
        discoveryManifestUrl: server.discoveryManifestUrl,
        transport: 'http',
        tags: semanticKeywords,
      },
      readinessChecks: ['server-card', 'well-known-mcp', 'structured-output-schemas', 'THE-LINE-declaration'],
      ...commonEvidence,
    },
    thirdPartyDirectories: [
      directoryPackage('pulsemcp', 'PulseMCP', origin, semanticKeywords, commonEvidence),
      directoryPackage('glama', 'Glama MCP Directory', origin, semanticKeywords, commonEvidence),
      directoryPackage('mcp_so', 'mcp.so', origin, semanticKeywords, commonEvidence),
      directoryPackage('smithery', 'Smithery', origin, semanticKeywords, commonEvidence),
      directoryPackage('docker_mcp_catalog', 'Docker MCP Catalog', origin, semanticKeywords, commonEvidence),
      directoryPackage('awesome_mcp_servers', 'awesome-mcp-servers curated GitHub list', origin, semanticKeywords, commonEvidence),
    ],
    clientStorePackages: [
      clientStorePackage('claude_connector_directory', 'Claude Connector Directory', 'financial-services connector candidate', origin, semanticKeywords, commonEvidence),
      clientStorePackage('chatgpt_apps_directory', 'ChatGPT Apps Directory', 'app submission candidate', origin, semanticKeywords, commonEvidence),
      clientStorePackage('microsoft_agent_store', 'Microsoft Agent Store / Commercial Marketplace', 'Copilot agent package candidate', origin, semanticKeywords, commonEvidence),
      clientStorePackage('salesforce_agentexchange', 'Salesforce AgentExchange', 'ISV MCP Tool Action listing candidate', origin, semanticKeywords, commonEvidence),
      clientStorePackage('google_agent_gallery', 'Google Agent Gallery', 'A2A agent-card package candidate', origin, semanticKeywords, commonEvidence),
    ],
    semanticToolMetadataChecklist: [
      'Tool names and descriptions must use buyer/seller deal-language phrases such as working capital peg, section 1060 allocation, FIRPTA withholding, indemnification cap and basket, QoE adjustments, and earnout construction.',
      'Every description must name The Diligence Standard, the current methodology pin, the relevant M-slot or gate, and THE LINE status.',
      'Every listed tool must expose outputSchema or structuredContent-compatible schema information.',
      'Every marketplace package must include no-success-fee and no-paid-human-referral declarations.',
      'Every package should point agents back to DealState, runbooks, model catalog, schema registry, and audit packet surfaces so smbX is understood as the recurring Deal OS.',
      'Every package should include the EV-only entry example and the model-iteration-to-document example so agents understand modeling is recursive and documents inherit model lineage.',
      'Every package should state that human users can manually adjust model-canvas inputs, Yulia can optimize via optimize_scenario, and external agents should persist the selected case with run_model_iteration before generating output documents.',
    ],
    submissionOrder: [
      'canonical_mcp_registry',
      'third_party_directories',
      'client_store_packages',
      'enterprise_allow_lists',
      'partner_connector_outreach',
    ],
  };
}

export function buildAgentExecutionExamples() {
  return [
    {
      id: 'agent_example_ev_only_entry',
      title: 'EV-only agent entry into the Deal OS',
      startsWith: 'An agent or human only knows enterprise value, journey, industry, and rough EBITDA or revenue.',
      sequence: [
        {
          toolName: 'assess_deal_entry',
          why: 'Classify where the agent is entering the lifecycle from EV-only or partial facts and receive the no-rejection next-call path.',
          input: {
            objective: 'prepare IOI from partial EV context',
            journey: 'buy',
            enterpriseValueCents: '<known EV in cents>',
            ebitdaCents: '<if known>',
            industry: '<industry>',
          },
        },
        {
          toolName: 'introspect_capabilities',
          why: 'Discover the relevant lifecycle, surfaces, and model mechanics without loading the full corpus.',
          input: { objective: 'prepare IOI from partial EV context', journey: 'buy', dealType: 'private company acquisition' },
        },
        {
          toolName: 'ingest_deal_payload',
          why: 'Create a DealState even though the payload is incomplete.',
          input: {
            payload: {
              journey: 'buy',
              industry: '<industry>',
              enterpriseValueCents: '<known EV in cents>',
              ebitdaCents: '<if known>',
              revenueCents: '<if known>',
            },
          },
        },
        {
          toolName: 'compose_model_stack',
          why: 'Map the partial deal facts to the applicable M101-M223 mechanics and identify which models can run now.',
          input: { journey: 'buy', dealType: '<deal type>', industry: '<industry>' },
        },
        {
          toolName: 'run_model_iteration',
          why: 'Run the first deterministic model version from the known EV and supplied assumptions.',
          input: {
            dealId: '<deal id>',
            modelSlotId: '<executable M-slot from compose_model_stack, e.g. M148 or M200>',
            input: { enterpriseValueCents: '<known EV in cents>' },
          },
        },
        {
          toolName: 'prepare_ioi_packet',
          why: 'Produce a non-binding IOI packet and source/model gap list for the next recursive loop.',
          input: { dealState: '<DealState>' },
        },
      ],
      takeBackArtifacts: ['DealState', 'MissingInputContract', 'ModelOutput', 'IOIPacket', 'MCPCallHint[]'],
    },
    {
      id: 'agent_example_model_iteration_to_doc',
      title: 'Rerun a model after new facts, then generate the output document',
      startsWith: 'The agent receives updated EBITDA, working capital, debt, or EV assumptions after diligence.',
      sequence: [
        {
          toolName: 'list_model_executions',
          why: 'Find prior model versions and output hashes before making a new assumption version.',
          input: { dealId: '<deal id>', limit: 10 },
        },
        {
          toolName: 'run_model_iteration',
          why: 'Create a child model run with merged assumptions and parent output-hash lineage.',
          input: {
            executionId: '<prior model execution id>',
            dealId: '<deal id>',
            overrides: { ebitdaCents: '<updated EBITDA in cents>', enterpriseValueCents: '<updated EV in cents>' },
            reason: 'Updated diligence assumptions',
          },
        },
        {
          toolName: 'generate_output_doc',
          why: 'Generate the requested Studio output only after the model dependency IDs are current against the latest assumptions.',
          input: {
            dealId: '<deal id>',
            documentType: 'term_sheet',
            sourceModelExecutionIds: ['<new model execution id>'],
            requireFreshModels: true,
            audience: 'internal_deal_team',
          },
        },
      ],
      takeBackArtifacts: ['ModelExecutionHistory', 'AgentModelIteration', 'DocumentDraft', 'deliverableId', 'OutputHash[]'],
    },
    {
      id: 'agent_example_data_room_loop',
      title: 'Data room and diligence loop',
      startsWith: 'A deal has files, but the external agent needs to understand source gaps and diligence requests.',
      sequence: [
        { toolName: 'compose_data_room_index', why: 'Group source material and expose remaining source gaps.', input: { dealState: '<DealState>' } },
        { toolName: 'prepare_diligence_request', why: 'Create an internal diligence request scaffold tied to missing sources.', input: { dealState: '<DealState>', categories: ['financials', 'tax', 'legal', 'ip'] } },
        { toolName: 'update_deal_payload', why: 'Merge newly supplied diligence facts back into the same DealState.', input: { dealState: '<DealState>', patch: '<new facts>' } },
        { toolName: 'check_completeness', why: 'Re-score readiness before moving to LOI, model rerun, negotiation, or close readiness.', input: { dealState: '<DealState>' } },
      ],
      takeBackArtifacts: ['DataRoomIndex', 'DiligenceRequest', 'MissingInputContract', 'CompletenessReport'],
    },
  ];
}

export function buildManagedAgentTemplates() {
  return [
    {
      id: 'managed_agent_acquisition_analyst',
      label: 'Acquisition Analyst Agent',
      rentedFor: 'Buy-side teams that want smbX to operate the agent instead of building their own.',
      defaultScopes: ['capability:read', 'methodology:read', 'deal-plan:read', 'deal-state:read', 'model-stack:compose', 'model:execute', 'model:read', 'studio:draft'],
      starterRunbook: ['assess_deal_entry', 'introspect_capabilities', 'ingest_deal_payload', 'compose_deal_plan', 'compose_model_stack', 'run_model_iteration', 'generate_output_doc'],
      humanApprovalRequiredFor: ['external transmission', 'negotiation instructions', 'closing authority'],
    },
    {
      id: 'managed_agent_diligence_manager',
      label: 'Diligence Manager Agent',
      rentedFor: 'Teams that want a governed agent to maintain data rooms, source gaps, diligence requests, and package verification.',
      defaultScopes: ['capability:read', 'methodology:read', 'deal-plan:read', 'deal-state:read', 'data-room:read', 'studio:draft', 'deal-package:compose', 'model:read'],
      starterRunbook: ['compose_data_room_index', 'prepare_diligence_request', 'disclose_subset', 'verify_package', 'resume_deal'],
      humanApprovalRequiredFor: ['external disclosure', 'legal sufficiency decisions', 'provider engagement'],
    },
    {
      id: 'managed_agent_document_builder',
      label: 'Document Builder Agent',
      rentedFor: 'Teams that want source-aware IOI, LOI, term sheet, CIM, IC memo, funds flow, negotiation, or PMI drafts without deploying an agent.',
      defaultScopes: ['capability:read', 'methodology:read', 'deal-plan:read', 'deal-state:read', 'studio:draft', 'model:read', 'audit:write'],
      starterRunbook: ['generate_output_doc', 'compose_document_draft', 'prepare_loi_packet', 'prepare_negotiation_brief', 'compose_close_readiness'],
      humanApprovalRequiredFor: ['external sending', 'clause language reliance', 'legal/tax advice'],
    },
  ];
}

export function buildDefinitiveEnterpriseAllowListTemplates(baseUrl?: string) {
  const origin = normalizeBaseUrl(baseUrl);
  const toolSurface = listDefinitiveMcpTools();
  const tools = toolSurface.tools.map(tool => ({
    name: tool.name,
    requiredScopes: tool.requiredScopes,
    lineStatus: tool.lineStatus,
    metering: tool.metering,
  }));
  const allowedTools = tools.filter(tool => tool.lineStatus !== 'LINE_VIOLATION');

  return {
    schema: 'DEFINITIVE.enterprise-allow-lists.v0.1',
    server: baseServerDescriptor(origin),
    githubCopilotRegistry: {
      policyMode: 'registry_only',
      registry: {
        version: '2026-05-23',
        servers: [
          {
            id: SERVER_ID,
            name: SERVER_TITLE,
            url: `${origin}/api/definitive/tools/call`,
            transport: 'http',
            serverCardUrl: `${origin}/.well-known/mcp/server-card.json`,
            discoveryManifestUrl: `${origin}/.well-known/mcp`,
            allowedTools: allowedTools.map(tool => tool.name),
            requiredScopes: unique(allowedTools.flatMap(tool => tool.requiredScopes)),
          },
        ],
      },
    },
    kiroAwsQRegistry: {
      registryUrlHint: `${origin}/api/definitive/enterprise-allow-lists`,
      refreshCadence: '24h',
      servers: [
        {
          id: SERVER_ID,
          displayName: SERVER_TITLE,
          endpoint: `${origin}/api/definitive/tools/call`,
          serverCard: `${origin}/.well-known/mcp/server-card.json`,
          allowTools: allowedTools.map(tool => tool.name),
          denyTools: tools.filter(tool => tool.lineStatus === 'LINE_VIOLATION').map(tool => tool.name),
          metadata: {
            standard: 'The Diligence Standard',
            methodologyVersion: DEFINITIVE_METHODOLOGY_VERSION,
            noSuccessFees: true,
            noReferralCompensation: true,
          },
        },
      ],
    },
    azureApiCenterBlueprint: {
      apiId: SERVER_ID,
      title: SERVER_TITLE,
      kind: 'mcp_server',
      lifecycleStage: 'preview_internal_api_shape',
      endpoints: {
        serverCard: `${origin}/.well-known/mcp/server-card.json`,
        discoveryManifest: `${origin}/.well-known/mcp`,
        toolsList: `${origin}/api/definitive/tools/list`,
        toolCall: `${origin}/api/definitive/tools/call`,
      },
      auth: {
        current: 'JWT bearer for internal app calls plus token-bound scoped agent calls',
        productionTarget: 'OAuth 2.1 + PKCE + scoped, audience-bound agent tokens',
        scopeEnforcement:
          'Agent tokens carry scopes in JWT claims. requestedScopes may be omitted or narrowed, but cannot exceed token-bound scopes.',
      },
      classifications: ['financial_services', 'm_and_a', 'private_equity', 'governed_agent_tool'],
      requiredReview: ['security', 'legal', 'compliance', 'data_retention'],
    },
    bedrockAgentCoreCedarPolicyTemplate: {
      policyLanguage: 'cedar_template',
      note: 'Replace principal and tenant ids with the enterprise deployment values before use.',
      policy: [
        'permit(',
        '  principal in Agent::"AUTHORIZED_AGENT_ID",',
        '  action in [Action::"CallDefinitiveTool"],',
        `  resource == McpServer::"${SERVER_ID}"`,
        ') when {',
        '  context.methodologyVersion == "methodology://v19" &&',
        '  context.noSuccessFee == true &&',
        '  context.requestedToolLineStatus != "LINE_VIOLATION"',
        '};',
      ].join('\n'),
    },
    microsoftEntraAgentIdTemplate: {
      resource: SERVER_ID,
      displayName: SERVER_TITLE,
      audience: `${origin}/api/definitive/tools/call`,
      scopes: unique(allowedTools.flatMap(tool => tool.requiredScopes)),
      claimsRequired: ['agent_id', 'agent_platform_id', 'beneficial_customer_id', 'mandate_id'],
      tokenPosture: 'audience-bound scoped token; reject token passthrough',
    },
    toolCount: tools.length,
    allowedToolCount: allowedTools.length,
    lineDoctrine:
      'Enterprise allow-list approval should treat smbX as software/data infrastructure. It computes, cites, packages, and routes; it does not advise, recommend, negotiate, represent, guarantee, move money, or receive transaction-based compensation.',
    tools,
    generatedAt: new Date().toISOString(),
  };
}

function directoryPackage(
  surfaceId: string,
  label: string,
  origin: string,
  semanticKeywords: string[],
  commonEvidence: Record<string, any>,
) {
  return {
    surfaceId,
    label,
    submissionType: 'mcp_directory_listing',
    installUrl: `${origin}/api/definitive/tools/call`,
    homepageUrl: origin,
    shortDescription: 'Deterministic M&A Deal OS and diligence substrate for agent-run private-company deal work.',
    tags: semanticKeywords,
    requiredAssets: ['README', 'server-card URL', 'well-known MCP URL', 'license/security posture', 'THE LINE declaration'],
    ...commonEvidence,
  };
}

function clientStorePackage(
  surfaceId: string,
  label: string,
  submissionType: string,
  origin: string,
  semanticKeywords: string[],
  commonEvidence: Record<string, any>,
) {
  return {
    surfaceId,
    label,
    submissionType,
    endpointUrl: `${origin}/api/definitive/tools/call`,
    homepageUrl: origin,
    appDescription:
      'smbX DEFINITIVE gives agents and humans one Deal OS for iterative M&A work: intake, IOI, LOI, diligence, model stack, data room, negotiation brief, close readiness, PMI, citations, and audit packets.',
    semanticKeywords,
    distributionPosture: 'neutral_substrate_available_to_claude_chatgpt_copilot_gemini_agentforce_and_direct_agents',
    trustSignals: ['deterministic outputs', 'citation provenance', 'methodology version pin', 'structured outputs', 'audit packets', 'THE LINE'],
    ...commonEvidence,
  };
}

function baseServerDescriptor(origin: string) {
  return {
    id: SERVER_ID,
    title: SERVER_TITLE,
    origin,
    serverCardUrl: `${origin}/.well-known/mcp/server-card.json`,
    discoveryManifestUrl: `${origin}/.well-known/mcp`,
    specManifestUrl: `${origin}/.well-known/definitive.json`,
    schemaRegistryUrl: `${origin}/api/definitive/schemas`,
    dealRunbooksUrl: `${origin}/api/definitive/deal-runbooks`,
    dealRunbookUrlTemplate: `${origin}/api/definitive/deal-runbooks/{journey}`,
    modelCatalogUrl: `${origin}/api/definitive/model-catalog`,
    modelSlotUrlTemplate: `${origin}/api/definitive/model-catalog/{slotId}`,
    passThroughCatalogUrl: `${origin}/api/definitive/pass-through-catalog`,
    registryPackageUrl: `${origin}/api/definitive/registry-package`,
    enterpriseAllowListsUrl: `${origin}/api/definitive/enterprise-allow-lists`,
    agentTokenIssueUrl: `${origin}/api/definitive/agent-tokens`,
  };
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort();
}
