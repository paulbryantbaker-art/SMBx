import {
  DEFINITIVE_METHODOLOGY_URI,
  DEFINITIVE_METHODOLOGY_VERSION,
  DEFINITIVE_SPEC_URI,
  DEFINITIVE_SPEC_VERSION,
} from '../constants/definitive.js';
import { buildDefinitiveConformanceStatus } from './definitiveConformanceStatus.js';
import {
  getDefinitiveLineContract,
  inputHasExplicitConfirmation,
  type DefinitiveLineContract,
} from './agencyActionRegistry.js';

const DEFINITIVE_MCP_PROTOCOL = 'DEFINITIVE.mcp.v0.1';

const DEFINITIVE_MCP_TOOLS = [
  'lookup_citation',
  'fetch_market_data',
  'defer_to_counsel',
  'compose_model_stack',
  'execute_model',
  'record_corpus_observation',
  'validate_conformance',
] as const;

type DefinitiveMcpToolName = typeof DEFINITIVE_MCP_TOOLS[number];

const DEFINITIVE_MCP_TOOL_DEFINITIONS: Record<DefinitiveMcpToolName, { description: string; inputSchema: Record<string, any> }> = {
  lookup_citation: {
    description: 'Resolve a claim or citation tag against the DEFINITIVE Authority Register and legacy V19 citation registry.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Citation tag, authority id, source name, or claim text to resolve.' },
        category: { type: 'string', description: 'Optional authority/category filter.' },
        jurisdiction: { type: 'string', description: 'Optional jurisdiction filter, for example US-DE.' },
      },
      required: ['query'],
    },
  },
  fetch_market_data: {
    description: 'Fetch timestamped market/regulatory data from the market-data cache with source and freshness metadata.',
    inputSchema: {
      type: 'object',
      properties: {
        key: { type: 'string', description: 'Market data key, for example SOFR, PRIME, HSR_SIZE_OF_TRANSACTION.' },
      },
      required: ['key'],
    },
  },
  defer_to_counsel: {
    description: 'Create a structured THE LINE deferral packet for legal, tax, regulatory, or professional-review questions.',
    inputSchema: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'Deferral category, such as tax, legal, regulatory, broker_dealer, or securities.' },
        issue: { type: 'string', description: 'The issue that requires qualified review.' },
        jurisdiction: { type: 'string', description: 'Optional jurisdiction.' },
        dealId: { type: 'number', description: 'Optional deal ID.' },
      },
      required: ['category', 'issue'],
    },
  },
  compose_model_stack: {
    description: 'Compose and persist the canonical V19 model stack for a deal, with DEFINITIVE v1.1/V20 overlay routing for G28 distressed/restructuring, G29 capital structure/liability management, and G30 real estate/asset-class overlays. Returns applicable M101-M223 mechanics with readiness, tool surfaces, and THE LINE boundaries. Unimplemented catalog models are surfaced as planning/readiness, not executable runtime models.',
    inputSchema: {
      type: 'object',
      properties: {
        dealId: { type: 'number', description: 'Deal ID to compose the stack for.' },
        journey: { type: 'string', enum: ['sell', 'buy', 'raise', 'pmi'], description: 'Optional override when the deal journey is missing.' },
        league: { type: 'string', enum: ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9', 'L10'], description: 'Optional override when the deal league is missing.' },
        dealType: { type: 'string', description: 'Optional deal type or structure override.' },
        signals: {
          type: 'object',
          description: 'Optional deterministic V20 routing signals for G28/G29/G30, such as cashRunwayDays, fccr, securedDebtTradingPriceCents, maintenanceCovenantBreachWithinQuarters, realEstatePercentOfEv, digitalAssetsPercentOfEv, solvencyProngFailed, bankruptcyFilingPending, rsaInMarket, forbearanceExecuted, capitalStructureAction, liabilityManagementExercise, recapitalization, exchangeOffer, and covenantAmendment.',
        },
      },
      required: ['dealId'],
    },
  },
  execute_model: {
    description: 'Execute a deterministic server-side V19 model by MODEL.*.v1 id and return output hash, citations, missing inputs, and audit payload.',
    inputSchema: {
      type: 'object',
      properties: {
        modelId: { type: 'string', description: 'Canonical model ID, for example MODEL.VAL.EBITDA.v1 or MODEL.DSCR.STRESS.v1.' },
        input: { type: 'object', description: 'Model inputs. Financial values must be cents.' },
        dealId: { type: 'number', description: 'Optional deal ID for audit context.' },
      },
      required: ['modelId', 'input'],
    },
  },
  record_corpus_observation: {
    description: 'Record a structured anonymized deal-term observation only when an active data-rights grant exists. Raw document text and party identifiers are stripped.',
    inputSchema: {
      type: 'object',
      properties: {
        dealId: { type: 'number', description: 'Optional deal ID owned by the beneficial customer.' },
        observationType: {
          type: 'string',
          enum: ['nwc_peg', 'add_back', 'earnout', 'rwi_policy', 'indemnity', 'escrow', 'financing_terms', 'valuation_multiple', 'tax_structure', 'legal_clause', 'closing_condition', 'diligence_finding'],
          description: 'Structured benchmark observation type.',
        },
        observation: { type: 'object', description: 'Structured observation fields only; raw text and party identifiers are not allowed.' },
        anonymizationBucket: { type: 'object', description: 'Non-identifying bucket fields such as industry, league, deal-size band, region, and year.' },
        sourceArtifactType: { type: 'string', description: 'Optional source artifact kind, for example model_execution or studio_export.' },
        sourceArtifactId: { type: 'string', description: 'Optional source artifact id.' },
        sourceHash: { type: 'string', description: 'Optional existing source hash.' },
      },
      required: ['observationType', 'observation'],
    },
  },
  validate_conformance: {
    description: 'Return the current DB-free DEFINITIVE conformance status, case count, categories, and validation command.',
    inputSchema: {
      type: 'object',
      properties: {
        suite: { type: 'string', enum: ['model-runtime'], description: 'Optional suite filter. Current DB-free suite is model-runtime.' },
      },
    },
  },
};

