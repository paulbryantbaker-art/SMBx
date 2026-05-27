import { DEFINITIVE_METHODOLOGY_VERSION, DEFINITIVE_SPEC_VERSION } from '../constants/definitive.js';
import { buildDefinitiveConnectorDistributionPackage } from './definitiveConnectorDistribution.js';
import { buildDefinitiveMcpServerCard, buildDefinitiveMcpWellKnownManifest } from './definitiveMcpDiscovery.js';
import { listDefinitiveMcpTools } from './definitiveMcp.js';
import { isPersistentStorageConfigured } from './storageService.js';

const READINESS_VERSION = 'DEFINITIVE.assistant-distribution-readiness.v0.1';
const SERVER_ID = 'smbx-ai/diligence';
const SERVER_TITLE = 'smbX DEFINITIVE Diligence Substrate';

function normalizeBaseUrl(baseUrl?: string) {
  return (baseUrl || process.env.APP_URL || 'http://127.0.0.1:3000').replace(/\/+$/, '');
}

export function buildDefinitiveAssistantDistributionReadiness(baseUrl?: string) {
  const origin = normalizeBaseUrl(baseUrl);
  const proofEndpoints = buildProofEndpoints(origin);
  const toolSurface = listDefinitiveMcpTools();
  const serverCard = buildDefinitiveMcpServerCard(origin);
  const manifest = buildDefinitiveMcpWellKnownManifest(origin);
  const connectorDistribution = buildDefinitiveConnectorDistributionPackage(origin);
  const environment = buildRevenueEnvironmentChecks(origin);
  const assets = buildManualAssetChecks();
  const protocol = buildProtocolReadiness(origin);
  const platforms = buildPlatformReadiness(origin, proofEndpoints, environment, assets, protocol);
  const launchBlockers = unique([
    ...environment.required.filter(check => check.status === 'blocked').map(check => check.blocker),
    ...protocol.blockers,
    ...assets.required.filter(check => check.status === 'manual').map(check => check.blocker),
  ]);

  return {
    schema: READINESS_VERSION,
    server: {
      id: SERVER_ID,
      title: SERVER_TITLE,
      origin,
      publicHttps: isPublicHttps(origin),
      productionUrlConfigured: Boolean(process.env.APP_URL),
    },
    strategy: {
      definition:
        'Assistant distribution means Claude Connector, ChatGPT GPT Actions, ChatGPT Apps/connector, MCP directories, official MCP registry, and enterprise allow-list channels.',
      fastestRevenueLane: 'chatgpt_gpt_actions',
      mostStrategicLane: 'claude_custom_connector_and_chatgpt_apps_sdk',
      substratePriority:
        'Remote MCP transport is live; finish platform auth review, scanner QA, and marketplace assets before broad Claude Connector or ChatGPT Apps submission.',
      launchOrder: [
        'chatgpt_gpt_actions_private_pilot',
        'public_checkout_and_app_upgrade_gate',
        'remote_mcp_streamable_http_endpoint',
        'claude_custom_connector_beta',
        'chatgpt_apps_sdk_internal_app',
        'mcp_directory_profiles',
        'official_mcp_registry_server_json',
        'connector_directory_submissions',
      ],
    },
    proofEndpoints,
    surfaces: {
      remoteMcp: {
        status: 'ready_streamable_http_jwt_bearer',
        url: proofEndpoints.mcpEndpoint,
        serverJson: proofEndpoints.serverJson,
        oauthProtectedResource: proofEndpoints.oauthProtectedResource,
        note: 'POST /mcp supports initialize, ping, tools/list, and authenticated tools/call. Auth failures return a WWW-Authenticate challenge pointing at OAuth protected-resource metadata. GET returns 405 because server-initiated SSE is not enabled.',
      },
      oauthProtectedResource: {
        status: 'ready_oauth_pkce_bridge',
        url: proofEndpoints.oauthProtectedResource,
        authorizationServerMetadata: proofEndpoints.oauthAuthorizationServer,
        authorizationEndpoint: `${origin}/oauth/authorize`,
        tokenEndpoint: `${origin}/oauth/token`,
        dynamicClientRegistration: `${origin}/oauth/register`,
      },
      serverCard: {
        status: 'ready',
        url: proofEndpoints.serverCard,
        toolCount: serverCard.tools.length,
      },
      wellKnownMcp: {
        status: 'ready',
        url: proofEndpoints.mcpManifest,
        endpointCount: manifest.endpoints.length,
      },
      openApiActions: {
        status: 'ready_for_private_gpt_action_pilot',
        url: proofEndpoints.openApiSpec,
        gptActionsFacade: proofEndpoints.gptActionsOpenApiSpec,
        note: 'Generic OpenAPI and focused GPT Actions facade are ready; private GPT OAuth testing uses a preconfigured confidential client.',
      },
      connectorDistribution: {
        status: connectorDistribution.status,
        url: proofEndpoints.connectorDistribution,
        launchPriority: connectorDistribution.launchPriority,
      },
    },
    platformReadiness: platforms,
    revenueChecks: environment,
    manualAssetChecks: assets,
    protocolReadiness: protocol,
    toolSurface: {
      status: toolSurface.status,
      count: toolSurface.tools.length,
      writeToolsRequireApproval: toolSurface.tools.filter(tool => tool.annotations?.destructiveHint || !tool.annotations?.readOnlyHint).map(tool => tool.name),
    },
    submitNow: {
      gptActionPrivatePilot: platforms.find(platform => platform.id === 'chatgpt_gpt_actions')?.status === 'ready_for_private_oauth_test',
      claudeCustomConnectorBetaSetup: true,
      claudeCustomConnectorDirectorySubmission: false,
      chatgptAppsSdkDirectorySubmission: false,
      mcpDirectoryProfileOnly: true,
      officialMcpRegistry: false,
    },
    blockers: launchBlockers,
    noGoClaims: [
      'Do not claim official MCP Registry submission complete until /mcp is publicly deployed, server.json is validated, and scanner/inspector checks pass.',
      'Do not claim Claude Connector marketplace approval until the remote MCP endpoint is publicly reachable and platform auth review is complete.',
      'Do not claim ChatGPT App directory readiness until Apps SDK packaging, privacy, and review assets are complete.',
      'Do not market Yulia as legal, tax, investment, brokerage, accounting, appraisal, escrow, or negotiation advice.',
    ],
    methodology: {
      specVersion: DEFINITIVE_SPEC_VERSION,
      methodologyVersion: DEFINITIVE_METHODOLOGY_VERSION,
    },
    generatedAt: new Date().toISOString(),
  };
}

