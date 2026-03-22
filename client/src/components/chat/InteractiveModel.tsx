/**
 * Interactive Financial Model — Adjustable assumptions with live recalculation.
 *
 * Renders financial model deliverable content with:
 * - Slider controls for revenue growth, gross margin, opex growth, capex, tax rate
 * - 3-scenario toggle (base / optimistic / conservative)
 * - 5-year projection table with live updates
 * - Sensitivity matrix for key variables
 */
import { useState, useMemo, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────

interface Assumptions {
  revenue_growth_rate: number;
  gross_margin: number;
  opex_growth_rate: number;
  capex_pct_revenue: number;
  tax_rate: number;
}

interface ProjectionYear {
  year: number;
  revenue: number;
  cogs: number;
  gross_profit: number;
  gross_margin_pct: number;
  operating_expenses: number;
  ebitda: number;
  ebitda_margin_pct: number;
  capex: number;
  free_cash_flow: number;
  debt_service: number;
  net_cash_flow: number;
  cumulative_cash_flow: number;
}

interface FinancialModelContent {
  type: string;
  business_name: string;
  base_case: ProjectionYear[];
  optimistic_case: ProjectionYear[];
  conservative_case: ProjectionYear[];
  assumptions: {
    base: Assumptions;
    optimistic: Assumptions;
    conservative: Assumptions;
  };
  breakeven_analysis: {
    monthly_breakeven_revenue: number;
    current_above_breakeven_pct: number;
  };
  key_metrics: {
    irr_estimate: number;
    payback_period_years: number;
    total_5yr_cash_flow: number;
    avg_annual_cash_flow: number;
    revenue_cagr: number;
  };
}

interface InteractiveModelProps {
  content: FinancialModelContent;
}

type ScenarioKey = 'base' | 'optimistic' | 'conservative' | 'custom';
type ViewMode = 'projections' | 'sensitivity';

// ─── Helpers ─────────────────────────────────────────────────

const fmtCents = (cents: number): string => {
  const abs = Math.abs(cents);
  if (abs >= 100_000_00) return `$${(cents / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const fmtPct = (pct: number): string => `${pct.toFixed(1)}%`;

function buildProjection(
  baseRevenue: number,
  baseCogs: number,
  baseOpex: number,
  debtService: number,
  assumptions: Assumptions,
): ProjectionYear[] {
  const years: ProjectionYear[] = [];
  let cumCashFlow = 0;

  for (let i = 1; i <= 5; i++) {
    const revGrowth = Math.pow(1 + assumptions.revenue_growth_rate / 100, i);
    const opexGrowth = Math.pow(1 + assumptions.opex_growth_rate / 100, i);
    const rev = Math.round(baseRevenue * revGrowth);
    const cogs = Math.round(rev * (1 - assumptions.gross_margin / 100));
    const grossProfit = rev - cogs;
    const opex = Math.round(baseOpex * opexGrowth);
    const ebitda = grossProfit - opex;
    const capex = Math.round(rev * assumptions.capex_pct_revenue / 100);
    const fcf = ebitda - capex;
    const netCF = fcf - debtService;
    cumCashFlow += netCF;

    years.push({
      year: i,
      revenue: rev,
      cogs,
      gross_profit: grossProfit,
      gross_margin_pct: rev > 0 ? Math.round((grossProfit / rev) * 10000) / 100 : 0,
      operating_expenses: opex,
      ebitda,
      ebitda_margin_pct: rev > 0 ? Math.round((ebitda / rev) * 10000) / 100 : 0,
      capex,
      free_cash_flow: fcf,
      debt_service: debtService,
      net_cash_flow: netCF,
      cumulative_cash_flow: cumCashFlow,
    });
  }

  return years;
}

// ─── Slider Component ─────────────────────────────────────────

function AssumptionSlider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-medium text-[#6E6A63] w-28 shrink-0">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #BA3C60 0%, #BA3C60 ${((value - min) / (max - min)) * 100}%, rgba(0,0,0,0.08) ${((value - min) / (max - min)) * 100}%, rgba(0,0,0,0.08) 100%)`,
        }}
      />
      <span className="text-xs font-semibold text-[#0D0D0D] w-14 text-right tabular-nums">
        {value.toFixed(step < 1 ? 1 : 0)}{unit}
      </span>
    </div>
  );
}

