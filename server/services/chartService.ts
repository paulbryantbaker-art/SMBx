/**
 * Chart Service — Generates chart configurations for embedding in HTML templates.
 *
 * Charts render inside the Puppeteer page using Chart.js CDN (loaded in base.ts).
 * No native canvas dependency needed. Returns Chart.js config objects that get
 * serialized into the HTML template as inline <script> blocks.
 */
import { COLORS } from '../templates/smbxBrand.js';

// ─── Types ──────────────────────────────────────────────────────────

export interface ChartConfig {
  type: string;
  data: Record<string, any>;
  options: Record<string, any>;
  width?: number;
  height?: number;
}

// ─── Formatting helpers ─────────────────────────────────────────────

function fmtDollars(cents: number): string {
  const d = cents / 100;
  if (d >= 1_000_000) return `$${(d / 1_000_000).toFixed(1)}M`;
  if (d >= 1_000) return `$${Math.round(d / 1_000)}K`;
  return `$${d.toLocaleString()}`;
}

// ─── Chart Configs ──────────────────────────────────────────────────

export function valuationRangeChartConfig(lowCents: number, midCents: number, highCents: number): ChartConfig {
  return {
    type: 'bar',
    data: {
      labels: ['Low', 'Mid (Most Likely)', 'High'],
      datasets: [{
        data: [lowCents / 100, midCents / 100, highCents / 100],
        backgroundColor: [COLORS.tableHeader, COLORS.terra, `${COLORS.terra}44`],
        borderColor: [COLORS.border, COLORS.terra, COLORS.terra],
        borderWidth: 1,
        borderRadius: 4,
        barPercentage: 0.6,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: {
        x: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: COLORS.textMuted, font: { size: 11 } } },
        y: { grid: { display: false }, ticks: { color: COLORS.text, font: { size: 12, weight: 'bold' } } },
      },
    },
    height: 180,
  };
}

export function multipleComparisonChartConfig(businessMultiple: number, leagueMin: number, leagueMax: number, metric: string): ChartConfig {
  return {
    type: 'bar',
    data: {
      labels: [`${metric} Multiple`],
      datasets: [
        { label: 'League Range', data: [leagueMax], backgroundColor: COLORS.tableHeader, borderColor: COLORS.border, borderWidth: 1, borderRadius: 4, barPercentage: 0.5 },
        { label: 'This Business', data: [businessMultiple], backgroundColor: COLORS.terra, borderColor: COLORS.terraDark, borderWidth: 1, borderRadius: 4, barPercentage: 0.3 },
      ],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: 'bottom', labels: { color: COLORS.textMuted, font: { size: 10 }, boxWidth: 12, padding: 16 } },
        tooltip: { enabled: false },
      },
      scales: {
        x: { min: 0, max: Math.ceil(leagueMax * 1.3), grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: COLORS.textMuted, font: { size: 11 } } },
        y: { grid: { display: false }, ticks: { color: COLORS.text, font: { size: 12, weight: 'bold' } } },
      },
    },
    height: 120,
  };
}

export function earningsBreakdownChartConfig(revenueCents: number, sdeCents: number | null, ebitdaCents: number | null, ownerCompCents: number | null): ChartConfig {
  const labels: string[] = [];
  const values: number[] = [];
  const colors: string[] = [];

  if (revenueCents) { labels.push('Revenue'); values.push(revenueCents / 100); colors.push('#6E6A63'); }
  if (ownerCompCents) { labels.push("Owner's Comp"); values.push(ownerCompCents / 100); colors.push(COLORS.tableHeader); }
  if (sdeCents) { labels.push('SDE'); values.push(sdeCents / 100); colors.push(COLORS.terra); }
  if (ebitdaCents) { labels.push('EBITDA'); values.push(ebitdaCents / 100); colors.push(COLORS.terraDark); }

  return {
    type: 'bar',
    data: {
      labels,
      datasets: [{ data: values, backgroundColor: colors, borderRadius: 4, barPercentage: 0.55 }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: COLORS.text, font: { size: 11, weight: 'bold' } } },
        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: COLORS.textMuted, font: { size: 10 } } },
      },
    },
    height: 200,
  };
}

/**
 * Render a chart config as an HTML <canvas> + <script> block.
 * Chart.js is loaded via CDN in the HTML template's <head>.
 */
export function chartToHtml(config: ChartConfig, id: string): string {
  return `
    <div style="height: ${config.height || 200}px; position: relative;">
      <canvas id="${id}"></canvas>
    </div>
    <script>
      new Chart(document.getElementById('${id}'), ${JSON.stringify({ type: config.type, data: config.data, options: config.options })});
    </script>
  `;
}
