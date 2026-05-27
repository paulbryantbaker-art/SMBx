import { randomUUID } from 'node:crypto';
import {
  DEFINITIVE_METHODOLOGY_VERSION,
  DEFINITIVE_METHODOLOGY_URI,
  DEFINITIVE_SPEC_URI,
  DEFINITIVE_SPEC_VERSION,
} from '../constants/definitive.js';
import { executeDefinitiveMcpTool, listDefinitiveMcpTools } from './definitiveMcp.js';
import { persistDefinitiveDealStateCall } from './definitiveDealStatePersistence.js';
import { buildTokenScopedDefinitiveEnvelope } from './definitiveAgentTokenScope.js';
import {
  buildDefinitiveMcpWwwAuthenticate,
  listDefinitiveMcpRequiredScopes,
} from './definitiveMcpAuthMetadata.js';

export const DEFINITIVE_REMOTE_MCP_PROTOCOL_VERSION = '2025-11-25';
export const DEFINITIVE_REMOTE_MCP_SUPPORTED_PROTOCOLS = [
  DEFINITIVE_REMOTE_MCP_PROTOCOL_VERSION,
  '2025-06-18',
  '2025-03-26',
] as const;

const SERVER_NAME = 'smbx-ai/diligence';
const SERVER_TITLE = 'smbX DEFINITIVE Diligence Substrate';

export interface DefinitiveRemoteMcpAuthContext {
  userId?: number | null;
  claims?: Record<string, any> | null;
}

export interface DefinitiveRemoteMcpRequestContext {
  auth?: DefinitiveRemoteMcpAuthContext;
  headers?: Record<string, string | string[] | undefined>;
  origin?: string;
  persist?: boolean;
}

export interface DefinitiveRemoteMcpHttpResponse {
  status: number;
  headers?: Record<string, string>;
  body?: Record<string, any>;
}

interface JsonRpcRequest {
  jsonrpc?: unknown;
  id?: string | number | null;
  method?: unknown;
  params?: unknown;
}

export async function handleDefinitiveRemoteMcpPost(
  message: unknown,
  context: DefinitiveRemoteMcpRequestContext = {},
): Promise<DefinitiveRemoteMcpHttpResponse> {
  if (Array.isArray(message)) {
    return jsonRpcHttp(400, jsonRpcError(null, -32600, 'Invalid Request', 'MCP Streamable HTTP expects a single JSON-RPC message, not a batch.'));
  }
  if (!message || typeof message !== 'object') {
    return jsonRpcHttp(400, jsonRpcError(null, -32600, 'Invalid Request', 'Request body must be a JSON-RPC object.'));
  }

  const request = message as JsonRpcRequest;
  const id = normalizeJsonRpcId(request.id);
  const method = typeof request.method === 'string' ? request.method : '';
  const isNotification = request.id === undefined;
  const protocolVersion = negotiateProtocolVersion(readRequestedProtocolVersion(request, context.headers));

  if (request.jsonrpc !== '2.0' || !method) {
    return jsonRpcHttp(400, jsonRpcError(id, -32600, 'Invalid Request', 'JSON-RPC 2.0 requests must include jsonrpc="2.0" and method.'));
  }

  if (isNotification) {
    return handleNotification(method);
  }

  if (method === 'initialize') {
    return jsonRpcHttp(200, {
      jsonrpc: '2.0',
      id,
      result: buildInitializeResult(protocolVersion, context.origin),
    }, protocolVersion);
  }

  if (method === 'ping') {
    return jsonRpcHttp(200, { jsonrpc: '2.0', id, result: {} }, protocolVersion);
  }

  if (method === 'tools/list') {
    return jsonRpcHttp(200, {
      jsonrpc: '2.0',
      id,
      result: buildToolsListResult(request.params),
    }, protocolVersion);
  }

  if (method === 'tools/call') {
    return callTool(id, request.params, context, protocolVersion);
  }

  return jsonRpcHttp(404, jsonRpcError(id, -32601, 'Method not found', `Unsupported MCP method: ${method}`), protocolVersion);
}

