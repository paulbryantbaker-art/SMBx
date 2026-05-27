import { DEFINITIVE_METHODOLOGY_VERSION, DEFINITIVE_SPEC_VERSION } from '../constants/definitive.js';
import { listDefinitiveMcpTools } from './definitiveMcp.js';

const OPENAPI_VERSION = 'DEFINITIVE.openapi.v0.1';
const GPT_ACTIONS_OPENAPI_VERSION = 'DEFINITIVE.gpt-actions.openapi.v0.1';
const GPT_ACTION_TOOL_NAMES = [
  'introspect_capabilities',
  'describe_methodology',
  'estimate_deal_cost',
  'get_deal_runbook',
  'lookup_model_slot',
  'compose_model_stack',
  'ingest_deal_payload',
  'update_deal_payload',
  'check_completeness',
  'compose_deal_plan',
  'resume_deal',
  'prepare_ioi_packet',
  'prepare_loi_packet',
  'compose_data_room_index',
  'compose_close_readiness',
] as const;

function normalizeBaseUrl(baseUrl?: string) {
  return (baseUrl || process.env.APP_URL || 'http://127.0.0.1:3000').replace(/\/+$/, '');
}

export function buildDefinitiveOpenApiSpec(baseUrl?: string) {
  const origin = normalizeBaseUrl(baseUrl);
  const toolSurface = listDefinitiveMcpTools();
  const toolNames = toolSurface.tools.map(tool => tool.name);

  return {
    openapi: '3.1.0',
    info: {
      title: 'smbX DEFINITIVE Deal OS API',
      version: OPENAPI_VERSION,
      summary: 'Action-ready API surface for Yulia and external assistants.',
      description:
        'OpenAPI surface for GPT Actions and enterprise allow-list review. It exposes public discovery plus authenticated, governed DEFINITIVE tool calls. smbX is software and deterministic deal infrastructure, not legal, tax, investment, brokerage, accounting, appraisal, escrow, or negotiation advice.',
      termsOfService: `${origin}/legal/terms`,
      contact: {
        name: 'smbX.ai',
        url: origin,
      },
    },
    servers: [{ url: origin }],
    tags: [
      { name: 'Discovery', description: 'Public metadata for assistant setup, schema inspection, and marketplace review.' },
      { name: 'Execution', description: 'Authenticated governed tool calls for user-authorized deal work.' },
      { name: 'Tokens', description: 'Short-lived scoped agent-token bridge for external assistant pilots.' },
    ],
    paths: {
      '/api/definitive/openapi.json': {
        get: {
          tags: ['Discovery'],
          operationId: 'getDefinitiveOpenApiSpec',
          summary: 'Read the GPT Action and enterprise review OpenAPI specification.',
          responses: okResponse('OpenAPI specification'),
        },
      },
      '/api/definitive/assistant-distribution-readiness': {
        get: {
          tags: ['Discovery'],
          operationId: 'getAssistantDistributionReadiness',
          summary: 'Read launch readiness for Claude Connector, ChatGPT GPTs/Apps, and MCP directories.',
          responses: okResponse('Assistant distribution readiness'),
        },
      },
      '/server.json': {
        get: {
          tags: ['Discovery'],
          operationId: 'getDefinitiveMcpServerJson',
          summary: 'Read the remote MCP registry server.json document.',
          responses: okResponse('MCP server.json'),
        },
      },
      '/.well-known/oauth-protected-resource/mcp': {
        get: {
          tags: ['Discovery'],
          operationId: 'getDefinitiveMcpProtectedResourceMetadata',
          summary: 'Read OAuth protected-resource metadata for the remote MCP endpoint.',
          responses: okResponse('OAuth protected-resource metadata'),
        },
      },
      '/.well-known/oauth-authorization-server': {
        get: {
          tags: ['Discovery'],
          operationId: 'getDefinitiveOAuthAuthorizationServerMetadata',
          summary: 'Read OAuth authorization-server metadata for the MCP PKCE bridge.',
          responses: okResponse('OAuth authorization-server metadata'),
        },
      },
      '/oauth/register': {
        post: {
          tags: ['Tokens'],
          operationId: 'registerDefinitiveOAuthClient',
          summary: 'Register a public OAuth PKCE client for MCP connector authorization.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    client_name: { type: 'string' },
                    redirect_uris: { type: 'array', items: { type: 'string' } },
                    token_endpoint_auth_method: { type: 'string', enum: ['none'] },
                  },
                  required: ['redirect_uris'],
                  additionalProperties: true,
                },
              },
            },
          },
          responses: okResponse('OAuth client registration response'),
        },
      },
      '/oauth/token': {
        post: {
          tags: ['Tokens'],
          operationId: 'exchangeDefinitiveOAuthCode',
          summary: 'Exchange an OAuth authorization code and PKCE verifier for a scoped MCP access token.',
          responses: okResponse('OAuth token response'),
        },
      },
      '/api/definitive/connector-distribution': {
        get: {
          tags: ['Discovery'],
          operationId: 'getConnectorDistributionPackage',
          summary: 'Read reusable marketplace listing copy and platform connector packages.',
          responses: okResponse('Connector distribution package'),
        },
      },
      '/api/definitive/registry-package': {
        get: {
          tags: ['Discovery'],
          operationId: 'getDefinitiveRegistryPackage',
          summary: 'Read MCP directory and enterprise allow-list registry package.',
          responses: okResponse('Registry package'),
        },
      },
      '/api/definitive/schemas': {
        get: {
          tags: ['Discovery'],
          operationId: 'listDefinitiveSchemas',
          summary: 'List portable DEFINITIVE structured-output schemas.',
          responses: okResponse('Schema registry'),
        },
      },
      '/api/definitive/model-catalog': {
        get: {
          tags: ['Discovery'],
          operationId: 'listDefinitiveModelCatalog',
          summary: 'List public model-slot catalog metadata.',
          parameters: paginationParameters(),
          responses: okResponse('Model catalog'),
        },
      },
      '/api/definitive/deal-runbooks': {
        get: {
          tags: ['Discovery'],
          operationId: 'listDefinitiveDealRunbooks',
          summary: 'List public deal runbooks for buy, sell, raise, and PMI journeys.',
          parameters: paginationParameters(),
          responses: okResponse('Deal runbooks'),
        },
      },
      '/api/definitive/tools/list': {
        get: {
          tags: ['Execution'],
          operationId: 'listDefinitiveTools',
          summary: 'List authenticated DEFINITIVE tool inventory.',
          security: [{ bearerAuth: [] }],
          responses: okResponse('Tool inventory'),
        },
      },
      '/api/definitive/tools/call': {
        post: {
          tags: ['Execution'],
          operationId: 'callDefinitiveTool',
          summary: 'Call a governed DEFINITIVE tool by name.',
          description:
            'Requires a user-authorized bearer token. Tool calls are checked against THE LINE, required scopes, entitlements, and governed execution contracts.',
          security: [{ bearerAuth: [] }],
          'x-openai-isConsequential': true,
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    toolName: { type: 'string', enum: toolNames },
                    input: { type: 'object', additionalProperties: true },
                    envelope: { $ref: '#/components/schemas/ToolEnvelope' },
                  },
                  required: ['toolName', 'input'],
                  additionalProperties: false,
                },
              },
            },
          },
          responses: toolCallResponses(),
        },
      },
      '/api/definitive/tools/{toolName}/call': {
        post: {
          tags: ['Execution'],
          operationId: 'callNamedDefinitiveTool',
          summary: 'Call a governed DEFINITIVE tool using a path parameter.',
          security: [{ bearerAuth: [] }],
          'x-openai-isConsequential': true,
          parameters: [
            {
              name: 'toolName',
              in: 'path',
              required: true,
              schema: { type: 'string', enum: toolNames },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    input: { type: 'object', additionalProperties: true },
                    envelope: { $ref: '#/components/schemas/ToolEnvelope' },
                  },
                  required: ['input'],
                  additionalProperties: false,
                },
              },
            },
          },
          responses: toolCallResponses(),
        },
      },
      '/api/definitive/agent-tokens': {
        post: {
          tags: ['Tokens'],
          operationId: 'createDefinitiveAgentToken',
          summary: 'Mint a short-lived scoped agent token from a human app session.',
          description:
            'This bridge is for pilots and enterprise allow-list flows. Production target is OAuth 2.1 + PKCE with audience-bound scoped tokens.',
          security: [{ bearerAuth: [] }],
          'x-openai-isConsequential': true,
          requestBody: {
            required: false,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    profile: { type: 'string', examples: ['deal_operator'] },
                    scopes: { type: 'array', items: { type: 'string' } },
                    expiresInMinutes: { type: 'integer', minimum: 5, maximum: 1440 },
                    agentId: { type: 'string' },
                    agentPlatformId: { type: 'string' },
                    mandateId: { type: 'string' },
                    beneficialCustomerId: { type: ['integer', 'string'] },
                    billingOrgId: { type: ['integer', 'string'] },
                  },
                  additionalProperties: false,
                },
              },
            },
          },
          responses: okResponse('Agent token response'),
        },
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'User-authorized app JWT or short-lived scoped DEFINITIVE agent token.',
        },
      },
      schemas: {
        ToolEnvelope: {
          type: 'object',
          properties: {
            requestId: { type: 'string' },
            agentId: { type: 'string' },
            agentPlatformId: { type: 'string' },
            mandateId: { type: 'string' },
            beneficialCustomerId: { type: ['integer', 'string'] },
            requestedScopes: { type: 'array', items: { type: 'string' } },
            sourceSurface: { type: 'string', enum: ['chatgpt_gpt', 'chatgpt_app', 'claude_connector', 'mcp', 'api', 'app'] },
          },
          additionalProperties: true,
        },
        DefinitiveToolCallResponse: {
          type: 'object',
          properties: {
            ok: { type: 'boolean' },
            toolName: { type: 'string' },
            result: { type: 'object', additionalProperties: true },
            error: { type: 'string' },
            specVersion: { type: 'string', examples: [DEFINITIVE_SPEC_VERSION] },
            methodologyVersion: { type: 'string', examples: [DEFINITIVE_METHODOLOGY_VERSION] },
          },
          required: ['ok', 'toolName'],
          additionalProperties: true,
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            ok: { type: 'boolean', const: false },
            error: { type: 'string' },
            message: { type: 'string' },
          },
          additionalProperties: true,
        },
      },
    },
    'x-smbx': {
      schema: OPENAPI_VERSION,
      specVersion: DEFINITIVE_SPEC_VERSION,
      methodologyVersion: DEFINITIVE_METHODOLOGY_VERSION,
      lineDeclaration:
        'smbX computes, cites, packages, and routes software outputs. Users and qualified professionals remain responsible for decisions and reliance.',
      pricingDeclaration:
        'Monthly subscriptions and outcome-independent software/data pass-through only. No wallet, success fee, referral fee, or deal-value fee.',
      toolCount: toolNames.length,
    },
  };
}