function buildProofEndpoints(origin: string) {
  return {
    homepage: origin,
    agentCard: `${origin}/.well-known/agent-card.json`,
    definitiveManifest: `${origin}/.well-known/definitive.json`,
    mcpManifest: `${origin}/.well-known/mcp`,
    serverCard: `${origin}/.well-known/mcp/server-card.json`,
    serverJson: `${origin}/server.json`,
    mcpEndpoint: `${origin}/mcp`,
    oauthProtectedResource: `${origin}/.well-known/oauth-protected-resource/mcp`,
    oauthAuthorizationServer: `${origin}/.well-known/oauth-authorization-server`,
    oauthOpenIdConfiguration: `${origin}/.well-known/openid-configuration`,
    oauthRegister: `${origin}/oauth/register`,
    oauthAuthorize: `${origin}/oauth/authorize`,
    oauthToken: `${origin}/oauth/token`,
    schemaRegistry: `${origin}/api/definitive/schemas`,
    openApiSpec: `${origin}/api/definitive/openapi.json`,
    gptActionsOpenApiSpec: `${origin}/api/definitive/gpt-actions/openapi.json`,
    registryPackage: `${origin}/api/definitive/registry-package`,
    connectorDistribution: `${origin}/api/definitive/connector-distribution`,
    assistantDistributionReadiness: `${origin}/api/definitive/assistant-distribution-readiness`,
    legacyMcpLaunchReadiness: `${origin}/api/definitive/mcp-launch-readiness`,
    toolsList: `${origin}/api/definitive/tools/list`,
    toolCall: `${origin}/api/definitive/tools/call`,
    agentTokens: `${origin}/api/definitive/agent-tokens`,
    terms: `${origin}/legal/terms`,
    privacy: `${origin}/legal/privacy`,
  };
}

