/**
 * Covenant Compliance Model — DSCR, Debt/EBITDA, LTV headroom dashboard.
 */
import { useModelStore } from '../../lib/modelStore';
import { KPICard, ModelInput, ModelSlider, DSCRGauge } from './Charts';
import { centsToDisplay, pctDisplay } from '../../lib/calculations/core';

interface Props { tabId: string; }

export default function CovenantModel({ tabId }: Props) {
  const tab = useModelStore(s => s.tabs[tabId]);
  const update = useModelStore(s => s.updateAssumption);
  if (!tab) return null;

  const a = tab.assumptions;
  const cov = tab.outputs.covenant;

  const GREEN = '#34A853';
  const YELLOW = '#FBBC04';
  const RED = '#EA4335';

  return (
    <div className="p-5 space-y-6 max-w-3xl mx-auto">
      <h2 className="text-base font-bold m-0" style={{ fontFamily: 'Sora, sans-serif' }}>Covenant Compliance</h2>

      {/* Compliance status */}
      {cov && (
        <div className={`rounded-xl p-4 text-center`} style={{ background: cov.compliant ? `${GREEN}10` : `${RED}10`, border: `2px solid ${cov.compliant ? GREEN : RED}` }}>
          <p className="text-xl font-bold m-0" style={{ color: cov.compliant ? GREEN : RED, fontFamily: 'Sora, sans-serif' }}>
            {cov.compliant ? 'ALL COVENANTS MET' : 'COVENANT BREACH'}
          </p>
          {cov.warnings.length > 0 && (
            <div className="mt-2 space-y-1">
              {cov.warnings.map((w: string, i: number) => (
                <p key={i} className="text-xs m-0" style={{ color: RED }}>{w}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Headroom gauges */}
      {cov && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* DSCR */}
          <div className="rounded-lg p-4" style={{ border: '1px solid #DDD9D1' }}>
            <h4 className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: '#6E6A63' }}>DSCR</h4>
            <DSCRGauge dscr={cov.dscrHeadroom + (a.minDscr ?? 1.25)} threshold={a.minDscr ?? 1.25} />
            <div className="mt-2 text-xs">
              <div className="flex justify-between">
                <span style={{ color: '#6E6A63' }}>Headroom</span>
                <span className="font-bold" style={{ color: cov.dscrHeadroom >= 0 ? GREEN : RED }}>
                  {cov.dscrHeadroom >= 0 ? '+' : ''}{cov.dscrHeadroom.toFixed(2)}x
                </span>
              </div>
            </div>
          </div>

          {/* Debt/EBITDA */}
          <div className="rounded-lg p-4" style={{ border: '1px solid #DDD9D1' }}>
            <h4 className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: '#6E6A63' }}>Debt / EBITDA</h4>
            <p className="text-2xl font-bold m-0" style={{
              color: cov.debtToEbitdaHeadroom >= 0 ? GREEN : RED,
              fontFamily: 'Sora, sans-serif',
            }}>
              {cov.debtToEbitda.toFixed(1)}x
            </p>
            <p className="text-xs m-0 mt-1" style={{ color: '#6E6A63' }}>
              Limit: {(a.maxDebtToEbitda ?? 3.5).toFixed(1)}x
            </p>
            <div className="mt-2 text-xs flex justify-between">
              <span style={{ color: '#6E6A63' }}>Headroom</span>
              <span className="font-bold" style={{ color: cov.debtToEbitdaHeadroom >= 0 ? GREEN : RED }}>
                {cov.debtToEbitdaHeadroom >= 0 ? '+' : ''}{cov.debtToEbitdaHeadroom.toFixed(1)}x
              </span>
            </div>
          </div>

          {/* LTV */}
          <div className="rounded-lg p-4" style={{ border: '1px solid #DDD9D1' }}>
            <h4 className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: '#6E6A63' }}>LTV</h4>
            <p className="text-2xl font-bold m-0" style={{
              color: cov.ltvHeadroom >= 0 ? GREEN : RED,
              fontFamily: 'Sora, sans-serif',
            }}>
              {pctDisplay(cov.ltv)}
            </p>
            <p className="text-xs m-0 mt-1" style={{ color: '#6E6A63' }}>
              Limit: {pctDisplay(a.maxLtv ?? 0.80)}
            </p>
            <div className="mt-2 text-xs flex justify-between">
              <span style={{ color: '#6E6A63' }}>Headroom</span>
              <span className="font-bold" style={{ color: cov.ltvHeadroom >= 0 ? GREEN : RED }}>
                {cov.ltvHeadroom >= 0 ? '+' : ''}{pctDisplay(cov.ltvHeadroom)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: '#6E6A63' }}>Business Financials</h3>
          <ModelInput label="EBITDA (Annual)" value={a.ebitda || 0} onChange={v => update(tabId, 'ebitda', v)} prefix="$" />
          <ModelInput label="Annual Debt Service" value={a.annualDebtService || 0} onChange={v => update(tabId, 'annualDebtService', v)} prefix="$" />
          <ModelInput label="Total Debt Outstanding" value={a.totalDebt || 0} onChange={v => update(tabId, 'totalDebt', v)} prefix="$" />
          <ModelInput label="Total Asset Value" value={a.assetValue || 0} onChange={v => update(tabId, 'assetValue', v)} prefix="$" />
        </div>
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: '#6E6A63' }}>Covenant Requirements</h3>
          <ModelSlider label="Min DSCR" value={a.minDscr ?? 1.25} onChange={v => update(tabId, 'minDscr', v)} min={1.0} max={2.0} step={0.05} format="multiple" />
          <ModelSlider label="Max Debt/EBITDA" value={a.maxDebtToEbitda ?? 3.5} onChange={v => update(tabId, 'maxDebtToEbitda', v)} min={1.0} max={6.0} step={0.5} format="multiple" />
          <ModelSlider label="Max LTV" value={a.maxLtv ?? 0.80} onChange={v => update(tabId, 'maxLtv', v)} min={0.50} max={1.0} step={0.05} format="percent" />
        </div>
      </div>
    </div>
  );
}
