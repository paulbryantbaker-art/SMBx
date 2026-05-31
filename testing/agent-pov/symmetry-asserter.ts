/**
 * Symmetry asserter for the agent-POV simulation runner.
 *
 * Given a set of SymmetryRule definitions and the per-party captured-state map
 * collected during a simulation run, verifies that the parties' substrate
 * outputs converge on the methodology in the ways the simulation declares
 * (overlapping valuation ranges, equal version pins, subset of citations, etc.).
 *
 * This is a pure helper — no network, no DB, no I/O. The runner is responsible
 * for collecting party state and turning the AssertionResults into a
 * ScenarioResult.
 *
 * Read TEST_PLAN_SUBSTRATE_AGENT_POV.md §4.2 for the symmetry contract.
 */

import type { AssertionResult, SymmetryRule } from './types.js';
import { assert, getPath } from './runner-helpers.js';

export type PartyOutputMap = Map<string, Record<string, unknown>>;

/**
 * Run every SymmetryRule against the per-party output map.
 *
 * Each rule produces ONE AssertionResult. If `rule.parties` is omitted, the rule
 * is asserted pairwise across all party combinations (and fails if any pair
 * disagrees).
 */
export function assertSymmetry(rules: SymmetryRule[], partyOutputs: PartyOutputMap): AssertionResult[] {
  const results: AssertionResult[] = [];
  const allRoles = Array.from(partyOutputs.keys());

  for (const rule of rules) {
    const targetRoles = rule.parties && rule.parties.length > 0 ? rule.parties : allRoles;

    // Pull the values for each named role. Missing roles become `undefined`.
    const values = targetRoles.map(role => ({
      role,
      value: extractField(partyOutputs.get(role), rule.field),
    }));

    const present = values.filter(v => v.value !== undefined);
    if (present.length < 2) {
      results.push(assert(
        `[symmetry] ${rule.description}`,
        false,
        `>=2 parties with field "${rule.field}"`,
        `${present.length} parties have it (roles with values: ${present.map(p => p.role).join(', ') || 'none'})`,
      ));
      continue;
    }

    // Anchor on the first present value; compare every other one to it.
    const anchor = present[0];
    const failures: string[] = [];
    for (let i = 1; i < present.length; i++) {
      const other = present[i];
      const ok = compare(anchor.value, other.value, rule.mode, rule.tolerance);
      if (!ok) {
        failures.push(`${anchor.role}<->${other.role}: ${describeValue(anchor.value)} vs ${describeValue(other.value)}`);
      }
    }

    if (failures.length === 0) {
      results.push(assert(`[symmetry] ${rule.description}`, true));
    } else {
      results.push(assert(
        `[symmetry] ${rule.description}`,
        false,
        `${rule.mode} on field "${rule.field}" across [${targetRoles.join(', ')}]`,
        failures.join(' | '),
      ));
    }
  }

  return results;
}

// ─── Comparison primitives ─────────────────────────────────

function compare(a: unknown, b: unknown, mode: SymmetryRule['mode'], tolerance?: number): boolean {
  switch (mode) {
    case 'equal':
      return deepEqual(a, b);
    case 'within_tolerance':
      return withinTolerance(a, b, tolerance ?? 0.05);
    case 'overlap':
      return rangesOverlap(a, b);
    case 'subset':
      return isSubset(a, b);
    default:
      return false;
  }
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null || a === undefined || b === undefined) return false;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => deepEqual(v, b[i]));
  }
  const aKeys = Object.keys(a as object).sort();
  const bKeys = Object.keys(b as object).sort();
  if (aKeys.length !== bKeys.length) return false;
  if (!aKeys.every((k, i) => k === bKeys[i])) return false;
  return aKeys.every(k => deepEqual((a as any)[k], (b as any)[k]));
}