const TOOL_SCOPE: Record<DefinitiveMcpToolName, string[]> = {
  lookup_citation: ['citation:read', 'authority:read'],
  fetch_market_data: ['market-data:read'],
  defer_to_counsel: ['counsel:deferral:create'],
  compose_model_stack: ['model-stack:compose', 'deal:read'],
  execute_model: ['model:execute', 'audit:write'],
  record_corpus_observation: ['corpus:write', 'data-rights:read'],
  validate_conformance: ['conformance:read'],
};

const TOOL_INTERNAL_API_METER = new Set<DefinitiveMcpToolName>([
  'fetch_market_data',
  'validate_conformance',
]);

interface DefinitiveToolCallInput {
  userId: number;
  toolName: string;
  input: Record<string, any>;
  envelope?: Record<string, any>;
}

type DefinitiveLineGateResult =
  | { allowed: true }
  | {
      allowed: false;
      status: number;
      code: string;
      message: string;
      tollgate: Record<string, any>;
    };

export function listDefinitiveMcpTools() {
  return {
    protocol: DEFINITIVE_MCP_PROTOCOL,
    status: 'internal_v0_1',
    specVersion: DEFINITIVE_SPEC_VERSION,
    specUri: DEFINITIVE_SPEC_URI,
    methodologyVersion: DEFINITIVE_METHODOLOGY_VERSION,
    methodologyUri: DEFINITIVE_METHODOLOGY_URI,
    auth: {
      mode: 'oauth_ready_jwt_dev',
      productionTarget: 'OAuth 2.1 + PKCE + audience-bound scoped tokens',
      localDev: 'Use the existing smbX JWT bearer token while the MCP transport is internal.',
    },
    identity: {
      actor: 'agent_id',
      platform: 'agent_platform_id',
      principal: 'beneficial_customer_id',
      billing: 'billing_org_id',
      mandate: 'mandate_id',
    },
    tools: DEFINITIVE_MCP_TOOLS.map(name => {
      const tool = DEFINITIVE_MCP_TOOL_DEFINITIONS[name];
      const line = getDefinitiveLineContract(name);
      return {
        name,
        description: tool.description,
        inputSchema: tool.inputSchema,
        lineStatus: line?.lineStatus || 'ok',
        lineReason: line?.lineReason || '',
        refusalBehavior: line?.refusalBehavior || 'allow',
        lineRisks: line?.lineRisks || [],
        requiredScopes: TOOL_SCOPE[name],
        metering: {
          eventType: 'api_call',
          internalToolMeter: TOOL_INTERNAL_API_METER.has(name),
        },
      };
    }),
    responseShape: {
      ok: 'boolean',
      toolName: 'string',
      result: 'object',
      mandateChain: 'object',
      specVersion: DEFINITIVE_SPEC_VERSION,
      methodologyVersion: DEFINITIVE_METHODOLOGY_VERSION,
    },
  };
}

