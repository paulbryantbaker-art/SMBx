#!/usr/bin/env npx tsx
/**
 * V6 mobile smoke test.
 *
 * Starts from the mobile Today view, taps the visible phone navigation, and
 * checks for the regressions that usually hurt the mobile app first:
 * blank screens, horizontal overflow, missing bottom nav, and runtime errors.
 *
 * Usage:
 *   V6_MOBILE_BASE_URL=http://localhost:5173 npm run test:v6-mobile-smoke
 *   V6_MOBILE_SCREENSHOTS=1 npm run test:v6-mobile-smoke
 */

import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const BASE_URL = (process.env.V6_MOBILE_BASE_URL || process.env.DEFINITIVE_APP_BASE_URL || 'http://localhost:5173').replace(/\/+$/, '');
const WRITE_SCREENSHOTS = process.env.V6_MOBILE_SCREENSHOTS === '1';
const SCREENSHOT_DIR = path.resolve(process.cwd(), 'testing/v6-mobile-smoke/latest');
const NAV_TARGETS = ['Today', 'Pipeline', 'Search', 'Files'] as const;

let passed = 0;
let failed = 0;

console.log('\nsmbX V6 mobile smoke');
console.log(`Target: ${BASE_URL}`);
if (WRITE_SCREENSHOTS) console.log(`Screenshots: ${SCREENSHOT_DIR}`);

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
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
  await page.waitForSelector('#root', { timeout: 10_000 });
  await page.waitForTimeout(800);

  await test('initial mobile Today view renders', async () => {
    const state = await readMobileState(page, 'Today');
    assert(state.textLength > 500, 'Today view has meaningful content');
    assert(!state.horizontalOverflow, overflowMessage(state));
    assert(state.bottomNavTargets.every(target => state.visibleBottomNav.includes(target)), `bottom nav missing expected targets: ${state.bottomNavTargets.filter(target => !state.visibleBottomNav.includes(target)).join(', ')}`);
  });

  for (const target of NAV_TARGETS) {
    await test(`mobile nav opens ${target}`, async () => {
      await tapBottomNav(page, target);
      await page.waitForTimeout(700);
      const state = await readMobileState(page, target);
      assert(state.textLength > 300, `${target} view has meaningful content`);
      assert(state.bodyText.includes(target), `${target} view includes its label`);
      assert(!state.horizontalOverflow, overflowMessage(state));
      if (WRITE_SCREENSHOTS) {
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${target.toLowerCase()}.png`), fullPage: false });
      }
    });
  }

  await test('mobile runtime has no unexpected console/page errors', async () => {
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

async function readMobileState(page: any, label: string) {
  return page.evaluate((expectedLabel: string) => {
    const bodyText = document.body.innerText || '';
    const buttons = Array.from(document.querySelectorAll('button')).map(button => {
      const rect = button.getBoundingClientRect();
      return {
        text: (button.textContent || button.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' '),
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      };
    }).filter(button => button.width > 0 && button.height > 0);
    const visibleBottomNav = buttons
      .filter(button => button.y > window.innerHeight - 120 && button.height >= 44)
      .map(button => button.text);
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

    return {
      expectedLabel,
      bodyText,
      textLength: bodyText.length,
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 2,
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      visibleBottomNav,
      bottomNavTargets: ['Today', 'Pipeline', 'Search', 'Files'],
      overflowing,
    };
  }, label);
}

async function tapBottomNav(page: any, target: string) {
  const candidate = await page.locator('button').evaluateAll((buttons: HTMLButtonElement[], label: string) => {
    return buttons
      .map((button, index) => {
        const rect = button.getBoundingClientRect();
        return {
          index,
          text: (button.textContent || button.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' '),
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        };
      })
      .filter(button => button.text === label && button.y > window.innerHeight - 140)
      .sort((a, b) => b.y - a.y)[0] || null;
  }, target);

  assert(candidate, `bottom nav button not found for ${target}`);
  await page.mouse.click(candidate.x + candidate.width / 2, candidate.y + candidate.height / 2);
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
