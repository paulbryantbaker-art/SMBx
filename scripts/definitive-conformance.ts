#!/usr/bin/env npx tsx
/**
 * DEFINITIVE conformance harness.
 *
 * This is intentionally data-driven: the public/reference path should be able
 * to run the same JSON cases against TypeScript now and Python later.
 *
 * Run: npm run test:definitive-conformance
 */

import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  DEFINITIVE_METHODOLOGY_URI,
  DEFINITIVE_SPEC_VERSION,
} from '../server/constants/definitive.js';
import {
  DEFINITIVE_CONFORMANCE_DEAL_ROUTE_CASE_COUNT,
  DEFINITIVE_CONFORMANCE_MODEL_RUNTIME_CASE_COUNT,
  DEFINITIVE_CONFORMANCE_PROMPT_META_CASE_COUNT,
  DEFINITIVE_CONFORMANCE_TOTAL_CASE_COUNT,
} from '../server/services/definitiveConformanceStatus.js';
import { listDefinitiveLineInventory } from '../server/services/agencyActionRegistry.js';
import { buildAgentCard } from '../server/services/agentCard.js';
import {
  DEFINITIVE_DEAL_MECHANICS_VERSION,
  getDefinitivePassThroughSurface,
} from '../server/services/definitiveDealMechanicsCatalog.js';
import {
  buildDefinitiveYuliaMechanicsBrief,
  composeDefinitiveApplicableMechanics,
  buildDefinitiveSurfaceMechanicsSummary,
  summarizeDefinitiveApplicableMechanics,
  type DefinitiveRouteReadiness,
  type DefinitiveToolSurface,
} from '../server/services/definitiveDealRouteMap.js';
import { buildDefinitiveSpecManifest } from '../server/services/definitiveSpecManifest.js';
import { listDefinitiveMcpTools } from '../server/services/definitiveMcp.js';
import { executeV19Model } from '../server/services/v19ModelRuntime.js';

interface ConformanceCase {
  id: string;
  title: string;
  specVersion: string;
  methodologyUri: string;
  modelId: string;
  input: Record<string, any>;
  expect: {
    status: 'complete' | 'needs_inputs';
    outputs?: Record<string, any>;
    missingInputsIncludes?: string[];
  };
}

interface DealMechanicsRouteCase {
  id: string;
  title: string;
  specVersion: string;
  methodologyUri: string;
  dealMechanicsVersion: string;
  input: {
    journey?: 'sell' | 'buy' | 'raise' | 'pmi';
    league?: string;
    dealType?: string;
    industry?: string;
    jurisdiction?: string;
    triggeredGates?: string[];
  };
  expect: {
    slotIdsInclude: string[];
    readinessAtLeast?: Partial<Record<DefinitiveRouteReadiness, number>>;
    toolSurfacesInclude?: Partial<Record<DefinitiveToolSurface, string[]>>;
    yuliaBriefIncludes?: string[];
  };
}

type PromptMetaCaseKind =
  | 'empty_yulia_brief'
  | 'yulia_brief'
  | 'surface_summary'
  | 'manifest'
  | 'agent_card'
  | 'line_inventory'
  | 'mcp_inventory'
  | 'pass_through_surface';

interface PromptMetaFieldExpectation {
  path: string;
  equals?: any;
  includes?: any;
  notIncludes?: any;
  min?: number;
  max?: number;
  exists?: boolean;
  lengthAtLeast?: number;
}

