// Model layer — assembles deal.json inputs into engine calls.
// No formula lives here. Anything that computes lives in the engine
// (or, pre-vendoring, the V17 reference the adapter falls back to).
import { engine as E, ENGINE_LABEL } from "./engine-adapter.mjs";

const latestYear = (deal) => deal.financials.years.at(-1);

function verifiedAddbacks(deal, yearLabel) {
  return (deal.financials.addbacks ?? [])
    .filter((a) => a.verified && (!a.year || a.year === yearLabel))
    .reduce((s, a) => s + a.amount, 0);
}

export function earningsBasis(deal, y = latestYear(deal)) {
  const va = verifiedAddbacks(deal, y.label);
  const league = deal.deal.league ?? "L1";
  const useSDE = league === "L1" || league === "L2";
  const sde = E.sde({
    net_income: y.net_income, owner_salary: y.owner_salary ?? 0,
    depreciation: y.depreciation ?? 0, amortization: y.amortization ?? 0,
    interest: y.interest ?? 0, one_time_expenses: y.one_time_expenses ?? 0,
    verified_addbacks: va,
  });
  const ebitda = E.adjustedEbitda({
    net_income: y.net_income, depreciation: y.depreciation ?? 0,
    amortization: y.amortization ?? 0, interest: y.interest ?? 0,
    taxes: y.taxes ?? 0, verified_addbacks: va,
    non_recurring_income: y.non_recurring_income ?? 0,
  });
  return { year: y.label, sde, ebitda, verified_addbacks: va, basis: useSDE ? "SDE" : "EBITDA", basisAmount: useSDE ? sde : ebitda };
}

export function valuationModel(deal) {
  const per = deal.financials.years.map((y) => earningsBasis(deal, y));
  const cur = per.at(-1);
  const v = deal.valuation ?? {};
  const out = { model: "valuation", engine: ENGINE_LABEL, perYear: per, current: cur };
  if (v.multiple_low != null && v.multiple_high != null) {
    const basisAmount = (v.multiple_basis ?? cur.basis) === "SDE" ? cur.sde : cur.ebitda;
    out.range = { ...E.valuationRange(basisAmount, v.multiple_low, v.multiple_high),
      basis: v.multiple_basis ?? cur.basis, multiple_low: v.multiple_low,
      multiple_high: v.multiple_high, multiple_source: v.multiple_source ?? "UNSOURCED — do not publish" };
  } else {
    out.range = null; out.note = "No multiples in deal.json valuation block — range not computed.";
  }
  return out;
}

export function loansFromStructure(s) {
  const loans = [];
  if (s.sba_loan) loans.push({ name: "SBA 7(a)", principal: s.sba_loan, rate: s.sba_rate ?? 0, termYears: s.sba_term_years ?? 10 });
  if (s.seller_note) loans.push({ name: "Seller note", principal: s.seller_note, rate: s.seller_note_rate ?? 0, termYears: s.seller_note_term_years ?? 5 });
  return loans;
}

export function sbaModel(deal) {
  const s = deal.structure ?? {};
  const cur = earningsBasis(deal);
  const loans = loansFromStructure(s);
  const perLoan = loans.map((l) => ({ ...l,
    monthlyPayment: E.monthlyPayment(l.principal, l.rate, l.termYears),
    schedule: E.amortizationSchedule(l.principal, l.rate, l.termYears).rows }));
  const ads = E.annualDebtService(loans);
  const d = E.dscr(cur.ebitda, ads);
  const dSde = E.dscr(cur.sde, ads);
  const equity = (s.purchase_price ?? 0) - loans.reduce((x, l) => x + l.principal, 0);
  const ltv = s.purchase_price ? loans.reduce((x, l) => x + l.principal, 0) / s.purchase_price : null;
  return { model: "sba", engine: ENGINE_LABEL, earnings: cur,
    structure: { purchase_price: s.purchase_price ?? null, equity_injection: equity,
      working_capital_injection: s.working_capital_injection ?? 0, ltv },
    loans: perLoan, annual_debt_service: ads,
    dscr: { on_ebitda: d, on_sde: dSde, sba_min: E.SBA_DSCR_MIN, conventional_min: E.CONVENTIONAL_DSCR_MIN,
      sba_pass: d >= E.SBA_DSCR_MIN, conventional_pass: d >= E.CONVENTIONAL_DSCR_MIN },
    risk: ltv != null ? E.riskScore(d, ltv) : null };
}

