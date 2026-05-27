import { DEFINITIVE_METHODOLOGY_VERSION, DEFINITIVE_SPEC_VERSION } from '../constants/definitive.js';
import { listDefinitiveMcpTools } from './definitiveMcp.js';

const SERVER_ID = 'smbx-ai/diligence';
const SERVER_TITLE = 'smbX DEFINITIVE Diligence Substrate';
const DEFAULT_MCP_SCOPES = ['capability:read', 'methodology:read', 'deal-state:read'];
const SELF_SERVE_OAUTH_SCOPE_ALLOWLIST = new Set([
  'capability:read',
  'methodology:read',
  'authority:read',
  'deal-state:read',
  'deal-state:write',
  'deal:classify',
  'deal:read',
  'deal-plan:read',
  'model-catalog:read',
  'model-stack:compose',
  'model:read',
  'model:execute',
  'studio:draft',
  'data-room:read',
  'completeness:read',
  'deal-package:read',
  'deal-package:compose',
  'deal-package:verify',
  'permutation:read',
  'audit:write',
  'pricing:read',
  'pass-through:read',
  'citation:read',
  'market-data:read',
  'conformance:read',
]);

function normalizeBaseUrl(baseUrl?: string) {
  return (baseUrl || process.env.APP_URL || 'http://127.0.0.1:3000').replace(/\/+$/, '');
}

export function buildDefinitiveMcpProtectedResourceMetadata(baseUrl?: string) {
  const origin = normalizeBaseUrl(baseUrl);
  const toolSurface = listDefinitiveMcpTools();
  const scopes = unique(toolSurface.tools.flatMap(tool => tool.requiredScopes))
    .filter(scope => SELF_SERVE_OAUTH_SCOPE_ALLOWLIST.has(scope))
    .sort();
  const authorizationServer = definitiveMcpAuthorizationServer(origin);

  return {
    resource: `${origin}/mcp`,
    authorization_servers: [authorizationServer],
    scopes_supported: scopes,
    bearer_methods_supported: ['header'],
    resource_name: SERVER_TITLE,
    resource_documentation: `${origin}/api/definitive/assistant-distribution-readiness`,
    resource_policy_uri: `${origin}/legal/privacy`,
    resource_tos_uri: `${origin}/legal/terms`,
    x_smbx: {
      serverId: SERVER_ID,
      specVersion: DEFINITIVE_SPEC_VERSION,
      methodologyVersion: DEFINITIVE_METHODOLOGY_VERSION,
      mcpEndpoint: `${origin}/mcp`,
      serverJson: `${origin}/server.json`,
      serverCard: `${origin}/.well-known/mcp/server-card.json`,
      discoveryManifest: `${origin}/.well-known/mcp`,
      authPosture: isDefinitiveMcpAuthorizationServerConfigured()
        ? 'external_oauth_authorization_server_configured'
        : 'local_oauth_authorization_code_pkce_bridge',
      productionAuthTarget: 'OAuth 2.1 + PKCE + audience-bound scoped tokens',
      currentBridge: 'Signed smbX user JWTs plus OAuth authorization-code/PKCE exchange into short-lived scoped DEFINITIVE agent bearer tokens.',
      lineDeclaration:
        'smbX is software and deterministic deal infrastructure. It does not advise, recommend, negotiate, represent, guarantee, move money, or take transaction-based compensation.',
    },
    generatedAt: new Date().toISOString(),
  };
}

export function buildDefinitiveMcpWwwAuthenticate(
  baseUrl?: string,
  scopes: string[] = DEFAULT_MCP_SCOPES,
  options: { error?: string; errorDescription?: string } = {},
) {
  const origin = normalizeBaseUrl(baseUrl);
  const params: Record<string, string> = {
    resource_metadata: `${origin}/.well-known/oauth-protected-resource/mcp`,
  };
  const normalizedScopes = unique(scopes.length ? scopes : DEFAULT_MCP_SCOPES);
  if (normalizedScopes.length) params.scope = normalizedScopes.join(' ');
  if (options.error) params.error = options.error;
  if (options.errorDescription) params.error_description = options.errorDescription;
  return `Bearer ${Object.entries(params).map(([key, value]) => `${key}="${quoteHeaderValue(value)}"`).join(', ')}`;
}

export function buildDefinitiveOAuthAuthorizationServerMetadata(baseUrl?: string) {
  const origin = normalizeBaseUrl(baseUrl);
  return {
    issuer: origin,
    authorization_endpoint: `${origin}/oauth/authorize`,
    token_endpoint: `${origin}/oauth/token`,
    registration_endpoint: `${origin}/oauth/register`,
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code'],
    code_challenge_methods_supported: ['S256'],
    token_endpoint_auth_methods_supported: ['none', 'client_secret_post', 'client_secret_basic'],
    scopes_supported: supportedOAuthScopes(),
    resource_indicators_supported: true,
    client_id_metadata_document_supported: false,
    service_documentation: `${origin}/api/definitive/assistant-distribution-readiness`,
    op_policy_uri: `${origin}/legal/privacy`,
    op_tos_uri: `${origin}/legal/terms`,
    x_smbx: {
      schema: 'DEFINITIVE.mcp-oauth-bridge.v0.1',
      specVersion: DEFINITIVE_SPEC_VERSION,
      methodologyVersion: DEFINITIVE_METHODOLOGY_VERSION,
      protectedResource: `${origin}/mcp`,
      tokenUse: 'definitive_agent',
      accessTokenTtlSeconds: 3600,
      authCodeTtlMinutes: 5,
      posture: 'authorization_code_pkce_bridge_for_remote_mcp_plus_confidential_gpt_actions_client',
      confidentialClientEnv: 'Set SMBX_GPT_ACTIONS_CLIENT_ID and SMBX_GPT_ACTIONS_CLIENT_SECRET for private ChatGPT GPT Actions OAuth testing.',
      lineDeclaration:
        'smbX is software and deterministic deal infrastructure. It does not advise, recommend, negotiate, represent, guarantee, move money, or take transaction-based compensation.',
    },
  };
}

export function listDefinitiveMcpRequiredScopes(toolName?: string) {
  const inventory = listDefinitiveMcpTools();
  if (toolName) {
    const tool = inventory.tools.find(item => item.name === toolName);
    if (tool?.requiredScopes?.length) return tool.requiredScopes;
  }
  return DEFAULT_MCP_SCOPES;
}

export function definitiveMcpAuthorizationServer(origin: string) {
  return (process.env.MCP_AUTHORIZATION_SERVER_URL || origin).replace(/\/+$/, '');
}

export function isDefinitiveMcpAuthorizationServerConfigured() {
  return Boolean(process.env.MCP_AUTHORIZATION_SERVER_URL?.trim());
}

function quoteHeaderValue(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function unique(values: string[]) {
  return [...new Set(values.map(value => value.trim()).filter(Boolean))];
}

function supportedOAuthScopes() {
  const toolScopes = listDefinitiveMcpTools().tools.flatMap(tool => tool.requiredScopes);
  return unique([...DEFAULT_MCP_SCOPES, ...toolScopes].filter(scope => SELF_SERVE_OAUTH_SCOPE_ALLOWLIST.has(scope))).sort();
}
