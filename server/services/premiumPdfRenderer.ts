/**
 * Premium PDF Renderer — HTML→PDF via Puppeteer with Chart.js.
 *
 * Charts render inside the Puppeteer page using Chart.js CDN (no native canvas dep).
 * Singleton headless Chromium browser.
 */
import puppeteer, { type Browser } from 'puppeteer-core';
import {
  valuationRangeChartConfig,
  multipleComparisonChartConfig,
  earningsBreakdownChartConfig,
  chartToHtml,
} from './chartService.js';
import { valueLensTemplate } from '../templates/pdf/valueLens.js';

// ─── Browser Singleton ──────────────────────────────────────────────

let browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (browser && browser.connected) return browser;

  const execPath = process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser';

  // In dev on macOS, try common Chrome paths
  const devPaths = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
  ];

  let finalPath = execPath;
  if (process.env.NODE_ENV !== 'production') {
    const fs = await import('fs');
    for (const p of devPaths) {
      if (fs.existsSync(p)) { finalPath = p; break; }
    }
  }

  browser = await puppeteer.launch({
    executablePath: finalPath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--single-process'],
  });

  return browser;
}

// ─── Template Registry ──────────────────────────────────────────────

const TEMPLATES: Record<string, (data: any, chartHtmlBlocks: Record<string, string>) => string> = {
  valueLens: valueLensTemplate,
};

const PREMIUM_SLUGS: Record<string, string> = {
  valuelens: 'valueLens',
  value_lens: 'valueLens',
};

export function isPremiumTemplate(slug: string): boolean {
  return slug in PREMIUM_SLUGS;
}

export function getPremiumTemplateKey(slug: string): string | undefined {
  return PREMIUM_SLUGS[slug];
}

// ─── Chart Generation ───────────────────────────────────────────────

function generateChartHtml(templateKey: string, data: Record<string, any>): Record<string, string> {
  const charts: Record<string, string> = {};

  if (templateKey === 'valueLens') {
    const fd = data.financialData || data;
    const earnings = fd.sde || fd.ebitda || 0;
    const league = fd.league || 'L1';

    const LEAGUE_MULTIPLES: Record<string, { min: number; max: number; metric: string }> = {
      L1: { min: 2.0, max: 3.5, metric: 'SDE' },
      L2: { min: 3.0, max: 5.0, metric: 'SDE' },
      L3: { min: 4.0, max: 6.0, metric: 'EBITDA' },
      L4: { min: 6.0, max: 8.0, metric: 'EBITDA' },
      L5: { min: 8.0, max: 12.0, metric: 'EBITDA' },
      L6: { min: 10.0, max: 15.0, metric: 'EBITDA' },
    };

    const mult = LEAGUE_MULTIPLES[league] || LEAGUE_MULTIPLES.L1;
    const midMult = (mult.min + mult.max) / 2;

    if (earnings > 0) {
      const low = Math.round(earnings * mult.min);
      const mid = Math.round(earnings * midMult);
      const high = Math.round(earnings * mult.max);

      charts.valuationRange = chartToHtml(valuationRangeChartConfig(low, mid, high), 'chart-valuation');
      charts.multipleComparison = chartToHtml(multipleComparisonChartConfig(midMult, mult.min, mult.max, mult.metric), 'chart-multiple');

      if (fd.revenue) {
        charts.earningsBreakdown = chartToHtml(
          earningsBreakdownChartConfig(fd.revenue, fd.sde || null, fd.ebitda || null, fd.owner_compensation || null),
          'chart-earnings',
        );
      }
    }
  }

  return charts;
}

// ─── Public API ─────────────────────────────────────────────────────

export interface PremiumPdfOptions {
  template: string;
  data: Record<string, any>;
  title: string;
  watermark?: string;
  dealName?: string;
}

export async function renderPremiumPdf(options: PremiumPdfOptions): Promise<Buffer> {
  const templateKey = PREMIUM_SLUGS[options.template] || options.template;
  const templateFn = TEMPLATES[templateKey];

  if (!templateFn) {
    throw new Error(`No premium template found for: ${options.template}`);
  }

  // Generate chart HTML blocks
  const charts = generateChartHtml(templateKey, options.data);

  // Build full HTML
  const html = templateFn(
    { ...options.data, title: options.title, watermark: options.watermark, dealName: options.dealName },
    charts,
  );

  // Render to PDF via Puppeteer
  const b = await getBrowser();
  const page = await b.newPage();

  try {
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 15000 });

    // Wait for Chart.js to render
    await page.waitForFunction(() => {
      const canvases = document.querySelectorAll('canvas');
      return canvases.length === 0 || Array.from(canvases).every(c => c.getContext('2d') !== null);
    }, { timeout: 5000 }).catch(() => {});

    const pdf = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: { top: '0.5in', bottom: '0.5in', left: '0.6in', right: '0.6in' },
    });

    return Buffer.from(pdf);
  } finally {
    await page.close();
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  if (browser) { await browser.close(); browser = null; }
});
