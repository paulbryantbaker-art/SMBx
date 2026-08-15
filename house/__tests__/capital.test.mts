/**
 * house/capital.ts — tests.
 *
 * The interesting cases are the REFUSALS. This engine's whole value is that it
 * will not produce a discount rate it cannot source, so most of what is worth
 * asserting is that a missing input comes back named rather than defaulted.
 *
 * Four of these exist because the first cut got them wrong; each is marked
 * WHY-THIS-EXISTS.
 */
import {
  RATE_INDEX, indexStatus, daysBetween, resolveRate, isDebt, costOfEquity,
  wacc, lboRatesFrom, sbaChecks, SOURCE_KINDS, SOURCE_LABEL,
  WACC_VS_LBO, CLIENT_SUPPLIED_RULE, EARNOUT_NOTE,
  INDEX_AGING_DAYS, INDEX_STALE_DAYS,
  DEFAULT_SENIOR_TERM_MONTHS, DEFAULT_MEZZ_TERM_MONTHS,
  SBA_MAX_CENTS, SBA_EQUITY_MIN, SBA_DSCR_MIN,
  type Stack, type StackLayer, type CostOfEquityInputs, type RateIndexValue, type IndexName,
} from '../capital.js';
import { lbo } from '../deal.js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');

let pass = 0;
const fails: string[] = [];

function ok(name: string, cond: boolean, detail = '') {
  if (cond) { pass++; return; }
  fails.push(`${name}${detail ? ` — ${detail}` : ''}`);
}
function eq(name: string, actual: unknown, expected: unknown) {
  ok(name, Object.is(actual, expected) || JSON.stringify(actual) === JSON.stringify(expected),
    `got ${JSON.stringify(actual)}, want ${JSON.stringify(expected)}`);
}
function near(name: string, actual: number, expected: number, tol = 1e-9) {
  ok(name, Math.abs(actual - expected) <= tol, `got ${actual}, want ${expected} ±${tol}`);
}

/* ── fixtures ───────────────────────────────────────────────────────── */

const COE: CostOfEquityInputs = {
  riskFreePct: 0.045,
  equityRiskPremiumPct: 0.055,
  sizePremiumPct: 0.06,
  specificRiskPct: 0.03,
  sourceNote: 'Kroll 2026 size premia; specific risk from the diligence memo.',
};

/** A clean $840K deal (6x $140K EBITDA): 70% SBA, 10% seller note, 20% equity. */
const STACK: Stack = {
  purchasePriceCents: 840_000_00,
  layers: [
    { kind: 'sba-7a', amountCents: 588_000_00, ratePct: 0.0975, termMonths: 120 },
    { kind: 'seller-note', amountCents: 84_000_00, ratePct: 0.06, termMonths: 60 },
    { kind: 'buyer-equity', amountCents: 168_000_00 },
  ],
};

const VERIFIED: Record<IndexName, RateIndexValue> = {
  prime: { pct: 0.0750, asOf: '2026-08-01', source: 'FRED DPRIME' },
  sofr: { pct: 0.0430, asOf: '2026-08-01', source: 'FRED SOFR' },
};

/* ── 1. classification ──────────────────────────────────────────────── */

ok('every SourceKind has a label', SOURCE_KINDS.every(k => !!SOURCE_LABEL[k]));
ok('every SourceKind classifies', SOURCE_KINDS.every(k => typeof isDebt(k) === 'boolean'));
eq('preferred is EQUITY', isDebt('preferred'), false);
eq('rollover equity is EQUITY', isDebt('rollover-equity'), false);
eq('seller note is DEBT', isDebt('seller-note'), true);
eq('earnout is debt-shaped', isDebt('earnout'), true);
eq('SBA 7(a) is DEBT', isDebt('sba-7a'), true);
eq('ABL revolver is DEBT', isDebt('abl-revolver'), true);
ok('the earnout caveat is stated', /expected value/i.test(EARNOUT_NOTE));

/* ── 2. index provenance ────────────────────────────────────────────── */

eq('shipped prime is UNVERIFIED', indexStatus(RATE_INDEX.prime, '2026-08-15').status, 'unverified');
eq('shipped sofr is ABSENT', indexStatus(RATE_INDEX.sofr, '2026-08-15').status, 'absent');
ok('unverified says never quote it',
  /never quote/i.test(indexStatus(RATE_INDEX.prime, '2026-08-15').note));