export function buildDefinitiveMcpServerJson(baseUrl?: string) {
  const origin = normalizeBaseUrl(baseUrl);
  const tools = listDefinitiveMcpTools();
  return {
    $schema: 'https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json',
    name: SERVER_NAME,
    title: SERVER_TITLE,
    description:
      'Remote MCP server for the smbX DEFINITIVE M&A Deal OS: deterministic diligence tools, model-backed work product, DealState, data rooms, audit packets, and THE LINE-safe assistant execution.',
    version: DEFINITIVE_SPEC_VERSION,
    remotes: [
      {
        type: 'streamable-http',
        url: `${origin}/mcp`,
        headers: [
          {
            name: 'Authorization',
            description: 'Bearer token from a signed-in smbX user session or a short-lived scoped DEFINITIVE agent token.',
            isRequired: true,
            isSecret: true,
          },
        ],
      },
    ],
    homepage: origin,
    repository: {
      url: origin,
      source: 'web',
    },
    tags: [
      'm-and-a',
      'diligence',
      'deal-os',
      'working-capital-peg',
      'quality-of-earnings',
      'lbo-model',
      'data-room',
      'audit-packet',
    ],
    metadata: {
      specVersion: DEFINITIVE_SPEC_VERSION,
      methodologyVersion: DEFINITIVE_METHODOLOGY_VERSION,
      methodologyUri: DEFINITIVE_METHODOLOGY_URI,
      toolCount: tools.tools.length,
      oauthProtectedResource: `${origin}/.well-known/oauth-protected-resource/mcp`,
      noSuccessFees: true,
      noReferralCompensation: true,
      lineDeclaration:
        'smbX is software and deterministic deal infrastructure. It does not advise, recommend, negotiate, represent, guarantee, move money, or take transaction-based compensation.',
    },
  };
}

function handleNotification(method: string): DefinitiveRemoteMcpHttpResponse {
  if (method === 'notifications/initialized' || method.startsWith('notifications/')) {
    return { status: 202 };
  }
  return { status: 202 };
}

async function callTool(
  id: string | number | null,
  params: unknown,
  context: DefinitiveRemoteMcpRequestContext,
  protocolVersion: string,
): Promise<DefinitiveRemoteMcpHttpResponse> {
  if (!params || typeof params !== 'object') {
    return jsonRpcHttp(400, jsonRpcError(id, -32602, 'Invalid params', 'tools/call params must include name and optional arguments.'), protocolVersion);
  }
  const rawParams = params as Record<string, any>;
  const toolName = typeof rawParams.name === 'string' ? rawParams.name.trim() : '';
  if (!toolName) {
    return jsonRpcHttp(400, jsonRpcError(id, -32602, 'Invalid params', 'tools/call requires params.name.'), protocolVersion);
  }

  const userId = Number(context.auth?.userId);
  if (!Number.isFinite(userId) || userId <= 0) {
    return jsonRpcHttp(
      401,
      jsonRpcError(id, -32001, 'Authentication required', 'tools/call requires a signed smbX bearer token or scoped DEFINITIVE agent token.'),
      protocolVersion,
      {
        'WWW-Authenticate': buildDefinitiveMcpWwwAuthenticate(context.origin, listDefinitiveMcpRequiredScopes(toolName)),
      },
    );
  }
  const audienceError = validateMcpAgentTokenAudience(context.auth?.claims || {}, context.origin);
  if (audienceError) {
    return jsonRpcHttp(
      401,
      jsonRpcError(id, -32001, 'Invalid token', audienceError.message, audienceError),
      protocolVersion,
      {
        'WWW-Authenticate': buildDefinitiveMcpWwwAuthenticate(context.origin, listDefinitiveMcpRequiredScopes(toolName), {
          error: 'invalid_token',
          errorDescription: audienceError.message,
        }),
      },
    );
  }

  const input = rawParams.arguments && typeof rawParams.arguments === 'object' ? rawParams.arguments : {};
  const envelope = {
    requestId: readMetaString(rawParams._meta, 'requestId') || readMetaString(input, 'requestId') || `mcp:${randomUUID()}`,
    sourceSurface: 'mcp',
    mcpProtocolVersion: protocolVersion,
    agentId: readMetaString(rawParams._meta, 'agentId'),
    agentPlatformId: readMetaString(rawParams._meta, 'agentPlatformId') || 'remote_mcp',
    mandateId: readMetaString(rawParams._meta, 'mandateId'),
    beneficialCustomerId: readMetaValue(rawParams._meta, 'beneficialCustomerId'),
    billingOrgId: readMetaValue(rawParams._meta, 'billingOrgId'),
    requestedScopes: readMetaValue(rawParams._meta, 'requestedScopes'),
  };
  const scopedEnvelope = buildTokenScopedDefinitiveEnvelope(context.auth?.claims || {}, envelope);
  if (!scopedEnvelope.ok) {
    return jsonRpcHttp(
      scopedEnvelope.status,
      jsonRpcError(id, -32003, scopedEnvelope.body.error, scopedEnvelope.body.message, scopedEnvelope.body),
      protocolVersion,
      scopeChallengeHeaders(context.origin, toolName, scopedEnvelope.body),
    );
  }

  try {
    const response = await executeDefinitiveMcpTool({
      userId,
      toolName,
      input,
      envelope: scopedEnvelope.envelope,
    });
    if (context.persist !== false) {
      (response.body as Record<string, any>).persistence = await persistDealStateCallBestEffort({
        userId,
        toolName,
        toolInput: input,
        envelope: scopedEnvelope.envelope,
        responseBody: response.body,
      });
    }

    const responseBody = response.body as Record<string, any>;
    if (response.status === 403 && isScopeChallengeBody(responseBody)) {
      return jsonRpcHttp(
        403,
        jsonRpcError(id, -32003, responseBody.error || 'insufficient_scope', responseBody.message, responseBody),
        protocolVersion,
        scopeChallengeHeaders(context.origin, toolName, responseBody),
      );
    }

    return jsonRpcHttp(200, {
      jsonrpc: '2.0',
      id,
      result: formatToolResult(toolName, response.status, response.body),
    }, protocolVersion);
  } catch (err: any) {
    return jsonRpcHttp(500, jsonRpcError(id, -32603, 'Internal error', err.message || 'Failed to execute DEFINITIVE tool'), protocolVersion);
  }
}

