import { createHash } from 'crypto';
import { definitiveVersionPayload } from '../constants/definitive.js';

export function createDefinitiveHash(value: unknown): string {
  return createHash('sha256').update(stableStringify(value)).digest('hex');
}

export function buildModelBackedChatAuditPacket(input: {
  userId: number;
  conversationId: number;
  assistantMessageId: number;
  deal: Record<string, any>;
  assistantText: string;
  readiness: Record<string, any> | null;
}): Record<string, any> {
  const responseHash = createHash('sha256').update(input.assistantText).digest('hex');
  const modelStack = {
    requiredModels: safeArray(input.readiness?.requiredModels),
    latestModels: safeArray(input.readiness?.models).map(model => ({
      modelId: model.modelId ?? model.id ?? null,
      status: model.status ?? null,
      outputHash: model.outputHash ?? null,
      executedAt: model.executedAt ?? model.createdAt ?? null,
    })),
  };
  const citationsValidated = safeRecord(input.readiness?.citationValidation);
  const mode2Triggers = safeArray(input.readiness?.issues).map(issue => ({
    code: issue.code ?? null,
    severity: issue.severity ?? null,
    detail: issue.detail ?? null,
  }));
  const inputManifest = {
    ...definitiveVersionPayload(),
    conversationId: input.conversationId,
    assistantMessageId: input.assistantMessageId,
    userId: input.userId,
    deal: {
      id: input.deal.id ?? null,
      journey: input.deal.journey_type ?? input.readiness?.journey ?? null,
      league: input.deal.league ?? null,
      dealType: input.deal.deal_type ?? null,
    },
    responseHash,
    modelStack,
    resourceUris: safeArray(input.readiness?.resourceUris),
    citationsValidated,
    mode2Triggers,
  };
  const inputHash = createDefinitiveHash(inputManifest);
  const outputHash = createDefinitiveHash({
    ...definitiveVersionPayload(),
    conversationId: input.conversationId,
    assistantMessageId: input.assistantMessageId,
    responseHash,
    modelStack,
  });
  const packetCore = {
    schemaVersion: 'model-backed-chat-audit-v1',
    ...definitiveVersionPayload(),
    conversation: {
      id: input.conversationId,
      assistantMessageId: input.assistantMessageId,
      userId: input.userId,
    },
    deal: {
      id: input.deal.id ?? null,
      journey: input.deal.journey_type ?? input.readiness?.journey ?? null,
      league: input.deal.league ?? null,
      dealType: input.deal.deal_type ?? null,
    },
    response: {
      responseHash,
      responseLength: input.assistantText.length,
      inputHash,
      outputHash,
    },
    modelStack,
    readiness: {
      checkedAt: input.readiness?.checkedAt ?? null,
      readyForModelBackedClaims: input.readiness?.readyForModelBackedClaims ?? null,
      resourceUris: safeArray(input.readiness?.resourceUris),
    },
    citationsValidated,
    mode2Triggers,
  };

  return {
    ...packetCore,
    auditPacketHash: createDefinitiveHash(packetCore),
    generatedAt: new Date().toISOString(),
  };
}

function stableStringify(value: unknown): string {
  if (value === null || value === undefined) return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(item => stableStringify(item)).join(',')}]`;
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record).sort().map(key => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function safeArray(value: unknown): any[] {
  return Array.isArray(value) ? value : [];
}

function safeRecord(value: unknown): Record<string, any> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, any> : {};
}
