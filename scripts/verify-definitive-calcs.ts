/**
 * INDEPENDENT re-derivation of the DEFINITIVE financial worked examples.
 * A SECOND implementation of the arithmetic (not the runtime): recomputes each
 * golden from first principles and compares to the published output. A mismatch
 * means a real calculation error the self-consistent conformance suite cannot
 * catch. Run: npx tsx scripts/verify-definitive-calcs.ts
 */
import { MODEL_OVERLAYS } from './definitivePublicOverlay.js';
import { DEFINITIVE_DEAL_MECHANICS_CATALOG } from '../server/services/definitiveDealMechanicsCatalog.js';
import { executeV19Model } from '../server/services/v19ModelRuntime.js';
const _bySlot = new Map(DEFINITIVE_DEAL_MECHANICS_CATALOG.map(e => [e.slotId, e]));
const G: any = {};
for (const [slot, ov] of Object.entries(MODEL_OVERLAYS)) {
  const e = _bySlot.get(slot);
  if (!e?.implementedRuntimeModelId) continue;
  const r = await executeV19Model({ modelId: e.implementedRuntimeModelId, input: (ov as any).golden.input });
  G[slot] = { input: (ov as any).golden.input, output: r.outputs };
}

// half-to-even to 4 decimals (the Conventions rule), on exact-ish decimal
function r4(x: number): number {
  const s = x * 1e4;
  const f = Math.floor(s);
  const diff = s - f;
  let n: number;
  if (Math.abs(diff - 0.5) < 1e-9) n = (f % 2 === 0) ? f : f + 1;
  else n = Math.round(s);
  return n / 1e4;
}
const cents = Math.round;
let pass = 0, fail = 0;
const results: string[] = [];
function chk(slot: string, field: string, got: any, exp: any, tol = 0) {
  const g = G[slot]?.output?.[field];
  const ok = typeof exp === 'number' && typeof g === 'number'
    ? Math.abs(g - exp) <= (tol || (Number.isInteger(exp) ? 0 : 1e-4))
    : JSON.stringify(g) === JSON.stringify(exp);
  if (ok) pass++; else { fail++; results.push(`  ✗ ${slot}.${field}: published=${JSON.stringify(g)} independent=${JSON.stringify(exp)}`); }
}
const I = (slot: string) => G[slot].input;

