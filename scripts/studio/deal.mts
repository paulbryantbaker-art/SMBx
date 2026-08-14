/**
 * scripts/studio/deal.mts — MODEL A DEAL, LOCALLY
 *
 * (2026-08-14, Paul: everything but the front end and marketing moves to
 * Cowork. This is the piece the deal phase was missing.)
 *
 * The local front end to `house/deal.ts`, in the same shape as `screen.mts`
 * and `thesis.mts`: pure fs, no API key, no database, nothing metered. A deal
 * is a SPEC on disk — `export const deal = {...}`, the same grammar the deck
 * specs use — so the assumptions are versioned, diffable, and re-runnable in
 * seconds when the seller sends a corrected P&L.
 *
 *   deal.mts new <engagement> <target>   scaffold a spec
 *   deal.mts run <spec.deal.mts>         write the model
 *   deal.mts list                        every spec, and whether its model is stale
 *
 * WHY A SPEC FILE RATHER THAN FLAGS. A model is only worth what its
 * assumptions are worth, and a command line loses them the moment the shell
 * history rolls. The spec is the record: `git log` on it is the negotiation.
 *
 * THREE HONESTY RULES, enforced here rather than left to whoever is reading:
 *
 *  1. A NON-CONVERGED IRR IS NOT PRINTED. `house/deal.ts` returns
 *     `{rate, converged}` because Newton-Raphson can run out its iterations
 *     and hand back a meaningless number. Where that happens this writes
 *     "did not converge" and says what to check, because a rate nobody can
 *     verify is worse than an absent one.
 *  2. EVERY RUN EMITS `## Derivations`. Everything here is computed, not
 *     observed, so `house/audit.ts` treats it as an inferred figure needing
 *     its working shown. A model pasted into a client document without that
 *     block fails the audit — intended, not inconvenient.
 *  3. HOUSE ASSUMPTIONS ARE LABELLED IN THE OUTPUT. League multiples are our
 *     bands, not market comps, and the document says so on the same line it
 *     prints them. Nothing here is an opinion of value.
 *
 * THE LINE: this is internal analysis. It is not a valuation opinion, not a
 * fairness opinion, and not tax advice — `house/deal.ts` deliberately carries
 * no tax surface. Route the tax question to the CPA and cite their answer.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  lbo, sbaFinancing, valuation, dcf, earnout, workingCapitalPeg,
  covenantCompliance, sensitivityMatrix, amortize,
  money, pct, mult, derivations, LEAGUE_MULTIPLES,
  type LBOAssumptions, type EarnoutMilestone,
} from '../../house/deal.js';

const WS = process.cwd();
const DEALS = path.join(WS, 'deals');
const today = () => new Date().toISOString().slice(0, 10);
const rel = (p: string) => path.relative(WS, p) || p;

/* ── the spec shape ───────────────────────────────────────────────────── */

export interface DealSpec {
  target: string;
  engagement: string;
  /** Where the earnings figure came from. Printed verbatim; the audit needs it. */
  earningsSource: string;
  league?: keyof typeof LEAGUE_MULTIPLES | string;
  model: LBOAssumptions;
  sba?: {
    downPaymentPct: number; rate: number; termMonths: number;
    sellerNotePct?: number; workingCapital?: number;
  };
  covenants?: { minDscr: number; maxDebtToEbitda: number; maxLtv: number };
  workingCapital?: { month: string; currentAssets: number; currentLiabilities: number }[];
  earnout?: { milestones: EarnoutMilestone[]; discountRate: number };
  dcf?: { projectedFCF: number[]; terminalGrowth: number; discountRate: number };
  sensitivity?: {
    var1: keyof LBOAssumptions; values1: number[];
    var2: keyof LBOAssumptions; values2: number[];
    metric: 'irr' | 'moic' | 'dscr';
  };
  /** Open questions. Always printed, even when empty — an empty list is a claim. */
  unknowns?: string[];
}

/* ── rendering helpers ────────────────────────────────────────────────── */

/** A sub-dollar closing balance is rounding drift, not debt. See the test suite. */
const closing = (cents: number) => (cents > 0 && cents < 100 ? '$0' : money(cents));

const table = (head: string[], rows: string[][]) => [
  `| ${head.join(' | ')} |`,
  `|${head.map(() => '---:').join('|').replace(/^---:/, ':---')}|`,
  ...rows.map(r => `| ${r.join(' | ')} |`),
].join('\n');