export function isDefinitiveMcpToolName(value: string): value is DefinitiveMcpToolName {
  return (DEFINITIVE_MCP_TOOLS as readonly string[]).includes(value);
}

export async function executeDefinitiveMcpTool(input: DefinitiveToolCallInput) {
  const envelope = input.envelope || {};
  const versionError = validateVersionEnvelope(envelope);
  if (versionError) return { status: 400, body: versionError };

  if (!isDefinitiveMcpToolName(input.toolName)) {
    return {
      status: 404,
      body: {
        ok: false,
        error: `Unsupported DEFINITIVE v0.1 tool: ${input.toolName}`,
        supportedTools: DEFINITIVE_MCP_TOOLS,
      },
    };
  }

  const requestedScopes = normalizeScopes(envelope.requestedScopes).length
    ? normalizeScopes(envelope.requestedScopes)
    : TOOL_SCOPE[input.toolName];
  const line = getDefinitiveLineContract(input.toolName);
  const lineGate = evaluateLineGate(input.toolName, input.input || {}, envelope, line);
  if (!lineGate.allowed) {
    return {
      status: lineGate.status,
      body: {
        ok: false,
        error: lineGate.code,
        message: lineGate.message,
        tollgate: lineGate.tollgate,
        toolName: input.toolName,
        protocol: DEFINITIVE_MCP_PROTOCOL,
        lineStatus: line?.lineStatus || 'LINE_VIOLATION',
        lineReason: line?.lineReason || 'No DEFINITIVE action contract exists for this tool.',
        refusalBehavior: line?.refusalBehavior || 'refuse',
        lineRisks: line?.lineRisks || ['missing_action_contract'],
        requiredScopes: requestedScopes,
        ...versionPayload(),
      },
    };
  }

  if (input.toolName === 'validate_conformance') {
    return {
      status: 200,
      body: {
        ok: true,
        toolName: input.toolName,
        protocol: DEFINITIVE_MCP_PROTOCOL,
        lineStatus: line?.lineStatus || 'ok',
        lineReason: line?.lineReason || '',
        refusalBehavior: line?.refusalBehavior || 'allow',
        lineRisks: line?.lineRisks || [],
        requiredScopes: requestedScopes,
        result: buildDefinitiveConformanceStatus(),
        ...versionPayload(),
      },
    };
  }

  const [
    { resolveDefinitiveMandateContext },
    { checkV19Entitlement, formatV19TollgateForYulia, recordV19UsageEvent },
  ] = await Promise.all([
    import('./definitiveMandateService.js'),
    import('./v19EntitlementService.js'),
  ]);

  const mandateContext = await resolveDefinitiveMandateContext({
    userId: input.userId,
    organizationId: nullableNumber(envelope.organizationId),
    billingOrgId: nullableNumber(envelope.billingOrgId),
    sourceAgent: nullableString(envelope.sourceAgent) || 'definitive-mcp-v0.1',
    agentId: envelope.agentId ?? envelope.agent?.agentId ?? null,
    agentPlatformId: nullableString(envelope.agentPlatformId) || nullableString(envelope.agent?.platformId),
    mandateId: nullableString(envelope.mandateId) || nullableString(envelope.mandate?.id),
    requestedScopes,
    sourceSurface: 'mcp',
    metadata: {
      protocol: DEFINITIVE_MCP_PROTOCOL,
      toolName: input.toolName,
      client: envelope.client || null,
    },
  });

  const routeMetersCall = !TOOL_INTERNAL_API_METER.has(input.toolName);
  if (routeMetersCall) {
    const gate = await checkV19Entitlement(input.userId, 'api_call', {
      actionId: `definitive.${input.toolName}`,
      toolName: input.toolName,
      sourceSurface: 'mcp',
      resourceType: 'definitive_tool',
      resourceId: input.toolName,
      agentId: mandateContext.agentId,
      agentPlatformId: mandateContext.agentPlatformId,
      mandateId: mandateContext.mandateId,
      requestedScopes,
      metadata: {
        protocol: DEFINITIVE_MCP_PROTOCOL,
        lineStatus: line?.lineStatus || 'ok',
      },
    });
    if (!gate.allowed) {
      return {
        status: gate.tollgate?.code === 'credit_budget_required' ? 402 : 403,
        body: {
          ok: false,
          error: gate.tollgate?.message || 'DEFINITIVE tool call is outside the current plan scope.',
          tollgate: formatV19TollgateForYulia(gate.tollgate),
          usage: gate.meter,
          mandateChain: mandateContext.mandateChain,
          ...versionPayload(),
        },
      };
    }
  }

  if (input.toolName === 'record_corpus_observation') {
    const { recordDefinitiveCorpusObservation } = await import('./definitiveCorpusService.js');
    const result = await recordDefinitiveCorpusObservation({
      userId: input.userId,
      organizationId: mandateContext.mandateChain.principal.organizationId,
      billingOrgId: mandateContext.billingOrgId,
      beneficialCustomerId: mandateContext.beneficialCustomerId,
      dealId: nullableNumber(input.input?.dealId),
      observationType: String(input.input?.observationType || ''),
      observation: input.input?.observation && typeof input.input.observation === 'object' ? input.input.observation : {},
      anonymizationBucket: input.input?.anonymizationBucket && typeof input.input.anonymizationBucket === 'object' ? input.input.anonymizationBucket : {},
      sourceArtifactType: nullableString(input.input?.sourceArtifactType),
      sourceArtifactId: input.input?.sourceArtifactId ?? null,
      sourceHash: nullableString(input.input?.sourceHash),
      minReleaseCount: nullableNumber(input.input?.minReleaseCount),
      metadata: input.input?.metadata && typeof input.input.metadata === 'object' ? input.input.metadata : {},
      mandateContext,
    });
    const ok = result.ok === true;
    if (routeMetersCall) {
      await recordV19UsageEvent({
        userId: input.userId,
        eventType: 'api_call',
        actionId: `definitive.${input.toolName}`,
        toolName: input.toolName,
        sourceSurface: 'mcp',
        actorType: 'agent',
        resourceType: 'definitive_tool',
        resourceId: input.toolName,
        agentId: mandateContext.agentId,
        agentPlatformId: mandateContext.agentPlatformId,
        mandateId: mandateContext.mandateId,
        requestedScopes,
        metadata: {
          protocol: DEFINITIVE_MCP_PROTOCOL,
          lineStatus: line?.lineStatus || 'ok',
          ok,
          corpusObservationType: input.input?.observationType || null,
        },
      });
    }
    return {
      status: ok ? 200 : result.error === 'data_rights_required' ? 428 : 400,
      body: {
        ok,
        toolName: input.toolName,
        protocol: DEFINITIVE_MCP_PROTOCOL,
        lineStatus: line?.lineStatus || 'ok',
        lineReason: line?.lineReason || '',
        refusalBehavior: line?.refusalBehavior || 'allow',
        lineRisks: line?.lineRisks || [],
        requiredScopes: requestedScopes,
        result,
        mandateChain: mandateContext.mandateChain,
        ...versionPayload(),
      },
    };
  }

  const { executeGovernedTool } = await import('./governedToolExecutor.js');
  const raw = await executeGovernedTool(input.toolName, input.input || {}, input.userId, 0, {
    actorType: 'external_agent',
    actorId: mandateContext.agentId,
    actingOnBehalfOfUserId: input.userId,
    organizationId: mandateContext.mandateChain.principal.organizationId,
    sourceSurface: 'external_agent',
    sourceAgent: mandateContext.agentPlatformId || 'definitive-mcp-v0.1',
    mandateScope: mandateContext.mandateId,
  });
  const result = parseToolResult(raw);
  const ok = !(result && typeof result === 'object' && ('error' in result || 'tollgate' in result));

  if (routeMetersCall) {
    await recordV19UsageEvent({
      userId: input.userId,
      eventType: 'api_call',
      actionId: `definitive.${input.toolName}`,
      toolName: input.toolName,
      sourceSurface: 'mcp',
      actorType: 'agent',
      resourceType: 'definitive_tool',
      resourceId: input.toolName,
      agentId: mandateContext.agentId,
      agentPlatformId: mandateContext.agentPlatformId,
      mandateId: mandateContext.mandateId,
      requestedScopes,
      metadata: {
        protocol: DEFINITIVE_MCP_PROTOCOL,
        lineStatus: line?.lineStatus || 'ok',
        ok,
      },
    });
  }

  return {
    status: ok ? 200 : 400,
    body: {
      ok,
      toolName: input.toolName,
      protocol: DEFINITIVE_MCP_PROTOCOL,
      lineStatus: line?.lineStatus || 'ok',
      lineReason: line?.lineReason || '',
      refusalBehavior: line?.refusalBehavior || 'allow',
      lineRisks: line?.lineRisks || [],
      requiredScopes: requestedScopes,
      result,
      mandateChain: mandateContext.mandateChain,
      ...versionPayload(),
    },
  };
}