interface PromptMetaCase {
  id: string;
  title: string;
  specVersion: string;
  methodologyUri: string;
  kind: PromptMetaCaseKind;
  input?: Record<string, any>;
  expect: {
    textIncludes?: string[];
    textExcludes?: string[];
    fields?: PromptMetaFieldExpectation[];
  };
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const caseFile = path.resolve(__dirname, '../testing/definitive/conformance/v1/model-runtime.cases.json');
const routeCaseFile = path.resolve(__dirname, '../testing/definitive/conformance/v1/deal-mechanics-route.cases.json');
const promptMetaCaseFile = path.resolve(__dirname, '../testing/definitive/conformance/v1/prompt-meta.cases.json');

const cases: ConformanceCase[] = JSON.parse(await readFile(caseFile, 'utf8'));
const routeCases: DealMechanicsRouteCase[] = JSON.parse(await readFile(routeCaseFile, 'utf8'));
const promptMetaCases: PromptMetaCase[] = JSON.parse(await readFile(promptMetaCaseFile, 'utf8'));
let passed = 0;
let failed = 0;

console.log('\nDEFINITIVE conformance harness');
console.log(`Loaded ${cases.length} cases from ${path.relative(process.cwd(), caseFile)}`);
console.log(`Loaded ${routeCases.length} route cases from ${path.relative(process.cwd(), routeCaseFile)}`);
console.log(`Loaded ${promptMetaCases.length} prompt/meta cases from ${path.relative(process.cwd(), promptMetaCaseFile)}`);
assertEqual(cases.length, DEFINITIVE_CONFORMANCE_MODEL_RUNTIME_CASE_COUNT, 'conformance case count manifest');
assertEqual(routeCases.length, DEFINITIVE_CONFORMANCE_DEAL_ROUTE_CASE_COUNT, 'deal route conformance case count manifest');
assertEqual(promptMetaCases.length, DEFINITIVE_CONFORMANCE_PROMPT_META_CASE_COUNT, 'prompt/meta conformance case count manifest');
assertEqual(cases.length + routeCases.length + promptMetaCases.length, DEFINITIVE_CONFORMANCE_TOTAL_CASE_COUNT, 'total conformance case count manifest');

for (const item of cases) {
  try {
    assertEqual(item.specVersion, DEFINITIVE_SPEC_VERSION, `${item.id} specVersion`);
    assertEqual(item.methodologyUri, DEFINITIVE_METHODOLOGY_URI, `${item.id} methodologyUri`);

    const run = await executeV19Model({ modelId: item.modelId, input: item.input });
    assertEqual(run.status, item.expect.status, `${item.id} status`);
    assertEqual(run.auditPayload.specVersion, DEFINITIVE_SPEC_VERSION, `${item.id} audit specVersion`);
    assertEqual(run.auditPayload.methodologyUri, DEFINITIVE_METHODOLOGY_URI, `${item.id} audit methodologyUri`);
    assert(run.outputHash.length === 64, `${item.id} output hash should be sha256`);

    for (const [key, expected] of Object.entries(item.expect.outputs || {})) {
      assertEqual(run.outputs[key], expected, `${item.id} output ${key}`);
    }

    for (const missing of item.expect.missingInputsIncludes || []) {
      assert(run.missingInputs.includes(missing), `${item.id} expected missing input ${missing}`);
    }

    console.log(`  ✓ ${item.id} ${item.title}`);
    passed++;
  } catch (error: any) {
    console.log(`  ✗ ${item.id} ${item.title} - ${error.message}`);
    failed++;
  }
}

for (const item of routeCases) {
  try {
    assertEqual(item.specVersion, DEFINITIVE_SPEC_VERSION, `${item.id} specVersion`);
    assertEqual(item.methodologyUri, DEFINITIVE_METHODOLOGY_URI, `${item.id} methodologyUri`);
    assertEqual(item.dealMechanicsVersion, DEFINITIVE_DEAL_MECHANICS_VERSION, `${item.id} dealMechanicsVersion`);

    const mechanics = composeDefinitiveApplicableMechanics(item.input);
    const summary = summarizeDefinitiveApplicableMechanics(mechanics);
    const yuliaBrief = buildDefinitiveYuliaMechanicsBrief(mechanics, summary);

    for (const slotId of item.expect.slotIdsInclude) {
      assert(mechanics.some(mechanic => mechanic.slotId === slotId), `${item.id} expected applicable mechanic ${slotId}`);
    }

    for (const [readiness, minimum] of Object.entries(item.expect.readinessAtLeast || {}) as Array<[keyof typeof summary | DefinitiveRouteReadiness, number]>) {
      const actual = summaryCountForReadiness(summary, readiness);
      assert(actual >= minimum, `${item.id} expected ${readiness} >= ${minimum}, got ${actual}`);
    }

    for (const [surface, slotIds] of Object.entries(item.expect.toolSurfacesInclude || {}) as Array<[DefinitiveToolSurface, string[]]>) {
      for (const slotId of slotIds) {
        const mechanic = mechanics.find(item => item.slotId === slotId);
        assert(mechanic, `${item.id} expected applicable mechanic ${slotId} for ${surface}`);
        assert(mechanic.toolSurfaces.includes(surface), `${item.id} expected ${slotId} to expose ${surface}`);
      }
    }

    for (const expectedText of item.expect.yuliaBriefIncludes || []) {
      assert(yuliaBrief.some(line => line.includes(expectedText)), `${item.id} expected Yulia brief to include ${expectedText}`);
    }

    console.log(`  ✓ ${item.id} ${item.title}`);
    passed++;
  } catch (error: any) {
    console.log(`  ✗ ${item.id} ${item.title} - ${error.message}`);
    failed++;
  }
}

for (const item of promptMetaCases) {
  try {
    assertEqual(item.specVersion, DEFINITIVE_SPEC_VERSION, `${item.id} specVersion`);
    assertEqual(item.methodologyUri, DEFINITIVE_METHODOLOGY_URI, `${item.id} methodologyUri`);

    const subject = buildPromptMetaSubject(item);
    for (const expectedText of item.expect.textIncludes || []) {
      assert(subject.text.includes(expectedText), `${item.id} expected prompt/meta text to include ${expectedText}`);
    }
    for (const blockedText of item.expect.textExcludes || []) {
      assert(!subject.text.includes(blockedText), `${item.id} expected prompt/meta text to exclude ${blockedText}`);
    }
    for (const field of item.expect.fields || []) {
      assertPromptMetaField(subject.data, field, item.id);
    }

    console.log(`  ✓ ${item.id} ${item.title}`);
    passed++;
  } catch (error: any) {
    console.log(`  ✗ ${item.id} ${item.title} - ${error.message}`);
    failed++;
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (expected && typeof expected === 'object') {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`${message}. Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
    return;
  }
  if (actual !== expected) {
    throw new Error(`${message}. Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function summaryCountForReadiness(
  summary: ReturnType<typeof summarizeDefinitiveApplicableMechanics>,
  readiness: DefinitiveRouteReadiness | keyof ReturnType<typeof summarizeDefinitiveApplicableMechanics>,
): number {
  if (readiness === 'planning_only') return summary.planningOnly;
  if (readiness === 'professional_handoff') return summary.professionalHandoff;
  if (readiness === 'research_only') return summary.researchOnly;
  if (readiness === 'pass_through_required') return summary.passThroughRequired;
  if (readiness === 'executable') return summary.executable;
  if (readiness === 'reserved') return summary.reserved;
  return Number(summary[readiness as keyof typeof summary] || 0);
}

function buildPromptMetaSubject(item: PromptMetaCase): { text: string; data: Record<string, any> } {
  if (item.kind === 'empty_yulia_brief') {
    const brief = buildDefinitiveYuliaMechanicsBrief([]);
    return { text: brief.join('\n'), data: { brief } };
  }

  if (item.kind === 'yulia_brief') {
    const mechanics = composeDefinitiveApplicableMechanics(item.input || {});
    const summary = summarizeDefinitiveApplicableMechanics(mechanics);
    const brief = buildDefinitiveYuliaMechanicsBrief(mechanics, summary);
    const data = {
      input: item.input || {},
      summary,
      brief,
      slots: mechanics.map(mechanic => mechanic.slotId),
      surfaces: [...new Set(mechanics.flatMap(mechanic => mechanic.toolSurfaces))],
      readiness: mechanics.reduce<Record<string, string[]>>((acc, mechanic) => {
        acc[mechanic.readiness] = acc[mechanic.readiness] || [];
        acc[mechanic.readiness].push(mechanic.slotId);
        return acc;
      }, {}),
      professionalSlots: mechanics
        .filter(mechanic => mechanic.lineCategory === 'professional_handoff' || mechanic.readiness === 'professional_handoff')
        .map(mechanic => mechanic.slotId),
      boundaries: mechanics.map(mechanic => mechanic.boundary),
    };
    return { text: [brief.join('\n'), JSON.stringify(data)].join('\n'), data };
  }

  if (item.kind === 'surface_summary') {
    const surface = item.input?.surface;
    const summary = buildDefinitiveSurfaceMechanicsSummary().find(item => item.surface === surface);
    assert(summary, `${item.id} expected surface summary for ${surface}`);
    return { text: JSON.stringify(summary), data: summary };
  }

  if (item.kind === 'manifest') {
    const manifest = buildDefinitiveSpecManifest();
    return { text: JSON.stringify(manifest), data: manifest };
  }

  if (item.kind === 'agent_card') {
    const card = buildAgentCard();
    return { text: JSON.stringify(card), data: card };
  }

  if (item.kind === 'line_inventory') {
    const inventory = listDefinitiveLineInventory();
    const statusCounts = inventory.reduce<Record<string, number>>((acc, contract) => {
      acc[contract.lineStatus] = (acc[contract.lineStatus] || 0) + 1;
      return acc;
    }, {});
    const tools = Object.fromEntries(inventory.map(contract => [contract.toolName, contract]));
    const data = { statusCounts, tools, toolNames: inventory.map(contract => contract.toolName) };
    return { text: JSON.stringify(data), data };
  }

  if (item.kind === 'mcp_inventory') {
    const inventory = listDefinitiveMcpTools();
    const tools = Object.fromEntries(inventory.tools.map(tool => [tool.name, tool]));
    const data = { ...inventory, toolNames: inventory.tools.map(tool => tool.name), toolsByName: tools };
    return { text: JSON.stringify(data), data };
  }

  if (item.kind === 'pass_through_surface') {
    const surface = getDefinitivePassThroughSurface();
    return { text: JSON.stringify(surface), data: surface };
  }

  throw new Error(`${item.id} unsupported prompt/meta case kind ${item.kind}`);
}

function assertPromptMetaField(data: Record<string, any>, field: PromptMetaFieldExpectation, caseId: string) {
  const actual = valueAtPath(data, field.path);
  if ('exists' in field) {
    assert(field.exists ? actual !== undefined : actual === undefined, `${caseId} field ${field.path} existence mismatch`);
  }
  if ('equals' in field) {
    assertEqual(actual, field.equals, `${caseId} field ${field.path}`);
  }
  if ('includes' in field) {
    assertIncludes(actual, field.includes, `${caseId} field ${field.path}`);
  }
  if ('notIncludes' in field) {
    assertNotIncludes(actual, field.notIncludes, `${caseId} field ${field.path}`);
  }
  if (typeof field.min === 'number') {
    assert(Number(actual) >= field.min, `${caseId} field ${field.path} expected >= ${field.min}, got ${actual}`);
  }
  if (typeof field.max === 'number') {
    assert(Number(actual) <= field.max, `${caseId} field ${field.path} expected <= ${field.max}, got ${actual}`);
  }
  if (typeof field.lengthAtLeast === 'number') {
    assert(actual && typeof actual.length === 'number', `${caseId} field ${field.path} expected length-bearing value`);
    assert(actual.length >= field.lengthAtLeast, `${caseId} field ${field.path} expected length >= ${field.lengthAtLeast}, got ${actual.length}`);
  }
}

function valueAtPath(data: any, fieldPath: string): any {
  return fieldPath.split('.').reduce((current, segment) => {
    if (current === undefined || current === null) return undefined;
    if (Array.isArray(current) && /^\d+$/.test(segment)) return current[Number(segment)];
    return current[segment];
  }, data);
}

function assertIncludes(actual: any, expected: any, message: string) {
  if (Array.isArray(actual)) {
    assert(actual.includes(expected), `${message} expected to include ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    return;
  }
  assert(String(actual).includes(String(expected)), `${message} expected to include ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

function assertNotIncludes(actual: any, expected: any, message: string) {
  if (Array.isArray(actual)) {
    assert(!actual.includes(expected), `${message} expected not to include ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    return;
  }
  assert(!String(actual).includes(String(expected)), `${message} expected not to include ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}