/* ── the model document ───────────────────────────────────────────────── */

function render(spec: DealSpec): string {
  const m = lbo(spec.model);
  const out: string[] = [];
  const derived: { figure: string; from: string; assumption?: string }[] = [];

  out.push(`# ${spec.target} — deal model`);
  out.push('');
  out.push(`**Engagement:** ${spec.engagement}  `);
  out.push(`**Modelled:** ${today()}  `);
  out.push(`**Earnings basis:** ${spec.earningsSource}`);
  out.push('');
  out.push('> Internal analysis. Not a valuation opinion and not tax advice.');
  out.push('> Every figure below is computed from the assumptions in the spec —');
  out.push('> see Derivations at the end, and disagree with the assumptions, not the arithmetic.');
  out.push('');

  /* Sources & uses */
  out.push('## Sources and uses');
  out.push('');
  out.push(table(['Source', 'Amount', 'Share of EV'],
    m.sourcesUses.sources.map(s => [
      s.label, money(s.amount), pct(s.amount / spec.model.purchasePrice),
    ])));
  out.push('');
  out.push(`Enterprise value **${money(spec.model.purchasePrice)}** at an entry multiple of **${mult(m.entryMultiple)}** on ${money(spec.model.ebitda)} EBITDA.`);
  out.push('');
  derived.push({
    figure: `Entry multiple ${mult(m.entryMultiple)}`,
    from: `purchase price ${money(spec.model.purchasePrice)} ÷ EBITDA ${money(spec.model.ebitda)}.`,
    assumption: spec.earningsSource,
  });

  /* Pro forma */
  out.push('## Pro forma');
  out.push('');
  out.push(table(['Year', 'Revenue', 'EBITDA', 'Debt service', 'FCF', 'Debt balance', 'DSCR'],
    m.proForma.map((y, i) => [
      String(y.year), money(y.revenue), money(y.ebitda), money(y.debtService),
      money(y.fcf), closing(y.debtBalance), mult(m.dscrByYear[i]),
    ])));
  out.push('');
  out.push(`Revenue grows at ${pct(spec.model.revenueGrowthRate)} on a ${pct(spec.model.ebitdaMargin)} EBITDA margin, held ${spec.model.holdPeriod} years.`);
  out.push('');
  out.push('> Debt paydown here is straight-line, matching the app\'s canvas. On a long');
  out.push('> amortization it understates early balances and therefore flatters exit equity.');
  out.push('> The month-by-month schedule below is the real one.');
  out.push('');
  derived.push({
    figure: `Year-${spec.model.holdPeriod} EBITDA ${money(m.proForma[m.proForma.length - 1].ebitda)}`,
    from: `year-0 revenue ${money(spec.model.revenue ?? 0)} grown ${pct(spec.model.revenueGrowthRate)} for ${spec.model.holdPeriod} years, at a ${pct(spec.model.ebitdaMargin)} margin.`,
    assumption: 'Growth and margin held flat across the hold. Neither is observed.',
  });

  /* Returns */
  out.push('## Returns to equity');
  out.push('');
  const irrCell = m.irrConverged ? pct(m.irr) : '**did not converge**';
  /* `exitEquity` in the engine is exitValue − debt + cumulative FCF: it folds
     the hold-period distributions into the exit line. Printed as "exit equity"
     it exceeds the exit value itself and reads as a broken model — the number
     is right, the label was wrong. So the composition is split out here. This
     is a RENDERING fix; the engine is untouched, because parity. */
  const equityAtExit = m.exitValue - (m.proForma[m.proForma.length - 1]?.debtBalance ?? 0);
  const distributions = m.exitEquity - equityAtExit;
  out.push(table(['Metric', 'Value'], [
    ['IRR', irrCell],
    ['MOIC', `${mult(m.moic)} — on total value, below`],
    ['Equity invested', money(m.equityInvested)],
    ['Exit value', `${money(m.exitValue)} at ${mult(spec.model.exitMultiple)}`],
    ['Less: debt at exit', money(-(m.proForma[m.proForma.length - 1]?.debtBalance ?? 0))],
    ['Equity at exit', money(equityAtExit)],
    ['Plus: distributions over the hold', money(distributions)],
    ['**Total value to equity**', `**${money(m.exitEquity)}**`],
    ['Cash-on-cash', pct(m.cashOnCash)],
    ['Payback', `${m.paybackYears} years`],
  ]));
  out.push('');
  out.push('> MOIC here is **total value to equity** — the exit proceeds plus every');
  out.push('> dollar distributed during the hold — over the equity cheque. It is not');
  out.push('> exit proceeds alone, which is why the total exceeds the exit value.');
  out.push('> Say which definition you are using whenever this number is quoted.');
  out.push('');
  if (!m.irrConverged) {
    out.push('> **The IRR solver did not converge**, so no rate is printed. That happens when');
    out.push('> the cash-flow stream has no single root — most often because every year is');
    out.push('> positive, or the sign flips more than once mid-hold. Check the FCF column');
    out.push('> above before trusting anything else on this line.');
    out.push('');
  } else {
    derived.push({
      figure: `IRR ${pct(m.irr)}`,
      from: `equity out ${money(m.equityInvested)} at t0, annual FCF per the pro forma, exit equity ${money(m.exitEquity)} at year ${spec.model.holdPeriod}.`,
      assumption: `Exit at ${mult(spec.model.exitMultiple)} — a house assumption, not a quoted comp.`,
    });
  }
  derived.push({
    figure: `MOIC ${mult(m.moic)}`,
    from: `exit equity ${money(m.exitEquity)} ÷ equity invested ${money(m.equityInvested)}.`,
  });

  /* Valuation band */
  if (spec.league) {
    const band = LEAGUE_MULTIPLES[spec.league];
    if (band) {
      const v = valuation(spec.model.ebitda, spec.league);
      out.push('## Where the price sits in the band');
      out.push('');
      out.push(table(['', 'Multiple', 'Value'], [
        ['Low', mult(v.multipleMin), money(v.low)],
        ['Mid', mult(v.multipleMid), money(v.mid)],
        ['High', mult(v.multipleMax), money(v.high)],
        ['**This deal**', `**${mult(m.entryMultiple)}**`, `**${money(spec.model.purchasePrice)}**`],
      ]));
      out.push('');
      out.push(`> The ${spec.league} band is a **house assumption** — our own range for this`);
      out.push('> league, not a set of observed comparables. Cite a real comp before this');
      out.push('> figure goes anywhere near a client document.');
      out.push('');
      derived.push({
        figure: `${spec.league} band ${money(v.low)}–${money(v.high)}`,
        from: `EBITDA ${money(v.earnings)} × ${mult(v.multipleMin)}–${mult(v.multipleMax)}.`,
        assumption: `House league band, LEAGUE_MULTIPLES in house/deal.ts. Not a market observation.`,
      });
    }
  }

  /* SBA / debt schedule */
  if (spec.sba) {
    const s = sbaFinancing(
      spec.model.purchasePrice, spec.model.ebitda, spec.sba.downPaymentPct,
      spec.sba.rate, spec.sba.termMonths, spec.sba.sellerNotePct ?? 0,
      spec.sba.workingCapital ?? 0,
    );
    out.push('## If this is financed SBA');
    out.push('');
    out.push(table(['Line', 'Amount'], [
      ['Total project cost', money(s.totalProjectCost)],
      ['Down payment', `${money(s.downPayment)} (${pct(spec.sba.downPaymentPct)})`],
      ['Seller note', money(s.sellerNote)],
      ['Loan amount', money(s.loanAmount)],
      ['Monthly payment', money(s.monthlyPayment)],
      ['Annual debt service', money(s.annualDebtService)],
      ['DSCR', mult(s.dscr)],
      ['LTV', pct(s.ltv)],
      ['Passes 1.25x + $5M cap', s.eligible ? 'yes' : '**no**'],
    ]));
    out.push('');
    const sched = amortize(s.loanAmount, spec.sba.rate, spec.sba.termMonths);
    const yearEnds = sched.filter(r => r.month % 12 === 0);
    out.push('Balance at each year end, on the real amortization schedule:');
    out.push('');
    out.push(table(['Year', 'Interest paid', 'Principal paid', 'Balance'],
      yearEnds.map((r, i) => {
        const slice = sched.slice(i * 12, (i + 1) * 12);
        return [
          String(i + 1),
          money(slice.reduce((a, x) => a + x.interest, 0)),
          money(slice.reduce((a, x) => a + x.principal, 0)),
          closing(r.balance),
        ];
      })));
    out.push('');
    derived.push({
      figure: `SBA DSCR ${mult(s.dscr)}`,
      from: `EBITDA ${money(spec.model.ebitda)} ÷ annual debt service ${money(s.annualDebtService)} on a ${money(s.loanAmount)} loan at ${pct(spec.sba.rate)} over ${spec.sba.termMonths / 12} years.`,
      assumption: 'Rate quoted, not observed — confirm with the lender before this is relied on.',
    });
  }

  /* Covenants */
  if (spec.covenants) {
    const totalDebt = m.sourcesUses.sources
      .filter(s => s.label !== 'Equity').reduce((a, s) => a + s.amount, 0);
    const c = covenantCompliance(
      spec.model.ebitda, m.proForma[0].debtService, totalDebt,
      spec.model.purchasePrice, spec.covenants,
    );
    out.push('## Covenant headroom at close');
    out.push('');
    out.push(table(['Test', 'Required', 'Actual', 'Headroom'], [
      ['DSCR', `≥ ${spec.covenants.minDscr}`, mult(m.dscrByYear[0]), mult(c.dscrHeadroom)],
      ['Debt / EBITDA', `≤ ${spec.covenants.maxDebtToEbitda}x`, mult(c.debtToEbitda), mult(c.debtToEbitdaHeadroom)],
      ['LTV', `≤ ${pct(spec.covenants.maxLtv)}`, pct(c.ltv), pct(c.ltvHeadroom)],
    ]));
    out.push('');
    out.push(c.compliant
      ? 'Compliant at close on all three tests.'
      : `**Breaches at close:**\n${c.warnings.map(w => `- ${w}`).join('\n')}`);
    out.push('');
  }

  /* Working capital */
  if (spec.workingCapital?.length) {
    const w = workingCapitalPeg(spec.workingCapital);
    out.push('## Working capital peg');
    out.push('');
    out.push(table(['Month', 'Working capital'],
      w.monthlyWC.map(x => [x.month, money(x.wc)])));
    out.push('');
    out.push(`Peg **${money(w.peg)}**, swing (1σ) **${money(w.variance)}** — ${pct(w.variance / Math.abs(w.peg || 1))} of the peg.`);
    out.push('');
    if (w.variance > Math.abs(w.peg) * 0.15) {
      out.push('> The swing is wide against the peg. A peg set at the average of a series');
      out.push('> this volatile is one the seller beats in a good month, so this is an');
      out.push('> argument for a collar rather than a single number.');
      out.push('');
    }
    derived.push({
      figure: `Working capital peg ${money(w.peg)}`,
      from: `mean of (current assets − current liabilities) across ${w.monthlyWC.length} months supplied in the spec.`,
      assumption: 'Trailing average. Seasonality not adjusted for.',
    });
  }

  /* Earnout */
  if (spec.earnout?.milestones.length) {
    const e = earnout(spec.earnout.milestones, spec.earnout.discountRate);
    out.push('## Earnout');
    out.push('');
    out.push(table(['Milestone', 'Year', 'Max payout', 'Probability', 'Expected', 'PV'],
      e.byMilestone.map(x => [
        x.label, String(x.year), money(x.payout), pct(x.probability), money(x.ev), money(x.pv),
      ])));
    out.push('');
    out.push(`Max **${money(e.maxPayout)}**, expected **${money(e.expectedValue)}**, PV **${money(e.pvExpected)}** at ${pct(spec.earnout.discountRate)}.`);
    out.push('');
    out.push('> Those probabilities are **our judgement**, not an observation. Any document');
    out.push('> quoting the expected value has to say whose estimate it is.');
    out.push('');
  }

  /* DCF */
  if (spec.dcf) {
    const d = dcf(spec.dcf.projectedFCF, spec.dcf.terminalGrowth, spec.dcf.discountRate);
    out.push('## DCF cross-check');
    out.push('');
    out.push(table(['Line', 'Value'], [
      ['PV of projected FCF', money(d.pvFCF.reduce((a, b) => a + b, 0))],
      ['Terminal value', money(d.terminalValue)],
      ['PV of terminal', money(d.pvTerminal)],
      ['**Enterprise value**', `**${money(d.enterpriseValue)}**`],
    ]));
    out.push('');
    if (d.terminalValue === 0) {
      out.push('> Terminal value is zero because the discount rate does not exceed terminal');
      out.push('> growth. That is not a cheap business — it is an assumption that cannot');
      out.push('> hold. Fix the rates before reading anything into this section.');
      out.push('');
    }
    derived.push({
      figure: `DCF enterprise value ${money(d.enterpriseValue)}`,
      from: `${spec.dcf.projectedFCF.length} years of projected FCF discounted at ${pct(spec.dcf.discountRate)}, plus a Gordon terminal at ${pct(spec.dcf.terminalGrowth)} growth.`,
      assumption: 'Discount rate is a house assumption, not a computed WACC.',
    });
  }

  /* Sensitivity */
  if (spec.sensitivity) {
    const s = spec.sensitivity;
    const grid = sensitivityMatrix(spec.model, s.var1, s.values1, s.var2, s.values2, s.metric);
    const fmt = s.metric === 'irr' ? pct : mult;
    const label = (k: string, v: number) =>
      /Pct|Rate|Margin/.test(k) ? pct(v) : /Multiple/.test(k) ? mult(v) : String(v);
    out.push(`## Sensitivity — ${s.metric.toUpperCase()}`);
    out.push('');
    out.push(table([`${String(s.var1)} \\ ${String(s.var2)}`, ...s.values2.map(v => label(String(s.var2), v))],
      grid.matrix.map((row, i) => [
        label(String(s.var1), s.values1[i]),
        ...row.map(v => fmt(v)),
      ])));
    out.push('');
  }

  /* Unknowns — always present */
  out.push('## What we don\'t know yet');
  out.push('');
  const unknowns = spec.unknowns ?? [];
  out.push(unknowns.length
    ? unknowns.map(u => `- ${u}`).join('\n')
    : '- _Nothing recorded. An empty list here is a claim that the model rests on nothing unverified — say what is still open before this goes to anyone._');
  out.push('');

  out.push(derivations(derived));
  out.push('');
  return out.join('\n');
}