// ── M119 SBA 7(a) ──────────────────────────────────────────────
{ const i = I('M119');
  chk('M119', 'buyer_equity_pct', undefined, r4(i.buyer_equity_cents / i.purchase_price_cents));
  chk('M119', 'dscr', undefined, r4(i.cash_flow_cents / i.annual_debt_service_cents));
  chk('M119', 'meets_sba_equity_floor', undefined, (i.buyer_equity_cents / i.purchase_price_cents) >= 0.10);
  chk('M119', 'meets_sba_dscr_floor', undefined, (i.cash_flow_cents / i.annual_debt_service_cents) >= 1.15);
  chk('M119', 'max_7a_loan_cents', undefined, 500_000_000);
}
// ── M185 §280G ─────────────────────────────────────────────────
{ const i = I('M185'); const thr = i.base_amount_cents * 3; const trig = i.parachute_payments_cents >= thr;
  const excess = trig ? Math.max(0, i.parachute_payments_cents - i.base_amount_cents) : 0;
  chk('M185', 'three_times_base_threshold_cents', undefined, thr);
  chk('M185', 'section_280g_triggered', undefined, trig);
  chk('M185', 'excess_parachute_payment_cents', undefined, excess);
  chk('M185', 'excise_tax_20pct_cents', undefined, cents(excess * 0.20));
  chk('M185', 'lost_employer_deduction_cents', undefined, excess);
  chk('M185', 'cleansing_vote_passed', undefined, i.shareholder_cleansing_vote_pct > 0.75);
}
// ── M202 §1374 BIG ─────────────────────────────────────────────
{ const i = I('M202'); const nubig = Math.max(0, i.fmv_at_conversion_cents - i.basis_at_conversion_cents);
  const taxLimit = i.taxable_income_cents ?? i.recognized_gain_cents;
  const base = Math.min(nubig, i.recognized_gain_cents, taxLimit);
  chk('M202', 'net_unrealized_built_in_gain_cents', undefined, nubig);
  chk('M202', 'recognized_big_tax_base_cents', undefined, base);
  chk('M202', 'section_1374_tax_cents', undefined, cents(base * 0.21));
}
// ── M111 / M112 earnout EV+PV ──────────────────────────────────
for (const m of ['M111', 'M112']) { const i = I(m);
  const ev = i.earnout_targets.reduce((s: number, t: number, k: number) => s + t * Math.min(1, Math.max(0, i.probabilities[k])), 0);
  const pv = ev / ((1 + i.discount_rate) ** (i.term_years ?? 1));
  chk(m, 'expected_gross_cents', undefined, cents(ev));
  chk(m, 'expected_present_value_cents', undefined, cents(pv));
  chk(m, 'probabilities_sum', undefined, r4(i.probabilities.reduce((s: number, p: number) => s + p, 0)));
}
// ── M181 venture-debt warrant ──────────────────────────────────
{ const i = I('M181'); const cov = i.loan_amount_cents * i.warrant_coverage_pct;
  const shares = Math.round(cov / i.exercise_price_cents);
  const intrinsic = Math.max(0, shares * (i.fair_value_share_price_cents - i.exercise_price_cents));
  const interest = cents(i.loan_amount_cents * (i.cash_interest_rate ?? 0) * (i.term_years ?? 3));
  const gross = i.loan_amount_cents + interest + intrinsic;
  chk('M181', 'warrant_coverage_amount_cents', undefined, cents(cov));
  chk('M181', 'warrant_shares', undefined, shares);
  chk('M181', 'intrinsic_warrant_value_cents', undefined, intrinsic);
  chk('M181', 'lender_gross_return_cents', undefined, gross);
  chk('M181', 'estimated_lender_irr', undefined, r4((gross / i.loan_amount_cents) ** (1 / (i.term_years ?? 3)) - 1));
}
// ── M180 SAFE conversion ───────────────────────────────────────
{ const i = I('M180'); const cap = i.valuation_cap_cents / i.pre_money_share_count;
  const disc = i.priced_round_share_price_cents * (1 - i.discount_pct);
  const conv = Math.min(cap, disc, i.priced_round_share_price_cents);
  chk('M180', 'conversion_price_cents', undefined, cents(conv), 1);
}
// ── M191 transfer tax (CT flat 1.11%) ──────────────────────────
{ const i = I('M191'); const base = cents(i.fmv_real_property_cents * i.interest_transferred_pct);
  chk('M191', 'tax_base_cents', undefined, base);
  chk('M191', 'transfer_tax_cents', undefined, cents(base * 0.0111));
}
// ── M177 LP §1446(f) withholding ───────────────────────────────
{ const i = I('M177'); const b = i.amount_realized_cents ?? i.purchase_price_cents;
  chk('M177', 'section_1446f_default_withholding_cents', undefined, i.seller_foreign_person && !(i.withholding_certificate_provided) ? cents(b * 0.10) : 0);
}
// ── M184 covenant basket ───────────────────────────────────────
{ const i = I('M184'); let agg = 0;
  for (const b of i.baskets) {
    const total = (b.fixed_capacity_cents ?? b.opening_capacity_cents ?? 0) + cents((b.grower_basis_cents ?? 0) * (b.grower_pct ?? 0)) + (b.builder_amount_cents ?? 0) + (b.ratio_capacity_cents ?? 0);
    agg += total - (b.used_cents ?? 0);
  }
  chk('M184', 'aggregate_remaining_capacity_cents', undefined, agg);
  chk('M184', 'basket_count', undefined, i.baskets.length);
}
// ── M212 termination fees ──────────────────────────────────────
{ const i = I('M212'); const tv = i.transaction_value_cents;
  const tf = cents(tv * 0.027);
  chk('M212', 'target_break_fee_cents', undefined, tf);
  chk('M212', 'go_shop_break_fee_cents', undefined, cents(tf * 0.5));
  chk('M212', 'reverse_termination_fee_cents', undefined, cents(tv * 0.042));
  chk('M212', 'antitrust_reverse_fee_cents', undefined, cents(tv * 0.05));
}
// ── M139 §1060 allocation (residual to Class VII) ──────────────
{ const i = I('M139');
  // residual method: Class VII goodwill = price - sum of all NON-goodwill class FMVs
  const nonGoodwill = (i.asset_classes as any[]).filter(c => c.class_number !== 7)
    .reduce((s: number, c: any) => s + (c.fair_market_value_cents || 0), 0);
  chk('M139', 'class_vii_goodwill_cents', undefined, Math.max(0, i.purchase_price_cents - nonGoodwill));
}
// ── M172 REIT ratios ───────────────────────────────────────────
{ const i = I('M172');
  if (i.qualifying_income_cents != null && i.gross_income_cents != null)
    chk('M172', 'income_test_ratio', undefined, r4(i.qualifying_income_cents / i.gross_income_cents));
}

