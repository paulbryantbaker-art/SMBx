/**
 * Interactive Chart Components — react-chartjs-2 wrappers with smbx.ai brand.
 * These render in the browser (not server-side). Tooltips, hover, responsive.
 */
import { Bar, Doughnut, Radar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement,
  RadialLinearScale, Tooltip, Legend, Filler,
  type ChartOptions,
} from 'chart.js';
import { centsToDisplay, pctDisplay, multDisplay } from '../../lib/calculations/core';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement,
  RadialLinearScale, Tooltip, Legend, Filler,
);

// Brand colors
const TERRA = '#D44A78';
const TERRA_LIGHT = 'rgba(186, 60, 96, 0.15)';
const TEXT = '#1A1A18';
const MUTED = '#6E6A63';
const CREAM = '#FAF8F4';
const BORDER = '#DDD9D1';
const GREEN = '#34A853';
const YELLOW = '#FBBC04';
const RED = '#EA4335';

// ─── Valuation Range Chart ──────────────────────────────────────────

export function ValuationRangeChart({ low, mid, high }: { low: number; mid: number; high: number }) {
  return (
    <div style={{ height: 180 }}>
      <Bar
        data={{
          labels: ['Low', 'Most Likely', 'High'],
          datasets: [{
            data: [low / 100, mid / 100, high / 100],
            backgroundColor: [CREAM, TERRA, TERRA_LIGHT],
            borderColor: [BORDER, TERRA, TERRA],
            borderWidth: 1,
            borderRadius: 6,
            barPercentage: 0.55,
          }],
        }}
        options={{
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: { label: (ctx) => centsToDisplay(ctx.raw as number * 100) },
            },
          },
          scales: {
            x: {
              beginAtZero: true,
              grid: { color: 'rgba(0,0,0,0.04)' },
              ticks: { callback: (v) => centsToDisplay(Number(v) * 100), color: MUTED, font: { size: 11 } },
            },
            y: { grid: { display: false }, ticks: { color: TEXT, font: { size: 12, weight: 'bold' } } },
          },
        }}
      />
    </div>
  );
}

// ─── DSCR Gauge ─────────────────────────────────────────────────────

export function DSCRGauge({ dscr, threshold = 1.25 }: { dscr: number; threshold?: number }) {
  const color = dscr >= 1.50 ? GREEN : dscr >= 1.25 ? YELLOW : RED;
  const pct = Math.min(dscr / 2.5, 1); // normalize to 0-1 range (max 2.5x)

  return (
    <div className="flex items-center gap-4">
      <div style={{ width: 100, height: 100 }}>
        <Doughnut
          data={{
            datasets: [{
              data: [pct * 100, (1 - pct) * 100],
              backgroundColor: [color, '#EBEBEB'],
              borderWidth: 0,
              circumference: 270,
              rotation: 225,
            }],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: true,
            cutout: '75%',
            plugins: { legend: { display: false }, tooltip: { enabled: false } },
          }}
        />
      </div>
      <div>
        <p className="text-2xl font-bold m-0" style={{ color, fontFamily: 'Sora, sans-serif' }}>
          {dscr.toFixed(2)}x
        </p>
        <p className="text-xs m-0" style={{ color: MUTED }}>
          {dscr >= threshold ? 'Passes' : 'Below'} {threshold.toFixed(2)}x threshold
        </p>
      </div>
    </div>
  );
}

// ─── Waterfall Chart (SDE/FCF breakdown) ────────────────────────────

export function WaterfallChart({ items }: { items: { label: string; amount: number }[] }) {
  let cumulative = 0;
  const labels = items.map(i => i.label);
  const positives: (number | null)[] = [];
  const negatives: (number | null)[] = [];
  const bases: number[] = [];

  for (const item of items) {
    if (item.amount >= 0) {
      bases.push(cumulative / 100);
      positives.push(item.amount / 100);
      negatives.push(null);
      cumulative += item.amount;
    } else {
      cumulative += item.amount;
      bases.push(cumulative / 100);
      positives.push(null);
      negatives.push(Math.abs(item.amount) / 100);
    }
  }

  return (
    <div style={{ height: 220 }}>
      <Bar
        data={{
          labels,
          datasets: [
            { label: 'Base', data: bases, backgroundColor: 'transparent', borderWidth: 0, barPercentage: 0.5 },
            { label: 'Add', data: positives, backgroundColor: TERRA, borderRadius: 4, barPercentage: 0.5 },
            { label: 'Less', data: negatives, backgroundColor: '#E8E4DC', borderRadius: 4, barPercentage: 0.5 },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (ctx) => ctx.raw != null ? centsToDisplay(Number(ctx.raw) * 100) : '' } },
          },
          scales: {
            x: { stacked: true, grid: { display: false }, ticks: { color: TEXT, font: { size: 10 } } },
            y: { stacked: true, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { callback: (v) => centsToDisplay(Number(v) * 100), color: MUTED, font: { size: 10 } } },
          },
        }}
      />
    </div>
  );
}

// ─── Radar Chart (Deal Score / Factors) ─────────────────────────────