function buildInitializeResult(protocolVersion: string, origin?: string) {
  return {
    protocolVersion,
    capabilities: {
      tools: {
        listChanged: false,
      },
    },
    serverInfo: {
      name: SERVER_NAME,
      title: SERVER_TITLE,
      version: DEFINITIVE_SPEC_VERSION,
      description:
        'Remote MCP server for deterministic M&A diligence, DealState, model stack, data-room, Studio draft, close-readiness, and audit-packet work.',
      websiteUrl: normalizeBaseUrl(origin),
    },
    instructions:
      'Use smbX for source-aware M&A diligence, deterministic models, DealState iteration, data-room organization, document scaffolds, and audit packets. Do not present outputs as legal, tax, investment, brokerage, accounting, appraisal, escrow, negotiation, payment, or closing advice.',
    _meta: {
      specVersion: DEFINITIVE_SPEC_VERSION,
      methodologyVersion: DEFINITIVE_METHODOLOGY_VERSION,
      lineDeclaration:
        'Analysis -> options -> implications -> user/professional decides. smbX does not advise, recommend, negotiate, represent, guarantee, move money, or take success/referral/deal-value compensation.',
    },
  };
}

function buildToolsListResult(params: unknown) {
  const inventory = listDefinitiveMcpTools();
  const cursor = params && typeof params === 'object' ? String((params as Record<string, any>).cursor || '') : '';
  const limit = 100;
  const start = cursor ? Math.max(0, Number.parseInt(cursor, 10) || 0) : 0;
  const selected = inventory.tools.slice(start, start + limit);
  const nextCursor = start + limit < inventory.tools.length ? String(start + limit) : undefined;

  return {
    tools: selected.map(tool => ({
      name: tool.name,
      title: tool.name.replace(/_/g, ' '),
      description: tool.description,
      inputSchema: tool.inputSchema,
      outputSchema: tool.outputSchema,
      annotations: tool.annotations,
      _meta: {
        requiredScopes: tool.requiredScopes,
        lineStatus: tool.lineStatus,
        lineReason: tool.lineReason,
        refusalBehavior: tool.refusalBehavior,
        metering: tool.metering,
        structuredContent: tool.structuredContent,
        specVersion: DEFINITIVE_SPEC_VERSION,
        methodologyVersion: DEFINITIVE_METHODOLOGY_VERSION,
      },
    })),
    ...(nextCursor ? { nextCursor } : {}),
    _meta: {
      specVersion: DEFINITIVE_SPEC_VERSION,
      methodologyVersion: DEFINITIVE_METHODOLOGY_VERSION,
      toolCount: inventory.tools.length,
      auth: inventory.auth,
    },
  };
}

function formatToolResult(toolName: string, status: number, body: Record<string, any>) {
  const ok = status >= 200 && status < 300 && body.ok !== false;
  const result = body.result && typeof body.result === 'object' ? body.result : body;
  const summary = ok
    ? `${toolName} completed. Structured DEFINITIVE output is available in structuredContent.`
    : `${toolName} returned a governed error or tollgate: ${body.error || body.lineStatus || body.tollgate?.code || 'not_available'}.`;
  return {
    content: [
      {
        type: 'text',
        text: summary,
      },
    ],
    structuredContent: body,
    isError: !ok,
    _meta: {
      httpStatus: status,
      toolName,
      resultSchema: result.schema || body.schema || null,
      specVersion: body.specVersion || DEFINITIVE_SPEC_VERSION,
      methodologyVersion: body.methodologyVersion || DEFINITIVE_METHODOLOGY_VERSION,
    },
  };
}

