/**
 * Deal Comparison Model — Side-by-side cards reading from multiple model tabs.
 */
import { useModelStore } from '../../lib/modelStore';
import { FactorRadar, KPICard } from './Charts';
import { centsToDisplay, pctDisplay, multDisplay } from '../../lib/calculations/core';

interface Props { tabId: string; }

export default function ComparisonModel({ tabId }: Props) {
  const tab = useModelStore(s => s.tabs[tabId]);
  const allTabs = useModelStore(s => s.tabs);
  if (!tab) return null;

  // Read from linked tabs
  const linkedIds = tab.linkedTabs || [];
  const linkedTabs = linkedIds.map(id => allTabs[id]).filter(Boolean);

  if (linkedTabs.length === 0) {
    return (
      <div className="p-5 text-center">
        <p className="text-sm" style={{ color: '#6E6A63' }}>
          No models linked for comparison. Open multiple deal models and Yulia will link them here.
        </p>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-6 max-w-4xl mx-auto">
      <h2 className="text-base font-bold m-0" style={{ fontFamily: 'Sora, sans-serif' }}>Deal Comparison</h2>

      {/* Side-by-side KPI cards */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #C25572' }}>
              <th style={{ padding: '6px 10px', textAlign: 'left', fontSize: 10, color: '#6E6A63' }}>Metric</th>
              {linkedTabs.map(t => (
                <th key={t.id} style={{ padding: '6px 10px', textAlign: 'right', fontSize: 10, color: '#1A1A18', fontWeight: 700 }}>
                  {t.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {getComparisonRows(linkedTabs).map((row, i) => (
              <tr key={row.label} style={{ borderBottom: '1px solid #EBEBEB', background: i % 2 ? '#FAFAF8' : 'transparent' }}>
                <td style={{ padding: '6px 10px', color: '#6E6A63', fontWeight: 500 }}>{row.label}</td>
                {row.values.map((val, j) => {
                  const best = row.bestIdx;
                  return (
                    <td key={j} style={{
                      padding: '6px 10px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 500,
                      color: best === j ? '#34A853' : '#1A1A18',
                      background: best === j ? 'rgba(52,168,83,0.05)' : undefined,
                    }}>
                      {val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Radar comparison if we have scores */}
      {linkedTabs.length >= 2 && linkedTabs.some(t => t.outputs.lbo) && (
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: '#6E6A63' }}>Risk-Return Profile</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {linkedTabs.map(t => {
              const lbo = t.outputs.lbo;
              if (!lbo) return null;
              const factors = [
                { name: 'Returns (IRR)', score: Math.min(100, Math.round(lbo.irr * 300)) },
                { name: 'Cash Multiple', score: Math.min(100, Math.round(lbo.moic * 30)) },
                { name: 'Debt Safety', score: Math.min(100, Math.round((lbo.dscrByYear[0] || 0) * 50)) },
                { name: 'Cash Flow', score: Math.min(100, Math.round(lbo.cashOnCash * 100)) },
                { name: 'Payback Speed', score: Math.max(0, 100 - lbo.paybackYears * 15) },
              ];
              return (
                <div key={t.id}>
                  <p className="text-xs font-bold mb-2">{t.title}</p>
                  <FactorRadar factors={factors} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function getComparisonRows(tabs: any[]): { label: string; values: string[]; bestIdx: number }[] {
  const rows: { label: string; values: string[]; bestIdx: number; rawValues: number[] }[] = [];

  const addRow = (label: string, getter: (t: any) => number | null, format: (v: number) => string, higherIsBetter = true) => {
    const rawValues = tabs.map(t => getter(t) ?? 0);
    const values = rawValues.map(v => v ? format(v) : '—');
    const nonZero = rawValues.filter(v => v !== 0);
    const bestVal = higherIsBetter ? Math.max(...nonZero) : Math.min(...nonZero);
    const bestIdx = nonZero.length > 0 ? rawValues.indexOf(bestVal) : -1;
    rows.push({ label, values, bestIdx, rawValues });
  };

  addRow('Purchase Price', t => t.assumptions.purchasePrice, centsToDisplay, false);
  addRow('EBITDA', t => t.assumptions.ebitda, centsToDisplay);
  addRow('Entry Multiple', t => t.outputs.lbo?.entryMultiple, v => multDisplay(v), false);
  addRow('IRR', t => t.outputs.lbo?.irr, v => pctDisplay(v));
  addRow('MOIC', t => t.outputs.lbo?.moic, v => multDisplay(v));
  addRow('Year 1 DSCR', t => t.outputs.lbo?.dscrByYear?.[0], v => `${v.toFixed(2)}x`);
  addRow('Equity Required', t => t.outputs.lbo?.equityInvested, centsToDisplay, false);
  addRow('Exit Value', t => t.outputs.lbo?.exitValue, centsToDisplay);
  addRow('Payback', t => t.outputs.lbo?.paybackYears, v => `${v} yrs`, false);

  return rows;
}