function evaluateLineGate(
  toolName: string,
  toolInput: Record<string, any>,
  envelope: Record<string, any>,
  line?: DefinitiveLineContract,
): DefinitiveLineGateResult {
  if (!line) {
    return lineBlocked(
      403,
      'LINE_VIOLATION',
      'This tool is not registered in the DEFINITIVE action contract inventory.',
      'LINE_VIOLATION',
    );
  }

  if (line.lineStatus === 'ok') {
    return { allowed: true };
  }

  if (line.lineStatus === 'human_approval_required') {
    if (hasExplicitHumanApproval(toolInput, envelope)) return { allowed: true };
    return lineBlocked(
      428,
      'human_approval_required',
      `${line.label} needs explicit human approval before an external agent may execute it.`,
      line.lineStatus,
      {
        requiredAction: 'Ask the user to approve the action, then retry with confirmed=true or envelope.humanApproval.confirmed=true.',
      },
    );
  }

  if (line.lineStatus === 'counsel_review_required') {
    if (toolName === 'defer_to_counsel') return { allowed: true };
    if (hasCounselReviewClearance(envelope)) return { allowed: true };
    return lineBlocked(
      428,
      'counsel_review_required',
      `${line.label} needs counsel or qualified professional review before execution.`,
      line.lineStatus,
      {
        requiredAction: 'Create a counsel deferral packet or provide envelope.counselReview.cleared=true after qualified review.',
      },
    );
  }

  if (line.lineStatus === 'enterprise_scope_required') {
    if (hasEnterpriseScope(envelope)) return { allowed: true };
    return lineBlocked(
      403,
      'enterprise_scope_required',
      `${line.label} requires governed enterprise scope and cannot be run by a general external agent token.`,
      line.lineStatus,
      {
        requiredAction: 'Use an enterprise-scoped token with envelope.enterpriseScope.approved=true.',
      },
    );
  }

  if (line.lineStatus === 'credit_budget_required') {
    return lineBlocked(
      402,
      'credit_budget_required',
      `${line.label} requires available credits or a contracted compute budget before execution.`,
      line.lineStatus,
      {
        requiredAction: 'Check entitlements and retry after the budget gate clears.',
      },
    );
  }

  return lineBlocked(
    403,
    'LINE_VIOLATION',
    `${line.label} is refused by construction because it crosses THE LINE.`,
    line.lineStatus,
  );
}

