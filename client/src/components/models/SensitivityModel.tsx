/**
 * Sensitivity Matrix Model — 2-variable heatmap derived from a parent model.
 */
import { useModelStore } from '../../lib/modelStore';
import { SensitivityHeatmap, ModelSlider } from './Charts';
import { centsToDisplay } from '../../lib/calculations/core';

interface Props { tabId: string; }

export default function SensitivityModel({ tabId }: Props) {
  const tab = useModelStore(s => s.tabs[tabId]);
  const update = useModelStore(s => s.updateAssumption);
  if (!tab) return null;

  const { matrix } = tab.outputs;

  if (!matrix || !matrix.var1Values?.length) {
    return (
      <div className="p-5 text-center">
        <p className="text-sm" style={{ color: '#6E6A63' }}>
          Link this sensitivity tab to a parent model to generate the matrix.
        </p>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-6 max-w-3xl mx-auto">
      <h2 className="text-base font-bold m-0" style={{ fontFamily: 'Sora, sans-serif' }}>
        Sensitivity Analysis
      </h2>

      <div className="mb-2">
        <label className="block text-[10px] font-medium mb-1" style={{ color: '#6E6A63' }}>Output Metric</label>
        <select
          value={tab.assumptions.outputMetric || 'irr'}
          onChange={e => update(tabId, 'outputMetric', e.target.value)}
          className="px-3 py-1.5 text-xs rounded-lg border outline-none"
          style={{ borderColor: '#DDD9D1' }}
        >
          <option value="irr">IRR</option>
          <option value="moic">MOIC</option>
          <option value="dscr">DSCR</option>
        </select>
      </div>

      <SensitivityHeatmap
        matrix={matrix.matrix}
        var1Values={matrix.var1Values}
        var2Values={matrix.var2Values}
        var1Key={matrix.var1Key}
        var2Key={matrix.var2Key}
        metric={tab.assumptions.outputMetric || 'irr'}
      />

      <p className="text-[10px]" style={{ color: '#A9A49C' }}>
        Green = exceeds target. Yellow = acceptable. Red = below threshold.
        All calculations are deterministic — same inputs always produce same outputs.
      </p>
    </div>
  );
}
