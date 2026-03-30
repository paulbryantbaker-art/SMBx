/**
 * Cap Table / Dilution Model — Ownership, dilution waterfall, exit payout scenarios.
 */
import { useState } from 'react';
import { useModelStore } from '../../lib/modelStore';
import { KPICard, ModelInput, ModelSlider } from './Charts';
import { Doughnut } from 'react-chartjs-2';
import { centsToDisplay, pctDisplay, multDisplay } from '../../lib/calculations/core';

interface Props { tabId: string; }

const COLORS = ['#D44A78', '#4E8FD4', '#6B8F4E', '#8F6BD4', '#D4714E', '#4ECDC4', '#FF6B6B', '#6E6A63'];

export default function CapTableModel({ tabId }: Props) {
  const tab = useModelStore(s => s.tabs[tabId]);
  const update = useModelStore(s => s.updateAssumptions);
  const updateOne = useModelStore(s => s.updateAssumption);
  if (!tab) return null;

  const a = tab.assumptions;
  const { dilution, waterfalls } = tab.outputs;
  const rounds = a.rounds || [];

  const addRound = () => {
    const newRounds = [...rounds, {
      label: `Series ${String.fromCharCode(65 + rounds.length)}`,
      investment: 0,
      preMoneyVal: 0,
      optionPoolPct: 0.10,
      liquidationPref: 1.0,
      participating: false,
    }];
    update(tabId, { rounds: newRounds });
  };

  const updateRound = (idx: number, key: string, value: any) => {
    const newRounds = [...rounds];
    newRounds[idx] = { ...newRounds[idx], [key]: value };
    update(tabId, { rounds: newRounds });
  };

  const removeRound = (idx: number) => {
    update(tabId, { rounds: rounds.filter((_: any, i: number) => i !== idx) });
  };

  return (
    <div className="p-5 space-y-6 max-w-3xl mx-auto">
      <h2 className="text-base font-bold m-0" style={{ fontFamily: 'Sora, sans-serif' }}>Cap Table & Dilution</h2>

      {/* Founders shares */}
      <ModelInput
        label="Founder Shares (authorized)"
        value={a.foundersShares || 10000000}
        onChange={v => updateOne(tabId, 'foundersShares', v)}
      />

      {/* Rounds */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[11px] font-bold uppercase tracking-wider m-0" style={{ color: '#6E6A63' }}>Investment Rounds</h3>
          <button onClick={addRound} className="text-xs font-semibold px-3 py-1 rounded-full border-0 cursor-pointer" style={{ background: '#D44A78', color: 'white' }}>
            + Add Round
          </button>
        </div>

        {rounds.map((round: any, i: number) => (
          <div key={i} className="rounded-lg p-3 mb-2" style={{ border: '1px solid #DDD9D1' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold" style={{ color: COLORS[i % COLORS.length] }}>{round.label}</span>
              <button onClick={() => removeRound(i)} className="text-[10px] px-2 py-0.5 rounded bg-transparent border border-[#DDD9D1] cursor-pointer" style={{ color: '#6E6A63' }}>Remove</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="block text-[9px] font-medium mb-0.5" style={{ color: '#6E6A63' }}>Investment</label>
                <input type="number" value={(round.investment || 0) / 100} onChange={e => updateRound(i, 'investment', Number(e.target.value) * 100)}
                  className="w-full px-2 py-1 text-xs rounded border outline-none" style={{ borderColor: '#DDD9D1' }} />
              </div>
              <div>
                <label className="block text-[9px] font-medium mb-0.5" style={{ color: '#6E6A63' }}>Pre-Money Val</label>
                <input type="number" value={(round.preMoneyVal || 0) / 100} onChange={e => updateRound(i, 'preMoneyVal', Number(e.target.value) * 100)}
                  className="w-full px-2 py-1 text-xs rounded border outline-none" style={{ borderColor: '#DDD9D1' }} />
              </div>
              <div>
                <label className="block text-[9px] font-medium mb-0.5" style={{ color: '#6E6A63' }}>Option Pool</label>
                <input type="number" value={(round.optionPoolPct || 0) * 100} onChange={e => updateRound(i, 'optionPoolPct', Number(e.target.value) / 100)}
                  className="w-full px-2 py-1 text-xs rounded border outline-none" style={{ borderColor: '#DDD9D1' }} />
              </div>
              <div>
                <label className="block text-[9px] font-medium mb-0.5" style={{ color: '#6E6A63' }}>Liq Pref</label>
                <select value={round.liquidationPref || 1.0} onChange={e => updateRound(i, 'liquidationPref', Number(e.target.value))}
                  className="w-full px-2 py-1 text-xs rounded border outline-none" style={{ borderColor: '#DDD9D1' }}>
                  <option value={1.0}>1.0x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2.0}>2.0x</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Ownership Chart + Table */}
      {dilution && dilution.rows.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Pie chart */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: '#6E6A63' }}>Ownership</h3>
            <div style={{ height: 220 }}>
              <Doughnut
                data={{
                  labels: dilution.rows.filter((r: any) => r.ownership > 0.001).map((r: any) => r.stakeholder),
                  datasets: [{
                    data: dilution.rows.filter((r: any) => r.ownership > 0.001).map((r: any) => r.ownership * 100),
                    backgroundColor: COLORS,
                    borderWidth: 1,
                    borderColor: '#FFFFFF',
                  }],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  cutout: '55%',
                  plugins: {
                    legend: { display: true, position: 'bottom', labels: { color: '#6E6A63', font: { size: 10 }, boxWidth: 10, padding: 8 } },
                    tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${(ctx.raw as number).toFixed(1)}%` } },
                  },
                }}
              />
            </div>
          </div>

          {/* Table */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: '#6E6A63' }}>Cap Table</h3>
            <div className="space-y-1">
              {dilution.rows.map((r: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-xs py-1" style={{ borderBottom: '1px solid #EBEBEB' }}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span>{r.stakeholder}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="tabular-nums" style={{ color: '#6E6A63' }}>{r.shares.toLocaleString()} shares</span>
                    <span className="font-bold tabular-nums" style={{ width: 50, textAlign: 'right' }}>{pctDisplay(r.ownership)}</span>
                  </div>
                </div>
              ))}
            </div>
            {dilution.postMoneyVal > 0 && (
              <p className="text-[10px] mt-2" style={{ color: '#6E6A63' }}>Post-money: {centsToDisplay(dilution.postMoneyVal)}</p>
            )}
          </div>
        </div>
      )}

      {/* Exit Waterfall Scenarios */}
      {waterfalls && waterfalls.length > 0 && (
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: '#6E6A63' }}>Exit Payout Scenarios</h3>
          <div className="overflow-x-auto">
            <table className="text-xs w-full" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #D44A78' }}>
                  <th style={{ padding: '4px 8px', textAlign: 'left', fontSize: 10, color: '#6E6A63' }}>Stakeholder</th>
                  {waterfalls.map((w: any) => (
                    <th key={w.exitValue} style={{ padding: '4px 8px', textAlign: 'right', fontSize: 10, color: '#6E6A63' }}>
                      {centsToDisplay(w.exitValue)} Exit
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {waterfalls[0]?.distributions.map((d: any, i: number) => (
                  <tr key={i} style={{ borderBottom: '1px solid #EBEBEB' }}>
                    <td style={{ padding: '4px 8px' }}>{d.stakeholder}</td>
                    {waterfalls.map((w: any) => (
                      <td key={w.exitValue} style={{ padding: '4px 8px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                        {centsToDisplay(w.distributions[i]?.amount || 0)}
                        {w.distributions[i]?.moic > 0 && (
                          <span style={{ color: '#6E6A63', marginLeft: 4 }}>({multDisplay(w.distributions[i].moic)})</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Exit value inputs */}
      <div>
        <label className="block text-[10px] font-medium mb-1" style={{ color: '#6E6A63' }}>Exit Scenarios (comma-separated, in dollars)</label>
        <input
          type="text"
          defaultValue={(a.exitValues || [50000000, 100000000, 250000000, 500000000]).map((v: number) => v / 100).join(', ')}
          onBlur={e => {
            const vals = e.target.value.split(',').map(s => Math.round(Number(s.trim()) * 100)).filter(v => v > 0);
            if (vals.length > 0) updateOne(tabId, 'exitValues', vals);
          }}
          className="w-full px-3 py-1.5 text-xs rounded-lg border outline-none"
          style={{ borderColor: '#DDD9D1' }}
          placeholder="500000, 1000000, 2500000, 5000000"
        />
      </div>
    </div>
  );
}