function lineBlocked(status: number, code: string, message: string, lineStatus: string, extra: Record<string, any> = {}) {
  return {
    allowed: false,
    status,
    code,
    message,
    tollgate: {
      code,
      lineStatus,
      yuliaReadable: message,
      ...extra,
    },
  };
}

function hasExplicitHumanApproval(toolInput: Record<string, any>, envelope: Record<string, any>) {
  return (
    inputHasExplicitConfirmation(toolInput) ||
    envelope.confirmed === true ||
    envelope.userConfirmed === true ||
    envelope.humanApproval?.confirmed === true
  );
}

function hasCounselReviewClearance(envelope: Record<string, any>) {
  return envelope.counselReview?.cleared === true || envelope.counselReviewCleared === true;
}

function hasEnterpriseScope(envelope: Record<string, any>) {
  return envelope.enterpriseScope?.approved === true || envelope.enterpriseScopeApproved === true;
}

function validateVersionEnvelope(envelope: Record<string, any>) {
  const specVersion = nullableString(envelope.specVersion);
  const specUri = nullableString(envelope.specUri);
  const methodologyVersion = nullableString(envelope.methodologyVersion);
  const methodologyUri = nullableString(envelope.methodologyUri);

  if (specVersion && specVersion !== DEFINITIVE_SPEC_VERSION) {
    return unsupportedVersion('specVersion', specVersion, DEFINITIVE_SPEC_VERSION);
  }
  if (specUri && specUri !== DEFINITIVE_SPEC_URI) {
    return unsupportedVersion('specUri', specUri, DEFINITIVE_SPEC_URI);
  }
  if (methodologyVersion && methodologyVersion !== DEFINITIVE_METHODOLOGY_VERSION) {
    return unsupportedVersion('methodologyVersion', methodologyVersion, DEFINITIVE_METHODOLOGY_VERSION);
  }
  if (methodologyUri && methodologyUri !== DEFINITIVE_METHODOLOGY_URI) {
    return unsupportedVersion('methodologyUri', methodologyUri, DEFINITIVE_METHODOLOGY_URI);
  }
  return null;
}

function unsupportedVersion(field: string, received: string, expected: string) {
  return {
    ok: false,
    error: 'unsupported_version',
    field,
    received,
    expected,
    ...versionPayload(),
  };
}

function versionPayload() {
  return {
    specVersion: DEFINITIVE_SPEC_VERSION,
    specUri: DEFINITIVE_SPEC_URI,
    methodologyVersion: DEFINITIVE_METHODOLOGY_VERSION,
    methodologyUri: DEFINITIVE_METHODOLOGY_URI,
  };
}

function parseToolResult(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return { text: value };
  }
}

function nullableString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function nullableNumber(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function normalizeScopes(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map(String).map(scope => scope.trim()).filter(Boolean))];
}