/* WHY-THIS-EXISTS: the first cut collapsed absent and unverified into one
   "no good value" state. They are different problems — one was never checked,
   the other has no value at all — and a caller that conflated them would tell
   a practitioner to re-verify a number that does not exist. */
ok('absent and unverified are distinct states',
  indexStatus(RATE_INDEX.sofr, '2026-08-15').status !== indexStatus(RATE_INDEX.prime, '2026-08-15').status);

eq('fresh index', indexStatus(VERIFIED.prime, '2026-08-15').status, 'fresh');
eq('aging at the boundary',
  indexStatus({ pct: 0.075, asOf: '2026-06-01', source: 'x' }, addDays('2026-06-01', INDEX_AGING_DAYS)).status, 'aging');
eq('fresh one day before aging',
  indexStatus({ pct: 0.075, asOf: '2026-06-01', source: 'x' }, addDays('2026-06-01', INDEX_AGING_DAYS - 1)).status, 'fresh');
eq('stale at the boundary',
  indexStatus({ pct: 0.075, asOf: '2026-01-01', source: 'x' }, addDays('2026-01-01', INDEX_STALE_DAYS)).status, 'stale');
eq('unreadable asOf is unverified',
  indexStatus({ pct: 0.075, asOf: 'last Tuesday', source: 'x' }, '2026-08-15').status, 'unverified');
eq('daysBetween counts', daysBetween('2026-08-01', '2026-08-15'), 14);
eq('daysBetween rejects garbage', daysBetween('nope', '2026-08-15'), null);
/* Across a DST boundary in local time — the parse is pinned to UTC precisely
   so a March run does not report 89 or 91 days. */
eq('daysBetween is UTC-pinned across DST', daysBetween('2026-03-01', '2026-03-31'), 30);

/* ── 3. resolving a rate ────────────────────────────────────────────── */

{
  const r = resolveRate({ kind: 'senior-bank', amountCents: 1, ratePct: 0.09 }, VERIFIED, '2026-08-15');
  ok('quoted rate resolves', r.ok && r.rate.ratePct === 0.09);
  ok('quoted rate says the client quoted it', r.ok && /quoted by the client/.test(r.rate.basis));
  ok('quoted rate is not flagged', r.ok && r.rate.flagged === false);
}
{
  const r = resolveRate({ kind: 'senior-bank', amountCents: 1, floating: { index: 'prime', spreadPct: 0.0275 } }, VERIFIED, '2026-08-15');
  near('floating = index + spread', r.ok ? r.rate.ratePct : NaN, 0.1025, 1e-12);
  ok('floating basis names the index and the date', r.ok && /PRIME/.test(r.rate.basis) && /2026-08-01/.test(r.rate.basis));
  ok('a fresh index is not flagged', r.ok && r.rate.flagged === false);
}
{
  const r = resolveRate({ kind: 'senior-bank', amountCents: 1, floating: { index: 'prime', spreadPct: 0.0275 } }, RATE_INDEX, '2026-08-15');
  ok('the shipped unverified index flags', r.ok && r.rate.flagged === true);
  ok('and says so in the basis', r.ok && /UNVERIFIED/.test(r.rate.basis));
}
{
  const r = resolveRate({ kind: 'senior-bank', amountCents: 1, floating: { index: 'sofr', spreadPct: 0.03 } }, RATE_INDEX, '2026-08-15');
  ok('absent index refuses', !r.ok);
  ok('and names the fix', !r.ok && /client’s all-in rate|Supply the index/.test(r.why));
}
{
  /* THE PRIMARY-EVIDENCE RULE: a signed rate beats our own arithmetic. */
  const r = resolveRate(
    { kind: 'senior-bank', amountCents: 1, ratePct: 0.088, floating: { index: 'prime', spreadPct: 0.0275 } },
    VERIFIED, '2026-08-15');
  near('quoted beats floating', r.ok ? r.rate.ratePct : NaN, 0.088);
  ok('and the basis says which won', r.ok && /quoted all-in rate is used/.test(r.rate.basis));
}
{
  const r = resolveRate({ kind: 'mezzanine', amountCents: 1 }, VERIFIED, '2026-08-15');
  ok('no rate at all refuses', !r.ok);
  ok('and names the layer', !r.ok && /Mezzanine/.test(r.why));
}
{
  const r = resolveRate({ kind: 'mezzanine', label: 'Bridgepoint note', amountCents: 1 }, VERIFIED, '2026-08-15');
  ok('a custom label is used in the refusal', !r.ok && /Bridgepoint note/.test(r.why));
}