// ── M182 ABL borrowing base ────────────────────────────────────
{ const i = I('M182'); const gross = cents(i.eligible_ar_cents * i.ar_advance_rate) + cents(i.eligible_inventory_cents * i.inventory_advance_rate);
  chk('M182', 'gross_borrowing_base_cents', undefined, gross);
  chk('M182', 'net_borrowing_base_cents', undefined, gross - (i.reserves_cents ?? 0));
}
// ── M183 make-whole PV ─────────────────────────────────────────
{ const i = I('M183'); const dr = i.treasury_rate + i.spread_bps / 10000;
  const c = i.principal_cents * i.coupon_rate; let pv = 0;
  for (let t = 1; t <= i.remaining_years; t++) pv += c / (1 + dr) ** t;
  pv += i.principal_cents / (1 + dr) ** i.remaining_years;
  chk('M183', 'make_whole_discount_rate', undefined, r4(dr));
  chk('M183', 'make_whole_price_cents', undefined, cents(pv), 2);
}
// ── M186 §382 limitation ───────────────────────────────────────
{ const i = I('M186');
  chk('M186', 'annual_section_382_limitation_cents', undefined, cents(i.loss_corporation_value_cents * i.long_term_tax_exempt_rate));
}
// ── M190 NOI / cap-rate value ──────────────────────────────────
{ const i = I('M190'); const noi = i.effective_gross_income_cents - i.operating_expenses_cents - (i.replacement_reserve_cents ?? 0);
  chk('M190', 'normalized_noi_cents', undefined, noi);
  chk('M190', 'value_from_cap_rate_cents', undefined, cents(noi / i.cap_rate), 2);
}
// ── M194 OpCo EBITDA after rent ────────────────────────────────
{ const i = I('M194'); const rent = cents(i.real_property_value_cents * i.target_cap_rate);
  chk('M194', 'annual_master_lease_rent_cents', undefined, rent);
  chk('M194', 'opco_ebitda_after_rent_cents', undefined, i.opco_ebitda_cents - rent);
}
// ── M208 escrow sizing ─────────────────────────────────────────
{ const i = I('M208'); const tv = i.transaction_value_cents;
  chk('M208', 'general_escrow_cents', undefined, cents(tv * 0.10));
  chk('M208', 'ppa_escrow_cents', undefined, cents(tv * 0.01));
  chk('M208', 'aggregate_escrow_cents', undefined, cents(tv * 0.10) + cents(tv * 0.01));
}
// ── M148 three-prong solvency ──────────────────────────────────
{ const i = I('M148');
  chk('M148', 'balance_sheet_surplus_cents', undefined, i.fair_value_assets_cents - i.liabilities_cents);
  chk('M148', 'cash_flow_surplus_cents', undefined, i.projected_cash_flow_cents - i.debts_due_cents);
  chk('M148', 'capital_adequacy_surplus_cents', undefined, i.available_capital_cents - i.required_capital_cents);
}
// ── M199 FIRPTA v1.1 ───────────────────────────────────────────
{ const i = I('M199');
  chk('M199', 'withholding_amount_cents', undefined, cents(i.amount_realized_cents * 0.15));
}
// ── M178 strip sale ────────────────────────────────────────────
{ const i = I('M178');
  chk('M178', 'sold_nav_cents', undefined, cents(i.fund_nav_cents * i.strip_percentage));
  chk('M178', 'implied_total_value_cents', undefined, cents(i.sale_price_cents / i.strip_percentage));
}
// ── M179 NAV LTV ───────────────────────────────────────────────
{ const i = I('M179');
  chk('M179', 'nav_ltv', undefined, r4(i.loan_amount_cents / i.fund_nav_cents));
  chk('M179', 'cushion_pct', undefined, r4(1 - i.loan_amount_cents / i.fund_nav_cents));
}
// ── M198 PCA reserve (sum of tiers) ────────────────────────────
{ const i = I('M198'); const sum = (i.pca_items as any[]).reduce((s, it) => s + (it.immediate_repair_cents || 0) + (it.year_1_3_cents || 0) + (it.year_4_5_cents || 0) + (it.year_6_12_cents || 0), 0);
  chk('M198', 'total_replacement_reserve_cents', undefined, sum);
}
// ── M109 working-capital peg (mean) ────────────────────────────
{ const i = I('M109'); const arr = i.monthly_nwc_cents as number[];
  chk('M109', 'peg_cents', undefined, cents(arr.reduce((s, x) => s + x, 0) / arr.length));
  chk('M109', 'low_cents', undefined, Math.min(...arr));
  chk('M109', 'high_cents', undefined, Math.max(...arr));
}
// ── M146 cap-table dilution ────────────────────────────────────
{ const i = I('M146'); const post = i.pre_money_cents + i.round_size_cents;
  chk('M146', 'post_money_cents', undefined, post);
  chk('M146', 'investor_ownership_pct', undefined, r4(i.round_size_cents / post));
  chk('M146', 'founder_ownership_pct', undefined, r4(1 - i.round_size_cents / post - i.option_pool_pct));
}
// ── M156 §1111(b) ──────────────────────────────────────────────
{ const i = I('M156'); const deficiency = i.allowed_claim_cents - i.collateral_value_cents;
  chk('M156', 'deficiency_claim_cents', undefined, deficiency);
  chk('M156', 'no_election_value_cents', undefined, i.collateral_value_cents + cents(deficiency * i.guc_recovery_pct));
}
// ── M158 DIP sizing ────────────────────────────────────────────
{ const i = I('M158');
  chk('M158', 'liquidity_need_cents', undefined, i.thirteen_week_cash_need_cents + i.minimum_liquidity_cents - i.opening_cash_cents);
}

console.log(`\nIndependent re-derivation: ${pass} matched, ${fail} mismatched`);
if (results.length) { console.log(results.join('\n')); process.exit(1); }
else console.log('  All independently-recomputed values match the published outputs.');
