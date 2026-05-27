import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import { sql } from '../db.js';
import { signDefinitiveAgentToken } from '../middleware/auth.js';
import { normalizeScopeClaim } from './definitiveAgentTokenScope.js';

const DEFAULT_OAUTH_SCOPES = ['capability:read', 'methodology:read', 'deal-state:read'];
const ACCESS_TOKEN_TTL_SECONDS = 60 * 60;
const AUTH_CODE_TTL_MINUTES = 5;

const SELF_SERVE_OAUTH_SCOPES = new Set([
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

export interface DefinitiveOAuthRequestInput {
  response_type?: unknown;
  client_id?: unknown;
  redirect_uri?: unknown;
  scope?: unknown;
  state?: unknown;
  code_challenge?: unknown;
  code_challenge_method?: unknown;
  resource?: unknown;
}

interface DefinitiveOAuthClientRecord {
  client_id: string;
  redirect_uris: unknown;
  token_endpoint_auth_method: string;
  client_secret?: string | null;
  staticClient?: boolean;
}

function normalizeBaseUrl(baseUrl?: string) {
  return (baseUrl || process.env.APP_URL || 'http://127.0.0.1:3000').replace(/\/+$/, '');
}

export function renderDefinitiveOAuthAuthorizePage(input: DefinitiveOAuthRequestInput, baseUrl?: string) {
  const origin = normalizeBaseUrl(baseUrl);
  const params = sanitizeAuthorizationInput(input, origin);
  const requestJson = JSON.stringify(params).replace(/</g, '\\u003c');
  const requestedScopes = normalizeScopeClaim(params.scope).join(' ') || DEFAULT_OAUTH_SCOPES.join(' ');
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Authorize smbX Connector</title>
  <style>
    body{margin:0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#f7f8fb;color:#172033}
    main{max-width:680px;margin:0 auto;padding:48px 20px}
    section{background:#fff;border:1px solid #d9deea;border-radius:12px;padding:28px;box-shadow:0 16px 40px rgba(23,32,51,.08)}
    h1{font-size:24px;line-height:1.2;margin:0 0 12px}
    p{line-height:1.55;color:#4d5870}
    code{background:#eef2f8;border-radius:6px;padding:2px 6px}
    button,a.button{appearance:none;border:0;border-radius:8px;background:#2e5c8a;color:#fff;font-weight:700;padding:12px 16px;text-decoration:none;display:inline-flex;cursor:pointer}
    .row{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}
    .muted{font-size:13px;color:#66708a}
    .error{color:#8a1f2d;font-weight:700}
  </style>
</head>
<body>
  <main>
    <section>
      <h1>Authorize smbX DEFINITIVE</h1>
      <p>This connector is requesting scoped access to the smbX Deal OS resource <code>${escapeHtml(params.resource || `${origin}/mcp`)}</code>.</p>
      <p class="muted">Requested scopes: <code>${escapeHtml(requestedScopes)}</code></p>
      <p class="muted">smbX computes, cites, packages, and routes. It does not advise, negotiate, represent, move money, or take transaction-based compensation.</p>
      <div id="status" class="muted">Checking your signed-in smbX session...</div>
      <div class="row">
        <button id="authorize" type="button" disabled>Authorize connector</button>
        <a class="button" href="/login">Sign in to smbX</a>
      </div>
    </section>
  </main>
  <script>
    const request = ${requestJson};
    const token = localStorage.getItem('smbx_token');
    const statusEl = document.getElementById('status');
    const button = document.getElementById('authorize');
    if (!token) {
      statusEl.textContent = 'Sign in to smbX in this browser, then return to this authorization screen.';
    } else {
      statusEl.textContent = 'Ready to authorize with your signed-in smbX session.';
      button.disabled = false;
    }
    button.addEventListener('click', async () => {
      button.disabled = true;
      statusEl.textContent = 'Authorizing...';
      const response = await fetch('/oauth/authorize/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify(request),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || !body.redirectTo) {
        statusEl.innerHTML = '<span class="error">' + (body.error_description || body.error || 'Authorization failed') + '</span>';
        button.disabled = false;
        return;
      }
      window.location.assign(body.redirectTo);
    });
  </script>
</body>
</html>`;
}

export async function registerDefinitiveOAuthClient(input: Record<string, any>, baseUrl?: string) {
  const redirectUris = Array.isArray(input.redirect_uris) ? input.redirect_uris.map(String) : [];
  const validRedirectUris = redirectUris.filter(isAllowedRedirectUri);
  if (!validRedirectUris.length || validRedirectUris.length !== redirectUris.length) {
    return oauthError(400, 'invalid_redirect_uri', 'redirect_uris must contain valid HTTPS or localhost callback URLs.');
  }

  const tokenEndpointAuthMethod = typeof input.token_endpoint_auth_method === 'string'
    ? input.token_endpoint_auth_method
    : 'none';
  if (tokenEndpointAuthMethod !== 'none') {
    return oauthError(400, 'invalid_client_metadata', 'Only public PKCE clients with token_endpoint_auth_method="none" are supported for the MCP bridge.');
  }

  const clientId = `smbx_mcp_${randomUUID()}`;
  const clientName = typeof input.client_name === 'string' ? input.client_name.slice(0, 160) : 'MCP Client';
  const clientUri = typeof input.client_uri === 'string' && isHttpsUrl(input.client_uri) ? input.client_uri : null;
  const logoUri = typeof input.logo_uri === 'string' && isHttpsUrl(input.logo_uri) ? input.logo_uri : null;

  await sql`
    INSERT INTO definitive_oauth_clients (
      client_id,
      client_name,
      client_uri,
      logo_uri,
      redirect_uris,
      grant_types,
      response_types,
      token_endpoint_auth_method
    )
    VALUES (
      ${clientId},
      ${clientName},
      ${clientUri},
      ${logoUri},
      ${JSON.stringify(validRedirectUris)}::jsonb,
      ${JSON.stringify(['authorization_code'])}::jsonb,
      ${JSON.stringify(['code'])}::jsonb,
      ${tokenEndpointAuthMethod}
    )
  `;

  return {
    status: 201,
    body: {
      client_id: clientId,
      client_id_issued_at: Math.floor(Date.now() / 1000),
      client_name: clientName,
      redirect_uris: validRedirectUris,
      grant_types: ['authorization_code'],
      response_types: ['code'],
      token_endpoint_auth_method: tokenEndpointAuthMethod,
      ...(clientUri ? { client_uri: clientUri } : {}),
      ...(logoUri ? { logo_uri: logoUri } : {}),
    },
  };
}

export async function confirmDefinitiveOAuthAuthorization(userId: number, input: DefinitiveOAuthRequestInput, baseUrl?: string) {
  const origin = normalizeBaseUrl(baseUrl);
  const validation = await validateAuthorizationRequest(input, origin);
  if (!validation.ok) return validation;

  const params = validation.params as {
    client_id: string;
    redirect_uri: string;
    resource: string;
    scope?: string;
    state?: string;
    code_challenge?: string;
    code_challenge_method?: string;
  };
  const scopes = resolveRequestedScopes(params.scope);
  const unsupportedScopes = scopes.filter(scope => !SELF_SERVE_OAUTH_SCOPES.has(scope));
  if (unsupportedScopes.length) {
    return oauthError(400, 'invalid_scope', 'Requested scopes are not available for self-serve connector authorization.', {
      unsupportedScopes,
      supportedScopes: [...SELF_SERVE_OAUTH_SCOPES].sort(),
    });
  }

  const code = randomUUID();
  const expiresAt = new Date(Date.now() + AUTH_CODE_TTL_MINUTES * 60 * 1000);
  await sql`
    INSERT INTO definitive_oauth_authorization_codes (
      code,
      user_id,
      client_id,
      redirect_uri,
      resource,
      scopes,
      code_challenge,
      code_challenge_method,
      agent_platform_id,
      mandate_id,
      expires_at
    )
    VALUES (
      ${code},
      ${userId},
      ${params.client_id},
      ${params.redirect_uri},
      ${params.resource},
      ${scopes},
      ${params.code_challenge || ''},
      ${params.code_challenge ? 'S256' : 'none'},
      ${`oauth:${params.client_id}`},
      ${`mandate:oauth:${userId}:${params.client_id}`},
      ${expiresAt}
    )
  `;

  const redirect = new URL(params.redirect_uri);
  redirect.searchParams.set('code', code);
  if (params.state) redirect.searchParams.set('state', params.state);
  redirect.searchParams.set('iss', origin);
  return {
    status: 200,
    body: {
      ok: true,
      redirectTo: redirect.toString(),
      expiresAt: expiresAt.toISOString(),
    },
  };
}

export async function exchangeDefinitiveOAuthCode(input: Record<string, any>, baseUrl?: string) {
  const origin = normalizeBaseUrl(baseUrl);
  const grantType = readString(input.grant_type);
  if (grantType !== 'authorization_code') {
    return oauthError(400, 'unsupported_grant_type', 'Only authorization_code is supported.');
  }
  const code = readString(input.code);
  const clientId = readString(input.client_id);
  const redirectUri = readString(input.redirect_uri);
  const resource = normalizeResource(readString(input.resource) || `${origin}/mcp`);
  const codeVerifier = readString(input.code_verifier);
  if (!code || !clientId || !redirectUri || !resource) {
    return oauthError(400, 'invalid_request', 'code, client_id, redirect_uri, and resource are required.');
  }

  const client = await findOAuthClient(clientId);
  if (!client) return oauthError(400, 'invalid_client', 'Unknown OAuth client.');
  const clientAuth = validateTokenClientAuth(client, input);
  if (!clientAuth.ok) return clientAuth;

  const [stored] = await sql`
    SELECT *
    FROM definitive_oauth_authorization_codes
    WHERE code = ${code}
      AND consumed_at IS NULL
      AND expires_at > NOW()
    LIMIT 1
  `;
  if (!stored) return oauthError(400, 'invalid_grant', 'Authorization code is invalid, expired, or already used.');
  if (stored.client_id !== clientId || stored.redirect_uri !== redirectUri || normalizeResource(stored.resource) !== resource) {
    return oauthError(400, 'invalid_grant', 'Authorization code binding does not match this token request.');
  }
  const storedChallenge = readString(stored.code_challenge);
  if (storedChallenge) {
    if (!codeVerifier) return oauthError(400, 'invalid_request', 'code_verifier is required for PKCE authorization codes.');
    if (!verifyPkce(storedChallenge, codeVerifier)) {
      return oauthError(400, 'invalid_grant', 'PKCE verification failed.');
    }
  }

  const [consumed] = await sql`
    UPDATE definitive_oauth_authorization_codes
    SET consumed_at = NOW()
    WHERE code = ${code}
      AND consumed_at IS NULL
      AND expires_at > NOW()
    RETURNING *
  `;
  if (!consumed) return oauthError(400, 'invalid_grant', 'Authorization code is invalid, expired, or already used.');

  const scopes = Array.isArray(consumed.scopes) ? consumed.scopes.map(String) : DEFAULT_OAUTH_SCOPES;
  const accessToken = signDefinitiveAgentToken({
    userId: Number(consumed.user_id),
    scopes,
    agentId: `oauth-agent:${clientId}`,
    agentPlatformId: consumed.agent_platform_id || `oauth:${clientId}`,
    mandateId: consumed.mandate_id || `mandate:oauth:${consumed.user_id}:${clientId}`,
    beneficialCustomerId: Number(consumed.user_id),
    audience: resource,
    issuer: origin,
    clientId,
    expiresInSeconds: ACCESS_TOKEN_TTL_SECONDS,
  });

  return {
    status: 200,
    body: {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: ACCESS_TOKEN_TTL_SECONDS,
      scope: scopes.join(' '),
      resource,
    },
  };
}

function sanitizeAuthorizationInput(input: DefinitiveOAuthRequestInput, origin: string) {
  return {
    response_type: readString(input.response_type) || 'code',
    client_id: readString(input.client_id),
    redirect_uri: readString(input.redirect_uri),
    scope: readString(input.scope) || DEFAULT_OAUTH_SCOPES.join(' '),
    state: readString(input.state),
    code_challenge: readString(input.code_challenge),
    code_challenge_method: readString(input.code_challenge_method),
    resource: normalizeResource(readString(input.resource) || `${origin}/mcp`),
  };
}

async function validateAuthorizationRequest(input: DefinitiveOAuthRequestInput, origin: string) {
  const params = sanitizeAuthorizationInput(input, origin);
  if (params.response_type !== 'code') return oauthError(400, 'unsupported_response_type', 'Only response_type=code is supported.');
  if (!params.client_id || !params.redirect_uri) {
    return oauthError(400, 'invalid_request', 'client_id and redirect_uri are required.');
  }
  if (params.resource !== `${origin}/mcp`) return oauthError(400, 'invalid_target', 'resource must match the canonical MCP resource URI.', { expectedResource: `${origin}/mcp` });

  const client = await findOAuthClient(params.client_id);
  if (!client) return oauthError(400, 'invalid_client', 'Unknown OAuth client. Register the client first at /oauth/register.');
  if (!isRedirectUriAllowedForClient(client, params.redirect_uri)) return oauthError(400, 'invalid_redirect_uri', 'redirect_uri is not registered for this client.');

  if (client.token_endpoint_auth_method === 'none') {
    if (!params.code_challenge) {
      return oauthError(400, 'invalid_request', 'code_challenge is required for public PKCE clients.');
    }
    if (params.code_challenge_method !== 'S256') return oauthError(400, 'invalid_request', 'Only PKCE S256 is supported for public clients.');
  } else if (params.code_challenge && params.code_challenge_method !== 'S256') {
    return oauthError(400, 'invalid_request', 'Only PKCE S256 is supported when code_challenge is supplied.');
  }

  return { ok: true as const, params };
}

async function findOAuthClient(clientId: string): Promise<DefinitiveOAuthClientRecord | null> {
  const staticClient = readStaticGptActionsOAuthClient(clientId);
  if (staticClient) return staticClient;

  const [client] = await sql`
    SELECT client_id, redirect_uris, token_endpoint_auth_method
    FROM definitive_oauth_clients
    WHERE client_id = ${clientId}
    LIMIT 1
  `;
  return client ? {
    client_id: String(client.client_id),
    redirect_uris: client.redirect_uris,
    token_endpoint_auth_method: String(client.token_endpoint_auth_method || 'none'),
  } : null;
}

function readStaticGptActionsOAuthClient(clientId: string): DefinitiveOAuthClientRecord | null {
  const configuredClientId = process.env.SMBX_GPT_ACTIONS_CLIENT_ID?.trim();
  const configuredSecret = process.env.SMBX_GPT_ACTIONS_CLIENT_SECRET?.trim();
  if (!configuredClientId || !configuredSecret || clientId !== configuredClientId) return null;
  return {
    client_id: configuredClientId,
    redirect_uris: parseCsv(process.env.SMBX_GPT_ACTIONS_REDIRECT_URIS),
    token_endpoint_auth_method: 'client_secret_post',
    client_secret: configuredSecret,
    staticClient: true,
  };
}

function validateTokenClientAuth(client: DefinitiveOAuthClientRecord, input: Record<string, any>) {
  if (client.token_endpoint_auth_method === 'none') return { ok: true as const };

  const suppliedSecret = readString(input.client_secret);
  if (!suppliedSecret || !client.client_secret || !constantTimeEquals(suppliedSecret, client.client_secret)) {
    return oauthError(401, 'invalid_client', 'Client authentication failed.');
  }
  return { ok: true as const };
}

function resolveRequestedScopes(value: string | undefined) {
  const requested = normalizeScopeClaim(value);
  return requested.length ? requested : DEFAULT_OAUTH_SCOPES;
}

function verifyPkce(expectedChallenge: string, verifier: string) {
  const actual = createHash('sha256').update(verifier).digest('base64url');
  return actual === expectedChallenge;
}

function normalizeResource(value: string | undefined) {
  return value ? value.replace(/\/+$/, '') : '';
}

function readStringArray(value: unknown) {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function parseCsv(value: string | undefined) {
  return String(value || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

function isRedirectUriAllowedForClient(client: DefinitiveOAuthClientRecord, redirectUri: string) {
  const redirectUris = readStringArray(client.redirect_uris);
  if (redirectUris.includes(redirectUri)) return true;
  return Boolean(client.staticClient && isAllowedChatGptRedirectUri(redirectUri));
}

function isAllowedChatGptRedirectUri(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) return true;
    if (url.protocol !== 'https:') return false;
    if (!['chat.openai.com', 'chatgpt.com'].includes(url.hostname)) return false;
    return /^\/aip\/[^/]+\/oauth\/callback$/.test(url.pathname);
  } catch {
    return false;
  }
}

function constantTimeEquals(left: string, right: string) {
  const leftHash = createHash('sha256').update(left).digest();
  const rightHash = createHash('sha256').update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
}

function isAllowedRedirectUri(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol === 'https:') return true;
    if (url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) return true;
    return false;
  } catch {
    return false;
  }
}

function isHttpsUrl(value: string) {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

function readString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function oauthError(status: number, error: string, errorDescription: string, extra: Record<string, any> = {}) {
  return {
    ok: false as const,
    status,
    body: {
      error,
      error_description: errorDescription,
      ...extra,
    },
  };
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char] || char));
}
