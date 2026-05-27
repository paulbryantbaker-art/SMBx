#!/usr/bin/env npx tsx
/**
 * V6 desktop smoke test.
 *
 * Catches the desktop glass/chrome regression where the app disabled shadows
 * and backdrop filters during canvas scroll, causing the shading to disappear
 * while scrolling and flicker back after the scroll settled.
 *
 * Usage:
 *   V6_DESKTOP_BASE_URL=http://localhost:5173 npm run test:v6-desktop-smoke
 *   V6_DESKTOP_SCREENSHOTS=1 npm run test:v6-desktop-smoke
 */

import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const BASE_URL = (process.env.V6_DESKTOP_BASE_URL || process.env.DEFINITIVE_APP_BASE_URL || 'http://localhost:5173').replace(/\/+$/, '');
const WRITE_SCREENSHOTS = process.env.V6_DESKTOP_SCREENSHOTS === '1';
const SCREENSHOT_DIR = path.resolve(process.cwd(), 'testing/v6-desktop-smoke/latest');
let passed = 0;
let failed = 0;

console.log('\nsmbX V6 desktop smoke');
console.log(`Target: ${BASE_URL}`);
if (WRITE_SCREENSHOTS) console.log(`Screenshots: ${SCREENSHOT_DIR}`);

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  isMobile: false,
  hasTouch: false,
});

try {
  if (WRITE_SCREENSHOTS) await mkdir(SCREENSHOT_DIR, { recursive: true });

  const page = await context.newPage();
  const runtimeErrors: string[] = [];
  page.on('pageerror', error => runtimeErrors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error' && !isExpectedLocalApiNoise(message.text())) {
      runtimeErrors.push(message.text());
    }
  });

  await page.goto(`${BASE_URL}/#mode=today&tab=today-root`, { waitUntil: 'domcontentloaded', timeout: 20_000 });
  await page.waitForSelector('.v6-root', { timeout: 10_000 });
  await page.waitForSelector('.v6-canvas-scroll', { timeout: 10_000 });
  await page.waitForTimeout(800);

  await test('desktop Today view renders with scrollable canvas', async () => {
    const state = await readDesktopState(page);
    assert(state.textLength > 700, 'desktop Today view has meaningful content');
    assert(state.canvasScrollable, `canvas is not scrollable: ${JSON.stringify(state.canvas)}`);
    assert(!state.horizontalOverflow, overflowMessage(state));
  });

  await test('desktop chrome keeps glass and shadows before scroll', async () => {
    const state = await readDesktopState(page);
    assertStableChrome(state, 'before scroll');
  });

  if (WRITE_SCREENSHOTS) {
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'before-scroll.png'), fullPage: false });
  }

  await page.evaluate(() => {
    const canvas = document.querySelector('.v6-canvas-scroll');
    canvas?.scrollTo({ top: 520, left: 0, behavior: 'auto' });
  });
  await page.waitForTimeout(40);

  await test('desktop chrome does not disappear during scroll', async () => {
    const state = await readDesktopState(page);
    assert(!state.rootScrollingClass, 'v6-is-scrolling class should not toggle desktop chrome styles');
    assert(!state.canvasScrollingClass, 'is-scrolling class should not toggle canvas descendants');
    assertStableChrome(state, 'during scroll');
  });

  if (WRITE_SCREENSHOTS) {
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'during-scroll.png'), fullPage: false });
  }

  await page.waitForTimeout(220);

  await test('desktop chrome remains stable after scroll settles', async () => {
    const state = await readDesktopState(page);
    assertStableChrome(state, 'after scroll');
    assert(!state.horizontalOverflow, overflowMessage(state));
  });

  if (WRITE_SCREENSHOTS) {
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'after-scroll.png'), fullPage: false });
  }

  await test('desktop runtime has no unexpected console/page errors', async () => {
    assert(runtimeErrors.length === 0, `unexpected runtime errors: ${runtimeErrors.slice(0, 5).join(' | ')}`);
  });
} finally {
  await context.close();
  await browser.close();
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (error: any) {
    failed++;
    console.log(`  ✗ ${name} - ${error.message}`);
  }
}

async function readDesktopState(page: any) {
  return page.evaluate(() => {
    const bodyText = document.body.innerText || '';
    const root = document.querySelector('.v6-root');
    const canvas = document.querySelector('.v6-canvas-scroll') as HTMLElement | null;
    const overflowing = Array.from(document.querySelectorAll('body *')).filter(element => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && (rect.right > window.innerWidth + 2 || rect.left < -2);
    }).slice(0, 8).map(element => {
      const rect = element.getBoundingClientRect();
      return {
        tag: element.tagName,
        className: String((element as HTMLElement).className || '').slice(0, 80),
        text: (element.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80),
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        width: Math.round(rect.width),
      };
    });

    const visibleGlassSurfaces = Array.from(document.querySelectorAll('body *')).map(element => {
      const rect = element.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return null;
      if (rect.bottom < 0 || rect.top > window.innerHeight) return null;
      const style = window.getComputedStyle(element);
      const backdropFilter = style.backdropFilter || (style as any).webkitBackdropFilter || 'none';
      const boxShadow = style.boxShadow;
      if (backdropFilter === 'none' || boxShadow === 'none') return null;
      return {
        tag: element.tagName,
        className: String((element as HTMLElement).className || '').slice(0, 80),
        text: (element.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60),
        backdropFilter,
        boxShadow: boxShadow.slice(0, 120),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        top: Math.round(rect.top),
      };
    }).filter(Boolean);

    return {
      bodyText,
      textLength: bodyText.length,
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 2,
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      rootScrollingClass: root?.classList.contains('v6-is-scrolling') ?? false,
      canvasScrollingClass: canvas?.classList.contains('is-scrolling') ?? false,
      canvasScrollable: !!canvas && canvas.scrollHeight > canvas.clientHeight + 20,
      canvas: canvas ? {
        scrollTop: Math.round(canvas.scrollTop),
        scrollHeight: canvas.scrollHeight,
        clientHeight: canvas.clientHeight,
      } : null,
      visibleGlassSurfaces,
      overflowing,
    };
  });
}

function assertStableChrome(state: any, phase: string) {
  assert(state.visibleGlassSurfaces.length > 0, `${phase}: no visible glass/shadow surfaces found`);
}

function isExpectedLocalApiNoise(message: string) {
  return /Failed to load resource: the server responded with a status of (401|429)/.test(message);
}

function overflowMessage(state: any) {
  return `horizontal overflow: scrollWidth=${state.scrollWidth}, viewport=${state.innerWidth}, examples=${JSON.stringify(state.overflowing)}`;
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