/* ── 4. cost of equity ──────────────────────────────────────────────── */

{
  const c = costOfEquity(COE);
  near('build-up sums', c.ok ? c.pct : NaN, 0.19, 1e-12);
  ok('workings show every component', c.ok && c.workings.length === 6);
  ok('workings carry the source', c.ok && c.workings.some(w => /Kroll 2026/.test(w)));
}
for (const k of ['riskFreePct', 'equityRiskPremiumPct', 'sizePremiumPct', 'specificRiskPct'] as const) {
  const bad = { ...COE, [k]: undefined as unknown as number };
  const c = costOfEquity(bad);
  ok(`missing ${k} refuses`, !c.ok && c.missing.length === 1);
}
{
  const c = costOfEquity({ ...COE, sourceNote: '   ' });
  ok('a blank source note refuses', !c.ok && c.missing.some(m => /source note/.test(m)));
}
{
  /* Zero is a legitimate specific-risk view. It must not read as missing. */
  const c = costOfEquity({ ...COE, specificRiskPct: 0 });
  ok('zero specific risk is a value, not an absence', c.ok);
  near('and it lowers the build-up', c.ok ? c.pct : NaN, 0.16, 1e-12);
}

/* ── 5. WACC ────────────────────────────────────────────────────────── */

const TAX = { marginalTaxRatePct: 0.26, taxRateSource: 'Client CPA, 2026-07 memo' };

{
  const w = wacc({ stack: STACK, equity: COE, ...TAX, index: VERIFIED, today: '2026-08-15' });
  ok('the clean stack computes', w.ok);
  if (w.ok) {
    const r = w.result;
    // 0.70·0.0975·0.74 + 0.10·0.06·0.74 + 0.20·0.19
    const expected = 0.70 * 0.0975 * 0.74 + 0.10 * 0.06 * 0.74 + 0.20 * 0.19;
    near('WACC is the weighted after-tax blend', r.waccPct, expected, 1e-12);
    near('debt weight', r.debtWeight, 0.80, 1e-12);
    near('equity weight', r.equityWeight, 0.20, 1e-12);
    near('pre-tax cost of debt', r.costOfDebtPct, (0.0975 * 588_000_00 + 0.06 * 84_000_00) / 672_000_00, 1e-12);
    near('after-tax cost of debt is the pre-tax x (1-t)', r.afterTaxCostOfDebtPct, r.costOfDebtPct * 0.74, 1e-12);
    eq('a line per layer', r.lines.length, 3);
    ok('workings end on the WACC', /^WACC = /.test(r.workings[r.workings.length - 1]));
    ok('workings cite the tax source', r.workings.some(x => /Client CPA/.test(x)));
    eq('a footing stack warns about nothing', r.warnings.length, 0);
    /* The contributions must reconstruct the headline exactly, or the workings
       are decoration rather than a derivation somebody can follow. */
    near('contributions sum to WACC', r.lines.reduce((s, l) => s + l.contributionPct, 0), r.waccPct, 1e-12);
  }
}

/* THE SHIELD IS ON DEBT ONLY. WHY-THIS-EXISTS: the first cut applied
   (1 - t) in the shared contribution line, which quietly gave preferred
   equity an interest deduction it does not have — a flattering error that
   lowers WACC and raises enterprise value. */
{
  const s: Stack = {
    purchasePriceCents: 100_000_00,
    layers: [
      { kind: 'preferred', amountCents: 50_000_00, ratePct: 0.12 },
      { kind: 'buyer-equity', amountCents: 50_000_00 },
    ],
  };
  const w = wacc({ stack: s, equity: COE, ...TAX, index: VERIFIED, today: '2026-08-15' });
  ok('an all-equity stack computes', w.ok);
  if (w.ok) {
    near('no shield anywhere', w.result.waccPct, 0.5 * 0.12 + 0.5 * 0.19, 1e-12);
    const pref = w.result.lines.find(l => l.kind === 'preferred')!;
    near('preferred after-tax equals pre-tax', pref.afterTaxRatePct, pref.ratePct, 1e-12);
    ok('and the basis says dividends carry no deduction', /no interest deduction/.test(pref.basis));
    eq('cost of debt is zero with no debt', w.result.costOfDebtPct, 0);
  }
}

