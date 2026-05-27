import {
  DEFINITIVE_METHODOLOGY_VERSION,
  DEFINITIVE_SPEC_VERSION,
} from '../constants/definitive.js';
import { listDefinitiveMcpTools } from './definitiveMcp.js';
import { getDefinitiveSubstrateArchitecturePlan } from './definitiveSubstrateArchitecturePlan.js';

const CONNECTOR_DISTRIBUTION_VERSION = 'DEFINITIVE.connector-distribution.v0.1';
const SERVER_ID = 'smbx-ai/diligence';
const SERVER_TITLE = 'smbX DEFINITIVE Diligence Substrate';

function normalizeBaseUrl(baseUrl?: string) {
  return (baseUrl || process.env.APP_URL || 'http://127.0.0.1:3000').replace(/\/+$/, '');
}

export function buildDefinitiveConnectorDistributionPackage(baseUrl?: string) {
  const origin = normalizeBaseUrl(baseUrl);
  const toolSurface = listDefinitiveMcpTools();
  const architecture = getDefinitiveSubstrateArchitecturePlan();
  const proofEndpoints = buildProofEndpoints(origin);
  const commonAssets = buildCommonAssets(origin);
  const platformPackages = [
    platformPackage({
      surfaceId: 'claude_connector',
      label: 'Claude Connector',
      priority: 1,
      launchLane: 'primary',
      buyer: 'Claude users doing finance, M&A, diligence, banking, PE, search-fund, or CFO-office work.',
      posture:
        'Claude-first connector wedge: supervised Deal OS access, public discovery, scoped execution, and take-back artifacts.',
      submissionType: 'connector_directory_candidate',
      distributionGoal:
        'Let Claude hand off serious M&A work to smbX for model-backed analysis, data-room organization, source-aware drafts, and audit packets.',
    }, origin, commonAssets),
    platformPackage({
      surfaceId: 'chatgpt_gpt_actions',
      label: 'ChatGPT GPT Actions',
      priority: 2,
      launchLane: 'fastest_revenue',
      buyer: 'ChatGPT users and teams that want a private or listed GPT to call smbX APIs for deal analysis.',
      posture:
        'OpenAPI Actions package for private GPT pilot and GPT Store path while remote MCP/App SDK work is completed.',
      submissionType: 'gpt_actions_candidate',
      distributionGoal:
        'Create the fastest paid assistant entry point by importing the smbX OpenAPI action spec into a custom GPT.',
    }, origin, commonAssets),
    platformPackage({
      surfaceId: 'chatgpt_app',
      label: 'ChatGPT App / Connector',
      priority: 3,
      launchLane: 'secondary',
      buyer: 'ChatGPT teams that want a governed M&A diligence app rather than a general finance answer.',
      posture:
        'App-store candidate with the same MCP/server-card evidence, schema registry, THE LINE statement, and scoped execution posture.',
      submissionType: 'app_directory_candidate',
      distributionGoal:
        'Expose smbX as the deterministic Deal OS ChatGPT can invoke for structured M&A work and portable artifacts.',
    }, origin, commonAssets),
    platformPackage({
      surfaceId: 'microsoft_copilot_agent',
      label: 'Microsoft Copilot Agent',
      priority: 4,
      launchLane: 'enterprise',
      buyer: 'Enterprise deal teams that need Entra, allow-list, audit, and governed agent controls.',
      posture:
        'Enterprise allow-list candidate backed by the Microsoft Entra agent-id template and Azure API Center blueprint.',
      submissionType: 'enterprise_agent_package_candidate',
      distributionGoal:
        'Make smbX a governed M&A tool server for Copilot and enterprise agent fleets.',
    }, origin, commonAssets),
    platformPackage({
      surfaceId: 'salesforce_agentexchange',
      label: 'Salesforce AgentExchange',
      priority: 5,
      launchLane: 'enterprise',
      buyer: 'Corp-dev, sponsor coverage, and intermediary teams already using Salesforce deal or account workflows.',
      posture:
        'MCP Tool Action candidate for routing account/deal context into smbX without letting smbX contact counterparties.',
      submissionType: 'agentexchange_listing_candidate',
      distributionGoal:
        'Let Salesforce agents prepare deal intelligence, diligence packs, and model outputs while CRM users stay the decision makers.',
    }, origin, commonAssets),
    platformPackage({
      surfaceId: 'google_gemini_agent',
      label: 'Gemini / Google Agent Surface',
      priority: 6,
      launchLane: 'secondary',
      buyer: 'Google Workspace and Gemini users collaborating around diligence files, models, and deal packages.',
      posture:
        'Agent-card package candidate using the same public discovery, schema registry, and scoped execution contracts.',
      submissionType: 'agent_gallery_candidate',
      distributionGoal:
        'Give Gemini-compatible agents a stable path to smbX DealState, model stack, Studio drafts, and audit packets.',
    }, origin, commonAssets),
    platformPackage({
      surfaceId: 'canonical_mcp_directories',
      label: 'Canonical MCP Directories',
      priority: 7,
      launchLane: 'infrastructure',
      buyer: 'Developers and agent platforms searching MCP directories for finance and diligence tool servers.',
      posture:
        'Directory listing package that points to the well-known MCP manifest, server-card, schema registry, and conformance evidence.',
      submissionType: 'mcp_directory_listing',
      distributionGoal:
        'Make smbX discoverable by agents looking for working-capital, tax, legal-economics, data-room, and Deal OS tools.',
    }, origin, commonAssets),
  ];

  return {
    schema: CONNECTOR_DISTRIBUTION_VERSION,
    server: {
      id: SERVER_ID,
      title: SERVER_TITLE,
      origin,
      serverCardUrl: proofEndpoints.serverCard,
      discoveryManifestUrl: proofEndpoints.mcpManifest,
      mcpEndpointUrl: proofEndpoints.mcpEndpoint,
      oauthProtectedResourceUrl: proofEndpoints.oauthProtectedResource,
      connectorDistributionUrl: proofEndpoints.connectorDistribution,
    },
    status: 'packaged_pending_platform_submission',
    launchPriority: platformPackages.map(pkg => pkg.surfaceId),
    positioning: {
      oneLine:
        'smbX gives AI assistants a governed M&A Deal OS for deterministic diligence, model-backed work product, data-room loops, and audit packets.',
      category: 'M&A deal intelligence and diligence substrate',
      primaryWedge: 'ChatGPT GPT Actions for fastest paid pilot, then Claude remote connector and ChatGPT Apps SDK once remote MCP transport is live.',
      notA: [
        'broker',
        'investment adviser',
        'law firm',
        'tax adviser',
        'accounting firm',
        'escrow agent',
        'negotiation agent',
      ],
    },
    universalListingCopy: {
      name: SERVER_ID,
      title: SERVER_TITLE,
      shortDescription:
        'Governed M&A Deal OS for agent-run diligence, model-backed analysis, source-aware drafts, and audit packets.',
      longDescription:
        'smbX DEFINITIVE lets AI assistants and human deal teams move through intake, IOI, LOI, diligence, model stack, data room, negotiation brief, close readiness, funds-flow scaffolds, and PMI with deterministic models, source provenance, missing-input contracts, and THE LINE-safe execution.',
      categories: ['finance', 'm-and-a', 'private-equity', 'diligence', 'deal-os'],
      semanticKeywords: architecture.toolMetadataDoctrine.semanticKeywords,
    },
    proofEndpoints,
    commonAssets,
    platformPackages,
    safetyAndCompliance: {
      lineDeclaration:
        'smbX is software and deterministic deal infrastructure. It does not advise, recommend, negotiate, represent, guarantee, execute payments, contact counterparties, or take transaction-based compensation.',
      pricingDeclaration:
        'Subscriptions, included credits, fixed software deliverables, and outcome-independent software/data pass-through only. No wallet, success fee, referral fee, or deal-value fee.',
      refusedActivities: [
        'external counterparty contact',
        'regulated recommendations',
        'legal, tax, accounting, appraisal, fairness, solvency, or investment opinions',
        'signing or filing documents',
        'custody, escrow, wires, or payment execution',
        'success-fee, referral-fee, or deal-value compensation',
      ],
      artifactDisclosure:
        'Prepared by smbX/Yulia from user-provided facts, deterministic models, and cited sources. For analysis and workflow support only; user and qualified professionals remain responsible for decisions and reliance.',
    },
    launchChecklist: [
      'Freeze canonical public discovery URLs with production APP_URL.',
      'Complete platform-specific security/privacy questionnaires using the common evidence pack.',
      'Confirm each platform accepts the local OAuth authorization-code/PKCE bridge; protected-resource metadata, authorization-server metadata, dynamic client registration, and token exchange are published.',
      'Prepare icon, screenshots, demo video, and short listing copy from universalListingCopy.',
      'Run definitive-surface and definitive-conformance suites before each marketplace submission.',
      'Have counsel approve THE LINE copy before public marketplace publication.',
      'Submit Claude connector first, then reuse the same evidence package for ChatGPT, Copilot, Salesforce, Gemini, and MCP directories.',
    ],
    submitNowBlockers: [
      'Remote OAuth authorization-code/PKCE and audience-bound MCP access tokens are implemented as the connector bridge; target-platform review may still require preregistered clients or a persistent external authorization server.',
      'Remote MCP inspector/scanner validation still needs to run against the deployed production URL.',
      'Platform-specific review forms, icon/screenshot/video assets, and counsel-approved public copy are not committed here yet.',
      'Live Stripe price IDs for the updated tiers still need to be mapped before broad marketplace launch.',
    ],
    toolCount: toolSurface.tools.length,
    generatedAt: new Date().toISOString(),
  };
}

