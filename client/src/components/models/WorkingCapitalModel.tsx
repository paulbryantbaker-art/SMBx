/**
 * Working Capital Model — 12-month trend, peg calculation, seasonal variance.
 */
import { useModelStore } from '../../lib/modelStore';
import { KPICard } from './Charts';
import { Line } from 'react-chartjs-2';
import { centsToDisplay } from '../../lib/calculations/core';

interface Props { tabId: string; }

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const CHART_PRIMARY = '#2E8C5A';
const CHART_PRIMARY_SOFT = 'rgba(46, 140, 90, 0.14)';
const CHART_TEXT = '#191813';
const CHART_MUTED = '#57534A';

export default function WorkingCapitalModel({ tabId }: Props) {
  const tab = useModelStore(s => s.tabs[tabId]);
  const update = useModelStore(s => s.updateAssumptions);
  if (!tab) return null;

  const a = tab.assumptions;
  const wc = tab.outputs.wc;
  const monthlyData = a.monthlyData || MONTHS.map(m => ({ month: m, currentAssets: 0, currentLiabilities: 0 }));

  const updateMonth = (idx: number, key: string, value: number) => {
    const next = [...monthlyData];
    next[idx] = { ...next[idx], [key]: value };
    update(tabId, { monthlyData: next });
  };

  return (
    <div className="p-5 space-y-6 max-w-3xl mx-auto">
      <h2 className="text-base font-bold m-0" style={{ fontFamily: 'var(--font-body)' }}>Working Capital Analysis</h2>

      {wc && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <KPICard label="Working Capital Peg" value={centsToDisplay(wc.peg)} color="#2E8C5A" sublabel="12-month average" />
            <KPICard label="Variance" value={centsToDisplay(wc.variance)} sublabel="Seasonal swing" />
            <KPICard label="Months Analyzed" value={String(wc.monthlyWC.filter((m: any) => m.wc !== 0).length)} />
          </div>

          {/* Trend chart */}
          {wc.monthlyWC.some((m: any) => m.wc !== 0) && (
            <div style={{ height: 240 }}>
              <Line
                data={{
                  labels: wc.monthlyWC.map((m: any) => m.month),
                  datasets: [
                    {
                      label: 'Working Capital',
                      data: wc.monthlyWC.map((m: any) => m.wc / 100),
                      borderColor: CHART_PRIMARY,
                      backgroundColor: CHART_PRIMARY_SOFT,
                      fill: true,
                      tension: 0.3,
                      pointRadius: 4,
                      pointBackgroundColor: CHART_PRIMARY,
                    },
                    {
                      label: 'Peg (Average)',
                      data: wc.monthlyWC.map(() => wc.peg / 100),
                      borderColor: CHART_MUTED,
                      borderDash: [6, 3],
                      borderWidth: 1,
                      pointRadius: 0,
                      fill: false,
                    },
                  ],
                }}
                options={{
                  responsive: true, maintainAspectRatio: false,
                  plugins: {
                    legend: { display: true, position: 'bottom', labels: { color: CHART_MUTED, font: { size: 10 }, boxWidth: 10 } },
                    tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${centsToDisplay(Number(ctx.raw) * 100)}` } },
                  },
                  scales: {
                    y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { callback: v => centsToDisplay(Number(v) * 100), color: CHART_MUTED, font: { size: 10 } } },
                    x: { grid: { display: false }, ticks: { color: CHART_TEXT, font: { size: 10 } } },
                  },
                }}
              />
            </div>
          )}
        </>
      )}

      {/* Monthly data input */}
      <div>
        <h3 className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--m-on-surface-var)' }}>Monthly Data</h3>
        {/* Four columns with live inputs — scroll sideways on phones rather
            than crushing the number fields. */}
        <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
          <table className="text-xs w-full" style={{ borderCollapse: 'collapse', minWidth: 440 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--m-primary)' }}>
                <th style={{ padding: '4px 6px', textAlign: 'left', fontSize: 10, color: 'var(--m-on-surface-var)' }}>Month</th>
                <th style={{ padding: '4px 6px', textAlign: 'right', fontSize: 10, color: 'var(--m-on-surface-var)' }}>Current Assets ($)</th>
                <th style={{ padding: '4px 6px', textAlign: 'right', fontSize: 10, color: 'var(--m-on-surface-var)' }}>Current Liabilities ($)</th>
                <th style={{ padding: '4px 6px', textAlign: 'right', fontSize: 10, color: 'var(--m-on-surface-var)' }}>Net WC</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((m: any, i: number) => (
                <tr key={i} style={{ borderBottom: '1px solid #e8e6dc' }}>
                  <td style={{ padding: '4px 6px', fontWeight: 600 }}>{m.month}</td>
                  <td style={{ padding: '4px 6px' }}>
                    <input type="number" value={m.currentAssets / 100} onChange={e => updateMonth(i, 'currentAssets', Number(e.target.value) * 100)}
                      className="w-full text-right text-xs border rounded px-2 py-0.5 outline-none" style={{ borderColor: 'var(--m-outline-var)' }} />
                  </td>
                  <td style={{ padding: '4px 6px' }}>
                    <input type="number" value={m.currentLiabilities / 100} onChange={e => updateMonth(i, 'currentLiabilities', Number(e.target.value) * 100)}
                      className="w-full text-right text-xs border rounded px-2 py-0.5 outline-none" style={{ borderColor: 'var(--m-outline-var)' }} />
                  </td>
                  <td style={{ padding: '4px 6px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>
                    {centsToDisplay(m.currentAssets - m.currentLiabilities)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
