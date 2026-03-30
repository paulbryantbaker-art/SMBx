/**
 * Valuation Explorer — Interactive valuation model.
 * Sliders for add-backs, multiples, methodology weights.
 * Live valuation range chart, SDE waterfall, multiple context.
 * The seller hook.
 */
import { useModelStore } from '../../lib/modelStore';
import {
  ValuationRangeChart, WaterfallChart, KPICard, ModelSlider, ModelInput,
} from './Charts';
import { centsToDisplay, multDisplay, LEAGUE_MULTIPLES } from '../../lib/calculations/core';

interface Props {
  tabId: string;
}

export default function ValuationExplorer({ tabId }: Props) {
  const tab = useModelStore(s => s.tabs[tabId]);
  const update = useModelStore(s => s.updateAssumption);

  if (!tab) return null;

  const a = tab.assumptions;
  const o = tab.outputs;
  const val = o.valuation;
  const league = a.league || 'L1';
  const leagueData = LEAGUE_MULTIPLES[league] || LEAGUE_MULTIPLES.L1;

  return (
    <div className="p-5 space-y-6 max-w-3xl mx-auto">
      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard
          label={leagueData.metric}
          value={centsToDisplay(a.sde || a.ebitda || 0)}
          sublabel={`${league} league`}
        />
        <KPICard
          label="Multiple"
          value={`${multDisplay(val?.multipleMin || 0)}–${multDisplay(val?.multipleMax || 0)}`}
          sublabel="Range"
        />
        <KPICard
          label="Valuation (Mid)"
          value={centsToDisplay(val?.mid || 0)}
          color="#D44A78"
        />
        <KPICard
          label="SBA Eligible"
          value={(val?.mid || 0) <= 500000000 ? 'Yes' : 'No'}
          sublabel={val?.mid <= 500000000 ? '≤$5M threshold' : '>$5M'}
          color={(val?.mid || 0) <= 500000000 ? '#34A853' : '#EA4335'}
        />
      </div>

      {/* Valuation Range Chart */}
      {val && (
        <div className="rounded-xl p-4" style={{ background: '#FAF8F4', border: '1px solid #DDD9D1' }}>
          <h3 className="text-sm font-bold m-0 mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Estimated Value Range</h3>

          <div className="flex justify-between items-end mb-4 px-8">
            <div className="text-center">
              <p className="text-[9px] font-bold uppercase tracking-wider m-0 mb-1" style={{ color: '#6E6A63' }}>Low</p>
              <p className="text-lg font-bold m-0" style={{ color: '#6E6A63' }}>{centsToDisplay(val.low)}</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] font-bold uppercase tracking-wider m-0 mb-1" style={{ color: '#D44A78' }}>Most Likely</p>
              <p className="text-2xl font-bold m-0" style={{ color: '#D44A78', fontFamily: 'Sora, sans-serif' }}>{centsToDisplay(val.mid)}</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] font-bold uppercase tracking-wider m-0 mb-1" style={{ color: '#6E6A63' }}>High</p>
              <p className="text-lg font-bold m-0" style={{ color: '#6E6A63' }}>{centsToDisplay(val.high)}</p>
            </div>
          </div>

          <ValuationRangeChart low={val.low} mid={val.mid} high={val.high} />

          <p className="text-[10px] m-0 mt-2 text-center" style={{ color: '#A9A49C' }}>
            Based on {leagueData.metric} of {centsToDisplay(val.earnings)} at {multDisplay(val.multipleMin)}–{multDisplay(val.multipleMax)} ({league} range)
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Left: Financial Inputs */}
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: '#6E6A63' }}>Financial Inputs</h3>

          <ModelInput
            label="Revenue"
            value={a.revenue || 0}
            onChange={v => update(tabId, 'revenue', v)}
            prefix="$"
          />

          <ModelInput
            label={leagueData.metric === 'SDE' ? 'SDE' : 'EBITDA'}
            value={a.sde || a.ebitda || 0}
            onChange={v => update(tabId, leagueData.metric === 'SDE' ? 'sde' : 'ebitda', v)}
            prefix="$"
          />

          <ModelInput
            label="Owner's Compensation"
            value={a.ownerComp || 0}
            onChange={v => update(tabId, 'ownerComp', v)}
            prefix="$"
          />

          <div className="mt-2">
            <label className="block text-[10px] font-medium mb-1" style={{ color: '#6E6A63' }}>League</label>
            <select
              value={league}
              onChange={e => update(tabId, 'league', e.target.value)}
              className="w-full rounded-lg border px-3 py-1.5 text-sm outline-none"
              style={{ borderColor: '#DDD9D1', color: '#1A1A18' }}
            >
              <option value="L1">L1 — Main Street (&lt;$500K SDE)</option>
              <option value="L2">L2 — Lower Middle ($500K–$2M SDE)</option>
              <option value="L3">L3 — Middle Market ($2M–$5M EBITDA)</option>
              <option value="L4">L4 — Upper Middle ($5M–$10M EBITDA)</option>
              <option value="L5">L5 — Large Cap ($10M–$50M EBITDA)</option>
              <option value="L6">L6 — Mega Cap ($50M+ EBITDA)</option>
            </select>
          </div>
        </div>

        {/* Right: Multiple Adjustments */}
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: '#6E6A63' }}>Multiple Adjustments</h3>

          <ModelSlider
            label="Low Multiple"
            value={a.multipleOverride?.min ?? leagueData.min}
            onChange={v => update(tabId, 'multipleOverride', { ...(a.multipleOverride || {}), min: v })}
            min={1.0} max={15.0} step={0.1}
            format="multiple"
          />

          <ModelSlider
            label="High Multiple"
            value={a.multipleOverride?.max ?? leagueData.max}
            onChange={v => update(tabId, 'multipleOverride', { ...(a.multipleOverride || {}), max: v })}
            min={1.0} max={20.0} step={0.1}
            format="multiple"
          />

          {/* Blended methodology weights */}
          <div className="mt-4">
            <h4 className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#6E6A63' }}>Methodology Weights</h4>

            <ModelSlider
              label="Multiple-Based"
              value={a.multipleWeight ?? 60}
              onChange={v => update(tabId, 'multipleWeight', v)}
              min={0} max={100} step={5}
              suffix="%"
            />
            <ModelSlider
              label="DCF"
              value={a.dcfWeight ?? 20}
              onChange={v => update(tabId, 'dcfWeight', v)}
              min={0} max={100} step={5}
              suffix="%"
            />
            <ModelSlider
              label="Asset-Based"
              value={a.assetWeight ?? 20}
              onChange={v => update(tabId, 'assetWeight', v)}
              min={0} max={100} step={5}
              suffix="%"
            />
          </div>
        </div>
      </div>

      {/* SDE/EBITDA Breakdown Waterfall */}
      {o.sde_breakdown || o.valuation ? (
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: '#6E6A63' }}>Earnings Composition</h3>
          <WaterfallChart items={[
            { label: 'Revenue', amount: a.revenue || 0 },
            { label: 'Less: Expenses', amount: -(a.revenue || 0) + (a.sde || a.ebitda || 0) - (a.ownerComp || 0) },
            { label: "Owner's Comp", amount: a.ownerComp || 0 },
            { label: leagueData.metric, amount: a.sde || a.ebitda || 0 },
          ].filter(i => i.amount !== 0)} />
        </div>
      ) : null}

      {/* Blended valuation result */}
      {o.blended && (
        <div className="rounded-lg p-4" style={{ border: '1px solid #DDD9D1' }}>
          <h3 className="text-sm font-bold m-0 mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>Blended Valuation</h3>
          <p className="text-xl font-bold m-0" style={{ color: '#D44A78' }}>{centsToDisplay(o.blended.blended)}</p>
          <div className="mt-2 space-y-1">
            {o.blended.methods.map((m: any) => (
              <div key={m.label} className="flex justify-between text-xs">
                <span style={{ color: '#6E6A63' }}>{m.label} ({m.weight}%)</span>
                <span className="font-medium tabular-nums">{centsToDisplay(m.value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