function withinTolerance(a: unknown, b: unknown, tol: number): boolean {
  const an = asNumber(a);
  const bn = asNumber(b);
  if (an === null || bn === null) return false;
  if (an === 0 && bn === 0) return true;
  const denom = Math.max(Math.abs(an), Math.abs(bn));
  return Math.abs(an - bn) / denom <= tol;
}

/**
 * Treats `a` and `b` as ranges. Each can be:
 *   { low, high } | { min, max } | [low, high] | number (single point)
 * Overlap is inclusive on both ends.
 */
function rangesOverlap(a: unknown, b: unknown): boolean {
  const ra = asRange(a);
  const rb = asRange(b);
  if (!ra || !rb) return false;
  return ra.low <= rb.high && rb.low <= ra.high;
}

/**
 * `subset` mode: the smaller side's values are all present in the larger side.
 * Works for arrays and Sets, falls back to false for other shapes.
 */
function isSubset(a: unknown, b: unknown): boolean {
  const arrA = asArray(a);
  const arrB = asArray(b);
  if (!arrA || !arrB) return false;
  const setA = new Set(arrA.map(stableKey));
  const setB = new Set(arrB.map(stableKey));
  // "subset" passes if either direction is a subset of the other —
  // simulations don't always know which side has the larger citation list.
  const aSubB = Array.from(setA).every(x => setB.has(x));
  const bSubA = Array.from(setB).every(x => setA.has(x));
  return aSubB || bSubA;
}

// ─── Coercion helpers ──────────────────────────────────────

function asNumber(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function asArray(v: unknown): unknown[] | null {
  if (Array.isArray(v)) return v;
  if (v instanceof Set) return Array.from(v);
  return null;
}

interface Range { low: number; high: number }

function asRange(v: unknown): Range | null {
  if (v === null || v === undefined) return null;
  if (typeof v === 'number' && Number.isFinite(v)) return { low: v, high: v };
  if (Array.isArray(v) && v.length === 2) {
    const lo = asNumber(v[0]);
    const hi = asNumber(v[1]);
    if (lo !== null && hi !== null) return { low: Math.min(lo, hi), high: Math.max(lo, hi) };
    return null;
  }
  if (typeof v === 'object') {
    const o = v as Record<string, unknown>;
    const lo = asNumber(o.low ?? o.min ?? o.lower ?? o.low_cents ?? o.lowCents);
    const hi = asNumber(o.high ?? o.max ?? o.upper ?? o.high_cents ?? o.highCents);
    if (lo !== null && hi !== null) return { low: Math.min(lo, hi), high: Math.max(lo, hi) };
  }
  return null;
}

function stableKey(v: unknown): string {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'object') return JSON.stringify(v, Object.keys(v as object).sort());
  return String(v);
}

function describeValue(v: unknown): string {
  if (v === null || v === undefined) return 'undefined';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

/**
 * Field extractor. Supports dot-paths AND scans the whole captured-state object
 * for the field name as a fallback — simulations don't always know the exact
 * nesting depth where a substrate field will land in the response.
 */
function extractField(state: Record<string, unknown> | undefined, field: string): unknown {
  if (!state) return undefined;
  const direct = getPath(state, field);
  if (direct !== undefined) return direct;
  // Fallback: bare-field scan (depth-first).
  return findFieldByName(state, field, 8);
}

function findFieldByName(node: unknown, name: string, depth: number): unknown {
  if (depth <= 0 || node === null || node === undefined) return undefined;
  if (typeof node !== 'object') return undefined;
  if (Array.isArray(node)) {
    for (const item of node) {
      const hit = findFieldByName(item, name, depth - 1);
      if (hit !== undefined) return hit;
    }
    return undefined;
  }
  const obj = node as Record<string, unknown>;
  if (name in obj) return obj[name];
  for (const v of Object.values(obj)) {
    const hit = findFieldByName(v, name, depth - 1);
    if (hit !== undefined) return hit;
  }
  return undefined;
}