function buildProofEndpoints(origin: string) {
  return {
    agentCard: `${origin}/.well-known/agent-card.json`,
    definitiveManifest: `${origin}/.well-known/definitive.json`,
    mcpManifest: `${origin}/.well-known/mcp`,
    serverCard: `${origin}/.well-known/mcp/server-card.json`,
    serverJson: `${origin}/server.json`,
    mcpEndpoint: `${origin}/mcp`,
    oauthProtectedResource: `${origin}/.well-known/oauth-protected-resource/mcp`,
    oauthAuthorizationServer: `${origin}/.well-known/oauth-authorization-server`,
    oauthRegister: `${origin}/oauth/register`,
    oauthAuthorize: `${origin}/oauth/authorize`,
    oauthToken: `${origin}/oauth/token`,
    schemaRegistry: `${origin}/api/definitive/schemas`,
    wellKnownSchemaRegistry: `${origin}/.well-known/definitive-schemas.json`,
    registryPackage: `${origin}/api/definitive/registry-package`,
    connectorDistribution: `${origin}/api/definitive/connector-distribution`,
    assistantDistributionReadiness: `${origin}/api/definitive/assistant-distribution-readiness`,
    openApiSpec: `${origin}/api/definitive/openapi.json`,
    gptActionsOpenApiSpec: `${origin}/api/definitive/gpt-actions/openapi.json`,
    enterpriseAllowLists: `${origin}/api/definitive/enterprise-allow-lists`,
    conformanceTool: `${origin}/api/definitive/tools/call#validate_conformance`,
    terms: `${origin}/legal/terms`,
    privacy: `${origin}/legal/privacy`,
  };
}

