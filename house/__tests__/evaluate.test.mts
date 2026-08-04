/** Tests for house/evaluate.ts — run with `npm run test:evaluate`. */
import { evaluate, revenueBandLabel, DISCLAIMER, EvaluationInput } from '../evaluate';
import { LANE_BANDS, supportedLanes } from '../laneBenchmarks';

let pass = 0, fail = 0;
function ok(cond: boolean, name: string) {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`FAIL  ${name}`); }
}

const base: EvaluationInput = {
  lane: 'hvac', revenueUsd: 2_000_000, earningsUsd: 300_000, ownerCompUsd: 150_000,
  addBacksUsd: 50_000, recurringPct: 20, ownerDependence: 'runs-daily',
  topCustomerPct: 8, booksQuality: 'cash', newConstructionPct: 10,
};

// ── basis tiering mirrors core.ts ─────────────────────────────────────────
{
  const r = evaluate(base);
  ok(r.laneSupported && r.basisType === 'SDE', 'sub-$3M revenue uses SDE');
  ok(r.laneSupported && r.basisUsd === 500_000, 'SDE folds owner comp + add-backs back in');
}
{
  const r = evaluate({ ...base, revenueUsd: 5_000_000 });
  ok(r.laneSupported && r.basisType === 'Adjusted EBITDA', '$3M+ revenue uses adjusted EBITDA');
  ok(r.laneSupported && r.basisUsd === 350_000, 'EBITDA basis excludes owner comp');
}

// ── range math is band × basis, rounded to $1K ────────────────────────────
{
  const r = evaluate(base);
  ok(r.laneSupported && r.rangeUsd.low === 1_500_000, 'range low = basis × band low (HVAC 3.0x)');
  ok(r.laneSupported && r.rangeUsd.high === 5_000_000, 'range high = basis × band high (HVAC 10.0x)');
  ok(r.laneSupported && r.rangeUsd.marketLow < r.rangeUsd.marketHigh
    && r.rangeUsd.low <= r.rangeUsd.marketLow && r.rangeUsd.marketHigh <= r.rangeUsd.high,
    'range endpoints are ordered');
}

// ── THE LINE: no point estimate exists to render ──────────────────────────
{
  const r = evaluate(base);
  ok(r.laneSupported && !('midpoint' in r.rangeUsd) && !('estimate' in r) && !('valueUsd' in r),
    'result carries no single point-estimate field');
  ok(r.laneSupported && r.disclaimer === DISCLAIMER, 'disclaimer travels inside the result');
}

// ── readiness moves position monotonically ────────────────────────────────
{
  const weak = evaluate({ ...base, recurringPct: 5 });
  const strong = evaluate({
    ...base, recurringPct: 45, ownerDependence: 'absentee',
    booksQuality: 'reviewed', topCustomerPct: 5, newConstructionPct: 0,
  });
  ok(weak.laneSupported && strong.laneSupported
    && strong.readiness.score > weak.readiness.score, 'stronger profile scores higher');
  ok(strong.laneSupported && strong.readiness.position === 'upper third', 'strong profile lands upper third');
  ok(weak.laneSupported && weak.readiness.position === 'lower third', 'weak profile lands lower third');
  ok(strong.laneSupported && strong.readiness.score <= 95 && weak.laneSupported && weak.readiness.score >= 5,
    'score clamped to 5–95');
}

// ── every published band carries its source; unsupported lanes refuse ─────
{
  for (const b of supportedLanes()) {
    ok(b.source.length > 20 && /20\d\d/.test(b.source), `${b.key} band names source + vintage`);
    ok(b.low <= b.marketLow && b.marketLow <= b.marketHigh && b.marketHigh <= b.high,
      `${b.key} band endpoints ordered`);
  }
  ok(LANE_BANDS['garage-doors'] === null, 'garage doors has NO band (no published owner-operator figure)');
  const r = evaluate({ ...base, lane: 'garage-doors' });
  ok(!r.laneSupported && /don't guess/i.test((r as { message: string }).message),
    'unsupported lane refuses honestly instead of guessing');
  const r2 = evaluate({ ...base, lane: 'nonsense' });
  ok(!r2.laneSupported, 'unknown lane refuses');
}

// ── every driver note carries no invented figures beyond inputs+published ──
{
  const r = evaluate(base);
  ok(r.laneSupported && r.readiness.drivers.length === 5, 'five drivers always present');
  ok(r.laneSupported && r.readiness.drivers.every(d => ['strength', 'watch', 'fix'].includes(d.status)),
    'driver statuses are typed');
}

// ── persisted size signal is a band label, never a figure ─────────────────
{
  ok(revenueBandLabel(800_000) === 'Under $1M', 'band label <$1M');
  ok(revenueBandLabel(2_500_000) === '$1M–$3M', 'band label $1–3M');
  ok(revenueBandLabel(9_999_999) === '$3M–$10M', 'band label $3–10M');
  ok(revenueBandLabel(12_000_000) === '$10M+', 'band label $10M+');
}

console.log(`\n${pass}/${pass + fail} passed`);
if (fail > 0) process.exit(1);
