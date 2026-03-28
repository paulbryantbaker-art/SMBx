/**
 * Chart Service — Generates branded Chart.js charts as PNG buffers.
 *
 * Uses chartjs-node-canvas for server-side rendering (no browser needed).
 * All charts use smbx.ai brand colors from smbxBrand.ts.
 */
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { COLORS } from '../templates/smbxBrand.js';

// ─── Chart Renderer (singleton) ─────────────────────────────────────

const WIDTH = 600;
const HEIGHT = 280;

// Each chart creates its own renderer at the needed size

export interface ChartOutput {
  png: Buffer;
  width: number;
  height: number;
  base64: string;
}

function toOutput(png: Buffer, w: number, h: number): ChartOutput {
  return { png, width: w, height: h, base64: `data:image/png;base64,${png.toString('base64')}` };
}

// ─── Formatting helpers ─────────────────────────────────────────────

function fmtDollars(cents: number): string {
  const d = cents / 100;
  if (d >= 1_000_000) return `$${(d / 1_000_000).toFixed(1)}M`;
  if (d >= 1_000) return `$${Math.round(d / 1_000)}K`;
  return `$${d.toLocaleString()}`;
}

// ─── Chart 1: Valuation Range Bar ───────────────────────────────────

export async function generateValuationRangeChart(
  lowCents: number,
  midCents: number,
  highCents: number,
): Promise<ChartOutput> {
  const w = 560;
  const h = 200;
  const r = new ChartJSNodeCanvas({ width: w, height: h, backgroundColour: 'transparent' });

  const png = await r.renderToBuffer({
    type: 'bar',
    data: {
      labels: ['Low', 'Mid (Most Likely)', 'High'],
      datasets: [{
        data: [lowCents / 100, midCents / 100, highCents / 100],
        backgroundColor: [
          COLORS.tableHeader,
          COLORS.terra,
          `${COLORS.terra}44`,
        ],
        borderColor: [
          COLORS.border,
          COLORS.terra,
          COLORS.terra,
        ],
        borderWidth: 1,
        borderRadius: 4,
        barPercentage: 0.6,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: { color: 'rgba(0,0,0,0.04)' },
          ticks: {
            callback: (v) => fmtDollars(Number(v) * 100),
            color: COLORS.textMuted,
            font: { size: 11 },
          },
        },
        y: {
          grid: { display: false },
          ticks: {
            color: COLORS.text,
            font: { size: 12, weight: 'bold' },
          },
        },
      },
    },
  });

  return toOutput(png, w, h);
}

// ─── Chart 2: Multiple Comparison (Bullet / Range) ──────────────────

export async function generateMultipleComparisonChart(
  businessMultiple: number,
  leagueMin: number,
  leagueMax: number,
  metric: string,
): Promise<ChartOutput> {
  const w = 560;
  const h = 140;
  const r = new ChartJSNodeCanvas({ width: w, height: h, backgroundColour: 'transparent' });

  const png = await r.renderToBuffer({
    type: 'bar',
    data: {
      labels: [`${metric} Multiple`],
      datasets: [
        {
          label: 'League Range',
          data: [leagueMax],
          backgroundColor: `${COLORS.tableHeader}`,
          borderColor: COLORS.border,
          borderWidth: 1,
          borderRadius: 4,
          barPercentage: 0.5,
        },
        {
          label: 'This Business',
          data: [businessMultiple],
          backgroundColor: COLORS.terra,
          borderColor: COLORS.terraDark,
          borderWidth: 1,
          borderRadius: 4,
          barPercentage: 0.3,
        },
      ],
    },
    options: {
      indexAxis: 'y',
      responsive: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            color: COLORS.textMuted,
            font: { size: 10 },
            boxWidth: 12,
            padding: 16,
          },
        },
        tooltip: { enabled: false },
      },
      scales: {
        x: {
          min: 0,
          max: Math.ceil(leagueMax * 1.3),
          grid: { color: 'rgba(0,0,0,0.04)' },
          ticks: {
            callback: (v) => `${Number(v).toFixed(1)}x`,
            color: COLORS.textMuted,
            font: { size: 11 },
          },
        },
        y: {
          grid: { display: false },
          ticks: {
            color: COLORS.text,
            font: { size: 12, weight: 'bold' },
          },
        },
      },
    },
  });

  return toOutput(png, w, h);
}

// ─── Chart 3: Deal Score Radar ──────────────────────────────────────

export async function generateDealScoreRadar(
  factors: { name: string; score: number }[],
): Promise<ChartOutput> {
  const w = 400;
  const h = 400;
  const r = new ChartJSNodeCanvas({ width: w, height: h, backgroundColour: 'transparent' });

  const png = await r.renderToBuffer({
    type: 'radar',
    data: {
      labels: factors.map(f => f.name),
      datasets: [{
        data: factors.map(f => f.score),
        backgroundColor: `${COLORS.terra}20`,
        borderColor: COLORS.terra,
        borderWidth: 2,
        pointBackgroundColor: COLORS.terra,
        pointRadius: 4,
        pointHoverRadius: 5,
      }],
    },
    options: {
      responsive: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
      },
      scales: {
        r: {
          min: 0,
          max: 100,
          beginAtZero: true,
          angleLines: { color: 'rgba(0,0,0,0.06)' },
          grid: { color: 'rgba(0,0,0,0.06)' },
          pointLabels: {
            color: COLORS.text,
            font: { size: 11 },
          },
          ticks: {
            display: false,
            stepSize: 25,
          },
        },
      },
    },
  });

  return toOutput(png, w, h);
}

// ─── Chart 4: Earnings Breakdown ────────────────────────────────────

export async function generateEarningsBreakdownChart(
  revenueCents: number,
  sdeCents: number | null,
  ebitdaCents: number | null,
  ownerCompCents: number | null,
): Promise<ChartOutput> {
  const w = 560;
  const h = 220;
  const r = new ChartJSNodeCanvas({ width: w, height: h, backgroundColour: 'transparent' });

  const labels: string[] = [];
  const values: number[] = [];
  const colors: string[] = [];

  if (revenueCents) {
    labels.push('Revenue');
    values.push(revenueCents / 100);
    colors.push('#6E6A63');
  }
  if (ownerCompCents) {
    labels.push("Owner's Comp");
    values.push(ownerCompCents / 100);
    colors.push(COLORS.tableHeader);
  }
  if (sdeCents) {
    labels.push('SDE');
    values.push(sdeCents / 100);
    colors.push(COLORS.terra);
  }
  if (ebitdaCents) {
    labels.push('EBITDA');
    values.push(ebitdaCents / 100);
    colors.push(COLORS.terraDark);
  }

  const png = await r.renderToBuffer({
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderRadius: 4,
        barPercentage: 0.55,
      }],
    },
    options: {
      responsive: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: COLORS.text,
            font: { size: 11, weight: 'bold' },
          },
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(0,0,0,0.04)' },
          ticks: {
            callback: (v) => fmtDollars(Number(v) * 100),
            color: COLORS.textMuted,
            font: { size: 10 },
          },
        },
      },
    },
  });

  return toOutput(png, w, h);
}
