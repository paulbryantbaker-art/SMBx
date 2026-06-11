#!/usr/bin/env tsx
/**
 * Working Paper launch gate — marketing math reconciliation.
 *
 * The marketing site now computes its exhibits live through the product's own
 * calculation library (client/src/lib/calculations/core.ts). That cuts both
 * ways: a live exhibit displaying a figure core.ts wouldn't produce is WORSE
 * than a static mock for a diligence-minded audience. This suite asserts that
 * every constant a marketing exhibit displays reconciles with the library,
 * and runs in CI alongside the conformance suites.
 *
 *   npm run test:marketing-math
 */
import { calculateSDE, calculateValuation } from '../client/src/lib/calculations/core';
import { SELL_NET_INCOME, SELL_ADDBACKS } from '../client/src/marketing/components/AddBackLedger';

let failures = 0;
const check = (label: string, actual: number, expected: number, tolerance = 0.01) => {
  const ok = Math.abs(actual - expected) <= tolerance;
  console.log(`${ok ? '✓' : '✗'} ${label}${ok ? '' : ` — got ${actual}, want ${expected}`}`);
  if (!ok) failures += 1;
};

console.log('marketing-math-reconcile — exhibits vs core.ts\n');

/* ── DerivationHero defaults: $8.4M EBITDA × 5.5× → $46.2M EV, ±1.0× band ── */
const hero = calculateValuation(8_400_000, 'L4', { min: 4.5, max: 6.5 });
check('DerivationHero mid  = 8.4M × 5.5×', hero.mid, 46_200_000);
check('DerivationHero low  = 8.4M × 4.5×', hero.low, 37_800_000);
check('DerivationHero high = 8.4M × 6.5×', hero.high, 54_600_000);

/* ── The derivation identity (mid = EBITDA × multiple) must hold across the
      hero's entire interactive input space — every value a visitor can dial. ── */
let gridFailures = 0;
for (let tenths = 30; tenths <= 90; tenths += 1) {
  const mult = tenths / 10;
  for (const earnings of [500_000, 2_300_000, 8_400_000, 17_500_000, 50_000_000]) {
    const r = calculateValuation(earnings, 'L4', {
      min: Math.max(0.5, mult - 1),
      max: mult + 1,
    });
    if (Math.abs(r.mid - earnings * mult) > 0.01) {
      gridFailures += 1;
      if (gridFailures <= 3) {
        console.log(`✗ grid: ${earnings} × ${mult}× → mid ${r.mid}, want ${earnings * mult}`);
      }
    }
  }
}
check(`derivation identity holds across 305-point input grid (${gridFailures} mismatches)`, gridFailures, 0, 0);

/* ── HeroWorkspace attract loop (scripted) must agree with the derivation:
      its EV pill shows $46M — the rounded form of the real 46.2M product,
      and its $38M–$55M range is the ±1.0× band the hero derives. ── */
check('HeroWorkspace EV pill ($46M) = round(8.4M × 5.5×)', Math.round(hero.mid / 1_000_000), 46, 0.4);
check('HeroWorkspace range low ($38M)', Math.round(hero.low / 1_000_000), 38, 0.4);
check('HeroWorkspace range high ($55M)', Math.round(hero.high / 1_000_000), 55, 0.4);

/* ── Sell AddBackLedger: $612k + eight add-backs = $1.31M SDE, 2.1× lift,
      and the valuation range that follows at L2 (3.0–5.0× SDE). ── */
const sell = calculateSDE(SELL_NET_INCOME, 0, SELL_ADDBACKS);
check('Sell ledger SDE = 612k + Σ(8 add-backs)', sell.sde, 1_310_000);
check('Sell lift displays 2.1×', Math.round((sell.sde / SELL_NET_INCOME) * 10) / 10, 2.1, 0.001);
const sellVal = calculateValuation(sell.sde, 'L2');
check('Sell valuation low  (3.0× SDE)', sellVal.low, 3_930_000);
check('Sell valuation mid  (4.0× SDE)', sellVal.mid, 5_240_000);
check('Sell valuation high (5.0× SDE)', sellVal.high, 6_550_000);

/* ── StandardModel Live Schedule: the worked example's opening position. ── */
const NWC = 412_000 + 188_400 + 42_000 - 118_200 - 38_000;
check('Schedule 4.7 NWC = 486,200', NWC, 486_200);
check('Schedule 4.7 adjustment = +15,700', 501_900 - NWC, 15_700);

console.log(`\n${failures === 0 ? 'PASS' : 'FAIL'} — ${failures} failure(s)`);
process.exit(failures === 0 ? 0 : 1);