function buildCommonAssets(origin: string) {
  const proof = buildProofEndpoints(origin);
  return {
    requiredUrls: [
      proof.agentCard,
      proof.definitiveManifest,
      proof.mcpManifest,
      proof.serverCard,
      proof.serverJson,
      proof.mcpEndpoint,
      proof.oauthProtectedResource,
      proof.oauthAuthorizationServer,
      proof.schemaRegistry,
      proof.registryPackage,
      proof.connectorDistribution,
      proof.assistantDistributionReadiness,
      proof.openApiSpec,
      proof.gptActionsOpenApiSpec,
      proof.terms,
      proof.privacy,
    ],
    evidence: {
      specVersion: DEFINITIVE_SPEC_VERSION,
      methodologyVersion: DEFINITIVE_METHODOLOGY_VERSION,
      deterministicOutputs: true,
      structuredOutputs: true,
      outputSchemas: true,
      citationProvenance: true,
      auditPackets: true,
      noSuccessFees: true,
      noReferralCompensation: true,
      noDealValueFees: true,
      noWallet: true,
    },
    submissionAssets: [
      'listing name',
      'short description',
      'long description',
      'semantic keywords',
      'server-card URL',
      'server.json URL',
      'remote MCP Streamable HTTP URL',
      'well-known MCP URL',
      'OpenAPI GPT Actions URL',
      'focused GPT Actions facade URL',
      'schema registry URL',
      'terms URL',
      'privacy URL',
      'THE LINE declaration',
      'security and data-use questionnaire',
      'icon',
      'screenshots',
      'demo video',
    ],
  };
}

function platformPackage(
  args: {
    surfaceId: string;
    label: string;
    priority: number;
    launchLane: string;
    buyer: string;
    posture: string;
    submissionType: string;
    distributionGoal: string;
  },
  origin: string,
  commonAssets: ReturnType<typeof buildCommonAssets>,
) {
  const proof = buildProofEndpoints(origin);
  return {
    ...args,
    endpoints: {
      serverCard: proof.serverCard,
      serverJson: proof.serverJson,
      mcpEndpoint: proof.mcpEndpoint,
      discoveryManifest: proof.mcpManifest,
      schemaRegistry: proof.schemaRegistry,
      registryPackage: proof.registryPackage,
      connectorDistribution: proof.connectorDistribution,
      assistantDistributionReadiness: proof.assistantDistributionReadiness,
      openApiSpec: proof.openApiSpec,
      gptActionsOpenApiSpec: proof.gptActionsOpenApiSpec,
      toolCall: `${origin}/api/definitive/tools/call`,
    },
    authPosture: 'Public discovery and MCP initialize/tools-list; execution requires scoped bearer token and governed tool contract.',
    dataPosture:
      'No raw corpus writes without data-rights grant; source files remain user-controlled and structured outputs carry provenance.',
    linePosture:
      'Analysis -> options -> implications -> user decides. External transmission, regulated advice, and close authority remain outside agent execution.',
    assets: commonAssets.submissionAssets,
  };
}