function buildRevenueEnvironmentChecks(origin: string) {
  const required = [
    envCheck('app_url', 'APP_URL points at a public HTTPS production origin', isPublicHttps(origin) && Boolean(process.env.APP_URL), 'Set APP_URL=https://smbx.ai before publishing assistant listings.'),
    envCheck('stripe_secret_key', 'Stripe live secret key configured', looksLiveStripeSecretKey(process.env.STRIPE_SECRET_KEY), 'Configure STRIPE_SECRET_KEY with the live-mode key before taking paid traffic.'),
    envCheck('stripe_publishable_key', 'Stripe live publishable key configured', looksLiveStripePublishableKey(process.env.STRIPE_PUBLISHABLE_KEY), 'Configure STRIPE_PUBLISHABLE_KEY with the live-mode key for checkout and upgrade UI.'),
    envCheck('stripe_webhook_secret', 'Stripe webhook secret configured', looksConfigured(process.env.STRIPE_WEBHOOK_SECRET), 'Configure STRIPE_WEBHOOK_SECRET and verify checkout/subscription webhooks.'),
    envCheck('stripe_price_solo', 'Solo price ID configured', looksConfigured(process.env.STRIPE_PRICE_SOLO), 'Configure STRIPE_PRICE_SOLO for the $79/month Solo plan.'),
    envCheck('stripe_price_pro', 'Pro price ID configured', looksConfigured(process.env.STRIPE_PRICE_PRO), 'Configure STRIPE_PRICE_PRO for the $199/month Pro plan.'),
    envCheck('stripe_price_team', 'Team price ID configured', looksConfigured(process.env.STRIPE_PRICE_TEAM), 'Configure STRIPE_PRICE_TEAM for the $499/month Team plan.'),
    envCheck('persistent_file_storage', 'Persistent file storage configured', isPersistentStorageConfigured(), 'Configure S3/R2/B2-compatible storage, or mount a persistent Railway volume at /data/uploads.'),
    envCheck('test_mode_false', 'TEST_MODE explicitly disabled for production', process.env.TEST_MODE === 'false', 'Set TEST_MODE=false in production before sending marketplace traffic.'),
  ];
  const optional = [
    envCheck('stripe_price_enterprise', 'Enterprise self-serve price ID configured', looksConfigured(process.env.STRIPE_PRICE_ENTERPRISE), 'Optional if Enterprise remains sales-assisted/manual at launch.'),
  ];

  return {
    status: required.every(check => check.status === 'ready') ? 'ready' : 'blocked',
    required,
    optional,
    pricingModel: 'Free / $79 Solo / $199 Pro / $499 Team / $2,500+ Enterprise monthly subscriptions; no wallet, referral fee, success fee, or deal-value fee.',
  };
}

function buildManualAssetChecks() {
  const required = [
    manualCheck('counsel_public_copy', 'Counsel-approved THE LINE public copy', 'Approve listing copy, tool descriptions, and GPT/connector instructions against THE LINE.'),
    manualCheck('privacy_review', 'Privacy and data-retention review', 'Confirm connector/GPT data handling, OAuth scopes, logs, retention, and deletion language.'),
    manualCheck('marketplace_icon', 'Marketplace icon', 'Prepare square icon assets for Claude, ChatGPT, MCP directories, and enterprise catalogs.'),
    manualCheck('screenshots', 'Screenshots', 'Prepare assistant workflow screenshots showing DealState, model outputs, data room, and audit packet views.'),
    manualCheck('demo_video', 'Short demo video', 'Record a short connector/GPT demo using safe sample deal data.'),
  ];

  return {
    status: 'manual_review_required',
    required,
  };
}

function buildProtocolReadiness(origin: string) {
  const hasPublicDiscovery = isPublicHttps(origin);
  return {
    status: 'ready_streamable_http_jwt_bearer',
    currentTransport: 'Streamable HTTP MCP endpoint at /mcp with JWT bearer and scoped DEFINITIVE agent tokens',
    targetTransport: 'Streamable HTTP MCP endpoint at /mcp, with SSE fallback only if a target platform requires it',
    requiredEndpoint: `${origin}/mcp`,
    currentEndpoint: `${origin}/mcp`,
    protectedResourceMetadata: `${origin}/.well-known/oauth-protected-resource/mcp`,
    authorizationServerMetadata: `${origin}/.well-known/oauth-authorization-server`,
    serverJson: `${origin}/server.json`,
    blockers: ['remote_mcp_inspector_pass', 'platform_auth_review', 'persistent_oauth_client_registry_if_required_by_target_platform'],
    readyPieces: [
      hasPublicDiscovery ? 'public_https_origin' : 'public_https_origin_pending',
      'streamable_http_mcp_endpoint',
      'oauth_protected_resource_metadata',
      'oauth_authorization_server_metadata',
      'oauth_dynamic_client_registration',
      'oauth_authorization_code_pkce_exchange',
      'oauth_confidential_client_exchange_for_gpt_actions',
      'audience_bound_mcp_access_tokens',
      'www_authenticate_resource_metadata_challenge',
      'server_json_with_remotes',
      'server_card',
      'well_known_mcp_manifest',
      'tool_schemas',
      'openapi_action_spec',
      'focused_gpt_actions_openapi_spec',
      'connector_distribution_package',
    ],
  };
}

