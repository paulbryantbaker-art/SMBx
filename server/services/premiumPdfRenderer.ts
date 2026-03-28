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
    // Set viewport to Letter width for consistent rendering
    await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 2 });

    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 20000 });

    // Wait for Google Fonts to load
    await page.evaluateHandle('document.fonts.ready');

    // Wait for Chart.js to fully render all canvases
    await page.waitForFunction(() => {
      const canvases = document.querySelectorAll('canvas');
      if (canvases.length === 0) return true;
      // Check each canvas has been drawn to (non-empty)
      return Array.from(canvases).every(c => {
        const ctx = c.getContext('2d');
        if (!ctx) return false;
        // A rendered chart will have non-transparent pixels
        try {
          const pixel = ctx.getImageData(10, 10, 1, 1).data;
          return pixel[3] > 0; // alpha > 0 means something was drawn
        } catch { return true; } // cross-origin canvas, assume rendered
      });
    }, { timeout: 8000 }).catch(() => {
      console.warn('[premiumPdf] Chart render timeout — proceeding without full chart verification');
    });

    // Convert all Chart.js canvases to static <img> elements
    // This prevents PDF rendering issues with canvas elements
    await page.evaluate(() => {
      document.querySelectorAll('canvas').forEach(canvas => {
        try {
          const img = document.createElement('img');
          img.src = canvas.toDataURL('image/png', 1.0);
          img.style.width = canvas.style.width || '100%';
          img.style.height = canvas.style.height || 'auto';
          img.style.maxWidth = '100%';
          img.style.display = 'block';
          canvas.parentNode?.replaceChild(img, canvas);
        } catch { /* ignore cross-origin canvas errors */ }
      });
    });

    // Small delay for final paint
    await new Promise(r => setTimeout(r, 300));

    const pdf = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: { top: '0.5in', bottom: '0.5in', left: '0.6in', right: '0.6in' },
      displayHeaderFooter: false,
      preferCSSPageSize: false,
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
