#!/usr/bin/env npx tsx
/**
 * V19 canonical model runtime fixtures.
 *
 * Run: npm run test:v19-models
 *
 * These tests intentionally avoid the database. The registry catalog can be
 * inspected without DATABASE_URL; DB seeding is verified by migration checks.
 */

import { executeV19Model } from '../server/services/v19ModelRuntime.js';

let passed = 0;
let failed = 0;

type TestFn = () => Promise<void> | void;

async function test(name: string, fn: TestFn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (error: any) {
    console.log(`  ✗ ${name} - ${error.message}`);
    failed++;
  }
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) {
    throw new Error(`${message}. Expected ${String(expected)}, got ${String(actual)}`);
  }
}

console.log('\nV19 model runtime fixtures');

await test('Adjusted EBITDA runs deterministically from cents inputs', async () => {
  const run = await executeV19Model({
    modelId: 'MODEL.VAL.EBITDA.v1',
    input: { ebitda_cents: 50_000_000, adjustments_cents: 5_000_000 },
  });
  assertEqual(run.status, 'complete', 'status');
  assertEqual(run.outputs.adjusted_ebitda_cents, 55_000_000, 'adjusted EBITDA');
  assert(run.outputHash.length === 64, 'output hash should be sha256');
});

await test('DSCR stress returns base and downside cases', async () => {
  const run = await executeV19Model({
    modelId: 'MODEL.DSCR.STRESS.v1',
    input: { cash_flow_cents: 30_000_000, annual_debt_service_cents: 20_000_000 },
  });
  assertEqual(run.status, 'complete', 'status');
  assertEqual(run.outputs.base_dscr, 1.5, 'base DSCR');
  assertEqual(run.outputs.stressed_cases.length, 4, 'stress case count');
});

await test('Working capital peg averages observed months', async () => {
  const run = await executeV19Model({
    modelId: 'MODEL.STRUCT.NWC.PEG.v1',
    input: { monthly_nwc_cents: [100_000, 200_000, 300_000] },
  });
  assertEqual(run.status, 'complete', 'status');
  assertEqual(run.outputs.peg_cents, 200_000, 'NWC peg');
  assertEqual(run.outputs.observed_months, 3, 'observed months');
});

await test('Sources and uses exposes funding gap', async () => {
  const run = await executeV19Model({
    modelId: 'MODEL.SOURCES.USES.v1',
    input: { sources_cents: [700_000, 100_000], uses_cents: [900_000, 100_000] },
  });
  assertEqual(run.status, 'complete', 'status');
  assertEqual(run.outputs.funding_gap_cents, 200_000, 'funding gap');
});

await test('SBA model checks equity and DSCR floors', async () => {
  const run = await executeV19Model({
    modelId: 'MODEL.LBO.SBA.v1',
    input: {
      purchase_price_cents: 100_000_000,
      cash_flow_cents: 30_000_000,
      buyer_equity_cents: 15_000_000,
      annual_debt_service_cents: 20_000_000,
    },
  });
  assertEqual(run.status, 'complete', 'status');
  assertEqual(run.outputs.meets_sba_equity_floor, true, 'SBA equity floor');
  assertEqual(run.outputs.meets_sba_dscr_floor, true, 'SBA DSCR floor');
});

await test('HSR triage uses current transaction threshold constant', async () => {
  const run = await executeV19Model({
    modelId: 'MODEL.HSR.TRIAGE.v1',
    input: { enterprise_value_cents: 140_000_000_00 },
  });
  assertEqual(run.status, 'complete', 'status');
  assertEqual(run.outputs.hsr_size_triggered, true, 'HSR size triggered');
});

await test('QoE Lite flags unsupported add-backs', async () => {
  const run = await executeV19Model({
    modelId: 'MODEL.QOE.LITE.v1',
    input: {
      financial_facts: ['Revenue tied to 2025 P&L'],
      adjustments: [{ label: 'Owner comp', source_id: 'file-1' }, { label: 'Travel' }],
    },
  });
  assertEqual(run.status, 'complete', 'status');
  assertEqual(run.outputs.unsupported_adjustments, 1, 'unsupported adjustments');
});