export function buildDefinitiveGptActionsOpenApiSpec(baseUrl?: string) {
  const origin = normalizeBaseUrl(baseUrl);
  const toolSurface = listDefinitiveMcpTools();
  const toolByName = new Map(toolSurface.tools.map(tool => [tool.name, tool]));

  return {
    openapi: '3.1.0',
    info: {
      title: 'smbX Deal OS GPT Actions',
      version: GPT_ACTIONS_OPENAPI_VERSION,
      summary: 'Named GPT Actions facade for the smbX DEFINITIVE diligence substrate.',
      description:
        'Private GPT pilot surface for testing ChatGPT GPT Actions against smbX. Actions compute, cite, organize, and package deal intelligence inside THE LINE; smbX does not advise, negotiate, represent, move money, or take transaction-based compensation.',
      termsOfService: `${origin}/legal/terms`,
      contact: {
        name: 'smbX.ai',
        url: origin,
      },
    },
    servers: [{ url: origin }],
    tags: [
      { name: 'Setup', description: 'Public setup and readiness metadata.' },
      { name: 'Deal OS', description: 'User-authorized GPT Actions for governed deal work.' },
    ],
    paths: {
      '/api/definitive/gpt-actions/openapi.json': {
        get: {
          tags: ['Setup'],
          operationId: 'getSmbxGptActionsSpec',
          summary: 'Read this GPT Actions OpenAPI package.',
          responses: okResponse('GPT Actions OpenAPI specification'),
        },
      },
      '/api/definitive/assistant-distribution-readiness': {
        get: {
          tags: ['Setup'],
          operationId: 'getSmbxConnectorReadiness',
          summary: 'Read connector and GPT Actions readiness metadata.',
          responses: okResponse('Connector readiness package'),
        },
      },
      ...Object.fromEntries(GPT_ACTION_TOOL_NAMES.map(toolName => {
        const tool = toolByName.get(toolName);
        return [`/api/definitive/gpt-actions/${toolName}`, {
          post: {
            tags: ['Deal OS'],
            operationId: gptActionOperationId(toolName),
            summary: gptActionSummary(toolName),
            description: tool?.description || `Call ${toolName} through the governed smbX Deal OS facade.`,
            security: [{ smbxOAuth: tool?.requiredScopes || ['capability:read'] }],
            'x-openai-isConsequential': isConsequentialGptAction(toolName),
            requestBody: {
              required: false,
              content: {
                'application/json': {
                  schema: tool?.inputSchema || { type: 'object', additionalProperties: true },
                },
              },
            },
            responses: toolCallResponses(),
          },
        }];
      })),
    },
    components: {
      securitySchemes: {
        smbxOAuth: {
          type: 'oauth2',
          description:
            'OAuth authorization-code flow for private GPT Actions testing. Use a preconfigured confidential GPT Actions client, or the MCP PKCE flow for public remote MCP clients.',
          flows: {
            authorizationCode: {
              authorizationUrl: `${origin}/oauth/authorize`,
              tokenUrl: `${origin}/oauth/token`,
              scopes: buildScopeDescriptions(toolSurface.tools.flatMap(tool => tool.requiredScopes)),
            },
          },
        },
      },
      schemas: {
        DefinitiveToolCallResponse: {
          type: 'object',
          properties: {
            ok: { type: 'boolean' },
            toolName: { type: 'string' },
            result: { type: 'object', additionalProperties: true },
            error: { type: 'string' },
            message: { type: 'string' },
            specVersion: { type: 'string', examples: [DEFINITIVE_SPEC_VERSION] },
            methodologyVersion: { type: 'string', examples: [DEFINITIVE_METHODOLOGY_VERSION] },
          },
          additionalProperties: true,
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            ok: { type: 'boolean', const: false },
            error: { type: 'string' },
            message: { type: 'string' },
          },
          additionalProperties: true,
        },
      },
    },
    'x-smbx': {
      schema: GPT_ACTIONS_OPENAPI_VERSION,
      canonicalOpenApi: `${origin}/api/definitive/openapi.json`,
      mcpEndpoint: `${origin}/mcp`,
      oauthAuthorizationServer: `${origin}/.well-known/oauth-authorization-server`,
      selectedActionCount: GPT_ACTION_TOOL_NAMES.length,
      lineDeclaration:
        'smbX computes, cites, packages, and routes software outputs. Users and qualified professionals remain responsible for decisions and reliance.',
      authSetup:
        'For private GPT Actions, set SMBX_GPT_ACTIONS_CLIENT_ID and SMBX_GPT_ACTIONS_CLIENT_SECRET on the server, then enter those values in the GPT Action OAuth settings.',
    },
  };
}

