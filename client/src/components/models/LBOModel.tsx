/**
 * LBO / Acquisition Model — Interactive leveraged buyout analysis.
 * Purchase price, EBITDA, growth, exit multiple, debt structure.
 * IRR, MOIC, DSCR by year, pro forma P&L, sensitivity matrix.
 * The buyer hook.
 */
import { useMemo, useState, type CSSProperties } from 'react';
import { useModelStore } from '../../lib/modelStore';
import {
  KPICard, ModelSlider, ModelInput, ProFormaTable, DSCRTimeline,
  SourcesUsesTable, SensitivityHeatmap,
} from './Charts';
import {
  calculateLBO,
  centsToDisplay,
  pctDisplay,
  multDisplay,
  buildSensitivityMatrix,
  type LBOAssumptions,
  type LBOResult,
} from '../../lib/calculations/core';

interface Props {
  tabId: string;
  onTalkToYulia?: (prompt: string) => void;
}

type LboObjective = 'balanced' | 'returns' | 'cash_to_close';

export default function LBOModel({ tabId, onTalkToYulia }: Props) {
  const tab = useModelStore(s => s.tabs[tabId]);
  const update = useModelStore(s => s.updateAssumption);
  const updateMany = useModelStore(s => s.updateAssumptions);
  const [targetIrr, setTargetIrr] = useState(0.22);
  const [minDscr, setMinDscr] = useState(1.25);
  const [objective, setObjective] = useState<LboObjective>('balanced');

  const lboAssumptions: LBOAssumptions | null = tab?.outputs.lboAssumptions || null;
  const optimized = useMemo(
    () => optimizeLboStructure(lboAssumptions, { targetIrr, minDscr, objective }),
    [lboAssumptions, targetIrr, minDscr, objective],
  );

  if (!tab) return null;

  const a = tab.assumptions;
  const lbo = tab.outputs.lbo;
  if (!lbo) return <div className="p-5 text-sm" style={{ color: 'var(--m-on-surface-var)' }}>Set purchase price and EBITDA to begin.</div>;

  // Build sensitivity matrix on the fly
  const sensitivityData = lboAssumptions ? buildSensitivityMatrix(
    lboAssumptions,
    'ebitda',
    [
      Math.round((a.ebitda || 0) * 0.8),
      Math.round((a.ebitda || 0) * 0.9),
      a.ebitda || 0,
      Math.round((a.ebitda || 0) * 1.1),
      Math.round((a.ebitda || 0) * 1.2),
    ].filter(v => v > 0),
    'exitMultiple',
    [
      (a.exitMultiple || 5) - 1,
      (a.exitMultiple || 5) - 0.5,
      a.exitMultiple || 5,
      (a.exitMultiple || 5) + 0.5,
      (a.exitMultiple || 5) + 1,
    ],
    'irr',
  ) : null;

  const applyOptimized = () => {
    if (!optimized) return;
    updateMany(tabId, {
      purchasePrice: optimized.assumptions.purchasePrice,
      seniorDebtPct: optimized.assumptions.seniorDebtPct,
      mezDebtPct: optimized.assumptions.mezDebtPct,
      _scenario_name: `Optimized LBO · ${objective.replace(/_/g, ' ')}`,
      _scenario_objective: objective,
      _target_irr: targetIrr,
      _min_dscr: minDscr,
      _optimization_note: optimized.summary,
    });
  };

  const askYuliaToOptimize = () => {
    onTalkToYulia?.(buildLboOptimizationPrompt({
      title: tab.title,
      versionNumber: tab.versionNumber,
      currentAssumptions: lboAssumptions,
      currentResult: lbo,
      optimized,
      targetIrr,
      minDscr,
      objective,
    }));
  };

  return (
    <div className="p-5 space-y-6 max-w-4xl mx-auto">
      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        <KPICard
          label="Entry Multiple"
          value={multDisplay(lbo.entryMultiple)}
          sublabel={`EV: ${centsToDisplay(a.purchasePrice || 0)}`}
        />
        <KPICard
          label="IRR"
          value={pctDisplay(lbo.irr)}
          color={lbo.irr >= 0.20 ? 'var(--m-pursue)' : lbo.irr >= 0.10 ? 'var(--m-watch)' : 'var(--m-pass)'}
        />
        <KPICard
          label="MOIC"
          value={multDisplay(lbo.moic)}
          color={lbo.moic >= 2.5 ? 'var(--m-pursue)' : lbo.moic >= 1.5 ? 'var(--m-watch)' : 'var(--m-pass)'}
        />
        <KPICard
          label="Year 1 DSCR"
          value={lbo.dscrByYear[0] ? `${lbo.dscrByYear[0].toFixed(2)}x` : '—'}
          color={lbo.dscrByYear[0] >= 1.25 ? 'var(--m-pursue)' : 'var(--m-pass)'}
          sublabel={lbo.dscrByYear[0] >= 1.25 ? 'SBA eligible' : 'Below threshold'}
        />
        <KPICard
          label="Payback"
          value={`${lbo.paybackYears} yrs`}
          sublabel={`Equity: ${centsToDisplay(lbo.equityInvested)}`}
        />
      </div>

      {/* Optimization Loop */}
      <div style={O.panel}>
        <div style={O.panelTop}>
          <div style={O.copy}>
            <div className="mono" style={O.eyebrow}>LBO ITERATION LOOP</div>
            <h3 style={O.title}>Optimize the structure, then keep modeling.</h3>
            <p style={O.body}>
              Manual sliders stay live. The optimizer only changes controllable deal levers here: EV, senior leverage, and mezzanine. Yulia can broaden the pass to diligence, negotiation, tax, legal, and document outputs.
            </p>
          </div>
          <div style={O.resultBox}>
            <span style={O.resultLabel}>{optimized?.meetsTarget ? 'Modeled target met' : 'Closest modeled case'}</span>
            <strong style={O.resultValue}>
              {optimized ? `${pctDisplay(optimized.result.irr)} / ${multDisplay(optimized.result.moic)}` : 'Needs EV + EBITDA'}
            </strong>
            <span style={O.resultSub}>
              {optimized ? `${formatDscr(optimized.minDscr)} min DSCR · ${centsToDisplay(optimized.result.equityInvested)} equity` : 'Set the first model inputs to start.'}
            </span>
          </div>
        </div>

        <div style={O.controls}>
          <div style={O.sliderCell}>
            <ModelSlider
              label="Target IRR"
              value={targetIrr}
              onChange={setTargetIrr}
              min={0.08} max={0.40} step={0.01}
              format="percent"
            />
          </div>
          <div style={O.sliderCell}>
            <ModelSlider
              label="Minimum DSCR"
              value={minDscr}
              onChange={setMinDscr}
              min={1.00} max={2.00} step={0.05}
              suffix="x"
            />
          </div>
          <div style={O.objectives} aria-label="LBO optimization objective">
            {[
              ['balanced', 'Balanced'],
              ['returns', 'Returns'],
              ['cash_to_close', 'Cash to close'],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                className="m-state"
                style={{
                  ...O.objectiveButton,
                  ...(objective === id ? O.objectiveButtonActive : undefined),
                }}
                onClick={() => setObjective(id as LboObjective)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div style={O.recommendationRow}>
          <div style={O.deltaGrid}>
            <OptimizationDelta label="EV" value={optimized ? formatMoneyDelta(a.purchasePrice || 0, optimized.assumptions.purchasePrice) : '—'} />
            <OptimizationDelta label="Senior debt" value={optimized ? signedPct(optimized.assumptions.seniorDebtPct - (a.seniorDebtPct ?? 0.60)) : '—'} />
            <OptimizationDelta label="Mezzanine" value={optimized ? signedPct(optimized.assumptions.mezDebtPct - (a.mezDebtPct ?? 0)) : '—'} />
          </div>
          <div style={O.actions}>
            <button
              className="m-btn m-glass-control"
              style={O.darkButton}
              type="button"
              disabled={!optimized}
              onClick={applyOptimized}
            >
              Apply modeled case
            </button>
            <button
              className="m-btn outlined"
              type="button"
              onClick={askYuliaToOptimize}
            >
              Ask Yulia to optimize
            </button>
          </div>
        </div>
      </div>

      {/* Controls + Outputs side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Left: Deal Inputs */}
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--m-on-surface-var)' }}>Deal Assumptions</h3>

          <ModelInput
            label="Purchase Price (EV)"
            value={a.purchasePrice || 0}
            onChange={v => update(tabId, 'purchasePrice', v)}
            prefix="$"
          />
          <ModelInput
            label="EBITDA (Year 0)"
            value={a.ebitda || 0}
            onChange={v => update(tabId, 'ebitda', v)}
            prefix="$"
          />
          <ModelInput
            label="Revenue (Year 0)"
            value={a.revenue || 0}
            onChange={v => update(tabId, 'revenue', v)}
            prefix="$"
          />
          <ModelSlider
            label="Revenue Growth"
            value={a.revenueGrowthRate ?? 0.05}
            onChange={v => update(tabId, 'revenueGrowthRate', v)}
            min={-0.10} max={0.30} step={0.01}
            format="percent"
          />
          <ModelSlider
            label="EBITDA Margin"
            value={a.ebitdaMargin ?? 0.20}
            onChange={v => update(tabId, 'ebitdaMargin', v)}
            min={0.05} max={0.50} step={0.01}
            format="percent"
          />
        </div>

        {/* Middle: Exit & Structure */}
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--m-on-surface-var)' }}>Exit & Structure</h3>

          <ModelSlider
            label="Exit Multiple"
            value={a.exitMultiple ?? 5.0}
            onChange={v => update(tabId, 'exitMultiple', v)}
            min={2.0} max={15.0} step={0.1}
            format="multiple"
          />
          <ModelSlider
            label="Hold Period"
            value={a.holdPeriod ?? 5}
            onChange={v => update(tabId, 'holdPeriod', v)}
            min={3} max={10} step={1}
            suffix=" years"
          />

          <h4 className="text-[10px] font-bold uppercase tracking-wider mt-4 mb-2" style={{ color: 'var(--m-on-surface-var)' }}>Debt Structure</h4>

          <ModelSlider
            label="Senior Debt (% of EV)"
            value={a.seniorDebtPct ?? 0.60}
            onChange={v => update(tabId, 'seniorDebtPct', v)}
            min={0} max={0.80} step={0.05}
            format="percent"
          />
          <ModelSlider
            label="Senior Rate"
            value={a.seniorRate ?? 0.08}
            onChange={v => update(tabId, 'seniorRate', v)}
            min={0.04} max={0.15} step={0.0025}
            format="percent"
          />
          <ModelSlider
            label="Mezzanine (% of EV)"
            value={a.mezDebtPct ?? 0}
            onChange={v => update(tabId, 'mezDebtPct', v)}
            min={0} max={0.30} step={0.05}
            format="percent"
          />
        </div>

        {/* Right: Sources & Uses */}
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--m-on-surface-var)' }}>Sources & Uses</h3>
          <SourcesUsesTable sources={lbo.sourcesUses.sources} uses={lbo.sourcesUses.uses} />

          <div className="mt-4 rounded-lg p-3" style={{ background: 'var(--m-surface-container)', border: '1px solid var(--m-outline-var)' }}>
            <div className="flex justify-between text-xs mb-1">
              <span style={{ color: 'var(--m-on-surface-var)' }}>Exit Value ({a.holdPeriod || 5}yr)</span>
              <span className="font-bold">{centsToDisplay(lbo.exitValue)}</span>
            </div>
            <div className="flex justify-between text-xs mb-1">
              <span style={{ color: 'var(--m-on-surface-var)' }}>Exit Equity</span>
              <span className="font-bold" style={{ color: 'var(--m-pursue)' }}>{centsToDisplay(lbo.exitEquity)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color: 'var(--m-on-surface-var)' }}>Cash-on-Cash</span>
              <span className="font-bold">{pctDisplay(lbo.cashOnCash)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* DSCR Timeline */}
      <div>
        <h3 className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--m-on-surface-var)' }}>DSCR by Year</h3>
        <DSCRTimeline dscrByYear={lbo.dscrByYear} />
      </div>

      {/* Pro Forma */}
      <div>
        <h3 className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--m-on-surface-var)' }}>Pro Forma Projections</h3>
        <ProFormaTable years={lbo.proForma} />
      </div>

      {/* Sensitivity */}
      {sensitivityData && sensitivityData.var1Values.length > 0 && (
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--m-on-surface-var)' }}>IRR Sensitivity: EBITDA vs Exit Multiple</h3>
          <SensitivityHeatmap {...sensitivityData} metric="irr" />
        </div>
      )}
    </div>
  );
}