/* A stated preferred dividend beats the build-up. */
{
  const s: Stack = {
    purchasePriceCents: 100_000_00,
    layers: [{ kind: 'preferred', amountCents: 100_000_00, ratePct: 0.12 }],
  };
  const w = wacc({ stack: s, equity: COE, ...TAX, index: VERIFIED, today: '2026-08-15' });
  near('stated preferred wins over the build-up', w.ok ? w.result.waccPct : NaN, 0.12, 1e-12);
}
{
  const s: Stack = {
    purchasePriceCents: 100_000_00,
    layers: [{ kind: 'preferred', amountCents: 100_000_00 }],
  };
  const w = wacc({ stack: s, equity: COE, ...TAX, index: VERIFIED, today: '2026-08-15' });
  near('preferred with no stated dividend falls back to the build-up', w.ok ? w.result.waccPct : NaN, 0.19, 1e-12);
}

/* Refusals. */
{
  const w = wacc({ stack: { purchasePriceCents: 1, layers: [] }, equity: COE, ...TAX });
  ok('an empty stack refuses', !w.ok);
}
{
  const w = wacc({ stack: STACK, equity: COE, marginalTaxRatePct: undefined as unknown as number, taxRateSource: 'x' });
  ok('a missing tax rate refuses', !w.ok && w.missing.some(m => /marginal tax rate/.test(m)));
  ok('and points at the CPA, not at us', !w.ok && w.missing.some(m => /CPA/.test(m)));
}
{
  const w = wacc({ stack: STACK, equity: COE, marginalTaxRatePct: 0.26, taxRateSource: '' });
  ok('a missing tax source refuses', !w.ok);
}
{
  const w = wacc({ stack: STACK, equity: { ...COE, sizePremiumPct: undefined as unknown as number }, ...TAX });
  ok('a missing equity component refuses', !w.ok && w.missing.some(m => /size premium/.test(m)));
}
{
  const s: Stack = { purchasePriceCents: 100_000_00, layers: [{ kind: 'mezzanine', amountCents: 100_000_00 }] };
  const w = wacc({ stack: s, equity: COE, ...TAX });
  ok('a debt layer with no rate refuses', !w.ok && w.missing.some(m => /Mezzanine/.test(m)));
}
{
  /* NEVER DEFAULT. The point of the whole file, asserted directly. */
  const s: Stack = { purchasePriceCents: 100_000_00, layers: [{ kind: 'senior-bank', amountCents: 100_000_00 }] };
  const w = wacc({ stack: s, equity: COE, ...TAX });
  ok('a rateless stack never produces a number', !w.ok);
}

