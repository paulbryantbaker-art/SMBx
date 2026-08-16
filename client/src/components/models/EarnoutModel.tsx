/**
 * Earnout Scenario Model — Probability-weighted payouts, expected value.
 */
import { useModelStore } from '../../lib/modelStore';
import { KPICard, ModelSlider, ModelInput } from './Charts';
import { Bar } from 'react-chartjs-2';
import { centsToDisplay, pctDisplay } from '../../lib/calculations/core';
import { MC } from './theme';

interface Props { tabId: string; }

const CHART_PRIMARY = MC.ok;
const CHART_PRIMARY_SOFT = 'rgba(46, 140, 90, 0.14)';
const CHART_TEXT = MC.ink;
const CHART_MUTED = MC.muted;

export default function EarnoutModel({ tabId }: Props) {
  const tab = useModelStore(s => s.tabs[tabId]);
  const update = useModelStore(s => s.updateAssumptions);
  const updateOne = useModelStore(s => s.updateAssumption);
  if (!tab) return null;

  const a = tab.assumptions;
  const earnout = tab.outputs.earnout;
  const milestones = a.milestones || [];

  const addMilestone = () => {
    const next = [...milestones, { year: milestones.length + 1, target: 0, payout: 0, probability: 0.5 }];
    update(tabId, { milestones: next });
  };

  const updateMilestone = (idx: number, key: string, value: number) => {
    const next = [...milestones];
    next[idx] = { ...next[idx], [key]: value };
    update(tabId, { milestones: next });
  };

  return (
    <div className="p-5 space-y-6 max-w-3xl mx-auto">
      <h2 className="text-base font-bold m-0" style={{ fontFamily: 'var(--font-body)' }}>Earnout Scenario Analysis</h2>

      {/* KPIs */}
      {earnout && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <KPICard label="Expected Value" value={centsToDisplay(earnout.expectedValue)} color={MC.ok} sublabel="Probability-weighted" />
          <KPICard label="Max Payout" value={centsToDisplay(earnout.maxPayout)} sublabel="If all milestones hit" />
          <KPICard label="PV of Expected" value={centsToDisplay(earnout.pvExpected)} sublabel={`At ${pctDisplay(a.discountRate ?? 0.10)} discount`} />
        </div>
      )}

      {/* Milestone chart */}
      {earnout && earnout.byMilestone.length > 0 && (
        <div style={{ height: 200 }}>
          <Bar
            data={{
              labels: earnout.byMilestone.map((m: any) => `Year ${m.year}`),
              datasets: [
                {
                  label: 'Max Payout',
                  data: earnout.byMilestone.map((m: any) => m.payout / 100),
                  backgroundColor: CHART_PRIMARY_SOFT,
                  borderColor: CHART_PRIMARY,
                  borderWidth: 1,
                  borderRadius: 4,
                },
                {
                  label: 'Expected Value',
                  data: earnout.byMilestone.map((m: any) => m.ev / 100),
                  backgroundColor: CHART_PRIMARY,
                  borderRadius: 4,
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
                x: { grid: { display: false }, ticks: { color: CHART_TEXT, font: { size: 10 } } },
                y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { callback: v => centsToDisplay(Number(v) * 100), color: CHART_MUTED, font: { size: 10 } } },
              },
            }}
          />
        </div>
      )}

      {/* Discount rate */}
      <ModelSlider label="Discount Rate" value={a.discountRate ?? 0.10} onChange={v => updateOne(tabId, 'discountRate', v)} min={0.05} max={0.25} step={0.01} format="percent" />

      {/* Milestone inputs */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[11px] font-bold uppercase tracking-wider m-0" style={{ color: MC.muted }}>Milestones</h3>
          <button onClick={addMilestone} className="text-xs font-semibold px-3 py-1 rounded-lg border-0 cursor-pointer" style={{ background: MC.green, color: '#fff' }}>+ Add</button>
        </div>

        {milestones.map((m: any, i: number) => (
          <div key={i} className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2 rounded-lg p-2" style={{ border: `1px solid ${MC.border}` }}>
            <div>
              <label className="block text-[11px] font-medium mb-0.5" style={{ color: MC.muted }}>Year</label>
              <input type="number" value={m.year} onChange={e => updateMilestone(i, 'year', Number(e.target.value))}
                className="w-full px-2 py-1 text-xs rounded-lg outline-none" style={{ background: MC.track, border: 'none' }} />
            </div>
            <div>
              <label className="block text-[11px] font-medium mb-0.5" style={{ color: MC.muted }}>Target ($)</label>
              <input type="number" value={m.target / 100} onChange={e => updateMilestone(i, 'target', Number(e.target.value) * 100)}
                className="w-full px-2 py-1 text-xs rounded-lg outline-none" style={{ background: MC.track, border: 'none' }} />
            </div>
            <div>
              <label className="block text-[11px] font-medium mb-0.5" style={{ color: MC.muted }}>Payout ($)</label>
              <input type="number" value={m.payout / 100} onChange={e => updateMilestone(i, 'payout', Number(e.target.value) * 100)}
                className="w-full px-2 py-1 text-xs rounded-lg outline-none" style={{ background: MC.track, border: 'none' }} />
            </div>
            <div>
              <label className="block text-[11px] font-medium mb-0.5" style={{ color: MC.muted }}>Probability</label>
              <input type="range" min={0} max={1} step={0.05} value={m.probability} onChange={e => updateMilestone(i, 'probability', Number(e.target.value))}
                className="model-range w-full" />
              <span className="text-[11px] font-medium" style={{ color: MC.muted }}>{pctDisplay(m.probability)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
