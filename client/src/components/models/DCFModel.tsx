/**
 * DCF Model — projected FCF, discount rate, terminal value, and enterprise value.
 */
import { Line } from 'react-chartjs-2';
import { useModelStore } from '../../lib/modelStore';
import { KPICard, ModelInput, ModelSlider } from './Charts';
import { centsToDisplay } from '../../lib/calculations/core';

interface Props { tabId: string; }

const CHART_PRIMARY = 'var(--cd-pos)';
const CHART_PRIMARY_SOFT = 'rgba(46, 140, 90, 0.14)';
const CHART_TEXT = 'var(--cd-ink)';
const CHART_MUTED = 'var(--cd-ink-2)';
const CHART_GREEN = 'var(--cd-warn)'; // secondary series — warm gold so it stays distinct from the emerald primary

export default function DCFModel({ tabId }: Props) {
  const tab = useModelStore(s => s.tabs[tabId]);
  const updateOne = useModelStore(s => s.updateAssumption);
  if (!tab) return null;

  const a = tab.assumptions;
  const dcf = tab.outputs.dcf;
  const projections: number[] = tab.outputs.projections || [];
  const projectionYears = a.projectionYears || 5;

  return (
    <div className="p-5 space-y-6 max-w-3xl mx-auto">
      <h2 className="text-base font-bold m-0" style={{ fontFamily: 'var(--font-body)' }}>
        DCF Enterprise Value
      </h2>

      {dcf && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <KPICard label="Enterprise Value" value={centsToDisplay(dcf.enterpriseValue)} color="var(--cd-pos)" />
          <KPICard label="PV of FCF" value={centsToDisplay(dcf.pvFCF.reduce((sum: number, value: number) => sum + value, 0))} />
          <KPICard label="PV Terminal" value={centsToDisplay(dcf.pvTerminal)} />
          <KPICard label="Terminal Value" value={centsToDisplay(dcf.terminalValue)} />
        </div>
      )}

      {dcf && projections.length > 0 && (
        <div style={{ height: 240 }}>
          <Line
            data={{
              labels: projections.map((_, i) => `Year ${i + 1}`),
              datasets: [
                {
                  label: 'Projected FCF',
                  data: projections.map(v => v / 100),
                  borderColor: CHART_PRIMARY,
                  backgroundColor: CHART_PRIMARY_SOFT,
                  fill: true,
                  tension: 0.3,
                  pointRadius: 4,
                  pointBackgroundColor: CHART_PRIMARY,
                },
                {
                  label: 'PV of FCF',
                  data: dcf.pvFCF.map((v: number) => v / 100),
                  borderColor: CHART_GREEN,
                  backgroundColor: 'rgba(214, 163, 92, 0.12)',
                  fill: false,
                  tension: 0.3,
                  pointRadius: 4,
                  pointBackgroundColor: CHART_GREEN,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: true, position: 'bottom', labels: { color: CHART_MUTED, font: { size: 10 }, boxWidth: 10 } },
                tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${centsToDisplay(Number(ctx.raw) * 100)}` } },
              },
              scales: {
                x: { grid: { display: false }, ticks: { color: CHART_TEXT, font: { size: 10 } } },
                y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { callback: v => centsToDisplay(Number(v) * 100), color: CHART_MUTED, font: { size: 10 } } },
              },
            }}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--m-on-surface-var)' }}>
            Cash Flow Inputs
          </h3>
          <ModelInput
            label="Base Free Cash Flow"
            value={a.baseFCF || 0}
            onChange={v => updateOne(tabId, 'baseFCF', v)}
            prefix="$"
            min={0}
          />
          <ModelSlider
            label="Projection Years"
            value={projectionYears}
            onChange={v => updateOne(tabId, 'projectionYears', Math.round(v))}
            min={3}
            max={10}
            step={1}
            suffix=" years"
          />
          <ModelSlider
            label="Annual FCF Growth"
            value={a.growthRate ?? 0.05}
            onChange={v => updateOne(tabId, 'growthRate', v)}
            min={-0.05}
            max={0.20}
            step={0.005}
            format="percent"
          />
        </div>

        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--m-on-surface-var)' }}>
            Discount & Terminal
          </h3>
          <ModelSlider
            label="Discount Rate"
            value={a.discountRate ?? 0.10}
            onChange={v => updateOne(tabId, 'discountRate', v)}
            min={0.06}
            max={0.25}
            step={0.005}
            format="percent"
          />
          <ModelSlider
            label="Terminal Growth"
            value={a.terminalGrowthRate ?? 0.02}
            onChange={v => updateOne(tabId, 'terminalGrowthRate', v)}
            min={0}
            max={0.06}
            step={0.0025}
            format="percent"
          />
          {dcf && (a.discountRate ?? 0.10) <= (a.terminalGrowthRate ?? 0.02) && (
            <p className="text-xs rounded-lg p-3 m-0" style={{ background: 'rgba(192, 86, 47, 0.10)', color: 'var(--cd-ink-2)' }}>
              Terminal growth must stay below the discount rate. The model keeps terminal value at zero until the inputs are valid.
            </p>
          )}
        </div>
      </div>

      {projections.length > 0 && (
        <div className="overflow-x-auto">
          <table className="text-xs w-full" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--cd-pos)' }}>
                {['Year', 'Projected FCF', 'PV of FCF'].map(h => (
                  <th key={h} style={{ padding: '6px 8px', textAlign: h === 'Year' ? 'left' : 'right', fontSize: 10, color: CHART_MUTED, textTransform: 'uppercase' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projections.map((value, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(25, 24, 19, 0.12)' }}>
                  <td style={{ padding: '6px 8px', fontWeight: 600 }}>Year {i + 1}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{centsToDisplay(value)}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{centsToDisplay(dcf?.pvFCF?.[i] || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[10px] mt-2 mb-0" style={{ color: 'var(--m-on-surface-var)' }}>
            Each input change creates a new model version; Yulia can compare EV cases across diligence, LOI, negotiation, and PMI.
          </p>
        </div>
      )}
    </div>
  );
}