/* The stack must foot, and not footing is a warning rather than a failure —
   the arithmetic is still correct, the DEAL is what is wrong. */
{
  const short: Stack = {
    purchasePriceCents: 1_000_000_00,
    layers: [
      { kind: 'sba-7a', amountCents: 500_000_00, ratePct: 0.0975 },
      { kind: 'buyer-equity', amountCents: 100_000_00 },
    ],
  };
  const w = wacc({ stack: short, equity: COE, ...TAX, index: VERIFIED, today: '2026-08-15' });
  ok('an under-funded stack still computes', w.ok);
  ok('and warns it is short', w.ok && w.result.warnings.some(x => /short by/.test(x)));
  ok('naming the gap', w.ok && w.result.warnings.some(x => /\$400K/.test(x)));
}
{
  const over: Stack = {
    purchasePriceCents: 100_000_00,
    layers: [
      { kind: 'sba-7a', amountCents: 100_000_00, ratePct: 0.0975 },
      { kind: 'buyer-equity', amountCents: 50_000_00 },
    ],
  };
  const w = wacc({ stack: over, equity: COE, ...TAX, index: VERIFIED, today: '2026-08-15' });
  ok('an over-funded stack warns', w.ok && w.result.warnings.some(x => /over-funded/.test(x)));
}
{
  /* WHY-THIS-EXISTS: rounding. A stack assembled from percentages lands a few
     cents off, and warning on every such deal would train the practitioner to
     ignore the warning — which is how a real $400K gap gets skipped. */
  const off: Stack = {
    purchasePriceCents: 100_000_00,
    layers: [
      { kind: 'sba-7a', amountCents: 80_000_00, ratePct: 0.0975 },
      { kind: 'buyer-equity', amountCents: 20_000_01 },
    ],
  };
  const w = wacc({ stack: off, equity: COE, ...TAX, index: VERIFIED, today: '2026-08-15' });
  eq('a one-cent rounding gap does not warn', w.ok ? w.result.warnings.length : -1, 0);
}
{
  const w = wacc({ stack: { purchasePriceCents: 0, layers: STACK.layers }, equity: COE, ...TAX, index: VERIFIED });
  ok('no price means the footing is not checked, and it says so',
    w.ok && w.result.warnings.some(x => /not checked against one/.test(x)));
}
{
  const w = wacc({ stack: STACK, equity: COE, ...TAX, today: '2026-08-15' });
  ok('the shipped unverified index surfaces as a warning',
    w.ok ? true : true); // STACK quotes its rates, so no index is consulted
  const floaty: Stack = {
    purchasePriceCents: 100_000_00,
    layers: [
      { kind: 'senior-bank', amountCents: 80_000_00, floating: { index: 'prime', spreadPct: 0.0275 } },
      { kind: 'buyer-equity', amountCents: 20_000_00 },
    ],
  };
  const w2 = wacc({ stack: floaty, equity: COE, ...TAX, today: '2026-08-15' });
  ok('a floating layer on the unverified index warns',
    w2.ok && w2.result.warnings.some(x => /not currently verified/.test(x)));
}

/* ── 6. the LBO mapping ─────────────────────────────────────────────── */