/* ── commands ─────────────────────────────────────────────────────────── */

const [cmd, ...rest] = process.argv.slice(2);

if (cmd === 'new') {
  const [engagement, ...targetParts] = rest;
  const target = targetParts.join(' ');
  if (!engagement || !target) {
    console.error('Usage: deal.mts new <engagement> <target name>');
    console.error('  e.g. deal.mts new acme-hvac "Bruno Air Conditioning"');
    process.exit(1);
  }
  const slug = target.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const dir = path.join(DEALS, engagement, 'analysis');
  const file = path.join(dir, `${slug}.deal.mts`);
  if (existsSync(file)) { console.error(`Already exists: ${rel(file)}`); process.exit(1); }
  mkdirSync(dir, { recursive: true });

  writeFileSync(file, `/**
 * ${target} — deal model spec.
 *
 * MONEY IS CENTS. $1.5M is 150_000_000. RATES ARE DECIMALS. 10.5% is 0.105.
 * Change a number, re-run, diff the output. The git history of this file is
 * the negotiation.
 *
 *   npx tsx <repo>/scripts/studio/deal.mts run ${rel(file)}
 *
 * No type import: the workspace is not inside the repo, so any relative path
 * to DealSpec would resolve on one machine and not the next. The CLI validates
 * the shape at run time and names what is missing. Field reference: PLAYBOOK.md §5.
 */
export const deal = {
  target: ${JSON.stringify(target)},
  engagement: ${JSON.stringify(engagement)},

  // WHERE THE EARNINGS FIGURE CAME FROM. Printed verbatim into the model and
  // read by the audit. "Seller's P&L" is not enough — say which one, and dated.
  earningsSource: 'TODO — e.g. "Adj. EBITDA per the QoE dated 2026-07-02, tab 3."',

  league: 'L3',

  model: {
    purchasePrice: 150_000_000,   // $1.50M enterprise value
    ebitda:         40_000_000,   // $400k
    revenue:       310_000_000,   // $3.10M
    revenueGrowthRate: 0.05,
    ebitdaMargin:      0.129,
    exitMultiple:      4.0,
    holdPeriod:        5,
    seniorDebtPct: 0.70, seniorRate: 0.105, seniorTerm: 120,
    mezDebtPct:    0,    mezRate:    0,     mezTerm:    0,
  },

  sba: { downPaymentPct: 0.10, rate: 0.105, termMonths: 120, sellerNotePct: 0.10 },

  covenants: { minDscr: 1.25, maxDebtToEbitda: 3.5, maxLtv: 0.80 },

  sensitivity: {
    var1: 'revenueGrowthRate', values1: [0.01, 0.03, 0.05, 0.07, 0.09],
    var2: 'exitMultiple',      values2: [3.0, 3.5, 4.0, 4.5, 5.0],
    metric: 'irr',
  },

  // Say what is still open. An empty list is a claim.
  unknowns: [
    'TODO — customer concentration; top-10 revenue share not yet provided.',
    'TODO — whether the two lead techs stay, and on what terms.',
  ],
};
`);
  console.log(`Created ${rel(file)}`);
  console.log('Fill in the numbers, then:');
  console.log(`  npx tsx <repo>/scripts/studio/deal.mts run ${rel(file)}`);
  process.exit(0);
}