function buildPlatformReadiness(
  origin: string,
  proof: ReturnType<typeof buildProofEndpoints>,
  environment: ReturnType<typeof buildRevenueEnvironmentChecks>,
  assets: ReturnType<typeof buildManualAssetChecks>,
  protocol: ReturnType<typeof buildProtocolReadiness>,
) {
  const moneyReady = environment.status === 'ready';
  const manualReady = assets.required.every(check => check.status === 'ready');
  const gptActionsAuthReady = looksConfigured(process.env.SMBX_GPT_ACTIONS_CLIENT_ID)
    && looksConfigured(process.env.SMBX_GPT_ACTIONS_CLIENT_SECRET);
  return [
    {
      id: 'chatgpt_gpt_actions',
      label: 'ChatGPT GPT Actions',
      priority: 1,
      status: gptActionsAuthReady ? 'ready_for_private_oauth_test' : 'auth_config_required',
      useNow:
        'Create a private GPT with OAuth action auth, import /api/definitive/gpt-actions/openapi.json, and use the configured SMBX_GPT_ACTIONS_CLIENT_ID/SECRET for private testing.',
      requiredUrls: [proof.gptActionsOpenApiSpec, proof.openApiSpec, proof.privacy, proof.terms],
      blockers: [
        ...(gptActionsAuthReady ? [] : ['SMBX_GPT_ACTIONS_CLIENT_ID', 'SMBX_GPT_ACTIONS_CLIENT_SECRET']),
        'private_gpt_preview_qa',
      ],
      paidLaunchBlockers: moneyReady ? [] : environment.required.filter(check => check.status === 'blocked').map(check => check.id),
      whyFirst: 'Fastest path to a paid assistant entry point because GPT Actions can use OpenAPI while connector directory review proceeds.',
    },
    {
      id: 'claude_custom_connector',
      label: 'Claude Custom Connector',
      priority: 2,
      useNow:
        'Use /mcp, server.json, the protected-resource metadata, and the server-card for connector beta setup; platform auth review is still required before broad marketplace claims.',
      requiredUrls: [`${origin}/mcp`, proof.oauthProtectedResource, proof.serverCard, proof.privacy, proof.terms],
      status: 'protocol_ready_auth_review_required',
      blockers: ['platform_auth_review', ...protocol.blockers],
      whySecond: 'Highest strategic fit for agentic M&A work once platform auth review and marketplace assets are complete.',
    },
    {
      id: 'chatgpt_apps_sdk',
      label: 'ChatGPT App / Connector',
      priority: 3,
      status: 'protocol_ready_package_pending',
      useNow:
        'Prepare Apps SDK package and UI only after the same remote MCP endpoint is stable; keep GPT Actions as the interim money path.',
      requiredUrls: [`${origin}/mcp`, proof.oauthProtectedResource, proof.openApiSpec, proof.privacy, proof.terms],
      blockers: ['apps_sdk_package', 'app_directory_review_assets', ...protocol.blockers],
      whyThird: 'Bigger distribution surface than GPT Actions, but requires app packaging and review.',
    },
    {
      id: 'mcp_directory_profiles',
      label: 'MCP directory profiles',
      priority: 4,
      status: manualReady ? 'protocol_ready_profile_ready' : 'protocol_ready_manual_assets_pending',
      useNow:
        'Submit profile/listing metadata where static server-card or GitHub/manual submissions are accepted; use /mcp as the Streamable HTTP remote endpoint.',
      requiredUrls: [proof.serverCard, proof.mcpManifest, proof.oauthProtectedResource, proof.schemaRegistry, proof.registryPackage],
      blockers: ['remote_mcp_inspector_pass', ...assets.required.map(check => check.id)],
      whyFourth: 'Good SEO and marketplace presence, but it should not be the first revenue dependency.',
    },
    {
      id: 'official_mcp_registry',
      label: 'Official MCP Registry',
      priority: 5,
      status: 'server_json_ready_inspector_pending',
      useNow:
        'Draft server.json after /mcp is live, then publish under a verified smbx.ai namespace.',
      requiredUrls: [`${origin}/mcp`, proof.oauthProtectedResource],
      blockers: ['remote_mcp_inspector_pass', ...protocol.blockers],
      whyFifth: 'Important credibility layer, but not the fastest path to first paid users.',
    },
  ];
}

function envCheck(id: string, label: string, ready: boolean, blocker: string) {
  return {
    id,
    label,
    status: ready ? 'ready' : 'blocked',
    configured: ready,
    blocker,
  };
}

function manualCheck(id: string, label: string, blocker: string) {
  return {
    id,
    label,
    status: 'manual',
    blocker,
  };
}

function isPublicHttps(origin: string) {
  return /^https:\/\//.test(origin) && !origin.includes('localhost') && !origin.includes('127.0.0.1');
}

function looksConfigured(value: string | undefined) {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  return !['price_...', 'sk_...', 'pk_...', 'whsec_...', 'changeme', 'test'].includes(trimmed);
}

function looksLiveStripeSecretKey(value: string | undefined) {
  const trimmed = value?.trim() || '';
  return looksConfigured(trimmed) && trimmed.startsWith('sk_live_');
}

function looksLiveStripePublishableKey(value: string | undefined) {
  const trimmed = value?.trim() || '';
  return looksConfigured(trimmed) && trimmed.startsWith('pk_live_');
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}