export function lboModel(deal) {
  const s = deal.structure ?? {}, p = deal.projections ?? {};
  const cur = earningsBasis(deal);
  const y0 = latestYear(deal);
  const hold = p.hold_years ?? 5;
  const growth = p.revenue_growth_pct ?? 0;
  const margin = p.margin_pct ?? (y0.revenue ? cur.ebitda / y0.revenue : 0);
  const loans = loansFromStructure(s);
  const schedules = loans.map((l) => E.amortizationSchedule(l.principal, l.rate, l.termYears));
  const equity = (s.purchase_price ?? 0) - loans.reduce((x, l) => x + l.principal, 0) + (s.working_capital_injection ?? 0);
  const entryMultiple = s.purchase_price && cur.ebitda ? s.purchase_price / cur.ebitda : null;

  const proForma = [];
  let rev = y0.revenue;
  const equityFlows = [-equity];
  for (let y = 1; y <= hold; y++) {
    rev = rev * (1 + growth);
    const ebitda = rev * margin;
    const capex = rev * (p.capex_pct_revenue ?? 0);
    const debtService = schedules.reduce((x, sc) => {
      const r = sc.rows[y - 1]; return x + (r ? r.interest + r.principal : 0); }, 0);
    const fcfToEquity = ebitda - capex - debtService;
    const row = { year: y, revenue: rev, ebitda, capex, debt_service: debtService,
      fcf_to_equity: fcfToEquity,
      dscr: E.dscr(ebitda, debtService) };
    if (y === hold) {
      const exitMult = p.exit_multiple ?? entryMultiple;
      const remainingDebt = schedules.reduce((x, sc) => { const r = sc.rows[y - 1]; return x + (r ? r.balance : 0); }, 0);
      row.exit_ev = ebitda * exitMult;
      row.remaining_debt = remainingDebt;
      row.exit_equity_proceeds = row.exit_ev - remainingDebt;
      equityFlows.push(fcfToEquity + row.exit_equity_proceeds);
    } else equityFlows.push(fcfToEquity);
    proForma.push(row);
  }
  const distributions = equityFlows.slice(1).reduce((a, b) => a + b, 0);
  const exitMult = p.exit_multiple ?? entryMultiple;
  return { model: "lbo", engine: ENGINE_LABEL, earnings: cur,
    assumptions: { hold_years: hold, revenue_growth_pct: growth, margin_pct: margin,
      entry_multiple: entryMultiple, exit_multiple: exitMult,
      capex_pct_revenue: p.capex_pct_revenue ?? 0, equity_invested: equity },
    proForma, equityFlows,
    returns: { irr: E.irr(equityFlows), moic: E.moic(distributions, equity),
      arbitrage_spread: entryMultiple != null && exitMult != null ? E.arbitrageSpread(exitMult, entryMultiple, cur.ebitda) : null },
    sensitivity: sensitivityIrr(deal, { hold, growth, margin, loans, equity }) };
}

function sensitivityIrr(deal, ctx) {
  // exit multiple × revenue growth → IRR
  const p = deal.projections ?? {}, s = deal.structure ?? {};
  const cur = earningsBasis(deal);
  const entry = s.purchase_price && cur.ebitda ? s.purchase_price / cur.ebitda : null;
  const baseExit = p.exit_multiple ?? entry;
  if (baseExit == null) return null;
  const exits = [-1, -0.5, 0, 0.5, 1].map((d) => baseExit + d);
  const growths = [-0.04, -0.02, 0, 0.02, 0.04].map((d) => ctx.growth + d);
  const y0 = latestYear(deal);
  const schedules = ctx.loans.map((l) => E.amortizationSchedule(l.principal, l.rate, l.termYears));
  const cell = (g, x) => {
    let rev = y0.revenue; const flows = [-ctx.equity];
    for (let y = 1; y <= ctx.hold; y++) {
      rev = rev * (1 + g);
      const ebitda = rev * ctx.margin;
      const ds = schedules.reduce((a, sc) => { const r = sc.rows[y - 1]; return a + (r ? r.interest + r.principal : 0); }, 0);
      let f = ebitda - rev * (p.capex_pct_revenue ?? 0) - ds;
      if (y === ctx.hold) {
        const rem = schedules.reduce((a, sc) => { const r = sc.rows[y - 1]; return a + (r ? r.balance : 0); }, 0);
        f += ebitda * x - rem;
      }
      flows.push(f);
    }
    return E.irr(flows);
  };
  return { rows: growths.map((g) => ({ growth: g, cells: exits.map((x) => ({ exit_multiple: x, irr: cell(g, x) })) })), exits, growths };
}

export function earnoutModel(deal) {
  const e = deal.earnout;
  if (!e) return { model: "earnout", engine: ENGINE_LABEL, note: "No earnout block in deal.json." };
  return { model: "earnout", engine: ENGINE_LABEL,
    ...E.earnoutExpectedValue(e.base_price, e.tranches), tranches: e.tranches };
}

export function compareModel(deals) {
  return { model: "compare", engine: ENGINE_LABEL,
    deals: deals.map((d) => {
      const val = valuationModel(d), sba = d.structure ? sbaModel(d) : null,
        lbo = d.structure && d.projections ? lboModel(d) : null;
      return { name: d.deal.name, league: d.deal.league, earnings: val.current,
        valuation_range: val.range,
        dscr: sba?.dscr?.on_ebitda ?? null, risk: sba?.risk?.score ?? null,
        irr: lbo?.returns?.irr ?? null, moic: lbo?.returns?.moic ?? null,
        purchase_price: d.structure?.purchase_price ?? null };
    }) };
}

export const MODELS = { valuation: valuationModel, sba: sbaModel, lbo: lboModel, earnout: earnoutModel };