export function FactorRadar({ factors }: { factors: { name: string; score: number }[] }) {
  return (
    <div style={{ height: 280, maxWidth: 320, margin: '0 auto' }}>
      <Radar
        data={{
          labels: factors.map(f => f.name),
          datasets: [{
            data: factors.map(f => f.score),
            backgroundColor: TERRA_LIGHT,
            borderColor: TERRA,
            borderWidth: 2,
            pointBackgroundColor: TERRA,
            pointRadius: 4,
          }],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            r: {
              min: 0, max: 100, beginAtZero: true,
              angleLines: { color: 'rgba(0,0,0,0.06)' },
              grid: { color: 'rgba(0,0,0,0.06)' },
              pointLabels: { color: TEXT, font: { size: 11 } },
              ticks: { display: false, stepSize: 25 },
            },
          },
        }}
      />
    </div>
  );
}

// ─── Sensitivity Heatmap ────────────────────────────────────────────

export function SensitivityHeatmap({ matrix, var1Values, var2Values, var1Key, var2Key, metric = 'irr' }: {
  matrix: number[][];
  var1Values: number[];
  var2Values: number[];
  var1Key: string;
  var2Key: string;
  metric?: 'irr' | 'moic' | 'dscr';
}) {
  const format = metric === 'irr' ? pctDisplay : metric === 'moic' ? multDisplay : (v: number) => v.toFixed(2);
  const cellColor = (val: number) => {
    if (metric === 'irr') return val >= 0.20 ? GREEN : val >= 0.10 ? YELLOW : RED;
    if (metric === 'moic') return val >= 2.5 ? GREEN : val >= 1.5 ? YELLOW : RED;
    return val >= 1.50 ? GREEN : val >= 1.25 ? YELLOW : RED;
  };

  return (
    <div className="overflow-x-auto">
      <table className="text-xs" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={{ padding: '6px 8px', fontSize: 10, color: MUTED, textAlign: 'left' }}>{var1Key} \ {var2Key}</th>
            {var2Values.map(v => (
              <th key={v} style={{ padding: '6px 8px', fontSize: 10, color: MUTED, textAlign: 'center' }}>
                {metric === 'irr' || metric === 'dscr' ? multDisplay(v) : centsToDisplay(v)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => (
            <tr key={i}>
              <td style={{ padding: '6px 8px', fontWeight: 600, color: TEXT }}>
                {centsToDisplay(var1Values[i])}
              </td>
              {row.map((val, j) => (
                <td key={j} style={{
                  padding: '6px 8px', textAlign: 'center', fontWeight: 600,
                  color: 'white', backgroundColor: cellColor(val), borderRadius: 4,
                  fontSize: 11,
                }}>
                  {format(val)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Pro Forma Table ────────────────────────────────────────────────

export function ProFormaTable({ years }: { years: { year: number; revenue: number; ebitda: number; debtService: number; fcf: number; debtBalance: number }[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="text-xs w-full" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${TERRA}` }}>
            {['Year', 'Revenue', 'EBITDA', 'Debt Service', 'Free Cash Flow', 'Debt Balance'].map(h => (
              <th key={h} style={{ padding: '6px 8px', textAlign: h === 'Year' ? 'left' : 'right', fontSize: 10, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {years.map((y, i) => (
            <tr key={y.year} style={{ background: i % 2 === 0 ? 'transparent' : '#FAFAF8', borderBottom: '1px solid #EBEBEB' }}>
              <td style={{ padding: '6px 8px', fontWeight: 600 }}>Year {y.year}</td>
              <td style={{ padding: '6px 8px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{centsToDisplay(y.revenue)}</td>
              <td style={{ padding: '6px 8px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{centsToDisplay(y.ebitda)}</td>
              <td style={{ padding: '6px 8px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: RED }}>{centsToDisplay(y.debtService)}</td>
              <td style={{ padding: '6px 8px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: y.fcf >= 0 ? GREEN : RED }}>{centsToDisplay(y.fcf)}</td>
              <td style={{ padding: '6px 8px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{centsToDisplay(y.debtBalance)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── DSCR Timeline Chart ────────────────────────────────────────────

export function DSCRTimeline({ dscrByYear, threshold = 1.25 }: { dscrByYear: number[]; threshold?: number }) {
  return (
    <div style={{ height: 200 }}>
      <Line
        data={{
          labels: dscrByYear.map((_, i) => `Year ${i + 1}`),
          datasets: [
            {
              label: 'DSCR',
              data: dscrByYear,
              borderColor: TERRA,
              backgroundColor: TERRA_LIGHT,
              fill: true,
              tension: 0.3,
              pointRadius: 4,
              pointBackgroundColor: dscrByYear.map(d => d >= threshold ? GREEN : RED),
            },
            {
              label: `Threshold (${threshold}x)`,
              data: dscrByYear.map(() => threshold),
              borderColor: MUTED,
              borderDash: [6, 3],
              borderWidth: 1,
              pointRadius: 0,
              fill: false,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: true, position: 'bottom', labels: { color: MUTED, font: { size: 10 }, boxWidth: 12 } },
            tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${(ctx.raw as number).toFixed(2)}x` } },
          },
          scales: {
            y: { min: 0, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { callback: (v) => `${Number(v).toFixed(1)}x`, color: MUTED, font: { size: 10 } } },
            x: { grid: { display: false }, ticks: { color: TEXT, font: { size: 10 } } },
          },
        }}
      />
    </div>
  );
}

// ─── Sources & Uses Table ───────────────────────────────────────────

export function SourcesUsesTable({ sources, uses }: { sources: { label: string; amount: number }[]; uses: { label: string; amount: number }[] }) {
  const totalSources = sources.reduce((s, i) => s + i.amount, 0);
  const totalUses = uses.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <h4 className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: MUTED }}>Sources</h4>
        {sources.map(s => (
          <div key={s.label} className="flex justify-between text-xs py-1" style={{ borderBottom: '1px solid #EBEBEB' }}>
            <span>{s.label}</span>
            <span className="font-medium tabular-nums">{centsToDisplay(s.amount)}</span>
          </div>
        ))}
        <div className="flex justify-between text-xs py-1 font-bold" style={{ borderTop: `2px solid ${TERRA}` }}>
          <span>Total</span>
          <span className="tabular-nums">{centsToDisplay(totalSources)}</span>
        </div>
      </div>
      <div>
        <h4 className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: MUTED }}>Uses</h4>
        {uses.map(u => (
          <div key={u.label} className="flex justify-between text-xs py-1" style={{ borderBottom: '1px solid #EBEBEB' }}>
            <span>{u.label}</span>
            <span className="font-medium tabular-nums">{centsToDisplay(u.amount)}</span>
          </div>
        ))}
        <div className="flex justify-between text-xs py-1 font-bold" style={{ borderTop: `2px solid ${TERRA}` }}>
          <span>Total</span>
          <span className="tabular-nums">{centsToDisplay(totalUses)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── KPI Cards ──────────────────────────────────────────────────────

export function KPICard({ label, value, sublabel, color }: { label: string; value: string; sublabel?: string; color?: string }) {
  return (
    <div className="rounded-lg p-3 sm:p-3" style={{ background: CREAM, border: `1px solid ${BORDER}` }}>
      <p className="text-[10px] sm:text-[9px] font-bold uppercase tracking-wider m-0 mb-1" style={{ color: MUTED }}>{label}</p>
      <p className="text-lg sm:text-xl font-bold m-0 truncate" style={{ color: color || TEXT, fontFamily: 'Sora, sans-serif' }}>{value}</p>
      {sublabel && <p className="text-[10px] m-0 mt-0.5 truncate" style={{ color: MUTED }}>{sublabel}</p>}
    </div>
  );
}

// ─── Slider Input ───────────────────────────────────────────────────

export function ModelSlider({ label, value, onChange, min, max, step, format = 'number', suffix }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  format?: 'number' | 'currency' | 'percent' | 'multiple';
  suffix?: string;
}) {
  const displayValue = () => {
    if (format === 'currency') return centsToDisplay(value);
    if (format === 'percent') return pctDisplay(value);
    if (format === 'multiple') return multDisplay(value);
    return `${value.toLocaleString()}${suffix || ''}`;
  };

  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;

  return (
    <div className="mb-4 model-controls">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[11px] sm:text-[10px] font-medium" style={{ color: MUTED }}>{label}</label>
        <span className="text-sm sm:text-xs font-semibold tabular-nums" style={{ color: TEXT }}>{displayValue()}</span>
      </div>
      <div className="py-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="w-full cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${TERRA} 0%, ${TERRA} ${pct}%, #EBEBEB ${pct}%, #EBEBEB 100%)`,
          }}
        />
      </div>
    </div>
  );
}

// ─── Number Input ───────────────────────────────────────────────────

export function ModelInput({ label, value, onChange, prefix, suffix, min, max }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
}) {
  return (
    <div className="mb-4 model-controls">
      <label className="block text-[11px] sm:text-[10px] font-medium mb-1" style={{ color: MUTED }}>{label}</label>
      <div className="flex items-center rounded-lg border px-3 py-2 sm:py-1.5" style={{ borderColor: BORDER, background: 'white' }}>
        {prefix && <span className="text-sm sm:text-xs mr-1.5" style={{ color: MUTED }}>{prefix}</span>}
        <input
          type="number"
          inputMode="decimal"
          value={value / (prefix === '$' ? 100 : 1)}
          onChange={e => {
            const v = Number(e.target.value) * (prefix === '$' ? 100 : 1);
            onChange(min !== undefined ? Math.max(min, max !== undefined ? Math.min(max, v) : v) : v);
          }}
          className="flex-1 font-medium outline-none bg-transparent tabular-nums"
          style={{ color: TEXT, border: 'none', fontSize: 'inherit' }}
        />
        {suffix && <span className="text-sm sm:text-xs ml-1.5" style={{ color: MUTED }}>{suffix}</span>}
      </div>
    </div>
  );
}