function okResponse(description: string) {
  return {
    '200': {
      description,
      content: {
        'application/json': {
          schema: { type: 'object', additionalProperties: true },
        },
      },
    },
  };
}

function toolCallResponses() {
  return {
    '200': {
      description: 'Tool call completed or returned a governed refusal/tollgate.',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/DefinitiveToolCallResponse' },
        },
      },
    },
    '401': {
      description: 'Authentication required.',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/ErrorResponse' },
        },
      },
    },
    '403': {
      description: 'Missing scope, entitlement, or governed permission.',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/ErrorResponse' },
        },
      },
    },
  };
}

function paginationParameters() {
  return [
    { name: 'limit', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 100 } },
    { name: 'cursor', in: 'query', required: false, schema: { type: 'string' } },
  ];
}

function gptActionOperationId(toolName: string) {
  return `smbx${toolName
    .split('_')
    .map(part => part ? `${part[0].toUpperCase()}${part.slice(1)}` : '')
    .join('')}`;
}

function gptActionSummary(toolName: string) {
  return `smbX ${toolName.replace(/_/g, ' ')}`;
}

function isConsequentialGptAction(toolName: string) {
  return [
    'ingest_deal_payload',
    'update_deal_payload',
    'compose_deal_plan',
    'resume_deal',
    'prepare_ioi_packet',
    'prepare_loi_packet',
    'compose_data_room_index',
    'compose_close_readiness',
  ].includes(toolName);
}

function buildScopeDescriptions(scopes: string[]) {
  return [...new Set(scopes)].sort().reduce<Record<string, string>>((acc, scope) => {
    acc[scope] = `Allow smbX Deal OS action requiring ${scope}.`;
    return acc;
  }, {});
}