interface LboOptimizationResult {
  assumptions: LBOAssumptions;
  result: LBOResult;
  minDscr: number;
  meetsTarget: boolean;
  summary: string;
}

function optimizeLboStructure(
  base: LBOAssumptions | null,
  options: { targetIrr: number; minDscr: number; objective: LboObjective },
): LboOptimizationResult | null {
  if (!base || base.purchasePrice <= 0 || base.ebitda <= 0) return null;

  const priceFactors = options.objective === 'returns'
    ? [1, 0.975, 0.95, 0.925, 0.9, 0.875, 0.85]
    : [1, 0.975, 0.95, 0.925, 0.9];
  const seniorCandidates = uniqueSorted([
    base.seniorDebtPct,
    0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75,
  ]);
  const mezzCandidates = uniqueSorted([base.mezDebtPct, 0, 0.05, 0.1, 0.15, 0.2]);

  let best: (LboOptimizationResult & { score: number }) | null = null;

  for (const priceFactor of priceFactors) {
    for (const seniorDebtPct of seniorCandidates) {
      for (const mezDebtPct of mezzCandidates) {
        if (seniorDebtPct < 0 || mezDebtPct < 0 || seniorDebtPct + mezDebtPct > 0.85) continue;

        const assumptions: LBOAssumptions = {
          ...base,
          purchasePrice: Math.max(1, Math.round(base.purchasePrice * priceFactor)),
          seniorDebtPct,
          mezDebtPct,
        };
        const result = calculateLBO(assumptions);
        if (result.equityInvested <= 0) continue;

        const candidateMinDscr = minFinite(result.dscrByYear);
        const irr = Number.isFinite(result.irr) ? result.irr : -1;
        const moic = Number.isFinite(result.moic) ? result.moic : 0;
        const dscr = Number.isFinite(candidateMinDscr) ? candidateMinDscr : 3;
        const targetPenalty = Math.max(0, options.targetIrr - irr) * 260;
        const dscrPenalty = Math.max(0, options.minDscr - dscr) * 150;
        const equityRatio = result.equityInvested / assumptions.purchasePrice;
        const priceHaircut = 1 - priceFactor;
        const objectiveBoost =
          options.objective === 'returns'
            ? irr * 90 + moic * 16
            : options.objective === 'cash_to_close'
              ? -equityRatio * 34 + dscr * 8
              : irr * 62 + moic * 12 + dscr * 7 - priceHaircut * 10;
        const score = objectiveBoost - targetPenalty - dscrPenalty - equityRatio * 6 + (irr >= options.targetIrr && dscr >= options.minDscr ? 24 : 0);
        const summary = [
          `${centsToDisplay(assumptions.purchasePrice)} EV`,
          `${pctDisplay(seniorDebtPct)} senior`,
          `${pctDisplay(mezDebtPct)} mezz`,
          `${pctDisplay(result.irr)} IRR`,
          `${formatDscr(candidateMinDscr)} min DSCR`,
        ].join(' · ');

        if (!best || score > best.score) {
          best = {
            assumptions,
            result,
            minDscr: candidateMinDscr,
            meetsTarget: irr >= options.targetIrr && dscr >= options.minDscr,
            summary,
            score,
          };
        }
      }
    }
  }

  if (!best) return null;
  const { score: _score, ...publicResult } = best;
  return publicResult;
}

