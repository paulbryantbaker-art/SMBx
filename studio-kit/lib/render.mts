/**
 * Minimal HTML→PDF/PNG render surface for the studio kit.
 *
 * puppeteer-core drives a Chrome/Chromium already installed on the machine —
 * nothing is downloaded at install time. On macOS it auto-finds Google Chrome
 * at the standard path; on Linux/Windows it probes the usual locations. If it
 * can't find one, set PUPPETEER_EXECUTABLE_PATH to a Chrome/Chromium binary.
 */
import puppeteer, { type Browser } from 'puppeteer-core';
import { existsSync } from 'node:fs';

let browser: Browser | null = null;

function chromePath(): string {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) return process.env.PUPPETEER_EXECUTABLE_PATH;
  const candidates = [
    // macOS
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    // Linux
    '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium', '/usr/bin/chromium-browser',
    // Windows
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ];
  const hit = candidates.find(p => existsSync(p));
  if (hit) return hit;
  throw new Error(
    'No Chrome/Chromium found. Install Google Chrome, or set PUPPETEER_EXECUTABLE_PATH ' +
    'to a Chrome/Chromium binary and re-run.'
  );
}

export async function newRenderPage() {
  if (!browser) {
    browser = await puppeteer.launch({
      executablePath: chromePath(),
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }
  return browser.newPage();
}

export async function closeBrowser() {
  if (browser) { await browser.close().catch(() => {}); browser = null; }
}