if (cmd === 'run') {
  const specPath = rest.find(a => !a.startsWith('--'));
  if (!specPath) { console.error('Usage: deal.mts run <spec.deal.mts> [--out <dir>]'); process.exit(1); }
  const abs = path.resolve(WS, specPath);
  if (!existsSync(abs)) { console.error(`No such spec: ${specPath}`); process.exit(1); }

  const mod = await import(pathToFileURL(abs).href);
  const spec: DealSpec = mod.deal ?? mod.default;
  if (!spec?.model) {
    console.error(`${rel(abs)} does not export a \`deal\` with a \`model\`. See PLAYBOOK.md §5.`);
    process.exit(1);
  }

  const outIdx = rest.indexOf('--out');
  const outDir = outIdx >= 0 && rest[outIdx + 1]
    ? path.resolve(WS, rest[outIdx + 1])
    : path.dirname(abs);
  mkdirSync(outDir, { recursive: true });

  const base = path.basename(abs).replace(/\.deal\.mts$/, '');
  const outFile = path.join(outDir, `${base}-model.md`);
  writeFileSync(outFile, render(spec));

  const m = lbo(spec.model);
  console.log(`Wrote ${rel(outFile)}`);
  console.log(`  entry ${mult(m.entryMultiple)} · IRR ${m.irrConverged ? pct(m.irr) : 'DID NOT CONVERGE'} · MOIC ${mult(m.moic)} · yr1 DSCR ${mult(m.dscrByYear[0])}`);
  if (!m.irrConverged) {
    console.log('  ! The IRR solver did not converge — the model says so instead of printing a rate.');
  }
  if (/^TODO/.test(spec.earningsSource)) {
    console.log('  ! earningsSource is still a TODO. The audit will flag every figure in this model.');
  }
  if (!spec.unknowns?.length) {
    console.log('  ! No unknowns recorded. An empty list is a claim — say what is still open.');
  }
  process.exit(0);
}

