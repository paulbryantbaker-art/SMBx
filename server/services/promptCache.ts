/**
 * server/services/promptCache.ts — the prompt-cache seam, kept pure.
 *
 * (2026-08-14.) The marker and the splitter are two halves of one contract, so
 * they live together: `promptBuilder` emits `CACHE_SPLIT` between the frozen
 * doctrine and the first per-request layer, and `aiService` cuts on it.
 *
 * WHY ITS OWN FILE rather than either of theirs: both of those import Postgres
 * at module load, so a test touching them cannot run without a database. This
 * is the piece worth testing — an off-by-one here silently caches something
 * volatile, which costs 1.25× forever and reads as a saving — so it is
 * dependency-free and `npm run test:prompt-cache` exercises it directly.
 *
 * PURE: no db, no API key, no env, no clock.
 */
import type Anthropic from '@anthropic-ai/sdk';

/**
 * The split marker.
 *
 * Deliberately unmistakable. If this string ever reaches a model, something
 * failed to split — and that is a loud symptom rather than a subtle one,
 * which is the point of not choosing a plausible-looking separator.
 */
export const CACHE_SPLIT = '<<<SMBX_PROMPT_CACHE_BREAKPOINT>>>';

/**
 * Split a built system prompt into [cacheable prefix, per-request remainder].
 *
 * Falls back to ONE UNCACHED BLOCK when the marker is absent. That is the
 * honest behaviour for prompts not built by `buildSystemPrompt` — the
 * anonymous and intake prompts have no frozen half worth caching, and picking
 * a split point for them by guesswork risks caching something volatile, which
 * is strictly worse than not caching at all.
 */
export function splitCachedSystem(systemPrompt: string): Anthropic.TextBlockParam[] {
  const at = systemPrompt.indexOf(CACHE_SPLIT);
  if (at === -1) return [{ type: 'text', text: systemPrompt }];

  const frozen = systemPrompt.slice(0, at).trimEnd();
  const rest = systemPrompt.slice(at + CACHE_SPLIT.length).trimStart();

  // An empty frozen half would mean the marker landed first — nothing to
  // cache, and a zero-length text block is rejected by the API. Send the
  // remainder uncached rather than an invalid request.
  if (!frozen) return rest ? [{ type: 'text', text: rest }] : [{ type: 'text', text: systemPrompt }];

  const blocks: Anthropic.TextBlockParam[] = [
    { type: 'text', text: frozen, cache_control: { type: 'ephemeral' } },
  ];
  if (rest) blocks.push({ type: 'text', text: rest });
  return blocks;
}

/**
 * Put a cache breakpoint on the last tool definition.
 *
 * Tools render BEFORE system in the prefix, so one breakpoint here covers the
 * whole tool array — 14.1k tokens of schema that cannot vary by user, deal or
 * turn. Copies rather than mutating: `TOOL_DEFINITIONS` is a shared
 * module-level array and several other call sites read it.
 */
export function withToolCache<T extends object>(tools: readonly T[]): T[] {
  if (!tools.length) return [...tools];
  return tools.map((t, i) =>
    i === tools.length - 1 ? { ...t, cache_control: { type: 'ephemeral' as const } } : { ...t },
  );
}

/**
 * How many `cache_control` breakpoints a request would carry. The API allows
 * at most FOUR; exceeding it is a 400, and it is the kind of thing a later
 * change adds without noticing.
 */
export function countBreakpoints(parts: {
  system?: readonly unknown[];
  tools?: readonly unknown[];
}): number {
  const has = (x: unknown) => !!x && typeof x === 'object' && 'cache_control' in (x as object);
  return (parts.system ?? []).filter(has).length + (parts.tools ?? []).filter(has).length;
}
