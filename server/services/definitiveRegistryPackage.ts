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
    marketplaceSubmissionChecklist: [
      'Use the canonical namespace smbx-ai/diligence.',
      'Submit /.well-known/mcp/server-card.json as the server-card URL.',
      'Submit /.well-known/mcp as the discovery manifest.',
      'Describe smbX as the Deal OS and deterministic diligence substrate; do not market it as legal, tax, investment, or brokerage advice.',
      'Include THE LINE declaration: software/data API access only; no success fee, deal-value fee, wallet, or paid human-service referral.',
      'Use the query-aligned tool language from the registry tags so agents can select the right tool without semantic drift.',
    ],
    generatedAt: new Date().toISOString(),
  };
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
        current: 'JWT bearer for internal app calls',
        productionTarget: 'OAuth 2.1 + PKCE + scoped, audience-bound agent tokens',
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
  };
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort();
}
