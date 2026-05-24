#!/usr/bin/env npx tsx

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DEFINITIVE_REFERENCE_METHODOLOGY_URI,
  DEFINITIVE_REFERENCE_SPEC_VERSION,
  executeReferenceModel,
  listReferenceModels,
  type ReferenceModelId,
} from '../reference/definitive-ts/src/index.js';

interface FieldExpectation {
  path: string;
  equals?: unknown;
  includes?: unknown;
}

interface ReferenceCase {
  id: string;
  modelId: ReferenceModelId;
  title: string;
  input: Record<string, unknown>;
  expect: {
    specVersion: string;
    methodologyUri: string;
    lineBoundary: string;
    fields: FieldExpectation[];
  };
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const caseFile = path.resolve(__dirname, '../testing/definitive/reference/v1/reference-implementation.cases.json');
const cases: ReferenceCase[] = JSON.parse(await readFile(caseFile, 'utf8'));
let passed = 0;
let failed = 0;

console.log('\nDEFINITIVE TypeScript reference smoke');
console.log(`Loaded ${cases.length} cases from ${path.relative(process.cwd(), caseFile)}`);

const descriptors = listReferenceModels();
assert(descriptors.length >= 4, 'reference model descriptors should expose at least four models');

for (const item of cases) {
  try {
    const run = executeReferenceModel({ modelId: item.modelId, input: item.input } as any);
    assertEqual(run.specVersion, DEFINITIVE_REFERENCE_SPEC_VERSION, `${item.id} package spec version`);
    assertEqual(run.methodologyUri, DEFINITIVE_REFERENCE_METHODOLOGY_URI, `${item.id} package methodology uri`);
    assertEqual(run.specVersion, item.expect.specVersion, `${item.id} expected spec version`);
    assertEqual(run.methodologyUri, item.expect.methodologyUri, `${item.id} expected methodology uri`);
    assertEqual(run.lineBoundary, item.expect.lineBoundary, `${item.id} line boundary`);
    assertEqual(run.deterministic, true, `${item.id} deterministic flag`);
    assertEqual(run.currencyUnit, 'cents', `${item.id} currency unit`);
    assert(run.inputHash.length === 64, `${item.id} input hash should be sha256`);
    assert(run.outputHash.length === 64, `${item.id} output hash should be sha256`);
    assert(run.authorityRefs.length >= 1, `${item.id} should include sample authority refs`);
    assert(run.authorityRefs.every((ref) => ref.id.startsWith('AUTH.SAMPLE.')), `${item.id} should not expose production authority data`);

    for (const expectation of item.expect.fields) {
      const actual = getPath(run, expectation.path);
      if ('equals' in expectation) {
        assertEqual(actual, expectation.equals, `${item.id} ${expectation.path}`);
      }
      if ('includes' in expectation) {
        assertIncludes(actual, expectation.includes, `${item.id} ${expectation.path}`);
      }
    }

    passed++;
    console.log(`PASS ${item.id}`);
  } catch (error) {
    failed++;
    console.error(`FAIL ${item.id}:`, error instanceof Error ? error.message : error);
  }
}

console.log(`\nReference smoke complete: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
}

function getPath(value: any, dottedPath: string): any {
  return dottedPath.split('.').reduce((current, segment) => current?.[segment], value);
}

function assert(condition: boolean, label: string): void {
  if (!condition) {
    throw new Error(label);
  }
}

function assertEqual(actual: unknown, expected: unknown, label: string): void {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);
  if (actualJson !== expectedJson) {
    throw new Error(`${label}: expected ${expectedJson}, got ${actualJson}`);
  }
}

function assertIncludes(actual: unknown, expected: unknown, label: string): void {
  if (Array.isArray(actual)) {
    if (!actual.includes(expected)) {
      throw new Error(`${label}: expected array to include ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
    return;
  }

  if (typeof actual === 'string' && typeof expected === 'string') {
    if (!actual.includes(expected)) {
      throw new Error(`${label}: expected string to include ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
    return;
  }

  throw new Error(`${label}: cannot apply includes to ${JSON.stringify(actual)}`);
}
