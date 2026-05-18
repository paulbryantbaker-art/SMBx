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

await test('Buyer fit scores thesis, geography, operations, and financing fit', async () => {
  const run = await executeV19Model({
    modelId: 'MODEL.BUYER.FIT.v1',
    input: {
      industry: 'HVAC',
      location: 'Austin',
      deal_size_cents: 200_000_000,
      buyer_thesis: 'HVAC route density in Austin',
      operating_needs: ['dispatch cleanup'],
      buyer_criteria: { min_deal_size_cents: 100_000_000, max_deal_size_cents: 300_000_000 },
    },
  });
  assertEqual(run.status, 'complete', 'status');
  assertEqual(run.outputs.fit_score, 87, 'fit score');
  assertEqual(run.outputs.fit_band, 'strong', 'fit band');
});

await test('Deal score converts component scores into pursue/watch/pass', async () => {
  const run = await executeV19Model({
    modelId: 'MODEL.DEAL.SCORE.v1',
    input: { fit_score: 80, earnings_quality_score: 70, evidence_score: 90, risk_score: 20 },
  });
  assertEqual(run.status, 'complete', 'status');
  assertEqual(run.outputs.deal_score, 80, 'deal score');
  assertEqual(run.outputs.pursue_watch_pass, 'pursue', 'decision band');
});

await test('Market context preserves supplied FRED snapshots without inventing missing values', async () => {
  const run = await executeV19Model({
    modelId: 'MODEL.MARKET.CONTEXT.v1',
    input: {
      series_ids: ['SOFR', 'DGS10'],
      as_of_date: '2026-05-18',
      series_values: { SOFR: 4.2 },
    },
  });
  assertEqual(run.status, 'complete', 'status');
  assertEqual(run.outputs.series_count, 2, 'series count');
  assert(run.outputs.missing_value_series.includes('DGS10'), 'missing value should be explicit');
});

await test('Sensitivity matrix builds deterministic two-axis cases', async () => {
  const run = await executeV19Model({
    modelId: 'MODEL.SENSITIVITY.MATRIX.v1',
    input: {
      base_case: { value: 100 },
      x_axis: [-0.1, 0.1],
      y_axis: [0, 0.2],
      output_metric: 'enterprise_value',
    },
  });
  assertEqual(run.status, 'complete', 'status');
  assertEqual(run.outputs.low_case, 90, 'low case');
  assertEqual(run.outputs.high_case, 132, 'high case');
});

await test('Deal comparison ranks deals by supplied score and keeps multiples auditable', async () => {
  const run = await executeV19Model({
    modelId: 'MODEL.DEAL.COMPARISON.v1',
    input: {
      deal_ids: ['a', 'b'],
      comparison_lens: 'buyer priority',
      assumption_scope: 'base case',
      deals: [
        { id: 'a', name: 'A', score: 60, purchase_price_cents: 1_000_000, ebitda_cents: 250_000 },
        { id: 'b', name: 'B', score: 85, purchase_price_cents: 1_500_000, ebitda_cents: 300_000 },
      ],
    },
  });
  assertEqual(run.status, 'complete', 'status');
  assertEqual(run.outputs.top_deal_id, 'b', 'top deal');
  assertEqual(run.outputs.rows[0].multiple, 4, 'multiple');
});

await test('Cap table dilution returns post-money ownership', async () => {
  const run = await executeV19Model({
    modelId: 'MODEL.CAPTABLE.DILUTION.v1',
    input: {
      pre_money_cents: 100_000_000,
      round_size_cents: 25_000_000,
      option_pool_pct: 0.1,
      security_terms: { liquidation_pref_multiple: 1 },
    },
  });
  assertEqual(run.status, 'complete', 'status');
  assertEqual(run.outputs.post_money_cents, 125_000_000, 'post money');
  assertEqual(run.outputs.investor_ownership_pct, 0.2, 'investor ownership');
});

await test('Covenant compliance identifies compliant periods', async () => {
  const run = await executeV19Model({
    modelId: 'MODEL.COVENANT.COMPLIANCE.v1',
    input: {
      forecast_periods: [{ period: 'Y1', ebitda_cents: 100_000, total_debt_cents: 300_000, cash_flow_cents: 80_000, debt_service_cents: 60_000, liquidity_cents: 50_000 }],
      covenant_terms: { max_leverage: 3.5, min_dscr: 1.2, min_liquidity_cents: 40_000 },
      debt_schedule: [{ total_debt_cents: 300_000, debt_service_cents: 60_000 }],
    },
  });
  assertEqual(run.status, 'complete', 'status');
  assertEqual(run.outputs.status, 'compliant', 'covenant status');
  assertEqual(run.outputs.periods[0].dscr, 1.33, 'DSCR');
});

await test('Two-stage DCF computes cash-flow PV and terminal value', async () => {
  const run = await executeV19Model({
    modelId: 'MODEL.VAL.DCF.TWOSTAGE.v1',
    input: { free_cash_flows_cents: [100, 110], discount_rate: 0.1, terminal_growth_rate: 0.03 },
  });
  assertEqual(run.status, 'complete', 'status');
  assertEqual(run.outputs.enterprise_value_cents, 1520, 'enterprise value');
});

await test('PMI value creation turns findings into first-100-day actions', async () => {
  const run = await executeV19Model({
    modelId: 'MODEL.PMI.VALUE.CREATION.v1',
    input: {
      deal_findings: ['Route density upside', 'Weak dispatch process'],
      integration_risks: ['GM retention', 'billing migration'],
      value_levers: [{ name: 'Pricing cleanup', value_cents: 1000 }, { name: 'Route optimization', value_cents: 500 }],
    },
  });
  assertEqual(run.status, 'complete', 'status');
  assertEqual(run.outputs.identified_value_cents, 1500, 'identified value');
  assertEqual(run.outputs.first_100_day_actions.length, 4, 'action count');
});

await test('Deal-kill probability converts weighted risks into a band', async () => {
  const run = await executeV19Model({
    modelId: 'MODEL.DEALKILL.PROB.v1',
    input: {
      risk_factors: [
        { label: 'customer concentration', severity: 90, probability: 1 },
        { label: 'financing gap', severity: 50, probability: 0.8 },
      ],
    },
  });
  assertEqual(run.status, 'complete', 'status');
  assertEqual(run.outputs.deal_kill_probability, 0.65, 'probability');
  assertEqual(run.outputs.risk_band, 'medium', 'risk band');
});

await test('Timeline model uses PERT expected days', async () => {
  const run = await executeV19Model({
    modelId: 'MODEL.TIMELINE.MC.v1',
    input: {
      milestones: [
        { name: 'QoE', optimistic_days: 5, base_days: 10, downside_days: 20 },
        { name: 'Lender approval', days: 4 },
      ],
    },
  });
  assertEqual(run.status, 'complete', 'status');
  assertEqual(run.outputs.expected_days, 14.8, 'expected days');
});

console.log(`\n${passed} passed, ${failed} failed`);

if (failed > 0) process.exit(1);