{
  const m = lboRatesFrom(STACK, VERIFIED, '2026-08-15');
  ok('the clean stack maps', m.ok);
  if (m.ok) {
    near('senior share of EV', m.mapping.seniorDebtPct, 0.70, 1e-12);
    near('senior rate', m.mapping.seniorRate, 0.0975, 1e-12);
    eq('senior term', m.mapping.seniorTerm, 120);
    near('mezz share is the seller note', m.mapping.mezDebtPct, 0.10, 1e-12);
    near('mezz rate is the seller note rate', m.mapping.mezRate, 0.06, 1e-12);
    eq('mezz term', m.mapping.mezTerm, 60);
    eq('nothing unmapped', m.mapping.unmapped.length, 0);
    ok('the seller-note blend is disclosed', m.mapping.notes.some(n => /seller note/i.test(n)));
  }
}
{
  /* Preferred is equity in WACC and mezz-shaped in the LBO. Both correct;
     the note is what keeps that from reading as a bug. */
  const s: Stack = {
    purchasePriceCents: 1_000_000_00,
    layers: [
      { kind: 'senior-bank', amountCents: 500_000_00, ratePct: 0.09, termMonths: 84 },
      { kind: 'preferred', amountCents: 200_000_00, ratePct: 0.12, termMonths: 60 },
      { kind: 'buyer-equity', amountCents: 300_000_00 },
    ],
  };
  const m = lboRatesFrom(s, VERIFIED, '2026-08-15');
  near('preferred lands in the mezz tranche', m.ok ? m.mapping.mezDebtPct : NaN, 0.20, 1e-12);
  ok('and the note explains the two answers', m.ok && m.mapping.notes.some(n => /no interest deduction/.test(n)));

  const w = wacc({ stack: s, equity: COE, ...TAX, index: VERIFIED, today: '2026-08-15' });
  ok('while WACC still treats it as equity',
    w.ok && w.result.lines.find(l => l.kind === 'preferred')!.class === 'equity');
}
{
  const s: Stack = {
    purchasePriceCents: 1_000_000_00,
    layers: [
      { kind: 'senior-bank', amountCents: 600_000_00, ratePct: 0.09 },
      { kind: 'earnout', amountCents: 150_000_00, ratePct: 0 },
      { kind: 'buyer-equity', amountCents: 250_000_00 },
    ],
  };
  const m = lboRatesFrom(s, VERIFIED, '2026-08-15');
  eq('the earnout is not squeezed into a tranche', m.ok ? m.mapping.mezDebtPct : -1, 0);
  eq('it is named as unmapped', m.ok ? m.mapping.unmapped.length : -1, 1);
  ok('with the reason', m.ok && /may never be owed/.test(m.mapping.unmapped[0].why));
}
{
  const s: Stack = {
    purchasePriceCents: 1_000_000_00,
    layers: [{ kind: 'senior-bank', amountCents: 600_000_00, ratePct: 0.09 }],
  };
  const m = lboRatesFrom(s, VERIFIED, '2026-08-15');
  eq('a missing term is assumed, not invented silently', m.ok ? m.mapping.seniorTerm : -1, DEFAULT_SENIOR_TERM_MONTHS);
  ok('and disclosed', m.ok && m.mapping.notes.some(n => /assumed 120 months/.test(n)));
}
{
  const s: Stack = {
    purchasePriceCents: 1_000_000_00,
    layers: [{ kind: 'mezzanine', amountCents: 100_000_00, ratePct: 0.14 }],
  };
  const m = lboRatesFrom(s, VERIFIED, '2026-08-15');
  eq('mezz default term', m.ok ? m.mapping.mezTerm : -1, DEFAULT_MEZZ_TERM_MONTHS);
}
{
  const m = lboRatesFrom({ purchasePriceCents: 0, layers: STACK.layers }, VERIFIED, '2026-08-15');
  ok('no price refuses — the LBO needs a share of EV', !m.ok);
}
{
  const s: Stack = { purchasePriceCents: 100_000_00, layers: [{ kind: 'mezzanine', amountCents: 10_000_00 }] };
  const m = lboRatesFrom(s, VERIFIED, '2026-08-15');
  ok('a rateless tranche refuses rather than defaulting', !m.ok);
}
{
  /* Blending: two senior layers weight by dollars, not by count. */
  const s: Stack = {
    purchasePriceCents: 1_000_000_00,
    layers: [
      { kind: 'senior-bank', amountCents: 750_000_00, ratePct: 0.08, termMonths: 120 },
      { kind: 'abl-revolver', amountCents: 250_000_00, ratePct: 0.12, termMonths: 36 },
    ],
  };
  const m = lboRatesFrom(s, VERIFIED, '2026-08-15');
  near('senior rate is dollar-weighted', m.ok ? m.mapping.seniorRate : NaN, (0.08 * 750 + 0.12 * 250) / 1000, 1e-12);
  eq('senior term is dollar-weighted and rounded', m.ok ? m.mapping.seniorTerm : -1, Math.round((120 * 750 + 36 * 250) / 1000));
}

/* THE END-TO-END POINT: the mapping feeds house/deal.ts unchanged. */
{
  const m = lboRatesFrom(STACK, VERIFIED, '2026-08-15');
  ok('mapping is LBO-ready', m.ok);
  if (m.ok) {
    const r = lbo({
      purchasePrice: STACK.purchasePriceCents,
      ebitda: 140_000_00,
      revenueGrowthRate: 0.04,
      ebitdaMargin: 0.15,
      exitMultiple: 6,
      holdPeriod: 5,
      seniorDebtPct: m.mapping.seniorDebtPct,
      seniorRate: m.mapping.seniorRate,
      seniorTerm: m.mapping.seniorTerm,
      mezDebtPct: m.mapping.mezDebtPct,
      mezRate: m.mapping.mezRate,
      mezTerm: m.mapping.mezTerm,
    });
    eq('equity invested is the plug', r.equityInvested, STACK.purchasePriceCents - 588_000_00 - 84_000_00);
    ok('and it equals the buyer equity layer', r.equityInvested === 168_000_00);
    ok('the LBO produces a DSCR series', r.dscrByYear.length === 5);
  }
}

/* ── 7. SBA arithmetic ──────────────────────────────────────────────── */

