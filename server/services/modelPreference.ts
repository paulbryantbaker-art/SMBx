import type { ModelId } from './modelRouter.js';

export type ModelPreference = 'auto' | 'fast' | 'deep' | 'drafting' | 'research';

const CHAT_MODEL_BY_PREFERENCE: Record<ModelPreference, Exclude<ModelId, 'deterministic'>> = {
  auto: 'claude-sonnet-4-6',
  fast: 'claude-haiku-4-5-20251001',
  deep: 'claude-opus-4-6',
  drafting: 'claude-sonnet-4-6',
  research: 'claude-sonnet-4-6',
};

export function normalizeModelPreference(value: unknown): ModelPreference {
  return value === 'fast' || value === 'deep' || value === 'drafting' || value === 'research'
    ? value
    : 'auto';
}

export function resolveChatModel(value: unknown): Exclude<ModelId, 'deterministic'> {
  return CHAT_MODEL_BY_PREFERENCE[normalizeModelPreference(value)];
}

export function resolveDeliverableModelPreference(
  routed: ModelId,
  value: unknown,
): ModelId {
  const preference = normalizeModelPreference(value);
  if (routed === 'deterministic' || preference === 'auto') return routed;
  if (preference === 'deep') return 'claude-opus-4-6';
  if (preference === 'fast') return 'claude-haiku-4-5-20251001';
  return 'claude-sonnet-4-6';
}

export function describeModelPreference(value: unknown): string {
  switch (normalizeModelPreference(value)) {
    case 'fast':
      return 'Model preference: Fast. Prefer quicker analyst-level responses unless a deterministic or safety-critical process requires otherwise.';
    case 'deep':
      return 'Model preference: Deep. Prefer more thorough VP-level reasoning for chat and generation when cost/latency are acceptable.';
    case 'drafting':
      return 'Model preference: Drafting. Prefer careful document language, structured edits, and deal-ready prose.';
    case 'research':
      return 'Model preference: Research. Prefer source-aware, evidence-oriented analysis and clearly state uncertainty.';
    case 'auto':
    default:
      return 'Model preference: Auto. Route intelligently by task complexity and document type.';
  }
}
