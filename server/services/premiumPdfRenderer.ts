/**
 * Premium PDF Renderer — HTML→PDF via Puppeteer with Chart.js charts.
 *
 * Uses a singleton headless Chromium browser. Templates are HTML with
 * Tailwind CDN + Google Fonts. Charts pre-rendered as PNG base64 by chartService.
 */
import puppeteer, { type Browser } from 'puppeteer-core';
import {
  generateValuationRangeChart,
  generateMultipleComparisonChart,
  generateDealScoreRadar,
  generateEarningsBreakdownChart,
} from './chartService.js';
import { valueLensTemplate } from '../templates/pdf/valueLens.js';

// ─── Browser Singleton ──────────────────────────────────────────────

let browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (browser && browser.connected) return browser;

  const execPath = process.env.PUPPETEER_EXECUTABLE_PATH
    || '/usr/bin/chromium-browser';

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
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--single-process',
    ],
  });

  return browser;
}

// ─── Template Registry ──────────────────────────────────────────────

const TEMPLATES: Record<string, (data: any, charts: Record<string, string>) => string> = {
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

// ─── Chart Pre-rendering ────────────────────────────────────────────

async function generateChartsForTemplate(
  templateKey: string,
  data: Record<string, any>,
): Promise<Record<string, string>> {
  const charts: Record<string, string> = {};

  if (templateKey === 'valueLens') {
    const fd = data.financialData || data;
    const earnings = fd.sde || fd.ebitda || 0;
    const league = fd.league || 'L1';

    // League multiple ranges
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

      const valChart = await generateValuationRangeChart(low, mid, high);
      charts.valuationRange = valChart.base64;

      const multChart = await generateMultipleComparisonChart(midMult, mult.min, mult.max, mult.metric);
      charts.multipleComparison = multChart.base64;

      if (fd.revenue) {
        const earningsChart = await generateEarningsBreakdownChart(
          fd.revenue, fd.sde || null, fd.ebitda || null, fd.owner_compensation || null,
        );
        charts.earningsBreakdown = earningsChart.base64;
      }
    }

    // Deal score radar if factor data exists
    if (fd.seven_factor_scores || data.seven_factor_scores) {
      const scores = fd.seven_factor_scores || data.seven_factor_scores;
      const factors = Object.entries(scores).map(([name, score]) => ({
        name: name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        score: Number(score),
      }));
      if (factors.length >= 3) {
        const radarChart = await generateDealScoreRadar(factors);
        charts.dealScoreRadar = radarChart.base64;
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

  // Generate charts
  const charts = await generateChartsForTemplate(templateKey, options.data);

  // Build HTML
  const html = templateFn(
    { ...options.data, title: options.title, watermark: options.watermark, dealName: options.dealName },
    charts,
  );

  // Render to PDF via Puppeteer
  const b = await getBrowser();
  const page = await b.newPage();

  try {
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 15000 });

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