await test('Missing valuation inputs return needs_inputs without invented defaults', async () => {
  const run = await executeV19Model({
    modelId: 'MODEL.VAL.TRIANGULATION.v1',
    input: {},
  });
  assertEqual(run.status, 'needs_inputs', 'status');
  assert(run.missingInputs.includes('normalized_earnings_cents'), 'missing earnings');
  assert(run.missingInputs.includes('low_multiple'), 'missing low multiple');
  assert(run.missingInputs.includes('high_multiple'), 'missing high multiple');
});

await test('Legacy V19 aliases canonicalize to MODEL.*.v1 ids', async () => {
  const run = await executeV19Model({
    modelId: 'v19.ebitda.adjusted',
    input: { ebitda_cents: 10_000, adjustments_cents: 250 },
  });
  assertEqual(run.modelId, 'MODEL.VAL.EBITDA.v1', 'canonical model id');
  assertEqual(run.outputs.adjusted_ebitda_cents, 10_250, 'alias output');
});

await test('Tax structure issue-spots rollover and Section 382 review flags', async () => {
  const run = await executeV19Model({
    modelId: 'MODEL.TAX.STRUCTURE.v1',
    input: {
      deal_type: 'asset sale with rollover',
      entity_type: 'C-Corp',
      purchase_price_cents: 25_000_000,
      rollover_pct: 0.15,
      tax_facts: { loss_carryforwards: true },
    },
  });
  assertEqual(run.status, 'complete', 'status');
  assertEqual(run.outputs.structure, 'asset_sale_allocation', 'structure');
  assertEqual(run.outputs.counsel_required, true, 'counsel required');
});

await test('Legal halt scan flags HSR and regulated-industry counsel review', async () => {
  const run = await executeV19Model({
    modelId: 'MODEL.LEGAL.HALTSCAN.v1',
    input: {
      deal_type: 'platform acquisition',
      industry: 'healthcare services',
      jurisdiction: 'TX',
      enterprise_value_cents: 150_000_000_00,
      legal_facts: { consent_required: true },
    },
  });
  assertEqual(run.status, 'complete', 'status');
  assertEqual(run.outputs.hsr_size_triggered, true, 'HSR threshold');
  assertEqual(run.outputs.counsel_required, true, 'counsel required');
});

await test('LBO LMM returns leverage, MOIC, and simple IRR', async () => {
  const run = await executeV19Model({
    modelId: 'MODEL.LBO.LMM.v1',
    input: {
      purchase_price_cents: 100_000_000,
      debt_cents: 55_000_000,
      sponsor_equity_cents: 45_000_000,
      entry_ebitda_cents: 20_000_000,
      exit_multiple: 6,
      ebitda_growth_pct: 0.05,
      hold_years: 5,
      debt_paydown_cents: 20_000_000,
    },
  });
  assertEqual(run.status, 'complete', 'status');
  assertEqual(run.outputs.entry_leverage, 2.75, 'entry leverage');
  assert(run.outputs.moic > 2, 'MOIC should be above 2.0x');
});

await test('PPA tracks allocated and unallocated purchase price', async () => {
  const run = await executeV19Model({
    modelId: 'MODEL.STRUCT.PPA.v1',
    input: {
      purchase_price_cents: 100_000,
      asset_classes: { working_capital: 20_000, equipment: 30_000, goodwill: 40_000 },
    },
  });
  assertEqual(run.status, 'complete', 'status');
  assertEqual(run.outputs.allocated_cents, 90_000, 'allocated');
  assertEqual(run.outputs.unallocated_cents, 10_000, 'unallocated');
});

await test('Earnout model computes expected present value', async () => {
  const run = await executeV19Model({
    modelId: 'MODEL.STRUCT.EARNOUT.MC.v1',
    input: {
      earnout_targets: [100_000, 200_000],
      probabilities: [0.5, 0.25],
      discount_rate: 0.1,
      term_years: 1,
    },
  });
  assertEqual(run.status, 'complete', 'status');
  assertEqual(run.outputs.expected_gross_cents, 100_000, 'expected gross');
  assertEqual(run.outputs.expected_present_value_cents, 90_909, 'expected PV');
});

console.log(`\n${passed} passed, ${failed} failed`);

if (failed > 0) process.exit(1);