if (cmd === 'list') {
  if (!existsSync(DEALS)) { console.log('No deals/ folder here. Run this from the workspace root.'); process.exit(0); }
  let found = 0;
  for (const engagement of readdirSync(DEALS)) {
    const dir = path.join(DEALS, engagement, 'analysis');
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir).filter(x => x.endsWith('.deal.mts'))) {
      found++;
      const spec = path.join(dir, f);
      const model = path.join(dir, f.replace(/\.deal\.mts$/, '-model.md'));
      const specTime = statSync(spec).mtimeMs;
      const state = !existsSync(model) ? 'never run'
        : statSync(model).mtimeMs < specTime ? 'STALE — spec changed since the last run'
        : 'current';
      console.log(`${state === 'current' ? '  ' : '! '}${engagement}/${f}  — ${state}`);
    }
  }
  if (!found) console.log('No deal specs yet. Start one with: deal.mts new <engagement> <target>');
  process.exit(0);
}

console.log(`deal.mts — model a deal locally. No API key, nothing metered.

  deal.mts new <engagement> <target>    scaffold a spec under deals/<engagement>/analysis/
  deal.mts run <spec.deal.mts>          write <name>-model.md beside it (--out to redirect)
  deal.mts list                         every spec, and whether its model is stale

Money is CENTS, rates are DECIMALS. The spec is the record — commit it.
Deal document specs: PLAYBOOK.md §5. What may not be said: THE LINE.`);
process.exit(cmd ? 1 : 0);
