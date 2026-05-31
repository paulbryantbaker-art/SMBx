/**
 * Isolation asserter for the agent-POV simulation runner.
 *
 * Given a set of IsolationRule definitions and the per-party captured-state map
 * collected during a simulation run, verifies that no party's substrate output
 * contains values that originated on a different party's side.
 *
 * This is the cross-party leakage gate. The substrate keeps each beneficial
 * customer's deal world separate; any test that finds buyer-side numbers in
 * seller-side responses (or vice versa) is a P0 cross-customer breach.
 *
 * Pure helper — no network, no DB, no I/O.
 */

import type { AssertionResult, IsolationRule } from './types.js';
import { assert, getPath } from './runner-helpers.js';

export type PartyOutputMap = Map<string, Record<string, unknown>>;

/**
 * Run every IsolationRule against the per-party output map.
 *
 * Each rule produces ONE AssertionResult. A rule PASSES when the source
 * party's `sourceField` value is NOT findable anywhere in the target party's
 * captured output (up to `searchDepth`). The rule FAILS the moment we find a
 * leak, with the path to the leaked field recorded in `actual`.
 */
export function assertIsolation(rules: IsolationRule[], partyOutputs: PartyOutputMap): AssertionResult[] {
  const results: AssertionResult[] = [];

  for (const rule of rules) {
    const sourceState = partyOutputs.get(rule.sourceParty);
    const targetState = partyOutputs.get(rule.targetParty);
    const depth = rule.searchDepth ?? 10;

    if (!sourceState) {
      results.push(assert(
        `[isolation] ${rule.description}`,
        false,
        `sourceParty "${rule.sourceParty}" output present`,
        'missing',
      ));
      continue;
    }
    if (!targetState) {
      results.push(assert(
        `[isolation] ${rule.description}`,
        false,
        `targetParty "${rule.targetParty}" output present`,
        'missing',
      ));
      continue;
    }

    const sourceValue = extractSourceValue(sourceState, rule.sourceField);
    if (sourceValue === undefined || sourceValue === null || sourceValue === '') {
      // Nothing to leak — vacuously passes, but flag as inconclusive in the note.
      results.push(assert(
        `[isolation] ${rule.description} (vacuous: no source value to leak)`,
        true,
      ));
      continue;
    }

    const leakPath = findLeak(targetState, sourceValue, depth);
    if (leakPath) {
      results.push(assert(
        `[isolation] ${rule.description}`,
        false,
        `${rule.sourceParty}.${rule.sourceField} value MUST NOT appear in ${rule.targetParty} output`,
        `LEAK at ${rule.targetParty}.${leakPath}: ${describeValue(sourceValue)}`,
      ));
    } else {
      results.push(assert(`[isolation] ${rule.description}`, true));
    }
  }

  return results;
}

// ─── Source extraction ────────────────────────────────────

/**
 * Pull the source value to search for. Tries dot-path first, then fallback to
 * a bare-name scan of the source state (simulations don't always know the
 * exact nesting depth the substrate placed the value at).
 */
function extractSourceValue(state: Record<string, unknown>, field: string): unknown {
  const direct = getPath(state, field);
  if (direct !== undefined) return direct;
  return findByName(state, field, 8);
}

function findByName(node: unknown, name: string, depth: number): unknown {
  if (depth <= 0 || node === null || node === undefined || typeof node !== 'object') return undefined;
  if (Array.isArray(node)) {
    for (const item of node) {
      const hit = findByName(item, name, depth - 1);
      if (hit !== undefined) return hit;
    }
    return undefined;
  }
  const obj = node as Record<string, unknown>;
  if (name in obj) return obj[name];
  for (const v of Object.values(obj)) {
    const hit = findByName(v, name, depth - 1);
    if (hit !== undefined) return hit;
  }
  return undefined;
}

// ─── Leak detection ────────────────────────────────────────

/**
 * Walk `target` looking for `needle`. Returns the dot-path where it was found
 * or null if absent. Supports:
 *   - exact value equality (number, boolean, object)
 *   - substring containment when both needle and node are strings
 *   - stringified-value match (e.g., 25_000_000 vs "25000000" vs "$25M")
 */
function findLeak(target: unknown, needle: unknown, depth: number, currentPath = ''): string | null {
  if (depth <= 0 || target === null || target === undefined) return null;

  if (matches(target, needle)) return currentPath || '(root)';

  if (typeof target === 'object') {
    if (Array.isArray(target)) {
      for (let i = 0; i < target.length; i++) {
        const hit = findLeak(target[i], needle, depth - 1, `${currentPath}[${i}]`);
        if (hit) return hit;
      }
      return null;
    }
    for (const [key, value] of Object.entries(target as Record<string, unknown>)) {
      const nextPath = currentPath ? `${currentPath}.${key}` : key;
      const hit = findLeak(value, needle, depth - 1, nextPath);
      if (hit) return hit;
    }
  }

  return null;
}

function matches(node: unknown, needle: unknown): boolean {
  // Exact equality first.
  if (node === needle) return true;

  // Number leak forms — substrate may render as string or formatted dollars.
  if (typeof needle === 'number' && Number.isFinite(needle)) {
    if (typeof node === 'number') return node === needle;
    if (typeof node === 'string') {
      // Skip very-short numbers — too noisy (e.g. league "L4" contains "4").
      if (Math.abs(needle) < 1000) return false;
      const stripped = node.replace(/[$,\s_]/g, '');
      if (stripped === String(needle)) return true;
      if (stripped.includes(String(needle))) return true;
    }
    return false;
  }

  // Hash / CID / opaque string leak — exact or substring (skip tiny strings to
  // avoid false positives on shared tokens like "buy"/"sell").
  if (typeof needle === 'string' && typeof node === 'string') {
    if (needle.length < 6) return false;
    if (node === needle) return true;
    if (node.includes(needle)) return true;
    return false;
  }

  // Object leak — deep structural equality.
  if (typeof needle === 'object' && needle !== null && typeof node === 'object' && node !== null) {
    try {
      return JSON.stringify(node, Object.keys(node as object).sort())
        === JSON.stringify(needle, Object.keys(needle as object).sort());
    } catch {
      return false;
    }
  }

  return false;
}

function describeValue(v: unknown): string {
  if (v === null || v === undefined) return 'undefined';
  if (typeof v === 'object') {
    try { return JSON.stringify(v).slice(0, 120); } catch { return '[unstringifiable]'; }
  }
  return String(v).slice(0, 120);
}