function uniqueSorted(values: number[]): number[] {
  return Array.from(new Set(values.filter(value => Number.isFinite(value)).map(value => Number(value.toFixed(4)))))
    .sort((a, b) => a - b);
}

function minFinite(values: number[]): number {
  const finite = values.filter(value => Number.isFinite(value));
  return finite.length ? Math.min(...finite) : Infinity;
}

function formatDscr(value: number): string {
  return Number.isFinite(value) ? `${value.toFixed(2)}x` : 'unlevered';
}

function signedPct(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${pctDisplay(value)}`;
}

function formatMoneyDelta(current: number, next: number): string {
  const delta = next - current;
  if (delta === 0) return 'No change';
  const sign = delta > 0 ? '+' : '-';
  return `${sign}${centsToDisplay(Math.abs(delta))}`;
}

function OptimizationDelta({ label, value }: { label: string; value: string }) {
  return (
    <div style={O.delta}>
      <span className="mono" style={O.deltaLabel}>{label}</span>
      <strong style={O.deltaValue}>{value}</strong>
    </div>
  );
}

function buildLboOptimizationPrompt(input: {
  title: string;
  versionNumber: number;
  currentAssumptions: LBOAssumptions | null;
  currentResult: LBOResult;
  optimized: LboOptimizationResult | null;
  targetIrr: number;
  minDscr: number;
  objective: LboObjective;
}) {
  return [
    `Optimize the active LBO model "${input.title}" v${input.versionNumber}.`,
    `Use optimize_scenario with tabId "active" first, then use the current canvas assumptions and saved versions as the source of truth.`,
    `Human target: ${pctDisplay(input.targetIrr)} IRR, ${input.minDscr.toFixed(2)}x minimum DSCR, objective ${input.objective.replace(/_/g, ' ')}.`,
    `Current model: ${pctDisplay(input.currentResult.irr)} IRR, ${multDisplay(input.currentResult.moic)} MOIC, ${formatDscr(minFinite(input.currentResult.dscrByYear))} min DSCR, ${centsToDisplay(input.currentResult.equityInvested)} equity.`,
    input.optimized
      ? `The local deterministic optimizer found: ${input.optimized.summary}. Treat this as a modeled scenario, not a recommendation.`
      : `The local deterministic optimizer could not run yet because EV and EBITDA are incomplete.`,
    `Explain which assumptions the human can manually adjust, which optimized case Yulia would test next, what downside/sensitivity pass should be run, and what downstream IOI, LOI, diligence, negotiation, or term-sheet work should wait for a fresh rerun.`,
  ].join(' ');
}

const O: Record<string, CSSProperties> = {
  panel: {
    border: '1px solid var(--m-outline-var)',
    borderRadius: 18,
    background: 'linear-gradient(135deg, rgba(236,243,250,0.84), rgba(255,255,255,0.72))',
    padding: 16,
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.78)',
  },
  panelTop: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
    gap: 14,
    alignItems: 'start',
  },
  copy: {
    minWidth: 0,
  },
  eyebrow: {
    color: 'var(--m-on-surface-mid)',
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: '0.14em',
  },
  title: {
    margin: '4px 0 6px',
    color: 'var(--m-on-surface)',
    fontSize: 21,
    lineHeight: 1.08,
    letterSpacing: '-0.02em',
  },
  body: {
    margin: 0,
    maxWidth: 620,
    color: 'var(--m-on-surface-var)',
    fontSize: 12.5,
    lineHeight: 1.45,
  },
  resultBox: {
    border: '1px solid rgba(46,92,138,0.14)',
    borderRadius: 16,
    padding: 12,
    background: 'rgba(255,255,255,0.7)',
    display: 'grid',
    gap: 3,
  },
  resultLabel: {
    color: 'var(--m-on-surface-mid)',
    fontSize: 11,
    fontWeight: 700,
  },
  resultValue: {
    color: 'var(--m-on-surface)',
    fontSize: 20,
    letterSpacing: '-0.02em',
  },
  resultSub: {
    color: 'var(--m-on-surface-var)',
    fontSize: 11.5,
    lineHeight: 1.35,
  },
  controls: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
    gap: 12,
    alignItems: 'end',
    marginTop: 14,
  },
  sliderCell: {
    minWidth: 0,
  },
  objectives: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  objectiveButton: {
    border: '1px solid var(--m-outline-var)',
    borderRadius: 999,
    padding: '8px 10px',
    background: 'rgba(255,255,255,0.62)',
    color: 'var(--m-on-surface-var)',
    fontSize: 12,
    fontWeight: 700,
  },
  objectiveButtonActive: {
    background: 'var(--m-primary-container)',
    color: 'var(--m-on-primary-container)',
    borderColor: 'rgba(46,92,138,0.16)',
  },
  recommendationRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
    marginTop: 14,
    flexWrap: 'wrap',
  },
  deltaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 90px), 1fr))',
    gap: 8,
    flex: '1 1 320px',
  },
  delta: {
    borderRadius: 14,
    padding: '9px 10px',
    background: 'rgba(255,255,255,0.66)',
    border: '1px solid rgba(46,92,138,0.10)',
    display: 'grid',
    gap: 2,
  },
  deltaLabel: {
    color: 'var(--m-on-surface-mid)',
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: '0.12em',
  },
  deltaValue: {
    color: 'var(--m-on-surface)',
    fontSize: 13,
    whiteSpace: 'nowrap',
  },
  actions: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  darkButton: {
    color: '#FFFFFF',
    border: '1px solid rgba(255,255,255,0.28)',
    background:
      'radial-gradient(circle at 18% 0%, rgba(255,255,255,0.2), transparent 38%), linear-gradient(135deg, rgba(26,34,51,0.92), rgba(26,34,51,0.72) 58%, rgba(46,92,138,0.54))',
    boxShadow:
      '0 16px 32px -22px rgba(0,0,0,0.62), inset 0 1px 0 rgba(255,255,255,0.32), inset 0 -1px 0 rgba(255,255,255,0.08)',
  },
};