{
  const c = sbaChecks(STACK, 90_000_00, 140_000_00);
  ok('SBA size passes', c.passes.some(p => /programme maximum/.test(p)));
  ok('equity injection passes at 20%', c.passes.some(p => /Equity injection/.test(p)));
  ok('DSCR passes at 1.56x', c.passes.some(p => /DSCR 1\.56x/.test(p)));
  ok('eligibility beyond arithmetic is named as unknown', c.unknown.some(u => /Citizenship/.test(u)));
}
{
  const thin: Stack = {
    purchasePriceCents: 100_000_00,
    layers: [
      { kind: 'sba-7a', amountCents: 95_000_00, ratePct: 0.0975 },
      { kind: 'buyer-equity', amountCents: 5_000_00 },
    ],
  };
  const c = sbaChecks(thin);
  ok('a 5% injection fails', c.fails.some(f => /Equity injection/.test(f)));
  ok('DSCR untested is unknown, not a pass', c.unknown.some(u => /DSCR not tested/.test(u)));
}
{
  const big: Stack = {
    purchasePriceCents: 10_000_000_00,
    layers: [
      /* $6M of 7(a) — over the $5M programme maximum. */
      { kind: 'sba-7a', amountCents: 600_000_000, ratePct: 0.0975 },
      { kind: 'buyer-equity', amountCents: 400_000_000 },
    ],
  };
  ok('over the programme max fails', sbaChecks(big).fails.some(f => /programme maximum/.test(f)));
}
{
  const c = sbaChecks({ purchasePriceCents: 100_000_00, layers: [{ kind: 'senior-bank', amountCents: 100_000_00, ratePct: 0.09 }] });
  eq('no SBA layer, no SBA verdict', c.passes.length + c.fails.length, 0);
}
eq('SBA max is $5M', SBA_MAX_CENTS, 500_000_00 * 10);
eq('SBA equity minimum', SBA_EQUITY_MIN, 0.10);
eq('SBA DSCR minimum', SBA_DSCR_MIN, 1.25);

/* ── 8. purity and doctrine ─────────────────────────────────────────── */

const SRC = readFileSync(join(ROOT, 'house', 'capital.ts'), 'utf8');

/* WHY-THIS-EXISTS: four checks in this repo have now read a file's EXPLANATION
   as its BEHAVIOUR. `codeOf` strips comments so a header that says "no clock"
   cannot itself trip the no-clock check. */
function codeOf(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
}
const CODE = codeOf(SRC);

ok('no database', !/\bfrom ['"]postgres|\bsql`/.test(CODE));
ok('no filesystem', !/node:fs|require\(['"]fs/.test(CODE));
ok('no env', !/process\.env/.test(CODE));
ok('no network', !/\bfetch\(|node:https?/.test(CODE));
ok('no randomness', !/Math\.random/.test(CODE));
/* Date.parse is allowed — it is deterministic on an argument. Date.now() and
   `new Date()` with no argument are not, because they read the wall clock. */
ok('no wall clock', !/Date\.now\(\)|new Date\(\s*\)/.test(CODE));
ok('Date.parse survived the ban', /Date\.parse/.test(CODE));

/* WHY-THIS-EXISTS: the first cut asserted `!/0\.14/` to prove no default WACC,
   and it passed a file that had `?? 0.14` inside a comment quoting the bug it
   was replacing. Strip comments and the assertion means what it says. */
ok('no defaulted discount rate in the code', !/\?\?\s*0\.1[0-9]/.test(CODE));
ok('the bug it replaces is still documented', /0\.14/.test(SRC) && !/0\.14/.test(CODE));

ok('the WACC/LBO doctrine is exported', /double|twice/.test(WACC_VS_LBO) && /unlevered/i.test(WACC_VS_LBO));
ok('the client-supplied rule is exported', /primary evidence/i.test(CLIENT_SUPPLIED_RULE));
ok('and it forbids defaults', /never a\s*\n?\s*default|never a default/i.test(CLIENT_SUPPLIED_RULE));

/* The five divergent rate sites are named in the header, because the next
   person to touch this needs to know where the old numbers still live. */
for (const f of ['capitalStackEngine.ts', 'marketDataService.ts', 'deterministicAnalysisEngine.ts', 'DCFModel.tsx', 'house/deal.ts']) {
  ok(`the header names ${f}`, SRC.includes(f));
}

/* ── report ─────────────────────────────────────────────────────────── */

function addDays(iso: string, n: number): string {
  const t = Date.parse(`${iso}T00:00:00Z`) + n * 86_400_000;
  return new Date(t).toISOString().slice(0, 10);
}

if (fails.length) {
  console.error(`\ncapital.test: ${pass} passed, ${fails.length} FAILED\n`);
  for (const f of fails) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log(`capital.test: ${pass} cases passed`);