function negotiateProtocolVersion(requested: string | null) {
  if (requested && DEFINITIVE_REMOTE_MCP_SUPPORTED_PROTOCOLS.includes(requested as any)) return requested;
  return DEFINITIVE_REMOTE_MCP_PROTOCOL_VERSION;
}

function readRequestedProtocolVersion(request: JsonRpcRequest, headers?: Record<string, string | string[] | undefined>) {
  const params = request.params && typeof request.params === 'object' ? request.params as Record<string, any> : {};
  if (typeof params.protocolVersion === 'string') return params.protocolVersion;
  const header = headers?.['mcp-protocol-version'] || headers?.['MCP-Protocol-Version'];
  if (Array.isArray(header)) return header[0] || null;
  return typeof header === 'string' ? header : null;
}

function normalizeJsonRpcId(id: unknown): string | number | null {
  return typeof id === 'string' || typeof id === 'number' || id === null ? id : null;
}

function jsonRpcHttp(
  status: number,
  body: Record<string, any>,
  protocolVersion?: string,
  extraHeaders: Record<string, string> = {},
): DefinitiveRemoteMcpHttpResponse {
  return {
    status,
    headers: {
      'Content-Type': 'application/json',
      'MCP-Protocol-Version': protocolVersion || DEFINITIVE_REMOTE_MCP_PROTOCOL_VERSION,
      ...extraHeaders,
    },
    body,
  };
}

function jsonRpcError(
  id: string | number | null,
  code: number,
  message: string,
  detail?: string,
  data?: Record<string, any>,
) {
  return {
    jsonrpc: '2.0',
    id,
    error: {
      code,
      message,
      ...(detail || data ? { data: { ...(data || {}), ...(detail ? { detail } : {}) } } : {}),
    },
  };
}

function normalizeBaseUrl(baseUrl?: string) {
  return (baseUrl || process.env.APP_URL || 'http://127.0.0.1:3000').replace(/\/+$/, '');
}

function readMetaString(meta: unknown, key: string) {
  const value = readMetaValue(meta, key);
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function readMetaValue(meta: unknown, key: string) {
  return meta && typeof meta === 'object' ? (meta as Record<string, any>)[key] : undefined;
}

function validateMcpAgentTokenAudience(claims: Record<string, any>, origin?: string) {
  if (claims.tokenUse !== 'definitive_agent') return null;
  const expected = `${normalizeBaseUrl(origin)}/mcp`;
  const audience = claims.aud;
  const audiences = Array.isArray(audience) ? audience.map(String) : typeof audience === 'string' ? [audience] : [];
  if (!audiences.length) {
    return {
      error: 'missing_audience',
      message: 'DEFINITIVE OAuth/agent tokens used with /mcp must be audience-bound to the canonical MCP resource.',
      expectedAudience: expected,
    };
  }
  if (!audiences.map(value => value.replace(/\/+$/, '')).includes(expected)) {
    return {
      error: 'invalid_audience',
      message: 'Bearer token audience does not match the canonical MCP resource.',
      expectedAudience: expected,
      tokenAudience: audiences,
    };
  }
  return null;
}

function scopeChallengeHeaders(origin: string | undefined, toolName: string, body: Record<string, any>) {
  const scopes = scopeChallengeScopes(toolName, body);
  return {
    'WWW-Authenticate': buildDefinitiveMcpWwwAuthenticate(origin, scopes, {
      error: 'insufficient_scope',
      errorDescription: String(body.message || body.error || 'Additional DEFINITIVE scopes are required.'),
    }),
  };
}

function scopeChallengeScopes(toolName: string, body: Record<string, any>) {
  if (Array.isArray(body.missingScopes) && body.missingScopes.length) return body.missingScopes.map(String);
  if (Array.isArray(body.unauthorizedScopes) && body.unauthorizedScopes.length) return body.unauthorizedScopes.map(String);
  if (Array.isArray(body.requiredScopes) && body.requiredScopes.length) return body.requiredScopes.map(String);
  return listDefinitiveMcpRequiredScopes(toolName);
}

function isScopeChallengeBody(body: Record<string, any>) {
  return [
    'missing_required_scope',
    'token_scope_exceeded',
    'agent_token_missing_scopes',
    'enterprise_scope_required',
  ].includes(String(body.error || ''));
}

async function persistDealStateCallBestEffort(input: {
  userId: number;
  toolName: string;
  toolInput: Record<string, any>;
  envelope: Record<string, any>;
  responseBody: Record<string, any>;
}) {
  try {
    return await persistDefinitiveDealStateCall(input);
  } catch (err: any) {
    console.warn('[definitive:mcp] deal-state persistence skipped:', err.message);
    return {
      ok: false,
      skipped: true,
      reason: 'persistence_failed',
      message: err.message,
    };
  }
}
