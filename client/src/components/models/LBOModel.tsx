/**
 * LBO / Acquisition Model — Interactive leveraged buyout analysis.
 * Purchase price, EBITDA, growth, exit multiple, debt structure.
 * IRR, MOIC, DSCR by year, pro forma P&L, sensitivity matrix.
 * The buyer hook.
 */
import { useModelStore } from '../../lib/modelStore';
import {
  KPICard, ModelSlider, ModelInput, ProFormaTable, DSCRTimeline,
  SourcesUsesTable, SensitivityHeatmap,
} from './Charts';
import { centsToDisplay, pctDisplay, multDisplay, buildSensitivityMatrix, type LBOAssumptions } from '../../lib/calculations/core';

interface Props {
  tabId: string;
}

export default function LBOModel({ tabId }: Props) {
  const tab = useModelStore(s => s.tabs[tabId]);
  const update = useModelStore(s => s.updateAssumption);

  if (!tab) return null;

  const a = tab.assumptions;
  const lbo = tab.outputs.lbo;
  if (!lbo) return <div className="p-5 text-sm text-[#6E6A63]">Set purchase price and EBITDA to begin.</div>;

  // Build sensitivity matrix on the fly
  const lboAssumptions: LBOAssumptions = tab.outputs.lboAssumptions;
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

  return (
    <div className="p-5 space-y-6 max-w-4xl mx-auto">
      {/* KPI Row */}
      <div className="grid grid-cols-5 gap-2.5">
        <KPICard
          label="Entry Multiple"
          value={multDisplay(lbo.entryMultiple)}
          sublabel={`EV: ${centsToDisplay(a.purchasePrice || 0)}`}
        />
        <KPICard
          label="IRR"
          value={pctDisplay(lbo.irr)}
          color={lbo.irr >= 0.20 ? '#34A853' : lbo.irr >= 0.10 ? '#FBBC04' : '#EA4335'}
        />
        <KPICard
          label="MOIC"
          value={multDisplay(lbo.moic)}
          color={lbo.moic >= 2.5 ? '#34A853' : lbo.moic >= 1.5 ? '#FBBC04' : '#EA4335'}
        />
        <KPICard
          label="Year 1 DSCR"
          value={lbo.dscrByYear[0] ? `${lbo.dscrByYear[0].toFixed(2)}x` : '—'}
          color={lbo.dscrByYear[0] >= 1.25 ? '#34A853' : '#EA4335'}
          sublabel={lbo.dscrByYear[0] >= 1.25 ? 'SBA eligible' : 'Below threshold'}
        />
        <KPICard
          label="Payback"
          value={`${lbo.paybackYears} yrs`}
          sublabel={`Equity: ${centsToDisplay(lbo.equityInvested)}`}
        />
      </div>

      {/* Controls + Outputs side by side */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left: Deal Inputs */}
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: '#6E6A63' }}>Deal Assumptions</h3>

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
          <h3 className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: '#6E6A63' }}>Exit & Structure</h3>

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

          <h4 className="text-[10px] font-bold uppercase tracking-wider mt-4 mb-2" style={{ color: '#6E6A63' }}>Debt Structure</h4>

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
          <h3 className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: '#6E6A63' }}>Sources & Uses</h3>
          <SourcesUsesTable sources={lbo.sourcesUses.sources} uses={lbo.sourcesUses.uses} />

          <div className="mt-4 rounded-lg p-3" style={{ background: '#FAF8F4', border: '1px solid #DDD9D1' }}>
            <div className="flex justify-between text-xs mb-1">
              <span style={{ color: '#6E6A63' }}>Exit Value ({a.holdPeriod || 5}yr)</span>
              <span className="font-bold">{centsToDisplay(lbo.exitValue)}</span>
            </div>
            <div className="flex justify-between text-xs mb-1">
              <span style={{ color: '#6E6A63' }}>Exit Equity</span>
              <span className="font-bold" style={{ color: '#34A853' }}>{centsToDisplay(lbo.exitEquity)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color: '#6E6A63' }}>Cash-on-Cash</span>
              <span className="font-bold">{pctDisplay(lbo.cashOnCash)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* DSCR Timeline */}
      <div>
        <h3 className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: '#6E6A63' }}>DSCR by Year</h3>
        <DSCRTimeline dscrByYear={lbo.dscrByYear} />
      </div>

      {/* Pro Forma */}
      <div>
        <h3 className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: '#6E6A63' }}>Pro Forma Projections</h3>
        <ProFormaTable years={lbo.proForma} />
      </div>

      {/* Sensitivity */}
      {sensitivityData && sensitivityData.var1Values.length > 0 && (
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: '#6E6A63' }}>IRR Sensitivity: EBITDA vs Exit Multiple</h3>
          <SensitivityHeatmap {...sensitivityData} metric="irr" />
        </div>
      )}
    </div>
  );
}
