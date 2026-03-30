/**
 * Working Capital Model — 12-month trend, peg calculation, seasonal variance.
 */
import { useModelStore } from '../../lib/modelStore';
import { KPICard } from './Charts';
import { Line } from 'react-chartjs-2';
import { centsToDisplay } from '../../lib/calculations/core';

interface Props { tabId: string; }

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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
      <h2 className="text-base font-bold m-0" style={{ fontFamily: 'Sora, sans-serif' }}>Working Capital Analysis</h2>

      {wc && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <KPICard label="Working Capital Peg" value={centsToDisplay(wc.peg)} color="#C25572" sublabel="12-month average" />
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
                      borderColor: '#C25572',
                      backgroundColor: 'rgba(186,60,96,0.1)',
                      fill: true,
                      tension: 0.3,
                      pointRadius: 4,
                      pointBackgroundColor: '#C25572',
                    },
                    {
                      label: 'Peg (Average)',
                      data: wc.monthlyWC.map(() => wc.peg / 100),
                      borderColor: '#6E6A63',
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
                    legend: { display: true, position: 'bottom', labels: { color: '#6E6A63', font: { size: 10 }, boxWidth: 10 } },
                    tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${centsToDisplay(Number(ctx.raw) * 100)}` } },
                  },
                  scales: {
                    y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { callback: v => centsToDisplay(Number(v) * 100), color: '#6E6A63', font: { size: 10 } } },
                    x: { grid: { display: false }, ticks: { color: '#1A1A18', font: { size: 10 } } },
                  },
                }}
              />
            </div>
          )}
        </>
      )}

      {/* Monthly data input */}
      <div>
        <h3 className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: '#6E6A63' }}>Monthly Data</h3>
        <div className="overflow-x-auto">
          <table className="text-xs w-full" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #C25572' }}>
                <th style={{ padding: '4px 6px', textAlign: 'left', fontSize: 10, color: '#6E6A63' }}>Month</th>
                <th style={{ padding: '4px 6px', textAlign: 'right', fontSize: 10, color: '#6E6A63' }}>Current Assets ($)</th>
                <th style={{ padding: '4px 6px', textAlign: 'right', fontSize: 10, color: '#6E6A63' }}>Current Liabilities ($)</th>
                <th style={{ padding: '4px 6px', textAlign: 'right', fontSize: 10, color: '#6E6A63' }}>Net WC</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((m: any, i: number) => (
                <tr key={i} style={{ borderBottom: '1px solid #EBEBEB' }}>
                  <td style={{ padding: '4px 6px', fontWeight: 600 }}>{m.month}</td>
                  <td style={{ padding: '4px 6px' }}>
                    <input type="number" value={m.currentAssets / 100} onChange={e => updateMonth(i, 'currentAssets', Number(e.target.value) * 100)}
                      className="w-full text-right text-xs border rounded px-2 py-0.5 outline-none" style={{ borderColor: '#DDD9D1' }} />
                  </td>
                  <td style={{ padding: '4px 6px' }}>
                    <input type="number" value={m.currentLiabilities / 100} onChange={e => updateMonth(i, 'currentLiabilities', Number(e.target.value) * 100)}
                      className="w-full text-right text-xs border rounded px-2 py-0.5 outline-none" style={{ borderColor: '#DDD9D1' }} />
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