// ─── Sensitivity Matrix ───────────────────────────────────────

function SensitivityMatrix({
  baseRevenue,
  baseCogs,
  baseOpex,
  debtService,
  baseAssumptions,
}: {
  baseRevenue: number;
  baseCogs: number;
  baseOpex: number;
  debtService: number;
  baseAssumptions: Assumptions;
}) {
  // Growth rate vs gross margin → Year 5 EBITDA
  const growthRates = [-2, 0, 3, 5, 8, 12];
  const margins = [35, 40, 45, 50, 55, 60, 65];

  const matrix = useMemo(() => {
    return growthRates.map(gr =>
      margins.map(gm => {
        const assumptions = { ...baseAssumptions, revenue_growth_rate: gr, gross_margin: gm };
        const proj = buildProjection(baseRevenue, baseCogs, baseOpex, debtService, assumptions);
        return proj[4].ebitda; // Year 5 EBITDA
      })
    );
  }, [baseRevenue, baseCogs, baseOpex, debtService, baseAssumptions]);

  // Find min/max for color scaling
  const allValues = matrix.flat();
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const range = maxVal - minVal || 1;

  const getCellColor = (val: number) => {
    if (val < 0) return 'rgba(220, 38, 38, 0.12)';
    const intensity = (val - Math.max(minVal, 0)) / (maxVal - Math.max(minVal, 0) || 1);
    const g = Math.round(80 + intensity * 100);
    return `rgba(34, ${g}, 34, 0.08)`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-[#0D0D0D] m-0">Sensitivity Analysis</h3>
        <span className="text-[10px] text-[#A9A49C]">Year 5 EBITDA by Growth Rate x Gross Margin</span>
      </div>
      <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
        <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr className="bg-[#F5F5F5]">
              <th className="px-2 py-1.5 text-[10px] font-semibold text-[#6E6A63] text-left" style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', borderRight: '1px solid rgba(0,0,0,0.08)' }}>
                Growth \ Margin
              </th>
              {margins.map(m => (
                <th key={m} className="px-2 py-1.5 text-[10px] font-semibold text-[#3D3B37] text-right" style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                  {m}%
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {growthRates.map((gr, ri) => (
              <tr key={gr}>
                <td className="px-2 py-1.5 text-[10px] font-semibold text-[#6E6A63]" style={{ borderRight: '1px solid rgba(0,0,0,0.08)', borderBottom: '1px solid #EBE7DF' }}>
                  {gr > 0 ? `+${gr}` : gr}%
                </td>
                {matrix[ri].map((val, ci) => (
                  <td
                    key={ci}
                    className="px-2 py-1.5 text-right tabular-nums"
                    style={{
                      borderBottom: '1px solid #EBE7DF',
                      backgroundColor: getCellColor(val),
                      color: val < 0 ? '#dc2626' : '#0D0D0D',
                      fontWeight: val < 0 ? 600 : 400,
                    }}
                  >
                    {fmtCents(val)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────

interface SavedScenario {
  name: string;
  assumptions: Assumptions;
  savedAt: string;
}

const STORAGE_KEY = 'smbx_scenarios_';

export default function InteractiveModel({ content }: InteractiveModelProps) {
  const [scenario, setScenario] = useState<ScenarioKey>('base');
  const [viewMode, setViewMode] = useState<ViewMode>('projections');
  const [customAssumptions, setCustomAssumptions] = useState<Assumptions>(
    () => ({ ...content.assumptions.base })
  );
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY + content.business_name);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [saveName, setSaveName] = useState('');

  const persistScenarios = (scenarios: SavedScenario[]) => {
    setSavedScenarios(scenarios);
    try { localStorage.setItem(STORAGE_KEY + content.business_name, JSON.stringify(scenarios)); } catch {}
  };

  const saveCurrentScenario = () => {
    if (!saveName.trim()) return;
    const newScenario: SavedScenario = {
      name: saveName.trim(),
      assumptions: { ...customAssumptions },
      savedAt: new Date().toISOString(),
    };
    persistScenarios([...savedScenarios, newScenario]);
    setSaveName('');
    setShowSaveInput(false);
  };

  const loadSavedScenario = (s: SavedScenario) => {
    setCustomAssumptions({ ...s.assumptions });
    setScenario('custom');
  };

  const deleteSavedScenario = (index: number) => {
    persistScenarios(savedScenarios.filter((_, i) => i !== index));
  };

  // Derive base inputs from the original Year 1 data
  const baseRevenue = content.base_case[0]?.revenue
    ? Math.round(content.base_case[0].revenue / (1 + content.assumptions.base.revenue_growth_rate / 100))
    : 0;
  const baseCogs = baseRevenue > 0
    ? Math.round(baseRevenue * (1 - content.assumptions.base.gross_margin / 100))
    : 0;
  const baseOpex = content.base_case[0]?.operating_expenses
    ? Math.round(content.base_case[0].operating_expenses / (1 + content.assumptions.base.opex_growth_rate / 100))
    : 0;
  const debtService = content.base_case[0]?.debt_service || 0;

  // Compute active projection
  const activeProjection = useMemo(() => {
    if (scenario === 'custom') {
      return buildProjection(baseRevenue, baseCogs, baseOpex, debtService, customAssumptions);
    }
    if (scenario === 'optimistic') return content.optimistic_case;
    if (scenario === 'conservative') return content.conservative_case;
    return content.base_case;
  }, [scenario, customAssumptions, content, baseRevenue, baseCogs, baseOpex, debtService]);

  const activeAssumptions = useMemo(() => {
    if (scenario === 'custom') return customAssumptions;
    return content.assumptions[scenario as 'base' | 'optimistic' | 'conservative'];
  }, [scenario, customAssumptions, content]);

  // Key metrics for active scenario
  const metrics = useMemo(() => {
    const total5yr = activeProjection.reduce((s, y) => s + y.net_cash_flow, 0);
    const avg = Math.round(total5yr / 5);
    const y5rev = activeProjection[4]?.revenue || 0;
    const cagr = baseRevenue > 0 ? Math.round((Math.pow(y5rev / baseRevenue, 1 / 5) - 1) * 10000) / 100 : 0;
    return { total5yr, avg, cagr };
  }, [activeProjection, baseRevenue]);

  const updateAssumption = useCallback((key: keyof Assumptions, val: number) => {
    setScenario('custom');
    setCustomAssumptions(prev => ({ ...prev, [key]: val }));
  }, []);

  const loadPreset = (key: 'base' | 'optimistic' | 'conservative') => {
    setCustomAssumptions({ ...content.assumptions[key] });
    setScenario(key);
  };

  const SCENARIOS: { key: ScenarioKey; label: string; color: string }[] = [
    { key: 'conservative', label: 'Conservative', color: '#9B9891' },
    { key: 'base', label: 'Base', color: '#0D0D0D' },
    { key: 'optimistic', label: 'Optimistic', color: '#22863a' },
    { key: 'custom', label: 'Custom', color: '#BA3C60' },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#0D0D0D] m-0">{content.business_name} — Financial Model</h2>
          <p className="text-xs text-[#9B9891] m-0 mt-1">Adjust assumptions below to see projections update in real time</p>
        </div>
        <div className="flex gap-1 bg-[#F5F5F5] rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('projections')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md border-0 cursor-pointer transition-colors ${
              viewMode === 'projections' ? 'bg-white text-[#0D0D0D] shadow-sm' : 'bg-transparent text-[#6E6A63]'
            }`}
          >
            Projections
          </button>
          <button
            onClick={() => setViewMode('sensitivity')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md border-0 cursor-pointer transition-colors ${
              viewMode === 'sensitivity' ? 'bg-white text-[#0D0D0D] shadow-sm' : 'bg-transparent text-[#6E6A63]'
            }`}
          >
            Sensitivity
          </button>
        </div>
      </div>

      {/* Scenario tabs */}
      <div className="flex gap-1.5">
        {SCENARIOS.map(s => (
          <button
            key={s.key}
            onClick={() => s.key === 'custom' ? setScenario('custom') : loadPreset(s.key as any)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full border cursor-pointer transition-colors ${
              scenario === s.key
                ? 'text-white'
                : 'bg-transparent text-[#6E6A63] hover:bg-[#F5F5F5]'
            }`}
            style={{
              borderColor: scenario === s.key ? s.color : 'rgba(0,0,0,0.08)',
              backgroundColor: scenario === s.key ? s.color : undefined,
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Save / Load scenarios */}
      <div className="flex items-center gap-2 flex-wrap">
        {savedScenarios.map((s, i) => (
          <div key={i} className="flex items-center gap-1 bg-[#F5F5F5] rounded-full pl-3 pr-1 py-1">
            <button
              onClick={() => loadSavedScenario(s)}
              className="text-[10px] font-semibold text-[#3D3B37] bg-transparent border-0 cursor-pointer hover:text-[#BA3C60] p-0"
            >
              {s.name}
            </button>
            <button
              onClick={() => deleteSavedScenario(i)}
              className="w-4 h-4 rounded-full hover:bg-[rgba(0,0,0,0.08)] flex items-center justify-center bg-transparent border-0 cursor-pointer text-[#A9A49C] hover:text-[#6E6A63]"
            >
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>
        ))}
        {showSaveInput ? (
          <div className="flex items-center gap-1">
            <input
              value={saveName}
              onChange={e => setSaveName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveCurrentScenario()}
              placeholder="Scenario name"
              autoFocus
              className="text-[11px] px-2 py-1 rounded border border-[rgba(0,0,0,0.08)] outline-none w-28"
              style={{ fontFamily: 'inherit' }}
            />
            <button onClick={saveCurrentScenario} className="text-[10px] font-semibold text-[#BA3C60] bg-transparent border-0 cursor-pointer">Save</button>
            <button onClick={() => { setShowSaveInput(false); setSaveName(''); }} className="text-[10px] text-[#A9A49C] bg-transparent border-0 cursor-pointer">Cancel</button>
          </div>
        ) : (
          <button
            onClick={() => setShowSaveInput(true)}
            className="text-[10px] font-medium text-[#6E6A63] bg-transparent border-0 cursor-pointer hover:text-[#BA3C60] flex items-center gap-1"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
            Save scenario
          </button>
        )}
      </div>

      {/* Assumption sliders */}
      <div className="bg-[#FAFAF8] rounded-xl p-4 space-y-3" style={{ border: '1px solid #EBE7DF' }}>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#A9A49C] m-0">Assumptions</p>
        <AssumptionSlider
          label="Revenue Growth"
          value={activeAssumptions.revenue_growth_rate}
          min={-10}
          max={30}
          step={0.5}
          unit="%"
          onChange={v => updateAssumption('revenue_growth_rate', v)}
        />
        <AssumptionSlider
          label="Gross Margin"
          value={activeAssumptions.gross_margin}
          min={10}
          max={90}
          step={1}
          unit="%"
          onChange={v => updateAssumption('gross_margin', v)}
        />
        <AssumptionSlider
          label="OpEx Growth"
          value={activeAssumptions.opex_growth_rate}
          min={0}
          max={20}
          step={0.5}
          unit="%"
          onChange={v => updateAssumption('opex_growth_rate', v)}
        />
        <AssumptionSlider
          label="CapEx % Revenue"
          value={activeAssumptions.capex_pct_revenue}
          min={0}
          max={15}
          step={0.5}
          unit="%"
          onChange={v => updateAssumption('capex_pct_revenue', v)}
        />
        <AssumptionSlider
          label="Tax Rate"
          value={activeAssumptions.tax_rate}
          min={0}
          max={40}
          step={1}
          unit="%"
          onChange={v => updateAssumption('tax_rate', v)}
        />
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-lg p-3 text-center" style={{ border: '1px solid #EBE7DF' }}>
          <p className="text-[10px] font-semibold uppercase text-[#A9A49C] m-0 mb-1">5-Year Cash Flow</p>
          <p className={`text-base font-bold m-0 ${metrics.total5yr < 0 ? 'text-red-600' : 'text-[#0D0D0D]'}`}>
            {fmtCents(metrics.total5yr)}
          </p>
        </div>
        <div className="bg-white rounded-lg p-3 text-center" style={{ border: '1px solid #EBE7DF' }}>
          <p className="text-[10px] font-semibold uppercase text-[#A9A49C] m-0 mb-1">Avg Annual</p>
          <p className={`text-base font-bold m-0 ${metrics.avg < 0 ? 'text-red-600' : 'text-[#0D0D0D]'}`}>
            {fmtCents(metrics.avg)}
          </p>
        </div>
        <div className="bg-white rounded-lg p-3 text-center" style={{ border: '1px solid #EBE7DF' }}>
          <p className="text-[10px] font-semibold uppercase text-[#A9A49C] m-0 mb-1">Revenue CAGR</p>
          <p className="text-base font-bold text-[#0D0D0D] m-0">{fmtPct(metrics.cagr)}</p>
        </div>
      </div>

      {/* Projection table or sensitivity matrix */}
      {viewMode === 'projections' ? (
        <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
          <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr className="bg-[#F5F5F5]">
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-[#6E6A63] uppercase tracking-wide" style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                  Metric
                </th>
                {[1, 2, 3, 4, 5].map(y => (
                  <th key={y} className="px-3 py-2 text-right text-[10px] font-semibold text-[#3D3B37] uppercase tracking-wide" style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                    Year {y}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Revenue', key: 'revenue', fmt: fmtCents },
                { label: 'COGS', key: 'cogs', fmt: fmtCents },
                { label: 'Gross Profit', key: 'gross_profit', fmt: fmtCents, bold: true },
                { label: 'Gross Margin', key: 'gross_margin_pct', fmt: fmtPct },
                { label: 'Operating Expenses', key: 'operating_expenses', fmt: fmtCents },
                { label: 'EBITDA', key: 'ebitda', fmt: fmtCents, bold: true },
                { label: 'EBITDA Margin', key: 'ebitda_margin_pct', fmt: fmtPct },
                { label: 'CapEx', key: 'capex', fmt: fmtCents },
                { label: 'Free Cash Flow', key: 'free_cash_flow', fmt: fmtCents, bold: true },
                { label: 'Debt Service', key: 'debt_service', fmt: fmtCents },
                { label: 'Net Cash Flow', key: 'net_cash_flow', fmt: fmtCents, bold: true },
                { label: 'Cumulative CF', key: 'cumulative_cash_flow', fmt: fmtCents },
              ].map(row => (
                <tr key={row.key} className={row.bold ? 'bg-[#FAFAF8]' : ''}>
                  <td
                    className={`px-3 py-1.5 text-[#3D3B37] ${row.bold ? 'font-semibold' : ''}`}
                    style={{ borderBottom: '1px solid #EBE7DF' }}
                  >
                    {row.label}
                  </td>
                  {activeProjection.map((yr, i) => {
                    const val = (yr as any)[row.key];
                    return (
                      <td
                        key={i}
                        className={`px-3 py-1.5 text-right tabular-nums ${
                          row.bold ? 'font-semibold' : ''
                        } ${typeof val === 'number' && val < 0 ? 'text-red-600' : 'text-[#0D0D0D]'}`}
                        style={{ borderBottom: '1px solid #EBE7DF' }}
                      >
                        {row.fmt(val)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <SensitivityMatrix
          baseRevenue={baseRevenue}
          baseCogs={baseCogs}
          baseOpex={baseOpex}
          debtService={debtService}
          baseAssumptions={activeAssumptions}
        />
      )}

      {/* Breakeven info */}
      <div className="text-xs text-[#9B9891] pt-2" style={{ borderTop: '1px solid #EBE7DF' }}>
        Monthly breakeven: {fmtCents(content.breakeven_analysis.monthly_breakeven_revenue)} ·
        Currently {content.breakeven_analysis.current_above_breakeven_pct}% above breakeven
      </div>
    </div>
  );
}
